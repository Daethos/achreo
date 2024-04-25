import { Scene } from 'phaser';
import { sanitize } from '../../stores/phaser';
import NewText from '../../phaser/NewText' 
import Entity from "../../entities/Entity";
import ParticleManager from "../../phaser/ParticleManager";

export class Preloader extends Scene {
    assets: any;
    bg: Phaser.GameObjects.Graphics;
    centerX: number;
    centerY: number;
    border: Phaser.GameObjects.Graphics;
    borderBorder: Phaser.GameObjects.Graphics;
    progress: Phaser.GameObjects.Graphics;
    txt_file: NewText;
    txt_progress: NewText;
    title: NewText;
    width: number = window.innerWidth;
    height: number = window.innerHeight;

    constructor() {
        super('Preloader');
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
        this.height = 36;
        this.width = this.centerX * 1.5;
    };

    init() {};

    preload() {
        ParticleManager.preload(this);
        Entity.preload(this);
        // this.load.setPath('assets/images');
        // Treasure.preload(this);
        
        this.load.tilemapTiledJSON('ascean_test', '../assets/gui/ascean_test.json');
        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true); 
        this.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
        this.load.scenePlugin({ key: 'rexuiplugin', url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', sceneKey: 'rexUI' });
     
        this.load.audio('cymbal', '../assets/sounds/cymbal-long-2.wav');
        this.load.audio('background', '../assets/sounds/background.mp3');
        this.load.audio('combat', '../assets/sounds/combat.mp3');
        this.load.audio('death', '../assets/sounds/death-sound.mp3');
        this.load.audio('blink', '../assets/sounds/blink.wav');
        this.load.audio('caerenic', '../assets/sounds/caerenic.wav');
        this.load.audio('consume', '../assets/sounds/consume.wav');
        this.load.audio('stalwart', '../assets/sounds/stalwart.mp3');
        this.load.audio('stealth', '../assets/sounds/stealth.mp3');
        this.load.audio('prayer', '../assets/sounds/religious.mp3');
        this.load.audio('unequip', '../assets/sounds/unequip.wav');
        this.load.audio('equip', '../assets/sounds/equip.wav');
        this.load.audio('purchase', '../assets/sounds/buy_sell.wav');
        this.load.audio('treasure', '../assets/sounds/treasure.mp3');
        this.load.audio('action-button', '../assets/sounds/action-button.mp3');
        this.load.audio('spooky', '../assets/sounds/daethic-magic.mp3');
        this.load.audio('righteous', '../assets/sounds/religious.mp3');
        this.load.audio('wild', '../assets/sounds/wild-magic.mp3');
        this.load.audio('earth', '../assets/sounds/earth-magic.wav');
        this.load.audio('fire', '../assets/sounds/fire-magic.mp3');
        this.load.audio('frost', '../assets/sounds/frost-magic.mp3');
        this.load.audio('lightning', '../assets/sounds/lightning-magic.wav');
        this.load.audio('wind', '../assets/sounds/wind-magic.mp3');
        this.load.audio('sorcery', '../assets/sounds/sorcery-magic.mp3');
        this.load.audio('bow', '../assets/sounds/bow-attack.mp3');
        this.load.audio('slash', '../assets/sounds/slash-attack.mp3');
        this.load.audio('blunt', '../assets/sounds/blunt-attack.mp3');
        this.load.audio('pierce', '../assets/sounds/sword-stab.mp3');
        this.load.audio('roll', '../assets/sounds/roll-success.mp3');
        this.load.audio('parry', '../assets/sounds/counter-success.mp3');
        this.load.audio('weaponOrder', '../assets/sounds/weapon-order.mp3');
        this.load.audio('phenomena', '../assets/sounds/phenomena.mp3');
        this.load.audio('TV_Button_Press', '../assets/sounds/TV_Button_Press.wav');
        this.load.audio('combat-round', '../assets/sounds/combat-round.mp3');
        this.load.audio('alien-whoosh', '../assets/sounds/alien-whoosh.mp3');
        this.load.audio('39_Absorb_04', '../assets/sounds/39_Absorb_04.wav');
        this.load.audio('shield', '../assets/sounds/16_Atk_buff_04.wav');
        this.load.audio('freeze', '../assets/sounds/freeze.wav');
        this.load.audio('dungeon', '../assets/sounds/dungeon.mp3');
        this.load.audio('debuff', '../assets/sounds/21_Debuff_01.wav');

        this.assets = sanitize();

        this.assets.forEach((asset: { sprite: string; imgUrl: string; }) => {
            this.load.image(asset.sprite, asset.imgUrl);
        });

        this.load.image('cursor', '../assets/images/cursor.png');
        this.load.image('target', '../assets/gui/target_1.png');
        this.load.image('AncientForestMain', '../assets/gui/AncientForestMainLev.png');
        this.load.image('AncientForestDecorative', '../assets/gui/AncientForestDecorative.png');
        this.load.image('Camp_Graves', '../assets/gui/Camp_Graves.png');
        this.load.image('closed', '../assets/images/closed.png');
        this.load.image('open', '../assets/images/open.png');
        this.load.image('caerenic', '../assets/images/caerenic.png');
        this.load.image('stalwart', '../assets/images/stalwart.png');
        this.load.image('minimap', '../assets/images/minimap.png');
        this.load.image('pause', '../assets/images/pause.png');
        this.load.image('stealth', '../assets/images/stealth.png');
        this.load.image('info', '../assets/images/info.png');
        this.load.image('settings', '../assets/images/settings.png');
        this.load.image('dialog', '../assets/images/dialog.png');
        this.load.image('loot', '../assets/images/loot.png');
        this.load.image('cursor-reset', '../assets/images/cursor-reset.png');

        this.createLoadingBar();
    };

    create () {
        this.time.addEvent({
            delay: 500,
            callback: () => { 
                this.scene.start('MainMenu'); 
                this.progress.destroy();
                this.border.destroy();
                this.title.destroy();
                this.txt_progress.destroy();
                this.txt_file.destroy();
            },
            callbackScope: this
        }); 
    }; 

    createLoadingBar() {
        this.title = new NewText(
            this,
            this.centerX,
            this.centerY / 1.675,
            'Loading Game',
            'subtitle',
            0.5
        );

        this.txt_progress = new NewText(
            this,
            this.centerX,
            this.centerY / 0.8,
            'Loading...',
            'preload',
            { x: 0.5, y: 1 }
        );
        this.txt_file = new NewText(
            this,
            this.centerX,
            this.centerY / 0.6,
            '',
            'play',
            { x: 0.5, y: 1 }
        );
        let x = this.centerX - (this.width / 2);
        let y = this.centerY / 0.8;
        this.progress = this.add.graphics({ x: x, y: y });
        this.border = this.add.graphics({ x: x, y: y });
        this.borderBorder = this.add.graphics({ x: x, y: y });
        this.load.on('progress', this.onProgress, this);
        this.load.on('fileprogress', this.onFileProgress, this);
    };

    onProgress(val: number) {
        this.progress.clear();
        this.progress.fillStyle(0xFDF6D8, 1);
        this.progress.fillRect(0, 0, this.width * val, this.height);
        
        this.border.clear();
        this.border.lineStyle(4, 0x000000, 1);
        this.border.strokeRect(0, 0, this.width * val, this.height + 2);
        
        this.borderBorder.clear();
        this.borderBorder.lineStyle(4, 0xFDF6D8, 1);
        this.borderBorder.strokeRect(0, 0, this.width, this.height + 2);
        
        this.txt_progress.setText(Math.round(val * 100) + '%');
    };

    onFileProgress(file: any) {
        this.txt_file.setText(`Loading: ${file.key}`);
    }; 
};
