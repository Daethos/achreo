import { Accessor, Show, createEffect, createSignal } from "solid-js";
import { FAITHS } from "./Faith";
import { useResizeListener } from "../utility/dimensions";
import { CharacterSheet } from "../utility/ascean";

export default function Review({ newAscean }: { newAscean: Accessor<CharacterSheet> }) {
    const originArticle = ['a', 'e', 'i', 'o', 'u'].includes(newAscean()?.origin[0].toLowerCase()) ? 'an' : 'a';
    const descArticle = ['a', 'e', 'i', 'o', 'u'].includes(newAscean()?.description[0].toLowerCase()) ? 'an' : 'a';
    const [name, setName] = createSignal('');
    const [character, setCharacter] = createSignal('');
    const dimensions = useResizeListener();

    createEffect(() => {
        console.log(newAscean()?.mastery, 'Mastery in Review');
        const deity = FAITHS.find(faith => faith.worshipers === newAscean()?.faith);
        setName(deity?.name as string);
        setCharacter(deity?.character as string);
    });

    return (
        <div class='center wrap'>
            <div class='creature-heading'>
                <h1>Review Character</h1>
                <h2 class='p-3'>
                    You are <span class='gold'>{newAscean()?.name}</span>, {originArticle} <span class='gold'>{newAscean()?.origin} {newAscean()?.sex === 'Man' ? 'male' : 'female'}</span> of your homeland, recently matured and venturing to the Ascea. 
                    By your own admission, you are {descArticle} <span class='gold'>{newAscean()?.description}</span>.
                    The armor which keeps you safe is <span class='gold'>{newAscean()?.preference}</span>--may you wear it well. Your mastery lies in <span class='gold'>{newAscean()?.mastery.charAt(0).toUpperCase() + newAscean()?.mastery.slice(1)}</span>,
                    in a sense it's how you perceive this world. Your faith is <span class='gold'>{newAscean()?.faith}</span>, the worship of <span class='gold'>{name()}</span>. {character()} 
                </h2>
            </div>
            <Show when={dimensions().ORIENTATION === 'landscape'} fallback={
                <>
                <div class='center'>
                <img src={`../assets/images/${newAscean()?.origin}-${newAscean()?.sex}.jpg`} id='origin-pic' style={{ 
                    width: dimensions().ORIENTATION === 'landscape' ? '50%' : '25%', height: dimensions().ORIENTATION === 'landscape' ? '50%' : '25%', border: '0.15em solid gold',   
                }} />
                </div>
                <br />
                <div class='creature-heading'>
                    <h2 style={{color: newAscean()?.mastery === 'constitution' ? 'gold' : '#fdf6d8'}}>Constitution: {newAscean()?.constitution}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'strength' ? 'gold' : '#fdf6d8'}}>Strength: {newAscean()?.strength}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'agility' ? 'gold' : '#fdf6d8'}}>Agility: {newAscean()?.agility}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'achre' ? 'gold' : '#fdf6d8'}}>Achre: {newAscean()?.achre}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'caeren' ? 'gold' : '#fdf6d8'}}>Caeren: {newAscean()?.caeren}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'kyosir' ? 'gold' : '#fdf6d8'}}>Kyosir: {newAscean()?.kyosir}</h2>
                </div>
                </>
            }>
                <div class='stat-block'>
                <div class='left' style={{ width: '48%' }}>
                    <img src={`../assets/images/${newAscean()?.origin}-${newAscean()?.sex}.jpg`} id='deity-pic' style={{ 
                        width: dimensions().ORIENTATION === 'landscape' ? '50%' : '25%', height: dimensions().ORIENTATION === 'landscape' ? '50%' : '25%', border: '0.15em solid gold',   
                    }} />
                </div>
                <div class='right' style={{ width: '48%' }}>
                <div class='creature-heading center'>
                    <h2 style={{color: newAscean()?.mastery === 'constitution' ? 'gold' : '#fdf6d8'}}>Constitution: {newAscean()?.constitution}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'strength' ? 'gold' : '#fdf6d8'}}>Strength: {newAscean()?.strength}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'agility' ? 'gold' : '#fdf6d8'}}>Agility: {newAscean()?.agility}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'achre' ? 'gold' : '#fdf6d8'}}>Achre: {newAscean()?.achre}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'caeren' ? 'gold' : '#fdf6d8'}}>Caeren: {newAscean()?.caeren}</h2>
                    <h2 style={{color: newAscean()?.mastery === 'kyosir' ? 'gold' : '#fdf6d8'}}>Kyosir: {newAscean()?.kyosir}</h2>
                </div>
                </div>
                </div>
            </Show>
        </div>
    );
};