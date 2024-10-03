import { Accessor } from 'solid-js';
import { Form } from 'solid-bootstrap';
import { EventBus } from '../game/EventBus';
import Settings from '../models/settings';
import { updateSettings } from '../assets/db/db';
import { useResizeListener } from '../utility/dimensions';
import { COLORS, NUMBERS, font } from '../utility/styling';
import { roundToTwoDecimals } from '../utility/combat';

interface IPhaserShape {
    settings: Accessor<Settings>;
};

export default function PhaserShaper({ settings }: IPhaserShape) {
    const dimensions = useResizeListener();
    async function handleCastbar(type: string, value: number) {
        console.log(type, value, 'Type and Value');
        const newSettings = {
            ...settings(),
            positions: {
                ...settings().positions,
                castbar: {
                    ...settings().positions.castbar,
                    [`bar${type}`]: value
                }
            }
        };
        await updateSettings(newSettings);
        EventBus.emit('save-settings', newSettings);
        switch (type) {
            case 'Height':
                EventBus.emit('update-castbar', { height: value, width: settings().positions.castbar.barWidth });
                break;
            case 'Width':
                EventBus.emit('update-castbar', { height: settings().positions.castbar.barHeight, width: value });
                break;
            case 'Y':
                EventBus.emit('castbar-y', value);
                break;
            default:
                break;
        };
    };

    async function handleJoystick(e: number, side: string, axis: string) {
        const change = roundToTwoDecimals(e, 3);
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

    async function handleButtons(e: number, type: string, axis: string) {
        const change = roundToTwoDecimals(e, 4);
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

    async function handleButtonWidth(rewidth: number, type: string) {
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

    // async function handleFPS(e: any, axis: string) {
    //     const change = Number(e.target.value);
    //     const newSettings = { 
    //         ...settings(), 
    //         positions: { 
    //             ...settings().positions, 
    //             fpsText: {
    //                 ...settings().positions.fpsText,
    //                 [axis]: change
    //             } 
    //         } 
    //     };
    //     await updateSettings(newSettings);
    //     const update = { 
    //         x: axis === 'x' ? change : settings().positions.fpsText.x, 
    //         y: axis === 'y' ? change : settings().positions.fpsText.y 
    //     };
    //     EventBus.emit('save-settings', newSettings);
    //     EventBus.emit('update-fps', update);
    // };

    async function handleHudOffset(e: number, side: string) {
        const offset = roundToTwoDecimals(e, 3);
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

    async function handleHudScale(scale: number, side: string) {
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

    async function handleRightHud(e: number, axis: string) {
        const change = roundToTwoDecimals(e, 4);
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

    async function handleLeftHud(e: number, axis: string) {
        const change = roundToTwoDecimals(e, 4);
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
        await updateSettings(newSettings);
        const update = { 
            x: axis === 'x' ? change : settings().positions.leftHud.x, 
            y: axis === 'y' ? change : settings().positions.leftHud.y 
        };
        EventBus.emit('save-settings', newSettings);
        EventBus.emit('update-left-hud-position', update);
    };
    
    {/* <div style={font('0.5em')}>[Aggressive AI Range: 0 - 100%]</div> */}
    return (
        <div class='center creature-heading' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '0' } : { 'margin-top': '50%' }}>
            {/* <h1 style={font('1.25em')}>Camera</h1>
            <div style={font('1em')}>
            <button class='highlight' onClick={() => handleCamera(Math.max(roundToTwoDecimals(Number(settings().positions.camera?.zoom - 0.05)), 0.5))}
            >-</button>
            Zoom: ({settings().positions.camera?.zoom})
            <button class='highlight' onClick={() => handleCamera(Math.min(roundToTwoDecimals(Number(settings().positions.camera?.zoom + 0.05)), 1.5))}
            >+</button></div> */}
            <h1 style={font('1.25em')}>Castbar</h1>
            <div style={font('1em')}>
            <button class='highlight' onClick={() => handleCastbar('Height', settings().positions.castbar.barHeight - 2)}
            >-</button>
                Height: ({settings().positions.castbar.barHeight})
                <button class='highlight' onClick={() => handleCastbar('Height', settings().positions.castbar.barHeight + 2)}
            >+</button>
            </div>
            <div style={font('1em')}>
            <button class='highlight' onClick={() => handleCastbar('Width', settings().positions.castbar.barWidth - 2)}
            >-</button>
                Width: ({settings().positions.castbar.barWidth})
                <button class='highlight' onClick={() => handleCastbar('Width', settings().positions.castbar.barWidth + 2)}
            >+</button>
            </div>
            <div style={font('1em')}>
            <button class='highlight' onClick={() => handleCastbar('Y', settings().positions.castbar.barY - 2)}
            >-</button>
                Y: ({settings().positions.castbar.barY})
                <button class='highlight' onClick={() => handleCastbar('Y', settings().positions.castbar.barY + 2)}
            >+</button>
            </div>

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
            <div style={font('1em')}>Opacity: ({roundToTwoDecimals(settings().positions.leftJoystick.opacity)})</div>
            <Form.Range 
                min={0.001} max={1} step={0.05} 
                onChange={(e) => handleJoystickOpacity(e, 'left')} 
                value={settings().positions.leftJoystick.opacity} 
            />
            <div style={font('1em')}>Scale: ({settings().positions.leftJoystick.width})</div>
            <Form.Range min={0.1} max={2} step={0.05} onChange={(e) => handleJoystickWidth(e, 'left')} value={settings().positions.leftJoystick.width} />
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleJoystick(Math.max(-0.1, settings().positions.leftJoystick.x - 0.025), 'left', 'x')}>-</button>
                X: ({settings().positions.leftJoystick.x})
                <button class='highlight' onClick={() => handleJoystick(Math.min(1.1, settings().positions.leftJoystick.x + 0.025), 'left', 'x')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleJoystick(Math.max(-0.1, settings().positions.leftJoystick.y - 0.025), 'left', 'y')}>-</button>            
                Y: ({settings().positions.leftJoystick.y})
                <button class='highlight' onClick={() => handleJoystick(Math.min(1.1, settings().positions.leftJoystick.y + 0.025), 'left', 'y')}>+</button>
            </div>
           
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
            <div style={font('1em')}>Opacity: ({roundToTwoDecimals(settings().positions.rightJoystick.opacity)})</div>
            <Form.Range 
                min={0.001} max={1} step={0.05} 
                onChange={(e) => handleJoystickOpacity(e, 'right')} 
                value={settings().positions.rightJoystick.opacity} 
            />
            <div style={font('1em')}>Scale: ({settings().positions.rightJoystick.width})</div>
            <Form.Range 
                min={0.1} max={2} step={0.05} 
                onChange={(e) => handleJoystickWidth(e, 'right')} 
                value={settings().positions.rightJoystick.width} 
            />
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleJoystick(Math.max(-0.1, settings().positions.rightJoystick.x - 0.025), 'right', 'x')}>-</button>
                X: ({settings().positions.rightJoystick.x})
                <button class='highlight' onClick={() => handleJoystick(Math.min(1.1, settings().positions.rightJoystick.x + 0.025), 'right', 'x')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleJoystick(Math.max(0, settings().positions.rightJoystick.y - 0.025), 'right', 'y')}>-</button>
                Y: ({settings().positions.rightJoystick.y})
                <button class='highlight' onClick={() => handleJoystick(Math.min(1.1, settings().positions.rightJoystick.y + 0.025), 'right', 'y')}>+</button>
            </div>
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
            <Form.Select onChange={(e) => handleButtonDisplay(e.target.value.toLowerCase(), 'action')} style={{ margin: '3%' }} value={settings().positions.actionButtons.display.charAt(0).toUpperCase() + settings().positions.actionButtons.display.slice(1)}>    
            {['Arc', 'Diagonal', 'Horizontal', 'Vertical'].map((display: string) => {
                return (
                    <option value={`${display}`}>{display}</option>
                )
            })}
            </Form.Select>
            <div style={font('1em')}>Opacity: ({roundToTwoDecimals(settings().positions.actionButtons.opacity)})</div>
            <Form.Range 
                min={0.001} max={1} step={0.05} 
                onChange={(e) => handleButtonOpacity(e, 'action')} 
                value={settings().positions.actionButtons.opacity} 
            />
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleButtonWidth(roundToTwoDecimals(Math.max(0, settings().positions.actionButtons.width - 0.05)), 'action')}>-</button>
                    Scale: ({settings().positions.actionButtons.width})
                <button class='highlight' onClick={() => handleButtonWidth(roundToTwoDecimals(Math.min(2, settings().positions.actionButtons.width + 0.05)), 'action')}>+</button>
            </div>
            <div style={font('1em')}>Spacing: ({settings().positions.actionButtons.spacing})</div>
            <Form.Range 
                min={1} max={5} step={0.5} 
                onChange={(e) => handleButtonSpacing(e, 'action')} 
                value={settings().positions.actionButtons.spacing} 
            />
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleButtons(Math.max(0, settings().positions.actionButtons.x - 0.0025), 'action', 'x')}>-</button>
                X: ({settings().positions.actionButtons.x})
                <button class='highlight' onClick={() => handleButtons(Math.min(1, settings().positions.actionButtons.x + 0.0025), 'action', 'x')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleButtons(Math.max(0, settings().positions.actionButtons.y - 0.0025), 'action', 'y')}>-</button>
                Y: ({settings().positions.actionButtons.y})
                <button class='highlight' onClick={() => handleButtons(Math.min(1, settings().positions.actionButtons.y + 0.0025), 'action', 'y')}>+</button>
            </div>

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
            <Form.Select onChange={(e) => handleButtonDisplay(e.target.value.toLowerCase(), 'special')} style={{ margin: '3%' }} value={settings().positions.specialButtons.display.charAt(0).toUpperCase() + settings().positions.specialButtons.display.slice(1)}>    
            {['Arc', 'Diagonal', 'Horizontal', 'Vertical'].map((display: string) => {
                return (
                    <option value={`${display}`}>{display}</option>
                )
            })}
            </Form.Select>
            <div style={font('1em')}>Opacity: ({roundToTwoDecimals(settings().positions.specialButtons.opacity)})</div>
            <Form.Range 
                min={0.001} max={1} step={0.05} 
                onChange={(e) => handleButtonOpacity(e, 'special')} 
                value={settings().positions.specialButtons.opacity} 
            />
            
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleButtonWidth(roundToTwoDecimals(Math.max(0, settings().positions.specialButtons.width - 0.05)), 'special')}>-</button>
                    Scale: ({settings().positions.specialButtons.width})
                <button class='highlight' onClick={() => handleButtonWidth(roundToTwoDecimals(Math.min(2, settings().positions.specialButtons.width + 0.05)), 'special')}>+</button>
            </div>

            <div style={font('1em')}>Spacing: ({settings().positions.specialButtons.spacing})</div>
            <Form.Range 
                min={1} max={5} step={0.5} 
                onChange={(e) => handleButtonSpacing(e, 'special')} 
                value={settings().positions.specialButtons.spacing} 
            />
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleButtons(Math.max(0, settings().positions.specialButtons.x - 0.0025), 'special', 'x')}>-</button>
                X: ({settings().positions.specialButtons.x})
                <button class='highlight' onClick={() => handleButtons(Math.min(1, settings().positions.specialButtons.x + 0.0025), 'special', 'x')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleButtons(Math.max(0, settings().positions.specialButtons.y - 0.0025), 'special', 'y')}>-</button>
                Y: ({settings().positions.specialButtons.y})
                <button class='highlight' onClick={() => handleButtons(Math.min(1, settings().positions.specialButtons.y + 0.0025), 'special', 'y')}>+</button>
            </div>

            {/* <h1 style={font('1.25em')}>FPS Text</h1>
            <div style={font('1em')}>X: ({settings().positions.fpsText.x})</div>
            <Form.Range 
                min={0} max={1} step={0.025} 
                onChange={(e) => handleFPS(e, 'x')} 
                value={settings().positions.fpsText.x} 
            />
            <div style={font('1em')}>Y: ({settings().positions.fpsText.y})</div>
            <Form.Range 
                min={-0.5} max={1} step={0.05} 
                onChange={(e) => handleFPS(e, 'y')} 
                value={settings().positions.fpsText.y} 
            /> */}

            <h1 style={font('1.25em')}>Left (Stance) HUD</h1>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleHudOffset(roundToTwoDecimals(Math.max(25, settings().positions.leftHud.offset - 0.125), 3), 'left')}>-</button>
                Offset ({settings().positions.leftHud.offset})
                <button class='highlight' onClick={() => handleHudOffset(roundToTwoDecimals(Math.min(60, settings().positions.leftHud.offset + 0.125), 3), 'left')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleHudScale(roundToTwoDecimals(Math.max(0.05, settings().positions.leftHud.scale - 0.0025), 4), 'left')}>-</button>
                    Scale ({settings().positions.leftHud.scale})
                <button class='highlight' onClick={() => handleHudScale(roundToTwoDecimals(Math.min(0.2, settings().positions.leftHud.scale + 0.0025), 4), 'left')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleLeftHud(roundToTwoDecimals(Math.max(-0.0025, settings().positions.leftHud.x - 0.0025), 4), 'x')}>-</button>
                X: ({settings().positions.leftHud.x})
                <button class='highlight' onClick={() => handleLeftHud(roundToTwoDecimals(Math.min(1, settings().positions.leftHud.x + 0.0025), 4), 'x')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleLeftHud(roundToTwoDecimals(Math.max(-0.0025, settings().positions.leftHud.y - 0.0025), 4), 'y')}>-</button>
                Y: ({settings().positions.leftHud.y})
                <button class='highlight' onClick={() => handleLeftHud(roundToTwoDecimals(Math.min(1.1, settings().positions.leftHud.y + 0.0025), 4), 'y')}>+</button>
            </div>

            <h1 style={font('1.25em')}>Right (Settings) HUD</h1>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleHudOffset(roundToTwoDecimals(Math.max(25, settings().positions.smallHud.offset - 0.125), 3), 'right')}>-</button>
                Offset ({settings().positions.smallHud.offset})
                <button class='highlight' onClick={() => handleHudOffset(roundToTwoDecimals(Math.min(60, settings().positions.smallHud.offset + 0.125), 3), 'right')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleHudScale(roundToTwoDecimals(Math.max(0.05, settings().positions.smallHud.scale - 0.0025), 4), 'right')}>-</button>
                Scale ({settings().positions.smallHud.scale})
                <button class='highlight' onClick={() => handleHudScale(roundToTwoDecimals(Math.min(0.2, settings().positions.smallHud.scale + 0.0025), 4), 'right')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleRightHud(roundToTwoDecimals(Math.max(-0.0025, settings().positions.smallHud.x - 0.0025), 4), 'x')}>-</button>
                X: ({settings().positions.smallHud.x})
                <button class='highlight' onClick={() => handleRightHud(roundToTwoDecimals(Math.min(1, settings().positions.smallHud.x + 0.0025), 4), 'x')}>+</button>
            </div>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleRightHud(roundToTwoDecimals(Math.max(-0.0025, settings().positions.smallHud.y - 0.0025), 4), 'y')}>-</button>
                Y: ({settings().positions.smallHud.y})
                <button class='highlight' onClick={() => handleRightHud(roundToTwoDecimals(Math.min(1.1, settings().positions.smallHud.y + 0.0025), 4), 'y')}>+</button>
            </div>

            <h1 style={font('1.25em')}>Solid (Overview) HUD</h1>
            <div style={font('1em')}>
                <button class='highlight' onClick={() => handleHudOffset(roundToTwoDecimals(Math.max(0, settings().positions.solidHud.right - 0.125), 3), 'solid')}>-</button>
                X: ({settings().positions.solidHud.right})
                <button class='highlight' onClick={() => handleHudOffset(roundToTwoDecimals(Math.min(20, settings().positions.solidHud.right + 0.125), 3), 'solid')}>+</button>
                </div>
        </div>
    );
};