import Inventory from "./Inventory";
import { Accessor, createEffect, createSignal, For, Setter } from 'solid-js';
import { styles } from '../styles';
import { EventBus } from "../game/EventBus";
import { useResizeListener } from "../utility/dimensions";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";

interface Props {
    ascean: Accessor<Ascean>;
    setHighlighted: Setter<any>;
    highlighted: Accessor<any>;
    ringCompared: Accessor<string>;
    setRingCompared: Setter<string>;
    weaponCompared: Accessor<string>;
    setWeaponCompared: Setter<string>;
    setEquipModalShow: Setter<boolean>;
    equipModalShow: Accessor<boolean>;
    setInspectModalShow: Setter<boolean>;
    inspectModalShow: Accessor<boolean>;
    dragAndDropInventory: Accessor<Equipment[]>;
    setDragAndDropInventory: Setter<Equipment[]>;
};

export default function InventoryPouch({ ascean, setHighlighted, highlighted, ringCompared, setRingCompared, weaponCompared, setWeaponCompared, setEquipModalShow, equipModalShow, setInspectModalShow, inspectModalShow, dragAndDropInventory, setDragAndDropInventory }: Props) {
    const [scaleImage, setScaleImage] = createSignal({ id: '', scale: 48 });
    const [inventorySwap, setInventorySwap] = createSignal({ start: { id: null, index: -1 }, end: { id: null, index: -1 } });
    const dimensions = useResizeListener();
    const [numColumns, setNumColumns] = createSignal(0);
    createEffect(() => {
        if (dimensions().ORIENTATION === 'landscape') {
            setNumColumns(5);
        } else {
            setNumColumns(8);
        };
    });

    createEffect(() => {
      console.log(scaleImage(), 'scaleImage');
    });

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
        setDragAndDropInventory(copy);
        setInventorySwap({ start: { id: null, index: -1 }, end: { id: null, index: -1 } }); 
        EventBus.emit('refresh-inventory', copy);
        EventBus.emit('equip-sound');
    }; 

    return ( 
        <div style={styles.playerInventoryBag}>  
            <For each={dragAndDropInventory()}>{({ item, index }) => {
                if (item == undefined || item == null) return;
                console.log(item, 'item');
                return (
                    <div style={dimensions().ORIENTATION === 'landscape' ? { margin: '5.5%' } : { margin: '2.5%' }}>
                        <Inventory key={index} ascean={ascean} index={index} ringCompared={ringCompared} setRingCompared={setRingCompared} weaponCompared={weaponCompared} setWeaponCompared={setWeaponCompared} setEquipModalShow={setEquipModalShow} equipModalShow={equipModalShow} setInspectModalShow={setInspectModalShow} inspectModalShow={inspectModalShow} highlighted={highlighted} setHighlighted={setHighlighted} pouch={dragAndDropInventory} inventory={item} scaleImage={scaleImage} setScaleImage={setScaleImage} inventorySwap={inventorySwap} setInventorySwap={setInventorySwap} />
                    </div>
                );
            }}</For>
        </div>
    );
};