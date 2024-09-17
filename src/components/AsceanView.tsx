import { Accessor, createSignal, Show, lazy, Suspense } from 'solid-js';
import { AttributeCompiler } from './Attributes';
import { Attributes } from '../utility/attributes';
import { useResizeListener } from '../utility/dimensions';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import { Puff } from 'solid-spinner';
const AsceanImageCard = lazy(async () => await import('./AsceanImageCard'));
const ItemModal = lazy(async () => await import('./ItemModal'));
const AttributeModal = lazy(async () => await import('./Attributes'));

export default function AsceanView({ ascean }: { ascean: Accessor<Ascean> }) {
    const [show, setShow] = createSignal(false);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [attrShow, setAttrShow] = createSignal(false);
    const dimensions = useResizeListener();
    const viewMargin = { margin: '4%' };

    return <Show when={dimensions().ORIENTATION === 'landscape'} fallback={
        <div class='border superCenter center' style={{ height: '100', width: '85%', overflow: 'scroll', 'scrollbar-width': 'none' }}>
        <div class='creature-heading' style={{ width: '100%', height: '100%' }}>
            <h1>{ascean().name}</h1>
            <h2 class='mb-3'>{ascean().description}</h2>
            <img src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} alt={`${ascean().origin} ${ascean().sex}`} id='origin-pic' />
            <p style={viewMargin}>Level: <span class='gold'>{ascean().level}</span> | Experience: <span class='gold'>{ascean().experience}</span></p>
            <p style={viewMargin}>Health: <span class='gold'>{Math.round(ascean().health.current)}</span> / <span class='gold'>{ascean().health.max}</span> | Wealth: <span class='gold'>{ascean().currency.gold}g {ascean().currency.silver}s</span></p>
            <p style={viewMargin}>Faith: <span class='gold'>{ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}</span> | Mastery: <span class='gold'>{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</span></p>
            <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
            <Suspense fallback={<Puff color="gold" />}>
                <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
            </Suspense>
            <br />
            <Show when={show()}>
                <div class='modal' onClick={() => setShow(!show())}>
                <Suspense fallback={<Puff color="gold" />}>
                    <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
                </Suspense>
                </div>
            </Show>

            <Show when={attrShow()}>
            <div class='modal' onClick={() => setAttrShow(!attrShow())}>
                <Suspense fallback={<Puff color="gold" />}>
                    <AttributeModal attribute={attribute()} />
                </Suspense>
            </div> 
            </Show>
        </div>
        </div>
    }>
        <div class='stat-block superCenter' style={{ width: '90%', overflow: 'scroll', 'scrollbar-width': 'none' }}>
            <div class='border left center' style={{ height: '77.5vh', width: '48%', top: '10%' }}>
                <div class='creature-heading superCenter' style={{ width: '100%' }}>
                    <h1>{ascean().name}</h1>
                    <h2>{ascean().description}</h2>
                    <img src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id='origin-pic' />
                    <p style={viewMargin}>Level: <span class='gold'>{ascean().level}</span> | Experience: <span class='gold'>{ascean().experience}</span></p>
                    <p style={viewMargin}>Health: <span class='gold'>{Math.round(ascean().health.current)}</span> / <span class='gold'>{ascean().health.max}</span> | Wealth: <span class='gold'>{ascean().currency.gold}g {ascean().currency.silver}s</span></p>
                    <p style={viewMargin}>Faith: <span class='gold'>{ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}</span> | Mastery: <span class='gold'>{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</span></p>
                </div>
            </div>

            <div class='border right center' style={{ height: '77.5vh', width: '48%', top: '10%' }}>
                <div class='superCenter' style={{ 'margin-top': '0' }}>
                <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                <Suspense fallback={<Puff color="gold" />}>
                    <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
                </Suspense>
                </div>
            </div>
            
        </div>
        <div class='creature-heading center'>
        <Show when={show()}>
            <div class='modal' onClick={() => setShow(!show())}>
            <Suspense fallback={<Puff color="gold" />}>
                <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
            </Suspense>
            </div>
        </Show>

        <Show when={attrShow()}>
        <div class='modal' onClick={() => setAttrShow(!attrShow())}>
            <AttributeModal attribute={attribute()}/>
        </div> 
        </Show>
        </div>
    </Show>;
};