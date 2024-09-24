import Phaser from 'phaser';
import { EventBus } from '../game/EventBus';
import { PLAYER, STAMINA, staminaCheck } from '../utility/player';
import { Game } from '../game/scenes/Game';
import { Underground } from '../game/scenes/Underground';
const ACTIONS = [
    { ATTACK: 0x800080 }, // 0xFA0000 
    { POSTURE: 0x800080 }, // 0x005100 
    { ROLL: 0x800080 }, // 0x0000FA 
    { DODGE: 0x800080 }, // 0xFAFA00 
    { PARRY: 0x800080 }
];
const SPECIALS = [
    { INVOKE: 0x000000 }, 
    { TSHAERAL: 0x000000 }, // 0x7000FF 
    { POLYMORPH: 0x000000 }, // 0x00BEBE 
    { ROOT: 0x000000 }, // 0xFF2E00
    { SNARE: 0x000000 }, // 0xCB0050
];
const DISPLAY = {
    ARC: 'arc',
    DIAGONAL: 'diagonal',
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
};
const SETTINGS = {
    SCALE: 1,
    SCALE_SPECIAL: 0.75,
    BUTTON_WIDTH: 24,
    BUTTON_HEIGHT: 24,
    OPACITY: 0.2,
    BORDER_COLOR: 0xFDF6D8,
    BORDER_LINE: 4,
    BORDER_OFFSET: 1,
};
export type ActionButton = {
    key: string;
    name: string;
    border: Phaser.GameObjects.Graphics;
    graphic: Phaser.GameObjects.Graphics;
    color: number;
    current: number;
    total: number;
    x: number;
    y: number;
    width: number;
    height: number;
    circle?: number;
    isReady: boolean;
    on?: (event: string, fn: () => void, context?: any) => void;
};
export default class ActionButtons extends Phaser.GameObjects.Container {
    public scene: Game | Underground;
    public actionButtons: ActionButton[];
    public specialButtons: ActionButton[];
    private buttonWidth: number;
    private buttonHeight: number;
    private glowFilter: any;
    private borderTimer: any;
    private graphicTimer: any;

    constructor(scene: any) {
        super(scene);
        this.scene = scene;
        this.actionButtons = [];
        this.specialButtons = [];
        this.buttonWidth = SETTINGS.BUTTON_HEIGHT;
        this.buttonHeight = SETTINGS.BUTTON_HEIGHT;
        this.glowFilter = this.scene.plugins.get('rexGlowFilterPipeline');
        this.borderTimer = {};
        this.graphicTimer = {};
        this.addButtons(scene);
        scene.add.existing(this);
        const { width, height } = scene.cameras.main;
        this.setPosition(width / 5, height / 5); // 2.75, 1.5
        this.setDepth(6);
        this.setScrollFactor(0, 0);
        this.setVisible(true); // false
        EventBus.on('reorder-buttons', this.reorderButtons);
        this.reorder();
        this.positionListen();
    };

    setGlow = (object: any, glow: boolean, type: string, key: string, color: number) => {
        this.glowFilter.remove(object);
        if (!glow) {
            switch (type) {
                case 'graphic':
                    if (this.graphicTimer[key] !== undefined) {
                        this.graphicTimer[key].remove(false);
                        this.graphicTimer[key].destroy();
                        this.graphicTimer[key] = undefined;
                    };
                    break;
                case 'border':
                    if (this.borderTimer[key] !== undefined) {
                        this.borderTimer[key].remove(false);
                        this.borderTimer[key].destroy();
                        this.borderTimer[key] = undefined;
                    };
                    break;
                default: break;
            };
            return; 
        };
            
        this.updateGlow(object, color);

        switch (type) {
            case 'graphic':
                this.graphicTimer[key] = this.scene.time.addEvent({
                    delay: 30, // 125 Adjust the delay as needed
                    callback: () => this.updateGlow(object, color),
                    repeat: 5,
                    callbackScope: this
                });
                break;
            case 'border':
                this.borderTimer[key] = this.scene.time.addEvent({
                    delay: 30, // 125 Adjust the delay as needed
                    callback: () => this.updateGlow(object, color),
                    repeat: 5,
                    callbackScope: this
                });
                break;
            default: break;
        };
    };

    updateGlow = (object: any, glowColor: number) => {
        this.glowFilter.remove(object);
        const outerStrength = 2 + Math.sin(this.scene.time.now * 0.005) * 2; // Adjust the frequency and amplitude as needed
        const innerStrength = 2 + Math.cos(this.scene.time.now * 0.005) * 2;
        const intensity = 0.5;
        this.glowFilter.add(object, {
            outerStrength,
            innerStrength,
            glowColor,
            intensity,
            knockout: false
        });
    }; 

    private addButtons = (scene: any): void => {
        const { width, height } = scene.cameras.main;
        const centerActionX = width * scene.settings.positions.actionButtons.x; // / 1.25
        const centerActionY = height * scene.settings.positions.actionButtons.y; // / 1.35
        const centerSpecialX = width * scene.settings.positions.specialButtons.x; // width * 0.725 || / 1.375
        const centerSpecialY = height * scene.settings.positions.specialButtons.y; // height * 0.6 || / 1.675
        ACTIONS.forEach((_element, index) => {
            const { buttonX, buttonY } = this.displayButton('action', 
                this.scene.settings.positions.actionButtons.display, 
                this.scene.settings.positions.specialButtons.spacing,
                index, centerActionX, centerActionY, height
            );
            let button: ActionButton = {
                key: 'action',
                name: scene.settings.actions[index],
                border: new Phaser.GameObjects.Graphics(scene),
                graphic: new Phaser.GameObjects.Graphics(scene),
                color: scene.settings.positions.actionButtons.color,
                current: 100,
                total: 100,
                x: buttonX,
                y: buttonY,
                height: this.buttonHeight,
                width: this.buttonWidth,
                isReady: true,
            };
            button.graphic.fillStyle(scene.settings.positions.actionButtons.color, scene.settings.positions.actionButtons.opacity);
            button.graphic.fillCircle(buttonX, buttonY, button.width as number);
            button.border.lineStyle(SETTINGS.BORDER_LINE, scene.settings.positions.actionButtons.border, scene.settings.positions.actionButtons.opacity);
            button.border.strokeCircle(buttonX, buttonY, button.width + SETTINGS.BORDER_OFFSET as number);
            this.scaleButton(button, scene.settings.positions.actionButtons.width, scene.settings.positions.actionButtons.opacity, scene.settings.positions.actionButtons.border);
            button.graphic.setInteractive(new Phaser.Geom.Circle(buttonX, buttonY, button.width), Phaser.Geom.Circle.Contains)
                .on('pointerdown', (_pointer: any, _localX: any, _localY: any, _event: any) => {
                    this.pressButton(button, scene);
                })
                .on('pointerover', (pointer: any) => {
                    this.setButtonText(button, pointer);
                });

            button.graphic.setScrollFactor(0, 0);
            button.border.setScrollFactor(0, 0);
            button.graphic.setDepth(3);

            this.actionButtons.push(button);
            this.add(button.border);
            this.add(button.graphic);
        });
        SPECIALS.forEach((_element, index) => {
            const { buttonX, buttonY } = this.displayButton('special', 
                this.scene.settings.positions.specialButtons.display, 
                this.scene.settings.positions.specialButtons.spacing,
                index, centerSpecialX, centerSpecialY, height,
            );
            let button: ActionButton = {
                key: 'special',
                name: scene.settings.specials[index],
                border: new Phaser.GameObjects.Graphics(scene),
                graphic: new Phaser.GameObjects.Graphics(scene),
                color: scene.settings.positions.specialButtons.color,
                current: 100,
                total: 100,
                x: buttonX,
                y: buttonY,
                height: this.buttonHeight,
                width: this.buttonWidth,
                isReady: true
            };
            button.graphic.fillStyle(scene.settings.positions.specialButtons.color, scene.settings.positions.specialButtons.opacity);
            button.graphic.fillCircle(buttonX, buttonY, button.width as number);
            button.border.lineStyle(SETTINGS.BORDER_LINE, scene.settings.positions.specialButtons.border, scene.settings.positions.specialButtons.opacity);
            button.border.strokeCircle(buttonX, buttonY, button.width + SETTINGS.BORDER_OFFSET as number);
            this.scaleButton(button, 0.75 * scene.settings.positions.specialButtons.width, scene.settings.positions.specialButtons.opacity, scene.settings.positions.specialButtons.border);
            button.graphic.setInteractive(new Phaser.Geom.Circle(buttonX, buttonY, button.width), Phaser.Geom.Circle.Contains)
                .on('pointerdown', (_pointer: any, _localX: any, _localY: any, _event: any) => {
                    this.pressButton(button, scene);
                })
                .on('pointerover', (pointer: any) => {
                    this.setButtonText(button, pointer);
                });
            button.graphic.setScrollFactor(0, 0);
            button.border.setScrollFactor(0, 0);
            button.graphic.setDepth(3);
            this.specialButtons.push(button);
            this.add(button.border);
            this.add(button.graphic);
        }); 
    };

    animate(button: ActionButton, border: number, color: number, opacity: number, width: number, modifier: number, special: boolean) {
        button.graphic.fillStyle(color, opacity);
        button.border.lineStyle(SETTINGS.BORDER_LINE, border, opacity);
        button.graphic.fillCircle(button.x, button.y, SETTINGS.BUTTON_WIDTH * (special ? SETTINGS.SCALE_SPECIAL : 1) * (width + modifier));
        button.border.strokeCircle(button.x, button.y, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * (special ? SETTINGS.SCALE_SPECIAL : 1) * (width + modifier));
    };

    animateButton(button: ActionButton) {
        this.scene.tweens.add({
            targets: [button],
            scale: 1.5,
            duration: 150,
            yoyo: true,
            onStart: () => {
                button.graphic.clear();
                button.border.clear();
                switch (button.key) {
                    case 'action':
                        this.animate(button, this.scene.settings.positions.actionButtons.color, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity, this.scene.settings.positions.actionButtons.width, 0.4, false);
                        break;
                    case 'special':
                        this.animate(button, this.scene.settings.positions.specialButtons.color, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity, this.scene.settings.positions.specialButtons.width, 0.15, false);
                        break;
                    default:
                        break;
                };
            },
            onComplete: () => {
                button.graphic.clear();
                button.border.clear();
                switch (button.key) {
                    case 'action':
                        this.animate(button, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.color, this.scene.settings.positions.actionButtons.opacity, this.scene.settings.positions.actionButtons.width, 0, false);
                        button.graphic.setInteractive();
                        break;
                    case 'special':
                        this.animate(button, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.color, this.scene.settings.positions.specialButtons.opacity, this.scene.settings.positions.specialButtons.width, 0, true);
                        button.graphic.setInteractive();
                        break;
                    default:
                        break;
                };
            }
        });
    };

    cooldownButton(button: ActionButton, cooldown: number) {
        const type = button.key;
        const display = type === 'action' ? this.scene.settings.positions.actionButtons.display : this.scene.settings.positions.specialButtons.display;
        const spacing = type === 'action' ? this.scene.settings.positions.actionButtons.spacing : this.scene.settings.positions.specialButtons.spacing;
        const index = type === 'action' ? this.actionButtons.indexOf(button) : this.specialButtons.indexOf(button);
        const { buttonX, buttonY } = this.displayButton(button.key, 
            display,
            spacing,
            index, button.x, button.y, this.scene.cameras.main.height
        );
        let text = this.scene.add.text(buttonX, buttonY, cooldown.toString(), { fontSize: '24px', color: '#ffc700' });
        const timer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                cooldown--;
                if (cooldown <= 0) {
                    text.destroy();
                    timer.remove();
                } else {
                    text.setText(cooldown.toString());    
                };
            },
        });
    };

    getButton(name: string) {
        const actionButton = this.actionButtons.find((button: ActionButton) => button.name.toLowerCase() === name);
        const specialButton = this.specialButtons.find((button: ActionButton) => button.name.toLowerCase() === name);
        return actionButton || specialButton;
    };

    private displayButton = (key: string, display: string, spacing: number, index: number, x: number, y: number, height: number) => {
        const radius = height / 2; // Radius of the circle || 1.75
        const startAngle = Math.PI; // Start angle (180 degrees) for the quarter circle
        const endAngle = Math.PI / 2; // End angle (90 degrees) for the quarter circle 
        let angle = 0, buttonX = 0, buttonY = 0; 
        if (this.scene.settings.desktop) {
            const centerX = key === 'action' ? this.scene.cameras.main.width * 0.003 : this.scene.cameras.main.width / 3;
            const bottomY = this.scene.cameras.main.height - (this.buttonHeight * 3);
            buttonX = centerX + index * (radius / spacing);
            // buttonX = centerX - (index + 1) * (radius / spacing); // Clean but backwards
            buttonY = bottomY;
            return { buttonX, buttonY };
        };
        switch (display) {
            case DISPLAY.ARC: 
                angle = startAngle - (index * (startAngle - endAngle)) / (spacing); // spacing 3.57
                buttonX = x + radius * Math.cos(angle);
                buttonY = y - radius * Math.sin(angle); // Negative sign for Y to start from top
                break;
            case DISPLAY.DIAGONAL:
                buttonX = x + index * (radius / spacing); // Diagonal increment by sqrt(2)/2
                buttonY = y - index * (radius / spacing); // Same increment for y to form a diagonal
                break;
            case DISPLAY.HORIZONTAL:
                buttonX = x + index * (radius / spacing); // Horizontal increment by radius
                buttonY = y; // Y remains constant
                break;
            case DISPLAY.VERTICAL:
                buttonX = x; // X remains constant
                buttonY = y + index * (radius / spacing); // Vertical increment by radius
                break;
            default:
                angle = startAngle - (index * (startAngle - endAngle)) / (spacing); // spacing
                buttonX = x + radius * Math.cos(angle);
                buttonY = y - radius * Math.sin(angle); // Negative sign for Y to start from top
                break;
        };
        return { buttonX, buttonY };
    };

    public draw = (): void => {
        this.actionButtons = this.actionButtons.map((button: ActionButton) => {
            this.scaleButton(button, this.scene.settings.positions.actionButtons.width, this.scene.settings.positions.actionButtons.opacity, this.scene.settings.positions.actionButtons.border); // * this.scene.settings.positions.specialButtons.width
            this.repositionButtons({ type: 'action', x: this.scene.settings.positions.actionButtons.x, y: this.scene.settings.positions.actionButtons.y });    
            return button;    
        });
        this.specialButtons = this.specialButtons.map((button: ActionButton) => { 
            this.scaleButton(button, SETTINGS.SCALE_SPECIAL * this.scene.settings.positions.specialButtons.width, this.scene.settings.positions.specialButtons.opacity, this.scene.settings.positions.specialButtons.border);
            this.repositionButtons({ type: 'special', x: this.scene.settings.positions.specialButtons.x, y: this.scene.settings.positions.specialButtons.y });    
            return button;    
        });
    };    

    private positionListen = (): void => {
        EventBus.on('reposition-buttons', this.repositionButtons);
        EventBus.on('re-width-buttons', this.rewidthButtons);
        EventBus.on('redisplay-buttons', this.redisplayButton);
        EventBus.on('respacing-buttons', this.respaceButton);
        EventBus.on('opacity-buttons', this.opacityButton);
        EventBus.on('reborder-buttons', this.reborderButton);
        EventBus.on('recolor-buttons', this.recolorButton);
        EventBus.on('stalwart-buttons', this.stalwartButtons);
    };

    private stalwartButtons = (stalwart: boolean) => {
        if (stalwart === true) {
            this.actionButtons = this.actionButtons.map((button: ActionButton) => {
                if (button.name === 'DODGE' || button.name === 'ROLL') {
                    button.graphic.clear();
                    button.border.clear();
                    button.graphic.disableInteractive();
                };
                return button;
            });
        } else {
            this.actionButtons = this.actionButtons.map((button: ActionButton) => {
                if (button.name === 'DODGE' || button.name === 'ROLL') {
                    this.animateButton(button);
                };
                return button;
            });
        };
    };

    private redisplayButton = (data: { type: string, display: string }) => {
        const { type, display } = data;
        const { width, height } = this.scene.cameras.main;
        const centerActionX = width * this.scene.settings.positions.actionButtons.x; // / 1.25
        const centerActionY = height * this.scene.settings.positions.actionButtons.y; // / 1.35
        const centerSpecialX = width * this.scene.settings.positions.specialButtons.x; // width * 0.725 || / 1.375
        const centerSpecialY = height * this.scene.settings.positions.specialButtons.y; // height * 0.6 || / 1.675

        switch (type) {
            case 'action':
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            case 'special':
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, display, this.scene.settings.positions.specialButtons.spacing,index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            default:
                break;
        };
    };

    private opacityButton = (data: { type: string, opacity: number }) => {
        const { type, opacity } = data;
        const { width, height } = this.scene.cameras.main;
        const centerActionX = width * this.scene.settings.positions.actionButtons.x; // / 1.25
        const centerActionY = height * this.scene.settings.positions.actionButtons.y; // / 1.35
        const centerSpecialX = width * this.scene.settings.positions.specialButtons.x; // width * 0.725 || / 1.375
        const centerSpecialY = height * this.scene.settings.positions.specialButtons.y; // height * 0.6 || / 1.675

        switch (type) {
            case 'action':
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.actionButtons.display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            case 'special':
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.specialButtons.display, this.scene.settings.positions.specialButtons.spacing, index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            default:
                break;
        };
    };

    private reborderButton = (data: { type: string, border: number }) => {
        const { type, border } = data;
        const { width, height } = this.scene.cameras.main;
        const centerActionX = width * this.scene.settings.positions.actionButtons.x; // / 1.25
        const centerActionY = height * this.scene.settings.positions.actionButtons.y; // / 1.35
        const centerSpecialX = width * this.scene.settings.positions.specialButtons.x; // width * 0.725 || / 1.375
        const centerSpecialY = height * this.scene.settings.positions.specialButtons.y; // height * 0.6 || / 1.675

        switch (type) {
            case 'action':
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.actionButtons.display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            case 'special':
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.specialButtons.display, this.scene.settings.positions.specialButtons.spacing, index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            default:
                break;
        };
    };

    private recolorButton = (data: { type: string, color: number }) => {
        const { type, color } = data;
        const { width, height } = this.scene.cameras.main;
        const centerActionX = width * this.scene.settings.positions.actionButtons.x; // / 1.25
        const centerActionY = height * this.scene.settings.positions.actionButtons.y; // / 1.35
        const centerSpecialX = width * this.scene.settings.positions.specialButtons.x; // width * 0.725 || / 1.375
        const centerSpecialY = height * this.scene.settings.positions.specialButtons.y; // height * 0.6 || / 1.675

        switch (type) {
            case 'action':
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    button.color = color;
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.actionButtons.display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            case 'special':
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    button.color = color;
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.specialButtons.display, this.scene.settings.positions.specialButtons.spacing, index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            default:
                break;
        };
    };

    private respaceButton = (data: { type: string, spacing: number }) => {
        const { type, spacing } = data;
        const { width, height } = this.scene.cameras.main;
        const centerActionX = width * this.scene.settings.positions.actionButtons.x; // / 1.25
        const centerActionY = height * this.scene.settings.positions.actionButtons.y; // / 1.35
        const centerSpecialX = width * this.scene.settings.positions.specialButtons.x; // width * 0.725 || / 1.375
        const centerSpecialY = height * this.scene.settings.positions.specialButtons.y; // height * 0.6 || / 1.675

        switch (type) {
            case 'action':
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.actionButtons.display, spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            case 'special':
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.specialButtons.display, spacing,index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            default:
                break;
        };
    };

    private repositionButtons = (data: {type: string, x: number, y: number}): void => {
        const { type, x, y } = data;
        const { width, height } = this.scene.cameras.main;
        
        switch (type) {
            case 'action': {
                const centerActionX = width * x; // / 1.25
                const centerActionY = height * y; // / 1.35
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    if ((button.name === 'DODGE' || button.name === 'ROLL') && this.scene.player.isStalwart === true) return button;
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.actionButtons.display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            };
            case 'special': {
                const centerSpecialX = width * x; // width * 0.725 || / 1.375
                const centerSpecialY = height * y; // height * 0.6 || / 1.675
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(button.key, this.scene.settings.positions.specialButtons.display, this.scene.settings.positions.specialButtons.spacing, index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    return button;
                });
                break;
            };
            default:
                break;
        };
    };

    private rewidthButtons = (data: {type: string, rewidth: number}): void => {
        const { type, rewidth } = data;
        switch (type) {
            case 'action': {
                this.actionButtons = this.actionButtons.map((button: ActionButton) => {
                    this.scaleButton(button, rewidth, this.scene.settings.positions.actionButtons.opacity, this.scene.settings.positions.actionButtons.border);    
                    return button;
                });
                break;
            };
            case 'special': {
                this.specialButtons = this.specialButtons.map((button: ActionButton) => {
                    this.scaleButton(button, rewidth * SETTINGS.SCALE_SPECIAL, this.scene.settings.positions.specialButtons.opacity, this.scene.settings.positions.specialButtons.border);    
                    return button;    
                });
                break;
            };
            default:
                break;
        };
    };

    public pressButton = (button: ActionButton, scene: any): void => {
        const input = button.name.toLowerCase();
        const type = STAMINA.includes(input);
        let check: {success: boolean; cost: number;} = {success: false, cost: 0};
        if (type === true) {
            check = staminaCheck(this.scene.player.stamina, PLAYER.STAMINA[button.name.toUpperCase() as keyof typeof PLAYER.STAMINA]);
        } else {
            check = staminaCheck(this.scene.player.grace, PLAYER.STAMINA[button.name.toUpperCase() as keyof typeof PLAYER.STAMINA]);
        };
        if (check.success === true && scene.player.playerMachine.stateMachine.isState(input)) {
            scene.player.playerMachine.stateMachine.setState(`${input}`);
        } else if (check.success === true && scene.player.playerMachine.positiveMachine.isState(input)) {
            scene.player.playerMachine.positiveMachine.setState(`${input}`);
        };
    };

    public setCurrent = (current: number, limit: number, name: string) => {
        this.actionButtons = this.actionButtons.map((button) => {
            if ((button.name === 'DODGE' || button.name === 'ROLL') && this.scene.player.isStalwart === true) return button;
            if (button.name === name.toUpperCase()) {
                const progressPercentage = current / limit;
                if (current / limit >= 1) {
                    button.graphic.fillCircle(button.x, button.y, this.buttonHeight * 1.25);
                    button.isReady = true;    
                } else {
                    button.graphic.fillCircle(button.x, button.y, this.buttonHeight * progressPercentage);
                    button.graphic.disableInteractive();
                    button.isReady = false;    
                };
                button.current = progressPercentage * button.total;
            };
            return button;
        });
        this.specialButtons = this.specialButtons.map((button) => {
            if (button.name === name.toUpperCase()) {
                const progressPercentage = current / limit;
                if (current / limit >= 1) {
                    button.graphic.fillCircle(button.x, button.y, this.buttonHeight * 1.25 * 0.75);
                    button.isReady = true;    
                } else {
                    button.graphic.fillCircle(button.x, button.y, this.buttonHeight * progressPercentage * 0.75);
                    button.graphic.disableInteractive();
                    button.isReady = false;    
                };
                button.current = progressPercentage * button.total;
            };
            return button;
        });
        this.draw();
    };

    public cleanUp = () => {
        this.actionButtons.forEach((button: ActionButton) => {
            button.graphic.removeListener('pointerdown');
            button.graphic.disableInteractive();
            button.graphic.removeInteractive();
            button.graphic.destroy();
            button.border.destroy();
        });
        this.specialButtons.forEach((button: ActionButton) => {
            button.graphic.removeListener('pointerdown');
            button.graphic.disableInteractive();
            button.graphic.removeInteractive();
            button.graphic.destroy();
            button.border.destroy();    
        });
        this.actionButtons = [];
        this.specialButtons = [];
        EventBus.off('reorder-buttons');
    };

    public reorder = () => {
        EventBus.emit('fetch-button-reorder');
    };

    private reorderButtons = (order: { list: string[], type: string }) => {
        const { list, type } = order;
        switch (type) {
            case 'action': {
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    button.graphic.removeAllListeners();
                    button = { ...button, name: list[index].toUpperCase() as string };
                    this.setButtonInteractive(button);
                    return button;
                });
                break;
            };
            case 'special': {
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    button.graphic.removeAllListeners();
                    button = { ...button, name: list[index].toUpperCase() as string };
                    this.setButtonInteractive(button);
                    return button;
                });
                break;
            };
            default:
                break;
        };    
    };

    private scaleButton = (button: ActionButton, scale: number, opacity: number, border: number): ActionButton => {
        if ((button.name === 'DODGE' || button.name === 'ROLL') && this.scene.player.isStalwart === true) return button;
        if (button.current / button.total >= 1) {
            button.graphic.clear();
            button.graphic.fillStyle(button.color, opacity);
            button.graphic.fillCircle(button.x, button.y, SETTINGS.BUTTON_WIDTH * scale * button.current / button.total);
            button.border.clear();
            button.border.lineStyle(SETTINGS.BORDER_LINE, border, opacity);
            button.border.strokeCircle(button.x, button.y, (SETTINGS.BUTTON_WIDTH + SETTINGS.BORDER_OFFSET) * scale * button.current / button.total);
        };
        return button;
    };

    private setButtonInteractive = (button: ActionButton): ActionButton => {
        button.graphic.setInteractive(new Phaser.Geom.Circle(button.x, button.y, button.width), Phaser.Geom.Circle.Contains)
            .on('pointerdown', (_pointer: any, _localX: any, _localY: any, _event: any) => {
                this.pressButton(button, this.scene);
            })
            .on('pointerover', (pointer: any) => {
                this.setButtonText(button, pointer);
            });
        return button;
    };

    private setButtonText = (button: ActionButton, pointer: any) => {
        if (this.scene.combat) return;
        const text = this.scene.add.text(pointer.worldX - (6 * button.name.length), pointer.worldY - 50, `${button.name.charAt(0) + button.name.slice(1).toLowerCase()} (${PLAYER.STAMINA[button.name as keyof typeof PLAYER.STAMINA]})`, {
            color: '#000',
            fontFamily: 'Cinzel',
            fontSize: '24px',
            strokeThickness: 1.5,
            wordWrap: {
                useAdvancedWrap: true
            }
        }).setDepth(10);
        this.scene.time.delayedCall(1000, () => {
            text.destroy();
        }, undefined, this);
    };
};