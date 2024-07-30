import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";
const GRACE = { TICK: 200, UPDATE: 1000 };
export default function createGrace(grc: Accessor<number>) {
    const [grace, setGrace] = createSignal(grc());
    const [gracePercentage, setGracePercentage] = createSignal(0);
    const [usedGrace, setUsedGrace] = createSignal(0);
    var interval: any | undefined = undefined;
    var remaining = 0;
    const recover = () => {
        if (remaining > 0) {remaining -= GRACE.TICK - grace(); return;};
        if (remaining < 0) remaining = 0;
        setUsedGrace(0);
        const newStamina = Math.min(100, gracePercentage() + 1);
        setGracePercentage(newStamina);
        EventBus.emit('updated-grace', newStamina);
        if (newStamina >= 100) {clearInterval(interval); interval = undefined;};
    };
    const startRecovery = () => {
        setUsedGrace(0);
        interval = setInterval(recover, GRACE.TICK - grace());
    };
    const updateStamina = (e: number = 0) => {
        if (e > 0) remaining += GRACE.UPDATE;
        if (interval === undefined) {startRecovery();};
        const oldStamina = grace() * gracePercentage() / 100;
        const newStamina = Math.max(0, oldStamina - e);
        const newStaminaPercentage = Math.max(0, Math.min(100, Math.round(newStamina / grace() * 100)));
        setGracePercentage(newStaminaPercentage);
        setUsedGrace((prev) => prev + e);
    };
    onMount(() => {
        EventBus.on('update-grace', updateStamina);
        EventBus.on('update-total-grace', (e: number) => setGrace(e));
        updateStamina();
    });    
    onCleanup(() => {
        EventBus.off('update-grace', updateStamina);
        EventBus.off('update-total-grace');
        clearInterval(interval);
        interval = undefined;
    });
    return {gracePercentage, usedGrace};
};