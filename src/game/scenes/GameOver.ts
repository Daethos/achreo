import { EventBus } from '../EventBus';
import { Scene } from 'phaser'; 
export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;
    constructor () {super('GameOver');};
    create () {};
    changeScene () {
        this.scene.start('MainMenu');
        EventBus.emit('main-menu', this);
    };
};