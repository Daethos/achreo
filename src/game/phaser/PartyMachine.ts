import Party from "../entities/PartyComputer";
import StateMachine, { specialStateMachines, States } from "./StateMachine";
import { BLUE_COLOR_MATRIX, FRAMES, GOLD_COLOR_MATRIX, GRAY_COLOR_MATRIX, MOVEMENT, TEAL_COLOR_MATRIX } from "../entities/Entity";
import { EventBus } from "../EventBus";
import Bubble from "./Bubble";
import { BlendModes } from "phaser";
import { HELP } from "../../utility/enemy";
import { Play } from "../main";
import { BALANCED, DEFENSIVE, OFFENSIVE, PARTY_BALANCED_INSTINCTS, PARTY_DEFENSIVE_INSTINCTS, PARTY_INSTINCTS, PARTY_OFFENSIVE_INSTINCTS, PARTY_OFFSET } from "../../utility/party";
import { PLAYER } from "../../utility/player";
import { BONE, CAST, DAMAGE, EFFECT, HEAL, HUSH, TENDRIL } from "./ScrollingCombatText";
import { CHIOMISM, SACRIFICE, SUTURE } from "../../utility/combatTypes";
const DURATION = {
    CONSUMED: 2000,
    CONFUSED: 6000,
    PARALYZED: 4000,
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
const PARTY_COMBAT_TEXT = "party-combat-text";
export default class PlayerMachine {
    scene: Play;
    player: Party;
    stateMachine: StateMachine;
    positiveMachine: StateMachine;
    negativeMachine: StateMachine;

    constructor(scene: Play, player: Party) {
        this.scene = scene;
        this.player = player;
        this.stateMachine = new StateMachine(this, "party");
        this.stateMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.IDLE, { onEnter: this.onIdleEnter, onUpdate: this.onIdleUpdate, onExit: this.onIdleExit })
            .addState(States.MOVING, { onEnter: this.onMovingEnter, onUpdate: this.onMovingUpdate, onExit: this.onMovingExit })
            .addState(States.COMPUTER_COMBAT, { onEnter: this.onComputerCombatEnter, onUpdate: this.onComputerCombatUpdate }) // , onUpdate: this.onComputerCombatUpdate
            .addState(States.LULL, { onEnter: this.onLullEnter }) // onUpdate: this.onLullUpdate
            .addState(States.HURT, { onEnter: this.onHurtEnter, onUpdate: this.onHurtUpdate, onExit: this.onHurtExit })
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.FOLLOW, { onEnter: this.onFollowEnter, onUpdate: this.onFollowUpdate, onExit: this.onFollowExit })
            .addState(States.LEASH, { onEnter: this.onLeashEnter, onUpdate: this.onLeashUpdate, onExit: this.onLeashExit })
            .addState(States.DEFEATED, { onEnter: this.onDefeatedEnter, onUpdate: this.onDefeatedUpdate, onExit: this.onDefeatedExit })
            .addState(States.EVADE, { onEnter: this.onEvasionEnter, onUpdate: this.onEvasionUpdate, onExit: this.onEvasionExit })
            .addState(States.CONTEMPLATE, { onEnter: this.onContemplateEnter, onUpdate: this.onContemplateUpdate, onExit: this.onContemplateExit })
            .addState(States.HELP, { onEnter: this.onHelpEnter, onUpdate: this.onHelpUpdate, onExit: this.onHelpExit })
            .addState(States.SUMMON, { onEnter: this.onSummonEnter, onUpdate: this.onSummonUpdate, onExit: this.onSummonExit })
            .addState(States.KNOCKBACK, { onEnter: this.onPushbackEnter, onUpdate: this.onPushbackUpdate, onExit: this.onPushbackExit })
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
            .addState(States.CHIOMISM, { onEnter: this.onChiomismEnter, onUpdate: this.onChiomismUpdate, onExit: this.onChiomismExit })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onUpdate: this.onDesperationUpdate, onExit: this.onDesperationExit })
            .addState(States.FEAR, { onEnter: this.onFearingEnter, onUpdate: this.onFearingUpdate, onExit: this.onFearingExit })
            .addState(States.FROST, { onEnter: this.onFrostEnter, onUpdate: this.onFrostUpdate, onExit: this.onFrostExit })
            .addState(States.FYERUS, { onEnter: this.onFyerusEnter, onUpdate: this.onFyerusUpdate, onExit: this.onFyerusExit })
            .addState(States.HEALING, { onEnter: this.onHealingEnter, onUpdate: this.onHealingUpdate, onExit: this.onHealingExit })
            .addState(States.HOOK, { onEnter: this.onHookEnter, onUpdate: this.onHookUpdate, onExit: this.onHookExit })
            .addState(States.ILIRECH, { onEnter: this.onIlirechEnter, onUpdate: this.onIlirechUpdate, onExit: this.onIlirechExit })
            .addState(States.KYNISOS, { onEnter: this.onKynisosEnter, onUpdate: this.onKynisosUpdate, onExit: this.onKynisosExit })
            .addState(States.KYRISIAN, { onEnter: this.onKyrisianEnter, onUpdate: this.onKyrisianUpdate, onExit: this.onKyrisianExit })
            .addState(States.KYRNAICISM, { onEnter: this.onKyrnaicismEnter, onUpdate: this.onKyrnaicismUpdate, onExit: this.onKyrnaicismExit })
            .addState(States.LEAP, { onEnter: this.onLeapEnter, onUpdate: this.onLeapUpdate })
            .addState(States.LIKYR, { onEnter: this.onLikyrEnter, onUpdate: this.onLikyrUpdate, onExit: this.onLikyrExit })
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
            .addState(States.PARALYZED, { onEnter: this.onParalyzedEnter, onUpdate: this.onParalyzedUpdate, onExit: this.onParalyzedExit })
            .addState(States.POLYMORPHED, { onEnter: this.onPolymorphedEnter, onUpdate: this.onPolymorphedUpdate, onExit: this.onPolymorphedExit });
        this.stateMachine.setState(States.IDLE);

        this.positiveMachine = new StateMachine(this, "party");
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
            
        this.negativeMachine = new StateMachine(this, "party");
        this.negativeMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.FROZEN, { onEnter: this.onFrozenEnter, onUpdate: this.onFrozenUpdate, onExit: this.onFrozenExit })
            .addState(States.SLOWED, { onEnter: this.onSlowedEnter, onExit: this.onSlowedExit })
            .addState(States.SNARED, { onEnter: this.onSnaredEnter, onExit: this.onSnaredExit });
        if (this.scene.state.isStealth) {
            this.scene.time.delayedCall(500, () => this.positiveMachine.setState(States.STEALTH), undefined, this);
        } else {
            this.positiveMachine.setState(States.CLEAN);
        };
    };

    onHurtEnter = () => {
        this.player.clearAnimations();
        // this.player.clearTint();
        this.player.colorMatrix.reset();
        // this.player.setStatic(true);
        this.player.setVelocity(0);
        this.player.hurtTime = 0;
    };
    onHurtUpdate = (dt: number) => {
        this.player.hurtTime += dt;
        if (this.player.hurtTime >= 500) this.player.isHurt = false;
        this.player.anims.play(FRAMES.HURT, true);
        if (!this.player.isHurt) {
            if (this.player.inComputerCombat === true && this.player.health > 0) {
                this.stateMachine.setState(States.COMPUTER_COMBAT);
            } else if (this.player.health > 0) {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onHurtExit = () => {
        this.player.isHurt = false;
        this.player.colorMatrix.set(GOLD_COLOR_MATRIX);
        // this.player.setStatic(false);
    };

    onChaseEnter = () => {
        if (!this.player.currentTarget || !this.player.currentTarget.body || !this.player.currentTarget.position) return;
        this.player.partyAnimation();
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
        let navMesh;
        if (this.scene.navMesh) {
            navMesh = this.scene.navMesh;
        } else {
            const chunk = this.scene.loadedChunks.get(`${this.scene.playerChunkX},${this.scene.playerChunkY}`);
            navMesh = chunk?.navMesh;
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
                this.player.path = navMesh.findPath(this.player.position, this.player.currentTarget.position);
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
        const target = this.player.currentTarget;
        if (!target || !target.body || !target.position) {
            this.player.inComputerCombat = false
            this.stateMachine.setState(States.FOLLOW);
            return;
        };
        
        const ctx = this.player.getCombatContext();
        const mind = this.player.mindState;
        const distance = ctx.direction.ogLengthSq;
        const threshold = mind.minDistanceSq * ctx.multiplier;
        // const rangeMultiplier = this.player.rangedDistanceMultiplier(3);

        // const direction = target.position.subtract(this.player.position);
        // const distance = direction.length();

        // if (Math.abs(this.player.originPoint.x - this.player.position.x) > RANGE.LEASH * rangeMultiplier || 
        //     Math.abs(this.player.originPoint.y - this.player.position.y) > RANGE.LEASH * rangeMultiplier || 
        //     !this.player.inComputerCombat || distance > RANGE.LEASH * rangeMultiplier) {
        //     this.stateMachine.setState(States.FOLLOW);
        //     return;
        // };
        // console.log({ ctx, distance, threshold });
        if (distance < threshold) {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
            return;        
        };

        let moveDirection = this.pathingVector();

        // if (distance >= 150 * rangeMultiplier) { // was 75 || 100
        //     if (this.player.path && this.player.path.length > 1) {
        //         this.player.setVelocity(this.player.pathDirection.x * (this.player.speed * this.player.handleTerrain()), this.player.pathDirection.y * (this.player.speed * this.player.handleTerrain()));
        //     } else {
        //         if (this.player.isPathing) this.player.isPathing = false;
        //         direction.normalize();
        //         this.player.setVelocity(direction.x * (this.player.speed * this.player.handleTerrain()), direction.y * (this.player.speed * this.player.handleTerrain()));
        //     };
        //     this.player.handleMovementAnimations();
        // } else if (distance >= 60 * rangeMultiplier) { // was 75 || 100
        //     if (this.player.path && this.player.path.length > 1) {
        //         this.player.setVelocity(this.player.pathDirection.x * (this.player.speed * this.player.handleTerrain()), this.player.pathDirection.y * (this.player.speed * this.player.handleTerrain()));
        //     } else {
        //         if (this.player.isPathing) this.player.isPathing = false;
        //         direction.normalize();
        //         this.player.setVelocity(direction.x * (this.player.speed * this.player.handleTerrain()), direction.y * (this.player.speed * this.player.handleTerrain()));
        //     };
        //     if (!this.player.chasing) {
        //         this.player.chasing = true;
        //         this.scene.time.delayedCall(1000, () => {
        //             this.player.chasing = false;
        //             if (Math.random() > 0.5 && !this.player.isRolling && !this.player.isDodging) {
        //                 this.player.isRolling = true;
        //             } else if (!this.player.isDodging && !this.player.isRolling) {
        //                 this.player.isDodging = true;
        //             };
        //         }, undefined, this);
        //     };
        //     // this.player.handleMovementAnimations();
        // } else {
        //     this.stateMachine.setState(States.COMPUTER_COMBAT);
        // };

        if (!moveDirection) {
            if (ctx.direction.normal) {
                moveDirection = new Phaser.Math.Vector2(ctx.direction.x, ctx.direction.y);
            } else {
                const normal = ctx.direction.normalize();
                moveDirection = new Phaser.Math.Vector2(normal.x, normal.y);
            };
        };

        this.player.setVelocity(
            moveDirection.x * (this.player.speed + 0.5) * ctx.climbingModifier,
            moveDirection.y * (this.player.speed + 0.5) * ctx.climbingModifier
        );
        this.player.partyAnimation();
    };
    onChaseExit = () => {
        // this.scene.navMesh.debugDrawClear();
        this.player.chasing = false;
        this.player.path = [];
        this.player.isPathing = false;
        this.player.setVelocity(0);
        this.player.partyAnimation();
        if (this.player.chaseTimer) {
            this.player.chaseTimer?.remove(false);
            this.player.chaseTimer.destroy();
            this.player.chaseTimer = undefined;
        };
    };

        pathingVector = () => {
        if (!this.player.path || this.player.path.length <= 1) {
            if (this.player.isPathing) this.player.isPathing = false;
            return undefined;
        };

        if (!this.player.isPathing) this.player.isPathing = true;
        let nextPoint = this.player.path[1];
        const distanceToNextPoint = Phaser.Math.Distance.Between(this.player.position.x, this.player.position.y, nextPoint.x, nextPoint.y);

        if (distanceToNextPoint < 10) {
            this.player.path.shift();
            if (this.player.path.length <= 1) {
                this.player.isPathing = false;
                return undefined;
            };
            nextPoint = this.player.path[1];
        };
        
        return new Phaser.Math.Vector2(nextPoint.x, nextPoint.y)
            .subtract(this.player.position)
            .normalize();
    };

    onLeashEnter = () => {
        this.player.partyAnimation();
        this.player.inComputerCombat = false;
        this.player.healthbar.setVisible(false);
        this.scene.showCombatText(this.player, "Leashing", 1500, EFFECT, false, true);
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
        
        let navMesh;
        if (this.scene.navMesh) {
            navMesh = this.scene.navMesh;
        } else {
            const chunk = this.scene.loadedChunks.get(`${this.scene.playerChunkX},${this.scene.playerChunkY}`);
            navMesh = chunk?.navMesh;
        };

        this.player.leashTimer = this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                let originPoint = new Phaser.Math.Vector2(this.player.originalPosition.x, this.player.originalPosition.y);
                // this.scene.navMesh.debugDrawClear();
                this.player.path = navMesh.findPath(this.player.position, originPoint);
                if (this.player.path && this.player.path.length > 1) {
                    if (!this.player.isPathing) this.player.isPathing = true;
                    const nextPoint = this.player.path[1];
                    this.player.nextPoint = nextPoint;
                    // this.scene.navMesh.debugDrawPath(this.player.path, 0xffd900);
                    const pathDirection = new Phaser.Math.Vector2(this.player.nextPoint.x, this.player.nextPoint.y);
                    this.player.pathDirection = pathDirection;
                    this.player.pathDirection.subtract(this.player.position);
                    this.player.pathDirection.normalize();
                    this.player.setVelocity(this.player.pathDirection.x * (this.player.speed * this.player.handleTerrain()), this.player.pathDirection.y * (this.player.speed * this.player.handleTerrain()));
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
                this.player.setVelocity(this.player.pathDirection.x * (this.player.speed * this.player.handleTerrain()), this.player.pathDirection.y * (this.player.speed * this.player.handleTerrain()));
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * (this.player.speed * this.player.handleTerrain()), direction.y * (this.player.speed * this.player.handleTerrain()));
            };
        } else {
            this.stateMachine.setState(States.FOLLOW);
        };
        this.player.partyAnimation();
        // this.player.handleMovementAnimations();
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
        this.player.anims.play("player_death", true);
        this.player.setVelocity(0);
        this.player.disengage();
        this.player.health = 0;
        this.player.isDefeated = true;
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.scene.showCombatText(this.player, "Defeated", 3000, DAMAGE, false, true);
        this.player.defeatedDuration = PLAYER.DURATIONS.DEFEATED * 3;
        this.player.setCollisionCategory(0);
    };
    onDefeatedUpdate = (dt: number) => {
        this.player.defeatedDuration -= dt;
        if (this.player.defeatedDuration <= 0 || this.player.health > 0) {
            this.player.anims.playReverse("player_death", true).once("animationcomplete", () => this.player.isDefeated = false, this.player);
        };
        this.player.combatChecker(this.player.isDefeated);
    };
    onDefeatedExit = () => {
        this.player.defeatedDuration = PLAYER.DURATIONS.DEFEATED * 3;
        this.player.isDefeated = false;
        this.player.setCollisionCategory(1);
        this.player.spriteWeapon.setVisible(true);
        if (this.player.isStalwart) this.player.spriteShield.setVisible(true);
        this.heal(0.1);
    };

    onEvasionEnter = () => {
        const x = Phaser.Math.Between(1, 2);
        const y = Phaser.Math.Between(1, 2);
        const evade = Phaser.Math.Between(1, 3);
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
        this.player.handleAnimations();
    };
    onEvasionUpdate = (dt: number) => {
        this.player.evasionTime -= dt;
        // if ((!this.player.isDodging && !this.player.isRolling) || this.player.evasionTime <= 0) {
        //     this.player.evasionTime = 0;
        //     this.player.isDodging = false;
        //     this.player.isRolling = false;
        //     this.stateMachine.setState(States.COMPUTER_COMBAT);
        // };
        if (this.player.evadeRight) {
            this.player.setVelocityX(((this.player.speed * this.player.handleTerrain()) - 0.25));
        } else {
            this.player.setVelocityX(-((this.player.speed * this.player.handleTerrain()) - 0.25));
        };
        if (this.player.evadeUp) {
            this.player.setVelocityY(((this.player.speed * this.player.handleTerrain()) - 0.25));
        } else {
            this.player.setVelocityY(-((this.player.speed * this.player.handleTerrain()) - 0.25));
        };
        this.player.combatChecker(this.player.isDodging || this.player.isRolling);
    };
    onEvasionExit = () => {}; // this.player.evaluateCombatDistance()

    onFollowEnter = () => {
        if (!this.scene.player || !this.scene.player.body || !this.scene.player.position) return;
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
        let navMesh;
        if (this.scene.navMesh) {
            navMesh = this.scene.navMesh;
        } else {
            const chunk = this.scene.loadedChunks.get(`${this.scene.playerChunkX},${this.scene.playerChunkY}`);
            navMesh = chunk?.navMesh;
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
                const followPosition = new Phaser.Math.Vector2(
                    this.scene.player.x + PARTY_OFFSET[this.player.y < this.scene.player.y ? this.player.partyPosition : this.player.partyPosition + 5].x, 
                    this.scene.player.y + PARTY_OFFSET[this.player.y < this.scene.player.y ? this.player.partyPosition : this.player.partyPosition + 5].y);
                this.player.path = navMesh.findPath(this.player.position, followPosition);
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
        const followPosition = new Phaser.Math.Vector2(
            this.scene.player.x + PARTY_OFFSET[this.player.y < this.scene.player.y ? this.player.partyPosition : this.player.partyPosition + 5].x, 
            this.scene.player.y + PARTY_OFFSET[this.player.y < this.scene.player.y ? this.player.partyPosition : this.player.partyPosition + 5].y);
        const direction = followPosition.subtract(this.player.position);
        const distance = direction.length();
        if (distance < 30) { // 36
            this.stateMachine.setState(States.IDLE);
            return;
        } else {
            if (this.player.path && this.player.path.length > 1) {
                this.player.setVelocity(this.player.pathDirection.x * ((this.player.speed + 0.25) * this.player.handleTerrain()), this.player.pathDirection.y * ((this.player.speed + 0.25) * this.player.handleTerrain()));
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * ((this.player.speed + 0.25) * this.player.handleTerrain()), direction.y * ((this.player.speed + 0.25) * this.player.handleTerrain()));
            };
            this.player.handleMovementAnimations();
        };
    };
    onFollowExit = () => {
        this.player.path = [];
        this.player.isPathing = false;
        this.player.setVelocity(0);
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
        this.player.setVelocity(0);
        // this.player.contemplationTime = 500;
        this.player.contemplationTime = Phaser.Math.Between(250, 750);
    };
    onContemplateUpdate = (dt: number) => {
        this.player.contemplationTime -= dt;
        if (this.player.contemplationTime <= 0) {
            this.player.isContemplating = false;
            this.stateMachine.setState(States.CLEAN);
        };
    };
    onContemplateExit = () => {
        this.player.isContemplating = false;
        this.player.currentAction = "";
        this.instincts();
    };

    onHelpEnter = () => { 
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        // this.player.fearDirection = "down";
        // this.player.fearMovement = "idle";
        this.player.fearVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ""; 
        let iteration = 0;
        // this.player.scene.showCombatText(this.player, `Help me! Get ${this.player.currentTarget?.ascean.name} away from me!`, DURATION.TEXT, BONE, false, true);
        const randomDirection = () => {  
            const move = Phaser.Math.Between(1, 100);
            const directions = ["up", "down", "left", "right"];
            const direction = directions[Phaser.Math.Between(0, 3)];
            if (move > 50) {
                if (direction === "up") {
                    this.player.fearVelocity = { x: 0, y: -1.5 };
                } else if (direction === "down") {
                    this.player.fearVelocity = { x: 0, y: 1.5 };
                } else if (direction === "right") {
                    this.player.fearVelocity = { x: -1.5, y: 0 };
                } else if (direction === "left") {
                    this.player.fearVelocity = { x: 1.5, y: 0 };
                };
                // this.player.fearMovement = "move";
            } else {
                this.player.fearVelocity = { x: 0, y: 0 };
                // this.player.fearMovement = "idle";                
            };
            // this.player.fearDirection = direction;
        };
        this.player.fearTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                this.scene.showCombatText(this.player, HELP[Math.floor(Math.random() * HELP.length)], 1500, EFFECT, false, true);
                // chirp to get nearby enemy allies
                if (iteration === 3) {
                    iteration = 0;
                    this.player.isFeared = false;
                } else {   
                    randomDirection();
                };
                this.player.callForHelp();
            },
            callbackScope: this,
            repeat: 2,
        });
    };
    onHelpUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isFeared);
        this.player.setVelocity(this.player.fearVelocity.x, this.player.fearVelocity.y);
        if (Math.abs(this.player.velocity?.x as number) > 0 || Math.abs(this.player.velocity?.y as number) > 0) {
            this.player.getDirection();
            this.player.anims.play(FRAMES.RUNNING, true);
        } else {
            this.player.anims.play(FRAMES.IDLE, true);
        };
    };
    onHelpExit = () => {
        this.player.partyAnimation();
        this.player.spriteWeapon.setVisible(true);
        if (this.player.isStalwart) this.player.spriteShield.setVisible(true);
        if (this.player.fearTimer) {
            this.player.fearTimer.destroy();
            this.player.fearTimer = undefined;
        };
    };

    onPushbackEnter = () => {
        this.scene.showCombatText(this.player, "Pushing Back", DURATION.TEXT, DAMAGE, false, true);
        this.player.isPraying = true;
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ""; 
        if (!this.player.isGlowing && !this.player.isCaerenic) this.player.checkCaerenic(true);
        this.player.partyAnimation();
    };
    onPushbackUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onPushbackExit = () => {
        this.player.partyAnimation();
        if (this.player.isGlowing && !this.player.isCaerenic) this.player.checkCaerenic(false);
        if (this.player.currentTarget) {
            // this.player.scene.showCombatText(this.player, "Pushing Back", DURATION.TEXT, DAMAGE, false, true);
            this.player.applyKnockback(this.player.currentTarget, 250, true);
            this.scene.combatManager.hitFeedbackSystem.spotEmit(this.player.currentTarget.enemyID, "Parry");
        };
    };

    onSummonEnter = () => { 
        this.scene.showCombatText(this.player, "Summoning Ally", DURATION.TEXT, DAMAGE, false, true);
        this.player.isPraying = true;
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ""; 
        if (!this.player.isGlowing && !this.player.isCaerenic) this.player.checkCaerenic(true);
        this.player.partyAnimation();
    };
    onSummonUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onSummonExit = () => {
        this.player.partyAnimation();
        this.scene.combatManager.summon(this.player);
        if (this.player.isGlowing && !this.player.isCaerenic) this.player.checkCaerenic(false);
    };

    checkHeal = (power: number) => {
        const playerRatio = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
        const personalRatio = this.player.health / this.player.ascean.health.max;
        let otherRatio = 1;
        let otherParty: Party | undefined = undefined;
        for (let i = 0; i < this.scene.party.length; ++i) {
            const p = this.scene.party[i];
            if (p.enemyID !== this.player.enemyID) {
                const ratio = p.health / p.ascean.health.max;
                if (ratio < otherRatio) {
                    otherParty = p;
                    otherRatio = ratio;
                };
            };
        };
        const ratios = [
            { type: "player", ratio: playerRatio },
            { type: "current", ratio: personalRatio },
            { type: "other", ratio: otherRatio }
        ];
        const mostInjured = ratios.reduce((min, entry) => (entry.ratio < min.ratio ? entry: min));
        switch (mostInjured.type) {
            case "player":
                this.scene.combatManager.combatMachine.action({ data: { key: "player", value: power * 100, id: this.scene.player.playerID }, type: "Health" });
                break;
            case "current":
                this.heal(power);
                break;
            case "other":
                (otherParty as Party).playerMachine.heal(power);
                break;
            default:
                console.warn("No valid target to Heal");
                break;
        };
    };

    instincts = () => {
        if (this.player.inComputerCombat === false || this.player.health <= 0) {
            this.player.inComputerCombat = false;
            this.stateMachine.setState(States.IDLE);
            return;
        };
        this.player.isMoving = false;
        this.player.setVelocity(0);
        const ranged = this.player.isRanged;
        let chance = [1, 2, 4, 5, (!ranged ? 6 : 7), (!ranged ? 8 : 9), (!ranged ? 10 : 11), (!ranged ? 12 : 13)][Math.floor(Math.random() * 8)];
        let mastery = this.player.ascean.mastery;
        let playerHealth = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
        let partyHealth = this.player.health / this.player.ascean.health.max;
        let enemyHealth = this.player.currentTarget ? this.player.currentTarget.health / this.player.currentTarget.ascean.health.max : 1;
        let otherHealth = 1;
        for (let i = 0; i < this.scene.party.length; ++i) {
            const p = this.scene.party[i];
            if (p.enemyID !== this.player.enemyID) {
                const ratio = p.health / p.ascean.health.max;
                otherHealth = ratio < otherHealth ? ratio : otherHealth;
            };
        };
        const direction = this.player.currentTarget?.position.subtract(this.player.position);
        const distance = direction?.length() || 0;
        let instinct =
            (partyHealth <= 0.25 || playerHealth <= 0.25 || otherHealth <= 0.25) ? 0 :
            (partyHealth <= 0.5 || playerHealth <= 0.5 || otherHealth <= 0.5) ? 1 :
            ((partyHealth >= 0.7 && partyHealth <= 0.9) || (playerHealth >= 0.7 && playerHealth <= 0.9) || (otherHealth >= 0.7 && otherHealth <= 0.9)) ? 2 :

            enemyHealth <= 0.35 ? 3 :
            enemyHealth <= 0.6 ? 4 :
            enemyHealth >= 0.85 ? 5 :
            
            (distance <= 60 && !ranged) ? 6 :
            (distance <= 60 && ranged) ? 7 :

            (distance > 60 && distance <= 120 && !ranged) ? 8 :
            (distance > 60 && distance <= 120 && ranged) ? 9 :

            (distance > 120 && distance <= 180 && !ranged) ? 10 :
            (distance > 120 && distance <= 180 && ranged) ? 11 :

            (distance > 180 && !ranged) ? 12 :
            (distance > 180 && ranged) ? 13 :

            chance;

        if (this.player.prevInstinct === instinct) instinct = chance;

        const focus = this.scene.hud.settings.computerFocus || BALANCED;
        let foci;
        switch (focus) {
            case BALANCED:
                foci = PARTY_BALANCED_INSTINCTS[mastery];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case DEFENSIVE:
                foci = PARTY_DEFENSIVE_INSTINCTS[mastery];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case OFFENSIVE:
                foci = PARTY_OFFENSIVE_INSTINCTS[mastery];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
        };

        let key = PARTY_INSTINCTS[mastery][instinct].key, value = PARTY_INSTINCTS[mastery][instinct].value;
        // console.log("PRE", { key, value });
        // let finals = [instinct, foci];
        // if (instinct === 0 || instinct === 3 || instinct === 7 || instinct === 12) finals.push(instinct);
        // let final = finals[Math.floor(Math.random() * finals.length)];
        // console.log("POST", { key, value: final });
        // if (final === typeof "string") {
        //     if (specialStateMachines.includes(final)) { // State Machine
        //         key = "stateMachine";
        //         value = final;
        //     } else { // Positive Machine
        //         key = "positiveMachine";
        //         value = final;
        //     };
        // };

        if (specialStateMachines.includes(value)) { // State Machine
            key = "stateMachine";
        } else { // Positive Machine
            key = "positiveMachine";
        };

        // this.scene.showCombatText(this.player, "Instinct", 750, HUSH, false, true);
        this.scene.hud.logger.log(`${this.player.ascean.name}'s instinct leads them to ${value}.`);
        this.player.prevInstinct = instinct;
        (this as any)[key].setState(value);
        if (key === "positiveMachine") this.stateMachine.setState(States.CHASE);
    };

    onIdleEnter = () => {
        this.player.setVelocity(0);
        this.player.currentRound = 0;
        this.player.partyAnimation();
        if (this.player.inComputerCombat && !this.player.computerAction) {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        };
    };
    onIdleUpdate = (_dt: number) => {
        this.player.handleIdleAnimations();
        const direction = this.scene.player.position.subtract(this.player.position);
        const distance = direction.length();
        if (distance > 120 && !this.stateMachine.isCurrentState(States.FOLLOW)) { // 144
            this.stateMachine.setState(States.FOLLOW);
        };
    };
    onIdleExit = () => {};

    onMovingEnter = () => {
        this.player.isMoving = true;
        if (this.player.inComputerCombat && !this.player.computerAction) {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
            // return;
        };
    };
    onMovingUpdate = (_dt: number) => {
        if (!this.player.moving()) {
            this.stateMachine.setState(States.IDLE);
            return;
        };
        this.player.handleMovementAnimations();
    };
    onMovingExit = () => this.player.isMoving = false;
    
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
        if (this.player.shouldExitCombat()) return;
        this.player.currentAction = "";
        this.player.computerCombatSheet.computerAction = "";
        this.player.anims.stop();
        this.player.partyAnimation();
        this.player.swingCheck();
    };
    onComputerCombatUpdate = (_dt: number) => this.player.evaluateCombatDistance();

    onComputerAttackEnter = () => {
        this.player.isAttacking = true;
        this.player.attack();
    };
    onComputerAttackUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isAttacking);
    };
    onComputerAttackExit = () => {
        this.player.currentAction = "";
        this.player.computerAction = false;
        this.player.computerCombatSheet.computerAction = "";
    };

    onComputerParryEnter = () => {
        this.player.isParrying = true;
        this.player.anims.play(FRAMES.PARRY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isParrying = false);
        if (this.player.hasMagic) {
            this.scene.showCombatText(this.player, "Counter Spell", 1000, HUSH, false, true);
            this.player.isCounterSpelling = true;
            this.player.flickerCaerenic(1000); 
            this.scene.time.delayedCall(1000, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
    };
    onComputerParryUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isParrying);
    };
    onComputerParryExit = () => {
        this.player.isParrying = false;
        this.player.currentAction = "";
        this.player.computerAction = false;    
        this.player.computerCombatSheet.computerAction = "";
    };

    onComputerPostureEnter = () => {
        this.player.isPosturing = true;
        this.player.posture();
        this.player.setStatic(true);
    };
    onComputerPostureUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isPosturing);
    };
    onComputerPostureExit = () => {
        this.player.currentAction = "";
        this.player.computerAction = false;
        this.player.setStatic(false);
        this.player.computerCombatSheet.computerAction = "";
    };

    onComputerThrustEnter = () => {
        this.player.isThrusting = true;
        this.player.thrustAttack();
    };
    onComputerThrustUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isThrusting);
    };
    onComputerThrustExit = () => {
        this.player.computerAction = false;
        this.player.currentAction = "";
        this.player.computerCombatSheet.computerAction = "";
    };

    onDodgeEnter = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.isDodging = true;
        this.player.enemySound("dodge", true);
        this.player.wasFlipped = this.player.flipX; 
        (this.player.body as any).parts[1].position.y += PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[1].circleRadius = PLAYER.SENSOR.EVADE;
        // console.log((this.player.body as any).parts, "Parts");
        const body = (this.player.body as any).parts[3];
        const legs = (this.player.body as any).parts[2];
        if (!body.isSensor) {
            body.position.y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[2].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            body.vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            legs.position.y += PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            legs.position.y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT;
        };
        legs.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
        this.player.dodge();
    };
    onDodgeUpdate = (_dt: number) => this.player.combatChecker(this.player.isDodging);
    onDodgeExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.computerAction = false;
        this.player.dodgeCooldown = 0;
        this.player.isDodging = false;
        (this.player.body as any).parts[1].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[1].circleRadius = PLAYER.SENSOR.DEFAULT;
        const body = (this.player.body as any).parts[3];
        const legs = (this.player.body as any).parts[2];
        if (!body.isSensor) {
            body.position.y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT * 1.5;
            body.vertices[2].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            body.vertices[1].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
            legs.position.y -= PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            legs.position.y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
        };
        legs.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[0].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
        legs.vertices[1].x -= this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT / 2 : -PLAYER.COLLIDER.DISPLACEMENT / 2;
    };

    onRollEnter = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.isRolling = true;
        this.player.enemySound("roll", true);
        const body = (this.player.body as any).parts[3];
        if (!body.isSensor) {
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[2].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y += PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT;
        };
        (this.player.body as any).parts[1].position.y += PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[1].circleRadius = PLAYER.SENSOR.EVADE;
        (this.player.body as any).parts[2].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        (this.player.body as any).parts[2].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT / 2;
        this.player.roll();
    };
    onRollUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isRolling);
    };
    onRollExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.currentAction = "";
        this.player.spriteWeapon.setVisible(true);
        this.player.rollCooldown = 0; 
        this.player.computerCombatSheet.computerAction = "";
        this.player.computerAction = false;
        this.player.isRolling = false;
        const body = (this.player.body as any).parts[3];
        if (!body.isSensor) {
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[2].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[3].y -= PLAYER.COLLIDER.DISPLACEMENT;
        } else {
            body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
            body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
        };
        (this.player.body as any).parts[1].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[1].circleRadius = PLAYER.SENSOR.DEFAULT;
        (this.player.body as any).parts[2].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        (this.player.body as any).parts[2].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
        body.vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT / 2;
    };

    onAchireEnter = () => {
        this.player.startCasting("Achire", PLAYER.DURATIONS.ACHIRE, CAST);
    };
    onAchireUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ACHIRE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onAchireExit = () => {
        if (this.player.castingSuccess === true) { 
            this.player.particleEffect =  this.scene.particleManager.addEffect("achire", this.player, "achire", true);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name}'s Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound("wild", true);
        };
        this.player.stopCasting();
    };

    onAstraveEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startCasting("Astrave", PLAYER.DURATIONS.ASTRAVE, CAST);
    };
    onAstraveUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ASTRAVE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, CAST);
        };
    };
    onAstraveExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.aoe = this.scene.aoePool.get("astrave", 1, false, this.player, false, this.player.currentTarget);    
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} unearths the winds and lightning from the land of hush and tendril.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound("combat-round", true);
        };
        this.player.stopCasting();
    };

    onArcEnter = () => {
        this.player.isArcing = true;
        this.player.enemySound("combat-round", true);
        this.scene.showCombatText(this.player, "Arcing", PLAYER.DURATIONS.ARCING / 2, DAMAGE, false, true);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ARCING);
        this.player.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
        this.player.setStatic(true);
        this.player.castbar.setup(this.player.x, this.player.y, "Arc");
        this.player.flickerCaerenic(3000); 
        EventBus.emit(PARTY_COMBAT_TEXT, {
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
        if (this.player.isArcing) this.player.castbar.update(dt, "channel", DAMAGE);
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
                for (let i = 0; i < this.player.touching.length; ++i) {
                    this.scene.combatManager.partyAction({enemyID: this.player.touching[i].enemyID, action: "arc", origin: this.player.enemyID});
                };
            };
        };
        this.player.castbar.reset();
        this.player.setStatic(false);
    };

    onBlinkEnter = () => {
        this.player.enemySound("caerenic", true);
        const blink = PLAYER.SPEED.BLINK / 2;
        if (this.scene.scene.key === "Game") {
            if (this.player.velocity?.x as number > 0) {
                this.player.setPosition(this.player.x + blink, this.player.y);
            } else if (this.player.velocity?.x as number < 0) {
                this.player.setPosition(this.player.x - blink, this.player.y);
            };
            if (this.player.velocity?.y as number > 0) {
                this.player.setPosition(this.player.x, this.player.y + blink);
            } else if (this.player.velocity?.y as number < 0) {
                this.player.setPosition(this.player.x, this.player.y - blink);
            };
        } else {
            if (this.player.velocity?.x as number > 0) {
                this.player.setPosition(Math.min(this.player.x + blink, this.scene.map.widthInPixels), this.player.y);
            } else if (this.player.velocity?.x as number < 0) {
                this.player.setPosition(Math.max(this.player.x - blink, 0), this.player.y);
            };
            if (this.player.velocity?.y as number > 0) {
                this.player.setPosition(this.player.x, Math.min(this.player.y + blink, this.scene.map.heightInPixels));
            } else if (this.player.velocity?.y as number < 0) {
                this.player.setPosition(this.player.x, Math.max(this.player.y - blink, 0));
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
        };
        this.player.flickerCaerenic(750); 
    };
    onBlinkUpdate = (_dt: number) => this.player.combatChecker(false);
    onChiomismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.startCasting("Chiomism", PLAYER.DURATIONS.CHIOMISM, EFFECT);    
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.CHIOMISM);                          
    };
    onChiomismUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CHIOMISM) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onChiomismExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            if (chance > 75) {
                this.scene.combatManager.confuse(this.player.spellTarget);
            };
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} bleeds and laugh at ${this.player.spellName} with tendrils of Chiomyr.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound("death", true);
        };
        this.player.stopCasting();
    };
    onConfuseEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.startCasting("Confusing", PLAYER.DURATIONS.CONFUSE, CAST);
    };
    onConfuseUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onConfuseExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.confuse(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound("death", true);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} confuses ${this.player.spellName}, causing them to stumble in a daze.`
            });
        };
        this.player.stopCasting();
    };

    onDesperationEnter = () => this.player.startPraying();
    onDesperationUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onDesperationExit = () => {
        if (this.player.health <= 0) return;
        this.checkHeal(0.5);
        this.player.enemySound("phenomena", true);
        this.scene.showCombatText(this.player, "Desperation", PLAYER.DURATIONS.HEALING / 2, HEAL, false, true);
        this.player.flickerCaerenic(PLAYER.DURATIONS.HEALING); 
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0]?.influences?.[0]} soothes their body.`
        });    
    };

    onDevourEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.currentTarget.isConsumed = true;
        this.player.enemySound("absorb", true);
        this.player.flickerCaerenic(2000); 
        this.player.startCasting("Devouring", PLAYER.DURATIONS.DEVOUR, DAMAGE, true);
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
    };
    onDevourUpdate = (dt: number) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, "channel", TENDRIL);
        };
    };
    onDevourExit = () => {
        this.player.stopCasting();
        this.player.setStatic(false);
        if (this.player.devourTimer !== undefined) {
            this.player.devourTimer.remove(false);
            this.player.devourTimer = undefined;
        };
    };

    onFearingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startCasting("Fearing", PLAYER.DURATIONS.FEAR, CAST);
    };
    onFearingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.FEAR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onFearingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.fear(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound("combat-round", true);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} strikes fear into ${this.scene.state.computer?.name}!`
            });
        };
        this.player.stopCasting();
    };
    onFrostEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.startCasting("Frost", PLAYER.DURATIONS.FROST, CAST);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.FROST);
    };
    onFrostUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.FROST) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onFrostExit = () => {
        if (this.player.castingSuccess === true) {
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} seizes into this world with Nyrolean tendrils, slowing ${this.player.spellName}.`
            });
            this.chiomism(this.player.spellTarget, (75 + this.player.computerCombatSheet.computer?.[this.player.ascean.mastery]));
            this.scene.combatManager.slow(this.player.spellTarget, 3000);
            this.player.castingSuccess = false;
            this.player.enemySound("frost", true);
        };
        this.player.stopCasting();
    };
    onFyerusEnter = () => {
        this.player.isCasting = true;
        this.player.setStatic(true);
        this.player.isMoving = false;
        this.player.startCasting("Fyerus", PLAYER.DURATIONS.FYERUS, CAST, true);
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);  
        this.player.aoe = this.scene.aoePool.get("fyerus", 6, false, this.player, false, this.player.currentTarget);    
        this.player.enemySound("combat-round", true);
        EventBus.emit(PARTY_COMBAT_TEXT, {
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
            this.player.castbar.update(dt, "channel", "fyerus");
        };
    };
    onFyerusExit = () => {
        if (this.player.aoe) this.player.aoe.cleanAnimation(this.scene);
        this.player.stopCasting();
        this.player.setStatic(false);
    };

    onHealingEnter = () => this.player.startCasting("Healing", PLAYER.DURATIONS.HEALING, HEAL, false);
    
    onHealingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.HEALING) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST, "HEAL");
    };
    onHealingExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.castingSuccess = false;
            this.checkHeal(0.25);
            this.player.enemySound("phenomena", true);
        };
        this.player.stopCasting();
    };

    onIlirechEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startCasting("Ilirech", PLAYER.DURATIONS.ILIRECH, CAST);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.ILIRECH);
    };
    onIlirechUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ILIRECH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onIlirechExit = () => {
        if (this.player.castingSuccess === true) {
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} rips into this world with Ilian tendrils entwining.`
            });
            this.chiomism(this.player.spellTarget, (25 + this.player.computerCombatSheet.computer?.[this.player.ascean.mastery]));
            this.player.castingSuccess = false;
            this.player.enemySound("fire", true);
        };
        this.player.stopCasting();
    };

    onKynisosEnter = () => this.player.startCasting("Kynisos", PLAYER.DURATIONS.KYNISOS, CAST);
    
    onKynisosUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.KYNISOS) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, CAST);
        };
    };
    onKynisosExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.aoe = this.scene.aoePool.get("kynisos", 3, false, this.player, false, this.player.currentTarget);    
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} unearths the netting of the golden hunt.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound("combat-round", true);
        };
        this.player.stopCasting();
    };
    onKyrisianEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.startCasting("Kyrisian", PLAYER.DURATIONS.KYRISIAN, EFFECT);    
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.KYRISIAN);                          
    };
    onKyrisianUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.KYRISIAN) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onKyrisianExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            if (chance > 75) {
                this.scene.combatManager.paralyze(this.player.spellTarget);
            };
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} bleeds and bewitches ${this.player.spellName} with tendrils of Kyrisos.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound("spooky", true);
        };
        this.player.stopCasting();
    };
    onKyrnaicismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startCasting("Kyrnaicism", PLAYER.DURATIONS.KYRNAICISM, DAMAGE, true);
        this.player.enemySound("absorb", true);
        this.player.flickerCaerenic(3000); 
        this.player.currentTarget.isConsumed = true;
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.KYRNAICISM);
        this.scene.combatManager.slow(this.player.spellTarget, 1000);
        this.player.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.chiomism(this.player.spellTarget, (10 + this.player.computerCombatSheet.computer?.[this.player.ascean.mastery])),
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
    };
    onKyrnaicismUpdate = (dt: number) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", TENDRIL);
    };
    onKyrnaicismExit = () => {
        this.player.stopCasting();
        this.player.setStatic(false);
        if (this.player.chiomicTimer) {
            this.player.chiomicTimer.remove(false);
            this.player.chiomicTimer = undefined;
        }; 
    };

    caerenicDamage = () => this.player.isCaerenic ? 1.15 : 1;
    levelModifier = () => (this.player?.ascean.level as number + 9) / 10;
    mastery = () => this.player?.computerCombatSheet.computer?.[this.player?.ascean.mastery];

    /*
        TODO: FIXME:
        
        Check for computerCombatSheet updates on PartyComputer concerning isCaerenic and isStalwart

        either have them match the player at all times as is the case now,
        or have them also built with 'MindStates' to allow for their own behaviors
        i.e. Stalwart activating isStalwart, and Berserker activating Caerenic
    
    */

    chiomism = (id: string, power: number) => {
        const modifiedPower = this.player.entropicMultiplier(power);
        const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
        if (!enemy || enemy.health <= 0) return;
        const damage = Math.round(this.mastery() * (1 + modifiedPower / CHIOMISM) * this.caerenicDamage() 
            * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
            * (this.levelModifier() ** 2));
        this.scene.combatManager.updateComputerDamage(damage, id, this.player.enemyID);
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Pierce");

        const text = `${this.player.ascean.name}'s hush flays ${damage} health from ${enemy.ascean?.name}.`;
        EventBus.emit(PARTY_COMBAT_TEXT, { text });
        this.player.enemySound("absorb", true);
    };
    heal = (pow: number) => {
        const heal = Math.round(this.player.computerCombatSheet.computerHealth * pow);
        this.player.health = Math.min(this.player.health + heal, this.player.computerCombatSheet.computerHealth);
        this.player.updateHealthBar(this.player.health);
        this.player.computerCombatSheet.newComputerHealth = this.player.health;
        this.scene.combatManager.checkPlayerFocus(this.player.enemyID, this.player.health);
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.player.x, this.player.y));
        this.scene.showCombatText(this.player, `${heal}`, DURATION.TEXT, HEAL);
    };
    devour = (id: string) => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === this.player.spellTarget);
        if (this.player.isCasting === false || !enemy || enemy.health <= 0) {
            this.player.isCasting = false;
            this.player.devourTimer?.remove(false);
            this.player.devourTimer = undefined;
            return;
        };
        const damage = Math.round(this.player.computerCombatSheet.computerHealth * 0.04 * this.caerenicDamage() 
            * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
            * (this.levelModifier() ** 2));
        let newComputerHealth = Math.min(this.player.health + damage, this.player.computerCombatSheet.computerHealth);        
        this.player.health = newComputerHealth;
        this.player.updateHealthBar(this.player.health);
        this.player.computerCombatSheet.newComputerHealth = this.player.health;
        this.scene.combatManager.updateComputerDamage(damage, id, this.player.enemyID);
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.player.x, this.player.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Pierce");

        const text = `${this.player.ascean.name} tshaers and devours ${damage} health from ${enemy.ascean?.name}.`;
        EventBus.emit(PARTY_COMBAT_TEXT, { text });
    };
    sacrifice = (id: string, power: number) => {
        power = this.player.entropicMultiplier(power);
        const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
        if (!enemy || enemy.health <= 0) return;
        let damage = Math.round(this.mastery() * this.caerenicDamage() 
            * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
            * (this.levelModifier() ** 2));
        this.player.health -= (damage / 2 * this.scene.combatManager.computerStalwart(this.player));
        this.player.computerCombatSheet.newComputerHealth = this.player.health;
        damage *= (1 + power / SACRIFICE);
        this.scene.combatManager.updateComputerDamage(damage, id, this.player.enemyID);
        this.scene.combatManager.hitFeedbackSystem.bleed(new Phaser.Math.Vector2(this.player.x, this.player.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Spooky");

        const text = `${this.player.ascean.name} sacrifices ${Math.round(damage) / 2 * (this.player.isStalwart ? 0.85 : 1)} health to rip ${Math.round(damage)} from ${enemy.ascean?.name}.`;
        EventBus.emit(PARTY_COMBAT_TEXT, { text });
        enemy.flickerCaerenic(750);
    };
    suture = (id: string, power: number) => {
        power = this.player.entropicMultiplier(power);
        const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
        if (!enemy || enemy.health <= 0) return;
        const damage = Math.round(this.mastery() * this.caerenicDamage() 
            * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
            * (this.levelModifier() ** 2)) * (1 * power / SUTURE);
        
        let newComputerHealth = Math.min(this.player.health + damage, this.player.computerCombatSheet.computerHealth);
        this.player.computerCombatSheet.newComputerHealth = newComputerHealth;
        this.scene.combatManager.updateComputerDamage(damage, id, this.player.enemyID);
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.player.x, this.player.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(id, "Righteous");

        const text = `${this.player.ascean.name}'s suture ${enemy.ascean?.name}'s caeren into them, absorbing and healing for ${damage}.`;
        EventBus.emit(PARTY_COMBAT_TEXT, { text });
        enemy.flickerCaerenic(750);
    };

    onLeapEnter = () => this.player.leap();
    onLeapUpdate = (_dt: number) => this.player.combatChecker(this.player.isLeaping);
    onLikyrEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.startCasting("Likyr", PLAYER.DURATIONS.LIKYR, CAST);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.LIKYR);
    };
    onLikyrUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.LIKYR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onLikyrExit = () => {
        if (this.player.castingSuccess === true) {
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} blends caeren into this world with Likyrish tendrils entwining ${this.player.spellName}.`
            });
            this.suture(this.player.spellTarget, 20);
            this.player.castingSuccess = false;
            this.player.enemySound("debuff", true);
        };
        this.player.stopCasting();
    };
    onMaierethEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startCasting("Maiereth", PLAYER.DURATIONS.MAIERETH, EFFECT);    
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.MAIERETH);                          
    };
    onMaierethUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.MAIERETH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onMaierethExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            if (chance > 75) {
                this.scene.combatManager.fear(this.player.spellTarget);
            };
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} bleeds and strike ${this.scene.state.computer?.name} with tendrils of Ma"anre.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound("spooky", true);
        };
        this.player.stopCasting();
    };

    onHookEnter = () => {
        this.player.particleEffect = this.scene.particleManager.addEffect("hook", this.player, "hook", true);
        this.scene.showCombatText(this.player, "Hook", DURATION.TEXT, DAMAGE, false, true);
        this.player.enemySound("dungeon", true);
        this.player.flickerCaerenic(750);
        this.player.beam.startEmitter(this.player.particleEffect.effect, 1750);
        this.player.hookTime = 0;
    };
    onHookUpdate = (dt: number) => {
        this.player.hookTime += dt;
        if (this.player.hookTime >= 1750 || !this.player.particleEffect?.effect) {
            this.player.combatChecker(false);
        };
    };
    onHookExit = () => this.player.beam.reset();

    onMarkEnter = () => {
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.scene.showCombatText(this.player, "Marking", DURATION.TEXT, EFFECT, false, true);
        this.player.flickerCaerenic(1000);
    };
    onMarkUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onMarkExit = () => {
        this.player.mark.setPosition(this.player.x, this.player.y + 24);
        this.player.mark.setVisible(true);
        this.player.animateMark();
        this.player.animateMark();
        this.player.enemySound("phenomena", true);
        this.player.setStatic(false);
    };

    onNetherswapEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.player.isNetherswapping = true;
        this.player.netherswapTarget = this.player.currentTarget;
        this.player.flickerCaerenic(1000);
    };
    onNetherswapUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onNetherswapExit = () => {
        if (this.player.isNetherswapping === false) return;
        this.player.isNetherswapping = false;
        this.player.setStatic(false);
        if (this.player.netherswapTarget === undefined) return; 
        this.scene.showCombatText(this.player, "Netherswap", DURATION.TEXT / 2, EFFECT, false, true);
        const player = new Phaser.Math.Vector2(this.player.x, this.player.y);
        const enemy = new Phaser.Math.Vector2(this.player.netherswapTarget.x, this.player.netherswapTarget.y);
        this.player.setPosition(enemy.x, enemy.y);
        this.player.netherswapTarget.setPosition(player.x, player.y);
        this.player.netherswapTarget = undefined;
        this.player.enemySound("caerenic", true);
    };

    onRecallEnter = () => {
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.scene.showCombatText(this.player, "Recalling", DURATION.TEXT, EFFECT, false, true);
        this.player.flickerCaerenic(1000);
    };
    onRecallUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onRecallExit = () => {
        this.player.setPosition(this.player.mark.x, this.player.mark.y - 24);
        this.player.enemySound("phenomena", true);
        this.player.animateMark();
        this.player.setStatic(false);
    };

    onParalyzeEnter = () => { 
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.startCasting("Paralyzing", PLAYER.DURATIONS.PARALYZE, CAST);
    };
    onParalyzeUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.PARALYZE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onParalyzeExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.paralyze(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound("combat-round", true);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} paralyzes ${this.player.spellName} for several seconds!`
            });
        };
        this.player.stopCasting();
    };

    onPolymorphingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.startCasting("Polymorphing", PLAYER.DURATIONS.POLYMORPH, CAST);
    };
    onPolymorphingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onPolymorphingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.polymorph(this.player.spellTarget);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} ensorcels ${this.player.spellName}, polymorphing them!`
            });
            this.player.castingSuccess = false;
            this.player.enemySound("combat-round", true);
        };
        this.player.stopCasting();
    };

    onPursuitEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.player.enemySound("wild", true);
        if (this.player.currentTarget) {
            if (this.player.currentTarget.flipX) {
                this.player.setPosition(this.player.currentTarget.x + 16, this.player.currentTarget.y);
            } else {
                this.player.setPosition(this.player.currentTarget.x - 16, this.player.currentTarget.y);
            };
        };
        this.player.flickerCaerenic(750);
    };
    onPursuitUpdate = (_dt: number) => this.player.combatChecker(this.player.isPursuing);

    onQuorEnter = () => this.player.startCasting("Quor", PLAYER.DURATIONS.QUOR, CAST);
    onQuorUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.QUOR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onQuorExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.particleEffect =  this.scene.particleManager.addEffect("quor", this.player, "quor", true);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name}'s Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.player.castingSuccess = false;
            this.player.enemySound('freeze', true);
        };
        this.player.stopCasting();
    };

    onReconstituteEnter = () => {
        this.player.setStatic(true);
        this.player.isMoving = false;
        this.player.startCasting("Reconstituting", PLAYER.DURATIONS.RECONSTITUTE, HEAL, true);
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
    };
    onReconstituteUpdate = (dt: number) => {
        if (this.player.isMoving) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", HEAL);
    };
    onReconstituteExit = () => {
        this.player.setStatic(false);
        this.player.stopCasting();
        if (this.player.reconTimer) {
            this.player.reconTimer.remove(false);
            this.player.reconTimer = undefined;
        }; 
    };
    reconstitute = () => {
        if (!this.player.isCasting) {
            this.player.isCasting = false;
            this.player.reconTimer?.remove(false);
            this.player.reconTimer = undefined;
            return;
        };
        this.checkHeal(0.15);
        this.player.enemySound("phenomena", true);
    };

    onRootingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.startCasting("Rooting", PLAYER.DURATIONS.ROOTING, CAST);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.ROOTING);
    };
    onRootingUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ROOTING) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onRootingExit = () => { 
        if (this.player.castingSuccess === true) {
            this.player.castingSuccess = false;
            this.scene.combatManager.root(this.player.spellTarget);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} ensorcels ${this.player.spellName}, rooting them!`
            });
        };
        this.player.stopCasting();
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
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startPraying();
    };
    onSlowUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onSlowExit = () => {
        if (this.player.spellTarget) {
            this.scene.showCombatText(this.player, "Slow", 750, CAST, false, true);
            this.player.enemySound("debuff", true);
            this.scene.combatManager.slow(this.player.spellTarget, 3000);
            const name = this.scene.combatManager.combatant(this.player.spellTarget)?.ascean.name;
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} ensorcels ${name}, slowing them!`
            });
            this.player.spellTarget = "";
        };
    };

    onSacrificeEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startPraying();
    };
    onSacrificeUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onSacrificeExit = () => {
        if (this.player.spellTarget) {
            this.scene.showCombatText(this.player, "Sacrifice", 750, EFFECT, false, true);
            this.player.enemySound("combat-round", true);
            this.sacrifice(this.player.spellTarget, 10);
            this.player.spellTarget = "";
        };
    };

    onSnaringEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.startCasting("Snaring", PLAYER.DURATIONS.SNARE, CAST);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.SNARE);
    };
    onSnaringUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.SNARE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onSnaringExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.snare(this.player.spellTarget);
            this.player.castingSuccess = false;
            this.player.enemySound("debuff", true);
            EventBus.emit(PARTY_COMBAT_TEXT, {
                text: `${this.player.ascean.name} ensorcels ${this.player.spellName}, snaring them!`
            });
        };
        this.player.stopCasting();
    };

    onStormEnter = () => this.player.storm();
    onStormUpdate = (_dt: number) => this.player.combatChecker(this.player.isStorming);

    onSutureEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.startPraying();
    };
    onSutureUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onSutureExit = () => {
        if (this.player.spellTarget) {
            this.scene.showCombatText(this.player, "Suture", 750, EFFECT, false, true);
            this.player.enemySound("debuff", true);
            this.suture(this.player.spellTarget, 10);
            this.player.spellTarget = "";
        };
    };

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
        this.player.enemySound("absorb", true);
        this.scene.showCombatText(this.player, "Absorbing", 750, EFFECT, false, true);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "aqua", PLAYER.DURATIONS.ABSORB);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ABSORB, () => {
            this.player.isAbsorbing = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.destroy();
                this.player.negationBubble = undefined;
                if (this.player.negationName === States.ABSORB) this.player.negationName = "";
            };    
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} warps oncoming damage into grace.`
        });
    };
    onAbsorbUpdate = (_dt: number) => {if (!this.player.isAbsorbing) this.positiveMachine.setState(States.CLEAN);};

    onChiomicEnter = () => {
        this.player.aoe = this.scene.aoePool.get("chiomic", 1, false, this.player);    
        this.player.enemySound("death", true);
        this.scene.showCombatText(this.player, "Hah! Hah! Hah!", PLAYER.DURATIONS.CHIOMIC, EFFECT, false, true);
        this.player.isChiomic = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.player.isChiomic = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} mocks and confuse their surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt: number) => {if (this.player.isChiomic === false) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.player.isDiseasing = true;
        this.player.aoe = this.scene.aoePool.get("disease", 6, false, this.player);    
        this.player.enemySound("dungeon", true);
        this.scene.showCombatText(this.player, "Tendrils Swirl", 750, TENDRIL, false, true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.player.isDiseasing = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} swirls such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt: number) => {if (this.player.isDiseasing === false) this.positiveMachine.setState(States.CLEAN);};
    onDiseaseExit = () => this.player.aoe.cleanAnimation(this.scene);

    onHowlEnter = () => {
        this.player.aoe = this.scene.aoePool.get("howl", 1, false, this.player);    
        this.player.enemySound("howl", true);
        this.scene.showCombatText(this.player, "Howling", PLAYER.DURATIONS.HOWL, DAMAGE, false, true);
        this.player.isHowling = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.player.isHowling = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
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
        this.player.enemySound("caerenic", true);
        this.scene.showCombatText(this.player, "Enveloping", 750, CAST, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "blue", PLAYER.DURATIONS.ENVELOP);
        this.player.reactiveName = States.ENVELOP;
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.player.isEnveloping = false;    
            if (this.player.reactiveBubble !== undefined && this.player.reactiveName === States.ENVELOP) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };    
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} envelops themself, shirking oncoming attacks.`
        });
    };
    onEnvelopUpdate = (_dt: number) => {if (!this.player.isEnveloping) this.positiveMachine.setState(States.CLEAN);};

    onFreezeEnter = () => {
        this.player.aoe = this.scene.aoePool.get("freeze", 1, false, this.player);
        this.player.enemySound("freeze", true);
        this.scene.showCombatText(this.player, "Freezing", PLAYER.DURATIONS.FREEZE, CAST, false, true);
        this.player.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.player.isFreezing = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
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
        this.player.enemySound("debuff", true);
        this.player.isMalicing = true;
        this.scene.showCombatText(this.player, "Malicing", 750, HUSH, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "purple", PLAYER.DURATIONS.MALICE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.player.isMalicing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MALICE) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} wracks malicious foes with the hush of their own attack.`
        });
    };
    onMaliceUpdate = (_dt: number) => {if (!this.player.isMalicing) this.positiveMachine.setState(States.CLEAN);};

    onMendEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MEND;
        this.player.enemySound("caerenic", true);
        this.player.isMending = true;
        this.scene.showCombatText(this.player, "Mending", 750, TENDRIL, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "purple", PLAYER.DURATIONS.MEND);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.player.isMending = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MEND) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} seeks to mend oncoming attacks.`
        });
    };
    onMendUpdate = (_dt: number) => {if (!this.player.isMending) this.positiveMachine.setState(States.CLEAN);};

    onMenaceEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MENACE;
        this.player.enemySound("scream", true);
        this.player.isMenacing = true;
        this.scene.showCombatText(this.player, "Menacing", 750, TENDRIL, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "dread", PLAYER.DURATIONS.MENACE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MENACE, () => {
            this.player.isMenacing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MENACE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} seeks to menace oncoming attacks.`
        });
    };
    onMenaceUpdate = (_dt: number) => {if (!this.player.isMenacing) this.positiveMachine.setState(States.CLEAN);};

    onModerateEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MODERATE;
        this.player.enemySound("debuff", true);
        this.player.isModerating = true;
        this.scene.showCombatText(this.player, "Moderating", 750, CAST, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "sapphire", PLAYER.DURATIONS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MODERATE, () => {
            this.player.isModerating = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MODERATE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} seeks to moderate oncoming attacks.`
        });
    };
    onModerateUpdate = (_dt: number) => {if (!this.player.isModerating) this.positiveMachine.setState(States.CLEAN);};

    onMultifariousEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MULTIFARIOUS;
        this.player.enemySound("combat-round", true);
        this.player.isMultifaring = true;
        this.scene.showCombatText(this.player, "Multifaring", 750, CAST, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "ultramarine", PLAYER.DURATIONS.MULTIFARIOUS);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MULTIFARIOUS, () => {
            this.player.isMultifaring = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MULTIFARIOUS) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} seeks to multifare oncoming attacks.`
        });
    };
    onMultifariousUpdate = (_dt: number) => {if (!this.player.isMultifaring) this.positiveMachine.setState(States.CLEAN);};

    onMystifyEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MYSTIFY;
        this.player.enemySound("debuff", true);
        this.player.isMystifying = true;
        this.scene.showCombatText(this.player, "Mystifying", 750, EFFECT, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "chartreuse", PLAYER.DURATIONS.MYSTIFY);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MYSTIFY, () => {
            this.player.isMystifying = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MYSTIFY) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} seeks to mystify enemies when struck.`
        });
    };
    onMystifyUpdate = (_dt: number) => {if (!this.player.isMystifying) this.positiveMachine.setState(States.CLEAN);};

    onProtectEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isProtecting = true;
        this.player.enemySound("shield", true);
        this.scene.showCombatText(this.player, "Protecting", 750, EFFECT, false, true);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "gold", PLAYER.DURATIONS.PROTECT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.player.isProtecting = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} protects themself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt: number) => {if (!this.player.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRenewalEnter = () => {
        this.player.isRenewing = true;
        this.player.aoe = this.scene.aoePool.get("renewal", 6, true, this.player);    
        this.player.enemySound("shield", true);
        this.scene.showCombatText(this.player, "Hush Tears", 750, BONE, false, true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.player.isRenewing = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt: number) => {if (!this.player.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        this.player.aoe = this.scene.aoePool.get("scream", 1, false, this.player);    
        this.player.enemySound("scream", true);
        this.scene.showCombatText(this.player, "Screaming", 750, HUSH, false, true);
        this.player.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.player.isScreaming = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} screams, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt: number) => {if (!this.player.isScreaming) this.positiveMachine.setState(States.CLEAN);};

    onShieldEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.enemySound("shield", true);
        this.player.isShielding = true;
        this.scene.showCombatText(this.player, "Shielding", 750, BONE, false, true);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, BONE, PLAYER.DURATIONS.SHIELD);
        this.player.negationName = States.SHIELD;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.player.isShielding = false;    
            if (this.player.negationBubble && this.player.negationName === States.SHIELD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} shields themself from oncoming attacks.`
        });
    };
    onShieldUpdate = (_dt: number) => {if (!this.player.isShielding) this.positiveMachine.setState(States.CLEAN);};

    onShimmerEnter = () => {
        this.player.isShimmering = true; 
        this.player.enemySound("stealth", true);
        this.player.adjustSpeed(PLAYER.SPEED.STEALTH);
        if (!this.player.isStealthing) this.stealthEffect(true);    
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.player.isShimmering = false;
            this.stealthEffect(false);
            this.player.adjustSpeed(-PLAYER.SPEED.STEALTH);
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} shimmers, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt: number) => {if (!this.player.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    onSprintEnter = () => {
        this.player.isSprinting = true;
        this.player.enemySound("blink", true);
        this.player.adjustSpeed(PLAYER.SPEED.SPRINT);
        this.player.flickerCaerenic(PLAYER.DURATIONS.SPRINT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.player.isSprinting = false;
            this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);    
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} taps into their caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt: number) => {if (!this.player.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onStealthEnter = () => {
        if (!this.player.isShimmering) this.player.isStealthing = true; 
        this.stealthEffect(true);    
        EventBus.emit(PARTY_COMBAT_TEXT, {
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
            this.player.colorMatrix.set(GOLD_COLOR_MATRIX);
        };
        this.player.shadow.setVisible(!stealth);
        this.player.enemySound("stealth", true);
    };

    onWardEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isWarding = true;
        this.player.enemySound("combat-round", true);
        this.scene.showCombatText(this.player, "Warding", 750, DAMAGE, false, true);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "red", PLAYER.DURATIONS.WARD);
        this.player.negationName = States.WARD;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.player.isWarding = false;    
            if (this.player.negationBubble && this.player.negationName === States.WARD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = "";
            };
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} wards themself from oncoming attacks.`
        });
    };
    onWardUpdate = (_dt: number) => {if (!this.player.isWarding) this.positiveMachine.setState(States.CLEAN);};

    onWritheEnter = () => {
        this.player.aoe = this.scene.aoePool.get("writhe", 1, false, this.player);    
        this.player.enemySound("spooky", true);
        this.scene.showCombatText(this.player, "Writhing", 750, TENDRIL, false, true);
        this.player.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.player.isWrithing = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
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
        this.player.enemySound("lightning", true);
        this.scene.showCombatText(this.player, "Astrication", 750, EFFECT, false, true);
        this.player.isAstrifying = true;
        this.player.flickerCaerenic(PLAYER.DURATIONS.ASTRICATION); 
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren astrifies, wrapping round their attacks.`
        });
    };
    onAstricationUpdate = (_dt: number) => {if (!this.player.isAstrifying) this.positiveMachine.setState(States.CLEAN);};

    onBerserkEnter = () => {
        if (this.player.isBerserking === true) return;
        this.player.enemySound("howl", true);
        this.scene.showCombatText(this.player, "Berserking", 750, DAMAGE, false, true);
        this.player.isBerserking = true;
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren feeds off the pain, its hush shrieking forth.`
        });
    };
    onBerserkUpdate = (_dt: number) => {if (!this.player.isBerserking) this.positiveMachine.setState(States.CLEAN);};

    onBlindEnter = () => {
        this.player.aoe = this.scene.aoePool.get("blind", 1, false, this.player);
        this.player.enemySound("righteous", true);
        this.scene.showCombatText(this.player, "Brilliance", 750, EFFECT, false, true);
        this.player.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.player.isBlinding = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren shines with brilliance, blinding those around them.`
        });
    };
    onBlindUpdate = (_dt: number) => {if (!this.player.isBlinding) this.positiveMachine.setState(States.CLEAN);};

    onCaerenesisEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.aoe = this.scene.aoePool.get("caerenesis", 1, false, this.player, false, this.player.currentTarget);    
        this.player.enemySound("blink", true);
        this.scene.showCombatText(this.player, "Caerenesis", 750, CAST, false, true);
        this.player.isCaerenesis = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CAERENESIS, () => {
            this.player.isCaerenesis = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren grips their body and contorts, writhing around them.`
        });
    };
    onCaerenesisUpdate = (_dt: number) => {if (!this.player.isCaerenesis) this.positiveMachine.setState(States.CLEAN);};

    onConvictionEnter = () => {
        if (this.player.isConvicted === true) return;
        this.player.enemySound("spooky", true);
        this.scene.showCombatText(this.player, "Conviction", 750, TENDRIL, false, true);
        this.player.isConvicted = true;
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren steels itself in admiration of their physical form.`
        });
    };
    onConvictionUpdate = (_dt: number) => {if (!this.player.isConvicted) this.positiveMachine.setState(States.CLEAN)};

    onImpermanenceEnter = () => {
        if (this.player.isImpermanent === true) return;
        this.player.enemySound("spooky", true);
        this.scene.showCombatText(this.player, "Impermanence", 750, HUSH, false, true);
        this.player.isImpermanent = true;
        this.player.flickerCaerenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.IMPERMANENCE, () => {
            this.player.isImpermanent = false;
        }, undefined, this);
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren grips their body and fades, its hush concealing.`
        });
    };
    onImpermanenceUpdate = (_dt: number) => {if (!this.player.isImpermanent) this.positiveMachine.setState(States.CLEAN);};

    onSeerEnter = () => {
        if (this.player.isSeering === true) return;
        this.player.enemySound("fire", true);
        this.scene.showCombatText(this.player, "Seer", 750, DAMAGE, false, true);
        this.player.isSeering = true;
        this.player.flickerCaerenic(1500); 
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren calms their body to focus, its hush bleeding into them.`
        });
    };
    onSeerUpdate = (_dt: number) => {if (!this.player.isSeering) this.positiveMachine.setState(States.CLEAN);};

    onDispelEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.enemySound("debuff", true);
        this.scene.showCombatText(this.player, "Dispelling", 750, EFFECT, false, true);
        this.player.flickerCaerenic(1000); 
        this.player.currentTarget.clearBubbles();
    };
    onDispelExit = () => {};

    onShirkEnter = () => {
        this.player.isShirking = true;
        this.player.enemySound("blink", true);
        this.scene.showCombatText(this.player, "Shirking", 750, EFFECT, false, true);
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

        this.player.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isShirking = false;
        }, undefined, this); 
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name}'s caeren's hush grants reprieve, freeing them.`
        });
    };
    onShirkExit = () => {};

    onShadowEnter = () => {
        this.player.isShadowing = true;
        this.player.enemySound("wild", true);
        this.scene.showCombatText(this.player, "Shadowing", DURATION.TEXT, DAMAGE, false, true);
        this.player.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isShadowing = false;
        }, undefined, this);
    };
    onShadowExit = () => {};
    
    onTetherEnter = () => {
        this.player.isTethering = true;
        this.player.enemySound("dungeon", true);
        this.scene.showCombatText(this.player, "Tethering", DURATION.TEXT, DAMAGE, false, true);
        this.player.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isTethering = false;
        }, undefined, this);
    };
    onTetherExit = () => {};

    // ================= NEGATIVE MACHINE STATES ================= \\
    onConfusedEnter = () => {
        this.scene.showCombatText(this.player, "?c .on-f-u`SeD~", DURATION.TEXT, EFFECT, false, true);
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.confuseDirection = "down";
        this.player.confuseVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ""; 
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const dir = Math.floor(Math.random() * 4);
            const directions = ["up", "down", "left", "right"];
            const direction = directions[dir];
            if (move >= 20) {
                this.player.confuseVelocity = MOVEMENT[direction];
            } else {
                this.player.confuseVelocity = { x: 0, y: 0 };
            };
            this.player.flipX = this.player.confuseVelocity.x < 0;
            this.player.playerVelocity.x = this.player.confuseVelocity.x;
            this.player.playerVelocity.y = this.player.confuseVelocity.y;
            this.player.confuseDirection = direction;
        };

        const confusions = ["~?  ? ?!", "Hhwat?", "Wh-wor; -e ma i?", "Woh `re ewe?", "..."];
        
        this.player.confuseTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                if (iteration === 5) {
                    iteration = 0;
                    this.player.isConfused = false;
                } else {   
                    randomDirection();
                    this.scene.showCombatText(this.player, confusions[Math.floor(Math.random() * 5)], 750, EFFECT, false, true);
                };
            },
            callbackScope: this,
            repeat: 6,
        });
    };
    onConfusedUpdate = (_dt: number) => {
        if (!this.player.isConfused) this.player.combatChecker(this.player.isConfused);
        this.player.setVelocity(this.player.confuseVelocity.x, this.player.confuseVelocity.y);
        if (Math.abs(this.player.velocity?.x as number) > 0) {
            this.player.getDirection();
            this.player.anims.play(FRAMES.RUNNING, true);
        } else if (this.player.velocity?.y as number > 0) {
            this.player.getDirection();
            this.player.anims.play(FRAMES.RUN_DOWN, true);
        } else if (this.player.velocity?.y as number < 0) {
            this.player.getDirection();
            this.player.anims.play(FRAMES.RUN_UP, true);
        } else {
            this.player.anims.play(FRAMES.IDLE, true);
        };
    };
    onConfusedExit = () => { 
        if (this.player.isConfused) this.player.isConfused = false;
        this.player.partyAnimation();
        this.player.spriteWeapon.setVisible(true);
        if (this.player.confuseTimer) {
            this.player.confuseTimer.destroy();
            this.player.confuseTimer = undefined;
        };
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onFearedEnter = () => {
        this.scene.showCombatText(this.player, "F̶e̷a̴r̷e̵d̴", DURATION.TEXT, DAMAGE);
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.fearVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ""; 
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        let iteration = 0;
        const fears = ["...ahhh!", "c̶o̷m̷e̷ ̴h̴e̵r̶e̶", "Stay Away!", "Somebody HELP ME", "g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓"];
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const directions = ["up", "down", "left", "right"];
            const direction = directions[Math.floor(Math.random() * 4)];
            if (move >= 20) {
                this.player.fearVelocity = MOVEMENT[direction];
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
                    this.scene.showCombatText(this.player, fears[Math.floor(Math.random() * 5)], 750, DAMAGE);
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 
    };
    onFearedUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isFeared);
        this.player.setVelocity(this.player.fearVelocity.x, this.player.fearVelocity.y);
        if (Math.abs(this.player.velocity?.x as number) > 0) {
            this.player.getDirection();
            this.player.anims.play(FRAMES.RUNNING, true);
        } else if (this.player.velocity?.y as number > 0) {
            this.player.getDirection();
            this.player.anims.play(FRAMES.RUN_DOWN, true);
        } else if (this.player.velocity?.y as number < 0) {
            this.player.getDirection();
            this.player.anims.play(FRAMES.RUN_UP, true);
        } else {
            this.player.anims.play(FRAMES.IDLE, true);
        };
    };
    onFearedExit = () => {
        this.player.partyAnimation();
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
        this.scene.showCombatText(this.player, "Frozen", DURATION.TEXT, CAST, false, true);
        this.player.clearAnimations();
        this.player.anims.play("player_idle", true);
        this.player.colorMatrix.set(BLUE_COLOR_MATRIX);
        this.startFrozen();
    };
    onFrozenUpdate = (_dt: number) => {
        this.player.setVelocity(0);
    };
    onFrozenExit = () => {
        this.player.colorMatrix.reset();
        this.player.colorMatrix.set(GOLD_COLOR_MATRIX);
    };
    startFrozen = () => {
        this.scene.time.delayedCall(DURATION.FROZEN, () => {
            this.player.count.frozen -= 1;
            if (this.player.count.frozen <= 0) {
                this.player.count.frozen = 0;
                this.player.isFrozen = false;
                this.negativeMachine.setState(States.CLEAN);
            } else {
                this.startFrozen();
            };
        }, undefined, this);
    };

    onParalyzedEnter = () => {
        this.player.specialCombatText = this.player.scene.showCombatText(this.player, "Paralyzed", DURATION.TEXT, EFFECT, false, true);
        this.player.paralyzeDuration = DURATION.PARALYZED;
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.isDodging = false;
        this.player.currentAction = ""; 
        this.player.anims.pause();
        this.player.colorMatrix.set(GRAY_COLOR_MATRIX); // 0x888888
        // this.player.setStatic(true);
        this.startParalyze();    
    };
    onParalyzedUpdate = (_dt: number) => {
        this.player.setVelocity(0);
        // this.player.paralyzeDuration -= dt;
        // if (this.player.paralyzeDuration <= 0) this.player.isParalyzed = false;
        this.player.combatChecker(this.player.isParalyzed);
    }; 
    onParalyzedExit = () => {
        this.player.isParalyzed = false;
        this.player.paralyzeDuration = DURATION.PARALYZED;
        this.player.colorMatrix.reset();
        this.player.colorMatrix.set(GOLD_COLOR_MATRIX);
        this.player.anims.resume();
    };
    startParalyze = () => {
        this.scene.time.delayedCall(this.player.paralyzeDuration, () => {
            this.player.count.paralyzed -= 1;
            if (this.player.count.paralyzed <= 0 || this.player.health <= 0) {
                this.player.count.paralyzed = 0;
                this.player.isParalyzed = false;
                this.stateMachine.setState(States.COMBAT);
            } else {
                // this.stateMachine.setState(States.COMBAT);
                this.startParalyze();
            };
        }, undefined, this);
    };

    onPolymorphedEnter = () => {
        this.player.isPolymorphed = true;
        this.scene.showCombatText(this.player, "Polymorphed", DURATION.TEXT, EFFECT, false, true);
        this.player.clearAnimations();
        this.player.clearTint();
        this.player.anims.pause();
        this.player.anims.play("rabbit_idle_down", true);
        this.player.anims.resume();
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.polymorphDirection = "down";
        this.player.polymorphMovement = "idle";
        this.player.polymorphVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ""; 
        let iteration = 0;
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const directions = ["up", "down", "left", "right"];
            const dir = Math.floor(Math.random() * directions.length);
            const direction = directions[dir];
            if (move >= 20) {
                this.player.polymorphMovement = "move";
                this.player.polymorphVelocity = MOVEMENT[direction]; 
            } else {
                this.player.polymorphMovement = "idle";                
                this.player.polymorphVelocity = { x: 0, y: 0 };
            };
            this.player.flipX = this.player.polymorphVelocity.x < 0;
            this.player.polymorphDirection = direction;
            // this.player.playerVelocity.x = this.player.polymorphVelocity.x;
            // this.player.playerVelocity.y = this.player.polymorphVelocity.y;
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
                    this.scene.showCombatText(this.player, "...thump", 1000, EFFECT);        
                    this.heal(0.2);
                };
            },
            callbackScope: this,
            repeat: 5,
        }); 
    };
    onPolymorphedUpdate = (_dt: number) => {
        if (!this.player.isPolymorphed) this.player.combatChecker(this.player.isPolymorphed);
        // this.player.playerVelocity.x = this.player.polymorphVelocity.x;
        // this.player.playerVelocity.y = this.player.polymorphVelocity.y;
        this.player.setVelocity(this.player.polymorphVelocity.x, this.player.polymorphVelocity.y);
        this.player.anims.play(`rabbit_${this.player.polymorphMovement}_${this.player.polymorphDirection}`);
    };
    onPolymorphedExit = () => { 
        this.player.partyAnimation();
        if (this.player.isPolymorphed) this.player.isPolymorphed = false;
        this.player.clearAnimations();
        this.player.colorMatrix.set(GOLD_COLOR_MATRIX);
        this.player.spriteWeapon.setVisible(true);
        if (this.player.polymorphTimer) {
            this.player.polymorphTimer.destroy();
            this.player.polymorphTimer = undefined;
        };
    };

    onSlowedEnter = () => {
        this.scene.showCombatText(this.player, "Slowed", DURATION.TEXT, EFFECT, false, true);
        // this.player.setTint(0xFFC700);
        this.player.colorMatrix.set(TEAL_COLOR_MATRIX);
        this.player.adjustSpeed(-PLAYER.SPEED.SLOW);
        this.startSlow();
    };
    onSlowedExit = () => {
        this.player.clearTint();
        this.player.colorMatrix.set(GOLD_COLOR_MATRIX);
        this.player.adjustSpeed(PLAYER.SPEED.SLOW);
    };
    startSlow = () => {
        this.scene.time.delayedCall(this.player.slowDuration, () =>{
            this.player.count.slowed -= 1;
            if (this.player.count.slowed <= 0) {
                this.player.count.slowed = 0;
                this.player.isSlowed = false;
                this.negativeMachine.setState(States.CLEAN);
            } else {
                this.startSlow();
            };
        }, undefined, this);
    };


    onSnaredEnter = () => {
        this.scene.showCombatText(this.player, "Snared", DURATION.TEXT, EFFECT, false, true);
        this.player.snareDuration = DURATION.SNARED;
        this.player.colorMatrix.set(TEAL_COLOR_MATRIX);
        this.player.adjustSpeed(-PLAYER.SPEED.SNARE);
        this.startSnare();
    };
    onSnaredExit = () => { 
        this.player.clearTint(); 
        this.player.colorMatrix.set(GOLD_COLOR_MATRIX); 
        this.player.adjustSpeed(PLAYER.SPEED.SNARE);
    };
    startSnare = () => {
        this.scene.time.delayedCall(this.player.snareDuration, () =>{
            this.player.count.snared -= 1;
            if (this.player.count.snared <= 0) {
                this.player.count.snared = 0;
                this.player.isSnared = false;
                this.negativeMachine.setState(States.CLEAN);
            } else {
                this.startSnare();
            };
        }, undefined, this);
    };

    onStunnedEnter = () => {
        this.player.isStunned = true;
        this.scene.showCombatText(this.player, "Stunned", PLAYER.DURATIONS.STUNNED, EFFECT, false, true);
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.colorMatrix.set(GRAY_COLOR_MATRIX);
        this.player.anims.pause();
        this.startStun();
        EventBus.emit(PARTY_COMBAT_TEXT, {
            text: `${this.player.ascean.name} has been stunned.`
        });
    };
    onStunnedUpdate = (_dt: number) => {
        this.player.setVelocity(0);
        this.player.combatChecker(this.player.isStunned);
    };
    onStunnedExit = () => {
        this.player.isStunned = false;
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.colorMatrix.set(GOLD_COLOR_MATRIX);
        this.player.anims.resume();
    };
    startStun = () => {
        this.scene.time.delayedCall(this.player.stunDuration, () => {
            this.player.count.stunned -= 1;
            if (this.player.count.stunned <= 0 || this.player.health <= 0) {
                this.player.count.stunned = 0;
                this.player.isStunned = false;
                this.stateMachine.setState(States.COMBAT);
            } else {
                this.startStun();
            };
        }, undefined, this);
    };


    update(dt: number) {
        this.stateMachine.update(dt);
        this.positiveMachine.update(dt);
        this.negativeMachine.update(dt);
    };
};