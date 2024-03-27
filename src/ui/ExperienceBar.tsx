import { createSignal, createEffect } from 'solid-js';

interface Props {
    totalExperience: number;
    currentExperience: number;
};

export default function ExperienceBar({ totalExperience, currentExperience }: Props) {
    const [experiencePercentage, setExperiencePercentage] = createSignal(0);

    createEffect(() => {
        const newPercentage = Math.round((currentExperience/totalExperience) * 100);
        setExperiencePercentage(newPercentage);
    }, [currentExperience, totalExperience]);

    return ( 
        <div class='healthbar'>
            <p class='playerPortrait center' style={{ color: 'purple' }}>{`${Math.round(currentExperience)} / ${totalExperience} [${experiencePercentage()}%]`}</p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${experiencePercentage()}%`, 'background-color': 'gold' }}></div>
        </div>
    );
};