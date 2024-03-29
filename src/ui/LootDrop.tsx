import { Accessor, Setter } from "solid-js";
import Equipment from "../models/equipment";
import { getRarityColor } from "../utility/styling";
import { EventBus } from "../game/EventBus";
import { updateInventory } from "../assets/db/db";
import Ascean from "../models/ascean";

interface Props {
    ascean: Accessor<Ascean>;
    lootDrop: Equipment;
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
    setLootDrop: Setter<Equipment | undefined>;
};

export default function LootDrop({ ascean, lootDrop, show, setShow, setLootDrop }: Props) {
    const article: string = ['a', 'e', 'i', 'o', 'u'].includes(lootDrop.type[0].toLowerCase()) ? 'an' : 'a';

    async function saveItem(): Promise<void> {
        try {
            console.log(`Saving ${lootDrop.name} to inventory`);
            const data = { ascean, lootDrop };
            await savetoInventory(data);
            EventBus.emit('add-item', [lootDrop]);
            EventBus.emit('remove-lootdrop', lootDrop._id);    
            EventBus.emit('destroy-lootdrop', lootDrop._id);
        } catch (err) {
            console.error(err);
        };
    };

    async function savetoInventory(data: any): Promise<void> {
        const idInventory: string[] = Array.from(new Set (ascean().inventory.map((item: Equipment) => item._id))) as string[];
        idInventory.push(data.lootDrop._id);
        await updateInventory(ascean()._id, idInventory);
    };
    
    const handleLootDrop = (): void => {
        console.log('LootDrop', lootDrop, 'show', !show());
        setShow(!show());
        setLootDrop(lootDrop);
    };

    return (
        <div style={{ width: '75%', display: 'inline-block', margin: '3%' }}>
        <div style={{ color: getRarityColor(lootDrop.rarity as string) }}>This appears to be {article} {lootDrop?.type}</div>
        <button class='center' onClick={handleLootDrop} style={{ border: `0.15em solid ${getRarityColor(lootDrop.rarity as string)}`, 'margin-top': '1em', 'background-color': '#000' }}>
            <img src={lootDrop.imgUrl} alt={lootDrop.name} />
        </button>
        <div>
            <button class='highlight' onClick={() => saveItem()}>
                <div class='gold'>Take the {lootDrop?.name}?</div>
            </button>
        </div>
        </div>
    );
};