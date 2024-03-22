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
            <div class='border center' style={{ width: dimensions().ORIENTATION === 'landscape' ? '60%' : '85%', overflow: 'scroll' }}>
            <div class='creature-heading' style={{ width: '100%', height: '100%' }}>
                <h1>{ascean().name}</h1>
                <h2 class='mb-3'>{ascean().description}</h2>
                <img src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id='origin-pic' />
                <p class='gold' style={{ 'font-size': '1.25em'}}>Level: {ascean().level}</p>
                <p class='gold' style={{ 'font-size': '1.25em'}}>Experience: {ascean().experience}</p>
                <p class='gold' style={{ 'font-size': '1.25em'}}>Mastery: {ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</p>
                <p class='gold' style={{ 'font-size': '1.25em'}}>Health: {ascean().health.current} / {ascean().health.max}</p>
                <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                <AsceanImageCard ascean={ascean} weaponOne={ascean().weaponOne} weaponTwo={ascean().weaponTwo} weaponThree={ascean().weaponThree} show={show} setShow={setShow} setEquipment={setEquipment} />
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
            <div class='stat-block superCenter' style={{ width: dimensions().ORIENTATION === 'landscape' ? '80%' : '85%', overflow: 'scroll' }}>
                <div class='drop-25 left' style={{ width: '50%' }}>
                    <div class='center creature-heading' style={{ width: '100%', height: '100%' }}>
                        <h1>{ascean().name}</h1>
                        <h2 class='mb-3'>{ascean().description}</h2>
                        <img src={`../assets/images/${ascean().origin}-${ascean().sex}.jpg`} id='origin-pic' />
                        <p class='gold' style={{ 'font-size': '1.25em'}}>Level: {ascean().level}</p>
                        <p class='gold' style={{ 'font-size': '1.25em'}}>Experience: {ascean().experience}</p>
                        <p class='gold' style={{ 'font-size': '1.25em'}}>Mastery: {ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</p>
                        <p class='gold' style={{ 'font-size': '1.25em'}}>Health: {ascean().health.current} / {ascean().health.max}</p>
                    </div>
                </div>

                <div class='drop-25 right center' style={{ width: '50%' }}>
                    <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                    <AsceanImageCard ascean={ascean} weaponOne={ascean().weaponOne} weaponTwo={ascean().weaponTwo} weaponThree={ascean().weaponThree} show={show} setShow={setShow} setEquipment={setEquipment} />
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