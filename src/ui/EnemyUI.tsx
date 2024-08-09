import { Accessor, For, Setter, Show, Suspense, createEffect, createSignal, lazy } from 'solid-js'
import ItemModal from '../components/ItemModal';
import AttributeModal, { AttributeCompiler } from '../components/Attributes';
import AsceanImageCard from '../components/AsceanImageCard';
import { itemStyle } from '../utility/styling';
import { EventBus } from '../game/EventBus';
import PrayerEffects from './PrayerEffects';
import { useResizeListener } from '../utility/dimensions';
import { Combat } from '../stores/combat';
import { Attributes } from '../utility/attributes';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import StatusEffect from '../utility/prayer';
import { PrayerModal } from '../utility/buttons';
import { GameState } from '../stores/game';
import { EnemySheet } from '../utility/enemy';
import { Puff } from 'solid-spinner';
import { createHealthDisplay } from '../utility/health';
const HealthBar = lazy(async () => await import('./HealthBar'));

function EnemyModal({ state, show, setShow, game }: { state: Accessor<Combat>, show: Accessor<boolean>, setShow: Setter<boolean>; game: Accessor<GameState> }) {
    const [enemy, setEnemy] = createSignal(state().computer);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(state().computerWeapons[0]);
    const [attributeShow, setAttributeShow] = createSignal<boolean>(false);
    const [itemShow, setItemShow] = createSignal<boolean>(false);
    const dimensions = useResizeListener(); 

    createEffect(() => {
        setEnemy(state().computer);
    });

    const removeEnemy = (id: string) => {
        EventBus.emit('disengage');
        EventBus.emit('remove-enemy', id);
        setShow(!show());
    };

    const clearEnemy = () => {
        EventBus.emit('disengage');
        setShow(!show());
    };
    // transform: 'scale(0.875)'
    return <div class='modal'>
        <div class='border center' style={{ 'max-height': dimensions().ORIENTATION === 'landscape' ? '95%' : '50%', 'width': dimensions().ORIENTATION === 'landscape' ? '50%' : '70%', 'margin-top': '2%' }}>
            <button class='highlight cornerBL' style={{ 'z-index': 1 }} onClick={clearEnemy}>
                <p style={{ color: '#fdf6d8' }}>Clear UI</p>
            </button>
            <button class='highlight cornerTL' style={{ 'z-index': 1 }} onClick={() => removeEnemy(state().enemyID)}>
                <p style={{ color: '#fdf6d8' }}>Remove {enemy()?.name.split(' ')[0]}</p>
            </button>
            <button class='highlight cornerTR' style={{ 'z-index': 1 }} onClick={() => setShow(!show)}>
                <p style={{ color: '#fdf6d8' }}>X</p>
            </button>
            <div class='creature-heading center' style={{ height: '100%', width: '100%' }}>
                <h1 style={{ 'text-align': 'center', color: "gold", 'padding-top': '0' }}>
                    {state().computer?.name}
                </h1>
                <h2 style={{ margin: '2%' }}>
                    {state().computer?.description}
                </h2>
                <Suspense fallback={<Puff color="gold"/>}>
                <div style={{ position: 'absolute', left: '25vw', display: 'inline', height: '75vh', width: '50vw', 'z-index': 99 }}>
                    <HealthBar combat={state} enemy={true} game={game} />
                </div>
                </Suspense>
                <div style={{ color: '#fdf6d8', 'margin-top': '9.5%', 'font-size': '0.875em' }}>
                    Level <span class='gold'>{state().computer?.level}</span> | Mastery <span class='gold'>{state().computer?.mastery.charAt(0).toUpperCase()}{state().computer?.mastery.slice(1)}</span>
                </div>
                <div style={{ transform: 'scale(0.875)', 'margin-top': '0%' }}>
                    <AttributeCompiler ascean={enemy as Accessor<Ascean>} setAttribute={setAttribute} show={attributeShow} setShow={setAttributeShow} />
                </div>
                <div style={{ 'margin-left': '0', 'margin-top': '-7.5%', transform: 'scale(0.8)' }}>
                    <AsceanImageCard ascean={enemy as Accessor<Ascean>} show={itemShow} setShow={setItemShow} setEquipment={setEquipment} />
                </div>
                <Show when={itemShow()}>
                    <div class='modal' onClick={() => setItemShow(!itemShow)}>
                        <ItemModal item={equipment() as Equipment} stalwart={false} caerenic={false} /> 
                    </div>
                </Show>
                <Show when={attributeShow()}>
                    <div class='modal' onClick={() => setAttributeShow(!attributeShow)}>
                        <AttributeModal attribute={attribute()} />
                    </div>
                </Show>
            </div>
        </div>
    </div>;
};

export default function EnemyUI({ state, game, enemies }: { state: Accessor<Combat>, game: Accessor<GameState>, enemies: Accessor<EnemySheet[]> }) {
    const [showModal, setShowModal] = createSignal(false);
    const [itemShow, setItemShow] = createSignal(false);
    const [prayerShow, setPrayerShow] = createSignal(false);
    const [effect, setEffect] = createSignal<StatusEffect>();
    const { healthDisplay, changeDisplay, healthPercentage } = createHealthDisplay(state, game, true);
    function fetchEnemy(enemy: EnemySheet) {
        EventBus.emit('setup-enemy', enemy);
        EventBus.emit('tab-target', enemy);    
    };
    const size = (len: number) => {
        switch (true) {
            case len < 20:
                return '1em';
            case len < 30:
                return '0.85em';
            default:
                return '0.6em';
        };
    };
    function strip(id: string) {
        let computerEffects = [ ...state().computerEffects ];
        computerEffects = computerEffects.filter((prayer) => prayer.id !== id);
        EventBus.emit('blend-combat', { computerEffects });
    };
    // function createPrayer() {
    //     console.log('Creating prayer...');
    //     const exists = new StatusEffect(
    //         state(), 
    //         state().computer as Ascean, 
    //         state().player as Ascean, 
    //         state().computerWeapons[0] as Equipment, 
    //         state().computerAttributes as CombatAttributes, 
    //         state().computerBlessing
    //     );
    //         console.log(exists, 'exists');
    //     EventBus.emit('create-enemy-prayer', exists);
    // };
    return (
        <div class='enemyCombatUi'>
            <div class='enemyName' style={{ 'z-index': 1, 'font-size': size(state().computer?.name.length as number) }} onClick={() => setShowModal(!showModal())}>{state().computer?.name}</div>
            <div class='center enemyHealthBar' onClick={changeDisplay}>
                <div class='enemyPortrait' style={{ 'font-size': '1em', color: '#fdf6d8' }}>{healthDisplay()}</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, top: 0, 'z-index': -1, width: `100%`, 'background-color': '#FF0000' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, top: 0, 'z-index': -1, width: `${healthPercentage()}%`, 'background': 'linear-gradient(#00AA00, green)' }}></div>
            </div>
            <img id='enemyHealthbarBorder' src={'../assets/gui/enemy-healthbar.png'} alt="Health Bar" style={{ 'z-index': -1 }} />
            <div class='enemyUiWeapon' onClick={() => setItemShow(!itemShow())} style={itemStyle(state()?.computerWeapons?.[0]?.rarity as string)}>
                <img src={state().computerWeapons?.[0]?.imgUrl} alt={state().computerWeapons?.[0]?.name} />
            </div>
            {/* <button class='highlight center' onClick={() => createPrayer()}>
                <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>Create Prayer</div>
            </button> */}
            <Show when={state().computerEffects?.length > 0 && state().combatEngaged === true}>
                <div class='combatEffects' style={{ position: 'fixed', right: '7vw', top: '14vh', 'height': '13vh', width: 'auto', transform: 'scale(0.5)' }}>
                    <For each={state().computerEffects}>{((effect) => ( 
                        <PrayerEffects combat={state} effect={effect} enemy={true} game={game} strip={strip} show={prayerShow} setShow={setPrayerShow} setEffect={setEffect as Setter<StatusEffect>} /> 
                    ))}</For>
                </div>
            </Show> 
            {enemies()?.length > 0 && enemies()?.map((enemy, index) => {
                const prevIdx = Number(index) - 1 === -1 ? enemies().length - 1 : Number(index) - 1;
                const prevIdxMore = prevIdx - 1 < 0 ? enemies().length + (prevIdx - 1) : prevIdx - 1;
                if (enemies().length < 2 || enemies()[prevIdx].id !== state().enemyID) return;
                const truePrev = enemies()[prevIdxMore].id !== state().enemyID && enemy.id !== enemies()[prevIdxMore].id;
                let cleanName = enemies()[prevIdxMore].game.name;
                cleanName = cleanName.includes(' ') ? cleanName.split(' ')[0] + ' ' + cleanName.split(' ')[1] : cleanName;
                let cleanEnemy = enemy.game.name;
                cleanEnemy = cleanEnemy.includes(' ') ? cleanEnemy.split(' ')[0] + ' ' + cleanEnemy.split(' ')[1] : cleanEnemy;
                return (
                    <Show when={truePrev} fallback={
                        <div style={{ transform: 'scale(0.75)', 'background-color': '#000', position: 'absolute', height: 'auto', width: '10vw', top: '13.5vh', right: '0vw' }}>
                            <button class='center' style={{ width: 'auto', height: '100%', display: 'inline-block', 'background-color': '#000' }} onClick={() => fetchEnemy(enemy)}>
                                <img src={`../assets/images/${enemy.game.origin}-${enemy.game.sex}.jpg`} alt={cleanEnemy} id='deity-pic' />
                                <div style={{ color: 'gold', 'text-align': 'center', 'font-size': '0.75em' }}>{cleanEnemy}</div>
                            </button>
                        </div>
                    }>
                        <div style={{ transform: 'scale(0.75)', position: 'absolute', width: '20vw', top: '13.5vh', right: '-2vw' }}>
                            <button class='center' style={{ height: '100%', width: '50%', display: 'inline-block', 'background-color': '#000' }} onClick={() => fetchEnemy(enemies()[prevIdxMore])}>
                                <img src={`../assets/images/${enemies()[prevIdxMore].game.origin}-${enemies()[prevIdxMore].game.sex}.jpg`} alt={enemies()[prevIdxMore].game.name} id='deity-pic' />
                                <div style={{ color: 'gold', 'text-align': 'center', 'font-size': '0.75em' }}>{cleanName}</div>
                            </button>
                            <button class='center' style={{ width: '50%', height: '100%', display: 'inline-block', 'background-color': '#000' }} onClick={() => fetchEnemy(enemy)}>
                                <img src={`../assets/images/${enemy.game.origin}-${enemy.game.sex}.jpg`} alt={cleanEnemy} id='deity-pic' />
                                <div style={{ color: 'gold', 'text-align': 'center', 'font-size': '0.75em' }}>{cleanEnemy}</div>
                            </button>
                        </div>
                    </Show> 
            )})}
            <Show when={showModal()}>
                <EnemyModal state={state} show={showModal} setShow={setShowModal} game={game} /> 
            </Show>
            <Show when={itemShow() && state().computerWeapons?.[0]}>
                <div class='modal' onClick={() => setItemShow(!itemShow)}>
                    <ItemModal item={state().computerWeapons[0]} stalwart={false} caerenic={false} /> 
                </div>
            </Show>
            <Show when={prayerShow()}>
                <PrayerModal prayer={effect as Accessor<StatusEffect>} show={prayerShow} setShow={setPrayerShow} />
            </Show>
        </div>
    );
};
