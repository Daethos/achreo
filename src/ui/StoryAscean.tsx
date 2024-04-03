import { Accessor, Match, Setter, Show, Switch, createEffect, createSignal } from 'solid-js';
import { Form } from 'solid-bootstrap';
import AsceanImageCard from '../components/AsceanImageCard';
import AttributeModal, { AttributeCompiler } from '../components/Attributes';
import InventoryPouch from './InventoryPouch';
import { EventBus } from '../game/EventBus';
import HealthBar from './HealthBar';
import ExperienceBar from './ExperienceBar';
import Firewater from './Firewater';
import { ActionButtonModal, Modal } from '../utility/buttons';
import { font } from '../utility/styling';
import ItemModal from '../components/ItemModal';
import Equipment, { getOneRandom } from '../models/equipment';
import { useResizeListener } from '../utility/dimensions';
import { Attributes } from '../utility/attributes';
import Settings from '../models/settings';
import Ascean from '../models/ascean';
import { GameState } from '../stores/game';
import { Combat } from '../stores/combat';
import Highlight from './Highlight';
import { deleteEquipment, updateSettings } from '../assets/db/db';
import SettingSetter from '../utility/settings';
import TutorialOverlay from '../utility/tutorial';

// import { updateInventory, updateSettings } from '../assets/db/db';
// import { playerTraits } from '../utility/ascean';
// import LevelUpModal from './LevelUpModal';

export const viewCycleMap = {
    Character: 'Inventory',
    Inventory: 'Settings',
    Settings: 'Character'
};
const CHARACTERS = {
    STATISTICS: 'Statistics',
    TRAITS: 'Traits',
};
const VIEWS = {
    CHARACTER: 'Character',
    INVENTORY: 'Inventory',
    SETTINGS: 'Settings',
};
const SETTINGS = {
    ACTIONS: 'Actions',
    CONTROL: 'Control',
    INVENTORY: 'Inventory',
    GENERAL: 'General',
    TACTICS: 'Tactics',
};
const CONTROLS = {
    BUTTONS: 'Buttons',
    POST_FX: 'Post FX',
};
const ACTIONS = ['Attack', 'Posture', 'Roll', 'Dodge', 'Counter'];
const SPECIALS = ['Consume', 'Invoke', 'Polymorph', 'Root', 'Snare', 'Tshaeral']; // 'Charm', 'Confuse', 'Fear', 

interface Props {
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    ascean: Accessor<Ascean>; 
    asceanState: Accessor<any>;
    game: Accessor<GameState>;
    combatState: Accessor<Combat>;
};

const StoryAscean = ({ settings, setSettings, ascean, asceanState, game, combatState }: Props) => {
    // const [playerTraitWrapper, setPlayerTraitWrapper] = createSignal({});
    const [dragAndDropInventory, setDragAndDropInventory] = createSignal(game()?.inventory);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [inventoryType, setInventoryType] = createSignal<string>('');
    const [highlighted, setHighlighted] = createSignal<{ item: Equipment | undefined; comparing: boolean; type: string }>({ item: undefined, comparing: false, type: '' });
    const [show, setShow] = createSignal<boolean>(false);
    const [actionShow, setActionShow] = createSignal<boolean>(false);
    const [currentAction, setCurrentAction] = createSignal({
        action: ACTIONS[0],
        index: 0,
    });
    const [counterShow, setCounterShow] = createSignal<boolean>(false);
    const [currentCounter, setCurrentCounter] = createSignal({ counter: '', index: 0 });
    const [specialShow, setSpecialShow] = createSignal<boolean>(false);
    const [currentSpecial, setCurrentSpecial] = createSignal({
        special: SPECIALS[0],
        index: 0,
    });
    const [inspectModalShow, setInspectModalShow] = createSignal<boolean>(false);
    const [inspectItems, setInspectItems] = createSignal<{ item: Equipment | undefined; type: string; }[]>([{ item: undefined, type: '' }]);
    const [attrShow, setAttrShow] = createSignal<boolean>(false);
    const [asceanPic, setAsceanPic] = createSignal<string>('');
    const [ringCompared, setRingCompared] = createSignal<string>('');
    const [removeModalShow, setRemoveModalShow] = createSignal<boolean>(false);
    const [weaponCompared, setWeaponCompared] = createSignal<string>('');
    const [showTutorial, setShowTutorial] = createSignal<boolean>(false);
    const [showInventory, setShowInventory] = createSignal<boolean>(false);
    const [tutorial, setTutorial] = createSignal<string>('');

    const dimensions = useResizeListener();
 
    createEffect(() => {
        if (ascean) {
            setAsceanPic(`../assets/images/${ascean().origin}-${ascean().sex}.jpg`);
        };
    });

    createEffect(() => {
        if (!ascean().tutorial.views) {
            console.log('Tutorial Views');
            setShowTutorial(true);
            setTutorial('views');
        } else if (!ascean().tutorial.inventory && dragAndDropInventory().length && settings().asceanViews === 'Inventory') {
            setShowTutorial(true);
            setTutorial('inventory');
        } else if (!ascean().tutorial.settings && settings().asceanViews === 'Settings') {
            setShowTutorial(true);
            setTutorial('settings');
        } else if (!ascean().tutorial.character && settings().asceanViews === 'Character') {
            setShowTutorial(true);
            setTutorial('character');
        };
    });

    createEffect(() => {
        setDragAndDropInventory(game().inventory);
        checkHighlight();
        //     EventBus.emit('refresh-inventory', dragAndDropInventory);
    }); 
    const checkHighlight = () => {
        if (highlighted()?.item) {
            const item = game().inventory.find((item) => item?._id === highlighted()?.item?._id);
            console.log(item, 'Item in checkHighlight')
            if (!item) setHighlighted({ item: undefined, comparing: false, type: '' });
        };
    }; 

    const saveSettings = async (newSettings: Settings) => {
        try {
            await updateSettings(newSettings);
        } catch (err) {
            console.warn(err, "Error Saving Game Settings");
        };
    };

    const currentCharacterView = async (e: string) => {
        console.log(e, "Character div");
        const newSettings: Settings = { ...settings(), characterViews: e };
        setSettings(newSettings);
        await saveSettings(newSettings);
        // EventBus.emit('settings', newSettings);
    };

    // const shake = (value, action) => setSettings({ ...settings(), shake: { ...settings().shake, [action]: value } });
    // const handleShakeDurationChange = (e) => shake(parseFloat(e.target.value), 'duration');
    // const handleShakeIntensityChange = (e) => shake(parseFloat(e.target.value), 'intensity');
    // const handleVibrationChange = (e) => setGameState({ ...game, vibration: parseFloat(e.target.value)});
    // const handleVolumeChange = (e) => setGameState({ ...game, volume: parseFloat(e.target.value)});

    const createCharacterInfo = (character: string) => {
        switch (character) {
            case CHARACTERS.STATISTICS:
                // const highestDeity = Object.entries(ascean?.statistics?.combat?.deities).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
                // const highestPrayer = Object.entries(ascean?.statistics?.combat?.prayers).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
                // let highestMastery = Object.entries(ascean?.statistics?.mastery).reduce((a, b) => a[1] > b[1] ? a : b);
                // if (highestMastery?.[1] === 0) highestMastery = [ascean?.mastery, 0];
                return (
                    <div>
                        <div>Attacks</div>
                            {/* Magical: <div class='gold'>{ascean?.statistics?.combat?.attacks?.magical}</div>{'\n'}
                            Physical: <div class='gold'>{ascean?.statistics?.combat?.attacks?.physical}</div>{'\n'}
                            Highest Damage: <div class='gold'>{Math.round(ascean?.statistics?.combat?.attacks?.total)}</div> */}
                            <br /><br />
                        <div>Combat</div>
                            {/* Mastery: <div class='gold'>{highestMastery[0].charAt(0).toUpperCase() + highestMastery[0].slice(1)} - {highestMastery[1]}</div>{'\n'}
                            Wins / Losses: <div class='gold'>{ascean?.statistics?.combat?.wins} / {ascean?.statistics?.combat?.losses}</div> */}
                            <br /><br />
                        <div>Prayers</div>
                            {/* Consumed / Invoked: <div class='gold'>{ascean?.statistics?.combat?.actions?.consumes} / {ascean?.statistics?.combat?.actions?.prayers} </div>{'\n'}
                            Highest Prayer: <div class='gold'>{highestPrayer[0].charAt(0).toUpperCase() + highestPrayer[0].slice(1)} - {highestPrayer[1]}</div>{'\n'}
                            Favored Deity: <div class='gold'>{highestDeity[0]}</div>{'\n'}
                            Blessings: <div class='gold'>{highestDeity[1]}</div> */}
                    </div>
                );
            case CHARACTERS.TRAITS:
                return (
                    <div>
                    <div>Traits</div>
                    {/* <div>{playerTraitWrapper?.primary?.name}</div>
                        <div>{playerTraitWrapper?.primary?.traitOneName} - {playerTraitWrapper?.primary?.traitOneDescription}</div>
                        <div>{playerTraitWrapper?.primary?.traitTwoName} - {playerTraitWrapper?.primary?.traitTwoDescription}</div>
                    <div>{playerTraitWrapper?.secondary?.name}</div>
                        <div>{playerTraitWrapper?.secondary?.traitOneName} - {playerTraitWrapper?.secondary?.traitOneDescription}</div>
                        <div>{playerTraitWrapper?.secondary?.traitTwoName} - {playerTraitWrapper?.secondary?.traitTwoDescription}</div>
                    <div>{playerTraitWrapper?.tertiary?.name}</div>
                        <div>{playerTraitWrapper?.tertiary?.traitOneName} - {playerTraitWrapper?.tertiary?.traitOneDescription}</div>
                        <div>{playerTraitWrapper?.tertiary?.traitTwoName} - {playerTraitWrapper?.tertiary?.traitTwoDescription}</div> */}
                    </div>
                );
            default:
                return ('');
        };
    }; 

    // async function setVolume(volume: number) { 
    //     const newSettings: Settings = { ...settings(), volume: volume };
    //     setSettings(newSettings);
    //     // await saveSettings(newSettings);
            // EventBus.emit('settings', newSettings);
    //     EventBus.emit('update-volume', volume);
    // };

    async function currentControl(e: string) {
        const newSettings: Settings = { ...settings(), control: e };
        setSettings(newSettings);
        await saveSettings(newSettings);
        // EventBus.emit('settings', newSettings);
    };

    async function currentView(e: string) {
        console.log(e, "Current Setting div");
        const newSettings: Settings = { ...settings(), settingViews: e };
        console.log(newSettings, "New Settings");
        // setSettingViews(createSettingInfo(settings().settingViews));
        setSettings(newSettings);
        await saveSettings(newSettings);
        // EventBus.emit('settings', newSettings);
    };

    async function setNextView() {
        const nextView = viewCycleMap[settings().asceanViews as keyof typeof viewCycleMap];
        if (nextView) {
            console.log(nextView, "Next div")
            const newSettings: Settings = { ...settings(), asceanViews: nextView };
            setSettings(newSettings);
            await saveSettings(newSettings);
            // EventBus.emit('settings', newSettings);
        };
    }; 

    function actionModal(action: string, index: number) {
        setCurrentAction({ action: action, index: index });
        setActionShow(true);
    };

    function counterModal(counter: string, index: number) {
        setCurrentCounter({ counter: counter, index: index });
        setCounterShow(true);
    };

    function specialModal(special: string, index: number) {
        setCurrentSpecial({ special: special, index: index });
        setSpecialShow(true);
    };

    async function handleActionButton(e: string, i: number) {
        const newActions = [...settings().actions];
        const newAction = e;
        
        const oldAction = newActions[i];
        newActions[newActions.indexOf(newAction)] = oldAction;
        newActions[i] = newAction;
        
        const newSettings: Settings = { ...settings(), actions: newActions };
        await saveSettings(newSettings);
        // EventBus.emit('settings', newSettings);
        setSettings(newSettings);
        EventBus.emit('reorder-buttons', { list: newActions, type: 'action' }); 
    };

    function handleCounterButton(e: string) {
        console.log(e, "Counter Button");
        setCounterShow(false);
        EventBus.emit('blend-combat', { counterGuess: e.toLowerCase() })
    };

    function handleCounterShow(e: string) {
        setCounterShow(true);
        // EventBus.emit('blend-combat', { counterGuess: e })
    };

    async function handleSpecialButton(e: string, i: number) {
        const newSpecials = [...settings().specials];
        const newSpecial = e;

        if (newSpecials.includes(newSpecial)) {
            const oldSpecial = newSpecials[i];
            newSpecials[newSpecials.indexOf(newSpecial)] = oldSpecial;
        };
        newSpecials[i] = newSpecial;
        const newSettings: Settings = { ...settings(), specials: newSpecials };
        setSettings(newSettings);
        await saveSettings(newSettings);
        // EventBus.emit('settings', newSettings);
        EventBus.emit('reorder-buttons', { list: newSpecials, type: 'special' }); 
    };

    async function handlePostFx(type: string, val: any) {
        console.log(type, val, "Post FX");
        EventBus.emit('update-postfx', { type, val });
        const newSettings = { ...settings(), postFx: { ...settings().postFx, [type]: val } };
        console.log(newSettings.postFx, "New Post FX")
        await saveSettings(newSettings);
        setSettings(newSettings);
        // EventBus.emit('settings', newSettings);
    };

    async function freeInventory() {
        try {
            const item = await getOneRandom(ascean().level);
            console.log('Item: ', item?.[0]?.name);
            EventBus.emit('add-item', item);
        } catch (err: any) {
            console.warn(err, 'Error in Free Inventory');
        };
    };

    function handleInspect(type: string) {
        try {
            if (type === 'weaponOne' || type === 'weaponTwo' || type === 'weaponThree') {
                setWeaponCompared(type);
            } else if (type === 'ringOne' || type === 'ringTwo') {
                setRingCompared(type);
            };
            setInspectModalShow(false);
        } catch (err) {
            console.warn(err, '<- This is the error in Inspecting Equipment');
        };
    };

    async function removeItem(id: string) {
        await deleteEquipment(id);
        const newInventory = game().inventory.filter((item) => item._id !== id);
        EventBus.emit('refresh-inventory', newInventory);
        setRemoveModalShow(false);
    };

    return (
        <div style={{ 'z-index': 1, position: 'fixed', top: 0, left: 0 }}>
        { settings().asceanViews === VIEWS.CHARACTER ? ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}>
                <div class='playerMenuHeading'>Character</div>
            </button>
            <div class='playerSettingSelect' style={{ position: 'fixed', top: 0, right: '10vh', 'z-index': 1 }}>
            { settings().characterViews === CHARACTERS.STATISTICS ? (
                <button class='highlight p-3' onClick={() => currentCharacterView(CHARACTERS.TRAITS)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>
                    <div class='playerSetting'>Statistics</div>
                </button>
            ) : (
                <button class='highlight p-3' onClick={() => currentCharacterView(CHARACTERS.STATISTICS)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>
                    <div class='playerSetting'>Traits</div>
                </button>
            ) }     
            </div> 
        </> ) : settings().asceanViews === VIEWS.INVENTORY ? ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}><div class='playerMenuHeading'>Inventory</div></button>
            <Firewater ascean={ascean} />
        </> ) : settings().asceanViews === VIEWS.SETTINGS ? ( <>
            <button class='highlight' style={{ 'margin-left': '0.5%' }} onClick={() => setNextView()}><div class='playerMenuHeading'>Settings</div></button>

            <div class='playerSettingSelect' style={{ position: 'fixed', top: 0, right: '10vh', 'z-index': 1 }}>
                <button class='highlight p-3' onClick={() => currentView(SETTINGS.ACTIONS)}><div class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Actions</div></button>
                <button class='highlight p-3' onClick={() => currentView(SETTINGS.CONTROL)}><div class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Control</div></button>
                <button class='highlight p-3' onClick={() => currentView(SETTINGS.GENERAL)}><div class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>General</div></button>
                <button class='highlight p-3' onClick={() => currentView(SETTINGS.INVENTORY)}><div class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Inventory</div></button>
                <button class='highlight p-3' onClick={() => currentView(SETTINGS.TACTICS)}><div class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Tactics</div></button>
            </div>
        </> ) : ( '' ) }
        {/* <<----- WINDOW ONE ----->> */}
        <Show when={settings().control !== CONTROLS.POST_FX || settings().asceanViews !== VIEWS.SETTINGS}>
            <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? 
                { height: `${dimensions().HEIGHT * 0.8}px`, left: '0.5vw', overflow: 'hidden' } : { height: `${dimensions().HEIGHT * 0.31}`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, }}>
                    { dragAndDropInventory().length < 300 && (
                        <button class='highlight cornerTR' style={{ 'background-color': 'blue', 'z-index': 1, 'font-size': '0.25em', padding: '0.25em' }}onClick={() => freeInventory()}>
                            <p>Get Gear</p>
                        </button>
                    ) }
                {/* { (ascean().experience === ascean().level * 1000) && (
                    <LevelUpModal asceanState={asceanState} />
                ) }  */}
                <div class='gold' style={dimensions().ORIENTATION === 'landscape' ? { margin: '5%', 'text-align': 'center' } : { margin: '5%', 'text-align': 'center' }}>
                    {combatState()?.player?.name}
                </div>
                <HealthBar combat={combatState} />
                <div style={dimensions().ORIENTATION === 'landscape' ? { 'margin-left': '0', 'margin-top': '7.5%', transform: 'scale(0.9)' } : { 'margin-left': '5%', transform: 'scale(0.75)', 'margin-top': '20%' }}>
                    <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
                </div>
                <div style={{ 'margin-top': '-5%' }}>
                    <ExperienceBar totalExperience={ascean().level * 1000} currentExperience={ascean().experience} />
                </div>
            </div>
        </Show>
        {/* <<----- WINDOW TWO -----> */}
        <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? { height: `${dimensions().HEIGHT * 0.8}px`, left: '33.5vw', } : {
            height: `${dimensions().HEIGHT * 0.31}px`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, 'margin-top': '64%'
        }}>
            { settings().asceanViews === VIEWS.CHARACTER ? (
                <div class='center creature-heading' style={{ overflow: 'scroll' }}>
                    { dimensions().ORIENTATION === 'landscape' ? ( <>
                        <img id='origin-pic' src={asceanPic()} alt={ascean().name} style={{ 'margin-top': '5%', 'margin-bottom': '5%' }} />
                        <h2>{combatState()?.player?.description}</h2>
                    </> ) : ( <>
                        <h2 style={{ 'margin-top': '15%' }}>
                            <span>
                                <img id='origin-pic' src={asceanPic()} alt={ascean().name} style={{ position: 'absolute', left: '-75%', top: '50%' }} />
                            </span>
                            {combatState()?.player?.description}
                        </h2>
                    </> ) }

                    <div class='propertyBlock' style={{ 'margin-bottom': '0%', 'font-size': '0.9em', 'font-family': 'Cinzel Regular' }}>
                        <div>Level: <span class='gold'>{combatState()?.player?.level}</span>{'\n'}</div>
                        <div>Silver: <span class='gold'>{ascean().currency.silver}</span> Gold: <span class='gold'>{ascean().currency.gold} {'\n'}</span></div>
                        <div>Mastery: <span class='gold'>{combatState()?.player?.mastery?.charAt(0).toUpperCase() as string + combatState()?.player?.mastery.slice(1)}</span>{'\n'}</div>
                        <div>Magical Defense: <span class='gold'>{combatState()?.playerDefense?.magicalDefenseModifier}% / [{combatState()?.playerDefense?.magicalPosture}%]</span>{'\n'}</div>
                        <div>Physical Defense: <span class='gold'>{combatState()?.playerDefense?.physicalDefenseModifier}% / [{combatState()?.playerDefense?.physicalPosture}%]</span>{'\n'}</div>
                        <div>Stamina: <span class='gold'>{combatState()?.playerAttributes?.stamina}</span></div>
                    </div>
                    <div style={{ transform: 'scale(0.9)' }}>
                    <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                    </div>
                </div>
            ) : settings().asceanViews === VIEWS.INVENTORY ? (
                highlighted().comparing && (
                    <Highlight ascean={ascean} highlighted={highlighted as Accessor<{item: Equipment, comparing: boolean, type: string}>} inventoryType={inventoryType} ringCompared={ringCompared} weaponCompared={weaponCompared} 
                        setInspectItems={setInspectItems} setInspectModalShow={setInspectModalShow} setRemoveModalShow={setRemoveModalShow} removeModalShow={removeModalShow} />
                    // <Inventory pouch={dragAndDropInventory} inventory={highlighted} ascean={ascean} removeModalShow={removeModalShow} setRemoveModalShow={setRemoveModalShow} ringCompared={ringCompared} setRingCompared={setRingCompared} 
                    //     weaponCompared={weaponCompared} setWeaponCompared={setWeaponCompared} setEquipModalShow={setEquipModalShow} equipModalShow={equipModalShow} setInspectItems={setInspectItems} inspectItems={inspectItems} 
                    //     setInspectModalShow={setInspectModalShow} inspectModalShow={inspectModalShow} index={0} compare={true} setHighlighted={undefined} highlighted={undefined} />
                )
            ) : settings().asceanViews === VIEWS.SETTINGS ? (
                <div class='center' style={{ display: 'flex', 'flex-direction': 'row' }}>
                    <div class='gold' style={{ position: 'absolute', top: '2%', 'font-size': '1.25em', display: 'inline' }}>Gameplay Controls <br />
                        <button class='highlight' style={{ 'font-size': '0.5em', display: 'inline' }} onClick={() => currentControl(CONTROLS.BUTTONS)}>Buttons</button>
                        <button class='highlight' style={{ 'font-size': '0.5em', display: 'inline' }} onClick={() => currentControl(CONTROLS.POST_FX)}>PostFx</button>
                    </div>
                    <Switch>
                        <Match when={settings().control === CONTROLS.BUTTONS}>
                            <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '30%' } : { 'margin-top': '50%' }}>
                            <div style={font('1em', '#fdf6d8')}>Action Buttons<br /></div>
                            {settings().actions?.map((action: string, index: number) =>
                                <button class='highlight' onClick={() => actionModal(action, index)}>
                                    <div style={{ width: '100%', 'font-size': '0.75em', margin: '3%' }}><span class='gold'>{index + 1} </span> {action}</div>
                                </button>
                            )}
                            </div>
                            <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '30%' } : { 'margin-top': '50%' }}>
                                <div style={font('1em', '#fdf6d8')}>Special Buttons<br /></div>
                                {settings().specials?.map((special: string, index: number) => 
                                    <button  class='highlight' onClick={() => specialModal(special, index)}>
                                        <div style={{ width: '100%', 'font-size': '0.75em', margin: '3%' }}><span class='gold'>{index + 1} </span> {special}</div>
                                    </button>
                                )}
                            </div>
                        </Match>
                        <Match when={settings().control === CONTROLS.POST_FX}>
                            <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '30%' } : { 'margin-top': '50%' }}>
                                <div style={font('0.75em', '#fdf6d8')}>PostFx
                                <button class='highlight' onClick={() => handlePostFx('enable', !settings().postFx?.enable)}>
                                    {settings().postFx?.enable ? 'On' : 'Off'}
                                </button> 
                                </div>

                                <div style={font('0.75em', '#fdf6d8')}>Chromatic Abb.
                                <button class='highlight' onClick={() => handlePostFx('chromaticEnable', !settings().postFx?.chromaticEnable)}>
                                    {settings().postFx?.chromaticEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Chab ({settings().postFx.chabIntensity})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.chabIntensity} onChange={(e) => handlePostFx('chabIntensity', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />



                                <div style={font('0.75em', '#fdf6d8')}>Vignette Enable
                                <button class='highlight' onClick={() => handlePostFx('vignetteEnable', !settings().postFx?.vignetteEnable)}>
                                    {settings().postFx?.vignetteEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Vignette Strength ({settings().postFx.vignetteStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vignetteStrength} onChange={(e) => handlePostFx('vignetteStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                <div style={font('0.75em', '#fdf6d8')}>Vignette Intensity ({settings().postFx.vignetteIntensity})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vignetteIntensity} onChange={(e) => handlePostFx('vignetteIntensity', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />

                                <div style={font('0.75em', '#fdf6d8')}>Noise Enable
                                <button class='highlight' onClick={() => handlePostFx('noiseEnable', !settings().postFx?.noiseEnable)}>
                                    {settings().postFx?.noiseEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Noise Strength ({settings().postFx.noiseStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.noiseStrength} onChange={(e) => handlePostFx('noiseStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                <div style={font('0.75em', '#fdf6d8')}>Noise Seed ({settings().postFx.noiseSeed})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.noiseSeed} onChange={(e) => handlePostFx('noiseSeed', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />


                                <div style={font('0.75em', '#fdf6d8')}>VHS Enable
                                <button class='highlight' onClick={() => handlePostFx('vhsEnable', !settings().postFx?.vhsEnable)}>
                                    {settings().postFx?.vhsEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>VHS Strength ({settings().postFx.vhsStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vhsStrength} onChange={(e) => handlePostFx('vhsStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />


                                <div style={font('0.75em', '#fdf6d8')}>Scanline Enable
                                <button class='highlight' onClick={() => handlePostFx('scanlinesEnable', !settings().postFx?.scanlinesEnable)}>
                                    {settings().postFx?.scanlinesEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Scanline Strength ({settings().postFx.scanStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.scanStrength} onChange={(e) => handlePostFx('scanStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />


                                <div style={font('0.75em', '#fdf6d8')}>CRT Enable
                                <button class='highlight' onClick={() => handlePostFx('crtEnable', !settings().postFx?.crtEnable)}>
                                    {settings().postFx?.crtEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>CRT Height ({settings().postFx.crtHeight})</div>
                                <Form.Range min={0} max={5} step={0.1} value={settings().postFx.crtHeight} onChange={(e) => handlePostFx('crtHeight', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                <div style={font('0.75em', '#fdf6d8')}>CRT Width ({settings().postFx.crtWidth})</div>
                                <Form.Range min={0} max={5} step={0.1} value={settings().postFx.crtWidth} onChange={(e) => handlePostFx('crtWidth', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                </div>
                        </Match>
                    </Switch>

                    {/* <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '20%' } : { 'margin-top': '50%' }}>
                        <div style={font('1em', '#fdf6d8')}>Action Buttons<br /></div>
                        {settings().actions?.map((action: string, index: number) =>
                            <button class='highlight' onClick={() => actionModal(action, index)}>
                                <div style={{ width: '100%', 'font-size': '0.75em', margin: '3%' }}><span class='gold'>{index + 1} </span> {action}</div>
                            </button>
                        )}
                    </div>
                    <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '20%' } : { 'margin-top': '50%' }}>
                        <div style={font('1em', '#fdf6d8')}>Special Buttons<br /></div>
                        {settings().specials?.map((special: string, index: number) => 
                            <button  class='highlight' onClick={() => specialModal(special, index)}>
                                <div style={{ width: '100%', 'font-size': '0.75em', margin: '3%' }}><span class='gold'>{index + 1} </span> {special}</div>
                            </button>
                        )}
                    </div> */}
                {/* <div><div>
                        Screenshake Duration <span class='gold'>({settings().shake.duration})</span>
                    </div><br /><br />
                    <Form.Range value={settings().shake.duration} onChange={handleShakeDurationChange} min={0} max={1000} step={50} />{'\n'}
                    
                    <div>
                        Screenshake Intensity <span class='gold'>({settings().shake.intensity})</span>
                    </div><br /><br />
                    <Form.Range value={settings().shake.intensity} onChange={handleShakeIntensityChange} min={0} max={5} step={0.25} />{'\n'}
                    <div>
                        Sound Volume <div class='gold'>({settings().volume})</div>
                    </div><br /><br /> 
                    <Form.Range value={settings().volume} onChange={handleVolumeChange} min={0} max={1} step={0.1} />{'\n'}

                    <div>
                        Vibration Time <div class='gold'>({settings().vibration})</div>
                    </div></div>     
                */}
                    {/* <Form.Range value={game().vibrationTime} onChange={handleVibrationChange} min={0} max={1000} step={50} /><br /><br /> */}
                    {/* <Pressable style={{ position: 'absolute', 'margin-left': '5%' }} onClick={() => setShow(true)}>
                        <div>Reset Scene</div>
                    </Pressable> */}
                    {/* <Modal show={show} onHide={() => setShow(false)} style={{ top: '-25%', 'z-index': 9999 }} centered>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'red' }}>Reset Scene</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>Are you sure you want to reset the scene?</div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Pressable style={{ color: 'gold' }} onClick={() => setShow(false)}>No</Pressable>
                            <Pressable style={{ color: 'red' }} onClick={() => restartGame()}>Yes</Pressable>
                        </Modal.Footer>
                    </Modal> */}
                    {/* <Pressable style={[styles.stdInput, { 'margin-top': '80%' }]} onClick={returnHome}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-return-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
                    </svg><div>Return Home</div> 
                    </Pressable> */}
                </div>
            ) : ( undefined ) }
        </div>
        {/* <<----- WINDOW THREE ----->> */}
        <Show when={settings().control !== CONTROLS.POST_FX || settings().asceanViews !== VIEWS.SETTINGS}>
            <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? {
                height: `${dimensions().HEIGHT * 0.8}px`, left: '66.5vw' 
            } : { 
                height: `${dimensions().HEIGHT * 0.31}px`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, 'margin-top': '129%'
            }}>
                { settings().asceanViews === VIEWS.CHARACTER ? (
                    <div class='superCenter'> 
                        {createCharacterInfo(settings()?.characterViews)}
                    </div>
                ) : settings().asceanViews === VIEWS.INVENTORY ? ( 
                    <InventoryPouch ascean={ascean} setRingCompared={setRingCompared} highlighted={highlighted} setHighlighted={setHighlighted} setInventoryType={setInventoryType} inventoryType={inventoryType}
                        setWeaponCompared={setWeaponCompared} setDragAndDropInventory={setDragAndDropInventory} dragAndDropInventory={dragAndDropInventory} />
                ) : settings().asceanViews === VIEWS.SETTINGS ? (
                    <div style={{ 'scrollbar-width': "none", overflow: 'scroll' }}> 
                        <div class='center' style={{ padding: '5%', 'font-size': '0.75em' }}>
                            {/* Various kinds of Information on Aspects of the Game. */}
                            <SettingSetter setting={settings} />
                        </div>
                    </div>
                ) : ( undefined ) }
            </div>
        </Show>

        <button class='highlight cornerTR' style={{ transform: 'scale(0.85)', position: 'fixed', top: '-1.5%', right: '-0.5%' }} onClick={() => EventBus.emit('show-player')}>
            <p style={font('0.5em')}>X</p>
        </button>
            <Show when={show()}>
                <div class='modal' onClick={() => setShow(!show)}>
                    <ItemModal item={equipment()} stalwart={combatState().isStalwart} caerenic={combatState().isCaerenic} /> 
                </div> 
            </Show>
            <Show when={actionShow()}> <>
                {/* <button onClick={() => setActionShow(!actionShow())}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, 'background-color': 'rgba(0, 0, 0, 0.75)' }} />
                </button> */}
                <div class='modal' onClick={() => setActionShow(!actionShow())}>
                    <ActionButtonModal currentAction={currentAction} actions={ACTIONS}  handleAction={handleActionButton} handleCounter={handleCounterShow} /> 
                </div>
            </> </Show>
            <Show when={attrShow()}>
                <div class='modal' onClick={() => setAttrShow(!attrShow())}>
                    <AttributeModal attribute={attribute()} />
                </div> 
            </Show>
            <Show when={counterShow()}> <>
                {/* <button onClick={() => setCounterShow(!counterShow())}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, 'background-color': 'rgba(0, 0, 0, 0.75)' }} />
                </button> */}
                <div class='modal'>
                    <ActionButtonModal currentAction={currentAction} actions={ACTIONS.filter(actions => actions !== 'Dodge')}  handleAction={handleCounterButton} /> 
                </div>
            </> </Show>
            <Show when={specialShow()}> <> 
                <div class='modal' onClick={() => setSpecialShow(!specialShow())}>
                    <ActionButtonModal currentAction={currentSpecial} actions={SPECIALS} handleAction={handleSpecialButton} special={true} /> 
                </div>
            </> </Show>
            <Show when={(inspectModalShow() && inspectItems())}> 
                <div class='modal'>
                <button onClick={() => setInspectModalShow(!inspectModalShow)}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, 'background-color': 'rgba(0, 0, 0, 0.75)' }} />
                </button>
                <div class='modal'>
                    <Modal items={inspectItems} inventory={highlighted().item} callback={handleInspect} show={inspectModalShow} setShow={setInspectModalShow} />
                </div>
                </div> 
            </Show>
            <Show when={removeModalShow()}>
                <div class='modal'>
                <div class='button superCenter' style={{ 'background-color': 'black', width: '25%' }}>
                    <div class='border'>
                    <div class='center' style={font('1.5em')}>Do You Wish To Remove and Destroy Your <span style={{ color: 'gold' }}>{highlighted()?.item?.name}?</span> <br /><br /><div>
                        <img style={{ transform: 'scale(1.25)' }} src={highlighted()?.item?.imgUrl} alt={highlighted()?.item?.name} onClick={() => removeItem(highlighted()?.item?._id as string)} />
                        <button class='highlight cornerBR' style={{ transform: 'scale(0.85)', bottom: '4vh', right: '2vw', 'background-color': 'red' }} onClick={() => setRemoveModalShow(!removeModalShow())}>
                            <p style={font('0.5em')}>X</p>
                        </button>
                    </div>
                    </div><br /><br /><br /><br />
                    </div>
                </div>
                </div>
            </Show>
            <Show when={showTutorial()}>
                <TutorialOverlay id={ascean()._id} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} /> 
            </Show>
            <Show when={showInventory()}>
                <TutorialOverlay id={ascean()._id} tutorial={tutorial} show={showInventory} setShow={setShowInventory} /> 
            </Show>
        </div>
    );
}; 

export default StoryAscean;