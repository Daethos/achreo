import { BlendModes, GameObjects, Input, Math as pMath, Physics } from "phaser";
import Entity, { FRAME_COUNT } from "./Entity";  
import { screenShake, sprint, walk } from "../phaser/ScreenShake";
import StateMachine, { States } from "../phaser/StateMachine";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import HealthBar from "../phaser/HealthBar";
import { EventBus } from "../game/EventBus";
import CastingBar from "../phaser/CastingBar";
import { PLAYER } from "../utility/player";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";
import Beam from "../matter/Beam";

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

const ORIGIN = {
    WEAPON: { X: 0.25, Y: 1 },
    SHIELD: { X: -0.2, Y: 0.25 },
    HELMET: { X: 0.5, Y: 1.15 },
    CHEST: { X: 0.5, Y: 0.25 },
    LEGS: { X: 0.5, Y: -0.5 },
};

const MOVEMENT = {
    'up': { x: 0, y: -5 },
    'down': { x: 0, y: 5 },
    'left': { x: -5, y: 0 },
    'right': { x: 5, y: 0 },
};
 
export default class Player extends Entity {
    constructor(data) {
        const { scene } = data;
        super({ ...data, name: 'player', ascean: scene.state.player, health: scene.state.player.health.current }); 
        this.ascean = this.getAscean();
        this.health = this.ascean.health.current;
        this.playerID = this.ascean._id;
        const weapon = this.ascean.weaponOne;
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.currentWeaponSprite = this.assetSprite(weapon);
        this.spriteWeapon = new GameObjects.Sprite(this.scene, 0, 0, this.currentWeaponSprite);
        if (weapon.grip === 'One Hand') {
            this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
            this.swingTimer = 1250
        } else {
            this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
            this.swingTimer = 1650;
        };
        this.spriteWeapon.setOrigin(0.25, 1);
        this.scene.add.existing(this);
        this.scene.add.existing(this.spriteWeapon);
        this.setVisible(true);
        this.spriteWeapon.setAngle(-195);
        this.currentDamageType = weapon?.damageType[0].toLowerCase();
        this.targetIndex = 1;
        this.currentTarget = undefined;
        this.spellTarget = '';
        this.stamina = scene?.state?.playerAttributes?.stamina;
        this.maxStamina = scene?.state?.playerAttributes?.stamina;
        this.grace = scene?.state.playerAttributes?.grace;
        this.maxGrace = scene?.state?.playerAttributes?.grace;
        this.climbCount = 0;
        this.isClimbing = false;
        this.isMoving = false;
        this.targetID = undefined;
        this.attackedTarget = undefined;
        this.triggeredActionAvailable = undefined;
        this.rootCooldown = 0;
        this.snareCooldown = 0;
        this.isStealthing = false;
        this.tshaeralCooldown = 0;
        this.polymorphCooldown = 0;
        this.rollCooldown = 0;
        this.staminaModifier = 0;
        this.strafingLeft = false;
        this.strafingRight = false;
        this.currentShieldSprite = this.assetSprite(this.ascean?.shield);
        this.spriteShield = this.createSprite(this.currentShieldSprite, 0, 0, PLAYER.SCALE.SHIELD, ORIGIN.SHIELD.X, ORIGIN.SHIELD.Y);
        this.playerVelocity = new pMath.Vector2();
        this.speed = this.startingSpeed(scene?.ascean);
        this.acceleration = PLAYER.SPEED.ACCELERATION;
        this.deceleration = PLAYER.SPEED.DECELERATION;
        this.dt = this.scene.sys.game.loop.delta;
        this.stateMachine = new StateMachine(this, 'player');
        this.stateMachine
            .addState(States.NONCOMBAT, { onEnter: this.onNonCombatEnter, onUpdate: this.onNonCombatUpdate, onExit: this.onNonCombatExit })
            .addState(States.COMBAT, { onEnter: this.onCombatEnter, onUpdate: this.onCombatUpdate })
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
            
        this.negativeMachine = new StateMachine(this, 'player');
        this.negativeMachine
            .addState(States.CLEAN, { onEnter: this.onCleanEnter, onExit: this.onCleanExit })
            .addState(States.FROZEN, { onEnter: this.onFrozenEnter, onExit: this.onFrozenExit })
            .addState(States.SLOWED, { onEnter: this.onSlowedEnter, onExit: this.onSlowedExit })
            .addState(States.SNARED, { onEnter: this.onSnaredEnter, onExit: this.onSnaredExit });
        this.positiveMachine.setState(States.CLEAN);
        this.setScale(PLAYER.SCALE.SELF);   
        const { Body, Bodies } = Physics.Matter.Matter;
        let playerCollider = Bodies.rectangle(this.x, this.y + 10, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT, { isSensor: false, label: 'playerCollider' }); // Y + 10 For Platformer
        let playerSensor = Bodies.circle(this.x, this.y + 2, PLAYER.SENSOR.DEFAULT, { isSensor: true, label: 'playerSensor' }); // Y + 2 For Platformer
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.35, 
            restitution: 0.2,  
        });
        this.setExistingBody(compoundBody);                                    
        this.sensor = playerSensor;
        this.weaponHitbox = this.scene.add.circle(this.spriteWeapon.x, this.spriteWeapon.y, 20, 0xfdf6d8, 0).setVisible(true);
        this.scene.add.existing(this.weaponHitbox);
        this.fearCount = 0;
        this.knocking = false;
        this.castingSuccess = false;
        this.isCounterSpelling = false;
        this.isCaerenic = false;
        this.devourTimer = undefined; 
        this.slowDuration = DURATION.SLOWED;
        this.highlight = this.scene.add.graphics()
            .lineStyle(4, 0xFFc700) // 3
            .setScale(0.2) // 35
            .strokeCircle(0, 0, 12) // 10 
            .setDepth(99);
        this.scene.plugins.get('rexGlowFilterPipeline').add(this.highlight, {
            intensity: 0.005, // 005
        });
        this.highlight.setVisible(false);
        this.highlightAnimation = false;

        this.mark = this.scene.add.graphics()
            .lineStyle(4, 0xfdf6d8) // 3
            .setScale(0.5) // 35
            .strokeCircle(0, 0, 12) // 10 
            // .setDepth(99);
        this.mark.setVisible(false);
        this.markAnimation = false;

        // this.hook = new Phaser.Physics.Matter.Sprite(scene.matter.world, this.x, this.y, 'hook_effect').setScale(0.5).setOrigin(0.5, 0.5).setDepth(6).setVisible(false);    
        // this.hook = this.scene.add.graphics()
        //     .lineStyle(4, 0xfdf6d8) // 3
        //     .strokeCircle(0, 0, 12) // 10
        //     .setPosition(this.x, this.y) 
            // .setVisible(false)

        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health, 'player');
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
        this.rushedEnemies = [];
        this.playerStateListener();
        this.setFixedRotation();   
        this.checkEnemyCollision(playerSensor);
        this.checkWorldCollision(playerSensor);
        // this.checkWorldCollider(playerCollider);
        this.beam = new Beam(this);
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                const button = this.scene.smallHud.getButton('info');
                this.scene.smallHud.pressButton(button);
            });
    };   

    getAscean = () => {
        EventBus.once('player-ascean-ready', (ascean) => this.ascean = ascean);
        EventBus.emit('player-ascean');
        return this.ascean;
    };

    speedUpdate = (e) => {
        this.speed = this.startingSpeed(e);
    };

    stealthUpdate = () => {
        if (this.isStealthing) {
            this.isStealthing = false;
        } else {
            this.positiveMachine.setState(States.STEALTH);
        };
    };

    caerenicUpdate = () => {
        this.isCaerenic = this.isCaerenic ? false : true;
        this.scene.sound.play('blink', { volume: this.scene.settings.volume / 3 });
        if (this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, 'weapon');
            this.setGlow(this.spriteShield, true, 'shield'); 
            this.adjustSpeed(PLAYER.SPEED.CAERENIC);
        } else {
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, 'weapon')
            this.setGlow(this.spriteShield, false, 'shield'); 
            this.adjustSpeed(-PLAYER.SPEED.CAERENIC);
        };
    };

    stalwartUpdate = () => {
        this.isStalwart = this.isStalwart ? false : true;
        this.scene.sound.play('stalwart', { volume: this.scene.settings.volume });
        EventBus.emit('stalwart-buttons', this.isStalwart);
    };

    enemyUpdate = (e) => {
        const index = this.targets.findIndex(obj => obj.enemyID === e);
        this.targets = this.targets.filter(obj => obj.enemyID !== e);
        if (this.targets.length > 0) {
            const newTarg = this.targets[index] || this.targets[0];
            if (!newTarg) return;
            this.currentTarget = newTarg;
            this.highlightTarget(this.currentTarget);
            this.scene.setupEnemy(this.currentTarget);
        };
    };

    tabUpdate = (enemy) => {
        const newTarget = this.targets.find(obj => obj.enemyID === enemy.id);
        this.targetIndex = this.targets.findIndex(obj => obj.enemyID === enemy.id);
        if (!newTarget) return;
        if (newTarget.npcType) {
            this.scene.setupNPC(newTarget);
        } else {
            this.attacking = newTarget;
        };
        this.currentTarget = newTarget;
        this.targetID = newTarget.enemyID;
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            this.animateTarget();
            if (this.inCombat && !this.scene.state.computer) {
                this.scene.setupEnemy(this.currentTarget);
            }; 
        } else {
            if (this.highlight.visible) {
                this.removeHighlight();
            };
        };
    };

    createSprite = (imgUrl, x, y, scale, originX, originY) => {
        const sprite = new GameObjects.Sprite(this.scene, x, y, imgUrl);
        sprite.setScale(scale);
        sprite.setOrigin(originX, originY);
        this.scene.add.existing(sprite);
        sprite.setDepth(this);
        return sprite;
    }; 

    cleanUp() {
        EventBus.off('set-player', this.setPlayer);
        EventBus.off('combat', this.constantUpdate);
        EventBus.off('update-combat', this.eventUpdate);
        EventBus.off('disengage', this.disengage);
        EventBus.off('engage', this.engage);
        EventBus.off('speed', this.speedUpdate);
        EventBus.off('update-stealth', this.stealthUpdate);
        EventBus.off('update-caerenic', this.caerenicUpdate);
        EventBus.off('update-stalwart', this.stalwartUpdate);
        EventBus.off('remove-enemy', this.enemyUpdate);
        EventBus.off('tab-target', this.tabUpdate);
        EventBus.off('updated-stamina', this.updateStamina);
    };
    animateMark = () => {
        this.scene.tweens.add({
            targets: this.mark,
            scale: 0.75,
            duration: 250,
            yoyo: true
        });
    };

    animateTarget = () => {
        this.scene.tweens.add({
            targets: this.highlight,
            scale: 0.45,
            duration: 250,
            yoyo: true
        });
    };

    highlightTarget = (sprite) => {
        if (this.highlightAnimation === false) {
            this.highlightAnimation = true;
            this.animateTarget();
        };
        this.highlight.setPosition(sprite.x, sprite.y);
        this.highlight.setVisible(true);
        if (this.scene.target.visible === true) this.scene.target.setPosition(this.scene.targetTarget.x, this.scene.targetTarget.y);
    };

    removeHighlight() {
        this.highlight.setVisible(false);
        this.highlightAnimation = false;
    };

    assetSprite(asset) {
        return asset.imgUrl.split('/')[3].split('.')[0];
    };

    playerStateListener = () => {
        EventBus.on('set-player', this.setPlayer)
        EventBus.on('combat', this.constantUpdate); 
        EventBus.on('update-combat', this.eventUpdate);
        EventBus.on('disengage', this.disengage); 
        EventBus.on('engage', this.engage);
        EventBus.on('speed', this.speedUpdate);
        EventBus.on('update-stealth', this.stealthUpdate);
        EventBus.on('update-caerenic', this.caerenicUpdate);
        EventBus.on('update-stalwart', this.stalwartUpdate);
        EventBus.on('remove-enemy', this.enemyUpdate);
        EventBus.on('tab-target', this.tabUpdate);
        EventBus.on('updated-grace', this.updateGrace);
        EventBus.on('updated-stamina', this.updateStamina);
    }; 

    updateGrace = (percentage) => {
        this.grace = Math.round(this.maxGrace * percentage / 100);
    };

    updateStamina = (percentage) => {
        this.stamina = Math.round(this.maxStamina * percentage / 100);
    };

    setPlayer = (stats) => {
        this.ascean = stats.ascean;
    };

    disengage = () => {
        this.clearAggression();
        this.scene.combatEngaged(false);
        this.inCombat = false;
        this.attacking = undefined;
        this.currentTarget = undefined;
        this.scene.clearNonAggressiveEnemy();
        this.removeHighlight();
    };

    engage = () => {
        this.inCombat = true;
        this.scene.combatEngaged(true);
        const enemy = this.targets.find(obj => obj.enemyID === this.scene.state.enemyID);
        if (enemy) {
            this.currentTarget = enemy;
            this.highlightTarget(enemy);
        };
    };

    clearAggression = () => {
        const enemies = this.scene.enemies;
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].inCombat === true) {
                enemies[i].clearCombatWin();
            };
        };
    };

    clearEnemy = (enemy) => {
        enemy.clearCombatWin();
        this.disengage();
    };

    findEnemy = () => {
        // console.log('%c ----- Attempting To Find Enemy/ -----', 'color: gold');
        if (this.scene.state.newPlayerHealth <= 0) {
            // console.log('%c ----- Player Has 0 Health, Disengaging -----', 'color:red');
            this.disengage();
            return;
        };
        const first = this.scene.state.enemyID;
        if (first === '') {
            // console.log('%c ----- State Does Not Contain Enemy ID ----', 'color: red');
            if (this.targets.length > 0) {
                // console.log('%c No Enemy ID In State, Yes TARGETS, Checking Array For Combat -----', 'color: gold');
                for (let i = 0; i < this.targets.length; i++) {
                    const combat = this.targets[i].inCombat;
                    if (combat === true) {
                        if (this.scene.state.newPlayerHealth <= 0) {
                            // console.log(`%c ----- TARGET In Combat: ${this.targets[i].ascean?.name}, However, Player is at 0 Health. Ejecting Enemy From Combat -----`, 'color: red');
                            this.clearEnemy(this.targets[i]);
                            return;
                        } else {
                            // console.log(`%c ----- TARGET In Combat: ${this.targets[i].ascean?.name}, Becoming Current Target -----`, 'color: green');
                            this.quickTarget(this.targets[i]);
                            return;
                        };
                    };
                };
                // console.log('%c Made it to the other side, no targets but in combat? Flush targets, refindEnemy', 'color: gold');
                this.clearEnemies();
                this.findEnemy();
            } else if (this.touching.length > 0) {
                // console.log('%c No Enemy ID, No Targets, Yes TOUCHING, Checking Array For Combat', 'color: gold');
                for (let i = 0; i < this.touching.length; i++) {
                    const combat = this.touching[i].inCombat;
                    if (combat === true) {
                        console.log(`%c ----- TOUCHING In Combat: ${this.touching[i].ascean?.name}, Becoming Current Target -----`, 'color: green');
                        this.quickTarget(this.touching[i]);
                        return;
                    };
                };
                // console.log('%c No Enemy ID, No Targets, No Touching, Not Sure Why You Are In Combat', 'color: red');
            } else {
                // console.log('%c No Enemy ID, No Targets, No Touching, Not Sure Why You Are In Combat', 'color: red');
            };
        } else {
            const enemy = this.scene.getEnemy(first);
            if (enemy === undefined) {
                // console.log('%c `First` Enemy is UNDEFINED, Not Sure Why You Are In Combat, Disengaging', 'color: red');
                this.disengage();
                return;
            } else {
                // console.log(`%c Found ENEMY: ${enemy.ascean?.name}. Engaging Combat`, 'color: green');
                this.quickTarget(enemy);
            };
        };
    };
    invalidTarget = (id) => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === id);
        if (enemy) {
            return enemy.isDefeated;
        };
        this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Combat Issue: NPC Targeted`, 1000, 'damage');
        return true;
    };
    outOfRange = (range) => {
        const distance = pMath.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > range) {
            this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: -${Math.round(distance - range, 1000, 'damage')}`, 1000, 'damage');
            return true;    
        };
        return false;
    };

    getEnemyId = () => this.scene.state.enemyID || this.attacking?.enemyID || this.currentTarget?.enemyID;

    quickTarget = (enemy) => {
        this.scene.setupEnemy(enemy);
        this.targetID = enemy.enemyID;
        this.setAttacking(enemy);
        this.setCurrentTarget(enemy);
        this.highlightTarget(enemy);
    };

    targetEngagement = (id) => {
        const enemy = this.scene.enemies.find(obj => obj.enemyID === id);
        if (!enemy) return;
        this.targets.push(enemy);
        this.inCombat = true;
        this.scene.combatEngaged(true);
        this.scene.setupEnemy(enemy);
        this.targetID = id;
        this.setAttacking(enemy);
        this.setCurrentTarget(enemy);
        this.highlightTarget(enemy);
    };

    constantUpdate = (e) => {
        this.checkGear(e.player.shield, e.weapons[0], e.playerDamageType.toLowerCase());
    };
    
    eventUpdate = (e) => {
        if (this.health > e.newPlayerHealth) {
            let damage = Math.round(this.health - e.newPlayerHealth);
            damage = e.computerCriticalSuccess === true ? `${damage} (Critical)` : e.computerGlancingBlow === true ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);
            if (this.isConfused) this.isConfused = false;
            if (this.isPolymorphed) this.isPolymorphed = false;
            if (this.reactiveBubble) {
                if (this.isMalicing) this.malice();
                if (this.isMending) this.mend();
                if (this.isRecovering) this.recover();
                if (this.isReining) this.rein();
                if (this.isMenacing) this.menace(this.reactiveTarget);
                if (this.isModerating) this.moderate(this.reactiveTarget);
                if (this.isMultifaring) this.multifarious(this.reactiveTarget);
                if (this.isMystifying) this.mystify(this.reactiveTarget);
            };
            if (this.isFeared) {
                const chance = Math.random() < 0.1 + this.fearCount;
                if (chance) {
                    this.statusCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Fear Broken', PLAYER.DURATIONS.TEXT, 'effect');
                    this.isFeared = false;    
                } else {
                    this.fearCount += 0.1;
                };
            };
        };
        if (this.health < e.newPlayerHealth) {
            let heal = Math.round(e.newPlayerHealth - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, PLAYER.DURATIONS.TEXT, 'heal');
        };
        this.health = e.newPlayerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.playerHealth) this.healthbar.setTotal(e.playerHealth);

        if (this.targets.length > 0) this.checkTargets();
        if (this.currentRound !== e.combatRound && this.scene.combat === true) {
            this.currentRound = e.combatRound;
            if (e.computerDamaged || e.playerDamaged || e.rollSuccess || e.parrySuccess || e.computerRollSuccess || e.computerParrySuccess) {
                this.soundEffects(e);
            };
        };
        if (e.computerParrySuccess === true) {
            this.stateMachine.setState(States.STUN);
            this.scene.combatMachine.input('computerParrySuccess', false);
            this.resistCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Parry', PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);    
        };
        if (e.rollSuccess === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Roll', PLAYER.DURATIONS.TEXT, 'heal', true);
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'dodge');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'roll');
        };
        if (e.parrySuccess === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Parry', PLAYER.DURATIONS.TEXT, 'heal', true);
            this.scene.stunned(e.enemyID);
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'attack');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'dodge');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'parry');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'posture');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'roll');
        };
        if (e.computerRollSuccess === true) {
            this.resistCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Roll', PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);
        };
        if (e.newComputerHealth <= 0 && e.playerWin === true) {
            this.defeatedEnemyCheck(e.enemyID);
        };
        if (e.computerWin === true) {
            this.anims.play('player_pray', true).on('animationcomplete', () => {
                this.anims.play('player_idle', true);
            });
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Defeat', DURATION.TEXT, 'damage');
        };
        if (e.newPlayerHealth <= 0) {
            this.disengage();    
        };
        if (e.playerAttributes.stamina > this.maxStamina) this.maxStamina = e.playerAttributes.stamina;
        if (e.playerAttributes.grace > this.maxGrace) this.maxGrace = e.playerAttributes.grace;
        if (this.inCombat === false) {
            if (this.scene.combat === true) {
                this.scene.combatEngaged(false);
            };
        };
    };

    resist = () => {
        this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Resisted', PLAYER.DURATIONS.TEXT, 'effect');  
    };

    soundEffects(sfx) {
        try {
            const soundEffectMap = (type, weapon) => {
                switch (type) {
                    case 'Spooky':
                        return this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
                    case 'Righteous':
                        return this.scene.sound.play('righteous', { volume: this.scene.settings.volume });
                    case 'Wild':
                        return this.scene.sound.play('wild', { volume: this.scene.settings.volume });
                    case 'Earth':
                        return this.scene.sound.play('earth', { volume: this.scene.settings.volume });
                    case 'Fire':
                        return this.scene.sound.play('fire', { volume: this.scene.settings.volume });
                    case 'Frost':
                        return this.scene.sound.play('frost', { volume: this.scene.settings.volume });
                    case 'Lightning':
                        return this.scene.sound.play('lightning', { volume: this.scene.settings.volume });
                    case 'Sorcery':
                        return this.scene.sound.play('sorcery', { volume: this.scene.settings.volume / 3 });
                    case 'Wind':
                        return this.scene.sound.play('wind', { volume: this.scene.settings.volume });
                    case 'Pierce':
                        return (weapon === 'Bow' || weapon === 'Greatbow') ? this.scene.sound.play('bow', { volume: this.scene.settings.volume }) : this.scene.sound.play('pierce', { volume: this.scene.settings.volume });
                    case 'Slash':
                        return this.scene.sound.play('slash', { volume: this.scene.settings.volume });
                    case 'Blunt':
                        return this.scene.sound.play('blunt', { volume: this.scene.settings.volume });
                };
            };
            if (sfx.computerDamaged === true) {
                const { playerDamageType } = sfx;
                soundEffectMap(playerDamageType, sfx.computerWeapons[0]);                
            };
            if (sfx.playerDamaged === true) {
                const { computerDamageType } = sfx;
                soundEffectMap(computerDamageType, sfx.computerWeapons[0]);
            };
            if (sfx.religiousSuccess === true) {
                this.scene.sound.play('religious', { volume: this.scene.settings.volume });
            };
            if (sfx.rollSuccess === true || sfx.computerRollSuccess === true) {
                this.scene.sound.play('roll', { volume: this.scene.settings.volume });
            };
            if (sfx.parrySuccess === true || sfx.computerParrySuccess === true) {
                this.scene.sound.play('parry', { volume: this.scene.settings.volume });
            };
            EventBus.emit('blend-combat', { 
                computerDamaged: false, playerDamaged: false, glancingBlow: false, computerGlancingBlow: false,
                parrySuccess: false, computerParrySuccess: false, rollSuccess: false, computerRollSuccess: false,
                criticalSuccess: false, computerCriticalSuccess: false, religiousSuccess: false,
            });
        } catch (err) {
            console.warn(err.message, 'Error Setting Sound Effects');
        };
    };

    checkGear = (shield, weapon, damage) => {
        this.currentDamageType = damage;    
        this.hasMagic = this.checkDamageType(damage, 'magic');
        this.checkMeleeOrRanged(weapon);
        if (this.currentWeaponSprite !== this.assetSprite(weapon)) {
            this.currentWeaponSprite = this.assetSprite(weapon);
            this.spriteWeapon.setTexture(this.currentWeaponSprite);
            if (weapon.grip === 'One Hand') {
                this.staminaModifier = 0;
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
            } else {
                this.staminaModifier = 5;
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
            };
        };
        if (this.currentShieldSprite !== this.assetSprite(shield)) {
            this.currentShieldSprite = this.assetSprite(shield);
            this.spriteShield.setTexture(this.currentShieldSprite);
        };
    };

    defeatedEnemyCheck = (id) => {
        this.targets = this.targets.filter(target => {
            const check =(target.enemyID !== id && target.inCombat === false)
            return !check;
        });
        this.sendEnemies(this.targets);
        this.currentTarget = undefined;
        this.attacking = undefined;
        this.removeHighlight();
        this.scene.combatMachine.clear(id);
        if (this.targets.every(obj => obj.inCombat === false)) {
            this.disengage();
        } else {
            const newTarget = this.targets.find(obj => obj.enemyID !== id);
            if (!newTarget) return;
            this.scene.setupEnemy(newTarget);
            this.setAttacking(newTarget);
            this.setCurrentTarget(newTarget);
            this.targetID = newTarget.enemyID;
            this.highlightTarget(newTarget);
        };
        this.checkTargets();
    };

    isPlayerInCombat = () => {
        return this.inCombat && this.scene.combat && this.scene.state.combatEngaged;
    };

    shouldPlayerEnterCombat = (other) => {
        const hasRemainingEnemies = this.scene.combat && this.scene.state.combatEngaged && this.inCombat;
        if (!hasRemainingEnemies && !this.isStealthing && this.scene.state.newPlayerHealth > 0) {
            this.enterCombat(other);
        } else if (this.isStealthing) {
            this.prepareCombat(other);    
        };
    }; 

    enterCombat = (other) => {
        this.scene.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.setAttacking(other.gameObjectB);
        this.setCurrentTarget(other.gameObjectB);
        this.targetID = other.gameObjectB.enemyID;
        this.scene.combatEngaged(true);
        this.highlightTarget(other.gameObjectB);
        this.inCombat = true;
    };

    prepareCombat = (other) => {
        this.scene.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.setAttacking(other.gameObjectB);
        this.setCurrentTarget(other.gameObjectB);
        this.targetID = other.gameObjectB.enemyID;
        this.highlightTarget(other.gameObjectB);
    };

    isAttackTarget = (enemy) => {
        if (this.getEnemyId() === enemy.enemyID) {
            return true;
        };
        return false;
    };

    isNewEnemy = (enemy) => {
        const newEnemy = this.targets.every(obj => obj.enemyID !== enemy.enemyID);
        if (newEnemy) {
            return true;
        };
        return false;
    };

    isValidEnemyCollision(other) {
        return (
            other.gameObjectB &&
            other.bodyB.label === 'enemyCollider' &&
            other.gameObjectB.isAggressive &&
            other.gameObjectB.ascean
        );
    };

    isValidNeutralCollision(other) {
        return (
            other.gameObjectB &&
            other.bodyB.label === 'enemyCollider' &&
            other.gameObjectB.ascean
        );
    };

    isValidRushEnemy = (enemy) => {
        if (this.isRushing) {
            const newEnemy =  this.rushedEnemies.every(obj => obj.enemyID !== enemy.enemyID);
            if (newEnemy) {
                this.rushedEnemies.push(enemy);
            };
        };
    };
 
    checkEnemyCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (this.isValidEnemyCollision(other)) {
                    this.touching.push(other.gameObjectB);
                    this.isValidRushEnemy(other.gameObjectB);
                    const isNewEnemy = this.isNewEnemy(other.gameObjectB);
                    if (!isNewEnemy) return;
                    this.targets.push(other.gameObjectB);
                    this.shouldPlayerEnterCombat(other);
                    this.checkTargets();
                } else if (this.isValidNeutralCollision(other)) {
                    this.touching.push(other.gameObjectB);
                    this.isValidRushEnemy(other.gameObjectB);
                    other.gameObjectB.originPoint = new pMath.Vector2(other.gameObjectB.x, other.gameObjectB.y).clone();
                    const isNewNeutral = this.isNewEnemy(other.gameObjectB);
                    if (!isNewNeutral) return;
                    this.targets.push(other.gameObjectB);
                    this.checkTargets();
                    if (this.inCombat === false) this.scene.setupEnemy(other.gameObjectB);
                };
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideActive({
            objectA: [playerSensor],
            callback: (other) => {
                if (this.isValidEnemyCollision(other)) {
                    this.actionTarget = other;
                    this.isValidRushEnemy(other.gameObjectB);
                    if (!this.attacking) this.attacking = other.gameObjectB;
                    if (!this.currentTarget) this.currentTarget = other.gameObjectB;
                    if (!this.targetID) this.targetID = other.gameObjectB.enemyID;    
                };
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: (other) => {
                this.touching = this.touching.filter(obj => obj?.enemyID !== other?.gameObjectB?.enemyID);
                if (this.isValidEnemyCollision(other) && !this.touching.length) {
                    this.actionAvailable = false;
                    this.triggeredActionAvailable = undefined;
                } else if (this.isValidNeutralCollision(other) && !this.touching.length) {
                    this.actionAvailable = false;
                    this.triggeredActionAvailable = undefined;
                };
                this.checkTargets();
            },
            context: this.scene,
        });
    };
    // checkWorldCollider(playerCollider) {
    //     this.scene.matterCollision.addOnCollideStart({
    //         objectA: [playerCollider],
    //         callback: (other) => {
    //             console.log(other, 'Other in World Collider');
    //             if (other.gameObjectB && other.gameObjectB?.properties?.climb === true) {
    //                 this.climbCount++;
    //                 console.log(`%c Climbing the tile! ${this.climbCount}`, 'color:green');
    //                 this.isClimbing = true;
    //                 EventBus.emit('alert', { 
    //                     header: 'Exit', 
    //                     body: `You are climbing. \n You have encountered a climbing tile!`, 
    //                     delay: 3000, 
    //                     key: 'Close'
    //                 });
    //             };
    //         },
    //         context: this.scene
    //     });
    //     this.scene.matterCollision.addOnCollideEnd({
    //         objectA: [playerCollider],
    //         callback: (other) => {
    //             if (other.gameObjectB && other.gameObjectB?.properties?.climb === true) {
    //                 this.climbCount--;
    //                 console.log(`%c Not touching a tile! ${this.climbCount}`, 'color:red');
    //                 if (this.climbCount <= 0) {
    //                     this.climbCount = 0;
    //                     this.isClimbing = false;
    //                     EventBus.emit('alert', { 
    //                         header: 'Exit', 
    //                         body: `You are not climbing. \n You have finishing climbing it seems!`, 
    //                         delay: 3000, 
    //                         key: 'Close'
    //                     });    
    //                 };
    //             };
    //         },
    //         context: this.scene
    //     });
    // };
    checkWorldCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'duel') {
                    EventBus.emit('alert', { 
                        header: "Dueling Ground", 
                        body: `You have the option of summoning an enemy (${other.gameObjectB?.properties?.key}) to the dueling grounds. \n Would you like the challenge?`, 
                        delay: 3000, 
                        key: "Duel",
                        arg: other.gameObjectB?.properties?.key
                    });
                    // const chance = Math.random();
                    // if (chance >= 0.6) {
                    // } else if (chance >= 0.3) {
                    //     EventBus.emit('alert', { 
                    //         header: "Champion's Tent", 
                    //         body: `You have the option of beckoning two fighters in a duel against you! \n Would you like the challenge?`, 
                    //         delay: 3000, 
                    //         key: "Duel",
                    //         arg: other.gameObjectB?.properties?.key
                    //     });
                    // } else {
                    //     EventBus.emit('alert', { 
                    //         header: "Ascean Tent", 
                    //         body: `You have the option of beckoning three fighters in a duel against you! \n Would you like the challenge?`, 
                    //         delay: 3000, 
                    //         key: "Duel",
                    //         arg: 3
                    //     });
                    // };
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'cave') {
                    EventBus.emit('alert', { 
                        header: 'Cave', 
                        body: `You have encountered a cave! \n Would you like to enter?`, 
                        delay: 3000, 
                        key: 'Enter Cave'
                    });
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'teleport') {
                    switch (other.gameObjectB?.properties?.key) {
                        case 'north':
                            EventBus.emit('alert', { 
                                header: 'North Port', 
                                body: `This is the Northren Port \n Would you like to enter?`, 
                                delay: 3000,
                                key: 'Enter North Port'
                            });
                            break;
                        case 'south':
                            EventBus.emit('alert', { 
                                header: 'South Port', 
                                body: `This is the Southron Port \n Would you like to enter?`, 
                                delay: 3000,
                                key: 'Enter South Port'
                            });
                            break;
                        case 'east':
                            EventBus.emit('alert', { 
                                header: 'East Port', 
                                body: `This is the Eastern Port \n Would you like to enter?`, 
                                delay: 3000,
                                key: 'Enter East Port'
                            });
                            break;
                        case 'west':
                            EventBus.emit('alert', { 
                                header: 'West Port', 
                                body: `This is the Western Port \n Would you like to enter?`, 
                                delay: 3000,
                                key: 'Enter West Port'
                            });
                            break;
                        default: break;
                    };
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'stairs') {
                    EventBus.emit('alert', { 
                        header: 'Exit', 
                        body: `You are at the stairs that lead back to the surface. \n Would you like to exit the cave and head up to the world?`, 
                        delay: 3000, 
                        key: 'Exit Cave'
                    });
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'worldExit') {
                    EventBus.emit('alert', { 
                        header: 'Exit', 
                        body: `You are near the exit. \n Would you like to head back to the world?`, 
                        delay: 3000, 
                        key: 'Exit World'
                    });
                };
            },
            context: this.scene,
        });
    };

    calculateCollisionPoint(other) {
        if (!other) {
            return false;
        };
        const bodyPosition = other.pair.gameObjectB.body.position;
        const offset = Physics.Matter.Matter.Vector.mult(other.pair.collision.normal, other.pair.collision.depth);
        return Physics.Matter.Matter.Vector.add(bodyPosition, offset);
    };
    
    getAttackDirection(collisionPoint) {
        const sensorPosition = this.sensor.position;
        return collisionPoint.x < sensorPosition.x;
    };

    getEnemyDirection = (target) => {
        if (!target) return false;
        const skills = this.scene.state.player.skills;
        const type = this.hasMagic ? this.scene.state.playerDamageType : this.scene.state.weapons[0].type;
        const skill = skills[type];
        const cap = this.scene.state.player.level * 100;
        const skilled = skill / cap >= 0.5;
        if (skilled) {
            return true;
        };
        const direction = target.position.subtract(this.position);
        return direction.x < 0 && this.flipX || direction.x > 0 && !this.flipX;
    };

    getWeaponAnim = () => {
        let anim = '';
        if (this.hasMagic === true) {
            anim = this.currentDamageType;
        } else if (this.hasBow === true) {
            anim = 'arrow';
        } else {
            anim = this.assetSprite(this.scene.state.weapons[0]);
        };
        return anim;
    };

    combatChecker = (state) => {
        if (state) return;
        if (this.inCombat) {
            this.stateMachine.setState(States.COMBAT); 
        } else {
            this.stateMachine.setState(States.NONCOMBAT); 
        };
    };

    onNonCombatEnter = () => {
        this.anims.play('player_idle', true);
        if (this.scene.combatTimer) this.scene.stopCombatTimer();
        if (this.currentRound !== 0) this.currentRound = 0;
    };
    onNonCombatUpdate = (_dt) => {
        if (this.isMoving) this.isMoving = false;
        if (this.inCombat) this.stateMachine.setState(States.COMBAT);
    };
    onNonCombatExit = () => {
        this.anims.stop('player_idle');
    };

    onCombatEnter = () => {};
    onCombatUpdate = (_dt) => { 
        if (!this.inCombat) this.stateMachine.setState(States.NONCOMBAT);  
    }; 

    onAttackEnter = () => {
        if (this.isPosturing || this.isParrying || this.isThrusting) return;
        if (this.isRanged === true && this.inCombat === true) {
            const correct = this.getEnemyDirection(this.currentTarget);
            if (!correct) {
                this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Skill Issue: Look at the Enemy!', 1000, 'damage', false, true);
                return;
            };
        };
        this.isAttacking = true;
        this.swingReset(States.ATTACK, true);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.ATTACK);
    }; 
    onAttackUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'attack');
        };
        this.combatChecker(this.isAttacking);
    }; 
    onAttackExit = () => {if (this.scene.state.action === 'attack') this.scene.combatMachine.input('action', '');};

    onParryEnter = () => {
        this.isParrying = true;    
        this.swingReset(States.PARRY, true);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.PARRY);
        if (this.hasMagic === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Counter Spell', 1000, 'hush');
            this.isCounterSpelling = true;
            this.flickerCarenic(1000); 
            this.scene.time.delayedCall(1000, () => {
                this.isCounterSpelling = false;
            }, undefined, this);
        };
    };
    onParryUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.PARRY_LIVE && !this.isRanged) this.scene.combatMachine.input('action', 'parry');
        if (this.frameCount >= FRAME_COUNT.PARRY_KILL) this.isParrying = false;
        this.combatChecker(this.isParrying);
    };
    onParryExit = () => {if (this.scene.state.action === 'parry') this.scene.combatMachine.input('action', '');};

    onPostureEnter = () => {
        if (this.isAttacking || this.isParrying || this.isThrusting) return;
        if (this.isRanged === true) {
            if (this.isMoving === true) {
                this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Posture Issue: You are Moving', 1000, 'damage', false, true);
                return;
            };
            const correct = this.getEnemyDirection(this.currentTarget);
            if (!correct && this.inCombat === true) {
                this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Skill Issue: Look at the Enemy!', 1000, 'damage', false, true);
                return;
            };
        };
        this.isPosturing = true;
        this.swingReset(States.POSTURE, true);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.POSTURE);
    };
    onPostureUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'posture');
        };
        this.combatChecker(this.isPosturing);
    };
    onPostureExit = () => {if (this.scene.state.action === 'posture') this.scene.combatMachine.input('action', '');};

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
    onDodgeUpdate = (_dt) => this.combatChecker(this.isDodging);
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

    onThrustEnter = () => {
        if (this.isAttacking || this.isParrying || this.isPosturing) return;
        if (this.isRanged === true) {
            const correct = this.getEnemyDirection(this.currentTarget);
            if (!correct && this.inCombat === true) {
                this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Skill Issue: Look at the Enemy!', 1000, 'damage', false, true);
                return;
            };
        };
        this.isThrusting = true;
        this.swingReset(States.THRUST, true);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.THRUST);
    };
    onThrustUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.THRUST_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'thrust');
        };
        this.combatChecker(this.isThrusting);
    };
    onThrustExit = () => {if (this.scene.state.action === 'thrust') this.scene.combatMachine.input('action', '');};

    onFlaskEnter = () => {
        this.isHealing = true;
        this.setStatic(true);
    };
    onFlaskUpdate = (_dt) => this.combatChecker(this.isHealing);
    onFlaskExit = () => {
        this.scene.drinkFlask();
        this.setStatic(false);
    };

    onAchireEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Achire', PLAYER.DURATIONS.ACHIRE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.ACHIRE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
        this.castbar.setVisible(true);  
    };
    onAchireUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.ACHIRE) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onAchireExit = () => {
        if (this.castingSuccess === true) {
            // const anim = this.getWeaponAnim();
            this.particleEffect =  this.scene.particleManager.addEffect('achire', this, 'achire', true);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `Your Achre and Caeren entwine; projecting it through the ${this.scene.state.weapons[0].name}.`
            });
            this.setTimeEvent('achireCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000);
            this.castingSuccess = false;
            this.scene.sound.play('wild', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.ACHIRE);
            screenShake(this.scene, 90);
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); 
    };

    onAstraveEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Astrave', PLAYER.DURATIONS.ASTRAVE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.ASTRAVE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
        this.castbar.setVisible(true);  
        this.isCasting = true;
    };
    onAstraveUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.ASTRAVE) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) {
            this.castbar.update(dt, 'cast');
        };
    };
    onAstraveExit = () => {
        if (this.castingSuccess === true) {
            this.aoe = new AoE(this.scene, 'astrave', 1, false, undefined, true);    
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You unearth the winds and lightning from the land of hush and tendril.`
            });
            this.setTimeEvent('astraveCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000);
            this.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.ASTRAVE);    
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
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
            this.castingSuccess = true;
            this.isArcing = false;
        };
    };
    onArcExit = () => {
        if (this.castingSuccess === true) {
            screenShake(this.scene, 120, 0.005);
            this.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.castingSuccess = false;
            this.scene.useGrace(PLAYER.STAMINA.ARC);
            if (this.touching.length > 0) {
                this.touching.forEach(enemy => {
                    if (enemy.isDefeated === true) return;
                    this.scene.melee(enemy.enemyID, 'arc');
                });
            };
        };
        this.castbar.reset();
        this.setStatic(false);
    };

    onBlinkEnter = () => {
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        if (this.velocity.x > 0) {
            // this.setVelocityX(PLAYER.SPEED.BLINK);
            this.setPosition(Math.min(this.x + PLAYER.SPEED.BLINK, this.scene.map.widthInPixels), this.y);
        } else if (this.velocity.x < 0) {
            // this.setVelocityX(-PLAYER.SPEED.BLINK);
            this.setPosition(Math.max(this.x - PLAYER.SPEED.BLINK, 0), this.y);
        };
        if (this.velocity.y > 0) {
            // this.setVelocityY(PLAYER.SPEED.BLINK);
            this.setPosition(this.x, Math.min(this.y + PLAYER.SPEED.BLINK, this.scene.map.heightInPixels));
        } else if (this.velocity.y < 0) {
            // this.setVelocityY(-PLAYER.SPEED.BLINK);
            this.setPosition(this.x, Math.max(this.y - PLAYER.SPEED.BLINK, 0));
        };
        if (this.moving()) {
            this.scene.useGrace(PLAYER.STAMINA.BLINK);
            screenShake(this.scene);
        };
        this.setTimeEvent('blinkCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);
        this.flickerCarenic(750); 
    };
    onBlinkUpdate = (_dt) => this.combatChecker(false);

    onConfuseEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.CONFUSE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
        this.castbar.setVisible(true);  
    };
    onConfuseUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onConfuseExit = () => {
        if (this.castingSuccess === true) {
            this.scene.confuse(this.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You confuse ${this.scene.state.computer?.name}, and they stumble around in a daze.`
            });
            this.setTimeEvent('confuseCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.castingSuccess = false;
            this.scene.sound.play('death', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.CONFUSE);    
            screenShake(this.scene);
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); 
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
        this.scene.useGrace(PLAYER.STAMINA.CONSUME);
    };

    onDesperationEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'heal');
        this.scene.useGrace(PLAYER.STAMINA.DESPERATION);
        this.flickerCarenic(PLAYER.DURATIONS.HEALING); 
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shrieks like a beacon, and a hush of ${this.scene.state.weapons[0].influences[0]} soothes your body.`
        });
    };
    onDesperationUpdate = (_dt) => this.combatChecker(false);
    onDesperationExit = () => {
        const desperationCooldown = this.inCombat ? PLAYER.COOLDOWNS.LONG : PLAYER.COOLDOWNS.SHORT;
        this.setTimeEvent('desperationCooldown', desperationCooldown);  
        this.scene.combatMachine.action({ data: { key: 'player', value: 50, id: this.playerID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
    };

    onDevourEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget?.enemyID)) return; 
        this.spellTarget = this.currentTarget.enemyID;
        this.isCasting = true;
        this.currentTarget.isConsumed = true;
        this.scene.useGrace(PLAYER.STAMINA.DEVOUR);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.flickerCarenic(2000); 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Devouring', PLAYER.DURATIONS.DEVOUR / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.DEVOUR);
        this.castbar.setTime(PLAYER.DURATIONS.DEVOUR);
        this.beam.startEmitter(this.currentTarget, PLAYER.DURATIONS.DEVOUR);
        this.devourTimer = this.scene.time.addEvent({
            delay: 400,
            callback: () => this.devour(),
            callbackScope: this,
            repeat: 5,
        });
        this.setTimeEvent('devourCooldown', PLAYER.COOLDOWNS.LONG);
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
        if (this.isCasting === true) {
            this.castbar.update(dt, 'channel', 0xA700FF);
        };
    };
    onDevourExit = () => {
        this.castbar.reset(); 
        this.beam.reset();
        this.spellTarget = '';
        this.setStatic(false);
        if (this.devourTimer !== undefined) {
            this.devourTimer.remove(false);
            this.devourTimer = undefined;
        };
    };
    devour = () => {
        if (this.isCasting === false || this.scene.state.playerWin === true || this.scene.state.newComputerHealth <= 0) {
            this.isCasting = false;
            this.devourTimer.remove(false);
            this.devourTimer = undefined;
            return;
        };
        if (this.spellTarget === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Tshaeral', data: 4 });
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.spellTarget);
            const drained = Math.round(this.scene.state.playerHealth * 0.04 * (this.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            const newPlayerHealth = drained / this.scene.state.playerHealth * 100;
            const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
            const playerActionDescription = `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: newPlayerHealth, id: this.playerID } });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newHealth, id: this.spellTarget } });
        };
    };

    onFearingEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget?.enemyID)) return;
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
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onFearingExit = () => {
        if (this.castingSuccess === true) {
            this.scene.fear(this.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You strike fear into ${this.scene.state.computer?.name}!`
            });
            this.setTimeEvent('fearCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.FEAR);    
            screenShake(this.scene);
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);  
    };

    onFyerusEnter = () => {
        this.isCasting = true;
        if (this.isMoving === true) this.isCasting = false;
        if (this.isCasting === false) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Fyerus', PLAYER.DURATIONS.FYERUS / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FYERUS);
        this.castbar.setTime(PLAYER.DURATIONS.FYERUS);
        this.castbar.setVisible(true);  
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);  
        this.aoe = new AoE(this.scene, 'fyerus', 6, false, undefined, true);    
        this.scene.useGrace(PLAYER.STAMINA.FYERUS);    
        this.setTimeEvent('fyerusCooldown', 2000);
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
        if (this.aoe) this.aoe.cleanAnimation(this.scene);
        this.castbar.reset();
        this.isCasting = false;
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
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
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast', 0x00C200);
    };
    onHealingExit = () => {
        if (this.castingSuccess === true) {
            this.setTimeEvent('healingCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.scene.useGrace(PLAYER.STAMINA.HEALING);
            this.castingSuccess = false;
            this.scene.combatMachine.action({ data: { key: 'player', value: 25, id: this.playerID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onIlirechEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget?.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Ilirech', PLAYER.DURATIONS.ILIRECH / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.ILIRECH);
        this.beam.startEmitter(this.currentTarget, PLAYER.DURATIONS.MAIERETH);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
        this.castbar.setVisible(true);  
    };
    onIlirechUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.ILIRECH) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onIlirechExit = () => {
        if (this.castingSuccess === true) {
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You rip into this world with Ilian tendrils entwining.`
            });
            this.chiomism(this.spellTarget, 15);
            this.setTimeEvent('ilirechCooldown', PLAYER.COOLDOWNS.MODERATE);
            this.castingSuccess = false;
            this.scene.sound.play('fire', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.ILIRECH);    
            screenShake(this.scene, 90);
        };
        this.castbar.reset();
        this.beam.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); 
    };

    chiomism = (id, val) => {
        if (id === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Chiomic', data: val }); 
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.spellTarget);
            const chiomic = Math.round(this.scene.state.playerHealth * (val / 100) * (this.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your hush flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.spellTarget } });
        };
    };

    onInvokeEnter = () => {
        if (this.currentTarget === undefined || this.invalidTarget(this.currentTarget?.enemyID)) return;
        this.isPraying = true;
        this.setStatic(true);
        this.flickerCarenic(1000); 
        this.invokeCooldown = 30;
        if (this.playerBlessing === '' || this.playerBlessing !== this.scene.state.playerBlessing) {
            this.playerBlessing = this.scene.state.playerBlessing;
        };
    };
    onInvokeUpdate = (_dt) => this.combatChecker(this.isPraying);
    onInvokeExit = () => {
        this.setStatic(false);
        if (!this.currentTarget || this.currentTarget.isDefeated) return;
        this.setTimeEvent('invokeCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.combatMachine.action({ type: 'Instant', data: this.scene.state.playerBlessing });
        this.scene.sound.play('prayer', { volume: this.scene.settings.volume });
        this.scene.useGrace(PLAYER.STAMINA.INVOKE);
    };

    onKynisosEnter = () => { 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Kynisos', PLAYER.DURATIONS.KYNISOS / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.KYNISOS);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
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
            this.setTimeEvent('kynisosCooldown', 4000);
            this.kynisosSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.KYNISOS);    
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onKyrnaicismEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget?.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.isCasting = true;
        this.scene.useGrace(PLAYER.STAMINA.KYRNAICISM);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.flickerCarenic(3000); 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.currentTarget.isConsumed = true;
        this.beam.startEmitter(this.currentTarget, PLAYER.DURATIONS.KYRNAICISM);
        this.scene.slow(this.spellTarget, 1000);
        this.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.kyrnaicism(),
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
        this.beam.reset();
        this.spellTarget = '';
        this.setStatic(false);
        if (this.chiomicTimer) {
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
        }; 
    };
    kyrnaicism = () => {
        if (!this.isCasting || this.scene.state.playerWin || this.scene.state.newComputerHealth <= 0) {
            this.isCasting = false;
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
            return;
        };
        this.scene.slow(this.spellTarget, 975);
        if (this.spellTarget === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Chiomic', data: 7.5 }); 
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.spellTarget);
            const chiomic = Math.round(this.scene.state.playerHealth * 0.075 * (this.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            const newComputerHealth = enemy.health - chiomic < 0 ? 0 : enemy.health - chiomic;
            const playerActionDescription = `Your hush flays ${chiomic} health from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newComputerHealth, id: this.spellTarget } });
        };
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
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
                this.scene.useGrace(PLAYER.STAMINA.LEAP);
                this.isLeaping = false; 
                if (this.touching.length > 0) {
                    this.touching.forEach(enemy => {
                        this.scene.melee(enemy.enemyID, 'leap');
                    });
                };
            },
        });       
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You launch yourself through the air!`
        });
        screenShake(this.scene, 120, 0.005);
    };
    onLeapUpdate = (_dt) => this.combatChecker(this.isLeaping);
    onLeapExit = () => {
        const leapCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('leapCooldown', leapCooldown);
    };

    onMaierethEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Maiereth', 750, 'effect');
        this.castbar.setTotal(PLAYER.DURATIONS.MAIERETH);
        this.beam.startEmitter(this.currentTarget, PLAYER.DURATIONS.MAIERETH);                          
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
        this.castbar.setVisible(true);  
    };
    onMaierethUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.MAIERETH) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onMaierethExit = () => {
        if (this.castingSuccess === true) {
            this.sacrifice(this.spellTarget, 30);
            const chance = Phaser.Math.Between(1, 100);
            if (chance > 75) {
                this.scene.fear(this.spellTarget);
            };
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You bleed and strike ${this.scene.state.computer?.name} with tendrils of Ma'anre.`
            });
            this.setTimeEvent('maierethCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.castingSuccess = false;
            this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.MAIERETH);    
            screenShake(this.scene, 90);
        };
        this.spellTarget = '';
        this.castbar.reset();
        this.beam.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);  
    };

    onHookEnter = () => {
        this.particleEffect = this.scene.particleManager.addEffect('hook', this, 'hook', true);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hook', DURATION.TEXT, 'damage', false, true);
        this.scene.sound.play('dungeon', { volume: this.scene.settings.volume });
        this.flickerCarenic(750);
        this.setTimeEvent('hookCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
        this.scene.useGrace(PLAYER.STAMINA.HOOK);
        this.beam.startEmitter(this.particleEffect.effect, 1500);
        this.hookTime = 0;
    };
    onHookUpdate = (dt) => {
        this.hookTime += dt;
        if (this.hookTime >= 1250 || !this.particleEffect?.effect) {
            this.combatChecker(false);
        };
    };
    onHookExit = () => {
        this.beam.reset();
    };

    onMarkEnter = () => {
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(false);
            this.scene.rightJoystick.joystick.setVisible(false);
            this.scene.actionBar.setVisible(false);
        };
        this.setStatic(true);
        this.isPraying = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Marking', DURATION.TEXT, 'effect', false, true);
        this.flickerCarenic(1000);
    };
    onMarkUpdate = (_dt) => this.combatChecker(this.isPraying);
    onMarkExit = () => {
        if (this.scene.settings.desktop === false) {  
            this.scene.joystick.joystick.setVisible(true);
            this.scene.rightJoystick.joystick.setVisible(true);
            this.scene.actionBar.setVisible(true);
        };
        this.mark.setPosition(this.x, this.y + 24);
        this.mark.setVisible(true);
        this.animateMark();
        this.animateMark();
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
        this.setTimeEvent('markCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.useGrace(PLAYER.STAMINA.MARK);
        this.setStatic(false);
    };

    onNetherswapEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget?.enemyID)) return; 
        this.setStatic(true);
        this.isPraying = true;
        this.isNetherswapping = true;
        this.netherswapTarget = this.currentTarget;
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(false);
            this.scene.rightJoystick.joystick.setVisible(false);
            this.scene.actionBar.setVisible(false);
        };
        this.flickerCarenic(1000);
    };
    onNetherswapUpdate = (_dt) => this.combatChecker(this.isPraying);
    onNetherswapExit = () => {
        if (this.isNetherswapping === false) return;
        this.isNetherswapping = false;
        if (this.scene.settings.desktop === false) {  
            this.scene.joystick.joystick.setVisible(true);
            this.scene.rightJoystick.joystick.setVisible(true);
            this.scene.actionBar.setVisible(true);
        };
        this.setStatic(false);
        if (this.netherswapTarget === undefined) return; 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Netherswap', DURATION.TEXT / 2, 'effect', false, true);
        const player = new Phaser.Math.Vector2(this.x, this.y);
        const enemy = new Phaser.Math.Vector2(this.netherswapTarget.x, this.netherswapTarget.y);
        this.setPosition(enemy.x, enemy.y);
        this.netherswapTarget.setPosition(player.x, player.y);
        this.netherswapTarget = undefined;
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.setTimeEvent('netherswapCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.useGrace(PLAYER.STAMINA.NETHERSWAP);
    };

    onRecallEnter = () => {
        this.setStatic(true);
        this.isPraying = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Recalling', DURATION.TEXT, 'effect', false, true);
        this.flickerCarenic(1000);
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(false);
            this.scene.rightJoystick.joystick.setVisible(false);
            this.scene.actionBar.setVisible(false);
        };
        this.setTimeEvent('recallCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.useGrace(PLAYER.STAMINA.RECALL);
    };
    onRecallUpdate = (_dt) => this.combatChecker(this.isPraying);
    onRecallExit = () => {
        if (this.scene.settings.desktop === false) {  
            this.scene.joystick.joystick.setVisible(true);
            this.scene.rightJoystick.joystick.setVisible(true);
            this.scene.actionBar.setVisible(true);
        };
        this.setPosition(this.mark.x, this.mark.y - 24);
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
        this.animateMark();
        this.setStatic(false);
    };

    onParalyzeEnter = () => { 
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.LONG) || this.invalidTarget(this.currentTarget?.enemyID)) return;
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
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onParalyzeExit = () => {
        if (this.castingSuccess === true) {
            this.scene.paralyze(this.spellTarget);
            this.setTimeEvent('paralyzeCooldown', PLAYER.COOLDOWNS.MODERATE);  
            this.scene.useGrace(PLAYER.STAMINA.PARALYZE);
            this.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });        
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You paralyze ${this.scene.state.computer?.name} for several seconds!`
            });
            screenShake(this.scene);
        };
        this.spellTarget = '';
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); 
    };

    onPolymorphingEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget?.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.POLYMORPH);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);  
    };
    onPolymorphingUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onPolymorphingExit = () => {
        if (this.castingSuccess === true) {
            this.scene.polymorph(this.spellTarget);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, polymorphing them!`
            });
            this.setTimeEvent('polymorphCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.scene.useGrace(PLAYER.STAMINA.POLYMORPH);
            this.castingSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });        
            this.spellTarget = '';
            screenShake(this.scene);
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

        this.scene.useGrace(PLAYER.STAMINA.PURSUIT);
        const pursuitCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('pursuitCooldown', pursuitCooldown);
        this.flickerCarenic(750); 
    };
    onPursuitUpdate = (_dt) => this.combatChecker(this.isPursuing);
    onPursuitExit = () => {
        if (!this.inCombat && !this.isStealthing && !this.isShimmering) {
            const button = this.scene.smallHud.stances.find(b => b.texture.key === 'stealth');
            this.scene.smallHud.pressStance(button);
        };
    };

    onQuorEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Quor', PLAYER.DURATIONS.QUOR / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.QUOR);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
        this.castbar.setVisible(true);  
    };
    onQuorUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.QUOR) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onQuorExit = () => {
        if (this.castingSuccess === true) {
            this.particleEffect =  this.scene.particleManager.addEffect('quor', this, 'quor', true);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `Your Achre is imbued with instantiation, its Quor auguring it through the ${this.scene.state.weapons[0].name}.`
            });
            this.setTimeEvent('quorCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000);
            this.castingSuccess = false;
            this.scene.sound.play('freeze', { volume: this.scene.settings.volume });
            this.scene.useGrace(PLAYER.STAMINA.QUOR);    
            screenShake(this.scene, 180, 0.006);
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); 
    };

    onReconstituteEnter = () => {
        this.isCasting = true;
        this.scene.useGrace(PLAYER.STAMINA.RECONSTITUTE);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Reconstitute', PLAYER.DURATIONS.RECONSTITUTE / 2, 'heal');
        this.castbar.setTotal(PLAYER.DURATIONS.RECONSTITUTE);
        this.castbar.setTime(PLAYER.DURATIONS.RECONSTITUTE);
        this.beam.startEmitter(this, PLAYER.DURATIONS.RECONSTITUTE);
        this.reconTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.reconstitute(),
            callbackScope: this,
            repeat: 5,
        });
        this.setTimeEvent('reconstituteCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.addEvent({
            delay: 5000,
            callback: () => this.isCasting = false,
            callbackScope: this,
            loop: false,
        });
        this.castbar.setVisible(true);  
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); 
    };
    onReconstituteUpdate = (dt) => {
        if (this.isMoving) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.isCasting) this.castbar.update(dt, 'channel', 0x00FF00);
    };
    onReconstituteExit = () => {
        this.castbar.reset();
        this.beam.reset();
        if (this.reconTimer) {
            this.reconTimer.remove(false);
            this.reconTimer = undefined;
        }; 
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); 
    };
    reconstitute = () => {
        if (!this.isCasting) {
            this.isCasting = false;
            this.reconTimer.remove(false);
            this.reconTimer = undefined;
            return;
        };
        this.scene.combatMachine.action({ data: { key: 'player', value: 15, id: this.playerID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
    };

    onRootingEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.LONG) || this.invalidTarget(this.currentTarget.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.isCasting = true;
        this.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Rooting', PLAYER.DURATIONS.ROOTING / 2, 'cast');
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);
        this.beam.startEmitter(this.currentTarget, PLAYER.DURATIONS.ROOTING);
    };
    onRootingUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.ROOTING) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onRootingExit = () => { 
        if (this.castingSuccess === true) {
            this.castingSuccess = false;
            this.scene.root(this.spellTarget);
            this.setTimeEvent('rootCooldown', PLAYER.COOLDOWNS.SHORT); 
            this.scene.useGrace(PLAYER.STAMINA.ROOT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, rooting them!`
            });
        };
        this.spellTarget = '';
        this.castbar.reset();
        this.beam.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
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
            x: this.x + (direction.x * 300),
            y: this.y + (direction.y * 300),
            duration: 600,
            ease: 'Circ.easeOut',
            onStart: () => {
                screenShake(this.scene);
                this.flickerCarenic(600);  
            },
            onComplete: () => {
                if (this.rushedEnemies.length > 0) {
                    this.rushedEnemies.forEach(enemy => {
                        this.scene.melee(enemy.enemyID, 'rush');
                    });
                };
                this.isRushing = false;
            },
        });         
    };
    onRushUpdate = (_dt) => this.combatChecker(this.isRushing);
    onRushExit = () => {
        this.rushedEnemies = [];
        const rushCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('rushCooldown', rushCooldown);
        this.scene.useGrace(PLAYER.STAMINA.RUSH);
    };

    onSlowEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.LONG) || this.invalidTarget(this.currentTarget.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.isSlowing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slow', 750, 'cast');
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.slow(this.spellTarget, 3000);
        this.scene.useGrace(PLAYER.STAMINA.SLOW);
        this.setTimeEvent('slowCooldown', PLAYER.COOLDOWNS.SHORT); 
        this.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => this.isSlowing = false, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, slowing them!`
        });
        screenShake(this.scene);
    };
    onSlowUpdate = (_dt) => this.combatChecker(this.isSlowing);
    onSlowExit = () => this.spellTarget = '';

    onSacrificeEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.isSacrificing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Sacrifice', 750, 'effect');
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.scene.useGrace(PLAYER.STAMINA.SACRIFICE);
        // this.scene.combatMachine.action({ type: 'Sacrifice', data: 10 });
        this.sacrifice(this.spellTarget, 10);
        this.setTimeEvent('sacrificeCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.flickerCarenic(500);  
        this.scene.time.delayedCall(500, () => this.isSacrificing = false, undefined, this);
    };
    onSacrificeUpdate = (_dt) => this.combatChecker(this.isSacrificing);
    onSacrificeExit = () => this.spellTarget = '';

    sacrifice = (id, val) => {
        if (id === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Sacrifice', data: val });
            this.currentTarget.flickerCarenic(750);
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.spellTarget);
            const sacrifice = Math.round(this.scene.state?.player?.[this.scene.state.player?.mastery] * (1 + data / 100)* (this.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10));
            let playerSacrifice = this.scene.state.newPlayerHealth - (sacrifice / 2 * (this.isStalwart ? 0.85 : 1)) < 0 ? 0 : this.scene.state.newPlayerHealth - (sacrifice / 2 * (this.isStalwart ? 0.85 : 1));
            let enemySacrifice = enemy.health - sacrifice < 0 ? 0 : enemy.health - sacrifice;
            const playerActionDescription = `You sacrifice ${sacrifice / 2 * (this.isStalwart ? 0.85 : 1)} health to rip ${sacrifice} from ${enemy.ascean?.name}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatMachine.action({ type: 'Set Health', data: { key: 'player', value: playerSacrifice, id: this.playerID } });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: enemySacrifice, id: this.spellTarget } });
            enemy.flickerCarenic(750);    
        };
    };

    onSnaringEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.LONG) || this.invalidTarget(this.currentTarget.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snaring', PLAYER.DURATIONS.SNARE, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.SNARE);
        this.beam.startEmitter(this.currentTarget, PLAYER.DURATIONS.SNARE);
        this.isCasting = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true); 
    };
    onSnaringUpdate = (dt) => {
        if (this.isMoving === true) this.isCasting = false;
        this.combatChecker(this.isCasting);
        if (this.castbar.time >= PLAYER.DURATIONS.SNARE) {
            this.castingSuccess = true;
            this.isCasting = false;
        };
        if (this.isCasting === true) this.castbar.update(dt, 'cast');
    };
    onSnaringExit = () => {
        if (this.castingSuccess === true) {
            this.setTimeEvent('snareCooldown', PLAYER.DURATIONS.SHORT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, snaring them!`
            });
            this.scene.useGrace(PLAYER.STAMINA.SNARE);
            this.scene.snare(this.spellTarget);
            this.castingSuccess = false;
            this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
            screenShake(this.scene);
        };
        this.spellTarget = '';
        this.castbar.reset();
        this.beam.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onStormEnter = () => {
        this.isStorming = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Storming', 800, 'damage'); 
        this.isAttacking = true;
        this.scene.useGrace(PLAYER.STAMINA.STORM);
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 800,
            onStart: () => this.flickerCarenic(3200),
            onLoop: () => {
                this.isAttacking = true;
                screenShake(this.scene);
                this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Storming', 800, 'damage');
                if (this.touching.length > 0) {
                    this.touching.forEach(enemy => {
                        if (enemy.isDefeated === true) return;
                        this.scene.melee(enemy.enemyID, 'storm');
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
        screenShake(this.scene);
    };
    onStormUpdate = (_dt) => this.combatChecker(this.isStorming);
    onStormExit = () => this.setTimeEvent('stormCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);

    onSutureEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget.enemyID)) return;
        this.spellTarget = this.currentTarget.enemyID;
        this.isSuturing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Suture', 750, 'effect');
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.useGrace(PLAYER.STAMINA.SUTURE);
        this.suture(this.spellTarget, 10);
        this.setTimeEvent('sutureCooldown', PLAYER.COOLDOWNS.MODERATE);
        
        this.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => {
            this.isSuturing = false;
        }, undefined, this);
        
    };
    onSutureUpdate = (_dt) => this.combatChecker(this.isSuturing);
    onSutureExit = () => this.spellTarget = '';

    suture = (id, val) => {
        if (id === this.getEnemyId()) {
            this.scene.combatMachine.action({ type: 'Suture', data: val });
            this.currentTarget.flickerCarenic(750);
        } else {
            const enemy = this.scene.enemies.find(e => e.enemyID === this.spellTarget);
            const suture = Math.round(this.scene.state?.player?.[this.scene.state.player?.mastery] / 2 * (this.isCaerenic ? 1.15 : 1) * ((this.scene.state.player?.level + 9) / 10)) * (1 * val / 100);
            let playerSuture = this.scene.state.newPlayerHealth + suture > this.scene.state.playerHealth ? this.scene.state.playerHealth : this.scene.state.newPlayerHealth + suture;
            let enemySuture = enemy.health - suture < 0 ? 0 : enemy.health - suture;                    
            const playerActionDescription = `Your tendrils suture ${enemy.ascean?.name}'s caeren into you, absorbing ${suture}.`;
            EventBus.emit('add-combat-logs', { ...this.scene.state, playerActionDescription });
            this.scene.combatMachine.action({ type: 'Set Health', data: { key: 'player', value: playerSuture, id: this.playerID } });
            this.scene.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: enemySuture, id: this.spellTarget } });
            enemy.flickerCarenic(750)    
        };
    };

    // ================= META MACHINE STATES ================= \\
    onCleanEnter = () => {};
    onCleanExit = () => {};

    onAbsorbEnter = () => {
        this.isAbsorbing = true;
        this.reactiveName = States.ABSORB;
        this.scene.useGrace(PLAYER.STAMINA.ABSORB);    
        this.scene.sound.play(States.ABSORB, { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Absorbing', 750, 'effect');
        this.absorbBubble = new Bubble(this.scene, this.x, this.y, 'aqua', PLAYER.DURATIONS.ABSORB);
        this.setTimeEvent('absorbCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ABSORB, () => {
            this.isAbsorbing = false;    
            if (this.absorbBubble) {
                this.absorbBubble.destroy();
                this.absorbBubble = undefined;
                if (this.reactiveName === States.ABSORB) this.reactiveName = '';
            };    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You warp oncoming damage into grace.`
        });
    };
    onAbsorbUpdate = (_dt) => {if (!this.isAbsorbing) this.positiveMachine.setState(States.CLEAN);};

    absorb = () => {
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Abosrbed', 500, 'effect');
        this.scene.useGrace(-25);
    };

    onChiomicEnter = () => {
        this.scene.useGrace(PLAYER.STAMINA.CHIOMIC);    
        this.aoe = new AoE(this.scene, 'chiomic', 1);    
        this.scene.sound.play('death', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect');
        this.isChiomic = true;
        this.setTimeEvent('chiomicCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
            this.isChiomic = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You mock and confuse your surrounding foes.`
        });
    };
    onChiomicUpdate = (_dt) => {if (this.isChiomic === false) this.positiveMachine.setState(States.CLEAN);};

    onDiseaseEnter = () => {
        this.isDiseasing = true;
        this.scene.useGrace(PLAYER.STAMINA.DISEASE);    
        this.aoe = new AoE(this.scene, 'tendril', 6);    
        this.scene.sound.play('dungeon', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Tendrils Swirl', 750, 'tendril');
        this.setTimeEvent('diseaseCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
            this.isDiseasing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You swirl such sweet tendrils which wrap round and reach to writhe.`
        });
    };
    onDiseaseUpdate = (_dt) => {if (this.isDiseasing === false) this.positiveMachine.setState(States.CLEAN);};
    onDiseaseExit = () => this.aoe.cleanAnimation(this.scene);

    onHowlEnter = () => {
        this.scene.useGrace(PLAYER.STAMINA.HOWL);    
        this.aoe = new AoE(this.scene, 'howl', 1);    
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Howling', PLAYER.DURATIONS.HOWL, 'damage');
        this.isHowling = true;
        this.setTimeEvent('howlCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
            this.isHowling = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You howl, it's otherworldly nature stunning nearby foes.`
        });
    };
    onHowlUpdate = (_dt) => {if (this.isHowling === false) this.positiveMachine.setState(States.CLEAN);};
    onHowlExit = () => this.aoe.cleanAnimation(this.scene);

    onEnvelopEnter = () => {
        this.isEnveloping = true;
        this.scene.useGrace(PLAYER.STAMINA.ENVELOP);    
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Enveloping', 750, 'cast');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'blue', PLAYER.DURATIONS.ENVELOP);
        this.reactiveName = 'envelop';
        this.setTimeEvent('envelopCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
            this.isEnveloping = false;    
            if (this.reactiveBubble !== undefined && this.reactiveName === States.ENVELOP) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You envelop yourself, shirking oncoming attacks.`
        });
    };
    onEnvelopUpdate = (_dt) => {if (!this.isEnveloping) this.positiveMachine.setState(States.CLEAN);};

    envelop = () => {
        if (this.reactiveBubble === undefined || this.isEnveloping === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
            };
            this.isEnveloping = false;
            return;
        };
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Enveloped', 500, 'effect');
        if (this.grace - 40 <= 0) {
            this.isEnveloping = false;
        };
        this.scene.useGrace(40);
    };

    onFreezeEnter = () => {
        this.aoe = new AoE(this.scene, 'freeze', 1);
        this.scene.sound.play('freeze', { volume: this.scene.settings.volume });
        this.scene.useGrace(PLAYER.STAMINA.FREEZE);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Freezing', PLAYER.DURATIONS.FREEZE, 'cast');
        this.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
            this.isFreezing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You freeze nearby foes.`
        });
    };
    onFreezeUpdate = (_dt) => {if (!this.isFreezing) this.positiveMachine.setState(States.CLEAN);};
    onFreezeExit = () => this.setTimeEvent('freezeCooldown', PLAYER.COOLDOWNS.SHORT);

    onMaliceEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MALICE;
        this.scene.useGrace(PLAYER.STAMINA.MALICE);    
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.isMalicing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MALICE);
        this.setTimeEvent('maliceCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
            this.isMalicing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MALICE) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You wrack malicious foes with the hush of their own attack.`
        });
    };
    onMaliceUpdate = (_dt) => {if (!this.isMalicing) this.positiveMachine.setState(States.CLEAN);};

    malice = () => {
        if (this.reactiveBubble === undefined || this.isMalicing === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
            };
            this.isMalicing = false;
            return;
        };
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Malice', 750, 'hush');
        this.scene.combatMachine.action({ data: 10, type: 'Chiomic' });
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isMalicing = false;
        };
    };

    onMendEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MEND;
        this.scene.useGrace(PLAYER.STAMINA.MEND);    
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.isMending = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 750, 'tendril');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'purple', PLAYER.DURATIONS.MEND);
        this.setTimeEvent('mendCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
            this.isMending = false;    
            if (this.reactiveBubble && this.reactiveName === States.MEND) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to mend oncoming attacks.`
        });
    };
    onMendUpdate = (_dt) => {if (!this.isMending) this.positiveMachine.setState(States.CLEAN);};

    mend = () => {
        if (this.reactiveBubble === undefined || this.isMending === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
            };
            this.isMending = false;
            return;
        };
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 500, 'tendril');
        this.scene.combatMachine.action({ data: { key: 'player', value: 20, id: this.playerID }, type: 'Health' });
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isMending = false;
        };
    };

    onMenaceEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MENACE;
        this.scene.useGrace(PLAYER.STAMINA.MENACE);    
        this.scene.sound.play('scream', { volume: this.scene.settings.volume });
        this.isMenacing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Menacing', 750, 'tendril');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'dread', PLAYER.DURATIONS.MENACE);
        this.setTimeEvent('menaceCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MENACE, () => {
            this.isMenacing = false;    
            if (this.reactiveBubble && this.reactiveName === States.MENACE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to menace oncoming attacks.`
        });
    };
    onMenaceUpdate = (_dt) => {if (!this.isMenacing) this.positiveMachine.setState(States.CLEAN);};

    menace = (id) => {
        if (id === '') return;
        if (this.reactiveBubble === undefined || this.isMenacing === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMenacing = false;
            return;
        };
        this.scene.fear(id);
        this.scene.sound.play('caerenic', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 500, 'tendril');
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMenacing = false;
        };
    };

    onModerateEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MODERATE;
        this.scene.useGrace(PLAYER.STAMINA.MODERATE);    
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.isModerating = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Moderating', 750, 'cast');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'sapphire', PLAYER.DURATIONS.MODERATE);
        this.setTimeEvent('moderateCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MODERATE, () => {
            this.isModerating = false;    
            if (this.reactiveBubble && this.reactiveName === States.MODERATE) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to moderate oncoming attacks.`
        });
    };
    onModerateUpdate = (_dt) => {if (!this.isModerating) this.positiveMachine.setState(States.CLEAN);};

    moderate = (id) => {
        if (id === '') return;
        if (this.reactiveBubble === undefined || this.isModerating === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isModerating = false;
            return;
        };
        this.scene.slow(id);
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mending', 500, 'tendril');
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isModerating = false;
        };
    };

    onMultifariousEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MULTIFARIOUS;
        this.scene.useGrace(PLAYER.STAMINA.MULTIFARIOUS);    
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.isMultifaring = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Moderating', 750, 'cast');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'ultramarine', PLAYER.DURATIONS.MULTIFARIOUS);
        this.setTimeEvent('multifariousCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MULTIFARIOUS, () => {
            this.isMultifaring = false;    
            if (this.reactiveBubble && this.reactiveName === States.MULTIFARIOUS) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to multifare oncoming attacks.`
        });
    };
    onMultifariousUpdate = (_dt) => {if (!this.isMultifaring) this.positiveMachine.setState(States.CLEAN);};

    multifarious = (id) => {
        if (id === '') return;
        if (this.reactiveBubble === undefined || this.isMultifaring === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMultifaring = false;
            return;
        };
        this.scene.polymorph(id);
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Multifarious', 500, 'cast');
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMultifaring = false;
        };
    };

    onMystifyEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.reactiveName = States.MYSTIFY;
        this.scene.useGrace(PLAYER.STAMINA.MYSTIFY);    
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.isMystifying = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mystifying', 750, 'effect');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'chartreuse', PLAYER.DURATIONS.MYSTIFY);
        this.setTimeEvent('mystifyCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.MYSTIFY, () => {
            this.isMystifying = false;    
            if (this.reactiveBubble && this.reactiveName === States.MYSTIFY) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                this.reactiveName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You seek to mystify enemies when struck.`
        });
    };
    onMystifyUpdate = (_dt) => {if (!this.isMystifying) this.positiveMachine.setState(States.CLEAN);};

    mystify = (id) => {
        if (id === '') return;
        if (this.reactiveBubble === undefined || this.isMystifying === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMystifying = false;
            return;
        };
        this.scene.confuse(id);
        this.scene.sound.play('death', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Mystifying', 500, 'effect');
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMystifying = false;
        };
    };

    onProtectEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.isProtecting = true;
        this.scene.useGrace(PLAYER.STAMINA.PROTECT);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Protecting', 750, 'effect');
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'gold', PLAYER.DURATIONS.PROTECT);
        this.setTimeEvent('protectCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
            this.isProtecting = false;    
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You protect yourself from oncoming attacks.`
        });
    };
    onProtectUpdate = (_dt) => {if (!this.isProtecting) this.positiveMachine.setState(States.CLEAN);};

    onRecoverEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.isRecovering = true;
        this.scene.useGrace(PLAYER.STAMINA.RECOVER);    
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Recovering', 750, 'effect');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'green', PLAYER.DURATIONS.RECOVER);
        this.setTimeEvent('recoverCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.RECOVER, () => {
            this.isRecovering = false;    
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You warp oncoming damage into stamina.`
        });
    };
    onRecoverUpdate = (_dt) => {if (!this.isRecovering) this.positiveMachine.setState(States.CLEAN);};

    recover = () => {
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Recovered', 500, 'effect');
        this.scene.useStamina(-25);
    };

    onReinEnter = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        this.isReining = true;
        this.reactiveName = States.REIN;
        this.scene.useGrace(PLAYER.STAMINA.REIN);    
        this.scene.sound.play(States.ABSORB, { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Rein', 750, 'effect');
        this.reactiveBubble = new Bubble(this.scene, this.x, this.y, 'fuchsia', PLAYER.DURATIONS.REIN);
        this.setTimeEvent('reinCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.scene.time.delayedCall(PLAYER.DURATIONS.REIN, () => {
            this.isReining = false;    
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
                if (this.reactiveName === States.REIN) this.reactiveName = '';
            };    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your hush warps oncoming damage into grace.`
        });
    };
    onReinUpdate = (_dt) => {if (!this.isReining) this.positiveMachine.setState(States.CLEAN);};

    rein = () => {
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Reining', 500, 'effect');
        this.scene.useGrace(-25);
    };

    onRenewalEnter = () => {
        this.isRenewing = true;
        this.scene.useGrace(PLAYER.STAMINA.RENEWAL);    
        this.aoe = new AoE(this.scene, 'renewal', 6, true);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Hush Tears', 750, 'bone');
        this.setTimeEvent('renewalCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
            this.isRenewing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
        });
    };
    onRenewalUpdate = (_dt) => {if (!this.isRenewing) this.positiveMachine.setState(States.CLEAN);};

    onScreamEnter = () => {
        this.scene.useGrace(PLAYER.STAMINA.SCREAM);    
        this.aoe = new AoE(this.scene, 'scream', 1);    
        this.scene.sound.play('scream', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Screaming', 750, 'hush');
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You scream, fearing nearby foes.`
        });
    };
    onScreamUpdate = (_dt) => {if (!this.isScreaming) this.positiveMachine.setState(States.CLEAN);};
    onScreamExit = () => this.setTimeEvent('screamCooldown', PLAYER.COOLDOWNS.SHORT);

    onShieldEnter = () => {
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.scene.useGrace(PLAYER.STAMINA.SHIELD);    
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.isShielding = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shielding', 750, 'bone');
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'bone', PLAYER.DURATIONS.SHIELD);
        this.negationName = States.SHIELD;
        this.setTimeEvent('shieldCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
            this.isShielding = false;    
            if (this.negationBubble && this.negationName === States.SHIELD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shield yourself from oncoming attacks.`
        });
    };
    onShieldUpdate = (_dt) => {if (!this.isShielding) this.positiveMachine.setState(States.CLEAN);};

    shield = () => {
        if (this.negationBubble === undefined || this.isShielding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isShielding = false;
            return;
        };
        this.scene.sound.play('shield', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shield Hit', 500, 'effect');
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        if (this.negationBubble.charges <= 0) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shield Broken', 500, 'damage');
            this.isShielding = false;
        };
    };

    onShimmerEnter = () => {
        this.isShimmering = true; 
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        this.scene.useGrace(PLAYER.STAMINA.SHIMMER);
        this.setTimeEvent('shimmerCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.adjustSpeed(PLAYER.SPEED.STEALTH);
        if (!this.isStealthing) this.stealthEffect(true);    
        this.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
            this.isShimmering = false;
            this.stealthEffect(false);
            this.adjustSpeed(-PLAYER.SPEED.STEALTH);
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You shimmer, fading in and out of this world.`
        });
    };
    onShimmerUpdate = (_dt) => {if (!this.isShimmering) this.positiveMachine.setState(States.CLEAN);};

    shimmer = () => {
        const shimmers = ['It fades through you', "You simply weren't there", "Perhaps you never were", "They don't seem certain of you at all"];
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, Math.floor(shimmers[Math.random() * shimmers.length]), 1500, 'effect');
    };

    onSprintEnter = () => {
        this.isSprinting = true;
        this.scene.sound.play('blink', { volume: this.scene.settings.volume / 3 });
        this.adjustSpeed(PLAYER.SPEED.SPRINT);
        this.scene.useGrace(PLAYER.STAMINA.SPRINT);
        this.setTimeEvent('sprintCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.flickerCarenic(PLAYER.DURATIONS.SPRINT);
        this.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
            this.isSprinting = false;
            this.adjustSpeed(-PLAYER.SPEED.SPRINT);    
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You tap into your caeren, bursting into an otherworldly sprint.`
        });
    };
    onSprintUpdate = (_dt) => {if (!this.isSprinting) this.positiveMachine.setState(States.CLEAN);};

    onStealthEnter = () => {
        if (!this.isShimmering) this.isStealthing = true; 
        this.stealthEffect(true);    
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You step halfway into the land of hush and tendril.`
        });
    };
    onStealthUpdate = (_dt) => {if (!this.isStealthing || this.currentRound > 1 || this.scene.combat) this.positiveMachine.setState(States.CLEAN);};
    onStealthExit = () => { 
        this.isStealthing = false;
        this.stealthEffect(false);
    };

    stealthEffect = (stealth) => {
        if (stealth) {
            if (this.scene.musicStealth.isPaused && !this.inCombat) {
                this.scene.musicBackground.pause();
                this.scene.musicStealth.play();
            };
            const getStealth = (object) => {
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
            this.adjustSpeed(-PLAYER.SPEED.STEALTH);
            getStealth(this);
            getStealth(this.spriteWeapon);
            getStealth(this.spriteShield);
        } else {
            if (this.scene.musicStealth.isPlaying) {
                this.scene.musicStealth.pause();
                if (this.inCombat) {
                    this.scene.musicCombat.play();
                } else {
                    this.scene.musicBackground.resume();
                };
            };
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
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
        this.isWarding = true;
        this.scene.useGrace(PLAYER.STAMINA.WARD);    
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warding', 750, 'damage');
        this.negationBubble = new Bubble(this.scene, this.x, this.y, 'red', PLAYER.DURATIONS.WARD);
        this.negationName = States.WARD;
        this.setTimeEvent('wardCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
            this.isWarding = false;    
            if (this.negationBubble && this.negationName === States.WARD) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
                this.negationName = '';
            };
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ward yourself from oncoming attacks.`
        });
    };
    onWardUpdate = (_dt) => {if (!this.isWarding) this.positiveMachine.setState(States.CLEAN);};

    ward = (id) => {
        if (this.negationBubble === undefined || this.isWarding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isWarding = false;
            return;
        };
        this.scene.sound.play('parry', { volume: this.scene.settings.volume });
        this.scene.stunned(id);
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warded', 500, 'effect');
        if (this.negationBubble.charges <= 3) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Ward Broken', 500, 'damage');
            this.negationBubble.setCharges(0);
            this.isWarding = false;
        };
    };

    onWritheEnter = () => {
        this.scene.useGrace(PLAYER.STAMINA.WRITHE);    
        this.aoe = new AoE(this.scene, 'writhe', 1);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Writhing', 750, 'tendril');
        this.isWrithing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
            this.isWrithing = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onWritheUpdate = (_dt) => {if (!this.isWrithing) this.positiveMachine.setState(States.CLEAN);};
    onWritheExit = () => {
        this.aoe.cleanAnimation(this.scene)
        this.setTimeEvent('writheCooldown', PLAYER.COOLDOWNS.SHORT);  
    };

    // ==================== TRAITS ==================== \\
    onAstricationEnter = () => {
        if (this.isAstrifying === true) return;
        this.scene.useGrace(PLAYER.STAMINA.ASTRICATION);    
        this.setTimeEvent('astricationCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.combatMachine.input('astrication', {active:true,charges:0});
        this.scene.sound.play('lightning', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Astrication', 750, 'effect');
        this.isAstrifying = true;
        this.flickerCarenic(PLAYER.DURATIONS.ASTRICATION); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.ASTRICATION, () => {
            this.scene.combatMachine.input('astrication', {active:false,charges:0});
            this.isAstrifying = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren astrifies, wrapping round your attacks.`
        });
    };
    onAstricationUpdate = (_dt) => {if (!this.isAstrifying) this.positiveMachine.setState(States.CLEAN);};

    onBerserkEnter = () => {
        if (this.isBerserking === true) return;
        this.scene.useGrace(PLAYER.STAMINA.BERSERK);    
        this.setTimeEvent('berserkCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.sound.play('howl', { volume: this.scene.settings.volume });
        this.scene.combatMachine.input('berserk', {active:true,charges:1});
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Berserking', 750, 'damage');
        this.isBerserking = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BERSERK, () => {
            this.scene.combatMachine.input('berserk', {active:false,charges:0});
            this.isBerserking = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren feeds off the pain, its hush shrieking forth.`
        });
    };
    onBerserkUpdate = (_dt) => {if (!this.isBerserking) this.positiveMachine.setState(States.CLEAN);};

    onBlindEnter = () => {
        this.scene.useGrace(PLAYER.STAMINA.BLIND);    
        this.aoe = new AoE(this.scene, 'blind', 1);    
        this.scene.sound.play('righteous', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Brilliance', 750, 'effect');
        this.isBlinding = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.BLIND, () => {
            this.isBlinding = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren shines with brilliance, blinding those around you.`
        });
    };
    onBlindUpdate = (_dt) => {if (!this.isBlinding) this.positiveMachine.setState(States.CLEAN);};
    onBlindExit = () => this.setTimeEvent('blindCooldown', PLAYER.COOLDOWNS.SHORT);

    onCaerenesisEnter = () => {
        if (this.currentTarget === undefined || this.outOfRange(PLAYER.RANGE.MODERATE) || this.invalidTarget(this.currentTarget.enemyID)) return;
        this.scene.useGrace(PLAYER.STAMINA.CAERENESIS);    
        this.aoe = new AoE(this.scene, 'caerenesis', 1, false, undefined, false, this.currentTarget);    
        this.scene.sound.play('blink', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Caerenesis', 750, 'cast');
        this.isCaerenesis = true;
        this.setTimeEvent('caerenesisCooldown', PLAYER.COOLDOWNS.SHORT);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.CAERENESIS, () => {
            this.isCaerenesis = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
        });
    };
    onCaerenesisUpdate = (_dt) => {if (!this.isCaerenesis) this.positiveMachine.setState(States.CLEAN);};

    onConvictionEnter = () => {
        if (this.isConvicted === true) return;
        this.scene.useGrace(PLAYER.STAMINA.CONVICTION);    
        this.setTimeEvent('convictionCooldown', PLAYER.COOLDOWNS.LONG);  
        this.scene.combatMachine.input('conviction', {active:true,charges:0});
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Conviction', 750, 'tendril');
        this.isConvicted = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.CONVICTION, () => {
            this.scene.combatMachine.input('conviction', {active:false,charges:0});
            this.isConvicted = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren steels itself in admiration of your physical form.`
        });
    };
    onConvictionUpdate = (_dt) => {if (!this.isConvicted) this.positiveMachine.setState(States.CLEAN)};

    onEnduranceEnter = () => {
        if (this.isEnduring === true) return;
        this.scene.useGrace(PLAYER.STAMINA.ENDURANCE);    
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
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren's hush pours into other faculties, invigorating you.`
        });
    };
    onEnduranceUpdate = (_dt) => {if (!this.isEnduring) this.positiveMachine.setState(States.CLEAN);};
    onEnduranceExit = () => this.setTimeEvent('enduranceCooldown', PLAYER.COOLDOWNS.LONG);  

    onImpermanenceEnter = () => {
        if (this.isImpermanent === true) return;
        this.scene.useGrace(PLAYER.STAMINA.IMPERMANENCE);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Impermanence', 750, 'hush');
        this.isImpermanent = true;
        this.flickerCarenic(1500); 
        this.setTimeEvent('impermanenceCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.time.delayedCall(PLAYER.DURATIONS.IMPERMANENCE, () => {
            this.isImpermanent = false;
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren grips your body and fades, its hush concealing.`
        });
    };
    onImpermanenceUpdate = (_dt) => {if (!this.isImpermanent) this.positiveMachine.setState(States.CLEAN);};

    onSeerEnter = () => {
        if (this.isSeering === true) return;
        this.scene.useGrace(PLAYER.STAMINA.SEER);    
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
        }, undefined, this);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren calms your body to focus, its hush bleeding into you.`
        });
    };
    onSeerUpdate = (_dt) => {if (!this.isSeering) this.positiveMachine.setState(States.CLEAN);};

    onStimulateEnter = () => {
        this.scene.useGrace(PLAYER.STAMINA.STIMULATE);    
        this.scene.sound.play('spooky', { volume: this.scene.settings.volume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stimulate', 750, 'effect');
        this.isStimulating = true;
        this.flickerCarenic(1500); 
        this.scene.time.delayedCall(PLAYER.DURATIONS.STIMULATE, () => {
            this.isStimulating = false;
        }, undefined, this);
        this.setTimeEvent('stimulateCooldown', PLAYER.COOLDOWNS.LONG);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your caeren's hush grants reprieve, refreshing you.`
        });
        for (let i = 0; i < this.scene.actionBar.specialButtons.length; i++) {
            const name = this.scene.settings.specials[i].toLowerCase();
            if (name === "stimulate") continue;
            console.log(`%c Resetting the cooldown on ${name}`, 'color: gold');
            this.setTimeEvent(`${name}Cooldown`, 20);
        };
    };
    onStimulateUpdate = (_dt) => {if (!this.isStimulating) this.positiveMachine.setState(States.CLEAN);};

    // ================= NEGATIVE MACHINE STATES ================= \\
    onConfusedEnter = () => { 
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(false);
            this.scene.rightJoystick.joystick.setVisible(false);
            this.scene.actionBar.setVisible(false);
        };
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, '?c .on-f-u`SeD~', DURATION.TEXT, 'effect', false, true);
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.confuseDirection = 'down';
        this.confuseVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ''; 
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        let iteration = 0;
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const dir = Math.floor(Math.random() * 4);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[dir];
            if (move >= 20) {
                this.confuseVelocity = MOVEMENT[direction];
            } else {
                this.confuseVelocity = { x: 0, y: 0 };
            };
            this.flipX = this.confuseVelocity.x < 0;
            this.playerVelocity.x = this.confuseVelocity.x;
            this.playerVelocity.y = this.confuseVelocity.y;
            this.confuseDirection = direction;
        };
        const confusions = ['~?  ? ?!', 'Hhwat?', 'Wh-wor; -e ma i?', 'Woh `re ewe?', '...'];
        this.confuseTimer = this.scene.time.addEvent({
            delay: 1250,
            callback: () => {
                iteration++;
                if (iteration === 6) {
                    iteration = 0;
                    this.isConfused = false;
                } else {   
                    this.specialCombatText.destroy();
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, confusions[Math.floor(Math.random() * 5)], 750, 'effect');
                };
            },
            callbackScope: this,
            repeat: 6,
        }); 
    };
    onConfusedUpdate = (_dt) => {
        if (!this.isConfused) this.combatChecker(this.isConfused);
        this.playerVelocity.x = this.confuseVelocity.x;
        this.playerVelocity.y = this.confuseVelocity.y;    
    };
    onConfusedExit = () => { 
        if (this.isConfused) this.isConfused = false;
        if (this.scene.settings.desktop === false) {  
            this.scene.joystick.joystick.setVisible(true);
            this.scene.rightJoystick.joystick.setVisible(true);
            this.scene.actionBar.setVisible(true);
        };
        this.spriteWeapon.setVisible(true);
        if (this.confuseTimer) {
            this.confuseTimer.destroy();
            this.confuseTimer = undefined;
        };
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onFearedEnter = () => { 
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(false);
            this.scene.rightJoystick.joystick.setVisible(false);
            this.scene.actionBar.setVisible(false);
        };
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage', false, true);
        this.spriteWeapon.setVisible(false);
        this.spriteShield.setVisible(false);
        this.fearVelocity = { x: 0, y: 0 };
        this.isAttacking = false;
        this.isParrying = false;
        this.isPosturing = false;
        this.isRolling = false;
        this.currentAction = ''; 
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        let iteration = 0;
        const fears = ['...ahhh!', 'c̶o̷m̷e̷ ̴h̴e̵r̶e̶', 'Stay Away!', 'Somebody HELP ME', 'g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓'];
        const randomDirection = () => {  
            const move = Math.random() * 101;
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Math.floor(Math.random() * 4)];
            if (move >= 20) {
                this.fearVelocity = MOVEMENT[direction];
            } else {
                this.fearVelocity = { x: 0, y: 0 };
            };
            this.flipX = this.fearVelocity.x < 0;
            this.playerVelocity.x = this.fearVelocity.x;
            this.playerVelocity.y = this.fearVelocity.y;
        };
        this.fearTimer = this.scene.time.addEvent({
            delay: 1250,
            callback: () => {
                iteration++;
                if (iteration === 4) {
                    iteration = 0;
                    this.isFeared = false;
                } else {   
                    randomDirection();
                    this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, fears[Math.floor(Math.random() * 5)], 750, 'damage');
                };
            },
            callbackScope: this,
            repeat: 4,
        }); 
    };
    onFearedUpdate = (_dt) => {
        if (!this.isFeared) this.combatChecker(this.isFeared);
        this.playerVelocity.x = this.fearVelocity.x;
        this.playerVelocity.y = this.fearVelocity.y;
    };
    onFearedExit = () => { 
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(true);
            this.scene.rightJoystick.joystick.setVisible(true);
            this.scene.actionBar.setVisible(true);
        };
        this.isFeared = false;
        this.fearCount = 0;
        this.spriteWeapon.setVisible(true);
        if (this.fearTimer) {
            this.fearTimer.destroy();
            this.fearTimer = undefined;
        };
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onFrozenEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Frozen', DURATION.TEXT, 'cast', false, true);
        this.clearAnimations();
        this.anims.play('player_idle', true);
        this.setStatic(true);
        this.scene.time.addEvent({
            delay: DURATION.FROZEN,
            callback: () => {
                this.isFrozen = false;
                this.negativeMachine.setState(States.CLEAN);
            },
            callbackScope: this,
            loop: false,
        });
    };
    onFrozenExit = () => this.setStatic(false);

    onPolymorphedEnter = () => {
        this.scene.joystick.joystick.setVisible(false);
        this.scene.rightJoystick.joystick.setVisible(false);
        this.scene.actionBar.setVisible(false);
        this.isPolymorphed = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphed', DURATION.TEXT, 'effect', false, true);
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
            const directions = ['up', 'down', 'left', 'right'];
            const dir = Math.floor(Math.random() * directions.length);
            const direction = directions[dir];
            if (move >= 20) {
                this.polymorphMovement = 'move';
                this.polymorphVelocity = MOVEMENT[direction]; 
            } else {
                this.polymorphMovement = 'idle';                
                this.polymorphVelocity = { x: 0, y: 0 };
            };
            this.flipX = this.polymorphVelocity.x < 0;
            this.polymorphDirection = direction;
            this.playerVelocity.x = this.polymorphVelocity.x;
            this.playerVelocity.y = this.polymorphVelocity.y;
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
                    this.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: 20, id: this.playerID } });
                };
            },
            callbackScope: this,
            repeat: 5,
        }); 
    };
    onPolymorphedUpdate = (_dt) => {
        if (!this.isPolymorphed) this.combatChecker(this.isPolymorphed);
        this.playerVelocity.x = this.polymorphVelocity.x;
        this.playerVelocity.y = this.polymorphVelocity.y;
    };
    onPolymorphedExit = () => { 
        this.scene.joystick.joystick.setVisible(true);
        this.scene.rightJoystick.joystick.setVisible(true);
        this.scene.actionBar.setVisible(true);
        if (this.isPolymorphed) this.isPolymorphed = false;
        this.clearAnimations();
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.spriteWeapon.setVisible(true);
        if (this.polymorphTimer) {
            this.polymorphTimer.destroy();
            this.polymorphTimer = undefined;
        };
    };

    onSlowedEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slowed', DURATION.TEXT, 'effect', false, true);
        this.setTint(0xFFC700);
        this.adjustSpeed(-(PLAYER.SPEED.SLOW - 0.25));
        this.scene.time.delayedCall(this.slowDuration, () =>{
            this.isSlowed = false;
            this.negativeMachine.setState(States.CLEAN);
        }, undefined, this);
    };

    onSlowedExit = () => {
        this.clearTint();
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.adjustSpeed((PLAYER.SPEED.SLOW - 0.25));
    };

    onSnaredEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snared', DURATION.TEXT, 'effect', false, true);
        this.snareDuration = DURATION.SNARED;
        this.setTint(0x0000FF);
        this.adjustSpeed(-(PLAYER.SPEED.SNARE - 0.25));
        this.scene.time.delayedCall(this.snareDuration, () =>{
            this.isSnared = false;
            this.negativeMachine.setState(States.CLEAN);
        }, undefined, this);
    };
    onSnaredExit = () => { 
        this.clearTint(); 
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF); 
        this.adjustSpeed((PLAYER.SPEED.SNARE - 0.25));
    };

    onStunnedEnter = () => {
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(false);
            this.scene.rightJoystick.joystick.setVisible(false);
            this.scene.actionBar.setVisible(false);
        };
        this.isStunned = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', PLAYER.DURATIONS.STUNNED, 'effect', false, true);
        this.scene.input.keyboard.enabled = false;
        this.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.setTint(0xFF0000);
        this.setStatic(true);
        this.anims.pause();
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You've been stunned.`
        });
        screenShake(this.scene);
    };
    onStunnedUpdate = (dt) => {
        this.setVelocity(0);
        this.stunDuration -= dt;
        if (this.stunDuration <= 0) this.isStunned = false;
        this.combatChecker(this.isStunned);
    };
    onStunnedExit = () => {
        if (this.scene.settings.desktop === false) {
            this.scene.joystick.joystick.setVisible(true);
            this.scene.rightJoystick.joystick.setVisible(true);
            this.scene.actionBar.setVisible(true);
        };
        this.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.scene.input.keyboard.enabled = true;
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.setStatic(false);
        this.anims.resume();
    };
    
    // ================= SET TIME EVENT ================= \\

    setTimeEvent = (cooldown, limit = 30000) => {
        const evasion = cooldown === 'rollCooldown' || cooldown === 'dodgeCooldown'; 
        if (evasion === false) {
            this[cooldown] = limit;
        };
        const type = cooldown.split('Cooldown')[0];
        this.scene.actionBar.setCurrent(0, limit, type);
        const button = this.scene.actionBar.getButton(type); 
        if (this.inCombat || type === 'blink' || type || 'desperation') {
            this.scene.time.delayedCall(limit, () => {
                this.scene.actionBar.setCurrent(limit, limit, type);
                this.scene.actionBar.animateButton(button);
                if (evasion === false) {
                    this[cooldown] = 0;
                };
            }, undefined, this); 
        } else {
            this.scene.actionBar.setCurrent(limit, limit, type);
            if (!evasion) {
                this[cooldown] = 0;
            };
        };
    };

    swingReset = (type, primary = false) => {
        this.canSwing = false;
        const time = (type === 'dodge' || type === 'parry' || type === 'roll') ? 750 : 
            this.isAttacking === true ? this.swingTimer : 
            this.isPosturing === true ? this.swingTimer - 250 :
            this.swingTimer;
        const button = this.scene.actionBar.getButton(type);
        this.scene.actionBar.setCurrent(0, time, type);
        this.scene.time.delayedCall(time, () => {
            this.canSwing = true;
            this.scene.actionBar.setCurrent(time, time, type);
            if (primary === true) this.scene.actionBar.animateButton(button);
        }, undefined, this);
    };

    checkCaerenic = (caerenic) => {
        this.isGlowing = caerenic;
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, 'weapon');
        this.setGlow(this.spriteShield, caerenic, 'shield');
    };

    flickerCarenic = (duration) => {
        if (this.isCaerenic === false && this.isGlowing === false) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(duration, () => {
                this.checkCaerenic(false);
            }, undefined, this);
        };
    };

    checkTargets = () => {
        const playerCombat = this.isPlayerInCombat();
        this.targets = this.targets.filter(gameObject => {
            if (gameObject.npcType && playerCombat === true) {
                this.scene.combatEngaged(false);
                this.inCombat = false;
            };
            if (playerCombat === true && (gameObject.isDefeated === true || gameObject.isLuckout === true || gameObject.isPersuaded === true)) {
                return false;
            };
            return true;
        });
        if (!this.touching.length && (this.triggeredActionAvailable || this.actionAvailable)) {
            if (this.triggeredActionAvailable) this.triggeredActionAvailable = undefined;
            if (this.actionAvailable) this.actionAvailable = false;
        };
        this.sendEnemies(this.targets);
        if (this.targets.length === 0) {
            this.disengage();
            return;
        };
        const someInCombat = this.targets.some(gameObject => gameObject.inCombat);
        if (someInCombat && !playerCombat) {
            this.scene.combatEngaged(true);
            this.inCombat = true;
        } else if (!someInCombat && playerCombat && !this.isStealthing && this.currentTarget === undefined) {
            this.disengage();
        };
    };

    removeTarget = (enemyID) => {
        this.targets = this.targets.filter(gameObject => gameObject.enemyID !== enemyID);
        this.tabEnemy(enemyID);
        this.checkTargets();
    };

    addEnemy = (enemy) => {
        this.targets.push(enemy);
        this.checkTargets();
    };

    isEnemyInTargets = (id) => {
        const enemy = this.targets.find(target => target.enemyID === id);
        return enemy ? true : false;
    };

    removeEnemy = (enemy) => {
        this.targets = this.targets.filter(gameObject => gameObject.enemyID !== enemy.enemyID);
        this.checkTargets();
    };

    tabEnemy = (enemyID) => {
        if (!this.inCombat) {
            this.setCurrentTarget(undefined);
            if (this.highlight.visible) {
                this.removeHighlight();
            };
            return;
        };
        const currentTargetIndex = this.targets.findIndex(obj => obj.enemyID === enemyID);
        const newTarget = this.targets[currentTargetIndex + 1] || this.targets[0];
        if (!newTarget) return;
        if (newTarget.npcType) {
            this.scene.setupNPC(newTarget);
        } else {
            this.scene.setupEnemy(newTarget);
            this.attacking = newTarget;
        };
        this.currentTarget = newTarget;
        this.targetID = newTarget.enemyID;
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            if (this.inCombat && !this.scene.state.computer) {
                this.scene.setupEnemy(this.currentTarget);
            }; 
        } else {
            if (this.highlight.visible) {
                this.removeHighlight();
            };
        };
    };

    clearEnemies = () => {
        this.targets = [];
        EventBus.emit('update-enemies', []);
    };

    sendEnemies = (enemies) => {
        if (enemies.length === 0) return;
        const data = enemies.map(enemy => {
            return { 
                id: enemy.enemyID, 
                game: enemy.ascean, 
                enemy: enemy.combatStats, 
                health: enemy.health, 
                isAggressive: enemy.isAggressive, 
                startedAggressive: enemy.startedAggressive, 
                isDefeated: enemy.isDefeated, 
                isTriumphant: enemy.isTriumphant,
                playerTrait: enemy.playerTrait,
                isPersuaded: enemy.isPersuaded,
                isLuckout: enemy.isLuckout,
            };
        });
        EventBus.emit('update-enemies', data);
    };

    setAttacking = (enemy) => {
        return this.attacking = enemy;
    };

    setCurrentTarget = (enemy) => {
        return this.currentTarget = enemy;
    };
    
    zeroOutVelocity = (velocityDirection, deceleration) => {
        if (velocityDirection > 0) {
            velocityDirection -= deceleration;
            if (velocityDirection < 0) {
                velocityDirection = 0;
            }; 
        } else if (velocityDirection < 0) {
            velocityDirection += deceleration;
            if (velocityDirection > 0) {
                velocityDirection = 0;
            };
        };
        return velocityDirection;
    };

    enemyIdMatch = () => {
        return this?.attackedTarget?.enemyID === this.scene.state?.enemyID;
    };

    checkPlayerAction = () => {
        if (this.scene.state.action) return this.scene.state.action;    
        if (this.isAttacking) return 'attack';
        if (this.isParrying) return 'parry';
        if (this.isPosturing) return 'posture';
        if (this.isRolling) return 'roll';
        return '';
    };
    
    movementClear = () => {
        return (
            !this.stateMachine.isCurrentState(States.ROLL) &&
            !this.stateMachine.isCurrentState(States.DODGE) &&
            !this.stateMachine.isCurrentState(States.PARRY) &&
            !this.stateMachine.isCurrentState(States.ATTACK) &&
            !this.stateMachine.isCurrentState(States.POSTURE) &&
            !this.stateMachine.isCurrentState(States.THRUST) &&
            !this.isStalwart
        );
    };

    playerActionSuccess = () => {
        if (this.particleEffect) {
            this.scene.particleManager.removeEffect(this.particleEffect.id);
            this.particleEffect.effect.destroy();
            this.particleEffect = undefined;
        } else {
            const action = this.checkPlayerAction();
            if (!action) return;
            if (!this.isAstrifying) {
                if (this?.attackedTarget?.isShimmering) {
                    if (Math.random() * 101 > 50) {
                        this?.attackedTarget?.shimmer();
                        return;
                    };
                };
                if (this.attackedTarget?.isProtecting || this.attackedTarget?.isShielding || this.attackedTarget?.isWarding) {
                    if (this.attackedTarget?.isShielding) this.attackedTarget?.shield();
                    if (this.attackedTarget?.isWarding) this.attackedTarget?.ward();
                    return;    
                };
                if (this.attackedTarget?.isMenacing) this.attackedTarget?.menace();
                if (this.attackedTarget?.isMultifaring) this.attackedTarget?.multifarious();
                if (this.attackedTarget?.isMystifying) this.attackedTarget?.mystify();
            };
            if (this.enemyIdMatch()) {
                this.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: action } });
            } else {
                this.scene.combatMachine.action({ type: 'Player', data: { 
                    playerAction: { action: action, parry: this.scene.state.parryGuess }, 
                    enemyID: this.attackedTarget.enemyID, 
                    ascean: this.attackedTarget.ascean, 
                    damageType: this.attackedTarget.currentDamageType, 
                    combatStats: this.attackedTarget.combatStats, 
                    weapons: this.attackedTarget.weapons, 
                    health: this.attackedTarget.health, 
                    actionData: { action: this.attackedTarget.currentAction, parry: this.attackedTarget.parryAction },
                }});
            };
            this.knockback(this.attackedTarget.enemyID);
        };
        if (this.isStealthing) {
            this.scene.paralyze(this.attackedTarget.enemyID);
            this.isStealthing = false;
            this.scene.combatEngaged(true);
            this.inCombat = true;
            this.attackedTarget.jumpIntoCombat();
            EventBus.emit('update-stealth');
        };
    };

    playerDodge = () => {
        this.dodgeCooldown = 50; // Was a 6x Mult for Dodge Prev aka 1728
        const dodgeDistance = 2800; // 126 || 2304
        const dodgeDuration = 350; // 18 || 288  
        let currentDistance = 0;
        const dodgeLoop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= dodgeDuration || currentDistance >= dodgeDistance) {
                this.spriteWeapon.setVisible(true);
                this.dodgeCooldown = 0;
                this.isDodging = false;
                return;
            };
            const direction = this.flipX ? -(dodgeDistance / dodgeDuration) : (dodgeDistance / dodgeDuration);
            if (Math.abs(this.velocity.x) > 0) this.setVelocityX(direction);
            if (this.velocity.y > 0) this.setVelocityY(dodgeDistance / dodgeDuration);
            if (this.velocity.y < 0) this.setVelocityY(-dodgeDistance / dodgeDuration);
            currentDistance += Math.abs(dodgeDistance / dodgeDuration);
            requestAnimationFrame(dodgeLoop);
        };
        let startTime = undefined;
        requestAnimationFrame(dodgeLoop);
    };

    playerRoll = () => {
        this.rollCooldown = 50; // Was a x7 Mult for Roll Prev aka 2240
        const rollDistance = 1920; // 140
        const rollDuration = 320; // 20
        let currentDistance = 0;
        const rollLoop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= rollDuration || currentDistance >= rollDistance) {
                this.spriteWeapon.setVisible(true);
                this.rollCooldown = 0;
                this.isRolling = false;
                return;
            };
            const direction = this.flipX ? -(rollDistance / rollDuration) : (rollDistance / rollDuration);
            if (Math.abs(this.velocity.x) > 0.1) this.setVelocityX(direction);
            if (this.velocity.y > 0) this.setVelocityY(rollDistance / rollDuration);
            if (this.velocity.y < 0) this.setVelocityY(-rollDistance / rollDuration);
            currentDistance += Math.abs(rollDistance / rollDuration);
            requestAnimationFrame(rollLoop);
        };
        let startTime = undefined;
        requestAnimationFrame(rollLoop);
    };

    handleActions = () => {
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            if (this.inCombat && (!this.scene.state.computer || this.scene.state.enemyID !== this.currentTarget.enemyID)) {
                this.scene.setupEnemy(this.currentTarget);
            };
        } else if (this.highlight.visible) {
            this.removeHighlight();
        };
        if (this.scene.settings.desktop === true) {
            if ((this.inputKeys.shift.SHIFT.isDown) && Input.Keyboard.JustDown(this.inputKeys.attack.ONE)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.specials[0].toLowerCase());
                if (button.isReady === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Input.Keyboard.JustDown(this.inputKeys.posture.TWO)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.specials[1].toLowerCase());
                if (button.isReady === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Input.Keyboard.JustDown(this.inputKeys.roll.THREE)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.specials[2].toLowerCase());
                if (button.isReady === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Input.Keyboard.JustDown(this.inputKeys.dodge.FOUR)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.specials[3].toLowerCase());
                if (button.isReady === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Input.Keyboard.JustDown(this.inputKeys.parry.FIVE)) { 
                const button = this.scene.actionBar.getButton(this.scene.settings.specials[4].toLowerCase());
                if (button.isReady === true) this.scene.actionBar.pressButton(button, this.scene);
            };

            if (Input.Keyboard.JustDown(this.inputKeys.attack.ONE) && this.stamina >= PLAYER.STAMINA.ATTACK && this.canSwing) {
                this.stateMachine.setState(States.ATTACK);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.posture.TWO) && this.stamina >= PLAYER.STAMINA.POSTURE && this.canSwing) {
                this.stateMachine.setState(States.POSTURE);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.roll.THREE) && this.stamina >= PLAYER.STAMINA.ROLL && this.movementClear()) {
                this.stateMachine.setState(States.ROLL);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.dodge.FOUR) && this.stamina >= PLAYER.STAMINA.DODGE && this.movementClear()) {
                this.stateMachine.setState(States.DODGE);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.parry.FIVE) && this.stamina >= PLAYER.STAMINA.PARRY && this.canSwing) { 
                this.stateMachine.setState(States.PARRY);
            };
        };
    };

    handleAnimations = () => {
        if (this.isHurt) {
            this.anims.play('player_hurt', true).on('animationcomplete', () => this.isHurt = false);  
        } else if (this.isPolymorphed) {
            this.anims.play(`rabbit_${this.polymorphMovement}_${this.polymorphDirection}`, true);
        } else if (this.isConfused || this.isFeared) {
            if (this.moving()) {
                if (!Math.abs(this.velocity.x)) {
                    if (this.velocity.y > 0) {
                        this.anims.play('run_down', true);
                    } else {
                        this.anims.play('run_up', true);
                    };
                } else {
                    this.anims.play('player_running', true);
                };
            } else {
                this.anims.play('player_idle', true);
            };
        } else if (this.isParrying) {
            sprint(this.scene);
            this.anims.play('player_attack_1', true).on('animationcomplete', () => this.isParrying = false); 
        } else if (this.isThrusting) {
            this.anims.play('player_attack_2', true).on('animationcomplete', () => this.isThrusting = false);
        } else if (this.isDodging) { 
            this.anims.play('player_slide', true);
            if (this.dodgeCooldown === 0) this.playerDodge();
        } else if (this.isRolling) { 
            this.anims.play('player_roll', true);
            sprint(this.scene);
            if (this.rollCooldown === 0) this.playerRoll();
        } else if (this.isPosturing) {
            sprint(this.scene);
            this.anims.play('player_attack_3', true).on('animationcomplete', () => this.isPosturing = false);
        } else if (this.isAttacking) {
            sprint(this.scene);
            this.anims.play('player_attack_1', true).on('animationcomplete', () => this.isAttacking = false); 
        } else if (this.moving()) {
            if (this.isClimbing) {
                sprint(this.scene);
                this.anims.play('player_climb', true);
            } else if (this.inWater) {
                sprint(this.scene);
                if (this.velocity.y > 0) {
                    this.anims.play('swim_down', true);
                } else {
                    this.anims.play('swim_up', true);
                };
            } else {
                if (!this.isWalking) {
                    this.isWalking = this.scene.time.delayedCall(400, () => {
                        walk(this.scene);
                        this.isWalking = undefined;
                    }, undefined, this);
                };
                if (!Math.abs(this.velocity.x)) {
                    if (this.velocity.y > 0) {
                        this.anims.play('run_down', true);
                    } else {
                        this.anims.play('run_up', true);
                    };
                } else {
                    this.anims.play('player_running', true);
                };
            };
            if (!this.isMoving) this.isMoving = true;
        } else if (this.isConsuming) { 
            this.anims.play('player_health', true).on('animationcomplete', () => this.isConsuming = false);
        } else if (this.isCasting) { 
            walk(this.scene);
            this.anims.play('player_health', true);
        } else if (this.isPraying) {
            this.anims.play('player_pray', true).on('animationcomplete', () => this.isPraying = false);
        } else if (this.isStealthing) {
            if (this.isMoving) {
                if (!Math.abs(this.velocity.x)) {
                    if (this.velocity.y > 0) {
                        this.anims.play('run_down', true);
                    } else {
                        this.anims.play('run_up', true);
                    };
                } else {
                    this.anims.play('player_running', true);
                };
            } else if (this.isClimbing) {
                this.anims.play('player_climb', true);
            } else if (this.inWater) {
                // this.anims.play('player_climb', true);
                if (this.velocity.y > 0) {
                    this.anims.play('swim_down', true);
                } else {
                    this.anims.play('swim_up', true);
                };
            } else {
                this.anims.play('player_crouch_idle', true);
            };
        } else {
            if (this.isMoving) this.isMoving = false;
            if (this.isClimbing) {
                this.anims.play('player_climb', true);
                this.anims.pause();
            } else if (this.inWater) {
                if (this.velocity.y > 0) {
                    this.anims.play('swim_down', true);
                } else {
                    this.anims.play('swim_up', true);
                };
                // this.anims.play('player_climb', true);
            } else {
                this.anims.play('player_idle', true);
            };
        };
        this.spriteWeapon.setPosition(this.x, this.y);
        this.spriteShield.setPosition(this.x, this.y);
    };

    handleConcerns = () => {
        if (this.actionSuccess === true) {
            this.actionSuccess = false;
            this.playerActionSuccess();
        };
        if (this.particleEffect !== undefined) { 
            if (this.particleEffect.success) {
                this.particleEffect.success = false;
                this.particleEffect.triggered = true;
                this.playerActionSuccess();
            } else {
                this.scene.particleManager.update(this.particleEffect);
            };
        };
        if (this.isConfused && !this.stateMachine.isCurrentState(States.CONFUSED)) {
            this.stateMachine.setState(States.CONFUSED);
            return;
        };
        if (this.isFeared && !this.stateMachine.isCurrentState(States.FEARED)) {
            this.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isFrozen && !this.negativeMachine.isCurrentState(States.FROZEN)) {
            this.negativeMachine.setState(States.FROZEN);
            return;
        };
        if (this.isPolymorphed && !this.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if (this.isSlowed && !this.negativeMachine.isCurrentState(States.SLOWED)) {
            this.negativeMachine.setState(States.SLOWED);
            return;
        };
        if (this.isSnared && !this.negativeMachine.isCurrentState(States.SNARED)) {
            this.negativeMachine.setState(States.SNARED); 
            return;    
        };
        if (this.isStunned && !this.stateMachine.isCurrentState(States.STUN)) {
            this.stateMachine.setState(States.STUN);
            return;
        };
        if (this.inCombat === true && this.scene.state.combatEngaged === true && this.currentTarget === undefined) this.findEnemy();
        if (this.inCombat && !this.healthbar.visible) this.healthbar.setVisible(true);
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText) this.scrollingCombatText.update(this);
        if (this.specialCombatText) this.specialCombatText.update(this); 
        if (this.resistCombatText) this.resistCombatText.update(this);
        if (this.negationBubble) this.negationBubble.update(this.x, this.y);
        if (this.reactiveBubble) this.reactiveBubble.update(this.x, this.y);
        this.weaponRotation('player', this.currentTarget);
    };

    handleMovement = () => {
        let speed = this.speed;
        if (this.inputKeys.right.D.isDown || this.inputKeys.right.RIGHT.isDown || this.scene.joystickKeys.right.isDown) {
            this.playerVelocity.x += this.acceleration;
            this.flipX = false;
        };
        if (this.inputKeys.left.A.isDown || this.inputKeys.left.LEFT.isDown || this.scene.joystickKeys.left.isDown) {
            this.playerVelocity.x -= this.acceleration;
            this.flipX = true;
        };
        if ((this.inputKeys.up.W.isDown || this.inputKeys.up.UP.isDown) || this.scene.joystickKeys.up.isDown) {
            this.playerVelocity.y -= this.acceleration;
        }; 
        if (this.inputKeys.down.S.isDown || this.inputKeys.down.DOWN.isDown || this.scene.joystickKeys.down.isDown) {
            this.playerVelocity.y += this.acceleration;
        };
        if (this.inputKeys.strafe.E.isDown || this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x > 0) {
            speed += 0.1;
            this.flipX = true;
        };
        if (this.inputKeys.strafe.Q.isDown || this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x < 0) {
            speed -= 0.1;    
            this.flipX = false;
        };
        if (!this.isConfused && !this.isFeared && !this.isPolymorphed && !this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.strafe.E.isDown && !this.inputKeys.strafe.Q.isDown && !this.inputKeys.left.A.isDown && !this.scene.joystickKeys.left.isDown && !this.scene.joystickKeys.right.isDown) {
            this.playerVelocity.x = 0;
        };
        if (!this.isConfused && !this.isFeared && !this.isPolymorphed && !this.inputKeys.left.A.isDown && !this.inputKeys.left.LEFT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.strafe.E.isDown && !this.inputKeys.strafe.Q.isDown && !this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown && !this.scene.joystickKeys.right.isDown && !this.scene.joystickKeys.left.isDown) {
            this.playerVelocity.x = 0;
        };
        if (!this.isConfused && !this.isFeared && !this.isPolymorphed && !this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown && !this.scene.joystickKeys.down.isDown && !this.scene.joystickKeys.up.isDown) {
            this.playerVelocity.y = 0;
        };
        if (!this.isConfused && !this.isFeared && !this.isPolymorphed && !this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown && !this.scene.joystickKeys.up.isDown && !this.scene.joystickKeys.down.isDown) {
            this.playerVelocity.y = 0;
        };
        if (this.isAttacking || this.isParrying || this.isPosturing || this.isThrusting) speed += 1;
        if (this.isClimbing) speed *= 0.65;
        if (this.inWater) speed *= 0.75;
        this.playerVelocity.limit(speed);
        this.setVelocity(this.playerVelocity.x, this.playerVelocity.y);
    }; 

    update() {
        this.handleConcerns();
        this.stateMachine.update(this.dt);
        this.positiveMachine.update(this.dt);
        this.negativeMachine.update(this.dt);
        this.handleActions();
        this.handleAnimations();
        this.handleMovement(); 
    };  
};