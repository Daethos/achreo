import Player from "../entities/Player";
import StateMachine, { specialStateMachines, States } from "./StateMachine";
import { BALANCED, BALANCED_INSTINCTS, DEFENSIVE, DEFENSIVE_INSTINCTS, OFFENSIVE, OFFENSIVE_INSTINCTS, PLAYER, PLAYER_INSTINCTS, staminaCheck } from "../../utility/player";
import { FRAME_COUNT, FRAMES } from "../entities/Entity";
import { EventBus } from "../EventBus";
import { screenShake } from "./ScreenShake";
import Bubble from "./Bubble";
import { BlendModes } from "phaser";
import { RANGE } from "../../utility/enemy";
import { Play } from "../main";
import PlayerComputer from "../entities/PlayerComputer";
import Party from "../entities/PartyComputer";
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
const MOVEMENT = {
    "up": { x: 0, y: -5 },
    "down": { x: 0, y: 5 },
    "left": { x: -5, y: 0 },
    "right": { x: 5, y: 0 },
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
            .addState(States.NONCOMBAT, { onEnter: this.onNonCombatEnter, onUpdate: this.onNonCombatUpdate, onExit: this.onNonCombatExit })
            .addState(States.COMBAT, { onEnter: this.onCombatEnter }) // , onUpdate: this.onCombatUpdate
            .addState(States.COMPUTER_COMBAT, { onEnter: this.onComputerCombatEnter }) // , onUpdate: this.onComputerCombatUpdate
            .addState(States.LULL, { onEnter: this.onLullEnter, onExit: this.onLullExit }) // onUpdate: this.onLullUpdate
            .addState(States.CHASE, { onEnter: this.onChaseEnter, onUpdate: this.onChaseUpdate, onExit: this.onChaseExit })
            .addState(States.LEASH, { onEnter: this.onLeashEnter, onUpdate: this.onLeashUpdate, onExit: this.onLeashExit })
            .addState(States.DEFEATED, { onEnter: this.onDefeatedEnter, onUpdate: this.onDefeatedUpdate, onExit: this.onDefeatedExit })
            .addState(States.EVADE, { onEnter: this.onEvasionEnter, onUpdate: this.onEvasionUpdate, onExit: this.onEvasionExit })
            .addState(States.CONTEMPLATE, { onEnter: this.onContemplateEnter, onUpdate: this.onContemplateUpdate, onExit: this.onContemplateExit })
            .addState(States.ATTACK, { onEnter: this.onAttackEnter, onUpdate: this.onAttackUpdate, onExit: this.onAttackExit })
            .addState(States.PARRY, { onEnter: this.onParryEnter, onUpdate: this.onParryUpdate, onExit: this.onParryExit })
            .addState(States.DODGE, { onEnter: this.onDodgeEnter, onUpdate: this.onDodgeUpdate, onExit: this.onDodgeExit })
            .addState(States.POSTURE, { onEnter: this.onPostureEnter, onUpdate: this.onPostureUpdate, onExit: this.onPostureExit })
            .addState(States.ROLL, { onEnter: this.onRollEnter, onUpdate: this.onRollUpdate, onExit: this.onRollExit })
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
            .addState(States.CHIOMISM, { onEnter: this.onChiomismEnter, onUpdate: this.onChiomismUpdate, onExit: this.onChiomismExit })
            .addState(States.CONFUSE, { onEnter: this.onConfuseEnter, onUpdate: this.onConfuseUpdate, onExit: this.onConfuseExit })
            .addState(States.CONSUME, { onEnter: this.onConsumeEnter, onUpdate: this.onConsumeUpdate, onExit: this.onConsumeExit })
            .addState(States.DESPERATION, { onEnter: this.onDesperationEnter, onUpdate: this.onDesperationUpdate, onExit: this.onDesperationExit })
            .addState(States.FEAR, { onEnter: this.onFearingEnter, onUpdate: this.onFearingUpdate, onExit: this.onFearingExit })
            .addState(States.FROST, { onEnter: this.onFrostEnter, onUpdate: this.onFrostUpdate, onExit: this.onFrostExit })
            .addState(States.FYERUS, { onEnter: this.onFyerusEnter, onUpdate: this.onFyerusUpdate, onExit: this.onFyerusExit })
            .addState(States.HEALING, { onEnter: this.onHealingEnter, onUpdate: this.onHealingUpdate, onExit: this.onHealingExit })
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
        this.stateMachine.setState(States.NONCOMBAT);

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

    caerenicDamage = () => this.player.isCaerenic ? 1.15 : 1;

    levelModifier = () => (this.scene.state.player?.level as number + 9) / 10;

    mastery = () => this.scene.state.player?.[this.scene.state.player?.mastery as keyof typeof this.scene.state.player];

    chiomism = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId() || id === this.player.playerID) {
            this.scene.combatManager.combatMachine.action({ type: "Chiomic", data: power }); 
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const chiomic = Math.round(this.mastery() / 2 * (1 + power / 100) * this.caerenicDamage() * this.levelModifier());
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your hush flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: newComputerHealth, id: id } });
        };
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
            const drained = Math.round(this.scene.state.playerHealth * power * this.caerenicDamage() * this.levelModifier());
            const newPlayerHealth = drained / this.scene.state.playerHealth * 100;
            const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
            const playerActionDescription = `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "player", value: newPlayerHealth, id: this.player.playerID } });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: newHealth, id: this.player.spellTarget } });
        };
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
        if (this.player.spellTarget === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: "Chiomic", data: this.player.entropicMultiplier(power) }); 
        } else {
            const chiomic = Math.round(this.mastery() * (1 + (this.player.entropicMultiplier(power) / 100)) * this.caerenicDamage() * this.levelModifier());
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your wreathing tendrils rip ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: newComputerHealth, id: this.player.spellTarget } });
        };
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
    };

    sacrifice = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: "Sacrifice", data: power });
            this.player.currentTarget?.flickerCaerenic(750);
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const sacrifice = Math.round(this.mastery() * this.caerenicDamage() * this.levelModifier());
            let playerSacrifice = this.scene.state.newPlayerHealth - (sacrifice / 2 * (this.player.isStalwart ? 0.85 : 1)) < 0 ? 0 : this.scene.state.newPlayerHealth - (sacrifice / 2 * (this.player.isStalwart ? 0.85 : 1));
            let enemySacrifice = enemy.health - (sacrifice * (1 + power / 50)) < 0 ? 0 : enemy.health - (sacrifice * (1 + power / 50));
            const playerActionDescription = `You sacrifice ${sacrifice / 2 * (this.player.isStalwart ? 0.85 : 1)} health to rip ${sacrifice} from ${enemy.ascean?.name}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Set Health", data: { key: "player", value: playerSacrifice, id } });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: enemySacrifice, id } });
            enemy.flickerCaerenic(750);    
        };
    };

    suture = (id: string, power: number) => {
        this.player.entropicMultiplier(power);
        if (id === this.player.getEnemyId()) {
            this.scene.combatManager.combatMachine.action({ type: "Suture", data: power });
            this.player.currentTarget?.flickerCaerenic(750);
        } else {
            const enemy = this.scene.enemies.find((e: any) => e.enemyID === id);
            if (!enemy) return;
            const suture = Math.round(this.mastery() * this.caerenicDamage() * this.levelModifier()) * (1 * power / 100) * 0.8;
            let playerSuture = this.scene.state.newPlayerHealth + suture > this.scene.state.playerHealth ? this.scene.state.playerHealth : this.scene.state.newPlayerHealth + suture;
            let enemySuture = enemy.health - suture < 0 ? 0 : enemy.health - suture;                    
            const playerActionDescription = `Your suture ${enemy.ascean?.name}"s caeren into you, absorbing and healing for ${suture}.`;
            EventBus.emit("add-combat-logs", { ...this.scene.state, playerActionDescription });
            this.scene.combatManager.combatMachine.action({ type: "Set Health", data: { key: "player", value: playerSuture, id} });
            this.scene.combatManager.combatMachine.action({ type: "Health", data: { key: "enemy", value: enemySuture, id} });
            enemy.flickerCaerenic(750);
        };
    };

    healCheck = (power: number) => {
        if (this.player.currentTarget?.name === "party") {
            const partyMember = this.scene.party.find((e: Party) => e.enemyID === this.player.currentTarget?.enemyID);
            if (partyMember) {
                partyMember.playerMachine.heal(power/100);
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
    };

    
    instincts = () => {
        if (this.player.inCombat === false || this.player.health <= 0) {
            this.player.inCombat = false;
            // this.stateMachine.setState(States.IDLE);
            return;
        };
        this.player.isMoving = false;
        this.player.setVelocity(0);
        const ranged = this.player.isRanged;
        let chance = [1, 2, 4, 5, (!ranged ? 6 : 7), (!ranged ? 8 : 9), (!ranged ? 10 : 11), (!ranged ? 12 : 13)][Math.floor(Math.random() * 8)];
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
            
            (distance <= 60 && !ranged) ? 6 :
            (distance <= 60 && ranged) ? 7 :

            (distance > 60 && distance <= 120 && !ranged) ? 8 :
            (distance > 60 && distance <= 120 && ranged) ? 9 :

            (distance > 120 && distance <= 180 && !ranged) ? 10 :
            (distance > 120 && distance <= 180 && ranged) ? 11 :

            (distance > 180 && !ranged) ? 12 :
            (distance > 180 && ranged) ? 13 :

            chance;

        if (this.player.prevInstinct === instinct) {
            instinct = chance;
        };

        const focus = this.scene.hud.settings.computerFocus || BALANCED;
        let foci;
        switch (focus) {
            case BALANCED:
                foci = BALANCED_INSTINCTS[mastery as keyof typeof BALANCED_INSTINCTS];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case DEFENSIVE:
                foci = DEFENSIVE_INSTINCTS[mastery as keyof typeof DEFENSIVE_INSTINCTS];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
            case OFFENSIVE:
                foci = OFFENSIVE_INSTINCTS[mastery as keyof typeof OFFENSIVE_INSTINCTS];
                foci = foci[Math.floor(Math.random() * foci.length)];
                break;
        };

        let key = PLAYER_INSTINCTS[mastery as keyof typeof PLAYER_INSTINCTS][instinct].key, value = PLAYER_INSTINCTS[mastery as keyof typeof PLAYER_INSTINCTS][instinct].value;
        let finals = [instinct, foci];
        if (instinct === 0 || instinct === 3 || instinct === 7 || instinct === 12) {
            finals.push(instinct);
        };

        let final = finals[Math.floor(Math.random() * finals.length)];

        if (final === typeof "string") {
            if (specialStateMachines.includes(final)) { // State Machine
                key = "stateMachine";
                value = final;
            } else { // Positive Machine
                key = "positiveMachine";
                value = final;
            };
        };

        let check: {success:boolean;cost:number;} = {success:false,cost:0};
        const grace = PLAYER.STAMINA[value.toUpperCase() as keyof typeof PLAYER.STAMINA];
        check = staminaCheck(this.player.grace, grace);

        if (check.success === true) {
            this.player.specialCombatText = this.scene.showCombatText("Instinct", 750, "hush", false, true, () => this.player.specialCombatText = undefined);
            this.scene.hud.logger.log(`Your instinct leads you to ${value}.`);
            this.player.prevInstinct = instinct;
            (this as any)[key].setState(value);
            if (key === "positiveMachine") this.stateMachine.setState(States.CHASE);
        } else {
            this.player.specialCombatText = this.scene.showCombatText("Compose Yourself", 750, "dread", false, true, () => this.player.specialCombatText = undefined);
            if (Math.random() > 0.5) {
                this.stateMachine.setState(States.COMPUTER_COMBAT);
            } else {
                this.stateMachine.setState(States.CHASE);
            };
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
            !this.player.inCombat || distance > RANGE.LEASH * rangeMultiplier) {
            this.stateMachine.setState(States.IDLE);
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
        this.player.setVelocity(0, 0);
        if (this.player.chaseTimer) {
            this.player.chaseTimer?.remove(false);
            this.player.chaseTimer.destroy();
            this.player.chaseTimer = undefined;
        };
    };

    onLeashEnter = () => {
        this.player.inCombat = false;
        this.player.healthbar.setVisible(false);
        this.player.specialCombatText = this.scene.showCombatText("Leashing", 1500, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Defeated", 3000, "damage", false, true, () => this.player.specialCombatText = undefined);
        this.player.defeatedDuration = PLAYER.DURATIONS.DEFEATED;
        this.player.setCollisionCategory(0);
        screenShake(this.scene, 120, 0.005);
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
        if (this.player.isDodging === true) this.player.anims.play("player_slide", true);
        if (this.player.isRolling === true) this.player.anims.play("player_roll", true);
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
    onEvasionExit = () => (this.player as PlayerComputer).evaluateCombatDistance();

    onContemplateEnter = () => {
        if (this.player.inCombat === false || this.scene.state.newPlayerHealth <= 0) {
            this.player.inCombat = false;
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
        this.player.currentAction = "";
        this.instincts();
    };
    onIdleEnter = () => {
        this.player.setVelocity(0);
        this.player.currentRound = 0;
    };
    onIdleUpdate = (_dt: number) => {};
    onIdleExit = () => {};
    
    onNonCombatEnter = () => {};
    onNonCombatUpdate = (_dt: number) => {
        if (this.player.isMoving) this.player.isMoving = false;
        if (this.player.inCombat) this.stateMachine.setState(States.COMBAT);
    };
    onNonCombatExit = () => {};
    onCombatEnter = () => {
        if (this.player.isComputer) this.stateMachine.setState(States.COMPUTER_COMBAT);
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
    onLullExit = () => {};
    
    onComputerCombatEnter = () => {  
        if (this.player.inCombat === false || this.player.health <= 0) {
            this.player.inCombat = false;
            // this.stateMachine.setState(States.IDLE);
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
        this.scene.time.delayedCall(this.player.swingTimer, () => {
            this.player.frameCount = 0;
            this.player.computerAction = false;
            (this.player as PlayerComputer).evaluateCombat();
        }, undefined, this);
    };
    onComputerCombatUpdate = (_dt: number) => { 
        if (!this.player.computerAction) this.stateMachine.setState(States.LULL);  
    };

    onComputerAttackEnter = () => {
        this.player.isAttacking = true;
        this.player.frameCount = 0;
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_ATTACK);
    };
    onComputerAttackUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.player.isRanged) this.scene.combatManager.combatMachine.input("action", "attack");
        if (!this.player.isAttacking) (this.player as PlayerComputer).evaluateCombatDistance(); 
    };
    onComputerAttackExit = () => {
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.frameCount = 0;
        this.player.computerAction = false;    
        // if (!this.player.isRanged) this.player.anims.play("player_idle", true);
    };

    onComputerParryEnter = () => {
        this.player.isParrying = true;
        this.player.frameCount = 0;
        // this.player.anims.play("player_attack_1", true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_PARRY);
        if (this.player.hasMagic === true) {
            this.player.specialCombatText = this.scene.showCombatText("Counter Spell", 1000, "hush", false, true, () => this.player.specialCombatText = undefined);
            this.player.isCounterSpelling = true;
            this.player.flickerCaerenic(1000); 
            this.scene.time.delayedCall(1000, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
    };
    onComputerParryUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.PARRY_LIVE && !this.player.isRanged) this.scene.combatManager.combatMachine.input("action", "parry");
        if (this.player.frameCount >= FRAME_COUNT.PARRY_KILL) this.player.isParrying = false;
        if (!this.player.isParrying) (this.player as PlayerComputer).evaluateCombatDistance();
    };
    onComputerParryExit = () => {
        this.player.isParrying = false;
        this.player.currentAction = "";
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.frameCount = 0;
        this.player.computerAction = false;    
        // if (!this.player.isRanged) this.player.anims.play("player_idle", true);
    };

    onComputerPostureEnter = () => {
        this.player.isPosturing = true;
        this.player.spriteShield.setVisible(true);
        this.player.frameCount = 0;
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_POSTURE);
    };
    onComputerPostureUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.player.isRanged) this.scene.combatManager.combatMachine.input("action", "posture");
        if (!this.player.isPosturing) (this.player as PlayerComputer).evaluateCombatDistance();
    };
    onComputerPostureExit = () => {
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.spriteShield.setVisible(this.player.isStalwart);
        this.player.frameCount = 0;
        this.player.computerAction = false;    
        // if (!this.player.isRanged) this.player.anims.play("player_idle", true);
    };

    onComputerThrustEnter = () => {
        this.player.isThrusting = true;
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.COMPUTER_THRUST);
        this.player.frameCount = 0;
    };
    onComputerThrustUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.THRUST_LIVE && !this.player.isRanged) this.scene.combatManager.combatMachine.input("action", "thrust");
        if (!this.player.isThrusting) (this.player as PlayerComputer).evaluateCombatDistance();
    };
    onComputerThrustExit = () => {
        this.scene.combatManager.combatMachine.input("action", "");
        this.player.frameCount = 0;
        this.player.computerAction = false;
        if (!this.player.isRanged) this.player.anims.play("player_idle", true);
    };

    onAttackEnter = () => {
        if (this.player.isPosturing || this.player.isParrying || this.player.isThrusting) {return};
        if (this.player.isRanged === true && this.player.inCombat === true) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct) {
                this.player.resistCombatText = this.scene.showCombatText("Skill Issue: Look at the Enemy!", 1000, "damage", false, true, () => this.player.resistCombatText = undefined);
                return;
            };
        };
        this.player.isAttacking = true;
        this.player.swingReset(States.ATTACK, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.ATTACK);
        this.player.frameCount = 0;
    }; 
    onAttackUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input("action", "attack");
        };
        this.player.combatChecker(this.player.isAttacking);
    }; 
    onAttackExit = () => {if (this.scene.state.action === "attack") this.scene.combatManager.combatMachine.input("action", "");  this.player.computerAction = false;};

    onParryEnter = () => {
        this.player.isParrying = true;    
        this.player.swingReset(States.PARRY, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.PARRY);
        if (this.player.hasMagic === true) {
            this.player.specialCombatText = this.scene.showCombatText("Counter Spell", 1000, "hush", false, true, () => this.player.specialCombatText = undefined);
            this.player.isCounterSpelling = true;
            this.player.flickerCaerenic(1000); 
            this.scene.time.delayedCall(1000, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
        this.player.frameCount = 0;
    };
    onParryUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.PARRY_LIVE && !this.player.isRanged) this.scene.combatManager.combatMachine.input("action", "parry");
        if (this.player.frameCount >= FRAME_COUNT.PARRY_KILL) this.player.isParrying = false;
        this.player.combatChecker(this.player.isParrying);
    };
    onParryExit = () => {if (this.scene.state.action === "parry") this.scene.combatManager.combatMachine.input("action", "");this.player.computerAction = false;};

    onPostureEnter = () => {
        if (this.player.isAttacking || this.player.isParrying || this.player.isThrusting) return;
        if (this.player.isRanged === true) {
            if (this.player.isMoving === true) {
                this.player.resistCombatText = this.scene.showCombatText("Posture Issue: You are Moving", 1000, "damage", false, true, () => this.player.resistCombatText = undefined);
                return;
            };
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct && this.player.inCombat === true) {
                this.player.resistCombatText = this.scene.showCombatText("Skill Issue: Look at the Enemy!", 1000, "damage", false, true, () => this.player.resistCombatText = undefined);
                return;
            };
        };
        this.player.isPosturing = true;
        this.player.spriteShield.setVisible(true);
        this.player.swingReset(States.POSTURE, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.POSTURE);
        this.player.frameCount = 0;
    };
    onPostureUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input("action", "posture");
        };
        this.player.combatChecker(this.player.isPosturing);
    };
    onPostureExit = () => {if (this.scene.state.action === "posture") this.scene.combatManager.combatMachine.input("action", ""); this.player.spriteShield.setVisible(this.player.isStalwart); this.player.computerAction = false;};

    onDodgeEnter = () => {
        if (this.player.isStalwart || this.player.isStorming || this.player.isRolling) return;
        this.player.isDodging = true;
        this.scene.combatManager.useStamina(this.player.isComputer ? PLAYER.STAMINA.COMPUTER_DODGE : PLAYER.STAMINA.DODGE);
        if (!this.player.isComputer) this.player.swingReset(States.DODGE, true);
        this.scene.sound.play("dodge", { volume: this.scene.hud.settings.volume / 2 });
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
        this.scene.combatManager.useStamina(this.player.isComputer ? PLAYER.STAMINA.COMPUTER_ROLL : PLAYER.STAMINA.ROLL);
        if (!this.player.isComputer) this.player.swingReset(States.ROLL, true);
        this.scene.sound.play("roll", { volume: this.scene.hud.settings.volume / 2 });
        (this.player.body as any).parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        (this.player.body as any).parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
        this.player.frameCount = 0;
    };
    onRollUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.ROLL_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input("action", "roll");
        };
        this.player.combatChecker(this.player.isRolling);
    };
    onRollExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.rollCooldown = 0; 
        if (this.scene.state.action !== "") {
            this.scene.combatManager.combatMachine.input("action", "");
        };
        this.player.computerAction = false;
        (this.player.body as any).parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        (this.player.body as any).parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        (this.player.body as any).parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        (this.player.body as any).parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
    };

    onThrustEnter = () => {
        if (this.player.isAttacking || this.player.isParrying || this.player.isPosturing) return;
        if (this.player.isRanged === true && !this.player.isComputer) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct && this.player.inCombat === true) {
                this.player.resistCombatText = this.scene.showCombatText("Skill Issue: Look at the Enemy!", 1000, "damage", false, true, () => this.player.resistCombatText = undefined);
                return;
            };
        };
        this.player.isThrusting = true;
        this.player.swingReset(States.THRUST, true);
        this.scene.combatManager.useStamina(this.player.staminaModifier + PLAYER.STAMINA.THRUST);
        this.player.frameCount = 0;
    };
    onThrustUpdate = (_dt: number) => {
        if (this.player.frameCount === FRAME_COUNT.THRUST_LIVE && !this.player.isRanged) {
            this.scene.combatManager.combatMachine.input("action", "thrust");
        };
        this.player.combatChecker(this.player.isThrusting);
    };
    onThrustExit = () => {if (this.scene.state.action === "thrust") this.scene.combatManager.combatMachine.input("action", ""); this.player.computerAction = false;};

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
        this.player.specialCombatText = this.scene.showCombatText("Achire", PLAYER.DURATIONS.ACHIRE / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onAchireExit = () => {
        if (this.player.castingSuccess === true) { 
            this.player.particleEffect =  this.scene.particleManager.addEffect("achire", this.player, "achire", true);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ACHIRE, PLAYER.COOLDOWNS.SHORT);
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `Your Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0]?.name}.`
            });
            this.player.castingSuccess = false;
            this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.ACHIRE, PLAYER.STAMINA.ACHIRE);
            screenShake(this.scene, 96, 0.004);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onAstraveEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText("Astrave", PLAYER.DURATIONS.ASTRAVE / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
            this.player.castbar.update(dt, "cast");
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
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You unearth the winds and lightning from the land of hush and tendril.`
            });
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.ASTRAVE, PLAYER.STAMINA.ASTRAVE);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onArcEnter = () => {
        this.player.isArcing = true;
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Arcing", PLAYER.DURATIONS.ARCING / 2, "damage", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ARCING);
        this.player.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
        this.player.setStatic(true);
        this.player.castbar.setVisible(true); 
        this.player.flickerCaerenic(3000); 
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You begin arcing with your ${this.scene.state.weapons[0]?.name}.`
        });
        // this.scene.tweens.add({
        //     targets: this.scene.cameras.main,
        //     zoom: this.scene.cameras.main.zoom * 2,
        //     ease: Phaser.Math.Easing.Elastic.InOut,
        //     duration: 500,
        //     yoyo: true
        // });
    };
    onArcUpdate = (dt: number) => {
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
            screenShake(this.scene, 96, 0.004);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ARC, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.player.checkTalentCost(States.ARC, PLAYER.STAMINA.ARC);
            if (this.player.touching.length > 0) {
                for (let i = 0; i < this.player.touching.length; ++i) {
                    this.scene.combatManager.playerMelee(this.player.touching[i].enemyID, "arc");
                    if (this.player.checkTalentEnhanced(States.ARC)) this.scene.combatManager.stun(this.player.touching[i].enemyID);
                };
            };
        };
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.setStatic(false);
    };

    onBlinkEnter = () => {
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
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

    onChiomismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.specialCombatText = this.scene.showCombatText("Chiomism", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.CHIOMISM);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.CHIOMISM);                          
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
    };
    onChiomismUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CHIOMISM) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onChiomismExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            const ceiling = this.player.checkTalentEnhanced(States.CHIOMISM) ? 50 : 75;
            if (chance > ceiling) this.scene.combatManager.confuse(this.player.spellTarget, this.player.checkTalentEnhanced(States.CONFUSE));
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You bleed and laugh at ${this.player.spellName} with tendrils of Chiomyr.`
            });
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.CHIOMISM, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("death", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.CHIOMISM, PLAYER.STAMINA.CHIOMISM);
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.spellName = "";
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);  
    };
    onConfuseEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText("Confusing", PLAYER.DURATIONS.CONFUSE / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onConfuseExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.confuse(this.player.spellTarget, this.player.checkTalentEnhanced(States.CONFUSE));
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.CONFUSE, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("death", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.CONFUSE, PLAYER.STAMINA.CONFUSE);
            screenShake(this.scene);
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You confuse ${this.player.spellName}, and they stumble around in a daze.`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.spellName = "";
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onConsumeEnter = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.player.isPraying = true;
        this.scene.sound.play("consume", { volume: this.scene.hud.settings.volume });
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CONSUME, PLAYER.COOLDOWNS.SHORT);
        
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

    onDesperationEnter = () => {
        this.player.specialCombatText = this.scene.showCombatText("Desperation", PLAYER.DURATIONS.HEALING / 2, "heal", false, true, () => this.player.specialCombatText = undefined);
        this.player.checkTalentCost(States.DESPERATION, PLAYER.STAMINA.DESPERATION);
        this.player.flickerCaerenic(PLAYER.DURATIONS.HEALING); 
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0]?.influences?.[0]} soothes your body.`
        });
    };
    onDesperationUpdate = (_dt: number) => this.player.combatChecker(false);
    onDesperationExit = () => {
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DESPERATION, PLAYER.COOLDOWNS.LONG);
        const power = this.player.checkTalentEnhanced(States.DESPERATION) ? 100 : 50;
        this.healCheck(power);
        this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
    };

    onDevourEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return; 
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isCasting = true;
        this.player.currentTarget.isConsumed = true;
        this.player.checkTalentCost(States.DEVOUR, PLAYER.STAMINA.DEVOUR);
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.flickerCaerenic(2000); 
        this.player.specialCombatText = this.scene.showCombatText("Devouring", PLAYER.DURATIONS.DEVOUR / 2, "damage", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.DEVOUR);
        this.player.castbar.setTime(PLAYER.DURATIONS.DEVOUR);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.DEVOUR);
        const power = this.player.checkTalentEnhanced(States.DEVOUR) ? 0.06 : 0.04;
        this.scene.tweens.add({
            targets: [this.player, this.player.spriteShield, this.player.spriteWeapon],
            scale: 1.1,
            ease: Phaser.Math.Easing.Back.InOut,
            duration: 500,
            yoyo: true,
            repeat: 1
        });
        this.player.devourTimer = this.scene.time.addEvent({
            delay: 400,
            callback: () => this.devour(power),
            callbackScope: this,
            repeat: 5,
        });
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DEVOUR, PLAYER.COOLDOWNS.LONG);
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => this.player.isCasting = false,
            callbackScope: this,
            loop: false,
        });
        this.player.setStatic(true);
        this.player.castbar.setVisible(true); 
    };
    onDevourUpdate = (dt: number) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, "channel", "TENDRIL");
        };
    };
    onDevourExit = () => {
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0; 
        this.player.beam.reset();
        this.player.spellTarget = "";
        this.player.setStatic(false);
        if (this.player.devourTimer !== undefined) {
            this.player.devourTimer.remove(false);
            this.player.devourTimer = undefined;
        };
    };

    onFearingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText("Fearing", PLAYER.DURATIONS.FEAR / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onFearingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.fear(this.player.spellTarget, this.player.checkTalentEnhanced(States.FEAR));
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.FEAR, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.FEAR, PLAYER.STAMINA.FEAR);
            screenShake(this.scene);
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You strike fear into ${this.scene.state.computer?.name}!`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.spellName = "";
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);  
    };

    onFrostEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.specialCombatText = this.scene.showCombatText("Frost", PLAYER.DURATIONS.FROST / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.FROST);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.FROST);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
    };
    onFrostUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.FROST) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onFrostExit = () => {
        if (this.player.castingSuccess === true) {
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You seize into this world with Nyrolean tendrils, slowing ${this.player.spellName}.`
            });
            this.chiomism(this.player.spellTarget, 75);
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
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        this.player.spellTarget = "";
        this.player.spellName = "";
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onFyerusEnter = () => {
        this.player.isCasting = true;
        if (this.player.isMoving === true) this.player.isCasting = false;
        if (this.player.isCasting === false) return;
        this.player.specialCombatText = this.scene.showCombatText("Fyerus", PLAYER.DURATIONS.FYERUS / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (!this.player.isComputer) this.player.setTimeEvent("fyerusCooldown", PLAYER.COOLDOWNS.SHORT);
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        EventBus.emit("special-combat-text", {
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
            this.player.castbar.update(dt, "channel", "FYERUS");
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
        this.player.specialCombatText = this.scene.showCombatText("Healing", PLAYER.DURATIONS.HEALING / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast", "HEAL");
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
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onIlirechEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.specialCombatText = this.scene.showCombatText("Ilirech", PLAYER.DURATIONS.ILIRECH / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.ILIRECH);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.ILIRECH);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onIlirechExit = () => {
        if (this.player.castingSuccess === true) {
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You rip into this world with Ilian tendrils entwining.`
            });
            this.chiomism(this.player.spellTarget, 100);
            if (this.player.checkTalentEnhanced(States.ILIRECH)) {
                const chance = Phaser.Math.Between(1, 100);
                if (chance > 75) this.scene.combatManager.stun(this.player.spellTarget);
            };
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ILIRECH, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("fire", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.ILIRECH, PLAYER.STAMINA.ILIRECH);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
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
    };
    onInvokeUpdate = (_dt: number) => this.player.combatChecker(this.player.isPraying);
    onInvokeExit = () => {
        this.player.setStatic(false);
        if (!this.player.currentTarget || this.player.currentTarget.health <= 0 || this.player.outOfRange(PLAYER.RANGE.LONG)) return;
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

    onKynisosEnter = () => { 
        this.player.specialCombatText = this.scene.showCombatText("Kynisos", PLAYER.DURATIONS.KYNISOS / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYNISOS);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);   
    };
    onKynisosUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.KYNISOS) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, "cast");
        };
    };
    onKynisosExit = () => {
        if (this.player.castingSuccess === true) {
            if (this.player.isComputer) {
                this.player.aoe = this.scene.aoePool.get("kynisos", 3, false, undefined, false, this.player.currentTarget);    
            } else {
                this.player.aoe = this.scene.aoePool.get("kynisos", 3, false, undefined, true);    
            };
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You unearth the netting of the golden hunt.`
            });
            if (!this.player.isComputer) this.player.setTimeEvent("kynisosCooldown", PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
            this.scene.combatManager.useGrace(PLAYER.STAMINA.KYNISOS);    
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onKyrisianEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.specialCombatText = this.scene.showCombatText("Kyrisian", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYRISIAN);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.KYRISIAN);                          
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
    };
    onKyrisianUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.KYRISIAN) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onKyrisianExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            const ceiling = this.player.checkTalentEnhanced(States.KYRISIAN) ? 50 : 75;
            if (chance > ceiling) this.scene.combatManager.paralyze(this.player.spellTarget);
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You bleed and bewitch ${this.player.spellName} with tendrils of Kyrisos.`
            });
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.KYRISIAN, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.KYRISIAN, PLAYER.STAMINA.KYRISIAN);    
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.spellName = "";
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);  
    };

    onKyrnaicismEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isCasting = true;
        this.player.checkTalentCost(States.KYRNAICISM, PLAYER.STAMINA.KYRNAICISM);    
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.flickerCaerenic(3000); 
        this.player.specialCombatText = this.scene.showCombatText("Kyrnaicism", PLAYER.DURATIONS.KYRNAICISM / 2, "damage", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.player.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.player.currentTarget.isConsumed = true;
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.KYRNAICISM);
        this.scene.combatManager.slow(this.player.spellTarget, 1000);
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
        this.player.setStatic(true);
        this.player.castbar.setVisible(true);  
    };
    onKyrnaicismUpdate = (dt: number) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", "TENDRIL");
    };
    onKyrnaicismExit = () => {
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        this.player.spellTarget = "";
        this.player.setStatic(false);
        if (this.player.chiomicTimer) {
            this.player.chiomicTimer.remove(false);
            this.player.chiomicTimer = undefined;
        }; 
    };
    
    onLikyrEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean.name;
        this.player.specialCombatText = this.scene.showCombatText("Likyr", PLAYER.DURATIONS.LIKYR / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(PLAYER.DURATIONS.LIKYR);
        this.player.beam.startEmitter(this.player.currentTarget, PLAYER.DURATIONS.LIKYR);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); 
        this.player.castbar.setVisible(true);  
    };
    onLikyrUpdate = (dt: number) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.LIKYR) {
            this.player.castingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onLikyrExit = () => {
        if (this.player.castingSuccess === true) {
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You blend caeren into this world with Likyrish tendrils entwining.`
            });
            this.suture(this.player.spellTarget, 30);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.LIKYR, PLAYER.COOLDOWNS.MODERATE);
            if (this.player.checkTalentEnhanced(States.LIKYR)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Heal" });
            this.player.castingSuccess = false;
            this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.LIKYR, PLAYER.STAMINA.LIKYR);
        };
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        this.player.spellTarget = "";
        this.player.spellName = "";
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onLeapEnter = () => {
        this.player.leap();
    };
    onLeapUpdate = (_dt: number) => this.player.combatChecker(this.player.isLeaping);
    onLeapExit = () => {
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.LEAP, PLAYER.COOLDOWNS.SHORT);
        this.player.checkTalentCost(States.LEAP, PLAYER.STAMINA.LEAP);
    };

    onMaierethEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.specialCombatText = this.scene.showCombatText("Maiereth", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onMaierethExit = () => {
        if (this.player.castingSuccess === true) {
            this.sacrifice(this.player.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            const ceiling = this.player.checkTalentEnhanced(States.MAIERETH) ? 50 : 75;
            if (chance > ceiling) this.scene.combatManager.fear(this.player.spellTarget);
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You bleed and strike ${this.scene.state.computer?.name} with tendrils of Ma"anre.`
            });
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.MAIERETH, PLAYER.COOLDOWNS.SHORT);
            this.player.castingSuccess = false;
            this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
            this.player.checkTalentCost(States.MAIERETH, PLAYER.STAMINA.MAIERETH);
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);  
    };

    onHookEnter = () => {
        this.player.particleEffect = this.scene.particleManager.addEffect("hook", this.player, "hook", true);
        this.player.specialCombatText = this.scene.showCombatText("Hook", DURATION.TEXT, "damage", false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
        this.player.flickerCaerenic(750);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.HOOK, PLAYER.COOLDOWNS.SHORT);
        this.player.checkTalentCost(States.HOOK, PLAYER.STAMINA.HOOK);
        this.player.beam.startEmitter(this.player.particleEffect.effect, 1750);
        this.player.hookTime = 0;
        screenShake(this.scene);
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.scene.cameras.main.zoom * 1.5,
            ease: Phaser.Math.Easing.Elastic.InOut,
            duration: 750,
            yoyo: true
        });
    };
    onHookUpdate = (dt: number) => {
        this.player.hookTime += dt;
        if (this.player.hookTime >= 1750 || !this.player.particleEffect?.effect) {
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
        this.player.specialCombatText = this.scene.showCombatText("Marking", DURATION.TEXT, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Netherswap", DURATION.TEXT / 2, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Recalling", DURATION.TEXT, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.flickerCaerenic(1000);
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
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
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText("Paralyzing", PLAYER.DURATIONS.PARALYZE / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onParalyzeExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.paralyze(this.player.spellTarget);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.PARALYZE, PLAYER.COOLDOWNS.MODERATE);
            this.player.checkTalentCost(States.PARALYZE, PLAYER.STAMINA.PARALYZE);
            if (this.player.checkTalentEnhanced(States.PARALYZE)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Debuff" });
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });        
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You paralyze ${this.scene.state.computer?.name} for several seconds!`
            });
            screenShake(this.scene);
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.spellName = "";
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); 
    };

    onPolymorphingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name
        this.player.specialCombatText = this.scene.showCombatText("Polymorphing", PLAYER.DURATIONS.POLYMORPH / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onPolymorphingExit = () => {
        if (this.player.castingSuccess === true) {
            this.scene.combatManager.polymorph(this.player.spellTarget, this.player.checkTalentEnhanced(States.POLYMORPH));
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You ensorcel ${this.player.spellName}, polymorphing them!`
            });
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.POLYMORPH, PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost(States.POLYMORPH, PLAYER.STAMINA.POLYMORPH);
            this.player.castingSuccess = false;
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });        
            screenShake(this.scene);
        };
        this.player.spellTarget = "";
        this.player.spellName = "";
        this.player.isCasting = false;
        this.player.castbar.reset();
        this.player.frameCount = 0;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
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
        screenShake(this.scene, 96);
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.scene.cameras.main.zoom * 1.5,
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
        this.player.specialCombatText = this.scene.showCombatText("Quor", PLAYER.DURATIONS.QUOR / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onQuorExit = () => {
        if (this.player.castingSuccess === true) {
            this.player.particleEffect =  this.scene.particleManager.addEffect("quor", this.player, "quor", true);
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `Your Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0]?.name}.`
            });
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.QUOR, PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost(States.QUOR, PLAYER.STAMINA.QUOR);
            this.player.castingSuccess = false;
            this.scene.sound.play("freeze", { volume: this.scene.hud.settings.volume });
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
        this.player.checkTalentCost(States.RECONSTITUTE, PLAYER.STAMINA.RECONSTITUTE);
        const duration = this.player.checkTalentEnhanced(States.RECONSTITUTE) ? PLAYER.DURATIONS.RECONSTITUTE / 2 : PLAYER.DURATIONS.RECONSTITUTE;
        this.player.specialCombatText = this.scene.showCombatText("Reconstitute", duration / 2, "heal", false, true, () => this.player.specialCombatText = undefined);
        this.player.castbar.setTotal(duration);
        this.player.castbar.setTime(duration);
        this.player.beam.startEmitter(this, duration);
        this.player.reconTimer = this.scene.time.addEvent({
            delay: this.player.checkTalentEnhanced(States.RECONSTITUTE) ? 500 : 1000,
            callback: () => this.reconstitute(),
            callbackScope: this,
            repeat: 5,
        });
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RECONSTITUTE, PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.addEvent({
            delay: this.player.checkTalentEnhanced(States.RECONSTITUTE) ? 2500 : 5000,
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
        if (this.player.isCasting) this.player.castbar.update(dt, "channel", "HEAL");
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
        this.healCheck(15);
        this.scene.sound.play("phenomena", { volume: this.scene.hud.settings.volume });
    };

    onRootingEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.isCasting = true;
        this.player.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
        this.player.specialCombatText = this.scene.showCombatText("Rooting", PLAYER.DURATIONS.ROOTING / 2, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
    };
    onRootingExit = () => { 
        if (this.player.castingSuccess === true) {
            this.player.castingSuccess = false;
            this.scene.combatManager.root(this.player.spellTarget);
            if (!this.player.isComputer) this.player.checkTalentCooldown(States.ROOT, PLAYER.COOLDOWNS.SHORT);
            this.player.checkTalentCost(States.ROOT, PLAYER.STAMINA.ROOT);
            if (this.player.checkTalentEnhanced(States.ROOT)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Silence" });
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You ensorcel ${this.player.spellName}, rooting them!`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.spellName = "";
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
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RUSH, PLAYER.COOLDOWNS.SHORT);
        
        this.player.checkTalentCost(States.RUSH, PLAYER.STAMINA.RUSH);
    };

    onSlowEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSlowing = true;
        this.player.specialCombatText = this.scene.showCombatText("Slow", 750, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        if (this.player.checkTalentEnhanced(States.SLOW)) {
            this.scene.combatManager.snare(this.player.spellTarget);
        } else {
            this.scene.combatManager.slow(this.player.spellTarget, 3000);
        };
        this.player.checkTalentCost(States.SLOW, PLAYER.STAMINA.SLOW);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SLOW, PLAYER.COOLDOWNS.SHORT);
        this.player.flickerCaerenic(500); 
        this.scene.time.delayedCall(500, () => this.player.isSlowing = false, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You ensorcel ${this.player.currentTarget.ascean?.name}, slowing them!`
        });
        screenShake(this.scene);
    };
    onSlowUpdate = (_dt: number) => this.player.combatChecker(this.player.isSlowing);
    onSlowExit = () => this.player.spellTarget = "";

    onSacrificeEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSacrificing = true;
        this.player.specialCombatText = this.scene.showCombatText("Sacrifice", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.SACRIFICE, PLAYER.STAMINA.SACRIFICE);
        this.sacrifice(this.player.spellTarget, 10);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SACRIFICE, PLAYER.COOLDOWNS.MODERATE);
        if (this.player.checkTalentEnhanced(States.SACRIFICE)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Damage" });
        this.player.flickerCaerenic(500);  
        this.scene.time.delayedCall(500, () => this.player.isSacrificing = false, undefined, this);
    };
    onSacrificeUpdate = (_dt: number) => this.player.combatChecker(this.player.isSacrificing);
    onSacrificeExit = () => this.player.spellTarget = "";

    onSnaringEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.LONG) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.spellName = this.player.currentTarget.ascean?.name;
        this.player.specialCombatText = this.scene.showCombatText("Snaring", PLAYER.DURATIONS.SNARE, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.isCasting === true) this.player.castbar.update(dt, "cast");
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
            EventBus.emit("special-combat-text", {
                playerSpecialDescription: `You ensorcel ${this.player.spellName}, snaring them!`
            });
        };
        this.player.isCasting = false;
        this.player.spellTarget = "";
        this.player.spellName = "";
        this.player.castbar.reset();
        this.player.frameCount = 0;
        this.player.beam.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onStormEnter = () => this.player.storm();
    onStormUpdate = (_dt: number) => this.player.combatChecker(this.player.isStorming);
    onStormExit = () => {if (!this.player.isComputer) this.player.setTimeEvent("stormCooldown", this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3)};

    onSutureEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.spellTarget = this.player.currentTarget.enemyID;
        this.player.isSuturing = true;
        this.player.specialCombatText = this.scene.showCombatText("Suture", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.player.checkTalentCost(States.SUTURE, PLAYER.STAMINA.SUTURE);
        this.suture(this.player.spellTarget, 20);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SUTURE, PLAYER.COOLDOWNS.MODERATE);
        if (this.player.checkTalentEnhanced(States.SUTURE)) this.scene.combatManager.combatMachine.action({ type: "Prayer", data: "Buff" });
        this.player.flickerCaerenic(500); 
        this.scene.time.delayedCall(500, () => {
            this.player.isSuturing = false;
        }, undefined, this);
    };
    onSutureUpdate = (_dt: number) => this.player.combatChecker(this.player.isSuturing);
    onSutureExit = () => this.player.spellTarget = "";

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
        this.player.specialCombatText = this.scene.showCombatText("Absorbing", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You warp oncoming damage into grace.`
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
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Absorbed", 500, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Hah! Hah!", PLAYER.DURATIONS.CHIOMIC, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.isChiomic = true;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CHIOMIC, PLAYER.COOLDOWNS.MODERATE);
        
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.player.isChiomic = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You mock and confuse your surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt: number) => {if (this.player.isChiomic === false) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.player.isDiseasing = true;
        this.player.aoe = this.scene.aoePool.get("tendril", 6);    
        this.scene.sound.play("dungeon", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Tendrils Swirl", 750, "tendril", false, true, () => this.player.specialCombatText = undefined);
        this.player.checkTalentCost(States.DISEASE, PLAYER.STAMINA.DISEASE);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DISEASE, PLAYER.COOLDOWNS.MODERATE);
        
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.player.isDiseasing = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You swirl such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt: number) => {if (this.player.isDiseasing === false) this.positiveMachine.setState(States.CLEAN);};
    onDiseaseExit = () => this.player.aoe.cleanAnimation(this.scene);

    onHowlEnter = () => {
        this.player.checkTalentCost(States.HOWL, PLAYER.STAMINA.HOWL);
        this.player.aoe = this.scene.aoePool.get("howl", 1);
        this.scene.sound.play("howl", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Howling", PLAYER.DURATIONS.HOWL, "damage", false, true, () => this.player.specialCombatText = undefined);
        this.player.isHowling = true;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.HOWL, PLAYER.COOLDOWNS.MODERATE);
        
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.player.isHowling = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You howl, it"s otherworldly nature stunning nearby foes.`
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
        this.player.checkTalentCost(States.ENVELOP, PLAYER.STAMINA.ENVELOP);
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Enveloping", 750, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
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
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Enveloped", 500, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Freezing", PLAYER.DURATIONS.FREEZE, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.player.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.player.isFreezing = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You freeze nearby foes.`
        });
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
        this.player.specialCombatText = this.scene.showCombatText("Malice", 750, "hush", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
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
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Malicing", 750, "hush", false, true, () => this.player.specialCombatText = undefined);
        const power = this.player.checkTalentEnhanced(States.MALICE) ? 60 : 20;
        this.chiomism(id, power);
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
        this.player.specialCombatText = this.scene.showCombatText("Menacing", 750, "tendril", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You seek to menace oncoming attacks.`
        });
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
        this.player.specialCombatText = this.scene.showCombatText("Menacing", 500, "tendril", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Mending", 750, "tendril", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
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
        this.scene.sound.play("caerenic", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Mending", 500, "tendril", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Moderate", 750, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You seek to moderate oncoming attacks.`
        });
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
        this.player.specialCombatText = this.scene.showCombatText("Moderating", 500, "sapphire", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Multifarious", 750, "cast", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You seek to multifare oncoming attacks.`
        });
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
        this.player.specialCombatText = this.scene.showCombatText("Multifaring", 500, "ultramarine", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Mystify", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You seek to mystify enemies when struck.`
        });
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
        this.player.specialCombatText = this.scene.showCombatText("Mystifying", 500, "chartreuse", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Protecting", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        const duration = this.player.checkTalentEnhanced(States.PROTECT) ? PLAYER.DURATIONS.PROTECT * 1.5 : PLAYER.DURATIONS.PROTECT;
        this.player.negationBubble = new Bubble(this.scene, this.player.x, this.player.y, "gold", duration);
        if (!this.player.isComputer) this.player.setTimeEvent("protectCooldown", PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(duration, () => {
            this.player.isProtecting = false;    
            if (this.player.negationBubble) {
                this.player.negationBubble.cleanUp();
                this.player.negationBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit("special-combat-text", {
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
        this.player.checkTalentCost(States.RECOVER, PLAYER.STAMINA.RECOVER);
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Recovering", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.reactiveBubble = new Bubble(this.scene, this.player.x, this.player.y, "green", PLAYER.DURATIONS.RECOVER);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RECOVER, PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RECOVER, () => {
            this.player.isRecovering = false;    
            if (this.player.reactiveBubble) {
                this.player.reactiveBubble.cleanUp();
                this.player.reactiveBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You warp oncoming damage into stamina.`
        });
    };
    onRecoverUpdate = (_dt: number) => {if (!this.player.isRecovering) this.positiveMachine.setState(States.CLEAN);};

    recover = () => {
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Recovered", 500, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Rein", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your hush warps oncoming damage into grace.`
        });
    };
    onReinUpdate = (_dt: number) => {if (!this.player.isReining) this.positiveMachine.setState(States.CLEAN);};

    rein = () => {
        this.scene.sound.play("absorb", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Reining", 500, "effect", false, true, () => this.player.specialCombatText = undefined);
        const grace = this.player.checkTalentEnhanced(States.REIN) ? -30 : -15;
        this.scene.combatManager.useGrace(grace);
    };

    onRenewalEnter = () => {
        this.player.isRenewing = true;
        this.player.checkTalentCost(States.RENEWAL, PLAYER.STAMINA.RENEWAL);
        this.player.aoe = this.scene.aoePool.get("renewal", 6, true);    
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Hush Tears", 750, "bone", false, true, () => this.player.specialCombatText = undefined);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.RENEWAL, PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.player.isRenewing = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt: number) => {if (!this.player.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        this.player.checkTalentCost(States.SCREAM, PLAYER.STAMINA.SCREAM);
        this.player.aoe = this.scene.aoePool.get("scream", 1);
        this.scene.sound.play("scream", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Screaming", 750, "hush", false, true, () => this.player.specialCombatText = undefined);
        this.player.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.player.isScreaming = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You scream, fearing nearby foes.`
        });
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
        this.player.specialCombatText = this.scene.showCombatText("Shielding", 750, "bone", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
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
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Shield Hit", 500, "bone", false, true, () => this.player.specialCombatText = undefined);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        if (this.player.negationBubble.charges <= 0) {
            this.player.specialCombatText = this.scene.showCombatText("Shield Broken", 500, "damage", false, true, () => this.player.specialCombatText = undefined);
            this.player.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.scene.cameras.main.zoom * 1.5,
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You shimmer, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt: number) => {if (!this.player.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmer = () => {
        const shimmers = ["It fades through you", "You simply weren't there", "Perhaps you never were", "They don't seem certain of you at all"];
        const shim = shimmers[Math.floor(Math.random() * shimmers.length)];
        this.scene.sound.play("stealth", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText(shim, 1500, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You tap into your caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt: number) => {if (!this.player.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onStealthEnter = () => {
        if (!this.player.isShimmering) this.player.isStealthing = true; 
        this.stealthEffect(true);    
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You step halfway into the land of hush and tendril.`
        });
    };
    onStealthUpdate = (_dt: number) => {if (!this.player.isStealthing || this.scene.combat) this.positiveMachine.setState(States.CLEAN);};
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
        this.player.specialCombatText = this.scene.showCombatText("Warding", 750, "damage", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
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
        this.scene.sound.play("parry", { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.stunned(id);
        this.player.negationBubble.setCharges(this.player.negationBubble.charges - 1);
        this.player.specialCombatText = this.scene.showCombatText("Warded", 500, "effect", false, true, () => this.player.specialCombatText = undefined);
        if (this.player.negationBubble.charges <= 0) {
            this.player.specialCombatText = this.scene.showCombatText("Ward Broken", 500, "damage", false, true, () => this.player.specialCombatText = undefined);
            this.player.negationBubble.setCharges(0);
            this.player.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.player.checkTalentCost(States.WRITHE, PLAYER.STAMINA.WRITHE);
        this.player.aoe = this.scene.aoePool.get("writhe", 1);
        this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Writhing", 750, "tendril", false, true, () => this.player.specialCombatText = undefined);
        this.player.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.player.isWrithing = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
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
        this.player.specialCombatText = this.scene.showCombatText("Astrication", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.isAstrifying = true;
        const duration = this.player.checkTalentEnhanced(States.ASTRICATION) ? PLAYER.DURATIONS.ASTRICATION * 1.5 : PLAYER.DURATIONS.ASTRICATION;
        this.player.flickerCaerenic(duration); 
        this.scene.time.delayedCall(duration, () => {
            this.scene.combatManager.combatMachine.input("astrication", {active:false,charges:0});
            this.player.isAstrifying = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren astrifies, wrapping round your attacks.`
        });
    };
    onAstricationUpdate = (_dt: number) => {if (!this.player.isAstrifying) this.positiveMachine.setState(States.CLEAN);};

    onBerserkEnter = () => {
        if (this.player.isBerserking === true) return;
        this.player.checkTalentCost(States.BERSERK, PLAYER.STAMINA.BERSERK);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.BERSERK, PLAYER.COOLDOWNS.LONG);  
        this.scene.sound.play("howl", { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.combatMachine.input("berserk", {active:true,charges:1,talent:this.player.checkTalentEnhanced(States.BERSERK)});
        this.player.specialCombatText = this.scene.showCombatText("Berserking", 750, "damage", false, true, () => this.player.specialCombatText = undefined);
        this.player.isBerserking = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BERSERK, () => {
            this.scene.combatManager.combatMachine.input("berserk", {active:false,charges:0,talent:this.player.checkTalentEnhanced(States.BERSERK)});
            this.player.isBerserking = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren feeds off the pain, its hush shrieking forth.`
        });
    };
    onBerserkUpdate = (_dt: number) => {if (!this.player.isBerserking) this.positiveMachine.setState(States.CLEAN);};

    onBlindEnter = () => {
        this.player.checkTalentCost(States.BLIND, PLAYER.STAMINA.BLIND);
        this.player.aoe = this.scene.aoePool.get("blind");
        this.scene.sound.play("righteous", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Brilliance", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.player.isBlinding = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren shines with brilliance, blinding those around you.`
        });
    };
    onBlindUpdate = (_dt: number) => {if (!this.player.isBlinding) this.positiveMachine.setState(States.CLEAN);};
    onBlindExit = () => {if (!this.player.isComputer) this.player.checkTalentCooldown(States.BLIND, PLAYER.COOLDOWNS.SHORT)};

    onCaerenesisEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget.enemyID)) return;
        this.player.checkTalentCost(States.CAERENESIS, PLAYER.STAMINA.CAERENESIS);
        const count = this.player.checkTalentEnhanced(States.CAERENESIS) ? 3 : 1;
        this.player.aoe = this.scene.aoePool.get("caerenesis", count, false, undefined, false, this.player.currentTarget);    
        this.scene.sound.play("blink", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Caerenesis", 750, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.player.isCaerenesis = true;
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CAERENESIS, PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CAERENESIS, () => {
            this.player.isCaerenesis = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onCaerenesisUpdate = (_dt: number) => {if (!this.player.isCaerenesis) this.positiveMachine.setState(States.CLEAN);};

    onConvictionEnter = () => {
        if (this.player.isConvicted === true) return;
        this.player.checkTalentCost(States.CONVICTION, PLAYER.STAMINA.CONVICTION);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.CONVICTION, PLAYER.COOLDOWNS.LONG);  
        this.scene.combatManager.combatMachine.input("conviction", {active:true,charges:1,talent:this.player.checkTalentEnhanced(States.CONVICTION)});
        this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Conviction", 750, "tendril", false, true, () => this.player.specialCombatText = undefined);
        this.player.isConvicted = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CONVICTION, () => {
            this.scene.combatManager.combatMachine.input("conviction", {active:false,charges:0,talent:this.player.checkTalentEnhanced(States.CONVICTION)});
            this.player.isConvicted = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren steels itself in admiration of your physical form.`
        });
    };
    onConvictionUpdate = (_dt: number) => {if (!this.player.isConvicted) this.positiveMachine.setState(States.CLEAN)};

    onEnduranceEnter = () => {
        if (this.player.isEnduring === true) return;
        this.player.checkTalentCost(States.ENDURANCE, PLAYER.STAMINA.ENDURANCE);
        this.scene.sound.play("shield", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Endurance", 750, "heal", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren"s hush pours into other faculties, invigorating you.`
        });
    };
    onEnduranceUpdate = (_dt: number) => {if (!this.player.isEnduring) this.positiveMachine.setState(States.CLEAN);};
    onEnduranceExit = () => {if (!this.player.isComputer) this.player.checkTalentCooldown(States.ENDURANCE, PLAYER.COOLDOWNS.LONG)};  

    onImpermanenceEnter = () => {
        if (this.player.isImpermanent === true) return;
        this.player.checkTalentCost(States.IMPERMANENCE, PLAYER.STAMINA.IMPERMANENCE);
        this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Impermanence", 750, "hush", false, true, () => this.player.specialCombatText = undefined);
        this.player.isImpermanent = true;
        this.player.flickerCaerenic(1500); 
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.IMPERMANENCE, PLAYER.COOLDOWNS.MODERATE);  
        const duration = this.player.checkTalentEnhanced(States.IMPERMANENCE) ? PLAYER.DURATIONS.IMPERMANENCE * 1.5 : PLAYER.DURATIONS.IMPERMANENCE;
        this.scene.time.delayedCall(duration, () => {
            this.player.isImpermanent = false;
        }, undefined, this);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren grips your body and fades, its hush concealing.`
        });
    };
    onImpermanenceUpdate = (_dt: number) => {if (!this.player.isImpermanent) this.positiveMachine.setState(States.CLEAN);};

    onSeerEnter = () => {
        if (this.player.isSeering === true) return;
        this.player.checkTalentCost(States.SEER, PLAYER.STAMINA.SEER);
        this.scene.sound.play("fire", { volume: this.scene.hud.settings.volume });
        this.scene.combatManager.combatMachine.input("isSeering", true);
        this.player.specialCombatText = this.scene.showCombatText("Seer", 750, "damage", false, true, () => this.player.specialCombatText = undefined);
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
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren calms your body to focus, its hush bleeding into you.`
        });
    };
    onSeerUpdate = (_dt: number) => {if (!this.player.isSeering) this.positiveMachine.setState(States.CLEAN);};

    onDispelEnter = () => {
        if (this.player.currentTarget === undefined || this.player.currentTarget.body === undefined || this.player.outOfRange(PLAYER.RANGE.MODERATE) || this.player.invalidTarget(this.player.currentTarget?.enemyID)) return;
        this.player.checkTalentCost(States.SEER, PLAYER.STAMINA.SEER);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.KYRNAICISM);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.DISPEL, PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play("debuff", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Dispelling", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Shirking", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        if (this.player.checkTalentEnhanced(States.SHIRK)) {
            this.positiveMachine.setState(States.IMPERMANENCE);
        };
        this.player.flickerCaerenic(1500);
        this.scene.time.delayedCall(1500, () => {
            this.player.isShirking = false;
        }, undefined, this); 
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren's hush grants reprieve, freeing you.`
        });
    };
    onShirkExit = () => {};

    onShadowEnter = () => {
        this.player.isShadowing = true;
        this.player.checkTalentCost(States.SEER, PLAYER.STAMINA.SEER);
        this.scene.combatManager.useGrace(PLAYER.STAMINA.SHADOW);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.SHADOW, PLAYER.COOLDOWNS.MODERATE);
        this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
        this.player.specialCombatText = this.scene.showCombatText("Shadowing", DURATION.TEXT, "damage", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Tethering", DURATION.TEXT, "damage", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Stimulate", 750, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.isStimulating = true;
        this.player.flickerCaerenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.STIMULATE, () => {
            this.player.isStimulating = false;
        }, undefined, this);
        if (!this.player.isComputer) this.player.checkTalentCooldown(States.STIMULATE, PLAYER.COOLDOWNS.LONG);
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `Your caeren's hush grants reprieve, refreshing you.`
        });
        for (let i = 0; i < this.scene.hud.actionBar.specialButtons.length; i++) {
            const name = this.scene.hud.settings.specials[i].toLowerCase();
            if (name === "stimulate") continue;
            this.scene.hud.logger.log(`Resetting the cooldown on ${name}`);
            if (!this.player.isComputer) this.player.setTimeEvent(`${name}Cooldown`, 0);
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
        this.player.specialCombatText = this.scene.showCombatText("?c .on-f-u`SeD~", DURATION.TEXT, "effect", false, true, () => this.player.specialCombatText = undefined);
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
                this.player.confuseVelocity = MOVEMENT[direction as keyof typeof MOVEMENT];
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
                    this.player.specialCombatText = this.scene.showCombatText(confusions[Math.floor(Math.random() * 5)], 750, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("F̶e̷a̴r̷e̵d̴", DURATION.TEXT, "damage", false, false, () => this.player.specialCombatText = undefined);
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
                    this.player.specialCombatText = this.scene.showCombatText(fears[Math.floor(Math.random() * 5)], 750, "damage", false, false, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Frozen", DURATION.TEXT, "cast", false, true, () => this.player.specialCombatText = undefined);
        this.player.clearAnimations();
        this.player.anims.play("player_idle", true);
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
        screenShake(this.scene);
    };
    onFrozenExit = () => this.player.setStatic(false);
    onParalyzedEnter = () => {
        if (!this.player.isComputer) {
            if (this.scene.hud.settings.desktop === false) {
                this.scene.hud.joystick.joystick.setVisible(false);
                this.scene.hud.rightJoystick.joystick.setVisible(false);
            };
            this.scene.hud.actionBar.setVisible(false);
        };
        this.player.specialCombatText = this.player.scene.showCombatText("Paralyzed", DURATION.TEXT, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.paralyzeDuration = DURATION.PARALYZED;
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.isDodging = false;
        this.player.currentAction = ""; 
        this.player.anims.pause();
        this.player.setTint(0x888888); // 0x888888
        this.player.setStatic(true);
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
        this.player.setStatic(false);
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
        this.player.specialCombatText = this.scene.showCombatText("Polymorphed", DURATION.TEXT, "effect", false, true, () => this.player.specialCombatText = undefined);
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
                this.player.polymorphVelocity = MOVEMENT[direction as keyof typeof MOVEMENT]; 
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
                    this.player.specialCombatText = this.scene.showCombatText("...thump", 1000, "effect", false, false, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Slowed", DURATION.TEXT, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Snared", DURATION.TEXT, "effect", false, true, () => this.player.specialCombatText = undefined);
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
        this.player.specialCombatText = this.scene.showCombatText("Stunned", PLAYER.DURATIONS.STUNNED, "effect", false, true, () => this.player.specialCombatText = undefined);
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.setTint(0xFF0000);
        this.player.setStatic(true);
        this.player.anims.pause();
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You've been stunned.`
        });
        screenShake(this.scene, 96);
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
        this.player.setStatic(false);
        this.player.anims.resume();
    };
};