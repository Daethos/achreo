
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

// Colors: Bone (#fdf6d8), Green, Gold, Purple, Teal, Red, Blue, Light Blue 
const MAX_ACTIONS = 30;
const DAMAGE = [
    'Blunt',
    'Pierce', 
    'Slash', 
    'Earth', 
    'Fire', 
    'Frost', 
    'Lightning',
    'Righteous',
    'Sorcery',
    'Spooky', 
    'Wild',
    'Wind', 
];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ATTACKS = ['Attack', 'Posture', 'Roll', 'Parry', 'attack', 'posture', 'roll', 'parry', 'attacks', 'rolls', 'postures', 'parries'];
const CAST = ['confuse', 'confusing', 'fear', 'fearing', 'polymorph', 'polymorphs', 'polymorphing', 'slow', 'slowing', 'snare', 'snaring'];
// const specials = ['Invocation', 'Tendrils', 'Hush', 'Tendril', 'hush', 'tshaer', 'sacrifice', 'suture'];
const HUSH = ['Invocation', 'Hush', 'hush', 'sacrifice', 'shimmer', 'shimmers'];
const TENDRIL = ['Tendril', 'tendril', 'tshaer', 'suture'];
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
    const [combatHistory, setCombatHistory] = createSignal<any>(undefined);
    const dimensions = useResizeListener(); 

    // function addCombatAction(actions: string[], newAction: string): string {
    //     let updatedActions = [...actions, newAction];
    //     while (updatedActions.length > MAX_ACTIONS) {
    //         updatedActions.shift();
    //     };
    //     const newActions = updatedActions.toString().split(',').join(' ');
    //     console.log(newActions, 'New Actions ???');
    //     return newActions;
    // };
    const text = (prev: string, data: Combat) => {
        let oldText: any = prev !== undefined ? prev  : "";
        // const byteSize = (str: string) => new Blob([str]).size;
        // const result = byteSize(oldText);
        // console.log(result, 'Resulting Current Byte Size');
        let newText: any = '';
        if (data.playerStartDescription !== '') newText += data.playerStartDescription + '\n';
        if (data.computerStartDescription !== '') newText += data.computerStartDescription + '\n';
        if (data.playerSpecialDescription !== '') newText += data.playerSpecialDescription + '\n';
        if (data.computerSpecialDescription !== '') newText += data.computerSpecialDescription + '\n';
        if (data.playerActionDescription !== '') newText += data.playerActionDescription + '\n';
        if (data.computerActionDescription !== '') newText += data.computerActionDescription + '\n';
        if (data.playerInfluenceDescription !== '') newText += data.playerInfluenceDescription + '\n';
        if (data.playerInfluenceDescriptionTwo !== '') newText += data.playerInfluenceDescriptionTwo + '\n';
        if (data.computerInfluenceDescription !== '') newText += data.computerInfluenceDescription + '\n';
        if (data.computerInfluenceDescriptionTwo !== '') newText += data.computerInfluenceDescriptionTwo + '\n';
        if (data.playerDeathDescription !== '') newText += data.playerDeathDescription + '\n';
        if (data.computerDeathDescription !== '') newText += data.computerDeathDescription + '\n';
        newText = styleText(newText);
        // return addCombatAction(oldText, newText);

        oldText += newText;
        return oldText;
    };
    function styleText(text: string) {
        const style = (t: string) => { 
            const numCheck = t.split('').find((c: string) => NUMBERS.includes(parseInt(c)));
            const isNumber = numCheck !== undefined;

            const isAttack = ATTACKS.includes(t);
            const isCast = CAST.includes(t);
            const isDamage = DAMAGE.includes(t);
            const isHeal = t.includes('heal');
            const isHush = HUSH.includes(t);
            const isTendril = TENDRIL.includes(t);
            // const isSpecial = specials.includes(t);
            const isCritical = t.includes('Critical');
            const isGlancing = t.includes('Glancing');
            const color = 
                isCast === true ? 'blue' :
                isDamage === true ? 'teal' :
                isNumber === true ? 'gold' : 
                isHeal === true ? '#0BDA51' :
                isGlancing ? 'lightblue' : 
                isTendril === true ? 'fuchsia' : 
                (isAttack === true || isCritical === true) ? 'red' : 
                isHush === true ? 'fuchsia' :
                '#fdf6d8';
                
            const lush = (isCast === true || isNumber === true || isHush === true || isTendril === true);
            const fontWeight = lush ? 550 : 'normal';
            const textShadow = lush ? `gold 0 0 0` : 'none';
            const fontSize = lush ? '0.75em' : '0.65em';
            const newLine = t === '\n' ? '<br>' : t;
            const style = (isGlancing || isCritical || lush) ? 'italic' : 'normal';

            return `<span style="color: ${color}; font-style: ${style}; font-weight: ${fontWeight}; text-shadow: ${textShadow}; font-size: ${fontSize}; margin: 0;">${newLine}</span>`;
        };
    
        return text.split(' ').map((t, _i) => style(t)).join(' ');
    };
    
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
        EventBus.on('open', () => {
            setClicked({ ...clicked(), phaser: true });
        });
        EventBus.on('closed', () => {
            setClicked({ ...clicked(), phaser: false });
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
    });

    onCleanup(() => {
        EventBus.off('combat-engaged');
        EventBus.off('update-small-hud');
        EventBus.off('open');
        EventBus.off('closed');    
        EventBus.off('add-combat-logs');
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
    // const caerenic = () => {
        // EventBus.emit('update-caerenic');
        // setClicked({ ...clicked(), caerenic: !clicked().caerenic });
    // };
    // const stalwart = () => {
        // EventBus.emit('update-stalwart');
        // setClicked({ ...clicked(), stalwart: !clicked().stalwart });
    // };
    // const stealth = () => {
        // if (combat().combatEngaged) return;
        // EventBus.emit('update-stealth');
        // setClicked({ ...clicked(), stealth: !clicked().stealth });
    // };

    const pause = () => {
        if (game().showPlayer || game().scrollEnabled || game().showDialog) return;
        EventBus.emit('update-pause', !game().pauseState)
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
        EventBus.emit('blend-game', { showCombat: !game().showCombat });
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), showCombat: !clicked().showCombat });
        EventBus.emit('toggle-bar', true);
    };
    const showPlayer = () => {
        EventBus.emit('show-player');
        EventBus.emit('action-button-sound');
        setClicked({ ...clicked(), showPlayer: !clicked().showPlayer });
        EventBus.emit('toggle-bar', true);
    };

    const icon = (click: boolean) => {
        return {
            width: '1.75rem', // 2em
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
            <CombatText combat={combat} combatHistory={combatHistory} />
        </Show>
        <Show when={game().showDialog}>
            <Dialog ascean={ascean} asceanState={asceanState} combat={combat} game={game} />
        </Show>   
        <Show when={show()} fallback={
            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '0.5%' } : { height: '3.5%', width: '7.5%', right: '4%' }} onClick={showButtons}>
                <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                    <img src={'../assets/images/closed.png'} style={icon(clicked().closed)} alt='!' />
                </div>
            </button>
        }> 
            <Show when={game().smallHud}>
                {/* <button class='smallHudButtons' style={ dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '24.5%' } : { height: '3.5%', width: '7.5%', right: '44%' }}>
                    <div class='p-3' style={{ color: clicked().caerenic === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center', height: 'auto', width: 'auto' }}>
                        <img src={'../assets/images/caerenic.png'} style={icon(clicked().caerenic)} alt='Ce' />
                    </div>
                </button>
                
                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '20.5%' } : { height: '3.5%', width: '7.5%', right: '36%' }}>
                    <div class='p-3' style={{ color: clicked().stalwart === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/stalwart.png'} style={icon(clicked().stalwart)} alt='St' />
                    </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '16.5%' } : { height: '3.5%', width: '7.5%', right: '28%' }}>
                    <div class='p-3' style={{ color: clicked().stealth === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/stealth.png'} style={icon(clicked().stealth)} alt='Sh' />
                    </div>
                </button> */}

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '12.5%' } : { height: '3.5%', width: '7.5%', right: '20%' }} onClick={cursor}>
                    <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img class='p-3' style={icon(false)} src={'../assets/images/cursor-reset.png'} />
                    </div>
                </button>
                
                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '8.5%' } : { height: '3.5%', width: '7.5%', right: '20%' }} onClick={map}>
                    <div class='p-3' style={{ color: clicked().map === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/minimap.png'} style={icon(clicked().map)} alt='M' />
                    </div>
                </button>
                
                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '4.5%' } : { height: '3.5%', width: '7.5%', right: '12%' }} onClick={pause}>
                    <div class='p-3' style={{ color: clicked().pause === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/pause.png'} style={icon(clicked().pause)} alt='Sh' />
                    </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '0.5%' } : { height: '3.5%', width: '7.5%', right: '4%' }}>
                    <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/open.png'} style={icon(clicked().open)} alt='?' />
                    </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '16.5%' } : { height: '3.5%', width: '7.5%', right: '60%' }} onClick={showCombat}>
                    <div class='p-3' style={{ color: clicked().showCombat === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/logs.png'} style={icon(clicked().showCombat)} alt='Sh' />
                    </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '20.5%' } : { height: '3.5%', width: '7.5%', right: '60%' }} onClick={combatSettings}>
                    <div class='p-3' style={{ color: clicked().combatSettings === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/settings.png'} style={icon(clicked().combatSettings)} alt='Sh' />
                    </div>
                </button>

                <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { height: '7.5%', width: '3.75%', right: '24.5%' } : { height: '3.5%', width: '7.5%', right: '68%' }} onClick={showPlayer}>
                    <div class='p-3' style={{ color: clicked().showPlayer === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                        <img src={'../assets/images/info.png'} style={icon(clicked().showPlayer)} alt='Sh' />
                    </div>
                </button> 
                
            </Show>
        </Show>
        <Show when={game().dialogTag}>
        <button class='smallHudButtons flash' style={dimensions().ORIENTATION === 'landscape' ? 
            { height: '7.5%', width: '3.75%', right: (game().smallHud !== true && !clicked().phaser) ? '4.5%' : '28.5%' } : // if game().smallHud === true ? right: '4.5%'
            { height: '3.5%', width: '7.5%', right: '52%' }} 
            onClick={dialog}>
        <div class='p-3' style={{ color: clicked().dialog === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
            <img src={'../assets/images/dialog.png'} style={icon(clicked().dialog)} alt='Sh' />
        </div>
        </button>
        </Show>
        <Show when={game().lootTag}>
        <button class='smallHudButtons flash' style={dimensions().ORIENTATION === 'landscape' ? 
            { height: '7.5%', width: '3.75%', right: (game().smallHud !== true && !clicked().phaser) ? '8.5%' : '32.5%' } : // right: game().smallHud === true ? '4.5' : '0.5%', top: '82.5%' SECOND ROW
            { height: '3.5%', width: '7.5%', right: game().dialogTag ? '56%' : '52%' }} // right: game().dialogTag ? '8%' : '4%', bottom: '4.75%' SECOND ROW
            onClick={loot}>
        <div class='p-3' style={{ color: clicked().loot === true ? 'gold' : '#fdf6d8', 'margin-left': '-37.5%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
            <img src={'../assets/images/loot.png'} style={icon(clicked().loot)} alt='Sh' />
        </div>
        </button>
        </Show>
        </>
    );
};