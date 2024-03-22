import { Accessor, createEffect, createSignal } from "solid-js";
import ItemModal from "../components/ItemModal";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { getRarityColor, itemStyle } from "../utility/styling";
import { EventBus } from "../game/EventBus";
import { GameState } from "../stores/game";
// import { updateInventory } from "../assets/db/db";
import { Show } from "solid-js";

interface Props {
    lootDrop: Equipment;
    ascean: Accessor<Ascean>;
    gameState: Accessor<GameState>;
};

export default function LootDrop({ lootDrop, ascean, gameState }: Props) {
    const [show, setShow] = createSignal<boolean>(false);
    const article: string = ['a', 'e', 'i', 'o', 'u'].includes(lootDrop.name[0].toLowerCase()) ? 'an' : 'a';

    createEffect(() => {
        console.log(lootDrop, 'lootDrop');
    }, [lootDrop]);

    async function saveItem(): Promise<void> {
        try {
            console.log(`Saving ${lootDrop.name} to inventory`);
            const data = { ascean, lootDrop };
            await saveToInventory(data);
            clearLootDrop(lootDrop._id as string);
            EventBus.emit('request-inventory');
            EventBus.emit('destroy-lootdrop', lootDrop._id);
        } catch (err) {
            console.error(err);
        };
    };

    function clearLootDrop(id: string): void {
        let lootDrops = gameState().lootDrops.filter((drop: Equipment) => drop._id !== id);
        console.log(lootDrops, 'updated lootDrops');
        EventBus.emit('update-lootdrops', lootDrops);    
    };

    async function saveToInventory(data: { ascean: Accessor<Ascean>, lootDrop: Equipment }) {
        // const flattenedInventory = Array.from(new Set(ascean().inventory.map((item: Equipment) => item._id)));
        let flattenedInventory = ascean().inventory.map((item: Equipment) => item._id);
        flattenedInventory.push(data.lootDrop._id);
        // flattedInventory.push(data.lootDrop._id);
        // const inventory = Array.from(new Set(flattedInventory));
        // What does Array.from(set) do? It creates a new array from the set. What does the set do? It removes duplicates.
        // Is it a clean way of getting a unique array? Yes. Is it the only way? No. What are other ways?
        // const inventory = [...new Set(flattedInventory)];
        // const inventory = Array.from(new Set(flattedInventory));
        // So a set is an array ? No, a set is a collection of unique values. How do you create a set from an array?
        // const set = new Set(flattedInventory);
        // How would you create an array from a set? const array = Array.from(set);
        // Is it either more computationally expensive or slower? No, it's faster and less computationally expensive.
        // Why? Because it's a native method that's been optimized for performance.
        console.log(flattenedInventory, 'flattenedInventory');
        // await updateInventory(ascean()._id, flattenedInventory);
        // TODO:FIXME: This is where the updateInventory function would be called.
    };

    return (
        <div>
            <div style={{ color: getRarityColor(lootDrop.rarity as string) }}>This appears to be {article} {lootDrop?.name}</div>
                <button class='center' onClick={() => setShow(!show)} style={itemStyle(getRarityColor(lootDrop.rarity as string))}>
                    {/* <Image source={lootDropImage} alt={lootDrop.name} style={[styles.center, { maxWidth: '30%', marginLeft: '40%' },
                    itemStyle(getRarityColor(lootDrop.rarity)), border(getRarityColor(lootDrop.rarity), 1.5)]} /> */}
                <img src={lootDrop.imgUrl} alt={lootDrop.name} />
                </button>
                <button onClick={() => saveItem()}>
                    <div class='gold'>Take {article} {lootDrop?.name}</div>
                </button>
                <Show when={show()}>
                    <div class='modal' onClick={() => setShow(!show())}>
                        <ItemModal item={lootDrop} stalwart={false} caerenic={false} />
                    </div>
                </Show>
        </div>
    );
};