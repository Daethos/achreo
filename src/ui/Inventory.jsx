import { createEffect, createSignal } from 'solid-js';
// import { checkPlayerTrait, checkTraits } from './PlayerTraits';
import { styles } from '../styles';
// import { equipmentRemove, equipmentSwap } from '../assets/db/db';
import { EventBus } from '../game/EventBus';
import { font, getRarityColor } from '../utility/styling';
import { IMAGES } from '../utility/images';

// const GET_FORGE_COST = {
//     Common: 1,
//     Uncommon: 3,
//     Rare: 12,
//     Epic: 60,
// };

// const GET_NEXT_RARITY = {
//     Common: "Uncommon",
//     Uncommon: 'Rare',
//     Rare: "Epic",
//     Epic: "Legendary",
// };

const Inventory = ({ 
    ascean, index, inventory, pouch, blacksmith = false, compare = false, setRemoveModalShow, removeModalShow, setInspectModalShow, inspectModalShow, ringCompared, setRingCompared,
    setHighlighted, highlighted, scaleImage, setScaleImage, inventorySwap, setInventorySwap, setInspectItems, inspectItems, weaponCompared, setWeaponCompared,
}) => {
    const orientation = useDeviceOrientation();
    const { height, width } = useWindowDimensions();
    const [forgeModalShow, setForgeModalShow] = createSignal(false);

    const [inventoryType, setInventoryType] = createSignal({});
    const [inventoryTypeTwo, setInventoryTypeTwo] = createSignal(null);
    const [inventoryTypeThree, setInventoryTypeThree] = createSignal(null);
    const [inventoryRingType, setInventoryRingType] = createSignal(null);
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

    const onDoubleTap = Gesture.Tap()
        .runOnJS(true)
        .maxDuration(250)
        .numberOfTaps(2)
        .onStart(() => {
            console.log('Double Tap Start'); 
            runOnJS(handleTap)(scaleImage.scale, inventory._id, index);
        });
    
    function handleTap(scale, id, index) {
        'worklet'
        console.log('Tapped', scale, id, index);
        if (scale === 48) {
            setScaleImage({ id, scale: scale * 2 });
            console.log('Scale is now being set to 48');
            setInventorySwap({
                ...inventorySwap,
                start: { id: id, index: index },
            });
        } else {
            console.log('Scale is now being set to 96');                                
            setScaleImage({ id, scale: scale / 2 });
            setInventorySwap({
                ...inventorySwap,
                end: { id: id, index: index },
            });
        };
    };
    
    const [editState, setEditState] = createSignal({
        weaponOne: ascean.weaponOne,
        weaponTwo: ascean.weaponTwo,
        weaponThree: ascean.weaponThree,
        helmet: ascean.helmet,
        chest: ascean.chest,
        legs: ascean.legs,
        amulet: ascean.amulet,
        ringOne: ascean.ringOne,
        ringTwo: ascean.ringTwo,
        trinket: ascean.trinket,
        shield: ascean.shield,
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
        _id: ascean._id,
        inventoryType: '',
    });

    createEffect(() => {
        // console.log(inventory?._id)
        checkInventory();
        setEditState({
            ...editState,
            weaponOne: ascean.weaponOne,
            weaponTwo: ascean.weaponTwo,
            weaponThree: ascean.weaponThree,
            helmet: ascean.helmet,
            chest: ascean.chest,
            legs: ascean.legs,
            amulet: ascean.amulet,
            ringOne: ascean.ringOne,
            ringTwo: ascean.ringTwo,
            trinket: ascean.trinket,
            shield: ascean.shield,
            _id: ascean._id,
        })
    }, [ascean, inventory]); 

    function setInspector() {
        if (inventoryType === 'weaponOne') {
            setInspectItems([{ item: ascean.weaponOne, type: 'weaponOne' }, { item: ascean.weaponTwo, type: 'weaponTwo' }, { item: ascean.weaponThree, type: 'weaponThree'}]);
        } else if (inventoryType === 'ringOne') {
            setInspectItems([{ item: ascean.ringOne, type: 'ringOne' }, { item: ascean.ringTwo, type: 'ringTwo' }]);
        };
        setInspectModalShow(true);
    };

    function setEquipper() {
        let type;
        if (inventoryType === 'weaponOne') {
            type = weaponCompared;
        } else if (inventoryType === 'ringOne') {
            type = ringCompared;
        } else {
            type = inventoryType;
        };

        EventBus.emit('set-equipper', { type, item: inventory });

        // setEquipModalShow(true);
    };

    function canUpgrade(inventory, name, rarity) {
        const matches = inventory.filter(item => item?.name === name && item?.rarity === rarity);
        console.log(matches.length, "Matches Length");
        return matches.length >= 3;
    };

    function handleInventory(e) {
        let type = '';
        type = `new${inventoryType}`;
        setEditState({
            ...editState,
            [inventoryType]: e.target.value === ascean[inventoryType]._id ? ascean[inventoryType] : inventory,
            [type]: e.target.value,
            inventoryType: inventoryType,
        });
    };

    function handleInventoryW2(e) {
        setEditState({
            ...editState,
            [inventoryTypeTwo]: e.target.value === ascean[inventoryTypeTwo]._id ? ascean.weaponTwo : inventory,
            newWeaponOne: '',
            newWeaponTwo: e.target.value,
            newWeaponThree: '',
            inventoryType: inventoryTypeTwo,
        });
    };

    function handleInventoryW3(e) {
        setEditState({
            ...editState,
            [inventoryTypeThree]: e.target.value === ascean[inventoryTypeThree]._id ? ascean.weaponThree : inventory,
            newWeaponOne: '',
            newWeaponTwo: '',
            newWeaponThree: e.target.value,
            inventoryType: inventoryTypeThree,    
        });
    };

    function handleInventoryR2(e) {
        setEditState({
            ...editState,
            [inventoryRingType]: e.target.value === ascean[inventoryRingType]._id ? ascean.ringTwo : inventory,
            newRingOne: '',
            newRingTwo: e.target.value,
            inventoryType: inventoryTypeTwo,
        });
    };
    
    async function checkInventory() {
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
        } catch (err) {
            console.log(err.message, '<- This is the error in checkInventory');
        };
    };

    async function handleUpgradeItem() {
        if (inventory?.rarity === 'Common' && ascean?.currency?.gold < 1) {
            return;
        } else if (inventory?.rarity === 'Uncommon' && ascean?.currency?.gold < 3) {
            return;
        } else if (inventory?.rarity === 'Rare' && ascean?.currency?.gold < 12) {
            return;
        } else if (inventory?.rarity === 'Epic' && ascean?.currency?.gold < 60) {
            return;
        } else if (inventory?.rarity === 'Legendary' && ascean?.currency?.gold < 300) {
            return;
        } else if (inventory?.rarity === 'Mythic' && ascean?.currency?.gold < 1500) {
            return;
        } else if (inventory?.rarity === 'Divine' && ascean?.currency?.gold < 7500) {
            return;
        } else if (inventory?.rarity === 'Ascended' && ascean?.currency?.gold < 37500) {
            return;
        } else if (inventory?.rarity === 'Godly' && ascean?.currency?.gold < 225000) {
            return;
        };
        try {
            // playUnequip();
            console.log(`Upgrading ${inventory?.name} of ${inventory?.rarity} quality.`);
            // setLoadingContent(`Forging A Greater ${inventory?.name}`);
            const matches = pouch.filter((item) => item.name === inventory?.name && item?.rarity === inventory?.rarity);
            const data = {
                asceanID: ascean._id,
                upgradeID: inventory._id,
                upgradeName: inventory.name,
                upgradeType: inventory.itemType,
                currentRarity: inventory.rarity,
                inventoryType: inventoryType,
                upgradeMatches: matches,
            };
            console.log(data, "Upgrading Item?")

            setForgeModalShow(false);
            // setLoadingContent('');

            EventBus.emit('update-inventory-request');
            // dispatch(setCurrency(res.currency));
            
            // playEquip();
        } catch (err) {
            console.log(err.message, '<- Error upgrading item');
        };
    };

    async function handleRemoveItem() {
        try {
            const data = {
                id: ascean._id,
                inventory: inventory,
            };
            await equipmentRemove(data);
            setRemoveModalShow(false);
            // playUnequip();
            EventBus.emit('update-inventory-request');
            EventBus.emit('unequip-sound');
            // dispatch(getOnlyInventoryFetch(ascean._id));
            
        } catch (err) {
            console.log(err.message, '<- This is the error in handleRemoveItem');
        };
    };

    const getRarity = { 
        color: getRarityColor(inventory?.rarity),
    };

    function canEquip(level, rarity) {
        switch (rarity) {
            case 'Common':
                return true;
            case 'Uncommon':
                if (level > 3) return true;
                return false;
            case 'Rare':
                if (level > 5) return true;
                return false;
            case 'Epic':
                if (level > 11) return true;
                return false;
            case 'Legendary':
                if (level > 19) return true;
                return false;
            default:
                return false;
        };
    };

    function equipLevel(rarity) {
        switch (rarity) {
            case 'Common':
                return 0;
            case 'Uncommon':
                return 4;
            case 'Rare':
                return 6;
            case 'Epic':
                return 12;
            case 'Legendary':
                return 20;
            default:
                return 0;
        };
    };

    function textColor(val1, val2) {
        if (val1 === undefined) val1 = 0;
        if (val2 === undefined) val2 = 0;
        if (val1 > val2) {
            return 'green';
        } else if (val1 < val2) {
            return 'red';
        } else {
            return '#fdf6d8';
        };
    };

    function getBorderStyle(rarity) {
        switch (rarity) {
            case 'Common':
                return `white`;
            case 'Uncommon':
                return `green`;
            case 'Rare':
                return `blue`;
            case 'Epic':
                return `purple`;
            case 'Legendary':
                return `orange`;
            default:
                return `grey`;
        };
    };

    const getBackgroundStyle = () => {
        if (scaleImage.scale > 48 && scaleImage.id === inventory?._id) {
            console.log('ScaleImage is greater than 48');
            return 'gold';
        } else if (highlighted && highlighted?.item && (highlighted?.item._id === inventory?._id)) {
            return '#820303';
        } else {
            return 'transparent';
        };
    };

    const getItemStyle = (rarity) => {
        return {
            backgroundColor: getBackgroundStyle(),
            borderColor: getBorderStyle(rarity),
            borderWidth: 1.5, 
        };
    };

    function responsiveSizeStyle(len) {
        if (len >= 18) {
            return {fontSize: 14};
        } else if (len >= 14) {
            return {fontSize: 15};
        } else if (len >= 8) {
            return {fontSize: 16};
        } else {
            return {fontSize: 18};
        };
    };

    const createTable = (inventoryType) => { 
        const asceanName = ascean[inventoryType]?.name.includes('Starter') ? ascean[inventoryType]?.name.split(' ')[0] + ' ' + ascean[inventoryType]?.name.split(' ')[1] : ascean[inventoryType]?.name;
        const inventoryName = inventory?.name.includes('Starter') ? inventory?.name.split(' ')[0] + ' ' + inventory?.name.split(' ')[1] : inventory?.name;
        const asceanTypeGrip = ascean[inventoryType]?.grip && ascean[inventoryType]?.type ? <>
                        {ascean[inventoryType]?.type} [{ascean[inventoryType]?.grip}] {'\n'}
                        {ascean[inventoryType]?.attackType} [{ascean[inventoryType]?.damageType?.[0]}{ascean[inventoryType]?.damageType?.[1] ? ' / ' + ascean[inventoryType]?.damageType[1] : null }{ascean[inventoryType]?.damageType?.[2] ? ' / ' + ascean[inventoryType]?.damageType[2] : null }] 
                </> : ascean[inventoryType]?.type ? <> {ascean[inventoryType]?.type} </> : undefined;
        const inventoryTypeGrip = inventory?.grip && inventory?.type ? <>
                        {inventory?.type} [{inventory?.grip}] {'\n'}
                        {inventory?.attackType} [{inventory?.damageType?.[0]}{inventory?.damageType?.[1] ? ' / ' + inventory?.damageType[1] : '' }{inventory?.damageType?.[2] ? ' / ' + inventory?.damageType[2] : '' }]
                </> : inventory?.type ? inventory?.type : undefined;

        const asceanStats = <>{ascean[inventoryType]?.constitution > 0 ? 'Con: +' + ascean[inventoryType]?.constitution + ' ' : (undefined)}
            {ascean[inventoryType]?.strength > 0 ? 'Str: +' + ascean[inventoryType]?.strength + ' ' : (undefined)}
            {ascean[inventoryType]?.agility > 0 ? 'Agi: +' + ascean[inventoryType]?.agility + ' ' : (undefined)}
            {ascean[inventoryType]?.achre > 0 ? 'Ach: +' + ascean[inventoryType]?.achre + ' ' : (undefined)}
            {ascean[inventoryType]?.caeren > 0 ? 'Caer: +' + ascean[inventoryType]?.caeren + ' ' : (undefined)}
            {ascean[inventoryType]?.kyosir > 0 ? 'Kyo: +' + ascean[inventoryType]?.kyosir + ' ' : (undefined)}</>

        const inventoryStats = <>{inventory?.constitution > 0 ? 'Con: +' + inventory?.constitution + ' ' : (undefined)}
            {inventory?.strength > 0 ? 'Str: +' + inventory?.strength + ' ' : (undefined)}
            {inventory?.agility > 0 ? 'Agi: +' + inventory?.agility + ' ' : (undefined)}
            {inventory?.achre > 0 ? 'Ach: +' + inventory?.achre + ' ' : (undefined)}
            {inventory?.caeren > 0 ? 'Caer: +' + inventory?.caeren + ' ' : (undefined)}
            {inventory?.kyosir > 0 ? 'Kyo: +' + inventory?.kyosir + ' ' : (undefined)}</>

        const asceanDamage = `Damage: ${ascean[inventoryType]?.physicalDamage} Phys | ${ascean[inventoryType]?.magicalDamage} Magi`
        const inventoryDamage = `Damage: ${inventory?.physicalDamage} Phys | ${inventory?.magicalDamage} Magi`
        const asceanDefense = ascean[inventoryType]?.physicalResistance || ascean[inventoryType]?.magicalResistance ? `Defense: ${ascean[inventoryType]?.physicalResistance} Phys | ${ascean[inventoryType]?.magicalResistance} Magi` : 'Defense: 0 Phys | 0 Magi';
        const inventoryDefense = inventory?.physicalResistance || inventory?.magicalResistance ? 
                `Defense: ${inventory?.physicalResistance} Phys | ${inventory?.magicalResistance} Magi`
                : 'Defense: 0 Phys | 0 Magi';
        const asceanPenetration = ascean[inventoryType]?.physicalPenetration || ascean[inventoryType]?.magicalPenetration ? 
                `Pen: ${ascean[inventoryType]?.physicalPenetration} Phys | ${ascean[inventoryType]?.magicalPenetration} Magi`
                : 'Pen: 0 Phys | 0 Magi';
        const inventoryPenetration = inventory?.physicalPenetration || inventory?.magicalPenetration ? 
                `Pen: ${inventory?.physicalPenetration} Phys | ${inventory?.magicalPenetration} Magi`
                : 'Pen: 0 Phys | 0 Magi';
        const asceanCritChance = `Crit Chance: ${ascean[inventoryType]?.criticalChance}%`;
        const inventoryCritChance = `Crit Chance: ${inventory?.criticalChance}%`;
        const asceanCritDamage = `Crit Damage: ${ascean[inventoryType]?.criticalDamage}x`;
        const inventoryCritDamage = `Crit Damage: ${inventory?.criticalDamage}x`;
        const asceanRoll = `Roll Chance: ${ascean[inventoryType]?.roll}%`;
        const inventoryRoll = `Roll Chance: ${inventory?.roll}%`;
        const asceanInfluence = ascean[inventoryType]?.influences && ascean[inventoryType]?.influences?.length > 0 ?
                `Influence: ${ascean[inventoryType]?.influences?.[0]}` : undefined;
        const inventoryInfluence = inventory?.influences && inventory?.influences?.length > 0 ?
                `Influence: ${inventory?.influences?.[0]}` : undefined;

        return (
            <div style={[styles.table, orientation === 'landscape' ? { width: width * 0.335 } : { width: width * 0.975 }]}>
                <div style={styles.row}>
                    <div style={[styles.cell, styles.gold, responsiveSizeStyle(asceanName?.length)]}>{asceanName}
                    <Image source={IMAGES[ascean[inventoryType]?.imgUrl.split('/')[3].split('.')[0]]} />
                    </div>
                    <div style={[styles.cell, styles.gold, responsiveSizeStyle(inventoryName?.length)]}>{inventoryName}
                    <Image source={IMAGES[inventory?.imgUrl.split('/')[3].split('.')[0]]} />
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={[styles.cell, responsiveSizeStyle(asceanTypeGrip?.toString().length)]}>{asceanTypeGrip}</div>
                    <div style={[styles.cell, responsiveSizeStyle(inventoryTypeGrip?.toString().length)]}>{inventoryTypeGrip}</div>
                </div>
                { inventory?.constituion > 0 || ascean[inventoryType]?.constitution > 0 || inventory?.strength > 0 || ascean[inventoryType]?.strength > 0 || inventory?.agility > 0 || ascean[inventoryType]?.agility > 0 || inventory?.achre > 0 || ascean[inventoryType]?.achre > 0 || inventory?.caeren > 0 || ascean[inventoryType]?.caeren > 0 || inventory?.kyosir > 0 || ascean[inventoryType]?.kyosir > 0 ? (
                <div style={styles.row}>
                    <div style={[styles.cell, responsiveSizeStyle(asceanStats?.toString()?.length), { color: textColor((ascean[inventoryType]?.constitution + ascean[inventoryType]?.strength + ascean[inventoryType]?.agility + ascean[inventoryType]?.achre + ascean[inventoryType]?.caeren + ascean[inventoryType]?.kyosir), 
                        (inventory?.constitution + inventory?.strength + inventory?.agility + inventory?.achre + inventory?.caeren + inventory?.kyosir)) }]}>
                        {asceanStats}
                        </div>
                    <div style={[styles.cell, responsiveSizeStyle(inventoryStats?.toString()?.length), { color: textColor((inventory?.constitution + inventory?.strength + inventory?.agility + inventory?.achre + inventory?.caeren + inventory?.kyosir), 
                        (ascean[inventoryType]?.constitution + ascean[inventoryType]?.strength + ascean[inventoryType]?.agility + ascean[inventoryType]?.achre + ascean[inventoryType]?.caeren + ascean[inventoryType]?.kyosir)) }]}>
                        {inventoryStats}
                    </div>
                </div>
                ) : ( undefined )}
                { (inventory?.physicalDamage && inventory?.grip) || (inventory?.magicalDamage && inventory?.grip) ? (
                <div style={styles.row}>
                    <div style={[styles.cell, responsiveSizeStyle(asceanDamage.length), { color: textColor((ascean[inventoryType]?.physicalDamage + ascean[inventoryType]?.magicalDamage), (inventory?.physicalDamage + inventory?.magicalDamage)) }]}>
                        {asceanDamage}
                    </div>
                    <div style={[styles.cell, responsiveSizeStyle(inventoryDamage.length), { color: textColor((inventory?.physicalDamage + inventory?.magicalDamage), (ascean[inventoryType]?.physicalDamage + ascean[inventoryType]?.magicalDamage)) }]}>
                        {inventoryDamage}
                    </div>
                </div>
                ) : ( undefined ) }
                { inventory?.physicalResistance > 0 || ascean[inventoryType]?.physicalResistance > 0 || inventory?.magicalResistance > 0 || ascean[inventoryType]?.magicalResistance ? 
                    <div style={styles.row}>
                        <div style={[styles.cell, responsiveSizeStyle(asceanDefense?.length), { color: textColor((ascean[inventoryType]?.physicalResistance + ascean[inventoryType]?.magicalResistance), (inventory?.physicalResistance + inventory?.magicalResistance)) }]}>
                            {asceanDefense}
                        </div>
                        <div style={[styles.cell, responsiveSizeStyle(inventoryDefense?.length), { color: textColor((inventory?.physicalResistance + inventory?.magicalResistance), (ascean[inventoryType]?.physicalResistance + ascean[inventoryType]?.magicalResistance)) }]}>
                            {inventoryDefense}
                        </div>
                    </div>
                : ( undefined ) }            
                {inventory?.magicalPenetration > 0 || ascean[inventoryType]?.magicalPenetration > 0 || inventory?.physicalPenetration > 0 || ascean[inventoryType]?.physicalPenetration > 0 ? (
                <div style={styles.row}>
                    <div style={[styles.cell, responsiveSizeStyle(asceanPenetration.length), { color: textColor((ascean[inventoryType]?.physicalPenetration + ascean[inventoryType]?.magicalPenetration), (inventory?.physicalPenetration + inventory?.magicalPenetration)) }]}>
                        {asceanPenetration}
                    </div>
                    <div style={[styles.cell, responsiveSizeStyle(inventoryPenetration.length), { color: textColor((inventory?.physicalPenetration + inventory?.magicalPenetration), (ascean[inventoryType]?.physicalPenetration + ascean[inventoryType]?.magicalPenetration)) }]}>
                        {inventoryPenetration}
                    </div>
                </div>
                ) : ( undefined ) }
                <div style={styles.row}>
                    <div style={[styles.cell,responsiveSizeStyle(asceanCritChance.length), { color: textColor(ascean[inventoryType]?.criticalChance, inventory?.criticalChance) }]}>
                        {asceanCritChance}
                    </div>
                    <div style={[styles.cell, responsiveSizeStyle(inventoryCritChance.length), { color: textColor(inventory?.criticalChance, ascean[inventoryType]?.criticalChance) }]}>
                        {inventoryCritChance}
                    </div>
                </div>
                <div style={styles.row}>
                    <div style={[styles.cell, responsiveSizeStyle(asceanCritDamage.length), { color: textColor(ascean[inventoryType]?.criticalDamage, inventory?.criticalDamage) }]}>
                        {asceanCritDamage}
                    </div>
                    <div style={[styles.cell, responsiveSizeStyle(inventoryCritDamage.length), { color: textColor(inventory?.criticalDamage, ascean[inventoryType]?.criticalDamage) }]}>
                        {inventoryCritDamage}
                    </div>
                </div> 
                <div style={styles.row}>
                    <div style={[styles.cell, responsiveSizeStyle(asceanRoll.length), { color: textColor(ascean[inventoryType]?.roll, inventory?.roll) }]}>
                        {asceanRoll}
                    </div>
                    <div style={[styles.cell, responsiveSizeStyle(inventoryRoll.length), { color: textColor(inventory?.roll, ascean[inventoryType]?.roll) }]}>
                        {inventoryRoll}
                    </div>
                </div>
                {inventory?.influences?.length > 0 || ascean[inventoryType]?.influences?.length > 0 ?
                <div style={styles.row}>
                    <div style={[styles.cell, font(14)]}>
                    {asceanInfluence}
                    </div>
                    <div style={[styles.cell, font(14)]}>
                    {inventoryInfluence}
                    </div>
                </div>
                : null }
                <div style={styles.row}>
                    <div style={[styles.cell, font(18), getRarity]}>{inventory?.rarity}</div>
                    <div style={[styles.cell, font(18), { color: getRarityColor(ascean[inventoryType]?.rarity)}]}>
                        {ascean[inventoryType]?.rarity}
                    </div>
                </div>
            </div>  
        );
    };

    return (
        <>
        {/* <Modal show={forgeModalShow} onHide={() => setForgeModalShow(false)} centered id='modal-weapon' style={{ zIndex: 1, top: '-25%' }}>
            <div style={{ color: "red", fontSize: "18px" }}>
                Do You Wish To Collapse Three {inventory?.name} into one of {GET_NEXT_RARITY[inventory?.rarity]} Quality for {GET_FORGE_COST[inventory?.rarity]} Gold?
            </div>
            <div>
                <button style={{ color: 'gold', fontWeight: 600, fontSize: "24px" }} onClick={() => handleUpgradeItem()}>{GET_FORGE_COST[inventory?.rarity]} Gold Forge 
                </button>    
                <div style={{ color: "gold", fontSize: "24px", fontWeight: 600 }}>
                (3) <img src={inventory?.imgUrl} alt={inventory?.name} style={getCurrentItemStyle} /> {'=>'} <img src={inventory?.imgUrl} alt={inventory?.name} style={getNewItemStyle} />
                </div>
            </div>
        </Modal> */}
        { compare ? ( 
        <>
            { inventoryType === 'weaponOne' ? (
                <div style={{ flex: 1, overflow: 'scroll' }}>
                    {createTable(weaponCompared)} 
                </div> 
            ) : inventoryType === 'ringOne' ? (
                <div style={{ flex: 1, overflow: 'scroll' }}>{createTable(ringCompared)}</div>
            ) : <div style={{ flex: 1, overflow: 'scroll' }}>{createTable(inventoryType)}</div> } 
            <br />
            <div style={{ width: "100%", textAlign: "center", marginTop: 3 }}>
            { canEquip(ascean?.level, inventory?.rarity) ? ( <> 
                <button style={[styles.bottomLeftCorner, { left: 10, bottom: orientation === 'landscape' ? 10 : 10 }]} onClick={() => setRemoveModalShow(!removeModalShow)}>
                    <div style={{ color: 'red' }}>Remove</div>
                </button>
                { (inventoryType === 'weaponOne' || inventoryType === 'ringOne') && (
                    <button style={[styles.bottomLeftCorner, { left: '44%', bottom: orientation === 'landscape' ? 10 : 10 }]} onClick={() => setInspector()}>
                        <div style={{ color: '#fdf6d8' }}>Inspect</div>
                    </button>
                ) }
                { canEquip(ascean?.level, inventory?.rarity) && (
                    <button style={[styles.bottomRightCorner, { right: 10, bottom: orientation === 'landscape' ? 10 : 10 }]} onClick={() => setEquipper()}>
                        <div style={{ color: 'green' }}>Equip</div>
                    </button> 
                ) }
            </> ) : ( <>
                <div style={[font(14, 'gold'), styles.center, styles.wrap]}>
                    Unforuntaely for you, {inventory?.name} requires one to be level {equipLevel(inventory?.rarity)} to equip.
                    {'\n'}{'\n'}    
                </div>
                <button style={[styles.bottomLeftCorner, { left: '44%', bottom: orientation === 'landscape' ? 10 : 10 }]}>
                        <div style={{ color: 'red' }}>Remove</div>
                    </button>
            </> ) }
            </div>
        </> 
        ) : (
            <div style={[styles.playerInventory, getItemStyle(inventory?.rarity),
            { transform: [{ scale: scaleImage.scale > 48 && scaleImage.id === inventory?._id && highlighted && highlighted?.item && highlighted?.item._id === inventory?._id ? 1.15 : 1 }] }] }>
                <button onClick={() => setHighlighted({ item: inventory, comparing: true, type: inventoryType })}>
                    <Image source={IMAGES[inventory?.imgUrl.split('/')[3].split('.')[0]]} />
                </button>
            </div>
        ) }
        {/* { blacksmith && ( 
            <button variant='outline' className='blacksmith-forge' onClick={() => setForgeModalShow(true)}>Forge</button>
        ) } */} 
        </>
    );
};

export default Inventory;