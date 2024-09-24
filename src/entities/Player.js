import { GameObjects, Input, Math as pMath, Physics } from "phaser";
import Entity from "./Entity";  
import { screenShake, sprint, walk } from "../phaser/ScreenShake";
import { States } from "../phaser/StateMachine";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import HealthBar from "../phaser/HealthBar";
import PlayerMachine from '../phaser/PlayerMachine';
import { EventBus } from "../game/EventBus";
import CastingBar from "../phaser/CastingBar";
import { PHYSICAL_ACTIONS, PHYSICAL_EVASIONS, PLAYER } from "../utility/player";
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

        this.playerMachine = new PlayerMachine(scene, this);

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
            .strokeCircle(0, 0, 12); // 10 
        this.mark.setVisible(false);
        this.markAnimation = false;
        if (this.scene.state.isCaerenic) this.caerenicUpdate();
        if (this.scene.state.isStalwart) this.stalwartUpdate();
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health, 'player');
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
        this.rushedEnemies = [];
        this.playerStateListener();
        this.setFixedRotation();   
        this.checkEnemyCollision(playerSensor);
        this.checkWorldCollision(playerSensor);
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
            this.playerMachine.positiveMachine.setState(States.STEALTH);
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
        this.scene.combatEngaged(false);
        this.scene.clearNonAggressiveEnemy();
        this.inCombat = false;
        this.currentTarget = undefined;
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

    clearEnemy = (enemy) => {
        enemy.clearCombatWin();
        this.disengage();
    };

    findEnemy = () => {
        if (this.scene.state.newPlayerHealth <= 0) {
            this.disengage();
            return;
        };
        const first = this.scene.state.enemyID;
        if (first === '') {
            this.scene.quickCombat();
        } else {
            const enemy = this.scene.getEnemy(first);
            if (enemy === undefined) {
                this.disengage();
            } else if (!enemy.inCombat) {
                this.scene.quickCombat();
            } else {
                this.quickTarget(enemy);
            };
        };
    };
    invalidTarget = (id) => {
        const enemy = this.scene.enemies.find(enemy => enemy.enemyID === id);
        if (enemy) return enemy.health === 0; // enemy.isDefeated;
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

    getEnemyId = () => this.scene.state.enemyID || this.currentTarget?.enemyID;

    quickTarget = (enemy) => {
        this.targetID = enemy.enemyID;
        this.currentTarget = enemy;
        this.highlightTarget(enemy);
        if (this.scene.state.enemyID !== enemy.enemyID) this.scene.setupEnemy(enemy);
    };

    targetEngagement = (id) => {
        const enemy = this.scene.enemies.find(obj => obj.enemyID === id);
        if (!enemy) return;
        if (this.isNewEnemy(enemy)) this.targets.push(enemy);
        if (this.scene.state.enemyID !== id) this.scene.setupEnemy(enemy);
        this.inCombat = true;
        this.scene.combatEngaged(true);
        this.targetID = id;
        this.currentTarget = enemy;
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
                if (this.isMalicing) this.playerMachine.malice(e.damagedID);
                if (this.isMending) this.playerMachine.mend();
                if (this.isRecovering) this.playerMachine.recover();
                if (this.isReining) this.playerMachine.rein();
                if (this.isMenacing) this.playerMachine.menace(this.reactiveTarget);
                if (this.isModerating) this.playerMachine.moderate(this.reactiveTarget);
                if (this.isMultifaring) this.playerMachine.multifarious(this.reactiveTarget);
                if (this.isMystifying) this.playerMachine.mystify(this.reactiveTarget);
            };
            if (this.isFeared) {
                const chance = Math.random() < 0.1 + this.fearCount;
                if (chance) {
                    this.statusCombatText = new ScrollingCombatText(this.scene, this.currentTarget?.position?.x, this.currentTarget?.position?.y, 'Fear Broken', PLAYER.DURATIONS.TEXT, 'effect');
                    this.isFeared = false;    
                } else {
                    this.fearCount += 0.1;
                };
            };
        };
        if (this.health < e.newPlayerHealth) this.scrollingCombatText = new ScrollingCombatText(this.scene, this.x, this.y, Math.round(e.newPlayerHealth - this.health), PLAYER.DURATIONS.TEXT, 'heal');
        this.health = e.newPlayerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.playerHealth) this.healthbar.setTotal(e.playerHealth);
        if (this.currentRound !== e.combatRound && this.scene.combat === true) {
            this.currentRound = e.combatRound;
            if (e.computerDamaged || e.playerDamaged || e.rollSuccess || e.parrySuccess || e.computerRollSuccess || e.computerParrySuccess) this.soundEffects(e);
        };
        if (e.computerParrySuccess === true) {
            this.playerMachine.stateMachine.setState(States.STUN);
            this.scene.combatManager.combatMachine.input('computerParrySuccess', false);
            this.resistCombatText = new ScrollingCombatText(this.scene, this.currentTarget?.position?.x, this.currentTarget?.position?.y, 'Parry', PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);    
        };
        if (e.rollSuccess === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Roll', PLAYER.DURATIONS.TEXT, 'heal', true);
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'dodge');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'roll');
        };
        if (e.parrySuccess === true) {
            this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Parry', PLAYER.DURATIONS.TEXT, 'heal', true);
            this.scene.combatManager.stunned(e.enemyID);
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'dodge');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'parry');
            this.scene.actionBar.setCurrent(this.swingTimer, this.swingTimer, 'roll');
        };
        if (e.computerRollSuccess === true) this.resistCombatText = new ScrollingCombatText(this.scene, this.currentTarget?.position?.x, this.currentTarget?.position?.y, 'Roll', PLAYER.DURATIONS.TEXT, 'damage', e.computerCriticalSuccess);
        if (e.newComputerHealth <= 0 && e.playerWin === true) this.defeatedEnemyCheck(e.enemyID);
        if (e.newPlayerHealth <= 0) this.disengage();    
        if (e.playerAttributes.stamina > this.maxStamina) this.maxStamina = e.playerAttributes.stamina;
        if (e.playerAttributes.grace > this.maxGrace) this.maxGrace = e.playerAttributes.grace;
        if (this.inCombat === false && this.scene.combat === true) this.scene.combatEngaged(false);
    };

    resist = () => {
        this.resistCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Resisted', PLAYER.DURATIONS.TEXT, 'effect');  
    };

    leap = () => {
        this.isLeaping = true;
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.isAttacking = true;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 200),
            y: this.y + (direction.y * 200),
            duration: 750,
            ease: 'Elastic',
            onStart: () => {
                screenShake(this.scene);
                this.scene.sound.play('leap', { volume: this.scene.settings.volume });
                this.flickerCarenic(750); 
            },
            onComplete: () => { 
                screenShake(this.scene, 120, 0.005);
                this.scene.combatManager.useGrace(PLAYER.STAMINA.LEAP);
                this.isLeaping = false; 
                if (this.touching.length > 0) {
                    this.touching.forEach((enemy) => {
                        this.scene.combatManager.melee(enemy.enemyID, 'leap');
                    });
                };
            },
        });       
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You launch yourself through the air!`
        });
    };

    rush = () => {
        this.isRushing = true;
        this.isParrying = true;
        this.scene.sound.play('stealth', { volume: this.scene.settings.volume });        
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
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
                    this.rushedEnemies.forEach((enemy) => {
                        if (!enemy.enemyID) return;
                        this.scene.combatManager.melee(enemy.enemyID, 'rush');
                    });
                } else if (this.touching.length > 0) {
                    this.touching.forEach((enemy) => {
                        if (!enemy.enemyID) return;
                        this.scene.combatManager.melee(enemy.enemyID, 'rush');
                    });
                };
                this.isRushing = false;
            },
        });         
    };

    storm = () => {
        this.isStorming = true;
        this.specialCombatText = new ScrollingCombatText(this.scene, this.x, this.y, 'Storming', 800, 'damage'); 
        this.isAttacking = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.STORM);
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
                    this.touching.forEach((enemy) => {
                        if (enemy.health === 0) return;
                        this.scene.combatManager.melee(enemy.enemyID, 'storm');
                    });
                };
            },
            onComplete: () => {
                this.isStorming = false; 
            },
            loop: 3,
        });  
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You begin storming with your ${this.scene.state.weapons[0]?.name}.`
        });
        screenShake(this.scene);
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
            if (sfx.computerDamaged === true) soundEffectMap(sfx.playerDamageType, sfx.computerWeapons[0]);                
            if (sfx.playerDamaged === true) soundEffectMap(sfx.computerDamageType, sfx.computerWeapons[0]);
            if (sfx.religiousSuccess === true) this.scene.sound.play('religious', { volume: this.scene.settings.volume });            
            if (sfx.rollSuccess === true || sfx.computerRollSuccess === true) this.scene.sound.play('roll', { volume: this.scene.settings.volume / 2 });
            if (sfx.parrySuccess === true || sfx.computerParrySuccess === true) this.scene.sound.play('parry', { volume: this.scene.settings.volume });
            EventBus.emit('blend-combat', { 
                computerDamaged: false, playerDamaged: false, glancingBlow: false, computerGlancingBlow: false, parrySuccess: false, computerParrySuccess: false, rollSuccess: false, computerRollSuccess: false, criticalSuccess: false, computerCriticalSuccess: false, religiousSuccess: false,
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
                this.staminaModifier = 3;
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
            };
        };
        if (this.currentShieldSprite !== this.assetSprite(shield)) {
            this.currentShieldSprite = this.assetSprite(shield);
            this.spriteShield.setTexture(this.currentShieldSprite);
        };
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
        if (newTarget.npcType) this.scene.setupNPC(newTarget);
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

    defeatedEnemyCheck = (id) => {
        this.currentTarget = undefined;
        this.removeHighlight();
        const enemy = this.scene.enemies.find(e => e.enemyID === id && e.health <= 0);
        if (enemy) {
            this.targets = this.targets.filter(target => target.enemyID !== id);
            this.sendEnemies(this.targets);
            if (this.highlight.visible) this.removeHighlight();
            this.scene.combatManager.combatMachine.clear(id);
        };
        const enemyInCombat = this.targets.find(obj => obj.inCombat && obj.health > 0);
        if (enemyInCombat) {
            this.scene.setupEnemy(enemyInCombat);
            this.currentTarget = enemyInCombat;
            this.targetID = enemyInCombat.enemyID;
            this.highlightTarget(enemyInCombat);
        } else {
            this.disengage();
        };
    };

    isPlayerInCombat = () => {
        return this.scene.enemies.some(e => e.inCombat && e.health > 0) || (this.inCombat && this.scene.combat && this.scene.state.combatEngaged);
    };

    shouldPlayerEnterCombat = (other) => {
        if (!this.isPlayerInCombat() && !this.isStealthing && this.scene.state.newPlayerHealth > 0) {
            this.enterCombat(other);
        } else if (this.isStealthing) {
            this.prepareCombat(other);    
        };
    }; 

    enterCombat = (other) => {
        this.scene.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.currentTarget = other.gameObjectB;
        this.targetID = other.gameObjectB.enemyID;
        this.scene.combatEngaged(true);
        this.highlightTarget(other.gameObjectB);
        this.inCombat = true;
    };

    prepareCombat = (other) => {
        this.scene.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.currentTarget = other.gameObjectB;
        this.targetID = other.gameObjectB.enemyID;
        this.highlightTarget(other.gameObjectB);
    };

    isAttackTarget = (enemy) => this.getEnemyId() === enemy.enemyID;
    isNewEnemy = (enemy) => this.targets.every(obj => obj.enemyID !== enemy.enemyID);

    isValidEnemyCollision = (other) =>  (
        other.gameObjectB &&
        other.bodyB.label === 'enemyCollider' &&
        other.gameObjectB.isAggressive &&
        other.gameObjectB.ascean
    );
    

    isValidNeutralCollision = (other) => (
        other.gameObjectB &&
        other.bodyB.label === 'enemyCollider' &&
        other.gameObjectB.ascean
    );

    isValidRushEnemy = (enemy) => {
        if (this.isRushing) {
            const newEnemy = this.rushedEnemies.every(obj => obj.enemyID !== enemy.enemyID);
            if (newEnemy) this.rushedEnemies.push(enemy);
        };
    };
 
    checkEnemyCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (this.isDeleting) return;
                this.isValidRushEnemy(other.gameObjectB);
                if (this.isValidEnemyCollision(other)) {
                    this.touching.push(other.gameObjectB);
                    const isNewEnemy = this.isNewEnemy(other.gameObjectB);
                    if (!isNewEnemy) return;
                    this.targets.push(other.gameObjectB);
                    this.shouldPlayerEnterCombat(other);
                    this.checkTargets();
                } else if (this.isValidNeutralCollision(other)) {
                    this.touching.push(other.gameObjectB);
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
                if (this.isDeleting) return;
                this.isValidRushEnemy(other.gameObjectB);
                if (this.isValidEnemyCollision(other)) {
                    this.actionTarget = other;
                    if (!this.currentTarget) this.currentTarget = other.gameObjectB;
                    if (!this.targetID) this.targetID = other.gameObjectB.enemyID;    
                };
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: (other) => {
                if (this.isDeleting) return;
                this.touching = this.touching.filter(obj => obj?.enemyID !== other?.gameObjectB?.enemyID);
                if (this.isValidEnemyCollision(other) && !this.touching.length) {
                    this.actionAvailable = false;
                    this.triggeredActionAvailable = undefined;
                } else if (this.isValidNeutralCollision(other) && !this.touching.length) {
                    this.actionAvailable = false;
                    this.triggeredActionAvailable = undefined;
                };
            },
            context: this.scene,
        });
    };
    checkWorldCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other) => {
                if (other.gameObjectB && other.gameObjectB?.properties?.name === 'duel') {
                    EventBus.emit('alert', { 
                        header: "Dueling Ground", 
                        body: `You have the option of summoning an enemy (${other.gameObjectB?.properties?.key}) to random location in the dueling grounds. \n Would you like the challenge?`, 
                        delay: 3000, 
                        key: "Duel",
                        arg: other.gameObjectB?.properties?.key
                    });
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

    getEnemyDirection = (target) => {
        if (this.scene.settings.difficulty.aim) return true;
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
            this.playerMachine.stateMachine.setState(States.COMBAT); 
        } else {
            this.playerMachine.stateMachine.setState(States.NONCOMBAT); 
        };
    };

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
        const time = this.swingTime(type);
        const button = this.scene.actionBar.getButton(type);
        this.scene.actionBar.setCurrent(0, time, type);
        this.scene.time.delayedCall(time, () => {
            this.canSwing = true;
            this.scene.actionBar.setCurrent(time, time, type);
            if (primary === true) this.scene.actionBar.animateButton(button);
        }, undefined, this);
    };

    swingTime = (type) => {
        return (type === 'dodge' || type === 'parry' || type === 'roll') ? 750 : this.swingTimer;
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
            if (playerCombat === true && (gameObject.health === 0 || gameObject.isLuckout === true || gameObject.isPersuaded === true)) {
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
        const someInCombat = this.targets.some(gameObject => gameObject.inCombat && gameObject.health > 0);
        if (!playerCombat && someInCombat) {
            this.scene.combatEngaged(true);
            this.inCombat = true;
        } else if (!someInCombat && playerCombat && !this.isStealthing) { // && this.currentTarget === undefined
            this.disengage();
        };
    };

    removeTarget = (enemyID) => {
        this.targets = this.targets.filter(gameObject => gameObject.enemyID !== enemyID);
        this.sendEnemies(this.targets);
        this.tabEnemy(enemyID);
        this.checkTargets();
    };

    addEnemy = (enemy) => {
        this.targets.push(enemy);
        this.sendEnemies(this.targets);
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
        if (!this.isPlayerInCombat()) {
            this.disengage();
            return;
        };
        const currentTargetIndex = this.targets.findIndex(obj => obj.enemyID === enemyID);
        const newTarget = this.targets[currentTargetIndex + 1] || this.targets[0];
        if (!newTarget) return;
        this.currentTarget = newTarget;
        this.targetID = newTarget.enemyID;
        if (newTarget.npcType) {
            this.scene.setupNPC(newTarget);
        } else {
            this.scene.setupEnemy(newTarget);
        };
        this.highlightTarget(this.currentTarget); 
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

    setCombat = (combat) => {
        return this.inCombat = combat;
    };

    setCurrentTarget = (enemy) => {
        return this.currentTarget = enemy;
    };

    enemyIdMatch = () => this?.attackedTarget?.enemyID === this.scene.state?.enemyID;

    checkPlayerAction = () => {
        if (this.scene.state.action) return this.scene.state.action;    
        if (this.isAttacking) return States.ATTACK;
        if (this.isParrying) return States.PARRY;
        if (this.isPosturing) return States.POSTURE;
        if (this.isRolling) return States.ROLL;
        if (this.isThrusting) return States.THRUST;
        return '';
    };

    inputClear = (input) => {
        const action = PHYSICAL_ACTIONS.includes(input);
        const evasions = PHYSICAL_EVASIONS.includes(input);
        if (action) {
            return this.canSwing;
        } else if (evasions) {
            return this.movementClear();
        } else {
            return true;
        };
    };
    
    movementClear = () => {
        return (
            !this.playerMachine.stateMachine.isCurrentState(States.ROLL) &&
            !this.playerMachine.stateMachine.isCurrentState(States.DODGE) &&
            !this.playerMachine.stateMachine.isCurrentState(States.PARRY) &&
            !this.isStalwart
        );
    };
    killParticle = () => {
        this.scene.particleManager.removeEffect(this.particleEffect.id);
        this.particleEffect = undefined;
    };
    playerActionSuccess = () => {
        if (this.particleEffect) {
            const action = this.particleEffect.action;
            this.killParticle();
            if (action === 'hook') {
                this.hook(this.attackedTarget, 1500);
                return;
            };
            if (!this.isAstrifying) {
                if (this.attackedTarget?.isShimmering) {
                    const shimmer = Phaser.Math.Between(1, 100);
                    if (shimmer > 50) {
                        this.attackedTarget?.shimmerHit();
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

                if (this.attackedTarget.isMenacing) this.attackedTarget.menace(); 
                if (this.attackedTarget.isMultifaring) this.attackedTarget.multifarious(); 
                if (this.attackedTarget.isMystifying) this.attackedTarget.mystify(); 
            };
            const match = this.enemyIdMatch();
            if (match === true) {
                this.scene.combatManager.combatMachine.action({ type: 'Weapon', data: { key: 'action', value: action }});
            } else {
                this.scene.combatManager.combatMachine.action({ type: 'Player', data: { 
                    playerAction: { 
                        action: action, 
                        thrust: this.scene.state.parryGuess 
                    },  
                    enemyID: this.attackedTarget.enemyID, 
                    ascean: this.attackedTarget.ascean, 
                    damageType: this.attackedTarget.currentDamageType, 
                    combatStats: this.attackedTarget.combatStats, 
                    weapons: this.attackedTarget.weapons, 
                    health: this.attackedTarget.health, 
                    actionData: { 
                        action: this.attackedTarget.currentAction, 
                        thrust: this.attackedTarget.parryAction 
                    },
                }});
            };
        } else {
            const action = this.checkPlayerAction();
            if (!action) return;
            if (!this.isAstrifying) {
                if (this?.attackedTarget?.isShimmering && Phaser.Math.Between(1, 100) > 50) {
                    this?.attackedTarget?.shimmerHit();
                    return;
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
                this.scene.combatManager.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: action } });
            } else {
                this.scene.combatManager.combatMachine.action({ type: 'Player', data: { 
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
            this.scene.combatManager.paralyze(this.attackedTarget.enemyID);
            this.isStealthing = false;
            this.scene.combatEngaged(true);
            this.inCombat = true;
            this.attackedTarget.jumpIntoCombat();
            EventBus.emit('update-stealth');
        };
    };

    playerDodge = () => {
        this.dodgeCooldown = 50; // Was a 6x Mult for Dodge Prev aka 1728
        let currentDistance = 0;
        const dodgeLoop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= PLAYER.DODGE.DURATION || currentDistance >= PLAYER.DODGE.DISTANCE) {
                this.spriteWeapon.setVisible(true);
                this.dodgeCooldown = 0;
                this.isDodging = false;
                return;
            };
            const moveX = Math.abs(this.velocity.x) > 0.1;
            const moveY = Math.abs(this.velocity.y) > 0.1;
            const dirX = this.flipX ? -PLAYER.DODGE.MULTIPLIER : PLAYER.DODGE.MULTIPLIER; // -(PLAYER.DODGE.DISTANCE / PLAYER.DODGE.DURATION) : (PLAYER.DODGE.DISTANCE / PLAYER.DODGE.DURATION);
            const dirY = this.velocity.y > 0 ? PLAYER.DODGE.MULTIPLIER : this.velocity.y < 0 ? -PLAYER.DODGE.MULTIPLIER : 0; //  -(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION) : (PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            if (moveX) this.setVelocityX(moveY ? dirX * 0.7 : dirX);
            if (moveY) this.setVelocityY(moveX ? dirY * 0.7 : dirY);
            currentDistance += Math.abs(PLAYER.DODGE.MULTIPLIER); // Math.abs(PLAYER.DODGE.DISTANCE / PLAYER.DODGE.DURATION);
            // console.log(`%c Current Distance: ${currentDistance}`, 'color:gold');
            requestAnimationFrame(dodgeLoop);
        };
        let startTime = undefined;
        requestAnimationFrame(dodgeLoop);
    };

    playerRoll = () => {
        this.rollCooldown = 50; // Was a x7 Mult for Roll Prev aka 2240
        let currentDistance = 0;
        const rollLoop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= PLAYER.ROLL.DURATION || currentDistance >= PLAYER.ROLL.DISTANCE) {
                this.spriteWeapon.setVisible(true);
                this.rollCooldown = 0;
                this.isRolling = false;
                return;
            };
            const moveX = Math.abs(this.velocity.x) > 0.1;
            const moveY = Math.abs(this.velocity.y) > 0.1;
            const dirX = this.flipX ? -PLAYER.ROLL.MULTIPLIER : PLAYER.ROLL.MULTIPLIER; //  -(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION) : (PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            const dirY = this.velocity.y > 0 ? PLAYER.ROLL.MULTIPLIER : this.velocity.y < 0 ? -PLAYER.ROLL.MULTIPLIER : 0; //  -(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION) : (PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            if (moveX) this.setVelocityX(moveY ? dirX * 0.7 : dirX);
            if (moveY) this.setVelocityY(moveX ? dirY * 0.7 : dirY);
            currentDistance += Math.abs(PLAYER.ROLL.MULTIPLIER); // Math.abs(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            // console.log(`%c Current Distance: ${currentDistance}`, 'color:gold');
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
        if (this.scene.settings.desktop === true && !this.isSuffering()) {
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
            if (Input.Keyboard.JustDown(this.inputKeys.attack.ONE)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.actions[0].toLowerCase());
                const clear = this.inputClear(button.name.toLowerCase());
                if (button.isReady === true && clear === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.posture.TWO)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.actions[1].toLowerCase());
                const clear = this.inputClear(button.name.toLowerCase());
                if (button.isReady === true && clear === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.roll.THREE)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.actions[2].toLowerCase());
                const clear = this.inputClear(button.name.toLowerCase());
                if (button.isReady === true && clear === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.dodge.FOUR)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.actions[3].toLowerCase());
                const clear = this.inputClear(button.name.toLowerCase());
                if (button.isReady === true && clear === true) this.scene.actionBar.pressButton(button, this.scene);
            };
            if (Input.Keyboard.JustDown(this.inputKeys.parry.FIVE)) {
                const button = this.scene.actionBar.getButton(this.scene.settings.actions[4].toLowerCase());
                const clear = this.inputClear(button.name.toLowerCase());
                if (button.isReady === true && clear === true) this.scene.actionBar.pressButton(button, this.scene);
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
            this.anims.play('player_attack_1', true).on('animationcomplete', () => this.isParrying = false); 
        } else if (this.isThrusting) {
            sprint(this.scene);
            this.anims.play('player_attack_2', true).on('animationcomplete', () => this.isThrusting = false);
        } else if (this.isDodging) { 
            this.anims.play('player_slide', true);
            if (this.dodgeCooldown === 0) this.playerDodge();
        } else if (this.isRolling) { 
            sprint(this.scene);
            this.anims.play('player_roll', true);
            if (this.rollCooldown === 0) this.playerRoll();
        } else if (this.isPosturing) {
            sprint(this.scene);
            this.anims.play('player_attack_3', true).on('animationcomplete', () => this.isPosturing = false);
        } else if (this.isAttacking) {
            sprint(this.scene);
            this.anims.play('player_attack_1', true).on('animationcomplete', () => this.isAttacking = false); 
        } else if (this.moving()) {
            if (this.isClimbing) {
                walk(this.scene);
                this.anims.play('player_climb', true);
            } else if (this.inWater) {
                walk(this.scene);
                if (this.velocity.y > 0) {
                    this.anims.play('swim_down', true);
                } else {
                    this.anims.play('swim_up', true);
                };
            } else {
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
            } else if (this.particleEffect.collided) {
                this.scene.particleManager.removeEffect(this.particleEffect.id);
                this.particleEffect = undefined;                
            } else {
                this.scene.particleManager.updateParticle(this.particleEffect);
            };
        };
        if (this.isConfused && !this.playerMachine.stateMachine.isCurrentState(States.CONFUSED)) {
            this.playerMachine.stateMachine.setState(States.CONFUSED);
            return;
        };
        if (this.isFeared && !this.playerMachine.stateMachine.isCurrentState(States.FEARED)) {
            this.playerMachine.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isFrozen && !this.playerMachine.negativeMachine.isCurrentState(States.FROZEN)) {
            this.playerMachine.negativeMachine.setState(States.FROZEN);
            return;
        };
        if (this.isPolymorphed && !this.playerMachine.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.playerMachine.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if (this.isSlowed && !this.playerMachine.negativeMachine.isCurrentState(States.SLOWED)) {
            this.playerMachine.negativeMachine.setState(States.SLOWED);
            return;
        };
        if (this.isSnared && !this.playerMachine.negativeMachine.isCurrentState(States.SNARED)) {
            this.playerMachine.negativeMachine.setState(States.SNARED); 
            return;    
        };
        if (this.isStunned && !this.playerMachine.stateMachine.isCurrentState(States.STUN)) {
            this.playerMachine.stateMachine.setState(States.STUN);
            return;
        };
        if (this.scene.combat === true && (!this.currentTarget || !this.currentTarget.inCombat)) this.findEnemy(); // this.inCombat === true && state.combatEngaged
        // if (this.inCombat && !this.healthbar.visible) this.healthbar.setVisible(true);
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
        if (this.scene.settings.desktop === true) {
            if (this.inputKeys.right.D.isDown || this.inputKeys.right.RIGHT.isDown) {
                this.playerVelocity.x += this.acceleration;
                this.flipX = false;
            };
            if (this.inputKeys.left.A.isDown || this.inputKeys.left.LEFT.isDown) {
                this.playerVelocity.x -= this.acceleration;
                this.flipX = true;
            };
            if ((this.inputKeys.up.W.isDown || this.inputKeys.up.UP.isDown)) {
                this.playerVelocity.y -= this.acceleration;
            }; 
            if (this.inputKeys.down.S.isDown || this.inputKeys.down.DOWN.isDown) {
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
            if (!this.isSuffering() && !this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.left.A.isDown) {
                this.playerVelocity.x = 0;
            };
            if (!this.isSuffering() && !this.inputKeys.left.A.isDown && !this.inputKeys.left.LEFT.isDown && this.playerVelocity.x !== 0 && !this.inputKeys.right.D.isDown && !this.inputKeys.right.RIGHT.isDown) {
                this.playerVelocity.x = 0;
            };
            if (!this.isSuffering() && !this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown) {
                this.playerVelocity.y = 0;
            };
            if (!this.isSuffering() && !this.inputKeys.down.S.isDown && !this.inputKeys.down.DOWN.isDown && this.playerVelocity.y !== 0 && !this.inputKeys.up.W.isDown && !this.inputKeys.up.UP.isDown) {
                this.playerVelocity.y = 0;
            };
        } else {
            if (this.scene.joystickKeys.right.isDown) {
                this.playerVelocity.x += this.acceleration;
                this.flipX = false;
            };
            if (this.scene.joystickKeys.left.isDown) {
                this.playerVelocity.x -= this.acceleration;
                this.flipX = true;
            };
            if (this.scene.joystickKeys.up.isDown) {
                this.playerVelocity.y -= this.acceleration;
            }; 
            if (this.scene.joystickKeys.down.isDown) {
                this.playerVelocity.y += this.acceleration;
            };
            if (this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x > 0) {
                speed += 0.1;
                this.flipX = true;
            };
            if (this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x < 0) {
                speed -= 0.1;    
                this.flipX = false;
            };
            if (!this.isSuffering() && this.playerVelocity.x !== 0 && !this.scene.joystickKeys.left.isDown && !this.scene.joystickKeys.right.isDown) {
                this.playerVelocity.x = 0;
            };
            if (!this.isSuffering() && this.playerVelocity.x !== 0 && !this.scene.joystickKeys.right.isDown && !this.scene.joystickKeys.left.isDown) {
                this.playerVelocity.x = 0;
            };
            if (!this.isSuffering() && this.playerVelocity.y !== 0 && !this.scene.joystickKeys.down.isDown && !this.scene.joystickKeys.up.isDown) {
                this.playerVelocity.y = 0;
            };
            if (!this.isSuffering() && this.playerVelocity.y !== 0 && !this.scene.joystickKeys.up.isDown && !this.scene.joystickKeys.down.isDown) {
                this.playerVelocity.y = 0;
            };
        };
        if (this.isAttacking || this.isParrying || this.isPosturing || this.isThrusting) speed += 1;
        if (this.isClimbing || this.inWater) speed *= 0.65;
        this.playerVelocity.limit(speed);
        this.setVelocity(this.playerVelocity.x, this.playerVelocity.y);

    }; 

    update() {
        this.handleConcerns();
        this.handleActions();
        this.handleAnimations();
        this.handleMovement(); 
        this.playerMachine.update(this.dt);
    };  
};