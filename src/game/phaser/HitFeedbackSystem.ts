import { randomFloatFromInterval } from "../../models/equipment";
import { Combat } from "../../stores/combat";
import { Play } from "../main";
import { HitProfile, HitProfiles } from "./HitProfiles";
import { screenShake } from "./ScreenShake";

type HitFeedbackContext = {
    // source: string;
    damageType: string;
    pos: Phaser.Math.Vector2;
    weaponType: string | undefined;
    critical: boolean;
    glancing: boolean;
    parry: boolean;
    prayer: boolean;
    roll: boolean;
    miss: boolean; // deterimed by lack of .computerDamaged / .playerDamaged boolean
};

export function getHitFeedbackContext(combat: Combat, pos: Phaser.Math.Vector2, player: boolean) {
    if (player) {
        return {
            // source: "player",
            damageType: combat.playerDamageType,
            pos,
            weaponType: combat.weapons[0]?.type,
            critical: combat.criticalSuccess,
            glancing: combat.glancingBlow,
            parry: combat.parrySuccess,
            prayer: combat.religiousSuccess,
            roll: combat.rollSuccess,
            miss: !combat.computerDamaged
        };
    } else {
        return {
            // source: "enemy",
            damageType: combat.computerDamageType,
            pos,
            weaponType: combat.computerWeapons[0]?.type,
            critical: combat.computerCriticalSuccess,
            glancing: combat.computerGlancingBlow,
            parry: combat.computerParrySuccess,
            prayer: combat.computerReligiousSuccess,
            roll: combat.computerRollSuccess,
            miss: !combat.playerDamaged
        };
    };
};

export class HitFeedbackSystem {
    private scene: Play;
    private profiles: Record<string, HitProfile>;
    private blood: Phaser.GameObjects.Particles.ParticleEmitter;
    private earth: Phaser.GameObjects.Particles.ParticleEmitter;
    private fire: Phaser.GameObjects.Particles.ParticleEmitter;
    private frost: Phaser.GameObjects.Particles.ParticleEmitter;
    private lightning: Phaser.GameObjects.Particles.ParticleEmitter;
    private righteous: Phaser.GameObjects.Particles.ParticleEmitter;
    private sorcery: Phaser.GameObjects.Particles.ParticleEmitter;
    private spooky: Phaser.GameObjects.Particles.ParticleEmitter;
    private wild: Phaser.GameObjects.Particles.ParticleEmitter;
    private wind: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Play) {
        this.scene = scene;
        this.profiles = HitProfiles;
        this.createParticles();
    };

    play(context: HitFeedbackContext): void {
        const { damageType, weaponType, critical, glancing, miss, parry, prayer, roll, pos } = context;
        // console.log({damageType, critical, glancing, parry});
        const profile = this.profiles[damageType];

        if (!profile) return;
        
        const key = this.resolveSFXKey(damageType, weaponType);
        let volume = this.scene.hud.settings.volume;
        let rate = profile.rate;

        if (roll) this.scene.sound.play("roll", { volume, rate });
        if (parry) this.scene.sound.play("parry", { volume, rate });
        if (prayer) this.scene.sound.play("righteous", { volume, rate });

        if (miss) {
            if (profile.missKey) this.scene.sound.play(profile.missKey, { volume: volume * 0.6 });
            return;
        };

        if (critical) {
            volume *= randomFloatFromInterval(1.35, 1.5);
            rate *= randomFloatFromInterval(1, 1.2);
            this.zoom(profile.zoom);
            this.flashScreen(profile.flashColor, profile.hitStop * 10);
        };

        if (glancing) {
            volume *= randomFloatFromInterval(0.6, 0.8);
            rate *= randomFloatFromInterval(0.8, 1);
        };

        if (profile.hitStop) this.hitStop(profile.hitStop);
        if (profile.particles) this.emitParticles(pos, damageType, critical, glancing, parry);
        if (profile.screenShake) screenShake(this.scene);

        this.scene.sound.play(key, { volume, rate });
    };

    private resolveSFXKey(damageType: string, weaponType?: string): string {
        switch (damageType) {
            case "Fire": return "fire";
            case "Frost": return "frost";
            case "Lightning": return "lightning";
            case "Wind": return "wind";
            case "Earth": return "earth";
            case "Sorcery": return "sorcery";
            case "Pierce": return weaponType === "Bow" || weaponType === "Greatbow" ? "bow" : "pierce";
            case "Slash": return "slash";
            case "Blunt": return "blunt";
            case "Spooky": return "spooky";
            case "Wild": return "wild";
            case "Righteous": return "righteous";
            default: return "";
        };
    };

    private flashScreen(color: number, time: number): void {
        const flash = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, color, 0.5).setOrigin(0).setScrollFactor(0);
        this.scene.tweens.add({
            targets: flash,
            alpha:0,
            duration: time,
            onComplete: () => flash.destroy()
        });
    };

    private hitStop(duration: number) {
        this.scene.matter.world.engine.timing.timeScale = 0.01;
        this.scene.time.delayedCall(duration, () => {
            this.scene.matter.world.engine.timing.timeScale = 1;
        }, undefined, this);
    };

    private zoom(zoom: number) {
        const cam = this.scene.cameras.main;
        this.scene.tweens.add({
            targets: cam,
            zoom: cam.zoom * zoom,
            ease: Phaser.Math.Easing.Elastic.InOut,
            duration: 300,
            yoyo: true
        });
    };

    private createParticles() {
        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillCircle(3, 3, 3).generateTexture("blood", 6, 6).destroy();
        this.blood = this.scene.add.particles(0, 0, "blood", {
            x: 0, y: 0,
            blendMode: "NORMAL",
            color: [0xFF0000, 0xFF1100, 0xFF2200, 0xFF3300],
            frequency: 100,
            angle: { min: -90 - 45, max: -90 + 45 },
            lifespan: { min: 200, max: 500 },
            quantity: 100,
            alpha: { start: 1, end: 0 },
            scale: { start: 1, end: 0 },
            speed: { min: 100, max: 250 },
            gravityY: 300,
            visible: true,
        }).setScrollFactor(1).setDepth(100).stop();

        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillCircle(4, 4, 4).generateTexture("earthen", 8, 8).destroy();
        this.earth = this.scene.add.particles(0, 0, "earthen", {
            x: 0, y: 0,
            blendMode: "NORMAL",
            color: [0x2E1E0E, 0x593A1B, 0x8B4513, 0x8B5A2B],
            frequency: 40,
            radial: true,
            rotate: { min: -90, max: 90 },
            angle: { min: -90, max: 90 },
            lifespan: { min: 300, max: 600 },
            quantity: 40,
            alpha: { start: 0.75, end: 0.25 }, // 1 / 0
            scale: { start: 1, end: 0.25 }, // 0.6 / 0.8
            speedX: {min: -20, max: 20 },
            speedY: { min: 20, max: 40 }, // 60 / 100
            gravityY: 250,
            visible: true,
            emitZone: {
                source: new Phaser.Geom.Circle(0, 0, 12),
                type: "edge",
                quantity: 4
            }
        }).setScrollFactor(1).setDepth(100).stop();

        this.fire = this.scene.add.particles(0, 0, "fire", {
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0xFF0000, 0xFFA500, 0xFFFFFF], 
            frequency: 40,
            angle: { min: -90, max: 90 },
            rotate: { min: 90, max: 180 },
            radial: true,
            lifespan: { min: 600, max: 1200 },
            quantity: 40,
            alpha: { start: 0.7, end: 0 },
            scale: { start: 0.3, end: 0.8, ease: "Expo.easeOut" },
            speedY: { min: -40, max: -80 },
            speedX: { min: -20, max: 20 },
            gravityY: -10,
            tint: [0xFF6600, 0xFFA500, 0xFF3300],
            visible: true,
            emitZone: {
                source: new Phaser.Geom.Rectangle(-15, -5, 30, 10),
                type: "random",
                quantity: 10
            }
        }).setScrollFactor(1).setDepth(100).stop();

        // this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillCircle(3, 3, 3).generateTexture("frost", 6, 6).destroy();
        this.frost = this.scene.add.particles(0, 0, "frost", {
            x: 0, y: 0,
            blendMode: "SCREEN",
            color: [0xB0E0E6, 0x0000FF, 0x00CCFF], // 0x0000FF
            frequency: 100,
            angle: { min: -135, max: -45 },
            rotate: { min: -90, max: 90 },
            radial: true,
            // angle: { min: -100, max: -80 },
            lifespan: { min: 450, max: 750 },
            quantity: 40,
            alpha: { start: 0.9, end: 0 },
            scale: { start: 0.75, end: 0.25 },
            speedX: {min: -45, max: 45 },
            speedY: { min: 35, max: 65 }, // 60 / 100
            gravityY: 0,
            visible: true,
            emitZone: {
                source: new Phaser.Geom.Circle(0, 0, 12),
                type: "random",
                quantity: 7
            }
        }).setScrollFactor(1).setDepth(100).stop();

        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillRect(0, 0, 2, 6).generateTexture("lightning", 2, 6).destroy();
        this.lightning = this.scene.add.particles(0, 0, "lightning", {
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0xFFFF00, 0xFFFF66, 0x00CCFF, 0x00FFFF],
            frequency: 100,
            angle: { min: -135, max: -45 },
            lifespan: { min: 150, max: 300 },
            quantity: 40,
            alpha: { start: 1, end: 0 },
            scale: { start: 1.2, end: 0.4 },
            speed: { min: 300, max: 600 },
            visible: true,
            gravityY: 0,
        }).setScrollFactor(1).setDepth(100).stop();

        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillCircle(3, 3, 3).generateTexture("righteous", 6, 6).destroy();
        this.righteous = this.scene.add.particles(0, 0, "righteous", {
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0xFFD700, 0xFDF6D8],
            frequency: 80,
            angle: { min: -100, max: -80 },
            lifespan: { min: 600, max: 1200 },
            quantity: 40,
            alpha: { start: 1, end: 0.4 },
            scale: { start: 0.8, end: 0 },
            speed: { min: 100, max: 60 },
            gravityY: -50,
        }).setScrollFactor(1).setDepth(100).stop();
        
        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillCircle(3, 3, 3).generateTexture("sorcery", 6, 6).destroy();
        this.sorcery = this.scene.add.particles(0, 0, "sorcery", {
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0xA700FF],
            frequency: 60,
            angle: { min: 180, max: 360 },
            lifespan: { min: 250, max: 500 },
            quantity: 40,
            alpha: { start: 1, end: 0 },
            scale: { start: 0.8, end: 0 },
            speed: { min: 150, max: 300 },
            gravityY: 0,
        }).setScrollFactor(1).setDepth(100).stop();
        
        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillCircle(3, 3, 3).generateTexture("spooky", 6, 6).destroy();
        this.spooky = this.scene.add.particles(0, 0, "spooky", {
            x: 0, y: 0,
            blendMode: "NORMAL",
            color: [0x080080],
            frequency: 120,
            angle: { min: 0, max: 360 },
            rotate: { min: -90, max: 90 },
            radial: true,
            lifespan: { min: 800, max: 1600 },
            quantity: 40,
            alpha: { start: 0.8, end: 0 },
            scale: { start: 1.2, end: 0 },
            speed: { min: 10, max: 30 },
            gravityY: 0,
        }).setScrollFactor(1).setDepth(100).stop();
        
        this.wild = this.scene.add.particles(0, 0, "wild", {
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0x50C878, 0x00FF00],
            frequency: 90,
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            radial: true,
            lifespan: { min: 500, max: 1300 },
            quantity: 40,
            alpha: { start: 0.9, end: 0 },
            scale: { start: 0.8, end: 0 },
            speedX: { min: -50, max: 50 },
            speedY: { min: -50, max: 50 },
            gravityY: 0,
        }).setScrollFactor(1).setDepth(100).stop();
        
        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillRect(0, 0, 2, 10).generateTexture("wind", 2, 10).destroy();
        this.wind = this.scene.add.particles(0, 0, "wind", {
            x: 0, y: 0,
            blendMode: "NORMAL",
            color: [0x00CCFF, 0x00FFFF, 0xFFFFFF],
            frequency: 100,
            radial: true,
            rotate: { min: -90, max: 90 },
            angle: { min: -100, max: -80 },
            lifespan: { min: 250, max: 500 },
            quantity: 40,
            alpha: { start: 0.75, end: 0 },
            scale: { start: 1, end: 0 },
            speed: { min: 80, max: 140 }, // 60 / 120
            gravityY: -25,
            emitZone: {
                source: new Phaser.Geom.Line(-30, 0, 30, 0),
                type: "edge",
                quantity: 10
            },
        }).setScrollFactor(1).setDepth(100).stop();
    };

    private emitParticles(pos: Phaser.Math.Vector2, type: string, crit: boolean, glance: boolean, parry: boolean) {
        if (parry) return;
        const count = crit ? 40 : glance ? 10 : 20;
        switch (type) {
            case "Blunt":
            case "Pierce":
            case "Slash":
                this.blood.explode(count, pos.x, pos.y); // Good
                break;
            case "Earth":
                this.earth.explode(count, pos.x, pos.y); // Good
                break;
            case "Fire":
                this.fire.explode(count, pos.x, pos.y); // Good
                break;
            case "Frost":
                this.frost.explode(count, pos.x, pos.y);
                break;
            case "Lightning":
                this.lightning.explode(count, pos.x, pos.y); // Good
                break;
            case "Righteous":
                this.righteous.explode(count, pos.x, pos.y); // Close
                break;
            case "Sorcery":
                this.sorcery.explode(count, pos.x, pos.y);
                break;
            case "Spooky":
                this.spooky.explode(count, pos.x, pos.y); // Good
                break;
            case "Wild":
                this.wild.explode(count, pos.x, pos.y); // Good
                break;
            case "Wind":
                this.wind.explode(count, pos.x, pos.y);
                break;
        };
    };
};