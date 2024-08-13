import { createSignal, createEffect, Accessor, Setter } from 'solid-js';
import createGrace from './Grace';
import Settings from '../models/settings';
export default function GraceBubble({ grace, show, setShow, settings }: {grace:Accessor<number>; show:Accessor<boolean>; setShow:Setter<boolean>; settings: Accessor<Settings>;}) {
    const { gracePercentage, usedGrace } = createGrace(grace);
    const [newGrace, setNewGrace] = createSignal(0);
    createEffect(() => setNewGrace(Math.round((gracePercentage() * grace() / 100))));
    return <div class='graceBubble' onClick={() => setShow(!show())}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(#000, purple, #000)', height: `${usedGrace() + gracePercentage()}%` }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(blue, aqua, blue)', height: `${gracePercentage()}%` }}></div>
        <p class='grace' style={{ 'margin-top': '20%', 'color': '#fdf6d8', 'font-size': '1.25em', 'font-weight': 'bold', 'text-shadow': '0.1em 0.1em 0.1em #000' }}>{settings().grace === 'NUMBER' ? newGrace() : settings().grace === 'PERCENTAGE' ? `${Math.round(gracePercentage())}` : ''}{ settings().grace === 'PERCENTAGE' && <span class='super' style={{ 'font-size': '0.7em' }}>%</span>}</p>
    </div>;
}; // settings().grace === 'PERCENTAGE' ? '1em' : 