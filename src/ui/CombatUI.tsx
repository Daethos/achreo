import { Accessor, Setter, createEffect, createSignal } from 'solid-js'
import ItemModal from '../components/ItemModal';
import { border, borderColor, itemStyle, masteryColor } from '../utility/styling';
import PrayerEffects from './PrayerEffects';
import { EventBus } from '../game/EventBus';
import { For, Show } from 'solid-js';
import { Combat } from '../stores/combat';
import { populateEnemy, randomEnemy } from '../assets/db/db';
import { asceanCompiler } from '../utility/ascean';
import StatusEffect from '../utility/prayer';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import { CombatAttributes } from '../utility/combat';
import { PrayerModal } from '../utility/buttons';

interface Props {
    state: Accessor<Combat>;
    staminaPercentage: Accessor<number>;
    pauseState: boolean;
    stamina: Accessor<number>;
};

export default function CombatUI({ state, staminaPercentage, pauseState, stamina }: Props) {
    const [effect, setEffect] = createSignal<StatusEffect>();
    const [show, setShow] = createSignal(false);
    const [shieldShow, setShieldShow] = createSignal(false);
    const [prayerShow, setPrayerShow] = createSignal(false);
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(0); 

    createEffect(() => {
        const newHealthPercentage = Math.round((state().newPlayerHealth/state().playerHealth) * 100);
        setPlayerHealthPercentage(newHealthPercentage);
    }); 

    // createEffect(() => {
    //     let instantTimer;
    //     if (state().instantStatus) {
    //         instantTimer = setTimeout(() => dispatch(setInstantStatus(false)), 30000);
    //     } else if (!state().combatEngaged) {
    //         dispatch(setInstantStatus(false));
    //     };
    //     return () => clearTimeout(instantTimer);
    // });

    const disengage = () => EventBus.emit('disengage');
    const showPlayer = () => EventBus.emit('show-player');

    function caerenic(caerenic: boolean) {
        return {
            'background-color': caerenic ? masteryColor(state()?.player?.mastery as string) : 'black',
            'border': border(borderColor(state()?.playerBlessing), 0.15),
        };
    };

    function createPrayer() {
        console.log('Creating prayer...');
        let enemy = randomEnemy();
        enemy = populateEnemy(enemy);
        const res = asceanCompiler(enemy);
        const exists = new StatusEffect(state(), res?.ascean as Ascean, state().player as Ascean, state().weapons?.[0] as Equipment, res?.attributes as CombatAttributes, state().playerBlessing);
        console.log(exists, 'exists');
        EventBus.emit('create-prayer', exists);
    };
    // 5a0043
    return (
        <div class='playerCombatUi'> 
            {/* <CombatModals state={state} />  */}
            <p class='playerName' onClick={() => showPlayer()}>{state()?.player?.name}</p>
            <div class='center playerHealthBar'>
                <div class='playerPortrait' style={{ 'font-size': '1em', color: state().isStealth ? '#fdf6d8' : '#000' }}>{`${Math.round(state().newPlayerHealth)} / ${state().playerHealth} [${playerHealthPercentage()}%]`}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, 'z-index': -1, width: `${playerHealthPercentage()}%`, 'background-color': state()?.isStealth ? '#444' : '#FFC700' }}></div>
            </div>
            <img id='playerHealthbarBorder' src={'../assets/gui/player-healthbar.png'} alt="Health Bar"/>
            {/* <button class='highlight superCenter' onClick={() => createPrayer()} style={{ top: '92.5vh', left: '50vw' }}>
                <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>
                    Create Prayer
                </div>
            </button> */}
            <div class='staminaBubble'>
                {/* <img src={'../assets/gui/player-portrait.png'} alt="Player Portrait" id='staminaPortrait' /> */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'z-index': -1, 'background-color': '#008000', height: `${staminaPercentage()}%` }}></div>
                <p class='stamina' style={{ 'margin-top': '25%' }}>{Math.round((staminaPercentage() * stamina() / 100))}</p>
            </div>
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
                <div class='combatEffects' style={{ left: '-3.5vw', top: '15vh', 'height': '14vh', width: 'auto', transform: 'scale(0.75)' }}>
                    <For each={state().playerEffects}>{(effect) => ( 
                        <PrayerEffects combat={state} effect={effect} enemy={false} pauseState={pauseState} show={prayerShow} setShow={setPrayerShow} setEffect={setEffect as Setter<StatusEffect>} /> 
                    )}</For>
                </div>
            </Show> 
            <Show when={state().isStealth && state().computer}> 
                <button class='disengage highlight' style={{ top: '12.5vh', left: '0vw' }} onClick={() => disengage()}>
                    <div style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>
                        Disengage
                    </div>
                </button> 
            </Show>
            <Show when={prayerShow()}>
                <PrayerModal prayer={effect as Accessor<StatusEffect>} show={prayerShow} setShow={setPrayerShow} />
            </Show>
        </div> 
    );
};