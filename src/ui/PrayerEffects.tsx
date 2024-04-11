import { Accessor, Setter, createEffect, createSignal } from 'solid-js'
import { itemStyle } from '../utility/styling';
import { prayerEffectTick, prayerRemoveTick } from '../utility/combat';
import StatusEffect from '../utility/prayer';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';


export default function PrayerEffects({ combat, effect, enemy, game, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; game: Accessor<GameState>, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [effectTimer, setEffectTimer] = createSignal(effect.endTime - effect.startTime);
    var timeout: any = undefined;
    
    function tickEffect(timer: Accessor<number>) {
        if (!combat().combatEngaged || timer() <= 0) {
            console.log(`%c Effect ${effect.prayer} has expired...`, 'color: red');
            prayerRemoveTick(combat(), effect);
            clearInterval(timeout);
            return;
        };
        if (game().pauseState) {
            clearInterval(timeout);
            return;
        };
        
        if (canTick(effect, timer(), combat().combatTimer)) {
            console.log('%c Prayer Tick Effect... !', 'color: gold');
            prayerEffectTick({ combat: combat(), effect: effect, effectTimer: timer() });
        };
        if (effect.endTime - combat().combatTimer > timer()) {
            console.log(`%c Effect Refreshing from ${timer()}s remaining to ${effect.endTime - combat().combatTimer}s end time...`, 'color: green');
            setEffectTimer(effect.endTime - combat().combatTimer);
        } else {
            // console.log(`%c Effect ${effect.prayer} ticking... ${timer()}s left. End Time: ${effect.endTime} / Combat Time: ${combat().combatTimer}`, `color: gold`)
            setEffectTimer((prev) => prev - 1);
        };
    };

    createEffect(() => {
        timeout = setInterval(() => tickEffect(effectTimer), 1000);
        return () => clearInterval(timeout);
    });

    function canTick(prayer: StatusEffect, prayerTimer: number, combatTimer: number) {
        const canTick = prayerTimer % 3 === 0 && prayer.startTime !== combatTimer && (prayer.prayer === 'Heal' || prayer.prayer === 'Damage');
        // console.log(`%c Can Tick? ${canTick}`, "color: '#fdf6d8");
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