import { Accessor, Setter, createEffect, createSignal, onCleanup } from 'solid-js'
import { borderColor } from '../utility/styling';
// import { prayerEffectTick, prayerRemoveTick } from '../utility/combat';
import StatusEffect from '../utility/prayer';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';
import { EventBus } from '../game/EventBus';

export default function PrayerEffects({ combat, effect, enemy, game, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; game: Accessor<GameState>, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [effectTimer, setEffectTimer] = createSignal(effect.endTime - effect.startTime);
    const [effectEndTime, setEffectEndTime] = createSignal(effect.endTime);
    var timeout: any = undefined;
    function tick(): void {
        if (expiring()) { 
            // console.log('%c Prayer Effect Expired', 'color: red');
            EventBus.emit('initiate-combat', { data: effect, type: 'Remove Tick' });
            clearInterval(timeout);
            return;
        };
        if (game().pauseState === true) {
            clearInterval(timeout);
            return;
        };
        if (canTick(effect, effectTimer, combat().combatTimer)) { 
            // console.log('%c Prayer Effect Ticking...', 'color: gold');
            EventBus.emit('initiate-combat', { data: { effect, effectTimer: effectTimer() }, type: 'Tick' });
        };
        if (effectTimer() <= 0) {
            // console.log('%c Prayer Effect Removed Naturally', 'color: red');
            EventBus.emit('initiate-combat', { data: effect, type: 'Remove Tick' });
            clearInterval(timeout);
            return;
        };
        if (effectEndTime() !== effect.endTime) {
            const difference = effect.endTime - effectTimer();
            setEffectEndTime(effect.endTime);
            setEffectTimer(effectTimer() + difference);
        };
        setEffectTimer((prev) => prev - 1);
    };

    createEffect(() => {
        if (game().pauseState === true) return;
        timeout = setInterval(tick, 1000);
        onCleanup(() => clearInterval(timeout));
    });

    function canTick(prayer: StatusEffect, prayerTimer: Accessor<number>, combatTimer: number): boolean {
        return prayerTimer() % 3 === 0 
            && combat().combatEngaged === true 
            && prayer.startTime !== combatTimer 
            && combat().newComputerHealth !== 0
            && (prayer.prayer === 'Heal' || prayer.prayer === 'Damage');
    }; 

    function expiring() {
        return combat().combatEngaged === false
            || (effect.enemyID === combat().enemyID && combat().newComputerHealth <= 0)
            || (enemy === true && effect.enemyID !== combat().enemyID)
            || (enemy === true && combat().playerWin === true) 
            || (enemy === true && combat().newComputerHealth <= 0);
    };

    function showEffect(): void {
        setEffect(effect);
        setShow(!show());
    };
    return <div class={enemy === true ? 'enemyStatusEffects' : 'playerStatusEffects'} style={{ 'margin-left': '0.5vw' }}>
        <button style={{ border: `0.15em solid ${borderColor(effect.prayer)}`, 'background-color': '#000' }} onClick={() => showEffect()}>
            <img src={effect?.imgUrl} />
            <div class='center gold' style={{ 'font-size': '0.75em' }}>
                {effectTimer()}s
            </div>
        </button>
    </div>;
};