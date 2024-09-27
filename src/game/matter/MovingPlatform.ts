export default class MovingPlatform extends Phaser.Physics.Matter.Image {
    private startX: number;
    private startY: number;
    constructor(scene: any, x: number, y: number, texture: string, options: any) {
        super(scene.matter.world, x, y, texture, 0, options);
        scene.add.existing(this);
        this.startX = x;
        this.startY = y;
        this.setTint(0x000000);
        this.setScale(0.5);
    };
    horizontal(from: number, to: number, duration: number) {
        this.scene.tweens.addCounter({
            from,
            to,
            duration,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true,
            onUpdate: (_tween, target) => {
                const x = this.startX + target.value;
                const dx = x - this.x;
                this.x = x;
                this.setVelocityX(dx);
            } 
        });
    };
    vertical(from: number, to: number, duration: number) {
        this.scene.tweens.addCounter({
            from,
            to,
            duration,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true,
            onUpdate: (_tween, target) => {
                const y = this.startY + target.value;
                const dy = y - this.y;
                this.y = y;
                this.setVelocityY(dy);
            }
        });
    };
};