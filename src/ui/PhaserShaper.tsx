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
        const newJoystick = { side, [axis]: Number(e.target.value) };
        console.log(newJoystick, 'New Joystick');
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                [`${side}Joystick`]: {
                    ...settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'],
                    [axis]: Number(e.target.value)
                } 
            } 
        };
        console.log(newSettings, 'New Settings');
        await updateSettings(newSettings);
        const update = { 
            side, 
            x: axis === 'x' ? Number(e.target.value) : settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'].x, 
            y: axis === 'y' ? Number(e.target.value) : settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'].y 
        };
        console.log(update, 'Update');
        EventBus.emit('update-settings', newSettings);
        EventBus.emit('update-joystick-position', update);
    };

    async function handleButtons(e: any, type: string, axis: string) {
        const newButtons = { type, [axis]: Number(e.target.value) };
        console.log(newButtons, 'New Buttons');
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    [axis]: Number(e.target.value)
                } 
            } 
        };
        console.log(newSettings, 'New Settings');
        await updateSettings(newSettings);
        const update = { 
            type, 
            x: axis === 'x' ? Number(e.target.value) : settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'].x, 
            y: axis === 'y' ? Number(e.target.value) : settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'].y 
        };
        console.log(update, 'Update');
        EventBus.emit('update-settings', newSettings);
        EventBus.emit('reposition-buttons', update);
    };

    async function handleFPS(e: any, axis: string) {
        const newFPS = { [axis]: Number(e.target.value) };
        console.log(newFPS, 'New FPS');
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                fpsText: {
                    ...settings().positions.fpsText,
                    [axis]: Number(e.target.value)
                } 
            } 
        };
        console.log(newSettings, 'New Settings');
        await updateSettings(newSettings);
        const update = { 
            x: axis === 'x' ? Number(e.target.value) : settings().positions.fpsText.x, 
            y: axis === 'y' ? Number(e.target.value) : settings().positions.fpsText.y 
        };
        console.log(update, 'Update');
        EventBus.emit('update-settings', newSettings);
        EventBus.emit('update-fps', update);
    };

    async function handleHud(e: any, axis: string) {
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                smallHud: {
                    ...settings().positions.smallHud,
                    [axis]: Number(e.target.value)
                } 
            } 
        };
        console.log(newSettings, 'New Settings');
        await updateSettings(newSettings);
        const update = { 
            x: axis === 'x' ? Number(e.target.value) : settings().positions.smallHud.x, 
            y: axis === 'y' ? Number(e.target.value) : settings().positions.smallHud.y 
        };
        console.log(update, 'Update');
        EventBus.emit('update-settings', newSettings);
        EventBus.emit('update-hud-position', update);
    };

    async function handleLeftHud(e: any, axis: string) {
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                leftHud: {
                    ...settings().positions.leftHud,
                    [axis]: Number(e.target.value)
                } 
            }
        };
        console.log(newSettings, 'New Settings');
        await updateSettings(newSettings);
        const update = { 
            x: axis === 'x' ? Number(e.target.value) : settings().positions.leftHud.x, 
            y: axis === 'y' ? Number(e.target.value) : settings().positions.leftHud.y 
        };
        console.log(update, 'Update');
        EventBus.emit('update-settings', newSettings);
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

            <h1 style={font('1.25em')}>Special Buttons</h1>
            <div style={font('1em')}>X: ({settings().positions.specialButtons.x})</div>
            <Form.Range 
                min={0} max={1} step={0.0125} 
                onChange={(e) => handleButtons(e, 'special', 'x')} 
                value={settings().positions.specialButtons.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.specialButtons.y})</div>
            <Form.Range 
                min={0} max={1} step={0.0125} 
                onChange={(e) => handleButtons(e, 'special', 'y')} 
                value={settings().positions.specialButtons.y} 
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

            <h1 style={font('1.25em')}>Smal HUD</h1>
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