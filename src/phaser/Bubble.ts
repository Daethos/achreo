const COLORS = {
    'bone': 0xFDF6D8,
    'black': 0x000000,
    'blue': 0x0000FF,
    'gold': 0xFFD700,
    'green': 0x00FF00,
    'red': 0xFF0000,
};

export default class Bubble extends Phaser.GameObjects.Graphics {
    glowFilter: any;
    color: number;
    warp: Phaser.Time.TimerEvent;
    constructor(scene: Phaser.Scene, x: number, y: number, type: string, time: number) {
        super(scene);
        this.setPosition(x, y + 6);
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
        scene.time.delayedCall(time, () => {
            this.warp.destroy();
            this.destroy();
        });
    };

    drawBubble = (scene: Phaser.Scene) => {
        this.lineStyle(3, this.color, 1);
        this.strokeCircle(0, 0, 35);
        this.setDepth(100);
        scene.add.existing(this);
        this.warp = this.scene.time.addEvent({
            delay: 125, // 125 Adjust the delay as needed
            callback: () => this.updateGlow(scene.time.now),
            loop: true,
            callbackScope: this
        });
    };

    updateGlow = (time: number) => {
        this.glowFilter.remove(this);
        const outerStrength = 3 + Math.sin(time * 0.005) * 3; // Adjust the frequency and amplitude as needed
        const innerStrength = 3 + Math.cos(time * 0.005) * 3;
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