import Entity, { calculateThreat, ENEMY, FRAME_COUNT, Player_Scene } from "./Entity"; 
import StateMachine, { States } from "../phaser/StateMachine";
import HealthBar from "../phaser/HealthBar";
import { EventBus } from "../EventBus";
import { v4 as uuidv4 } from 'uuid';
import { PLAYER, ENEMY_ENEMIES } from "../../utility/player";
import CastingBar from "../phaser/CastingBar";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";
import { BROADCAST_DEATH, COMPUTER_BROADCAST, DISTANCE, DURATION, ENEMY_SPECIAL, GRIP_SCALE, INSTINCTS, NEW_COMPUTER_ENEMY_HEALTH, RANGE, UPDATE_COMPUTER_COMBAT, UPDATE_COMPUTER_DAMAGE } from "../../utility/enemy";
import { screenShake, vibrate } from "../phaser/ScreenShake";
import { roundToTwoDecimals } from "../../utility/combat";
import { Underground } from "../scenes/Underground";
import { Combat } from "../../stores/combat";
import Player from "./Player";
import Equipment, { randomFloatFromInterval } from "../../models/equipment";
import { Particle } from "../matter/ParticleManager";
import { Compiler } from "../../utility/ascean";
import { Arena } from "../scenes/Arena";
import Beam from "../matter/Beam";
import { Play } from "../main";
import { ComputerCombat, initComputerCombat } from "../../stores/computer";
import { ArenaView } from "../scenes/ArenaCvC";
import StatusEffect from "../../utility/prayer";
import Party from "./PartyComputer";
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
const COMPUTER_ACTION = 'computerAction';
const ENEMY_COLOR = 0xFF0000;
const TARGET_COLOR = 0xFFFF00;
const MAX_HEARING_DISTANCE = 500;
const MIN_HEARING_DISTANCE = 100;
const PHYSICAL_ACTIONS = {
    ATTACK: 'attack',
    PARRY: 'parry',
    POSTURE: 'posture',
    ROLL: 'roll',
    THRUST: 'thrust',
};
export default class Enemy extends Entity {
    enemyID: string;
    stateMachine: StateMachine;
    positiveMachine: StateMachine;
    negativeMachine: StateMachine;
    enemySensor: any = undefined;
    waiting: number = 30;
    idleWait: number = 3000;
    patrolReverse: any = undefined;
    patrolWait: number = 500;
    patrolVelocity: number = 1;
    polymorphVelocity: { x: number; y: number; } = { x: 0, y: 0 };
    attackSensor: any = undefined;
    attackTimer: any = undefined;
    combatThreshold: number = 0;
    attackIsLive: boolean = false;
    isEnemy: boolean = true;
    isAggressive: boolean; 
    startedAggressive: boolean;
    computerAggressive: boolean;
    isSpecial: boolean;
    slowDuration: number = DURATION.SLOWED;
    isTriumphant: boolean = false;
    isLuckout: boolean = false;
    isPersuaded: boolean = false;
    playerTrait: string = '';
    currentWeapon: any = undefined;
    isCurrentTarget: boolean = false;
    parryAction: string = '';
    sensorDisp: number = 12;
    colliderDisp: number = 16;
    fearCount: number = 0;
    weapons: any[] = [];
    heldSpeed: number;
    isCounterSpelled: boolean = false;
    castingSuccess: boolean = false;
    patrolPath: any;
    nextPatrolPoint: any;
    patrolDelay: number;
    wasFlipped: boolean = false;
    channelCount: number = 0;
    isSwinging: boolean = false;
    isDiseasing: boolean = false;
    reactiveName: string = '';
    isHowling: boolean = false;
    isRenewing: boolean = false;
    negationName: string = '';
    isScreaming: boolean = false;
    confuseDirection: string;
    confuseMovement: string;
    confuseVelocity: { x: number; y: number; } = { x: 0, y: 0 };
    consumedDuration: number;
    fearDirection: string;
    fearMovement: string;
    fearVelocity: { x: number; y: number; } = { x: 0, y: 0 };
    hurtTime: number = 0;
    paralyzeDuration: number;
    snareDuration: number;
    computerCombatSheet: ComputerCombat = initComputerCombat;
    inComputerCombat: boolean = false;
    enemies: ENEMY[] | any[] = [];
    potentialEnemies: string[] = [];
    targetID: string = '';
    defeatedTime: number = 120000;
    killingBlow: string = '';
    hookTime: number = 0;
    spellName: string = '';
    specialPolymorph: boolean = false;
    specialConfuse: boolean = false;
    confuseCount: number = 0;
    specialFear: boolean = false;

    constructor(data: { scene: Play, x: number, y: number, texture: string, frame: string, data: Compiler | undefined }) {
        super({ ...data, name: "enemy", ascean: undefined, health: 1 }); 
        this.scene.add.existing(this);
        this.enemyID = uuidv4();
        if (data === undefined || data.data === undefined) {
            this.createEnemy();
        } else {
            this.ascean = data.data.ascean;
            this.health = data.data.attributes?.healthTotal;
            this.combatStats = data.data;
            this.weapons = [data.data.combatWeaponOne, data.data.combatWeaponTwo, data.data.combatWeaponThree];
            this.speed = this.startingSpeed(data.data.ascean);
            this.heldSpeed = this.speed;
            this.createWeapon(data.data.ascean.weaponOne); 
            this.createShield(data.data.ascean.shield);
            this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health);
            this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
            this.computerCombatSheet = this.createComputerCombatSheet(data.data);
            this.potentialEnemies = ENEMY_ENEMIES[this.ascean.name as keyof typeof ENEMY_ENEMIES];
        };
        this.setTint(ENEMY_COLOR);
        this.stateMachine = new StateMachine(this, 'enemy');
        this.stateMachine
            .addState(States.IDLE, { onEnter: this.onIdleEnter, onUpdate: this.onIdleUpdate, onExit: this.onIdleExit })
            .addState(States.PATROL, { onEnter: this.onPatrolEnter, onUpdate: this.onPatrolUpdate, onExit: this.onPatrolExit })
            .addState(States.AWARE, { onEnter: this.onAwarenessEnter, onUpdate: this.onAwarenessUpdate, onExit: this.onAwarenessExit })
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.COMBAT, { onEnter: this.onCombatEnter, onUpdate: this.onCombatUpdate, onExit: this.onCombatExit })
            .addState(States.CONTEMPLATE, { onEnter: this.onContemplateEnter, onUpdate: this.onContemplateUpdate, onExit: this.onContemplateExit })
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
            .addState(States.STUNNED, { onEnter: this.onStunnedEnter, onUpdate: this.onStunnedUpdate, onExit: this.onStunnedExit })
            .addState(States.CONSUMED, { onEnter: this.onConsumedEnter, onUpdate: this.onConsumedUpdate, onExit: this.onConsumedExit })
            .addState(States.HURT, { onEnter: this.onHurtEnter, onUpdate: this.onHurtUpdate, onExit: this.onHurtExit })
            .addState(States.DEATH, { onEnter: this.onDeathEnter, onUpdate: this.onDeathUpdate })
            .addState(States.DEFEATED, { onEnter: this.onDefeatedEnter, onUpdate: this.onDefeatedUpdate, onExit: this.onDefeatedExit }) // ====== Special States ======
            .addState(States.ACHIRE, { onEnter: this.onAchireEnter, onUpdate: this.onAchireUpdate, onExit: this.onAchireExit })
            .addState(States.ASTRAVE, { onEnter: this.onAstraveEnter, onUpdate: this.onAstraveUpdate, onExit: this.onAstraveExit })
            .addState(States.BLINK, { onEnter: this.onBlinkEnter, onUpdate: this.onBlinkUpdate, onExit: this.onBlinkExit })
            .addState(States.CHIOMISM, { onEnter: this.onChiomismEnter, onUpdate: this.onChiomismUpdate, onExit: this.onChiomismExit })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onExit: this.onDesperationExit })
            .addState(States.FEAR, { onEnter: this.onFearingEnter, onUpdate: this.onFearingUpdate, onExit: this.onFearingExit })
            .addState(States.FROST, { onEnter: this.onFrostEnter, onUpdate: this.onFrostUpdate, onExit: this.onFrostExit })
            .addState(States.HEALING, { onEnter: this.onHealingEnter, onUpdate: this.onHealingUpdate, onExit: this.onHealingExit })
            .addState(States.HOOK, { onEnter: this.onHookEnter, onUpdate: this.onHookUpdate, onExit: this.onHookExit })
            .addState(States.ILIRECH, { onEnter: this.onIlirechEnter, onUpdate: this.onIlirechUpdate, onExit: this.onIlirechExit })
            .addState(States.KYRISIAN, { onEnter: this.onKyrisianEnter, onUpdate: this.onKyrisianUpdate, onExit: this.onKyrisianExit })
            .addState(States.KYRNAICISM, { onEnter: this.onKyrnaicismEnter, onUpdate: this.onKyrnaicismUpdate, onExit: this.onKyrnaicismExit })
            .addState(States.LEAP, { onEnter: this.onLeapEnter, onUpdate: this.onLeapUpdate, onExit: this.onLeapExit })
            .addState(States.LIKYR, { onEnter: this.onLikyrEnter, onUpdate: this.onLikyrUpdate, onExit: this.onLikyrExit })
            .addState(States.MAIERETH, { onEnter: this.onMaierethEnter, onUpdate: this.onMaierethUpdate, onExit: this.onMaierethExit })
            .addState(States.PARALYZE, { onEnter: this.onParalyzeEnter, onUpdate: this.onParalyzeUpdate, onExit: this.onParalyzeExit })
            .addState(States.POLYMORPH, { onEnter: this.onPolymorphingEnter, onUpdate: this.onPolymorphingUpdate, onExit: this.onPolymorphingExit })
            .addState(States.PURSUIT, { onEnter: this.onPursuitEnter, onUpdate: this.onPursuitUpdate, onExit: this.onPursuitExit })
            .addState(States.QUOR, { onEnter: this.onQuorEnter, onUpdate: this.onQuorUpdate, onExit: this.onQuorExit })
            .addState(States.RECONSTITUTE, { onEnter: this.onReconstituteEnter, onUpdate: this.onReconstituteUpdate, onExit: this.onReconstituteExit })
            .addState(States.RUSH, { onEnter: this.onRushEnter, onUpdate: this.onRushUpdate, onExit: this.onRushExit })
            .addState(States.SACRIFICE, { onEnter: this.onSacrificeEnter, onUpdate: this.onSacrificeUpdate, onExit: this.onSacrificeExit })
            .addState(States.SLOWING, { onEnter: this.onSlowingEnter, onUpdate: this.onSlowingUpdate, onExit: this.onSlowingExit })
            .addState(States.SNARE, { onEnter: this.onSnaringEnter, onUpdate: this.onSnaringUpdate, onExit: this.onSnaringExit })
            .addState(States.SUTURE, { onEnter: this.onSutureEnter, onUpdate: this.onSutureUpdate, onExit: this.onSutureExit })
            .addState(States.TSHAERAL, { onEnter: this.onDevourEnter, onUpdate: this.onDevourUpdate, onExit: this.onDevourExit });
        this.stateMachine.setState(States.IDLE);
        // ========== POSITIVE META STATES ========== \\
        this.positiveMachine = new StateMachine(this, 'enemy');
        this.positiveMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.ABSORB, { onEnter: this.onAbsorbEnter, onUpdate: this.onAbsorbUpdate })
            .addState(States.CHIOMIC, { onEnter: this.onChiomicEnter, onUpdate: this.onChiomicUpdate })
            .addState(States.DISEASE, { onEnter: this.onDiseaseEnter, onUpdate: this.onDiseaseUpdate })
            .addState(States.DISPEL, { onEnter: this.onDispelEnter, onExit: this.onDispelExit })
            .addState(States.ENVELOP, { onEnter: this.onEnvelopEnter, onUpdate: this.onEnvelopUpdate })
            .addState(States.FREEZE, { onEnter: this.onFreezeEnter, onUpdate: this.onFreezeUpdate })
            .addState(States.HOWL, { onEnter: this.onHowlEnter, onUpdate: this.onHowlUpdate })
            .addState(States.MALICE, { onEnter: this.onMaliceEnter, onUpdate: this.onMaliceUpdate })
            .addState(States.MENACE, { onEnter: this.onMenaceEnter, onUpdate: this.onMenaceUpdate })
            .addState(States.MEND, { onEnter: this.onMendEnter, onUpdate: this.onMendUpdate })
            .addState(States.MODERATE, { onEnter: this.onModerateEnter, onUpdate: this.onModerateUpdate })
            .addState(States.MULTIFARIOUS, { onEnter: this.onMultifariousEnter, onUpdate: this.onMultifariousUpdate })
            .addState(States.MYSTIFY, { onEnter: this.onMystifyEnter, onUpdate: this.onMystifyUpdate })
            .addState(States.PROTECT, { onEnter: this.onProtectEnter, onUpdate: this.onProtectUpdate })
            .addState(States.RENEWAL, { onEnter: this.onRenewalEnter, onUpdate: this.onRenewalUpdate })
            .addState(States.SCREAM, { onEnter: this.onScreamEnter, onUpdate: this.onScreamUpdate })
            .addState(States.SHIELD, { onEnter: this.onShieldEnter, onUpdate: this.onShieldUpdate })
            .addState(States.SHIMMER, { onEnter: this.onShimmerEnter, onUpdate: this.onShimmerUpdate })
            .addState(States.SPRINTING, { onEnter: this.onSprintEnter, onUpdate: this.onSprintUpdate })
            .addState(States.SHADOW, { onEnter: this.onShadowEnter, onExit: this.onShadowExit })
            .addState(States.SHIRK, { onEnter: this.onShirkEnter, onExit: this.onShirkExit })
            .addState(States.TETHER, { onEnter: this.onTetherEnter, onExit: this.onTetherExit })
            .addState(States.WARD, { onEnter: this.onWardEnter, onUpdate: this.onWardUpdate })
            .addState(States.WRITHE, { onEnter: this.onWritheEnter, onUpdate: this.onWritheUpdate }); 
        // ========== NEGATIVE META STATES ========== \\
        this.negativeMachine = new StateMachine(this, 'enemy');
        this.negativeMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.FROZEN, { onEnter: this.onFrozenEnter, onUpdate: this.onFrozenUpdate, onExit: this.onFrozenExit })
            .addState(States.ROOTED, { onEnter: this.onRootedEnter, onUpdate: this.onRootedUpdate, onExit: this.onRootedExit })
            .addState(States.SLOWED, { onEnter: this.onSlowedEnter, onExit: this.onSlowedExit })
            .addState(States.SNARED, { onEnter: this.onSnaredEnter, onExit: this.onSnaredExit });

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
        this.computerAggressive = this.scene.hud.settings.difficulty.computer;
        this.isSpecial = this.setSpecial();
        this.slowDuration = DURATION.SLOWED;
        this.isDefeated = false;
        this.isLuckout = false;
        this.isPersuaded = false;
        this.playerTrait = '';
        this.currentWeapon = undefined;
        this.isCurrentTarget = false;
        this.parryAction = '';
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {};
        this.isDeleting = false;
        this.sensorDisp = 12;
        this.colliderDisp = 16; 
        this.beam = new Beam(this);

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
            density: 0.0015,
            frictionAir: 0.1, 
            restitution: 0.3,
            friction: 0.15,
        });
        this.setExistingBody(compoundBody);                                    
        this.setFixedRotation();
        this.enemyStateListener();
        this.enemySensor = enemySensor;
        this.collision(enemySensor);
        
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                if ((!this.scene.hud.settings.difficulty.enemyCombatInteract && this.scene.combat) || this.isDeleting) return; //  && !this.inCombat
                // this.scene.hud.logger.log(`Console: ${this.ascean.name}'s current State: ${this.stateMachine.getCurrentState()?.charAt(0).toUpperCase()}${this.stateMachine.getCurrentState()?.slice(1)}`);
                if (this.currentTarget) {
                    this.scene.hud.logger.log(`Console: ${this.ascean.name} is currently attacking ${this.currentTarget.ascean.name}`);
                };
                this.ping();
                vibrate();
                this.clearTint();
                this.setTint(TARGET_COLOR);
                if (this.enemyID !== this.scene.state.enemyID) this.scene.hud.setupEnemy(this);
                if (this.scene.player) {
                    const newEnemy = this.isNewEnemy(this.scene.player);
                    if (newEnemy) this.scene.player.addEnemy(this);
                    this.scene.player.setCurrentTarget(this);
                    this.scene.player.targetIndex = this.scene.player.targets.findIndex((obj: Enemy) => obj?.enemyID === this.enemyID);
                    this.scene.player.animateTarget();
                } else {
                    (this.scene as ArenaView).setNewTarget(this);
                };
            })
            .on('pointerout', () => {
                this.clearTint();
                this.setTint(ENEMY_COLOR);
            });
        this.scene.time.delayedCall(1000, () => {
            this.setVisible(true);
            this.spriteWeapon.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y);
        });
    };

    cleanUp() {
        EventBus.off('update-combat', this.playerCombatUpdate); 
        EventBus.off(COMPUTER_BROADCAST, this.computerBroadcast);
        EventBus.off(UPDATE_COMPUTER_COMBAT, this.computerCombatUpdate);
        EventBus.off(UPDATE_COMPUTER_DAMAGE, this.computerDamage);
        EventBus.off('personal-update', this.personalUpdate);    
        EventBus.off('enemy-persuasion', this.persuasionUpdate);
        EventBus.off('enemy-luckout', this.luckoutUpdate);
        EventBus.off('update-enemy-health', this.healthUpdate);
        if (this.isGlowing) this.checkCaerenic(false);
        if (this.isShimmering) {
            this.isShimmering = false;
            this.stealthEffect(false);
        };
        this.setActive(false);
        this.clearBubbles();
        this.scrollingCombatText = undefined;
        this.specialCombatText = undefined;
        this.castbar.cleanUp();
        this.healthbar.cleanUp();
        this.spriteWeapon.destroy();
        this.spriteShield.destroy();
    };

    enemyStateListener() {
        EventBus.on('update-combat', this.playerCombatUpdate);
        EventBus.on(COMPUTER_BROADCAST, this.computerBroadcast);
        EventBus.on(UPDATE_COMPUTER_COMBAT, this.computerCombatUpdate);
        EventBus.on(UPDATE_COMPUTER_DAMAGE, this.computerDamage);
        EventBus.on('personal-update', this.personalUpdate);
        EventBus.on('enemy-persuasion', this.persuasionUpdate);
        EventBus.on('enemy-luckout', this.luckoutUpdate);
        EventBus.on('update-enemy-health', this.healthUpdate);
    };

    ping = () => {
        if (this.ascean?.level > (this.scene.state.player?.level as number || 0)) {
            this.scene.sound.play('righteous', { volume: this.scene.hud.settings.volume });
        } else if (this.ascean?.level === this.scene.state.player?.level) {
            this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });                    
        } else {
            this.scene.sound.play('consume', { volume: this.scene.hud.settings.volume });
        };
    };

    enemySound = (key: string, active: boolean) => {
        if (!active || !this.scene.player) return;
        const distance = Phaser.Math.Distance.Between(this.scene.player.x,this.scene.player.y,this.x,this.y);
        if (distance <= MIN_HEARING_DISTANCE) {
            this.scene.sound.play(key, { volume: this.scene.hud.settings.volume });
        } else if (distance <= MAX_HEARING_DISTANCE) {
            const normalizedDistance = Phaser.Math.Clamp(distance / MAX_HEARING_DISTANCE, 0, 1);
            const volume = this.scene.hud.settings.volume * (1 - (normalizedDistance ** 2));
            this.scene.sound.play(key, { volume });
        };
    };

    personalUpdate = (e: { action: string; payload: any; }) => {
        switch (e.action) {
            case 'health':
                this.health = e.payload;
                this.updateHealthBar(this.health);
                break;
            default:
                break;
        };
    };

    healthUpdate = (e: any) => {
        if (this.enemyID !== e.id) return;
        const { health } = e;
        if (this.health > health) {
            let damage: number | string = Math.round(this.health - health);
            // damage = e?.glancing === true ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = this.scene.showCombatText(`${damage}`, 1500, 'bone', e?.critical, false, () => this.scrollingCombatText = undefined);
            if (this.isMalicing) this.malice(this.scene.player.playerID);
            if (this.isMending) this.mend(this.scene.player.playerID);
            if (!this.inCombat && health > 0) this.jumpIntoCombat();
            if (!this.isSuffering() && !this.isTrying() && !this.isCasting && !this.isContemplating) this.isHurt = true;
            const id = this.enemies.find((en: ENEMY) => en.id === this.scene.player.playerID);
            if (id && health > 0) this.updateThreat(this.scene.player.playerID, calculateThreat(Math.round(this.health - health), health, this.ascean.health.max));
        } else if (this.health < health) {
            this.scrollingCombatText = this.scene.showCombatText(`${Math.round(health - this.health)}`, 1500, 'heal', false, false, () => this.scrollingCombatText = undefined);
        };
        this.health = health;
        this.computerCombatSheet.newComputerHealth = this.health;
        this.updateHealthBar(health);
    };

    checkCaerenic = (caerenic: boolean) => {
        this.isGlowing = caerenic;
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, 'weapon');
        this.setGlow(this.spriteShield, caerenic, 'shield');
    };

    flickerCarenic = (duration: number) => {
        if (this.isGlowing === false) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(duration, () => {
                this.checkCaerenic(false);
            }, undefined, this);
        };
    };

    clearBubbles = () => {
        this.isMalicing = false;
        this.isMending = false;
        this.isMenacing = false;
        this.isMultifaring = false;
        this.isMystifying = false;
        this.isProtecting = false;
        this.isShielding = false;
        this.isWarding = false;
        this.clearShields();
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

    createComputerCombatSheet = (e: Compiler): ComputerCombat => {
        const newSheet: ComputerCombat = {
            ...this.computerCombatSheet,
            computer: e.ascean,
            computerHealth: e.ascean.health.max,
            newComputerHealth: e.ascean.health.max,
            computerWeapons: [e.combatWeaponOne, e.combatWeaponTwo, e.combatWeaponThree],
            computerWeaponOne: e.combatWeaponOne,
            computerWeaponTwo: e.combatWeaponTwo,
            computerWeaponThree: e.combatWeaponThree,
            computerAttributes: e.attributes,
            computerDefense: e.defense,
            computerDamageType: e.combatWeaponOne.damageType?.[0] as string,
            personalID: this.enemyID,
        };
        return newSheet;
    };
    /*
        EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: total });
    */
    computerBroadcast = (e: { id: string; key: string; value: number; }) => {
        if (this.computerCombatSheet.enemyID !== e.id) return;
        (this.computerCombatSheet as any)[e.key] = e.value;
    };

    computerDamage = (e: { damage: number; id: string; origin: string; }) => {
        if (e.id !== this.enemyID) return;
        const { damage, origin } = e;
        this.health = Math.max(this.health - damage, 0);
        this.updateHealthBar(this.health);
            this.scrollingCombatText = this.scene.showCombatText(`${Math.round(damage)}`, 1500, 'bone', false, false, () => this.scrollingCombatText = undefined);
        if (!this.isSuffering() && !this.isTrying() && !this.isCasting && !this.isContemplating) this.isHurt = true;
        if (this.isFeared) {
            const strength = this.specialFear ? 0.05 : 0.1;
            const chance = Math.random() < strength + this.fearCount;
            if (chance) {
                this.specialCombatText = this.scene.showCombatText('Fear Broken', PLAYER.DURATIONS.TEXT, 'effect', false, false, () => this.specialCombatText = undefined);
                this.isFeared = false;
            } else {
                this.fearCount += strength;
            };
        };
        if (this.isConfused) {
            if (!this.specialConfuse) {
                this.isConfused = false;
            } else {
                const chance = Math.random() < 0.1 + this.confuseCount;
                if (chance) {
                    this.specialCombatText = this.scene.showCombatText('Confuse Broken', PLAYER.DURATIONS.TEXT, 'effect', false, false, () => this.specialCombatText = undefined);
                    this.isConfused = false;
                } else {
                    this.confuseCount += 0.1;
                };
            };
        };
        if (this.isPolymorphed) this.isPolymorphed = false;
        if (this.isMalicing) this.malice(origin);
        if (this.isMending) this.mend(origin);
        if ((!this.inComputerCombat || !this.currentTarget) && this.health > 0) {
            const enemy = this.scene.enemies.find((en: Enemy) => en.enemyID === origin && origin !== this.enemyID) || this.scene.party.find((p: Party) => p.enemyID === origin);
            if (enemy && enemy.health > 0) this.checkComputerEnemyCombatEnter(enemy);
        };
        this.computerCombatSheet.newComputerHealth = this.health;
        const enemy = this.enemies.find((en: ENEMY) => en.id === origin && origin !== this.enemyID);
        if (enemy && this.health > 0) {
            this.updateThreat(origin, calculateThreat(damage, this.health, this.ascean.health.max));
        } else if (!enemy && this.health > 0 && origin !== '') {
            this.enemies.push({id:origin,threat:0});
            this.updateThreat(origin, calculateThreat(damage, this.health, this.ascean.health.max))
        };
        if (this.health <= 0) this.killingBlow = origin;
        EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.health });
    };

    updateThreat(id: string, threat: number) {
        const enemyToUpdate = this.enemies.find(enemy => enemy.id === id);
        if (enemyToUpdate) {
            enemyToUpdate.threat += threat;
        };
        if (this.enemies.length <= 1 || this.health <= 0) return;
        this.enemies.sort((a, b) => b.threat - a.threat);
        const topEnemy: string = this.enemies[0].id;
        const updateTarget = (id: string) => {
            const enemy = this.scene.getEnemy(id);
            if (enemy && enemy.health > 0) this.updateEnemyTarget(enemy);
            const party = this.scene.party.find((e: Party) => e.enemyID === id);
            if (party && party.health > 0) this.updateEnemyTarget(party);
        };
    
        if (this.scene.player.playerID === topEnemy && this.currentTarget?.name !== 'player') {
            this.updatePlayerTarget(this.scene.player);
        } else if (this.currentTarget?.name !== 'player' && this.currentTarget?.enemyID !== topEnemy) {
            updateTarget(topEnemy);
        } else if (this.currentTarget?.name === 'player' && this.currentTarget?.playerID !== topEnemy) {
            updateTarget(topEnemy);
        } else if (!this.currentTarget) {
            updateTarget(topEnemy);
        };
    };

    updatePlayerTarget(target: Player) {
        this.currentTarget = target;
        this.inCombat = true;
        if (this.healthbar.visible === false) this.healthbar.setVisible(true);
        this.stateMachine.setState(States.CHASE);
        this.specialCombatText = this.scene.showCombatText('Player Engaged!', 1000, 'effect', false, true, () => this.specialCombatText = undefined);
        this.ping();
    };

    updateEnemyTarget(target: Enemy | Party) {
        this.currentTarget = target;
        this.inComputerCombat = true;
        this.computerCombatSheet = {
            ...this.computerCombatSheet,
            computerEnemy: target.ascean,
            // computerEnemyBlessing: target.computerCombatSheet.computerBlessing,
            computerEnemyHealth: target.ascean.health.max,
            newComputerEnemyHealth: target.health,
            computerEnemyWeapons: target.computerCombatSheet.computerWeapons as Equipment[],
            computerEnemyWeaponOne: target.computerCombatSheet.computerWeaponOne,
            computerEnemyWeaponTwo: target.computerCombatSheet.computerWeaponTwo,
            computerEnemyWeaponThree: target.computerCombatSheet.computerWeaponThree,
            computerEnemyAttributes: target.computerCombatSheet.computerAttributes,
            computerEnemyDamageType: target.computerCombatSheet.computerDamageType,
            computerEnemyDefense: target.computerCombatSheet.computerDefense,
            // computerEnemyDefenseDefault: target.computerCombatSheet.computerDefenseDefault,
            // computerEnemyEffects: target.computerCombatSheet.computerEffects,
            enemyID: target.enemyID,
        };
        if (this.healthbar.visible === false) this.healthbar.setVisible(true);
        this.specialCombatText = this.scene.showCombatText(`New Target: ${target.ascean.name}`, 1500, 'effect', false, true, () => this.specialCombatText = undefined);
    };

    computerSoundEffects = (sfx: ComputerCombat) => {
        switch (sfx.computerEnemyDamageType) {
            case 'Spooky':
                return this.enemySound('spooky', true);
            case 'Righteous':
                return this.enemySound('righteous', true);
            case 'Wild':
                return this.enemySound('wild', true);
            case 'Earth':
                return this.enemySound('earth', true);
            case 'Fire':
                return this.enemySound('fire', true);
            case 'Frost':
                return this.enemySound('frost', true);
            case 'Lightning':
                return this.enemySound('lightning', true);
            case 'Sorcery':
                return this.enemySound('sorcery', true);
            case 'Wind':
                return this.enemySound('wind', true);
            case 'Pierce':
                return (sfx.computerEnemyWeapons[0].type === 'Bow' || sfx.computerEnemyWeapons[0].type === 'Greatbow') 
                    ? this.enemySound('bow', true) 
                    : this.enemySound('pierce', true);
            case 'Slash':
                return this.enemySound('slash', true);
            case 'Blunt':
                return this.enemySound('blunt', true);
        };
    };

    computerCombatUpdate = (e: ComputerCombat) => {
        if (this.enemyID !== e.personalID) return;
        const { computerDamageType, enemyID, computerWeapons, computerWin, computerHealth, newComputerHealth } = e;
        if (this.health > newComputerHealth) {
            let damage: number | string = Math.round(this.health - newComputerHealth);
            // damage = e.computerEnemyCriticalSuccess ? `${damage} (Critical)` : e.computerEnemyGlancingBlow ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = this.scene.showCombatText(`${damage}`, 1500, 'bone', e.computerEnemyCriticalSuccess, false, () => this.scrollingCombatText = undefined);
            if (!this.isSuffering() && !this.isTrying() && !this.isCasting && !this.isContemplating) this.isHurt = true;
            if (this.isFeared) {
                const chance = Math.random() < 0.1 + this.fearCount;
                if (chance) {
                    this.specialCombatText = this.scene.showCombatText('Fear Broken', PLAYER.DURATIONS.TEXT, 'effect', false, false, () => this.specialCombatText = undefined);
                    this.isFeared = false;
                } else {
                    this.fearCount += 0.1;
                };
            };
            if (this.isConfused) {
                if (!this.specialConfuse) {
                    this.isConfused = false;
                } else {
                    const chance = Math.random() < 0.1 + this.confuseCount;
                    if (chance) {
                        this.specialCombatText = this.scene.showCombatText('Confuse Broken', PLAYER.DURATIONS.TEXT, 'effect', false, false, () => this.specialCombatText = undefined);
                        this.isConfused = false;
                    } else {
                        this.confuseCount += 0.1;
                    };
                };
            };
            if (this.isPolymorphed) this.isPolymorphed = false;
            if (this.isMalicing) this.malice(enemyID);
            if (this.isMending) this.mend(enemyID);
            if ((!this.inComputerCombat || !this.currentTarget) && newComputerHealth > 0 && enemyID !== this.enemyID) {
                const enemy = this.scene.getEnemy(enemyID) || this.scene.party.find((p: Party) => p.enemyID === enemyID);
                if (enemy && enemy.health > 0) this.checkComputerEnemyCombatEnter(enemy);
            };
            const enemy = this.enemies.find((en: ENEMY) => en.id === enemyID && enemyID !== this.enemyID);
            if (enemy && newComputerHealth > 0) {
                this.updateThreat(enemyID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, computerHealth));
            } else if (!enemy && newComputerHealth > 0 && enemyID !== '' && enemyID !== this.enemyID) {
                this.enemies.push({id:enemyID,threat:0});
                this.updateThreat(enemyID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, computerHealth))
            };
            this.computerSoundEffects(e);
        } else if (this.health < newComputerHealth) { 
            let heal = Math.round(newComputerHealth - this.health);
            this.scrollingCombatText = this.scene.showCombatText(`${heal}`, 1500, 'heal', false, false, () => this.scrollingCombatText = undefined);
        }; 
        this.health = newComputerHealth;
        this.computerCombatSheet.newComputerHealth = this.health;
        if (this.healthbar.getTotal() < computerHealth) this.healthbar.setTotal(computerHealth);
        this.updateHealthBar(newComputerHealth);
        this.weapons = computerWeapons;
        this.setWeapon(computerWeapons[0] as Equipment); 
        this.checkDamage(computerDamageType.toLowerCase()); 
        this.checkMeleeOrRanged(computerWeapons?.[0] as Equipment);
        this.computerCombatSheet.criticalSuccess = false;
        this.computerCombatSheet.glancingBlow = false;
        this.computerCombatSheet.computerWin = computerWin;
        if (e.newComputerEnemyHealth <= 0 && this.computerCombatSheet.computerWin) {
            this.computerCombatSheet.computerWin = false;
            this.clearComputerCombatWin(enemyID);
        };
        if (this.health <= 0) this.killingBlow = enemyID;
        EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.health });
    };
    
    playerCombatUpdate = (e: Combat) => {
        if (this.enemyID !== e.enemyID) {
            if (this.inCombat) this.currentRound = e.combatRound;
            if (this.inCombat && e.newPlayerHealth <= 0 && e.computerWin === true) {
                this.isTriumphant = true;
                this.clearCombatWin();
            };
            return;
        };
        const { criticalSuccess, computerDamageType, computerWeapons, computerWin, computerHealth, newComputerHealth, newPlayerHealth } = e;
        if (this.health > newComputerHealth) {
            let damage: number | string = Math.round(this.health - newComputerHealth);
            // damage = criticalSuccess ? `${damage} (Critical)` : glancingBlow ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = this.scene.showCombatText(`${damage}`, 1500, 'bone', criticalSuccess, false, () => this.scrollingCombatText = undefined);
            if (!this.isSuffering() && !this.isTrying() && !this.isCasting && !this.isContemplating) this.isHurt = true;
            if (this.isFeared) {
                const chance = Math.random() < 0.1 + this.fearCount;
                if (chance) {
                    this.specialCombatText = this.scene.showCombatText('Fear Broken', PLAYER.DURATIONS.TEXT, 'effect', false, false, () => this.specialCombatText = undefined);
                    this.isFeared = false;
                } else {
                    this.fearCount += 0.1;
                };
            };
            if (this.isConfused) {
                if (!this.specialConfuse) {
                    this.isConfused = false;
                } else {
                    const chance = Math.random() < 0.1 + this.confuseCount;
                    if (chance) {
                        this.specialCombatText = this.scene.showCombatText('Confuse Broken', PLAYER.DURATIONS.TEXT, 'effect', false, false, () => this.specialCombatText = undefined);
                        this.isConfused = false;
                    } else {
                        this.confuseCount += 0.1;
                    };
                };
            };
            if (this.isPolymorphed) this.isPolymorphed = false;
            if (this.isMalicing) this.malice(this.scene.player.playerID);
            if (this.isMending) this.mend(this.scene.player.playerID);
            if (!this.inCombat && newComputerHealth > 0 && newPlayerHealth > 0) this.checkEnemyCombatEnter();
            const id = this.enemies.find((en: ENEMY) => en.id === this.scene.player.playerID);
            if (id && newComputerHealth > 0) {
                this.updateThreat(this.scene.player.playerID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, computerHealth));
            } else if (!id && newComputerHealth > 0) {
                this.enemies.push({id:this.scene.player.playerID, threat:0});
                this.updateThreat(this.scene.player.playerID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, computerHealth));
            };
        } else if (this.health < newComputerHealth) { 
            let heal = Math.round(newComputerHealth - this.health);
            this.scrollingCombatText = this.scene.showCombatText(`${heal}`, 1500, 'heal', false, false, () => this.scrollingCombatText = undefined);
        }; 
        this.health = newComputerHealth;
        this.computerCombatSheet.newComputerHealth = this.health;
        if (this.healthbar.getTotal() < computerHealth) this.healthbar.setTotal(computerHealth);
        this.updateHealthBar(newComputerHealth);
        this.weapons = computerWeapons;
        this.setWeapon(computerWeapons[0]); 
        this.checkDamage(computerDamageType.toLowerCase()); 
        this.checkMeleeOrRanged(computerWeapons?.[0]);
        this.currentRound = e.combatRound;
        if (newPlayerHealth <= 0 && computerWin === true) {
            this.isTriumphant = true;
            this.clearCombatWin();
        };
    };

    persuasionUpdate = (e: any) => {
        if (this.enemyID !== e.enemy) return;
        if (e.persuaded) {
            this.isPersuaded = true;
            this.playerTrait = e.persuasion;
        };
    };

    luckoutUpdate = (e: any) => {
        if (this.enemyID !== e.enemy) return;
        if (e.luckout) {
            this.isLuckout = true;
            this.playerTrait = e.luck;
            this.stateMachine.setState(States.DEFEATED);
        };
    };

    setAggression = () => {
        // This will become // return this.scene.reputation.find(obj => obj.name === this.ascean.name).aggressive;
        const percent = this.scene.hud.settings.difficulty.aggression;
        return percent >= Math.random() || false;
    };

    setSpecial = () => {
        const percent = this.scene.hud.settings.difficulty.special;
        return percent >= Math.random() || false;
    };

    isValidRushEnemy = (enemy: Player) => {
        if (this.isRushing === false) return;
        const newEnemy = this.rushedEnemies.every(obj => obj.playerID !== enemy.playerID);
        if (newEnemy) this.rushedEnemies.push(enemy);
    };

    isValidComputerRushEnemy = (enemy: Enemy) => {
        if (this.isRushing === false) return;
        const newEnemy = this.rushedEnemies.every(obj => obj.enemyID !== enemy.enemyID);
        if (newEnemy) this.rushedEnemies.push(enemy);
    };
    
    collision = (enemySensor: any) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [enemySensor],
            callback: (other: any) => {
                if (this.isDeleting) return;
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.isValidRushEnemy(other.gameObjectB);
                    this.touching.push(other.gameObjectB);
                    this.scene.player.touching.push(this);
                    if (this.ascean && !other.gameObjectB.isStealthing && this.enemyAggressionCheck()) {
                        this.createCombat(other, 'start');
                    } else if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive && !this.inComputerCombat) {
                        const newEnemy = this.isNewEnemy(other.gameObjectB);
                        if (newEnemy) {
                            other.gameObjectB.targets.push(this);
                            other.gameObjectB.checkTargets();
                        };
                        if (this.isReasonable()) this.scene.hud.setupEnemy(this);
                        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
                        if (this.stateMachine.isCurrentState(States.DEFEATED)) {
                            this.scene.hud.showDialog(true);
                        } else {
                            this.stateMachine.setState(States.AWARE);
                        };
                    }; //  || other.gameObjectB.name === 'party'
                } else if (other.gameObjectB && other.gameObjectB.name === 'enemy' && this.scene.scene.key !== 'Arena' && this.scene.scene.key !== 'Underground') {
                    this.isValidComputerRushEnemy(other.gameObjectB);
                    this.touching.push(other.gameObjectB);
                    if (this.inCombat || this.inComputerCombat || other.gameObjectB.isDefeated || other.gameObjectB.health <= 0 || this.health <= 0 || this.isDefeated) return;                     
                    // this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
                    this.checkComputerEnemyCombatEnter(other.gameObjectB);                    
                    // if (this.ascean && this.computerEnemyAggressionCheck()) {
                        // this.createComputerCombat(other);
                    // } else if (this.computerStatusCheck(other.gameObjectB) && !this.isAggressive) {
                    // } else {
                        // const newEnemy = this.isNewComputerEnemy(other.gameObjectB);
                        // const realEnemy = this.potentialEnemies.includes(other.gameObjectB.ascean.name);
                    // };
                }
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [enemySensor],
            callback: (other: any) => {
                if (this.isDeleting) return;
                if (other.gameObjectB && other.gameObjectB.name === 'player') {
                    this.touching = this.touching.filter((target) => target !== other.gameObjectB);
                    this.scene.player.touching = this.scene.player.touching.filter((touch: Enemy) => touch.enemyID !== this.enemyID);
                    if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive && !this.inComputerCombat && this.health > 0) {
                        if (this.healthbar) this.healthbar.setVisible(false);
                        if (this.isDefeated === true) {
                            this.scene.hud.showDialog(false);
                            this.stateMachine.setState(States.DEFEATED);
                        } else {
                            this.stateMachine.setState(States.IDLE);
                        };
                        if (this.isCurrentTarget === true && !this.inCombat) this.scene.hud.clearNonAggressiveEnemy();
                    };
                } else if (other.gameObjectB && (other.gameObjectB.name === 'enemy' || other.gameObjectB.name === 'party')) {
                    this.touching = this.touching.filter((target) => target !== other.gameObjectB);
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

    isNewEnemy = (player: Player) => {
        if (!player) return false;
        const newEnemy = player.targets.every(obj => obj.enemyID !== this.enemyID);
        return newEnemy;
    };

    isNewComputerEnemy = (enemy: Enemy | Party) => {
        const newEnemy = this.enemies.every(obj => obj.id !== enemy.enemyID);
        return newEnemy;
    };

    jumpIntoCombat = () => {
        this.currentTarget = this.scene.player;
        this.inCombat = true;
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE);
        this.scene.combatEngaged(true);
        this.specialCombatText = this.scene.showCombatText('!', 1000, 'effect', true, true, () => this.specialCombatText = undefined);
        this.ping();
    };

    checkEnemyCombatEnter = () => {
        this.currentTarget = this.scene.player;
        this.inCombat = true;
        const newEnemy = this.isNewEnemy(this.scene.player);
        if (newEnemy) this.scene.player.targets.push(this);
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE); 
        if (this.scene.combat === false) this.scene.player.targetEngagement(this.enemyID); // player.inCombat
        this.scene.combatEngaged(true);
        this.specialCombatText = this.scene.showCombatText('!', 1000, 'effect', true, true, () => this.specialCombatText = undefined);
        this.ping();
    };

    checkComputerEnemyCombatEnter = (enemy: Enemy | Party) => {
        if (enemy.health <= 0 || this.health <= 0) return;
        this.currentTarget = enemy;
        this.inComputerCombat = true;
        this.computerCombatSheet = {
            ...this.computerCombatSheet,
            computerEnemy: enemy.ascean,
            // computerEnemyBlessing: enemy.computerCombatSheet.computerBlessing,
            computerEnemyHealth: enemy.ascean.health.max,
            newComputerEnemyHealth: enemy.health,
            computerEnemyWeapons: enemy.computerCombatSheet.computerWeapons as Equipment[],
            computerEnemyWeaponOne: enemy.computerCombatSheet.computerWeaponOne,
            computerEnemyWeaponTwo: enemy.computerCombatSheet.computerWeaponTwo,
            computerEnemyWeaponThree: enemy.computerCombatSheet.computerWeaponThree,
            computerEnemyAttributes: enemy.computerCombatSheet.computerAttributes,
            computerEnemyDamageType: enemy.computerCombatSheet.computerDamageType,
            computerEnemyDefense: enemy.computerCombatSheet.computerDefense,
            // computerEnemyDefenseDefault: enemy.computerCombatSheet.computerDefenseDefault,
            // computerEnemyEffects: enemy.computerCombatSheet.computerEffects,
            enemyID: enemy.enemyID,
        };
        const newEnemy = this.isNewComputerEnemy(enemy);
        if (newEnemy) {
            this.enemies.push({id:enemy.enemyID,threat:0});
        };
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.specialCombatText = this.scene.showCombatText('!', 1000, 'effect', true, true, () => this.specialCombatText = undefined);
        
        const distance = this.currentTarget.position.subtract(this.position).length();
        const state = distance > 100 ? States.CHASE : States.COMBAT;
        this.stateMachine.setState(state);

        if (!enemy.inComputerCombat) {
            enemy.checkComputerEnemyCombatEnter(this);
        };
    };

    setEnemyColor = () => {
        this.currentTargetCheck();
        if (this.isCurrentTarget === true) {
            return ENEMY_COLOR;
        } else {
            return ENEMY_COLOR;
        };
    };

    computerStatusCheck = (enemy: Enemy) => (this.ascean && !enemy.inCombat && !enemy.inComputerCombat);

    playerStatusCheck = (player: Player) => (this.ascean && !player.inCombat && !player.isStealthing);

    enemyAggressionCheck = () => {
        return (!this.isDead && !this.isDefeated && !this.inCombat && this.isAggressive && this.scene.state.newPlayerHealth > 0);
    };

    computerEnemyAggressionCheck = () => {
        return (!this.isDead && !this.isDefeated && !this.inComputerCombat && this.isAggressive);
    };

    computerEnemyAttacker = () => {
        const enemy = this.scene.enemies.find((e: Enemy) => e.currentTarget?.enemyID === this.enemyID) || this.scene.party?.find((e: Party) => e.currentTarget?.enemyID === this.enemyID);
        return enemy;
    };

    enemyFetchedOn = (e: any) => {
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
        this.computerCombatSheet = this.createComputerCombatSheet(e.combat as Compiler);
        this.potentialEnemies = ENEMY_ENEMIES[this.ascean.name as keyof typeof ENEMY_ENEMIES];
    };

    createEnemy = () => {
        EventBus.once('enemy-fetched', this.enemyFetchedOn);
        const fetch = { enemyID: this.enemyID, level: this.scene.player.ascean.level };
        EventBus.emit('fetch-enemy', fetch);
    };

    createShield = (shield: Equipment) => {
        const shieldName = this.imgSprite(shield);
        this.spriteShield = new Phaser.GameObjects.Sprite(this.scene, 0, 0, shieldName);
        this.spriteShield.setScale(0.6);
        this.spriteShield.setOrigin(0.5, 0.5);
        this.spriteShield.setVisible(false);
        this.spriteShield.setDepth(this.depth + 1);
        this.scene.add.existing(this.spriteShield);
    };

    createWeapon = (weapon: Equipment) => {
        const weaponName = this.imgSprite(weapon); 
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, weaponName).setVisible(false);
        this.setWeapon(weapon);
        this.checkDamage(weapon.damageType?.[0].toLowerCase() as string);
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

    clearArenaLoss = () => {
        this.clearStatuses();
        this.healthbar.setVisible(false);
        this.setSpecialCombat(false);
        this.inCombat = false;
        this.inComputerCombat = false;
        this.currentTarget = undefined;
        this.isDefeated = true;
        this.isAggressive = false;
        this.enemies = [];
    };

    clearArenaWin = () => {
        this.clearStatuses();
        this.healthbar.setVisible(false);
        this.setSpecialCombat(false);
        this.inCombat = false;
        this.inComputerCombat = false;
        this.currentTarget = undefined;
        this.isTriumphant = true;
        this.isAggressive = false;
        this.enemies = [];
    };

    clearCombatLoss = () => {
        this.healthbar.setVisible(false);
        this.setSpecialCombat(false);
        this.inCombat = false;
        this.inComputerCombat = false;
        this.currentTarget = undefined;
        this.isDefeated = true;
        this.isAggressive = false;
        this.enemies = [];
        this.clearStatuses();
    };
    
    clearCombatWin = () => { 
        if (!this.inComputerCombat) {
            this.inCombat = false;
            this.setSpecialCombat(false);
            this.currentTarget = undefined;
            this.isTriumphant = true;
            this.isAggressive = false;
            this.health = this.ascean.health.max;
            this.healthbar.setValue(this.ascean.health.max);
            this.stateMachine.setState(States.LEASH); 
            this.enemies = [];
            this.clearStatuses();
        } else if (this.enemies[0].id === this.scene?.player?.playerID || this.currentTarget?.name === 'player') {
            this.enemies = this.enemies.filter((e: ENEMY) => e.id !== this.scene.player.playerID);
            this.inCombat = false;
            this.isTriumphant = true;
            const newId = this.enemies[0].id;
            const newEnemy = this.scene.enemies.find((e: Enemy) => newId === e.enemyID);
            this.currentTarget = newEnemy;
            this.stateMachine.setState(States.CHASE);
        } else {
            this.enemies = this.enemies.filter((e: ENEMY) => e.id !== this.scene.player.playerID);
            this.inCombat = false;
            this.isTriumphant = true;
        };
    };

    createCombat = (collision: any, _when: string) => {
        const newEnemy = this.isNewEnemy(collision.gameObjectB);
        if (newEnemy) {
            (this.scene as Player_Scene).player.targets.push(this);
            (this.scene as Player_Scene).player.checkTargets();
            (this.scene as Player_Scene).player.actionTarget = collision;
            (this.scene as Player_Scene).player.targetID = this.enemyID;
            (this.scene as Player_Scene).player.inCombat = true;
            this.currentTarget = collision.gameObjectB;
            this.inCombat = true;
            this.setSpecialCombat(true);
            if (this.healthbar) this.healthbar.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
            this.actionTarget = collision;
            this.stateMachine.setState(States.CHASE); 
            this.scene.combatEngaged(true);
        } else {
            this.currentTarget = collision.gameObjectB;
            this.inCombat = true;
            this.setSpecialCombat(true);
            if (this.healthbar) this.healthbar.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
            this.actionTarget = collision;
            this.stateMachine.setState(States.CHASE); 
            collision.gameObjectB.inCombat = true;
            this.scene.combatEngaged(true);
        };
        this.specialCombatText = this.scene.showCombatText('!', 1000, 'effect', true, true, () => this.specialCombatText = undefined);
        this.ping();
    };

    clearComputerCombatWin = (id: string) => {
        this.enemies = this.enemies.filter((enemy) => enemy.id !== id);
        if (this.enemies.length === 0) {
            this.inCombat = false;
            this.inComputerCombat = false;
            this.setSpecialCombat(false);
            this.currentTarget = undefined;
            this.isAggressive = false;
            this.health = this.ascean.health.max;
            this.healthbar.setValue(this.healthbar.getTotal());
            this.clearStatuses();
        } else {
            const newId = this.enemies[0].id;
            const newEnemy = this.scene.enemies.find((e) => newId === e.enemyID);
            const newPartyEnemy = this.scene.party.find((e) => newId === e.enemyID);
            if (newEnemy && newEnemy.health > 0) {
                this.currentTarget = newEnemy;
            } else if (newPartyEnemy && newPartyEnemy.health > 0) {
                this.currentTarget = newPartyEnemy;
            } else if (this.scene.player.playerID === newId && this.scene.player.health > 0) {
                this.currentTarget = this.scene.player;
            } else {
                this.clearComputerCombatWin(newId);
            };
        };
    };

    clearStatuses = () => {
        this.isConfused = false;
        this.isConsumed = false;
        this.isFeared = false;
        this.isFrozen = false;
        this.isHurt = false;
        this.isParalyzed = false;
        this.isPolymorphed = false;
        this.isRooted = false;
        this.isSlowed = false;
        this.isSnared = false;
        this.isStunned = false;
        this.count = {
            confused: 0,
            feared: 0,
            frozen: 0,
            paralyzed: 0,
            polymorphed: 0,
            rooted: 0,
            slowed: 0,
            snared: 0,
            stunned: 0,
        };
        this.positiveMachine.setState(States.CLEAN);
        this.negativeMachine.setState(States.CLEAN);
        this.clearBubbles();
    };

    createComputerCombat = (other: any) => {
        this.currentTarget = other.gameObjectB;
        this.inComputerCombat = true;
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.stateMachine.setState(States.CHASE);
    };

    setSpecialCombat = (bool: boolean, mult = randomFloatFromInterval(0.75, 1.0)) => { // 0.75, 1.0
        if (this.isSpecial === false) return;
        if (bool === true) {
            const mastery = this.ascean.mastery;
            this.specialCombat?.remove();
            this.specialCombat = undefined;
            this.specialCombat = this.scene.time.addEvent({
                delay: DURATION.SPECIAL * mult,
                callback: () => {
                    if ((this.inCombat === false && this.inComputerCombat === false) || this.isDeleting === true || this.health <= 0 || this.isDefeated) {
                        this.specialCombat?.remove();
                        return;
                    };
                    if (this.isSuffering() || this.isContemplating || this.scene.state.playerEffects.find((effect: StatusEffect) => effect.prayer === 'Silence')) {
                        this.setSpecialCombat(true, 0.3);
                        return;
                    };
                    const special = ENEMY_SPECIAL[mastery as keyof typeof ENEMY_SPECIAL][Math.floor(Math.random() * ENEMY_SPECIAL[mastery as keyof typeof ENEMY_SPECIAL].length)].toLowerCase();
                    this.specialAction = special;
                    // this.currentAction = 'special';
                    // const specific = ['paralyze'];
                    // const test = specific[Math.floor(Math.random() * specific.length)];
                    if (this.stateMachine.isState(special)) {
                        this.stateMachine.setState(special);
                    } else if (this.positiveMachine.isState(special)) {
                        this.positiveMachine.setState(special);
                    };
                    this.setSpecialCombat(true);
                },
                callbackScope: this
            });
        } else {
            this.specialCombat?.remove();
        };
    };

    playerCaerenic = () => this.scene.state.isCaerenic ? 1.25 : 1;

    playerStalwart = () => this.scene.state.isStalwart ? 0.85 : 1;

    mastery = () => this.ascean[this.ascean.mastery] || 20;

    chiomic = (power: number, id: string) => {
        this.entropicMultiplier(power);
        if (id === this.scene?.player?.playerID) { // Player Combat
            if (this.scene.state.newPlayerHealth <= 0) return;
            this.scene.combatManager.useGrace(power / 10);
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: 'Enemy Chiomic', data: power });
            } else {
                const chiomic = Math.round(this.mastery() / 2 * (1 + (power / 100)) * this.playerCaerenic() * this.playerStalwart() * ((this.ascean?.level + 9) / 10));
                const ratio = chiomic / this.scene.state.computerHealth * 100;
                const computerActionDescription = `${this.ascean?.name} flays ${chiomic} health from you with their hush.`;
                EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.enemyID } });
            };
        } else { // Computer Combat
            const chiomic = Math.round(this.mastery() / 2 * (1 + (power / 100)) * ((this.ascean?.level + 9) / 10));
            this.computerCombatSheet.newComputerEnemyHealth -= chiomic;
            EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage: chiomic, id, origin: this.enemyID });
        };
    };

    devour = (power: number, id: string) => {
        if (id === this.scene?.player?.playerID) {
            if (this.scene.state.newPlayerHealth <= 0) return;
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: 'Enemy Tshaeral', data: 5 });
            } else {
                const dev = Math.round(this.combatStats.attributes.healthTotal * (power / 100) * this.playerCaerenic() * this.playerStalwart() * (this.ascean.level + 9) / 10);
                let newComputerHealth = Math.min(this.health + dev, this.combatStats.attributes.healthTotal);
                const computerActionDescription = `${this.ascean?.name} tshaers and devours ${dev} health from you.`;
                EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -power, id: this.enemyID } });
                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
            };
        } else { // CvC
            const dev = Math.round(this.combatStats.attributes.healthTotal * (power / 100) * (this.ascean.level + 9) / 10);
            let newComputerHealth = Math.min(this.health + dev, this.combatStats.attributes.healthTotal);
            this.health = newComputerHealth;
            this.updateHealthBar(this.health);
            this.computerCombatSheet.newComputerEnemyHealth -= dev;
            this.computerCombatSheet.newComputerHealth = this.health;
            EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.health });
            EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage: dev, id, origin: this.enemyID });
        };
    };

    sacrifice = (power: number, id: string) => {
        this.entropicMultiplier(power);
        if (id === this.scene?.player?.playerID) {
            if (this.scene.state.newPlayerHealth <= 0) return;
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: 'Enemy Sacrifice', data: power });
            } else {
                const sacrifice = Math.round(this.mastery() * this.playerCaerenic() * this.playerStalwart() * ((this.ascean?.level + 9) / 10));
                let newComputerHealth = this.health + (sacrifice / 2) > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + (sacrifice / 2);
                const computerActionDescription = `${this.ascean?.name} sacrifices ${sacrifice / 2} health to rip ${roundToTwoDecimals(sacrifice * (1 + power / 100))} from you.`;
                const ratio = (sacrifice * (1 + power / 50)) / this.scene.state.playerHealth * 100;
                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.enemyID } });
                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
                EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
            };
        } else { // CvC
            const sacrifice = Math.round(this.mastery() * ((this.ascean?.level + 9) / 10));
            this.health -= (sacrifice / 2);
            this.computerCombatSheet.newComputerEnemyHealth -= (sacrifice * (1 * power / 100));
            this.computerCombatSheet.newComputerHealth = this.health;
            this.updateHealthBar(this.health);
            EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.health });
            EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage: sacrifice, id, origin: this.enemyID });
        };
    };

    suture = (power: number, id: string) => {
        this.entropicMultiplier(power);
        if (id === this.scene?.player?.playerID) {
            if (this.scene.state.newPlayerHealth <= 0) return;
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: 'Enemy Suture', data: power });
            } else {
                const suture = Math.round(this.mastery() * this.playerCaerenic() * this.playerStalwart() * ((this.ascean?.level + 9) / 10)) * (1 + power / 100) * 0.8;
                let newComputerHealth = Math.min(this.health + suture, this.combatStats.attributes.healthTotal);
                const computerActionDescription = `${this.ascean?.name} sutured ${suture} health from you, absorbing ${suture}.`;
                const ratio = suture / this.scene.state.playerHealth * 100;
                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: -ratio, id: this.enemyID } });
                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.enemyID } });
                EventBus.emit('add-combat-logs', { ...this.scene.state, computerActionDescription });
            };
        } else { // CvC
            const suture = Math.round(this.mastery() * ((this.ascean?.level + 9) / 10)) * (1 + power / 100) * 0.8;
            let newComputerHealth = Math.min(this.health + suture, this.combatStats.attributes.healthTotal);
            this.computerCombatSheet.newComputerEnemyHealth -= suture;
            this.computerCombatSheet.newComputerHealth = newComputerHealth;
            EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: newComputerHealth });
            EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage: suture, id, origin: this.enemyID });
        };
    };

    checkDamage = (damage: string) => {
        this.currentDamageType = damage;
        this.hasMagic = this.checkDamageType(damage, 'magic');
    };

    counterCheck = () => {
        if (this.scene?.player?.isCounterSpelling === true) {
            this.isCasting = false;
            this.isCounterSpelled = true;
        };
    };

    isSuccessful = (time: number) => {
        if (this.castbar.time >= (time - 10)) {
            this.castingSuccess = true;
            this.isCasting = false;
            return true;
        };
        return false;
    };
    
    startCasting = (name: string, duration: number, style: string, channel = false) => {
        this.castbar.reset();
        this.castbar.setVisible(true); // Added
        this.castbar.setup(this.x, this.y);
        this.isCasting = true;
        this.specialCombatText = this.scene.showCombatText(name, duration / 2, style, false, true, () => this.specialCombatText = undefined);
        this.castbar.setTotal(duration);
        if (name !== 'Healing' && name !== 'Reconstituting') this.beam.enemyEmitter(this.currentTarget, duration, this.ascean.mastery); // scene.player
        if (channel === true) this.castbar.setTime(duration);
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.setVelocity(0);
        this.anims.play('player_health', true);
    };

    stopCasting = (counter: string) => {
        this.isCasting = false;
        this.castingSuccess = false;
        this.targetID = '';
        this.castbar.reset();
        this.beam.reset();
        if (this.isGlowing === true) this.checkCaerenic(false);
        if (this.isCounterSpelled === true) this.specialCombatText = this.scene.showCombatText(counter, 750, 'damage', false, true, () => this.specialCombatText = undefined);
        this.evaluateCombatDistance();        
    };

    setStun = () => {
        this.specialCombatText = this.scene.showCombatText('Stunned', 2500, 'effect', true, true, () => this.specialCombatText = undefined);
        this.isStunned = true;
        this.count.stunned += 1;
    };

    setWeapon = (weapon: Equipment) => {
        return this.currentWeapon = weapon;
    };

    updateHealthBar(health: number) {
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
            if (this.velocity?.y as number > 0) {
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
        if (this.isDeleting) return;
        this.stateMachine.clearStates();
        this.scene.hud.logger.log(`Console: ${this.ascean.name} has been defeated by ${this.currentTarget?.ascean?.name ? this.currentTarget.ascean.name : 'someone in this world'}.`);
        this.anims.play('player_death', true);
        this.defeatedTime = 120000;
        if (this.isShimmering) {
            this.isShimmering = false;
            this.stealthEffect(false);
        };
        if (this.isGlowing) this.checkCaerenic(false);
        EventBus.emit(BROADCAST_DEATH, this.enemyID);
        const party = this.scene.party.find((e: Party) => e.enemyID === this.killingBlow);
        if (party) { // A Party Member Got the Killing Blow
            EventBus.emit('killing-blow', {e:this.ascean, enemyID:this.enemyID});
        };
        this.killingBlow = '';
        this.currentTargetCheck();
        this.health = 0;
        this.computerCombatSheet.newComputerHealth = 0;
        this.isDefeated = true;
        this.inCombat = false;
        this.inComputerCombat = false;
        this.setSpecialCombat(false);
        this.setTint(ENEMY_COLOR);
        this.currentTarget = undefined;
        this.isAggressive = false;
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.healthbar.setVisible(false);
        this.setCollisionCategory(0);
        this.enemies = [];
        this.clearStatuses();
    };
    onDefeatedUpdate = (dt: number) => {
        if (this.isDeleting) return;
        this.defeatedTime -= dt;
        if (this.defeatedTime <= 0 && !this.stateMachine.isCurrentState(States.IDLE)) this.stateMachine.setState(States.IDLE);
    };
    onDefeatedExit = () => {
        if (this.isDeleting) return;
        this.anims.playReverse('player_death');
        this.isDefeated = false;
        this.defeatedTime = 120000;
        this.health = this.ascean.health.max;
        this.updateHealthBar(this.ascean.health.max);
        this.computerCombatSheet.newComputerHealth = this.ascean.health.max;
        this.isAggressive = this.startedAggressive;
        this.spriteWeapon.setVisible(true);
        this.setCollisionCategory(1);
        const texts = [`${this.weapons[0].influences[0]} be praised! I live again.`, `${this.weapons[0].influences[0]}, you have my caeren. Thank you for this change once more.`, 'Alright, I feel better again.', 'Well, that was unpleasant.', "Thank goodness that's over.", "Good as new!", "Hopefully, that's the end of that nonsense.", "My word, I didn't expect that to happen."];
        const text = texts[Math.floor(Math.random() * texts.length)];
        this.specialCombatText = this.scene.showCombatText(text, 1500, 'effect', false, true, () => this.specialCombatText = undefined);
    };

    onDeathEnter = () => {
        this.clearTint(); 
        this.setStatic(true);
    };
    onDeathUpdate = () => this.anims.play('player_hurt', true);

    onIdleEnter = () => {
        this.setVelocity(0);
        this.enemyAnimation();
        this.currentRound = 0;
        if (this.isShimmering) {
            this.isShimmering = false;
            this.stealthEffect(false);
        };
    };
    onIdleUpdate = (dt: number) => {
        this.idleWait -= dt;
        if (this.idleWait <= 0) {
            this.idleWait = Phaser.Math.RND.between(4000, 6000);
            if (this.stateMachine.isCurrentState(States.IDLE) && !this.isDeleting) this.stateMachine.setState(States.PATROL);
        };
    };
    onIdleExit = () => this.anims.stop();
 
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
    
    onPatrolUpdate = (_dt: number) => {
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
        this.enemyAnimation();
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
            const point = new Phaser.Math.Vector2(Phaser.Math.RND.between(this.x - 250, this.x + 250), Phaser.Math.RND.between(this.y - 250, this.y + 250));
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
    
    calculateDistance = (pointA: Phaser.Math.Vector2, pointB: Phaser.Math.Vector2) => Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
    
    calculatePatrolDelay = (distance: number, speed: number) => {
        const timeToNextPoint = (distance / (speed * 0.25)) * 1000; // Calculate time in milliseconds
        return timeToNextPoint; // Add some base delay to ensure smooth movement
    };

    onAwarenessEnter = () => {
        this.setVelocity(0);
        this.enemyAnimation();
        this.scene.hud.showDialog(true);
    };
    onAwarenessUpdate = (_dt: number) => {
        this.enemyAnimation();
    };
    onAwarenessExit = () => {
        this.enemyAnimation();
        this.scene.hud.showDialog(false);
    };

    onChaseEnter = () => {
        if (!this.currentTarget) return;
        this.frameCount = 0;
        this.enemyAnimation();
        // this.scene.navMesh.enableDebug();
        this.chaseTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                // this.scene.navMesh.debugDrawClear();
                if (!this.currentTarget || !this.currentTarget.body || !this.scene?.navMesh || this.isDeleting) {
                    this.path = [];
                    return;
                };
                this.path = this.scene.navMesh.findPath(this.position, this.currentTarget.position);
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
    onChaseUpdate = (_dt: number) => {
        if (!this.currentTarget || !this.currentTarget.body) {
            this.stateMachine.setState(States.LEASH);
            return;
        };
        const rangeMultiplier = this.rangedDistanceMultiplier(3);
        const direction = this.currentTarget.position.subtract(this.position);
        const distance = direction.length();
        if (Math.abs(this.originPoint.x - this.position.x) > RANGE[this.scene.scene.key as keyof typeof RANGE] * rangeMultiplier 
            || Math.abs(this.originPoint.y - this.position.y) > RANGE[this.scene.scene.key as keyof typeof RANGE] * rangeMultiplier 
            || (!this.inCombat && !this.inComputerCombat)
            || distance > RANGE[this.scene.scene.key as keyof typeof RANGE] * rangeMultiplier) 
        {
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
        this.enemyAnimation();
    };
    onChaseExit = () => {
        // this.scene.navMesh.debugDrawClear();
        this.setVelocity(0);
        this.enemyAnimation();
        if (this.chaseTimer) {
            this.chaseTimer.destroy();
            this.chaseTimer = undefined;
        };
    };

    onCombatEnter = () => {
        if ((this.inCombat === false && this.inComputerCombat === false) || !this.currentTarget || this.health <= 0 || (this.inCombat && this.scene.state.newPlayerHealth <= 0) || (this.inComputerCombat && this.currentTarget?.health <= 0)) {
            this.inCombat = false;
            this.inComputerCombat = false;
            return;
        };
        this.frameCount = 0;
        this.enemyAnimation();
        if (this.healthbar.visible === false) this.healthbar.setVisible(true);
        if (!this.isSwinging) {
            this.isSwinging = true;
            this.scene.time.delayedCall(this.swingTimer, () => {
                this.isSwinging = false;
                if (this.currentAction === '') this.currentAction = this.evaluateCombat();
            }, undefined, this);
        };
    };
    onCombatUpdate = (_dt: number) => this.evaluateCombatDistance();
    onCombatExit = () => {};

    onContemplateEnter = () => {
        if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) {
            this.inCombat = false;
            this.inComputerCombat = false;
        };
        this.isContemplating = true;
        this.frameCount = 0;
        this.setVelocity(0);
        this.enemyAnimation();
        this.contemplationTime = Phaser.Math.Between(500, 1000);
    };
    onContemplateUpdate = (dt: number) => {
        this.contemplationTime -= dt;
        if (this.contemplationTime <= 0) {
            this.isContemplating = false;
        };
        if (!this.isContemplating) this.stateMachine.setState(States.CLEAN); 
    };
    onContemplateExit = () => {
        this.isContemplating = false;
        this.currentAction = '';
        if (this.health <= 0) return;
        if (this.inCombat === false && this.inComputerCombat === false) {
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.instincts();
        this.stateMachine.setState(States.CHASE);
    };

    onEvasionEnter = () => {
        const x = Phaser.Math.Between(1, 2);
        const y = Phaser.Math.Between(1, 2);
        const evade = Phaser.Math.Between(1, 2);
        this.frameCount = 0;
        this.evadeRight = x === 1;
        this.evadeUp = y === 1;
        if (evade === 1) {
            this.isDodging = true;
        } else {
            this.isRolling = true;
        };
        this.handleAnimations();
    };
    onEvasionUpdate = (_dt: number) => {
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
        this.combatChecker(this.isDodging && this.isRolling);
    }; 
    onEvasionExit = () => {};

    onAttackEnter = () => {
        this.setTint(TARGET_COLOR);
        this.isAttacking = true;
        this.frameCount = 0;
        this.currentAction = '';
        this.attack();
    };
    onAttackUpdate = (_dt: number) => {
        if (this.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.isRanged) {
            if (this.inComputerCombat) this.computerCombatSheet.computerAction = PHYSICAL_ACTIONS.ATTACK;
            if (this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, PHYSICAL_ACTIONS.ATTACK, this.enemyID);
            this.currentAction = PHYSICAL_ACTIONS.ATTACK;
        };
        if (!this.isRanged) this.swingMomentum(this.currentTarget);
        this.combatChecker(this.isAttacking);
    };
    onAttackExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = '';
        if (this.scene.state.computerAction !== '' && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, '', this.enemyID);
        this.setTint(ENEMY_COLOR);
        this.currentAction = '';
        this.frameCount = 0;
    };

    onParryEnter = () => {
        this.setTint(TARGET_COLOR);
        this.isParrying = true;
        this.frameCount = 0;
        this.currentAction = '';
        this.anims.play('player_attack_1', true);
    };
    onParryUpdate = (_dt: number) => {
        if (this.frameCount === FRAME_COUNT.PARRY_LIVE && !this.isRanged) {
            if (this.inComputerCombat) this.computerCombatSheet.computerAction = PHYSICAL_ACTIONS.PARRY;
            if (this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, PHYSICAL_ACTIONS.PARRY, this.enemyID);
            this.currentAction = PHYSICAL_ACTIONS.PARRY;    
        };
        if (this.frameCount >= FRAME_COUNT.PARRY_KILL) this.isParrying = false;
        if (!this.isRanged) this.swingMomentum(this.currentTarget);
        this.combatChecker(this.isParrying);
    };
    onParryExit = () => {
        this.isParrying = false;
        this.currentAction = '';
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = '';
        if (this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, '', this.enemyID);
        this.setTint(ENEMY_COLOR);
        this.frameCount = 0;
    };

    onThrustEnter = () => {
        this.setTint(TARGET_COLOR);
        this.isThrusting = true;
        this.frameCount = 0;
        this.thrustAttack();
        this.currentAction = '';
    };
    onThrustUpdate = (_dt: number) => {
        if (this.frameCount === FRAME_COUNT.THRUST_LIVE && !this.isRanged) {
            if (this.inComputerCombat) this.computerCombatSheet.computerAction = PHYSICAL_ACTIONS.THRUST;
            if (this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, 'thrust', this.enemyID);
            this.currentAction = PHYSICAL_ACTIONS.THRUST;    
        };
        if (!this.isRanged) this.swingMomentum(this.currentTarget);
        this.combatChecker(this.isThrusting);
    };
    onThrustExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = '';
        if (this.scene.state.computerAction !== '' && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, '', this.enemyID);
        this.setTint(ENEMY_COLOR);
        this.frameCount = 0;
        this.currentAction = '';
    };

    onDodgeEnter = () => {
        this.isDodging = true; 
        this.setTint(TARGET_COLOR);
        this.wasFlipped = this.flipX; 
        ((this.body as any).parts as any)[2].position.y += this.sensorDisp;
        ((this.body as any).parts as any)[2].circleRadius = 21;
        ((this.body as any).parts as any)[1].vertices[0].y += this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[1].y += this.colliderDisp; 
        ((this.body as any).parts as any)[0].vertices[0].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[1].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        ((this.body as any).parts as any)[0].vertices[1].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[0].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.handleAnimations();
        this.frameCount = 0;
    };
    onDodgeUpdate = (_dt: number) => this.combatChecker(this.isDodging); 
    onDodgeExit = () => {
        ((this.body as any).parts as any)[2].position.y -= this.sensorDisp;
        ((this.body as any).parts as any)[2].circleRadius = 36;
        ((this.body as any).parts as any)[1].vertices[0].y -= this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[1].y -= this.colliderDisp; 
        ((this.body as any).parts as any)[0].vertices[0].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[1].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        ((this.body as any).parts as any)[0].vertices[1].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[0].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.setTint(ENEMY_COLOR);
        this.frameCount = 0;
    };

    onPostureEnter = () => {
        this.isPosturing = true;
        this.spriteShield.setVisible(true);
        this.frameCount = 0;
        this.currentAction = '';
        this.posture();
    };
    onPostureUpdate = (_dt: number) => {
        if (this.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.isRanged) {
            if (this.inComputerCombat) this.computerCombatSheet.computerAction = PHYSICAL_ACTIONS.POSTURE;
            if (this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, PHYSICAL_ACTIONS.POSTURE, this.enemyID);
            this.currentAction = PHYSICAL_ACTIONS.POSTURE;    
        };
        if (!this.isRanged) this.swingMomentum(this.currentTarget);
        this.combatChecker(this.isPosturing);
    };
    onPostureExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = '';
        if (this.scene.state.computerAction !== '' && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, '', this.enemyID);
        this.spriteShield.setVisible(false);
        this.setTint(ENEMY_COLOR);
        this.frameCount = 0;
        this.currentAction = '';
    };

    onRollEnter = () => {
        this.isRolling = true; 
        this.setTint(TARGET_COLOR);
        ((this.body as any).parts as any)[2].position.y += this.sensorDisp;
        ((this.body as any).parts as any)[2].circleRadius = 21;
        ((this.body as any).parts as any)[1].vertices[0].y += this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[1].y += this.colliderDisp; 
        this.handleAnimations();
        this.currentAction = '';
        this.frameCount = 0;
    };
    onRollUpdate = (_dt: number) => { 
        if (this.frameCount === FRAME_COUNT.ROLL_LIVE && !this.isRanged) {
            if (this.inComputerCombat) this.computerCombatSheet.computerAction = PHYSICAL_ACTIONS.ROLL;
            if (this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, PHYSICAL_ACTIONS.ROLL, this.enemyID);
            this.currentAction = PHYSICAL_ACTIONS.ROLL;    
        };
        this.combatChecker(this.isRolling);
    };
    onRollExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = '';
        if (this.scene.state.computerAction !== '' && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, '', this.enemyID);
        ((this.body as any).parts as any)[2].position.y -= this.sensorDisp;
        ((this.body as any).parts as any)[2].circleRadius = 36;
        ((this.body as any).parts as any)[1].vertices[0].y -= this.colliderDisp;
        ((this.body as any).parts as any)[1].vertices[1].y -= this.colliderDisp;
        this.setTint(ENEMY_COLOR);
        this.frameCount = 0;
        this.currentAction = '';
    };

    onLeashEnter = () => {
        this.enemyAnimation();
        this.setTint(ENEMY_COLOR);
        if (this.inComputerCombat || this.currentTarget) {
            const enemy = this.computerEnemyAttacker();
            if (enemy) {
                this.checkComputerEnemyCombatEnter(enemy);
                return;
            };
        };
        this.inCombat = false;
        this.inComputerCombat = false;
        this.healthbar.setVisible(false);
        if (this.currentTarget !== undefined && this.currentTarget.name === 'player') {
            this.currentTarget.removeTarget(this.enemyID);
            this.currentTarget = undefined;
        };
        if (this.currentTarget !== undefined && this.currentTarget.enemyID) {
            this.currentTarget = undefined;
        };
        this.setSpecialCombat(false);
        this.leashTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                if (!this.scene || !this.scene.navMesh || this.isDeleting) {
                    this.leashTimer?.remove(false);
                    this.leashTimer?.destroy();
                    this.leashTimer = undefined;
                    return;
                };
                let originPoint = new Phaser.Math.Vector2(this.originPoint.x, this.originPoint.y);
                // this.scene.navMesh.debugDrawClear();
                this.path = this.scene.navMesh.findPath(this.position, originPoint);
                if (this.path && this.path.length > 1) {
                    if (!this.isPathing) this.isPathing = true;
                    const nextPoint = this.path[1];
                    this.nextPoint = nextPoint;
                    // this.scene.navMesh.debugDrawPath(this.path, 0xffd900);
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
    onLeashUpdate = (_dt: number) => {
        let originPoint = new Phaser.Math.Vector2(this.originPoint.x, this.originPoint.y);
        let direction = originPoint.subtract(this.position);
        if (direction.length() >= 10) {
            if (this.path && this.path.length > 1) {
                this.setVelocity(this.pathDirection.x * this.speed, this.pathDirection.y * this.speed); // 2.5
            } else {
                if (this.isPathing) this.isPathing = false;
                direction.normalize();
                this.setVelocity(direction.x * this.speed, direction.y * this.speed); // 2.5
            };
        } else {
            this.stateMachine.setState(States.IDLE);
        };
        this.getDirection();
    };
    onLeashExit = () => {
        this.setVelocity(0);
        this.leashTimer?.destroy();
        this.leashTimer = undefined;
        // this.scene.navMesh.debugDrawClear();
    };

    combatChecker = (state: boolean) => {
        if (state === true) return;
        this.evaluateCombatDistance();
    };

    getTargetId = (): string => this.currentTarget?.name === 'player' ? this.currentTarget?.playerID : this.currentTarget?.enemyID;

    // ========================== CREATING ENHANCED ENEMY AI ========================= \\

    instincts = () => {
        if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) return;
        this.scene.time.delayedCall(500, () => {
            if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) return;
            let chance = [1, 2, 3, (!this.isRanged ? 5 : 6)][Math.floor(Math.random() * 4)];
            let mastery = this.ascean.mastery;
            let health = this.health / this.ascean.health.max;
            let player = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
            if ((!this.currentTarget || !this.currentTarget.body) && this.health > 0) {
                this.stateMachine.setState(States.COMBAT);
                return;
            };
            const direction = this.currentTarget?.position?.subtract(this.position);
            const distance = direction?.length() || 0;
            let instinct =
                health <= 0.33 ? 0 : // Heal
                health <= 0.66 ? 1 : // Heal
                player <= 0.33 ? 2 : // Damage
                player <= 0.66 ? 3 : // Damage
                distance <= 100 ? 4 : // AoE
                distance >= 200 && !this.isRanged ? 5 : // Melee at Distance
                distance >= 200 && this.isRanged ? 6 : // Ranged at Distance
                chance; // Range
            let key = INSTINCTS[mastery as keyof typeof INSTINCTS][instinct].key, value = INSTINCTS[mastery as keyof typeof INSTINCTS][instinct].value;
            if (this.inCombat) this.scene.hud.logger.log(`${this.ascean.name}'s instinct leads them to ${value}.`);
            (this as any)[key].setState(value);
            if (key === 'positiveMachine') this.stateMachine.setState(States.CHASE);
        }, undefined, this);
    };

    // ========================== SPECIAL ENEMY STATES ========================== \\
    onAchireEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Achire', PLAYER.DURATIONS.ACHIRE, 'cast');
    };
    onAchireUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');        
        if (this.isSuccessful(PLAYER.DURATIONS.ACHIRE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onAchireExit = () => {
        if (this.castingSuccess === true) { 
            this.particleEffect = this.scene.particleManager.addEffect('achire', this, 'achire', true);
            if (this.inCombat) EventBus.emit('enemy-combat-text', {
                text: `${this.ascean.name}'s Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.castingSuccess = false;
            this.enemySound('wild', true);
        };
        this.stopCasting('Countered Achire');
    };
    onAstraveEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Astrave', PLAYER.DURATIONS.ASTRAVE, 'cast')
    };
    onAstraveUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.ASTRAVE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onAstraveExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.aoe = new AoE(this.scene, 'astrave', 1, true, this, false, this.scene.player);    
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} unearths the winds and lightning from the land of hush and tendril.`
                });
                this.scene.combatManager.useGrace(PLAYER.STAMINA.ASTRAVE);    
            };
        } else if (this.castingSuccess === true) { // CvC
            const enemy = this.scene.enemies.find((e: Enemy) => e.enemyID === this.targetID) || this.scene.party.find((p: Party) => p.enemyID === this.targetID);
            this.aoe = new AoE(this.scene, 'astrave', 1, true, this, false, enemy);    
        };
        this.enemySound('combat-round', this.castingSuccess);
        this.stopCasting('Countered Astrave');
    };

    onBlinkEnter = () => {
        this.setVelocityX(this.flipX ? 35 : -35);
        this.flickerCarenic(500);
        this.scene.time.delayedCall(500, () => {
                // Define the map boundaries (you can derive these dynamically from your tilemap or world bounds)
            const mapBounds = {
                minX: 32,
                maxX: this.scene.map.widthInPixels - 32, // Maximum width of the map
                minY: 32,
                maxY: this.scene.map.heightInPixels - 32  // Maximum height of the map
            };
            const clampedX = Phaser.Math.Clamp(this.x, mapBounds.minX, mapBounds.maxX);
            const clampedY = Phaser.Math.Clamp(this.y, mapBounds.minY, mapBounds.maxY);
            this.setPosition(clampedX, clampedY);
            this.instincts();
        }, undefined, this);
        this.enemySound('caerenic', true);
    };
    onBlinkUpdate = (_dt: number) => {};
    onBlinkExit = () => {};
    onChiomismEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Chiomism', PLAYER.DURATIONS.CHIOMISM, 'damage');
    };
    onChiomismUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.CHIOMISM)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onChiomismExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.sacrifice(30, this.targetID);
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) {
                    if (this.checkPlayerResist() === true) {
                        this.scene.combatManager.confuse(this.targetID);
                    } else {
                        EventBus.emit('special-combat-text', {
                            playerSpecialDescription: `You resist the laugh of the chiomic tongue.` // Menses wink wink
                        });
                    };
                };
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} bleeds and laughs at you with tendrils of Chiomyr.`
                });
                screenShake(this.scene, 90);
            };
        } else { // CvC
            if (this.castingSuccess === true) {
                this.sacrifice(30, this.targetID);
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) {
                    this.scene.combatManager.confuse(this.targetID);
                };
            };
        };
        this.enemySound('death', this.castingSuccess);
        this.stopCasting('Countered Chiomism');
    };
    onConfuseEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Confusing', PLAYER.DURATIONS.CONFUSE, 'cast');
    };
    onConfuseUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.CONFUSE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onConfuseExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.confuse(this.targetID);
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean?.name} confuses you, causing you to stumble around in a daze.`
                });
            };
        } else {
            if (this.castingSuccess === true) this.scene.combatManager.confuse(this.targetID);
        };
        this.enemySound('combat-round', this.castingSuccess);
        this.stopCasting('Countered Confuse');
        this.instincts();
    };

    onDesperationEnter = () => {
        this.isCasting = true;
        this.specialCombatText = this.scene.showCombatText('Desperation', PLAYER.DURATIONS.HEALING / 2, 'cast', false, true, () => this.specialCombatText = undefined);
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.DESPERATION, () => {
            if (this.health <= 0) return;
            const heal = Math.round(this.ascean.health.max * 0.5);
            const total = Math.min(this.health + heal, this.ascean.health.max);
            this.enemySound('phenomena', true);
            if (this.isCurrentTarget) {
                this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
            } else {
                this.health = total;
                this.updateHealthBar(total);
            };
            this.computerCombatSheet.newComputerHealth = total;
            this.checkCaerenic(false);
            this.count.stunned += 1;
            this.isStunned = true;
            this.stateMachine.setState(States.STUNNED);
        }, undefined, this);
    };
    onDesperationExit = () => this.isCasting = false;

    onFearingEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Fearing', PLAYER.DURATIONS.FEAR, 'cast');
    };
    onFearingUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.FEAR)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onFearingExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.fear(this.targetID);
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean?.name} strikes fear into you, causing you to panic in terror!`
                });
            };
        } else {
            if (this.castingSuccess === true) this.scene.combatManager.fear(this.targetID);
        };
        this.enemySound('combat-round', this.castingSuccess);
        this.stopCasting('Countered Fear');
        this.instincts();
    };
    onFrostEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Frost', PLAYER.DURATIONS.FROST, 'cast');
    };
    onFrostUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.FROST)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onFrostExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.chiomic(75, this.targetID);
                this.scene.combatManager.slow(this.targetID, 3000);
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} seizes into this world with Nyrolean tendrils, slowing you.`
                });
                screenShake(this.scene, 90);
            };
        } else { // CvC
            if (this.castingSuccess === true) {
                this.chiomic(75, this.targetID);
                this.scene.combatManager.slow(this.targetID, 3000);
            };
        };
        this.enemySound('fire', this.castingSuccess);
        this.stopCasting('Countered Frost');
    };
    onHealingEnter = () => this.startCasting('Healing', PLAYER.DURATIONS.HEALING, 'cast');
    onHealingUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.MAIERETH)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onHealingExit = () => {
        if (this.castingSuccess === true) {
            const heal = Math.round(this.ascean.health.max * 0.25);
            const total = Math.min(this.health + heal, this.ascean.health.max);
            if (this.inCombat) {
                if (this.isCurrentTarget) {
                    this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
                } else {
                    this.health = total;
                    this.updateHealthBar(total);
                };
            } else {
                this.health = total;
                this.updateHealthBar(total);
                this.computerCombatSheet.newComputerHealth = total;
                this.scrollingCombatText = this.scene.showCombatText(`${heal}`, 1500, 'heal', false, false, () => this.scrollingCombatText = undefined);
                EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: total });
            };
        };
        this.enemySound('phenomena', this.castingSuccess);
        this.stopCasting('Countered Healing');
    };
    onHookEnter = () => {
        this.particleEffect = this.scene.particleManager.addEffect('hook', this, 'hook', true);
        this.specialCombatText = this.scene.showCombatText('Hook', DURATION.TEXT, 'damage', false, true, () => this.specialCombatText = undefined);
        this.enemySound('dungeon', true);
        this.flickerCarenic(750);
        this.beam.startEmitter(this.particleEffect.effect, 1750);
        this.hookTime = 0;
    };
    onHookUpdate = (dt: number) => {
        this.hookTime += dt;
        if (this.hookTime >= 1750 || !this.particleEffect?.effect) {
            this.combatChecker(false);
        };
    };
    onHookExit = () => this.beam.reset();

    onIlirechEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Ilirech', PLAYER.DURATIONS.ILIRECH, 'damage');
    };
    onIlirechUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.ILIRECH)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onIlirechExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.chiomic(100, this.targetID);
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} rips into this world with Ilian tendrils entwining.`
                });
                screenShake(this.scene, 90);
            };
        } else { // CvC
            if (this.castingSuccess === true) this.chiomic(100, this.targetID);
        };
        this.enemySound('fire', this.castingSuccess);
        this.stopCasting('Countered Ilirech');
    };
    
    onKyrisianEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Kyrisian', PLAYER.DURATIONS.KYRISIAN, 'damage');
    };
        
    onKyrisianUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.KYRISIAN)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onKyrisianExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.sacrifice(30, this.targetID);
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) {
                    if (this.checkPlayerResist() === true) {
                        this.scene.combatManager.paralyze(this.targetID);
                    } else {
                        EventBus.emit('special-combat-text', {
                            playerSpecialDescription: `You resist the charm of the golden voice.` // Menses wink wink
                        });
                    };
                };
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} bleeds and bewitches you with tendrils of Kyrisos.`
                });
                screenShake(this.scene, 90);
            };
        } else { // CvC
            if (this.castingSuccess === true) {
                this.sacrifice(30, this.targetID);
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) {
                    this.scene.combatManager.paralyze(this.targetID);
                };
            };
        };
        this.enemySound('spooky', this.castingSuccess);
        this.stopCasting('Countered Kyrisian');
    };
    onKyrnaicismEnter = () => {
        this.startCasting('Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM, 'damage', true);
        this.targetID = this.getTargetId();
        if (this.targetID === '') {
            this.isCasting = false;
            return;
        };
        if (this.currentTarget?.name === 'player') {
            if (this.checkPlayerResist() === false) return;
        };
        this.enemySound('absorb', true);
        this.scene.combatManager.slow(this.targetID, 1000);
        this.channelCount = 0;
        this.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => { // || this.scene.state.computerWin || this.scene.state.playerWin
                if (this.isCasting === false || this.health <= 0 || this.isCounterSpelled) {
                    this.isCasting = false;
                    this.chiomicTimer?.remove(false);
                    this.chiomicTimer = undefined;
                    return;
                };
                this.scene.combatManager.slow(this.targetID, 1000);
                this.chiomic(10, this.targetID);
                this.channelCount++;
                if (this.channelCount >= 3) {
                    this.isCasting = false;
                    this.channelCount = 0;
                };
            },
            callbackScope: this,
            repeat: 3,
        });
    };
    onKyrnaicismUpdate = (dt: number) => {
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
        if ((!this.currentTarget || !this.currentTarget.body) && this.health > 0) {
            this.stateMachine.setState(States.COMBAT);
            return;
        };
        const target = new Phaser.Math.Vector2(this.currentTarget.x, this.currentTarget.y);
        const direction = target.subtract(this.position);
        const distance = direction.length();
        const buffer = this.currentTarget.isMoving ? 40 : 30;
        let leap = Math.min(distance + buffer, 200);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.flickerCarenic(900);
        this.attack();
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * leap),
            y: this.y + (direction.y * leap),
            duration: 900,
            ease: 'Elastic',
            onComplete: () => { 
                if (this.touching.length > 0) {
                    for (let i = 0; i < this.touching.length; ++i) {
                        if (this.touching[i].name === 'player') {
                            this.scene.combatManager.writhe(this.touching[i].playerID, this.enemyID, 'leap');
                            this.scene.combatManager.useStamina(5);
                        } else { // CvC
                            this.scene.combatManager.computer({ type: 'Weapon', payload: { action: 'leap', origin: this.enemyID, enemyID: this.touching[i].enemyID } });
                        };
                    };
                };
                if (this.health > 0) this.stateMachine.setState(States.COMBAT);
            },
        });
        this.scrollingCombatText = this.scene.showCombatText('Leaping!', 900, 'damage', false, false, () => this.scrollingCombatText = undefined);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} launches through the air!`
            });
        };
    };
    onLeapUpdate = (_dt: number) => {};
    onLeapExit = () => this.evaluateCombatDistance();
    onLikyrEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Likyr', PLAYER.DURATIONS.LIKYR, 'damage');
    };
        
    onLikyrUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.LIKYR)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onLikyrExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.suture(20, this.targetID);
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} blends caeren into this world with Likyrish tendrils.`
                });
                screenShake(this.scene, 90);
            };
        } else { // CvC
            if (this.castingSuccess === true) this.suture(20, this.targetID);
        };
        this.enemySound('debuff', this.castingSuccess);
        this.stopCasting('Countered Likyr');
    };
    onMaierethEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Maiereth', PLAYER.DURATIONS.MAIERETH, 'damage');
    };
        
    onMaierethUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.MAIERETH)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onMaierethExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.sacrifice(30, this.targetID);
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) {
                    if (this.checkPlayerResist() === true) {
                        this.scene.combatManager.fear(this.targetID);
                    } else {
                        EventBus.emit('special-combat-text', {
                            playerSpecialDescription: `You resist the dread of the dripping Moon.` // Menses wink wink
                        });
                    };
                };
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} bleeds and strikes you with tendrils of Ma'anre.`
                });
                screenShake(this.scene, 90);
            };
        } else { // CvC
            if (this.castingSuccess === true) {
                this.sacrifice(30, this.targetID);
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) {
                    this.scene.combatManager.fear(this.targetID);
                };
            };
        };
        this.enemySound('spooky', this.castingSuccess);
        this.stopCasting('Countered Maiereth');
    };
    onParalyzeEnter = () => { 
        this.targetID = this.getTargetId();
        this.startCasting('Paralyzing', PLAYER.DURATIONS.PARALYZE, 'cast');
    };
    onParalyzeUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.PARALYZE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onParalyzeExit = () => {
        if (this.targetID === this.scene.player.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.paralyze(this.targetID);
                if (this.inCombat) EventBus.emit('enemy-combat-text', {
                    text: `${this.ascean.name} paralyzes you for several seconds!`
                });
            };
        } else {
            if (this.castingSuccess === true) this.scene.combatManager.paralyze(this.targetID);
        };
        this.enemySound('combat-round', this.castingSuccess);
        this.stopCasting('Paralyze Countered');
        this.instincts();
    };
    onPolymorphingEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Polymorphing', PLAYER.DURATIONS.POLYMORPH, 'cast');
    };
    onPolymorphingUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.POLYMORPH)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onPolymorphingExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.polymorph(this.targetID);
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} polymorphs you into a rabbit!`
                });
            };
        } else { // CvC
            if (this.castingSuccess === true) this.scene.combatManager.polymorph(this.targetID);
        };
        this.enemySound('combat-round', this.castingSuccess);
        this.stopCasting('Countered Polymorph');
        this.instincts();
    };

    onPursuitEnter = () => {
        if (this.inCombat) this.scene.sound.play('wild', { volume: this.scene.hud.settings.volume });
        if (this.currentTarget) {
            if (this.currentTarget.flipX) {
                this.setPosition(this.currentTarget.x + 16, this.currentTarget.y);
            } else {
                this.setPosition(this.currentTarget.x - 16, this.currentTarget.y);
            };
            if (this.isGlowing === false) {
                this.checkCaerenic(true);
                this.scene.time.delayedCall(500, () => {
                    this.checkCaerenic(false);
                }, undefined, this);
            }; 
        };
        this.instincts();
    };
    onPursuitUpdate = (_dt: number) => {};
    onPursuitExit = () => {};
    onQuorEnter = () => this.startCasting('Quor', PLAYER.DURATIONS.QUOR, 'cast');
    onQuorUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.QUOR)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onQuorExit = () => {
        if (this.castingSuccess === true) {
            this.particleEffect =  this.scene.particleManager.addEffect('quor', this, 'quor', true);
            if (this.inCombat) EventBus.emit('enemy-combat-text', {
                text: `${this.ascean.name}'s Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.castingSuccess = false;
            this.enemySound('freeze', true);
        };
        this.stopCasting('Countered Quor');
    };
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
    onReconstituteUpdate = (dt: number) => {
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
        if (this.isCasting === false || this.health <= 0 || this.isCounterSpelled === true) { // this.scene.state.computerWin === true || this.scene.state.playerWin === true ||
            this.isCasting = false;
            this.reconTimer?.remove(false);
            this.reconTimer = undefined;
            return;
        };
        const heal = Math.round(this.ascean.health.max * 0.15);
        const total = Math.min(this.health + heal, this.ascean.health.max);
        if (this.inCombat) {
            this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: total, id: this.enemyID }, type: 'Health' });
        } else { // inComputerCombat
            this.health = total;
            this.updateHealthBar(total);
            this.computerCombatSheet.newComputerHealth = total;
            this.scrollingCombatText = this.scene.showCombatText(`${heal}`, 1500, 'heal', false, false, () => this.scrollingCombatText = undefined);
            EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: total });
        };
        this.enemySound('phenomena', true);
        this.channelCount++;
        if (this.channelCount >= 5) {
            this.isCasting = false;
            this.channelCount = 0;
        };    
    };

    onRushEnter = () => {
        this.isCasting = true;
        this.isRushing = true;
        this.enemySound('stealth', true);
        if ((!this.currentTarget || !this.currentTarget.body) && this.health > 0) {
            this.isRushing = false;
            this.stateMachine.setState(States.CHASE);
            return;
        };
        const target = new Phaser.Math.Vector2(this.currentTarget.x, this.currentTarget.y);
        const direction = target.clone().subtract(this).normalize();
        const targetX = this.x + direction.x * 300;
        const targetY = this.y + direction.y * 300;

        const mapBounds = {
            minX: 32,
            maxX: this.scene.map.widthInPixels - 32,
            minY: 32,
            maxY: this.scene.map.heightInPixels - 32
        };

        const clampedX = Phaser.Math.Clamp(targetX, mapBounds.minX, mapBounds.maxX);
        const clampedY = Phaser.Math.Clamp(targetY, mapBounds.minY, mapBounds.maxY);

        this.flickerCarenic(500);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.isParrying = true;
        this.scene.tweens.add({
            targets: this,
            x: clampedX,
            y: clampedY,
            duration: 500,
            ease: 'Circ.easeOut',
            onComplete: () => this.rushComplete(),
        });         
        this.scrollingCombatText = this.scene.showCombatText('Rush', 900, 'cast', false, false, () => this.scrollingCombatText = undefined);
    };
    onRushUpdate = (_dt: number) => {};
    onRushExit = () => {
        this.rushedEnemies = [];
        this.isCasting = false;
        this.evaluateCombatDistance();
    };

    rushComplete = () => {
        if (this.rushedEnemies.length > 0) {
            for (let i = 0; i < this.rushedEnemies.length; ++i) {
                if (this.rushedEnemies[i].name === 'player') {
                    this.scene.combatManager.useStamina(5);
                    this.scene.combatManager.writhe(this.rushedEnemies[i].playerID, this.enemyID, 'rush');
                } else if (this.rushedEnemies[i].name === 'enemy' && this.inComputerCombat) { // CvC
                    this.scene.combatManager.computer({ type: 'Weapon', payload: { action: 'rush', origin: this.enemyID, enemyID: this.rushedEnemies[i].enemyID } });
                };
            };
        };
        this.isRushing = false;
        if (this.health > 0) this.stateMachine.setState(States.CHASE);
    };
    
    onSacrificeEnter = () => {
        this.specialCombatText = this.scene.showCombatText('Sacrifice', 750, 'effect', false, true, () => this.specialCombatText = undefined);
        if (this.currentTarget?.name === 'player') {
            if (this.checkPlayerResist() === false) return;
            this.scene.combatManager.useGrace(10);
        };
        const id = this.getTargetId(); 
        this.sacrifice(30, id);
        this.enemySound('combat-round', true);
        this.flickerCarenic(750);
    };
    onSacrificeUpdate = (_dt: number) => this.stateMachine.setState(States.CLEAN);
    onSacrificeExit = () => this.evaluateCombatDistance();
        
    onSlowingEnter = () => {
        this.specialCombatText = this.scene.showCombatText('Slow', 750, 'cast', false, true, () => this.specialCombatText = undefined);
        const id = this.getTargetId();
        if (this.currentTarget?.name === 'player') {
            if (this.checkPlayerResist() === false) return;
            this.scene.combatManager.slow(id, 3000);
            this.scene.combatManager.useGrace(10);
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} ensorcels your caeren, slowing you!`
            });
        } else { // CvC
            this.scene.combatManager.slow(id, 3000);
        };
        this.enemySound('debuff', true);
        this.flickerCarenic(500);
    };
    onSlowingUpdate = (_dt: number) => this.stateMachine.setState(States.CLEAN);
    onSlowingExit = () => this.evaluateCombatDistance();
    
    onSnaringEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting('Snaring', PLAYER.DURATIONS.SNARE, 'cast');
    };
    onSnaringUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
        if (this.isSuccessful(PLAYER.DURATIONS.SNARE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onSnaringExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.useGrace(10);
                this.scene.combatManager.snare(this.targetID);
                EventBus.emit('enemy-combat-text', {
                    computerSpecialDescription: `${this.ascean.name} ensorcels you into a snare!`
                }); 
                screenShake(this.scene, 90);
            };
        } else { // CvC
            this.scene.combatManager.snare(this.targetID);
        };
        this.enemySound('debuff', this.castingSuccess);
        this.stopCasting('Countered Snare');
        this.instincts();
    };

    onSutureEnter = () => {
        this.specialCombatText = this.scene.showCombatText('Suture', 750, 'effect', false, true, () => this.specialCombatText = undefined);
        if (this.currentTarget?.name === 'player') {
            if (this.checkPlayerResist() === false) return;    
            this.scene.combatManager.useGrace(10);
        };
        const id = this.getTargetId();
        this.suture(30, id);
        this.enemySound('debuff', true);
        this.flickerCarenic(750);
    };
    onSutureUpdate = (_dt: number) => this.stateMachine.setState(States.CLEAN);
    onSutureExit = () => this.evaluateCombatDistance();

    onDevourEnter = () => {
        this.startCasting('Devouring', PLAYER.DURATIONS.TSHAERAL, 'damage', true);
        this.targetID = this.getTargetId();
        if (this.currentTarget?.name === 'player') {
            if (this.checkPlayerResist() === false) return;
            this.scene.combatManager.useGrace(15);
        };
        this.enemySound('absorb', true);
        this.channelCount = 0;
        this.devourTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.isCasting === false || this.health <= 0 || this.isCounterSpelled === true) { // this.scene.state.computerWin || this.scene.state.playerWin || 
                    this.isCasting = false;
                    this.devourTimer?.remove(false);
                    this.devourTimer = undefined;
                    return;
                };
                this.devour(5, this.targetID);
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
    onDevourUpdate = (dt: number) => {
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

    onAbsorbEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.isAbsorbing = true;
        this.negationName = States.ABSORB;
        this.enemySound('absorb', true);
        this.specialCombatText = this.scene.showCombatText('Absorbing', 750, 'effect', false, true, () => this.specialCombatText = undefined);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'aqua', PLAYER.DURATIONS.ABSORB);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ABSORB, () => {
            this.isAbsorbing = false;    
            if (this.negationBubble) {
                this.negationBubble.destroy();
                this.negationBubble = undefined;
                if (this.negationName === States.ABSORB) this.negationName = '';
            };    
        }, undefined, this);
        if (this.inCombat) EventBus.emit('enemy-combat-text', {
            text: `${this.ascean.name} warps oncoming damage into grace.`
        });
    };
    onAbsorbUpdate = (_dt: number) => {if (!this.isAbsorbing) this.positiveMachine.setState(States.CLEAN);};
    absorb = () => {
        if (this.negationBubble === undefined || this.isAbsorbing === false) {
            if (this.negationBubble) {
                this.negationBubble.destroy();
                this.negationBubble = undefined;
            };
            this.isAbsorbing = false;
            return;
        };
        this.enemySound('absorb', true);
        this.specialCombatText = this.scene.showCombatText('Absorbed', 500, 'effect', false, true, () => this.specialCombatText = undefined);
        if (Math.random() < 0.2) {
            this.isAbsorbing = false;
        };
    };
    onChiomicEnter = () => {
        this.aoe = new AoE(this.scene, 'chiomic', 1, true, this);    
        this.specialCombatText = this.scene.showCombatText('Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect', false, true, () => this.specialCombatText = undefined);
        this.isChiomic = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.isChiomic = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} mocks and confuses their surrounding foes.`
            });
        };
        this.enemySound('death', true);
    };
    onChiomicUpdate = (_dt: number) => {if (!this.isChiomic) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.isDiseasing = true;
        this.aoe = new AoE(this.scene, 'tendril', 6, true, this);    
        this.specialCombatText = this.scene.showCombatText('Tendrils Swirl', 750, 'tendril', false, true, () => this.specialCombatText = undefined);
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.isDiseasing = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} swirls such sweet tendrils which wrap round and reach to writhe.`
            });
        };
        this.enemySound('dungeon', true);
    };
    onDiseaseUpdate = (_dt: number) => {if (!this.isDiseasing) this.positiveMachine.setState(States.CLEAN);};
    onDispelEnter = () => {
        if (this.currentTarget === undefined) return;
        this.enemySound('debuff', true);
        this.specialCombatText = this.scene.showCombatText('Dispelling', 750, 'effect', false, true, () => this.specialCombatText = undefined);
        this.flickerCarenic(1000); 
        this.currentTarget.clearBubbles();
        // this.currentTarget.clearPositiveEffects();
    };
    onDispelExit = () => {};
    onEnvelopEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.isEnveloping = true;
        this.enemySound('caerenic', true);
        this.specialCombatText = this.scene.showCombatText('Enveloping', 750, 'cast', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'blue', PLAYER.DURATIONS.ENVELOP);
        this.reactiveName = States.ENVELOP;
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.isEnveloping = false;    
            if (this.reactiveBubble !== undefined && this.reactiveName === States.ENVELOP) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };    
        }, undefined, this);
        if (this.inCombat) EventBus.emit('enemy-combat-text', {
            text: `${this.ascean.name} envelops themself, shirking oncoming attacks.`
        });
    };
    onEnvelopUpdate = (_dt: number) => {if (!this.isEnveloping) this.positiveMachine.setState(States.CLEAN);};
    envelop = () => {
        if (this.reactiveBubble === undefined || this.isEnveloping === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
            };
            this.isEnveloping = false;
            return;
        };
        this.enemySound('caerenic', true);
        this.specialCombatText = this.scene.showCombatText('Enveloped', 500, 'effect', false, true, () => this.specialCombatText = undefined);
        if (Math.random() < 0.2) {
            this.isEnveloping = false;
        };
    };
    onFreezeEnter = () => {
        this.aoe = new AoE(this.scene, 'freeze', 1, true, this);
        this.specialCombatText = this.scene.showCombatText('Freezing', PLAYER.DURATIONS.FREEZE, 'cast', false, true, () => this.specialCombatText = undefined);
        this.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.isFreezing = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} freezes nearby foes.`
            });
        };
        this.enemySound('freeze', true);
    };
    onFreezeUpdate = (_dt: number) => {if (!this.isFreezing) this.positiveMachine.setState(States.CLEAN);};

    onHowlEnter = () => {
        this.aoe = new AoE(this.scene, 'howl', 1, true, this);    
        this.specialCombatText = this.scene.showCombatText('Howling', PLAYER.DURATIONS.HOWL, 'damage', false, true, () => this.specialCombatText = undefined);
        this.isHowling = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.isHowling = false;
            this.instincts();
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} howls, it's otherworldly nature stunning nearby foes.`
            });
        };
        this.enemySound('howl', true);
    };
    onHowlUpdate = (_dt: number) => {if (!this.isHowling) this.positiveMachine.setState(States.CLEAN);};

    onMaliceEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MALICE;
        this.isMalicing = true;
        this.specialCombatText = this.scene.showCombatText('Malice', 750, 'hush', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MALICE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.isMalicing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MALICE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} wracks malicious foes with the hush of their own attack.`
            });
        };
        this.enemySound('debuff', true);
    };
    onMaliceUpdate = (_dt: number) => {if (!this.isMalicing) this.positiveMachine.setState(States.CLEAN);  };

    malice = (id: string) => {
        if (this.reactiveBubble === undefined || this.isMalicing === false || !this.inCombat) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMalicing = false;
            return;
        };
        this.specialCombatText = this.scene.showCombatText('Malice', 750, 'hush', false, true, () => this.specialCombatText = undefined);
        if (id === this.scene?.player?.playerID) { // Player Combat
            if (this.checkPlayerResist() === true) {
                this.chiomic(10, id);
            };
        } else { // Computer Combat
            this.chiomic(10, id);
        };
        this.enemySound('debuff', true);
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
        this.isMenacing = true;
        this.specialCombatText = this.scene.showCombatText('Menacing', 750, 'tendril', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'dread', PLAYER.DURATIONS.MENACE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MENACE, () => {
            this.isMenacing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MENACE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} seeks to menace oncoming attacks.`
            });
        };
        this.enemySound('scream', true);
    };
    onMenaceUpdate = (_dt: number) => {if (!this.isMenacing) this.positiveMachine.setState(States.CLEAN);};

    menace = (id: string) => {
        if (this.reactiveBubble === undefined || this.isMenacing === false || !this.inCombat) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMenacing = false;
            return;
        };
        this.specialCombatText = this.scene.showCombatText('Menacing', 500, 'tendril', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMenacing = false;
        };
        if (id === this.scene?.player?.playerID) {
            if (this.checkPlayerResist() === true) {
                this.scene.combatManager.fear(id);
            };
        } else {
            this.scene.combatManager.fear(id);
        };
        this.enemySound('caerenic', true);
    };

    onMendEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MEND;
        this.isMending = true;
        this.specialCombatText = this.scene.showCombatText('Mending', 750, 'tendril', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MEND);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.isMending = false;    
            if (this.reactiveBubble && this.reactiveName === States.MEND) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };    
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} seeks to mend oncoming attacks.`
            });
        };
        this.enemySound('caerenic', true);
    };
    onMendUpdate = (_dt: number) => {if (!this.isMending) this.positiveMachine.setState(States.CLEAN);};

    mend = (id: string) => {
        if (this.reactiveBubble === undefined || this.isMending === false || (!this.inCombat && !this.inComputerCombat)) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMending = false;
            return;
        };

        this.specialCombatText = this.scene.showCombatText('Mending', 500, 'tendril', false, true, () => this.specialCombatText = undefined);
        const mend = Phaser.Math.Between(this.healthbar.getTotal() * 0.075, this.healthbar.getTotal() * 0.125);
        const heal = Math.min(this.healthbar.getTotal(), this.health + mend);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isMending = false;
        };
        if (id === this.scene?.player?.playerID && this.isCurrentTarget) { // Player Combat
            this.scene.combatManager.combatMachine.action({ data: { key: 'enemy', value: heal, id: this.enemyID }, type: 'Health' });
        } else if (id === this.scene?.player?.playerID) { // Non Targerted Player Combat
            this.health = heal;
            this.updateHealthBar(heal);
            this.scrollingCombatText = this.scene.showCombatText(`${mend}`, 1500, 'heal', false, false, () => this.scrollingCombatText = undefined);
        } else { // Computer Combat
            this.health = heal;
            this.updateHealthBar(heal);
            this.scrollingCombatText = this.scene.showCombatText(`${mend}`, 1500, 'heal', false, false, () => this.scrollingCombatText = undefined);
            EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: heal });
        };
        this.computerCombatSheet.newComputerHealth = this.health;
        this.enemySound('caerenic', true);
    };

    onModerateEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MODERATE;
        this.enemySound('debuff', true);
        this.isModerating = true;
        this.specialCombatText = this.scene.showCombatText('Moderating', 750, 'cast', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'sapphire', PLAYER.DURATIONS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MODERATE, () => {
            this.isModerating = false;    
            if (this.reactiveBubble && this.reactiveName === States.MODERATE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        if (this.inCombat) EventBus.emit('enemy-combat-text', {
            text: `${this.ascean.name} seeks to moderate oncoming attacks.`
        });
    };
    onModerateUpdate = (_dt: number) => {if (!this.isModerating) this.positiveMachine.setState(States.CLEAN);};
    moderate = (id: string) => {
        if (id === '') return;
        if (this.reactiveBubble === undefined || this.isModerating === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isModerating = false;
            return;
        };
        this.scene.combatManager.slow(id);
        this.enemySound('debuff', true);
        this.specialCombatText = this.scene.showCombatText('Moderated', 500, 'tendril', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isModerating = false;
        };
    };

    onMultifariousEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MULTIFARIOUS;
        this.isMultifaring = true;
        this.specialCombatText = this.scene.showCombatText('Multifaring', 750, 'cast', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'ultramarine', PLAYER.DURATIONS.MULTIFARIOUS);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MULTIFARIOUS, () => {
            this.isMultifaring = false;    
            if (this.reactiveBubble && this.reactiveName === States.MULTIFARIOUS) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} seeks to multifare oncoming attacks.`
            });
        };
        this.enemySound('combat-round', true);
    };
    onMultifariousUpdate = (_dt: number) => {if (!this.isMultifaring) this.positiveMachine.setState(States.CLEAN);};

    multifarious = (id: string) => {
        if (this.reactiveBubble === undefined || this.isMultifaring === false || (!this.inCombat && !this.inComputerCombat)) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMultifaring = false;
            return;
        };
        this.specialCombatText = this.scene.showCombatText('Multifared', 500, 'cast', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMultifaring = false;
        };
        if (id === this.scene?.player?.playerID) {
            if (this.checkPlayerResist() === true) {
                this.scene.combatManager.polymorph(id);
            };
        } else {
            this.scene.combatManager.polymorph(id);
        };
        this.enemySound('combat-round', true);
    };

    onMystifyEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MYSTIFY;
        this.isMystifying = true;
        this.specialCombatText = this.scene.showCombatText('Mystifying', 750, 'effect', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'chartreuse', PLAYER.DURATIONS.MYSTIFY);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MYSTIFY, () => {
            this.isMystifying = false;    
            if (this.reactiveBubble && this.reactiveName === States.MYSTIFY) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} seeks to mystify oncoming attacks.`
            });
        };
        this.enemySound('debuff', true);
    };
    onMystifyUpdate = (_dt: number) => {if (!this.isMystifying) this.positiveMachine.setState(States.CLEAN);};

    mystify = (id: string) => {
        if (this.reactiveBubble === undefined || this.isMystifying === false || (!this.inCombat && !this.inComputerCombat)) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMystifying = false;
            return;
        };
        this.specialCombatText = this.scene.showCombatText('Mystified', 500, 'effect', false, true, () => this.specialCombatText = undefined);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMystifying = false;
        };
        if (id === this.scene?.player?.playerID) {
            if (this.checkPlayerResist() === true) {
                this.scene.combatManager.confuse(id);
            };
        } else {
            this.scene.combatManager.confuse(id);
        };
        this.enemySound('death', true);
    };

    onProtectEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.isProtecting = true;
        this.specialCombatText = this.scene.showCombatText('Protecting', 750, 'effect', false, true, () => this.specialCombatText = undefined);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'gold', PLAYER.DURATIONS.PROTECT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.isProtecting = false;    
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };    
        }, undefined, this);
        if (this.inCombat) {
            this.scene.sound.play('shield', { volume: this.scene.hud.settings.volume });
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} protects themself from oncoming attacks.`
            });
        };
    };
    onProtectUpdate = (_dt: number) => {if (!this.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRenewalEnter = () => {
        this.isRenewing = true;
        this.aoe = new AoE(this.scene, 'renewal', 6, false, this);    
        this.specialCombatText = this.scene.showCombatText('Hush Tears', 750, 'bone', false, true, () => this.specialCombatText = undefined);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.isRenewing = false;
        });
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
            });
        };
        this.enemySound('shield', true);
    };
    onRenewalUpdate = (_dt: number) => {if (this.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        if (!this.inCombat && !this.inComputerCombat) return;
        this.aoe = new AoE(this.scene, 'scream', 1, true, this);  
        this.specialCombatText = this.scene.showCombatText('Screaming', 750, 'hush', false, true, () => this.specialCombatText = undefined);
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} screams, fearing nearby foes.`
            });
        };
        this.enemySound('scream', true);
    };
    onScreamUpdate = (_dt: number) => {if (!this.isScreaming) this.positiveMachine.setState(States.CLEAN);};

    onShadowEnter = () => {
        this.isShadowing = true;
        this.enemySound('wild', true);
        this.specialCombatText = this.scene.showCombatText('Shadowing', DURATION.TEXT, 'damage', false, true, () => this.specialCombatText = undefined);
        this.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.isShadowing = false;
        }, undefined, this);
    };
    onShadowExit = () => {};
    pursue = (id: string) => {
        this.enemySound('wild', true);
        if (id === this.scene.player.playerID) {
            if (this.scene.player.flipX) {
                this.setPosition(this.scene.player.x + 16, this.scene.player.y);
            } else {
                this.setPosition(this.scene.player.x - 16, this.scene.player.y);
            };
        };
        const enemy = this.scene.enemies.find((e: Enemy) => e.enemyID === id) || this.scene.party.find((e: Party) => e.enemyID === id);
        if (!enemy) return;
        if (enemy.flipX) {
            this.setPosition(enemy.x + 16, enemy.y);
        } else {
            this.setPosition(enemy.x - 16, enemy.y);
        };
    };
    onShieldEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.negationName = States.SHIELD;
        this.isShielding = true;
        this.specialCombatText = this.scene.showCombatText('Shielding', 750, 'bone', false, true, () => this.specialCombatText = undefined);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.isShielding = false;    
            if (this.negationBubble && this.negationName === States.SHIELD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = '';
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} shields themself from oncoming attacks.`
            });
        };
        this.enemySound('shield', true);    
    };
    onShieldUpdate = (_dt: number) => {if (!this.isShielding)this.positiveMachine.setState(States.CLEAN);};

    shield = () => {
        if (this.negationBubble === undefined || this.isShielding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isShielding = false;
            return;
        };
        this.specialCombatText = this.scene.showCombatText('Shielded', 500, 'effect', false, true, () => this.specialCombatText = undefined);
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        if (this.negationBubble.charges <= 0) {
            this.specialCombatText = this.scene.showCombatText('Shield Broken', 500, 'damage', false, true, () => this.specialCombatText = undefined);
            this.isShielding = false;
        };
        this.enemySound('shield', true);
    };

    onShimmerEnter = () => {
        this.isShimmering = true; 
        this.stealthEffect(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            if (this.isShimmering) {
                this.isShimmering = false;
                this.stealthEffect(false);    
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} shimmers, fading in and out of this world.`
            });
        };
        this.enemySound('stealth', true);
    };
    onShimmerUpdate = (_dt: number) => {if (!this.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmer = () => {
        if (this.inCombat) this.scene.sound.play('stealth', { volume: this.scene.hud.settings.volume });
        this.specialCombatText = this.scene.showCombatText(`${this.ascean.name} simply wasn't there`, 500, 'effect', false, false, () => this.specialCombatText = undefined);
    };

    onShirkEnter = () => {
        this.isShirking = true;
        this.enemySound('blink', true);
        this.specialCombatText = this.scene.showCombatText('Shirking', 750, 'effect', false, true, () => this.specialCombatText = undefined);
        this.isConfused = false;
        this.isFeared = false;
        this.isParalyzed = false;
        this.isPolymorphed = false;
        this.isStunned = false;
        this.isSlowed = false;
        this.isSnared = false;
        this.isFrozen = false;
        this.isRooted = false;

        if (this.health > 0) this.stateMachine.setState(States.COMBAT);
        this.negativeMachine.setState(States.CLEAN);

        this.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.isShirking = false;
        }, undefined, this); 
        if (this.inCombat) EventBus.emit('enemy-combat-text', {
            text: `${this.ascean.name}'s caeren's hush grants reprieve, freeing them.`
        });
    };
    onShirkExit = () => {};

    onSprintEnter = () => {
        this.isSprinting = true;
        this.adjustSpeed(PLAYER.SPEED.SPRINT);
        if (this.isGlowing === false) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.isSprinting = false;
            if (this.isGlowing === true) this.checkCaerenic(false);
            this.adjustSpeed(-PLAYER.SPEED.SPRINT);
        });
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} taps into their caeren, bursting into an otherworldly sprint.`
            });
        };
        this.enemySound('blink', true);
    };
    onSprintUpdate = (_dt: number) => {if (!this.isSprinting) this.positiveMachine.setState(States.CLEAN);};
    onTetherEnter = () => {
        this.isTethering = true;
        this.enemySound('dungeon', true);
        this.specialCombatText = this.scene.showCombatText('Tethering', DURATION.TEXT, 'damage', false, true, () => this.specialCombatText = undefined);
        this.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.isTethering = false;
        }, undefined, this);
    };
    onTetherExit = () => {};

    tether = (id: string) => {
        this.enemySound('dungeon', true);
        if (this.scene.player.playerID === id) {
            this.hook(this.scene.player, 1000);
            return;    
        };
        const enemy = this.scene.enemies.find(e => e.enemyID === id) || this.scene.party.find(e => e.enemyID === id);
        if (!enemy) return;
        this.hook(enemy, 1000);
    };
    onWardEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.negationName = States.WARD;
        this.isWarding = true;
        this.specialCombatText = this.scene.showCombatText('Warding', 750, 'damage', false, true, () => this.specialCombatText = undefined);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'red', PLAYER.DURATIONS.WARD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.isWarding = false;    
            if (this.negationBubble && this.negationName === States.WARD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = '';
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name} wards themself from oncoming attacks.`
            });
        };
        this.enemySound('combat-round', true);
    };
    onWardUpdate = (_dt: number) => {if (!this.isWarding) this.positiveMachine.setState(States.CLEAN);};

    ward = (id: string) => {
        if (this.negationBubble === undefined || this.isWarding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isWarding = false;
            return;
        };
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        this.specialCombatText = this.scene.showCombatText('Warded', 500, 'effect', false, true, () => this.specialCombatText = undefined);
        if (this.negationBubble.charges <= 3) {
            this.specialCombatText = this.scene.showCombatText('Ward Broken', 500, 'damage', false, true, () => this.specialCombatText = undefined);
            this.negationBubble.setCharges(0);
            this.isWarding = false;
        };
        if (id === this.scene?.player?.playerID) {
            if (this.checkPlayerResist() === true) {
                this.scene.combatManager.stunned(id);
            };
        } else {
            this.scene.combatManager.stunned(id);
        };
        this.enemySound('parry', true);
    };

    onWritheEnter = () => {
        this.aoe = new AoE(this.scene, 'writhe', 1, true, this);    
        this.specialCombatText = this.scene.showCombatText('Writhing', 750, 'tendril', false, true, () => this.specialCombatText = undefined);
        this.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.isWrithing = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit('enemy-combat-text', {
                computerSpecialDescription: `${this.ascean.name}'s caeren grips their body and contorts, writhing around them.`
            });
        };
        this.enemySound('spooky', true);
    };
    onWritheUpdate = (_dt: number) => {if (!this.isWrithing) this.positiveMachine.setState(States.CLEAN);};

    // ========================== STEALTH ========================== \\

    stealthEffect = (stealth: boolean) => {
        if (stealth) {
            const getStealth = (object: any) => {
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
            const clearStealth = (object: any) => {
                if (!object) return;
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
        this.enemySound('stealth', true);
    };

    // ========================== STATUS EFFECT STATES ========================== \\

    onConfusedEnter = () => { 
        this.isConfused = true;
        this.specialCombatText = this.scene.showCombatText('c .OnFu`Se D~', DURATION.TEXT, 'effect', false, true, () => this.specialCombatText = undefined);
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
                    randomDirection();
                    this.specialCombatText = this.scene.showCombatText(confusions[Math.floor(Math.random() * confusions.length)], 1000, 'effect', false, false, () => this.specialCombatText = undefined);
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 

    };
    onConfusedUpdate = (_dt: number) => {
        this.combatChecker(this.isConfused);
        this.setVelocity(this.confuseVelocity.x, this.confuseVelocity.y);
        if (Math.abs(this.velocity?.x as number) > 0 || Math.abs(this.velocity?.y as number) > 0) {
            this.getDirection();
            this.anims.play(`player_running`, true);
        } else {
            this.anims.play(`player_idle`, true);
        };
    };
    onConfusedExit = () => { 
        if (this.isConfused) this.isConfused = false;
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
                if (this.currentTarget && this.currentTarget.body) {
                    const direction = this.currentTarget.position.subtract(this.position);
                    direction.normalize();
                    this.setVelocity(direction.x * (this.speed / 2), direction.y * (this.speed / 2)); // 0.75
                };
            },
            callbackScope: this,
            loop: true,
        });
    };
    onConsumedUpdate = (dt: number) => {
        this.anims.play('player_hurt', true);
        this.consumedDuration -= dt;
        if (this.consumedDuration <= 0) this.isConsumed = false;
        this.combatChecker(this.isConsumed);    
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
    onCounterSpelledUpdate = (_dt: number) => {
        this.anims.play('player_hurt', true);
        if (!this.isCounterSpelled) {
            if ((this.inCombat === true || this.inComputerCombat === true) && this.health > 0) {
                this.stateMachine.setState(States.COMBAT);
            } else if (this.health > 0) {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onCounterSpelledExit = () => this.setTint(ENEMY_COLOR);

    onFearedEnter = () => { 
        this.specialCombatText = this.scene.showCombatText('F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage', false, true, () => this.specialCombatText = undefined);
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
        const fears = ['Nooooooo!', '...ahhh!', 'c̶o̷m̷e̷ ̴h̴e̵r̶e̶', 'Stay Away!', 'Somebody HELP ME', 'g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓'];
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
                    this.specialCombatText = this.scene.showCombatText(fears[Math.floor(Math.random() * fears.length)], 1000, 'effect', false, false, () => this.specialCombatText = undefined);
                };
            },
            callbackScope: this,
            repeat: 3,
        });
    };
    onFearedUpdate = (_dt: number) => {
        this.combatChecker(this.isFeared);
        this.setVelocity(this.fearVelocity.x, this.fearVelocity.y);
        if (Math.abs(this.velocity?.x as number) > 0 || Math.abs(this.velocity?.y as number) > 0) {
            this.getDirection();
            this.anims.play(`player_running`, true);
        } else {
            this.anims.play(`player_idle`, true);
        };
    };
    onFearedExit = () => {
        this.enemyAnimation();
        this.spriteWeapon.setVisible(true);
        if (this.fearTimer) {
            this.fearTimer.destroy();
            this.fearTimer = undefined;
        };
        if (this.isGlowing === true) this.checkCaerenic(false);
    };

    onFrozenEnter = () => {
        if (this.isDeleting) return;
        this.specialCombatText = this.scene.showCombatText('Frozen', DURATION.TEXT, 'cast', false, true, () => this.specialCombatText = undefined);
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
                    this.negativeMachine.setState(States.CLEAN);
                } else {
                    this.negativeMachine.setState(States.CLEAN);
                    this.negativeMachine.setState(States.FROZEN);
                };
            },
            callbackScope: this,
            loop: false,
        });
    };
    onFrozenUpdate = (_dt: number) => {}; // this.combatChecker(this.isFrozen); 
    onFrozenExit = () => {
        if (this.isDeleting) return;
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.setStatic(false);
    };

    onHurtEnter = () => {
        if (this.isDeleting) return;
        this.clearAnimations();
        this.clearTint();
        this.setStatic(true);
        this.hurtTime = 0;
    };
    onHurtUpdate = (dt: number) => {
        this.hurtTime += dt;
        if (this.hurtTime >= 500) this.isHurt = false;
        this.anims.play('player_hurt', true);
        if (!this.isHurt) {
            if ((this.inCombat === true || this.inComputerCombat === true) && this.health > 0) {
                this.stateMachine.setState(States.COMBAT);
            } else if (this.health > 0) {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onHurtExit = () => {
        if (this.isDeleting) return;
        this.setTint(ENEMY_COLOR);
        this.setStatic(false);
    };

    onParalyzedEnter = () => {
        if (this.isDeleting) return;
        this.specialCombatText = this.scene.showCombatText('Paralyzed', DURATION.TEXT, 'effect', false, true, () => this.specialCombatText = undefined);
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
            if (this.count.paralyzed <= 0 || this.health <= 0) {
                this.count.paralyzed = 0;
                this.isParalyzed = false;
            } else {
                this.stateMachine.setState(States.COMBAT);
            };
        }, undefined, this);
    };
    onParalyzedUpdate = (_dt: number) => this.combatChecker(this.isParalyzed); 
    onParalyzedExit = () => {
        if (this.isDeleting) return;
        this.setTint(this.setEnemyColor());
        this.setStatic(false);
        this.anims.resume();
    };

    onPolymorphEnter = () => {
        this.isPolymorphed = true;
        this.specialCombatText = this.scene.showCombatText('Polymorphed', DURATION.TEXT, 'effect', false, true, () => this.specialCombatText = undefined);
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
                    this.specialCombatText = this.scene.showCombatText('...thump', 1000, 'effect', false, false, () => this.specialCombatText = undefined);
                    if (!this.specialPolymorph) {
                        if (this.isCurrentTarget && this.health < this.ascean.health.max) {
                            this.health = (this.health + (this.ascean.health.max * 0.15)) > this.ascean.health.max ? this.ascean.health.max : (this.health + (this.ascean.health.max * 0.15));
                            if (this.isCurrentTarget) {
                                this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: this.health, id: this.enemyID } });
                            };
                        } else if (this.health < this.ascean.health.max) {
                            this.health = this.health + (this.ascean.health.max * 0.15);
                            this.updateHealthBar(this.health);
                        };
                        this.computerCombatSheet.newComputerHealth = this.health;
                        EventBus.emit(COMPUTER_BROADCAST, { id: this.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.health });
                    };
                };
            },
            callbackScope: this,
            repeat: 10,
        }); 
    };
    onPolymorphUpdate = (_dt: number) => {
        this.combatChecker(this.isPolymorphed);
        this.anims.play(`rabbit_${this.polymorphMovement}_${this.polymorphDirection}`, true);
        this.setVelocity(this.polymorphVelocity.x, this.polymorphVelocity.y);
    };
    onPolymorphExit = () => { 
        if (this.isPolymorphed) this.isPolymorphed = false;
        this.clearAnimations();
        this.enemyAnimation();
        this.setTint(ENEMY_COLOR);
        this.spriteWeapon.setVisible(true);
        if (this.polymorphTimer) {
            this.polymorphTimer.destroy();
            this.polymorphTimer = undefined;
        };
    };

    onStunnedEnter = () => {
        if (this.isDeleting) return;
        this.specialCombatText = this.scene.showCombatText('Stunned', 2500, 'effect', false, true, () => this.specialCombatText = undefined);
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
            if (this.count.stunned <= 0 || this.health <= 0) {
                this.count.stunned = 0;
                this.isStunned = false;
            } else {
                this.stateMachine.setState(States.COMBAT);
            };
        }, undefined, this);

    };
    onStunnedUpdate = (_dt: number) => {
        this.setVelocity(0);
        this.combatChecker(this.isStunned);
    };
    onStunnedExit = () => { 
        if (this.isDeleting) return;
        this.setTint(this.setEnemyColor());
        this.setStatic(false);
        this.anims.resume();
    };

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onRootedEnter = () => {
        if (this.isDeleting) return;
        this.specialCombatText = this.scene.showCombatText('Rooted', DURATION.TEXT, 'effect', false, true, () => this.specialCombatText = undefined);
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
    onRootedUpdate = (_dt: number) => {
        this.anims.play('player_idle', true);
        // this.combatChecker(this.isRooted);
    };
    onRootedExit = () => {
        if (this.isDeleting) return;
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.setStatic(false);
        this.evaluateCombatDistance();
    };

    onSlowedEnter = () => {
        this.specialCombatText = this.scene.showCombatText('Slowed', DURATION.TEXT, 'effect', false, true, () => this.specialCombatText = undefined);
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
    onSlowedExit = () => {
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.adjustSpeed(PLAYER.SPEED.SLOW);
    };

    onSnaredEnter = () => {
        this.specialCombatText = this.scene.showCombatText('Snared', DURATION.TEXT, 'effect', false, true, () => this.specialCombatText = undefined);
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
    onSnaredExit = () => { 
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        this.adjustSpeed(PLAYER.SPEED.SNARE);
    };

    killParticle = () => {
        this.scene.particleManager.removeEffect(this.particleEffect?.id as string);
        this.particleEffect = undefined;
    };

    enemyActionSuccess = () => {
        if (!this.attackedTarget) return;
        if (this.attackedTarget?.name === 'player') {
           if (this.isRanged) this.scene.combatManager.checkPlayerSuccess();
           const shimmer = Math.random() * 101;
            if (this.attackedTarget.isAbsorbing || this.attackedTarget.isEnveloping || this.attackedTarget.isShielding || (this.attackedTarget.isShimmering && shimmer > 50) || this.attackedTarget.isWarding) {
                if (this.attackedTarget.isAbsorbing === true) this.attackedTarget.playerMachine.absorb();
                if (this.attackedTarget.isEnveloping === true) this.attackedTarget.playerMachine.envelop();
                if (this.attackedTarget.isShielding === true) this.attackedTarget.playerMachine.shield();
                if (this.attackedTarget.isShimmering === true) this.attackedTarget.playerMachine.shimmer();
                if (this.attackedTarget.isWarding === true) this.attackedTarget.playerMachine.ward(this.enemyID);
                if (this.particleEffect) this.killParticle();
                this.attackedTarget = undefined;
                return;
            };
            if (this.particleEffect) {
                if (this.isCurrentTarget) {
                    this.scene.combatManager.combatMachine.action({ type: 'Weapon', data: { key: COMPUTER_ACTION, value: this.particleEffect.action, id: this.enemyID } });
                } else {
                    this.scene.combatManager.combatMachine.action({ type: 'Enemy', data: { enemyID: this.enemyID, ascean: this.ascean, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.particleEffect.action, parry: this.parryAction, id: this.enemyID }}});
                };
                const action = this.particleEffect.action;
                this.killParticle();
                if (action === 'hook') {
                    this.hook(this.attackedTarget, 1500);
                    return;
                };
            } else {
                if (this.isCurrentTarget) {
                    if (this.currentAction === '') return;
                    this.scene.combatManager.combatMachine.action({ type: 'Weapon', data: { key: COMPUTER_ACTION, value: this.currentAction, id: this.enemyID } });
                } else {
                    this.scene.combatManager.combatMachine.action({ type: 'Enemy', data: { enemyID: this.enemyID, ascean: this.ascean, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.currentAction, parry: this.parryAction, id: this.enemyID }}});
                };
            }; 
            this.scene.combatManager.useStamina(1);
            if (this.attackedTarget.isMenacing || this.attackedTarget.isModerating || this.attackedTarget.isMultifaring || this.attackedTarget.isMystifying) {
                this.attackedTarget.reactiveTarget = this.enemyID;
            };
            if (this.attackedTarget.isShadowing === true) this.attackedTarget.playerMachine.pursue(this.enemyID);
            if (this.attackedTarget.isTethering === true) this.attackedTarget.playerMachine.tether(this.enemyID);
        } else { // CvC
            const shimmer = Math.random() * 101;
            if (this.attackedTarget.isAbsorbing || this.attackedTarget.isEnveloping || this.attackedTarget.isShielding || (this.attackedTarget.isShimmering && shimmer > 50) || this.attackedTarget.isWarding) {
                if (this.attackedTarget.isAbsorbing === true) this.attackedTarget.absorb();
                if (this.attackedTarget.isEnveloping === true) this.attackedTarget.envelop();
                if (this.attackedTarget.isShielding === true) this.attackedTarget.shield();
                if (this.attackedTarget.isShimmering === true) this.attackedTarget.shimmer();
                if (this.attackedTarget.isWarding === true) this.attackedTarget.ward(this.enemyID);
                if (this.particleEffect) this.killParticle();
                this.attackedTarget = undefined;
                return;
            };
            if (this.particleEffect) {
                this.scene.combatManager.computer({ type: 'Weapon', payload: { action: this.particleEffect.action, origin: this.enemyID, enemyID: this.attackedTarget.enemyID } });
                const action = this.particleEffect.action;
                this.killParticle();
                if (action === 'hook') {
                    this.hook(this.attackedTarget, 1500);
                    return;
                };
            } else {
                if (this.currentAction === '') return;
                this.scene.combatManager.computer({ type: 'Weapon', payload: { action: this.currentAction, origin: this.enemyID, enemyID: this.attackedTarget.enemyID } });
            };
            if (this.attackedTarget.isMenacing === true) this.attackedTarget.menace(this.enemyID);
            if (this.attackedTarget.isModerating === true) this.attackedTarget.moderate(this.enemyID);
            if (this.attackedTarget.isMultifaring === true) this.attackedTarget.multifarious(this.enemyID);
            if (this.attackedTarget.isMystifying === true) this.attackedTarget.mystify(this.enemyID);
            if (this.attackedTarget.isShadowing === true) this.attackedTarget.pursue(this.enemyID);
            if (this.attackedTarget.isTethering === true) this.attackedTarget.tether(this.enemyID);
        };
        this.attackedTarget = undefined;
    };

    enemyDodge = () => {
        this.dodgeCooldown = 50; // Was a 6x Mult for Dodge Prev aka 1728
        let currentDistance = 0;
        const dodgeLoop = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= DURATION.DODGE || currentDistance >= DISTANCE.DODGE) {
                this.spriteWeapon.setVisible(true);
                this.dodgeCooldown = 0;
                this.isDodging = false;
                this.currentAction = '';
                return;
            };
            const direction = !this.flipX ? -(DISTANCE.DODGE / DURATION.DODGE) : (DISTANCE.DODGE / DURATION.DODGE);
            if (Math.abs(this.velocity?.x as number) > 0.1) this.setVelocityX(direction);
            if (this.velocity?.y as number > 0.1) this.setVelocityY(DISTANCE.DODGE / DURATION.DODGE);
            if (this.velocity?.y as number < -0.1) this.setVelocityY(-DISTANCE.DODGE / DURATION.DODGE);
            currentDistance += Math.abs(DISTANCE.DODGE / DURATION.DODGE);
            requestAnimationFrame(dodgeLoop);
        };
        let startTime: any = undefined;
        requestAnimationFrame(dodgeLoop);
    };

    enemyRoll = () => {
        this.rollCooldown = 50; // Was a x7 Mult for Roll Prev aka 2240
        let currentDistance = 0;
        const rollLoop = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= DURATION.ROLL || currentDistance >= DISTANCE.ROLL) {
                this.spriteWeapon.setVisible(true);
                this.rollCooldown = 0;
                this.isRolling = false;
                this.currentAction = '';
                return;
            };
            const direction = this.flipX ? -(DISTANCE.ROLL / DURATION.ROLL) : (DISTANCE.ROLL / DURATION.ROLL);
            if (Math.abs(this.velocity?.x as number) > 0.1) this.setVelocityX(direction);
            if (this.velocity?.y as number > 0.1) this.setVelocityY(DISTANCE.ROLL / DURATION.ROLL);
            if (this.velocity?.y as number < -0.1) this.setVelocityY(-DISTANCE.ROLL / DURATION.ROLL);
            currentDistance += Math.abs(DISTANCE.ROLL / DURATION.ROLL);
            requestAnimationFrame(rollLoop);
        };
        let startTime: any = undefined;
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

    swingMomentum = (target: Player | Enemy) => {
        if (!target || !target.body) return;
        let direction = target.position.subtract(this.position);
        direction.normalize();
        this.setVelocity(direction.x * DISTANCE.MOMENTUM, direction.y * DISTANCE.MOMENTUM);
    };

    checkLineOfSight() {
        const line = new Phaser.Geom.Line(this.currentTarget?.x, this.currentTarget?.y, this.x, this.y);
        const points = line.getPoints(30);  // Adjust number of points based on precision
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const layer = (this.scene as Arena | Underground).groundLayer;
            const tile = this.scene.map.getTileAtWorldXY(point.x, point.y, false, this.scene.cameras.main, layer);
            if (tile && tile.properties.wall) {
                return true;  // Wall is detected
            };
        };
        return false;  // Clear line of sight
    };

    evaluateCombatDistance = () => {
        if (this.isCasting || this.isSuffering() || this.isHurt || this.isContemplating || this.isDeleting || this.isDefeated || this.stateMachine.isCurrentState(States.DEFEATED)) return;
        if (this.currentTarget === undefined || this.currentTarget.body === undefined || (this.inCombat === false && this.inComputerCombat === false) || (this.inCombat && this.scene.state.newPlayerHealth <= 0) || this.health <= 0) {
            if (this.inComputerCombat || this.currentTarget) {
                const enemy = this.computerEnemyAttacker();
                if (enemy) {
                    this.checkComputerEnemyCombatEnter(enemy);
                    return;
                };
            };
            if (this.health > 0 && !this.stateMachine.isCurrentState(States.LEASH)) {
                // console.log(`${this.ascean.name} LEASHING in evaluateCombatDistance. State: ${this.stateMachine.getCurrentState()?.toUpperCase()}`);
                this.stateMachine.setState(States.LEASH);
            };
            this.inCombat = false;
            this.inComputerCombat = false;
            return;
        };
        let direction = this.currentTarget.position.subtract(this.position);
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
            if (this.currentTarget.position.subtract(this.position).length() > DISTANCE.THRESHOLD * multiplier) { // 225-525 
                this.enemyAnimation();
                direction.normalize();
                this.setVelocityX(direction.x * this.speed * (this.isClimbing ? 0.65 : 1)); // 2.25
                this.setVelocityY(direction.y * this.speed * (this.isClimbing ? 0.65 : 1)); // 2.25          
            } else if (this.currentTarget.position.subtract(this.position).length() < DISTANCE.THRESHOLD && !this.currentTarget.isRanged) { // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
                this.enemyAnimation();
                if (Phaser.Math.Between(1, 250) === 1 && !this.stateMachine.isCurrentState(States.EVADE)) {
                    this.stateMachine.setState(States.EVADE);
                    return;
                } else {
                    direction.normalize();
                    this.setVelocityX(direction.x * -this.speed + 0.5); // -2.25 | -2 | -1.75
                    this.setVelocityY(direction.y * -this.speed + 0.5); // -1.5 | -1.25
                };
                direction.normalize();
                this.setVelocityX(direction.x * -this.speed * (this.isClimbing ? 0.65 : 1)); // -2.25 | -2 | -1.75
                this.setVelocityY(direction.y * -this.speed * (this.isClimbing ? 0.65 : 1)); // -1.5 | -1.25
            } else if (this.checkLineOfSight() && !this.stateMachine.isCurrentState(States.EVADE)) {
                this.stateMachine.setState(States.EVADE);
                return;
            } else if (distanceY < 15) { // The Sweet Spot for RANGED ENEMIES.
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

    checkEvasion = (particle: Particle) => {
        const particleVector = new Phaser.Math.Vector2(particle.effect.x, particle.effect.y);
        const enemyVector = new Phaser.Math.Vector2(this.x, this.y);
        const particleDistance = particleVector.subtract(enemyVector);
        if (particleDistance.length() < (DISTANCE.THRESHOLD - 25) && !this.isPosted && !this.isCasting) { // 50 || 100
            return true;
        };
        return false;
    };

    getEnemyParticle = () => {
        return this.currentTarget?.particleEffect
            ? this.scene.particleManager.getEffect(this.currentTarget.particleEffect.id)
            : undefined;
    };

    isUnderRangedAttack = () => {
        const p = this.getEnemyParticle();
        if (!p) return false;
        return (this.currentTarget.isRanged && this.checkEvasion(p) && !this.stateMachine.isCurrentState(States.EVADE));
    };

    currentTargetCheck = () => {
        this.isCurrentTarget = this.enemyID === this.scene.state.enemyID;
    };

    currentWeaponCheck = () => {
        if (this.spriteWeapon && this.spriteShield && this.body) {
            this.spriteWeapon.setPosition(this.x, this.y);
            this.spriteShield.setPosition(this.x, this.y);
            this.functionality('enemy', this.currentTarget);
        };
        if (!this.currentWeapon || this.currentWeaponSprite === this.imgSprite(this.currentWeapon)) return; // || this.enemyID !== this.scene.state.enemyID
        this.currentWeaponSprite = this.imgSprite(this.currentWeapon);
        this.spriteWeapon.setTexture(this.currentWeaponSprite);
        this.spriteWeapon.setScale(GRIP_SCALE[this.currentWeapon.grip as keyof typeof GRIP_SCALE]);
    };

    currentParticleCheck = () => {
        if (!this.particleEffect?.triggered) this.scene.particleManager.updateParticle(this.particleEffect as Particle);
        if (this.particleEffect?.success) {
            this.particleEffect.triggered = true;
            this.particleEffect.success = false;
            this.enemyActionSuccess();
        } else if (this.particleEffect?.collided) {
            this.scene.particleManager.removeEffect(this.particleEffect?.id as string);
            this.particleEffect = undefined;              
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

    cleanCombatAnimation = () => this.stateMachine.isCurrentState(States.COMBAT) || this.stateMachine.isCurrentState(States.CHASE);
    
    evaluateEnemyState = () => {
        if (this.body) {
            this.currentWeaponCheck();
            if (this.healthbar) this.healthbar.update(this);
            if (this.scrollingCombatText) this.scrollingCombatText.update(this);
            if (this.specialCombatText) this.specialCombatText.update(this); 
            if (this.reactiveBubble) this.reactiveBubble.update(this.x, this.y);
            if (this.negationBubble) this.negationBubble.update(this.x, this.y);
        };
        if (this.health <= 0 && !this.stateMachine.isCurrentState(States.DEFEATED)) {
            this.stateMachine.setState(States.DEFEATED);
            return;
        };
        if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) return;
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
        if (this.isHurt && !this.sansSuffering('isHurt') && !this.stateMachine.isCurrentState(States.HURT)) {
            this.stateMachine.setState(States.HURT);
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
        if (this.isSuffering() === true || this.isCasting === true || this.isHurt === true || this.isContemplating === true) return;
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
            case 'contemplate':
                this.stateMachine.setState(States.CONTEMPLATE);
                break;
            default: break;                        
        }; 
    };
 
    update(dt: number) {
        this.evaluateEnemyState(); 
        this.positiveMachine.update(dt);   
        this.stateMachine.update(dt);
        this.negativeMachine.update(dt);
    };

    evaluateCombat = () => {  
        let actionNumber = Math.floor(Math.random() * 101);
        if (actionNumber > PLAYER.ACTION_WEIGHT.ATTACK) { // 61-100 (40%) || (100 - computerActions.attack)
            return States.ATTACK;
        } else if (actionNumber > PLAYER.ACTION_WEIGHT.POSTURE) { // 46-60 (15%) || (100 - computerActions.attack - computerActions.parry - computerActions.posture)
            return States.POSTURE;
        } else if (actionNumber > PLAYER.ACTION_WEIGHT.ROLL) { // 31-45 (15%) || (100 - computerActions.attack - computerActions.parry - computerActions.posture - computerActions.roll)
            return States.ROLL;
        } else if (actionNumber > PLAYER.ACTION_WEIGHT.PARRY && !this.isRanged) { // 21-30 (10%) || (100 - computerActions.attack - computerActions.parry)
            return States.PARRY;
        } else if (actionNumber > PLAYER.ACTION_WEIGHT.THRUST) { // 6-20 (15%) || 6-30 (this.isRanged) (25%)
            return States.THRUST;
        } else { // New State 1-5 (5%)
            return States.CONTEMPLATE;
        };
    };
};