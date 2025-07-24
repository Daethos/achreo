import { randomFloatFromInterval } from "../../models/equipment";
import { Combat } from "../../stores/combat";
import { Play } from "../main";
import { HitProfile, HitProfiles } from "./HitProfiles";
import { screenShake } from "./ScreenShake";

type HitFeedbackContext = {
    // source: "player" | "enemy" | "party";
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
    private particles: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Play) {
        this.scene = scene;
        this.profiles = HitProfiles;
        this.particleCreate();
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
        if (profile.particles) this.emitParticles(pos, critical, glancing, parry);
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

    private particleCreate() {
        const particle = this.scene.make.graphics({x:0,y:0});
        particle.fillStyle(0xFFFFFF, 1);
        particle.fillCircle(3, 3, 3);
        particle.generateTexture("particle", 6, 6);
        particle.destroy();

        this.particles = this.scene.add.particles(0, 0, "particle", {
            x: 0,
            y: 0,
            blendMode: "NORMAL",
            color: [0xFF0000],
            // follow: pos,
            frequency: 100,
            angle: { min: -90 - 45, max: -90 + 45 },
            lifespan: { min: 200, max: 500 },
            quantity: 10,
            alpha: { start: 1, end: 0 },
            scale: { start: 1, end: 0 },
            speed: { min: 100, max: 250 },
            followOffset: { x: -265, y: -165 },
            gravityY: 300,
        }).setScrollFactor(1).setDepth(100).stop();
    }

    private emitParticles(pos: Phaser.Math.Vector2, crit: boolean, glance: boolean, parry: boolean) {
        if (parry) return;
        const count = crit ? 40 : glance ? 10 : 20;
        this.particles.explode(count, pos.x, pos.y);
    };
};