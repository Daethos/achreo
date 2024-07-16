import { Accessor, Setter, createEffect, createSignal, onCleanup } from 'solid-js'
import { itemStyle } from '../utility/styling';
// import { prayerEffectTick, prayerRemoveTick } from '../utility/combat';
import StatusEffect from '../utility/prayer';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';
import { EventBus } from '../game/EventBus';


export default function PrayerEffects({ combat, effect, enemy, game, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; game: Accessor<GameState>, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [effectTimer, setEffectTimer] = createSignal(effect.endTime - effect.startTime);
    var timeout: any = undefined;
    
    function tick() {
        if (combat().combatEngaged === false) {
            EventBus.emit('initiate-combat', { data: effect, type: 'Remove Tick' });
            clearInterval(timeout);
            return;
        };
        if (game().pauseState === true) {
            clearInterval(timeout);
            return;
        };
        if (canTick(effect, effectTimer(), combat().combatTimer)) {
            console.log('%c Prayer Effect Ticking...', 'color: gold');
            EventBus.emit('initiate-combat', { data: { effect, effectTimer: effectTimer() }, type: 'Tick' });    
        };
        if (effectTimer() <= 0) {
            clearInterval(timeout);
            EventBus.emit('initiate-combat', { data: effect, type: 'Remove Tick' });
            return;
        };
        if (effect.endTime - combat().combatTimer > effectTimer()) {
            setEffectTimer(effect.endTime - combat().combatTimer);
        } else {
            setEffectTimer((prev) => prev - 1);
        };

    };

    createEffect(() => {
        if (game().pauseState === true) return;    
        timeout = setInterval(tick, 1000);
        onCleanup(() => clearInterval(timeout));
    });

    function canTick(prayer: StatusEffect, prayerTimer: number, combatTimer: number) {
        return prayerTimer % 3 === 0 && combat().combatEngaged === true &&prayer.startTime !== combatTimer && (prayer.prayer === 'Heal' || prayer.prayer === 'Damage');
    }; 

    function showEffect() {
        setEffect(effect);
        setShow(!show());
    };

    return <div class={enemy ? 'enemyStatusEffects' : 'playerStatusEffects'} style={{ 'margin-left': '0.5vw' }}>
        <button style={{...itemStyle(combat()?.weapons?.[0]?.rarity as string) }} onClick={() => showEffect()}>
            <img src={effect?.imgUrl} />
            <div class='center gold' style={{ 'font-size': '0.75em' }}>
                {effectTimer()}s
            </div>
        </button>
    </div>;
};