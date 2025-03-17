import { createSignal, createEffect, Accessor } from 'solid-js';
import Ascean from '../models/ascean';
import { GameState } from '../stores/game';
import { EventBus } from '../game/EventBus';
const DISPLAYS = {
    FULL: {KEY:'FULL', NEXT:'NUMBER'},
    NUMBER: {KEY:'NUMBER', NEXT:'BARE'},
    BARE: {KEY:'BARE', NEXT:'PERCENT'},
    PERCENT: {KEY:'PERCENT', NEXT:'NONE'},
    NONE: {KEY:'NONE', NEXT:'FULL'},
};
export default function ExperienceBar({ ascean, game }: {ascean: Accessor<Ascean>;game: Accessor<GameState>}) {
    const [experiencePercentage, setExperiencePercentage] = createSignal(0);
    const [experience, setExperience] = createSignal(0);
    const [display, setDisplay] = createSignal<any>(game().experienceDisplay);
    const [experienceDisplay, setExperienceDisplay] = createSignal<any>('');
    createEffect(() => setDisplay(game().healthDisplay));
    createEffect(() => {
        let newPercentage = Math.round((ascean().experience/(ascean().level * 1000) * 100));
        setExperiencePercentage(newPercentage);
        setExperience(ascean().experience);
        if (display() === 'FULL') {
            setExperienceDisplay(`${Math.round(experience())} / ${ascean().level * 1000} (${experiencePercentage()}%)`);
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
        setDisplay(nextView);
        EventBus.emit('blend-game', { healthDisplay: nextView });
        EventBus.emit('insert-settings', { healthViews: nextView });
    };
    return <div class='healthbar' onClick={changeDisplay} style={{ height: '7.5%' }}>
        <p class='playerPortrait center' style={{ color: '#ffd700' }}>{experienceDisplay()}</p>
        <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: `${experiencePercentage()}%`, 'background': 'linear-gradient(purple, #080080)' }}></div>
    </div>;
};