import { Accessor, JSX, Match, Setter, Switch, createEffect, createMemo, createSignal } from "solid-js"
import { Portal } from "solid-js/web";
import ItemModal from "../components/ItemModal";
import { border, borderColor, getRarityColor, itemStyle, masteryColor } from "../utility/styling";
import PrayerEffects from "./PrayerEffects";
import { EventBus } from "../game/EventBus";
import { For, Show } from "solid-js";
import { Combat } from "../stores/combat";
import StatusEffect from "../utility/prayer";
import { PrayerModal } from "../utility/buttons";
import { GameState } from "../stores/game";
import GraceBubble from "./GraceBubble";
import StaminaBubble from "./StaminaBubble";
import StaminaModal from "../components/StaminaModal";
import GraceModal from "../components/GraceModal";
import { createHealthDisplay } from "../utility/health";
import Settings from "../models/settings";
import { dimensions } from "../utility/dimensions";
import Equipment, { getOneTemplate } from "../models/equipment";
import Ascean from "../models/ascean";
import PickpocketLoot from "./PickpocketLoot";
import Lockpicking from "./Lockpicking";
import { IRefPhaserGame } from "../game/PhaserGame";
import { Store } from "solid-js/store";
import Steal from "./Steal";
import { usePhaserEvent } from "../utility/hooks";
import Talents from "../utility/talents";
import { Item } from "../models/item";
// import { faithSuccess } from "../utility/combat";
// import { faithSuccess } from "../utility/combat";
// import { addSpecial, addStance } from "../utility/abilities";
interface Props {
    ascean: Accessor<Ascean>;
    state: Accessor<Combat>;
    game: Accessor<GameState>;
    settings: Accessor<Settings>;
    stamina: Accessor<number>;
    grace: Accessor<number>;
    touching: Accessor<string[]>;
    instance: Store<IRefPhaserGame>;
    talents: Accessor<Talents>;
};
export default function CombatUI({ ascean, state, game, settings, stamina, grace, talents, touching, instance }: Props) {
    const dims = dimensions();
    const [effect, setEffect] = createSignal<StatusEffect>();
    const [show, setShow] = createSignal<boolean>(false);
    const [prayerShow, setPrayerShow] = createSignal<boolean>(false);
    const [shieldShow, setShieldShow] = createSignal<boolean>(false);
    const [staminaShow, setStaminaShow] = createSignal<boolean>(false);
    const [graceShow, setGraceShow] = createSignal<boolean>(false);
    const [previousHealth, setPreviousHealth] = createSignal({health:0,show:false,positive:false});
    const [stealing, setStealing] = createSignal<{ stealing: boolean, item: any }>({ stealing: false, item: undefined });
    const [highlight, setHighlight] = createSignal<Equipment | undefined>(undefined);
    const [lockpicking, setLockpicking] = createSignal<boolean>(false); // setShowPickpocketItems
    const [lockpick, setLockpick] = createSignal({id:"", interacting: false, type: ""});
    const [canLockpick, setCanLockpick] = createSignal<boolean>(false);
    const [pickpocketItems, setPickpocketItems] = createSignal<any[]>([]);
    const [pickpocketEnemy, setPickpocketEnemy] = createSignal<string>("");
    const [showPickpocket, setShowPickpocket] = createSignal<boolean>(false); // setShowPickpocketItems
    const [showPickpocketItems, setShowPickpocketItems] = createSignal<boolean>(false); // setShowPickpocketItems
    const [prayer, setPrayer] = createSignal<string>("");
    const [exception, setException] = createSignal<boolean>(false);
    const [thrownNet, setThrownNet] = createSignal<boolean>(false);
    const { healthDisplay, changeDisplay, healthPercentage } = createHealthDisplay(state, game, false);
    const [stealAnimation, setStealAnimation] = createSignal<{ item: any, player: number, enemy: number, dialog: any, on: boolean, cancel: boolean, rolling: boolean, step: number }>({
        item: {imgUrl:"", name:""},
        player: 0,
        enemy: 0,
        dialog: "",
        on: false,
        cancel: false,
        rolling: false,
        step: 0,
    });

    createEffect(() => {
        if (stealAnimation().on && stealAnimation().rolling) {
            let dialog: JSX.Element | string = "";
            switch (stealAnimation().step) {
                case 1:
                    dialog = <div><i>Calculating</i> the ability of <span class="gold">{state().player?.name as string}</span>. <br /><br /></div>;
                    break;
                case 2:
                    dialog = <div>You have a <span class="gold">{stealAnimation().player}</span>% of succeeding. <br /><br /> <i>Calculating</i> {state().computer?.name}'s Awareness</div>;
                    break;
                case 3:
                    dialog = <div><i>Comparing</i> your <span class="gold">guile</span> with {state().computer?.name}'s</div>;
                    break;
                case 4:
                    dialog = <div>Player: <span class="gold">{stealAnimation().player}</span>% <br /> <br />
                        {state().computer?.name}'s current awareness is rated at <span class="gold">{stealAnimation().enemy}</span>% <br /> <br />
                        {stealAnimation().enemy > stealAnimation().player ? "Aww, well. Better luck next time, Fiend! Hah Hah Hah!" : `You rapscallion, you did it; the ${stealAnimation().item.name} is yours!`}</div> ;
                    break;
                default: break;
            };
            setStealAnimation({
                ...stealAnimation(),
                dialog,
                rolling: false,
            });
        };
    });

    createEffect(() => {
        const currentHealth = state().newPlayerHealth;
        const prevHealth = previousHealth().health;
        const showStatus = previousHealth().show;
        if (prevHealth !== currentHealth && showStatus === false) {
            setPreviousHealth(prev => ({
                ...prev,
                show: true,
                positive: prevHealth < currentHealth
            }));
            setTimeout(() => {
                setPreviousHealth({
                    health: currentHealth,
                    show: false,
                    positive:false
                });
            }, 1000);
        };
    });

    const hasNet = createMemo(() => {
        const net = game().specialInventory.inventory.find((item: Item) => item.name === "Net");
        return net !== undefined;
    });

    createEffect(() => setPrayer(settings().prayer));

    function checkLockpick(e: { id: string; interacting: boolean; type: string; }) {
        setLockpick(e);
        const pick = game().specialInventory.inventory.find((item: Item) => item.name === "Lockpick");
        const wrench = game().specialInventory.inventory.find((item: Item) => item.name === "Tension Wrench");
        setCanLockpick(pick && wrench && pick.quantity > 0);
    };
    function checkPickpocket() {
        if (pickpocketItems().length === 0 || state().computer?.name !== pickpocketEnemy()) {
            let equipment: any[] = [];
            for (let i = 0; i < 3; ++i) {
                const item = getOneTemplate(state().computer?.level as number);
                equipment.push(item);
            };
            setPickpocketItems(equipment);
            setPickpocketEnemy(state().computer?.name as string);
        };
        setShowPickpocketItems(true);
    };
    const disengage = () => EventBus.emit("disengage");
    const engage = () => EventBus.emit("engage");
    const exit = () => EventBus.emit("switch-scene", {current:instance.scene?.scene.key, next:"Underground"});
    const arenas = () => {
        return <Switch>
            <Match when={(instance.scene?.scene.key === "Arena" || instance.scene?.scene.key === "Gauntlet") && state().computer && !state().combatEngaged}>
                <button class="disengage highlight" onClick={engage} style={{ top: "15vh", left: "25vw" }}>
                    Engage {state().computer?.name}
                </button>    
            </Match>
            <Match when={(instance.scene?.scene.key === "Arena" || instance.scene?.scene.key === "Gauntlet") && !state().computer && !state().combatEngaged && state().newPlayerHealth > 0}>
                <button class="disengage highlight" onClick={exit} style={{ top: "15vh", left: "25vw" }}>
                    Exit {instance.scene?.scene.key}
                </button>    
            </Match>
        </Switch>
    };

    const showPlayer = () => {
        EventBus.emit("action-button-sound");
        EventBus.emit("update-small-hud");
        EventBus.emit("outside-press", "info");
    };

    function caerenic(caerenic: boolean, stealth: boolean) {
        return {
            "background": caerenic && stealth ? `linear-gradient(${masteryColor(state()?.player?.mastery as string)}, #444)` : caerenic ? masteryColor(state()?.player?.mastery as string) : stealth ? "linear-gradient(#000, #444)" : "black",
            "border": border(borderColor(state()?.playerBlessing), 0.15),
            "--glow-color": borderColor(state()?.playerBlessing),
            "height": "7.5vh",
            "mix-blend-mode": "multiply",
            transition: "background 0.5s ease-out",
        };
    };

    function stalwart(caerenic: boolean, stealth: boolean) {
        return {
            "background": caerenic && stealth ? `linear-gradient(${masteryColor(state()?.player?.mastery as string)}, #444)` : caerenic ? masteryColor(state()?.player?.mastery as string) : stealth ? "linear-gradient(#000, #444)" : "black",
            transition: "background 0.5s ease-out",
        };
    };

    const size = (len: number) => {
        switch (true) {
            case len < 10 && dims.WIDTH > 1200: return "1.5em"; // 1.15em
            case len < 20 && dims.WIDTH > 1200: return "1.3em"; // 1em
            case len < 30 && dims.WIDTH > 1200: return "1.1em"; // 0.85em
            case len < 10 && dims.WIDTH < 875: return "1.25em"; // 1.15em
            case len < 20 && dims.WIDTH < 875: return "1.15em"; // 1em
            case len < 30 && dims.WIDTH < 875: return "1.05em"; // 0.85em
            case len < 10: return "1.35em"; // 1.15em
            case len < 20: return "1.25em"; // 1em
            case len < 30: return "1.1em"; // 0.85em
            default:  return "0.85em"; // 0.6em
        };
    };

    const top = (len: number) => {
        switch (true) {
            case len < 10 && dims.WIDTH > 1200: return "3vh"; // 1.15em
            case len < 20 && dims.WIDTH > 1200: return "3.5vh"; // 1em
            case len < 30 && dims.WIDTH > 1200: return "4vh"; // 0.85em
            case len < 10 && dims.WIDTH < 875: return "1vh"; // 1.15em
            case len < 20 && dims.WIDTH < 875: return "1.25vh"; // 1em
            case len < 30 && dims.WIDTH < 875: return "1.5vh"; // 0.85em
            case len < 10: return "1.25vh"; // -3%
            case len < 20: return "1.5vh"; // -2%
            case len < 30: return "2vh"; // -1%
            default: return "3vh";
        };
    };

    function steal(item: Equipment): void {
        setStealing({ stealing: true, item });
    };

    // function createPrayer() {
    //     const combat = faithSuccess(state(), "player", state().weapons[0], 0);
    //     console.log("Prayer Created");
    //     EventBus.emit("blend-combat", { ...combat });
    // };

    usePhaserEvent("lockpick", checkLockpick);
    usePhaserEvent("net-thrown", (thrown: boolean) => setThrownNet(thrown));
    usePhaserEvent("combatHud", () => {
        setTimeout(() => {
            setException(!exception());
        }, 100);
    });
    return <div class="playerCombatUi" classList={{
        "animate-texty": previousHealth().show && previousHealth().positive,
        "animate-flicker": previousHealth().show && !previousHealth().positive,
        "reset-animation": !previousHealth().show && !exception(),
        "tutorial-highlight": exception(), // player-explode-in
        "float-ui": exception(),
      }} style={{ "--base-shadow": "#000", "--glow-color": "violet", "--mastery-color":"gold", transition: "all 0.75s ease" }}>
            <div class={`playerHealthBar`} classList={{
                "animate-texty": previousHealth().show && previousHealth().positive,
                "animate-flicker": previousHealth().show && !previousHealth().positive,
                "reset-animation": !previousHealth().show,
                "tutorial-highlight": exception(),
            }}>
            <div class="playerPortrait" classList={{
                "animate-texty": previousHealth().show && previousHealth().positive,
                "animate-flicker": previousHealth().show && !previousHealth().positive,
                "reset-animation": !previousHealth().show,
                "tutorial-highlight": exception(),
            }} onClick={changeDisplay} style={{ color: state().isStealth ? "#fdf6d8" : "#000", "text-shadow": `0.025em 0.025em 0.025em ${state().isStealth ? "#000" : "#fdf6d8"}`, 
            "--glow-color": "violet", "font-size": dims.WIDTH > 875 ? "1.25em" : "1.05em", "font-family":"Centaur" }}>{healthDisplay()}</div>
            <div class="healthbarPosition" onClick={changeDisplay} style={{ width: `100%`, "background": "linear-gradient(#aa0000, red)" }}></div>
            <div class="healthbarPosition" onClick={changeDisplay} style={{ width: `${healthPercentage()}%`, "background": state()?.isStealth ? "linear-gradient(#000, #444)" : "linear-gradient(gold, #fdf6d8)", transition: "width 0.5s ease-out", 
            "--glow-color": "gold" }}></div>
        </div>
        <p class="playerName" classList={{
            "animate-texty": previousHealth().show && previousHealth().positive,
            "animate-flicker": previousHealth().show && !previousHealth().positive,
            "reset-animation": !previousHealth().show,
            "tutorial-highlight": exception(),
        }} style={{
            top: top(state().player?.name.length as number), 
            "color": `${state().isStealth ? "#fdf6d8" : "gold"}`, "text-shadow": `0.1em 0.1em 0.1em ${state().isStealth ? "#444" : "#000"}`, 
            "--glow-color": state().isStealth ? "#fdf6d8" : "gold",
            "font-size": size(state().player?.name.length as number), "font-family":"Centaur", "z-index": 0 }} onClick={() => showPlayer()}>{state()?.player?.name}</p>
        <img id="playerHealthbarBorder" src={"../assets/gui/player-healthbar.png"} alt="Health Bar" onClick={changeDisplay} style={{ "z-index": -1 }} />
        <StaminaBubble stamina={stamina} show={staminaShow} setShow={setStaminaShow} settings={settings} />
        <Show when={settings().specials.length}>
            <GraceBubble grace={grace} show={graceShow} setShow={setGraceShow} settings={settings} />
        </Show>
        <div class="combatUiWeapon" classList={{
                "animate-texty": previousHealth().show && previousHealth().positive,
                "animate-flicker": previousHealth().show && !previousHealth().positive,
                "reset-animation": !previousHealth().show,
            }} onClick={() => setShow(show => !show)} style={{...caerenic(state().caerenic.active, state().isStealth) as any, left: settings().specials.length ? "37.25vw" : "31.5vw", border: `1mm groove ${borderColor(state()?.playerBlessing)}`}}>
            <img src={state()?.weapons?.[0]?.imgUrl} alt={state()?.weapons?.[0]?.name} style={{ "margin": "2.5%" }} />
        </div>
        <Show when={state().stalwart.active}>
        <div class={`combatUiShield ${state().stalwart.active ? "super-in" : "superfade-out"}`} onClick={() => setShieldShow(shieldShow => !shieldShow)} 
        style={{ ...itemStyle(state()?.player?.shield?.rarity as string), ...stalwart(state().caerenic.active, state().isStealth), left: settings().specials.length ? "43vw" : "37.25vw", border: `1mm groove ${getRarityColor(ascean().shield?.rarity as string)}` }}>
            <img src={state()?.player?.shield.imgUrl} alt={state()?.player?.shield.name} style={{transform: `[{ rotate: "-45deg" }, { scale: 0.875 }]` }} />
        </div>
        </Show>
        <Show when={state().playerEffects.length > 0}>
        <div class="combatEffects" style={{ left: "-3vw", top: "15vh", "height": "14vh", width: "auto", transform: "scale(0.75)" }}>
            <For each={state().playerEffects}>{(effect) => ( 
                <PrayerEffects combat={state} effect={effect} enemy={false} game={game} show={prayerShow} setShow={setPrayerShow} setEffect={setEffect as Setter<StatusEffect>} /> 
            )}</For>
        </div>
        </Show>
        
        {/* <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "0vw" }} onClick={() => (instance.scene as Play).experienceManager.testExperience()}>
            <div style={{ color: "#fdf6d8", "font-size": "0.75rem" }}>Test Experience</div>
        </button> */}
        
        {/* <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "0vw" }} onClick={() => {
            EventBus.emit("update-ascean", { ...ascean(), experience: ascean().experience + 100 });
            (instance.scene as Play).experienceManager.testExperience();
        }}>
            <div style={{ color: "#fdf6d8", "font-size": "0.75rem" }}>Gain Experience</div>
        </button> */}

        <Show when={state().isStealth && state().computer}> 
            <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "0vw" }} onClick={() => disengage()}>
                <div style={{ color: "#fdf6d8", "font-size": "0.75rem" }}>Disengage</div>
            </button>
            <Show when={state().newComputerHealth > 0 && touching().includes(state().enemyID)}>
                <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "10vw" }} onClick={checkPickpocket}>
                    <div style={{ color: "#fdf6d8", "font-size": "0.75rem" }}>Steal</div>
                </button>
            </Show>
        </Show>
        <Show when={lockpick().interacting && canLockpick()}>
            <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "17.5vw" }} onClick={() => setLockpicking(true)}>
                <div style={{ color: "#fdf6d8", "font-size": "0.75rem" }}>Lockpick</div>
            </button>
        </Show>
        <Show when={thrownNet()}>
            <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "17.5vw" }} onClick={() => EventBus.emit("retrieve-net")}>
                <div style={{ "font-size":"0.75rem" }}>Retrieve Net</div>
            </button>
        </Show>
        <Show when={state().enemyID && state().newComputerHealth === 0 && !thrownNet() && hasNet()}>
            <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "17.5vw" }} onClick={() => EventBus.emit("throw-net")}>
                <div style={{ "font-size":"0.75rem" }}>Throw Net</div>
            </button>
        </Show>
        {/* <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "0.5vw" }}>
            <div style={{ "font-size": "0.75rem" }} onClick={() => addSpecial(settings, "Consume")}>Add Special</div>
        </button>
        <button class="disengage highlight combatUiAnimation" style={{ top: "15vh", left: "12.5vw" }}>
            <div style={{ "font-size": "0.75rem" }} onClick={() => addStance(settings, "caerenic")}>Add Stance</div>
        </button> */}
        {/* <Show when={(instance.scene?.scene.key === "Arena" || instance.scene?.scene.key === "Gauntlet") && state().computer}>
            <button class="disengage highlight" onClick={engage} style={{ top: "15vh", left: "25vw" }}>
                Engage
            </button>
        </Show> */}
        {arenas()}
        <Portal>
            <Show when={show()}>
            <div class="modal" classList={{
                "tutorial-highlight": exception(),
            }} onClick={() => setShow(!show())}>
                <ItemModal item={state().weapons[0]} stalwart={false} caerenic={state().caerenic.active} prayer={prayer} talents={talents} />
            </div>
            </Show>
            <Show when={shieldShow()}>
            <div class="modal" classList={{
                "tutorial-highlight": exception(),
            }} onClick={() => setShieldShow(!shieldShow())}>
                <ItemModal item={state()?.player?.shield} stalwart={state().stalwart.active} caerenic={false} talents={talents} />
            </div>
            </Show>
            <Show when={prayerShow()}>
                <PrayerModal prayer={effect as Accessor<StatusEffect>} show={prayerShow} setShow={setPrayerShow} />
            </Show>
            <Show when={staminaShow()}>
            <div class="modal" classList={{
                "tutorial-highlight": exception(),
            }} onClick={() => setStaminaShow(!staminaShow())}>
                <StaminaModal setShow={setStaminaShow} settings={settings} />
            </div>
            </Show>
            <Show when={graceShow()}>
            <div class="modal" classList={{
                "tutorial-highlight": exception(),
            }} onClick={() => setGraceShow(!graceShow())}>
                <GraceModal setShow={setGraceShow} settings={settings} />
            </div>
            </Show>
            <Show when={lockpicking()}>
                <Lockpicking ascean={ascean} game={game} lockpick={lockpick} settings={settings} setLockpicking={setLockpicking} instance={instance} />
            </Show>
            <Show when={pickpocketItems().length > 0 && showPickpocketItems()}>
                <div class="modal">
                <div class="border" style={{ display: "inline-block", position: "absolute", height: "90%", width: "35%", left: "32.5%", top: "5%", "z-index": 6 }}>
                    <div class="center creature-heading" style={{ height: "90%" }}>
                        {/* overflow: "scroll", "scrollbar-width": "none" */}
                        <h1 style={{margin:"5%"}}>Pickpocketing</h1>
                        <h2 class="wrap" style={{margin:"5% auto"}}>You are speculating on what prospective items are on or near their person. Are you crafty enough to steal these items of consequence?</h2>
                        <For each={pickpocketItems()}>{(item) => (
                            <PickpocketLoot item={item} setShow={setShowPickpocket} setHighlight={setHighlight} steal={steal} />
                        )}</For>
                    </div>
                </div>
                <button class="highlight cornerBR" onClick={() => setShowPickpocketItems(false)} style={{color:"red"}}>X</button>
                </div>
            </Show>
            <Show when={stealing().stealing}>
                <Steal ascean={ascean} combat={state} game={game} settings={settings} stealing={stealing} setStealing={setStealing} setItems={setPickpocketItems} setShowPickpocket={setShowPickpocketItems} />
            </Show>
            <Show when={showPickpocket() && highlight()}>
                <div class="modal" classList={{
                    "tutorial-highlight": exception(),
                }} onClick={() => setHighlight(undefined)}>
                    <ItemModal item={highlight()} caerenic={false} stalwart={false} /> 
                </div>
            </Show>
        </Portal>

        {/* <button class="disengage highlight combatUiAnimation" onClick={createPrayer} style={{ top: "15vh", left: "30vw" }}>
            <div style={{ color: "#fdf6d8", "font-size": "0.75rem" }}>
                Create Prayer
            </div>
        </button> */}
    </div>;
};