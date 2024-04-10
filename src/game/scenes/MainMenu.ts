import { GameObjects, Scene } from 'phaser'; 
import { EventBus } from '../EventBus'; 

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    text: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    centerX: number;
    centerY: number;

    constructor () {
        super('MainMenu');
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
    };

    create () {
        this.title = this.add.text(this.centerX, this.centerY / 1.5, 'The Ascean', {
                fontFamily: 'Cinzel Regular', fontSize: 76, color: '#fdf6d8',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.text = this.add.text(window.innerWidth / 2, window.innerHeight / 1.5, 'Enter Game', {
            fontFamily: 'Cinzel Regular', fontSize: 38, color: '#fdf6d8',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.text.setInteractive();
        this.text.on('pointerup', this.changeScene, this);

        EventBus.emit('current-scene-ready', this);
    };
    
    changeScene () {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        };
        this.sound.play('TV_Button_Press', { loop: false });
        this.scene.start('Game');
        EventBus.emit('start-game');
    };

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            };
        } else {
            this.logoTween = this.tweens.add({
                targets: this.title,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback) {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    };
                }
            });
        };
    };
};