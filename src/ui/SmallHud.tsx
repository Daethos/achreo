import { EventBus } from "../game/EventBus";
import { Accessor, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { GameState } from "../stores/game";
import { Combat } from "../stores/combat";
import ExperienceToast from "./ExperienceToast";
import Ascean from "../models/ascean";
import CombatSettings from "./CombatSettings";
import LootDropUI from "./LootDropUI";
import CombatText from "./CombatText";
import Dialog from "./Dialog";
import { LevelSheet } from "../utility/ascean";
import Settings from "../models/settings";
import { partyText, text } from "../utility/text";
import { svg } from "../utility/settings";
import QuestManager from "../utility/quests";
import { Reputation } from "../utility/player";
import { IRefPhaserGame } from "../game/PhaserGame";
interface Props {
    ascean: Accessor<Ascean>;
    asceanState: Accessor<LevelSheet>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    settings: Accessor<Settings>; 
    quests: Accessor<QuestManager>;
    reputation: Accessor<Reputation>;
    instance: IRefPhaserGame;
};
export default function SmallHud({ ascean, asceanState, combat, game, settings, quests, reputation, instance }: Props) { 
    const [alert, setAlert] = createSignal<{ header: string; body: string } | undefined>(undefined);
    const [toastShow, setToastShow] = createSignal<boolean>(false);
    const [experience, setExperience] = createSignal<number>(ascean()?.experience as number); // ascean().experience as number
    const [clicked, setClicked] = createSignal<any>({
        showPlayer: false,
    });
    const [editTextShow, setEditTextShow] = createSignal(false);
    const [partyShow, setPartyShow] = createSignal(false);
    const [editSettingsShow, setEditSettingsShow] = createSignal(false);
    const [combatHistory, setCombatHistory] = createSignal<any>("");
    const [partyHistory, setPartyHistory] = createSignal<any>("");
    createMemo(() => {
        if (ascean()?.experience as number > experience()) {
            setToastShow(true);
            setAlert({
                header: "Experience Gain",
                body: `You"ve Gained ${ascean().experience as number - experience()} Experience!`,
            });
        } else if (ascean()?.experience !== 0 && ascean()?.experience as number < experience()) {
            setAlert(undefined);    
            setToastShow(false);
        };     
        setExperience(ascean().experience as number);
    });
    onMount(() => { 
        EventBus.on("update-small-hud", () => {
            setClicked({
                ...clicked(),
                caerenic: combat().isCaerenic,
                stalwart: combat().isStalwart,
                stealth: combat().isStealth,
                showCombat: game().showCombat,
                showPlayer: game().showPlayer,
                combatSettings: game().scrollEnabled,
                pause: game().pauseState,
            });
        });
        EventBus.on("add-combat-logs", (data: Combat) => {
            const newText = text(combatHistory(), data);
            setCombatHistory(newText);
            EventBus.emit("blend-combat", {
                playerStartDescription: "",
                computerStartDescription: "",
                playerSpecialDescription: "",
                computerSpecialDescription: "",
                playerActionDescription: "",
                computerActionDescription: "",
                playerInfluenceDescription: "",
                computerInfluenceDescription: "",
                playerInfluenceDescriptionTwo: "",
                computerInfluenceDescriptionTwo: "",
                playerDeathDescription: "",
                computerDeathDescription: "",   
            });
        });
        EventBus.on("set-show-player", () => {
            showPlayer();
        });
        EventBus.on("party-combat-text", (e: { text: string; }) => {
            const newText = partyText(partyHistory(), e);
            setPartyHistory(newText);
        });
    });
    onCleanup(() => {
        EventBus.off("update-small-hud");
        EventBus.off("add-combat-logs");
        EventBus.off("set-show-player");    
    });

    const showPlayer = () => {
        EventBus.emit("show-player");
        EventBus.emit("action-button-sound");
        const setShow = !clicked().showPlayer;
        
        if (!combat().combatEngaged) EventBus.emit("show-castbar", setShow);
        setClicked({ ...clicked(), showPlayer: setShow });
    };

    return <>
        <Show when={toastShow()}>
            <div class="verticalBottom realize" style={{ width: "30%" }}>
                <ExperienceToast show={toastShow} setShow={setToastShow} alert={alert} setAlert={setAlert} />
            </div>
        </Show>
        <Show when={game().scrollEnabled}>
            <button class="highlight" onClick={() => setEditSettingsShow(!editSettingsShow())} style={{ top: `${Number(settings()?.combatSettings?.top.split("%")[0]) - 12.5}%`, left: `${Number(settings()?.combatSettings?.left.split("%")[0]) - 1.25}%`, position: "absolute", color: "gold", transform: "scale(0.75)" }}>{svg("UI")}</button>
            <CombatSettings combat={combat} game={game} settings={settings} editShow={editSettingsShow} setEditShow={setEditSettingsShow} />
        </Show>
        <Show when={game().lootDrops.length > 0 && game().showLoot}>
            <LootDropUI ascean={ascean} game={game} settings={settings} />
        </Show>
       <Show when={game().showCombat}>
            <button class="highlight" onClick={() => setEditTextShow(!editTextShow())} style={{ top: `${Number(settings().combatText.top.split("vh")[0]) - 12.5}vh`, left: `${Number(settings().combatText.left.split("vw")[0]) - 1.25}vw`, position: "absolute", color: "gold", transform: "scale(0.75)" }}>{svg("UI")}</button>
            <button class="highlight" onClick={() => setPartyShow(!partyShow())} style={{ top: `${Number(settings().combatText.top.split("vh")[0]) - 11.5}vh`, right: `${Number(settings().combatText.left.split("vw")[0]) - 1.25}vw`, position: "absolute", color: "gold", transform: "scale(0.8)" }}>{svg("INSPECT")}</button>
            <CombatText settings={settings} combat={combat} combatHistory={combatHistory} partyHistory={partyHistory} editShow={editTextShow} setEditShow={setEditTextShow} partyShow={partyShow} />
        </Show>
        <Show when={game().showDialog}>
            <Dialog ascean={ascean} asceanState={asceanState} combat={combat} game={game} reputation={reputation} settings={settings} quests={quests} instance={instance} />
        </Show>
    </>;
};