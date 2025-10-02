import { Accessor, createSignal, Show, lazy, Suspense, createEffect } from "solid-js";
import { AttributeCompiler, AttributeNumberModal } from "./Attributes";
import { Attributes } from "../utility/attributes";
import { dimensions } from "../utility/dimensions";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Puff } from "solid-spinner";
import { OriginModal } from "./Origin";
import { FaithModal } from "./Faith";
import { backgroundGradient, masteryColor } from "../utility/styling";
// import { Quest } from "../utility/quests";
const AsceanImageCard = lazy(async () => await import("./AsceanImageCard"));
const ItemModal = lazy(async () => await import("./ItemModal"));
const AttributeModal = lazy(async () => await import("./Attributes"));

export default function AsceanView({ ascean }: { ascean: Accessor<Ascean> }) {
    const dims = dimensions();
    const [show, setShow] = createSignal(false);
    const [showFaith, setShowFaith] = createSignal(false);
    const [showOrigin, setShowOrigin] = createSignal(false);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [attrShow, setAttrShow] = createSignal(false);
    const [attributeDisplay, setAttributeDisplay] = createSignal<{ attribute: any; show: boolean; total: number, equip: number, base: number }>({ attribute: undefined, show: false, base: 0, equip: 0, total: 0 });
    const viewMargin = { margin: "2% auto", width: "95%", "font-family": "Trajan Pro" };
    const [positioning, setPositioning] = createSignal({
        top: dims.WIDTH > 1800 ? "33%" : dims.WIDTH > 1400 ? "30%" : "50%",
        left: dims.WIDTH > 1800 ? "27.5%" : dims.WIDTH > 1400 ? "25%" : "50%",
    });
    createEffect(() => {
        setPositioning({
            top: dims.WIDTH > 1800 ? "33%" : dims.WIDTH > 1400 ? "30%" : "50%",
            left: dims.WIDTH > 1800 ? "27.5%" : dims.WIDTH > 1400 ? "25%" : "50%",
        });
    });
    return <Show when={dims.ORIENTATION === "landscape"} fallback={
        <div class="border superCenter center" style={{ height: "100", width: "85%", overflow: "scroll", "scrollbar-width": "none" }}>
        <div class="creature-heading" style={{ width: "100%", height: "100%" }}>
            <h1>{ascean().name}</h1>
            <h2 class="mb-3">{ascean().description}</h2>
            <img onClick={() => setShowOrigin(!showOrigin())} src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} alt={`${ascean().origin} ${ascean().sex}`} id="origin-pic" />
            <p style={viewMargin}>Level: <span class="gold">{ascean().level}</span> | Experience: <span class="gold">{ascean().experience}</span></p>
            <p style={viewMargin}>Health: <span class="gold">{Math.round(ascean().health.current)}</span> / <span class="gold">{ascean().health.max}</span> | Wealth: <span class="gold">{ascean().currency.gold}g {ascean().currency.silver}s</span></p>
            <p onClick={() => setShowFaith(!showFaith())} style={viewMargin}>Faith: <span class="gold">{ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}</span> | Mastery: <span class="gold">{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</span></p>
            <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} setDisplay={setAttributeDisplay} />
            <Suspense fallback={<Puff color="gold" />}>
                    <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
            </Suspense>
            <br />
            <Show when={show()}>
                <div class="modal" onClick={() => setShow(!show())}>
                <Suspense fallback={<Puff color="gold" />}>
                    <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
                </Suspense>
                </div>
            </Show>

            <Show when={attrShow()}>
            <div class="modal" onClick={() => setAttrShow(!attrShow())}>
                <Suspense fallback={<Puff color="gold" />}>
                    <AttributeModal attribute={attribute()} />
                </Suspense>
            </div> 
            </Show>
        </div>
        </div>
    }>
        <div class="stat-block superCenter flickerJuiceInsert" style={{ width: "92%", overflow: "scroll", "scrollbar-width": "none", animation: "fadein 1.5s ease", "--glow-color":masteryColor(ascean().mastery), "--base-shadow":"#000 0 0 0 0.2em" }}>
            <div class="border left center animate-flicker" style={{ height: "78%", width: "48%", top: "10%", "border-color": masteryColor(ascean().mastery), "box-shadow": `inset #000 0 0 0 0.2rem, inset ${masteryColor(ascean().mastery)} 0 0 0 0.3rem`, "--glow-color":"gold", "background": `linear-gradient(#000, ${backgroundGradient(ascean().mastery, false)}, #000)` }}>
                <div class="creature-heading superCenter" style={{ height: "90%", width: "90%", overflow: "scroll", "scrollbar-width": "none" }}>
                    <div class="stat-row" style={{ "padding-bottom": "0.4em", width: "95%", "border-bottom":"1px solid rgba(10,10,10,0.2)", "margin": "0 auto" }}>
                        <img onClick={() => setShowOrigin(!showOrigin())} src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id="origin-pic" />
                        <div>
                            <h1>{ascean().name}</h1>
                            <h2>{ascean().description}</h2>
                        <div>
                            <span style={{ "margin-right":"1rem" }}><span class="stat-label">Lvl</span> <span class="gold" style={{ "font-size": "1.2rem" }}>{ascean().level}</span></span>
                            <span><span class="stat-label">Exp</span> <span class="gold" style={{ "font-size": "1.2rem" }}>{ascean().experience}</span></span>
                        </div>
                        </div>
                    </div>

                    <div style={{ padding: "0 1rem", "margin-bottom": "1rem" }}>
                        <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} setDisplay={setAttributeDisplay} />
                    </div>

                    <div class="stat-column">
                        <div class="stat-card">
                            <div class="stat-label">HEALTH</div>
                            <div style={{ "font-size": "1.5rem" }}>
                                <span class="gold">{Math.round(ascean().health.current)}</span>
                                <span class="bone" style={{ "font-size": "1rem" }}> / {ascean().health.max}</span>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-label">WEALTH</div>
                            <div style={{ "font-size": "1.25rem" }}>
                                <span class="gold">{ascean().currency.gold}g</span>
                                <span style={{ color: "silver" }}> {ascean().currency.silver}s</span>
                            </div>
                        </div>
                    </div>

                    <div class="stat-column">
                        <div class="stat-card" onClick={() => setShowFaith(!showFaith())}>
                            <div class="stat-label">FAITH</div>
                            <div class="gold" style={{ "font-size": "1.1rem" }}>
                                {ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}
                            </div>
                        </div>

                        <div class="stat-card" onClick={() => { setAttrShow(!attrShow()); setAttribute(Attributes.find(a => a.name === ascean().mastery)!); }}>
                            <div class="stat-label">MASTERY</div>
                            <div style={{ color: masteryColor(ascean().mastery), "font-size": "1.1rem" }}>
                                {ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}
                            </div>
                        </div>
                    </div>

                    {/* <div class="stat-card" style={{ 
                        padding: "0.75rem 1rem",
                        margin: "0 1rem",
                        "margin-bottom": "1rem"
                    }}>
                        <div class="stat-label" style={{ "margin-bottom": "0.5rem" }}>DEFENSE</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div style={{ "text-align": "center" }}>
                                <div class="gold" style={{ "font-size": "1.5rem" }}>
                                    {Math.round(ascean().helmet.physicalResistance as number + (ascean()?.chest?.physicalResistance as number) + (ascean().legs?.physicalResistance as number))}%
                                </div>
                                <div class="small-label" style={{ opacity: 0.7 }}>Physical</div>
                            </div>
                            <div style={{ "border-left": "1px solid rgba(253, 246, 216, 0.2)" }}></div>
                            <div style={{ "text-align": "center" }}>
                                <div class="gold" style={{ "font-size": "1.5rem" }}>
                                    {Math.round(ascean().helmet.magicalResistance as number + (ascean()?.chest?.magicalResistance as number) + (ascean().legs?.magicalResistance as number))}%
                                </div>
                                <div class="small-label" style={{ opacity: 0.7 }}>Magical</div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card" style={{ 
                        padding: "0.75rem 1rem", 
                        margin: "0 1rem"
                    }}>
                        <div class="stat-label" style={{ "margin-bottom": "0.5rem" }}>CRITICAL</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div style={{ "text-align": "center" }}>
                                <div class="gold" style={{ "font-size": "1.5rem" }}>
                                    {ascean().weaponOne.criticalChance}%
                                </div>
                                <div class="small-label" style={{ opacity: 0.7 }}>Chance</div>
                            </div>
                            <div style={{ "border-left": "1px solid rgba(253, 246, 216, 0.2)" }}></div>
                            <div style={{ "text-align": "center" }}>
                                <div class="gold" style={{ "font-size": "1.5rem" }}>
                                    {ascean().weaponOne.criticalDamage}x
                                </div>
                                <div class="small-label" style={{ opacity: 0.7 }}>Damage</div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
            {/* <div class="stat-row" style={viewMargin}>
                <span class="stat-label">Damage:</span> <span class="gold ">{ascean().weaponOne.physicalDamage}</span> <span class="small-label">Physical</span> <span class="divider">|</span>
                <span class="gold ">{ascean().weaponOne.magicalDamage}</span> <span class="small-label">Magical</span>
            </div> */}
            {/* <div class="stat-row" style={viewMargin}>
                <span class="stat-label">Penetration:</span> <span class="gold ">{ascean().weaponOne.physicalPenetration}%</span> <span class="small-label">Physical</span> <span class="divider">|</span> 
                <span class="gold ">{ascean().weaponOne.magicalPenetration}%</span> <span class="small-label">Magical</span> 
            </div> */}
            <div class="border right center animate-flicker" style={{ height: "78%", width: "48%", top: "10%", "border-color": masteryColor(ascean().mastery), "box-shadow": `inset #000 0 0 0 0.2rem, inset ${masteryColor(ascean().mastery)} 0 0 0 0.3rem`, "--glow-color":"gold", "background": `linear-gradient(#000, ${backgroundGradient(ascean().mastery, false)}, #000)` }}>
                <div class="superCenter view" style={{ position: "absolute", ...positioning() }}>
                    <Suspense fallback={<Puff color="gold" />}>
                        <div style={{ "margin-left": "-15%", transform: "scale(1.15)" }}>
                            <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} full={true} />
                        </div>
                    </Suspense>
                </div>
            </div>
        </div>
        <Show when={show()}>
            <div class="modal" onClick={() => setShow(!show())}>
            <Suspense fallback={<Puff color="gold" />}>
                <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
            </Suspense>
            </div>
        </Show>
        <Show when={attrShow()}>
        <div class="modal" onClick={() => setAttrShow(!attrShow())}>
            <AttributeModal attribute={attribute()}/>
        </div> 
        </Show>
        <Show when={attributeDisplay().show}>
            <div class="modal" onClick={() => setAttributeDisplay({ ...attributeDisplay(), show: false })}>
                <AttributeNumberModal attribute={attributeDisplay} />
            </div>
        </Show>
        <Show when={showFaith()}>
            <div class="modal" onClick={() => setShowFaith(!showFaith())}>
                <FaithModal faith={ascean().faith} />
            </div>
        </Show> 
        <Show when={showOrigin()}>
            <div class="modal" onClick={() => setShowOrigin(!showOrigin())}>
                <OriginModal origin={ascean().origin} />
            </div>
        </Show>
    </Show>;
};