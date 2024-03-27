import { Accessor, createSignal, onCleanup, onMount } from "solid-js";
import { GameState } from "../stores/game";

function createTimer(game: Accessor<GameState>) {
    const [gameTimer, setGameTimer] = createSignal(0);
    let interval: any | undefined = undefined;

    const recover = () => {
        const newTime = Math.min(100, gameTimer() + 1);
        setGameTimer(newTime);
    };

    onMount(() => {
        if (game().pauseState || !game().currentGame) return;
        interval = setInterval(recover, 1000)
    });    

    onCleanup(() => {
        clearInterval(interval);
    });

    return { gameTimer, setGameTimer };
};

export default createTimer;
