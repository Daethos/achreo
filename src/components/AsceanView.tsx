import { Accessor, createSignal, Show, lazy, Suspense, createEffect } from "solid-js";
import { AttributeCompiler, AttributeNumberModal } from "./Attributes";
import { Attributes } from "../utility/attributes";
import { useResizeListener } from "../utility/dimensions";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Puff } from "solid-spinner";
import { OriginModal } from "./Origin";
import { FaithModal } from "./Faith";
import { backgroundGradient, masteryColor } from "../utility/styling";
const AsceanImageCard = lazy(async () => await import("./AsceanImageCard"));
const ItemModal = lazy(async () => await import("./ItemModal"));
const AttributeModal = lazy(async () => await import("./Attributes"));

export default function AsceanView({ ascean }: { ascean: Accessor<Ascean> }) {
    const dimensions = useResizeListener();
    const [show, setShow] = createSignal(false);
    const [showFaith, setShowFaith] = createSignal(false);
    const [showOrigin, setShowOrigin] = createSignal(false);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [attrShow, setAttrShow] = createSignal(false);
    const [attributeDisplay, setAttributeDisplay] = createSignal<{ attribute: any; show: boolean; total: number, equip: number, base: number }>({ attribute: undefined, show: false, base: 0, equip: 0, total: 0 });
    const viewMargin = { margin: "2% auto", width: "80%" };
    const [positioning, setPositioning] = createSignal({
        top: dimensions().WIDTH > 1800 ? "33%" : dimensions().WIDTH > 1400 ? "30%" : "50%",
        left: dimensions().WIDTH > 1800 ? "27.5%" : dimensions().WIDTH > 1400 ? "25%" : "50%",
    });
    createEffect(() => {
        setPositioning({
            top: dimensions().WIDTH > 1800 ? "33%" : dimensions().WIDTH > 1400 ? "30%" : "50%",
            left: dimensions().WIDTH > 1800 ? "27.5%" : dimensions().WIDTH > 1400 ? "25%" : "50%",
        });
    });
    return <Show when={dimensions().ORIENTATION === "landscape"} fallback={
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
            <div class="border left center animate-flicker" style={{ height: "80%", width: "48%", top: "9.5%", "border-color": masteryColor(ascean().mastery), "box-shadow": `inset #000 0 0 0 0.2rem, inset ${masteryColor(ascean().mastery)} 0 0 0 0.3rem`, "--glow-color":"gold", "background": `linear-gradient(#000, ${backgroundGradient(ascean().mastery, false)}, #000)` }}>
                <div class="creature-heading superCenter" style={{ width: "100%" }}>
                    <div class="stat-row stat-section" style={{ width: "85%", margin: "auto" }}>
                        <img onClick={() => setShowOrigin(!showOrigin())} src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id="origin-pic" />
                        <div>
                            <h1>{ascean().name}</h1>
                            <h2>{ascean().description}</h2>
                        </div>
                    </div>
                    <div style={viewMargin}>
                        <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} setDisplay={setAttributeDisplay} />
                    </div>
                    <div class="stat-section" style={viewMargin}></div>
                    <p class="stat-row stat-section" style={viewMargin}>Level: <span class="gold stat-value">{ascean().level}</span> <span class="divider">|</span> Experience: <span class="gold stat-value">{ascean().experience}</span></p>
                    <p class="stat-row stat-section" style={viewMargin}>Health: <span class="gold stat-value">{Math.round(ascean().health.current)} <span class="bone divider">/</span> {ascean().health.max}</span> <span class="divider">|</span> Wealth: <span class="gold stat-value">{ascean().currency.gold}g {ascean().currency.silver}s</span></p>
                    <p class="stat-row stat-section" onClick={() => setShowFaith(!showFaith())} style={viewMargin}>Faith: <span class="gold stat-value">{ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}</span> <span class="divider">|</span> Mastery: <span class="gold stat-value">{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</span></p>
                </div>
            </div>
            <div class="border right center animate-flicker" style={{ height: "80%", width: "48%", top: "9.5%", "border-color": masteryColor(ascean().mastery), "box-shadow": `inset #000 0 0 0 0.2rem, inset ${masteryColor(ascean().mastery)} 0 0 0 0.3rem`, "--glow-color":"gold", "background": `linear-gradient(#000, ${backgroundGradient(ascean().mastery, false)}, #000)` }}>
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