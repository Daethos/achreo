import { EventBus } from '../game/EventBus';
import { Accessor, Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { GameState } from '../stores/game';
import { Combat } from '../stores/combat';
import ExperienceToast from './ExperienceToast';
import Ascean from '../models/ascean';
import CombatSettings from './CombatSettings';
import LootDropUI from './LootDropUI';
import CombatText from './CombatText';
import Dialog from './Dialog';
import { LevelSheet } from '../utility/ascean';
import Settings from '../models/settings';
import { text } from '../utility/text';
interface Props {
    ascean: Accessor<Ascean>;
    asceanState: Accessor<LevelSheet>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    settings: Accessor<Settings>; 
};
export default function SmallHud({ ascean, asceanState, combat, game, settings }: Props) { 
    const [show, setShow] = createSignal<boolean>(true);
    const [alert, setAlert] = createSignal<{ header: string; body: string } | undefined>(undefined);
    const [toastShow, setToastShow] = createSignal<boolean>(false);
    const [experience, setExperience] = createSignal<number>(ascean()?.experience as number); // ascean().experience as number
    const [clicked, setClicked] = createSignal<any>({
        open: false,
        closed: false,
        caerenic: false,
        combatSettings: false,
        showCombat: false,
        dialog: false,
        loot: false,
        pause: false,
        map: false,
        showPlayer: false,
        stalwart: false,
        stealth: false,
        phaser: false,
    });
    const [combatHistory, setCombatHistory] = createSignal<any>("");
    createMemo(() => {
        if (ascean()?.experience as number > experience()) {
            setToastShow(true);
            setAlert({
                header: 'Experience Gain',
                body: `You've Gained ${ascean().experience as number - experience()} Experience!`,
            });
        } else if (ascean()?.experience !== 0 && ascean()?.experience as number < experience()) {
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
                showCombat: game().showCombat,
                showPlayer: game().showPlayer,
                combatSettings: game().scrollEnabled,
                pause: game().pauseState,
            });
            if (game().smallHud === true && !clicked().phaser) { // && !clicked().phaser
                EventBus.emit('toggle-bar', false);
            };
        });
        EventBus.on('open', () => setClicked({ ...clicked(), phaser: true }));
        EventBus.on('closed', () => setClicked({ ...clicked(), phaser: false }));
        EventBus.on('add-combat-logs', (data: Combat) => {
            const newText = text(combatHistory(), data);
            setCombatHistory(newText);
            EventBus.emit('blend-combat', {
                playerStartDescription: '',
                computerStartDescription: '',
                playerSpecialDescription: '',
                computerSpecialDescription: '',
                playerActionDescription: '',
                computerActionDescription: '',
                playerInfluenceDescription: '',
                computerInfluenceDescription: '',
                playerInfluenceDescriptionTwo: '',
                computerInfluenceDescriptionTwo: '',
                playerDeathDescription: '',
                computerDeathDescription: '',   
            });
        });
    });
    onCleanup(() => {
        EventBus.off('combat-engaged');
        EventBus.off('update-small-hud');
        EventBus.off('open');
        EventBus.off('closed');    
        EventBus.off('add-combat-logs');
    });

    const combatSettings = () => {
        EventBus.emit('useScroll');
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), combatSettings: !clicked().combatSettings });
        EventBus.emit('toggle-bar', true);
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
        EventBus.emit('blend-game', { showLoot: !game().showLoot });
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), loot: !clicked().loot });
    };
    const map = () => {
        EventBus.emit('action-button-sound');
        EventBus.emit('minimap');
        setClicked({ ...clicked(), map: !clicked().map });
    };
    const pause = () => {
        if (game().showPlayer || game().scrollEnabled || game().showDialog || game().showCombat) return;
        EventBus.emit('update-pause', !game().pauseState);
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), pause: !clicked().pause });
        EventBus.emit('toggle-bar', true);
    };
    const showButtons = () => {
        setShow(!show());
        EventBus.emit('blend-game', { smallHud: false}); // !game().smallHud 
        EventBus.emit('action-button-sound');
    };
    const showCombat = () => {
        EventBus.emit('show-combat');
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), showCombat: !clicked().showCombat });
        EventBus.emit('toggle-bar', true);
    };
    const showPlayer = () => {
        EventBus.emit('show-player');
        EventBus.emit('action-button-sound');
        if (!clicked().showPlayer === false) {
            EventBus.emit('show-castbar', false);
        };
        setClicked({ ...clicked(), showPlayer: !clicked().showPlayer });
        EventBus.emit('toggle-bar', true);
    };

    const icon = (click: boolean, right: number) => {
        return {height: '7.5%',  width: '2em', right: `${right}%`, filter: click === true ? 'invert(100%)' : 'sepia(100%)', 'margin-left': '-25%', 'margin-top': '-1.25%' }; // , border: '1px solid #fdf6d8'
    };

    // const overview = (right: number) => {
    //     return {height: '7.5%', width: '3.75%', right: `${right}%`};
    // };

    return <>
        <Show when={toastShow()}>
            <div class='verticalBottom realize' style={{ width: '30%' }}>
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
            <CombatText combat={combat} combatHistory={combatHistory} />
        </Show>
        <Show when={game().showDialog}>
            <Dialog ascean={ascean} asceanState={asceanState} combat={combat} game={game} />
        </Show>   
        <Show when={show()} fallback={
                <img class='smallHudButtons' src={'../assets/images/closed.png'} style={icon(clicked().closed, settings()?.positions?.solidHud?.right + 0.5)} alt='!' onClick={showButtons} />
        }> 
            <Show when={game().smallHud}>
                <img class='smallHudButtons' src={'../assets/images/open.png'} style={icon(clicked().open, settings()?.positions?.solidHud?.right + 0.5)} alt='?' />
                <img class='smallHudButtons' src={'../assets/images/pause.png'} style={{...icon(clicked().pause, settings()?.positions?.solidHud?.right + 4.5) }} alt='Sh' onClick={pause} />
                <img class='smallHudButtons' src={'../assets/images/minimap.png'} style={icon(clicked().map, settings()?.positions?.solidHud?.right + 8.5)} alt='M' onClick={map} />
                <img class='smallHudButtons' style={icon(false, settings()?.positions?.solidHud?.right + 12.5)} src={'../assets/images/cursor-reset.png'} onClick={cursor} />

                <img class='smallHudButtons' src={'../assets/images/logs.png'} style={icon(clicked().showCombat, settings()?.positions?.solidHud?.right + 16.5)} alt='Sh' onClick={showCombat} />
                <img class='smallHudButtons' src={'../assets/images/settings.png'} style={icon(clicked().combatSettings, settings()?.positions?.solidHud?.right + 20.5)} alt='Sh' onClick={combatSettings} />
                <img class='smallHudButtons' src={'../assets/images/info.png'} style={icon(clicked().showPlayer, settings()?.positions?.solidHud?.right + 24.5)} alt='Sh' onClick={showPlayer} />
            </Show>
        </Show>
        <Show when={game().dialogTag}>
        {/* <button class='smallHudButtons flash' style={{ ...overview((game().smallHud !== true && !clicked().phaser) ? 4.5 + settings().positions.solidHud.right : 28.5 + settings().positions.solidHud.right ) }} onClick={dialog}>
        </button> */}
            <img class='smallHudButtons flash' src={'../assets/images/dialog.png'} onClick={dialog} style={icon(clicked().dialog, (game().smallHud !== true && !clicked().phaser) ? 4.5 + settings().positions.solidHud.right : 28.5 + settings().positions.solidHud.right)} alt='Sh' />
        </Show>
        <Show when={game().lootTag}>
        {/* <button class='smallHudButtons flash' style={{ ...overview((game().smallHud !== true && !clicked().phaser) ? 8.5 + settings().positions.solidHud.right : 32.5 + settings().positions.solidHud.right) }} // right: game().dialogTag ? '8%' : '4%', bottom: '4.75%' SECOND ROW
            onClick={loot}>
        </button> */}
            <img class='smallHudButtons flash' src={'../assets/images/loot.png'} onClick={loot} style={icon(clicked().loot, (game().smallHud !== true && !clicked().phaser) ? 8.5 + settings().positions.solidHud.right : 32.5 + settings().positions.solidHud.right)} alt='Sh' />
        </Show>
    </>;
};