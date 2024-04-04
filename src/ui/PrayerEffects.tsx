import { Accessor, Setter, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { itemStyle } from '../utility/styling';
import { prayerEffectTick, prayerRemoveTick } from '../utility/combat';
import StatusEffect from '../utility/prayer';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';

export default function PrayerEffects({ combat, effect, enemy, game, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; game: Accessor<GameState>, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [endTime, setEndTime] = createSignal(effect.endTime);
    const [effectTimer, setEffectTimer] = createSignal(effect.endTime - effect.startTime);
    var timeout: any = undefined;

    // const useStatusEffect = (prayer: StatusEffect, prayerTimer: Accessor<number>, endTime: Accessor<number>, pause: boolean, combatTimer: number, combatEngaged: boolean) => {
    function tickEffect() {
        if (game().pauseState) return;
        if (!combat().combatEngaged) prayerRemoveTick(combat(), effect);
        console.log(`%c Effect ${effect.prayer} ticking... ${effectTimer()}s left. End Time: ${endTime()} / Combat Time: ${combat().combatTimer}`, `color: gold`)

        if (canTick(effect, effectTimer(), combat().combatTimer)) {
            console.log('%c ticking...', 'color: gold');
            prayerEffectTick({ combat: combat(), effect: effect, effectTimer: effectTimer() });
        };
        if (endTime() < effect.endTime) {
            console.log(`%c Effect Refreshing from ${endTime()} to ${effect.endTime}s end time...`, 'color: green');
            setEndTime(effect.endTime);
            setEffectTimer(effect.endTime - combat().combatTimer);
        } else {
            setEffectTimer((time) => time - 1);
        };
        if (effectTimer() === 0) {
            console.log(`%c Effect ${effect.prayer} has expired...`, 'color: red');
            prayerRemoveTick(combat(), effect);
        };
    };

    createEffect(() => {
        const timeout = setTimeout(() => tickEffect(), 1000);
        return () => clearTimeout(timeout);
    });

        // createEffect(() => {
        //     console.log(`%c Effect ${effect.prayer} expiring in ${effect.endTime - combat().combatTimer}s...`, 'color: red');
        //     setEffectTimer(endTime() - combat().combatTimer);
        // });

    function canTick(prayer: StatusEffect, prayerTimer: number, combatTimer: number) {
        const canTick = prayerTimer % 3 === 0 && prayer.startTime !== combatTimer && (prayer.prayer === 'Heal' || prayer.prayer === 'Damage');
        console.log(`%c Can Tick? ${canTick}`, "color: '#fdf6d8");
        return canTick;    
    }; 

    function showEffect() {
        setEffect(effect);
        setShow(!show());
    };

    return (
        <div class={enemy ? 'enemyStatusEffects' : 'playerStatusEffects'}>
        <button style={itemStyle(combat()?.weapons?.[0]?.rarity as string)} onClick={() => showEffect()}>
            <img src={effect?.imgUrl} />
            <div class='center gold' style={{ 'font-size': '0.75em' }}>
                {effectTimer()}s
            </div>
        </button>
        </div>
    );
};