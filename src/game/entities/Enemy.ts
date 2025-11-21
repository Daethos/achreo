import Entity, { calculateThreat, ENEMY, FRAMES, Player_Scene, SWING_FORCE, SWING_FORCE_ATTRIBUTE } from "./Entity"; 
import StateMachine, { specialPositiveMachines, States } from "../phaser/StateMachine";
import HealthBar from "../phaser/HealthBar";
import { EventBus } from "../EventBus";
import { v4 as uuidv4 } from "uuid";
import { PLAYER, ENEMY_ENEMIES, FACTION } from "../../utility/player";
import CastingBar from "../phaser/CastingBar";
import Bubble from "../phaser/Bubble";
import { BROADCAST_DEATH, DISTANCE, DURATION, ENEMY_AOE, ENEMY_RANGED, ENEMY_SPECIAL, getAnEnemy, GRIP_SCALE, HEALS, HELP, INSTINCTS, MIND_STATES, RANGE } from "../../utility/enemy";
import { screenShake, vibrate } from "../phaser/ScreenShake";
import Player from "./Player";
import Equipment, { randomFloatFromInterval } from "../../models/equipment";
import { Particle } from "../matter/ParticleManager";
import { Compiler } from "../../utility/ascean";
import Beam from "../matter/Beam";
import { Play } from "../main";
import { ComputerCombat, initComputerCombat } from "../../stores/computer";
import { ArenaView } from "../scenes/ArenaCvC";
import StatusEffect from "../../utility/prayer";
import Party from "./PartyComputer";
import { BONE, CAST, DAMAGE, EFFECT, HEAL } from "../phaser/ScrollingCombatText";
import { ENTITY_FLAGS } from "../phaser/Collision";
import { CHUNK_SIZE } from "../scenes/Game";
import { CacheDirection, CombatContext, MindState, MindStates } from "../phaser/MindState";
import { CHIOMISM, DEVOUR, SACRIFICE, SUTURE } from "../../utility/combatTypes";
import { HitLocation } from "../phaser/HitDetection";
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
const HEALTH = "Health";
const NAME = "enemy";
const COMPUTER_ACTION = "computerAction";
const ENEMY_COLOR = 0xFF0000;
const TARGET_COLOR = 0xFFFF00;
const MAX_HEARING_DISTANCE = 500;
const MIN_HEARING_DISTANCE = 100;

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
    playerTrait: string = "";
    currentWeapon: any = undefined;
    isCurrentTarget: boolean = false;
    parryAction: string = "";
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
    reactiveName: string = "";
    isHowling: boolean = false;
    isRenewing: boolean = false;
    negationName: string = "";
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
    targetID: string = "";
    defeatedTime: number = 120000;
    killingBlow: string = "";
    hookTime: number = 0;
    spellName: string = "";
    specialPolymorph: boolean = false;
    specialConfuse: boolean = false;
    confuseCount: number = 0;
    specialFear: boolean = false;
    defeatedByPlayer: boolean = false;
    isDying: boolean = false;
    distanceToPlayer: number = 0;
    lastDistanceFrame: number = 0;
    cachedDirectionFrame: number = 0;
    combatContextFrame: number = 0;
    weaponTypeCacheFrame: number = 0;
    cachedDirection: any = undefined;
    chunkX: number = 0;
    chunkY: number = 0;
    mindState: MindState;
    mindStateName: string;
    combatContext: CombatContext | undefined = undefined;
    acc: 0;
    isHostile: boolean;
    isNetted: boolean = false;

    constructor(data: { scene: Play, x: number, y: number, texture: string, frame: string, data: Compiler | undefined }) {
        super({ ...data, name: NAME, ascean: undefined, health: 1 }); 
        this.scene.add.existing(this);
        this.enemyID = uuidv4();
        if (data === undefined || data.data === undefined) {
            // this.createEnemy();
            this.createTheEnemy();
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
            this.potentialEnemies = ENEMY_ENEMIES[this.ascean.name] || [];
        };
        this.setTint(ENEMY_COLOR);
        this.stateMachine = new StateMachine(this, NAME);
        this.stateMachine
            .addState(States.IDLE, { onEnter: this.onIdleEnter, onUpdate: this.onIdleUpdate, onExit: this.onIdleExit })
            .addState(States.PATROL, { onEnter: this.onPatrolEnter, onUpdate: this.onPatrolUpdate, onExit: this.onPatrolExit })
            .addState(States.AWARE, { onEnter: this.onAwarenessEnter, onUpdate: this.onAwarenessUpdate, onExit: this.onAwarenessExit })
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.COMBAT, { onEnter: this.onCombatEnter, onUpdate: this.onCombatUpdate }) // , onExit: this.onCombatExit
            .addState(States.CONTEMPLATE, { onEnter: this.onContemplateEnter, onExit: this.onContemplateExit }) // , onUpdate: this.onContemplateUpdate
            .addState(States.EVADE, { onEnter: this.onEvasionEnter, onUpdate: this.onEvasionUpdate, onExit: this.onEvasionExit })
            .addState(States.LEASH, { onEnter: this.onLeashEnter, onUpdate: this.onLeashUpdate, onExit: this.onLeashExit })
            .addState(States.HELP, { onEnter: this.onHelpEnter, onUpdate: this.onHelpUpdate, onExit: this.onHelpExit })
            .addState(States.HOSTILE, { onEnter: this.onHostileEnter, onUpdate: this.onHostileUpdate, onExit: this.onHostileExit })
            .addState(States.SUMMON, { onEnter: this.onSummonEnter, onUpdate: this.onSummonUpdate, onExit: this.onSummonExit })
            .addState(States.KNOCKBACK, { onEnter: this.onPushbackEnter, onUpdate: this.onPushbackUpdate, onExit: this.onPushbackExit })
            .addState(States.ATTACK, { onEnter: this.onAttackEnter, onUpdate: this.onAttackUpdate, onExit: this.onAttackExit })
            .addState(States.PARRY, { onEnter: this.onParryEnter, onUpdate: this.onParryUpdate, onExit: this.onParryExit })
            .addState(States.THRUST, { onEnter: this.onThrustEnter, onUpdate: this.onThrustUpdate, onExit: this.onThrustExit })
            .addState(States.DODGE, { onEnter: this.onDodgeEnter, onUpdate: this.onDodgeUpdate, onExit: this.onDodgeExit })
            .addState(States.POSTURE, { onEnter: this.onPostureEnter, onUpdate: this.onPostureUpdate, onExit: this.onPostureExit })
            .addState(States.ROLL, { onEnter: this.onRollEnter, onUpdate: this.onRollUpdate, onExit: this.onRollExit }) // ===== Negative States =====
            .addState(States.CONFUSED, { onEnter: this.onConfusedEnter, onUpdate: this.onConfusedUpdate, onExit: this.onConfusedExit })
            .addState(States.COUNTERSPELLED, { onEnter: this.onCounterSpelledEnter, onUpdate: this.onCounterSpelledUpdate, onExit: this.onCounterSpelledExit })
            .addState(States.FEARED, { onEnter: this.onFearedEnter, onUpdate: this.onFearedUpdate, onExit: this.onFearedExit })
            .addState(States.PARALYZED, { onEnter: this.onParalyzedEnter, onUpdate: this.onParalyzedUpdate, onExit: this.onParalyzedExit })
            .addState(States.POLYMORPHED, { onEnter: this.onPolymorphedEnter, onUpdate: this.onPolymorphedUpdate, onExit: this.onPolymorphedExit })
            .addState(States.STUNNED, { onEnter: this.onStunnedEnter, onUpdate: this.onStunnedUpdate, onExit: this.onStunnedExit })
            .addState(States.CONSUMED, { onEnter: this.onConsumedEnter, onUpdate: this.onConsumedUpdate, onExit: this.onConsumedExit })
            .addState(States.HURT, { onEnter: this.onHurtEnter, onUpdate: this.onHurtUpdate, onExit: this.onHurtExit })
            .addState(States.DESTROY, { onEnter: this.onDestroyEnter, onUpdate: this.onDestroyUpdate })
            .addState(States.DEATH, { onEnter: this.onDeathEnter }) // , onUpdate: this.onDeathUpdate
            .addState(States.DEFEATED, { onEnter: this.onDefeatedEnter, onUpdate: this.onDefeatedUpdate, onExit: this.onDefeatedExit }) // ====== Special States ======
            .addState(States.ACHIRE, { onEnter: this.onAchireEnter, onUpdate: this.onAchireUpdate, onExit: this.onAchireExit })
            .addState(States.ASTRAVE, { onEnter: this.onAstraveEnter, onUpdate: this.onAstraveUpdate, onExit: this.onAstraveExit })
            .addState(States.BLINK, { onEnter: this.onBlinkEnter, onUpdate: this.onBlinkUpdate, onExit: this.onBlinkExit })
            .addState(States.CHIOMISM, { onEnter: this.onChiomismEnter, onUpdate: this.onChiomismUpdate, onExit: this.onChiomismExit })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onUpdate: this.onDesperationUpdate, onExit: this.onDesperationExit })
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
        this.positiveMachine = new StateMachine(this, NAME);
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
            .addState(States.SHADOW, { onEnter: this.onShadowEnter }) // , onExit: this.onShadowExit
            .addState(States.SHIRK, { onEnter: this.onShirkEnter }) // , onExit: this.onShirkExit
            .addState(States.TETHER, { onEnter: this.onTetherEnter }) // , onExit: this.onTetherExit
            .addState(States.WARD, { onEnter: this.onWardEnter, onUpdate: this.onWardUpdate })
            .addState(States.WRITHE, { onEnter: this.onWritheEnter, onUpdate: this.onWritheUpdate }); 
        // ========== NEGATIVE META STATES ========== \\
        this.negativeMachine = new StateMachine(this, NAME);
        this.negativeMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.FROZEN, { onEnter: this.onFrozenEnter, onUpdate: this.onFrozenUpdate, onExit: this.onFrozenExit })
            .addState(States.ROOTED, { onEnter: this.onRootedEnter, onUpdate: this.onRootedUpdate, onExit: this.onRootedExit })
            .addState(States.SLOWED, { onEnter: this.onSlowedEnter, onExit: this.onSlowedExit })
            .addState(States.SNARED, { onEnter: this.onSnaredEnter, onExit: this.onSnaredExit });

        this.positiveMachine.setState(States.CLEAN);
        this.negativeMachine.setState(States.CLEAN);
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
        this.defeatedByPlayer = false;
        this.isLuckout = false;
        this.isPersuaded = false;
        this.playerTrait = "";
        this.currentWeapon = undefined;
        this.isCurrentTarget = false;
        this.parryAction = "";
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {};
        this.isDeleting = false;
        this.sensorDisp = 12;
        this.colliderDisp = 16; 
        this.beam = new Beam(this);
        this.chunkX = this.scene.playerChunkX;
        this.chunkY = this.scene.playerChunkY;
        this.acc = 0;
        this.isHostile = this.setHostility();
        this.lastHitLocation = { location: HitLocation.HEAD, hitPoint: { x: 0, y: 0 }, relativePosition: { x: 0, y: 0 } };

        const mindStates = MIND_STATES[this.ascean.mastery];
        const mindStateName = mindStates[Math.floor(Math.random() * mindStates.length)];
        this.mindState = MindStates[mindStateName];
        this.mindStateName = mindStateName;
        if (this.mindState.startup) this.mindState.startup(this, this.getCombatContext());
        const underground = this.scene.hud.currScene === "Underground" || this.scene.hud.currScene === "Arena" || this.scene.hud.currScene === "Gauntlet";
        let colliderUpper = Bodies.rectangle(this.x, this.y + 2, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT / 2, {
            isSensor: !underground,
            label: "body",
        }); // Y + 10 For Platformer
        let colliderLower = Bodies.rectangle(this.x, this.y + 18, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT / 2, {
            isSensor: underground,
            label: "legs", 
        }); // Y + 10 For Platformer
        let enemySensor = Bodies.circle(this.x, this.y + 2, PLAYER.SENSOR.DEFAULT, { 
            isSensor: true, label: "enemySensor", 
        }); // Sensor was 48
        const compoundBody = Body.create({
            parts: [enemySensor, colliderLower, colliderUpper],
            density: 0.0025, // 0.0025
            frictionAir: 0.5, // 0.1
            restitution: 0.1, // 0.3
            friction: 0.3, // 0.15
            frictionStatic: 10, 
        });
        this.setExistingBody(compoundBody);                                    
        this.setFixedRotation();
        this.enemySensor = enemySensor;
        this.setCollisionCategory(ENTITY_FLAGS.ENEMY);
        this.setCollidesWith(ENTITY_FLAGS.ENEMY | ENTITY_FLAGS.PLAYER | ENTITY_FLAGS.PARTY | ENTITY_FLAGS.PARTICLES | ENTITY_FLAGS.WORLD);
        this.aoeMask = ENTITY_FLAGS.ENEMY;
        this.collision(enemySensor);
        
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on("pointerdown", () => {
                // this.scene.hud.debugMonitor.monitor(this);
                // this.scene.hud.logger.log(`Console: ${this.ascean.name}'s current State: ${this.stateMachine.getCurrentState()?.charAt(0).toUpperCase()}${this.stateMachine.getCurrentState()?.slice(1)}`);
                if ((!this.scene.hud.settings.difficulty.enemyCombatInteract && this.scene.combat) || this.isDeleting) return; //  && !this.inCombat
                // if (this.currentTarget) this.scene.hud.logger.log(`Console: ${this.ascean.name} is currently attacking ${this.currentTarget.ascean.name}`);
                this.ping();
                vibrate();
                this.clearTint();
                this.setTint(TARGET_COLOR);
                if (this.enemyID !== this.scene.state.enemyID) this.scene.hud.setupEnemy(this);
                this.scene.hud.showDialog(this.checkTouching());
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
            .on("pointerout", () => {
                this.clearTint();
                this.setTint(ENEMY_COLOR);
            });
        this.scene.time.delayedCall(1000, () => {
            this.setVisible(true);
            this.spriteWeapon.setVisible(!this.isDefeated);
            this.spriteShield.setVisible(!this.isDefeated);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y);
            this.createShadow(true);
        });
    };

    cleanUp() {
        if (this.isGlowing || this.isCaerenic) this.checkCaerenic(false, true);
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
        this.weaponHitbox.destroy();
        this.shadow.destroy();
    };

    ping = () => {
        if (this.ascean?.level > (this.scene.state.player?.level as number || 0)) {
            this.scene.sound.play("righteous", { volume: this.scene.hud.settings.volume });
        } else if (this.ascean?.level === this.scene.state.player?.level) {
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        } else {
            this.scene.sound.play("consume", { volume: this.scene.hud.settings.volume });
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

    caerenicUpdate = (caerenic: boolean) => {
        this.isCaerenic = caerenic;
        this.enemySound("blink", true);
        const multiplier = caerenic ? 1 : -1;
        this.adjustSpeed(PLAYER.SPEED.CAERENIC * multiplier);
        this.computerCombatSheet.computerCaerenic = caerenic;
        if (this.isGlowing) return;
        // this.createShadow(!caerenic);
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, "weapon")
        this.setGlow(this.spriteShield, caerenic, "shield");
        this.shadow?.setVisible(!caerenic);    
    };

    checkCaerenic = (caerenic: boolean, kill: boolean = false) => {
        this.isGlowing = caerenic;
        if (this.isCaerenic && !kill) return;
        // this.createShadow(!caerenic);
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, "weapon");
        this.setGlow(this.spriteShield, caerenic, "shield");
        this.shadow?.setVisible(!caerenic);
    };

    flickerCaerenic = (duration: number) => {
        if (!this.isGlowing && !this.isCaerenic) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(duration, () => {
                this.checkCaerenic(false);
            }, undefined, this);
        };
    };

    stalwartUpdate = (stalwart: boolean) => {
        this.isStalwart = stalwart;
        this.spriteShield?.setVisible(this.isStalwart);
        this.enemySound("stalwart", this.isStalwart);
        this.computerCombatSheet.computerStalwart = stalwart;
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

    setHostility = () => {
        const reputation = this.scene.hud.reputation;
        const faction = reputation.factions.find(f => f.name === this.ascean.name);
        if (faction) {
            return faction.hostile;
        };
        return false;
    };

    setMindState = (mind: string) => {
        this.mindStateName = mind;
        this.mindState = MindStates[mind];
        if (this.mindState.startup) this.mindState.startup(this, this.getCombatContext());
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

    checkConfuse = () => {
        if (!this.specialConfuse) {
            this.isConfused = false;
        } else {
            const chance = Math.random() < 0.1 + this.confuseCount;
            if (chance) {
                this.scene.showCombatText(this, "Confuse Broken", PLAYER.DURATIONS.TEXT, EFFECT);
                this.isConfused = false;
            } else {
                this.confuseCount += 0.1;
            };
        };
    };

    checkFear = () => {
        const strength = this.specialFear ? 0.05 : 0.1;
        const chance = Math.random() < strength + this.fearCount;
        if (chance) {
            this.scene.showCombatText(this, "Fear Broken", PLAYER.DURATIONS.TEXT, EFFECT);
            this.isFeared = false;
        } else {
            this.fearCount += strength;
        };
    };

    checkHurt = () => {
        if (this.isCasting || this.isFeared || this.isStunned || this.isParalyzed || this.isPraying) return; // this.isTrying() || 
        this.isHurt = true;
        this.stateMachine.setState(States.HURT);
    };

    checkEnemyGame = (id: string): boolean => {
        const enemy = this.scene.enemies.some((e: Enemy) => e.enemyID === id); 
        if (!enemy) return true; // Party
        return this.scene.hud.currScene === "Game"; // Making sure it's not Arena or Underground
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
    
        if (this.scene.player.playerID === topEnemy && this.currentTarget?.name !== "player") {
            this.updatePlayerTarget(this.scene.player);
        } else if (this.currentTarget?.name !== "player" && this.currentTarget?.enemyID !== topEnemy) {
            updateTarget(topEnemy);
        } else if (this.currentTarget?.name === "player" && this.currentTarget?.playerID !== topEnemy) {
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
        this.scene.showCombatText(this, "Player Engaged!", 1000, EFFECT, false, true);
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
            computerEnemyCaerenic: target.isCaerenic,
            computerEnemyStalwart: target.isStalwart
        };
        if (this.healthbar.visible === false) this.healthbar.setVisible(true);
        this.scene.showCombatText(this, `New Target: ${target.ascean.name}`, 1500, EFFECT, false, true);
    };

    computerSoundEffects = (sfx: ComputerCombat) => {
        switch (sfx.computerEnemyDamageType) {
            case "Spooky":
                return this.enemySound("spooky", true);
            case "Righteous":
                return this.enemySound("righteous", true);
            case "Wild":
                return this.enemySound("wild", true);
            case "Earth":
                return this.enemySound("earth", true);
            case "Fire":
                return this.enemySound("fire", true);
            case "Frost":
                return this.enemySound("frost", true);
            case "Lightning":
                return this.enemySound("lightning", true);
            case "Sorcery":
                return this.enemySound("sorcery", true);
            case "Wind":
                return this.enemySound("wind", true);
            case "Pierce":
                return (sfx.computerEnemyWeapons[0].type === "Bow" || sfx.computerEnemyWeapons[0].type === "Greatbow") 
                    ? this.enemySound("bow", true) 
                    : this.enemySound("pierce", true);
            case "Slash":
                return this.enemySound("slash", true);
            case "Blunt":
                return this.enemySound("blunt", true);
        };
    };

    computerCombatUpdate = (e: ComputerCombat) => {
        const { computerDamageType, enemyID, computerWeapons, computerWin, computerHealth, newComputerHealth, computerEnemyParrySuccess, rollSuccess } = e;
        
        if (this.health > newComputerHealth) {
            let damage: number | string = Math.round(this.health - newComputerHealth);
            this.scene.showCombatText(this, `${damage}`, 1500, "bone", e.computerEnemyCriticalSuccess, false);
            this.checkHurt();
            if (this.isFeared) this.checkFear();
            if (this.isConfused) this.checkConfuse();
            if (this.isPolymorphed) this.isPolymorphed = false;
            if (this.isMalicing) this.malice(enemyID);
            if (this.isMending) this.mend(enemyID);
            
            if (!(this.inComputerCombat || this.currentTarget) && newComputerHealth > 0 && enemyID !== this.enemyID) {
                const enemy = this.scene.getEnemy(enemyID) || this.scene.party.find((p: Party) => p.enemyID === enemyID);
                if (enemy && enemy.health > 0) this.checkComputerEnemyCombatEnter(enemy);
            };
            
            const enemy = this.enemies.find((en: ENEMY) => en.id === enemyID && enemyID !== this.enemyID);
            
            if (enemy && newComputerHealth > 0 && this.checkEnemyGame(enemyID)) {
                this.updateThreat(enemyID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, computerHealth));
            } else if (!enemy && newComputerHealth > 0 && enemyID !== "" && enemyID !== this.enemyID && this.checkEnemyGame(enemyID)) {
                this.enemies.push({id:enemyID,threat:0});
                this.updateThreat(enemyID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, computerHealth))
            };
            
            this.computerSoundEffects(e);
        } else if (this.health < newComputerHealth) { 
            let heal = Math.round(newComputerHealth - this.health);
            this.scene.showCombatText(this, `${heal}`, 1500, HEAL);
        };
        
        if (rollSuccess) {
            this.scene.showCombatText(this, "Roll", PLAYER.DURATIONS.TEXT, HEAL);
        };
        
        if (computerEnemyParrySuccess) {
            this.isStunned = true;
            this.scene.showCombatText(this, "Parried", PLAYER.DURATIONS.TEXT, HEAL);
            this.stateMachine.setState(States.STUNNED);
        };

        this.health = newComputerHealth;
        this.computerCombatSheet.newComputerHealth = this.health;
        if (this.healthbar.getTotal() < computerHealth) this.healthbar.setTotal(computerHealth);
        this.updateHealthBar(newComputerHealth);
        this.weapons = computerWeapons;
        this.setWeapon(computerWeapons[0] as Equipment); 
        this.checkDamage(computerDamageType.toLowerCase()); 
        this.checkMeleeOrRanged(computerWeapons?.[0] as Equipment);
        this.currentWeaponCheck();

        if (e.computerDamaged) this.scene.combatManager.hitFeedbackSystem.spotEmit(this.enemyID, e.computerEnemyDamageType);
        this.computerCombatSheet.criticalSuccess = false;
        this.computerCombatSheet.glancingBlow = false;
        this.computerCombatSheet.parrySuccess = false;
        this.computerCombatSheet.rollSuccess = false;
        this.computerCombatSheet.computerEnemyParrySuccess = false;
        this.computerCombatSheet.computerEnemyCriticalSuccess = false;
        this.computerCombatSheet.computerWin = computerWin;
        
        if (e.newComputerEnemyHealth <= 0 && this.computerCombatSheet.computerWin) {
            this.computerCombatSheet.computerWin = false;
            this.clearComputerCombatWin(enemyID);
        };
        if (this.health <= 0) {
            this.killingBlow = enemyID;
            this.stateMachine.setState(States.DEFEATED);
        };
        this.scene.combatManager.checkPlayerFocus(this.enemyID, this.health);
    };

    setAggression = () => {
        if (this.scene.hud.settings.difficulty.aggressionImmersion) {
            const aggressive = this.scene.hud.reputation.factions.find((f: FACTION) => f.name === this.ascean.name)?.aggressive || false;
            return aggressive as boolean;
        } else {
            const percent = this.scene.hud.settings.difficulty.aggression;
            return percent >= Math.random() || false;
        };
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

    isValidComputerRushEnemy = (enemy: Enemy | Party) => {
        if (this.isRushing === false) return;
        const newEnemy = this.rushedEnemies.every(obj => obj.enemyID !== enemy.enemyID);
        if (newEnemy) this.rushedEnemies.push(enemy);
    };
    
    immersionCheck = (enemy: Enemy): boolean => {
        if (this.scene.hud.settings.difficulty.aggressionImmersion) {
            const enemyName = enemy.ascean.name.split("(Converted)")[0].trim();
            return this.potentialEnemies.includes(enemyName);
        } else if (this.scene.hud.settings.difficulty.computer) {
            return true;
        } else {
            return false;
        };
    };

    checkHostility = (): boolean => this.isHostile && !this.inCombat && !this.inComputerCombat && this.health > 0

    checkTouching = (): boolean => {
        return this.scene.player.touching.some((t: any) => t.particleID === this.particleID);
    };

    checkTouch = (entity: any, add: boolean) => {
        if (entity.bodyB.label !== "body") return;
        if (add) {
            this.touching.push(entity.gameObjectB);
        } else {
            this.touching = this.touching.filter(obj => obj !== entity.gameObjectB);
        };
    };

    collision = (enemySensor: any) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [enemySensor],
            callback: (other: any) => {
                if (this.isDeleting || !other.gameObjectB) return;
                if (other.gameObjectB.name === "player") {
                    this.isValidRushEnemy(other.gameObjectB);
                    this.checkTouch(other, true);
                    // this.touching.push(other.gameObjectB);
                    EventBus.emit("add-touching", this.enemyID);

                    if (this.ascean && !other.gameObjectB.isStealthing && this.enemyAggressionCheck()) {
                        this.createCombat(other, "start");
                    } else if (this.checkHostility()) {
                        const newEnemy = this.isNewEnemy(other.gameObjectB);
                        if (newEnemy) {
                            other.gameObjectB.targets.push(this);
                            other.gameObjectB.checkTargets();
                        };
                        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
                        this.stateMachine.setState(States.HOSTILE);
                    } else if (this.playerStatusCheck(other.gameObjectB) && (!this.isAggressive || this.defeatedByPlayer) && !this.inComputerCombat) {
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
                    }; //  || other.gameObjectB.name === "party"
                } else if (other.gameObjectB.name === "party") {
                    this.isValidComputerRushEnemy(other.gameObjectB);
                    this.checkTouch(other, true);
                    if (this.inCombat || this.inComputerCombat || other.gameObjectB.isDefeated || other.gameObjectB.health <= 0 || this.health <= 0 || this.isDefeated) return;                     
                    if (this.immersionCheck(other.gameObjectB)) this.checkComputerEnemyCombatEnter(other.gameObjectB);
                } else if (other.gameObjectB.name === NAME && this.scene.scene.key !== "Arena" && this.scene.scene.key !== "Underground" && this.immersionCheck(other.gameObjectB)) {
                    this.isValidComputerRushEnemy(other.gameObjectB);
                    this.checkTouch(other, true);
                    if (this.inCombat || this.inComputerCombat || other.gameObjectB.isDefeated || other.gameObjectB.health <= 0 || this.health <= 0 || this.isDefeated) return;                     
                    this.checkComputerEnemyCombatEnter(other.gameObjectB);
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [enemySensor],
            callback: (other: any) => {
                if (this.isDeleting || !other.gameObjectB) return;
                if (other.gameObjectB.name === "player") {
                    this.checkTouch(other, false);
                    this.isValidRushEnemy(other.gameObjectB);
                    EventBus.emit("remove-touching", this.enemyID);
                    if (this.playerStatusCheck(other.gameObjectB) && !this.isAggressive && !this.inComputerCombat && this.health > 0) {
                        if (this.healthbar) this.healthbar.setVisible(false);
                        if (this.isDefeated === true) {
                            this.scene.hud.showDialog(false);
                            this.stateMachine.setState(States.DEFEATED);
                        } else {
                            this.stateMachine.setState(States.IDLE);
                        };
                        if (this.isCurrentTarget === true && !this.inCombat) {
                            this.scene.hud.clearNonAggressiveEnemy();
                            this.scene.player.currentTarget = undefined;
                            this.scene.player.removeHighlight();
                        };
                    };
                } else if ((other.gameObjectB.name === NAME || other.gameObjectB.name === "party")) {
                    this.checkTouch(other, false);
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
        this.scene.showCombatText(this, "!", 1000, EFFECT, true, true);
        this.scene.hud.showCombatHud(`${this.ascean.name} Engaged`, EFFECT);
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
        this.scene.showCombatText(this, "!", 1000, EFFECT, true, true);
        this.scene.hud.showCombatHud(`${this.ascean.name} Engaged`, EFFECT);
        this.enemies.push({ id: this.scene.player.playerID, threat: 0 });
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
            computerEnemyCaerenic: enemy.isCaerenic,
            computerEnemyStalwart: enemy.isStalwart,
        };

        const newEnemy = this.isNewComputerEnemy(enemy);
        if (newEnemy) this.enemies.push({id:enemy.enemyID,threat:0});
        
        this.setSpecialCombat(true);
        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.scene.showCombatText(this, "!", 1000, EFFECT, true, true);
        
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

    enemyAggressionCheck = () => !this.isDefeated && !this.inCombat && this.isAggressive && this.scene.state.newPlayerHealth > 0;

    computerEnemyAggressionCheck = () => !this.isDefeated && !this.inComputerCombat && this.isAggressive;

    computerEnemyAttacker = () => {
        const enemy = this.scene.enemies.find((e: Enemy) => e.currentTarget?.enemyID === this.enemyID) || this.scene.party?.find((e: Party) => e.currentTarget?.enemyID === this.enemyID);
        return enemy;
    };

    createTheEnemy = () => {
        const compiler = getAnEnemy(this.scene.player.ascean.level);
        this.ascean = compiler.ascean;
        this.health = compiler.attributes.healthTotal;
        this.combatStats = compiler;
        this.weapons = [compiler.combatWeaponOne, compiler.combatWeaponTwo, compiler.combatWeaponThree];
        this.speed = this.startingSpeed(compiler.ascean);
        this.heldSpeed = this.speed;
        this.createWeapon(compiler.ascean.weaponOne);
        this.createShield(compiler.ascean.shield);
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health);
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
        this.computerCombatSheet = this.createComputerCombatSheet(compiler);
        this.potentialEnemies = ENEMY_ENEMIES[this.ascean.name] || [];
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
        this.potentialEnemies = ENEMY_ENEMIES[this.ascean.name] || [];
    };

    createEnemy = () => {
        EventBus.once("enemy-fetched", this.enemyFetchedOn);
        const fetch = { enemyID: this.enemyID, level: this.scene.player.ascean.level };
        EventBus.emit("fetch-enemy", fetch);
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
        this.spriteWeapon.setAngle(-195);
        this.spriteWeapon.setOrigin(0.25, 1);
        this.spriteWeapon.setVisible(false);
        this.scene.add.existing(this.spriteWeapon);
        this.weaponHitbox = this.scene.add.circle(this.spriteWeapon.x, this.spriteWeapon.y, 24, 0xfdf6d8, 0);
        this.scene.add.existing(this.weaponHitbox);
        this.checkMeleeOrRanged(weapon);
        if (weapon.grip === "Two Hand") {
            this.spriteWeapon.setScale(0.65);
        } else {
            if (weapon.type === "Dagger") {
                this.spriteWeapon.setScale(0.4);
            } else {
                this.spriteWeapon.setScale(0.5);
            };
        };
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
        this.currentAction = "";
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
        this.currentAction = "";
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
        this.currentAction = "";
        this.defeatedByPlayer = true;
        this.summons = 0;
        if (this.isCaerenic) this.caerenicUpdate(false);
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
            this.currentAction = "";
            this.summons = 0;
            if (this.isCaerenic) this.caerenicUpdate(false);
        } else if (this.enemies[0].id === this.scene?.player?.playerID || this.currentTarget?.name === "player") {
            this.enemies = this.enemies.filter((e: ENEMY) => e.id !== this.scene.player.playerID);
            this.inCombat = false;
            this.isTriumphant = true;
            const newId = this.enemies[0].id;
            const newEnemy = this.scene.enemies.find((e: Enemy) => newId === e.enemyID);
            this.currentTarget = newEnemy;
            this.stateMachine.setState(States.CHASE);
            this.currentAction = "";
        } else {
            this.enemies = this.enemies.filter((e: ENEMY) => e.id !== this.scene.player.playerID);
            this.inCombat = false;
            this.isTriumphant = true;
            this.currentAction = "";
            this.summons = 0;
            if (this.isCaerenic) this.caerenicUpdate(false);
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
        this.scene.showCombatText(this, "!", 1000, EFFECT, true, true);
        this.scene.hud.showCombatHud(`${this.ascean.name} Engaged`, EFFECT);
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
            if (this.isValidTarget(newEnemy)) {
                this.currentTarget = newEnemy;
            } else if (this.isValidTarget(newPartyEnemy as Party)) {
                this.currentTarget = newPartyEnemy;
            } else if (this.scene.player.playerID === newId && this.scene.player.health > 0) {
                this.currentTarget = this.scene.player;
                if (!this.computerEnemies()) this.inComputerCombat = false;
            } else {
                this.clearComputerCombatWin(newId);
            };
        };
    };

    clearPersuasion = () => {
        this.inCombat = false;
        if (this.currentTarget?.name === "player") {
            this.enemies = this.enemies.filter(e => e.id !== this.currentTarget.playerID);
        };
        if (this.inComputerCombat && this.enemies.length > 0) {
            const enemy = this.scene.combatManager.combatant(this.enemies[0].id);
            this.checkComputerEnemyCombatEnter(enemy)
        } else {
            this.health = this.ascean.health.max;
            this.healthbar.setValue(this.healthbar.getTotal());
            this.healthbar.setVisible(false);
            this.setSpecialCombat(false);
            this.inCombat = false;
            this.inComputerCombat = false;
            this.currentTarget = undefined;
            this.isAggressive = false;
            this.isHostile = false;
            this.enemies = [];
            this.clearStatuses();
            this.currentAction = "";
            this.stateMachine.setState(States.IDLE);
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

    callToArms = (entity: Player | Enemy | Party) => {
        if (!entity) return;
        if (entity.name === "player") {
            this.jumpIntoCombat();
        } else {
            this.checkComputerEnemyCombatEnter(entity as Enemy | Party);
        };
    };

    charmed = () => {
        this.inCombat = false;
        if (this.currentTarget?.name === "player") {
            this.enemies = this.enemies.filter(e => e.id !== this.currentTarget.playerID);
        };
        if (this.inComputerCombat) {
            const enemy = this.scene.combatManager.combatant(this.enemies[0].id);
            this.checkComputerEnemyCombatEnter(enemy)
        } else {
            this.health = this.ascean.health.max;
            this.healthbar.setValue(this.healthbar.getTotal());
            this.healthbar.setVisible(false);
            this.setSpecialCombat(false);
            this.inCombat = false;
            this.inComputerCombat = false;
            this.currentTarget = undefined;
            this.isAggressive = false;
            this.isHostile = false;
            this.enemies = [];
            this.clearStatuses();
            this.currentAction = "";
            this.stateMachine.setState(States.IDLE);
        };
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
                    if (this.isSuffering() || this.isContemplating || this.scene.state.playerEffects.find((effect: StatusEffect) => effect.prayer === "Silence")) {
                        this.setSpecialCombat(true, 0.3);
                        return;
                    };
                    const special = ENEMY_SPECIAL[mastery][Math.floor(Math.random() * ENEMY_SPECIAL[mastery].length)].toLowerCase();
                    this.specialAction = special;
                    // this.currentAction = "special";
                    const specific = [States.RENEWAL];
                    const test = specific[Math.floor(Math.random() * specific.length)];
                    if (this.stateMachine.isState(test)) {
                        this.stateMachine.setState(test);
                    } else if (this.positiveMachine.isState(test)) {
                        this.positiveMachine.setState(test);
                    };
                    this.setSpecialCombat(true);
                },
                callbackScope: this
            });
        } else {
            this.specialCombat?.remove();
        };
    };

    mastery = () => this.ascean[this.ascean.mastery] || 20;

    levelModifier = () => (this.ascean?.level + 9) / 10;

    chiomic = (power: number, id: string) => {
        power = this.entropicMultiplier(power);
        if (id === this.scene?.player?.playerID) { // Player Combat
            if (this.scene.state.newPlayerHealth <= 0) return;
            this.scene.combatManager.useGrace(power / 10);
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: "Enemy Chiomic", data: power });
            } else {
                const chiomic = Math.round(this.mastery() * (1 + (power / CHIOMISM)) * this.scene.combatManager.computerCaerenicPro(this) * this.scene.combatManager.playerCaerenicNeg() * this.scene.combatManager.playerStalwart() * (this.levelModifier() ** 2));
                const ratio = chiomic / this.scene.state.computerHealth * 100;
                const computerActionDescription = `${this.ascean?.name} flays ${chiomic} health from you with their hush.`;
                EventBus.emit("add-combat-logs", { ...this.scene.state, computerActionDescription });
                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: "player", value: -ratio, id: this.enemyID } });
            };
        } else if (id) { // Computer Combat
            const chiomic = Math.round(this.mastery() * this.scene.combatManager.computerCaerenicPro(this) * this.scene.combatManager.computerCaerenicNegID(id) * this.scene.combatManager.computerStalwartID(id) * (1 + (power / CHIOMISM)) * (this.levelModifier() ** 2));
            if (id === this.computerCombatSheet.enemyID) {
                this.computerCombatSheet.newComputerEnemyHealth = this.scene.combatManager.combatant(id).health;
                this.computerCombatSheet.newComputerEnemyHealth -= chiomic;
            };
            this.scene.combatManager.updateComputerDamage(chiomic, id, this.enemyID);
        };
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Pierce");
    };

    devour = (power: number, id: string) => {
        if (id === this.scene?.player?.playerID) {
            if (this.scene.state.newPlayerHealth <= 0) return;
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: "Enemy Tshaeral", data: 5 });
            } else {
                const dev = Math.round(this.combatStats.attributes.healthTotal * this.scene.combatManager.computerCaerenicPro(this) * (power / DEVOUR) * this.scene.combatManager.playerCaerenicNeg() * this.scene.combatManager.playerStalwart() * (this.levelModifier() ** 2));
                let newComputerHealth = Math.min(this.health + dev, this.combatStats.attributes.healthTotal);
                const computerActionDescription = `${this.ascean?.name} tshaers and devours ${dev} health from you.`;
                EventBus.emit("add-combat-logs", { ...this.scene.state, computerActionDescription });
                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: "player", value: -power, id: this.enemyID } });
                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: NAME, value: newComputerHealth, id: this.enemyID } });
            };
        } else if (id) { // CvC
            const dev = Math.round(this.combatStats.attributes.healthTotal * this.scene.combatManager.computerCaerenicPro(this) * this.scene.combatManager.computerCaerenicNegID(id) * this.scene.combatManager.computerStalwartID(id) * (power / DEVOUR) * (this.levelModifier() ** 2));
            let newComputerHealth = Math.min(this.health + dev, this.combatStats.attributes.healthTotal);
            this.health = newComputerHealth;
            this.updateHealthBar(this.health);
            this.computerCombatSheet.newComputerEnemyHealth = this.scene.combatManager.combatant(id).health;
            this.computerCombatSheet.newComputerEnemyHealth -= dev;
            this.computerCombatSheet.newComputerHealth = this.health;
            this.scene.combatManager.updateComputerDamage(dev, id, this.enemyID);
        };
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.x, this.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Pierce");
    };

    sacrifice = (power: number, id: string) => {
        power = this.entropicMultiplier(power);
        if (id === this.scene?.player?.playerID) {
            if (this.scene.state.newPlayerHealth <= 0) return;
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: "Enemy Sacrifice", data: power });
            } else {
                const sacrifice = Math.round(this.mastery() * this.scene.combatManager.computerCaerenicPro(this) * this.scene.combatManager.playerCaerenicNeg() * this.scene.combatManager.playerStalwart() * (this.levelModifier() ** 2));
                let newComputerHealth = this.health + (sacrifice / 2) > this.combatStats.attributes.healthTotal ? this.combatStats.attributes.healthTotal : this.health + (sacrifice / 2);
                const computerActionDescription = `${this.ascean?.name} sacrifices ${sacrifice / 2} health to rip ${sacrifice} from you.`;
                const ratio = (sacrifice * (1 + power / SACRIFICE)) / this.scene.state.playerHealth * 100;
                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: "player", value: -ratio, id: this.enemyID } });
                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: NAME, value: newComputerHealth, id: this.enemyID } });
                EventBus.emit("add-combat-logs", { ...this.scene.state, computerActionDescription });
            };
        } else if (id) { // CvC
            const sacrifice = Math.round(this.mastery() * this.scene.combatManager.computerCaerenicPro(this) * this.scene.combatManager.computerCaerenicNegID(id) * this.scene.combatManager.computerStalwartID(id) * (this.levelModifier() ** 2));
            this.health -= (sacrifice / 2);
            this.computerCombatSheet.newComputerEnemyHealth = this.scene.combatManager.combatant(id).health;
            this.computerCombatSheet.newComputerEnemyHealth -= (sacrifice * (1 + power / SACRIFICE));
            this.computerCombatSheet.newComputerHealth = this.health;
            this.updateHealthBar(this.health);
            this.scene.combatManager.updateComputerDamage(sacrifice, id, this.enemyID);
        };
        this.scene.combatManager.hitFeedbackSystem.bleed(new Phaser.Math.Vector2(this.x, this.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Spooky");
    };

    suture = (power: number, id: string) => {
        if (!id) return;
        power = this.entropicMultiplier(power);
        if (id === this.scene?.player?.playerID) {
            if (this.scene.state.newPlayerHealth <= 0) return;
            if (this.isCurrentTarget === true) {
                this.scene.combatManager.combatMachine.action({ type: "Enemy Suture", data: power });
            } else {
                const suture = Math.round(this.mastery() * this.scene.combatManager.computerCaerenicPro(this) * this.scene.combatManager.playerCaerenicNeg() * this.scene.combatManager.playerStalwart() * (this.levelModifier() ** 2)) * (1 + power / SUTURE);
                let newComputerHealth = Math.min(this.health + suture, this.combatStats.attributes.healthTotal);
                const computerSpecialDescription = `${this.ascean?.name} sutures ${suture} health from you, absorbing ${suture}.`;
                const ratio = suture / this.scene.state.playerHealth * 100;
                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: "player", value: -ratio, id: this.enemyID } });
                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: NAME, value: newComputerHealth, id: this.enemyID } });
                EventBus.emit("add-combat-logs", { ...this.scene.state, computerSpecialDescription });
            };
        } else if (id) { // CvC
            const suture = Math.round(this.mastery() * this.scene.combatManager.computerCaerenicPro(this) * this.scene.combatManager.computerCaerenicNegID(id) * this.scene.combatManager.computerStalwartID(id) * (this.levelModifier() ** 2)) * (1 + power / SUTURE);
            let newComputerHealth = Math.min(this.health + suture, this.combatStats.attributes.healthTotal);
            this.computerCombatSheet.newComputerEnemyHealth = this.scene.combatManager.combatant(id).health;
            this.computerCombatSheet.newComputerEnemyHealth -= suture;
            this.computerCombatSheet.newComputerHealth = newComputerHealth;
            this.scene.combatManager.updateComputerDamage(suture, id, this.enemyID);
        };
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.x, this.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Righteous");
    };

    checkDamage = (damage: string) => {
        this.currentDamageType = damage;
        this.hasMagic = this.checkDamageType(damage, "magic");
    };

    counterCheck = () => {
        if (this.scene?.player?.isCounterSpelling === true) {
            this.isCasting = false;
            this.isCounterSpelled = true;
            this.stateMachine.setState(States.COUNTERSPELLED);
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
    
    startCasting = (name: string, duration: number, _style: string, channel = false, beam = true) => {
        this.castbar.reset();
        this.castbar.setVisible(true); // Added
        this.castbar.setup(this.x, this.y, name);
        this.isCasting = true;
        // this.scene.showCombatText(this, name, duration / 2, style, false, true);
        this.castbar.setTotal(duration);
        if (beam) this.beam.enemyEmitter(this.currentTarget, duration, this.ascean.mastery); // scene.player
        if (channel) this.castbar.setTime(duration);
        if (!this.isGlowing && !this.isCaerenic) this.checkCaerenic(true);
        this.setVelocity(0);
        this.anims.play(FRAMES.CAST, true);
    };

    stopCasting = (counter: string) => {
        this.isCasting = false;
        this.castingSuccess = false;
        this.targetID = "";
        this.castbar.reset();
        this.beam.reset();
        if (this.isGlowing && !this.isCaerenic) this.checkCaerenic(false);
        if (this.isCounterSpelled === true) {
            this.scene.showCombatText(this, counter, 750, DAMAGE, false, true);
            this.scene.combatManager.counterspellCheck(this, counter);
        };
        this.stateMachine.setState(States.COMBAT);
    };

    startPraying = () => {
        this.isPraying = true;
        this.setStatic(true);
        this.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => {
            this.isPraying = false;
            this.setStatic(false);
        });
    };

    setStun = () => {
        this.scene.showCombatText(this, "Stunned", 2500, EFFECT, true, true);
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
        } else if (this.isPraying) {
            this.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.isPraying = false);
        } else if (this.isClimbing) {
            if (this.velMoving()) {
                this.anims.play(FRAMES.CLIMB, true);
            } else {
                this.anims.play(FRAMES.CLIMB, true);
                this.anims.pause();
            };
        } else if (this.inWater) {
            if (this.velocity?.y as number > 0) {
                this.anims.play(FRAMES.SWIM_DOWN, true);
            } else {
                this.anims.play(FRAMES.SWIM_UP, true);
            };
        } else {
            if (this.velMoving()) {
                this.anims.play(FRAMES.RUNNING, true);
            } else {
                this.anims.play(FRAMES.IDLE, true);
            };
        };
    };

    onDeathEnter = () => {
        this.scene.showCombatText(this, `${this.ascean.name} has perished in combat!`, 3000, BONE, false, true); 
        this.scene.tweens.add({
            targets: [this],
            alpha: 0,
            duration: 10000,
            onComplete: () => EventBus.emit("kill-enemy", this),
            callbackScope: this
        });
    };
    // onDeathUpdate = () => {};

    onDefeatedEnter = () => {
        if (this.isDeleting) return;
        this.stateMachine.clearStates();
        this.anims.play(FRAMES.DEATH, true);
        this.defeatedTime = 60000;
        if (this.isShimmering) {
            this.isShimmering = false;
            this.stealthEffect(false);
        };
        if (this.isGlowing || this.isCaerenic) this.checkCaerenic(false, true);
        EventBus.emit(BROADCAST_DEATH, this.enemyID);
        const party = this.scene.party.find((e: Party) => e.enemyID === this.killingBlow);
        if (party) { // A Party Member Got the Killing Blow
            this.defeatedByPlayer = true;
            EventBus.emit("killing-blow", {e:this.ascean, enemyID:this.enemyID});
        };
        this.killingBlow = "";
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
        this.currentAction = "";
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.healthbar.setVisible(false);
        this.setStatic(true);
        this.scene.matter.setCollisionCategory(this.body as any, ENTITY_FLAGS.DEFEATED_ENEMY);
        this.scene.matter.setCollidesWith(this.body as any, 
            ENTITY_FLAGS.WORLD | ENTITY_FLAGS.DEFEATED_ENEMY
        );
        this.enemies = [];
        this.clearStatuses();
        if (Math.random() > 0.9 && this.scene.hud.currScene === "Game") {
            this.isDying = true;
            this.scene.hud.logger.log(`Console: ${this.ascean.name} has perished, leaving this world.`);
            this.scene.showCombatText(this, `${this.ascean.name} has perished!`, 3000, BONE, false, true); 
            this.scene.tweens.add({
                targets: [this],
                alpha: 0.25,
                duration: 6000,
                onComplete: () => EventBus.emit("kill-enemy", this),
                callbackScope: this
            });    
        };
    };
    onDefeatedUpdate = (dt: number) => {
        if (this.isDeleting || this.isDying) return;
        this.defeatedTime -= dt;
        if (this.defeatedTime <= 0 && !this.stateMachine.isCurrentState(States.IDLE) && !this.isNetted) this.stateMachine.setState(States.IDLE);
    };
    onDefeatedExit = () => {
        if (this.isDeleting) return;
        this.anims.playReverse(FRAMES.DEATH);
        if (this.isDying) return;
        this.isDefeated = false;
        this.defeatedTime = 60000;
        this.health = this.ascean.health.max;
        this.updateHealthBar(this.ascean.health.max);
        this.computerCombatSheet.newComputerHealth = this.ascean.health.max;
        this.isAggressive = this.startedAggressive;
        this.spriteWeapon.setVisible(true);
        this.setStatic(false);
        this.currentTargetCheck();
        if (this.isCurrentTarget) this.scene.combatManager.combatMachine.action({ data: { key: NAME, value: this.health, id: this.enemyID, type: "heals" }, type: HEALTH });

        this.scene.matter.setCollisionCategory(this.body as any, ENTITY_FLAGS.ENEMY);
        this.scene.matter.setCollidesWith(this.body as any, 
            ENTITY_FLAGS.ALL
        );
        const texts = [`${this.weapons[0].influences[0]} be praised! I live again.`, `${this.weapons[0].influences[0]}, you have my caeren. Thank you for this change once more.`, "Alright, I feel better again.", "Well, that was unpleasant.", "Thank goodness that's over.", "Good as new!", "Hopefully, that's the end of that nonsense.", "My word, I didn't expect that to happen."];
        const text = texts[Math.floor(Math.random() * texts.length)];
        this.scene.showCombatText(this, text, 1500, EFFECT, false, true);
    };

    onDestroyEnter = () => {
        this.clearTint(); 
        this.setStatic(true);
    };

    onDestroyUpdate = () => this.anims.play(FRAMES.HURT, true);

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
        // this.enemyAnimation();
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
                    this.pathDirection.x * this.speed * (this.isClimbing ? 0.65 : 1), 
                    this.pathDirection.y * this.speed * (this.isClimbing ? 0.65 : 1)
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
        let pathChances = 0;
        const bodyPadding = {
            x: 6,
            y: 16
        };
        if (!this.body) return;
        let navMesh;
        if (this.scene.navMesh) {
            navMesh = this.scene.navMesh;
        } else {
            const chunk = this.scene.loadedChunks.get(`${this.chunkX},${this.chunkY}`);
            navMesh = chunk?.navMesh;
        };
        while (pathFound === false && pathChances < 10) {
            const point = new Phaser.Math.Vector2(Phaser.Math.RND.between(this.x - 250, this.x + 250), Phaser.Math.RND.between(this.y - 250, this.y + 250));
            if (navMesh.isPointInMesh(point) && this.body) {
                const direction = point.clone().subtract(this.position).normalize();
                const paddedCheck = new Phaser.Math.Vector2(
                    point.x + (direction.x * bodyPadding.x),
                    point.y + (direction.y * bodyPadding.y)
                );
                if (navMesh.isPointInMesh(paddedCheck)) {
                    pathPosition = point;
                    pathFound = true;
                };
            };
            pathChances++;
        };
        if (pathChances >= 10) return undefined;
        let patrolPath = navMesh.findPath(this.position, pathPosition);
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
        const timeToNextPoint = (distance / (speed * 0.5)) * 1000;
        return timeToNextPoint;
    };

    onHostileEnter = () => {
        this.currentTarget = this.scene.player;
        this.scene.hud.setupEnemy(this);
        this.enemyAnimation();
        // this.scene.navMesh.enableDebug();
        if (this.chaseTimer) {
            this.chaseTimer.remove(false);
            this.chaseTimer.destroy();
            this.chaseTimer = undefined;
        };
        this.calculatePath();
        this.chaseTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.calculatePath(),
            callbackScope: this,
            loop: true
        }); 
    };
    onHostileUpdate = (_dt: number) => {
        const ctx = this.getCombatContext();
        const distance = ctx.direction.ogLengthSq;
        if (distance < 70 ** 2) { // was 75 || 100
            const button = this.scene.hud.smallHud.getButton("dialog");
            if (button) this.scene.hud.smallHud.pressButton(button);
            this.stateMachine.setState(States.IDLE);
            return;
        };

        let moveDirection = this.pathingVector();

        if (!moveDirection) {
            if (ctx.direction.normal) {
                moveDirection = new Phaser.Math.Vector2(ctx.direction.x, ctx.direction.y);
            } else {
                const normal = ctx.direction.normalize();
                moveDirection = new Phaser.Math.Vector2(normal.x, normal.y);
            };
        };

        this.setVelocity(
            moveDirection.x * this.speed * ctx.climbingModifier,
            moveDirection.y * this.speed * ctx.climbingModifier
        );
        this.enemyAnimation();
        this.getDirection();
    };
    onHostileExit = () => {
        this.setVelocity(0);
        this.enemyAnimation();
        if (this.chaseTimer) {
            this.chaseTimer.destroy();
            this.chaseTimer = undefined;
        };
    };

    onAwarenessEnter = () => {
        this.setVelocity(0);
        this.enemyAnimation();
        this.currentTargetCheck();
        if (this.isCurrentTarget) {
            this.scene.hud.showDialog(true);
        };
    };
    onAwarenessUpdate = (_dt: number) => {
        this.enemyAnimation();
    };
    onAwarenessExit = () => {
        this.enemyAnimation();
        if (this.isCurrentTarget) {
            this.scene.hud.showDialog(false);
        };
    };

    onChaseEnter = () => {
        if (!this.currentTarget || this.chaseTimer) return;
        if (this.shouldLeash()) { // If enemy has mutliple 'enemies' could be an issue that it leashes while it should still be in 'combat'
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.enemyAnimation();
        // this.scene.navMesh.enableDebug();
        this.calculatePath();
        this.chaseTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.calculatePath(),
            callbackScope: this,
            loop: true
        }); 
    }; 
    onChaseUpdate = (_dt: number) => {
        if (this.shouldLeash()) { // If enemy has mutliple 'enemies' could be an issue that it leashes while it should still be in 'combat'
            this.stateMachine.setState(States.LEASH);
            return;
        };

        const ctx = this.getCombatContext();
        const mind = this.mindState;
        const distance = ctx.direction.ogLengthSq;
        const threshold = mind.minDistanceSq * ctx.multiplier;

        if (distance < threshold) { // was 75 || 100
            this.stateMachine.setState(States.COMBAT);
            return;
        };

        let moveDirection = this.pathingVector();

        if (!moveDirection) {
            if (ctx.direction.normal) {
                moveDirection = new Phaser.Math.Vector2(ctx.direction.x, ctx.direction.y);
            } else {
                const normal = ctx.direction.normalize();
                moveDirection = new Phaser.Math.Vector2(normal.x, normal.y);
            };
        };

        this.setVelocity(
            moveDirection.x * (this.speed + 0.5) * ctx.climbingModifier,
            moveDirection.y * (this.speed + 0.5) * ctx.climbingModifier
        );
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

    calculatePath = () => {
        // this.scene.navMesh.debugDrawClear();
        if (!this.currentTarget || !this.currentTarget.body || !this.currentTarget.position || !this.scene?.navMesh || this.isDeleting) {
            this.path = [];
            return;
        };
        this.path = this.scene.navMesh.findPath(this.position, this.currentTarget.position);
    };

    pathingVector = () => {
        if (!this.path || this.path.length <= 1) {
            if (this.isPathing) this.isPathing = false;
            return undefined;
        };

        if (!this.isPathing) this.isPathing = true;
        let nextPoint = this.path[1];
        const distanceToNextPoint = Phaser.Math.Distance.Between(this.position.x, this.position.y, nextPoint.x, nextPoint.y);

        if (distanceToNextPoint < 10) {
            this.path.shift();
            if (this.path.length <= 1) {
                this.isPathing = false;
                return undefined;
            };
            nextPoint = this.path[1];
        };
        
        return new Phaser.Math.Vector2(nextPoint.x, nextPoint.y)
            .subtract(this.position)
            .normalize();
    };

    shouldExitCombat = (): boolean => {
        if (!this.currentTarget || this.health <= 0) {
            this.inCombat = false;
            this.inComputerCombat = false;
            return true;
        };

        if (this.inCombat && this.scene.state.newPlayerHealth <= 0) {
            this.inCombat = false;
            return true;
        };

        if (this.inComputerCombat && this.currentTarget?.name === "enemy" && this.currentTarget?.health <= 0) {
            this.clearComputerCombatWin(this.currentTarget.enemyID);
            if (!this.computerEnemies()) {
                this.inComputerCombat = false;
            };
            return true;
        };

        return false;
    };

    shouldLeash = (): boolean => {
        if (!this.currentTarget || !this.currentTarget.body || !this.currentTarget.body.position || (!this.inCombat && !this.inComputerCombat)) return true;
        
        const rangeMultiplier = this.rangedDistanceMultiplier(2);
        const maxRange = RANGE[this.scene.scene.key] * rangeMultiplier;

        const isTooFarFromOrigin = 
            Math.abs(this.originPoint.x - this.position.x) > maxRange ||
            Math.abs(this.originPoint.y - this.position.y) > maxRange;

        const isTargetTooFar = this.currentTarget.position.distance(this.position) > maxRange;

        return isTargetTooFar || isTooFarFromOrigin;
    };

    computerEnemies = () => this.enemies.some((e: Enemy) => e.name === "enemy");

    swingCheck = () => {
        if (this.isSwinging) return;
        this.isSwinging = true;
        // if (this.inCombat) console.log("setting delayed call");
        this.scene.time.delayedCall(this.swingTime(), () => {
            this.isSwinging = false;
            this.currentAction = this.evaluateCombat();
            // if (this.inCombat) console.log("SWING!", { action: this.currentAction });
        }, undefined, this);
    };

    /* 
        One Hand: 2500
        Two Hand: 3000
        Per Level Reduction: 250 / 300
        Swing Speed Max: 500 / 600
    */

    swingTime = (): number => Math.max(0.2, 1 - (this.ascean.level - 1) * 0.1) * this.swingTimer;

    onCombatEnter = () => {
        if (this.shouldExitCombat()) return;
        this.anims.stop();
        this.enemyAnimation();
        this.swingCheck();
    };
    onCombatUpdate = (_dt: number) => this.evaluateCombatDistance();

    onContemplateEnter = () => {
        if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) {
            this.inCombat = false;
            this.inComputerCombat = false;
        };
        this.isContemplating = true;
        this.setVelocity(0);
        this.enemyAnimation();
        this.instincts();
    };
    onContemplateUpdate = (_dt: number) => {};
    onContemplateExit = () => {
        this.isContemplating = false;
        this.currentAction = "";
    };

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
    onEvasionUpdate = (_dt: number) => {
        if (this.isDodging === true) this.anims.play("player_slide", true);
        if (this.isRolling === true) this.anims.play("player_roll", true);        
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
        this.currentAction = "";
        this.attack();
    };
    onAttackUpdate = (_dt: number) => {
        if (!this.isRanged) this.swingMomentum(this.currentTarget);
        this.combatChecker(this.isAttacking);
    };
    onAttackExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = "";
        if (this.scene.state.computerAction !== "" && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, "", this.enemyID);
        this.setTint(ENEMY_COLOR);
        this.currentAction = "";
    };

    onParryEnter = () => {
        this.setTint(TARGET_COLOR);
        this.isParrying = true;
        this.currentAction = "";
        this.anims.play(FRAMES.PARRY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.isParrying = false);
    };
    onParryUpdate = (_dt: number) => {
        if (!this.isRanged) this.swingMomentum(this.currentTarget);
        this.combatChecker(this.isParrying);
    };
    onParryExit = () => {
        this.isParrying = false;
        this.currentAction = "";
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = "";
        if (this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, "", this.enemyID);
        this.setTint(ENEMY_COLOR);
    };

    onThrustEnter = () => {
        this.setTint(TARGET_COLOR);
        this.isThrusting = true;
        this.thrustAttack();
        this.currentAction = "";
    };
    onThrustUpdate = (_dt: number) => {
        if (!this.isRanged) this.swingMomentum(this.currentTarget);
        this.combatChecker(this.isThrusting);
    };
    onThrustExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = "";
        if (this.scene.state.computerAction !== "" && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, "", this.enemyID);
        this.setTint(ENEMY_COLOR);
        this.currentAction = "";
    };

    onDodgeEnter = () => {
        this.isDodging = true; 
        this.setTint(TARGET_COLOR);
        this.wasFlipped = this.flipX;
        (this.body as any).parts[1].position.y += PLAYER.SENSOR.DISPLACEMENT;
        (this.body as any).parts[1].circleRadius = PLAYER.SENSOR.EVADE;
        const body = (this.body as any).parts[3];
        const legs = (this.body as any).parts[2];
        if (!body.isSensor) {
            body.position.y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[2].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            body.vertices[1].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            legs.position.y += PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            legs.position.y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT;
        };
        legs.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[0].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
        this.handleAnimations();
    };
    onDodgeUpdate = (_dt: number) => this.combatChecker(this.isDodging); 
    onDodgeExit = () => {
        (this.body as any).parts[1].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        (this.body as any).parts[1].circleRadius = PLAYER.SENSOR.DEFAULT;
        const body = (this.body as any).parts[3];
        const legs = (this.body as any).parts[2];
        if (!body.isSensor) {
            body.position.y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[2].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            body.vertices[1].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            legs.position.y -= PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            legs.position.y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
        };
        legs.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[0].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
        this.setTint(ENEMY_COLOR);
    };

    onPostureEnter = () => {
        this.isPosturing = true;
        this.spriteShield.setVisible(true);
        this.currentAction = "";
        this.posture();
        this.setStatic(true);
    };
    onPostureUpdate = (_dt: number) => this.combatChecker(this.isPosturing);
    onPostureExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = "";
        if (this.scene.state.computerAction !== "" && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, "", this.enemyID);
        this.spriteShield.setVisible(false);
        this.setTint(ENEMY_COLOR);
        this.currentAction = "";
        this.setStatic(false);
    };

    onRollEnter = () => {
        this.isRolling = true; 
        this.setTint(TARGET_COLOR);
        const body = (this.body as any).parts[3];
        if (!body.isSensor) {
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[2].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y += PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT;
        };
        (this.body as any).parts[1].position.y += PLAYER.SENSOR.DISPLACEMENT;
        (this.body as any).parts[1].circleRadius = PLAYER.SENSOR.EVADE;
        (this.body as any).parts[2].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        (this.body as any).parts[2].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        this.handleAnimations();
        this.currentAction = "";
    };
    onRollUpdate = (_dt: number) => { 
        this.combatChecker(this.isRolling);
    };
    onRollExit = () => {
        if (this.inComputerCombat) this.computerCombatSheet.computerAction = "";
        if (this.scene.state.computerAction !== "" && this.isCurrentTarget) this.scene.combatManager.combatMachine.input(COMPUTER_ACTION, "", this.enemyID);
        const body = (this.body as any).parts[3];
        if (!body.isSensor) {
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[2].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y -= PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
        };
        (this.body as any).parts[1].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        (this.body as any).parts[1].circleRadius = PLAYER.SENSOR.DEFAULT;
        (this.body as any).parts[2].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        (this.body as any).parts[2].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        this.setTint(ENEMY_COLOR);
        this.currentAction = "";
    };

    onLeashEnter = () => {
        this.enemyAnimation();
        this.setTint(ENEMY_COLOR);
        if ((this.inComputerCombat || this.currentTarget) && !this.shouldLeash()) {
            const enemy = this.computerEnemyAttacker();
            if (enemy) {
                this.checkComputerEnemyCombatEnter(enemy);
                return;
            };
        };
        if (this.inCombat && this.scene.player.health > 0) {
            this.jumpIntoCombat();
        };
        this.inCombat = false;
        this.inComputerCombat = false;
        this.healthbar.setVisible(false);
        if (this.currentTarget !== undefined && this.currentTarget.name === "player") {
            this.currentTarget.removeTarget(this.enemyID);
            this.currentTarget = undefined;
        };
        if (this.currentTarget !== undefined && this.currentTarget.enemyID) {
            this.currentTarget = undefined;
        };
        this.currentAction = "";
        this.enemies = [];
        this.setSpecialCombat(false);
        this.leashTimer = this.scene.time.addEvent({
            delay: 1500, // 500
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
                    // this.enemyAnimation();
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
                this.setVelocity((this.pathDirection?.x ?? 0) * this.speed, (this.pathDirection?.y ?? 0) * this.speed); // 2.5
            } else {
                if (this.isPathing) this.isPathing = false;
                direction.normalize();
                this.setVelocity(direction.x * this.speed, direction.y * this.speed); // 2.5
            };
        } else {
            this.stateMachine.setState(States.IDLE);
        };
        this.enemyAnimation();
        this.getDirection();
    };
    onLeashExit = () => {
        this.setVelocity(0);
        this.leashTimer?.destroy();
        this.leashTimer = undefined;
        // this.scene.navMesh.debugDrawClear();
    };

    /*
        This will be the help, which will mimic fear, except chirp every so often to pull in a nearby ally, against the enemy

        Need to build one for summon as well, to maybe set it to the prayer animation, 
        and an enemy will fade into the world at some nearby coordinates, 
        set in combat against the currentTarget on behalf of the summoner
    */
    onHelpEnter = () => { 
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.fearDirection = "down";
        this.fearMovement = "idle";
        this.fearVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ""; 
        let iteration = 0;
        // this.scene.showCombatText(this, `Help me! Get ${this.currentTarget?.ascean.name} away from me!`, DURATION.TEXT, BONE, false, true);
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ["up", "down", "left", "right"];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === "up") {
                    this.fearVelocity = { x: 0, y: -1.5 };
                } else if (direction === "down") {
                    this.fearVelocity = { x: 0, y: 1.5 };
                } else if (direction === "right") {
                    this.fearVelocity = { x: -1.5, y: 0 };
                } else if (direction === "left") {
                    this.fearVelocity = { x: 1.5, y: 0 };
                };
                this.fearMovement = "move";
            } else {
                this.fearVelocity = { x: 0, y: 0 };
                this.fearMovement = "idle";                
            };
            this.fearDirection = direction;
        };
        this.fearTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                this.scene.showCombatText(this, HELP[Math.floor(Math.random() * HELP.length)], 1500, EFFECT, false, true);
                // chirp to get nearby enemy allies
                if (iteration === 3) {
                    iteration = 0;
                    this.isFeared = false;
                } else {   
                    randomDirection();
                };
                this.callForHelp();
            },
            callbackScope: this,
            repeat: 2,
        });
    };
    onHelpUpdate = (_dt: number) => {
        this.combatChecker(this.isFeared);
        this.setVelocity(this.fearVelocity.x, this.fearVelocity.y);
        if (Math.abs(this.velocity?.x as number) > 0 || Math.abs(this.velocity?.y as number) > 0) {
            this.getDirection();
            this.anims.play(FRAMES.RUNNING, true);
        } else {
            this.anims.play(FRAMES.IDLE, true);
        };
    };
    onHelpExit = () => {
        this.enemyAnimation();
        this.spriteWeapon.setVisible(true);
        if (this.isStalwart) this.spriteShield.setVisible(true);
        if (this.fearTimer) {
            this.fearTimer.destroy();
            this.fearTimer = undefined;
        };
    };

    onPushbackEnter = () => {
        this.scene.showCombatText(this, "Pushing Back", DURATION.TEXT, DAMAGE, false, true);
        this.isPraying = true;
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ""; 
        if (!this.isGlowing && !this.isCaerenic) this.checkCaerenic(true);
        this.enemyAnimation();
    };
    onPushbackUpdate = (_dt: number) => this.combatChecker(this.isPraying);
    onPushbackExit = () => {
        this.enemyAnimation();
        if (this.isGlowing && !this.isCaerenic) this.checkCaerenic(false);
        if (this.currentTarget) {
            this.applyKnockback(this.currentTarget, 250, true);
            this.scene.combatManager.hitFeedbackSystem.spotEmit(this.currentTarget.name === "player" ? this.currentTarget.playerID : this.currentTarget.enemyID, "Parry");
        };
    };

    onSummonEnter = () => { 
        this.scene.showCombatText(this, "Summoning Ally", DURATION.TEXT, DAMAGE, false, true);
        this.isPraying = true;
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ""; 
        if (!this.isGlowing && !this.isCaerenic) this.checkCaerenic(true);
        this.enemyAnimation();
    };
    onSummonUpdate = (_dt: number) => this.combatChecker(this.isPraying);
    onSummonExit = () => {
        this.enemyAnimation();
        this.scene.combatManager.summon(this);
        if (this.isGlowing && !this.isCaerenic) this.checkCaerenic(false);
    };

    combatChecker = (state: boolean) => {
        if (state) return;
        this.stateMachine.setState(States.CHASE);
    };

    getTargetId = (): string => this.currentTarget?.name === "player" ? this.currentTarget?.playerID : this.currentTarget?.enemyID;

    // ========================== CREATING ENHANCED ENEMY AI ========================= \\

    instincts = () => {
        if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) return;
        if (!this.isSpecial) {
            this.stateMachine.setState(States.CHASE);
            return;
        };
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
            let key = INSTINCTS[mastery][instinct].key, value = INSTINCTS[mastery][instinct].value;
            if (this.inCombat) this.scene.hud.logger.log(`${this.ascean.name}'s instinct leads them to ${value}.`);
            (this as any)[key].setState(value);
            if (key === "positiveMachine") this.stateMachine.setState(States.CHASE);
        }, undefined, this);
    };

    callForHelp = () => {
        const ctx = this.getCombatContext();
        // let help = false;
        if (ctx.allies) {
            for (let i = 0; i < ctx.allies.length; i++) {
                if (!ctx.allies[i]) continue;
                ctx.allies[i].callToArms(this.currentTarget);
                // help = true;
            };
        };
        // if (!help) {}; // Chirp
    };

    castAoE = () => {
        const aoes = ENEMY_AOE[this.ascean.mastery];
        const aoe = aoes[Math.floor(Math.random() * aoes.length)].toLowerCase();
        // if (this.inCombat) this.scene.hud.logger.log(`${this.ascean.name}'s instinct leads them to ${aoe}.`);
        const positive = specialPositiveMachines.includes(aoe);
        // console.log(`%c AoE: ${aoe} | Positive: ${positive}`, "color: #fdf6d8");
        if (positive) {
            this.positiveMachine.setState(aoe);
            this.stateMachine.setState(States.CHASE);
        } else {
            this.stateMachine.setState(aoe);
        };
    };

    randomHeal = () => this.stateMachine.setState(HEALS[Math.floor(Math.random() * HEALS.length)]);

    castHeal = (power: number, type: string) => {
        this.enemySound("phenomena", true);
        if (this.mindState.healPriority > 0) {
            const selfRatio = this.health / this.ascean.health.max;
            let mostInjured: Enemy | Player | Party | undefined = undefined;
            let lowestRatio = 1;
            const allies = this.getCombatContext().allies;
            for (const ally of allies) {
                if (!ally.ascean) continue;
                const ratio = ally.health / ally.ascean.health.max;
                if (ratio < lowestRatio) {
                    mostInjured = ally;
                    lowestRatio = ratio;
                };
            };
            if (mostInjured && lowestRatio < selfRatio) {
                if (mostInjured.name === "party") (mostInjured as unknown as Party).playerMachine.heal(power);
                if (mostInjured.name === "enemy") (mostInjured as Enemy).getHeal(power, type);
                if (mostInjured.name === "player") (mostInjured as unknown as Player).playerMachine.getHeal(power * 100);
                
                // if (mostInjured.name !== "player") this.scene.combatManager.checkPlayerFocus((mostInjured as Enemy | Party).enemyID, this.health);
                this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(mostInjured.x, mostInjured.y));
                return;
            };
        };
        this.getHeal(power, type);
    };

    getHeal = (power: number, type: string) => {
        // console.log({ power, type });
        const heal = Math.round(this.ascean.health.max * power);
        const total = Math.min(this.health + heal, this.ascean.health.max);

        if (this.inCombat) {
            if (this.isCurrentTarget) {
                this.scene.combatManager.combatMachine.action({ data: { key: NAME, value: total, id: this.enemyID, type }, type: HEALTH });
            } else {
                this.health = total;
                this.updateHealthBar(total);
            };
        } else {
            this.health = total;
            this.updateHealthBar(total);
        };
        this.computerCombatSheet.newComputerHealth = total;
        // this.scene.combatManager.checkPlayerFocus(this.enemyID, total);
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.x, this.y));
    };

    enterStealthAndFlank = () => {};

    rangedBlast = () => {
        if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) return;
        if ((!this.currentTarget || !this.currentTarget.body) && this.health > 0) {
            this.stateMachine.setState(States.COMBAT);
            return;
        };
        const mastery = this.ascean.mastery;
        const ranged = ENEMY_RANGED[mastery];
        const blast = ranged[Math.floor(Math.random() * ranged.length)];
        const positive = specialPositiveMachines.includes(blast);
        // console.log(`%c AoE: ${blast} | Positive: ${positive}`, "color: #fdf6d8");
        if (positive) {
            this.positiveMachine.setState(blast);
            this.stateMachine.setState(States.CHASE);
        } else {
            this.stateMachine.setState(blast);
        };
    };

    // ========================== SPECIAL ENEMY STATES ========================== \\
    onAchireEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting("Achire", PLAYER.DURATIONS.ACHIRE, CAST);
    };
    onAchireUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);        
        if (this.isSuccessful(PLAYER.DURATIONS.ACHIRE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onAchireExit = () => {
        if (this.castingSuccess === true) { 
            this.particleEffect = this.scene.particleManager.addEffect("achire", this, "achire", true);
            if (this.inCombat) EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name}'s Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.castingSuccess = false;
            this.enemySound("wild", true);
        };
        this.stopCasting("Countered Achire");
    };
    onAstraveEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.LONG)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Astrave", PLAYER.DURATIONS.ASTRAVE, CAST)
    };
    onAstraveUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.ASTRAVE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onAstraveExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.aoe = this.scene.aoePool.get("astrave", 1, true, this, false, this.scene.player, undefined, true);    
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} unearths the winds and lightning from the land of hush and tendril.`
                });
                this.scene.combatManager.useGrace(PLAYER.STAMINA.ASTRAVE);    
            };
        } else if (this.castingSuccess === true) { // CvC
            const enemy = this.scene.enemies.find((e: Enemy) => e.enemyID === this.targetID) || this.scene.party.find((p: Party) => p.enemyID === this.targetID);
            this.aoe = this.scene.aoePool.get("astrave", 1, true, this, false, enemy, undefined, true);    
        };
        this.enemySound("combat-round", this.castingSuccess);
        this.stopCasting("Countered Astrave");
    };

    onBlinkEnter = () => {
        const ctx = this.getCombatContext();
        const x = ctx.direction.lengthSq < this.mindState.minDistanceSq 
            ? this.flipX ? -35 : 35
            : this.flipX ? 35 : -35;
        this.setVelocityX(x);
        this.flickerCaerenic(500);
        this.scene.time.delayedCall(500, () => {
            const mapBounds = {
                minX: this.chunkX + 32,
                maxX: CHUNK_SIZE - 32,
                minY: this.chunkY + 32,
                maxY: CHUNK_SIZE - 32
            };
            const clampedX = Phaser.Math.Clamp(this.x, mapBounds.minX, mapBounds.maxX);
            const clampedY = Phaser.Math.Clamp(this.y, mapBounds.minY, mapBounds.maxY);
            this.setPosition(clampedX, clampedY);
            this.instincts();
        }, undefined, this);
        this.enemySound("caerenic", true);
    };
    onBlinkUpdate = (_dt: number) => {};
    onBlinkExit = () => {};
    onChiomismEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Chiomism", PLAYER.DURATIONS.CHIOMISM, DAMAGE);
    };
    onChiomismUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
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
                        EventBus.emit("special-combat-text", {
                            playerSpecialDescription: `You resist the laugh of the chiomic tongue.` // Menses wink wink
                        });
                    };
                };
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} bleeds and laughs at you with tendrils of Chiomyr.`
                });
                screenShake(this.scene);
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
        this.enemySound("death", this.castingSuccess);
        this.stopCasting("Countered Chiomism");
    };
    onConfuseEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Confusing", PLAYER.DURATIONS.CONFUSE, CAST);
    };
    onConfuseUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.CONFUSE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onConfuseExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.confuse(this.targetID);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean?.name} confuses you, causing you to stumble around in a daze.`
                });
            };
        } else {
            if (this.castingSuccess === true) this.scene.combatManager.confuse(this.targetID);
        };
        this.enemySound("combat-round", this.castingSuccess);
        this.stopCasting("Countered Confuse");
        this.instincts();
    };

    onDesperationEnter = () => this.startPraying();
    onDesperationUpdate = () => this.combatChecker(this.isPraying);
    onDesperationExit = () => {
        if (this.health <= 0) return;
        this.scene.showCombatText(this, "Desperation", PLAYER.DURATIONS.HEALING / 2, CAST, false, true);
        this.castHeal(0.5, "heals in desperation");
    };

    onFearingEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Fearing", PLAYER.DURATIONS.FEAR, CAST);
    };
    onFearingUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.FEAR)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onFearingExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.fear(this.targetID);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean?.name} strikes fear into you, causing you to panic in terror!`
                });
            };
        } else {
            if (this.castingSuccess === true) this.scene.combatManager.fear(this.targetID);
        };
        this.enemySound("combat-round", this.castingSuccess);
        this.stopCasting("Countered Fear");
        this.instincts();
    };
    onFrostEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.LONG)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Frost", PLAYER.DURATIONS.FROST, CAST);
    };
    onFrostUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.FROST)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onFrostExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.chiomic(75, this.targetID);
                this.scene.combatManager.slow(this.targetID, 3000);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} seizes into this world with Nyrolean tendrils, slowing you.`
                });
                screenShake(this.scene);
            };
        } else { // CvC
            if (this.castingSuccess === true) {
                this.chiomic(75, this.targetID);
                this.scene.combatManager.slow(this.targetID, 3000);
            };
        };
        this.enemySound("fire", this.castingSuccess);
        this.stopCasting("Countered Frost");
    };
    onHealingEnter = () => this.startCasting("Healing", PLAYER.DURATIONS.HEALING, CAST, false, false);
    onHealingUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.MAIERETH)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onHealingExit = () => {
        if (this.castingSuccess === true) this.castHeal(0.25, "heals");
        this.stopCasting("Countered Healing");
    };
    onHookEnter = () => {
        this.particleEffect = this.scene.particleManager.addEffect("hook", this, "hook", true);
        this.scene.showCombatText(this, "Hook", DURATION.TEXT, DAMAGE, false, true);
        this.enemySound("dungeon", true);
        this.flickerCaerenic(750);
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
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Ilirech", PLAYER.DURATIONS.ILIRECH, DAMAGE);
    };
    onIlirechUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.ILIRECH)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onIlirechExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.chiomic(100, this.targetID);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} rips into this world with Ilian tendrils entwining.`
                });
                screenShake(this.scene);
            };
        } else { // CvC
            if (this.castingSuccess === true) this.chiomic(100, this.targetID);
        };
        this.enemySound("fire", this.castingSuccess);
        this.stopCasting("Countered Ilirech");
    };
    
    onKyrisianEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Kyrisian", PLAYER.DURATIONS.KYRISIAN, DAMAGE);
    };
        
    onKyrisianUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
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
                        EventBus.emit("special-combat-text", {
                            playerSpecialDescription: `You resist the charm of the golden voice.` // Menses wink wink
                        });
                    };
                };
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} bleeds and bewitches you with tendrils of Kyrisos.`
                });
                screenShake(this.scene);
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
        this.enemySound("spooky", this.castingSuccess);
        this.stopCasting("Countered Kyrisian");
    };
    onKyrnaicismEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.startCasting("Kyrnaicism", PLAYER.DURATIONS.KYRNAICISM, DAMAGE, true);
        this.targetID = this.getTargetId();
        if (this.targetID === "") {
            this.isCasting = false;
            return;
        };
        if (this.currentTarget?.name === "player") {
            if (this.checkPlayerResist() === false) return;
        };
        this.enemySound("absorb", true);
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
                ++this.channelCount;
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
        if (this.isCasting) this.castbar.update(dt, "channel", "TENDRIL");
    };
    onKyrnaicismExit = () => {
        this.channelCount = 0;
        if (this.chiomicTimer) {
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
        };
        this.stopCasting("Countered Kyrnaicism");
    };

    onLeapEnter = () => {
        if ((!this.currentTarget || !this.currentTarget.body) && this.health > 0) {
            this.stateMachine.setState(States.COMBAT);
            return;
        };
        const target = new Phaser.Math.Vector2(this.currentTarget.x, this.currentTarget.y);
        const direction = target.subtract(this.position);
        const distance = direction.length();
        const buffer = this.currentTarget.hMoving() ? 40 : 0;
        let leap = Math.min(distance + buffer, 200);
        direction.normalize();
        this.flipX = direction.x < 0;
        // this.attack();
        const leapStartY = this.y;
        const arcHeight = 75; // Adjust this value for higher/lower arcs
        this.scene.combatManager.hitFeedbackSystem.trailing(this, true);
        this.scene.tweens.add({
            targets: this,
            scale: 1.2,
            duration: 400,
            ease: Phaser.Math.Easing.Back.InOut,
            yoyo: true,
        });

        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * leap),
            y: this.y + (direction.y * leap),
            duration: 800,
            ease: Phaser.Math.Easing.Back.InOut,
            onStart: () => {
                this.isAttacking = true;
                this.enemySound("leap", true);
                this.anims.play(FRAMES.GRAPPLE_ROLL, true);
            },
            onUpdate: (tween) => {
                const progress = tween.progress;
                const currentArc = Math.sin(progress * Math.PI) * arcHeight;
                this.y = leapStartY + (this.y - leapStartY) - currentArc;
            },
            onComplete: () => {
                this.anims.play(FRAMES.ATTACK, true).once(FRAMES.ANIMATION_COMPLETE, () => this.isAttacking = false);
                this.isLeaping = false; 
                const length = this.touching.length;
                if (length > 0) {
                    this.lastHitLocation = {
                        location: HitLocation.CHEST,
                        hitPoint: {x:0,y:0},
                        relativePosition: {x:0,y:0}
                    };
                    for (let i = 0; i < length; ++i) {
                        if (this.touching[i].name === "player") {
                            this.scene.combatManager.writhe(this.touching[i].playerID, this.enemyID, "leap");
                            this.scene.combatManager.useStamina(5);
                        } else { // CvC
                            this.scene.combatManager.computer({ type: "Weapon", payload: { action: "leap", origin: this.enemyID, enemyID: this.touching[i].enemyID } });
                        };
                    };
                };
                if (this.health > 0) this.stateMachine.setState(States.COMBAT);
            },
        });
        this.scene.showCombatText(this, "Leaping!", DURATION.TEXT, DAMAGE);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} leaps through the air!`
            });
        };
    };
    onLeapUpdate = (_dt: number) => {};
    onLeapExit = () => {
        this.evaluateCombatDistance();
        this.scene.combatManager.hitFeedbackSystem.trailing(this, false);
    };
    onLikyrEnter = () => {
        this.targetID = this.getTargetId();
        this.startCasting("Likyr", PLAYER.DURATIONS.LIKYR, DAMAGE);
    };
        
    onLikyrUpdate = (dt: number) => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.LIKYR)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onLikyrExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.suture(20, this.targetID);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} blends caeren into this world with Likyrish tendrils.`
                });
                screenShake(this.scene);
            };
        } else { // CvC
            if (this.castingSuccess === true) this.suture(20, this.targetID);
        };
        this.enemySound("debuff", this.castingSuccess);
        this.stopCasting("Countered Likyr");
    };
    onMaierethEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Maiereth", PLAYER.DURATIONS.MAIERETH, DAMAGE);
    };
        
    onMaierethUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
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
                        EventBus.emit("special-combat-text", {
                            playerSpecialDescription: `You resist the dread of the dripping Moon.` // Menses wink wink
                        });
                    };
                };
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} bleeds and strikes you with tendrils of Ma"anre.`
                });
                screenShake(this.scene);
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
        this.enemySound("spooky", this.castingSuccess);
        this.stopCasting("Countered Maiereth");
    };
    onParalyzeEnter = () => { 
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Paralyzing", PLAYER.DURATIONS.PARALYZE, CAST);
    };
    onParalyzeUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.PARALYZE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onParalyzeExit = () => {
        if (this.targetID === this.scene.player.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.paralyze(this.targetID);
                if (this.inCombat) EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} paralyzes you for several seconds!`
                });
            };
        } else {
            if (this.castingSuccess === true) this.scene.combatManager.paralyze(this.targetID);
        };
        this.enemySound("combat-round", this.castingSuccess);
        this.stopCasting("Countered Paralyze");
        this.instincts();
    };
    onPolymorphingEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Polymorphing", PLAYER.DURATIONS.POLYMORPH, CAST);
    };
    onPolymorphingUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.POLYMORPH)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onPolymorphingExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.polymorph(this.targetID);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} polymorphs you into a rabbit!`
                });
            };
        } else { // CvC
            if (this.castingSuccess === true) this.scene.combatManager.polymorph(this.targetID);
        };
        this.enemySound("combat-round", this.castingSuccess);
        this.stopCasting("Countered Polymorph");
        this.instincts();
    };

    onPursuitEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.LONG)) return;
        if (this.inCombat) this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
        if (this.currentTarget) {
            if (this.currentTarget.flipX) {
                this.setPosition(this.currentTarget.x + 16, this.currentTarget.y);
            } else {
                this.setPosition(this.currentTarget.x - 16, this.currentTarget.y);
            };
            if (!this.isGlowing && !this.isCaerenic) {
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
    onQuorEnter = () => this.startCasting("Quor", PLAYER.DURATIONS.QUOR, CAST, false, false);
    onQuorUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.QUOR)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onQuorExit = () => {
        if (this.castingSuccess === true) {
            this.particleEffect =  this.scene.particleManager.addEffect("quor", this, "quor", true);
            if (this.inCombat) EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name}'s Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.castingSuccess = false;
            this.enemySound("freeze", true);
        };
        this.stopCasting("Countered Quor");
    };
    onReconstituteEnter = () => {
        this.startCasting("Reconstituting", PLAYER.DURATIONS.RECONSTITUTE, HEAL, true, false);
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
        if (this.isCasting) this.castbar.update(dt, "channel", "HEAL");
    };
    onReconstituteExit = () => {
        this.castbar.reset();
        if (this.reconTimer) {
            this.reconTimer.remove(false);
            this.reconTimer = undefined;
        }; 
        this.stopCasting("Countered Reconstitute");
    };
    reconstitute = () => {
        if (this.isCasting === false || this.health <= 0 || this.isCounterSpelled === true) { // this.scene.state.computerWin === true || this.scene.state.playerWin === true ||
            this.isCasting = false;
            this.reconTimer?.remove(false);
            this.reconTimer = undefined;
            return;
        };
        this.castHeal(0.15, "reconstitutes");
        this.channelCount++;
        if (this.channelCount >= 5) {
            this.isCasting = false;
            this.channelCount = 0;
        };
    };

    onRushEnter = () => {
        this.isCasting = true;
        this.isRushing = true;
        this.enemySound("stealth", true);
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
            minX: this.chunkX + 32,
            maxX: CHUNK_SIZE - 32,
            minY: this.chunkY + 32,
            maxY: CHUNK_SIZE - 32
        };

        const clampedX = Phaser.Math.Clamp(targetX, mapBounds.minX, mapBounds.maxX);
        const clampedY = Phaser.Math.Clamp(targetY, mapBounds.minY, mapBounds.maxY);

        if (this.currentTarget?.name === "player") {
            this.isValidRushEnemy(this.currentTarget);
        } else if (this.currentTarget) {
            this.isValidComputerRushEnemy(this.currentTarget);
        };

        this.scene.combatManager.hitFeedbackSystem.trailing(this, true);
        // this.flickerCaerenic(600);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.isParrying = true;

        this.scene.tweens.add({
            targets: this,
            alpha: 0.25,
            ease: Phaser.Math.Easing.Quintic.InOut,
            duration: 300,
            yoyo: true
        });
        this.scene.tweens.add({
            targets: this,
            x: clampedX,
            y: clampedY,
            duration: 600,
            ease: "Circ.easeOut",
            onComplete: () => this.rushComplete(),
        });         
        this.scene.showCombatText(this, "Rush", 900, CAST);
    };

    onRushUpdate = (_dt: number) => {};
    onRushExit = () => {
        this.rushedEnemies = [];
        this.setAlpha(1);
        this.isCasting = false;
        this.evaluateCombatDistance();
        this.scene.combatManager.hitFeedbackSystem.trailing(this, false);
    };

    rushComplete = () => {
        const rush = this.rushedEnemies.length;
        if (rush > 0) {
            this.lastHitLocation = {
                location: HitLocation.CHEST,
                hitPoint: {x:0,y:0},
                relativePosition: {x:0,y:0}
            };
            for (let i = 0; i < rush; ++i) {
                const enemy = this.rushedEnemies[i];
                if (enemy?.name === "player") {
                    this.scene.combatManager.useStamina(5);
                    this.scene.combatManager.writhe(enemy.playerID, this.enemyID, "rush");
                } else if (this.inComputerCombat) { // CvC enemy.name === NAME && 
                    this.scene.combatManager.computer({ type: "Weapon", payload: { action: "rush", origin: this.enemyID, enemyID: enemy.enemyID } });
                };
            };
        };
        this.isRushing = false;
        if (this.health > 0) this.stateMachine.setState(States.CHASE);
    };
    
    onSacrificeEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.startPraying();
    };
    onSacrificeUpdate = (_dt: number) => this.combatChecker(this.isPraying);
    onSacrificeExit = () => {
        const id = this.getTargetId();
        if (id) {
            this.scene.showCombatText(this, "Sacrifice", 750, EFFECT, false, true);
            if (this.currentTarget?.name === "player") {
                if (!this.checkPlayerResist()) return;
                this.scene.combatManager.useGrace(10);
            };
            this.sacrifice(30, id);
            this.enemySound("combat-round", true);
        };
    };
        
    onSlowingEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.LONG)) return;
        this.startPraying();
    };
    onSlowingUpdate = (_dt: number) => this.combatChecker(this.isPraying);
    onSlowingExit = () => {
        const id = this.getTargetId();
        if (id) {
            this.scene.showCombatText(this, "Slow", 750, CAST, false, true);
            if (this.currentTarget?.name === "player") {
                if (!this.checkPlayerResist()) return;
                this.scene.combatManager.slow(id, 3000);
                this.scene.combatManager.useGrace(10);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} ensorcels your caeren, slowing you!`
                });
            } else { // CvC
                this.scene.combatManager.slow(id, 3000);
            };
            this.enemySound("debuff", true);
        };
    };
    
    onSnaringEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.LONG)) return;
        this.targetID = this.getTargetId();
        this.startCasting("Snaring", PLAYER.DURATIONS.SNARE, CAST);
    };
    onSnaringUpdate = (dt: number) => {
        this.counterCheck();
        if (this.isCasting === true) this.castbar.update(dt, CAST);
        if (this.isSuccessful(PLAYER.DURATIONS.SNARE)) {
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onSnaringExit = () => {
        if (this.targetID === this.scene?.player?.playerID) {
            if (this.castingSuccess === true && this.checkPlayerResist() === true) {
                this.scene.combatManager.useGrace(10);
                this.scene.combatManager.snare(this.targetID);
                EventBus.emit("enemy-combat-text", {
                    computerSpecialDescription: `${this.ascean.name} ensorcels and snares you!`
                }); 
                screenShake(this.scene);
            };
        } else { // CvC
            this.scene.combatManager.snare(this.targetID);
        };
        this.enemySound("debuff", this.castingSuccess);
        this.stopCasting("Countered Snare");
        this.instincts();
    };

    onSutureEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.startPraying();
    };
    onSutureUpdate = (_dt: number) => this.combatChecker(this.isPraying); // this.stateMachine.setState(States.CLEAN);
    onSutureExit = () => {
        const id = this.getTargetId();
        if (id) {
            this.scene.showCombatText(this, "Suture", 750, EFFECT, false, true);
            if (this.currentTarget?.name === "player") {
                if (!this.checkPlayerResist()) return;    
                this.scene.combatManager.useGrace(10);
            };
            this.suture(30, id);
            this.enemySound("debuff", true);
        };
    };

    onDevourEnter = () => {
        if (!this.currentTarget || !this.currentTarget.body || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.startCasting("Devouring", PLAYER.DURATIONS.TSHAERAL, DAMAGE, true);
        this.targetID = this.getTargetId();
        if (this.currentTarget?.name === "player") {
            if (!this.checkPlayerResist()) return;
            this.scene.combatManager.useGrace(15);
        };
        this.enemySound("absorb", true);
        this.channelCount = 0;
        this.devourTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => {
                if (this.isCasting === false || this.health <= 0 || this.isCounterSpelled === true) { // this.scene.state.computerWin || this.scene.state.playerWin || 
                    this.isCasting = false;
                    this.devourTimer?.remove(false);
                    this.devourTimer = undefined;
                    return;
                };
                this.devour(2.5, this.targetID);
                ++this.channelCount;
                if (this.channelCount >= 8) {
                    this.isCasting = false;
                    this.channelCount = 0;
                };
            },
            callbackScope: this,
            repeat: 8
        });
    };
    onDevourUpdate = (dt: number) => {
        this.counterCheck();
        this.combatChecker(this.isCasting);
        if (this.isCasting) this.castbar.update(dt, "channel", "TENDRIL");
    };
    onDevourExit = () => {
        this.channelCount = 0;
        if (this.devourTimer) {
            this.devourTimer.remove(false);
            this.devourTimer = undefined;
        };
        this.stopCasting("Countered Devour");
    };

    // ========================== SPECIAL META STATES ========================== \\

    onAbsorbEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.isAbsorbing = true;
        this.negationName = States.ABSORB;
        this.enemySound("absorb", true);
        this.scene.showCombatText(this, "Absorbing", 750, EFFECT, false, true);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, "aqua", PLAYER.DURATIONS.ABSORB);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ABSORB, () => {
            this.isAbsorbing = false;    
            if (this.negationBubble) {
                this.negationBubble.destroy();
                this.negationBubble = undefined;
                if (this.negationName === States.ABSORB) this.negationName = "";
            };    
        }, undefined, this);
        if (this.inCombat) EventBus.emit("enemy-combat-text", {
            computerSpecialDescription: `${this.ascean.name} warps oncoming damage into grace.`
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
        this.enemySound("absorb", true);
        this.scene.showCombatText(this, "Absorbed", 500, EFFECT, false, true);
        if (Math.random() < 0.2) {
            this.isAbsorbing = false;
        };
    };
    onChiomicEnter = () => {
        this.aoe = this.scene.aoePool.get("chiomic", 1, true, this);    
        this.scene.showCombatText(this, "Hah! Hah!", PLAYER.DURATIONS.CHIOMIC, EFFECT, false, true);
        this.isChiomic = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.isChiomic = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} mocks and confuses their surrounding foes.`
            });
        };
        this.enemySound("death", true);
    };
    onChiomicUpdate = (_dt: number) => {if (!this.isChiomic) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.isDiseasing = true;
        this.aoe = this.scene.aoePool.get("disease", 6, true, this);    
        this.scene.showCombatText(this, "Tendrils Swirl", 750, "tendril", false, true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.isDiseasing = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} swirls such sweet tendrils which wrap round and reach to writhe.`
            });
        };
        this.enemySound("dungeon", true);
    };
    onDiseaseUpdate = (_dt: number) => {if (!this.isDiseasing) this.positiveMachine.setState(States.CLEAN);};
    onDispelEnter = () => {
        if (this.currentTarget === undefined) return;
        this.enemySound("debuff", true);
        this.scene.showCombatText(this, "Dispelling", 750, EFFECT, false, true);
        this.flickerCaerenic(1000); 
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
        this.enemySound("caerenic", true);
        this.scene.showCombatText(this, "Enveloping", 750, CAST, false, true);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, "blue", PLAYER.DURATIONS.ENVELOP);
        this.reactiveName = States.ENVELOP;
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.isEnveloping = false;    
            if (this.reactiveBubble !== undefined && this.reactiveName === States.ENVELOP) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
                this.reactiveName = "";
            };    
        }, undefined, this);
        if (this.inCombat) EventBus.emit("enemy-combat-text", {
            computerSpecialDescription: `${this.ascean.name} envelops themself, shirking oncoming attacks.`
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
        this.enemySound("caerenic", true);
        this.scene.showCombatText(this, "Enveloped", 500, EFFECT, false, true);
        if (Math.random() < 0.2) {
            this.isEnveloping = false;
        };
    };
    onFreezeEnter = () => {
        this.aoe = this.scene.aoePool.get("freeze", 1, true, this);
        this.scene.showCombatText(this, "Freezing", PLAYER.DURATIONS.FREEZE, CAST, false, true);
        this.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.isFreezing = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} freezes nearby foes.`
            });
        };
        this.enemySound("freeze", true);
    };
    onFreezeUpdate = (_dt: number) => {if (!this.isFreezing) this.positiveMachine.setState(States.CLEAN);};

    onHowlEnter = () => {
        this.aoe = this.scene.aoePool.get("howl", 1, true, this);    
        this.scene.showCombatText(this, "Howling", PLAYER.DURATIONS.HOWL, DAMAGE, false, true);
        this.isHowling = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.isHowling = false;
            this.instincts();
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} howls, it's otherworldly nature stunning nearby foes.`
            });
        };
        this.enemySound("howl", true);
    };
    onHowlUpdate = (_dt: number) => {if (!this.isHowling) this.positiveMachine.setState(States.CLEAN);};

    onMaliceEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MALICE;
        this.isMalicing = true;
        this.scene.showCombatText(this, "Malice", 750, "hush", false, true);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, "purple", PLAYER.DURATIONS.MALICE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.isMalicing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MALICE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = "";
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} wracks malicious foes with the hush of their own attack.`
            });
        };
        this.enemySound("debuff", true);
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
        this.scene.showCombatText(this, "Malice", 750, "hush", false, true);
        if (id === this.scene?.player?.playerID) { // Player Combat
            if (this.checkPlayerResist() === true) {
                this.chiomic(10, id);
            };
        } else { // Computer Combat
            this.chiomic(10, id);
        };
        this.enemySound("debuff", true);
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
        this.scene.showCombatText(this, "Menacing", 750, "tendril", false, true);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, "dread", PLAYER.DURATIONS.MENACE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MENACE, () => {
            this.isMenacing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MENACE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = "";
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} seeks to menace oncoming attacks.`
            });
        };
        this.enemySound("scream", true);
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
        this.scene.showCombatText(this, "Menacing", 500, "tendril", false, true);
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
        this.enemySound("caerenic", true);
    };

    onMendEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MEND;
        this.isMending = true;
        this.scene.showCombatText(this, "Mending", 750, "tendril", false, true);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, "purple", PLAYER.DURATIONS.MEND);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.isMending = false;    
            if (this.reactiveBubble && this.reactiveName === States.MEND) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = "";
            };    
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} seeks to mend oncoming attacks.`
            });
        };
        this.enemySound("caerenic", true);
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

        this.scene.showCombatText(this, "Mending", 500, "tendril", false, true);
        const multiplier = Phaser.Math.Between(0.05, 0.1); // 0.075, 0.125
        const max = this.ascean.health.max;
        const mend = max * multiplier;
        const health = Math.min(max, this.health + mend);
        const playerID = this.scene.player.playerID;
        
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) this.isMending = false;

        if (id === playerID && this.isCurrentTarget) { // Player Combat
            this.scene.combatManager.combatMachine.action({ data: { key: NAME, value: health, id: this.enemyID }, type: HEALTH });
        } else if (id === playerID) { // Non Targerted Player Combat
            this.health = health;
            this.updateHealthBar(health);
            this.scene.showCombatText(this, `${mend}`, 1500, HEAL);
        } else { // Computer Combat
            this.health = health;
            this.updateHealthBar(health);
            this.scene.showCombatText(this, `${mend}`, 1500, HEAL);
            this.scene.combatManager.checkPlayerFocus(this.enemyID, this.health);
        };

        this.computerCombatSheet.newComputerHealth = this.health;
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.x, this.y));
        this.enemySound("caerenic", true);
    };

    onModerateEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MODERATE;
        this.enemySound("debuff", true);
        this.isModerating = true;
        this.scene.showCombatText(this, "Moderating", 750, CAST, false, true);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, "sapphire", PLAYER.DURATIONS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MODERATE, () => {
            this.isModerating = false;    
            if (this.reactiveBubble && this.reactiveName === States.MODERATE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = "";
            };
        }, undefined, this);
        if (this.inCombat) EventBus.emit("enemy-combat-text", {
            computerSpecialDescription: `${this.ascean.name} seeks to moderate oncoming attacks.`
        });
    };
    onModerateUpdate = (_dt: number) => {if (!this.isModerating) this.positiveMachine.setState(States.CLEAN);};

    moderate = (id: string) => {
        if (id === "") return;
        if (this.reactiveBubble === undefined || this.isModerating === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isModerating = false;
            return;
        };
        this.scene.combatManager.slow(id);
        this.enemySound("debuff", true);
        this.scene.showCombatText(this, "Moderated", 500, "tendril", false, true);
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
        this.scene.showCombatText(this, "Multifaring", 750, CAST, false, true);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, "ultramarine", PLAYER.DURATIONS.MULTIFARIOUS);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MULTIFARIOUS, () => {
            this.isMultifaring = false;    
            if (this.reactiveBubble && this.reactiveName === States.MULTIFARIOUS) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = "";
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} seeks to multifare oncoming attacks.`
            });
        };
        this.enemySound("combat-round", true);
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
        this.scene.showCombatText(this, "Multifared", 500, CAST, false, true);
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
        this.enemySound("combat-round", true);
    };

    onMystifyEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MYSTIFY;
        this.isMystifying = true;
        this.scene.showCombatText(this, "Mystifying", 750, EFFECT, false, true);
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, "chartreuse", PLAYER.DURATIONS.MYSTIFY);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MYSTIFY, () => {
            this.isMystifying = false;    
            if (this.reactiveBubble && this.reactiveName === States.MYSTIFY) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = "";
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} seeks to mystify oncoming attacks.`
            });
        };
        this.enemySound("debuff", true);
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
        this.scene.showCombatText(this, "Mystified", 500, EFFECT, false, true);
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
        this.enemySound("death", true);
    };

    onProtectEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.isProtecting = true;
        this.scene.showCombatText(this, "Protecting", 750, EFFECT, false, true);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, "gold", PLAYER.DURATIONS.PROTECT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.isProtecting = false;    
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };    
        }, undefined, this);
        if (this.inCombat) {
            this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} protects themself from oncoming attacks.`
            });
        };
    };
    onProtectUpdate = (_dt: number) => {if (!this.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRenewalEnter = () => {
        this.isRenewing = true;
        this.aoe = this.scene.aoePool.get("renewal", 6, false, this);    
        this.scene.showCombatText(this, "Hush Tears", 750, "bone", false, true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.isRenewing = false;
        });
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
            });
        };
        this.enemySound("shield", true);
    };
    onRenewalUpdate = (_dt: number) => {if (this.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        if (!this.inCombat && !this.inComputerCombat) return;
        this.aoe = this.scene.aoePool.get("scream", 1, true, this);  
        this.scene.showCombatText(this, "Screaming", 750, "hush", false, true);
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} screams, fearing nearby foes.`
            });
        };
        this.enemySound("scream", true);
    };
    onScreamUpdate = (_dt: number) => {if (!this.isScreaming) this.positiveMachine.setState(States.CLEAN);};

    onShadowEnter = () => {
        this.isShadowing = true;
        this.enemySound("wild", true);
        this.scene.showCombatText(this, "Shadowing", DURATION.TEXT, DAMAGE, false, true);
        this.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.isShadowing = false;
        }, undefined, this);
    };
    // onShadowExit = () => {};
    pursue = (id: string) => {
        this.enemySound("wild", true);
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
        this.scene.showCombatText(this, "Shielding", 750, "bone", false, true);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, "bone", PLAYER.DURATIONS.SHIELD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.isShielding = false;    
            if (this.negationBubble && this.negationName === States.SHIELD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = "";
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} shields themself from oncoming attacks.`
            });
        };
        this.enemySound("shield", true);    
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
        this.scene.showCombatText(this, "Shielded", 500, EFFECT, false, true);
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        if (this.negationBubble.charges <= 0) {
            this.scene.showCombatText(this, "Shield Broken", 500, DAMAGE, false, true);
            this.isShielding = false;
        };
        this.enemySound("shield", true);
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
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} shimmers, fading in and out of this world.`
            });
        };
        this.enemySound("stealth", true);
    };
    onShimmerUpdate = (_dt: number) => {if (!this.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmer = () => {
        if (this.inCombat) this.scene.sound.play("stealth", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this, `${this.ascean.name} simply wasn"t there`, 500, EFFECT);
    };

    onShirkEnter = () => {
        this.isShirking = true;
        this.enemySound("blink", true);
        this.scene.showCombatText(this, "Shirking", 750, EFFECT, false, true);
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

        this.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.isShirking = false;
            if (this.positiveMachine.isCurrentState(States.SHIRK)) this.positiveMachine.setState(States.CLEAN); 
        }, undefined, this); 
        if (this.inCombat) EventBus.emit("enemy-combat-text", {
            computerSpecialDescription: `${this.ascean.name}'s caeren's shirk grants reprieve, freeing them.`
        });
    };

    onSprintEnter = () => {
        this.isSprinting = true;
        this.adjustSpeed(PLAYER.SPEED.SPRINT);
        if (!this.isGlowing && !this.isCaerenic) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.isSprinting = false;
            if (this.isGlowing && !this.isCaerenic) this.checkCaerenic(false);
            this.adjustSpeed(-PLAYER.SPEED.SPRINT);
        });
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} taps into their caeren, bursting into an otherworldly sprint.`
            });
        };
        this.enemySound("blink", true);
    };
    onSprintUpdate = (_dt: number) => {if (!this.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onTetherEnter = () => {
        this.isTethering = true;
        this.enemySound("dungeon", true);
        this.scene.showCombatText(this, "Tethering", DURATION.TEXT, DAMAGE, false, true);
        this.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.isTethering = false;
            if (this.positiveMachine.isCurrentState(States.TETHER)) this.positiveMachine.setState(States.CLEAN);
        }, undefined, this);
    };

    tether = (id: string) => {
        this.enemySound("dungeon", true);
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
        this.scene.showCombatText(this, "Warding", 750, DAMAGE, false, true);
        this.negationBubble = new Bubble(this.scene, this.x, this.y, "red", PLAYER.DURATIONS.WARD);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.isWarding = false;    
            if (this.negationBubble && this.negationName === States.WARD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = "";
            };
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name} wards themself from oncoming attacks.`
            });
        };
        this.enemySound("combat-round", true);
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
        this.scene.showCombatText(this, "Warded", 500, EFFECT, false, true);
        if (this.negationBubble.charges <= 3) {
            this.scene.showCombatText(this, "Ward Broken", 500, DAMAGE, false, true);
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
        this.enemySound("parry", true);
    };

    onWritheEnter = () => {
        this.aoe = this.scene.aoePool.get("writhe", 1, true, this);    
        this.scene.showCombatText(this, "Writhing", 750, "tendril", false, true);
        this.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.isWrithing = false;
        }, undefined, this);
        if (this.inCombat) {
            EventBus.emit("enemy-combat-text", {
                computerSpecialDescription: `${this.ascean.name}'s caeren grips their body and contorts, writhing around them.`
            });
        };
        this.enemySound("spooky", true);
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
        this.shadow?.setVisible(!stealth);
        this.enemySound("stealth", true);
    };

    // ========================== STATUS EFFECT STATES ========================== \\

    onConfusedEnter = () => {
        this.isConfused = true;
        this.scene.showCombatText(this, "c .OnFu`Se D~", DURATION.TEXT, EFFECT, false, true);
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.confuseDirection = "down";
        this.confuseMovement = "idle";
        this.confuseVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ""; 
        if (!this.isGlowing && !this.isCaerenic) this.checkCaerenic(true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ["up", "down", "left", "right"];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === "up") {
                    this.confuseVelocity = { x: 0, y: -1.25 };
                } else if (direction === "down") {
                    this.confuseVelocity = { x: 0, y: 1.25 };
                } else if (direction === "right") {
                    this.confuseVelocity = { x: -1.25, y: 0 };
                } else if (direction === "left") {
                    this.confuseVelocity = { x: 1.25, y: 0 };
                };
                this.confuseMovement = "move";
            } else {
                this.confuseVelocity = { x: 0, y: 0 };
                this.confuseMovement = "idle";                
            };
            this.confuseDirection = direction;
        };
        const confusions = ["~?  ? ?!", "Hhwat?", "Wh-wor; -e ma i?", "Woh `re ewe?", "..."];

        this.confuseTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                if (iteration === 5) {
                    iteration = 0;
                    this.isConfused = false;
                } else {
                    randomDirection();
                    this.scene.showCombatText(this, confusions[Math.floor(Math.random() * confusions.length)], 1000, EFFECT);
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
            this.anims.play(FRAMES.RUNNING, true);
        } else {
            this.anims.play(FRAMES.IDLE, true);
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
        if (this.isGlowing && !this.isCaerenic) this.checkCaerenic(false);
    };

    onConsumedEnter = () => {
        this.consumedDuration = DURATION.CONSUMED;
        this.clearAnimations();
        this.consumedTimer = this.scene.time.addEvent({
            delay: 400,
            callback: () => {
                if (this.currentTarget && this.currentTarget.body && this.currentTarget.position) {
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
        this.anims.play(FRAMES.HURT, true);
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
        this.anims.play(FRAMES.HURT, true);
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
        this.scene.showCombatText(this, "F̶e̷a̴r̷e̵d̴", DURATION.TEXT, DAMAGE, false, true);
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.fearDirection = "down";
        this.fearMovement = "idle";
        this.fearVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ""; 
        if (!this.isGlowing  && !this.isCaerenic) this.checkCaerenic(true);
        let iteration = 0;
        const fears = ["Nooooooo!", "...ahhh!", "c̶o̷m̷e̷ ̴h̴e̵r̶e̶", "Stay Away!", "Somebody HELP ME", "g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓"];
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ["up", "down", "left", "right"];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === "up") {
                    this.fearVelocity = { x: 0, y: -1.25 };
                } else if (direction === "down") {
                    this.fearVelocity = { x: 0, y: 1.25 };
                } else if (direction === "right") {
                    this.fearVelocity = { x: -1.25, y: 0 };
                } else if (direction === "left") {
                    this.fearVelocity = { x: 1.25, y: 0 };
                };
                this.fearMovement = "move";
            } else {
                this.fearVelocity = { x: 0, y: 0 };
                this.fearMovement = "idle";                
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
                    this.scene.showCombatText(this, fears[Math.floor(Math.random() * fears.length)], 1000, EFFECT, false, true);
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
            this.anims.play(FRAMES.RUNNING, true);
        } else {
            this.anims.play(FRAMES.IDLE, true);
        };
    };
    onFearedExit = () => {
        this.enemyAnimation();
        this.spriteWeapon.setVisible(true);
        if (this.fearTimer) {
            this.fearTimer.destroy();
            this.fearTimer = undefined;
        };
        if (this.isGlowing && !this.isCaerenic) this.checkCaerenic(false);
    };

    onFrozenEnter = () => {
        if (this.isDeleting) return;
        this.scene.showCombatText(this, "Frozen", DURATION.TEXT, CAST, false, true);
        this.anims.play(FRAMES.IDLE, true);
        this.setTint(0x0000FF); // 0x888888
        this.setVelocity(0);
        // this.setStatic(true);
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
    onFrozenUpdate = (_dt: number) => {
        this.setVelocity(0);
    }; // this.combatChecker(this.isFrozen); 
    onFrozenExit = () => {
        if (this.isDeleting) return;
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        // this.setStatic(false);
    };

    onHurtEnter = () => {
        if (this.isDeleting) return;
        this.clearAnimations();
        this.clearTint();
        // this.setStatic(true);
        this.setVelocity(0);
        this.hurtTime = 0;
    };
    onHurtUpdate = (dt: number) => {
        this.hurtTime += dt;
        if (this.hurtTime >= 500) this.isHurt = false;
        this.anims.play(FRAMES.HURT, true);
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
        this.isHurt = false;
        // this.setStatic(false);
    };

    onParalyzedEnter = () => {
        if (this.isDeleting) return;
        this.scene.showCombatText(this, "Paralyzed", DURATION.TEXT, EFFECT, false, true);
        this.paralyzeDuration = DURATION.PARALYZED;
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.isDodging = false;
        this.currentAction = ""; 
        this.anims.pause();
        this.setTint(0x888888); // 0x888888
        // this.setStatic(true);
        this.setVelocity(0);
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
        // this.setStatic(false);
        this.anims.resume();
    };

    onPolymorphedEnter = () => {
        this.isPolymorphed = true;
        this.scene.showCombatText(this, "Polymorphed", DURATION.TEXT, EFFECT, false, true);
        this.clearAnimations();
        this.clearTint();
        this.anims.pause();
        this.anims.play("rabbit_idle_down", true);
        this.anims.resume();
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.polymorphDirection = "down";
        this.polymorphMovement = "idle";
        this.polymorphVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ""; 

        let iteration = 0;
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ["up", "down", "left", "right"];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === "up") {
                    this.polymorphVelocity = { x: 0, y: -1 };
                } else if (direction === "down") {
                    this.polymorphVelocity = { x: 0, y: 1 };
                } else if (direction === "right") {
                    this.polymorphVelocity = { x: -1, y: 0 };
                } else if (direction === "left") {
                    this.polymorphVelocity = { x: 1, y: 0 };
                };
                this.polymorphMovement = "move";
            } else {
                this.polymorphVelocity = { x: 0, y: 0 };
                this.polymorphMovement = "idle";                
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
                    this.scene.showCombatText(this, "...thump", 1000, EFFECT);
                    if (!this.specialPolymorph) {
                        if (this.isCurrentTarget && this.health < this.ascean.health.max) {
                            this.health = (this.health + (this.ascean.health.max * 0.15)) > this.ascean.health.max ? this.ascean.health.max : (this.health + (this.ascean.health.max * 0.15));
                            if (this.isCurrentTarget) {
                                this.scene.combatManager.combatMachine.action({ type: HEALTH, data: { key: NAME, value: this.health, id: this.enemyID } });
                            };
                        } else if (this.health < this.ascean.health.max) {
                            this.health = this.health + (this.ascean.health.max * 0.15);
                            this.updateHealthBar(this.health);
                        };
                        this.computerCombatSheet.newComputerHealth = this.health;
                        this.scene.combatManager.checkPlayerFocus(this.enemyID, this.health);
                    };
                };
            },
            callbackScope: this,
            repeat: 10,
        }); 
    };
    onPolymorphedUpdate = (_dt: number) => {
        this.combatChecker(this.isPolymorphed);
        this.anims.play(`rabbit_${this.polymorphMovement}_${this.polymorphDirection}`, true);
        this.setVelocity(this.polymorphVelocity.x, this.polymorphVelocity.y);
    };
    onPolymorphedExit = () => { 
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
        this.scene.showCombatText(this, "Stunned", 2500, EFFECT, false, true);
        this.stunDuration = DURATION.STUNNED;
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ""; 
        this.anims.pause();
        this.setTint(0x888888); // 0x888888
        // this.setStatic(true);
        this.setVelocity(0);

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
        // this.setStatic(false);
        this.anims.resume();
    };

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onRootedEnter = () => {
        if (this.isDeleting) return;
        this.scene.showCombatText(this, "Rooted", DURATION.TEXT, EFFECT, false, true);
        this.setTint(0x888888); // 0x888888
        this.setVelocity(0);
        // this.setStatic(true);
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
        this.setVelocity(0);
        this.anims.play(FRAMES.IDLE, true);
        // this.combatChecker(this.isRooted);
    };
    onRootedExit = () => {
        if (this.isDeleting) return;
        this.clearTint();
        this.setTint(ENEMY_COLOR);
        // this.setStatic(false);
        this.stateMachine.setState(States.CHASE);
    };

    onSlowedEnter = () => {
        this.scene.showCombatText(this, "Slowed", DURATION.TEXT, EFFECT, false, true);
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
        this.scene.showCombatText(this, "Snared", DURATION.TEXT, EFFECT, false, true);
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

    weaponActionSuccess = () => {
        if (!this.attackedTarget) return;
        let action = "";
        if (this.attackedTarget?.name === "player") {
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
                    this.scene.combatManager.combatMachine.action({ type: "Weapon", data: { key: COMPUTER_ACTION, value: this.particleEffect.action, id: this.enemyID, hitLocation: this.lastHitLocation } });
                } else {
                    this.scene.combatManager.combatMachine.action({ type: "Enemy", data: { enemyID: this.enemyID, ascean: this.ascean, caerenic: this.isCaerenic, stalwart: this.isStalwart, damageType: this.currentDamageType, combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.particleEffect.action, parry: this.parryAction, id: this.enemyID, hitLocation: this.lastHitLocation }}});
                };
                action = this.particleEffect.action;
                this.killParticle();
                if (action === States.HOOK) {
                    this.hook(this.attackedTarget, 1500);
                    return;
                };
            } else {
                if (this.isCurrentTarget) {
                    if (this.currentAction === "") return;
                    this.scene.combatManager.combatMachine.action({ type: "Weapon", data: { key: COMPUTER_ACTION, value: this.currentAction, id: this.enemyID, hitLocation: this.lastHitLocation } });
                } else {
                    this.scene.combatManager.combatMachine.action({ type: "Enemy", data: { 
                        enemyID: this.enemyID, ascean: this.ascean, caerenic: this.isCaerenic, stalwart: this.isStalwart, damageType: this.currentDamageType, 
                        combatStats: this.combatStats, weapons: this.weapons, health: this.health, actionData: { action: this.currentAction, parry: this.parryAction, id: this.enemyID, hitLocation: this.lastHitLocation }}
                    });
                };
                action = this.currentAction;
            }; 
            this.scene.combatManager.useStamina(1);
            if (this.attackedTarget.isMalcing || this.attackedTarget.isMenacing || this.attackedTarget.isModerating || this.attackedTarget.isMultifaring || this.attackedTarget.isMystifying) {
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
                this.scene.combatManager.computer({ type: "Weapon", payload: { action: this.particleEffect.action, origin: this.enemyID, enemyID: this.attackedTarget.enemyID } });
                action = this.particleEffect.action;
                this.killParticle();
                if (action === States.HOOK) {
                    this.hook(this.attackedTarget, 1500);
                    return;
                };
            } else {
                if (this.currentAction === "") return;
                this.scene.combatManager.computer({ type: "Weapon", payload: { action: this.currentAction, origin: this.enemyID, enemyID: this.attackedTarget.enemyID } });
                action = this.currentAction;
            };
            if (this.attackedTarget.isMenacing === true) this.attackedTarget.menace(this.enemyID);
            if (this.attackedTarget.isModerating === true) this.attackedTarget.moderate(this.enemyID);
            if (this.attackedTarget.isMultifaring === true) this.attackedTarget.multifarious(this.enemyID);
            if (this.attackedTarget.isMystifying === true) this.attackedTarget.mystify(this.enemyID);
            if (this.attackedTarget.isShadowing === true) this.attackedTarget.pursue(this.enemyID);
            if (this.attackedTarget.isTethering === true) this.attackedTarget.tether(this.enemyID);
        };
        this.applyKnockback(this.attackedTarget, 
            SWING_FORCE[this.weapons[0]?.grip] 
            * this.ascean[SWING_FORCE_ATTRIBUTE[this.weapons[0]?.attackType]] 
            * SWING_FORCE[action]);
        
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
                this.currentAction = "";
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
                this.currentAction = "";
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
            this.anims.play("player_slide", true);
            this.spriteWeapon.setVisible(false);
            if (this.dodgeCooldown === 0) this.enemyDodge();
        };
        if (this.isRolling) {
            this.anims.play("player_roll", true);
            this.spriteWeapon.setVisible(false);
            if (this.rollCooldown === 0) this.enemyRoll();
        }; 
    };

    swingMomentum = (target: Player | Enemy) => {
        if (!target || !target.body || !this.hMoving()) return;
        let direction = target.position.subtract(this.position);
        direction.normalize();
        this.setVelocity(direction.x * DISTANCE.MOMENTUM, direction.y * DISTANCE.MOMENTUM);
    };

    canEvaluateCombat = () => {
        return !this.isCasting && !this.isSuffering() && !this.isHurt && !this.isContemplating && !this.isDeleting && !this.isDefeated; // && this.currentTarget?.body?.position && this.scene?.children.exists(this.currentTarget)
    };

    cleanUpCombat() {
        if (this.inComputerCombat && this.currentTarget?.active && this.health > 0) {
            const enemy = this.computerEnemyAttacker();
            if (enemy?.active) {
                this.checkComputerEnemyCombatEnter(enemy);
                return;
            };
        };
        if (this.inCombat || this.inComputerCombat) { // Making a pass through
            this.clearComputerCombatWin("NULL");
            return; // Trying this out?
        };
        if (!this.isValidTarget(this.currentTarget) && this.health > 0 && !this.stateMachine.isCurrentState(States.LEASH)) {
            this.stateMachine.setState(States.LEASH);
        };
        this.inCombat = false;
        this.inComputerCombat = false;
        this.currentAction = "";
        this.enemies = [];
    };

    getCombatDirection() {
        if (!this.currentTarget) return undefined;
        if (this.cachedDirection && (this.scene.frameCount - this.cachedDirectionFrame) < 60) return this.cachedDirection;
        const x = this.currentTarget.x - this.x;
        const y = this.currentTarget.y - this.y;
        const lengthSq = x * x + y * y;
        this.cachedDirection = {
            x,
            y,
            lengthSq, // Pre-calculate this once
            normal: false,
            ogLengthSq: lengthSq,
            normalize: () => {
                const len = Math.sqrt(this.cachedDirection.lengthSq);
                if (len > 0) {
                    this.cachedDirection.x = x / len,
                    this.cachedDirection.y = y / len,
                    this.cachedDirection.normal = true,
                    this.cachedDirection.lengthSq = 1 // normalized vector has length 1
                };
                return this.cachedDirection;
            }
        };
        this.cachedDirectionFrame = this.scene.frameCount;  
        return this.cachedDirection;
    };

    isValidTarget(target: Enemy | Party | Player) {
        return target?.active && target?.body?.position && target.health > 0 && !target.isDeleting && !target.isDefeated; // && this.scene?.children.exists(target);
    };

    evaluateCombatDistance = () => {
        if (!this.canEvaluateCombat()) return;
        if (!this.isValidTarget(this.currentTarget)) {
            this.cleanUpCombat();
            return;
        };

        const ctx = this.getCombatContext();
        const mind = this.mindState;

        if (this.isRanged || (mind.keepDistance && this.ascean.level > 3)) {
            this.handleRangedCombat(ctx, mind);
        } else {
            this.handleMeleeCombat(ctx, mind);
        };
        
        this.handleAbilitiesAndCustomLogic(ctx, mind);
        this.swingCheck();
    };

    handleAbilitiesAndCustomLogic = (ctx: CombatContext, mind: MindState) => {
        if (this.ascean.level < 4) return;
        if (this.shouldCallForHelp(ctx, mind)) this.useHelpCall();
        if (this.shouldSummon(mind)) this.castSummon();
        if (mind.customEvaluate) mind.customEvaluate(this, ctx);
        if (mind.dynamicSwap) mind.dynamicSwap(this, ctx);
    };

    handleMeleeCombat = (ctx: CombatContext, mind: MindState) => {
        const attackThresholdSq = DISTANCE.ATTACK ** 2;
        const distanceSq = ctx.direction?.ogLengthSq || 0;
        const chaseThresholdSq = mind.chaseThresholdSq;
        
        if (distanceSq >= chaseThresholdSq) {
            this.stateMachine.setState(States.CHASE);
            return;
        };
        
        if (!this.stateMachine.isCurrentState(States.COMBAT)) this.stateMachine.setState(States.COMBAT);
        
        if (distanceSq > attackThresholdSq) {
            this.moveCloser(ctx);
            this.isPosted = false;
        } else {
            this.setVelocity(0);
            this.isPosted = true;
            if (!this.currentAction) this.anims.play(FRAMES.IDLE, true);
        };
    };

    handleRangedCombat = (ctx: CombatContext, mind: MindState) => {
        const distance = ctx.direction?.ogLengthSq || 0;
        const threshold = mind.minDistanceSq * ctx.multiplier;
        const thresholdMin = mind.minDistanceSq;
        const chaseThreshold = mind.chaseThresholdSq * ctx.multiplier;
        
        if (distance >= chaseThreshold) {
            // if (this.inCombat) console.log({ distance, chaseThreshold });
            this.stateMachine.setState(States.CHASE);
            return;
        }; 
        
        if (!this.stateMachine.isCurrentState(States.COMBAT) && this.isRanged) this.stateMachine.setState(States.COMBAT);
        
        if (distance > threshold) { // Move towards target
            this.moveCloser(ctx);
        } else if (distance < thresholdMin && !ctx.isTargetRanged) { // Keep distance from melee target
            this.moveAway(ctx);
            if (Phaser.Math.Between(1, 250) === 1 && !this.stateMachine.isCurrentState(States.EVADE)) this.stateMachine.setState(States.EVADE);
        } else if (ctx.lineOfSight && !this.stateMachine.isCurrentState(States.EVADE)) {
            this.stateMachine.setState(States.EVADE);
        } else if (ctx.distanceY < 15) { // Sweet spot for ranged enemies
            this.setVelocity(0);
            this.anims.play(FRAMES.IDLE, true);
        } else { // Adjust Y Position
            if (!ctx.direction.normal) ctx.direction.normalize();
            this.setVelocityY(ctx.direction.y * this.speed * ctx.climbingModifier);
        };
    };

    dummyDirection = (): CacheDirection => {
        const x = this?.x || 0;
        const y = this?.y || 0;
        return {
            x,
            y,
            lengthSq: 0,
            ogLengthSq: 0,
            normal: false,
            normalize: () => {
                const len = 0;
                if (len > 0) {
                    this.cachedDirection.x = x / len,
                    this.cachedDirection.y = y / len,
                    this.cachedDirection.normal = true,
                    this.cachedDirection.lengthSq = 1 // normalized vector has length 1
                };
                return this.cachedDirection;
            }
        };
    };

    getCombatContext(): CombatContext {
        if (this.combatContext && (this.scene.frameCount - this.combatContextFrame) < 90) return this.combatContext;
        const direction = this.getCombatDirection();
        if (!direction) {
            this.combatContext = {
                direction: this.dummyDirection(),
                multiplier: 1,
                climbingModifier: 1,
                allies: [],
                isTargetRanged: false,
                lineOfSight: true,
                distanceY: 0,
            };
            return this.combatContext;
        };

        const distanceY = Math.abs(direction.y);
        const climbingModifier = this.isClimbing ? 0.65 : 1;
        const allies = this.getNearbyAllies();
        const multiplier = this.rangedDistanceMultiplier(DISTANCE.RANGED_MULTIPLIER);

        this.combatContext = {
            direction,
            multiplier,
            distanceY,
            climbingModifier,
            allies,
            isTargetRanged: this.currentTarget.isRanged || false,
            lineOfSight: this.checkLineOfSight()
        };

        this.combatContextFrame = this.scene.frameCount;
        
        return this.combatContext;
    };

    getNearbyAllies = () => {
        if (!this.currentTarget) return [];
        if (this.currentTarget.name === "player") {
            const allies = this.scene.enemies.filter(e => e.inCombat);
            return allies;
        };
        const allies = this.currentTarget.enemies;
        return allies;
    };

    moveAway = (ctx: CombatContext) => {
        this.enemyAnimation();
        if (!ctx.direction.normal) ctx.direction.normalize();
        this.setVelocityX(ctx.direction.x * -this.speed * ctx.climbingModifier);
        this.setVelocityY(ctx.direction.y * -this.speed * ctx.climbingModifier);    
    };

    moveCloser = (ctx: CombatContext) => {
        this.enemyAnimation();
        if (!ctx.direction.normal) ctx.direction.normalize();
        this.setVelocityX(ctx.direction.x * this.speed * ctx.climbingModifier);
        this.setVelocityY(ctx.direction.y * this.speed * ctx.climbingModifier);
    };

    useHelpCall = () => {
        ++this.summons;
        this.scene.showCombatText(this, `${this.ascean.name} is calling for help!`, DURATION.TEXT, BONE, false, true);
        this.stateMachine.setState(States.HELP);
    };
    shouldCallForHelp = (ctx: CombatContext, mind: MindState) => {
        return this.summons <= 3 && ctx.allies.length > 1 && mind.callHelp && (this.health / this.ascean.health.max < 0.35) && !this.stateMachine.isCurrentState(States.HELP) && this.scene.scene.key === "Game";
    };

    castSummon = () => {
        ++this.summons;
        this.scene.showCombatText(this, `${this.ascean.name} is summoning help!`, DURATION.TEXT, BONE, false, true);
        this.stateMachine.setState(States.SUMMON);
    };
    shouldSummon = (mind: MindState) => {
        return mind.summon && this.summons === 0 && (this.health / this.ascean.health.max < 0.5) && !this.stateMachine.isCurrentState(States.SUMMON) && this.scene.scene.key === "Game";
    };

    checkEvasion = (particle: Particle) => {
        const dx = particle.effect.x - this.x;
        const dy = particle.effect.y - this.y;
        const dist2 = dx*dx + dy*dy;
        const thresh = DISTANCE.THRESHOLD - 25;
        return dist2 < (thresh*thresh) && !this.isPosted && !this.isCasting;
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
        if (!this.currentWeapon || this.currentWeaponSprite === this.imgSprite(this.currentWeapon)) return; // || this.enemyID !== this.scene.state.enemyID
        this.currentWeaponSprite = this.imgSprite(this.currentWeapon);
        this.spriteWeapon.setTexture(this.currentWeaponSprite);
        this.spriteWeapon.setScale(GRIP_SCALE[this.currentWeapon.type === "Dagger" ? this.currentWeapon.type : this.currentWeapon.grip]);
    };

    evaluateEnemyAnimation = () => {
        if (!this.cleanCombatAnimation()) return;
        if (this.isClimbing) {
            if (this.velMoving()) {
                this.anims.play(FRAMES.CLIMB, true);
            } else {
                this.anims.play(FRAMES.CLIMB, true);
                this.anims.pause();
            };
        } else {
            if (this.velMoving()) {
                this.anims.play(FRAMES.RUNNING, true);
            } else {
                this.anims.play(FRAMES.IDLE, true);
            };
        };
    };

    cleanCombatAnimation = () => this.stateMachine.isCurrentState(States.COMBAT) || this.stateMachine.isCurrentState(States.CHASE);

    distractedInCombat = () => this.isSuffering() || this.isCasting || this.isHurt || this.isPraying || this.isContemplating;

    outOfCombat = () => !(this.inCombat || this.inComputerCombat) || this.health <= 0;
    
    /* ----------------------------- 
        Update positions on visuals, 
        direction, particle effects.
        Sets combat state if capable
    -------------------------------- */
    evaluateEnemyState = () => {
        this.syncPositions();
        if (this.outOfCombat()) return;

        this.evaluateEnemyAnimation();
        this.getDirection();

        this.particleCheck();
        if (this.scene.frameCount % 10 === 0) this.currentTargetCheck();

        if (this.distractedInCombat()) return;
        
        if (this.isUnderRangedAttack()) {
            this.stateMachine.setState(States.EVADE);
        } else if (this.currentAction !== "") {
            this.stateMachine.setState(this.currentAction);
        };
    };
 
    update(dt: number) {
        this.evaluateEnemyState();
        this.stateMachine.update(dt);
        this.positiveMachine.update(dt);
        this.negativeMachine.update(dt);
        this.updatePositionHistory();
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