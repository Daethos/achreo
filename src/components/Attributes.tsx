import { Accessor, Setter, createEffect, createSignal } from "solid-js";
import { asceanCompiler } from "../utility/ascean";
import { useResizeListener } from "../utility/dimensions";
import { Attributes } from "../utility/attributes";
import { CombatAttributes } from "../utility/combat";
import Ascean from "../models/ascean";
const font = { "font-size": window.innerWidth > 1200 ? "" : "1em", margin: "0" };

export default function AttributeModal({ attribute }: { attribute: any }) {
    const dimensions = useResizeListener();
    const poly = dimensions().WIDTH * 0.55;
    return <div class="border superCenter" style={dimensions()?.ORIENTATION === "landscape" ? { top: "48%", width: "60%", padding: "1%" } : { width: "75%" }}>
        <div class="creature-heading wrap" style={{ "text-wrap": "balance", "white-space": "pre-wrap" }}>
            <h1>{attribute.name.charAt(0).toUpperCase() + attribute.name.slice(1)}</h1>
            <br />
            <svg height="5" width="100%" class="tapered-rule mt-2 center">
                <polyline class="center" points={`0,0 ${poly},2.5 0,5`}></polyline>
            </svg>
            <div>
                <h2 style={{ color: "gold" }}>{attribute.title}</h2>
            </div>
            <h2 class="center">{attribute.description}</h2>
            <br />
            <p class="gold" style={font}>{attribute.gameplay}</p>
            <br />
        </div>
    </div>;
};

export function AttributeNumberModal({ attribute }: { attribute: Accessor<any>; }) {
    const dimensions = useResizeListener();
    const poly = dimensions().WIDTH * 0.55;
    return <div class="border superCenter" style={dimensions()?.ORIENTATION === "landscape" ? { top: "48%", width: "50%", padding: "1%", "z-index": 9 } : { width: "75%" }}>
        <div class="creature-heading wrap" style={{ "text-wrap": "balance", "white-space": "pre-wrap" }}>
            <h1 style={{ margin: "5% auto" }}>{attribute().attribute}</h1>
            <svg height="5" width="100%" class="tapered-rule">
                <polyline points={`0,0 ${poly},2.5 0,5`}></polyline>
            </svg>
            <div>
                <h2 style={{ color: "gold" }}>{attribute().base} (Raw)</h2>
            </div>
            <h2 class="center">{attribute().equip} (Equip)</h2>
            <br />
            <p class="gold" style={{...font, "font-weight": "bold"}}>{attribute().total} (Total)</p>
            <br />
        </div>
    </div>;
};

export function AttributeCompiler({ ascean, setAttribute, show, setShow, setDisplay }: { ascean: Accessor<Ascean>, setAttribute: Setter<any>, show: Accessor<boolean>, setShow: Setter<boolean>; setDisplay: Setter<any>; }) {
    const [abilities, setAbilities] = createSignal<CombatAttributes | undefined>(undefined);
    const dimensions = useResizeListener();
    function toggle(attr: string) {
        setAttribute(Attributes.find(a => a.name === attr));
        setShow(!show());
    };
    function compiler() {
        try {
            const res = asceanCompiler(ascean());
            setAbilities(res?.attributes);
        } catch (err) {
            console.warn(err);
        };
    };
    function highlightAttribute(attr: string) {
        switch (attr) {
            case "Constitution":
                setDisplay({ attribute: attr, show: true, base: abilities()?.rawConstitution as number, equip: abilities()?.equipConstitution as number, total: abilities()?.totalConstitution as number });
                break;
            case "Strength":
                setDisplay({ attribute: attr, show: true, base: abilities()?.rawStrength as number, equip: abilities()?.equipStrength as number, total: abilities()?.totalStrength as number });
                break;
            case "Agility":
                setDisplay({ attribute: attr, show: true, base: abilities()?.rawAgility as number, equip: abilities()?.equipAgility as number, total: abilities()?.totalAgility as number });
                break;
            case "Achre":
                setDisplay({ attribute: attr, show: true, base: abilities()?.rawAchre as number, equip: abilities()?.equipAchre as number, total: abilities()?.totalAchre as number });
                break;
            case "Caeren":
                setDisplay({ attribute: attr, show: true, base: abilities()?.rawCaeren as number, equip: abilities()?.equipCaeren as number, total: abilities()?.totalCaeren as number });
                break;
            case "Kyosir":
                setDisplay({ attribute: attr, show: true, base: abilities()?.rawKyosir as number, equip: abilities()?.equipKyosir as number, total: abilities()?.totalKyosir as number });
                break;
            default: break;
        };
    };
    createEffect(() => compiler());
    const inline = { width: dimensions().ORIENTATION === "landscape" ? `28%` : `40%`, display: "inline-block" };
    return <div class="creature-heading attributes" style={{ width: "100%", display: "inline-flex", background: "transparent" }}>
        <div style={inline}>
            <button class="buttonBorderless" onClick={() => toggle("constitution")} style={font}><p style={{ margin: "0 auto" }}>Con</p></button>
            <p class="gold" style={font} onClick={() => highlightAttribute("Constitution")}>{abilities()?.totalConstitution}</p>
        </div>
        <div>{"\n"}</div>
        <div style={inline}>
            <button class="buttonBorderless" onClick={() => toggle("strength")} style={font}><p style={{ margin: "0 auto" }}>Str</p></button>
            <p class="gold" style={font} onClick={() => highlightAttribute("Strength")}>{abilities()?.totalStrength}</p>
        </div>
        <div>{"\n"}</div>

        <div style={inline}>
            <button class="buttonBorderless" onClick={() => toggle("agility")} style={font}><p style={{ margin: "0 auto" }}>Agi</p></button>
            <p class="gold" style={font} onClick={() => highlightAttribute("Agility")}> {abilities()?.totalAgility}</p>
        </div>
        <div>{"\n"}</div>
        <div style={inline}>
            <button class="buttonBorderless" onClick={() => toggle("achre")} style={font}><p style={{ margin: "0 auto" }}>Ach</p></button>
            <p class="gold" style={font} onClick={() => highlightAttribute("Achre")}>{abilities()?.totalAchre}</p>
        </div>
        <div>{"\n"}</div>
        <div style={inline}>
            <button class="buttonBorderless" onClick={() => toggle("caeren")} style={font}><p style={{ margin: "0 auto" }}>Caer</p></button>
            <p class="gold" style={font} onClick={() => highlightAttribute("Caeren")}>{abilities()?.totalCaeren}</p>
        </div>
        <div>{"\n"}</div>
        <div style={inline}>
            <button class="buttonBorderless" onClick={() => toggle("kyosir")} style={font}><p style={{ margin: "0 auto" }}>Kyo</p></button>
            <p class="gold" style={font} onClick={() => highlightAttribute("Kyosir")}>{abilities()?.totalKyosir}</p>
        </div>
    </div>;
};