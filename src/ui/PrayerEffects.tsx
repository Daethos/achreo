import { Accessor, Show, createEffect, createSignal } from 'solid-js'
import { itemStyle } from '../utility/styling';
import { prayerEffectTick, prayerRemoveTick } from '../utility/combat';
import { useResizeListener } from '../utility/dimensions';
import StatusEffect from '../utility/prayer';
import { Combat } from '../stores/combat';

const specials = ['Avarice', 'Dispel', 'Denial', 'Silence']; // Slow, Fear, Confuse, Charm
const specialDescription = {
    'Avarice': 'Increases the amount of experience and gold gained.',
    'Dispel': 'Removes the last prayer affecting the enemy.',
    'Denial': 'Prevents the enemy from killing you.',
    'Silence': 'Prevents the enemy from praying.'
};

function PrayerModal({ prayer, show, setShow }: { prayer: StatusEffect, show: boolean, setShow: (e: boolean) => void }) {
    const dimensions = useResizeListener();
    return (
        <div class='modal' onClick={() => setShow(!show)}>
            <button class='border center' onClick={() => setShow(!show)} style={{ 
                'max-height': dimensions().ORIENTATION === 'landscape' ? '85%' : '50%', 
                'max-width': dimensions().ORIENTATION === 'landscape' ? '35%' : '70%' 
            }}>
                <div class='creature-heading' style={{ height: '100%' }}>
                    <h1>
                        {prayer.name.charAt(0).toUpperCase() + prayer.name.slice(1)}
                    </h1>
                    <h2>
                        {prayer.description}
                    </h2>
                    <div class='gold'>
                            Duration: {prayer.duration}
                            Start: {prayer?.startTime}s | End: {prayer?.endTime}s
                        <div>
                        <br />
                        </div>
                        {prayer?.refreshes ? `Active Refreshes: ${prayer?.activeRefreshes}` : `Active Stacks: ${prayer?.activeStacks}`}
                        <div>
                        <br />
                        </div>
                        {specials.includes(prayer.prayer) && ( <>
                            {specialDescription[prayer.prayer as keyof typeof specialDescription]}
                        </> )}
                        {prayer?.effect?.physicalDamage && 
                            <div>
                            Physical Damage: {prayer?.effect?.physicalDamage}<br /> 
                            </div>
                        }
                        {prayer?.effect?.magicalDamage ? 
                            <div>
                            Magical Damage: {prayer?.effect?.magicalDamage}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.physicalPenetration ? 
                            <div>
                            Physical Penetration: {prayer?.effect?.physicalPenetration}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.magicalPenetration ? 
                            <div>
                            Magical Penetration: {prayer?.effect?.magicalPenetration}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.criticalChance ? 
                            <div>
                            Critical Chance: {prayer?.effect?.criticalChance}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.criticalDamage ? 
                            <div>
                            Critical Damage: {prayer?.effect?.criticalDamage}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.physicalPosture ? 
                            <div>
                            Physical Posture: {prayer?.effect.physicalPosture}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.magicalPosture ? 
                            <div>
                            Magical Posture: {prayer?.effect.magicalPosture}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.physicalDefenseModifier ? 
                            <div>
                            Physical Defense Modifier: {prayer?.effect?.physicalDefenseModifier}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.magicalDefenseModifier ? 
                            <div>
                            Magical Defense Modifier: {prayer?.effect?.magicalDefenseModifier}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.roll ? 
                            <div>
                            Roll Chance: {prayer?.effect?.roll}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.dodge ? 
                            <div>
                            Dodge Chance: {prayer?.effect?.dodge}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.healing ? 
                            <div>
                            Healing: {Math.round(prayer?.effect?.healing)}<br /> 
                            </div>
                        : undefined}
                        {prayer?.effect?.damage ? 
                            <div>
                            Damage: {Math.round(prayer?.effect?.damage)}<br /> 
                            </div>
                        : undefined}
                    </div>
                </div>
            </button>
        </div>
    );
};

export default function PrayerEffects({ combat, effect, enemy, pauseState }: { combat: Accessor<Combat>; effect: StatusEffect; enemy: boolean; pauseState: boolean }) {
    const [show, setShow] = createSignal(false);
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

    return (
        <div class={enemy ? 'enemyStatusEffects' : 'playerStatusEffects'}>
        <button style={itemStyle(combat()?.weapons?.[0]?.rarity as string)} onClick={() => setShow(!show)}>
            <img src={effect?.imgUrl} />
            <div class='center gold' style={{ 'font-size': '0.75em' }}>
                {effectTimer()}s
            </div>
        </button>
        <Show when={show}><PrayerModal prayer={effect} show={show()} setShow={setShow} /></Show>
        </div>
    );
};