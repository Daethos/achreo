import { Accessor, For, Setter, Show, createSignal } from "solid-js";
import { CharacterSheet } from "../utility/ascean";
import { click } from "../App";
const poly = window.innerWidth * 0.55;
export const preferenceState = [
    { name: "Plate-Mail", description: "Heavier armor inhibiting move speed, offset with higher absolute defense." },
    { name: "Chain-Mail", description: "Malleable and defensible, though still weighted." },
    { name: "Leather-Mail", description: "Light armor allowing for unrestricted movement at the cost of exposure." },
    { name: "Leather-Cloth", description: "Little physical value translates into greater mobility." },
];
const ArmorCard = ({ preference, newAscean, setNewAscean, show, setShow, setArmor }: { preference: any; newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet>; show: Accessor<boolean>; setShow: Setter<boolean>; setArmor: any }) => {
    const handleArmor = () => {
        setNewAscean({ ...newAscean(), preference: preference.name });
        setArmor(preference);
        setShow(!show());
        click.play();
    };
    return <button onClick={handleArmor} class="highlight" style={{ "--glow-color":"gold", color: preference.name === newAscean().preference ? "gold" : "#fdf6d8", animation: preference.name === newAscean().preference ? "texty 1s infinite ease alternate" : "none" }}>{preference.name}</button>;
};

export function ArmorModal({ armor }: { armor: { name: string; description: string; } }) {
    return <div class="border superCenter" style={{ "text-wrap": "balance", width: "60%", top: "48%" }}>
    <div class="creature-heading wrap">
        <h1 style={{ "margin": "5%" }}>{armor.name}</h1>
        <svg height="5" width="100%" class="tapered-rule"><polyline points={`0,0 ${poly},2.5 0,5`}></polyline></svg>
        <h2 style={{ "margin": "5%" }}>{armor.description}</h2>
        <p class="gold small">Note: This is starter equipment--you may wear anything in this game. Also, magic damage is a quality that carries its own concerns.</p>
    </div>
    </div>;
};

export default function Preference({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    const [show, setShow] = createSignal(false);
    const [armor, setArmor] = createSignal({ name: "", description: "" });
    const handleShow = () => setShow(!show());
    const preferenceState = [
        { name: "Plate-Mail", description: "Heavier armor inhibiting move speed, offset with higher absolute defense." },
        { name: "Chain-Mail", description: "Malleable and defensible, though still weighted." },
        { name: "Leather-Mail", description: "Light armor allowing for unrestricted movement at the cost of exposure." },
        { name: "Leather-Cloth", description: "Little physical value translates into greater mobility." },
    ];
    return <div class="center creature-heading fadeIn" style={{ "margin-bottom": "3%" }}>
        <h1 class="gold" style={{ "margin-bottom": "1.5%" }}>Armor</h1> 
        <For each={preferenceState}>
            {(preference) => (
                <ArmorCard preference={preference} newAscean={newAscean} setNewAscean={setNewAscean} show={show} setShow={setShow} setArmor={setArmor} />
            )}
        </For>
        <Show when={show()}>
        <div class="modal" onClick={handleShow}>
            <div class="border superCenter" style={{ "text-wrap": "balance", width: "60%", top: "48%" }}>
            <div class="creature-heading wrap">
                <h1 style={{ "margin": "5%" }}>{armor().name}</h1>
                <svg height="5" width="100%" class="tapered-rule"><polyline points={`0,0 ${poly},2.5 0,5`}></polyline></svg>
                <h2 style={{ "margin": "5%" }}>{armor().description}</h2>
                <p class="gold small">Note: This is starter equipment--you may wear anything in this game. Also, magic damage is a quality that carries its own concerns.</p>
            </div>
            </div>
        </div>
        </Show> 
    </div>;
};