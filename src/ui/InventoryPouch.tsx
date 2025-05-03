import Inventory from "./Inventory";
import { Accessor, createEffect, createSignal, For, Setter, Show } from "solid-js";
import { EventBus } from "../game/EventBus";
import { useResizeListener } from "../utility/dimensions";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { border } from "../utility/styling";
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
    const [inventorySwap, setInventorySwap] = createSignal<any>({ start: { id: undefined, index: -1 }, end: { id: undefined, index: -1 } });
    const [prospectiveId, setProspectiveId] = createSignal<string | undefined>(undefined);
    const dimensions = useResizeListener();
    const [doubleTapCount, setDoubleTapCount] = createSignal(0);
    const [dragOverIndex, setDragOverIndex] = createSignal<any>(undefined);
    const [activeDrag, setActiveDrag] = createSignal<{index: number, item: any} | undefined>(undefined);

    createEffect(() => {
        if (inventorySwap().start.id === undefined || inventorySwap().end.id === undefined) return;
        if (inventorySwap().start.id === inventorySwap().end.id) {
            setInventorySwap({ start: { id: undefined, index: -1 }, end: { id: undefined, index: -1 } });
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
                    start: { id: undefined, index: -1 },
                });
                return;
            } else if (inventorySwap().start.id !== undefined) {
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
        setInventorySwap({ start: { id: undefined, index: -1 }, end: { id: undefined, index: -1 } }); 
        EventBus.emit("refresh-inventory", copy);
        EventBus.emit("equip-sound");
    };
    
    const dragStart = (e: any, item: Equipment, index: number) => {
        // console.log('DragStart - Index:', index);
        e.dataTransfer!.setData('text/plain', index.toString());
        setActiveDrag({ index, item });
        
        (e.target as HTMLElement).style.opacity = '0.4';
        (e.target as HTMLElement).style.transform = 'scale(0.75)';

        const dragImage = (e.target as HTMLElement).cloneNode(true) as HTMLElement;
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-9999px';
        dragImage.style.width = `${(e.target as HTMLElement).offsetWidth}px`;

        dragImage.style.boxShadow = '0 0 1.25em rgba(255, 215, 0, 0.7)';
        // dragImage.style.filter = 'brightness(1.25) drop-shadow(0 0 5px rgba(255,255,255,0.9))';
        dragImage.style.border = '0.15em solid gold';
        // dragImage.style.backgroundColor = '#fdf6d8';
        dragImage.style.opacity = "1";
        dragImage.style.width = `${(e.target as HTMLElement).offsetWidth * 1.25}px`;
        dragImage.style.height = `${(e.target as HTMLElement).offsetHeight * 1.25}px`;
        dragImage.style.zIndex = '1000';
        dragImage.style.transition = 'none';

        document.body.appendChild(dragImage);
        e.dataTransfer!.setDragImage(dragImage, (e.target as HTMLElement).offsetWidth / 2, (e.target as HTMLElement).offsetHeight / 2);
        // e.dataTransfer!.setDragImage(dragImage, (e.target as HTMLElement).offsetWidth, (e.target as HTMLElement).offsetHeight);
        // e.dataTransfer!.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };


    const dragEnd = (e: DragEvent) => {
        e.preventDefault();
        (e.target as HTMLElement).style.opacity = '1';
        (e.target as HTMLElement).style.transform = 'scale(1)';
        const dragIndex = activeDrag()?.index;
        // console.log('Drop - From:', dragIndex, 'To:', dragOverIndex());
        
        if (dragIndex === undefined || dragIndex === dragOverIndex()) return;
        
        setDragAndDropInventory(prev => {
            const newItems = [...prev];
            const [movedItem] = newItems.splice(dragIndex, 1);
            newItems.splice(dragOverIndex(), 0, movedItem);
            return newItems;
        });
        EventBus.emit("refresh-inventory", dragAndDropInventory());
        EventBus.emit("equip-sound");
        
        setActiveDrag(undefined);
        setDragOverIndex(undefined);
    };

    const dragOver = (e: DragEvent, index: number) => {
        e.preventDefault();
        // console.log('DragOver - Index:', index);
        setDragOverIndex(index);
        e.dataTransfer!.dropEffect = 'move';
    };


    // onDrop={drop} onDragOver={allowDrop}
    return <div class="playerInventoryBag" style={{ "grid-template-rows": "repeat(7, 1fr)" }}> 
        <For each={dragAndDropInventory()}>{(item, index) => {
            if (item === undefined || item === null) return;
            return (
                <>
                <Show when={dragOverIndex() === index() && activeDrag()?.index !== index() && activeDrag()?.index as number > index()}>
                    <div class="playerInventory" style={{border: border("gold", 0.15), transform: "scale(0.5)"}}>
                        <img src={activeDrag()?.item.imgUrl} alt={activeDrag()?.item?.name} />
                    </div>
                </Show>
                <div onClick={() => doubleTap(item, index)} class="sortable juiceNB" style={dimensions().ORIENTATION === "landscape" ? { margin: "5%" } : { margin: "2.5%" }} draggable="true">
                    <Inventory ascean={ascean} setRingCompared={setRingCompared} setWeaponCompared={setWeaponCompared} index={index}
                            highlighted={highlighted} setHighlighted={setHighlighted} inventory={item} setInventoryType={setInventoryType} inventorySwap={inventorySwap}
                            dragStart={dragStart} dragEnd={dragEnd} dragOver={dragOver}
                    />
                </div>
                <Show when={dragOverIndex() === index() && activeDrag()?.index !== index() && activeDrag()?.index as number < index()}>
                    <div class="playerInventory" style={{border: border("gold", 0.15), transform: "scale(0.5)"}}>
                        <img src={activeDrag()?.item.imgUrl} alt={activeDrag()?.item?.name} />
                    </div>
                </Show>
                </>
            )
            
        }}</For>
    </div>;
};