export default class ScrollingCombatText extends Phaser.GameObjects.Container {
    private color: string;
    private text: Phaser.GameObjects.Text;
    private duration: number;
    private timerTime: number;
    private constant: boolean;
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, duration: number, context: string, critical: boolean = false, constant: boolean = false) {
        super(scene, x, y);
        this.color = this.setColor(context);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, { 
            color: this.color, 
            fontFamily: 'Cinzel', 
            fontSize: critical ? '36px' : '24px',
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
        scene.time.addEvent({
            delay: this.duration,
            callback: () => {
                this.destroy();
            },
            loop: false,
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
            this.setPosition(player.x, player.y - 25);
         } else { 
            this.setPosition(player.x, player.y - 25 - this.timerTime);
        }; 
    };
};