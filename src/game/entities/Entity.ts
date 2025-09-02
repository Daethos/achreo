import AoE from "../phaser/AoE";
import Beam from "../matter/Beam";
import Bubble from "../phaser/Bubble";
import CastingBar from "../phaser/CastingBar";
import HealthBar from "../phaser/HealthBar";
import Enemy from "./Enemy";
import Player from "./Player";
import Ascean from "../../models/ascean";
import Equipment from "../../models/equipment";
import { v4 as uuidv4 } from "uuid";
import { CombatStats, roundToTwoDecimals } from "../../utility/combat";
import { Particle } from "../matter/ParticleManager";
import { Game } from "../scenes/Game";
import { Underground } from "../scenes/Underground";
import { States } from "../phaser/StateMachine";
import { Arena } from "../scenes/Arena";
import { applyShieldFrameSettings, applyWeaponFrameSettings, SHIELD_ANIMATION_FRAME_CONFIG, WEAPON_ANIMATION_FRAME_CONFIG } from "../../utility/rotations";
import { Play } from "../main";
import { Tutorial } from "../scenes/Tutorial";
import Party from "./PartyComputer";
import { ENTITY_FLAGS, EntityFlag } from "../phaser/Collision";
import { Gauntlet } from "../scenes/Gauntlet";
import { ATTACK, BOW, NOBOW, POSTURE, ROLL, THRUST } from "../../utility/abilities";
import { PLAYER } from "../../utility/player";

export function assetSprite(asset: Equipment) {
    return asset.imgUrl.split("/")[3].split(".")[0];
};

export function calculateThreat(damage: number, currentHealth: number, totalHealth: number): number {
    const damageRatio = damage / currentHealth;
    const healthRatio = (totalHealth - currentHealth) / totalHealth;
    const relative = damageRatio + healthRatio;
    return relative;
};

export type Player_Scene = Game | Underground | Tutorial | Arena | Gauntlet;
type check = {[key: string]: number;};
type frame = {[key: string]: string;};
const FRAME_KEYS: frame = {
    "player_climb": "movingVertical",
    "player_crouch_idle": States.IDLE,
    "player_idle": States.IDLE,
    "player_running": States.MOVING,
    "run_down": "movingVertical",
    "run_up": "movingVertical",
    "swim_down": "movingVertical",
    "swim_up": "movingVertical",
    "player_health": "prayingCasting",
    "player_hurt": States.HURT,
    "player_pray": "prayingCasting",
    "player_attack_1": States.ATTACK,
    "player_slide": States.DODGE,
    "player_jump": States.JUMP,
    "player_attack_6": States.PARRY,
    "player_attack_3": States.POSTURE,
    "player_roll": States.ROLL,
    "player_attack_2": States.THRUST,
};
export const FRAMES = {
    ANIMATION_COMPLETE: "animationcomplete",
    CLIMB: "player_climb",
    CROUCH_IDLE: "player_crouch_idle",
    DEATH: "player_death",
    IDLE: "player_idle",
    RUNNING: "player_running",
    RUN_DOWN: "run_down",
    RUN_UP: "run_up",
    SWIM_DOWN: "swim_down",
    SWIM_UP: "swim_up",
    CAST: "player_health",
    HURT: "player_hurt",
    PRAY: "player_pray",
    ATTACK: "player_attack_1",
    DODGE: "player_slide",
    JUMP: "player_jump",
    LAND: "player_landing",
    PARRY: "player_attack_6",
    POSTURE: "player_attack_3",
    ROLL: "player_roll",
    THRUST: "player_attack_2",
};
export type ENEMY = {id:string; threat:number};

export const FRAME_COUNT: check = {
    ATTACK_DURATION: 700,
    ATTACK_LIVE: 16,
    ATTACK_SUCCESS: 39,
    ATTACK_FRAMES: 43,

    PARRY_DURATION: 450,
    PARRY_LIVE: 15, 
    PARRY_SUCCESS: 22,
    PARRY_KILL: 30, // 35,
    PARRY_FRAMES: 30,
    
    POSTURE_DURATION: 616,
    POSTURE_LIVE: 16, // 11 for frameRate: 12
    POSTURE_SUCCESS: 17, // 11 for frameRate: 12
    POSTURE_FRAMES: 36,

    ROLL_DURATION: 333,
    ROLL_LIVE: 10,
    ROLL_SUCCESS: 18,
    ROLL_FRAMES: 19,
    
    THRUST_DURATION: 316,
    THRUST_LIVE: 5, 
    THRUST_SUCCESS: 10,
    THRUST_FRAMES: 18,
    
    DISTANCE_CLEAR: 51,
    PRAY_DURATION: 983,
    PRAY_FRAMES: 58,
}; 
export const ENEMY_SWING_TIME = { "One Hand": 2500, "Two Hand": 3000 }; // 750, 1250 [old]
export const SWING_TIME = { "One Hand": 1250, "Two Hand": 1500 }; // 750, 1250 [old]
type Force = {[key:string]:number;};
export const SWING_FORCE: Force = { 
    "One Hand": 1, 
    "Two Hand": 1.25,
    "storm": 1.1,
    "leap": 1.1,
    "arc": 1.25,
    "quor": 1.25,
    "achire": 1.1,
    "attack": 1.1,
    "posture": 0.9,
    "roll": 0.75, 
    "thrust": 0.6, 
    "parry": 0,
    "hook": 0,
}; // 750, 1250 [old]
type Attribute = {[key: string]: string;};
export const SWING_FORCE_ATTRIBUTE: Attribute = {
    "Physical": "strength",
    "Magic": "caeren"
};
const GLOW_INTENSITY = 0.25;
const SPEED = 1.5
const DAMAGE_TYPES = { "magic": ["earth", "fire", "frost", "lightning", "righteous", "spooky", "sorcery", "wild", "wind"], "physical": ["blunt", "pierce", "slash"] };
const ACCELERATION_FRAMES = 10; 
const DAMPENING_FACTOR = 0.9; 
const KNOCKBACK_DURATION = 128;
export default class Entity extends Phaser.Physics.Matter.Sprite {
    declare scene: Play;
    ascean: Ascean;
    health: number;
    combatStats: CombatStats;
    stamina: number = 0;
    grace: number = 0;
    particleID: string;
    _position: Phaser.Math.Vector2;
    beam: Beam;
    castbar: CastingBar;
    healthbar: HealthBar;
    negationBubble: Bubble | undefined;
    reactiveBubble: Bubble | undefined;
    aoe: AoE;
    floor: boolean = true;
    
    hasMagic: boolean = false;
    hasBow: boolean = false;
    inWater: boolean = false;
    isCaerenic: boolean = false;
    isCasting: boolean = false;
    isClimbing: boolean = false;
    inCombat: boolean = false;
    inComputerCombat: boolean = false;
    isContemplating: boolean = false;
    isDefeated: boolean = false;
    isPosted: boolean = false;
    isRanged: boolean = false;

    isAttacking: boolean = false;
    isDodging: boolean = false;
    isJumping: boolean = false;
    isParrying: boolean = false;
    isPosturing: boolean = false;
    isRolling: boolean = false;
    isThrusting: boolean = false;

    isStalwart: boolean = false;
    isStealthing: boolean = false;
    isBlindsided: boolean = false;
    isConsuming: boolean = false;
    isDead: boolean = false;
    isHurt: boolean = false;
    isPraying: boolean = false;
    isStrafing: boolean = false;
    isAstrifying: boolean = false;
    isAbsorbing: boolean = false;
    isArcing: boolean = false;
    isChiomic: boolean = false;
    isEnveloping: boolean = false;
    isFreezing: boolean = false;
    isHealing: boolean = false;
    isLeaping: boolean = false;
    isMalicing: boolean = false;
    isMenacing: boolean = false;
    isMending: boolean = false;
    isModerating: boolean = false;
    isMultifaring: boolean = false;
    isMystifying: boolean = false;
    isProtecting: boolean = false;
    isPursuing: boolean = false;
    isRecovering: boolean = false;
    isReining: boolean = false;
    isRushing: boolean = false;    
    isShadowing: boolean = false;
    isShielding: boolean = false;
    isShimmering: boolean = false;
    isShirking: boolean = false;
    isSprinting: boolean = false;
    isStorming: boolean = false;
    isSuturing: boolean = false;
    isTethering: boolean = false;
    isTshaering: boolean = false;
    isWarding: boolean = false;
    isWrithing: boolean = false;
    
    isConfused: boolean = false;
    isConsumed: boolean = false;
    isFeared: boolean = false;
    isFrozen: boolean = false;
    isParalyzed: boolean = false;
    isPolymorphed: boolean = false;
    isRooted: boolean = false;
    isSlowed: boolean = false;
    isSnared: boolean = false;
    isStunned: boolean = false;

    isDetected: boolean = false;
    
    count = {
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

    currentTarget: any = undefined;
    actionAvailable: boolean = false;
    actionSuccess: boolean = false;
    actionTarget: any = undefined;
    actionParryable: boolean = false;
    attackedTarget: any = undefined;
    dodgeCooldown: number = 0;
    invokeCooldown: number = 0;
    playerBlessing: string = "";
    prayerConsuming: string = "";
    rollCooldown: number = 0;
    sensor: any = undefined;
    interacting: any[] = [];
    targets: any[] = [];
    touching: any[] = [];
    rushedEnemies: any[] = [];
    knockbackForce: number = 0.25;
    knockbackDirection = { x: 0, y: 0 };
    knockbackDuration: number = 250;
    spriteShield: Phaser.GameObjects.Sprite;
    spriteWeapon: Phaser.GameObjects.Sprite;
    frameCount: number = 0;
    timeElapsed: number = 0;
    currentWeaponSprite: string = "";
    particleEffect: Particle | undefined;
    stunDuration: number = 3000;
    currentDamageType: string = "";
    currentRound: number = 0;
    currentAction: string = "";
    polymorphDirection: string = "";
    polymorphMovement: string = "";
    scrollingCombatText: any | undefined;
    specialCombatText: any | undefined;
    resistCombatText: any | undefined;
    path: any[] = [];
    nextPoint: any;
    isPathing: boolean = false;
    canSwing: boolean = true;
    swingTimer: number = 0;
    isGlowing: boolean = false;
    glowing: boolean = false;
    glowWeapon: Phaser.Time.TimerEvent | undefined;
    glowHelm: Phaser.Time.TimerEvent | undefined;
    glowChest: Phaser.Time.TimerEvent | undefined;
    glowLegs: Phaser.Time.TimerEvent | undefined;
    glowSelf: Phaser.Time.TimerEvent | undefined;
    glowShield: Phaser.Time.TimerEvent | undefined;
    speed: number = 0;
    glowColor: number;
    weaponHitbox: Phaser.GameObjects.Arc;
    pathDirection: Phaser.Math.Vector2;
    chaseTimer: Phaser.Time.TimerEvent | undefined;
    leashTimer: Phaser.Time.TimerEvent | undefined;
    specialCombat: Phaser.Time.TimerEvent | undefined;
    originPoint: any = {}; // For Leashing
    originalPosition: Phaser.Math.Vector2;
    specialAction: string = "";
    isComputer: boolean = false;
    evadeType: number = 1;
    negationName: string = "";
    evadeRight: boolean = false;
    evadeUp: boolean = false;
    contemplationTime: number;
    chiomicTimer: Phaser.Time.TimerEvent | undefined;
    confuseTimer: Phaser.Time.TimerEvent | undefined;
    consumedTimer: Phaser.Time.TimerEvent | undefined;
    devourTimer: Phaser.Time.TimerEvent | undefined;
    fearTimer: Phaser.Time.TimerEvent | undefined;
    patrolTimer: Phaser.Time.TimerEvent | undefined;
    polymorphTimer: Phaser.Time.TimerEvent | undefined;
    reconTimer: Phaser.Time.TimerEvent | undefined;
    isDeleting: boolean = false;
    aoeMask: EntityFlag = ENTITY_FLAGS.NONE;
    evasionTimer: number = 0;
    summons: number = 0;
    lastX: number = 0;
    lastY: number = 0;
    updating: boolean = true;

    static preload(scene: Phaser.Scene) {
        scene.load.atlas("player_actions", "../assets/gui/player_actions.png", "../assets/gui/player_actions_atlas.json");
        scene.load.animation("player_actions_anim", "../assets/gui/player_actions_anim.json");
        scene.load.atlas("player_actions_two", "../assets/gui/player_actions_two.png", "../assets/gui/player_actions_two_atlas.json");
        scene.load.animation("player_actions_two_anim", "../assets/gui/player_actions_two_anim.json");
        scene.load.atlas("player_actions_three", "../assets/gui/player_actions_three.png", "../assets/gui/player_actions_three_atlas.json");
        scene.load.animation("player_actions_three_anim", "../assets/gui/player_actions_three_anim.json");
        scene.load.atlas("player_attacks", "../assets/gui/player_attacks.png", "../assets/gui/player_attacks_atlas.json");
        scene.load.animation("player_attacks_anim", "../assets/gui/player_attacks_anim.json");   
        scene.load.atlas("running", "../assets/gui/running.png", "../assets/gui/running_atlas.json");
        scene.load.animation("running_anim", "../assets/gui/running_anim.json");   
        scene.load.atlas("swimming", "../assets/gui/swimming.png", "../assets/gui/swimming_atlas.json");
        scene.load.animation("swimming_anim", "../assets/gui/swimming_anim.json");   
        scene.load.atlas("rabbit_idle", "../assets/gui/rabbit_idle.png", "../assets/gui/rabbit_idle_atlas.json");
        scene.load.animation("rabbit_idle_anim", "../assets/gui/rabbit_idle_anim.json");
        scene.load.atlas("rabbit_movement", "../assets/gui/rabbit_movement.png", "../assets/gui/rabbit_movement_atlas.json");
        scene.load.animation("rabbit_movement_anim", "../assets/gui/rabbit_movement_anim.json");
    };

    constructor (data: any) {
        let { scene, x, y, texture, frame, depth, name, ascean, health } = data;
        super (scene.matter.world, x, y, texture, frame);
        this.x += this.width / 2;
        this.y -= this.height / 2;
        this.depth = depth || 2;
        this.name = name;
        this.ascean = ascean;
        this.health = health;
        const id = uuidv4();
        this.particleID = id;
        this._position = new Phaser.Math.Vector2(this.x, this.y);
        this.scene.add.existing(this);
        this.setVisible(false);
        this.glowColor = this.setColor(this.ascean?.mastery);
        this.animationUpdate();
    };

    get position() {
        this._position.set(this.x, this.y);
        return this._position;
    };

    get velocity() {
        return this.body?.velocity;
    };

    startingSpeed = (entity: Ascean) => {
        let speed = SPEED;
        if (this.name === "player") {
            speed += this.scene.hud.settings.difficulty.playerSpeed || 0;
            speed += this.isCaerenic ? this.scene.hud.talents.talents.caerenic.enhanced ? PLAYER.SPEED.CAERENIC * 1.5 : PLAYER.SPEED.CAERENIC : 0;
        } else {
            speed += this.scene.hud.settings.difficulty.enemySpeed || 0;
        };
        const helmet = entity.helmet.type;
        const chest = entity.chest.type;
        const legs = entity.legs.type;
        let modifier = 0;
        const addModifier = (item: string) => {
            switch (item) {
                case "Leather-Cloth":
                    break;
                case "Leather-Mail":
                    modifier -= 0.01; // += 0.025;
                    break;
                case "Chain-Mail":
                    modifier -= 0.02; // += 0.0;
                    break;
                case "Plate-Mail":
                    modifier -= 0.03; // -= 0.025;
                    break;
                default:
                    break;
            };
        };
        addModifier(helmet);
        addModifier(chest);
        addModifier(legs);
        speed += modifier;
        return speed;
    };

    setGlow = (object: any, glow: boolean, type: string | undefined = undefined) => {
        this.glowColor = this.setColor(this.ascean?.mastery);
        this.scene?.glowFilter?.remove(object);
        if (!glow) {
            switch (type) {
                case "shield":
                    if (this.glowShield !== undefined) {
                        this.glowShield.remove(false);
                        this.glowShield.destroy();
                        this.glowShield = undefined;
                    };
                    break;
                case "weapon":
                    if (this.glowWeapon !== undefined) {
                        this.glowWeapon.remove(false);
                        this.glowWeapon.destroy();
                        this.glowWeapon = undefined;
                    };
                    break;
                default:
                    if (this.glowSelf !== undefined) {
                        this.glowSelf.remove(false);
                        this.glowSelf.destroy();
                        this.glowSelf = undefined;
                    };
                    break;
            };
            return;
        };
        this.updateGlow(object);
        switch (type) {
            case "shield":
                this.glowShield = this.scene.time.addEvent({
                    delay: 250, // 125 Adjust the delay as needed
                    callback: () => this.updateGlow(object),
                    loop: true,
                    callbackScope: this
                });
                break;
            case "weapon":
                this.glowWeapon = this.scene.time.addEvent({
                    delay: 250,
                    callback: () => this.updateGlow(object),
                    loop: true,
                    callbackScope: this
                });
                break;
            default:
                this.glowSelf = this.scene.time.addEvent({
                    delay: 250,
                    callback: () => this.updateGlow(object),
                    loop: true,
                    callbackScope: this
                });
                break;
        };
    };

    setColor = (mastery: string): number => {
        switch (mastery) {
            case "constitution": return 0xFDF6D8;
            case "strength": return 0xFF0000;
            case "agility": return 0x00FF00;
            case "achre": return 0x0000FF;
            case "caeren": return 0x800080;
            case "kyosir": return 0xFFD700;
            default: return 0xFFFFFF;
        };
    };

    removeGlow = () => {
        if (this.glowShield !== undefined) {
            this.glowShield.remove(false);
            this.glowShield.destroy();
            this.glowShield = undefined;
        };
        if (this.glowWeapon !== undefined) {
            this.glowWeapon.remove(false);
            this.glowWeapon.destroy();
            this.glowWeapon = undefined;
        };
        if (this.glowSelf !== undefined) {
            this.glowSelf.remove(false);
            this.glowSelf.destroy();
            this.glowSelf = undefined;
        };
    };

    updateGlow = (object: any) => {
        const glowFilter = this?.scene?.glowFilter;
        if (!glowFilter) {
            this.removeGlow();
            return;
        };
        let instance = glowFilter.get(object)[0];
        if (instance) {
            instance.outerStrength = 2 + Math.sin(this.scene.time.now * 0.005) * 2;
            instance.innerStrength = 2 + Math.cos(this.scene.time.now * 0.005) * 2;
        } else {
            glowFilter.add(object, {
                outerStrength: 2 + Math.sin(this.scene.time.now * 0.005) * 2,
                innerStrength: 2 + Math.cos(this.scene.time.now * 0.005) * 2,
                glowColor: this.glowColor,
                quality: GLOW_INTENSITY,
                knockout: true
            });
        };
    };

    adjustSpeed = (speed: number): number => {
        return this.speed += speed;
    };
    clearAnimations = () => {if (this.anims.currentAnim) this.anims.stop();};
    checkIfAnimated = () => this.anims.currentAnim ? true : false;

    attack = () => { 
        this.anims.play(FRAMES.ATTACK, true).once(FRAMES.ANIMATION_COMPLETE, () => {
            this.isAttacking = false;
            this.currentAction = "";
        }); 
    };
    parry = () => { 
        this.anims.play(FRAMES.PARRY, true).once(FRAMES.ANIMATION_COMPLETE, () => { 
            this.isParrying = false; 
            this.currentAction = "";
        });
    };
    posture = () => { 
        this.anims.play(FRAMES.POSTURE, true).once(FRAMES.ANIMATION_COMPLETE, () => {
            this.isPosturing = false;
            this.currentAction = "";
        }); 
    }; 
    thrustAttack = () => { 
        this.anims.play(FRAMES.THRUST, true).once(FRAMES.ANIMATION_COMPLETE, () => { 
            this.isThrusting = false; 
            this.currentAction = "";
        });
    };
    hurt = () => {
        this.clearAnimations();
        this.clearTint();
        this.anims.play(FRAMES.HURT, true).once(FRAMES.ANIMATION_COMPLETE, () => {
            this.isHurt = false;
            if (this.name === "enemy") this.setTint(0xFF0000);
            if (this.name === "party") this.setTint(0x00FF00);
        }); 
    };

    knockback(id: string) {
        const enemy = this.scene.getEnemy(id);
        if (enemy === undefined) return;
        const x = this.x > this.attackedTarget?.x ? -0.5 : 0.5;
        const y = this.y > this.attackedTarget?.y ? -0.5 : 0.5;
        this.knockbackDirection = { x, y };
        const accelerationStep = this.knockbackForce / ACCELERATION_FRAMES;
        let currentForce = 0; 
        const knockbackLoop = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            if (elapsed >= KNOCKBACK_DURATION)  return;
            if (currentForce < this.knockbackForce) currentForce += accelerationStep;
            const forceX = (this.knockbackDirection.x * currentForce);
            const forceY = (this.knockbackDirection.y * currentForce);
            const force = new Phaser.Math.Vector2(forceX, forceY);
            if (this.attackedTarget?.moving()) this.attackedTarget?.applyForce(force);
            currentForce *= DAMPENING_FACTOR;
            requestAnimationFrame(knockbackLoop);
        };
        let startTime: any = undefined;
        requestAnimationFrame(knockbackLoop);
        if ("vibrate" in navigator) navigator.vibrate(40);
    };

    teleport = (x: number, y: number) => {
        this.isPraying = true;
        this.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => {
            this.isPraying = false;
            this.setPosition(x, y);
        });
    };
    
    applyKnockback(target: Enemy | Player | Party, force = 10, override = false) {
        if (!override && (Number.isNaN(force) || force <= 0 || target.isTrying() || target.isPraying || target.isRolling || target.isCasting)) return;
        force *= 0.55;
        const angle = Phaser.Math.Angle.BetweenPoints(this, target);
        this.scene.tweens.add({
            targets: target,
            ease: Phaser.Math.Easing.Expo.Out,
            x: target.x + Math.cos(angle) * force,
            y: target.y + Math.sin(angle) * force,
            duration: 320,
        });
    };

    getDirection = () => {
        if (this.scene.frameCount % 6 !== 0) return;
        if (this.velocity?.x as number < 0) {
            this.setFlipX(true);
        } else if (this.velocity?.x as number > 0) {
            this.setFlipX(false);
        } else if (this.currentTarget && this.currentTarget.body) {
            const direction = this.currentTarget.position.subtract(this.position);
            if (direction.x < 0 && !this.flipX) {
                this.setFlipX(true);
            } else if (direction.x > 0 && this.flipX) {
                this.setFlipX(false);
            };
        };
    };

    handleIdleAnimations = () => {
        if (this.isCasting || this.isPraying) return;
        if (this.isClimbing) {
            this.anims.play(FRAMES.CLIMB, true);
            this.anims.pause();
        } else if (this.inWater) {
            this.anims.play(this.velocity?.y as number > 0 ? FRAMES.SWIM_DOWN : FRAMES.SWIM_UP, true);
        } else {
            this.anims.play(this.isStealthing ? FRAMES.CROUCH_IDLE : FRAMES.IDLE, true);
        };
    };

    handleMovementAnimations = () => {
        if (this.isClimbing) {
            this.anims.play(FRAMES.CLIMB, true);
        } else if (this.inWater) {
            this.anims.play(this.velocity?.y as number > 0 ? FRAMES.SWIM_DOWN : FRAMES.SWIM_UP, true);
        } else if (!this.xCheck()) {
            this.anims.play(this.velocity?.y as number > 0 ? FRAMES.RUN_DOWN : FRAMES.RUN_UP, true);
        } else {
            this.anims.play(FRAMES.RUNNING, true);
        };
    };

    handleTerrain = (): number => (this.isClimbing || this.inWater) ? 0.65 : 1;

    moving = (): boolean => {
        if (!this.body) return false;
        const moved = (Math.abs(this.x - this.lastX) > 0.1 || Math.abs(this.y - this.lastY) > 0.1);
        const velocityMoving = this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
        this.lastX = this.x;
        this.lastY = this.y;
        return moved || velocityMoving;
    };
    movingHorizontal = (): boolean => this.body?.velocity.x !== 0 && this.body?.velocity.y === 0;
    movingVertical = (): boolean => this.body?.velocity.x === 0 && this.body?.velocity.y !== 0;
    movingDown = (): boolean => this.body?.velocity.x === 0 && this.body?.velocity.y > 0;
    movingUp = (): boolean => this.body?.velocity.x === 0 && this.body?.velocity.y < 0;

    syncPositions = () => {
        if (!this.moving() || !(this.scene.frameCount & 1)) return;
        const { x, y } = this;
        if (this.spriteWeapon) this.spriteWeapon.setPosition(x, y);
        if (this.spriteShield) this.spriteShield.setPosition(x, y);
        if (this.healthbar) this.healthbar.update(this);
        if (this.reactiveBubble) this.reactiveBubble.update(x, y);
        if (this.negationBubble) this.negationBubble.update(x, y);
    };

    xCheck = () => this.velocity?.x !== 0;
    ailments = (): number => {
        let total = 0;
        if (this.isConfused) total += 2;
        if (this.isFeared) total += 2;
        if (this.isParalyzed) total += 2;
        if (this.isPolymorphed) total += 2;
        if (this.isStunned) total += 2;

        if (this.isFrozen) total++;
        if (this.isRooted) total++;
        if (this.isSlowed) total++;
        if (this.isSnared) total++;
        return total;
    };
    haleness = (): number => {
        let total = 0;
        if (this.reactiveBubble) total += 2;
        if (this.negationBubble) total += 2;
        if (this.isShadowing) total++;
        if (this.isSprinting) total++;
        if (this.isTethering) total++;
        return total;    
    };
    isTrying = (): boolean => this.isAttacking || this.isPosturing || this.isThrusting;
    isSuffering = (): boolean => this.isConfused || this.isFeared || this.isParalyzed || this.isPolymorphed || this.isStunned;
    sansSuffering = (ailment: string): boolean => {
        switch (ailment) {
            case "isConfused":
                return this.isFeared || this.isParalyzed || this.isPolymorphed || this.isStunned;
            case "isFeared":
                return this.isConfused || this.isParalyzed || this.isPolymorphed || this.isStunned;
            case "isParalyzed":
                return this.isConfused || this.isFeared || this.isPolymorphed || this.isStunned;
            case "isPolymorphed":
                return this.isConfused || this.isParalyzed || this.isParalyzed || this.isStunned;                        
            case "isStunned":
                return this.isConfused || this.isParalyzed || this.isParalyzed || this.isPolymorphed;    
            default: 
                return this.isConfused || this.isFeared || this.isParalyzed || this.isPolymorphed || this.isStunned;
        };
    };

    bowDamageType = () => this.currentDamageType === "pierce" || this.currentDamageType === "blunt" ? "arrow" : this.currentDamageType;

    checkActionSuccess = () => {
        if (this.name === "player" && !this.isStorming) {
            if (this.flipX) {
                this.weaponHitbox.setAngle(270);
            } else {
                this.weaponHitbox.setAngle(0);
            };
            if (this.isRolling) {
                this.weaponHitbox.x = this.x;
                this.weaponHitbox.y = this.y + 8;
            } else {
                this.weaponHitbox.x = this.x + (this.flipX ? -16 : 16);
                this.weaponHitbox.y = this.y;
            };
            if (this.velocity?.x as number > 0) {
                this.weaponHitbox.x += 16;
            } else if (this.velocity?.x as number < 0) {
                this.weaponHitbox.x -= 16;
            };
            if (this.velocity?.y as number > 0) {
                this.weaponHitbox.y += 16;
            } else if (this.velocity?.y as number < 0) {
                this.weaponHitbox.y -= 16;
            };
            if (this.touching.length > 0) {
                for (let i = 0; i < this.touching.length; i++) {
                    if (this.touching[i].health > 0) this.hitBoxCheck(this.touching[i]); // this.touching[i] !== target &&
                };
            };
        };
        if ((this.name === "enemy" || this.name === "party") && this.currentTarget && this.currentTarget.body) {
            const direction = this.currentTarget.position.subtract(this.position);
            const distance = direction.length();
            if (distance < FRAME_COUNT.DISTANCE_CLEAR && !this.currentTarget.isProtecting && this.currentTarget.health > 0) {
                this.attackedTarget = this.currentTarget;
                (this as unknown as Enemy | Party).weaponActionSuccess();
            } else {
                this.currentAction = "";
            };
        };
    };

    checkBow = (type: string) => type === "Bow" || type === "Greatbow";

    checkDamageType = (type: string, concern: string) => DAMAGE_TYPES[concern as keyof typeof DAMAGE_TYPES].includes(type);
    
    checkMeleeOrRanged = (weapon: Equipment) => {
        if (weapon === undefined) return;
        this.isRanged = weapon?.attackType === "Magic" || weapon?.type === "Bow" || weapon?.type === "Greatbow";
        if (this.name === "player") {
            this.swingTimer = SWING_TIME[weapon?.grip as keyof typeof SWING_TIME] || 1500;
            if (weapon?.grip === "One Hand") {
                this.weaponHitbox.radius = 24;
            } else {
                this.weaponHitbox.radius = 28;
            };
        } else {
            this.swingTimer = ENEMY_SWING_TIME[weapon?.grip as keyof typeof ENEMY_SWING_TIME] || 1000;
        };
        this.hasBow = this.checkBow(weapon.type);
    };

    checkPlayerResist = () => {
        if ((this.scene as Player_Scene).player.isShirking) {
            this.isCasting = false;
            (this.scene as Player_Scene).player.resist();
            return false;
        };
        const chance = Math.random() * 101;
        const playerResist = this.scene.state.stalwart.active ? this.scene.state.playerDefense?.magicalPosture as number / 4 : this.scene.state.playerDefense?.magicalDefenseModifier as number / 4;
        const enemyPenetration = this.combatStats?.attributes?.kyosirMod || 0;
        this.scene.hud.logger.log(`Enemy Special Chance: ${roundToTwoDecimals(chance)} | Player Resist: ${playerResist} | Enemy Penetration: ${enemyPenetration}`);
        const resist = playerResist - enemyPenetration; // 0 - 25% - 0 - 25%
        if (chance > resist) {
            return true;
        } else {
            this.isCasting = false;
            (this.scene as Player_Scene).player.resist();
            return false;
        };
    };

    rangedDistanceMultiplier = (num: number) => this.isRanged ? num : 1;

    entropicMultiplier = (power: number): number => Phaser.Math.Between(power * (this.ascean.level + 9) / 20, power * (this.ascean.level + 9) / 10);

    currentNegativeState = (type: string) => {
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

    imgSprite = (item: Equipment) => item.imgUrl.split("/")[3].split(".")[0];

    hitBoxCheck = (enemy: Enemy) => {
        if (!enemy || !enemy.body || !enemy.body.position || enemy.health <= 0) return; // enemy.isDefeated === true
        const weaponBounds = this.weaponHitbox.getBounds();
        const enemyBounds = enemy.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(weaponBounds, enemyBounds)) {
            this.attackedTarget = enemy;
            (this as any).weaponActionSuccess();
        };
    };

    outOfRange = (range: number) => {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget?.x as number, this.currentTarget?.y as number);
        if (distance > range) {
            this.scene.showCombatText(this as any, `Out of Range: -${Math.round(distance - range)}`, 1000, "damage", false, true);
            return true;    
        };
        return false;
    };

    hook = (target: Enemy, time: number) => {
        this.scene.tweens.add({
            targets: target,
            x: { from: target.x, to: this.x, duration: time },
            y: { from: target.y, to: this.y, duration: time }, 
            ease: Phaser.Math.Easing.Circular.InOut,
            onStart: () => this.beam.startEmitter(target, time),
            onComplete: () => this.beam.reset(),
            yoyo: false
        });
    };

    checkLineOfSight() {
        if (this.scene.scene.key === "Game") return false;
        const layer = (this.scene as Arena | Underground).groundLayer;
        const line = new Phaser.Geom.Line(this.currentTarget?.x, this.currentTarget?.y, this.x, this.y);
        const points = line.getPoints(30);  // Adjust number of points based on precision
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const tile = this.scene.map.getTileAtWorldXY(point.x, point.y, false, this.scene.cameras.main, layer);
            if (tile && tile.properties.wall) {
                return true;  // Wall is detected
            };
        };
        return false;  // Clear line of sight
    };

    getEnemyParticle = () => {
        return this.currentTarget?.particleEffect
            ? this.scene.particleManager.getEffect(this.currentTarget.particleEffect.id)
            : undefined;
    };

    particleCheck = () => {
        const effect = this.particleEffect;
        if (!effect) return;
        if (effect.success) {
            effect.success = false;
            effect.triggered = true;
            (this as any).weaponActionSuccess();
        } else if (effect.collided) {
            this.particleEffect = undefined;
        } else if (!effect.effect?.active) {
            this.particleEffect = undefined;
        };
    };

    particleAoe = (effect: Particle) => this.scene.aoePool.get(effect.key.split("_effect")[0], 3, false, undefined, false, undefined, {effect, entity:this as any});

    liveAction = (duration: string, frames: string) => Math.floor(this.timeElapsed / FRAME_COUNT[duration] * FRAME_COUNT[frames]);

    getState = (anim: any): string => FRAME_KEYS[anim.key];

    startHandlers: Record<string, (frame: any) => void> = {
        prayingCasting: (frame) => {
            const frameIndex = frame.index;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.prayingCasting.flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.prayingCasting.noFlipX;
        
            this.spriteWeapon.setDepth(this.depth + 1);
            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);
        },

        parry: (frame) => {
            const frameIndex = frame.index;
            const configKey = this.hasBow ? BOW : NOBOW;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.parrying[configKey].flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.parrying[configKey].noFlipX;
        
            this.spriteWeapon.setDepth(1);
            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);
        },

        thrust: (frame) => {
            const frameIndex = frame.index;
            const configKey = this.hasBow ? BOW : NOBOW;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.thrusting[configKey].flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.thrusting[configKey].noFlipX;

            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);
        },

        posture: (frame) => {
            const frameIndex = frame.index;
            const configKey = this.hasBow ? BOW : NOBOW;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.posturing[configKey].flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.posturing[configKey].noFlipX;

            const shieldConfig = this.flipX
                ? SHIELD_ANIMATION_FRAME_CONFIG.posturing.flipX
                : SHIELD_ANIMATION_FRAME_CONFIG.posturing.noFlipX
                
            this.spriteWeapon.setDepth(this.depth + 1);
            this.spriteShield.setAlpha(1).setDepth(this.depth + 1).setScale(0.6);
            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);
            applyShieldFrameSettings(this.spriteShield, shieldConfig, frameIndex);
        },

        attack: (frame) => {
            const frameIndex = frame.index;
            const configKey = this.hasBow ? BOW : NOBOW;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.attacking[configKey].flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.attacking[configKey].noFlipX;
            
            this.spriteWeapon.setDepth(1);
            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);
        },

        dodge: (_frame) => {
            this.spriteShield?.setVisible(false);
        },

        roll: (_frame) => {
            this.spriteShield?.setVisible(false);
        },

        movingVertical: (_frame) => {
            this.spriteShield?.setVisible(true);
            this.spriteShield?.setAngle(0);
            if (this.movingDown()) {
                this.spriteShield?.setDepth(this.depth - ((this.isStalwart || this.isClimbing) ? -1 : 1));
                this.spriteWeapon?.setDepth(this.depth + 1);
            } else {
                this.spriteShield?.setDepth(this.depth + (this.isStalwart ? -1 : 1));
                this.spriteWeapon?.setDepth(this.depth - 1);
            };
            if (!this.flipX) {
                this.spriteShield?.setFlipX(false);
                if (this.hasBow) {
                    this.spriteWeapon?.setOrigin(0.25, 0.25);
                    this.spriteWeapon?.setAngle(107.5);
                } else {
                    this.spriteWeapon?.setOrigin(-0.2, 0.75);
                    this.spriteWeapon?.setAngle(107.5);
                };
                if (this.isStalwart) {
                    this.spriteShield?.setScale(0.6);
                    this.spriteShield?.setAlpha(1);
                    this.spriteShield?.setOrigin(0, 0.5);
                } else {
                    this.spriteShield?.setAlpha(0.75);
                    this.spriteShield?.setScale(0.35, 0.6);
                    if (this.isClimbing) {
                        this.spriteShield?.setOrigin(0.4, 0.5);
                    } else {
                        this.spriteShield?.setOrigin(0.2, 0.5);
                    };
                };
            } else {
                this.spriteShield?.setFlipX(true);
                if (this.hasBow) {
                    this.spriteWeapon?.setOrigin(0, 0.5);
                    this.spriteWeapon?.setAngle(-7.5);
                } else {
                    this.spriteWeapon?.setOrigin(0.2, 1.2);
                    this.spriteWeapon?.setAngle(-194.5);
                };
                if (this.isStalwart) {
                    this.spriteShield?.setScale(0.6);
                    this.spriteShield?.setAlpha(1);
                    this.spriteShield?.setOrigin(1, 0.5);
                } else {
                    this.spriteShield?.setAlpha(0.75);
                    this.spriteShield?.setScale(0.35, 0.6);
                    if (this.isClimbing) {
                        this.spriteShield?.setOrigin(0.6, 0.5);
                    } else {
                        this.spriteShield?.setOrigin(0.8, 0.5);
                    };
                };
            };
        },

        moving: () => {
            this.spriteShield?.setVisible(true);
            this.spriteShield?.setFlipX(this.flipX);
            if (this.flipX) {
                if (this.hasBow) {
                    this.spriteWeapon?.setDepth(1);
                    this.spriteWeapon?.setOrigin(0.25, 0.5);
                    this.spriteWeapon?.setAngle(-7.5);
                } else {
                    this.spriteWeapon?.setDepth(this.depth + 1);
                    this.spriteWeapon?.setOrigin(0.5, 1.2);
                    this.spriteWeapon?.setAngle(-194.5);
                };
                if (this.isStalwart) {
                    this.spriteShield?.setOrigin(1, 0.25);
                    this.spriteShield?.setScale(0.6);
                    this.spriteShield?.setAlpha(1);
                    this.spriteShield?.setDepth(this.depth + 1);
                } else {
                    this.spriteShield?.setAlpha(0.75);
                    this.spriteShield?.setOrigin(0.25, 0.5);
                    this.spriteShield?.setScale(0.35, 0.6);
                    this.spriteShield?.setAngle(-40);
                    this.spriteShield?.setDepth(this.depth - 1);
                };
            } else {  
                if (this.hasBow) {
                    this.spriteWeapon?.setDepth(1);
                    this.spriteWeapon?.setOrigin(0.5, 0.25);
                    this.spriteWeapon?.setAngle(107.5);
                } else {
                    this.spriteWeapon?.setDepth(this.depth + 1);
                    this.spriteWeapon?.setOrigin(-0.25, 0.5);
                    this.spriteWeapon?.setAngle(107.5);
                };
                if (this.isStalwart) {
                    this.spriteShield?.setOrigin(0, 0.25);
                    this.spriteShield?.setScale(0.6);
                    this.spriteShield?.setAlpha(1);
                    this.spriteShield?.setDepth(this.depth + 1);
                } else {
                    this.spriteShield?.setAlpha(0.75);
                    this.spriteShield?.setOrigin(0.75, 0.5);
                    this.spriteShield?.setScale(0.35, 0.6);
                    this.spriteShield?.setAngle(40);
                    this.spriteShield?.setDepth(this.depth - 1);
                };
            };
        },

        idle: () => {
            this.spriteShield?.setVisible(true);
            this.spriteShield?.setAngle(0);
            this.spriteShield?.setDepth(this.depth - 1);
            if (this.flipX) {
                if (this.hasBow) {
                    this.spriteWeapon?.setDepth(this.depth + 1);
                    this.spriteWeapon?.setOrigin(0.15, 0.85);
                    this.spriteWeapon?.setAngle(90);
                } else {
                    this.spriteWeapon?.setDepth(1);
                    this.spriteWeapon?.setOrigin(-0.25, 1.2);
                    this.spriteWeapon?.setAngle(-250);
                };
                this.spriteShield?.setFlipX(true);
                if (this.isStalwart) {
                    this.spriteShield?.setAlpha(1);
                    this.spriteShield?.setOrigin(1, 0.3);
                    this.spriteShield?.setScale(0.6);
                } else {
                    this.spriteShield?.setScale(0.35, 0.6);
                    this.spriteShield?.setAlpha(0.75);
                    this.spriteShield?.setOrigin(0.25, 0.5);
                };
            } else {
                if (this.hasBow) {
                    this.spriteWeapon?.setDepth(this.depth + 1);
                    this.spriteWeapon?.setOrigin(0.85, 0.1);
                    this.spriteWeapon?.setAngle(0);
                } else {
                    this.spriteWeapon?.setDepth(1);
                    this.spriteWeapon?.setOrigin(-0.15, 1.3);
                    this.spriteWeapon?.setAngle(-195);
                };
                this.spriteShield?.setFlipX(false);
                if (this.isStalwart) {
                    this.spriteShield?.setAlpha(1);
                    this.spriteShield?.setScale(0.6);
                    this.spriteShield?.setOrigin(0, 0.3);
                } else {
                    this.spriteShield?.setAlpha(0.75);
                    this.spriteShield?.setScale(0.35, 0.6);
                    this.spriteShield?.setOrigin(0.75, 0.5);
                };
            };
        }
    };

    updateHandlers: Record<string, (frame: any) => void> = {
        // movingVertical: (frame) => {
        //     console.log({index:frame.index});
        //     if (frame.index === 4) {
        //         this.scene.pause();
        //     };
        // },

        prayingCasting: (frame) => {
            const frameIndex = frame.index;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.prayingCasting.flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.prayingCasting.noFlipX;

            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);
        },

        parry: (frame) => {
            const frameIndex = frame.index;
            const configKey = this.hasBow ? BOW : NOBOW;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.parrying[configKey].flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.parrying[configKey].noFlipX;

            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);

            if (frameIndex === 3 && !this.isRanged) {
                this.currentAction = States.PARRY;
                if (this.name === "player") {
                    this.scene.combatManager.combatMachine.input("action", States.PARRY);
                } else if (this.name === "enemy") {
                    if (this.inComputerCombat) (this as unknown as Enemy).computerCombatSheet.computerAction = States.PARRY;
                    if ((this as unknown as Enemy).isCurrentTarget) this.scene.combatManager.combatMachine.input("computerAction", States.PARRY, (this as unknown as Enemy).enemyID);
                } else if (this.name === "party") {
                    if (this.inComputerCombat) (this as unknown as Party).computerCombatSheet.computerAction = States.PARRY;
                };
            } else if (frameIndex === 5 && !this.isRanged) {
                this.checkActionSuccess();
            } else if (frameIndex >= 6) {
                this.currentAction = "";
                if ((this as unknown as Enemy).isCurrentTarget) this.scene.combatManager.combatMachine.input("computerAction", "", (this as unknown as Enemy).enemyID);
                this.isParrying = false;
            };
        },

        thrust: (frame) => {
            const frameIndex = frame.index;
            if (frameIndex === 2) {
                if (this.isRanged) {
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect(THRUST, this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect(THRUST, this, this.bowDamageType());
                    };
                } else {
                    this.currentAction = States.THRUST;
                    if (this.name === "player") {
                        this.scene.combatManager.combatMachine.input("action", States.THRUST);
                    } else if (this.name === "enemy") {
                        if (this.inComputerCombat) (this as unknown as Enemy).computerCombatSheet.computerAction = States.THRUST;
                        if ((this as unknown as Enemy).isCurrentTarget) this.scene.combatManager.combatMachine.input("computerAction", States.THRUST, (this as unknown as Enemy).enemyID);
                    } else if (this.name === "party") {
                        if (this.inComputerCombat) (this as unknown as Party).computerCombatSheet.computerAction = States.THRUST;
                    };
                };
            } else if (frameIndex === 3 && !this.isRanged) {
                this.checkActionSuccess();
            };
        },

        roll: (frame) => {
            const frameIndex = frame.index;
            if (frameIndex === 3 && !this.isRanged) {
                this.currentAction = States.ROLL;
                if (this.name === "player") {
                    this.scene.combatManager.combatMachine.input("action", States.ROLL);
                } else if (this.name === "enemy") {
                    if (this.inComputerCombat) (this as unknown as Enemy).computerCombatSheet.computerAction = States.ROLL;
                    if ((this as unknown as Enemy).isCurrentTarget) this.scene.combatManager.combatMachine.input("computerAction", States.ROLL, (this as unknown as Enemy).enemyID);
                } else if (this.name === "party") {
                    if (this.inComputerCombat) (this as unknown as Party).computerCombatSheet.computerAction = States.ROLL;
                };
            } else if (frameIndex === 4 && this.isRanged && this.name !== "player") {
                if (this.hasMagic) {
                    this.particleEffect = this.scene.particleManager.addEffect(ROLL, this, this.currentDamageType);
                } else if (this.hasBow) {
                    this.particleEffect = this.scene.particleManager.addEffect(ROLL, this, this.bowDamageType());
                };
            } else if (frameIndex === 1 && !this.isRanged) {
                this.checkActionSuccess();
            };
        },

        posture: (frame) => {
            const frameIndex = frame.index;
            const configKey = this.hasBow ? BOW : NOBOW;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.posturing[configKey].flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.posturing[configKey].noFlipX;

            const shieldConfig = this.flipX
                ? SHIELD_ANIMATION_FRAME_CONFIG.posturing.flipX
                : SHIELD_ANIMATION_FRAME_CONFIG.posturing.noFlipX;

            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);
            applyShieldFrameSettings(this.spriteShield, shieldConfig, frameIndex);

            if (frameIndex === 2 && !this.isRanged) {
                this.currentAction = States.POSTURE;
                if (this.name === "player") {
                    this.scene.combatManager.combatMachine.input("action", States.POSTURE);
                } else if (this.name === "enemy") {
                    if (this.inComputerCombat) (this as unknown as Enemy).computerCombatSheet.computerAction = States.POSTURE;
                    if ((this as unknown as Enemy).isCurrentTarget) this.scene.combatManager.combatMachine.input("computerAction", States.POSTURE, (this as unknown as Enemy).enemyID);
                } else if (this.name === "party") {
                    if (this.inComputerCombat) (this as unknown as Party).computerCombatSheet.computerAction = States.POSTURE;
                };
            } else if (frameIndex === 4 && this.isRanged) {
                if (this.hasMagic) {
                    this.particleEffect = this.scene.particleManager.addEffect(POSTURE, this, this.currentDamageType);
                } else if (this.hasBow) {
                    this.particleEffect = this.scene.particleManager.addEffect(POSTURE, this, this.bowDamageType());
                };
            } else if (frameIndex === 5 && !this.isRanged) {
                this.checkActionSuccess();
            };
        },

        attack: (frame) => {
            const frameIndex = frame.index;
            const configKey = this.hasBow ? BOW : NOBOW;
            const config = this.flipX
                ? WEAPON_ANIMATION_FRAME_CONFIG.attacking[configKey].flipX
                : WEAPON_ANIMATION_FRAME_CONFIG.attacking[configKey].noFlipX;


            applyWeaponFrameSettings(this.spriteWeapon, config, frameIndex);

            if (frameIndex === 5 && this.isRanged) {
                if (this.hasMagic) {
                    this.particleEffect = this.scene.particleManager.addEffect(ATTACK, this, this.currentDamageType);
                } else if (this.hasBow) {
                    this.particleEffect = this.scene.particleManager.addEffect(ATTACK, this, this.bowDamageType());
                };
            } else if (frameIndex === 6 && !this.isRanged) {
                this.currentAction = States.ATTACK;
                if (this.name === "player") {
                    this.scene.combatManager.combatMachine.input("action", States.ATTACK);
                } else if (this.name === "enemy") {
                    if (this.inComputerCombat) (this as unknown as Enemy).computerCombatSheet.computerAction = States.ATTACK;
                    if ((this as unknown as Enemy).isCurrentTarget) this.scene.combatManager.combatMachine.input("computerAction", States.ATTACK, (this as unknown as Enemy).enemyID);
                } else if (this.name === "party") {
                    if (this.inComputerCombat) (this as unknown as Party).computerCombatSheet.computerAction = States.ATTACK;
                };
            } else if (frameIndex === 8 && !this.isRanged) {
                this.checkActionSuccess();
            };
        },
    };

    animationUpdate = () => {
        this.on(Phaser.Animations.Events.ANIMATION_START, (anim: any, frame: any) => {
            const state = this.getState(anim);
            const handler = this.startHandlers[state];
            if (handler) handler(frame);
        }, this);
        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, (anim: any, frame: any) => {
            const state = this.getState(anim);
            const handler = this.updateHandlers[state];
            if (handler) handler(frame);
        }, this);
    };
};