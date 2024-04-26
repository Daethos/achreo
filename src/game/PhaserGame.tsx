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
import { Compiler, asceanCompiler } from '../utility/ascean';
import { deleteEquipment, getAscean, getInventory, populate } from '../assets/db/db';
import { getNpcDialog } from '../utility/dialog';
import { getAsceanTraits } from '../utility/traits';
import { getNodesForNPC, npcIds } from '../utility/DialogNode';
import { fetchNpc } from '../utility/npc';
import { checkDeificConcerns } from '../utility/deities';
import { Statistics } from '../utility/statistics';

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
            console.warn(err, 'Error Dropping Loot');
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
            let hyd = asceanCompiler(update);
            const save: Ascean = {
                ...hyd?.ascean,
                health: {
                    ...hyd?.ascean.health,
                    current: hyd?.ascean.health.max as number,
                    max: hyd?.ascean.health.max as number
                },
            } as Ascean;

            EventBus.emit('update-ascean-state', {
                ...state(),
                ascean: save,
                experience: 0,
                experienceNeeded: save?.level as number * 1000,
                level: save.level,
                constitution: 0,
                strength: 0,
                agility: 0,
                achre: 0,
                caeren: 0,
                kyosir: 0,
                mastery: save.mastery,
                faith: save.faith,
                
            });                
            EventBus.emit('update-ascean', save);
        } catch (err: any) {
            console.warn(err, '<- Error in the Controller Updating the Level!')
        };
    };

    async function deleteMerchantEquipment() {
        try {
            if (game().merchantEquipment.length === 0) return;
            game().merchantEquipment.forEach(async (eqp) => {
                await deleteEquipment(eqp._id);
            });
        } catch (err: any) {
            console.warn(err, 'Error Deleting Merchant Equipment');
        };
    };

    function purchaseItem(purchase: { item: Equipment; cost: { silver: number; gold: number; }; }) {
        try {
            let inventory = Array.from(game().inventory);
            inventory.push(purchase.item);
            let cost = {
                silver: props.ascean().currency.silver - purchase.cost.silver,
                gold: props.ascean().currency.gold - purchase.cost.gold
            };
            cost = rebalanceCurrency(cost);
            const update = {
                ...props.ascean(),
                currency: cost,
                inventory: inventory
            };
            let merchantEquipment = [ ...game().merchantEquipment ];
            merchantEquipment = merchantEquipment.filter((eqp) => eqp._id !== purchase.item._id);
            setGame({ ...game(), merchantEquipment });
            EventBus.emit('update-ascean', update);
            EventBus.emit('purchase-sound');
        } catch (err: any) {
            console.warn('Error Purchasing Item', err.message);
        };
    };

    function sellItem(item: Equipment) {
        try {
            let inventory = Array.from(game().inventory);
            inventory = inventory.filter((eqp) => eqp._id !== item._id);
            let gold: number = 0, silver: number = 0;
            switch (item.rarity) {
                case 'Common': silver = 10; break;
                case 'Uncommon': gold = 1; break;
                case 'Rare': gold = 3; break;
                case 'Epic': gold = 12; break;
                case 'Legendary': gold = 50; break;
                default: break;
            };
            let currency = { 
                silver: props.ascean().currency.silver + silver,
                gold: props.ascean().currency.gold + gold, 
            };
            currency = rebalanceCurrency(currency);
            const update = {
                ...props.ascean(),
                currency: currency,
                inventory: inventory
            };
            
            setGame({
                ...game(),
                merchantEquipment: [ ...game().merchantEquipment, item ]
            });
            EventBus.emit('update-ascean', update);
            EventBus.emit('purchase-sound');
        } catch(err: any) {
            console.warn(err, 'Error Selling Item');
        };
    };

    function rebalanceCurrency(currency: { silver: number; gold: number; }): { silver: number; gold: number; } {
        // while (currency.silver < 0) {
        //     currency.gold -= 1;
        //     currency.silver += 100;
        // };
        // while (currency.gold < 0) {
        //     currency.gold += 1;
        //     currency.silver -= 100;
        // };
        let { silver, gold } = currency;
        if (silver > 99) {
            gold += Math.floor(silver / 100);
            silver = silver % 100;
        };
        return { silver, gold };
    };

    const recordCombat = (stats: any) => {
        let { wins, losses, total, actionData, typeAttackData, typeDamageData, totalDamageData, prayerData, deityData } = stats;
        let statistic = props.ascean().statistics.combat;
        statistic.wins += wins;
        statistic.losses += losses;
        statistic.total += total;
        statistic.actions.attacks += actionData.reduce((count: number, action: string) => action === 'attack' ? count + 1 : count, 0);
        statistic.actions.parries += actionData.reduce((count: number, action: string) => action === 'parry' ? count + 1 : count, 0);
        statistic.actions.dodges += actionData.reduce((count: number, action: string) => action === 'dodge' ? count + 1 : count, 0);
        statistic.actions.postures += actionData.reduce((count: number, action: string) => action === 'posture' ? count + 1 : count, 0);
        statistic.actions.rolls += actionData.reduce((count: number, action: string) => action === 'roll' ? count + 1 : count, 0);
        statistic.actions.invokes += actionData.reduce((count: number, action: string) => action === 'invoke' ? count + 1 : count, 0);
        statistic.actions.prayers += actionData.reduce((count: number, action: string) => action === 'prayer' ? count + 1 : count, 0);
        statistic.actions.consumes += actionData.reduce((count: number, action: string) => action === 'consume' ? count + 1 : count, 0);
        statistic.prayers.buff += prayerData.reduce((count: number, prayer: string) => prayer === 'Buff' ? count + 1 : count, 0);
        statistic.prayers.heal += prayerData.reduce((count: number, prayer: string) => prayer === 'Heal' ? count + 1 : count, 0);
        statistic.prayers.damage += prayerData.reduce((count: number, prayer: string) => prayer === 'Damage' ? count + 1 : count, 0);
        statistic.prayers.debuff += prayerData.reduce((count: number, prayer: string) => prayer === 'Debuff' ? count + 1 : count, 0);
        statistic.attacks.magical += typeAttackData.reduce((count: number, type: string) => type === 'Magic' ? count + 1 : count, 0);
        statistic.attacks.physical += typeAttackData.reduce((count: number, type: string) => type === 'Physical' ? count + 1 : count, 0);
        statistic.attacks.blunt += typeDamageData.reduce((count: number, type: string) => type === 'Blunt' ? count + 1 : count, 0);
        statistic.attacks.pierce += typeDamageData.reduce((count: number, type: string) => type === 'Pierce' ? count + 1 : count, 0);
        statistic.attacks.slash += typeDamageData.reduce((count: number, type: string) => type === 'Slash' ? count + 1 : count, 0);
        statistic.attacks.earth += typeDamageData.reduce((count: number, type: string) => type === 'Earth' ? count + 1 : count, 0);
        statistic.attacks.fire += typeDamageData.reduce((count: number, type: string) => type === 'Fire' ? count + 1 : count, 0);
        statistic.attacks.frost += typeDamageData.reduce((count: number, type: string) => type === 'Frost' ? count + 1 : count, 0);
        statistic.attacks.lightning += typeDamageData.reduce((count: number, type: string) => type === 'Lightning' ? count + 1 : count, 0);
        statistic.attacks.righteous += typeDamageData.reduce((count: number, type: string) => type === 'Righteous' ? count + 1 : count, 0);
        statistic.attacks.spooky += typeDamageData.reduce((count: number, type: string) => type === 'Spooky' ? count + 1 : count, 0);
        statistic.attacks.sorcery += typeDamageData.reduce((count: number, type: string) => type === 'Sorcery' ? count + 1 : count, 0);
        statistic.attacks.wild += typeDamageData.reduce((count: number, type: string) => type === 'Wild' ? count + 1 : count, 0);
        statistic.attacks.wind += typeDamageData.reduce((count: number, type: string) => type === 'Wind' ? count + 1 : count, 0);
        statistic.attacks.total = Math.max(totalDamageData, statistic.attacks.total); 
        statistic.deities.Daethos += deityData.reduce((count: number, deity: string) => deity === 'Daethos' ? count + 1 : count, 0);
        statistic.deities.Achreo += deityData.reduce((count: number, deity: string) => deity === 'Achreo' ? count + 1 : count, 0);
        statistic.deities.Ahnve += deityData.reduce((count: number, deity: string) => deity === "Ahn've" ? count + 1 : count, 0);
        statistic.deities.Astra += deityData.reduce((count: number, deity: string) => deity === 'Astra' ? count + 1 : count, 0);
        statistic.deities.Cambire += deityData.reduce((count: number, deity: string) => deity === 'Cambire' ? count + 1 : count, 0);
        statistic.deities.Chiomyr += deityData.reduce((count: number, deity: string) => deity === 'Chiomyr' ? count + 1 : count, 0);
        statistic.deities.Fyer += deityData.reduce((count: number, deity: string) => deity === 'Fyer' ? count + 1 : count, 0);
        statistic.deities.Ilios += deityData.reduce((count: number, deity: string) => deity === 'Ilios' ? count + 1 : count, 0);
        statistic.deities.Kyngi += deityData.reduce((count: number, deity: string) => deity === "Kyn'gi" ? count + 1 : count, 0);
        statistic.deities.Kyrisos += deityData.reduce((count: number, deity: string) => deity === 'Kyrisos' ? count + 1 : count, 0);
        statistic.deities.Kyrna += deityData.reduce((count: number, deity: string) => deity === "Kyr'na" ? count + 1 : count, 0);
        statistic.deities.Lilos += deityData.reduce((count: number, deity: string) => deity === 'Lilos' ? count + 1 : count, 0);
        statistic.deities.Maanre += deityData.reduce((count: number, deity: string) => deity === "Ma'anre" ? count + 1 : count, 0);
        statistic.deities.Nyrolus += deityData.reduce((count: number, deity: string) => deity === 'Nyrolus' ? count + 1 : count, 0);
        statistic.deities.Quorei += deityData.reduce((count: number, deity: string) => deity === "Quor'ei" ? count + 1 : count, 0);
        statistic.deities.Rahvre += deityData.reduce((count: number, deity: string) => deity === 'Rahvre' ? count + 1 : count, 0);
        statistic.deities.Senari += deityData.reduce((count: number, deity: string) => deity === 'Senari' ? count + 1 : count, 0);
        statistic.deities.Sedyro += deityData.reduce((count: number, deity: string) => deity === "Se'dyro" ? count + 1 : count, 0);
        statistic.deities.Sevas += deityData.reduce((count: number, deity: string) => deity === "Se'vas" ? count + 1 : count, 0);
        statistic.deities.Shrygei += deityData.reduce((count: number, deity: string) => deity === "Shrygei" ? count + 1 : count, 0);
        statistic.deities.Tshaer += deityData.reduce((count: number, deity: string) => deity === 'Tshaer' ? count + 1 : count, 0);
        
        let newStatistics: Statistics = { ...props.ascean().statistics, combat: statistic };
        if (wins > losses && props.ascean().statistics.relationships.deity.name !== '') {
            newStatistics = checkDeificConcerns(props.ascean().statistics, props.ascean().statistics.relationships.deity.name, 'combat', 'value') as Statistics;
        };

        return newStatistics;
    };

    function saveChanges(state: any) {
        try {
            let silver: number = state.currency.silver, gold: number = state.currency.gold, 
                experience: number = state.opponentExp, firewater = { ...props.ascean().firewater };

            let computerLevel: number = state.opponent;
            if (state.avarice) experience *= 1.2;
            let health = state.currentHealth > props.ascean().health.max ? props.ascean().health.max : state.currentHealth;

            if (computerLevel === 1) {
                silver = Math.floor(Math.random() * 2) + 1;
                gold = 0;
            } else if (computerLevel >= 2 && computerLevel <= 10) {
                silver = (Math.floor(Math.random() * 10) + 1) * computerLevel;
                gold = 0;
            } else if (computerLevel > 10 && computerLevel <= 20) {
                if (computerLevel <= 15) {
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

            let currency = rebalanceCurrency({ silver, gold });

            // if (silver > 99) {
            //     gold += Math.floor(silver / 100);
            //     silver = silver % 100;
            // };

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
                currency: currency,
                firewater: firewater,
                inventory: game().inventory
            };
            EventBus.emit('update-ascean', newAscean);
        } catch (err: any) {
            console.warn(err, 'Error Saving Experience');
        };
    };

    const statFiler = (data: Combat) => {
        let stat = {
            wins: data.playerWin ? 1 : 0,
            losses: data.playerWin ? 0 : 1,
            total: 1,
            actionData: data.actionData,
            typeAttackData: data.typeAttackData,
            typeDamageData: data.typeDamageData,
            totalDamageData: data.totalDamageData,
            prayerData: data.prayerData,
            deityData: data.deityData,
        };
        const newStats = recordCombat(stat);
        const update = { 
            ...props.ascean(), 
            statistics: newStats, 
            health: { ...props.ascean().health, current: data.newPlayerHealth } 
        };
        EventBus.emit('update-ascean', update);
    };

    async function swapEquipment(e: { type: string; item: Equipment }) {
        const { type, item } = e;
        const oldEquipment = props.ascean()[type as keyof Ascean] as Equipment;
        const newEquipment = item;
        let newAscean = { ...props.ascean(), [type]: newEquipment };
        let inventory = [ ...game().inventory ];
        inventory = inventory.filter((inv) => inv._id !== newEquipment._id);
        if (!oldEquipment.name.includes('Empty') && !oldEquipment.name.includes('Starter')) {
            inventory.push(oldEquipment);
        } else {
            await deleteEquipment(oldEquipment?._id as string);
        };
        newAscean = { ...newAscean, inventory: inventory };
        
        EventBus.emit('equip-sound');
        EventBus.emit('speed', newAscean);
        EventBus.emit('update-ascean', newAscean);
    };

    function setPlayer(stats: Compiler) {
        const traits = getAsceanTraits(stats.ascean);
        setCombat({
            ...combat(),
            player: { ...stats.ascean, inventory: [] },
            playerHealth: stats.ascean.health.max as number,
            newPlayerHealth: stats.ascean.health.current as number,
            weapons: [stats.combatWeaponOne, stats.combatWeaponTwo, stats.combatWeaponThree],
            weaponOne: stats.combatWeaponOne,
            weaponTwo: stats.combatWeaponTwo,
            weaponThree: stats.combatWeaponThree,
            playerAttributes: stats.attributes,
            playerDefense: stats.defense,
            playerDefenseDefault: stats.defense,
            playerDamageType: stats.combatWeaponOne.damageType?.[0] as string,
        });
        setStamina(stats.attributes.stamina as number);
        setGame({ ...game(), inventory: stats.ascean.inventory, traits: traits, primary: traits.primary, secondary: traits.secondary, tertiary: traits.tertiary });
        EventBus.emit('update-total-stamina', stats.attributes.stamina as number);    
    };

    function requestCombat() {
        try {
            EventBus.emit('request-combat-ready', combat());
        } catch (err: any) {
            console.warn(err, 'Error Requesting Combat');
        };
    };

    async function upgradeItem(data: any) {
        try {
            const item: Equipment[] = await upgradeEquipment(data) as Equipment[];

            let itemsToRemove = data.upgradeMatches;
            if (itemsToRemove.length > 3) {
                itemsToRemove = itemsToRemove.slice(0, 3);
            };
            const itemsIdsToRemove = itemsToRemove.map((itr: Equipment) => itr._id);

            let inventory: Equipment[] = game().inventory?.length > 0 ? [ ...game().inventory ] : [];
            inventory.push(item[0]);

            itemsIdsToRemove.forEach(async (itemID: string) => {
                const itemIndex = inventory.findIndex((item: Equipment) => item._id === itemID);
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

            setGame({ ...game(), inventory: inventory });
            setCombat({
                ...combat(),
                player: { ...combat().player as Ascean, ...update, inventory: [] }
            });
            EventBus.emit('update-ascean', update);
        } catch (err: any) {
            console.warn(err, 'Error Upgrading Item');
        };
    };

    async function createUi(id: string): Promise<void> {
        const fresh = await getAscean(id);
        const pop = await populate(fresh);
        const res = asceanCompiler(pop);
        const cleanCombat: Combat = { 
            ...combat(), 
            player: { ...res?.ascean, inventory: [] } as Ascean, 
            weapons: [res?.combatWeaponOne, res?.combatWeaponTwo, res?.combatWeaponThree],
            playerAttributes: res?.attributes,
            playerDefense: res?.defense,
            playerDefenseDefault: res?.defense,
            weaponOne: res?.combatWeaponOne,
            weaponTwo: res?.combatWeaponTwo,
            weaponThree: res?.combatWeaponThree,
            newPlayerHealth: res?.ascean.health.current as number,
            playerHealth: res?.ascean.health.max as number,
            playerDamageType: res?.combatWeaponOne?.damageType?.[0] as string,
        };
        setCombat(cleanCombat);
        setStamina(res?.attributes?.stamina as number);
        const inventory = await getInventory(id);
        const traits = getAsceanTraits(props.ascean());
        setGame({ ...game(), inventory: inventory, traits: traits, primary: traits.primary, secondary: traits.secondary, tertiary: traits.tertiary });
        EventBus.emit('update-total-stamina', res?.attributes.stamina as number);    
    };

    function enterGame() {
        try  {
            setLive(!live());
        } catch (err: any) {
            console.warn(err, 'Error Entering Game');
        };
    };

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
        EventBus.on('enter-game', enterGame);
        EventBus.on('preload-ascean', createUi)
        EventBus.on('set-player', setPlayer);

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

        EventBus.on('upgrade-item', (data: any) => upgradeItem(data));

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
                persuasionScenario: false,
                luckoutScenario: false,
                playerTrait: '',
                playerWin: false,
                computerWin: false,
                enemyID: ''
            });
        });
        EventBus.on('clear-npc', async () => {
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
                persuasionScenario: false,
                luckoutScenario: false,
                playerTrait: '',
                playerWin: false,
                computerWin: false,
                enemyID: ''
            });
            await deleteMerchantEquipment();
            setGame({ ...game(), merchantEquipment: [], dialogTag: false, currentNode: undefined, currentNodeIndex: 0 });    
        });

        EventBus.on('fetch-enemy', fetchEnemy);
        EventBus.on('fetch-npc', fetchNpc);
        EventBus.on('request-ascean', () => {
            EventBus.emit('ascean', props.ascean());
        });
        EventBus.on('request-combat', requestCombat);
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
                persuasionScenario: e.isPersuaded,
                enemyPersuaded: e.isPersuaded,
                luckoutScenario: e.isLuckout,
                playerLuckout: e.isLuckout,
                playerTrait: e.playerTrait,
                playerWin: e.isDefeated,
                computerWin: e.isTriumphant,
                enemyID: e.id,
            });
            const dialog = getNpcDialog(e.enemy.name);
            setGame({ ...game(), dialog: dialog });
        });
        EventBus.on('setup-npc', (e: any) => {
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
                isEnemy: false,
                isAggressive: false,
                startedAggressive: false,
                persuasionScenario: false,
                luckoutScenario: false,
                playerLuckout: false,
                playerTrait: '',
                playerWin: false,
                computerWin: false,
                enemyID: e.id,
                npcType: e.type,
            });
            const dialog = getNodesForNPC(npcIds[e.type]);
            setGame({ ...game(), dialog: dialog });    
        });

        EventBus.on('changeDamageType', (e: string) => setCombat({ ...combat(), playerDamageType: e }));
        EventBus.on('changePrayer', (e: string) => setCombat({ ...combat(), playerBlessing: e }));
        EventBus.on('changeWeapon', (e: [Equipment, Equipment, Equipment]) => {
            setCombat({ ...combat(), weapons: e, weaponOne: e[0], weaponTwo: e[1], weaponThree: e[2], playerDamageType: e[0].damageType?.[0] as string});
            const update = { ...props.ascean(), weaponOne: e[0], weaponTwo: e[1], weaponThree: e[2] };
            EventBus.emit('update-ascean', update);
        });

        EventBus.on('combat-engaged', (e: boolean) => setCombat({ ...combat(), combatEngaged: e }));
        EventBus.on('delete-merchant-equipment', deleteMerchantEquipment);
        EventBus.on('drink-firewater', () => {
            const newHealth = (combat().newPlayerHealth + (combat().playerHealth * 0.4)) > combat().playerHealth ? combat().playerHealth : combat().newPlayerHealth + (combat().playerHealth * 0.4);
            const newCharges = props.ascean().firewater.current > 0 ? props.ascean().firewater.current - 1 : 0;
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
        EventBus.on('gain-experience', (e: { state: any; }) => saveChanges(e));
        EventBus.on('level-up', (e: any) => levelUp(e));
        EventBus.on('add-loot', (e: Equipment[]) => {
            const newInventory = game().inventory.length > 0 ? [...game().inventory, ...e] : e;
            setGame({ 
                ...game(), 
                inventory: newInventory,
            });
        });
        EventBus.on('clear-loot', () => setGame({ ...game(), lootDrops: [], showLoot: false, showLootIds: [] }));
        EventBus.on('enemy-loot', (e: { enemyID: string; level: number }) => lootDrop(e));
        EventBus.on('interacting-loot', (e: { interacting: boolean; loot: string }) => {
            if (e.interacting) {
                setGame({
                    ...game(),
                    showLootIds: [...game().showLootIds, e.loot],
                    // showLoot: true,
                    lootTag: true,
                });
            } else {
                const updatedShowLootIds = game().showLootIds.filter((id) => id !== e.loot);
                setGame({ 
                    ...game(), 
                    showLootIds: updatedShowLootIds.length > 0 ? updatedShowLootIds : [],
                    showLoot: updatedShowLootIds.length > 0,
                    lootTag: updatedShowLootIds.length > 0,    
                });
            };
        });
        EventBus.on('initiate-input', (e: { key: string; value: string; }) =>  setCombat({ ...combat(), [e.key]: e.value }));
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
        EventBus.on('show-dialogue', () => {
            if (game().scrollEnabled === false && game().showPlayer === false) {
                EventBus.emit('update-pause', !game().showDialog);
            };
            setGame({ 
                ...game(), 
                showDialog: !game().showDialog, 
                smallHud: (!game().showDialog || game().scrollEnabled || game().showPlayer) 
            });
        });
        EventBus.on('show-player', () => {
            if (game().scrollEnabled === false && game().showDialog === false) {
                EventBus.emit('update-pause', !game().showPlayer);
            };
            setGame({ 
                ...game(), 
                showPlayer: !game().showPlayer, 
                smallHud: (!game().showPlayer || game().scrollEnabled || game().showDialog) 
            });
        });
        EventBus.on('toggle-pause', (e: boolean) => setGame({ 
            ...game(), 
            pauseState: e, 
            smallHud: e 
        }));
        EventBus.on('blend-combat', (e: any) => setCombat({ ...combat(), ...e }));
        EventBus.on('blend-game', (e: any) => setGame({ ...game(), ...e }));
        // EventBus.on('update-combat', (e: Combat) => setCombat(e));
        EventBus.on('update-combat-player', (e: any) => {
            setCombat({ 
                ...combat(), 
                player: { ...e.ascean, inventory: [] }, 
                playerHealth: e.ascean.health.max, newPlayerHealth: e.ascean.health.current, 
                playerAttributes: e.attributes, 
                playerDefense: e.defense, 
                playerDefenseDefault: e.defense })
        });
        EventBus.on('update-combat-state', (e: { key: string; value: string }) => setCombat({ ...combat(), [e.key]: e.value }));
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
        EventBus.on('update-health', (e: number) => {
            const update = {
                ...props.ascean(),
                health: { ...props.ascean().health, current: e }
            };
            EventBus.emit('update-ascean', update);
        });
        EventBus.on('add-lootdrop', (e: Equipment[]) => {
            const newLootDrops = game().lootDrops.length > 0 ? [...game().lootDrops, ...e] : e;
            const newLootIds = game().showLootIds.length > 0 ? [...game().showLootIds, ...e.map((loot) => loot._id)] : e.map((loot) => loot._id);
            const cleanInventory = [...game().inventory];
            const newInventory = cleanInventory.length > 0 ? [...cleanInventory, ...e] : e;
            setGame({ 
                ...game(), 
                inventory: newInventory,
                lootDrops: newLootDrops, 
                showLoot: newLootIds.length > 0,
                lootTag: newLootIds.length > 0,
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
                lootTag: updatedLootIds.length > 0,
                showLootIds: updatedLootIds
            });
        });
        EventBus.on('update-lootdrops', (e: Equipment[]) => 
            setGame({ 
                ...game(), 
                lootDrops: game().lootDrops.length > 0 ? [...game().lootDrops, ...e] : e,
                showLoot: e.length > 0,
                lootTag: e.length > 0,
                showLootIds: e.map((loot) => loot._id)
        }));
        EventBus.on('useHighlight', (e: string) => setGame({ ...game(), selectedHighlight: e }));
        EventBus.on('useScroll', () => {
            if (game().showPlayer === false && game().showDialog === false) {
                EventBus.emit('update-pause', !game().scrollEnabled);
            };
            setGame({ 
                ...game(), 
                scrollEnabled: !game().scrollEnabled, 
                smallHud: (!game().scrollEnabled || game().showPlayer || game().showDialog) 
            });
        });

        EventBus.on('create-prayer', (e: any) => {
            setCombat({ ...combat(), playerEffects: combat().playerEffects.length > 0 ? [...combat().playerEffects, e] : [e] });
        });
        EventBus.on('create-enemy-prayer', (e: any) => {
            setCombat({ ...combat(), computerEffects: combat().computerEffects.length > 0 ? [...combat().computerEffects, e] : [e] });
        });
        EventBus.on('purchase-item', purchaseItem);
        EventBus.on('sell-item', sellItem);
        EventBus.on('luckout', (e: { luck: string, luckout: boolean }) => {
            const { luck, luckout } = e;
            console.log(luck, luckout, 'Luckout');
            EventBus.emit('enemy-luckout', { enemy: combat().enemyID, luckout, luck });
            setCombat({ ...combat(), playerLuckout: luckout, playerTrait: luck, luckoutScenario: true });
        });
        EventBus.on('persuasion', (e: { persuasion: string, persuaded: boolean }) => {
            const { persuasion, persuaded } = e;
            console.log(persuasion, persuaded, 'Persuasion');
            EventBus.emit('enemy-persuasion', { enemy: combat().enemyID, persuaded, persuasion });
            setCombat({ ...combat(), playerTrait: persuasion, enemyPersuaded: persuaded, persuasionScenario: true });   
        });

        EventBus.on('record-statistics', (e: Combat) => statFiler(e));

        onCleanup(() => {
            if (instance.game) {
                instance.game.destroy(true);
                setInstance({ game: null, scene: null });
            };
            
            EventBus.removeListener('current-scene-ready');
            EventBus.removeListener('main-menu');
            EventBus.removeListener('enter-game');
            EventBus.removeListener('set-player');
            EventBus.removeListener('add-item');
            EventBus.removeListener('clear-enemy');
            EventBus.removeListener('clear-npc');
            EventBus.removeListener('fetch-enemy');
            EventBus.removeListener('fetch-npc');
            EventBus.removeListener('setup-enemy');  
            EventBus.removeListener('setup-npc');
            EventBus.removeListener('combat-engaged');  
            EventBus.removeListener('delete-merchant-equipment');
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
            EventBus.removeListener('changeDamageType');
            EventBus.removeListener('changePrayer');
            EventBus.removeListener('changeWeapon');
            EventBus.removeListener('selectPrayer');
            EventBus.removeListener('selectDamageType');
            EventBus.removeListener('selectWeapon');
            EventBus.removeListener('set-equipper');
            EventBus.removeListener('show-combat-logs');
            EventBus.removeListener('show-dialogue');
            EventBus.removeListener('show-player');
            EventBus.removeListener('toggle-pause');
            EventBus.removeListener('blend-combat');
            EventBus.removeListener('update-combat-state');
            EventBus.removeListener('update-combat-timer');
            EventBus.removeListener('blend-game');
            // EventBus.removeListener('update-combat');
            EventBus.removeListener('update-health');
            EventBus.removeListener('update-lootdrops');
            EventBus.removeListener('update-caerenic');
            EventBus.removeListener('update-stalwart');
            EventBus.removeListener('update-stealth');
            EventBus.removeListener('useHighlight');
            EventBus.removeListener('useScroll');
            EventBus.removeListener('create-prayer');
            EventBus.removeListener('create-enemy-prayer');
            EventBus.removeListener('purchase-item');
            EventBus.removeListener('sell-item');
            EventBus.removeListener('upgrade-item');
            EventBus.removeListener('luckout');
            EventBus.removeListener('persuasion');
            EventBus.removeListener('record-statistics');
            
        });
    });

    return (
        <>
        <div class="flex-1" id="game-container" ref={gameContainer}></div>
        <Show when={live()}>
            <BaseUI ascean={props.ascean} combat={combat} game={game} settings={props.settings} setSettings={props.setSettings} stamina={stamina} />
        </Show>
        </>
    );
};