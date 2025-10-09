import { createSignal, createRoot } from "solid-js";

export type DIMS = {
  WIDTH: number;
  HEIGHT: number;
  ORIENTATION: "landscape" | "portrait";
};

const getDims = (): DIMS => ({
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
  ORIENTATION: window.innerWidth > window.innerHeight ? "landscape" : "portrait"
});

const [dimensions, _updateDimensions] = createRoot(() => {
    const [dims, setDims] = createSignal<DIMS>(getDims());
    
    const handleResize = () => setDims(getDims());
    
    window.addEventListener("resize", handleResize);
    
    return [dims, setDims] as const;
});

export { dimensions };