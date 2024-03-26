import { font, getRarityColor } from "../utility/styling"
import { Show } from "solid-js";
import { useResizeListener } from "../utility/dimensions";
import Equipment from "../models/equipment";

function attrSplitter(string: string, value: number) {
    return <span>{string}: <span class='gold'>+{value} </span></span>
};

interface Props {
    item: Equipment | undefined;
    stalwart: boolean;
    caerenic: boolean;
};


export default function ItemModal({ item, stalwart, caerenic }: Props) {
    if (!item) return undefined;
    const attribute = item?.constitution + item?.strength + item?.agility + item?.achre + item?.caeren + item?.kyosir;
    const dimensions = useResizeListener();
    const empty = item.name.includes('Empty');
    const name = item.name.includes('Starter') ? ( item.name.split(' ')[0] + ' ' + item.name.split(' ')[1] ) : ( item.name );
    const centerImage = dimensions()?.ORIENTATION === 'landscape' ? (name.length > 10 ? '7.5%' : '15%') : (name.length > 13 ? '40%' : name.length > 10 ? '5%' : '10%');
    return (
        <div class="border superCenter" style={{ width: dimensions()?.ORIENTATION === 'landscape' ? '50%' : '75%' }}> 
            <div class='border' style={{ height: '100%' }}>
                <div class='creature-heading' style={{ width: '100%'}}>
                    <h1 style={ empty ? { 'text-align': 'center' } : { 'justify-content': 'space-evenly' }}>
                        {name} 
                            <Show when={!empty}>
                            <span style={{ transform: 'scale(1.2)', float: 'right', 'margin-right': centerImage }}>
                                <img src={item.imgUrl} />
                            </span>
                            </Show>
                    </h1>
                </div>
                <Show when={!empty}> 
                <svg height="5" width="100%" class="tapered-rule mt-2">
                    <polyline points="0,0 400,2.5 0,5"></polyline>
                </svg>
                <div class='center'>
                    <Show when={item?.type && item?.grip}>
                        <p class='my-2' style={font('1.25em')}>
                            {item?.type} [<span style={{ 'font-style': 'italic', color: 'gold' }}>{item?.grip}</span>] <br />
                            {item?.attackType} [<span style={{ 'font-style': 'italic', color: 'gold' }}>{item?.damageType?.[0]}{item?.damageType?.[1] ? ' / ' + item.damageType[1] : '' }{item?.damageType?.[2] ? ' / ' + item?.damageType?.[2] : '' }</span>] <br />
                        </p>
                    </Show>
                    <Show when={item?.type && !item?.grip}>
                        <p class='my-2' style={font('1.25em')}>{item.type}</p>
                    </Show>
                    { item?.constitution > 0 ? attrSplitter('CON', item?.constitution) : '' }
                    { item?.strength > 0 ? attrSplitter('STR', item?.strength) : '' }
                    { item?.agility > 0 ? attrSplitter('AGI', item?.agility) : '' }
                    { item?.achre > 0 ? attrSplitter('ACH', item?.achre) : '' }
                    { item?.caeren > 0 ? attrSplitter('CAER', item?.caeren) : '' }
                    { item?.kyosir > 0 ? attrSplitter('KYO', item?.kyosir) : '' }
                    { attribute ? <br /> : '' }
                    Damage: <span class='gold'>{item?.physicalDamage}</span> Phys | <span class='gold'>{item?.magicalDamage}</span> Magi <br />
                    <Show when={item?.physicalResistance || item?.magicalResistance}>
                        Defense: <span class='gold'>{item?.physicalResistance}</span> Phys | <span class='gold'>{item?.magicalResistance}</span> Magi <br />
                    </Show>
                    <Show when={item?.physicalPenetration || item?.magicalPenetration}>
                        Penetration: <span class='gold'>{item?.physicalPenetration}</span> Phys | <span class='gold'>{item?.magicalPenetration}</span> Magi <br />
                    </Show>
                    Crit Chance: <span class='gold'>{item?.criticalChance}%</span> <br />
                    Crit Damage: <span class='gold'>{item?.criticalDamage}x</span> <br />
                    Roll Chance: <span class='gold'>{item?.roll}%</span> <br />
                    <Show when={item?.influences && item?.influences?.length > 0}>
                        Influence: <span class='gold'>{item?.influences?.[0]}</span>
                    </Show>
                    <div style={{ color: getRarityColor(item?.rarity as string), 'font-size': '1.5em', 'margin-top': '3%' }}>
                        {item?.rarity}
                    </div>
                    <Show when={stalwart}>
                        <p class='gold' style={{ 'font-size': '0.75em' }}>
                            Stalwart - You are engaged in combat with your shield raised, adding it to your passive defense. 
                            You receive 50% less poise damage. 
                            You receive 10% less damage. 
                            You cannot dodge or roll.
                            <br /><br />
                        </p>
                    </Show>
                    <Show when={caerenic}>
                        <p class='gold' style={{ 'font-size': '0.75em' }}>
                            Caerenic - You attempt to harnass your caer with your achre, increasing your damage by 15%. 
                            You move 15% faster. 
                            You receive 25% more damage. 
                            <br /><br />
                        </p>
                    </Show>
                </div> 
                </Show>
                <div class='gold'>{item.gameplay}</div>
            </div>
        </div>
    );
};