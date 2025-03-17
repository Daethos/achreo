import { EventBus } from '../EventBus'; 
import NewText from '../phaser/NewText';
const mastery = { constitution: '#fdf6d8', strength: 'red', agility: 'green', achre: 'blue', caeren: 'purple', kyosir: 'gold' };
const masteries = ['#fdf6d8', 'red', 'green', 'blue', 'purple', 'gold'];
export class MainMenu extends Phaser.Scene {
    background: Phaser.GameObjects.Image;
    logo: Phaser.GameObjects.Image;
    title: NewText;
    text: Phaser.GameObjects.Text;
    tween: Phaser.Tweens.TweenChain;
    centerX: number;
    centerY: number;

    constructor () {
        super('MainMenu');
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
    };

    create () {
        const index = Math.round(Math.random() * masteries.length);
        const ascean = this.registry.get("ascean")?.mastery || index;
        const shadow = mastery[ascean as keyof typeof mastery];
        this.title = new NewText(
            this,
            this.centerX,
            this.centerY * 0.7,
            'The Ascean',
            window.innerWidth > 1200 ? 'supertitle' : 'title',
            0.5,
            shadow
        );
        this.text = this.add.text(
            this.centerX, 
            this.centerY * 1.25, 
            'Enter Game', 
        {
            fontFamily: 'Cinzel-Regular', 
            fontSize: window.innerWidth > 1200 ? 72 : 36,
            fontStyle: "small-caps",
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
        this.tween = this.tweens.chain({
            targets: [this.text],
            tweens: [
                {
                    alpha: 1,
                    duration: 500,
                    completeDelay: 500
                },
                {
                    alpha: 0,
                    duration: 500,
                },
            ],
            repeat: -1,
            callbackScope: this
        });
        EventBus.emit('current-scene-ready', this);
        EventBus.once('enter-menu', this.changeScene, this);
    };
    
    changeScene () {
        this.sound.play('TV_Button_Press', { loop: false });
        this.scene.start('Hud');
        EventBus.emit('loading-ascean');
    };

    mainMenu() {
        this.sound.play('TV_Button_Press', { loop: false });
        this.title.obj.destroy();
        this.title.destroy();
        this.tween.destroy();
        this.text.destroy();
        EventBus.emit('enter-menu');
    };
};