import Ascean from "../../models/ascean";
import { SPECIAL, TRAIT_SPECIALS } from "../../utility/abilities";
import { fetchTrait } from "../../utility/ascean";
import { DURATION } from "../../utility/enemy";
import { PLAYER, staminaCheck } from "../../utility/player";
import { Particle } from "../matter/ParticleManager";
import { States } from "../phaser/StateMachine";
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

    isUnderRangedAttack = () => {
        const player = this.getEnemyParticle();
        if (!player) return false;
        return (this.currentTarget?.isRanged && this.checkEvasion(player) && !this.playerMachine.stateMachine.isCurrentState(States.EVADE));
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
        const distance = direction.length();
        const distanceY = Math.abs(direction.y);
        const multiplier = this.rangedDistanceMultiplier(PLAYER.DISTANCE.RANGED_MULTIPLIER);
        
        if (distance >= PLAYER.DISTANCE.CHASE * multiplier) { // Switch to CHASE the Enemy
            this.playerMachine.stateMachine.setState(States.CHASE);
        } else if (this.isRanged) { // Contiually Checking Distance for RANGED ENEMIES.
            if (distanceY > PLAYER.DISTANCE.RANGED_ALIGNMENT) {
                direction.normalize();
                this.setVelocityY(direction.y * (this.speed + 0.5));
                this.handleMovementAnimations();
            };
            if (distance > PLAYER.DISTANCE.THRESHOLD * multiplier) { // 225-525 
                direction.normalize();
                this.setVelocityX(direction.x * (this.speed + 0.25));
                this.setVelocityY(direction.y * (this.speed + 0.25));     
                this.handleMovementAnimations();
            } else if (distance < PLAYER.DISTANCE.THRESHOLD && !this.currentTarget.isRanged) { // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
                if (Phaser.Math.Between(1, 250) === 1 && state !== States.EVADE) {
                    this.playerMachine.stateMachine.setState(States.EVADE);
                } else {
                    direction.normalize();
                    this.setVelocityX(direction.x * -this.speed + 0.5);
                    this.setVelocityY(direction.y * -this.speed + 0.5);
                    this.handleMovementAnimations();
                };
            } else if (this.checkLineOfSight() && state !== States.EVADE) {
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
            if (distance > PLAYER.DISTANCE.ATTACK) { 
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
        const loadout = this.scene.hud.settings.computerLoadout; // || { attack: 20, parry: 10, roll: 10, thrust: 15, posture: 15, jump: 10 };
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

    handleComputerConcerns = () => {
        if (this.scene.combat && !this.currentTarget) this.findEnemy();
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            if (this.inCombat && (!this.scene.state.computer || this.scene.state.enemyID !== this.currentTarget.enemyID)) {
                this.scene.hud.setupEnemy(this.currentTarget);
            };
        };

        this.syncPositions();
        this.getDirection();
        this.particleCheck();

        if (this.isUnderRangedAttack()) this.playerMachine.stateMachine.setState(States.EVADE);
    };

    update(dt: number) {
        this.handleComputerConcerns();
        this.playerMachine.stateMachine.update(dt);
        this.playerMachine.positiveMachine.update(dt);
        this.playerMachine.negativeMachine.update(dt);
    };
};