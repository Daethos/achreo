import { Accessor, Setter } from "solid-js";
import Equipment from "../models/equipment";
import { getRarityColor } from "../utility/styling";
import { EventBus } from "../game/EventBus";
// import { updateInventory } from "../assets/db/db";

interface Props {
    lootDrop: Equipment;
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
    setLootDrop: Setter<Equipment | undefined>;
};

export default function LootDrop({ lootDrop, show, setShow, setLootDrop }: Props) {
    const article: string = ['a', 'e', 'i', 'o', 'u'].includes(lootDrop.type[0].toLowerCase()) ? 'an' : 'a';

    function saveItem(): void {
        try {
            console.log(`Saving ${lootDrop.name} to inventory`);
            EventBus.emit('add-item', [lootDrop]);
            EventBus.emit('remove-lootdrop', lootDrop._id);    
            EventBus.emit('destroy-lootdrop', lootDrop._id);
        } catch (err) {
            console.error(err);
        };
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