import { Accessor, Setter } from "solid-js";
import Settings from "../models/settings";
import { EventBus } from "../game/EventBus";
const SETTINGS = { NUMBER: "PERCENTAGE", PERCENTAGE: "OFF", OFF: "NUMBER" };
export default function StaminaModal({ setShow, settings }: { setShow: Setter<boolean>; settings: Accessor<Settings>; }) {
    const poly = window.innerWidth * 0.45;
    return <div class="border superCenter" style={{ width: "50%", "border-color": "green", "box-shadow": "inset #000 0 0 0 0.2em, inset green 0 0 0 0.3em" }} onClick={() => setShow(false)}> 
        <div class="creature-heading wrap" style={{ height: "100%" }}>
                <button class="cornerTR highlight" onClick={() => EventBus.emit("save-this-setting", { stamina: SETTINGS[settings().stamina as keyof typeof SETTINGS] })}>{settings().stamina.charAt(0) + settings().stamina.slice(1).toLowerCase()}</button>
                <h1 style={{ "text-align": "center", width: "100%" }}>Stamina</h1>
            <svg height="5" width="100%" class="tapered-rule" style={{ "margin-bottom": "3%", "margin-top": "2%", "stroke": "green" }}>
                <polyline points={`0,0 ${poly},2.5 0,5`}></polyline>
            </svg>
            <div class="center">
                <h2>Your body"s capacity to exert and continue. An amalgamation of your Constitution, Strength, and Agility. Governs the ability to perform a physical action.</h2>
                <p class="gold" style={{ "margin-bottom": "5%", "font-size": window.innerWidth > 1200 ? "" : "0.75em" }}>
                    Stamina recovery is paused, cumulatively, for every action. Increasing your stamina also increases the rate of recovery.
                </p>
            </div> 
        </div>
    </div>;
};