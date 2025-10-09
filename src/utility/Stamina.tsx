import { Accessor, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";

const STAMINA = { 
    TICK: 100, 
    UPDATE: 1000, // 500, // HALF: 375 
};

export default function createStamina(stam: Accessor<number>) {
    const [stamina, setStamina] = createSignal(stam());
    const [staminaPercentage, setStaminaPercentage] = createSignal(0);
    const [usedStamina, setUsedStamina] = createSignal(0);

    let interval: NodeJS.Timeout | undefined = undefined;
    let remaining = 0;

    const recoveryRate = createMemo(() => stamina() / 100);
    
    const recover = () => {
        if (remaining > 0) {
            remaining -= STAMINA.TICK; 
            return;
        };
        if (remaining < 0) remaining = 0;
        
        if (usedStamina() > 0) {
            setUsedStamina(0);
        };

        const newStamina = Math.min(100, staminaPercentage() + recoveryRate());
        setStaminaPercentage(newStamina);
        EventBus.emit("updated-stamina", newStamina);
        
        if (newStamina >= 100) {
            clearInterval(interval); 
            interval = undefined;
        };
    };

    const startRecovery = () => {
        // setUsedStamina(0);
        interval = setInterval(recover, STAMINA.TICK);
    };
    
    const updateStamina = (e: number = 0) => { // if (e === 1) remaining += STAMINA.HALF;
        if (e > 0) remaining += STAMINA.UPDATE;
        if (interval === undefined) startRecovery();

        const oldStamina = stamina() * staminaPercentage() / 100;
        const newStamina = Math.max(0, oldStamina - e);
        const newStaminaPercentage = Math.max(0, Math.min(100, newStamina / stamina() * 100));
        
        setStaminaPercentage(newStaminaPercentage);
        setUsedStamina((prev) => prev + e);
    };

    const updateTotalStamina = (e: number) => setStamina(e);
    
    onMount(() => {
        EventBus.on("update-stamina", updateStamina);
        EventBus.on("update-total-stamina", updateTotalStamina);
        updateStamina();
    });    
    
    onCleanup(() => {
        EventBus.off("update-stamina", updateStamina);
        EventBus.off("update-total-stamina", updateTotalStamina);
        clearInterval(interval);
        interval = undefined;
    });
    
    return {staminaPercentage, usedStamina};
};