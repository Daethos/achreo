import Ascean from "../models/ascean";
import { Accessor, Setter, Show, createSignal } from 'solid-js';
import { useResizeListener } from "../utility/dimensions";
import { EventBus } from "../game/EventBus";

interface FirewaterProps {
    ascean: Accessor<Ascean>;
    showFirewater: Accessor<boolean>;
    setShowFirewater: Setter<boolean>;
    drinkFirewater: () => Promise<void>;
    showBleed: Accessor<boolean>;
    setShowBleed: Setter<boolean>;
    repelenishFirewater: () => void;
};

function FirewaterModal({ ascean, showFirewater, setShowFirewater, drinkFirewater, showBleed, setShowBleed, repelenishFirewater }: FirewaterProps) {
    const dimensions = useResizeListener();
    return(
        <>
        <div class='modal'>
            <button class='border superCenter' style={{ 'max-height': dimensions().ORIENTATION === 'landscape' ? '85%' : '50%', 'max-width': dimensions().ORIENTATION === 'landscape' ? '35%' : '70%' }}>
            <div class='creature-heading' style={{ height: '100%' }}>
                <h1>
                    Firewater ( {ascean().firewater.current} / {ascean().firewater.max} )
                </h1>
                <h2 style={{ top: '-2.5%' }}>
                    This is a bottle of Fyervas Firewater, associated with Fyer of Fire and Se'vas of War. This elixir strengthens the body and imbues you with a fiery spirit, making you{' '}
                    more resilient and able to withstand combat and other challenges. This bottle has {ascean().firewater.current} charges left.
                </h2>
                {ascean().firewater.current === 0 ? ( <div>
                    <button class='center highlight' style={{ margin: '3%' }} onClick={() => setShowBleed(!showBleed())}>
                        <div style={{ color: 'red' }}>Inspect</div>
                    </button>
                    <button class='center highlight' style={{ margin: '3%' }} onClick={() => setShowFirewater(!showFirewater())}>
                        <div style={{ color: 'blue' }}>Close flask</div>
                    </button>
                </div> ) : ( <div>
                    <button class='center highlight' style={{ margin: '3%' }} onClick={() => drinkFirewater()}>
                        <div class='gold'>Take A Drink?</div>
                    </button>
                    <button class='center highlight' style={{ margin: '3%' }} onClick={() => setShowFirewater(!showFirewater())}>
                        <div style={{ color: 'blue' }}>Close Flask</div>
                    </button>
                </div> )}
            </div>
            </button>
        </div>
        <Show when={showBleed()}>
            <div class='modal' onClick={() => setShowFirewater(!showFirewater())}>
            <button class='button border' style={{ 'max-height': dimensions().ORIENTATION === 'landscape' ? '85%' : '50%', 'max-width': dimensions().ORIENTATION === 'landscape' ? '35%' : '70%' }}>
            <div style={{ height: '100%' }}>
                <h1>
                    Firewater ( {ascean().firewater.current} / {ascean().firewater.max} )
                </h1>
                <h2 style={{ top: '-2.5%' }}>
                    There is an Ancient method of replenishing Fyervas Firewater. Se'vas wants your blood spilled to receive his Grace. Fyer asks this over fire, and to ensure the prayer is heard, you must brew this overnight.
                    Or, you can wait until you find a city and purchase a more recent solution.
                </h2>
                <p class='basicText' style={{ color: 'red' }}>
                    Do you wish to set camp and let it bleed?
                </p>
                {ascean().firewater.current === 0 && (
                    <button onClick={() => repelenishFirewater()}>
                        <p style={{ color: 'red' }}>Bleed</p>
                    </button>
                )}
            </div>
            </button>
            </div>
        </Show>
        </>
    );
};

interface Props {
    ascean: Accessor<Ascean>;
};

export default function Firewater({ ascean }: Props) {
    const [showFirewater, setShowFirewater] = createSignal<boolean>(false);
    const [showBleed, setShowBleed] = createSignal<boolean>(false);

    const drinkFirewater = async (): Promise<void> => {
        try {
            if (ascean().firewater.current === 0) return;
            console.log('Drinking Firewater');
            EventBus.emit('drink-firewater');
            setShowFirewater(false);
        } catch (err: any) {
            console.error(err.message);
        };
    };

    async function repelenishFirewater(): Promise<void> {
        try {
            console.log('Replenishing Firewater');
            setShowBleed(false);
            setShowFirewater(false);
        } catch (err: any) {
            console.error(err.message);
        };
    };
    return (
        <>
        <button class='playerSaveInventoryOuter' style={{ transform: 'scale(0.65)' }} onClick={() => setShowFirewater(!showFirewater())}>
            <img src={'../assets/images/firewater.png'} alt="Firewater" />
        </button>
        <Show when={showFirewater()}>
            <FirewaterModal ascean={ascean} showFirewater={showFirewater} setShowFirewater={setShowFirewater} drinkFirewater={drinkFirewater} showBleed={showBleed} setShowBleed={setShowBleed} repelenishFirewater={repelenishFirewater} />
        </Show>
        </>
    );
};