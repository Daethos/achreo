import { EventBus } from '../EventBus';
import { Scene } from 'phaser'; 

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;

    constructor () {
        super('GameOver');
    };

    create () {
        this.camera = this.cameras.main
        // this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
        // this.background.setAlpha(0.5);

        this.gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 1.5, 'Game Over', {
            fontFamily: 'Cinzel Regular', fontSize: 64, color: '#fdf6d8',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.gameOverText.setInteractive();
        this.gameOverText.on('pointerup', this.changeScene, this);
        
        EventBus.emit('current-scene-ready', this);
    };

    changeScene () {
        this.scene.start('MainMenu');
        EventBus.emit('main-menu', this);
    };
};