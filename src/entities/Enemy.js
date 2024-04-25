import Phaser from "phaser";
import Entity, { FRAME_COUNT } from "./Entity"; 
import { screenShake } from "../phaser/ScreenShake";
import StateMachine, { States } from "../phaser/StateMachine";
import HealthBar from "../phaser/HealthBar";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import { EventBus } from "../game/EventBus";
import { v4 as uuidv4 } from 'uuid';
import { getRandomNumStr } from "../models/equipment";

const DISTANCE = {
    MIN: 0,
    ATTACK: 25,
    MOMENTUM: 2,
    THRESHOLD: 75,
    CHASE: 125,
    RANGED_ALIGNMENT: 10,
    RANGED_MULTIPLIER: 3,
    DODGE: 1152, // 2304
    ROLL: 960, // 1920
};

const DURATION = {
    CONSUMED: 2000,
    FEAR: 3000,
    FROZEN: 3000,
    SLOW: 2500,
    SNARE: 4000,
    ROOT: 3000,
    STUN: 3000,
    TEXT: 1500,
    DODGE: 288, // 288
    ROLL: 320, // 320
};

const RANGE = {
    LEASH: 750,
}; 

export default class Enemy extends Entity {
    constructor(data) {
        super({ ...data, name: "enemy", ascean: undefined, health: 1 }); 
        this.scene.add.existing(this);
        this.enemyID = uuidv4();
        this.createEnemy();
        this.setTint(0x000000);
        this.stateMachine = new StateMachine(this, 'enemy');
        this.stateMachine
            .addState(States.IDLE, {
                onEnter: this.onIdleEnter,
                onUpdate: this.onIdleUpdate,
                onExit: this.onIdleExit,
            })
            .addState(States.PATROL, {
                onEnter: this.onPatrolEnter,
                onUpdate: this.onPatrolUpdate,
                onExit: this.onPatrolExit,
            })
            .addState(States.AWARE, {
                onEnter: this.onAwarenessEnter,
                onUpdate: this.onAwarenessUpdate,
                onExit: this.onAwarenessExit,
            })
            .addState(States.CHASE, {
                onEnter: this.onChaseEnter,
                onUpdate: this.onChaseUpdate,
                onExit: this.onChaseExit,
            })
            .addState(States.COMBAT, {
                onEnter: this.onCombatEnter,
                onUpdate: this.onCombatUpdate,
                onExit: this.onCombatExit,
            })
            .addState(States.EVADE, {
                onEnter: this.onEvasionEnter,
                onUpdate: this.onEvasionUpdate,
                onExit: this.onEvasionExit,
            })
            .addState(States.LEASH, {
                onEnter: this.onLeashEnter,
                onUpdate: this.onLeashUpdate,
                onExit: this.onLeashExit,
            })
            .addState(States.ATTACK, {
                onEnter: this.onAttackEnter,
                onUpdate: this.onAttackUpdate,
                onExit: this.onAttackExit,
            })
            .addState(States.PARRY, {
                onEnter: this.onParryEnter,
                onUpdate: this.onParryUpdate,
                onExit: this.onParryExit,
            })
            .addState(States.DODGE, {
                onEnter: this.onDodgeEnter,
                onUpdate: this.onDodgeUpdate,
                onExit: this.onDodgeExit,
            })
            .addState(States.POSTURE, {
                onEnter: this.onPostureEnter,
                onUpdate: this.onPostureUpdate,
                onExit: this.onPostureExit,
            })
            .addState(States.ROLL, {
                onEnter: this.onRollEnter,
                onUpdate: this.onRollUpdate,
                onExit: this.onRollExit,    
            })
            .addState(States.FEAR, {
                onEnter: this.onFearEnter,
                onUpdate: this.onFearUpdate,
                onExit: this.onFearExit,
            })
            .addState(States.POLYMORPH, {
                onEnter: this.onPolymorphEnter,
                onUpdate: this.onPolymorphUpdate,
                onExit: this.onPolymorphExit,
            })
            .addState(States.STUN, {
                onEnter: this.onStunEnter,
                onUpdate: this.onStunUpdate,
                onExit: this.onStunExit,
            })
            .addState(States.CONSUMED, {
                onEnter: this.onConsumedEnter,
                onUpdate: this.onConsumedUpdate,
                onExit: this.onConsumedExit,
            })
            .addState(States.HURT, {
                onEnter: this.onHurtEnter,
                onUpdate: this.onHurtUpdate,
                onExit: this.onHurtExit,
            })
            .addState(States.DEATH, {
                onEnter: this.onDeathEnter,
            })
            .addState(States.DEFEATED, {
                onEnter: this.onDefeatedEnter,
            })
        
        this.stateMachine.setState(States.IDLE);

        this.metaMachine = new StateMachine(this, 'enemy');
        this.metaMachine
            .addState(States.CLEAN, {
                onEnter: this.onCleanEnter,
                onExit: this.onCleanExit,
            })
            .addState(States.ROOT, {
                onEnter: this.onRootEnter,
                onUpdate: this.onRootUpdate,
                onExit: this.onRootExit,
            })
            .addState(States.SNARE, {
                onEnter: this.onSnareEnter,
                // onUpdate: this.onSnareUpdate,
                onExit: this.onSnareExit,
            })
            .addState(States.SLOW, {
                onEnter: this.onSlowEnter,
                // onUpdate: this.onSlowUpdate,
                onExit: this.onSlowExit,
            })
            .addState(States.FROZEN, {
                onEnter: this.onFrozenEnter,
                onUpdate: this.onFrozenUpdate,
                onExit: this.onFrozenExit,
            })

        this.metaMachine.setState(States.CLEAN);
        
        this.setScale(0.8);
        this.setDepth(1);
        this.isAttacking = false;
        this.isParrying = false;
        this.isDodging = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.inCombat = false;
        this.isConsuming = false;
        this.isCrouching = false;
        this.isJumping = false;
        this.isHanging = false;
        this.isHealing = false;
        this.isPraying = false;
        this.rollCooldown = 0;
        this.dodgeCooldown = 0;
        this.enemySensor = undefined;
        this.waiting = 30;
        this.idleWait = 3000;
        this.patrolTimer = undefined;
        this.patrolReverse = undefined;
        this.patrolWait = 500;
        this.patrolVelocity = 1;
        this.polymorphVelocity = { x: 0, y: 0 };
        this.attackSensor = undefined;
        this.attackTimer = undefined;
        this.combatThreshold = 0;
        this.attackIsLive = false;
        this.isEnemy = true;
        this.isAggressive = this.setAggression(); // Math.random() > 0.5 || false
        this.startedAggressive = this.isAggressive;
        this.isDefeated = false;
        this.isTriumphant = false;
        this.isLuckout = false;
        this.isPersuaded = false;
        this.playerTrait = '';
        this.currentWeapon = undefined;
        this.isCurrentTarget = false;
        this.parryAction = '';
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {}; // For Leashing
        this.isConsumed = false;
        this.sensorDisp = 12;
        this.colliderDisp = 16; 

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const colliderWidth = 20; 
        const colliderHeight = 36; 
        const paddingWidth = 10;         
        const paddingHeight = 10; 

        const paddedWidth = colliderWidth + 2 * paddingWidth;
        const paddedHeight = colliderHeight + 2 * paddingHeight;
        let enemyCollider = Bodies.rectangle(this.x, this.y + 10, colliderWidth, colliderHeight, { isSensor: false, label: 'enemyCollider' });
        enemyCollider.boundsPadding = { x: paddedWidth, y: paddedHeight };
        let enemySensor = Bodies.circle(this.x, this.y + 2, 36, { isSensor: true, label: 'enemySensor' }); // Sensor was 48
        const compoundBody = Body.create({
            parts: [enemyCollider, enemySensor],
            frictionAir: 0.1, 
            restitution: 0.3,
            friction: 0.15,
        });
        this.setExistingBody(compoundBody);                                    
        this.setFixedRotation();
        this.enemyStateListener();
        this.enemySensor = enemySensor;
        this.enemyCollision(enemySensor);
        
        // console.log(this.width, this.height)
        this.setInteractive(new Phaser.Geom.Rectangle(
            48,
            0,
            32,
            this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.scene.setupEnemy(this);
                this.setTint(0x00FF00);
                const newEnemy = this.isNewEnemy(this.scene.player);
                if (newEnemy) {
                    this.scene.player.addEnemy(this);
                };
                this.scene.player.setAttacking(this);
                this.scene.player.setCurrentTarget(this);
            })
            .on('pointerout', () => {
                this.setTint(0x000000);
            });
    };

    cleanUp() {
        EventBus.off('combat', this.combatDataUpdate);
        EventBus.off('update-combat', this.combatDataUpdate); 
        EventBus.off('personal-update', this.personalUpdate);    
        EventBus.off('enemy-persuasion', this.persuasionUpdate);
        EventBus.off('enemy-luckout', this.luckoutUpdate);
        EventBus.off('update-enemy-health', this.healthUpdate);
    };

    enemyStateListener() {
        EventBus.on('combat', this.combatDataUpdate);
        EventBus.on('update-combat', this.combatDataUpdate); 
        EventBus.on('personal-update', this.personalUpdate);
        EventBus.on('enemy-persuasion', this.persuasionUpdate);
        EventBus.on('enemy-luckout', this.luckoutUpdate);
        EventBus.on('update-enemy-health', this.healthUpdate);
    };

    personalUpdate = (e) => {
        switch (e.action) {
            case 'health':
                this.health = e.payload;
                this.healthbar.setValue(this.health);
                this.updateHealthBar(this.health);
                break;
            default:
                break;
        };
    };

    healthUpdate = (e) => {
        if (this.enemyID !== e.id) return;
        if (e.id === this.scene.state?.enemyID) {
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: e.health } });
        } else {
            this.health = e.health;
            this.healthbar.setValue(e.health);
            this.updateHealthBar(e.health);
        };
    };
    
    combatDataUpdate = (e) => {
        if (this.enemyID !== e.enemyID) {
            if (this.inCombat) this.currentRound = e.combatRound;
            if (this.inCombat && this.attacking && e.newPlayerHealth <= 0 && e.computerWin === true) this.clearCombat();
            return;
        };
        // if (e.counterSuccess && !this.stateMachine.isCurrentState(States.STUN) && this.currentRound !== e.combatRound) this.setStun();

        if (this.health > e.newComputerHealth) { 
            const damage = Math.round(this.health - e.newComputerHealth);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e.criticalSuccess);
            // console.log(`%c ${e.player.name} Dealt ${damage} Damage To ${this.ascean.name}`, 'color: #00ff00')

            if (!this.isConsumed && !this.isHurt && !this.isFeared) this.stateMachine.setState(States.HURT);
            if (this.currentRound !== e.combatRound) {
                // if (this.isStunned) this.isStunned = false;
                if (this.isPolymorphed) this.isPolymorphed = false;
                if (!this.inCombat && !this.isDefeated) {
                    this.checkEnemyCombatEnter();
                };
            };
            if (e.newComputerHealth <= 0) this.stateMachine.setState(States.DEFEATED);
        };
        if (this.health < e.newComputerHealth) { 
            let heal = Math.round(e.newComputerHealth - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, 1500, 'heal');
        }; 
        
        this.health = e.newComputerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.computerHealth) this.healthbar.setTotal(e.computerHealth);
        if (this.healthbar) this.updateHealthBar(this.health);
        this.weapons = e.computerWeapons;  
        this.setWeapon(e.computerWeapons[0]); 
        this.checkDamage(e.computerDamageType.toLowerCase()); 
        
        if (e.newPlayerHealth <= 0) this.clearCombat();
        this.checkMeleeOrRanged(e.computerWeapons?.[0]);
        this.currentRound = e.combatRound;
    };

    persuasionUpdate = (e) => {
        if (this.enemyID !== e.enemy) return;
        if (e.persuaded) {
            this.isPersuaded = true;
            this.playerTrait = e.persuasion;
        };
    };

    luckoutUpdate = (e) => {
        if (this.enemyID !== e.enemy) return;
        if (e.luckout) {
            this.isLuckout = true;
            this.playerTrait = e.luck;
            this.stateMachine.setState(States.DEFEATED);
        };

    };

    setAggression = () => {
        const percent = this.scene.settings.difficulty.aggression;
        return percent > Math.random() || false;
    };
    
    enemyCollision = (enemySensor) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [enemySensor],
            callback: other => {
                if (!other.gameObjectB || other.gameObjectB.name !== 'player') return;
                if (this.ascean && !other.gameObjectB.isStealthing && this.enemyAggressionCheck()) { 
                    this.createCombat(other, 'start');
                } else if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive) {
                    const newEnemy = this.isNewEnemy(other.gameObjectB);
                    if (newEnemy) {
                        other.gameObjectB.targets.push(this);
                        other.gameObjectB.checkTargets();
                    } ;
                    if (this.scene.state.enemyID !== this.enemyID) this.scene.setupEnemy(this);
                    this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
                    if (this.stateMachine.isCurrentState(States.DEFEATED)) {
                        this.scene.showDialog(true);
                    } else {
                        this.stateMachine.setState(States.AWARE);
                    };
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [enemySensor],
            callback: other => {
                if (!other.gameObjectB || other.gameObjectB.name !== 'player') return;
                if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive) {
                    if (this.healthbar) this.healthbar.setVisible(false);
                    if (this.isDefeated) {
                        this.scene.showDialog(false);
                        this.stateMachine.setState(States.DEFEATED);
                    } else {
                        this.stateMachine.setState(States.IDLE);
                    };
                    this.scene.clearNAEnemy();
                };
            },
            context: this.scene,
        });
    }; 

    isNewEnemy = (player) => {
        return !player.targets.some(obj => obj.enemyID === this.enemyID);
    };

    jumpIntoCombat = () => {
        this.attacking = this.scene.player;
        this.inCombat = true;
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE); 
    };

    checkEnemyCombatEnter = () => {
        const newEnemy = this.isNewEnemy(this.scene.player);
        if (newEnemy) {
            this.scene.player.targets.push(this);
        };
        this.attacking = this.scene.player;
        this.inCombat = true;
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE); 
    };

    playerStatusCheck = (player) => {
        return (this.ascean && !player.inCombat && !player.isStealthing);
    };

    enemyAggressionCheck = () => {
        return (!this.isDead && !this.isDefeated && !this.isTriumphant && !this.inCombat && this.isAggressive);
    };

    enemyFetchedOn = (e) => {
        if (this.enemyID !== e.enemyID) return;
        this.ascean = e.enemy;
        this.health = e.combat.attributes.healthTotal;
        this.combatStats = e.combat; 
        this.weapons = [e.combat.combatWeaponOne, e.combat.combatWeaponTwo, e.combat.combatWeaponThree];
        
        this.speed = this.startingSpeed(e.enemy);
        this.createWeapon(e.enemy.weaponOne); 
        this.createShield(e.enemy.shield);

        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health);
        EventBus.off('enemy-fetched', this.enemyFetchedOn);
    };

    createEnemy = () => {
        EventBus.on('enemy-fetched', this.enemyFetchedOn);
        const fetch = { enemyID: this.enemyID, level: this.scene.player.ascean.level };
        EventBus.emit('fetch-enemy', fetch);
    };

    createShield = (shield) => {
        const shieldName = this.imgSprite(shield);
        this.spriteShield = new Phaser.GameObjects.Sprite(this.scene, 0, 0, shieldName);
        this.spriteShield.setScale(0.6);
        this.spriteShield.setOrigin(0.5, 0.5);
        this.scene.add.existing(this.spriteShield);
        this.spriteShield.setVisible(false);
    };

    createWeapon = (weapon) => {
        const weaponName = this.imgSprite(weapon); 
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, weaponName);
        this.setWeapon(weapon);
        this.checkDamage(weapon.damageType[0].toLowerCase());
        this.checkMeleeOrRanged(weapon);
        if (weapon.grip === 'Two Hand') {
            this.spriteWeapon.setScale(0.65);
        } else {
            this.spriteWeapon.setScale(0.5);
        };
        this.spriteWeapon.setOrigin(0.25, 1);
        this.scene.add.existing(this.spriteWeapon);
        this.spriteWeapon.setAngle(-195);
    }; 

    clearCombat = () => {
        if (!this.stateMachine.isCurrentState(States.LEASH)) this.stateMachine.setState(States.LEASH);
        this.inCombat = false;
        this.attacking = undefined;
        this.isTriumphant = true;
        this.isAggressive = false; // Added to see if that helps with post-combat losses for the player
    };

    createCombat = (collision, _when) => {
        const newEnemy = this.isNewEnemy(collision.gameObjectB);
        if (newEnemy) {
            // console.log('Creating Combat --- newEnemy: ', newEnemy)  
            this.scene.player.targets.push(this);
            this.scene.player.checkTargets();
            this.scene.player.setAttacking(this);
            this.scene.player.setCurrentTarget(this);
            this.scene.player.actionTarget = collision;
            this.scene.player.targetID = this.enemyID;
            this.scene.player.highlightTarget(this);
            this.scene.player.inCombat = true;

            this.attacking = collision.gameObjectB;
            this.scene.setupEnemy(this);
            this.inCombat = true;
            if (this.healthbar) this.healthbar.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
            this.actionTarget = collision;
            this.stateMachine.setState(States.CHASE); 
            
            this.scene.combatEngaged(true);
        } else {
            // if (!collision.gameObjectB.attacking || !collision.gameObjectB.inCombat) { // !inCombat
            // console.log('Not attacking or in collision');
            if (this.scene.state.enemyID !== this.enemyID) this.scene.setupEnemy(this);
            collision.gameObjectB.attacking = this;
            collision.gameObjectB.currentTarget = this;
            collision.gameObjectB.inCombat = true;
            collision.gameObjectB.highlightTarget(this);
            this.scene.combatEngaged(true);
        }
        // }; 
    };

    checkDamage = (damage) => {
        this.currentDamageType = damage;
        this.hasMagic = this.checkDamageType(damage, 'magic');
    };
    
    setStun = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', 2500, 'effect', true);
        this.isStunned = true;
    };

    setWeapon = (weapon) => {
        return this.currentWeapon = weapon;
    };

    updateHealthBar(health) {
        this.healthbar.setValue(health);
    };

    onDefeatedEnter = () => {
        this.anims.play('player_pray', true).on('animationcomplete', () => {
            this.anims.play('player_idle', true);
        });
        this.isDefeated = true;
        this.inCombat = false;
        this.attacking = undefined;
        this.isAggressive = false;
        this.healthbar.setVisible(false);
        this.scene.time.delayedCall(300000, () => {
            this.isDefeated = false;
            this.health = this.ascean.health.max;
            this.isAggressive = this.startedAggressive;
            this.stateMachine.setState(States.IDLE);
        }, undefined, this);
    };
    onDeathEnter = () => {
        this.isDead = true;
        this.anims.play('player_death', true);
        this.inCombat = false;
        this.attacking = undefined;
        this.spriteWeapon.destroy();
        this.spriteShield.destroy();
        this.healthbar.destroy();
    };

    onIdleEnter = () => {
        this.anims.play('player_idle', true);
        if (this.currentRound !== 0) this.currentRound = 0;
    };
    onIdleUpdate = (dt) => {
        this.idleWait -= dt;
        if (this.idleWait <= 0) {
            this.idleWait = Phaser.Math.RND.between(4000, 6000);
            if (this.stateMachine.isCurrentState(States.IDLE)) this.stateMachine.setState(States.PATROL);
        };
    };
    onIdleExit = () => {
        this.anims.stop('player_idle');
    };
 
    onPatrolEnter = () => {
        this.anims.play('player_running', true); 
        const patrolDirection = new Phaser.Math.Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize();
        if (patrolDirection.x < 0 && !this.flipX) {
            this.setFlipX(true);
        } else if (patrolDirection.x > 0 && this.flipX) {
            this.setFlipX(false);
        };
        const patrolSpeed = 0.75;
        this.patrolVelocity = { x: patrolDirection.x * patrolSpeed, y: patrolDirection.y * patrolSpeed };
        const delay = Phaser.Math.RND.between(2000, 4000); // 3500

        this.scene.time.delayedCall(delay, () => {
            this.setVelocity(0, 0);
            if (this.stateMachine.isCurrentState(States.PATROL)) this.stateMachine.setState(States.IDLE);
        });

        // this.patrolTimer = this.scene.time.addEvent({
        //     delay: delay,
        //     callback: () => {
        //         this.setVelocity(0, 0);
        //         if (this.stateMachine.isCurrentState(States.PATROL)) this.stateMachine.setState(States.IDLE);
        //         // const wasX = this.flipX;
        //         // this.scene.tweens.add({
        //         //     delay: 1000,
        //         //     targets: this,
        //         //     x: this.originalPosition.x,
        //         //     y: this.originalPosition.y,
        //         //     duration: delay,
        //         //     // onUpdate: () => {
        //         //     //     if (this.flipX === wasX) this.flipX = !this.flipX;
        //         //     //     this.anims.play('player_running', true);
        //         //     //     // Need an if that's checking if the enemy has 'seen' the player through the AWARE state being in the stateMachine stack
        //         //     //     if (this.changeStateQueue?.[0] === States.AWARE) {
        //         //     //         console.log('Changing to Aware');
        //         //     //         this.setVelocity(0, 0);
        //         //     //         this.changeStateQueue.shift();
        //         //     //         this.stateMachine.setState(States.AWARE);
        //         //     //     };
        //         //     // },
        //         //     onComplete: () => { 
        //         //         this.setVelocity(0, 0);
        //         //         if (this.stateMachine.isCurrentState(States.PATROL)) this.stateMachine.setState(States.IDLE);
        //         //     }
        //         // });
        //     },
        //     callbackScope: this,
        //     loop: false,
        // });
    }; 
    onPatrolUpdate = (_dt) => { 
        this.setVelocity(this.patrolVelocity.x, this.patrolVelocity.y);
    };
    onPatrolExit = () => {
        // this.patrolTimer.destroy();
    };

    onAwarenessEnter = () => {
        this.anims.play('player_idle', true);
        this.setVelocity(0);
        this.scene.showDialog(true);
    };
    onAwarenessUpdate = (_dt) => {
        this.anims.play('player_idle', true);
        this.setStatic(true);
    };
    onAwarenessExit = () => {
        this.anims.stop('player_idle');
        this.setStatic(false);
        this.scene.showDialog(false);
    };

    onChaseEnter = () => {
        if (!this.attacking) return;
        this.anims.play('player_running', true);
        this.chaseTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.scene.navMesh.debugDrawClear();
                this.path = this.scene.navMesh.findPath(this.position, this.attacking.position);
                if (this.path && this.path.length > 1) {
                    if (!this.isPathing) this.isPathing = true;
                    const nextPoint = this.path[1];
                    this.nextPoint = nextPoint;
                    this.scene.navMesh.debugDrawPath(this.path, 0xffd900);
                    const pathDirection = new Phaser.Math.Vector2(this.nextPoint.x, this.nextPoint.y);
                    this.pathDirection = pathDirection;
                    this.pathDirection.subtract(this.position);
                    this.pathDirection.normalize();
                    const distanceToNextPoint = Math.sqrt((this.nextPoint.x - this.position.x) ** 2 + (this.nextPoint.y - this.position.y) ** 2);
                    if (distanceToNextPoint < 10) {
                        this.path.shift();
                    };
                };
            },
            callbackScope: this,
            loop: true
        }); 
    }; 
    onChaseUpdate = (_dt) => {
        if (!this.attacking) return;
        const rangeMultiplier = this.rangedDistanceMultiplier(3);
        const direction = this.attacking.position.subtract(this.position);
        const distance = direction.length();
        if (Math.abs(this.originPoint.x - this.position.x) > RANGE.LEASH * rangeMultiplier || Math.abs(this.originPoint.y - this.position.y) > RANGE.LEASH * rangeMultiplier || !this.inCombat || distance > RANGE.LEASH * rangeMultiplier) {
            this.stateMachine.setState(States.LEASH);
            return;
        };  
        if (distance >= 100 * rangeMultiplier) { // was 75
            if (this.path && this.path.length > 1) {
                this.setVelocity(this.pathDirection.x * (this.speed + 0.25), this.pathDirection.y * (this.speed + 0.25)); // 2.5
            } else {
                if (this.isPathing) this.isPathing = false;
                direction.normalize();
                this.setVelocity(direction.x * (this.speed + 0.25), direction.y * (this.speed + 0.25)); // 2.5
            };
        } else {
            this.stateMachine.setState(States.COMBAT);
        };
    }; 
    onChaseExit = () => {
        this.anims.stop('player_running');
        this.scene.navMesh.debugDrawClear();
        this.setVelocity(0, 0);
        if (this.chaseTimer) {
            this.chaseTimer.destroy();
            this.chaseTimer = undefined;
        };
    };

    onCombatEnter = () => {
        this.anims.play('player_running', true);
        this.attackTimer = this.scene.time.addEvent({
            delay: this.swingTimer,
            callback: () => {
                this.combat(this.attacking);
            },
            callbackScope: this,
            loop: true,
        });
    };
    onCombatUpdate = (_dt) => {
        this.evaluateCombatDistance();
    };
    onCombatExit = () => { 
        this.attackTimer.destroy();
        this.attackTimer = undefined;
    };

    onEvasionEnter = () => { 
        const x = Phaser.Math.Between(1, 100);
        const y = Phaser.Math.Between(1, 100);
        const evade = Phaser.Math.Between(1, 100); 
        this.evadeRight = x > 50 ? true : false;
        this.evadeUp = y > 50 ? true : false;
        if (evade > 50) {
            this.isDodging = true; 
        } else {
            this.isRolling = true; 
        }; 
        this.handleAnimations();
    };
    onEvasionUpdate = (_dt) => {
        if (this.isDodging) { 
            this.anims.play('player_slide', true);
        };
        if (this.isRolling) { 
            this.anims.play('player_roll', true);
        };
        if (this.evadeRight) {
            this.setVelocityX(this.speed); // Was 2
        } else {
            this.setVelocityX(-this.speed); // Was 2
        };
        if (this.evadeUp) {
            this.setVelocityY(this.speed); // Was 2
        } else {
            this.setVelocityY(-this.speed); // Was 2
        };
        if (!this.isDodging && !this.isRolling) this.evaluateCombatDistance();
    }; 
    onEvasionExit = () => {};

    onAttackEnter = () => {
        this.isAttacking = true;
        this.attack();
    };
    onAttackUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.isRanged) this.scene.combatMachine.input('computerAction', 'attack', this.enemyID);
        // && (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0)
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isAttacking) this.evaluateCombatDistance(); 
    };
    onAttackExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatMachine.input('computerAction', '', this.enemyID);
    };

    onParryEnter = () => {
        this.isParrying = true;
        this.parry();
    };
    onParryUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.PARRY_LIVE && !this.isRanged) this.scene.combatMachine.input('computerAction', 'parry', this.enemyID);
        // && (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0)
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isParrying) this.evaluateCombatDistance();
    };
    onParryExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatMachine.input('computerAction', '', this.enemyID);
        if (this.scene.state.computerParryGuess !== '') this.scene.combatMachine.input('computerParryGuess', '', this.enemyID);
    };

    onDodgeEnter = () => {
        this.isDodging = true; 
        this.wasFlipped = this.flipX; 
        this.body.parts[2].position.y += this.sensorDisp;
        this.body.parts[2].circleRadius = 21;
        this.body.parts[1].vertices[0].y += this.colliderDisp;
        this.body.parts[1].vertices[1].y += this.colliderDisp; 
        this.body.parts[0].vertices[0].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[1].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[0].vertices[1].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[0].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.handleAnimations();
    };
    onDodgeUpdate = (_dt) => {
        if (!this.isDodging) this.evaluateCombatDistance();
    };
    onDodgeExit = () => {
        this.body.parts[2].position.y -= this.sensorDisp;
        this.body.parts[2].circleRadius = 36;
        this.body.parts[1].vertices[0].y -= this.colliderDisp;
        this.body.parts[1].vertices[1].y -= this.colliderDisp; 
        this.body.parts[0].vertices[0].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[1].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[0].vertices[1].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[0].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
    };

    onPostureEnter = () => {
        this.isPosturing = true;
        this.posture();
    };
    onPostureUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.isRanged) this.scene.combatMachine.input('computerAction', 'posture', this.enemyID);
        // && (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0)
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isPosturing) this.evaluateCombatDistance();
    };
    onPostureExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatMachine.input('computerAction', '', this.enemyID);
    };

    onRollEnter = () => {
        this.isRolling = true; 
        this.body.parts[2].position.y += this.sensorDisp;
        this.body.parts[2].circleRadius = 21;
        this.body.parts[1].vertices[0].y += this.colliderDisp;
        this.body.parts[1].vertices[1].y += this.colliderDisp; 
        this.handleAnimations();
    };
    onRollUpdate = (_dt) => { 
        if (this.frameCount === FRAME_COUNT.ROLL_LIVE && !this.isRanged) this.scene.combatMachine.input('computerAction', 'roll', this.enemyID);
        if (!this.isRolling) this.evaluateCombatDistance();
    };
    onRollExit = () => { 
        if (this.scene.state.computerAction !== '') this.scene.combatMachine.input('computerAction', '', this.enemyID);   
        this.body.parts[2].position.y -= this.sensorDisp;
        this.body.parts[2].circleRadius = 36;
        this.body.parts[1].vertices[0].y -= this.colliderDisp;
        this.body.parts[1].vertices[1].y -= this.colliderDisp;
    };

    onLeashEnter = () => {
        this.anims.play('player_running', true);
        if (this.attacking) {
            this.attacking.removeTarget(this.enemyID);
            this.attacking = undefined;
            this.inCombat = false;
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Leashing', 1500, 'effect');
        };
        this.leashTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                let originPoint = new Phaser.Math.Vector2(this.originPoint.x, this.originPoint.y);
                this.scene.navMesh.debugDrawClear();
                this.path = this.scene.navMesh.findPath(this.position, originPoint);
                if (this.path && this.path.length > 1) {
                    if (!this.isPathing) this.isPathing = true;
                    const nextPoint = this.path[1];
                    this.nextPoint = nextPoint;
                    this.scene.navMesh.debugDrawPath(this.path, 0xffd900);
                    const pathDirection = new Phaser.Math.Vector2(this.nextPoint.x, this.nextPoint.y);
                    this.pathDirection = pathDirection;
                    this.pathDirection.subtract(this.position);
                    this.pathDirection.normalize();
                    const distanceToNextPoint = Math.sqrt((this.nextPoint.x - this.position.x) ** 2 + (this.nextPoint.y - this.position.y) ** 2);
                    if (distanceToNextPoint < 10) {
                        this.path.shift();
                    };
                };
            },
            callbackScope: this,
            loop: true
        }); 
    };
    onLeashUpdate = (_dt) => {
        let originPoint = new Phaser.Math.Vector2(this.originPoint.x, this.originPoint.y);
        let direction = originPoint.subtract(this.position);
        
        if (direction.length() >= 10) {
            if (this.path && this.path.length > 1) {
                this.setVelocity(this.pathDirection.x * (this.speed + 0.75), this.pathDirection.y * (this.speed + 0.75)); // 2.5
            } else {
                if (this.isPathing) this.isPathing = false;
                direction.normalize();
                this.setVelocity(direction.x * (this.speed + 0.75), direction.y * (this.speed + 0.75)); // 2.5
            };
        } else {
            this.stateMachine.setState(States.IDLE);
        };
    };
    onLeashExit = () => {
        this.anims.stop('player_running');
        this.setVelocity(0, 0);
        this.leashTimer.destroy();
        this.leashTimer = undefined;
        this.scene.navMesh.debugDrawClear(); 
    };

    // ========================== STATUS EFFECT STATES ========================== \\

    onConsumedEnter = () => {
        this.consumedDuration = DURATION.CONSUMED;
        this.clearAnimations();
        this.consumedTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => {
                if (this.attacking) {
                    const direction = this.attacking.position.subtract(this.position);
                    direction.normalize();
                    this.setVelocity(direction.x * (this.speed / 2), direction.y * (this.speed / 2)); // 0.75
                };
            },
            callbackScope: this,
            loop: true,
        });
    };
    onConsumedUpdate = (dt) => {
        this.anims.play('player_hurt', true);
        this.consumedDuration -= dt;
        if (this.consumedDuration <= 0) this.isConsumed = false;
        if (!this.isConsumed) this.evaluateCombatDistance();
    };
    onConsumedExit = () => {
        this.clearAnimations();
        if (this.consumedTimer) {
            this.consumedTimer.destroy();
            this.consumedTimer = undefined;
        };
        this.setGlow(this, false);
        this.isConsumed = false;
    };

    onFearEnter = () => { 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Feared', DURATION.TEXT, 'damage');
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.fearDirection = 'down';
        this.fearMovement = 'idle';
        this.fearVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ''; 
        this.setGlow(this, true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === 'up') {
                    this.fearVelocity = { x: 0, y: -1.25 };
                } else if (direction === 'down') {
                    this.fearVelocity = { x: 0, y: 1.25 };
                } else if (direction === 'right') {
                    this.fearVelocity = { x: -1.25, y: 0 };
                } else if (direction === 'left') {
                    this.fearVelocity = { x: 1.25, y: 0 };
                };
                this.fearMovement = 'move';
            } else {
                this.fearVelocity = { x: 0, y: 0 };
                this.fearMovement = 'idle';                
            };
            this.fearDirection = direction;
        };

        this.fearTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                if (iteration === 3) {
                    iteration = 0;
                    this.isFeared = false;
                } else {   
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, '...ahhh!', 1000, 'effect');
                };
            },
            callbackScope: this,
            repeat: 3,
        }); 

    };
    onFearUpdate = (_dt) => {
        if (!this.isFeared) this.evaluateCombatDistance();
        this.setVelocity(this.fearVelocity.x, this.fearVelocity.y);
        if (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0) {
            this.getDirection();
            this.anims.play(`player_running`, true);
        } else {
            this.anims.play(`player_idle`, true);
        };
    };
    onFearExit = () => { 
        if (this.isFeared) this.isFeared = false;
        this.evaluateCombatDistance();
        this.anims.play('player_running', true);
        this.spriteWeapon.setVisible(true);
        if (this.fearTimer) {
            this.fearTimer.destroy();
            this.fearTimer = undefined;
        };
        this.setGlow(this, false);
    };

    onFrozenEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Frozen', DURATION.TEXT, 'cast');
        if (!this.isPolymorphed) this.clearAnimations();
        this.anims.play('player_idle', true);
        this.setTint(0x0000FF); // 0x888888
        this.setStatic(true);
        this.scene.time.addEvent({
            delay: DURATION.FROZEN,
            callback: () => {
                this.isFrozen = false;
                this.metaMachine.setState(States.CLEAN);
            },
            callbackScope: this,
            loop: false,
        });
    };
    onFrozenUpdate = (_dt) => {
        if (!this.isPolymorphed) {
            if (!this.checkIfAnimated()) this.anims.play('player_idle', true);
            this.evaluateCombatDistance();
        }; 
    };
    onFrozenExit = () => {
        this.clearTint();
        this.setTint(0x000000);
        this.setStatic(false);
    };

    onHurtEnter = () => {
        this.clearAnimations();
        this.clearTint();
        this.isHurt = true;
        this.scene.time.delayedCall(250, () => {
            this.isHurt = false;
        });
    };
    onHurtUpdate = (_dt) => {
        this.anims.play('player_hurt', true);
        if (!this.isHurt) {
            if (this.inCombat) {
                this.stateMachine.setState(States.COMBAT);
            } else {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onHurtExit = () => {
        this.isHurt = false;
        this.setTint(0x000000);
    };

    onPolymorphEnter = () => {
        this.isPolymorphed = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphed', DURATION.TEXT, 'effect');
        this.clearAnimations();
        this.clearTint();
        this.anims.pause();
        this.anims.play('rabbit_idle_down', true);
        this.anims.resume();
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.polymorphDirection = 'down';
        this.polymorphMovement = 'idle';
        this.polymorphVelocity = { x: 0, y: 0 };

        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ''; 

        let iteration = 0;
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === 'up') {
                    this.polymorphVelocity = { x: 0, y: -1 };
                } else if (direction === 'down') {
                    this.polymorphVelocity = { x: 0, y: 1 };
                } else if (direction === 'right') {
                    this.polymorphVelocity = { x: -1, y: 0 };
                } else if (direction === 'left') {
                    this.polymorphVelocity = { x: 1, y: 0 };
                };
                this.polymorphMovement = 'move';
            } else {
                this.polymorphVelocity = { x: 0, y: 0 };
                this.polymorphMovement = 'idle';                
            };
            this.polymorphDirection = direction;
        };

        this.polymorphTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                iteration++;
                if (iteration === 5) {
                    iteration = 0;
                    this.isPolymorphed = false;
                } else {   
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, '...thump', 1000, 'effect');
                    if (this.isCurrentTarget && this.health < this.ascean.health.max) {
                        this.health = (this.health + (this.ascean.health.max * 0.3)) > this.ascean.health.max ? this.ascean.health.max : (this.health + (this.ascean.health.max * 0.3));
                        if (this.scene.state.enemyID === this.enemyID) {
                            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: this.health } });
                        };
                        // EventBus.emit('update-combat-state', { newComputerHealth: this.health });
                    } else if (this.health < this.ascean.health.max) {
                        this.health = this.health + (this.ascean.health.max * 0.3);
                        this.healthbar.setValue(this.health);
                        this.updateHealthBar(this.health);
                    };
                };
            },
            callbackScope: this,
            repeat: 5,
        }); 

    };
    onPolymorphUpdate = (_dt) => {
        if (!this.isPolymorphed) this.evaluateCombatDistance();
        this.anims.play(`rabbit_${this.polymorphMovement}_${this.polymorphDirection}`, true);
        this.setVelocity(this.polymorphVelocity.x, this.polymorphVelocity.y);
    };
    onPolymorphExit = () => { 
        if (this.isPolymorphed) this.isPolymorphed = false;
        this.evaluateCombatDistance();
        this.clearAnimations();
        this.anims.play('player_running', true);
        this.setTint(0x000000);
        this.spriteWeapon.setVisible(true);
        if (this.polymorphTimer) {
            this.polymorphTimer.destroy();
            this.polymorphTimer = undefined;
        };
    };

    onStunEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', 2500, 'damage', true);
        this.stunDuration = DURATION.STUN;
        // this.anims.play('player_idle', true);
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ''; 
        this.anims.pause();
        
        this.setTint(0x888888); // 0x888888
        this.setStatic(true);

        this.stunTimer = this.scene.time.addEvent({
            delay: this.stunDuration,
            callback: () => {
                this.isBlindsided = false;
                this.isStunned = false;
                if (this.stunTimer) {
                    this.stunTimer.destroy();
                    this.stunTimer = undefined;
                };
            },
            callbackScope: this,
            loop: false,
        });
    };
    onStunUpdate = (dt) => {
        this.setVelocity(0);
        if (!this.isStunned) this.evaluateCombatDistance(); // Wasn't if (!this.isStunned)
    };
    onStunExit = () => { 
        this.setTint(0x000000)
        this.setStatic(false);
        this.anims.resume();
    };

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onRootEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Rooted', DURATION.TEXT, 'damage');
        if (!this.isPolymorphed) this.clearAnimations();
        this.setTint(0x888888); // 0x888888
        this.setStatic(true);
        this.scene.time.addEvent({
            delay: DURATION.ROOT,
            callback: () => {
                this.isRooted = false;
                this.metaMachine.setState(States.CLEAN);
            },
            callbackScope: this,
            loop: false,
        });
    };
    onRootUpdate = (dt) => {
        if (!this.isPolymorphed) {
            if (!this.checkIfAnimated()) this.anims.play('player_idle', true);
            this.evaluateCombatDistance();
        }; 
    };
    onRootExit = () => {  
        this.clearTint();
        this.setTint(0x000000);
        this.setStatic(false);
    };

    onSlowEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slowed', DURATION.TEXT, 'damage');
        this.slowDuration = DURATION.SLOW;
        this.setTint(0xFFC700); // 0x888888
        this.adjustSpeed(-1);
        this.scene.time.delayedCall(this.slowDuration, () =>{
            this.isSlowed = false;
            this.metaMachine.setState(States.CLEAN);
        });
    };

    onSlowExit = () => {
        this.clearTint();
        this.setTint(0x000000);
        this.adjustSpeed(1);
    };

    onSnareEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snared', DURATION.TEXT, 'damage');
        this.snareDuration = 3000;
        this.setTint(0x0000FF); // 0x888888
        this.adjustSpeed(-1.5);
        this.scene.time.delayedCall(this.snareDuration, () =>{
            this.isSnared = false;
            this.metaMachine.setState(States.CLEAN);
        });
    };
    // onSnareUpdate = (dt) => {};
    onSnareExit = () => { 
        this.clearTint();
        this.setTint(0x000000);
        this.adjustSpeed(1.5);
    };

    enemyActionSuccess = () => {
        if (this.isRanged) this.scene.checkPlayerSuccess();
        const shimmer = Math.random() * 101;
        if (this.scene.player.isEnveloping || this.scene.player.isShielding || (this.scene.player.isShimmering && shimmer > 50) || this.scene.player.isWarding) {
            if (this.scene.player.isEnveloping) {
                this.scene.player.envelopHit();
            };
            if (this.scene.player.isShielding) {
                this.scene.player.shieldHit();
            };
            if (this.scene.player.isShimmering) {
                this.scene.player.shimmerHit();
            };
            if (this.scene.player.isWarding) {
                this.scene.player.wardHit();
            };
            if (this.particleEffect) {
                this.scene.particleManager.removeEffect(this.particleEffect.id);
                this.particleEffect.effect.destroy();
                this.particleEffect = undefined;
            };
            return;
        };
        if (this.scene.player.isMending) this.scene.player.mendHit();
        if (this.particleEffect) {
            if (this.isCurrentTarget) {
                this.scene.combatMachine.action({ type: 'Weapon', data: { key: 'computerAction', value: this.particleEffect.action, id: this.enemyID } });
            } else {
                this.scene.combatMachine.action({ type: 'Enemy', data: { enemyID: this.enemyID, ascean: this.ascean, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.particleEffect.action, parry: this.parryAction, id: this.enemyID }}});
            };
            this.scene.particleManager.removeEffect(this.particleEffect.id);
            this.particleEffect.effect.destroy();
            this.particleEffect = undefined;
        } else {
            if (this.isCurrentTarget) {
                if (this.scene.state.computerAction === '') return;
                this.scene.combatMachine.action({ type: 'Weapon', data: { key: 'computerAction', value: this.scene.state.computerAction, id: this.enemyID } });
            } else {
                this.scene.combatMachine.action({ type: 'Enemy', data: { enemyID: this.enemyID, ascean: this.ascean, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.currentAction, parry: this.parryAction, id: this.enemyID }}});
            };
        }; 
        // screenShake(this.scene);
    };

    enemyDodge = () => {
        this.dodgeCooldown = 50; // Was a 6x Mult for Dodge Prev aka 1728
        const dodgeDistance = DISTANCE.DODGE; // 126
        const dodgeDuration = DURATION.DODGE; // 18  
        let currentDistance = 0;
        const dodgeLoop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= dodgeDuration || currentDistance >= dodgeDistance) {
                this.spriteWeapon.setVisible(true);
                this.dodgeCooldown = 0;
                this.isDodging = false;
                this.currentAction = '';
                return;
            };
            const direction = !this.flipX ? -(dodgeDistance / dodgeDuration) : (dodgeDistance / dodgeDuration);
            if (Math.abs(this.velocity.x) > 0.1) this.setVelocityX(direction);
            if (this.velocity.y > 0.1) this.setVelocityY(dodgeDistance / dodgeDuration);
            if (this.velocity.y < -0.1) this.setVelocityY(-dodgeDistance / dodgeDuration);
            currentDistance += Math.abs(dodgeDistance / dodgeDuration);
            requestAnimationFrame(dodgeLoop);
        };
        let startTime = undefined;
        requestAnimationFrame(dodgeLoop);
    };

    enemyRoll = () => {
        this.rollCooldown = 50; // Was a x7 Mult for Roll Prev aka 2240
        const rollDistance = DISTANCE.ROLL; // 140
        const rollDuration = DURATION.ROLL; // 20
        let currentDistance = 0;
        const rollLoop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= rollDuration || currentDistance >= rollDistance) {
                this.spriteWeapon.setVisible(true);
                this.rollCooldown = 0;
                this.isRolling = false;
                this.currentAction = '';
                return;
            };
            const direction = this.flipX ? -(rollDistance / rollDuration) : (rollDistance / rollDuration);
            if (Math.abs(this.velocity.x) > 0.1) this.setVelocityX(direction);
            if (this.velocity.y > 0.1) this.setVelocityY(rollDistance / rollDuration);
            if (this.velocity.y < -0.1) this.setVelocityY(-rollDistance / rollDuration);
            currentDistance += Math.abs(rollDistance / rollDuration);
            requestAnimationFrame(rollLoop);
        };
        let startTime = undefined;
        requestAnimationFrame(rollLoop);
    };

    handleAnimations = () => {
        if (this.isDodging) {
            this.anims.play('player_slide', true);
            this.spriteWeapon.setVisible(false);
            if (this.dodgeCooldown === 0) this.enemyDodge();
        };
        if (this.isRolling) {
            this.anims.play('player_roll', true);
            this.spriteWeapon.setVisible(false);
            if (this.rollCooldown === 0) this.enemyRoll();
        }; 
    };

    swingMomentum = (target) => {
        if (!target) return;
        let direction = target.position.subtract(this.position);
        direction.normalize();
        this.setVelocity(direction.x * DISTANCE.MOMENTUM, direction.y * DISTANCE.MOMENTUM);
    };

    rangedDistanceMultiplier = (num) => {
        return this.isRanged ? num : 1;
    };

    evaluateCombatDistance = () => {
        if (!this.attacking || !this.inCombat) {
            this.stateMachine.setState(States.LEASH);
            return;
        };  
        // console.log('===================== Evaluating Combat Distance =====================') 
        let direction = this.attacking.position.subtract(this.position);
        const distanceY = Math.abs(direction.y);
        const multiplier = this.rangedDistanceMultiplier(DISTANCE.RANGED_MULTIPLIER);
        if (direction.length() >= DISTANCE.CHASE * multiplier) { // > 525
            // ******************************************************************
            // Switch to CHASE MODE.
            // ******************************************************************
            this.stateMachine.setState(States.CHASE);
        } else if (this.isRanged) {
            // ******************************************************************
            // Contiually Checking Distance for RANGED ENEMIES.
            // ******************************************************************
            if (!this.stateMachine.isCurrentState(States.COMBAT)) this.stateMachine.setState(States.COMBAT);
            if (distanceY > DISTANCE.RANGED_ALIGNMENT) {
                this.anims.play('player_running', true);
                direction.normalize();
                this.setVelocityY(direction.y * this.speed + 0.5); // 2 || 4
            };
            if (this.attacking.position.subtract(this.position).length() > DISTANCE.THRESHOLD * multiplier) { // 225-525 
                this.anims.play('player_running', true);
                direction.normalize();
                this.setVelocityX(direction.x * (this.speed)); // 2.25
                this.setVelocityY(direction.y * (this.speed)); // 2.25          
            } else if (this.attacking.position.subtract(this.position).length() < DISTANCE.THRESHOLD && !this.attacking.isRanged) { // < 75
                // ******************************************************************
                // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
                // ******************************************************************
                this.anims.play('player_running', true);
                direction.normalize();
                this.setVelocityX(direction.x * -this.speed); // -2.25 | -2 | -1.75
                this.setVelocityY(direction.y * -this.speed); // -1.5 | -1.25
            } else if (distanceY < 7) { // Comfy
                // ******************************************************************
                // The Sweet Spot for RANGED ENEMIES.
                // ******************************************************************
                this.setVelocity(0);
                this.anims.play('player_idle', true);
            } else { // Between 75 and 225 and outside y-distance
                direction.normalize();
                this.setVelocityY(direction.y * (this.speed)); // 2.25
            };
        } else { // Melee
            // ******************************************************************
            // Contiually Maintaining Reach for MELEE ENEMIES.
            // ******************************************************************
            if (!this.stateMachine.isCurrentState(States.COMBAT)) this.stateMachine.setState(States.COMBAT);
            if (direction.length() > DISTANCE.ATTACK) { 
                this.anims.play('player_running', true);
                direction.normalize();
                this.setVelocityX(direction.x * (this.speed)); // 2.5
                this.setVelocityY(direction.y * (this.speed)); // 2.5
            } else { // Inside melee range
                this.setVelocity(0);
                this.anims.play('player_idle', true);
            };
        };
    };

    checkEvasion = (particle) => {
        const particleVector = new Phaser.Math.Vector2(particle.effect.x, particle.effect.y);
        const enemyVector = new Phaser.Math.Vector2(this.x, this.y);
        const distance = particleVector.subtract(enemyVector);
        if (distance.length() < (DISTANCE.THRESHOLD - 25)) { // 50 || 100
            return true;
        };
        return false;
    };

    getEnemyParticle = () => {
        return this.attacking.particleEffect
            ? this.scene.particleManager.getEffect(this.attacking.particleEffect.id)
            : undefined;
    };

    isUnderRangedAttack = () => {
        const player = this.getEnemyParticle();
        if (!player) return false;
        return (this.attacking.isRanged && this.checkEvasion(player) && !this.stateMachine.isCurrentState(States.EVADE));
    }; 

    currentTargetCheck = () => {
        if (this.scene.state.enemyID === this.enemyID && !this.isCurrentTarget) { // attacking.currentTarget?.enemyID
            this.isCurrentTarget = true;
        } else if (this.scene.state.enemyID !== this.enemyID && this.isCurrentTarget) {
            this.isCurrentTarget = false;
        };
    };

    currentWeaponCheck = () => {
        if (this.spriteWeapon && this.spriteShield) {
            this.spriteWeapon.setPosition(this.x, this.y);
            this.spriteShield.setPosition(this.x, this.y);
            this.weaponRotation('enemy', this.attacking);
        };
        if (!this.currentWeapon || this.currentWeaponSprite === this.imgSprite(this.currentWeapon) || this.enemyID !== this.scene.state.enemyID) return;
        this.currentWeaponSprite = this.imgSprite(this.currentWeapon);
        this.spriteWeapon.setTexture(this.currentWeaponSprite);
        const gripScale = { 'One Hand': 0.5, 'Two Hand': 0.65 };
        this.spriteWeapon.setScale(gripScale[this.currentWeapon.grip]);
    };

    currentParticleCheck = () => {
        if (!this.particleEffect.triggered) this.scene.particleManager.update(this, this.particleEffect);
        if (this.particleEffect.success) {
            this.particleEffect.triggered = true;
            this.particleEffect.success = false;
            this.enemyActionSuccess();
        };
    };

    getDirection = () => {
        const direction = this.attacking.position.subtract(this.position);
        if (direction.x < 0 && !this.flipX) {
            this.setFlipX(true);
        } else if (direction.x > 0 && this.flipX) {
            this.setFlipX(false);
        };
    }; 
    
    evaluateEnemyState = () => {
        this.currentWeaponCheck();
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText) this.scrollingCombatText.update(this);
        if (this.specialCombatText) this.specialCombatText.update(this);
        if (!this.inCombat) return;
        // console.log('===================== Evaluating Enemy State =====================') 

        if (this.isFeared && !this.stateMachine.isCurrentState(States.FEAR)) {
            this.stateMachine.setState(States.FEAR);
            return;
        };
        if (this.isPolymorphed && !this.stateMachine.isCurrentState(States.POLYMORPH)) {
            this.stateMachine.setState(States.POLYMORPH);
            return;
        };
        if (this.isStunned && !this.stateMachine.isCurrentState(States.STUN)) {
            // console.log('Stunned OG')
            // this.setStun();
            this.stateMachine.setState(States.STUN);
            return;
        };
        if (this.isConsumed && !this.stateMachine.isCurrentState(States.CONSUMED)) {
            this.stateMachine.setState(States.CONSUMED);
            return;
        };
        if (this.isRooted && !this.metaMachine.isCurrentState(States.ROOT)) {
            this.metaMachine.setState(States.ROOT);
            return;
        };
        if (this.isFrozen && !this.metaMachine.isCurrentState(States.FROZEN)) {
            this.metaMachine.setState(States.FROZEN);
            return;
        };
        if (this.isSlowed && !this.metaMachine.isCurrentState(States.SLOW)) {
            this.metaMachine.setState(States.SLOW);
            return;
        };
        if (this.isSnared && !this.metaMachine.isCurrentState(States.SNARE)) {
            this.metaMachine.setState(States.SNARE); 
            return;    
        };
        if (this.isBlindsided && !this.stateMachine.isCurrentState(States.STUN)) {
            // console.log('Blindsided')
            // this.setStun();
            this.stateMachine.setState(States.STUN);
            this.isBlindsided = false;
            return;
        };
        if (this.actionSuccess) {
            this.actionSuccess = false;
            this.enemyActionSuccess();
        };
        if (this.particleEffect) this.currentParticleCheck();

        if (this.attacking) {
            if (!this.isPolymorphed && !this.isFeared) {
                if (this.isUnderRangedAttack()) {
                    this.stateMachine.setState(States.EVADE);
                    return;
                };
                this.getDirection();
            };
            this.currentTargetCheck();
        } else if (!this.stateMachine.isCurrentState(States.PATROL)) {
            this.setFlipX(this.velocity.x < 0);
        };

        switch (this.currentAction) {
            case 'attack':
                this.stateMachine.setState(States.ATTACK);
                break;
            case 'parry':
                this.stateMachine.setState(States.PARRY);
                break;
            case 'dodge':
                this.stateMachine.setState(States.DODGE);
                break;
            case 'roll':
                this.stateMachine.setState(States.ROLL);
                break;
            case 'posture':
                this.stateMachine.setState(States.POSTURE);
                break; 
            case 'pray':
                this.isPraying = true;
                break;
            case 'consume':
                this.isConsuming = true;
                break;
            default:
                break;                        
        }; 
    };
 
    update() {
        this.evaluateEnemyState(); 
        this.metaMachine.update(this.scene.sys.game.loop.delta);   
        this.stateMachine.update(this.scene.sys.game.loop.delta);
    };

    combat = (target) => { 
        if (!this.inCombat) return;
        const action = this.evaluateCombat(target);
        this.currentAction = action;
    };

    evaluateCombat = (target) => {  
        let computerAction;
        // let computerCounter;
        let actionNumber = Math.floor(Math.random() * 101);
        const computerActions = {
            attack: 40 + this.scene.state.attackWeight,
            parry: 10 + this.scene.state.parryWeight,
            dodge: 10 + this.scene.state.dodgeWeight,
            posture: 20 + this.scene.state.postureWeight,
            roll: 20 + this.scene.state.rollWeight,
            parryAttack: 25 + this.scene.state.parryAttackWeight,
            parryParry: 25 + this.scene.state.parryParryWeight,
            parryPosture: 25 + this.scene.state.parryPostureWeight,
            parryRoll: 25 + this.scene.state.parryRollWeight,
            rollRating: this.currentWeapon ? this.currentWeapon.roll : this.ascean.weaponOne.roll,
            armorRating: (this.scene.state.computerDefense.physicalPosture + this.scene.state.computerDefense.magicalPosture)  /  4,
        };
        if (actionNumber > (100 - computerActions.attack) || target.isStunned) {
            computerAction = 'attack';
        } else if (actionNumber > (100 - computerActions.attack - computerActions.parry) && !this.isRanged) {
            computerAction = 'parry';
        } else if (actionNumber > (100 - computerActions.attack - computerActions.parry - computerActions.posture)) {
            computerAction = 'posture';
        } else if (actionNumber > (100 - computerActions.attack - computerActions.parry - computerActions.posture - computerActions.roll)) {
            computerAction = 'roll';
        } else {
            computerAction = 'dodge';
        };

        // if (computerAction === 'parry') {
        //     let counterNumber = Math.floor(Math.random() * 101);
        //     if (counterNumber > (100 - computerActions.parryAttack) || target.isAttacking) {
        //         computerCounter = 'attack';
        //     } else if (counterNumber > (100 - computerActions.parryAttack - computerActions.parryParry) || target.isParrying) {
        //         computerCounter = 'parry';
        //     } else if (counterNumber > (100 - computerActions.parryAttack - computerActions.parryParry - computerActions.parryPosture) || target.isPosturing) {
        //         computerCounter = 'posture';
        //     } else if (counterNumber > (100 - computerActions.parryAttack - computerActions.parryParry - computerActions.parryPosture - computerActions.parryRoll) || target.isRolling) {
        //         computerCounter = 'roll';
        //     } else {
        //         computerCounter = ['attack', 'parry', 'posture', 'roll'][Math.floor(Math.random() * 4)];
        //     };
        //     this.parryAction = computerCounter;
        //     this.scene.combatMachine.input('computerParryGuess', computerCounter, this.enemyID);
        // } else if (this.scene.state.computerParryGuess !== '') {
        //     this.scene.combatMachine.input('computerParryGuess', '', this.enemyID);
        //     this.parryAction = '';
        // };
        return computerAction;
    };
};
