import Phaser from 'phaser';
import { Game } from '../game/scenes/Game';
import { EventBus } from '../game/EventBus';
import { staminaCheck } from '../utility/player';

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
    // { CONSUME: 0x000000 }
];
// { STEALTH: 0x000000 },

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
    BORDER_LINE: 3,
    STRAFE_X_OFFSET: 1.7,
    STRAFE_Y_OFFSET: 3,
    STRAFE_X_SCALE: 2.75,
    STRAFE_Y_SCALE: 1.5,
};

type ActionButton = {
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
    on?: (event: string, fn: () => void, context?: any) => void;
};

export default class ActionButtons extends Phaser.GameObjects.Container {
    public scene: Game;
    private actionButtons: ActionButton[];
    private specialButtons: ActionButton[];
    private buttonWidth: number;
    private buttonHeight: number;
    // private strafeLeft: ActionButton;
    // private strafeRight: ActionButton;

    constructor(scene: Game) {
        super(scene);
        this.scene = scene;
        this.actionButtons = [];
        this.specialButtons = [];
        this.buttonWidth = SETTINGS.BUTTON_HEIGHT;
        this.buttonHeight = SETTINGS.BUTTON_HEIGHT;
        this.addButtons(scene);
        scene.add.existing(this);
        const { width, height } = scene.cameras.main;
        this.setPosition(width / 5, height / 5); // 2.75, 1.5
        this.setDepth(3);
        this.setScrollFactor(0);
        this.setVisible(true); // false
        EventBus.on('reorder-buttons', this.reorderButtons);
        this.reorder();
        this.positionListen();
    };

    private addButtons = (scene: Game): void => {
        const { width, height } = scene.cameras.main;
        const centerActionX = width * scene.settings.positions.actionButtons.x; // / 1.25
        const centerActionY = height * scene.settings.positions.actionButtons.y; // / 1.35
        const centerSpecialX = width * scene.settings.positions.specialButtons.x; // width * 0.725 || / 1.375
        const centerSpecialY = height * scene.settings.positions.specialButtons.y; // height * 0.6 || / 1.675
        
        ACTIONS.forEach((element, index) => {
            const { buttonX, buttonY } = this.displayButton(
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
            };

            button.graphic.fillStyle(scene.settings.positions.actionButtons.color, scene.settings.positions.actionButtons.opacity);
            button.graphic.fillCircle(buttonX, buttonY, button.width as number);
            // button.graphic.setVisible(true);
            
            button.border.lineStyle(SETTINGS.BORDER_LINE, scene.settings.positions.actionButtons.border, scene.settings.positions.actionButtons.opacity);
            button.border.strokeCircle(buttonX, buttonY, button.width + 2 as number);
            // button.border.setVisible(true);
            this.scaleButton(button, scene.settings.positions.actionButtons.width, scene.settings.positions.actionButtons.opacity, scene.settings.positions.actionButtons.border);
            button.graphic.setInteractive(new Phaser.Geom.Circle(
                buttonX, buttonY, 
                button.width), 
                Phaser.Geom.Circle.Contains)
                    .on('pointerdown', (_pointer: any, _localX: any, _localY: any, _event: any) => {
                        this.pressButton(button, scene);
                    }); 

            button.graphic.setScrollFactor(0);
            button.border.setScrollFactor(0);
            button.graphic.setDepth(3);

            this.actionButtons.push(button);
            this.add(button.border);
            this.add(button.graphic);
        });

        SPECIALS.forEach((element, index) => {
            const { buttonX, buttonY } = this.displayButton(
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
            };

            button.graphic.fillStyle(scene.settings.positions.specialButtons.color, scene.settings.positions.specialButtons.opacity);
            button.graphic.fillCircle(buttonX, buttonY, button.width as number);
            
            button.border.lineStyle(SETTINGS.BORDER_LINE, scene.settings.positions.specialButtons.border, scene.settings.positions.specialButtons.opacity);
            button.border.strokeCircle(buttonX, buttonY, button.width + 2 as number);

            this.scaleButton(button, 0.75 * scene.settings.positions.specialButtons.width, scene.settings.positions.specialButtons.opacity, scene.settings.positions.specialButtons.border);
            button.graphic.setInteractive(new Phaser.Geom.Circle(
                buttonX, buttonY, 
                button.width), 
                Phaser.Geom.Circle.Contains)
                    .on('pointerdown', (_pointer: any, _localX: any, _localY: any, _event: any) => {
                        this.pressButton(button, scene);
                    }); 
            
            button.graphic.setScrollFactor(0);
            button.border.setScrollFactor(0);
            button.graphic.setDepth(3);

            this.specialButtons.push(button);
            this.add(button.border);
            this.add(button.graphic);
        });


        // let strafeLeft: ActionButton = {
        //     key: 'strafe',
        //     name: 'STRAFELEFT',
        //     border: new Phaser.GameObjects.Graphics(scene),
        //     graphic: new Phaser.GameObjects.Graphics(scene),
        //     color: 0xFFD700,
        //     current: 100,
        //     total: 100,
        //     x: -(this.centerX / SETTINGS.STRAFE_X_OFFSET),
        //     y: this.centerY - (this.buttonHeight * SETTINGS.STRAFE_Y_OFFSET),
        //     width: this.buttonWidth * SETTINGS.STRAFE_X_SCALE,
        //     height: this.buttonHeight * SETTINGS.STRAFE_Y_SCALE,
        //     circle: this.buttonWidth,
        // };

        // strafeLeft.graphic.fillStyle(strafeLeft.color, SETTINGS.OPACITY);
        // // strafeLeft.graphic.fillCircle(strafeLeft.x, strafeLeft.y, strafeLeft.circle);
        // strafeLeft.graphic.fillRoundedRect(
        //     strafeLeft.x, 
        //     strafeLeft.y, 
        //     strafeLeft.width, 
        //     strafeLeft.height);
        // // strafeLeft.graphic.setVisible(true);
        
        // strafeLeft.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
        // // strafeLeft.border.strokeCircle(strafeLeft.x, strafeLeft.y, strafeLeft.circle + 2);
        // strafeLeft.border.strokeRoundedRect(
        //     strafeLeft.x, 
        //     strafeLeft.y, 
        //     strafeLeft.width, 
        //     strafeLeft.height);
        
        // strafeLeft.graphic.setInteractive(new Phaser.Geom.Rectangle(
        //     strafeLeft.x, 
        //     strafeLeft.y, 
        //     strafeLeft.width, 
        //     strafeLeft.height), Phaser.Geom.Rectangle.Contains)
        // // strafeLeft.graphic.setInteractive(new Phaser.Geom.Circle(strafeLeft.x, strafeLeft.y, strafeLeft.circle), Phaser.Geom.Circle.Contains)
        //         .on('pointerdown', function(_pointer: any, _localX: any, _localY: any, _event: any) {
        //             console.log('Strafing Left - Pointer Down');
        //             scene.player.strafingLeft = true;
        //             scaleStrafe(strafeLeft, 1.1);
        //         })
        //         // .on('pointerover', function(_pointer: any, _localX: any, _localY: any, _event: any) {
        //         //     console.log('Strafing Left - Pointer Over');
        //         //     scene.player.strafingLeft = true;
        //         //     scaleStrafe(strafeLeft, 1.1);
        //         // })
        //         .on('pointerdown', function(_pointer: any, _localX: any, _localY: any, _event: any) {
        //             console.log('Strafing Left - Pointer Up');
        //             scene.player.strafingLeft = false;
        //             scaleStrafe(strafeLeft, 1);
        //         });

        // strafeLeft.graphic.setScrollFactor(0);
        // strafeLeft.border.setScrollFactor(0);
        // this.add(strafeLeft.graphic);
        // this.add(strafeLeft.border);
        // this.strafeLeft = strafeLeft;

        // let strafeRight: ActionButton = {
        //     key: 'strafe',
        //     name: 'STRAFERIGHT',
        //     border: new Phaser.GameObjects.Graphics(scene),
        //     graphic: new Phaser.GameObjects.Graphics(scene),
        //     color: 0xFFD700,
        //     current: 100,
        //     total: 100,
        //     x: (this.centerX * SETTINGS.STRAFE_X_OFFSET) - (this.buttonWidth),
        //     y: this.centerY - (this.buttonHeight * SETTINGS.STRAFE_Y_OFFSET),
        //     width: this.buttonWidth * SETTINGS.STRAFE_X_SCALE,
        //     height: this.buttonHeight * SETTINGS.STRAFE_Y_SCALE,
        //     circle: this.buttonWidth,
        // };

        // strafeRight.graphic.fillStyle(strafeRight.color, SETTINGS.OPACITY);
        // // strafeRight.graphic.fillCircle(strafeRight.x, strafeRight.y, strafeRight.circle);
        // strafeRight.graphic.fillRoundedRect(
        //     strafeRight.x, 
        //     strafeRight.y, 
        //     strafeRight.width as number,
        //     strafeRight.height as number);
        // // strafeRight.graphic.setVisible(true);

        // strafeRight.border.lineStyle(3, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
        // // strafeRight.border.strokeCircle(strafeRight.x, strafeRight.y, strafeRight.circle + 2);
        // strafeRight.border.strokeRoundedRect(
        //     strafeRight.x, 
        //     strafeRight.y, 
        //     strafeRight.width as number, 
        //     strafeRight.height as number);

        // strafeRight.graphic.setInteractive(new Phaser.Geom.Rectangle(
        //     strafeRight.x, 
        //     strafeRight.y, 
        //     strafeRight.width, 
        //     strafeRight.height), Phaser.Geom.Rectangle.Contains)
        // // strafeRight.graphic.setInteractive(new Phaser.Geom.Circle(strafeRight.x, strafeRight.y, strafeRight.circle), Phaser.Geom.Circle.Contains)
        //         .on('pointerdown', function(_pointer: any, _localX: any, _localY: any, _event: any) {
        //             console.log('Strafing Right - Pointer Down');
        //             scene.player.strafingRight = true;
        //             scaleStrafe(strafeRight, 1.1);    
        //         })
        //         // .on('pointerover', function(_pointer: any, _localX: any, _localY: any, _event: any) {
        //         //     console.log('Strafing Right - Pointer Over');
        //         //     scene.player.strafingRight = true;
        //         //     scaleStrafe(strafeRight, 1.1);    
        //         // })
        //         .on('pointerdown', function(_pointer: any, _localX: any, _localY: any, _event: any) {
        //             console.log('Strafing Right - Pointer Up');
        //             scene.player.strafingRight = false;
        //             scaleStrafe(strafeRight, 1);    
        //         });

        // strafeRight.graphic.setScrollFactor(0);
        // strafeRight.border.setScrollFactor(0);
        // this.add(strafeRight.graphic);
        // this.add(strafeRight.border);
        // this.strafeRight = strafeRight;
    };

    private displayButton = (display: string, spacing: number, index: number, x: number, y: number, height: number) => {
        const radius = height / 2; // Radius of the circle || 1.75
        const startAngle = Math.PI; // Start angle (180 degrees) for the quarter circle
        const endAngle = Math.PI / 2; // End angle (90 degrees) for the quarter circle 
        let angle = 0, buttonX = 0, buttonY = 0; 
        // * Math.sqrt(2)
        switch (display) {
            case DISPLAY.ARC: 
                angle = startAngle - (index * (startAngle - endAngle)) / (3.57); // 3.57
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
                angle = startAngle - (index * (startAngle - endAngle)) / (3.57); // 3.57
                buttonX = x + radius * Math.cos(angle);
                buttonY = y - radius * Math.sin(angle); // Negative sign for Y to start from top
                break;
        };
        // console.log('----- NEW BUTTON X / Y -----' ,buttonX, buttonY, '----- NEW BUTTON X /Y -----')
        return { buttonX, buttonY };
    };

    private draw = (): void => {
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
                    const { buttonX, buttonY } = this.displayButton(display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(display, this.scene.settings.positions.specialButtons.spacing,index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.actionButtons.display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.specialButtons.display, this.scene.settings.positions.specialButtons.spacing, index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.actionButtons.display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.specialButtons.display, this.scene.settings.positions.specialButtons.spacing, index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.actionButtons.display, this.scene.settings.positions.actionButtons.spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.specialButtons.display, this.scene.settings.positions.specialButtons.spacing, index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.actionButtons.display, spacing, index, centerActionX, centerActionY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
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
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.specialButtons.display, spacing,index, centerSpecialX, centerSpecialY, height);
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
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
        // const radius = height / 2; // Radius of the circle || 1.75
        // const startAngle = Math.PI; // Start angle (180 degrees) for the quarter circle
        // const endAngle = Math.PI / 2; // End angle (90 degrees) for the quarter circle 
        
        switch (type) {
            case 'action': {
                const centerActionX = width * x; // / 1.25
                const centerActionY = height * y; // / 1.35
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    // const angle = startAngle - (index * (startAngle - endAngle)) / (3.57); // 3.57
                    // const buttonX = centerActionX + radius * Math.cos(angle);
                    // const buttonY = centerActionY - radius * Math.sin(angle); // Negative sign for Y to start from top
                    button.graphic.clear();
                    button.border.clear();
                    
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.actionButtons.display, 
                        this.scene.settings.positions.actionButtons.spacing,
                        index, centerActionX, centerActionY, height);
                    // button.graphic.removeInteractive();
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.actionButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.actionButtons.border, this.scene.settings.positions.actionButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    // this.setButtonInteractive(button);
                    return button;
                });
                break;
            };
            case 'special': {
                const centerSpecialX = width * x; // width * 0.725 || / 1.375
                const centerSpecialY = height * y; // height * 0.6 || / 1.675
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    // const angle = startAngle - (index * (startAngle - endAngle)) / (3.57);
                    // const buttonX = centerSpecialX + radius * Math.cos(angle);
                    // const buttonY = centerSpecialY - radius * Math.sin(angle); // Negative sign for Y to start from top
                    button.graphic.clear();
                    button.border.clear();
                    const { buttonX, buttonY } = this.displayButton(this.scene.settings.positions.specialButtons.display, 
                        this.scene.settings.positions.specialButtons.spacing,
                        index, centerSpecialX, centerSpecialY, height);
                    
                    
                    // button.graphic.removeInteractive();
                    button.graphic.fillStyle(button.color, this.scene.settings.positions.specialButtons.opacity);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.border.lineStyle(SETTINGS.BORDER_LINE, this.scene.settings.positions.specialButtons.border, this.scene.settings.positions.specialButtons.opacity);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.specialButtons.width * SETTINGS.SCALE_SPECIAL * button.current / button.total);
                    button.x = buttonX;
                    button.y = buttonY;
                    button.graphic.input?.hitArea.setPosition(buttonX, buttonY);
                    // this.setButtonInteractive(button);
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

    private pressButton = (button: ActionButton, scene: any): void => {
        if (this.scene.scene.isActive('Game') === false) {
            console.log('Game Scene is not active');
            return;
        };
        const input = button.name.toLowerCase();
        const check = staminaCheck(input, scene.player.stamina);
        if (check.success === true && scene.player.stateMachine.isState(input)) {
            scene.player.stateMachine.setState(`${input}`);
        } else if (check.success === true && scene.player.metaMachine.isState(input)) {
            scene.player.metaMachine.setState(`${input}`);
        };
    };

    public setCurrent = (current: number, limit: number, name: string) => {
        this.actionButtons = this.actionButtons.map((button) => {
            if (button.name === name.toUpperCase()) {
                const progressPercentage = current / limit;
                if (current / limit >= 1) {
                    button.graphic.fillCircle(button.x, button.y, this.buttonHeight * 1.25);
                } else {
                    button.graphic.fillCircle(button.x, button.y, this.buttonHeight * progressPercentage);
                    button.graphic.disableInteractive();
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
                } else {
                    button.graphic.fillCircle(button.x, button.y, this.buttonHeight * progressPercentage * 0.75);
                    button.graphic.disableInteractive();
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
                    // button.graphic.removeInteractive();
                    button.graphic.removeAllListeners();
                    button = { ...button, name: list[index].toUpperCase() as string };
                    this.setButtonInteractive(button);
                    return button;
                });
                break;
            };
            case 'special': {
                this.specialButtons = this.specialButtons.map((button: ActionButton, index: number) => {
                    // button.graphic.removeInteractive();
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
        if (button.current / button.total >= 1) {
            button.graphic.clear();
            button.graphic.fillStyle(button.color, opacity);
            button.graphic.fillCircle(button.x, button.y, SETTINGS.BUTTON_WIDTH * scale * button.current / button.total);
            // button.graphic.removeInteractive();
            button.border.clear();
            button.border.lineStyle(SETTINGS.BORDER_LINE, border, opacity);
            button.border.strokeCircle(button.x, button.y, (SETTINGS.BUTTON_WIDTH + 2) * scale * button.current / button.total);
            button.graphic.setInteractive();
            // this.setButtonInteractive(button);
        } else {
            // button.graphic.fillStyle(0xFFC700, opacity);
            button.border.clear();
            button.graphic.clear();
            // button.graphic.disableInteractive();
        };
        return button;
    };

    private setButtonInteractive = (button: ActionButton): ActionButton => {
        button.graphic.setInteractive(new Phaser.Geom.Circle(button.x, button.y, button.width), Phaser.Geom.Circle.Contains)
            .on('pointerdown', (_pointer: any, _localX: any, _localY: any, _event: any) => {
                this.pressButton(button, this.scene);
            });
        return button;
    };
};


// const scaleStrafe = (button: ActionButton, scale: number, opacity: number): void => {
//     button.graphic.clear();
//     button.graphic.fillStyle(button.color, opacity);
//     button.graphic.fillRoundedRect(
//         button.x, 
//         button.y, 
//         button.width * scale as number, 
//         button.height * scale as number);
//     button.border.clear();
//     button.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, opacity);
//     button.border.strokeRoundedRect(
//         button.x, 
//         button.y, 
//         button?.width * scale as number, 
//         button?.height * scale as number);
// };
