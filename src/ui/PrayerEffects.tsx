import { Accessor, Setter, createEffect, createSignal } from 'solid-js'
import { itemStyle } from '../utility/styling';
import { prayerEffectTick, prayerRemoveTick } from '../utility/combat';
import StatusEffect from '../utility/prayer';
import { Combat } from '../stores/combat';

export default function PrayerEffects({ combat, effect, enemy, pauseState, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; pauseState: boolean, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [endTime, setEndTime] = createSignal(effect.endTime);
    const [effectTimer, setEffectTimer] = createSignal(effect.endTime - effect.startTime);


    const useStatusEffect = (prayer: StatusEffect, prayerTimer: number, endTime: number, pause: boolean, combatTimer: number, combatEngaged: boolean) => {
        function tickEffect() {
            if (pause) return;
            if (!combatEngaged) prayerRemoveTick(combat(), prayer);
            console.log(`%c Effect ${prayer.prayer} ticking... ${prayerTimer}s left. End Time: ${endTime} / Combat Time: ${combatTimer}`, `color: gold`)

            if (canTick(prayer, prayerTimer, combatTimer)) {
                console.log('%c ticking...', 'color: gold');
                // getEffectTickFetch({ effect: prayer, prayerTimer: prayerTimer });
                prayerEffectTick({ combat: combat(), effect: prayer, effectTimer: prayerTimer });
            };
            if (endTime < prayer.endTime) {
                console.log(`%c Effect Refreshing from ${endTime} to ${prayer.endTime}s end time...`, 'color: green');
                setEndTime(prayer.endTime);
                setEffectTimer(prayer.endTime - combatTimer);
            };

            // const expired = prayerTimer <= 0 || !combatEngaged || endTime <= combatTimer;
            // const expired = effectExpired(combatTimer, prayerTimer, endTime, combatEngaged);
            // if (!expired) {
            //     console.log(`%c Effect ${prayer.prayer} expiring in ${endTime - combatTimer}s...`, 'color: red');
            //     setEffectTimer(endTime - combatTimer);
            // } else {
            //     // getRemoveEffectFetch(prayer);
            //     console.log(`%c Effect ${prayer.prayer} has expired...`, 'color: red');
            //     prayerRemoveTick(combat, prayer);
            // };
        };

        createEffect(() => {
            // tickEffect();
            console.log(`%c Effect ${prayer.prayer} is ticking at ${prayerTimer}, ending at ${endTime}. Current Time: ${combatTimer}...`, 'color: gold');
            const timeout = setTimeout(() => tickEffect(), 1000);
            return () => clearTimeout(timeout);
        });

        createEffect(() => {
            console.log(`%c Effect ${prayer.prayer} expiring in ${prayer.endTime - combatTimer}s...`, 'color: red');
            setEffectTimer(endTime - combatTimer);
        });

        createEffect(() => {
            if (prayerTimer === 0) {
                console.log(`%c Effect ${prayer.prayer} has expired...`, 'color: red');
                prayerRemoveTick(combat(), prayer);
            };
        });

        // createEffect(() => {
        //     setEndTime(prayer.endTime);
        // });
    };

    useStatusEffect(effect, effectTimer(), endTime(), pauseState, combat().combatTimer, combat().combatEngaged);

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