import { Accessor } from 'solid-js';
import { Form } from 'solid-bootstrap';
import { EventBus } from '../game/EventBus';
import Settings from '../models/settings';
import { updateSettings } from '../assets/db/db';
import { useResizeListener } from '../utility/dimensions';
import { COLORS, NUMBERS, font } from '../utility/styling';

interface IPhaserShape {
    settings: Accessor<Settings>;
};

export function PhaserShaper({ settings }: IPhaserShape) {
    const dimensions = useResizeListener();

    async function handleJoystick(e: any, side: string, axis: string) {
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

    async function handleJoystickColor(color: string, side: string, type: string) {
        const newSettings = {
            ...settings(), 
            positions: {
                ...settings().positions, 
                [`${side}Joystick`]: {
                    ...settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'],
                    [type]: color
                }
            },
        };
        await updateSettings(newSettings);
        const update = {
            color, side, type
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-joystick-color', update);
    };

    async function handleJoystickOpacity(e: any, side: string) {
        const opacity = Number(e.target.value);
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                [`${side}Joystick`]: {
                    ...settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'],
                    opacity
                } 
            } 
        };
        await updateSettings(newSettings);
        const update = { 
            side, 
            opacity
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-joystick-opacity', update);
    };

    async function handleJoystickWidth(e: any, side: string) {
        const width = Number(e.target.value);
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                [`${side}Joystick`]: {
                    ...settings().positions[`${side}Joystick` as 'leftJoystick' | 'rightJoystick'],
                    width
                } 
            } 
        };
        await updateSettings(newSettings);
        const update = { 
            side, 
            width
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-joystick-width', update);
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

    async function handleButtonOpacity(e: any, type: string) {
        const opacity = Number(e.target.value); 
        const newSettings = {
            ...settings(),
            positions: {
                ...settings().positions,
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    opacity
                }
            }
        };
        await updateSettings(newSettings);
        const update = { type, opacity };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('opacity-buttons', update);
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

    async function handleButtonBorder(border: string, type: string) {
        const newSettings = {
            ...settings(),
            positions: {
                ...settings().positions,
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    border
                }
            }
        };
        await updateSettings(newSettings);
        const update = { type, border };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('reborder-buttons', update);
    };

    async function handleButtonColor(color: string, type: string) {
        const newSettings = {
            ...settings(),
            positions: {
                ...settings().positions,
                [`${type}Buttons`]: {
                    ...settings().positions[`${type}Buttons` as 'actionButtons' | 'specialButtons'],
                    color
                }
            }
        };
        await updateSettings(newSettings);
        const update = { type, color };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('recolor-buttons', update);
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

    async function handleCamera(zoom: number) {
        const newSettings = { 
            ...settings(), 
            positions: { 
                ...settings().positions, 
                camera: {
                    ...settings().positions.camera,
                    zoom
                } 
            } 
        };
        await updateSettings(newSettings);
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-camera-zoom', zoom);
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

    async function handleHudOffset(e: any, side: string) {
        const offset = Number(e.target.value);
        console.log(offset, 'Scale', side, 'Side');
        switch (side) {
            case 'left':
                const newSettings = { 
                    ...settings(), 
                    positions: { 
                        ...settings().positions, 
                        leftHud: {
                            ...settings().positions.leftHud,
                            offset
                        } 
                    } 
                };
                await updateSettings(newSettings);
                EventBus.emit('save-settings', newSettings);
                EventBus.emit('update-left-hud-offset', offset);
                break;
            case 'right':
                const newSettings2 = { 
                    ...settings(), 
                    positions: { 
                        ...settings().positions, 
                        smallHud: {
                            ...settings().positions.smallHud,
                            offset
                        } 
                    } 
                };
                await updateSettings(newSettings2);
                EventBus.emit('save-settings', newSettings2);
                EventBus.emit('update-small-hud-offset', offset);
                break;
            case 'solid':
                const newSettings3 = { 
                    ...settings(), 
                    positions: { 
                        ...settings().positions, 
                        solidHud: {
                            ...settings().positions.solidHud,
                            right: offset
                        } 
                    } 
                };
                await updateSettings(newSettings3);
                EventBus.emit('save-settings', newSettings3);
                break;
            default: 
                break;
        };
    };

    async function handleHudScale(e: any, side: string) {
        const scale = Number(e.target.value);
        console.log(scale, 'Scale', side, 'Side');
        switch (side) {
            case 'left':
                const newSettings = { 
                    ...settings(), 
                    positions: { 
                        ...settings().positions, 
                        leftHud: {
                            ...settings().positions.leftHud,
                            scale
                        } 
                    } 
                };
                await updateSettings(newSettings);
                EventBus.emit('save-settings', newSettings);
                EventBus.emit('update-left-hud-scale', scale);
                break;
            case 'right':
                const newSettings2 = { 
                    ...settings(), 
                    positions: { 
                        ...settings().positions, 
                        smallHud: {
                            ...settings().positions.smallHud,
                            scale
                        } 
                    } 
                };
                await updateSettings(newSettings2);
                EventBus.emit('save-settings', newSettings2);
                EventBus.emit('update-small-hud-scale', scale);
                break;
            default: 
                break;
        };
    };

    async function handleRightHud(e: any, axis: string) {
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
            <h1 style={font('1.25em')}>Camera</h1>
            <div style={font('1em')}>Zoom: ({settings().positions.camera?.zoom})</div>
            <Form.Range 
                min={0.1} max={1.5} step={0.05} 
                onChange={(e) => handleCamera(Number(e.target.value))} 
                value={settings().positions.camera?.zoom} 
            />
            
            <h1 style={font('1.25em')}>Left Joystick</h1>
            <div style={font('1em')}>Base Color: ({NUMBERS[settings().positions.leftJoystick.base as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleJoystickColor(e.target.value, 'left', 'base')} style={{ margin: '3%' }} value={settings().positions.leftJoystick.base}>
                <option>Base Menu</option>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Thumb Color: ({NUMBERS[settings().positions.leftJoystick.thumb as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleJoystickColor(e.target.value, 'left', 'thumb')} style={{ margin: '3%' }} value={settings().positions.leftJoystick.thumb}>
                <option>Thumb Menu</option>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Opacity: ({settings().positions.leftJoystick.opacity})</div>
            <Form.Range 
                min={0} max={1} step={0.05} 
                onChange={(e) => handleJoystickOpacity(e, 'left')} 
                value={settings().positions.leftJoystick.opacity} 
            />
            <div style={font('1em')}>Scale: ({settings().positions.leftJoystick.width})</div>
            <Form.Range 
                min={0.1} max={2} step={0.05} 
                onChange={(e) => handleJoystickWidth(e, 'left')} 
                value={settings().positions.leftJoystick.width} 
            />
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
            <div style={font('1em')}>Base Color: ({NUMBERS[settings().positions.rightJoystick.base as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleJoystickColor(e.target.value, 'right', 'base')} style={{ margin: '3%' }} value={settings().positions.rightJoystick.base}>
                <option>Base Menu</option>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Thumb Color: ({NUMBERS[settings().positions.rightJoystick.thumb as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleJoystickColor(e.target.value, 'right', 'thumb')} style={{ margin: '3%' }} value={settings().positions.rightJoystick.thumb}>
                <option>Thumb Menu</option>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Opacity: ({settings().positions.rightJoystick.opacity})</div>
            <Form.Range 
                min={0} max={1} step={0.05} 
                onChange={(e) => handleJoystickOpacity(e, 'right')} 
                value={settings().positions.rightJoystick.opacity} 
            />
            <div style={font('1em')}>Scale: ({settings().positions.rightJoystick.width})</div>
            <Form.Range 
                min={0.1} max={2} step={0.05} 
                onChange={(e) => handleJoystickWidth(e, 'right')} 
                value={settings().positions.rightJoystick.width} 
            />
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
            <div style={font('1em')}>Border: ({NUMBERS[settings().positions.actionButtons.border as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleButtonBorder(e.target.value, 'action')} style={{ margin: '3%' }} value={settings().positions.actionButtons.border}>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Color: ({NUMBERS[settings().positions.actionButtons.color as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleButtonColor(e.target.value, 'action')} style={{ margin: '3%' }} value={settings().positions.actionButtons.color}>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Display: ({settings().positions.actionButtons.display.charAt(0).toUpperCase() + settings().positions.actionButtons.display.slice(1)})</div>
            {['Arc', 'Diagonal', 'Horizontal', 'Vertical'].map((display: string) => {
                return (
                    <button class='highlight p-3' onClick={() => handleButtonDisplay(display.toLowerCase(), 'action')}>{display}</button>
                )
            })}
            <div style={font('1em')}>Opacity: ({settings().positions.actionButtons.opacity})</div>
            <Form.Range 
                min={0} max={1} step={0.05} 
                onChange={(e) => handleButtonOpacity(e, 'action')} 
                value={settings().positions.actionButtons.opacity} 
            />
            <div style={font('1em')}>Scale: ({settings().positions.actionButtons.width})</div>
            <Form.Range 
                min={0} max={2} step={0.1} 
                onChange={(e) => handleButtonWidth(e, 'action')} 
                value={settings().positions.actionButtons.width} 
            />
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


            <h1 style={font('1.25em')}>Special Buttons</h1>
            <div style={font('1em')}>Border: ({NUMBERS[settings().positions.specialButtons.border as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleButtonBorder(e.target.value, 'special')} style={{ margin: '3%' }} value={settings().positions.specialButtons.border}>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Color: ({NUMBERS[settings().positions.specialButtons.color as keyof typeof NUMBERS]})</div>
            <Form.Select onChange={(e) => handleButtonColor(e.target.value, 'special')} style={{ margin: '3%' }} value={settings().positions.specialButtons.color}>
                {Object.keys(COLORS).map((color: string) => {
                    return (
                        <option value={COLORS[color as keyof typeof COLORS]}>{color}</option>
                    )
                })}
            </Form.Select>
            <div style={font('1em')}>Display: ({settings().positions.specialButtons.display.charAt(0).toUpperCase() + settings().positions.specialButtons.display.slice(1)})</div>
            {['Arc', 'Diagonal', 'Horizontal', 'Vertical'].map((display: string) => {
                return (
                    <button class='highlight p-3' onClick={() => handleButtonDisplay(display.toLowerCase(), 'special')}>{display}</button>
                )
            })}
            <div style={font('1em')}>Opacity: ({settings().positions.specialButtons.opacity})</div>
            <Form.Range 
                min={0} max={1} step={0.05} 
                onChange={(e) => handleButtonOpacity(e, 'special')} 
                value={settings().positions.specialButtons.opacity} 
            />
            <div style={font('1em')}>Scale: ({settings().positions.specialButtons.width})</div>
            <Form.Range 
                min={0} max={2} step={0.1} 
                onChange={(e) => handleButtonWidth(e, 'special')} 
                value={settings().positions.specialButtons.width} 
            />
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

            <h1 style={font('1.25em')}>Left (Stance) HUD</h1>
            <div style={font('1em')}>Offset ({settings().positions.leftHud.offset})</div>
            <Form.Range 
                min={30} max={50} step={1.25} 
                onChange={(e) => handleHudOffset(e, 'left')} 
                value={settings().positions.leftHud.offset} 
            />
            <div style={font('1em')}>Scale ({settings().positions.leftHud.scale})</div>
            <Form.Range 
                min={0.05} max={0.2} step={0.005} 
                onChange={(e) => handleHudScale(e, 'left')} 
                value={settings().positions.leftHud.scale} 
            />
            <div style={font('1em')}>X: ({settings().positions.leftHud.x})</div>
            <Form.Range 
                min={-0.125} max={1} step={0.0125} 
                onChange={(e) => handleLeftHud(e, 'x')} 
                value={settings().positions.leftHud.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.leftHud.y})</div>
            <Form.Range 
                min={0.1} max={1.1} step={0.0125} 
                onChange={(e) => handleLeftHud(e, 'y')} 
                value={settings().positions.leftHud.y} 
            />
            

            <h1 style={font('1.25em')}>Right (Settings) HUD</h1>
            <div style={font('1em')}>Offset ({settings().positions.smallHud.offset})</div>
            <Form.Range 
                min={30} max={50} step={1.25} 
                onChange={(e) => handleHudOffset(e, 'right')} 
                value={settings().positions.smallHud.offset} 
            />
            <div style={font('1em')}>Scale ({settings().positions.smallHud.scale})</div>
            <Form.Range 
                min={0.05} max={0.2} step={0.005} 
                onChange={(e) => handleHudScale(e, 'right')} 
                value={settings().positions.smallHud.scale} 
            />
            <div style={font('1em')}>X: ({settings().positions.smallHud.x})</div>
            <Form.Range 
                min={0} max={1} step={0.0125} 
                onChange={(e) => handleRightHud(e, 'x')} 
                value={settings().positions.smallHud.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.smallHud.y})</div>
            <Form.Range 
                min={0.1} max={1.1} step={0.0125} 
                onChange={(e) => handleRightHud(e, 'y')} 
                value={settings().positions.smallHud.y} 
            />

            
            <h1 style={font('1.25em')}>Solid (Overview) HUD</h1>
            <div style={font('1em')}>X: ({settings().positions.solidHud.right})</div>
            <Form.Range 
                min={0} max={20} step={0.5} 
                onChange={(e) => handleHudOffset(e, 'solid')} 
                value={settings().positions.solidHud.right} 
            />
        </div>
    );
};