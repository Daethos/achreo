import { createSignal, onCleanup } from "solid-js";

export type DIMS = {
  WIDTH: number;
  HEIGHT: number;
  ORIENTATION: "landscape" | "portrait";
};

export function useResizeListener() {
    const getDims = (): DIMS => ({
        WIDTH: window.innerWidth,
        HEIGHT: window.innerHeight,
        ORIENTATION: window.innerWidth > window.innerHeight ? "landscape" : "portrait"
    });

    const [dimensions, setDimensions] = createSignal<DIMS>(getDims());

    const handleResize = () => setDimensions(getDims());

    window.addEventListener("resize", handleResize);

    onCleanup(() => window.removeEventListener("resize", handleResize));

    return dimensions;
};