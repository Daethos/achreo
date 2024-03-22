import { Accessor, For, createEffect, createSignal } from "solid-js";
import { useResizeListener } from "../utility/dimensions";
import { CharacterSheet } from "../utility/ascean";

export function Preview({ newAscean }: { newAscean: Accessor<CharacterSheet> }) {
    const dimensions = useResizeListener();
    const [asceanPic, setAsceanPic] = createSignal('');
    const [description, setDescription] = createSignal('');

    createEffect(() => {
        const newPic = `../assets/images/${newAscean().origin}-${newAscean().sex}.jpg`
        setAsceanPic(newPic);
        createDescription(newAscean().description);
    });
    
    function createDescription(descrip: string): void {
        let count = 0;
        const splitter = descrip.split('');
        const desc = splitter.map((char, idx) => {
            if (qualifiers(char, idx, count, splitter.length)) {
                count++;
                return `${char} \n`;
            } else {
                return char;
            };
        }).join('');
        setDescription(desc);
    };

    function qualifiers(char: string, idx: number, count: number, splitter: number): boolean {
        if ((char === ' ' || char === '.') && idx !== 0 && idx !== splitter - 1 && ((idx <= 49 && idx >= 25 && count === 0) || (idx <= 74 && idx >= 50 && count === 1))) {
            return true;
        };
        return false;
    };
    return (
        <div class={dimensions().ORIENTATION === 'landscape' ? 'creature-heading cornerTL ml-5' : 'creature-heading center'}>
            <h1>{newAscean().name}</h1>
            <h2>
                <For each={description().split('\n')}>
                    {(line) => (
                        <p>{line}</p>
                    )}
                </For>
            </h2>
            <p class='mb-5' style={{ color: 'gold', 'font-size': '1.05em' }}>
                {newAscean().faith.charAt(0).toUpperCase() + newAscean().faith.slice(1)} [Faith] | {newAscean().mastery.charAt(0).toUpperCase() + newAscean().mastery.slice(1)} [Mastery]
            <img src={asceanPic()} alt={`${newAscean().origin} ${newAscean().sex}`} class='borderCircle'
                style={{ 
                    height: dimensions().ORIENTATION === 'landscape' ? '20%' : '20%', 
                    width: dimensions().ORIENTATION === 'landscape' ? '7.5%' : '20%', 
                    margin: dimensions().ORIENTATION === 'landscape' ? '-7.5% 0 0 25%' : '0 auto',
                    border: '0.15em solid gold', 
            }} /> 
            </p>
            <br />
        </div>
    );
};