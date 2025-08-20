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
        this.playerMachine.stateMachine.setState(States.IDLE);
        this.specials = false;
        this.isCasting = false;
        this.isMoving = false;
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
            return m !== "Mark" && m !== "Recall" && m !== "Consume";
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
    
    setSpecialCombat = (mult = 0.5, remove = false) => {
        if (remove) return;
        this.scene.time.delayedCall(DURATION.SPECIAL * mult, () => {
            if (!this.inCombat) return;
            if (this.isCasting === true || this.isSuffering() || this.isContemplating) {
                this.setSpecialCombat(0.1);
                return;
            };
            const special = this.combatSpecials[Math.floor(Math.random() * this.combatSpecials.length)].toLowerCase();
            // const test = ["achire", "quor"];
            // const special = test[Math.floor(Math.random() * test.length)];
            this.setVelocity(0);
            this.isMoving = false;
            if (this.playerMachine.stateMachine.isState(special)) {
                this.playerMachine.stateMachine.setState(special);
            } else if (this.playerMachine.positiveMachine.isState(special)) {
                this.playerMachine.positiveMachine.setState(special);
            };
            this.setSpecialCombat();
        }, undefined, this);
    };

    computerEngagement = (id: string) => {
        const enemy = this.scene.enemies.find((obj: Enemy) => obj.enemyID === id);
        if (!enemy) return;
        if (this.isNewEnemy(enemy)) this.targets.push(enemy);
        if (this.scene.state.enemyID !== id) this.scene.hud.setupEnemy(enemy);
        this.inCombat = true;
        this.scene.combatEngaged(true);
        this.targetID = id;
        this.currentTarget = enemy;
        this.highlightTarget(enemy);
        this.playerMachine.stateMachine.setState(States.CHASE);
    };

    checkEvasion = (particle: Particle) => {
        const particleVector = new Phaser.Math.Vector2(particle.effect.x, particle.effect.y);
        const playerVector = new Phaser.Math.Vector2(this.x, this.y);
        const particleDistance = particleVector.subtract(playerVector);
        if (particleDistance.length() < 50 && !this.isPosted && !this.isCasting) { // 50 || 100
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

    clearAttacks = () => {
        return(
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_ATTACK) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_PARRY) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_POSTURE) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_THRUST) &&
            !this.playerMachine.stateMachine.isCurrentState(States.DODGE) &&
            !this.playerMachine.stateMachine.isCurrentState(States.ROLL)
        );
    };

    evaluateCombatDistance = () => {
        if (this.isSuffering() || this.health <= 0 || !this.inCombat || !this.currentTarget || !this.currentTarget.body) return;
        
        const state = this.playerMachine.stateMachine.getCurrentState();
        let direction = this.currentTarget.position.subtract(this.position);
        const distanceY = Math.abs(direction.y);
        const multiplier = this.rangedDistanceMultiplier(PLAYER.DISTANCE.RANGED_MULTIPLIER);
        
        if (direction.length() >= PLAYER.DISTANCE.CHASE * multiplier) { // Switch to CHASE the Enemy
            this.playerMachine.stateMachine.setState(States.CHASE);
            return;
        } else if (this.isRanged) { // Contiually Checking Distance for RANGED ENEMIES.
            if (distanceY > PLAYER.DISTANCE.RANGED_ALIGNMENT) {
                direction.normalize();
                this.setVelocityY(direction.y * (this.speed + 0.5)); // 2 || 4
                this.handleMovementAnimations();
            };
            if (this.currentTarget.position.subtract(this.position).length() > PLAYER.DISTANCE.THRESHOLD * multiplier) { // 225-525 
                direction.normalize();
                this.setVelocityX(direction.x * (this.speed + 0.25)); // 2.25
                this.setVelocityY(direction.y * (this.speed + 0.25)); // 2.25          
                this.handleMovementAnimations();
            } else if (this.currentTarget.position.subtract(this.position).length() < PLAYER.DISTANCE.THRESHOLD && !this.currentTarget.isRanged) { // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
                if (Phaser.Math.Between(1, 250) === 1 && state !== States.EVADE) { //  && this.evasionTimer === 0
                    this.playerMachine.stateMachine.setState(States.EVADE);
                } else {
                    direction.normalize();
                    this.setVelocityX(direction.x * -this.speed + 0.5); // -2.25 | -2 | -1.75
                    this.setVelocityY(direction.y * -this.speed + 0.5); // -1.5 | -1.25
                    this.handleMovementAnimations();
                };
            } else if (this.checkLineOfSight() && state !== States.EVADE) { //  && this.evasionTimer === 0
                this.playerMachine.stateMachine.setState(States.EVADE);
            } else if (distanceY < 15) { // The Sweet Spot for RANGED ENEMIES.
                this.setVelocity(0);
                this.handleIdleAnimations();
            } else { // Between 75 and 225 and outside y-distance
                direction.normalize();
                this.setVelocityY(direction.y * (this.speed + 0.5)); // 2.25
                this.handleMovementAnimations();
            };
        } else { // Melee || Continually Maintaining Reach for MELEE ENEMIES.
            if (direction.length() > PLAYER.DISTANCE.ATTACK) { 
                direction.normalize();
                this.setVelocityX(direction.x * (this.speed + 0.25)); // 2.5
                this.setVelocityY(direction.y * (this.speed + 0.25)); // 2.5
                this.isPosted = false;
                this.handleMovementAnimations();
            } else { // Inside melee range
                this.isPosted = true;
                this.setVelocity(0);
                this.handleIdleAnimations();
            };
        };
    };
    
    evaluateCombat = () => {
        if (this.isCasting || this.isPraying || this.isSuffering() || this.health <= 0) return;
        let actionNumber = Math.floor(Math.random() * 101);
        let action = "";
        const loadout = this.scene.hud.settings.computerLoadout || { attack: 20, parry: 10, roll: 10, thrust: 15, posture: 15, jump: 10 };
        if (actionNumber > 100 - loadout.attack) { // 81-100 (20%)
            action = States.COMPUTER_ATTACK;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry) { // 71-80 (10%)
            action = States.COMPUTER_PARRY;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry - loadout.roll) { // 61-70 (10%)
            action = States.ROLL;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry - loadout.roll - loadout.thrust) { // 51-60 (10%)
            action = States.COMPUTER_THRUST;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry - loadout.roll - loadout.thrust - loadout.posture) { // 36-50 (15%)
            action = States.COMPUTER_POSTURE;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry - loadout.roll - loadout.thrust - loadout.posture - loadout.jump) { // 21-35 (15%)
            action = States.JUMP;
        } else { // Special State 1-20
            action = States.CONTEMPLATE;
        };
        let check: {success: boolean; cost: number;} = staminaCheck(this.stamina, PLAYER.STAMINA[action.toUpperCase() as keyof typeof PLAYER.STAMINA]);
        if (check.success === true && this.playerMachine.stateMachine.isState(action)) {
            this.playerMachine.stateMachine.setState(action);
        } else {
            this.scene.showCombatText(this, "Catch Your Breath", 750, "dread", false, true);
            this.scene.combatManager.useStamina(-5);    
        };
    };

    handleComputerConcerns = (dt: number) => {
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

        this.getDirection();

        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            if (this.inCombat && (!this.scene.state.computer || this.scene.state.enemyID !== this.currentTarget.enemyID)) {
                this.scene.hud.setupEnemy(this.currentTarget);
            };
        };

        if (this.scene.combat === true && (!this.currentTarget || !this.currentTarget.inCombat)) this.findEnemy(); // this.inCombat === true && state.combatEngaged

        if (this.healthbar) this.healthbar.update(this);
        if (this.negationBubble) this.negationBubble.update(this.x, this.y);
        if (this.reactiveBubble) this.reactiveBubble.update(this.x, this.y);
        this.functionality(dt, "player", this.currentTarget as Enemy);
        this.spriteWeapon.setPosition(this.x, this.y);
        this.spriteShield.setPosition(this.x, this.y);

        if (this.isDefeated && !this.playerMachine.stateMachine.isCurrentState(States.DEFEATED)) {
            this.playerMachine.stateMachine.setState(States.DEFEATED);
            return;
        };
        if (this.isConfused && !this.sansSuffering("isConfused") && !this.playerMachine.stateMachine.isCurrentState(States.CONFUSED)) {
            this.playerMachine.stateMachine.setState(States.CONFUSED);
            return;
        };
        if (this.isFeared && !this.sansSuffering("isFeared") && !this.playerMachine.stateMachine.isCurrentState(States.FEARED)) {
            this.playerMachine.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isHurt && !this.isDefeated && !this.playerMachine.stateMachine.isCurrentState(States.HURT)) {
            this.playerMachine.stateMachine.setState(States.HURT);
            return;
        };
        if (this.isParalyzed && !this.sansSuffering("isParalyzed") && !this.playerMachine.stateMachine.isCurrentState(States.PARALYZED)) {
            this.playerMachine.stateMachine.setState(States.PARALYZED);
            return;
        };
        if (this.isPolymorphed && !this.sansSuffering("isPolymorphed") && !this.playerMachine.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.playerMachine.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if (this.isStunned && !this.sansSuffering("isStunned") && !this.playerMachine.stateMachine.isCurrentState(States.STUN)) {
            this.playerMachine.stateMachine.setState(States.STUN);
            return;
        };

        if (this.isUnderRangedAttack()) {
            this.playerMachine.stateMachine.setState(States.EVADE);
        };

        if (this.isFrozen && !this.playerMachine.negativeMachine.isCurrentState(States.FROZEN) && !this.currentNegativeState(States.FROZEN)) {
            this.playerMachine.negativeMachine.setState(States.FROZEN);
        };
        if (this.isRooted && !this.playerMachine.negativeMachine.isCurrentState(States.ROOTED) && !this.currentNegativeState(States.ROOTED)) {
            this.playerMachine.negativeMachine.setState(States.ROOTED);
        };
        if (this.isSlowed && !this.playerMachine.negativeMachine.isCurrentState(States.SLOWED) && !this.currentNegativeState(States.SLOWED)) {
            this.playerMachine.negativeMachine.setState(States.SLOWED);
        };
        if (this.isSnared && !this.playerMachine.negativeMachine.isCurrentState(States.SNARED) && !this.currentNegativeState(States.SNARED)) {
            this.playerMachine.negativeMachine.setState(States.SNARED);
        };
    };

    update(dt: number) {
        this.handleComputerConcerns(dt);
        this.playerMachine.stateMachine.update(dt);
        this.playerMachine.positiveMachine.update(dt);
        this.playerMachine.negativeMachine.update(dt);
    };
};