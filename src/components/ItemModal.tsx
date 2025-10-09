import { getRarityColor } from "../utility/styling"
import { Accessor, Show } from "solid-js";
import { dimensions } from "../utility/dimensions";
import Equipment from "../models/equipment";
import { roundToTwoDecimals } from "../utility/combat";
import { specialDescription } from "../ui/CombatSettings";
import Talents from "../utility/talents";

export function attrSplitter(string: string, value: number) {
    if (value <= 0) return "";
    return <span>{string}: <span class="gold">+{value} </span></span>
};

interface Props {
    item: Equipment | undefined;
    stalwart: boolean;
    caerenic: boolean;
    prayer?: Accessor<string>;
    talents?: Accessor<Talents>;
};

export default function ItemModal({ item, stalwart, caerenic, prayer, talents }: Props) {
    if (!item) return undefined;
    const attribute = item?.constitution + item?.strength + item?.agility + item?.achre + item?.caeren + item?.kyosir;
    const dims = dimensions();
    const poly = dims.WIDTH * 0.45;
    const scale = dims.WIDTH / 800;
    const empty = item.name.includes("Empty");
    const name = item.name.includes("Starter") ? ( item.name.split(" ")[0] + " " + item.name.split(" ")[1] ) : ( item.name );
    const centerImage = dims.ORIENTATION === "landscape" ? (name.length > 18 ? "45%" : name.length > 10 ? "7.5%" : "15%") : (name.length > 13 ? "40%" : name.length > 10 ? "5%" : "10%");
    const styling = { "font-size": "1.25em", margin: "2% auto" };
    return <div class="border superCenter" style={{ width: dims.ORIENTATION === "landscape" ? "50%" : "75%", "top": "48%", "z-index": 99, border: "thick ridge" }}> 
        <div class="wrap" style={{ height: "100%" }}>
            <div class="creature-heading" style={{ width: "100%"}}>
                <h1 style={ empty ? { "text-align": "center", margin: "24px 0" } : { "justify-content": "space-evenly", margin: "24px 0 16px" }}>{name} 
                <Show when={!empty}>
                <span style={{ transform: `scale(${scale})`, float: "right", "margin-right": centerImage }}>
                    <img src={item.imgUrl} alt={item.name} />
                </span>
                </Show>
                </h1>
            </div>
            <Show when={!empty}>
            <svg height="5" width="100%" class="tapered-rule mt-2">
                <polyline points={`0,0 ${poly},2.5 0,5`}></polyline>
            </svg>
            <div class="center">
                <Show when={item?.type && item?.grip}>
                    <div style={styling}>
                        {item?.type} [<span style={{ "font-style": "italic", color: "gold" }}>{item?.grip}</span>] <br />
                        {item?.attackType} [<span style={{ "font-style": "italic", color: "gold" }}>{item?.damageType?.[0]}{item?.damageType?.[1] ? " / " + item.damageType[1] : "" }{item?.damageType?.[2] ? " / " + item?.damageType?.[2] : "" }</span>] <br />
                    </div>
                </Show>
                <Show when={item?.type && !item?.grip}>
                    <div style={styling}>{item.type}</div>
                </Show>
                

                {attrSplitter("CON", item?.constitution)}
                {attrSplitter("STR", item?.strength)}
                {attrSplitter("AGI", item?.agility)}
                {attrSplitter("ACH", item?.achre)}
                {attrSplitter("CAER", item?.caeren)}
                {attrSplitter("KYO", item?.kyosir)}
                { attribute ? <br /> : "" }
                Damage: <span class="gold">{item?.physicalDamage}</span> Phys | <span class="gold">{item?.magicalDamage}</span> Magi <br />
                <Show when={item?.physicalResistance || item?.magicalResistance}>
                    Defense: <span class="gold">{roundToTwoDecimals(item?.physicalResistance as number)}</span> Phys | <span class="gold">{roundToTwoDecimals(item?.magicalResistance as number)}</span> Magi <br />
                </Show>
                <Show when={item?.physicalPenetration || item?.magicalPenetration}>
                    Penetration: <span class="gold">{roundToTwoDecimals(item?.physicalPenetration as number)}</span> Phys | <span class="gold">{roundToTwoDecimals(item?.magicalPenetration as number)}</span> Magi <br />
                </Show>
                Crit Chance: <span class="gold">{roundToTwoDecimals(item?.criticalChance)}%</span> <br />
                Crit Damage: <span class="gold">{roundToTwoDecimals(item?.criticalDamage)}x</span> <br />
                Roll Chance: <span class="gold">{roundToTwoDecimals(item?.roll)}%</span> <br />
                <Show when={item?.influences && item?.influences?.length > 0}>
                    Influence: <span class="gold">{item?.influences?.[0]}</span>
                </Show>
                <div style={{ color: getRarityColor(item?.rarity as string), "font-size": "1.5em", "margin": "2% auto 4%" }}>
                    {item?.rarity}
                </div>
                <Show when={prayer}>
                    <p style={{ "font-size": "0.75em", margin: caerenic ? "-2% auto 2%" : "-2% auto 4%" }}>
                        [<span class="gold">{prayer?.()}</span>]: {specialDescription[prayer?.() as string]}
                    </p>
                </Show>
                <Show when={stalwart}>
                    <p style={{ "font-size": "0.75em", margin: "2% auto 2%" }}>
                        [<span class="gold">Stalwart</span>]: 
                        {/* You are engaged in combat with your shield raised, adding it to your passive defense.  */}
                        {/* You receive 50% less poise damage.  */}
                        {talents?.().talents.stalwart.enhanced ? "+25%" : "+15%"} Defense. 
                        {talents?.().talents.stalwart.efficient ? "Can Dodge and Roll" : "Cannot Dodge or Roll"}.
                    </p>
                </Show>
                <Show when={caerenic}>
                    <p style={{ "font-size": "0.75em", margin: "2% auto 2%" }}>
                        {/* You attempt to harness your caer with your achre. */}
                        [<span class="gold">Caerenic</span>]: {talents?.().talents.caerenic.enhanced ? "+25%" : "+15%"} Offense. {talents?.().talents.caerenic.efficient ? "-15%" : "-25%"} Defense. 
                        {(talents?.().talents.caerenic.enhanced && talents?.().talents.caerenic.efficient) ? "+1.2" : (talents?.().talents.caerenic.enhanced || talents?.().talents.caerenic.efficient) ? "+0.9" : "+0.6"} Speed. 
                    </p>
                </Show>
            </div> 
            
            </Show>
            {/* <div class="gold">{item.gameplay}</div> */}
        </div>
    </div>;
};