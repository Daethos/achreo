import { BlendModes, GameObjects, Input, Math as pMath, Physics } from "phaser";
import StateMachine, { States } from "../phaser/StateMachine";
import { PLAYER } from "../utility/player";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";
import Entity, { FRAME_COUNT } from "./Entity";  
import { EventBus } from "../game/EventBus";

const DURATION = {
    CONSUMED: 2000,
    FEARED: 3000,
    FROZEN: 3000,
    SLOWED: 2500,
    SNARED: 4000,
    ROOTED: 3000,
    STUNNED: 3000,
    TEXT: 1500,
    DODGE: 288, // 288
    ROLL: 320, // 320
    SPECIAL: 5000,
};

export class PlayerMachine {
    constructor(player) {
        this.player = player;
        this.scene = player.scene;
        this.stateMachine = new StateMachine(player, 'player');
        this.stateMachine
            .addState(States.NONCOMBAT, {
                onEnter: this.onNonCombatEnter,
                onUpdate: this.onNonCombatUpdate,
                onExit: this.onNonCombatExit,
            })
            .addState(States.COMBAT, {
                onEnter: this.onCombatEnter,
                onUpdate: this.onCombatUpdate,
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
            })
            .addState(States.STUN, {
                onEnter: this.onStunEnter,
                onUpdate: this.onStunUpdate,
                onExit: this.onStunExit,
            })
            .addState(States.ARC, {
                onEnter: this.onArcEnter,
                onUpdate: this.onArcUpdate,
                onExit: this.onArcExit,
            })
            .addState(States.ACHIRE, {
                onEnter: this.onAchireEnter,
                onUpdate: this.onAchireUpdate,
                onExit: this.onAchireExit,
            })
            .addState(States.ASTRAVE, {
                onEnter: this.onAstraveEnter,
                onUpdate: this.onAstraveUpdate,
                onExit: this.onAstraveExit,
            })
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
            .addState(States.CONSUME, {
                onEnter: this.onConsumeEnter,
                onUpdate: this.onConsumeUpdate,
                onExit: this.onConsumeExit,
            })
            .addState(States.DESPERATION, {
                onEnter: this.onDesperationEnter,
                onUpdate: this.onDesperationUpdate,
                onExit: this.onDesperationExit,
            })
            .addState(States.FEAR, {
                onEnter: this.onFearingEnter,
                onUpdate: this.onFearingUpdate,
                onExit: this.onFearingExit,
            })
            .addState(States.PARALYZE, {
                onEnter: this.onParalyzeEnter,
                onUpdate: this.onParalyzeUpdate,
                onExit: this.onParalyzeExit,
            })
            .addState(States.FYERUS, {
                onEnter: this.onFyerusEnter,
                onUpdate: this.onFyerusUpdate,
                onExit: this.onFyerusExit,
            })
            .addState(States.HEALING, {
                onEnter: this.onHealingEnter,
                onUpdate: this.onHealingUpdate,
                onExit: this.onHealingExit,
            })
            .addState(States.INVOKE, {
                onEnter: this.onInvokeEnter,
                onUpdate: this.onInvokeUpdate,
                onExit: this.onInvokeExit,
            })
            .addState(States.KYNISOS, {
                onEnter: this.onKynisosEnter,
                onUpdate: this.onKynisosUpdate,
                onExit: this.onKynisosExit,
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
            .addState(States.ROOT, {
                onEnter: this.onRootingEnter,
                onUpdate: this.onRootingUpdate,
                onExit: this.onRootingExit,
            })
            .addState(States.RUSH, {
                onEnter: this.onRushEnter,
                onUpdate: this.onRushUpdate,
                onExit: this.onRushExit,
            })
            .addState(States.SACRIFICE, {
                onEnter: this.onSacrificeEnter,
                onUpdate: this.onSacrificeUpdate,
                onExit: this.onSacrificeExit,
            })
            .addState(States.SNARE, {
                onEnter: this.onSnaringEnter,
                onUpdate: this.onSnaringUpdate,
                onExit: this.onSnaringExit,
            })
            .addState(States.SUTURE, {
                onEnter: this.onSutureEnter,
                onUpdate: this.onSutureUpdate,
                onExit: this.onSutureExit,
            })
            .addState(States.SLOW, {
                onEnter: this.onSlowEnter,
                onUpdate: this.onSlowUpdate,
                onExit: this.onSlowExit,
            })
            .addState(States.STORM, {
                onEnter: this.onStormEnter,
                onUpdate: this.onStormUpdate,
                onExit: this.onStormExit,
            })
            .addState(States.DEVOUR, {
                onEnter: this.onDevourEnter,
                onUpdate: this.onDevourUpdate,
                onExit: this.onDevourExit,
            }) // ==================== NEGATIVE STATES ==================== //
            .addState(States.CONFUSED, {
                onEnter: this.onConfusedEnter,
                onUpdate: this.onConfusedUpdate,
                onExit: this.onConfusedExit,
            })
            .addState(States.FEARED, {
                onEnter: this.onFearedEnter,
                onUpdate: this.onFearedUpdate,
                onExit: this.onFearedExit,
            })
            .addState(States.POLYMORPHED, {
                onEnter: this.onPolymorphedEnter,
                onUpdate: this.onPolymorphedUpdate,
                onExit: this.onPolymorphedExit,
            })

        this.stateMachine.setState(States.NONCOMBAT);

        this.metaMachine = new StateMachine(player, 'player');
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
            .addState(States.ENVELOP, {
                onEnter: this.onEnvelopEnter,
                onUpdate: this.onEnvelopUpdate,
                onExit: this.onEnvelopExit,
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
            .addState(States.STEALTH, {
                onEnter: this.onStealthEnter,
                onUpdate: this.onStealthUpdate,
                onExit: this.onStealthExit,
            })
            .addState(States.PROTECT, {
                onEnter: this.onProtectEnter,
                onUpdate: this.onProtectUpdate,
                onExit: this.onProtectExit,
            })
            .addState(States.RECOVER, {
                onEnter: this.onRecoverEnter,
                onUpdate: this.onRecoverUpdate,
                onExit: this.onRecoverExit,
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
            }) // ========== TRAITS ========== \\
            .addState(States.ASTRICATION, {
                onEnter: this.onAstricationEnter,
                onUpdate: this.onAstricationUpdate,
                onExit: this.onAstricationExit,
            })
            .addState(States.BERSERK, {
                onEnter: this.onBerserkEnter,
                onUpdate: this.onBerserkUpdate,
                onExit: this.onBerserkExit,
            })
            .addState(States.BLIND, {
                onEnter: this.onBlindEnter,
                onUpdate: this.onBlindUpdate,
                onExit: this.onBlindExit,
            })
            .addState(States.CAERENESIS, {
                onEnter: this.onCaerenesisEnter,
                onUpdate: this.onCaerenesisUpdate,
                onExit: this.onCaerenesisExit,
            })
            .addState(States.CONVICTION, {
                onEnter: this.onConvictionEnter,
                onUpdate: this.onConvictionUpdate,
                onExit: this.onConvictionExit,
            })
            .addState(States.ENDURANCE, {
                onEnter: this.onEnduranceEnter,
                onUpdate: this.onEnduranceUpdate,
                onExit: this.onEnduranceExit,
            })
            .addState(States.IMPERMANENCE, {
                onEnter: this.onImpermanenceEnter,
                onUpdate: this.onImpermanenceUpdate,
                onExit: this.onImpermanenceExit,
            })
            .addState(States.SEER, {
                onEnter: this.onSeerEnter,
                onUpdate: this.onSeerUpdate,
                onExit: this.onSeerExit,
            })
            .addState(States.STIMULATE, {
                onEnter: this.onStimulateEnter,
                onUpdate: this.onStimulateUpdate,
                onExit: this.onStimulateExit,
            })
            
        // ==================== NEGATIVE META STATES ==================== //
        this.negMetaMachine = new StateMachine(player, 'player');
        this.negMetaMachine
            .addState(States.CLEAN, {
                onEnter: this.onCleanEnter,
                onExit: this.onCleanExit,
            })
            .addState(States.FROZEN, {
                onEnter: this.onFrozenEnter,
                onExit: this.onFrozenExit,
            })
            .addState(States.SLOWED, {
                onEnter: this.onSlowedEnter,
                onExit: this.onSlowedExit,
            })
            .addState(States.SNARED, {
                onEnter: this.onSnaredEnter,
                onExit: this.onSnaredExit,
            })

        this.metaMachine.setState(States.CLEAN);
    };

    onNonCombatEnter = () => {
        this.player.anims.play('player_idle', true);
        if (this.scene.combatTimer) this.scene.stopCombatTimer();
        if (this.player.currentRound !== 0) this.player.currentRound = 0;
    };
    onNonCombatUpdate = (_dt) => {
        if (this.player.isMoving) this.player.isMoving = false;
        if (this.player.inCombat) this.stateMachine.setState(States.COMBAT);
    };
    onNonCombatExit = () => {
        this.player.anims.stop('player_idle');
    };

    onCombatEnter = () => {};
    onCombatUpdate = (_dt) => { 
        if (!this.player.inCombat) this.stateMachine.setState(States.NONCOMBAT);  
    }; 

    onAttackEnter = () => {
        if (this.player.isRanged === true && this.player.inCombat === true) {
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct) {
                // console.log(`%c Error (Attack): You are not looking at or targeting an enemy.`, 'color: #ff0000');
                this.player.resistCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Skill Issue: You are not looking at the enemy', 1500, 'damage');
                return;
            };
        };
        if (this.player.isPosturing || this.player.isParrying) return;
        this.player.isAttacking = true;
        this.player.swingReset(States.ATTACK, true);
        // this.swingReset(States.POSTURE);
        this.scene.useStamina(this.player.staminaModifier + PLAYER.STAMINA.ATTACK);
    }; 
    onAttackUpdate = (_dt) => {
        if (this.player.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.player.isRanged) {
            this.scene.combatMachine.input('action', 'attack');
        };
        this.player.combatChecker(this.player.isAttacking);
    }; 
    onAttackExit = () => {if (this.scene.state.action === 'attack') this.scene.combatMachine.input('action', '');};

    onParryEnter = () => {
        this.player.isParrying = true;    
        this.player.swingReset(States.PARRY, true);
        this.scene.useStamina(this.player.staminaModifier + PLAYER.STAMINA.PARRY);
        if (this.player.hasMagic === true) {
            this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Counter Spell', 750, 'hush');
            this.player.isCounterSpelling = true;
            this.player.flickerCarenic(750); 
            this.scene.time.delayedCall(750, () => {
                this.player.isCounterSpelling = false;
            }, undefined, this);
        };
    };
    onParryUpdate = (_dt) => {
        if (this.player.frameCount === FRAME_COUNT.PARRY_LIVE && !this.player.isRanged) {
            this.scene.combatMachine.input('action', 'parry');
        };
        this.player.combatChecker(this.player.isParrying);
    };
    onParryExit = () => {if (this.scene.state.action !== '') this.scene.combatMachine.input('action', '');};

    onPostureEnter = () => {
        if (this.player.isRanged === true) {
            if (this.player.isMoving === true) { // The || needs to be a check that the player is 'looking at' the enemy
                this.player.resistCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Posture Issue: You are moving', 1500, 'damage');
                return;
            };
            const correct = this.player.getEnemyDirection(this.player.currentTarget);
            if (!correct && this.player.inCombat === true) {
                this.player.resistCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Skill Issue: You are not looking at the enemy', 1500, 'damage');
                return;
            };
        };
        if (this.player.isAttacking || this.player.isParrying) return;
        this.player.isPosturing = true;
        this.player.swingReset(States.POSTURE, true);
        this.scene.useStamina(this.player.staminaModifier + PLAYER.STAMINA.POSTURE);
    };
    onPostureUpdate = (_dt) => {
        if (this.player.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.player.isRanged) { //
            this.scene.combatMachine.input('action', 'posture');
        };
        this.player.combatChecker(this.player.isPosturing);
    };
    onPostureExit = () => {if (this.scene.state.action === 'posture') this.scene.combatMachine.input('action', '');};

    onDodgeEnter = () => {
        if (this.player.isStalwart || this.player.isStorming || this.player.isRolling) return;
        this.player.isDodging = true;
        this.scene.useStamina(PLAYER.STAMINA.DODGE);
        this.player.swingReset(States.DODGE, true);
        this.scene.sound.play('dodge', { volume: this.scene.settings.volume });
        this.player.wasFlipped = this.player.flipX; 
        this.player.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        this.player.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.player.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
        this.player.body.parts[0].vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[0].vertices[1].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[0].x += this.player.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    };
    onDodgeUpdate = (_dt) => { 
        this.player.combatChecker(this.player.isDodging);
    };
    onDodgeExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
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
        this.player.scene.useStamina(this.player.staminaModifier + PLAYER.STAMINA.ROLL);
        this.player.swingReset(States.ROLL, true);
        // this.swingReset(States.DODGE);
        this.scene.sound.play('roll', { volume: this.scene.settings.volume });
        this.player.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        this.player.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.player.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
    };
    onRollUpdate = (_dt) => {
        if (this.player.frameCount === FRAME_COUNT.ROLL_LIVE && !this.player.isRanged) {
            this.scene.combatMachine.input('action', 'roll');
        };
        this.player.combatChecker(this.player.isRolling);
    };
    onRollExit = () => {
        if (this.player.isStalwart || this.player.isStorming) return;
        this.player.spriteWeapon.setVisible(true);
        this.player.rollCooldown = 0; 
        if (this.scene.state.action !== '') {
            this.scene.combatMachine.input('action', '');
        };
        this.player.body.parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        this.player.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.player.body.parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        this.player.body.parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
    };

    onFlaskEnter = () => {
        this.player.isHealing = true;
        this.player.setStatic(true);
    };
    onFlaskUpdate = (_dt) => {
        this.player.combatChecker(this.player.isHealing);
    };
    onFlaskExit = () => {
        this.scene.drinkFlask();
        this.player.setStatic(false);
    };

    onAchireEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Achire', PLAYER.DURATIONS.ACHIRE / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.ACHIRE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); // !this.player.isCaerenic && 
        this.player.castbar.setVisible(true);  
    };
    onAchireUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ACHIRE) {
            this.player.achireSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'cast');
        };
    };
    onAchireExit = () => {
        if (this.player.achireSuccess === true) {
            const anim = this.getWeaponAnim();
            this.player.particleEffect =  this.scene.particleManager.addEffect('achire', this.player, anim, true);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `Your Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0].name}.`
            });
            this.player.setTimeEvent('achireCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000); // PLAYER.COOLDOWNS.SHORT
            this.player.achireSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.player.scene.useStamina(PLAYER.STAMINA.ACHIRE);    
        };
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onAstraveEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Astrave', PLAYER.DURATIONS.ASTRAVE / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.ASTRAVE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); // !this.player.isCaerenic && 
        this.player.castbar.setVisible(true);  
        this.player.isCasting = true;
    };
    onAstraveUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ASTRAVE) {
            this.player.astraveSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'cast');
        };
    };
    onAstraveExit = () => {
        if (this.player.astraveSuccess === true) {
            this.aoe = new AoE(this.scene, 'astrave', 1, false, undefined, true);    
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You unearth the winds and lightning from the land of hush and tendril.`
            });
            this.player.setTimeEvent('astraveCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000); // PLAYER.COOLDOWNS.SHORT
            this.player.astraveSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.ASTRAVE);    
        };
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onArcEnter = () => {
        this.isArcing = true;
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Arcing', PLAYER.DURATIONS.ARCING / 2, 'damage');
        this.player.castbar.setTotal(PLAYER.DURATIONS.ARCING);
        this.player.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
        this.player.setStatic(true);
        this.player.castbar.setVisible(true); 
        this.player.flickerCarenic(3000); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You begin arcing with your ${this.scene.state.weapons[0].name}.`
        });
    };
    onArcUpdate = (dt) => {
        this.player.combatChecker(this.isArcing);
        if (this.isArcing) this.player.castbar.update(dt, 'channel', 0xFF0000);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ARCING * 0.25 && this.player.castbar.time <= PLAYER.DURATIONS.ARCING * 0.26) {
            this.player.isAttacking = true;
        };
        if (this.player.castbar.time <= 0) {
            this.arcSuccess = true;
            this.isArcing = false;
        };
    };
    onArcExit = () => {
        if (this.arcSuccess) {
            this.player.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.arcSuccess = false;
            this.scene.useStamina(PLAYER.STAMINA.ARC);
            if (this.currentTarget && this.player.inCombat === true) {
                if (this.player.flipX) {
                    this.weaponHitbox.setAngle(270);
                } else {
                    this.weaponHitbox.setAngle(0);
                };
                // this.weaponHitbox.setPosition(this.x + (this.player.flipX ? -32 : 32), this.y - 12);  
                this.weaponHitbox.x = this.player.flipX ? this.x - 32 : this.x + 32;
                this.weaponHitbox.y = this.y - 12;
                if (this.weaponHitbox.getBounds().contains(this.currentTarget.x, this.currentTarget.y)) {
                    this.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: 'arc' } });
                    this.player.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.MODERATE);
                };
            };
            this.player.castbar.reset();
            this.player.setStatic(false);
        };
    };

    onBlinkEnter = () => {
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        if (this.velocity.x > 0) {
            this.setVelocityX(PLAYER.SPEED.BLINK);
        } else if (this.velocity.x < 0) {
            this.setVelocityX(-PLAYER.SPEED.BLINK);
        };
        if (this.velocity.y > 0) {
            this.setVelocityY(PLAYER.SPEED.BLINK);
        } else if (this.velocity.y < 0) {
            this.setVelocityY(-PLAYER.SPEED.BLINK);
        };
        if (this.player.moving()) {
            this.scene.useStamina(PLAYER.STAMINA.BLINK);
        };
        const blinkCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.player.setTimeEvent('blinkCooldown', blinkCooldown);
        this.player.flickerCarenic(750); 
    };
    onBlinkUpdate = (_dt) => {
        this.player.combatChecker(this.isBlinking);
    };
    onBlinkExit = () => {};
    
    onKyrnaicismEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.isCasting = true;
        this.scene.useStamina(PLAYER.STAMINA.KYRNAICISM);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.player.flickerCarenic(3000); 
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage');
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.player.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.currentTarget.isConsumed = true;
        this.scene.slow(this.player.spellTarget);
        this.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.kyrnaicismTick(),
            callbackScope: this,
            repeat: 3,
        });
        this.player.setTimeEvent('kyrnaicismCooldown', PLAYER.COOLDOWNS.LONG);
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
    onKyrnaicismUpdate = (dt) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting) this.player.castbar.update(dt, 'channel', 0xA700FF);
    };
    onKyrnaicismExit = () => {
        this.player.castbar.reset();
        this.player.spellTarget = '';
        this.player.setStatic(false);
        if (this.chiomicTimer) {
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
        }; 
    };
    kyrnaicismTick = () => {
        if (!this.player.isCasting || this.scene.state.playerWin || this.scene.state.newComputerHealth <= 0) {
            this.player.isCasting = false;
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
            return;
        };
        if (this.player.spellTarget === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Chiomic', data: 10 }); // this.player.spellTarget  
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.player.spellTarget);
            const chiomic = Math.round(this.scene.state.playerHealth * 0.1 * (this.player.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const chiomicDescription = `Your hush flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription: chiomicDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.player.spellTarget } });
        };
    };

    onConfuseEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.CONFUSE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); // !this.player.isCaerenic && 
        this.player.castbar.setVisible(true);  
    };
    onConfuseUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
            this.confuseSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onConfuseExit = () => {
        if (this.confuseSuccess === true) {
            this.scene.confuse(this.player.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You confuse ${this.scene.state.computer?.name}, and they stumble around in a daze.`
            });
            this.player.setTimeEvent('confuseCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.confuseSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.CONFUSE);    
        };
        this.player.spellTarget = '';
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onConsumeEnter = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.isConsuming = true;
        this.scene.sound.play('consume', { volume: this.scene.settings.volume });
        this.player.setTimeEvent('consumeCooldown', PLAYER.COOLDOWNS.SHORT);
    };
    onConsumeUpdate = (_dt) => {
        this.player.combatChecker(this.isConsuming);
    };
    onConsumeExit = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.scene.combatMachine.action({ type: 'Consume', data: this.scene.state.playerEffects[0].id });        
        this.scene.useStamina(PLAYER.STAMINA.CONSUME);
    };

    onDesperationEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'heal');
        this.scene.useStamina(PLAYER.STAMINA.DESPERATION);
        this.player.flickerCarenic(PLAYER.DURATIONS.HEALING); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0].influences[0]} soothes your body.`
        });
    };
    onDesperationUpdate = (_dt) => {
        this.player.combatChecker(false);
    };
    onDesperationExit = () => {
        const desperationCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.LONG : PLAYER.COOLDOWNS.SHORT;
        this.player.setTimeEvent('desperationCooldown', desperationCooldown);  
        this.scene.combatMachine.action({ data: { key: 'player', value: 50, id: this.player.playerID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
    };

    onFearingEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Fearing', PLAYER.DURATIONS.FEAR / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.FEAR);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);  
    };
    onFearingUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.FEAR) {
            this.player.fearSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onFearingExit = () => {
        if (this.player.fearSuccess === true) {
            this.scene.fear(this.player.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You strike fear into ${this.scene.state.computer?.name}!`
            });
            this.player.setTimeEvent('fearCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.player.fearSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.FEAR);    
        };
        this.player.spellTarget = '';
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onParalyzeEnter = () => { 
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Paralyzing', PLAYER.DURATIONS.PARALYZE / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.PARALYZE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true); 
    };
    onParalyzeUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.PARALYZE) {
            this.paralyzeSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onParalyzeExit = () => {
        if (this.paralyzeSuccess === true) {
            this.scene.paralyze(this.player.spellTarget);
            this.player.setTimeEvent('paralyzeCooldown', PLAYER.COOLDOWNS.MODERATE);  
            this.scene.useStamina(PLAYER.STAMINA.PARALYZE);
            this.paralyzeSuccess = false;
            this.scene.mysterious.play();
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You paralyze ${this.scene.state.computer?.name} for several seconds!`
            });
        };
        this.player.spellTarget = '';
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onFyerusEnter = () => {
        this.player.isCasting = true;
        if (this.player.isMoving === true) this.player.isCasting = false;
        if (this.player.isCasting === false) return;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Fyerus', PLAYER.DURATIONS.FYERUS / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setTime(PLAYER.DURATIONS.FYERUS);
        this.player.castbar.setVisible(true);  
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); // !this.player.isCaerenic && 
        this.aoe = new AoE(this.scene, 'fyerus', 6, false, undefined, true);    
        this.scene.useStamina(PLAYER.STAMINA.FYERUS);    
        this.player.setTimeEvent('fyerusCooldown', 2000); // PLAYER.COOLDOWNS.SHORT
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You unearth the fires and water from the land of hush and tendril.`
        });
    };
    onFyerusUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        if (this.player.castbar.time <= 0) {
            this.player.isCasting = false;
        };
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting === true) {
            this.player.castbar.update(dt, 'channel', 0xE0115F);
        };
    };
    onFyerusExit = () => {
        this.player.castbar.reset();
        this.player.isFyerus = false;
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onHealingEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.HEALING);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);  
    };
    onHealingUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.HEALING) {
            this.player.healingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast', 0x00C200);
    };
    onHealingExit = () => {
        if (this.player.healingSuccess === true) {
            this.player.setTimeEvent('healingCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.scene.useStamina(PLAYER.STAMINA.HEALING);
            this.player.healingSuccess = false;
            this.scene.combatMachine.action({ data: { key: 'player', value: 25, id: this.player.playerID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
        };
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onInvokeEnter = () => {
        if (!this.player.inCombat || !this.currentTarget) return;
        this.player.isPraying = true;
        this.player.setStatic(true);
        this.player.flickerCarenic(1000); 
        this.player.setTimeEvent('invokeCooldown', PLAYER.COOLDOWNS.LONG);
        this.invokeCooldown = 30;
        if (this.playerBlessing === '' || this.playerBlessing !== this.scene.state.playerBlessing) {
            this.playerBlessing = this.scene.state.playerBlessing;
        };
    };
    onInvokeUpdate = (_dt) => {
        this.player.combatChecker(this.player.isPraying);
    };
    onInvokeExit = () => {
        if (!this.player.inCombat || !this.currentTarget) return;
        this.player.setStatic(false);
        this.scene.combatMachine.action({ type: 'Instant', data: this.scene.state.playerBlessing });
        this.scene.sound.play('prayer', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.INVOKE);
    };

    onKynisosEnter = () => { 
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Kynisos', PLAYER.DURATIONS.KYNISOS / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.KYNISOS);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true); // !this.player.isCaerenic && 
        this.player.castbar.setVisible(true);   
    };
    onKynisosUpdate = (dt) => {
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
            this.aoe = new AoE(this.scene, 'kynisos', 3, false, undefined, true);    
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You unearth the netting of the golden hunt.`
            });
            this.player.setTimeEvent('kynisosCooldown', 2000); // PLAYER.COOLDOWNS.SHORT
            this.player.kynisosSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.KYNISOS);    
        };
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
    };

    onLeapEnter = () => {
        this.player.isLeaping = true;
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.player.position);
        direction.normalize();
        this.player.flipX = direction.x < 0;
        this.player.isAttacking = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 125),
            y: this.y + (direction.y * 125),
            duration: 750,
            ease: 'Elastic',
            onStart: () => {
                this.scene.sound.play('leap', { volume: this.scene.settings.volume });
                this.player.flickerCarenic(750); 
            },
            onComplete: () => { 
                this.scene.useStamina(PLAYER.STAMINA.LEAP);
                this.player.isLeaping = false; 
                if (this.player.touching.length > 0 && this.player.inCombat === true) {
                    this.player.touching.forEach(enemy => {
                        this.scene.writhe(enemy.enemyID, 'leap');
                    });
                };
            },
        });       
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You launch yourself through the air!`
        });
    };
    onLeapUpdate = (_dt) => {
        this.player.combatChecker(this.player.isLeaping);
    };
    onLeapExit = () => {
        const leapCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.player.setTimeEvent('leapCooldown', leapCooldown);
    };

    onRushEnter = () => {
        this.isRushing = true;
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });        
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.player.position);
        direction.normalize();
        this.player.flipX = direction.x < 0;
        this.player.isParrying = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 250),
            y: this.y + (direction.y * 250),
            duration: 500,
            ease: 'Circ.easeOut',
            onStart: () => {
                this.player.flickerCarenic(500);  
            },
            onComplete: () => {
                if (this.rushedEnemies.length > 0 && this.player.inCombat === true) {
                    this.rushedEnemies.forEach(enemy => {
                        this.scene.writhe(enemy.enemyID, 'rush');
                    });
                };
                this.isRushing = false;
            },
        });         
    };
    onRushUpdate = (_dt) => {
        this.player.combatChecker(this.isRushing);
    };
    onRushExit = () => {
        this.rushedEnemies = [];
        const rushCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.player.setTimeEvent('rushCooldown', rushCooldown);
        this.scene.useStamina(PLAYER.STAMINA.RUSH);
    };

    onPolymorphingEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.POLYMORPH);
        this.player.isCasting = true;
        if (!this.player.isCaerenic && !this.player.isGlowing) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);  
    };
    onPolymorphingUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
            this.polymorphSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onPolymorphingExit = () => {
        if (this.polymorphSuccess === true) {
            this.scene.polymorph(this.player.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, polymorphing them!`
            });
            this.player.setTimeEvent('polymorphCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.scene.useStamina(PLAYER.STAMINA.POLYMORPH);
            this.polymorphSuccess = false;
            this.scene.mysterious.play();
            this.player.spellTarget = '';
        };
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onPursuitEnter = () => {
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.scene.sound.play('wild', { volume: this.scene.settings.volume });
        if (this.currentTarget) {
            if (this.currentTarget.flipX) {
                this.setPosition(this.currentTarget.x + 16, this.currentTarget.y);
            } else {
                this.setPosition(this.currentTarget.x - 16, this.currentTarget.y);
            };
        };

        this.scene.useStamina(PLAYER.STAMINA.PURSUIT);
        const pursuitCooldown = this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.player.setTimeEvent('pursuitCooldown', pursuitCooldown);
        this.player.flickerCarenic(750); 
    };
    onPursuitUpdate = (_dt) => {
        this.player.combatChecker(this.isPursuing);
    };
    onPursuitExit = () => {
        if (!this.player.inCombat && !this.player.isStealthing && !this.isShimmering) {
            const button = this.scene.smallHud.stances.find(b => b.texture.key === 'stealth');
            this.scene.smallHud.pressStance(button);
        };
    };

    onRootingEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.isCasting = true;
        this.player.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Rooting', PLAYER.DURATIONS.ROOTING / 2, 'cast');
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true);
    };
    onRootingUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.ROOTING) {
            this.rootingSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onRootingExit = () => { 
        if (this.rootingSuccess === true) {
            this.rootingSuccess = false;
            this.scene.root(this.player.spellTarget);
            this.player.setTimeEvent('rootCooldown', PLAYER.COOLDOWNS.SHORT); 
            this.scene.useStamina(PLAYER.STAMINA.ROOT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, rooting them!`
            });
        };
        this.player.spellTarget = '';
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onSlowEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.isSlowing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Slow', 750, 'cast');
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.slow(this.player.spellTarget);
        this.scene.useStamina(PLAYER.STAMINA.SLOW);
        this.player.setTimeEvent('slowCooldown', PLAYER.COOLDOWNS.SHORT); 
        this.player.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => this.isSlowing = false);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, slowing them!`
        });
    };
    onSlowUpdate = (_dt) => this.player.combatChecker(this.isSlowing);
    onSlowExit = () => this.player.spellTarget = '';

    onSacrificeEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.isSacrificing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Sacrifice', 750, 'effect');
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.SACRIFICE);
        this.scene.combatMachine.action({ type: 'Sacrifice', data: undefined });
        this.player.setTimeEvent('sacrificeCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.player.flickerCarenic(500);  
        this.scene.time.delayedCall(500, () => this.isSacrificing = false);
    };
    onSacrificeUpdate = (_dt) => this.player.combatChecker(this.isSacrificing);
    onSacrificeExit = () => this.player.spellTarget = '';

    onSnaringEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Snaring', PLAYER.DURATIONS.SNARE, 'cast');
        this.player.castbar.setTotal(PLAYER.DURATIONS.SNARE);
        this.player.isCasting = true;
        if (this.player.isCaerenic === false && this.player.isGlowing === false) this.player.checkCaerenic(true);
        this.player.castbar.setVisible(true); 
    };
    onSnaringUpdate = (dt) => {
        if (this.player.isMoving === true) this.player.isCasting = false;
        this.player.combatChecker(this.player.isCasting);
        if (this.player.castbar.time >= PLAYER.DURATIONS.SNARE) {
            this.snaringSuccess = true;
            this.player.isCasting = false;
        };
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'cast');
    };
    onSnaringExit = () => {
        if (this.snaringSuccess === true) {
            this.player.setTimeEvent('snareCooldown', PLAYER.DURATIONS.SHORT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, snaring them!`
            });
            this.scene.useStamina(PLAYER.STAMINA.SNARE);
            this.scene.snare(this.player.spellTarget);
            this.snaringSuccess = false;
            this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        };
        this.player.spellTarget = '';
        this.player.castbar.reset();
        if (this.player.isCaerenic === false && this.player.isGlowing === true) this.player.checkCaerenic(false);
    };

    onStormEnter = () => {
        this.isStorming = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Storming', 800, 'effect'); 
        this.player.isAttacking = true;
        this.scene.useStamina(PLAYER.STAMINA.STORM);
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 800,
            onStart: () => {
                this.player.flickerCarenic(3000); 
            },
            onLoop: () => {
                console.log('Storming!');
                // if (this.player.inCombat === false) return;
                this.player.isAttacking = true;
                this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Storming', 800, 'effect');
                if (this.player.touching.length > 0) {
                    this.player.touching.forEach(enemy => {
                        if (enemy.isDefeated === true) return;
                        // console.log(`%c Touched Enemy: ${enemy.enemyID}`, 'color: #ff0000');
                        this.scene.storm(enemy.enemyID);
                    });
                };
            },
            onComplete: () => {
                this.isStorming = false; 
            },
            loop: 3,
        });  
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You begin storming with your ${this.scene.state.weapons[0].name}.`
        });
    };
    onStormUpdate = (_dt) => {
        this.player.combatChecker(this.isStorming);
    };
    onStormExit = () => { 
        this.player.setTimeEvent('stormCooldown', this.player.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);
    };

    onSutureEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return;  
        this.isSuturing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Suture', 750, 'effect');
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.SUTURE);
        this.scene.combatMachine.action({ type: 'Suture', data: undefined });
        this.player.setTimeEvent('sutureCooldown', PLAYER.COOLDOWNS.MODERATE);
        
        this.player.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => {
            this.isSuturing = false;
        });
        
    };
    onSutureUpdate = (_dt) => {
        this.player.combatChecker(this.isSuturing);
    };
    onSutureExit = () => {};

    onDevourEnter = () => {
        if (this.currentTarget === undefined) return; 
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.player.spellTarget = this.currentTarget.enemyID;
        this.player.isCasting = true;
        this.currentTarget.isConsumed = true;
        this.scene.useStamina(PLAYER.STAMINA.DEVOUR);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.player.flickerCarenic(2000); 
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Tshaering', PLAYER.DURATIONS.DEVOUR / 2, 'damage');
        this.player.castbar.setTotal(PLAYER.DURATIONS.DEVOUR);
        this.player.castbar.setTime(PLAYER.DURATIONS.DEVOUR);
        this.player.devourTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => this.devour(),
            callbackScope: this,
            repeat: 8,
        });
        this.player.setTimeEvent('devourCooldown', PLAYER.COOLDOWNS.LONG);
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
    onDevourUpdate = (dt) => {
        this.player.combatChecker(this.player.isCasting);
        if (this.player.isCasting === true) this.player.castbar.update(dt, 'channel', 0xA700FF);
    };
    onDevourExit = () => {
        this.player.castbar.reset(); 
        this.player.spellTarget = '';
        this.player.setStatic(false);
        if (this.player.devourTimer !== undefined) {
            this.player.devourTimer.remove(false);
            this.player.devourTimer = undefined;
        };
    };
    devour = () => {
        if (this.player.isCasting === false || this.scene.state.playerWin === true || this.scene.state.newComputerHealth <= 0) {
            this.player.isCasting = false;
            this.player.devourTimer.remove(false);
            this.player.devourTimer = undefined;
            return;
        };
        if (this.player.spellTarget === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Tshaeral', data: 3 });
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.player.spellTarget);
            const drained = Math.round(this.scene.state.playerHealth * 0.03 * (this.player.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            const newPlayerHealth = drained / this.scene.state.playerHealth * 100;
            const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
            const tshaeralDescription =
                `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;

            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription: tshaeralDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: newPlayerHealth, id: this.player.playerID } });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newHealth, id: this.player.spellTarget } });
        };
    };

    // ================= META MACHINE STATES ================= \\

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onChiomicEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.CHIOMIC);    
        this.aoe = new AoE(this.scene, 'chiomic', 1);    
        this.scene.sound.play('death', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect');
        this.isChiomic = true;
        this.player.setTimeEvent('chiomicCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.isChiomic = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You mock and confuse your surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt) => {if (this.isChiomic === false) this.metaMachine.setState(States.CLEAN);};
    onChiomicExit = () => {};

    onDiseaseEnter = () => {
        this.isDiseasing = true;
        this.scene.useStamina(PLAYER.STAMINA.DISEASE);    
        this.aoe = new AoE(this.scene, 'tendril', 6);    
        this.scene.sound.play('dungeon', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Tendrils Swirl', 750, 'tendril');
        this.player.setTimeEvent('diseaseCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.isDiseasing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You swirl such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt) => {if (this.isDiseasing === false) this.metaMachine.setState(States.CLEAN);};
    onDiseaseExit = () => {};

    onHowlEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.HOWL);    
        this.aoe = new AoE(this.scene, 'howl', 1);    
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Howling', PLAYER.DURATIONS.HOWL, 'damage');
        this.isHowling = true;
        this.player.setTimeEvent('howlCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.isHowling = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You howl, it's otherworldly nature stunning nearby foes.`
        });
    };
    onHowlUpdate = (_dt) => {if (this.isHowling === false) this.metaMachine.setState(States.CLEAN);};
    onHowlExit = () => {};

    onEnvelopEnter = () => {
        this.isEnveloping = true;
        this.scene.useStamina(PLAYER.STAMINA.ENVELOP);    
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Enveloping', 750, 'cast');
        this.envelopBubble = new Bubble(this.scene, this.player.x, this.player.y, 'blue', PLAYER.DURATIONS.ENVELOP);
        this.player.setTimeEvent('envelopCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.isEnveloping = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You envelop yourself, shirking oncoming attacks.`
        });
    };
    onEnvelopUpdate = (_dt) => {
        this.player.combatChecker(this.isEnveloping);
        if (this.isEnveloping) {
            this.envelopBubble.update(this.player.x, this.player.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onEnvelopExit = () => {
        if (this.envelopBubble !== undefined) {
            this.envelopBubble.destroy();
            this.envelopBubble = undefined;
        };
    };

    envelopHit = () => {
        if (this.envelopBubble === undefined || this.isEnveloping === false) {
            if (this.envelopBubble) {
                this.envelopBubble.destroy();
                this.envelopBubble = undefined;
            };
            this.isEnveloping = false;
            return;
        };
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Enveloped', 500, 'effect');
        this.scene.useStamina(40);
        if (this.stamina - 40 <= 0) {
            this.isEnveloping = false;
        };
    };

    onFreezeEnter = () => {
        this.aoe = new AoE(this.scene, 'freeze', 1);
        this.scene.sound.play('freeze', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.FREEZE);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Freezing', PLAYER.DURATIONS.FREEZE, 'cast');
        this.player.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.player.isFreezing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You freeze nearby foes.`
        });
    };
    onFreezeUpdate = (_dt) => { 
        if (!this.player.isFreezing) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onFreezeExit = () => {
        if (this.player.inCombat === false) return;
        this.player.setTimeEvent('freezeCooldown', PLAYER.COOLDOWNS.SHORT);
    };

    onMaliceEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.MALICE);    
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.player.isMalicing = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Malice', 750, 'hush');
        this.player.maliceBubble = new Bubble(this.scene, this.player.x, this.player.y, 'purple', PLAYER.DURATIONS.MALICE);
        this.player.setTimeEvent('maliceCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.player.isMalicing = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You wrack malicious foes with the hush of their own attack.`
        });
    };
    onMaliceUpdate = (_dt) => {
        if (this.player.isMalicing) {
            this.player.maliceBubble.update(this.player.x, this.player.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onMaliceExit = () => {
        if (this.player.maliceBubble) {
            this.player.maliceBubble.destroy();
            this.player.maliceBubble = undefined;
        };
    };

    maliceHit = () => {
        if (this.player.maliceBubble === undefined || this.player.isMalicing === false) {
            if (this.player.maliceBubble) {
                this.player.maliceBubble.destroy();
                this.player.maliceBubble = undefined;
            };
            this.player.isMalicing = false;
            return;
        };
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Malice', 750, 'hush');
        this.scene.combatMachine.action({ data: 10, type: 'Chiomic' });
        this.player.maliceBubble.setCharges(this.player.maliceBubble.charges - 1);
        if (this.player.maliceBubble.charges <= 0) {
            this.player.isMalicing = false;
        };
    };

    onMendEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.MEND);    
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.isMending = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mending', 750, 'tendril');
        this.mendBubble = new Bubble(this.scene, this.player.x, this.player.y, 'purple', PLAYER.DURATIONS.MEND);
        this.player.setTimeEvent('mendCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.isMending = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to mend oncoming attacks.`
        });
    };
    onMendUpdate = (_dt) => { 
        if (this.isMending) {
            this.mendBubble.update(this.player.x, this.player.y);
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Mending', 500, 'tendril');
        this.scene.combatMachine.action({ data: { key: 'player', value: 15, id: this.player.playerID }, type: 'Health' });
        this.mendBubble.setCharges(this.mendBubble.charges - 1);
        if (this.mendBubble.charges <= 0) {
            this.isMending = false;
        };
    };

    onProtectEnter = () => {
        this.isProtecting = true;
        this.scene.useStamina(PLAYER.STAMINA.PROTECT);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Protecting', 750, 'effect');
        this.protectBubble = new Bubble(this.scene, this.player.x, this.player.y, 'gold', PLAYER.DURATIONS.PROTECT);
        this.player.setTimeEvent('protectCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.isProtecting = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You protect yourself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt) => {
        if (this.isProtecting) {
            this.protectBubble.update(this.player.x, this.player.y);
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

    onRecoverEnter = () => {
        this.isRecovering = true;
        this.scene.useStamina(PLAYER.STAMINA.RECOVER);    
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Recovering', 750, 'effect');
        this.recoverBubble = new Bubble(this.scene, this.player.x, this.player.y, 'green', PLAYER.DURATIONS.RECOVER);
        this.player.setTimeEvent('recoverCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RECOVER, () => {
            this.isRecovering = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You warp oncoming damage into stamina.`
        });
    };
    onRecoverUpdate = (_dt) => {
        this.player.combatChecker(this.isRecovering);
        if (this.isRecovering) {
            this.recoverBubble.update(this.player.x, this.player.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onRecoverExit = () => {
        if (this.recoverBubble) {
            this.recoverBubble.destroy();
            this.recoverBubble = undefined;
        };
    };

    recoverHit = () => {
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Recovered', 500, 'effect');
        this.scene.useStamina(-25);
    };

    onRenewalEnter = () => {
        this.isRenewing = true;
        this.scene.useStamina(PLAYER.STAMINA.RENEWAL);    
        this.aoe = new AoE(this.scene, 'renewal', 6, true);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Hush Tears', 750, 'bone');
        this.player.setTimeEvent('renewalCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.isRenewing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt) => {if (this.isRenewing) this.metaMachine.setState(States.CLEAN);};
    onRenewalExit = () => {};

    onScreamEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.SCREAM);    
        this.aoe = new AoE(this.scene, 'scream', 1);    
        this.scene.sound.play('scream', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Screaming', 750, 'hush');
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You scream, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt) => {if (!this.isScreaming) this.metaMachine.setState(States.CLEAN);};
    onScreamExit = () => this.player.setTimeEvent('screamCooldown', PLAYER.COOLDOWNS.SHORT);

    onShieldEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.SHIELD);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.isShielding = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shielding', 750, 'bone');
        this.shieldBubble = new Bubble(this.scene, this.player.x, this.player.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.player.setTimeEvent('shieldCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.isShielding = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shield yourself from oncoming attacks.`
        });
    };
    onShieldUpdate = (_dt) => { 
        if (this.isShielding) {
            this.shieldBubble.update(this.player.x, this.player.y);
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
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shield Hit', 500, 'effect');
        this.shieldBubble.setCharges(this.shieldBubble.charges - 1);
        if (this.shieldBubble.charges <= 0) {
            this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Shield Broken', 500, 'damage');
            this.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.isShimmering = true; 
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.SHIMMER);
        this.player.setTimeEvent('shimmerCooldown', PLAYER.COOLDOWNS.MODERATE);
        if (!this.player.isStealthing) this.stealthEffect(true);    
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.isShimmering = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shimmer, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt) => {if (!this.isShimmering) this.metaMachine.setState(States.CLEAN);};
    onShimmerExit = () => this.stealthEffect(false);

    shimmerHit = () => {
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, `You simply weren't there`, 500, 'effect');
    };

    onSprintEnter = () => {
        this.player.isSprinting = true;
        this.scene.sound.play('blink', { volume: this.scene.settings.volume / 3 });
        this.player.adjustSpeed(PLAYER.SPEED.SPRINT);
        this.scene.useStamina(PLAYER.STAMINA.SPRINT);
        this.player.setTimeEvent('sprintCooldown', PLAYER.COOLDOWNS.MODERATE);
        if (!this.player.isCaerenic && !this.player.isGlowing) this.player.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.player.isSprinting = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You tap into your caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt) => {if (!this.player.isSprinting) this.metaMachine.setState(States.CLEAN);};
    onSprintExit = () => {
        if (this.player.isGlowing) this.player.checkCaerenic(false); // !this.player.isCaerenic && 
        this.player.adjustSpeed(-PLAYER.SPEED.SPRINT);
    };

    onStealthEnter = () => {
        if (!this.isShimmering) this.player.isStealthing = true; 
        this.stealthEffect(true);    
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You step halfway into the land of hush and tendril.`
        });
    };
    onStealthUpdate = (_dt) => {if (!this.player.isStealthing || this.player.currentRound > 1 || this.scene.combat) this.metaMachine.setState(States.CLEAN);};
    onStealthExit = () => { 
        this.player.isStealthing = false;
        this.stealthEffect(false);
    };

    stealthEffect = (stealth) => {
        if (stealth) {
            const getStealth = (object) => {
                object.setAlpha(0.5); // 0.7
                object.setBlendMode(BlendModes.SCREEN);
                this.scene.tweens.add({
                    targets: object,
                    tint: 0x00AAFF, // 0x00AAFF
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
            const clearStealth = (object) => {
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
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
    };

    onWardEnter = () => {
        this.isWarding = true;
        this.scene.useStamina(PLAYER.STAMINA.WARD);    
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Warding', 750, 'damage');
        this.wardBubble = new Bubble(this.scene, this.player.x, this.player.y, 'red', PLAYER.DURATIONS.WARD);
        this.player.setTimeEvent('wardCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.isWarding = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ward yourself from oncoming attacks.`
        });
    };
    onWardUpdate = (_dt) => { 
        if (this.isWarding) {
            this.wardBubble.update(this.player.x, this.player.y);
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

    wardHit = (id) => {
        if (this.wardBubble === undefined || this.isWarding === false) {
            if (this.wardBubble) {
                this.wardBubble.destroy();
                this.wardBubble = undefined;
            };
            this.isWarding = false;
            return;
        };
        this.scene.sound.play('parry', { volume: this.scene.settings.volume });
        this.scene.stunned(id);
        this.wardBubble.setCharges(this.wardBubble.charges - 1);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Warded', 500, 'effect');
        if (this.wardBubble.charges <= 3) {
            this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Ward Broken', 500, 'damage');
            this.wardBubble.setCharges(0);
            this.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.WRITHE);    
        this.aoe = new AoE(this.scene, 'writhe', 1);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Writhing', 750, 'tendril');
        this.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.isWrithing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onWritheUpdate = (_dt) => {
        this.player.combatChecker(this.isWrithing);
        if (!this.isWrithing) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onWritheExit = () => {
        if (!this.player.inCombat) return;
        this.player.setTimeEvent('writheCooldown', PLAYER.COOLDOWNS.SHORT);  
    };

    // ==================== TRAITS ==================== \\
    onAstricationEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.ASTRICATION);    
        this.player.setTimeEvent('astricationCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.sound.play('lightning', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Astrication', 750, 'effect');
        this.isAstrifying = true;
        this.player.flickerCarenic(PLAYER.DURATIONS.ASTRICATION); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.ASTRICATION, () => {
            this.isAstrifying = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren astrifies, wrapping round your attacks.`
        });
    };
    onAstricationUpdate = (_dt) => {if (!this.isAstrifying) this.metaMachine.setState(States.CLEAN);};
    onAstricationExit = () => {};

    onBerserkEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.BERSERK);    
        this.player.setTimeEvent('berserkCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Berserking', 750, 'damage');
        this.isBerserking = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BERSERK, () => {
            this.isBerserking = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren feeds off the pain, its hush shrieking forth.`
        });
    };
    onBerserkUpdate = (_dt) => {if (!this.isBerserking) this.metaMachine.setState(States.CLEAN);};
    onBerserkExit = () => {};

    onBlindEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.BLIND);    
        this.aoe = new AoE(this.scene, 'blind', 1);    
        this.scene.sound.play('righteous', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Brilliance', 750, 'effect');
        this.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.isBlinding = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shines with brilliance, blinding those around you.`
        });
    };
    onBlindUpdate = (_dt) => {if (!this.isBlinding) this.metaMachine.setState(States.CLEAN);};
    onBlindExit = () => this.player.setTimeEvent('blindCooldown', PLAYER.COOLDOWNS.SHORT);

    onCaerenesisEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.scene.useStamina(PLAYER.STAMINA.CAERENESIS);    
        this.aoe = new AoE(this.scene, 'caerenesis', 1, false, undefined, false, this.currentTarget);    
        this.scene.sound.play('blink', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Caerenesis', 750, 'cast');
        this.isCaerenesis = true;
        this.player.setTimeEvent('caerenesisCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CAERENESIS, () => {
            this.isCaerenesis = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onCaerenesisUpdate = (_dt) => {if (!this.isCaerenesis) this.metaMachine.setState(States.CLEAN);};
    onCaerenesisExit = () => {};

    onConvictionEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.CONVICTION);    
        this.player.setTimeEvent('convictionCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.combatMachine.input('conviction', {active:true,charges:0});
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Conviction', 750, 'tendril');
        this.isConvicted = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CONVICTION, () => {
            this.isConvicted = false;
            this.scene.combatMachine.input('conviction', {active:false,charges:0});
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren steels itself in admiration of your physical form.`
        });
    };
    onConvictionUpdate = (_dt) => {if (!this.isConvicted) this.metaMachine.setState(States.CLEAN)};
    onConvictionExit = () => {};

    onEnduranceEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.ENDURANCE);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Endurance', 750, 'heal');
        this.isEnduring = true;
        this.player.flickerCarenic(PLAYER.DURATIONS.ASTRICATION); 
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.scene.useStamina(-20),
            repeat: 5,
            callbackScope: this
        });
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENDURANCE, () => {
            this.isEnduring = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren's hush pours into other faculties, invigorating you.`
        });
    };
    onEnduranceUpdate = (_dt) => {
        if (!this.isEnduring) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onEnduranceExit = () => this.player.setTimeEvent('enduranceCooldown', PLAYER.COOLDOWNS.LONG);  

    onImpermanenceEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.IMPERMANENCE);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Impermanence', 750, 'hush');
        this.isImpermanent = true;
        this.player.flickerCarenic(1500); 
        this.player.setTimeEvent('impermanenceCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.IMPERMANENCE, () => {
            this.isImpermanent = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and fades, its hush concealing.`
        });
    };
    onImpermanenceUpdate = (_dt) => {if (!this.isImpermanent) this.metaMachine.setState(States.CLEAN);};
    onImpermanenceExit = () => {};

    onSeerEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.SEER);    
        this.scene.sound.play('fire', { volume: this.scene.settings.volume });
        this.scene.combatMachine.input('isSeering', true);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Seer', 750, 'damage');
        this.isSeering = true;
        this.player.setTimeEvent('seerCooldown', PLAYER.COOLDOWNS.LONG);
        this.player.flickerCarenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.SEER, () => {
            this.isSeering = false;
            if (this.scene.state.isSeering === true) {
                this.scene.combatMachine.input('isSeering', false);
            };
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onSeerUpdate = (_dt) => {if (!this.isSeering) this.metaMachine.setState(States.CLEAN);};
    onSeerExit = () => {};

    onStimulateEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.STIMULATE);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Stimulate', 750, 'effect');
        this.isStimulating = true;
        this.player.flickerCarenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.STIMULATE, () => {
            this.isStimulating = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grants reprieve, refreshing you.`
        });
        for (let i = 0; i < this.scene.actionBar.specialButtons.length; i++) {
            const name = this.scene.settings.specials[i].toLowerCase();
            if (name === "stimulate") return;
            console.log(`%c Resetting the cooldown on ${name}}`, 'color: gold');
            this.player.setTimeEvent(`${name}Cooldown`, 0);
        };
    };
    onStimulateUpdate = (_dt) => {if (!this.isStimulating) this.metaMachine.setState(States.CLEAN);};
    onStimulateExit = () => this.player.setTimeEvent('stimulateCooldown', PLAYER.COOLDOWNS.LONG);  

    onStunEnter = () => {
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.player.isStunned = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Stunned', PLAYER.DURATIONS.STUNNED, 'effect');
        this.scene.input.keyboard.enabled = false;
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.player.setTint(0x888888);
        this.player.setStatic(true);
        this.player.anims.pause();
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You've been stunned.`
        });
    };
    onStunUpdate = (dt) => {
        this.player.setVelocity(0);
        this.player.stunDuration -= dt;
        if (this.player.stunDuration <= 0) this.player.isStunned = false;
        this.player.combatChecker(this.player.isStunned);
    };
    onStunExit = () => {
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        this.player.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.scene.input.keyboard.enabled = true;
        this.player.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF)
        this.player.setStatic(false);
        this.player.anims.resume();
    };

    // ================= NEGATIVE MACHINE STATES ================= \\
    onConfusedEnter = () => { 
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, '?c .on-f-u`SeD~', DURATION.TEXT, 'effect');
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.confuseDirection = 'down';
        this.player.confuseMovement = 'idle';
        this.player.confuseVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ''; 
        this.player.setGlow(this, true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const dir = Math.random() * 4;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[dir];
            if (move > 25) {
                if (direction === 'up') {
                    this.player.confuseVelocity = { x: 0, y: -1.75 };
                } else if (direction === 'down') {
                    this.player.confuseVelocity = { x: 0, y: 1.75 };
                } else if (direction === 'right') {
                    this.player.confuseVelocity = { x: -1.75, y: 0 };
                } else if (direction === 'left') {
                    this.player.confuseVelocity = { x: 1.75, y: 0 };
                };
                this.player.confuseMovement = 'move';
            } else {
                this.player.confuseVelocity = { x: 0, y: 0 };
                this.player.confuseMovement = 'idle';                
            };
            this.player.confuseDirection = direction;
        };
        const confusions = ['~?  ? ?!', 'Hhwat?', 'Wh-wor; -e ma i?', 'Woh `re ewe?', '...'];

        this.confuseTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                if (iteration === 5) {
                    iteration = 0;
                    this.player.isConfused = false;
                } else {   
                    this.player.specialCombatText.destroy();
                    randomDirection();
                    this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, confusions[Math.floor(Math.random() * 5)], 1000, 'effect');
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 

    };
    onConfusedUpdate = (_dt) => {
        if (!this.player.isConfused) this.player.combatChecker(this.player.isConfused);
        this.player.setVelocity(this.player.confuseVelocity.x, this.player.confuseVelocity.y);
        if (this.player.moving()) {
            this.player.anims.play(`player_running`, true);
        } else {
            this.player.anims.play(`player_idle`, true);
        };
    };
    onConfusedExit = () => { 
        if (this.player.isConfused) this.player.isConfused = false;
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        this.player.anims.play('player_running', true);
        this.player.spriteWeapon.setVisible(true);
        if (this.confuseTimer) {
            this.confuseTimer.destroy();
            this.confuseTimer = undefined;
        };
        this.player.setGlow(this, false);
    };

    onFearedEnter = () => { 
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage');
        this.player.spriteWeapon.setVisible(false);
        this.player.spriteShield.setVisible(false);
        this.player.fearDirection = 'down';
        this.player.fearMovement = 'idle';
        this.player.fearVelocity = { x: 0, y: 0 };
        this.player.isAttacking = false;
        this.player.isParrying = false;
        this.player.isPosturing = false;
        this.player.isRolling = false;
        this.player.currentAction = ''; 
        this.player.setGlow(this, true);
        let iteration = 0;
        const fears = ['...ahhh!', 'c̶o̷m̷e̷ ̴h̴e̵r̶e̶', 'Stay Away!', 'Somebody HELP ME', 'g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓'];
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Math.random() * 4];
            if (move > 25) {
                if (direction === 'up') {
                    this.player.fearVelocity = { x: 0, y: -2 };
                } else if (direction === 'down') {
                    this.player.fearVelocity = { x: 0, y: 2 };
                } else if (direction === 'right') {
                    this.player.fearVelocity = { x: -2, y: 0 };
                } else if (direction === 'left') {
                    this.player.fearVelocity = { x: 2, y: 0 };
                };
                this.player.fearMovement = 'move';
            } else {
                this.player.fearVelocity = { x: 0, y: 0 };
                this.player.fearMovement = 'idle';                
            };
            this.player.fearDirection = direction;
        };

        this.player.fearTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => {
                iteration++;
                if (iteration === 4) {
                    iteration = 0;
                    this.player.isFeared = false;
                } else {   
                    randomDirection();
                    this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, fears[Math.floor(Math.random() * 5)], 1000, 'effect');
                };
            },
            callbackScope: this,
            repeat: 3,
        }); 

    };
    onFearedUpdate = (_dt) => {
        if (!this.player.isFeared) this.player.combatChecker(this.player.isFeared);
        this.player.setVelocity(this.player.fearVelocity.x, this.player.fearVelocity.y);
        if (this.player.moving()) {
            this.player.anims.play(`player_running`, true);
        } else {
            this.player.anims.play(`player_idle`, true);
        };
    };
    onFearedExit = () => { 
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        if (this.player.isFeared) this.player.isFeared = false;
        this.player.anims.play('player_running', true);
        this.player.spriteWeapon.setVisible(true);
        if (this.player.fearTimer) {
            this.player.fearTimer.destroy();
            this.player.fearTimer = undefined;
        };
        this.player.setGlow(this, false);
    };

    onFrozenEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Frozen', DURATION.TEXT, 'cast');
        if (!this.player.isPolymorphed) this.player.clearAnimations();
        this.player.anims.play('player_idle', true);
        this.player.setStatic(true);
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
    onFrozenExit = () => {
        this.player.setStatic(false);
    };

    onPolymorphedEnter = () => {
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.player.isPolymorphed = true;
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Polymorphed', DURATION.TEXT, 'effect');
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
            const dir = Math.random() * 4;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[dir];
            if (move > 25) {
                if (direction === 'up') {
                    this.player.polymorphVelocity = { x: 0, y: -1.25 };
                } else if (direction === 'down') {
                    this.player.polymorphVelocity = { x: 0, y: 1.25 };
                } else if (direction === 'right') {
                    this.player.polymorphVelocity = { x: -1.25, y: 0 };
                } else if (direction === 'left') {
                    this.player.polymorphVelocity = { x: 1.25, y: 0 };
                };
                this.player.polymorphMovement = 'move';
            } else {
                this.player.polymorphVelocity = { x: 0, y: 0 };
                this.player.polymorphMovement = 'idle';                
            };
            this.player.polymorphDirection = direction;
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
                    this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, '...thump', 1000, 'effect');
                    this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: 15, id: this.player.playerID } });
                };
            },
            callbackScope: this,
            repeat: 5,
        }); 

    };
    onPolymorphedUpdate = (_dt) => {
        if (!this.player.isPolymorphed) this.player.combatChecker(this.player.isPolymorphed);
        this.player.anims.play(`rabbit_${this.player.polymorphMovement}_${this.player.polymorphDirection}`, true);
        this.player.setVelocity(this.player.polymorphVelocity.x, this.player.polymorphVelocity.y);
    };
    onPolymorphedExit = () => { 
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        if (this.player.isPolymorphed) this.player.isPolymorphed = false;
        this.player.clearAnimations();
        this.player.anims.play('player_running', true);
        this.player.setTint(0x000000);
        this.player.spriteWeapon.setVisible(true);
        if (this.player.polymorphTimer) {
            this.player.polymorphTimer.destroy();
            this.player.polymorphTimer = undefined;
        };
    };

    onSlowedEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Slowed', DURATION.TEXT, 'damage');
        this.player.slowDuration = DURATION.SLOWED;
        this.player.setTint(0xFFC700); // 0x888888
        this.player.adjustSpeed(-PLAYER.SPEED.SLOW);
        this.scene.time.delayedCall(this.player.slowDuration, () =>{
            this.player.isSlowed = false;
            this.negMetaMachine.setState(States.CLEAN);
        });
    };

    onSlowedExit = () => {
        this.player.clearTint();
        this.player.setTint(0x000000);
        this.player.adjustSpeed(PLAYER.SPEED.SLOW);
    };

    onSnaredEnter = () => {
        this.player.specialCombatText = new ScrollingCombatText(this.scene, this.player.x, this.player.y, 'Snared', DURATION.TEXT, 'damage');
        this.snareDuration = 3000;
        this.player.setTint(0x0000FF); // 0x888888
        this.player.adjustSpeed(-PLAYER.SPEED.SNARE);
        this.scene.time.delayedCall(this.snareDuration, () =>{
            this.player.isSnared = false;
            this.negMetaMachine.setState(States.CLEAN);
        });
    };
    // onSnaredUpdate = (dt) => {};
    onSnaredExit = () => { 
        this.player.clearTint();
        this.player.setTint(0x000000);
        this.player.adjustSpeed(PLAYER.SPEED.SNARE);
    };
};