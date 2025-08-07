import { createSignal, createEffect, Accessor, Setter } from "solid-js";
import createGrace from "../utility/Grace";
import Settings from "../models/settings";
import { useResizeListener } from "../utility/dimensions";
export default function GraceBubble({ grace, show, setShow, settings }: {grace:Accessor<number>; show:Accessor<boolean>; setShow:Setter<boolean>; settings: Accessor<Settings>;}) {
    const dimensions = useResizeListener();
    const { gracePercentage, usedGrace } = createGrace(grace);
    const [newGrace, setNewGrace] = createSignal(0);
    createEffect(() => setNewGrace(Math.round((gracePercentage() * grace() / 100))));
    function setText(setting: string) {
        const smol = dimensions().WIDTH < 850;
        const mobile = dimensions().WIDTH < 1024;
        const desktop = dimensions().WIDTH > 1600;
        switch (setting) {
            case "PERCENTAGE":
                if (smol) {
                    return {
                        "font-size": "1em",
                        "margin-top": "20%"
                    };
                } else if (mobile) {
                    return {
                        "font-size": "1.15em",
                        "margin-top": "20%"
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
                if (smol) {
                    return {
                        "font-size": "1.1em",
                        "margin-top": "20%"
                    };
                } else if (mobile) {
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
    return <div class="graceBubble" onClick={() => setShow(!show())}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, "z-index": -1, "background": "conic-gradient(#000, purple, #000)", height: `${usedGrace() + gracePercentage()}%` }}></div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, "z-index": -1, "background": "conic-gradient(blue, aqua, blue)", height: `${gracePercentage()}%` }}></div>
        <p class="grace" style={{ "color": "#fdf6d8","font-weight": "bold", "text-shadow": "0.1em 0.1em 0.1em #000",animation: "flicker 1s ease", "--glow-color": "#fdf6d8", ...setText(settings().grace) }}>{settings().grace === "NUMBER" ? newGrace() : settings().grace === "PERCENTAGE" ? `${Math.round(gracePercentage())}` : ""}{ settings().grace === "PERCENTAGE" && <span class="super" style={{ "font-size": "0.5em" }}>%</span>}</p>
    </div>;
};