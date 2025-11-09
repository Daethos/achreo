import Player from "../entities/Player";
import StateMachine, { specialStateMachines, States } from "./StateMachine";
import { BALANCED, BALANCED_INSTINCTS, DEFENSIVE, DEFENSIVE_INSTINCTS, OFFENSIVE, OFFENSIVE_INSTINCTS, PLAYER, PLAYER_INSTINCTS, POSITIVE, staminaCheck, STATE } from "../../utility/player";
import { FRAMES, MOVEMENT } from "../entities/Entity";
import { EventBus } from "../EventBus";
import { screenShake, sprint } from "./ScreenShake";
import Bubble from "./Bubble";
import { BlendModes } from "phaser";
import { Play } from "../main";
import PlayerComputer from "../entities/PlayerComputer";
import Party from "../entities/PartyComputer";
import { BONE, CAST, DAMAGE, EFFECT, HEAL, HUSH, TENDRIL } from "./ScrollingCombatText";
import { CHIOMISM, SACRIFICE, SUTURE } from "../../utility/combatTypes";
import Ascean from "../../models/ascean";
import { LevelSheet } from "../../utility/ascean";
import { TRAIT_DESCRIPTIONS } from "../../utility/traits";
import Enemy from "../entities/Enemy";
import { LIGHTNING_MASTERY } from "./ChainLightning";
import { HitLocation } from "./HitDetection";

const enemyArticle = (enemy: Enemy) => ["a", "e", "i", "o", "u"].includes(enemy.ascean.name.charAt(0).toLowerCase()) ? "an" : "a";

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
export default class PlayerMachine {
    scene: Play;
    player: Player;
    stateMachine: StateMachine;
    positiveMachine: StateMachine;
    negativeMachine: StateMachine;

    constructor(scene: Play, player: Player) {
        this.scene = scene;
        this.player = player;
        this.stateMachine = new StateMachine(this, "player");
        this.stateMachine
            .addState(States.IDLE, { onEnter: this.onIdleEnter, onUpdate: this.onIdleUpdate, onExit: this.onIdleExit })
            .addState(States.MOVING, { onEnter: this.onMovingEnter, onUpdate: this.onMovingUpdate, onExit: this.onMovingExit })
            .addState(States.COMPUTER_COMBAT, { onEnter: this.onComputerCombatEnter, onUpdate: this.onComputerCombatUpdate }) // , onUpdate: this.onComputerCombatUpdate
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.LEASH, { onEnter: this.onLeashEnter, onUpdate: this.onLeashUpdate, onExit: this.onLeashExit })
            .addState(States.DEFEATED, { onEnter: this.onDefeatedEnter, onUpdate: this.onDefeatedUpdate, onExit: this.onDefeatedExit })
            .addState(States.EVADE, { onEnter: this.onEvasionEnter, onUpdate: this.onEvasionUpdate }) // onExit: this.onEvasionExit
            .addState(States.HURT, { onEnter: this.onHurtEnter, onUpdate: this.onHurtUpdate, onExit: this.onHurtExit })
            .addState(States.CONTEMPLATE, { onEnter: this.onContemplateEnter, onUpdate: this.onContemplateUpdate }) // , onExit: this.onContemplateExit
            .addState(States.PERSUASION, { onEnter: this.onPersuasionEnter, onUpdate: this.onPersuasionUpdate, onExit: this.onPersuasionExit }) // , onExit: this.onContemplateExit
            .addState(States.LUCKOUT, { onEnter: this.onLuckoutEnter, onUpdate: this.onLuckoutUpdate, onExit: this.onLuckoutExit }) // , onExit: this.onContemplateExit
            .addState(States.ATTACK, { onEnter: this.onAttackEnter, onUpdate: this.onAttackUpdate, onExit: this.onAttackExit })
            .addState(States.PARRY, { onEnter: this.onParryEnter, onUpdate: this.onParryUpdate, onExit: this.onParryExit })
            .addState(States.DODGE, { onEnter: this.onDodgeEnter, onUpdate: this.onDodgeUpdate, onExit: this.onDodgeExit })
            .addState(States.HURL, { onEnter: this.onHurlEnter, onUpdate: this.onHurlUpdate, onExit: this.onHurlExit })
            .addState(States.JUMP, { onEnter: this.onJumpEnter, onUpdate: this.onJumpUpdate, onExit: this.onJumpExit })
            .addState(States.POSTURE, { onEnter: this.onPostureEnter, onUpdate: this.onPostureUpdate, onExit: this.onPostureExit })
            .addState(States.ROLL, { onEnter: this.onRollEnter, onUpdate: this.onRollUpdate, onExit: this.onRollExit }) // onGrappleRollEnter
            .addState(States.GRAPPLING_ROLL, { onEnter: this.onGrappleRollEnter, onUpdate: this.onGrappleRollUpdate, onExit: this.onGrappleRollExit }) // onGrappleRollEnter
            .addState(States.THRUST, { onEnter: this.onThrustEnter, onUpdate: this.onThrustUpdate, onExit: this.onThrustExit })
            .addState(States.COMPUTER_ATTACK, { onEnter: this.onComputerAttackEnter, onUpdate: this.onComputerAttackUpdate, onExit: this.onComputerAttackExit })
            .addState(States.COMPUTER_PARRY, { onEnter: this.onComputerParryEnter, onUpdate: this.onComputerParryUpdate, onExit: this.onComputerParryExit })
            .addState(States.COMPUTER_POSTURE, { onEnter: this.onComputerPostureEnter, onUpdate: this.onComputerPostureUpdate, onExit: this.onComputerPostureExit })
            .addState(States.COMPUTER_THRUST, { onEnter: this.onComputerThrustEnter, onUpdate: this.onComputerThrustUpdate, onExit: this.onComputerThrustExit })
            .addState(States.STUN, { onEnter: this.onStunnedEnter, onUpdate: this.onStunnedUpdate, onExit: this.onStunnedExit })
            .addState(States.ARC, { onEnter: this.onArcEnter, onUpdate: this.onArcUpdate, onExit: this.onArcExit })
            .addState(States.ACHIRE, { onEnter: this.onAchireEnter, onUpdate: this.onAchireUpdate, onExit: this.onAchireExit })
            .addState(States.ASTRAVE, { onEnter: this.onAstraveEnter, onUpdate: this.onAstraveUpdate, onExit: this.onAstraveExit })
            .addState(States.BLINK, { onEnter: this.onBlinkEnter, onUpdate: this.onBlinkUpdate })
            .addState(States.LIGHTNING, { onEnter: this.onLightningEnter, onUpdate: this.onLightningUpdate, onExit: this.onLightningExit })
            .addState(States.CHARM, { onEnter: this.onCharmEnter, onUpdate: this.onCharmUpdate, onExit: this.onCharmExit })
            .addState(States.CHIOMISM, { onEnter: this.onChiomismEnter, onUpdate: this.onChiomismUpdate, onExit: this.onChiomismExit })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.CONSUME, { onEnter: this.onConsumeEnter, onUpdate: this.onConsumeUpdate, onExit: this.onConsumeExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onUpdate: this.onDesperationUpdate, onExit: this.onDesperationExit })
            .addState(States.FEAR, { onEnter: this.onFearingEnter, onUpdate: this.onFearingUpdate, onExit: this.onFearingExit })
            .addState(States.FROST, { onEnter: this.onFrostEnter, onUpdate: this.onFrostUpdate, onExit: this.onFrostExit })
            .addState(States.FYERUS, { onEnter: this.onFyerusEnter, onUpdate: this.onFyerusUpdate, onExit: this.onFyerusExit })
            .addState(States.HEALING, { onEnter: this.onHealingEnter, onUpdate: this.onHealingUpdate, onExit: this.onHealingExit })
            .addState(States.GRAPPLING_HOOK, { onEnter: this.onGrapplingHookEnter, onUpdate: this.onGrapplingHookUpdate, onExit: this.onGrapplingHookExit })
            .addState(States.HOOK, { onEnter: this.onHookEnter, onUpdate: this.onHookUpdate, onExit: this.onHookExit })
            .addState(States.ILIRECH, { onEnter: this.onIlirechEnter, onUpdate: this.onIlirechUpdate, onExit: this.onIlirechExit })
            .addState(States.INVOKE, { onEnter: this.onInvokeEnter, onUpdate: this.onInvokeUpdate, onExit: this.onInvokeExit })
            .addState(States.KYNISOS, { onEnter: this.onKynisosEnter, onUpdate: this.onKynisosUpdate, onExit: this.onKynisosExit })
            .addState(States.KYRISIAN, { onEnter: this.onKyrisianEnter, onUpdate: this.onKyrisianUpdate, onExit: this.onKyrisianExit })
            .addState(States.KYRNAICISM, { onEnter: this.onKyrnaicismEnter, onUpdate: this.onKyrnaicismUpdate, onExit: this.onKyrnaicismExit })
            .addState(States.LEAP, { onEnter: this.onLeapEnter, onUpdate: this.onLeapUpdate, onExit: this.onLeapExit })
            .addState(States.LIKYR, { onEnter: this.onLikyrEnter, onUpdate: this.onLikyrUpdate, onExit: this.onLikyrExit })
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
            .addState(States.PARALYZED, { onEnter: this.onParalyzedEnter, onUpdate: this.onParalyzedUpdate, onExit: this.onParalyzedExit })
            .addState(States.POLYMORPHED, { onEnter: this.onPolymorphedEnter, onUpdate: this.onPolymorphedUpdate, onExit: this.onPolymorphedExit });
        this.stateMachine.setState(States.IDLE);

        this.positiveMachine = new StateMachine(this, "player");
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
            .addState(States.REIN, { onEnter: this.onReinEnter, onUpdate: this.onReinUpdate })
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
            
        this.negativeMachine = new StateMachine(this, "player");
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

    specialCombatText = (playerSpecialDescription: string): void => {
        EventBus.emit("special-combat-text", { playerSpecialDescription });
    };

    health = () => this.scene.state.playerHealth / 20;

    levelModifier = () => (this.scene.state.player?.level as number + 9) / 10;

    mastery = () => this.scene.state.player?.[this.scene.state.player?.mastery];

    chiomism = (id: string, power: number, type: string) => {
        // console.log({ id, power, type });
        power = this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId() || id === this.player.playerID) {
            this.scene.combatManager.combatMachine.action({ type: "Chiomic", data: {power, type} }); 
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return; // this.health()
            const chiomic = Math.round(this.mastery() * (1 + power / CHIOMISM) * this.scene.combatManager.playerCaerenicPro() 
                * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
                * (this.levelModifier() ** 2));
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your ${type} flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            // console.log("chiomic", chiomic, enemy.health, newComputerHealth);
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: newComputerHealth, id } });
        };
        this.scene.combatManager.hitFeedbackSystem.spotEmit(this.player.spellTarget, "Pierce");
    };

    devour = (power: number) => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === this.player.spellTarget);
        if (this.player.isCasting === false || !enemy || enemy.health <= 0) {
            this.player.isCasting = false;
            this.player.devourTimer?.remove(false);
            this.player.devourTimer = undefined;
            return;
        };
        if (this.player.spellTarget === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: "Tshaeral", data: 4 });
        } else {
            const drained = Math.round(this.scene.state.playerHealth * power * this.scene.combatManager.playerCaerenicPro() * (this.levelModifier() ** 2));
            const newPlayerHealth = drained / this.scene.state.playerHealth * 100;
            const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
            const playerActionDescription = `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "player", value: newPlayerHealth, id: this.player.playerID } });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: newHealth, id: this.player.spellTarget } });
        };
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.player.x, this.player.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(this.player.spellTarget, "Pierce");
    };

    kyrnaicism = (power: number) => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === this.player.spellTarget);
        if (this.player.isCasting === false || !enemy || enemy.health <= 0) {
            this.player.isCasting = false;
            this.player.chiomicTimer?.remove(false);
            this.player.chiomicTimer = undefined;
            return;
        };
        this.scene.combatManager.slow(this.player.spellTarget, 1000);
        power = this.player.entropicMultiplier(power);
        if (this.player.spellTarget === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: "Chiomic", data: {power, type:"kyrnaicism"} });
        } else {
            const chiomic = Math.round(this.mastery() * (1 + (power / CHIOMISM))
                * this.scene.combatManager.playerCaerenicPro()
                * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
                * (this.levelModifier() ** 2));
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your kyrnaicism rips ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: newComputerHealth, id: this.player.spellTarget } });
        };
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.hitFeedbackSystem.spotEmit(this.player.spellTarget, "Spooky");
    };

    sacrifice = (id: string, power: number) => {
        power = this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: "Sacrifice", data: power });
            this.player.currentTarget?.flickerCaerenic(750);
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const sacrifice = Math.round(this.mastery() * this.scene.combatManager.playerCaerenicPro() 
                * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
                * (this.levelModifier() ** 2));
            const sacDam = sacrifice / 2 * this.scene.combatManager.playerStalwart();
            let playerSacrifice = this.scene.state.newPlayerHealth - sacDam < 0 ? 0 : this.scene.state.newPlayerHealth - sacDam;
            let enemySacrifice = enemy.health - (sacrifice * (1 + power / SACRIFICE)) < 0 ? 0 : enemy.health - (sacrifice * (1 + power / SACRIFICE));
            const playerActionDescription = `You sacrifice ${sacDam} health to rip ${sacrifice} from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Set Health", data: { key: "player", value: playerSacrifice, id } });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: enemySacrifice, id } });
            enemy.flickerCaerenic(750);    
        };
        this.scene.combatManager.hitFeedbackSystem.spotEmit(this.player.spellTarget, "Spooky");
        this.scene.combatManager.hitFeedbackSystem.bleed(new Phaser.Math.Vector2(this.player.x, this.player.y));
    };

    suture = (id: string, power: number) => {
        power = this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: "Suture", data: power });
            this.player.currentTarget?.flickerCaerenic(750);
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const suture = Math.round(this.mastery() * this.scene.combatManager.playerCaerenicPro() 
                * this.scene.combatManager.computerCaerenicNeg(enemy) * this.scene.combatManager.computerStalwart(enemy)
                * (this.levelModifier() ** 2)) * (1 * power / SUTURE);
            let playerSuture = this.scene.state.newPlayerHealth + suture > this.scene.state.playerHealth ? this.scene.state.playerHealth : this.scene.state.newPlayerHealth + suture;
            let enemySuture = enemy.health - suture < 0 ? 0 : enemy.health - suture;                    
            const playerActionDescription = `You suture ${enemy.ascean?.name}s caeren into you, absorbing and healing for ${suture}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Set Health", data: { key: "player", value: playerSuture, id } });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: enemySuture, id } });
            enemy.flickerCaerenic(750);
        };
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.player.x, this.player.y));
        this.scene.combatManager.hitFeedbackSystem.spotEmit(this.player.spellTarget, "Righteous");
    };

    getHeal = (power: number) => {
        this.scene.combatManager.combatMachine.action({ data: { key: "player", value: power, id: this.player.playerID }, type: "Health" });
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.player.x, this.player.y));
    };

    healCheck = (power: number) => {
        if (this.player.currentTarget?.name === "party") {
            const partyMember = this.scene.party.find((e: Party) => e.enemyID === this.player.currentTarget?.enemyID);
            if (partyMember) {
                partyMember.playerMachine.heal(power / 100);
                return;
            };
        };
        if (this.player.isComputer) {
            const playerRatio = this.scene.state.newPlayerHealth / this.scene.state.playerHealth;
            let mostInjured: Party | undefined = undefined;
            let lowestRatio = 1;
    
            for (const partyMember of this.scene.party) {
                const ratio = partyMember.health / partyMember.ascean.health.max;
                if (ratio < lowestRatio) {
                    mostInjured = partyMember;
                    lowestRatio = ratio;
                };
            };
            if (mostInjured && lowestRatio < playerRatio) {
                mostInjured.playerMachine.heal(power / 100);
                return;
            };
        };
        this.scene.combatManager.combatMachine.action({ data: { key: "player", value: power, id: this.player.playerID }, type: "Health" });
        this.scene.combatManager.hitFeedbackSystem.healing(new Phaser.Math.Vector2(this.player.x, this.player.y));
    };

    /*
        Tries to assess best ability from myriad concerns
        Health of the Player, Enemy, Party
        Distance between Player and Enemy
        Choices in settings of how the Player Computer acts
    */
    instincts = () => {
        if (!this.player.inCombat || this.player.health <= 0) {
            this.player.inCombat = false;
            return;
        };
        this.player.isMoving = false;
        this.player.setVelocity(0);
        const ranged = this.player.isRanged;
        let chance = [1, 2, 3, 4, 5, (!ranged ? 6 : 7), (!ranged ? 8 : 9), (!ranged ? 10 : 11), (!ranged ? 12 : 13)][Math.floor(Math.random() * 9)];
        let mastery = this.player.ascean.mastery;
        let pHealth = this.player.health / this.player.ascean.health.max;
        let eHealth = this.scene.state.newComputerHealth / this.scene.state.computerHealth;
        let oHealth = 1;

        for (const party of this.scene.party) {
            const ratio = party.health / party.ascean.health.max;
            if (ratio < oHealth) {
                oHealth = ratio;
            };
        };

        const direction = this.player.currentTarget?.position.subtract(this.player.position);
        const distance = direction?.length() || 0;

        let instinct =
            (pHealth <= 0.25 || oHealth <= 0.25) ? 0 :
            (pHealth <= 0.5 || oHealth <= 0.5) ? 1 :
            ((pHealth >= 0.7 && pHealth <= 0.9) || (oHealth >= 0.7 && oHealth <= 0.9)) ? 2 :

            eHealth <= 0.35 ? 3 :
            eHealth <= 0.6 ? 4 :
            eHealth >= 0.85 ? 5 :
            
            (distance <= 75 && !ranged) ? 6 :
            (distance <= 75 && ranged) ? 7 :

            (distance > 75 && distance <= 150 && !ranged) ? 8 :
            (distance > 75 && distance <= 150 && ranged) ? 9 :

            (distance > 150 && distance <= 225 && !ranged) ? 10 :
            (distance > 150 && distance <= 225 && ranged) ? 11 :

            (distance > 225 && !ranged) ? 12 :
            (distance > 225 && ranged) ? 13 :

            chance;

        if (this.player.prevInstinct === instinct) instinct = chance;

        const focus = this.scene.hud.settings.computerFocus || BALANCED;
        let foci;
        switch (focus) {
            case BALANCED:
                foci = BALANCED_INSTINCTS[mastery];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case DEFENSIVE:
                foci = DEFENSIVE_INSTINCTS[mastery];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case OFFENSIVE:
                foci = OFFENSIVE_INSTINCTS[mastery];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
        };

        let key = PLAYER_INSTINCTS[mastery][instinct].key, value = PLAYER_INSTINCTS[mastery][instinct].value;
        let finals = [instinct, foci];
        if (instinct === 0 || instinct === 3 || instinct === 7 || instinct === 12) {
            finals.push(instinct);
        };

        let final = finals[Math.floor(Math.random() * finals.length)];

        if (final === typeof "string") {
            if (specialStateMachines.includes(final)) {
                key = STATE;
                value = final;
            } else {
                key = POSITIVE;
                value = final;
            };
        };

        // const specials = this.scene.hud.settings.totalSpecials;
        // const specific = this.scene.hud.settings.specials;

        let check: {success:boolean;cost:number;} = {success:false,cost:0};
        const grace = PLAYER.STAMINA[value.toUpperCase()];
        check = staminaCheck(this.player.grace, grace);

        if (check.success === true) {
            this.scene.showCombatText(this.player, "Instinct", 750, HUSH, false, true);
            this.scene.hud.logger.log(`Your instinct leads you to ${value}.`);
            this.player.prevInstinct = instinct;
            (this as any)[key].setState(value);
            if (key === POSITIVE) this.stateMachine.setState(States.CHASE);
        } else {
            this.scene.showCombatText(this.player, "Compose Yourself", 750, "dread", false, true);
            this.scene.combatManager.useGrace(-5);
            if (Math.random() > 0.5) {
                this.stateMachine.setState(States.IDLE);
            } else {
                this.stateMachine.setState(States.CHASE);
            };
        };
    };

    onHurtEnter = () => {
        this.player.clearAnimations();
        this.player.clearTint();
        this.player.setVelocity(0);
        // this.player.setStatic(true);
        this.player.hurtTime = 0;
        this.player.anims.play(FRAMES.HURT, true);
    };
    onHurtUpdate = (dt: number) => {
        this.player.setVelocity(0);
        this.player.hurtTime += dt;
        if (this.player.hurtTime >= 500) this.player.isHurt = false;
        if (!this.player.isHurt) {
            if (this.player.inCombat === true && this.player.health > 0) {
                if (this.player.isComputer) {
                    this.stateMachine.setState(States.CHASE);
                } else {
                    this.stateMachine.setState(States.IDLE);
                };
            } else if (this.player.health > 0) {
                this.stateMachine.setState(States.IDLE);
            };
        };
    };
    onHurtExit = () => {
        this.player.isHurt = false;
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        // this.player.setStatic(false);
    };

    onChaseEnter = () => {
        if (!this.player.currentTarget || !this.player.currentTarget.body || !this.player.currentTarget.position) return;
        this.player.setVelocity(0);
        this.player.handleIdleAnimations();
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
        if (!this.player.inCombat) {
            this.stateMachine.setState(States.IDLE);
            return;
        };
        
        const rangeMultiplier = this.player.rangedDistanceMultiplier(3);
        const direction = this.player.currentTarget.position.subtract(this.player.position);
        const distance = direction.length();

        if (distance >= 150 * rangeMultiplier) {
            if (this.player.path && this.player.path.length > 1) {
                this.player.setVelocity(this.player.pathDirection.x * this.player.speed, this.player.pathDirection.y * this.player.speed);
            } else {
                if (this.player.isPathing) this.player.isPathing = false;
                direction.normalize();
                this.player.setVelocity(direction.x * this.player.speed, direction.y * this.player.speed);
            };
            this.player.handleMovementAnimations();
        } else if (distance >= 60 * rangeMultiplier) {
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
                    if (this.player.currentAction) return;
                    if (Math.random() > 0.5 && !this.player.isRolling && !this.player.isDodging) {
                        this.stateMachine.setState(States.ROLL);
                    } else if (!this.player.isDodging && !this.player.isRolling) {
                        this.stateMachine.setState(States.DODGE);
                    };
                }, undefined, this);
            };
            this.player.handleMovementAnimations();
        } else {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        };
    }; 
    onChaseExit = () => {
        // this.scene.navMesh.debugDrawClear();
        if (this.player.chaseTimer) {
            this.player.chaseTimer?.remove(false);
            this.player.chaseTimer.destroy();
            this.player.chaseTimer = undefined;
        };
    };

    onLeashEnter = () => {
        this.player.inCombat = false;
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
            this.player.handleMovementAnimations();
        } else {
            this.stateMachine.setState(States.IDLE);
        };
    };
    onLeashExit = () => {
        this.player.setVelocity(0);
        if (this.player.leashTimer) {
            this.player.leashTimer.remove(false);
            this.player.leashTimer?.destroy();
            this.player.leashTimer = undefined;
        };
        // this.scene.navMesh.debugDrawClear(); 
    };

    onDefeatedEnter = () => {
        this.player.anims.play(FRAMES.DEATH, true);
        this.player.setVelocity(0);
        this.player.clearEnemies();
        this.player.disengage();
        this.player.health = 0;
        this.player.isHurt = false;
        this.player.isDefeated = true;
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.scene.showCombatText(this.player, "Defeated", 3000, DAMAGE, false, true);
        this.player.defeatedDuration = PLAYER.DURATIONS.DEFEATED;
        this.player.setCollisionCategory(0);
        screenShake(this.scene, 80, 0.0035);
    };
    onDefeatedUpdate = (dt: number) => {
        this.player.defeatedDuration -= dt;
        if (this.player.defeatedDuration <= 0) {
            this.player.anims.playReverse(FRAMES.DEATH, true).once("animationcomplete", () => this.player.isDefeated = false, this.player);
        };
        this.player.combatChecker(this.player.isDefeated);
    };
    onDefeatedExit = () => {
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
        this.player.isDefeated = false;
        this.player.defeatedDuration = PLAYER.DURATIONS.DEFEATED;
        this.player.setCollisionCategory(1);
        this.player.spriteWeapon.setVisible(true);
        if (this.player.isStalwart) this.player.spriteShield.setVisible(true);
        this.scene.combatManager.combatMachine.action({ data: { key: "player", value: 10, id: this.player.playerID }, type: "Health" });
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
    };
    onEvasionUpdate = (dt: number) => {
        this.player.evasionTime -= dt;
        if (this.player.isDodging === true) this.player.anims.play("player_slide", true);
        if (this.player.isRolling === true) this.player.anims.play("player_roll", true);
        if ((!this.player.isDodging && !this.player.isRolling) || this.player.evasionTime <= 0) {
            this.player.evasionTime = 0;
            this.player.isDodging = false;
            this.player.isRolling = false;
            this.stateMachine.setState(States.CHASE);
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

    onContemplateEnter = () => {
        if (this.player.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.player.inCombat = false;
            this.stateMachine.setState(States.IDLE);
            return;
        };
        this.player.isContemplating = true;
        this.player.isMoving = false;
        this.player.setVelocity(0);
        this.player.contemplationTime = Phaser.Math.Between(250, 500);
        this.scene.time.delayedCall(Phaser.Math.Between(250, 500), () => {
            this.player.isContemplating = false;
            this.player.currentAction = "";
            this.instincts();
        }, undefined, this);
    };
    onContemplateUpdate = (_dt: number) => this.player.handleIdleAnimations();
    
    onIdleEnter = () => {
        this.player.setVelocity(0);
        if (this.player.isComputer && this.player.inCombat && !this.player.computerAction) {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        };
    };
    onIdleUpdate = (_dt: number) => {
        if (this.player.velMoving()) {
            this.stateMachine.setState(States.MOVING);
            return;
        };
        this.player.handleIdleAnimations();
    };
    onIdleExit = () => {};
    
    onMovingEnter = () => {
        this.player.isMoving = true;
        if (this.player.isComputer && this.player.inCombat && !this.player.computerAction) {
            this.stateMachine.setState(States.COMPUTER_COMBAT);
        };
    };
    onMovingUpdate = (_dt: number) => {
        if (!this.player.velMoving()) {
            this.stateMachine.setState(States.IDLE);
            return;
        };
        this.player.handleMovementAnimations();
    };
    onMovingExit = () => this.player.isMoving = false;
    
    onComputerCombatEnter = () => {
        if (this.player.inCombat === false || this.player.health <= 0) {
            this.player.inCombat = false;
            return;
        };
        if (this.player.isSuffering() || this.player.isCasting || this.player.isPraying || this.player.isContemplating || this.player.computerAction) {
            return;
        };
        this.player.computerAction = true;
        this.scene.time.delayedCall(this.player.swingTimer, () => {
            this.player.computerAction = false;
            (this.player as PlayerComputer).evaluateCombat();
        }, undefined, this);
    };
    onComputerCombatUpdate = (_dt: number) => (this.player as PlayerComputer).evaluateCombatDistance();

    onComputerAttackEnter = () => {
        this.player.isAttacking = true;
        if (this.player.checkTalentOptimized(States.ATTACK)) {
            this.player.adjustSpeed(2);
            if (!this.player.isCaerenic && !this.player.isGlowing) this.player.checkCaerenic(true);
        };
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_ATTACK);
        this.player.anims.play(FRAMES.ATTACK, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isAttacking = false);
    };
    onComputerAttackUpdate = (_dt: number) => {
        if (!this.player.isAttacking) this.stateMachine.setState(States.CHASE);
        sprint(this.scene);
    };
    onComputerAttackExit = () => {
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.computerAction = false;
        this.player.isAttacking = false;
        if (this.player.checkTalentOptimized(States.ATTACK)) {
            this.player.adjustSpeed(-2);
            if (!this.player.isCaerenic && this.player.isGlowing) this.player.checkCaerenic(false); 
        };
    };

    onComputerParryEnter = () => {
        this.player.isParrying = true;
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_PARRY);
        if (this.player.hasMagic === true) {
            this.scene.showCombatText(this.player, "Counter Spell", 1000, HUSH, false, true);
            this.player.isCounterSpelling = true;
            this.player.flickerCaerenic(1000); 
            this.scene.time.delayedCall(1000, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
        this.player.anims.play(FRAMES.PARRY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isParrying = false);
    };
    onComputerParryUpdate = (_dt: number) => {
        if (!this.player.isParrying) this.stateMachine.setState(States.CHASE);
    };
    onComputerParryExit = () => {
        this.player.isParrying = false;
        this.player.currentAction = "";
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.computerAction = false;
    };

    onComputerPostureEnter = () => {
        this.player.isPosturing = true;
        this.player.spriteShield.setVisible(true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_POSTURE);
        this.player.anims.play(FRAMES.POSTURE, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isPosturing = false);
    };
    onComputerPostureUpdate = (_dt: number) => {
        if (!this.player.isPosturing) this.stateMachine.setState(States.CHASE);
        sprint(this.scene);
    };
    onComputerPostureExit = () => {
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.spriteShield.setVisible(this.player.isStalwart);
        this.player.computerAction = false;
        this.player.isPosturing = false;
    };

    onComputerThrustEnter = () => {
        this.player.isThrusting = true;
        if (this.player.checkTalentOptimized(States.THRUST)) {
            this.player.adjustSpeed(2);
            if (!this.player.isCaerenic && !this.player.isGlowing) this.player.checkCaerenic(true);
        };
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_THRUST);
        this.player.anims.play(FRAMES.THRUST, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isThrusting = false);
    };
    onComputerThrustUpdate = (_dt: number) => {
        if (!this.player.isThrusting) this.stateMachine.setState(States.CHASE);
        sprint(this.scene);
    };
    onComputerThrustExit = () => {
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.computerAction = false;
        this.player.isThrusting = false;
        if (this.player.checkTalentOptimized(States.THRUST)) {
            this.player.adjustSpeed(-2);
            if (!this.player.isCaerenic && this.player.isGlowing) this.player.checkCaerenic(false); 
        };
    };

    onAttackEnter = () => {
        // if (this.player.isPosturing || this.player.isParrying || this.player.isThrusting) return;
        if (this.player.isRanged === true && this.player.inCombat === true) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct) {
                this.scene.showCombatText(this.player, "Skill Issue: Look at the Enemy!", 1000, DAMAGE, false, true);
                return;
            };
        };
        this.player.isAttacking = true;
        if (this.player.checkTalentOptimized(States.ATTACK)) {
            this.player.adjustSpeed(2);
            if (!this.player.isCaerenic && !this.player.isGlowing) this.player.checkCaerenic(true);
        };
        this.player.swingReset(States.ATTACK);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.ATTACK);
        this.player.anims.play(FRAMES.ATTACK, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isAttacking = false);
    }; 
    onAttackUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isAttacking);
        sprint(this.scene);
    }; 
    onAttackExit = () => {
        if (this.scene.state.action === "attack") this.scene.combatManager.combatMachine.input("action", ""); 
        this.player.computerAction = false; 
        this.player.isAttacking = false;
        if (this.player.checkTalentOptimized(States.ATTACK)) {
            this.player.adjustSpeed(-2);
            if (!this.player.isCaerenic && this.player.isGlowing) this.player.checkCaerenic(false); 
        };
    };

    onHurlEnter = () => {
        if (!this.player.isRanged) {
            this.scene.showCombatText(this.player, "Skill Issue: You're not using a ranged weapon!", 1000, DAMAGE, false, true);
            return;
        };
        this.player.isHurling = true;
        this.player.swingReset(States.HURL);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.HURL);
        this.player.anims.play(FRAMES.HURL, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isHurling = false);
    }; 
    onHurlUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isHurling);
        sprint(this.scene);
    }; 
    onHurlExit = () => {
        this.player.computerAction = false; 
        this.player.isHurling = false;
    };

    onJumpEnter = () => {
        screenShake(this.scene);
        this.player.swingReset(States.JUMP);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.JUMP);
        this.player.isJumping = true;
        const force = 0.5;
        const forceX = this.player.velocity?.x as number === 0 ? 0 : this.player.velocity?.x as number > 0 ? force : -force;
        const forceY = this.player.velocity?.y as number === 0 ? 0 : this.player.velocity?.y as number > 0 ? force : -force;
        const body = this.player.body as MatterJS.Body;
        this.scene.matter.world.remove(body, false);
        const vertical = forceX === 0;
        const hop = forceY === 0;
        const chunk = this.scene.loadedChunks.get(`${this.scene.playerChunkX},${this.scene.playerChunkY}`);
        let x, y;
        if (chunk) {
            x = chunk.map.widthInPixels;
            y = chunk.map.heightInPixels;
        } else {
            x = this.scene.map.widthInPixels;
            y = this.scene.map.heightInPixels;
        };
        this.scene.tweens.add({
            targets: this.player.spriteWeapon,
            scale: this.player.spriteWeapon.scale * 1.25,
            duration: 500,
            ease: 'Power1',
            yoyo: true,
        });
        this.scene.tweens.add({
            targets: this.player.spriteShield,
            scale: this.player.spriteShield.scale * 1.25,
            duration: 500,
            ease: 'Power1',
            yoyo: true,
        });
        this.scene.tweens.add({
            targets: this.player,
            scale: 0.95,
            duration: 500,
            ease: 'Power1',
            yoyo: true,
            onUpdate: () => {
                this.player.x += vertical ? (this.player.jumpTime <= 600 ? forceX : -forceX) : forceX;
                this.player.y += hop ? (this.player.jumpTime <= 600 ? -force : force) : forceY;
            },
            onComplete: () => {
                this.scene.matter.world.add(body);
                if (!chunk) {
                    if (this.player.x as number > x) {
                        this.player.setPosition(x - 32, this.player.y);
                    } else if (this.player.x as number < 0) {
                        this.player.setPosition(32, this.player.y);
                    };
                    if (this.player.y as number > y) {
                        this.player.setPosition(this.player.x, y - 32);
                    } else if (this.player.y as number < 0) {
                        this.player.setPosition(this.player.x, 32);
                    };
                };
            }
        });
        this.player.anims.play(FRAMES.JUMP, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isJumping = false); // () => this.anims.play(FRAMES.LAND).on(FRAMES.ANIMATION_COMPLETE,
    };
    onJumpUpdate = (dt: number) => {
        this.player.jumpTime += dt;
        this.player.combatChecker(this.player.isJumping);
    };
    onJumpExit = () => {
        this.player.jumpTime = 0;
        this.player.isJumping = false;
    };

    onParryEnter = () => {
        this.player.isParrying = true;    
        this.player.swingReset(States.PARRY);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.PARRY);
        if (this.player.hasMagic === true) {
            this.scene.showCombatText(this.player, "Counter Spell", 1000, HUSH, false, true);
            this.player.isCounterSpelling = true;
            this.player.flickerCaerenic(500); 
            this.scene.time.delayedCall(500, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
        this.player.anims.play(FRAMES.PARRY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isParrying = false);
    };
    onParryUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isParrying);
    };
    onParryExit = () => {
        if (this.scene.state.action === States.PARRY) this.scene.combatManager.combatMachine.input("action", "");
        this.player.computerAction = false;
        this.player.isParrying = false;
    };

    onPostureEnter = () => {
        if (this.player.isRanged === true) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct && this.player.inCombat === true) {
                this.scene.showCombatText(this.player, "Skill Issue: Look at the Enemy!", 1000, DAMAGE, false, true);
                return;
            };
        };
        this.player.isPosturing = true;
        this.player.spriteShield.setVisible(true);
        this.player.swingReset(States.POSTURE);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.POSTURE);
        this.player.anims.play(FRAMES.POSTURE, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isPosturing = false);
        this.player.setStatic(true); // Experimental
    };
    onPostureUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isPosturing);
        sprint(this.scene);
    };
    onPostureExit = () => {
        this.scene.combatManager.combatMachine.input("action", ""); 
        this.player.spriteShield.setVisible(this.player.isStalwart); 
        this.player.computerAction = false;
        this.player.isPosturing = false;
        this.player.setStatic(false); // Experimental
    };

    onDodgeEnter = () => {
        if ((this.player.isStalwart && !this.scene.hud.talents.talents.stalwart.enhanced) || this.player.isStorming || this.player.isRolling) return;
        this.player.isDodging = true;
        this.scene.combatManager.useStamina(this.player.isComputer ? PLAYER.STAMINA.COMPUTER_DODGE : PLAYER.STAMINA.DODGE);
        if (!this.player.isComputer) this.player.swingReset(States.DODGE);
        this.scene.sound.play("dodge", { volume: this.scene.hud.settings.volume / 2 });
        this.player.wasFlipped = this.player.flipX;
        this.player.playerBodyDodge(true);
        this.player.anims.play(FRAMES.DODGE, true);
        this.player.playerDodge();
        if (this.scene.player.checkTalentEnhanced(States.DODGE)) {
            this.scene.combatManager.hitFeedbackSystem.trailing(this as any, true);
            if (!this.player.isCaerenic && !this.player.isGlowing) this.player.checkCaerenic(true);
        };
    };
    onDodgeUpdate = (_dt: number) => this.player.combatChecker(this.player.isDodging);
    onDodgeExit = () => {
        if ((this.player.isStalwart && !this.scene.hud.talents.talents.stalwart.enhanced) || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.computerAction = false;
        this.player.dodgeCooldown = 0;
        this.player.isDodging = false;
        this.player.playerBodyDodge(false);
        if (this.scene.player.checkTalentEnhanced(States.DODGE)) {
            this.scene.combatManager.hitFeedbackSystem.trailing(this as any, false);
            if (!this.player.isCaerenic && this.player.isGlowing) this.player.checkCaerenic(false); 
        };
    };

    onRollEnter = () => {
        if ((this.player.isStalwart && !this.scene.hud.talents.talents.stalwart.enhanced) || this.player.isStorming || this.player.isDodging) return;
        this.player.isRolling = true;
        this.scene.combatManager.useStamina(this.player.isComputer ? PLAYER.STAMINA.COMPUTER_ROLL : PLAYER.STAMINA.ROLL);
        if (!this.player.isComputer) this.player.swingReset(States.ROLL);
        this.scene.sound.play("roll", { volume: this.scene.hud.settings.volume / 2 });
        this.player.playerBodyRoll(true);
        this.player.anims.play(FRAMES.ROLL, true);
        this.player.playerRoll(true);    
    };
    onRollUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isRolling);
        sprint(this.scene);
    };
    onRollExit = () => {
        if ((this.player.isStalwart && !this.scene.hud.talents.talents.stalwart.enhanced) || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.rollCooldown = 0; 
        this.player.isRolling = false;
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.computerAction = false;
        this.player.playerBodyRoll(false);
    };

    onGrappleRollEnter = () => {
        this.scene.sound.play("roll", { volume: this.scene.hud.settings.volume / 2 });
        this.player.playerBodyRoll(true);
        this.player.anims.play(FRAMES.GRAPPLE_ROLL, true);
        this.player.playerRoll(false);
    };
    onGrappleRollUpdate = (dt: number) => {
        this.player.grappleTime -= dt;
        if (this.player.grappleTime <= 0) {
            this.player.combatChecker(false);
        };
        sprint(this.scene);
    };
    onGrappleRollExit = () => {
        this.player.spriteWeapon.setVisible(true);
        this.player.rollCooldown = 0;
        this.player.playerBodyRoll(false);
    };

    onThrustEnter = () => {
        if (this.player.isAttacking || this.player.isParrying || this.player.isPosturing) return;
        if (this.player.isRanged === true && !this.player.isComputer) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct && this.player.inCombat === true) {
                this.scene.showCombatText(this.player, "Skill Issue: Look at the Enemy!", 1000, DAMAGE, false, true);
                return;
            };
        };
        this.player.isThrusting = true;
        if (this.player.checkTalentOptimized(States.THRUST)) {
            this.player.adjustSpeed(2);
            if (!this.player.isCaerenic && !this.player.isGlowing) this.player.checkCaerenic(true);
        };
        this.player.swingReset(States.THRUST);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.THRUST);
        this.player.anims.play(FRAMES.THRUST, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isThrusting = false);
    };
    onThrustUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isThrusting);
        sprint(this.scene);
    };
    onThrustExit = () => {
        if (this.scene.state.action === "thrust") this.scene.combatManager.combatMachine.input("action", ""); 
        this.player.computerAction = false;
        this.player.isThrusting = false;
        if (this.player.checkTalentOptimized(States.THRUST)) {
            this.player.adjustSpeed(-2);
            if (!this.player.isCaerenic && this.player.isGlowing) this.player.checkCaerenic(false); 
        };
    };

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
        this.player.startCasting("Achire", PLAYER.DURATIONS.ACHIRE, false, false, false);
    };
    onAchireUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
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
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ACHIRE, PLAYER.COOLDOWNS.SHORT);
            this.specialCombatText(`Your Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0]?.name}.`);
            this.player.castingSuccess = false;
            this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.ACHIRE, PLAYER.STAMINA.ACHIRE);
            screenShake(this.scene, 80, 0.0035);
        };
        this.player.stopCasting();
    };

    onAstraveEnter = () => {
        this.player.startCasting("Astrave", PLAYER.DURATIONS.ASTRAVE, false);
    };
    onAstraveUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
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
            if (this.player.isComputer) {
                this.player.aoe = this.scene.aoePool.get("astrave", 1, false, undefined, false, this.player.currentTarget);    
            } else {
                this.player.aoe = this.scene.aoePool.get("astrave", 1, false, undefined, true);
                this.player.checkTalentCooldown(States.ASTRAVE, PLAYER.COOLDOWNS.MODERATE);
            };
            this.specialCombatText("You unearth the winds and lightning from the land of hush and tendril.");
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.ASTRAVE, PLAYER.STAMINA.ASTRAVE);
        };
        this.player.stopCasting();
    };

    onArcEnter = () => {
        this.player.isArcing = true;
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        this.player.castbar.setCastName("Arc");
        this.player.castbar.setTotal(PLAYER.DURATIONS.ARCING);
        this.player.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
        this.player.castbar.setVisible(true); 
        this.player.setVelocity(0);
        // this.player.setStatic(true);
        this.player.flickerCaerenic(3000);
        this.specialCombatText(`You begin arcing with your ${this.scene.state.weapons[0]?.name}.`);
    };
    onArcUpdate = (dt: number) => {
        this.player.setVelocity(0);
        if (this.player.moving()) this.player.isArcing = false;
        this.player.combatChecker(this.player.isArcing);
        if (this.player.isArcing) this.player.castbar.update(dt, "channel", "DAMAGE");
        if (this.player.castbar.time >= PLAYER.DURATIONS.ARCING * 0.25 && this.player.castbar.time <= PLAYER.DURATIONS.ARCING * 0.26) {
            this.player.isAttacking = true;
            this.scene.tweens.add({
                targets: this.player,
                scale: 1.2,
                ease: Phaser.Math.Easing.Elastic.InOut,
                duration: 400,
                yoyo: true
            });
        };
        if (this.player.castbar.time <= 0) {
            this.player.castingSuccess = true;
            this.player.isArcing = false;
        };
    };
    onArcExit = () => {
        if (this.player.castingSuccess === true) {
            screenShake(this.scene, 80, 0.0035);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ARC, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.player.checkTalentCost(States.ARC, PLAYER.STAMINA.ARC);
            const touch = this.player.touching.length;
            if (touch > 0) {
                this.player.lastHitLocation = {
                    location: HitLocation.CHEST,
                    hitPoint: {x:0,y:0},
                    relativePosition: {x:0,y:0}
                };
                for (let i = 0; i < touch; ++i) {
                    this.scene.combatManager.playerMelee(this.player.touching[i].enemyID, "arc");
                    if (this.player.checkTalentEnhanced(States.ARC)) this.scene.combatManager.stun(this.player.touching[i].enemyID);
                };
            };
        };
        this.player.castbar.reset();
        // this.player.setStatic(false);
    };

    onBlinkEnter = () => {
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        if (this.scene.scene.key === "Game") {
            if (this.player.velocity?.x as number > 0) {
                this.player.setPosition(this.player.x + PLAYER.SPEED.BLINK, this.player.y);
            } else if (this.player.velocity?.x as number < 0) {
                this.player.setPosition(this.player.x - PLAYER.SPEED.BLINK, this.player.y);
            };
            if (this.player.velocity?.y as number > 0) {
                this.player.setPosition(this.player.x, this.player.y + PLAYER.SPEED.BLINK);
            } else if (this.player.velocity?.y as number < 0) {
                this.player.setPosition(this.player.x, this.player.y - PLAYER.SPEED.BLINK);
            };
        } else {
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
        };
        if (this.player.moving()) {
            this.player.checkTalentCost(States.BLINK, PLAYER.STAMINA.BLINK);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.BLINK, PLAYER.COOLDOWNS.SHORT);
            screenShake(this.scene);
            if (this.player.checkTalentEnhanced(States.BLINK)) {
                this.player.adjustSpeed(PLAYER.SPEED.SPRINT);
                this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT / 2, () => {
                    this.player.isSprinting = false;
                    this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);
                }, undefined, this);
            };
        };
        this.player.flickerCaerenic(750);
    };
    onBlinkUpdate = (_dt: number) => this.player.combatChecker(false);

    onLightningEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.startCasting("Chain Lightning", PLAYER.DURATIONS.LIGHTNING, true, false, false);    
    };
    onLightningUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.LIGHTNING) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onLightningExit = () => {
        if (this.player.castingSuccess === true) {
            const target = this.scene.combatManager.combatant(this.player.spellTarget);
            if (target) {
                if (this.player.checkTalentEnhanced(States.LIGHTNING)) {
                    this.scene.combatManager.hitFeedbackSystem.chainlightning.castGreaterLightning(this.player, target, true);
                    const types = LIGHTNING_MASTERY[this.player.ascean.mastery];
                    const type = types[Math.floor(Math.random() * types.length)];
                    this.scene.combatManager.hitFeedbackSystem.chainlightning.castShackle(this.player, target, type);
                } else {
                    // this.scene.combatManager.hitFeedbackSystem.chainlightning.castShackle(this.player, target, "DISEASE", true);
                    this.scene.combatManager.hitFeedbackSystem.chainlightning.castLightning(this.player, target, true);
                };
            };
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.LIGHTNING, PLAYER.COOLDOWNS.MODERATE);
            this.player.checkTalentCost(States.LIGHTNING, PLAYER.STAMINA.LIGHTNING);
            this.player.castingSuccess = false;
            this.specialCombatText(`You call down a bolt of lightning upon ${this.player.spellName}, arcing to nearby foes.`); 
        };
        this.player.stopCasting();
    };

    onCharmEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.startCasting("Charm", PLAYER.DURATIONS.CHARM);
    };
    onCharmUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CHARM) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onCharmExit = () => {
        if (this.player.castingSuccess === true) {
            const chance = Phaser.Math.Between(1, 100);
            const ceiling = this.player.checkTalentEnhanced(States.CHARM) ? 25 : 50;
            if (chance > ceiling) this.scene.combatManager.charm(this.player.spellTarget, this.player.checkTalentEnhanced(States.CHARM));
            this.specialCombatText(`You charm ${this.player.spellName} with tendrils of Kyrisos.`);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.CHARM, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.CHARM, PLAYER.STAMINA.CHARM);
        };
        this.player.stopCasting();
    };

    onChiomismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.startCasting("Chiomism", PLAYER.DURATIONS.CHIOMISM);
    };
    onChiomismUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CHIOMISM) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onChiomismExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 50);
            const chance = Phaser.Math.Between(1, 100);
            const ceiling = this.player.checkTalentEnhanced(States.CHIOMISM) ? 50 : 75;
            if (chance > ceiling) this.scene.combatManager.confuse(this.player.spellTarget, this.player.checkTalentEnhanced(States.CONFUSE));
            this.specialCombatText(`You bleed and laugh at ${this.player.spellName} with tendrils of Chiomyr.`);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.CHIOMISM, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("death", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.CHIOMISM, PLAYER.STAMINA.CHIOMISM);
        };
        this.player.stopCasting();
    };
    onConfuseEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.startCasting("Confuse", PLAYER.DURATIONS.CONFUSE);
    };
    onConfuseUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onConfuseExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.confuse(this.player.spellTarget, this.player.checkTalentEnhanced(States.CONFUSE));
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.CONFUSE, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("death", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.CONFUSE, PLAYER.STAMINA.CONFUSE);
            screenShake(this.scene);
            this.specialCombatText(`You confuse ${this.player.spellName}, and they stumble around in a daze.`);
        };
        this.player.stopCasting();
    };

    onConsumeEnter = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.player.isPraying = true;
        this.scene.sound.play("consume", { volume: this.scene.hud.settings.volume });
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CONSUME, PLAYER.COOLDOWNS.SHORT);
        this.player.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isPraying = false);
    };
    onConsumeUpdate = (_dt: number) => {
        this.player.combatChecker(this.player.isPraying);
    };
    onConsumeExit = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.scene.combatManager.combatMachine.action({ type: "Consume", data: this.scene.state.playerEffects[0].id });        
        this.player.checkTalentCost(States.CONSUME, PLAYER.STAMINA.CONSUME);
        if (this.player.checkTalentEnhanced(States.CONSUME)) {
            if (Math.random() > 0.5) this.scene.combatManager.combatMachine.action({ type: "Instant", data: this.scene.state.playerBlessing });
        };
    };

    onDesperationEnter = () => this.player.startPraying();
    onDesperationUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onDesperationExit = () => {
        if (this.player.health <= 0) return;
        this.scene.showCombatText(this.player, "Desperation", PLAYER.DURATIONS.HEALING / 2, HEAL, false, true);
        this.player.checkTalentCost(States.DESPERATION, PLAYER.STAMINA.DESPERATION);
        this.player.flickerCaerenic(PLAYER.DURATIONS.HEALING); 
        this.specialCombatText(`Your caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0]?.influences?.[0]} soothes your body.`);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DESPERATION, PLAYER.COOLDOWNS.LONG);
        const power = this.player.checkTalentEnhanced(States.DESPERATION) ? 100 : 50;
        this.healCheck(power);
        this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
    };

    onDevourEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.setVelocity(0);
        this.player.startCasting("Devour", PLAYER.DURATIONS.DEVOUR, true, true);
        this.player.currentTarget.isConsumed = true;
        this.player.currentTarget.stateMachine.setState(States.CONSUMED);
        this.player.checkTalentCost(States.DEVOUR, PLAYER.STAMINA.DEVOUR);
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.flickerCaerenic(2000);
        const power = this.player.checkTalentEnhanced(States.DEVOUR) ? 0.06 : 0.03;
        this.scene.tweens.add({
            targets: [this.player, this.player.spriteShield, this.player.spriteWeapon],
            scale: 0.9,
            ease: Phaser.Math.Easing.Back.InOut,
            duration: 250,
            yoyo: true,
            repeat: 1
        });
        this.player.devourTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => {
                if (this.player.isCasting) this.devour(power);
            },
            callbackScope: this,
            repeat: 8,
        });
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DEVOUR, PLAYER.COOLDOWNS.LONG);
        // this.player.setStatic(true);
    };
    onDevourUpdate = (dt: number) => {
        if (this.player.castbar.time <= 0) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", "TENDRIL");
    };
    onDevourExit = () => {
        this.player.stopCasting();
        // this.player.setStatic(false);
        if (this.player.devourTimer !== undefined) {
            this.player.devourTimer.remove(false);
            this.player.devourTimer = undefined;
        };
    };

    onFearingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.startCasting("Fear", PLAYER.DURATIONS.FEAR);
    };
    onFearingUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.FEAR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onFearingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.fear(this.player.spellTarget, this.player.checkTalentEnhanced(States.FEAR));
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.FEAR, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.FEAR, PLAYER.STAMINA.FEAR);
            screenShake(this.scene);
            this.specialCombatText(`You strike fear into ${this.scene.state.computer?.name}!`);
        };
        this.player.stopCasting();
    };

    onFrostEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.startCasting("Frost", PLAYER.DURATIONS.FROST);
    };
    onFrostUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.FROST) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onFrostExit = () => {
        if (this.player.castingSuccess === true) {
            this.specialCombatText(`You seize into this world with Nyrolean tendrils, slowing ${this.player.spellName}.`);
            this.chiomism(this.player.spellTarget, (50 + this.mastery()), "frost");
            if (this.player.checkTalentEnhanced(States.FROST)) {
                this.scene.combatManager.snare(this.player.spellTarget);
            } else {
                this.scene.combatManager.slow(this.player.spellTarget, 3000);
            };
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.FROST, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("frost", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.FROST, PLAYER.STAMINA.FROST);
        };
        this.player.stopCasting();
    };

    onFyerusEnter = () => {
        this.player.isCasting = true;
        this.player.castbar.setCastName("Fyerus");
        this.player.castbar.setTotal(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setTime(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setVisible(true);  
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);  
        if (this.player.isComputer) {
            this.player.aoe = this.scene.aoePool.get("fyerus", 6, false, undefined, false, this.player.currentTarget);    
        } else {
            this.player.aoe = this.scene.aoePool.get("fyerus", 6, false, undefined, true);    
        };
        this.scene.combatManager.useGrace(PLAYER.STAMINA.FYERUS);    
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.FYERUS, PLAYER.COOLDOWNS.SHORT);
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        this.specialCombatText("You unearth the fires and water from the land of hush and tendril.");
    };
    onFyerusUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        if (this.player.castbar.time <= 0) {
            this.player.isCasting = false;
        };
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, "channel", "FYERUS");
        };
    };
    onFyerusExit = () => {
        if (this.player.aoe) this.player.aoe.cleanAnimation(this.scene);
        this.player.castbar.reset();
        this.player.isCasting = false;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onHealingEnter = () => this.player.startCasting("Healing", PLAYER.DURATIONS.HEALING, false, false, false);
    onHealingUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.HEALING) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST, "HEAL");
    };
    onHealingExit = () => {
        if (this.player.castingSuccess === true) {
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.HEALING, PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost(States.HEALING, PLAYER.STAMINA.HEALING);
            this.player.castingSuccess = false;
            const power = this.player.checkTalentEnhanced(States.HEALING) ? 50 : 25;
            this.healCheck(power);
            this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
        };
        this.player.stopCasting();
    };

    onIlirechEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.startCasting("Ilirech", PLAYER.DURATIONS.ILIRECH);
    };
    onIlirechUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ILIRECH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onIlirechExit = () => {
        if (this.player.castingSuccess === true) {
            this.specialCombatText("You rip into this world with Ilian tendrils entwining.");
            this.chiomism(this.player.spellTarget, (25 + this.mastery()), "ilirech");
            if (this.player.checkTalentEnhanced(States.ILIRECH)) {
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) this.scene.combatManager.stun(this.player.spellTarget);
            };
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ILIRECH, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("fire", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.ILIRECH, PLAYER.STAMINA.ILIRECH);
        };
        this.player.stopCasting();
    };

    onInvokeEnter = () => {
        if (this.player.currentTarget === undefined || this.player.invalidTarget(this.player.currentTarget?.enemyID) || this.player.outOfRange(PLAYER.RANGE.LONG)) return;
        this.player.isPraying = true;
        this.player.setStatic(true);
        this.player.flickerCaerenic(1000); 
        this.player.invokeCooldown = 30;
        if (this.player.playerBlessing === "" || this.player.playerBlessing !== this.scene.state.playerBlessing) {
            this.player.playerBlessing = this.scene.state.playerBlessing;
        };
        this.player.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isPraying = false);
    };
    onInvokeUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onInvokeExit = () => {
        this.player.setStatic(false);
        if (this.player.currentTarget === undefined || this.player.currentTarget.health <= 0 || this.player.outOfRange(PLAYER.RANGE.LONG)) return;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.INVOKE, PLAYER.COOLDOWNS.LONG);
        this.scene.combatManager.combatMachine.action({ type: "Instant", data: this.scene.state.playerBlessing });
        if (this.player.checkTalentEnhanced(States.INVOKE)) {
            this.scene.time.delayedCall(1000, () => {
                this.scene.combatManager.combatMachine.action({ type: "Instant", data: this.scene.state.playerBlessing });
            }, undefined, this);
        };
        this.scene.sound.play("prayer", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.INVOKE, PLAYER.STAMINA.INVOKE);
    };

    onKynisosEnter = () => this.player.startCasting("Kynisos", PLAYER.DURATIONS.KYNISOS, false);
    onKynisosUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
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
            if (this.player.isComputer) {
                this.player.aoe = this.scene.aoePool.get("kynisos", 3, false, undefined, false, this.player.currentTarget);    
            } else {
                this.player.aoe = this.scene.aoePool.get("kynisos", 3, false, undefined, true);    
            };
            this.specialCombatText("You unearth the netting of the golden hunt.");
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.KYNISOS, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.KYNISOS);    
        };
        this.player.stopCasting();
    };

    onKyrisianEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.startCasting("Kyrisian", PLAYER.DURATIONS.KYRISIAN);
    };
    onKyrisianUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.KYRISIAN) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onKyrisianExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 50);
            const chance = Phaser.Math.Between(1, 100);
            const ceiling = this.player.checkTalentEnhanced(States.KYRISIAN) ? 50 : 75;
            if (chance > ceiling) this.scene.combatManager.paralyze(this.player.spellTarget);
            this.specialCombatText(`You bleed and bewitch ${this.player.spellName} with tendrils of Kyrisos.`);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.KYRISIAN, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.KYRISIAN, PLAYER.STAMINA.KYRISIAN);    
        };
        this.player.stopCasting();
    };

    onKyrnaicismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.startCasting("Kyrnaicism", PLAYER.DURATIONS.KYRNAICISM, true, true);
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.KYRNAICISM, PLAYER.STAMINA.KYRNAICISM);    
        this.player.flickerCaerenic(3000); 
        this.scene.combatManager.slow(this.player.spellTarget, 1000);
        this.player.currentTarget.isConsumed = true;
        this.player.currentTarget.stateMachine.setState(States.CONSUMED);
        const power = this.player.checkTalentEnhanced(States.KYRNAICISM) ? 40 : 20;
        this.player.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.kyrnaicism(power),
            callbackScope: this,
            repeat: 3,
        });
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.KYRNAICISM, PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => this.player.isCasting = false,
            callbackScope: this,
            loop: false,
        });
        this.player.setVelocity(0);
        // this.player.setStatic(true);
    };
    onKyrnaicismUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", "TENDRIL");
    };
    onKyrnaicismExit = () => {
        this.player.stopCasting();
        // this.player.setStatic(false);
        if (this.player.chiomicTimer) {
            this.player.chiomicTimer.remove(false);
            this.player.chiomicTimer = undefined;
        }; 
    };
    
    onLikyrEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.startCasting("Li'kyr", PLAYER.DURATIONS.LIKYR);
    };
    onLikyrUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.LIKYR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onLikyrExit = () => {
        if (this.player.castingSuccess === true) {
            this.specialCombatText("You blend caeren into this world with Likyrish tendrils entwining.");
            this.suture(this.player.spellTarget, 30);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.LIKYR, PLAYER.COOLDOWNS.MODERATE);
            if (this.player.checkTalentEnhanced(States.LIKYR)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Heal" });
            this.player.castingSuccess = false;
            this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.LIKYR, PLAYER.STAMINA.LIKYR);
        };
        this.player.stopCasting();
    };

    onLeapEnter = () => {
        this.player.leap();
    };
    onLeapUpdate = (_dt: number) => this.player.combatChecker(this.player.isLeaping);
    onLeapExit = () => {
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.LEAP, PLAYER.COOLDOWNS.SHORT);
        this.player.checkTalentCost(States.LEAP, PLAYER.STAMINA.LEAP);
        this.scene.combatManager.hitFeedbackSystem.trailing(this as any, false);
    };

    onLuckoutEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        const zero = this.player.buttonPressed.split(" ")[0].toLowerCase();
        const one = this.player.buttonPressed.split(" ")[1].toLowerCase();
        const duration = this.player.checkTalentEnhanced(zero.toLowerCase()) ? PLAYER.DURATIONS.LUCKOUT / 2 : PLAYER.DURATIONS.LUCKOUT;
        this.player.startCasting("Luckout", duration, true, true, false);
        this.player.luckoutLock = one;
        
        let luck = this.player.luckoutLock.split("(")[1].split(")")[0];
        const luckoutTrait = TRAIT_DESCRIPTIONS[luck.charAt(0).toUpperCase() + luck.slice(1)];
        const enemy = this.player.currentTarget;
        const influence = this.scene.state.weapons?.[0]?.influences?.[0] as string;

        const text = `${luckoutTrait?.luckout?.action
            .replace("{enemy.name}", enemy.ascean.name)
            .replace("{ascean.weaponOne.influences[0]}", influence)
            .replace("{ascean.name}", this.player.ascean.name)
            .replace("{enemy.weaponOne.influences[0]}", enemy.computerCombatSheet?.computerWeapons?.[0]?.influences?.[0] as string)
            .replace("{enemy.faith}", enemy.ascean.faith)
            .replace("{article}", enemyArticle(enemy))}`;

        this.scene.showCombatText(this.player, text, 3000, BONE, false, true);
        this.player.setVelocity(0);
    
        // this.player.setStatic(true);
    };
    onLuckoutUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time <= 0 && this.player.isCasting) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", "TENDRIL");
    };
    onLuckoutExit = () => {
        if (this.player.castingSuccess === true) {
            this.handleLuckout();
            this.player.castingSuccess = false;
            this.player.checkTalentCost("luckout", PLAYER.STAMINA[this.player.buttonPressed]);
            if (!this.player.isComputer) this.player.checkTalentCooldown("luckout", PLAYER.COOLDOWNS.SHORT);
        };
        this.player.stopCasting();
        this.player.luckoutLock = "";
    };

    handleLuckout = () => {
        const enemy = this.player?.currentTarget?.enemyID === this.player.spellTarget ? this.player.currentTarget : this.scene.combatManager.combatant(this.player.spellTarget);
        const player = this.scene.state.player as Ascean;
        let playerLuck = 0, enemyLuck = 0;
        let luck = this.player.luckoutLock.split("(")[1].split(")")[0], luckout = false, particle = "";
        const luckoutTrait = TRAIT_DESCRIPTIONS[luck.charAt(0).toUpperCase() + luck.slice(1)];
        // console.log({luck, luckoutTrait});
        switch (luck) {
            case "arbituous":
                playerLuck = player.achre + player.constitution;
                enemyLuck = enemy.ascean.achre + enemy.ascean.constitution;
                particle = "Wild";
                break;
            case "chiomic":
                playerLuck = player.achre + player.kyosir;
                enemyLuck = enemy.ascean.achre + enemy.ascean.kyosir;
                particle = "Sorcery";
                break;
            case "kyr'naic":
                playerLuck = player.constitution + player.kyosir;
                enemyLuck = enemy.ascean.constitution + enemy.ascean.kyosir;
                particle = "Spooky";
                break;
            case "lilosian":
                playerLuck = player.caeren + player.constitution;
                enemyLuck = enemy.ascean.caeren + enemy.ascean.constitution;
                particle = "Righteous";
                break;
            default: break;
        };

        const influence = this.scene.state.weapons?.[0]?.influences?.[0] as string;

        enemyLuck *= 1.25;

        if (playerLuck >= enemyLuck) {
            const experience = Math.min(player.level * 1000, player.experience + Math.round(enemy.ascean.level * 100 * (enemy.ascean.level / player.level)) + (this.scene.state.playerAttributes?.rawKyosir as number));
            const loot = { enemyID: enemy.enemyID, level: enemy.ascean.level };
            const state: LevelSheet = {
                ascean: player,
                currency: player.currency,
                currentHealth: this.scene.state.newPlayerHealth,
                experience: player.experience,
                experienceNeeded: player.level * 1000,
                faith: player.faith,
                firewater: player.firewater,
                mastery: player.mastery,
                avarice: this.scene.state.prayerData.length ? this.scene.state.prayerData.includes("Avavrice") : false,
                opponent: enemy.ascean.level,
                opponentExp: experience,
                constitution: 0,
                strength: 0,
                agility: 0,
                achre: 0,
                caeren: 0,
                kyosir: 0,
            };
            luckout = true;
            
            EventBus.emit("gain-experience", state);
            EventBus.emit("enemy-loot", loot);
            EventBus.emit("luckout", { luck, luckout });

            const num = Math.floor(Math.random() * 2);
            // console.log(luckoutTrait?.luckout?.success[num]);
            const text = `${luckoutTrait?.luckout?.success[num]
                .replace("{enemy.name}", enemy.ascean.name)
                .replace("{ascean.weaponOne.influences[0]}", influence)
                .replace("{ascean.name}", player.name)
                .replace("{enemy.weaponOne.influences[0]}", enemy.computerCombatSheet.computerWeapons?.[0].influences?.[0])
                .replace("{enemy.faith}", enemy.ascean.faith)
                .replace("{article}", enemyArticle(enemy))}`;
            
            this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
            this.scene.hud.showCombatHud(text, "bone", 8000);
            this.scene.combatManager.hitFeedbackSystem.emitParticles(new Phaser.Math.Vector2(enemy.x, enemy.y), particle, true, false, false);    
        } else {
            EventBus.emit("luckout", { luck, luckout });
            
            const text = `${luckoutTrait?.luckout?.failure
                .replace("{enemy.name}", enemy.ascean.name)
                .replace("{ascean.weaponOne.influences[0]}", influence)
                .replace("{ascean.name}", player.name)
                .replace("{enemy.weaponOne.influences[0]}", enemy.computerCombatSheet.computerWeapons?.[0].influences?.[0])
                .replace("{enemy.faith}", enemy.ascean.faith)
                .replace("{article}", enemyArticle(enemy))}.`
          
            this.scene.hud.showCombatHud(text, "damage", 8000);
        };
    };

    onPersuasionEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        const zero = this.player.buttonPressed.split(" ")[0].toLowerCase();
        const one = this.player.buttonPressed.split(" ")[1].toLowerCase();
        const duration = this.player.checkTalentEnhanced(zero) ? PLAYER.DURATIONS.PERSUASION / 2 : PLAYER.DURATIONS.PERSUASION;
        this.player.startCasting("Persuasion", duration, true, true, false);
        this.player.persuasionLock = one.toLowerCase();
        this.player.setVelocity(0);
        
        let persuasion = this.player.persuasionLock.split("(")[1].split(")")[0];
        const persuasionTrait = TRAIT_DESCRIPTIONS[persuasion.charAt(0).toUpperCase() + persuasion.slice(1)];
        const enemy = this.player.currentTarget;
        const influence = this.scene.state.weapons?.[0]?.influences?.[0] as string;

        const text = `${persuasionTrait?.persuasion?.action
            .replace("{enemy.name}", enemy.ascean.name)
            .replace("{ascean.weaponOne.influences[0]}", influence)
            .replace("{ascean.name}", this.player.ascean.name)
            .replace("{enemy.weaponOne.influences[0]}", this.scene.state.computerWeapons?.[0]?.influences?.[0] as string)
            .replace("{enemy.faith}", enemy.ascean.faith)
            .replace("{article}", enemyArticle(enemy))}`;

        this.scene.showCombatText(this.player, text, 3000, BONE, false, true);

        if (this.player.checkTalentOptimized(zero)) this.player.setStatic(true);
    };
    onPersuasionUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time <= 0 && this.player.isCasting) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", "TENDRIL");
    };
    onPersuasionExit = () => {
        if (this.player.castingSuccess === true) {
            this.handlePersuasion();
            this.player.castingSuccess = false;
            if (!this.player.isComputer) this.player.checkTalentCooldown("persuasion", PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost("persuasion", PLAYER.STAMINA[this.player.buttonPressed]);
        };
        this.player.stopCasting();
        this.player.persuasionLock = "";
        if (this.player.checkTalentOptimized(this.player.buttonPressed.split(" ")[0].toLowerCase())) this.player.setStatic(false);
    };

    handlePersuasion = () => {
        const enemy = this.player?.currentTarget?.enemyID === this.player.spellTarget ? this.player.currentTarget : this.scene.combatManager.combatant(this.player.spellTarget);
        const player = this.scene.state.player as Ascean;
        let playerPersuasion = 0, enemyPersuasion = 0;
        let persuasion = this.player.persuasionLock.split("(")[1].split(")")[0], persuaded = false;
        const persuasionTrait = TRAIT_DESCRIPTIONS[persuasion.charAt(0).toUpperCase() + persuasion.slice(1)];
    
        switch (persuasion) {
            case "arbituous":
                playerPersuasion = player.achre + player.constitution;
                enemyPersuasion = enemy.ascean.achre + enemy.ascean.constitution;
                break;
            case "chiomic":
                playerPersuasion = player.achre + player.kyosir;
                enemyPersuasion = enemy.ascean.achre + enemy.ascean.kyosir;
                break;
            case "kyr'naic":
                playerPersuasion = player.constitution + player.kyosir;
                enemyPersuasion = enemy.ascean.constitution + enemy.ascean.kyosir;
                break;
            case "lilosian":
                playerPersuasion = player.caeren + player.constitution;
                enemyPersuasion = enemy.ascean.caeren + enemy.ascean.constitution;
                break;
            case "Ilian": // Heroism
                playerPersuasion = player.constitution + player.strength;
                enemyPersuasion = enemy.ascean.constitution + enemy.ascean.strength;
                break;
            case "Fyeran": // Seer
                playerPersuasion = player.achre + player.caeren;
                enemyPersuasion = enemy.ascean.achre + enemy.ascean.caeren;
                break;
            case "Shaorahi": // Awe
                playerPersuasion = player.strength + player.caeren;
                enemyPersuasion = enemy.ascean.strength + enemy.ascean.caeren;
                break;
            case "Tshaeral": // Fear
                playerPersuasion = player.strength as number + player.caeren;
                enemyPersuasion = enemy.ascean.strength + enemy.ascean.caeren;
                break;
            default: break;
        };

        const influence = this.scene.state.weapons?.[0]?.influences?.[0] as string;

        // enemyPersuasion *= 1.25;

        if (playerPersuasion >= enemyPersuasion) {
            persuaded = true;        
            EventBus.emit("persuasion", { persuasion, persuaded });

            const num = Math.floor(Math.random() * 2);
            const text = `${persuasionTrait?.persuasion?.success[num]
                .replace("{enemy.name}", enemy.name)
                .replace("{ascean.weaponOne.influences[0]}", influence)
                .replace("{ascean.name}", player.name)
                .replace("{enemy.weaponOne.influences[0]}", enemy.computerCombatSheet.computerWeapons?.[0].influences?.[0])
                .replace("{enemy.faith}", enemy.faith)
                .replace("{article}", enemyArticle(enemy))}`;
            
            this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
            this.scene.hud.showCombatHud(text, "bone", 8000);
            this.player.disengage();
        } else {
            EventBus.emit("persuasion", { persuasion, persuaded });
            
            const text = `${persuasionTrait?.persuasion?.failure
                .replace("{enemy.name}", enemy.ascean.name)
                .replace("{ascean.weaponOne.influences[0]}", influence)
                .replace("{ascean.name}", player.name)
                .replace("{enemy.weaponOne.influences[0]}", enemy.computerCombatSheet.computerWeapons?.[0].influences?.[0])
                .replace("{enemy.faith}", enemy.ascean.faith)
                .replace("{article}", enemyArticle(enemy))}.`
          
            this.scene.hud.showCombatHud(text, "damage", 8000);
        };
    };

    onMaierethEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.startCasting("Maiereth", PLAYER.DURATIONS.MAIERETH);
    };
    onMaierethUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.MAIERETH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onMaierethExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 50);
            const chance = Phaser.Math.Between(1, 100);
            const ceiling = this.player.checkTalentEnhanced(States.MAIERETH) ? 50 : 75;
            if (chance > ceiling) this.scene.combatManager.fear(this.player.spellTarget);
            this.specialCombatText(`You bleed and strike ${this.scene.state.computer?.name} with tendrils of Ma'anre.`);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.MAIERETH, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.MAIERETH, PLAYER.STAMINA.MAIERETH);
        };
        this.player.stopCasting();
    };

    onGrapplingHookEnter = () => {
        this.player.particleEffect = this.scene.particleManager.addEffect("grappling hook", this.player, "hook", true);
        this.scene.showCombatText(this.player, "Grappling Hook", DURATION.TEXT, DAMAGE, false, true);
        this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
        this.player.flickerCaerenic(750);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.GRAPPLING_HOOK, PLAYER.COOLDOWNS.SHORT);
        this.player.checkTalentCost(States.GRAPPLING_HOOK, PLAYER.STAMINA["GRAPPLING HOOK"]);
        this.player.beam.startEmitter(this.player.particleEffect.effect, 1750);
        this.player.hookTime = 0;
        screenShake(this.scene);

        const camera = this.scene.cameras.main;

        this.scene.hud.cinemaMode = true;
        camera.stopFollow();
        camera.startFollow(this.player.particleEffect.effect);

        this.scene.time.delayedCall(1750, () => {
            if (!this.scene.hud.cinemaMode || this.player.hooking) return;
            this.scene.hud.cinemaMode = false;
            camera.stopFollow();
            camera.startFollow(this.player, false, 0.1, 0.1);
        });
    };
    onGrapplingHookUpdate = (dt: number) => {
        this.player.hookTime += dt;
        if (this.player.hookTime >= 1750 || !this.player.particleEffect?.effect) {
            this.player.combatChecker(false);
        };
    };
    onGrapplingHookExit = () => {
        if (this.player.hooking) return;
        this.player.beam.reset();
    };

    onHookEnter = () => {
        this.player.particleEffect = this.scene.particleManager.addEffect("hook", this.player, "hook", true);
        this.scene.showCombatText(this.player, "Hook", DURATION.TEXT, DAMAGE, false, true);
        this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
        this.player.flickerCaerenic(750);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.HOOK, PLAYER.COOLDOWNS.SHORT);
        this.player.checkTalentCost(States.HOOK, PLAYER.STAMINA.HOOK);
        this.player.beam.startEmitter(this.player.particleEffect.effect, 1750);
        this.player.hookTime = 0;
        screenShake(this.scene);

        const camera = this.scene.cameras.main;

        this.scene.hud.cinemaMode = true;
        camera.stopFollow();
        camera.startFollow(this.player.particleEffect.effect);

        this.scene.time.delayedCall(1750, () => {
            if (!this.scene.hud.cinemaMode || this.player.hooking) return;
            
            this.scene.hud.cinemaMode = false;
            camera.stopFollow();
            camera.startFollow(this.player, false, 0.1, 0.1);
        });
    };
    onHookUpdate = (dt: number) => {
        this.player.hookTime += dt;
        if (this.player.hookTime >= 1750 || !this.player.particleEffect?.effect) {
            this.player.combatChecker(false);
        };
    };
    onHookExit = () => {
        if (this.player.hooking) return;
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
        this.scene.showCombatText(this.player, "Marking", DURATION.TEXT, EFFECT, false, true);
        this.player.startPraying();
        this.player.flickerCaerenic(1000);
    };
    onMarkUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onMarkExit = () => {
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {  
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
            this.player.checkTalentCooldown(States.MARK, PLAYER.COOLDOWNS.SHORT);
        };
        this.player.mark.setPosition(this.player.x, this.player.y + 24);
        this.player.mark.setVisible(true);
        this.player.animateMark();
        this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.MARK, PLAYER.STAMINA.MARK);
        this.player.setStatic(false);
        if (this.player.checkTalentEnhanced(States.MARK)) this.healCheck(25);
    };

    onNetherswapEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
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
        this.player.flickerCaerenic(1000);
        this.player.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isPraying = false);
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
            this.player.checkTalentCooldown(States.NETHERSWAP, PLAYER.COOLDOWNS.SHORT);
        };
        this.player.setStatic(false);
        if (this.player.netherswapTarget === undefined) return; 
        if (this.player.checkTalentEnhanced(States.NETHERSWAP)) this.suture(this.player.netherswapTarget.enemyID, 10);
        this.scene.showCombatText(this.player, "Netherswap", DURATION.TEXT / 2, EFFECT, false, true);
        const player = new Phaser.Math.Vector2(this.player.x, this.player.y);
        const enemy = new Phaser.Math.Vector2(this.player.netherswapTarget.x, this.player.netherswapTarget.y);
        this.player.setPosition(enemy.x, enemy.y);
        this.player.netherswapTarget.setPosition(player.x, player.y);
        this.player.netherswapTarget = undefined;
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.NETHERSWAP, PLAYER.STAMINA.NETHERSWAP);
    };

    onRecallEnter = () => {
        this.player.setStatic(true);
        this.player.isPraying = true;
        this.scene.showCombatText(this.player, "Recalling", DURATION.TEXT, EFFECT, false, true);
        this.player.flickerCaerenic(1000);
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => this.player.isPraying = false);
    };
    onRecallUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onRecallExit = () => {
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {  
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
            this.player.checkTalentCooldown(States.RECALL, PLAYER.COOLDOWNS.SHORT);
        };
        this.player.setPosition(this.player.mark.x, this.player.mark.y - 24);
        this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
        this.player.animateMark();
        this.player.setStatic(false);
        this.player.checkTalentCost(States.RECALL, PLAYER.STAMINA.RECALL);
        if (this.player.checkTalentEnhanced(States.RECALL)) this.healCheck(25);
    };

    onParalyzeEnter = () => { 
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.startCasting("Paralyze", PLAYER.DURATIONS.PARALYZE);
    };
    onParalyzeUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
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
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.PARALYZE, PLAYER.COOLDOWNS.MODERATE);
            this.player.checkTalentCost(States.PARALYZE, PLAYER.STAMINA.PARALYZE);
            if (this.player.checkTalentEnhanced(States.PARALYZE)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Debuff" });
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });        
            this.specialCombatText(`You paralyze ${this.scene.state.computer?.name} for several seconds!`);
            screenShake(this.scene);
        };
        this.player.stopCasting();
    };

    onPolymorphingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.startCasting("Polymorph", PLAYER.DURATIONS.POLYMORPH);
    };
    onPolymorphingUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onPolymorphingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.polymorph(this.player.spellTarget, this.player.checkTalentEnhanced(States.POLYMORPH));
            this.specialCombatText(`You ensorcel ${this.player.spellName}, polymorphing them!`);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.POLYMORPH, PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost(States.POLYMORPH, PLAYER.STAMINA.POLYMORPH);
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });        
            screenShake(this.scene);
        };
        this.player.stopCasting();
    };

    onPursuitEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
        if (this.player.currentTarget) {
            if (this.player.currentTarget.flipX) {
                this.player.setPosition(this.player.currentTarget.x + 16, this.player.currentTarget.y);
            } else {
                this.player.setPosition(this.player.currentTarget.x - 16, this.player.currentTarget.y);
            };
        };
        this.player.checkTalentCost(States.POLYMORPH, PLAYER.STAMINA.PURSUIT);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.PURSUIT, PLAYER.COOLDOWNS.SHORT);
        if (this.player.checkTalentEnhanced(States.PURSUIT)) {
                this.player.adjustSpeed(PLAYER.SPEED.SPRINT);
                this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT / 2, () => {
                this.player.isSprinting = false;
                this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);
            }, undefined, this);
        };
        this.player.flickerCaerenic(750);
        screenShake(this.scene);
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.scene.cameras.main.zoom * 1.25,
            ease: Phaser.Math.Easing.Quintic.InOut,
            duration: 750,
            yoyo: true
        });
    };
    onPursuitUpdate = (_dt: number) => this.player.combatChecker(this.player.isPursuing);
    onPursuitExit = () => {
        if (!this.player.inCombat && !this.player.isStealthing && !this.player.isShimmering) {
            const button = this.scene.hud.smallHud.stances.find(b => b.texture.key === "stealth");
            if (button) this.scene.hud.smallHud.pressStance(button);
        };
    };

    onQuorEnter = () => {
        this.player.startCasting("Quor", PLAYER.DURATIONS.QUOR, false);
    };
    onQuorUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
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
            this.specialCombatText(`Your Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0]?.name}.`);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.QUOR, PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost(States.QUOR, PLAYER.STAMINA.QUOR);
            this.player.castingSuccess = false;
            this.scene.sound.play("freeze", { volume: this.scene.hud.settings.volume });
            screenShake(this.scene, 128, 0.0045);
        };
        this.player.stopCasting();
    };

    onReconstituteEnter = () => {
        if (this.player.moving() === true) return;
        this.player.checkTalentCost(States.RECONSTITUTE, PLAYER.STAMINA.RECONSTITUTE);
        const enhanced = this.player.checkTalentEnhanced(States.RECONSTITUTE);
        const duration = enhanced ? PLAYER.DURATIONS.RECONSTITUTE / 2 : PLAYER.DURATIONS.RECONSTITUTE;
        this.player.startCasting("Reconstitute", duration, false, true, false);
        this.player.reconTimer = this.scene.time.addEvent({
            delay: duration / 5,
            callback: () => this.reconstitute(),
            callbackScope: this,
            repeat: 5,
        });
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RECONSTITUTE, PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.addEvent({
            delay: duration,
            callback: () => this.player.isCasting = false,
            callbackScope: this,
            loop: false,
        });
        this.player.castbar.setVisible(true);  
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
    };
    onReconstituteUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", "HEAL");
    };
    onReconstituteExit = () => {
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
        this.healCheck(15);
        this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
    };

    onRootingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.startCasting("Root", PLAYER.DURATIONS.ROOTING);
    };
    onRootingUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
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
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ROOT, PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost(States.ROOT, PLAYER.STAMINA.ROOT);
            if (this.player.checkTalentEnhanced(States.ROOT)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Silence" });
            this.specialCombatText(`You ensorcel ${this.player.spellName}, rooting them!`);
        };
        this.player.stopCasting();
    };

    onRushEnter = () => this.player.rush();
    onRushUpdate = (_dt: number) => this.player.combatChecker(this.player.isRushing);
    onRushExit = () => {
        this.player.rushedEnemies = [];
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RUSH, PLAYER.COOLDOWNS.SHORT);
        this.player.checkTalentCost(States.RUSH, PLAYER.STAMINA.RUSH);
        this.scene.combatManager.hitFeedbackSystem.trailing(this as any, false);
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
            this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
            if (this.player.checkTalentEnhanced(States.SLOW)) {
                this.scene.combatManager.snare(this.player.spellTarget);
            } else {
                this.scene.combatManager.slow(this.player.spellTarget, 3000);
            };
            this.player.checkTalentCost(States.SLOW, PLAYER.STAMINA.SLOW);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.SLOW, PLAYER.COOLDOWNS.SHORT);
            const name = this.scene.combatManager.combatant(this.player.spellTarget)?.ascean.name;
            this.specialCombatText(`You ensorcel ${name}, slowing them!`);
            screenShake(this.scene);
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
            this.player.checkTalentCost(States.SACRIFICE, PLAYER.STAMINA.SACRIFICE);
            this.scene.showCombatText(this.player, "Sacrifice", 750, EFFECT, false, true);
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
            this.sacrifice(this.player.spellTarget, 25);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.SACRIFICE, PLAYER.COOLDOWNS.MODERATE);
            if (this.player.checkTalentEnhanced(States.SACRIFICE)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Damage" });
            this.player.spellTarget = "";
        };
    };

    onSnaringEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.startCasting("Snare", PLAYER.DURATIONS.SNARE);
    };
    onSnaringUpdate = (dt: number) => {
        if (this.player.moving()) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.SNARE) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, CAST);
    };
    onSnaringExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.checkTalentCost(States.SNARE, PLAYER.STAMINA.SNARE);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.SNARE, PLAYER.COOLDOWNS.SHORT);
            this.scene.combatManager.snare(this.player.spellTarget);
            if (this.player.checkTalentEnhanced(States.SNARE)) {
                this.player.adjustSpeed(PLAYER.SPEED.SPRINT);    
                this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT / 2, () => {
                    this.player.isSprinting = false;
                    this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);    
                }, undefined, this);
            };
            this.player.castingSuccess = false;
            this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
            screenShake(this.scene);
            this.specialCombatText(`You ensorcel ${this.player.spellName}, snaring them!`);
        };
        this.player.stopCasting();
    };

    onStormEnter = () => this.player.storm();
    onStormUpdate = (_dt: number) => this.player.combatChecker(this.player.isStorming);
    onStormExit = () => {if (!this.player.isComputer) this.player.checkTalentCooldown(States.STORM, this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3)};

    onSutureEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.startPraying();
        this.player.spellTarget = this.player.currentTarget.enemyID;
    };
    onSutureUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onSutureExit = () => {
        if (this.player.spellTarget) {
            this.scene.showCombatText(this.player, "Suture", 750, EFFECT, false, true);
            this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.SUTURE, PLAYER.STAMINA.SUTURE);
            this.suture(this.player.spellTarget, 20);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.SUTURE, PLAYER.COOLDOWNS.MODERATE);
            if (this.player.checkTalentEnhanced(States.SUTURE)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Buff" });
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
        this.player.checkTalentCost(States.ABSORB, PLAYER.STAMINA.ABSORB);
        this.scene.sound.play(States.ABSORB, { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Absorbing", 750, EFFECT, false, true);
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "aqua", PLAYER.DURATIONS.ABSORB);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.ABSORB, PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ABSORB, () => {
            this.player.isAbsorbing = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.destroy();
                this.player.negationBubble = undefined;
                if (this.player.negationName === States.ABSORB) this.player.negationName = "";
            };    
        }, undefined, this);
        this.specialCombatText("You warp oncoming damage into grace.");
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
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Absorbed", 500, EFFECT, false, true);
        const cost = this.player.checkTalentEnhanced(States.ABSORB) ? 15 : 25;
        if (this.player.grace - cost <= 0) {
            this.player.isAbsorbing = false;
        };
        this.scene.combatManager.useGrace(cost);
    };

    onChiomicEnter = () => {
        this.player.checkTalentCost(States.CHIOMIC, PLAYER.STAMINA.CHIOMIC);
        this.player.aoe = this.scene.aoePool.get("chiomic", 1);    
        this.scene.sound.play("death", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Hah! Hah!", PLAYER.DURATIONS.CHIOMIC, EFFECT, false, true);
        this.player.isChiomic = true;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CHIOMIC, PLAYER.COOLDOWNS.MODERATE);
        
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.player.isChiomic = false;
        }, undefined, this);
        this.specialCombatText("You mock and confuse your surrounding foes.");
    };
    onChiomicUpdate = (_dt: number) => {if (this.player.isChiomic === false) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.player.isDiseasing = true;
        this.player.aoe = this.scene.aoePool.get("disease", 6);    
        this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Tendrils Swirl", 750, TENDRIL, false, true);
        this.player.checkTalentCost(States.DISEASE, PLAYER.STAMINA.DISEASE);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DISEASE, PLAYER.COOLDOWNS.MODERATE);
        
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.player.isDiseasing = false;
        }, undefined, this);
        this.specialCombatText("You swirl such sweet tendrils which wrap round and reach to writhe.");
    };
    onDiseaseUpdate = (_dt: number) => {if (this.player.isDiseasing === false) this.positiveMachine.setState(States.CLEAN);};
    onDiseaseExit = () => this.player.aoe.cleanAnimation(this.scene);

    onHowlEnter = () => {
        this.player.checkTalentCost(States.HOWL, PLAYER.STAMINA.HOWL);
        this.player.aoe = this.scene.aoePool.get("howl", 1);
        this.scene.sound.play("howl", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Howling", PLAYER.DURATIONS.HOWL, DAMAGE, false, true);
        this.player.isHowling = true;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.HOWL, PLAYER.COOLDOWNS.MODERATE);
        
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.player.isHowling = false;
        }, undefined, this);
        this.specialCombatText("You howl, it's otherworldly nature stunning nearby foes.");
    };
    onHowlUpdate = (_dt: number) => {if (this.player.isHowling === false) this.positiveMachine.setState(States.CLEAN);};
    onHowlExit = () => this.player.aoe.cleanAnimation(this.scene);

    onEnvelopEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.isEnveloping = true;
        this.player.checkTalentCost(States.ENVELOP, PLAYER.STAMINA.ENVELOP);
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Enveloping", 750, CAST, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "blue", PLAYER.DURATIONS.ENVELOP);
        this.player.reactiveName = States.ENVELOP;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.ENVELOP, PLAYER.COOLDOWNS.MODERATE);
        
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.player.isEnveloping = false;    
            if (this.player.reactiveBubble !== undefined && this.player.reactiveName === States.ENVELOP) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };    
        }, undefined, this);
        this.specialCombatText("You envelop yourself, shirking oncoming attacks.");
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
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Enveloped", 500, EFFECT, false, true);
        const cost = this.player.checkTalentEnhanced(States.ENVELOP) ? 15 : 25;
        if (this.player.stamina - cost <= 0) {
            this.player.isEnveloping = false;
        };
        this.scene.combatManager.useStamina(cost);
    };

    onFreezeEnter = () => {
        this.player.aoe = this.scene.aoePool.get("freeze", 1);
        this.scene.sound.play("freeze", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.FREEZE, PLAYER.STAMINA.FREEZE);
        this.scene.showCombatText(this.player, "Freezing", PLAYER.DURATIONS.FREEZE, CAST, false, true);
        this.player.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.player.isFreezing = false;
        }, undefined, this);
        this.specialCombatText("You freeze nearby foes.");
    };
    onFreezeUpdate = (_dt: number) => {if (!this.player.isFreezing) this.positiveMachine.setState(States.CLEAN);};
    onFreezeExit = () => {
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.FREEZE, PLAYER.COOLDOWNS.SHORT);
    };

    onMaliceEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MALICE;
        this.player.checkTalentCost(States.MALICE, PLAYER.STAMINA.MALICE);
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.player.isMalicing = true;
        this.scene.showCombatText(this.player, "Malice", 750, HUSH, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "purple", PLAYER.DURATIONS.MALICE);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.MALICE, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.player.isMalicing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MALICE) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        this.specialCombatText("You wrack malicious foes with the hush of their own attack.");
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
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Malicing", 750, HUSH, false, true);
        const power = (this.player.checkTalentEnhanced(States.MALICE) ? 100 : 10) + this.mastery();
        this.chiomism(id, power, "malice");
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isMalicing = false;
        };
    };

    onMenaceEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MENACE;
        this.player.checkTalentCost(States.MENACE, PLAYER.STAMINA.MENACE);
        this.scene.sound.play("scream", { volume: this.scene.hud.settings.volume });
        this.player.isMenacing = true;
        this.scene.showCombatText(this.player, "Menacing", 750, TENDRIL, false, true);
        const duration = this.player.checkTalentEnhanced(States.MENACE) ? PLAYER.DURATIONS.MENACE * 1.5 : PLAYER.DURATIONS.MENACE;
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "dread", duration);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.MENACE, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(duration, () => {
            this.player.isMenacing = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MENACE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        this.specialCombatText("You seek to menace oncoming attacks.");
    };
    onMenaceUpdate = (_dt: number) => {if (!this.player.isMenacing) this.positiveMachine.setState(States.CLEAN);};

    menace = (id: string) => {
        if (id === "") return;
        if (this.player.reactiveBubble === undefined || this.player.isMenacing === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMenacing = false;
            return;
        };
        this.scene.combatManager.fear(id);
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Menacing", 500, TENDRIL, false, true);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isMenacing = false;
        };
    };

    onMendEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MEND;
        this.player.checkTalentCost(States.MEND, PLAYER.STAMINA.MEND);
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.player.isMending = true;
        this.scene.showCombatText(this.player, "Mending", 750, TENDRIL, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "purple", PLAYER.DURATIONS.MEND);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.MEND, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.player.isMending = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MEND) {
                this.player.reactiveBubble.destroy();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        this.specialCombatText("You seek to mend oncoming attacks.");
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
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Mending", 500, TENDRIL, false, true);
        const power = this.player.checkTalentEnhanced(States.MEND) ? 25 : 12.5;
        this.scene.combatManager.combatMachine.action({ data: { key: "player", value: power, id: this.player.playerID }, type: "Health" });
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isMending = false;
        };
    };

    onModerateEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MODERATE;
        this.player.checkTalentCost(States.MODERATE, PLAYER.STAMINA.MODERATE);
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.player.isModerating = true;
        this.scene.showCombatText(this.player, "Moderate", 750, CAST, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "sapphire", PLAYER.DURATIONS.MODERATE);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.MODERATE, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MODERATE, () => {
            this.player.isModerating = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MODERATE) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        this.specialCombatText("You seek to moderate oncoming attacks.");
    };
    onModerateUpdate = (_dt: number) => {if (!this.player.isModerating) this.positiveMachine.setState(States.CLEAN);};

    moderate = (id: string) => {
        if (id === "") return;
        if (this.player.reactiveBubble === undefined || this.player.isModerating === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isModerating = false;
            return;
        };
        if (this.player.checkTalentEnhanced(States.MODERATE)) {
            this.scene.combatManager.snare(id);
        } else {
            this.scene.combatManager.slow(id);
        };
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Moderating", 500, "sapphire", false, true);
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
        this.player.checkTalentCost(States.MULTIFARIOUS, PLAYER.STAMINA.MULTIFARIOUS);
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        this.player.isMultifaring = true;
        const duration = this.player.checkTalentEnhanced(States.MULTIFARIOUS) ? PLAYER.DURATIONS.MULTIFARIOUS * 1.5 : PLAYER.DURATIONS.MULTIFARIOUS;
        this.scene.showCombatText(this.player, "Multifarious", 750, CAST, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "ultramarine", duration);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.MULTIFARIOUS, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(duration, () => {
            this.player.isMultifaring = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MULTIFARIOUS) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        this.specialCombatText("You seek to multifare oncoming attacks.");
    };
    onMultifariousUpdate = (_dt: number) => {if (!this.player.isMultifaring) this.positiveMachine.setState(States.CLEAN);};

    multifarious = (id: string) => {
        if (id === "") return;
        if (this.player.reactiveBubble === undefined || this.player.isMultifaring === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMultifaring = false;
            return;
        };
        this.scene.combatManager.polymorph(id, this.player.checkTalentEnhanced(States.POLYMORPH));
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Multifaring", 500, "ultramarine", false, true);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isMultifaring = false;
        };
    };

    onMystifyEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.reactiveName = States.MYSTIFY;
        this.player.checkTalentCost(States.MYSTIFY, PLAYER.STAMINA.MYSTIFY);
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.player.isMystifying = true;
        this.scene.showCombatText(this.player, "Mystify", 750, EFFECT, false, true);
        const duration = this.player.checkTalentEnhanced(States.MYSTIFY) ? PLAYER.DURATIONS.MYSTIFY * 1.5 : PLAYER.DURATIONS.MYSTIFY;
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "chartreuse", duration);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.MYSTIFY, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(duration, () => {
            this.player.isMystifying = false;    
            if (this.player.reactiveBubble && this.player.reactiveName === States.MYSTIFY) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                this.player.reactiveName = "";
            };
        }, undefined, this);
        this.specialCombatText("You seek to mystify enemies when struck.");
    };
    onMystifyUpdate = (_dt: number) => {if (!this.player.isMystifying) this.positiveMachine.setState(States.CLEAN);};

    mystify = (id: string) => {
        if (id === "") return;
        if (this.player.reactiveBubble === undefined || this.player.isMystifying === false) {
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
            this.player.isMystifying = false;
            return;
        };
        this.scene.combatManager.confuse(id, this.player.checkTalentEnhanced(States.CONFUSE));
        this.scene.sound.play("death", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Mystifying", 500, "chartreuse", false, true);
        this.player.reactiveBubble.setCharges(this.player.reactiveBubble.charges - 1);
        if (this.player.reactiveBubble.charges <= 0) {
            this.player.isMystifying = false;
        };
    };

    onProtectEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isProtecting = true;
        this.player.checkTalentCost(States.PROTECT, PLAYER.STAMINA.PROTECT);
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Protecting", 750, EFFECT, false, true);
        const duration = this.player.checkTalentEnhanced(States.PROTECT) ? PLAYER.DURATIONS.PROTECT * 1.5 : PLAYER.DURATIONS.PROTECT;
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "gold", duration);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.PROTECT, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(duration, () => {
            this.player.isProtecting = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
            };
        }, undefined, this);
        this.specialCombatText("You protect yourself from oncoming attacks.");
    };
    onProtectUpdate = (_dt: number) => {if (!this.player.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRecoverEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.isRecovering = true;
        this.player.checkTalentCost(States.RECOVER, PLAYER.STAMINA.RECOVER);
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Recovering", 750, EFFECT, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "green", PLAYER.DURATIONS.RECOVER);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RECOVER, PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RECOVER, () => {
            this.player.isRecovering = false;    
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
        }, undefined, this);
        this.specialCombatText("You warp oncoming damage into stamina.");
    };
    onRecoverUpdate = (_dt: number) => {if (!this.player.isRecovering) this.positiveMachine.setState(States.CLEAN);};

    recover = () => {
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Recovered", 500, EFFECT, false, true);
        const stamina = this.player.checkTalentEnhanced(States.RECOVER) ? -30 : -15;
        this.scene.combatManager.useStamina(stamina);
    };

    onReinEnter = () => {
        if (this.player.reactiveBubble) {
            this.player.reactiveBubble.cleanUp();
            this.player.reactiveBubble = undefined;
        };
        this.player.isReining = true;
        this.player.reactiveName = States.REIN;
        this.player.checkTalentCost(States.REIN, PLAYER.STAMINA.REIN);
        this.scene.sound.play(States.ABSORB, { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Rein", 750, EFFECT, false, true);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "fuchsia", PLAYER.DURATIONS.REIN);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.REIN, PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.REIN, () => {
            this.player.isReining = false;    
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
                if (this.player.reactiveName === States.REIN) this.player.reactiveName = "";
            };    
        }, undefined, this);
        this.specialCombatText("Your hush warps oncoming damage into grace.");
    };
    onReinUpdate = (_dt: number) => {if (!this.player.isReining) this.positiveMachine.setState(States.CLEAN);};

    rein = () => {
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Reining", 500, EFFECT, false, true);
        const grace = this.player.checkTalentEnhanced(States.REIN) ? -30 : -15;
        this.scene.combatManager.useGrace(grace);
    };

    onRenewalEnter = () => {
        this.player.isRenewing = true;
        this.player.checkTalentCost(States.RENEWAL, PLAYER.STAMINA.RENEWAL);
        this.player.aoe = this.scene.aoePool.get("renewal", 6, true);    
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Hush Tears", 750, "bone", false, true);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RENEWAL, PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.player.isRenewing = false;
        }, undefined, this);
        this.specialCombatText("Tears of a hush proliferate and heal old wounds.");
    };
    onRenewalUpdate = (_dt: number) => {if (!this.player.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        this.player.checkTalentCost(States.SCREAM, PLAYER.STAMINA.SCREAM);
        this.player.aoe = this.scene.aoePool.get("scream", 1);
        this.scene.sound.play("scream", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Screaming", 750, HUSH, false, true);
        this.player.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.player.isScreaming = false;
        }, undefined, this);
        this.specialCombatText("You scream, fearing nearby foes.");
    };
    onScreamUpdate = (_dt: number) => {if (!this.player.isScreaming) this.positiveMachine.setState(States.CLEAN);};
    onScreamExit = () => {if (!this.player.isComputer) this.player.checkTalentCooldown(States.SCREAM, PLAYER.COOLDOWNS.SHORT)};

    onShieldEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.checkTalentCost(States.SHIELD, PLAYER.STAMINA.SHIELD);
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.player.isShielding = true;
        this.scene.showCombatText(this.player, "Shielding", 750, "bone", false, true);
        const duration = this.player.checkTalentEnhanced(States.SHIELD) ? PLAYER.DURATIONS.SHIELD * 1.5 : PLAYER.DURATIONS.SHIELD;
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "bone", duration);
        this.player.negationName = States.SHIELD;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SHIELD, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(duration, () => {
            this.player.isShielding = false;    
            if (this.player.negationBubble && this.player.negationName === States.SHIELD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = "";
            };
        }, undefined, this);
        this.specialCombatText("You shield yourself from oncoming attacks.");
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
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Shield Hit", 500, "bone", false, true);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        if (this.player.negationBubble.charges <= 0) {
            this.scene.showCombatText(this.player, "Shield Broken", 500, DAMAGE, false, true);
            this.player.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.scene.cameras.main.zoom * 1.25,
            ease: Phaser.Math.Easing.Quintic.InOut,
            duration: 750,
            yoyo: true
        });
        this.player.isShimmering = true; 
        this.scene.sound.play("stealth", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.SHIMMER, PLAYER.STAMINA.SHIMMER);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SHIMMER, PLAYER.COOLDOWNS.MODERATE);
        if (!this.player.isStealthing) this.stealthEffect(true);
        if (this.player.checkTalentEnhanced(States.SHIMMER)) {
            this.player.adjustSpeed(PLAYER.SPEED.SPRINT);    
            this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT / 2, () => {
                this.player.isSprinting = false;
                this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);    
            }, undefined, this);
        };
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.player.isShimmering = false;
            this.stealthEffect(false);
        }, undefined, this);
        this.specialCombatText("You shimmer, fading in and out of this world.");
    };
    onShimmerUpdate = (_dt: number) => {if (!this.player.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmer = () => {
        const shimmers = ["It fades through you", "You simply weren't there", "Perhaps you never were", "They don't seem certain of you at all"];
        const shim = shimmers[Math.floor(Math.random() * shimmers.length)];
        this.scene.sound.play("stealth", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, shim, 1500, EFFECT, false, true);
    };

    onSprintEnter = () => {
        this.player.isSprinting = true;
        screenShake(this.scene);
        this.scene.sound.play("blink", { volume: this.scene.hud.settings.volume / 3 });
        const speed = this.player.checkTalentEnhanced(States.SPRINTING) ? PLAYER.SPEED.SPRINT + 0.75 : PLAYER.SPEED.SPRINT;
        this.player.adjustSpeed(speed);
        this.player.checkTalentCost(States.SPRINTING, PLAYER.STAMINA.SPRINT);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SPRINTING, PLAYER.COOLDOWNS.MODERATE);
        this.player.flickerCaerenic(PLAYER.DURATIONS.SPRINT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.player.isSprinting = false;
            this.player.adjustSpeed(-speed);    
        }, undefined, this);
        this.specialCombatText("You tap into your caeren, bursting into an otherworldly sprint.");
    };
    onSprintUpdate = (_dt: number) => {if (!this.player.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onStealthEnter = () => {
        if (!this.player.isShimmering) this.player.isStealthing = true; 
        this.stealthEffect(true);
        this.specialCombatText("You step halfway into the land of hush and tendril.");
    };
    onStealthUpdate = (_dt: number) => {if (!this.player.isStealthing || this.scene.combat) this.positiveMachine.setState(States.CLEAN);};
    onStealthExit = () => {
        this.player.isStealthing = false;
        this.stealthEffect(false);
    };

    stealthEffect = (stealth: boolean) => {
        this.scene.stealthEngaged(stealth);
        const speed = this.scene.hud.talents.talents.stealth.efficient ? 0 : PLAYER.SPEED.STEALTH;
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
            this.player.adjustSpeed(-speed);
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
            this.player.adjustSpeed(speed);
            clearStealth(this.player);
            clearStealth(this.player.spriteWeapon);
            clearStealth(this.player.spriteShield);
            this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
            if (this.scene.hud.smallHud.switches.stealth) { // Stealth Button Depressed
                EventBus.emit("outside-stance", "stealth");
            };
        };
        this.scene.sound.play("stealth", { volume: this.scene.hud.settings.volume });
    };

    onWardEnter = () => {
        if (this.player.negationBubble) {
            this.player.negationBubble.cleanUp();
            this.player.negationBubble = undefined;
        };
        this.player.isWarding = true;
        this.player.checkTalentCost(States.WARD, PLAYER.STAMINA.WARD);
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Warding", 750, DAMAGE, false, true);
        const duration = this.player.checkTalentEnhanced(States.WARD) ? PLAYER.DURATIONS.WARD * 1.5 : PLAYER.DURATIONS.WARD;
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "red", duration);
        this.player.negationName = States.WARD;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.WARD, PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(duration, () => {
            this.player.isWarding = false;    
            if (this.player.negationBubble && this.player.negationName === States.WARD) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
                this.player.negationName = "";
            };
        }, undefined, this);
        this.specialCombatText("You ward yourself from oncoming attacks.");
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
        this.scene.sound.play("parry", { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.stunned(id);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        this.scene.showCombatText(this.player, "Warded", 500, EFFECT, false, true);
        if (this.player.negationBubble.charges <= 0) {
            this.scene.showCombatText(this.player, "Ward Broken", 500, DAMAGE, false, true);
            this.player.negationBubble.setCharges(0);
            this.player.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.player.checkTalentCost(States.WRITHE, PLAYER.STAMINA.WRITHE);
        this.player.aoe = this.scene.aoePool.get("writhe", 1);
        this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Writhing", 750, TENDRIL, false, true);
        this.player.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.player.isWrithing = false;
        }, undefined, this);
        this.specialCombatText("Your caeren grips your body and contorts, writhing around you.");
    };
    onWritheUpdate = (_dt: number) => {if (!this.player.isWrithing) this.positiveMachine.setState(States.CLEAN);};
    onWritheExit = () => {
        this.player.aoe.cleanAnimation(this.scene);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.WRITHE, PLAYER.COOLDOWNS.SHORT);  
    };

    // ==================== TRAITS ==================== \\
    onAstricationEnter = () => {
        if (this.player.isAstrifying === true) return;
        this.player.checkTalentCost(States.ASTRICATION, PLAYER.STAMINA.ASTRICATION);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.ASTRICATION, PLAYER.COOLDOWNS.LONG);
        this.scene.combatManager.combatMachine.input("astrication", {active:true,charges:0});
        this.scene.sound.play("lightning", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Astrication", 750, EFFECT, false, true);
        this.player.isAstrifying = true;
        const duration = this.player.checkTalentEnhanced(States.ASTRICATION) ? PLAYER.DURATIONS.ASTRICATION * 1.5 : PLAYER.DURATIONS.ASTRICATION;
        this.player.flickerCaerenic(duration); 
        this.scene.time.delayedCall(duration, () => {
            this.scene.combatManager.combatMachine.input("astrication", {active:false,charges:0});
            this.player.isAstrifying = false;
        }, undefined, this);
        this.specialCombatText("Your caeren astrifies, wrapping round your attacks.");
    };
    onAstricationUpdate = (_dt: number) => {if (!this.player.isAstrifying) this.positiveMachine.setState(States.CLEAN);};

    onBerserkEnter = () => {
        if (this.player.isBerserking === true) return;
        this.player.checkTalentCost(States.BERSERK, PLAYER.STAMINA.BERSERK);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.BERSERK, PLAYER.COOLDOWNS.LONG);  
        this.scene.sound.play("howl", { volume: this.scene.hud.settings.volume });
        const level = this.player.ascean.level;
        const charges = this.player.checkTalentEnhanced("berserk") ? (level > 8 ? 7 : level > 4 ? 5 : 3) : level > 8 ? 3 : level > 4 ? 2 : 1;
        this.scene.combatManager.combatMachine.input("berserk", {active:true,charges,talent:this.player.checkTalentEnhanced(States.BERSERK)});
        this.scene.showCombatText(this.player, "Berserking", 750, DAMAGE, false, true);
        this.player.isBerserking = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BERSERK, () => {
            this.scene.combatManager.combatMachine.input("berserk", {active:false,charges:0,talent:this.player.checkTalentEnhanced(States.BERSERK)});
            this.player.isBerserking = false;
        }, undefined, this);
        this.specialCombatText("Your caeren feeds off the pain, its hush shrieking forth.");
    };
    onBerserkUpdate = (_dt: number) => {if (!this.player.isBerserking) this.positiveMachine.setState(States.CLEAN);};

    onBlindEnter = () => {
        this.player.checkTalentCost(States.BLIND, PLAYER.STAMINA.BLIND);
        this.player.aoe = this.scene.aoePool.get("blind");
        this.scene.sound.play("righteous", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Brilliance", 750, EFFECT, false, true);
        this.player.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.player.isBlinding = false;
        }, undefined, this);
        this.specialCombatText("Your caeren shines with brilliance, blinding those around you.");
    };
    onBlindUpdate = (_dt: number) => {if (!this.player.isBlinding) this.positiveMachine.setState(States.CLEAN);};
    onBlindExit = () => {if (!this.player.isComputer) this.player.checkTalentCooldown(States.BLIND, PLAYER.COOLDOWNS.SHORT)};

    onCaerenesisEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.checkTalentCost(States.CAERENESIS, PLAYER.STAMINA.CAERENESIS);
        const count = this.player.checkTalentEnhanced(States.CAERENESIS) ? 3 : 1;
        this.player.aoe = this.scene.aoePool.get(States.CAERENESIS, count, false, undefined, false, this.player.currentTarget);
        this.scene.sound.play("blink", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Caerenesis", 750, CAST, false, true);
        this.player.isCaerenesis = true;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CAERENESIS, PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CAERENESIS * count, () => {
            this.player.isCaerenesis = false;
        }, undefined, this);
        this.specialCombatText("Your caeren grips your body and contorts, writhing around you.");
    };
    onCaerenesisUpdate = (_dt: number) => {if (!this.player.isCaerenesis) this.positiveMachine.setState(States.CLEAN);};

    onConvictionEnter = () => {
        if (this.player.isConvicted === true) return;
        this.player.checkTalentCost(States.CONVICTION, PLAYER.STAMINA.CONVICTION);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CONVICTION, PLAYER.COOLDOWNS.LONG);  
        this.scene.combatManager.combatMachine.input("conviction", {active:true,charges:1,talent:this.player.checkTalentEnhanced(States.CONVICTION)});
        this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Conviction", 750, TENDRIL, false, true);
        this.player.isConvicted = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CONVICTION, () => {
        const level = this.player.ascean.level;
        const charges = this.player.checkTalentEnhanced("conviction") ? (level > 8 ? 7 : level > 4 ? 5 : 3) : level > 8 ? 3 : level > 4 ? 2 : 1;
            this.scene.combatManager.combatMachine.input("conviction", {active:false,charges,talent:this.player.checkTalentEnhanced(States.CONVICTION)});
            this.player.isConvicted = false;
        }, undefined, this);
        this.specialCombatText("Your caeren steels itself in admiration of your physical form.");
    };
    onConvictionUpdate = (_dt: number) => {if (!this.player.isConvicted) this.positiveMachine.setState(States.CLEAN)};

    onEnduranceEnter = () => {
        if (this.player.isEnduring === true) return;
        this.player.checkTalentCost(States.ENDURANCE, PLAYER.STAMINA.ENDURANCE);
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Endurance", 750, HEAL, false, true);
        this.player.isEnduring = true;
        this.player.flickerCaerenic(PLAYER.DURATIONS.ENDURANCE); 
        const stamina = this.player.checkTalentEnhanced(States.ENDURANCE) ? -40 : -20;
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.scene.combatManager.useStamina(stamina),
            repeat: 5,
            callbackScope: this
        });
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENDURANCE, () => {
            this.player.isEnduring = false;
        }, undefined, this);
        this.specialCombatText("Your caeren's hush pours into other faculties, invigorating you.");
    };
    onEnduranceUpdate = (_dt: number) => {if (!this.player.isEnduring) this.positiveMachine.setState(States.CLEAN);};
    onEnduranceExit = () => {if (!this.player.isComputer) this.player.checkTalentCooldown(States.ENDURANCE, PLAYER.COOLDOWNS.LONG)};  

    onImpermanenceEnter = () => {
        if (this.player.isImpermanent === true) return;
        this.player.checkTalentCost(States.IMPERMANENCE, PLAYER.STAMINA.IMPERMANENCE);
        this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Impermanence", 750, HUSH, false, true);
        this.player.isImpermanent = true;
        this.player.flickerCaerenic(1500); 
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.IMPERMANENCE, PLAYER.COOLDOWNS.MODERATE);  
        const duration = this.player.checkTalentEnhanced(States.IMPERMANENCE) ? PLAYER.DURATIONS.IMPERMANENCE * 1.5 : PLAYER.DURATIONS.IMPERMANENCE;
        this.scene.time.delayedCall(duration, () => {
            this.player.isImpermanent = false;
        }, undefined, this);
        this.specialCombatText("Your caeren grips your body and fades, its hush concealing.");
    };
    onImpermanenceUpdate = (_dt: number) => {if (!this.player.isImpermanent) this.positiveMachine.setState(States.CLEAN);};

    onSeerEnter = () => {
        if (this.player.isSeering === true) return;
        this.player.checkTalentCost(States.SEER, PLAYER.STAMINA.SEER);
        this.scene.sound.play("fire", { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.combatMachine.input("isSeering", true);
        this.scene.showCombatText(this.player, "Seer", 750, DAMAGE, false, true);
        this.player.isSeering = true;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SEER, PLAYER.COOLDOWNS.MODERATE);
        this.player.flickerCaerenic(1500);
        const duration = this.player.checkTalentEnhanced(States.SEER) ? PLAYER.DURATIONS.SEER * 1.5 : 1;
        this.scene.time.delayedCall(duration, () => {
            this.player.isSeering = false;
            if (this.scene.state.isSeering === true) {
                this.scene.combatManager.combatMachine.input("isSeering", false);
            };
        }, undefined, this);
        this.specialCombatText("Your caeren calms your body to focus, its hush bleeding into you.");
    };
    onSeerUpdate = (_dt: number) => {if (!this.player.isSeering) this.positiveMachine.setState(States.CLEAN);};

    onDispelEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.checkTalentCost(States.SEER, PLAYER.STAMINA.SEER);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.KYRNAICISM);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DISPEL, PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Dispelling", 750, EFFECT, false, true);
        this.player.flickerCaerenic(1000);
        const bubbles = [];
        if (this.player.currentTarget.isMalicing) bubbles.push(States.MALICE);
        if (this.player.currentTarget.isMending) bubbles.push(States.MEND);
        if (this.player.currentTarget.isMystifying) bubbles.push(States.MYSTIFY);
        if (this.player.currentTarget.isMenacing) bubbles.push(States.MENACE);
        if (this.player.currentTarget.isModerating) bubbles.push(States.MODERATE);
        if (this.player.currentTarget.isMultifaring) bubbles.push(States.MULTIFARIOUS);
        if (this.player.currentTarget.isShielding) bubbles.push(States.SHIELD);
        if (this.player.currentTarget.isProtecting) bubbles.push(States.PROTECT);
        if (this.player.currentTarget.isAbsorbing) bubbles.push(States.ABSORB);
        if (this.player.currentTarget.isEnveloping) bubbles.push(States.ENVELOP);
        if (bubbles.length > 0) {
            this.positiveMachine.setState(bubbles[Math.floor(Math.random() * bubbles.length)]);
        };
        this.player.currentTarget.clearBubbles();
    };
    onDispelExit = () => {};

    onShirkEnter = () => {
        this.player.isShirking = true;
        this.player.checkTalentCost(States.SEER, PLAYER.STAMINA.SEER);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SHIRK);    
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SHIRK, PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play("blink", { volume: this.scene.hud.settings.volume });
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
        this.stateMachine.setState(States.IDLE);
        this.negativeMachine.setState(States.CLEAN);
        if (this.player.checkTalentEnhanced(States.SHIRK)) {
            this.positiveMachine.setState(States.IMPERMANENCE);
        };
        this.player.flickerCaerenic(1500);
        this.scene.time.delayedCall(1500, () => {
            this.player.isShirking = false;
        }, undefined, this); 
        this.specialCombatText("Your caeren's hush grants reprieve, freeing you.");
    };
    onShirkExit = () => {};

    onShadowEnter = () => {
        this.player.isShadowing = true;
        this.player.checkTalentCost(States.SEER, PLAYER.STAMINA.SEER);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SHADOW);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SHADOW, PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Shadowing", DURATION.TEXT, DAMAGE, false, true);
        this.player.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isShadowing = false;
        }, undefined, this);
    };
    onShadowExit = () => {};

    pursue = (id: string) => {
        const enemy = this.scene.enemies.find(e => e.enemyID === id);
        if (!enemy) return;
        if (this.player.checkTalentEnhanced(States.SHADOW)) {
            const speed = this.player.checkTalentEnhanced(States.SPRINTING) ? PLAYER.SPEED.SPRINT + 0.75 : PLAYER.SPEED.SPRINT;
            this.player.adjustSpeed(speed);
            this.scene.time.delayedCall(2000, () => {
                this.player.adjustSpeed(-speed);    
            }, undefined, this);
        };
        this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
        if (enemy.flipX) {
            this.player.setPosition(enemy.x + 16, enemy.y);
        } else {
            this.player.setPosition(enemy.x - 16, enemy.y);
        };
    };
    
    onTetherEnter = () => {
        this.player.isTethering = true;
        this.player.checkTalentCost(States.TETHER, PLAYER.STAMINA.TETHER);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.TETHER, PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Tethering", DURATION.TEXT, DAMAGE, false, true);
        this.player.flickerCaerenic(6000);
        this.scene.time.delayedCall(6000, () => {
            this.player.isTethering = false;
        }, undefined, this);
    };
    onTetherExit = () => {};

    tether = (id: string) => {
        const enemy = this.scene.enemies.find(e => e.enemyID === id);
        if (!enemy) return;
        this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
        this.player.damageDistance(enemy);
        this.player.hook(enemy, 1000);
    };

    onStimulateEnter = () => {
        this.player.checkTalentCost(States.STIMULATE, PLAYER.STAMINA.STIMULATE);
        this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
        this.scene.showCombatText(this.player, "Stimulate", 750, EFFECT, false, true);
        this.player.isStimulating = true;
        this.player.flickerCaerenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.STIMULATE, () => {
            this.player.isStimulating = false;
        }, undefined, this);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.STIMULATE, PLAYER.COOLDOWNS.LONG);
        this.specialCombatText("Your caeren's hush grants reprieve, refreshing you.");
        for (let i = 0; i < this.scene.hud.actionBar.specialButtons.length; i++) {
            const name = this.scene.hud.settings.specials[i].toLowerCase();
            if (name === "stimulate") continue;
            this.scene.hud.logger.log(`Resetting the cooldown on ${name}`);
            if (!this.player.isComputer) this.player.checkTalentCooldown(name, 0);
        };
        if (this.player.checkTalentEnhanced(States.STIMULATE)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Insight" });
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
            delay: 1250,
            callback: () => {
                iteration++;
                if (iteration === 6) {
                    iteration = 0;
                    this.player.isConfused = false;
                } else {   
                    randomDirection();
                    this.scene.showCombatText(this.player, confusions[Math.floor(Math.random() * 5)], 750, EFFECT, false, true);
                    screenShake(this.scene);
                };
            },
            callbackScope: this,
            repeat: 6,
        });
        screenShake(this.scene);
    };
    onConfusedUpdate = (_dt: number) => {
        if (!this.player.isConfused) this.player.combatChecker(this.player.isConfused);
        this.player.playerVelocity.x = this.player.confuseVelocity.x;
        this.player.playerVelocity.y = this.player.confuseVelocity.y;            
        if (this.player.moving()) {
                this.player.handleMovementAnimations();
            } else {
                this.player.handleIdleAnimations();
        };
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
                    this.scene.showCombatText(this.player, fears[Math.floor(Math.random() * 5)], 1250, DAMAGE);
                    screenShake(this.scene);
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 
        screenShake(this.scene);
    };
    onFearedUpdate = (_dt: number) => {
        if (!this.player.isFeared) this.player.combatChecker(this.player.isFeared);
        this.player.playerVelocity.x = this.player.fearVelocity.x;
        this.player.playerVelocity.y = this.player.fearVelocity.y;
        if (this.player.moving()) {
            this.player.handleMovementAnimations();
        } else {
            this.player.handleIdleAnimations();
        };
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
        this.scene.showCombatText(this.player, "Frozen", DURATION.TEXT, CAST, false, true);
        this.player.clearAnimations();
        this.player.anims.play("player_idle", true);
        this.player.setVelocity(0);
        this.player.setStatic(true);
        this.player.setTint(0x0000ff);
        this.scene.time.addEvent({
            delay: DURATION.FROZEN,
            callback: () => {
                this.player.isFrozen = false;
                this.negativeMachine.setState(States.CLEAN);
                this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
            },
            callbackScope: this,
            loop: false,
        });
        screenShake(this.scene);
    };
    onFrozenUpdate = (_dt: number) => this.player.setVelocity(0);
    onFrozenExit = () => this.player.setStatic(false);

    onParalyzedEnter = () => {
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.specialCombatText = this.player.scene.showCombatText(this.player, "Paralyzed", DURATION.TEXT, EFFECT, false, true);
        this.player.paralyzeDuration = DURATION.PARALYZED;
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.isDodging = false;
        this.player.currentAction = ""; 
        this.player.anims.pause();
        this.player.setTint(0x666666);
        this.player.setVelocity(0);
        // this.player.setStatic(true);
    };
    onParalyzedUpdate = (dt: number) => {
        this.player.setVelocity(0);
        this.player.paralyzeDuration -= dt;
        if (this.player.paralyzeDuration <= 0) this.player.isParalyzed = false;
        this.player.combatChecker(this.player.isParalyzed);
    }; 
    onParalyzedExit = () => {
        if (!this.player.isComputer) {        
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(true);
                this.scene.hud.rightJoystick.joystick.setVisible(true);
            };
            this.scene.hud.actionBar.setVisible(true);
        };
        this.player.isParalyzed = false;
        this.player.paralyzeDuration = DURATION.PARALYZED;
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        // this.player.setStatic(false);
        this.player.anims.resume();
    };

    onPolymorphedEnter = () => {
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
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
                    this.scene.showCombatText(this.player, "...thump", 1000, EFFECT);
                    this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "player", value: 20, id: this.player.playerID } });
                    screenShake(this.scene);
                };
            },
            callbackScope: this,
            repeat: 5,
        }); 
        screenShake(this.scene);
    };
    onPolymorphedUpdate = (_dt: number) => {
        if (!this.player.isPolymorphed) this.player.combatChecker(this.player.isPolymorphed);
        this.player.playerVelocity.x = this.player.polymorphVelocity.x;
        this.player.playerVelocity.y = this.player.polymorphVelocity.y;
        this.player.anims.play(`rabbit_${this.player.polymorphMovement}_${this.player.polymorphDirection}`, true);    
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
        this.scene.showCombatText(this.player, "Slowed", DURATION.TEXT, EFFECT, false, true);
        this.player.setTint(0xFFC700);
        this.player.adjustSpeed(-(PLAYER.SPEED.SLOW - 0.25));
        this.scene.time.delayedCall(this.player.slowDuration, () =>{
            this.player.isSlowed = false;
            this.negativeMachine.setState(States.CLEAN);
        }, undefined, this);
        screenShake(this.scene);
    };

    onSlowedExit = () => {
        this.player.clearTint();
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.player.adjustSpeed((PLAYER.SPEED.SLOW - 0.25));
    };

    onSnaredEnter = () => {
        this.scene.showCombatText(this.player, "Snared", DURATION.TEXT, EFFECT, false, true);
        this.player.snareDuration = DURATION.SNARED;
        this.player.setTint(0x0000FF);
        this.player.adjustSpeed(-(PLAYER.SPEED.SNARE - 0.25));
        this.scene.time.delayedCall(this.player.snareDuration, () =>{
            this.player.isSnared = false;
            this.negativeMachine.setState(States.CLEAN);
        }, undefined, this);
        screenShake(this.scene);
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
        this.scene.showCombatText(this.player, "Stunned", PLAYER.DURATIONS.STUNNED, EFFECT, false, true);
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.setTint(0xFF0000);
        this.player.setVelocity(0);
        // this.player.setStatic(true);
        // this.scene.time.delayedCall(128, () => this.player.setStatic(false));
        this.player.anims.pause();
        this.specialCombatText("You've been stunned.");
        screenShake(this.scene, 64);
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
        this.player.isStunned = false;
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        // this.player.setStatic(false);
        this.player.anims.resume();
    };
};