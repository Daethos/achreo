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
import { CharacterSheet, asceanCompiler } from './utility/ascean';
import { usePhaserEvent } from './utility/hooks';
import type { IRefPhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';

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
        picture: undefined,
        screen: SCREENS.COMPLETE.KEY,
    });
    const [newAscean, setNewAscean] = createSignal<CharacterSheet>({
        name: 'Dorien Caderyn',
        description: 'Prince of the Daethic Kingdom',
        sex: 'Man',
        origin: "Notheo",
        constitution: 12,
        strength: 16,
        agility: 10,
        achre: 10,
        caeren: 12,
        kyosir: 13,
        mastery: 'strength',
        faith: 'None',
        preference: 'Plate-Mail',
    });
    const dimensions = useResizeListener();
    // References to the PhaserGame component (game and scene are exposed)
    let phaserRef: IRefPhaserGame;


    // The sprite can only be moved in the MainMenu Scene
    // const [canMoveSprite, setCanMoveSprite] = createSignal(true);
    // const [spritePosition, setSpritePosition] = createSignal({ x: 0, y: 0 });
        
    // createEffect(() => {
    //     setSettings(initSettings); // Pretending to fetch settings from the database
    //     setAscean(undefined); // Pretending to fetch Ascean from the database
    // });

    // const changeScene = () => {
    //     const scene = phaserRef.scene as MainMenu;
    //     if (scene) {
    //         scene.changeScene();
    //     };
    // };

    // const moveSprite = () => {
    //     const scene = phaserRef.scene as MainMenu;

    //     if (scene) {
    //         if (scene.scene.key === 'MainMenu') {
    //             // Get the update logo position
    //             scene.moveLogo(({ x, y }) => {
    //                 setSpritePosition({ x, y });
    //             });
    //         };
    //     };
    // };

    // const addSprite = () => {
    //     const scene = phaserRef.scene;

    //     if (scene) {
    //         // Add more stars
    //         const x = Phaser.Math.Between(64, scene.scale.width - 64);
    //         const y = Phaser.Math.Between(64, scene.scale.height - 64);

    //         //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
    //         const star = scene.add.sprite(x, y, 'star');
    //         //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
    //         //  You could, of course, do this from within the Phaser Scene code, but this is just an example
    //         //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
    //         scene.add.tween({
    //             targets: star,
    //             duration: 500 + Math.random() * 1000,
    //             alpha: 0,
    //             yoyo: true,
    //             repeat: -1
    //         });
    //     };
    // };

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        console.log('Current Scene:', scene.scene.key);
        // setCanMoveSprite(scene.scene.key !== 'MainMenu');
    };

    function createCharacter(character: CharacterSheet) {
        console.log('Character Created:', character);
        const res: Ascean = createAscean(character);
        const beast = asceanCompiler(res);
        console.log(beast, 'Created Character');
        setAscean(beast?.ascean);
        setMenu({ ...menu(), asceans: menu()?.asceans?.length > 0 ? [...menu()?.asceans, beast?.ascean] : [beast?.ascean], creatingCharacter: false });
    };

    function deleteCharacter(id: string | undefined) {
        try {
            console.log('Deleting Ascean:', id);
            const newAsceans = menu()?.asceans?.filter((asc: Ascean) => asc._id !== id);
            setMenu({ ...menu(), asceans: newAsceans, choosingCharacter: newAsceans.length > 1 });
            const newAsc = newAsceans?.length > 0 ? newAsceans[0] : undefined;
            setAscean(newAsc as Ascean);
        } catch (err) {
            console.error('Error deleting Ascean:', err);
        };
    };

    function loadAscean(id: string) {
        try {
            console.log('Loading Ascean:', id);
            const asc = menu()?.asceans?.find((asc: Ascean) => asc._id === id);
            const res = asceanCompiler(asc);
            setAscean(res?.ascean);
            // setCombat({ 
            //     ...combat(), 
            //     player: res?.ascean,
            //     weapons: [res?.combatWeaponOne, res?.combatWeaponTwo, res?.combatWeaponThree],
            //     playerAttributes: res?.attributes,
            //     playerDefense: res?.defense,
            //     playerDefenseDefault: res?.defense,
            //     weaponOne: res?.combatWeaponOne,
            //     weaponTwo: res?.combatWeaponTwo,
            //     weaponThree: res?.combatWeaponThree,
            // });
            setMenu({ ...menu(), choosingCharacter: false, gameRunning: true });
        } catch (err: any) {
            console.error('Error loading Ascean:', err);
        };
    }; 

    function togglePause(pause: boolean) {
        console.log('Pause:', pause);
        const scene = phaserRef.scene as MainMenu;
        console.log('Scene:', scene);
        if (scene) {
            if (pause) {
                scene.scene.pause();
            } else {
                scene.scene.resume();
            };
        };
        EventBus.emit('toggle-pause');
    };

    function viewAscean(id: string) {
        const asc = menu()?.asceans?.find((asc: Ascean) => asc._id === id);
        setAscean(asc as Ascean);
        setMenu({ ...menu(), choosingCharacter: false });
    };

    usePhaserEvent('update-ascean', (e: Ascean) => setAscean(e));
    usePhaserEvent('update-pause', togglePause);

    return (
        <div id="app">
            <Show when={menu().gameRunning} fallback={
                <Show when={ascean() && !menu()?.creatingCharacter && ascean()?.name !== 'Kreceus'} fallback={
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
                        </>
                    </Show>
                    </div>
                }>
                    <div id="overlay">
                        <Show when={menu()?.choosingCharacter} fallback={<>
                            <AsceanView ascean={ascean} />
                            <Show when={menu()?.asceans?.length > 1}>
                                <button class='highlight cornerTL' onClick={() => setMenu({ ...menu(), choosingCharacter: true })} style={{ 'background-color': 'purple' }}>Main Menu</button>
                            </Show>
                            <Show when={menu()?.asceans?.length < 3}>
                                <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'green' }}>Create Character</button>
                            </Show>
                            <button class="highlight cornerBL" style={{ 'background-color': 'red' }} onClick={() => deleteCharacter(ascean()?._id)}>Delete {ascean()?.name.split(' ')[0]}</button>
                            <button class='highlight cornerBR' style={{ 'background-color': 'blue' }} onClick={() => loadAscean(ascean()?._id as string)}>Enter Game</button>
                        </>}>
                            <MenuAscean menu={menu()} viewAscean={viewAscean} />
                            <Show when={menu()?.asceans?.length < 3}>
                                <button class='highlight cornerTR' onClick={() => setMenu({ ...menu(), creatingCharacter: true })} style={{ 'background-color': 'green' }}>Create Character</button>
                            </Show>
                        </Show>
                    </div>
                </Show>
            }>
                <PhaserGame ref={(el: IRefPhaserGame) => phaserRef = el} currentActiveScene={currentScene} menu={menu} setMenu={setMenu} ascean={ascean} settings={settings} setSettings={setSettings} />
            </Show>
        </div>
    );
};

// {/* <div class="cornerTL super">
//     The Ascean v0.0.1
// </div>  */}
// {/* <div>
//     <button disabled={canMoveSprite()} class="highlight middleB" onClick={moveSprite}>Toggle Movement</button>
//     </div>
//     <div class="spritePosition cornerTL">Sprite Position:
//     <pre>{`{\n  x: ${spritePosition().x}\n  y: ${spritePosition().y}\n}`}</pre>
// </div> */}
// {/* <button class="highlight cornerBR" onClick={addSprite}>Create Character</button> */}