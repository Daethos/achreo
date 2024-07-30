import { Accessor, Setter, createEffect, createSignal } from 'solid-js'
import ItemModal from '../components/ItemModal';
import { border, borderColor, itemStyle, masteryColor } from '../utility/styling';
import PrayerEffects from './PrayerEffects';
import { EventBus } from '../game/EventBus';
import { For, Show } from 'solid-js';
import { Combat } from '../stores/combat';
import StatusEffect from '../utility/prayer';
import { PrayerModal } from '../utility/buttons';
import { GameState } from '../stores/game';
import GraceBubble from './GraceBubble';
import StaminaBubble from './StaminaBubble';
import StaminaModal from '../components/StaminaModal';
import GraceModal from '../components/GraceModal';
// import { CombatAttributes } from '../utility/combat';
// import Equipment from '../models/equipment';
// import Ascean, { initAscean } from '../models/ascean';
const DISPLAYS = {
    FULL: {KEY:'FULL', NEXT:'NUMBER'},
    NUMBER: {KEY:'NUMBER', NEXT:'BARE'},
    BARE: {KEY:'BARE', NEXT:'PERCENT'},
    PERCENT: {KEY:'PERCENT', NEXT:'NONE'},
    NONE: {KEY:'NONE', NEXT:'FULL'},
};
interface Props {
    state: Accessor<Combat>;
    game: Accessor<GameState>;
    stamina: Accessor<number>;
    grace: Accessor<number>;
};

export default function CombatUI({ state, game, stamina, grace }: Props) {
    const [effect, setEffect] = createSignal<StatusEffect>();
    const [show, setShow] = createSignal(false);
    const [prayerShow, setPrayerShow] = createSignal(false);
    const [shieldShow, setShieldShow] = createSignal(false);
    const [staminaShow, setStaminaShow] = createSignal(false);
    const [graceShow, setGraceShow] = createSignal(false);
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(0); 
    const [display, setDisplay] = createSignal<any>('FULL');
    const [healthDisplay, setHealthDisplay] = createSignal<any>('');
    createEffect(() => setPlayerHealthPercentage(Math.round((state().newPlayerHealth/state().playerHealth) * 100)));  
    createEffect(() => {
        if (display() === 'FULL') {
            setHealthDisplay(`${Math.round(state().newPlayerHealth)} / ${state().playerHealth} [${playerHealthPercentage()}%]`);
        } else if (display() === 'NONE') {
            setHealthDisplay(`          `);
        } else if (display() === 'NUMBER') {
            setHealthDisplay(`${Math.round(state().newPlayerHealth)} / ${state().playerHealth}`);
        } else if (display() === 'BARE') {
            setHealthDisplay(`${Math.round(state().newPlayerHealth)}`);
        } else if (display() === 'PERCENT') {
            setHealthDisplay(`${playerHealthPercentage()}%`);
        };
    });
    const disengage = () => EventBus.emit('disengage');
    const showPlayer = () => {
        EventBus.emit('show-player');
        EventBus.emit('action-button-sound');
        EventBus.emit('update-small-hud');
    };
    function caerenic(caerenic: boolean) {
        return {
            'background-color': caerenic ? masteryColor(state()?.player?.mastery as string) : 'black',
            'border': border(borderColor(state()?.playerBlessing), 0.15),
        };
    };
    const changeDisplay = () => {
        const nextView = DISPLAYS[display() as keyof typeof DISPLAYS].NEXT;
        console.log(nextView, 'Next View');
        setDisplay(nextView)
    };
    // function createPrayer() {
    //     const computer = initAscean;
    //     const exists = new StatusEffect(
    //         state(), 
    //         state().player as Ascean, 
    //         computer as Ascean, 
    //         state().weapons[0] as Equipment, 
    //         state().playerAttributes as CombatAttributes, 
    //         state().playerBlessing
    //     );
    //     EventBus.emit('create-prayer', exists);
    // };
    return <div class='playerCombatUi'> 
        <p class='playerName' style={{ color: `${state().isStealth ? '#fdf6d8' : 'gold'}`, 'text-shadow': `0.1em 0.1em 0.1em ${state().isStealth ? '#444' : '#000'}`, 'z-index': 1 }} onClick={() => showPlayer()}>{state()?.player?.name}</p>
        <div class='center playerHealthBar' style={{ 'z-index': 0 }}>
            <div class='playerPortrait' style={{ 'font-size': '1.075em', 'font-weight': 700, color: state().isStealth ? '#fdf6d8' : '#000', 'text-shadow': `0.075em 0.075em 0.075em ${state().isStealth ? '#000' : '#fdf6d8'}`, 'z-index': 1 }}>{healthDisplay()}</div>
            <div class='healthbarPosition' style={{ width: `100%`, 'background-color': 'red' }}></div>
            <div class='healthbarPosition' style={{ width: `${playerHealthPercentage()}%`, 'background': state()?.isStealth ? 'linear-gradient(#000, #444)' : 'linear-gradient(gold, #fdf6d8)' }}></div>
        </div>
        <img id='playerHealthbarBorder' src={'../assets/gui/player-healthbar.png'} alt="Health Bar" onClick={changeDisplay}/>
        <StaminaBubble stamina={stamina} show={staminaShow} setShow={setStaminaShow} />
        <GraceBubble grace={grace} show={graceShow} setShow={setGraceShow} />
        <div class='combatUiWeapon' onClick={() => setShow(show => !show)} style={caerenic(state().isCaerenic) as any}>
            <img src={state()?.weapons?.[0]?.imgUrl} alt={state()?.weapons?.[0]?.name} />
        </div>
        <Show when={state().isStalwart}>
        <div class='combatUiShield' onClick={() => setShieldShow(shieldShow => !shieldShow)} style={itemStyle(state()?.player?.shield?.rarity as string)}>
            <img src={state()?.player?.shield.imgUrl} alt={state()?.player?.shield.name} style={{ transform: `[{ rotate: '-45deg' }, { scale: 0.875 }]` }} />
        </div>
        </Show>
        <Show when={show()}>
        <div class='modal' onClick={() => setShow(!show())}>
            <ItemModal item={state().weapons[0]} stalwart={false} caerenic={state().isCaerenic} />
        </div>
        </Show>
        <Show when={shieldShow()}>
        <div class='modal' onClick={() => setShieldShow(!shieldShow())}>
            <ItemModal item={state()?.player?.shield} stalwart={state().isStalwart} caerenic={false} />
        </div>
        </Show>  
        <Show when={state().playerEffects.length > 0}>
        <div class='combatEffects' style={{ left: '-3vw', top: '15vh', 'height': '14vh', width: 'auto', transform: 'scale(0.75)' }}>
            <For each={state().playerEffects}>{(effect) => ( 
                <PrayerEffects combat={state} effect={effect} enemy={false} game={game} show={prayerShow} setShow={setPrayerShow} setEffect={setEffect as Setter<StatusEffect>} /> 
            )}</For>
        </div>
        </Show> 
        <Show when={state().isStealth && state().computer}> 
        <button class='disengage highlight' style={{ top: '12.5vh', left: '0vw' }} onClick={() => disengage()}>
            <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>Disengage</div>
        </button> 
        </Show>
        <Show when={prayerShow()}>
            <PrayerModal prayer={effect as Accessor<StatusEffect>} show={prayerShow} setShow={setPrayerShow} />
        </Show>
        <Show when={staminaShow()}>
        <div class='modal' onClick={() => setStaminaShow(!staminaShow())}>
            <StaminaModal />
        </div> 
        </Show>
        <Show when={graceShow()}>
        <div class='modal' onClick={() => setGraceShow(!graceShow())}>
            <GraceModal />
        </div> 
        </Show>
        {/* <button class='highlight center' onClick={() => createPrayer()} style={{ }}>
            <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>
                Create Prayer
            </div>
        </button> */}
    </div>;
};