import { Accessor, createEffect, createSignal, lazy, Show, Suspense } from "solid-js";
import Ascean from "../models/ascean";
import { AttributeCompiler, AttributeNumberModal } from "./Attributes";
import { Puff } from "solid-spinner";
import Equipment from "../models/equipment";
import { Attributes } from "../utility/attributes";
import { useResizeListener } from "../utility/dimensions";
import { masteryColor } from "../utility/styling";
const AsceanImageCard = lazy(async () => await import("./AsceanImageCard"));
const ItemModal = lazy(async () => await import("./ItemModal"));
const AttributeModal = lazy(async () => await import("./Attributes"));
export default function LoadAscean({ ascean }: { ascean: Accessor<Ascean>; }) {
    const dimensions = useResizeListener();
    const [show, setShow] = createSignal(false);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [attrShow, setAttrShow] = createSignal(false);
    const [attributeDisplay, setAttributeDisplay] = createSignal<{ attribute: any; show: boolean; total: number, equip: number, base: number }>({ attribute: undefined, show: false, base: 0, equip: 0, total: 0 });
    const viewMargin = { margin: "4%" };    
    const [positioning, setPositioning] = createSignal({
            top: dimensions().WIDTH > 1800 ? "33%" : dimensions().WIDTH > 1200 ? "30%" : "50%",
            left: dimensions().WIDTH > 1800 ? "27.5%" : dimensions().WIDTH > 1200 ? "25%" : "50%",
        });
        createEffect(() => {
            setPositioning({
                top: dimensions().WIDTH > 1800 ? "33%" : dimensions().WIDTH > 1200 ? "30%" : "50%",
                left: dimensions().WIDTH > 1800 ? "27.5%" : dimensions().WIDTH > 1200 ? "25%" : "50%",
            });
        });
    return (
        <div class="stat-block superCenter" style={{ width: "75%", overflow: "scroll", "scrollbar-width": "none", animation: "fadein 1.5s ease" }}>
        <Suspense fallback={<Puff color="gold" />}>
        <div class="border left center juiced" style={{ height: "80vh", width: "48%", top: "10%", "border-color": masteryColor(ascean().mastery), "box-shadow": `inset #000 0 0 0 0.2rem, inset ${masteryColor(ascean().mastery)} 0 0 0 0.3rem` }}>
            <div class="creature-heading superCenter" style={{ width: "100%" }}>
                <h1>{ascean().name}</h1>
                <h2>{ascean().description}</h2>
                <img src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id="origin-pic" />
                <p style={viewMargin}>Level: <span class="gold">{ascean().level}</span> | Experience: <span class="gold">{ascean().experience}</span></p>
                <p style={viewMargin}>Health: <span class="gold">{Math.round(ascean().health.current)}</span> / <span class="gold">{ascean().health.max}</span> | Wealth: <span class="gold">{ascean().currency.gold}g {ascean().currency.silver}s</span></p>
                <p style={viewMargin}>Faith: <span class="gold">{ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}</span> | Mastery: <span class="gold">{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</span></p>
            </div>
        </div>
        </Suspense>
        <Suspense fallback={<Puff color="gold" />}>
        <div class="border right center juiced" style={{ height: "80vh", width: "48%", top: "10%", "border-color": masteryColor(ascean().mastery), "box-shadow": `inset #000 0 0 0 0.2rem, inset ${masteryColor(ascean().mastery)} 0 0 0 0.3rem` }}>
            <div class="superCenter view" style={{ position: "absolute", ...positioning() }}>
                <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} setDisplay={setAttributeDisplay} />
                <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
            </div>
        </div>
        </Suspense>
        
        <div class="creature-heading center">
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
        </div>
        </div>
    );
};