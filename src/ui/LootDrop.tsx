import { Setter, Show } from "solid-js";
import Equipment from "../models/equipment";
import { getRarityColor } from "../utility/styling";
import { EventBus } from "../game/EventBus";
interface Props {
    lootDrop: Equipment;
    setShow: Setter<boolean>;
    setLootDrop: Setter<Equipment | undefined>;
    x?: boolean;
};
export default function LootDrop({ lootDrop, setShow, setLootDrop, x = true }: Props) {
    const article: string = ["a", "e", "i", "o", "u"].includes(lootDrop.type[0].toLowerCase()) ? "an" : "a";
    const excess: string = lootDrop.type.includes("-") ? "piece of" : "";
    async function saveItem(): Promise<void> {
        try {
            EventBus.emit("add-item", [lootDrop]);
            EventBus.emit("remove-lootdrop", lootDrop._id);    
            EventBus.emit("destroy-lootdrop", lootDrop._id);
        } catch (err) {
            console.error(err);
        };
    };
    const handleLootDrop = (): void => {
        setLootDrop(lootDrop);
        setShow(true);
    };
    return <div style={{ width: "75%", display: "inline-block", margin: "2.5%" }}>
        <div style={{ color: getRarityColor(lootDrop.rarity as string) }}>This appears to be {article} {excess} {lootDrop?.type}</div>
        <button class="center" onClick={handleLootDrop} style={{ border: `0.15em solid ${getRarityColor(lootDrop.rarity as string)}`, "margin": "1em 0 0.5em", "background-color": "#000" }}>
            <img src={lootDrop.imgUrl} alt={lootDrop.name} />
        </button>
        <div>
            <button class="highlight" onClick={() => saveItem()}>
                <div class="gold">Take the {lootDrop?.name}?</div>
            </button>
        </div>
        <Show when={x}>
            <div class="highlight cornerBR" onClick={() => EventBus.emit("blend-game", { showLoot: false })} style={{ color: "red" }}>X</div>
        </Show>
    </div>;
};