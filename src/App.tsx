import { Setter, Show, createSignal, lazy, Suspense, onMount } from "solid-js";
import { Scene } from "phaser";
import PhaserGame from"./game/PhaserGame";
import { Game } from "./game/scenes/Game";
import { dimensions } from "./utility/dimensions";
import Settings, { initSettings } from "./models/settings";
import { initMenu, LANDSCAPE_SCREENS, Menu, SCREENS } from "./utility/screens";
import Ascean, { createAscean } from "./models/ascean";
import { CharacterSheet, Compiler, asceanCompiler, initCharacterSheet } from "./utility/ascean";
import { usePhaserEvent } from "./utility/hooks";
import { EventBus } from "./game/EventBus";
import { deadEquipment, deleteAscean, getAscean, getAsceans, getEnemy, getInventory, getParty, getQuests, getReputation, getSettings, getStatistics, getTalents, populate, populateEnemy, scrub, updateInventory, updateParty, updateQuests, updateReputation, updateSettings, updateStatistics, updateTalents } from "./assets/db/db"; 
import { TIPS } from "./utility/tips";
import { Inventory, Reputation, initInventory, initReputation } from "./utility/player";
import { Puff } from "solid-spinner";
import type { IRefPhaserGame } from "./game/PhaserGame";
import Statistics, { initStatistics } from "./utility/statistics";
import LoadAscean from "./components/LoadAscean";
import { Tutorial } from "./game/scenes/Tutorial";
import Talents, { initTalents } from "./utility/talents";
import QuestManager, { getQuest, initQuests, Quest } from "./utility/quests";
import { v4 as uuidv4 } from "uuid";
import { lightning } from "./utility/lightning";
import { Button } from "./utility/buttons";
const AsceanBuilder = lazy(async () => await import("./components/AsceanBuilder"));
const AsceanView = lazy(async () => await import("./components/AsceanView"));
const MenuAscean = lazy(async () => await import("./components/MenuAscean"));
const Preview = lazy(async () => await import("./components/Preview"));
const GameToast = lazy(async () => await import("./ui/GameToast"));
export var click = new Audio("../assets/sounds/TV_Button_Press.wav");
export var creation = new Audio("../assets/sounds/freeze.wav");
export var load = new Audio("../assets/sounds/combat-round.mp3");

export type Toast = { header: string; body: string; delay: number; key?: string; extra?: string; arg: any };

export default function App() {
    const [alert, setAlert] = createSignal<Toast>({ header: "", body: "", delay: 0, key: "", arg: undefined });
    const [ascean, setAscean] = createSignal<Ascean>(undefined as unknown as Ascean);
    const [menu, setMenu] = createSignal<Menu>(initMenu);
    const [loading, setLoading] = createSignal<boolean>(false);
    const [newAscean, setNewAscean] = createSignal<CharacterSheet>(initCharacterSheet);
    const [inventory, setInventory] = createSignal<Inventory>(initInventory);
    const [quests, setQuests] = createSignal<QuestManager>(initQuests);
    const [reputation, setReputation] = createSignal<Reputation>(initReputation);
    const [statistics, setStatistics] = createSignal<Statistics>(initStatistics);
    const [talents, setTalents] = createSignal<Talents>(initTalents);
    const [scene, setScene] = createSignal<string>("");
    const [settings, setSettings] = createSignal<Settings>(initSettings);
    const [show, setShow] = createSignal<boolean>(false);
    const [startGame, setStartGame] = createSignal<boolean>(false);
    const dims = dimensions();
    var stopLightning: () => void;
    var phaserRef: IRefPhaserGame;
    var tips: string | number | NodeJS.Timeout | undefined =  undefined;
    onMount(() => fetchAsceans());
    const currentScene = (scene: Scene) => setScene(scene.scene.key);
    function fetchAsceans(): void {
        const fetch = async () => {
            try {
                const res = await getAsceans();
                if (!res.length) {
                    setMenu({ ...menu(), loading: false });
                    return;
                };
                const pop = await Promise.all(res.map(async (asc: Ascean) => await populate(asc)));
                const hyd = pop.map((asc: Ascean) => asceanCompiler(asc)).map((asc: Compiler) => { return { ...asc.ascean, weaponOne: asc.combatWeaponOne, weaponTwo: asc.combatWeaponTwo, weaponThree: asc.combatWeaponThree }});
                setMenu({ ...menu(), asceans: hyd, loading: false }); // choosingCharacter: true
                await deadEquipment();
            } catch (err: any) {
                console.warn("Error fetching Asceans:", err);
            };
        };
        fetch();
        stopLightning = lightning();
    };
    function menuOption(option: string): void {
        click.play();
        setMenu({ ...menu(), [option]: true });
        stopLightning();
    };
    async function createCharacter(character: CharacterSheet): Promise<void> {
        creation.play();
        const cre = await createAscean(character);
        const pop = await populate(cre);
        const comp = asceanCompiler(pop);
        const menuAscean = menu()?.asceans?.length > 0 ? [...menu()?.asceans, comp?.ascean] : [comp?.ascean];
        setAscean(comp?.ascean as Ascean);
        setMenu({ ...menu(), asceans: menuAscean as Ascean[], creatingCharacter: false, screen: SCREENS.CHARACTER.KEY });
        setNewAscean(initCharacterSheet);
    };
    async function deleteCharacter(id: string | undefined): Promise<void> {
        try {
            creation.play();
            const newAsceans = menu()?.asceans?.filter((asc: Ascean) => asc._id !== id);
            setMenu({ ...menu(), asceans: newAsceans, choosingCharacter: newAsceans.length > 0 });
            setAscean(undefined as unknown as Ascean);
            await deleteAscean(id as string);
        } catch (err) {
            console.warn("Error Deleting Ascean:", err);
        };
    };
    async function fetchAscean(id: string): Promise<void> {
        try {
            const asc = await getAscean(id);
            const inv = await getInventory(asc?._id as string);
            const pop = await populate(asc);
            const comp = asceanCompiler(pop);
            const full = { ...comp?.ascean }; // , inventory: inv
            const stats = await getStatistics(id);
            const tal = await getTalents(id);
            const quest = await getQuests(id);
            setAscean(full as Ascean);
            setInventory(inv);
            setStatistics(stats);
            setTalents(tal);
            setQuests(quest);
        } catch (err: any) {
            console.warn("Error fetching Ascean:", err);
        };
    };

    async function setLoadAscean(id: string) {
        load.play();
        const asc: Ascean = menu()?.asceans?.find((asc: Ascean) => asc._id === id) as Ascean;
        setAlert({ header: "Loading Game", body: `Preparing ${asc.name}. Good luck.`, delay: 3000, key: "", arg: undefined });
        setShow(true);
        const full = { ...asc }; // , inventory: inv
        setAscean(full);
        setLoading(true);
        await loadAscean(id);
    };
    async function loadAscean(id: string): Promise<void> {
        try {
            const inv = await getInventory(id); // This will start lagging a tiny bit when the player"s inventory is hueg
            const rep = await getReputation(id);
            const set = await getSettings(id);
            const stat = await getStatistics(id);
            const tal = await getTalents(id);
            const quest = await getQuests(id);
            const party = await getParty(id);
            let compiledParty = [];
            for (let i = 0; i < party.party.length; i++) {
                let member = party.party[i];
                const pop = populateEnemy(member);
                const compile = asceanCompiler(pop);
                compiledParty.push(compile);
            };
            if (tal.points.total !== ascean().level - 1) {
                let newTalent = JSON.parse(JSON.stringify(tal));
                newTalent = {
                    ...newTalent,
                    points: {
                        ...newTalent.points,
                        total: ascean().level - 1
                    }
                };
                setTalents(newTalent);
                await updateTal(newTalent);
            } else {
                setTalents(tal);
            };
            setInventory(inv);
            setReputation(rep);
            setSettings(set);
            setStatistics(stat);
            setQuests(quest);
            if (set.difficulty.tidbits === true) setTips(true);
            setMenu({ ...menu(), choosingCharacter: false, gameRunning: true, playModal: false });
            setStartGame(true);
            setLoading(false);
            phaserRef.game?.registry.set("party", compiledParty);
            phaserRef.game?.registry.set("reputation", reputation());
            phaserRef.game?.registry.set("settings", settings());
            phaserRef.game?.registry.set("talents", talents());
            EventBus.emit("preload-ascean", id);
        } catch (err: any) {
            console.warn("Error loading Ascean:", err);
        };
    };

    const loadingAscean = () => EventBus.emit("enter-game");
    const makeToast = (header: string, body: string, delay = 4000, key = "", extra = "", arg: any): void => {
        setShow(false);
        setAlert({ header, body, delay, key, extra, arg });
        setShow(true);
    };

    const setTips = (on: boolean): void => {
        if (on) {
            const interval: number = 1000 * 60 * 3; // 3 minutes
            tips = setInterval(() => {
                const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
                setAlert({ header: "Gameplay Tidbit", body: tip, delay: 12000, key: "Close", arg: undefined }); // 10000
                setShow(true);    
            }, interval); 
        } else {
            clearInterval(tips);
        };
    };

    function togglePause(pause: boolean): void {
        const scene = phaserRef.scene as Game;
        if (!scene) return;
        const running = scene.scene.isActive(scene.scene.key);
        if (pause || running) {
            scene.pause();
        } else {
            scene.resume();
        };
        EventBus.emit("toggle-pause", pause);
    };

    const quickAscean = (a: Ascean): Ascean => setAscean(a);
    
    async function saveAscean(vaEsai: any): Promise<void> {
        try {
            const save = await updateAscean(vaEsai);
            const pop = await populate(save);
            let hydrate = asceanCompiler(pop);
            const inv = await getInventory(hydrate?.ascean?._id as string);
            const full = { ...hydrate?.ascean }; // , inventory: inv
            hydrate = { ...hydrate, ascean: full as Ascean } as Compiler;
            setAscean(full as Ascean);
            setInventory(inv);
            EventBus.emit("set-player", hydrate);
        } catch (err: any) {
            console.warn("Error saving Ascean:", err);
        };
    };

    async function silentSave(vaEsai: Ascean): Promise<void> {
        try {
            await scrub(vaEsai);
        } catch (err: any) {
            console.warn("Error saving Ascean:", err);
        };
    };

    async function fetchInventory() {
        try {
            const inv = await getInventory(ascean()._id);
            setInventory(inv);
        } catch (err) { 
            console.warn(err, "Error Saving Inventory"); 
        };
    };

    async function saveInventory(save: Inventory) {
        try {
            setInventory(save);
            await updateInventory(save);
        } catch (err) { 
            console.warn(err, "Error Saving Inventory"); 
        };
    };

    async function insertSettings(insert: any) {
        try {
            const set = { ...settings(), ...insert };
            await updateSettings(set);
            setSettings(set);
        } catch (err: any) {
            console.warn("Error saving Settings:", err);
        };
    };

    async function saveSettings(set: Settings): Promise<void> {
        try {
            await updateSettings(set);
            setSettings(set);
        } catch (err: any) {
            console.warn("Error saving Settings:", err);
        };
    };

    async function saveThisSetting(data: any) {
        try {
            const update = { ...settings(), ...data };
            await saveSettings(update);
        } catch (err) {
            console.warn("Error Saving This Setting", err);
        };
    };

    async function updateAscean(vaEsai: Ascean): Promise<void> {
        try {
            const save = await scrub(vaEsai);
            const pop = await populate(save);
            let hydrate = asceanCompiler(pop);
            setAscean(hydrate?.ascean as Ascean);
            EventBus.emit("set-player", hydrate);
        } catch (err: any) {
            console.warn("Error updating Ascean:", err);
        };
    };

    async function addParty(party: { name: string; level: number; force?: boolean; }) {
        try {
            let asc = getEnemy(party.name, party.level);
            asc._id = uuidv4();
            let newParty = await getParty(ascean()._id);
            newParty.party.push(asc as any);
            await updateParty(newParty);
            let compiledParty = [];
            for (let i = 0; i < newParty.party.length; i++) {
                let member = newParty.party[i];
                const pop = populateEnemy(member);
                const compile = asceanCompiler(pop);
                compiledParty.push(compile);
            };
            phaserRef.game?.registry.set("party", compiledParty);
            if (party.force) {
                EventBus.emit("add-to-party", asc);
            };
        } catch(err) {
            console.warn(err, "Error Adding to Party");
        };
    };

    async function removeParty(party: Ascean) {
        try {
            console.log(party, "removeParty");
            let newParty = await getParty(ascean()._id);
            newParty.party = newParty.party.filter((e: Ascean) => {
                return e._id !== party._id;
            });
            await updateParty(newParty);
            let compiledParty = [];
            for (let i = 0; i < newParty.party.length; i++) {
                let member = newParty.party[i];
                const pop = populateEnemy(member);
                const compile = asceanCompiler(pop);
                compiledParty.push(compile);
            };
            phaserRef.game?.registry.set("party", compiledParty);
            EventBus.emit("remove-from-party", party);
        } catch(err) {
            console.warn(err, "Error Adding to Party");
        };
    };
    
    const addQuest = async (quest:{title: string, enemy: Ascean}): Promise<void> => {
        try {
            const { title, enemy } = quest;
            const newQuest = getQuest(title, enemy, ascean());
            const newQuestManager: QuestManager = { 
                ...quests(),
                quests: quests().quests.length > 0 
                    ? [...JSON.parse(JSON.stringify(quests().quests)), newQuest]
                    : [newQuest]
            };
            await updateQuests(newQuestManager);
            setQuests(newQuestManager);
        } catch (err) {
            console.warn(err, "Error Adding Quest");
        };
    };
    const completeQuest = async (quest: Quest) => {
        try {
            let newQuests = JSON.parse(JSON.stringify(quests().quests));
            newQuests = newQuests.filter((q: Quest) => q._id !== quest._id);
            const newQuestManager: QuestManager = {
                ...quests(),
                quests: newQuests
            };
            await updateQuests(newQuestManager);
            setQuests(newQuestManager);
        } catch (err) {
            console.warn(err, "Error Completing Quest");
        };
    };
    const removeQuest = async (quest: Quest) => {
        try {
            const newQuests = quests().quests.filter(q => q._id !== quest._id);
            const newQuestManager: QuestManager = {
                ...quests(),
                quests: newQuests
            };
            await updateQuests(newQuestManager);
            setQuests(newQuestManager);
        } catch (err) {
            console.warn(err, "Error Removing Quest");
        };
    };
    const updateQuest = async (q: QuestManager) => {
        try {
            await updateQuests(q);
            setQuests(q);
        } catch (err) {
            console.warn(err, "Error Updating Quests");
        };
    };
    const updateRep = async (rep: Reputation): Promise<void> => {
        try {
            await updateReputation(rep);
            setReputation(rep);
        } catch (err: any) {
            console.warn("Error updating Reputation:", err);
        };
    };
    const updateStat = async (stat: Statistics): Promise<void> => {
        try {
            await updateStatistics(stat);
            setStatistics(stat);
        } catch (err: any) {
            console.warn("Error updating Statistics:", err);
        };
    };
    const updateTal = async (talents: Talents): Promise<void> => {
        try {
            await updateTalents(talents);
            setTalents(talents);
            EventBus.emit("update-combat-talents");
        } catch (err) {
            console.warn("Error Updating Talents", err);
        };
    };

    async function viewAscean(id: string): Promise<void> {
        click.play();
        if (ascean()?._id === id) {
            setMenu({ ...menu(), choosingCharacter: false });
            return;
        };
        EventBus.emit("preload-ascean", id);
        const asc = menu()?.asceans?.find((asc: Ascean) => asc._id === id);
        setAscean(asc as Ascean);
        setMenu({ ...menu(), choosingCharacter: false });
        const inv = await getInventory(id);
        const rep = await getReputation(id);
        const set = await getSettings(id);
        const stat = await getStatistics(id);
        const tal = await getTalents(id);
        setInventory(inv);
        setReputation(rep);
        setSettings(set);
        setStatistics(stat);
        setTalents(tal);
    };

    function enterMenu(): void {
        if (menu()?.asceans?.length > 0) {
            setMenu({ ...menu(), choosingCharacter: true});
        } else {
            setMenu({ ...menu()});
        };
    };

    function switchScene(current: string, next: string): void {
        setShow(false);
        EventBus.emit("switch-scene", { current, next });
        EventBus.emit("insert-settings", { map: next });
    };

    function summonEnemy(val: number = 1) {
        EventBus.emit("summon-enemy", val);
        setShow(false);
    };

    function setScreen(screen: string) {
        setMenu({ ...menu(), screen });
    };

    const actions = {
        "Duel": (val: number) => summonEnemy(val),
        "Roster": () => { EventBus.emit("show-roster"); setShow(false); },
        "Enter Underground": () => switchScene("Game", "Underground"),
        "Enter Tent": () => switchScene("Game", "Tent"),
        "Enter North Port": () => EventBus.emit("Port", "South"),
        "Enter South Port": () => EventBus.emit("Port", "North"),
        "Enter East Port": () => EventBus.emit("Port", "West"),
        "Enter West Port": () => EventBus.emit("Port", "East"),
        "Close": () => setShow(false),
        "Exit Underground": () => switchScene("Underground", "Game"),
        "Exit World": () => switchScene("Underground", "Game"),
        "Pause": () => togglePause(true),
        "Resume": () => togglePause(false),
        "Movement": () => EventBus.emit("highlight", "joystick"),
        "Combat": () => EventBus.emit("highlight", "action-bar"),
        "Settings": () => EventBus.emit("highlight", "smallhud"),
        "Enter World" : () => switchScene("Tutorial", "Game"),
        "Enter Tutorial" : () => switchScene("Game", "Tutorial"),
    };

    const sendSettings = () => EventBus.emit("get-settings", settings);
    
    usePhaserEvent("add-party", addParty);
    usePhaserEvent("remove-party", removeParty);
    
    usePhaserEvent("alert", (payload: Toast) => makeToast(payload.header, payload.body, payload?.delay, payload?.key, payload?.extra, payload?.arg));
    usePhaserEvent("set-tips", setTips);
    usePhaserEvent("scene-switch", (data:{current:string,next:string}) => switchScene(data.current,data.next));
    usePhaserEvent("enter-menu", enterMenu);
    
    usePhaserEvent("silent-save", silentSave);
    usePhaserEvent("fetch-ascean", fetchAscean);
    usePhaserEvent("loading-ascean", loadingAscean);
    usePhaserEvent("quick-ascean", quickAscean);
    usePhaserEvent("save-ascean", saveAscean);
    usePhaserEvent("update-ascean", updateAscean);
    
    usePhaserEvent("fetch-inventory", fetchInventory);
    usePhaserEvent("update-inventory", saveInventory);
    usePhaserEvent("update-pause", togglePause);
    
    usePhaserEvent("add-quest", addQuest);
    usePhaserEvent("complete-quest", completeQuest);
    usePhaserEvent("remove-quest", removeQuest);
    usePhaserEvent("update-quests", updateQuest);
    
    usePhaserEvent("request-reputation", () => EventBus.emit("reputation", reputation()));
    usePhaserEvent("update-reputation", updateRep);
    
    usePhaserEvent("request-statistics", () => EventBus.emit("statistics", statistics()));
    usePhaserEvent("update-statistics", updateStat);
    
    usePhaserEvent("request-talents", () => EventBus.emit("talents", talents()));
    usePhaserEvent("update-talents", updateTal);
    
    usePhaserEvent("request-settings", () => EventBus.emit("settings", settings()));
    usePhaserEvent("save-settings", saveSettings);
    usePhaserEvent("save-this-setting", saveThisSetting);
    usePhaserEvent("insert-settings", insertSettings);
    usePhaserEvent("request-settings", sendSettings);
    usePhaserEvent("update-settings", updateRep);
    
    usePhaserEvent("player-ascean", () => EventBus.emit("player-ascean-ready", ascean()));
    
    usePhaserEvent("save-intro", async () => {
        const update = { ...settings(), tutorial: { ...settings().tutorial, intro: true} };
        await saveSettings(update);
        await fetchAscean(ascean()?._id as string);
        const scene = phaserRef.scene as Scene; // "intro"
        scene.scene.stop("Intro");
        scene.scene.wake("Hud");
        const game = scene.scene.get("Tutorial") as Tutorial;
        if (scene.scene.isSleeping("Tutorial")) {
            scene.scene.wake("Tutorial");
            game.musicBackground.resume();
        } else {
            const hud = scene.scene.get("Hud");
            scene.scene.launch("Tutorial", hud);
        };
        EventBus.emit("boot-tutorial");
        EventBus.emit("current-scene-ready", game);
    });
    usePhaserEvent("sleep-scene", (key: string) => {
        const scene = phaserRef.scene as Scene;
        scene.scene.sleep("Hud");
        const game = scene.scene?.get(key) as any;
        game.sleepScene();
    });
    usePhaserEvent("fetch-button-reorder", () => {
        EventBus.emit("reorder-buttons", { list: settings().actions, type: "action" });
        EventBus.emit("reorder-buttons", { list: settings().specials, type: "special" });
    });
    usePhaserEvent("update-fps", (fps: any) => {
        if (!phaserRef.scene) return;
        const game = phaserRef.scene.game;
        game.loop.stop();
        Phaser.Core.TimeStep.call(game.loop, game, fps);
        game.loop.start(game.step.bind(game));
    });

    return <div id="app">
        <Show when={startGame()} fallback={<div class="">
        {menu().creatingCharacter ? (
            <div id="overlay" class="superCenter">
            <Show when={menu().screen !== SCREENS.COMPLETE.KEY && dims.ORIENTATION === "landscape"}>
                <Suspense fallback={<Puff color="gold"/>}>
                    <Preview newAscean={newAscean} />
                </Suspense>
            </Show>
            <Suspense fallback={<Puff color="gold"/>}>
                <AsceanBuilder newAscean={newAscean} setNewAscean={setNewAscean} menu={menu} />
            </Suspense>
            <Show when={dims.ORIENTATION === "landscape"} fallback={
                <>{(SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV !== SCREENS.COMPLETE.KEY) &&
                    <button class="highlight cornerBL" onClick={() => {click.play(); setScreen(SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV);}}>
                        <div>Back ({SCREENS[SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV as keyof typeof SCREENS]?.TEXT})</div>
                    </button>
                }
                {(SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT !== SCREENS.CHARACTER.KEY) &&
                    <button class="highlight cornerBR" onClick={() => {click.play(); setScreen(SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT);}}>
                        <div>Next ({SCREENS[SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT as keyof typeof SCREENS]?.TEXT})</div>
                    </button>
                }
                {SCREENS[menu()?.screen as keyof typeof SCREENS]?.KEY === SCREENS.COMPLETE.KEY &&
                    <button class="highlight cornerBR" onClick={() => createCharacter(newAscean())}>
                        <div>Create {newAscean()?.name?.split(" ")[0]}</div>
                    </button>
                }
                <button class="highlight cornerTR" onClick={() => {click.play(); setMenu({ ...menu(), creatingCharacter: false });}}>
                    <div>Back (Menu)</div>
                </button></>
                }>
                <>{(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV !== LANDSCAPE_SCREENS.COMPLETE.KEY) && 
                        <button class="highlight cornerBL" onClick={() => {click.play(); setScreen(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV);}}>
                            Back ({LANDSCAPE_SCREENS[LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV as keyof typeof LANDSCAPE_SCREENS]?.TEXT})
                        </button>
                    }
                    {(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT !== LANDSCAPE_SCREENS.PREMADE.KEY) && 
                        <button class="highlight cornerBR" onClick={() => {click.play(); setScreen(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT);}}>
                            Next ({LANDSCAPE_SCREENS[LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT as keyof typeof LANDSCAPE_SCREENS]?.TEXT})
                        </button>
                    }
                    {(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY === LANDSCAPE_SCREENS.COMPLETE.KEY) && 
                        <button class="highlight cornerBR animate" onClick={() => createCharacter(newAscean())}>
                            Create {newAscean()?.name?.split(" ")[0]}
                        </button>
                    }
                    {(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY === LANDSCAPE_SCREENS.PREMADE.KEY) && 
                        <button class="highlight cornerBL animate" onClick={() => createCharacter(newAscean())}>
                            Create {newAscean()?.name?.split(" ")[0]}
                        </button>
                    }
                    <button class="highlight cornerTR" onClick={() => {click.play(); setMenu({ ...menu(), creatingCharacter: false });}}>
                        Back (Menu)
                    </button>
                </>
            </Show>
            </div>
        ) : loading() ? ( 
            <LoadAscean ascean={ascean} />
        ) : menu()?.choosingCharacter ? ( // menu().asceans.length > 0
            <div id="overlay" class="superCenter menu-3d-container carousel">
                <Suspense fallback={<Puff color="gold"/>}>
                    <MenuAscean menu={menu} setMenu={setMenu} viewAscean={viewAscean} loadAscean={setLoadAscean} />
                </Suspense>
                <Show when={menu()?.asceans?.length < 3}>
                    <button class="highlight cornerTR" onClick={() => {click.play(); setMenu({ ...menu(), creatingCharacter: true });}}>Create Character</button>
                </Show>
            </div>
        ) : ascean() ? (
            <>
                <Suspense fallback={<Puff color="gold"/>}>
                    <AsceanView ascean={ascean} />
                </Suspense>
                <Show when={menu()?.asceans?.length > 0}>
                    <Button text={"Main Menu"} classes={"highlight cornerTL"} callback={() => {click.play(); setMenu({...menu(), choosingCharacter: true})}} />
                    {/* <button class="highlight cornerTL" onClick={() => {click.play(); setMenu({ ...menu(), choosingCharacter: true });} }>Main Menu</button>  */}
                </Show>
                <Show when={menu()?.asceans?.length < 3}>
                    <Button text={"Create Character"} classes={"highlight cornerTR"} callback={() => {click.play(); setMenu({...menu(), creatingCharacter: true})}} />
                    {/* <button class="highlight cornerTR" onClick={() => {click.play(); setMenu({ ...menu(), creatingCharacter: true });}}>Create Character</button> */}
                </Show>
                <Show when={menu().deleteModal}>
                    <div class="modal" onClick={() => setMenu({ ...menu(), deleteModal: false })} style={{ background: "rgba(0, 0, 0, 1)" }}>
                        <button class="highlight superCenter" onClick={() => deleteCharacter(ascean()?._id)} style={{ color: "red", margin: 0, padding: "1em", width: "auto", "font-size": "1.5em", "font-weight": 700, "border-radius": "0" }}>Permanently Delete {ascean()?.name}?</button>
                        <div class="gold verticalBottom super" style={{ "margin-bottom": "10%" }}>[This action is irreversible. You may click anywhere to cancel.]</div>
                    </div>
                </Show> 
                <button class="highlight cornerBL" onClick={() => setMenu({ ...menu(), deleteModal: true })}>Delete {ascean()?.name.split(" ")[0]}</button>
                <button class="highlight cornerBR animate" onClick={() => setLoadAscean(ascean()?._id)}>Enter Game</button>
            </>
        ) : ( 
            <div class="menu-bg">
            <canvas id="lightning"></canvas>
            <Suspense fallback={<Puff color="gold"/>}>
            <div class="cornerTL super" style={{ "text-shadow": "0em 0em 0.1em #ffd700" }}>The Ascean v0.0.1</div>
            <Show when={menu().loading === false} fallback={<div class="superCenter"><Puff color="gold"/></div>}>
            <div class="superCenter cinzel full">
                <div class="center">
                    <div class="title long-animate animate-flicker">The Ascean</div>
                    <button style={{ "font-size":"1.5em" }} class="center highlight animate cinzel enter" onClick={() => menuOption(menu().asceans.length > 0 ? "choosingCharacter" : "creatingCharacter")}>Enter Game</button>
                </div>
            </div>
            </Show>
            </Suspense>
            </div>
        )}
        </div>}>
            <PhaserGame ref={(el: IRefPhaserGame) => phaserRef = el} currentActiveScene={currentScene} menu={menu} setMenu={setMenu} ascean={ascean} inventory={inventory} setInventory={setInventory} quests={quests} reputation={reputation} setReputation={setReputation} settings={settings} setSettings={setSettings} statistics={statistics} scene={scene} talents={talents} />
        </Show>
        <Show when={show()}>
        <Suspense fallback={<Puff color="gold"/>}>
            <GameToast actions={actions} show={show} setShow={setShow} alert={alert} setAlert={setAlert as Setter<{ header: string; body: string; delay: number; key?: string; arg: any }>} />
        </Suspense>
        </Show>
    </div>;
};