import { EventBus } from "../game/EventBus";

function xModifier(x: number, index: number, offset = 43.75) {
    const mod = x * 1.35 + (index * offset);
    return mod;
};

function leftXModifier(x: number, index: number, offset = 43.75) {
    const mod = x * 0.35 - (index * offset);
    return mod;
};

export default class SmallHud extends Phaser.GameObjects.Container {
    public scene: any;
    public bar: Phaser.GameObjects.Image[];
    public stances: Phaser.GameObjects.Image[];
    public x: number;
    public y: number;
    public leftX: number;
    public leftY: number;
    public controls: Phaser.GameObjects.Container
    public closed: boolean;
    public switches: {
        info: boolean;
        settings: boolean;
        logs: boolean;
        caerenic: boolean;
        stalwart: boolean;
        stealth: boolean;
        strafe: boolean;
        minimap: boolean;
        pause: boolean;
        cursor: boolean;
        closed: boolean;
        open: boolean;
    };

    constructor(scene: any) {
        const x = scene.cameras.main.width * scene.settings.positions.smallHud.x;
        const y = scene.cameras.main.height * scene.settings.positions.smallHud.y;
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.leftX = scene.cameras.main.width * scene.settings.positions.leftHud.x;
        this.leftY = scene.cameras.main.height * scene.settings.positions.leftHud.y;
        this.scene.add.existing(this);
        this.bar = [];
        this.stances = [];
        this.closed = true;
        this.switches = {
            info: false,
            settings: false,
            logs: false,
            caerenic: false,
            stalwart: false,
            stealth: false,
            strafe: false,
            minimap: false,
            pause: false,
            cursor: false,
            closed: false,
            open: false,
        };

        this.createBar();
        this.listener();
    };

    createBar = () => {
        let open = this.scene.add.image(this.x, this.y, 'open');
        let closed = this.scene.add.image(this.x, this.y, 'closed');
        let pause = this.scene.add.image(this.x, this.y, 'pause');
        let minimap = this.scene.add.image(this.x, this.y, 'minimap');
        let cursor = this.scene.add.image(this.x, this.y, 'cursor-reset');
        let stealth = this.scene.add.image(this.x, this.y, 'stealth');
        let stalwart = this.scene.add.image(this.x, this.y, 'stalwart');
        let caerenic = this.scene.add.image(this.x, this.y, 'caerenic');
        let logs = this.scene.add.image(this.x, this.y, 'logs');
        let settings = this.scene.add.image(this.x, this.y, 'settings');
        let info = this.scene.add.image(this.x, this.y, 'info');
        let strafe = this.scene.add.image(this.x, this.y, 'strafe');
        this.bar.push(info);
        this.bar.push(settings);
        this.bar.push(logs);
        this.bar.push(cursor);
        this.bar.push(minimap);
        this.bar.push(pause);
        this.bar.push(closed);
        this.bar.push(open);

        this.bar.forEach((item, index) => {
            item.setScrollFactor(0, 0);
            item.setDepth(3);
            item.setOrigin(0, 0);
            item.setInteractive();
            item.setScale(this.scene.settings.positions.smallHud.scale || 0.095);
            if (this.closed === true) {
                if (item.texture.key !== 'closed') {
                    item.setVisible(false);
                };
            };
            item.x = xModifier(this.x, Math.min(index, 9), this.scene.settings.positions.smallHud.offset || 43.75);
            item.on('pointerdown', () => {
                this.pressButton(item);
            });
        });

        this.stances.push(strafe);
        this.stances.push(caerenic);
        this.stances.push(stalwart);
        this.stances.push(stealth);

        this.stances.forEach((item, index) => {
            item.setScrollFactor(0, 0);
            item.setDepth(3);
            item.setOrigin(0, 0);
            item.setInteractive();
            item.setScale(this.scene.settings.positions.leftHud.scale || 0.095);
            item.setVisible(true);
            item.x = leftXModifier(this.leftX, Math.min(index, 4), this.scene.settings.positions.leftHud.offset || 43.75);
            item.on('pointerdown', () => {
                this.pressStance(item);
            });
        });
    };

    cleanUp = () => {
        EventBus.off('toggle-bar');
    };

    draw = () => {
        this.bar.forEach((item, index) => {
            item.x = xModifier(this.x, Math.min(index, 6), this.scene.settings.positions.smallHud.offset || 43.75);
            item.y = this.y;
            if (this.closed === true) {
                if (item.texture.key === 'closed') {
                    item.setVisible(true); // false
                } else {
                    item.setVisible(false); // true
                };
            } else {
                if (item.texture.key === 'closed') {
                    item.setVisible(false); // true
                } else {
                    item.setVisible(true); // false
                };
            };
        });

        this.stances.forEach((item, index) => {
            item.x = leftXModifier(this.leftX, Math.min(index, 4), this.scene.settings.positions.leftHud.offset || 43.75);
            item.y = this.leftY;
        });
    };

    listener = () => {
        EventBus.on('toggle-bar', (e: boolean) => {
            if (e === true) {
                this.setVisible(true);
            } else {
                this.setVisible(false);
            };
        });
        EventBus.on('update-hud-position', (data: {x: number, y: number}) => {
            const { x, y } = data;
            this.x = this.scene.cameras.main.width * x;
            this.y = this.scene.cameras.main.height * y;
            this.draw();
        });
        EventBus.on('update-left-hud-position', (data: {x: number, y: number}) => {
            const { x, y } = data;
            this.leftX = this.scene.cameras.main.width * x;
            this.leftY = this.scene.cameras.main.height * y;
            this.draw();
        });
        EventBus.on('update-small-hud-scale', (scale: number) => {
            this.bar.forEach((item) => {
                item.setScale(scale);
            });
        });
        EventBus.on('update-left-hud-scale', (scale: number) => {
            this.stances.forEach((item) => {
                item.setScale(scale);
            });
        });
        EventBus.on('update-small-hud-offset', (offset: number) => {
            this.bar.forEach((item, index) => {
                item.x = xModifier(this.x, Math.min(index, 6), offset || 43.75);

            });
        });
        EventBus.on('update-left-hud-offset', (offset: number) => {
            this.stances.forEach((item, index) => {
                item.x = leftXModifier(this.leftX, Math.min(index, 4), offset);
            });
        });
    };

    pressButton = (item: Phaser.GameObjects.Image) => {
        this.bar.forEach((button) => {
            if (button !== item) return;
            switch (button.texture.key) {
                case 'open':
                    this.closed = true;
                    EventBus.emit('closed');
                    EventBus.emit('action-button-sound');
                    this.draw();
                    break;
                case 'closed':
                    this.closed = false;
                    EventBus.emit('open');
                    EventBus.emit('action-button-sound');
                    this.draw();
                    break;
                case 'pause':
                    EventBus.emit('action-button-sound');
                    EventBus.emit('update-pause', true); // variable
                    this.setVisible(false);
                    break;
                case 'minimap':
                    EventBus.emit('action-button-sound');
                    EventBus.emit('minimap');
                    this.switches.minimap = !this.switches.minimap;
                    break;
                case 'cursor-reset':
                    EventBus.emit('action-button-sound');
                    EventBus.emit('update-cursor');
                    break; 
                case 'logs':
                    EventBus.emit('action-button-sound');
                    EventBus.emit('show-combat'); // variable
                    break;
                case 'settings':
                    EventBus.emit('action-button-sound');
                    EventBus.emit('useScroll');
                    this.setVisible(false);
                    break;
                case 'info':
                    EventBus.emit('action-button-sound');
                    EventBus.emit('show-player'); // variable
                    this.setVisible(false);
                    break;
                default:
                    break;
            };
            if (this.switches[button.texture.key as keyof typeof this.switches] === true) {
                button.setBlendMode(Phaser.BlendModes.SCREEN);
            } else {
                button.setBlendMode(Phaser.BlendModes.NORMAL);    
            };
        });
        EventBus.emit('update-small-hud');
    };

    pressStance = (stance: Phaser.GameObjects.Image) => {
        this.stances.forEach((button) => {
            if (button === stance) {
                switch (button.texture.key) { 
                    case 'stealth':
                        if (this.scene.combat === true) return;
                        this.switches.stealth = !this.switches.stealth;
                        EventBus.emit('update-stealth');
                        break;
                    case 'stalwart':
                        this.switches.stalwart = !this.switches.stalwart;
                        EventBus.emit('update-stalwart');                        
                        break;
                    case 'caerenic':
                        this.switches.caerenic = !this.switches.caerenic;
                        EventBus.emit('update-caerenic');                
                        break; 
                    case 'strafe':
                        this.switches.strafe = !this.switches.strafe;
                        this.scene.player.isStrafing = this.switches.strafe;
                        break;
                    default:
                        break;
                };
            };
            if (this.switches[button.texture.key as keyof typeof this.switches] === true) {
                button.setBlendMode(Phaser.BlendModes.ADD);
            } else {
                button.setBlendMode(Phaser.BlendModes.NORMAL);    
            };
        });
    };
};