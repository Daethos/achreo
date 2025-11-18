import { getRarityColor } from "../utility/styling"
import { Show } from "solid-js";
import { dimensions } from "../utility/dimensions";
import { Item } from "../models/item";

interface Props {
    item: Item;
};

export default function SpecialItemModal({ item }: Props) {
    console.log({ item });
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
            </div> 
            </Show>
        </div>
    </div>;
};