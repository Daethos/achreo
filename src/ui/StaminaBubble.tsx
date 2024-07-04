import { createSignal, createEffect, Accessor } from 'solid-js';
import createStamina from './Stamina';

interface Props {
    stamina: Accessor<number>;
};

export default function StaminaBubble({ stamina }: Props) {
    const { staminaPercentage, usedStamina } = createStamina(stamina);
    const [newStamina, setNewStamina] = createSignal(0);
    createEffect(() => {
        const newStam = Math.round((staminaPercentage() * stamina() / 100));
        setNewStamina(newStam);    
    });

    return ( 
        <div class='staminaBubble'>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background-color': '#ffd700', height: `${usedStamina() + staminaPercentage()}%` }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background-color': '#008000', height: `${staminaPercentage()}%` }}></div>
        <p class='stamina' style={{ 'margin-top': '20%', 'color': '#fdf6d8', 'font-size': '1.25em', 'font-weight': 'bold', 'text-shadow': '0.1em 0.1em 0.1em #000' }}>{newStamina()}</p>
    </div>
    );
};