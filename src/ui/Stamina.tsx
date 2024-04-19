import { createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";

function createStamina(stam: () => number) {
    const [staminaPercentage, setStaminaPercentage] = createSignal(0);
    let interval: any | undefined = undefined;

    const recover = () => {
        const newStamina = Math.min(100, staminaPercentage() + 1);
        setStaminaPercentage(newStamina);
        EventBus.emit('updated-stamina', newStamina);
        if (newStamina >= 100) {
            clearInterval(interval);
            interval = undefined;
        };
    };

    const updateStamina = (e: number) => {
        if (interval === undefined) {
            console.log('Stamina');
            interval = setInterval(recover, 200 - stam());
        };
        setStaminaPercentage(staminaPercentage() - e <= 0 ? 0 : staminaPercentage() - e);
    };

    onMount(() => {
        EventBus.on('update-stamina', updateStamina);
        interval = setInterval(recover, 200 - stam());
    });    

    onCleanup(() => {
        EventBus.off('update-stamina', updateStamina);
        clearInterval(interval);
        interval = undefined;
    });

    return {staminaPercentage, setStaminaPercentage};
};

export default createStamina;