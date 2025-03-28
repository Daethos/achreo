import { createSignal, Show, For, Accessor, Setter } from "solid-js";
import { Attributes } from "../utility/attributes";
import AttributeModal from "./Attributes";
import { CharacterSheet } from "../utility/ascean";
import { click } from "../App";
 
const MasteryCard = ({ mastery, newAscean, setNewAscean }: { mastery: any; newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet> }) => {
    const [show, setShow] = createSignal(false);
    const handleShow = () => setShow(!show()); 
    const handleMastery = () => {
        setNewAscean({ ...newAscean(), mastery: mastery.name });
        setShow(!show());
        click.play();
    };
    return <Show when={show()} fallback={<button onClick={handleMastery} class="highlight" style={{ color: mastery.name === newAscean().mastery ? "gold" : "#fdf6d8", animation: mastery.name === newAscean().mastery ? "flicker 1s infinite ease alternate" : "none" }}>{mastery.name.charAt(0).toUpperCase() + mastery.name.slice(1)}</button>}>
        <div class="modal" onClick={handleShow}><AttributeModal attribute={mastery} /></div>
    </Show>;
};

export default function Mastery({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet> }) {
    return <div class="center creature-heading fadeIn" style={{ "margin": "10% auto 5%" }}>
        <h1 class="gold" style={{ "margin-bottom": "1.5%" }}>Mastery</h1>
        <div>
            <For each={Attributes}>
                {(mastery) => (
                    <MasteryCard mastery={mastery} newAscean={newAscean} setNewAscean={setNewAscean} />
                )}
            </For>
        </div> 
    </div>;
};