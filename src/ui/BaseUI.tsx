import { Accessor, Setter, Show, createEffect, createSignal, lazy, Suspense } from 'solid-js';
import Ascean from '../models/ascean';
import Settings from '../models/settings';
import { Combat } from "../stores/combat";
import { EnemySheet } from '../utility/enemy';
import { EventBus } from "../game/EventBus";
import { GameState } from '../stores/game';
import { LevelSheet } from '../utility/ascean';
import { usePhaserEvent } from '../utility/hooks';
import { computerCombatCompiler, consumePrayer, instantActionCompiler, prayerEffectTick, prayerRemoveTick, statusEffectCheck, weaponActionCompiler } from '../utility/combat';
import { screenShake } from '../phaser/ScreenShake';
import { Reputation } from '../utility/player';
import { Puff } from 'solid-spinner';
const Character = lazy(async () => await import('./Character'));
const CombatUI = lazy(async () => await import('./CombatUI'));
const Deity = lazy(async () => await import('./Deity'));
const EnemyPreview = lazy(async () => await import('./EnemyPreview'));
const EnemyUI = lazy(async () => await import('./EnemyUI'));
const SmallHud = lazy(async () => await import('./SmallHud'));
const TutorialOverlay = lazy(async () => await import('../utility/tutorial'));
function validateHealth(val: number): number {
    if (Number.isNaN(val)) {
        return 1;
    };
    return val;
};
interface Props {
    instance: any;
    ascean: Accessor<Ascean>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    reputation: Accessor<Reputation>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    stamina: Accessor<number>;
    grace: Accessor<number>;
    tutorial: Accessor<string>;
    showTutorial: Accessor<boolean>;
    setShowTutorial: Setter<boolean>;
    showDeity: Accessor<boolean>;
};
var remaining: number = 0, timer: any = undefined;
export default function BaseUI({ instance, ascean, combat, game, reputation, settings, setSettings, stamina, grace, tutorial, showDeity, showTutorial, setShowTutorial }: Props) {
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
    function computerCombat(data: any, type: string) {
        console.log(`%c Computer Combat: [Type] -- ${type}`, 'color: #ff0000');
        const { computerOne, computerTwo } = data;
        try {
            switch (type) {
                case 'Weapon': // Targeted weapon action
                    const res = computerCombatCompiler(data);
                    EventBus.emit('update-enemy-health', { id: computerOne.enemyID, health: res?.computerOne.newComputerHealth });
                    EventBus.emit('update-enemy-health', { id: computerTwo.enemyID, health: res?.computerTwo.newComputerHealth });
                    break;
                case 'Chiomic': // Caster flays health from enemy
                    const enemyChiomic = Math.round(computerOne.computerHealth * (data.value / 100));
                    const computerChiomicDamage = computerTwo.newComputerHealth - enemyChiomic < 0 ? 0 : computerTwo.newComputerHealth - enemyChiomic;
                    EventBus.emit('update-enemy-health', { id: computerTwo.enemyID, health: computerChiomicDamage });
                    break;
                case 'Health':
                    // const { current, enemyID, total, value } = data;
                    const enemyHeal = Math.floor(data.total * data.value / 100);
                    const newHealth = data.current + enemyHeal > data.total ? data.total : data.current + enemyHeal;
                    EventBus.emit('update-enemy-health', { id: data.enemyID, health: newHealth });
                    break;
                case 'Sacrifice': // Caster sacrifices health to deal damage
                    const sacrifice = Math.round(computerOne.computer?.[computerOne.computer?.mastery as string]);
                    const computerSacrificeHealth = computerOne.newComputerHealth - (sacrifice / 2) < 0 ? 0 : computerOne.newComputerHealth - (sacrifice / 2);
                    const computerSacrificeDamage = computerTwo.newComputerHealth - sacrifice < 0 ? 0 : computerTwo.newComputerHealth - sacrifice;
                    EventBus.emit('update-enemy-health', { id: computerOne.enemyID, health: computerSacrificeHealth });
                    EventBus.emit('update-enemy-health', { id: computerTwo.enemyID, health: computerSacrificeDamage });
                    break;
                case 'Suture': // Caster sutures health from enemy
                    const computerSuture = Math.round(computerOne.computer?.[computerOne.computer?.mastery as string]) / 2;
                    const computerSutureHealth = computerOne.newComputerHealth + computerSuture > computerOne.computerHealth ? computerOne.computerHealth : computerOne.newComputerHealth + computerSuture;
                    const computerSutureDamage = computerTwo.newComputerHealth - computerSuture < 0 ? 0 : computerTwo.newComputerHealth - computerSuture;
                    EventBus.emit('update-enemy-health', { id: computerOne.enemyID, health: computerSutureHealth });
                    EventBus.emit('update-enemy-health', { id: computerTwo.enemyID, health: computerSutureDamage });
                    break;
                case 'Tshaeral': // Caster drains health from enemy
                    const computerTshaeral = Math.round(computerOne.computerHealth * 3 / 100);
                    const computerTshaeralHealth = computerOne.newComputerHealth + computerTshaeral > computerOne.computerHealth ? computerOne.computerHealth : computerOne.newComputerHealth + computerTshaeral;
                    const computerTshaeralDamage = computerTwo.newComputerHealth - computerTshaeral < 0 ? 0 : computerTwo.newComputerHealth - computerTshaeral;
                    EventBus.emit('update-enemy-health', { id: computerOne.enemyID, health: computerTshaeralHealth });
                    EventBus.emit('update-enemy-health', { id: computerTwo.enemyID, health: computerTshaeralDamage });
                    break;
                default:
                    break;
            };
        } catch (err: any) {
            console.warn(err, 'Error in Computer Combat: [Type] --', type);
        };
    };
    function initiateCombat(data: any, type: string) {
        try {    
            let playerWin: boolean = false, computerWin: boolean = false, res: any = undefined, playerActionDescription: string = '', computerActionDescription: string = '', affectsHealth: boolean = true, caerenic: number = combat().isCaerenic ? 1.15 : 1, stalwart: number = combat().isStalwart ? 0.85 : 1;
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
                    console.log(res, '-- Consume Action --');
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
                    let insta = { ...combat(), playerBlessing: data };
                    insta = instantActionCompiler(insta) as Combat;
                    playerWin = insta.playerWin;
                    res = { ...combat(), ...insta };
                    EventBus.emit('blend-combat', insta);
                    break;
                case 'Tick': // Prayer Tick
                    if (validateHealth(combat().newComputerHealth) <= 0) break;
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
                    const chiomic = Math.round(combat().playerHealth * (data / 100) * caerenic * ((combat().player?.level as number + 9) / 10));
                    const newComputerHealth = validateHealth(combat().newComputerHealth) - chiomic < 0 ? 0 : validateHealth(combat().newComputerHealth) - chiomic;
                    playerWin = newComputerHealth === 0;
                    playerActionDescription = `Your hush flays ${chiomic} health from ${combat().computer?.name}.`;
                    res = { 
                        ...combat(), 
                        newComputerHealth, 
                        playerWin,
                        playerActionDescription,    
                    };
                    EventBus.emit('blend-combat', { 
                        newComputerHealth, 
                        playerWin,
                    });
                    affectsHealth = false;
                    break;
                case 'Enemy Chiomic': // Mindflay
                    if (combat().computer === undefined) return;
                    const enemyChiomic = Math.round(validateHealth(combat().computerHealth) * (data / 100) * (caerenic ? 1.25 : 1) * stalwart  * ((validateHealth(combat().computer?.level as number) + 9) / 10));
                    const newChiomicPlayerHealth = validateHealth(combat().newPlayerHealth) - enemyChiomic < 0 ? 0 : validateHealth(combat().newPlayerHealth) - enemyChiomic;
                    computerWin = newChiomicPlayerHealth === 0;
                    computerActionDescription = `${combat().computer?.name} flays ${enemyChiomic} health from you with their hush.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: newChiomicPlayerHealth,
                        computerWin,
                        computerActionDescription,
                    };
                    EventBus.emit('blend-combat', {
                        newPlayerHealth: newChiomicPlayerHealth,
                        computerWin,
                    });
                    break;
                case 'Tshaeral': // Lifedrain (Tick, 100%)
                    const drained = Math.round(combat().playerHealth * (data / 100) * caerenic * ((combat().player?.level as number + 9) / 10));
                    const newPlayerHealth = validateHealth(combat().newPlayerHealth) + drained > combat().playerHealth ? combat().playerHealth : validateHealth(combat().newPlayerHealth) + drained;
                    const newHealth = validateHealth(combat().newComputerHealth) - drained < 0 ? 0 : validateHealth(combat().newComputerHealth) - drained;
                    playerWin = newHealth === 0;
                    playerActionDescription = `You tshaer and devour ${drained} health from ${combat().computer?.name}.`;
                    res = { 
                        ...combat(), 
                        newPlayerHealth, 
                        newComputerHealth: newHealth, 
                        playerWin,
                        playerActionDescription,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth: newHealth, playerWin });
                    break;
                case 'Enemy Tshaeral': // Lifedrain (Tick, 100%)
                    if (!combat().computer) return;
                    const enemyDrain = Math.round(validateHealth(combat().computerHealth) * (data / 100) * (caerenic ? 1.25 : 1) * stalwart * ((validateHealth(combat().computer?.level as number) + 9) / 10));
                    let drainedPlayerHealth = validateHealth(combat().newPlayerHealth) - enemyDrain < 0 ? 0 : validateHealth(combat().newPlayerHealth) - enemyDrain;
                    let drainedComputerHealth = validateHealth(combat().newComputerHealth) + enemyDrain > validateHealth(combat().computerHealth) ? validateHealth(combat().computerHealth) : validateHealth(combat().newComputerHealth) + enemyDrain;
                    computerWin = drainedPlayerHealth === 0;
                    computerActionDescription = `${combat().computer?.name} tshaers and devours ${enemyDrain} health from you.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: drainedPlayerHealth,
                        newComputerHealth: drainedComputerHealth,
                        computerWin,
                        computerActionDescription,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: drainedPlayerHealth, newComputerHealth: drainedComputerHealth, computerWin });
                    break;
                case 'Health': // Either Enemy or Player Gaining / Losing Health
                    let { key, value, id } = data;
                    switch (key) {
                        case 'player':
                            const healed = Math.floor(combat().playerHealth * (value / 100));
                            const newPlayerHealth = validateHealth(combat().newPlayerHealth) + healed > combat().playerHealth ? combat().playerHealth : validateHealth(combat().newPlayerHealth) + healed;
                            computerWin = newPlayerHealth <= 0;
                            playerActionDescription =  healed > 0 ? `You heal for ${healed}, back to ${Math.round(newPlayerHealth)}.` : `You are damaged for ${healed}, down to ${Math.round(newPlayerHealth)}`;
                            res = { ...combat(), newPlayerHealth, playerActionDescription };
                            EventBus.emit('blend-combat', { newPlayerHealth, computerWin });
                            break;
                        case 'enemy':
                            const enemyHealth = value > 0 ? value : 0;
                            playerWin = enemyHealth === 0;
                            if (combat().enemyID === id) {
                                computerActionDescription = `${combat().computer?.name} health shifts to ${Math.round(enemyHealth)}.`;
                                res = { ...combat(), newComputerHealth: enemyHealth, playerWin, computerActionDescription };
                                EventBus.emit('blend-combat', { newComputerHealth: enemyHealth, playerWin });
                            } else {
                                res = { ...combat(), playerWin };
                                EventBus.emit('update-enemy-health', { id, health: enemyHealth, glancing: false, critical: false });
                            };
                            affectsHealth = false;
                            break;
                        default:
                            break;
                    };
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
                    const sacrifice = Math.round(combat()?.player?.[combat().player?.mastery as string] * caerenic * ((combat().player?.level as number + 9) / 10));
                    let playerSacrifice = validateHealth(combat().newPlayerHealth) - (sacrifice / 2 * stalwart) < 0 ? 0 : validateHealth(combat().newPlayerHealth) - (sacrifice / 2 * stalwart);
                    let enemySacrifice = validateHealth(combat().newComputerHealth) - sacrifice < 0 ? 0 : validateHealth(combat().newComputerHealth) - sacrifice;

                    playerActionDescription = `You sacrifice ${sacrifice / 2 * stalwart} health to rip ${sacrifice} from ${combat().computer?.name}.`;
                    res = { ...combat(),
                        newPlayerHealth: playerSacrifice,
                        newComputerHealth: enemySacrifice,
                        playerWin: enemySacrifice === 0,
                        playerActionDescription,
                        computerWin: playerSacrifice === 0,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerSacrifice, newComputerHealth: enemySacrifice, playerWin: enemySacrifice === 0 });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Suture': // Lifedrain (Instant, 50%)
                    const suture = Math.round(combat()?.player?.[combat().player?.mastery as string] / 2 * caerenic * ((combat().player?.level as number + 9) / 10));
                    let playerSuture = validateHealth(combat().newPlayerHealth) + suture > combat().playerHealth ? combat().playerHealth : validateHealth(combat().newPlayerHealth) + suture;
                    let enemySuture = validateHealth(combat().newComputerHealth) - suture < 0 ? 0 : validateHealth(combat().newComputerHealth) - suture;
                    playerActionDescription = `Your tendrils suture ${combat().computer?.name}'s caeren into you, absorbing ${suture}.`;    
                    res = {
                        ...combat(),
                        newPlayerHealth: playerSuture,
                        newComputerHealth: enemySuture,
                        playerWin: enemySuture === 0,
                        playerActionDescription,    
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerSuture, newComputerHealth: enemySuture, playerWin: enemySuture === 0 });
                    playerWin = res.playerWin;
                    break;
                case 'Enemy Sacrifice': // Shadow Word: Death
                    if (combat().computer === undefined) return;
                    const enemySac = Math.round(combat().computer?.[combat().computer?.mastery as string] * ((validateHealth(combat().computer?.level as number) + 9) / 10) * stalwart);
                    let playerEnemySacrifice = validateHealth(combat().newPlayerHealth) - (enemySac * (caerenic ? 1.25 : 1)) < 0 ? 0 : validateHealth(combat().newPlayerHealth) - (enemySac * (caerenic ? 1.25 : 1));
                    let enemyEnemySacrifice = validateHealth(combat().newComputerHealth) - (enemySac / 2) < 0 ? 0 : validateHealth(combat().newComputerHealth) - (enemySac / 2);
                    computerActionDescription = `${combat().computer?.name} sacrifices ${enemySac / 2} health to rip ${enemySac * (caerenic ? 1.25 : 1)} from you.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: playerEnemySacrifice,
                        newComputerHealth: enemyEnemySacrifice,
                        computerWin: playerEnemySacrifice === 0,
                        computerActionDescription,
                        playerWin: enemyEnemySacrifice === 0,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerEnemySacrifice, newComputerHealth: enemyEnemySacrifice, computerWin: playerEnemySacrifice === 0 });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Enemy Suture': // Lifedrain (Instant, 50%)
                    if (combat().computer === undefined) return;
                    const enemySut = Math.round(combat().computer?.[combat().computer?.mastery as string] / 2 * (caerenic ? 1.25 : 1) * ((validateHealth(combat().computer?.level as number) + 9) / 10) * stalwart);
                    let playerEnemySuture = validateHealth(combat().newPlayerHealth) - (enemySut * 1.25) < 0 ? 0 : validateHealth(combat().newPlayerHealth) - (enemySut * 1.25);
                    let enemyEnemySuture = validateHealth(combat().newComputerHealth) + enemySut > validateHealth(combat().computerHealth) ? validateHealth(combat().computerHealth) : validateHealth(combat().newComputerHealth) + enemySut;
                    computerActionDescription = `${combat().computer?.name} sutured ${enemySut} health from you, absorbing ${enemySut}.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: playerEnemySuture,
                        newComputerHealth: enemyEnemySuture,
                        computerWin: playerEnemySuture === 0,
                        computerActionDescription,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerEnemySuture, newComputerHealth: enemyEnemySuture, computerWin: playerEnemySuture === 0 });
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
            screenShake(instance.game.scene.scenes[3], 96); // [250, 150, 250]
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
    usePhaserEvent('computer-combat', (payload: { data: any, type: string }) => computerCombat(payload.data, payload.type));
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
                <Character reputation={reputation} settings={settings} setSettings={setSettings} ascean={ascean} asceanState={asceanState} game={game} combatState={combat} />
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
            <Deity ascean={ascean} combat={combat} game={game} />
        </Suspense>
        </Show>
    </div>;
};