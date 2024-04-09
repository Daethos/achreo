import Inventory from "./Inventory";
import { Accessor, createEffect, createSignal, For, JSX, on, onCleanup, Setter } from 'solid-js';
import { EventBus } from "../game/EventBus";
import { useResizeListener } from "../utility/dimensions";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
// import { dndzone } from "solid-dnd-directive";
// import { SortableHorizontalListExample } from './Sortable';
// import {
//     DragDropProvider,
//     DragDropSensors,
//     DragOverlay,
//     SortableProvider,
//     createSortable,
//     closestCenter,
//     Id,
//     DragEventHandler,
//   } from "@thisbeyond/solid-dnd";
import { getRarityColor } from "../utility/styling";

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
function useDebounce(signal: { (): boolean; (): any; }, delay: number | undefined) {
    const [debouncedSignal, setDebouncedSignal] = createSignal(signal());
    let timerHandle: string | number | NodeJS.Timeout | undefined;
    createEffect(
        on(signal, (s) => {
            timerHandle = setTimeout(() => {
            setDebouncedSignal(s);
            }, delay);
            onCleanup(() => clearTimeout(timerHandle));
        })
    );
    return debouncedSignal;
};
export default function InventoryPouch({ ascean, inventoryType, setInventoryType, setHighlighted, highlighted, setRingCompared, setWeaponCompared, dragAndDropInventory, setDragAndDropInventory, scaleImage, setScaleImage }: Props) {
    const [inventorySwap, setInventorySwap] = createSignal<any>({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
    const [activeItem, setActiveItem] = createSignal(null);
    const [items, setItems] = createSignal([
        ...dragAndDropInventory().map((item: Equipment) => { return { ...item, id: item._id } })
    ]);
    const dimensions = useResizeListener();
    const ids = () => dragAndDropInventory();
    const [isOpen, setIsOpen] = createSignal(false);
    const isOpenDebounced = useDebounce(isOpen, 400);
    const [doubleTapCount, setDoubleTapCount] = createSignal(0);

    createEffect(() => {
        if (dragAndDropInventory()?.length === 0) return;
        setItems([...dragAndDropInventory().map((item: Equipment) => { return { ...item, id: item._id } })]);
    });

    const onDragStart = ({ draggable }: { draggable: any; }) => {
        console.log('Drag Start', draggable);
        setActiveItem(draggable.id);

        if (inventorySwap().start.id === draggable.id) {
            console.log('Start ID is equal to draggable ID, same item, reset')
            setInventorySwap({
                ...inventorySwap(),
                start: { id: null, index: -1 },
            });
            return;
        } else if (inventorySwap().start.id !== null) {
            console.log('Start ID is not null, set end ID');
            setInventorySwap({
                ...inventorySwap(),
                end: { id: draggable.id, index: ids().indexOf(draggable.id) },
            });
        } else {   
            console.log('Start ID is null, set start ID');
            setInventorySwap({
                ...inventorySwap(),
                start: { id: draggable.id, index: ids().indexOf(draggable.id) },
            });
        };
    };
    const onDragEnd = ({ draggable, droppable }: { draggable: any; droppable: any; }) => {
        console.log('Drag End', draggable, droppable);
        if (draggable && droppable) {
            console.log('Drag End', draggable, droppable);
            const currentItems = ids();
            const fromIndex = currentItems.indexOf(draggable.id);
            const toIndex = currentItems.indexOf(droppable.id);
            if (fromIndex !== toIndex) {
                const updatedItems = currentItems.slice();
                updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
                setDragAndDropInventory(updatedItems);
            };
        };
        setActiveItem(null);
    };

    createEffect(() => {
        if (inventorySwap().start.id === null || inventorySwap().end.id === null) return;
        if (inventorySwap().start.id === inventorySwap().end.id) {
            setInventorySwap({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
            return;
        };
        handleInventoryDrop();
    });

    function doubleTap(inventory: Equipment, index: Accessor<number>) {
        console.log('Double Tap !!');
        setDoubleTapCount((prev) => prev + 1);
        if (doubleTapCount() ===1) {
            console.log('Double Tap Count is 1');
        };
        if (doubleTapCount() === 2) {
            console.log(' -- DOUBLE TAP DETECTED -- Double Tap Count is 2 -- DOUBLE TAP DETECTED --');
            if (inventorySwap().start.id === inventory._id) {
                console.log('Start ID is equal to inventory _ID, same item, reset')
                setInventorySwap({
                    ...inventorySwap(),
                    start: { id: null, index: -1 },
                });
                return;
            } else if (inventorySwap().start.id !== null) {
                console.log('Start ID is not null, set end ID');
                setInventorySwap({
                    ...inventorySwap(),
                    end: { id: inventory._id, index: index() },
                });
            } else {   
                console.log('Start ID is null, set start ID');
                setInventorySwap({
                    ...inventorySwap(),
                    start: { id: inventory._id, index: index() },
                });
            };
        };
        setTimeout(() => {
            console.log('Double Tap Timeout Reset');
            setDoubleTapCount(0);
        }, 600);
    }

    function handleDndEvent(e: any) {
        const { dragAndDropInventory: newItems } = e.detail;
        console.log(e, 'Event');
        setDragAndDropInventory(newItems);
     };

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

    const getBackgroundStyle = (inventory: Equipment) => {
        if (scaleImage().scale > 48 && scaleImage().id === inventory?._id) {
            console.log('ScaleImage is greater than 48');
            return 'gold';
        } else if (highlighted()?.item && (highlighted()?.item?._id === inventory?._id)) {
            return '#820303';
        } else {
            return 'transparent';
        };
    };

    const getItemStyle = (inventory: Equipment): JSX.CSSProperties => {
        return {
            // 'background-color': getBackgroundStyle(inventory),
            margin: '5.5%',
        };
    };

    return (
        <div class='playerInventoryBag'> 
            <For each={dragAndDropInventory()}>{(item, index) => {
                if (item === undefined || item === null) return;
                return (
                    <div onClick={() => doubleTap(item, index)} class='sortable' style={dimensions().ORIENTATION === 'landscape' ? getItemStyle(item) : { margin: '2.5%' }}>
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