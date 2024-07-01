import { Accessor, For, Setter } from "solid-js";
import { CharacterSheet } from "../utility/ascean";

export default function Sex({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    const sexes = [{name: 'Man', description: 'Men'}, {name: 'Woman', description: 'Women'}];

    return (
        <div class='center creature-heading' style={{ 'margin-bottom': '3%' }}>
            <For each={sexes}>
                {(sex) => (
                    <button class='highlight' onClick={() => setNewAscean({ ...newAscean(), sex: sex.name })} style={{ color: newAscean().sex === sex.name ? 'gold' : '#fdf6d8' }}>{sex.name}</button>
                )}
            </For>
            <h2 class='p-1 mx-3'>
                Men and women differ in these lands in ways that affect your physical and unnatural acumen. Such destined traits can be overcome with effort, however. The world notices, as well.
            </h2>
            <p class='center gold mt-3'>This choice affects both aesthetics and gameplay.</p>
        </div>
    );
};