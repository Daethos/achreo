import Entity, { FRAME_COUNT } from "./Entity"; 
import StateMachine, { States } from "../phaser/StateMachine";
import HealthBar from "../phaser/HealthBar";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import { EventBus } from "../EventBus";
import { v4 as uuidv4 } from 'uuid';
import { PLAYER } from "../../utility/player";
import CastingBar from "../phaser/CastingBar";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";
import { DISTANCE, DURATION, ENEMY_SPECIAL, GRIP_SCALE, INSTINCTS, RANGE } from "../../utility/enemy";
import { screenShake, vibrate } from "../phaser/ScreenShake";

const ENEMY_COLOR = 0xFF0000;
const TARGET_COLOR = 0x00FF00;
const { Body, Bodies } = Phaser.Physics.Matter.Matter;

export default class Enemy extends Entity {
    constructor(data) {
        super({ ...data, name: "enemy", ascean: undefined, health: 1 }); 
        this.scene.add.existing(this);
        this.enemyID = uuidv4();
        this.createEnemy();
        this.setTint(ENEMY_COLOR);
        this.stateMachine = new StateMachine(this, 'enemy');
        this.stateMachine
            .addState(States.IDLE, { onEnter: this.onIdleEnter, onUpdate: this.onIdleUpdate, onExit: this.onIdleExit })
            .addState(States.PATROL, { onEnter: this.onPatrolEnter, onUpdate: this.onPatrolUpdate, onExit: this.onPatrolExit })
            .addState(States.AWARE, { onEnter: this.onAwarenessEnter, onUpdate: this.onAwarenessUpdate, onExit: this.onAwarenessExit })
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.COMBAT, { onEnter: this.onCombatEnter, onUpdate: this.onCombatUpdate, onExit: this.onCombatExit })
            .addState(States.EVADE, { onEnter: this.onEvasionEnter, onUpdate: this.onEvasionUpdate, onExit: this.onEvasionExit })
            .addState(States.LEASH, { onEnter: this.onLeashEnter, onUpdate: this.onLeashUpdate, onExit: this.onLeashExit })
            .addState(States.ATTACK, { onEnter: this.onAttackEnter, onUpdate: this.onAttackUpdate, onExit: this.onAttackExit })
            .addState(States.PARRY, { onEnter: this.onParryEnter, onUpdate: this.onParryUpdate, onExit: this.onParryExit })
            .addState(States.THRUST, { onEnter: this.onThrustEnter, onUpdate: this.onThrustUpdate, onExit: this.onThrustExit })
            .addState(States.DODGE, { onEnter: this.onDodgeEnter, onUpdate: this.onDodgeUpdate, onExit: this.onDodgeExit })
            .addState(States.POSTURE, { onEnter: this.onPostureEnter, onUpdate: this.onPostureUpdate, onExit: this.onPostureExit })
            .addState(States.ROLL, { onEnter: this.onRollEnter, onUpdate: this.onRollUpdate, onExit: this.onRollExit,    }) // ===== Negative States =====
            .addState(States.CONFUSED, { onEnter: this.onConfusedEnter, onUpdate: this.onConfusedUpdate, onExit: this.onConfusedExit })
            .addState(States.COUNTERSPELLED, { onEnter: this.onCounterSpelledEnter, onUpdate: this.onCounterSpelledUpdate, onExit: this.onCounterSpelledExit })
            .addState(States.FEARED, { onEnter: this.onFearedEnter, onUpdate: this.onFearedUpdate, onExit: this.onFearedExit })
            .addState(States.PARALYZED, { onEnter: this.onParalyzedEnter, onUpdate: this.onParalyzedUpdate, onExit: this.onParalyzedExit })
            .addState(States.POLYMORPHED, { onEnter: this.onPolymorphEnter, onUpdate: this.onPolymorphUpdate, onExit: this.onPolymorphExit })
            .addState(States.STUNNED, { onEnter: this.onStunEnter, onUpdate: this.onStunUpdate, onExit: this.onStunExit })
            .addState(States.CONSUMED, { onEnter: this.onConsumedEnter, onUpdate: this.onConsumedUpdate, onExit: this.onConsumedExit })
            .addState(States.HURT, { onEnter: this.onHurtEnter, onUpdate: this.onHurtUpdate, onExit: this.onHurtExit })
            .addState(States.DEATH, { onEnter: this.onDeathEnter, onUpdate: this.onDeathUpdate })
            .addState(States.DEFEATED, { onEnter: this.onDefeatedEnter }) // ====== Special States ======
            .addState(States.ASTRAVE, { onEnter: this.onAstraveEnter, onUpdate: this.onAstraveUpdate, onExit: this.onAstraveExit })
            .addState(States.BLINK, { onEnter: this.onBlinkEnter, onUpdate: this.onBlinkUpdate, onExit: this.onBlinkExit })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onExit: this.onDesperationExit })
            .addState(States.FEAR, { onEnter: this.onFearingEnter, onUpdate: this.onFearingUpdate, onExit: this.onFearingExit })
            .addState(States.HEALING, { onEnter: this.onHealingEnter, onUpdate: this.onHealingUpdate, onExit: this.onHealingExit })
            .addState(States.ILIRECH, { onEnter: this.onIlirechEnter, onUpdate: this.onIlirechUpdate, onExit: this.onIlirechExit })
            .addState(States.KYRNAICISM, { onEnter: this.onKyrnaicismEnter, onUpdate: this.onKyrnaicismUpdate, onExit: this.onKyrnaicismExit })
            .addState(States.LEAP, { onEnter: this.onLeapEnter, onUpdate: this.onLeapUpdate, onExit: this.onLeapExit })
            .addState(States.MAIERETH, { onEnter: this.onMaierethEnter, onUpdate: this.onMaierethUpdate, onExit: this.onMaierethExit })
            .addState(States.POLYMORPH, { onEnter: this.onPolymorphingEnter, onUpdate: this.onPolymorphingUpdate, onExit: this.onPolymorphingExit })
            .addState(States.PURSUIT, { onEnter: this.onPursuitEnter, onUpdate: this.onPursuitUpdate, onExit: this.onPursuitExit })
            .addState(States.RECONSTITUTE, { onEnter: this.onReconstituteEnter, onUpdate: this.onReconstituteUpdate, onExit: this.onReconstituteExit })
            .addState(States.RUSH, { onEnter: this.onRushEnter, onUpdate: this.onRushUpdate, onExit: this.onRushExit })
            .addState(States.SACRIFICE, { onEnter: this.onSacrificeEnter, onUpdate: this.onSacrificeUpdate, onExit: this.onSacrificeExit })
            .addState(States.SLOWING, { onEnter: this.onSlowingEnter, onUpdate: this.onSlowingUpdate, onExit: this.onSlowingExit })
            .addState(States.SNARE, { onEnter: this.onSnaringEnter, onUpdate: this.onSnaringUpdate, onExit: this.onSnaringExit })
            .addState(States.SUTURE, { onEnter: this.onSutureEnter, onUpdate: this.onSutureUpdate, onExit: this.onSutureExit })
            .addState(States.TSHAERAL, { onEnter: this.onDevourEnter, onUpdate: this.onDevourUpdate, onExit: this.onDevourExit });
        this.stateMachine.setState(States.IDLE);
        this.positiveMachine = new StateMachine(this, 'enemy');
        this.positiveMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.CHIOMIC, { onEnter: this.onChiomicEnter, onUpdate: this.onChiomicUpdate })
            .addState(States.DISEASE, { onEnter: this.onDiseaseEnter, onUpdate: this.onDiseaseUpdate })
            .addState(States.FREEZE, { onEnter: this.onFreezeEnter, onUpdate: this.onFreezeUpdate })
            .addState(States.HOWL, { onEnter: this.onHowlEnter, onUpdate: this.onHowlUpdate })
            .addState(States.MALICE, { onEnter: this.onMaliceEnter, onUpdate: this.onMaliceUpdate })
            .addState(States.MENACE, { onEnter: this.onMenaceEnter, onUpdate: this.onMenaceUpdate })
            .addState(States.MEND, { onEnter: this.onMendEnter, onUpdate: this.onMendUpdate })
            .addState(States.MULTIFARIOUS, { onEnter: this.onMultifariousEnter, onUpdate: this.onMultifariousUpdate })
            .addState(States.MYSTIFY, { onEnter: this.onMystifyEnter, onUpdate: this.onMystifyUpdate })
            .addState(States.PROTECT, { onEnter: this.onProtectEnter, onUpdate: this.onProtectUpdate })
            .addState(States.RENEWAL, { onEnter: this.onRenewalEnter, onUpdate: this.onRenewalUpdate })
            .addState(States.SCREAM, { onEnter: this.onScreamEnter, onUpdate: this.onScreamUpdate })
            .addState(States.SHIELD, { onEnter: this.onShieldEnter, onUpdate: this.onShieldUpdate })
            .addState(States.SHIMMER, { onEnter: this.onShimmerEnter, onUpdate: this.onShimmerUpdate })
            .addState(States.SPRINTING, { onEnter: this.onSprintEnter, onUpdate: this.onSprintUpdate })
            .addState(States.WARD, { onEnter: this.onWardEnter, onUpdate: this.onWardUpdate })
            .addState(States.WRITHE, { onEnter: this.onWritheEnter, onUpdate: this.onWritheUpdate }); 
        // ========== NEGATIVE META STATES ========== \\
        this.negativeMachine = new StateMachine(this, 'enemy');
        this.negativeMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.FROZEN, { onEnter: this.onFrozenEnter, onUpdate: this.onFrozenUpdate, onExit: this.onFrozenExit })
            .addState(States.ROOTED, { onEnter: this.onRootEnter, onUpdate: this.onRootUpdate, onExit: this.onRootExit })
            .addState(States.SLOWED, { onEnter: this.onSlowEnter, onExit: this.onSlowExit })
            .addState(States.SNARED, { onEnter: this.onSnareEnter, onExit: this.onSnareExit });

        this.positiveMachine.setState(States.CLEAN);
        this.setScale(0.8);
        this.setDepth(1);
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
        this.isAggressive = this.setAggression(); 
        this.startedAggressive = this.isAggressive;
        this.computerAggressive = this.scene.settings.difficulty.computer;
        this.isElite = this.setSpecial();
        this.isSpecial = this.setSpecial();
        this.slowDuration = DURATION.SLOWED;
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
        this.isDeleting = false;
        this.sensorDisp = 12;
        this.colliderDisp = 16; 

        const colliderWidth = PLAYER.COLLIDER.WIDTH; 
        const colliderHeight = PLAYER.COLLIDER.HEIGHT; 
        const paddingWidth = 10;         
        const paddingHeight = 10; 

        const paddedWidth = colliderWidth + 2 * paddingWidth;
        const paddedHeight = colliderHeight + 2 * paddingHeight;
        let enemyCollider = Bodies.rectangle(this.x, this.y + 10, colliderWidth, colliderHeight, { isSensor: false, label: 'enemyCollider' });
        enemyCollider.boundsPadding = { x: paddedWidth, y: paddedHeight };
        let enemySensor = Bodies.circle(this.x, this.y + 2, PLAYER.SENSOR.DEFAULT, { isSensor: true, label: 'enemySensor' }); // Sensor was 48
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
        
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                if ((!this.scene.settings.difficulty.enemyCombatInteract && this.scene.combat && !this.inCombat) || this.isDeleting) return;
                if (this.ascean?.level > this.scene.state.player.level) {
                    this.scene.sound.play('righteous', { volume: this.scene.settings.volume });
                } else if (this.ascean?.level === this.scene.state.player.level) {
                    this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });                    
                } else {
                    this.scene.sound.play('consume', { volume: this.scene.settings.volume });
                };
                vibrate();
                this.clearTint();
                this.setTint(TARGET_COLOR);
                if (this.enemyID !== this.scene.state.enemyID) this.scene.setupEnemy(this);
                const newEnemy = this.isNewEnemy(this.scene.player);
                if (newEnemy) {
                    this.scene.player.addEnemy(this);
                };
                this.scene.player.setCurrentTarget(this);
                this.scene.player.animateTarget();
            })
            .on('pointerout', () => {
                this.clearTint();
                this.setTint(ENEMY_COLOR);
            });
        this.scene.time.delayedCall(3000, () => {
            this.setVisible(true);
            this.spriteWeapon.setVisible(true);
        });
    };

    cleanUp() {
        EventBus.off('combat', this.combatUpdate);
        EventBus.off('update-combat', this.combatUpdate); 
        EventBus.off('personal-update', this.personalUpdate);    
        EventBus.off('enemy-persuasion', this.persuasionUpdate);
        EventBus.off('enemy-luckout', this.luckoutUpdate);
        EventBus.off('update-enemy-health', this.healthUpdate);
        this.setActive(false);
        this.removeInteractive();
        this.clearShields();
        this.spriteWeapon.destroy();
        this.spriteWeapon = undefined;
        this.spriteShield.destroy();
        this.spriteShield = undefined;
        this.body.destroy();
    };

    enemyStateListener() {
        EventBus.on('combat', this.combatUpdate);
        EventBus.on('update-combat', this.combatUpdate); 
        EventBus.on('personal-update', this.personalUpdate);
        EventBus.on('enemy-persuasion', this.persuasionUpdate);
        EventBus.on('enemy-luckout', this.luckoutUpdate);
        EventBus.on('update-enemy-health', this.healthUpdate);
    };

    personalUpdate = (e) => {
        switch (e.action) {
            case 'health':
                this.health = e.payload;
                this.updateHealthBar(this.health);
                break;
            default:
                break;
        };
    };

    healthUpdate = (e) => {
        if (this.enemyID !== e.id) return;
        if (this.health > e.health) {
            let damage = Math.round(this.health - e.health);
            damage = e?.glancing === true ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e?.critical);
            if (this.isMalicing) this.maliceHit();
            if (this.isMending) this.mendHit();
            const isNewEnemy = this.isNewEnemy(this.scene.player);
            if (isNewEnemy === true && this.inCombat === false) { // || Before
                this.jumpIntoCombat();
            };
        } else if (this.health < e.health) {
            let heal = Math.round(e.health - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, 1500, 'heal');
        };
        this.health = e.health;
        this.updateHealthBar(e.health);
        if (e.health <= 0) {
            this.isDefeated = true;
            this.stateMachine.setState(States.DEFEATED);
        };
    };

    checkCaerenic = (caerenic) => {
        this.isGlowing = caerenic;
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, 'weapon');
        this.setGlow(this.spriteShield, caerenic, 'shield');
    };

    flickerCarenic = (duration) => {
        if (this.isGlowing === false) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(duration, () => {
                this.checkCaerenic(false);
            }, undefined, this);
        };
    };
    
    clearShields = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
    };

    currentNegativeState = (type) => {
        switch (type) {
            case States.FROZEN:
                return this.isRooted || this.isSlowed || this.isSnared; 
            case States.ROOTED:
                return this.isFrozen || this.isSlowed || this.isSnared; 
            case States.SLOWED:
                return this.isFrozen || this.isRooted || this.isSnared; 
            case States.SNARED:
                return this.isFrozen || this.isRooted || this.isSlowed; 
            default: return false;
        };
    };
    
    combatUpdate = (e) => {
        if (this.enemyID !== e.enemyID) {
            if (this.inCombat) this.currentRound = e.combatRound;
            if (this.inCombat && this.attacking && e.newPlayerHealth <= 0 && e.computerWin === true) {
                this.clearCombatWin();
            };
            return;
        };
        if (this.health > e.newComputerHealth) {
            let damage = Math.round(this.health - e.newComputerHealth);
            damage = e.criticalSuccess ? `${damage} (Critical)` : e.glancingBlow ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e.criticalSuccess);
            if (!this.isSuffering() && !this.isCasting) this.stateMachine.setState(States.HURT); // !this.isHurt && 
            if (this.isFeared) {
                const chance = Math.random() < 0.1 + this.fearCount;
                if (chance) {
                    this.statusCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Fear Broken', PLAYER.DURATIONS.TEXT, 'effect');
                    this.isFeared = false;
                } else {
                    this.fearCount += 0.1;
                };
            };
            if (this.isConfused) this.isConfused = false;
            if (this.isPolymorphed) this.isPolymorphed = false;
            if (this.isMalicing) this.maliceHit();
            if (this.isMending) this.mendHit();
            if (e.newComputerHealth <= 0) this.stateMachine.setState(States.DEFEATED);
            if (!this.inCombat && e.newComputerHealth > 0 && e.newPlayerHealth > 0) this.checkEnemyCombatEnter();
        } else if (this.health < e.newComputerHealth) { 
            let heal = Math.round(e.newComputerHealth - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, 1500, 'heal');
        }; 
        this.health = e.newComputerHealth;
        if (this.healthbar.getTotal() < e.computerHealth) this.healthbar.setTotal(e.computerHealth);
        this.updateHealthBar(e.newComputerHealth);
        this.weapons = e.computerWeapons;
        this.setWeapon(e.computerWeapons[0]); 
        this.checkDamage(e.computerDamageType.toLowerCase()); 
        this.checkMeleeOrRanged(e.computerWeapons?.[0]);
        this.currentRound = e.combatRound;
        if (e.newPlayerHealth <= 0 && e.computerWin === true) {
            this.clearCombatWin();
        };
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
        // This will become // return this.scene.reputation.find(obj => obj.name === this.ascean.name).aggressive;
        const percent = this.scene.settings.difficulty.aggression;
        return percent > Math.random() || false;
    };

    setSpecial = () => {
        const percent = this.scene.settings.difficulty.special;
        return percent >= Math.random() || false;
    };

    isValidRushEnemy = (enemy) => {
        if (this.isRushing === false) return;
        const newEnemy = this.rushedEnemies.every(obj => obj.playerID !== enemy.playerID);
        if (newEnemy) this.rushedEnemies.push(enemy);
    };
    
    enemyCollision = (enemySensor) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [enemySensor],
            callback: other => {
                if (this.isDeleting) return;
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.isValidRushEnemy(other.gameObjectB);
                    this.touching.push(other.gameObjectB);
                    if (this.ascean && !other.gameObjectB.isStealthing && this.enemyAggressionCheck()) {
                        this.createCombat(other, 'start');
                    } else if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive) {
                        const newEnemy = this.isNewEnemy(other.gameObjectB);
                        if (newEnemy) {
                            other.gameObjectB.targets.push(this);
                            other.gameObjectB.checkTargets();
                        };
                        if (this.isReasonable()) {
                            this.scene.setupEnemy(this);
                        } 
                        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
                        if (this.stateMachine.isCurrentState(States.DEFEATED)) {
                            this.scene.showDialog(true);
                        } else {
                            this.stateMachine.setState(States.AWARE);
                        };
                    };
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [enemySensor],
            callback: other => {
                if (this.isDeleting) return;
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.touching = this.touching.filter((target) => target !== other.gameObjectB);
                    if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive) {
                        if (this.healthbar) this.healthbar.setVisible(false);
                        if (this.isDefeated === true) {
                            this.scene.showDialog(false);
                            this.stateMachine.setState(States.DEFEATED);
                        } else {
                            this.stateMachine.setState(States.IDLE);
                        };
                        if (this.isCurrentTarget === true && !this.inCombat) this.scene.clearNonAggressiveEnemy();
                    };
                };
            },
            context: this.scene,
        });
    }; 

    isReasonable = () => {
        return this.scene.state.enemyID !== this.enemyID
            && this.scene.player.inCombat === false
            && this.scene.player.isRushing === false
            && this.scene.player.currentTarget === undefined;
    };

    isNewEnemy = (player) => {
        const newEnemy = player.targets.every(obj => obj.enemyID !== this.enemyID);
        return newEnemy;
    };

    jumpIntoCombat = () => {
        this.attacking = this.scene.player;
        this.inCombat = true;
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE);
        this.scene.combatEngaged(true);
    };

    checkEnemyCombatEnter = () => {
        this.attacking = this.scene.player;
        this.inCombat = true;
        const newEnemy = this.isNewEnemy(this.scene.player);
        if (newEnemy) this.scene.player.targets.push(this);
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE); 
        if (this.scene.combat === false) this.scene.player.targetEngagement(this.enemyID); // player.inCombat
        this.scene.combatEngaged(true);
    };

    setEnemyColor = () => {
        this.currentTargetCheck();
        if (this.isCurrentTarget === true) {
            return TARGET_COLOR;
        } else {
            return ENEMY_COLOR;
        };
    };

    playerStatusCheck = (player) => {
        return (this.ascean && !player.inCombat && !player.isStealthing);
    };

    enemyAggressionCheck = () => {
        return (!this.isDead && !this.isDefeated && !this.inCombat && this.isAggressive && this.scene.state.newPlayerHealth > 0);
    };

    enemyFetchedOn = (e) => {
        if (this.enemyID !== e.enemyID) return;
        this.ascean = e.enemy;
        this.health = e.combat.attributes?.healthTotal;
        this.combatStats = e.combat;
        this.weapons = [e.combat.combatWeaponOne, e.combat.combatWeaponTwo, e.combat.combatWeaponThree];
        this.speed = this.startingSpeed(e.enemy);
        this.heldSpeed = this.speed;
        this.createWeapon(e.enemy.weaponOne); 
        this.createShield(e.enemy.shield);
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health);
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
    };

    createEnemy = () => {
        EventBus.once('enemy-fetched', this.enemyFetchedOn);
        const fetch = { enemyID: this.enemyID, level: this.scene.player.ascean.level };
        EventBus.emit('fetch-enemy', fetch);
    };

    createShield = (shield) => {
        const shieldName = this.imgSprite(shield);
        this.spriteShield = new Phaser.GameObjects.Sprite(this.scene, 0, 0, shieldName);
        this.spriteShield.setScale(0.6);
        this.spriteShield.setOrigin(0.5, 0.5);
        this.spriteShield.setVisible(false);
        this.scene.add.existing(this.spriteShield);
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
        this.spriteWeapon.setAngle(-195);
        this.spriteWeapon.setOrigin(0.25, 1);
        this.spriteWeapon.setVisible(false);
        this.scene.add.existing(this.spriteWeapon);
    }; 

    clearCombat = () => {
        this.health = this.ascean.health.max;
        this.healthbar.setValue(this.ascean.health.max);    
        this.setSpecialCombat(false);
        this.inCombat = false;
        this.attacking = undefined;
        this.isAggressive = false; // Added to see if that helps with post-combat losses for the player
        this.stateMachine.setState(States.LEASH); 
    };
    
    clearCombatWin = () => { 
        this.inCombat = false;
        this.setSpecialCombat(false);
        this.attacking = undefined;
        this.isTriumphant = true;
        this.isAggressive = false; // Added to see if that helps with post-combat losses for the player
        this.health = this.ascean.health.max;
        this.healthbar.setValue(this.ascean.health.max);
        this.stateMachine.setState(States.LEASH); 
    };

    createCombat = (collision, _when) => {
        const newEnemy = this.isNewEnemy(collision.gameObjectB);
        if (newEnemy) {
            this.scene.player.targets.push(this);
            this.scene.player.checkTargets();
            this.scene.player.actionTarget = collision;
            this.scene.player.targetID = this.enemyID;
            this.scene.player.inCombat = true;
            this.attacking = collision.gameObjectB;
            this.inCombat = true;
            this.setSpecialCombat(true);
            if (this.healthbar) this.healthbar.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
            this.actionTarget = collision;
            this.stateMachine.setState(States.CHASE); 
            this.scene.combatEngaged(true);
        } else {
            this.attacking = collision.gameObjectB;
            this.inCombat = true;
            this.setSpecialCombat(true);
            if (this.healthbar) this.healthbar.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
            this.actionTarget = collision;
            this.stateMachine.setState(States.CHASE); 
            collision.gameObjectB.inCombat = true;
            this.scene.combatEngaged(true);
        };
    };

    setSpecialCombat = (bool, mult = 1) => {
        if (this.isSpecial === false) return;
        const mastery = this.ascean.mastery;
        if (bool === true) {
            this.specialCombat = this.scene.time.delayedCall(DURATION.SPECIAL * mult, () => {
                if (this.inCombat === false) {
                    this.specialCombat.remove();
                    return;
                };
                if (this.isSuffering() || this.scene.state.playerEffects.find(effect => effect.prayer === 'Silence')) {
                    this.setSpecialCombat(true, 0.3);
                    return;
                };
                const special = ENEMY_SPECIAL[mastery][Math.floor(Math.random() * ENEMY_SPECIAL[mastery].length)].toLowerCase();
                this.specialAction = special;
                // this.currentAction = 'special';
                // const specific = ['renewal'];
                // const test = specific[Math.floor(Math.random() * specific.length)];
                if (this.stateMachine.isState(special)) {
                    this.stateMachine.setState(special);
                } else if (this.positiveMachine.isState(special)) {
                    this.positiveMachine.setState(special);
                };
                this.setSpecialCombat(true);
            }, undefined, this);
        } else {
            this.specialCombat?.remove();
        };
    };

    playerCaerenic = () => this.scene.state.isCaerenic ? 1.25 : 1;
    playerStalwart = () => this.scene.state.isStalwart ? 0.85 : 1;
    mastery = () => this.ascean?.[this.ascean?.mastery];

    chiomic = (power) => {
        if (this.scene.state.newPlayerHealth <= 0) return;
            this.scene.combatManager.useGrace(power);
            this.entropicMultiplier(power);
        if (this.isCurrentTarget === true) {
            this.scene.combatManager.combatMachine.action({ type: 'Enemy Chiomic', data: power });
        } else {
            const chiomic = Math.round(this.mastery() / 2 * (1 + (power / 100))  * this.playerCaerenic() * this.playerStalwart() * ((this.ascean?.level + 9) / 10));
            const ratio = chiomic / this.scene.state.playerHealth * 100;
            const computerActionDescription = `${this.ascean?.name} flays ${chiomic} health from you with their hush.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.enemyID } });
        };
    };
    devour = (power) => {
        if (this.scene.state.newPlayerHealth <= 0) return;
        if (this.isCurrentTarget === true) {
            this.scene.combatManager.combatMachine.action({ type: 'Enemy Tshaeral', data: 5 });
        } else {
            const caerenic = this.scene.state.isCaerenic ? 1.25 : 1;
            const stalwart = this.scene.state.isStalwart ? 0.85 : 1;
            const dev = Math.round(this.combatStats.attributes.healthTotal * (power / 100) * caerenic * stalwart * (this.ascean.level + 9) / 10);
            let newComputerHealth = this.health + dev > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + dev;
            const computerActionDescription = `${this.ascean?.name} tshaers and devours ${dev} health from you.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -power, id: this.enemyID } });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
        };
    };
    sacrifice = (power) => {
        if (this.scene.state.newPlayerHealth <= 0) return;
        this.entropicMultiplier(power);
        if (this.isCurrentTarget === true) {
            this.scene.combatManager.combatMachine.action({ type: 'Enemy Sacrifice', data: power });
        } else {
            const sacrifice = Math.round(this.mastery() * this.playerCaerenic() * this.playerStalwart() * ((this.ascean?.level + 9) / 10));
            let newComputerHealth = this.health + (sacrifice / 2) > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + (sacrifice / 2);
            const computerActionDescription = `${this.ascean?.name} sacrifices ${sacrifice / 2} health to rip ${sacrifice * (1 + power / 100)} from you.`;
            const ratio = (sacrifice * (1 + power / 50)) / this.scene.state.playerHealth * 100;
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.enemyID } });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
            EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
        };
    };
    suture = (power) => {
        if (this.scene.state.newPlayerHealth <= 0) return;
        this.entropicMultiplier(power);
        if (this.isCurrentTarget === true) {
            this.scene.combatManager.combatMachine.action({ type: 'Enemy Suture', data: power });
        } else {
            const suture = Math.round(this.mastery() * this.playerCaerenic() * this.playerStalwart() * ((this.ascean?.level + 9) / 10)) * (1 + power / 100) * 0.8;
            let newComputerHealth = this.health + suture > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + suture;
            const computerActionDescription = `${this.ascean?.name} sutured ${suture} health from you, absorbing ${suture}.`;
            const ratio = suture / this.scene.state.playerHealth * 100;
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.enemyID } });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
            EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
        };
    };

    checkDamage = (damage) => {
        this.currentDamageType = damage;
        this.hasMagic = this.checkDamageType(damage, 'magic');
    };

    counterCheck = () => {
        if (this.scene.player.isCounterSpelling === true) {
            this.isCasting = false;
            this.isCounterSpelled = true;
        };
    };

    isSuccessful = (time) => {
        if (this.castbar.time >= time) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
    };
    
    startCasting = (name, duration, style, channel = false) => {
        this.isCasting = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, name, duration / 2, style);
        this.castbar.setTotal(duration);
        if (channel === true) this.castbar.setTime(duration);
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.setVelocity(0);
        this.anims.play('player_health', true);
    };

    stopCasting = (counter) => {
        this.isCasting = false;
        this.castingSuccess = false;
        this.castbar.reset();
        if (this.isGlowing === true) this.checkCaerenic(false);
        if (this.isCounterSpelled === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, counter, 750, 'damage', false, true);
        };
        this.evaluateCombatDistance();        
    };

    setStun = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', 2500, 'effect', true);
        this.isStunned = true;
        this.count.stunned += 1;
    };

    setWeapon = (weapon) => {
        return this.currentWeapon = weapon;
    };

    updateHealthBar(health) {
        return this.healthbar.setValue(health);
    };

    enemyAnimation = () => {
        if (this.isPolymorphed) {
            return;
        } else if (this.isClimbing) {
            if (this.moving()) {
                this.anims.play('player_climb', true);
            } else {
                this.anims.play('player_climb', true);
                this.anims.pause();
            };
        } else if (this.inWater) {
            if (this.velocity.y > 0) {
                this.anims.play('swim_down', true);
            } else {
                this.anims.play('swim_up', true);
            };
        } else {
            if (this.moving()) {
                this.anims.play('player_running', true);
            } else {
                this.anims.play('player_idle', true);
            };
        };
    };

    onDefeatedEnter = () => {
        this.anims.play('player_pray', true).on('animationcomplete', () => this.anims.play('player_idle', true));
        this.isDefeated = true;
        this.inCombat = false;
        this.setSpecialCombat(false);
        this.attacking = undefined;
        this.isAggressive = false;
        this.healthbar.setVisible(false);
        this.currentTargetCheck();
        this.scene.time.delayedCall(180000, () => {
            this.isDefeated = false;
            this.health = this.ascean.health.max;
            this.isAggressive = this.startedAggressive;
        }, undefined, this);
        this.stateMachine.setState(States.IDLE);
    };
    onDeathEnter = () => {this.clearTint(); this.setStatic(true)};
    onDeathUpdate = () => this.anims.play('player_hurt', true);

    onIdleEnter = () => {
        this.setVelocity(0);
        this.enemyAnimation();
        this.currentRound = 0;
    };
    onIdleUpdate = (dt) => {
        this.idleWait -= dt;
        if (this.idleWait <= 0) {
            this.idleWait = Phaser.Math.RND.between(4000, 6000);
            if (this.stateMachine.isCurrentState(States.IDLE) && !this.isDeleting) this.stateMachine.setState(States.PATROL);
        };
    };
    onIdleExit = () => this.anims.stop('player_idle');
 
    onPatrolEnter = () => {
        this.enemyAnimation();
        this.patrolPath = this.generatePatrolPath(); // Generate patrol points via navmesh
        if (!this.patrolPath || this.patrolPath.length < 2) {
            this.stateMachine.setState(States.IDLE);
            return;
        };
        this.nextPatrolPoint = this.patrolPath[1]; // First patrol point
        this.pathDirection = new Phaser.Math.Vector2(this.nextPatrolPoint.x, this.nextPatrolPoint.y).subtract(this.position).normalize();
        const distanceToNextPoint = this.calculateDistance(this.position, this.nextPatrolPoint);
        this.patrolDelay = this.calculatePatrolDelay(distanceToNextPoint, this.speed);
        this.patrolTimer = this.scene.time.delayedCall(this.patrolDelay, () => {
            if (this.isDeleting) return;
            this.patrolNextPoint();
        }, undefined, this);
    };
    
    onPatrolUpdate = (_dt) => {
        this.enemyAnimation();
        if (this.patrolPath && this.patrolPath.length > 1) {
            const distanceToNextPoint = this.calculateDistance(this.position, this.nextPatrolPoint);
            if (distanceToNextPoint < 10) { // If close to the patrol point, move to the next one
                this.patrolNextPoint();
            } else {
                this.setVelocity(
                    this.pathDirection.x * (this.speed * 0.5) * (this.isClimbing ? 0.65 : 1), 
                    this.pathDirection.y * (this.speed * 0.5) * (this.isClimbing ? 0.65 : 1)
                );
            };
        };
        this.getDirection();
    };
    
    onPatrolExit = () => {
        this.setVelocity(0);
        this.enemyAnimation();
        if (this.patrolTimer) {
            this.patrolTimer.destroy();
            this.patrolTimer = undefined;
        };
        // this.scene.navMesh.debugDrawClear(); // Clear the path drawing when exiting patrol
    };
    
    generatePatrolPath = () => {
        let pathPosition;
        let pathFound = false;
        while (pathFound === false) {
            const point = new Phaser.Math.Vector2(Phaser.Math.RND.between(this.x - 375, this.x + 375), Phaser.Math.RND.between(this.y - 375, this.y + 375));
            if (this.scene.navMesh.isPointInMesh(point)) {
                pathPosition = point;
                pathFound = true;
            };
        };
        let patrolPath = this.scene.navMesh.findPath(this.position, pathPosition);
        return patrolPath;
    };
    
    patrolNextPoint = () => {
        if (this.isDeleting) return;
        if (this.patrolPath && this.patrolPath.length > 1) {
            this.patrolPath.shift(); // Remove the current point
            if (this.patrolPath.length > 1) {
                this.nextPatrolPoint = this.patrolPath[0];
                this.pathDirection = new Phaser.Math.Vector2(this.nextPatrolPoint.x, this.nextPatrolPoint.y).subtract(this.position).normalize();

                const distanceToNextPoint = this.calculateDistance(this.position, this.nextPatrolPoint);
                this.patrolDelay = this.calculatePatrolDelay(distanceToNextPoint, this.speed);
                
                this.patrolTimer = this.scene.time.delayedCall(this.patrolDelay, this.patrolNextPoint, undefined, this);
            } else {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    
    calculateDistance = (pointA, pointB) => Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
    
    calculatePatrolDelay = (distance, speed) => {
        const timeToNextPoint = (distance / (speed * 0.25)) * 1000; // Calculate time in milliseconds
        return timeToNextPoint; // Add some base delay to ensure smooth movement
    };

    onAwarenessEnter = () => {
        this.setVelocity(0);
        this.enemyAnimation();
        this.scene.showDialog(true);
    };
    onAwarenessUpdate = (_dt) => {
        this.enemyAnimation();
    };
    onAwarenessExit = () => {
        this.enemyAnimation();
        this.scene.showDialog(false);
    };

    onChaseEnter = () => {
        if (!this.attacking) return;
        this.enemyAnimation();
        this.chaseTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                // this.scene.navMesh.debugDrawClear();
                this.path = this.scene.navMesh.findPath(this.position, this.attacking.position);
                if (this.path && this.path.length > 1) {
                    if (!this.isPathing) this.isPathing = true;
                    const nextPoint = this.path[1];
                    this.nextPoint = nextPoint;
                    // this.scene.navMesh.debugDrawPath(this.path, 0xffd900);
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
        if (distance >= 50 * rangeMultiplier) { // was 75 || 100
            if (this.path && this.path.length > 1) {
                this.setVelocity(this.pathDirection.x * (this.speed) * (this.isClimbing ? 0.65 : 1), this.pathDirection.y * (this.speed) * (this.isClimbing ? 0.65 : 1)); // 2.5
            } else {
                if (this.isPathing) this.isPathing = false;
                direction.normalize();
                this.setVelocity(direction.x * (this.speed) * (this.isClimbing ? 0.65 : 1), direction.y * (this.speed) * (this.isClimbing ? 0.65 : 1)); // 2.5
            };
        } else {
            this.stateMachine.setState(States.COMBAT);
        };
    }; 
    onChaseExit = () => {
        this.enemyAnimation();
        // this.scene.navMesh.debugDrawClear();
        this.setVelocity(0, 0);
        if (this.chaseTimer) {
            this.chaseTimer.destroy();
            this.chaseTimer = undefined;
        };
    };

    onCombatEnter = () => {
        if (this.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.inCombat = false;
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.enemyAnimation();
        if (!this.isSwinging) {
            this.isSwinging = true;
            this.scene.time.delayedCall(this.swingTimer, () => {
                this.isSwinging = false;
                if (this.currentAction === '') this.currentAction = this.evaluateCombat();
            }, undefined, this);
        };
    };
    onCombatUpdate = (_dt) => this.evaluateCombatDistance();
    onCombatExit = () => {};

    onEvasionEnter = () => {
        const x = Phaser.Math.Between(1, 2);
        const y = Phaser.Math.Between(1, 2);
        const evade = Phaser.Math.Between(1, 2);
        this.evadeRight = x === 1;
        this.evadeUp = y === 1;
        if (evade === 1) {
            this.isDodging = true;
        } else {
            this.isRolling = true;
        };
        this.handleAnimations();
    };
    onEvasionUpdate = (_dt) => {
        if (this.isDodging === true) this.anims.play('player_slide', true);
        if (this.isRolling === true) this.anims.play('player_roll', true);        
        if (this.evadeRight) {
            this.setVelocityX(this.speed);
        } else {
            this.setVelocityX(-this.speed);
        };
        if (this.evadeUp) {
            this.setVelocityY(this.speed);
        } else {
            this.setVelocityY(-this.speed);
        };
        if (!this.isDodging && !this.isRolling) this.evaluateCombatDistance();
    }; 
    onEvasionExit = () => {};

    onAttackEnter = () => {
        this.isAttacking = true;
        this.attack();
    };
    onAttackUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.isRanged) this.scene.combatManager.combatMachine.input('computerAction', 'attack', this.enemyID);
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isAttacking) this.evaluateCombatDistance(); 
    };
    onAttackExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatManager.combatMachine.input('computerAction', '', this.enemyID);
        this.setTint(ENEMY_COLOR);
    };

    onParryEnter = () => {
        this.isParrying = true;
        this.anims.play('player_attack_1', true);
    };
    onParryUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.PARRY_LIVE && !this.isRanged) this.scene.combatManager.combatMachine.input('computerAction', 'parry', this.enemyID);
        if (this.frameCount >= FRAME_COUNT.PARRY_KILL) this.isParrying = false;
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isParrying) this.evaluateCombatDistance();
    };
    onParryExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatManager.combatMachine.input('computerAction', '', this.enemyID);
        if (this.scene.state.computerParryGuess !== '') this.scene.combatManager.combatMachine.input('computerParryGuess', '', this.enemyID);
        this.setTint(ENEMY_COLOR);
    };

    onThrustEnter = () => {
        this.isThrusting = true;
        this.thrustAttack();
    };
    onThrustUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.THRUST_LIVE && !this.isRanged) this.scene.combatManager.combatMachine.input('computerAction', 'thrust', this.enemyID);
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isThrusting) this.evaluateCombatDistance();
    };
    onThrustExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatManager.combatMachine.input('computerAction', '', this.enemyID);
        this.setTint(ENEMY_COLOR);
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
    onDodgeUpdate = (_dt) => {if (!this.isDodging) this.evaluateCombatDistance();};
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
        if (this.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.isRanged) this.scene.combatManager.combatMachine.input('computerAction', 'posture', this.enemyID);
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isPosturing) this.evaluateCombatDistance();
    };
    onPostureExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatManager.combatMachine.input('computerAction', '', this.enemyID);
        this.setTint(ENEMY_COLOR);
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
        if (this.frameCount === FRAME_COUNT.ROLL_LIVE && !this.isRanged) this.scene.combatManager.combatMachine.input('computerAction', 'roll', this.enemyID);
        if (!this.isRolling) this.evaluateCombatDistance();
    };
    onRollExit = () => {
        if (this.scene.state.computerAction !== '') this.scene.combatManager.combatMachine.input('computerAction', '', this.enemyID);   
        this.body.parts[2].position.y -= this.sensorDisp;
        this.body.parts[2].circleRadius = 36;
        this.body.parts[1].vertices[0].y -= this.colliderDisp;
        this.body.parts[1].vertices[1].y -= this.colliderDisp;
        this.setTint(ENEMY_COLOR);
    };

    onLeashEnter = () => {
        this.enemyAnimation();
        this.inCombat = false;
        if (this.attacking !== undefined) {
            this.attacking.removeTarget(this.enemyID);
            this.attacking = undefined;
            this.setSpecialCombat(false);
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Leashing', 1500, 'effect');
        };
        this.leashTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                let originPoint = new Phaser.Math.Vector2(this.originalPosition.x, this.originalPosition.y);
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
                    this.setVelocity(this.pathDirection.x * this.speed, this.pathDirection.y * this.speed);
                    this.enemyAnimation();
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
        let originPoint = new Phaser.Math.Vector2(this.originalPosition.x, this.originalPosition.y);
        let direction = originPoint.subtract(this.position);
        
        if (direction.length() >= 10) {
            if (this.path && this.path.length > 1) {
                this.setVelocity(this.pathDirection.x * (this.speed), this.pathDirection.y * (this.speed)); // 2.5
            } else {
                if (this.isPathing) this.isPathing = false;
                direction.normalize();
                this.setVelocity(direction.x * (this.speed), direction.y * (this.speed)); // 2.5
            };
        } else {
            this.stateMachine.setState(States.IDLE);
        };
    };
    onLeashExit = () => {
        this.setVelocity(0);
        this.leashTimer.destroy();
        this.leashTimer = undefined;
        this.scene.navMesh.debugDrawClear(); 
    };

    combatChecker = (state) => {
        if (state === true) return;
        this.evaluateCombatDistance();
    };

    // ========================== CREATING ENHANCED ENEMY AI ========================= \\

    instincts = () => {
        if (this.inCombat === false) {
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.scene.time.delayedCall(1000, () => {
            let chance = [1, 2, 3, (!this.isRanged ? 5 : 6)][Math.floor(Math.random() * 4)];
            let mastery = this.ascean.mastery;
            let health = this.health / this.ascean.health.max;
            let player = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
            const direction = this.attacking?.position.subtract(this.position);
            const distance = direction?.length();
            let instinct =
                 health <= 0.33 ? 0 : // Heal
                 health <= 0.66 ? 1 : // Heal
                 player <= 0.33 ? 2 : // Damage
                 player <= 0.66 ? 3 : // Damage
                 distance <= 100 ? 4 : // AoE
                 distance >= 250 && !this.isRanged ? 5 : // Melee at Distance
                 distance >= 250 && this.isRanged ? 6 : // Ranged at Distance
                 chance; // Range
            // console.log(`Chance: ${chance} | Instinct: ${instinct} | Mastery: ${mastery}`);
            let key = INSTINCTS[mastery][instinct].key, value = INSTINCTS[mastery][instinct].value;
            this[key].setState(value);
            if (key === 'positiveMachine') this.stateMachine.setState(States.CHASE);
        }, undefined, this);
    };

    // ========================== SPECIAL ENEMY STATES ========================== \\
    onAstraveEnter = () => this.startCasting('Astrave', PLAYER.DURATIONS.ASTRAVE, 'cast');
    onAstraveUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.ASTRAVE);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onAstraveExit = () => {
        if (this.castingSuccess === true && this.checkPlayerResist() === true) {
            this.aoe = new AoE(this.scene, 'astrave', 1, true, this, false, this.scene.player);    
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} unearths the winds and lightning from the land of hush and tendril.`
            });
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.ASTRAVE);    
        };
        this.stopCasting('Countered Astrave');
    };

    onBlinkEnter = () => {
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        if (this.flipX === true) {
            this.setVelocityX(35);
        } else {
            this.setVelocityX(-35);
        };
        this.flickerCarenic(500);
        this.scene.time.delayedCall(500, () => this.instincts(), undefined, this);
    };
    onBlinkUpdate = (_dt) => {};
    onBlinkExit = () => this.evaluateCombatDistance();

    onConfuseEnter = () => this.startCasting('Confusing', PLAYER.DURATIONS.CONFUSE, 'cast');
    onConfuseUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.CONFUSE);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onConfuseExit = () => {
        if (this.castingSuccess === true && this.checkPlayerResist() === true) {
            this.scene.combatManager.confuse(this.scene.state.player._id);
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean?.name} confuses you, causing you to stumble around in a daze.`
            });
        };
        this.stopCasting('Countered Confuse');
        this.instincts();
    };

    onDesperationEnter = () => {
        this.isCasting = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'cast');
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.DESPERATION, () => {
            const heal = Math.round(this.ascean.health.max * 0.5);
            const total = Math.min(this.health + heal, this.ascean.health.max);
            this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
            this.checkCaerenic(false);
            this.count.stunned += 1;
            this.isStunned = true;
            this.stateMachine.setState(States.STUNNED);
        }, undefined, this);
    };
    onDesperationExit = () => this.isCasting = false;

    onFearingEnter = () => this.startCasting('Fearing', PLAYER.DURATIONS.FEAR, 'cast');
    onFearingUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.FEAR);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onFearingExit = () => {
        if (this.castingSuccess === true && this.checkPlayerResist() === true) {
            this.scene.combatManager.fear(this.scene.state.player._id);
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean?.name} strikes fear into you, causing you to panic in terror!`
            });
        };
        this.stopCasting('Countered Fear');
        this.instincts();
    };

    onHealingEnter = () => this.startCasting('Healing', PLAYER.DURATIONS.HEALING, 'cast');
    onHealingUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.MAIERETH);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onHealingExit = () => {
        if (this.castingSuccess === true) {
            const heal = Math.round(this.ascean.health.max * 0.25);
            const total = Math.min(this.health + heal, this.ascean.health.max);
            this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });  
        };
        this.stopCasting('Countered Healing');
    };

    onIlirechEnter = () => this.startCasting('Ilirech', PLAYER.DURATIONS.ILIRECH, 'damage');
    onIlirechUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.ILIRECH);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onIlirechExit = () => {
        if (this.castingSuccess === true && this.checkPlayerResist() === true) {
            this.chiomic(100);
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} rips into this world with Ilian tendrils entwining.`
            });
            this.scene.sound.play('fire', { volume: this.scene.settings.volume });
            screenShake(this.scene, 90);
        };
        this.stopCasting('Countered Ilirech');
    };
    
    onKyrnaicismEnter = () => {
        this.startCasting('Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM, 'damage', true);
        if (this.checkPlayerResist() === false) return;
        this.scene.combatManager.slow(this.scene.player.playerID, 1000);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.channelCount = 0;
        this.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.isCasting === false || this.scene.state.computerWin || this.scene.state.playerWin || this.scene.state.newComputerHealth <= 0 || this.isCounterSpelled === true) {
                    this.isCasting = false;
                    this.chiomicTimer.remove(false);
                    this.chiomicTimer = undefined;
                    return;
                };
                this.scene.combatManager.slow(this.scene.player.playerID, 1000);
                this.chiomic(10);
                this.channelCount++;
                if (this.channelCount >= 3) {
                    this.isCasting = false;
                    this.channelCount = 0;
                };
            },
            onExit: () => this.isCasting = false,
            callbackScope: this,
            repeat: 3,
        });
    };
    onKyrnaicismUpdate = (dt) => {
        this.counterCheck();
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'channel', 'TENDRIL');
    };
    onKyrnaicismExit = () => {
        this.channelCount = 0;
        if (this.chiomicTimer) {
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
        };
        this.stopCasting('Countered Kyrnaicism');
    };

    onLeapEnter = () => {
        const target = new Phaser.Math.Vector2(this.scene.player.x, this.scene.player.y);
        const direction = target.subtract(this.position);
        const distance = direction.length();
        const buffer = this.scene.player.isMoving ? 40 : 30;
        let leap = Math.min(distance + buffer, 250);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.flickerCarenic(500);
        this.attack();
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * leap),
            y: this.y + (direction.y * leap),
            duration: 500,
            ease: 'Elastic',
            onComplete: () => { 
                if (this.touching.length > 0) {
                    this.touching.forEach(enemy => {
                        if (enemy.playerID !== this.scene.player.playerID) return;
                        this.scene.writhe(enemy.playerID, 'leap', this.enemyID);
                        this.scene.combatManager.useStamina(15);
                    });
                };
                this.stateMachine.setState(States.COMBAT);
            },
        });       
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} launches through the air!`
        });
    };
    onLeapUpdate = (_dt) => {};
    onLeapExit = () => {
        this.evaluateCombatDistance();
    };

    onMaierethEnter = () => this.startCasting('Maiereth', PLAYER.DURATIONS.MAIERETH, 'damage');
    onMaierethUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.MAIERETH);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onMaierethExit = () => {
        if (this.castingSuccess === true && this.checkPlayerResist() === true) {
            this.sacrifice(30);
            const chance = Phaser.Math.Between(1, 100);
            if (chance > 75) {
                if (this.checkPlayerResist() === true) {
                    this.scene.combatManager.fear(this.scene.player.playerID);
                } else {
                    EventBus.emit('special-combat-text', {
                        playerSpecialDescription: `You resist the dread of the dripping Moon.` // Menses wink wink
                    });
                };
            };
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} bleeds and strikes you with tendrils of Ma'anre.`
            });
            this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
            screenShake(this.scene, 90);
        };
        this.stopCasting('Countered Maiereth');
    };
    
    onPolymorphingEnter = () => this.startCasting('Polymorphing', PLAYER.DURATIONS.POLYMORPH, 'cast');
    onPolymorphingUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.POLYMORPH);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onPolymorphingExit = () => {
        if (this.castingSuccess === true && this.checkPlayerResist() === true) {
            this.scene.combatManager.polymorph(this.attacking?.enemyID);
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });        
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} polymorphs you into a rabbit!`
            });
        };
        this.stopCasting('Countered Polymorph');
        this.instincts();
    };

    onPursuitEnter = () => {
        this.scene.sound.play('wild', { volume: this.scene.settings.volume });
        if (this.scene.player.flipX) {
            this.setPosition(this.scene.player.x + 16, this.scene.player.y);
        } else {
            this.setPosition(this.scene.player.x - 16, this.scene.player.y);
        };
        if (this.isGlowing === false) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(500, () => {
                this.checkCaerenic(false);
            }, undefined, this);
        }; 
        this.instincts();
    };
    onPursuitUpdate = (_dt) => {};
    onPursuitExit = () => this.evaluateCombatDistance();
    
    onReconstituteEnter = () => {
        this.startCasting('Reconstituting', PLAYER.DURATIONS.RECONSTITUTE, 'heal', true);
        this.channelCount = 0;
        this.reconTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.reconstitute(),
            callbackScope: this,
            repeat: 5,
        });
    };
    onReconstituteUpdate = (dt) => {
        this.counterCheck();
        this.combatChecker(this.isCasting);
        if (this.isCasting) this.castbar.update(dt, 'channel', 'HEAL');
    };
    onReconstituteExit = () => {
        this.castbar.reset();
        if (this.reconTimer) {
            this.reconTimer.remove(false);
            this.reconTimer = undefined;
        }; 
        this.stopCasting('Countered Reconstitute');
    };
    reconstitute = () => {
        if (this.isCasting === false || this.scene.state.computerWin === true || this.scene.state.playerWin === true || this.scene.state.newComputerHealth <= 0 || this.isCounterSpelled === true) {
            this.isCasting = false;
            this.reconTimer.remove(false);
            this.reconTimer = undefined;
            return;
        };
        const heal = Math.round(this.ascean.health.max * 0.15);
        const total = Math.min(this.health + heal, this.ascean.health.max);
        this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
        this.channelCount++;
        if (this.channelCount >= 5) {
            this.isCasting = false;
            this.channelCount = 0;
        };    
    };

    onRushEnter = () => {
        this.isCasting = true;
        this.isRushing = true;
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });        
        const target = new Phaser.Math.Vector2(this.scene.player.x, this.scene.player.y);
        const direction = target.subtract(this.position);
        this.flickerCarenic(500);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.isParrying = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 300),
            y: this.y + (direction.y * 300),
            duration: 500,
            ease: 'Circ.easeOut',
            onComplete: () => {
                if (this.rushedEnemies.length > 0) {
                    this.rushedEnemies.forEach(enemy => {
                        this.scene.combatManager.useStamina(15);
                        this.scene.combatManager.writhe(enemy.playerID, this.enemyID);
                    });
                };
                this.isRushing = false;
                this.stateMachine.setState(States.CHASE);
            },
        });         
    };
    onRushUpdate = (_dt) => {};
    onRushExit = () => {
        this.rushedEnemies = [];
        this.isCasting = false;
        this.evaluateCombatDistance();
    };
    
    onSacrificeEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Sacrifice', 750, 'effect');
        if (this.checkPlayerResist() === false) return;
        this.scene.combatManager.useGrace(10);
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume }); 
        this.sacrifice(30);
        this.flickerCarenic(750);
    };
    onSacrificeUpdate = (_dt) => this.evaluateCombatDistance();
    onSacrificeExit = () => this.evaluateCombatDistance();
        
    onSlowingEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slow', 750, 'cast');
        if (this.checkPlayerResist() === false) return;
        this.scene.combatManager.useGrace(10);
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.combatManager.slow(this.scene.state.player._id, 3000);
        this.flickerCarenic(500);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} ensorcels your caeren, slowing you!`
        });
    };
    onSlowingUpdate = (_dt) => this.evaluateCombatDistance();
    onSlowingExit = () => this.evaluateCombatDistance();
    
    onSnaringEnter = () => this.startCasting('Snaring', PLAYER.DURATIONS.SNARE, 'cast');
    onSnaringUpdate = (dt) => {
        this.counterCheck();
        this.isSuccessful(PLAYER.DURATIONS.SNARE);
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onSnaringExit = () => {
        if (this.castingSuccess === true && this.checkPlayerResist() === true) {
            this.scene.combatManager.useGrace(10);
            this.scene.combatManager.snare(this.scene.state.player._id);
            this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} ensorcels you into a snare!`
            }); 
            screenShake(this.scene, 90);
        };
        this.stopCasting('Countered Snare');
        this.instincts();
    };

    onSutureEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Suture', 750, 'effect');
        if (this.checkPlayerResist() === false) return;    
        this.scene.combatManager.useGrace(10);
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume }); 
        this.suture(30);
        this.flickerCarenic(750);
    };
    onSutureUpdate = (_dt) => this.evaluateCombatDistance();
    onSutureExit = () => this.evaluateCombatDistance();

    onDevourEnter = () => {
        this.startCasting('Devouring', PLAYER.DURATIONS.TSHAERAL, 'damage', true);
        if (this.checkPlayerResist() === false) return;
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.scene.combatManager.useGrace(15);
        this.channelCount = 0;
        this.devourTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.isCasting === false || this.scene.state.computerWin || this.scene.state.playerWin || this.scene.state.newPlayerHealth <= 0 || this.isCounterSpelled === true) {
                    this.isCasting = false;
                    this.devourTimer.remove(false);
                    this.devourTimer = undefined;
                    return;
                };
                this.devour(5);
                this.channelCount++;
                if (this.channelCount >= 4) {
                    this.isCasting = false;
                    this.channelCount = 0;
                };
            },
            callbackScope: this,
            repeat: 4,
        });
    };
    onDevourUpdate = (dt) => {
        this.counterCheck();
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'channel', 'TENDRIL');
    };
    onDevourExit = () => {
        this.channelCount = 0;
        if (this.devourTimer) {
            this.devourTimer.remove(false);
            this.devourTimer = undefined;
        };
        this.stopCasting('Countered Devour');
    };

    // ========================== SPECIAL META STATES ========================== \\

    onChiomicEnter = () => {
        this.aoe = new AoE(this.scene, 'chiomic', 1, true, this);    
        this.scene.sound.play('death', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect');
        this.isChiomic = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.isChiomic = false;
            this.instincts();
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} mocks and confuses their surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt) => {if (!this.isChiomic) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.isDiseasing = true;
        this.aoe = new AoE(this.scene, 'tendril', 6, true, this);    
        this.scene.sound.play('dungeon', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Tendrils Swirl', 750, 'tendril');
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.isDiseasing = false;
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} swirls such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt) => {if (!this.isDiseasing) this.positiveMachine.setState(States.CLEAN);};

    onFreezeEnter = () => {
        this.aoe = new AoE(this.scene, 'freeze', 1, true, this);
        this.scene.sound.play('freeze', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Freezing', PLAYER.DURATIONS.FREEZE, 'cast');
        this.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.isFreezing = false;
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} freezes nearby foes.`
        });
    };
    onFreezeUpdate = (_dt) => {if (!this.isFreezing) this.positiveMachine.setState(States.CLEAN);};

    onHowlEnter = () => {
        this.aoe = new AoE(this.scene, 'howl', 1, true, this);    
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Howling', PLAYER.DURATIONS.HOWL, 'damage');
        this.isHowling = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.isHowling = false;
            this.instincts();
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} howls, it's otherworldly nature stunning nearby foes.`
        });
    };
    onHowlUpdate = (_dt) => {if (!this.isHowling) this.positiveMachine.setState(States.CLEAN);};

    onMaliceEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MALICE;
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.isMalicing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MALICE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.isMalicing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MALICE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} wracks malicious foes with the hush of their own attack.`
        });
    };
    onMaliceUpdate = (_dt) => {if (!this.isMalicing) this.positiveMachine.setState(States.CLEAN);  };

    maliceHit = () => {
        if (this.reactiveBubble === undefined || this.isMalicing === false || !this.inCombat) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMalicing = false;
            return;
        };
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        if (this.checkPlayerResist() === true) {
            this.chiomic(10);
        };
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isMalicing = false;
        };
    };

    onMenaceEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MENACE;
        this.scene.sound.play('scream', { volume: this.scene.settings.volume });
        this.isMenacing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Menacing', 750, 'tendril');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'dread', PLAYER.DURATIONS.MENACE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MENACE, () => {
            this.isMenacing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MENACE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} seeks to menace oncoming attacks.`
        });
    };
    onMenaceUpdate = (_dt) => {if (!this.isMenacing) this.positiveMachine.setState(States.CLEAN);};

    menace = () => {
        if (this.reactiveBubble === undefined || this.isMenacing === false || !this.inCombat) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMenacing = false;
            return;
        };
        this.scene.combatManager.fear(this.scene.player.playerID);
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 500, 'tendril');
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMenacing = false;
        };
    };

    onMendEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MEND;
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.isMending = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 750, 'tendril');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MEND);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.isMending = false;    
            if (this.reactiveBubble && this.reactiveName === States.MEND) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} seeks to mend oncoming attacks.`
        });
    };
    onMendUpdate = (_dt) => {if (!this.isMending) this.positiveMachine.setState(States.CLEAN);};

    mendHit = () => {
        if (this.reactiveBubble === undefined || this.isMending === false || !this.inCombat) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMending = false;
            return;
        };
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 500, 'tendril');
        const mend = Math.round(this.healthbar.getTotal() * 0.15);
        const heal = Math.min(this.healthbar.getTotal(), this.health + mend);
        this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: heal, id: this.enemyID }, type: 'Health' });
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isMending = false;
        };
    };

    onMultifariousEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MULTIFARIOUS;
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.isMultifaring = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Multifaring', 750, 'cast');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'ultramarine', PLAYER.DURATIONS.MULTIFARIOUS);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MULTIFARIOUS, () => {
            this.isMultifaring = false;    
            if (this.reactiveBubble && this.reactiveName === States.MULTIFARIOUS) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} seeks to multifare oncoming attacks.`
        });
    };
    onMultifariousUpdate = (_dt) => {if (!this.isMultifaring) this.positiveMachine.setState(States.CLEAN);};

    multifarious = () => {
        if (this.reactiveBubble === undefined || this.isMultifaring === false || !this.inCombat) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMultifaring = false;
            return;
        };
        this.scene.combatManager.polymorph(this.scene.player.playerID);
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Multifarious', 500, 'cast');
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMultifaring = false;
        };
    };

    onMystifyEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MYSTIFY;
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.isMystifying = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mystifying', 750, 'effect');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'chartreuse', PLAYER.DURATIONS.MYSTIFY);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MYSTIFY, () => {
            this.isMystifying = false;    
            if (this.reactiveBubble && this.reactiveName === States.MYSTIFY) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} seeks to mystify oncoming attacks.`
        });
    };
    onMystifyUpdate = (_dt) => {if (!this.isMystifying) this.positiveMachine.setState(States.CLEAN);};

    mystify = () => {
        if (this.reactiveBubble === undefined || this.isMystifying === false || !this.inCombat) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMystifying = false;
            return;
        };
        this.scene.combatManager.confuse(this.scene.player.playerID);
        this.scene.sound.play('death', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mystifying', 500, 'effect');
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMystifying = false;
        };
    };

    onProtectEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.isProtecting = true;
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Protecting', 750, 'effect');
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'gold', PLAYER.DURATIONS.PROTECT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.isProtecting = false;    
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} protects themself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt) => {if (!this.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRenewalEnter = () => {
        this.isRenewing = true;
        this.aoe = new AoE(this.scene, 'renewal', 6, false, this);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hush Tears', 750, 'bone');
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.isRenewing = false;
        });
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt) => {if (this.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        if (!this.inCombat) return;
        this.aoe = new AoE(this.scene, 'scream', 1, true, this);  
        this.scene.sound.play('scream', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Screaming', 750, 'hush');
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
            this.instincts();
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} screams, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt) => {if (!this.isScreaming) this.positiveMachine.setState(States.CLEAN);};

    onShieldEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.negationName = States.SHIELD;
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.isShielding = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shielding', 750, 'bone');
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.isShielding = false;    
            if (this.negationBubble && this.negationName === States.SHIELD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} shields themself from oncoming attacks.`
        });
    };
    onShieldUpdate = (_dt) => {if (!this.isShielding)this.positiveMachine.setState(States.CLEAN);};

    shieldHit = () => {
        if (this.negationBubble === undefined || this.isShielding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isShielding = false;
            return;
        };
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shield Hit', 500, 'effect');
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        if (this.negationBubble.charges <= 0) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shield Broken', 500, 'damage');
            this.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.isShimmering = true; 
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        if (!this.isStealthing) this.stealthEffect(true);    
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.isShimmering = false;
            this.stealthEffect(false);    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} shimmers, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt) => {if (!this.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmerHit = () => {
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `${this.ascean.name} simply wasn't there`, 500, 'effect');
    };

    onSprintEnter = () => {
        this.isSprinting = true;
        this.scene.sound.play('blink', { volume: this.scene.settings.volume / 3 });
        this.adjustSpeed(PLAYER.SPEED.SPRINT);
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.isSprinting = false;
            if (this.isGlowing === true) this.checkCaerenic(false); // 
            this.adjustSpeed(-PLAYER.SPEED.SPRINT);
        });
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} taps into their caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt) => {if (!this.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onWardEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.negationName = States.WARD;
        this.isWarding = true;
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warding', 750, 'damage');
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'red', PLAYER.DURATIONS.WARD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.isWarding = false;    
            if (this.negationBubble && this.negationName === States.WARD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} wards themself from oncoming attacks.`
        });
    };
    onWardUpdate = (_dt) => {if (!this.isWarding) this.positiveMachine.setState(States.CLEAN);};

    wardHit = () => {
        if (this.negationBubble === undefined || this.isWarding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isWarding = false;
            return;
        };
        this.scene.sound.play('parry', { volume: this.scene.settings.volume });
        if (this.checkPlayerResist() === true) {
            this.scene.combatManager.stunned(this.scene.player.ascean._id);
        };
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warded', 500, 'effect');
        if (this.negationBubble.charges <= 3) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Ward Broken', 500, 'damage');
            this.negationBubble.setCharges(0);
            this.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.aoe = new AoE(this.scene, 'writhe', 1, true, this);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Writhing', 750, 'tendril');
        this.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.isWrithing = false;
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name}'s caeren grips their body and contorts, writhing around them.`
        });
    };
    onWritheUpdate = (_dt) => {if (!this.isWrithing) this.positiveMachine.setState(States.CLEAN);};

    // ========================== STEALTH ========================== \\

    stealthEffect = (stealth) => {
        if (stealth) {
            const getStealth = (object) => {
                object.setAlpha(0.5); // 0.7
                object.setBlendMode(Phaser.BlendModes.SCREEN);
                this.scene.tweens.add({
                    targets: object,
                    tint: 0x00AAFF, // 0x00AAFF
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                }); 
            };
            getStealth(this);
            getStealth(this.spriteWeapon);
            getStealth(this.spriteShield);
        } else {
            const clearStealth = (object) => {
                this.scene.tweens.killTweensOf(object);
                object.setAlpha(1);
                object.clearTint();
                object.setBlendMode(Phaser.BlendModes.NORMAL);
            };
            clearStealth(this);
            clearStealth(this.spriteWeapon);
            clearStealth(this.spriteShield);
            this.setTint(ENEMY_COLOR);
        };
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
    };

    // ========================== STATUS EFFECT STATES ========================== \\

    onConfusedEnter = () => { 
        this.isConfused = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'c .OnFu`Se D~', DURATION.TEXT, 'effect', false, true);
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.confuseDirection = 'down';
        this.confuseMovement = 'idle';
        this.confuseVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ''; 
        if (this.isGlowing === false) this.checkCaerenic(true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === 'up') {
                    this.confuseVelocity = { x: 0, y: -1.25 };
                } else if (direction === 'down') {
                    this.confuseVelocity = { x: 0, y: 1.25 };
                } else if (direction === 'right') {
                    this.confuseVelocity = { x: -1.25, y: 0 };
                } else if (direction === 'left') {
                    this.confuseVelocity = { x: 1.25, y: 0 };
                };
                this.confuseMovement = 'move';
            } else {
                this.confuseVelocity = { x: 0, y: 0 };
                this.confuseMovement = 'idle';                
            };
            this.confuseDirection = direction;
        };
        const confusions = ['~?  ? ?!', 'Hhwat?', 'Wh-wor; -e ma i?', 'Woh `re ewe?', '...'];

        this.confuseTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                if (iteration === 5) {
                    iteration = 0;
                    this.isConfused = false;
                } else {   
                    this.specialCombatText.destroy();
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, confusions[Math.floor(Math.random() * 5)], 1000, 'effect');
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 

    };
    onConfusedUpdate = (_dt) => {
        if (!this.isConfused) this.evaluateCombatDistance();
        this.setVelocity(this.confuseVelocity.x, this.confuseVelocity.y);
        if (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0) {
            this.getDirection();
            this.anims.play(`player_running`, true);
        } else {
            this.anims.play(`player_idle`, true);
        };
    };
    onConfusedExit = () => { 
        if (this.isConfused) this.isConfused = false;
        this.evaluateCombatDistance();
        this.enemyAnimation();
        this.spriteWeapon.setVisible(true);
        if (this.confuseTimer) {
            this.confuseTimer.destroy();
            this.confuseTimer = undefined;
        };
        if (this.isGlowing === true) this.checkCaerenic(false);
    };

    onConsumedEnter = () => {
        this.consumedDuration = DURATION.CONSUMED;
        this.clearAnimations();
        this.consumedTimer = this.scene.time.addEvent({
            delay: 400,
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
        this.isConsumed = false;
    };

    onCounterSpelledEnter = () => {
        this.clearAnimations();
        this.clearTint();
        this.scene.time.delayedCall(1000, () => {
            this.isCounterSpelled = false;
        }, undefined, this);
    };
    onCounterSpelledUpdate = (_dt) => {
        this.anims.play('player_hurt', true);
        if (!this.isCounterSpelled) {
            if (this.inCombat) {
                this.stateMachine.setState(States.COMBAT);
            } else {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onCounterSpelledExit = () => this.setTint(ENEMY_COLOR);

    onFearedEnter = () => { 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage', false, true);
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
        if (this.isGlowing === false) this.checkCaerenic(true);
        let iteration = 0;
        const fears = ['...ahhh!', 'c̶o̷m̷e̷ ̴h̴e̵r̶e̶', 'Stay Away!', 'Somebody HELP ME', 'g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓'];
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
                if (iteration === 4) {
                    iteration = 0;
                    this.isFeared = false;
                    // this.count.feared -= 1;
                    // if (this.count.feared <= 0) {
                    //     this.count.feared = 0;
                    // } else {
                    //     this.stateMachine.setState(States.FEARED);
                    // };
                } else {   
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, fears[Math.floor(Math.random() * 5)], 1000, 'effect');
                };
            },
            callbackScope: this,
            repeat: 3,
        });
    };
    onFearedUpdate = (_dt) => {
        if (!this.isFeared) this.evaluateCombatDistance();
        this.setVelocity(this.fearVelocity.x, this.fearVelocity.y);
        if (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0) {
            this.getDirection();
            this.anims.play(`player_running`, true);
        } else {
            this.anims.play(`player_idle`, true);
        };
    };
    onFearedExit = () => {  
        this.evaluateCombatDistance();
        this.enemyAnimation();
        this.spriteWeapon.setVisible(true);
        if (this.fearTimer) {
            this.fearTimer.destroy();
            this.fearTimer = undefined;
        };
        if (this.isGlowing === true) this.checkCaerenic(false);
    };

    onFrozenEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Frozen', DURATION.TEXT, 'cast', false, true);
        this.anims.play('player_idle', true);
        this.setTint(0x0000FF); // 0x888888
        this.setStatic(true);
        this.scene.time.addEvent({
            delay: DURATION.FROZEN,
            callback: () => {
                this.count.frozen -= 1;
                if (this.count.frozen <= 0) {
                    this.count.frozen = 0;
                    this.isFrozen = false;
                } else {
                    this.negativeMachine.setState(States.FROZEN);
                };
            },
            callbackScope: this,
            loop: false,
        });
    };
    onFrozenUpdate = (_dt) => {if (!this.isFrozen) this.evaluateCombatDistance();};
    onFrozenExit = () => {
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.setStatic(false);
    };

    onHurtEnter = () => {
        this.clearAnimations();
        this.clearTint();
        this.isHurt = true;
        this.scene.time.delayedCall(256, () => {
            this.isHurt = false;
        }, undefined, this);
    };
    onHurtUpdate = (_dt) => {
        this.anims.play('player_hurt', true);
        if (this.isHurt === true) {
            if (this.inCombat === true) {
                this.stateMachine.setState(States.COMBAT);
            } else {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onHurtExit = () => {
        this.isHurt = false;
        this.setTint(ENEMY_COLOR);
    };

    onParalyzedEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Paralyzed', DURATION.TEXT, 'effect', false, true);
        this.paralyzeDuration = DURATION.PARALYZED;
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.isDodging = false;
        this.currentAction = ''; 
        this.anims.pause();
        this.setTint(0x888888); // 0x888888
        this.setStatic(true);
        this.scene.time.delayedCall(this.paralyzeDuration, () => {
            this.count.paralyzed -= 1;
            if (this.count.paralyzed <= 0) {
                this.count.paralyzed = 0;
                this.isParalyzed = false;
            } else {
                this.stateMachine.setState(States.COMBAT);
            };
        }, undefined, this);
    };
    onParalyzedUpdate = (_dt) => {if (this.isParalyzed === false) this.evaluateCombatDistance();};
    onParalyzedExit = () => {
        this.setTint(this.setEnemyColor())
        this.setStatic(false);
        this.anims.resume();
    };

    onPolymorphEnter = () => {
        this.isPolymorphed = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphed', DURATION.TEXT, 'effect', false, true);
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
            delay: 1000,
            callback: () => {
                iteration++;
                if (iteration === 10) {
                    iteration = 0;
                    this.isPolymorphed = false;
                } else {   
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, '...thump', 1000, 'effect');
                    if (this.isCurrentTarget && this.health < this.ascean.health.max) {
                        this.health = (this.health + (this.ascean.health.max * 0.15)) > this.ascean.health.max ? this.ascean.health.max : (this.health + (this.ascean.health.max * 0.15));
                        if (this.scene.state.enemyID === this.enemyID) {
                            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: this.health, id: this.enemyID } });
                        };
                    } else if (this.health < this.ascean.health.max) {
                        this.health = this.health + (this.ascean.health.max * 0.15);
                        // this.healthbar.setValue(this.health);
                        this.updateHealthBar(this.health);
                    };
                };
            },
            callbackScope: this,
            repeat: 10,
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
        this.enemyAnimation();
        // this.anims.play('player_running', true);
        this.setTint(ENEMY_COLOR);
        this.spriteWeapon.setVisible(true);
        if (this.polymorphTimer) {
            this.polymorphTimer.destroy();
            this.polymorphTimer = undefined;
        };
    };

    onStunEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', 2500, 'effect', false, true);
        this.stunDuration = DURATION.STUNNED;
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ''; 
        this.anims.pause();
        this.setTint(0x888888); // 0x888888
        this.setStatic(true);

        this.scene.time.delayedCall(this.stunDuration, () => {
            this.count.stunned -= 1;
            if (this.count.stunned <= 0) {
                this.count.stunned = 0;
                this.isStunned = false;
            } else {
                this.stateMachine.setState(States.COMBAT);
            };
        }, undefined, this);

        // this.stunTimer = this.scene.time.addEvent({
        //     delay: this.stunDuration,
        //     callback: () => {
        //         this.count.stunned -= 1;
        //         if (this.count.stunned <= 0) {
        //             this.count.stunned = 0;
        //             this.isStunned = false;
        //             if (this.stunTimer) {
        //                 this.stunTimer.destroy();
        //                 this.stunTimer = undefined;
        //             };
        //         } else {
        //             this.stateMachine.setState(States.COMBAT);
        //         };
        //     },
        //     callbackScope: this,
        //     loop: false,
        // });
    };
    onStunUpdate = (_dt) => {
        this.setVelocity(0);
        if (!this.isStunned) this.evaluateCombatDistance(); // Wasn't if (!this.isStunned)
    };
    onStunExit = () => { 
        this.setTint(this.setEnemyColor())
        this.setStatic(false);
        this.anims.resume();
    };

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onRootEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Rooted', DURATION.TEXT, 'effect', false, true);
        this.setTint(0x888888); // 0x888888
        this.setStatic(true);
        this.scene.time.delayedCall(DURATION.ROOTED, () => {
            this.count.rooted -= 1;
            if (this.count.rooted <= 0) {
                this.count.rooted = 0;
                this.isRooted = false;
                this.negativeMachine.setState(States.CLEAN);
            } else {
                this.negativeMachine.setState(States.CLEAN);
                this.negativeMachine.setState(States.ROOTED);
            };
        }, undefined, this);
    };
    onRootUpdate = (_dt) => {
        if (this.isRooted === false) {
            this.evaluateCombatDistance();
        } else {
            this.anims.play('player_idle', true);
        };
    };
    onRootExit = () => {  
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.setStatic(false);
        this.evaluateCombatDistance();
    };

    onSlowEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slowed', DURATION.TEXT, 'effect', false, true);
        this.setTint(0xFFC700); // 0x888888
        this.adjustSpeed(-PLAYER.SPEED.SLOW);
        this.scene.time.delayedCall(this.slowDuration, () => {
            this.count.slowed -= 1;
            if (this.count.slowed <= 0) {
                this.count.slowed = 0;
                this.isSlowed = false;
                this.negativeMachine.setState(States.CLEAN);
            } else {
                this.negativeMachine.setState(States.CLEAN);
                this.negativeMachine.setState(States.SLOWED);
            };
        }, undefined, this);
    };
    onSlowExit = () => {
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.adjustSpeed(PLAYER.SPEED.SLOW);
    };

    onSnareEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snared', DURATION.TEXT, 'effect', false, true);
        this.snareDuration = DURATION.SNARED;
        this.setTint(0x0000FF); // 0x888888
        this.adjustSpeed(-PLAYER.SPEED.SNARE);
        this.scene.time.delayedCall(this.snareDuration, () => {
            this.count.snared -= 1;
            if (this.count.snared <= 0) {
                this.count.snared = 0;
                this.isSnared = false;
                this.negativeMachine.setState(States.CLEAN);
            } else {
                this.negativeMachine.setState(States.CLEAN);
                this.negativeMachine.setState(States.SNARED);
            };
        }, undefined, this);
    };
    onSnareExit = () => { 
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.adjustSpeed(PLAYER.SPEED.SNARE);
    };

    killParticle = () => {
        this.scene.particleManager.removeEffect(this.particleEffect.id);
        this.particleEffect = undefined;
    };

    enemyActionSuccess = () => {
        if (this.isRanged) this.scene.combatManager.checkPlayerSuccess();
        const shimmer = Math.random() * 101;
        if (this.scene.player.isAbsorbing || this.scene.player.isEnveloping || this.scene.player.isShielding || (this.scene.player.isShimmering && shimmer > 50) || this.scene.player.isWarding) {
            if (this.scene.player.isAbsorbing === true) this.scene.player.playerMachine.absorb();
            if (this.scene.player.isEnveloping === true) this.scene.player.playerMachine.envelop();
            if (this.scene.player.isShielding === true) this.scene.player.playerMachine.shield();
            if (this.scene.player.isShimmering === true) this.scene.player.playerMachine.shimmer();
            if (this.scene.player.isWarding === true) this.scene.player.playerMachine.ward(this.enemyID);
            if (this.particleEffect) this.killParticle();
            return;
        };
        if (this.particleEffect) {
            if (this.isCurrentTarget) {
                this.scene.combatManager.combatMachine.action({ type: 'Weapon', data: { key: 'computerAction', value: this.particleEffect.action, id: this.enemyID } });
            } else {
                this.scene.combatManager.combatMachine.action({ type: 'Enemy', data: { enemyID: this.enemyID, ascean: this.ascean, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.particleEffect.action, parry: this.parryAction, id: this.enemyID }}});
            };
            this.killParticle();
        } else {
            if (this.isCurrentTarget) {
                if (this.scene.state.computerAction === '') return;
                this.scene.combatManager.combatMachine.action({ type: 'Weapon', data: { key: 'computerAction', value: this.scene.state.computerAction, id: this.enemyID } });
            } else {
                this.scene.combatManager.combatMachine.action({ type: 'Enemy', data: { enemyID: this.enemyID, ascean: this.ascean, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.currentAction, parry: this.parryAction, id: this.enemyID }}});
            };
        }; 
        this.scene.combatManager.useStamina(1);
        if (this.scene.player.isMenacing || this.scene.player.isModerating || this.scene.player.isMultifaring || this.scene.player.isMystifying) {
            this.scene.player.reactiveTarget = this.enemyID;
        };
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

    rangedDistanceMultiplier = (num) => this.isRanged ? num : 1;

    evaluateCombatDistance = () => {
        if (this.isCasting === true || this.isSuffering() === true) return;
        if (this.attacking === undefined || this.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.stateMachine.setState(States.LEASH);
            return;
        };
        let direction = this.attacking.position.subtract(this.position);
        const distanceY = Math.abs(direction.y);
        const multiplier = this.rangedDistanceMultiplier(DISTANCE.RANGED_MULTIPLIER);
        if (direction.length() >= DISTANCE.CHASE * multiplier) { // Switch to CHASE MODE.
            this.stateMachine.setState(States.CHASE);
        } else if (this.isRanged) { // Contiually Checking Distance for RANGED ENEMIES.
            if (!this.stateMachine.isCurrentState(States.COMBAT)) this.stateMachine.setState(States.COMBAT);
            if (distanceY > DISTANCE.RANGED_ALIGNMENT) {
                this.enemyAnimation();
                direction.normalize();
                this.setVelocityY(direction.y * this.speed * (this.isClimbing ? 0.65 : 1) + 0.5); // 2 || 4
            };
            if (this.attacking.position.subtract(this.position).length() > DISTANCE.THRESHOLD * multiplier) { // 225-525 
                this.enemyAnimation();
                direction.normalize();
                this.setVelocityX(direction.x * this.speed * (this.isClimbing ? 0.65 : 1)); // 2.25
                this.setVelocityY(direction.y * this.speed * (this.isClimbing ? 0.65 : 1)); // 2.25          
            } else if (this.attacking.position.subtract(this.position).length() < DISTANCE.THRESHOLD && !this.attacking.isRanged) { // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
                this.enemyAnimation();
                direction.normalize();
                this.setVelocityX(direction.x * -this.speed * (this.isClimbing ? 0.65 : 1)); // -2.25 | -2 | -1.75
                this.setVelocityY(direction.y * -this.speed * (this.isClimbing ? 0.65 : 1)); // -1.5 | -1.25
            } else if (distanceY < 7) { // The Sweet Spot for RANGED ENEMIES.
                this.setVelocity(0);
                this.anims.play('player_idle', true);
            } else { // Between 75 and 225 and outside y-distance
                direction.normalize();
                this.setVelocityY(direction.y * this.speed * (this.isClimbing ? 0.65 : 1)); // 2.25
            };
        } else { // Melee || Contiually Maintaining Reach for MELEE ENEMIES.
            if (!this.stateMachine.isCurrentState(States.COMBAT)) this.stateMachine.setState(States.COMBAT);
            if (direction.length() > DISTANCE.ATTACK) { 
                this.enemyAnimation();
                direction.normalize();
                this.setVelocityX(direction.x * this.speed * (this.isClimbing ? 0.65 : 1)); // 2.5
                this.setVelocityY(direction.y * this.speed * (this.isClimbing ? 0.65 : 1)); // 2.5
                this.isPosted = false;
            } else { // Inside melee range
                this.setVelocity(0);
                this.anims.play('player_idle', true);
                this.isPosted = true;
            };
        };
    };

    checkEvasion = (particle) => {
        const particleVector = new Phaser.Math.Vector2(particle.effect.x, particle.effect.y);
        const enemyVector = new Phaser.Math.Vector2(this.x, this.y);
        const particleDistance = particleVector.subtract(enemyVector);
        if (particleDistance.length() < (DISTANCE.THRESHOLD - 25) && !this.isPosted) { // 50 || 100
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
        this.isCurrentTarget = this.enemyID === this.scene.state.enemyID;
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
        this.spriteWeapon.setScale(GRIP_SCALE[this.currentWeapon.grip]);
    };

    currentParticleCheck = () => {
        if (!this.particleEffect.triggered) this.scene.particleManager.updateParticle(this.particleEffect);
        if (this.particleEffect.success) {
            this.particleEffect.triggered = true;
            this.particleEffect.success = false;
            this.enemyActionSuccess();
        } else if (this.particleEffect.collided) {
            this.scene.particleManager.removeEffect(this.particleEffect.id);
            this.particleEffect = undefined;              
        };
    };

    getDirection = () => {
        if (this.velocity.x < 0) {
            this.setFlipX(true);
        } else if (this.velocity.x > 0) {
            this.setFlipX(false);
        } else if (this.attacking) {
            const direction = this.attacking.position.subtract(this.position);
            if (direction.x < 0 && !this.flipX) {
                this.setFlipX(true);
            } else if (direction.x > 0 && this.flipX) {
                this.setFlipX(false);
            };
        };
    }; 

    evaluateEnemyAnimation = () => {
        if (!this.cleanCombatAnimation()) return;
        if (this.isClimbing) {
            if (this.moving()) {
                this.anims.play('player_climb', true);
            } else {
                this.anims.play('player_climb', true);
                this.anims.pause();
            };
        } else {
            if (this.moving()) {
                this.anims.play('player_running', true);
            } else {
                this.anims.play('player_idle', true);
            };
        };
    };

    cleanCombatAnimation = () => {
        return (this.stateMachine.isCurrentState(States.COMBAT) || this.stateMachine.isCurrentState(States.CHASE));
    };
    
    evaluateEnemyState = () => {
        this.currentWeaponCheck();
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText) this.scrollingCombatText.update(this);
        if (this.specialCombatText) this.specialCombatText.update(this); 
        if (this.reactiveBubble) this.reactiveBubble.update(this.x, this.y);
        if (this.negationBubble) this.negationBubble.update(this.x, this.y);
        if (this.inCombat === false) return;
        this.evaluateEnemyAnimation();
        if (this.isConfused && !this.sansSuffering('isConfused') && !this.stateMachine.isCurrentState(States.CONFUSED)) {
            this.stateMachine.setState(States.CONFUSED);
            return;
        };
        if (this.isConsumed && !this.stateMachine.isCurrentState(States.CONSUMED)) {
            this.stateMachine.setState(States.CONSUMED);
            return;
        };
        if (this.isCounterSpelled && !this.stateMachine.isCurrentState(States.COUNTERSPELLED)) {
            this.stateMachine.setState(States.COUNTERSPELLED);
            return;
        };
        if (this.isFeared && !this.sansSuffering('isFeared') && !this.stateMachine.isCurrentState(States.FEARED)) {
            this.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isParalyzed && !this.sansSuffering('isParalyzed') && !this.stateMachine.isCurrentState(States.PARALYZED)) {
            this.stateMachine.setState(States.PARALYZED);
            return;
        };
        if (this.isPolymorphed && !this.sansSuffering('isPolymorphed') && !this.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if (this.isStunned && !this.sansSuffering('isStunned') && !this.stateMachine.isCurrentState(States.STUNNED)) {
            this.stateMachine.setState(States.STUNNED);
            return;
        };
        if (this.isFrozen && !this.negativeMachine.isCurrentState(States.FROZEN) && !this.currentNegativeState(States.FROZEN)) {
            this.negativeMachine.setState(States.FROZEN);
            return;
        };
        if (this.isRooted && !this.negativeMachine.isCurrentState(States.ROOTED) && !this.currentNegativeState(States.ROOTED)) {
            this.negativeMachine.setState(States.ROOTED);
            return;
        };
        if (this.isSlowed && !this.negativeMachine.isCurrentState(States.SLOWED) && !this.currentNegativeState(States.SLOWED)) {
            this.negativeMachine.setState(States.SLOWED);
            return;
        };
        if (this.isSnared && !this.negativeMachine.isCurrentState(States.SNARED) && !this.currentNegativeState(States.SNARED)) {
            this.negativeMachine.setState(States.SNARED); 
            return;    
        };
        if (this.actionSuccess === true) {
            this.actionSuccess = false;
            this.enemyActionSuccess();
        };
        if (this.particleEffect) this.currentParticleCheck();
        this.getDirection();
        this.currentTargetCheck();
        if (this.isSuffering() === true || this.isCasting === true || this.isHurt === true) return;
        if (this.isUnderRangedAttack()) {
            this.stateMachine.setState(States.EVADE);
            return;
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
            case 'thrust':
                this.stateMachine.setState(States.THRUST);
                break; 
            default: break;                        
        }; 
    };
 
    update() {
        this.evaluateEnemyState(); 
        this.positiveMachine.update(this.scene.sys.game.loop.delta);   
        this.stateMachine.update(this.scene.sys.game.loop.delta);
        this.negativeMachine.update(this.scene.sys.game.loop.delta);
    };

    evaluateCombat = () => {  
        let actionNumber = Math.floor(Math.random() * 101);
        if (actionNumber > 50) { // 51-100 || (100 - computerActions.attack)
            return States.ATTACK;
        } else if (actionNumber > 40 && !this.isRanged) { // 41-50 || (100 - computerActions.attack - computerActions.parry)
            return States.PARRY;
        } else if (actionNumber > 25) { // 26-40 || (100 - computerActions.attack - computerActions.parry - computerActions.posture)
            return States.POSTURE;
        } else if (actionNumber > 10) { // 11-25 || (100 - computerActions.attack - computerActions.parry - computerActions.posture - computerActions.roll)
            return States.ROLL;
        } else { // 1-10
            return States.THRUST;
        };
    };
};