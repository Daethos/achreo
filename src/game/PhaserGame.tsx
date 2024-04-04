import { onCleanup, onMount, createSignal, Accessor, Setter, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import StartGame from './main';
import { EventBus } from './EventBus';
import { Menu } from '../utility/screens';
import Ascean from '../models/ascean';
import { Combat, initCombat } from '../stores/combat';
import { fetchEnemy } from '../utility/enemy';
import { GameState, initGame } from '../stores/game';
import Equipment, { getOneRandom, upgradeEquipment } from '../models/equipment';
import Settings from '../models/settings';
import BaseUI from '../ui/BaseUI';
import { asceanCompiler } from '../utility/ascean';
import { deleteEquipment, getInventory } from '../assets/db/db';

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
};

interface IProps {
    currentActiveScene?: (sceneInstance: Phaser.Scene) => void;
    ref?: (instance: IRefPhaserGame) => void; // Optional ref callback prop
    menu: any;
    setMenu: (menu: Menu) => void;
    ascean: Accessor<Ascean>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
};

export const PhaserGame = (props: IProps) => {
    let gameContainer: HTMLDivElement | undefined;
    const [instance, setInstance] = createStore<IRefPhaserGame>({ game: null, scene: null });
    const [combat, setCombat] = createSignal<Combat>(initCombat);
    const [game, setGame] = createSignal<GameState>(initGame);
    const [stamina, setStamina] = createSignal(0);
    const [live, setLive] = createSignal(false);

    async function lootDrop({ enemyID, level }: { enemyID: string; level: number }) {
        try {
            const res = await getOneRandom(level);
            const roll = Math.floor(Math.random() * 101);
            if (!res) {
                console.log('No Loot Dropped');
                return;
            };
            if (roll > 50) {
                let sec = await getOneRandom(level);
                if (!sec) {
                    console.log('No Secondary Loot Dropped');
                    return;
                };
                setGame({ ...game(), lootDrops: [ ...game().lootDrops, res[0], sec[0] ] });
                EventBus.emit('enemyLootDrop',{ enemyID, drops: [res[0], sec[0]] });
            } else {
                setGame({ ...game(), lootDrops: [ ...game().lootDrops, res[0] ] });
                EventBus.emit('enemyLootDrop',{ enemyID, drops: res });
            };
        } catch (err: any) {
            console.log(err, 'Error Dropping Loot');
        };
    };

    function gainExperience({ state, combat }: { state: any; combat: Combat }) {
        try {
            let exp = Math.round((combat?.computer?.level!) * 100 * ((combat?.computer?.level! / combat?.player?.level!)) + (combat?.playerAttributes?.rawKyosir!));
            const avarice = combat.prayerData?.includes?.('Avarice');
            const total = state.ascean.experience + exp;
            const newAsceanState = {
                ...state,
                opponent: combat?.computer?.level,
                opponentExp: exp,
                currentHealth: combat.newPlayerHealth,
                experience: Math.min(total, state.experienceNeeded),
                avarice: avarice                
            };
            console.log(newAsceanState, 'New Ascean State');
            saveChanges(newAsceanState);
        } catch (err: any) {
            console.log(err, 'Error Gaining Experience');
        };
    };

    async function levelUp(state: Accessor<any>) {
        let constitution = Number(state().constitution);
        let strength = Number(state().strength);
        let agility = Number(state().agility);
        let achre = Number(state().achre);
        let caeren = Number(state().caeren);
        let kyosir = Number(state().kyosir);
        let newMastery = state().mastery;
        let statMastery = newMastery.toLowerCase();
        try {
            let update = {
                ...props.ascean(),
                level: state().ascean.level + 1,
                experience: 0,
                constitution: Math.round((state().ascean.constitution + constitution) * (newMastery === 'constitution' ? 1.07 : 1.04)), // 1.04 = +1 stat once the stat is 13 as it rounds up from .52 (1.04 * 13 = 13.52)
                strength: Math.round((state().ascean.strength + strength) * (newMastery === 'strength' ? 1.07 : 1.04)), // 1.07 = +1 stat always, even at base 8. Requires 22 Stat points to increase by 2 / level. 22 * 1.07 = 23.54, rounded up to 24 
                agility: Math.round((state().ascean.agility + agility) * (newMastery === 'agility' ? 1.07 : 1.04)),
                achre: Math.round((state().ascean.achre + achre) * (newMastery === 'achre' ? 1.07 : 1.04)),
                caeren: Math.round((state().ascean.caeren + caeren) * (newMastery === 'caeren' ? 1.07 : 1.04)),
                kyosir: Math.round((state().ascean.kyosir + kyosir) * (newMastery === 'kyosir' ? 1.07 : 1.04)),
                mastery: newMastery, 
                faith: state().faith,
                inventory: game().inventory,
                statistics: {
                    ...state().ascean.statistics,
                    mastery: {
                        ...state().ascean.statistics.mastery,
                        [statMastery]: state().ascean.statistics.mastery[statMastery] + 1,
                    }
                } 
            };
            console.log(update, 'New Level Update');
            const beast = asceanCompiler(update);
            
            EventBus.emit('update-ascean-state', {
                ...state(),
                ascean: beast?.ascean,
                experience: 0,
                experienceNeeded: beast?.ascean.level * 1000,
                level: beast?.ascean.level,
                constitution: 0,
                strength: 0,
                agility: 0,
                achre: 0,
                caeren: 0,
                kyosir: 0,
                mastery: beast?.ascean.mastery,
                faith: beast?.ascean.faith,
                
            });                
            EventBus.emit('update-ascean', update);


            setCombat({
                ...combat(),
                player: beast?.ascean,
                playerHealth: beast?.ascean.health.max,
                newPlayerHealth: beast?.ascean.health.current,
                weapons: [beast?.combatWeaponOne, beast?.combatWeaponTwo, beast?.combatWeaponThree],
                weaponOne: beast?.combatWeaponOne,
                weaponTwo: beast?.combatWeaponTwo,
                weaponThree: beast?.combatWeaponThree,
                playerAttributes: beast?.attributes,
                playerDefense: beast?.defense,
                playerDefenseDefault: beast?.defense,
            });
        } catch (err: any) {
            console.log(err, '<- Error in the Controller Updating the Level!')
        };
    };

    function saveChanges(state: any) {
        try {
            let silver = state.currency.silver, gold = state.currency.gold, experience = state.experience, firewater = { ...props.ascean().firewater };
            let value = state.opponent;
            if (state.avarice) value *= 2;
            let health = state.currentHealth > props.ascean().health.max ? props.ascean().health.max : state.currentHealth;

            if (value === 1) {
                silver = Math.floor(Math.random() * 2) + 1;
                gold = 0;
            } else if (value >= 2 && value <= 10) {
                silver = (Math.floor(Math.random() * 10) + 1) * value;
                gold = 0;
            } else if (value > 10 && value <= 20) {
                if (value <= 15) {
                    if (Math.random() >= 0.5) {
                        silver = Math.floor(Math.random() * 10) + 1;
                        gold = 1;
                    } else {
                        silver = Math.floor(Math.random() * 10) + 35;
                        gold = 0;
                    };
                };
            };

            silver += state.currency.silver;
            gold += state.currency.gold;

            if (silver > 99) {
                gold += Math.floor(silver / 100);
                silver = silver % 100;
            };

            if (props.ascean().firewater.current < 5 && props.ascean().level <= state.opponent) {
                firewater = {
                    current: props.ascean().firewater.current + 1,
                    max: props.ascean().firewater.max
                };
            };

            const newAscean = {
                ...props.ascean(),
                experience: experience,
                health: { ...props.ascean().health, current: health },
                currency: {
                    silver: silver,
                    gold: gold
                },
                firewater: firewater,
                inventory: game().inventory.map((item: Equipment) => item._id)  
            };
            console.log(newAscean, 'New Ascean Changes Saved');

            EventBus.emit('update-ascean', newAscean);
        } catch (err: any) {
            console.log(err, 'Error Saving Experience');
        };
    };

    async function swapEquipment(e: { type: string; item: Equipment }) {
        const { type, item } = e;
        const oldEquipment = props.ascean()[type as keyof Ascean] as Equipment;
        const newEquipment = item;
        const newAscean = { ...props.ascean(), [type]: newEquipment };

        let inventory = [ ...game().inventory ];
        inventory = inventory.filter((inv) => inv._id !== newEquipment._id);
        if (!oldEquipment.name.includes('Empty') && !oldEquipment.name.includes('Starter')) {
            inventory.push(oldEquipment);
        } else {
            console.log('No Equipment to Add -- Default and Destroyed');
            await deleteEquipment(oldEquipment?._id as string);
        };
        
        const update = { ...newAscean, inventory: inventory };

        const res = asceanCompiler(newAscean);
        setCombat({
            ...combat(),
            player: res?.ascean,
            playerHealth: res?.ascean.health.max,
            newPlayerHealth: res?.ascean.health.current,
            weapons: [res?.combatWeaponOne, res?.combatWeaponTwo, res?.combatWeaponThree],
            weaponOne: res?.combatWeaponOne,
            weaponTwo: res?.combatWeaponTwo,
            weaponThree: res?.combatWeaponThree,
            playerAttributes: res?.attributes,
            playerDefense: res?.defense,
            playerDamageType: res?.combatWeaponOne?.damageType?.[0] as string
        });
        setGame({ ...game(), inventory: inventory });
        setStamina(res?.attributes?.stamina as number);

        EventBus.emit('speed', res?.ascean);
        EventBus.emit('update-ascean', update);
        EventBus.emit('update-full-request');
        EventBus.emit('equip-sound');
    };

    async function createUi() {
        const res = asceanCompiler(props.ascean());
        const cleanCombat: Combat = { 
            ...combat(), 
            player: res?.ascean, 
            weapons: [res?.combatWeaponOne, res?.combatWeaponTwo, res?.combatWeaponThree],
            playerAttributes: res?.attributes,
            playerDefense: res?.defense,
            playerDefenseDefault: res?.defense,
            weaponOne: res?.combatWeaponOne,
            weaponTwo: res?.combatWeaponTwo,
            weaponThree: res?.combatWeaponThree,
            newPlayerHealth: res?.ascean.health.current,
            playerHealth: res?.ascean.health.max,
            playerDamageType: res?.combatWeaponOne?.damageType?.[0] as string,
        };
        setCombat(cleanCombat);
        setStamina(res?.attributes?.stamina as number);
        const inventory = await getInventory(props.ascean()._id);
        setGame({ ...game(), inventory: inventory });
    };
    
    createUi();

    onMount(() => {
        const gameInstance = StartGame("game-container");
        setInstance("game", gameInstance);

        if (props.ref) {
            props.ref({ game: gameInstance, scene: null });
        };

        EventBus.on('current-scene-ready', (sceneInstance: Phaser.Scene) => {
            if (props.currentActiveScene) {
                props.currentActiveScene(sceneInstance);
                setInstance("scene", sceneInstance);
            };

            if (props.ref) {
                props.ref({ game: gameInstance, scene: sceneInstance });
            };
        });

        EventBus.on('main-menu', (_sceneInstance: Phaser.Scene) => props.setMenu({ ...props?.menu, gameRunning: false }));
        EventBus.on('start-game', () => setLive(!live()));

        EventBus.on('add-item', (e: Equipment[]) => {
            const cleanInventory = [...game().inventory];
            const newInventory = cleanInventory.length > 0 ? [...cleanInventory, ...e] : e;
            setGame({ 
                ...game(), 
                inventory: newInventory 
            });
            const update = { ...props.ascean(), inventory: newInventory };
            EventBus.emit('update-ascean', update);
        });

        EventBus.on('upgrade-item', async (data: any) => {
            const item = await upgradeEquipment(data);
            console.log(item, 'Upgraded Equipment');

            let itemsToRemove = data.upgradeMatches;
    
            if (itemsToRemove.length > 3) {
                itemsToRemove = itemsToRemove.slice(0, 3);
            };
            const itemsIdsToRemove = itemsToRemove.map((itr: Equipment) => itr._id);

            let inventory: Equipment[] = props.ascean().inventory.length > 0 ? [...props.ascean().inventory, ...(item as Equipment[])] : item as Equipment[];

            itemsIdsToRemove.forEach(async (itemID: string) => {
                console.log(itemID, 'Item ID to Remove and Delete');
                const itemIndex = inventory.findIndex((item: Equipment) => item._id === itemID);
                console.log(itemIndex, 'Item Index')
                inventory.splice(itemIndex, 1);
                await deleteEquipment(itemID);
            });

            let gold = 0;
            if (item?.[0].rarity === 'Uncommon') {
                gold = 1;
            } else if (item?.[0].rarity === 'Rare') {
                gold = 3;
            } else if (item?.[0].rarity === 'Epic') {
                gold = 12;
            } else if (item?.[0].rarity === 'Legendary') {
                gold = 60;
            };

            const update = { ...props.ascean(), inventory: inventory, currency: { ...props.ascean().currency, gold: props.ascean().currency.gold - gold } };

            console.log(update, 'New Inventory');
            setGame({ ...game(), inventory: inventory });
            setCombat({
                ...combat(),
                player: { ...combat().player as Ascean, ...update }
            });
            EventBus.emit('update-ascean', update);
        })

        EventBus.on('clear-enemy', () => {
            setCombat({
                ...combat(),
                computer: undefined,
                computerHealth: 0,
                newComputerHealth: 0,
                computerWeapons: [],
                computerAttributes: undefined,
                computerDefense: undefined,
                computerDamageType: '',
                isEnemy: false,
                npcType: '',
                enemyPersuaded: false,
                playerLuckout: false,
                combatEngaged: false,
                isAggressive: false,
                startedAggressive: false,
                playerWin: false,
                computerWin: false,
                enemyID: ''
            });
        });

        EventBus.on('fetch-enemy', fetchEnemy);
        EventBus.on('request-ascean', () => {
            const res = asceanCompiler(props.ascean());
            EventBus.emit('ascean', res?.ascean);
        });
        EventBus.on('request-combat', () => {
            const res = asceanCompiler(props.ascean());
            const cleanCombat: Combat = { 
                ...combat(), 
                player: res?.ascean, 
                weapons: [res?.combatWeaponOne, res?.combatWeaponTwo, res?.combatWeaponThree],
                playerAttributes: res?.attributes,
                playerDefense: res?.defense,
                playerDefenseDefault: res?.defense,
                weaponOne: res?.combatWeaponOne,
                weaponTwo: res?.combatWeaponTwo,
                weaponThree: res?.combatWeaponThree,
            };
            setCombat(cleanCombat);
            setStamina(res?.attributes?.stamina as number);
            EventBus.emit('combat', cleanCombat)
        });
        EventBus.on('request-game', () => EventBus.emit('game', game()));

        EventBus.on('setup-enemy', (e: any) => {
            setCombat({
                ...combat(),
                computer: e.game,
                computerHealth: e.enemy.attributes.healthTotal,
                newComputerHealth: e.health,
                computerWeapons: [e.enemy.combatWeaponOne, e.enemy.combatWeaponTwo, e.enemy.combatWeaponThree],
                computerWeaponOne: e.enemy.combatWeaponOne,
                computerWeaponTwo: e.enemy.combatWeaponTwo,
                computerWeaponThree: e.enemy.combatWeaponThree,
                computerAttributes: e.enemy.attributes,
                computerDefense: e.enemy.defense,
                computerDefenseDefault: e.enemy.defense,
                computerDamageType: e.enemy.combatWeaponOne.damageType[0],
                isEnemy: true,
                npcType: '',
                isAggressive: e.isAggressive,
                startedAggressive: e.startedAggressive,
                playerWin: e.isDefeated,
                computerWin: e.isTriumphant,
                enemyID: e.id
            })
        });

        EventBus.on('changeDamageType', (e: string) => setCombat({ ...combat(), playerDamageType: e }));
        EventBus.on('changePrayer', (e: string) => setCombat({ ...combat(), playerBlessing: e }));
        EventBus.on('changeWeapon', (e: [Equipment, Equipment, Equipment]) => {
            setCombat({ ...combat(), weapons: e, weaponOne: e[0], weaponTwo: e[1], weaponThree: e[2] });
            const update = { ...props.ascean(), weaponOne: e[0], weaponTwo: e[1], weaponThree: e[2] };
            EventBus.emit('update-ascean', update);
        });

        EventBus.on('drink-firewater', () => {
            const newHealth = (combat().newPlayerHealth + (combat().playerHealth * 0.4)) > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + (combat().playerHealth * 0.4);
            const newCharges = props.ascean().firewater.current > 0 ? props.ascean().firewater.current - 1 : 0;
            console.log(newHealth, newCharges, 'Firewater');
            console.log(game().inventory, 'Current Inventory')
            const inventory = game()?.inventory?.length > 0 ? game().inventory.map((item) => item && item._id) : [];
            setCombat({ ...combat(), newPlayerHealth: newHealth, 
                player: { ...combat().player as Ascean, health: { ...props.ascean().health, current: newHealth } } });
            const newAscean = { 
                ...props.ascean(), 
                firewater: { ...props.ascean().firewater, current: newCharges }, 
                health: { ...props.ascean().health, current: newHealth }, 
                inventory: inventory
            };
            EventBus.emit('update-ascean', newAscean);
        });
        EventBus.on('gain-experience', (e: { state: any; combat: Combat }) => gainExperience(e));
        EventBus.on('level-up', (e: any) => levelUp(e));
        EventBus.on('add-loot', (e: Equipment[]) => {
            console.log(e[0].name, e[0]._id, 'Loot Drop')
            const newInventory = game().inventory.length > 0 ? [...game().inventory, ...e] : e;
            setGame({ 
                ...game(), 
                inventory: newInventory,
            })
        });
        EventBus.on('clear-loot', () => setGame({ ...game(), lootDrops: [], showLoot: false, showLootIds: [] }));
        EventBus.on('enemy-loot', (e: { enemyID: string; level: number }) => lootDrop(e));
        EventBus.on('interacting-loot', (e: { interacting: boolean; loot: string }) => {
            if (e.interacting) {
                setGame({
                    ...game(),
                    showLootIds: [...game().showLootIds, e.loot],
                    showLoot: true
                });
            } else {
                const updatedShowLootIds = game().showLootIds.filter((id) => id !== e.loot);
                setGame({ 
                    ...game(), 
                    showLootIds: updatedShowLootIds.length > 0 ? updatedShowLootIds : [],
                    showLoot: updatedShowLootIds.length > 0
                });
            };
        });
        EventBus.on('initiate-input', (e: { key: string; value: string; }) => setCombat({ ...combat(), [e.key]: e.value }));
        EventBus.on('refresh-inventory', async (e: Equipment[]) => {
            setGame({ ...game(), inventory: e });
            const update = { ...props.ascean(), inventory: e };
            EventBus.emit('update-ascean', update);
        });
        EventBus.on('selectPrayer', (e: any) => setGame({ ...game(), selectedPrayerIndex: e.index, selectedHighlight: e.highlight }));
        EventBus.on('selectDamageType', (e: any) => setGame({ ...game(), selectedDamageTypeIndex: e.index, selectedHighlight: e.highlight }));
        EventBus.on('selectWeapon', (e: any) => setGame({ ...game(), selectedWeaponIndex: e.index, selectedHighlight: e.highlight }));
        EventBus.on('set-equipper', (e: any) => swapEquipment(e));
        EventBus.on('show-combat-logs', (e: boolean) => setGame({ ...game(), showCombat: e }));
        EventBus.on('show-player', () => {
            // pause the game
            EventBus.emit('update-pause', !game().showPlayer);
            setGame({ ...game(), showPlayer: !game().showPlayer })
        });
        EventBus.on('toggle-pause', () => setGame({ ...game(), pauseState: !game().pauseState }));
        EventBus.on('blend-combat', (e: any) => setCombat({ ...combat(), ...e }));
        EventBus.on('update-combat', (e: Combat) => setCombat(e));
        EventBus.on('update-combat-player', (e: any) => setCombat({ ...combat(), player: e.ascean, playerHealth: e.ascean.health.max, newPlayerHealth: e.ascean.health.current, playerAttributes: e.attributes, playerDefense: e.defense, playerDefenseDefault: e.defense }));
        EventBus.on('update-combat-state', (e: { key: string; value: string }) => {
            setCombat({ ...combat(), [e.key]: e.value });
        });
        EventBus.on('update-combat-timer', (e: number) => setCombat({ ...combat(), combatTimer: e }));

        EventBus.on('update-caerenic', () => {
            setCombat({ ...combat(), isCaerenic: !combat().isCaerenic })
        });
        EventBus.on('update-stalwart', () => {
            setCombat({ ...combat(), isStalwart: !combat().isStalwart })
        });      
        EventBus.on('update-stealth', () => {
            setCombat({ ...combat(), isStealth: !combat().isStealth });
            EventBus.emit('stealth-sound');
        });
        EventBus.on('update-health', (e: number) => setCombat({ ...combat(), e }));
        EventBus.on('add-lootdrop', (e: Equipment[]) => {
            const newLootDrops = game().lootDrops.length > 0 ? [...game().lootDrops, ...e] : e;
            const newLootIds = game().showLootIds.length > 0 ? [...game().showLootIds, ...e.map((loot) => loot._id)] : e.map((loot) => loot._id);
            const cleanInventory = [...game().inventory];
            const newInventory = cleanInventory.length > 0 ? [...cleanInventory, ...e] : e;
            newInventory.forEach((item) => console.log(item.name, item._id, 'Item'));
            setGame({ 
                ...game(), 
                inventory: newInventory,
                lootDrops: newLootDrops, 
                showLoot: newLootIds.length > 0,
                showLootIds: newLootIds
            });
            const update = { ...props.ascean(), inventory: newInventory };
            EventBus.emit('update-ascean', update);
        });
        EventBus.on('remove-lootdrop', (e: string) => {
            let updatedLootIds = [...game().showLootIds];
            updatedLootIds = updatedLootIds.filter(id => id !== e);
            let updatedLootDrops = [...game().lootDrops];
            updatedLootDrops = updatedLootDrops.filter((loot) => loot._id !== e);

            setGame({
                ...game(),
                lootDrops: updatedLootDrops,
                showLoot: updatedLootIds.length > 0,
                showLootIds: updatedLootIds
            });
        });
        EventBus.on('update-lootdrops', (e: Equipment[]) => 
            setGame({ 
                ...game(), 
                lootDrops: game().lootDrops.length > 0 ? [...game().lootDrops, ...e] : e,
                showLoot: e.length > 0,
                showLootIds: e.map((loot) => loot._id)
        }));
        EventBus.on('useHighlight', (e: string) => setGame({ ...game(), selectedHighlight: e }));
        EventBus.on('useScroll', (e: boolean) => setGame({ ...game(), scrollEnabled: e }));

        EventBus.on('create-prayer', (e: any) => {
            setCombat({ ...combat(), playerEffects: combat().playerEffects.length > 0 ? [...combat().playerEffects, e] : [e] });
        });
        EventBus.on('create-enemy-prayer', (e: any) => {
            setCombat({ ...combat(), computerEffects: combat().computerEffects.length > 0 ? [...combat().computerEffects, e] : [e] });
        });

        onCleanup(() => {
            if (instance.game) {
                instance.game.destroy(true);
                setInstance({ game: null, scene: null });
            };
            
            EventBus.removeListener('current-scene-ready');
            EventBus.removeListener('main-menu');
            EventBus.removeListener('start-game');
            EventBus.removeListener('add-item');
            EventBus.removeListener('clear-enemy');
            EventBus.removeListener('fetch-enemy');   
            EventBus.removeListener('drink-firewater'); 
            EventBus.removeListener('gain-experience');
            EventBus.removeListener('add-lootdrop');
            EventBus.removeListener('clear-loot');
            EventBus.removeListener('enemy-loot');
            EventBus.removeListener('interacting-loot');
            EventBus.removeListener('initiate-input');
            EventBus.removeListener('request-game');
            EventBus.removeListener('request-ascean');    
            EventBus.removeListener('request-combat');  
            EventBus.removeListener('setup-enemy');  
            EventBus.removeListener('changeDamageType');
            EventBus.removeListener('changePrayer');
            EventBus.removeListener('changeWeapon');
            EventBus.removeListener('selectPrayer');
            EventBus.removeListener('selectDamageType');
            EventBus.removeListener('selectWeapon');
            EventBus.removeListener('set-equipper');
            EventBus.removeListener('show-combat-logs');
            EventBus.removeListener('show-player');
            EventBus.removeListener('toggle-pause');
            EventBus.removeListener('blend-combat');
            EventBus.removeListener('update-combat-state');
            EventBus.removeListener('update-combat-timer');
            EventBus.removeListener('update-combat');
            EventBus.removeListener('update-health');
            EventBus.removeListener('update-lootdrops');
            EventBus.removeListener('update-caerenic');
            EventBus.removeListener('update-stalwart');
            EventBus.removeListener('update-stealth');
            EventBus.removeListener('useHighlight');
            EventBus.removeListener('useScroll');
            EventBus.removeListener('create-prayer');
            EventBus.removeListener('create-enemy-prayer');
        });
    });

    return (
        <>
        <Show when={live()}>
            <BaseUI ascean={props.ascean} combat={combat} game={game} settings={props.settings} setSettings={props.setSettings} stamina={stamina} />
        </Show>
        <div class="flex-1" id="game-container" ref={gameContainer}></div>
        </>
    );
};