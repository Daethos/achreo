import Entity, { assetSprite, FRAMES, Player_Scene, SWING_FORCE, SWING_FORCE_ATTRIBUTE, SWING_TIME } from "./Entity";  
import { screenShake, sprint, vibrate } from "../phaser/ScreenShake";
import { States } from "../phaser/StateMachine";
import HealthBar from "../phaser/HealthBar";
import PlayerMachine from "../phaser/PlayerMachine";
import { EventBus } from "../EventBus";
import CastingBar from "../phaser/CastingBar";
import { PHYSICAL_ACTIONS, PHYSICAL_EVASIONS, PLAYER, TALENT_COOLDOWN, TALENT_COST } from "../../utility/player";
import Beam from "../matter/Beam";
import Enemy from "./Enemy";
import Ascean from "../../models/ascean";
import NPC from "./NPC";
import Equipment from "../../models/equipment";
import { Compiler } from "../../utility/ascean";
import { ActionButton } from "../phaser/ActionButtons";
import { Combat } from "../../stores/combat";
import { BROADCAST_DEATH, COMPUTER_BROADCAST } from "../../utility/enemy";
import { ENTITY_FLAGS } from "../phaser/Collision";
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
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
    playerID: string;
    computerAction: boolean = false;
    currentTarget: undefined | Enemy = undefined;
    spellTarget: string = "";
    maxStamina: number;
    maxGrace: number;
    targetIndex: number = 1;
    isMoving: boolean = false;
    targetID: string = "";
    triggeredActionAvailable: any = undefined;
    staminaModifier: number = 0;
    strafingLeft: boolean = false;
    strafingRight: boolean = false;
    currentShieldSprite: string;
    playerVelocity: Phaser.Math.Vector2;
    fearCount: number = 0;
    acceleration: number;
    deceleration: number;
    dt: number;
    playerMachine: PlayerMachine;
    castingSuccess: boolean = false;
    isCounterSpelling: boolean = false;
    isCaerenic: boolean = false;
    paralyzeDuration: number = DURATION.PARALYZED;
    slowDuration: number = DURATION.SLOWED;
    defeatedDuration: number = PLAYER.DURATIONS.DEFEATED;
    highlight: Phaser.GameObjects.Graphics;
    highlightAnimation: boolean = false;
    mark: Phaser.GameObjects.Graphics;
    markAnimation: boolean = false;
    reactiveTarget: string;
    inputKeys: any;
    wasFlipped: boolean = false;
    specials: boolean = false;
    spellName: string = "";
    reconTimer: Phaser.Time.TimerEvent | undefined = undefined;
    isNetherswapping: boolean = false;
    isStimulating: boolean = false;
    netherswapTarget: Enemy | undefined = undefined;
    hookTime: number;
    isDiseasing: boolean = false;
    isSacrificing: boolean = false;
    isSlowing: boolean = false;
    reactiveName: string = "";
    confuseDirection = "down";
    confuseVelocity = { x: 0, y: 0 };
    polymorphVelocity = { x: 0, y: 0 };
    fearVelocity = { x: 0, y: 0 };
    isHowling: boolean = false;
    isBerserking: boolean = false;
    isBlinding: boolean = false;
    isCaerenesis: boolean = false;
    isScreaming: boolean = false;
    isRenewing: boolean = false;
    isEnduring: boolean = false;
    isConvicted: boolean = false;
    isImpermanent: boolean = false;
    isSeering: boolean = false;
    snareDuration = DURATION.SNARED;
    evasionTime: number = 0;
    prevInstinct: number = 0;
    currentEnemies: string[] | [] = [];
    chasing: boolean = false;
    hurtTime: number = 0;
    collider: any;
    jumpTime: number = 0;

    constructor(data: any) {
        const { scene } = data;
        const ascean = scene.registry.get("ascean");
        super({ ...data, name: "player", ascean: ascean, health: ascean?.health?.current || scene.state.newPlayerHealth });
        this.ascean = ascean;
        this.health = this.ascean.health.current;
        this.playerID = this.ascean._id;
        const weapon = this.ascean.weaponOne;
        this.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
        this.currentWeaponSprite = assetSprite(weapon);
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this.currentWeaponSprite);
        if (weapon.grip === "One Hand") {
            this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
            this.swingTimer = SWING_TIME["One Hand"];
        } else {
            this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
            this.swingTimer = SWING_TIME["Two Hand"];
        };
        this.spriteWeapon.setOrigin(0.25, 1);
        this.scene.add.existing(this);
        this.scene.add.existing(this.spriteWeapon);
        this.setVisible(true);
        this.spriteWeapon.setAngle(-195);
        this.currentDamageType = weapon?.damageType?.[0].toLowerCase() as string;
        this.currentTarget = undefined;
        this.stamina = scene?.state?.playerAttributes?.stamina || 0;
        this.maxStamina = scene?.state?.playerAttributes?.stamina;
        this.grace = scene?.state.playerAttributes?.grace || 0;
        this.maxGrace = scene?.state?.playerAttributes?.grace;
        this.isMoving = false;
        this.currentShieldSprite = assetSprite(this.ascean?.shield);
        this.spriteShield = this.createSprite(this.currentShieldSprite, 0, 0, PLAYER.SCALE.SHIELD, ORIGIN.SHIELD.X, ORIGIN.SHIELD.Y);
        this.spriteShield.setVisible(false);
        this.playerVelocity = new Phaser.Math.Vector2();
        this.speed = this.startingSpeed(ascean);
        this.acceleration = PLAYER.SPEED.ACCELERATION;
        this.deceleration = PLAYER.SPEED.DECELERATION;
        this.dt = this.scene.sys.game.loop.delta;
        this.playerMachine = new PlayerMachine(scene, this);
        this.setScale(PLAYER.SCALE.SELF);
        // let playerColliderFull = Bodies.rectangle(this.x, this.y + 10, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT, {
        //     isSensor: false, label: "playerCollider",
        // }); // Y + 10 For Platformer
        const underground = this.scene.hud.currScene === "Underground" || this.scene.hud.currScene === "Arena";
        let playerColliderUpper = Bodies.rectangle(this.x, this.y + 2, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT / 2, {
            isSensor: !underground,
            label: "body",
        }); // Y + 10 For Platformer
        let playerColliderLower = Bodies.rectangle(this.x, this.y + 18, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT / 2, {
            isSensor: underground,
            label: "legs", 
        }); // Y + 10 For Platformer
        let playerSensor = Bodies.circle(this.x, this.y + 2, PLAYER.SENSOR.DEFAULT, { isSensor: true, label: "playerSensor" }); // Y + 2 For Platformer
        const compoundBody = Body.create({
            parts: [playerSensor, playerColliderLower, playerColliderUpper],
            frictionAir: 0.5,
            restitution: 0.2,
        });
        this.setExistingBody(compoundBody);
        this.sensor = playerSensor;

        this.setCollisionCategory(ENTITY_FLAGS.PLAYER);
        this.setCollidesWith(ENTITY_FLAGS.ENEMY | ENTITY_FLAGS.LOOT | ENTITY_FLAGS.NPC | ENTITY_FLAGS.PARTICLES | ENTITY_FLAGS.WORLD);
        
        this.weaponHitbox = this.scene.add.circle(this.spriteWeapon.x, this.spriteWeapon.y, 24, 0xfdf6d8, 0);
        this.scene.add.existing(this.weaponHitbox);
        this.aoeMask = ENTITY_FLAGS.PLAYER;

        this.highlight = this.scene.add.graphics()
            .lineStyle(4, 0xFFc700)
            .setScale(0.2)
            .strokeCircle(0, 0, 12)
            .setDepth(99);
        (this.scene.plugins?.get?.("rexGlowFilterPipeline") as any)?.add(this.highlight, {
            intensity: 0.005,
        });
        this.highlight.setVisible(false);

        this.mark = this.scene.add.graphics()
            .lineStyle(4, 0xfdf6d8)
            .setScale(0.5)
            .strokeCircle(0, 0, 12);
        this.mark.setVisible(false);
        this.markAnimation = false;
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health, "player");
        this.castbar = new CastingBar(this.scene.hud, this.x, this.y, 0, this);
        scene.time.delayedCall(1000, () => {
            if (this.scene.state.isCaerenic) this.caerenicUpdate();
            if (this.scene.state.isStalwart) this.stalwartUpdate(this.scene.state.isStalwart);
        }, undefined, this);
        this.rushedEnemies = [];
        this.playerStateListener();
        this.setFixedRotation();   
        this.checkEnemyCollision(playerSensor);
        this.checkWorldCollision(playerSensor);
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
        .on("pointerup", () => {
            // this.scene.hud.logger.log(`Console: Current States: Physical: ${this.playerMachine.stateMachine.getCurrentState()?.toUpperCase()} | Positive: ${this.playerMachine.positiveMachine.getCurrentState()?.toUpperCase()} | Negative: ${this.playerMachine.negativeMachine.getCurrentState()?.toUpperCase()}. Suffering: ${this.isSuffering()}`)
            if (this.inCombat) return;
            const button = this.scene.hud.smallHud.getButton("info");
            this.scene.hud.smallHud.pressButton(button as Phaser.GameObjects.Image);
        });
        this.beam = new Beam(this);
        scene.registry.set("player", this);
    };

    getAscean = () => {
        EventBus.on("player-ascean-ready", (ascean: Ascean) => this.ascean = ascean);
        EventBus.emit("player-ascean");
        return this.ascean;
    };

    speedUpdate = (e: Ascean) => {
        this.speed = this.startingSpeed(e);
    };

    stealthUpdate = () => {
        if (this.isStealthing) {
            this.isStealthing = false;
        } else {
            this.scene.tweens.add({
                targets: this.scene.cameras.main,
                zoom: this.scene.cameras.main.zoom * 1.5,
                ease: Phaser.Math.Easing.Quintic.InOut,
                duration: 1000,
                yoyo: true
            });
            this.playerMachine.positiveMachine.setState(States.STEALTH);
        };
    };

    caerenicUpdate = () => {
        this.isCaerenic = this.isCaerenic ? false : true;
        this.scene.sound.play("blink", { volume: this.scene.hud.settings.volume / 3 });
        if (this.isCaerenic) {
            screenShake(this.scene, 64);
            this.scene.tweens.add({
                targets: this.scene.cameras.main,
                zoom: this.scene.cameras.main.zoom * 2,
                ease: Phaser.Math.Easing.Elastic.InOut,
                duration: 500,
                yoyo: true
            });
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, "weapon");
            this.setGlow(this.spriteShield, true, "shield"); 
            this.adjustSpeed(PLAYER.SPEED.CAERENIC * (this.scene.hud.talents.talents.caerenic.enhanced ? 1.5 : 1));
        } else {
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, "weapon")
            this.setGlow(this.spriteShield, false, "shield"); 
            this.adjustSpeed(-PLAYER.SPEED.CAERENIC * (this.scene.hud.talents.talents.caerenic.enhanced ? 1.5 : 1));
        };
    };

    stalwartUpdate = (stalwart: boolean) => {
        this.isStalwart = stalwart;
        this.spriteShield.setVisible(this.isStalwart);
        screenShake(this.scene);
        this.scene.sound.play("stalwart", { volume: this.scene.hud.settings.volume });
        EventBus.emit("stalwart-buttons", this.isStalwart);
    };

    createSprite = (imgUrl: string, x: number, y: number, scale: number, originX: number, originY: number) => {
        const sprite = new Phaser.GameObjects.Sprite(this.scene, x, y, imgUrl);
        sprite.setScale(scale);
        sprite.setOrigin(originX, originY);
        this.scene.add.existing(sprite);
        sprite.setDepth(this.depth + 1);
        return sprite;
    };

    cleanUp() {
        EventBus.off("set-player", this.setPlayer);
        EventBus.off("combat", this.constantUpdate);
        EventBus.off("update-combat", this.eventUpdate);
        EventBus.off("disengage", this.disengage);
        EventBus.off("engage", this.engage);
        EventBus.off("speed", this.speedUpdate);
        EventBus.off("update-stealth", this.stealthUpdate);
        EventBus.off("update-caerenic", this.caerenicUpdate);
        EventBus.off("update-stalwart", this.stalwartUpdate);
        EventBus.off("remove-enemy", this.enemyUpdate);
        EventBus.off("tab-target", this.tabUpdate);
        EventBus.off("updated-stamina", this.updateStamina);
    };

    clearBubbles = () => {
        this.isMalicing = false;
        this.isMending = false;
        this.isMenacing = false;
        this.isMultifaring = false;
        this.isMystifying = false;
        this.isProtecting = false;
        this.isShielding = false;
        this.isWarding = false;
        this.clearShields();
    };
        
    clearShields = () => {
        if (this.reactiveBubble) {
            this.reactiveBubble.cleanUp();
            this.reactiveBubble = undefined;
        };
        if (this.negationBubble) {
            this.negationBubble.cleanUp();
            this.negationBubble = undefined;
        };
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

    highlightTarget = (sprite: Enemy | NPC) => {
        if (!sprite || !sprite.body) return;
        if (this.highlightAnimation === false) {
            this.highlightAnimation = true;
            this.animateTarget();
        };
        this.highlight.setPosition(sprite.x, sprite.y);
        this.highlight.setVisible(true);
        this.scene.targetTarget = sprite;
        if (this.scene.target.visible === true) this.scene.target.setPosition(this.scene.targetTarget.x, this.scene.targetTarget.y);
    };

    removeHighlight() {
        this.highlight.setVisible(false);
        this.highlightAnimation = false;
    };


    computerBroadcast = (e: any) => {
        if (this.scene.state.enemyID !== e.id) return;
        EventBus.emit("update-combat-state", { key: "newComputerHealth", value: e.value });
    };

    playerStateListener = () => {
        EventBus.on("set-player", this.setPlayer)
        EventBus.on("combat", this.constantUpdate);
        EventBus.on("update-combat", this.eventUpdate);
        EventBus.on(BROADCAST_DEATH, this.enemyDeath);    
        EventBus.on(COMPUTER_BROADCAST, this.computerBroadcast);
        EventBus.on("disengage", this.disengage); 
        EventBus.on("engage", this.engage);
        EventBus.on("speed", this.speedUpdate);
        EventBus.on("update-stealth", this.stealthUpdate);
        EventBus.on("update-caerenic", this.caerenicUpdate);
        EventBus.on("update-stalwart", this.stalwartUpdate);
        EventBus.on("remove-enemy", this.enemyUpdate);
        EventBus.on("tab-target", this.tabUpdate);
        EventBus.on("updated-grace", this.updateGrace);
        EventBus.on("updated-stamina", this.updateStamina);
    }; 
    
    enemyDeath = (id: string) => {
        const enemy = this.targets.find((e: Enemy) => e.enemyID === id);
        if (enemy) this.removeEnemy(enemy);
    };

    updateGrace = (percentage: number) => {
        this.grace = Math.round(this.maxGrace * percentage / 100);
    };

    updateStamina = (percentage: number) => {
        this.stamina = Math.round(this.maxStamina * percentage / 100);
    };

    setPlayer = (stats: Compiler) => {
        this.ascean = stats.ascean;
    };

    startCombat = () => {
        this.inCombat = true;
        this.healthbar.setVisible(true);
    };

    disengage = () => {
        this.scene.combatEngaged(false);
        this.scene.hud.clearNonAggressiveEnemy();
        this.healthbar.setVisible(false);
        this.inCombat = false;
        this.currentTarget = undefined;
        this.removeHighlight();
        if (this.scene.party.length) {
            for (let i = 0; i < this.scene.party.length; i++) {
                this.scene.party[i].disengage();
            };
        };
    };

    engage = () => {
        this.inCombat = true;
        this.scene.combatEngaged(true);
        const enemy = this.targets.find(obj => obj.enemyID === this.scene.state.enemyID);
        if (enemy) {
            this.currentTarget = enemy;
            this.highlightTarget(enemy);
            if (this.scene.party.length) {
                for (let i = 0; i < this.scene.party.length; i++) {
                    if (!this.scene.party[i].inComputerCombat) {
                        this.scene.party[i].checkComputerEnemyCombatEnter(enemy);
                    };
                };
            };
        };
    };

    clearEnemy = (enemy: Enemy) => {
        enemy.clearCombatWin();
        this.disengage();
    };

    findEnemy = () => {
        if (this.scene.state.newPlayerHealth <= 0) {
            this.disengage();
            return;
        };
        const first = this.scene.state.enemyID;
        if (first === "") {
            (this.scene as Player_Scene).quickCombat();
        } else {
            const enemy = this.scene.getEnemy(first);
            if (enemy === undefined) {
                this.disengage();
            } else if (!enemy.inCombat) {
                (this.scene as Player_Scene).quickCombat();
            } else {
                this.quickTarget(enemy);
            };
        };
    };

    invalidTarget = (id: string) => {
        const enemy = this.scene.getEnemy(id);
        if (enemy) return enemy.health <= 0; // enemy.isDefeated;
        this.resistCombatText = this.scene.showCombatText(`Combat Issue: NPC Targeted`, 1000, "damage", false, false, () => this.resistCombatText = undefined);
        return true;
    };

    getEnemyId = () => this.scene.state.enemyID || this.currentTarget?.enemyID;

    quickTarget = (enemy: Enemy) => {
        this.targetID = enemy.enemyID;
        this.currentTarget = enemy;
        this.highlightTarget(enemy);
        if (this.scene.state.enemyID !== enemy.enemyID) this.scene.hud.setupEnemy(enemy);
        if (this.scene.party.length) {
            for (let i = 0; i < this.scene.party.length; i++) {
                if (!this.scene.party[i].inComputerCombat) this.scene.party[i].checkComputerEnemyCombatEnter(enemy);
            };
        };    
    };

    targetEngagement = (id: string) => {
        const enemy = this.scene.getEnemy(id);
        if (!enemy) return;
        if (this.isNewEnemy(enemy)) this.targets.push(enemy);
        if (this.scene.state.enemyID !== id) this.scene.hud.setupEnemy(enemy);
        this.currentTarget = enemy;
        this.highlightTarget(enemy);
        this.inCombat = true;
        this.scene.combatEngaged(true);
        this.targetID = id;
        if (this.scene.party.length) {
            for (let i = 0; i < this.scene.party.length; i++) {
                if (!this.scene.party[i].inComputerCombat) this.scene.party[i].checkComputerEnemyCombatEnter(enemy);
            };
        };
    };

    checkGear = (shield: Equipment, weapon: Equipment, damage: string) => {
        if (!shield || !weapon) return;
        this.currentDamageType = damage;    
        this.hasMagic = this.checkDamageType(damage, "magic");
        this.checkMeleeOrRanged(weapon);
        let staminaModifier = 0;
        if (this.currentWeaponSprite !== assetSprite(weapon)) {
            this.currentWeaponSprite = assetSprite(weapon);
            this.spriteWeapon.setTexture(this.currentWeaponSprite);
            if (weapon.grip === "One Hand") {
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
            } else {
                staminaModifier += 2;
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
            };
        };
        if (this.currentShieldSprite !== assetSprite(shield)) {
            this.currentShieldSprite = assetSprite(shield);
            this.spriteShield.setTexture(this.currentShieldSprite);
            if (shield.type === "Medium Shield") {
                staminaModifier += 1;
            } else if (shield.type === "Large Shield") {
                staminaModifier += 2;
            } else if (shield.type === "Great Shield") {
                staminaModifier += 3;
            };
        };
        this.staminaModifier = staminaModifier;
    };

    constantUpdate = (e: Combat) => this.checkGear(e.player?.shield as Equipment, e.weapons?.[0] as Equipment, e.playerDamageType.toLowerCase());
    
    eventUpdate = (e: Combat) => {
        if (this.scene.scene.isSleeping(this.scene.scene.key)) return;
        const { computerCriticalSuccess, computerParrySuccess, newPlayerHealth, parrySuccess, rollSuccess } = e;
        if (this.health > newPlayerHealth) {
            let damage: number | string = Math.round(this.health - newPlayerHealth);
            // damage = computerCriticalSuccess === true ? `${damage} (Critical)` : e.computerGlancingBlow === true ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = this.scene.showCombatText(`${damage}`, PLAYER.DURATIONS.TEXT, "damage", computerCriticalSuccess, false, () => this.scrollingCombatText = undefined);
            if (!this.isSuffering() && !this.isTrying() && !this.isCasting && !this.isContemplating && !this.isPraying) this.isHurt = true;
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
                    this.resistCombatText = this.scene.showCombatText("Fear Broken", PLAYER.DURATIONS.TEXT, "effect", false, false, () => this.resistCombatText = undefined);
                    this.isFeared = false;    
                } else {
                    this.fearCount += 0.1;
                };
            };
        };
        if (this.health < newPlayerHealth) this.scrollingCombatText = this.scene.showCombatText(`${Math.round(newPlayerHealth - this.health)}`, PLAYER.DURATIONS.TEXT, "heal", false, false, () => this.scrollingCombatText = undefined);
        this.health = newPlayerHealth;
        this.healthbar.setValue(this.health);
        if (this.healthbar.getTotal() < e.playerHealth) this.healthbar.setTotal(e.playerHealth);
        if (computerParrySuccess === true) {
            this.isStunned = true;
            this.scene.combatManager.combatMachine.input("computerParrySuccess", false);
            this.resistCombatText = this.scene.showCombatText("Parry", PLAYER.DURATIONS.TEXT, "damage", computerCriticalSuccess, false, () => this.resistCombatText = undefined);    
        };
        if (rollSuccess === true) {
            this.specialCombatText = this.scene.showCombatText("Roll", PLAYER.DURATIONS.TEXT, "heal", true, false, () => this.specialCombatText = undefined);
            this.scene.combatManager.useStamina(-5);
        };
        if (parrySuccess === true) {
            this.specialCombatText = this.scene.showCombatText("Parry", PLAYER.DURATIONS.TEXT, "heal", true, false, () => this.specialCombatText = undefined);
            this.scene.combatManager.stunned(e.enemyID);
            this.scene.combatManager.useStamina(-5);
        };
        if (e.computerRollSuccess === true) this.resistCombatText = this.scene.showCombatText("Roll", PLAYER.DURATIONS.TEXT, "damage", computerCriticalSuccess, false, () => this.resistCombatText = undefined);
        if (this.currentRound !== e.combatRound && this.scene.combat === true) {
            this.currentRound = e.combatRound;
            if (e.computerDamaged || e.playerDamaged || parrySuccess || rollSuccess || e.computerRollSuccess || computerParrySuccess) this.soundEffects(e);
        };
        if (e.newComputerHealth <= 0 && e.playerWin === true) {
            this.defeatedEnemyCheck(e.enemyID);
        };
        if (newPlayerHealth <= 0) {
            this.isDefeated = true;
            this.disengage();
        };    
        if (e.playerAttributes?.stamina as number > this.maxStamina) this.maxStamina = e.playerAttributes?.stamina as number;
        if (e.playerAttributes?.grace as number > this.maxGrace) this.maxGrace = e.playerAttributes?.grace as number;
        if (e.criticalSuccess || e.glancingBlow || parrySuccess || rollSuccess || e.computerGlancingBlow || computerCriticalSuccess || computerParrySuccess) {
            EventBus.emit("blend-combat", { 
                computerDamaged: false, playerDamaged: false, glancingBlow: false, computerGlancingBlow: false, parrySuccess: false, computerParrySuccess: false, rollSuccess: false, computerRollSuccess: false, criticalSuccess: false, computerCriticalSuccess: false, religiousSuccess: false,
            });
        };
        if (this.inCombat === false && this.scene.combat === true) this.scene.combatEngaged(false);
    };

    resist = () => {
        this.resistCombatText = this.scene.showCombatText("Resisted", PLAYER.DURATIONS.TEXT, "effect", false, false, () => this.resistCombatText = undefined);
    };

    checkTalentCost = (type: string, cost: number) => {
        const grace = this.scene.hud.talents.talents[type as keyof typeof this.scene.hud.talents.talents].efficient ? TALENT_COST[cost as unknown as keyof typeof TALENT_COST] : cost;
        this.scene.combatManager.useGrace(grace);
    };

    checkTalentCooldown = (type: string, cooldown: number) => {
        const limit = this.scene.hud.talents.talents[type as keyof typeof this.scene.hud.talents.talents].efficient ? TALENT_COOLDOWN[cooldown as unknown as keyof typeof TALENT_COOLDOWN] : cooldown;
        this.setTimeEvent(`${type}Cooldown`, limit);
    };

    checkTalentEnhanced = (type: string): boolean => {
        return this.scene.hud.talents.talents[type as keyof typeof this.scene.hud.talents.talents].enhanced;
    };

    damageDistance = (enemy: Enemy) => {
        const distance = enemy.position.subtract(this.position).length();
        this.playerMachine.chiomism(enemy.enemyID, distance);
    };

    leap = () => {
        this.frameCount = 0;
        this.isLeaping = true;
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        const distance = direction.length();
        direction.normalize();
        this.flipX = direction.x < 0;
        this.scene.tweens.add({
            targets: this,
            scale: 1.2,
            duration: 400,
            ease: Phaser.Math.Easing.Back.InOut,
            yoyo: true,
        });
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * Math.min(distance, 200)),
            y: this.y + (direction.y * Math.min(distance, 200)),
            duration: 800,
            ease: Phaser.Math.Easing.Back.InOut,
            onStart: () => {
                this.isAttacking = true;
                screenShake(this.scene);
                this.scene.sound.play("leap", { volume: this.scene.hud.settings.volume });
                // this.flickerCaerenic(800);
            },
            onComplete: () => { 
                screenShake(this.scene);
                this.isLeaping = false; 
                const special = this.checkTalentEnhanced(States.LEAP);
                if (this.touching.length > 0) {
                    for (let i = 0; i < this.touching.length; ++i) {
                        const enemy = this.touching[i];
                        this.scene.combatManager.playerMelee(enemy.enemyID, "leap");
                        if (!this.isAstrifying && (enemy.isWarding || enemy.isShielding || enemy.isProtecting)) {
                            if (enemy.isShielding) enemy.shield();
                            if (enemy.isWarding) enemy.ward(this.playerID);
                            return;
                        };
                        if (enemy.isMenacing) enemy.menace(this.playerID);
                        if (enemy.isMultifaring) enemy.multifarious(this.playerID);
                        if (enemy.isMystifying) enemy.mystify(this.playerID);
                        if (special) this.scene.combatManager.stun(enemy.enemyID);
                        this.applyKnockback(this.attackedTarget, SWING_FORCE[this.scene.state.weapons[0]?.grip as keyof typeof SWING_FORCE] * this.ascean[SWING_FORCE_ATTRIBUTE[this.scene.state.weapons[0]?.attackType as keyof typeof SWING_FORCE_ATTRIBUTE]] * SWING_FORCE["leap" as keyof typeof SWING_FORCE]);
                    };
                };
            },
        });
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You launch yourself through the air!`
        });
    };

    rush = () => {
        this.frameCount = 0;
        this.isRushing = true;
        this.isThrusting = true;
        this.scene.sound.play("stealth", { volume: this.scene.hud.settings.volume });        
        const target = this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.scene.tweens.add({
            targets: this,
            alpha: 0.25,
            ease: Phaser.Math.Easing.Quintic.InOut,
            duration: 300,
            yoyo: true
        });
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            zoom: this.scene.cameras.main.zoom * 1.5,
            ease: Phaser.Math.Easing.Quintic.InOut,
            duration: 600,
            yoyo: true
        });
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 300),
            y: this.y + (direction.y * 300),
            duration: 600,
            ease: "Circ.easeOut",
            onStart: () => {
                screenShake(this.scene);
            },
            onComplete: () => {
                const special = this.checkTalentEnhanced(States.RUSH);
                if (this.rushedEnemies.length > 0) {
                    for (let i = 0; i < this.rushedEnemies.length; ++i) {
                        const enemy = this.rushedEnemies[i];
                        if (enemy.health <= 0) return;
                        if (!this.isAstrifying && (enemy.isWarding || enemy.isShielding || enemy.isProtecting)) {
                            if (enemy.isShielding) enemy.shield();
                            if (enemy.isWarding) enemy.ward(this.playerID);
                            return;
                        };
                        if (enemy.isMenacing) enemy.menace(this.playerID);
                        if (enemy.isMultifaring) enemy.multifarious(this.playerID);
                        if (enemy.isMystifying) enemy.mystify(this.playerID);    
                        this.scene.combatManager.playerMelee(enemy.enemyID, "rush");
                        if (special) this.scene.combatManager.slow(enemy.enemyID);
                    };
                } else if (this.touching.length > 0) {
                    for (let i = 0; i < this.touching.length; ++i) {
                        const enemy = this.touching[i];
                        if (enemy.health <= 0) return;
                        if (!this.isAstrifying && (enemy.isWarding || enemy.isShielding || enemy.isProtecting)) {
                            if (enemy.isShielding) enemy.shield();
                            if (enemy.isWarding) enemy.ward(this.playerID);
                            return;
                        };
                        if (enemy.isMenacing) enemy.menace(this.playerID);
                        if (enemy.isMultifaring) enemy.multifarious(this.playerID);
                        if (enemy.isMystifying) enemy.mystify(this.playerID);
                        this.scene.combatManager.playerMelee(enemy.enemyID, "rush");
                        if (special) this.scene.combatManager.slow(enemy.enemyID);
                    };
                };
                this.isRushing = false;
            },
        });         
    };

    storm = () => {
        this.clearAnimations();
        this.frameCount = 0;
        this.isStorming = true;
        this.specialCombatText = this.scene.showCombatText("Storming", 800, "damage", false, false, () => this.specialCombatText = undefined); 
        this.isAttacking = true;
        this.scene.combatManager.useGrace(PLAYER.STAMINA.STORM);
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 800,
            onStart: () => this.flickerCaerenic(3200),
            onLoop: () => {
                this.frameCount = 0;
                this.clearAnimations();
                if (this.isSuffering()) return;
                this.isAttacking = true;
                screenShake(this.scene);
                this.specialCombatText = this.scene.showCombatText("Storming", 800, "damage", false, false, () => this.specialCombatText = undefined);
                if (this.touching.length > 0) {
                    for (let i = 0; i < this.touching.length; ++i) {
                        const enemy = this.touching[i];
                        if (enemy.health <= 0) return;
                        if (!this.isAstrifying && (enemy.isWarding || enemy.isShielding || enemy.isProtecting)) {
                            if (enemy.isShielding) enemy.shield();
                            if (enemy.isWarding) enemy.ward(this.playerID);
                            return;
                        };
                        if (enemy.isMenacing) enemy.menace(this.playerID);
                        if (enemy.isMultifaring) enemy.multifarious(this.playerID);
                        if (enemy.isMystifying) enemy.mystify(this.playerID);    
                        this.scene.combatManager.playerMelee(enemy.enemyID, "storm");
                        this.applyKnockback(enemy, SWING_FORCE[this.scene.state.weapons[0]?.grip as keyof typeof SWING_FORCE] * this.ascean[SWING_FORCE_ATTRIBUTE[this.scene.state.weapons[0]?.attackType as keyof typeof SWING_FORCE_ATTRIBUTE]] * SWING_FORCE["storm" as keyof typeof SWING_FORCE]);
                    };
                };
            },
            onComplete: () => this.isStorming = false,
            loop: 3,
        });  
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You begin storming with your ${this.scene.state.weapons[0]?.name}.`
        });
        screenShake(this.scene);
    };

    soundEffects(sfx: Combat) {
        try {
            const soundEffectMap = (type: string, weapon: Equipment) => {
                switch (type) {
                    case "Spooky":
                        return this.scene.sound.play("spooky", { volume: this.scene.hud.settings.volume });
                    case "Righteous":
                        return this.scene.sound.play("righteous", { volume: this.scene.hud.settings.volume });
                    case "Wild":
                        return this.scene.sound.play("wild", { volume: this.scene.hud.settings.volume });
                    case "Earth":
                        return this.scene.sound.play("earth", { volume: this.scene.hud.settings.volume });
                    case "Fire":
                        return this.scene.sound.play("fire", { volume: this.scene.hud.settings.volume });
                    case "Frost":
                        return this.scene.sound.play("frost", { volume: this.scene.hud.settings.volume });
                    case "Lightning":
                        return this.scene.sound.play("lightning", { volume: this.scene.hud.settings.volume });
                    case "Sorcery":
                        return this.scene.sound.play("sorcery", { volume: this.scene.hud.settings.volume / 3 });
                    case "Wind":
                        return this.scene.sound.play("wind", { volume: this.scene.hud.settings.volume });
                    case "Pierce":
                        return (weapon.type === "Bow" || weapon.type === "Greatbow") ? this.scene.sound.play("bow", { volume: this.scene.hud.settings.volume }) : this.scene.sound.play("pierce", { volume: this.scene.hud.settings.volume });
                    case "Slash":
                        return this.scene.sound.play("slash", { volume: this.scene.hud.settings.volume });
                    case "Blunt":
                        return this.scene.sound.play("blunt", { volume: this.scene.hud.settings.volume });
                };
            };
            if (sfx.computerDamaged === true) soundEffectMap(sfx.playerDamageType, sfx.weapons[0] as Equipment);
            if (sfx.playerDamaged === true) soundEffectMap(sfx.computerDamageType, sfx.computerWeapons[0]);
            if (sfx.religiousSuccess === true) this.scene.sound.play("righteous", { volume: this.scene.hud.settings.volume });
            if (sfx.rollSuccess === true || sfx.computerRollSuccess === true) this.scene.sound.play("roll", { volume: this.scene.hud.settings.volume / 2 });
            if (sfx.parrySuccess === true || sfx.computerParrySuccess === true) this.scene.sound.play("parry", { volume: this.scene.hud.settings.volume });
        } catch (err) {
            console.warn(err, "Error Setting Sound Effects");
        };
    };

    enemyUpdate = (e: string) => {
        const index = this.targets.findIndex(obj => obj.enemyID === e);
        this.targets = this.targets.filter(obj => obj.enemyID !== e);
        if (this.targets.length > 0) {
            const newTarg = this.targets[index] || this.targets[0];
            if (!newTarg) return;
            this.currentTarget = newTarg;
            this.highlightTarget(this.currentTarget as Enemy);
            this.scene.hud.setupEnemy(this.currentTarget);
        };
    };

    tabUpdate = (tab: any) => {
        const enemy = this.targets.find(e => e.enemyID === tab.id);
        if (!enemy) return;
        enemy.ping();
        vibrate();
        if (enemy.enemyID !== this.scene.state.enemyID) this.scene.hud.setupEnemy(enemy);
        this.currentTarget = enemy;
        this.targetIndex = this.targets.findIndex(obj => obj.enemyID === enemy.enemyID);
        this.highlightTarget(enemy); 
        this.animateTarget();
        this.targetID = enemy.enemyID;
    };

    tabEnemyNext = () => {
        const index = this.targetIndex + 1 >= this.targets.length ? 0 : this.targetIndex + 1;
        let newTarget = this.targets[index];
        this.targetIndex = index;
        if (this.inCombat) {
            newTarget = newTarget?.inCombat ? newTarget : this.targets.find(obj => obj.enemyID !== this.currentTarget?.enemyID && obj.enemyID !== newTarget?.enemyID); 
            this.targetIndex = this.targets.findIndex(obj => obj?.enemyID === newTarget?.enemyID);
        };
        if (!newTarget || newTarget === this.currentTarget) return;
        this.currentTarget = newTarget;
        this.targetID = newTarget.enemyID;
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget); 
            this.animateTarget();
            this.scene.hud.setupEnemy(this.currentTarget);
        };
    };

    defeatedEnemyCheck = (id: string) => {
        this.currentTarget = undefined;
        this.removeHighlight();
        this.targets = this.targets.filter(target => target.enemyID !== id);
        this.sendEnemies(this.targets);
        this.scene.combatManager.combatMachine.clear(id);
        const enemyInCombat = this.targets.find(obj => obj.inCombat && obj.health > 0);
        if (enemyInCombat) {
            this.scene.hud.setupEnemy(enemyInCombat);
            this.currentTarget = enemyInCombat;
            this.targetID = enemyInCombat.enemyID;
            this.highlightTarget(enemyInCombat);
        } else {
            this.disengage();
        };
    };

    isPlayerInCombat = () => {
        return this.scene.enemies.some((e: Enemy) => e.inCombat && e.health > 0) || (this.inCombat && this.scene.combat && this.scene.state.combatEngaged);
    };

    shouldPlayerEnterCombat = (other: any) => {
        if (!this.isPlayerInCombat() && !this.isStealthing && this.scene.state.newPlayerHealth > 0) {
            this.enterCombat(other);
        } else if (this.isStealthing) {
            this.prepareCombat(other);    
        };
    }; 

    enterCombat = (other: any) => {
        this.scene.hud.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.currentTarget = other.gameObjectB;
        this.targetID = other.gameObjectB.enemyID;
        this.scene.combatEngaged(true);
        this.highlightTarget(other.gameObjectB);
        this.inCombat = true;
    };

    prepareCombat = (other: any) => {
        this.scene.hud.setupEnemy(other.gameObjectB);
        this.actionTarget = other;
        this.currentTarget = other.gameObjectB;
        this.targetID = other.gameObjectB.enemyID;
        this.highlightTarget(other.gameObjectB);
    };

    isAttackTarget = (enemy: Enemy) => this.getEnemyId() === enemy.enemyID;
    isNewEnemy = (enemy: Enemy) => this.targets.every(obj => obj.enemyID !== enemy.enemyID);
    isValidEnemyCollision = (other: any): boolean =>  (other.gameObjectB && (other.bodyB.label === "legs" || other.bodyB.label === "body" ||other.bodyB.label === "enemyCollider") && other.gameObjectB.isAggressive && other.gameObjectB.ascean);
    isValidNeutralCollision = (other: any): boolean => (other.gameObjectB && (other.bodyB.label === "legs" || other.bodyB.label === "body" ||other.bodyB.label === "enemyCollider") && other.gameObjectB.ascean);
    isValidRushEnemy = (enemy: Enemy) => {
        if (!enemy?.enemyID) return;
        if (this.isRushing) {
            const newEnemy = this.rushedEnemies.every(obj => obj.enemyID !== enemy.enemyID);
            if (newEnemy) this.rushedEnemies.push(enemy);
        };
    };
    isValidTouching = (other: any): boolean => other.gameObjectB && (other.bodyB.label === "legs" || other.bodyB.label === "body" ||other.bodyB.label === "enemyCollider") && other.gameObjectB.ascean;
    
    checkEnemyCollision(playerSensor: any) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other: any) => {
                if (other.gameObjectB?.isDeleting) return;
                this.isValidRushEnemy(other.gameObjectB);
                if (this.isValidEnemyCollision(other)) {
                    const isNewEnemy = this.isNewEnemy(other.gameObjectB);
                    if (!isNewEnemy) return;
                    this.targets.push(other.gameObjectB);
                    this.shouldPlayerEnterCombat(other);
                    this.checkTargets();
                } else if (this.isValidNeutralCollision(other)) {
                    other.gameObjectB.originPoint = new Phaser.Math.Vector2(other.gameObjectB.x, other.gameObjectB.y).clone();
                    const isNewNeutral = this.isNewEnemy(other.gameObjectB);
                    if (!isNewNeutral) return;
                    this.targets.push(other.gameObjectB);
                    this.checkTargets();
                    if (this.inCombat === false) this.scene.hud.setupEnemy(other.gameObjectB);
                };
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideActive({
            objectA: [playerSensor],
            callback: (other: any) => {
                if (other.gameObjectB?.isDeleting) return;
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
            callback: (other: any) => {
                if (other.gameObjectB?.isDeleting) return;
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
    checkWorldCollision(playerSensor: any) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB?.properties?.name === "duel") {
                    EventBus.emit("alert", { 
                        header: "Ancient Eulex", 
                        body: `You have the option of summoning enemies to the dueling grounds. \n\n Would you like to see the roster?`, 
                        delay: 3000, 
                        key: "Roster",
                        arg: other.gameObjectB?.properties?.key
                    });
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === "cave") {
                    EventBus.emit("alert", { 
                        header: "Underground", 
                        body: `You have encountered a cave! \n\n Would you like to enter?`, 
                        delay: 3000, 
                        key: "Enter Underground"
                    });
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === "teleport") {
                    switch (other.gameObjectB?.properties?.key) {
                        case "north":
                            EventBus.emit("alert", { 
                                header: "North Port", 
                                body: `This is the Northren Port \n\n Would you like to enter?`, 
                                delay: 3000,
                                key: "Enter North Port"
                            });
                            break;
                        case "south":
                            EventBus.emit("alert", { 
                                header: "South Port", 
                                body: `This is the Southron Port \n\n Would you like to enter?`, 
                                delay: 3000,
                                key: "Enter South Port"
                            });
                            break;
                        case "east":
                            EventBus.emit("alert", { 
                                header: "East Port", 
                                body: `This is the Eastern Port \n\n Would you like to enter?`, 
                                delay: 3000,
                                key: "Enter East Port"
                            });
                            break;
                        case "west":
                            EventBus.emit("alert", { 
                                header: "West Port", 
                                body: `This is the Western Port \n\n Would you like to enter?`, 
                                delay: 3000,
                                key: "Enter West Port"
                            });
                            break;
                        default: break;
                    };
                };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === "stairs") {
                    EventBus.emit("alert", { 
                        header: "Exit", 
                        body: `You are at the stairs that lead back to the surface. \n\n Would you like to exit the cave and head up to the world?`, 
                        delay: 3000, 
                        key: "Exit Underground"
                    });
                };
                // if (other.gameObjectB && other.gameObjectB?.properties?.name === "worldExit") {
                //     EventBus.emit("alert", { 
                //         header: "Exit", 
                //         body: `You are near the exit. \n\n Would you like to head back to the world?`, 
                //         delay: 3000, 
                //         key: "Exit World"
                //     });
                // };
                if (other.gameObjectB && other.gameObjectB?.properties?.name === "Enter Tutorial") {
                    EventBus.emit("alert", { 
                        header: "Tutorial", 
                        body: `You are near the entrance to the tutorial. \n\n Would you like to head back to area?`, 
                        delay: 3000, 
                        key: "Enter Tutorial"
                    });
                };
            },
            context: this.scene,
        });
    };

    getEnemyDirection = (target: Enemy | undefined) => {
        if (this.scene.hud.settings.difficulty.aim) return true;
        if (!target) return false;
        const skills = this.scene.state.player?.skills;
        const type = this.hasMagic ? this.scene.state.playerDamageType : this.scene.state.weapons[0]?.type;
        const skill = skills?.[type as keyof typeof skills];
        const cap = this.scene.state.player?.level as number * 100;
        const skilled = skill as number / cap >= 0.5;
        if (skilled) {
            return true;
        };
        const direction = target.position.subtract(this.position);
        return direction.x < 0 && this.flipX || direction.x > 0 && !this.flipX;
    };

    combatChecker = (state: boolean) => {
        if (state) return;
        if (this.inCombat) {
            this.playerMachine.stateMachine.setState(States.COMBAT);
        } else {
            this.playerMachine.stateMachine.setState(States.NONCOMBAT);
        };
    };

    setTimeEvent = (cooldown: string, limit = 30000) => {
        if (this.isComputer) return;
        const evasion = cooldown === "rollCooldown" || cooldown === "dodgeCooldown";
        if (evasion === false) {
            (this as any)[cooldown] = limit;
        };
        const type = cooldown.split("Cooldown")[0];
        this.scene.hud.actionBar.setCurrent(0, limit, type);
        const button = this.scene.hud.actionBar.getButton(type); 
        if (this.inCombat || type === "blink" || type || "desperation") {
            this.scene.hud.time.delayedCall(limit, () => {
                this.scene.hud.actionBar.setCurrent(limit, limit, type);
                this.scene.hud.actionBar.animateButton(button as ActionButton);
                if (evasion === false) {
                    (this as any)[cooldown] = 0;
                };
            }, undefined, this); 
        } else {
            this.scene.hud.actionBar.setCurrent(limit, limit, type);
            if (!evasion) {
                (this as any)[cooldown] = 0;
            };
        };
    };
    
    swingReset = (type: string, primary = false) => {
        this.canSwing = false;
        const time = this.swingTime(type);
        const button = this.scene.hud.actionBar.getButton(type);
        this.scene.hud.actionBar.setCurrent(0, time, type);
        this.scene.time.delayedCall(time, () => {
            this.canSwing = true;
            this.scene.hud.actionBar.setCurrent(time, time, type);
            if (primary === true) this.scene.hud.actionBar.animateButton(button as ActionButton);
        }, undefined, this);
    };

    swingTime = (type: string): number => {
        return (type === "dodge" || type === "parry" || type === "roll") ? 750 : this.swingTimer;
    };

    checkCaerenic = (caerenic: boolean) => {
        this.isGlowing = caerenic;
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, "weapon");
        this.setGlow(this.spriteShield, caerenic, "shield");
    };

    flickerCaerenic = (duration: number) => {
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

    removeTarget = (enemyID: string) => {
        this.targets = this.targets.filter(gameObject => gameObject.enemyID !== enemyID);
        this.sendEnemies(this.targets);
        this.tabEnemy(enemyID);
        this.checkTargets();
    };

    addEnemy = (enemy: Enemy) => {
        this.targets.push(enemy);
        this.sendEnemies(this.targets);
    };

    isEnemyInTargets = (id: string) => {
        const enemy = this.targets.find(target => target.enemyID === id);
        return enemy ? true : false;
    };

    removeEnemy = (enemy: Enemy) => {
        this.targets = this.targets.filter(gameObject => gameObject.enemyID !== enemy.enemyID);
        this.checkTargets();
    };

    tabEnemy = (enemyID: string) => {
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
            this.scene.hud.setupNPC(newTarget);
        } else {
            this.scene.hud.setupEnemy(newTarget);
        };
        this.highlightTarget(this.currentTarget as Enemy); 
    };

    clearEnemies = () => {
        this.targets = [];
        EventBus.emit("update-enemies", []);
    };

    sendEnemies = (enemies: Enemy[]) => {
        if (enemies.length === 0) return;
        const data = enemies.map(enemy => {
            return { 
                id: enemy.enemyID, 
                game: enemy.ascean,
                name: enemy.name,
                weapons: enemy.weapons,
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
        EventBus.emit("update-enemies", data);
    };

    setCombat = (combat: boolean) => {
        return this.inCombat = combat;
    };

    setCurrentTarget = (enemy: Enemy) => {
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
        return "";
    };

    inputClear = (input: string) => {
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

    // movementClear = (): boolean => {
    //     return (
    //         !this.playerMachine.stateMachine.isCurrentState(States.ROLL) &&
    //         !this.playerMachine.stateMachine.isCurrentState(States.DODGE) &&
    //         !this.playerMachine.stateMachine.isCurrentState(States.PARRY) &&
    //         (this.isStalwart ? !this.scene.hud.talents.talents.stalwart.enhanced : true)
    //     );
    // };
    movementClear = () => {
        const inRestrictedState = this.playerMachine.stateMachine.isCurrentState(States.ROLL) || this.playerMachine.stateMachine.isCurrentState(States.DODGE) || this.playerMachine.stateMachine.isCurrentState(States.PARRY);
        if (this.isStalwart) {
            return this.scene.hud.talents.talents.stalwart.enhanced && !inRestrictedState;
        };
        return !inRestrictedState;
    };

    killParticle = () => {
        this.scene.particleManager.removeEffect(this.particleEffect?.id as string);
        this.particleEffect = undefined;
    };

    playerActionSuccess = () => {
        if (!this.attackedTarget) return;
        let action = "";
        if (this.particleEffect) {
            action = this.particleEffect.action;
            this.killParticle();
            if (action === States.ACHIRE) {
                if (this.checkTalentEnhanced(States.ACHIRE)) {
                    this.scene.combatManager.stun(this.attackedTarget.enemyID);
                };
            };
            if (action === States.HOOK) {
                this.hook(this.attackedTarget, 1500);
                if (this.checkTalentEnhanced(States.HOOK)) {
                    this.damageDistance(this.attackedTarget);
                };
            };
            if (action === States.QUOR) {
                if (this.checkTalentEnhanced(States.QUOR)) {
                    if (this.isComputer) {
                        this.aoe = this.scene.aoePool.get("astrave", 1, false, undefined, false, this.attackedTarget);    
                    } else {
                        this.aoe = this.scene.aoePool.get("astrave", 1, false, undefined, true);
                    };
                };
            };
            if (this.attackedTarget?.health <= 0) return;
            if (!this.isAstrifying) {
                if (this.attackedTarget.isShimmering && Phaser.Math.Between(1, 100) > 50) {
                    this.attackedTarget.shimmer();
                    return;
                };
                if (this.attackedTarget.isAbsorbing || this.attackedTarget.isEnveloping || this.attackedTarget.isProtecting || this.attackedTarget.isShielding || this.attackedTarget.isWarding) {
                    if (this.attackedTarget.isAbsorbing === true) this.attackedTarget.absorb();
                    if (this.attackedTarget.isEnveloping === true) this.attackedTarget.envelop();
                    if (this.attackedTarget.isShielding === true) this.attackedTarget.shield();
                    if (this.attackedTarget.isWarding === true) this.attackedTarget.ward(this.playerID);
                    return;
                };
                if (this.attackedTarget.isMenacing === true) this.attackedTarget.menace(this.playerID); 
                if (this.attackedTarget.isModerating === true) this.attackedTarget.moderate(this.playerID); 
                if (this.attackedTarget.isMultifaring === true) this.attackedTarget.multifarious(this.playerID); 
                if (this.attackedTarget.isMystifying === true) this.attackedTarget.mystify(this.playerID); 
                if (this.attackedTarget.isShadowing === true) this.attackedTarget.pursue(this.playerID);
                if (this.attackedTarget.isTethering === true) this.attackedTarget.tether(this.playerID);
            };
            if (this.enemyIdMatch()) {
                this.scene.combatManager.combatMachine.action({ type: "Weapon", data: { key: "action", value: action }});
            } else {
                this.scene.combatManager.combatMachine.action({ type: "Player", data: { 
                    playerAction: { action, parry: this.scene.state.parryGuess },  
                    enemyID: this.attackedTarget.enemyID, 
                    ascean: this.attackedTarget.ascean, 
                    damageType: this.attackedTarget.currentDamageType, 
                    combatStats: this.attackedTarget.combatStats, 
                    weapons: this.attackedTarget.weapons, 
                    health: this.attackedTarget.health, 
                    actionData: { action: "", parry: "" }, // { action: this.attackedTarget.currentAction, parry: this.attackedTarget.parryAction },
                }});
            };
        } else {
            action = this.checkPlayerAction();
            if (!action) return;
            if (!this.isAstrifying) {
                if (this?.attackedTarget?.isShimmering && Phaser.Math.Between(1, 100) > 50) {
                    this?.attackedTarget?.shimmer();
                    return;
                };
                if (this.attackedTarget.isAbsorbing || this.attackedTarget.isEnveloping || this.attackedTarget.isProtecting || this.attackedTarget.isShielding || this.attackedTarget.isWarding) {
                    if (this.attackedTarget.isAbsorbing === true) this.attackedTarget.absorb();
                    if (this.attackedTarget.isEnveloping === true) this.attackedTarget.envelop();
                    if (this.attackedTarget.isShielding === true) this.attackedTarget.shield();
                    if (this.attackedTarget.isWarding === true) this.attackedTarget.ward(this.playerID);
                    return;    
                };
                if (this.attackedTarget.isMenacing === true) this.attackedTarget.menace(this.playerID);
                if (this.attackedTarget.isModerating === true) this.attackedTarget.moderate(this.playerID); 
                if (this.attackedTarget.isMultifaring === true) this.attackedTarget.multifarious(this.playerID);
                if (this.attackedTarget.isMystifying === true) this.attackedTarget.mystify(this.playerID);
                if (this.attackedTarget.isShadowing === true) this.attackedTarget.pursue(this.playerID);
                if (this.attackedTarget.isTethering === true) this.attackedTarget.tether(this.playerID);
            };
            if (this.enemyIdMatch()) {
                this.scene.combatManager.combatMachine.action({ type: "Weapon",  data: { key: "action", value: action } });
            } else {
                this.scene.combatManager.combatMachine.action({ type: "Player", data: { 
                    playerAction: { action, parry: this.scene.state.parryGuess }, 
                    enemyID: this.attackedTarget.enemyID, 
                    ascean: this.attackedTarget.ascean, 
                    damageType: this.attackedTarget.currentDamageType, 
                    combatStats: this.attackedTarget.combatStats, 
                    weapons: this.attackedTarget.weapons, 
                    health: this.attackedTarget.health, 
                    actionData: { action: this.attackedTarget.currentAction, parry: this.attackedTarget.parryAction }, // { action: this.attackedTarget.currentAction, parry: this.attackedTarget.parryAction },
                }});
            };
        };
        if (this.isStealthing) {
            this.scene.combatManager.paralyze(this.attackedTarget.enemyID);
            this.scene.combatEngaged(true);
            this.inCombat = true;
            this.attackedTarget.jumpIntoCombat();
            this.stealthUpdate();
        } else {
            this.applyKnockback(this.attackedTarget, SWING_FORCE[this.scene.state.weapons[0]?.grip as keyof typeof SWING_FORCE] * this.ascean[SWING_FORCE_ATTRIBUTE[this.scene.state.weapons[0]?.attackType as keyof typeof SWING_FORCE_ATTRIBUTE]] * SWING_FORCE[action as keyof typeof SWING_FORCE]);
        };
    };

    playerDodge = () => {
        this.dodgeCooldown = 50; // Was a 6x Mult for Dodge Prev aka 1728
        let currentDistance = 0;
        this.spriteWeapon.setVisible(false);
        const dodgeLoop = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= PLAYER.DODGE.DURATION || currentDistance >= PLAYER.DODGE.DISTANCE) {
                this.spriteWeapon.setVisible(true);
                this.dodgeCooldown = 0;
                this.isDodging = false;
                return;
            };
            const moveX = Math.abs(this.velocity?.x as number) > 0.1;
            const moveY = Math.abs(this.velocity?.y as number) > 0.1;
            const dirX = this.flipX ? -PLAYER.DODGE.MULTIPLIER : PLAYER.DODGE.MULTIPLIER; // -(PLAYER.DODGE.DISTANCE / PLAYER.DODGE.DURATION) : (PLAYER.DODGE.DISTANCE / PLAYER.DODGE.DURATION);
            const dirY = this.velocity?.y as number > 0 ? PLAYER.DODGE.MULTIPLIER : this.velocity?.y as number < 0 ? -PLAYER.DODGE.MULTIPLIER : 0; //  -(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION) : (PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            if (moveX) this.setVelocityX(moveY ? dirX * 0.7 : dirX);
            if (moveY) this.setVelocityY(moveX ? dirY * 0.7 : dirY);
            currentDistance += Math.abs(PLAYER.DODGE.MULTIPLIER); // Math.abs(PLAYER.DODGE.DISTANCE / PLAYER.DODGE.DURATION);
            requestAnimationFrame(dodgeLoop);
        };
        let startTime: any = undefined;
        requestAnimationFrame(dodgeLoop);
    };

    playerRoll = () => {
        this.rollCooldown = 50; // Was a x7 Mult for Roll Prev aka 2240
        let currentDistance = 0;
        this.spriteWeapon.setVisible(false);
        const rollLoop = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            if (progress >= PLAYER.ROLL.DURATION || currentDistance >= PLAYER.ROLL.DISTANCE) {
                this.spriteWeapon.setVisible(true);
                this.rollCooldown = 0;
                this.isRolling = false;
                return;
            };
            const moveX = Math.abs(this.velocity?.x as number) > 0.1;
            const moveY = Math.abs(this.velocity?.y as number) > 0.1;
            const dirX = this.flipX ? -PLAYER.ROLL.MULTIPLIER : PLAYER.ROLL.MULTIPLIER; //  -(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION) : (PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            const dirY = this.velocity?.y as number > 0 ? PLAYER.ROLL.MULTIPLIER : this.velocity?.y as number < 0 ? -PLAYER.ROLL.MULTIPLIER : 0; //  -(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION) : (PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            if (moveX) this.setVelocityX(moveY ? dirX * 0.7 : dirX);
            if (moveY) this.setVelocityY(moveX ? dirY * 0.7 : dirY);
            currentDistance += Math.abs(PLAYER.ROLL.MULTIPLIER); // Math.abs(PLAYER.ROLL.DISTANCE / PLAYER.ROLL.DURATION);
            requestAnimationFrame(rollLoop);
        };
        let startTime: any = undefined;
        requestAnimationFrame(rollLoop);
    };

    handleActions = () => {
        if (this.currentTarget) {
            this.highlightTarget(this.currentTarget);
            if (this.inCombat && (!this.scene.state.computer || this.scene.state.enemyID !== this.currentTarget.enemyID)) {
                if (this.currentTarget.name === "enemy") this.scene.hud.setupEnemy(this.currentTarget);
            };
        } else if (this.highlight.visible) {
            this.removeHighlight();
        };
        if (this.isDefeated) return;
        if (this.scene.hud.settings.desktop === true && !this.isSuffering()) {
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.tab.TAB)) {
                this.tabEnemyNext();
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.escape.ESC) && !this.inCombat) {
                this.disengage();
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Phaser.Input.Keyboard.JustDown(this.inputKeys.action.ONE)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.specials[0].toLowerCase());
                if (button?.isReady === true) this.scene.hud.actionBar.pressButton(button);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Phaser.Input.Keyboard.JustDown(this.inputKeys.action.TWO)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.specials[1].toLowerCase());
                if (button?.isReady === true) this.scene.hud.actionBar.pressButton(button);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Phaser.Input.Keyboard.JustDown(this.inputKeys.action.THREE)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.specials[2].toLowerCase());
                if (button?.isReady === true) this.scene.hud.actionBar.pressButton(button);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Phaser.Input.Keyboard.JustDown(this.inputKeys.action.FOUR)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.specials[3].toLowerCase());
                if (button?.isReady === true) this.scene.hud.actionBar.pressButton(button);
            };
            if ((this.inputKeys.shift.SHIFT.isDown) && Phaser.Input.Keyboard.JustDown(this.inputKeys.action.FIVE)) { 
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.specials[4].toLowerCase());
                if (button?.isReady === true) this.scene.hud.actionBar.pressButton(button);
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.action.ONE)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.actions[0].toLowerCase());
                const clear = this.inputClear(button?.name.toLowerCase() as string);
                if (button?.isReady === true && clear === true) this.scene.hud.actionBar.pressButton(button);
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.action.TWO)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.actions[1].toLowerCase());
                const clear = this.inputClear(button?.name.toLowerCase() as string);
                if (button?.isReady === true && clear === true) this.scene.hud.actionBar.pressButton(button);
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.action.THREE)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.actions[2].toLowerCase());
                const clear = this.inputClear(button?.name.toLowerCase() as string);
                if (button?.isReady === true && clear === true) this.scene.hud.actionBar.pressButton(button);
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.action.FOUR)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.actions[3].toLowerCase());
                const clear = this.inputClear(button?.name.toLowerCase() as string);
                if (button?.isReady === true && clear === true) this.scene.hud.actionBar.pressButton(button);
            };
            if (Phaser.Input.Keyboard.JustDown(this.inputKeys.action.FIVE)) {
                const button = this.scene.hud.actionBar.getButton(this.scene.hud.settings.actions[4].toLowerCase());
                const clear = this.inputClear(button?.name.toLowerCase() as string);
                if (button?.isReady === true && clear === true) this.scene.hud.actionBar.pressButton(button);
            };
        };
    };

    handleAnimations = () => {
        if (this.isDefeated) return;
        if (this.isPolymorphed) {
            this.anims.play(`rabbit_${this.polymorphMovement}_${this.polymorphDirection}`, true);
        } else if (this.isConfused || this.isFeared) {
            if (this.moving()) {
                this.handleMovementAnimations();
            } else {
                this.handleIdleAnimations();
            };
        } else if (this.isParrying) {
            this.anims.play(FRAMES.PARRY, true).on(FRAMES.ANIMATION_COMPLETE, () => this.isParrying = false);
        } else if (this.isThrusting) {
            sprint(this.scene);
            this.anims.play(FRAMES.THRUST, true).on(FRAMES.ANIMATION_COMPLETE, () => this.isThrusting = false);
        } else if (this.isDodging) { 
            this.anims.play(FRAMES.DODGE, true);
            if (this.dodgeCooldown === 0) this.playerDodge();
        } else if (this.isJumping) {
            this.anims.play(FRAMES.JUMP, true).on(FRAMES.ANIMATION_COMPLETE, () => this.isJumping = false); // () => this.anims.play(FRAMES.LAND).on(FRAMES.ANIMATION_COMPLETE,
        } else if (this.isRolling) {
            sprint(this.scene);
            this.anims.play(FRAMES.ROLL, true);
            if (this.rollCooldown === 0) this.playerRoll();
        } else if (this.isPosturing) {
            sprint(this.scene);
            this.anims.play(FRAMES.POSTURE, true).on(FRAMES.ANIMATION_COMPLETE, () => this.isPosturing = false);
        } else if (this.isAttacking) {
            sprint(this.scene);
            this.anims.play(FRAMES.ATTACK, true).on(FRAMES.ANIMATION_COMPLETE, () => this.isAttacking = false);
        } else if (this.isHurt) {
            this.anims.play(FRAMES.HURT, true);
        } else if (this.moving()) {
            this.handleMovementAnimations();
            this.isMoving = true;
        } else if (this.isCasting) {
            this.anims.play(FRAMES.CAST, true);
        } else if (this.isPraying) {
            this.anims.play(FRAMES.PRAY, true).on(FRAMES.ANIMATION_COMPLETE, () => this.isPraying = false);
        } else {
            this.isMoving = false;
            this.handleIdleAnimations();
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
            } else if (!this.particleEffect.effect?.active) {
                this.particleEffect = undefined;                
            } else {
                this.scene.particleManager.updateParticle(this.particleEffect);
            };
        };

        if (this.scene.combat === true && !this.currentTarget) this.findEnemy(); // || !this.currentTarget.inCombat // this.inCombat === true && state.combatEngaged
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText !== undefined) this.scrollingCombatText.update(this);
        if (this.specialCombatText !== undefined) this.specialCombatText.update(this); 
        if (this.resistCombatText !== undefined) this.resistCombatText.update(this);
        if (this.negationBubble) this.negationBubble.update(this.x, this.y);
        if (this.reactiveBubble) this.reactiveBubble.update(this.x, this.y);
        this.functionality("player", this.currentTarget as Enemy);

        if (this.isDefeated && !this.playerMachine.stateMachine.isCurrentState(States.DEFEATED)) {
            this.playerMachine.stateMachine.setState(States.DEFEATED);
            return;
        };
        if (this.isConfused && !this.playerMachine.stateMachine.isCurrentState(States.CONFUSED)) {
            this.playerMachine.stateMachine.setState(States.CONFUSED);
            return;
        };
        if (this.isFeared && !this.playerMachine.stateMachine.isCurrentState(States.FEARED)) {
            this.playerMachine.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isHurt && !this.isDefeated && !this.playerMachine.stateMachine.isCurrentState(States.HURT)) {
            this.playerMachine.stateMachine.setState(States.HURT);
            return;
        };
        if (this.isParalyzed && !this.playerMachine.stateMachine.isCurrentState(States.PARALYZED)) {
            this.playerMachine.stateMachine.setState(States.PARALYZED);
            return;
        };
        if (this.isStunned && !this.playerMachine.stateMachine.isCurrentState(States.STUN)) {
            this.playerMachine.stateMachine.setState(States.STUN);
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
    };

    handleMovement = () => {
        if (this.isDefeated) return;
        let speed = this.speed;
        const suffering = this.isSuffering();
        const isDesktop = this.scene.hud.settings.desktop === true;
        const input = isDesktop ? this.inputKeys : this.scene.hud.joystickKeys;
        if (isDesktop) {
            const pointer = this.scene.hud.input.activePointer.rightButtonDown();
            if (pointer) {
                const point = this.scene.getWorldPointer();
                const direction = point.subtract(this.position);
                direction.normalize();
                this.playerVelocity.x = speed;
                this.playerVelocity.y = speed;
                this.playerVelocity.x *= direction.x;
                this.playerVelocity.y *= direction.y;
                this.flipX = this.playerVelocity.x < 0;
            };
            if (input.right.D.isDown || input.right.RIGHT.isDown) {
                this.playerVelocity.x += this.acceleration;
                this.flipX = false;
            };
            if (input.left.A.isDown || input.left.LEFT.isDown) {
                this.playerVelocity.x -= this.acceleration;
                this.flipX = true;
            };
            if ((input.up.W.isDown || input.up.UP.isDown)) {
                this.playerVelocity.y -= this.acceleration;
            };
            if (input.down.S.isDown || input.down.DOWN.isDown) {
                this.playerVelocity.y += this.acceleration;
            };
            if (input.strafe.E.isDown || this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x > 0) {
                speed += 0.1;
                this.flipX = true;
            };
            if (input.strafe.Q.isDown || this.isStrafing === true && !this.isRolling && !this.isDodging && this.playerVelocity.x < 0) {
                speed -= 0.1;    
                this.flipX = false;
            };
            if (!suffering && !pointer && !input.right.D.isDown && !input.right.RIGHT.isDown && this.playerVelocity.x !== 0 && !input.left.A.isDown && !input.left.LEFT.isDown) {
                this.playerVelocity.x = 0;
            };
            if (!suffering && !pointer && !input.left.A.isDown && !input.left.LEFT.isDown && this.playerVelocity.x !== 0 && !input.right.D.isDown && !input.right.RIGHT.isDown) {
                this.playerVelocity.x = 0;
            };
            if (!suffering && !pointer && !input.up.W.isDown && !input.up.UP.isDown && this.playerVelocity.y !== 0 && !input.down.S.isDown && !input.down.DOWN.isDown) {
                this.playerVelocity.y = 0;
            };
            if (!suffering && !pointer && !input.down.S.isDown && !input.down.DOWN.isDown && this.playerVelocity.y !== 0 && !input.up.W.isDown && !input.up.UP.isDown) {
                this.playerVelocity.y = 0;
            };
        } else {
            if (input.right.isDown) {
                this.playerVelocity.x += this.acceleration;
                this.flipX = false;
            };
            if (input.left.isDown) {
                this.playerVelocity.x -= this.acceleration;
                this.flipX = true;
            };
            if (input.up.isDown) {
                this.playerVelocity.y -= this.acceleration;
            }; 
            if (input.down.isDown) {
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
            if (!suffering && this.playerVelocity.x !== 0 && !this.scene.hud.horizontal()) {
                this.playerVelocity.x = 0;
            };
            if (!suffering && this.playerVelocity.x !== 0 && !this.scene.hud.horizontal()) {
                this.playerVelocity.x = 0;
            };
            if (!suffering && this.playerVelocity.y !== 0 && !this.scene.hud.vertical()) {
                this.playerVelocity.y = 0;
            };
            if (!suffering && this.playerVelocity.y !== 0 && !this.scene.hud.vertical()) {
                this.playerVelocity.y = 0;
            };
        };
        if (this.isAttacking || this.isParrying || this.isPosturing || this.isThrusting || this.isJumping) speed += 1;
        if (this.isClimbing || this.inWater) speed *= 0.65;
        this.playerVelocity.limit(speed);
        this.setVelocity(this.playerVelocity.x, this.playerVelocity.y);
    };

    update(dt: number) {
        this.handleConcerns();
        this.handleActions();
        this.handleAnimations();
        this.handleMovement();
        this.playerMachine.stateMachine.update(dt);
        this.playerMachine.positiveMachine.update(dt);
        this.playerMachine.negativeMachine.update(dt);
    };
};