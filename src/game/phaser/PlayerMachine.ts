import { Game } from "../scenes/Game";
import { Underground } from "../scenes/Underground";
// @ts-ignore
import Player from '../game/entities/Player';
import StateMachine, { States } from "./StateMachine";
import ScrollingCombatText from "./ScrollingCombatText";
import { PLAYER, PLAYER_INSTINCTS } from "../../utility/player";
import { FRAME_COUNT } from '../entities/Entity';
// @ts-ignore
import AoE from './AoE';
import { EventBus } from "../EventBus";
import { screenShake } from "./ScreenShake";
import Bubble from "./Bubble";
import { BlendModes } from "phaser";
import { RANGE } from "../../utility/enemy";
import { Arena } from "../scenes/Arena";
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
    DODGE: 288, // 288
    ROLL: 320, // 320
    SPECIAL: 5000,
};
const MOVEMENT = {
    'up': { x: 0, y: -5 },
    'down': { x: 0, y: 5 },
    'left': { x: -5, y: 0 },
    'right': { x: 5, y: 0 },
};
export default class PlayerMachine {
    scene: Game | Underground | Arena;
    player: Player;
    stateMachine: StateMachine;
    positiveMachine: StateMachine;
    negativeMachine: StateMachine;

    constructor(scene: Game | Underground | Arena, player: Player) {
        this.scene = scene;
        this.player = player;
        this.stateMachine = new StateMachine(this, 'player');
        this.stateMachine
            .addState(States.IDLE, { onEnter: this.onIdleEnter, onUpdate: this.onIdleUpdate, onExit: this.onIdleExit })
            .addState(States.NONCOMBAT, { onEnter: this.onNonCombatEnter, onUpdate: this.onNonCombatUpdate, onExit: this.onNonCombatExit })
            .addState(States.COMBAT, { onEnter: this.onCombatEnter }) // , onUpdate: this.onCombatUpdate
            .addState(States.COMPUTER_COMBAT, { onEnter: this.onComputerCombatEnter }) // , onUpdate: this.onComputerCombatUpdate
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.LEASH, { onEnter: this.onLeashEnter, onUpdate: this.onLeashUpdate, onExit: this.onLeashExit })
            .addState(States.EVADE, { onEnter: this.onEvasionEnter, onUpdate: this.onEvasionUpdate, onExit: this.onEvasionExit })
            .addState(States.CONTEMPLATE, { onEnter: this.onContemplateEnter, onUpdate: this.onContemplateUpdate, onExit: this.onContemplateExit })
            .addState(States.ATTACK, { onEnter: this.onAttackEnter, onUpdate: this.onAttackUpdate, onExit: this.onAttackExit })
            .addState(States.PARRY, { onEnter: this.onParryEnter, onUpdate: this.onParryUpdate, onExit: this.onParryExit })
            .addState(States.DODGE, { onEnter: this.onDodgeEnter, onUpdate: this.onDodgeUpdate, onExit: this.onDodgeExit })
            .addState(States.POSTURE, { onEnter: this.onPostureEnter, onUpdate: this.onPostureUpdate, onExit: this.onPostureExit })
            .addState(States.ROLL, { onEnter: this.onRollEnter, onUpdate: this.onRollUpdate, onExit: this.onRollExit })
            .addState(States.THRUST, { onEnter: this.onThrustEnter, onUpdate: this.onThrustUpdate, onExit: this.onThrustExit })
            .addState(States.STUN, { onEnter: this.onStunnedEnter, onUpdate: this.onStunnedUpdate, onExit: this.onStunnedExit })
            .addState(States.ARC, { onEnter: this.onArcEnter, onUpdate: this.onArcUpdate, onExit: this.onArcExit })
            .addState(States.ACHIRE, { onEnter: this.onAchireEnter, onUpdate: this.onAchireUpdate, onExit: this.onAchireExit })
            .addState(States.ASTRAVE, { onEnter: this.onAstraveEnter, onUpdate: this.onAstraveUpdate, onExit: this.onAstraveExit })
            .addState(States.BLINK, { onEnter: this.onBlinkEnter, onUpdate: this.onBlinkUpdate })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.CONSUME, { onEnter: this.onConsumeEnter, onUpdate: this.onConsumeUpdate, onExit: this.onConsumeExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onUpdate: this.onDesperationUpdate, onExit: this.onDesperationExit })
            .addState(States.FEAR, { onEnter: this.onFearingEnter, onUpdate: this.onFearingUpdate, onExit: this.onFearingExit })
            .addState(States.FYERUS, { onEnter: this.onFyerusEnter, onUpdate: this.onFyerusUpdate, onExit: this.onFyerusExit })
            .addState(States.HEALING, { onEnter: this.onHealingEnter, onUpdate: this.onHealingUpdate, onExit: this.onHealingExit })
            .addState(States.HOOK, { onEnter: this.onHookEnter, onUpdate: this.onHookUpdate, onExit: this.onHookExit })
            .addState(States.ILIRECH, { onEnter: this.onIlirechEnter, onUpdate: this.onIlirechUpdate, onExit: this.onIlirechExit })
            .addState(States.INVOKE, { onEnter: this.onInvokeEnter, onUpdate: this.onInvokeUpdate, onExit: this.onInvokeExit })
            .addState(States.KYNISOS, { onEnter: this.onKynisosEnter, onUpdate: this.onKynisosUpdate, onExit: this.onKynisosExit })
            .addState(States.KYRNAICISM, { onEnter: this.onKyrnaicismEnter, onUpdate: this.onKyrnaicismUpdate, onExit: this.onKyrnaicismExit })
            .addState(States.LEAP, { onEnter: this.onLeapEnter, onUpdate: this.onLeapUpdate, onExit: this.onLeapExit })
            .addState(States.MAIERETH, { onEnter: this.onMaierethEnter, onUpdate: this.onMaierethUpdate, onExit: this.onMaierethExit })
            .addState(States.MARK, { onEnter: this.onMarkEnter, onUpdate: this.onMarkUpdate, onExit: this.onMarkExit })
            .addState(States.NETHERSWAP, { onEnter: this.onNetherswapEnter, onUpdate: this.onNetherswapUpdate, onExit: this.onNetherswapExit })
            .addState(States.PARALYZE, { onEnter: this.onParalyzeEnter, onUpdate: this.onParalyzeUpdate, onExit: this.onParalyzeExit })
            .addState(States.POLYMORPH, { onEnter: this.onPolymorphingEnter, onUpdate: this.onPolymorphingUpdate, onExit: this.onPolymorphingExit })
            .addState(States.PURSUIT, { onEnter: this.onPursuitEnter, onUpdate: this.onPursuitUpdate, onExit: this.onPursuitExit })
            .addState(States.RECALL, { onEnter: this.onRecallEnter, onUpdate: this.onRecallUpdate, onExit: this.onRecallExit })
            .addState(States.QUOR, { onEnter: this.onQuorEnter, onUpdate: this.onQuorUpdate, onExit: this.onQuorExit })
            .addState(States.RECONSTITUTE, { onEnter: this.onReconstituteEnter, onUpdate: this.onReconstituteUpdate, onExit: this.onReconstituteExit })
            .addState(States.ROOT, { onEnter: this.onRootingEnter, onUpdate: this.onRootingUpdate, onExit: this.onRootingExit })
            .addState(States.RUSH, { onEnter: this.onRushEnter, onUpdate: this.onRushUpdate, onExit: this.onRushExit })
            .addState(States.SACRIFICE, { onEnter: this.onSacrificeEnter, onUpdate: this.onSacrificeUpdate, onExit: this.onSacrificeExit })
            .addState(States.SNARE, { onEnter: this.onSnaringEnter, onUpdate: this.onSnaringUpdate, onExit: this.onSnaringExit })
            .addState(States.SUTURE, { onEnter: this.onSutureEnter, onUpdate: this.onSutureUpdate, onExit: this.onSutureExit })
            .addState(States.SLOW, { onEnter: this.onSlowEnter, onUpdate: this.onSlowUpdate, onExit: this.onSlowExit })
            .addState(States.STORM, { onEnter: this.onStormEnter, onUpdate: this.onStormUpdate, onExit: this.onStormExit })
            .addState(States.DEVOUR, { onEnter: this.onDevourEnter, onUpdate: this.onDevourUpdate, onExit: this.onDevourExit })
            .addState(States.CONFUSED, { onEnter: this.onConfusedEnter, onUpdate: this.onConfusedUpdate, onExit: this.onConfusedExit })
            .addState(States.FEARED, { onEnter: this.onFearedEnter, onUpdate: this.onFearedUpdate, onExit: this.onFearedExit })
            .addState(States.POLYMORPHED, { onEnter: this.onPolymorphedEnter, onUpdate: this.onPolymorphedUpdate, onExit: this.onPolymorphedExit });
        this.stateMachine.setState(States.NONCOMBAT);

        this.positiveMachine = new StateMachine(this, 'player');
        this.positiveMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.ABSORB, { onEnter: this.onAbsorbEnter, onUpdate: this.onAbsorbUpdate })
            .addState(States.CHIOMIC, { onEnter: this.onChiomicEnter, onUpdate: this.onChiomicUpdate })
            .addState(States.DISEASE, { onEnter: this.onDiseaseEnter, onUpdate: this.onDiseaseUpdate, onExit: this.onDiseaseExit })
            .addState(States.ENVELOP, { onEnter: this.onEnvelopEnter, onUpdate: this.onEnvelopUpdate })
            .addState(States.FREEZE, { onEnter: this.onFreezeEnter, onUpdate: this.onFreezeUpdate, onExit: this.onFreezeExit })
            .addState(States.HOWL, { onEnter: this.onHowlEnter, onUpdate: this.onHowlUpdate, onExit: this.onHowlExit })
            .addState(States.MALICE, { onEnter: this.onMaliceEnter, onUpdate: this.onMaliceUpdate })
            .addState(States.MENACE, { onEnter: this.onMenaceEnter, onUpdate: this.onMenaceUpdate })
            .addState(States.MEND, { onEnter: this.onMendEnter, onUpdate: this.onMendUpdate })
            .addState(States.MODERATE, { onEnter: this.onModerateEnter, onUpdate: this.onModerateUpdate })
            .addState(States.MULTIFARIOUS, { onEnter: this.onMultifariousEnter, onUpdate: this.onMultifariousUpdate })
            .addState(States.MYSTIFY, { onEnter: this.onMystifyEnter, onUpdate: this.onMystifyUpdate })
            .addState(States.STEALTH, { onEnter: this.onStealthEnter, onUpdate: this.onStealthUpdate, onExit: this.onStealthExit })
            .addState(States.PROTECT, { onEnter: this.onProtectEnter, onUpdate: this.onProtectUpdate })
            .addState(States.RECOVER, { onEnter: this.onRecoverEnter, onUpdate: this.onRecoverUpdate })
            .addState(States.REIN, { onEnter: this.onReinEnter, onUpdate: this.onReinUpdate }) // 1
            .addState(States.RENEWAL, { onEnter: this.onRenewalEnter, onUpdate: this.onRenewalUpdate })
            .addState(States.SCREAM, { onEnter: this.onScreamEnter, onUpdate: this.onScreamUpdate, onExit: this.onScreamExit })
            .addState(States.SHIELD, { onEnter: this.onShieldEnter, onUpdate: this.onShieldUpdate })
            .addState(States.SHIMMER, { onEnter: this.onShimmerEnter, onUpdate: this.onShimmerUpdate })
            .addState(States.SPRINTING, { onEnter: this.onSprintEnter, onUpdate: this.onSprintUpdate })
            .addState(States.WARD, { onEnter: this.onWardEnter, onUpdate: this.onWardUpdate })
            .addState(States.WRITHE, { onEnter: this.onWritheEnter, onUpdate: this.onWritheUpdate, onExit: this.onWritheExit })
            .addState(States.ASTRICATION, { onEnter: this.onAstricationEnter, onUpdate: this.onAstricationUpdate })
            .addState(States.BERSERK, { onEnter: this.onBerserkEnter, onUpdate: this.onBerserkUpdate })
            .addState(States.BLIND, { onEnter: this.onBlindEnter, onUpdate: this.onBlindUpdate, onExit: this.onBlindExit })
            .addState(States.CAERENESIS, { onEnter: this.onCaerenesisEnter, onUpdate: this.onCaerenesisUpdate })
            .addState(States.CONVICTION, { onEnter: this.onConvictionEnter, onUpdate: this.onConvictionUpdate })
            .addState(States.ENDURANCE, { onEnter: this.onEnduranceEnter, onUpdate: this.onEnduranceUpdate, onExit: this.onEnduranceExit })
            .addState(States.IMPERMANENCE, { onEnter: this.onImpermanenceEnter, onUpdate: this.onImpermanenceUpdate })
            .addState(States.SEER, { onEnter: this.onSeerEnter, onUpdate: this.onSeerUpdate })
            .addState(States.STIMULATE, { onEnter: this.onStimulateEnter, onUpdate: this.onStimulateUpdate })
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
        if (!this.player.currentTarget || !this.player.currentTarget.position || !this.player.currentTarget.position.body) return;
        this.player.frameCount = 0;
        // this.enemyAnimation();
        this.player.chaseTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                // this.scene.navMesh.debugDrawClear();
                if (!this.player.currentTarget || !this.player.currentTarget.position || !this.player.currentTarget.position.body) {
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
        if (!this.player.currentTarget) return;
        const rangeMultiplier = this.player.rangedDistanceMultiplier(3);
        const direction = this.player.currentTarget.position.subtract(this.player.position);
        const distance = direction.length();
        if (Math.abs(this.player.originPoint.x - this.player.position.x) > RANGE.LEASH * rangeMultiplier || Math.abs(this.player.originPoint.y - this.player.position.y) > RANGE.LEASH * rangeMultiplier || !this.player.inCombat || distance > RANGE.LEASH * rangeMultiplier) {
            this.stateMachine.setState(States.LEASH);
            return;
        };  
        if (distance >= 50 * rangeMultiplier) { // was 75 || 100
            if (this.player.path && this.player.path.length > 1) {
                this.player.setVelocity(this.player.pathDirection.x * this.player.speed, this.player.pathDirection.y * this.player.speed); // 2.5
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * this.player.speed, direction.y * this.player.speed); // 2.5
            };
        } else {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        };
    }; 
    onChaseExit = () => {
        // this.scene.navMesh.debugDrawClear();
        this.player.setVelocity(0, 0);
        if (this.player.chaseTimer) {
            this.player.chaseTimer?.remove(false);
            this.player.chaseTimer.destroy();
            this.player.chaseTimer = undefined;
        };
    };

    onLeashEnter = () => {
        this.player.inCombat = false;
        // this.player.setVelocity(0);
        this.player.healthbar.setVisible(false);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Leashing', 1500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.leashTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                let originPoint = new Phaser.Math.Vector2(this.player.originalPosition.x, this.player.originalPosition.y);
                this.scene.navMesh.debugDrawClear();
                this.player.path = this.scene.navMesh.findPath(this.player.position, originPoint);
                if (this.player.path && this.player.path.length > 1) {
                    if (!this.player.isPathing) this.player.isPathing = true;
                    const nextPoint = this.player.path[1];
                    this.player.nextPoint = nextPoint;
                    this.scene.navMesh.debugDrawPath(this.player.path, 0xffd900);
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
                this.player.setVelocity(this.player.pathDirection.x * (this.player.speed), this.player.pathDirection.y * (this.player.speed)); // 2.5
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * (this.player.speed), direction.y * (this.player.speed)); // 2.5
            };
        } else {
            this.stateMachine.setState(States.IDLE);
        };
    };
    onLeashExit = () => {
        this.player.setVelocity(0);
        this.player.leashTimer?.destroy();
        this.player.leashTimer = undefined;
        this.scene.navMesh.debugDrawClear(); 
        (this.scene as Arena).computerDisengage();
    };

    onEvasionEnter = () => {
        const x = Phaser.Math.Between(1, 2);
        const y = Phaser.Math.Between(1, 2);
        const evade = Phaser.Math.Between(1, 2);
        this.player.frameCount = 0;
        this.player.evadeRight = x === 1;
        this.player.evadeUp = y === 1;
        this.player.evadeType = evade;
    };
    onEvasionUpdate = (_dt: number) => {
        if (this.player.evadeType === 1) {
            this.player.anims.play('player_slide', true);
        } else {
            this.player.anims.play('player_roll', true);        
        };
        if (this.player.evadeRight) {
            this.player.setVelocityX(this.player.speed);
        } else {
            this.player.setVelocityX(-this.player.speed);
        };
        if (this.player.evadeUp) {
            this.player.setVelocityY(this.player.speed);
        } else {
            this.player.setVelocityY(-this.player.speed);
        };
        if (!this.player.isDodging && !this.player.isRolling) this.player.evaluateCombatDistance();
    }; 
    onEvasionExit = () => {};

    onContemplateEnter = () => {
        if (this.player.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.player.inCombat = false;
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.player.isContemplating = true;
        this.player.frameCount = 0;
        this.player.setVelocity(0);
        this.player.contemplationTime = Phaser.Math.Between(500, 1000);
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
        this.stateMachine.setState(States.CHASE);
    };

    instincts = () => {
        if (this.player.inCombat === false) {
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.scene.time.delayedCall(500, () => {
            let chance = [1, 2, 3, (!this.player.isRanged ? 6 : 7), (!this.player.isRanged ? 8 : 9)][Math.floor(Math.random() * 5)];
            let mastery = this.player.ascean.mastery;
            let health = this.player.health / this.player.ascean.health.max;
            let player = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
            const direction = this.player.currentTarget?.position.subtract(this.player.position);
            const distance = direction?.length();
            let instinct =
                health <= 0.33 ? 0 : // Critical Heal
                health <= 0.66 ? 1 : // Casual Heal
                
                player <= 0.33 ? 2 : // Critical Damage
                player <= 0.66 ? 3 : // Casual Damage
                
                (distance <= 100 && !this.player.isRanged) ? 4 : // AoE + Melee at Short Range
                (distance <= 100 && this.player.isRanged) ? 4 : // AoE + Ranged at Short Range
                
                (distance > 100 && distance < 250 && !this.player.isRanged) ? 5 : // Melee at Mid Range
                (distance > 100 && distance < 250 && this.player.isRanged) ? 6 : // Ranged at Mid Range
                
                (distance >= 250 && !this.player.isRanged) ? 5 : // Melee at Long Range
                (distance >= 250 && this.player.isRanged) ? 6 : // Ranged at Long Range
                chance; // Range
            // console.log(`Chance: ${chance} | Instinct: ${instinct} | Mastery: ${mastery}`);
            let key = PLAYER_INSTINCTS[mastery as keyof typeof PLAYER_INSTINCTS][instinct].key, value = PLAYER_INSTINCTS[mastery as keyof typeof PLAYER_INSTINCTS][instinct].value;
            (this as any)[key].setState(value);
            if (key === 'positiveMachine') this.stateMachine.setState(States.CHASE);
            this.scene.hud.logger.log(`Your instinct leads you to ${value}`);
        }, undefined, this);
    };

    
    onIdleEnter = () => {
        this.player.setVelocity(0);
        this.player.currentRound = 0;

    };
    onIdleUpdate = (_dt: number) => {};
    onIdleExit = () => {};
    
    onNonCombatEnter = () => {
        // this.player.setVelocity(0);
        // this.player.anims.play('player_idle', true);
        // if (this.scene.combatTimer) this.scene.stopCombatTimer();
        // if (this.player.currentRound !== 0) this.player.currentRound = 0;
    };
    onNonCombatUpdate = (_dt: number) => {
        if (this.player.isMoving) this.player.isMoving = false;
        if (this.player.inCombat) this.stateMachine.setState(States.COMBAT);
    };
    onNonCombatExit = () => {
        // this.player.anims.stop('player_idle');
    };

    onCombatEnter = () => {
        if (this.player.isComputer) this.stateMachine.setState(States.COMPUTER_COMBAT);
    };
    onCombatUpdate = (_dt: number) => { 
        // if (this.player.isComputer) this.player.evaluateCombatDistance();
        // if (!this.player.inCombat) this.stateMachine.setState(States.NONCOMBAT);
    };

    
    onComputerCombatEnter = () => {        
        if (this.player.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.player.inCombat = false;
            this.stateMachine.setState(States.LEASH);
            return;
        };
        this.player.frameCount = 0;
        if (this.player.specials === false) {
            this.player.specials = true;
            this.player.setSpecialCombat();
        };
        if (!this.player.computerAction && !this.player.isSuffering() && !this.player.isCasting) {
            this.player.computerAction = true;
            this.scene.time.delayedCall(Phaser.Math.Between(1250, 1750), () => {
                this.player.computerAction = false;
                this.player.evaluateCombat();
            }, undefined, this);
        };
    };
    onComputerCombatUpdate = (_dt: number) => { 
        if (!this.player.computerAction) this.stateMachine.setState(States.CHASE);  
        // this.player.evaluateCombatDistance();
    };

    onAttackEnter = () => {
        if (this.player.isPosturing || this.player.isParrying || this.player.isThrusting) {return};
        if (this.player.isRanged === true && this.player.inCombat === true && !this.player.isComputer) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct) {
                this.player.resistCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Skill Issue: Look at the Enemy!', 1000, 'damage', false, true, () => this.player.resistCombatText = undefined);
                return;
            };
        };
        this.player.isAttacking = true;
        if (!this.player.isComputer) this.player.swingReset(States.ATTACK, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.ATTACK);
        this.player.frameCount = 0;
    }; 
    onAttackUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input('action', 'attack');
        };
        this.player.combatChecker(this.player.isAttacking);
    }; 
    onAttackExit = () => {if (this.scene.state.action === 'attack') this.scene.combatManager.combatMachine.input('action', '');  this.player.computerAction = false;};

    onParryEnter = () => {
        this.player.isParrying = true;    
        if (!this.player.isComputer) this.player.swingReset(States.PARRY, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.PARRY);
        if (this.player.hasMagic === true) {
            this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Counter Spell', 1000, 'hush', false, true, () => this.player.specialCombatText = undefined);
            this.player.isCounterSpelling = true;
            this.player.flickerCarenic(1000); 
            this.scene.time.delayedCall(1000, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
        this.player.frameCount = 0;
    };
    onParryUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.PARRY_LIVE && !this.player.isRanged) this.scene.combatManager.combatMachine.input('action', 'parry');
        if (this.player.frameCount >= FRAME_COUNT.PARRY_KILL) this.player.isParrying = false;
        this.player.combatChecker(this.player.isParrying);
    };
    onParryExit = () => {if (this.scene.state.action === 'parry') this.scene.combatManager.combatMachine.input('action', '');this.player.computerAction = false;};

    onPostureEnter = () => {
        if (this.player.isAttacking || this.player.isParrying || this.player.isThrusting) return;
        if (this.player.isRanged === true && !this.player.isComputer) {
            if (this.player.isMoving === true) {
                this.player.resistCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Posture Issue: You are Moving', 1000, 'damage', false, true, () => this.player.resistCombatText = undefined);
                return;
            };
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct && this.player.inCombat === true) {
                this.player.resistCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Skill Issue: Look at the Enemy!', 1000, 'damage', false, true, () => this.player.resistCombatText = undefined);
                return;
            };
        };
        this.player.isPosturing = true;
        this.player.spriteShield.setVisible(true);
        if (!this.player.isComputer) this.player.swingReset(States.POSTURE, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.POSTURE);
        this.player.frameCount = 0;
    };
    onPostureUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input('action', 'posture');
        };
        this.player.combatChecker(this.player.isPosturing);
    };
    onPostureExit = () => {if (this.scene.state.action === 'posture') this.scene.combatManager.combatMachine.input('action', ''); this.player.spriteShield.setVisible(this.player.isStalwart); this.player.computerAction = false;};

    onDodgeEnter = () => {
        if (this.player.isStalwart || this.player.isStorming || this.player.isRolling) return;
        this.player.isDodging = true;
        this.scene.combatManager.useStamina(PLAYER.STAMINA.DODGE);
        if (!this.player.isComputer) this.player.swingReset(States.DODGE, true);
        this.scene.sound.play('dodge', { volume: this.scene.hud.settings.volume / 2 });
        this.player.wasFlipped = this.player.flipX; 
        this.player.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        this.player.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.player.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
        this.player.body.parts[0].vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[0].vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.frameCount = 0;
    };
    onDodgeUpdate = (_dt: number) => this.player.combatChecker(this.player.isDodging);
    onDodgeExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.computerAction = false;
        this.player.dodgeCooldown = 0;
        this.player.isDodging = false;
        this.player.body.parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        this.player.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.player.body.parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT; 
        this.player.body.parts[0].vertices[0].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[0].vertices[1].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[0].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    };

    onRollEnter = () => {
        if (this.player.isStalwart || this.player.isStorming || this.player.isDodging) return;
        this.player.isRolling = true;
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.ROLL);
        if (!this.player.isComputer) this.player.swingReset(States.ROLL, true);
        this.scene.sound.play('roll', { volume: this.scene.hud.settings.volume / 2 });
        this.player.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        this.player.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.player.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
        this.player.frameCount = 0;
    };
    onRollUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.ROLL_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input('action', 'roll');
        };
        this.player.combatChecker(this.player.isRolling);
    };
    onRollExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.rollCooldown = 0; 
        if (this.scene.state.action !== '') {
            this.scene.combatManager.combatMachine.input('action', '');
        };
        this.player.computerAction = false;
        this.player.body.parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        this.player.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.player.body.parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
    };

    onThrustEnter = () => {
        if (this.player.isAttacking || this.player.isParrying || this.player.isPosturing) return;
        if (this.player.isRanged === true && !this.player.isComputer) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct && this.player.inCombat === true) {
                this.player.resistCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Skill Issue: Look at the Enemy!', 1000, 'damage', false, true, () => this.player.resistCombatText = undefined);
                return;
            };
        };
        this.player.isThrusting = true;
        if (!this.player.isComputer) this.player.swingReset(States.THRUST, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.THRUST);
        this.player.frameCount = 0;
    };
    onThrustUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.THRUST_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input('action', 'thrust');
        };
        this.player.combatChecker(this.player.isThrusting);
    };
    onThrustExit = () => {if (this.scene.state.action === 'thrust') this.scene.combatManager.combatMachine.input('action', ''); this.player.computerAction = false;};

    onFlaskEnter = () => {
        this.player.isHealing = true;
        this.player.setStatic(true);
    };
    onFlaskUpdate = (_dt: number) => this.player.combatChecker(this.player.isHealing);
    onFlaskExit = () => {
        this.scene.drinkFlask();
        this.player.setStatic(false);
    };

    onAchireEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Achire', PLAYER.DURATIONS.ACHIRE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ACHIRE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
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
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `Your Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0]?.name}.`
            });
            if (!this.player.isComputer) this.player.setTimeEvent('achireCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000);
            this.player.castingSuccess = false;
            this.scene.sound.play('wild', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.ACHIRE);
            screenShake(this.scene, 90);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onAstraveEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Astrave', PLAYER.DURATIONS.ASTRAVE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ASTRAVE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
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
            this.player.aoe = new AoE(this.scene, 'astrave', 1, false, undefined, true);    
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You unearth the winds and lightning from the land of hush and tendril.`
            });
            if (!this.player.isComputer) this.player.setTimeEvent('astraveCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000);
            this.player.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.ASTRAVE);    
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onArcEnter = () => {
        this.player.isArcing = true;
        this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Arcing', PLAYER.DURATIONS.ARCING / 2, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ARCING);
        this.player.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
        this.player.setStatic(true);
        this.player.castbar.setVisible(true); 
        this.player.flickerCarenic(3000); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You begin arcing with your ${this.scene.state.weapons[0]?.name}.`
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
            screenShake(this.scene, 120, 0.005);
            if (!this.player.isComputer) this.player.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.player.castingSuccess = false;
            this.scene.combatManager.useGrace(PLAYER.STAMINA.ARC);
            if (this.player.touching.length > 0) {
                this.player.touching.forEach((enemy: any) => {
                    // if (enemy.isDefeated === true) return;
                    this.scene.combatManager.melee(enemy.enemyID, 'arc');
                });
            };
        };
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.setStatic(false);
    };

    onBlinkEnter = () => {
        this.scene.sound.play('caerenic', { volume: this.scene.hud.settings.volume });
        if (this.player.velocity.x > 0) {
            // this.player.setVelocityX(PLAYER.SPEED.BLINK);
            this.player.setPosition(Math.min(this.player.x + PLAYER.SPEED.BLINK, this.scene.map.widthInPixels), this.player.y);
        } else if (this.player.velocity.x < 0) {
            // this.player.setVelocityX(-PLAYER.SPEED.BLINK);
            this.player.setPosition(Math.max(this.player.x - PLAYER.SPEED.BLINK, 0), this.player.y);
        };
        if (this.player.velocity.y > 0) {
            // this.player.setVelocityY(PLAYER.SPEED.BLINK);
            this.player.setPosition(this.player.x, Math.min(this.player.y + PLAYER.SPEED.BLINK, this.scene.map.heightInPixels));
        } else if (this.player.velocity.y < 0) {
            // this.player.setVelocityY(-PLAYER.SPEED.BLINK);
            this.player.setPosition(this.player.x, Math.max(this.player.y - PLAYER.SPEED.BLINK, 0));
        };
        if (this.player.moving()) {
            this.scene.combatManager.useGrace(PLAYER.STAMINA.BLINK);
            screenShake(this.scene);
        };
        if (!this.player.isComputer) this.player.setTimeEvent('blinkCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);
        this.player.flickerCarenic(750); 
    };
    onBlinkUpdate = (_dt: number) => this.player.combatChecker(false);

    onConfuseEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.CONFUSE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
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
            if (!this.player.isComputer) this.player.setTimeEvent('confuseCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.player.castingSuccess = false;
            this.scene.sound.play('death', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.CONFUSE);    
            screenShake(this.scene);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You confuse ${this.player.spellName}, and they stumble around in a daze.`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = '';
        this.player.spellName = '';
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onConsumeEnter = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.player.isPraying = true;
        this.scene.sound.play('consume', { volume: this.scene.hud.settings.volume });
        if (!this.player.isComputer) this.player.setTimeEvent('consumeCooldown', PLAYER.COOLDOWNS.SHORT);
    };
    onConsumeUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isPraying);
    };
    onConsumeExit = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.scene.combatManager.combatMachine.action({ type: 'Consume', data: this.scene.state.playerEffects[0].id });        
        this.scene.combatManager.useGrace(PLAYER.STAMINA.CONSUME);
    };

    onDesperationEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'heal', false, true, () => this.player.specialCombatText = undefined);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.DESPERATION);
        this.player.flickerCarenic(PLAYER.DURATIONS.HEALING); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0]?.influences?.[0]} soothes your body.`
        });
    };
    onDesperationUpdate = (_dt: number) => this.player.combatChecker(false);
    onDesperationExit = () => {
        const desperationCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.LONG : PLAYER.COOLDOWNS.SHORT;
        if (!this.player.isComputer) this.player.setTimeEvent('desperationCooldown', desperationCooldown);  
        this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 50, id: this.player.playerID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.hud.settings.volume });
    };

    onDevourEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isCasting = true;
        this.player.currentTarget.isConsumed = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.DEVOUR);
        this.scene.sound.play('absorb', { volume: this.scene.hud.settings.volume });
        this.player.flickerCarenic(2000); 
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Devouring', PLAYER.DURATIONS.DEVOUR / 2, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.DEVOUR);
        this.player.castbar.setTime(PLAYER.DURATIONS.DEVOUR);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.DEVOUR);
        this.player.devourTimer = this.scene.time.addEvent({
            delay: 400,
            callback: () => this.devour(),
            callbackScope: this,
            repeat: 5,
        });
        if (!this.player.isComputer) this.player.setTimeEvent('devourCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.player.isCasting = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.player.setStatic(true);
        this.player.castbar.setVisible(true); 
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Fearing', PLAYER.DURATIONS.FEAR / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.FEAR);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);  
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
            if (!this.player.isComputer) this.player.setTimeEvent('fearCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.MODERATE : PLAYER.COOLDOWNS.MODERATE / 3);  
            this.player.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.FEAR);    
            screenShake(this.scene);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You strike fear into ${this.scene.state.computer?.name}!`
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Fyerus', PLAYER.DURATIONS.FYERUS / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setTime(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setVisible(true);  
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);  
        this.player.aoe = new AoE(this.scene, 'fyerus', 6, false, undefined, true);    
        this.scene.combatManager.useGrace(PLAYER.STAMINA.FYERUS);    
        if (!this.player.isComputer) this.player.setTimeEvent('fyerusCooldown', PLAYER.COOLDOWNS.SHORT);
        this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You unearth the fires and water from the land of hush and tendril.`
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.HEALING);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);  
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
            if (!this.player.isComputer) this.player.setTimeEvent('healingCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.scene.combatManager.useGrace(PLAYER.STAMINA.HEALING);
            this.player.castingSuccess = false;
            this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 25, id: this.player.playerID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.hud.settings.volume });
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onIlirechEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Ilirech', PLAYER.DURATIONS.ILIRECH / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ILIRECH);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.MAIERETH);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
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
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You rip into this world with Ilian tendrils entwining.`
            });
            this.chiomism(this.player.spellTarget, 100);
            if (!this.player.isComputer) this.player.setTimeEvent('ilirechCooldown', PLAYER.COOLDOWNS.MODERATE);
            this.player.castingSuccess = false;
            this.scene.sound.play('fire', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.ILIRECH);    
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onInvokeEnter = () => {
        if (this.player.currentTarget === undefined || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.isPraying = true;
        this.player.setStatic(true);
        this.player.flickerCarenic(1000); 
        this.player.invokeCooldown = 30;
        if (this.player.playerBlessing === '' || this.player.playerBlessing !== this.scene.state.playerBlessing) {
            this.player.playerBlessing = this.scene.state.playerBlessing;
        };
    };
    onInvokeUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onInvokeExit = () => {
        this.player.setStatic(false);
        if (!this.player.currentTarget || this.player.currentTarget.health <= 0) return;
        if (!this.player.isComputer) this.player.setTimeEvent('invokeCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.combatManager.combatMachine.action({ type: 'Instant', data: this.scene.state.playerBlessing });
        this.scene.sound.play('prayer', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.useGrace(PLAYER.STAMINA.INVOKE);
    };

    onKynisosEnter = () => { 
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Kynisos', PLAYER.DURATIONS.KYNISOS / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYNISOS);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);   
    };
    onKynisosUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.KYNISOS) {
            this.player.kynisosSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'cast');
        };
    };
    onKynisosExit = () => {
        if (this.player.kynisosSuccess === true) {
            this.player.aoe = new AoE(this.scene, 'kynisos', 3, false, undefined, true);    
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You unearth the netting of the golden hunt.`
            });
            if (!this.player.isComputer) this.player.setTimeEvent('kynisosCooldown', PLAYER.COOLDOWNS.SHORT);
            this.player.kynisosSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.KYNISOS);    
        };
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onKyrnaicismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isCasting = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.KYRNAICISM);
        this.scene.sound.play('absorb', { volume: this.scene.hud.settings.volume });
        this.player.flickerCarenic(3000); 
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.player.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.player.currentTarget.isConsumed = true;
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.KYRNAICISM);
        this.scene.combatManager.slow(this.player.spellTarget, 1000);
        this.player.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.kyrnaicism(),
            callbackScope: this,
            repeat: 3,
        });
        if (!this.player.isComputer) this.player.setTimeEvent('kyrnaicismCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                this.player.isCasting = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.player.setStatic(true);
        this.player.castbar.setVisible(true);  
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
    levelModifier = () => (this.scene.state.player?.level as number + 9) / 10;
    mastery = () => this.scene.state.player?.[this.scene.state.player?.mastery as keyof typeof this.scene.state.player];
    chiomism = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId() || id === this.player.playerID) {
            this.scene.combatManager.combatMachine.action({ type: 'Chiomic', data: power }); 
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const chiomic = Math.round(this.mastery() / 2 * (1 + power / 100) * this.caerenicDamage() * this.levelModifier());
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your hush flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: id } });
        };
    };
    devour = () => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === this.player.spellTarget);
        if (this.player.isCasting === false || !enemy || enemy.health <= 0) {
            this.player.isCasting = false;
            this.player.devourTimer.remove(false);
            this.player.devourTimer = undefined;
            return;
        };
        if (this.player.spellTarget === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: 'Tshaeral', data: 4 });
        } else {
            const drained = Math.round(this.scene.state.playerHealth * 0.04 * this.caerenicDamage() * this.levelModifier());
            const newPlayerHealth = drained / this.scene.state.playerHealth * 100;
            const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
            const playerActionDescription = `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: newPlayerHealth, id: this.player.playerID } });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newHealth, id: this.player.spellTarget } });
        };
    };
    kyrnaicism = () => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === this.player.spellTarget);
        if (this.player.isCasting === false || !enemy || enemy.health <= 0) {
            this.player.isCasting = false;
            this.player.chiomicTimer.remove(false);
            this.player.chiomicTimer = undefined;
            return;
        };
        this.scene.combatManager.slow(this.player.spellTarget, 975);
        if (this.player.spellTarget === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: 'Chiomic', data: this.player.entropicMultiplier(10) }); 
        } else {
            const chiomic = Math.round(this.mastery() * (1 + (this.player.entropicMultiplier(10) / 100)) * this.caerenicDamage() * this.levelModifier());
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your hush flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.player.spellTarget } });
        };
        this.scene.sound.play('absorb', { volume: this.scene.hud.settings.volume });
    };
    sacrifice = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: 'Sacrifice', data: power });
            this.player.currentTarget?.flickerCarenic(750);
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const sacrifice = Math.round(this.mastery() * this.caerenicDamage() * this.levelModifier());
            let playerSacrifice = this.scene.state.newPlayerHealth - (sacrifice / 2 * (this.player.isStalwart ? 0.85 : 1)) < 0 ? 0 : this.scene.state.newPlayerHealth - (sacrifice / 2 * (this.player.isStalwart ? 0.85 : 1));
            let enemySacrifice = enemy.health - (sacrifice * (1 + power / 50)) < 0 ? 0 : enemy.health - (sacrifice * (1 + power / 50));
            const playerActionDescription = `You sacrifice ${sacrifice / 2 * (this.player.isStalwart ? 0.85 : 1)} health to rip ${sacrifice} from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: 'Set Health', data: { key: 'player', value: playerSacrifice, id } });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: enemySacrifice, id } });
            enemy.flickerCarenic(750);    
        };
    };
    suture = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: 'Suture', data: power });
            this.player.currentTarget?.flickerCarenic(750);
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const suture = Math.round(this.mastery() * this.caerenicDamage() * this.levelModifier()) * (1 * power / 100) * 0.8;
            let playerSuture = this.scene.state.newPlayerHealth + suture > this.scene.state.playerHealth ? this.scene.state.playerHealth : this.scene.state.newPlayerHealth + suture;
            let enemySuture = enemy.health - suture < 0 ? 0 : enemy.health - suture;                    
            const playerActionDescription = `Your suture ${enemy.ascean?.name}'s caeren into you, absorbing and healing for ${suture}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: 'Set Health', data: { key: 'player', value: playerSuture, id} });
            this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: enemySuture, id} });
            enemy.flickerCarenic(750);
        };
    };

    onLeapEnter = () => {
        this.player.leap();
    };
    onLeapUpdate = (_dt: number) => this.player.combatChecker(this.player.isLeaping);
    onLeapExit = () => {
        const leapCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        if (!this.player.isComputer) this.player.setTimeEvent('leapCooldown', leapCooldown);
    };

    onMaierethEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Maiereth', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.MAIERETH);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.MAIERETH);                          
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
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
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You bleed and strike ${this.scene.state.computer?.name} with tendrils of Ma'anre.`
            });
            if (!this.player.isComputer) this.player.setTimeEvent('maierethCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.player.castingSuccess = false;
            this.scene.sound.play('spooky', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.MAIERETH);    
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Hook', DURATION.TEXT, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play('dungeon', { volume: this.scene.hud.settings.volume });
        this.player.flickerCarenic(750);
        if (!this.player.isComputer) this.player.setTimeEvent('hookCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
        this.scene.combatManager.useGrace(PLAYER.STAMINA.HOOK);
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
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Marking', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(1000);
    };
    onMarkUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onMarkExit = () => {
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {  
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
        this.player.mark.setPosition(this.player.x, this.player.y + 24);
        this.player.mark.setVisible(true);
        this.player.animateMark();
        this.player.animateMark();
        this.scene.sound.play('phenomena', { volume: this.scene.hud.settings.volume });
        if (!this.player.isComputer) this.player.setTimeEvent('markCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.combatManager.useGrace(PLAYER.STAMINA.MARK);
        this.player.setStatic(false);
    };

    onNetherswapEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.player.isNetherswapping = true;
        this.player.netherswapTarget = this.player.currentTarget;
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.flickerCarenic(1000);
    };
    onNetherswapUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onNetherswapExit = () => {
        if (this.player.isNetherswapping === false) return;
        this.player.isNetherswapping = false;
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {  
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
        this.player.setStatic(false);
        if (this.player.netherswapTarget === undefined) return; 
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Netherswap', DURATION.TEXT / 2, 'effect', false, true, () => this.player.specialCombatText = undefined);
        const player = new Phaser.Math.Vector2(this.player.x, this.player.y);
        const enemy = new Phaser.Math.Vector2(this.player.netherswapTarget.x, this.player.netherswapTarget.y);
        this.player.setPosition(enemy.x, enemy.y);
        this.player.netherswapTarget.setPosition(player.x, player.y);
        this.player.netherswapTarget = undefined;
        this.scene.sound.play('caerenic', { volume: this.scene.hud.settings.volume });
        if (!this.player.isComputer) this.player.setTimeEvent('netherswapCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.combatManager.useGrace(PLAYER.STAMINA.NETHERSWAP);
    };

    onRecallEnter = () => {
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Recalling', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(1000);
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        if (!this.player.isComputer) this.player.setTimeEvent('recallCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.combatManager.useGrace(PLAYER.STAMINA.RECALL);
    };
    onRecallUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onRecallExit = () => {
        if (this.scene.hud.settings.desktop === false) {  
            this.scene.hud.joystick.joystick.setVisible(true);
            this.scene.hud.rightJoystick.joystick.setVisible(true);
            this.scene.hud.actionBar.setVisible(true);
        };
        this.player.setPosition(this.player.mark.x, this.player.mark.y - 24);
        this.scene.sound.play('phenomena', { volume: this.scene.hud.settings.volume });
        this.player.animateMark();
        this.player.setStatic(false);
    };

    onParalyzeEnter = () => { 
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Paralyzing', PLAYER.DURATIONS.PARALYZE / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.PARALYZE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true); 
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
            if (!this.player.isComputer) this.player.setTimeEvent('paralyzeCooldown', PLAYER.COOLDOWNS.MODERATE);  
            this.scene.combatManager.useGrace(PLAYER.STAMINA.PARALYZE);
            this.player.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });        
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You paralyze ${this.scene.state.computer?.name} for several seconds!`
            });
            screenShake(this.scene);
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.POLYMORPH);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);  
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
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.player.spellName}, polymorphing them!`
            });
            if (!this.player.isComputer) this.player.setTimeEvent('polymorphCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.scene.combatManager.useGrace(PLAYER.STAMINA.POLYMORPH);
            this.player.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });        
            screenShake(this.scene);
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
        this.scene.sound.play('wild', { volume: this.scene.hud.settings.volume });
        if (this.player.currentTarget) {
            if (this.player.currentTarget.flipX) {
                this.player.setPosition(this.player.currentTarget.x + 16, this.player.currentTarget.y);
            } else {
                this.player.setPosition(this.player.currentTarget.x - 16, this.player.currentTarget.y);
            };
        };

        this.scene.combatManager.useGrace(PLAYER.STAMINA.PURSUIT);
        const pursuitCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        if (!this.player.isComputer) this.player.setTimeEvent('pursuitCooldown', pursuitCooldown);
        this.player.flickerCarenic(750); 
    };
    onPursuitUpdate = (_dt: number) => this.player.combatChecker(this.player.isPursuing);
    onPursuitExit = () => {
        if (!this.player.inCombat && !this.player.isStealthing && !this.player.isShimmering) {
            const button = this.scene.smallHud.stances.find(b => b.texture.key === 'stealth');
            if (button) this.scene.smallHud.pressStance(button);
        };
    };

    onQuorEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Quor', PLAYER.DURATIONS.QUOR / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.QUOR);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
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
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `Your Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0]?.name}.`
            });
            if (!this.player.isComputer) this.player.setTimeEvent('quorCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000);
            this.player.castingSuccess = false;
            this.scene.sound.play('freeze', { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.QUOR);    
            screenShake(this.scene, 180, 0.006);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onReconstituteEnter = () => {
        if (this.player.moving() === true) return;
        this.player.isCasting = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.RECONSTITUTE);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Reconstitute', PLAYER.DURATIONS.RECONSTITUTE / 2, 'heal', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.RECONSTITUTE);
        this.player.castbar.setTime(PLAYER.DURATIONS.RECONSTITUTE);
        this.player.beam.startEmitter(this, PLAYER.DURATIONS.RECONSTITUTE);
        this.player.reconTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.reconstitute(),
            callbackScope: this,
            repeat: 5,
        });
        if (!this.player.isComputer) this.player.setTimeEvent('reconstituteCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.LONG : PLAYER.COOLDOWNS.SHORT);
        this.scene.time.addEvent({
            delay: 5000,
            callback: () => this.player.isCasting = false,
            callbackScope: this,
            loop: false,
        });
        this.player.castbar.setVisible(true);  
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
            this.player.reconTimer.remove(false);
            this.player.reconTimer = undefined;
            return;
        };
        this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 15, id: this.player.playerID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.hud.settings.volume });
    };

    onRootingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.isCasting = true;
        this.player.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Rooting', PLAYER.DURATIONS.ROOTING / 2, 'cast', false, true, () => this.player.specialCombatText = undefined);
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);
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
            if (!this.player.isComputer) this.player.setTimeEvent('rootCooldown', PLAYER.COOLDOWNS.SHORT); 
            this.scene.combatManager.useGrace(PLAYER.STAMINA.ROOT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.player.spellName}, rooting them!`
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
        const rushCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        if (!this.player.isComputer) this.player.setTimeEvent('rushCooldown', rushCooldown);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.RUSH);
    };

    onSlowEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSlowing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Slow', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.slow(this.player.spellTarget, 3000);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SLOW);
        if (!this.player.isComputer) this.player.setTimeEvent('slowCooldown', PLAYER.COOLDOWNS.SHORT); 
        this.player.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => this.player.isSlowing = false, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this.player.currentTarget.ascean?.name}, slowing them!`
        });
        screenShake(this.scene);
    };
    onSlowUpdate = (_dt: number) => this.player.combatChecker(this.player.isSlowing);
    onSlowExit = () => this.player.spellTarget = '';

    onSacrificeEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSacrificing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Sacrifice', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SACRIFICE);
        this.sacrifice(this.player.spellTarget, 10);
        if (!this.player.isComputer) this.player.setTimeEvent('sacrificeCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.player.flickerCarenic(500);  
        this.scene.time.delayedCall(500, () => this.player.isSacrificing = false, undefined, this);
    };
    onSacrificeUpdate = (_dt: number) => this.player.combatChecker(this.player.isSacrificing);
    onSacrificeExit = () => this.player.spellTarget = '';

    onSnaringEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Snaring', PLAYER.DURATIONS.SNARE, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.SNARE);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.SNARE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true); 
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
            if (!this.player.isComputer) this.player.setTimeEvent('snareCooldown', PLAYER.COOLDOWNS.SHORT);
            this.scene.combatManager.useGrace(PLAYER.STAMINA.SNARE);
            this.scene.combatManager.snare(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
            screenShake(this.scene);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.player.spellName}, snaring them!`
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
    onStormExit = () => {if (!this.player.isComputer) this.player.setTimeEvent('stormCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3)};

    onSutureEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSuturing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Suture', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SUTURE);
        this.suture(this.player.spellTarget, 10);
        if (!this.player.isComputer) this.player.setTimeEvent('sutureCooldown', PLAYER.COOLDOWNS.MODERATE);
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
        this.player.isAbsorbing = true;
        this.player.negationName = States.ABSORB;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.ABSORB);    
        this.scene.sound.play(States.ABSORB, { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Absorbing', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'aqua', PLAYER.DURATIONS.ABSORB);
        if (!this.player.isComputer) this.player.setTimeEvent('absorbCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ABSORB, () => {
            this.player.isAbsorbing = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.destroy();
                this.player.negationBubble = undefined;
                if (this.player.negationName === States.ABSORB) this.player.negationName = '';
            };    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You warp oncoming damage into grace.`
        });
    };
    onAbsorbUpdate = (_dt: number) => {if (!this.player.isAbsorbing) this.positiveMachine.setState(States.CLEAN);};

    absorb = () => {
        this.scene.sound.play('absorb', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Abosrbed', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.scene.combatManager.useGrace(-25);
    };

    onChiomicEnter = () => {
        this.scene.combatManager.useGrace(PLAYER.STAMINA.CHIOMIC);    
        this.player.aoe = new AoE(this.scene, 'chiomic', 1);    
        this.scene.sound.play('death', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isChiomic = true;
        if (!this.player.isComputer) this.player.setTimeEvent('chiomicCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.player.isChiomic = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You mock and confuse your surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt: number) => {if (this.player.isChiomic === false) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.player.isDiseasing = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.DISEASE);    
        this.player.aoe = new AoE(this.scene, 'tendril', 6);    
        this.scene.sound.play('dungeon', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Tendrils Swirl', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        if (!this.player.isComputer) this.player.setTimeEvent('diseaseCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.player.isDiseasing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You swirl such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt: number) => {if (this.player.isDiseasing === false) this.positiveMachine.setState(States.CLEAN);};
    onDiseaseExit = () => this.player.aoe.cleanAnimation(this.scene);

    onHowlEnter = () => {
        this.scene.combatManager.useGrace(PLAYER.STAMINA.HOWL);    
        this.player.aoe = new AoE(this.scene, 'howl', 1);    
        this.scene.sound.play('howl', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Howling', PLAYER.DURATIONS.HOWL, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.isHowling = true;
        if (!this.player.isComputer) this.player.setTimeEvent('howlCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.player.isHowling = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You howl, it's otherworldly nature stunning nearby foes.`
        });
    };
    onHowlUpdate = (_dt: number) => {if (this.player.isHowling === false) this.positiveMachine.setState(States.CLEAN);};
    onHowlExit = () => this.player.aoe.cleanAnimation(this.scene);

    onEnvelopEnter = () => {
        this.player.isEnveloping = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.ENVELOP);    
        this.scene.sound.play('caerenic', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Enveloping', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'blue', PLAYER.DURATIONS.ENVELOP);
        this.player.reactiveName = States.ENVELOP;
        if (!this.player.isComputer) this.player.setTimeEvent('envelopCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.player.isEnveloping = false;    
            if (this.player.reactiveBubble !== undefined && this.player.reactiveName === States.ENVELOP) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You envelop yourself, shirking oncoming attacks.`
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
        this.scene.sound.play('caerenic', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Enveloped', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        if (this.player.grace - 40 <= 0) {
            this.player.isEnveloping = false;
        };
        this.scene.combatManager.useGrace(40);
    };

    onFreezeEnter = () => {
        this.player.aoe = new AoE(this.scene, 'freeze', 1);
        this.scene.sound.play('freeze', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.useGrace(PLAYER.STAMINA.FREEZE);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Freezing', PLAYER.DURATIONS.FREEZE, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.player.isFreezing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You freeze nearby foes.`
        });
    };
    onFreezeUpdate = (_dt: number) => {if (!this.player.isFreezing) this.positiveMachine.setState(States.CLEAN);};
    onFreezeExit = () => {if (!this.player.isComputer) this.player.setTimeEvent('freezeCooldown', PLAYER.COOLDOWNS.SHORT)};

    onMaliceEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MALICE;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.MALICE);    
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.player.isMalicing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Malice', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'purple', PLAYER.DURATIONS.MALICE);
        if (!this.player.isComputer) this.player.setTimeEvent('maliceCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.player.isMalicing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MALICE) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You wrack malicious foes with the hush of their own attack.`
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
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Malice', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
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
        this.scene.combatManager.useGrace(PLAYER.STAMINA.MEND);    
        this.scene.sound.play('caerenic', { volume: this.scene.hud.settings.volume });
        this.player.isMending = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mending', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'purple', PLAYER.DURATIONS.MEND);
        if (!this.player.isComputer) this.player.setTimeEvent('mendCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.player.isMending = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MEND) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to mend oncoming attacks.`
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
        this.scene.sound.play('caerenic', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mending', 500, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.scene.combatManager.combatMachine.action({ data: { key: 'player', value: 15, id: this.player.playerID }, type: 'Health' });
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
        this.scene.combatManager.useGrace(PLAYER.STAMINA.MENACE);    
        this.scene.sound.play('scream', { volume: this.scene.hud.settings.volume });
        this.player.isMenacing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Menacing', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'dread', PLAYER.DURATIONS.MENACE);
        if (!this.player.isComputer) this.player.setTimeEvent('menaceCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MENACE, () => {
            this.player.isMenacing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MENACE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to menace oncoming attacks.`
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
        this.scene.sound.play('caerenic', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mending', 500, 'tendril', false, true, () => this.player.specialCombatText = undefined);
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
        this.scene.combatManager.useGrace(PLAYER.STAMINA.MODERATE);    
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.player.isModerating = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Moderating', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'sapphire', PLAYER.DURATIONS.MODERATE);
        if (!this.player.isComputer) this.player.setTimeEvent('moderateCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MODERATE, () => {
            this.player.isModerating = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MODERATE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to moderate oncoming attacks.`
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
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mending', 500, 'tendril', false, true, () => this.player.specialCombatText = undefined);
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
        this.scene.combatManager.useGrace(PLAYER.STAMINA.MULTIFARIOUS);    
        this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
        this.player.isMultifaring = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Moderating', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'ultramarine', PLAYER.DURATIONS.MULTIFARIOUS);
        if (!this.player.isComputer) this.player.setTimeEvent('multifariousCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MULTIFARIOUS, () => {
            this.player.isMultifaring = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MULTIFARIOUS) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to multifare oncoming attacks.`
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
        this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Multifarious', 500, 'cast', false, true, () => this.player.specialCombatText = undefined);
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
        this.scene.combatManager.useGrace(PLAYER.STAMINA.MYSTIFY);    
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.player.isMystifying = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mystifying', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'chartreuse', PLAYER.DURATIONS.MYSTIFY);
        if (!this.player.isComputer) this.player.setTimeEvent('mystifyCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MYSTIFY, () => {
            this.player.isMystifying = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MYSTIFY) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to mystify enemies when struck.`
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
        this.scene.sound.play('death', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mystifying', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
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
        this.scene.combatManager.useGrace(PLAYER.STAMINA.PROTECT);    
        this.scene.sound.play('shield', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Protecting', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'gold', PLAYER.DURATIONS.PROTECT);
        if (!this.player.isComputer) this.player.setTimeEvent('protectCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.player.isProtecting = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You protect yourself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt: number) => {if (!this.player.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRecoverEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.isRecovering = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.RECOVER);    
        this.scene.sound.play('absorb', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Recovering', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'green', PLAYER.DURATIONS.RECOVER);
        if (!this.player.isComputer) this.player.setTimeEvent('recoverCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RECOVER, () => {
            this.player.isRecovering = false;    
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You warp oncoming damage into stamina.`
        });
    };
    onRecoverUpdate = (_dt: number) => {if (!this.player.isRecovering) this.positiveMachine.setState(States.CLEAN);};

    recover = () => {
        this.scene.sound.play('absorb', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Recovered', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.scene.combatManager.useStamina(-25);
    };

    onReinEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.isReining = true;
        this.player.reactiveName = States.REIN;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.REIN);    
        this.scene.sound.play(States.ABSORB, { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Rein', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, 'fuchsia', PLAYER.DURATIONS.REIN);
        if (!this.player.isComputer) this.player.setTimeEvent('reinCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.REIN, () => {
            this.player.isReining = false;    
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                if (this.player.reactiveName === States.REIN) this.player.reactiveName = '';
            };    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your hush warps oncoming damage into grace.`
        });
    };
    onReinUpdate = (_dt: number) => {if (!this.player.isReining) this.positiveMachine.setState(States.CLEAN);};

    rein = () => {
        this.scene.sound.play('absorb', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Reining', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.scene.combatManager.useGrace(-25);
    };

    onRenewalEnter = () => {
        this.player.isRenewing = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.RENEWAL);    
        this.player.aoe = new AoE(this.scene, 'renewal', 6, true);    
        this.scene.sound.play('shield', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Hush Tears', 750, 'bone', false, true, () => this.player.specialCombatText = undefined);
        if (!this.player.isComputer) this.player.setTimeEvent('renewalCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.player.isRenewing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt: number) => {if (!this.player.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SCREAM);    
        this.player.aoe = new AoE(this.scene, 'scream', 1);    
        this.scene.sound.play('scream', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Screaming', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.player.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.player.isScreaming = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You scream, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt: number) => {if (!this.player.isScreaming) this.positiveMachine.setState(States.CLEAN);};
    onScreamExit = () => {if (!this.player.isComputer) this.player.setTimeEvent('screamCooldown', PLAYER.COOLDOWNS.SHORT)};

    onShieldEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SHIELD);    
        this.scene.sound.play('shield', { volume: this.scene.hud.settings.volume });
        this.player.isShielding = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shielding', 750, 'bone', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.player.negationName = States.SHIELD;
        if (!this.player.isComputer) this.player.setTimeEvent('shieldCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.player.isShielding = false;    
            if (this.player.negationBubble && this.player.negationName === States.SHIELD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shield yourself from oncoming attacks.`
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
        this.scene.sound.play('shield', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shield Hit', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        if (this.player.negationBubble.charges <= 0) {
            this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shield Broken', 500, 'damage', false, true, () => this.player.specialCombatText = undefined);
            this.player.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.player.isShimmering = true; 
        this.scene.sound.play('stealth', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SHIMMER);
        if (!this.player.isComputer) this.player.setTimeEvent('shimmerCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.player.adjustSpeed(PLAYER.SPEED.STEALTH);
        if (!this.player.isStealthing) this.stealthEffect(true);    
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.player.isShimmering = false;
            this.stealthEffect(false);
            this.player.adjustSpeed(-PLAYER.SPEED.STEALTH);
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shimmer, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt: number) => {if (!this.player.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmer = () => {
        const shimmers = ['It fades through you', "You simply weren't there", "Perhaps you never were", "They don't seem certain of you at all"];
        const shim = shimmers[Math.floor(Math.random() * shimmers.length)];
        this.scene.sound.play('stealth', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, shim, 1500, 'effect', false, true, () => this.player.specialCombatText = undefined);
    };

    onSprintEnter = () => {
        this.player.isSprinting = true;
        this.scene.sound.play('blink', { volume: this.scene.hud.settings.volume / 3 });
        this.player.adjustSpeed(PLAYER.SPEED.SPRINT);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SPRINT);
        if (!this.player.isComputer) this.player.setTimeEvent('sprintCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.player.flickerCarenic(PLAYER.DURATIONS.SPRINT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.player.isSprinting = false;
            this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You tap into your caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt: number) => {if (!this.player.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onStealthEnter = () => {
        if (!this.player.isShimmering) this.player.isStealthing = true; 
        this.stealthEffect(true);    
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You step halfway into the land of hush and tendril.`
        });
    };
    onStealthUpdate = (_dt: number) => {if (!this.player.isStealthing || this.player.currentRound > 1 || this.scene.combat) this.positiveMachine.setState(States.CLEAN);};
    onStealthExit = () => { 
        this.player.isStealthing = false;
        this.stealthEffect(false);
    };

    stealthEffect = (stealth: boolean) => {
        this.scene.stealthEngaged(stealth);
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
        this.scene.sound.play('stealth', { volume: this.scene.hud.settings.volume });
    };

    onWardEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isWarding = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.WARD);    
        this.scene.sound.play('combat-round', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Warding', 750, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, 'red', PLAYER.DURATIONS.WARD);
        this.player.negationName = States.WARD;
        if (!this.player.isComputer) this.player.setTimeEvent('wardCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.player.isWarding = false;    
            if (this.player.negationBubble && this.player.negationName === States.WARD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ward yourself from oncoming attacks.`
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
        this.scene.sound.play('parry', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.stunned(id);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Warded', 500, 'effect', false, true, () => this.player.specialCombatText = undefined);
        if (this.player.negationBubble.charges <= 0) {
            this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Ward Broken', 500, 'damage', false, true, () => this.player.specialCombatText = undefined);
            this.player.negationBubble.setCharges(0);
            this.player.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.scene.combatManager.useGrace(PLAYER.STAMINA.WRITHE);    
        this.player.aoe = new AoE(this.scene, 'writhe', 1);    
        this.scene.sound.play('spooky', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Writhing', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.player.isWrithing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onWritheUpdate = (_dt: number) => {if (!this.player.isWrithing) this.positiveMachine.setState(States.CLEAN);};
    onWritheExit = () => {
        this.player.aoe.cleanAnimation(this.scene);
        if (!this.player.isComputer) this.player.setTimeEvent('writheCooldown', PLAYER.COOLDOWNS.SHORT);  
    };

    // ==================== TRAITS ==================== \\
    onAstricationEnter = () => {
        if (this.player.isAstrifying === true) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.ASTRICATION);    
        if (!this.player.isComputer) this.player.setTimeEvent('astricationCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.combatManager.combatMachine.input('astrication', {active:true,charges:0});
        this.scene.sound.play('lightning', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Astrication', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isAstrifying = true;
        this.player.flickerCarenic(PLAYER.DURATIONS.ASTRICATION); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.ASTRICATION, () => {
            this.scene.combatManager.combatMachine.input('astrication', {active:false,charges:0});
            this.player.isAstrifying = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren astrifies, wrapping round your attacks.`
        });
    };
    onAstricationUpdate = (_dt: number) => {if (!this.player.isAstrifying) this.positiveMachine.setState(States.CLEAN);};

    onBerserkEnter = () => {
        if (this.player.isBerserking === true) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.BERSERK);    
        if (!this.player.isComputer) this.player.setTimeEvent('berserkCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.sound.play('howl', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.combatMachine.input('berserk', {active:true,charges:1});
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Berserking', 750, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.isBerserking = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BERSERK, () => {
            this.scene.combatManager.combatMachine.input('berserk', {active:false,charges:0});
            this.player.isBerserking = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren feeds off the pain, its hush shrieking forth.`
        });
    };
    onBerserkUpdate = (_dt: number) => {if (!this.player.isBerserking) this.positiveMachine.setState(States.CLEAN);};

    onBlindEnter = () => {
        this.scene.combatManager.useGrace(PLAYER.STAMINA.BLIND);    
        this.player.aoe = new AoE(this.scene, 'blind', 1);
        this.scene.sound.play('righteous', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Brilliance', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.player.isBlinding = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shines with brilliance, blinding those around you.`
        });
    };
    onBlindUpdate = (_dt: number) => {if (!this.player.isBlinding) this.positiveMachine.setState(States.CLEAN);};
    onBlindExit = () => {if (!this.player.isComputer) this.player.setTimeEvent('blindCooldown', PLAYER.COOLDOWNS.SHORT)};

    onCaerenesisEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.CAERENESIS);    
        this.player.aoe = new AoE(this.scene, 'caerenesis', 1, false, undefined, false, this.player.currentTarget);    
        this.scene.sound.play('blink', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Caerenesis', 750, 'cast', false, true, () => this.player.specialCombatText = undefined);
        this.player.isCaerenesis = true;
        if (!this.player.isComputer) this.player.setTimeEvent('caerenesisCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CAERENESIS, () => {
            this.player.isCaerenesis = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onCaerenesisUpdate = (_dt: number) => {if (!this.player.isCaerenesis) this.positiveMachine.setState(States.CLEAN);};

    onConvictionEnter = () => {
        if (this.player.isConvicted === true) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.CONVICTION);    
        if (!this.player.isComputer) this.player.setTimeEvent('convictionCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.combatManager.combatMachine.input('conviction', {active:true,charges:0});
        this.scene.sound.play('spooky', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Conviction', 750, 'tendril', false, true, () => this.player.specialCombatText = undefined);
        this.player.isConvicted = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CONVICTION, () => {
            this.scene.combatManager.combatMachine.input('conviction', {active:false,charges:0});
            this.player.isConvicted = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren steels itself in admiration of your physical form.`
        });
    };
    onConvictionUpdate = (_dt: number) => {if (!this.player.isConvicted) this.positiveMachine.setState(States.CLEAN)};

    onEnduranceEnter = () => {
        if (this.player.isEnduring === true) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.ENDURANCE);    
        this.scene.sound.play('shield', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Endurance', 750, 'heal', false, true, () => this.player.specialCombatText = undefined);
        this.player.isEnduring = true;
        this.player.flickerCarenic(PLAYER.DURATIONS.ENDURANCE); 
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.scene.combatManager.useStamina(-20),
            repeat: 5,
            callbackScope: this
        });
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENDURANCE, () => {
            this.player.isEnduring = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren's hush pours into other faculties, invigorating you.`
        });
    };
    onEnduranceUpdate = (_dt: number) => {if (!this.player.isEnduring) this.positiveMachine.setState(States.CLEAN);};
    onEnduranceExit = () => {if (!this.player.isComputer) this.player.setTimeEvent('enduranceCooldown', PLAYER.COOLDOWNS.LONG)};  

    onImpermanenceEnter = () => {
        if (this.player.isImpermanent === true) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.IMPERMANENCE);    
        this.scene.sound.play('spooky', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Impermanence', 750, 'hush', false, true, () => this.player.specialCombatText = undefined);
        this.player.isImpermanent = true;
        this.player.flickerCarenic(1500); 
        if (!this.player.isComputer) this.player.setTimeEvent('impermanenceCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.IMPERMANENCE, () => {
            this.player.isImpermanent = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and fades, its hush concealing.`
        });
    };
    onImpermanenceUpdate = (_dt: number) => {if (!this.player.isImpermanent) this.positiveMachine.setState(States.CLEAN);};

    onSeerEnter = () => {
        if (this.player.isSeering === true) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SEER);    
        this.scene.sound.play('fire', { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.combatMachine.input('isSeering', true);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Seer', 750, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.isSeering = true;
        if (!this.player.isComputer) this.player.setTimeEvent('seerCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.player.flickerCarenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.SEER, () => {
            this.player.isSeering = false;
            if (this.scene.state.isSeering === true) {
                this.scene.combatManager.combatMachine.input('isSeering', false);
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren calms your body to focus, its hush bleeding into you.`
        });
    };
    onSeerUpdate = (_dt: number) => {if (!this.player.isSeering) this.positiveMachine.setState(States.CLEAN);};

    onDispelEnter = () => {
        if (this.player.currentTarget === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.KYRNAICISM);
        if (!this.player.isComputer) this.player.setTimeEvent('dispelCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play('debuff', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Dispelling', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(1000); 
        this.player.currentTarget.clearBubbles();
    };
    onDispelExit = () => {};

    onShirkEnter = () => {
        this.player.isShirking = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.STIMULATE);    
        if (!this.player.isComputer) this.player.setTimeEvent('shirkCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play('blink', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shirking', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isConfused = false;
        this.player.isFeared = false;
        this.player.isParalyzed = false;
        this.player.isPolymorphed = false;
        this.player.isStunned = false;
        this.player.isSlowed = false;
        this.player.isSnared = false;
        this.player.isFrozen = false;
        this.player.isRooted = false;

        this.stateMachine.setState(States.COMBAT);
        this.negativeMachine.setState(States.CLEAN);

        this.player.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isShirking = false;
        }, undefined, this); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren's hush grants reprieve, freeing you.`
        });
    };
    onShirkExit = () => {};


    onShadowEnter = () => {
        this.player.isShadowing = true;
        if (!this.player.isComputer) this.player.setTimeEvent('shadowCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SHADOW);
        this.scene.sound.play('wild', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shadowing', DURATION.TEXT, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isShadowing = false;
        }, undefined, this);
    };
    onShadowExit = () => {};

    pursue = (id: string) => {
        const enemy = this.scene.enemies.find(e => e.enemyID === id);
        if (!enemy) return;
        this.scene.sound.play('wild', { volume: this.scene.hud.settings.volume });
        if (enemy.flipX) {
            this.player.setPosition(enemy.x + 16, enemy.y);
        } else {
            this.player.setPosition(enemy.x - 16, enemy.y);
        };
    };
    
    onTetherEnter = () => {
        this.player.isTethering = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.TETHER);
        if (!this.player.isComputer) this.player.setTimeEvent('tetherCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play('dungeon', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Tethering', DURATION.TEXT, 'damage', false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCarenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isTethering = false;
        }, undefined, this);
    };
    onTetherExit = () => {};

    tether = (id: string) => {
        const enemy = this.scene.enemies.find(e => e.enemyID === id);
        if (!enemy) return;
        this.scene.sound.play('dungeon', { volume: this.scene.hud.settings.volume });
        this.player.hook(enemy, 1000);
    };

    onStimulateEnter = () => {
        this.scene.combatManager.useGrace(PLAYER.STAMINA.STIMULATE);    
        this.scene.sound.play('spooky', { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Stimulate', 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.isStimulating = true;
        this.player.flickerCarenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.STIMULATE, () => {
            this.player.isStimulating = false;
        }, undefined, this);
        if (!this.player.isComputer) this.player.setTimeEvent('stimulateCooldown', PLAYER.COOLDOWNS.LONG);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren's hush grants reprieve, refreshing you.`
        });
        for (let i = 0; i < this.scene.hud.actionBar.specialButtons.length; i++) {
            const name = this.scene.hud.settings.specials[i].toLowerCase();
            if (name === "stimulate") continue;
            this.scene.hud.logger.log(`Resetting the cooldown on ${name}`);
            if (!this.player.isComputer) this.player.setTimeEvent(`${name}Cooldown`, 20);
        };
    };
    onStimulateUpdate = (_dt: number) => {if (!this.player.isStimulating) this.positiveMachine.setState(States.CLEAN);};

    // ================= NEGATIVE MACHINE STATES ================= \\
    onConfusedEnter = () => { 
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, '?c .on-f-u`SeD~', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
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
                    this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, confusions[Math.floor(Math.random() * 5)], 750, 'effect', false, true, () => this.player.specialCombatText = undefined);
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
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {  
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
        this.player.spriteWeapon.setVisible(true);
        if (this.player.confuseTimer) {
            this.player.confuseTimer.destroy();
            this.player.confuseTimer = undefined;
        };
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onFearedEnter = () => { 
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage', false, false, () => this.player.specialCombatText = undefined);
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
                    this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, fears[Math.floor(Math.random() * 5)], 750, 'damage', false, false, () => this.player.specialCombatText = undefined);
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
        if (!this.player.isComputer) {        
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Frozen', DURATION.TEXT, 'cast', false, true, () => this.player.specialCombatText = undefined);
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
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.isPolymorphed = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Polymorphed', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
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
                    this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, '...thump', 1000, 'effect', false, false, () => this.player.specialCombatText = undefined);
                    this.scene.combatManager.combatMachine.action({ type: 'Health', data: { key: 'player', value: 20, id: this.player.playerID } });
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
        if (!this.player.isComputer) {        
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Slowed', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Snared', DURATION.TEXT, 'effect', false, true, () => this.player.specialCombatText = undefined);
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
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.isStunned = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Stunned', PLAYER.DURATIONS.STUNNED, 'effect', false, true, () => this.player.specialCombatText = undefined);
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.setTint(0xFF0000);
        this.player.setStatic(true);
        this.player.anims.pause();
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You've been stunned.`
        });
        screenShake(this.scene);
    };
    onStunnedUpdate = (dt: number) => {
        this.player.setVelocity(0);
        this.player.stunDuration -= dt;
        if (this.player.stunDuration <= 0) this.player.isStunned = false;
        this.player.combatChecker(this.player.isStunned);
    };
    onStunnedExit = () => {
        if (!this.player.isComputer) {        
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
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