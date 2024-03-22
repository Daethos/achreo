import { Accessor, For, Setter, Show, createSignal } from "solid-js";
import { CharacterSheet } from "../utility/ascean";
 
const ArmorCard = ({ preference, newAscean, setNewAscean, show, setShow, setArmor }: { preference: any; newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet>; show: Accessor<boolean>; setShow: Setter<boolean>; setArmor: any }) => {
    const handleArmor = () => {
        console.log('Armor', preference);
        setNewAscean({ ...newAscean(), preference: preference.name });
        setArmor(preference);
        setShow(!show());
    };

    return (
        <button onClick={handleArmor} class='highlight' style={{ color: preference.name === newAscean().preference ? 'gold' : '#fdf6d8' }}>{preference.name}</button>
    );
};

export default function Sex({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    const [show, setShow] = createSignal(false);
    const [armor, setArmor] = createSignal({ name: '', description: '' });
    const handleShow = () => setShow(!show());
    const preferenceState = [
        { name: 'Plate-Mail', description: 'Heavier armor inhibiting move speed, offset with higher absolute defense.' },
        { name: 'Chain-Mail', description: 'Malleable and defensible.' },
        { name: 'Leather-Mail', description: 'Light armor allowing for unrestricted move speed.' },
        { name: 'Leather-Cloth', description: 'Little physical value translates into greater mobility.' },
    ];

    return (
        <div class='center creature-heading'>
            <h1 class='gold'>
                Armor
            </h1> 
            <For each={preferenceState}>
                {(preference) => (
                    <ArmorCard preference={preference} newAscean={newAscean} setNewAscean={setNewAscean} show={show} setShow={setShow} setArmor={setArmor} />
                )}
            </For>
            <Show when={show()}>
                <div class='modal' onClick={handleShow}>
                <div class='border superCenter'>
                    <div class='border p-5'>
                        {armor().description}
                    </div>
                </div>
                </div>
            </Show> 
        </div>
    );
};