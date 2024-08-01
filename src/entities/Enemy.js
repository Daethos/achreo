import Entity, { FRAME_COUNT } from "./Entity"; 
import StateMachine, { States } from "../phaser/StateMachine";
import HealthBar from "../phaser/HealthBar";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import { EventBus } from "../game/EventBus";
import { v4 as uuidv4 } from 'uuid';
import { PLAYER } from "../utility/player";
import CastingBar from "../phaser/CastingBar";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";
import Beam from "../matter/Beam";

export const ENEMY_SPECIAL = {
    'constitution': [ // 9
        'Desperation', 
        'Disease', 
        'Healing', 
        'Kyrnaicism', 
        'Mend', 
        'Renewal', 
        'Sacrifice', 
        'Shield', 
        'Ward'
    ], // 9

    'strength': [ // 9
        'Desperation',
        'Howl', 
        'Rush',
        'Scream', 
        'Sprint', 
        'Suture', 
        'Tshaeral', 
        'Ward', 
        'Writhe'
    ], // 9

    'agility': [ // 8
        'Desperation', 
        'Pursuit', 
        'Rush', 
        'Shimmer', 
        'Snare', 
        'Slowing',
        'Sprint', 
        'Writhe'
    ], // 8

    'achre': [ // 9
        'Blink',
        'Freeze', 
        'Healing',
        'Mend', 
        'Polymorph', 
        'Sacrifice', 
        'Shimmer', 
        'Slowing',
        'Snare',
    ], // 9
        
    'caeren': [ // 8
        'Desperation', 
        'Fear', 
        'Healing', 
        'Mend', 
        'Protect', 
        'Sacrifice', 
        'Shield', 
        'Suture'
    ], // 8

    'kyosir': [ // 9
        'Chiomic', 
        'Confuse',
        'Healing', 
        'Kyrnaicism', 
        'Malice', 
        'Protect', 
        'Scream', 
        'Suture', 
        'Tshaeral'
    ], // 9
};
const DISTANCE = {
    MIN: 0,
    ATTACK: 25,
    MOMENTUM: 2,
    THRESHOLD: 75,
    CHASE: 75,
    RANGED_ALIGNMENT: 10,
    RANGED_MULTIPLIER: 3,
    DODGE: 1152, // 2304
    ROLL: 960, // 1920
};
const DURATION = {
    CONSUMED: 2000,
    FEARED: 3000,
    FROZEN: 3000,
    PARALYZED: 4000,
    ROOTED: 3000,
    SLOWED: 3000,
    SNARED: 5000,
    STUNNED: 3000,
    TEXT: 1500,
    DODGE: 288, // 288
    ROLL: 320, // 320
    SPECIAL: 10000,
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
        this.setTint(0xFF0000);
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
            }) // ===== Negative States =====
            .addState(States.CONFUSED, {
                onEnter: this.onConfusedEnter,
                onUpdate: this.onConfusedUpdate,
                onExit: this.onConfusedExit,
            })
            .addState(States.COUNTERSPELLED, {
                onEnter: this.onCounterSpelledEnter,
                onUpdate: this.onCounterSpelledUpdate,
                onExit: this.onCounterSpelledExit,
            })
            .addState(States.FEARED, {
                onEnter: this.onFearEnter,
                onUpdate: this.onFearUpdate,
                onExit: this.onFearExit,
            })
            .addState(States.PARALYZED, {
                onEnter: this.onParalyzedEnter,
                onUpdate: this.onParalyzedUpdate,
                onExit: this.onParalyzedExit,
            })
            .addState(States.POLYMORPHED, {
                onEnter: this.onPolymorphEnter,
                onUpdate: this.onPolymorphUpdate,
                onExit: this.onPolymorphExit,
            })
            .addState(States.STUNNED, {
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
            }) // ====== Special States ======
            .addState(States.BLINK, {
                onEnter: this.onBlinkEnter,
                onUpdate: this.onBlinkUpdate,
                onExit: this.onBlinkExit,
            })
            .addState(States.CONFUSE, {
                onEnter: this.onConfuseEnter,
                onUpdate: this.onConfuseUpdate,
                onExit: this.onConfuseExit,
            })
            .addState(States.DESPERATION, {
                onEnter: this.onDesperationEnter,
                onExit: this.onDesperationExit,
            })
            .addState(States.FEAR, {
                onEnter: this.onFearingEnter,
                onUpdate: this.onFearingUpdate,
                onExit: this.onFearingExit,
            })
            .addState(States.HEALING, {
                onEnter: this.onHealingEnter,
                onUpdate: this.onHealingUpdate,
                onExit: this.onHealingExit,
            })
            .addState(States.KYRNAICISM, {
                onEnter: this.onKyrnaicismEnter,
                onUpdate: this.onKyrnaicismUpdate,
                onExit: this.onKyrnaicismExit,
            })
            .addState(States.LEAP, {
                onEnter: this.onLeapEnter,
                onUpdate: this.onLeapUpdate,
                onExit: this.onLeapExit,
            })
            .addState(States.POLYMORPH, {
                onEnter: this.onPolymorphingEnter,
                onUpdate: this.onPolymorphingUpdate,
                onExit: this.onPolymorphingExit,
            })
            .addState(States.PURSUIT, {
                onEnter: this.onPursuitEnter,
                onUpdate: this.onPursuitUpdate,
                onExit: this.onPursuitExit,
            })
            .addState(States.RUSH, {
                onEnter: this.onRushEnter,
                onUpdate: this.onRushUpdate,
                onExit: this.onRushExit,
            })
            .addState(States.SACRIFICE, {
                onEnter: this.onSacrificeEnter,
                onExit: this.onSacrificeExit,
            })
            .addState(States.SLOWING, {
                onEnter: this.onSlowingEnter,
                onUpdate: this.onSlowingUpdate,
                onExit: this.onSlowingExit,
            })
            .addState(States.SNARE, {
                onEnter: this.onSnaringEnter,
                onUpdate: this.onSnaringUpdate,
                onExit: this.onSnaringExit,
            })
            .addState(States.SUTURE, {
                onEnter: this.onSutureEnter,
                onExit: this.onSutureExit,
            })
            .addState(States.TSHAERAL, {
                onEnter: this.onTshaeralEnter,
                onUpdate: this.onTshaeralUpdate,
                onExit: this.onTshaeralExit,
            })

        this.stateMachine.setState(States.IDLE);

        this.metaMachine = new StateMachine(this, 'enemy');
        this.metaMachine
            .addState(States.CLEAN, {
                onEnter: this.onCleanEnter,
                onExit: this.onCleanExit,
            })
            .addState(States.CHIOMIC, {
                onEnter: this.onChiomicEnter,
                onUpdate: this.onChiomicUpdate,
                onExit: this.onChiomicExit,
            })
            .addState(States.DISEASE, {
                onEnter: this.onDiseaseEnter,
                onUpdate: this.onDiseaseUpdate,
                onExit: this.onDiseaseExit,
            })
            .addState(States.FREEZE, {
                onEnter: this.onFreezeEnter,
                onUpdate: this.onFreezeUpdate,
                onExit: this.onFreezeExit,
            })
            .addState(States.HOWL, {
                onEnter: this.onHowlEnter,
                onUpdate: this.onHowlUpdate,
                onExit: this.onHowlExit,
            })
            .addState(States.MALICE, {
                onEnter: this.onMaliceEnter,
                onUpdate: this.onMaliceUpdate,
                onExit: this.onMaliceExit,
            })
            .addState(States.MEND, {
                onEnter: this.onMendEnter,
                onUpdate: this.onMendUpdate,
                onExit: this.onMendExit,
            })
            .addState(States.PROTECT, {
                onEnter: this.onProtectEnter,
                onUpdate: this.onProtectUpdate,
                onExit: this.onProtectExit,
            })
            .addState(States.RENEWAL, {
                onEnter: this.onRenewalEnter,
                onUpdate: this.onRenewalUpdate,
                onExit: this.onRenewalExit,
            })
            .addState(States.SCREAM, {
                onEnter: this.onScreamEnter,
                onUpdate: this.onScreamUpdate,
                onExit: this.onScreamExit,
            })
            .addState(States.SHIELD, {
                onEnter: this.onShieldEnter,
                onUpdate: this.onShieldUpdate,
                onExit: this.onShieldExit,
            })
            .addState(States.SHIMMER, {
                onEnter: this.onShimmerEnter,
                onUpdate: this.onShimmerUpdate,
                onExit: this.onShimmerExit,
            })
            .addState(States.SPRINTING, {
                onEnter: this.onSprintEnter,
                onUpdate: this.onSprintUpdate,
                onExit: this.onSprintExit,
            })
            .addState(States.WARD, {
                onEnter: this.onWardEnter,
                onUpdate: this.onWardUpdate,
                onExit: this.onWardExit,
            })
            .addState(States.WRITHE, {
                onEnter: this.onWritheEnter,
                onUpdate: this.onWritheUpdate,
                onExit: this.onWritheExit,
            }); 
        // ========== NEGATIVE META STATES ========== \\
        this.negMetaMachine = new StateMachine(this, 'enemy');
        this.negMetaMachine
            .addState(States.CLEAN, {
                onEnter: this.onCleanEnter,
                onExit: this.onCleanExit,
            })
            .addState(States.FROZEN, {
                onEnter: this.onFrozenEnter,
                onUpdate: this.onFrozenUpdate,
                onExit: this.onFrozenExit,
            })
            .addState(States.ROOTED, {
                onEnter: this.onRootEnter,
                onUpdate: this.onRootUpdate,
                onExit: this.onRootExit,
            })
            .addState(States.SLOWED, {
                onEnter: this.onSlowEnter,
                onExit: this.onSlowExit,
            })
            .addState(States.SNARED, {
                onEnter: this.onSnareEnter,
                onExit: this.onSnareExit,
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
        this.isRushing = false;
        this.rushedEnemies = [];
        this.touching = [];
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
        
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.scene.setupEnemy(this);
                this.clearTint();
                this.setTint(0x00FF00);
                const newEnemy = this.isNewEnemy(this.scene.player);
                if (newEnemy) {
                    this.scene.player.addEnemy(this);
                };
                this.scene.player.setAttacking(this);
                this.scene.player.setCurrentTarget(this);
            })
            .on('pointerout', () => {
                this.clearTint();
                this.setTint(0xFF0000);
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
        if (this.enemyID !== e.id) return; // Is the enemy whose health is receiving an update
        if (this.health > e.health) {
            let damage = Math.round(this.health - e.health);
            damage = e?.glancing === true ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e?.critical);
        } else if (this.health < e.health) {
            let heal = Math.round(e.health - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, 1500, 'heal');
        };
        this.health = e.health;
        this.healthbar.setValue(e.health);
        this.updateHealthBar(e.health);
        if (e.health <= 0) {
            this.isDefeated = true;
            this.stateMachine.setState(States.DEFEATED);
        };
        const isNewEnemy = this.isNewEnemy(this.scene.player);
        if (isNewEnemy === true || this.inCombat === false) {
            this.scene.player.targetEngagement(this.enemyID);
            this.jumpIntoCombat();
        };
    };

    checkCaerenic = (caerenic) => {
        this.isGlowing = caerenic;
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, 'weapon');
        this.setGlow(this.spriteShield, caerenic, 'shield');
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
    
    combatDataUpdate = (e) => {
        if (this.enemyID !== e.enemyID) {
            if (this.inCombat === true) this.currentRound = e.combatRound;
            if (this.inCombat === true && this.attacking && e.newPlayerHealth <= 0 && e.computerWin === true) {
                this.clearCombatWin();
            };
            return;
        };
        if (this.isDefeated === true && this.inCombat === true) {
            this.stateMachine.setState(States.DEFEATED);
            return;
        };
        if (this.health > e.newComputerHealth) { 
            let damage = Math.round(this.health - e.newComputerHealth);
            damage = e.criticalSuccess === true ? `${damage} (Critical)` : e.glancingBlow === true ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e.criticalSuccess);
            if (this.isConsumed === false && this.isHurt === false && this.isFeared === false && this.isSlowed === false) this.stateMachine.setState(States.HURT);
            if (this.currentRound !== e.combatRound || this.inCombat === false) {
                if (this.isPolymorphed === true) this.isPolymorphed = false;
                if (this.isConfused === true) this.isConfused = false;
                if (this.inCombat === false && this.isDefeated === false) {
                    this.checkEnemyCombatEnter();
                };
            };
            if (e.newComputerHealth <= 0) {
                this.isDefeated = true;
                this.stateMachine.setState(States.DEFEATED);
            };
        } else if (this.health < e.newComputerHealth) { 
            let heal = Math.round(e.newComputerHealth - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, 1500, 'heal');
        }; 
        this.health = e.newComputerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.computerHealth) this.healthbar.setTotal(e.computerHealth);
        if (this.healthbar.visible === true) this.updateHealthBar(this.health);
        this.weapons = e.computerWeapons;
        this.setWeapon(e.computerWeapons[0]); 
        this.checkDamage(e.computerDamageType.toLowerCase()); 
        this.checkMeleeOrRanged(e.computerWeapons?.[0]);
        this.currentRound = e.combatRound;
        if (e.newPlayerHealth <= 0 && e.computerWin === true) {
            this.clearCombatWin();
        };
    };

    computerCombatUpdate = (e) => {
        if (this.enemyID !== e.enemyID) return;
        if (this.health > e.newComputerHealth) {
            let damage = Math.round(this.health - e.newComputerHealth);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e.criticalSuccess);
            if (!this.isConsumed && !this.isHurt && !this.isFeared && !this.isSlowed) this.stateMachine.setState(States.HURT);
            if (this.currentRound !== e.combatRound || this.inCombat === false) {
                if (this.isPolymorphed) this.isPolymorphed = false;
                if (this.inCombat === false && this.isDefeated === false) {
                    this.checkEnemyCombatEnter();
                };
            };
            if (e.newComputerHealth <= 0) {
                this.isDefeated = true;
                this.stateMachine.setState(States.DEFEATED);
            };
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
        if (this.isRushing) {
            const newEnemy = this.rushedEnemies.every(obj => obj.playerID !== enemy.playerID);
            if (newEnemy) {
                this.rushedEnemies.push(enemy);
            };
        };
    };
    
    enemyCollision = (enemySensor) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [enemySensor],
            callback: other => {
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
                        if (this.scene.state.enemyID !== this.enemyID) this.scene.setupEnemy(this);
                        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
                        if (this.stateMachine.isCurrentState(States.DEFEATED)) {
                            this.scene.showDialog(true);
                        } else {
                            this.stateMachine.setState(States.AWARE);
                        };
                    };
                // } else if (other.gameObjectB && other.gameObjectB.name === 'enemy') {
                //     console.log(`%c ${this.ascean.name} has come into contact with ${other.gameObjectB?.ascean?.name}. Are you aggressive against computers? ${this.computerAggressive}`, 'color: #ff0000');
                //     this.touching.push(other.gameObjectB);
                //     // if (this.isAggressive) {
                //     //     this.createCombat(other, 'start');
                //     // };
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [enemySensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.touching = this.touching.filter((target) => target === other.gameObjectB);
                    if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive) {
                        if (this.healthbar) this.healthbar.setVisible(false);
                        if (this.isDefeated === true) {
                            this.scene.showDialog(false);
                            this.stateMachine.setState(States.DEFEATED);
                        } else {
                            this.stateMachine.setState(States.IDLE);
                        };
                        this.scene.clearNonAggressiveEnemy();
                    };
                // } else if (other.gameObjectB && other.gameObjectB.name === 'enemy') {
                //     this.touching = this.touching.filter((target) => target === other.gameObjectB);
                };
            },
            context: this.scene,
        });
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
    };

    checkEnemyCombatEnter = () => {
        const newEnemy = this.isNewEnemy(this.scene.player);
        if (newEnemy) {
            this.scene.player.targets.push(this);
        };
        this.attacking = this.scene.player;
        this.inCombat = true;
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE); 
        if (this.scene.player.isCombat === false) {
            this.scene.player.targetEngagement(this.enemyID);
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
        this.health = e.combat.attributes.healthTotal;
        this.combatStats = e.combat; 
        this.weapons = [e.combat.combatWeaponOne, e.combat.combatWeaponTwo, e.combat.combatWeaponThree];
        this.speed = this.startingSpeed(e.enemy);
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
            this.scene.player.setAttacking(this);
            this.scene.player.setCurrentTarget(this);
            this.scene.player.actionTarget = collision;
            this.scene.player.targetID = this.enemyID;
            this.scene.player.highlightTarget(this);
            this.scene.player.inCombat = true;

            this.attacking = collision.gameObjectB;
            this.scene.setupEnemy(this);
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
            
            if (this.scene.state.enemyID !== this.enemyID) this.scene.setupEnemy(this);
            collision.gameObjectB.attacking = this;
            collision.gameObjectB.currentTarget = this;
            collision.gameObjectB.inCombat = true;
            collision.gameObjectB.highlightTarget(this);
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
                this.currentAction = 'special';
                const snares = ['slow', 'kyrnaicism'];
                const snare = Math.round(Math.random()) === 1 ? snares[1] : snares[0];
                console.log('Snare!', snare);
                if (this.stateMachine.isState(snare)) {
                    this.stateMachine.setState(snare);
                } else if (this.metaMachine.isState(snare)) {
                    this.metaMachine.setState(snare);
                };
                this.setSpecialCombat(true);
            }, undefined, this);
        } else {
            this.specialCombat?.remove();
        };
    };

    chiomic = (strength) => {
        this.scene.useGrace(strength);
        if (this.isCurrentTarget === true) {
            this.scene.combatMachine.action({ type: 'Enemy Chiomic', data: strength });
        } else {
            const caerenic = this.scene.state.isCaerenic ? 1.25 : 1;
            const stalwart = this.scene.state.isStalwart ? 0.85 : 1;
            const total = this.healthbar.getTotal();
            const enemyChiomic = Math.round(total * (strength / 100) * caerenic * stalwart  * (this.ascean?.level + 9) / 10);
            const newPlayerHealth = this.health - enemyChiomic < 0 ? 0 : this.health - enemyChiomic;
            const computerActionDescription = `${this.ascean?.name} flays ${enemyChiomic} health from you with their hush.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: newPlayerHealth, id: this.scene.player.playerID } });
        };
    };

    checkDamage = (damage) => {
        this.currentDamageType = damage;
        this.hasMagic = this.checkDamageType(damage, 'magic');
    };

    isSuffering = () => this.isConfused || this.isFeared || this.isParalyzed || this.isPolymorphed || this.isStunned;
    
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
        this.anims.play('player_pray', true).on('animationcomplete', () => this.anims.play('player_idle', true));
        this.isDefeated = true;
        this.inCombat = false;
        this.setSpecialCombat(false);
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
        this.setSpecialCombat(false);
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
    onIdleExit = () => this.anims.stop('player_idle');
 
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
        }, undefined, this);
    }; 
    onPatrolUpdate = (_dt) => this.setVelocity(this.patrolVelocity.x, this.patrolVelocity.y);
    onPatrolExit = () => {};

    onAwarenessEnter = () => {
        this.anims.play('player_idle', true);
        this.setVelocity(0);
        this.scene.showDialog(true);
        this.setStatic(true);
    };
    onAwarenessUpdate = (_dt) => {
        this.anims.play('player_idle', true);
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
        if (distance >= 50 * rangeMultiplier) { // was 75 || 100
            if (this.path && this.path.length > 1) {
                this.setVelocity(this.pathDirection.x * (this.speed), this.pathDirection.y * (this.speed)); // 2.5
            } else {
                if (this.isPathing) this.isPathing = false;
                direction.normalize();
                this.setVelocity(direction.x * (this.speed), direction.y * (this.speed)); // 2.5
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
        if (this.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.inCombat = false;
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.anims.play('player_running', true);
        this.scene.time.delayedCall(this.swingTimer, () => {
            this.combat(this.attacking);
        }, undefined, this);
    };
    onCombatUpdate = (_dt) => this.evaluateCombatDistance();
    onCombatExit = () => {};

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
        if (this.isDodging) this.anims.play('player_slide', true);
        if (this.isRolling) this.anims.play('player_roll', true);        
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
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isAttacking) this.evaluateCombatDistance(); 
    };
    onAttackExit = () => {if (this.scene.state.computerAction !== '') this.scene.combatMachine.input('computerAction', '', this.enemyID);};

    onParryEnter = () => {
        this.isParrying = true;
        this.parry();
    };
    onParryUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.PARRY_LIVE && !this.isRanged) this.scene.combatMachine.input('computerAction', 'parry', this.enemyID);
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
        if (this.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.isRanged) this.scene.combatMachine.input('computerAction', 'posture', this.enemyID);
        if (!this.isRanged) this.swingMomentum(this.attacking);
        if (!this.isPosturing) this.evaluateCombatDistance();
    };
    onPostureExit = () => {if (this.scene.state.computerAction !== '') this.scene.combatMachine.input('computerAction', '', this.enemyID);};

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

    combatChecker = (state) => {
        if (state) return;
        this.evaluateCombatDistance();
    };

    // ========================== SPECIAL ENEMY STATES ========================== \\

    onBlinkEnter = () => {
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        if (this.flipX === true) {
            this.setVelocityX(35);
        } else {
            this.setVelocityX(-35);
        };
        if (this.isGlowing === false) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(500, () => {
                this.checkCaerenic(false);
                this.stateMachine.setState(States.HEALING);
            }, undefined, this);
        };
    };
    onBlinkUpdate = (_dt) => {};
    onBlinkExit = () => {
        this.isPerformingSpecial = false;
        this.evaluateCombatDistance();
    };

    onConfuseEnter = () => {
        this.isPerformingSpecial = true;
        this.isConfusing = true;
        this.anims.play('player_health', true);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast');
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.CONFUSE, () => {
            if (this.checkPlayerResist() === true) {
                if (this.wasCounterSpelled === true) {
                    this.wasCounterSpelled = false;
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Countered Confuse', 750, 'damage', false, true);
                } else {
                    this.scene.confuse(this.scene.state.player._id);
                    this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
                };
            };    
            this.checkCaerenic(false);
            this.stateMachine.setState(States.HEALING);    
        }, undefined, this);
    };
    onConfuseUpdate = (_dt) => {
        this.anims.play('player_health', true);
        if (this.scene.player.isCounterSpelling === true) {
            this.isCounterSpelled = true;
            this.wasCounterSpelled = true;
        };
    };
    onConfuseExit = () => {
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean?.name} confuses you, causing you to stumble around in a daze.`
        });
        this.isPerformingSpecial = false;
    };

    onDesperationEnter = () => {
        this.isPerformingSpecial = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'cast');
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.DESPERATION, () => {
            const heal = Math.round(this.ascean.health.max * 0.5);
            const total = Math.min(this.health + heal, this.ascean.health.max);
            this.scene.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
            this.checkCaerenic(false);
            this.isStunned = true;
            this.stateMachine.setState(States.STUNNED);
        }, undefined, this);
    };
    onDesperationExit = () => this.isPerformingSpecial = false;

    onFearingEnter = () => {
        this.anims.play('player_health', true);
        this.isFearing = true;
        this.isPerformingSpecial = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Fearing', PLAYER.DURATIONS.FEAR / 2, 'cast');
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.FEAR, () => {
            if (this.checkPlayerResist() === true) {
                if (this.wasCounterSpelled === true) {
                    this.wasCounterSpelled = false;
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Countered Fear', 750, 'damage', false, true);
                } else {
                    this.scene.fear(this.scene.state.player._id);
                    this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
                };
            };
            this.checkCaerenic(false);
            if (this.inCombat === true) {
                this.stateMachine.setState(States.CHASE);
            } else {
                this.stateMachine.setState(States.LEASH);
            };
        }, undefined, this);
    };
    onFearingUpdate = (_dt) => {
        this.anims.play('player_health', true);
        if (this.scene.player.isCounterSpelling === true) {
            this.isCounterSpelled = true;
            this.wasCounterSpelled = true;
        };
    };
    onFearingExit = () => {
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean?.name} strikes fear into you, causing you to panic in terror!`
        });
        this.isPerformingSpecial = false;
        this.evaluateCombatDistance();
    };

    onHealingEnter = () => {
        this.isPerformingSpecial = true;
        this.anims.play('player_health', true);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast');
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.HEALING, () => {
            if (this.wasCounterSpelled === true) {
                this.wasCounterSpelled = false;
                this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Countered Heal', 750, 'damage', false, true);
            } else {
                const heal = Math.round(this.ascean.health.max * 0.25);
                const total = Math.min(this.health + heal, this.ascean.health.max);
                this.scene.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
                this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
            };        
            this.checkCaerenic(false);
            if (this.inCombat === true) {
                this.stateMachine.setState(States.CHASE);
            } else {
                this.stateMachine.setState(States.LEASH);
            };
        });
    };
    onHealingUpdate = (_dt) => {
        this.anims.play('player_health', true);
        if (this.scene.player.isCounterSpelling === true) {
            this.isCounterSpelled = true;
            this.wasCounterSpelled = true;
        };
    };
    onHealingExit = () => {
        this.isPerformingSpecial = false;
        this.evaluateCombatDistance();
    };
    
    onKyrnaicismEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage');
        if (this.checkPlayerResist() === false) return;
        this.isChiomic = true;
        this.isPerformingSpecial = true;
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.scene.slow(this.scene.player.playerID, this.slowDuration);
        this.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.wasCounterSpelled === true) {
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Countered Kyrnaicism', 750, 'damage', false, true);
                };
                if (!this.isChiomic || this.scene.state.playerWin || this.scene.state.newComputerHealth <= 0 || this.wasCounterSpelled === true) {
                    this.wasCounterSpelled = false;
                    this.isChiomic = false;
                    this.chiomicTimer.remove(false);
                    this.chiomicTimer = undefined;
                    return;
                };
                this.scene.slow(this.scene.player.playerID, this.slowDuration);
                this.chiomic(10);
            },
            callbackScope: this,
            repeat: 3,
        });
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                this.isChiomic = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.setStatic(true);
    };
    onKyrnaicismUpdate = (dt) => {
        if (this.isChiomic) {
            this.castbar.update(dt, 'channel', 0xA700FF, this.x, this.y);
        } else {
            this.stateMachine.setState(States.CHASE);
        };
        if (this.scene.player.isCounterSpelling === true) {
            this.isCounterSpelled = true;
            this.wasCounterSpelled = true;
        };
    };
    onKyrnaicismExit = () => {
        this.castbar.reset();
        this.isPerformingSpecial = false;
        if (this.isGlowing === true) this.checkCaerenic(false);
        this.setStatic(false);
        if (this.chiomicTimer) {
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
        };
    };

    onLeapEnter = () => {
        this.isPerformingSpecial = true;
        this.isLeaping = true;
        const target = new Phaser.Math.Vector2(this.scene.player.x, this.scene.player.y);
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
        if (this.isGlowing === false) {
            this.checkCaerenic(true);
        };
        this.isAttacking = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 125),
            y: this.y + (direction.y * 125),
            duration: 750,
            ease: 'Elastic',
            onComplete: () => { 
                this.isLeaping = false; 
                if (this.touching.length > 0) {
                    this.touching.forEach(enemy => {
                        if (enemy.playerID !== this.scene.player.playerID) return;
                        this.scene.writhe(enemy.playerID, 'leap');
                        this.scene.useStamina(15);
                    });
                };
                this.stateMachine.setState(States.COMBAT);
            },
        });       
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} launchs themself through the air!`
        });
    };
    onLeapUpdate = (_dt) => {};
    onLeapExit = () => {
        this.isPerformingSpecial = false;
        this.checkCaerenic(false);
        this.evaluateCombatDistance();
    };
    
    onPolymorphingEnter = () => {
        this.anims.play('player_health', true);
        this.isPerformingSpecial = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast');
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.POLYMORPH, () => {
            if (this.checkPlayerResist() === true) {
                if (this.wasCounterSpelled === true) {
                    this.wasCounterSpelled = false;
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Countered Polymorph', 750, 'damage', false, true);
                } else {
                    this.scene.polymorph(this.attacking?.enemyID);
                    this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });        
                };
            };
            this.checkCaerenic(false);
            this.stateMachine.setState(States.HEALING);
        }, undefined, this);
    };
    onPolymorphingUpdate = (_dt) => {
        this.anims.play('player_health', true);
        if (this.scene.player.isCounterSpelling === true) {
            this.isCounterSpelled = true;
            this.wasCounterSpelled = true;
        };
    };
    onPolymorphingExit = () => {
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} polymorphs you into a rabbit!`
        });
        this.isPerformingSpecial = false;
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
        this.stateMachine.setState(States.COMBAT);    
    };
    onPursuitUpdate = (_dt) => {};
    onPursuitExit = () => this.evaluateCombatDistance();

    onRushEnter = () => {
        this.isPerformingSpecial = true;
        this.isRushing = true;
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });        
        const target = new Phaser.Math.Vector2(this.scene.player.x, this.scene.player.y);
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
        if (this.isGlowing === false) {
            this.checkCaerenic(true);
        };
        this.isParrying = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 300),
            y: this.y + (direction.y * 300),
            duration: 600,
            ease: 'Circ.easeOut',
            onComplete: () => {
                if (this.rushedEnemies.length > 0) {
                    this.rushedEnemies.forEach(enemy => {
                        this.scene.useStamina(15);
                        this.scene.writhe(enemy.playerID, 'rush');
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
        if (this.isGlowing === true) this.checkCaerenic(false);
        this.isPerformingSpecial = false;
        this.evaluateCombatDistance();
    };
    
    onSacrificeEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Sacrifice', 750, 'effect');
        if (this.checkPlayerResist() === false) return;
        this.scene.useGrace(10);
        this.isPerformingSpecial = true;
        this.isSacrificing = true;
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume }); 
        if (this.isCurrentTarget === true) {
            this.scene.combatMachine.action({ type: 'Enemy Sacrifice', data: undefined });
        } else {
            const caerenic = this.scene.state.isCaerenic ? 1.25 : 1;
            const stalwart = this.scene.state.isStalwart ? 0.85 : 1;
            const sacrifice = Math.round(this.ascean?.[this.ascean?.mastery] * caerenic * stalwart * ((this.ascean?.level + 9) / 10));
            const ratio = sacrifice / this.scene.state.playerHealth;
            // let newPlayerHealth = this.scene.state.newPlayerHealth - sacrifice < 0 ? 0 : this.scene.state.newPlayerHealth - sacrifice;
            let newComputerHealth = this.health + (sacrifice / 2) > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + (sacrifice / 2);
            const computerActionDescription = `${this.ascean?.name} sacrifices ${sacrifice / 2} health to rip ${sacrifice} from you.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.scene.player.playerID } });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
        };
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(500, () => {
            if (this.isGlowing === true) this.checkCaerenic(false);
            this.isSacrificing = false;
            if (this.inCombat) {
                this.stateMachine.setState(States.CHASE);
            } else {
                this.stateMachine.setState(States.LEASH);
            };
        }, undefined, this);
    };
    onSacrificeExit = () => {
        this.isPerformingSpecial = false;
        this.evaluateCombatDistance();
    };
        
    onSlowingEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slow', 750, 'cast');
        if (this.checkPlayerResist() === false) return;
        this.scene.useGrace(10);
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.slow(this.scene.state.player._id, 3000);
        if (this.isGlowing === false) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(500, () => {
                this.checkCaerenic(false);
            }, undefined, this);
        };
    };
    onSlowingUpdate = (_dt) => this.evaluateCombatDistance();
    onSlowingExit = () => EventBus.emit('enemy-combat-text', {
        computerSpecialDescription: `${this.ascean.name} ensorcels your caeren, slowing you!`
    });
    
    onSnaringEnter = () => {
        this.isPerformingSpecial = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snaring', PLAYER.DURATIONS.SNARE, 'cast');
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SNARE, () => {
            if (this.checkPlayerResist() === true) {
                if (this.wasCounterSpelled === true) {
                    this.wasCounterSpelled = false;
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Countered Snare', 750, 'damage', false, true);
                } else {
                    this.scene.useGrace(10);
                    this.scene.snare(this.scene.state.player._id);
                    this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
                };
            };
            this.checkCaerenic(false);
            if (this.inCombat) {
                this.stateMachine.setState(States.CHASE);
            } else {
                this.stateMachine.setState(States.LEASH);
            };
        }, undefined, this);    
    };
    onSnaringUpdate = (_dt) => {
        this.anims.play('player_health', true);
        if (this.scene.player.isCounterSpelling === true) {
            this.isCounterSpelled = true;
            this.wasCounterSpelled = true;
        };
    };
    onSnaringExit = () => {
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} ensorcels you into a snare!`
        }); 
        this.isPerformingSpecial = false;
        this.evaluateCombatDistance();
    };

    onSutureEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Suture', 750, 'effect');
        if (this.checkPlayerResist() === false) return;    
        this.scene.useGrace(10);
        this.isPerformingSpecial = true;
        this.isSuturing = true;
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume }); 
        if (this.isCurrentTarget === true) {
            this.scene.combatMachine.action({ type: 'Enemy Suture', data: undefined });
        } else {
            const caerenic = this.scene.state.isCaerenic ? 1.25 : 1;
            const stalwart = this.scene.state.isStalwart ? 0.85 : 1;
            const suture = Math.round(this.ascean?.[this.ascean?.mastery] / 2 * caerenic * stalwart * ((this.ascean?.level + 9) / 10));
            const ratio = suture * 1.25 / this.scene.state.playerHealth;
            let newComputerHealth = this.health + suture > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + suture;
            const computerActionDescription = `${this.ascean?.name} sutured ${suture} health from you, absorbing ${suture}.`;
            
            EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.scene.player.playerID } });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
        };
        
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(500, () => {
            if (this.isGlowing === true) this.checkCaerenic(false);
            this.isSuturing = false;
            if (this.inCombat) {
                this.stateMachine.setState(States.CHASE);
            } else {
                this.stateMachine.setState(States.LEASH);
            };
        }, undefined, this);
        
    };
    onSutureExit = () => {
        this.isPerformingSpecial = false;
        this.evaluateCombatDistance();
    };

    onTshaeralEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Tshaering', PLAYER.DURATIONS.TSHAERAL / 2, 'damage');
        if (this.checkPlayerResist() === false) return;    
        this.isPerformingSpecial = true;
        this.isTshaering = true;
        this.attacking.isConsumed = true;
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setTotal(PLAYER.DURATIONS.TSHAERAL);
        this.castbar.setTime(PLAYER.DURATIONS.TSHAERAL);
        this.tshaeringTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => {
                if (this.wasCounterSpelled === true) {
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Countered Tshaeral', 750, 'red');
                };
                if (!this.isTshaering || this.scene.state.computerWin || this.scene.state.newPlayerHealth <= 0 || this.wasCounterSpelled === true) {
                    this.wasCounterSpelled = false;
                    this.isTshaering = false;
                    this.tshaeringTimer.remove(false);
                    this.tshaeringTimer = undefined;
                    return;
                };
                this.scene.useGrace(2);
                if (this.isCurrentTarget === true) {
                    this.scene.combatMachine.action({ type: 'Enemy Tshaeral', data: 3 });
                } else {
                    const caerenic = this.scene.state.isCaerenic ? 1.25 : 1;
                    const stalwart = this.scene.state.isStalwart ? 0.85 : 1;
                    const devour = Math.round(this.combatStats.attributes.healthTotal * 0.03 * caerenic * stalwart * (this.ascean.level + 9) / 10);
                    // const ratio = devour / this.scene.state.playerHealth;
                    // let newPlayerHealth = this.scene.state.newPlayerHealth - devour < 0 ? 0 : this.scene.state.newPlayerHealth - devour;
                    let newComputerHealth = this.health + devour > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + devour;
                    const computerActionDescription = `${this.ascean?.name} tshaers and devours ${devour} health from you.`;
                    EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
                    this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: -3, id: this.scene.player.playerID } });
                    this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
                };
            },
            callbackScope: this,
            repeat: 8,
        });
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.isTshaering = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.setStatic(true);
    };
    onTshaeralUpdate = (dt) => {
        if (this.isTshaering) {
            this.castbar.update(dt, 'channel', 0xA700FF, this.x, this.y);
        } else {
            if (this.inCombat) {
                this.stateMachine.setState(States.CHASE);
            } else {
                this.stateMachine.setState(States.LEASH);
            };
        };
        if (this.scene.player.isCounterSpelling === true) {
            this.isCounterSpelled = true;
            this.wasCounterSpelled = true;
        };
    };
    onTshaeralExit = () => {
        this.isPerformingSpecial = false;
        if (this.isGlowing === true) this.checkCaerenic(false);
        this.setStatic(false);
        if (this.tshaeringTimer) {
            this.tshaeringTimer.remove(false);
            this.tshaeringTimer = undefined;
        };
    };

    // ========================== SPECIAL META STATES ========================== \\

    onChiomicEnter = () => {
        this.aoe = new AoE(this.scene, 'chiomic', 1, true, this);    
        this.scene.sound.play('death', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect');
        this.isChiomic = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.isChiomic = false;
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} mocks and confuses their surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt) => {if (!this.isChiomic) this.metaMachine.setState(States.CLEAN);};
    onChioimicExit = () => {};

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
    onDiseaseUpdate = (_dt) => {if (!this.isDiseasing) this.metaMachine.setState(States.CLEAN);};
    onDiseaseExit = () => {};

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
    onFreezeUpdate = (_dt) => {if (!this.isFreezing) this.metaMachine.setState(States.CLEAN);};
    onFreezeExit = () => {};

    onHowlEnter = () => {
        this.aoe = new AoE(this.scene, 'howl', 1, true, this);    
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Howling', PLAYER.DURATIONS.HOWL, 'damage');
        this.isHowling = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.isHowling = false;
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} howls, it's otherworldly nature stunning nearby foes.`
        });
    };
    onHowlUpdate = (_dt) => {if (!this.isHowling) this.metaMachine.setState(States.CLEAN);};
    onHowlExit = () => {};

    onMaliceEnter = () => {
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.isMalicing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        this.maliceBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MALICE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.isMalicing = false;    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} wracks malicious foes with the hush of their own attack.`
        });
    };
    onMaliceUpdate = (_dt) => {
        if (this.isMalicing) {
            this.maliceBubble.update(this.x, this.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onMaliceExit = () => {
        if (this.maliceBubble) {
            this.maliceBubble.destroy();
            this.maliceBubble = undefined;
        };
    };

    maliceHit = () => {
        if (this.maliceBubble === undefined || this.isMalicing === false) {
            if (this.maliceBubble) {
                this.maliceBubble.destroy();
                this.maliceBubble = undefined;
            };
            this.isMalicing = false;
            return;
        };
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        if (this.checkPlayerResist() === true) {
            this.chiomic(10);
            this.scene.combatMachine.action({ data: 10, type: 'Enemy Chiomic' });
        };
        this.maliceBubble.setCharges(this.maliceBubble.charges - 1);
        if (this.maliceBubble.charges <= 0) {
            this.isMalicing = false;
        };
    };

    onMendEnter = () => {
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.isMending = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 750, 'tendril');
        this.mendBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MEND);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.isMending = false;    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} seeks to mend oncoming attacks.`
        });
    };
    onMendUpdate = (_dt) => {
        if (this.isMending) {
            this.mendBubble.update(this.x, this.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onMendExit = () => {
        if (this.mendBubble) {
            this.mendBubble.destroy();
            this.mendBubble = undefined;
        };
    };

    mendHit = () => {
        if (this.mendBubble === undefined || this.isMending === false) {
            if (this.mendBubble) {
                this.mendBubble.destroy();
                this.mendBubble = undefined;
            };
            this.isMending = false;
            return;
        };
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 500, 'tendril');
        const mend = Math.round(this.ascean.health.max * 0.15);
        const heal = Math.min(this.ascean.health.max, this.ascean.health.current + mend);
        this.scene.combatMachine.action({ data: { key: 'enemy', value: heal, id: this.enemyID }, type: 'Health' });
        this.mendBubble.setCharges(this.mendBubble.charges - 1);
        if (this.mendBubble.charges <= 0) {
            this.isMending = false;
        };
    };

    onProtectEnter = () => {
        this.isProtecting = true;
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Protecting', 750, 'effect');
        this.protectBubble = new Bubble(this.scene, this.x, this.y, 'gold', PLAYER.DURATIONS.PROTECT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.isProtecting = false;    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} protects themself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt) => {
        if (this.isProtecting) {
            this.protectBubble.update(this.x, this.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onProtectExit = () => {
        if (this.protectBubble) {
            this.protectBubble.destroy();
            this.protectBubble = undefined;
        };
    };

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
    onRenewalUpdate = (_dt) => {if (this.isRenewing) this.metaMachine.setState(States.CLEAN);};
    onRenewalExit = () => {};

    onScreamEnter = () => {
        if (!this.inCombat) return;
        this.aoe = new AoE(this.scene, 'scream', 1, true, this);  
        this.scene.sound.play('scream', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Screaming', 750, 'hush');
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} screams, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt) => {if (!this.isScreaming) this.metaMachine.setState(States.CLEAN);};
    onScreamExit = () => {};

    onShieldEnter = () => {
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.isShielding = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shielding', 750, 'bone');
        this.shieldBubble = new Bubble(this.scene, this.x, this.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.isShielding = false;    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} shields themself from oncoming attacks.`
        });
    };
    onShieldUpdate = (_dt) => {
        if (this.isShielding) {
            this.shieldBubble.update(this.x, this.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onShieldExit = () => {
        if (this.shieldBubble) {
            this.shieldBubble.destroy();
            this.shieldBubble = undefined;
        };
    };

    shieldHit = () => {
        if (this.shieldBubble === undefined || this.isShielding === false) {
            if (this.shieldBubble) {
                this.shieldBubble.destroy();
                this.shieldBubble = undefined;
            };
            this.isShielding = false;
            return;
        };
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shield Hit', 500, 'effect');
        this.shieldBubble.setCharges(this.shieldBubble.charges - 1);
        if (this.shieldBubble.charges <= 0) {
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
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} shimmers, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt) => {if (!this.isShimmering) this.metaMachine.setState(States.CLEAN);};
    onShimmerExit = () => this.stealthEffect(false);

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
        });
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} taps into their caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt) => {if (!this.isSprinting) this.metaMachine.setState(States.CLEAN);};
    onSprintExit = () => {
        if (this.isGlowing === true) this.checkCaerenic(false); // 
        this.adjustSpeed(-PLAYER.SPEED.SPRINT);
    };

    onWardEnter = () => {
        this.isWarding = true;
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warding', 750, 'damage');
        this.wardBubble = new Bubble(this.scene, this.x, this.y, 'red', PLAYER.DURATIONS.WARD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.isWarding = false;    
        }, undefined, this);
        EventBus.emit('enemy-combat-text', {
            computerSpecialDescription: `${this.ascean.name} wards themself from oncoming attacks.`
        });
    };
    onWardUpdate = (_dt) => {
        if (this.isWarding) {
            this.wardBubble.update(this.x, this.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onWardExit = () => {
        if (this.wardBubble) {
            this.wardBubble.destroy();
            this.wardBubble = undefined;
        };
    };

    wardHit = () => {
        if (this.wardBubble === undefined || this.isWarding === false) {
            if (this.wardBubble) {
                this.wardBubble.destroy();
                this.wardBubble = undefined;
            };
            this.isWarding = false;
            return;
        };
        this.scene.sound.play('parry', { volume: this.scene.settings.volume });
        if (this.checkPlayerResist() === true) {
            this.scene.stunned(this.scene.player.ascean._id);
        };
        this.wardBubble.setCharges(this.wardBubble.charges - 1);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warded', 500, 'effect');
        if (this.wardBubble.charges <= 3) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Ward Broken', 500, 'damage');
            this.wardBubble.setCharges(0);
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
    onWritheUpdate = (_dt) => {if (!this.isWrithing) this.metaMachine.setState(States.CLEAN);};
    onWritheExit = () => {};

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
            this.setTint(0xFF0000);
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
        this.anims.play('player_running', true);
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
    onCounterSpelledend = () => {
        this.setTint(0xFF0000);
    };

    onFearEnter = () => { 
        this.isFeared = true;
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
                } else {   
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, fears[Math.floor(Math.random() * 5)], 1000, 'effect');
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
        if (this.isGlowing === true) this.checkCaerenic(false);
    };

    onFrozenEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Frozen', DURATION.TEXT, 'cast', false, true);
        if (!this.isPolymorphed) this.clearAnimations();
        this.anims.play('player_idle', true);
        this.setTint(0x0000FF); // 0x888888
        this.setStatic(true);
        this.scene.time.addEvent({
            delay: DURATION.FROZEN,
            callback: () => {
                this.isFrozen = false;
                this.negMetaMachine.setState(States.CLEAN);
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
        this.setTint(0xFF0000);
        this.setStatic(false);
    };

    onHurtEnter = () => {
        this.clearAnimations();
        this.clearTint();
        this.isHurt = true;
        this.scene.time.delayedCall(250, () => {
            this.isHurt = false;
        }, undefined, this);
    };
    onHurtUpdate = (_dt) => {
        this.anims.play('player_hurt', true);
        if (!this.isHurt) {
            if (this.inCombat === true) {
                this.stateMachine.setState(States.COMBAT);
            } else {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onHurtExit = () => {
        this.isHurt = false;
        this.setTint(0xFF0000);
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
            this.isParalyzed = false;
        }, undefined, this);
    };
    onParalyzedUpdate = (dt) => {
        this.setVelocity(0);
        if (this.isParalyzed === false) this.evaluateCombatDistance(); // Wasn't if (!this.isStunned)
    };
    onParalyzedExit = () => {
        this.setTint(0xFF0000)
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
                            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: this.health, id: this.enemyID } });
                        };
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
        this.setTint(0xFF0000);
        this.spriteWeapon.setVisible(true);ScrollingCombatText
        if (this.polymorphTimer) {
            this.polymorphTimer.destroy();
            this.polymorphTimer = undefined;
        };
    };

    onStunEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', 2500, 'effect', false, true);
        this.stunDuration = DURATION.STUNNED;
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
    onStunUpdate = (_dt) => {
        this.setVelocity(0);
        if (!this.isStunned) this.evaluateCombatDistance(); // Wasn't if (!this.isStunned)
    };
    onStunExit = () => { 
        this.setTint(0xFF0000)
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
            this.isRooted = false;
            this.negMetaMachine.setState(States.CLEAN);
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
        this.setTint(0xFF0000);
        this.setStatic(false);
        this.evaluateCombatDistance();
    };

    onSlowEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slowed', DURATION.TEXT, 'effect', false, true);
        // this.slowDuration = DURATION.SLOWED;
        this.setTint(0xFFC700); // 0x888888
        this.adjustSpeed(-PLAYER.SPEED.SLOW);
        this.scene.time.delayedCall(this.slowDuration, () =>{
            this.isSlowed = false;
            this.negMetaMachine.setState(States.CLEAN);
        }, undefined, this);
    };

    onSlowExit = () => {
        this.clearTint();
        this.setTint(0xFF0000);
        this.adjustSpeed(PLAYER.SPEED.SLOW);
    };

    onSnareEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snared', DURATION.TEXT, 'effect', false, true);
        this.snareDuration = DURATION.SNARED;
        this.setTint(0x0000FF); // 0x888888
        this.adjustSpeed(-PLAYER.SPEED.SNARE);
        this.scene.time.delayedCall(this.snareDuration, () =>{
            this.isSnared = false;
            this.negMetaMachine.setState(States.CLEAN);
        }, undefined, this);
    };
    // onSnareUpdate = (dt) => {};
    onSnareExit = () => { 
        this.clearTint();
        this.setTint(0xFF0000);
        this.adjustSpeed(PLAYER.SPEED.SNARE);
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
                this.scene.player.wardHit(this.enemyID);
            };
            if (this.particleEffect) {
                this.scene.particleManager.removeEffect(this.particleEffect.id);
                this.particleEffect.effect.destroy();
                this.particleEffect = undefined;
            };
            return;
        };
        if (this.scene.player.isMalicing) this.scene.player.maliceHit();
        if (this.scene.player.isMending) this.scene.player.mendHit();
        if (this.scene.player.isRecovering) this.scene.player.recoverHit();
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
            this.scene.useStamina(5);
            if (this.isCurrentTarget) {
                if (this.scene.state.computerAction === '') return;
                this.scene.combatMachine.action({ type: 'Weapon', data: { key: 'computerAction', value: this.scene.state.computerAction, id: this.enemyID } });
            } else {
                this.scene.combatMachine.action({ type: 'Enemy', data: { enemyID: this.enemyID, ascean: this.ascean, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.currentAction, parry: this.parryAction, id: this.enemyID }}});
            };
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
        if (this.isPerformingSpecial) return;
        if (this.attacking === undefined || this.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.stateMachine.setState(States.LEASH);
            return;
        };  
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
        if (!this.particleEffect.triggered) this.scene.particleManager.update(this.particleEffect);
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
        if (this.inCombat === false) return;
        if (this.isConfused && !this.stateMachine.isCurrentState(States.CONFUSED)) {
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
        if (this.isFeared && !this.stateMachine.isCurrentState(States.FEARED)) {
            this.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isParalyzed && !this.stateMachine.isCurrentState(States.PARALYZED)) {
            this.stateMachine.setState(States.PARALYZED);
            return;
        };
        if (this.isPolymorphed && !this.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if ((this.isBlindsided || this.isStunned) && !this.stateMachine.isCurrentState(States.STUNNED)) {
            this.stateMachine.setState(States.STUNNED);
            this.isBlindsided = false;
            return;
        };
        if (this.isFrozen && !this.negMetaMachine.isCurrentState(States.FROZEN) && !this.currentNegativeState(States.FROZEN)) {
            this.negMetaMachine.setState(States.FROZEN);
            return;
        };
        if (this.isRooted && !this.negMetaMachine.isCurrentState(States.ROOTED) && !this.currentNegativeState(States.ROOTED)) {
            this.negMetaMachine.setState(States.ROOTED);
            return;
        };
        if (this.isSlowed && !this.negMetaMachine.isCurrentState(States.SLOWED) && !this.currentNegativeState(States.SLOWED)) {
            this.negMetaMachine.setState(States.SLOWED);
            return;
        };
        if (this.isSnared && !this.negMetaMachine.isCurrentState(States.SNARED) && !this.currentNegativeState(States.SNARED)) {
            this.negMetaMachine.setState(States.SNARED); 
            return;    
        };
        if (this.actionSuccess === true) {
            this.actionSuccess = false;
            this.enemyActionSuccess();
        };
        if (this.particleEffect) this.currentParticleCheck();
        if (this.isSuffering() === true || this.isPerformingSpecial === true) return;
        if (this.attacking) {
            if (this.isUnderRangedAttack()) {
                this.stateMachine.setState(States.EVADE);
                return;
            };
            this.getDirection();
            this.currentTargetCheck();
        } else if (!this.stateMachine.isCurrentState(States.PATROL)) {
            this.setFlipX(this.velocity.x < 0);
        };

        switch (this.currentAction) {
            case 'special':
                break;
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
        this.negMetaMachine.update(this.scene.sys.game.loop.delta);
    };

    combat = (target) => { 
        if (this.inCombat === false) return;
        const action = this.evaluateCombat(target);
        this.currentAction = action;
    };

    evaluateCombat = (target) => {  
        let computerAction;
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
            armorRating: (this.combatStats.defense.physicalPosture + this.combatStats.defense.magicalPosture)  /  4,
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
        return computerAction;
    };
};
