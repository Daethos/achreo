import { createSignal, createEffect, Accessor, Setter } from "solid-js";
import createGrace from "../utility/Grace";
import Settings from "../models/settings";
import { dimensions } from "../utility/dimensions";
export default function GraceBubble({ grace, show, setShow, settings }: {grace:Accessor<number>; show:Accessor<boolean>; setShow:Setter<boolean>; settings: Accessor<Settings>;}) {
    const dims = dimensions();
    const { gracePercentage, usedGrace } = createGrace(grace);
    const [newGrace, setNewGrace] = createSignal(0);
    createEffect(() => setNewGrace(Math.round((gracePercentage() * grace() / 100))));
    function setText(setting: string) {
        const tiny = dims.WIDTH < 768;
        const smol = dims.WIDTH < 850;
        const mobile = dims.WIDTH < 1024;
        const desktop = dims.WIDTH > 1600;
        switch (setting) {
            case "PERCENTAGE":
                if (tiny) { 
                    return {
                        "font-size": "0.85rem",
                        "margin-top": "20%"
                    };
                } else if (smol) {
                    return {
                        "font-size": "1rem",
                        "margin-top": "20%"
                    };
                } else if (mobile) {
                    return {
                        "font-size": "1.15rem",
                        "margin-top": "20%"
                    };
                } else if (desktop) {
                    return {
                        "font-size": "1.75rem",
                        "margin-top": "25%",
                    };
                } else {
                    return {
                        "font-size": "1.35rem",
                        "margin-top": "25%",
                    };
                };
            default:
                if (tiny) { 
                    return {
                        "font-size": "0.85rem",
                        "margin-top": "20%"
                    };
                } else if (smol) {
                    return {
                        "font-size": "1.1rem",
                        "margin-top": "20%"
                    };
                } else if (mobile) {
                    return {
                        "font-size": "1.25rem",
                        "margin-top": "20%",
                    };
                } else if (desktop) {
                    return {
                        "font-size": "2rem",
                        "margin-top": "25%",
                    };
                } else {
                    return {
                        "font-size": "1.5rem",
                        "margin-top": "25%",
                    };
                };
        };
    };
    return <div class="graceBubble" onClick={() => setShow(!show())}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, "z-index": -1, "background": "conic-gradient(#000, purple, #000)", height: `${usedGrace() + gracePercentage()}%` }}></div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, "z-index": -1, "background": "conic-gradient(blue, aqua, blue)", height: `${gracePercentage()}%` }}></div>
        <p class="grace" style={{ "color": "#fdf6d8","font-weight": "bold", "text-shadow": "0.1rem 0.1rem 0.1rem #000",animation: "flicker 1s ease", "--glow-color": "#fdf6d8", ...setText(settings().grace), "font-family":"Centaur" }}>{settings().grace === "NUMBER" ? newGrace() : settings().grace === "PERCENTAGE" ? `${Math.round(gracePercentage())}` : ""}{ settings().grace === "PERCENTAGE" && <span class="super" style={{ "font-size": "0.5em" }}>%</span>}</p>
    </div>;
};