import Phaser from 'phaser';

export default class ScrollingCombatText extends Phaser.GameObjects.Container {
    private color: string;
    private text: Phaser.GameObjects.Text;
    private duration: number;
    private timer: Phaser.Time.TimerEvent;
    private timerTime: number;
    private context: string;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, duration: number, context: string, critical?: boolean) {
        super(scene, x, y);
        this.color = this.setColor(context);
        const clarifiedText = critical ? `${text} (Critical)` : text;
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, clarifiedText, { 
            color: this.color, 
            fontFamily: 'Cinzel', 
            fontSize: critical ? '36px' : '24px',
            stroke: 'black',
            strokeThickness: 2 
        });
        this.visible = false;
        this.add(this.text);
        this.setDepth(100);
        scene.add.existing(this);
        this.duration = duration;
        this.timerTime = 0;
        this.context = context;
        this.timer = scene.time.addEvent({
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
                return 'fuschia';
            case 'tendril':
                return 'purple';
            default:
                return 'red';
        };
    };

    public update(player: any) {
        if (!this.visible) this.setVisible(true);
        this.timerTime += 1;
        this.setPosition(player.x, player.y - 25 - this.timerTime);
    };
};