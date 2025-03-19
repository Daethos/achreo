import { Accessor, createEffect, createSignal, Setter, Show } from "solid-js";
import { Combat } from "../stores/combat";
import Settings from "../models/settings";
import { EventBus } from "../game/EventBus";
export default function CombatText({ settings, combat, combatHistory, partyHistory, partyShow, editShow, setEditShow }: { settings: Accessor<Settings>; combat: Accessor<Combat>, combatHistory: Accessor<string>, partyHistory: Accessor<string>, partyShow: Accessor<boolean>, editShow: Accessor<boolean>, setEditShow: Setter<boolean> }) {
    const [edit, setEdit] = createSignal({
        size: settings()?.combatText?.size || "1em",
        top: settings()?.combatText?.top || "40vh",
        left: settings()?.combatText?.left || "20vw",
        height: settings()?.combatText?.height || "50vh",
        width: settings()?.combatText?.width || "60vw",
    });
    createEffect(() => {
        if (!settings().combatText) return;
        setEdit({...settings().combatText});
    });
    function editCombatText(key: string, value: string): void {
        if (value === "NaNem") value = "1em"
        const update = {
            ...settings(),
            combatText: {
                ...edit(),
                [key]: value
            }
        };
        EventBus.emit("save-settings", update);
    };
    return <div>
        <div class="combatText" style={{...edit(), "border": "0.1em solid #FFC700", "border-radius": "0.25em", "box-shadow": "0 0 0.5em #FFC700"}}>
        <div style={{ "text-wrap": "balance", margin: "3%" }}> 
            <Show when={partyShow()} fallback={
                <div style={{ "font-size": edit()?.size, "z-index": 1 }} innerHTML={combatHistory()} />
            }>
                <div style={{ "font-size": edit()?.size, "z-index": 1 }} innerHTML={partyHistory()} />
            </Show>
            <div class="center creature-heading">
                {combat().combatTimer && <p class="gold" style={{ "z-index": 1, "font-size": "0.75em" }}>Combat Timer: {combat().combatTimer}</p>}
            </div>
        </div> 
        </div>
        <Show when={editShow()}>
            <div class="modal">
            <div class="border creature-heading center superCenter" style={{ padding: "2.5%", width: "30vw", "font-size": "0.75em" }}>
                <h1>Size</h1>
                <button class="highlight" onClick={() => editCombatText("size", 
                    `${Math.max(Number(edit().size.split("em")[0]) - 0.25, 0.25)}em`)}>-</button>
                <span style={{ margin: "0 10%" }}>
                {edit().size.split("em")[0]}em
                </span>
                <button class="highlight" onClick={() => editCombatText("size", 
                    `${Math.min(Number(edit().size.split("em")[0]) + 0.25, 3)}em`
                )}>+</button>
                <h1>Top</h1>
                <button class="highlight" onClick={() => editCombatText("top", 
                    `${Math.max(Number(edit().top.split("vh")[0]) - 1, 0)}vh`)}>-</button>
                <span style={{ margin: "0 10%" }}>
                {edit().top.split("vh")[0]}%
                </span>
                <button class="highlight" onClick={() => editCombatText("top", 
                    `${Math.min(Number(edit().top.split("vh")[0]) + 1, 100)}vh`
                )}>+</button>
                <h1>Left</h1>
                <button class="highlight" onClick={() => editCombatText("left", 
                    `${Math.max(Number(edit().left.split("vw")[0]) - 1, 0)}vw`
                )}>-</button>
                <span style={{ margin: "0 10%" }}>
                {edit().left.split("vw")[0]}%
                </span>
                <button class="highlight" onClick={() => editCombatText("left", 
                    `${Math.min(Number(edit().left.split("vw")[0]) + 1, 100)}vw`
                )}>+</button>
                <h1>Height</h1>
                <button class="highlight" onClick={() => editCombatText("height", 
                    `${Math.max(Number(edit().height.split("vh")[0]) - 1, 10)}vh`
                )}>-</button>
                <span style={{ margin: "0 10%" }}>
                {edit().height.split("vh")[0]}%
                </span>
                <button class="highlight" onClick={() => editCombatText("height", 
                    `${Math.min(Number(edit().height.split("vh")[0]) + 1, 100)}vh`
                )}>+</button>
                <h1>Width</h1>
                <button class="highlight" onClick={() => editCombatText("width", 
                    `${Math.max(Number(edit().width.split("vw")[0]) - 1, 10)}vw`
                )}>-</button>
                <span style={{ margin: "0 10%" }}>
                {edit().width.split("vw")[0]}%
                </span>
                <button class="highlight" onClick={() => editCombatText("width", 
                    `${Math.min(Number(edit().width.split("vw")[0]) + 1, 100)}vw`
                )}>+</button>
            <button class="highlight cornerTR" style={{ color: "red" }} onClick={() => setEditShow(false)}>X</button>
            </div>
            </div>
        </Show>
    </div>;
};