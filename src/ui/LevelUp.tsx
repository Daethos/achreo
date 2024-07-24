import { Accessor, For, Setter, Show, createMemo, createSignal, onMount } from "solid-js";
import { EventBus } from "../game/EventBus";
import { Attributes } from "../utility/attributes";
import { InputGroup } from "solid-bootstrap";
import { useResizeListener } from "../utility/dimensions";
import AttributeModal from "../components/Attributes";
import { FAITHS } from "../components/Faith";
import Ascean from "../models/ascean";
import { LevelSheet } from "../utility/ascean";

const Mastery = ({ mastery, state }: { mastery: any; state: Accessor<any>; }) => {
const [show, setShow] = createSignal<boolean>(false);
    const handleShow = () => setShow(!show()); 
    const handleMastery = () => {
        EventBus.emit('update-ascean-state', {
            ...state(),
            mastery: mastery.name
        });
        setShow(!show());
    };

    return <Show when={show()} fallback={<button onClick={handleMastery} class='highlight' style={{ color: mastery.name === state().mastery ? 'gold' : '#fdf6d8' }}>{mastery.name.charAt(0).toUpperCase() + mastery.name.slice(1)}</button>}>
        <div class="modal" onClick={handleShow}>
            <AttributeModal attribute={mastery} />
        </div>
    </Show>;
};

interface Props {
    ascean: Accessor<Ascean>;
    asceanState: Accessor<LevelSheet>;
    show: Accessor<boolean>; 
    setShow: Setter<boolean>;
};

const Faith = ({ faith, state }: { faith: any; state: Accessor<any>; }) => {
    const [show, setShow] = createSignal(false);
    const dimensions = useResizeListener();
    const handleShow = () => setShow(!show()); 
    const handleFaith = () => {
        EventBus.emit('update-ascean-state', {
            ...state(),
            faith: faith.worshipers
        });
        setShow(!show());
    };
    return <Show when={show()} fallback={<button onClick={handleFaith} class='highlight' style={{ color: faith.worshipers === state().faith ? 'gold' : '#fdf6d8' }}>{faith.name}</button>}>
        <div class='modal' onClick={handleShow}>
        <div class="border verticalCenter" style={dimensions()?.ORIENTATION === 'landscape' ?{ position: 'absolute', left: '15%', width: '70%' } : { }}>
        <div class="creature-heading border" style={{ 'text-wrap': 'balance' }}> 
            <img src={faith.iconography} alt={faith.name} id="origin-pic" style={{ width: dimensions().ORIENTATION === 'landscape' ? '15%' : '', 'margin-top': '3%' }} />
            <p class='gold small'>{faith.origin}</p>
            <h2 class='gold'>{faith.quote}</h2>
        </div>
        </div>
        </div>
    </Show>;
};

export default function LevelUp({ ascean, asceanState, show, setShow }: Props) {
    const [pool, setPool] = createSignal<number>(0);
    const dimensions = useResizeListener();

    const handleChange = (event: any, name: string, value: number): void => {
        event.preventDefault();
        EventBus.emit('update-ascean-state', {
            ...asceanState(),
            [name]: Number(asceanState()[name as keyof typeof asceanState]) + value
        });
        setPool(pool() + value);
    };

    const ceiling = (): boolean => pool() < 2;
    const floor = (name: string): boolean => (asceanState()?.[name as keyof typeof asceanState] as number + asceanState().ascean[name as keyof typeof asceanState]) > asceanState().ascean[name as keyof typeof asceanState];
    function checkAscean() {
        EventBus.emit('update-ascean-state', {
            ...asceanState(),
            ascean: ascean()
        });
    };
    function valueDiscrepancy(): boolean {
        return (ascean().constitution !== asceanState().ascean.constitution) 
            || (ascean().strength !== asceanState().ascean.strength) 
            || (ascean().agility !== asceanState().ascean.agility) 
            || (ascean().achre !== asceanState().ascean.achre) 
            || (ascean().caeren !== asceanState().ascean.caeren) 
            || (ascean().kyosir !== asceanState().ascean.kyosir);
    };

    createMemo(() => {if (valueDiscrepancy()) checkAscean();}); 
    onMount(() => {
        EventBus.emit('update-ascean-state', {
            ...asceanState(),
            constitution: 0,
            strength: 0,
            agility: 0,
            achre: 0,
            caeren: 0,
            kyosir: 0,    
        });
        const asceanStateAttributeTotal = asceanState().strength + asceanState().agility + asceanState().constitution + asceanState().achre + asceanState().caeren + asceanState().kyosir;
        setPool(asceanStateAttributeTotal);
    });
    const levelUp = (state: Accessor<any>) => {
        EventBus.emit('level-up', state);
        setShow(false);
    };
    return <div class='modal' style={{ 'z-index': 5 }}>
        <div class='stat-block superCenter' style={{ width: '100%', background: 'rgba(0, 0, 0, 0.9' }}>
            <div class='left center' style={{ height: '80%', width: '48%',  top: '10%',display: 'inline-block', border: '0.15em solid #fdf6d8' }}>
                <h3 class='gold wrap' style={{ 'margin': '5%' }}>Congratulations {asceanState().ascean.name}, You Can Now Level Up To {asceanState().ascean.level + 1}</h3>
                <p class='gold wrap' style={{ 'margin-bottom': '3%' }}>You may change your faith at this time.</p>
                <div>
                    <For each={FAITHS}>
                        {(faith) => (
                            <Faith faith={faith} state={asceanState} />
                        )}
                    </For>
                </div>
                <div class='gold wrap' style={{ 'margin': '3%' }}>You may also change your focus of mastery at this time.</div>
                <div>
                    <For each={Attributes}>
                        {(mastery) => (
                            <Mastery mastery={mastery} state={asceanState} />
                        )}
                    </For>
                </div>      
            </div>
            <div class='right center' style={{ height: '80%', width: '48%', top: '10%', display: 'inline-block', border: '0.15em solid #fdf6d8' }}>
            <div class='' style={{ width: 'auto' }}>
                <p class='gold'>You will gain 2 attribute points <br />Would you like to allocate them now?</p>
                <h3 class='gold' style={{ 'margin-bottom' : '5%' }}>Attribute Pool: {pool()} / 2</h3>
                <For each={Attributes}>
                    {(attribute) => (
                        <InputGroup style={{ width: dimensions().ORIENTATION === 'landscape' ? `33%` : `40%`, display: 'inline-block', height: 'auto' }}>
                            <p class='tighten'>{attribute.name.charAt(0).toUpperCase() + attribute.name.slice(1)}</p>
                            <br />
                            <span class='gold'>{asceanState()[attribute.name as keyof typeof asceanState] + asceanState().ascean[attribute.name as keyof typeof asceanState]} ({Math.floor((asceanState()[attribute.name as keyof typeof asceanState] as number + asceanState().ascean[attribute.name as keyof typeof asceanState] - 10) / 2) > 0 ? '+' : ''}{(Math.floor(((asceanState()[attribute.name as keyof typeof asceanState] as number + asceanState().ascean[attribute.name as keyof typeof asceanState]) - 10) / 2))})</span>
                            <br />
                            <button class='highlight' onClick={(e) => handleChange(e, attribute.name, -1)} style={{ display: floor(attribute.name) ? 'inline-block' : 'none', width: 'auto', height: 'auto', transform: 'scale(0.75)' }}>-</button>
                            <button class='highlight' onClick={(e) => handleChange(e, attribute.name, 1)} style={{ display: ceiling() ? 'inline-block' : 'none', width: 'auto', height: 'auto', transform: 'scale(0.75)' }}>+</button>
                        </InputGroup>
                    )}
                </For>
            </div>
            </div>
            <Show when={pool() === 2}>
                <button class='highlight cornerTL animate' style={{ 'background-color': 'green', color: '#000', 'font-weight': 700 }} onClick={() => levelUp(asceanState)}>Level Up</button>
            </Show>
        </div>
        <button class='highlight cornerBR' style={{ 'background-color': 'red' }} onClick={() => setShow(!show())}>X</button>
    </div>;
};