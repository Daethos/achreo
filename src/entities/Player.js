import Phaser from "phaser";
import Entity, { FRAME_COUNT } from "./Entity";  
import { screenShake, walk } from "../phaser/ScreenShake";
import StateMachine, { States } from "../phaser/StateMachine";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import HealthBar from "../phaser/HealthBar";
import { EventBus } from "../game/EventBus";
import CastingBar from "../phaser/CastingBar";
import Joystick from "../phaser/Joystick";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";

export const PLAYER = {
    COLLIDER: {
        DISPLACEMENT: 16,
        HEIGHT: 36,
        WIDTH: 20,
    },
    SPEED: {
        INITIAL: 1.5, // 1.75
        ACCELERATION: 0.1,
        DECELERATION: 0.05,
        CAERENIC: 0.5,
        BLINK: 250,
    },  
    SCALE: {
        SELF: 0.8,
        SHIELD: 0.6,
        WEAPON_ONE: 0.5,
        WEAPON_TWO: 0.65,
    },
    SENSOR: {
        COMBAT: 48,
        DEFAULT: 36,
        DISPLACEMENT: 12,
        EVADE: 21,
    },
    STAMINA: {
        ATTACK: 25,
        DODGE: 10, // 25
        PARRY: 10,
        POSTURE: 15,
        ROLL: 10, // 25
        BLINK: 10,
        CONSUME: 10,
        DESPERATION: 25,
        FREEZE: 25,
        FEARING: 15,
        HEALING: 15,
        INVOKE: -10,
        POLYMORPH: 15,
        ROOT: 15,
        SCREAM: 25,
        SHIELD: 25,
        SLOW: 10,
        SNARE: 10,
        TSHAER: 25,
    },
    DURATIONS: {
        FEARING: 1000,
        SHIELDING: 100,
        FREEZING: 750,
        HEALING: 1500,
        POLYMORPHING: 1500,
        SNARING: 1000,
        STUNNED: 2500,
        TSHAERING: 2000,
        SCREAM: 1000,
    },
};

const ORIGIN = {
    WEAPON: { X: 0.25, Y: 1 },
    SHIELD: { X: -0.2, Y: 0.25 },
    HELMET: { X: 0.5, Y: 1.15 },
    CHEST: { X: 0.5, Y: 0.25 },
    LEGS: { X: 0.5, Y: -0.5 },
};

export const staminaCheck = (input, stamina) => {
    switch (input) {
        case 'attack':
            const attackSucess = stamina >= PLAYER.STAMINA.ATTACK;
            return {
                success: attackSucess,
                cost: PLAYER.STAMINA.ATTACK,
            };
        case 'posture':
            const postureSuccess = stamina >= PLAYER.STAMINA.POSTURE;
            return {
                success: postureSuccess,
                cost: PLAYER.STAMINA.POSTURE,
            };
        case 'roll':
            const rollSuccess = stamina >= PLAYER.STAMINA.ROLL;
            return { 
                success: rollSuccess,
                cost: PLAYER.STAMINA.ROLL,
            };
        case 'dodge':
            const dodgeSuccess = stamina >= PLAYER.STAMINA.DODGE;
            return {
                success: dodgeSuccess,
                cost: PLAYER.STAMINA.DODGE,        
            };
        case 'parry':
            const parrySuccess = stamina >= PLAYER.STAMINA.PARRY;
            return {
                success: parrySuccess,
                cost: PLAYER.STAMINA.PARRY,
            };
        case 'blink':
            const blinkSuccess = stamina >= PLAYER.STAMINA.BLINK;
            return {
                success: blinkSuccess,
                cost: PLAYER.STAMINA.BLINK,
            };
        case 'consume':
            const consumeSuccess = stamina >= PLAYER.STAMINA.CONSUME;
            return {
                success: consumeSuccess,
                cost: PLAYER.STAMINA.CONSUME,
            };
        case 'desperation': 
            const desperationSuccess = stamina >= PLAYER.STAMINA.DESPERATION;
            return {
                success: desperationSuccess,
                cost: PLAYER.STAMINA.DESPERATION,
            };
        case 'fear':
            const fearingSuccess = stamina >= PLAYER.STAMINA.FEARING;
            return {
                success: fearingSuccess,
                cost: PLAYER.STAMINA.FEARING,
            };
        case 'freeze':
            const freezingSuccess = stamina >= PLAYER.STAMINA.FREEZE;
            return {
                success: freezingSuccess,
                cost: PLAYER.STAMINA.FREEZE,
            };
        case 'healing':
            const healingSuccess = stamina >= PLAYER.STAMINA.HEALING;
            return {
                success: healingSuccess,
                cost: PLAYER.STAMINA.HEALING,
            };
        case 'invoke':
            const invokeSuccess = stamina >= PLAYER.STAMINA.INVOKE;
            return { 
                success: invokeSuccess,
                cost: PLAYER.STAMINA.INVOKE,
            };
        case 'polymorph':
            const polymorphSuccess = stamina >= PLAYER.STAMINA.POLYMORPH;
            return {
                success: polymorphSuccess,
                cost: PLAYER.STAMINA.POLYMORPH,
            };
        case 'root':
            const rootSuccess = stamina >= PLAYER.STAMINA.ROOT;
            return {
                success: rootSuccess,
                cost: PLAYER.STAMINA.ROOT,
            };
        case 'scream':
            const screamSuccess = stamina >= PLAYER.STAMINA.SCREAM;
            return {
                success: screamSuccess,
                cost: PLAYER.STAMINA.SCREAM,
            };
        case 'shield':
            const shieldSuccess = stamina >= PLAYER.STAMINA.SHIELD;
            return {
                success: shieldSuccess,
                cost: PLAYER.STAMINA.SHIELD,
            };
        case 'slow':
            const slowSuccess = stamina >= PLAYER.STAMINA.SLOW;
            return {
                success: slowSuccess,
                cost: PLAYER.STAMINA.SLOW,
            };
        case 'snare':
            const snareSuccess = stamina >= PLAYER.STAMINA.SNARE;
            return {
                success: snareSuccess,
                cost: PLAYER.STAMINA.SNARE,
            };
        case 'tshaeral':
            const tshaerSuccess = stamina >= PLAYER.STAMINA.TSHAER;
            return {
                success: tshaerSuccess,
                cost: PLAYER.STAMINA.TSHAER,
            };
        default:
            return { 
                success: false,
                cost: 0,
            };
    };
};
 
export default class Player extends Entity {
    constructor(data) {
        const { scene } = data;
        super({ ...data, name: 'player', ascean: scene.state.player, health: scene.state.newPlayerHealth }); 

        this.ascean = this.getAscean();
        this.playerID = this.ascean._id;
        const weapon = this.ascean.weaponOne;
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.currentWeaponSprite = this.assetSprite(weapon);
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this.currentWeaponSprite);
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
        // this.spriteWeapon.setDepth(this + 1);
        this.spriteWeapon.setAngle(-195);
        this.currentDamageType = weapon?.damageType[0].toLowerCase();
        this.targetIndex = 1;
        this.currentTarget = undefined;
        this.stamina = scene?.state?.playerAttributes?.stamina;
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

        // this.currentHelmSprite = this.assetSprite(scene?.state?.player?.helmet);
        // this.currentChestSprite = this.assetSprite(scene?.state?.player?.chest);
        // this.currentLegsSprite = this.assetSprite(scene?.state?.player?.legs);
        // this.spriteHelm = this.createSprite(this.currentHelmSprite, 0, 0, 0.35, ORIGIN.HELMET.X, ORIGIN.HELMET.Y);
        // this.spriteChest = this.createSprite(this.currentChestSprite, 0, 0, 0.55, ORIGIN.CHEST.X, ORIGIN.CHEST.Y);
        // this.spriteLegs = this.createSprite(this.currentLegsSprite, 0, 0, 0.55, ORIGIN.LEGS.X, ORIGIN.LEGS.Y);

        // this.spriteHelmt.setName

        this.playerVelocity = new Phaser.Math.Vector2();
        this.speed = this.startingSpeed(scene?.ascean);
        this.acceleration = PLAYER.SPEED.ACCELERATION;
        this.deceleration = PLAYER.SPEED.DECELERATION;
        this.dt = this.scene.sys.game.loop.delta;
        this.stateMachine = new StateMachine(this, 'player');
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
            .addState(States.HEAL, {
                onEnter: this.onFlaskEnter,
                onUpdate: this.onFlaskUpdate,
                onExit: this.onFlaskExit,
            })
            .addState(States.HEALING, {
                onEnter: this.onHealingEnter,
                onUpdate: this.onHealingUpdate,
                onExit: this.onHealingExit,
            })
            .addState(States.CONSUME, {
                onEnter: this.onConsumeEnter,
                onUpdate: this.onConsumeUpdate,
                onExit: this.onConsumeExit,
            })
            .addState(States.INVOKE, {
                onEnter: this.onInvokeEnter,
                onUpdate: this.onInvokeUpdate,
                onExit: this.onInvokeExit,
            })
            .addState(States.STUN, {
                onEnter: this.onStunEnter,
                onUpdate: this.onStunUpdate,
                onExit: this.onStunExit,
            })
            .addState(States.BLINK, {
                onEnter: this.onBlinkEnter,
                onUpdate: this.onBlinkUpdate,
                onExit: this.onBlinkExit,
            })
            .addState(States.TSHAERAL, {
                onEnter: this.onTshaeralEnter,
                onUpdate: this.onTshaeralUpdate,
                onExit: this.onTshaeralExit,
            })
            .addState(States.FEARING, {
                onEnter: this.onFearingEnter,
                onUpdate: this.onFearingUpdate,
                onExit: this.onFearingExit,
            })
            .addState(States.POLYMORPHING, {
                onEnter: this.onPolymorphingEnter,
                onUpdate: this.onPolymorphingUpdate,
                onExit: this.onPolymorphingExit,
            })
            .addState(States.ROOTING, {
                onEnter: this.onRootingEnter,
                onUpdate: this.onRootingUpdate,
                onExit: this.onRootingExit,
            })
            .addState(States.SNARING, {
                onEnter: this.onSnaringEnter,
                onUpdate: this.onSnaringUpdate,
                onExit: this.onSnaringExit,
            })
            .addState(States.SCREAM, {
                onEnter: this.onScreamEnter,
                onUpdate: this.onScreamUpdate,
                onExit: this.onScreamExit,
            })
            .addState(States.FREEZE, {
                onEnter: this.onFreezeEnter,
                onUpdate: this.onFreezeUpdate,
                onExit: this.onFreezeExit,
            })
            .addState(States.FREEZE_CAST, {
                onEnter: this.onFreezeCastEnter,
                onUpdate: this.onFreezeCastUpdate,
                onExit: this.onFreezeCastExit,
            })
            .addState(States.SLOWING, {
                onEnter: this.onSlowInstantEnter,
                onUpdate: this.onSlowInstantUpdate,
                onExit: this.onSlowInstantExit,
            })
            .addState(States.DESPERATION, {
                onEnter: this.onDesperationEnter,
                onUpdate: this.onDesperationUpdate,
                onExit: this.onDesperationExit,
            })
            // .addState(States.SHIELD, {
            //     onEnter: this.onShieldEnter,
            //     onUpdate: this.onShieldUpdate,
            //     onExit: this.onShieldExit,
            // })
            .addState(States.RANGED_STUN, {
                onEnter: this.onRangedStunEnter,
                onUpdate: this.onRangedStunUpdate,
                onExit: this.onRangedStunExit,
            })
        this.stateMachine.setState(States.NONCOMBAT);

        this.metaMachine = new StateMachine(this, 'player');
        this.metaMachine
            .addState(States.CLEAN, {
                onEnter: this.onCleanEnter,
                onExit: this.onCleanExit,
            })
            .addState(States.STEALTH, {
                onEnter: this.onStealthEnter,
                onUpdate: this.onStealthUpdate,
                onExit: this.onStealthExit,
            })
            .addState(States.SHIELD, {
                onEnter: this.onShieldEnter,
                onUpdate: this.onShieldUpdate,
                onExit: this.onShieldExit,
            })

        this.metaMachine.setState(States.CLEAN);
        
        this.sensorDisp = PLAYER.SENSOR.DISPLACEMENT;
        this.colliderDisp = PLAYER.COLLIDER.DISPLACEMENT;
        this.stealthFx = this.scene.sound.add('stealth', { volume: this.scene.gameState.soundEffectVolume, loop: false });
        this.caerenicFx = this.scene.sound.add('blink', { volume: this.scene.gameState.soundEffectVolume / 3, loop: false });
        this.stalwartFx = this.scene.sound.add('stalwart', { volume: this.scene.gameState.soundEffectVolume, loop: false });
        this.prayerFx = this.scene.sound.add('prayer', { volume: this.scene.gameState.soundEffectVolume, loop: false });


        this.setScale(PLAYER.SCALE.SELF);   
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        let playerCollider = Bodies.rectangle(this.x, this.y + 10, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT, { isSensor: false, label: 'playerCollider' }); // Y + 10 For Platformer
        let playerSensor = Bodies.circle(this.x, this.y + 2, PLAYER.SENSOR.DEFAULT, { isSensor: true, label: 'playerSensor' }); // Y + 2 For Platformer
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.35, 
            restitution: 0.2,  
        });
        this.setExistingBody(compoundBody);                                    
        this.sensor = playerSensor;
        this.knocking = false;
        this.isCaerenic = false;
        this.isTshaering = false;
        this.tshaeringTimer = undefined; 
        this.highlight = this.scene.add.graphics()
            .lineStyle(4, 0xFF0000) // 3
            .setScale(0.25) // 35
            .strokeCircle(0, 0, 12) // 10 
            .setDepth(1000);
        this.scene.plugins.get('rexGlowFilterPipeline').add(this.highlight, {
            intensity: 0.005, // 005
        });
        this.highlight.setVisible(false);
        this.healthbar = new HealthBar(this.scene, this.x, this.y, scene.state.playerHealth, 'player');
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);

        this.playerStateListener();
        this.setFixedRotation();   
        this.checkEnemyCollision(playerSensor);
        // this.checkLootdropCollision(playerSensor);
    };   

    getAscean = () => {
        EventBus.once('player-ascean-ready', (ascean) => {
            this.ascean = ascean;
        });
        EventBus.emit('player-ascean');
        return this.ascean;
    };

    speedUpdate = (e) => {
        // EventBus.on('speed', (ascean) => {
            this.speed = this.startingSpeed(e);
        // });
    };

    
    stealthUpdate = () => {
        // EventBus.on('update-stealth', () => {
            if (this.isStealthing) {
                this.isStealthing = false;
            } else {
                this.metaMachine.setState(States.STEALTH);
            };
        // })
    };

    caerenicUpdate = () => {
        // EventBus.on('update-caerenic', () => {
            this.isCaerenic = this.isCaerenic ? false : true;
            this.caerenicFx.play();
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
        // });
    };

    stalwartUpdate = () => {
        // EventBus.on('update-stalwart', () => {
            this.isStalwart = this.isStalwart ? false : true;
            this.stalwartFx.play();
        // });
    };

    enemyUpdate = (e) => {
        const index = this.targets.findIndex(obj => obj.enemyID === e);
        this.targets = this.targets.filter(obj => obj.enemyID !== e);
        if (this.targets.length > 0) {
            const newTarg = this.targets[index] || this.targets[0];
            // console.log(`%c New Target: ${newTarg}`, 'color: #ff0000')
            if (!newTarg) return;
            this.currentTarget = newTarg;
            this.highlightTarget(this.currentTarget);
            this.scene.setupEnemy(this.currentTarget);
        };
    };

    tabUpdate = (enemy) => {
        if (this.currentTarget) {
            this.currentTarget.clearTint();
            this.currentTarget.setTint(0x000000);
        };
        const newTarget = this.targets.find(obj => obj.enemyID === enemy.id);
        this.targetIndex = this.targets.findIndex(obj => obj.enemyID === enemy.id);
        if (!newTarget) return;
        if (newTarget.npcType) { // NPC
            this.scene.setupNPC(newTarget);
        } else { // Enemy
            // this.scene.setupEnemy(newTarget);
            this.attacking = newTarget;
        };
        this.currentTarget = newTarget;
        this.targetID = newTarget.enemyID;
        this.highlightTarget(newTarget);
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

    createSprite = (imgUrl, x, y, scale, originX, originY) => {
        const sprite = new Phaser.GameObjects.Sprite(this.scene, x, y, imgUrl);
        sprite.setScale(scale);
        sprite.setOrigin(originX, originY);
        this.scene.add.existing(sprite);
        sprite.setDepth(this);
        return sprite;
    };

    multiplayerMovement = () => {
        EventBus.emit('playerMoving', { 
            x: this.x, y: this.y, flipX: this.flipX, attacking: this.isAttacking, parrying: this.isParrying,
            dodging: this.isDodging, posturing: this.isPosturing, rolling: this.isRolling, isMoving: this.isMoving,
            consuming: this.isConsuming, caerenic: this.isCaerenic, tshaering: this.isTshaering, polymorphing: this.isPolymorphing,
            praying: this.isPraying, healing: this.isHealing, stunned: this.isStunned, stealthing: this.isStealthing,
            currentWeaponSprite: this.currentWeaponSprite, currentShieldSprite: this.currentShieldSprite, health: this.health,
            velocity: { x: this.playerVelocity.x, y: this.playerVelocity.y },
        });
    };

    cleanUp() {
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
        EventBus.off('updated-stamina');
    };

    highlightTarget = (sprite) => {
        this.highlight.setPosition(sprite.x, sprite.y);
        this.highlight.setVisible(true);
        this.scene.target.setPosition(sprite.x, sprite.y)
    };

    removeHighlight() {
        this.highlight.setVisible(false);
    };

    assetSprite(asset) {
        return asset.imgUrl.split('/')[3].split('.')[0];
    };

    playerStateListener = () => {
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
        EventBus.on('updated-stamina', (percentage) => {
            // const newStamina = this.scene.state.playerAttributes.stamina * percentage / 100;
            this.stamina = Math.round(this.scene.state.playerAttributes.stamina * percentage / 100);
        });
    }; 

    disengage = () => {
        this.inCombat = false;
        this.attacking = undefined;
        this.currentTarget = undefined;
        this.scene.clearNAEnemy();
        this.removeHighlight();
        this.scene.combatEngaged(false);
    };

    engage = () => {
        this.inCombat = true;
        this.scene.combatEngaged(true);
    };

    constantUpdate = (e) => {
        this.checkGear(e.player.shield, e.weapons[0], e.playerDamageType.toLowerCase());
    };

    eventUpdate = (e) => {
        if (this.health > e.newPlayerHealth) {
            let damage = Math.round(this.health - e.newPlayerHealth);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e.computerCriticalSuccess);
            // console.log(`%c ${damage} Damage Taken by ${e?.computer?.name}`, 'color: #ff0000')
        };
        if (this.health < e.newPlayerHealth) {
            let heal = Math.round(e.newPlayerHealth - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, 1500, 'heal');
        }; 
    
        if (this.currentRound !== e.combatRound && this.scene.combat) {
            this.currentRound = e.combatRound;
            if (this.targets.length > 0) this.checkTargets(); // Was inside playerWin
            if (e.computerDamaged || e.playerDamaged || e.rollSuccess || e.parrySuccess || e.computerRollSuccess || e.computerParrySuccess) {
                this.soundEffects(e);
            };
        };
        if (e.computerParrySuccess) {
            this.stateMachine.setState(States.STUN);
            this.scene.combatMachine.input('computerParrySuccess', false);
            this.specialCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Parry', 1500, 'damage', e.computerCriticalSuccess);    
        };
        if (e.rollSuccess) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Roll', 1500, 'heal', e.criticalSuccess);
        };
        if (e.parrySuccess) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Parry', 1500, 'heal', e.criticalSuccess);
            this.scene.stunned(e.enemyID);
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'attack');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'parry');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'posture');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'roll');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'dodge');
            
        };
        if (e.computerRollSuccess) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Roll', 1500, 'damage', e.computerCriticalSuccess);
        };
        if (e.newComputerHealth <= 0 && e.playerWin === true) {
            if (this.isTshaering) this.isTshaering = false;
            if (this.tshaeringTimer) {
                this.tshaeringTimer.remove(false);
                this.tshaeringTimer = undefined;
            };
            
            this.defeatedEnemyCheck(e.enemyID);
            
            this.winningCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Victory', 3000, 'effect', true);    
        };
        if (e.newPlayerHealth <= 0 && e.computerWin === true) {
            console.log(`%c Player Defeated: ${e.newPlayerHealth}, ${e.computerWin}`, 'color: #ff0000')
            this.isDead = true;
            this.inCombat = false;
            this.attacking = undefined;
            this.anims.play('player_pray', true).on('animationcomplete', () => {
                this.anims.play('player_idle', true);
            });
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Defeat', 3000, 'damage', true);
            this.disengage();    
        };
        this.health = e.newPlayerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.playerHealth) this.healthbar.setTotal(e.playerHealth);
    };

    soundEffects(sfx) {
        try {
            const soundEffectMap = (type, weapon) => {
                switch (type) {
                    case 'Spooky':
                        return this.scene.spooky.play();
                    case 'Righteous':
                        return this.scene.righteous.play();
                    case 'Wild':
                        return this.scene.wild.play();
                    case 'Earth':
                        return this.scene.earth.play();
                    case 'Fire':
                        return this.scene.fire.play();
                    case 'Frost':
                        return this.scene.frost.play();
                    case 'Lightning':
                        return this.scene.lightning.play();
                    case 'Sorcery':
                        return this.scene.sorcery.play();
                    case 'Wind':
                        return this.scene.wind.play();
                    case 'Pierce':
                        return (weapon === 'Bow' || weapon === 'Greatbow') ? this.scene.bow.play() : this.scene.pierce.play();
                    case 'Slash':
                        return this.scene.slash.play();
                    case 'Blunt':
                        return this.scene.blunt.play();
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
            if (sfx.religiousSuccess === true) this.scene.righteous.play();
            if (sfx.rollSuccess === true || sfx.computerRollSuccess === true) this.scene.roll.play();
            if (sfx.parrySuccess === true || sfx.computerParrySuccess === true) this.scene.parry.play();
            if (sfx.playerWin === true) this.scene.righteous.play();
            // if (sfx.computerWin) this.scene.death.play();
            EventBus.emit('blend-combat', { computerDamaged: false, playerDamaged: false });
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

    defeatedEnemyCheck = (enemy) => {
        this.targets = this.targets.filter(obj => obj.enemyID !== enemy);
        this.sendEnemies(this.targets);
        this.scene.combatMachine.clear(enemy);
        if (this.targets.every(obj => !obj.inCombat)) {
            this.disengage();
        } else {
            if (this.currentTarget.enemyID === enemy) { // Was targeting the enemy that was defeated
                const newTarget = this.targets.find(obj => obj.enemyID !== enemy);
                if (!newTarget) return;
                this.scene.setupEnemy(newTarget);
                this.setAttacking(newTarget);
                this.setCurrentTarget(newTarget);
                this.targetID = newTarget.enemyID;
                this.highlightTarget(newTarget);
            }; 
        };
    };

    isPlayerInCombat = () => {
        return this.inCombat || this.scene.combat || this.scene.state.combatEngaged;
    };

    shouldPlayerEnterCombat = (other) => {
        console.log(`%c Should Player Enter Combat?`, 'color: #ff0000');
        const hasRemainingEnemies = this.scene.combat && this.scene.state.combatEngaged && this.inCombat;
        if (!hasRemainingEnemies && !this.isStealthing) {
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
        console.log(`%c Is Attack Target: ${this.attacking?.enemyID === enemy.enemyID}`, 'color: #ff0000');
        if (this.attacking?.enemyID === enemy.enemyID) {
            return true;
        };
        return false;
    };

    isNewEnemy = (enemy) => {
        const newEnemy = !this.targets.some(obj => obj.enemyID === enemy.enemyID);
        // console.log(`%c New Enemy: ${newEnemy}`, 'color: #ff0000');
        if (newEnemy) {
            this.targets.push(enemy);
            this.sendEnemies(this.targets);
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
 
    checkEnemyCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (this.isValidEnemyCollision(other)) {
                    const isNewEnemy = this.isNewEnemy(other.gameObjectB);
                    console.log(`%c Is New Enemy: ${isNewEnemy}`, 'color: #ff0000');
                    if (!isNewEnemy) return;
                    this.shouldPlayerEnterCombat(other);
                    this.touching.push(other.gameObjectB);
                    this.checkTargets();
                } else if (this.isValidNeutralCollision(other)) {
                    console.log('Start Collision isValidNeutralCollision')
                    const isNeutral = this.isNewEnemy(other.gameObjectB);
                    // console.log(`%c Is Neutral: ${isNeutral}`, 'color: #ff0000')
                    if (!isNeutral) return;
                    this.touching.push(other.gameObjectB);
                    this.checkTargets();
                    this.scene.setupEnemy(other.gameObjectB);
                };
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideActive({
            objectA: [playerSensor],
            callback: (other) => {
                if (this.isValidEnemyCollision(other)) {
                    // const collisionPoint = this.calculateCollisionPoint(other);
                    // const attackDirection = this.getAttackDirection(collisionPoint);
                    // console.log(`Are you properly oriented? ${attackDirection} ${this.flipX} ${attackDirection === this.flipX}`)
                    this.actionAvailable = true;
                    this.triggeredActionAvailable = other.gameObjectB;
                    if (!this.actionTarget) this.actionTarget = other;
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
                    this.checkTargets(); // Was outside of if statement
                };
            },
            context: this.scene,
        });
    };

    calculateCollisionPoint(other) {
        const bodyPosition = other.pair.gameObjectB.body.position;
        const offset = Phaser.Physics.Matter.Matter.Vector.mult(other.pair.collision.normal, other.pair.collision.depth);
        return Phaser.Physics.Matter.Matter.Vector.add(bodyPosition, offset);
    };
    
    getAttackDirection(collisionPoint) {
        const sensorPosition = this.sensor.position;
        return collisionPoint.x < sensorPosition.x;
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
        this.isAttacking = true;
        this.swingReset(States.ATTACK);
        this.swingReset(States.POSTURE);
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
        this.swingReset(States.PARRY);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.PARRY);
    };
    onParryUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.PARRY_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'parry');
        };
        this.combatChecker(this.isParrying);
    };
    onParryExit = () => {
        if (this.scene.state.action !== '') {
            console.log('Parry Exit')
            this.scene.combatMachine.input('action', '');
        };
        // if (this.scene.state.parryGuess !== '') this.scene.combatMachine.input('parryGuess', '');
    };

    onPostureEnter = () => {
        this.isPosturing = true;
        this.swingReset(States.POSTURE);
        this.swingReset(States.ATTACK);
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
        if (this.isStalwart) return;
        this.isDodging = true;
        this.scene.useStamina(PLAYER.STAMINA.DODGE);
        this.swingReset(States.DODGE);
        this.swingReset(States.ROLL);
        this.wasFlipped = this.flipX; 
        this.body.parts[2].position.y += this.sensorDisp;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.body.parts[1].vertices[0].y += this.colliderDisp;
        this.body.parts[1].vertices[1].y += this.colliderDisp; 
        this.body.parts[0].vertices[0].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[1].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[0].vertices[1].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[0].x += this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
    };
    onDodgeUpdate = (_dt) => { 
        this.combatChecker(this.isDodging);
    };
    onDodgeExit = () => {
        this.spriteWeapon.setVisible(true);
        this.dodgeCooldown = 0;
        this.isDodging = false;
        this.body.parts[2].position.y -= this.sensorDisp;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.body.parts[1].vertices[0].y -= this.colliderDisp;
        this.body.parts[1].vertices[1].y -= this.colliderDisp; 
        this.body.parts[0].vertices[0].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[1].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[0].vertices[1].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
        this.body.parts[1].vertices[0].x -= this.wasFlipped ? this.colliderDisp : -this.colliderDisp;
    };

    onRollEnter = () => {
        if (this.isStalwart) return;
        this.isRolling = true;
        this.scene.roll.play();
        this.swingReset(States.ROLL);
        this.swingReset(States.DODGE);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.ROLL);
        this.body.parts[2].position.y += this.sensorDisp;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.body.parts[1].vertices[0].y += this.colliderDisp;
        this.body.parts[1].vertices[1].y += this.colliderDisp; 
    };
    onRollUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ROLL_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'roll');
        };
        this.combatChecker(this.isRolling);
    };
    onRollExit = () => {
        this.spriteWeapon.setVisible(true);
        this.rollCooldown = 0; 
        if (this.scene.state.action !== '') {
            this.scene.combatMachine.input('action', '');
        };
        this.body.parts[2].position.y -= this.sensorDisp;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.body.parts[1].vertices[0].y -= this.colliderDisp;
        this.body.parts[1].vertices[1].y -= this.colliderDisp;
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

    onHealingEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.HEALING);
        this.isPolymorphing = true;
        this.checkCaerenic(true);
    };
    onHealingUpdate = (dt) => {
        if (this.isMoving) this.isPolymorphing = false;
        this.combatChecker(this.isPolymorphing);
        if (this.castbar.time >= PLAYER.DURATIONS.HEALING) {
            this.healingSuccess = true;
            this.isPolymorphing = false;
        };
        if (this.isPolymorphing) this.castbar.update(dt, 'cast');
    };
    onHealingExit = () => {
        if (this.healingSuccess) {
            this.setTimeEvent('healingCooldown', 6000);  
            this.scene.useStamina(PLAYER.STAMINA.HEALING);
            this.healingSuccess = false;
            EventBus.emit('initiate-combat', { data: { key: 'player', value: 25 }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.gameState.soundEffectVolume });
        };
        this.castbar.reset();
        this.checkCaerenic(false);
    };

    onConsumeEnter = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.isConsuming = true;
        this.scene.sound.play('consume', { volume: this.scene.gameState.soundEffectVolume });
        this.setTimeEvent('consumeCooldown', 3000);
    };
    onConsumeUpdate = (_dt) => {
        this.combatChecker(this.isConsuming);
    };
    onConsumeExit = () => {
        if (this.scene.state.playerEffects.length === 0) return;
        this.scene.combatMachine.action({ type: 'Consume', data: this.scene.state.playerEffects[0].id });        
        this.scene.useStamina(PLAYER.STAMINA.CONSUME);
    };

    onInvokeEnter = () => {
        if (!this.inCombat) return;
        this.isPraying = true;
        this.setStatic(true);
        this.checkCaerenic(true);
        this.setTimeEvent('invokeCooldown', 15000);
        this.invokeCooldown = 30;
        if (this.playerBlessing === '' || this.playerBlessing !== this.scene.state.playerBlessing) {
            this.playerBlessing = this.scene.state.playerBlessing;
        };
    };
    onInvokeUpdate = (_dt) => {
        this.combatChecker(this.isPraying);
    };
    onInvokeExit = () => {
        if (!this.inCombat) return;
        this.setStatic(false);
        this.checkCaerenic(false);
        this.scene.combatMachine.action({ type: 'Instant', data: this.scene.state.playerBlessing });
        this.prayerFx.play();
        this.scene.useStamina(PLAYER.STAMINA.INVOKE);
    };

    onRootingEnter = () => {
        if (!this.inCombat) return;
        this.isHealing = true;
        this.setTimeEvent('rootCooldown', 6000);
    };
    onRootingUpdate = (_dt) => {
        this.combatChecker(this.isHealing);
    };
    onRootingExit = () => { 
        if (!this.inCombat) return;
        this.scene.root();
        this.scene.useStamina(PLAYER.STAMINA.ROOT);
    };

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onStealthEnter = () => {
        this.isStealthing = true; 
        this.stealthEffect(true);    
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

    stealthEffect(stealth) {
        if (stealth) {
            const getStealth = (object) => {
                object.setAlpha(0.5); // 0.7
                object.setBlendMode(Phaser.BlendModes.SCREEN);
                this.scene.tweens.add({
                    targets: object,
                    tint: 0x00AAFF, // 0x00AAFF
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                }); 
            };
            getStealth(this);
            getStealth(this.spriteWeapon);
            getStealth(this.spriteShield);
        } else {
            const clearStealth = (object) => {
                this.scene.tweens.killTweensOf(object);
                object.setAlpha(1);
                object.clearTint();
                object.setBlendMode(Phaser.BlendModes.NORMAL);
            };
            clearStealth(this);
            clearStealth(this.spriteWeapon);
            clearStealth(this.spriteShield);
            this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        };
        this.stealthFx.play();    
    };

    onBlinkEnter = () => {
        this.scene.sound.play('caerenic', { volume: this.scene.gameState.soundEffectVolume });
        this.checkCaerenic(true);
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
        if (Math.abs(this.velocity.x) || Math.abs(this.velocity.y)) {
            this.scene.useStamina(PLAYER.STAMINA.BLINK);
        };
        this.setTimeEvent('blinkCooldown', 1500);
        if (!this.blinkEvent) {
            this.blinkEvent = this.scene.time.addEvent({
                delay: 750,
                callback: () => {
                    this.checkCaerenic(false);
                    this.blinkEvent.remove(false);
                    this.blinkEvent = undefined;
                },
                callbackScope: this,
                loop: false,
            });
        };
    };
    onBlinkUpdate = (_dt) => {
        this.combatChecker(this.isBlinking);
    };
    onBlinkExit = () => {};

    onDesperationEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'heal');
        this.checkCaerenic(true);
        this.scene.time.delayedCall(PLAYER.DURATIONS.HEALING, () => {
            this.checkCaerenic(false);
        });
    };
    onDesperationUpdate = (_dt) => {
        this.combatChecker(this.isFreezing);
    };
    onDesperationExit = () => {
        this.setTimeEvent('desperationCooldown', 15000);  
        EventBus.emit('initiate-combat', { data: { key: 'player', value: 50 }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.gameState.soundEffectVolume });
    };

    onFearingEnter = () => {
        if (!this.inCombat) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Fearing', PLAYER.DURATIONS.FEARING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FEARING);
        this.isFearing = true;
        this.checkCaerenic(true);
    };
    onFearingUpdate = (dt) => {
        if (this.isMoving) this.isFearing = false;
        this.combatChecker(this.isFearing);
        if (this.castbar.time >= PLAYER.DURATIONS.FEARING) {
            this.fearSuccess = true;
            this.isFearing = false;
        };
        if (this.isFearing) this.castbar.update(dt, 'cast');
    };
    onFearingExit = () => {
        if (this.fearSuccess) {
            this.scene.fear(this.attacking?.enemyID);
            this.setTimeEvent('fearCooldown', 6000);  
            this.fearSuccess = false;
            this.scene.mysterious.play();
            this.scene.useStamina(PLAYER.STAMINA.FEARING);    
        };
        this.castbar.reset();
        this.checkCaerenic(false);
    };

    onFreezeEnter = () => {
        if (!this.inCombat) return;
        this.aoe = new AoE(this.scene, 'freeze');
        this.scene.sound.play('freeze', { volume: this.scene.gameState.soundEffectVolume });
        this.scene.useStamina(PLAYER.STAMINA.FREEZE);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Freezing', PLAYER.DURATIONS.FREEZING, 'cast');
        this.isFreezing = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.FREEZING, () => {
            this.isFreezing = false;
        });
    };
    onFreezeUpdate = (_dt) => {
        this.combatChecker(this.isFreezing);
    };
    onFreezeExit = () => {
        if (!this.inCombat) return;
        this.setTimeEvent('freezeCooldown', 3000);
    };

    onFreezeCastEnter = () => {
        if (!this.inCombat) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Freezing', PLAYER.DURATIONS.FREEZING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FREEZING);
        this.isFreezing = true;
        this.checkCaerenic(true);
    };
    onFreezeCastUpdate = (dt) => {
        if (this.isMoving) this.isFreezing = false;
        this.combatChecker(this.isFreezing);
        if (this.castbar.time >= PLAYER.DURATIONS.FREEZING) {
            this.freezeSuccess = true;
            this.isFreezing = false;
        };
        if (this.isFreezing) this.castbar.update(dt, 'cast');
    };
    onFreezeCastExit = () => {
        if (this.freezeSuccess) {
            // this.scene.freeze(this.attacking?.enemyID);
            this.setTimeEvent('freezeCooldown', 6000);  
        this.scene.useStamina(PLAYER.STAMINA.FREEZE_CAST);
        this.freezeSuccess = false;
            this.scene.mysterious.play();
        };
        this.castbar.reset();
        this.checkCaerenic(false);
    };

    onScreamEnter = () => {
        if (!this.inCombat) return;
        this.scene.useStamina(PLAYER.STAMINA.SCREAM);    
        this.aoe = new AoE(this.scene, 'scream');    
        this.scene.sound.play('dungeon', { volume: this.scene.gameState.soundEffectVolume });
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Screaming', 750, 'damage');
        this.isScreaming = true;
        this.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
            this.isScreaming = false;
        });
    };
    onScreamUpdate = (_dt) => {
        this.combatChecker(this.isScreaming);
    };
    onScreamExit = () => {
        if (!this.inCombat) return;
        this.setTimeEvent('screamCooldown', 3000);  
    };

    onSlowInstantEnter = () => {
        if (!this.inCombat) return;
        this.isSlowing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slow', 750, 'cast');
        this.scene.sound.play('debuff', { volume: this.scene.gameState.soundEffectVolume });
        this.scene.slow(this.attacking.enemyID);
        this.scene.useStamina(PLAYER.STAMINA.SLOW);
        
        this.checkCaerenic(true);
        this.scene.time.delayedCall(500, () => {
            this.checkCaerenic(false);
            this.isSlowing = false;
        });
        
        // TODO:FIXME: Add Slow effect that shoots to enemy
    };
    onSlowInstantUpdate = (_dt) => {
        this.combatChecker(this.isSlowing);
    };
    onSlowInstantExit = () => {
        if (!this.inCombat) return;
        this.setTimeEvent('slowCooldown', 6000);
    };

    onSnaringEnter = () => {
        if (!this.inCombat) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snaring', PLAYER.DURATIONS.SNARING, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.SNARING);
        this.isSnaring = true;
    };
    onSnaringUpdate = (dt) => {
        if (this.isMoving) this.isSnaring = false;
        this.combatChecker(this.isSnaring);
        if (this.castbar.time >= PLAYER.DURATIONS.SNARING) {
            this.snaringSuccess = true;
            this.isSnaring = false;
        };
        if (this.isSnaring) this.castbar.update(dt, 'cast');
    };
    onSnaringExit = () => {
        // if (!this.inCombat) return;
        if (this.snaringSuccess) {
            this.setTimeEvent('snareCooldown', 6000);
            this.scene.useStamina(PLAYER.STAMINA.SNARE);
            this.scene.snare(this.attacking.enemyID);
            this.snaringSuccess = false;
            this.scene.sound.play('debuff', { volume: this.scene.gameState.soundEffectVolume });
        };
        this.castbar.reset();
        this.checkCaerenic(false);
    };

    onRangedStunEnter = () => {};
    onRangedStunUpdate = (_dt) => {};
    onRangedStunExit = () => {};

    onShieldEnter = () => {
        if (!this.inCombat) return;
        this.scene.useStamina(PLAYER.STAMINA.SHIELD);    
        this.scene.sound.play('shield', { volume: this.scene.gameState.soundEffectVolume });
        this.isShielding = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Shielding', 750, 'heal');
        this.shieldBubble = new Bubble(this.scene, this.x, this.y, 'bone', 6000);
        this.setTimeEvent('shieldCooldown', 15000);
        this.scene.time.delayedCall(6000, () => {
            this.isShielding = false;    
        });
    };
    onShieldUpdate = (_dt) => {
        this.combatChecker(this.isShielding);
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

    onPolymorphingEnter = () => {
        if (!this.inCombat) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPHING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.POLYMORPHING);
        this.isPolymorphing = true;
        this.checkCaerenic(true);
    };
    onPolymorphingUpdate = (dt) => {
        if (this.isMoving) this.isPolymorphing = false;
        this.combatChecker(this.isPolymorphing);
        if (this.castbar.time >= PLAYER.DURATIONS.POLYMORPHING) {
            this.polymorphSuccess = true;
            this.isPolymorphing = false;
        };
        if (this.isPolymorphing) this.castbar.update(dt, 'cast');
    };
    onPolymorphingExit = () => {
        if (this.polymorphSuccess) {
            this.scene.polymorph(this.attacking?.enemyID);
            this.setTimeEvent('polymorphCooldown', 4000);  
            this.scene.useStamina(PLAYER.STAMINA.POLYMORPH);
            this.polymorphSuccess = false;
            this.scene.mysterious.play();
        };
        this.castbar.reset();
        this.checkCaerenic(false);
    };

    onStunEnter = () => {
        this.isStunned = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', PLAYER.DURATIONS.STUNNED, 'effect', true);
        this.scene.input.keyboard.enabled = false;
        this.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.setTint(0x888888);
        this.setStatic(true);
    };
    onStunUpdate = (dt) => {
        this.setVelocity(0);
        this.stunDuration -= dt;
        if (this.stunDuration <= 0) this.isStunned = false;
        this.combatChecker(this.isStunned);
    };
    onStunExit = () => {
        this.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.scene.input.keyboard.enabled = true;
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF)
        this.setStatic(false);
    };

    onTshaeralEnter = () => {
        if (!this.inCombat) return;
        this.isTshaering = true;
        this.attacking.isConsumed = true;
        this.scene.useStamina(PLAYER.STAMINA.TSHAER);
        this.scene.tshaeral.play();
        this.checkCaerenic(true);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Tshaering', PLAYER.DURATIONS.TSHAERING / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.TSHAERING);
        this.castbar.setTime(PLAYER.DURATIONS.TSHAERING);
        this.tshaeringTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => {
                if (!this.isTshaering || this.scene.state.playerWin || this.scene.state.newComputerHealth <= 0) {
                    this.isTshaering = false;
                    this.tshaeringTimer.remove(false);
                    this.tshaeringTimer = undefined;
                    return;
                };
                this.scene.combatMachine.action({ type: 'Tshaeral', data: '' });
                // updateBeam(this.scene.time.now);
            },
            callbackScope: this,
            repeat: 8,
        });
        this.setTimeEvent('tshaeralCooldown', 15000);
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.isTshaering = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.setStatic(true);
    };
    onTshaeralUpdate = (dt) => {
        this.combatChecker(this.isTshaering);
        if (this.isTshaering) this.castbar.update(dt, 'channel');
    };
    onTshaeralExit = () => {
        this.castbar.reset();
        this.checkCaerenic(false);
        this.setStatic(false);
        if (this.tshaeringTimer) {
            this.tshaeringTimer.remove(false);
            this.tshaeringTimer = undefined;
        };
        // if (this.beamTimer) {
        //     this.beamTimer.remove();
        //     this.beamTimer = undefined;
        // };
        // this.tshaeringGraphic.destroy();
        // this.tshaeringGraphic = undefined;
    };

    setTimeEvent = (cooldown, limit = 30000) => {
        const evasion = cooldown === 'rollCooldown' || cooldown === 'dodgeCooldown' 
        if (!evasion) {
            this[cooldown] = limit;
        };
        const type = cooldown.split('Cooldown')[0];
        this.scene.actionBar.setCurrent(0, limit, type);

        if (this.inCombat || type === 'blink' || type || 'desperation') {
            this.scene.time.delayedCall(limit, () => {
                this.scene.actionBar.setCurrent(limit, limit, type);
                if (!evasion) {
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

    swingReset = (type) => {
        this.canSwing = false;
        this.scene.actionBar.setCurrent(0, this.swingTimer, type);
        this.scene.time.delayedCall(this.swingTimer, () => {
            this.canSwing = true;
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, type);
        }, undefined, this);
    };

    checkCaerenic = (caerenic) => {
        if (!this.isCaerenic) {
            this.setGlow(this, caerenic);
            this.setGlow(this.spriteWeapon, caerenic, 'weapon');
            this.setGlow(this.spriteShield, caerenic, 'shield');
        };
    };

    checkTargets = () => {
        const playerCombat = this.isPlayerInCombat();
        this.targets = this.targets.filter(gameObject => {
            // if (gameObject.isDead) { // && playerCombat  || !gameObject.inCombat
            //     return false;
            // };
            if (gameObject.npcType && playerCombat) {
                this.scene.combatEngaged(false);
                this.inCombat = false;
            };
            return true;
        });
        
        if (!this.touching.length && (this.triggeredActionAvailable || this.actionAvailable)) {
            if (this.triggeredActionAvailable) this.triggeredActionAvailable = undefined;
            if (this.actionAvailable) this.actionAvailable = false;
        };

        this.sendEnemies(this.targets);
        
        if (this.targets.length === 0) { // && this.scene.state.computer
            this.disengage();
            return;
        };
        
        const someInCombat = this.targets.some(gameObject => gameObject.inCombat);
        if (someInCombat && !playerCombat) {
            this.scene.combatEngaged(true);
            this.inCombat = true;
        } else if (!someInCombat && playerCombat && !this.isStealthing && this.currentTarget === undefined) {
            console.log('The player is not stealthed, in combat, and no enemies are in combat, clearing combat')
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

    removeEnemy = (enemy) => {
        this.targets = this.targets.filter(gameObject => gameObject.enemyID !== enemy.enemyID);
        this.checkTargets();
    };

    tabEnemy = (enemyID) => {
        if (this.currentTarget) {
            this.currentTarget.clearTint();
            this.currentTarget.setTint(0x000000);
        };

        if (!this.inCombat) {
            this.setCurrentTarget(undefined);
            if (this.highlight.visible) {
                this.removeHighlight();
            };
            return;
        };

        const currentTargetIndex = this.targets.findIndex(obj => obj.enemyID === enemyID);
        console.log('Current Target Index:', currentTargetIndex)
        const newTarget = this.targets[currentTargetIndex + 1] || this.targets[0];
        console.log('New Target:', newTarget)
        if (!newTarget) return;
        if (newTarget.npcType) { // NPC
            this.scene.setupNPC(newTarget);
        } else { // Enemy
            this.scene.setupEnemy(newTarget);
            this.attacking = newTarget;
        };
        this.currentTarget = newTarget;
        this.targetID = newTarget.enemyID;
        this.highlightTarget(newTarget);
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
        this.attacking = enemy;
    };

    setCurrentTarget = (enemy) => {
        this.currentTarget = enemy;
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
        return this.attackedTarget.enemyID === this.scene.state.enemyID;
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
            // !this.stateMachine.isCurrentState(States.INVOKE) &&
            // !this.stateMachine.isCurrentState(States.TSHAERAL) &&
            // !this.stateMachine.isCurrentState(States.HEAL) &&
            !this.isStalwart
        );
    };

    playerActionSuccess = () => {
        // console.log('Player Action Success')
        if (this.particleEffect) {
            this.scene.particleManager.removeEffect(this.particleEffect.id);
            this.particleEffect.effect.destroy();
            this.particleEffect = undefined;
        } else {
            const action = this.checkPlayerAction();
            if (!action) return;
            const match = this.enemyIdMatch();
            if (match) { // Target Player Attack
                this.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: action } });
            } else { // Blind Player Attack
                this.scene.combatMachine.action({ type: 'Player', data: { 
                    playerAction: { action: action, parry: this.scene.state.parryGuess }, 
                    enemyID: this.attackedTarget.enemyID, 
                    ascean: this.attackedTarget.ascean, 
                    damageType: this.attackedTarget.currentDamageType, 
                    combatStats: this.attackedTarget.combatStats, 
                    weapons: this.attackedTarget.weapons, 
                    health: this.attackedTarget.health, 
                    actionData: { action: this.attackedTarget.currentAction, parry: this.attackedTarget.parryAction }
                }});
            };
        };
        // if (this.actionTarget && !this.isRanged) this.knockback(this.actionTarget); // actionTarget
        // screenShake(this.scene); 
        if (this.isStealthing) {
            this.scene.stun(this.attackedTarget.enemyID);
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
            if (Math.abs(this.velocity.x) > 0.1) this.setVelocityX(direction);
            if (this.velocity.y > 0.1) this.setVelocityY(dodgeDistance / dodgeDuration);
            if (this.velocity.y < -0.1) this.setVelocityY(-dodgeDistance / dodgeDuration);
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
            if (this.velocity.y > 0.1) this.setVelocityY(rollDistance / rollDuration);
            if (this.velocity.y < -0.1) this.setVelocityY(-rollDistance / rollDuration);
            currentDistance += Math.abs(rollDistance / rollDuration);
            requestAnimationFrame(rollLoop);
        };
        let startTime = undefined;
        requestAnimationFrame(rollLoop);
    };

    handleActions = () => {
        // ========================= Tab Targeting ========================= \\
        
        // if (Phaser.Input.Keyboard.JustDown(this.inputKeys.target.TAB) && this.targets.length) { // was > 1 More than 1 i.e. worth tabbing
        //     // if (this.currentTarget) {
        //     //     this.currentTarget.clearTint();
        //     // };
        //     const newTarget = this.targets[this.targetIndex];
        //     this.targetIndex = this.targetIndex + 1 >= this.targets.length ? 0 : this.targetIndex + 1;
        //     if (!newTarget) return;
        //     if (newTarget.npcType) { // NPC
        //         this.scene.setupNPC(newTarget);
        //     } else { // Enemy
        //         this.scene.setupEnemy(newTarget);
        //         this.attacking = newTarget;
        //     };
        //     this.currentTarget = newTarget;
        //     this.targetID = newTarget.enemyID;
        //     this.highlightTarget(newTarget);
        // };

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

        // ========================= Player Combat Actions ========================= \\

        if (this.inCombat && this.attacking) {
            // if (this.stamina >= PLAYER.STAMINA.PARRY && this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.attack.ONE)) {
            //     this.scene.combatMachine.input('parryGuess', 'attack');
            //     this.stateMachine.setState(States.PARRY);              
            // };
            // if (this.stamina >= PLAYER.STAMINA.PARRY && this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.posture.TWO)) {
            //     this.scene.combatMachine.input('parryGuess', 'posture');
            //     this.stateMachine.setState(States.PARRY);
            // };
            // if (this.stamina >= PLAYER.STAMINA.PARRY && this.movementClear() && this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.roll.THREE)) {
            //     this.scene.combatMachine.input('parryGuess', 'roll');
            //     this.stateMachine.setState(States.PARRY);
            // };
        
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.attack.ONE) && this.stamina >= PLAYER.STAMINA.ATTACK && this.canSwing) {
                this.stateMachine.setState(States.ATTACK);
            };
            
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.posture.TWO) && this.stamina >= PLAYER.STAMINA.POSTURE && this.canSwing) {
                this.stateMachine.setState(States.POSTURE);
            };

            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.parry.FIVE) && this.stamina >= PLAYER.STAMINA.PARRY && this.canSwing) {
                this.scene.combatMachine.input('parryGuess', 'parry');
                this.stateMachine.setState(States.PARRY);
            };
            // if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.snare.V) && this.rootCooldown === 0) {
            //     this.scene.root();
            //     this.setTimeEvent('rootCooldown', 6000);
            //     // screenShake(this.scene);
            // };
            // if (Phaser.Input.Keyboard.JustDown(this.inputKeys.snare.V) && this.snareCooldown === 0) {
            //     this.scene.snare(this.attacking.enemyID);
            //     this.setTimeEvent('snareCooldown', 6000);
            // };
            // if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.pray.R) && !this.isMoving && this.polymorphCooldown === 0) { // && this.polymorphCooldown === 0
            //     this.stateMachine.setState(States.POLYMORPHING);
            // };
            // if (Phaser.Input.Keyboard.JustDown(this.inputKeys.pray.R) && this.invokeCooldown === 0) {
            //     if (this.scene.state.playerBlessing === '') return;
            //     this.setTimeEvent('invokeCooldown');
            //     this.stateMachine.setState(States.INVOKE);
            // };
            // if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.consume.F) && this.stamina >= PLAYER.STAMINA.TSHAER && this.tshaeralCooldown === 0) { // this.tshaeralCooldown === 0
            //     this.stateMachine.setState(States.TSHAERAL);
            //     this.setTimeEvent('tshaeralCooldown', 15000);
            //     this.scene.time.addEvent({
            //         delay: 2000,
            //         callback: () => {
            //             this.isTshaering = false;
            //         },
            //         callbackScope: this,
            //         loop: false,
            //     });
            // };
            // if (Phaser.Input.Keyboard.JustDown(this.inputKeys.consume.F)) {
            //     if (this.scene.state.playerEffects.length === 0) return;
            //     this.isConsuming = true;
            //     this.scene.combatMachine.action({ type: 'Consume', data: this.scene.state.playerEffects });
            //     // screenShake(this.scene);
            // };
        };

        // ========================= Player Movement Actions ========================= \\

        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.roll.THREE) && this.stamina >= PLAYER.STAMINA.ROLL && this.movementClear()) {
            this.stateMachine.setState(States.ROLL);
        };

        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.dodge.FOUR) && this.stamina >= PLAYER.STAMINA.DODGE && this.movementClear()) {
            this.stateMachine.setState(States.DODGE);
        };

        // ========================= Player Utility Actions ========================= \\

        // if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.stalwart.G)) {
        //     this.scene.caerenic();
        // };

        // if (Phaser.Input.Keyboard.JustDown(this.inputKeys.stalwart.G)) {
        //     this.scene.stalwart();
        // }; 

        // if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.firewater.T)) {
        //     EventBus.emit('update-stealth');
        // };

        // if (Phaser.Input.Keyboard.JustDown(this.inputKeys.firewater.T)) {
        //     this.stateMachine.setState(States.HEAL);
        // };
    };

    handleAnimations = () => {
        if (this.isStunned) {
            this.setVelocity(0);
        } else if (this.isHurt) {
            this.anims.play('player_hurt', true).on('animationcomplete', () => this.isHurt = false);  
        } else if (this.isParrying) {
            this.anims.play('player_attack_2', true).on('animationcomplete', () => this.isParrying = false);
        } else if (this.isDodging) { 
            this.anims.play('player_slide', true);
            this.spriteWeapon.setVisible(false);
            if (this.dodgeCooldown === 0) this.playerDodge();
        } else if (this.isRolling) { 
            this.anims.play('player_roll', true);
            walk(this.scene);
            this.spriteWeapon.setVisible(false);
            if (this.rollCooldown === 0) this.playerRoll();
        } else if (this.isPosturing) {
            walk(this.scene);
            this.anims.play('player_attack_3', true).on('animationcomplete', () => this.isPosturing = false);
        } else if (this.isAttacking) {
            walk(this.scene);
            this.anims.play('player_attack_1', true).on('animationcomplete', () => this.isAttacking = false); 
        } else if ((Math.abs(this.body.velocity.x) > 0.1 || Math.abs(this.body.velocity.y) > 0.1)) {
            // walk(this.scene);
            if (!this.isMoving) this.isMoving = true;
            this.anims.play('player_running', true);
        } else if (this.isConsuming) { 
            this.anims.play('player_health', true).on('animationcomplete', () => this.isConsuming = false);
        } else if (this.isPolymorphing || this.isFearing || this.isFreezing || this.isSlowing || this.isSnaring) { 
            this.anims.play('player_health', true);
        } else if (this.isTshaering) {
            this.anims.play('player_health', true);
        } else if (this.isHealing) {
            this.anims.play('player_pray', true).on('animationcomplete', () => this.isHealing = false);
        } else if (this.isPraying) {
            this.anims.play('player_pray', true).on('animationcomplete', () => this.isPraying = false);
        } else {
            if (this.isMoving) this.isMoving = false;
            this.anims.play('player_idle', true);
        };
        
        // ========================= Player Animation Positioning ========================= \\

        this.spriteWeapon.setPosition(this.x, this.y);
        this.spriteShield.setPosition(this.x, this.y);

        // this.spriteHelm.setPosition(this.x, this.y);
        // this.spriteChest.setPosition(this.x, this.y);
        // this.spriteLegs.setPosition(this.x, this.y);
    };

    handleConcerns = () => {
        if (this.actionSuccess) {
            this.actionSuccess = false;
            this.playerActionSuccess();
        };
        if (this.particleEffect) { 
            if (this.particleEffect.success) {
                this.particleEffect.triggered = true;
                this.particleEffect.success = false;
                this.playerActionSuccess();
            } else {
                this.scene.particleManager.update(this, this.particleEffect);
            };
        };
        if (this.inCombat && !this.healthbar.visible) this.healthbar.setVisible(true);
        // if (this.currentHelmSprite !== this.assetSprite(this.scene.state.player.helmet)) {
        //     this.currentHelmSprite = this.assetSprite(this.scene.state.player.helmet);
        //     this.spriteHelm.setTexture(this.currentHelmSprite);
        // };
        // if (this.currentChestSprite !== this.assetSprite(this.scene.state.player.chest)) {
        //     this.currentChestSprite = this.assetSprite(this.scene.state.player.chest);
        //     this.spriteChest.setTexture(this.currentChestSprite);
        // };
        // if (this.currentLegsSprite !== this.assetSprite(this.scene.state.player.legs)) {
        //     this.currentLegsSprite = this.assetSprite(this.scene.state.player.legs);
        //     this.spriteLegs.setTexture(this.currentLegsSprite);
        // };
            
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText) this.scrollingCombatText.update(this);
        if (this.winningCombatText) this.winningCombatText.update(this);
        if (this.specialCombatText) this.specialCombatText.update(this);
        // if (this.shieldBubble) this.shieldBubble.update(this.x, this.y);

        this.weaponRotation('player', this.currentTarget);
    };

    handleMovement = () => {
        let speed = this.speed;
        this.scene.rightJoystick.update();

        // =================== MOVEMENT ================== \\

        if (this.inputKeys.right.D.isDown || this.inputKeys.right.RIGHT.isDown || this.scene.joystickKeys.right.isDown) {
            this.playerVelocity.x += this.acceleration;
            if (this.flipX) this.flipX = false;
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

        // =================== STRAFING ================== \\

        if (this.inputKeys.strafe.E.isDown || this.strafingRight === true) {
            this.playerVelocity.x = speed; // 1.75
            if (!this.flipX) this.flipX = true;
        };
        if (this.inputKeys.strafe.Q.isDown || this.strafingLeft === true) {
            this.playerVelocity.x = -speed; // 1.75
            if (this.flipX) this.flipX = false;
        };

        // ========================= Twisting ========================= \\

        if (this.holdingBothMouseButtons) {
            this.flipX = this.body.velocity.x < 0;
            this.playerVelocity.x += Math.cos(this.angle) + this.acceleration;
            this.playerVelocity.y += Math.sin(this.angle) + this.acceleration; 
        };

        // =================== DECELERATION ================== \\

        if (!this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.strafe.E.isDown && !this.inputKeys.strafe.Q.isDown && !this.inputKeys.left.A.isDown && !this.inputKeys.left.LEFT.isDown && !this.scene.joystickKeys.left.isDown && !this.scene.joystickKeys.right.isDown) {
            this.playerVelocity.x = this.zeroOutVelocity(this.playerVelocity.x, this.deceleration);
        };
        if (!this.inputKeys.left.A.isDown && !this.inputKeys.left.LEFT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.strafe.E.isDown && !this.inputKeys.strafe.Q.isDown && !this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown && !this.scene.joystickKeys.right.isDown && !this.scene.joystickKeys.left.isDown) {
            this.playerVelocity.x = this.zeroOutVelocity(this.playerVelocity.x, this.deceleration);
        };
        if (!this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown && !this.scene.joystickKeys.down.isDown && !this.scene.joystickKeys.up.isDown) {
            this.playerVelocity.y = this.zeroOutVelocity(this.playerVelocity.y, this.deceleration);
        };
        if (!this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown && !this.scene.joystickKeys.up.isDown && !this.scene.joystickKeys.down.isDown) {
            this.playerVelocity.y = this.zeroOutVelocity(this.playerVelocity.y, this.deceleration);
        };

        // =================== VARIABLES IN MOTION ================== \\

        if (this.inputKeys.strafe.E.isDown || this.inputKeys.strafe.Q.isDown 
            || this.strafingLeft === true || this.strafingRight === true) {
            // if (!this.spriteShield.visible && !this.isDodging && !this.isRolling) this.spriteShield.setVisible(true);
            this.isStrafing = true;
        } else if (this.isStrafing) {
            this.isStrafing = false;
            this.strafingLeft = false;
            this.strafingRight = false;
        };
        
        if (this.isAttacking || this.isParrying || this.isPosturing) speed += 1;
        
        // ==================== SETTING VELOCITY ==================== \\
        
        this.playerVelocity.limit(speed);
        this.setVelocity(this.playerVelocity.x, this.playerVelocity.y);
        // console.log(this.scene.multiplayer)
        // this.multiplayerMovement(); 
    }; 

    update() {
        this.handleConcerns();
        this.stateMachine.update(this.dt);
        this.metaMachine.update(this.dt);
        this.handleActions();
        this.handleAnimations();
        this.handleMovement(); 
    };

    isAtEdgeOfLedge(scene) {
        const playerSensor = this.body.parts[2]; // Assuming playerSensor is the second part of the compound body
        const rayStart = { x: playerSensor.position.x - playerSensor.circleRadius, y: playerSensor.position.y }; // Starting point of the ray
        const rayEnd = { x: playerSensor.position.x + playerSensor.circleRadius, y: playerSensor.position.y - playerSensor.circleRadius }; // Ending point of the ray
        const bodies = scene.matter.world.getAllBodies().filter(body => body.gameObject && body.gameObject?.tile?.properties?.isGround);
        let isAtEdge = false;
        const intersections = scene.matter.intersectRay(rayStart.x, rayStart.y, rayEnd.x, rayEnd.y, 36, bodies).filter(intersection => intersection.id !== playerSensor.id);
        if (intersections.length === 1) {
            isAtEdge = true;
        }; 
        return isAtEdge;
    }; 

    isCollidingWithPlayer() {
        const bodies = this.scene.matter.world.getAllBodies().filter(body => body.gameObject && body.gameObject?.tile?.properties?.isGround);
        const playerSensor = this.body.parts[2];
        return this.scene.matter.overlap(playerSensor, bodies);
    };   
};