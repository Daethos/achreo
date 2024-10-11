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
    const [alert, setAlert] = createSignal<{ header: string; body: string } | undefined>(undefined);
    const [toastShow, setToastShow] = createSignal<boolean>(false);
    const [experience, setExperience] = createSignal<number>(ascean()?.experience as number); // ascean().experience as number
    const [clicked, setClicked] = createSignal<any>({
        showPlayer: false,
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
        });
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
        EventBus.on('set-show-player', () => {
            showPlayer();
        });
    });
    onCleanup(() => {
        EventBus.off('update-small-hud');
        EventBus.off('add-combat-logs');
        EventBus.off('set-show-player');    
    });

    const showPlayer = () => {
        EventBus.emit('show-player');
        EventBus.emit('action-button-sound');
        const setShow = !clicked().showPlayer;
        
        if (!combat().combatEngaged) EventBus.emit('show-castbar', setShow);
        setClicked({ ...clicked(), showPlayer: setShow });
    };


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
            <LootDropUI ascean={ascean} game={game} settings={settings} />
        </Show>
       <Show when={game().showCombat}>
            <CombatText combat={combat} combatHistory={combatHistory} />
        </Show>
        <Show when={game().showDialog}>
            <Dialog ascean={ascean} asceanState={asceanState} combat={combat} game={game} />
        </Show>
    </>;
};