import { Accessor, Show, createEffect, createSignal } from "solid-js";
import { FAITHS } from "./Faith";
import { useResizeListener } from "../utility/dimensions";
import { CharacterSheet } from "../utility/ascean";

const LANDS = {
    "Ashtre": "the Astralands",
    "Nothos": "the Soverains",
    "Notheo": "the Daethic Kingdom",
    "Fyers": "the Firelands",
    "Sedyreal": "Sedyrus",
    "Li'ivi": "Licivitas",
    "Quor'eite": "Quor'eia",
}

export default function Review({ newAscean }: { newAscean: Accessor<CharacterSheet> }) {
    const originArticle = ['a', 'e', 'i', 'o', 'u'].includes(newAscean()?.origin[0].toLowerCase()) ? 'an' : 'a';
    const descArticle = ['a', 'e', 'i', 'o', 'u'].includes(newAscean()?.description[0].toLowerCase()) ? 'an' : 'a';
    const land = LANDS[newAscean()?.origin as keyof typeof LANDS];
    const [name, setName] = createSignal('');
    const [character, setCharacter] = createSignal('');
    const dimensions = useResizeListener();

    createEffect(() => {
        const deity = FAITHS.find(faith => faith.worshipers === newAscean()?.faith);
        setName(deity?.name as string);
        setCharacter(deity?.character as string);
    });

    const mastery = (attr: string) => {
        return { color: newAscean()?.mastery === attr ? 'gold' : '#fdf6d8' };
    };

    return <div class='center wrap fadeIn'>
        <div class='creature-heading'>
            <h1>Review Character</h1>
            <h2 class='p-3'>
                You are <span class='gold'>{newAscean()?.name}</span>, {originArticle} <span class='gold'>{newAscean()?.origin}</span> {newAscean()?.sex === 'Man' ? 'man' : 'woman'} of <span class='gold'>{land}</span>, recently matured and venturing to the Ascea. 
                By your own admission, you are {descArticle} <span class='gold'>{newAscean()?.description}</span>.
                Your armor of choice which keeps you safe is <span class='gold'>{newAscean()?.preference.toLowerCase()}</span>. Your mastery lies in <span class='gold'>{newAscean()?.mastery.charAt(0).toUpperCase() + newAscean()?.mastery.slice(1)}</span>, and it is said that,
                in some sense, that is how one perceives this world. Your faith is <span class='gold'>{newAscean()?.faith}</span>, the worship of <span class='gold'>{name()}</span>. {character()} 
            </h2>
        </div>
        <Show when={dimensions().ORIENTATION === 'landscape'} fallback={<>
            <div class='center'>
            <img src={`../assets/images/${newAscean()?.origin}-${newAscean()?.sex}.jpg`} id='origin-pic' style={{ width: dimensions().ORIENTATION === 'landscape' ? '50%' : '25%', height: dimensions().ORIENTATION === 'landscape' ? '50%' : '25%', border: '0.15em solid gold' }} />
            </div>
            <br />
            <div class='creature-heading'>
                <h2 style={mastery('constitution')}>Constitution: {newAscean()?.constitution}</h2>
                <h2 style={mastery('strength')}>Strength: {newAscean()?.strength}</h2>
                <h2 style={mastery('agility')}>Agility: {newAscean()?.agility}</h2>
                <h2 style={mastery('achre')}>Achre: {newAscean()?.achre}</h2>
                <h2 style={mastery('caeren')}>Caeren: {newAscean()?.caeren}</h2>
                <h2 style={mastery('kyosir')}>Kyosir: {newAscean()?.kyosir}</h2>
            </div>
        </>}>
            <div style={{ position: 'absolute', width: '70%', left: '15%' }}>
            <div class='left' style={{ width: '48%' }}>
                <img src={`../assets/images/${newAscean()?.origin}-${newAscean()?.sex}.jpg`} id='' style={{ width: '75%', height: '50%', border: '0.15em solid gold', 'border-radius': '50%' }} />
            </div>
            <div class='right' style={{ width: '48%' }}>
            <div class='creature-heading center'>
                <h2 style={mastery('constitution')}>Constitution: {newAscean()?.constitution}</h2>
                <h2 style={mastery('strength')}>Strength: {newAscean()?.strength}</h2>
                <h2 style={mastery('agility')}>Agility: {newAscean()?.agility}</h2>
                <h2 style={mastery('achre')}>Achre: {newAscean()?.achre}</h2>
                <h2 style={mastery('caeren')}>Caeren: {newAscean()?.caeren}</h2>
                <h2 style={mastery('kyosir')}>Kyosir: {newAscean()?.kyosir}</h2>
            </div>
            </div>
            </div>
        </Show>
    </div>;
};