export const FRAME_COUNT = {
    ATTACK_LIVE: 16,
    ATTACK_SUCCESS: 39,
    PARRY_LIVE: 12, 
    PARRY_SUCCESS: 22,
    PARRY_KILL: 35,
    POSTURE_LIVE: 16, // 11 for frameRate: 12
    POSTURE_SUCCESS: 17, // 11 for frameRate: 12
    ROLL_LIVE: 10,
    ROLL_SUCCESS: 20,
    THRUST_LIVE: 5, 
    THRUST_SUCCESS: 10,
    DISTANCE_CLEAR: 51,
}; 
const GLOW_INTENSITY = 0.25;
const SPEED = 1.5
export const SWING_TIME = { 'One Hand': 1250, 'Two Hand': 1500 }; // 750, 1250 [old]
export const ENEMY_SWING_TIME = { 'One Hand': 1000, 'Two Hand': 1250 }; // 750, 1250 [old]
const DAMAGE_TYPES = { 
    'magic': ['earth', 'fire', 'frost', 'lightning', 'righteous', 'spooky', 'sorcery', 'wild', 'wind'], 
    'physical': ['blunt', 'pierce', 'slash'] 
};
export default class Entity extends Phaser.Physics.Matter.Sprite {
    static preload(scene) { 
        scene.load.atlas(`player_actions`, '../assets/gui/player_actions.png', '../assets/gui/player_actions_atlas.json');
        scene.load.animation(`player_actions_anim`, '../assets/gui/player_actions_anim.json');
        scene.load.atlas(`player_actions_two`, '../assets/gui/player_actions_two.png', '../assets/gui/player_actions_two_atlas.json');
        scene.load.animation(`player_actions_two_anim`, '../assets/gui/player_actions_two_anim.json');
        scene.load.atlas(`player_actions_three`, '../assets/gui/player_actions_three.png', '../assets/gui/player_actions_three_atlas.json');
        scene.load.animation(`player_actions_three_anim`, '../assets/gui/player_actions_three_anim.json');
        scene.load.atlas(`player_attacks`, '../assets/gui/player_attacks.png', '../assets/gui/player_attacks_atlas.json');
        scene.load.animation(`player_attacks_anim`, '../assets/gui/player_attacks_anim.json');   
        scene.load.atlas(`running`, '../assets/gui/running.png', '../assets/gui/running_atlas.json');
        scene.load.animation(`running_anim`, '../assets/gui/running_anim.json');   
        scene.load.atlas(`swimming`, '../assets/gui/swimming.png', '../assets/gui/swimming_atlas.json');
        scene.load.animation(`swimming_anim`, '../assets/gui/swimming_anim.json');   
        scene.load.atlas('rabbit_idle', '../assets/gui/rabbit_idle.png', '../assets/gui/rabbit_idle_atlas.json');
        scene.load.animation('rabbit_idle_anim', '../assets/gui/rabbit_idle_anim.json');
        scene.load.atlas('rabbit_movement', '../assets/gui/rabbit_movement.png', '../assets/gui/rabbit_movement_atlas.json');
        scene.load.animation('rabbit_movement_anim', '../assets/gui/rabbit_movement_anim.json');
    };

    constructor (data) {
        let { scene, x, y, texture, frame, depth, name, ascean, health } = data;
        super (scene.matter.world, x, y, texture, frame);
        this.x += this.width / 2;
        this.y -= this.height / 2;
        this.depth = depth || 2;
        this.name = name;
        this.ascean = ascean;
        this.health = health;
        this.combatStats = undefined;
        this.stamina = 0;
        this._position = new Phaser.Math.Vector2(this.x, this.y);
        this.scene.add.existing(this);
        this.setVisible(false);
        this.glowFilter = this.scene.plugins.get('rexGlowFilterPipeline');
        this.isAttacking = false;
        this.isParrying = false;
        this.isDodging = false;
        this.isPosturing = false;
        this.isRolling = false;

        this.isStalwart = false;
        this.isStealthing = false;
        this.isCasting = false;
        
        this.isAtEdge = false;
        this.isBlindsided = false;
        this.isClimbing = false;
        this.inCombat = false;
        this.isConsuming = false;
        this.isCrouching = false;
        this.isDead = false;
        this.isJumping = false;
        this.isHanging = false;
        this.isHurt = false;
        this.isPraying = false;
        this.isStrafing = false;
        this.isStalwart = false;
        this.isRanged = false;
        this.hasMagic = false;
        this.hasBow = false;

        this.isArcing = false;
        this.isChiomic = false;
        this.isEnveloping = false;
        this.isFreezing = false;
        this.isHealing = false;
        this.isLeaping = false;
        this.isMalicing = false;
        this.isMenacing = false;
        this.isMending = false;
        this.isModerating = false;
        this.isMultifaring = false;
        this.isMystifying = false;
        this.isProtecting = false;
        this.isPursuing = false;
        this.isReining = false;
        this.isRushing = false;
        this.isShielding = false;
        this.isShimmering = false;
        this.isSprinting = false;
        this.isSuturing = false;
        this.isTshaering = false;
        this.isWarding = false;
        this.isWrithing = false;

        this.isConfused = false;
        this.isConsumed = false;
        this.isFeared = false;
        this.isFrozen = false;
        this.isParalyzed = false;
        this.isPolymorphed = false;
        this.isRooted = false;
        this.isSlowed = false;
        this.isSnared = false;
        this.isStunned = false;
        this.count = {
            confused: 0,
            feared: 0,
            frozen: 0,
            paralyzed: 0,
            polymorphed: 0,
            rooted: 0,
            slowed: 0,
            snared: 0,
            stunned: 0,
        };

        this.actionAvailable = false;
        this.actionSuccess = false;
        this.actionTarget = undefined;
        this.actionParryable = false;
        this.dodgeCooldown = 0;
        this.invokeCooldown = 0;
        this.playerBlessing = '';
        this.prayerConsuming = '';
        this.rollCooldown = 0;

        this.attacking = undefined;
        this.sensor = undefined;
        this.interacting = [];
        this.targets = [];
        this.touching = [];
        this.rushedEnemies = [];
        this.knockbackActive = false;
        this.knocedBack = false; 
        this.knockbackForce = 0.1; // 0.1 is for Platformer, trying to lower it for Top Down
        this.knockbackDirection = {};
        this.knockbackDuration = 250;
        
        this.spriteShield = undefined;
        this.spriteWeapon = undefined;
        this.frameCount = 0;
        this.currentWeaponSprite = '';
        this.particleEffect = undefined;
        this.stunTimer = undefined;
        this.stunDuration = 2500;
        
        this.currentDamageType = undefined;
        this.currentRound = 0; 
        this.currentAction = '';
        this.currentActionFrame = 0;
        this.interruptCondition = false;
        this.scrollingCombatText = undefined;
        this.winningCombatText = undefined;
        this.specialCombatText = undefined;
        this.resistCombatText = undefined;

        this.path = [];
        this.nextPoint = {};
        this.pathDirection = {};
        this.isPathing = false;
        this.chaseTimer = undefined;
        this.leashTimer = undefined;
        this.canSwing = true;
        this.swingTimer = 0; 
        this.isGlowing = false;
        this.glowing = false;
        this.glowWeapon = undefined;
        this.glowHelm = undefined;
        this.glowChest = undefined;
        this.glowLegs = undefined;
        this.glowSelf = undefined;
        this.speed = 0;
        this.glowColor = this.setColor(this.ascean?.mastery);
    };

    get position() {
        this._position.set(this.x, this.y);
        return this._position;
    };

    get velocity() {
        return this.body.velocity;
    };

    startingSpeed = (entity) => {
        let speed = SPEED; // PLAYER.SPEED.INITIAL
        if (this.name === 'player') {
            speed += this.scene.settings.difficulty.playerSpeed || 0;
        } else {
            speed += this.scene.settings.difficulty.enemySpeed || 0;
        };
        const helmet = entity.helmet.type;
        const chest = entity.chest.type;
        const legs = entity.legs.type;
        let modifier = 0;
        const addModifier = (item) => {
            switch (item) {
                case 'Leather-Cloth':
                    // modifier -= 0.02; // += 0.05;
                    break;
                case 'Leather-Mail':
                    modifier -= 0.0125; // += 0.025;
                    break;
                case 'Chain-Mail':
                    modifier -= 0.025 // += 0.0;
                    break;
                case 'Plate-Mail':
                    modifier -= 0.035 // -= 0.025;
                    break;
                default:
                    break;
            };
        };
        addModifier(helmet);
        addModifier(chest);
        addModifier(legs);
        speed += modifier;
        return speed;
    };

    setGlow = (object, glow, type = undefined) => {
        this.glowColor = this.setColor(this.ascean?.mastery);
        this.glowFilter.remove(object);
        if (!glow) {
            switch (type) {
                case 'shield':
                    if (this.glowShield !== undefined) {
                        this.glowShield.remove(false);
                        this.glowShield.destroy();
                        this.glowShield = undefined;
                    };
                    break;
                case 'weapon':
                    if (this.glowWeapon !== undefined) {
                        this.glowWeapon.remove(false);
                        this.glowWeapon.destroy();
                        this.glowWeapon = undefined;
                    };
                    break;
                default:
                    if (this.glowSelf !== undefined) {
                        this.glowSelf.remove(false);
                        this.glowSelf.destroy();
                        this.glowSelf = undefined;
                    };
                    break;        
            };
            return; 
        };
        this.updateGlow(object);
        switch (type) {
            case 'shield':
                this.glowShield = this.scene.time.addEvent({
                    delay: 200, // 125 Adjust the delay as needed
                    callback: () => this.updateGlow(object),
                    loop: true,
                    callbackScope: this
                });
                break;
            case 'weapon':
                this.glowWeapon = this.scene.time.addEvent({
                    delay: 200,
                    callback: () => this.updateGlow(object),
                    loop: true,
                    callbackScope: this
                });
                break;
            default:
                this.glowSelf = this.scene.time.addEvent({
                    delay: 200,
                    callback: () => this.updateGlow(object),
                    loop: true,
                    callbackScope: this
                });
                break;
        };
    };

    setColor = (mastery) => {
        switch (mastery) {
            case 'constitution': return 0xFDF6D8;
            case 'strength': return 0xFF0000;
            case 'agility': return 0x00FF00;
            case 'achre': return 0x0000FF;
            case 'caeren': return 0x800080;
            case 'kyosir': return 0xFFD700;
            default: return 0xFFFFFF;
        };
    };

    updateGlow = (object) => {
        this.glowFilter.remove(object);
        const outerStrength = 2 + Math.sin(this.scene.time.now * 0.005) * 2;
        const innerStrength = 2 + Math.cos(this.scene.time.now * 0.005) * 2;
        this.glowFilter.add(object, {
            outerStrength,
            innerStrength,
            glowColor: this.glowColor,
            intensity: GLOW_INTENSITY,
            knockout: true
        });
    }; 

    adjustSpeed = (speed) => {
        return this.speed += speed;
    };
    clearAnimations = () => {
        if (this.anims.currentAnim) this.anims.stop(this.anims.currentAnim.key);
    };
    checkIfAnimated = () => this.anims.currentAnim ? true : false;

    attack = () => { 
        this.anims.play(`player_attack_1`, true).on('animationcomplete', () => {
            this.isAttacking = false;
            this.currentAction = '';
        }); 
    };
    parry = () => { 
        this.anims.play('player_attack_1', true).on('animationcomplete', () => { 
            this.isParrying = false; 
            this.currentAction = '';
        });
    };
    posture = () => { 
        this.anims.play('player_attack_3', true).on('animationcomplete', () => {
            this.isPosturing = false;
            this.currentAction = '';
        }); 
    }; 
    thrust = () => { 
        this.anims.play('player_attack_2', true).on('animationcomplete', () => { 
            this.isThrusting = false; 
            this.currentAction = '';
        });
    };
    hurt = () => {
        this.clearAnimations();
        this.clearTint();
        this.anims.play('player_hurt', true).on('animationcomplete', () => {
            this.isHurt = false;
            this.setTint(0xFF0000);    
        }); 
    };
    knockback(id) {
        const enemy = this.scene.getEnemy(id);
        if (enemy === undefined) return;
        const x = this.x > enemy.x ? -0.05 : 0.05;
        const y = this.y > enemy.y ? -0.05 : 0.05;
        this.knockbackDirection = { x, y };
        const accelerationFrames = 10; 
        const accelerationStep = this.knockbackForce / accelerationFrames;
        const dampeningFactor = 0.9; 
        const knockbackDuration = 500;
        let currentForce = 0; 
        const knockbackLoop = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            if (elapsed >= knockbackDuration)  return;
            if (currentForce < this.knockbackForce) currentForce += accelerationStep;
            const forceX = (this.knockbackDirection.x * currentForce);
            const forceY = (this.knockbackDirection.y * currentForce);
            enemy.applyForce({ x: forceX, y: forceY });
            currentForce *= dampeningFactor;
            requestAnimationFrame(knockbackLoop);
        };
        let startTime = undefined;
        requestAnimationFrame(knockbackLoop);
        if ("vibrate" in navigator) navigator.vibrate(100);
    };
    moving = () => this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
    movingHorizontal = () => this.body.velocity.x !== 0 && this.body.velocity.y === 0;
    movingVertical = () => this.body.velocity.x === 0 && this.body.velocity.y !== 0;
    movingDown = () => this.body.velocity.x === 0 && this.body.velocity.y > 0;
    movingUp = () => this.body.velocity.x === 0 && this.body.velocity.y < 0;

    
    checkBow = (type) => type === 'Bow' || type === 'Greatbow';
    checkDamageType = (type, concern) => DAMAGE_TYPES[concern].includes(type);
    checkMeleeOrRanged = (weapon) => {
        if (weapon === undefined) return;
        this.isRanged = weapon?.attackType === 'Magic' || weapon?.type === 'Bow' || weapon?.type === 'Greatbow';
        if (this.name === 'player') {
            this.swingTimer = SWING_TIME[weapon?.grip] || 1500;
            this.weaponHitbox.width = weapon?.grip === 'One Hand' ? 40 : 45;
        } else {
            this.swingTimer = ENEMY_SWING_TIME[weapon?.grip] || 1000;
        };
        this.hasBow = this.checkBow(weapon.type);
    };
    checkPlayerResist = () => {
        const chance = Math.random() * 101;
        const resist = this.scene.state.playerDefense.magicalDefenseModifier / 4; // 0 - 25%
        if (chance > resist) {
            return true;
        } else {
            this.isCasting = false;
            this.scene.player.resist();
            return false;
        };
    };

    imgSprite = (item) => {
        return item.imgUrl.split('/')[3].split('.')[0];
    };

    hitBoxCheck = (enemy) => {
        if (!enemy || enemy.isDefeated === true) return;
        const xOffset = this.flipX ? 16 : -16;
        // let pointer = this.scene.add.graphics()
        //     .lineStyle(1, 0xFF0000, 1)
        //     .strokeRect(enemy.x + xOffset, enemy.y, 1, 1);
        for (let i = -32; i < 32; i++) {
            // pointer.clear();
            // pointer.strokeRect(enemy.x + xOffset, enemy.y + i, 1, 1);
            if (this.weaponHitbox.getBounds().contains(enemy.x + xOffset, enemy.y + i)) {
                this.attackedTarget = enemy;
                this.actionSuccess = true;
                return;
            };
        };
    };

    hook = (target, time) => {
        this.scene.tweens.add({
            targets: target,
            x: { from: target.x, to: this.x, duration: time },
            y: { from: target.y, to: this.y, duration: time }, 
            ease: 'Circ.easeInOut',
            onStart: () => this.beam.startEmitter(target, time),
            onComplete: () => this.beam.reset(),
            yoyo: false
        });
    };

    checkActionSuccess = (entity, target) => {
        if (entity === 'player') {
            if (this.flipX) {
                this.weaponHitbox.setAngle(270);
            } else {
                this.weaponHitbox.setAngle(0);
            };
            this.weaponHitbox.x = this.x + (this.flipX ? -16 : 16);
            this.weaponHitbox.y = this.y - 8;
            if (target === undefined) {
                if (this.targets.length === 0) {
                    if (this.touching.length === 0) {
                        return;
                    } else {
                        for (let i = 0; i < this.touching.length; i++) {
                            this.hitBoxCheck(this.touching[i]);
                        };
                    };
                } else {
                    for (let i = 0; i < this.targets.length; i++) {
                        this.hitBoxCheck(this.targets[i]);
                    };
                    return;
                };
            };
            this.hitBoxCheck(target);
        };
        if (entity === 'enemy' && target) {
            const direction = target.position.subtract(this.position);
            const distance = direction.length();
            if (distance < FRAME_COUNT.DISTANCE_CLEAR && !target.isProtecting) this.actionSuccess = true;
        };
    };

    weaponRotation = (entity, target) => {  
        if (!this.isPosturing && !this.isStalwart && this.spriteShield) this.spriteShield.setVisible(false); // && !this.isStrafing
        if (this.isDodging || this.isRolling) this.spriteShield.setVisible(false);
        if (!this.movingVertical()) {this.spriteWeapon.setVisible(true);this.spriteShield.setDepth(this.depth + 1);};
        if (this.isDodging || this.isRolling) this.spriteWeapon.setVisible(false);
        if (this.isStalwart && !this.isRolling && !this.isDodging) this.spriteShield.setVisible(true);
        if (this.isPraying || this.isCasting) {
            if (this.spriteWeapon.depth < 3) this.spriteWeapon.setDepth(3);
            if (this.flipX) {
                if (this.frameCount === 0) {
                    this.spriteWeapon.setOrigin(0.65, 1.5);
                    this.spriteWeapon.setAngle(-175);
                };
                if (this.frameCount === 8) {
                    this.spriteWeapon.setOrigin(-0.3, 0.65);
                    this.spriteWeapon.setAngle(-225);
                };
            } else {
                if (this.frameCount === 0) {
                    this.spriteWeapon.setOrigin(-0.75, 0.65);
                    this.spriteWeapon.setAngle(-275);
                };
                if (this.frameCount === 8) {
                    this.spriteWeapon.setOrigin(0.35, 1.3);
                    this.spriteWeapon.setAngle(-225);
                }; 
            };
            this.frameCount += 1;
        } else if (this.isParrying) { 
            if (this.frameCount === FRAME_COUNT.PARRY_SUCCESS) {
                if (this.isRanged === false) this.checkActionSuccess(entity, target);
            };
            if (this.spriteWeapon.depth !== 1) this.spriteWeapon.setDepth(1);
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.15, 0.85);
                        this.spriteWeapon.setAngle(90);
                    };
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(72.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(90);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(130);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(170);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(210);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(250);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.5);
                        this.spriteWeapon.setAngle(340);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(290);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(250);
                    };
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.85, 0.1);
                        this.spriteWeapon.setAngle(0);
                    }
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(17.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(0);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-30);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-60);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-120);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-75);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-10);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(-125);
                    };
                }; 
            } else {
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.25, 1.2);
                        this.spriteWeapon.setAngle(-250);
                        if (entity === 'enemy') this.setTint(0x00FF00);
                    };
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-267.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(-250);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-210);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-170);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-130);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(0);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(30);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 1.1);
                        this.spriteWeapon.setAngle(55);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.15, 1.25);
                        this.spriteWeapon.setAngle(-185);
                        if (entity === 'enemy') this.setTint(0x00FF00);
                    };
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-182.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(150);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(120);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(90);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(60);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(30);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(-0.25, 0.75);
                        this.spriteWeapon.setAngle(-75);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-150);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                };
            };
            this.frameCount += 1;
        } else if (this.isThrusting) { 
            if (this.frameCount === FRAME_COUNT.THRUST_LIVE) {
                if (entity === 'player' && this.isRanged) { // && this.inCombat
                    if (this.hasMagic) this.particleEffect = this.scene.particleManager.addEffect('thrust', this, this.currentDamageType);
                    if (this.hasBow) this.particleEffect = this.scene.particleManager.addEffect('thrust', this, 'arrow');
                };
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic && this.attacking) this.particleEffect = this.scene.particleManager.addEffect('thrust', this, this.currentDamageType);
                    if (this.hasBow && this.attacking) this.particleEffect = this.scene.particleManager.addEffect('thrust', this, 'arrow');
                };
            }; 
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                if (this.flipX) {
                    this.spriteWeapon.setOrigin(0.1, 0.2);
                    this.spriteWeapon.setAngle(-225);
                } else {
                    this.spriteWeapon.setOrigin(0.25, 0);
                    this.spriteWeapon.setAngle(-45);
                };
            } else {
                if (this.flipX) {
                    this.spriteWeapon.setOrigin(-0.4, 1.6);
                    this.spriteWeapon.setAngle(-135);
                } else {
                    this.spriteWeapon.setOrigin(-0.4, 1.2);
                    this.spriteWeapon.setAngle(45);
                }; 
            };
            if (entity === 'enemy' && this.frameCount === 0) this.setTint(0x00FF00);
            if (this.frameCount === FRAME_COUNT.THRUST_SUCCESS) {
                if (this.isRanged === false) this.checkActionSuccess(entity, target);
            };
            this.frameCount += 1; 
        } else if (this.isRolling) {
            if (this.frameCount === FRAME_COUNT.ROLL_LIVE) {
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic) this.particleEffect = this.scene.particleManager.addEffect('roll', this, this.currentDamageType);
                    if (this.hasBow) this.particleEffect = this.scene.particleManager.addEffect('roll', this, 'arrow');
                };
                if (entity === 'enemy' && this.frameCount === 0) {
                    this.setTint(0x00FF00);
                };
            };
            if (this.frameCount === (FRAME_COUNT.ROLL_SUCCESS - 2) && !this.isRanged) { // && entity === 'enemy'
                this.checkActionSuccess(entity, target);
            };
            this.frameCount += 1;
        } else if (this.isAttacking) {
            if (this.frameCount === FRAME_COUNT.ATTACK_LIVE) {
                if (entity === 'player' && this.isRanged) {
                    if (this.hasMagic) this.particleEffect = this.scene.particleManager.addEffect('attack', this, this.currentDamageType);
                    if (this.hasBow) this.particleEffect = this.scene.particleManager.addEffect('attack', this, 'arrow');
                };
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic) this.particleEffect = this.scene.particleManager.addEffect('attack', this, this.currentDamageType);
                    if (this.hasBow) this.particleEffect = this.scene.particleManager.addEffect('attack', this, 'arrow');
                };
            };
            if (this.spriteWeapon.depth !== 1) this.spriteWeapon.setDepth(1);
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.15, 0.85);
                        this.spriteWeapon.setAngle(90);
                    };
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(72.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(90);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(130);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(170);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(210);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(250);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.5);
                        this.spriteWeapon.setAngle(340);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(290);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(250);
                    };
                    if (this.frameCount === 32) {
                        this.spriteWeapon.setOrigin(0.25, 0.25);
                        this.spriteWeapon.setAngle(-45);
                    };
                    if (this.frameCount === 33) {
                        this.spriteWeapon.setAngle(-30);
                    }
                    if (this.frameCount === 34) {
                        this.spriteWeapon.setAngle(-15);
                    };
                    if (this.frameCount === 35) {
                        this.spriteWeapon.setAngle(0);
                    };
                    if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(15);
                    };
                    if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(0.15, 0.85);
                        this.spriteWeapon.setAngle(30);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(45);
                    };
                    if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(60);
                    }; 
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(0.85, 0.1);
                        this.spriteWeapon.setAngle(0);
                    }
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(17.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(0);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-30);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-60);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-120);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-75);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-10);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 0.5);
                        this.spriteWeapon.setAngle(-125);
                    };
                    if (this.frameCount === 32) {
                        this.spriteWeapon.setOrigin(0.25, 0.25);
                        this.spriteWeapon.setAngle(45);
                    };
                    if (this.frameCount === 33) {
                        this.spriteWeapon.setAngle(60);
                    }
                    if (this.frameCount === 34) {
                        this.spriteWeapon.setAngle(75);
                    };
                    if (this.frameCount === 35) {
                        this.spriteWeapon.setAngle(90);
                    };
                    if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(75);
                    };
                    if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(0.85, 0.1);
                        this.spriteWeapon.setAngle(60);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(45);
                    };
                    if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(30);
                    }; 
                };
            } else {
                if (this.flipX) {
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.25, 1.2);
                        this.spriteWeapon.setAngle(-250);
                        if (entity === 'enemy') this.setTint(0x00FF00);
                    };
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-267.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(-250);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(-210);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-170);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(-130);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(0);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(30);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0.25, 1.1);
                        this.spriteWeapon.setAngle(55);
                    };
                    if (this.frameCount === 35) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(30);
                    };
                    if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(0);
                    };
                    if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(-0.25, 1.2);
                        this.spriteWeapon.setAngle(-90);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(-130);
                    };
                    if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(-170);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                    if (this.frameCount === 40) {
                        this.spriteWeapon.setAngle(-210);
                    };
                    if (this.frameCount === 41) {
                        this.spriteWeapon.setAngle(-250);
                    };
                    if (this.frameCount === 42) {
                        this.spriteWeapon.setAngle(-267.5);
                    };
                } else { 
                    if (this.frameCount === 0) { 
                        this.spriteWeapon.setOrigin(-0.15, 1.25);
                        this.spriteWeapon.setAngle(-185);
                        if (entity === 'enemy') this.setTint(0x00FF00);
                    };
                    if (this.frameCount === 4) {
                        this.spriteWeapon.setAngle(-182.5);
                    };
                    if (this.frameCount === 12) {
                        this.spriteWeapon.setAngle(150);
                    };
                    if (this.frameCount === 13) {
                        this.spriteWeapon.setAngle(120);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(90);
                    };
                    if (this.frameCount === 15) {
                        this.spriteWeapon.setAngle(60);
                    };
                    if (this.frameCount === 16) {
                        this.spriteWeapon.setAngle(30);
                    };
                    if (this.frameCount === 18) {
                        this.spriteWeapon.setOrigin(-0.25, 0.75);
                        this.spriteWeapon.setAngle(-75);
                    };
                    if (this.frameCount === 20) {
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 22) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-150);
                    };
                    if (this.frameCount === 35) {
                        this.spriteWeapon.setOrigin(-0.25, 0.75);
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 36) {
                        this.spriteWeapon.setAngle(-75);
                    };
                    if (this.frameCount === 37) {
                        this.spriteWeapon.setOrigin(-0.15, 1.25);
                        this.spriteWeapon.setAngle(30);
                    }; 
                    if (this.frameCount === 38) {
                        this.spriteWeapon.setAngle(60);
                    };
                    if (this.frameCount === 39) {
                        this.spriteWeapon.setAngle(90);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                    if (this.frameCount === 40) {
                        this.spriteWeapon.setAngle(120);
                    };
                    if (this.frameCount === 41) {
                        this.spriteWeapon.setAngle(150);
                    };
                    if (this.frameCount === 42) {
                        this.spriteWeapon.setAngle(-180);
                    };
                };
            };
            this.frameCount += 1;
        } else if (this.isPosturing) {
            if (this.frameCount === FRAME_COUNT.POSTURE_LIVE) {
                if (entity === 'player' && this.isRanged) { // && this.inCombat
                    if (this.hasMagic) this.particleEffect = this.scene.particleManager.addEffect('posture', this, this.currentDamageType);
                    if (this.hasBow) this.particleEffect = this.scene.particleManager.addEffect('posture', this, 'arrow');
                };
                if (entity === 'enemy' && this.attacking && this.inCombat && this.isRanged) {
                    if (this.hasMagic && this.attacking) this.particleEffect = this.scene.particleManager.addEffect('posture', this, this.currentDamageType);
                    if (this.hasBow && this.attacking) this.particleEffect = this.scene.particleManager.addEffect('posture', this, 'arrow');
                };
            }; 
            if (this.spriteWeapon.depth !== 1) this.spriteWeapon.setDepth(1);
            this.spriteShield.setVisible(true);
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(3);
                this.spriteShield.setVisible(false);
                if (this.flipX) {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0.75, 0);
                        this.spriteWeapon.setAngle(235);
                    };
                    if (this.frameCount === 5) {
                        this.spriteWeapon.setAngle(155);
                    };
                    if (this.frameCount === 8) {
                        this.spriteWeapon.setOrigin(0, 0.25);
                        this.spriteWeapon.setAngle(135);
                    };  
                } else {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-165);
                    };
                    if (this.frameCount === 5) {
                        this.spriteWeapon.setAngle(-90);
                    };
                    if (this.frameCount === 8) {
                        this.spriteWeapon.setOrigin(0.25, 0);
                        this.spriteWeapon.setAngle(-45);
                    };  
                };
            } else { 
                if (this.flipX) {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0.25, 1.1);
                        this.spriteWeapon.setAngle(55);
                        this.spriteShield.setOrigin(1, 0.15);
                        if (entity === 'enemy') this.setTint(0x00FF00);
                    };
                    if (this.frameCount === 5) {
                        this.spriteWeapon.setOrigin(0.5, 0.75);
                        this.spriteWeapon.setAngle(40);
                        this.spriteShield.setOrigin(1.05, 0.15)
                    };
                    if (this.frameCount === 8) {
                        this.spriteWeapon.setAngle(25);
                        this.spriteShield.setOrigin(1.1, 0.15);
                    }; 
                    if (this.frameCount === 11) {
                        this.spriteWeapon.setOrigin(0, 1.2);
                        this.spriteWeapon.setAngle(-220);
                        this.spriteShield.setOrigin(1.15, 0.15);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setOrigin(0, 1.4);
                        this.spriteWeapon.setAngle(-235);
                        this.spriteShield.setOrigin(1.2, 0.15);
                    };
                    if (this.frameCount === 17) {
                        this.spriteWeapon.setAngle(-250);
                        this.spriteShield.setOrigin(1, 0.15);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    }; 
                } else {
                    if (this.frameCount === 0) {
                        this.spriteWeapon.setOrigin(0, 0.5);
                        this.spriteWeapon.setAngle(-165);
                        this.spriteShield.setOrigin(0, 0.25);
                        if (entity === 'enemy') this.setTint(0x00FF00);
                    };
                    if (this.frameCount === 5) {
                        this.spriteWeapon.setOrigin(0, 1);
                        this.spriteWeapon.setAngle(-45);
                        this.spriteShield.setOrigin(-0.05, 0.15);
                    };
                    if (this.frameCount === 8) {
                        this.spriteWeapon.setOrigin(-0.25, 1.1);
                        this.spriteWeapon.setAngle(15);
                        this.spriteShield.setOrigin(-0.1, 0.15);
                    }; 
                    if (this.frameCount === 11) {
                        this.spriteWeapon.setOrigin(-0.1, 1.2);
                        this.spriteWeapon.setAngle(-205);
                        this.spriteShield.setOrigin(-0.15, 0.15);
                    };
                    if (this.frameCount === 14) {
                        this.spriteWeapon.setAngle(-190);
                        this.spriteShield.setOrigin(-0.2, 0.15);
                    };
                    if (this.frameCount === 17) { 
                        this.spriteWeapon.setAngle(-175);
                        this.spriteShield.setOrigin(0, 0.15);
                        if (this.isRanged === false) this.checkActionSuccess(entity, target);
                    };
                };
            };
            this.frameCount += 1;
        } else if (this.movingVertical()) {
            if (!this.flipX) {
                if (this.isStalwart) {
                    this.spriteShield.setOrigin(-0.2, 0.25);
                };    
            } else {
                if (this.isStalwart) {
                    this.spriteShield.setOrigin(1.2, 0.25);
                };
            }
            if (this.movingDown()) {
                this.spriteShield.setDepth(this.depth + 1);
            } else {
                this.spriteShield.setDepth(this.depth - 1);
            };
            this.spriteWeapon.setVisible(false);
            this.frameCount = 0;
        } else if (((Math.abs(this.body.velocity.x) > 0.1 || Math.abs(this.body.velocity.y) > 0.1)) && !this.isRolling && !this.flipX) {
            if (this.isStalwart) {
                this.spriteShield.setOrigin(-0.2, 0.25);
            };
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(0.5, 0.25);
                this.spriteWeapon.setAngle(107.5);
            } else {
                this.spriteWeapon.setDepth(3);
                this.spriteWeapon.setOrigin(-0.25, 0.5);
                this.spriteWeapon.setAngle(107.5);
            };
            this.frameCount = 0;
        } else if (((Math.abs(this.body.velocity.x) > 0.1 || Math.abs(this.body.velocity.y) > 0.1)) && !this.isRolling && this.flipX) { 
            if (this.isStalwart) {
                this.spriteShield.setOrigin(1.2, 0.25);
            };
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(0.25, 0.5);
                this.spriteWeapon.setAngle(-7.5);
            } else {
                this.spriteWeapon.setDepth(3);
                this.spriteWeapon.setOrigin(0.5, 1.2);
                this.spriteWeapon.setAngle(-194.5);
            };
            this.frameCount = 0;
        } else if (this.flipX) {
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                this.spriteWeapon.setOrigin(0.15, 0.85);
                this.spriteWeapon.setAngle(90);
            } else {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(-0.25, 1.2);
                this.spriteWeapon.setAngle(-250);
            };
            this.frameCount = 0;
        } else {
            if ((entity === 'player' && this.hasBow) || (entity === 'enemy' && this.hasBow)) {
                this.spriteWeapon.setDepth(this.depth + 1);
                this.spriteWeapon.setOrigin(0.85, 0.1);
                this.spriteWeapon.setAngle(0);
            } else {
                this.spriteWeapon.setDepth(1);
                this.spriteWeapon.setOrigin(-0.15, 1.3);
                this.spriteWeapon.setAngle(-195);
            };
            this.frameCount = 0;
        };
    };
};