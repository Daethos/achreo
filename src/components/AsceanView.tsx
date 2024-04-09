import { Accessor, createSignal, Show } from 'solid-js';
import AttributeModal, { AttributeCompiler } from './Attributes';
import { Attributes } from '../utility/attributes';
import { useResizeListener } from '../utility/dimensions';
import AsceanImageCard from './AsceanImageCard';
import ItemModal from './ItemModal';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';

export function AsceanView({ ascean }: { ascean: Accessor<Ascean> }) {
    const [show, setShow] = createSignal(false);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [attrShow, setAttrShow] = createSignal(false);
    const dimensions = useResizeListener();

    return (
        <Show when={dimensions().ORIENTATION === 'landscape'} fallback={
            <div class='border center' style={{ height: '100', width: '85%', overflow: 'scroll' }}>
            <div class='creature-heading' style={{ width: '100%', height: '100%' }}>
                <h1>{ascean().name}</h1>
                <h2 class='mb-3'>{ascean().description}</h2>
                <img src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id='origin-pic' />
                <p style={{ margin: '4%' }}>Level: <span class='gold'>{ascean().level}</span> | Experience: <span class='gold'>{ascean().experience}</span></p>
                <p style={{ margin: '4%' }}>Health: <span class='gold'>{Math.round(ascean().health.current)}</span> / <span class='gold'>{ascean().health.max}</span> | Wealth: <span class='gold'>{ascean().currency.gold}g {ascean().currency.silver}s</span></p>
                <p style={{ margin: '4%' }}>Faith: <span class='gold'>{ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}</span> | Mastery: <span class='gold'>{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</span></p>
                <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
                <br />
                <Show when={show()}>
                    <div class='modal' onClick={() => setShow(!show())}>
                        <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
                    </div>
                </Show>

                <Show when={attrShow()}>
                <div class='modal' onClick={() => setAttrShow(!attrShow())}>
                    <AttributeModal attribute={attribute()} />
                </div> 
                </Show>
            </div>
            </div>
        }>
            <div class='stat-block superCenter' style={{ width: '90%', overflow: 'scroll' }}>
                <div class='border left center' style={{ height: '77.5vh', width: '48%', top: '10%' }}>
                    <div class='creature-heading' style={{ width: '100%', height: '100%', 'margin-top': '5%' }}>
                        <h1>{ascean().name}</h1>
                        <h2>{ascean().description}</h2>
                        <img src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id='origin-pic' />
                        <p style={{ margin: '4%' }}>Level: <span class='gold'>{ascean().level}</span> | Experience: <span class='gold'>{ascean().experience}</span></p>
                        <p style={{ margin: '4%' }}>Health: <span class='gold'>{Math.round(ascean().health.current)}</span> / <span class='gold'>{ascean().health.max}</span> | Wealth: <span class='gold'>{ascean().currency.gold}g {ascean().currency.silver}s</span></p>
                        <p style={{ margin: '4%' }}>Faith: <span class='gold'>{ascean().faith.charAt(0).toUpperCase() + ascean().faith.slice(1)}</span> | Mastery: <span class='gold'>{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</span></p>
                    </div>
                </div>

                <div class='border right center' style={{ height: '77.5vh', width: '48%', top: '10%' }}>
                    <div style={{ 'margin-top': '5%' }}>
                    <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                    <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
                    </div>
                </div>
                
            </div>
            <div class='creature-heading center'>
            <Show when={show()}>
                <div class='modal' onClick={() => setShow(!show())}>
                    <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
                </div>
            </Show>

            <Show when={attrShow()}>
            <div class='modal' onClick={() => setAttrShow(!attrShow())}>
                <AttributeModal attribute={attribute()}/>
            </div> 
            </Show>
            </div>
        </Show>
    );
}