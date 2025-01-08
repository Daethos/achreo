import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";
const STAMINA = { TICK: 100, UPDATE: 750, HALF: 375 };
export default function createStamina(stam: Accessor<number>) {
    const [stamina, setStamina] = createSignal(stam());
    const [staminaPercentage, setStaminaPercentage] = createSignal(0);
    const [usedStamina, setUsedStamina] = createSignal(0);
    var interval: any | undefined = undefined;
    var remaining = 0;
    const recover = () => {
        if (remaining > 0) {remaining -= STAMINA.TICK; return;};
        if (remaining < 0) remaining = 0;
        setUsedStamina(0);
        const newStamina = Math.min(100, staminaPercentage() + (stamina() / 100));
        setStaminaPercentage(newStamina);
        EventBus.emit('updated-stamina', newStamina);
        if (newStamina >= 100) {clearInterval(interval); interval = undefined;};
    };
    const startRecovery = () => {
        setUsedStamina(0);
        interval = setInterval(recover, STAMINA.TICK);
    };
    const updateStamina = (e: number = 0) => {
        if (e > 1) remaining += STAMINA.UPDATE;
        if (e === 1) remaining += (STAMINA.HALF);
        if (interval === undefined) {startRecovery();};
        const oldStamina = stamina() * staminaPercentage() / 100;
        const newStamina = Math.max(0, oldStamina - e);
        const newStaminaPercentage = Math.max(0, Math.min(100, newStamina / stamina() * 100));
        setStaminaPercentage(newStaminaPercentage);
        setUsedStamina((prev) => prev + e);
    };
    onMount(() => {
        EventBus.on('update-stamina', updateStamina);
        EventBus.on('update-total-stamina', (e: number) => setStamina(e));
        updateStamina();
    });    
    onCleanup(() => {
        EventBus.off('update-stamina', updateStamina);
        EventBus.off('update-total-stamina');
        clearInterval(interval);
        interval = undefined;
    });
    return {staminaPercentage, usedStamina};
};