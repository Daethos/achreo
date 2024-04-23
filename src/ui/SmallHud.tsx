
import { EventBus } from '../game/EventBus';
import { Accessor, Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { useResizeListener } from '../utility/dimensions';
import { GameState } from '../stores/game';
import { Combat } from '../stores/combat';
import ExperienceToast from './ExperienceToast';
import Ascean from '../models/ascean';
import CombatSettings from './CombatSettings';
import LootDropUI from './LootDropUI';
import CombatText from './CombatText';
import Dialog from './Dialog';
import { LevelSheet } from '../utility/ascean';


interface Props {
    ascean: Accessor<Ascean>;
    asceanState: Accessor<LevelSheet>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
};

export default function SmallHud({ ascean, asceanState, combat, game }: Props) { 
    const [show, setShow] = createSignal<boolean>(true);
    const [alert, setAlert] = createSignal<{ header: string; body: string } | undefined>(undefined);
    const [toastShow, setToastShow] = createSignal<boolean>(false);
    const [experience, setExperience] = createSignal<number>(ascean().experience as number); // ascean().experience as number
    const [clicked, setClicked] = createSignal<any>({
        open: false,
        closed: false,
        caerenic: false,
        combatSettings: false,
        dialog: false,
        loot: false,
        pause: false,
        map: false,
        showPlayer: false,
        stalwart: false,
        stealth: false,
    });
    const dimensions = useResizeListener(); 

    createMemo(() => {
        if (ascean().experience as number > experience()) {
            setToastShow(true);
            setAlert({
                header: 'Experience Gain',
                body: `You've Gained ${ascean().experience as number - experience()} Experience!`,
            });
        } else if (ascean().experience !== 0 && ascean().experience as number < experience()) {
            setAlert(undefined);    
            setToastShow(false);
        };     
        setExperience(ascean().experience as number);
    });


    onMount(() => {
        EventBus.on('combat-engaged', (e: boolean) => {
            if (e === false) return;
            setClicked({ ...clicked(), dialog: false, loot: false });
        });
        EventBus.on('update-small-hud', () => {
            setClicked({
                ...clicked(),
                caerenic: combat().isCaerenic,
                stalwart: combat().isStalwart,
                stealth: combat().isStealth,
                showPlayer: game().showPlayer,
                combatSettings: game().scrollEnabled,
                pause: game().pauseState,
            });
            if (game().smallHud === true) {
                EventBus.emit('toggle-bar', false);
            };
        });
    });

    onCleanup(() => {
        EventBus.off('combat-engaged');
        EventBus.off('update-small-hud');
    });

    const map = () => {
        EventBus.emit('action-button-sound');
        EventBus.emit('minimap');
        setClicked({ ...clicked(), map: !clicked().map });
    };
    const combatSettings = () => {
        EventBus.emit('useScroll');
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), combatSettings: !clicked().combatSettings });
        if (!clicked().combatSettings === true) {
            EventBus.emit('toggle-bar', true);
        };
    };
    const cursor = () => {
        EventBus.emit('action-button-sound');
        EventBus.emit('update-cursor');
    };
    const dialog = () => {
        EventBus.emit('show-dialogue');
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), dialog: !clicked().dialog });
    };
    const loot = () => {
        EventBus.emit('blend-game', { showLoot: !game().showLoot, smallHud:!game().showLoot });
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), loot: !clicked().loot });
    };
    const caerenic = () => {
        EventBus.emit('update-caerenic');
        setClicked({ ...clicked(), caerenic: !clicked().caerenic });
    };
    const stalwart = () => {
        EventBus.emit('update-stalwart');
        setClicked({ ...clicked(), stalwart: !clicked().stalwart });
    };
    const stealth = () => {
        if (combat().combatEngaged) return;
        EventBus.emit('update-stealth');
        setClicked({ ...clicked(), stealth: !clicked().stealth });
    };

    const pause = () => {
        if (game().showPlayer || game().scrollEnabled || game().showDialog) return;
        EventBus.emit('update-pause', !game().pauseState)
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), pause: !clicked().pause });
        if (!clicked().pause === true) {
            EventBus.emit('toggle-bar', true);
        };
    };
    const showButtons = () => {
        setShow(!show());
        EventBus.emit('blend-game', { smallHud: !game().smallHud });
        EventBus.emit('action-button-sound');
    };
    const showPlayer = () => {
        EventBus.emit('show-player');
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), showPlayer: !clicked().showPlayer });
        if (!clicked().showPlayer === true) {
            EventBus.emit('toggle-bar', true);
        };
    };

    const icon = (click: boolean) => {
        return {
            width: '2em',
            'filter': click === true ? 'invert(100%)' : 'sepia(100%)',
            border: '1px solid #fdf6d8',
        };
    };

    return (
        <>
        <Show when={toastShow()}>
            <div class='cornerBL realize' style={{ width: '30%' }}>
                <ExperienceToast show={toastShow} setShow={setToastShow} alert={alert} setAlert={setAlert} />
            </div>
        </Show>
        <Show when={game().scrollEnabled}>
            <CombatSettings combat={combat} game={game} />
        </Show>
        <Show when={game().lootDrops.length > 0 && game().showLoot}>
            <LootDropUI ascean={ascean} game={game} />
        </Show>
       <Show when={game().showCombat}>
            <CombatText combat={combat} />
        </Show>
        <Show when={game().showDialog}>
            <Dialog ascean={ascean} asceanState={asceanState} combat={combat} game={game} />
        </Show>   
        <Show when={show()} fallback={
            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { 
                height: '7.5%', width: '3.75%', right: '0.5%'
            } : { 
                height: '3.5%', width: '7.5%', right: '4%' }} 
            onClick={showButtons}>
                <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                    <img src={'../assets/images/closed.png'} style={icon(clicked().closed)} alt='!' />
                </div>
            </button>
        }> 
            <Show when={game().smallHud}>
                <button class='smallHudButtons' style={ dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '24.5%' } : { height: '3.5%', width: '7.5%', right: '44%' }} onClick={caerenic}>
                    <div class='p-3' style={{ color: clicked().caerenic === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center', height: 'auto', width: 'auto' }}>
                        <img src={'../assets/images/caerenic.png'} style={icon(clicked().caerenic)} alt='Ce' />
                    </div>
                </button>
                
                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.75%', right: '20.5%' } : 
                    { height: '3.5%', width: '7.5%', right: '36%' }} 
                    onClick={stalwart}>
                        <div class='p-3' style={{ color: clicked().stalwart === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                            <img src={'../assets/images/stalwart.png'} style={icon(clicked().stalwart)} alt='St' />
                        </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.75%', right: '16.5%' } : 
                    { height: '3.5%', width: '7.5%', right: '28%' }} 
                    onClick={stealth}>
                        <div class='p-3' style={{ color: clicked().stealth === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                            <img src={'../assets/images/stealth.png'} style={icon(clicked().stealth)} alt='Sh' />
                        </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ?
                    { height: '7.5%', width: '3.75%', right: '12.5%' } :// , border: '1.5px solid #fdf6d8' 
                    { height: '3.5%', width: '7.5%', right: '20%' }} // , border: '1.5px solid #fdf6d8'
                    onClick={cursor}>
                    <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img class='p-3' style={icon(false)} src={'../assets/images/cursor-reset.png'} />
                    </div>
                </button>
                
                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ?
                    { height: '7.5%', width: '3.75%', right: '8.5%' } :// , border: '1.5px solid #fdf6d8' 
                    { height: '3.5%', width: '7.5%', right: '20%' }} // , border: '1.5px solid #fdf6d8'
                    onClick={map}>
                    <div class='p-3' style={{ color: clicked().map === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/minimap.png'} style={icon(clicked().map)} alt='M' />
                    </div>
                </button>
                
                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ?
                    { height: '7.5%', width: '3.75%', right: '4.5%' } :
                    { height: '3.5%', width: '7.5%', right: '12%' }} 
                    onClick={pause}>
                        <div class='p-3' style={{ color: clicked().pause === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                            <img src={'../assets/images/pause.png'} style={icon(clicked().pause)} alt='Sh' />
                        </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.75%', right: '0.5%' } :// , border: '1.5px solid #fdf6d8' 
                    { height: '3.5%', width: '7.5%', right: '4%' }} // , border: '1.5px solid #fdf6d8'
                    onClick={showButtons}>
                        <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                            <img src={'../assets/images/open.png'} style={icon(clicked().open)} alt='?' />
                        </div>
                </button>

                
                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                        { height: '7.5%', width: '3.75%', right: '28.5%' } : // right: '4.5%', top: '82.5%' SECOND ROW
                        { height: '3.5%', width: '7.5%', right: '60%' }} // right: '12%', bottom: '4.75%' SECOND ROW
                        onClick={combatSettings}>
                    <div class='p-3' style={{ color: clicked().combatSettings === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/settings.png'} style={icon(clicked().combatSettings)} alt='Sh' />
                    </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                        { height: '7.5%', width: '3.75%', right: '32.5%' } : // right: '8.5%', top: '82.5%' SECOND ROW
                        { height: '3.5%', width: '7.5%', right: '68%' }} // right: '20%', bottom: '4.75%' SECOND ROW
                        onClick={showPlayer}>
                    <div class='p-3' style={{ color: clicked().showPlayer === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/info.png'} style={icon(clicked().showPlayer)} alt='Sh' />
                    </div>
                </button> 
                
                <Show when={game().dialogTag}>
                <button class='smallHudButtons flash' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.75%', right: '36.5%' } : // right: '0.5%', top: '82.5%' SECOND ROW
                    { height: '3.5%', width: '7.5%', right: '52%' }} // right: '4%', bottom: '4.75%' SECOND ROW
                    onClick={dialog}>
                <div class='p-3' style={{ color: clicked().dialog === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                    <img src={'../assets/images/dialog.png'} style={icon(clicked().dialog)} alt='Sh' />
                </div>
                </button>
                </Show>

                <Show when={game().lootTag}>
                <button class='smallHudButtons flash' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.75%', right: game().dialogTag ? '40.5%' : '32.5%' } : // right: game().dialogTag ? '4.5' : '0.5%', top: '82.5%' SECOND ROW
                    { height: '3.5%', width: '7.5%', right: game().dialogTag ? '56%' : '52%' }} // right: game().dialogTag ? '8%' : '4%', bottom: '4.75%' SECOND ROW
                    onClick={loot}>
                <div class='p-3' style={{ color: clicked().loot === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                    <img src={'../assets/images/loot.png'} style={icon(clicked().loot)} alt='Sh' />
                </div>
                </button>
                </Show>
            </Show>
        </Show>
        </>
    );
};