import Phaser from 'phaser';
import { Setter, Show, createEffect, createSignal } from 'solid-js';
import AsceanBuilder from './components/AsceanBuilder';
import { AsceanView } from './components/AsceanView';
import { MenuAscean } from './components/MenuAscean';
import { Preview } from './components/Preview';
import { Game } from './game/scenes/Game';
import { PhaserGame } from './game/PhaserGame';
import { useResizeListener } from './utility/dimensions';
import { initSettings } from './models/settings';
import { LANDSCAPE_SCREENS, Menu, SCREENS } from './utility/screens';
import Ascean, { createAscean, initAscean } from './models/ascean';
import { CharacterSheet, Compiler, asceanCompiler } from './utility/ascean';
import { usePhaserEvent } from './utility/hooks';
import type { IRefPhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { allEquipment, deleteAscean, getAscean, getAsceans, getInventory, getSettings, populate, scrub } from './assets/db/db'; 
import GameToast from './ui/GameToast';
import { Puff } from 'solid-spinner';

export default function App() {
    const [ascean, setAscean] = createSignal<Ascean>(undefined as unknown as Ascean);
    const [settings, setSettings] = createSignal(initSettings);
    const [menu, setMenu] = createSignal<Menu>({
        asceans: [] as Ascean[] | [],  
        characterCreated: false, 
        choosingCharacter: false,   
        creatingCharacter: false,
        gameRunning: false,
        loaded: false,
        loading: true,
        screen: SCREENS.CHARACTER.KEY,
        deleteModal: false,
        playModal: false,
    });
    const [newAscean, setNewAscean] = createSignal<CharacterSheet>({
        name: 'Stranger', // Dorien Caderyn
        description: 'Commoner from elsewhere', // Prince of the Daethic Kingdom
        sex: 'Man',
        origin: "Ashtre", // Notheo
        constitution: 16, // 12
        strength: 14, // 16
        agility: 10,
        achre: 10,
        caeren: 13, // 12
        kyosir: 10, // 13
        mastery: 'constitution',
        faith: 'Adherent',
        preference: 'Plate-Mail',
    });
    const [scene, setScene] = createSignal<string>('');
    const dimensions = useResizeListener();
    const [alert, setAlert] = createSignal({ header: '', body: '' });
    const [show, setShow] = createSignal<boolean>(false);
    // References to the PhaserGame component (game and scene are exposed)
    let phaserRef: IRefPhaserGame;

    createEffect(() => {
        fetchAsceans();
    });

    
    function fetchAsceans(): void {
        const fetch = async () => {
            try {
                const res = await getAsceans();
                await allEquipment();
                if (!res.length) {
                    console.log('No Asceans Found');
                    setMenu({ ...menu(), loading: false });
                    return;
                };
                const pop = await Promise.all(res.map(async (asc: Ascean) => await populate(asc)));
                const hyd = pop.map((asc: Ascean) => asceanCompiler(asc)).map((asc: Compiler) => { return { ...asc.ascean, weaponOne: asc.combatWeaponOne, weaponTwo: asc.combatWeaponTwo, weaponThree: asc.combatWeaponThree }});
                setMenu({ ...menu(), asceans: hyd, loading: false, }); // choosingCharacter: true
            } catch (err: any) {
                console.warn('Error fetching Asceans:', err);
            };
        };
        fetch();
    };
 
    const currentScene = (scene: Phaser.Scene) => {
        setScene(scene.scene.key);
    };

    function menuOption(option: string): void {
        switch (option) {
            case 'createCharacter':
                setMenu({ ...menu(), creatingCharacter: true });
                break;
            case 'chooseCharacter':
                setMenu({ ...menu(), choosingCharacter: true });
                break;
            default:
                break;
        };
    };

    async function createCharacter(character: CharacterSheet): Promise<void> {
        const res = await createAscean(character);
        const pop = await populate(res);
        const beast = asceanCompiler(pop);
        const menuAscean = menu()?.asceans?.length > 0 ? [...menu()?.asceans, beast?.ascean] : [beast?.ascean];
        // console.log(menuAscean, 'Menu Asceans')
        setAscean(beast?.ascean as Ascean);
        setMenu({ ...menu(), asceans: menuAscean as Ascean[], creatingCharacter: false });
    };

    async function deleteCharacter(id: string | undefined): Promise<void> {
        try {
            // console.log('Deleting Ascean:', id);
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
            // console.log('Fetching Ascean:', id);
            const asc = await getAscean(id);
            const inv = await getInventory(asc?._id as string);
            const pop = await populate(asc);
            const beast = asceanCompiler(pop);
            const full = { ...beast?.ascean, inventory: inv };
            setAscean(full as Ascean);
        } catch (err: any) {
            console.warn('Error fetching Ascean:', err);
        };
    };

    async function loadAscean(id: string): Promise<void> {
        try {
            // console.log('Loading Ascean:', id);
            EventBus.emit('preload-ascean', id);
            const asc: Ascean = menu()?.asceans?.find((asc: Ascean) => asc._id === id) as Ascean;
            setAlert({ header: 'Loading Game', body: `Preparing to enter game world now.` });
            setShow(true);
            const inv = await getInventory(asc?._id as string);
            const full = { ...asc, inventory: inv };
            setAscean(full);
            setMenu({ ...menu(), choosingCharacter: false, gameRunning: true, playModal: false });
            const set = await getSettings(id);
            setSettings(set);
            setTimeout(() => {
                EventBus.emit('enter-game');
            }, 2500);
        } catch (err: any) {
            console.warn('Error loading Ascean:', err);
        };
    };

    const makeToast = (header: string, body: string): void => {
        setAlert({ header, body });
        setShow(true);    
    };
    
    function togglePause(pause: boolean): void {
        const scene = phaserRef.scene as Game;
        if (scene) {
            if (pause) {
                scene.pause();
            } else {
                scene.resume();
            };
        };
        EventBus.emit('toggle-pause');
    };

    async function quickAscean(vaEsai: Ascean): Promise<void> {
        try {
            // console.log('Quickly Setting Ascean:', vaEsai);
            setAscean(vaEsai);
        } catch (err: any) {
            console.warn('Error saving Ascean:', err);
        };
    };

    async function saveAscean(vaEsai: any): Promise<void> {
        try {
            const save = await updateAscean(vaEsai);
            const pop = await populate(save);
            let hydrate = asceanCompiler(pop);
            const inv = await getInventory(hydrate?.ascean?._id as string);
            const full = { ...hydrate?.ascean, inventory: inv };
            hydrate = { ...hydrate, ascean: full as Ascean } as Compiler;
            setAscean(full as Ascean);
            EventBus.emit('set-player', hydrate);
        } catch (err: any) {
            console.warn('Error saving Ascean:', err);
        };
    };

    async function updateAscean(vaEsai: Ascean): Promise<void> {
        try {
            const save = await scrub(vaEsai);
            const pop = await populate(save);
            let hydrate = asceanCompiler(pop);
            const inv = await getInventory(hydrate?.ascean?._id as string);
            const full = { ...hydrate?.ascean, inventory: inv };
            hydrate = { ...hydrate, ascean: full as Ascean } as Compiler;
            setAscean(full as Ascean);
            EventBus.emit('set-player', hydrate);
        } catch (err: any) {
            console.warn('Error updating Ascean:', err);
        };
    };

    async function viewAscean(id: string): Promise<void> {
        EventBus.emit('preload-ascean', id);
        const asc = menu()?.asceans?.find((asc: Ascean) => asc._id === id);
        setAscean(asc as Ascean);
        setMenu({ ...menu(), choosingCharacter: false });
        const set = await getSettings(id);
        setSettings(set);
    };

    function enterMenu(): void {
        if (menu()?.asceans?.length > 0) {
            setMenu({ ...menu(), choosingCharacter: true, loaded: true });
        } else {
            setMenu({ ...menu(), loaded: true });
        };
    };

    usePhaserEvent('alert', (payload: { header: string, body: string }) => makeToast(payload.header, payload.body));
    usePhaserEvent('enter-menu', enterMenu);
    usePhaserEvent('fetch-ascean', fetchAscean);
    usePhaserEvent('quick-ascean', quickAscean);
    usePhaserEvent('save-ascean', saveAscean);
    usePhaserEvent('update-ascean', updateAscean);
    usePhaserEvent('update-pause', togglePause);
    usePhaserEvent('request-settings', () => {
        // console.log(settings(), 'Settings Requested');
        EventBus.emit('settings', settings());
        // EventBus.emit('request-settings-ready', settings());
    });
    usePhaserEvent('player-ascean', () => EventBus.emit('player-ascean-ready', ascean()));

    return (
        <div id="app">
            <PhaserGame ref={(el: IRefPhaserGame) => phaserRef = el} currentActiveScene={currentScene} menu={menu} setMenu={setMenu} ascean={ascean} settings={settings} setSettings={setSettings} />
            {/* // menu().gameRunning ? ( // && ascean()?.name !== 'Kreceus'
            //     <PhaserGame ref={(el: IRefPhaserGame) => phaserRef = el} currentActiveScene={currentScene} menu={menu} setMenu={setMenu} ascean={ascean} settings={settings} setSettings={setSettings} />
            // ) :  */}

            {scene() === 'MainMenu' && (<>
            { menu().creatingCharacter ? (
                <div id='overlay' class='superCenter'>
                <Show when={menu().screen !== SCREENS.COMPLETE.KEY && dimensions().ORIENTATION === 'landscape'}>
                    <Preview newAscean={newAscean} />
                </Show>
                <AsceanBuilder newAscean={newAscean} setNewAscean={setNewAscean} menu={menu} />
                <Show when={dimensions().ORIENTATION === 'landscape'} fallback={
                    <>
                    { (SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV !== SCREENS.COMPLETE.KEY) && 
                        <button class='highlight cornerBL' onClick={() => setMenu({ ...menu(), screen: SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV})}>
                            <div>Back ({SCREENS[SCREENS[menu()?.screen as keyof typeof SCREENS]?.PREV as keyof typeof SCREENS]?.TEXT})</div>
                        </button>
                    }
                    { (SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT !== SCREENS.CHARACTER.KEY) && 
                        <button class='highlight cornerBR' onClick={() => setMenu({ ...menu(), screen: SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT})}>
                            <div>Next ({SCREENS[SCREENS[menu()?.screen as keyof typeof SCREENS]?.NEXT as keyof typeof SCREENS]?.TEXT})</div>
                        </button>
                    }
                    { SCREENS[menu()?.screen as keyof typeof SCREENS]?.KEY === SCREENS.COMPLETE.KEY && 
                        <button class='highlight cornerBR' onClick={() => createCharacter(newAscean())}>
                            <div>Create {newAscean()?.name?.split(' ')[0]}</div>
                        </button>
                    }
                    <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: false })}>
                        <div>Back</div>
                    </button>
                    </>
                }>
                    <>
                    { (LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV !== LANDSCAPE_SCREENS.COMPLETE.KEY) && 
                        <button class='highlight cornerBL' onClick={() => setMenu({ ...menu(), screen: LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV})}>
                            <div>Back ({LANDSCAPE_SCREENS[LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.PREV as keyof typeof LANDSCAPE_SCREENS]?.TEXT})</div>
                        </button>
                    }
                    { (LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT !== LANDSCAPE_SCREENS.CHARACTER.KEY) && 
                        <button class='highlight cornerBR' onClick={() => setMenu({ ...menu(), screen: LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT})}>
                            <div>Next ({LANDSCAPE_SCREENS[LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.NEXT as keyof typeof LANDSCAPE_SCREENS]?.TEXT})</div>
                        </button>
                    }
                    { (LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY && LANDSCAPE_SCREENS[menu()?.screen as keyof typeof LANDSCAPE_SCREENS]?.KEY === LANDSCAPE_SCREENS.COMPLETE.KEY) && 
                        <button class='highlight cornerBR' onClick={() => createCharacter(newAscean())}>
                            <div>Create {newAscean()?.name?.split(' ')[0]}</div>
                        </button>
                    }
                    <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: false })}>
                        <div>Back</div>
                    </button>
                    </>
                </Show>
                </div>
            ) : menu()?.choosingCharacter ? ( // menu().asceans.length > 0
                <div id="overlay" class='superCenter'>
                    <MenuAscean menu={menu} viewAscean={viewAscean} loadAscean={loadAscean} />
                    <Show when={menu()?.asceans?.length < 3}>
                        <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'black' }}>Create Character</button>
                    </Show>
                </div>
            ) : ascean() ? (
                <>
                    <AsceanView ascean={ascean} />
                    <Show when={menu()?.asceans?.length > 0}>
                        <button class='highlight cornerTL' onClick={() => setMenu({ ...menu(), choosingCharacter: true })} style={{ 'background-color': 'black' }}>Main Menu</button> 
                    </Show>
                    <Show when={menu()?.asceans?.length < 3}>
                        <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'black' }}>Create Character</button>
                    </Show>
                    <Show when={menu().deleteModal}>
                        <div class='modal' onClick={() => setMenu({ ...menu(), deleteModal: false })} style={{ background: 'rgba(0, 0, 0, 1)' }}>
                            <button class='highlight superCenter' onClick={() => deleteCharacter(ascean()?._id)} style={{ color: 'red', margin: 0, padding: '1em', width: 'auto', 'font-size': '1.5em', 'font-weight': 700, 'border-radius': '0' }}>Permanently Delete {ascean()?.name}?</button>
                            <div class='gold verticalBottom super' style={{ 'margin-bottom': '10%' }}>
                                [This action is irreversible. You may click anywhere to cancel.]
                            </div>
                        </div>
                    </Show>
                    <Show when={show()}>
                        <div class='modal' style={{ background: 'rgba(0, 0, 0, 1)' }}>
                            <div class='superCenter center' style={{ "z-index": 1 }}>
                                <Puff color="gold" />
                            </div>
                        </div>
                    </Show>
                    <button class="highlight cornerBL" style={{ 'background-color': 'black' }} onClick={() => setMenu({ ...menu(), deleteModal: true })}>Delete {ascean()?.name.split(' ')[0]}</button>
                    <button class='highlight cornerBR' style={{ 'background-color': 'black' }} onClick={() => loadAscean(ascean()?._id)}>Enter Game</button>
                </>
            ) : ( 
                <div>
                <div class="cornerTL super">
                    The Ascean v0.0.1
                </div>
                <Show when={menu().loaded}>
                <div class='superCenter' style={{ 'font-family': 'Cinzel Regular', 'font-size': '1.25em' }}>
                    <div class='center' style={{ 'font-size': '3.875em' }}>
                        The Ascean <br /> 
                        { menu()?.asceans?.length > 0 ? (
                            <button class='center highlight' style={{ 'border-radius': '0.5em' }} onClick={() => menuOption('chooseCharacter')}>
                            Main Menu
                            </button>
                        ) : (
                            <button class='center highlight' style={{ 'border-radius': '0.5em' }} onClick={() => menuOption('createCharacter')}>
                            Create Character
                            </button>
                        ) }
                    </div>
                </div>
                </Show>
                </div>
            ) }
            </>)}
            <Show when={show()}>
                <div class='cornerBL realize' style={{ width: '30%', 'z-index': 1 }}>
                    <GameToast show={show} setShow={setShow} alert={alert} setAlert={setAlert as Setter<{ header: string; body: string; }>} />
                </div>
            </Show>
        </div>
    );
};