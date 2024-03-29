import { Accessor, Setter, Show, createEffect, createSignal } from 'solid-js';
import AsceanImageCard from '../components/AsceanImageCard';
import AttributeModal, { AttributeCompiler } from '../components/Attributes';
// import SettingSetter from '../utility/settings';
import InventoryPouch from './InventoryPouch';
// import Inventory from './Inventory';
import { EventBus } from '../game/EventBus';
import HealthBar from './HealthBar';
import ExperienceBar from './ExperienceBar';
// import { updateInventory, updateSettings } from '../assets/db/db';
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
import { deleteEquipment } from '../assets/db/db';

// import {  playerTraits } from '../utility/ascean';
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
// const CONTROLS = {
//     BUTTONS: 'Buttons',
//     SOUND_SHAKE: 'Sound & Shake',
// };
const ACTIONS = ['Attack', 'Posture', 'Roll', 'Dodge', 'Counter'];
const SPECIALS = ['Charm', 'Confuse', 'Consume', 'Fear', 'Invoke', 'Polymorph', 'Root', 'Snare', 'Tshaeral'];

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
    const [inventoryType, setInventoryType] = createSignal<any>('');
    const [highlighted, setHighlighted] = createSignal<{ item: Equipment | undefined; comparing: boolean; type: string }>({ item: undefined, comparing: false, type: '' });
    const [show, setShow] = createSignal(false);
    const [actionShow, setActionShow] = createSignal(false);
    const [currentAction, setCurrentAction] = createSignal({
        action: ACTIONS[0],
        index: 0,
    });
    const [specialShow, setSpecialShow] = createSignal(false);
    const [currentSpecial, setCurrentSpecial] = createSignal({
        special: SPECIALS[0],
        index: 0,
    });
    const [equipModalShow, setEquipModalShow] = createSignal(false);
    const [inspectModalShow, setInspectModalShow] = createSignal(false);
    const [inspectItems, setInspectItems] = createSignal<{ item: Equipment | undefined; type: string; }[]>([{ item: undefined, type: '' }]);
    const [attrShow, setAttrShow] = createSignal(false);
    const [asceanPic, setAsceanPic] = createSignal('');
    const [ringCompared, setRingCompared] = createSignal('');
    const [removeModalShow, setRemoveModalShow] = createSignal(false);
    const [weaponCompared, setWeaponCompared] = createSignal('');

    const dimensions = useResizeListener();
 
    createEffect(() => {
        if (ascean) {
            setAsceanPic(`../assets/images/${ascean().origin}-${ascean().sex}.jpg`);
        };
    });


    // createEffect(() => {
    //     playerTraits();
    // }, [ascean]);

    // createEffect(() => {
    //     if (ascean().tutorial.firstInventory && game().inventory.length && asceanViews === 'Inventory') dispatch(setTutorialContent('firstInventory'));
    // }, [ascean().tutorial, asceanViews, dispatch]);

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

    // const saveInventory = async (inventory) => {
        // try {
            // const flattenedInventory = inventory.map((item) => item?._id);
            // await updateInventory(ascean()._id, flattenedInventory);
        // } catch (err) {
            // console.warn(err, "Error Saving Inventory");
        // };
    // };

    // const saveSettings = async (newSettings) => {
    //     try {
    //         await updateSettings(newSettings);
    //     } catch (err) {
    //         console.warn(err, "Error Saving Game Settings");
    //     };
    // };

    const currentCharacterView = (e: string) => {
        console.log(e, "Character div");
        const newSettings: Settings = { ...settings(), characterViews: e };
        setSettings(newSettings);
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
    //     EventBus.emit('update-volume', volume);
    // };

    async function currentView(e: string) {
        console.log(e, "Current Setting div");
        const newSettings: Settings = { ...settings(), settingViews: e };
        console.log(newSettings, "New Settings");
        // setSettingViews(createSettingInfo(settings().settingViews));
        setSettings(newSettings);
    };

    async function setNextView() {
        const nextView = viewCycleMap[settings().asceanViews as keyof typeof viewCycleMap];
        if (nextView) {
            console.log(nextView, "Next div")
            const newSettings: Settings = { ...settings(), asceanViews: nextView };
            setSettings(newSettings);
        };
    }; 

    function actionModal(action: string, index: number) {
        setCurrentAction({ action: action, index: index });
        setActionShow(true);
    };

    function specialModal(special: string, index: number) {
        setCurrentSpecial({ special: special, index: index });
        setSpecialShow(true);
    };

    function handleActionButton(e: string, i: number) {
        const newActions = [...settings().actions];
        const newAction = e;
        
        const oldAction = newActions[i];
        newActions[newActions.indexOf(newAction)] = oldAction;
        newActions[i] = newAction;
        
        EventBus.emit('update-action', newActions);
        EventBus.emit('reorder-buttons', { list: newActions, type: 'action' });
        // setActionShow(false);
    };

    function handleSpecialButton(e: string, i: number) {
        const newSpecials = [...settings().specials];
        const newSpecial = e;

        if (newSpecials.includes(newSpecial)) {
            const oldSpecial = newSpecials[i];
            newSpecials[newSpecials.indexOf(newSpecial)] = oldSpecial;
        };
        newSpecials[i] = newSpecial;
        EventBus.emit('update-special', newSpecials);
        EventBus.emit('reorder-buttons', { list: newSpecials, type: 'special' });
        // setSpecialShow(false);
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
        // setGameState({ ...game, inventory: newInventory });
        EventBus.emit('refresh-inventory', newInventory);
        setRemoveModalShow(false);
    };

    return (
        <div style={{ 'z-index': 1, position: 'fixed', top: 0, left: 0 }}>
        { settings().asceanViews === VIEWS.CHARACTER ? ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}>
                <div class='playerMenuHeading'>Character</div>
            </button>
            <div class='highlight playerSettingSelect'>
            { settings().characterViews === CHARACTERS.STATISTICS ? (
                <button onClick={() => currentCharacterView(CHARACTERS.TRAITS)}>
                    <p class='playerSetting'>Statistics</p>
                </button>
            ) : (
                <button onClick={() => currentCharacterView(CHARACTERS.STATISTICS)}>
                    <p class='playerSetting'>Traits</p>
                </button>
            ) }     
            </div> 
        </> ) : settings().asceanViews === VIEWS.INVENTORY ? ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}><div class='playerMenuHeading'>Inventory</div></button>
            <Firewater ascean={ascean} />
        </> ) : settings().asceanViews === VIEWS.SETTINGS ? ( <>
            <button class='highlight' style={{ 'margin-left': '0.5%' }} onClick={() => setNextView()}><div class='playerMenuHeading'>Settings</div></button>

            <div class='playerSettingSelect' style={{ top: '-5%' }}>
                <button class='button p-3' onClick={() => currentView(SETTINGS.ACTIONS)}><p class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Actions</p></button>
                <button class='button p-3' onClick={() => currentView(SETTINGS.CONTROL)}><p class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Control</p></button>
                <button class='button p-3' onClick={() => currentView(SETTINGS.GENERAL)}><p class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>General</p></button>
                <button class='button p-3' onClick={() => currentView(SETTINGS.INVENTORY)}><p class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Inventory</p></button>
                <button class='button p-3' onClick={() => currentView(SETTINGS.TACTICS)}><p class='playerSetting' style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Tactics</p></button>
            </div>
        </> ) : ( '' ) }
        {/* <<----- WINDOW ONE ----->> */}
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
            <HealthBar totalPlayerHealth={combatState().playerHealth} newPlayerHealth={combatState().newPlayerHealth} />
            <div style={dimensions().ORIENTATION === 'landscape' ? { 'margin-left': '0', 'margin-top': '7.5%', transform: 'scale(0.9)' } : { 'margin-left': '5%', transform: 'scale(0.75)', 'margin-top': '20%' }}>
                <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
            </div>
            <div style={{ 'margin-top': '-5%' }}>
                <ExperienceBar totalExperience={ascean().level * 1000} currentExperience={ascean().experience} />
            </div>
        </div>
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
                        <div>Initiative: <span class='gold'>{combatState()?.playerAttributes?.initiative}</span></div>
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
                    <div class='gold' style={{ position: 'absolute', top: '5%', 'font-size': '1.25em' }}>Gameplay Controls
                    </div>
                    <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '20%' } : { 'margin-top': '50%' }}>
                        <div style={font('1em', '#fdf6d8')}>Action Buttons<br /></div>
                        {settings().actions?.map((action: string, index: number) =>
                            <button class='highlight' onClick={() => actionModal(action, index)}>
                                <p class='m-3' style={{ width: '100%', 'font-size': '0.75em' }}><span class='gold'>{index + 1} </span> {action}</p>
                            </button>
                        )}
                    </div>
                    <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '20%' } : { 'margin-top': '50%' }}>
                        <div style={font('1em', '#fdf6d8')}>Special Buttons<br /></div>
                        {settings().specials?.map((special: string, index: number) => 
                            <button  class='highlight' onClick={() => specialModal(special, index)}>
                                <p class='m-3' style={{ width: '100%', 'font-size': '0.75em' }}><span class='gold'>{index + 1} </span> {special}</p>
                            </button>
                        )}
                    </div>
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
                    <div class='superCenter'>
                        Various kinds of Information on Aspects of the Game.
                        {/* <SettingSetter setting={settings()?.settingViews} /> */}
                    </div>
                </div>
            ) : ( undefined ) }
        </div>
        <button class='highlight cornerTR' style={{ transform: 'scale(0.85)', position: 'fixed', top: '-1.5%', right: '-0.5%' }} onClick={() => EventBus.emit('show-player')}>
            <p style={font('0.5em')}>X</p>
        </button>
            <Show when={show()}>
            <div class='modal' onClick={() => setShow(!show)}>
                <ItemModal item={equipment()} stalwart={combatState().isStalwart} caerenic={combatState().isCaerenic} /> 
            </div> 
            </Show>
            <Show when={actionShow()}> <>
            <button onClick={() => setActionShow(!actionShow())}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, 'background-color': 'rgba(0, 0, 0, 0.75)' }} />
            </button>
            <div class='modal' onClick={() => setActionShow(!actionShow())}>
                <ActionButtonModal current={currentAction().action} actions={ACTIONS} index={currentAction().index} handleAction={handleActionButton} /> 
            </div>
            </> </Show>
            <Show when={attrShow()}>
            <div class='modal' onClick={() => setAttrShow(!attrShow())}>
                <AttributeModal attribute={attribute()} />
            </div> 
            </Show>
            <Show when={specialShow()}> <> 
            <div class='modal' onClick={() => setSpecialShow(!specialShow())}>
                <ActionButtonModal current={currentSpecial().special} actions={SPECIALS} index={currentSpecial().index} handleAction={handleSpecialButton} /> 
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
        </div>
    );
}; 

export default StoryAscean;