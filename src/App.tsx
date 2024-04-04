import Phaser from 'phaser';
import { Show, createEffect, createSignal } from 'solid-js';
import AsceanBuilder from './components/AsceanBuilder';
import { AsceanView } from './components/AsceanView';
import { MenuAscean } from './components/MenuAscean';
import { Preview } from './components/Preview';
import { MainMenu } from './game/scenes/MainMenu';
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


export default function App() {
    const [ascean, setAscean] = createSignal<Ascean>(initAscean);
    const [settings, setSettings] = createSignal(initSettings);
    const [menu, setMenu] = createSignal<Menu>({
        asceans: [] as Ascean[] | [],  
        characterCreated: false, 
        choosingCharacter: false,   
        creatingCharacter: false,
        gameRunning: false,
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
    const dimensions = useResizeListener();
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
                setMenu({ ...menu(), asceans: hyd, loading: false, choosingCharacter: true });
            } catch (err: any) {
                console.warn('Error fetching Asceans:', err);
            };
        };
        fetch();
    };
 
    const currentScene = (scene: Phaser.Scene) => {
        console.log('Current Scene:', scene.scene.key);
    };

    async function createCharacter(character: CharacterSheet): Promise<void> {
        const res = await createAscean(character);
        const pop = await populate(res);
        const beast = asceanCompiler(pop);
        const menuAscean = menu()?.asceans?.length > 0 ? [...menu()?.asceans, beast?.ascean] : [beast?.ascean];
        console.log(menuAscean, 'Menu Asceans')
        setAscean(beast?.ascean);
        setMenu({ ...menu(), asceans: menuAscean, creatingCharacter: false });
    };

    async function deleteCharacter(id: string | undefined): Promise<void> {
        try {
            console.log('Deleting Ascean:', id);
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
            console.log('Fetching Ascean:', id);
            const asc = await getAscean(id);
            const inv = await getInventory(asc?._id as string);
            const pop = await populate(asc);
            const beast = asceanCompiler(pop);
            const full = { ...beast?.ascean, inventory: inv };
            setAscean(full);
        } catch (err: any) {
            console.warn('Error fetching Ascean:', err);
        };
    };

    async function loadAscean(id: string): Promise<void> {
        try {
            console.log('Loading Ascean:', id);
            const set = await getSettings(id);
            setSettings(set);
            const asc: Ascean = menu()?.asceans?.find((asc: Ascean) => asc._id === id) as Ascean;
            const inv = await getInventory(asc?._id as string);
            const full = { ...asc, inventory: inv };
            setAscean(full);
            setMenu({ ...menu(), choosingCharacter: false, gameRunning: true, playModal: false });
        } catch (err: any) {
            console.warn('Error loading Ascean:', err);
        };
    };

    function togglePause(pause: boolean): void {
        const scene = phaserRef.scene as MainMenu;
        if (scene) {
            if (pause) {
                scene.scene.pause();
            } else {
                scene.scene.resume();
            };
        };
        EventBus.emit('toggle-pause');
    };

    async function saveAscean(vaEsai: any): Promise<void> {
        try {
            const save = await updateAscean(vaEsai);
            const res = await populate(save);
            const beast = asceanCompiler(res);
            const inv = await getInventory(beast?.ascean?._id as string);
            const full = { ...beast?.ascean, inventory: inv };
            setAscean(full);
        } catch (err: any) {
            console.warn('Error saving Ascean:', err);
        };
    };

    async function updateAscean(vaEsai: Ascean): Promise<void> {
        try {
            const save = await scrub(vaEsai);
            const res = await populate(save);
            const beast = asceanCompiler(res);
            const inv = await getInventory(beast?.ascean?._id as string);
            const full = { ...beast?.ascean, inventory: inv };
            setAscean(full);
        } catch (err: any) {
            console.warn('Error updating Ascean:', err);
        };
    };

    function viewAscean(id: string): void {
        const asc = menu()?.asceans?.find((asc: Ascean) => asc._id === id);
        setAscean(asc as Ascean);
        setMenu({ ...menu(), choosingCharacter: false });
    };

    usePhaserEvent('fetch-ascean', fetchAscean);
    usePhaserEvent('save-ascean', saveAscean);
    usePhaserEvent('update-ascean', updateAscean);
    usePhaserEvent('update-pause', togglePause);
    usePhaserEvent('request-settings', () => EventBus.emit('settings', settings()));

    return (
        <div id="app">
            { menu().gameRunning ? ( // && ascean()?.name !== 'Kreceus'
                <PhaserGame ref={(el: IRefPhaserGame) => phaserRef = el} currentActiveScene={currentScene} menu={menu} setMenu={setMenu} ascean={ascean} settings={settings} setSettings={setSettings} />
            ) : menu().creatingCharacter ? (
                    <div id='overlay'>
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
            ) : menu().asceans.length > 0 ? (
                <div id="overlay">
                <Show when={menu()?.choosingCharacter} fallback={<>
                    <AsceanView ascean={ascean} />
                    <Show when={menu()?.asceans?.length > 0}>
                        <button class='highlight cornerTL' onClick={() => setMenu({ ...menu(), choosingCharacter: true })} style={{ 'background-color': 'purple' }}>Main Menu</button>
                    </Show>
                    <Show when={menu()?.asceans?.length < 3}>
                        <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'green' }}>Create Character</button>
                    </Show>
                    <Show when={menu().deleteModal}>
                        <div class='modal' onClick={() => setMenu({ ...menu(), deleteModal: false })} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                            <div class='button superCenter' onClick={() => deleteCharacter(ascean()?._id)} style={{ color: 'red', 'border': '0.2em solid red', margin: 0, padding: '1em', width: 'auto', 'font-size': '1.5em', 'font-weight': 700, 'border-radius': '0' }}>Delete {ascean()?.name}?</div>
                            <div class='gold verticalBottom super' style={{ 'margin-bottom': '10%' }}>
                                [This action is irreversible. You may click anywhere to cancel.]
                            </div>
                        </div>
                    </Show>
                    <Show when={menu().playModal}>
                        <div class='modal' onClick={() => setMenu({ ...menu(), playModal: false })} style={{ background: 'rgba(0, 0, 0, 0.95)' }}>
                            <div class='button superCenter' onClick={() => loadAscean(ascean()?._id)} style={{ color: 'gold', 'border': '0.25em solid gold', margin: 0, padding: '1em', width: 'auto' }}>Enter the game with {ascean()?.name}?</div>
                            <div class='verticalBottom super' style={{ 'margin-bottom': '10%' }}>
                                [You may click anywhere to cancel.]
                            </div>
                        </div>
                    </Show>
                    <button class="highlight cornerBL" style={{ 'background-color': 'red' }} onClick={() => setMenu({ ...menu(), deleteModal: true })}>Delete {ascean()?.name.split(' ')[0]}</button>
                    <button class='highlight cornerBR' style={{ 'background-color': 'blue' }} onClick={() => loadAscean(ascean()?._id)}>Enter Game</button>
                </>}>
                    <MenuAscean menu={menu} viewAscean={viewAscean} loadAscean={loadAscean} />
                    <Show when={menu()?.asceans?.length < 3}>
                        <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'green' }}>Create Character</button>
                    </Show>
                </Show>
            </div>
            ) : ( 
                <div>
                <div class="cornerTL super">
                    The Ascean v0.0.1
                </div>
                <div class='superCenter' style={{ 'font-family': 'Cinzel Regular', 'font-size': '1.25em' }}>
                    <div class='center' style={{ 'font-size': '1.5em' }}>The Ascean </div>
                    <button class='button' style={{ 'border-radius': '0.5em' }} onClick={() => setMenu({ ...menu(), creatingCharacter: true })}>
                    Create Character
                    </button>
                </div>
                
                </div>
             ) }
        </div>
    );
};