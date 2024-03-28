import { Accessor, Setter, Show, createEffect, createSignal } from 'solid-js';
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
import Equipment, { getOneRandom } from '../models/equipment';
import EnemyPreview from './EnemyPreview';
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
    const [asceanState, setAsceanState] = createSignal({
        ascean: ascean(),
        experience: ascean().experience,
        experienceNeeded: ascean().level * 1000,
        currency: ascean().currency,
        firewater: ascean().firewater,
        currentHealth: ascean().health.current,
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
        updateCombatListener(combat());
    });  

    // function destroyGame() {
    //     console.log('<--- Destroying Phaser Game --->');
    //     // const game = gameRef?.current;
    //     // if (!game) return;
    //     // console.log(game, 'Game')
    //     // const scene = game()?.scene?.getScene('Play');
    //     // for (let i = 0; i < scene.enemies.length; i++) {
    //     //     scene.enemies[i].cleanUp();
    //     // };
    //     // for (let i = 0; i < scene.npcs.length; i++) {
    //     //     scene.npcs[i].cleanUp();
    //     // };
    //     // scene.player.cleanUp();
    //     // scene.cleanUp();
    //     // while (game().firstChild) {
    //     //     game().removeChild(game().firstChild);
    //     // };
    //     // game().destroy(true);
    //     // gameRef.current = null;
    // };
 
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
    const updateCombatListener = (data: Combat) => EventBus.emit('combat', data); // Was Async
    const updateStamina = (e: number) => setStaminaPercentage(staminaPercentage() - e <= 0 ? 0 : staminaPercentage() - e);

    // async function requestInventory() {
    //     try {
    //         // const inventory = await getInventory(ascean()._id);
    //         // EventBus.emit('get-inventory', inventory);
    //     } catch (err: any) {
    //         console.log(err, 'Error Updating Inventory');
    //     };
    // };

    // async function saveInventory(inventory: Equipment[]) {
    //     try {
    //         const newInventory = inventory.map((item) => item._id);
    //         await updateInventory(ascean()._id, flattenedInventory);
    //     } catch (err: any) {
    //         console.log(err, 'Error Saving Inventory');
    //     };
    // };

    // async function refreshInventory(freshInventory: Equipment[]) {
    //     try {
    //         setGame({ ...game, inventory: freshInventory });
    //     } catch (err: any) {
    //         console.log(err, 'Error Refreshing Inventory');
    //     };
    // };

    function initiateCombat(e: { type: string; data: any }) {
        try {    
            console.log(e, 'Initiating Combat');
            let playerWin: boolean = false, computerWin: boolean = false, res: Combat = initCombat;
            switch (e.type) {
                case 'Weapon':
                    const weapon = { ...combat(), [e.data.key]: e.data.value };
                    res = weaponActionCompiler(weapon) as Combat;
                    EventBus.emit('update-combat', { ...combat(), ...res });
                    playerWin = res.playerWin;
                    computerWin = res.computerWin;
                    break;
                case 'Prayer':
                    const pray = { ...combat(), playerEffects: e.data };
                    res = consumePrayer(pray) as Combat;
                    EventBus.emit('update-combat', { ...combat, newPlayerHealth: res.newPlayerHealth, playerEffects: res.playerEffects });
                    playerWin = res.playerWin;
                    break;
                    case 'Instant':
                        const insta = { ...combat(), playerBlessing: e.data };
                    res = instantActionCompiler(insta) as Combat;
                    // setCombat({ ...(combat), ...res });
                    playerWin = res.playerWin;
                    // res = prayerSplitter((combat), e.data);
                    console.log(res, 'Instant Action');
                    EventBus.emit('update-combat', res);
                    // EventBus.emit('update-combat', res);
                    break;
                case 'Player': // 'Player Blind Attack' i.e. hitting a non targeted enemy
                    const { playerAction, enemyID, ascean, damageType, combatStats, weapons, health, actionData } = e.data;
                    let enemyData = {
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
                    res = { ...combat(), ...enemyData };
                    res = weaponActionCompiler(res) as Combat;
                    EventBus.emit('update-combat', res);
                    // setPlayerActions(res); || Below is what setPlayerActions does
                    EventBus.emit('update-combat', {
                        ...combat,
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
                    console.log(drained, newPlayerHealth, newComputerHealth, playerWin, 'Tshaeral Drain');
                    EventBus.emit('update-combat', { ...combat, newPlayerHealth: newPlayerHealth, newComputerHealth: newComputerHealth, playerWin: playerWin });
                    break;
                case 'Health':
                    let { key, value } = e.data;
                    switch (key) {
                        case 'player':
                            const healed = Math.floor(combat().playerHealth * (value / 100));
                            const newPlayerHealth = combat().newPlayerHealth + healed > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + healed;
                            EventBus.emit('update-combat', { ...combat, newPlayerHealth: newPlayerHealth });
                            break;
                        case 'computer':
                            const healedComputer = Math.floor(combat().computerHealth * (value / 100));
                            const newComputerHealth = combat().newComputerHealth + healedComputer > combat().computerHealth ? combat().computerHealth : combat().newComputerHealth + healedComputer;
                            EventBus.emit('update-combat', { ...combat, newComputerHealth: newComputerHealth });
                            break;
                        default:
                            break;
                    };
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
            const data = { ...combat, ...res };
            // const stat = statFiler(data, data.playerWin);
            // const rec = recordCombat(stat);
            // setStatistics(rec);
            if (data.playerWin) {
                const exp = { state: asceanState, combat: combat };
                const loot = { enemyID: combat().enemyID, level: combat()?.computer?.level! };
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
        console.log(enemies(), 'Filtering Enemies')
        let newEnemies = enemies();
        newEnemies = newEnemies.filter((enemy) => {
            console.log(enemy.id === id, 'Filtering Enemies');
            return enemy.id !== id ? true : false;
        });
        console.log(newEnemies, 'New Enemies');
        setEnemies(newEnemies);
    };

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
    usePhaserEvent('update-action', (e: any) => setSettings({ ...settings(), actions: e }));
    usePhaserEvent('update-enemies', (e: any) => setEnemies(e));
    usePhaserEvent('update-stamina', updateStamina);
    usePhaserEvent('update-special', (e: any) => setSettings({ ...settings(), specials: e }));
    usePhaserEvent('update-ascean-state' , (e: any) => setAsceanState(e));

    function lootDrop() {
        let loot = getOneRandom(ascean().level) ?? [];
        let lootTwo = getOneRandom(ascean().level) ?? [];
        let lootThree = getOneRandom(ascean().level) ?? [];
        loot.push(lootTwo[0] as Equipment);
        loot.push(lootThree[0] as Equipment);
        console.log(loot, 'Loot Drop');
        EventBus.emit('add-lootdrop', loot);
    };

    lootDrop();

    function fetchEnemy(enemy: any) {
        console.log(enemy.id, enemy.game.name, 'fetchEnemy');
        EventBus.emit('setup-enemy', enemy);
        EventBus.emit('tab-target', enemy);    
    };

    return (
        <div id='base-ui'>
        <Show when={game().scrollEnabled}>
            <CombatSettings combat={combat} game={game} />
        </Show> 
        <Show when={game().showPlayer} fallback={
            <div style={{ position: "absolute", 'z-index': 1 }}>
                <CombatUI state={combat} staminaPercentage={staminaPercentage} pauseState={game().pauseState} stamina={stamina} />
                <Show when={combat().computer} fallback={
                    <EnemyPreview enemies={enemies} fetchEnemy={fetchEnemy} />
                }>
                    <EnemyUI state={combat} pauseState={game().pauseState} enemies={enemies} />
                </Show> 
            </div>
        }>
            <StoryAscean settings={settings} setSettings={setSettings} ascean={ascean} asceanState={asceanState} game={game} combatState={combat} />
        </Show>
        <Show when={game().showCombat}>
            <CombatText combat={combat} />
        </Show>
        <SmallHud combat={combat} game={game} /> 
        <Show when={game().lootDrops.length > 0 && game().showLoot}>
            <LootDropUI game={game} />
        </Show>
        {/* { game().showDialog && game().dialogTag && (   
            <StoryDialog state={combat} deleteEquipment={deleteEquipment} />
        ) }
        { game().tutorial && ( 
            <StoryTutorial tutorial={game().tutorial} dispatch={dispatch} player={game().player}  /> 
        ) } */}
        </div>
    );
};