import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";
const GRACE = { TICK: 100, UPDATE: 1000 }; // 750
export default function createGrace(startGrace: Accessor<number>) {
    const [grace, setGrace] = createSignal(startGrace());
    const [gracePercentage, setGracePercentage] = createSignal(0);
    const [usedGrace, setUsedGrace] = createSignal(0);
    var interval: any | undefined = undefined;
    var remaining = 0;
    const recover = () => {
        if (remaining > 0) {remaining -= GRACE.TICK; return;}; // - grace()
        if (remaining < 0) remaining = 0;
        setUsedGrace(0);
        const newGrace = Math.min(100, gracePercentage() + (grace() / 100)); // 1
        setGracePercentage(newGrace);
        EventBus.emit("updated-grace", newGrace);
        if (newGrace >= 100) {clearInterval(interval); interval = undefined;};
    };
    const startRecovery = () => {
        setUsedGrace(0);
        interval = setInterval(recover, GRACE.TICK); // - grace()
    };
    const updateStamina = (e: number = 0) => {
        if (e > 0) remaining += GRACE.UPDATE;
        if (interval === undefined) {startRecovery();};
        const oldGrace = grace() * gracePercentage() / 100;
        const newGrace = Math.max(0, oldGrace - e);
        const newPercentage = Math.max(0, Math.min(100, newGrace / grace() * 100));
        setGracePercentage(newPercentage);
        setUsedGrace((prev) => prev + e);
    };
    onMount(() => {
        EventBus.on("update-grace", updateStamina);
        EventBus.on("update-total-grace", (e: number) => setGrace(e));
        updateStamina();
    });    
    onCleanup(() => {
        EventBus.off("update-grace", updateStamina);
        EventBus.off("update-total-grace");
        clearInterval(interval);
        interval = undefined;
    });
    return {gracePercentage, usedGrace};
};