import { createSignal, createEffect, Accessor, Setter } from 'solid-js';
import createGrace from './Grace';
export default function GraceBubble({ grace, show, setShow }: {grace:Accessor<number>; show:Accessor<boolean>; setShow:Setter<boolean>;}) {
    const { gracePercentage, usedGrace } = createGrace(grace);
    const [newStamina, setNewStamina] = createSignal(0);
    createEffect(() => setNewStamina(Math.round((gracePercentage() * grace() / 100))));
    return <div class='graceBubble' onClick={() => setShow(!show())}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(#000, purple, #000)', height: `${usedGrace() + gracePercentage()}%` }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(blue, aqua, blue)', height: `${gracePercentage()}%` }}></div>
        <p class='grace' style={{ 'margin-top': '20%', 'color': '#fdf6d8', 'font-size': '1.25em', 'font-weight': 'bold', 'text-shadow': '0.1em 0.1em 0.1em #000' }}>{newStamina()}</p>
    </div>;
};