import Inventory from "./Inventory";
import { Accessor, createEffect, createSignal, For, Setter } from 'solid-js';
import { EventBus } from "../game/EventBus";
import { useResizeListener } from "../utility/dimensions";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";

interface Props {
    ascean: Accessor<Ascean>;
    setHighlighted: Setter<{ item: Equipment | undefined; comparing: boolean; type: string }>;
    highlighted: Accessor<{ item: Equipment | undefined; comparing: boolean; type: string }>;
    setRingCompared: Setter<string>;
    setWeaponCompared: Setter<string>;
    dragAndDropInventory: Accessor<Equipment[]>;
    setDragAndDropInventory: Setter<Equipment[]>;
    inventoryType: Accessor<string>;
    setInventoryType: Setter<string>;
};

export default function InventoryPouch({ ascean, inventoryType, setInventoryType, setHighlighted, highlighted, setRingCompared, setWeaponCompared, dragAndDropInventory, setDragAndDropInventory }: Props) {
    const [scaleImage, setScaleImage] = createSignal({ id: '', scale: 48 });
    const [inventorySwap, setInventorySwap] = createSignal({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
    const dimensions = useResizeListener();

    createEffect(() => {
        if (inventorySwap().start.id === null || inventorySwap().end.id === null) return;
        if (inventorySwap().start.id === inventorySwap().end.id) {
            setInventorySwap({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
            return;
        };
        handleInventoryDrop();
    });

    function handleInventoryDrop() {
        const { start, end } = inventorySwap();
        let copy: Equipment[] = Array.from(dragAndDropInventory());
        const [reorderedItem] = copy.splice(start.index, 1);
        copy.splice(end.index, 0, reorderedItem);
        // copy[start.index] = drop; // ForPure Swap
        console.log(copy, 'Copy');
        setDragAndDropInventory(copy);
        setInventorySwap({ start: { id: null, index: -1 }, end: { id: null, index: -1 } }); 
        EventBus.emit('refresh-inventory', copy);
        EventBus.emit('equip-sound');
    }; 

    return ( 
        <div class='playerInventoryBag'>  
            <For each={dragAndDropInventory()}>{(item, index) => {
                if (item === undefined || item === null) return;
                return (
                    <div style={dimensions().ORIENTATION === 'landscape' ? { margin: '5.5%' } : { margin: '2.5%' }}>
                        <Inventory ascean={ascean} index={index()} setRingCompared={setRingCompared} setWeaponCompared={setWeaponCompared} 
                            highlighted={highlighted} setHighlighted={setHighlighted} pouch={dragAndDropInventory} inventory={item} scaleImage={scaleImage} setScaleImage={setScaleImage} 
                            setInventoryType={setInventoryType} inventoryType={inventoryType} />
                    </div>
                );
            }}</For>
        </div>
    );
};