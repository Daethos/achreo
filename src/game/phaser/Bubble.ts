const COLORS = {
    'aqua': 0x00FFFF,
    'bone': 0xFDF6D8,
    'black': 0x000000,
    'blue': 0x0000FF,
    'gold': 0xFFD700,
    'green': 0x00FF00,
    'red': 0xFF0000,
    'purple': 0x800080,

    'teal': 0x008080,
    'lightblue': 0xADD8E6,
    'sapphire': 0x0F52BA,
    'ultramarine': 0x0437F2,
    'dread': 0x8B0000, // Menace ?
    'burned': 0xCC5500,
    'chartreuse': 0xDFFF00, // Mystify?
    'fuchsia': 0xFF00FF,
    'malachite': 0x0BDA51,
};

export default class Bubble extends Phaser.GameObjects.Graphics {
    glowFilter: any;
    charges: number;
    color: number;
    calling: boolean;
    warp: Phaser.Time.TimerEvent | undefined;
    constructor(scene: Phaser.Scene, x: number, y: number, type: string, time: number) {
        super(scene);
        this.setPosition(x, y + 6);
        this.calling = false;  
        this.charges = 6;
        this.color = COLORS[type as keyof typeof COLORS];
        this.glowFilter = scene.plugins.get('rexGlowFilterPipeline');
        this.glowFilter.add(this, {
            outerStrength: 1,
            innerStrength: 1,
            glowColor: this.color,
            intensity: 0.25,
        });
        this.drawBubble(scene, time);
        scene.add.existing(this);
    };

    cleanUp = () => {
        this?.glowFilter?.remove?.(this);
        this?.warp?.remove?.(false);
        this?.warp?.destroy?.();
        this?.destroy?.();
    };

    drawBubble = (scene: Phaser.Scene, time: number) => {
        this.lineStyle(3, this.color, 1);
        this.strokeCircle(0, 0, 35);
        this.setDepth(100);
        const reps = time / 250; 
        this.warp = this.scene.time.addEvent({
            delay: 250, // 125 Adjust the delay as needed
            callback: () => {
                if (!this || !this.warp || !this.glowFilter) return;
                this.calling = true;
                if (this.charges <= 0) {
                    this.glowFilter.remove(this);
                    this.warp.destroy();
                    this.warp = undefined;
                    this.destroy();
                    return;
                };
                this.updateGlow(scene);
            },
            repeat: reps - 1,
            callbackScope: this
        });
    };

    setCharges = (charges: number) => {
        this.charges = charges;
    };

    setDelay = (scene: Phaser.Scene, time: number) => {
        scene.time.delayedCall(time, () => {
            if (!this) return;
            this.glowFilter?.remove?.(this);
            this.warp?.remove?.(false);
            this.warp?.destroy?.();
            this.destroy?.();
        });
    };

    updateGlow = (scene: Phaser.Scene) => {
        if (!this || this.calling === false || !this.glowFilter || !this.warp || !scene || !this.scene?.sys) return;
        let instance = this.glowFilter.get(this)[0];
        if (instance) {
            instance.outerStrength = (this.charges / 2) + Math.sin(scene.time.now * 0.005); // * (this.charges / 2); // Adjust the frequency and amplitude as needed
            instance.innerStrength = (this.charges / 2) + Math.cos(scene.time.now * 0.005); // * (this.charges / 2);            
        } else {
            const outerStrength = (this.charges / 2) + Math.sin(scene.time.now * 0.005); // * (this.charges / 2); // Adjust the frequency and amplitude as needed
            const innerStrength = (this.charges / 2) + Math.cos(scene.time.now * 0.005); // * (this.charges / 2);
            const intensity = 0.25;
            const glowColor = this.color;  
            this.glowFilter.add?.(this, {
                outerStrength,
                innerStrength,
                glowColor,
                intensity,
                knockout: true
            });
        };
        this.calling = false;
    };

    update(x: number, y: number) {
        this.setPosition(x, y + 6);
    };
};