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

    // onMount(() => {
    //     timeout = setInterval(() => {
    //         if (game().pauseState) return;
    //         if (!combat().combatEngaged) prayerRemoveTick(combat(), effect);
    //         console.log(`%c Using Effect ${effect.prayer} with current time left ${effectTimer()} from current time ${combat().combatTimer} and end time ${endTime()}...`, 'color: gold')
    //         console.log(`%c Effect ${effect.prayer} ticking... ${effectTimer()}s left. End Time: ${endTime()} / Combat Time: ${combat().combatTimer}`, `color: gold`)

    //         if (canTick(effect, effectTimer(), combat().combatTimer)) {
    //             console.log('%c ticking...', 'color: gold');
    //             // getEffectTickFetch({ effect: effect, effectTimer(): effectTimer() });
    //             prayerEffectTick({ combat: combat(), effect: effect, effectTimer: effectTimer() });
    //         };

            
    //         console.log(endTime() < effect.endTime, 'Refresh?')
    //         if (endTime() < effect.endTime) {
    //             console.log(`%c Effect Refreshing from ${endTime()} to ${effect.endTime}s end time...`, 'color: green');
    //             setEndTime(effect.endTime);
    //             setEffectTimer(effect.endTime - combat().combatTimer);
    //         } else {
    //             setEffectTimer((time) => time - 1);
    //         };

    //         if (effectTimer() === 0) {
    //             console.log(`%c Effect ${effect.prayer} has expired...`, 'color: red');
    //             prayerRemoveTick(combat(), effect);
    //         };
    //     }, 1000);
    //     return () => clearInterval(timeout);
    // });

    // onCleanup(() => clearInterval(timeout));


    // const useStatusEffect = (prayer: StatusEffect, prayerTimer: Accessor<number>, endTime: Accessor<number>, pause: boolean, combatTimer: number, combatEngaged: boolean) => {
        function tickEffect() {
            if (game().pauseState) return;
            if (!combat().combatEngaged) prayerRemoveTick(combat(), effect);
            console.log(`%c Using Effect ${effect.effect} with current time left ${effectTimer()} from current time ${combat().combatTimer} and end time ${endTime()}...`, 'color: gold')
            console.log(`%c Effect ${effect.prayer} ticking... ${effectTimer()}s left. End Time: ${endTime()} / Combat Time: ${combat().combatTimer}`, `color: gold`)

            if (canTick(effect, effectTimer(), combat().combatTimer)) {
                console.log('%c ticking...', 'color: gold');
                // getEffectTickFetch({ effect: effect, effectTimer(): effectTimer() });
                prayerEffectTick({ combat: combat(), effect: effect, effectTimer: effectTimer() });
            };
            if (endTime() < effect.endTime) {
                console.log(`%c Effect Refreshing from ${endTime()} to ${effect.endTime}s end time...`, 'color: green');
                setEndTime(effect.endTime);
                setEffectTimer(effect.endTime - combat().combatTimer);
            };

            // const expired = prayerTimer <= 0 || !combatEngaged || endTime <= combat().combatTimer;
            // const expired = effectExpired(combat().combatTimer, prayerTimer, endTime, combatEngaged);
            // if (!expired) {
            //     console.log(`%c Effect ${effect.effect} expiring in ${endTime - combat().combatTimer}s...`, 'color: red');
            //     setEffectTimer(endTime - combat().combatTimer);
            // } else {
            //     // getRemoveEffectFetch(effect);
            //     console.log(`%c Effect ${effect.effect} has expired...`, 'color: red');
            //     prayerRemoveTick(combat, effect);
            // };
        };

        createEffect(() => {
            // tickEffect();
            console.log(`%c Effect ${effect.prayer} is ticking at ${effectTimer()}, ending at ${endTime()}. Current Time: ${combat().combatTimer}...`, 'color: gold');
            const timeout = setTimeout(() => tickEffect(), 1000);
            return () => clearTimeout(timeout);
        });

        createEffect(() => {
            console.log(`%c Effect ${effect.prayer} expiring in ${effect.endTime - combat().combatTimer}s...`, 'color: red');
            setEffectTimer(endTime() - combat().combatTimer);
        });

        createEffect(() => {
            if (effectTimer() === 0) {
                console.log(`%c Effect ${effect.prayer} has expired...`, 'color: red');
                prayerRemoveTick(combat(), effect);
            };
        });

        // createEffect(() => {
        //     setEndTime(prayer.endTime);
        // });
    // };

    // useStatusEffect(effect, effectTimer, endTime, game, combat().combatTimer, combat().combatEngaged);

    // function effectExpired(combatTimer: number, prayerTimer: number, endTime: number, combatEngaged: boolean) {
    //     console.log(`%c Effect: CombatTimer:${combatTimer} PrayerTimer: ${prayerTimer} EndTime: ${endTime} CombatEngaged: ${combatEngaged}`, 'color: red');
    //     const expired = prayerTimer <= 0 || !combatEngaged || endTime <= combatTimer;
    //     console.log(`%c Expired? ${expired}`, "color: red");
    //     return expired;
    //     // return prayerTimer <= 0 || !combatEngaged || endTime <= combatTimer;    
    // };

    function canTick(prayer: StatusEffect, prayerTimer: number, combatTimer: number) {
        const canTick = prayerTimer % 3 === 0 && prayer.startTime !== combatTimer && (prayer.prayer === 'Heal' || prayer.prayer === 'Damage');
        console.log(`%c Can Tick? ${canTick}`, "color: '#fdf6d8");
        // return effectT % 3 === 0 && prayer.startTime !== combatTimer && (prayer.prayer === 'Heal' || prayer.prayer === 'Damage');
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