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
import { Collapse } from "solid-collapse";
import ComputerLoadout from "../components/ComputerLoadout";
const PhaserShaper = lazy(async () => await import('./PhaserShaper'));
const cleanSettings = {
    actionTooltip: false,
    computerArena: false,
    combatTargeting: false,
    enemyAggression: false,
    enemyInteractive: false,
    enemySpecials: false,
    tidbits: false,
};
const cleanFrame = {
    combat: false,
    desktop: false,
    fps: false,
    speed: false,
    sound: false,
    tooltips: false,
};
const cleanFx = {
    postfx: false,
    chab: false,
    chromatic: false,
    vhs: false,
    vignette: false,
    scanline: false,
    crt: false,
    noise: false,
};
const CONTROLS = {
    BUTTONS: 'Buttons',
    DIFFICULTY: 'Difficulty',
    POST_FX: 'Post FX',
    PHASER_UI: 'Phaser UI',
};
const FOCUS = {
    Balanced: 'Defensive',
    Defensive: 'Offensive',
    Offensive: 'Balanced',
};
export default function PhaserSettings({ settings, setSettings, specials }: { settings: Accessor<Settings>; setSettings: Setter<Settings>; specials: Accessor<any[]>; }) {
    const [actionShow, setActionShow] = createSignal<boolean>(false);
    const [currentAction, setCurrentAction] = createSignal({action: ACTIONS[0],index: 0});
    const [specialShow, setSpecialShow] = createSignal<boolean>(false);
    const [currentSpecial, setCurrentSpecial] = createSignal({special: SPECIALS[0],index: 0});
    const [showRestart, setShowRestart] = createSignal<boolean>(false);
    const [frame, setFrame] = createSignal(cleanFrame);
    const dimensions = useResizeListener();
    const [difficulty, setDifficulty] = createSignal(cleanSettings);
    const [fx, setFx] = createSignal(cleanFx);
    function resetDifficulty(exception: string, change: boolean) {
        setDifficulty({
            ...cleanSettings,
            [exception]: change
        });
    };
    function resetFrame(exception: string, change: boolean) {
        setFrame({
            ...cleanFrame,
            [exception]: change
        });
    };
    function resetFx(exception: string, change: boolean) {
        setFx({
            ...cleanFx,
            [exception]: change
        });
    };
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

    
    async function handleAggressionImmersion() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, aggressionImmersion: !settings().difficulty.aggressionImmersion } };
        EventBus.emit('update-enemy-aggression-immersion', !settings().difficulty.aggressionImmersion);
        await saveSettings(newSettings);
    };

    async function handleComputerCombat() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, computer: !settings().difficulty.computer } };
        await saveSettings(newSettings);
    };

    async function handleArenaCombat() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, arena: !settings().difficulty.arena } };        
        await saveSettings(newSettings);
    };
 
    async function handleComputerFocus() {
        const computerFocus = FOCUS[settings().computerFocus as keyof typeof FOCUS || 'Balanced' as keyof typeof FOCUS];
        const newSettings = { ...settings(), computerFocus };        
        await saveSettings(newSettings);
    };
    async function handleFps(type: string, payload: boolean | number | string) {
        let limit = settings().fps.limit, target = settings().fps.target;
        if (type === 'min') {
            if (payload as number > limit) {
                limit = payload as number;
            };
            if (payload as number > target) {
                target = payload as number;
            };
        };
        const fps = { 
            ...settings().fps, 
            limit,
            target,
            [type]: payload,
        };
        const newSettings = { ...settings(), fps };
        await saveSettings(newSettings);
        EventBus.emit('update-fps', fps);
    };

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
        EventBus.emit("update-volume", e);
    };

    // function resetGame() {
    //     EventBus.emit("reset-game"); 
    //     // setShowRestart(false); 
    //     // EventBus.emit("set-show-player");
    // };
    // <div style={{...font("0.5em", "#fdf6d8"), margin: "1% auto", display: "block"}}>Number Mapping Reads Left to Right. <br /> Special Options are Restricted: Mastery; Traits.</div>
    return <>
        <div class="center" style={{ display: "flex", "flex-direction": "row", height: "100%" }}>
        <div class="gold" style={{ position: "absolute", top: "0", "font-size": "1.25em", display: "inline" }}>
            <div style={{ "padding-top": "5%" }}>Controls - {settings().control}</div>
            <Show when={settings().control !== CONTROLS.BUTTONS}>
                <button class="highlight" style={{ "font-size": "0.5em", display: "inline", width: "auto" }} onClick={() => currentControl(CONTROLS.BUTTONS)}>Buttons</button>
            </Show>
            <Show when={settings().control !== CONTROLS.POST_FX}>
                <button class="highlight" style={{ "font-size": "0.5em", display: "inline", width: "auto" }} onClick={() => currentControl(CONTROLS.POST_FX)}>PostFx</button>
            </Show>
            <Show when={settings().control !== CONTROLS.DIFFICULTY}>
                <button class="highlight" style={{ "font-size": "0.5em", display: "inline", width: "auto" }} onClick={() => currentControl(CONTROLS.DIFFICULTY)}>Settings</button>
            </Show>
            <Show when={settings().control !== CONTROLS.PHASER_UI}>
                <button class="highlight" style={{ "font-size": "0.5em", display: "inline", width: "auto" }} onClick={() => currentControl(CONTROLS.PHASER_UI)}>UI</button>
            </Show>
        </div>
        <Switch>
            <Match when={settings().control === CONTROLS.BUTTONS}>
            <div style={dimensions().ORIENTATION === "landscape" ? { margin: "25% auto 0" } : { "margin-top": "50%" }}>
                <div style={font("1em", "gold")}>Physicals<br /></div>
                {settings().actions?.map((action: string, index: number) =>
                    <button class="highlight" onClick={() => actionModal(action, index)} style={{display: "block"}}>
                        <div style={{ width: "100%", "min-width": "60px", "font-size": "0.75em", margin: "3%" }}><span class="gold" style={{ "padding-right": "3px" }}>{index + 1} </span> {action}</div>
                    </button>
                )}
                </div>
                <div style={dimensions().ORIENTATION === "landscape" ? { margin: "25% auto 0" } : { "margin-top": "50%" }}>
                    <div style={font("1em", "gold")}>Specials<br /></div>
                    {settings().specials?.map((special: string, index: number) => 
                        <button  class="highlight" onClick={() => specialModal(special, index)} style={{display: "block"}}>
                            <div style={{ width: "100%", "min-width": "65px", "font-size": "0.75em", margin: "3%" }}><span class="gold" style={{ "padding-right": "3px" }}>{index + 1} </span> {special}</div>
                        </button>
                    )}
                </div>
            </Match>
            <Match when={settings().control === CONTROLS.POST_FX}>
                <div class="center creature-heading" style={dimensions().ORIENTATION === "landscape" ? { "margin-top": "25%" } : { "margin-top": "50%" }}>
                    <h1 onClick={() => resetFx("postfx", !fx().postfx)} style={font("1.25em")}>PostFx</h1>
                    <Collapse value={fx().postfx} class="my-transition">
                        <div style={font("1em", "#fdf6d8")}>
                        <button class="highlight" onClick={() => handlePostFx("enable", !settings().postFx?.enable)}>
                            {settings().postFx?.enable ? "On" : "Off"}
                        </button> 
                        </div>
                    </Collapse>

                    <h1 onClick={() => resetFx("chromatic", !fx().chromatic)} style={font("1.25em")}>Chromatic Abb.</h1>
                    <Collapse value={fx().chromatic} class="my-transition">
                        <div style={font("1em", "#fdf6d8")}>
                        <button class="highlight" onClick={() => handlePostFx("chromaticEnable", !settings().postFx?.chromaticEnable)}>
                        
                            {settings().postFx?.chromaticEnable ? "On" : "Off"}
                        </button>
                        </div>
                    </Collapse>
                        
                    <h1 onClick={() => resetFx("chab", !fx().chab)} style={font("1.25em")}>Chab </h1>
                    <Collapse value={fx().chab} class="my-transition">
                        <div style={font("1em", "#fdf6d8")}>
                            ({settings().postFx.chabIntensity})</div>
                        <Form.Range min={0} max={1} step={0.01} value={settings().postFx.chabIntensity} onChange={(e) => handlePostFx("chabIntensity", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                    </Collapse>

                    <h1 onClick={() => resetFx("vignette", !fx().vignette)} style={font("1.25em")}>Vignette</h1>
                    <Collapse value={fx().vignette} class="my-transition">
                    <div style={font("1em", "#fdf6d8")}>
                        <button class="highlight" onClick={() => handlePostFx("vignetteEnable", !settings().postFx?.vignetteEnable)}>
                            {settings().postFx?.vignetteEnable ? "On" : "Off"}
                        </button>
                        </div>
                        <div style={font("1em", "#fdf6d8")}>Vignette Strength ({settings().postFx.vignetteStrength})</div>
                        <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vignetteStrength} onChange={(e) => handlePostFx("vignetteStrength", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                        <div style={font("1em", "#fdf6d8")}>Vignette Intensity ({settings().postFx.vignetteIntensity})</div>
                        <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vignetteIntensity} onChange={(e) => handlePostFx("vignetteIntensity", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                    </Collapse>

                    <h1 onClick={() => resetFx("noise", !fx().noise)} style={font("1.25em")}>Noise</h1>
                    <Collapse value={fx().noise} class="my-transition">
                    <div style={font("1em", "#fdf6d8")}>
                        <button class="highlight" onClick={() => handlePostFx("noiseEnable", !settings().postFx?.noiseEnable)}>
                            {settings().postFx?.noiseEnable ? "On" : "Off"}
                        </button>
                        </div>
                        <div style={font("1em", "#fdf6d8")}>Noise Strength ({settings().postFx.noiseStrength})</div>
                        <Form.Range min={0} max={1} step={0.01} value={settings().postFx.noiseStrength} onChange={(e) => handlePostFx("noiseStrength", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                        <div style={font("1em", "#fdf6d8")}>Noise Seed ({settings().postFx.noiseSeed})</div>
                        <Form.Range min={0} max={1} step={0.01} value={settings().postFx.noiseSeed} onChange={(e) => handlePostFx("noiseSeed", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                    </Collapse>
                    
                    
                    <h1 onClick={() => resetFx("vhs", !fx().vhs)} style={font("1.25em")}>VHS</h1>
                    <Collapse value={fx().vhs} class="my-transition">
                    <div style={font("1em", "#fdf6d8")}>
                        <button class="highlight" onClick={() => handlePostFx("vhsEnable", !settings().postFx?.vhsEnable)}>
                            {settings().postFx?.vhsEnable ? "On" : "Off"}
                        </button>
                        </div>
                        <div style={font("1em", "#fdf6d8")}>Strength ({settings().postFx.vhsStrength})</div>
                        <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vhsStrength} onChange={(e) => handlePostFx("vhsStrength", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                    </Collapse>

                    <h1 onClick={() => resetFx("scanline", !fx().scanline)} style={font("1.25em")}>Scanlines</h1>
                    <Collapse value={fx().scanline} class="my-transition">
                    <div style={font("1em", "#fdf6d8")}>
                        <button class="highlight" onClick={() => handlePostFx("scanlinesEnable", !settings().postFx?.scanlinesEnable)}>
                            {settings().postFx?.scanlinesEnable ? "On" : "Off"}
                        </button>
                        </div>
                        <div style={font("1em", "#fdf6d8")}>Strength ({settings().postFx.scanStrength})</div>
                        <Form.Range min={0} max={1} step={0.01} value={settings().postFx.scanStrength} onChange={(e) => handlePostFx("scanStrength", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                    </Collapse>

                    <h1 onClick={() => resetFx("crt", !fx().crt)} style={font("1.25em")}>CRT Enable</h1>
                    <Collapse value={fx().crt} class="my-transition">
                    <div style={font("1em", "#fdf6d8")}>
                        <button class="highlight" onClick={() => handlePostFx("crtEnable", !settings().postFx?.crtEnable)}>
                            {settings().postFx?.crtEnable ? "On" : "Off"}
                        </button>
                        </div>
                        <div style={font("1em", "#fdf6d8")}>CRT Height ({settings().postFx.crtHeight})</div>
                        <Form.Range min={0} max={5} step={0.1} value={settings().postFx.crtHeight} onChange={(e) => handlePostFx("crtHeight", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                        <div style={font("1em", "#fdf6d8")}>CRT Width ({settings().postFx.crtWidth})</div>
                        <Form.Range min={0} max={5} step={0.1} value={settings().postFx.crtWidth} onChange={(e) => handlePostFx("crtWidth", Number(e.target.value))} style={{ color: "red", background: "red", "background-color": "red" }} />
                    </Collapse>
                    <br />
                    </div>
            </Match>
            <Match when={settings().control === CONTROLS.DIFFICULTY}>
                <div class='center creature-heading wrap' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>

                    <h1 onClick={() => resetFrame('combat', !frame().combat)} style={font('1.25em')}>Combat</h1>
                    <Collapse value={frame().combat} class='my-transition'>
                        <h1 onClick={() => resetDifficulty('computerArena', !difficulty().computerArena)} style={font('0.85em')}>Arena Combat</h1>
                        <Collapse value={difficulty().computerArena} class='my-transition'> 
                            <div style={font('0.85em', '#fdf6d8')}>
                                <button class='highlight' onClick={() => handleArenaCombat()} style={{ color: settings().difficulty.arena ? "red" : "#fdf6d8" }}>{settings().difficulty.arena ? 'Manual' : 'Computer'}</button>
                                <div style={font('0.5em')}>[Whether you control your character in the Arena. If the Arena has been loaded, you must reload the game for this change to take effect.]</div>

                                <h1 class='gold' style={font('0.85em')}>Player Computer Focus</h1>
                                <button class='highlight' onClick={() => handleComputerFocus()} style={{ color: settings().computerFocus === "Balanced" ? "gold" : settings().computerFocus === "Offensive" ? "red" : "#fdf6d8" }}>{settings().computerFocus || 'Balanced'}</button>
                                <ComputerLoadout settings={settings} />
                            </div>
                        </Collapse>


                        <h1 onClick={() => resetDifficulty('combatTargeting', !difficulty().combatTargeting)} style={font('0.85em')}>Combat Targeting</h1>
                        <Collapse value={difficulty().combatTargeting} class='my-transition'>
                            <div style={font('0.85em', '#fdf6d8')}>
                                <button class='gold highlight' onClick={() => handleAim()}>{settings().difficulty.aim ? 'Manual' : 'Auto'} Aim</button>
                            </div>
                            <div style={font('0.5em')}>[Whether You Use the Second Joystick to Aim Ranged Attacks in Combat]</div>
                        </Collapse>

                        <h1 onClick={() => resetDifficulty('enemyAggression', !difficulty().enemyAggression)} style={font('0.85em')}>Enemy Aggression</h1>
                        <Collapse value={difficulty().enemyAggression} class='my-transition'>
                        <p>Enemies May Always Attack From Accidental Damage.</p>
                        <div style={font('0.85em', '#fdf6d8')}>
                            <h1 style={font('1.25em')}>Computer Combat</h1>
                            <button class='highlight' onClick={() => handleComputerCombat()} style={{ color: settings().difficulty.computer ? "red" :  "#fdf6d8" }}>{settings().difficulty.computer ? 'Enabled' : 'Disabled'}</button>
                        </div>
                        <div style={font('0.5em')}>[Whether Computer Enemies Will Engage In Casual Combat With Each Other On Awareness / Contact.]</div>
                            <div style={font('0.85em')}>
                            <h1 style={font('1.25em')}>Immersion</h1>
                            <button class="highlight" onClick={handleAggressionImmersion} style={{ color: settings().difficulty.aggressionImmersion ? "red" :  "#fdf6d8" }}>
                                {settings().difficulty.aggressionImmersion ? "Enabled" : "Disabled"}
                            </button>
                            </div>
                            <div style={font('0.5em')}>[Aggressive Enemy Immersion: Your disposition and their willingness to attack is influenced by your reputation with that kind of enemy.]</div>
                        </Collapse> 
                        
                        <Collapse value={difficulty().enemyAggression} class='my-transition'>
                            <div style={font('0.85em', '#fdf6d8')}>
                            <h1 style={font('1.25em')}>Occurrence</h1>
                            <span class='gold'>{settings().difficulty.aggression * 100}%</span> <br />
                            <Form.Range min={0} max={1} step={0.05} value={settings().difficulty.aggression} onChange={(e) => handleAggression(e)} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                            </div>
                            <div style={font('0.5em')}>[Aggressive Enemy Occurrence: Determined By Chance If You Are Not Immersed. 0 - 100%]</div>
                        </Collapse> 
                        {/* handleAggressionImmersion */}
                        <h1 onClick={() => resetDifficulty('enemyInteractive', !difficulty().enemyInteractive)} style={font('0.85em')}>Enemy Interactive (Combat)</h1>
                        <Collapse value={difficulty().enemyInteractive} class='my-transition'>
                            <div style={font('0.85em', '#fdf6d8')}>
                            <button class='gold highlight' onClick={() => handleEnemyCombatInteractive(!settings().difficulty.enemyCombatInteract)}>{settings().difficulty.enemyCombatInteract ? 'Enabled' : 'Disabled'}</button> <br />
                            </div>
                            <div style={font('0.5em')}>[Enabled: You can focus ANY enemy. <br /> Disabled: If in combat, you cannot focus enemies that are not in combat.]</div>
                        </Collapse>

                        <h1 onClick={() => resetDifficulty('enemySpecials', !difficulty().enemySpecials)} style={font('0.85em')}>Enemy Specials</h1>
                        <Collapse value={difficulty().enemySpecials} class='my-transition'>
                            <div style={font('0.85em', '#fdf6d8')}>
                                <span class='gold'>{settings().difficulty.special * 100}%</span> <br />
                                <Form.Range min={0} max={1} step={0.05} value={settings().difficulty.special} onChange={(e) => handleSpecial(e)} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                            </div>
                            <div style={font('0.5em')}>[Special (Elite) Enemy Occurrence: 0 - 100%]</div>
                        </Collapse>
                    </Collapse>

                    <h1 onClick={() => resetFrame('desktop', !frame().desktop)} style={font('1.25em')}>Desktop</h1>
                    <Collapse value={frame().desktop} class='my-transition'>
                        <div style={font('1em', '#fdf6d8')}>
                        <button class='gold highlight' onClick={() => handleDesktop(!settings().desktop)}>{settings().desktop ? 'Enabled' : 'Disabled'}</button>
                        </div>
                        <div style={font('0.5em')}>[Desktop allows you to hide the joystick UI and reset the button UI, and enable keyboard and mouse for actions and movement.]</div>
                    </Collapse>

                    <h1 onClick={() => resetFrame('fps', !frame().fps)} style={font('1.25em')}>FPS</h1>
                    <Collapse value={frame().fps} class='my-transition'>
                        <div style={font('1em')}>
                            <p>Min: ({settings().fps.min})</p>
                            <button class='highlight' onClick={() => handleFps('min', 5)}>5</button>            
                            <button class='highlight' onClick={() => handleFps('min', 30)}>30</button>
                            <button class='highlight' onClick={() => handleFps('min', 60)}>60</button>
                            <div style={font('0.5em', 'gold')}>[The minimum acceptable rendering rate, in frames per second.]</div>
                            
                            <p>Target: ({settings().fps.target})</p>
                            <button class='highlight' onClick={() => handleFps('target', Math.max(settings().fps.min, 30))}>30</button>            
                            <button class='highlight' onClick={() => handleFps('target', Math.max(settings().fps.min, 60))}>60</button>            
                            <button class='highlight' onClick={() => handleFps('target', 90)}>90</button>
                            <button class='highlight' onClick={() => handleFps('target', 120)}>120</button>
                            <div style={font('0.5em', 'gold')}>[The optimum rendering rate, in frames per second. This does not enforce the fps rate, it merely tells Phaser what rate is considered optimal for this game.]</div>
                            
                            <p>Limit: ({settings().fps.limit})</p>
                            <button class='highlight' onClick={() => handleFps('limit', Math.max(settings().fps.min, 30))}>30</button>            
                            <button class='highlight' onClick={() => handleFps('limit', Math.max(settings().fps.min, 60))}>60</button>            
                            <button class='highlight' onClick={() => handleFps('limit', 90)}>90</button>
                            <button class='highlight' onClick={() => handleFps('limit', 120)}>120</button>
                            <div style={font('0.5em', 'gold')}>[Enforces an fps rate limit that the game step will run at, regardless of browser frequency. 0 means 'no limit'. Never set this higher than RAF can handle.]</div>
                            
                            <button class='highlight' onClick={() => handleFps('forceSetTimeOut', !settings().fps.forceSetTimeOut)}>
                                Force Set Time Out: ({settings().fps.forceSetTimeOut ? 'True' : 'False'})
                            </button>            
                            <div style={font('0.5em', 'gold')}>[Use setTimeout instead of requestAnimationFrame to run the game loop.]</div>
                            
                            <button class='highlight' onClick={() => handleFps('smoothStep', !settings().fps.smoothStep)}>
                                Smooth Step: ({settings().fps.smoothStep ? 'True' : 'False'})
                            </button>            
                            <div style={font('0.5em', 'gold')}>[Apply delta smoothing during the game update to help avoid spikes?]</div>
                        </div>
                    </Collapse>

                    <h1 onClick={() => resetFrame('speed', !frame().speed)} style={font('1.25em')}>Speed</h1>
                    <Collapse value={frame().speed} class='my-transition'>
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
                        <div style={font('0.5em', 'gold')}>[Adjusts the movement speed of the associated entity. This effect is immediate.]</div>
                    </Collapse>

                    <h1 onClick={() => resetFrame('sound', !frame().sound)} style={font('1.25em')}>Sound</h1>
                    <Collapse value={frame().sound} class='my-transition'>
                        <div style={font('0.75em', '#fdf6d8')}> 
                            <button class='gold highlight' onClick={() => handleMusic()}>{settings().music ? 'Enabled' : 'Disabled'}</button>
                        </div>
                        <div style={font('0.5em')}>[Whether any music or sound effects are enabled. Restart Game For This Change To Take Effect.]</div>
                        <div style={{...font('0.75em', '#fdf6d8'), 'margin': '3%' }}>Volume ({settings().volume})</div>
                        <Form.Range min={0} max={1} step={0.1} value={settings().volume} onChange={(e) => handleVolume(Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                    </Collapse>
                    
                    <h1 onClick={() => resetFrame('tooltips', !frame().tooltips)} style={font('1.25em')}>Tooltips</h1>
                    <Collapse value={frame().tooltips} class='my-transition'>
                        <h1 onClick={() => resetDifficulty('actionTooltip', !difficulty().actionTooltip)} style={font('0.85em')}>Button</h1>
                        <Collapse value={difficulty().actionTooltip} class='my-transition'>
                            <button class='gold highlight' onClick={() => handleTooltips()}>{settings().difficulty.tooltips ? 'Enabled' : 'Disabled'}</button>
                            <div style={font('0.5em')}>[Enabled = Click / Hover Actions to Provide an Info Popup, Disabled = No Info Popups]</div>
                        </Collapse>

                        <h1 onClick={() => resetDifficulty('tidbits', !difficulty().tidbits)} style={font('0.85em')}>Informational Pop-ups</h1>
                        <Collapse value={difficulty().tidbits} class='my-transition'>
                            <button class='gold highlight' onClick={() => handleTidbits()}>{settings().difficulty.tidbits ? 'Enabled' : 'Disabled'}</button>
                            <div style={font('0.5em')}>[Enabled = Helpful Hints and Lore Popups, Disabled = No Info Popups]</div>
                        </Collapse>
                    </Collapse>
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
        <button class='highlight cornerTR' style={{ 'background-color': 'red', 'z-index': 1, 'font-size': '0.5em', padding: '0.25em' }} onClick={() => setShowRestart(true)}>
            Restart
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