import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";

function createStamina(stam: Accessor<number>) {
    const [staminaPercentage, setStaminaPercentage] = createSignal(0);
    const [stamina, setStamina] = createSignal(stam());
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
        const newStamina = Math.max(0, (stamina() * staminaPercentage() / 100) - e);
        const newStaminaPercentage = Math.max(0, Math.min(100, Math.round(newStamina / stamina() * 100)));
        setStaminaPercentage(newStaminaPercentage);
    };

    onMount(() => {
        EventBus.on('update-stamina', updateStamina);
        EventBus.on('update-total-stamina', (e: number) => setStamina(e));
        interval = setInterval(recover, 200 - stamina());
    });    

    onCleanup(() => {
        EventBus.off('update-stamina', updateStamina);
        EventBus.off('update-total-stamina');
        clearInterval(interval);
        interval = undefined;
    });

    return {staminaPercentage, setStaminaPercentage};
};

export default createStamina;