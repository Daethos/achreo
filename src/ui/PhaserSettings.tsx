import { Accessor, createSignal, lazy, Match, Setter, Show, Suspense, Switch } from "solid-js";
import Settings from "../models/settings";
import { Puff } from "solid-spinner";
import { updateSettings } from "../assets/db/db";
import { ACTIONS, SPECIALS } from "../utility/abilities";
import { EventBus } from "../game/EventBus";
import { useResizeListener } from "../utility/dimensions";
import { font } from "../utility/styling";
import { Form } from "solid-bootstrap";
import { ActionButtonModal } from "../utility/buttons";
import { roundToTwoDecimals } from "../utility/combat";
const PhaserShaper = lazy(async () => await import('./PhaserShaper'));
const CONTROLS = {
    BUTTONS: 'Buttons',
    DIFFICULTY: 'Difficulty',
    POST_FX: 'Post FX',
    PHASER_UI: 'Phaser UI',
};
export default function PhaserSettings({ settings, setSettings, specials }: { settings: Accessor<Settings>; setSettings: Setter<Settings>; specials: Accessor<any[]>; }) {
    const [actionShow, setActionShow] = createSignal<boolean>(false);
    const [currentAction, setCurrentAction] = createSignal({action: ACTIONS[0],index: 0});
    const [specialShow, setSpecialShow] = createSignal<boolean>(false);
    const [currentSpecial, setCurrentSpecial] = createSignal({special: SPECIALS[0],index: 0});
    const [showRestart, setShowRestart] = createSignal<boolean>(false);
    const dimensions = useResizeListener();
    const saveSettings = async (newSettings: Settings) => {
        try {
            await updateSettings(newSettings);
            setSettings(newSettings);
        } catch (err) {
            console.warn(err, "Error Saving Game Settings");
        };
    };
    const handleEnemyCombatInteractive = async (interactive: boolean) => {
        try {
            console.log(interactive, 'Interactiving with Enemies in Combat?');
            const newSettings = {...settings(), difficulty: {
                ...settings().difficulty,
                enemyCombatInteract: interactive
            }};
            await saveSettings(newSettings);
        } catch (err) {
            console.warn(err, 'Error Handling Desktop');
        };
    };
    const handleDesktop = async (desktop: boolean) => {
        try {
            const newSettings = { ...settings(), desktop };
            await saveSettings(newSettings);
            EventBus.emit('update-desktop-cursor', desktop);
        } catch (err) {
            console.warn(err, 'Error Handling Desktop');
        };
    };
    async function currentControl(e: string) {
        const newSettings: Settings = { ...settings(), control: e };
        await saveSettings(newSettings);
        if (e === CONTROLS.PHASER_UI) {
            EventBus.emit('show-castbar', true);
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
    async function handleActionButton(e: string, i: number) {
        const newActions = [...settings().actions];
        const newAction = e;
        const oldAction = newActions[i];
        newActions[newActions.indexOf(newAction)] = oldAction;
        newActions[i] = newAction;
        const newSettings: Settings = { ...settings(), actions: newActions };
        await saveSettings(newSettings);
        EventBus.emit('reorder-buttons', { list: newActions, type: 'action' }); 
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
        await saveSettings(newSettings);
        EventBus.emit('reorder-buttons', { list: newSpecials, type: 'special' }); 
    };
    async function handlePostFx(type: string, val: any) {
        EventBus.emit('update-postfx', { type, val });
        const newSettings = { ...settings(), postFx: { ...settings().postFx, [type]: val } };
        await saveSettings(newSettings);
    };

    async function handleAim() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, aim: !settings().difficulty.aim } };
        await saveSettings(newSettings);
    };

    async function handleAggression(e: any) {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, aggression: e.target.value } };
        await saveSettings(newSettings);
        EventBus.emit('update-enemy-aggression', e.target.value);
    };

    // async function handleComputerCombat() {
    //     const newSettings = { ...settings(), difficulty: { ...settings().difficulty, computer: !settings().difficulty.computer } };
    //     await saveSettings(newSettings);
    // };
 
    async function handleSpecial(e: any) {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, special: e.target.value } };
        await saveSettings(newSettings);
        EventBus.emit('update-enemy-special', e.target.value);
    };

    async function handleMusic() {
        const newSettings = { ...settings(), music: !settings().music };
        await saveSettings(newSettings);
        EventBus.emit('music', newSettings.music);
    };

    async function handleSpeed(speed: number, type: string, change: number) {
        const newSettings = { 
            ...settings(), 
            difficulty: {
                ...settings().difficulty, 
                [type]: speed
            } 
        };
        await saveSettings(newSettings);
        EventBus.emit('update-speed', {speed: change, type});
    };
    async function handleTooltips() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, tooltips: !settings().difficulty.tooltips } };
        await saveSettings(newSettings);
    };

    async function handleTidbits() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, tidbits: !settings().difficulty.tidbits } };
        await saveSettings(newSettings);
        EventBus.emit('set-tips', newSettings.difficulty.tidbits);
    };

    async function handleVolume(e: number) {
        const newSettings = { ...settings(), volume: e };
        await saveSettings(newSettings);
        EventBus.emit('update-volume', e);
    };

    // function resetGame() {
    //     EventBus.emit('reset-game'); 
    //     // setShowRestart(false); 
    //     // EventBus.emit('set-show-player');
    // };
    // <div style={{...font('0.5em', '#fdf6d8'), margin: '1% auto', display: 'block'}}>Number Mapping Reads Left to Right. <br /> Special Options are Restricted: Mastery; Traits.</div>
    return <>
        <div class='center' style={{ display: 'flex', 'flex-direction': 'row', height: '100%' }}>
        <div class='gold' style={{ position: 'absolute', top: '0', 'font-size': '1.25em', display: 'inline' }}>
            <div style={{ 'padding-top': '5%' }}>Controls</div>
            <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.BUTTONS ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.BUTTONS)}>Buttons</button>
            <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.POST_FX ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.POST_FX)}>PostFx</button>
            <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.DIFFICULTY ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.DIFFICULTY)}>Settings</button>
            <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.PHASER_UI ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.PHASER_UI)}>UI</button>
        </div>
        <Switch>
            <Match when={settings().control === CONTROLS.BUTTONS}>
            <div class='' style={dimensions().ORIENTATION === 'landscape' ? { margin: '25% auto 0' } : { 'margin-top': '50%' }}>
                <div style={font('1em', '#fdf6d8')}>Physical Actions<br /></div>
                {settings().actions?.map((action: string, index: number) =>
                    <button class='highlight' onClick={() => actionModal(action, index)} style={{display: 'block'}}>
                        <div style={{ width: '100%', 'min-width': '60px', 'font-size': '0.75em', margin: '3%' }}><span class='gold' style={{ 'padding-right': '3px' }}>{index + 1} </span> {action}</div>
                    </button>
                )}
                </div>
                <div class='' style={dimensions().ORIENTATION === 'landscape' ? { margin: '25% auto 0' } : { 'margin-top': '50%' }}>
                    <div style={font('1em', '#fdf6d8')}>Special Actions<br /></div>
                    {settings().specials?.map((special: string, index: number) => 
                        <button  class='highlight' onClick={() => specialModal(special, index)} style={{display: 'block'}}>
                            <div style={{ width: '100%', 'min-width': '65px', 'font-size': '0.75em', margin: '3%' }}><span class='gold' style={{ 'padding-right': '3px' }}>{index + 1} </span> {special}</div>
                        </button>
                    )}
                </div>
            </Match>
            <Match when={settings().control === CONTROLS.POST_FX}>
                <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                    <div style={font('0.75em', '#fdf6d8')}>PostFx
                    <button class='highlight' onClick={() => handlePostFx('enable', !settings().postFx?.enable)}>
                        {settings().postFx?.enable ? 'On' : 'Off'}
                    </button> 
                    </div>

                    <div class='center left' style={{ 'margin-left': '0%' }}>

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
                    
                    </div>
                    
                    <div class='center right'>

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


                    </div>
            </Match>
            <Match when={settings().control === CONTROLS.DIFFICULTY}>
                <div class='center creature-heading wrap' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                    {/* <div style={font('1em', '#fdf6d8')}>
                        <h1 style={font('1.25em')}>Computer Combat</h1>
                        <button class='gold highlight' onClick={() => handleComputerCombat()}>{settings().difficulty.computer ? 'Enabled' : 'Disabled'}</button>
                    </div>
                    <div style={font('0.5em')}>[Whether Computer Enemies Will Engage In Combat With Each Other (Not Yet Implemented)]</div> */}

                    <h1 style={font('1.25em')}>Action Tooltip</h1>
                        <button class='gold highlight' onClick={() => handleTooltips()}>{settings().difficulty.tooltips ? 'Enabled' : 'Disabled'}</button>
                    <div style={font('0.5em')}>[Enabled = Click / Hover Actions to Provide an Info Popup, Disabled = No Info Popups]</div>
                        
                    <div style={font('1em', '#fdf6d8')}>
                        <h1 style={font('1.25em')}>Combat Targeting</h1>
                        <button class='gold highlight' onClick={() => handleAim()}>{settings().difficulty.aim ? 'Manual' : 'Auto'} Aim</button>
                    </div>
                    <div style={font('0.5em')}>[Whether You Use the Second Joystick to Aim Ranged Attacks in Combat]</div>

                    <div style={font('1em', '#fdf6d8')}>
                        <h1 style={font('1.25em')}>Desktop</h1>
                        <button class='gold highlight' onClick={() => handleDesktop(!settings().desktop)}>{settings().desktop ? 'Enabled' : 'Disabled'}</button>
                    </div>
                    <div style={font('0.5em')}>[Desktop allows you to hide the joystick UI and reset the button UI, and enable keyboard and mouse for actions and movement.]</div>

                    <div style={font('1em', '#fdf6d8')}>
                        <h1 style={font('1.25em')}>Enemy Aggression</h1>
                        <span class='gold'>{settings().difficulty.aggression * 100}%</span> <br />
                        <Form.Range min={0} max={1} step={0.05} value={settings().difficulty.aggression} onChange={(e) => handleAggression(e)} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                    </div>
                    <div style={font('0.5em')}>[Aggressive Enemy Occurrence: 0 - 100%]</div>

                    <div style={font('1em', '#fdf6d8')}>
                        <h1 style={font('1.25em')}>Enemy Interactive (Combat)</h1>
                        <button class='gold highlight' onClick={() => handleEnemyCombatInteractive(!settings().difficulty.enemyCombatInteract)}>{settings().difficulty.enemyCombatInteract ? 'Enabled' : 'Disabled'}</button> <br />
                    </div>
                    <div style={font('0.5em')}>[Enabled: You can focus ANY enemy. <br /> Disabled: If in combat, you cannot focus enemies that are not in combat.]</div>

                    <h1 style={font('1.25em')}>Enemy Specials</h1>
                    <div style={font('1em', '#fdf6d8')}>
                        <span class='gold'>{settings().difficulty.special * 100}%</span> <br />
                        <Form.Range min={0} max={1} step={0.05} value={settings().difficulty.special} onChange={(e) => handleSpecial(e)} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                    </div>
                    <div style={font('0.5em')}>[Special (Elite) Enemy Occurrence: 0 - 100%]</div>

                    <h1 style={font('1.25em')}>Speed</h1>
                    <div style={font('0.5em')}>[Adjusts the movement speed of the associated entity. This effect is immediate.]</div>
                    <div style={font('1em')}>
                        <button class='highlight' onClick={() => handleSpeed(roundToTwoDecimals(Math.max(-1, (settings().difficulty.playerSpeed - 0.025) || 0), 3), 'playerSpeed', -0.025)}>-</button>            
                        Player: ({settings().difficulty.playerSpeed})
                        <button class='highlight' onClick={() => handleSpeed(roundToTwoDecimals(Math.min(1, (settings().difficulty.playerSpeed + 0.025) || 0), 3), 'playerSpeed', 0.025)}>+</button>
                    </div>
                    
                    <div style={font('1em')}>
                        <button class='highlight' onClick={() => handleSpeed(roundToTwoDecimals(Math.max(-1, (settings().difficulty.enemySpeed - 0.025) || 0), 3), 'enemySpeed', -0.025)}>-</button>            
                        Enemy: ({settings().difficulty.enemySpeed})
                        <button class='highlight' onClick={() => handleSpeed(roundToTwoDecimals(Math.min(1, (settings().difficulty.enemySpeed + 0.025) || 0), 3), 'enemySpeed', 0.025)}>+</button>
                    </div>

                    <h1 style={font('1.25em')}>Sound</h1>
                    <div style={font('0.75em', '#fdf6d8')}> 
                        <button class='gold highlight' onClick={() => handleMusic()}>{settings().music ? 'Enabled' : 'Disabled'}</button>
                    </div>
                    <div style={font('0.5em')}>[Whether any music or sound effects are enabled. Restart Game For This Change To Take Effect.]</div>

                    <div style={{...font('0.75em', '#fdf6d8'), 'margin': '3%' }}>Volume ({settings().volume})</div>
                    <Form.Range min={0} max={1} step={0.1} value={settings().volume} onChange={(e) => handleVolume(Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                    <br />
                    <h1 style={font('1.25em')}>Tidbit Popups</h1>
                        <button class='gold highlight' onClick={() => handleTidbits()}>{settings().difficulty.tidbits ? 'Enabled' : 'Disabled'}</button>
                    <div style={font('0.5em')}>[Enabled = Helpful Hints and Lore Popups, Disabled = No Info Popups]</div>
                    <br />
                </div>
            </Match>
            <Match when={settings().control === CONTROLS.PHASER_UI}>
                <div class='center creature-heading' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                <Suspense fallback={<Puff color="gold"/>}>
                    <PhaserShaper settings={settings} />
                    <br />
                </Suspense>
                </div>
            </Match>
        </Switch>
        <button class='highlight cornerTR' style={{ 'background-color': 'red', 'z-index': 1, 'font-size': '0.25em', padding: '0.25em' }} onClick={() => setShowRestart(true)}>
            <p>Restart</p>
        </button>
        </div>
        <Show when={actionShow()}>
            <div class='modal' onClick={() => setActionShow(!actionShow())}>
                <ActionButtonModal currentAction={currentAction} actions={ACTIONS}  handleAction={handleActionButton} /> 
            </div>
        </Show>
        <Show when={specialShow()}>
            <div class='modal' onClick={() => setSpecialShow(!specialShow())}>
                <ActionButtonModal currentAction={currentSpecial} actions={specials()} handleAction={handleSpecialButton} special={true} /> 
            </div>
        </Show>
        <Show when={showRestart()}>
            <div class='modal'>
            <div class='border superCenter creature-heading' style={{ width: '50%' }}>
            <h1 class='center' style={{ color: 'red', margin: '5%' }}>Restart Game</h1>
            <p class='center' style={{ 'margin-bottom': '15%' }}>Do you with to go back to the Main Menu?</p>
            <button class='cornerBL highlight' style={{ color: 'gold' }} onClick={() => setShowRestart(false)}>No</button>
            <button class='cornerBR highlight' style={{ color: 'red' }} onClick={() => document.location.reload()}>Yes</button>
            {/* document.location.reload() */}
            </div>
            </div> 
        </Show>
    </>;
};