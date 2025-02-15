export default class HealthBar extends Phaser.GameObjects.Container {
    private bar: Phaser.GameObjects.Graphics;
    private barWidth: number;
    private barHeight: number;
    private border: Phaser.GameObjects.Graphics;
    private borderColor: number;
    private p: Phaser.GameObjects.Graphics;
    private total: number;
    private value: number;
    private fillColor: number;

    constructor(scene: Phaser.Scene, x: number, y: number, value: number, context?: string) {
        super(scene, x, y);
        this.total = value;
        this.value = value;
        this.barWidth = 50;
        this.barHeight = 6;
        this.borderColor = 0x000000; 
        this.fillColor = context === 'player' ? 0xFFC700 : context === 'party' ? 0x008000 : 0x800080; // 0x00CCFF || 0x800080 || 0x008000
        this.p = new Phaser.GameObjects.Graphics(scene);
        this.p.fillStyle(0xFF0000); 
        this.p.fillRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth, this.barHeight);
        this.add(this.p);
        this.bar = new Phaser.GameObjects.Graphics(scene);
        this.bar.fillStyle(this.fillColor); 
        this.bar.fillRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth, this.barHeight);
        this.add(this.bar);

        this.border = new Phaser.GameObjects.Graphics(scene);
        this.border.lineStyle(1, this.borderColor);
        this.border.strokeRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth, this.barHeight);
        this.add(this.border);

        scene.add.existing(this);
        this.setDepth(10);
        this.setVisible(false);
    };

    public cleanUp = () => {
        this.p.destroy();
        this.bar.destroy();
        this.border.destroy();
        this.destroy();
    };
    
    private draw = (): void => {
        this.border.clear();
        this.border.lineStyle(1, this.borderColor);
        this.border.strokeRect(-this.barWidth / 2, -this.barHeight / 2, this.barWidth, this.barHeight);
        this.bar.clear();
        this.bar.fillStyle(this.fillColor); 
        this.bar.fillRect(-this.barWidth / 2, -this.barHeight / 2, (this.value / this.total) * this.barWidth, this.barHeight);
    };

    public getValue = (): number => this.value;

    public getTotal = (): number => this.total;

    public setTotal = (total: number): void => {
        this.total = total;
        this.draw();
    };

    public setValue = (value: number): void => {
        this.value = value;
        this.draw();
    };

    public shield = (value: number): void => {
        this.fillColor = 0xfdf6d8;
        this.setValue(value);
    };

    public update = (player: any): void => {
        this.setPosition(player.x, player.y - 25);
    };
};