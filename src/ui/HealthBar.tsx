import { createSignal, Accessor, createMemo } from 'solid-js';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';
import { EventBus } from '../game/EventBus';
const DISPLAYS = {
    FULL: {KEY:'FULL', NEXT:'NUMBER'},
    NUMBER: {KEY:'NUMBER', NEXT:'BARE'},
    BARE: {KEY:'BARE', NEXT:'PERCENT'},
    PERCENT: {KEY:'PERCENT', NEXT:'NONE'},
    NONE: {KEY:'NONE', NEXT:'FULL'},
};
interface Props {combat: Accessor<Combat>;enemy?: boolean;game: Accessor<GameState>};
export default function HealthBar({ combat, enemy, game }: Props) {
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(0);
    const [computerHealthPercentage, setComputerHealthPercentage] = createSignal(0);
    const [display, setDisplay] = createSignal<any>(game().healthDisplay);
    const [healthDisplay, setHealthDisplay] = createSignal<any>('');
    createMemo(() => {
        if (enemy) {
            setComputerHealthPercentage(Math.round((combat().newComputerHealth/combat().computerHealth) * 100));
        } else {
            setPlayerHealthPercentage(Math.round((combat().newPlayerHealth/combat().playerHealth) * 100));
        };
        if (display() === 'FULL') {
            setHealthDisplay(`${Math.round(enemy ? combat().newComputerHealth : combat().newPlayerHealth)} / ${enemy ? combat().computerHealth : combat().playerHealth} [${enemy ? computerHealthPercentage() : playerHealthPercentage()}%]`);
        } else if (display() === 'NONE') {
            setHealthDisplay(`          `);
        } else if (display() === 'NUMBER') {
            setHealthDisplay(`${Math.round(enemy ? combat().newComputerHealth : combat().newPlayerHealth)} / ${enemy ? combat().computerHealth : combat().playerHealth}`);
        } else if (display() === 'BARE') {
            setHealthDisplay(`${Math.round(enemy ? combat().newComputerHealth : combat().newPlayerHealth)}`);
        } else if (display() === 'PERCENT') {
            setHealthDisplay(`${enemy ? computerHealthPercentage() : playerHealthPercentage()}%`);
        };
    });
    const changeDisplay = () => {
        const nextView = DISPLAYS[display() as keyof typeof DISPLAYS].NEXT;
        setDisplay(nextView);
        EventBus.emit('blend-game', { healthDisplay: nextView });
    };
    return <div class='healthbar' style={{ 'align-self': 'center', height: '6.5%' }} onClick={changeDisplay}>
        <p class='playerPortrait center' style={{ color: 'purple', 'font-family': 'Cinzel Regular', 'text-shadow': '0 0 0 #000' }}>
            {healthDisplay()}
        </p>
        <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${enemy ? computerHealthPercentage() : playerHealthPercentage()}%`, 'background': 'linear-gradient(gold, #fdf6d8)' }}></div>
    </div>;
};