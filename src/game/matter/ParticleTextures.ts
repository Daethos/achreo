import { FRAMES } from "../entities/Entity";
import { Play } from "../main";

interface TeleportEffectConfig {
    duration?: number;
    smokeCount?: number;
    sparkCount?: number;
    magicCount?: number;
    glowCount?: number;
    ease?: string;
    tint?: number;
};

export class ParticleTextures {
    scene: Play;
    private smokeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private sparkEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private magicEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private glowEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Play) {
        this.scene = scene;
        this.generateParticleTextures(scene);
        this.setupParticleEmitters();
    };

    private generateParticleTextures(scene: Play): void {
        this.generateSmokeTexture(scene);
        this.generateSparkTexture(scene);
        this.generateMagicTexture(scene);
        this.generateGlowTexture(scene);
    };

    private generateSmokeTexture(scene: Play): void {
        const graphics = scene.add.graphics();
        
        // Create gradient smoke puff
        graphics.fillStyle(0x888888, 0.8);
        graphics.fillCircle(32, 32, 32);
        
        graphics.fillStyle(0xaaaaaa, 0.6);
        graphics.fillCircle(24, 24, 24);
        
        graphics.fillStyle(0xcccccc, 0.4);
        graphics.fillCircle(40, 40, 20);
        
        graphics.generateTexture('smoke_particle', 64, 64);
        graphics.destroy();
    };

    private generateSparkTexture(scene: Play): void {
        const graphics = scene.add.graphics();
        
        // Create star-shaped spark
        graphics.fillStyle(0xffffaa, 1);
        this.drawStar(graphics, 16, 16, 5, 12, 6);
        
        // Add glow effect
        graphics.fillStyle(0xffdd77, 0.7);
        this.drawStar(graphics, 16, 16, 5, 10, 5);
        
        graphics.generateTexture('spark_particle', 32, 32);
        graphics.destroy();
    };

    private generateMagicTexture(scene: Play): void {
        const graphics = scene.add.graphics();
        
        // Create magical orb with layered circles
        graphics.fillStyle(0x4488ff, 0.8);
        graphics.fillCircle(16, 16, 14);
        
        graphics.fillStyle(0x88aaff, 0.6);
        graphics.fillCircle(16, 16, 10);
        
        graphics.fillStyle(0xaaccff, 0.8);
        graphics.fillCircle(16, 16, 6);
        
        // Add sparkle effect with small dots
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(22, 10, 2, 2); // top-right sparkle
        graphics.fillRect(8, 20, 2, 2);  // bottom-left sparkle
        
        graphics.generateTexture('magic_particle', 32, 32);
        graphics.destroy();
    }

    private generateGlowTexture(scene: Play): void {
        const graphics = scene.add.graphics();
        
        // Simple circular glow
        graphics.fillStyle(0xffffff, 0.3);
        graphics.fillCircle(16, 16, 16);
        
        graphics.fillStyle(0xffff88, 0.5);
        graphics.fillCircle(16, 16, 12);
        
        graphics.fillStyle(0xffff00, 0.7);
        graphics.fillCircle(16, 16, 8);
        
        graphics.generateTexture('glow_particle', 32, 32);
        graphics.destroy();
    };

    private drawStar(
        graphics: Phaser.GameObjects.Graphics,
        x: number,
        y: number,
        points: number,
        radius: number,
        innerRadius: number
    ): void {
        const step = Math.PI / points;
        const halfStep = step / 2;
        let angle = 0;

        graphics.beginPath();
        graphics.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);

        for (let i = 0; i < points; i++) {
            angle += halfStep;
            graphics.lineTo(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius);
            angle += halfStep;
            graphics.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        };

        graphics.closePath();
        graphics.fillPath();
    };

    private setupParticleEmitters(): void {
        // Smoke emitter - soft, expanding puffs
        this.smokeEmitter = this.scene.add.particles(0, 0, "smoke_particle", {
            speed: { min: 20, max: 60 },
            scale: { start: 0.5, end: 1.5 },
            alpha: { start: 0.8, end: 0 },
            rotate: { min: -180, max: 180 },
            lifespan: 1200,
            frequency: -1,
            blendMode: "ADD"
        });

        // Spark emitter - sharp, fast particles
        this.sparkEmitter = this.scene.add.particles(0, 0, "spark_particle", {
            speed: { min: 80, max: 160 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            rotate: { start: 0, end: 360 },
            lifespan: 800,
            frequency: -1,
            blendMode: "ADD",
            tint: 0xffffaa
        });

        // Magic emitter - glowing orbs
        this.magicEmitter = this.scene.add.particles(0, 0, "magic_particle", {
            speed: { min: 40, max: 100 },
            scale: { start: 0.4, end: 0.8 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 1000,
            frequency: -1,
            blendMode: "ADD"
        });

        // Glow emitter - soft light bursts
        this.glowEmitter = this.scene.add.particles(0, 0, "glow_particle", {
            speed: { min: 10, max: 30 },
            scale: { start: 0.2, end: 1.0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 600,
            frequency: -1,
            blendMode: "ADD"
        });
    };

    public cinematicTeleport(
        entity: any,
        targetX: number, 
        targetY: number,
        reappear: boolean,
        config: TeleportEffectConfig = {}
    ): void {
        const {
            duration = 1000,
            smokeCount = 15,
            sparkCount = 12,
            magicCount = 8,
            glowCount = 6,
            ease = "Back.easeOut",
            tint = 0x88ccff
        } = config;

        // Apply tint to magic particles
        // this.magicEmitter.setTint(tint);

        // Phase 1: Vanish with multi-layer effects
        this.animateVanish(entity, reappear, smokeCount, sparkCount, magicCount, glowCount, targetX, targetY, duration, ease);
        // .then(() => {
        //     // Phase 2: Move while invisible
        //     entity.setVisible(false);
        //     entity.setPosition(targetX, targetY);
            
        //     // Phase 3: Appear with effects
        //     this.animateAppear(entity, smokeCount, sparkCount, magicCount, glowCount, duration, ease);
        // });
    }

    private animateVanish(
        entity: any,
        reappear: boolean,
        smokeCount: number, 
        sparkCount: number, 
        magicCount: number, 
        glowCount: number,
        targetX: number,
        targetY: number,
        duration: number,
        ease: string
    ): void {
        // Emit all particle types
        this.smokeEmitter.explode(smokeCount, entity.x, entity.y);
        this.sparkEmitter.explode(sparkCount, entity.x, entity.y);
        this.magicEmitter.explode(magicCount, entity.x, entity.y);
        this.glowEmitter.explode(glowCount, entity.x, entity.y);

        // Complex vanish animation
        
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            rotation: Math.PI,
            duration: 500,
            ease: "Cubic.easeIn",
            onUpdate: () => {
                // Emit trailing particles during vanish
                if (Math.random() > 0.7) {
                    this.sparkEmitter.emitParticle(1, entity.x, entity.y);
                }
            },
            onComplete: () => {
                // entity.setActive(false);
                entity.setVisible(false);
                entity.setPosition(targetX, targetY);
            
                // Phase 3: Appear with effects
               if (reappear) this.animateAppear(entity, smokeCount, sparkCount, magicCount, glowCount, duration, ease);
            }
        });
    }

    private animateAppear(
        entity: any,
        smokeCount: number,
        sparkCount: number,
        magicCount: number,
        glowCount: number,
        duration: number,
        ease: string
    ): void {
        // Emit all particle types at new location
        this.smokeEmitter.explode(smokeCount, entity.x, entity.y);
        this.sparkEmitter.explode(sparkCount, entity.x, entity.y);
        this.magicEmitter.explode(magicCount, entity.x, entity.y);
        this.glowEmitter.explode(glowCount, entity.x, entity.y);

        // Complex appear animation
        this.scene.tweens.add({
            targets: entity,
            scale: 0.8,
            alpha: 1,
            rotation: 0,
            duration: duration,
            ease: ease,
            onStart: () => {
                entity.setVisible(true);
                entity.setAlpha(0);
                entity.setScale(0.1);
                entity.setRotation(-Math.PI / 4);
                entity.anims.play(FRAMES.ROLL, true).once(FRAMES.ANIMATION_COMPLETE, () => {
                    entity.anims.play(FRAMES.IDLE);
                });
            },
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                // Pulsing glow during appearance
                const pulseScale = 1 + Math.sin(tween.progress * Math.PI * 4) * 0.1;
                this.glowEmitter.setScale(pulseScale);
                
                // Continuous particle emission during appear
                if (Math.random() > 0.8) {
                    this.magicEmitter.emitParticle(1, entity.x, entity.y);
                };
            },
            onComplete: () => {
                this.playLandingEffect(entity);
            }
        });
    }

    private playLandingEffect(entity: any): void {
        // Final impact effects
        this.scene.tweens.add({
            targets: this,
            y: entity.y - 8,
            duration: 150,
            yoyo: true,
            ease: 'Bounce.easeOut'
        });

        // Final particle burst
        this.smokeEmitter.explode(8, entity.x, entity.y);
        this.glowEmitter.explode(4, entity.x, entity.y);

        const direction = this.scene.player.position.subtract(entity.position);
        entity.setFlipX(direction.x < 0);
        entity.shadow.setPosition(entity.x, entity.y + 33);
        entity.shadow.setFlipX(entity.flipX);
    };

    public destroy(): void {
        this.smokeEmitter.destroy();
        this.sparkEmitter.destroy();
        this.magicEmitter.destroy();
        this.glowEmitter.destroy();
    };
};