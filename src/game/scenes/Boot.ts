import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor () {
        super('Boot');
    };

    preload () {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
        this.load.audio('drum_roll', '../assets/sounds/drum-roll-snare.wav');
        this.load.image('background', 'assets/images/bg.png');
    };

    create () {
        this.sound.play('drum_roll', { loop: false });
        this.scene.start('Preloader');
    };
};