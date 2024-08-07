import { Setter, Show, createSignal, lazy, Suspense, onMount } from 'solid-js';
import { Scene } from 'phaser';
import PhaserGame from'./game/PhaserGame';
import { Game } from './game/scenes/Game';
import { useResizeListener } from './utility/dimensions';
import Settings, { initSettings } from './models/settings';
import { initMenu, LANDSCAPE_SCREENS, Menu, SCREENS } from './utility/screens';
import Ascean, { createAscean } from './models/ascean';
import { CharacterSheet, Compiler, asceanCompiler, initCharacterSheet } from './utility/ascean';
import { usePhaserEvent } from './utility/hooks';
import { EventBus } from './game/EventBus';
import { deleteAscean, getAscean, getAsceans, getInventory, getReputation, getSettings, populate, saveTutorial, scrub, updateInventory, updateReputation, updateSettings } from './assets/db/db'; 
import { TIPS } from './utility/tips';
import { Inventory, Reputation, initInventory, initReputation } from './utility/player';
import { Puff } from 'solid-spinner';
import type { IRefPhaserGame } from './game/PhaserGame';
const AsceanBuilder = lazy(async () => await import('./components/AsceanBuilder'));
const AsceanView = lazy(async () => await import('./components/AsceanView'));
const MenuAscean = lazy(async () => await import('./components/MenuAscean'));
const Preview = lazy(async () => await import('./components/Preview'));
const GameToast = lazy(async () => await import('./ui/GameToast'));
var click = new Audio("../assets/sounds/TV_Button_Press.wav");

export default function App() {
    const [alert, setAlert] = createSignal({ header: '', body: '', delay: 0, key: '', arg: undefined });
    const [ascean, setAscean] = createSignal<Ascean>(undefined as unknown as Ascean);
    const [menu, setMenu] = createSignal<Menu>(initMenu);
    const [newAscean, setNewAscean] = createSignal<CharacterSheet>(initCharacterSheet);
    const [inventory, setInventory] = createSignal<Inventory>(initInventory);
    const [reputation, setReputation] = createSignal<Reputation>(initReputation);
    const [scene, setScene] = createSignal<string>('');
    const [settings, setSettings] = createSignal<Settings>(initSettings);
    const [show, setShow] = createSignal<boolean>(false);
    const [startGame, setStartGame] = createSignal<boolean>(false);
    const dimensions = useResizeListener();
    var phaserRef: IRefPhaserGame;
    var tips: string | number | NodeJS.Timeout | undefined =  undefined;
    onMount(() => fetchAsceans());
    const currentScene = (scene: Scene) => setScene(scene.scene.key);
    function fetchAsceans(): void {
        const fetch = async () => {
            try {
                const res = await getAsceans();
                if (!res.length) {
                    setMenu({ ...menu(), loading: false });
                    return;
                };
                const pop = await Promise.all(res.map(async (asc: Ascean) => await populate(asc)));
                const hyd = pop.map((asc: Ascean) => asceanCompiler(asc)).map((asc: Compiler) => { return { ...asc.ascean, weaponOne: asc.combatWeaponOne, weaponTwo: asc.combatWeaponTwo, weaponThree: asc.combatWeaponThree }});
                setMenu({ ...menu(), asceans: hyd, loading: false }); // choosingCharacter: true
            } catch (err: any) {
                console.warn('Error fetching Asceans:', err);
            };
        };
        fetch();
    };
    function menuOption(option: string): void {
        click.play();
        setMenu({ ...menu(), [option]: true });
    };
    async function createCharacter(character: CharacterSheet): Promise<void> {
        click.play();
        const cre = await createAscean(character);
        const pop = await populate(cre);
        const comp = asceanCompiler(pop);
        const menuAscean = menu()?.asceans?.length > 0 ? [...menu()?.asceans, comp?.ascean] : [comp?.ascean];
        setAscean(comp?.ascean as Ascean);
        setMenu({ ...menu(), asceans: menuAscean as Ascean[], creatingCharacter: false, screen: SCREENS.CHARACTER.KEY });
        setNewAscean(initCharacterSheet);
    };
    async function deleteCharacter(id: string | undefined): Promise<void> {
        try {
            click.play();
            const newAsceans = menu()?.asceans?.filter((asc: Ascean) => asc._id !== id);
            setMenu({ ...menu(), asceans: newAsceans, choosingCharacter: newAsceans.length > 0 });
            setAscean(undefined as unknown as Ascean);
            await deleteAscean(id as string);
        } catch (err) {
            console.warn('Error deleting Ascean:', err);
        };
    };
    async function fetchAscean(id: string): Promise<void> {
        try {
            const asc = await getAscean(id);
            const inv = await getInventory(asc?._id as string);
            const pop = await populate(asc);
            const comp = asceanCompiler(pop);
            const full = { ...comp?.ascean }; // , inventory: inv
            setAscean(full as Ascean);
            setInventory(inv);
        } catch (err: any) {
            console.warn('Error fetching Ascean:', err);
        };
    };
    async function loadAscean(id: string): Promise<void> {
        try {
            setStartGame(true);
            const asc: Ascean = menu()?.asceans?.find((asc: Ascean) => asc._id === id) as Ascean;
            setAlert({ header: 'Loading Game', body: `Preparing ${asc.name}. Good luck.`, delay: 3000, key: '', arg: undefined });
            setShow(true);
            const inv = await getInventory(asc?._id as string);
            const full = { ...asc }; // , inventory: inv
            setAscean(full);
            setInventory(inv);
            setMenu({ ...menu(), choosingCharacter: false, gameRunning: true, playModal: false });
            const rep = await getReputation(id);
            const set = await getSettings(id);
            setReputation(rep);
            setSettings(set);
            if (set.difficulty.tidbits === true) setTips(true);
            EventBus.emit('preload-ascean', id);
        } catch (err: any) {
            console.warn('Error loading Ascean:', err);
        };
    };
    const loadingAscean = () => EventBus.emit('enter-game');
    const makeToast = (header: string, body: string, delay = 3000, key = '', arg: any): void => {
        setAlert({ header, body, delay, key, arg });
        setShow(true);    
    };
    const setTips = (on: boolean): void => {
        if (on === true) {
            const interval: number = 1000 * 60 * 3; // 3 minutes
            tips = setInterval(() => {
                const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
                setAlert({ header: 'Gameplay Tidbit', body: tip, delay: 12000, key: 'Close', arg: undefined }); // 10000
                setShow(true);    
            }, interval); 
        } else {
            clearInterval(tips);
        };
    };
    function togglePause(pause: boolean): void {
        const scene = phaserRef.scene as Game;
        if (scene) {
            if (pause === true) {
                scene.pause();
            } else {
                scene.resume();
            };
        };
        EventBus.emit('toggle-pause', pause);
    };
    const quickAscean = (a: Ascean): Ascean => setAscean(a);
    async function saveAscean(vaEsai: any): Promise<void> {
        try {
            const save = await updateAscean(vaEsai);
            const pop = await populate(save);
            let hydrate = asceanCompiler(pop);
            const inv = await getInventory(hydrate?.ascean?._id as string);
            const full = { ...hydrate?.ascean }; // , inventory: inv
            hydrate = { ...hydrate, ascean: full as Ascean } as Compiler;
            setAscean(full as Ascean);
            setInventory(inv);
            EventBus.emit('set-player', hydrate);
        } catch (err: any) {
            console.warn('Error saving Ascean:', err);
        };
    };
    async function silentSave(vaEsai: Ascean): Promise<void> {
        try {
            await scrub(vaEsai);
        } catch (err: any) {
            console.warn('Error saving Ascean:', err);
        };
    };
    async function saveInventory(save: Inventory) {
        try {
            setInventory(save);
            const res = await updateInventory(save);
            console.log(res, 'Result of Saving Inventory');
        } catch (err) { 
            console.warn(err, 'Error Saving Inventory'); 
        };
    };
    async function insertSettings(insert: any) {
        try {
            const set = { ...settings(), ...insert };
            await updateSettings(set);
            setSettings(set);
        } catch (err: any) {
            console.warn('Error saving Settings:', err);
        };
    };
    async function saveSettings(set: Settings): Promise<void> {
        try {
            await updateSettings(set);
            setSettings(set);
        } catch (err: any) {
            console.warn('Error saving Settings:', err);
        };
    };
    const updateAscean = async (vaEsai: Ascean): Promise<void> => {
        try {
            const save = await scrub(vaEsai);
            const pop = await populate(save);
            let hydrate = asceanCompiler(pop);
            setAscean(hydrate?.ascean as Ascean);
            EventBus.emit('set-player', hydrate);
        } catch (err: any) {
            console.warn('Error updating Ascean:', err);
        };
    };
    const updateRep = async (rep: Reputation): Promise<void> => {
        try {
            // const success = 
            await updateReputation(rep);
            // console.log('Reputation Updated:', success);
            setReputation(rep);
        } catch (err: any) {
            console.warn('Error updating Reputation:', err);
        };
    };
    async function viewAscean(id: string): Promise<void> {
        if (ascean()?._id === id) {
            setMenu({ ...menu(), choosingCharacter: false });
            return;
        };
        EventBus.emit('preload-ascean', id);
        const asc = menu()?.asceans?.find((asc: Ascean) => asc._id === id);
        setAscean(asc as Ascean);
        setMenu({ ...menu(), choosingCharacter: false });
        const inv = await getInventory(id);
        const rep = await getReputation(id);
        const set = await getSettings(id);
        setInventory(inv);
        setReputation(rep);
        setSettings(set);
    };
    function enterMenu(): void {
        if (menu()?.asceans?.length > 0) {
            setMenu({ ...menu(), choosingCharacter: true});
        } else {
            setMenu({ ...menu()});
        };
    };
    function switchScene(next: string): void {
        setShow(false);
        const scene = phaserRef.scene as Scene;
        EventBus.emit('switch-scene', { current: scene.scene.key, next });
    };
    function summonEnemy(val: number = 1) {
        EventBus.emit('summon-enemy', val);
        setShow(false);
    };

    function setScreen(screen: string) {
        setMenu({ ...menu(), screen });
    };
    const actions = {
        "Duel": (val: number) => summonEnemy(val),
        'Enter Tent': () => switchScene('Tent'),
        'Close': () => setShow(false),
        'Exit World': () => switchScene('Game'),
        'Pause': () => togglePause(true),
        'Resume': () => togglePause(false),
    };
    usePhaserEvent('alert', (payload: { header: string, body: string, delay?: number, key?: string, arg: any }) => makeToast(payload.header, payload.body, payload.delay, payload.key, payload.arg));
    usePhaserEvent('set-tips', setTips);
    usePhaserEvent('enter-menu', enterMenu);
    usePhaserEvent('fetch-ascean', fetchAscean);
    usePhaserEvent('loading-ascean', loadingAscean);
    usePhaserEvent('quick-ascean', quickAscean);
    usePhaserEvent('save-ascean', saveAscean);
    usePhaserEvent('silent-save', silentSave);
    usePhaserEvent('update-ascean', updateAscean);
    usePhaserEvent('update-inventory', saveInventory);
    usePhaserEvent('update-pause', togglePause);
    usePhaserEvent('request-reputation', () => EventBus.emit('reputation', reputation()));
    usePhaserEvent('update-reputation', updateRep);
    usePhaserEvent('request-settings', () => EventBus.emit('settings', settings()));
    usePhaserEvent('save-settings', saveSettings);
    usePhaserEvent('insert-settings', insertSettings);
    usePhaserEvent('update-settings', updateRep);
    usePhaserEvent('player-ascean', () => EventBus.emit('player-ascean-ready', ascean()));
    usePhaserEvent('save-intro', async () => {
        await saveTutorial(ascean()?._id as string, 'intro');
        await fetchAscean(ascean()?._id as string);
        const scene = phaserRef.scene as Scene; // 'intro'
        scene.scene.stop('Intro');
        scene.scene.wake('Game');
        const game = scene.scene.get('Game') as Game;
        game.musicBackground.resume();
        EventBus.emit('boot-tutorial');
        EventBus.emit('current-scene-ready', game);
    });
    usePhaserEvent('sleep-scene', (key: string) => {
        const scene = phaserRef.scene as Scene;
        const game = scene.scene.get('Game') as Game;
        game.musicBackground.pause();
        scene.scene.sleep(key);
    })
    usePhaserEvent('fetch-button-reorder', () => {
        EventBus.emit('reorder-buttons', { list: settings().actions, type: 'action' });
        EventBus.emit('reorder-buttons', { list: settings().specials, type: 'special' });
    });
    return <div id="app">
        <Show when={startGame()} fallback={<>
        {menu().creatingCharacter ? (
            <div id='overlay' class='superCenter'>
            <Show when={menu().screen !== SCREENS.COMPLETE.KEY && dimensions().ORIENTATION === 'landscape'}>
                <Suspense fallback={<Puff color="gold"/>}>
                    <Preview newAscean={newAscean} />
                </Suspense>
            </Show>
            <Suspense fallback={<Puff color="gold"/>}>
                <AsceanBuilder newAscean={newAscean} setNewAscean={setNewAscean} menu={menu} />
            </Suspense>
            <Show when={dimensions().ORIENTATION === 'landscape'} fallback={
                <>{(SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV !== SCREENS.COMPLETE.KEY) && 
                    <button class='highlight cornerBL' onClick={() => setScreen(SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV)}>
                        <div>Back ({SCREENS[SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV as keyof typeof SCREENS]?.TEXT})</div>
                    </button>
                }
                {(SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT !== SCREENS.CHARACTER.KEY) && 
                    <button class='highlight cornerBR' onClick={() => setScreen(SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT)}>
                        <div>Next ({SCREENS[SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT as keyof typeof SCREENS]?.TEXT})</div>
                    </button>
                }
                {SCREENS[menu()?.screen as keyof typeof SCREENS]?.KEY === SCREENS.COMPLETE.KEY && 
                    <button class='highlight cornerBR' onClick={() => createCharacter(newAscean())}>
                        <div>Create {newAscean()?.name?.split(' ')[0]}</div>
                    </button>
                }
                <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: false })}>
                    <div>Back (Menu)</div>
                </button></>
                }>
                <>{(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV !== LANDSCAPE_SCREENS.COMPLETE.KEY) && 
                        <button class='highlight cornerBL' onClick={() => setScreen(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV)}>
                            <div>Back ({LANDSCAPE_SCREENS[LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV as keyof typeof LANDSCAPE_SCREENS]?.TEXT})</div>
                        </button>
                    }
                    {(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT !== LANDSCAPE_SCREENS.PREMADE.KEY) && 
                        <button class='highlight cornerBR' onClick={() => setScreen(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT)}>
                            <div>Next ({LANDSCAPE_SCREENS[LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT as keyof typeof LANDSCAPE_SCREENS]?.TEXT})</div>
                        </button>
                    }
                    {(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY === LANDSCAPE_SCREENS.COMPLETE.KEY) && 
                        <button class='highlight cornerBR animate' onClick={() => createCharacter(newAscean())}>
                            <div>Create {newAscean()?.name?.split(' ')[0]}</div>
                        </button>
                    }
                    {(LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY === LANDSCAPE_SCREENS.PREMADE.KEY) && 
                        <button class='highlight cornerBL animate' onClick={() => createCharacter(newAscean())}>
                            <div>Create {newAscean()?.name?.split(' ')[0]}</div>
                        </button>
                    }
                    <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: false })}>
                        <div>Back (Menu)</div>
                    </button>
                </>
            </Show>
            </div>
        ) : menu()?.choosingCharacter ? ( // menu().asceans.length > 0
            <div id="overlay" class='superCenter'>
                <Suspense fallback={<Puff color="gold"/>}>
                    <MenuAscean menu={menu} viewAscean={viewAscean} loadAscean={loadAscean} />
                </Suspense>
                <Show when={menu()?.asceans?.length < 3}>
                    <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'black' }}>Create Character</button>
                </Show>
            </div>
        ) : ascean() ? (
            <>
                <Suspense fallback={<Puff color="gold"/>}>
                    <AsceanView ascean={ascean} />
                </Suspense>
                <Show when={menu()?.asceans?.length > 0}>
                    <button class='highlight cornerTL' onClick={() => setMenu({ ...menu(), choosingCharacter: true })} style={{ 'background-color': 'black' }}>Main Menu</button> 
                </Show>
                <Show when={menu()?.asceans?.length < 3}>
                    <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'black' }}>Create Character</button>
                </Show>
                <Show when={menu().deleteModal}>
                    <div class='modal' onClick={() => setMenu({ ...menu(), deleteModal: false })} style={{ background: 'rgba(0, 0, 0, 1)' }}>
                        <button class='highlight superCenter' onClick={() => deleteCharacter(ascean()?._id)} style={{ color: 'red', margin: 0, padding: '1em', width: 'auto', 'font-size': '1.5em', 'font-weight': 700, 'border-radius': '0' }}>Permanently Delete {ascean()?.name}?</button>
                        <div class='gold verticalBottom super' style={{ 'margin-bottom': '10%' }}>[This action is irreversible. You may click anywhere to cancel.]</div>
                    </div>
                </Show> 
                <button class="highlight cornerBL" style={{ 'background-color': 'black' }} onClick={() => setMenu({ ...menu(), deleteModal: true })}>Delete {ascean()?.name.split(' ')[0]}</button>
                <button class='highlight cornerBR' style={{ 'background-color': 'black' }} onClick={() => loadAscean(ascean()?._id)}>Enter Game</button>
            </>
        ) : ( 
            <Suspense fallback={<Puff color="gold"/>}>
            <div class="cornerTL super">The Ascean v0.0.1</div>
            <Show when={menu().loading === false} fallback={<Puff color="gold"/>}>
            <div class='superCenter cinzel' style={{ width: '100%' }}>
                <div class='center'>
                    <div class='title'>The Ascean</div>
                    <button class='center highlight animate' style={{ 'font-size': '1.25em', 'font-family': 'Cinzel Regular' }} onClick={() => menuOption(menu().asceans.length > 0 ? 'choosingCharacter' : 'creatingCharacter')}>Enter Game</button>
                </div>
            </div>
            </Show>
            </Suspense>
        )}
        </>}>
            <PhaserGame ref={(el: IRefPhaserGame) => phaserRef = el} currentActiveScene={currentScene} menu={menu} setMenu={setMenu} ascean={ascean} inventory={inventory} setInventory={setInventory} reputation={reputation} setReputation={setReputation} settings={settings} setSettings={setSettings} scene={scene} />
        </Show>
        <Show when={show()}>
        <Suspense fallback={<Puff color="gold"/>}>
            <GameToast actions={actions} show={show} setShow={setShow} alert={alert} setAlert={setAlert as Setter<{ header: string; body: string; delay: number; key?: string; arg: any }>} />
        </Suspense>
        </Show>
    </div>;
};