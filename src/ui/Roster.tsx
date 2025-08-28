import { Accessor, createSignal, For, Match, onMount, Setter, Show, Switch } from "solid-js";
import { ARENA_ENEMY, fetchArena } from "../utility/enemy";
import Ascean from "../models/ascean";
import { EventBus } from "../game/EventBus";
import { v4 as uuidv4 } from "uuid";
import Currency from "../utility/Currency";
import { FloatingLabel, Form } from "solid-bootstrap";
import { ArenaRoster } from "./BaseUI";
import { GameState } from "../stores/game";
import { IRefPhaserGame, rebalanceCurrency } from "../game/PhaserGame";
import Equipment from "../models/equipment";
import LootDrop from "./LootDrop";
import ItemModal from "../components/ItemModal";
import { roundToTwoDecimals } from "../utility/combat";
import { fullStyle, masteryColor, partialStyle } from "../utility/styling";
import Settings from "../models/settings";

export const LEVEL_SELECTOR = {
    0.5: { prev: 0.5, next: 1 },
    1: { prev: 0.5, next: 2 },
    2: { prev: 1, next: 4 },
    4: { prev: 2, next: 6 },
    6: { prev: 4, next: 8 },
    8: { prev: 6, next: 10 },
    10: { prev: 8, next: 10 },
    12: { prev: 10, next: 10 },
    14: { prev: 10, next: 10 },
    16: { prev: 10, next: 10 },
};

const ARENA = "ARENA";
const GAUNTLET = "GAUNTLET";
const UNDERGROUND = "UNDERGROUND";

type NODE = {
    [key: string]: {
        key: string;
        next: string;
        prev: string;
    };
};

const SCENE_SWITCH: NODE = {
    ARENA: {
        key:"ARENA",
        next: "GAUNTLET",
        prev: "UNDERGROUND",
    },
    GAUNTLET: {
        key:"GAUNLET",
        next: "UNDERGROUND",
        prev: "ARENA",
    },
    UNDERGROUND: {
        key:"UNDERGROUND",
        next: "ARENA",
        prev: "GAUNTLET",
    },
};

const GAUNTLET_SWITCH: NODE = {
    FREE_FOR_ALL: {
        key: "Free For All",
        next: "RANDOMIZED",
        prev: "SELECTED"
    },
    RANDOMIZED: {
        key: "Randomized",
        next: "SELECTED",
        prev: "FREE_FOR_ALL"
    },
    SELECTED: {
        key: "Selected",
        next: "FREE_FOR_ALL",
        prev: "RANDOMIZED"
    },
};

function getLevel(ascean: Accessor<Ascean>): number {
    return Math.min((ascean().level % 2 === 0 ? ascean().level : ascean().level + 1), 10);
};

export default function Roster({ arena, ascean, setArena, base, game, settings, instance }: { arena: Accessor<ArenaRoster>; ascean: Accessor<Ascean>; setArena: Setter<ArenaRoster>; base: boolean; game: Accessor<GameState>; settings: Accessor<Settings>; instance: IRefPhaserGame }) {
    const [selector, setSelector] = createSignal<ARENA_ENEMY>({ level: getLevel(ascean), mastery: "constitution", id: "" });
    const [switchScene, setSwitchScene] = createSignal<any>(ARENA);
    const [lootDrop, setLootDrop] = createSignal<Equipment | undefined>(undefined);
    const [show, setShow] = createSignal<boolean>(false);
    const [opponents, setOpponents] = createSignal<number>(1);
    const [party, setParty] = createSignal<any>(instance?.game?.registry.get("party"));

    function createArena() {
        let enemies, multiplier = 0, wager;
        switch (switchScene()) {
            case ARENA:
            case UNDERGROUND:
                enemies = fetchArena(arena().enemies);
                for (let i = 0; i < arena().enemies.length; i++) {
                    multiplier += ((arena().enemies[i].level ** 2) / (ascean().level ** 2));
                };
                if (arena().enemies.length > 1) multiplier *= ((arena().enemies.length - 1) * 1.25);
                if (party().length > 0 && arena().party) multiplier *= 1 / (1 + party().length);
                multiplier /= 2;
                wager = { ...arena().wager, multiplier };
                if (switchScene() === ARENA) {
                    EventBus.emit("alert", { header: "Arena Commencing", body: `The Eulex has begun. You have chosen to face ${arena().enemies.length} enemies of various might inside the Arena. Dae Ky'veshyr, ${ascean().name}.`, key: "Close" }); // godspeed
                    EventBus.emit("set-wager-arena", {wager, enemies, team: arena().party});
                } else {
                    EventBus.emit("alert", { header: "Underground Commencing", body: `The Eulex has begun. You have chosen to face ${arena().enemies.length} enemies of various might inside these walls. Dae Ky'veshyr, ${ascean().name}.`, key: "Close" }); // godspeed
                    EventBus.emit("set-wager-underground", {wager, enemies});
                };
                setArena({ ...arena(), show: false });
                if (!base) EventBus.emit("outside-press", "dialog");
                break;
            case GAUNTLET:
                if (GAUNTLET_SWITCH[arena().gauntlet.type].key !== "Selected") randomizedGauntlet();
                enemies = fetchArena(arena().enemies);
                for (let i = 0; i < arena().enemies.length; i++) {
                    multiplier += ((arena().enemies[i].level ** 2) / (ascean().level ** 2));
                };
                if (arena().enemies.length > 1) multiplier *= ((arena().enemies.length - 1) * 1.25);
                if (party().length > 0 && arena().party) multiplier *= 1 / (1 + party().length);
                multiplier *= arena().gauntlet.round;
                multiplier /= 2;
                wager = { ...arena().wager, multiplier };
                
                EventBus.emit("alert", { header: "Gauntlet Commencing", body: `The Ancient Eulex has begun. You have chosen to run the gauntlet. Dae Ky'veshyr, ${ascean().name}.`, key: "Close" }); // godspeed
                EventBus.emit("set-wager-gauntlet", {enemies, team: arena().party, wager});
                setArena({ ...arena(), show: false });
                if (!base) EventBus.emit("outside-press", "dialog");
                break;
        };
    };

    function mapSetting() {
        switch (switchScene()) {
            case ARENA:
                return settings().difficulty.arena ? "Arena [Manual]" : "Arena [Computer]";
            case GAUNTLET:
                return settings().difficulty.arena ? "Gauntlet [Manual]" : "Gauntlet [Computer]"
            case UNDERGROUND:
                return "Underground [Manual]";
        };
    };

    function changeGauntletMode() {
        setArena({...arena(), gauntlet: { ...arena().gauntlet, type: GAUNTLET_SWITCH[arena().gauntlet.type].next }});
    };

    function checkGauntletReady(): boolean {
        if (switchScene() !== GAUNTLET) return false;    
        return arena().gauntlet.type !== "SELECTED" ? true : arena().enemies.length > 0;
    };

    function randomizedGauntlet() {
        const range = [LEVEL_SELECTOR[selector().level as keyof typeof LEVEL_SELECTOR].prev, getLevel(ascean), LEVEL_SELECTOR[selector().level as keyof typeof LEVEL_SELECTOR].next];
        const masteries = ["constitution", "strength", "agility", "achre", "caeren", "kyosir"];
        const enemies = []
        for (let i = 0; i < opponents(); ++i) {
            const mastery = masteries[Math.floor(Math.random() * masteries.length)];
            enemies.push(mastery);    
        };
        const enemySet: ARENA_ENEMY[] = enemies.map((mastery: string) => {
            const level = range[Math.floor(Math.random() * range.length)];
            return { level, mastery } as ARENA_ENEMY;
        });
        setArena({ ...arena(), enemies: enemySet });
    };

    function opponentAdd() {
        let newEnemies = JSON.parse(JSON.stringify(arena().enemies));
        let newEnemy = { ...selector(), id: uuidv4() };
        newEnemies.push(newEnemy);
        setArena({ ...arena(), enemies: newEnemies });
    };

    function opponentRemove(enemy: ARENA_ENEMY) {
        let newEnemies = JSON.parse(JSON.stringify(arena().enemies));
        newEnemies = newEnemies.filter((ae: ARENA_ENEMY) => ae.id !== enemy.id);
        setArena({ ...arena(), enemies: newEnemies });
    };

    function selectOpponent(type: string, value: number | string) {
        setSelector({
            ...selector(),
            [type]: value
        });
    };

    function setWager(type: string, value: number) {
        setArena({
            ...arena(),
            wager: {
                ...arena().wager,
                [type]: value
            }
        });
    };
    function safe(e: any, floor: number, ceiling: number): number {
        const wager = e.currentTarget.value;
        if (wager > floor && wager <= ceiling) {
            return wager;
        };
        return 0;
    };
    function checkTeam() {
        const partyAvailable = party().length > 0;
        let team: boolean = false;
        if (partyAvailable) {
            team = switchScene() !== UNDERGROUND && partyAvailable ? !arena().party : partyAvailable;
        };
        setArena({...arena(), party: team});
    };
    function switchScenes() {
        setSwitchScene(SCENE_SWITCH[switchScene()].next);
        setArena({...arena(), map: SCENE_SWITCH[switchScene()].key});
        if (switchScene() === UNDERGROUND) checkTeam();
    };
    function clearWager() {
        let silver = ascean().currency.silver, gold = ascean().currency.gold;
        if (arena().win) {
            silver +=  (arena().wager.silver * arena().wager.multiplier);
            gold += (arena().wager.gold * arena().wager.multiplier);
        } else {
            silver -= arena().wager.silver;
            gold -= arena().wager.gold;
        };
        const currency = rebalanceCurrency({ silver, gold });
        EventBus.emit("update-currency", currency);
        setArena({ ...arena(), enemies: [], wager: { silver: 0, gold: 0, multiplier: 0 }, win: false, show: false, result: false });
        switch (switchScene()) {
            case ARENA:
                EventBus.emit("switch-arena");
                break;
            case GAUNTLET:
                EventBus.emit("switch-gauntlet");
                break;
            default: break;        
        };
    };

    function getRebalance() {
        const gold = arena().win ? roundToTwoDecimals(arena().wager.gold * arena().wager.multiplier) : -arena().wager.gold;
        const silver = arena().win ? Math.round(arena().wager.silver * arena().wager.multiplier) : -arena().wager.silver;
        return rebalanceCurrency({ silver, gold });
    };

    onMount(() => {
        setParty(instance?.game?.registry?.get("party"));
    });

    return <Show when={arena().show}>
        <div class="modal" style={{ "z-index": 99 }}>
            <Show when={arena().result} fallback={<>
                <div class="left" style={{...partialStyle(ascean().mastery), left: "1%"}}>
                    <div class="creature-heading center" >
                        <h1 style={{ margin: "8px 0" }} onClick={checkTeam}><span style={{ color: "#fdf6d8" }} >Opponent(s):</span> {arena().enemies.length} {arena().party ? "[Party]" : "[Solo]"}</h1>
                        <h1 style={{ margin: "8px 0" }}><span style={{ color: "#fdf6d8" }}>Wager:</span> {arena().wager.gold}g {arena().wager.silver}s</h1>
                        {/* settings().difficulty.arena ? "Arena [Computer]" : */}
                        <h1 style={{ margin: "8px 0" }} onClick={switchScenes}><span style={{ color: "#fdf6d8" }}>Map: </span>{mapSetting()}</h1>
                        <Show when={switchScene() === GAUNTLET}><h1 onClick={changeGauntletMode} style={{ margin: "8px 0" }}>{GAUNTLET_SWITCH[arena().gauntlet.type].key}</h1></Show>
                        <p style={{ color: "gold", "font-size": "0.75em", "margin": "0" }}>Click on Maps and/or Opponents to Switch Between Options<br /> [Note]: Player AI is available only in the Arena. <br /> If you have a party, you cannot fight [Solo] in the Underground.</p>
                        <h1 ></h1>
                        <Switch>
                            <Match when={arena().enemies.length > 0 && switchScene() !== GAUNTLET}>
                                <button class="highlight animate" onClick={createArena} style={{ "font-size": "1.25em" }}>Enter the Eulex</button>
                            </Match>
                            <Match when={checkGauntletReady()}>
                                <button class="highlight animate" onClick={createArena} style={{ "font-size": "1.25em" }}>Enter the Eulex</button>
                            </Match>
                        </Switch>
                        <For each={arena().enemies}>{(enemy) => {
                            return (
                                <div class="textGlow" style={{ color: masteryColor(enemy.mastery), "--glow-color":masteryColor(enemy.mastery), margin: 0 }}>Level {enemy.level} - {enemy.mastery.charAt(0).toUpperCase() + enemy.mastery.slice(1)} <button class="highlight" onClick={() => opponentRemove(enemy)} style={{ animation: "" }}>Remove</button></div>
                            )
                        }}</For>
                        <Show when={switchScene() === GAUNTLET}>
                            <div>
                                Rounds: {arena().gauntlet.round === 11 ? "∞" : arena().gauntlet.round}
                                <button class="highlight" onClick={() => setArena({ ...arena(), gauntlet: { ...arena().gauntlet, round: Math.max(1, arena().gauntlet.round - 1) } })}>-</button>
                                <button class="highlight" onClick={() => setArena({ ...arena(), gauntlet: { ...arena().gauntlet, round: Math.min(11, arena().gauntlet.round + 1) } })}>+</button>
                            </div>
                        </Show>
                        <Show when={switchScene() === GAUNTLET && arena().gauntlet.type !== "SELECTED"} fallback={
                            <div>
                                <button class="highlight" style={{ color: masteryColor(selector().mastery), "font-size": "1.1em" }} onClick={() => opponentAdd()}>Add ({selector().level} | {selector().mastery.charAt(0).toUpperCase() + selector().mastery.slice(1)})</button>
                            </div>
                        }>
                            <div>
                                Opponents Per Round: {opponents()}
                                <button class="highlight" onClick={() => setOpponents(Math.max(1, opponents() - 1))}>-</button>
                                <button class="highlight" onClick={() => setOpponents(Math.min(12, opponents() + 1))}>+</button>
                                <div class="border" style={{"font-size":"0.75em", padding:"3%"}}>
                                    You are setting the gauntlet to be free for all or randomized. This will summon randomized enemies each round, from level to mastery.
                                </div>
                            </div>
                        </Show>
                    </div>
                </div>
                <div class="right" style={{...partialStyle(ascean().mastery), left: "50.5%"}}>
                    <div class="creature-heading center">
                        <div style={{ display: "grid", "grid-template-columns": "repeat(2, 50%)" }}>
                            <div>
                                <p style={{ color: "gold", margin: "8px 0", "font-size": "1.4em" }}>Opponent Level ({selector().level}) <br /> 
                                    <span style={{ color: "#fdf6d8", "font-size": "0.75em" }}>
                                        Prev ({LEVEL_SELECTOR[selector().level as keyof typeof LEVEL_SELECTOR].prev}) |  Next ({LEVEL_SELECTOR[selector().level as keyof typeof LEVEL_SELECTOR].next}) 
                                    </span>
                                </p>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("level", LEVEL_SELECTOR[selector().level as keyof typeof LEVEL_SELECTOR].prev)}>-</button>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("level", LEVEL_SELECTOR[selector().level as keyof typeof LEVEL_SELECTOR].next)}>+</button>
                            </div>
                            <div style={{ "margin-bottom": "8px" }}><p style={{ color: "gold", margin: "8px 0", "font-size": "1.4em" }}>Mastery <br /> 
                                <span style={{ color: masteryColor(selector().mastery), "font-size": "0.75em" }}>
                                    ({selector().mastery.charAt(0).toUpperCase() + selector().mastery.slice(1)})
                                </span>
                            </p>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("mastery", "constitution")}>Con</button>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("mastery", "strength")}>Str</button>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("mastery", "agility")}>Agi</button>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("mastery", "achre")}>Ach</button>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("mastery", "caeren")}>Caer</button>
                                <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("mastery", "kyosir")}>Kyo</button>
                            </div>
                        </div>
                        <div style={{ display: "grid", "grid-template-columns": "repeat(2, 1fr)", "grid-template-rows": "repeat(2, 1fr)" }}>
                            <p style={{ color: "gold", margin: "8px 0 ", "font-size": "1.4em", padding: "0" }}>Currency</p>
                            <p style={{ color: "gold", margin: "8px 0 ", "font-size": "1.4em", padding: "0" }}>Wager</p>
                            <Currency ascean={ascean} />
                            <div style={{ padding: "2%", "--glow-color":"silver" }}>
                                <img src={"../assets/images/gold-full.png"} alt="Gold Stack" /> <span class="textGlow" style={{ color: "gold", "--glow-color":"gold",  }}>{arena().wager.gold}</span> <img src={"../assets/images/silver-full.png"} alt="Silver Stack" /> <span class="textGlow">{arena().wager.silver}</span>
                            </div>
                        </div>
                        <Show when={settings().desktop} fallback={
                            <div style={{ display: "grid", "grid-template-columns": "repeat(2, 1fr)", "margin-top": "2.5%" }}>
                                <div style={{ margin: "0 0 7.5%" }}>
                                    <p style={{ color: "gold", "font-size": "1.4em", margin: "8px 0" }}>Gold</p>
                                    <button class="highlight" style={{ margin: "1%" }} onClick={() => setWager("gold", 0)}>0</button>
                                    <button class="highlight" style={{ margin: "1%" }} onClick={() => setWager("gold", Math.max(0, arena().wager.gold - 1))}>-</button>
                                    <button class="highlight" style={{ margin: "1%" }} onClick={() => setWager("gold", Math.min(ascean().currency.gold, arena().wager.gold + 1))}>+</button>
                                    <button class="highlight textGlow" style={{ "--glow-color":"gold", margin: "1%" }} onClick={() => setWager("gold", ascean().currency.gold)}>{ascean().currency.gold}</button>
                                </div>
                                <div style={{ margin: "0 0 7.5%" }}>
                                    <p style={{ "font-size": "1.4em", margin: "8px 0" }}>Silver</p>
                                    <button class="highlight" style={{ margin: "1%" }} onClick={() => setWager("silver", 0)}>0</button>
                                    <button class="highlight" style={{ margin: "1%" }} onClick={() => setWager("silver", Math.max(0, arena().wager.silver - 1))}>-</button>
                                    <button class="highlight" style={{ margin: "1%" }} onClick={() => setWager("silver", Math.min(ascean().currency.silver, arena().wager.silver + 1))}>+</button>
                                    <button class="highlight textGlow" style={{ "--glow-color":"silver", margin: "1%" }} onClick={() => setWager("silver", ascean().currency.silver)}>{ascean().currency.silver}</button>
                                </div>
                            </div>
                        }>
                            <div style={{ display: "grid", "grid-template-columns": "repeat(2, 1fr)", "grid-template-rows": "repeat(2, 1fr)" }}>
                                <p style={{ color: "gold", margin: "8px 0 ", "font-size": "1.4em", padding: "0" }}>Gold</p>
                                <p style={{ margin: "8px 0 ", "font-size": "1.4em", padding: "0" }}>Silver</p>
                                <FloatingLabel controlId="floatingGold" label="" style={{ color: "black", margin: "0 auto" }}>
                                    <Form.Control oninput={(e: any) => setWager("gold", safe(e, 0, ascean().currency.gold))} type="number" placeholder={`${ascean().currency.gold}`} style={{ color: "black", "--glow-color":"silver", margin: "0 auto 0 -5%", "text-align": "right", width: "100%" }} />
                                </FloatingLabel>

                                <FloatingLabel controlId="floatingSilver" label="" style={{ color: "black", margin: "0 auto" }}>
                                    <Form.Control  oninput={(e: any) => setWager("silver", safe(e, 0, ascean().currency.silver))} type="number" placeholder={`${ascean().currency.silver}`} style={{ color: "black", "--glow-color":"silver", margin: "0 auto 0 -5%", "text-align": "right", width: "100%" }} />
                                </FloatingLabel>
                            </div>
                        </Show>
                    </div>
                </div>
                <button class="highlight cornerBR" onClick={() => setArena({ ...arena(), show: false })} style={{ color: "red", "font-size":"0.65em" }}>X</button>
            </>}>
                <div class="center creature-heading" style={fullStyle(ascean().mastery)}>
                    <p style={{ color: arena().win ?  "gold" : "red", "--glow-color": arena().win ?  "gold" : "red", margin: "12px 0", "font-size": "3.5em", "font-variant": "small-caps", animation: "flicker 1s infinite alternate" }}>{arena().win ? "Victory" : "Defeated"}</p>
                    <h1 style={{ margin: "8px 0" }}><span style={{ color: "#fdf6d8" }}>Opponent(s) Fought:</span> {arena().enemies.length}</h1>
                    <For each={arena().enemies}>{(enemy) => {
                        return (
                            <div style={{ color: masteryColor(enemy.mastery) }}>Level {enemy.level} - {enemy.mastery.charAt(0).toUpperCase() + enemy.mastery.slice(1)}</div>
                        )
                    }}</For>
                    <h1 style={{ margin: "8px 0" }}><span style={{ color: "#fdf6d8" }}>Wager:</span> <span>{arena().wager.gold}g <span style={{ color: "silver" }}>{arena().wager.silver}s</span></span></h1>
                    <p class="gold textGlow" style={{ margin: "0 auto", "font-size": "1.25em" }}>
                        {arena().wager.gold > 0 ? arena().win ? `+${getRebalance().gold}g` : `${getRebalance().gold}g` : ``} <span style={{ color: "silver" }}>{arena().wager.silver > 0 ? arena().win ? `+${getRebalance().silver}s` : `-${getRebalance().silver}s` : ``}</span>
                    </p>
                    <Show when={game().lootDrops.length > 0}>
                        <For each={game().lootDrops}>
                            {((lootDrop: Equipment) => {
                                return <LootDrop lootDrop={lootDrop} setShow={setShow} setLootDrop={setLootDrop} x={false} />;
                            })}
                        </For>
                    </Show>
                    <Show when={!arena().win}>
                        <h2 style={{ color: "", width: "75%", margin: "5% auto", "font-size": "1.25em" }}>Do not worry, {ascean().name}, there is still time to train for the Ascea. {arena().enemies.length > 1 ? `Perhaps you need to focus on fewer opponents?` : `Perhaps you need a different, or easier opponent?`}</h2>
                    </Show>
                </div>
                <Show when={show()}>
                    <div class="modal" onClick={() => setShow(!show())} style={{ "z-index": 3 }}>
                        <ItemModal item={lootDrop()} stalwart={false} caerenic={false} />
                    </div>
                </Show> 
                <button class="highlight cornerBR animate" onClick={() => clearWager()}>Settle Wager</button>
            </Show>
        </div>
    </Show>
};