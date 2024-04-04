import { Accessor, Setter, Show, createEffect, createSignal, onMount } from 'solid-js';
import CombatUI from './CombatUI';
import EnemyUI from './EnemyUI';
import StoryAscean from './StoryAscean';
import { EventBus } from "../game/EventBus";
import { Combat, initCombat } from "../stores/combat";
import CombatSettings from './CombatSettings';
import CombatText from './CombatText';
import LootDropUI from './LootDropUI';
import SmallHud from './SmallHud';
import Ascean from '../models/ascean';
import Settings from '../models/settings';
import { consumePrayer, instantActionCompiler, weaponActionCompiler } from '../utility/combat';
import { fetchNpc } from '../utility/npc';
import { GameState } from '../stores/game';
import { usePhaserEvent } from '../utility/hooks';
import createStamina from './Stamina';
// import Equipment, { getOneRandom } from '../models/equipment';
import EnemyPreview from './EnemyPreview';
import TutorialOverlay from '../utility/tutorial';
import { getOneRandom } from '../models/equipment';
// import createTimer from './Timer';
// import StoryTutorial from '../../../seyr/src/game/ui/StoryTutorial';
// import { StoryDialog } from '../../../seyr/src/game/ui/StoryDialog';

interface Props {
    ascean: Accessor<Ascean>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    stamina: Accessor<number>;
};

export default function BaseUI({ ascean, combat, game, settings, setSettings, stamina }: Props) {
    const { staminaPercentage, setStaminaPercentage } = createStamina(stamina);
    // const { gameTimer, setGameTimer } = createTimer(game);
    const [enemies, setEnemies] = createSignal<any[]>([]);
    const [showTutorial, setShowTutorial] = createSignal<boolean>(false);
    const [tutorial, setTutorial] = createSignal<string>('');
    const [asceanState, setAsceanState] = createSignal({
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

    function updateAsceanState(ascean: Accessor<Ascean>) {
        setAsceanState({
            ...asceanState(),
            ascean: ascean(),
            experience: ascean().experience,
            experienceNeeded: ascean().level * 1000,
            currency: ascean().currency,
            firewater: ascean().firewater,
            currentHealth: ascean().health.current,
            mastery: ascean().mastery,
            avarice: combat().prayerData.length > 0 ? combat().prayerData.includes('Avarice') : false,
            opponent: 0,
            opponentExp: 0,
            constitution: 0,
            strength: 0,
            agility: 0,
            achre: 0,
            caeren: 0,
            kyosir: 0,
        });
    };

    onMount(() => {
        if (!ascean().tutorial.boot) {
            setTutorial('boot');
            setShowTutorial(true);
        };
    });
 
    // const clearNPC = async () => {
    //     if (game().merchantEquipment.length > 0) {
    //         await deleteEquipment(game().merchantEquipment);
            // dispatch(setMerchantEquipment([])); 
        // };
        // dispatch(clearNpc()); 
        // dispatch(setCurrentNodeIndex(0));
    // };  

    // const deleteEquipment = async (eqp) => await eqpAPI.deleteEquipment(eqp); 
    // const showDialog = async (e) => dispatch(setDialogTag(e));
    // const updateCombatTimer = (e: number) => setCombat({...(combat), combatTimer: e}); 

    const sendEnemyData = async () => EventBus.emit('get-enemy', combat().computer);
    const sendSettings = async () => EventBus.emit('get-settings', settings);
    const updateStamina = (e: number) => setStaminaPercentage(staminaPercentage() - e <= 0 ? 0 : staminaPercentage() - e);

    function initiateCombat(e: { type: string; data: any }) {
        try {    
            console.log(e, 'Initiating Combat');
            let playerWin: boolean = false, computerWin: boolean = false, res: Combat = { ...combat() };
            switch (e.type) {
                case 'Weapon':
                    console.log(e.data, 'Weapon Action')
                    const weapon = { ...combat(), [e.data.key]: e.data.value };
                    res = weaponActionCompiler(weapon) as Combat;
                    console.log(res.playerEffects, 'Weapon Action')
                    EventBus.emit('blend-combat', res);
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    break;
                case 'Prayer':
                    const pray = { ...combat(), playerEffects: e.data };
                    res = consumePrayer(pray) as Combat;
                    console.log(res.playerEffects, 'Prayer Action')
                    EventBus.emit('blend-combat', { newPlayerHealth: res.newPlayerHealth, playerEffects: res.playerEffects });
                    playerWin = res.playerWin;
                    break;
                case 'Instant':
                    let insta = { ...combat(), playerBlessing: e.data };
                    insta = instantActionCompiler(insta) as Combat;
                    console.log(insta, 'Instant Action')
                    console.log(insta.playerEffects, 'Instant Action')
                    playerWin = insta.playerWin;
                    res = { ...res, ...insta };
                    // console.log(res, 'Instant Action');
                    EventBus.emit('blend-combat', insta);
                    break;
                case 'Player': // 'Player Blind Attack' i.e. hitting a non targeted enemy
                    const { playerAction, enemyID, ascean, damageType, combatStats, weapons, health, actionData } = e.data;
                    let playerData = {
                        action: playerAction.action,
                        counterGuess: playerAction.counter,
                        computer: ascean,
                        computerAttributes: combatStats.attributes,
                        computerWeaponOne: combatStats.combatWeaponOne,
                        computerWeaponTwo: combatStats.combatWeaponTwo,
                        computerWeaponThree: combatStats.combatWeaponThree,
                        newComputerHealth: health,
                        computerHealth: combatStats.healthTotal,
                        computerDefense: combatStats.defense,
                        computerWeapons: weapons,
                        computerAction: actionData.action,
                        computerCounterGuess: actionData.counter,
                        computerDamageType: damageType,
                        computerEffects: [],
                        enemyID: enemyID, // Was ''
                    };
                    res = { ...combat(), ...playerData };
                    res = weaponActionCompiler(res) as Combat;
                    console.log(res.playerEffects, 'Player Action')
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
                        counterSuccess: res.counterSuccess,
                        glancingBlow: res.glancingBlow,
                        dualWielding: res.dualWielding,
                        playerEffects: res.playerEffects,
                    });

                    playerWin = res.playerWin;
                    break;
                case 'Tshaeral':
                    const drained = Math.round(combat().playerHealth * (3 / 100));
                    const newPlayerHealth = combat().newPlayerHealth + drained > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + drained;
                    const newComputerHealth = combat().newComputerHealth - drained < 0 ? 0 : combat().newComputerHealth - drained;
                    playerWin = newComputerHealth === 0;
                    res.playerWin = playerWin;
                    console.log(drained, newPlayerHealth, newComputerHealth, playerWin, 'Tshaeral Drain');
                    EventBus.emit('blend-combat', { newPlayerHealth, newComputerHealth, playerWin });
                    break;
                case 'Health':
                    let { key, value } = e.data;
                    switch (key) {
                        case 'player':
                            const healed = Math.floor(combat().playerHealth * (value / 100));
                            const newPlayerHealth = combat().newPlayerHealth + healed > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + healed;
                            EventBus.emit('blend-combat', { newPlayerHealth });
                            break;
                        case 'enemy':
                            console.log(`Enemy Health: ${value}`);
                            EventBus.emit('update-combat-state', { key: 'newComputerHealth',  value });
                            break;
                        default:
                            break;
                    };
                    break;
                case 'Enemy':
                    let enemyData = {
                        computer: e.data.enemy,
                        computerAttributes: e.data.combatStats.attributes,
                        computerWeaponOne: e.data.combatStats.combatWeaponOne,
                        computerWeaponTwo: e.data.combatStats.combatWeaponTwo,
                        computerWeaponThree: e.data.combatStats.combatWeaponThree,
                        newComputerHealth: e.data.health,
                        computerHealth: e.data.combatStats.healthTotal,
                        computerDefense: e.data.combatStats.defense,
                        computerWeapons: e.data.weapons,
                        computerAction: e.data.actionData.action,
                        computerCounterGuess: e.data.actionData.counter,
                        computerDamageType: e.data.damageType,
                        computerEffects: [],
                        enemyID: e.data.enemyID,
                    };
                    res = { ...combat(), ...enemyData };
                    res = weaponActionCompiler(res) as Combat;
                    console.log(res.playerEffects, 'Enemy Action')
                    console.log(res, 'Res in Enemy')
                    EventBus.emit('update-combat', res);
                    break;
                default:
                    break;
            };
            if (playerWin || computerWin) resolveCombat(res);
        } catch (err: any) {
            console.log(err, 'Error Initiating Combat');
        }
    };

    async function resolveCombat(res: Combat) {
        try {
            const data = { ...combat(), ...res };
            // const stat = statFiler(data, data.playerWin);
            // const rec = recordCombat(stat);
            // setStatistics(rec);
            if (data.playerWin) {
                const newState = { 
                    ...asceanState(), 
                    currency: ascean().currency,
                    firewater: ascean().firewater,
                    healthCurrent: data.newPlayerHealth,
                    avarice: data.prayerData.length > 0 ? data.prayerData.includes('Avarice') : false 
                };
                const exp = { state: newState, combat: data };
                console.log(exp, 'Experience Gain Request');
                const loot = { enemyID: data.enemyID, level: data?.computer?.level! };
                console.log(loot, 'Loot Drop Request');
                EventBus.emit('gain-experience', exp);
                EventBus.emit('enemy-loot', loot);
            } else {
                const health = { health: data.newPlayerHealth, id: ascean()._id };
                updateHealth(health);
                // if (ascean().tutorial.firstDeath) setTutorial('firstDeath');
            };
        } catch (err: any) {
            console.log(err, 'Error Resolving Combat');
        };
    };   

    function updateHealth(health: { health: number; id: string }) {
        console.log('Permanent Health Update: ', health);
        // EventBus.emit('update-health', health.health);
    };

    function setupNpc(e: any) {
        console.log(e, 'Setting Up NPC');
    };

    function filterEnemies(id: string) {
        let newEnemies = enemies();
        newEnemies = newEnemies.filter((enemy) => {
            console.log(enemy.id === id, 'Filtering Enemies');
            return enemy.id !== id ? true : false;
        });
        setEnemies(newEnemies);
    };

    usePhaserEvent('fetch-button-reorder', () => {
        EventBus.emit('reorder-buttons', { list: settings().actions, type: 'action' });
        EventBus.emit('reorder-buttons', { list: settings().specials, type: 'special' });
    });
    usePhaserEvent('fetch-npc', fetchNpc);
    usePhaserEvent('setup-npc', setupNpc);
    usePhaserEvent('initiate-combat', initiateCombat);
    usePhaserEvent('request-enemy', sendEnemyData);
    usePhaserEvent('request-settings', sendSettings); // requestSettings
    
    // usePhaserEvent('clear-npc', clearNPC);
    // usePhaserEvent('refresh-inventory', refreshInventory);
    // usePhaserEvent('request-inventory', requestInventory);
    // usePhaserEvent('request-lootdrop', lootDrop);
    
    // usePhaserEvent('update-full-request', compile);
    // usePhaserEvent('update-inventory-request', inventoryPopulate);    
    // usePhaserEvent('update-combat-timer', updateCombatTimer);
    // usePhaserEvent('show-dialog', showDialog);
    // usePhaserEvent('update-sound', soundEffects);

    usePhaserEvent('remove-enemy', filterEnemies);
    usePhaserEvent('update-enemies', (e: any) => setEnemies(e));
    usePhaserEvent('update-stamina', updateStamina);
    usePhaserEvent('update-ascean-state' , (e: any) => setAsceanState(e));

    function fetchEnemy(enemy: any) {
        EventBus.emit('setup-enemy', enemy);
        EventBus.emit('tab-target', enemy);    
    };

    // async function loot() {
    //     const loot = await getOneRandom(ascean().level *4);
    //     console.log(loot, 'Loot Drop');
    //     EventBus.emit('add-lootdrop', loot);
    // };

    // loot();

    return (
        <div id='base-ui'>
        <Show when={game().scrollEnabled}>
            <CombatSettings combat={combat} game={game} />
        </Show> 
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
            <StoryAscean settings={settings} setSettings={setSettings} ascean={ascean} asceanState={asceanState} game={game} combatState={combat} />
        </Show>
        <Show when={game().showCombat}>
            <CombatText combat={combat} />
        </Show>
        <SmallHud ascean={ascean} combat={combat} game={game} /> 
        <Show when={game().lootDrops.length > 0 && game().showLoot}>
            <LootDropUI ascean={ascean} game={game} />
        </Show>
        {/* { game().showDialog && game().dialogTag && (   
            <StoryDialog state={combat} deleteEquipment={deleteEquipment} />
        ) } */}
        <Show when={showTutorial()}>
            <TutorialOverlay id={ascean()._id} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} />
        </Show>
        </div>
    );
};