import { GameObjects, Scene } from 'phaser'; 
import { EventBus } from '../EventBus'; 
import NewText from '../../phaser/NewText';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: NewText;
    text: GameObjects.Text;
    centerX: number;
    centerY: number;
    fullscreen: boolean;

    constructor () {
        super('MainMenu');
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
        this.fullscreen = false;    
    };

    create () {
        this.title = new NewText(
            this,
            this.centerX,
            this.centerY / 1.5,
            'The Ascean',
            'title',
            0.5
        );
        this.text = this.add.text(
            window.innerWidth / 2, 
            window.innerHeight / 1.5, 
            'Enter Game', 
        {
            fontFamily: 'Cinzel Regular', 
            fontSize: 24, 
            color: '#fdf6d8',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.text.setInteractive();
        this.text.on('pointerup', this.mainMenu, this);

        EventBus.emit('current-scene-ready', this);
        EventBus.on('enter-menu', this.changeScene, this);
        EventBus.on('full-screen', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                this.fullscreen = false;
            } else {
                this.scale.startFullscreen();
                this.fullscreen = true;
            };
        });
    };
    
    changeScene () {
        this.sound.play('TV_Button_Press', { loop: false });
        this.scene.start('Game');
        EventBus.emit('loading-ascean');
    };

    mainMenu() {
        this.sound.play('TV_Button_Press', { loop: false });
        this.title.obj.destroy();
        this.title.destroy();
        this.text.destroy();
        // EventBus.emit('enter-menu');
        EventBus.emit('enter-menu');

        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
            this.fullscreen = false;
        } else {
            this.scale.startFullscreen();
            this.fullscreen = true;
        };
    };
};