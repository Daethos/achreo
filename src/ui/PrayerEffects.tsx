import { Accessor, Setter, createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { borderColor } from "../utility/styling";
import StatusEffect, { PRAYERS } from "../utility/prayer";
import { Combat } from "../stores/combat";
import { GameState } from "../stores/game";
import { EventBus } from "../game/EventBus"; 

export default function PrayerEffects({ combat, effect, enemy, game, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; game: Accessor<GameState>, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [effectTimer, setEffectTimer] = createSignal(effect.endTime - effect.startTime);
    const isExpired = createMemo(() => (
        !combat().combatEngaged ||
        (effect.enemyID === combat().enemyID && combat().newComputerHealth <= 0) ||
        (enemy && effect.enemyID !== combat().enemyID) ||
        (enemy && combat().playerWin) ||
        (enemy && combat().newComputerHealth <= 0)
    ));
    const shouldTick = createMemo(() => (
        effectTimer() % 3 === 0 &&
        combat().combatEngaged &&
        effect.startTime !== combat().combatTimer - 1 &&
        combat().newComputerHealth !== 0 &&
        (effect.prayer === PRAYERS.HEAL || effect.prayer === PRAYERS.DAMAGE)
    ));
    const tick = () => {
        setEffectTimer(prev => prev - 1);
        if (isExpired()) {
            EventBus.emit("initiate-combat", { data: effect, type: "Remove Tick" });
            return true;
        };
        if (game().pauseState) return false;
        if (shouldTick()) EventBus.emit("initiate-combat", { data: { effect, effectTimer: effectTimer() }, type: "Tick" });
        if (effectTimer() <= 0) {
            EventBus.emit("initiate-combat", { data: effect, type: "Remove Tick" });
            return true;
        };
        return false;
    };
    createEffect(() => {
        if (game().pauseState) return;
        const intervalId = setInterval(() => {
            if (tick()) clearInterval(intervalId);
        }, 1000);
        onCleanup(() => clearInterval(intervalId));
    });

    function showEffect(): void {
        setEffect(effect);
        setShow(!show());
    };
    return <div class={enemy === true ? "enemyStatusEffects" : "playerStatusEffects"} style={{ "margin-left": "0.5vw" }}>
        <button style={{ border: `0.15em solid ${borderColor(effect.prayer)}`, "background-color": "#000" }} onClick={() => showEffect()}>
            <img src={effect?.imgUrl} />
            <div class="center gold" style={{ "font-size": "0.75em" }}>
                {effectTimer()}s
            </div>
        </button>
    </div>;
};