import Phaser from "phaser";
import Entity, { FRAME_COUNT } from "./Entity";  
import { sprint, walk } from "../phaser/ScreenShake";
import StateMachine, { States } from "../phaser/StateMachine";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import HealthBar from "../phaser/HealthBar";
import { EventBus } from "../game/EventBus";
import CastingBar from "../phaser/CastingBar";
import { PLAYER } from "../utility/player";
import AoE from "../phaser/AoE";
import Bubble from "../phaser/Bubble";

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

const ORIGIN = {
    WEAPON: { X: 0.25, Y: 1 },
    SHIELD: { X: -0.2, Y: 0.25 },
    HELMET: { X: 0.5, Y: 1.15 },
    CHEST: { X: 0.5, Y: 0.25 },
    LEGS: { X: 0.5, Y: -0.5 },
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
        this.maxStamina = scene?.state?.playerAttributes?.stamina;
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
            .addState(States.FREEZE_CAST, {
                onEnter: this.onFreezeCastEnter,
                onUpdate: this.onFreezeCastUpdate,
                onExit: this.onFreezeCastExit,
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
            .addState(States.RANGED_STUN, {
                onEnter: this.onRangedStunEnter,
                onUpdate: this.onRangedStunUpdate,
                onExit: this.onRangedStunExit,
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
            .addState(States.TSHAERAL, {
                onEnter: this.onTshaeralEnter,
                onUpdate: this.onTshaeralUpdate,
                onExit: this.onTshaeralExit,
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

        this.metaMachine = new StateMachine(this, 'player');
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
            }) // ==================== NEGATIVE META STATES ==================== //
            .addState(States.FROZEN, {
                onEnter: this.onFrozenEnter,
                // onUpdate: this.onFrozenUpdate,
                onExit: this.onFrozenExit,
            })
            .addState(States.SLOWED, {
                onEnter: this.onSlowedEnter,
                // onUpdate: this.onSlowedUpdate,
                onExit: this.onSlowedExit,
            })
            .addState(States.SNARED, {
                onEnter: this.onSnaredEnter,
                // onUpdate: this.onSnaredUpdate,
                onExit: this.onSnaredExit,
            })

        this.metaMachine.setState(States.CLEAN);
        
        // this.sensorDisp = PLAYER.SENSOR.DISPLACEMENT;
        // this.colliderDisp = PLAYER.COLLIDER.DISPLACEMENT;

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
        this.weaponHitbox = this.scene.add.circle(this.spriteWeapon.x, this.spriteWeapon.y, 20, 0xfdf6d8, 0);
        // this.weaponHitbox = this.scene.add.triangle(this.spriteWeapon.x, this.spriteWeapon.y, 0, 0, 0, 40, 40, 40, 0xfdf6d8, 0.5);
        this.scene.add.existing(this.weaponHitbox);

        this.knocking = false;
        this.isCaerenic = false;
        this.isStalwart = false;
        this.isStealthing = false;
        this.isArcing = false;
        this.isChioimic = false;
        this.isEnveloping = false;
        this.isHealing = false;
        this.isLeaping = false;
        this.isMalicing = false;
        this.isMending = false;
        this.isPolymorphed = false;
        this.isProtecting = false;
        this.isPursuing = false;
        this.isRushing = false;
        this.isShielding = false;
        this.isShimmering = false;
        this.isSprinting = false;
        this.isSuturing = false;
        this.isTshaering = false;
        this.isWarding = false;
        this.isWrithing = false;
        
        this.isConfused = false;
        this.isFeared = false;
        this.isFrozen = false;
        this.isRooted = false;
        this.isSlowed = false;
        this.isSnared = false;
        this.isStunned = false;
        
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
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health, 'player');
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
        this.rushedEnemies = [];
        this.playerStateListener();
        this.setFixedRotation();   
        this.checkEnemyCollision(playerSensor);
        this.checkWorldCollision(playerSensor);
    };   

    getAscean = () => {
        EventBus.once('player-ascean-ready', (ascean) => {
            this.ascean = ascean;
        });
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
            this.metaMachine.setState(States.STEALTH);
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
        EventBus.on('updated-stamina', this.updateStamina);
    }; 

    updateStamina = (percentage) => {
        this.stamina = Math.round(this.maxStamina * percentage / 100);
    };

    setPlayer = (stats) => {
        this.ascean = stats.ascean;
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
        const enemy = this.targets.find(obj => obj.enemyID === this.scene.state.enemyID);
        if (enemy) {
            this.currentTarget = enemy;
            this.highlightTarget(enemy);
        };
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
            damage = e.computerGlancingBlow ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);
            // console.log(`%c ${damage} Damage Taken by ${e?.computer?.name}`, 'color: #ff0000')
            if (this.isConfused === true) this.isConfused = false;
            if (this.isPolymorphed === true) this.isPolymorphed = false;
            if (this.isFeared === true) {
                const chance = Math.random() > 0.5;
                if (chance === true) {
                    this.statusCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Fear Broken', PLAYER.DURATIONS.TEXT, 'effect');
                };
            };
        };
        if (this.health < e.newPlayerHealth) {
            let heal = Math.round(e.newPlayerHealth - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, PLAYER.DURATIONS.TEXT, 'heal');
        }; 
    
        if (this.targets.length > 0) this.checkTargets(); // Was inside playerWin
        if (this.currentRound !== e.combatRound && this.scene.combat) {
            this.currentRound = e.combatRound;
            if (e.computerDamaged || e.playerDamaged || e.rollSuccess || e.parrySuccess || e.computerRollSuccess || e.computerParrySuccess) {
                this.soundEffects(e);
            };
        };
        if (e.computerParrySuccess === true) {
            this.stateMachine.setState(States.STUN);
            this.scene.combatMachine.input('computerParrySuccess', false);
            this.specialCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Parry', PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);    
        };
        if (e.rollSuccess === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Roll', PLAYER.DURATIONS.TEXT, 'heal', e.criticalSuccess);
        };
        if (e.parrySuccess === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Parry', PLAYER.DURATIONS.TEXT, 'heal', e.criticalSuccess);
            this.scene.stunned(e.enemyID);
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'attack');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'parry');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'posture');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'roll');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'dodge');
        };
        if (e.computerRollSuccess === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Roll', PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);
        };
        if (e.newComputerHealth <= 0 && e.playerWin === true) {
            if (this.isTshaering === true) this.isTshaering = false;
            if (this.tshaeringTimer !== undefined) {
                this.tshaeringTimer.remove(false);
                this.tshaeringTimer = undefined;
            };
            
            this.defeatedEnemyCheck(e.enemyID);
            // this.winningCombatText = new ScrollingCombatText(this.scene, this.x, this.y - 64, 'Victory', 1000, 'effect', true);    
        };
        if (e.computerWin === true) {
            this.anims.play('player_pray', true).on('animationcomplete', () => {
                this.anims.play('player_idle', true);
            });
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Defeat', PLAYER.DURATIONS.TEXT * 2, 'damage');
        };
        if (e.newPlayerHealth <= 0) {
            this.isDead = true;
            this.disengage();    
        };
        this.health = e.newPlayerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.playerHealth) this.healthbar.setTotal(e.playerHealth);
        if (e.playerAttributes.stamina > this.maxStamina) this.maxStamina = e.playerAttributes.stamina;
        if (this.inCombat === false) {
            if (this.scene.combat === true) {
                console.log(`Aligning Scene's combat to the Player's`);
                this.scene.combatEngaged(false);
            };
        };
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
                        return this.scene.sound.play('sorcery', { volume: this.scene.settings.volume });
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
                computerDamaged: false, playerDamaged: false, 
                glancingBlow: false, computerGlancingBlow: false,
                parrySuccess: false, computerParrySuccess: false, 
                rollSuccess: false, computerRollSuccess: false,
                criticalSuccess: false, computerCriticalSuccess: false,
                religiousSuccess: false,
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
        this.targets = this.targets.filter(obj => (obj.enemyID !== id && obj.inCombat === false));
        this.sendEnemies(this.targets);
        this.currentTarget = undefined;
        this.attacking = undefined;
        this.removeHighlight();

        this.scene.combatMachine.clear(id);
        if (this.targets.every(obj => !obj.inCombat)) {
            this.disengage();
        } else {
            // if (this.currentTarget.enemyID === id) { // Was targeting the id that was defeated
                const newTarget = this.targets.find(obj => obj.enemyID !== id);
                if (!newTarget) return;
                this.scene.setupEnemy(newTarget);
                this.setAttacking(newTarget);
                this.setCurrentTarget(newTarget);
                this.targetID = newTarget.enemyID;
                this.highlightTarget(newTarget);
            // }; 
        };
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
        // console.log(`%c Is Attack Target: ${this.attacking?.enemyID === enemy.enemyID}`, 'color: #ff0000');
        if (this.attacking?.enemyID === enemy.enemyID) {
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
                console.log(`%c New Rushed Enemy: ${newEnemy}`, 'color: #00f');
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
                    // if (this.isRushing) this.rushedEnemies.push(other.gameObjectB);
                    const isNewEnemy = this.isNewEnemy(other.gameObjectB);
                    // console.log(`%c Is New Enemy: ${isNewEnemy}`, 'color: #ff0000');
                    if (!isNewEnemy) return;
                    this.targets.push(other.gameObjectB);
                    this.shouldPlayerEnterCombat(other);
                    this.checkTargets();
                } else if (this.isValidNeutralCollision(other)) {
                    this.touching.push(other.gameObjectB);
                    this.isValidRushEnemy(other.gameObjectB);
                    // if (this.isRushing) this.rushedEnemies.push(other.gameObjectB);
                    other.gameObjectB.originPoint = new Phaser.Math.Vector2(other.gameObjectB.x, other.gameObjectB.y).clone();
                    const isNewNeutral = this.isNewEnemy(other.gameObjectB);
                    // console.log(`%c Is New Neutral: ${isNewNeutral}`, 'color: #ff0000')
                    if (!isNewNeutral) return;
                    this.targets.push(other.gameObjectB);
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
                    this.checkTargets(); // Was outside of if statement
                } else if (this.isValidNeutralCollision(other) && !this.touching.length) {
                    this.actionAvailable = false;
                    this.triggeredActionAvailable = undefined;
                    this.checkTargets();
                };
            },
            context: this.scene,
        });
    };

    checkWorldCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                // console.log(other, 'World');
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'tent') {
                        EventBus.emit('alert', { 
                            header: 'Tent', 
                            body: `You have encountered a tent! \n Would you like to enter?`, 
                            delay: 3000, 
                            key: 'Enter Tent'
                        });
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'worldExit') {
                    // if (other.gameObjectB.isTent) {
                        EventBus.emit('alert', { 
                            header: 'Exit', 
                            body: `You are near the exit. \n Would you like to head back to the world?`, 
                            delay: 3000, 
                            key: 'Exit World'
                        });
                    // };
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
        const offset = Phaser.Physics.Matter.Matter.Vector.mult(other.pair.collision.normal, other.pair.collision.depth);
        return Phaser.Physics.Matter.Matter.Vector.add(bodyPosition, offset);
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
        if (this.isRanged === true && this.inCombat === true) {
            const correct = this.getEnemyDirection(this.currentTarget);
            if (!correct) {
                console.log(`%c Error (Attack): You are not looking at nor targeting an enemy.`, 'color: #ff0000');
                return;
            };
        };
        this.isAttacking = true;
        this.swingReset(States.ATTACK, true);
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
        this.swingReset(States.PARRY, true);
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
            this.scene.combatMachine.input('action', '');
        };
    };

    onPostureEnter = () => {
        if (this.isRanged === true) {
            if (this.isMoving === true) { // The || needs to be a check that the player is 'looking at' the enemy
                console.log(`%c Error (Posture): You are moving. Please Stand Still.`, 'color: #ff0');
                return;
            };
            const correct = this.getEnemyDirection(this.currentTarget);
            if (!correct && this.inCombat === true) {
                console.log(`%c Error (Posture): You are not looking at nor targeting an enemy.`, 'color: #f00');
                return;
            };
        };
        this.isPosturing = true;
        this.swingReset(States.POSTURE, true);
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
        if (this.isStalwart || this.isStorming) return;
        this.isDodging = true;
        this.swingReset(States.DODGE, true);
        this.swingReset(States.ROLL);
        this.scene.useStamina(PLAYER.STAMINA.DODGE);
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
        if (this.isStalwart || this.isStorming) return;
        this.isRolling = true;
        this.swingReset(States.ROLL, true);
        this.swingReset(States.DODGE);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.ROLL);
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

    onArcEnter = () => {
        // if (!this.inCombat) return;
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
        if (Math.abs(this.velocity.x) || Math.abs(this.velocity.y)) {
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
        if (!this.inCombat) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.MODERATE) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.isChiomic = true;
        this.scene.useStamina(PLAYER.STAMINA.KYRNAICISM);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
        this.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
        this.scene.slow(this.scene.state?.enemyID);
        this.chiomicTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.isChiomic || this.scene.state.playerWin || this.scene.state.newComputerHealth <= 0) {
                    this.isChiomic = false;
                    this.chiomicTimer.remove(false);
                    this.chiomicTimer = undefined;
                    return;
                };
                this.scene.combatMachine.action({ type: 'Chiomic', data: 10 });
                // updateBeam(this.scene.time.now);
            },
            callbackScope: this,
            repeat: 3,
        });
        this.setTimeEvent('kyrnaicismCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
                this.isChiomic = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.setStatic(true);
        this.castbar.setVisible(true);  
    };
    onKyrnaicismUpdate = (dt) => {
        this.combatChecker(this.isChiomic);
        if (this.isChiomic) this.castbar.update(dt, 'channel', 0xA700FF);
    };
    onKyrnaicismExit = () => {
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
        this.setStatic(false);
        if (this.chiomicTimer) {
            this.chiomicTimer.remove(false);
            this.chiomicTimer = undefined;
        };
        // if (this.beamTimer) {
        //     this.beamTimer.remove();
        //     this.beamTimer = undefined;
        // };
        // this.chiomicGraphic.destroy();
        // this.chiomicGraphic = undefined;
    };

    onConfuseEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.CONFUSE);
        this.isConfusing = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true); // !this.isCaerenic && 
        this.castbar.setVisible(true);  
    };
    onConfuseUpdate = (dt) => {
        if (this.isMoving === true) this.isConfusing = false;
        this.combatChecker(this.isConfusing);
        if (this.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
            this.confuseSuccess = true;
            this.isConfusing = false;
        };
        if (this.isConfusing === true) this.castbar.update(dt, 'cast');
    };
    onConfuseExit = () => {
        if (this.confuseSuccess === true) {
            this.scene.confuse(this.attacking?.enemyID);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You confuse ${this.scene.state.computer?.name}, and they stumble around in a daze.`
            });
            this.setTimeEvent('confuseCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.confuseSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.CONFUSE);    
        };
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
        this.combatChecker(this.isFreezing);
    };
    onDesperationExit = () => {
        const desperationCooldown = this.inCombat ? PLAYER.COOLDOWNS.LONG : PLAYER.COOLDOWNS.SHORT;
        this.setTimeEvent('desperationCooldown', desperationCooldown);  
        EventBus.emit('initiate-combat', { data: { key: 'player', value: 50, id: this.playerID }, type: 'Health' });
        this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
    };

    onFearingEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Fearing', PLAYER.DURATIONS.FEAR / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FEAR);
        this.isFearing = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);  
    };
    onFearingUpdate = (dt) => {
        if (this.isMoving === true) this.isFearing = false;
        this.combatChecker(this.isFearing);
        if (this.castbar.time >= PLAYER.DURATIONS.FEAR) {
            this.fearSuccess = true;
            this.isFearing = false;
        };
        if (this.isFearing === true) this.castbar.update(dt, 'cast');
    };
    onFearingExit = () => {
        if (this.fearSuccess === true) {
            this.scene.fear(this.attacking?.enemyID);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You strike fear into ${this.scene.state.computer?.name}!`
            });
            this.setTimeEvent('fearCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.fearSuccess = false;
            this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
            this.scene.useStamina(PLAYER.STAMINA.FEAR);    
        };
        this.castbar.reset();
        if (this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onFreezeCastEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Freezing', PLAYER.DURATIONS.FREEZE / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FREEZE);
        this.isFreezing = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true); 
    };
    onFreezeCastUpdate = (dt) => {
        if (this.isMoving === true) this.isFreezing = false;
        this.combatChecker(this.isFreezing);
        if (this.castbar.time >= PLAYER.DURATIONS.FREEZE) {
            this.freezeSuccess = true;
            this.isFreezing = false;
        };
        if (this.isFreezing === true) this.castbar.update(dt, 'cast');
    };
    onFreezeCastExit = () => {
        if (this.freezeSuccess === true) {
            // this.scene.freeze(this.attacking?.enemyID);
            this.setTimeEvent('freezeCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this.scene.useStamina(PLAYER.STAMINA.FREEZE_CAST);
        this.freezeSuccess = false;
            this.scene.mysterious.play();
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onHealingEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.HEALING);
        this.isHealing = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);  
    };
    onHealingUpdate = (dt) => {
        if (this.isMoving === true) this.isHealing = false;
        this.combatChecker(this.isHealing);
        if (this.castbar.time >= PLAYER.DURATIONS.HEALING) {
            this.healingSuccess = true;
            this.isHealing = false;
        };
        if (this.isHealing === true) this.castbar.update(dt, 'cast', 0x00C200);
    };
    onHealingExit = () => {
        if (this.healingSuccess === true) {
            this.setTimeEvent('healingCooldown', this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
            this.scene.useStamina(PLAYER.STAMINA.HEALING);
            this.healingSuccess = false;
            EventBus.emit('initiate-combat', { data: { key: 'player', value: 25, id: this.playerID }, type: 'Health' });
            this.scene.sound.play('phenomena', { volume: this.scene.settings.volume });
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false); // !this.isCaerenic && 
    };

    onInvokeEnter = () => {
        if (!this.inCombat) return;
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
        if (!this.inCombat) return;
        this.setStatic(false);
        // if (this.isGlowing) this.checkCaerenic(false); // !this.isCaerenic && 
        this.scene.combatMachine.action({ type: 'Instant', data: this.scene.state.playerBlessing });
        this.scene.sound.play('prayer', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.INVOKE);
    };

    onLeapEnter = () => {
        this.isLeaping = true;
        const pointer = this.scene.rightJoystick.pointer;
        const worldX = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).x;
        const worldY = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).y;
        const target = new Phaser.Math.Vector2(worldX, worldY);
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
                        this.scene.writhe(enemy.enemyID);
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
        // this.originalLeapPosition = undefined;
        // this.leapPointer = undefined;
        const leapCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('leapCooldown', leapCooldown);
    };

    onRushEnter = () => {
        this.isRushing = true;
        // this.originalRushPosition = new Phaser.Math.Vector2(this.x, this.y);
        // this.leapPointer = this.scene.rightJoystick.pointer;
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });        
        const pointer = this.scene.rightJoystick.pointer;
        const worldX = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).x;
        const worldY = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).y;
        const target = new Phaser.Math.Vector2(worldX, worldY);
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
                // console.log(this.rushedEnemies, this.rushedEnemies.length, 'Rushed Enemies');
                if (this.rushedEnemies.length > 0 && this.inCombat === true) {
                    this.rushedEnemies.forEach(enemy => {
                        // console.log(`%c Rushed Enemy: ${enemy.enemyID}`, 'color: #ff0000');
                        this.scene.writhe(enemy.enemyID);
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
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.POLYMORPH);
        this.isPolymorphing = true;
        if (!this.isCaerenic && !this.isGlowing) this.checkCaerenic(true);
        this.castbar.setVisible(true);  
    };
    onPolymorphingUpdate = (dt) => {
        if (this.isMoving === true) this.isPolymorphing = false;
        this.combatChecker(this.isPolymorphing);
        if (this.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
            this.polymorphSuccess = true;
            this.isPolymorphing = false;
        };
        if (this.isPolymorphing === true) this.castbar.update(dt, 'cast');
    };
    onPolymorphingExit = () => {
        if (this.polymorphSuccess === true) {
            this.scene.polymorph(this.attacking?.enemyID);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, polymorphing them!`
            });
            this.setTimeEvent('polymorphCooldown', PLAYER.COOLDOWNS.SHORT);  
            this.scene.useStamina(PLAYER.STAMINA.POLYMORPH);
            this.polymorphSuccess = false;
            this.scene.mysterious.play();
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onPursuitEnter = () => {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
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


    onRangedStunEnter = () => {};
    onRangedStunUpdate = (_dt) => {};
    onRangedStunExit = () => {};

    onRootingEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.isRooting = true;
        this.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Rooting', PLAYER.DURATIONS.ROOTING / 2, 'cast');
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true);
    };
    onRootingUpdate = (dt) => {
        if (this.isMoving === true) this.isRooting = false;
        this.combatChecker(this.isRooting);
        if (this.castbar.time >= PLAYER.DURATIONS.ROOTING) {
            this.rootingSuccess = true;
            this.isRooting = false;
        };
        if (this.isRooting === true) this.castbar.update(dt, 'cast');
    };
    onRootingExit = () => { 
        if (this.inCombat === false) return;
        if (this.rootingSuccess) {
            this.scene.root();
            this.setTimeEvent('rootCooldown', PLAYER.COOLDOWNS.SHORT); 
            this.scene.useStamina(PLAYER.STAMINA.ROOT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, rooting them!`
            });
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    onSlowEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.isSlowing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Slow', 750, 'cast');
        this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        this.scene.slow(this.attacking?.enemyID);
        this.scene.useStamina(PLAYER.STAMINA.SLOW);
        this.setTimeEvent('slowCooldown', PLAYER.COOLDOWNS.SHORT); 
        this.flickerCarenic(500); 
        this.scene.time.delayedCall(500, () => { 
            this.isSlowing = false;
        });
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, slowing them!`
        });
    };
    onSlowUpdate = (_dt) => {
        this.combatChecker(this.isSlowing);
    };
    onSlowExit = () => {};

    onSacrificeEnter = () => {
        if (!this.inCombat) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.MODERATE) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.isSacrificing = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Sacrifice', 750, 'effect');
        this.scene.sound.play('combat-round', { volume: this.scene.settings.volume });
        this.scene.useStamina(PLAYER.STAMINA.SACRIFICE);
        this.scene.combatMachine.action({ type: 'Sacrifice', data: undefined });
        this.setTimeEvent('sacrificeCooldown', PLAYER.COOLDOWNS.MODERATE);
        this.flickerCarenic(500);  
        this.scene.time.delayedCall(500, () => { 
            this.isSacrificing = false;
        });
    };
    onSacrificeUpdate = (_dt) => {
        this.combatChecker(this.isSacrificing);
    };
    onSacrificeExit = () => {};

    onSnaringEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.LONG) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Snaring', PLAYER.DURATIONS.SNARE, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.SNARE);
        this.isSnaring = true;
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.castbar.setVisible(true); 
    };
    onSnaringUpdate = (dt) => {
        if (this.isMoving === true) this.isSnaring = false;
        this.combatChecker(this.isSnaring);
        if (this.castbar.time >= PLAYER.DURATIONS.SNARE) {
            this.snaringSuccess = true;
            this.isSnaring = false;
        };
        if (this.isSnaring === true) this.castbar.update(dt, 'cast');
    };
    onSnaringExit = () => {
        // if (!this.inCombat) return;
        if (this.snaringSuccess === true) {
            this.setTimeEvent('snareCooldown', PLAYER.DURATIONS.SHORT);
            EventBus.emit('special-combat-text', {
                playerSpecialDescription: `You ensorcel ${this.scene.state.computer?.name}, snaring them!`
            });
            this.scene.useStamina(PLAYER.STAMINA.SNARE);
            this.scene.snare(this.attacking.enemyID);
            this.snaringSuccess = false;
            this.scene.sound.play('debuff', { volume: this.scene.settings.volume });
        };
        this.castbar.reset();
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    // Spins and attacks all enemies in range 3 times in 3 seconds.
    onStormEnter = () => {
        this.isStorming = true;
        this.originalLeapPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.stormPointer = this.scene.rightJoystick.pointer;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Storming', 750, 'effect');
        const pointer = this.scene.rightJoystick.pointer;
        const worldX = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).x;
        const worldY = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).y;
        const target = new Phaser.Math.Vector2(worldX, worldY);
        const direction = target.subtract(this.position);
        // const length = direction.length();
        direction.normalize();
        this.flipX = direction.x < 0;
        this.isAttacking = true;
        this.scene.useStamina(PLAYER.STAMINA.STORM);
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 750,
            onStart: () => {
                this.flickerCarenic(3000); 
            },
            onLoop: () => {
                console.log('Storming!');
                if (this.inCombat === false) return;
                this.isAttacking = true;
                this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Storming', 750, 'effect');
                if (this.touching.length > 0) {
                    this.touching.forEach(enemy => {
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
        this.originalLeapPosition = undefined;
        this.stormPointer = undefined;
        const stormCooldown = this.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
        this.setTimeEvent('stormCooldown', stormCooldown);
        // if (!this.isCaerenic && this.isGlowing) this.checkCaerenic(false);
    };

    onSutureEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.MODERATE) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
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

    onTshaeralEnter = () => {
        if (this.inCombat === false) return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
        if (distance > PLAYER.RANGE.MODERATE) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
            return;    
        };
        this.isTshaering = true;
        this.attacking.isConsumed = true;
        this.scene.useStamina(PLAYER.STAMINA.TSHAERAL);
        this.scene.sound.play('absorb', { volume: this.scene.settings.volume });
        this.flickerCarenic(2000); 
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Tshaering', PLAYER.DURATIONS.TSHAERAL / 2, 'damage');
        this.castbar.setTotal(PLAYER.DURATIONS.TSHAERAL);
        this.castbar.setTime(PLAYER.DURATIONS.TSHAERAL);
        this.tshaeringTimer = this.scene.time.addEvent({
            delay: 250,
            callback: () => {
                if (this.isTshaering === false || this.scene.state.playerWin === true || this.scene.state.newComputerHealth <= 0) {
                    this.isTshaering = false;
                    this.tshaeringTimer.remove(false);
                    this.tshaeringTimer = undefined;
                    return;
                };
                this.scene.combatMachine.action({ type: 'Tshaeral', data: 3 });
            },
            callbackScope: this,
            repeat: 8,
        });
        this.setTimeEvent('tshaeralCooldown', PLAYER.COOLDOWNS.LONG);
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.isTshaering = false;
            },
            callbackScope: this,
            loop: false,
        });
        this.setStatic(true);
        this.castbar.setVisible(true); 
    };
    onTshaeralUpdate = (dt) => {
        this.combatChecker(this.isTshaering);
        if (this.isTshaering === true) this.castbar.update(dt, 'channel', 0xA700FF);
    };
    onTshaeralExit = () => {
        this.castbar.reset(); 
        this.setStatic(false);
        if (this.tshaeringTimer !== undefined) {
            this.tshaeringTimer.remove(false);
            this.tshaeringTimer = undefined;
        };
    };

    // ================= META MACHINE STATES ================= \\

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onChiomicEnter = () => {
        if (this.inCombat === false) return;
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
    onChioimicExit = () => {};

    onDiseaseEnter = () => {
        if (this.inCombat === false) return;
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
        // this.combatChecker(this.isDiseasing);
        if (this.isDiseasing === false) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onDiseaseExit = () => {};

    onHowlEnter = () => {
        if (this.inCombat === false) return;
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
        if (this.inCombat === false) return;
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
        if (this.inCombat === false) return;
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
        // this.combatChecker(this.isFreezing);
        if (!this.isFreezing) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onFreezeExit = () => {
        if (this.inCombat === false) return;
        this.setTimeEvent('freezeCooldown', PLAYER.COOLDOWNS.SHORT);
    };

    onMaliceEnter = () => {
        if (this.inCombat === false) return;
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
        EventBus.emit('initiate-combat', { data: 10, type: 'Chiomic' });
        this.maliceBubble.setCharges(this.maliceBubble.charges - 1);
        if (this.maliceBubble.charges <= 0) {
            this.isMalicing = false;
        };
    };

    onMendEnter = () => {
        if (this.inCombat === false) return;
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
        // this.combatChecker(this.isMending);
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
        EventBus.emit('initiate-combat', { data: { key: 'player', value: 15, id: this.playerID }, type: 'Health' });
        this.mendBubble.setCharges(this.mendBubble.charges - 1);
        if (this.mendBubble.charges <= 0) {
            this.isMending = false;
        };
    };

    onProtectEnter = () => {
        if (this.inCombat === false) return;
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
        if (this.inCombat === false) return;
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
        if (this.inCombat === false) return;
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
        if (this.inCombat === false) return;
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
        // this.combatChecker(this.isScreaming);
        if (!this.isScreaming) {
            this.metaMachine.setState(States.CLEAN);
        };
    };
    onScreamExit = () => {
        if (this.inCombat === false) return;
        this.setTimeEvent('screamCooldown', PLAYER.COOLDOWNS.SHORT);  
    };

    onShieldEnter = () => {
        if (this.inCombat === false) return;
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
        // this.combatChecker(this.isShielding);
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
                object.setBlendMode(Phaser.BlendModes.SCREEN);
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
                object.setBlendMode(Phaser.BlendModes.NORMAL);
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
        if (!this.inCombat) return;
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
        // this.combatChecker(this.isWarding);
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

    wardHit = () => {
        if (this.wardBubble === undefined || this.isWarding === false) {
            if (this.wardBubble) {
                this.wardBubble.destroy();
                this.wardBubble = undefined;
            };
            this.isWarding = false;
            return;
        };
        this.scene.sound.play('parry', { volume: this.scene.settings.volume });
        this.scene.stunned(this.attacking?.enemyID);
        this.wardBubble.setCharges(this.wardBubble.charges - 1);
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Warded', 500, 'effect');
        if (this.wardBubble.charges <= 3) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Ward Broken', 500, 'damage');
            this.wardBubble.setCharges(0);
            this.isWarding = false;
        };
    };

    onWritheEnter = () => {
        if (!this.inCombat) return;
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
            const move = Phaser.Math.Between(1, 100);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Phaser.Math.Between(0, 3)];
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
        if (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0) {
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
            const move = Phaser.Math.Between(1, 100);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Phaser.Math.Between(0, 3)];
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
        if (Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0) {
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
                this.metaMachine.setState(States.CLEAN);
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
            const move = Phaser.Math.Between(1, 100);
            const directions = ['up', 'down', 'left', 'right'];
            const direction = directions[Phaser.Math.Between(0, 3)];
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
            this.metaMachine.setState(States.CLEAN);
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
            this.metaMachine.setState(States.CLEAN);
        });
    };
    // onSnaredUpdate = (dt) => {};
    onSnaredExit = () => { 
        this.clearTint();
        this.setTint(0x000000);
        this.adjustSpeed(PLAYER.SPEED.SNARE);
    };

    // ================= SET TIME EVENT ================= \\

    setTimeEvent = (cooldown, limit = 30000) => {
        const evasion = cooldown === 'rollCooldown' || cooldown === 'dodgeCooldown' 
        if (!evasion) {
            this[cooldown] = limit;
        };
        const type = cooldown.split('Cooldown')[0];
        this.scene.actionBar.setCurrent(0, limit, type);
        const button = this.scene.actionBar.getButton(type);
        // this.scene.actionBar.cooldownButton(button, limit / 1000);
        // console.log('Button:', button);
        if (this.inCombat || type === 'blink' || type || 'desperation') {
            this.scene.time.delayedCall(limit, () => {
                this.scene.actionBar.setCurrent(limit, limit, type);
                this.scene.actionBar.animateButton(button);
                if (!evasion) {
                    this[cooldown] = 0;
                };
            }, undefined, this);
            // let current = 0;
            // const timer = this.scene.time.addEvent({
            //     delay: 1000,
            //     callback: () => {
            //         current += 1000;
            //         this.scene.actionBar.setCurrent(current, limit, type);
            //         if (current >= limit) {
            //             if (!evasion) {
            //                 this[cooldown] = 0;
            //             };
            //             this.scene.actionBar.animateButton(button);
            //             timer.destroy();
            //         };
            //     },
            // });
        } else {
            this.scene.actionBar.setCurrent(limit, limit, type);
            if (!evasion) {
                this[cooldown] = 0;
            };
        };
    };

    swingReset = (type, primary = false) => {
        this.canSwing = false;
        const time = 
            (type === 'dodge' || type === 'parry' || type === 'roll') ? 750 : 
            this.isAttacking === true ? this.swingTimer : 
            this.isPosturing === true ? this.swingTimer - 250 :
            this.swingTimer;
        const button = this.scene.actionBar.getButton(type);
        this.scene.actionBar.setCurrent(0, time, type);
        // this.scene.actionBar.cooldownButton(button, time / 1000);
        
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
                // if (!this.isCaerenic && this.isGlowing) 
                this.checkCaerenic(false);
            });
        };
    };

    checkTargets = () => {
        const playerCombat = this.isPlayerInCombat();
        this.targets = this.targets.filter(gameObject => {
            if (gameObject.npcType && playerCombat === true) {
                this.scene.combatEngaged(false);
                this.inCombat = false;
            };
            
            if (playerCombat === true && (
                // (gameObject !== this.currentTarget && gameObject.inCombat !== true) ||
                // gameObject.inCombat === false || 
                gameObject.isDefeated === true ||
                gameObject.isTriumphant === true ||
                gameObject.isLuckout === true ||
                gameObject.isPersuaded === true
            )) {
                return false;
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
        const newTarget = this.targets[currentTargetIndex + 1] || this.targets[0];
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
            if (this?.attackedTarget?.isShimmering) {
                const shimmer = Phaser.Math.Between(1, 100);
                if (shimmer > 50) {
                    this?.attackedTarget?.shimmerHit();
                    return;
                };
            };
            if (this.attackedTarget?.isProtecting || this.attackedTarget?.isShielding || this.attackedTarget?.isWarding) {
                if (this.attackedTarget?.isShielding) {
                    this.attackedTarget?.shieldHit();
                };
                if (this.attackedTarget?.isWarding) {
                    this.attackedTarget?.wardHit();
                };
                return;    
            };
            if (this?.attackedTarget?.isMalicing) {
                this?.attackedTarget?.maliceHit();
            };
            if (this?.attackedTarget?.isMending) {
                this?.attackedTarget?.mendHit();
            };
            const match = this.enemyIdMatch();
            if (match) { // Target Player Attack
                this.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: action } });
            } else { // Blind Player Attack
                let blindStrike = false;
                if (this.inCombat === false || !this.attacking || !this.currentTarget || this.scene.combat === false) {
                    // Jump player into combat
                    blindStrike = true;
                };
                this.scene.combatMachine.action({ type: 'Player', data: { 
                    playerAction: { action: action, parry: this.scene.state.parryGuess }, 
                    enemyID: this.attackedTarget.enemyID, 
                    ascean: this.attackedTarget.ascean, 
                    damageType: this.attackedTarget.currentDamageType, 
                    combatStats: this.attackedTarget.combatStats, 
                    weapons: this.attackedTarget.weapons, 
                    health: this.attackedTarget.health, 
                    actionData: { action: this.attackedTarget.currentAction, parry: this.attackedTarget.parryAction },
                    blindStrike: blindStrike
                }});
            };
        };
        // if (this.actionTarget && !this.isRanged) this.knockback(this.actionTarget); // actionTarget
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
    handleActions = () => {
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
        };

        // ========================= Player Movement Actions ========================= \\
        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.roll.THREE) && this.stamina >= PLAYER.STAMINA.ROLL && this.movementClear()) {
            this.stateMachine.setState(States.ROLL);
        };

        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.dodge.FOUR) && this.stamina >= PLAYER.STAMINA.DODGE && this.movementClear()) {
            this.stateMachine.setState(States.DODGE);
        };

    };

    handleAnimations = () => {
        if (this.isStunned) {
            this.setVelocity(0);
        } else if (this.isHurt) {
            this.anims.play('player_hurt', true).on('animationcomplete', () => this.isHurt = false);  
        } else if (this.isPolymorphed) {
            this.anims.play(`rabbit_${this.polymorphMovement}_${this.polymorphDirection}`, true);
        } else if (this.isParrying) {
            this.anims.play('player_attack_2', true).on('animationcomplete', () => this.isParrying = false);
        } else if (this.isDodging) { 
            this.anims.play('player_slide', true);
            this.spriteWeapon.setVisible(false);
            if (this.dodgeCooldown === 0) this.playerDodge();
        } else if (this.isRolling) { 
            this.anims.play('player_roll', true);
            sprint(this.scene);
            this.spriteWeapon.setVisible(false);
            if (this.rollCooldown === 0) this.playerRoll();
        } else if (this.isPosturing) {
            sprint(this.scene);
            this.anims.play('player_attack_3', true).on('animationcomplete', () => this.isPosturing = false);
        } else if (this.isAttacking) {
            sprint(this.scene);
            this.anims.play('player_attack_1', true).on('animationcomplete', () => this.isAttacking = false); 
        } else if ((Math.abs(this.body.velocity.x) > 0.1 || Math.abs(this.body.velocity.y) > 0.1)) {
            // walk(this.scene);
            if (!this.isWalking) {
                this.isWalking = this.scene.time.delayedCall(500, () => {
                    walk(this.scene);
                    this.isWalking = undefined;
                }, undefined, this);
            };
            if (!this.isMoving) this.isMoving = true;
            this.anims.play('player_running', true);
        } else if (this.isConsuming) { 
            this.anims.play('player_health', true).on('animationcomplete', () => this.isConsuming = false);
        } else if (this.isPolymorphing || this.isFearing || this.isFreezing || this.isHealing || this.isSlowing || this.isSnaring) { 
            this.anims.play('player_health', true);
        } else if (this.isChiomic || this.isTshaering) {
            this.anims.play('player_pray', true);
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
        if (this.actionSuccess === true) {
            this.actionSuccess = false;
            this.playerActionSuccess();
        };
        if (this.particleEffect) { 
            if (this.particleEffect.success) {
                this.particleEffect.success = false;
                this.particleEffect.triggered = true;
                this.playerActionSuccess();
            } else {
                this.scene.particleManager.update(this, this.particleEffect);
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
        if (this.isFrozen && !this.metaMachine.isCurrentState(States.FROZEN)) {
            this.metaMachine.setState(States.FROZEN);
            return;
        };
        if (this.isPolymorphed && !this.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if (this.isSlowed && !this.metaMachine.isCurrentState(States.SLOWED)) {
            this.metaMachine.setState(States.SLOWED);
            return;
        };
        if (this.isSnared && !this.metaMachine.isCurrentState(States.SNARED)) {
            this.metaMachine.setState(States.SNARED); 
            return;    
        };
        if (this.isStunned && !this.stateMachine.isCurrentState(States.STUN)) {
            this.stateMachine.setState(States.STUN);
            return;
        };

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
            
        if (this.inCombat && !this.healthbar.visible) this.healthbar.setVisible(true);
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText) this.scrollingCombatText.update(this);
        if (this.winningCombatText) this.winningCombatText.update(this);
        if (this.specialCombatText) this.specialCombatText.update(this); 
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

        if (this.inputKeys.strafe.E.isDown || (this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x > 0)) {
            // this.playerVelocity.x = speed; 
            // this.playerVelocity.x += 0.1; 
            speed += 0.1;
            if (!this.flipX) this.flipX = true;
        };
        if (this.inputKeys.strafe.Q.isDown || (this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x < 0)) {
            // this.playerVelocity.x = -speed;
            // this.playerVelocity.x -= 0.1;
            speed -= 0.1;    
            if (this.flipX) this.flipX = false;
        };

        // ========================= Twisting ========================= \\

        // if (this.holdingBothMouseButtons) {
        //     this.flipX = this.body.velocity.x < 0;
        //     this.playerVelocity.x += Math.cos(this.angle) + this.acceleration;
        //     this.playerVelocity.y += Math.sin(this.angle) + this.acceleration; 
        // };

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

        // if (this.inputKeys.strafe.E.isDown || this.inputKeys.strafe.Q.isDown) {
        //     // if (!this.spriteShield.visible && !this.isDodging && !this.isRolling) this.spriteShield.setVisible(true);
        //     this.isStrafing = true;
        // } else if (this.isStrafing) {
        //     this.isStrafing = false;
        //     this.strafingLeft = false;
        //     this.strafingRight = false;
        // };
        
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