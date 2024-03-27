import { createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";

function createStamina(stam: () => number) {
    const [staminaPercentage, setStaminaPercentage] = createSignal(0);
    let interval: any | undefined = undefined;

    const recover = () => {
        const newStamina = Math.min(100, staminaPercentage() + 1);
        setStaminaPercentage(newStamina);
        EventBus.emit('updated-stamina', newStamina);
    };

    onMount(() => {
        interval = setInterval(recover, 200 - stam())
    });    

    onCleanup(() => {
        clearInterval(interval);
    });

    return {staminaPercentage, setStaminaPercentage};
};

export default createStamina;
