import { Accessor, createEffect, createSignal } from 'solid-js'
import ItemModal from '../components/ItemModal';
import { border, borderColor, itemStyle, masteryColor } from '../utility/styling';
import PrayerEffects from './PrayerEffects';
import { useResizeListener } from '../utility/dimensions';
import { EventBus } from '../game/EventBus';
import { For, Show } from 'solid-js';
import { Combat } from '../stores/combat';

interface Props {
    state: Accessor<Combat>;
    staminaPercentage: Accessor<number>;
    pauseState: boolean;
    stamina: Accessor<number>;
};

export default function CombatUI({ state, staminaPercentage, pauseState, stamina }: Props) {
    const [show, setShow] = createSignal(false);
    const [shieldShow, setShieldShow] = createSignal(false)
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(0); 
    const dimensions = useResizeListener();

    createEffect(() => {
        setPlayerHealthPercentage(Math.round((state().newPlayerHealth/state().playerHealth) * 100));
    }); 

    // createEffect(() => {
    //     let instantTimer;
    //     if (state().instantStatus) {
    //         instantTimer = setTimeout(() => dispatch(setInstantStatus(false)), 30000);
    //     } else if (!state().combatEngaged) {
    //         dispatch(setInstantStatus(false));
    //     };
    //     return () => clearTimeout(instantTimer);
    // }, [state().instantStatus, dispatch, state().combatEngaged]);

    const disengage = () => EventBus.emit('disengage');
    const showPlayer = () => EventBus.emit('show-player');

    function caerenic(caerenic: boolean) {
            console.log('caerenic');
            return {
                'background-color': caerenic ? masteryColor(state()?.player?.mastery as string) : 'black',
                'border': border(borderColor(state()?.playerBlessing), 0.15),
            };
    };
 
    // id={state().playerDamaged ? 'flicker' : ''} id={state().isCaerenic ? 'phaser-caerenic' : ''}
 
    return (
        <div class='playerCombatUi'> 
            {/* <CombatModals state={state} />  */}
            <p class='playerName' onClick={() => showPlayer()}>{state()?.player?.name}</p>
            <div class='center playerHealthBar'>
                <p class='playerPortrait' style={{ 'font-size': '1em', color: state().isStealth ? '#fdf6d8' : '#5a0043' }}>{`${Math.round(state().newPlayerHealth)} / ${state().playerHealth} [${playerHealthPercentage}%]`}</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${playerHealthPercentage}%`, 'background-color': state().isStealth ? '#444' : '#FFC700' }}></div>
            </div>
            <img id='playerHealthbarBorder' src={'../assets/gui/player-healthbar.png'} alt="Health Bar"/>
                
            <div class='staminaBubble'>
                <img src={'../assets/gui/player-portrait.png'} alt="Player Portrait" id='staminaPortrait' />
                <p class='stamina'>{Math.round((staminaPercentage() * stamina() / 100))}</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, 'background-color': '#008000', height: `${staminaPercentage}%` }}></div>
            </div>
            <div class='combatUiWeapon' style={caerenic(state().isCaerenic) as any}>
            <button onClick={() => setShow(show => !show)} >
                <img src={state()?.weapons?.[0]?.imgUrl} alt={state()?.weapons?.[0]?.name} />
            </button>
            </div>
            <Show when={state().isStalwart}>
                <button class='combatUiShield' onClick={() => setShieldShow(shieldShow => !shieldShow)} style={itemStyle(state()?.player?.shield?.rarity as string)}>
                    <img src={state()?.player?.shield.imgUrl} alt={state()?.player?.shield.name} style={{ transform: `[{ rotate: '-45deg' }, { scale: 0.875 }]` }} />
                </button>
            </Show>
            <Show when={show()}>
                <div class='modal' onClick={() => setShow(!show())} style={dimensions().ORIENTATION === 'landscape' ? { 
                    height: `${dimensions().HEIGHT}px`, width: `${dimensions().WIDTH * 0.5}px`, left: `${dimensions().WIDTH * 0.28}px`, transform: '{scale: (0.8)}'
                    // ** FOR STORY ASCEAN LANDSCAPE ** top: -height / 5, width: width * 0.3, left: width * 0.0925,
                } : { 
                    height: `${dimensions().HEIGHT * 0.5}px`, width : `${dimensions().WIDTH * 0.8}px`, left: '20%', top: '25%', transform: '{scale: (0.8)}'
            }}>
                <ItemModal item={state().weapons[0]} stalwart={false} caerenic={state().isCaerenic} />
            </div>
            </Show>
            <Show when={shieldShow()}>
                <div class='modal' onClick={() => setShieldShow(!shieldShow())} style={dimensions().ORIENTATION === 'landscape' ? {
                    height: `${dimensions().HEIGHT * 0.85}px`, width: `${dimensions().WIDTH * 0.5}px`, left: `${dimensions().WIDTH * 0.28}px`, top: `${dimensions().HEIGHT * 0.05}px`, transform: '{scale: (0.8)}'
                        // ** FOR STORY ASCEAN LANDSCAPE ** top: -height / 5, width: width * 0.3, left: width * 0.0925,
                } : { 
                    height: `${dimensions().HEIGHT * 0.45}px`, width : `${dimensions().WIDTH * 0.8}px`, left: '10%', top: '25%', transform: '{scale: (0.8)}'
                }}>
                    <ItemModal item={state()?.player?.shield} stalwart={state().isStalwart} caerenic={false} />
                </div>
            </Show>  
            <Show when={state().playerEffects.length > 0}>
                <div class='combatEffects'>
                    <For each={state().playerEffects}>{(effect) => ( 
                        <PrayerEffects combat={state} effect={effect} enemy={false} pauseState={pauseState} /> 
                    )}</For>
                </div>
            </Show> 
            <Show when={state().isStealth && state().computer}> 
                <button class='disengage'onClick={() => disengage()}>
                    <p style={{ color: '#fdf6d8', 'font-size': '0.75em' }}>
                        Disengage
                    </p>
                </button> 
            </Show>
        </div> 
    );
};