import { Accessor, For, Setter } from "solid-js";
import { CharacterSheet } from "../utility/ascean";
import { click } from "../App";

export default function Sex({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    const sexes = [{name: "Man", description: "Men"}, {name: "Woman", description: "Women"}];
    return <div class="center creature-heading fadeIn" style={{ "margin-bottom": "3%" }}>
        <For each={sexes}>
            {(sex) => (
                <button class="highlight" onClick={() => {setNewAscean({ ...newAscean(), sex: sex.name }); click.play();}} style={{ "--glow-color":"gold", color: newAscean().sex === sex.name ? "gold" : "#fdf6d8", animation: newAscean().sex === sex.name ? "texty 1s infinite ease alternate" : "none" }}>{sex.name}</button>
            )}
        </For>
        <h2 class="p-1 mx-3">Men and women of this world differ in ways that affect your physical and unnatural acumen. Such destined traits can be overcome with effort, however.</h2>
        <p class="center gold mt-3">This choice affects both aesthetics and gameplay.</p>
    </div>;
};