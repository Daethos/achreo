import { Accessor, createEffect, createSignal } from "solid-js";
import { GameState } from "../stores/game";
import { EventBus } from "../game/EventBus";
import { Combat } from "../stores/combat";
export const DISPLAYS = {
    FULL: {
        KEY:"FULL", 
        NEXT:"NUMBER"
    },
    NUMBER: {
        KEY:"NUMBER", 
        NEXT:"BARE"
    },
    BARE: {
        KEY:"BARE", 
        NEXT:"PERCENT"
    },
    PERCENT: {
        KEY:"PERCENT", 
        NEXT:"NONE"
    },
    NONE: {
        KEY:"NONE", 
        NEXT:"FULL"
    },
};
export function createHealthDisplay(combat: Accessor<Combat>, game:Accessor<GameState>, enemy: boolean) {
    const [healthPercentage, setHealthPercentage] = createSignal<number>(0); 
    const [display, setDisplay] = createSignal<string>(game().healthDisplay);
    const [healthDisplay, setHealthDisplay] = createSignal<string>("");
    createEffect(() => setHealthPercentage(Math.round((enemy ? combat().newComputerHealth : combat().newPlayerHealth) / (enemy ? combat().computerHealth : combat().playerHealth) * 100)));  
    createEffect(() => setDisplay(game().healthDisplay));  
    createEffect(() => {
        if (display() === "FULL") {
            setHealthDisplay(`${Math.round(enemy ? combat().newComputerHealth : combat().newPlayerHealth)} / ${enemy ? combat().computerHealth : combat().playerHealth} (${healthPercentage()}%)`);
        } else if (display() === "NONE") {
            setHealthDisplay(`          `);
        } else if (display() === "NUMBER") {
            setHealthDisplay(`${Math.round(enemy ? combat().newComputerHealth : combat().newPlayerHealth)} / ${enemy ? combat().computerHealth : combat().playerHealth}`);
        } else if (display() === "BARE") {
            setHealthDisplay(`${Math.round(enemy ? combat().newComputerHealth : combat().newPlayerHealth)}`);
        } else if (display() === "PERCENT") {
            setHealthDisplay(`${healthPercentage()}%`);
        };
    });
    function changeDisplay() {
        const nextView = DISPLAYS[display() as keyof typeof DISPLAYS].NEXT;
        setDisplay(nextView);
        EventBus.emit("blend-game", { healthDisplay: nextView });
        EventBus.emit("insert-settings", { healthViews: nextView });
    };
    return { healthDisplay, changeDisplay, healthPercentage };
};