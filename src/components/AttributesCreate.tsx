import { Attributes, LOADOUT } from "../utility/attributes";  
import { createSignal, For, createMemo, Accessor, Setter } from "solid-js";
import { InputGroup } from 'solid-bootstrap';
import { useResizeListener } from "../utility/dimensions";
import { CharacterSheet } from "../utility/ascean";

export default function AttributesCreate({ newAscean, setNewAscean, prevMastery, setPrevMastery }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet>, prevMastery: any, setPrevMastery: (e: any) => void }) {
    const [pool, setPool] = createSignal((newAscean().strength + newAscean().agility + newAscean().constitution + newAscean().achre + newAscean().caeren + newAscean().kyosir) - 48);
    const dimensions = useResizeListener();

    const handleChange = (event: any, name: string, value: number): void => {
        event.preventDefault();
        setNewAscean({
            ...newAscean(),
            [name]: Number(newAscean()[name as keyof typeof newAscean]) + value
        });
        setPool(pool() + value);
    };

    const ceiling = (name: string): boolean => {
        return pool() < 25 && newAscean()?.[name as keyof typeof newAscean] as number < 18;
    };
    const floor = (name: string): boolean => {
        return newAscean()?.[name as keyof typeof newAscean] as number > 8;
    };

    createMemo(() => {
        if (prevMastery() !== newAscean().mastery) {
            const mastery = newAscean().mastery;
            setPrevMastery(mastery);
            setNewAscean({
                ...newAscean(),
                ...LOADOUT[mastery as keyof typeof LOADOUT]
            });
            setPool((newAscean().strength + newAscean().agility + newAscean().constitution + newAscean().achre + newAscean().caeren + newAscean().kyosir) - 48);    
        };
    });

    return (
        <div class='center creature-heading' style={{ 'margin-bottom': '3%', width: '100%' }}>
            <h1 class='gold' style={{ 'margin-bottom' : '5%' }}>Attribute Pool: {pool()} / 25</h1>
            <For each={Attributes}>
                {(attribute) => (
                    <InputGroup style={{ width: dimensions().ORIENTATION === 'landscape' ? `33%` : `40%`, display: 'inline-block' }}>
                        <p class='tighten'>{attribute.name.charAt(0).toUpperCase() + attribute.name.slice(1)}</p>
                        <span class='gold'>{newAscean()[attribute.name as keyof typeof newAscean]} ({Math.floor((newAscean()[attribute.name as keyof typeof newAscean] as number - 10) / 2) > 0 ? '+' : ''}{Math.floor((newAscean()[attribute.name as keyof typeof newAscean] as number - 10) / 2)})</span>
                        <br />
                        <button class='highlight' onClick={(e) => handleChange(e, attribute.name, -1)} style={{ display: floor(attribute.name) ? 'inline-block' : 'none', width: 'auto', height: 'auto' }}>-</button>
                        <button class='highlight' onClick={(e) => handleChange(e, attribute.name, 1)} style={{ display: ceiling(attribute.name) ? 'inline-block' : 'none', width: 'auto', height: 'auto' }}>+</button>
                    </InputGroup>
                )}
            </For>
        </div>
    )
};