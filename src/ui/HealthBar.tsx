import { createSignal, createEffect } from 'solid-js';

interface Props {
    totalPlayerHealth: number;
    newPlayerHealth: number;
};

export default function HealthBar({ totalPlayerHealth, newPlayerHealth }: Props) {
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(0);

    createEffect(() => {
        const healthPercentage = Math.round((newPlayerHealth/totalPlayerHealth) * 100);
        console.log(healthPercentage, 'Health Percentage');
        setPlayerHealthPercentage(healthPercentage);
    });

    return ( 
        <div class='healthbar center'>
            <p class='playerPortrait center' style={{ color: 'purple', 'font-family': 'Cinzel Regular' }}>{`${Math.round(newPlayerHealth)} / ${totalPlayerHealth} [${playerHealthPercentage()}%]`}</p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${playerHealthPercentage()}%`, 'background-color': 'gold' }}></div>
        </div>
    );
};