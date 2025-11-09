import { Accessor, Setter, createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { borderColor } from "../utility/styling";
import StatusEffect, { PRAYERS } from "../utility/prayer";
import { Combat } from "../stores/combat";
import { GameState } from "../stores/game";
import { EventBus } from "../game/EventBus";

const TICK = "Tick";
const REMOVE_TICK = "Remove Tick";

export default function PrayerEffects({ combat, effect, enemy, game, setEffect, show, setShow }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; game: Accessor<GameState>, setEffect: Setter<StatusEffect>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [currentTime, setCurrentTime] = createSignal(combat().combatTimer);
    const effectTimer = createMemo(() => effect.endTime - currentTime());

    const isExpired = createMemo(() => ( // !combat().combatEngaged ||
        (effect.enemyID === combat().enemyID && combat().newComputerHealth <= 0) ||
        (enemy && effect.enemyID !== combat().enemyID) ||
        (enemy && combat().playerWin) ||
        (enemy && combat().newComputerHealth <= 0)
    ));

    const shouldTick = createMemo(() => (
        effectTimer() % 3 === 0 && // combat().combatEngaged &&
        effect.startTime !== combat().combatTimer - 1 &&
        (effect.prayer === PRAYERS.HEAL || damageTick())
    ));

    const tick = () => {
        setCurrentTime(currentTime() + 1);
        if (isExpired()) {
            EventBus.emit("initiate-combat", { data: effect, type: REMOVE_TICK });
            return true;
        };
        if (game().pauseState) return false;
        if (shouldTick()) {
            // console.log("TICK");
            EventBus.emit("initiate-combat", { data: { effect, effectTimer: effectTimer() }, type: TICK });
        };
        if (effectTimer() <= 0) {
            EventBus.emit("initiate-combat", { data: effect, type: REMOVE_TICK });
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

    function damageTick(): boolean {
        if (effect.enemyName === combat().player.name) {
            return effect.prayer === PRAYERS.DAMAGE;
        } else {
            return effect.prayer === PRAYERS.DAMAGE && combat().newComputerHealth !== 0;
        };
    };

    function showEffect(): void {
        setEffect(effect);
        setShow(!show());
    };

    return <div class={enemy === true ? "enemyStatusEffects" : "playerStatusEffects"} style={{ "margin-left": "0.5vw" }}>
        <button style={{ border: `thick ridge ${borderColor(effect.prayer)}`, "background-color": "#000" }} onClick={() => showEffect()}>
            <img src={effect?.imgUrl} />
            <div class="center gold" style={{ "font-size": "0.95rem" }}>
                {effectTimer()}s
            </div>
        </button>
    </div>;
};