import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import { useResizeListener } from '../utility/dimensions';

const dimensions = useResizeListener();

export default class CastingBar extends Phaser.GameObjects.Container {
    // private scene: Phaser.Scene;
    private bar: Phaser.GameObjects.Graphics;
    private barWidtth: number;
    private barHeight: number;
    private border: Phaser.GameObjects.Graphics;
    private borderColor: number;
    private entity: Player | Enemy;
    private fillColor: number;
    private time: number;
    private total: number;

    constructor(scene: Phaser.Scene, x: number, y: number, time: number, entity: Player | Enemy) {
        super(scene, x, y);
        // this.scene = scene;
        this.entity = entity;
        this.total = time;
        this.time = 0;

        // 50 = 'world', 200 = 'ui'
        this.barWidtth = 200;
        
        // 6 = 'world', 24 = 'ui'
        this.barHeight = 24;
        this.borderColor = 0x000000;
        this.fillColor = 0x0000FF;
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.bar.fillStyle(this.fillColor);
        this.bar.fillRect(-this.barWidtth / 2, -this.barHeight / 2, this.barWidtth, this.barHeight);
        this.add(this.bar);

        this.border = new Phaser.GameObjects.Graphics(scene);
        this.border.lineStyle(1, this.borderColor);
        this.border.strokeRect(-this.barWidtth / 2, -this.barHeight / 2, this.barWidtth, this.barHeight);
        this.add(this.border);

        scene.add.existing(this);
        this.setDepth(5);
        this.setScrollFactor(0);
        this.visible = false;
    };

    private draw = (): void => {
        this.border.clear();
        this.border.lineStyle(1, this.borderColor);
        this.border.strokeRect(-this.barWidtth / 2, -this.barHeight / 2, this.barWidtth, this.barHeight);

        this.bar.clear();
        this.bar.fillStyle(this.fillColor);
        this.bar.fillRect(-this.barWidtth / 2, -this.barHeight / 2, (this.time / this.total) * this.barWidtth, this.barHeight);
    };

    public getTotal = (): number => this.total;

    public reset = (): void => {
        this.time = 0;
        this.total = 0;
        this.setVisible(false);
        this.border.clear();
        this.bar.clear();
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
        if (!this.visible) this.setVisible(true);
        // this position is right underneath the player at all times
        // this.setPosition(this.entity.x, this.entity.y + 35);
        
        // this position is the bottom middle of the screen and more like 'ui' than 'world'
        this.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT);

        this.setTime(type === 'cast' ? this.time + dt : this.time - dt);
    };
};