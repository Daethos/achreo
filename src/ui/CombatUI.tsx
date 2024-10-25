import { Accessor, Setter, createSignal } from 'solid-js'
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
import { createHealthDisplay } from '../utility/health';
import Settings from '../models/settings';
import { Store } from 'solid-js/store';
import { IRefPhaserGame } from '../game/PhaserGame';
// import { CombatAttributes } from '../utility/combat';
// import Equipment from '../models/equipment';
// import Ascean, { initAscean } from '../models/ascean';
interface Props {
    instance: Store<IRefPhaserGame>;
    state: Accessor<Combat>;
    game: Accessor<GameState>;
    settings: Accessor<Settings>;
    stamina: Accessor<number>;
    grace: Accessor<number>;
};
export default function CombatUI({ instance, state, game, settings, stamina, grace }: Props) {
    const [effect, setEffect] = createSignal<StatusEffect>();
    const [show, setShow] = createSignal(false);
    const [prayerShow, setPrayerShow] = createSignal(false);
    const [shieldShow, setShieldShow] = createSignal(false);
    const [staminaShow, setStaminaShow] = createSignal(false);
    const [graceShow, setGraceShow] = createSignal(false);
    const { healthDisplay, changeDisplay, healthPercentage } = createHealthDisplay(state, game, false);
    const disengage = () => EventBus.emit('disengage');
    const showPlayer = () => {
        // EventBus.emit('show-player');
        EventBus.emit('action-button-sound');
        EventBus.emit('update-small-hud');
        EventBus.emit('outside-press', 'info');
    };
    function caerenic(caerenic: boolean, stealth: boolean) {
        return {
            'background': caerenic && stealth ? `linear-gradient(${masteryColor(state()?.player?.mastery as string)}, #444)` : caerenic ? masteryColor(state()?.player?.mastery as string) : stealth ? 'linear-gradient(#000, #444)' : 'black',
            'border': border(borderColor(state()?.playerBlessing), 0.15),
            'mix-blend-mode': 'multiply',
            transition: 'background 0.5s ease-out',
        };
    };
    function stalwart(caerenic: boolean, stealth: boolean) {
        return {
            'background': caerenic && stealth ? `linear-gradient(${masteryColor(state()?.player?.mastery as string)}, #444)` : caerenic ? masteryColor(state()?.player?.mastery as string) : stealth ? 'linear-gradient(#000, #444)' : 'black',
            transition: 'background 0.5s ease-out',
        };
    };
    const size = (len: number) => {
        switch (true) {
            case len < 10: return '1.25em'; // 1.15em
            case len < 20: return '1.15em'; // 1em
            case len < 30: return '1em'; // 0.85em
            default:  return '0.85em'; // 0.6em
        };
    };
    const top = (len: number) => {
        switch (true) {
            case len < 10: return '1.5vh'; // -3%
            case len < 20: return '2vh'; // -2%
            case len < 30: return '2.5vh'; // -1%
            default: return '3vh';
        };
    };
    function leaveArena() {
        if (instance.scene) {
            console.log('Clearing the Arena');
            (instance.scene as any).clearArena();
        };
        // EventBus.emit('scene-switch', { current: 'Arena', next: 'Underground' });
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
    // }; // , 'text-shadow': `0.025em 0.025em 0.025em ${state().isStealth ? '#000' : '#800080'}`
    // top(state().player?.name.length as number)
    return <div class='playerCombatUi' style={{ position: 'fixed' }}> 
        <div class='playerHealthBar' style={{ position: 'absolute', 'z-index': 0, 'max-height': '24px', width: '20.75vw', left: '4%' }}>
            <div class='playerPortrait' style={{ 'font-size': '1.15em', 'font-weight': 'bold', color: state().isStealth ? '#fdf6d8' : '#000', 'margin-top': '-0.5%', 'z-index': 1, 'text-shadow': `0.025em 0.025em 0.025em ${state().isStealth ? '#000' : '#fdf6d8'}` }}>{healthDisplay()}</div>
            <div class='healthbarPosition' style={{ width: `100%`, 'background': 'linear-gradient(#aa0000, red)' }}></div>
            <div class='healthbarPosition' style={{ width: `${healthPercentage()}%`, 'background': state()?.isStealth ? 'linear-gradient(#000, #444)' : 'linear-gradient(gold, #fdf6d8)', transition: 'width 0.5s ease-out' }}></div>
        </div>
        <p class='playerName' style={{ position: 'absolute', 'left': '4.5vw', 'margin': '0 auto', top: top(state().player?.name.length as number), 'color': `${state().isStealth ? '#fdf6d8' : 'gold'}`, 'text-shadow': `0.1em 0.1em 0.1em ${state().isStealth ? '#444' : '#000'}`, 'z-index': 1, 'max-height': '40px', 'font-size': size(state().player?.name.length as number) }} onClick={() => showPlayer()}>{state()?.player?.name}</p>
        <img id='playerHealthbarBorder' src={'../assets/gui/player-healthbar.png'} alt="Health Bar" onClick={changeDisplay} style={{ 'max-height': '74px' }}/>
        <StaminaBubble stamina={stamina} show={staminaShow} setShow={setStaminaShow} settings={settings} />
        <GraceBubble grace={grace} show={graceShow} setShow={setGraceShow} settings={settings} />
        <div class='combatUiWeapon' onClick={() => setShow(show => !show)} style={caerenic(state().isCaerenic, state().isStealth) as any}>
            <img src={state()?.weapons?.[0]?.imgUrl} alt={state()?.weapons?.[0]?.name} />
        </div>
        <Show when={state().isStalwart}>
        <div class={`combatUiShield ${state().isStalwart ? 'super-in' : 'superfade-out'}`} onClick={() => setShieldShow(shieldShow => !shieldShow)} style={{ ...itemStyle(state()?.player?.shield?.rarity as string), ...stalwart(state().isCaerenic, state().isStealth), }}>
            <img src={state()?.player?.shield.imgUrl} alt={state()?.player?.shield.name} style={{transform: `[{ rotate: '-45deg' }, { scale: 0.875 }]` }} />
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
        <Show when={state().playerEffects.length > 0 && state().combatEngaged === true}>
        <div class='combatEffects' style={{ left: '-3vw', top: '15vh', 'height': '14vh', width: 'auto', transform: 'scale(0.75)' }}>
            <For each={state().playerEffects}>{(effect) => ( 
                <PrayerEffects combat={state} effect={effect} enemy={false} game={game} show={prayerShow} setShow={setPrayerShow} setEffect={setEffect as Setter<StatusEffect>} /> 
            )}</For>
        </div>
        </Show> 
        <Show when={state().isStealth && state().computer}> 
        <button class='disengage highlight combatUiAnimation' style={{ top: '12.5vh', left: '0vw' }} onClick={() => disengage()}>
            <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>Disengage</div>
        </button> 
        </Show>
         
        <Show when={instance.scene?.scene.key === 'Arena' && !state().combatEngaged}>
        <button class='disengage highlight combatUiAnimation' style={{ top: '13vh', left: '24vw' }} onClick={() => leaveArena()}>
            <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>Leave Arena</div>
        </button>
        </Show>

        <Show when={prayerShow()}>
            <PrayerModal prayer={effect as Accessor<StatusEffect>} show={prayerShow} setShow={setPrayerShow} />
        </Show>
        <Show when={staminaShow()}>
        <div class='modal' onClick={() => setStaminaShow(!staminaShow())}>
            <StaminaModal setShow={setStaminaShow} settings={settings} />
        </div> 
        </Show>
        <Show when={graceShow()}>
        <div class='modal' onClick={() => setGraceShow(!graceShow())}>
            <GraceModal setShow={setGraceShow} settings={settings} />
        </div> 
        </Show>
        {/* <button class='highlight center' onClick={() => createPrayer()} style={{ }}>
            <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>
                Create Prayer
            </div>
        </button> */}
    </div>;
};