import Party from '../entities/PartyComputer';
import StateMachine, { specialStateMachines, States } from "./StateMachine";
import { FRAME_COUNT } from '../entities/Entity';
import AoE from './AoE';
import { EventBus } from "../EventBus";
import Bubble from "./Bubble";
import { BlendModes } from "phaser";
import { COMPUTER_BROADCAST, NEW_COMPUTER_ENEMY_HEALTH, RANGE, UPDATE_COMPUTER_DAMAGE } from "../../utility/enemy";
import { Play } from "../main";
import { BALANCED, DEFENSIVE, OFFENSIVE, PARTY_BALANCED_INSTINCTS, PARTY_DEFENSIVE_INSTINCTS, PARTY_INSTINCTS, PARTY_OFFENSIVE_INSTINCTS } from '../../utility/party';
import { PLAYER } from '../../utility/player';
const DURATION = {
    CONSUMED: 2000,
    CONFUSED: 6000,
    POLYMORPHED: 8000,
    FEARED: 4000,
    FROZEN: 3000,
    SLOWED: 5000,
    SNARED: 5000,
    ROOTED: 3000,
    STUNNED: 3000,
    TEXT: 1500,
    DODGE: 288,
    ROLL: 320,
    SPECIAL: 5000,
};
const MOVEMENT = {
    'up': { x: 0, y: -5 },
    'down': { x: 0, y: 5 },
    'left': { x: -5, y: 0 },
    'right': { x: 5, y: 0 },
};
export default class PlayerMachine {
    scene: Play;
    player: Party;
    stateMachine: StateMachine;
    positiveMachine: StateMachine;
    negativeMachine: StateMachine;

    constructor(scene: Play, player: Party) {
        this.scene = scene;
        this.player = player;
        this.stateMachine = new StateMachine(this, 'party');
        this.stateMachine
            .addState(States.IDLE, { onEnter: this.onIdleEnter, onUpdate: this.onIdleUpdate })
            .addState(States.COMPUTER_COMBAT, { onEnter: this.onComputerCombatEnter }) // , onUpdate: this.onComputerCombatUpdate
            .addState(States.LULL, { onEnter: this.onLullEnter }) // onUpdate: this.onLullUpdate
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.FOLLOW, { onEnter: this.onFollowEnter, onUpdate: this.onFollowUpdate, onExit: this.onFollowExit })
            .addState(States.LEASH, { onEnter: this.onLeashEnter, onUpdate: this.onLeashUpdate, onExit: this.onLeashExit })
            .addState(States.DEFEATED, { onEnter: this.onDefeatedEnter, onUpdate: this.onDefeatedUpdate, onExit: this.onDefeatedExit })
            .addState(States.EVADE, { onEnter: this.onEvasionEnter, onUpdate: this.onEvasionUpdate, onExit: this.onEvasionExit })
            .addState(States.CONTEMPLATE, { onEnter: this.onContemplateEnter, onUpdate: this.onContemplateUpdate, onExit: this.onContemplateExit })
            .addState(States.DODGE, { onEnter: this.onDodgeEnter, onUpdate: this.onDodgeUpdate, onExit: this.onDodgeExit })
            .addState(States.ROLL, { onEnter: this.onRollEnter, onUpdate: this.onRollUpdate, onExit: this.onRollExit })
            .addState(States.COMPUTER_ATTACK, { onEnter: this.onComputerAttackEnter, onUpdate: this.onComputerAttackUpdate, onExit: this.onComputerAttackExit })
            .addState(States.COMPUTER_PARRY, { onEnter: this.onComputerParryEnter, onUpdate: this.onComputerParryUpdate, onExit: this.onComputerParryExit })
            .addState(States.COMPUTER_POSTURE, { onEnter: this.onComputerPostureEnter, onUpdate: this.onComputerPostureUpdate, onExit: this.onComputerPostureExit })
            .addState(States.COMPUTER_THRUST, { onEnter: this.onComputerThrustEnter, onUpdate: this.onComputerThrustUpdate, onExit: this.onComputerThrustExit })
            .addState(States.STUN, { onEnter: this.onStunnedEnter, onUpdate: this.onStunnedUpdate, onExit: this.onStunnedExit })
            .addState(States.ARC, { onEnter: this.onArcEnter, onUpdate: this.onArcUpdate, onExit: this.onArcExit })
            .addState(States.ACHIRE, { onEnter: this.onAchireEnter, onUpdate: this.onAchireUpdate, onExit: this.onAchireExit })
            .addState(States.ASTRAVE, { onEnter: this.onAstraveEnter, onUpdate: this.onAstraveUpdate, onExit: this.onAstraveExit })
            .addState(States.BLINK, { onEnter: this.onBlinkEnter, onUpdate: this.onBlinkUpdate })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onUpdate: this.onDesperationUpdate, onExit: this.onDesperationExit })
            .addState(States.FEAR, { onEnter: this.onFearingEnter, onUpdate: this.onFearingUpdate, onExit: this.onFearingExit })
            .addState(States.FYERUS, { onEnter: this.onFyerusEnter, onUpdate: this.onFyerusUpdate, onExit: this.onFyerusExit })
            .addState(States.HEALING, { onEnter: this.onHealingEnter, onUpdate: this.onHealingUpdate, onExit: this.onHealingExit })
            .addState(States.HOOK, { onEnter: this.onHookEnter, onUpdate: this.onHookUpdate, onExit: this.onHookExit })
            .addState(States.ILIRECH, { onEnter: this.onIlirechEnter, onUpdate: this.onIlirechUpdate, onExit: this.onIlirechExit })
            .addState(States.KYNISOS, { onEnter: this.onKynisosEnter, onUpdate: this.onKynisosUpdate, onExit: this.onKynisosExit })
            .addState(States.KYRNAICISM, { onEnter: this.onKyrnaicismEnter, onUpdate: this.onKyrnaicismUpdate, onExit: this.onKyrnaicismExit })
            .addState(States.LEAP, { onEnter: this.onLeapEnter, onUpdate: this.onLeapUpdate })
            .addState(States.MAIERETH, { onEnter: this.onMaierethEnter, onUpdate: this.onMaierethUpdate, onExit: this.onMaierethExit })
            .addState(States.MARK, { onEnter: this.onMarkEnter, onUpdate: this.onMarkUpdate, onExit: this.onMarkExit })
            .addState(States.NETHERSWAP, { onEnter: this.onNetherswapEnter, onUpdate: this.onNetherswapUpdate, onExit: this.onNetherswapExit })
            .addState(States.PARALYZE, { onEnter: this.onParalyzeEnter, onUpdate: this.onParalyzeUpdate, onExit: this.onParalyzeExit })
            .addState(States.POLYMORPH, { onEnter: this.onPolymorphingEnter, onUpdate: this.onPolymorphingUpdate, onExit: this.onPolymorphingExit })
            .addState(States.PURSUIT, { onEnter: this.onPursuitEnter, onUpdate: this.onPursuitUpdate })
            .addState(States.RECALL, { onEnter: this.onRecallEnter, onUpdate: this.onRecallUpdate, onExit: this.onRecallExit })
            .addState(States.QUOR, { onEnter: this.onQuorEnter, onUpdate: this.onQuorUpdate, onExit: this.onQuorExit })
            .addState(States.RECONSTITUTE, { onEnter: this.onReconstituteEnter, onUpdate: this.onReconstituteUpdate, onExit: this.onReconstituteExit })
            .addState(States.ROOT, { onEnter: this.onRootingEnter, onUpdate: this.onRootingUpdate, onExit: this.onRootingExit })
            .addState(States.RUSH, { onEnter: this.onRushEnter, onUpdate: this.onRushUpdate, onExit: this.onRushExit })
            .addState(States.SACRIFICE, { onEnter: this.onSacrificeEnter, onUpdate: this.onSacrificeUpdate, onExit: this.onSacrificeExit })
            .addState(States.SNARE, { onEnter: this.onSnaringEnter, onUpdate: this.onSnaringUpdate, onExit: this.onSnaringExit })
            .addState(States.SUTURE, { onEnter: this.onSutureEnter, onUpdate: this.onSutureUpdate, onExit: this.onSutureExit })
            .addState(States.SLOW, { onEnter: this.onSlowEnter, onUpdate: this.onSlowUpdate, onExit: this.onSlowExit })
            .addState(States.STORM, { onEnter: this.onStormEnter, onUpdate: this.onStormUpdate })
            .addState(States.DEVOUR, { onEnter: this.onDevourEnter, onUpdate: this.onDevourUpdate, onExit: this.onDevourExit })
            .addState(States.CONFUSED, { onEnter: this.onConfusedEnter, onUpdate: this.onConfusedUpdate, onExit: this.onConfusedExit })
            .addState(States.FEARED, { onEnter: this.onFearedEnter, onUpdate: this.onFearedUpdate, onExit: this.onFearedExit })
            .addState(States.POLYMORPHED, { onEnter: this.onPolymorphedEnter, onUpdate: this.onPolymorphedUpdate, onExit: this.onPolymorphedExit });
        this.stateMachine.setState(States.IDLE);

        this.positiveMachine = new StateMachine(this, 'player');
        this.positiveMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.ABSORB, { onEnter: this.onAbsorbEnter, onUpdate: this.onAbsorbUpdate })
            .addState(States.CHIOMIC, { onEnter: this.onChiomicEnter, onUpdate: this.onChiomicUpdate })
            .addState(States.DISEASE, { onEnter: this.onDiseaseEnter, onUpdate: this.onDiseaseUpdate, onExit: this.onDiseaseExit })
            .addState(States.ENVELOP, { onEnter: this.onEnvelopEnter, onUpdate: this.onEnvelopUpdate })
            .addState(States.FREEZE, { onEnter: this.onFreezeEnter, onUpdate: this.onFreezeUpdate })
            .addState(States.HOWL, { onEnter: this.onHowlEnter, onUpdate: this.onHowlUpdate, onExit: this.onHowlExit })
            .addState(States.MALICE, { onEnter: this.onMaliceEnter, onUpdate: this.onMaliceUpdate })
            .addState(States.MENACE, { onEnter: this.onMenaceEnter, onUpdate: this.onMenaceUpdate })
            .addState(States.MEND, { onEnter: this.onMendEnter, onUpdate: this.onMendUpdate })
            .addState(States.MODERATE, { onEnter: this.onModerateEnter, onUpdate: this.onModerateUpdate })
            .addState(States.MULTIFARIOUS, { onEnter: this.onMultifariousEnter, onUpdate: this.onMultifariousUpdate })
            .addState(States.MYSTIFY, { onEnter: this.onMystifyEnter, onUpdate: this.onMystifyUpdate })
            .addState(States.STEALTH, { onEnter: this.onStealthEnter, onUpdate: this.onStealthUpdate, onExit: this.onStealthExit })
            .addState(States.PROTECT, { onEnter: this.onProtectEnter, onUpdate: this.onProtectUpdate })
            .addState(States.RENEWAL, { onEnter: this.onRenewalEnter, onUpdate: this.onRenewalUpdate })
            .addState(States.SCREAM, { onEnter: this.onScreamEnter, onUpdate: this.onScreamUpdate })
            .addState(States.SHIELD, { onEnter: this.onShieldEnter, onUpdate: this.onShieldUpdate })
            .addState(States.SHIMMER, { onEnter: this.onShimmerEnter, onUpdate: this.onShimmerUpdate })
            .addState(States.SPRINTING, { onEnter: this.onSprintEnter, onUpdate: this.onSprintUpdate })
            .addState(States.WARD, { onEnter: this.onWardEnter, onUpdate: this.onWardUpdate })
            .addState(States.WRITHE, { onEnter: this.onWritheEnter, onUpdate: this.onWritheUpdate, onExit: this.onWritheExit })
            .addState(States.ASTRICATION, { onEnter: this.onAstricationEnter, onUpdate: this.onAstricationUpdate })
            .addState(States.BERSERK, { onEnter: this.onBerserkEnter, onUpdate: this.onBerserkUpdate })
            .addState(States.BLIND, { onEnter: this.onBlindEnter, onUpdate: this.onBlindUpdate })
            .addState(States.CAERENESIS, { onEnter: this.onCaerenesisEnter, onUpdate: this.onCaerenesisUpdate })
            .addState(States.CONVICTION, { onEnter: this.onConvictionEnter, onUpdate: this.onConvictionUpdate })
            .addState(States.IMPERMANENCE, { onEnter: this.onImpermanenceEnter, onUpdate: this.onImpermanenceUpdate })
            .addState(States.SEER, { onEnter: this.onSeerEnter, onUpdate: this.onSeerUpdate })
            .addState(States.SHIRK, { onEnter: this.onShirkEnter, onExit: this.onShirkExit })
            .addState(States.SHADOW, { onEnter: this.onShadowEnter, onExit: this.onShadowExit })
            .addState(States.TETHER, { onEnter: this.onTetherEnter, onExit: this.onTetherExit })
            .addState(States.DISPEL, { onEnter: this.onDispelEnter, onExit: this.onDispelExit })
            
        this.negativeMachine = new StateMachine(this, 'player');
        this.negativeMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.FROZEN, { onEnter: this.onFrozenEnter, onExit: this.onFrozenExit })
            .addState(States.SLOWED, { onEnter: this.onSlowedEnter, onExit: this.onSlowedExit })
            .addState(States.SNARED, { onEnter: this.onSnaredEnter, onExit: this.onSnaredExit });
        if (this.scene.state.isStealth) {
            this.scene.time.delayedCall(500, () => this.positiveMachine.setState(States.STEALTH), undefined, this);
        } else {
            this.positiveMachine.setState(States.CLEAN);
        };
    };

    onChaseEnter = () => {
        if (!this.player.currentTarget || !this.player.currentTarget.body || !this.player.currentTarget.position) return;
        this.player.frameCount = 0;
        // this.scene.navMesh.enableDebug();
        if (this.player.chaseTimer) {
            this.player.chaseTimer?.remove(false);
            this.player.chaseTimer.destroy();
            this.player.chaseTimer = undefined;
        };
        if (this.player.leashTimer) {
            this.player.leashTimer.remove(false);
            this.player.leashTimer?.destroy();
            this.player.leashTimer = undefined;
        };
        this.player.chaseTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                // this.scene.navMesh.debugDrawClear();
                if (!this.player.currentTarget || !this.player.currentTarget.body || !this.player.currentTarget.position) {
                    this.player.path = [];
                    this.player.chaseTimer?.remove(false);
                    this.player.chaseTimer?.destroy();
                    this.player.chaseTimer = undefined;
                    return;
                };
                this.player.path = this.scene.navMesh.findPath(this.player.position, this.player.currentTarget.position);
                if (this.player.path && this.player.path.length > 1) {
                    if (!this.player.isPathing) this.player.isPathing = true;
                    const nextPoint = this.player.path[1];
                    this.player.nextPoint = nextPoint;
                    // this.scene.navMesh.debugDrawPath(this.player.path, 0xffd900);
                    const pathDirection = new Phaser.Math.Vector2(this.player.nextPoint.x, this.player.nextPoint.y);
                    this.player.pathDirection = pathDirection;
                    this.player.pathDirection.subtract(this.player.position);
                    this.player.pathDirection.normalize();
                    const distanceToNextPoint = Math.sqrt((this.player.nextPoint.x - this.player.position.x) ** 2 + (this.player.nextPoint.y - this.player.position.y) ** 2);
                    if (distanceToNextPoint < 10) {
                        this.player.path.shift();
                    };
                };
            },
            callbackScope: this,
            loop: true
        });
    }; 
    onChaseUpdate = (_dt: number) => {
        if (!this.player.currentTarget || !this.player.currentTarget.body || !this.player.currentTarget.position) return;
        const rangeMultiplier = this.player.rangedDistanceMultiplier(3);
        const direction = this.player.currentTarget.position.subtract(this.player.position);
        const distance = direction.length();
        if (Math.abs(this.player.originPoint.x - this.player.position.x) > RANGE.LEASH * rangeMultiplier || 
            Math.abs(this.player.originPoint.y - this.player.position.y) > RANGE.LEASH * rangeMultiplier || 
            !this.player.inComputerCombat || distance > RANGE.LEASH * rangeMultiplier) {
            this.stateMachine.setState(States.FOLLOW);
            return;
        };
        if (distance >= 150 * rangeMultiplier) { // was 75 || 100
            if (this.player.path && this.player.path.length > 1) {
                this.player.setVelocity(this.player.pathDirection.x * this.player.speed, this.player.pathDirection.y * this.player.speed);
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * this.player.speed, direction.y * this.player.speed);
            };
        } else if (distance >= 60 * rangeMultiplier) { // was 75 || 100
            if (this.player.path && this.player.path.length > 1) {
                this.player.setVelocity(this.player.pathDirection.x * this.player.speed, this.player.pathDirection.y * this.player.speed);
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * this.player.speed, direction.y * this.player.speed);
            };
            if (!this.player.chasing) {
                this.player.chasing = true;
                this.scene.time.delayedCall(1000, () => {
                    this.player.chasing = false;
                    if (Math.random() > 0.5 && !this.player.isRolling && !this.player.isDodging) {
                        this.player.isRolling = true;
                    } else if (!this.player.isDodging && !this.player.isRolling) {
                        this.player.isDodging = true;
                    };
                }, undefined, this);
            };
        } else {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        };
    }; 
    onChaseExit = () => {
        // this.scene.navMesh.debugDrawClear();
        this.player.chasing = false;
        this.player.path = [];
        this.player.isPathing = false;
        this.player.setVelocity(0, 0);
        if (this.player.chaseTimer) {
            this.player.chaseTimer?.remove(false);
            this.player.chaseTimer.destroy();
            this.player.chaseTimer = undefined;
        };
    };

    onLeashEnter = () => {
        this.player.inComputerCombat = false;
        this.player.healthbar.setVisible(false);
        this.player.specialCombatText = this.scene.showCombatText('Leashing', 1500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        if (this.player.chaseTimer) {
            this.player.chaseTimer?.remove(false);
            this.player.chaseTimer.destroy();
            this.player.chaseTimer = undefined;
        };
        if (this.player.leashTimer) {
            this.player.leashTimer.remove(false);
            this.player.leashTimer?.destroy();
            this.player.leashTimer = undefined;
        };
        this.player.leashTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                let originPoint = new Phaser.Math.Vector2(this.player.originalPosition.x, this.player.originalPosition.y);
                // this.scene.navMesh.debugDrawClear();
                this.player.path = this.scene.navMesh.findPath(this.player.position, originPoint);
                if (this.player.path && this.player.path.length > 1) {
                    if (!this.player.isPathing) this.player.isPathing = true;
                    const nextPoint = this.player.path[1];
                    this.player.nextPoint = nextPoint;
                    // this.scene.navMesh.debugDrawPath(this.player.path, 0xffd900);
                    const pathDirection = new Phaser.Math.Vector2(this.player.nextPoint.x, this.player.nextPoint.y);
                    this.player.pathDirection = pathDirection;
                    this.player.pathDirection.subtract(this.player.position);
                    this.player.pathDirection.normalize();
                    this.player.setVelocity(this.player.pathDirection.x * this.player.speed, this.player.pathDirection.y * this.player.speed);
                    const distanceToNextPoint = Math.sqrt((this.player.nextPoint.x - this.player.position.x) ** 2 + (this.player.nextPoint.y - this.player.position.y) ** 2);
                    if (distanceToNextPoint < 10) {
                        this.player.path.shift();
                    };
                };
            },
            callbackScope: this,
            loop: true
        }); 
    };
    onLeashUpdate = (_dt: number) => {
        let originPoint = new Phaser.Math.Vector2(this.player.originalPosition.x, this.player.originalPosition.y);
        let direction = originPoint.subtract(this.player.position);
        
        if (direction.length() >= 10) {
            if (this.player.path && this.player.path.length > 1) {
                this.player.setVelocity(this.player.pathDirection.x * (this.player.speed), this.player.pathDirection.y * (this.player.speed));
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * (this.player.speed), direction.y * (this.player.speed));
            };
        } else {
            this.stateMachine.setState(States.FOLLOW);
        };
    };
    onLeashExit = () => {
        this.player.path = [];
        this.player.isPathing = false;
        this.player.setVelocity(0);
        if (this.player.leashTimer) {
            this.player.leashTimer.remove(false);
            this.player.leashTimer?.destroy();
            this.player.leashTimer = undefined;
        };
        // this.scene.navMesh.debugDrawClear(); 
    };

    onDefeatedEnter = () => {
        this.player.anims.play('player_death', true);
        this.player.setVelocity(0);
        this.player.disengage();
        this.player.health = 0;
        this.player.isDefeated = true;
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.specialCombatText = this.scene.showCombatText('Defeated', 3000, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.defeatedDuration = PLAYER.DURATIONS.DEFEATED;
        this.player.setCollisionCategory(0);
    };
    onDefeatedUpdate = (dt: number) => {
        this.player.defeatedDuration -= dt;
        if (this.player.defeatedDuration <= 0) {
            this.player.anims.playReverse('player_death', true).once('animationcomplete', () => this.player.isDefeated = false, this.player);
        };
        this.player.combatChecker(this.player.isDefeated);
    };
    onDefeatedExit = () => {
        this.player.defeatedDuration = PLAYER.DURATIONS.DEFEATED;
        this.player.setCollisionCategory(1);
        this.player.spriteWeapon.setVisible(true);
        if (this.player.isStalwart) this.player.spriteShield.setVisible(true);
        this.player.health = this.player.ascean.health.max;
    };

    onEvasionEnter = () => {
        const x = Phaser.Math.Between(1, 2);
        const y = Phaser.Math.Between(1, 2);
        const evade = Phaser.Math.Between(1, 3);
        this.player.frameCount = 0;
        this.player.evadeRight = x === 1;
        this.player.evadeUp = y === 1;
        this.player.evadeType = evade;
        if (this.player.evadeType === 1) {
            this.player.evasionTime = 500;
            this.player.isDodging = true;
        } else {
            this.player.evasionTime = 400;
            this.player.isRolling = true;    
        };
        if (this.player.isCasting || this.player.isPraying || this.player.isContemplating) this.player.evasionTime = 0;
    };
    onEvasionUpdate = (dt: number) => {
        this.player.evasionTime -= dt;
        if ((!this.player.isDodging && !this.player.isRolling) || this.player.evasionTime <= 0) {
            this.player.evasionTime = 0;
            this.player.isDodging = false;
            this.player.isRolling = false;
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        };
        if (this.player.evadeRight) {
            this.player.setVelocityX((this.player.speed - 0.25));
        } else {
            this.player.setVelocityX(-(this.player.speed - 0.25));
        };
        if (this.player.evadeUp) {
            this.player.setVelocityY((this.player.speed - 0.25));
        } else {
            this.player.setVelocityY(-(this.player.speed - 0.25));
        };
    }; 
    onEvasionExit = () => this.player.evaluateCombatDistance();

    onFollowEnter = () => {
        if (!this.scene.player || !this.scene.player.body || !this.scene.player.position) return;
        this.player.frameCount = 0;
        // this.scene.navMesh.enableDebug();
        if (this.player.followTimer) {
            this.player.followTimer?.remove(false);
            this.player.followTimer.destroy();
            this.player.followTimer = undefined;
        };
        if (this.player.chaseTimer) {
            this.player.chaseTimer.remove(false);
            this.player.chaseTimer?.destroy();
            this.player.chaseTimer = undefined;
        };
        if (this.player.leashTimer) {
            this.player.leashTimer.remove(false);
            this.player.leashTimer?.destroy();
            this.player.leashTimer = undefined;
        };
        this.player.followTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                // this.scene.navMesh.debugDrawClear();
                if (!this.scene.player || !this.scene.player.body || !this.scene.player.position || this.player.isDeleting) {
                    this.player.path = [];
                    this.player.followTimer?.remove(false);
                    this.player.followTimer?.destroy();
                    this.player.followTimer = undefined;
                    return;
                };
                this.player.path = this.scene.navMesh.findPath(this.player.position, this.scene.player.position);
                if (this.player.path && this.player.path.length > 1) {
                    if (!this.player.isPathing) this.player.isPathing = true;
                    const nextPoint = this.player.path[1];
                    this.player.nextPoint = nextPoint;
                    // this.scene.navMesh.debugDrawPath(this.player.path, 0xffd900);
                    const pathDirection = new Phaser.Math.Vector2(this.player.nextPoint.x, this.player.nextPoint.y);
                    this.player.pathDirection = pathDirection;
                    this.player.pathDirection.subtract(this.player.position);
                    this.player.pathDirection.normalize();
                    const distanceToNextPoint = Math.sqrt((this.player.nextPoint.x - this.player.position.x) ** 2 + (this.player.nextPoint.y - this.player.position.y) ** 2);
                    if (distanceToNextPoint < 10) {
                        this.player.path.shift();
                    };
                };
            },
            callbackScope: this,
            loop: true
        });
    };
    onFollowUpdate = (_dt: number) => {
        if (!this.scene.player || !this.scene.player.body || !this.scene.player.position || this.player.isDeleting) return;
        const direction = this.scene.player.position.subtract(this.player.position);
        const distance = direction.length();
        if (distance < 60) {
            this.stateMachine.setState(States.IDLE);
            return;
        } else {
            if (this.player.path && this.player.path.length > 1) {
                this.player.setVelocity(this.player.pathDirection.x * (this.player.speed + 0.5), this.player.pathDirection.y * (this.player.speed + 0.5));
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * (this.player.speed + 0.5), direction.y * (this.player.speed + 0.5));
            };
        };
    };
    onFollowExit = () => {
        this.player.path = [];
        this.player.isPathing = false;
        this.player.setVelocity(0, 0);
        if (this.player.followTimer) {
            this.player.followTimer?.remove(false);
            this.player.followTimer.destroy();
            this.player.followTimer = undefined;
        };
    };

    onContemplateEnter = () => {
        if (this.player.inComputerCombat === false || this.player.health <= 0) {
            this.player.inComputerCombat = false;
            this.stateMachine.setState(States.IDLE);
            return;
        };
        this.player.isContemplating = true;
        this.player.isMoving = false;
        this.player.frameCount = 0;
        this.player.setVelocity(0);
        this.player.contemplationTime = Phaser.Math.Between(250, 750);
    };
    onContemplateUpdate = (dt: number) => {
        this.player.contemplationTime -= dt;
        if (this.player.contemplationTime <= 0) {
            this.player.isContemplating = false;
        };
        if (!this.player.isContemplating) this.stateMachine.setState(States.CLEAN); 
    };
    onContemplateExit = () => {
        this.player.isContemplating = false;
        this.player.currentAction = '';
        this.instincts();
    };

    instincts = () => {
        if (this.player.inComputerCombat === false || this.player.health <= 0) {
            this.player.inComputerCombat = false;
            this.stateMachine.setState(States.IDLE);
            return;
        };
        this.player.isMoving = false;
        this.player.setVelocity(0);
        let chance = [1, 2, 4, 5, (!this.player.isRanged ? 6 : 7), (!this.player.isRanged ? 8 : 9), (!this.player.isRanged ? 10 : 11), (!this.player.isRanged ? 12 : 13)][Math.floor(Math.random() * 8)];
        let mastery = this.player.ascean.mastery;
        let gHealth = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
        let pHealth = this.player.health / this.player.ascean.health.max;
        let eHealth = this.scene.state.newComputerHealth / this.scene.state.computerHealth;
        const direction = this.player.currentTarget?.position.subtract(this.player.position);
        const distance = direction?.length() || 0;
        let instinct =
            (pHealth <= 0.25 || gHealth <= 0.25) ? 0 :
            (pHealth <= 0.5 || gHealth <= 0.5) ? 1 :
            ((pHealth >= 0.7 && pHealth <= 0.9) || (gHealth >= 0.7 && gHealth <= 0.9)) ? 2 :

            eHealth <= 0.35 ? 3 :
            eHealth <= 0.6 ? 4 :
            eHealth >= 0.85 ? 5 :
            
            (distance <= 60 && !this.player.isRanged) ? 6 :
            (distance <= 60 && this.player.isRanged) ? 7 :
            (distance > 60 && distance <= 120 && !this.player.isRanged) ? 8 :
            (distance > 60 && distance <= 120 && this.player.isRanged) ? 9 :
            (distance > 120 && distance <= 180 && !this.player.isRanged) ? 10 :
            (distance > 120 && distance <= 180 && this.player.isRanged) ? 11 :
            (distance > 180 && !this.player.isRanged) ? 12 :
            (distance > 180 && this.player.isRanged) ? 13 :

            chance;

        if (this.player.prevInstinct === instinct) {
            instinct = chance;
        };

        const focus = this.scene.hud.settings.computerFocus || BALANCED;
        let foci;
        switch (focus) {
            case BALANCED:
                foci = PARTY_BALANCED_INSTINCTS[mastery as keyof typeof PARTY_BALANCED_INSTINCTS];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case DEFENSIVE:
                foci = PARTY_DEFENSIVE_INSTINCTS[mastery as keyof typeof PARTY_DEFENSIVE_INSTINCTS];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case OFFENSIVE:
                foci = PARTY_OFFENSIVE_INSTINCTS[mastery as keyof typeof PARTY_OFFENSIVE_INSTINCTS];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
        };

        let key = PARTY_INSTINCTS[mastery as keyof typeof PARTY_INSTINCTS][instinct].key, value = PARTY_INSTINCTS[mastery as keyof typeof PARTY_INSTINCTS][instinct].value;
        let finals = [instinct, foci];
        if (instinct === 0 || instinct === 3 || instinct === 7 || instinct === 12) {
            finals.push(instinct);
        };

        let final = finals[Math.floor(Math.random() * finals.length)];

        if (final === typeof 'string') {
            if (specialStateMachines.includes(final)) { // State Machine
                key = "stateMachine";
                value = final;
            } else { // Positive Machine
                key = "positiveMachine";
                value = final;
            };
        };

        this.player.specialCombatText = this.scene.showCombatText('Instinct', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.scene.hud.logger.log(`${this.player.ascean.name}'s instinct leads them to ${value}.`);
        this.player.prevInstinct = instinct;
        (this as any)[key].setState(value);
        if (key === 'positiveMachine') this.stateMachine.setState(States.CHASE);
    };

    onIdleEnter = () => {
        this.player.setVelocity(0);
        this.player.currentRound = 0;
    };
    onIdleUpdate = (_dt: number) => {
        const direction = this.scene.player.position.subtract(this.player.position);
        const distance = direction.length();
        if (distance > 90 && !this.stateMachine.isCurrentState(States.FOLLOW)) {
            this.stateMachine.setState(States.FOLLOW);
        };
    };
    
    onLullEnter = () => {
        this.player.isMoving = false;
        this.player.setVelocity(0);
        this.scene.time.delayedCall(Phaser.Math.Between(500, 1000), () => {
            if (this.player.isSuffering() || this.player.isCasting || this.player.isPraying || this.player.computerAction) {
                this.player.computerAction = false;
                this.stateMachine.setState(States.LULL);
                return;
            };
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        }, undefined, this);
    };
    
    onComputerCombatEnter = () => {  
        if (this.player.inComputerCombat === false || this.player.health <= 0) {
            this.player.inComputerCombat = false;
            this.stateMachine.setState(States.IDLE);
            return;
        };
        if (this.player.isSuffering()) return;
        if (this.player.isCasting || this.player.isPraying || this.player.isContemplating || this.player.computerAction) {
            this.player.setVelocity(0);
            this.player.isMoving = false;
            return;
        };
        this.player.frameCount = 0;
        this.player.computerAction = true;
        this.scene.time.delayedCall(Phaser.Math.Between(750, 1250), () => {
            this.player.frameCount = 0;
            this.player.computerAction = false;
            this.player.evaluateCombat();
        }, undefined, this);
    };
    onComputerCombatUpdate = (_dt: number) => { 
        if (!this.player.computerAction) this.stateMachine.setState(States.LULL);  
    };

    onComputerAttackEnter = () => {
        this.player.clearAnimations();
        this.player.isAttacking = true;
        this.player.frameCount = 0;
    };
    onComputerAttackUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.player.isRanged) this.player.currentAction = States.ATTACK;
        if (!this.player.isAttacking) this.player.evaluateCombatDistance(); 
    };
    onComputerAttackExit = () => {
        this.player.frameCount = 0;
        this.player.currentAction = '';
        this.player.computerAction = false;    
        if (!this.player.isRanged) this.player.anims.play('player_idle', true);
    };

    onComputerParryEnter = () => {
        this.player.clearAnimations();
        this.player.isParrying = true;
        this.player.frameCount = 0;
        if (this.player.hasMagic === true) {
            this.player.specialCombatText = this.scene.showCombatText('Counter Spell', 1000, 'hush', false, true, () => this.player.specialCombatText = undefined);
            this.player.isCounterSpelling = true;
            this.player.flickerCarenic(1000); 
            this.scene.time.delayedCall(1000, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
    };
    onComputerParryUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.PARRY_LIVE && !this.player.isRanged) this.player.currentAction = States.PARRY;
        if (this.player.frameCount >= FRAME_COUNT.PARRY_KILL) this.player.isParrying = false;
        if (!this.player.isParrying) this.player.evaluateCombatDistance();
    };
    onComputerParryExit = () => {
        this.player.isParrying = false;
        this.player.frameCount = 0;
        this.player.currentAction = '';
        this.player.computerAction = false;    
        if (!this.player.isRanged) this.player.anims.play('player_idle', true);
    };

    onComputerPostureEnter = () => {
        this.player.clearAnimations();
        this.player.isPosturing = true;
        this.player.spriteShield.setVisible(true);
        this.player.frameCount = 0;
    };
    onComputerPostureUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.player.isRanged) this.player.currentAction = States.POSTURE
        if (!this.player.isPosturing) this.player.evaluateCombatDistance();
    };
    onComputerPostureExit = () => {
        this.player.spriteShield.setVisible(this.player.isStalwart);
        this.player.frameCount = 0;
        this.player.currentAction = '';
        this.player.computerAction = false;
        if (!this.player.isRanged) this.player.anims.play('player_idle', true);
    };

    onComputerThrustEnter = () => {
        this.player.clearAnimations();
        this.player.isThrusting = true;
        this.player.frameCount = 0;
    };
    onComputerThrustUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.THRUST_LIVE && !this.player.isRanged) this.player.currentAction = States.THRUST;
        if (!this.player.isThrusting) this.player.evaluateCombatDistance();
    };
    onComputerThrustExit = () => {
        this.player.frameCount = 0;
        this.player.computerAction = false;
        this.player.currentAction = '';
        if (!this.player.isRanged) this.player.anims.play('player_idle', true);
    };

    onDodgeEnter = () => {
        if (this.player.isStalwart || this.player.isStorming || this.player.isRolling) return;
        this.player.isDodging = true;
        this.player.enemySound('dodge', true);
        this.player.wasFlipped = this.player.flipX; 
        (this.player.body as any).parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        (this.player.body as any).parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
        (this.player.body as any).parts[0].vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[0].vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.frameCount = 0;
    };
    onDodgeUpdate = (_dt: number) => this.player.combatChecker(this.player.isDodging);
    onDodgeExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.computerAction = false;
        this.player.dodgeCooldown = 0;
        this.player.isDodging = false;
        (this.player.body as any).parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        (this.player.body as any).parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT; 
        (this.player.body as any).parts[0].vertices[0].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[0].vertices[1].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[0].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    };

    onRollEnter = () => {
        if (this.player.isStalwart || this.player.isStorming || this.player.isDodging) return;
        this.player.isRolling = true;
        this.player.enemySound('roll', true);
        (this.player.body as any).parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        (this.player.body as any).parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
        this.player.frameCount = 0;
    };
    onRollUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.ROLL_LIVE && !this.player.isRanged) this.player.currentAction = States.ROLL;
        this.player.combatChecker(this.player.isRolling);
    };
    onRollExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.currentAction = '';
        this.player.spriteWeapon.setVisible(true);
        this.player.rollCooldown = 0; 
        if (this.scene.state.action !== '') {
            this.scene.combatManager.combatMachine.input('action', '');
        };
        this.player.computerAction = false;
        (this.player.body as any).parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        (this.player.body as any).parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
    };

    onAchireEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Achire', PLAYER.DURATIONS.ACHIRE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ACHIRE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onAchireUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ACHIRE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onAchireExit = () => {
        if (this.player.castingSuccess === true) { 
            this.player.particleEffect =  this.scene.particleManager.addEffect('achire', this.player, 'achire', true);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name}'s Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound('wild', true);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onAstraveEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Astrave', PLAYER.DURATIONS.ASTRAVE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ASTRAVE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setup(this.player.x, this.player.y);
        this.player.isCasting = true;
    };
    onAstraveUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ASTRAVE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'cast');
        };
    };
    onAstraveExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.aoe = new AoE(this.scene, 'astrave', 1, false, this.player, false, this.player.currentTarget);    
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} unearths the winds and lightning from the land of hush and tendril.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound('combat-round', true);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onArcEnter = () => {
        this.player.isArcing = true;
        this.player.enemySound('combat-round', true);
        this.player.specialCombatText = this.scene.showCombatText('Arcing', PLAYER.DURATIONS.ARCING / 2, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ARCING);
        this.player.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
        this.player.setStatic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
        this.player.flickerCarenic(3000); 
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} begins arcing with their ${this.scene.state.weapons[0]?.name}.`
        });
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.scene.cameras.main.zoom * 2,
            ease: Phaser.Math.Easing.Elastic.InOut,
            duration: 500,
            yoyo: true
        });
    };
    onArcUpdate = (dt: number) => {
        this.player.combatChecker(this.player.isArcing);
        if (this.player.isArcing) this.player.castbar.update(dt, 'channel', 'DAMAGE');
        if (this.player.castbar.time >= PLAYER.DURATIONS.ARCING * 0.25 && this.player.castbar.time <= PLAYER.DURATIONS.ARCING * 0.26) {
            this.player.isAttacking = true;
        };
        if (this.player.castbar.time <= 0) {
            this.player.castingSuccess = true;
            this.player.isArcing = false;
        };
    };
    onArcExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.castingSuccess = false;
            if (this.player.touching.length > 0) {
                this.player.touching.forEach((enemy: any) => {
                    this.scene.combatManager.partyMelee({enemyID: enemy.enemyID, action: 'arc', origin: this.player.enemyID});
                });
            };
        };
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.setStatic(false);
    };

    onBlinkEnter = () => {
        this.player.enemySound('caerenic', true);
        if (this.player.velocity?.x as number > 0) {
            this.player.setPosition(Math.min(this.player.x + PLAYER.SPEED.BLINK, this.scene.map.widthInPixels), this.player.y);
        } else if (this.player.velocity?.x as number < 0) {
            this.player.setPosition(Math.max(this.player.x - PLAYER.SPEED.BLINK, 0), this.player.y);
        };
        if (this.player.velocity?.y as number > 0) {
            this.player.setPosition(this.player.x, Math.min(this.player.y + PLAYER.SPEED.BLINK, this.scene.map.heightInPixels));
        } else if (this.player.velocity?.y as number < 0) {
            this.player.setPosition(this.player.x, Math.max(this.player.y - PLAYER.SPEED.BLINK, 0));
        };
        const mapBounds = {
            minX: 32,
            maxX: this.scene.map.widthInPixels - 32,
            minY: 32,
            maxY: this.scene.map.heightInPixels - 32
        };
        const clampedX = Phaser.Math.Clamp(this.player.x, mapBounds.minX, mapBounds.maxX);
        const clampedY = Phaser.Math.Clamp(this.player.y, mapBounds.minY, mapBounds.maxY);
        this.player.setPosition(clampedX, clampedY);
        this.player.flickerCarenic(750); 
    };
    onBlinkUpdate = (_dt: number) => this.player.combatChecker(false);

    onConfuseEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText('Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.CONFUSE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onConfuseUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onConfuseExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.confuse(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound('death', true);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} confuses ${this.player.spellName}, and they stumble around in a daze.`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = '';
        this.player.spellName = '';
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onDesperationEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Desperation', PLAYER.DURATIONS.HEALING / 2, 'heal', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(PLAYER.DURATIONS.HEALING); 
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0]?.influences?.[0]} soothes their body.`
        });
    };
    onDesperationUpdate = (_dt: number) => this.player.combatChecker(false);
    onDesperationExit = () => {
        const gRatio = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
        const pRatio = this.player.health / this.player.ascean.health.max;
        if (gRatio <= pRatio) { // Heal the Player
            this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 50, id: this.player.playerID }, type: 'Health' });
        } else { // Heal the Party Member
            this.heal(0.5);
        };
        this.player.enemySound('phenomena', true);
    };

    onDevourEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isCasting = true;
        this.player.currentTarget.isConsumed = true;
        this.player.enemySound('absorb', true);
        this.player.flickerCarenic(2000); 
        this.player.specialCombatText = this.scene.showCombatText('Devouring', PLAYER.DURATIONS.DEVOUR / 2, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.DEVOUR);
        this.player.castbar.setTime(PLAYER.DURATIONS.DEVOUR);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.DEVOUR);
        this.player.devourTimer = this.scene.time.addEvent({
            delay: 400,
            callback: () => this.devour(this.player.spellTarget),
            callbackScope: this,
            repeat: 5,
        });
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.player.isCasting = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.player.setStatic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onDevourUpdate = (dt: number) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'channel', 'TENDRIL');
        };
    };
    onDevourExit = () => {
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0; 
        this.player.beam.reset();
        this.player.spellTarget = '';
        this.player.setStatic(false);
        if (this.player.devourTimer !== undefined) {
            this.player.devourTimer.remove(false);
            this.player.devourTimer = undefined;
        };
    };

    onFearingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText('Fearing', PLAYER.DURATIONS.FEAR / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.FEAR);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onFearingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.FEAR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onFearingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.fear(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound('combat-round', true);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} strikes fear into ${this.scene.state.computer?.name}!`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = '';
        this.player.spellName = '';
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);  
    };

    onFyerusEnter = () => {
        this.player.isCasting = true;
        if (this.player.isMoving === true) this.player.isCasting = false;
        if (this.player.isCasting === false) return;
        this.player.specialCombatText = this.scene.showCombatText('Fyerus', PLAYER.DURATIONS.FYERUS / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setTime(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setup(this.player.x, this.player.y);
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);  
        this.player.aoe = new AoE(this.scene, 'fyerus', 6, false, this.player, false, this.player.currentTarget);    
        this.player.enemySound('combat-round', true);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} unearths the fires and water from the land of hush and tendril.`
        });
    };
    onFyerusUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        if (this.player.castbar.time <= 0) {
            this.player.isCasting = false;
        };
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'channel', 'FYERUS');
        };
    };
    onFyerusExit = () => {
        if (this.player.aoe) this.player.aoe.cleanAnimation(this.scene);
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.isCasting = false;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onHealingEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Healing', PLAYER.DURATIONS.HEALING / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.HEALING);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onHealingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.HEALING) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast', 'HEAL');
    };
    onHealingExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.castingSuccess = false;
            const gRatio = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
            const pRatio = this.player.health / this.player.ascean.health.max;
            if (gRatio <= pRatio) { // Heal the Player
                this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 25, id: this.player.playerID }, type: 'Health' });
            } else { // Heal the Party Member
                this.heal(0.25);
            };
            this.player.enemySound('phenomena', true);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onIlirechEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.specialCombatText = this.scene.showCombatText('Ilirech', PLAYER.DURATIONS.ILIRECH / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ILIRECH);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.MAIERETH);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onIlirechUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ILIRECH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onIlirechExit = () => {
        if (this.player.castingSuccess === true) {
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} rips into this world with Ilian tendrils entwining.`
            });
            this.chiomism(this.player.spellTarget, 100);
            this.player.castingSuccess = false;
            this.player.enemySound('fire', true);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onKynisosEnter = () => { 
        this.player.specialCombatText = this.scene.showCombatText('Kynisos', PLAYER.DURATIONS.KYNISOS / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYNISOS);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onKynisosUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.KYNISOS) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'cast');
        };
    };
    onKynisosExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.aoe = new AoE(this.scene, 'kynisos', 3, false, this.player, false, this.player.currentTarget);    
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} unearths the netting of the golden hunt.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound('combat-round', true);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onKyrnaicismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isCasting = true;
        this.player.enemySound('absorb', true);
        this.player.flickerCarenic(3000); 
        this.player.specialCombatText = this.scene.showCombatText('Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.player.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.player.currentTarget.isConsumed = true;
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.KYRNAICISM);
        this.scene.combatManager.slow(this.player.spellTarget, 1000);
        this.player.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.chiomism(this.player.spellTarget, 20),
            callbackScope: this,
            repeat: 3,
        });
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                this.player.isCasting = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.player.setStatic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onKyrnaicismUpdate = (dt: number) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, 'channel', 'TENDRIL');
    };
    onKyrnaicismExit = () => {
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        this.player.spellTarget = '';
        this.player.setStatic(false);
        if (this.player.chiomicTimer) {
            this.player.chiomicTimer.remove(false);
            this.player.chiomicTimer = undefined;
        }; 
    };
    caerenicDamage = () => this.player.isCaerenic ? 1.15 : 1;
    levelModifier = () => (this.player?.ascean.level as number + 9) / 10;
    mastery = () => this.player?.ascean[this.player?.ascean.mastery as keyof typeof this.player.ascean];
    chiomism = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) return;
        const damage = Math.round(this.mastery() / 2 * (1 + power / 100) * this.caerenicDamage() * this.levelModifier());
        EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin: this.player.enemyID });
        const text = `${this.player.ascean.name}'s hush flays ${damage} health from ${enemy.ascean?.name}.`;
        EventBus.emit('party-combat-text', { text });
        this.player.enemySound('absorb', true);
    };
    heal = (pow: number) => {
        const heal = this.player.computerCombatSheet.computerHealth * pow;
        this.player.health = Math.min(this.player.health + heal, this.player.computerCombatSheet.computerHealth);
        this.player.updateHealthBar(this.player.health);
        this.player.computerCombatSheet.newComputerHealth = this.player.health;
        EventBus.emit(COMPUTER_BROADCAST, { id: this.player.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.player.health });
    };
    devour = (id: string) => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === this.player.spellTarget);
        if (this.player.isCasting === false || !enemy || enemy.health <= 0) {
            this.player.isCasting = false;
            this.player.devourTimer?.remove(false);
            this.player.devourTimer = undefined;
            return;
        };
        const damage = Math.round(this.player.computerCombatSheet.computerHealth * 0.04 * this.caerenicDamage() * (this.player.ascean.level + 9) / 10);
        let newComputerHealth = Math.min(this.player.health + damage, this.player.computerCombatSheet.computerHealth);        
        this.player.health = newComputerHealth;
        this.player.updateHealthBar(this.player.health);
        this.player.computerCombatSheet.newComputerHealth = this.player.health;
        EventBus.emit(COMPUTER_BROADCAST, { id: this.player.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.player.health });
        EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin: this.player.enemyID });
        const text = `${this.player.ascean.name} tshaers and devours ${damage} health from ${enemy.ascean?.name}.`;
        EventBus.emit('party-combat-text', { text });
    };
    sacrifice = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) return;
        let damage = Math.round(this.mastery() * this.caerenicDamage() * this.levelModifier());

        this.player.health -= (damage / 2);
        this.player.computerCombatSheet.newComputerHealth = this.player.health;

        damage *= (1 * power / 100);

        EventBus.emit(COMPUTER_BROADCAST, { id: this.player.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: this.player.health });
        EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin: this.player.enemyID });

        const text = `${this.player.ascean.name} sacrifices ${Math.round(damage) / 2 * (this.player.isStalwart ? 0.85 : 1)} health to rip ${Math.round(damage)} from ${enemy.ascean?.name}.`;
        EventBus.emit('party-combat-text', { text });
        enemy.flickerCarenic(750);
    };
    suture = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) return;
        const damage = Math.round(this.mastery() * this.caerenicDamage() * this.levelModifier()) * (1 * power / 100) * 0.8;
        
        let newComputerHealth = Math.min(this.player.health + damage, this.player.computerCombatSheet.computerHealth);
        this.player.computerCombatSheet.newComputerHealth = newComputerHealth;
        EventBus.emit(COMPUTER_BROADCAST, { id: this.player.enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: newComputerHealth });
        EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin: this.player.enemyID });

        const text = `${this.player.ascean.name}'s suture ${enemy.ascean?.name}'s caeren into them, absorbing and healing for ${damage}.`;
        EventBus.emit('party-combat-text', { text });
        enemy.flickerCarenic(750);
    };

    onLeapEnter = () => {
        this.player.leap();
    };
    onLeapUpdate = (_dt: number) => this.player.combatChecker(this.player.isLeaping);

    onMaierethEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.specialCombatText = this.scene.showCombatText('Maiereth', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.MAIERETH);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.MAIERETH);                          
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onMaierethUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.MAIERETH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onMaierethExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            if (chance > 75) {
                this.scene.combatManager.fear(this.player.spellTarget);
            };
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} bleeds and strike ${this.scene.state.computer?.name} with tendrils of Ma'anre.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound('spooky', true);
        };
        this.player.isCasting = false;
        this.player.spellTarget = '';
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);  
    };

    onHookEnter = () => {
        this.player.particleEffect = this.scene.particleManager.addEffect('hook', this.player, 'hook', true);
        this.player.specialCombatText = this.scene.showCombatText('Hook', DURATION.TEXT, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.enemySound('dungeon', true);
        this.player.flickerCarenic(750);
        this.player.beam.startEmitter(this.player.particleEffect.effect, 1500);
        this.player.hookTime = 0;
    };
    onHookUpdate = (dt: number) => {
        this.player.hookTime += dt;
        if (this.player.hookTime >= 1250 || !this.player.particleEffect?.effect) {
            this.player.combatChecker(false);
        };
    };
    onHookExit = () => {
        this.player.beam.reset();
    };

    onMarkEnter = () => {
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.player.specialCombatText = this.scene.showCombatText('Marking', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(1000);
    };
    onMarkUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onMarkExit = () => {
        this.player.mark.setPosition(this.player.x, this.player.y + 24);
        this.player.mark.setVisible(true);
        this.player.animateMark();
        this.player.animateMark();
        this.player.enemySound('phenomena', true);
        this.player.setStatic(false);
    };

    onNetherswapEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.player.isNetherswapping = true;
        this.player.netherswapTarget = this.player.currentTarget;
        this.player.flickerCarenic(1000);
    };
    onNetherswapUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onNetherswapExit = () => {
        if (this.player.isNetherswapping === false) return;
        this.player.isNetherswapping = false;
        this.player.setStatic(false);
        if (this.player.netherswapTarget === undefined) return; 
        this.player.specialCombatText = this.scene.showCombatText('Netherswap', DURATION.TEXT / 2, 'effect', false, true, () => this.player.specialCombatText = undefined);
        const player = new Phaser.Math.Vector2(this.player.x, this.player.y);
        const enemy = new Phaser.Math.Vector2(this.player.netherswapTarget.x, this.player.netherswapTarget.y);
        this.player.setPosition(enemy.x, enemy.y);
        this.player.netherswapTarget.setPosition(player.x, player.y);
        this.player.netherswapTarget = undefined;
        this.player.enemySound('caerenic', true);
    };

    onRecallEnter = () => {
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.player.specialCombatText = this.scene.showCombatText('Recalling', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(1000);
    };
    onRecallUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onRecallExit = () => {
        this.player.setPosition(this.player.mark.x, this.player.mark.y - 24);
        this.player.enemySound('phenomena', true);
        this.player.animateMark();
        this.player.setStatic(false);
    };

    onParalyzeEnter = () => { 
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText('Paralyzing', PLAYER.DURATIONS.PARALYZE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.PARALYZE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onParalyzeUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.PARALYZE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onParalyzeExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.paralyze(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound('combat-round', true);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} paralyzes ${this.scene.state.computer?.name} for several seconds!`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = '';
        this.player.spellName = '';
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onPolymorphingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name
        this.player.specialCombatText = this.scene.showCombatText('Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.POLYMORPH);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onPolymorphingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onPolymorphingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.polymorph(this.player.spellTarget);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} ensorcels ${this.player.spellName}, polymorphing them!`
            });
            this.player.castingSuccess = false;
            this.player.enemySound('combat-round', true);
        };
        this.player.spellTarget = '';
        this.player.spellName = '';
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onPursuitEnter = () => {
        if (this.player.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.player.enemySound('wild', true);
        if (this.player.currentTarget) {
            if (this.player.currentTarget.flipX) {
                this.player.setPosition(this.player.currentTarget.x + 16, this.player.currentTarget.y);
            } else {
                this.player.setPosition(this.player.currentTarget.x - 16, this.player.currentTarget.y);
            };
        };

        this.player.flickerCarenic(750);
    };
    onPursuitUpdate = (_dt: number) => this.player.combatChecker(this.player.isPursuing);

    onQuorEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Quor', PLAYER.DURATIONS.QUOR / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.QUOR);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onQuorUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.QUOR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onQuorExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.particleEffect =  this.scene.particleManager.addEffect('quor', this.player, 'quor', true);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name}'s Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound('freeze', true);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onReconstituteEnter = () => {
        if (this.player.moving() === true) return;
        this.player.isCasting = true;
        this.player.specialCombatText = this.scene.showCombatText('Reconstitute', PLAYER.DURATIONS.RECONSTITUTE / 2, 'heal', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.RECONSTITUTE);
        this.player.castbar.setTime(PLAYER.DURATIONS.RECONSTITUTE);
        this.player.beam.startEmitter(this, PLAYER.DURATIONS.RECONSTITUTE);
        this.player.reconTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.reconstitute(),
            callbackScope: this,
            repeat: 5,
        });
        this.scene.time.addEvent({
            delay: 5000,
            callback: () => this.player.isCasting = false,
            callbackScope: this,
            loop: false,
        });
        this.player.castbar.setup(this.player.x, this.player.y);
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
    };
    onReconstituteUpdate = (dt: number) => {
        if (this.player.isMoving) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, 'channel', 'HEAL');
    };
    onReconstituteExit = () => {
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.reconTimer) {
            this.player.reconTimer.remove(false);
            this.player.reconTimer = undefined;
        }; 
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };
    reconstitute = () => {
        if (!this.player.isCasting) {
            this.player.isCasting = false;
            this.player.reconTimer?.remove(false);
            this.player.reconTimer = undefined;
            return;
        };
        const gRatio = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
        const pRatio = this.player.health / this.player.ascean.health.max;
        if (gRatio <= pRatio) { // Heal the Player
            this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 15, id: this.player.playerID }, type: 'Health' });
        } else { // Heal the Party Member
            this.heal(0.15);
        };
        this.player.enemySound('phenomena', true);
    };

    onRootingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.isCasting = true;
        this.player.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
        this.player.specialCombatText = this.scene.showCombatText('Rooting', PLAYER.DURATIONS.ROOTING / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.ROOTING);
    };
    onRootingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ROOTING) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onRootingExit = () => { 
        if (this.player.castingSuccess === true) {
            this.player.castingSuccess = false;
            this.scene.combatManager.root(this.player.spellTarget);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} ensorcels ${this.player.spellName}, rooting them!`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = '';
        this.player.spellName = '';
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onRushEnter = () => {
        this.player.rush();
    };
    onRushUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isRushing);
    };
    onRushExit = () => {
        this.player.rushedEnemies = [];
    };

    onSlowEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSlowing = true;
        this.player.specialCombatText = this.scene.showCombatText('Slow', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.enemySound('debuff', true);
        this.scene.combatManager.slow(this.player.spellTarget, 3000);
        this.player.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => this.player.isSlowing = false, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} ensorcels ${this.player.currentTarget.ascean?.name}, slowing them!`
        });
    };
    onSlowUpdate = (_dt: number) => this.player.combatChecker(this.player.isSlowing);
    onSlowExit = () => this.player.spellTarget = '';

    onSacrificeEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSacrificing = true;
        this.player.specialCombatText = this.scene.showCombatText('Sacrifice', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.enemySound('combat-round', true);
        this.sacrifice(this.player.spellTarget, 10);
        this.player.flickerCarenic(500);  
        this.scene.time.delayedCall(500, () => this.player.isSacrificing = false, undefined, this);
    };
    onSacrificeUpdate = (_dt: number) => this.player.combatChecker(this.player.isSacrificing);
    onSacrificeExit = () => this.player.spellTarget = '';

    onSnaringEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText('Snaring', PLAYER.DURATIONS.SNARE, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.SNARE);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.SNARE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setup(this.player.x, this.player.y);
    };
    onSnaringUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.SNARE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onSnaringExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.snare(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound('debuff', true);
            EventBus.emit('party-combat-text', {
                text: `${this.player.ascean.name} ensorcels ${this.player.spellName}, snaring them!`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = '';
        this.player.spellName = '';
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onStormEnter = () => {
        this.player.storm();
    };
    onStormUpdate = (_dt: number) => this.player.combatChecker(this.player.isStorming);

    onSutureEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSuturing = true;
        this.player.specialCombatText = this.scene.showCombatText('Suture', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.enemySound('debuff', true);
        this.suture(this.player.spellTarget, 10);
        this.player.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => {
            this.player.isSuturing = false;
        }, undefined, this);
    };
    onSutureUpdate = (_dt: number) => this.player.combatChecker(this.player.isSuturing);
    onSutureExit = () => this.player.spellTarget = '';

    // ================= META MACHINE STATES ================= \\
    onCleanEnter = () => {};
    onCleanExit = () => {};

    onAbsorbEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isAbsorbing = true;
        this.player.negationName = States.ABSORB;
        this.player.enemySound('absorb', true);
        this.player.specialCombatText = this.scene.showCombatText('Absorbing', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'aqua', PLAYER.DURATIONS.ABSORB);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ABSORB, () => {
            this.player.isAbsorbing = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.destroy();
                this.player.negationBubble = undefined;
                if (this.player.negationName === States.ABSORB) this.player.negationName = '';
            };    
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} warps oncoming damage into grace.`
        });
    };
    onAbsorbUpdate = (_dt: number) => {if (!this.player.isAbsorbing) this.positiveMachine.setState(States.CLEAN);};

    absorb = () => {
        if (this.player.negationBubble === undefined || this.player.isAbsorbing === false) {
            if (this.player.negationBubble) {
                this.player.negationBubble.destroy();
                this.player.negationBubble = undefined;
            };
            this.player.isAbsorbing = false;
            return;
        };
        this.player.enemySound('absorb', true);
        this.player.specialCombatText = this.scene.showCombatText('Absorbed', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        if (Math.random() < 0.2) {
            this.player.isAbsorbing = false;
        };
    };

    onChiomicEnter = () => {
        this.player.aoe = new AoE(this.scene, 'chiomic', 1, false, this.player);    
        this.player.enemySound('death', true);
        this.player.specialCombatText = this.scene.showCombatText('Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isChiomic = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.player.isChiomic = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} mocks and confuse their surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt: number) => {if (this.player.isChiomic === false) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.player.isDiseasing = true;
        this.player.aoe = new AoE(this.scene, 'tendril', 6, false, this.player);    
        this.player.enemySound('dungeon', true);
        this.player.specialCombatText = this.scene.showCombatText('Tendrils Swirl', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.player.isDiseasing = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} swirls such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt: number) => {if (this.player.isDiseasing === false) this.positiveMachine.setState(States.CLEAN);};
    onDiseaseExit = () => this.player.aoe.cleanAnimation(this.scene);

    onHowlEnter = () => {
        this.player.aoe = new AoE(this.scene, 'howl', 1, false, this.player);    
        this.player.enemySound('howl', true);
        this.player.specialCombatText = this.scene.showCombatText('Howling', PLAYER.DURATIONS.HOWL, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.isHowling = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.player.isHowling = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} howls, it's otherworldly nature stunning nearby foes.`
        });
    };
    onHowlUpdate = (_dt: number) => {if (this.player.isHowling === false) this.positiveMachine.setState(States.CLEAN);};
    onHowlExit = () => this.player.aoe.cleanAnimation(this.scene);

    onEnvelopEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.isEnveloping = true;
        this.player.enemySound('caerenic', true);
        this.player.specialCombatText = this.scene.showCombatText('Enveloping', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'blue', PLAYER.DURATIONS.ENVELOP);
        this.player.reactiveName = States.ENVELOP;
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.player.isEnveloping = false;    
            if (this.player.reactiveBubble !== undefined && this.player.reactiveName === States.ENVELOP) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };    
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} envelops themself, shirking oncoming attacks.`
        });
    };
    onEnvelopUpdate = (_dt: number) => {if (!this.player.isEnveloping) this.positiveMachine.setState(States.CLEAN);};

    envelop = () => {
        if (this.player.reactiveBubble === undefined || this.player.isEnveloping === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
            };
            this.player.isEnveloping = false;
            return;
        };
        this.player.enemySound('caerenic', true);
        this.player.specialCombatText = this.scene.showCombatText('Enveloped', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        if (Math.random() < 0.2) {
            this.player.isEnveloping = false;
        };
    };

    onFreezeEnter = () => {
        this.player.aoe = new AoE(this.scene, 'freeze', 1, false, this.player);
        this.player.enemySound('freeze', true);
        this.player.specialCombatText = this.scene.showCombatText('Freezing', PLAYER.DURATIONS.FREEZE, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.player.isFreezing = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} freezes nearby foes.`
        });
    };
    onFreezeUpdate = (_dt: number) => {if (!this.player.isFreezing) this.positiveMachine.setState(States.CLEAN);};

    onMaliceEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MALICE;
        this.player.enemySound('debuff', true);
        this.player.isMalicing = true;
        this.player.specialCombatText = this.scene.showCombatText('Malice', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'purple', PLAYER.DURATIONS.MALICE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.player.isMalicing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MALICE) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} wracks malicious foes with the hush of their own attack.`
        });
    };
    onMaliceUpdate = (_dt: number) => {if (!this.player.isMalicing) this.positiveMachine.setState(States.CLEAN);};

    malice = (id: string) => {
        if (this.player.reactiveBubble === undefined || this.player.isMalicing === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMalicing = false;
            return;
        };
        this.player.enemySound('debuff', true);
        this.player.specialCombatText = this.scene.showCombatText('Malice', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.chiomism(id, 10);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isMalicing = false;
        };
    };

    onMendEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MEND;
        this.player.enemySound('caerenic', true);
        this.player.isMending = true;
        this.player.specialCombatText = this.scene.showCombatText('Mending', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'purple', PLAYER.DURATIONS.MEND);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.player.isMending = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MEND) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} seeks to mend oncoming attacks.`
        });
    };
    onMendUpdate = (_dt: number) => {if (!this.player.isMending) this.positiveMachine.setState(States.CLEAN);};

    mend = () => {
        if (this.player.reactiveBubble === undefined || this.player.isMending === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMending = false;
            return;
        };
        this.player.enemySound('caerenic', true);
        this.player.specialCombatText = this.scene.showCombatText('Mending', 500, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        const gRatio = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
        const pRatio = this.player.health / this.player.ascean.health.max;
        if (gRatio <= pRatio) { // Heal the Player
            this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 15, id: this.player.playerID }, type: 'Health' });
        } else { // Heal the Party Member
            this.heal(0.15);
        };
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isMending = false;
        };
    };

    onMenaceEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MENACE;
        this.player.enemySound('scream', true);
        this.player.isMenacing = true;
        this.player.specialCombatText = this.scene.showCombatText('Menacing', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'dread', PLAYER.DURATIONS.MENACE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MENACE, () => {
            this.player.isMenacing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MENACE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} seeks to menace oncoming attacks.`
        });
    };
    onMenaceUpdate = (_dt: number) => {if (!this.player.isMenacing) this.positiveMachine.setState(States.CLEAN);};

    menace = (id: string) => {
        if (id === '') return;
        if (this.player.reactiveBubble === undefined || this.player.isMenacing === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMenacing = false;
            return;
        };
        this.scene.combatManager.fear(id);
        this.player.enemySound('caerenic', true);
        this.player.specialCombatText = this.scene.showCombatText('Mending', 500, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 3) {
            this.player.isMenacing = false;
        };
    };

    onModerateEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MODERATE;
        this.player.enemySound('debuff', true);
        this.player.isModerating = true;
        this.player.specialCombatText = this.scene.showCombatText('Moderating', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'sapphire', PLAYER.DURATIONS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MODERATE, () => {
            this.player.isModerating = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MODERATE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} seeks to moderate oncoming attacks.`
        });
    };
    onModerateUpdate = (_dt: number) => {if (!this.player.isModerating) this.positiveMachine.setState(States.CLEAN);};

    moderate = (id: string) => {
        if (id === '') return;
        if (this.player.reactiveBubble === undefined || this.player.isModerating === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isModerating = false;
            return;
        };
        this.scene.combatManager.slow(id);
        this.player.enemySound('debuff', true);
        this.player.specialCombatText = this.scene.showCombatText('Mending', 500, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isModerating = false;
        };
    };

    onMultifariousEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MULTIFARIOUS;
        this.player.enemySound('combat-round', true);
        this.player.isMultifaring = true;
        this.player.specialCombatText = this.scene.showCombatText('Moderating', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'ultramarine', PLAYER.DURATIONS.MULTIFARIOUS);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MULTIFARIOUS, () => {
            this.player.isMultifaring = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MULTIFARIOUS) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} seeks to multifare oncoming attacks.`
        });
    };
    onMultifariousUpdate = (_dt: number) => {if (!this.player.isMultifaring) this.positiveMachine.setState(States.CLEAN);};

    multifarious = (id: string) => {
        if (id === '') return;
        if (this.player.reactiveBubble === undefined || this.player.isMultifaring === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMultifaring = false;
            return;
        };
        this.scene.combatManager.polymorph(id);
        this.player.enemySound('combat-round', true);
        this.player.specialCombatText = this.scene.showCombatText('Multifarious', 500, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 3) {
            this.player.isMultifaring = false;
        };
    };

    onMystifyEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MYSTIFY;
        this.player.enemySound('debuff', true);
        this.player.isMystifying = true;
        this.player.specialCombatText = this.scene.showCombatText('Mystifying', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'chartreuse', PLAYER.DURATIONS.MYSTIFY);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MYSTIFY, () => {
            this.player.isMystifying = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MYSTIFY) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} seeks to mystify enemies when struck.`
        });
    };
    onMystifyUpdate = (_dt: number) => {if (!this.player.isMystifying) this.positiveMachine.setState(States.CLEAN);};

    mystify = (id: string) => {
        if (id === '') return;
        if (this.player.reactiveBubble === undefined || this.player.isMystifying === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMystifying = false;
            return;
        };
        this.scene.combatManager.confuse(id);
        this.player.enemySound('death', true);
        this.player.specialCombatText = this.scene.showCombatText('Mystifying', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 3) {
            this.player.isMystifying = false;
        };
    };

    onProtectEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isProtecting = true;
        this.player.enemySound('shield', true);
        this.player.specialCombatText = this.scene.showCombatText('Protecting', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'gold', PLAYER.DURATIONS.PROTECT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.player.isProtecting = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} protects themself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt: number) => {if (!this.player.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRenewalEnter = () => {
        this.player.isRenewing = true;
        this.player.aoe = new AoE(this.scene, 'renewal', 6, true, this.player);    
        this.player.enemySound('shield', true);
        this.player.specialCombatText = this.scene.showCombatText('Hush Tears', 750, 'bone', false, true, () => this.player.specialCombatText = undefined);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.player.isRenewing = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt: number) => {if (!this.player.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        this.player.aoe = new AoE(this.scene, 'scream', 1, false, this.player);    
        this.player.enemySound('scream', true);
        this.player.specialCombatText = this.scene.showCombatText('Screaming', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.player.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.player.isScreaming = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} screams, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt: number) => {if (!this.player.isScreaming) this.positiveMachine.setState(States.CLEAN);};

    onShieldEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.enemySound('shield', true);
        this.player.isShielding = true;
        this.player.specialCombatText = this.scene.showCombatText('Shielding', 750, 'bone', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.player.negationName = States.SHIELD;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.player.isShielding = false;    
            if (this.player.negationBubble && this.player.negationName === States.SHIELD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} shields themself from oncoming attacks.`
        });
    };
    onShieldUpdate = (_dt: number) => {if (!this.player.isShielding) this.positiveMachine.setState(States.CLEAN);};

    shield = () => {
        if (this.player.negationBubble === undefined || this.player.isShielding === false) {
            if (this.player.negationBubble) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
            };
            this.player.isShielding = false;
            return;
        };
        this.player.enemySound('shield', true);
        this.player.specialCombatText = this.scene.showCombatText('Shield Hit', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        if (this.player.negationBubble.charges <= 0) {
            this.player.specialCombatText = this.scene.showCombatText('Shield Broken', 500, 'damage', false, true, () => this.player.specialCombatText = undefined);
            this.player.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.player.isShimmering = true; 
        this.player.enemySound('stealth', true);
        this.player.adjustSpeed(PLAYER.SPEED.STEALTH);
        if (!this.player.isStealthing) this.stealthEffect(true);    
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.player.isShimmering = false;
            this.stealthEffect(false);
            this.player.adjustSpeed(-PLAYER.SPEED.STEALTH);
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} shimmers, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt: number) => {if (!this.player.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmer = () => {
        const shimmers = ['It fades through them', "You simply weren't there", "Perhaps them never were", "They don't seem certain of them at all"];
        const shim = shimmers[Math.floor(Math.random() * shimmers.length)];
        this.player.enemySound('stealth', true);
        this.player.specialCombatText = this.scene.showCombatText(shim, 1500, 'effect', false, true, () => this.player.specialCombatText = undefined);
    };

    onSprintEnter = () => {
        this.player.isSprinting = true;
        this.player.enemySound('blink', true);
        this.player.adjustSpeed(PLAYER.SPEED.SPRINT);
        this.player.flickerCarenic(PLAYER.DURATIONS.SPRINT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.player.isSprinting = false;
            this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);    
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} taps into their caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt: number) => {if (!this.player.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onStealthEnter = () => {
        if (!this.player.isShimmering) this.player.isStealthing = true; 
        this.stealthEffect(true);    
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} steps halfway into the land of hush and tendril.`
        });
    };
    onStealthUpdate = (_dt: number) => {if (!this.player.isStealthing || this.scene.combat) this.positiveMachine.setState(States.CLEAN);};
    onStealthExit = () => {
        this.player.isStealthing = false;
        this.stealthEffect(false);
    };

    stealthEffect = (stealth: boolean) => {
        if (stealth) {
            const getStealth = (object: any) => {
                object.setAlpha(0.5); 
                object.setBlendMode(BlendModes.SCREEN);
                this.scene.tweens.add({
                    targets: object,
                    tint: 0x00AAFF, 
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                }); 
            };
            this.player.adjustSpeed(-PLAYER.SPEED.STEALTH);
            getStealth(this.player);
            getStealth(this.player.spriteWeapon);
            getStealth(this.player.spriteShield);
        } else {
            const clearStealth = (object: any) => {
                this.scene.tweens.killTweensOf(object);
                object.setAlpha(1);
                object.clearTint();
                object.setBlendMode(BlendModes.NORMAL);
            };
            this.player.adjustSpeed(PLAYER.SPEED.STEALTH);
            clearStealth(this.player);
            clearStealth(this.player.spriteWeapon);
            clearStealth(this.player.spriteShield);
            this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        };
        this.player.enemySound('stealth', true);
    };

    onWardEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isWarding = true;
        this.player.enemySound('combat-round', true);
        this.player.specialCombatText = this.scene.showCombatText('Warding', 750, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'red', PLAYER.DURATIONS.WARD);
        this.player.negationName = States.WARD;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.player.isWarding = false;    
            if (this.player.negationBubble && this.player.negationName === States.WARD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name} wards themself from oncoming attacks.`
        });
    };
    onWardUpdate = (_dt: number) => {if (!this.player.isWarding) this.positiveMachine.setState(States.CLEAN);};

    ward = (id: string) => {
        if (this.player.negationBubble === undefined || this.player.isWarding === false) {
            if (this.player.negationBubble) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
            };
            this.player.isWarding = false;
            return;
        };
        this.player.enemySound('parry', true);
        this.scene.combatManager.stunned(id);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        this.player.specialCombatText = this.scene.showCombatText('Warded', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        if (this.player.negationBubble.charges <= 0) {
            this.player.specialCombatText = this.scene.showCombatText('Ward Broken', 500, 'damage', false, true, () => this.player.specialCombatText = undefined);
            this.player.negationBubble.setCharges(0);
            this.player.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.player.aoe = new AoE(this.scene, 'writhe', 1, false, this.player);    
        this.player.enemySound('spooky', true);
        this.player.specialCombatText = this.scene.showCombatText('Writhing', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.player.isWrithing = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren grips their body and contorts, writhing around them.`
        });
    };
    onWritheUpdate = (_dt: number) => {if (!this.player.isWrithing) this.positiveMachine.setState(States.CLEAN);};
    onWritheExit = () => {
        this.player.aoe.cleanAnimation(this.scene);
    };

    // ==================== TRAITS ==================== \\
    onAstricationEnter = () => {
        if (this.player.isAstrifying === true) return;
        this.scene.combatManager.combatMachine.input('astrication', {active:true,charges:0});
        this.player.enemySound('lightning', true);
        this.player.specialCombatText = this.scene.showCombatText('Astrication', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isAstrifying = true;
        this.player.flickerCarenic(PLAYER.DURATIONS.ASTRICATION); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.ASTRICATION, () => {
            // this.scene.combatManager.combatMachine.input('astrication', {active:false,charges:0});
            this.player.isAstrifying = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren astrifies, wrapping round their attacks.`
        });
    };
    onAstricationUpdate = (_dt: number) => {if (!this.player.isAstrifying) this.positiveMachine.setState(States.CLEAN);};

    onBerserkEnter = () => {
        if (this.player.isBerserking === true) return;
        this.player.enemySound('howl', true);
        this.scene.combatManager.combatMachine.input('berserk', {active:true,charges:1});
        this.player.specialCombatText = this.scene.showCombatText('Berserking', 750, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.isBerserking = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BERSERK, () => {
            // this.scene.combatManager.combatMachine.input('berserk', {active:false,charges:0});
            this.player.isBerserking = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren feeds off the pain, its hush shrieking forth.`
        });
    };
    onBerserkUpdate = (_dt: number) => {if (!this.player.isBerserking) this.positiveMachine.setState(States.CLEAN);};

    onBlindEnter = () => {
        this.player.aoe = new AoE(this.scene, 'blind', 1, false, this.player);
        this.player.enemySound('righteous', true);
        this.player.specialCombatText = this.scene.showCombatText('Brilliance', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.player.isBlinding = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren shines with brilliance, blinding those around them.`
        });
    };
    onBlindUpdate = (_dt: number) => {if (!this.player.isBlinding) this.positiveMachine.setState(States.CLEAN);};

    onCaerenesisEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.aoe = new AoE(this.scene, 'caerenesis', 1, false, this.player, false, this.player.currentTarget);    
        this.player.enemySound('blink', true);
        this.player.specialCombatText = this.scene.showCombatText('Caerenesis', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.isCaerenesis = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CAERENESIS, () => {
            this.player.isCaerenesis = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren grips their body and contorts, writhing around them.`
        });
    };
    onCaerenesisUpdate = (_dt: number) => {if (!this.player.isCaerenesis) this.positiveMachine.setState(States.CLEAN);};

    onConvictionEnter = () => {
        if (this.player.isConvicted === true) return;
        this.scene.combatManager.combatMachine.input('conviction', {active:true,charges:0});
        this.player.enemySound('spooky', true);
        this.player.specialCombatText = this.scene.showCombatText('Conviction', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.isConvicted = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CONVICTION, () => {
            // this.scene.combatManager.combatMachine.input('conviction', {active:false,charges:0});
            this.player.isConvicted = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren steels itself in admiration of their physical form.`
        });
    };
    onConvictionUpdate = (_dt: number) => {if (!this.player.isConvicted) this.positiveMachine.setState(States.CLEAN)};

    onImpermanenceEnter = () => {
        if (this.player.isImpermanent === true) return;
        this.player.enemySound('spooky', true);
        this.player.specialCombatText = this.scene.showCombatText('Impermanence', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.player.isImpermanent = true;
        this.player.flickerCarenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.IMPERMANENCE, () => {
            this.player.isImpermanent = false;
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren grips their body and fades, its hush concealing.`
        });
    };
    onImpermanenceUpdate = (_dt: number) => {if (!this.player.isImpermanent) this.positiveMachine.setState(States.CLEAN);};

    onSeerEnter = () => {
        if (this.player.isSeering === true) return;
        this.player.enemySound('fire', true);
        this.scene.combatManager.combatMachine.input('isSeering', true);
        this.player.specialCombatText = this.scene.showCombatText('Seer', 750, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.isSeering = true;
        this.player.flickerCarenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.SEER, () => {
            this.player.isSeering = false;
            if (this.scene.state.isSeering === true) {
                // this.scene.combatManager.combatMachine.input('isSeering', false);
            };
        }, undefined, this);
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren calms their body to focus, its hush bleeding into them.`
        });
    };
    onSeerUpdate = (_dt: number) => {if (!this.player.isSeering) this.positiveMachine.setState(States.CLEAN);};

    onDispelEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.enemySound('debuff', true);
        this.player.specialCombatText = this.scene.showCombatText('Dispelling', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(1000); 
        this.player.currentTarget.clearBubbles();
    };
    onDispelExit = () => {};

    onShirkEnter = () => {
        this.player.isShirking = true;
        this.player.enemySound('blink', true);
        this.player.specialCombatText = this.scene.showCombatText('Shirking', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isConfused = false;
        this.player.isFeared = false;
        this.player.isParalyzed = false;
        this.player.isPolymorphed = false;
        this.player.isStunned = false;
        this.player.isSlowed = false;
        this.player.isSnared = false;
        this.player.isFrozen = false;
        this.player.isRooted = false;

        this.stateMachine.setState(States.COMPUTER_COMBAT);
        this.negativeMachine.setState(States.CLEAN);

        this.player.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isShirking = false;
        }, undefined, this); 
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s caeren's hush grants reprieve, freeing them.`
        });
    };
    onShirkExit = () => {};


    onShadowEnter = () => {
        this.player.isShadowing = true;
        this.player.enemySound('wild', true);
        this.player.specialCombatText = this.scene.showCombatText('Shadowing', DURATION.TEXT, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isShadowing = false;
        }, undefined, this);
    };
    onShadowExit = () => {};

    pursue = (id: string) => {
        const enemy = this.scene.enemies.find(e => e.enemyID === id);
        if (!enemy) return;
        this.player.enemySound('wild', true);
        if (enemy.flipX) {
            this.player.setPosition(enemy.x + 16, enemy.y);
        } else {
            this.player.setPosition(enemy.x - 16, enemy.y);
        };
    };
    
    onTetherEnter = () => {
        this.player.isTethering = true;
        this.player.enemySound('dungeon', true);
        this.player.specialCombatText = this.scene.showCombatText('Tethering', DURATION.TEXT, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isTethering = false;
        }, undefined, this);
    };
    onTetherExit = () => {};

    tether = (id: string) => {
        const enemy = this.scene.enemies.find(e => e.enemyID === id);
        if (!enemy) return;
        this.player.enemySound('dungeon', true);
        this.player.hook(enemy, 1000);
    };

    // ================= NEGATIVE MACHINE STATES ================= \\
    onConfusedEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('?c .on-f-u`SeD~', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.confuseDirection = 'down';
        this.player.confuseVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ''; 
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const dir = Math.floor(Math.random() * 4);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[dir];
            if (move >= 20) {
                this.player.confuseVelocity = MOVEMENT[direction as keyof typeof MOVEMENT];
            } else {
                this.player.confuseVelocity = { x: 0, y: 0 };
            };
            this.player.flipX = this.player.confuseVelocity.x < 0;
            this.player.playerVelocity.x = this.player.confuseVelocity.x;
            this.player.playerVelocity.y = this.player.confuseVelocity.y;
            this.player.confuseDirection = direction;
        };
        const confusions = ['~?  ? ?!', 'Hhwat?', 'Wh-wor; -e ma i?', 'Woh `re ewe?', '...'];
        this.player.confuseTimer = this.scene.time.addEvent({
            delay: 1250,
            callback: () => {
                iteration++;
                if (iteration === 6) {
                    iteration = 0;
                    this.player.isConfused = false;
                } else {   
                    randomDirection();
                    this.player.specialCombatText = this.scene.showCombatText(confusions[Math.floor(Math.random() * 5)], 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
                };
            },
            callbackScope: this,
            repeat: 6,
        });
    };
    onConfusedUpdate = (_dt: number) => {
        if (!this.player.isConfused) this.player.combatChecker(this.player.isConfused);
        this.player.playerVelocity.x = this.player.confuseVelocity.x;
        this.player.playerVelocity.y = this.player.confuseVelocity.y;    
    };
    onConfusedExit = () => { 
        if (this.player.isConfused) this.player.isConfused = false;
        this.player.spriteWeapon.setVisible(true);
        if (this.player.confuseTimer) {
            this.player.confuseTimer.destroy();
            this.player.confuseTimer = undefined;
        };
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onFearedEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage', false, false, () => this.player.specialCombatText = undefined);
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.fearVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ''; 
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        let iteration = 0;
        const fears = ['...ahhh!', 'c̶o̷m̷e̷ ̴h̴e̵r̶e̶', 'Stay Away!', 'Somebody HELP ME', 'g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓'];
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Math.floor(Math.random() * 4)];
            if (move >= 20) {
                this.player.fearVelocity = MOVEMENT[direction as keyof typeof MOVEMENT];
            } else {
                this.player.fearVelocity = { x: 0, y: 0 };
            };
            this.player.flipX = this.player.fearVelocity.x < 0;
            this.player.playerVelocity.x = this.player.fearVelocity.x;
            this.player.playerVelocity.y = this.player.fearVelocity.y;
        };
        this.player.fearTimer = this.scene.time.addEvent({
            delay: 1250,
            callback: () => {
                iteration++;
                if (iteration === 4) {
                    iteration = 0;
                    this.player.isFeared = false;
                } else {   
                    randomDirection();
                    this.player.specialCombatText = this.scene.showCombatText(fears[Math.floor(Math.random() * 5)], 750, 'damage', false, false, () => this.player.specialCombatText = undefined);
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 
    };
    onFearedUpdate = (_dt: number) => {
        if (!this.player.isFeared) this.player.combatChecker(this.player.isFeared);
        this.player.playerVelocity.x = this.player.fearVelocity.x;
        this.player.playerVelocity.y = this.player.fearVelocity.y;
    };
    onFearedExit = () => {
        this.player.isFeared = false;
        this.player.fearCount = 0;
        this.player.spriteWeapon.setVisible(true);
        if (this.player.fearTimer) {
            this.player.fearTimer.destroy();
            this.player.fearTimer = undefined;
        };
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onFrozenEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Frozen', DURATION.TEXT, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.clearAnimations();
        this.player.anims.play('player_idle', true);
        this.player.setStatic(true);
        this.scene.time.addEvent({
            delay: DURATION.FROZEN,
            callback: () => {
                this.player.isFrozen = false;
                this.negativeMachine.setState(States.CLEAN);
            },
            callbackScope: this,
            loop: false,
        });
    };
    onFrozenExit = () => this.player.setStatic(false);

    onPolymorphedEnter = () => {
        this.player.isPolymorphed = true;
        this.player.specialCombatText = this.scene.showCombatText('Polymorphed', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.clearAnimations();
        this.player.clearTint();
        this.player.anims.pause();
        this.player.anims.play('rabbit_idle_down', true);
        this.player.anims.resume();
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.polymorphDirection = 'down';
        this.player.polymorphMovement = 'idle';
        this.player.polymorphVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ''; 
        let iteration = 0;
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const directions = ['up', 'down', 'left', 'right'];
            const dir = Math.floor(Math.random() * directions.length);
            const direction = directions[dir];
            if (move >= 20) {
                this.player.polymorphMovement = 'move';
                this.player.polymorphVelocity = MOVEMENT[direction as keyof typeof MOVEMENT]; 
            } else {
                this.player.polymorphMovement = 'idle';                
                this.player.polymorphVelocity = { x: 0, y: 0 };
            };
            this.player.flipX = this.player.polymorphVelocity.x < 0;
            this.player.polymorphDirection = direction;
            this.player.playerVelocity.x = this.player.polymorphVelocity.x;
            this.player.playerVelocity.y = this.player.polymorphVelocity.y;
        };
        this.player.polymorphTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                iteration++;
                if (iteration === 5) {
                    iteration = 0;
                    this.player.isPolymorphed = false;
                } else {   
                    randomDirection();
                    this.player.specialCombatText = this.scene.showCombatText('...thump', 1000, 'effect', false, false, () => this.player.specialCombatText = undefined);        
                    this.heal(0.2);
                };
            },
            callbackScope: this,
            repeat: 5,
        }); 
    };
    onPolymorphedUpdate = (_dt: number) => {
        if (!this.player.isPolymorphed) this.player.combatChecker(this.player.isPolymorphed);
        this.player.playerVelocity.x = this.player.polymorphVelocity.x;
        this.player.playerVelocity.y = this.player.polymorphVelocity.y;
    };
    onPolymorphedExit = () => { 
        if (this.player.isPolymorphed) this.player.isPolymorphed = false;
        this.player.clearAnimations();
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.player.spriteWeapon.setVisible(true);
        if (this.player.polymorphTimer) {
            this.player.polymorphTimer.destroy();
            this.player.polymorphTimer = undefined;
        };
    };

    onSlowedEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Slowed', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.setTint(0xFFC700);
        this.player.adjustSpeed(-(PLAYER.SPEED.SLOW - 0.25));
        this.scene.time.delayedCall(this.player.slowDuration, () =>{
            this.player.isSlowed = false;
            this.negativeMachine.setState(States.CLEAN);
        }, undefined, this);
    };

    onSlowedExit = () => {
        this.player.clearTint();
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.player.adjustSpeed((PLAYER.SPEED.SLOW - 0.25));
    };

    onSnaredEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText('Snared', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.snareDuration = DURATION.SNARED;
        this.player.setTint(0x0000FF);
        this.player.adjustSpeed(-(PLAYER.SPEED.SNARE - 0.25));
        this.scene.time.delayedCall(this.player.snareDuration, () =>{
            this.player.isSnared = false;
            this.negativeMachine.setState(States.CLEAN);
        }, undefined, this);
    };
    onSnaredExit = () => { 
        this.player.clearTint(); 
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF); 
        this.player.adjustSpeed((PLAYER.SPEED.SNARE - 0.25));
    };

    onStunnedEnter = () => {
        this.player.isStunned = true;
        this.player.specialCombatText = this.scene.showCombatText('Stunned', PLAYER.DURATIONS.STUNNED, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.setTint(0xFF0000);
        this.player.setStatic(true);
        this.player.anims.pause();
        EventBus.emit('party-combat-text', {
            text: `${this.player.ascean.name}'s been stunned.`
        });
    };
    onStunnedUpdate = (dt: number) => {
        this.player.setVelocity(0);
        this.player.stunDuration -= dt;
        if (this.player.stunDuration <= 0) this.player.isStunned = false;
        this.player.combatChecker(this.player.isStunned);
    };
    onStunnedExit = () => {
        this.player.isStunned = false;
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.player.setStatic(false);
        this.player.anims.resume();
    };

    update(dt: number) {
        this.stateMachine.update(dt);
        this.positiveMachine.update(dt);
        this.negativeMachine.update(dt);
    };
};