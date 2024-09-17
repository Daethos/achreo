import { Accessor, Setter } from "solid-js";
import Settings from "../models/settings";
import { EventBus } from "../game/EventBus";
const SETTINGS = { NUMBER: 'PERCENTAGE', PERCENTAGE: 'OFF', OFF: 'NUMBER' };
export default function GraceModal({ setShow, settings }: { setShow: Setter<boolean>; settings: Accessor<Settings>; }) {
    return <div class="border superCenter" style={{ width: '50%', 'border-color': 'blue', 'box-shadow': 'inset #000 0 0 0 0.2em, inset blue 0 0 0 0.3em' }} onClick={() => setShow(false)}> 
        <div class='creature-heading wrap' style={{ height: '100%' }}>
                <h1 style={{ 'text-align': 'center', width: '100%' }}>Grace</h1>
                <button class='cornerTR highlight' onClick={() => EventBus.emit('save-this-setting', { grace: SETTINGS[settings().grace as keyof typeof SETTINGS] })}>{settings().grace.charAt(0) + settings().grace.slice(1).toLowerCase()}</button>
            <svg height="5" width="100%" class="tapered-rule" style={{ 'margin-bottom': '3%', 'margin-top': '2%', 'stroke': 'blue' }}>
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div class='center'>
                <h2>Your mind's capacity to perform and transcend. An amalgamation of your Achre, Caeren, and Kyosir. Governs the ability to perform a special action.</h2>
                <p class='gold' style={{ 'margin-bottom': '5%', 'font-size': '0.75em' }}>
                    Grace recovery is paused for 1s, cumulatively, for every action. Increasing your grace also increases the rate of recovery.
                </p>
            </div> 
        </div>
    </div>;
};