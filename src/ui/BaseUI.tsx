import { Accessor, Setter, Show, createEffect, createSignal, lazy, Suspense } from "solid-js";
import Ascean from "../models/ascean";
import Settings from "../models/settings";
import { Combat } from "../stores/combat";
import { ARENA_ENEMY, EnemySheet } from "../utility/enemy";
import { EventBus } from "../game/EventBus";
import { GameState } from "../stores/game";
import { Compiler, LevelSheet } from "../utility/ascean";
import { usePhaserEvent } from "../utility/hooks";
import { caerenic, consumePrayer, instantActionCompiler, prayerEffectTick, prayerRemoveTick, stalwart, statusEffectCheck, talentPrayerCompiler, weaponActionCompiler } from "../utility/combat";
import { screenShake } from "../game/phaser/ScreenShake";
import { Reputation } from "../utility/player";
import { Puff } from "solid-spinner";
import Statistics from "../utility/statistics";
import { validateHealth, validateLevel, validateMastery } from "../utility/validators";
import { timer } from "./Timer";
import { Store } from "solid-js/store";
import { IRefPhaserGame } from "../game/PhaserGame";
import Talents from "../utility/talents";
import QuestManager from "../utility/quests";
const Roster = lazy(async () => await import("./Roster"));
const Character = lazy(async () => await import("./Character"));
const CombatUI = lazy(async () => await import("./CombatUI"));
const Deity = lazy(async () => await import("./Deity"));
const EnemyPreview = lazy(async () => await import("./EnemyPreview"));
const EnemyUI = lazy(async () => await import("./EnemyUI"));
const SmallHud = lazy(async () => await import("./SmallHud"));
const TutorialOverlay = lazy(async () => await import("../utility/tutorial"));
export type ArenaRoster = {
    show: boolean;
    enemies: ARENA_ENEMY[] | [];
    wager: { silver: number; gold: number; multiplier: number; };
    result: boolean;
    win: boolean;
    party: boolean;
    map: string;
    gauntlet: {
        opponents: number,
        round: number,
        type: string,
    }
};
interface Props {
    instance: Store<IRefPhaserGame>;
    ascean: Accessor<Ascean>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    quests: Accessor<QuestManager>;
    reputation: Accessor<Reputation>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    statistics: Accessor<Statistics>;
    talents: Accessor<Talents>;
    stamina: Accessor<number>;
    grace: Accessor<number>;
    tutorial: Accessor<string>;
    showTutorial: Accessor<boolean>;
    setShowTutorial: Setter<boolean>;
    showDeity: Accessor<boolean>;
};
export default function BaseUI({ instance, ascean, combat, game, quests, reputation, settings, setSettings, statistics, talents, stamina, grace, tutorial, showDeity, showTutorial, setShowTutorial }: Props) {
    const [enemies, setEnemies] = createSignal<EnemySheet[]>([]);
    const [touching, setTouching] = createSignal<string[]>([]);
    const [asceanState, setAsceanState] = createSignal<LevelSheet>({
        ascean: ascean(),
        currency: ascean().currency,
        currentHealth: ascean().health.current,
        experience: ascean().experience,
        experienceNeeded: ascean().level * 1000,
        faith: ascean().faith,
        firewater: ascean().firewater,
        mastery: ascean().mastery,
        avarice: false,
        opponent: 0,
        opponentExp: 0,
        constitution: 0,
        strength: 0,
        agility: 0,
        achre: 0,
        caeren: 0,
        kyosir: 0,
    });
    const [arena, setArena] = createSignal<ArenaRoster>({ show: false, enemies: [], party: instance?.game?.registry.get("party").length || false, wager: { silver: 0, gold: 0, multiplier: 0 }, result: false, win: false, map: "ARENA", gauntlet: { opponents: 1, type: "RANDOMIZED", round: 1 } });
    createEffect(() => EventBus.emit("combat", combat()));  
    createEffect(() => EventBus.emit("game", game()));  
    createEffect(() => EventBus.emit("reputation", reputation()));
    createEffect(() => EventBus.emit("settings", settings()));
    createEffect(() => EventBus.emit("talents", talents()));
    const sendEnemyData = () => EventBus.emit("get-enemy", combat().computer);
    function initiateCombat(data: any, type: string) {
        try {    
            let res: Combat | undefined | any = undefined,
                playerWin: boolean = false,
                computerWin: boolean = false,
                playerActionDescription: string = "", 
                computerActionDescription: string = "",
                computerHealth: number = validateHealth(combat().computerHealth),
                newComputerHealth: number = validateHealth(combat().newComputerHealth),
                newPlayerHealth: number = validateHealth(combat().newPlayerHealth),
                computerLevel: number = validateLevel(combat().computer?.level as number),
                playerLevel: number = validateLevel(combat().player?.level as number),
                computerMastery: number = validateMastery(combat().computer?.[combat().computer?.mastery as string]),
                playerMastery: number = validateMastery(combat().player?.[combat().player?.mastery as string]),
                affectsHealth: boolean = true,
                affectsStealth: boolean = true,
                caerenicPos: number = caerenic(combat().caerenic).pos,
                caerenicNeg: number = caerenic(combat().caerenic).neg,
                stalwartDef: number = stalwart(combat().stalwart);
            switch (type) {
                case "Weapon": // Targeted Weapon Action by Enemy or Player
                    if (combat().computer === undefined || newComputerHealth === 0) return;
                    const weapon = { ...combat(), [data.key]: data.value };
                    res = weaponActionCompiler(weapon) as Combat;
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    EventBus.emit("blend-combat", res);
                    break;
                case "Consume": // Consuming Prayer
                    if (newComputerHealth === 0) return;    
                    let consume = { ...combat(), prayerSacrificeId: data.prayerSacrificeId };
                    consume = consumePrayer(consume) as Combat;
                    res = { ...combat(), ...consume };
                    playerWin = res.playerWin;
                    EventBus.emit("blend-combat", { newComputerHealth: res.newComputerHealth,newPlayerHealth: res.newPlayerHealth, playerEffects: res.playerEffects, playerWin });
                    break;
                case "Talent Prayer":
                    if (combat().computer === undefined || newComputerHealth === 0) return;
                    let talent = talentPrayerCompiler(combat(), data) as Combat;
                    playerWin = talent.playerWin;
                    res = { ...combat(), ...talent };
                    EventBus.emit("blend-combat", talent);
                    break;
                case "Prayer": // Consuming Prayer
                    let prayer = { ...combat(), playerEffects: data };
                    prayer = consumePrayer(prayer) as Combat;
                    res = { ...combat(), ...prayer };
                    playerWin = res.playerWin;
                    EventBus.emit("blend-combat", { newComputerHealth: res.newComputerHealth, newPlayerHealth: res.newPlayerHealth, playerEffects: res.playerEffects, playerWin });
                    break;
                case "Instant": // Invoking Prayer
                    if (combat().computer === undefined || newComputerHealth === 0) return;
                    let insta = { ...combat(), playerBlessing: data };
                    insta = instantActionCompiler(insta) as Combat;
                    playerWin = insta.playerWin;
                    res = { ...combat(), ...insta };
                    EventBus.emit("blend-combat", insta);
                    break;
                case "Tick": // Prayer Tick
                    if (newComputerHealth === 0) break;
                    const { effect, effectTimer } = data;
                    const tick = prayerEffectTick({ combat: combat(), effect, effectTimer });
                    res = { ...combat(), ...tick };
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    EventBus.emit("blend-combat", tick);
                    break;
                case "Remove Tick": // Removing Prayer
                    const remove = prayerRemoveTick(combat(), data);

                    playerActionDescription = `${data.playerName === combat().player?.name ? "Your" : `${combat().computer?.name}"s`} ${data.name} prayer has expired.`;
                    res = { ...combat(), ...remove, playerActionDescription };
                    EventBus.emit("blend-combat", remove);
                    affectsHealth = false;
                    affectsStealth = false;
                    break;
                case "Player": // Blind Player Attack i.e. hitting a non targeted enemy
                    const { playerAction, enemyID, ascean, damageType, combatStats, weapons, health, actionData } = data;
                    if (ascean === undefined || health === 0) return;
                    let playerData = {
                        action: playerAction.action,
                        parryGuess: playerAction.parry,
                        computer: ascean,
                        computerAttributes: combatStats.attributes,
                        computerWeapons: weapons,
                        computerWeaponOne: combatStats.combatWeaponOne,
                        computerWeaponTwo: combatStats.combatWeaponTwo,
                        computerWeaponThree: combatStats.combatWeaponThree,
                        newComputerHealth: health,
                        computerHealth: combatStats.healthTotal,
                        computerDefense: combatStats.defense,
                        computerDefenseDefault: combatStats.defense,
                        computerAction: actionData.action,
                        computerParryGuess: actionData.parry,
                        computerDamageType: damageType,
                        computerEffects: [],
                        enemyID: enemyID, // Was ""
                    };
                    res = { ...combat(), ...playerData };
                    res = weaponActionCompiler(res) as Combat;
                    EventBus.emit("blend-combat", {
                        playerWin: res.playerWin,
                        computerWin: res.computerWin,
                        playerActionDescription: res.playerActionDescription,
                        computerActionDescription: res.computerActionDescription,
                        playerStartDescription: res.playerStartDescription,
                        computerStartDescription: res.computerStartDescription,
                        playerDeathDescription: res.playerDeathDescription,
                        computerDeathDescription: res.computerDeathDescription,
                        playerSpecialDescription: res.playerSpecialDescription,
                        computerSpecialDescription: res.computerSpecialDescription,
                        playerInfluenceDescription: res.playerInfluenceDescription,
                        computerInfluenceDescription: res.computerInfluenceDescription,
                        playerInfluenceDescriptionTwo: res.playerInfluenceDescriptionTwo,
                        computerInfluenceDescriptionTwo: res.computerInfluenceDescriptionTwo,
                        potentialPlayerDamage: res.potentialPlayerDamage,
                        realizedPlayerDamage: res.realizedPlayerDamage,
                        potentialComputerDamage: res.potentialComputerDamage,
                        realizedComputerDamage: res.realizedComputerDamage,
                        playerDamaged: res.playerDamaged,
                        newPlayerHealth: res.newPlayerHealth,
                        criticalSuccess: res.criticalSuccess,
                        religiousSuccess: res.religiousSuccess,
                        rollSuccess: res.rollSuccess,
                        parrySuccess: res.parrySuccess,
                        glancingBlow: res.glancingBlow,
                        dualWielding: res.dualWielding,
                        playerEffects: res.playerEffects,
                    });
                    EventBus.emit("update-enemy-health", { id: res.enemyID, health: res.newComputerHealth, glancing: res.glancingBlow, critical: res.criticalSuccess });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case "Chiomic": // Mindflay
                    if (combat().computer === undefined || newComputerHealth === 0) return;
                    const chiomic = Math.round(playerMastery / 2 * (1 + data / 100) * caerenicPos * playerLevel);
                    newComputerHealth = newComputerHealth - chiomic < 0 ? 0 : newComputerHealth - chiomic;
                    playerWin = newComputerHealth === 0;
                    playerActionDescription = `Your hush flays ${chiomic} health from ${combat().computer?.name}.`;
                    res = { ...combat(), newComputerHealth, playerWin, playerActionDescription };
                    EventBus.emit("blend-combat", { newComputerHealth, playerWin });
                    affectsHealth = false;
                    break;
                case "Enemy Chiomic": // Mindflay
                    if (combat().computer === undefined) return;
                    const enemyChiomic = Math.round(computerMastery / 2 * (1 + data / 100) * caerenicNeg * stalwartDef  * computerLevel);
                    newPlayerHealth = newPlayerHealth - enemyChiomic < 0 ? 0 : newPlayerHealth - enemyChiomic;
                    computerWin = newPlayerHealth === 0;
                    computerActionDescription = `${combat().computer?.name} flays ${enemyChiomic} health from you with their hush.`;
                    res = { ...combat(), newPlayerHealth, computerWin, computerActionDescription };
                    EventBus.emit("blend-combat", { newPlayerHealth, computerWin, damagedID: combat().enemyID });
                    break;
                case "Tshaeral": // Lifedrain (Tick, 100%)
                    if (combat().computer === undefined || newComputerHealth === 0) return;
                    const drained = Math.round(combat().playerHealth * (data / 100) * caerenicPos * playerLevel);
                    newPlayerHealth = newPlayerHealth + drained > combat().playerHealth ? combat().playerHealth : newPlayerHealth + drained;
                    newComputerHealth = newComputerHealth - drained < 0 ? 0 : newComputerHealth - drained;
                    playerWin = newComputerHealth === 0;
                    playerActionDescription = `You tshaer and devour ${drained} health from ${combat().computer?.name}.`;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, playerWin,playerActionDescription };
                    EventBus.emit("blend-combat", { newPlayerHealth, newComputerHealth, playerWin });
                    break;
                case "Enemy Tshaeral": // Lifedrain (Tick, 100%)
                    if (combat().computer === undefined) return;
                    const enemyDrain = Math.round(computerHealth * (data / 100) * caerenicNeg * stalwartDef * computerLevel);
                    newPlayerHealth = newPlayerHealth - enemyDrain < 0 ? 0 : newPlayerHealth - enemyDrain;
                    newComputerHealth = newComputerHealth + enemyDrain > computerHealth ? computerHealth : newComputerHealth + enemyDrain;
                    computerWin = newPlayerHealth === 0;
                    computerActionDescription = `${combat().computer?.name} tshaers and devours ${enemyDrain} health from you.`;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, computerWin, computerActionDescription, damagedID: combat().enemyID };
                    EventBus.emit("blend-combat", { newPlayerHealth, newComputerHealth, computerWin });
                    break;
                case "Health": // Either Enemy or Player Gaining / Losing Health
                    let { key, value, id } = data;
                    switch (key) {
                        case "player":
                            const healed = Math.floor(combat().playerHealth * (value / 100));
                            newPlayerHealth = newPlayerHealth + healed > combat().playerHealth ? combat().playerHealth : newPlayerHealth + healed;
                            computerWin = newPlayerHealth <= 0;
                            playerActionDescription =  
                                healed > 0 ? `You heal for ${healed}, back to ${Math.round(newPlayerHealth)}.` 
                                : `You are damaged for ${Math.abs(healed)}, down to ${Math.round(newPlayerHealth)}`;
                            res = { ...combat(), newPlayerHealth, playerActionDescription, damagedID: id };
                            EventBus.emit("blend-combat", { newPlayerHealth, computerWin, damagedID: id });
                            affectsStealth = false;
                            break;
                        case "enemy":
                            computerActionDescription = value > newComputerHealth ? 
                                `${combat().computer?.name} heals for ${Math.round(value - newComputerHealth)}, back up to ${Math.round(value)}` : 
                                `${combat().computer?.name} is damaged for ${Math.round(newComputerHealth - value)}, down to ${Math.round(value)}.`;
                            newComputerHealth = value > 0 ? value : 0;
                            playerWin = newComputerHealth === 0;
                            if (combat().enemyID === id) {
                                res = { ...combat(), newComputerHealth, playerWin, computerActionDescription };
                                EventBus.emit("blend-combat", { newComputerHealth, playerWin });
                            } else {
                                res = { ...combat(), playerWin };
                                EventBus.emit("update-enemy-health", { id, health: newComputerHealth, glancing: false, critical: false });
                            };
                            affectsHealth = false;
                            affectsStealth = false;
                            break;
                        default:
                            break;
                    };
                    break;
                case "Set Health":
                    computerWin = data.value <= 0;
                    playerActionDescription =  
                        data.value > newPlayerHealth ? `You heal for ${Math.round(data.value - newPlayerHealth)}, back to ${Math.round(data.value)}.` 
                        : `You are damaged for ${Math.round(newPlayerHealth - data.value)}, down to ${Math.round(data.value)}`;
                    newPlayerHealth = data.value;
                    res = { ...combat(), computerWin, newPlayerHealth, damagedID: data.id };
                    EventBus.emit("blend-combat", { computerWin, newPlayerHealth: data.value, damagedID: data.id });
                    affectsStealth = false;
                    break;
                case "Enemy": // Blind Enemy Attack i.e. an enemy not targeted hitting the player
                    if (!data.ascean) return;
                    let enemyData = {
                        computer: data.ascean,
                        computerAttributes: data.combatStats.attributes,
                        computerWeaponOne: data.combatStats.combatWeaponOne,
                        computerWeaponTwo: data.combatStats.combatWeaponTwo,
                        computerWeaponThree: data.combatStats.combatWeaponThree,
                        newComputerHealth: data.health,
                        computerHealth: data.combatStats.attributes.healthTotal,
                        computerDefense: data.combatStats.defense,
                        computerWeapons: data.weapons,
                        computerAction: data.actionData.action,
                        computerParryGuess: data.actionData.parry,
                        computerDamageType: data.damageType,
                        computerEffects: [],
                        enemyID: data.enemyID,
                    };
                    res = { ...combat(), ...enemyData };
                    res = weaponActionCompiler(res) as Combat;
                    computerWin = res.computerWin;
                    playerWin = res.playerWin; 
                    EventBus.emit("blend-combat", res);
                    break;
                case "Sacrifice": 
                    if (combat().computer === undefined || newComputerHealth === 0) return;
                    const sacrifice = Math.round(playerMastery * caerenicPos * playerLevel);
                    newPlayerHealth = newPlayerHealth - (sacrifice / 2 * stalwartDef) < 0 ? 0 : newPlayerHealth - (sacrifice / 2 * stalwartDef);
                    newComputerHealth = newComputerHealth - (sacrifice * (1 + data / 50)) < 0 ? 0 : newComputerHealth - (sacrifice * (1 + data / 50));
                    playerWin = newComputerHealth === 0;
                    computerWin = newPlayerHealth === 0;
                    playerActionDescription = `You sacrifice ${Math.round(sacrifice / 2 * stalwartDef)} health to rip ${Math.round(sacrifice * (1 + data / 50))} from ${combat().computer?.name}.`;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, playerWin, playerActionDescription, computerWin };
                    EventBus.emit("blend-combat", { newPlayerHealth, newComputerHealth, playerWin });
                    break;
                case "Suture":
                    if (combat().computer === undefined || newComputerHealth === 0) return;
                    const suture = Math.round(playerMastery * caerenicPos * playerLevel * (1 + data / 100) * 0.8);
                    newPlayerHealth = newPlayerHealth + suture > combat().playerHealth ? combat().playerHealth : newPlayerHealth + suture;
                    newComputerHealth = newComputerHealth - suture < 0 ? 0 : newComputerHealth - suture;
                    playerActionDescription = `Your suture ${combat().computer?.name}"s caeren into you, absorbing and healing for ${suture}.`;    
                    playerWin = newComputerHealth === 0;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, playerWin, playerActionDescription };
                    EventBus.emit("blend-combat", { newPlayerHealth, newComputerHealth, playerWin });
                    break;
                case "Enemy Sacrifice": 
                    if (combat().computer === undefined) return;
                    const enemySac = Math.round(computerMastery * computerLevel * caerenicNeg * stalwartDef);
                    newPlayerHealth = newPlayerHealth - (enemySac * (1 + data / 50)) < 0 ? 0 : newPlayerHealth - (enemySac * (1 + data / 50));
                    newComputerHealth = newComputerHealth - (enemySac / 2) < 0 ? 0 : newComputerHealth - (enemySac / 2);
                    computerActionDescription = `${combat().computer?.name} sacrifices ${enemySac / 2} health to rip ${enemySac * (1 + data / 50)} from you.`;
                    computerWin = newPlayerHealth === 0;
                    playerWin = newComputerHealth === 0;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, computerWin, computerActionDescription, playerWin, damagedID: combat().enemyID };
                    EventBus.emit("blend-combat", { newPlayerHealth, newComputerHealth, computerWin, playerWin, damagedID: combat().enemyID });
                    break;
                case "Enemy Suture":
                    if (combat().computer === undefined) return;
                    const enemySut = Math.round(computerMastery * caerenicNeg * (1 + data / 100) * computerLevel * stalwartDef * 0.8);
                    newPlayerHealth = newPlayerHealth - enemySut < 0 ? 0 : newPlayerHealth - enemySut;
                    newComputerHealth = newComputerHealth + enemySut > computerHealth ? computerHealth : newComputerHealth + enemySut;
                    computerActionDescription = `${combat().computer?.name} sutured ${enemySut} health from you, absorbing ${enemySut}.`;
                    computerWin = newPlayerHealth === 0;
                    playerWin = newComputerHealth === 0;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, computerActionDescription, computerWin, playerWin, damagedID: combat().enemyID };
                    EventBus.emit("blend-combat", { newPlayerHealth: newPlayerHealth, newComputerHealth, computerWin, playerWin, damagedID: combat().enemyID });
                    break;
                case "Remove Enemy":
                    if (combat().computer === undefined) return;
                    filterEnemies(combat().enemyID);
                    EventBus.emit("clear-enemy");
                    return;
                default:
                    break;
            };
            if (playerWin === true) res.computerDeathDescription = `${res.computer?.name || "The Enemy"} has been defeated.`;
            if (computerWin === true) res.playerDeathDescription = `You have been defeated.`;
            EventBus.emit("update-combat", res);
            EventBus.emit("add-combat-logs", res);
            if (playerWin === true || computerWin === true) {
                resolveCombat(res);
            } else if (affectsHealth === true) {
                timer.adjustTime(1000, res.combatEngaged, res.newPlayerHealth);
            };
            if (affectsStealth && combat().isStealth) {
                EventBus.emit("update-stealth");
            };
            screenShake(instance.scene as Phaser.Scene); // [250, 150, 250]
        } catch (err: any) {
            console.warn(err, "Error Initiating Combat");
        };
    };
    function resolveCombat(res: Combat) {
        try {
            timer.adjustTime(0, res.combatEngaged, 0, true);
            if (res.playerWin === true) {
                let experience: number = Math.round((res.computer?.level as number) * 50 * (res.computer?.level as number / res?.player?.level!) + (res?.playerAttributes?.rawKyosir as number));
                experience = balanceExperience(experience, res?.player?.level as number);
                const newState = { 
                    ...asceanState(), 
                    avarice: res.prayerData.length > 0 ? res.prayerData.includes("Avarice") : false, 
                    currency: ascean().currency,
                    firewater: ascean().firewater,
                    currentHealth: res.newPlayerHealth,
                    opponent: res.computer?.level,
                    opponentExp: Math.min(experience + ascean().experience, res?.player?.level! * 1000),
                };
                EventBus.emit("record-win", { record: res, experience: newState });
                const loot = { enemyID: res.enemyID, level: res.computer?.level as number };
                EventBus.emit("enemy-loot", loot);
                setAsceanState({ ...asceanState(), avarice: false });
                setTimeout(() => {
                    EventBus.emit("special-combat-text", { playerSpecialDescription: `Providence: You have gained up to ${experience} experience.` });
                }, 500);
            } else {
                EventBus.emit("record-loss", res);
            };
            res = statusEffectCheck(res);
        } catch (err: any) {
            console.warn(err, "Error Resolving Combat");
        };
    };    
    function balanceExperience(experience: number, level: number) {
        experience *= (110 - (level * 5)) / 100;
        experience = Math.round(experience);
        return experience;
    };
    function filterEnemies(id: string) {
        let newEnemies = enemies();
        newEnemies = newEnemies.filter((enemy) => {
            return enemy.id !== id ? true : false;
        });
        setEnemies(newEnemies);
    };
    usePhaserEvent("killing-blow", (data: {e: Ascean, enemyID: string}) => {
        const { e, enemyID } = data;
        let experience: number = Math.round(e.level * 50 * (e.level / ascean().level) + (combat().playerAttributes?.rawKyosir as number));
        experience = balanceExperience(experience, ascean().level);
        const newState = { 
            ...asceanState(), 
            avarice: combat().prayerData.length > 0 ? combat().prayerData.includes("Avarice") : false, 
            currency: ascean().currency,
            firewater: ascean().firewater,
            currentHealth: combat().newPlayerHealth,
            opponent: e.level,
            opponentExp: Math.min(experience + ascean().experience, ascean().level * 1000),
        };
        EventBus.emit("record-win", { record: combat(), experience: newState });
        const loot = { enemyID, level: e.level };
        EventBus.emit("enemy-loot", loot);
    });
    usePhaserEvent("remove-non-aggressive-enemy", () => {
        if (combat().enemyID !== "") filterEnemies(combat().enemyID);
        EventBus.emit("clear-enemy");
    });
    usePhaserEvent("initiate-combat", (payload: { data: any, type: string }) => initiateCombat(payload.data, payload.type));
    usePhaserEvent("remove-enemy", filterEnemies);
    usePhaserEvent("request-enemy", sendEnemyData);
    usePhaserEvent("update-enemies", (e: any) => setEnemies(e));
    usePhaserEvent("add-touching", (e: string) => setTouching((prev) => [...prev, e]));
    usePhaserEvent("remove-touching", (e: string) => setTouching((prev) => prev.filter((p:any) => p !== e)));
    usePhaserEvent("update-ascean-state" , (e: any) => setAsceanState(e));
    usePhaserEvent("show-roster", () => setArena({ ...arena(), show: true }));
    usePhaserEvent("set-tutorial-enemy", (enemy: Compiler) => {
        instance.game?.registry.set("enemies", enemy);
        EventBus.emit("create-tutorial-enemy");
    });
    usePhaserEvent("set-wager-arena", (data: { wager: { silver: number; gold: number; multiplier: number; }; enemies: Compiler[]; team: boolean }) => {
        const { wager, enemies, team } = data;
        instance.game?.registry.set("enemies", enemies);
        instance.game?.registry.set("wager", wager);
        instance.game?.registry.set("team", team);
        setArena({ ...arena(), wager });
        EventBus.emit("scene-switch", {current:"Underground", next:"Arena"});
    });
    usePhaserEvent("set-wager-gauntlet", (data: {enemies: Compiler[]; team: boolean; wager: {silver:number; gold:number; multiplier: number;};}) => {
        const { enemies, team, wager } = data;
        instance.game?.registry.set("enemies", enemies);
        const gauntlet = { ...arena().gauntlet, opponents: enemies.length };
        instance.game?.registry.set("gauntlet", gauntlet);

        instance.game?.registry.set("team", team);
        instance.game?.registry.set("wager", wager);
        setArena({ ...arena(), wager });
        EventBus.emit("scene-switch", {current:"Underground", next:"Gauntlet"});
    });
    usePhaserEvent("set-wager-underground", (data: { wager: { silver: number; gold: number; multiplier: number; }; enemies: Compiler[] }) => {
        const { wager, enemies } = data;
        instance.game?.registry.set("enemies", enemies);
        instance.game?.registry.set("wager", wager);
        setArena({ ...arena(), wager });
        EventBus.emit("create-arena", enemies);
    });
    usePhaserEvent("settle-wager", (data: { wager: { silver: number; gold: number; multiplier: number; }; win: boolean; }) => {
        const { wager, win } = data;
        setArena({ ...arena(), wager, result: true, show: true, win });
    });
    return <div id="base-ui">
        <Show when={game().showPlayer} fallback={<div style={{ position: "absolute", "z-index": 1 }}>
            <Suspense fallback={<Puff color="gold" />}>
                <CombatUI ascean={ascean} state={combat} game={game} settings={settings} stamina={stamina} grace={grace} touching={touching} instance={instance} />
            </Suspense>
            <Show when={combat().computer} fallback={<EnemyPreview enemies={enemies} />}>
            <Suspense fallback={<Puff color="gold" />}>
                <EnemyUI state={combat} game={game} enemies={enemies} instance={instance} />
            </Suspense>
            </Show>
        </div>}>
            <Suspense fallback={<Puff color="gold" />}>
                <Character quests={quests} reputation={reputation} settings={settings} setSettings={setSettings} statistics={statistics} talents={talents} ascean={ascean} asceanState={asceanState} game={game} combat={combat} />
            </Suspense>
        </Show>
        <Suspense fallback={<Puff color="gold" />}>
            <SmallHud ascean={ascean} asceanState={asceanState} combat={combat} game={game} reputation={reputation} settings={settings} quests={quests} instance={instance} /> 
        </Suspense>
        <Show when={showTutorial()}>
            <Suspense fallback={<Puff color="gold" />}>
                <TutorialOverlay ascean={ascean} settings={settings} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} />
            </Suspense>
        </Show>
        <Show when={showDeity()}>
            <Suspense fallback={<Puff color="gold" />}>
                <Deity ascean={ascean} combat={combat} game={game} reputation={reputation} statistics={statistics} />
            </Suspense>
        </Show>    
        <Suspense fallback={<Puff color="gold" />}>
            <Roster arena={arena} ascean={ascean} setArena={setArena} base={true} game={game} settings={settings} instance={instance} />
        </Suspense>
    </div>;
};