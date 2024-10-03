import { createSignal, Show, For, Accessor, Setter } from "solid-js";
import { Attributes } from "../utility/attributes";
import AttributeModal from "./Attributes";
import { CharacterSheet } from "../utility/ascean";
 
const FaithCard = ({ mastery, newAscean, setNewAscean }: { mastery: any; newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet> }) => {
    const [show, setShow] = createSignal(false);
    const handleShow = () => setShow(!show()); 
    const handleMastery = () => {
        setNewAscean({ ...newAscean(), mastery: mastery.name });
        setShow(!show());
    };
    return <Show when={show()} fallback={<button onClick={handleMastery} class='highlight' style={{ color: mastery.name === newAscean().mastery ? 'gold' : '#fdf6d8' }}>{mastery.name.charAt(0).toUpperCase() + mastery.name.slice(1)}</button>}>
        <div class="modal" onClick={handleShow}><AttributeModal attribute={mastery} /></div>
    </Show>;
};

export default function Mastery({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet> }) {
    return <div class='center creature-heading fadeIn'>
        <h1 class='gold'>Mastery</h1>
        <div>
            <For each={Attributes}>
                {(mastery) => (
                    <FaithCard mastery={mastery} newAscean={newAscean} setNewAscean={setNewAscean} />
                )}
            </For>
        </div> 
    </div>;
};