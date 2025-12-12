import { Play } from "../main";

const CATCH_AGE = 0.01;
const CATCH_DIST = 0.05;
const CLAMP_DAMPEN = 0.9;
const CLAMP_DISTANCE = 150;
const COLLISION_RADIUS = 100;
const EXPERIENCE_DURATION = 2000;
const EXPERIENCE_SPEED = 20;
const LEAD_TIME = 0.25;

export class ExperienceManager {
    scene: Play;
    experience: Phaser.GameObjects.Particles.ParticleEmitter;
    target: Phaser.GameObjects.GameObject & { x: number; y: number; };
    tween: Map<string, Phaser.Tweens.Tween> = new Map();
    // Config for the effect
    emitTime: number = 0; // Track when we emitted
    flickering: boolean = false;
    
    constructor(scene: Play) {
        this.scene = scene;
        this.createExperienceEmitter();
    };

    createExperienceEmitter() {
        this.target = this.scene.add.graphics({ x: 0, y: 0 }).setVisible(false);

        this.experience = this.scene.add.particles(0, 0, "healing", {
            frame: ["healing_1", "healing_2", "healing_3", "healing_4", "healing_5", "healing_6", "healing_7"],
            // x: 0, y: 0,
            blendMode: "ADD",
            color: [0xffc700],
            lifespan: EXPERIENCE_DURATION,
            alpha: { start: 0.9, end: 0.3 },
            scale: { start: 0.05, end: 0.025 },
            quantity: 1,
            frequency: 10,
            
            // 1. Set radial: false. We are calculating our own vectors.
            radial: false,
            
            // 2. This is the initial "explode" burst
            speedX: { min: -25, max: 25 },
            speedY: { min: -25, max: 25 },

            // follow: this.target,

            accelerationX: { onUpdate: this.updateParticleAccel.bind(this) },
            accelerationY: { onUpdate: this.updateParticleAccel.bind(this) },

            emitting: false, // Don't emit automatically
            
        }).setScrollFactor(1).setDepth(100);//.stop();
    };

    flickerGain() {
        if (this.flickering) return;
        this.flickering = true;
        this.scene.player.flickerCaerenic(500);
        // this.scene.time.delayedCall(1500, () => this.flickering = false, undefined, this);
        // let count = 0;
        this.scene.time.addEvent({
            delay: 750,
            // startAt: 0,
            // loop: true,
            // repeat: 1,
            callback: () => {
                // count++;
                // if (count > 0) this.flickering = false;
                this.scene.player.flickerCaerenic(500);
                this.flickering = false;
            },
            callbackScope: this,
        });
    };

    gainExperience(enemyID: string): void {
        const player = this.scene.player;
        const enemy = this.scene.combatManager.combatant(enemyID);

        this.target.x = enemy.x;
        this.target.y = enemy.y;

        this.experience.setPosition(enemy.x, enemy.y);
        this.experience.start();

        this.tween.set(enemyID, this.scene.tweens.add({
            targets: this.target,
            duration: EXPERIENCE_DURATION,
            x: player.x,
            y: player.y + 8,
            onUpdate: (tween: Phaser.Tweens.Tween) => { // , target: any, key: string, current: number, previous: number
                tween.updateTo("x", this.scene.player.x);
                tween.updateTo("y", this.scene.player.y + 8);
            },
            onComplete: () => {
                this.tween.delete(enemyID);
            }
        }));
        
        this.scene.time.delayedCall(250, () => {
            this.experience.stop();
        });
    };


    testExperience() {
        const player = this.scene.player;
        const x = Math.random() > 0.5 ? 1 : -1;
        const y = Math.random() > 0.5 ? 1 : -1;
        const testX = 100 * x;
        const testY = 100 * y;

        this.target.x = player.x + testX;
        this.target.y = player.y + testY;

        this.experience.setPosition(this.target.x, this.target.y);
        this.experience.start();

        this.tween.set("test", this.scene.tweens.add({
            targets: this.target,
            duration: EXPERIENCE_DURATION,
            x: player.x,
            y: player.y + 8,
            onUpdate: (tween: Phaser.Tweens.Tween) => { // , target: any, key: string, current: number, previous: number
                tween.updateTo("x", this.scene.player.x);
                tween.updateTo("y", this.scene.player.y + 8);
            },
            onComplete: () => {
                this.tween.delete("test");
            }
        }));

        this.scene.time.delayedCall(250, () => {
            this.experience.stop();
        });
    };

    updateParticleAccel(particle: Phaser.GameObjects.Particles.Particle, key: string, _t: number, _value: number): number {
        if (particle.lifeCurrent > 1500) return 0;
        
        const particleWorldX = particle.x + this.experience.x;
        const particleWorldY = particle.y + this.experience.y;
        
        // Predict target position
        const player = this.scene.player;
        const destX = this.target.x + (player.body?.velocity.x || 0) * 10;
        const destY = this.target.y + (player.body?.velocity.y || 0) * 10;
        const dx = destX - particleWorldX;
        const dy = destY - particleWorldY;
        const distSq = (dx * dx) + (dy * dy);
        const dist = Math.sqrt(distSq);
        
        // Growing collision radius
        const age = EXPERIENCE_DURATION - particle.lifeCurrent;
        const collisionRadius = COLLISION_RADIUS + (age * LEAD_TIME);
        if (distSq < collisionRadius) {
            // if (player.body.velocity.x > 0) console.log({ x: player.body.velocity.x });
            // if (player.body.velocity.y > 0) console.log({ y: player.body.velocity.y });
            // console.log({ distSq, collisionRadius });
            particle.lifeCurrent = 0;
            this.flickerGain();
            return 0;
        };

        // Apply velocity damping when close
        if (dist < CLAMP_DISTANCE) {
            particle.velocityX *= CLAMP_DAMPEN;
            particle.velocityY *= CLAMP_DAMPEN;
        };
        
        const catchSpeed = (age * CATCH_AGE) + (dist * CATCH_DIST);
        const angle = Math.atan2(dy, dx);
        
        if (key === "accelerationX") {
            return Math.cos(angle) * catchSpeed * EXPERIENCE_SPEED;
        } else {
            return Math.sin(angle) * catchSpeed * EXPERIENCE_SPEED;
        };
    };
};