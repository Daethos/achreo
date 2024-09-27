import { GameObjects, Scene } from 'phaser'; 
import { EventBus } from '../EventBus'; 
import NewText from '../phaser/NewText';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: NewText;
    text: GameObjects.Text;
    centerX: number;
    centerY: number;
    // txt_version: NewText;

    constructor () {
        super('MainMenu');
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
    };

    create () {
        const masteries = ['#fdf6d8', 'red', 'green', 'blue', 'purple', 'gold'];
        const index = Math.round(Math.random() * masteries.length);
        const shadow = masteries[index];
        this.title = new NewText(
            this,
            this.centerX,
            this.centerY * 0.7,
            'The Ascean',
            'title',
            0.5,
            shadow
        );
        this.text = this.add.text(
            this.centerX, 
            this.centerY * 1.25, 
            'Enter Game', 
        {
            fontFamily: 'Cinzel Regular', 
            fontSize: 24, 
            color: '#fdf6d8',
            stroke: '#000000', 
            strokeThickness: 8,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: shadow,
                blur: 5,
                stroke: true,
                fill: true
            },
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.text.setInteractive();
        this.text.on('pointerup', this.mainMenu, this);
        // this.txt_version = new NewText( this, 30, 15, 'The Ascean v0.0.1', 'super', { x: 0.5, y: 1 }, false);
        EventBus.emit('current-scene-ready', this);
        EventBus.on('enter-menu', this.changeScene, this);
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
        // this.txt_version.destroy();
        EventBus.emit('enter-menu');
    };
};