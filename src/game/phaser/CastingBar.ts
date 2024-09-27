import { useResizeListener } from '../../utility/dimensions';
import { EventBus } from '../EventBus';
import { Game } from '../scenes/Game';
import { Underground } from '../scenes/Underground';
const COLORS = {
    CAST: 0x0000FF,
    DAMAGE: 0xFF0000,
    HEAL: 0x00CC00,
    HUSH: 0xA700FF,
    TENDRIL: 0x800080,
    FYERUS: 0xE0115F,
};
const dimensions = useResizeListener();

export default class CastingBar extends Phaser.GameObjects.Container {
    private bar: Phaser.GameObjects.Graphics;
    private barWidth: number;
    private barHeight: number;
    private border: Phaser.GameObjects.Graphics;
    private borderColor: number;
    private fillColor: number;
    private time: number;
    private total: number;
    private castbar: Phaser.GameObjects.Sprite;
    private timeText: Phaser.GameObjects.Text;
    private barY: number;

    constructor(scene: Game | Underground, x: number, y: number, time: number, entity: any) {
        super(scene, x, y);
        this.total = time;
        this.time = 0;
        this.create(entity, scene);
        scene.add.existing(this);
        this.setDepth(5);
        this.setScrollFactor(0);
        this.visible = false;
        this.barY = scene.settings.positions.castbar.barY;
        this.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT - this.barY);
    };

    private create = (entity: any, scene: Game | Underground): void => {
        if (entity.name === 'player') {
            this.barHeight = scene.settings.positions.castbar.barHeight;
            this.barWidth = scene.settings.positions.castbar.barWidth;

            this.borderColor = 0x000000;
            this.fillColor = COLORS.CAST;
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
            this.fillColor = COLORS.CAST;
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
        this.draw(color || COLORS.CAST);
    };
    
    public setTotal = (total: number, color?: string): void => {
        this.total = total;
        this.draw(COLORS[color as string as keyof typeof COLORS] || COLORS.CAST);
    };

    private castbarListener = () => {
        EventBus.on('castbar-y', (y: number) => {
            this.barY = y;
            this.setPosition(dimensions().WIDTH / 2, dimensions().HEIGHT - y);
        });
        EventBus.on('update-castbar', (dims: { height: number, width: number }) => {
            const { height, width } = dims;
            this.barWidth = width;
            this.barHeight = height;
            this.castbar.setDisplaySize(this.barWidth * 1.2, this.barHeight * 2.3);
        });
        EventBus.on('show-castbar', (show: boolean) => this.setVisible(show));
    };

    public update = (dt: number, type: string, color: string = 'CAST'): void => {
        this.setTime(type === 'cast' ? this.time + dt : this.time - dt, COLORS[color as keyof typeof COLORS]);
    };
};