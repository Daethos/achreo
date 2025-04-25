import { Accessor, createSignal, For, JSX, Setter, Show } from "solid-js";
import { ARENA_ENEMY, fetchPartyPotential } from "../utility/enemy";
import Ascean from "../models/ascean";
import Currency from "../utility/Currency";
import { IRefPhaserGame } from "../game/PhaserGame";
import { fullStyle, masteryColor, partialStyle } from "../utility/styling";
import Settings from "../models/settings";
import { EventBus } from "../game/EventBus";
import AsceanImageCard from "../components/AsceanImageCard";
import Equipment from "../models/equipment";
import ItemModal from "../components/ItemModal";
const selectors = {
    0.5: { prev: 0.5, next: 1 },
    1: { prev: 0.5, next: 2 },
    2: { prev: 1, next: 4 },
    4: { prev: 2, next: 6 },
    6: { prev: 4, next: 8 },
    8: { prev: 6, next: 8 },
};

export default function Registry({ show, ascean, setShow, settings, instance }: { ascean: Accessor<Ascean>; show: Accessor<boolean>; setShow: Setter<boolean>; settings: Accessor<Settings>; instance: IRefPhaserGame }) {
    const [selector, setSelector] = createSignal<ARENA_ENEMY>({ level: Math.min((ascean().level % 2 === 0 ? ascean().level : ascean().level + 1), 8), mastery: "constitution", id: "" });
    const [potential, setPotential] = createSignal<any[]>([]);
    const [party, setParty] = createSignal<any>(instance?.game?.registry.get("party"));
    const [total, setTotal] = createSignal<number>(party().length);
    const [addShow, setAddShow] = createSignal<{show:boolean,party:any}>({show:false,party:undefined});
    const [removeShow, setRemoveShow] = createSignal<{show:boolean,party:any}>({show:false,party:undefined});
    const [itemShow, setItemShow] = createSignal<boolean>(false);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [view, setView] = createSignal<Ascean | undefined>(undefined);

    function addToParty(party: any) {
        console.log(party, "Adding To Party");
        EventBus.emit("add-party", {name:party.name,level:party.level});
        setTotal(prev => prev + 1);
        setTimeout(() => {
            setParty(instance?.game?.registry.get("party"));
        }, 1000);
    };

    function removeFromParty(party: any) {
        console.log(party, "Removing From Party");
        // EventBus.emit("remove-party", party);
        // setTotal(prev => prev - 1);
    };

    function selectOpponent(type: string, value: number | string) {
        setSelector({
            ...selector(),
            [type]: value
        });
        // Fetch The Potential Party Members
        const res: any = fetchPartyPotential(selector().level, selector().mastery);
        console.log(res, "Result of fetching potential party members");
        setPotential(res);
        console.log(potential(), "New Potential!");
    };

    return <Show when={show()}>
        <div class="modal" style={{ }}>
            <div class="left" style={{...partialStyle(ascean().mastery), left: "1%"}}>
                <div class="creature-heading center">
                    <h1>Current Party ({party().length})</h1>
                    <For each={party()}>{(party) => {
                        return (
                            <div class="textGlow" style={{ color: masteryColor(party.ascean.mastery), "--glow-color":masteryColor(party.ascean.mastery), margin: 0 }}>{party.ascean.name} | ({party.ascean.level}) | {party.ascean.mastery.charAt(0).toUpperCase() + party.ascean.mastery.slice(1)} <button class="highlight" onClick={() => {setView(party.ascean); setRemoveShow({show:true,party:party.ascean});}} style={{ animation: "" }}>View</button></div>
                        )
                    }}</For>
                    {/* <p style={{ color: "gold", "font-size": "0.75em", "margin": "0" }}>{party().length}</p> */}
                    <h1>Potential Recruits</h1>
                    <For each={potential()}>{(party) => {
                        return (
                            <div class="textGlow" style={{ color: masteryColor(party.mastery), "--glow-color":masteryColor(party.mastery), margin: 0 }}>{party.name} <button class="highlight" disabled={total() === 3} onClick={() => {setView(party); setAddShow({show:true,party});}} style={{ animation: "", color: total() === 3 ? "red" : "" }}>View</button></div>
                        )
                        // | ({party.level}) | {party.mastery.charAt(0).toUpperCase() + party.mastery.slice(1)}
                    }}</For>
                    <div>
                    </div>
                </div>
            </div>
            <div class="right" style={{...partialStyle(ascean().mastery), left: "50.5%"}}>
                <div class="creature-heading center">
                    <p style={{ color: "gold", margin: "8px 0 ", "font-size": "1.4em", padding: "0" }}>Currency</p>
                    <Currency ascean={ascean} />
                    <div style={{ display: "grid", "grid-template-columns": "repeat(2, 50%)" }}>
                        <div>
                            <p style={{ color: "gold", margin: "8px 0", "font-size": "1.4em" }}>Opponent Level ({selector().level}) <br /> 
                                <span style={{ color: "#fdf6d8", "font-size": "0.75em" }}>
                                    Prev ({selectors[selector().level as keyof typeof selectors].prev}) |  Next ({selectors[selector().level as keyof typeof selectors].next}) 
                                </span>
                            </p>
                            <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("level", selectors[selector().level as keyof typeof selectors].prev)}>-</button>
                            <button class="highlight" style={{ margin: "1%" }} onClick={() => selectOpponent("level", Math.min(Math.min((ascean().level % 2 === 0 ? ascean().level : ascean().level - 1), 8), selectors[selector().level as keyof typeof selectors].next))}>+</button>
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
                </div>
            </div>
            <button class="highlight cornerBR" onClick={() => setShow(false)} style={{ color: "red" }}>X</button>
        </div>
        <Show when={addShow().show}>
            <div class="modal" style={{ }}>
                <div class="center creature-heading" style={fullStyle(ascean().mastery)}>
                    <p style={{ color: "gold" }}>Add {addShow().party.name}?</p>
                    <h2>{view()?.description}</h2>
                    <p>Level: <span class="gold">{view()?.level}</span> | Mastery: <span class="gold">{(view()?.mastery as string)?.charAt(0).toUpperCase() + view()?.mastery?.slice(1)}</span></p>
                    
                    <AsceanImageCard ascean={view as Accessor<Ascean>} show={itemShow} setShow={setItemShow} setEquipment={setEquipment} />
                </div>
                <button class="highlight cornerTR animate" onClick={() => {setRemoveShow({show:false,party:undefined}); setView(undefined);}}>Add</button>
                <button class="highlight cornerBR" onClick={() => {setAddShow({show:false,party:undefined}); setView(undefined)}} style={{ color: "red" }}>Cancel</button>
            </div>
        </Show>
        <Show when={removeShow().show}>
            <div class="modal" style={{ }}>
                <div class="center creature-heading" style={fullStyle(ascean().mastery)}>
                    <p style={{ color: "red", "font-size":"1.5em", margin: "2% auto" }}>Remove {view()?.name}?</p>
                    <h2>{view()?.description}</h2>
                    <p>Level: <span class="gold">{view()?.level}</span> | Mastery: <span class="gold">{(view()?.mastery as string)?.charAt(0).toUpperCase() + view()?.mastery?.slice(1)}</span></p>
                    <AsceanImageCard ascean={view as Accessor<Ascean>} show={itemShow} setShow={setItemShow} setEquipment={setEquipment} />
                </div>
                <button class="highlight cornerTR animate" onClick={() => {setRemoveShow({show:false,party:undefined}); setView(undefined);}}>Remove</button>
                <button class="highlight cornerBR" onClick={() => {setRemoveShow({show:false,party:undefined}); setView(undefined);}} style={{ color: "red" }}>Cancel</button>
            </div>
        </Show>
        <Show when={itemShow()}>
            <div class="modal" onClick={() => setItemShow(false)}>
                <ItemModal item={equipment()} stalwart={false} caerenic={false} /> 
            </div>
        </Show>
    </Show>
};