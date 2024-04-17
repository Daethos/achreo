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
    scaleImage: Accessor<{ id: string; scale: number }>;
    setScaleImage: Setter<{ id: string; scale: number }>;
};
export default function InventoryPouch({ ascean, inventoryType, setInventoryType, setHighlighted, highlighted, setRingCompared, setWeaponCompared, dragAndDropInventory, setDragAndDropInventory, scaleImage, setScaleImage }: Props) {
    const [inventorySwap, setInventorySwap] = createSignal<any>({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
    const [prospectiveId, setProspectiveId] = createSignal<string | null>(null);
    const dimensions = useResizeListener();
    const [doubleTapCount, setDoubleTapCount] = createSignal(0);

    createEffect(() => {
        if (dragAndDropInventory()?.length === 0) return;
    });

    createEffect(() => {
        if (inventorySwap().start.id === null || inventorySwap().end.id === null) return;
        if (inventorySwap().start.id === inventorySwap().end.id) {
            setInventorySwap({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
            return;
        };
        handleInventoryDrop();
    });

    function doubleTap(inventory: Equipment, index: Accessor<number>) {
        // console.log('Double Tap !!');
        setDoubleTapCount((prev) => prev + 1);
        if (doubleTapCount() ===1) {
            // console.log('Double Tap Count is 1');
            setProspectiveId(inventory._id as string);
        };
        if (doubleTapCount() === 2) {
            // console.log(' -- DOUBLE TAP DETECTED -- Double Tap Count is 2 -- DOUBLE TAP DETECTED --');
            if (inventorySwap().start.id === inventory._id) {
                // console.log('Start ID is equal to inventory _ID, same item, reset')
                setInventorySwap({
                    ...inventorySwap(),
                    start: { id: null, index: -1 },
                });
                return;
            } else if (inventorySwap().start.id !== null) {
                // console.log('Start ID is not null, set end ID');
                setInventorySwap({
                    ...inventorySwap(),
                    end: { id: inventory._id, index: index() },
                });
            } else if (prospectiveId() === inventory._id) {   
                // console.log('Start ID is null, set start ID');
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
        copy.splice(end.index, 0, reorderedItem);
        // copy[start.index] = drop; // ForPure Swap
        // console.log(copy, 'Copy');
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
                    <div onClick={() => doubleTap(item, index)} class='sortable' style={dimensions().ORIENTATION === 'landscape' ? { margin: '5.5%' } : { margin: '2.5%' }}>
                        <Inventory ascean={ascean} index={index()} 
                            setRingCompared={setRingCompared} setWeaponCompared={setWeaponCompared} 
                            highlighted={highlighted} setHighlighted={setHighlighted} 
                            pouch={dragAndDropInventory} inventory={item} scaleImage={scaleImage} setScaleImage={setScaleImage} 
                            setInventoryType={setInventoryType} inventoryType={inventoryType} 
                            inventorySwap={inventorySwap}
                        />
                    </div>
                );
            }}</For>
        </div>
    );
};