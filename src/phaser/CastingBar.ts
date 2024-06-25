import Phaser from 'phaser';
import { useResizeListener } from '../utility/dimensions';
import { EventBus } from '../game/EventBus';
import { Game } from '../game/scenes/Game';

const dimensions = useResizeListener();

export default class CastingBar extends Phaser.GameObjects.Container {
    private bar: Phaser.GameObjects.Graphics;
    private barWidth: number;
    private barHeight: number;
    private border: Phaser.GameObjects.Graphics;
    private borderColor: number;
    private entity: any;
    private fillColor: number;
    private zoom: number;
    private time: number;
    private total: number;
    private castbar: Phaser.GameObjects.Sprite;
    private timeText: Phaser.GameObjects.Text;

    constructor(scene: Game, x: number, y: number, time: number, entity: any) {
        super(scene, x, y);
        this.entity = entity;
        this.total = time;
        this.time = 0;
        this.zoom = scene.cameras.main.zoom;
        this.create(entity, scene);
        scene.add.existing(this);
        this.setDepth(5);
        this.setScrollFactor(0);
        this.visible = false;
        
        // this position is the bottom middle of the screen and more like 'ui' than 'world'
        this.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT);
    };

    private create = (entity: any, scene: Game): void => {
        if (entity.name === 'player') {
            // 50 = 'world', 200 = 'ui'
            // this.barWidth = 160 / (this.zoom + (this.zoom * MODIFIER)); // (0.8 default)
            // // 6 = 'world', 24 = 'ui'
            // this.barHeight = 19.2 / (this.zoom + (this.zoom * MODIFIER)); // (0.8 default)

            this.barHeight = scene.settings.positions.castbar.barHeight;
            this.barWidth = scene.settings.positions.castbar.barWidth;

            this.borderColor = 0x000000;
            this.fillColor = 0x0000FF;
            this.bar = new Phaser.GameObjects.Graphics(scene);
            this.bar.fillStyle(this.fillColor);
            this.bar.fillRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth, this.barHeight);
            this.add(this.bar);

            this.castbar = new Phaser.GameObjects.Sprite(scene, 0, 0, 'player-castbar');
            this.castbar.setOrigin(0.5);
            this.castbar.setDisplaySize(this.barWidth * 1.2, this.barHeight * 2.3);
            this.add(this.castbar);
    
            this.timeText = new Phaser.GameObjects.Text(this.scene, 0, 0, `${Math.round(this.time)} / ${this.total}`, { 
                color: '#fdf6d8', fontSize: '1.75em', stroke: '#000', strokeThickness: 3, align: 'center' 
            });
            this.add(this.timeText);
            this.timeText.setOrigin(0.5);
            this.timeText.setDepth(10);
            this.timeText.setScrollFactor(0);
            this.castbarListener();
        } else {
            this.barHeight = 12;
            this.barWidth = 100;
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

            this.timeText = new Phaser.GameObjects.Text(this.scene, 0, 0, `${Math.round(this.time)} / ${this.total}`, { 
                color: '#fdf6d8', fontSize: '1.75em', stroke: '#000', strokeThickness: 3, align: 'center' 
            });
            this.add(this.timeText);
            this.timeText.setOrigin(0.5);
            this.timeText.setDepth(10);
            this.timeText.setScrollFactor(0);
        };
    };

    private draw = (color: number): void => {
        this.bar.clear();
        this.bar.fillStyle(color);
        this.bar.fillRect(-this.barWidth / 2, -this.barHeight / 2, (this.time / this.total) * this.barWidth, this.barHeight);
        this.timeText.setText(`${Math.round(this.time / 100) / 10} / ${this.total / 1000}`);    
    };

    public getTotal = (): number => this.total;

    public reset = (): void => {
        this.time = 0;
        this.total = 0;
        this.setVisible(false);
        this.bar.clear();
        this.timeText.setText('');
    };
    
    public setTime = (time: number, color?: number): void => {
        this.time = time > this.total ? this.total : time;
        this.draw(color || 0x0000FF);
    };
    
    public setTotal = (total: number, color?: number): void => {
        this.total = total;
        this.draw(color || 0x0000FF);
    };

    private castbarListener = () => {
        EventBus.on('castbar-zoom-update', (e: number) => {
            this.zoom = e;
        });
        EventBus.on('castbar-y', (y: number) => {
            this.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT - y);
        });
        EventBus.on('update-castbar', (dims: { height: number, width: number }) => {
            const { height, width } = dims;
            this.barWidth = width;
            this.barHeight = height;
            this.castbar.setDisplaySize(this.barWidth * 1.2, this.barHeight * 2.3);
        });
        EventBus.on('show-castbar', (show: boolean) => {
            if (show === true) {
                this.setVisible(true);
            } else {
                this.setVisible(false);
            };
        });
    };

    public update = (dt: number, type: string, color?: number, x?: number, y?: number): void => {
        this.setTime(type === 'cast' ? this.time + dt : this.time - dt, color || 0x0000FF);
        // if (this.entity.name === 'enemy') {
        //     this.setPosition(this.entity.x, this.entity.y + 35);
        //     // if (x && y) {
        //     //     // const world = this.scene.cameras.main.getWorldPoint(x, y);
        //     //     // console.log(world, x, y, 'Enemy Castbar Updating Position');
        //     //     this.setPosition(x, y + 35);
        //     // };
        // };
        // this position is right underneath the player at all times
        

        // console.log(`time: ${this.time}, total: ${this.total}`);
        // this.timeText.setText(`${Math.round(this.time)} / ${this.total}`);
        // this.timeText.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT - 50);
    };
};