import { onCleanup, onMount, createSignal, Accessor, Setter, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import StartGame from './main';
import { EventBus } from './EventBus';
import { Menu } from '../utility/screens';
import Ascean from '../models/ascean';
import { Combat, initCombat } from '../stores/combat';
import { fetchEnemy } from '../utility/enemy';
import { GameState, initGame } from '../stores/game';
import Equipment, { getOneRandom } from '../models/equipment';
import Settings from '../models/settings';
import BaseUI from '../ui/BaseUI';
import { asceanCompiler } from '../utility/ascean';

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

    function lootDrop({ enemyID, level }: { enemyID: string; level: number }) {
        try {
            const res = getOneRandom(level);
            const roll = Math.floor(Math.random() * 101);
            if (!res) {
                console.log('No Loot Dropped');
                return;
            };
            if (roll > 50) {
                let sec = getOneRandom(level);
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
            const avarice = combat.prayerData.includes('Avarice');
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
            // setAsceanState({
            //     ...state,
            //     experience: res.experience,
            //     currentHealth: res.health.current,
            //     avarice: false,
            //     opponent: 0,
            //     opponentExp: 0
            // });
        } catch (err: any) {
            console.log(err, 'Error Gaining Experience');
        };
    };

    function saveChanges(state: any) {
        try {
            let silver = 0, gold = 0, experience = 0, firewater = { current: 0, max: 0 };
            let value = state.opponent;
            if (state.avarice) value *= 2;
            let health = state.currentHealth > props.ascean().health.max ? props.ascean().health.max : state.currentHealth;
            if (value === 1) {
                silver = Math.floor(Math.random() * 2) + 1;
                gold = 0;
            } else if (value >= 2 && value <= 10) {
                silver = (Math.floor(Math.random() * 10) + 1) * value;
                gold = 0;
                if (silver > 99) silver = 99;
            } else if (value > 10 && value <= 20) {
                if (value <= 15) {
                    if (Math.random() >= 0.5) {
                        silver = Math.floor(Math.random() * 10) + 1;
                        gold = 1;
                    } else {
                        silver = Math.floor(Math.random() * 10) + 35;
                        gold = 0;
                        silver = silver > 99 ? 99 : silver;
                    };
                };
            };

            silver += state.currency.silver;
            gold += state.currency.gold;
            if (silver > 99) {
                gold += Math.floor(silver / 100);
                silver = silver % 100;
            };

            if (props.ascean().firewater.current < 5 ** props.ascean().level <= state.opponent) {
                firewater = {
                    current: props.ascean().firewater.current + 1,
                    max: props.ascean().firewater.max
                };
            } else {
                firewater = {
                    current: props.ascean().firewater.current,
                    max: props.ascean().firewater.max
                };
            };

            if (state.experience + state.opponentExp > state.level * 1000) {
                experience = props.ascean().level * 1000;
            } else {
                experience = state.experience + state.opponentExp;
            };

            const newAscean = {
                ...props.ascean,
                experience: experience,
                currentHealth: health,
                firewater: firewater,
                currency: {
                    silver: silver,
                    gold: gold
                },
            };

            EventBus.emit('update-ascean', newAscean);
        } catch (err: any) {
            console.log(err, 'Error Saving Experience');
        };
    };

    function swapEquipment(e: { type: string; item: Equipment }) {
        const { type, item } = e;
        console.log(type, item, 'Swap Equipment');
        const oldEquipment = props.ascean()[type as keyof Ascean] as Equipment;
        const newEquipment = item;
        const newAscean = { ...props.ascean(), [type]: newEquipment };

        let inventory = [ ...game().inventory ];
        inventory = inventory.filter((inv) => inv._id !== newEquipment._id);
        if (!oldEquipment.name.includes('Empty') && !oldEquipment.name.includes('Starter')) inventory.push(oldEquipment);
        
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

        EventBus.emit('update-ascean', res?.ascean);
        EventBus.emit('update-full-request');
        EventBus.emit('equip-sound');
    };

    function createUi() {
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
            setGame({ ...game(), inventory: game()?.inventory?.length > 0 ? [...game().inventory, e[0]] : e });
        });

        EventBus.on('clear-enemy', () => setCombat({
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
        }))

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
            console.log(e, 'Setup Enemy');
            setCombat({
                ...combat(),
                computer: e.game,
                computerHealth: e.enemy.attributes.healthTotal,
                newComputerHealth: e.health,
                computerWeapons: [e.enemy.combatWeaponOne, e.enemy.combatWeaponTwo, e.enemy.combatWeaponThree],
                computerAttributes: e.enemy.attributes,
                computerDefense: e.enemy.defense,
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
        EventBus.on('changeWeapon', (e: [Equipment, Equipment, Equipment]) => setCombat({ ...combat(), weapons: e, weaponOne: e[0], weaponTwo: e[1], weaponThree: e[2] }));

        EventBus.on('drink-firewater', () => setCombat({ ...combat(), newPlayerHealth: combat().playerHealth }));
        EventBus.on('gain-experience', (e: { state: any; combat: Combat }) => gainExperience(e));
        EventBus.on('add-loot', (e: Equipment[]) => setGame({ ...game(), inventory: game()?.inventory?.length > 0 ? [...game().inventory, e[0]] : e }));
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
        EventBus.on('refresh-inventory', (e: Equipment[]) => setGame({ ...game(), inventory: e }));
        EventBus.on('selectPrayer', (e: any) => setGame({ ...game(), selectedPrayerIndex: e.index, selectedHighlight: e.highlight }));
        EventBus.on('selectDamageType', (e: any) => setGame({ ...game(), selectedDamageTypeIndex: e.index, selectedHighlight: e.highlight }));
        EventBus.on('selectWeapon', (e: any) => setGame({ ...game(), selectedWeaponIndex: e.index, selectedHighlight: e.highlight }));
        EventBus.on('set-equipper', (e: any) => swapEquipment(e));
        EventBus.on('show-combat-logs', (e: boolean) => setGame({ ...game(), showCombat: e }));
        EventBus.on('show-player', () => setGame({ ...game(), showPlayer: !game().showPlayer }));
        EventBus.on('toggle-pause', () => setGame({ ...game(), pauseState: !game().pauseState }));
        EventBus.on('update-combat', (e: Combat) => setCombat(e));
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
        EventBus.on('update-health', (e: number) => setCombat({ ...combat(), e }));
        EventBus.on('update-lootdrops', (e: Equipment[]) => 
            setGame({ 
                ...game(), 
                lootDrops: game().lootDrops.length > 0 ? [...game().lootDrops, ...e] : e,
                showLoot: e.length > 0,
                showLootIds: e.map((loot) => loot._id)
        }));
        EventBus.on('useHighlight', (e: string) => setGame({ ...game(), selectedHighlight: e }));
        EventBus.on('useScroll', (e: boolean) => setGame({ ...game(), scrollEnabled: e }));


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