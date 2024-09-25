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
    setInventoryType: Setter<string>;
};
export default function InventoryPouch({ ascean, setInventoryType, setHighlighted, highlighted, setRingCompared, setWeaponCompared, dragAndDropInventory, setDragAndDropInventory }: Props) {
    const [inventorySwap, setInventorySwap] = createSignal<any>({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
    const [prospectiveId, setProspectiveId] = createSignal<string | null>(null);
    const dimensions = useResizeListener();
    const [doubleTapCount, setDoubleTapCount] = createSignal(0);
    createEffect(() => {
        if (inventorySwap().start.id === null || inventorySwap().end.id === null) return;
        if (inventorySwap().start.id === inventorySwap().end.id) {
            setInventorySwap({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
            return;
        };
        handleInventoryDrop();
    });
    function doubleTap(inventory: Equipment, index: Accessor<number>) {
        setDoubleTapCount((prev) => prev + 1);
        if (doubleTapCount() ===1) {
            setProspectiveId(inventory._id as string);
        };
        if (doubleTapCount() === 2) {
            if (inventorySwap().start.id === inventory._id) {
                setInventorySwap({
                    ...inventorySwap(),
                    start: { id: null, index: -1 },
                });
                return;
            } else if (inventorySwap().start.id !== null) {
                setInventorySwap({
                    ...inventorySwap(),
                    end: { id: inventory._id, index: index() },
                });
            } else if (prospectiveId() === inventory._id) {   
                setInventorySwap({
                    ...inventorySwap(),
                    start: { id: inventory._id, index: index() },
                });
            };
        };
        setTimeout(() => {
            setDoubleTapCount(0);
        }, 600);
    };
    function handleInventoryDrop() {
        const { start, end } = inventorySwap();
        let copy: Equipment[] = Array.from(dragAndDropInventory());
        const [reorderedItem] = copy.splice(start.index, 1);
        copy.splice(end.index, 0, reorderedItem); // copy[start.index] = drop; // For Pure Swap
        setDragAndDropInventory(copy);
        setInventorySwap({ start: { id: null, index: -1 }, end: { id: null, index: -1 } }); 
        EventBus.emit('refresh-inventory', copy);
        EventBus.emit('equip-sound');
    }; 

    return <div class='playerInventoryBag' style={{ 'grid-template-rows': 'repeat(7, 1fr)' }}> 
        <For each={dragAndDropInventory()}>{(item, index) => {
            if (item === undefined || item === null) return;
            return <div onClick={() => doubleTap(item, index)} class='sortable' style={dimensions().ORIENTATION === 'landscape' ? { margin: '5%' } : { margin: '2.5%' }}>
                <Inventory ascean={ascean} setRingCompared={setRingCompared} setWeaponCompared={setWeaponCompared} 
                    highlighted={highlighted} setHighlighted={setHighlighted} inventory={item} setInventoryType={setInventoryType} inventorySwap={inventorySwap}
                />
            </div>;
        }}</For>
    </div>;
};