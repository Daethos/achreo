export default class ScrollingCombatText extends Phaser.GameObjects.Container {
    private color: string;
    private text: Phaser.GameObjects.Text;
    private duration: number;
    private timerTime: number;
    private constant: boolean;
    onDestroyCallback: () => void // Receive callback to inform the player
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, duration: number, context: string, critical: boolean = false, constant: boolean = false, onDestroyCallback: () => void) {
        super(scene, x, y);
        this.color = this.setColor(context);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, { 
            color: this.color, 
            fontFamily: 'Cinzel', 
            fontSize: critical ? '32px' : '20px',
            stroke: 'black',
            strokeThickness: 2 
        });
        this.visible = true;
        this.add(this.text);
        this.setDepth(100);
        scene.add.existing(this);
        this.duration = duration;
        this.constant = constant;
        this.timerTime = 0;
        this.onDestroyCallback = onDestroyCallback; // Assign the callback

        scene.tweens.add({
            targets: this.text,
            duration: this.duration,
            ease: critical ? Phaser.Math.Easing.Elastic.Out : Phaser.Math.Easing.Sine.Out,
            alpha: {from:0.65,to:1},
            scale: {from:0.65,to:1},
            onComplete: () => {  
                this.onDestroyCallback(); // Trigger callback to notify player it's destroyed
                this.text.destroy();
                this.destroy();
            },
            callbackScope: this
        });
    };
    private setColor = (context: string) => {
        switch (context) {
            case 'bone':
                return '#fdf6d8';
            case 'cast':
                return 'blue';
            case 'damage':
                return 'red';
            case 'effect':
                return 'gold';
            case 'heal':
                return 'green';
            case 'hush':
                return 'fuchsia';
            case 'tendril':
                return 'purple';
            default:
                return 'red';
        };
    };
    public update(player: any) {
        this.timerTime += 1;
        if (this.constant === true) { 
            this.setPosition(player.x - (this.text.width * this.text.scale / 2), player.y - 70);
         } else { 
            this.setPosition(player.x - (this.text.width * this.text.scale / 2), player.y - 50 - this.timerTime);
        }; 
    };
};