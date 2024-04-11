import { createSignal, createEffect, Accessor } from 'solid-js';
import { Combat } from '../stores/combat';

interface Props {
    combat: Accessor<Combat>;
    enemy?: boolean;
};

export default function HealthBar({ combat, enemy }: Props) {
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(0);
    const [computerHealthPercentage, setComputerHealthPercentage] = createSignal(0);

    createEffect(() => {
        if (enemy) {
            const healthPercentage = Math.round((combat().newComputerHealth/combat().computerHealth) * 100);
            setComputerHealthPercentage(healthPercentage);
            return;
        };
        const healthPercentage = Math.round((combat().newPlayerHealth/combat().playerHealth) * 100);
        setPlayerHealthPercentage(healthPercentage);
    });

    return ( 
        <div class='healthbar' style={{ 'align-self': 'center' }}>
            <p class='playerPortrait center' style={{ color: 'purple', 'font-family': 'Cinzel Regular' }}>
                {`${Math.round(enemy ? combat().newComputerHealth : combat().newPlayerHealth)} / ${enemy ? combat().computerHealth : combat().playerHealth} [${enemy ? computerHealthPercentage() : playerHealthPercentage()}%]`}
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${enemy ? computerHealthPercentage() : playerHealthPercentage()}%`, 'background-color': 'gold' }}></div>
        </div>
    );
};