import { Accessor, createEffect, createSignal, For, Setter } from "solid-js";
import { Item } from "../models/item";
import { EventBus } from "../game/EventBus";
import SpecialInventory from "./SpecialInventory";

interface Props {
    specialInventory: Accessor<Item[]>;
    setSpecialInventory: Setter<Item[]>;
    setItemShow: Setter<{ show: boolean; item: Item | undefined; }>;
};

let touchStartPos = { x: 0, y: 0 };
const TOUCH_SLOP = 10; // Minimum movement to start drag (px)
const TOUCH_HOLD_DELAY = 100;

export default function SpecialInventoryPouch({ specialInventory, setSpecialInventory, setItemShow }: Props) {
    const [inventorySwap, setInventorySwap] = createSignal<any>({ start: { id: undefined, index: -1 }, end: { id: undefined, index: -1 } });
    const [activeDrag, setActiveDrag] = createSignal<{index: number, item: any} | undefined>(undefined);
    const [dragOverIndex, setDragOverIndex] = createSignal<any>(undefined);
    const [touchHoldTimeout, setTouchHoldTimeout] = createSignal<NodeJS.Timeout | null>(null);
    const [isTouchHoldActive, setIsTouchHoldActive] = createSignal(false);

    createEffect(() => {
        if (inventorySwap().start.id === undefined || inventorySwap().end.id === undefined) return;
        if (inventorySwap().start.id === inventorySwap().end.id) {
            setInventorySwap({ start: { id: undefined, index: -1 }, end: { id: undefined, index: -1 } });
            return;
        };
        handleInventoryDrop();
    });

    function handleInventoryDrop() {
        const { start, end } = inventorySwap();
        let copy: Item[] = Array.from(specialInventory());
        const [reorderedItem] = copy.splice(start.index, 1);
        copy.splice(end.index, 0, reorderedItem); // copy[start.index] = drop; // For Pure Swap
        setSpecialInventory(copy);
        setInventorySwap({ start: { id: undefined, index: -1 }, end: { id: undefined, index: -1 } }); 
        EventBus.emit("refresh-special-inventory", copy);
        EventBus.emit("equip-sound");
    };

    const dragStart = (e: any, item: Item, index: number) => {
        e.dataTransfer!.setData('text/plain', index.toString());
        setActiveDrag({ index, item });
        
        (e.target as HTMLElement).style.opacity = '0.4';
        (e.target as HTMLElement).style.transform = 'scale(0.75)';

        const dragImage = (e.target as HTMLElement).cloneNode(true) as HTMLElement;

        dragImage.style.position = 'fixed';
        dragImage.style.top = '-9999px';
        dragImage.style.width = `${(e.target as HTMLElement).offsetWidth}px`;
        dragImage.style.boxShadow = '0 0 1.25em rgba(255, 215, 0, 0.7)';
        dragImage.style.border = '0.15em solid gold';
        dragImage.style.opacity = "1";
        dragImage.style.width = `${(e.target as HTMLElement).offsetWidth * 1.25}px`;
        dragImage.style.height = `${(e.target as HTMLElement).offsetHeight * 1.25}px`;
        dragImage.style.zIndex = '1000';
        dragImage.style.transition = 'none';

        document.body.appendChild(dragImage);
        e.dataTransfer!.setDragImage(dragImage, (e.target as HTMLElement).offsetWidth / 2, (e.target as HTMLElement).offsetHeight / 2);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    const dragEnd = (e: DragEvent) => {
        e.preventDefault();
        (e.target as HTMLElement).style.opacity = '1';
        (e.target as HTMLElement).style.transform = 'scale(1)';
        const dragIndex = activeDrag()?.index;
        
        if (dragIndex === undefined || dragOverIndex() === undefined || dragIndex === dragOverIndex()) {
            setActiveDrag(undefined);
            setDragOverIndex(undefined);
            return;
        };
        
        setSpecialInventory(prev => {
            const newItems = [...prev];
            const [movedItem] = newItems.splice(dragIndex, 1);
            newItems.splice(dragOverIndex(), 0, movedItem);
            return newItems;
        });
        EventBus.emit("refresh-special-inventory", specialInventory());
        EventBus.emit("equip-sound");
        
        setActiveDrag(undefined);
        setDragOverIndex(undefined);
    };

    const dragOver = (e: DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
        e.dataTransfer!.dropEffect = 'move';
    };

    const handleTouchStart = (e: TouchEvent) => {
        touchStartPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        const target = e.currentTarget as HTMLElement;
        setTouchHoldTimeout(setTimeout(() => {
            setIsTouchHoldActive(true);
            target.dataset.touched = 'true';
            target.style.transition = 'none';
            target.style.backgroundColor = "#F3E5AB";
            // target.style.transform = "scale(0.75)";
            target.style.boxShadow = '0 0 1.25em rgba(255, 215, 0, 0.7)';
        }, TOUCH_HOLD_DELAY));
    };
          
    const handleTouchMove = (e: TouchEvent, item: Item, index: number) => {
        if (!isTouchHoldActive()) {
            const dx = Math.abs(e.touches[0].clientX - touchStartPos.x);
            const dy = Math.abs(e.touches[0].clientY - touchStartPos.y);
            
            if (dx > TOUCH_SLOP || dy > TOUCH_SLOP) {
                if (touchHoldTimeout()) {
                    clearTimeout(touchHoldTimeout()!);
                    setTouchHoldTimeout(null);
                };
                return;
            };
            return;
        };
        const target = e.currentTarget as HTMLElement;
        if (target.dataset.touched !== "true") return;
        
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPos.x;
        const dy = touch.clientY - touchStartPos.y;
        
        if (Math.abs(dx) > TOUCH_SLOP || Math.abs(dy) > TOUCH_SLOP) {
            // e.preventDefault();
            
            if (!activeDrag()) {
                setActiveDrag({ index, item });
                target.style.opacity = "1";
                target.style.backgroundColor = "#F3E5AB";
                target.style.boxShadow = '0 0 1.25em rgba(255, 215, 0, 0.7)';
            };
            target.style.transition = "none";
            target.style.visibility = "hidden";
            const hoveredElement = document.elementFromPoint(touch.clientX, touch.clientY);
            target.style.visibility = "visible";
            if (hoveredElement) {
                const inventoryItem = hoveredElement.closest('[data-id]');
                if (inventoryItem) {
                    const hoverIndex = parseInt(inventoryItem.getAttribute('data-id')!);
                    setDragOverIndex(hoverIndex);
                };
            };
        } else {
            setDragOverIndex(index);
        };
        target.style.transform = `translate(${dx}px, ${dy}px)`;
    };
        
    const handleTouchEnd = (e: TouchEvent) => {
        if (touchHoldTimeout()) {
            clearTimeout(touchHoldTimeout()!);
            setTouchHoldTimeout(null);
        };

        const target = e.currentTarget as HTMLElement;
        target.dataset.touched = "false";
        setIsTouchHoldActive(false);
        target.style.transform = "";
        target.style.boxShadow = "";
        target.style.backgroundColor = "";
        target.style.transition = "transform 0.5s ease";
        
        if (activeDrag()) {
            const dragEvent = new DragEvent("dragend", {
                bubbles: true,
                cancelable: true
            });
            target.dispatchEvent(dragEvent);
        };
    };

    return <div class="playerInventoryBag">
        <For each={specialInventory()}>{(item, index) => {
            if (item === undefined || item === null) return;
            return (
                <div class="juiceItem" style={{ margin: "5%", background: dragOverIndex() === index() ? "gold" : "" }}>
                    <SpecialInventory index={index} item={item} inventorySwap={inventorySwap}
                        dragStart={dragStart} dragEnd={dragEnd} dragOver={dragOver} setItemShow={setItemShow}
                        touchStart={handleTouchStart} touchMove={handleTouchMove} touchEnd={handleTouchEnd} />
                </div>
            )
        }}</For>
    </div>;
};