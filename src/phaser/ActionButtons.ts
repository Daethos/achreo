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

const SETTINGS = {
    SCALE: 1,
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
        
        const radius = height / 2; // Radius of the circle || 1.75
        const startAngle = Math.PI; // Start angle (180 degrees) for the quarter circle
        const endAngle = Math.PI / 2; // End angle (90 degrees) for the quarter circle 

        ACTIONS.forEach((element, index) => {
            const angle = startAngle - (index * (startAngle - endAngle)) / (3.57); // 3.57
            const buttonX = centerActionX + radius * Math.cos(angle);
            const buttonY = centerActionY - radius * Math.sin(angle); // Negative sign for Y to start from top
            
            let button: ActionButton = {
                key: 'action',
                name: scene.settings.actions[index],
                border: new Phaser.GameObjects.Graphics(scene),
                graphic: new Phaser.GameObjects.Graphics(scene),
                color: Object.values(element)[0],
                current: 100,
                total: 100,
                x: buttonX,
                y: buttonY,
                height: this.buttonHeight,
                width: this.buttonWidth,
            };

            button.graphic.fillStyle(Object.values(element)[0], SETTINGS.OPACITY);
            button.graphic.fillCircle(buttonX, buttonY, button.width as number);
            // button.graphic.setVisible(true);
            
            button.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
            button.border.strokeCircle(buttonX, buttonY, button.width + 2 as number);
            // button.border.setVisible(true);
            this.scaleButton(button, scene.settings.positions.actionButtons.width);
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
            const angle = startAngle - (index * (startAngle - endAngle)) / (3.57);
            const buttonX = centerSpecialX + radius * 1 * Math.cos(angle);
            const buttonY = centerSpecialY - radius * 1 * Math.sin(angle); // Negative sign for Y to start from top

            let button: ActionButton = {
                key: 'special',
                name: scene.settings.specials[index],
                border: new Phaser.GameObjects.Graphics(scene),
                graphic: new Phaser.GameObjects.Graphics(scene),
                color: Object.values(element)[0],
                current: 100,
                total: 100,
                x: buttonX,
                y: buttonY,
                height: this.buttonHeight,
                width: this.buttonWidth,
            };

            button.graphic.fillStyle(Object.values(element)[0], SETTINGS.OPACITY);
            button.graphic.fillCircle(buttonX, buttonY, button.width as number);
            
            button.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
            button.border.strokeCircle(buttonX, buttonY, button.width + 2 as number);

            this.scaleButton(button, 0.75 * scene.settings.positions.specialButtons.width);
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

    private draw = (): void => {
        this.actionButtons = this.actionButtons.map((button: ActionButton) => {
            this.scaleButton(button, this.scene.settings.positions.actionButtons.width); // * this.scene.settings.positions.specialButtons.width
            this.repositionButtons({ type: 'action', x: this.scene.settings.positions.actionButtons.x, y: this.scene.settings.positions.actionButtons.y });    
            return button;    
        });
        this.specialButtons = this.specialButtons.map((button: ActionButton) => { 
            this.scaleButton(button, 0.75 * this.scene.settings.positions.specialButtons.width);
            this.repositionButtons({ type: 'special', x: this.scene.settings.positions.specialButtons.x, y: this.scene.settings.positions.specialButtons.y });    
            return button;    
        });
    };    

    private positionListen = (): void => {
        EventBus.on('reposition-buttons', this.repositionButtons);
        EventBus.on('re-width-buttons', this.rewidthButtons);
    };

    private repositionButtons = (data: {type: string, x: number, y: number}): void => {
        const { type, x, y } = data;
        const { width, height } = this.scene.cameras.main;
        const radius = height / 2; // Radius of the circle || 1.75
        const startAngle = Math.PI; // Start angle (180 degrees) for the quarter circle
        const endAngle = Math.PI / 2; // End angle (90 degrees) for the quarter circle 
        
        switch (type) {
            case 'action': {
                const centerActionX = width * x; // / 1.25
                const centerActionY = height * y; // / 1.35
                this.actionButtons = this.actionButtons.map((button: ActionButton, index: number) => {
                    const angle = startAngle - (index * (startAngle - endAngle)) / (3.57); // 3.57
                    const buttonX = centerActionX + radius * Math.cos(angle);
                    const buttonY = centerActionY - radius * Math.sin(angle); // Negative sign for Y to start from top
                    
                    button.graphic.clear();
                    // button.graphic.removeInteractive();
                    button.graphic.fillStyle(button.color, SETTINGS.OPACITY);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.actionButtons.width * button.current / button.total);
                    button.border.clear();
                    button.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
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
                    const angle = startAngle - (index * (startAngle - endAngle)) / (3.57);
                    const buttonX = centerSpecialX + radius * Math.cos(angle);
                    const buttonY = centerSpecialY - radius * Math.sin(angle); // Negative sign for Y to start from top
                    button.graphic.clear();
                    // button.graphic.removeInteractive();
                    button.graphic.fillStyle(button.color, SETTINGS.OPACITY);
                    button.graphic.fillCircle(buttonX, buttonY, SETTINGS.BUTTON_WIDTH * this.scene.settings.positions.specialButtons.width * 0.75 * button.current / button.total);
                    button.border.clear();
                    button.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
                    button.border.strokeCircle(buttonX, buttonY, (SETTINGS.BUTTON_WIDTH + 2) * this.scene.settings.positions.specialButtons.width * 0.75 * button.current / button.total);
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
                    this.scaleButton(button, rewidth);    
                    return button;
                });
                break;
            };
            case 'special': {
                this.specialButtons = this.specialButtons.map((button: ActionButton) => {
                    this.scaleButton(button, rewidth * 0.75);    
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

    private scaleButton = (button: ActionButton, scale: number): ActionButton => {
        if (button.current / button.total >= 1) {
            button.graphic.clear();
            button.graphic.fillStyle(button.color, SETTINGS.OPACITY);
            button.graphic.fillCircle(button.x, button.y, SETTINGS.BUTTON_WIDTH * scale * button.current / button.total);
            // button.graphic.removeInteractive();
            button.border.clear();
            button.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
            button.border.strokeCircle(button.x, button.y, (SETTINGS.BUTTON_WIDTH + 2) * scale * button.current / button.total);
            button.graphic.setInteractive();
            // this.setButtonInteractive(button);
        } else {
            // button.graphic.fillStyle(0xFFC700, SETTINGS.OPACITY);
            button.border.clear();
            button.graphic.clear();
            button.graphic.disableInteractive();
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


// const scaleStrafe = (button: ActionButton, scale: number): void => {
//     button.graphic.clear();
//     button.graphic.fillStyle(button.color, SETTINGS.OPACITY);
//     button.graphic.fillRoundedRect(
//         button.x, 
//         button.y, 
//         button.width * scale as number, 
//         button.height * scale as number);
//     button.border.clear();
//     button.border.lineStyle(SETTINGS.BORDER_LINE, SETTINGS.BORDER_COLOR, SETTINGS.OPACITY);
//     button.border.strokeRoundedRect(
//         button.x, 
//         button.y, 
//         button?.width * scale as number, 
//         button?.height * scale as number);
// };
