import Ascean from "../../models/ascean";
import { SPECIAL, TRAIT_SPECIALS } from "../../utility/abilities";
import { fetchTrait } from "../../utility/ascean";
import { DURATION } from "../../utility/enemy";
import { PLAYER } from "../../utility/player";
import { Particle } from "../matter/ParticleManager";
import { States } from "../phaser/StateMachine";
import Player from "./Player";

export default class PlayerComputer extends Player {
    combatConcerns: Phaser.Time.TimerEvent | undefined;
    combatSpecials: any[];
    computerAction: boolean = false;
    specials: boolean;
    constructor(data: any) {
        const { scene } = data;
        const ascean = scene.registry.get("ascean");
        super({...data,name:"player",ascean,health:ascean?.health?.current || scene.state.newPlayerHealth});
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {}; // For Leashing
        this.isComputer = true;
        this.combatConcerns = undefined;
        this.specials = false;
        this.checkSpecials(ascean);
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
        // this.setSpecialCombat();
    };
    setSpecialCombat = (mult = 0.75, remove = false) => {
        if (remove) {
            this.specialCombat?.remove(false);
            return;
        };
        this.specialCombat = this.scene.time.delayedCall(DURATION.SPECIAL * mult, () => {
            if (this.inCombat === false) {
                this.specialCombat?.remove();
                return;
            };
            if (this.isCasting === true || this.isSuffering() || this.isContemplating) {
                this.setSpecialCombat(0.25);
                return;
            };
            const special = this.combatSpecials[Math.floor(Math.random() * this.combatSpecials.length)];
            this.specialAction = special;
            // this.currentAction = 'special';
            // const specific = ['renewal'];
            // const test = specific[Math.floor(Math.random() * specific.length)];
            if (this.playerMachine.stateMachine.isState(special)) {
                this.playerMachine.stateMachine.setState(special);
            } else if (this.playerMachine.positiveMachine.isState(special)) {
                this.playerMachine.positiveMachine.setState(special);
            };
            // this.setSpecialCombat();
            this.specials = false;
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

    evaluateCombatDistance = () => {
        this.getDirection();
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            if (this.inCombat && (!this.scene.state.computer || this.scene.state.enemyID !== this.currentTarget.enemyID)) {
                this.scene.setupEnemy(this.currentTarget);
            };
        };
        if (this.isCasting === true || this.isSuffering() === true || this.isContemplating === true || this.currentTarget === undefined || this.scene.state.newPlayerHealth <= 0 || this.playerMachine.stateMachine.isCurrentState(States.LEASH) || this.playerMachine.stateMachine.isCurrentState(States.CHASE) || this.playerMachine.stateMachine.isCurrentState(States.EVADE)) return;
        if (!this.inCombat) {
            this.setVelocity(0);
            return;    
        };
        if (!this.currentTarget.body || !this.currentTarget.position || !this.currentTarget.x || !this.currentTarget.y) return;
        let direction = this.currentTarget.position.subtract(this.position);
        const distanceY = Math.abs(direction.y);
        const multiplier = this.rangedDistanceMultiplier(PLAYER.DISTANCE.RANGED_MULTIPLIER);
        if (direction.length() >= PLAYER.DISTANCE.CHASE * multiplier) { // Switch to CHASE MODE.
            this.playerMachine.stateMachine.setState(States.CHASE);
        } else if (this.isRanged) { // Contiually Checking Distance for RANGED ENEMIES.
            if (!this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_COMBAT)) this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);

            if (distanceY > PLAYER.DISTANCE.RANGED_ALIGNMENT) {
                direction.normalize();
                this.setVelocityY(direction.y * this.speed + 0.5); // 2 || 4
            };
            if (this.currentTarget.position.subtract(this.position).length() > PLAYER.DISTANCE.THRESHOLD * multiplier) { // 225-525 
                direction.normalize();
                this.setVelocityX(direction.x * this.speed + 0.25); // 2.25
                this.setVelocityY(direction.y * this.speed + 0.25); // 2.25          
            } else if (this.currentTarget.position.subtract(this.position).length() < PLAYER.DISTANCE.THRESHOLD && !this.currentTarget.isRanged) { // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
                if (Phaser.Math.Between(1, 300) === 1) {
                    this.playerMachine.stateMachine.setState(States.EVADE);
                    return;
                } else {
                    direction.normalize();
                    this.setVelocityX(direction.x * -this.speed + 0.5); // -2.25 | -2 | -1.75
                    this.setVelocityY(direction.y * -this.speed + 0.5); // -1.5 | -1.25
                };
            } else if (distanceY < 15) { // The Sweet Spot for RANGED ENEMIES.
                this.setVelocity(0);
                this.anims.play('player_idle', true);
            } else { // Between 75 and 225 and outside y-distance
                direction.normalize();
                this.setVelocityY(direction.y * this.speed + 0.5); // 2.25
            };
        } else { // Melee || Contiually Maintaining Reach for MELEE ENEMIES.
            if (!this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_COMBAT)) this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
            
            if (direction.length() > PLAYER.DISTANCE.ATTACK) { 
                direction.normalize();
                this.setVelocityX(direction.x * this.speed + 0.25); // 2.5
                this.setVelocityY(direction.y * this.speed + 0.25); // 2.5
                this.isPosted = false;
            } else { // Inside melee range
                this.setVelocity(0);
                this.anims.play('player_idle', true);
                this.isPosted = true;
            };
        };
    };
    
    evaluateCombat = () => {
        if (this.isCasting === true || this.isSuffering() === true) return;
        let actionNumber = Math.floor(Math.random() * 101);
        if (actionNumber > 70) { // 71-100 (30%)
            this.playerMachine.stateMachine.setState(States.ATTACK);
        } else if (actionNumber > 55) { // 56-70 (15%)
            this.playerMachine.stateMachine.setState(States.POSTURE);
        } else if (actionNumber > 40 && !this.isRanged) { // 41-55 (15%)
            this.playerMachine.stateMachine.setState(States.ROLL);
        } else if (actionNumber > 25 && !this.isRanged) { // 26-40 (15%)
            this.playerMachine.stateMachine.setState(States.PARRY);
        } else if (actionNumber > 10) { // 11-20 (10%) || 11-40 (this.isRanged) (30%)
            this.playerMachine.stateMachine.setState(States.THRUST);
        } else { // New State 1-10 (10%)
            this.playerMachine.stateMachine.setState(States.CONTEMPLATE);
        };
    };

    update() {
        this.evaluateCombatDistance();
        this.handleConcerns();
        this.handleAnimations();
        this.playerMachine.update(this.dt);
    };
};