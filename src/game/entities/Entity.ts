import AoE from '../phaser/AoE';
import Beam from '../matter/Beam';
import Bubble from '../phaser/Bubble';
import CastingBar from '../phaser/CastingBar';
import HealthBar from '../phaser/HealthBar';
// @ts-ignore
import Enemy from './Enemy';
import Player from './Player';
import ScrollingCombatText from '../phaser/ScrollingCombatText';
import Ascean from '../../models/ascean';
import Equipment from '../../models/equipment';
import { v4 as uuidv4 } from 'uuid';
import { CombatStats, roundToTwoDecimals } from '../../utility/combat';
import { Particle } from '../matter/ParticleManager';
import { Game } from '../scenes/Game';
import { Underground } from '../scenes/Underground';
export const FRAME_COUNT = {
    ATTACK_LIVE: 16,
    ATTACK_SUCCESS: 39,
    PARRY_LIVE: 12, 
    PARRY_SUCCESS: 22,
    PARRY_KILL: 35,
    POSTURE_LIVE: 16, // 11 for frameRate: 12
    POSTURE_SUCCESS: 17, // 11 for frameRate: 12
    ROLL_LIVE: 10,
    ROLL_SUCCESS: 20,
    THRUST_LIVE: 5, 
    THRUST_SUCCESS: 10,
    DISTANCE_CLEAR: 51,
}; 
const GLOW_INTENSITY = 0.25;
const SPEED = 1.5
export const SWING_TIME = { 'One Hand': 1250, 'Two Hand': 1500 }; // 750, 1250 [old]
export const ENEMY_SWING_TIME = { 'One Hand': 1000, 'Two Hand': 1250 }; // 750, 1250 [old]
const DAMAGE_TYPES = { 'magic': ['earth', 'fire', 'frost', 'lightning', 'righteous', 'spooky', 'sorcery', 'wild', 'wind'], 'physical': ['blunt', 'pierce', 'slash'] };
const ACCELERATION_FRAMES = 10; 
const DAMPENING_FACTOR = 0.9; 
const KNOCKBACK_DURATION = 128;
export default class Entity extends Phaser.Physics.Matter.Sprite {
    declare scene: Game | Underground;
    ascean: Ascean;
    attacking: any = undefined;
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
    
    hasMagic: boolean = false;
    hasBow: boolean = false;
    inWater: boolean = false;
    isCasting: boolean = false;
    inCombat: boolean = false;
    isClimbing: boolean = false;
    isRanged: boolean = false;

    isAttacking: boolean = false;
    isDodging: boolean = false;
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

    actionAvailable: boolean = false;
    actionSuccess: boolean = false;
    actionTarget: any = undefined;
    actionParryable: boolean = false;
    attackedTarget: any = undefined;
    dodgeCooldown: number = 0;
    invokeCooldown: number = 0;
    playerBlessing: string = '';
    prayerConsuming: string = '';
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
    currentWeaponSprite: string = '';
    particleEffect: Particle | undefined;
    stunDuration: number = 3000;
    currentDamageType: string = '';
    currentRound: number = 0;
    currentAction: string = '';
    polymorphDirection: string = '';
    polymorphMovement: string = '';
    scrollingCombatText: ScrollingCombatText | undefined;
    specialCombatText: ScrollingCombatText | undefined;
    resistCombatText: ScrollingCombatText | undefined;
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

    static preload(scene: Phaser.Scene) {
        scene.load.atlas(`player_actions`, '../assets/gui/player_actions.png', '../assets/gui/player_actions_atlas.json');
        scene.load.animation(`player_actions_anim`, '../assets/gui/player_actions_anim.json');
        scene.load.atlas(`player_actions_two`, '../assets/gui/player_actions_two.png', '../assets/gui/player_actions_two_atlas.json');
        scene.load.animation(`player_actions_two_anim`, '../assets/gui/player_actions_two_anim.json');
        scene.load.atlas(`player_actions_three`, '../assets/gui/player_actions_three.png', '../assets/gui/player_actions_three_atlas.json');
        scene.load.animation(`player_actions_three_anim`, '../assets/gui/player_actions_three_anim.json');
        scene.load.atlas(`player_attacks`, '../assets/gui/player_attacks.png', '../assets/gui/player_attacks_atlas.json');
        scene.load.animation(`player_attacks_anim`, '../assets/gui/player_attacks_anim.json');   
        scene.load.atlas(`running`, '../assets/gui/running.png', '../assets/gui/running_atlas.json');
        scene.load.animation(`running_anim`, '../assets/gui/running_anim.json');   
        scene.load.atlas(`swimming`, '../assets/gui/swimming.png', '../assets/gui/swimming_atlas.json');
        scene.load.animation(`swimming_anim`, '../assets/gui/swimming_anim.json');   
        scene.load.atlas('rabbit_idle', '../assets/gui/rabbit_idle.png', '../assets/gui/rabbit_idle_atlas.json');
        scene.load.animation('rabbit_idle_anim', '../assets/gui/rabbit_idle_anim.json');
        scene.load.atlas('rabbit_movement', '../assets/gui/rabbit_movement.png', '../assets/gui/rabbit_movement_atlas.json');
        scene.load.animation('rabbit_movement_anim', '../assets/gui/rabbit_movement_anim.json');
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
    };

    get position() {
        this._position.set(this.x, this.y);
        return this._position;
    };

    get velocity() {
        return this.body?.velocity;
    };

    startingSpeed = (entity: Ascean) => {
        let speed = SPEED; // PLAYER.SPEED.INITIAL
        if (this.name === 'player') {
            speed += this.scene.hud.settings.difficulty.playerSpeed || 0;
        } else {
            speed += this.scene.hud.settings.difficulty.enemySpeed || 0;
        };
        const helmet = entity.helmet.type;
        const chest = entity.chest.type;
        const legs = entity.legs.type;
        let modifier = 0;
        const addModifier = (item: string) => {
            switch (item) {
                case 'Leather-Cloth':
                    // modifier -= 0.02; // += 0.05;
                    break;
                case 'Leather-Mail':
                    modifier -= 0.01; // += 0.025;
                    break;
                case 'Chain-Mail':
                    modifier -= 0.02; // += 0.0;
                    break;
                case 'Plate-Mail':
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
        this.scene.glowFilter?.remove(object);
        if (!glow) {
            switch (type) {
                case 'shield':
                    if (this.glowShield !== undefined) {
                        this.glowShield.remove(false);
                        this.glowShield.destroy();
                        this.glowShield = undefined;
                    };
                    break;
                case 'weapon':
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
            case 'shield':
                this.glowShield = this.scene.time.addEvent({
                    delay: 250, // 125 Adjust the delay as needed
                    callback: () => this.updateGlow(object),
                    loop: true,
                    callbackScope: this
                });
                break;
            case 'weapon':
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
            case 'constitution': return 0xFDF6D8;
            case 'strength': return 0xFF0000;
            case 'agility': return 0x00FF00;
            case 'achre': return 0x0000FF;
            case 'caeren': return 0x800080;
            case 'kyosir': return 0xFFD700;
            default: return 0xFFFFFF;
        };
    };

    updateGlow = (object: any) => {
        const glowFilter = this.scene.glowFilter;
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
        this.anims.play(`player_attack_1`, true).on('animationcomplete', () => {
            this.isAttacking = false;
            this.currentAction = '';
        }); 
    };
    parry = () => { 
        this.anims.play('player_attack_1', true).on('animationcomplete', () => { 
            this.isParrying = false; 
            this.currentAction = '';
        });
    };
    posture = () => { 
        this.anims.play('player_attack_3', true).on('animationcomplete', () => {
            this.isPosturing = false;
            this.currentAction = '';
        }); 
    }; 
    thrustAttack = () => { 
        this.anims.play('player_attack_2', true).on('animationcomplete', () => { 
            this.isThrusting = false; 
            this.currentAction = '';
        });
    };
    hurt = () => {
        this.clearAnimations();
        this.clearTint();
        this.anims.play('player_hurt', true).on('animationcomplete', () => {
            this.isHurt = false;
            this.setTint(0xFF0000);    
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
        if ("vibrate" in navigator) navigator.vibrate(48);
    };
    moving = (): boolean => this.body?.velocity.x !== 0 || this.body.velocity.y !== 0;
    movingHorizontal = (): boolean => this.body?.velocity.x !== 0 && this.body?.velocity.y === 0;
    movingVertical = (): boolean => this.body?.velocity.x === 0 && this.body?.velocity.y !== 0;
    movingDown = (): boolean => this.body?.velocity.x === 0 && this.body?.velocity.y > 0;
    movingUp = (): boolean => this.body?.velocity.x === 0 && this.body?.velocity.y < 0;

    isTrying = (): boolean => this.isAttacking || this.isPosturing || this.isThrusting;
    isSuffering = (): boolean => this.isConfused || this.isFeared || this.isParalyzed || this.isPolymorphed || this.isStunned;
    sansSuffering = (ailment: string): boolean => {
        switch (ailment) {
            case 'isConfused':
                return this.isFeared || this.isParalyzed || this.isPolymorphed || this.isStunned;
            case 'isFeared':
                return this.isConfused || this.isParalyzed || this.isPolymorphed || this.isStunned;
            case 'isParalyzed':
                return this.isConfused || this.isFeared || this.isPolymorphed || this.isStunned;
            case 'isPolymorphed':
                return this.isConfused || this.isParalyzed || this.isParalyzed || this.isStunned;                        
            case 'isStunned':
                return this.isConfused || this.isParalyzed || this.isParalyzed || this.isPolymorphed;    
            default: 
                return this.isConfused || this.isFeared || this.isParalyzed || this.isPolymorphed || this.isStunned;
        };
    };

    bowDamageType = () => {
        return this.currentDamageType === 'pierce' || this.currentDamageType === 'blunt' ? 'arrow' : this.currentDamageType;
    };

    checkActionSuccess = (entity: string, target: Player | Enemy) => {
        if (entity === 'player' && !this.isStorming) {
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
            // if (target) this.hitBoxCheck(target as Enemy);
            if (this.touching.length > 0) {
                for (let i = 0; i < this.touching.length; i++) {
                    if (this.touching[i].health > 0) this.hitBoxCheck(this.touching[i]); // this.touching[i] !== target &&
                };
            };
        };
        if (entity === 'enemy' && target) {
            const direction = target.position.subtract(this.position);
            const distance = direction.length();
            if (distance < FRAME_COUNT.DISTANCE_CLEAR && !target.isProtecting) this.actionSuccess = true;
        };
    };
    checkBow = (type: string) => type === 'Bow' || type === 'Greatbow';
    checkDamageType = (type: string, concern: string) => DAMAGE_TYPES[concern as keyof typeof DAMAGE_TYPES].includes(type);
    checkMeleeOrRanged = (weapon: Equipment) => {
        if (weapon === undefined) return;
        this.isRanged = weapon?.attackType === 'Magic' || weapon?.type === 'Bow' || weapon?.type === 'Greatbow';
        if (this.name === 'player') {
            this.swingTimer = SWING_TIME[weapon?.grip as keyof typeof SWING_TIME] || 1500;
            if (weapon?.grip === 'One Hand') {
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
        if (this.scene.player.isShirking) {
            this.isCasting = false;
            this.scene.player.resist();
            return false;
        };
        const chance = Math.random() * 101;
        const playerResist = this.scene.state.isStalwart ? this.scene.state.playerDefense?.magicalPosture as number / 4 : this.scene.state.playerDefense?.magicalDefenseModifier as number / 4;
        const enemyPenetration = this.combatStats?.attributes?.kyosirMod || 0;
        this.scene.hud.logger.log(`Initial Enemy Special Chance: ${roundToTwoDecimals(chance)} | Player Resist: ${playerResist} | Enemy Penetration: ${enemyPenetration}`);
        const resist = playerResist - enemyPenetration; // 0 - 25% - 0 - 25%
        if (chance > resist) {
            return true;
        } else {
            this.isCasting = false;
            this.scene.player.resist();
            return false;
        };
    };

    entropicMultiplier = (power: number) => {
        return Phaser.Math.Between(power * 0.5, power * 1.5);
    };

    imgSprite = (item: Equipment) => {
        return item.imgUrl.split('/')[3].split('.')[0];
    };

    hitBoxCheck = (enemy: Enemy) => {
        if (!enemy || enemy?.health <= 0) return; // enemy.isDefeated === true
        const weaponBounds = this.weaponHitbox.getBounds();
        const enemyBounds = enemy.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(weaponBounds, enemyBounds)) {
            this.attackedTarget = enemy;
            this.actionSuccess = true;
        };
    };

    hook = (target: Enemy, time: number) => {
        this.scene.tweens.add({
            targets: target,
            x: { from: target.x, to: this.x, duration: time },
            y: { from: target.y, to: this.y, duration: time }, 
            ease: 'Circ.easeInOut',
            onStart: () => this.beam.startEmitter(target, time),
            onComplete: () => this.beam.reset(),
            yoyo: false
        });
    };

    particleAoe = (effect: Particle) => {
        new AoE(this.scene, effect.key.split('_effect')[0], 3, false, undefined, false, undefined, {effect,entity:this});
    };

    weaponRotation = (entity: string, target: Player | Enemy) => {  
        if (this.isPraying || this.isCasting) {
            if (this.spriteWeapon.depth < this.depth) this.spriteWeapon.setDepth(this.depth + 1);
            if (this.flipX) {
                if (this.frameCount === 0) {
                    this.spriteWeapon.setOrigin(0.65, 1.5);
                    this.spriteWeapon.setAngle(-175);
                };
                if (this.frameCount === 8) {
                    this.spriteWeapon.setOrigin(-0.3, 0.65);
                    this.spriteWeapon.setAngle(-225);
                };
            } else {
                if (this.frameCount === 0) {
                    this.spriteWeapon.setOrigin(-0.75, 0.65);
                    this.spriteWeapon.setAngle(-275);
                };
                if (this.frameCount === 8) {
                    this.spriteWeapon.setOrigin(0.35, 1.3);
                    this.spriteWeapon.setAngle(-225);
                }; 
            };
            this.frameCount += 1;
        } else if (this.isParrying) { 
            if (this.frameCount === FRAME_COUNT.PARRY_SUCCESS) {
                if (this.isRanged === false) this.checkActionSuccess(entity, target);
            };
            if (this.spriteWeapon.depth !== 1) this.spriteWeapon.setDepth(1);

            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.15, 0.85);
                        this.spriteWeapon.setAngle(90);
                    } else if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(72.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(90);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(130);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(170);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(210);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(250);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.5);
                        this.spriteWeapon.setAngle(340);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(290);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(250);
                    };
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.85, 0.1);
                        this.spriteWeapon.setAngle(0);
                    }
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(17.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(0);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-30);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-60);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-120);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-75);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-10);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(-125);
                    };
                }; 
            } else {
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.25, 1.2);
                        this.spriteWeapon.setAngle(-250);
                    } else if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-267.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(-250);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-210);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-170);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-130);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(0);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(30);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 1.1);
                        this.spriteWeapon.setAngle(55);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.15, 1.25);
                        this.spriteWeapon.setAngle(-185);
                    } else if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-182.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(150);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(120);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(90);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(60);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(30);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(-0.25, 0.75);
                        this.spriteWeapon.setAngle(-75);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-150);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                };
            };
            this.frameCount += 1;
            if (this.frameCount >= FRAME_COUNT.PARRY_KILL) this.isParrying = false;
        } else if (this.isThrusting) { 
            if (this.frameCount === FRAME_COUNT.THRUST_LIVE) {
                if (entity === 'player' && this.isRanged) { // && this.inCombat
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect('thrust', this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect('thrust', this, this.bowDamageType());
                    };
                };
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect('thrust', this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect('thrust', this, this.bowDamageType());
                    };
                };
            }; 
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                if (this.flipX) {
                    this.spriteWeapon.setOrigin(0.1, 0.2);
                    this.spriteWeapon.setAngle(-225);
                } else {
                    this.spriteWeapon.setOrigin(0.25, 0);
                    this.spriteWeapon.setAngle(-45);
                };
            } else {
                if (this.flipX) {
                    this.spriteWeapon.setOrigin(-0.4, 1.6);
                    this.spriteWeapon.setAngle(-135);
                } else {
                    this.spriteWeapon.setOrigin(-0.4, 1.2);
                    this.spriteWeapon.setAngle(45);
                }; 
            };
            if (this.frameCount === FRAME_COUNT.THRUST_SUCCESS) {
                if (this.isRanged === false) this.checkActionSuccess(entity, target);
            };
            this.frameCount += 1; 
        } else if (this.isRolling) {
            if (this.frameCount === FRAME_COUNT.ROLL_LIVE) {
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect('roll', this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect('roll', this, this.bowDamageType());
                    };
                };
            };
            if (this.frameCount === (FRAME_COUNT.ROLL_SUCCESS - 2) && !this.isRanged) { // && entity === 'enemy'
                this.checkActionSuccess(entity, target);
            };
            this.frameCount += 1;
        } else if (this.isAttacking) {
            if (this.frameCount === FRAME_COUNT.ATTACK_LIVE) {
                if (entity === 'player' && this.isRanged) {
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect('attack', this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect('attack', this, this.bowDamageType());
                    };
                };
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect('attack', this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect('attack', this, this.bowDamageType());
                    };
                };
            };
            if (this.spriteWeapon.depth !== 1) this.spriteWeapon.setDepth(1);
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.15, 0.85);
                        this.spriteWeapon.setAngle(90);
                    } else if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(72.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(90);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(130);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(170);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(210);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(250);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.5);
                        this.spriteWeapon.setAngle(340);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(290);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(250);
                    } else if (this.frameCount === 32) {
                        this.spriteWeapon.setOrigin(0.25, 0.25);
                        this.spriteWeapon.setAngle(-45);
                    } else if (this.frameCount === 33) {
                        this.spriteWeapon.setAngle(-30);
                    }
                    if (this.frameCount === 34) {
                        this.spriteWeapon.setAngle(-15);
                    } else if (this.frameCount === 35) {
                        this.spriteWeapon.setAngle(0);
                    } else if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(15);
                    } else if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(0.15, 0.85);
                        this.spriteWeapon.setAngle(30);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(45);
                    } else if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(60);
                    }; 
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.85, 0.1);
                        this.spriteWeapon.setAngle(0);
                    }
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(17.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(0);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-30);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-60);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-120);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-75);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-10);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(-125);
                    } else if (this.frameCount === 32) {
                        this.spriteWeapon.setOrigin(0.25, 0.25);
                        this.spriteWeapon.setAngle(45);
                    } else if (this.frameCount === 33) {
                        this.spriteWeapon.setAngle(60);
                    }
                    if (this.frameCount === 34) {
                        this.spriteWeapon.setAngle(75);
                    } else if (this.frameCount === 35) {
                        this.spriteWeapon.setAngle(90);
                    } else if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(75);
                    } else if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(0.85, 0.1);
                        this.spriteWeapon.setAngle(60);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(45);
                    } else if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(30);
                    }; 
                };
            } else {
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.25, 1.2);
                        this.spriteWeapon.setAngle(-250);
                    } else if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-267.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(-250);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-210);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-170);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-130);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(0);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(30);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 1.1);
                        this.spriteWeapon.setAngle(55);
                    } else if (this.frameCount === 35) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(30);
                    } else if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(0);
                    } else if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(-0.25, 1.2);
                        this.spriteWeapon.setAngle(-90);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(-130);
                    } else if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(-170);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    } else if (this.frameCount === 40) {
                        this.spriteWeapon.setAngle(-210);
                    } else if (this.frameCount === 41) {
                        this.spriteWeapon.setAngle(-250);
                    } else if (this.frameCount === 42) {
                        this.spriteWeapon.setAngle(-267.5);
                    };
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.15, 1.25);
                        this.spriteWeapon.setAngle(-185);
                    } else if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-182.5);
                    } else if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(150);
                    } else if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(120);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(90);
                    } else if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(60);
                    } else if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(30);
                    } else if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(-0.25, 0.75);
                        this.spriteWeapon.setAngle(-75);
                    } else if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-150);
                    } else if (this.frameCount === 35) {
                        this.spriteWeapon.setOrigin(-0.25, 0.75);
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(-75);
                    } else if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(-0.15, 1.25);
                        this.spriteWeapon.setAngle(30);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(60);
                    } else if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(90);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    } else if (this.frameCount === 40) {
                        this.spriteWeapon.setAngle(120);
                    } else if (this.frameCount === 41) {
                        this.spriteWeapon.setAngle(150);
                    } else if (this.frameCount === 42) {
                        this.spriteWeapon.setAngle(-180);
                    };
                };
            };
            this.frameCount += 1;
        } else if (this.isPosturing) {
            if (this.frameCount === FRAME_COUNT.POSTURE_LIVE) {
                if (entity === 'player' && this.isRanged) { // && this.inCombat
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect('posture', this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect('posture', this, this.bowDamageType());
                    };
                };
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic) {
                        this.particleEffect = this.scene.particleManager.addEffect('posture', this, this.currentDamageType);
                    } else if (this.hasBow) {
                        this.particleEffect = this.scene.particleManager.addEffect('posture', this, this.bowDamageType());
                    };
                };
            }; 
            if (this.spriteWeapon.depth !== 1) this.spriteWeapon.setDepth(1);
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                this.spriteShield.setVisible(false);
                if (this.flipX) {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0.75, 0);
                        this.spriteWeapon.setAngle(235);
                    } else if (this.frameCount === 5) {
                        this.spriteWeapon.setAngle(155);
                    } else if (this.frameCount === 8) {
                        this.spriteWeapon.setOrigin(0, 0.25);
                        this.spriteWeapon.setAngle(135);
                    };  
                } else {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-165);
                    } else if (this.frameCount === 5) {
                        this.spriteWeapon.setAngle(-90);
                    } else if (this.frameCount === 8) {
                        this.spriteWeapon.setOrigin(0.25, 0);
                        this.spriteWeapon.setAngle(-45);
                    };  
                };
            } else { 
                if (this.flipX) {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0.25, 1.1);
                        this.spriteWeapon.setAngle(55);
                        this.spriteShield.setOrigin(1, 0.15);
                    } else if (this.frameCount === 5) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(40);
                        this.spriteShield.setOrigin(1.05, 0.15)
                    } else if (this.frameCount === 8) {
                        this.spriteWeapon.setAngle(25);
                        this.spriteShield.setOrigin(1.1, 0.15);
                    }; 
                    if (this.frameCount === 11) {
                        this.spriteWeapon.setOrigin(0, 1.2);
                        this.spriteWeapon.setAngle(-220);
                        this.spriteShield.setOrigin(1.15, 0.15);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setOrigin(0, 1.4);
                        this.spriteWeapon.setAngle(-235);
                        this.spriteShield.setOrigin(1.2, 0.15);
                    } else if (this.frameCount === 17) {
                        this.spriteWeapon.setAngle(-250);
                        this.spriteShield.setOrigin(1, 0.15);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    }; 
                } else {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-165);
                        this.spriteShield.setOrigin(0, 0.25);
                    } else if (this.frameCount === 5) {
                        this.spriteWeapon.setOrigin(0, 1);
                        this.spriteWeapon.setAngle(-45);
                        this.spriteShield.setOrigin(-0.05, 0.15);
                    } else if (this.frameCount === 8) {
                        this.spriteWeapon.setOrigin(-0.25, 1.1);
                        this.spriteWeapon.setAngle(15);
                        this.spriteShield.setOrigin(-0.1, 0.15);
                    }; 
                    if (this.frameCount === 11) {
                        this.spriteWeapon.setOrigin(-0.1, 1.2);
                        this.spriteWeapon.setAngle(-205);
                        this.spriteShield.setOrigin(-0.15, 0.15);
                    } else if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-190);
                        this.spriteShield.setOrigin(-0.2, 0.15);
                    } else if (this.frameCount === 17) { 
                        this.spriteWeapon.setAngle(-175);
                        this.spriteShield.setOrigin(0, 0.15);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                };
            };
            this.frameCount += 1;
        } else if (this.movingVertical()) {
            if (!this.flipX) {
                if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                    this.spriteWeapon.setDepth(1);
                    this.spriteWeapon.setOrigin(0.25, 0.25);
                    this.spriteWeapon.setAngle(107.5);
                } else {
                    this.spriteWeapon.setDepth(this.depth + 1);
                    this.spriteWeapon.setOrigin(0, 0.5);
                    this.spriteWeapon.setAngle(107.5);
                };
                if (this.isStalwart) {
                    this.spriteShield.setOrigin(-0.2, 0.25);
                };    
            } else {
                if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                    this.spriteWeapon.setDepth(1);
                    this.spriteWeapon.setOrigin(0, 0.5);
                    this.spriteWeapon.setAngle(-7.5);
                } else {
                    this.spriteWeapon.setDepth(this.depth + 1);
                    this.spriteWeapon.setOrigin(0.25, 1.2);
                    this.spriteWeapon.setAngle(-194.5);
                };
                if (this.isStalwart) {
                    this.spriteShield.setOrigin(1.2, 0.25);
                };
            }
            if (this.movingDown()) {
                this.spriteShield.setDepth(this.depth + 1);
                this.spriteWeapon.setDepth(this.depth + 1);
            } else {
                this.spriteShield.setDepth(this.depth - 1);
                this.spriteWeapon.setDepth(this.depth - 1);
            };
            this.frameCount = 0;
        } else if (((Math.abs(this.body?.velocity.x as number) > 0.1 || Math.abs(this.body?.velocity.y as number) > 0.1)) && !this.isRolling && !this.flipX) {
            if (this.isStalwart) {
                this.spriteShield.setOrigin(-0.2, 0.25);
            };
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(0.5, 0.25);
                this.spriteWeapon.setAngle(107.5);
            } else {
                this.spriteWeapon.setDepth(this.depth + 1);
                this.spriteWeapon.setOrigin(-0.25, 0.5);
                this.spriteWeapon.setAngle(107.5);
            };
            this.frameCount = 0;
        } else if (((Math.abs(this.body?.velocity.x as number) > 0.1 || Math.abs(this.body?.velocity.y as number) > 0.1)) && !this.isRolling && this.flipX) { 
            if (this.isStalwart) {
                this.spriteShield.setOrigin(1.2, 0.25);
            };
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(0.25, 0.5);
                this.spriteWeapon.setAngle(-7.5);
            } else {
                this.spriteWeapon.setDepth(this.depth + 1);
                this.spriteWeapon.setOrigin(0.5, 1.2);
                this.spriteWeapon.setAngle(-194.5);
            };
            this.frameCount = 0;
        } else if (this.flipX) {
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                this.spriteWeapon.setOrigin(0.15, 0.85);
                this.spriteWeapon.setAngle(90);
            } else {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(-0.25, 1.2);
                this.spriteWeapon.setAngle(-250);
            };
            this.frameCount = 0;
        } else {
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                this.spriteWeapon.setOrigin(0.85, 0.1);
                this.spriteWeapon.setAngle(0);
            } else {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(-0.15, 1.3);
                this.spriteWeapon.setAngle(-195);
            };
            this.frameCount = 0;
        };
    };
};