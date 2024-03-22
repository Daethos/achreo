
import { EventBus } from '../game/EventBus';
import { Accessor, Show, createSignal } from 'solid-js';
import { useResizeListener } from '../utility/dimensions';
import { GameState } from '../stores/game';
import { Combat } from '../stores/combat';

interface Props {
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
};

export default function SmallHud({ combat, game }: Props) { 
    const [show, setShow] = createSignal(false);
    const dimensions = useResizeListener(); 

    const combatLogs = () => {
        EventBus.emit('show-combat-logs', !game().showCombat);
        EventBus.emit('action-button-sound');
    };
    const combatSettings = () => {
        EventBus.emit('useScroll', !game().scrollEnabled);
        EventBus.emit('action-button-sound');
    };
    const cursor = () => {
        EventBus.emit('action-button-sound');
        EventBus.emit('update-cursor');
    };
    
    const caerenic = () => EventBus.emit('update-caerenic');
    const stalwart = () => EventBus.emit('update-stalwart');
    const stealth = () => {
        if (combat().combatEngaged) return;
        EventBus.emit('update-stealth');
    };

    const pause = () => EventBus.emit('update-pause', !game().pauseState);
    const showButtons = () => setShow(!show());
    const showPlayer = () => EventBus.emit('show-player', !game().showPlayer);

    return (
        <>
        <Show when={show} fallback={
            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? { 
                height: '7.5%', width: '3.5%', right: '0.5%', bottom: '0.5%'
            } : { 
                height: '3.5%', width: '7.5%', right: '4%', bottom: '0.5%' }} 
            onClick={showButtons}>
                <p class='p-3' style={{ color: '#fdf6d8', 'font-weight': 700, 'text-align': 'center' }}>
                    ?    
                </p>
            </button>
        }> 
            <>
            <button class='smallHudButtons' style={ dimensions().ORIENTATION === 'landscape' ? 
                { height: '7.5%', width: '3.5%', right: '20.5%' } :
                { height: '3.5%', width: '7.5%', right: '44%' }} 
                onClick={caerenic}>
                    <p class='p-3' style={{ color: '#fdf6d8', 'font-weight': 700, 'text-align': 'center' }}>
                        Cae
                    </p>
            </button>
            
            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                { height: '7.5%', width: '3.5%', right: '16.5%' } : 
                { height: '3.5%', width: '7.5%', right: '36%' }} 
                onClick={stalwart}>
                    <p class='p-3' style={{ color: '#fdf6d8', 'font-weight': 700, 'text-align': 'center' }}>
                        Stw
                    </p>
            </button>

            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                { height: '7.5%', width: '3.5%', right: '12.5%' } : 
                { height: '3.5%', width: '7.5%', right: '28%' }} 
                onClick={stealth}>
                    <p class='p-3' style={{ color: '#fdf6d8', 'font-weight': 700, 'text-align': 'center' }}>
                        Sth
                    </p>
            </button>

            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ?
                { height: '7.5%', width: '3.5%', right: '8.5%' } : 
                { height: '3.5%', width: '7.5%', right: '20%' }} 
                onClick={cursor}>
                <img class='p-3' src={'../assets/images/cursor.png'} />
            </button>
            
            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ?
                { height: '7.5%', width: '3.5%', right: '4.5%' } :
                { height: '3.5%', width: '7.5%', right: '12%' }} 
                onClick={pause}>
                    <p class='p-3' style={{ color: '#fdf6d8', 'font-weight': 700, 'text-align': 'center' }}>
                        {game().pauseState ? "||" : ">"}
                    </p>
            </button>
            
            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                { height: '7.5%', width: '3.5%', right: '0.5%' } : 
                { height: '3.5%', width: '7.5%', right: '4%' }} 
                onClick={showButtons} >
                    <p class='p-3' style={{ color: '#fdf6d8', 'font-weight': 700, 'text-align': 'center' }}>
                        !
                    </p>
            </button>

            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.5%', right: '24.5%' } : // right: '0.5%', top: '82.5%' SECOND ROW
                    { height: '3.5%', width: '7.5%', right: '52%' }} // right: '4%', bottom: '4.75%' SECOND ROW
                    onClick={combatLogs}>
                <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-1%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                    <img class='p-3' src={'../assets/images/claymore.png'} />
                </div>
            </button>
            
            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.5%', right: '28.5%' } : // right: '4.5%', top: '82.5%' SECOND ROW
                    { height: '3.5%', width: '7.5%', right: '60%' }} // right: '12%', bottom: '4.75%' SECOND ROW
                    onClick={combatSettings}>
                <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': '-1%', 'margin-top': '-1.25%', 'text-align': 'center' }}>
                    <img class='p-3' src={'../assets/images/godHand.png'} />
                </div>
            </button>

            <button class='smallHudButtons' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: '7.5%', width: '3.5%', right: '32.5%' } : // right: '8.5%', top: '82.5%' SECOND ROW
                    { height: '3.5%', width: '7.5%', right: '68%' }} // right: '20%', bottom: '4.75%' SECOND ROW
                    onClick={showPlayer}>
                <div class='p-3' style={{ color: '#fdf6d8', 'margin-left': 0, 'margin-top': '-1.25%', 'text-align': 'center' }}>
                    <img class='p-3' src={`../assets/images/${combat()?.player?.origin}-${combat()?.player?.sex}.jpg`} />
                </div>
            </button> 
            </>
        </Show>
        </>
    );
};