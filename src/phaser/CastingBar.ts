import Phaser from 'phaser';
import { useResizeListener } from '../utility/dimensions';

const dimensions = useResizeListener();

export default class CastingBar extends Phaser.GameObjects.Container {
    // private scene: Phaser.Scene;
    private bar: Phaser.GameObjects.Graphics;
    private barWidth: number;
    private barHeight: number;
    private border: Phaser.GameObjects.Graphics;
    private borderColor: number;
    private entity: Phaser.GameObjects.GameObject;
    private fillColor: number;
    private time: number;
    private total: number;
    // private timeText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, time: number, entity:Phaser.GameObjects.GameObject) {
        super(scene, x, y);
        // this.scene = scene;
        this.entity = entity;
        this.total = time;
        this.time = 0;

        // 50 = 'world', 200 = 'ui'
        this.barWidth = 200;
        
        // 6 = 'world', 24 = 'ui'
        this.barHeight = 24;
        this.borderColor = 0x000000;
        this.fillColor = 0x0000FF;
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.bar.fillStyle(this.fillColor);
        this.bar.fillRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth, this.barHeight);
        this.add(this.bar);

        this.border = new Phaser.GameObjects.Graphics(scene);
        this.border.lineStyle(4, this.borderColor);
        this.border.strokeRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth, this.barHeight);
        this.add(this.border);

        // this.timeText = new Phaser.GameObjects.Text(this.scene, -this.barWidth / 4, -this.barHeight / 4, `${Math.round(this.time)} / ${this.total}`, { 
        //     color: '#fdf6d8', fontSize: '1.5em', stroke: '#000', strokeThickness: 2, align: 'center' 
        // });
        // this.add(this.timeText);
        // this.timeText.setOrigin(0.5);
        // this.timeText.setDepth(10);
        // this.timeText.setScrollFactor(0);

        scene.add.existing(this);
        this.setDepth(5);
        this.setScrollFactor(0);
        this.visible = false;
    };

    private draw = (): void => {
        this.border.clear();
        this.border.lineStyle(4, this.borderColor);
        this.border.strokeRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth - 2, this.barHeight - 2);

        this.bar.clear();
        this.bar.fillStyle(this.fillColor);
        this.bar.fillRect(-this.barWidth / 2, -this.barHeight / 2, (this.time / this.total) * this.barWidth, this.barHeight);
    
        // this.timeText.setText(`${Math.round(this.time)} / ${this.total}`);
    };

    public getTotal = (): number => this.total;

    public reset = (): void => {
        this.time = 0;
        this.total = 0;
        this.setVisible(false);
        this.border.clear();
        this.bar.clear();
        // this.timeText.setText('');
    };
    
    public setTime = (time: number): void => {
        this.time = time > this.total ? this.total : time;
        this.draw();
    };
    
    public setTotal = (total: number): void => {
        this.total = total;
        this.draw();
    };

    public update = (dt: number, type: string): void => {
        if (!this.visible) {
            this.setVisible(true);
        };
        // this position is right underneath the player at all times
        // this.setPosition(this.entity.x, this.entity.y + 35);
        
        // this position is the bottom middle of the screen and more like 'ui' than 'world'
        this.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT);

        this.setTime(type === 'cast' ? this.time + dt : this.time - dt);
        // console.log(`time: ${this.time}, total: ${this.total}`);
        // this.timeText.setText(`${Math.round(this.time)} / ${this.total}`);
        // this.timeText.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT - 50);
    };
};