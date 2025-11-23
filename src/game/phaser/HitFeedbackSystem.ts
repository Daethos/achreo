import { randomFloatFromInterval } from "../../models/equipment";
import { Combat } from "../../stores/combat";
import { masteryNumber } from "../../utility/styling";
import { Entity, Play } from "../main";
import ChainLightning from "./ChainLightning";
import { HitProfile, HitProfiles } from "./HitProfiles";
// import ParticlesAlongBounds from 'phaser3-rex-plugins/plugins/particlesalongbounds.js';

type HitFeedbackContext = {
    source: string;
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
            source: "player",
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
            source: "enemy",
            damageType: combat.computerDamagedType,
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
    private zooming: boolean = false;
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
    private heal: Phaser.GameObjects.Particles.ParticleEmitter;
    private parry: Phaser.GameObjects.Particles.ParticleEmitter;
    private trail: Phaser.GameObjects.Particles.ParticleEmitter;
    private trauma: number = 0;
    public shakeTimer: Phaser.Time.TimerEvent | undefined = undefined;
    public chainlightning: ChainLightning;
    // private trailEvent: Phaser.Time.TimerEvent | undefined;
    // private caerenic : Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Play) {
        this.scene = scene;
        this.profiles = HitProfiles;
        this.createParticles();
        this.chainlightning = new ChainLightning(scene);
    };

    play(context: HitFeedbackContext): void {
        const { damageType, weaponType, critical, glancing, miss, parry, prayer, roll, pos, source } = context;
        const profile = this.profiles[damageType];

        if (!profile) return;
        
        const key = this.resolveSFXKey(damageType, weaponType);
        let volume = this.scene.hud.settings.volume;
        let rate = profile.rate;

        if (roll) this.scene.sound.play("roll", { volume, rate });
        if (prayer) this.scene.sound.play("righteous", { volume, rate });
        if (parry) {
            this.parrySequence(profile, volume, rate, source);
            return;
        };

        if (miss) {
            // if (profile.missKey) this.scene.sound.play(profile.missKey, { volume: volume * 0.6 });
            return;
        };

        if (critical) {
            this.criticalSequence(profile, key, volume, rate, pos, damageType);
        } else if (glancing) {
            this.glanceSequence(profile, key, volume, rate, pos, damageType);
        } else {
            this.hitSequence(profile, key, volume, rate, pos, damageType);
        };
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

    public screenShake(duration = 128, baseIntensity = 0.0025, trauma = 0.32): void {
        this.trauma = Math.min(this.trauma + trauma, 2.4);
        const intensity = baseIntensity * Math.pow(this.trauma, 1.16);
        // console.log({duration, intensity});
        this.scene.cameras.main.shake(duration, intensity);

        if (this.shakeTimer) this.shakeTimer.destroy();
    
        this.shakeTimer = this.scene.time.addEvent({
            delay: 16,
            callback: () => {
                this.trauma = Math.max(0, this.trauma - 0.0064);
                // console.log({trauma:this.trauma});
                if (this.trauma <= 0) {
                    this.shakeTimer?.destroy();
                    this.shakeTimer = undefined;
                };
            },
            loop: true
        });
    };

    private zoom(zoom: number, duration = 300, ease: any) {
        if (this.zooming) return;
        this.zooming = true;
        const cam = this.scene.cameras.main;
        this.scene.tweens.add({
            targets: cam,
            zoom: cam.zoom * zoom,
            ease, // : Phaser.Math.Easing.Elastic.Out, // Phaser.Math.Easing.Elastic.InOut,
            duration,
            yoyo: true,
            onComplete: () => this.zooming = false
        });
    };

    private parrySequence = (profile: HitProfile, volume: number, rate: number, source: string) => {
        this.scene.sound.play("parry", { volume, rate });
        
        this.zoom(profile.zoom, 256, Phaser.Math.Easing.Quintic.Out);
        this.scene.hud.hitStop(profile.hitStop * 3);
        this.emitParry(source);
    };

    private criticalSequence = (profile: HitProfile, key: string, volume: number, rate: number, pos: Phaser.Math.Vector2, damageType: string) => {
        volume *= randomFloatFromInterval(1.35, 1.5);
        rate *= randomFloatFromInterval(1, 1.25);

        this.scene.sound.play(key, { volume, rate });
        this.screenShake(256, 0.005, 1.1);

        this.scene.time.delayedCall(48, () => {
            this.zoom(profile.zoom, 256, Phaser.Math.Easing.Elastic.Out);
            this.flashScreen(profile.flashColor, 256);
        });
    
        this.scene.time.delayedCall(96, () => {
            this.emitParticles(pos, damageType, true, false, false);
            this.scene.hud.hitStop(profile.hitStop * 2);
        });
    };

    private glanceSequence = (profile: HitProfile, key: string, volume: number, rate: number, pos: Phaser.Math.Vector2, damageType: string) => {
        volume *= randomFloatFromInterval(0.5, 0.75);
        rate *= randomFloatFromInterval(0.75, 1);
        this.scene.sound.play(key, { volume, rate });
        this.screenShake(64, 0.0015);
        
        this.scene.time.delayedCall(24, () => {
            this.scene.hud.hitStop(profile.hitStop * 0.75);
            this.emitParticles(pos, damageType, false, true, false);
        });
    };

    private hitSequence = (profile: HitProfile, key: string, volume: number, rate: number, pos: Phaser.Math.Vector2, damageType: string) => {
        this.scene.sound.play(key, { volume, rate });
        this.screenShake();
        
        this.scene.time.delayedCall(32, () => {
            this.scene.hud.hitStop(profile.hitStop);
            this.emitParticles(pos, damageType, false, false, false);
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

        this.heal = this.scene.add.particles(0, 0, "healing", {
            frame: ["healing_1", "healing_2", "healing_3", "healing_4", "healing_5", "healing_6", "healing_7"],
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0x00FF00, 0x66FF99],
            lifespan: { min: 750, max: 1250 },
            speedY: { min: -25, max: -50 },
            speedX: { min: -25, max: 25 },
            quantity: 8,
            frequency: -1,
            alpha: { start: 0.8, end: 0 },
            scale: { start: 0.02, end: 0.1 },
            // gravityY: -25,
            tint: [0x00FF00, 0x66FF66, 0xAAFFAA]
        }).setScrollFactor(1).setDepth(100).stop();

        
        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillRect(0, 0, 2, 6).generateTexture("parry", 2, 6).destroy();
        this.parry = this.scene.add.particles(0, 0, "parry", {
            x: 0, y: 0,
            blendMode: "ADD",
            color: [0xE0E5E5, 0xCED3D4, 0xC0C6C7, 0xA8B0B2, 0x99A3A3],
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

        this.scene.make.graphics({x:0,y:0}).fillStyle(0xFFFFFF, 1).fillCircle(3, 3, 3).generateTexture("trail", 6, 6).destroy();
        this.trail = this.scene.add.particles(0, 0, "trail", {
            x: 0, y: 0,
            quantity: 100,
            frequency: 20,
            follow: this.scene.player,
            followOffset: {x: 0, y: 16},
            lifespan: 250,
            scale: { start: 0.25, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: masteryNumber(this.scene.player.ascean.master),
            blendMode: "ADD",
            speed: { min: -40, max: 40 },
            angle: { min: 0, max: 360 }
        }).setScrollFactor(1).setDepth(100).stop();

        // this.caerenic = ParticlesAlongBounds(this.scene.player, {
        //     textureKey: "splash",
        //     lifespan: 750,
        //     scale: { start: 0.0, end: 0.03 },
        //     alpha: { start: 1.0, end: 0 },
        //     blendMode: "ADD",
        //     tint: masteryNumber(this.scene.player.ascean.mastery),
        //     spread: 20,
        //     stepRate: 10,
        // }).setScrollFactor(1).setDepth(99)
        // console.log(this.caerenic);
    };

    public emitParticles(pos: Phaser.Math.Vector2, type: string, crit: boolean, glance: boolean, parry: boolean): void {
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
            case "Parry":
                this.parry.explode(count, pos.x, pos.y); // Good
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

    public spotEmit(id: string, type: string): void {
        const entity = this.scene.combatManager.combatant(id);
        if (!entity) return;
        const pos = new Phaser.Math.Vector2(entity.x, entity.y);
        this.emitParticles(pos, type, false, false, false);
    };

    public emitParry(source: string): void {
        const id = source === "player" ? this.scene.player.playerID : this.scene.state.enemyID;
        const entity = this.scene.combatManager.combatant(id);
        if (!entity) return;
        const pos = new Phaser.Math.Vector2(entity.spriteWeapon.x, entity.spriteWeapon.y);
        this.parry.explode(25, pos.x, pos.y);
    };

    public bleed = (pos: Phaser.Math.Vector2): void => {
        this.blood.explode(20, pos.x, pos.y);
    };

    public healing = (pos: Phaser.Math.Vector2): void => {
        this.heal.explode(25, pos.x, pos.y+6);
    };

    private ghost = (entity: Entity, add: number) => {
        let texture, frame;
        if (entity.isLeaping) {
            texture = "player_actions";
            frame = "roll_0";
        } else if (entity.isRushing) {
            texture = "player_attacks";
            frame = "player_attacks_2_0";
        } else {
            texture = "player_slide";
            frame = "player_slide_0";
        };
        
        const ghost = this.scene.add.sprite(entity.x, entity.y, texture, frame);
        ghost.setAlpha(0.4 + add)
            .setDepth(entity.depth - 1)
            .setFlipX(entity.flipX)
            .setScale(0.8)
            .setTint(masteryNumber(entity.ascean.mastery));
        
        this.scene.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: 300,
            onComplete: () => ghost.destroy()
        });
    };

    public trailing = (entity: Entity, on: boolean): void => {
        if (on) {
            const offset = entity.flipX ? 6 : -6;
            let add = 0.0;
            this.trail.updateConfig({followOffset: { x: offset, y: 16 }});
            this.trail.start();
            this.scene.time.addEvent({
                delay: 75,
                callback: () => {
                    add += 0.1;
                    this.ghost(entity, add)
                },
                callbackScope: this,
                repeat: 5,
            });
        } else {
            this.trail.stop();
        };
    };
};