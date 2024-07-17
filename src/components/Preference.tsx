import { Accessor, For, Setter, Show, createSignal } from "solid-js";
import { CharacterSheet } from "../utility/ascean";
 
const ArmorCard = ({ preference, newAscean, setNewAscean, show, setShow, setArmor }: { preference: any; newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet>; show: Accessor<boolean>; setShow: Setter<boolean>; setArmor: any }) => {
    const handleArmor = () => {
        setNewAscean({ ...newAscean(), preference: preference.name });
        setArmor(preference);
        setShow(!show());
    };
    return <button onClick={handleArmor} class='highlight' style={{ color: preference.name === newAscean().preference ? 'gold' : '#fdf6d8' }}>{preference.name}</button>;
};

export default function Sex({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    const [show, setShow] = createSignal(false);
    const [armor, setArmor] = createSignal({ name: '', description: '' });
    const handleShow = () => setShow(!show());
    const preferenceState = [
        { name: 'Plate-Mail', description: 'Heavier armor inhibiting move speed, offset with higher absolute defense.' },
        { name: 'Chain-Mail', description: 'Malleable and defensible, though still weighted.' },
        { name: 'Leather-Mail', description: 'Light armor allowing for unrestricted movement at the cost of exposure.' },
        { name: 'Leather-Cloth', description: 'Little physical value translates into greater mobility.' },
    ];

    return <div class='center creature-heading' style={{ 'margin-bottom': '3%' }}>
        <h1 class='gold'>Armor</h1> 
        <For each={preferenceState}>
            {(preference) => (
                <ArmorCard preference={preference} newAscean={newAscean} setNewAscean={setNewAscean} show={show} setShow={setShow} setArmor={setArmor} />
            )}
        </For>
        <Show when={show()}>
        <div class='modal' onClick={handleShow}>
            <div class='border superCenter' style={{ 'text-wrap': 'balance', width: '60%' }}>
            <div class='creature-heading wrap'>
                <h1 style={{ 'margin': '5%' }}>{armor().name}</h1>
                <svg height="5" width="100%" class="tapered-rule" style={{ transform: 'translateX(10%)' }}><polyline points="0,0 400,2.5 0,5"></polyline></svg>
                <h2 style={{ 'margin': '5%' }}>{armor().description}</h2>
                <p class='gold small'>Note: This is starter equipment--you may wear anything in this game. Also, magic damage is a quality that carries its own concerns.</p>
            </div>
            </div>
        </div>
        </Show> 
    </div>;
};