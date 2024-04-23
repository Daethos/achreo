import { EventBus } from "../game/EventBus";
import { Game } from "../game/scenes/Game";

export default class SmallHud extends Phaser.GameObjects.Container {
    public scene: Game;
    public bar: Phaser.GameObjects.Image[];
    public x: number;
    public y: number;

    constructor(scene: Game) {
        const x = scene.cameras.main.width / 2;
        const y = scene.cameras.main.height / 2;
        super(scene, x, y);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);
        this.bar = [];
        this.createBar();
    };

    createBar = () => {
        let open = this.scene.add.image(440, this.y * 2, 'open');

        this.bar.push(open);
        let closed = this.scene.add.image(400, this.y * 2, 'closed');
        this.bar.push(closed);

        let pause = this.scene.add.image(360, this.y * 2, 'pause');
        this.bar.push(pause);
        
        let minimap = this.scene.add.image(320, this.y * 2, 'minimap');
        this.bar.push(minimap);
        
        let cursor = this.scene.add.image(280, this.y * 2, 'cursor-reset');
        this.bar.push(cursor);
        
        let stealth = this.scene.add.image(240, this.y * 2, 'stealth');
        this.bar.push(stealth);
        
        let stalwart = this.scene.add.image(200, this.y * 2, 'stalwart');
        this.bar.push(stalwart);
        
        let caerenic = this.scene.add.image(160, this.y * 2, 'caerenic');
        this.bar.push(caerenic);
        
        let settings = this.scene.add.image(120, this.y * 2, 'settings');
        this.bar.push(settings);

        let info = this.scene.add.image(80, this.y * 2, 'info');
        this.bar.push(info);

        let dialog = this.scene.add.image(40, this.y * 2, 'dialog');
        this.bar.push(dialog);

        let loot = this.scene.add.image(0, this.y * 2, 'loot');
        this.bar.push(loot);    


        this.bar.forEach((item, index) => {
            item.setScrollFactor(0);
            item.setDepth(1);
            item.setOrigin(0, 0);
            item.setInteractive();
            item.setScale(0.1);
            item.on('pointerdown', () => {
                console.log(`Button ${index}, ${item.texture.key} clicked`, item);
                // Need to invert the colors of the button clicked
                // Need to emit an event to the game scene
                this.pressButton(item);
            });
        });

        EventBus.on('game-dialog-tag', (tag: boolean) => {
            dialog.setVisible(tag);
        });
        EventBus.on('game-loot-tag', (tag: boolean) => {
            loot.setVisible(tag);
        });
    };

    pressButton = (item: Phaser.GameObjects.Image) => {
        this.bar.forEach((button) => {
            if (button === item) {
                button.setTint(0xffc700);
                button.setBlendMode(Phaser.BlendModes.ADD);
                switch (button.texture.key) {
                    case 'open':
                        EventBus.emit('open');
                        break;
                    case 'closed':
                        EventBus.emit('closed');
                        break;
                    case 'pause':
                        EventBus.emit('update-pause'); // variable
                        break;
                    case 'minimap':
                        EventBus.emit('minimap');
                        break;
                    case 'cursor':
                        EventBus.emit('action-button-sound');
                        EventBus.emit('update-cursor');
                        break;
                    case 'stealth':
                        if (this.scene.combat === true) return;
                        EventBus.emit('update-stealth');
                        break;
                    case 'stalwart':
                        EventBus.emit('update-stalwart');
                        break;
                    case 'caerenic':
                        EventBus.emit('update-caerenic');
                        break;
                    case 'settings':
                        EventBus.emit('scroll-enabled');
                        break;
                    case 'info':
                        EventBus.emit('action-button-sound');
                        EventBus.emit('show-player'); // variable
                        break;
                    case 'dialog':
                        EventBus.emit('action-button-sound');
                        EventBus.emit('show-dialogue');
                        break;
                    case 'loot':
                        EventBus.emit('action-button-sound');
                        EventBus.emit('blend-game', { showLoot: true }); //  { showLoot: !game().showLoot }
                        break;
                    default:
                        break;
                
                };
                // button.setTint(0x000000);
            } else {
                button.setTint(0xffffff);
                button.setBlendMode(Phaser.BlendModes.NORMAL);    
            };
        });
    };
};