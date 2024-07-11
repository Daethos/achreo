import { createSignal } from "solid-js";
import { EventBus } from "../game/EventBus";
export type DIMS = {
    WIDTH: number,
    HEIGHT: number,
    ORIENTATION: string
};
const useResizeListener = () => {
    const [dimensions, setDimensions] = createSignal<DIMS>({
        WIDTH: window.innerWidth,
        HEIGHT: window.innerHeight,
        ORIENTATION: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    });
    const handleResize = () => {
        const updated: DIMS = {
            WIDTH: window.innerWidth,
            HEIGHT: window.innerHeight,
            ORIENTATION: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        };
        setDimensions(updated);
        EventBus.emit('updated-dimensions', updated);
    };
    window.addEventListener('resize', handleResize);
    return dimensions;
};
export { useResizeListener };