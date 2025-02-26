import { createSignal, createEffect, Accessor, Setter } from 'solid-js';
import createStamina from '../utility/Stamina';
import Settings from '../models/settings';
import { useResizeListener } from '../utility/dimensions';
export default function StaminaBubble({ stamina, show, setShow, settings }: {stamina:Accessor<number>; show:Accessor<boolean>; setShow:Setter<boolean>; settings:Accessor<Settings>;}) {
    const dimensions = useResizeListener();
    const { staminaPercentage, usedStamina } = createStamina(stamina);
    const [newStamina, setNewStamina] = createSignal(0);
    createEffect(() => setNewStamina(Math.round((staminaPercentage() * stamina() / 100))));
    function setText(setting: string) {
        const mobile = dimensions().WIDTH < 1024;
        const desktop = dimensions().WIDTH > 1600;
        switch (setting) {
            case "PERCENTAGE":
                if (mobile) {
                    return {
                        "font-size": "1.15em",
                        "margin-top": "22.5%"
                    };
                } else if (desktop) {
                    return {
                        "font-size": "1.75em",
                        "margin-top": "25%",
                    };
                } else {
                    return {
                        "font-size": "1.35em",
                        "margin-top": "25%",
                    };
                };
            default:
                if (mobile) {
                    return {
                        "font-size": "1.25em",
                        "margin-top": "20%",
                    };
                } else if (desktop) {
                    return {
                        "font-size": "2em",
                        "margin-top": "25%",
                    };
                } else {
                    return {
                        "font-size": "1.5em",
                        "margin-top": "25%",
                    };
                };
        };
    };
    return <div class='staminaBubble' onClick={() => setShow(!show())}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(#ffd700, #fdf6d8, #ffd700)', height: `${usedStamina() + staminaPercentage()}%` }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background': 'conic-gradient(#006000, #00ff00, #006000)', height: `${staminaPercentage()}%` }}></div>
        <p class='stamina' style={{ 'color': '#fdf6d8', 'font-weight': 'bold', 'text-shadow': '0.1em 0.1em 0.1em #000', ...setText(settings().stamina) }}>{settings().stamina === 'NUMBER' ? newStamina() : settings().stamina === 'PERCENTAGE' ? `${Math.round(staminaPercentage())}` : ''}{settings().stamina === 'PERCENTAGE' && <span class='super' style={{ 'font-size': '0.5em' }}>%</span>}</p>
    </div>;
};