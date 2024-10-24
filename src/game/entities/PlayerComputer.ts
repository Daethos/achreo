import Ascean from "../../models/ascean";
import { SPECIAL, TRAIT_SPECIALS } from "../../utility/abilities";
import { fetchTrait } from "../../utility/ascean";
import { DURATION } from "../../utility/enemy";
import { PLAYER, staminaCheck } from "../../utility/player";
import { Particle } from "../matter/ParticleManager";
import { States } from "../phaser/StateMachine";
import { Arena } from "../scenes/Arena";
import { Underground } from "../scenes/Underground";
import Enemy from "./Enemy";
import Player from "./Player";

export default class PlayerComputer extends Player {
    combatConcerns: Phaser.Time.TimerEvent | undefined;
    combatSpecials: any[];
    constructor(data: any) {
        const { scene } = data;
        const ascean = scene.registry.get("ascean");
        super({...data,name:"player",ascean,health:ascean?.health?.current || scene.state.newPlayerHealth});
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {}; // For Leashing
        this.isComputer = true;
        this.combatConcerns = undefined;
        this.checkSpecials(ascean);
        this.scene.registry.set("player", this);
    };

    completeReset = () => {
        this.specials = false;
        this.isCasting = false;
        this.isMoving = false;
        this.setVelocity(0);
    };
    
    checkSpecials(ascean: Ascean) {
        const traits = {
            primary: fetchTrait(this.scene.hud.gameState?.traits.primary.name),
            secondary: fetchTrait(this.scene.hud.gameState?.traits.secondary.name),
            tertiary: fetchTrait(this.scene.hud.gameState?.traits.tertiary.name),
        };
        const potential = [traits.primary.name, traits.secondary.name, traits.tertiary.name];
        let mastery = SPECIAL[ascean.mastery as keyof typeof SPECIAL];
        mastery = mastery.filter((m) => {
            return m !== 'Mark' && m !== 'Recall' && m !== 'Consume';
        })
        let extra: any[] = [];
        for (let i = 0; i < 3; i++) {
            const trait = TRAIT_SPECIALS[potential[i] as keyof typeof TRAIT_SPECIALS];
            if (trait && trait.length > 0) {
                extra = [ ...extra, ...trait ]
            };
        };
        if (extra.length > 0) {
            let start = [...mastery, ...extra];
            start.sort();
            this.combatSpecials = start;
        } else {
            this.combatSpecials = [...mastery];
        };
    };
    
    setSpecialCombat = (mult = 0.6, remove = false) => {
        if (remove) {
            return;
        };
        this.scene.time.delayedCall(DURATION.SPECIAL * mult, () => {
            if (!this.inCombat) return;
            if (this.isCasting === true || this.isSuffering() || this.isContemplating) {
                this.setSpecialCombat(0.2);
                return;
            };
            const special = this.combatSpecials[Math.floor(Math.random() * this.combatSpecials.length)].toLowerCase();
            this.setVelocity(0);
            this.isMoving = false;
            if (this.playerMachine.stateMachine.isState(special)) {
                // console.log(`%c Special: ${special}`, 'color:gold');
                this.playerMachine.stateMachine.setState(special);
            } else if (this.playerMachine.positiveMachine.isState(special)) {
                // console.log(`%c  Special: ${special}`, 'color:fuchsia');
                this.playerMachine.positiveMachine.setState(special);
            };
            this.setSpecialCombat();
        }, undefined, this);
    };

    checkEvasion = (particle: Particle) => {
        const particleVector = new Phaser.Math.Vector2(particle.effect.x, particle.effect.y);
        const playerVector = new Phaser.Math.Vector2(this.x, this.y);
        const particleDistance = particleVector.subtract(playerVector);
        if (particleDistance.length() < (50) && !this.isPosted && !this.isCasting) { // 50 || 100
            return true;
        };
        return false;
    };
    
    currentParticleCheck = () => {
        if (!this.particleEffect?.triggered) this.scene.particleManager.updateParticle(this.particleEffect as Particle);
        if (this.particleEffect?.success) {
            this.particleEffect.triggered = true;
            this.particleEffect.success = false;
            this.playerActionSuccess();
        } else if (this.particleEffect?.collided) {
            this.scene.particleManager.removeEffect(this.particleEffect?.id as string);
            this.particleEffect = undefined;              
        };
    };

    getEnemyParticle = () => {
        return this.currentTarget?.particleEffect
            ? this.scene.particleManager.getEffect(this.currentTarget?.particleEffect.id)
            : undefined;
    };

    isUnderRangedAttack = () => {
        const player = this.getEnemyParticle();
        if (!player) return false;
        return (this.currentTarget?.isRanged && this.checkEvasion(player) && !this.playerMachine.stateMachine.isCurrentState(States.EVADE));
    };

    checkLineOfSight() {
        const line = new Phaser.Geom.Line(this.currentTarget?.x, this.currentTarget?.y, this.x, this.y);
        const points = line.getPoints(30);  // Adjust number of points based on precision
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const layer = (this.scene as Arena | Underground).groundLayer;
            const tile = this.scene.map.getTileAtWorldXY(point.x, point.y, false, this.scene.cameras.main, layer);
            if (tile && (tile.properties.collides || tile.properties.wall)) {
                return true;  // Wall is detected
            };
        };
        return false;  // Clear line of sight
    };

    evaluateCombatDistance = () => {
        this.getDirection();
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            if (this.inCombat && (!this.scene.state.computer || this.scene.state.enemyID !== this.currentTarget.enemyID)) {
                this.scene.setupEnemy(this.currentTarget);
            };
        };
        if (this.isDefeated && !this.playerMachine.stateMachine.isCurrentState(States.DEFEATED)) {
            this.isDefeated = false;
            this.playerMachine.stateMachine.setState(States.DEFEATED);
            return;
        };
        if (this.playerMachine.stateMachine.isCurrentState(States.LEASH) || this.playerMachine.stateMachine.isCurrentState(States.DEFEATED)) {
            return;
        };
        if (!this.inCombat || this.isCasting || this.isPraying || this.isContemplating || this.scene.state.newPlayerHealth <= 0) {
            // console.log(`Casting: ${this.isCasting} | Contemplating: ${this.isContemplating}`);
            this.isMoving = false;
            this.setVelocity(0);
            return;    
        };
        if (this.isSuffering() || !this.currentTarget || !this.currentTarget.body || this.playerMachine.stateMachine.isCurrentState(States.CHASE) || this.playerMachine.stateMachine.isCurrentState(States.EVADE)) {
            // console.log(`Suffering: ${this.isSuffering()} | Chase: ${this.playerMachine.stateMachine.isCurrentState(States.CHASE)} | Evasion: ${this.playerMachine.stateMachine.isCurrentState(States.EVADE)}`);
            return;
        };
        
        let direction = this.currentTarget.position.subtract(this.position);
        const distanceY = Math.abs(direction.y);
        const multiplier = this.rangedDistanceMultiplier(PLAYER.DISTANCE.RANGED_MULTIPLIER);
        
        if (this.isUnderRangedAttack()) { // Switch to EVADE the Enemy
            // console.log('Entering EVADE Under Ranged Attack');
            this.playerMachine.stateMachine.setState(States.EVADE);
            return;
        } else if (direction.length() >= PLAYER.DISTANCE.CHASE * multiplier) { // Switch to CHASE the Enemy
            this.playerMachine.stateMachine.setState(States.CHASE);
            return;
        } else if (this.isRanged) { // Contiually Checking Distance for RANGED ENEMIES.
            if (!this.computerAction && !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_COMBAT)) {
                // console.log('Entering COMPUTER COMBAT isRanged');
                this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
                return;    
            };
            if (distanceY > PLAYER.DISTANCE.RANGED_ALIGNMENT) {
                direction.normalize();
                this.setVelocityY(direction.y * this.speed + 0.5); // 2 || 4
            };
            if (this.currentTarget.position.subtract(this.position).length() > PLAYER.DISTANCE.THRESHOLD * multiplier) { // 225-525 
                direction.normalize();
                this.setVelocityX(direction.x * this.speed + 0.25); // 2.25
                this.setVelocityY(direction.y * this.speed + 0.25); // 2.25          
            } else if (this.currentTarget.position.subtract(this.position).length() < PLAYER.DISTANCE.THRESHOLD && !this.currentTarget.isRanged) { // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
                if (Phaser.Math.Between(1, 250) === 1 && !this.playerMachine.stateMachine.isCurrentState(States.EVADE)) {
                    // console.log('Entering EVADE 1 in 250 Chance!');
                    this.playerMachine.stateMachine.setState(States.EVADE);
                    return;
                } else {
                    direction.normalize();
                    this.setVelocityX(direction.x * -this.speed + 0.5); // -2.25 | -2 | -1.75
                    this.setVelocityY(direction.y * -this.speed + 0.5); // -1.5 | -1.25
                };
            } else if (this.checkLineOfSight() && !this.playerMachine.stateMachine.isCurrentState(States.EVADE)) {
                // console.log('Entering EVADE Line of Sight!');
                this.playerMachine.stateMachine.setState(States.EVADE);
                return;
            } else if (distanceY < 15) { // The Sweet Spot for RANGED ENEMIES.
                this.setVelocity(0);
                this.anims.play('player_idle', true);
            } else { // Between 75 and 225 and outside y-distance
                direction.normalize();
                this.setVelocityY(direction.y * this.speed + 0.5); // 2.25
            };
        } else { // Melee || Contiually Maintaining Reach for MELEE ENEMIES.
            this.isPosted = true;
            if (!this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_COMBAT)) {
                // console.log('Entering COMPUTER COMBAT from Melee');
                this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
                return;
            };
            if (direction.length() > PLAYER.DISTANCE.ATTACK) { 
                // console.log('Getting Closer to the Enemy');
                direction.normalize();
                this.setVelocityX(direction.x * (this.speed + 0.25)); // 2.5
                this.setVelocityY(direction.y * (this.speed + 0.25)); // 2.5
                this.isPosted = false;
            } else { // Inside melee range
                // console.log('Inside Melee Range');
                this.setVelocity(0);
                this.anims.play('player_idle', true);
            };
        };
    };
    
    evaluateCombat = () => {
        if (this.isCasting || this.isPraying || this.isSuffering() || this.health <= 0) return;
        let actionNumber = Math.floor(Math.random() * 101);
        let action = '';
        if (actionNumber > 70) { // 71-100 (30%)
            action = States.COMPUTER_ATTACK;
        } else if (actionNumber > 55) { // 56-70 (15%)
            action = States.COMPUTER_POSTURE;
        } else if (actionNumber > 40 && !this.isRanged) { // 41-55 (15%)
            action = States.ROLL;
        } else if (actionNumber > 25 && !this.isRanged) { // 26-40 (15%)
            action = States.COMPUTER_PARRY;
        } else if (actionNumber > 10) { // 11-20 (10%) || 11-40 (this.isRanged) (30%)
            action = States.COMPUTER_THRUST;
        } else { // New State 1-10 (10%)
            action = States.CONTEMPLATE;
        };
        let check: {success: boolean; cost: number;} = staminaCheck(this.stamina, PLAYER.STAMINA[action.toUpperCase() as keyof typeof PLAYER.STAMINA]);
        // console.log(`%c Action: ${action}`, `color:${check.success ? 'green':'red'}`);
        if (check.success === true && this.playerMachine.stateMachine.isState(action)) {
            this.playerMachine.stateMachine.setState(action);
        };
    };

    handleComputerConcerns = () => {
        if (this.actionSuccess === true) {
            this.actionSuccess = false;
            this.playerActionSuccess();
        };
        if (this.particleEffect !== undefined) { 
            if (this.particleEffect.success) {
                this.particleEffect.success = false;
                this.particleEffect.triggered = true;
                this.playerActionSuccess();
            } else if (this.particleEffect.collided) {
                this.scene.particleManager.removeEffect(this.particleEffect.id);
                this.particleEffect = undefined;                
            } else if (!this.particleEffect.effect?.active) {
                this.particleEffect = undefined;                
            } else {
                this.scene.particleManager.updateParticle(this.particleEffect);
            };
        };

        if (this.scene.combat === true && (!this.currentTarget || !this.currentTarget.inCombat)) this.findEnemy(); // this.inCombat === true && state.combatEngaged
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText !== undefined) this.scrollingCombatText.update(this);
        if (this.specialCombatText !== undefined) this.specialCombatText.update(this); 
        if (this.resistCombatText !== undefined) this.resistCombatText.update(this);
        if (this.negationBubble) this.negationBubble.update(this.x, this.y);
        if (this.reactiveBubble) this.reactiveBubble.update(this.x, this.y);

        if (this.isFeared && !this.sansSuffering('isFeared') && !this.playerMachine.stateMachine.isCurrentState(States.FEARED)) {
            this.playerMachine.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isPolymorphed && !this.sansSuffering('isPolymorphed') && !this.playerMachine.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.playerMachine.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if (this.isStunned && !this.sansSuffering('isStunned') && !this.playerMachine.stateMachine.isCurrentState(States.STUN)) {
            this.playerMachine.stateMachine.setState(States.STUN);
            return;
        };
        if (this.isFrozen && !this.playerMachine.negativeMachine.isCurrentState(States.FROZEN) && !this.currentNegativeState(States.FROZEN)) {
            this.playerMachine.negativeMachine.setState(States.FROZEN);
            return;
        };
        if (this.isRooted && !this.playerMachine.negativeMachine.isCurrentState(States.ROOTED) && !this.currentNegativeState(States.ROOTED)) {
            this.playerMachine.negativeMachine.setState(States.ROOTED);
            return;
        };
        if (this.isSlowed && !this.playerMachine.negativeMachine.isCurrentState(States.SLOWED) && !this.currentNegativeState(States.SLOWED)) {
            this.playerMachine.negativeMachine.setState(States.SLOWED);
            return;
        };
        if (this.isSnared && !this.playerMachine.negativeMachine.isCurrentState(States.SNARED) && !this.currentNegativeState(States.SNARED)) {
            this.playerMachine.negativeMachine.setState(States.SNARED); 
            return;    
        };

        this.weaponRotation('player', this.currentTarget as Enemy);
    };

    update() {
        this.handleComputerConcerns();
        this.evaluateCombatDistance();
        this.handleAnimations();
        this.playerMachine.update(this.dt);
    };
};