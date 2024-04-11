import { createSignal, createEffect, Accessor } from 'solid-js';
import Ascean from '../models/ascean';

interface Props {
    ascean: Accessor<Ascean>;
};

export default function ExperienceBar({ ascean }: Props) {
    const [experiencePercentage, setExperiencePercentage] = createSignal(0);
    const [experience, setExperience] = createSignal(0);

    createEffect(() => {
        let newPercentage = Math.round((ascean().experience/(ascean().level * 1000) * 100));
        setExperiencePercentage(newPercentage);
        setExperience(ascean().experience);
    });

    return ( 
        <div class='healthbar'>
            <p class='playerPortrait center' style={{ color: 'purple' }}>{`${Math.round(experience())} / ${ascean().level * 1000} [${experiencePercentage()}%]`}</p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${experiencePercentage()}%`, 'background-color': 'gold' }}></div>
        </div>
    );
};