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

    constructor () {
        super('Preloader');
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
    };

    init () {
        // //  We loaded this image in our Boot Scene, so we can display it here
        // this.add.image(window.innerWidth / 2, window.innerHeight / 1.5, 'background');

        // //  A simple progress bar. This is the outline of the bar.
        // this.add.rectangle(window.innerWidth / 2, window.innerHeight / 1.5, window.innerHeight / 1.5, 32).setStrokeStyle(1, 0xffffff);

        // //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        // const bar = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 1.5, 4, 28, 0xffffff);

        // //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        // this.load.on('progress', (progress: number) => {

        //     //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
        //     bar.width = 4 + (460 * progress);

        // });
        this.title = new NewText(
            this,
            this.centerX,
            this.centerY / 2,
            'Loading Game',
            'preload',
            0.5
        );

        this.txt_progress = new NewText(
            this,
            this.centerX,
            this.centerY - 5,
            'Loading...',
            'preload',
            { x: 0.5, y: 1 }
        );
        this.txt_file = new NewText(
            this,
            this.centerX,
            this.centerY / 0.67,
            '',
            'play',
            { x: 0.5, y: 1 }
        );
        let x = this.centerX - (this.width / 2);
        let y = this.centerY / 0.9;
        this.progress = this.add.graphics({ x: x, y: y });
        this.border = this.add.graphics({ x: x, y: y });
        this.borderBorder = this.add.graphics({ x: x, y: y });
        this.load.on('progress', this.onProgress, this);
        this.load.on('fileprogress', this.onFileProgress, this);
    };

    preload () {
        // this.load.setPath('assets/images');
        // this.load.image('logo', 'logo.png');
        // this.load.image('star', 'star.png');
        this.bg = this.add.graphics({ x: 0, y: 0 });
        this.bg.fillStyle(0x000000, 1);
        this.bg.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ParticleManager.preload(this);
        Entity.preload(this);
        // Treasure.preload(this);
        
        this.load.tilemapTiledJSON('ascean_test', '../assets/gui/ascean_test.json');
        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true); 
        this.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
        this.load.scenePlugin({ key: 'rexuiplugin', url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', sceneKey: 'rexUI' });

        this.load.audio('background', '../assets/sounds/background.mp3');
        this.load.audio('caerenic', '../assets/sounds/caerenic.wav');
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
        this.load.audio('counter', '../assets/sounds/counter-success.mp3');
        this.load.audio('weaponOrder', '../assets/sounds/weapon-order.mp3');
        this.load.audio('phenomena', '../assets/sounds/phenomena.mp3');
        
        this.assets = sanitize();

        this.assets.forEach((asset: { sprite: string; imgUrl: string; }) => {
            this.load.image(asset.sprite, asset.imgUrl);
        });

        this.load.image('cursor', '../assets/images/cursor.png');
        this.load.image('target', '../assets/gui/target_1.png');
        this.load.image('AncientForestMain', '../assets/gui/AncientForestMainLev.png');
        this.load.image('AncientForestDecorative', '../assets/gui/AncientForestDecorative.png');
        this.load.image('Camp_Graves', '../assets/gui/Camp_Graves.png');

        // this.createLoadingBar();
    };

    create () {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        // this.scene.start('MainMenu');
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
