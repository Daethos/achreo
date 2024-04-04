import { Accessor, JSX, Setter, createEffect, createSignal } from 'solid-js';
import { EventBus } from '../game/EventBus';
import { font, getRarityColor } from '../utility/styling';
import Equipment from '../models/equipment';
import { useResizeListener } from '../utility/dimensions';
import Ascean from '../models/ascean';

// import { checkPlayerTrait, checkTraits } from './PlayerTraits'; 

interface Props {
    ascean: Accessor<Ascean>;
    index: number;
    inventory: Equipment;
    pouch: Accessor<Equipment[]>;
    blacksmith?: boolean;
    compare?: boolean;
    setRingCompared: Setter<string>;
    setHighlighted: Setter<{ item: Equipment | undefined; comparing: boolean; type: string }>;
    highlighted: Accessor<{ item: Equipment | undefined; comparing: boolean; type: string }>;
    scaleImage: Accessor<{ id: string; scale: number }>;
    setScaleImage: Setter<{ id: string; scale: number }>;
    setWeaponCompared: Setter<string>;
    inventoryType: Accessor<string>;
    setInventoryType: Setter<string>;
};

const Inventory = ({ ascean, index, inventory, pouch, blacksmith = false, compare = false, inventoryType, setInventoryType, setRingCompared, setHighlighted, highlighted, scaleImage, setScaleImage, setWeaponCompared }: Props) => {
    const [trueType, setTrueType] = createSignal('');
    const [forgeModalShow, setForgeModalShow] = createSignal(false); 
    const [inventoryTypeTwo, setInventoryTypeTwo] = createSignal<any>('');
    const [inventoryTypeThree, setInventoryTypeThree] = createSignal<any>('');
    const [inventoryRingType, setInventoryRingType] = createSignal<any>('');
    const dimensions = useResizeListener();

    // if (scaleImage !== 48 * 2) {
        // setScaleImage({id: inventory._id, scale: 96});
        // setInventorySwap({
        //     ...inventorySwap,
        //     start: { id: inventory._id, index: index },
        // })
        // scaleImage.value = scaleImage.value * 2;
    // } else {
        // console.log('Scale is now being set to 48');
        // setScaleImage({id: inventory._id, scale: 48});
        // setInventorySwap({
        //     ...inventorySwap,
        //     end: { id: inventory._id, index: index },
        // });
        // scaleImage.value = scaleImage.value / 2;
    // };

    // function handleTap(scale: number, id: string, index: number): void { // scaleImage.scale, inventory._id, index
    //     console.log('Tapped', scale, id, index);
    //     if (scale === 48) {
    //         setScaleImage({ id, scale: scale * 2 });
    //         console.log('Scale is now being set to 48');
    //         setInventorySwap({
    //             ...inventorySwap,
    //             start: { id: id, index: index },
    //         });
    //     } else {
    //         console.log('Scale is now being set to 96');                                
    //         setScaleImage({ id, scale: scale / 2 });
    //         setInventorySwap({
    //             ...inventorySwap,
    //             end: { id: id, index: index },
    //         });
    //     };
    // };
    
    const [editState, setEditState] = createSignal<any>({
        weaponOne: ascean().weaponOne,
        weaponTwo: ascean().weaponTwo,
        weaponThree: ascean().weaponThree,
        helmet: ascean().helmet,
        chest: ascean().chest,
        legs: ascean().legs,
        amulet: ascean().amulet,
        ringOne: ascean().ringOne,
        ringTwo: ascean().ringTwo,
        trinket: ascean().trinket,
        shield: ascean().shield,
        newWeaponOne: '',
        newWeaponTwo: '',
        newWeaponThree: '',
        newHelmet: '',
        newChest: '',
        newLegs: '',
        newAmulet: '',
        newRingOne: '',
        newRingTwo: '',
        newTrinket: '',
        newShield: '',
        _id: ascean()._id,
        inventoryType: '',
    });

    createEffect(() => {
        setEditState({
            ...editState,
            weaponOne: ascean().weaponOne,
            weaponTwo: ascean().weaponTwo,
            weaponThree: ascean().weaponThree,
            helmet: ascean().helmet,
            chest: ascean().chest,
            legs: ascean().legs,
            amulet: ascean().amulet,
            ringOne: ascean().ringOne,
            ringTwo: ascean().ringTwo,
            trinket: ascean().trinket,
            shield: ascean().shield,
            _id: ascean()._id,
        });
    }); 

    const checkHighlight = (): void => {
        setHighlighted({ item: inventory, comparing: true, type: trueType() });
        checkInventory();
    };

    
    function checkInventory() {
        try {
            let type = '';
            let typeTwo = '';
            let typeThree = '';
            let ringType = '';
            if (inventory?.grip) {
                type = 'weaponOne';
                typeTwo = 'weaponTwo';
                typeThree = 'weaponThree';
                setInventoryType('weaponOne');
                setInventoryTypeTwo('weaponTwo');
                setInventoryTypeThree('weaponThree');
                setWeaponCompared('weaponOne');
            };
            if (inventory?.name.includes('Hood') || inventory?.name.includes('Helm') || inventory?.name.includes('Mask')) {
                type = 'helmet';
                setInventoryType('helmet');
            };
            if (inventory?.name.includes('Cuirass') || inventory?.name.includes('Robes') || inventory?.name.includes('Armor')) {
                setInventoryType('chest');
                type = 'chest';
            };
            if (inventory?.name.includes('Greaves') || inventory?.name.includes('Pants') || inventory?.name.includes('Legs')) {
                setInventoryType('legs');
                type = 'legs';
            };
            if (inventory?.name.includes('Amulet') || inventory?.name.includes('Necklace')) {
                setInventoryType('amulet');
                type = 'amulet';
            };
            if (inventory?.name.includes('Ring')) {
                setInventoryType('ringOne');
                setInventoryRingType('ringTwo');
                type = 'ringOne';
                ringType = 'ringTwo';
                setRingCompared('ringOne');
            };
            if (inventory?.name.includes('Trinket')) {
                setInventoryType('trinket');
                type = 'trinket';
            };
            if (inventory?.type.includes('Shield')) {
                setInventoryType('shield');
                type = 'shield';
            };
            console.log(trueType(), 'TrueType');
            setTrueType(type);
        } catch (err: any) {
            console.log(err, '<- This is the error in checkInventory');
        };
    };

    const getBackgroundStyle = () => {
        if (scaleImage().scale > 48 && scaleImage().id === inventory?._id) {
            console.log('ScaleImage is greater than 48');
            return 'gold';
        } else if (highlighted()?.item && (highlighted()?.item?._id === inventory?._id)) {
            return '#820303';
        } else {
            return 'transparent';
        };
    };

    const getItemStyle = (rarity: string): JSX.CSSProperties => {
        return {
            border: `0.15em solid ${getRarityColor(rarity)}`,
            'background-color': getBackgroundStyle(),
        };
    };


    return (
        <div class='playerInventory' onClick={checkHighlight} style={getItemStyle(inventory?.rarity as string)}>
            <img src={inventory?.imgUrl} alt={inventory?.name} />
        </div>
    );
};

export default Inventory;