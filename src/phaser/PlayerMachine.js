import { BlendModes, GameObjects, Input, Math as pMath, Physics } from "phaser";
import StateMachine, { States } from "../phaser/StateMachine";
import { PLAYER } from "../utility/player";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";
import Entity, { FRAME_COUNT } from "./Entity";  

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
        if (this.isRanged === true && this.inCombat === true) {
            const correct = this.getEnemyDirection(this.currentTarget);
            if (!correct) {
                // console.log(`%c Error (Attack): You are not looking at or targeting an enemy.`, 'color: #ff0000');
                this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Skill Issue: You are not looking at the enemy', 1500, 'damage');
                return;
            };
        };
        if (this.isPosturing || this.isParrying) return;
        this.isAttacking = true;
        this.swingReset(States.ATTACK, true);
        // this.swingReset(States.POSTURE);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.ATTACK);
    }; 
    onAttackUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'attack');
        };
        this.combatChecker(this.isAttacking);
    }; 
    onAttackExit = () => {
        if (this.scene.state.action !== '') {
            this.scene.combatMachine.input('action', '');
        };
    };

    onParryEnter = () => {
        this.isParrying = true;    
        this.swingReset(States.PARRY, true);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.PARRY);
        if (this.hasMagic === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Counter Spell', 750, 'hush');
            this.isCounterSpelling = true;
            this.flickerCarenic(750); 
            this.scene.time.delayedCall(750, () => {
                this.isCounterSpelling = false;
            }, undefined, this);
        };
    };
    onParryUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.PARRY_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'parry');
        };
        this.combatChecker(this.isParrying);
    };
    onParryExit = () => {
        if (this.scene.state.action !== '') {
            this.scene.combatMachine.input('action', '');
        };
    };

    onPostureEnter = () => {
        if (this.isRanged === true) {
            if (this.isMoving === true) { // The || needs to be a check that the player is 'looking at' the enemy
                // console.log(`%c Error (Posture): You are moving. Please Stand Still.`, 'color: #ff0');
                this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Posture Issue: You are moving', 1500, 'damage');
                return;
            };
            const correct = this.getEnemyDirection(this.currentTarget);
            if (!correct && this.inCombat === true) {
                // console.log(`%c Error (Posture): You are not looking at nor targeting an enemy.`, 'color: #f00');
                this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Skill Issue: You are not looking at the enemy', 1500, 'damage');
                return;
            };
        };
        if (this.isAttacking || this.isParrying) return;
        this.isPosturing = true;
        this.swingReset(States.POSTURE, true);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.POSTURE);
    };
    onPostureUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.isRanged) { //
            this.scene.combatMachine.input('action', 'posture');
        };
        this.combatChecker(this.isPosturing);
    };
    onPostureExit = () => {
        if (this.scene.state.action !== '') {
            this.scene.combatMachine.input('action', '');
        };
    };

    onDodgeEnter = () => {
        if (this.isStalwart || this.isStorming || this.isRolling) return;
        this.isDodging = true;
        this.scene.useStamina(PLAYER.STAMINA.DODGE);
        this.swingReset(States.DODGE, true);
        this.scene.sound.play('dodge', { volume: this.scene.settings.volume });
        this.wasFlipped = this.flipX; 
        this.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
        this.body.parts[0].vertices[0].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[1].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[0].vertices[1].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[0].x += this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    };
    onDodgeUpdate = (_dt) => { 
        this.combatChecker(this.isDodging);
    };
    onDodgeExit = () => {
        if (this.isStalwart || this.isStorming) return;
        this.spriteWeapon.setVisible(true);
        this.dodgeCooldown = 0;
        this.isDodging = false;
        this.body.parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.body.parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT; 
        this.body.parts[0].vertices[0].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[1].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[0].vertices[1].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[0].x -= this.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    };

    onRollEnter = () => {
        if (this.isStalwart || this.isStorming || this.isDodging) return;
        this.isRolling = true;
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.ROLL);
        this.swingReset(States.ROLL, true);
        // this.swingReset(States.DODGE);
        this.scene.sound.play('roll', { volume: this.scene.settings.volume });
        this.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
    };
    onRollUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ROLL_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'roll');
        };
        this.combatChecker(this.isRolling);
    };
    onRollExit = () => {
        if (this.isStalwart || this.isStorming) return;
        this.spriteWeapon.setVisible(true);
        this.rollCooldown = 0; 
        if (this.scene.state.action !== '') {
            this.scene.combatMachine.input('action', '');
        };
        this.body.parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.body.parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
        this.body.parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
    };

    onFlaskEnter = () => {
        this.isHealing = true;
        this.setStatic(true);
    };
    onFlaskUpdate = (_dt) => {
        this.combatChecker(this.isHealing);
    };
    onFlaskExit = () => {
        this.scene.drinkFlask();
        this.setStatic(false);
    };

    onAchireEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Achire', PLAYER.DURATIONS.ACHIRE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.ACHIRE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); // !this.isCaerenic && 
        this.castbar.setVisible(true);  
    };
    onAchireUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.ACHIRE) {
            this.achireSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) {
            this.castbar.update(dt, 'cast');
        };
    };
    onAchireExit = () => {
        if (this.achireSuccess === true) {
            const anim = this.getWeaponAnim();
            this.particleEffect =  this.scene.particleManager.addEffect('achire', this, anim, true);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `Your Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0].name}.`
            });
            this.setTimeEvent('achireCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000); // PLAYER.COOLDOWNS.SHORT
            this.achireSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.ACHIRE);    
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onAstraveEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Astrave', PLAYER.DURATIONS.ASTRAVE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.ASTRAVE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); // !this.isCaerenic && 
        this.castbar.setVisible(true);  
        this.isCasting = true;
    };
    onAstraveUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.ASTRAVE) {
            this.astraveSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) {
            this.castbar.update(dt, 'cast');
        };
    };
    onAstraveExit = () => {
        if (this.astraveSuccess === true) {
            this.aoe = new AoE(this.scene, 'astrave', 1, false, undefined, true);    
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You unearth the winds and lightning from the land of hush and tendril.`
            });
            this.setTimeEvent('astraveCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000); // PLAYER.COOLDOWNS.SHORT
            this.astraveSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.ASTRAVE);    
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onArcEnter = () => {
        this.isArcing = true;
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Arcing', PLAYER.DURATIONS.ARCING / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.ARCING);
        this.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
        this.setStatic(true);
        this.castbar.setVisible(true); 
        this.flickerCarenic(3000); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You begin arcing with your ${this.scene.state.weapons[0].name}.`
        });
    };
    onArcUpdate = (dt) => {
        this.combatChecker(this.isArcing);
        if (this.isArcing) this.castbar.update(dt, 'channel', 0xFF0000);
        if (this.castbar.time >= PLAYER.DURATIONS.ARCING * 0.25 && this.castbar.time <= PLAYER.DURATIONS.ARCING * 0.26) {
            this.isAttacking = true;
        };
        if (this.castbar.time <= 0) {
            this.arcSuccess = true;
            this.isArcing = false;
        };
    };
    onArcExit = () => {
        if (this.arcSuccess) {
            this.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.arcSuccess = false;
            this.scene.useStamina(PLAYER.STAMINA.ARC);
            if (this.currentTarget && this.inCombat === true) {
                if (this.flipX) {
                    this.weaponHitbox.setAngle(270);
                } else {
                    this.weaponHitbox.setAngle(0);
                };
                // this.weaponHitbox.setPosition(this.x + (this.flipX ? -32 : 32), this.y - 12);  
                this.weaponHitbox.x = this.flipX ? this.x - 32 : this.x + 32;
                this.weaponHitbox.y = this.y - 12;
                if (this.weaponHitbox.getBounds().contains(this.currentTarget.x, this.currentTarget.y)) {
                    this.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: 'arc' } });
                    this.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.MODERATE);
                };
            };
            this.castbar.reset();
            this.setStatic(false);
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
        if (this.moving()) {
            this.scene.useStamina(PLAYER.STAMINA.BLINK);
        };
        const blinkCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('blinkCooldown', blinkCooldown);
        this.flickerCarenic(750); 
    };
    onBlinkUpdate = (_dt) => {
        this.combatChecker(this.isBlinking);
    };
    onBlinkExit = () => {};
    
    onKyrnaicismEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.isCasting = true;
        this.scene.useStamina(PLAYER.STAMINA.KYRNAICISM);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.flickerCarenic(3000); 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.currentTarget.isConsumed = true;
        this.scene.slow(this.spellTarget);
        this.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.kyrnaicismTick(),
            callbackScope: this,
            repeat: 3,
        });
        this.setTimeEvent('kyrnaicismCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                this.isCasting = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.setStatic(true);
        this.castbar.setVisible(true);  
    };
    onKyrnaicismUpdate = (dt) => {
        this.combatChecker(this.isCasting);
        if (this.isCasting) this.castbar.update(dt, 'channel', 0xA700FF);
    };
    onKyrnaicismExit = () => {
        this.castbar.reset();
        this.spellTarget = '';
        this.setStatic(false);
        if (this.chiomicTimer) {
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
        }; 
    };
    kyrnaicismTick = () => {
        if (!this.isCasting || this.scene.state.playerWin || this.scene.state.newComputerHealth <= 0) {
            this.isCasting = false;
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
            return;
        };
        if (this.spellTarget === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Chiomic', data: 10 }); // this.spellTarget  
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.spellTarget);
            const chiomic = Math.round(this.scene.state.playerHealth * 0.1 * (this.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const chiomicDescription = `Your hush flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription: chiomicDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.spellTarget } });
        };
    };

    onConfuseEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.CONFUSE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); // !this.isCaerenic && 
        this.castbar.setVisible(true);  
    };
    onConfuseUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
            this.confuseSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onConfuseExit = () => {
        if (this.confuseSuccess === true) {
            this.scene.confuse(this.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You confuse ${this.scene.state.computer?.name}, and they stumble around in a daze.`
            });
            this.setTimeEvent('confuseCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.confuseSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.CONFUSE);    
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onConsumeEnter = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.isConsuming = true;
        this.scene.sound.play('consume', { volume: this.scene.settings.volume });
        this.setTimeEvent('consumeCooldown', PLAYER.COOLDOWNS.SHORT);
    };
    onConsumeUpdate = (_dt) => {
        this.combatChecker(this.isConsuming);
    };
    onConsumeExit = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.scene.combatMachine.action({ type: 'Consume', data: this.scene.state.playerEffects[0].id });        
        this.scene.useStamina(PLAYER.STAMINA.CONSUME);
    };

    onDesperationEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'heal');
        this.scene.useStamina(PLAYER.STAMINA.DESPERATION);
        this.flickerCarenic(PLAYER.DURATIONS.HEALING); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0].influences[0]} soothes your body.`
        });
    };
    onDesperationUpdate = (_dt) => {
        this.combatChecker(false);
    };
    onDesperationExit = () => {
        const desperationCooldown = this.inCombat ? PLAYER.COOLDOWNS.LONG : PLAYER.COOLDOWNS.SHORT;
        this.setTimeEvent('desperationCooldown', desperationCooldown);  
        this.scene.combatMachine.action({ data: { key: 'player', value: 50, id: this.playerID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
    };

    onFearingEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Fearing', PLAYER.DURATIONS.FEAR / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FEAR);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);  
    };
    onFearingUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.FEAR) {
            this.fearSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onFearingExit = () => {
        if (this.fearSuccess === true) {
            this.scene.fear(this.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You strike fear into ${this.scene.state.computer?.name}!`
            });
            this.setTimeEvent('fearCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.fearSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.FEAR);    
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onParalyzeEnter = () => { 
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Paralyzing', PLAYER.DURATIONS.PARALYZE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.PARALYZE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true); 
    };
    onParalyzeUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.PARALYZE) {
            this.paralyzeSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onParalyzeExit = () => {
        if (this.paralyzeSuccess === true) {
            this.scene.paralyze(this.spellTarget);
            this.setTimeEvent('paralyzeCooldown', PLAYER.COOLDOWNS.MODERATE);  
            this.scene.useStamina(PLAYER.STAMINA.PARALYZE);
            this.paralyzeSuccess = false;
            this.scene.mysterious.play();
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You paralyze ${this.scene.state.computer?.name} for several seconds!`
            });
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onFyerusEnter = () => {
        this.isCasting = true;
        if (this.isMoving === true) this.isCasting = false;
        if (this.isCasting === false) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Fyerus', PLAYER.DURATIONS.FYERUS / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FYERUS);
        this.castbar.setTime(PLAYER.DURATIONS.FYERUS);
        this.castbar.setVisible(true);  
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); // !this.isCaerenic && 
        this.aoe = new AoE(this.scene, 'fyerus', 6, false, undefined, true);    
        this.scene.useStamina(PLAYER.STAMINA.FYERUS);    
        this.setTimeEvent('fyerusCooldown', 2000); // PLAYER.COOLDOWNS.SHORT
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You unearth the fires and water from the land of hush and tendril.`
        });
    };
    onFyerusUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        if (this.castbar.time <= 0) {
            this.isCasting = false;
        };
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) {
            this.castbar.update(dt, 'channel', 0xE0115F);
        };
    };
    onFyerusExit = () => {
        this.castbar.reset();
        this.isFyerus = false;
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onHealingEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.HEALING);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);  
    };
    onHealingUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.HEALING) {
            this.healingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast', 0x00C200);
    };
    onHealingExit = () => {
        if (this.healingSuccess === true) {
            this.setTimeEvent('healingCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.scene.useStamina(PLAYER.STAMINA.HEALING);
            this.healingSuccess = false;
            this.scene.combatMachine.action({ data: { key: 'player', value: 25, id: this.playerID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onInvokeEnter = () => {
        if (!this.inCombat || !this.currentTarget) return;
        this.isPraying = true;
        this.setStatic(true);
        this.flickerCarenic(1000); 
        this.setTimeEvent('invokeCooldown', PLAYER.COOLDOWNS.LONG);
        this.invokeCooldown = 30;
        if (this.playerBlessing === '' || this.playerBlessing !== this.scene.state.playerBlessing) {
            this.playerBlessing = this.scene.state.playerBlessing;
        };
    };
    onInvokeUpdate = (_dt) => {
        this.combatChecker(this.isPraying);
    };
    onInvokeExit = () => {
        if (!this.inCombat || !this.currentTarget) return;
        this.setStatic(false);
        this.scene.combatMachine.action({ type: 'Instant', data: this.scene.state.playerBlessing });
        this.scene.sound.play('prayer', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.INVOKE);
    };

    onKynisosEnter = () => { 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Kynisos', PLAYER.DURATIONS.KYNISOS / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.KYNISOS);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); // !this.isCaerenic && 
        this.castbar.setVisible(true);   
    };
    onKynisosUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.KYNISOS) {
            this.kynisosSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) {
            this.castbar.update(dt, 'cast');
        };
    };
    onKynisosExit = () => {
        if (this.kynisosSuccess === true) {
            this.aoe = new AoE(this.scene, 'kynisos', 3, false, undefined, true);    
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You unearth the netting of the golden hunt.`
            });
            this.setTimeEvent('kynisosCooldown', 2000); // PLAYER.COOLDOWNS.SHORT
            this.kynisosSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.KYNISOS);    
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onLeapEnter = () => {
        this.isLeaping = true;
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.isAttacking = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 125),
            y: this.y + (direction.y * 125),
            duration: 750,
            ease: 'Elastic',
            onStart: () => {
                this.scene.sound.play('leap', { volume: this.scene.settings.volume });
                this.flickerCarenic(750); 
            },
            onComplete: () => { 
                this.scene.useStamina(PLAYER.STAMINA.LEAP);
                this.isLeaping = false; 
                if (this.touching.length > 0 && this.inCombat === true) {
                    this.touching.forEach(enemy => {
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
        this.combatChecker(this.isLeaping);
    };
    onLeapExit = () => {
        const leapCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('leapCooldown', leapCooldown);
    };

    onRushEnter = () => {
        this.isRushing = true;
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });        
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.isParrying = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 250),
            y: this.y + (direction.y * 250),
            duration: 500,
            ease: 'Circ.easeOut',
            onStart: () => {
                this.flickerCarenic(500);  
            },
            onComplete: () => {
                if (this.rushedEnemies.length > 0 && this.inCombat === true) {
                    this.rushedEnemies.forEach(enemy => {
                        this.scene.writhe(enemy.enemyID, 'rush');
                    });
                };
                this.isRushing = false;
            },
        });         
    };
    onRushUpdate = (_dt) => {
        this.combatChecker(this.isRushing);
    };
    onRushExit = () => {
        this.rushedEnemies = [];
        const rushCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('rushCooldown', rushCooldown);
        this.scene.useStamina(PLAYER.STAMINA.RUSH);
    };

    onPolymorphingEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.POLYMORPH);
        this.isCasting = true;
        if (!this.isCaerenic && !this.isGlowing) this.checkCaerenic(true);
        this.castbar.setVisible(true);  
    };
    onPolymorphingUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
            this.polymorphSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onPolymorphingExit = () => {
        if (this.polymorphSuccess === true) {
            this.scene.polymorph(this.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, polymorphing them!`
            });
            this.setTimeEvent('polymorphCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.scene.useStamina(PLAYER.STAMINA.POLYMORPH);
            this.polymorphSuccess = false;
            this.scene.mysterious.play();
            this.spellTarget = '';
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
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
        const pursuitCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('pursuitCooldown', pursuitCooldown);
        this.flickerCarenic(750); 
    };
    onPursuitUpdate = (_dt) => {
        this.combatChecker(this.isPursuing);
    };
    onPursuitExit = () => {
        if (!this.inCombat && !this.isStealthing && !this.isShimmering) {
            const button = this.scene.smallHud.stances.find(b => b.texture.key === 'stealth');
            this.scene.smallHud.pressStance(button);
        };
    };

    onRootingEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.isCasting = true;
        this.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Rooting', PLAYER.DURATIONS.ROOTING / 2, 'cast');
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);
    };
    onRootingUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.ROOTING) {
            this.rootingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onRootingExit = () => { 
        if (this.rootingSuccess === true) {
            this.rootingSuccess = false;
            this.scene.root(this.spellTarget);
            this.setTimeEvent('rootCooldown', PLAYER.COOLDOWNS.SHORT); 
            this.scene.useStamina(PLAYER.STAMINA.ROOT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, rooting them!`
            });
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onSlowEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.isSlowing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slow', 750, 'cast');
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.slow(this.spellTarget);
        this.scene.useStamina(PLAYER.STAMINA.SLOW);
        this.setTimeEvent('slowCooldown', PLAYER.COOLDOWNS.SHORT); 
        this.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => this.isSlowing = false);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, slowing them!`
        });
    };
    onSlowUpdate = (_dt) => this.combatChecker(this.isSlowing);
    onSlowExit = () => this.spellTarget = '';

    onSacrificeEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.isSacrificing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Sacrifice', 750, 'effect');
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.SACRIFICE);
        this.scene.combatMachine.action({ type: 'Sacrifice', data: undefined });
        this.setTimeEvent('sacrificeCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.flickerCarenic(500);  
        this.scene.time.delayedCall(500, () => this.isSacrificing = false);
    };
    onSacrificeUpdate = (_dt) => this.combatChecker(this.isSacrificing);
    onSacrificeExit = () => this.spellTarget = '';

    onSnaringEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.LONG)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snaring', PLAYER.DURATIONS.SNARE, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.SNARE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true); 
    };
    onSnaringUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.SNARE) {
            this.snaringSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onSnaringExit = () => {
        if (this.snaringSuccess === true) {
            this.setTimeEvent('snareCooldown', PLAYER.DURATIONS.SHORT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, snaring them!`
            });
            this.scene.useStamina(PLAYER.STAMINA.SNARE);
            this.scene.snare(this.spellTarget);
            this.snaringSuccess = false;
            this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onStormEnter = () => {
        this.isStorming = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Storming', 800, 'effect'); 
        this.isAttacking = true;
        this.scene.useStamina(PLAYER.STAMINA.STORM);
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 800,
            onStart: () => {
                this.flickerCarenic(3000); 
            },
            onLoop: () => {
                console.log('Storming!');
                // if (this.inCombat === false) return;
                this.isAttacking = true;
                this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Storming', 800, 'effect');
                if (this.touching.length > 0) {
                    this.touching.forEach(enemy => {
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
        this.combatChecker(this.isStorming);
    };
    onStormExit = () => { 
        this.setTimeEvent('stormCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);
    };

    onSutureEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return;  
        this.isSuturing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Suture', 750, 'effect');
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.SUTURE);
        this.scene.combatMachine.action({ type: 'Suture', data: undefined });
        this.setTimeEvent('sutureCooldown', PLAYER.COOLDOWNS.MODERATE);
        
        this.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => {
            this.isSuturing = false;
        });
        
    };
    onSutureUpdate = (_dt) => {
        this.combatChecker(this.isSuturing);
    };
    onSutureExit = () => {};

    onDevourEnter = () => {
        if (this.currentTarget === undefined) return; 
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.isCasting = true;
        this.currentTarget.isConsumed = true;
        this.scene.useStamina(PLAYER.STAMINA.DEVOUR);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.flickerCarenic(2000); 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Tshaering', PLAYER.DURATIONS.DEVOUR / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.DEVOUR);
        this.castbar.setTime(PLAYER.DURATIONS.DEVOUR);
        this.tshaeringTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => this.tshaeralTick(),
            callbackScope: this,
            repeat: 8,
        });
        this.setTimeEvent('tshaeralCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.isCasting = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.setStatic(true);
        this.castbar.setVisible(true); 
    };
    onDevourUpdate = (dt) => {
        this.combatChecker(this.isCasting);
        if (this.isCasting === true) this.castbar.update(dt, 'channel', 0xA700FF);
    };
    onDevourExit = () => {
        this.castbar.reset(); 
        this.spellTarget = '';
        this.setStatic(false);
        if (this.tshaeringTimer !== undefined) {
            this.tshaeringTimer.remove(false);
            this.tshaeringTimer = undefined;
        };
    };
    tshaeralTick = () => {
        if (this.isCasting === false || this.scene.state.playerWin === true || this.scene.state.newComputerHealth <= 0) {
            this.isCasting = false;
            this.tshaeringTimer.remove(false);
            this.tshaeringTimer = undefined;
            return;
        };
        if (this.spellTarget === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Tshaeral', data: 3 });
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.spellTarget);
            const drained = Math.round(this.scene.state.playerHealth * 0.03 * (this.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            const newPlayerHealth = drained / this.scene.state.playerHealth * 100;
            const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
            const tshaeralDescription =
                `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;

            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription: tshaeralDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: newPlayerHealth, id: this.playerID } });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newHealth, id: this.spellTarget } });
        };
    };

    // ================= META MACHINE STATES ================= \\

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onChiomicEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.CHIOMIC);    
        this.aoe = new AoE(this.scene, 'chiomic', 1);    
        this.scene.sound.play('death', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect');
        this.isChiomic = true;
        this.setTimeEvent('chiomicCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.isChiomic = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You mock and confuse your surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt) => {
        if (this.isChiomic === false) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onChiomicExit = () => {};

    onDiseaseEnter = () => {
        this.isDiseasing = true;
        this.scene.useStamina(PLAYER.STAMINA.DISEASE);    
        this.aoe = new AoE(this.scene, 'tendril', 6);    
        this.scene.sound.play('dungeon', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Tendrils Swirl', 750, 'tendril');
        this.setTimeEvent('diseaseCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.isDiseasing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You swirl such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt) => {
        if (this.isDiseasing === false) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onDiseaseExit = () => {};

    onHowlEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.HOWL);    
        this.aoe = new AoE(this.scene, 'howl', 1);    
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Howling', PLAYER.DURATIONS.HOWL, 'damage');
        this.isHowling = true;
        this.setTimeEvent('howlCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.isHowling = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You howl, it's otherworldly nature stunning nearby foes.`
        });
    };
    onHowlUpdate = (_dt) => {
        // this.combatChecker(this.isHowling);
        if (this.isHowling === false) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onHowlExit = () => {};

    onEnvelopEnter = () => {
        this.isEnveloping = true;
        this.scene.useStamina(PLAYER.STAMINA.ENVELOP);    
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Enveloping', 750, 'cast');
        this.envelopBubble = new Bubble(this.scene, this.x, this.y, 'blue', PLAYER.DURATIONS.ENVELOP);
        this.setTimeEvent('envelopCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.isEnveloping = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You envelop yourself, shirking oncoming attacks.`
        });
    };
    onEnvelopUpdate = (_dt) => {
        this.combatChecker(this.isEnveloping);
        if (this.isEnveloping) {
            this.envelopBubble.update(this.x, this.y);
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Enveloped', 500, 'effect');
        this.scene.useStamina(40);
        if (this.stamina - 40 <= 0) {
            this.isEnveloping = false;
        };
    };

    onFreezeEnter = () => {
        this.aoe = new AoE(this.scene, 'freeze', 1);
        this.scene.sound.play('freeze', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.FREEZE);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Freezing', PLAYER.DURATIONS.FREEZE, 'cast');
        this.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.isFreezing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You freeze nearby foes.`
        });
    };
    onFreezeUpdate = (_dt) => { 
        if (!this.isFreezing) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onFreezeExit = () => {
        if (this.inCombat === false) return;
        this.setTimeEvent('freezeCooldown', PLAYER.COOLDOWNS.SHORT);
    };

    onMaliceEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.MALICE);    
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.isMalicing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        this.maliceBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MALICE);
        this.setTimeEvent('maliceCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.isMalicing = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You wrack malicious foes with the hush of their own attack.`
        });
    };
    onMaliceUpdate = (_dt) => {
        if (this.isMalicing) {
            this.maliceBubble.update(this.x, this.y);
        } else {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onMaliceExit = () => {
        if (this.maliceBubble) {
            this.maliceBubble.destroy();
            this.maliceBubble = undefined;
        };
    };

    maliceHit = () => {
        if (this.maliceBubble === undefined || this.isMalicing === false) {
            if (this.maliceBubble) {
                this.maliceBubble.destroy();
                this.maliceBubble = undefined;
            };
            this.isMalicing = false;
            return;
        };
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        this.scene.combatMachine.action({ data: 10, type: 'Chiomic' });
        this.maliceBubble.setCharges(this.maliceBubble.charges - 1);
        if (this.maliceBubble.charges <= 0) {
            this.isMalicing = false;
        };
    };

    onMendEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.MEND);    
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.isMending = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 750, 'tendril');
        this.mendBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MEND);
        this.setTimeEvent('mendCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.isMending = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to mend oncoming attacks.`
        });
    };
    onMendUpdate = (_dt) => { 
        if (this.isMending) {
            this.mendBubble.update(this.x, this.y);
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 500, 'tendril');
        this.scene.combatMachine.action({ data: { key: 'player', value: 15, id: this.playerID }, type: 'Health' });
        this.mendBubble.setCharges(this.mendBubble.charges - 1);
        if (this.mendBubble.charges <= 0) {
            this.isMending = false;
        };
    };

    onProtectEnter = () => {
        this.isProtecting = true;
        this.scene.useStamina(PLAYER.STAMINA.PROTECT);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Protecting', 750, 'effect');
        this.protectBubble = new Bubble(this.scene, this.x, this.y, 'gold', PLAYER.DURATIONS.PROTECT);
        this.setTimeEvent('protectCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.isProtecting = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You protect yourself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt) => {
        if (this.isProtecting) {
            this.protectBubble.update(this.x, this.y);
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Recovering', 750, 'effect');
        this.recoverBubble = new Bubble(this.scene, this.x, this.y, 'green', PLAYER.DURATIONS.RECOVER);
        this.setTimeEvent('recoverCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RECOVER, () => {
            this.isRecovering = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You warp oncoming damage into stamina.`
        });
    };
    onRecoverUpdate = (_dt) => {
        this.combatChecker(this.isRecovering);
        if (this.isRecovering) {
            this.recoverBubble.update(this.x, this.y);
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Recovered', 500, 'effect');
        this.scene.useStamina(-25);
    };

    onRenewalEnter = () => {
        this.isRenewing = true;
        this.scene.useStamina(PLAYER.STAMINA.RENEWAL);    
        this.aoe = new AoE(this.scene, 'renewal', 6, true);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hush Tears', 750, 'bone');
        this.setTimeEvent('renewalCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.isRenewing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt) => {
        if (this.isRenewing) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onRenewalExit = () => {};

    onScreamEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.SCREAM);    
        this.aoe = new AoE(this.scene, 'scream', 1);    
        this.scene.sound.play('scream', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Screaming', 750, 'hush');
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You scream, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt) => { 
        if (!this.isScreaming) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onScreamExit = () => {
        if (this.inCombat === false) return;
        this.setTimeEvent('screamCooldown', PLAYER.COOLDOWNS.SHORT);  
    };

    onShieldEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.SHIELD);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.isShielding = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shielding', 750, 'bone');
        this.shieldBubble = new Bubble(this.scene, this.x, this.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.setTimeEvent('shieldCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.isShielding = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shield yourself from oncoming attacks.`
        });
    };
    onShieldUpdate = (_dt) => { 
        if (this.isShielding) {
            this.shieldBubble.update(this.x, this.y);
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shield Hit', 500, 'effect');
        this.shieldBubble.setCharges(this.shieldBubble.charges - 1);
        if (this.shieldBubble.charges <= 0) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shield Broken', 500, 'damage');
            this.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.isShimmering = true; 
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.SHIMMER);
        this.setTimeEvent('shimmerCooldown', PLAYER.COOLDOWNS.MODERATE);
        if (!this.isStealthing) this.stealthEffect(true);    
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.isShimmering = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shimmer, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt) => {
        if (!this.isShimmering) {
            this.metaMachine.setState(States.CLEAN); 
        };
    };
    onShimmerExit = () => { 
        this.stealthEffect(false);
    };

    shimmerHit = () => {
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `You simply weren't there`, 500, 'effect');
    };

    onSprintEnter = () => {
        this.isSprinting = true;
        this.scene.sound.play('blink', { volume: this.scene.settings.volume / 3 });
        this.adjustSpeed(PLAYER.SPEED.SPRINT);
        this.scene.useStamina(PLAYER.STAMINA.SPRINT);
        this.setTimeEvent('sprintCooldown', PLAYER.COOLDOWNS.MODERATE);
        if (!this.isCaerenic && !this.isGlowing) this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.isSprinting = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You tap into your caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt) => {
        if (!this.isSprinting) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onSprintExit = () => {
        if (this.isGlowing) this.checkCaerenic(false); // !this.isCaerenic && 
        this.adjustSpeed(-PLAYER.SPEED.SPRINT);
    };

    onStealthEnter = () => {
        if (!this.isShimmering) this.isStealthing = true; 
        this.stealthEffect(true);    
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You step halfway into the land of hush and tendril.`
        });
    };
    onStealthUpdate = (_dt) => {
        if (!this.isStealthing || this.currentRound > 1 || this.scene.combat) {
            this.metaMachine.setState(States.CLEAN); 
        };
    };
    onStealthExit = () => { 
        this.isStealthing = false;
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
            this.adjustSpeed(-PLAYER.SPEED.STEALTH);
            getStealth(this);
            getStealth(this.spriteWeapon);
            getStealth(this.spriteShield);
        } else {
            const clearStealth = (object) => {
                this.scene.tweens.killTweensOf(object);
                object.setAlpha(1);
                object.clearTint();
                object.setBlendMode(BlendModes.NORMAL);
            };
            this.adjustSpeed(PLAYER.SPEED.STEALTH);
            clearStealth(this);
            clearStealth(this.spriteWeapon);
            clearStealth(this.spriteShield);
            this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        };
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
    };

    onWardEnter = () => {
        this.isWarding = true;
        this.scene.useStamina(PLAYER.STAMINA.WARD);    
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warding', 750, 'damage');
        this.wardBubble = new Bubble(this.scene, this.x, this.y, 'red', PLAYER.DURATIONS.WARD);
        this.setTimeEvent('wardCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.isWarding = false;    
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ward yourself from oncoming attacks.`
        });
    };
    onWardUpdate = (_dt) => { 
        if (this.isWarding) {
            this.wardBubble.update(this.x, this.y);
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warded', 500, 'effect');
        if (this.wardBubble.charges <= 3) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Ward Broken', 500, 'damage');
            this.wardBubble.setCharges(0);
            this.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.WRITHE);    
        this.aoe = new AoE(this.scene, 'writhe', 1);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Writhing', 750, 'tendril');
        this.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.isWrithing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onWritheUpdate = (_dt) => {
        this.combatChecker(this.isWrithing);
        if (!this.isWrithing) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onWritheExit = () => {
        if (!this.inCombat) return;
        this.setTimeEvent('writheCooldown', PLAYER.COOLDOWNS.SHORT);  
    };

    // ==================== TRAITS ==================== \\
    onAstricationEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.ASTRICATION);    
        this.setTimeEvent('astricationCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.sound.play('lightning', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Astrication', 750, 'effect');
        this.isAstrifying = true;
        this.flickerCarenic(PLAYER.DURATIONS.ASTRICATION); 
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
        this.setTimeEvent('berserkCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Berserking', 750, 'damage');
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Brilliance', 750, 'effect');
        this.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.isBlinding = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shines with brilliance, blinding those around you.`
        });
    };
    onBlindUpdate = (_dt) => {if (!this.isBlinding) this.metaMachine.setState(States.CLEAN);};
    onBlindExit = () => this.setTimeEvent('blindCooldown', PLAYER.COOLDOWNS.SHORT);

    onCaerenesisEnter = () => {
        if (this.currentTarget === undefined) return;
        if (this.outOfRange(PLAYER.RANGE.MODERATE)) return; 
        this.scene.useStamina(PLAYER.STAMINA.CAERENESIS);    
        this.aoe = new AoE(this.scene, 'caerenesis', 1, false, undefined, false, this.currentTarget);    
        this.scene.sound.play('blink', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Caerenesis', 750, 'cast');
        this.isCaerenesis = true;
        this.setTimeEvent('caerenesisCooldown', PLAYER.COOLDOWNS.SHORT);  
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
        this.setTimeEvent('convictionCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.combatMachine.input('conviction', {active:true,charges:0});
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Conviction', 750, 'tendril');
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Endurance', 750, 'heal');
        this.isEnduring = true;
        this.flickerCarenic(PLAYER.DURATIONS.ASTRICATION); 
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
    onEnduranceExit = () => this.setTimeEvent('enduranceCooldown', PLAYER.COOLDOWNS.LONG);  

    onImpermanenceEnter = () => {
        this.scene.useStamina(PLAYER.STAMINA.IMPERMANENCE);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Impermanence', 750, 'hush');
        this.isImpermanent = true;
        this.flickerCarenic(1500); 
        this.setTimeEvent('impermanenceCooldown', PLAYER.COOLDOWNS.MODERATE);  
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Seer', 750, 'damage');
        this.isSeering = true;
        this.setTimeEvent('seerCooldown', PLAYER.COOLDOWNS.LONG);
        this.flickerCarenic(1500); 
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
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stimulate', 750, 'effect');
        this.isStimulating = true;
        this.flickerCarenic(1500); 
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
            this.setTimeEvent(`${name}Cooldown`, 0);
        };
    };
    onStimulateUpdate = (_dt) => {if (!this.isStimulating) this.metaMachine.setState(States.CLEAN);};
    onStimulateExit = () => this.setTimeEvent('stimulateCooldown', PLAYER.COOLDOWNS.LONG);  

    onStunEnter = () => {
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.isStunned = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', PLAYER.DURATIONS.STUNNED, 'effect');
        this.scene.input.keyboard.enabled = false;
        this.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.setTint(0x888888);
        this.setStatic(true);
        this.anims.pause();
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You've been stunned.`
        });
    };
    onStunUpdate = (dt) => {
        this.setVelocity(0);
        this.stunDuration -= dt;
        if (this.stunDuration <= 0) this.isStunned = false;
        this.combatChecker(this.isStunned);
    };
    onStunExit = () => {
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        this.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.scene.input.keyboard.enabled = true;
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF)
        this.setStatic(false);
        this.anims.resume();
    };

    // ================= NEGATIVE MACHINE STATES ================= \\
    onConfusedEnter = () => { 
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, '?c .on-f-u`SeD~', DURATION.TEXT, 'effect');
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
        this.setGlow(this, true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const dir = Math.random() * 4;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[dir];
            if (move > 25) {
                if (direction === 'up') {
                    this.confuseVelocity = { x: 0, y: -1.75 };
                } else if (direction === 'down') {
                    this.confuseVelocity = { x: 0, y: 1.75 };
                } else if (direction === 'right') {
                    this.confuseVelocity = { x: -1.75, y: 0 };
                } else if (direction === 'left') {
                    this.confuseVelocity = { x: 1.75, y: 0 };
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
                    this.specialCombatText.destroy();
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, confusions[Math.floor(Math.random() * 5)], 1000, 'effect');
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 

    };
    onConfusedUpdate = (_dt) => {
        if (!this.isConfused) this.combatChecker(this.isConfused);
        this.setVelocity(this.confuseVelocity.x, this.confuseVelocity.y);
        if (this.moving()) {
            this.anims.play(`player_running`, true);
        } else {
            this.anims.play(`player_idle`, true);
        };
    };
    onConfusedExit = () => { 
        if (this.isConfused) this.isConfused = false;
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        this.anims.play('player_running', true);
        this.spriteWeapon.setVisible(true);
        if (this.confuseTimer) {
            this.confuseTimer.destroy();
            this.confuseTimer = undefined;
        };
        this.setGlow(this, false);
    };

    onFearedEnter = () => { 
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage');
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
        this.setGlow(this, true);
        let iteration = 0;
        const fears = ['...ahhh!', 'c̶o̷m̷e̷ ̴h̴e̵r̶e̶', 'Stay Away!', 'Somebody HELP ME', 'g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓'];
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Math.random() * 4];
            if (move > 25) {
                if (direction === 'up') {
                    this.fearVelocity = { x: 0, y: -2 };
                } else if (direction === 'down') {
                    this.fearVelocity = { x: 0, y: 2 };
                } else if (direction === 'right') {
                    this.fearVelocity = { x: -2, y: 0 };
                } else if (direction === 'left') {
                    this.fearVelocity = { x: 2, y: 0 };
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
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, fears[Math.floor(Math.random() * 5)], 1000, 'effect');
                };
            },
            callbackScope: this,
            repeat: 3,
        }); 

    };
    onFearedUpdate = (_dt) => {
        if (!this.isFeared) this.combatChecker(this.isFeared);
        this.setVelocity(this.fearVelocity.x, this.fearVelocity.y);
        if (this.moving()) {
            this.anims.play(`player_running`, true);
        } else {
            this.anims.play(`player_idle`, true);
        };
    };
    onFearedExit = () => { 
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        if (this.isFeared) this.isFeared = false;
        this.anims.play('player_running', true);
        this.spriteWeapon.setVisible(true);
        if (this.fearTimer) {
            this.fearTimer.destroy();
            this.fearTimer = undefined;
        };
        this.setGlow(this, false);
    };

    onFrozenEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Frozen', DURATION.TEXT, 'cast');
        if (!this.isPolymorphed) this.clearAnimations();
        this.anims.play('player_idle', true);
        this.setStatic(true);
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
        this.setStatic(false);
    };

    onPolymorphedEnter = () => {
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.isPolymorphed = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphed', DURATION.TEXT, 'effect');
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
            const move = Math.random() * 101;
            const dir = Math.random() * 4;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[dir];
            if (move > 25) {
                if (direction === 'up') {
                    this.polymorphVelocity = { x: 0, y: -1.25 };
                } else if (direction === 'down') {
                    this.polymorphVelocity = { x: 0, y: 1.25 };
                } else if (direction === 'right') {
                    this.polymorphVelocity = { x: -1.25, y: 0 };
                } else if (direction === 'left') {
                    this.polymorphVelocity = { x: 1.25, y: 0 };
                };
                this.polymorphMovement = 'move';
            } else {
                this.polymorphVelocity = { x: 0, y: 0 };
                this.polymorphMovement = 'idle';                
            };
            this.polymorphDirection = direction;
        };

        this.polymorphTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                iteration++;
                if (iteration === 5) {
                    iteration = 0;
                    this.isPolymorphed = false;
                } else {   
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, '...thump', 1000, 'effect');
                    this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: 15, id: this.playerID } });
                };
            },
            callbackScope: this,
            repeat: 5,
        }); 

    };
    onPolymorphedUpdate = (_dt) => {
        if (!this.isPolymorphed) this.combatChecker(this.isPolymorphed);
        this.anims.play(`rabbit_${this.polymorphMovement}_${this.polymorphDirection}`, true);
        this.setVelocity(this.polymorphVelocity.x, this.polymorphVelocity.y);
    };
    onPolymorphedExit = () => { 
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        if (this.isPolymorphed) this.isPolymorphed = false;
        this.clearAnimations();
        this.anims.play('player_running', true);
        this.setTint(0x000000);
        this.spriteWeapon.setVisible(true);
        if (this.polymorphTimer) {
            this.polymorphTimer.destroy();
            this.polymorphTimer = undefined;
        };
    };

    onSlowedEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slowed', DURATION.TEXT, 'damage');
        this.slowDuration = DURATION.SLOWED;
        this.setTint(0xFFC700); // 0x888888
        this.adjustSpeed(-PLAYER.SPEED.SLOW);
        this.scene.time.delayedCall(this.slowDuration, () =>{
            this.isSlowed = false;
            this.negMetaMachine.setState(States.CLEAN);
        });
    };

    onSlowedExit = () => {
        this.clearTint();
        this.setTint(0x000000);
        this.adjustSpeed(PLAYER.SPEED.SLOW);
    };

    onSnaredEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snared', DURATION.TEXT, 'damage');
        this.snareDuration = 3000;
        this.setTint(0x0000FF); // 0x888888
        this.adjustSpeed(-PLAYER.SPEED.SNARE);
        this.scene.time.delayedCall(this.snareDuration, () =>{
            this.isSnared = false;
            this.negMetaMachine.setState(States.CLEAN);
        });
    };
    // onSnaredUpdate = (dt) => {};
    onSnaredExit = () => { 
        this.clearTint();
        this.setTint(0x000000);
        this.adjustSpeed(PLAYER.SPEED.SNARE);
    };
};