import { Accessor, Setter, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { itemStyle } from '../utility/styling';
import { prayerEffectTick, prayerRemoveTick } from '../utility/combat';
import StatusEffect from '../utility/prayer';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';

function createTick(time: Accessor<number>) {
    const [timer, setTimer] = createSignal<number>(0);
    let interval: any | undefined = undefined;

    const tick = () => {
        const newTime = time() - 1;
        console.log(`%c Timer ticking... ${newTime}s left`, 'color: gold')
        setTimer(newTime);
    };

    onMount(() => {
        interval = setInterval(tick, 1000);
    });

    onCleanup(() => clearInterval(interval));

    return {timer};
};

export default function PrayerEffects({ combat, effect, enemy, game, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; game: Accessor<GameState>, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [endTime, setEndTime] = createSignal(effect.endTime);
    const [effectTimer, setEffectTimer] = createSignal(effect.endTime - effect.startTime);
    var timeout: any = undefined;
    // const { timer } = createTick(effectTimer);
    
    function tickEffect(timer: Accessor<number>) {
        if (game().pauseState) {
            clearInterval(timeout);
            return;
        };
        if (!combat().combatEngaged || timer() <= 0) {
            console.log(`%c Effect ${effect.prayer} has expired...`, 'color: red');
            prayerRemoveTick(combat(), effect);
            clearInterval(timeout);
            return;
        };

        console.log(`%c Effect ${effect.prayer} ticking... ${timer()}s left. End Time: ${effect.endtime} / Combat Time: ${combat().combatTimer}`, `color: gold`)
        
        if (canTick(effect, timer(), combat().combatTimer)) {
            console.log('%c ticking...', 'color: gold');
            prayerEffectTick({ combat: combat(), effect: effect, effectTimer: timer() });
        };
        
        if (effect.endTime - combat().combatTimer > timer()) {
            console.log(`%c Effect Refreshing from ${timer()}s remaining to ${effect.endTime - combat().combatTimer}s end time...`, 'color: green');
            // setEndTime(effect.endTime);
            setEffectTimer(effect.endTime - combat().combatTimer);
        } else {
            console.log(`%c Effect ${effect.prayer} expiring in ${effect.endTime - combat().combatTimer}s...`, 'color: red');
            setEffectTimer(time => time - 1);
        }
    };

    // function tickEffect(): void {
    //     if (game().pauseState || effectTimer() <= 0 || !combat().combatEngaged) {
    //         clearInterval(timeout);
    //         prayerRemoveTick(combat(), effect);
    //         return;
    //     };
    
    //     const newEndTime = effect.endTime - combat().combatTimer;
    //     if (newEndTime > 0) {
    //         // setEndTime(newEndTime);
    //         setEffectTimer(time => time - 1);
    //     };
    
    //     console.log(`%c Effect ${effect.prayer} ticking... ${effectTimer()}s left. End Time: ${newEndTime} / Combat Time: ${combat().combatTimer}`, `color: gold`);
    //     console.log('%c ticking...', 'color: gold');
        
    //     if (canTick(effect, effectTimer(), combat().combatTimer)) prayerEffectTick({ combat: combat(), effect: effect, effectTimer: effectTimer() });
    // };

    createEffect(() => {
        timeout = setInterval(() => tickEffect(effectTimer), 1000);

        return () => clearInterval(timeout);
    });


    // const tick = createMemo(() => {
    //     console.log(`%c Effect ${effect.prayer} expiring in ${effect.endTime - combat().combatTimer}s...`, 'color: red');
    //     tickEffect();
    // })
    

    // createMemo(() => {
    //     console.log(`%c Effect ${effect.prayer} expiring in ${effect.endTime - combat().combatTimer}s...`, 'color: red');
    //     timeout = setInterval(tickEffect, 1000);
    //     onCleanup(() => clearInterval(timeout));
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