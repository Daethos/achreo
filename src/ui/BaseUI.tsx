import { Accessor, Setter, Show, createEffect, createSignal, onMount } from 'solid-js';
import Ascean from '../models/ascean';
import Character from './Character';
import CombatUI from './CombatUI';
import EnemyPreview from './EnemyPreview';
import EnemyUI from './EnemyUI';
import Settings from '../models/settings';
import SmallHud from './SmallHud';
import TutorialOverlay from '../utility/tutorial';
import { Combat } from "../stores/combat";
import { EnemySheet } from '../utility/enemy';
import { EventBus } from "../game/EventBus";
import { GameState } from '../stores/game';
import { LevelSheet } from '../utility/ascean';
import { usePhaserEvent } from '../utility/hooks';
import { computerCombatCompiler, consumePrayer, instantActionCompiler, prayerEffectTick, prayerRemoveTick, weaponActionCompiler } from '../utility/combat';
import { Deity } from './Deity';
import { screenShake } from '../phaser/ScreenShake';
import { Reputation } from '../utility/player';

interface Props {
    instance: any;
    ascean: Accessor<Ascean>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    reputation: Accessor<Reputation>;
    setReputation: Setter<Reputation>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    stamina: Accessor<number>;
};

export default function BaseUI({ instance, ascean, combat, game, reputation, settings, setSettings, stamina }: Props) {
    const [enemies, setEnemies] = createSignal<EnemySheet[]>([]);
    const [showTutorial, setShowTutorial] = createSignal<boolean>(false);
    const [tutorial, setTutorial] = createSignal<string>('');
    const [showDeity, setShowDeity] = createSignal<boolean>(false);
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
    var remaining: number = 0, timer: any = undefined;

    createEffect(() => EventBus.emit('combat', combat()));  

    createEffect(() => EventBus.emit('reputation', reputation()));

    createEffect(() => EventBus.emit('settings', settings()));

    onMount(() => {
        if (!ascean().tutorial.intro) {
            EventBus.emit('intro');
        } else if (!ascean().tutorial.boot) {
            setTutorial('boot');
            setShowTutorial(true);
        };
    });
 
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
            let playerWin: boolean = false, computerWin: boolean = false, res: any = undefined, affectsHealth: boolean = true, caerenic: number = combat().isCaerenic ? 1.15 : 1, stalwart: number = combat().isStalwart ? 0.85 : 1;
            switch (type) {
                case 'Weapon': // Targeted weapon action
                    const weapon = { ...combat(), [data.key]: data.value };
                    res = weaponActionCompiler(weapon) as Combat;
                    EventBus.emit('blend-combat', res);
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    break;
                case 'Consume': // Consuming a prayer
                    const consume = { 
                        ...combat(), 
                        prayerSacrificeId: data.prayerSacrificeId, 
                    };
                    res = consumePrayer(consume) as Combat;
                    console.log(res, '-- Consume Action --');
                    EventBus.emit('blend-combat', { 
                        newComputerHealth: res.newComputerHealth,
                        newPlayerHealth: res.newPlayerHealth, 
                        playerEffects: res.playerEffects,
                        playerWin: res.playerWin,
                    });
                    playerWin = res.playerWin;
                    break;
                case 'Prayer': // Consuming a prayer
                    const pray = { ...combat(), playerEffects: data };
                    res = consumePrayer(pray) as Combat;
                    EventBus.emit('blend-combat', { 
                        newComputerHealth: res.newComputerHealth, 
                        newPlayerHealth: res.newPlayerHealth, 
                        playerEffects: res.playerEffects,
                        playerWin: res.playerWin,
                    });
                    playerWin = res.playerWin;
                    break;
                case 'Instant': // Invoking a Prayer
                    let insta = { ...combat(), playerBlessing: data };
                    insta = instantActionCompiler(insta) as Combat;
                    playerWin = insta.playerWin;
                    res = { ...combat(), ...insta };
                    EventBus.emit('blend-combat', insta);
                    break;
                case 'Tick': // Prayer Effect Tick
                    const { effect, effectTimer } = data;
                    const tick = prayerEffectTick({ combat: combat(), effect, effectTimer });
                    res = { ...combat(), ...tick };
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    EventBus.emit('blend-combat', tick);
                    break;
                case 'Remove Tick':
                    const remove = prayerRemoveTick(combat(), data);
                    res = { ...combat(), ...remove };
                    EventBus.emit('blend-combat', remove);                    
                    break;
                case 'Player': // 'Player Blind Attack' i.e. hitting a non targeted enemy
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
                    const chiomic = Math.round(combat().playerHealth * (data / 100)) * caerenic * ((combat().player?.level as number + 9) / 10);
                    const newComputerHealth = combat().newComputerHealth - chiomic < 0 ? 0 : combat().newComputerHealth - chiomic;
                    playerWin = newComputerHealth === 0;
                    const chiomicDescription = 
                        `Your hush flays ${chiomic} health from ${combat().computer?.name}.`;
                    res = { 
                        ...combat(), 
                        newComputerHealth, 
                        playerWin,
                        playerActionDescription: chiomicDescription,    
                    };
                    EventBus.emit('blend-combat', { 
                        newComputerHealth, 
                        playerWin,
                    });
                    affectsHealth = false;
                    break;
                case 'Enemy Chiomic':
                    const enemyChiomic = Math.round(combat().computerHealth * (data / 100)) * (caerenic ? 1.25 : 1) * stalwart  * ((combat().computer?.level as number + 9) / 10);
                    const newChiomicPlayerHealth = combat().newPlayerHealth - enemyChiomic < 0 ? 0 : combat().newPlayerHealth - enemyChiomic;
                    computerWin = newChiomicPlayerHealth === 0;
                    const enemyChiomicDescription = 
                        `${combat().computer?.name} flays ${enemyChiomic} health from you with their hush.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: newChiomicPlayerHealth,
                        computerWin,
                        computerActionDescription: enemyChiomicDescription,
                    };
                    EventBus.emit('blend-combat', {
                        newPlayerHealth: newChiomicPlayerHealth,
                        computerWin,
                    });
                    break;
                case 'Tshaeral': // Lifedrain
                    const drained = Math.round(combat().playerHealth * (data / 100)) * caerenic * ((combat().player?.level as number + 9) / 10);
                    const newPlayerHealth = combat().newPlayerHealth + drained > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + drained;
                    const newHealth = combat().newComputerHealth - drained < 0 ? 0 : combat().newComputerHealth - drained;
                    playerWin = newHealth === 0;
                    const tshaeralDescription =
                        `You tshaer and devour ${drained} health from ${combat().computer?.name}.`;
                    res = { 
                        ...combat(), 
                        newPlayerHealth, 
                        newComputerHealth: newHealth, 
                        playerWin,
                        playerActionDescription: tshaeralDescription,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth: newHealth, playerWin });
                    break;
                case 'Enemy Tshaeral':
                    const enemyDrain = Math.round(combat().computerHealth * (data / 100)) * (caerenic ? 1.25 : 1) * stalwart * ((combat().computer?.level as number + 9) / 10);
                    let drainedPlayerHealth = combat().newPlayerHealth - enemyDrain < 0 ? 0 : combat().newPlayerHealth - enemyDrain;
                    let drainedComputerHealth = combat().newComputerHealth + enemyDrain > combat().computerHealth ? combat().computerHealth : combat().newComputerHealth + enemyDrain;
                    
                    computerWin = drainedPlayerHealth === 0;
                    const enemyTshaeralDescription =
                        `${combat().computer?.name} tshaers and devours ${enemyDrain} health from you.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: drainedPlayerHealth,
                        newComputerHealth: drainedComputerHealth,
                        computerWin,
                        computerActionDescription: enemyTshaeralDescription,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: drainedPlayerHealth, newComputerHealth: drainedComputerHealth, computerWin });
                    break;
                case 'Health': // Either Enemy or Player gaining health
                    let { key, value, id } = data;
                    switch (key) {
                        case 'player':
                            const healed = Math.floor(combat().playerHealth * (value / 100));
                            const newPlayerHealth = combat().newPlayerHealth + healed > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + healed;
                            const healthDescription = 
                                `You heal for ${healed}, back to ${Math.round(newPlayerHealth)}.`
                            res = { ...combat(), newPlayerHealth, playerActionDescription: healthDescription };
                            EventBus.emit('blend-combat', { newPlayerHealth });
                            break;
                        case 'enemy':
                            const enemyHealth = value > 0 ? value : 0;
                            playerWin = enemyHealth === 0;
                            const enemyDescription =
                                `${combat().computer?.name} health shifts to ${Math.round(enemyHealth)}.`;
                            res = { ...combat(), newComputerHealth: enemyHealth, playerWin, computerActionDescription: enemyDescription };
                            if (combat().enemyID === id) {
                                EventBus.emit('blend-combat', { newComputerHealth: enemyHealth, playerWin });
                            } else {
                                EventBus.emit('update-enemy-health', { id, health: enemyHealth, glancing: false, critical: false });
                            };
                            affectsHealth = false;
                            break;
                        default:
                            break;
                    };
                    break;
                case 'Enemy': // 'Enemy Blind Attack' i.e. an enemy not targeted hitting the player
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
                    // console.log(res, 'Res in Enemy');
                    EventBus.emit('blend-combat', res);
                    break;
                case 'Sacrifice':
                    const sacrifice = Math.round(combat()?.player?.[combat().player?.mastery as string]) * caerenic * ((combat().player?.level as number + 9) / 10);
                    let playerSacrifice = combat().newPlayerHealth - (sacrifice / 2 * stalwart) < 0 ? 0 : combat().newPlayerHealth - (sacrifice / 2 * stalwart);
                    let enemySacrifice = combat().newComputerHealth - sacrifice < 0 ? 0 : combat().newComputerHealth - sacrifice;

                    const sacrificeDescription =
                        `You sacrifice ${sacrifice / 2 * stalwart} health to rip ${sacrifice} from ${combat().computer?.name}.`;
                    res = { ...combat(),
                        newPlayerHealth: playerSacrifice,
                        newComputerHealth: enemySacrifice,
                        playerWin: enemySacrifice === 0,
                        playerActionDescription: sacrificeDescription,
                        computerWin: playerSacrifice === 0,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerSacrifice, newComputerHealth: enemySacrifice, playerWin: enemySacrifice === 0 });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Suture':
                    const suture = Math.round(combat()?.player?.[combat().player?.mastery as string]) / 2 * caerenic * ((combat().player?.level as number + 9) / 10);
                    let playerSuture = combat().newPlayerHealth + suture > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + suture;
                    let enemySuture = combat().newComputerHealth - suture < 0 ? 0 : combat().newComputerHealth - suture;
                    
                    const sutureDescription = 
                        `Your tendrils suture ${combat().computer?.name}'s caeren into you, absorbing ${suture}.`;    
                    res = {
                        ...combat(),
                        newPlayerHealth: playerSuture,
                        newComputerHealth: enemySuture,
                        playerWin: enemySuture === 0,
                        playerActionDescription: sutureDescription,    
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerSuture, newComputerHealth: enemySuture, playerWin: enemySuture === 0 });
                    playerWin = res.playerWin;
                    break;
                case 'Enemy Sacrifice':
                    const enemySac = Math.round(combat().computer?.[combat().computer?.mastery as string]) * ((combat().computer?.level as number + 9) / 10) * stalwart;
                    let playerEnemySacrifice = combat().newPlayerHealth - (enemySac * (caerenic ? 1.25 : 1)) < 0 ? 0 : combat().newPlayerHealth - (enemySac * (caerenic ? 1.25 : 1));
                    let enemyEnemySacrifice = combat().newComputerHealth - (enemySac / 2) < 0 ? 0 : combat().newComputerHealth - (enemySac / 2);
    
                    const enemySacrificeDescription = 
                        `${combat().computer?.name} sacrifices ${enemySac / 2} health to rip ${enemySac * (caerenic ? 1.25 : 1)} from you.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: playerEnemySacrifice,
                        newComputerHealth: enemyEnemySacrifice,
                        computerWin: playerEnemySacrifice === 0,
                        computerActionDescription: enemySacrificeDescription,
                        playerWin: enemyEnemySacrifice === 0,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerEnemySacrifice, newComputerHealth: enemyEnemySacrifice, computerWin: playerEnemySacrifice === 0 });
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Enemy Suture':
                    const enemySut = Math.round(combat().computer?.[combat().computer?.mastery as string]) / 2 * (caerenic ? 1.25 : 1) * ((combat().computer?.level as number + 9) / 10) * stalwart;
                    let playerEnemySuture = combat().newPlayerHealth - (enemySut * 1.25) < 0 ? 0 : combat().newPlayerHealth - (enemySut * 1.25);
                    let enemyEnemySuture = combat().newComputerHealth + enemySut > combat().computerHealth ? combat().computerHealth : combat().newComputerHealth + enemySut;

                    const enemySutureDescription = 
                        `${combat().computer?.name} sutured ${enemySut} health from you, absorbing ${enemySut}.`;
                    res = {
                        ...combat(),
                        newPlayerHealth: playerEnemySuture,
                        newComputerHealth: enemyEnemySuture,
                        computerWin: playerEnemySuture === 0,
                        computerActionDescription: enemySutureDescription,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerEnemySuture, newComputerHealth: enemyEnemySuture, computerWin: playerEnemySuture === 0 });
                    computerWin = res.computerWin;
                    break;
                default:
                    break;
            };
            screenShake(instance.game.scene.scenes[3], 150); // [250, 150, 250]
            if (playerWin === true) {
                res.computerDeathDescription = `${res.computer.name} has been defeated.`;
            };
            if (computerWin === true) {
                res.playerDeathDescription = `You have been defeated.`;
            };
            EventBus.emit('update-combat', res);
            EventBus.emit('add-combat-logs', res);
            if (playerWin === true || computerWin === true) {
                resolveCombat(res);
            } else if (affectsHealth === true) {
                adjustTime(1000, res.newPlayerHealth);
            };
        } catch (err: any) {
            console.log(err, 'Error Initiating Combat');
        };
    };

    function resolveCombat(res: Combat) {
        try {
            adjustTime(0, 0, true);
            if (res.playerWin === true) {
                let experience = 
                    Math.round((res.computer?.level as number) * 100 
                    * (res.computer?.level as number / res?.player?.level!) 
                    + (res?.playerAttributes?.rawKyosir as number));
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
                const loot = { enemyID: res.enemyID, level: res.computer?.level as number };
                EventBus.emit('record-win', {
                    record: res,
                    experience: newState
                });
                EventBus.emit('enemy-loot', loot);
                if (!ascean().tutorial.deity) {
                    if (newState.opponentExp >= 750 && ascean().level >= 1) { // 1000
                        setTutorial('deity');
                        setShowTutorial(true);  
                        if (game().pauseState === false) {
                            EventBus.emit('update-pause', true);
                            EventBus.emit('toggle-bar', true);    
                            EventBus.emit('update-small-hud');
                        };
                    };
                };
                if (checkDeificInteractions(newState.opponentExp)) {
                    setShowDeity(true);
                    if (game().pauseState === false) {
                        EventBus.emit('update-pause', true);
                        EventBus.emit('toggle-bar', true);    
                        EventBus.emit('update-small-hud');
                    };
                };
            } else {
                EventBus.emit('record-statistics', res);
                if (!ascean().tutorial.death) {
                    setTutorial('death');
                    setShowTutorial(true);
                };
            };
        } catch (err: any) {
            console.log(err, 'Error Resolving Combat');
        };
    };    

    function startCountdown(health: number) {
        if (!timer) {
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
    };
    
    function adjustTime(amount: number, health: number, cancel?: boolean) {
        if (cancel === true) {
            clearInterval(timer);
            timer = undefined;
            return;
        };
        remaining += amount;
        if (!timer) {
            startCountdown(health);
        };
    };

    function balanceExperience(experience: number, level: number) {
        experience *= (110 - (level * 10)) / 100;
        experience = Math.round(experience);
        return experience;
    };

    function checkDeificInteractions(currentExperience: number) {
        return ascean().interactions.deity <= ascean().level - 1 // <=
            && ascean().level === 2 
            && ascean().level * 750 <= currentExperience;
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
    usePhaserEvent('show-deity', (e: boolean) => setShowDeity(e));
    usePhaserEvent('special-combat-text', (e: { playerSpecialDescription: string }) => {
        const logs = {
            ...combat(),
            playerActionDescription: e.playerSpecialDescription,
        };
        EventBus.emit('add-combat-logs', logs);
    });
    usePhaserEvent('enemy-combat-text', (e: { computerSpecialDescription: string }) => {
        const logs = {
            ...combat(),
            computerActionDescription: e.computerSpecialDescription,
        };
        EventBus.emit('add-combat-logs', logs);
    });
    usePhaserEvent('update-enemies', (e: any) => setEnemies(e));
    usePhaserEvent('update-ascean-state' , (e: any) => setAsceanState(e));

    function fetchEnemy(enemy: any) {
        EventBus.emit('setup-enemy', enemy);
        EventBus.emit('tab-target', enemy);    
    }; 

    return (
        <div id='base-ui'>
        <Show when={game().showPlayer} fallback={
            <div style={{ position: "absolute", 'z-index': 1 }}>
                <CombatUI state={combat} game={game} stamina={stamina} />
                <Show when={combat().computer} fallback={
                    <EnemyPreview enemies={enemies} fetchEnemy={fetchEnemy} />
                }>
                    <EnemyUI state={combat} game={game} enemies={enemies} />
                </Show> 
            </div>
        }>
            <Character reputation={reputation} settings={settings} setSettings={setSettings} ascean={ascean} asceanState={asceanState} game={game} combatState={combat} />
        </Show>
        <SmallHud ascean={ascean} asceanState={asceanState} combat={combat} game={game} settings={settings} /> 
        <Show when={showTutorial()}>
            <TutorialOverlay ascean={ascean} id={ascean()._id} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} />
        </Show>
        <Show when={showDeity()}>
            <Deity ascean={ascean} combat={combat} game={game} />
        </Show>
        </div>
    );
};