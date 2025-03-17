import { Accessor } from 'solid-js';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';
import { createHealthDisplay } from '../utility/health';
export default function HealthBar({ combat, enemy, game }: {combat: Accessor<Combat>;enemy: boolean;game: Accessor<GameState>;}) {
    const { healthDisplay, changeDisplay, healthPercentage } = createHealthDisplay(combat, game, enemy);
    return <div class='healthbar' style={{ height: '7.5%' }} onClick={changeDisplay}>
        <p class='playerPortrait center' style={{ color: 'purple', 'font-family': 'Cinzel Regular', 'text-shadow': '0 0 0 #000' }}>{healthDisplay()}</p>
        <div class='' style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${healthPercentage()}%`, 
            'background': 'linear-gradient(gold, #fdf6d8)', 
            transition: 'width 1s ease-out, background 1s ease-out' }}></div>
    </div>;
};