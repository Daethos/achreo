import Enemy from "../entities/Enemy";
import Player from "../entities/Player";
import { Entity, Play } from "../main";
import { ShackleChainSystem } from "./ShackleChain";

// Visual Pattern Definitions
export type VisualPattern = {
    flickerInterval: number | number[]; // Single value or array for random intervals
    pulseIntensity: number;              // Scale factor for pulsing effect
    chainVisibility: boolean;           // Whether chains are visible
    particleIntensity: number;          // Intensity of particle effects
    chainCount?: number;                // Number of chains (for shackle effect)
};
const VISUAL_PATTERNS: {[key:string]: VisualPattern} = {
    burst: {
        flickerInterval: 0,
        pulseIntensity: 1.0,
        chainVisibility: true,
        particleIntensity: 1.0
    },
    pulsing_chains: {
        flickerInterval: 400,
        pulseIntensity: 0.7,
        chainVisibility: true,
        particleIntensity: 0.5,
        chainCount: 3
    },
    chaotic_flicker: {
        flickerInterval: [100, 300, 200, 500], // Random intervals
        pulseIntensity: 1.2,
        chainVisibility: true,
        particleIntensity: 0.8
    },
    steady_pulse: {
        flickerInterval: 800,
        pulseIntensity: 0.6,
        chainVisibility: true,
        particleIntensity: 0.4
    },
    erratic_spark: {
        flickerInterval: [150, 250, 400, 100],
        pulseIntensity: 0.9,
        chainVisibility: true,
        particleIntensity: 0.7
    },
    intense_flash: {
        flickerInterval: 200,
        pulseIntensity: 1.5,
        chainVisibility: true,
        particleIntensity: 1.2
    }
};

// Gold
const GOLD_COLORS = {
    core: 0xFFFFCC,  // Light cream
    main: 0xFFD700,  // Classic gold
    glow: 0xFF8C00   // Orange-gold
};

// Earthy Green
const EARTHY_GREEN_COLORS = {
    core: 0xE6FFE6,  // Very light green
    main: 0x228B22,  // Forest green
    glow: 0x006400   // Dark green
};

// Earthy Brown
const EARTHY_BROWN_COLORS = {
    core: 0xFFF8DC,  // Cornsilk
    main: 0x8B4513,  // Saddle brown
    glow: 0x654321   // Dark brown
};

// Purple
const PURPLE_COLORS = {
    core: 0xFFFFFF,  // White
    main: 0x8000FF,  // Electric purple
    glow: 0x4000FF   // Deep purple
};

// Fire
// const FIRE_COLORS = {
//     core: 0xFFFFFF,  // White hot
//     main: 0xFF4500,  // Red-orange
//     glow: 0xDC143C   // Crimson
// };

// Wind
// const WIND_COLORS = {
//     core: 0xF0FFFF,  // Azure
//     main: 0x87CEEB,  // Sky blue
//     glow: 0x4682B4   // Steel blue
// };

// Shades of White
const WHITE_COLORS = {
    core: 0xFFFFFF,  // Pure white
    main: 0xfdf6d8, //  0xF8F8FF,  // Ghost white
    glow: 0xF8F8FF, // Glow white 0xE0E0E0   // Light gray
};

// Alternative variations for more variety:

// Rich Gold (more luxurious)
// const RICH_GOLD_COLORS = {
//     core: 0xFFFACD,  // Lemon chiffon
//     main: 0xDAA520,  // Goldenrod
//     glow: 0xB8860B   // Dark goldenrod
// };

// Nature Green (more vibrant)
// const NATURE_GREEN_COLORS = {
//     core: 0xF0FFF0,  // Honeydew
//     main: 0x32CD32,  // Lime green
//     glow: 0x2E8B57   // Sea green
// };

// Deep Earth Brown
const DEEP_EARTH_COLORS = {
    core: 0xFAF0E6,  // Linen
    main: 0xA0522D,  // Sienna
    glow: 0x8B4513   // Saddle brown
};

// Frosty Blue
const FROSTY_BLUE_COLORS = {
    core: 0xF0F8FF,  // Alice blue
    main: 0x4682B4,  // Steel blue
    glow: 0x5F9EA0   // Cadet blue
};

// Mystical Blue
const MYSTICAL_BLUE_COLORS = {
    core: 0xE0FFFF,  // Light cyan
    main: 0x00BFFF,  // Deep sky blue
    glow: 0x0000CD   // Medium blue
};

// Mystical Purple
const MYSTICAL_PURPLE_COLORS = {
    core: 0xE6E6FA,  // Lavender
    main: 0x9370DB,  // Medium purple
    glow: 0x663399   // Rebecca purple
};

// Inferno Fire
const INFERNO_COLORS = {
    core: 0xFFFACD,  // Lemon chiffon (hottest part)
    main: 0xFF6347,  // Tomato
    glow: 0x8B0000   // Dark red
};

// Storm Wind
const STORM_WIND_COLORS = {
    core: 0xF5FFFA,  // Mint cream
    main: 0x00BFFF,  // Deep sky blue
    glow: 0x1E90FF   // Dodger blue
};

// Ice/Snow White
const ICE_WHITE_COLORS = {
    core: 0xFFFFFF,  // Pure white
    main: 0xF0F8FF,  // Alice blue
    glow: 0xB0C4DE   // Light steel blue
};

// Lightning Blue
const LIGHTNING_BLUE_COLORS = {
    core: 0xE0FFFF,  // Light cyan
    main: 0x00FFFF,  // Cyan
    glow: 0x1E90FF   // Dodger blue
};
// Effect Type Definitions
// type LIGHTNING_EFFECT_TYPE = "DAMAGE" | "SNARE" | "FEAR" | "SLOW" | "CONFUSE" | "PARALYZE" | "DISEASE" | "FREEZE" | "POLYMORPH" | "RENEWAL" | "ROOT" | "BURN" | "WRITHE";
export type LightningEffect = {
    name: string;
    colors: { core: number; main: number; glow: number; };
    visualPattern: VisualPattern;
    duration: number;
    statusEffect: string;
    [key: string]: any;
};
export const LIGHTNING_MASTERY: {[key: string]: string[]} = {
    achre: ["DAMAGE", "FREEZE", "SLOW"],
    constitution: ["DAMAGE", "DISEASE", "PARALYZE"], // , "RENEWAL"
    caeren: ["DAMAGE", "FEAR", "WRITHE"],
    kyosir: ["DAMAGE", "CONFUSE", "DISEASE"], // , "RENEWAL"
};
// Predefined Lightning Effects
// keyof typeof LIGHTNING_EFFECT_TYPE
const LIGHTNING_EFFECTS: {[key:string]: LightningEffect} = {
    DAMAGE: { // Achre / Con / Kyo
        name: "Lightning Strike",
        colors: LIGHTNING_BLUE_COLORS,
        visualPattern: VISUAL_PATTERNS.burst,
        duration: 3000,
        statusEffect: "lightning"
    },
    SNARE: { // Ach
        name: "Lightning Shackles",
        colors: ICE_WHITE_COLORS,
        visualPattern: VISUAL_PATTERNS.pulsing_chains,
        duration: 3000,
        statusEffect: "snare"
    },
    DISEASE: { // Con / Kyo
        name: "Plague Lightning",
        colors: EARTHY_GREEN_COLORS,
        visualPattern: VISUAL_PATTERNS.chaotic_flicker,
        duration: 3000,
        statusEffect: "disease"
    },
    FEAR: { // Caer
        name: "Terror Lightning",
        colors: PURPLE_COLORS,
        visualPattern: VISUAL_PATTERNS.chaotic_flicker,
        duration: 3000,
        statusEffect: "fear"
    },
    FREEZE: { // Ach
        name: "Frost Lightning",
        colors: FROSTY_BLUE_COLORS,
        visualPattern: VISUAL_PATTERNS.burst,
        duration: 3000,
        statusEffect: "freeze"
    },
    POLYMORPH: { // Ach
        name: "Mystic Lightning",
        colors: MYSTICAL_BLUE_COLORS,
        visualPattern: VISUAL_PATTERNS.burst,
        duration: 3000,
        statusEffect: "polymorph"
    },
    RENEWAL: { // Con / Kyo
        name: "Healing Lightning",
        colors: WHITE_COLORS,
        visualPattern: VISUAL_PATTERNS.burst,
        duration: 3000,
        statusEffect: "heal"
    },
    ROOT: { // Ach
        name: "Earth Lightning",
        colors: EARTHY_BROWN_COLORS,
        visualPattern: VISUAL_PATTERNS.steady_pulse,
        duration: 3000,
        statusEffect: "root"
    },
    SLOW: { // Ach
        name: "Frost Lightning",
        colors: STORM_WIND_COLORS,
        visualPattern: VISUAL_PATTERNS.steady_pulse,
        duration: 3000,
        statusEffect: "slow"
    },
    CONFUSE: { // Kyo
        name: "Mind Lightning",
        colors: GOLD_COLORS,
        // colors: { core: 0xFFFF80, main: 0xFF80FF, glow: 0x8040FF },
        visualPattern: VISUAL_PATTERNS.erratic_spark,
        duration: 3000,
        statusEffect: "confuse"
    },
    PARALYZE: { // Con
        name: "Shock Lightning",
        colors: DEEP_EARTH_COLORS,
        visualPattern: VISUAL_PATTERNS.intense_flash,
        duration: 3000,
        statusEffect: "paralyze"
    },
    BURN: {
        name: "Inferno Lightning",
        colors: INFERNO_COLORS,
        visualPattern: VISUAL_PATTERNS.burst,
        duration: 3000,
        statusEffect: "burn"
    },
    WRITHE: {
        name: "Spiritual Lightning",
        colors: MYSTICAL_PURPLE_COLORS,
        visualPattern: VISUAL_PATTERNS.pulsing_chains,
        duration: 3000,
        statusEffect: "writhe"
    },
};

export type ChainLightningConfig = {
    maxJumps: number;          // Maximum number of jumps
    jumpRange: number;         // Maximum range for each jump
    baseDamage: number;        // Damage of the first hit
    damageReduction: number;   // Multiplier for damage reduction per jump
    rangeReduction: number;    // Multiplier for range reduction per jump
    jumpDelay: number;         // Delay between jumps in ms
    visualDuration: number;    // Duration of visual effects
};
export type Lightning = {
    config: ChainLightningConfig;
    caster: Entity;
    lightningArcs: Phaser.GameObjects.Graphics[];
    hitTargets: Set<number>;
    currentJump: number;
    currentDamage: number;
    currentRange: number;
    lastTarget?: Entity;
    rebound: boolean;
    harm: boolean;
};
// Chain Lightning Implementation
class ChainLightning {
    private scene: Play;
    private lightning: Map<string, Lightning>; // Store visual elements
    private shackleSystem: ShackleChainSystem;

    constructor(scene: Play) {
        this.scene = scene;
        this.lightning = new Map(); // Store visual elements
        this.shackleSystem = new ShackleChainSystem(scene, this);
    };

    public startJump(caster: Entity, initialTarget: Entity, config: ChainLightningConfig = { maxJumps: 5, jumpRange: 150, baseDamage: 100,  damageReduction: 0.8, rangeReduction: 0.9, jumpDelay: 200, visualDuration: 800, }, harm: boolean = true) {
        const lightningConfig: Lightning = { config, caster, lightningArcs: [], hitTargets: new Set(), currentJump: 0, currentDamage: config.baseDamage, currentRange: config.jumpRange, lastTarget: undefined, rebound: this.scene.player.checkTalentEnhanced("lightning"), harm };
        if (this.lightning.has(caster.name)) {

        };
        this.lightning.set(caster.name, lightningConfig);
        this.executeJump(caster, initialTarget, lightningConfig);
    };

    public startChain(caster: Entity, initialTarget: Entity, config: ChainLightningConfig, type: string, harm: boolean) {
        // this.executeChain(caster, initialTarget, config, type);
        const lightningConfig: Lightning = {
            config,
            caster,
            lightningArcs: [],
            hitTargets: new Set(),
            currentJump: 0,
            currentDamage: config.baseDamage,
            currentRange: config.jumpRange,
            lastTarget: undefined,
            rebound: this.scene.player.checkTalentEnhanced("lightning"),
            harm
        };
        const effect = LIGHTNING_EFFECTS[type];
        this.shackleSystem.createShackleChains(type, initialTarget, lightningConfig, effect);
    };
    
    private executeJump(caster: Entity, target: Entity, config: Lightning) {
        if (!target || config.currentJump >= config.config.maxJumps || config.hitTargets.has(target.id)) {
            this.onChainComplete(config);
            return;
        };
        
        // Hit the current target
        this.hitTarget(target, config);
        config.hitTargets.add(target.id);
        
        // Create visual arc (if not the first target)
        if (config.currentJump === 0) {
            this.createLightningArc(caster, target, config);
        } else if (config.currentJump > 0 && config.lastTarget) {
            this.createLightningArc(config.lastTarget, target, config);
        };
        
        // Find next target
        const nextTarget = this.findNextTarget(target, config);
        config.lastTarget = target;
        config.currentJump++;
        
        // Reduce damage and range for next jump
        config.currentDamage *= config.config.damageReduction;
        config.currentRange *= config.config.rangeReduction;
        
        if (nextTarget) {
            // Delay the next jump for dramatic effect
            this.scene.time.delayedCall(config.config.jumpDelay, () => {
                this.executeJump(caster, nextTarget, config);
            });
        } else {
            this.onChainComplete(config);
        };
    };
    
    hitTarget(target: Entity, config: Lightning) {
        if (config.harm) {
            this.applyDamage(config.caster, target, Math.round(config.currentDamage));
        } else {
            this.applyHealing(target, config.currentDamage);
        };
        this.createHitEffect(target);
        this.scene.sound.play("lightning", { volume: this.scene.hud.settings.volume });
    };
    
    findNextTarget(currentTarget: Entity, config: Lightning, rebound: boolean = false): Entity | null {
        const potentialTargets = this.getPotentialTargets(currentTarget, config, rebound);
        
        if (potentialTargets.length === 0) return null;
        
        // Sort by distance and return closest
        return potentialTargets
            .filter(target => !config.hitTargets.has(target.id))
            .sort((a, b) => {
                const distA = Phaser.Math.Distance.Between(currentTarget.x, currentTarget.y, a.x, a.y);
                const distB = Phaser.Math.Distance.Between(currentTarget.x, currentTarget.y, b.x, b.y);
                return distA - distB;
            })[0];
    };
    
    getPotentialTargets(currentTarget: Entity, config: Lightning, rebound: boolean = false): Entity[] {
        // Get all valid targets within jump range
        const allTargets = this.getAllValidTargets(config.caster);
        
        return allTargets.filter(target => {
            if (config.hitTargets.has(target.id) && rebound === false) return false;
            if (target === currentTarget) return false;
            
            const distance = Phaser.Math.Distance.Between(
                currentTarget.x, currentTarget.y,
                target.x, target.y
            );
            
            return distance <= config.currentRange;
        });
    };
    
    getAllValidTargets(caster: Entity): Entity[] {
        // Customize based on your game's target system
        let targets = [];
        
        // Example: Get all enemies if caster is player
        if (caster.name === "player") {
            targets = this.scene.enemies.filter(enemy => 
                !enemy.isDeleting && 
                enemy.health > 0 &&
                enemy.visible
            );
        } else {
            // Enemy casting - target player and allies
            targets = [this.scene.player];
            if (this.scene.party) {
                targets = targets.concat(this.scene.party.filter(p => !p.isDeleting && p.health > 0));
            };
        };
        
        return targets;
    };
    
    createLightningArc(fromTarget: Entity, toTarget: Entity, config: Lightning, colorOverride?: { core: number; main: number; glow: number; }) {
        const graphics = this.scene.add.graphics();
        
        // Create jagged lightning path
        const path = this.generateLightningPath(fromTarget, toTarget);
        
        // Draw all layers in one graphics object
        // Outer glow (drawn first, appears behind)
        graphics.lineStyle(6, colorOverride ? colorOverride.glow : 0x004080, 0.3);
        graphics.strokePoints(path);
        
        // Main lightning
        graphics.lineStyle(3, colorOverride ? colorOverride.main : 0x00FFFF, 0.9);
        graphics.strokePoints(path);
        
        // Core highlight
        graphics.lineStyle(1, colorOverride ? colorOverride.core : 0xFFFFFF, 1);
        graphics.strokePoints(path);
        
        // Add glow effect
        graphics.setBlendMode(Phaser.BlendModes.ADD);
        
        // Store for cleanup
        config.lightningArcs.push(graphics);
        
        // Fade out the arc
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: config.config.visualDuration,
            onComplete: () => {
                graphics.destroy();
                const index = config.lightningArcs.indexOf(graphics);
                if (index > -1) config.lightningArcs.splice(index, 1);
            }
        });
        
        // Lightning flicker effect
        this.scene.tweens.add({
            targets: graphics,
            scaleX: [1, 1.2, 0.8, 1.1, 1],
            scaleY: [1, 1.2, 0.8, 1.1, 1],
            duration: config.config.visualDuration / 2,
            ease: "Power2",
            yoyo: true
        });
    };
    
    generateLightningPath(from: Entity, to: Entity) {
        const points = [{ x: from.x, y: from.y }];
        const segments = 8;
        const jaggedness = 20;
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const x = Phaser.Math.Linear(from.x, to.x, t);
            const y = Phaser.Math.Linear(from.y, to.y, t);
            
            // Add random offset for jagged effect
            const offsetX = (Math.random() - 0.5) * jaggedness;
            const offsetY = (Math.random() - 0.5) * jaggedness;
            
            points.push({ x: x + offsetX, y: y + offsetY });
        };
        
        points.push({ x: to.x, y: to.y });
        return points;
    };

    createShackleChains(target: Entity, config: LightningEffect) {
        const chains = [];
        const chainCount = config.visualPattern?.chainCount || 3;
        const colors = config.colors;
        
        for (let i = 0; i < chainCount; i++) {
            const chain = this.scene.add.graphics();
            const angle = (Math.PI * 2 / chainCount) * i;
            const radius = 10 + (i * 10);
            
            // Create chain link pattern
            this.drawChainLink(chain, target.x, target.y, angle, radius, colors);
            chain.setBlendMode(Phaser.BlendModes.ADD);
            chains.push(chain);
            
            // Rotating animation
            this.scene.tweens.add({
                targets: chain,
                rotation: Math.PI * 2,
                duration: 2000 + (i * 500),
                repeat: -1,
                ease: "Linear"
            });
        };
        
        // Set up pulsing flicker
        this.createChainFlicker(config, chains);
    };

    createChainFlicker(config: LightningEffect, chains: Phaser.GameObjects.Graphics[]) {
        const pattern = config.visualPattern;
        const interval = Array.isArray(pattern.flickerInterval) 
            ? pattern.flickerInterval[0] 
            : pattern.flickerInterval;
        
        if (interval > 0) {
            const flickerTimer = this.scene.time.addEvent({
                delay: interval,
                callback: () => {
                    chains.forEach(chain => {
                        // Flicker effect
                        this.scene.tweens.add({
                            targets: chain,
                            alpha: [1, 0.3, 1],
                            duration: 150,
                            ease: "Power2"
                        });
                    });
                    
                    // Vary interval for chaotic patterns
                    if (Array.isArray(pattern.flickerInterval)) {
                        const nextInterval = pattern.flickerInterval[
                            Math.floor(Math.random() * pattern.flickerInterval.length)
                        ];
                        flickerTimer.reset({
                            delay: nextInterval,
                            callback: flickerTimer.callback,
                            callbackScope: flickerTimer.callbackScope,
                            repeat: -1
                        });
                    }
                },
                repeat: -1
            });
            
            // Stop flicker after duration
            this.scene.time.delayedCall(config.duration, () => {
                flickerTimer.remove(false);
                chains.forEach(chain => chain.destroy());
            });
        };
    };
    
    drawChainLink(graphics: Phaser.GameObjects.Graphics, centerX: number, centerY: number, angle: number, radius: number, colors: { main: number; glow: number; core: number; }) {
        const linkCount = 8;
        const linkSize = 6;
        
        graphics.lineStyle(2, colors.glow, 0.8);
        
        for (let i = 0; i < linkCount; i++) {
            const linkAngle = angle + (Math.PI * 2 / linkCount) * i;
            const x = centerX + Math.cos(linkAngle) * radius;
            const y = centerY + Math.sin(linkAngle) * radius;
            
            // Draw individual chain links
            graphics.strokeCircle(x, y, linkSize);
            
            // Connect links
            if (i > 0) {
                const prevAngle = angle + (Math.PI * 2 / linkCount) * (i - 1);
                const prevX = centerX + Math.cos(prevAngle) * radius;
                const prevY = centerY + Math.sin(prevAngle) * radius;
                
                graphics.lineStyle(1, colors.main, 0.6);
                graphics.lineBetween(prevX, prevY, x, y);
                graphics.lineStyle(2, colors.glow, 0.8);
            };
        };
    };
    
    createHitEffect(target: Entity) {
        const sparks = this.scene.add.particles(target.x, target.y, "spark", {
            speed: { min: 50, max: 150 },
            lifespan: 400,
            quantity: 8,
            scale: { start: 0.3, end: 0 },
            tint: 0x00FFFF,
            blendMode: "ADD"
        });
        
        this.scene.time.delayedCall(500, () => sparks.destroy());
        
        this.scene.cameras.main.flash(80, 0, 150, 255, false);
    };
    
    applyDamage(caster: Entity, target: Entity, power: number) {
        // console.log({ caster, target, power });
        (caster as Player).playerMachine.chiomism((target as Enemy).enemyID, power, "lightning");
    };

    applyHealing(target: Entity, power: number) {
        // Will Heal Party Eventually.
        (target as Enemy).getHeal(power / 300, "chain heals");
        // this.scene.combatManager.renewal((target as Enemy).enemyID);
    };
    
    onChainComplete(config: Lightning) {
        // console.log(`Chain Lightning complete! Hit ${config.hitTargets.size} targets over ${config.currentJump} jumps.`);
        
        // Cleanup any remaining arcs after a delay
        this.scene.time.delayedCall(config.config.visualDuration * 2, () => {
            config.lightningArcs.forEach(arc => arc.destroy());
            config.lightningArcs = [];
        });

        // Additional cleanup or effects can be added here
        config.hitTargets.clear();
        config.currentJump = 0;
        config.currentDamage = config.config.baseDamage;
        config.currentRange = config.config.jumpRange;
        config.lastTarget = undefined;
    };

    public castShackle(caster: Entity, target: Entity, type: string, harm: boolean = true) {
        this.startChain(caster, target, {
            maxJumps: 4,
            baseDamage: 25,
            jumpRange: 150,
            damageReduction: 1,
            rangeReduction: 0.8,
            jumpDelay: 50,
            visualDuration: 500
        }, type as "DAMAGE" | "SNARE" | "FEAR" | "SLOW" | "CONFUSE" | "PARALYZE", harm);
        // Apply snare effect to initial target
        // (target as Enemy).applyStatusEffect("snared", 5000);
    };

    // Basic Chain Lightning
    public castLightning(caster: Entity, target: Entity, harm: boolean) {
        this.startJump(caster, target, {
            maxJumps: 4,
            baseDamage: 120,
            jumpRange: 150,
            damageReduction: 0.75,
            rangeReduction: 0.9,
            jumpDelay: 250,
            visualDuration: 600
        }, harm);
    };

    // Upgraded Chain Lightning (more jumps, less falloff)
    public castGreaterLightning(caster: Entity, target: Entity, harm: boolean) {
        this.startJump(caster, target, {
            maxJumps: 8,
            baseDamage: 200,
            jumpRange: 200,
            damageReduction: 0.85, // Less damage falloff
            rangeReduction: 0.95,   // Less range falloff
            jumpDelay: 200,
            visualDuration: 800   
        }, harm);
    };

    // AoE Chain Lightning (hits multiple initial targets)
    public castAoELightning(caster: Entity, centerPoint: Phaser.Math.Vector2, radius = 150, harm: boolean = true) {
        const initialTargets = this.getTargetsInRadius(centerPoint, radius);
        
        initialTargets.forEach((target: Entity, index: number) => {
            // Stagger the chains for visual effect
            this.scene.time.delayedCall(index * 100, () => {
                this.startJump(caster, target, {
                    maxJumps: 3,
                    baseDamage: 80,
                    jumpRange: 180,
                    damageReduction: 0.7,
                    rangeReduction: 0.9,
                    jumpDelay: 200,
                    visualDuration: 500
                }, harm);
            });
        });
    };

    public getTargetsInRadius(center: Phaser.Math.Vector2, radius: number): Entity[] {
        return this.scene.enemies.filter(enemy => {
            const distance = Phaser.Math.Distance.Between(
                center.x, center.y, 
                enemy.x, enemy.y
            );
            return distance <= radius && !enemy.isDeleting && enemy.health > 0;
        });
    };
};

export default ChainLightning;