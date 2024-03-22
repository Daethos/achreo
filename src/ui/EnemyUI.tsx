import { Accessor, For, Setter, Show, createEffect, createSignal } from 'solid-js'
import ItemModal from '../components/ItemModal';
import AttributeModal, { AttributeCompiler } from '../components/Attributes';
import AsceanImageCard from '../components/AsceanImageCard';
import { itemStyle } from '../utility/styling';
import HealthBar from './HealthBar';
import { EventBus } from '../game/EventBus';
import PrayerEffects from './PrayerEffects';
import { useResizeListener } from '../utility/dimensions';
import { Combat } from '../stores/combat';
import { Attributes } from '../utility/attributes';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';

function EnemyModal({ state, show, setShow }: { state: Accessor<Combat>, show: Accessor<boolean>, setShow: Setter<boolean> }) {
    const [enemy, setEnemy] = createSignal(state().computer);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(state().computerWeapons[0]);
    const [attributeShow, setAttributeShow] = createSignal<boolean>(false);
    const [itemShow, setItemShow] = createSignal<boolean>(false);
    const dimensions = useResizeListener(); 

    createEffect(() => {
        setEnemy(state().computer);
    });
    return (
        <div class='modal'>
        <div class='border center' style={{ 'max-height': dimensions().ORIENTATION === 'landscape' ? '85%' : '50%', 'max-width': dimensions().ORIENTATION === 'landscape' ? '50%' : '70%' }}>
            <button class='button cornerTR' style={{ 'z-index': 1 }} onClick={() => setShow(!show)}>
                <p style={{ color: '#fdf6d8' }}>X</p>
            </button>
            <div class='creature-heading' style={{ height: '100%', width: '100%' }}>
                <h1 class='m-5' style={{ 'text-align': 'center', color: "gold", 'padding-top': '0.5em' }}>
                    {state().computer?.name}
                </h1>
                <h2>
                    {state().computer?.description}
                </h2>
                <img src={`../assets/images/${state()?.computer?.origin}-${state()?.computer?.sex}.jpg`} alt={state().computer?.name} id='origin-pic' />
                <div style={{ 'margin-bottom': '10%' }}>
                    <HealthBar totalPlayerHealth={state().computerHealth} newPlayerHealth={state().newComputerHealth} />
                </div>
                <AttributeCompiler ascean={enemy as Accessor<Ascean>} setAttribute={setAttribute} show={attributeShow} setShow={setAttributeShow} />
                <div>
                    <AsceanImageCard ascean={enemy as Accessor<Ascean>} weaponOne={state().computerWeapons[0]} weaponTwo={state().computerWeapons[1]} weaponThree={state().computerWeapons[2]} show={itemShow} setShow={setItemShow} setEquipment={setEquipment} />
                </div>
                <Show when={itemShow()}>
                    <div class='modal' onClick={() => setItemShow(!itemShow)}>
                        <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
                    </div>
                </Show>
                <Show when={attributeShow()}>
                    <div class='modal' onClick={() => setAttributeShow(!attributeShow)}>
                        <AttributeModal attribute={attribute} />
                    </div>
                </Show>
            </div>
        </div>
        </div>
    );
};

export default function EnemyUI({ state, pauseState, enemies }: { state: Accessor<Combat>, pauseState: boolean, enemies: Accessor<any[]> }) {
    const [playerEnemyPercentage, setEnemyHealthPercentage] = createSignal(0); 
    const [showModal, setShowModal] = createSignal(false);
    const [itemShow, setItemShow] = createSignal(false);

    createEffect(() => {
        setEnemyHealthPercentage(Math.round((state().newComputerHealth/state().computerHealth) * 100));
    });

    function fetchEnemy(enemy: any) {
        EventBus.emit('setup-enemy', enemy);
        EventBus.emit('tab-target', enemy);    
    };

    return (
        <div class='enemyCombatUi'>
            <div class='enemyItem'>
                <button class='enemyUiWeapon' onClick={() => setItemShow(!itemShow())} style={itemStyle(state()?.computerWeapons?.[0]?.rarity as string)}>
                    <img src={state().computerWeapons?.[0]?.imgUrl} alt={state().computerWeapons?.[0]?.name} />
                </button>
            </div>
            <div class='enemyName' onClick={() => setShowModal(!showModal)}>{state().computer?.name}</div>
            <div class='enemyHealthBar center'>
                <div class='enemyPortrait' style={{ 'border-color': 'red' }}>{`${Math.round(state().newComputerHealth)} / ${state().computerHealth} [${playerEnemyPercentage}%]`}</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, top: 0, width: `${playerEnemyPercentage}%`, 'background-color': '#FFC700', 'border': '0.15 solid red' }}></div>
            </div>
            <img class='enemyHealthbarBorder' src={require('../assets/gui/enemy-healthbar.png')} alt="Health Bar" />
            <Show when={state().computerEffects.length > 0}>
                <div class='enemyCombatEffects'>
                    <For each={state().computerEffects}>{((effect) => ( 
                        <PrayerEffects combat={state} effect={effect} enemy={true} pauseState={pauseState} /> 
                    ))}</For>
                </div>
            </Show> 
            <div class='enemyPreview' style={{ transform: 'scale(0.5)' }}>
            <For each={enemies()}>{((enemy, index) => {
                const prevIdx = Number(index) - 1 === -1 ? enemies().length - 1 : Number(index) - 1;
                const prevIdxMore = prevIdx - 1 === -1 ? enemies().length - 1 : prevIdx - 1;
                const truePrev = enemies()[prevIdxMore].id !== state().enemyID && enemy.id !== enemies()[prevIdxMore].id;
                if (enemies()[prevIdx].id !== state().enemyID || enemies().length < 2) return;
                return ( 
                    <div>
                    <Show when={truePrev}>
                        <button class='center' style={{ width: '50%', display: 'inline-block' }} onClick={() => fetchEnemy(enemies()[prevIdxMore])}>
                            <div style={{ color: 'gold', 'text-align': 'center', 'font-size': '0.75em' }}>{`<< Prev`}</div>
                            <img src={`../assets/images/${enemies()[prevIdxMore].game.origin}-${enemies()[prevIdxMore].game.sex}.jpg`} alt={enemies()[prevIdxMore].game.name} id='origin-pic' />
                            <div style={{ color: 'gold', 'text-align': 'center', 'font-size': '0.75em' }}>{enemies()[prevIdxMore].game.name}</div>
                        </button>
                    </Show>
                    <button class='center' style={{ width: '50%', display: 'inline-block', 'margin-left': truePrev ? '' : '50%' }} onClick={() => fetchEnemy(enemy)}>
                        <div style={{ color: 'gold', 'text-align': 'center', 'font-size': '0.75em' }}>{`Next >>`}</div>
                        <img src={`../assets/images/${enemy.game.origin}-${enemy.game.sex}.jpg`} alt={enemy.game.name} id='origin-pic' />
                        <div style={{ color: 'gold', 'text-align': 'center', 'font-size': '0.75em' }}>{enemy.game.name}</div>
                    </button>
                </div> 
                )})}</For>
            </div>
            <Show when={showModal}>
                <EnemyModal state={state} show={showModal} setShow={setShowModal} /> 
            </Show>
            <Show when={itemShow() && state().computerWeapons?.[0]}>
                <div class='modal' onClick={() => setItemShow(!itemShow)}>
                    <ItemModal item={state().computerWeapons[0]} stalwart={false} caerenic={false} /> 
                </div>
            </Show>
        </div>
    );
};
