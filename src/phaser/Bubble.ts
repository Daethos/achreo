const COLORS = {
    'bone': 0xFDF6D8,
    'black': 0x000000,
    'blue': 0x0000FF,
    'gold': 0xFFD700,
    'green': 0x00FF00,
    'red': 0xFF0000,
    'purple': 0x800080,
};

export default class Bubble extends Phaser.GameObjects.Graphics {
    glowFilter: any;
    charges: number;
    color: number;
    warp: Phaser.Time.TimerEvent | undefined;
    constructor(scene: Phaser.Scene, x: number, y: number, type: string, time: number) {
        super(scene);
        this.setPosition(x, y + 6);
        this.charges = 6;
        this.color = COLORS[type as keyof typeof COLORS];
        this.glowFilter = scene.plugins.get('rexGlowFilterPipeline');
        this.glowFilter.add(this, {
            outerStrength: 1,
            innerStrength: 1,
            glowColor: this.color,
            intensity: 0.25,
            // knockout: true,
        });
        this.drawBubble(scene);
        this.setDelay(scene, time);    

    };

    drawBubble = (scene: Phaser.Scene) => {
        this.lineStyle(3, this.color, 1);
        this.strokeCircle(0, 0, 35);
        this.setDepth(100);
        scene.add.existing(this);
        this.warp = this.scene.time.addEvent({
            delay: 125, // 125 Adjust the delay as needed
            callback: () => {
                if (!this || !this.warp) return;
                if (this.charges === 0) {
                    this.glowFilter.remove(this);
                    this.warp.destroy();
                    this.destroy();
                    return;
                };
                this.updateGlow(scene.time.now);
            },
            loop: true,
            callbackScope: this
        });
    };

    setCharges = (charges: number) => {
        this.charges = charges;
    };

    setDelay = (scene: Phaser.Scene, time: number) => {
        scene.time.delayedCall(time, () => {
            this.glowFilter.remove(this);
            this?.warp?.remove(false);
            this?.warp?.destroy();
            this.warp = undefined;
            this.destroy();
        });
    };

    updateGlow = (time: number) => {
        if (!this.glowFilter || !this || !this.warp) return;
        this.glowFilter.remove(this);
        const outerStrength = (this.charges) + Math.sin(time * 0.005) * (this.charges); // Adjust the frequency and amplitude as needed
        const innerStrength = (this.charges) + Math.cos(time * 0.005) * (this.charges);
        const intensity = 0.25;
        const glowColor = this.color;

        this.glowFilter.add(this, {
            outerStrength,
            innerStrength,
            glowColor,
            intensity,
            knockout: true
        });
    };

    update(x: number, y: number) {
        this.setPosition(x, y + 6);
    };

};