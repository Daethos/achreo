import { Accessor, Setter, createEffect, createSignal } from "solid-js";
import Equipment from "../models/equipment";
import Ascean from "../models/ascean";
import { useResizeListener } from "../utility/dimensions";
import { EventBus } from "../game/EventBus";
import { font, getRarityColor } from "../utility/styling";

interface Props {
    ascean: Accessor<Ascean>;
    highlighted: Accessor<{ item: Equipment; comparing: boolean; type: string }>;
    inventoryType: Accessor<string>;
    weaponCompared: Accessor<string>;
    ringCompared: Accessor<string>;
    setRemoveModalShow: Setter<boolean>;
    removeModalShow: Accessor<boolean>;
    setInspectModalShow: Setter<boolean>;
    setInspectItems: Setter<{ item: Equipment | undefined; type: string; }[]>;
};

export default function Highlight({ ascean, highlighted, inventoryType, ringCompared, weaponCompared, setInspectItems, setInspectModalShow, setRemoveModalShow, removeModalShow }: Props) {
    const [trueType, setTrueType] = createSignal<string>('');
    const dimensions = useResizeListener();

    createEffect(() => {
        if (inventoryType() === 'weaponOne') {
            setTrueType(weaponCompared());
        } else if (inventoryType() === 'ringOne') {
            setTrueType(ringCompared());
        } else {
            setTrueType(inventoryType());
        };
    });

    function canEquip(level: number, rarity: string): boolean {
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

    function equipLevel(rarity: string): number {
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

    function setEquipper() {
        let type;
        console.log(inventoryType(), 'Inventory Type', weaponCompared(), 'Weapon Compared', ringCompared(), 'Ring Compared');
        if (inventoryType() === 'weaponOne') {
            type = weaponCompared();
        } else if (inventoryType() === 'ringOne') {
            type = ringCompared();
        } else {
            type = inventoryType();
        };
        EventBus.emit('set-equipper', { type, item: highlighted()?.item });
        // setEquipModalShow(true);
    };

    function setInspector() {
        if (inventoryType() === 'weaponOne') {
            setInspectItems([{ item: ascean().weaponOne, type: 'weaponOne' }, { item: ascean().weaponTwo, type: 'weaponTwo' }, { item: ascean().weaponThree, type: 'weaponThree'}]);
        } else if (inventoryType() === 'ringOne') {
            setInspectItems([{ item: ascean().ringOne, type: 'ringOne' }, { item: ascean().ringTwo, type: 'ringTwo' }]);
        };
        setInspectModalShow(true);
    };

    function responsiveSizeStyle(len: number): string {
        if (len >= 18) {
            return '0.75em';
        } else if (len >= 14) {
            return '0.8em';
        } else if (len >= 8) {
            return '0.85em';
        } else {
            return '0.9em';
        };
    };

    function textColor(val1: number | undefined, val2: number | undefined): string {
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

    const createTable = (inventoryType: Accessor<string>) => { 
        console.log(inventoryType(), 'Inventory Type');
        const asceanName = ascean()[inventoryType()]?.name.includes('Starter') ? ascean()[inventoryType()]?.name.split(' ')[0] + ' ' + ascean()[inventoryType()]?.name.split(' ')[1] : ascean()[inventoryType()]?.name;
        const inventoryName = highlighted()?.item?.name.includes('Starter') ? highlighted()?.item?.name.split(' ')[0] + ' ' + highlighted()?.item?.name.split(' ')[1] : highlighted()?.item?.name;
        const asceanTypeGrip = ascean()[inventoryType()]?.grip && ascean()[inventoryType()]?.type ? <>
                        {ascean()[inventoryType()]?.type} [{ascean()[inventoryType()]?.grip}]
                        {ascean()[inventoryType()]?.attackType} [{ascean()[inventoryType()]?.damageType?.[0]}{ascean()[inventoryType()]?.damageType?.[1] ? ' / ' + ascean()[inventoryType()]?.damageType[1] : null }{ascean()[inventoryType()]?.damageType?.[2] ? ' / ' + ascean()[inventoryType()]?.damageType[2] : null }] 
                </> : ascean()[inventoryType()]?.type ? <> {ascean()[inventoryType()]?.type} </> : undefined;
        const inventoryTypeGrip = highlighted()?.item?.grip && highlighted()?.item?.type ? <div style={{ 'text-wrap': 'balance' }}>
                        {highlighted()?.item?.type} [{highlighted()?.item?.grip}]{'\n\n'}
                        {highlighted()?.item?.attackType} [{highlighted()?.item?.damageType?.[0]}{highlighted()?.item?.damageType?.[1] ? ' / ' + highlighted()?.item?.damageType?.[1] : '' }{highlighted()?.item?.damageType?.[2] ? ' / ' + highlighted()?.item?.damageType?.[2] : '' }]
                </div> : highlighted()?.item?.type ? highlighted()?.item?.type : undefined;

        const asceanStats = <>{ascean()[inventoryType()]?.constitution > 0 ? 'Con: +' + ascean()[inventoryType()]?.constitution + ' ' : (undefined)}
            {ascean()[inventoryType()]?.strength > 0 ? 'Str: +' + ascean()[inventoryType()]?.strength + ' ' : (undefined)}
            {ascean()[inventoryType()]?.agility > 0 ? 'Agi: +' + ascean()[inventoryType()]?.agility + ' ' : (undefined)}
            {ascean()[inventoryType()]?.achre > 0 ? 'Ach: +' + ascean()[inventoryType()]?.achre + ' ' : (undefined)}
            {ascean()[inventoryType()]?.caeren > 0 ? 'Caer: +' + ascean()[inventoryType()]?.caeren + ' ' : (undefined)}
            {ascean()[inventoryType()]?.kyosir > 0 ? 'Kyo: +' + ascean()[inventoryType()]?.kyosir + ' ' : (undefined)}</>

        const inventoryStats = <>{highlighted()?.item?.constitution > 0 ? 'Con: +' + highlighted()?.item?.constitution + ' ' : (undefined)}
            {highlighted()?.item?.strength > 0 ? 'Str: +' + highlighted()?.item?.strength + ' ' : (undefined)}
            {highlighted()?.item?.agility > 0 ? 'Agi: +' + highlighted()?.item?.agility + ' ' : (undefined)}
            {highlighted()?.item?.achre > 0 ? 'Ach: +' + highlighted()?.item?.achre + ' ' : (undefined)}
            {highlighted()?.item?.caeren > 0 ? 'Caer: +' + highlighted()?.item?.caeren + ' ' : (undefined)}
            {highlighted()?.item?.kyosir > 0 ? 'Kyo: +' + highlighted()?.item?.kyosir + ' ' : (undefined)}</>

        const asceanDamage = `Damage: ${ascean()[inventoryType()]?.physicalDamage} Phys | ${ascean()[inventoryType()]?.magicalDamage} Magi`
        const inventoryDamage = `Damage: ${highlighted()?.item?.physicalDamage} Phys | ${highlighted()?.item?.magicalDamage} Magi`
        const asceanDefense = ascean()[inventoryType()]?.physicalResistance || ascean()[inventoryType()]?.magicalResistance ? `Defense: ${ascean()[inventoryType()]?.physicalResistance} Phys | ${ascean()[inventoryType()]?.magicalResistance} Magi` : 'Defense: 0 Phys | 0 Magi';
        const inventoryDefense = highlighted()?.item?.physicalResistance || highlighted()?.item?.magicalResistance ? 
                `Defense: ${highlighted()?.item?.physicalResistance} Phys | ${highlighted()?.item?.magicalResistance} Magi`
                : 'Defense: 0 Phys | 0 Magi';
        const asceanPenetration = ascean()[inventoryType()]?.physicalPenetration || ascean()[inventoryType()]?.magicalPenetration ? 
                `Pen: ${ascean()[inventoryType()]?.physicalPenetration} Phys | ${ascean()[inventoryType()]?.magicalPenetration} Magi`
                : 'Pen: 0 Phys | 0 Magi';
        const inventoryPenetration = highlighted()?.item?.physicalPenetration || highlighted()?.item?.magicalPenetration ? 
                `Pen: ${highlighted()?.item?.physicalPenetration} Phys | ${highlighted()?.item?.magicalPenetration} Magi`
                : 'Pen: 0 Phys | 0 Magi';
        const asceanCritChance = `Crit Chance: ${ascean()[inventoryType()]?.criticalChance}%`;
        const inventoryCritChance = `Crit Chance: ${highlighted()?.item?.criticalChance}%`;
        const asceanCritDamage = `Crit Damage: ${ascean()[inventoryType()]?.criticalDamage}x`;
        const inventoryCritDamage = `Crit Damage: ${highlighted()?.item?.criticalDamage}x`;
        const asceanRoll = `Roll Chance: ${ascean()[inventoryType()]?.roll}%`;
        const inventoryRoll = `Roll Chance: ${highlighted()?.item?.roll}%`;
        const asceanInfluence = ascean()[inventoryType()]?.influences && ascean()[inventoryType()]?.influences?.length > 0 ?
                `Influence: ${ascean()[inventoryType()]?.influences?.[0]}` : undefined;
        const inventoryInfluence = highlighted()?.item?.influences && highlighted()?.item?.influences?.length as number > 0 ?
                `Influence: ${highlighted()?.item?.influences?.[0]}` : undefined;

        return (
            <table style={dimensions().ORIENTATION === 'landscape' ? { width: `${dimensions().WIDTH * 0.32}px`, overflow: 'scroll' } : { width: `${dimensions().WIDTH * 0.975}px` }}>
            <tbody>
                <tr>
                    <td class='border gold' style={{ 'font-size': responsiveSizeStyle(asceanName?.length) }}>{asceanName}
                    <img src={ascean()[inventoryType()]?.imgUrl} />
                    </td>
                    <td class='border gold' style={{ 'font-size': responsiveSizeStyle(inventoryName?.length) }}>{inventoryName}
                    <img src={highlighted()?.item?.imgUrl} />
                    </td>
                </tr>

                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanTypeGrip?.toString().length as number) }}>{asceanTypeGrip}</td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryTypeGrip?.toString().length as number) }}>{inventoryTypeGrip}</td>
                </tr>
                { highlighted()?.item?.constituion > 0 || ascean()[inventoryType()]?.constitution > 0 || highlighted()?.item?.strength > 0 || ascean()[inventoryType()]?.strength > 0 || highlighted()?.item?.agility > 0 || ascean()[inventoryType()]?.agility > 0 || highlighted()?.item?.achre > 0 || ascean()[inventoryType()]?.achre > 0 || highlighted()?.item?.caeren > 0 || ascean()[inventoryType()]?.caeren > 0 || highlighted()?.item?.kyosir > 0 || ascean()[inventoryType()]?.kyosir > 0 ? (
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanStats?.toString()?.length as number), color: textColor((ascean()[inventoryType()]?.constitution + ascean()[inventoryType()]?.strength + ascean()[inventoryType()]?.agility + ascean()[inventoryType()]?.achre + ascean()[inventoryType()]?.caeren + ascean()[inventoryType()]?.kyosir), 
                        (highlighted()?.item?.constitution + highlighted()?.item?.strength + highlighted()?.item?.agility + highlighted()?.item?.achre + highlighted()?.item?.caeren + highlighted()?.item?.kyosir)) }}>
                        {asceanStats}
                        </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryStats?.toString()?.length as number), color: textColor((highlighted()?.item?.constitution + highlighted()?.item?.strength + highlighted()?.item?.agility + highlighted()?.item?.achre + highlighted()?.item?.caeren + highlighted()?.item?.kyosir), 
                        (ascean()[inventoryType()]?.constitution + ascean()[inventoryType()]?.strength + ascean()[inventoryType()]?.agility + ascean()[inventoryType()]?.achre + ascean()[inventoryType()]?.caeren + ascean()[inventoryType()]?.kyosir)) }}>
                        {inventoryStats}
                    </td>
                </tr>
                ) : ( undefined )}
                { (highlighted()?.item?.physicalDamage && highlighted()?.item?.grip) || (highlighted()?.item?.magicalDamage && highlighted()?.item?.grip) ? (
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanDamage.length), color: textColor((ascean()[inventoryType()]?.physicalDamage + ascean()[inventoryType()]?.magicalDamage), (highlighted()?.item?.physicalDamage + highlighted()?.item?.magicalDamage)) }}>
                        {asceanDamage}
                    </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryDamage.length), color: textColor((highlighted()?.item?.physicalDamage + highlighted()?.item?.magicalDamage), (ascean()[inventoryType()]?.physicalDamage + ascean()[inventoryType()]?.magicalDamage)) }}>
                        {inventoryDamage}
                    </td>
                </tr>
                ) : ( undefined ) }
                { highlighted()?.item?.physicalResistance as number > 0 || ascean()[inventoryType()]?.physicalResistance > 0 || highlighted()?.item?.magicalResistance as number > 0 || ascean()[inventoryType()]?.magicalResistance ? 
                    <tr>
                        <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanDefense?.length), color: textColor((ascean()[inventoryType()]?.physicalResistance + ascean()[inventoryType()]?.magicalResistance), (highlighted()?.item?.physicalResistance as number + (highlighted()?.item?.magicalResistance ?? 0))) }}>
                            {asceanDefense}
                        </td>
                        <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryDefense?.length), color: textColor((highlighted()?.item?.physicalResistance as number + (highlighted()?.item?.magicalResistance ?? 0)), (ascean()[inventoryType()]?.physicalResistance + ascean()[inventoryType()]?.magicalResistance)) }}>
                            {inventoryDefense}
                        </td>
                    </tr>
                : ( undefined ) }            
                { ((highlighted()?.item?.magicalPenetration && highlighted()?.item?.magicalPenetration as number > 0) || ascean()[inventoryType()]?.magicalPenetration > 0 || (highlighted()?.item?.physicalPenetration && highlighted()?.item?.physicalPenetration as number > 0) || ascean()[inventoryType()]?.physicalPenetration > 0) ? (
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanPenetration.length), color: textColor((ascean()[inventoryType()]?.physicalPenetration + ascean()[inventoryType()]?.magicalPenetration), (highlighted()?.item?.physicalPenetration as number + (highlighted()?.item?.magicalPenetration ?? 0))) }}>
                        {asceanPenetration}
                    </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryPenetration.length), color: textColor((highlighted()?.item?.physicalPenetration as number + (highlighted()?.item?.magicalPenetration ?? 0)), (ascean()[inventoryType()]?.physicalPenetration + ascean()[inventoryType()]?.magicalPenetration)) }}>
                        {inventoryPenetration}
                    </td>
                </tr>
                ) : ( undefined ) }
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanCritChance.length), color: textColor(ascean()[inventoryType()]?.criticalChance, highlighted()?.item?.criticalChance) }}>
                        {asceanCritChance}
                    </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryCritChance.length), color: textColor(highlighted()?.item?.criticalChance, ascean()[inventoryType()]?.criticalChance) }}>
                        {inventoryCritChance}
                    </td>
                </tr>
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanCritDamage.length), color: textColor(ascean()[inventoryType()]?.criticalDamage, highlighted()?.item?.criticalDamage) }}>
                        {asceanCritDamage}
                    </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryCritDamage.length), color: textColor(highlighted()?.item?.criticalDamage, ascean()[inventoryType()]?.criticalDamage) }}>
                        {inventoryCritDamage}
                    </td>
                </tr> 
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(asceanRoll.length), color: textColor(ascean()[inventoryType()]?.roll, highlighted()?.item?.roll) }}>
                        {asceanRoll}
                    </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(inventoryRoll.length), color: textColor(highlighted()?.item?.roll, ascean()[inventoryType()]?.roll) }}>
                        {inventoryRoll}
                    </td>
                </tr>
                { (highlighted()?.item?.influences?.length as number > 0 || ascean()[inventoryType()]?.influences?.length > 0) ?
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(ascean()[inventoryType()]?.influences?.length)}}>
                    {asceanInfluence}
                    </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(highlighted()?.item?.influences?.length as number)}}>
                    {inventoryInfluence}
                    </td>
                </tr>
                : ( undefined ) }
                <tr>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(ascean()[inventoryType()]?.rarity?.length as number), color: getRarityColor(ascean()[inventoryType()]?.rarity)}}>
                        {ascean()[inventoryType()]?.rarity}
                    </td>
                    <td class='border' style={{ 'font-size': responsiveSizeStyle(highlighted()?.item?.rarity?.length as number), color: getRarityColor(highlighted()?.item?.rarity as string)}}>{highlighted()?.item?.rarity}</td>
                </tr>

            </tbody>
            </table>  
        );
    };
    return (
        <>
            <div style={{ overflow: 'scroll', height: `${dimensions().HEIGHT * 0.7}px` }}>
                {createTable(trueType)}
            </div>
            {/* <br /> */}
            <div style={{ width: "100%", 'text-align': "center", 'margin-top': '3%' }}>
            { canEquip(ascean()?.level, highlighted()?.item?.rarity as string) ? ( <> 
                <button class='highlight cornerBL' style={{ left: '0', bottom: dimensions().ORIENTATION === 'landscape' ? '0' : '0', 'font-size': '0.5em' }} onClick={() => setRemoveModalShow(!removeModalShow())}>
                    <div style={{ color: 'red' }}>Remove</div>
                </button>
                { (inventoryType() === 'weaponOne' || inventoryType() === 'ringOne') && (
                    <button class='highlight cornerBL' style={{ transform: 'translateX(-50%)', left: '50%', bottom: dimensions().ORIENTATION === 'landscape' ? '0' : '0', 'font-size': '0.5em' }} onClick={() => setInspector()}>
                        <div style={{ color: '#fdf6d8' }}>Inspect</div>
                    </button>
                ) }
                { canEquip(ascean()?.level, highlighted()?.item?.rarity as string) && (
                    <button class='highlight cornerBR' style={{ right: '0', bottom: dimensions().ORIENTATION === 'landscape' ? '0' : '0', 'font-size': '0.5em' }} onClick={() => setEquipper()}>
                        <div style={{ color: 'green' }}>Equip</div>
                    </button> 
                ) }
            </> ) : ( <>
                <div class='center' style={font('1em', 'gold')}>
                    Unforuntaely for you, {highlighted()?.item?.name} requires one to be level {equipLevel(highlighted()?.item?.rarity as string)} to equip.
                    {'\n'}{'\n'}    
                </div>
                <button class='highlight cornerBL' style={{ left: '44%', bottom: dimensions().ORIENTATION === 'landscape' ? '0' : '0', 'font-size': '0.5em' }}>
                        <div style={{ color: 'red' }}>Remove</div>
                    </button>
            </> ) }
            </div>
        </> 
    );
};