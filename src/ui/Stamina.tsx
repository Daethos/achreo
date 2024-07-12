import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";

function createStamina(stam: Accessor<number>) {
    const [stamina, setStamina] = createSignal(stam());
    const [staminaPercentage, setStaminaPercentage] = createSignal(100);
    const [usedStamina, setUsedStamina] = createSignal(0);
    let interval: any | undefined = undefined;
    let remaining = 0;

    const recover = () => {
        if (remaining > 0) {
            remaining -= 185 - stamina();
            return;    
        };
        if (remaining < 0) remaining = 0;
        setUsedStamina(0);
        const newStamina = Math.min(100, staminaPercentage() + 1);
        setStaminaPercentage(newStamina);
        EventBus.emit('updated-stamina', newStamina);
        if (newStamina >= 100) {
            clearInterval(interval);
            interval = undefined;
        };
    };

    const startRecovery = () => {
        setUsedStamina(0);
        interval = setInterval(recover, 185 - stamina());
    };

    const updateStamina = (e: number) => {
        remaining += 1000;
        if (interval === undefined) {
            startRecovery();
        };

        const oldStamina = stamina() * staminaPercentage() / 100;
        const newStamina = Math.max(0, oldStamina - e);
        const newStaminaPercentage = Math.max(0, Math.min(100, Math.round(newStamina / stamina() * 100)));
        setStaminaPercentage(newStaminaPercentage);
        setUsedStamina((prev) => prev + e);
    };

    onMount(() => {
        EventBus.on('update-stamina', updateStamina);
        EventBus.on('update-total-stamina', (e: number) => setStamina(e));
    });    

    onCleanup(() => {
        EventBus.off('update-stamina', updateStamina);
        EventBus.off('update-total-stamina');
        clearInterval(interval);
        interval = undefined;
    });

    return {staminaPercentage, usedStamina};
};

export default createStamina;