import { font, getRarityColor } from "../utility/styling"
import { createMemo, createSignal, Setter, Show } from "solid-js";
import { dimensions } from "../utility/dimensions";
import { Item } from "../models/item";
import { EventBus } from "../game/EventBus";
import { Form } from "solid-bootstrap";

export function SpecialItemPrompt({ setPrompt }: { setPrompt: Setter<boolean>; }) {
    const [marker, setMarker] = createSignal({ title: "", content: "" });
    const complete = createMemo(() => {
        return marker().title !== "" && marker().content !== "";
    });
    function completeMarker() {
        EventBus.emit("set-marker-prompt", marker());
        setPrompt(false);
    };
    return <div class="modal" style={{ "z-index": 99 }}>
        <div class="border superCenter" style={{ height: "90%", width: "50%", top: "47.5%" }}>
            <div class="creature-heading center fadeIn">
                <h1 style={{ "margin-top": "5%" }}>Create Marker</h1>
                <h3 class="gold">Title <Form.Control style={font("1rem", "black")} type="text" placeholder="Enter Title Here" value={marker().title} oninput={(e) => setMarker({ ...marker(), title: e.currentTarget.value})} /></h3>
                <h2>Content <Form.Control size="lg" style={font("1rem", "black")} type="text" placeholder="Enter Content Here" value={marker().content} oninput={(e) => setMarker({ ...marker(), content: e.currentTarget.value})} /></h2>
                <div class="border wrap">
                    <h3>Preview</h3>
                    <h4 style={{ "text-align":"left", "margin-left":"5%" }}>
                        <span class="gold">{marker().title}</span><br /><span>{marker().content}</span>
                    </h4>
                </div>
                <Show when={complete()}>
                    <button class="highlight animate cornerBL" onClick={completeMarker} style={{...font("1rem"), bottom: "1vh", left: "0.5vw"}}>Complete</button>
                </Show>
                <button class="highlight cornerBR" onClick={() => setPrompt(false)} style={{...font("1rem", "red"), bottom: "1vh", right: "0.5vw"}}>Cancel</button>
            </div>
        </div>
    </div>;
};

interface Props {
    item: Item;
    possess?: boolean;
};

export default function SpecialItemModal({ item, possess }: Props) {
    if (!item) return undefined;
    const dims = dimensions();
    const poly = dims.WIDTH * 0.45;
    const scale = dims.WIDTH / 800;
    const empty = item.name.includes("Empty");
    const name = item.name.includes("Starter") ? ( item.name.split(" ")[0] + " " + item.name.split(" ")[1] ) : ( item.name );
    const centerImage = dims.ORIENTATION === "landscape" ? (name.length > 18 ? "45%" : name.length > 10 ? "7.5%" : "15%") : (name.length > 13 ? "40%" : name.length > 10 ? "5%" : "10%");
    const styling = { "font-size": "1.25rem", margin: "2% auto" };
    return <div class="border superCenter" style={{ width: dims.ORIENTATION === "landscape" ? "50%" : "75%", "top": "48%", "z-index": 99, border: "thick ridge" }}> 
        <div class="wrap" style={{ height: "100%" }}>
            <div class="creature-heading" style={{ width: "100%"}}>
                <h1 style={ empty ? { "text-align": "center", margin: "24px 0" } : { "justify-content": "space-evenly", margin: "24px 0 16px" }}>{name} 
                <Show when={!empty}>
                <span style={{ transform: `scale(${scale})`, float: "right", "margin-right": centerImage }}>
                    <img src={item.imgUrl} alt={item.name} />
                </span>
                </Show>
                </h1>
            </div>
            <Show when={!empty}>
            <svg height="5" width="100%" class="tapered-rule mt-2">
                <polyline points={`0,0 ${poly},2.5 0,5`}></polyline>
            </svg>
            <div class="center">
                <div style={styling}>{item.type}</div>
                <div style={{...styling, "font-size": "1rem"}}>{item.description}</div>

                <div style={{...styling, "font-size": "1rem"}}>
                    Quantity: <span class="gold">{item.quantity}</span> |
                    Value: <span class="gold">{item.value * item.quantity}</span> | 
                    Weight: <span class="gold">{item.weight * item.quantity}</span>
                </div>

                <div style={{ color: getRarityColor(item?.rarity as string), "font-size": "1.5em", "margin": "2% auto 4%" }}>
                    {item?.rarity}
                </div>
                <Show when={item.systemTrigger && possess}>
                    <button class="highlight" onClick={() => EventBus.emit("use-special-item", item.systemTrigger)} style={{ color: "gold", "font-size": "1.25em", "margin": "2% auto 4%" }}>Use {item.name}</button>
                </Show>
            </div> 
            </Show>
        </div>
    </div>;
};