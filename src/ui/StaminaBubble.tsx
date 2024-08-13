import { createSignal, createEffect, Accessor, Setter } from 'solid-js';
import createStamina from './Stamina';
import Settings from '../models/settings';
export default function StaminaBubble({ stamina, show, setShow, settings }: {stamina:Accessor<number>; show:Accessor<boolean>; setShow:Setter<boolean>; settings:Accessor<Settings>;}) {
    const { staminaPercentage, usedStamina } = createStamina(stamina);
    const [newStamina, setNewStamina] = createSignal(0);
    createEffect(() => setNewStamina(Math.round((staminaPercentage() * stamina() / 100))));
    return <div class='staminaBubble' onClick={() => setShow(!show())}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(#ffd700, #fdf6d8, #ffd700)', height: `${usedStamina() + staminaPercentage()}%` }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(#006000, #00ff00, #006000)', height: `${staminaPercentage()}%` }}></div>
        <p class='stamina' style={{ 'margin-top': '20%', 'color': '#fdf6d8', 'font-size': '1.25em', 'font-weight': 'bold', 'text-shadow': '0.1em 0.1em 0.1em #000' }}>{settings().stamina === 'NUMBER' ? newStamina() : settings().stamina === 'PERCENTAGE' ? `${Math.round(staminaPercentage())}` : ''}{settings().stamina === 'PERCENTAGE' && <span class='super' style={{ 'font-size': '0.7em' }}>%</span>}</p>
    </div>;
};