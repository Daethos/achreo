import { Accessor, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";

const GRACE = { 
    TICK: 100, 
    UPDATE: 1000 
}; // 750

export default function createGrace(startGrace: Accessor<number>) {
    const [grace, setGrace] = createSignal(startGrace());
    const [gracePercentage, setGracePercentage] = createSignal(0);
    const [usedGrace, setUsedGrace] = createSignal(0);
    
    let interval: NodeJS.Timeout | undefined = undefined;
    let remaining = 0;

    const recoveryRate = createMemo(() => grace() / 100);

    const recover = () => {
        if (remaining > 0) {
            remaining -= GRACE.TICK; 
            return;
        }; // - grace()
        if (remaining < 0) remaining = 0;
        
        if (usedGrace() > 0) {
            setUsedGrace(0);
        };

        const newGrace = Math.min(100, gracePercentage() + recoveryRate()); // 1
        setGracePercentage(newGrace);
        EventBus.emit("updated-grace", newGrace);
        
        if (newGrace >= 100) {
            clearInterval(interval); 
            interval = undefined;
        };
    };
    
    const startRecovery = () => {
        // setUsedGrace(0);
        interval = setInterval(recover, GRACE.TICK); // - grace()
    };
    
    const updateGrace = (e: number = 0) => {
        if (e > 0) remaining += GRACE.UPDATE;
        if (interval === undefined) startRecovery();
        
        const oldGrace = grace() * gracePercentage() / 100;
        const newGrace = Math.max(0, oldGrace - e);
        const newPercentage = Math.max(0, Math.min(100, newGrace / grace() * 100));
        
        setGracePercentage(newPercentage);
        setUsedGrace((prev) => prev + e);
    };

    const updateTotalGrace = (e: number) => setGrace(e);
    
    onMount(() => {
        EventBus.on("update-grace", updateGrace);
        EventBus.on("update-total-grace", updateTotalGrace);
        updateGrace();
    });    
    
    onCleanup(() => {
        EventBus.off("update-grace", updateGrace);
        EventBus.off("update-total-grace", updateTotalGrace);
        clearInterval(interval);
        interval = undefined;
    });
    
    return {gracePercentage, usedGrace};
};