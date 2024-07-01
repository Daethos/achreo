import { Accessor, For, createEffect, createSignal } from "solid-js";
import { useResizeListener } from "../utility/dimensions";
import { CharacterSheet } from "../utility/ascean";
import { font } from "../utility/styling";

export function Preview({ newAscean }: { newAscean: Accessor<CharacterSheet> }) {
    const dimensions = useResizeListener();
    const [description, setDescription] = createSignal('');
    const [picture, setPicture] = createSignal('' as string);

    createEffect(() => {
        createDescription(newAscean().description);
        setPicture(`../assets/images/${newAscean().origin}-${newAscean().sex}.jpg`);   
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

    const photo = {
        'height': dimensions().ORIENTATION === 'landscape' ? 'auto' : 'auto',
        'width': dimensions().ORIENTATION === 'landscape' ? '7.5vw' : '15vw',
        'top': dimensions().ORIENTATION === 'landscape' ? '3vh' : '0',
        'left': dimensions().ORIENTATION === 'landscape' ? '20vw' : '3vw',
        'border': '0.15em solid gold',
        'border-radius': '0.5em',  
    };

    function qualifiers(char: string, idx: number, count: number, splitter: number): boolean {
        if ((char === ' ' || char === '.') && idx !== 0 && idx !== splitter - 1 && ((idx <= 49 && idx >= 25 && count === 0) || (idx <= 74 && idx >= 50 && count === 1))) {
            return true;
        };
        return false;
    };
    return (
        <div class={dimensions().ORIENTATION === 'landscape' ? 'creature-heading cornerTL' : 'creature-heading center'} style={dimensions().ORIENTATION === 'landscape' ?  { 'margin': '-0.5% 1%', } : {}}>
            <h1>{newAscean().name}</h1>
            <h2 style={{ margin:  dimensions().ORIENTATION === 'landscape' ? '-4% 0' : '' }}>
                <For each={description().split('\n')}>
                    {(line, index) => {
                        if (index() !== 0) return;
                        return (
                            <p style={{ 'margin-top': '5%' }}>{line}</p>
                        )
                    }}
                </For>
            </h2>
            { dimensions().ORIENTATION === 'landscape' ? (
                <div style={font('1em', 'gold')}>
                    {newAscean().faith.charAt(0).toUpperCase() + newAscean().faith.slice(1)} [Faith]
                    <p style={{ 'margin-top': '3%' }}>
                    {newAscean().mastery.charAt(0).toUpperCase() + newAscean().mastery.slice(1)} [Mastery]
                    </p>
                </div>
            ) : (
                <p style={font('1em', 'gold')}>
                    {newAscean().faith.charAt(0).toUpperCase() + newAscean().faith.slice(1)} [Faith] | {newAscean().mastery.charAt(0).toUpperCase() + newAscean().mastery.slice(1)} [Mastery]
                </p>
            )}
            <img 
                src={picture()} 
                alt={`${newAscean().origin} ${newAscean().sex}`} 
                // id='origin-pic'
                style={{ ...photo, position: 'absolute' }} 
            /> 
            <br />
        </div>
    );
};