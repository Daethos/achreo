import { createSignal, createEffect, Accessor } from 'solid-js';
import Ascean from '../models/ascean';
const DISPLAYS = {
    FULL: {KEY:'FULL', NEXT:'NUMBER'},
    NUMBER: {KEY:'NUMBER', NEXT:'BARE'},
    BARE: {KEY:'BARE', NEXT:'PERCENT'},
    PERCENT: {KEY:'PERCENT', NEXT:'NONE'},
    NONE: {KEY:'NONE', NEXT:'FULL'},
};
interface Props {ascean: Accessor<Ascean>;};
export default function ExperienceBar({ ascean }: Props) {
    const [experiencePercentage, setExperiencePercentage] = createSignal(0);
    const [experience, setExperience] = createSignal(0);
    const [display, setDisplay] = createSignal<any>('FULL');
    const [experienceDisplay, setExperienceDisplay] = createSignal<any>('');
    createEffect(() => {
        let newPercentage = Math.round((ascean().experience/(ascean().level * 1000) * 100));
        setExperiencePercentage(newPercentage);
        setExperience(ascean().experience);
        if (display() === 'FULL') {
            setExperienceDisplay(`${Math.round(experience())} / ${ascean().level * 1000} [${experiencePercentage()}%]`);
        } else if (display() === 'NONE') {
            setExperienceDisplay(`          `);
        } else if (display() === 'NUMBER') {
            setExperienceDisplay(`${Math.round(experience())} / ${ascean().level * 1000}`);
        } else if (display() === 'BARE') {
            setExperienceDisplay(`${Math.round(experience())}`);
        } else if (display() === 'PERCENT') {
            setExperienceDisplay(`${experiencePercentage()}%`);
        };
    });
    const changeDisplay = () => {
        const nextView = DISPLAYS[display() as keyof typeof DISPLAYS].NEXT;
        console.log(nextView, 'Next View')
        setDisplay(nextView)
    };
    return <div class='healthbar' onClick={changeDisplay} style={{ height: '6.25%' }}>
        <p class='playerPortrait center' style={{ color: '#ffd700' }}>{experienceDisplay()}</p>
        <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${experiencePercentage()}%`, 'background': 'linear-gradient(purple, #080080)' }}></div>
    </div>;
};