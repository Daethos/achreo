import { font } from "./styling";
import { SCREENS } from "./screens";
import { Accessor, Setter } from "solid-js";
import Equipment from "../models/equipment";
import { useResizeListener } from "./dimensions";
import StatusEffect from "./prayer";
import { EventBus } from "../game/EventBus";
const specials = ["Avarice", "Dispel", "Denial", "Insight", "Silence"]; // Slow, Fear, Confuse, Charm
const specialDescription = {
    "Avarice": "Increases the amount of experience and gold gained.",
    "Dispel": "Removes the last prayer affecting the enemy.",
    "Denial": "Prevents the enemy from killing you.",
    "Insight": "The grace required for your next special action is reduced to 0 if above 0.",
    "Silence": "Prevents the enemy from praying."
};

export function BackForth({ id, left, right, menu, setMenu, createCharacter, newAscean }: { id: string, left: { screen: string, text: string }, right: { screen: string, text: string }, menu: () => any, setMenu: (menu: any) => void, createCharacter: (newAscean: any) => void, newAscean: any }) {
    return (
        <>
        { (left?.screen !== "undefined") && 
            <button class="button cornerBL" onClick={() => setMenu({ ...menu(), screen: left.screen})}>
                <div>Back ({left.text})</div>
            </button>
        }
        { right?.screen && 
            <button class="button cornerBR" onClick={() => setMenu({ ...menu(), screen: right.screen})}>
                <div>Next ({right.text})</div>
            </button>
        }
        { id === SCREENS.COMPLETE.KEY && 
            <button class="button cornerBR" onClick={() => createCharacter(newAscean)}>
                <div>Create {newAscean?.name?.split(" ")[0]}</div>
            </button>
        }
        </>
    );
};

export function StaticButton({ text, callback, textStyle, disabled = false }: { text: string, callback: () => void, textStyle: any, disabled?: boolean }) {
    return (
        <button onClick={callback} disabled={disabled} class="button">
            <div style={textStyle}>{text}</div>
        </button>
    );
};

export function DynamicButton({ style, text, callback, opacity, left }: { style: any, text: string, callback: () => void, opacity: number, left: boolean }) {
    return (
        <button class={left === true ? "button cornerBL" : "button cornerBR"} onClick={callback} style={{ opacity: opacity }}>
            <div>{text}</div>
        </button>
    );
};
                           
export function ActionButtonModal({ currentAction, actions, handleAction, special }: { currentAction: Accessor<any>, actions: string[], handleAction: (action: string, index: number) => void, special?: boolean }) {
    return (
        <div class="border superCenter" style={{ width: "40%", height: "75%", overflow: "scroll", "scrollbar-width": "none" }}>
        <div class="creature-heading">
            <h1 style={{ "text-align": "center" }}>{special ? currentAction().special : currentAction().action}</h1>
            <div class="center" style={{ overflow: "scroll", width: "100%", height: "100%", "scrollbar-width": "none" }}>
            {actions.map((action) => {
                return (
                    <button class="highlight" onClick={() => handleAction(action, currentAction().index)} style={{ "background-color": "black", margin: "5% auto", width: "75%", display: "block" }}>
                        <div style={font("1.25em", "#fdf6d8")}>{action}</div>
                    </button>
                );
            })} 
            </div>
        </div>
        </div>
    );
};

export function Modal({ items, inventory, callback, show, setShow, forge, setForge, upgrade }: { items: Accessor<{ item: Equipment | undefined; type: string; }[]>, inventory: Equipment | undefined, callback: (type: string) => void, show: Accessor<boolean>, setShow: Setter<boolean>, forge: Accessor<boolean>, setForge: Setter<boolean>, upgrade: Accessor<boolean>}) {
    return (
        <div class="border superCenter" style={{ width: "40%", "scrollbar-width": "none" }}>
        <div class="creature-heading">
            <h1 style={{ "text-align": "center" }}>{inventory?.name}</h1>
            {items().length > 0 && items().map((item) => {
                return (
                    <button class="highlight center" style={{ "background-color": "black", margin: "5% auto", width: "75%", display: "block" }} onClick={() => callback(item.type)}>
                        <div style={{ color: "#fdf6d8", "text-align": "center", width: "100%" }}>
                            {item?.item?.name} 
                            <span style={{ "margin-left": "5%" }}>
                                <img src={item?.item?.imgUrl} alt={item?.item?.name} />
                            </span> 
                        </div>
                    </button>
                )
            })}
            { upgrade() && (
                <button class="highlight center" style={{ "background-color": "black", margin: "5% auto", width: "75%", display: "block", padding: "3%" }} onClick={() => setForge(!forge())}>
                    <div style={{ color: "gold", "text-align": "center", width: "100%", "font-weight": 700 }}>
                        Forge {inventory?.name}++ 
                    {/* <img src={inventory?.imgUrl} alt={inventory?.name} /> */}
                    </div>
                </button> 
            ) }
           
            <br /><br />
            <button class="highlight cornerBR" style={{ "background-color": "red", "z-index": 1 }} onClick={() => setShow(!show())}>
                <p style={font("0.5em")}>X</p>
            </button>
        </div>
        </div>
    );
};

export function PrayerModal({ prayer, show, setShow }: { prayer: Accessor<StatusEffect>, show: Accessor<boolean>, setShow: Setter<boolean> }) {
    const dimensions = useResizeListener();
    // console.log(prayer(), specialDescription[prayer().prayer as keyof typeof specialDescription], "prayer");

    function consume() {
        EventBus.emit("initiate-combat", { data: { prayerSacrificeId: prayer().id }, type: "Consume" });
    };
    const gold = {color:"gold"}
    return (
        <div class="modal" onClick={() => setShow(!show)}>
            <button class="border superCenter" onClick={() => setShow(!show)} style={{ "max-height": dimensions().ORIENTATION === "landscape" ? "85%" : "50%", "max-width": dimensions().ORIENTATION === "landscape" ? "35%" : "70%","overflow-y": "scroll", "overflow-x": "hidden", "background-color": "black" }}>
                <div class="creature-heading" style={{ height: "100%", margin: "5%" }}>
                    <h1>{prayer().name.charAt(0).toUpperCase() + prayer().name.slice(1)}</h1>
                    <h2>{prayer().description}</h2>
                    <div style={{ color: "#fdf6d8" }}>
                        Prayer: <span style={gold}>{prayer()?.prayer}</span> <br /><br />
                        Duration: <span style={gold}>{prayer().duration}</span> <br />
                        Start: <span style={gold}>{prayer()?.startTime}s</span> | End: <span style={gold}>{prayer()?.endTime}s</span>
                    <div>
                </div>
                {prayer()?.refreshes ? 
                    <>Active Refreshes: <span style={gold}>{prayer()?.activeRefreshes}</span></> : 
                    <>Active Stacks: <span style={gold}>{prayer()?.activeStacks}</span></>}
                <div>
                <br />
                </div>
                {specials.includes(prayer().prayer) && ( <>
                    {specialDescription[prayer().prayer as keyof typeof specialDescription]}
                </> )}
                {prayer()?.effect?.physicalDamage && 
                    <div>Physical Damage: <span style={gold}>{prayer()?.effect?.physicalDamage}</span><br /> </div>
                }
                {prayer()?.effect?.magicalDamage && 
                    <div>Magical Damage: <span style={gold}>{prayer()?.effect?.magicalDamage}</span><br /></div>
                }
                {prayer()?.effect?.physicalPenetration && 
                    <div>Physical Penetration: <span style={gold}>{prayer()?.effect?.physicalPenetration}</span><br /></div>
                }
                {prayer()?.effect?.magicalPenetration && 
                    <div>Magical Penetration: <span style={gold}>{prayer()?.effect?.magicalPenetration}</span><br /></div>
                }
                {prayer()?.effect?.criticalChance && 
                    <div>Critical Chance: <span style={gold}>{prayer()?.effect?.criticalChance}</span><br /></div>
                }
                {prayer()?.effect?.criticalDamage && 
                    <div>Critical Damage: <span style={gold}>{prayer()?.effect?.criticalDamage}</span><br /></div>
                }
                {prayer()?.effect?.physicalPosture && 
                    <div>Physical Posture: <span style={gold}>{prayer()?.effect.physicalPosture}</span><br /></div>
                }
                {prayer()?.effect?.magicalPosture && 
                    <div>Magical Posture: <span style={gold}>{prayer()?.effect.magicalPosture}</span><br /></div>
                }
                {prayer()?.effect?.physicalDefenseModifier && 
                    <div>Physical Defense Modifier: <span style={gold}>{prayer()?.effect?.physicalDefenseModifier}</span><br /></div>
                }
                {prayer()?.effect?.magicalDefenseModifier && 
                    <div>Magical Defense Modifier: <span style={gold}>{prayer()?.effect?.magicalDefenseModifier}</span><br /></div>
                }
                {prayer()?.effect?.roll && 
                    <div>Roll Chance: <span style={gold}>{prayer()?.effect?.roll}</span><br /> </div>
                }
                {prayer()?.effect?.dodge && 
                    <div>Dodge Distance: <span style={gold}>{prayer()?.effect?.dodge}</span><br /> </div>
                }
                {prayer()?.effect?.healing && 
                    <div>Healing: <span style={gold}>{Math.round(prayer()?.effect?.healing as number)}</span><br /> </div>
                }
                {prayer()?.effect?.damage && 
                    <div>Damage: <span style={gold}>{Math.round(prayer()?.effect?.damage as number)}</span><br /> </div>
                }
                </div>
            </div>
            </button>
            <button class="cornerBR highlight" onClick={() => consume()} style={{ color: "red" }}>
                Consume
            </button>
        </div>
    );
};