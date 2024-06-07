import { Accessor, JSX } from 'solid-js';
import { Form } from 'solid-bootstrap';
import { EventBus } from '../game/EventBus';
import Settings from '../models/settings';
import { updateSettings } from '../assets/db/db';
import { useResizeListener } from '../utility/dimensions';
import { font } from '../utility/styling';

interface IPhaserShape {
    settings: Accessor<Settings>;
};

export function PhaserShaper({ settings }: IPhaserShape) {
    const dimensions = useResizeListener();

    async function handleJoystick(e: any, side: string, axis: string) {
        // const newJoystick = { side, [axis]: Number(e.target.value) };
        // console.log(newJoystick, 'New Joystick');
        const change = Number(e.target.value);
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                [`${side}Joystick`]: {
                    ...settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'],
                    [axis]: change
                } 
            } 
        };
        await updateSettings(newSettings);
        const update = { 
            side, 
            x: axis === 'x' ? change : settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'].x, 
            y: axis === 'y' ? change : settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'].y 
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-joystick-position', update);
    };

    async function handleButtons(e: any, type: string, axis: string) {
        // const newButtons = { type, [axis]: Number(e.target.value) };
        const change = Number(e.target.value);
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    [axis]: change
                } 
            } 
        };
        await updateSettings(newSettings);
        const update = { 
            type, 
            x: axis === 'x' ? change : settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'].x, 
            y: axis === 'y' ? change : settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'].y 
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('reposition-buttons', update);
    };

    async function handleButtonSpacing(e: any, type: string) {
        const spacing = Number(e.target.value); 
        const newSettings = {
            ...settings(),
            positions: {
                ...settings().positions,
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    spacing
                }
            }
        };
        await updateSettings(newSettings);
        const update = { type, spacing };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('respacing-buttons', update);
    };

    async function handleButtonWidth(e: any, type: string) {
        const rewidth = Number(e.target.value); 
        const newSettings = {
            ...settings(),
            positions: {
                ...settings().positions,
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    width: rewidth
                }
            }
        };
        await updateSettings(newSettings);
        const update = { type, rewidth };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('re-width-buttons', update);
    };

    async function handleButtonDisplay(display: string, type: string) {
        const newSettings = {
            ...settings(),
            positions: {
                ...settings().positions,
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    display
                }
            }
        };
        await updateSettings(newSettings);
        const update = { type, display };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('redisplay-buttons', update);
    };

    async function handleFPS(e: any, axis: string) {
        const change = Number(e.target.value);
        // const newFPS = { [axis]: Number(e.target.value) };
        // console.log(newFPS, 'New FPS');
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                fpsText: {
                    ...settings().positions.fpsText,
                    [axis]: change
                } 
            } 
        };
        await updateSettings(newSettings);
        const update = { 
            x: axis === 'x' ? change : settings().positions.fpsText.x, 
            y: axis === 'y' ? change : settings().positions.fpsText.y 
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-fps', update);
    };

    async function handleHud(e: any, axis: string) {
        const change = Number(e.target.value);
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                smallHud: {
                    ...settings().positions.smallHud,
                    [axis]: change
                } 
            } 
        };
        await updateSettings(newSettings);
        const update = { 
            x: axis === 'x' ? change : settings().positions.smallHud.x, 
            y: axis === 'y' ? change : settings().positions.smallHud.y 
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-hud-position', update);
    };

    async function handleLeftHud(e: any, axis: string) {
        const change = Number(e.target.value);
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                leftHud: {
                    ...settings().positions.leftHud,
                    [axis]: change
                } 
            }
        };
        // console.log(newSettings, 'New Settings');
        await updateSettings(newSettings);
        const update = { 
            x: axis === 'x' ? change : settings().positions.leftHud.x, 
            y: axis === 'y' ? change : settings().positions.leftHud.y 
        };
        // console.log(update, 'Update');
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-left-hud-position', update);
    };
    
    {/* <div style={font('0.5em')}>[Aggressive AI Range: 0 - 100%]</div> */}
    return (
        <div class='center creature-heading' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '0' } : { 'margin-top': '50%' }}>
            <h1 style={font('1.25em')}>Left Joystick</h1>
            <div style={font('1em')}>X: ({settings().positions.leftJoystick.x})</div>
            <Form.Range 
                min={0} max={1} step={0.025} 
                onChange={(e) => handleJoystick(e, 'left', 'x')} 
                value={settings().positions.leftJoystick.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.leftJoystick.y})</div>
            <Form.Range 
                min={0} max={1} step={0.025} 
                onChange={(e) => handleJoystick(e, 'left', 'y')} 
                value={settings().positions.leftJoystick.y} 
            />
           
            <h1 style={font('1.25em')}>Right Joystick</h1>
            <div style={font('1em')}> X: ({settings().positions.rightJoystick.x})</div>
            <Form.Range 
                min={0} max={1} step={0.025} 
                onChange={(e) => handleJoystick(e, 'right', 'x')} 
                value={settings().positions.rightJoystick.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.rightJoystick.y})</div>
            <Form.Range 
                min={0} max={1} step={0.025} 
                onChange={(e) => handleJoystick(e, 'right', 'y')} 
                value={settings().positions.rightJoystick.y} 
            />
            <h1 style={font('1.25em')}>Action Buttons</h1>
            <div style={font('1em')}>Display: ({settings().positions.actionButtons.display.charAt(0).toUpperCase() + settings().positions.actionButtons.display.slice(1)})</div>
            {['Arc', 'Diagonal', 'Horizontal', 'Vertical'].map((display: string) => {
                return (
                    <button class='highlight p-3' onClick={() => handleButtonDisplay(display.toLowerCase(), 'action')}>{display}</button>
                )
            })}
            <div style={font('1em')}>Spacing: ({settings().positions.actionButtons.spacing})</div>
            <Form.Range 
                min={1} max={5} step={0.5} 
                onChange={(e) => handleButtonSpacing(e, 'action')} 
                value={settings().positions.actionButtons.spacing} 
            />
            <div style={{...font('0.65em', 'gold'), 'margin-bottom': '3%' }}>[Spacing affects all non-Arc displays.]</div>
            <div style={font('1em')}>X: ({settings().positions.actionButtons.x})</div>
            <Form.Range 
                min={0} max={1} step={0.0125} 
                onChange={(e) => handleButtons(e, 'action', 'x')} 
                value={settings().positions.actionButtons.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.actionButtons.y})</div>
            <Form.Range 
                min={0} max={1} step={0.0125} 
                onChange={(e) => handleButtons(e, 'action', 'y')} 
                value={settings().positions.actionButtons.y} 
            />
            <div style={font('1em')}>Width: ({settings().positions.actionButtons.width})</div>
            <Form.Range 
                min={0} max={2} step={0.1} 
                onChange={(e) => handleButtonWidth(e, 'action')} 
                value={settings().positions.actionButtons.width} 
            />

            <h1 style={font('1.25em')}>Special Buttons</h1>
            <div style={font('1em')}>Display: ({settings().positions.specialButtons.display.charAt(0).toUpperCase() + settings().positions.specialButtons.display.slice(1)})</div>
            {['Arc', 'Diagonal', 'Horizontal', 'Vertical'].map((display: string) => {
                return (
                    <button class='highlight p-3' onClick={() => handleButtonDisplay(display.toLowerCase(), 'special')}>{display}</button>
                )
            })}
            <div style={font('1em')}>Spacing: ({settings().positions.specialButtons.spacing})</div>
            <Form.Range 
                min={1} max={5} step={0.5} 
                onChange={(e) => handleButtonSpacing(e, 'special')} 
                value={settings().positions.specialButtons.spacing} 
            />
            <div style={{...font('0.65em', 'gold'), 'margin-bottom': '3%' }}>[Spacing affects all non-Arc displays.]</div>
            <div style={font('1em')}>X: ({settings().positions.specialButtons.x})</div>
            <Form.Range 
                min={-0.25} max={1} step={0.0125} 
                onChange={(e) => handleButtons(e, 'special', 'x')} 
                value={settings().positions.specialButtons.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.specialButtons.y})</div>
            <Form.Range 
                min={-0.25} max={1} step={0.0125} 
                onChange={(e) => handleButtons(e, 'special', 'y')} 
                value={settings().positions.specialButtons.y} 
            />
            <div style={font('1em')}>Width: ({settings().positions.specialButtons.width})</div>
            <Form.Range 
                min={0} max={2} step={0.1} 
                onChange={(e) => handleButtonWidth(e, 'special')} 
                value={settings().positions.specialButtons.width} 
            />

            <h1 style={font('1.25em')}>FPS Text</h1>
            <div style={font('1em')}>X: ({settings().positions.fpsText.x})</div>
            <Form.Range 
                min={0} max={1} step={0.025} 
                onChange={(e) => handleFPS(e, 'x')} 
                value={settings().positions.fpsText.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.fpsText.y})</div>
            <Form.Range 
                min={-0.15} max={1} step={0.05} 
                onChange={(e) => handleFPS(e, 'y')} 
                value={settings().positions.fpsText.y} 
            />

            <h1 style={font('1.25em')}>Left HUD</h1>
            <div style={font('1em')}>X: ({settings().positions.leftHud.x})</div>
            <Form.Range 
                min={-0.125} max={1} step={0.0125} 
                onChange={(e) => handleLeftHud(e, 'x')} 
                value={settings().positions.leftHud.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.leftHud.y})</div>
            <Form.Range 
                min={0.1} max={1.1} step={0.025} 
                onChange={(e) => handleLeftHud(e, 'y')} 
                value={settings().positions.leftHud.y} 
            />
            

            <h1 style={font('1.25em')}>Small HUD</h1>
            <div style={font('1em')}>X: ({settings().positions.smallHud.x})</div>
            <Form.Range 
                min={0} max={1} step={0.0125} 
                onChange={(e) => handleHud(e, 'x')} 
                value={settings().positions.smallHud.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.smallHud.y})</div>
            <Form.Range 
                min={0.1} max={1.1} step={0.025} 
                onChange={(e) => handleHud(e, 'y')} 
                value={settings().positions.smallHud.y} 
            />
        </div>
    );
};