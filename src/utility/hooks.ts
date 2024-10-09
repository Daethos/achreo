import { onCleanup, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";
export function usePhaserEvent(event: string, callback: (payload: any) => void) {
    onMount(() => EventBus.on(event, callback));
    onCleanup(() => EventBus.off(event, callback));
};

export function useWindowEvent(event:string, callback: (payload: any) => void) {
    onMount(() => window.addEventListener(event, callback));
    onCleanup(() => window.removeEventListener(event, callback));
};