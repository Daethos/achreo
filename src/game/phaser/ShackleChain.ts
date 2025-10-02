// Enhanced Shackle Chain System - TypeScript

import Enemy from "../entities/Enemy";
import { Entity, Play } from "../main";
import ChainLightning, { Lightning, LightningEffect, VisualPattern } from "./ChainLightning";


interface ShackleChain {
    graphics: Phaser.GameObjects.Graphics;
    particles?: Phaser.GameObjects.Particles.ParticleEmitter;
    aura?: Phaser.GameObjects.Graphics;
    flickerTimer?: Phaser.Time.TimerEvent;
    pulseTimer?: Phaser.Time.TimerEvent;
    followTimer?: Phaser.Time.TimerEvent;
    connections: Entity[]; // Track what this chain connects to
};

export class ShackleChainSystem {
    private scene: Play;
    private lightning: ChainLightning;
    private activeShackles: Map<string, ShackleChain[]> = new Map();

    constructor(scene: Play, lightning: ChainLightning) {
        this.scene = scene;
        this.lightning = lightning;
    };

    private setupChainFlicker(config: LightningEffect, chains: ShackleChain[]): void {
        const pattern = config.visualPattern;
        const interval = Array.isArray(pattern.flickerInterval) 
            ? pattern.flickerInterval[0] 
            : pattern.flickerInterval;
        
        if (interval > 0) {
            chains.forEach((chain, index) => {
                const flickerTimer = this.scene.time.addEvent({
                    delay: interval + (index * 100), // Stagger the flickers
                    callback: () => {
                        // Flicker the main chain
                        this.scene.tweens.add({
                            targets: chain.graphics,
                            alpha: [1, 0.2, 1],
                            duration: 100 + (50 * pattern.pulseIntensity),
                            ease: "Power2"
                        });

                        // Flicker aura if present
                        if (chain.aura) {
                            this.scene.tweens.add({
                                targets: chain.aura,
                                alpha: [0.8, 0.1, 0.8],
                                duration: 150,
                                ease: "Power2"
                            });
                        };
                        
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
                        };
                    },
                    repeat: -1
                });
                
                chain.flickerTimer = flickerTimer;
            });
        };
    };

    private setupChainPulse(config: LightningEffect, chains: ShackleChain[]): void {
        const pattern = config.visualPattern;
        
        if (pattern.pulseIntensity > 0) {
            chains.forEach((chain, index) => {
                // Continuous pulsing animation
                const pulseTimer = this.scene.time.addEvent({
                    delay: 800 + (index * 200), // Staggered pulsing
                    callback: () => {
                        // Pulse the chain size
                        this.scene.tweens.add({
                            targets: chain.graphics,
                            scaleX: [1, 1 + (0.2 * pattern.pulseIntensity), 1],
                            scaleY: [1, 1 + (0.2 * pattern.pulseIntensity), 1],
                            duration: 600,
                            ease: "Sine.easeInOut"
                        });

                        // Pulse aura if present
                        if (chain.aura) {
                            this.scene.tweens.add({
                                targets: chain.aura,
                                scaleX: [1, 1 + (0.5 * pattern.pulseIntensity), 1],
                                scaleY: [1, 1 + (0.5 * pattern.pulseIntensity), 1],
                                alpha: [0.8, 0.3, 0.8],
                                duration: 600,
                                ease: "Sine.easeInOut"
                            });
                        };
                    },
                    repeat: -1
                });
                
                chain.pulseTimer = pulseTimer;
            });
        };
    };


    createShackleChains(
        key: string, 
        target: Entity, 
        lightning: Lightning,
        effect: LightningEffect
    ): void {
        if (!effect.visualPattern.chainVisibility) return;

        // Get all potential targets that could be chained
        const chainTargets = this.getChainTargets(target, lightning, effect);
        
        if (chainTargets.length === 0) {
            // If no chain targets, create individual shackles on the target
            this.createIndividualShackles(key, target, effect, lightning);
            return;
        };

        // Create interconnected chain network
        this.createChainNetwork(key, target, chainTargets, lightning, effect);
    };

    private getChainTargets(target: Entity, lightning: Lightning, effect: LightningEffect): Entity[] {
        const chainTargets: Entity[] = [];
        const maxChains = Math.min(effect.visualPattern.chainCount || 3, lightning.config.maxJumps);
        
        let currentTarget = target;
        let currentRange = lightning.currentRange;
        const usedTargets = new Set<number>([target.id]);
        
        // Find potential chain targets
        for (let i = 0; i < maxChains && currentTarget; i++) {
            const nextTarget = this.lightning.findNextTarget(currentTarget, {
                ...lightning,
                currentRange: currentRange,
                hitTargets: usedTargets
            }, false);
            if (nextTarget) {
                chainTargets.push(nextTarget);
                usedTargets.add(nextTarget.id);
                currentTarget = nextTarget;
                currentRange *= lightning.config.rangeReduction;
            } else {
                break;
            };
        };
        
        return chainTargets;
    };

    private createChainNetwork(
        key: string,
        originTarget: Entity,
        chainTargets: Entity[],
        lightning: Lightning,
        effect: LightningEffect
    ): void {
        const allTargets = [originTarget, ...chainTargets];
        const chains: ShackleChain[] = [];
        
        // Create shackle cuffs on each target
        allTargets.forEach(target => {
            const cuffChain = this.createTargetCuff(target, effect, lightning);
            chains.push(cuffChain);
        });
        
        // Create connecting chains between targets
        for (let i = 0; i < allTargets.length - 1; i++) {
            const fromTarget = allTargets[i];
            const toTarget = allTargets[i + 1];
            const connectionChain = this.createConnectionChain(fromTarget, toTarget, effect);
            chains.push(connectionChain);
        };
        
        // For additional binding chains
        this.addBindingChains(allTargets, effect, chains);
        
        // Store all chains
        const chainKey = `${key}_${originTarget.id}`;
        this.activeShackles.set(chainKey, chains);
        
        // Set up visual effects
        this.setupChainFlicker(effect, chains);
        this.setupChainPulse(effect, chains);
        this.setupNetworkFollowing(chains, effect);
        
        // Auto-cleanup
        this.scene.time.delayedCall(effect.duration, () => {
            this.cleanupShackles(chainKey);
        });
    };

    private createTargetCuff(target: Entity, effect: LightningEffect, lightning: Lightning): ShackleChain {
        const graphics = this.scene.add.graphics();
        const { colors, visualPattern } = effect;
        // Create cuff around target
        this.drawTargetCuff(graphics, target, colors, visualPattern);
        
        // Add aura if pulse intensity is high
        let aura: Phaser.GameObjects.Graphics | undefined;
        if (visualPattern.pulseIntensity > 0.5) {
            aura = this.createCuffAura(target, colors, visualPattern);
        };
        
        // Add particles if particle intensity > 0
        let particles: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
        if (visualPattern.particleIntensity > 0) {
            particles = this.createCuffParticles(target, colors, visualPattern);
        };

        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (target && target.health > 0) {
                    const secondArg = effect.statusEffect === "lightning" 
                    ? lightning.currentDamage
                    : (effect.statusEffect === "disease" || effect.statusEffect === "writhe")
                    ? this.scene.player.playerID
                    : (effect.statusEffect === "confuse" || effect.statusEffect === "fear")
                    ? this.scene.player.checkTalentEnhanced(effect.statusEffect)
                    : undefined;
                    (this.scene.combatManager as any)[effect.statusEffect]((target as Enemy).enemyID, secondArg);
                };
            },
            repeat: effect.duration / 1000 - 1,
            callbackScope: this
        });
        
        return {
            graphics,
            aura,
            particles,
            connections: [target]
        };
    };

    private drawTargetCuff(
        graphics: Phaser.GameObjects.Graphics,
        target: Entity,
        colors: { core: number; main: number; glow: number },
        pattern: VisualPattern
    ): void {
        graphics.clear();

        if (!target || !target.body) return;
        
        const cuffRadius = 5 + (5 * pattern.pulseIntensity);
        const glowRadius = cuffRadius * 2;
        
        // Outer glow
        graphics.fillStyle(colors.glow, 0.3 * pattern.pulseIntensity);
        graphics.fillCircle(target.x, target.y, glowRadius);
        
        // Main cuff ring
        graphics.lineStyle(3 * pattern.pulseIntensity, colors.main, 0.9);
        graphics.strokeCircle(target.x, target.y, cuffRadius);
        
        // Inner binding ring
        graphics.lineStyle(1, colors.core, 1);
        graphics.strokeCircle(target.x, target.y, cuffRadius * 0.6);
        
        // Add shackle "teeth" for binding effect
        const teethCount = 8;
        for (let i = 0; i < teethCount; i++) {
            const angle = (Math.PI * 2 / teethCount) * i;
            const innerX = target.x + Math.cos(angle) * (cuffRadius * 0.8);
            const innerY = target.y + Math.sin(angle) * (cuffRadius * 0.8);
            const outerX = target.x + Math.cos(angle) * cuffRadius;
            const outerY = target.y + Math.sin(angle) * cuffRadius;
            
            graphics.lineStyle(2, colors.core, 0.8);
            graphics.lineBetween(innerX, innerY, outerX, outerY);
        };
        
        graphics.setBlendMode(Phaser.BlendModes.ADD);
    };

    private createConnectionChain(
        fromTarget: Entity, 
        toTarget: Entity, 
        effect: LightningEffect
    ): ShackleChain {
        const graphics = this.scene.add.graphics();
        const { colors, visualPattern } = effect;
        
        this.drawConnectionChain(graphics, fromTarget, toTarget, colors, visualPattern);
        
        return {
            graphics,
            connections: [fromTarget, toTarget]
        };
    };

    private drawConnectionChain(
        graphics: Phaser.GameObjects.Graphics,
        fromTarget: Entity,
        toTarget: Entity,
        colors: { core: number; main: number; glow: number },
        pattern: VisualPattern
    ): void {
        graphics.clear();

        if (!fromTarget || !fromTarget.body || !toTarget || !toTarget.body) return;
        
        const distance = Phaser.Math.Distance.Between(fromTarget.x, fromTarget.y, toTarget.x, toTarget.y);
        const linkCount = Math.max(3, Math.floor(distance / 25));
        const chainThickness = 2 + (pattern.pulseIntensity * 2);
        const sag = Math.min(30, distance * 0.2); // Chain sags under its own weight
        
        // Create a curved path for the chain (chains don't stretch perfectly straight)
        const controlY = Math.min(fromTarget.y, toTarget.y) + sag;
        const controlX = (fromTarget.x + toTarget.x) / 2;
        
        // Draw main chain line with curve
        graphics.lineStyle(chainThickness, colors.glow, 0.4);
        this.drawChainCurve(graphics, fromTarget, toTarget, controlX, controlY);
        
        graphics.lineStyle(chainThickness * 0.6, colors.main, 0.8);
        this.drawChainCurve(graphics, fromTarget, toTarget, controlX, controlY);
        
        graphics.lineStyle(1, colors.core, 1);
        this.drawChainCurve(graphics, fromTarget, toTarget, controlX, controlY);
        
        // Add chain links along the curve
        for (let i = 1; i < linkCount; i++) {
            const t = i / linkCount;
            const curvePoint = this.getPointOnCurve(fromTarget, toTarget, controlX, controlY, t);
            
            const linkSize = 4 + (pattern.pulseIntensity * 2);
            graphics.lineStyle(1, colors.main, 0.7);
            graphics.strokeEllipse(curvePoint.x, curvePoint.y, linkSize * 1.5, linkSize);
        };
        
        graphics.setBlendMode(Phaser.BlendModes.ADD);
    };

    private drawChainCurve(
        graphics: Phaser.GameObjects.Graphics,
        from: Entity,
        to: Entity,
        controlX: number,
        controlY: number
    ): void {
        const curve = new Phaser.Curves.QuadraticBezier(
            new Phaser.Math.Vector2(from.x, from.y),
            new Phaser.Math.Vector2(controlX, controlY),
            new Phaser.Math.Vector2(to.x, to.y)
        );
        
        curve.draw(graphics, 32); // 32 points for smooth curve
    };

    private getPointOnCurve(
        from: Entity,
        to: Entity,
        controlX: number,
        controlY: number,
        t: number
    ): { x: number; y: number } {
        // Quadratic bezier curve calculation
        const x = Math.pow(1 - t, 2) * from.x + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * to.x;
        const y = Math.pow(1 - t, 2) * from.y + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * to.y;
        return { x, y };
    };

    private addBindingChains(
        targets: Entity[],
        effect: LightningEffect,
        chains: ShackleChain[]
    ): void {
        // For SHACKLE effect, add additional cross-connections for more binding feel
        if (targets.length >= 3) {
            // Connect first and last targets with additional binding chain
            const bindingChain = this.createConnectionChain(targets[0], targets[targets.length - 1], effect);
            chains.push(bindingChain);
        };
    };

    private createIndividualShackles(
        key: string,
        target: Entity,
        effect: LightningEffect,
        lightning: Lightning
    ): void {
        // Fallback for when no chain targets exist - create individual shackles
        const chains: ShackleChain[] = [];
        const chainCount = effect.visualPattern.chainCount || 3;
        
        for (let i = 0; i < chainCount; i++) {
            const cuff = this.createTargetCuff(target, effect, lightning);
            chains.push(cuff);
        };
        
        this.activeShackles.set(`${key}_${target.id}`, chains);
        
        this.setupChainFlicker(effect, chains);
        this.setupChainPulse(effect, chains);
        
        // Simple following for individual shackles
        const followTimer = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                chains.forEach(chain => {
                    if (chain.connections.length === 1) {
                        this.drawTargetCuff(chain.graphics, chain.connections[0], effect.colors, effect.visualPattern);
                    };
                });
            },
            repeat: -1
        });
        
        this.scene.time.delayedCall(effect.duration, () => {
            followTimer.remove(false);
            this.cleanupShackles(`${key}_${target.id}`);
        });
    };

    private setupNetworkFollowing(
        chains: ShackleChain[],
        effect: LightningEffect
    ): void {
        const followTimer = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                chains.forEach(chain => {
                    if (chain.connections.length === 1) {
                        // Single target cuff - redraw at target position
                        const target = chain.connections[0];
                        if (!target || !target.body) {
                            if (chain.aura) chain.aura.clear();
                            return;
                        };
                        this.drawTargetCuff(chain.graphics, target, effect.colors, effect.visualPattern);
                        
                        // Update aura position
                        if (chain.aura) {
                            chain.aura.clear();
                            chain.aura.fillStyle(effect.colors.glow, 0.2);
                            chain.aura.fillCircle(target.x, target.y, 5 * effect.visualPattern.pulseIntensity);
                        };
                        
                        // Update particle position
                        if (chain.particles) {
                            chain.particles.setPosition(target.x, target.y);
                        };
                    } else if (chain.connections.length === 2) {
                        // Connection chain - redraw between two targets
                        const fromTarget = chain.connections[0];
                        const toTarget = chain.connections[1];
                        this.drawConnectionChain(chain.graphics, fromTarget, toTarget, effect.colors, effect.visualPattern);
                    };
                });
            },
            repeat: -1
        });
        
        // Store the timer for cleanup
        chains[0].followTimer = followTimer;
    };

    private createCuffAura(
        target: Entity,
        colors: { core: number; main: number; glow: number },
        pattern: VisualPattern
    ): Phaser.GameObjects.Graphics {
        const aura = this.scene.add.graphics();
        const auraRadius = 5 * pattern.pulseIntensity;
        
        aura.fillStyle(colors.glow, 0.2 * pattern.pulseIntensity);
        aura.fillCircle(target.x, target.y, auraRadius);
        aura.setBlendMode(Phaser.BlendModes.ADD);
        
        return aura;
    };

    private createCuffParticles(
        target: Entity,
        colors: { core: number; main: number; glow: number },
        pattern: VisualPattern
    ): Phaser.GameObjects.Particles.ParticleEmitter {
        const particles = this.scene.add.particles(target.x, target.y, 'spark', {
            speed: { min: 5, max: 20 * pattern.particleIntensity },
            lifespan: { min: 800, max: 1500 },
            quantity: Math.floor(3 * pattern.particleIntensity),
            scale: { start: 0.2 * pattern.particleIntensity, end: 0 },
            tint: [colors.main, colors.glow, colors.core],
            blendMode: 'ADD',
            frequency: 300 / pattern.particleIntensity
        });
        
        return particles;
    };

    // Keep your existing flicker and pulse methods, but update the cleanup
    private cleanupShackles(chainKey: string): void {
        const chains = this.activeShackles.get(chainKey);
        if (!chains) return;

        chains.forEach(chain => {
            chain.flickerTimer?.remove(false);
            chain.pulseTimer?.remove(false);
            chain.followTimer?.remove(false);
            chain.graphics.destroy();
            chain.aura?.destroy();
            chain.particles?.destroy();
        });

        this.activeShackles.delete(chainKey);
    };
};