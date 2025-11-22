import { Accessor, JSX, Setter } from "solid-js";
import { getRarityColor } from "../utility/styling";
import { Item } from "../models/item";

interface Props {
    item: Item;
    inventorySwap: Accessor<any>;
    index: Accessor<number>;
    setItemShow: Setter<{ show: boolean; item: Item | undefined; }>;
    dragStart: (e: any, item: Item, index: number) => void;
    dragEnd: (e: DragEvent) => void;
    dragOver: (e: DragEvent, index: number) => void;
    touchStart: (e: TouchEvent) => void;
    touchEnd: (e: TouchEvent) => void;
    touchMove: (e: TouchEvent, item: Item, index: number) => void;
};

export default function SpecialInventory({ item, index, setItemShow, dragStart, dragEnd, dragOver, touchStart, touchEnd, touchMove }: Props) {
    let ref: HTMLDivElement;

    const getItemStyle = (rarity: string): JSX.CSSProperties => {
        return {
            "border": `thick ridge ${getRarityColor(rarity)}`,
            "background-color": "transparent", 
        };
    };

    return <div class="playerInventory"
        onClick={() => setItemShow({ show: true, item })} 
        style={getItemStyle(item?.rarity as string)}
        ref={ref!}
        data-id={index()}
        draggable={true}
        ondragstart={(e) => dragStart(e, item, index())}
        ondragend={(e) => dragEnd(e)}
        ondragover={(e) => dragOver(e, index())}
        ontouchstart={(e) => touchStart(e)}
        ontouchend={(e) => touchEnd(e)}
        ontouchmove={(e) => touchMove(e, item, index())}
    >
        <img src={item?.imgUrl} alt={item?.name} style={{ "pointer-events":"none", "padding-top": "5%" }} />
    </div>;
};