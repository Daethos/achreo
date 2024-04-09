import Phaser from "phaser";
import Entity, { FRAME_COUNT } from "./Entity";  
import { screenShake, walk } from "../phaser/ScreenShake";
import StateMachine, { States } from "../phaser/StateMachine";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import HealthBar from "../phaser/HealthBar";
import { EventBus } from "../game/EventBus";
import CastingBar from "../phaser/CastingBar";
import Joystick from "../phaser/Joystick";

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
        BLINK: 200,
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
        ATTACK: 35,
        COUNTER: 15,
        DODGE: 15, // 25
        POSTURE: 25,
        ROLL: 15, // 25
        TSHAER: 35,
        BLINK: 15,
        INVOKE: -15,
        ROOT: 15,
        SNARE: 15,
        POLYMORPH: 15,
        HEALING: 25,
        FEARING: 15,
    },
    DURATIONS: {
        FEARING: 1000,
        HEALING: 1500,
        POLYMORPHING: 1500,
        STUNNED: 2500,
        TSHAERING: 2000,
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
        case 'counter':
            const counterSuccess = stamina >= PLAYER.STAMINA.COUNTER;
            return {
                success: counterSuccess,
                cost: PLAYER.STAMINA.COUNTER,
            };
        case 'blink':
            const blinkSuccess = stamina >= PLAYER.STAMINA.BLINK;
            return {
                success: blinkSuccess,
                cost: PLAYER.STAMINA.BLINK,
            };
        case 'fear':
            const fearingSuccess = stamina >= PLAYER.STAMINA.FEARING;
            return {
                success: fearingSuccess,
                cost: PLAYER.STAMINA.FEARING,
            };
        case 'healing':
            const healingSuccess = stamina >= PLAYER.STAMINA.HEALING;
            return {
                success: healingSuccess,
                cost: PLAYER.STAMINA.HEALING,
            };
        case 'invoke':
            const invokeSuccess = stamina >= PLAYER.STAMINA.INVOKE;
            console.log(`Invoke Success: ${invokeSuccess}`)
            return { 
                success: invokeSuccess,
                cost: PLAYER.STAMINA.INVOKE,
            };
        case 'polymorph':
            const polymorphSuccess = stamina >= PLAYER.STAMINA.POLYMORPH;
            console.log(`Polymorph Success: ${polymorphSuccess}`)
            return {
                success: polymorphSuccess,
                cost: PLAYER.STAMINA.POLYMORPH,
            };
        case 'root':
            const rootSuccess = stamina >= PLAYER.STAMINA.ROOT;
            console.log(`Root Success: ${rootSuccess}`)
            return {
                success: rootSuccess,
                cost: PLAYER.STAMINA.ROOT,
            };
        case 'snare':
            const snareSuccess = stamina >= PLAYER.STAMINA.SNARE;
            console.log(`Snare Success: ${snareSuccess}`)
            return {
                success: snareSuccess,
                cost: PLAYER.STAMINA.SNARE,
            };
        case 'tshaeral':
            const tshaerSuccess = stamina >= PLAYER.STAMINA.TSHAER;
            console.log(`Tshaer Success: ${tshaerSuccess}`)
            return {
                success: tshaerSuccess,
                cost: PLAYER.STAMINA.TSHAER,
            };
        default:
            console.log('No Input')
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
        this.setTint(0x000000);
        const weapon = scene?.state?.player?.weaponOne;
        this.currentWeaponSprite = this.assetSprite(weapon);
        this.ascean = scene.state.player;
        this.playerID = scene.state.player._id;
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

        this.currentShieldSprite = this.assetSprite(scene?.state?.player?.shield);
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
            .addState(States.COUNTER, {
                onEnter: this.onCounterEnter,
                onUpdate: this.onCounterUpdate,
                onExit: this.onCounterExit,
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
                onEnter: this.onPrayerEnter,
                onUpdate: this.onPrayerUpdate,
                onExit: this.onPrayerExit,
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

        this.metaMachine.setState(States.CLEAN);
        
        this.sensorDisp = PLAYER.SENSOR.DISPLACEMENT;
        this.colliderDisp = PLAYER.COLLIDER.DISPLACEMENT;
        this.stealthFx = this.scene.sound.add('stealth', { volume: this.scene.gameState.soundEffectVolume, loop: false });
        this.caerenicFx = this.scene.sound.add('caerenic', { volume: this.scene.gameState.soundEffectVolume, loop: false });
        this.stalwartFx = this.scene.sound.add('stalwart', { volume: this.scene.gameState.soundEffectVolume, loop: false });
        this.prayerFx = this.scene.sound.add('prayer', { volume: this.scene.gameState.soundEffectVolume, loop: false });

        this.joystick = new Joystick(this.scene, window.innerWidth * 0.05, window.innerHeight * 0.8);
        this.rightJoystick = new Joystick(this.scene, window.innerWidth * 0.95, window.innerHeight * 0.8);
        this.rightJoystick.createPointer(this.scene); 

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

        this.setFixedRotation();   
        this.checkEnemyCollision(playerSensor);
        this.playerStateListener();
        this.checkLootdropCollision(playerSensor);
        this.checkNpcCollision(playerSensor);
        this.stealthListener();
        this.caerenicListener();
        this.stalwartListener();
        this.enemyListener();
        this.tabListener();
        this.speedListener();
    };   

    speedListener = () => {
        EventBus.on('speed', (ascean) => {
            this.speed = this.startingSpeed(ascean);
        });
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
            x: this.x, y: this.y, flipX: this.flipX, attacking: this.isAttacking, countering: this.isCountering,
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
    }; 

    disengage = () => {
        this.inCombat = false;
        this.attacking = undefined;
        this.currentTarget = undefined;
        this.scene.clearNAEnemy();
        this.removeHighlight();
        this.scene.combatEngaged(false);
    };

    constantUpdate = (e) => {
        if (this.health > e.newPlayerHealth) {
            // this.isHurt = true;
            // this.clearAnimations();
            let damage = Math.round(this.health - e.newPlayerHealth);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, damage, 1500, 'damage', e.computerCriticalSuccess);
            console.log(`%c ${damage} Damage Taken by ${e?.computer?.name}`, 'color: #ff0000')
        };
        if (this.health < e.newPlayerHealth) {
            let heal = Math.round(e.newPlayerHealth - this.health);
            this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, heal, 1500, 'heal');
        }; 
    
        if (this.currentRound !== e.combatRound && this.scene.combat) {
            this.currentRound = e.combatRound;
            if (this.targets.length) this.checkTargets(); // Was inside playerWin
            if (e.computerDamaged || e.playerDamaged) {
                this.soundEffects(e);
            };
        };
        this.health = e.newPlayerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.playerHealth) this.healthbar.setTotal(e.playerHealth);
        if (e.newPlayerHealth <= 0) {
            // this.isDead = true;
            this.inCombat = false;
            this.attacking = undefined;
            this.anims.play('player_pray', true).on('animationcomplete', () => {
                this.anims.play('player_idle', true);
            });
        };
        this.checkWeapons(e.weapons[0], e.playerDamageType.toLowerCase());
    };

    eventUpdate = (e) => {
        if (e.computerCounterSuccess) {
            this.stateMachine.setState(States.STUN);
            this.scene.combatMachine.input('computerCounterSuccess', false);
            this.specialCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Counter', 1500, 'damage', e.computerCriticalSuccess);    
        };
        if (e.rollSuccess) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Roll', 1500, 'heal', e.criticalSuccess);
        };
        if (e.counterSuccess) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Counter', 1500, 'heal', e.criticalSuccess);
        };
        if (e.computerRollSuccess) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.attacking?.position?.x, this.attacking?.position?.y, 'Roll', 1500, 'damage', e.computerCriticalSuccess);
        };
        if (e.newComputerHealth <= 0 && e.playerWin) {
            if (this.isTshaering) this.isTshaering = false;
            if (this.tshaeringTimer) {
                this.tshaeringTimer.remove(false);
                this.tshaeringTimer = undefined;
            };
            
            this.defeatedEnemyCheck(e.enemyID);
            
            this.winningCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Victory', 3000, 'effect', true);    
        };
    };

    soundEffects(sfx) {
        try {
            console.log(sfx.computerDamaged, 'Computer Damaged', sfx.playerDamaged, 'Player Damaged')
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
            if (sfx.counterSuccess === true || sfx.computerCounterSuccess === true) this.scene.counter.play();
            if (sfx.playerWin === true) this.scene.righteous.play();
            // if (sfx.computerWin) this.scene.death.play();

            EventBus.emit('blend-combat', { computerDamaged: false, playerDamaged: false });
        } catch (err) {
            console.log(err.message, 'Error Setting Sound Effects');
        };
    };

    checkWeapons = (weapon, damage) => {
        this.currentDamageType = damage;    
        this.hasMagic = this.checkDamageType(damage, 'magic');
        this.checkMeleeOrRanged(weapon);
    };

    defeatedEnemyCheck = (enemy) => {
        this.targets = this.targets.filter(obj => obj.enemyID !== enemy);
        this.sendEnemies(this.targets);
        this.scene.combatMachine.clear(enemy);
        if (this.targets.every(obj => !obj.inCombat)) {
            this.inCombat = false;
            this.attacking = undefined;
            if (this.currentTarget) {
                // this.currentTarget.clearTint();
                this.currentTarget = undefined;
            };
        } else {
            if (this.currentTarget.enemyID === enemy) { // Was targeting the enemy that was defeated
                // this.currentTarget.clearTint();
                const newTarget = this.targets.find(obj => obj.enemyID !== enemy);
                if (!newTarget) return;
                this.scene.setupEnemy(newTarget);
                this.currentTarget = newTarget;
                this.attacking = newTarget;
                this.targetID = newTarget.enemyID;
                this.highlightTarget(newTarget);
            }; 
        };
    };

    isPlayerInCombat = () => {
        return this.inCombat || this.scene.combat || this.scene.state.combatEngaged;
    };

    shouldPlayerEnterCombat = (other) => {
        const hasRemainingEnemies = this.scene.combat && this.scene.state.combatEngaged && this.inCombat;
    
        if (!hasRemainingEnemies && !this.isStealthing) {
            console.log(`%c Should Player Enter Combat? YES`, 'color: #ff0000');
            this.enterCombat(other);
        } else if (this.isStealthing) {
            console.log(`%c Should Player Prepare Combat? YES`, 'color: #ff0000');
            this.prepareCombat(other);    
        };
    }; 

    enterCombat = (other) => {
        this.scene.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.attacking = other.gameObjectB;
        this.currentTarget = other.gameObjectB;
        this.targetID = other.gameObjectB.enemyID;
        this.scene.combatEngaged(true);
        this.highlightTarget(other.gameObjectB);
        this.inCombat = true;
    };

    prepareCombat = (other) => {
        this.scene.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.attacking = other.gameObjectB;
        this.currentTarget = other.gameObjectB;
        this.targetID = other.gameObjectB.enemyID;
        this.highlightTarget(other.gameObjectB);
    };

    isAttackTarget = (enemy) => {
        if (this.attacking?.enemyID === enemy.enemyID) {
            return true;
        };
        return false;
    };

    isNewEnemy = (enemy) => {
        const newEnemy = !this.targets.some(obj => obj.enemyID === enemy.enemyID);
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
            other.gameObjectB.name === 'enemy' &&
            other.bodyB.label === 'enemyCollider' &&
            other.gameObjectB.isAggressive &&
            other.gameObjectB.ascean
        );
    };

    isValidNeutralCollision(other) {
        return (
            other.gameObjectB &&
            other.gameObjectB.name === 'enemy' &&
            other.bodyB.label === 'enemyCollider' &&
            other.gameObjectB.ascean
        );
    };
 
    checkEnemyCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (this.isValidEnemyCollision(other)) {
                    console.log(other, 'Other')
                    const isNewEnemy = this.isNewEnemy(other.gameObjectB);
                    console.log(`%c Is New Enemy: ${isNewEnemy}`, 'color: #ff0000');
                    if (!isNewEnemy) return;
                    // if (this.shouldPlayerEnterCombat(other.gameObjectB)) {
                    //     this.enterCombat(other);
                    // };
                    this.shouldPlayerEnterCombat(other);
                    this.touching.push(other.gameObjectB);
                    this.checkTargets();
                } else if (this.isValidNeutralCollision(other)) {
                    const isNeutral = this.isNewEnemy(other.gameObjectB);
                    console.log(`%c Is Neutral: ${isNeutral}`, 'color: #ff0000')
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
                    // if (attackDirection === this.flipX) {
                        this.actionAvailable = true;
                        this.triggeredActionAvailable = other.gameObjectB;
                        if (!this.actionTarget) this.actionTarget = other;
                        if (!this.attacking) this.attacking = other.gameObjectB;
                        if (!this.currentTarget) this.currentTarget = other.gameObjectB;
                        if (!this.targetID) this.targetID = other.gameObjectB.enemyID;    
                    // };
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

    checkLootdropCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (other.gameObjectB && other.bodyB.label === 'lootdropCollider') {
                    this.interacting.push(other.gameObjectB);
                    const interactingLoot = { loot: other.gameObjectB._id, interacting: true };
                    EventBus.emit('interacting-loot', interactingLoot);
                };
            },
            context: this.scene,
        }); 

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: (other) => {
                if (other.gameObjectB && other.bodyB.label === 'lootdropCollider') {
                    this.interacting = this.interacting.filter(obj => obj.id !== other.gameObjectB.id);
                    const interactingLoot = { loot: other.gameObjectB._id, interacting: false };
                    EventBus.emit('interacting-loot', interactingLoot);
                };
            },
            context: this.scene,
        });
    };

    checkNpcCollision = (playerSensor) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (other.gameObjectB && other.bodyB.label === 'npcCollider' && !this.inCombat) { 
                    const isNewNpc = !this.targets.some(obj => obj.enemyID === other.gameObjectB.enemyID);
                    if (isNewNpc && !isNewNpc.isDead) this.targets.push(other.gameObjectB);
                    this.currentTarget = other.gameObjectB;
                    this.targetID = other.gameObjectB.enemyID;
                    if ((!this.scene.state.computer || this.scene.state.computer._id !== other.gameObjectB.ascean._id)) this.scene.setupNPC(other.gameObjectB);
                };
            },
            context: this.scene,
        }); 

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: (other) => {
                if (other.gameObjectB && other.bodyB.label === 'npcCollider' && (!this.inCombat || this.currentTarget.enemyID === other.gameObjectB.enemyID || other.gameObjectB.interacting)) { 
                    this.targets = this.targets.filter(obj => obj.enemyID !== other.gameObjectB.enemyID);
                    this.scene.clearNPC();
                };
                this.checkTargets();
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
        // console.log(collisionPoint.x < sensorPosition.x, 'collisionPoint.x < sensorPosition.x')
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
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.ATTACK);
        // this.scene.purchase.play();
    }; 
    onAttackUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ATTACK_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'attack');
        };
        this.combatChecker(this.isAttacking);
    }; 
    onAttackExit = () => {
        if (this.scene.state.action !== '') this.scene.combatMachine.input('action', '');
    };

    onCounterEnter = () => {
        this.isCountering = true;    
        this.swingReset(States.COUNTER);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.COUNTER);
        // this.scene.counter.play();
    };
    onCounterUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.COUNTER_LIVE && !this.isRanged) {
            this.scene.combatMachine.input('action', 'counter');
        };
        this.combatChecker(this.isCountering);
    };
    onCounterExit = () => {
        if (this.scene.state.action !== '') this.scene.combatMachine.input('action', '');
        if (this.scene.state.counterGuess !== '') this.scene.combatMachine.input('counterGuess', '');
    };

    onPostureEnter = () => {
        this.isPosturing = true;
        this.swingReset(States.POSTURE);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.POSTURE);
        // this.scene.purchase.play();
    };
    onPostureUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.POSTURE_LIVE && !this.isRanged) { //
            this.scene.combatMachine.input('action', 'posture');
        };
        this.combatChecker(this.isPosturing);
    };
    onPostureExit = () => {
        if (this.scene.state.action !== '') this.scene.combatMachine.input('action', '');
    };

    onRollEnter = () => {
        this.isRolling = true;
        this.scene.roll.play();
        // if (this.inCombat) 
        this.swingReset(States.ROLL);
        this.scene.useStamina(this.staminaModifier + PLAYER.STAMINA.ROLL);
        this.body.parts[2].position.y += this.sensorDisp;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
        this.body.parts[1].vertices[0].y += this.colliderDisp;
        this.body.parts[1].vertices[1].y += this.colliderDisp; 
    };
    onRollUpdate = (_dt) => {
        if (this.frameCount === FRAME_COUNT.ROLL_LIVE && !this.isRanged) this.scene.combatMachine.input('action', 'roll');
        this.combatChecker(this.isRolling);
    };
    onRollExit = () => {
        this.spriteWeapon.setVisible(true);
        this.rollCooldown = 0; 
        if (this.scene.state.action !== '') this.scene.combatMachine.input('action', '');
        this.body.parts[2].position.y -= this.sensorDisp;
        this.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
        this.body.parts[1].vertices[0].y -= this.colliderDisp;
        this.body.parts[1].vertices[1].y -= this.colliderDisp;
    };

    onDodgeEnter = () => {
        this.isDodging = true;
        // this.scene.righteous.play();
        this.scene.useStamina(PLAYER.STAMINA.DODGE);
        this.swingReset(States.DODGE);
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
    onHealingEnter = () => {
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.HEALING);
        this.isPolymorphing = true;
        // this.setStatic(true);
        if (!this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, 'weapon');
            this.setGlow(this.spriteShield, true, 'shield');
        };
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
            this.healingSuccess = false;
            EventBus.emit('initiate-combat', { data: { key: 'player', value: 25 }, type: 'Health' });
        };
        this.castbar.reset();
        if (!this.isCaerenic) {
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, 'weapon');
            this.setGlow(this.spriteShield, false, 'shield');
        };
        // this.setStatic(false);
    };

    onPrayerEnter = () => {
        this.isHealing = true;
        this.setStatic(true);
    };
    onPrayerUpdate = (_dt) => {
        this.combatChecker(this.isHealing);
    };
    onPrayerExit = () => {
        this.scene.drinkFlask();
        this.setStatic(false);
    };

    onInvokeEnter = () => {
        this.isPraying = true;
        this.setStatic(true);
        if (!this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, 'weapon');
            this.setGlow(this.spriteShield, true, 'shield');
        };
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
        this.setStatic(false);
        if (!this.isCaerenic) {
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, 'weapon');
            this.setGlow(this.spriteShield, false, 'shield');
        };
        this.scene.combatMachine.action({ type: 'Instant', data: this.scene.state.playerBlessing });
        // screenShake(this.scene);
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

    onSnaringEnter = () => {
        if (!this.inCombat) return;
        this.isConsuming = true;
        this.setTimeEvent('snareCooldown', 6000);
    };
    onSnaringUpdate = (_dt) => {
        this.combatChecker(this.isConsuming);
    };
    onSnaringExit = () => {
        if (!this.inCombat) return;
        this.scene.snare(this.attacking.enemyID);
        this.scene.useStamina(PLAYER.STAMINA.SNARE);
    };

    onCleanEnter = () => {};
    onCleanExit = () => {};

    onStealthEnter = () => {
        this.isStealthing = true; 
        this.stealthEffect(true);    
        // EventBus.emit('stealth', true);
    };
    onStealthUpdate = (_dt) => {
        if (!this.isStealthing || this.currentRound > 1 || this.scene.combat) {
            console.log(`%c Exiting Stealth [onStealthUpdate]`, 'color: #ff0000')
            this.metaMachine.setState(States.CLEAN); 
        };
    };
    onStealthExit = () => { 
        this.isStealthing = false;
        this.stealthEffect(false);
        // EventBus.emit('update-stealth');
        // EventBus.emit('stealth', false);
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
            this.setTint(0x000000);
        };
        this.stealthFx.play();    
    };

    stealthListener = () => {
        EventBus.on('update-stealth', () => {
            if (this.isStealthing) {
                this.isStealthing = false;
            } else {
                this.metaMachine.setState(States.STEALTH);
            };
        })
    };

    caerenicListener = () => {
        EventBus.on('update-caerenic', () => {
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
        });
    };

    stalwartListener = () => {
        EventBus.on('update-stalwart', () => {
            this.isStalwart = this.isStalwart ? false : true;
            this.stalwartFx.play();
        });
    };

    enemyListener = () => {
        EventBus.on('remove-enemy', (e) => {
            console.log(`%c Targets: ${this.targets} Remaining" ${this.targets.length}`, 'color: #ff0000')
            const index = this.targets.findIndex(obj => obj.enemyID === e);
            console.log(`%c Removing Enemy: ${e} with index ${index}`, 'color: #ff0000')
            this.targets = this.targets.filter(obj => obj.enemyID !== e);
            // if (this.currentTarget) {
            //     this.currentTarget.clearTint();
            // };
            if (this.targets.length > 0) {
                const newTarg = this.targets[index] || this.targets[0];
                console.log(`%c New Target: ${newTarg}`, 'color: #ff0000')
                if (!newTarg) return;
                this.currentTarget = newTarg;
                this.highlightTarget(this.currentTarget);
                // if (this.inCombat && !this.scene.state.computer) {
                    this.scene.setupEnemy(this.currentTarget);
                // };
            };
        });
    };

    tabListener = () => {
        EventBus.on('tab-target', (enemy) => {
            if (this.currentTarget) {
                this.currentTarget.clearTint();
                this.currentTarget.setTint(0x000000);
            };

            const newTarget = this.targets.find(obj => obj.enemyID === enemy.id);
            this.targetIndex = this.targets.findIndex(obj => obj.enemyID === enemy.id);

            // const newTarget = this.targets[this.targetIndex];
            // this.targetIndex = this.targetIndex + 1 >= this.targets.length ? 0 : this.targetIndex + 1;
            if (!newTarget) return;
            if (newTarget.npcType) { // NPC
                // this.scene.setupNPC(newTarget);
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
        });
    };
    onBlinkEnter = () => {
        this.scene.roll.play();
        if (!this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, 'weapon');
            this.setGlow(this.spriteShield, true, 'shield');
        };
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
        this.setTimeEvent('blinkCooldown', 3000);
    };
    onBlinkUpdate = (_dt) => {
        this.combatChecker(this.isBlinking);
    };
    onBlinkExit = () => {
        this.scene.time.addEvent({
            delay: 750,
            callback: () => {
                if (!this.isCaerenic) {
                    this.setGlow(this, false);
                    this.setGlow(this.spriteWeapon, false, 'weapon');
                    this.setGlow(this.spriteShield, false, 'shield');
                };
            },
            callbackScope: this,
            loop: false,
        });
    };

    onTshaeralEnter = () => {
        if (!this.inCombat) return;
        this.isTshaering = true;
        this.attacking.isConsumed = true;
        this.scene.useStamina(PLAYER.STAMINA.TSHAER);
        // screenShake(this.scene);
        if (!this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, 'weapon'); 
            this.setGlow(this.spriteShield, true, 'shield');
        };
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

        if (this.tshaeringTimer) {
            this.tshaeringTimer.remove(false);
            this.tshaeringTimer = undefined;
        };
        // if (this.beamTimer) {
        //     this.beamTimer.remove();
        //     this.beamTimer = undefined;
        // };
        if (!this.isCaerenic) { 
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, 'weapon');
            this.setGlow(this.spriteShield, false, 'shield');
        }; 
        // this.tshaeringGraphic.destroy();
        // this.tshaeringGraphic = undefined;
        this.setStatic(false);
    };

    onFearingEnter = () => {
        if (!this.inCombat) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Fearing', PLAYER.DURATIONS.FEARING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.FEARING);
        this.isFearing = true;
        if (!this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, 'weapon');
            this.setGlow(this.spriteShield, true, 'shield');
        };
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
        };
        this.castbar.reset();
        if (!this.isCaerenic) {
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, 'weapon');
            this.setGlow(this.spriteShield, false, 'shield');
        };
    };

    onPolymorphingEnter = () => {
        if (!this.inCombat) return;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPHING / 2, 'cast');
        this.castbar.setTotal(PLAYER.DURATIONS.POLYMORPHING);
        this.isPolymorphing = true;
        if (!this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, 'weapon');
            this.setGlow(this.spriteShield, true, 'shield');
        };
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
            this.polymorphSuccess = false;
        };
        this.castbar.reset();
        if (!this.isCaerenic) {
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, 'weapon');
            this.setGlow(this.spriteShield, false, 'shield');
        };
    };

    onStunEnter = () => {
        this.isStunned = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Stunned', PLAYER.DURATIONS.STUNNED, 'effect', true);
        this.scene.input.keyboard.enabled = false;
        this.stunDuration = PLAYER.DURATIONS.STUNNED;
        this.setTint(0xFFFFFF);
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
        // this.clearTint(); 
        this.setTint(0x000000)
        this.setStatic(false);
    };

    setTimeEvent = (cooldown, limit = 30000) => {
        const evasion = cooldown === 'rollCooldown' || cooldown === 'dodgeCooldown' 
        if (!evasion) {
            this[cooldown] = limit;
        };
        const type = cooldown.split('Cooldown')[0];
        const interval = 50;
        let time = 0;
        this.scene.actionBar.setCurrent(time, limit, type);
        const timer = this.scene.time.addEvent({
            delay: interval,
            callback: () => {
                time += interval;
                this.scene.actionBar.setCurrent(time, limit, type);
                if (time >= limit || !this.inCombat) {
                    if (!this.inCombat) this.scene.actionBar.setCurrent(limit, limit, type);
                    if (!evasion) {
                        this[cooldown] = 0;
                    };
                    timer.remove(false);
                    timer.destroy();
                };
            },
            callbackScope: this,
            loop: true,
        });
    };

    swingReset = (type) => {
        this.canSwing = false;
        this.scene.time.delayedCall(this.swingTimer, () => {
            this.canSwing = true;
        }, undefined, this);
        let time = 0;
        this.scene.actionBar.setCurrent(time, this.swingTimer, type);
        const swingTime = this.scene.time.addEvent({
            delay: 16.667,
            callback: () => {
                if (time >= this.swingTimer) {
                    swingTime.remove(false);
                    swingTime.destroy();
                    return;
                };
                time += this.scene.game.loop.delta; // 16.667ms~ / this.swingTimer ?? 
                this.scene.actionBar.setCurrent(time, this.swingTimer, type);
            },
            callbackScope: this,
            loop: true,
        });
    };

    checkTargets = () => {
        const playerCombat = this.isPlayerInCombat();
        this.targets = this.targets.filter(gameObject => {
            if (gameObject.isDead) { // && playerCombat  || !gameObject.inCombat
                return false;
            };
            if (gameObject.npcType && playerCombat) {
                this.scene.combatEngaged(false);
                this.inCombat = false;
            };
            return true;
        });
        this.sendEnemies(this.targets);
        if (!this.targets.length && this.scene.state.computer) {
            console.log('!this.targets.length && this.scene.state.computer aka No Targets and a Computer')
            this.scene.clearNAEnemy();
        };

        const someInCombat = this.targets.some(gameObject => gameObject.inCombat);
        if (someInCombat && !playerCombat) {
            this.scene.combatEngaged(true);
            this.inCombat = true;
        } else if (!someInCombat && playerCombat && !this.isStealthing) {
            console.log('!someInCombat && playerCombat && !this.isStealthing')
            this.scene.clearNAEnemy();
            this.scene.combatEngaged(false);
            this.inCombat = false;
        };

        if (!this.touching.length && (this.triggeredActionAvailable || this.actionAvailable)) {
            if (this.triggeredActionAvailable) this.triggeredActionAvailable = undefined;
            if (this.actionAvailable) this.actionAvailable = false;
        };
    };

    removeTarget = (enemyID) => {
        this.targets = this.targets.filter(gameObject => gameObject.enemyID !== enemyID);
        this.checkTargets();
    };

    sendEnemies = (enemies) => {
        //
        const data = enemies.map(enemy => {
            return { 
                id: enemy.enemyID, 
                game: enemy.ascean, 
                enemy: enemy.combatStats, 
                health: enemy.health, 
                isAggressive: enemy.isAggressive, 
                startedAggressive: enemy.startedAggressive, 
                isDefeated: enemy.isDefeated, 
                isTriumphant: enemy.isTriumphant 
            };
        });
        EventBus.emit('update-enemies', data);
    };
    
    zeroOutVelocity = (velocityDirection, deceleration) => {
        if (velocityDirection > 0) {
            velocityDirection -= deceleration;
            if (velocityDirection < 0) velocityDirection = 0;
        } else if (velocityDirection < 0) {
            velocityDirection += deceleration;
            if (velocityDirection > 0) velocityDirection = 0;
        };
        return velocityDirection;
    };

    enemyIdMatch = () => {
        return this.attackedTarget.enemyID === this.scene.state.enemyID;
    };

    checkPlayerAction = () => {
        if (this.scene.state.action) return this.scene.state.action;    
        if (this.isAttacking) return 'attack';
        if (this.isCountering) return 'counter';
        if (this.isPosturing) return 'posture';
        if (this.isRolling) return 'roll';
        return '';
    };
    
    movementClear = () => {
        return (
            !this.stateMachine.isCurrentState(States.ROLL) &&
            !this.stateMachine.isCurrentState(States.DODGE) &&
            !this.stateMachine.isCurrentState(States.COUNTER) &&
            !this.stateMachine.isCurrentState(States.ATTACK) &&
            !this.stateMachine.isCurrentState(States.POSTURE) &&
            !this.stateMachine.isCurrentState(States.INVOKE) &&
            !this.stateMachine.isCurrentState(States.TSHAERAL) &&
            !this.stateMachine.isCurrentState(States.HEAL) &&
            !this.isStalwart
        );
    };

    playerActionSuccess = async () => {
        const match = this.enemyIdMatch();
        if (this.particleEffect) {
            if (match) {
                this.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: this.particleEffect.action } });
            } else {
                this.scene.combatMachine.action({ type: 'Player', data: { playerAction: { action: this.particleEffect.action, counter: this.scene.state.counterGuess },  enemyID: this.attackedTarget.enemyID, ascean: this.attackedTarget.ascean, damageType: this.attackedTarget.currentDamageType, combatStats: this.attackedTarget.combatStats, weapons: this.attackedTarget.weapons, health: this.attackedTarget.health, actionData: { action: this.attackedTarget.currentAction, counter: this.attackedTarget.counterAction } } });
            };
            this.scene.particleManager.removeEffect(this.particleEffect.id);
            this.particleEffect.effect.destroy();
            this.particleEffect = undefined;
        } else {
            const action = this.checkPlayerAction();
            if (!action) return;
            if (match) { // Target Player Attack
                this.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: action } });
            } else { // Blind Player Attack
                this.scene.combatMachine.action({ type: 'Player', data: { playerAction: { action: action, counter: this.scene.state.counterGuess }, enemyID: this.attackedTarget.enemyID, ascean: this.attackedTarget.ascean, damageType: this.attackedTarget.currentDamageType, combatStats: this.attackedTarget.combatStats, weapons: this.attackedTarget.weapons, health: this.attackedTarget.health, actionData: { action: this.attackedTarget.currentAction, counter: this.attackedTarget.counterAction }} });
            };
        };
        if (this.actionTarget) this.knockback(this.actionTarget); // actionTarget
        if (this.isStealthing) {
            console.log(`%c Exiting Stealth`, 'color: #ff0000');
            this.scene.stun(this.attackedTarget.enemyID);
            this.isStealthing = false;
            this.scene.combatEngaged(true);
            this.inCombat = true;
            this.attackedTarget.jumpIntoCombat();
            EventBus.emit('update-stealth');
        };
        // screenShake(this.scene); 
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
        
        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.target.TAB) && this.targets.length) { // was > 1 More than 1 i.e. worth tabbing
            // if (this.currentTarget) {
            //     this.currentTarget.clearTint();
            // };
            const newTarget = this.targets[this.targetIndex];
            this.targetIndex = this.targetIndex + 1 >= this.targets.length ? 0 : this.targetIndex + 1;
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
        };

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
            if (this.stamina >= PLAYER.STAMINA.COUNTER && this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.attack.ONE)) {
                this.scene.combatMachine.input('counterGuess', 'attack');
                this.stateMachine.setState(States.COUNTER);              
            };
            if (this.stamina >= PLAYER.STAMINA.COUNTER && this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.posture.TWO)) {
                this.scene.combatMachine.input('counterGuess', 'posture');
                this.stateMachine.setState(States.COUNTER);
            };
            if (this.stamina >= PLAYER.STAMINA.COUNTER && this.movementClear() && this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.roll.THREE)) {
                this.scene.combatMachine.input('counterGuess', 'roll');
                this.stateMachine.setState(States.COUNTER);
            };
        
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.attack.ONE) && this.stamina >= PLAYER.STAMINA.ATTACK && this.canSwing) {
                this.stateMachine.setState(States.ATTACK);
            };
            
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.posture.TWO) && this.stamina >= PLAYER.STAMINA.POSTURE && this.canSwing) {
                this.stateMachine.setState(States.POSTURE);
            };

            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.counter.FIVE) && this.stamina >= PLAYER.STAMINA.COUNTER && this.canSwing) {
                this.scene.combatMachine.input('counterGuess', 'counter');
                this.stateMachine.setState(States.COUNTER);
            };
            if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.snare.V) && this.rootCooldown === 0) {
                this.scene.root();
                this.setTimeEvent('rootCooldown', 6000);
                // screenShake(this.scene);
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.snare.V) && this.snareCooldown === 0) {
                this.scene.snare(this.attacking.enemyID);
                this.setTimeEvent('snareCooldown', 6000);
            };
            if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.pray.R) && !this.isMoving && this.polymorphCooldown === 0) { // && this.polymorphCooldown === 0
                this.stateMachine.setState(States.POLYMORPHING);
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.pray.R) && this.invokeCooldown === 0) {
                if (this.scene.state.playerBlessing === '') return;
                this.setTimeEvent('invokeCooldown');
                this.stateMachine.setState(States.INVOKE);
            };
            if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.consume.F) && this.stamina >= PLAYER.STAMINA.TSHAER && this.tshaeralCooldown === 0) { // this.tshaeralCooldown === 0
                this.stateMachine.setState(States.TSHAERAL);
                this.setTimeEvent('tshaeralCooldown', 15000);
                this.scene.time.addEvent({
                    delay: 2000,
                    callback: () => {
                        this.isTshaering = false;
                    },
                    callbackScope: this,
                    loop: false,
                });
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.consume.F)) {
                if (this.scene.state.playerEffects.length === 0) return;
                this.isConsuming = true;
                this.scene.combatMachine.action({ type: 'Consume', data: this.scene.state.playerEffects });
                // screenShake(this.scene);
            };
        };

        // ========================= Player Movement Actions ========================= \\

        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.roll.THREE) && this.stamina >= PLAYER.STAMINA.ROLL && this.movementClear()) {
            this.stateMachine.setState(States.ROLL);
        };

        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.dodge.FOUR) && this.stamina >= PLAYER.STAMINA.DODGE && this.movementClear()) {
            this.stateMachine.setState(States.DODGE);
        };

        // ========================= Player Utility Actions ========================= \\

        if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.stalwart.G)) {
            this.scene.caerenic();
        };

        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.stalwart.G)) {
            this.scene.stalwart();
        }; 

        if (this.inputKeys.shift.SHIFT.isDown && Phaser.Input.Keyboard.JustDown(this.inputKeys.firewater.T)) {
            EventBus.emit('update-stealth');
        };

        if (Phaser.Input.Keyboard.JustDown(this.inputKeys.firewater.T)) {
            this.stateMachine.setState(States.HEAL);
        };
    };

    handleAnimations = () => {
        if (this.isStunned) {
            this.setVelocity(0);
        } else if (this.isHurt) {
            this.anims.play('player_hurt', true).on('animationcomplete', () => this.isHurt = false);  
        } else if (this.isCountering) {
            this.anims.play('player_attack_2', true).on('animationcomplete', () => this.isCountering = false);
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
        } else if (this.isPolymorphing) { 
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
        if (this.inCombat && !this.scene.combatTimer) this.scene.startCombatTimer();
        if (this.inCombat && !this.healthbar.visible) this.healthbar.setVisible(true);
        if (this.currentWeaponSprite !== this.assetSprite(this.scene.state.weapons[0])) {
            this.currentWeaponSprite = this.assetSprite(this.scene.state.weapons[0]);
            this.spriteWeapon.setTexture(this.currentWeaponSprite);
            if (this.scene.state.weapons[0].grip === 'One Hand') {
                this.staminaModifier = 0;
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
            } else {
                this.staminaModifier = 5;
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
            };
        };
        if (this.currentShieldSprite !== this.assetSprite(this.scene.state.player.shield)) {
            this.currentShieldSprite = this.assetSprite(this.scene.state.player.shield);
            this.spriteShield.setTexture(this.currentShieldSprite);
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
            
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText) this.scrollingCombatText.update(this);
        if (this.winningCombatText) this.winningCombatText.update(this);
        if (this.specialCombatText) this.specialCombatText.update(this);

        this.weaponRotation('player', this.currentTarget);
    };

    handleMovement = () => {
        let speed = this.speed;
        const keys = this.joystick.createCursorKeys();
        this.rightJoystick.update();

        // =================== MOVEMENT ================== \\

        if (this.inputKeys.right.D.isDown || this.inputKeys.right.RIGHT.isDown || keys.right.isDown) {
            this.playerVelocity.x += this.acceleration;
            if (this.flipX) this.flipX = false;
        };

        if (this.inputKeys.left.A.isDown || this.inputKeys.left.LEFT.isDown || keys.left.isDown) {
            this.playerVelocity.x -= this.acceleration;
            this.flipX = true;
        };

        if ((this.inputKeys.up.W.isDown || this.inputKeys.up.UP.isDown) || keys.up.isDown) {
            this.playerVelocity.y -= this.acceleration;
        }; 

        if (this.inputKeys.down.S.isDown || this.inputKeys.down.DOWN.isDown || keys.down.isDown) {
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

        if (!this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.strafe.E.isDown && !this.inputKeys.strafe.Q.isDown && !this.inputKeys.left.A.isDown && !this.inputKeys.left.LEFT.isDown && !keys.left.isDown && !keys.right.isDown) {
            this.playerVelocity.x = this.zeroOutVelocity(this.playerVelocity.x, this.deceleration);
        };
        if (!this.inputKeys.left.A.isDown && !this.inputKeys.left.LEFT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.strafe.E.isDown && !this.inputKeys.strafe.Q.isDown && !this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown && !keys.right.isDown && !keys.left.isDown) {
            this.playerVelocity.x = this.zeroOutVelocity(this.playerVelocity.x, this.deceleration);
        };
        if (!this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown && !keys.down.isDown && !keys.up.isDown) {
            this.playerVelocity.y = this.zeroOutVelocity(this.playerVelocity.y, this.deceleration);
        };
        if (!this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown && !keys.up.isDown && !keys.down.isDown) {
            this.playerVelocity.y = this.zeroOutVelocity(this.playerVelocity.y, this.deceleration);
        };

        // =================== VARIABLES IN MOTION ================== \\

        if (this.inputKeys.strafe.E.isDown || this.inputKeys.strafe.Q.isDown || this.strafingLeft === true || this.strafingRight === true) {
            // if (!this.spriteShield.visible && !this.isDodging && !this.isRolling) this.spriteShield.setVisible(true);
            this.isStrafing = true;
        } else if (this.isStrafing) {
            this.isStrafing = false;
            this.strafingLeft = false;
            this.strafingRight = false;
        };
        
        if (this.isAttacking || this.isCountering || this.isPosturing) speed += 1;
        
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