import { Play } from "../main";

export class ExperienceManager {
    scene: Play;
    experience: Phaser.GameObjects.Particles.ParticleEmitter;
    target: Phaser.GameObjects.GameObject & { x: number; y: number; };
    PULL_STRENGTH = 15000;
// Controls how "stiff" the stream is. Higher = stronger pull.
    SPRING_CONSTANT = 3; 
    
    // Controls friction. Higher = less jitter/overshoot. (0.1 to 1 is a good range)
    DAMPING_FACTOR = 0.5;
    
    constructor(scene: Play) {
        this.scene = scene;
        this.createExperienceEmitter();
        // this.scene.time.addEvent({
        //     delay: 1000,
        //     callback: () => {
        //         const player = this.scene.player;
        //         const x = Math.random() > 0.5 ? 1 : -1;
        //         const y = Math.random() > 0.5 ? 1 : -1;

        //         this.target.x = player.x - (100 * x);
        //         this.target.y = player.y - (100 * y);
        //     },
        //     loop: true
        //  });
    };

    createExperienceEmitter() {
        this.target = this.scene.add.graphics({ x: 0, y: 0 }).setVisible(false);

        this.experience = this.scene.add.particles(0, 0, "healing", {
            frame: ["healing_1", "healing_2", "healing_3", "healing_4", "healing_5", "healing_6", "healing_7"],
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0xffc700],
            lifespan: 1600,
            alpha: { start: 0.9, end: 0.3 },
            scale: { start: 0.05, end: 0.025 },
            quantity: 1,
            // frequency: -1,
            frequency: 10,
            
            // 1. Set radial: false. We are calculating our own vectors.
            radial: false,
            
            // 2. This is the initial "explode" burst
            speedX: { min: -25, max: 25 },
            speedY: { min: -25, max: 25 },

            // radial: true,
            follow: this.target,

            // speed: { min: 25, max: 50 },
            // accelerationX: { min: -50, max: 50 },
            // accelerationY: { min: -50, max: 50 },
            accelerationX: { onUpdate: this.updateParticleAccel.bind(this) },
            accelerationY: { onUpdate: this.updateParticleAccel.bind(this) },

        }).setScrollFactor(1).setDepth(100).stop();
    };

    gainExperience(enemyID: string): void {
        const player = this.scene.player;
        const enemy = this.scene.combatManager.combatant(enemyID);
        this.target.x = enemy.x;
        this.target.y = enemy.y;

        this.experience.start();

        // this.experience.explode(25, this.target.x, this.target.y + 6);
        
        this.scene.tweens.add({
            targets: this.target,
            duration: 2000,
            x: player.x,
            y: player.y,
            onUpdate: (tween: Phaser.Tweens.Tween) => { // , target: any, key: string, current: number, previous: number
                tween.updateTo('x', player.x, false);
                tween.updateTo('y', player.y, false);
            }
        });

        this.scene.time.delayedCall(250, () => {
            this.experience.stop();
        });
    };

    testExperience() {
        console.log("Starting Test");
        const player = this.scene.player;
        
        const x = Math.random() > 0.5 ? 1 : -1;
        const y = Math.random() > 0.5 ? 1 : -1;

        this.target.x = player.x - (100 * x);
        this.target.y = player.y - (100 * y);

        this.experience.start();

        // this.experience.explode(25, this.target.x, this.target.y + 6);
        
        this.scene.tweens.add({
            targets: this.target,
            duration: 2000,
            x: player.x,
            y: player.y,
            onUpdate: (tween: Phaser.Tweens.Tween) => { // , target: any, key: string, current: number, previous: number
                tween.updateTo('x', player.x, false);
                tween.updateTo('y', player.y, false);
            }
        });

        this.scene.time.delayedCall(250, () => {
            this.experience.stop();
        });
    };

    updateParticleAccel(particle: Phaser.GameObjects.Particles.Particle, key: string, _t: number, _value: number): number {
        const position = new Phaser.Math.Vector2(this.target.x, this.target.y);
        const direction = position.subtract(new Phaser.Math.Vector2(particle.x, particle.y)).normalize();
        if (key === "accelerationX") {
            return direction.x * 100;
        } else {
            return direction.y * 100;
        };
    };
};