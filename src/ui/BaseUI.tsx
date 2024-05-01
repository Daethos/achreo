import { Accessor, Setter, Show, createEffect, createSignal, onMount } from 'solid-js';
import Ascean from '../models/ascean';
import Character from './Character';
import CombatUI from './CombatUI';
import createStamina from './Stamina';
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
import { consumePrayer, instantActionCompiler, weaponActionCompiler } from '../utility/combat';

interface Props {
    ascean: Accessor<Ascean>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    stamina: Accessor<number>;
};

export default function BaseUI({ ascean, combat, game, settings, setSettings, stamina }: Props) {
    const { staminaPercentage } = createStamina(stamina);
    const [enemies, setEnemies] = createSignal<EnemySheet[]>([]);
    const [showTutorial, setShowTutorial] = createSignal<boolean>(false);
    const [tutorial, setTutorial] = createSignal<string>('');
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

    createEffect(() => {
        EventBus.emit('combat', combat());
    });  

    createEffect(() => {
        EventBus.emit('settings', settings());
    });

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

    function initiateCombat(data: any, type: string) {
        try {    
            let playerWin: boolean = false, computerWin: boolean = false, res: any = undefined;
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
                    computerWin = res.computerWin;
                    playerWin = res.playerWin;
                    break;
                case 'Chiomic': // Mindflay
                    const chiomic = Math.round(combat().playerHealth * (data / 100));
                    const newComputerHealth = combat().newComputerHealth - chiomic < 0 ? 0 : combat().newComputerHealth - chiomic;
                    playerWin = newComputerHealth === 0;
                    res = { ...combat(), newComputerHealth, playerWin };
                    EventBus.emit('blend-combat', { newComputerHealth, playerWin });
                    break;
                case 'Tshaeral': // Lifedrain
                    const drained = Math.round(combat().playerHealth * (data / 100));
                    const newPlayerHealth = combat().newPlayerHealth + drained > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + drained;
                    const newHealth = combat().newComputerHealth - drained < 0 ? 0 : combat().newComputerHealth - drained;
                    playerWin = newHealth === 0;
                    res = { ...combat(), newPlayerHealth, newComputerHealth: newHealth, playerWin };
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth: newHealth, playerWin });
                    break;
                case 'Health': // Either Enemy or Player gaining health
                    let { key, value } = data;
                    switch (key) {
                        case 'player':
                            const healed = Math.floor(combat().playerHealth * (value / 100));
                            const newPlayerHealth = combat().newPlayerHealth + healed > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + healed;
                            res = { ...combat(), newPlayerHealth };
                            EventBus.emit('blend-combat', { newPlayerHealth });
                            break;
                        case 'enemy':
                            const enemyHealth = value > 0 ? value : 0;
                            playerWin = enemyHealth === 0;
                            res = { ...combat(), newComputerHealth: enemyHealth, playerWin };
                            EventBus.emit('update-combat-state', { key: 'newComputerHealth', value: enemyHealth });
                            break;
                        default:
                            break;
                    };
                    break;
                case 'Enemy': // 'Enemy Blind Attack' i.e. an enemy not targeted hitting the player
                    // console.log(data, 'Data')
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
                    const sacrifice = Math.round(combat()?.player?.[combat().player?.mastery as string])
                    const playerSacrifice = combat().newPlayerHealth - (sacrifice / 2) < 0 ? 0 : combat().newPlayerHealth - (sacrifice / 2);
                    const enemySacrifice = combat().newComputerHealth - sacrifice < 0 ? 0 : combat().newComputerHealth - sacrifice;
                    res = { ...combat(),
                        newPlayerHealth: playerSacrifice,
                        newComputerHealth: enemySacrifice,
                        playerWin: enemySacrifice === 0,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerSacrifice, newComputerHealth: enemySacrifice, playerWin: enemySacrifice === 0 });
                    playerWin = res.playerWin;
                    break;
                case 'Suture':
                    const suture = Math.round(combat()?.player?.[combat().player?.mastery as string]) / 2;
                    const playerSuture = combat().newPlayerHealth + suture > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + suture;
                    const enemySuture = combat().newComputerHealth - suture < 0 ? 0 : combat().newComputerHealth - suture;
                    res = {
                        ...combat(),
                        newPlayerHealth: playerSuture,
                        newComputerHealth: enemySuture,
                        playerWin: enemySuture === 0,
                    };
                    EventBus.emit('blend-combat', { newPlayerHealth: playerSuture, newComputerHealth: enemySuture, playerWin: enemySuture === 0 });
                    playerWin = res.playerWin;
                    break;
                default:
                    break;
            };
            EventBus.emit('update-combat', res);
            if (playerWin === true || computerWin === true) {
                resolveCombat(res);
            };
        } catch (err: any) {
            console.log(err, 'Error Initiating Combat');
        };
    };

    function resolveCombat(res: Combat) {
        try {
            EventBus.emit('record-statistics', res);
            if (res.playerWin === true) {
                let experience = 
                    Math.round((res.computer?.level as number) 
                    * 100 
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
                EventBus.emit('gain-experience', newState);
                EventBus.emit('enemy-loot', loot);
                if (!ascean().tutorial.deity) {
                    if (experience >= 1000 && ascean().level >= 2) {
                        setTutorial('deity');
                        setShowTutorial(true);  
                        if (game().pauseState === false) {
                            EventBus.emit('update-pause', true);
                            EventBus.emit('toggle-bar', true);    
                            EventBus.off('update-small-hud');
                        };
                    };
                };
            } else {
                if (!ascean().tutorial.death) {
                    setTutorial('death');
                    setShowTutorial(true);
                };
            };
        } catch (err: any) {
            console.log(err, 'Error Resolving Combat');
        };
    };    

    function balanceExperience(experience: number, level: number) {
        experience *= (105 - (level * 5)) / 100;
        experience = Math.round(experience);
        // 3% drop off level 1 = * 1, 2 = * 0.97, 3 = * 0.94, 4 = * 0.91, 5 = * 0.88, 6 = * 0.85, 7 = * 0.82, 8 = * 0.79, 9 = * 0.76, 10 = * 0.73
        // 4% drop off level 1 = * 1, 2 = * 0.96, 3 = * 0.92, 4 = * 0.88, 5 = * 0.84, 6 = * 0.80, 7 = * 0.76, 8 = * 0.72, 9 = * 0.68, 10 = * 0.64
        // 5% drop off level 1 = * 1, 2 = * 0.95, 3 = * 0.90, 4 = * 0.85, 5 = * 0.80, 6 = * 0.75, 7 = * 0.70, 8 = * 0.65, 9 = * 0.60, 10 = * 0.55
        // 6% drop off level 1 = * 1, 2 = * 0.94, 3 = * 0.88, 4 = * 0.82, 5 = * 0.76, 6 = * 0.70, 7 = * 0.64, 8 = * 0.58, 9 = * 0.52, 10 = * 0.46
        // 7% drop off level 1 = * 1, 2 = * 0.93, 3 = * 0.86, 4 = * 0.79, 5 = * 0.72, 6 = * 0.65, 7 = * 0.58, 8 = * 0.51, 9 = * 0.44, 10 = * 0.37
        return experience;
    };

    function filterEnemies(id: string) {
        let newEnemies = enemies();
        newEnemies = newEnemies.filter((enemy) => {
            console.log(enemy.id === id, 'Filtering Enemies');
            return enemy.id !== id ? true : false;
        });
        setEnemies(newEnemies);
    };

    usePhaserEvent('initiate-combat', (payload: { data: any, type: string }) => initiateCombat(payload.data, payload.type));
    usePhaserEvent('request-enemy', sendEnemyData);
    usePhaserEvent('request-settings', sendSettings);

    usePhaserEvent('remove-enemy', filterEnemies);
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
                <CombatUI state={combat} staminaPercentage={staminaPercentage} game={game} stamina={stamina} />
                <Show when={combat().computer} fallback={
                    <EnemyPreview enemies={enemies} fetchEnemy={fetchEnemy} />
                }>
                    <EnemyUI state={combat} game={game} enemies={enemies} />
                </Show> 
            </div>
        }>
            <Character settings={settings} setSettings={setSettings} ascean={ascean} asceanState={asceanState} game={game} combatState={combat} />
        </Show>
        <SmallHud ascean={ascean} asceanState={asceanState} combat={combat} game={game} /> 
        <Show when={showTutorial()}>
            <TutorialOverlay ascean={ascean} id={ascean()._id} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} />
        </Show>
        </div>
    );
};