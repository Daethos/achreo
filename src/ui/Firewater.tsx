import Ascean from "../models/ascean";
import { Accessor, Match, Setter, Show, Switch, createSignal } from "solid-js";
import { dimensions } from "../utility/dimensions";
import { EventBus } from "../game/EventBus";
import { font } from "../utility/styling";

interface FirewaterProps {
    ascean: Accessor<Ascean>;
    showFirewater: Accessor<boolean>;
    setShowFirewater: Setter<boolean>;
    drinkFirewater: () => Promise<void>;
    showBleed: Accessor<boolean>;
    setShowBleed: Setter<boolean>;
    repelenishFirewater: () => void;
    highlighter: Accessor<string>;
};

function FirewaterModal({ ascean, showFirewater, setShowFirewater, drinkFirewater, showBleed, setShowBleed, repelenishFirewater, highlighter }: FirewaterProps) {
    const dims = dimensions();
    return <>
        <div class="modal" classList={{ "tutorial-highlight": highlighter() === "firewater-button" }}>
            <button class="thick-border superCenter" style={{ "max-height": dims.ORIENTATION === "landscape" ? "auto" : "50%", "max-width": dims.ORIENTATION === "landscape" ? "50%" : "70%" }}>
            <div class="creature-heading wrap" style={{ height: "100%" }}>
                <h1>
                    Fyervasos ( {ascean().firewater.current} / {ascean().firewater.max} )
                </h1>
                <h2 style={{ top: "-2.5%", "font-size":"1.15rem" }}>
                    This is a flask of Fyervasos, associated with Fyer, Lilos, and Se'vas of War. This elixir strengthens the body and imbues you with a fiery spirit, making you{" "}
                    more resilient and able to withstand combat and other challenges. This bottle has {ascean().firewater.current} charges left.
                </h2>
                <p class="gold">
                    Do you wish to drink from the flask?<br /><br />
                    <span style={{...font("1rem", "#fdf6d8"), "margin": "1rem auto" }}>
                        [This replenishes 100% of your maximum health. Defeating enemies of comparable or greater strength will replenish the flask]
                    </span>
                </p>
                <Switch>
                    <Match when={ascean().firewater.current === 0}>
                        <div>
                            <button class="center highlight" style={{ margin: "0 5% 5%", "font-size":"1rem" }} onClick={() => setShowBleed(!showBleed())}>
                                <div style={{ color: "red" }}>Inspect</div>
                            </button>
                            <button class="center highlight" style={{ margin: "0 5% 5%", "font-size":"1rem" }} onClick={() => setShowFirewater(!showFirewater())}>
                                <div style={{ color: "#fdf6d8" }}>Close flask</div>
                            </button>
                        </div> 
                    </Match>
                    <Match when={ascean().firewater.current > 0}>
                        <div>
                            <button class="center highlight" style={{ margin: "0 5% 5%", "font-size":"1rem" }} onClick={() => drinkFirewater()}>
                                <div style={{ color: "gold" }}>Drink?</div>
                            </button>
                            <button class="center highlight" style={{ margin: "0 5% 5%", "font-size":"1rem" }} onClick={() => setShowFirewater(!showFirewater())}>
                                <div style={{ color: "#fdf6d8" }}>Close Flask</div>
                            </button>
                        </div> 
                    </Match>
                </Switch>
            </div>
            </button>
        </div>
        <Show when={showBleed()}>
            <div class="modal" onClick={() => setShowFirewater(!showFirewater())}>
                <div class="border superCenter" style={{ "max-height": dims.ORIENTATION === "landscape" ? "85%" : "50%", "max-width": dims.ORIENTATION === "landscape" ? "35%" : "70%" }}>

                <div class="creature-heading wrap">
                <div style={{ height: "100%" }}>
                    <h1>
                        Fyervasos ( {ascean().firewater.current} / {ascean().firewater.max} )
                    </h1>
                    <h2 style={{ top: "-2.5%" }}>
                        There is an Ancient method of replenishing Fyervasos. Se'vas wants your blood spilled to receive his Grace. Fyer asks this over fire, and to ensure the prayer is heard, you must brew this overnight.
                        Or, you can wait until you find a city and purchase a more recent solution.
                    </h2>
                    <p class="basicText" style={{ color: "red" }}>
                        Do you wish to set camp and let it bleed?
                    </p>

                    <Show when={ascean().firewater.current === 0}>
                        <button class="center highlight" style={{ "margin-bottom": "5%" }} onClick={() => repelenishFirewater()}>
                            <div style={{ color: "red" }}>Bleed</div>
                        </button>
                    </Show>
                </div>
                </div>
                </div>
            </div>
        </Show>
    </>;
};

export default function Firewater({ ascean, highlighter }: {ascean: Accessor<Ascean>; highlighter: Accessor<string>;}) {
    const [showFirewater, setShowFirewater] = createSignal<boolean>(false);
    const [showBleed, setShowBleed] = createSignal<boolean>(false);
    const drinkFirewater = async (): Promise<void> => {
        try {
            if (ascean().firewater.current === 0) return;
            EventBus.emit("drink-firewater");
            setShowFirewater(false);
        } catch (err: any) {
            console.warn(err.message);
        };
    };
    async function repelenishFirewater(): Promise<void> {
        try {
            EventBus.emit("bleed-firewater");
            setShowBleed(false);
            setShowFirewater(false);
        } catch (err: any) {
            console.warn(err.message);
        };
    };
    return <>
        <button class="playerSaveInventoryOuter" classList={{
                "tutorial-highlight": highlighter() === "firewater-button",
                "animate-div": highlighter() === "firewater-button"
            }} style={{ transform: `scale(${window.innerWidth / 1000})`, top: window.innerWidth > 1200 ? "2.25vh" : "0vh", right: window.innerWidth > 1200 ? "1.5vw" : "0.35em" }} onClick={() => setShowFirewater(!showFirewater())}>
            <img classList={{
                "tutorial-highlight": highlighter() === "firewater-button",
            }} src={"../assets/images/firewater.png"} alt="Firewater" />
        </button>
        <Show when={showFirewater()}>
            <FirewaterModal ascean={ascean} showFirewater={showFirewater} setShowFirewater={setShowFirewater} drinkFirewater={drinkFirewater} showBleed={showBleed} setShowBleed={setShowBleed} repelenishFirewater={repelenishFirewater} highlighter={highlighter} />
        </Show>
    </>;
};