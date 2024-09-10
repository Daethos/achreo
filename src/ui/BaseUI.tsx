import { Accessor, Setter, Show, createEffect, createSignal, lazy, Suspense } from 'solid-js';
import Ascean from '../models/ascean';
import Settings from '../models/settings';
import { Combat } from "../stores/combat";
import { EnemySheet } from '../utility/enemy';
import { EventBus } from "../game/EventBus";
import { GameState } from '../stores/game';
import { LevelSheet } from '../utility/ascean';
import { usePhaserEvent } from '../utility/hooks';
import { consumePrayer, instantActionCompiler, prayerEffectTick, prayerRemoveTick, statusEffectCheck, weaponActionCompiler } from '../utility/combat';
import { screenShake } from '../phaser/ScreenShake';
import { Reputation } from '../utility/player';
import { Puff } from 'solid-spinner';
import Statistics from '../utility/statistics';
import { validateHealth, validateLevel, validateMastery } from '../utility/validators';
const Character = lazy(async () => await import('./Character'));
const CombatUI = lazy(async () => await import('./CombatUI'));
const Deity = lazy(async () => await import('./Deity'));
const EnemyPreview = lazy(async () => await import('./EnemyPreview'));
const EnemyUI = lazy(async () => await import('./EnemyUI'));
const SmallHud = lazy(async () => await import('./SmallHud'));
const TutorialOverlay = lazy(async () => await import('../utility/tutorial'));

interface Props {
    instance: any;
    ascean: Accessor<Ascean>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    reputation: Accessor<Reputation>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    statistics: Accessor<Statistics>;
    setStatistics: Setter<Statistics>;
    stamina: Accessor<number>;
    grace: Accessor<number>;
    tutorial: Accessor<string>;
    showTutorial: Accessor<boolean>;
    setShowTutorial: Setter<boolean>;
    showDeity: Accessor<boolean>;
};
var remaining: number = 0, timer: any = undefined;
export default function BaseUI({ instance, ascean, combat, game, reputation, settings, setSettings, statistics, setStatistics, stamina, grace, tutorial, showDeity, showTutorial, setShowTutorial }: Props) {
    const [enemies, setEnemies] = createSignal<EnemySheet[]>([]);
    const [asceanState, setAsceanState] = createSignal<LevelSheet>({
        ascean: ascean(),
        currency: ascean().currency,
        currentHealth: ascean().health.current,
        experience: ascean().experience,
        experienceNeeded: ascean().level * 1000,
        faith: ascean().faith,
        firewater: ascean().firewater,
        mastery: ascean().mastery,
        avarice: false,
        opponent: 0,
        opponentExp: 0,
        constitution: 0,
        strength: 0,
        agility: 0,
        achre: 0,
        caeren: 0,
        kyosir: 0,
    });
    createEffect(() => EventBus.emit('combat', combat()));  
    createEffect(() => EventBus.emit('reputation', reputation()));
    createEffect(() => EventBus.emit('settings', settings()));
    const sendEnemyData = () => EventBus.emit('get-enemy', combat().computer);
    const sendSettings = () => EventBus.emit('get-settings', settings);
    function initiateCombat(data: any, type: string) {
        try {    
            let res: Combat | undefined | any = undefined,
                playerWin: boolean = false,
                computerWin: boolean = false,
                playerActionDescription: string = '', 
                computerActionDescription: string = '',
                computerHealth: number = validateHealth(combat().computerHealth),
                newComputerHealth: number = validateHealth(combat().newComputerHealth),
                newPlayerHealth: number = validateHealth(combat().newPlayerHealth),
                computerLevel: number = validateLevel(combat().computer?.level as number),
                playerLevel: number = validateLevel(combat().player?.level as number),
                computerMastery: number = validateMastery(combat().computer?.[combat().computer?.mastery as string]),
                playerMastery: number = validateMastery(combat().player?.[combat().player?.mastery as string]),
                affectsHealth: boolean = true,
                caerenic: number = combat().isCaerenic ? 1.15 : 1,
                caerenicVulnerable: number = combat().isCaerenic ? 1.25 : 1,
                stalwart: number = combat().isStalwart ? 0.85 : 1;
            if (newComputerHealth === 0 && type !== 'Health') {
                console.log('Player is at 0 health, returning');
                return;
            };
            switch (type) {
                case 'Weapon': // Targeted Weapon Action by Enemy or Player
                    const weapon = { ...combat(), [data.key]: data.value };
                    res = weaponActionCompiler(weapon) as Combat;
                    EventBus.emit('blend-combat', res);
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    break;
                case 'Consume': // Consuming Prayer
                    let consume = { 
                        ...combat(), 
                        prayerSacrificeId: data.prayerSacrificeId, 
                    };
                    consume = consumePrayer(consume) as Combat;
                    res = { ...combat(), ...consume };
                    playerWin = res.playerWin;
                    EventBus.emit('blend-combat', { 
                        newComputerHealth: res.newComputerHealth,
                        newPlayerHealth: res.newPlayerHealth, 
                        playerEffects: res.playerEffects,
                        playerWin,
                    });
                    break;
                case 'Prayer': // Consuming Prayer
                    let prayer = { ...combat(), playerEffects: data };
                    prayer = consumePrayer(prayer) as Combat;
                    res = { ...combat(), ...prayer };
                    playerWin = res.playerWin;
                    EventBus.emit('blend-combat', { 
                        newComputerHealth: res.newComputerHealth, 
                        newPlayerHealth: res.newPlayerHealth, 
                        playerEffects: res.playerEffects,
                        playerWin,
                    });
                    break;
                case 'Instant': // Invoking Prayer
                    if (combat().computer === undefined) return;
                    let insta = { ...combat(), playerBlessing: data };
                    insta = instantActionCompiler(insta) as Combat;
                    playerWin = insta.playerWin;
                    res = { ...combat(), ...insta };
                    EventBus.emit('blend-combat', insta);
                    break;
                case 'Tick': // Prayer Tick
                    if (newComputerHealth === 0) break;
                    const { effect, effectTimer } = data;
                    const tick = prayerEffectTick({ combat: combat(), effect, effectTimer });
                    res = { ...combat(), ...tick };
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    EventBus.emit('blend-combat', tick);
                    break;
                case 'Remove Tick': // Removing Prayer
                    const remove = prayerRemoveTick(combat(), data);
                    res = { ...combat(), ...remove };
                    EventBus.emit('blend-combat', remove);                    
                    affectsHealth = false;
                    break;
                case 'Player': // Blind Player Attack i.e. hitting a non targeted enemy
                    if (combat().computer === undefined) return;
                    const { playerAction, enemyID, ascean, damageType, combatStats, weapons, health, actionData } = data;
                    let playerData = {
                        action: playerAction.action,
                        parryGuess: playerAction.parry,
                        computer: ascean,
                        computerAttributes: combatStats.attributes,
                        computerWeapons: weapons,
                        computerWeaponOne: combatStats.combatWeaponOne,
                        computerWeaponTwo: combatStats.combatWeaponTwo,
                        computerWeaponThree: combatStats.combatWeaponThree,
                        newComputerHealth: health,
                        computerHealth: combatStats.healthTotal,
                        computerDefense: combatStats.defense,
                        computerDefenseDefault: combatStats.defense,
                        computerAction: actionData.action,
                        computerParryGuess: actionData.parry,
                        computerDamageType: damageType,
                        computerEffects: [],
                        enemyID: enemyID, // Was ''
                    };
                    res = { ...combat(), ...playerData };
                    res = weaponActionCompiler(res) as Combat;
                    EventBus.emit('blend-combat', {
                        playerWin: res.playerWin,
                        computerWin: res.computerWin,
                        playerActionDescription: res.playerActionDescription,
                        computerActionDescription: res.computerActionDescription,
                        playerStartDescription: res.playerStartDescription,
                        computerStartDescription: res.computerStartDescription,
                        playerDeathDescription: res.playerDeathDescription,
                        computerDeathDescription: res.computerDeathDescription,
                        playerSpecialDescription: res.playerSpecialDescription,
                        computerSpecialDescription: res.computerSpecialDescription,
                        playerInfluenceDescription: res.playerInfluenceDescription,
                        computerInfluenceDescription: res.computerInfluenceDescription,
                        playerInfluenceDescriptionTwo: res.playerInfluenceDescriptionTwo,
                        computerInfluenceDescriptionTwo: res.computerInfluenceDescriptionTwo,
                        potentialPlayerDamage: res.potentialPlayerDamage,
                        realizedPlayerDamage: res.realizedPlayerDamage,
                        potentialComputerDamage: res.potentialComputerDamage,
                        realizedComputerDamage: res.realizedComputerDamage,
                        playerDamaged: res.playerDamaged,
                        newPlayerHealth: res.newPlayerHealth,
                        criticalSuccess: res.criticalSuccess,
                        religiousSuccess: res.religiousSuccess,
                        rollSuccess: res.rollSuccess,
                        parrySuccess: res.parrySuccess,
                        glancingBlow: res.glancingBlow,
                        dualWielding: res.dualWielding,
                        playerEffects: res.playerEffects,
                        // enemyID: res.enemyID,
                    });
                    EventBus.emit('update-enemy-health', { id: res.enemyID, health: res.newComputerHealth, glancing: res.glancingBlow, critical: res.criticalSuccess });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Chiomic': // Mindflay
                    if (combat().computer === undefined) return;
                    const chiomic = Math.round(playerMastery / 2 * (1 + data / 100) * caerenic * playerLevel);
                    newComputerHealth = newComputerHealth - chiomic < 0 ? 0 : newComputerHealth - chiomic;
                    playerWin = newComputerHealth === 0;
                    playerActionDescription = `Your hush flays ${chiomic} health from ${combat().computer?.name}.`;
                    res = { ...combat(), newComputerHealth, playerWin, playerActionDescription };
                    EventBus.emit('blend-combat', { newComputerHealth, playerWin });
                    affectsHealth = false;
                    break;
                case 'Enemy Chiomic': // Mindflay
                    if (combat().computer === undefined) return;
                    const enemyChiomic = Math.round(computerMastery / 2 * (1 + data / 100) * caerenicVulnerable * stalwart  * computerLevel);
                    newPlayerHealth = newPlayerHealth - enemyChiomic < 0 ? 0 : newPlayerHealth - enemyChiomic;
                    computerWin = newPlayerHealth === 0;
                    computerActionDescription = `${combat().computer?.name} flays ${enemyChiomic} health from you with their hush.`;
                    res = { ...combat(), newPlayerHealth, computerWin, computerActionDescription };
                    EventBus.emit('blend-combat', { newPlayerHealth, computerWin, damagedID: combat().enemyID });
                    break;
                case 'Tshaeral': // Lifedrain (Tick, 100%)
                    if (combat().computer === undefined) return;
                    const drained = Math.round(combat().playerHealth * (data / 100) * caerenic * playerLevel);
                    newPlayerHealth = newPlayerHealth + drained > combat().playerHealth ? combat().playerHealth : newPlayerHealth + drained;
                    newComputerHealth = newComputerHealth - drained < 0 ? 0 : newComputerHealth - drained;
                    playerWin = newComputerHealth === 0;
                    playerActionDescription = `You tshaer and devour ${drained} health from ${combat().computer?.name}.`;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, playerWin,playerActionDescription };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth, playerWin });
                    break;
                case 'Enemy Tshaeral': // Lifedrain (Tick, 100%)
                    if (combat().computer === undefined) return;
                    const enemyDrain = Math.round(computerHealth * (data / 100) * caerenicVulnerable * stalwart * computerLevel);
                    newPlayerHealth = newPlayerHealth - enemyDrain < 0 ? 0 : newPlayerHealth - enemyDrain;
                    newComputerHealth = newComputerHealth + enemyDrain > computerHealth ? computerHealth : newComputerHealth + enemyDrain;
                    computerWin = newPlayerHealth === 0;
                    computerActionDescription = `${combat().computer?.name} tshaers and devours ${enemyDrain} health from you.`;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, computerWin, computerActionDescription, damagedID: combat().enemyID };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth, computerWin });
                    break;
                case 'Health': // Either Enemy or Player Gaining / Losing Health
                    let { key, value, id } = data;
                    switch (key) {
                        case 'player':
                            const healed = Math.floor(combat().playerHealth * (value / 100));
                            newPlayerHealth = newPlayerHealth + healed > combat().playerHealth ? combat().playerHealth : newPlayerHealth + healed;
                            computerWin = newPlayerHealth <= 0;
                            playerActionDescription =  
                                healed > 0 ? `You heal for ${healed}, back to ${Math.round(newPlayerHealth)}.` 
                                : `You are damaged for ${Math.abs(healed)}, down to ${Math.round(newPlayerHealth)}`;
                            res = { ...combat(), newPlayerHealth, playerActionDescription, damagedID: id };
                            EventBus.emit('blend-combat', { newPlayerHealth, computerWin, damagedID: id });
                            break;
                        case 'enemy':
                            computerActionDescription = value > newComputerHealth ? 
                                `${combat().computer?.name} heals for ${Math.round(value - newComputerHealth)}, back up to ${Math.round(value)}` : 
                                `${combat().computer?.name} is damaged for ${Math.round(newComputerHealth - value)}, down to ${Math.round(value)}.`;
                            newComputerHealth = value > 0 ? value : 0;
                            playerWin = newComputerHealth === 0;
                            if (combat().enemyID === id) {
                                res = { ...combat(), newComputerHealth, playerWin, computerActionDescription };
                                EventBus.emit('blend-combat', { newComputerHealth, playerWin });
                            } else {
                                res = { ...combat(), playerWin };
                                EventBus.emit('update-enemy-health', { id, health: newComputerHealth, glancing: false, critical: false });
                            };
                            affectsHealth = false;
                            break;
                        default:
                            break;
                    };
                    break;
                case 'Set Health':
                    computerWin = data.value === 0;
                    res = { ...combat(), computerWin, newPlayerHealth: data.value, damagedID: data.id };
                    EventBus.emit('blend-combat', { computerWin, newPlayerHealth: data.value, damagedID: data.id });
                    break;
                case 'Enemy': // Blind Enemy Attack i.e. an enemy not targeted hitting the player
                    if (!data.ascean) return;
                    let enemyData = {
                        computer: data.ascean,
                        computerAttributes: data.combatStats.attributes,
                        computerWeaponOne: data.combatStats.combatWeaponOne,
                        computerWeaponTwo: data.combatStats.combatWeaponTwo,
                        computerWeaponThree: data.combatStats.combatWeaponThree,
                        newComputerHealth: data.health,
                        computerHealth: data.combatStats.attributes.healthTotal,
                        computerDefense: data.combatStats.defense,
                        computerWeapons: data.weapons,
                        computerAction: data.actionData.action,
                        computerParryGuess: data.actionData.parry,
                        computerDamageType: data.damageType,
                        computerEffects: [],
                        enemyID: data.enemyID,
                    };
                    res = { ...combat(), ...enemyData };
                    res = weaponActionCompiler(res) as Combat;
                    computerWin = res.computerWin;
                    playerWin = res.playerWin; 
                    EventBus.emit('blend-combat', res);
                    break;
                case 'Sacrifice': // Shadow Word: Death
                    if (combat().computer === undefined) return;
                    const sacrifice = Math.round(playerMastery * caerenic * playerLevel) * (1 + data / 50);
                    newPlayerHealth = newPlayerHealth - (sacrifice / 2 * stalwart) < 0 ? 0 : newPlayerHealth - (sacrifice / 2 * stalwart);
                    newComputerHealth = newComputerHealth - sacrifice < 0 ? 0 : newComputerHealth - sacrifice;
                    playerWin = newComputerHealth === 0;
                    computerWin = newPlayerHealth === 0;
                    playerActionDescription = `You sacrifice ${Math.round(sacrifice / 2 * stalwart)} health to rip ${Math.round(sacrifice)} from ${combat().computer?.name}.`;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, playerWin, playerActionDescription, computerWin };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth, playerWin });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Suture': // Lifedrain (Instant, 50%)
                    if (combat().computer === undefined) return;
                    const suture = Math.round(playerMastery * caerenic * playerLevel * (1 + data / 100) * 0.8);
                    newPlayerHealth = newPlayerHealth + suture > combat().playerHealth ? combat().playerHealth : newPlayerHealth + suture;
                    newComputerHealth = newComputerHealth - suture < 0 ? 0 : newComputerHealth - suture;
                    playerActionDescription = `Your suture ${combat().computer?.name}'s caeren into you, absorbing and healing for ${suture}.`;    
                    playerWin = newComputerHealth === 0;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, playerWin, playerActionDescription };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth, playerWin });
                    playerWin = res.playerWin;
                    break;
                case 'Enemy Sacrifice': // Shadow Word: Death
                    if (combat().computer === undefined) return;
                    const enemySac = Math.round(computerMastery * computerLevel * (1 + data / 50) * caerenicVulnerable * stalwart);
                    newPlayerHealth = newPlayerHealth - (enemySac * caerenicVulnerable) < 0 ? 0 : newPlayerHealth - (enemySac * caerenicVulnerable);
                    newComputerHealth = newComputerHealth - (enemySac / 2) < 0 ? 0 : newComputerHealth - (enemySac / 2);
                    computerActionDescription = `${combat().computer?.name} sacrifices ${enemySac / 2} health to rip ${enemySac * caerenicVulnerable} from you.`;
                    computerWin = newPlayerHealth === 0;
                    playerWin = newComputerHealth === 0;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, computerWin, computerActionDescription, playerWin, damagedID: combat().enemyID };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth, computerWin, playerWin, damagedID: combat().enemyID });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Enemy Suture': // Lifedrain (Instant, 50%)
                    if (combat().computer === undefined) return;
                    const enemySut = Math.round(computerMastery * caerenicVulnerable * (1 + data / 100) * computerLevel * stalwart * 0.8);
                    newPlayerHealth = newPlayerHealth - enemySut < 0 ? 0 : newPlayerHealth - enemySut;
                    newComputerHealth = newComputerHealth + enemySut > computerHealth ? computerHealth : newComputerHealth + enemySut;
                    computerActionDescription = `${combat().computer?.name} sutured ${enemySut} health from you, absorbing ${enemySut}.`;
                    computerWin = newPlayerHealth === 0;
                    playerWin = newComputerHealth === 0;
                    res = { ...combat(), newPlayerHealth, newComputerHealth, computerActionDescription, computerWin, playerWin, damagedID: combat().enemyID };
                    EventBus.emit('blend-combat', { newPlayerHealth: newPlayerHealth, newComputerHealth, computerWin, playerWin, damagedID: combat().enemyID });
                    computerWin = res.computerWin;
                    break;
                default:
                    break;
            };
            if (playerWin === true) res.computerDeathDescription = `${res.computer.name} has been defeated.`;
            if (computerWin === true) res.playerDeathDescription = `You have been defeated.`;
            EventBus.emit('update-combat', res);
            EventBus.emit('add-combat-logs', res);
            if (playerWin === true || computerWin === true) {
                resolveCombat(res);
            } else if (affectsHealth === true) {
                adjustTime(1000, res.newPlayerHealth);
            };
            screenShake(instance.game.scene.scenes[3], 60); // [250, 150, 250]
        } catch (err: any) {
            console.warn(err, 'Error Initiating Combat');
        };
    };
    function resolveCombat(res: Combat) {
        try {
            adjustTime(0, 0, true);
            if (res.playerWin === true) {
                let experience: number = Math.round((res.computer?.level as number) * 100 * (res.computer?.level as number / res?.player?.level!) + (res?.playerAttributes?.rawKyosir as number));
                experience = balanceExperience(experience, res?.player?.level as number);
                experience += ascean().experience;
                const newState = { 
                    ...asceanState(), 
                    avarice: res.prayerData.length > 0 ? res.prayerData.includes('Avarice') : false, 
                    currency: ascean().currency,
                    firewater: ascean().firewater,
                    currentHealth: res.newPlayerHealth,
                    opponent: res.computer?.level,
                    opponentExp: Math.min(experience, res?.player?.level! * 1000),
                };
                EventBus.emit('record-win', { record: res, experience: newState });
                const loot = { enemyID: res.enemyID, level: res.computer?.level as number };
                EventBus.emit('enemy-loot', loot);
                setAsceanState({ ...asceanState(), avarice: false });
            } else {
                EventBus.emit('record-loss', res);
            };
            res = statusEffectCheck(res);
        } catch (err: any) {
            console.warn(err, 'Error Resolving Combat');
        };
    };    
    function startCountdown(health: number) {
        if (combat().combatEngaged === false) {
            EventBus.emit('save-health', health);
            return;
        };
        timer = setInterval(() => {
            remaining -= 1000;
            if (remaining <= 0) {
                clearInterval(timer);
                remaining = 0;
                timer = undefined;
                EventBus.emit('save-health', health);
            };
        }, 1000);
    };
    function adjustTime(amount: number, health: number, cancel?: boolean) {
        if (cancel === true) {
            clearInterval(timer);
            timer = undefined;
            return;
        };
        remaining += amount;
        if (!timer) startCountdown(health);
    };
    function balanceExperience(experience: number, level: number) {
        experience *= (110 - (level * 10)) / 100;
        experience = Math.round(experience);
        return experience;
    };
    function fetchEnemy(enemy: any) {
        EventBus.emit('setup-enemy', enemy);
        EventBus.emit('tab-target', enemy);    
    }; 
    function filterEnemies(id: string) {
        let newEnemies = enemies();
        newEnemies = newEnemies.filter((enemy) => {
            return enemy.id !== id ? true : false;
        });
        setEnemies(newEnemies);
    };
    usePhaserEvent('initiate-combat', (payload: { data: any, type: string }) => initiateCombat(payload.data, payload.type));
    usePhaserEvent('remove-enemy', filterEnemies);
    usePhaserEvent('request-enemy', sendEnemyData);
    usePhaserEvent('request-settings', sendSettings);
    usePhaserEvent('special-combat-text', (e: { playerSpecialDescription: string }) => EventBus.emit('add-combat-logs', { ...combat(), playerActionDescription: e.playerSpecialDescription }));
    usePhaserEvent('enemy-combat-text', (e: { computerSpecialDescription: string }) => EventBus.emit('add-combat-logs', { ...combat(), computerActionDescription: e.computerSpecialDescription }));
    usePhaserEvent('update-enemies', (e: any) => setEnemies(e));
    usePhaserEvent('update-ascean-state' , (e: any) => setAsceanState(e));
    return <div id='base-ui'>
        <Show when={game().showPlayer} fallback={<div style={{ position: "absolute", 'z-index': 1 }}>
            <Suspense fallback={<Puff color="gold" />}>
                <CombatUI state={combat} game={game} settings={settings} stamina={stamina} grace={grace} />
            </Suspense>
            <Show when={combat().computer} fallback={<EnemyPreview enemies={enemies} fetchEnemy={fetchEnemy} />}>
            <Suspense fallback={<Puff color="gold" />}>
                <EnemyUI state={combat} game={game} enemies={enemies} />
            </Suspense>
            </Show> 
        </div>}>
            <Suspense fallback={<Puff color="gold" />}>
                <Character reputation={reputation} settings={settings} setSettings={setSettings} statistics={statistics} ascean={ascean} asceanState={asceanState} game={game} combat={combat} />
            </Suspense>
        </Show>
        <Suspense fallback={<Puff color="gold" />}>
            <SmallHud ascean={ascean} asceanState={asceanState} combat={combat} game={game} settings={settings} /> 
        </Suspense>
        <Show when={showTutorial()}>
        <Suspense fallback={<Puff color="gold" />}>
            <TutorialOverlay ascean={ascean} id={ascean()._id} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} />
        </Suspense>
        </Show>
        <Show when={showDeity()}>
        <Suspense fallback={<Puff color="gold" />}>
            <Deity ascean={ascean} combat={combat} game={game} statistics={statistics} />
        </Suspense>
        </Show>
    </div>;
};