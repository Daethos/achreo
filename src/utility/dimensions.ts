import { onCleanup, createEffect, createSignal } from "solid-js";

type DIMS = {
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
    };
    
    createEffect(() => {
        window.addEventListener('resize', handleResize);
        onCleanup(() => {
            window.removeEventListener('resize', handleResize);
        });
    });

    return dimensions;
};

export { useResizeListener };
