import { Accessor, JSX, Setter, createEffect, createSignal } from 'solid-js';
import { getRarityColor } from '../utility/styling';
import Equipment from '../models/equipment';
import Ascean from '../models/ascean';

interface Props {
    ascean: Accessor<Ascean>;
    inventory: Equipment;
    compare?: boolean;
    setRingCompared: Setter<string>;
    setHighlighted: Setter<{ item: Equipment | undefined; comparing: boolean; type: string }>;
    highlighted: Accessor<{ item: Equipment | undefined; comparing: boolean; type: string }>;
    setWeaponCompared: Setter<string>;
    setInventoryType: Setter<string>;
    inventorySwap: Accessor<any>;
};

export default function Inventory({ ascean, inventory, setInventoryType, setRingCompared, setHighlighted, highlighted, setWeaponCompared, inventorySwap }: Props) {
    const [trueType, setTrueType] = createSignal('');
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
        checkInventory();
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
            if (inventory?.grip) {
                type = 'weaponOne';
                setInventoryType('weaponOne');
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
                type = 'ringOne';
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
            setTrueType(type);
        } catch (err: any) {
            console.log(err, '<- This is the error in checkInventory');
        };
    };

    const getBackgroundStyle = () => {
        if (inventorySwap()?.start?.id === inventory?._id) {
            return 'gold';
        } else if (highlighted()?.item && (highlighted()?.item?._id === inventory?._id)) {
            return '#820303';
        } else {
            return 'transparent';
        };
    };

    const getItemStyle = (rarity: string): JSX.CSSProperties => {
        return {
            'border': `0.15em solid ${getRarityColor(rarity)}`,
            'background-color': getBackgroundStyle(),
        };
    };

    return <div class='playerInventory' onClick={checkHighlight} style={getItemStyle(inventory?.rarity as string)}>
        <img src={inventory?.imgUrl} alt={inventory?.name} />
    </div>;
};