import { createSignal } from "solid-js";
export type DIMS = {
    WIDTH: number,
    HEIGHT: number,
    ORIENTATION: string
};
const useResizeListener = () => {
    const [dimensions, setDimensions] = createSignal<DIMS>({
        WIDTH: document.documentElement.clientWidth,
        // WIDTH: window.innerWidth,
        HEIGHT: document.documentElement.clientHeight,
        // HEIGHT: window.innerHeight,
        ORIENTATION: window.innerWidth > window.innerHeight ? "landscape" : "portrait"
    });
    const handleResize = () => {
        const updated: DIMS = {
            WIDTH: document.documentElement.clientWidth,
            HEIGHT: document.documentElement.clientHeight,
            // WIDTH: window.innerWidth,
            // HEIGHT: window.innerHeight,
            ORIENTATION: window.innerWidth > window.innerHeight ? "landscape" : "portrait"
        };
        setDimensions(updated);
    };
    window.addEventListener("resize", handleResize);
    return dimensions;
};
export { useResizeListener };