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
import Ascean, { createAscean } from './models/ascean';
import { CharacterSheet, Compiler, asceanCompiler } from './utility/ascean';
import { usePhaserEvent } from './utility/hooks';
import type { IRefPhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import { allEquipment, deleteAscean, getAscean, getAsceans, getInventory, getSettings, populate, saveTutorial, scrub } from './assets/db/db'; 
import GameToast from './ui/GameToast';
import { Puff } from 'solid-spinner';

const TIPS = [
    "This game saves pertinent progress whenever you tamper with your inventory, change settings, or resolve combat.", 
    "You may change your settings at any time; from difficulty, remapping buttons, and sound, to visual effects, this may aid in your success.", 
    "You may pause the game at any time. The game itself pauses when various menus are brought up.",
    "You may change around your armor and weapons at any time, even in the middle of combat.",
    "There is a quick, combat menu that pauses the game and allows you to choose from available weapons, damage types, and prayers.",
    "When leveling, you have the opportunity to redress certain behaviors. You may change your faith, mastery, and add 2 points to your attributes.",
    "Not all enemies are aggressive, but even those passive may be provoked. Careful how you speak to strangers in this world.",
    "Loot may be gained from defeating enemies--at least one is guaranteed. For safer methods, merchants can also be found peddling such wares.",
    "Most inventory can be equipped, provided you are a high enough level relative to its rarity.",
    "You may be able to forge a higher rarity item from three lower rarity items, if you have the gold.",
    "Some special abilities are depending on your health, others mastery, and some weapon. Refer to the Gameplay character sheet to read the descriptions.",
    "Parrying only functions if you are melee attacking, and you can parry projectiles if you are capable.",
    "Dodge and Roll differ in application. Dodging is a defensive action, and does not trigger a weapon attack. Rolling is an offensive action, and may trigger a weapon attack.",
    "You may have up to three weapons equipped at a time, and may switch between them at in the quick combat menu.",
    "Try different special abilities to see which ones work best for your playstyle. Some may be more effective given how you've designed your character.",
    "The game is not over when you 'die.' You simply must find a way to regain health, whether through a special ability, or a flask of firewater.",
    "There are a variety of merchants, each with their own specialties. Some may be more to your liking, or willing to barter than others..",
    "Enemies are all human, and play as such. They may adapt to your strategies, and find ways to counter your strengths.",
    "It has been 7 years since the Great Northren War ended. King Mathyus Caderyn II worked with the Soverains in the Nothren'eas during the Ascea of 140 AE.",
    "The Ghost Hawk of Greyrock, Theogeni Spiras, has recently extinguished an ancient house of the Firelands, the Ashfyres. Former Protectorates, this comes about from a longstanding feud and civil war post-Ascea 130 AE.",
    "General Evrio Lorian Peroumes is campaigning in the Cragorean Mountains, north of Licivitas, to quell the warring humanoid tribes. Last seen in 140 AE, winning the Ascea, his immediate endeavor to secure an army for the upcoming campaign was secured as he kneeled to receive his crown as the va'Esai.",
    "The daughter of Soverain Garrick Myelle, Jadei Myelle, was chosen in a council of the Soverains as the bride in the treaty between the Daethic Kingdom and the Soverains. To this this, no child has been bore to the union, with some in the Daethic Kingdom in a state of unrest, the only surviving son of the king, married to a foreign bride.",
    "The Ascean, the va'Esai, are titles bestowed to the winner of the Ascea--a decennial tournament held in Licivitas, where the greatest of all provinces meet to compete, conduct diplomacy, and gamble. During the last Ascea of 140 AE, the Daethic Kingdom and Soverains secured a treaty during the armistice.",
    "The va'Esai is a spiritual title ranking your accomplishments in these more docile times as parity with mythic heroes of old: Laetrois Ath'Shaorah, prophet of Daethos, holding the original title.",
    "The Ascean va'Esai translates from ancient Shaorahi to `To be worthy of the preservation of being.` It is the highest honor recognized outside the political and religious realms, and former bearers are seen as modern day heroes.",
    "The Arbiters, traveling judges of the ley, are well respected for their adherence to their duty. They are known to be impartial, and are often called upon to settle disputes between provinces, and gain perspective on matters domestic.",
    "Sages come in various forms: the wandering observer who is voracious in their notation--endlessly sending feathers back to the Museum in Licivitas; the scholar hired as tutor for those who can afford, bespoke to their desire--at times mischievious; the engineer, putting a sage's thought to application and the reason for some bizarre machinations--at times useful, say, in war.",
    "The Seyr of Daethos is located in the city of Lor, in the north east of Licivtas. It is the largest of the temples--near a city within. The Seyr is the center of the Daethic faith, its devoted often pilgramage to it at least once in their lifetime.",
    "The Ancients are contentious in belief. Some argue they were as we were, others that they were more, if human in design at all. Interesting their existence is never in question, only their nature.",
    "Worship of the Ancients is still praticed in most provinces, though strongest in the Soverains. The Daethic Kingdom is the only province to have a state religion; despite Licivitas being its center with the Seyr, they are officially declared.",
    "The Soverains are a collection of rough borders, each with their own ruler, who come together to form a council to stave off King Mathyus II during the Great Nothren War. Some have since started working together more harmoniously, with others reverting back to isolation.",
    "The West Fangs are the lands west of Licivitas, found after the Sundering in the War of the Ancients. Its inhabitants seem to be various exiles of the North, Licivitas, and the Firelands, who form a loose confederation of battle clans--though participation seems asymmetrical.",
    "The Teeth are the craggly, jagged cliff faces of the West Fangs, settled by explorers of Licivitas--pushed there from warring battle clans. Being a savvier sort, the Li'ivi made due and built unthinkable ports and pulleys to traverse the cliffs, and were able to sustain themselves and eventually proliferate from being the only peoples around to access the water.",
    "Independence was eventually sought by the settlers of the Teeth against Licivitas, who were a burden on the port cities resources and wealth, and whom rarely gave aid in times of distress and war with the hostile battle clans. Each city now is ruled by its own appointed leader, whom chooses council.",
    "The Astralands; harsh, stormy, and with little arable land, it lies east of Licivitas, protected by the Spine, a high and jagged mountainous range. The people are known for their biting wit and savage practice of war, they are the `only ones not to have fallen` during the War of the Ancients, and are unique in their near monotheism of Astra, the Ancient of Lightning.",
    "Ashtre are heralded for their practice of war, reactive to the enemy, terrain, and weather--having inculcated all scenarios of other provincial formations and styles. Known to have the most advanced navy, they are the only province to possess a standing army.",
    "In the middle southron province of Sedyrus--as has recently been deigned to be called by its conquerors, the Sedyreal of the northern, inhospitable desert mountains, who have taken the land in totality from the Quor'eite in its southernmost jungles and beaches.",
    "Sedyreal are esteemed for their horsemanship, coupled with their martial nature, were only stymied in the Sedyren War against Licivitas by the sheer logistical might of the Li'ivi. It is a testament to their endurance that, once the war against Licivitas ended, they initiated and won the southern Quor'eia against the Quor'eite.",
    "The Quor'eite are a people of the southernmost jungles and beaches of Sedyrus, who have been assimilated and dispersed by the Sedyreal. A more charming and energetic people, and capable in their own right, their ability to survive in the jungle did not thwart the tenacity of the Sedyreal.",
    "The Fyers are considered lucky, as evidenced by the land they inhabit. Rich in soil, minerals, and water, they are the most naturally wealthy of all provinces, even if not yet harvested. This boon has granted them leisurely pursuits, and a more relaxed demeanor as of late. Some have event welcomed Daethos to their homes.",
];

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
    const [alert, setAlert] = createSignal({ header: '', body: '', delay: 0, key: '' });
    const [show, setShow] = createSignal<boolean>(false);
    let phaserRef: IRefPhaserGame;
    let tips: string | number | NodeJS.Timeout | undefined =  undefined;

    createEffect(() => {
        fetchAsceans();
    });

    function destroyGame(): void {
        try {
            setMenu({ ...menu(), loaded: false }); // choosingCharacter: true,
            const scene = phaserRef.scene as Game;
            scene.cleanUp();            
            scene.scene.stop('Game');
            scene.scene.stop('Intro');
            scene.scene.start('MainMenu');
            setAscean(undefined as unknown as Ascean);
            EventBus.emit('enter-game');
        } catch (err: any) {
            console.warn('Error destroying Game:', err);
        };
    };
    
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
        setAscean(beast?.ascean as Ascean);
        setMenu({ ...menu(), asceans: menuAscean as Ascean[], creatingCharacter: false });
    };

    async function deleteCharacter(id: string | undefined): Promise<void> {
        try {
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
            const beast = asceanCompiler(pop);
            const full = { ...beast?.ascean, inventory: inv };
            setAscean(full as Ascean);
        } catch (err: any) {
            console.warn('Error fetching Ascean:', err);
        };
    };

    async function loadAscean(id: string): Promise<void> {
        try {
            EventBus.emit('preload-ascean', id);
            const asc: Ascean = menu()?.asceans?.find((asc: Ascean) => asc._id === id) as Ascean;
            setAlert({ header: 'Loading Game', body: `Preparing ${asc.name}. Good luck.`, delay: 3000, key: '' });
            setShow(true);
            const inv = await getInventory(asc?._id as string);
            const full = { ...asc, inventory: inv };
            setAscean(full);
            setMenu({ ...menu(), choosingCharacter: false, gameRunning: true, playModal: false });
            const set = await getSettings(id);
            setSettings(set);
            setTimeout(() => {
                EventBus.emit('enter-game');
                // === Tips === \\
            }, 2500);
            if (set.difficulty.tidbits === true) {
                setTips(true);
            };
        } catch (err: any) {
            console.warn('Error loading Ascean:', err);
        };
    };

    const makeToast = (header: string, body: string, delay = 3000, key = ''): void => {
        setAlert({ header, body, delay, key });
        setShow(true);    
    };

    const setTips = (on: boolean): void => {
        console.log('Setting Tips:', on);
        if (on) {
            const interval: number = 1000 * 60 * 3; // 3 minutes
            tips = setInterval(() => {
                const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
                setAlert({ header: 'Gameplay Tidbit', body: tip, delay: 10000, key: 'Close' }); // 10000
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

    async function quickAscean(vaEsai: Ascean): Promise<void> {
        try {
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

    const updateAscean = async (vaEsai: Ascean): Promise<void> => {
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

    function switchScene(next: string): void {
        setShow(false);
        const scene = phaserRef.scene as Phaser.Scene;
        console.log('Switching Scene from ', scene.scene.key, ' to: ', next);
        EventBus.emit('switch-scene', { current: scene.scene.key, next });
    };

    const actions = {
        'Enter Tent': () => switchScene('Tent'),
        'Close': () => setShow(false),
        'Exit World': () => switchScene('Game'),
    };

    usePhaserEvent('destroy-game', destroyGame);
    usePhaserEvent('alert', (payload: { header: string, body: string, delay?: number, key?: string }) => makeToast(payload.header, payload.body, payload.delay, payload.key));
    usePhaserEvent('set-tips', setTips);
    usePhaserEvent('enter-menu', enterMenu);
    usePhaserEvent('fetch-ascean', fetchAscean);
    usePhaserEvent('quick-ascean', quickAscean);
    usePhaserEvent('save-ascean', saveAscean);
    usePhaserEvent('update-ascean', updateAscean);
    usePhaserEvent('update-pause', togglePause);
    usePhaserEvent('request-settings', () => {
        EventBus.emit('settings', settings());
    });
    usePhaserEvent('update-settings', (set: any) => {
        setSettings(set);
    });
    usePhaserEvent('player-ascean', () => EventBus.emit('player-ascean-ready', ascean()));
    usePhaserEvent('save-intro', async () => {
        await saveTutorial(ascean()?._id as string, 'intro');
        await fetchAscean(ascean()?._id as string);

        const scene = phaserRef.scene as Phaser.Scene; // 'intro'
        scene.scene.stop('Intro');
        scene.scene.wake('Game');
        const game = scene.scene.get('Game') as Game;
        game.musicBackground.resume();
        EventBus.emit('current-scene-ready', game);
    });
    usePhaserEvent('sleep-scene', (key: string) => {
        const scene = phaserRef.scene as Phaser.Scene;
        const game = scene.scene.get('Game') as Game;
        game.musicBackground.pause();
        scene.scene.sleep(key);
        // scene.scene.setVisible(false, key);
    })
    usePhaserEvent('fetch-button-reorder', () => {
        EventBus.emit('reorder-buttons', { list: settings().actions, type: 'action' });
        EventBus.emit('reorder-buttons', { list: settings().specials, type: 'special' });
    });
    return (
        <div id="app">
            <PhaserGame ref={(el: IRefPhaserGame) => phaserRef = el} currentActiveScene={currentScene} menu={menu} setMenu={setMenu} ascean={ascean} settings={settings} setSettings={setSettings} scene={scene} />
            {(scene() === 'MainMenu') && (<>
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
                    <GameToast actions={actions} show={show} setShow={setShow} alert={alert} setAlert={setAlert as Setter<{ header: string; body: string; delay: number; key?: string; }>} />
                </div>
            </Show>
        </div>
    );
};