import Ascean from "../../models/ascean";
import Equipment from "../../models/equipment";
import { ComputerCombat, initComputerCombat } from "../../stores/computer";
import { Compiler } from "../../utility/ascean";
import { ENEMY_ATTACKS } from "../../utility/combatTypes";
import { BROADCAST_DEATH, DISTANCE, HEALS, MIND_STATES } from "../../utility/enemy";
import { PARTY_AOE, PARTY_RANGED, PARTY_SPECIAL } from "../../utility/party";
import { ENEMY_ENEMIES, PLAYER } from "../../utility/player";
import { ONE_HAND, TWO_HAND } from "../../utility/weaponTypes";
import { EventBus } from "../EventBus";
import { Play } from "../main";
import Beam from "../matter/Beam";
import { Particle } from "../matter/ParticleManager";
import CastingBar from "../phaser/CastingBar";
import { ENTITY_FLAGS } from "../phaser/Collision";
import HealthBar from "../phaser/HealthBar";
import { HitLocation } from "../phaser/HitDetection";
import { CacheDirection, CombatContext, MindState, MindStates } from "../phaser/MindState";
import PartyMachine from "../phaser/PartyMachine";
import { vibrate } from "../phaser/ScreenShake";
import { BONE, CAST, DAMAGE, EFFECT, HEAL, HUSH, TENDRIL } from "../phaser/ScrollingCombatText";
import { specialPositiveMachines, States } from "../phaser/StateMachine";
import Enemy from "./Enemy";
import Entity, { assetSprite, calculateThreat, ENEMY, FRAMES, GOLD_COLOR_MATRIX, Player_Scene, SWING_FORCE, SWING_FORCE_ATTRIBUTE, SWING_TIME } from "./Entity";
import { v4 as uuidv4 } from "uuid";

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
const MAX_HEARING_DISTANCE = 500;
const MIN_HEARING_DISTANCE = 100;
const PARTY_ATTACK_STATES = [States.COMPUTER_ATTACK, States.COMPUTER_PARRY, States.COMPUTER_POSTURE, States.COMPUTER_THRUST, States.DODGE, States.ROLL];
export default class Party extends Entity {
    playerID: string;
    computerAction: boolean = false;
    currentTarget: undefined | Enemy = undefined;
    spellTarget: string = "";
    targetIndex: number = 1;
    isMoving: boolean = false;
    targetID: string = "";
    staminaModifier: number = 0;
    strafingLeft: boolean = false;
    strafingRight: boolean = false;
    currentShieldSprite: string;
    playerVelocity: Phaser.Math.Vector2;
    fearCount: number = 0;
    playerMachine: PartyMachine;
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
    wasFlipped: boolean = false;
    spellName: string = "";
    followTimer: Phaser.Time.TimerEvent | undefined = undefined;
    reconTimer: Phaser.Time.TimerEvent | undefined = undefined;
    isNetherswapping: boolean = false;
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
    chasing: boolean = false;
    enemyID = uuidv4();
    inComputerCombat: boolean = false;
    computerCombatSheet: ComputerCombat = initComputerCombat;
    weapons: any[] = [];
    combatSpecials: any[];
    enemies: ENEMY[] | any[] = [];
    partyPosition: number;
    hurtTime: number = 0;
    potentialEnemies: string[] = [];
    cachedDirectionFrame: number = 0;
    weaponTypeCacheFrame: number = 0;
    weaponTypeCache: { thisIsRanged: boolean; targetIsRanged: boolean; } = { thisIsRanged: false, targetIsRanged: false };
    cachedDirection: any;
    mindState: MindState;
    mindStateName: string;
    combatContext: CombatContext | undefined = undefined;
    combatContextFrame: number = 0;
    colorMatrix: Phaser.FX.ColorMatrix;

    constructor(data: { scene: Play, x: number, y: number, texture: string, frame: string, data: Compiler, position: number }) {
        const { scene } = data;
        const ascean = data.data.ascean;
        super({ ...data, name: "party", ascean: ascean, health: ascean.health.current });
        this.ascean = ascean;
        this.combatStats = data.data;
        this.health = this.ascean.health.max;
        this.weapons = [data.data.combatWeaponOne, data.data.combatWeaponTwo, data.data.combatWeaponThree];
        this.playerID = this.ascean._id;
        this.partyPosition = data.position; 
        this.computerCombatSheet = this.createComputerCombatSheet(data.data);
        const weapon = this.weapons[0];
        this.colorMatrix = this.postFX.addColorMatrix();
        this.colorMatrix.brightness(0.5);
        this.colorMatrix.set(GOLD_COLOR_MATRIX);
        // this.setTint(COLOR);
        this.currentWeaponSprite = assetSprite(weapon);
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this.currentWeaponSprite);
        if (weapon.grip === ONE_HAND) {
            this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
            this.swingTimer = SWING_TIME[ONE_HAND];
        } else {
            this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
            this.swingTimer = SWING_TIME[TWO_HAND];
        };
        this.spriteWeapon.setOrigin(0.25, 1);
        this.scene.add.existing(this);
        this.scene.add.existing(this.spriteWeapon);
        this.setVisible(true);
        this.spriteWeapon.setAngle(-195);
        this.currentDamageType = weapon?.damageType?.[0].toLowerCase() as string;
        this.currentTarget = undefined;
        this.isMoving = false;
        this.currentShieldSprite = assetSprite(this.ascean?.shield);
        this.spriteShield = this.createSprite(this.currentShieldSprite, 0, 0, PLAYER.SCALE.SHIELD, ORIGIN.SHIELD.X, ORIGIN.SHIELD.Y);
        this.spriteShield.setVisible(false);
        this.playerVelocity = new Phaser.Math.Vector2();
        this.speed = this.startingSpeed(ascean);
        this.potentialEnemies = ENEMY_ENEMIES[this.ascean.name] || [];
        this.playerMachine = new PartyMachine(scene, this);
        this.setScale(PLAYER.SCALE.SELF);   
        // let partyCollider = Bodies.rectangle(this.x, this.y + 10, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT, { 
        //     isSensor: false, label: "partyCollider",
        //     // collisionFilter: {category: ENTITY_FLAGS.PARTY, mask: ENTITY_FLAGS.ENEMY}
        // }); // Y + 10 For Platformer
        const underground = this.scene.hud.currScene === "Underground" || this.scene.hud.currScene === "Arena" || this.scene.hud.currScene === "Gauntlet";
        let colliderUpper = Bodies.rectangle(this.x, this.y + 2, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT / 2, {
            isSensor: !underground,
            label: "body",
        }); // Y + 10 For Platformer
        let colliderLower = Bodies.rectangle(this.x, this.y + 18, PLAYER.COLLIDER.WIDTH, PLAYER.COLLIDER.HEIGHT / 2, {
            isSensor: underground,
            label: "legs", 
        }); // Y + 10 For Platformer
        let partySensor = Bodies.circle(this.x, this.y + 2, PLAYER.SENSOR.DEFAULT, { isSensor: true, label: "partySensor" }); // Y + 2 For Platformer
        const compoundBody = Body.create({
            parts: [partySensor, colliderLower, colliderUpper],
            frictionAir: 0.5,
            restitution: 0.2,
        });
        this.setExistingBody(compoundBody);                                    
        this.sensor = partySensor;
        this.setCollisionCategory(ENTITY_FLAGS.PARTY);
        this.setCollidesWith(ENTITY_FLAGS.ENEMY | ENTITY_FLAGS.PARTICLES | ENTITY_FLAGS.WORLD);
        this.weaponHitbox = this.scene.add.circle(this.spriteWeapon.x, this.spriteWeapon.y, 24, 0xfdf6d8, 0);
        this.scene.add.existing(this.weaponHitbox);
        this.aoeMask = ENTITY_FLAGS.PARTY;

        this.highlight = this.scene.add.graphics()
            .lineStyle(4, 0xffd700)
            .setScale(0.2)
            .strokeCircle(0, 0, 12)
            .setDepth(99);
        (this.scene.plugins?.get?.("rexGlowFilterPipeline") as any)?.add(this.highlight, {
            intensity: 0.005,
        });
        this.highlight.setVisible(false);

        this.mark = this.scene.add.graphics()
            .lineStyle(4, 0xffd700)
            .setScale(0.5)
            .strokeCircle(0, 0, 12);
        this.mark.setVisible(false);
        this.markAnimation = false;
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health, "party");
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
        this.rushedEnemies = [];
        this.playerStateListener();
        this.setFixedRotation();   
        this.collision(partySensor);
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on("pointerdown", () => {
                this.scene.hud.logger.log(`Console: ${this.ascean.name}'s current State: ${this.playerMachine.stateMachine.getCurrentState()?.charAt(0).toUpperCase()}${this.playerMachine.stateMachine.getCurrentState()?.slice(1)}`)
                if (this.currentTarget) {
                    this.scene.hud.logger.log(`Console: ${this.ascean.name} is currently attacking ${this.currentTarget.ascean.name}`);
                };
                if (this.scene.player.isComputer) return;
                // this.clearTint();
                // this.setTint(TARGET_COLOR);
                this.ping();
                vibrate();
                if (this.enemyID !== this.scene.state.enemyID) this.scene.hud.setupEnemy(this);
                this.scene.player.setCurrentTarget(this);
            })
            .on("pointerout", () => {
                // this.clearTint();
                // this.setTint(COLOR);
            });
        this.scene.time.delayedCall(1000, () => {
            this.setVisible(true);
            this.spriteWeapon.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y);
            this.createShadow(true);
        });
        this.beam = new Beam(this);
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {}; // For Leashing
        this.isCaerenic = false;
        this.isStalwart = false;

        const mindStates = MIND_STATES[this.ascean.mastery];
        const mindStateName = mindStates[Math.floor(Math.random() * mindStates.length)];

        this.mindState = MindStates[mindStateName];
        this.mindStateName = mindStateName;
        if (this.mindState.startup) this.mindState.startup(this, this.getCombatContext());

        this.checkSpecials(ascean);
    };

    ping = () => {
        if (this.ascean?.level > (this.scene.state.player?.level as number || 0)) {
            this.scene.sound.play("righteous", { volume: this.scene.hud.settings.volume });
        } else if (this.ascean?.level === this.scene.state.player?.level) {
            this.scene.sound.play("combat-round", { volume: this.scene.hud.settings.volume });                    
        } else {
            this.scene.sound.play("consume", { volume: this.scene.hud.settings.volume });
        };
    };

    cleanUp() {
        EventBus.off(BROADCAST_DEATH, this.clearComputerCombatWin);
        EventBus.off("engage", this.engage);
        EventBus.off("speed", this.speedUpdate);
        EventBus.off("update-stealth", this.stealthUpdate);
        if (this.isGlowing) this.checkCaerenic(false);
        if (this.isShimmering) {
            this.isShimmering = false;
            this.playerMachine.stealthEffect(false);
        };
        this.setActive(false);
        this.clearBubbles();
        this.removeHighlight();
        this.scrollingCombatText = undefined;
        this.specialCombatText = undefined;
        this.castbar.cleanUp();
        this.healthbar.cleanUp();
        this.spriteWeapon.destroy();
        this.spriteShield.destroy();
        this.highlight.destroy();
    };

    playerStateListener = () => {
        EventBus.on(BROADCAST_DEATH, this.clearComputerCombatWin);
        EventBus.on("engage", this.engage);
        EventBus.on("speed", this.speedUpdate);
        EventBus.on("update-stealth", this.stealthUpdate);
    }; 

    createComputerCombatSheet = (e: Compiler): ComputerCombat => {
        const newSheet: ComputerCombat = {
            ...this.computerCombatSheet,
            computer: e.ascean,
            computerHealth: e.ascean.health.max,
            newComputerHealth: e.ascean.health.max,
            computerWeapons: [e.combatWeaponOne, e.combatWeaponTwo, e.combatWeaponThree],
            computerWeaponOne: e.combatWeaponOne,
            computerWeaponTwo: e.combatWeaponTwo,
            computerWeaponThree: e.combatWeaponThree,
            computerAttributes: e.attributes,
            computerDefense: e.defense,
            computerDamageType: e.combatWeaponOne.damageType?.[0] as string,
            personalID: this.enemyID,
        };
        return newSheet;
    };

    callToArms = (enemy: Enemy): void => {
        this.checkComputerEnemyCombatEnter(enemy);
        for (let i = 0; i < this.scene.party.length; i++) {
            const p = this.scene.party[i];
            if (!p.inComputerCombat) {
                p.checkComputerEnemyCombatEnter(enemy);
            };
        };
    };

    checkComputerEnemyCombatEnter = (enemy: Enemy): void => {
        if (enemy.isDefeated || enemy.health <= 0) return;
        this.currentTarget = enemy;
        this.inComputerCombat = true;
        this.computerCombatSheet = {
            ...this.computerCombatSheet,
            computerEnemy: enemy.ascean,
            // computerEnemyBlessing: enemy.computerCombatSheet.computerBlessing,
            computerEnemyHealth: enemy.ascean.health.max,
            newComputerEnemyHealth: enemy.health,
            computerEnemyWeapons: enemy.computerCombatSheet.computerWeapons as Equipment[],
            computerEnemyWeaponOne: enemy.computerCombatSheet.computerWeaponOne,
            computerEnemyWeaponTwo: enemy.computerCombatSheet.computerWeaponTwo,
            computerEnemyWeaponThree: enemy.computerCombatSheet.computerWeaponThree,
            computerEnemyAttributes: enemy.computerCombatSheet.computerAttributes,
            computerEnemyDamageType: enemy.computerCombatSheet.computerDamageType,
            computerEnemyDefense: enemy.computerCombatSheet.computerDefense,
            // computerEnemyDefenseDefault: enemy.computerCombatSheet.computerDefenseDefault,
            // computerEnemyEffects: enemy.computerCombatSheet.computerEffects,
            enemyID: enemy.enemyID,
        };
        const newEnemy = this.isNewComputerEnemy(enemy);
        if (newEnemy) {
            this.enemies.push({id:enemy.enemyID,threat:0});
        };

        if (this.healthbar) this.healthbar.setVisible(true);
        this.originPoint = new Phaser.Math.Vector2(this.x, this.y).clone();
        this.scene.showCombatText(this, "!", 1000, EFFECT, true, true);
        this.scene.hud.logger.log(`Console: ${this.ascean.name} is being called to arms against ${enemy.ascean.name}!`);
        const distance = this.currentTarget.position.subtract(this.position).length();
        const state = distance > 100 ? States.CHASE : States.COMPUTER_COMBAT;
        this.playerMachine.stateMachine.setState(state);
        if (!enemy.inComputerCombat) {
            enemy.checkComputerEnemyCombatEnter(this);
        };
    };

    isNewComputerEnemy = (enemy: Enemy): boolean => {
        const newEnemy = this.enemies.every(obj => obj.id !== enemy.enemyID);
        return newEnemy;
    };

    playerInCombat = (enemy: Enemy): boolean => enemy && enemy.name === "enemy" && this.scene.combat;

    checkTouch = (entity: any, add: boolean) => {
        if (entity.bodyB.label !== "body") return;
        if (add) {
            this.touching.push(entity.gameObjectB);
        } else {
            this.touching = this.touching.filter(obj => obj !== entity.gameObjectB);
        };
    };

    collision = (partySensor: any): void => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [partySensor],
            callback: (other: any) => {
                if (this.isDeleting || !other.gameObjectB || other.gameObjectB.isDeleting) return;
                this.isValidRushEnemy(other.gameObjectB);
                if (other.gameObjectB?.name === "enemy") this.checkTouch(other, true);
                // if (other.gameObjectB?.name === "enemy") this.touching.push(other.gameObjectB);
                if ((this.isValidEnemyCollision(other) || this.playerInCombat(other.gameObjectB)) && this.potentialEnemies.includes(other.gameObjectB.ascean.name)) {
                    const isNewEnemy = this.isNewEnemy(other.gameObjectB);
                    if (!isNewEnemy) return;
                    this.targets.push(other.gameObjectB);
                    if (!this.currentTarget) this.callToArms(other.gameObjectB);
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideActive({
            objectA: [partySensor],
            callback: (other: any) => {
                if (this.isDeleting) return;
                if (other.gameObjectB?.isDeleting) return;
                this.isValidRushEnemy(other.gameObjectB);
                if (this.isValidEnemyCollision(other)) {
                    if (!this.currentTarget) this.currentTarget = other.gameObjectB;
                    if (!this.targetID) this.targetID = other.gameObjectB.enemyID;    
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [partySensor],
            callback: (other: any) => {
                if (this.isDeleting || !other.gameObjectB) return;
                if (other.gameObjectB.name === "enemy") this.checkTouch(other, false);
                // if (other.gameObjectB?.name === "enemy") this.touching = this.touching.filter((target) => target !== other.gameObjectB);
            },
            context: this.scene,
        });
    };

    enemySound = (key: string, active: boolean) => {
        if (!active || !this.scene.player) return;
        const distance = Phaser.Math.Distance.Between(this.scene.player.x,this.scene.player.y,this.x,this.y);
        if (distance <= MIN_HEARING_DISTANCE) {
            this.scene.sound.play(key, { volume: this.scene.hud.settings.volume });
        } else if (distance <= MAX_HEARING_DISTANCE) {
            const normalizedDistance = Phaser.Math.Clamp(distance / MAX_HEARING_DISTANCE, 0, 1);
            const volume = this.scene.hud.settings.volume * (1 - (normalizedDistance ** 2));
            this.scene.sound.play(key, { volume });
        };
    };

    updateHealthBar(health: number) {
        return this.healthbar.setValue(health);
    };

    updateEnemyTarget(target: Enemy) {
        this.currentTarget = target;
        this.inComputerCombat = true;
        this.computerCombatSheet = {
            ...this.computerCombatSheet,
            computerEnemy: target.ascean,
            // computerEnemyBlessing: target.computerCombatSheet.computerBlessing,
            computerEnemyHealth: target.ascean.health.max,
            newComputerEnemyHealth: target.health,
            computerEnemyWeapons: target.computerCombatSheet.computerWeapons as Equipment[],
            computerEnemyWeaponOne: target.computerCombatSheet.computerWeaponOne,
            computerEnemyWeaponTwo: target.computerCombatSheet.computerWeaponTwo,
            computerEnemyWeaponThree: target.computerCombatSheet.computerWeaponThree,
            computerEnemyAttributes: target.computerCombatSheet.computerAttributes,
            computerEnemyDamageType: target.computerCombatSheet.computerDamageType,
            computerEnemyDefense: target.computerCombatSheet.computerDefense,
            // computerEnemyDefenseDefault: target.computerCombatSheet.computerDefenseDefault,
            // computerEnemyEffects: target.computerCombatSheet.computerEffects,
            enemyID: target.enemyID,
        };
        if (this.healthbar.visible === false) this.healthbar.setVisible(true);
        this.scene.showCombatText(this, `New Target: ${target.ascean.name}`, 1500, EFFECT, false, true);
    };

    computerSoundEffects = (sfx: ComputerCombat) => {
        switch (sfx.computerEnemyDamageType) {
            case "Spooky":
                return this.enemySound("spooky", true);
            case "Righteous":
                return this.enemySound("righteous", true);
            case "Wild":
                return this.enemySound("wild", true);
            case "Earth":
                return this.enemySound("earth", true);
            case "Fire":
                return this.enemySound("fire", true);
            case "Frost":
                return this.enemySound("frost", true);
            case "Lightning":
                return this.enemySound("lightning", true);
            case "Sorcery":
                return this.enemySound("sorcery", true);
            case "Wind":
                return this.enemySound("wind", true);
            case "Pierce":
                return (sfx.computerEnemyWeapons[0].type === "Bow" || sfx.computerEnemyWeapons[0].type === "Greatbow") 
                    ? this.enemySound("bow", true) 
                    : this.enemySound("pierce", true);
            case "Slash":
                return this.enemySound("slash", true);
            case "Blunt":
                return this.enemySound("blunt", true);
        };
    };

    updateThreat(id: string, threat: number) {
        const enemyToUpdate = this.enemies.find(enemy => enemy.id === id);
        if (enemyToUpdate) {
            enemyToUpdate.threat += threat;
        };
        if (this.enemies.length <= 1 || this.health <= 0) return;
        this.enemies = this.enemies.sort((a, b) => b.threat - a.threat);
        let topEnemy: string = this.enemies[0].id;
        if (this.currentTarget && this.currentTarget.enemyID !== topEnemy) {
            const enemy = this.scene.getEnemy(topEnemy);
            if (enemy && enemy.health > 0) this.updateEnemyTarget(enemy);
        } else if (!this.currentTarget) {
            const enemy = this.scene.getEnemy(topEnemy);
            if (enemy && enemy.health > 0) this.updateEnemyTarget(enemy);
        };
    };

    checkHurt = () => {
        if (this.isCasting || this.isFeared || this.isStunned || this.isParalyzed || this.isPraying) return; // this.isTrying() || 
        this.isHurt = true;
        this.playerMachine.stateMachine.setState(States.HURT);
    };

    computerCombatUpdate = (e: ComputerCombat) => {
        const { enemyID, newComputerHealth } = e;
        
        if (this.health > newComputerHealth) {
            let damage: number | string = Math.round(this.health - newComputerHealth);
            this.scene.showCombatText(this, `${damage}`, 1500, EFFECT, e.computerEnemyCriticalSuccess, false);
            this.checkHurt();
            // if (!this.isSuffering() && !this.isTrying() && !this.isCasting && !this.isContemplating) this.isHurt = true;
            if (this.isFeared) {
                const chance = Math.random() < 0.1 + this.fearCount;
                if (chance) {
                    this.scene.showCombatText(this, "Fear Broken", PLAYER.DURATIONS.TEXT, EFFECT);
                    this.isFeared = false;
                } else {
                    this.fearCount += 0.1;
                };
            };
            if (this.isConfused) this.isConfused = false;
            if (this.isPolymorphed) this.isPolymorphed = false;
            if (this.isMalicing) this.malice(enemyID);
            if (this.isMending) this.mend();

            if ((!this.inComputerCombat || !this.currentTarget) && newComputerHealth > 0 && enemyID !== this.enemyID) {
                const enemy = this.scene.getEnemy(enemyID);
                if (enemy) this.checkComputerEnemyCombatEnter(enemy);
            };

            const id = this.enemies.find((en: ENEMY) => en.id === enemyID);
            if (id && newComputerHealth > 0) {
                this.updateThreat(enemyID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, this.ascean.health.max));
            } else if (!id && newComputerHealth > 0 && enemyID !== "") {
                this.enemies.push({id:enemyID,threat:0});
                this.updateThreat(enemyID, calculateThreat(Math.round(this.health - newComputerHealth), newComputerHealth, this.ascean.health.max));
            };
            this.computerSoundEffects(e);
        } else if (this.health < newComputerHealth) {
            let heal = Math.round(newComputerHealth - this.health);
            this.scene.showCombatText(this, `+${heal}`, 1500, HEAL);
        }; 
        
        this.health = newComputerHealth;
        this.computerCombatSheet.newComputerHealth = this.health;
        if (this.healthbar.getTotal() < e.computerHealth) this.healthbar.setTotal(e.computerHealth);
        this.updateHealthBar(newComputerHealth);

        this.weapons = e.computerWeapons;
        this.currentRound = e.combatRound;
        if (e.computerDamaged) this.scene.combatManager.hitFeedbackSystem.spotEmit(this.enemyID, e.computerEnemyDamageType);
        if (e?.realizedComputerDamage > 0) EventBus.emit("party-combat-text", { text: `${this.ascean.name} ${ENEMY_ATTACKS[e.computerAction]} ${e.computerEnemy?.name} with their ${e.computerWeapons[0]?.name} for ${Math.round(e?.realizedComputerDamage as number)} ${e.computerDamageType} damage.` });
        
        this.computerCombatSheet.computerAction = "";
        this.computerCombatSheet.computerEnemyAction = "";
        this.computerCombatSheet.parrySuccess = false;
        this.computerCombatSheet.computerEnemyParrySuccess = false;
        this.computerCombatSheet.criticalSuccess = false;
        this.computerCombatSheet.computerEnemyCriticalSuccess = false;
        this.computerCombatSheet.glancingBlow = false;
        this.computerCombatSheet.computerEnemyGlancingBlow = false;
        this.computerCombatSheet.computerWin = e.computerWin;
        
        if (e.newComputerEnemyHealth <= 0 && this.computerCombatSheet.computerWin) {
            this.computerCombatSheet.computerWin = false;
            this.clearComputerCombatWin(enemyID);
        };

        this.checkGear(e.computer?.shield as Equipment, e.computerWeapons?.[0] as Equipment, e.computerDamageType.toLowerCase());
        this.scene.combatManager.checkPlayerFocus(this.enemyID, this.health);
        if (this.health <= 0) this.playerMachine.stateMachine.setState(States.DEFEATED);
    };
    

    checkGear = (shield: Equipment, weapon: Equipment, damage: string) => {
        if (!shield || !weapon) return;
        this.currentDamageType = damage;    
        this.hasMagic = this.checkDamageType(damage, "magic");
        this.checkMeleeOrRanged(weapon);
        if (this.currentWeaponSprite !== assetSprite(weapon)) {
            this.currentWeaponSprite = assetSprite(weapon);
            this.spriteWeapon.setTexture(this.currentWeaponSprite);
            if (weapon.grip === ONE_HAND) {
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
                this.swingTimer = SWING_TIME[ONE_HAND];
            } else {
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
                this.swingTimer = SWING_TIME[TWO_HAND];
            };
        };
        if (this.currentShieldSprite !== assetSprite(shield)) {
            this.currentShieldSprite = assetSprite(shield);
            this.spriteShield.setTexture(this.currentShieldSprite);
        };
    };

    clearComputerCombatWin = (id: string) => {
        this.enemies = this.enemies.filter((enemy) => enemy.id !== id);
        if (this.enemies.length === 0) {
            if (this.scene.player.inCombat && this.scene.player.currentTarget) {
                this.currentTarget = this.scene.player.currentTarget;
                return;    
            };
            this.inComputerCombat = false;
            this.currentTarget = undefined;
            this.clearStatuses();
            this.disengage();
        } else {
            const newId = this.enemies[0].id;
            const newEnemy = this.scene.getEnemy(newId);
            if (newEnemy && newEnemy.health > 0) {
                this.currentTarget = newEnemy;
            } else {
                this.clearComputerCombatWin(newId);
            };
        };
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

    clearStatuses = () => {
        this.isConfused = false;
        this.isConsumed = false;
        this.isFeared = false;
        this.isFrozen = false;
        this.isHurt = false;
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
        this.playerMachine.positiveMachine.setState(States.CLEAN);
        this.playerMachine.negativeMachine.setState(States.CLEAN);
        this.clearBubbles();
    };

    combatChecker = (state: boolean) => {
        if (state) return;
        this.playerMachine.stateMachine.setState(States.CHASE);
    };

    caerenicUpdate = (caerenic: boolean) => {
        this.isCaerenic = caerenic;
        this.enemySound("blink", true);
        const multiplier = caerenic ? 1 : -1;
        this.adjustSpeed(PLAYER.SPEED.CAERENIC * multiplier);
        this.computerCombatSheet.computerCaerenic = caerenic;
        if (this.isGlowing) return;
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic);
        this.setGlow(this.spriteShield, caerenic);
        this.shadow?.setVisible(!caerenic);
    };

    stalwartUpdate = (stalwart: boolean) => {
        this.isStalwart = stalwart;
        this.spriteShield.setVisible(this.isStalwart);
        this.enemySound("stalwart", this.isStalwart);
        this.computerCombatSheet.computerStalwart = stalwart;
    };

    checkCaerenic = (caerenic: boolean, kill: boolean = false) => {
        this.isGlowing = caerenic;
        if (this.isCaerenic && !kill) return;
        this.setGlow(this, caerenic);
        this.setGlow(this.spriteWeapon, caerenic, "weapon");
        this.setGlow(this.spriteShield, caerenic, "shield");
        this.shadow?.setVisible(!caerenic);
    };

    flickerCaerenic = (duration: number) => {
        if (!this.isCaerenic && !this.isGlowing) {
            this.checkCaerenic(true);
            this.scene.time.delayedCall(duration, () => {
                this.checkCaerenic(false);
            }, undefined, this);
        };
    };

    setMindState = (mind: string) => {
        this.mindStateName = mind;
        this.mindState = MindStates[mind];
        if (this.mindState.startup) this.mindState.startup(this, this.getCombatContext());
    };

    createSprite = (imgUrl: string, x: number, y: number, scale: number, originX: number, originY: number) => {
        const sprite = new Phaser.GameObjects.Sprite(this.scene, x, y, imgUrl);
        sprite.setScale(scale);
        sprite.setOrigin(originX, originY);
        this.scene.add.existing(sprite);
        sprite.setDepth(this.depth + 1);
        return sprite;
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

    highlightTarget = (sprite: Enemy) => {
        if (!sprite || !sprite.body) return;
        if (this.highlightAnimation === false) {
            this.highlightAnimation = true;
            this.animateTarget();
        };
        this.highlight.setPosition(sprite.x, sprite.y);
        this.highlight.setVisible(true);
    };

    removeHighlight() {
        this.highlight.setVisible(false);
        this.highlightAnimation = false;
    };

    completeReset = () => {
        this.playerMachine.stateMachine.setState(States.IDLE);
        this.isCasting = false;
        this.isMoving = false;
    };
    
    checkSpecials(ascean: Ascean) {
        this.combatSpecials = PARTY_SPECIAL[ascean.mastery];
    };
    
    setSpecialCombat = (mult = 0.75, remove = false) => {
        if (remove) return;
        this.scene.time.delayedCall(DURATION.SPECIAL * mult, () => {
            if (!this.inComputerCombat) return;
            if (this.isCasting === true || this.isSuffering() || this.isContemplating) {
                this.setSpecialCombat(0.1);
                return;
            };
            const special = this.combatSpecials[Math.floor(Math.random() * this.combatSpecials.length)].toLowerCase();
            // const test = ["achire", "quor"];
            // const special = test[Math.floor(Math.random() * test.length)];
            this.setVelocity(0);
            this.isMoving = false;
            if (this.playerMachine.stateMachine.isState(special)) {
                this.playerMachine.stateMachine.setState(special);
            } else if (this.playerMachine.positiveMachine.isState(special)) {
                this.playerMachine.positiveMachine.setState(special);
            };
            this.setSpecialCombat();
        }, undefined, this);
    };

    mastery = () => this.ascean[this.ascean.mastery] || 20;

    resist = () => {
        this.scene.showCombatText(this, "Resisted", PLAYER.DURATIONS.TEXT, EFFECT);
    };

    startCasting = (name: string, duration: number, _style: string, channel = false) => {
        this.castbar.reset();
        this.castbar.setVisible(true); // Added
        this.castbar.setup(this.x, this.y, name);
        this.isCasting = true;
        // this.scene.showCombatText(this, name, duration / 2, style, false, true);
        this.castbar.setTotal(duration);
        if (name !== "Healing" && name !== "Reconstituting") this.beam.enemyEmitter(this.currentTarget, duration, this.ascean.mastery); // scene.player
        if (channel === true) this.castbar.setTime(duration);
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.setVelocity(0);
        this.anims.play(FRAMES.CAST, true);
    };

    stopCasting = () => {
        this.isCasting = false;
        this.castingSuccess = false;
        this.castbar.reset();
        this.beam.reset();
        this.spellTarget = "";
        this.spellName = "";
        this.timeElapsed = 0;
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    startPraying = () => {
        this.isPraying = true;
        this.timeElapsed = 0;
        this.setStatic(true);
        this.anims.play(FRAMES.PRAY, true).once(FRAMES.ANIMATION_COMPLETE, () => {
            this.isPraying = false;
            this.timeElapsed = 0;
            this.setStatic(false);
        });
    };

    leap = () => {
        this.timeElapsed = 0;
        this.isLeaping = true;
        if (!this.currentTarget) {
            
            return;
        };
        const target = new Phaser.Math.Vector2(this.currentTarget.x, this.currentTarget.y);
        const direction = target.subtract(this.position);
        const distance = direction.length();
        const buffer = this.currentTarget.hMoving() ? 40 : 0;
        let leap = Math.min(distance + buffer, 200);
        direction.normalize();
        this.flipX = direction.x < 0;
        // this.attack();
        const leapStartY = this.y;
        const arcHeight = 75; // Adjust this value for higher/lower arcs
        this.scene.combatManager.hitFeedbackSystem.trailing(this, true);
        this.scene.tweens.add({
            targets: this,
            scale: 1.2,
            duration: 400,
            ease: Phaser.Math.Easing.Back.InOut,
            yoyo: true,
        });

        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * leap),
            y: this.y + (direction.y * leap),
            duration: 800,
            ease: Phaser.Math.Easing.Back.InOut,
            onStart: () => {
                this.isAttacking = true;
                this.enemySound("leap", true);
                this.anims.play(FRAMES.GRAPPLE_ROLL, true);
            },
            onUpdate: (tween) => {
                const progress = tween.progress;
                const currentArc = Math.sin(progress * Math.PI) * arcHeight;
                this.y = leapStartY + (this.y - leapStartY) - currentArc;
            },
            onComplete: () => {
                this.anims.play(FRAMES.ATTACK, true).once(FRAMES.ANIMATION_COMPLETE, () => this.isAttacking = false);
                this.isLeaping = false; 
                const length = this.touching.length;
                if (length > 0) {
                    this.lastHitLocation = {
                        location: HitLocation.CHEST,
                        hitPoint: {x:0,y:0},
                        relativePosition: {x:0,y:0}
                    };
                    for (let i = 0; i < length; ++i) {
                        this.scene.combatManager.partyAction({action: "leap", origin: this.enemyID, enemyID: this.touching[i].enemyID });
                    };
                };
                if (this.health > 0) this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
            },
        });
        EventBus.emit("party-combat-text", {
            playerSpecialDescription: `${this.ascean.name} launches themself through the air!`
        });
    };

    rush = () => {
        this.timeElapsed = 0;
        this.isRushing = true;
        this.isThrusting = true;
        this.enemySound("stealth", true);

        const target = this.currentTarget ? this.currentTarget.position : this.scene.getWorldPointer();
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
            targets: this,
            x: this.x + (direction.x * 300),
            y: this.y + (direction.y * 300),
            duration: 600,
            ease: "Circ.easeOut",
            onComplete: () => this.rushComplete(),
        });
    };

    rushComplete = () => {
        const rush = this.rushedEnemies.length;
        if (rush > 0) {
            this.lastHitLocation = {
                location: HitLocation.CHEST,
                hitPoint: {x:0,y:0},
                relativePosition: {x:0,y:0}
            };
            for (let i = 0; i < rush; ++i) {
                const enemy = this.rushedEnemies[i];
                if (enemy.health <= 0) continue;
                if (enemy.isWarding || enemy.isShielding || enemy.isProtecting) {
                    if (enemy.isShielding) enemy.shield();
                    if (enemy.isWarding) enemy.ward(this.enemyID);
                    continue;
                };
                if (enemy.isMenacing) enemy.menace(this.enemyID);
                if (enemy.isMultifaring) enemy.multifarious(this.enemyID);
                if (enemy.isMystifying) enemy.mystify(this.enemyID);
                this.scene.combatManager.partyAction({enemyID: enemy.enemyID, action: "rush", origin: this.enemyID});
            }; 
        } else {
            const touch = this.touching.length;
            for (let i = 0; i < touch; ++i) {
                const enemy = this.touching[i];
                if (enemy.health <= 0) return;
                if (enemy.isWarding || enemy.isShielding || enemy.isProtecting) {
                    if (enemy.isShielding) enemy.shield();
                    if (enemy.isWarding) enemy.ward(this.enemyID);
                    return;
                };
                if (enemy.isMenacing) enemy.menace(this.enemyID);
                if (enemy.isMultifaring) enemy.multifarious(this.enemyID);
                if (enemy.isMystifying) enemy.mystify(this.enemyID);
                this.scene.combatManager.partyAction({enemyID: enemy.enemyID, action: "rush", origin: this.enemyID});
            };
        };
        this.isRushing = false;
        if (this.health > 0) this.playerMachine.stateMachine.setState(States.CHASE);
    };

    storm = () => {
        this.clearAnimations();
        this.timeElapsed = 0;
        this.isStorming = true;
        this.isAttacking = true;
        this.scene.showCombatText(this, "Storming", 800, DAMAGE); 
        this.anims.play(FRAMES.ATTACK, true).once(FRAMES.ANIMATION_COMPLETE, () => this.isAttacking = false);
        this.adjustSpeed(0.5);
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 800,
            onStart: () => this.flickerCaerenic(3200),
            onLoop: () => {
                this.timeElapsed = 0;
                this.clearAnimations();
                if (this.isSuffering()) return;
                this.isAttacking = true;
                this.anims.play(FRAMES.ATTACK, true).once(FRAMES.ANIMATION_COMPLETE, () => this.isAttacking = false);
                this.scene.showCombatText(this, "Storming", 800, DAMAGE);
                if (this.touching.length > 0) {
                    for (let i = 0; i < this.touching.length; ++i) {
                        const enemy = this.touching[i];
                        if (enemy.health <= 0) return;
                        if (enemy.isWarding || enemy.isShielding || enemy.isProtecting) {
                            if (enemy.isShielding) enemy.shield();
                            if (enemy.isWarding) enemy.ward(this.enemyID);
                            return;
                        };
                        if (enemy.isMenacing) enemy.menace(this.enemyID);
                        if (enemy.isMultifaring) enemy.multifarious(this.enemyID);
                        if (enemy.isMystifying) enemy.mystify(this.enemyID);
                        this.scene.combatManager.partyAction({ action: "storm", origin: this.enemyID, enemyID: enemy.enemyID });
                    };
                };
            },
            onComplete: () => {this.isStorming = false; this.adjustSpeed(-0.5);},
            loop: 3,
        });  
        EventBus.emit("special-combat-text", {
            playerSpecialDescription: `You begin storming with your ${this.computerCombatSheet.computerWeapons[0]?.name}.`
        });
    };

    absorb = () => {
        if (this.negationBubble === undefined || this.isAbsorbing === false) {
            if (this.negationBubble) {
                this.negationBubble.destroy();
                this.negationBubble = undefined;
            };
            this.isAbsorbing = false;
            return;
        };
        this.enemySound("absorb", true);
        this.scene.showCombatText(this, "Absorbed", 500, EFFECT, false, true);
        if (Math.random() < 0.2) {
            this.isAbsorbing = false;
        };
    };

    envelop = () => {
        if (this.reactiveBubble === undefined || this.isEnveloping === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
            };
            this.isEnveloping = false;
            return;
        };
        this.enemySound("caerenic", true);
        this.scene.showCombatText(this, "Enveloped", 500, EFFECT, false, true);
        if (Math.random() < 0.2) {
            this.isEnveloping = false;
        };
    };

    malice = (id: string) => {
        if (this.reactiveBubble === undefined || this.isMalicing === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
            };
            this.isMalicing = false;
            return;
        };
        this.enemySound("debuff", true);
        this.scene.showCombatText(this, "Maliced", 750, HUSH, false, true);
        this.playerMachine.chiomism(id, 10);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isMalicing = false;
        };
    };

    menace = (id: string) => {
        if (id === "") return;
        if (this.reactiveBubble === undefined || this.isMenacing === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMenacing = false;
            return;
        };
        this.scene.combatManager.fear(id);
        this.enemySound("caerenic", true);
        this.scene.showCombatText(this, "Menaced", 500, TENDRIL, false, true);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMenacing = false;
        };
    };

    mend = () => {
        if (this.reactiveBubble === undefined || this.isMending === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.destroy();
                this.reactiveBubble = undefined;
            };
            this.isMending = false;
            return;
        };
        this.enemySound("caerenic", true);
        this.scene.showCombatText(this, "Mended", 500, TENDRIL, false, true);
        this.playerMachine.heal(0.15);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isMending = false;
        };
    };

    moderate = (id: string) => {
        if (id === "") return;
        if (this.reactiveBubble === undefined || this.isModerating === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isModerating = false;
            return;
        };
        this.scene.combatManager.slow(id);
        this.enemySound("debuff", true);
        this.scene.showCombatText(this, "Moderated", 500, TENDRIL, false, true);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 0) {
            this.isModerating = false;
        };
    };

    multifarious = (id: string) => {
        if (id === "") return;
        if (this.reactiveBubble === undefined || this.isMultifaring === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMultifaring = false;
            return;
        };
        this.scene.combatManager.polymorph(id);
        this.enemySound("combat-round", true);
        this.scene.showCombatText(this, "Multifarious`d", 500, CAST, false, true);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMultifaring = false;
        };
    };

    mystify = (id: string) => {
        if (id === "") return;
        if (this.reactiveBubble === undefined || this.isMystifying === false) {
            if (this.reactiveBubble) {
                this.reactiveBubble.cleanUp();
                this.reactiveBubble = undefined;
            };
            this.isMystifying = false;
            return;
        };
        this.scene.combatManager.confuse(id);
        this.enemySound("death", true);
        this.scene.showCombatText(this, "Mystified", 500, EFFECT, false, true);
        this.reactiveBubble.setCharges(this.reactiveBubble.charges - 1);
        if (this.reactiveBubble.charges <= 3) {
            this.isMystifying = false;
        };
    };

    pursue = (id: string) => {
        const enemy = this.scene.getEnemy(id);
        if (!enemy) return;
        this.enemySound("wild", true);
        if (enemy.flipX) {
            this.setPosition(enemy.x + 16, enemy.y);
        } else {
            this.setPosition(enemy.x - 16, enemy.y);
        };
    };

    callForHelp = () => {
        const ctx = this.getCombatContext();
        // let help = false;
        if (ctx.allies) {
            for (let i = 0; i < ctx.allies.length; i++) {
                if (!ctx.allies[i]) continue;
                if (this.currentTarget) ctx.allies[i].callToArms(this.currentTarget);
                // help = true;
            };
        };
        // if (!help) {}; // Chirp
    };

    castAoE = () => {
        const aoes = PARTY_AOE[this.ascean.mastery];
        const aoe = aoes[Math.floor(Math.random() * aoes.length)].toLowerCase();
        // if (this.inCombat) this.scene.hud.logger.log(`${this.ascean.name}'s instinct leads them to ${aoe}.`);
        const positive = specialPositiveMachines.includes(aoe);
        // console.log(`%c AoE: ${aoe} | Positive: ${positive}`, "color: #fdf6d8");
        if (positive) {
            this.playerMachine.positiveMachine.setState(aoe);
            this.playerMachine.stateMachine.setState(States.CHASE);
        } else {
            this.playerMachine.stateMachine.setState(aoe);
        };
    };

    rangedBlast = () => {
        if ((this.inCombat === false && this.inComputerCombat === false) || this.health <= 0) return;
        if ((!this.currentTarget || !this.currentTarget.body) && this.health > 0) {
            this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
            return;
        };
        const mastery = this.ascean.mastery;
        const ranged = PARTY_RANGED[mastery];
        const blast = ranged[Math.floor(Math.random() * ranged.length)];
        const positive = specialPositiveMachines.includes(blast);
        // console.log(`%c AoE: ${blast} | Positive: ${positive}`, "color: #fdf6d8");
        if (positive) {
            this.playerMachine.positiveMachine.setState(blast);
            this.playerMachine.stateMachine.setState(States.CHASE);
        } else {
            this.playerMachine.stateMachine.setState(blast);
        };
    };

    randomHeal = () => this.playerMachine.stateMachine.setState(HEALS[Math.floor(Math.random() * HEALS.length)]);

    shield = () => {
        if (this.negationBubble === undefined || this.isShielding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isShielding = false;
            return;
        };
        this.enemySound("shield", true);
        this.scene.showCombatText(this, "Shielded", 500, EFFECT, false, true);
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        if (this.negationBubble.charges <= 0) {
            this.scene.showCombatText(this, "Shield Broken", 500, DAMAGE, false, true);
            this.isShielding = false;
        };
    };
    
    shimmer = () => {
        const shimmers = ["It fades through them", "They simply weren't there", "Perhaps they never were", "They don't seem certain of them at all"];
        const shim = shimmers[Math.floor(Math.random() * shimmers.length)];
        this.enemySound("stealth", true);
        this.scene.showCombatText(this, shim, 1500, EFFECT, false, true);
    };

    tether = (id: string) => {
        const enemy = this.scene.getEnemy(id);
        if (!enemy) return;
        this.enemySound("dungeon", true);
        this.hook(enemy, 1000);
    };

    ward = (id: string) => {
        if (this.negationBubble === undefined || this.isWarding === false) {
            if (this.negationBubble) {
                this.negationBubble.cleanUp();
                this.negationBubble = undefined;
            };
            this.isWarding = false;
            return;
        };
        this.enemySound("parry", true);
        this.scene.combatManager.stunned(id);
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        this.scene.showCombatText(this, "Warded", 500, EFFECT, false, true);
        if (this.negationBubble.charges <= 0) {
            this.scene.showCombatText(this, "Ward Broken", 500, DAMAGE, false, true);
            this.negationBubble.setCharges(0);
            this.isWarding = false;
        };
    };

    speedUpdate = (e: Ascean) => {
        this.speed = this.startingSpeed(e);
    };

    stealthUpdate = () => {
        if (this.isStealthing) {
            this.isStealthing = false;
        } else {
            this.playerMachine.positiveMachine.setState(States.STEALTH);
        };
    };

    disengage = () => {
        this.healthbar.setVisible(false);
        this.inComputerCombat = false;
        this.currentTarget = undefined;
        this.removeHighlight();
        this.enemies = [];
    };

    engage = (enemy: Enemy) => {
        if (enemy) {
            this.inComputerCombat = true;
            this.currentTarget = enemy;
            this.highlightTarget(enemy);
        };
    };

    clearEnemy = (enemy: Enemy) => {
        enemy.clearCombatWin();
        this.disengage();
    };

    findEnemy = () => {
        if (this.health <= 0) {
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
            } else if (!enemy.inComputerCombat) {
                (this.scene as Player_Scene).quickCombat();
            } else {
                this.checkComputerEnemyCombatEnter(enemy);
            };
        };
    };

    getEnemyId = () => this.currentTarget?.enemyID;
    isAttackTarget = (enemy: Enemy) => this.getEnemyId() === enemy.enemyID;
    isNewEnemy = (enemy: Enemy) => this.targets.every(obj => obj.enemyID !== enemy.enemyID);
    isValidEnemyCollision = (other: any): boolean =>  (other.gameObjectB && (other.bodyB.label === "enemyCollider" || other.bodyB.label === "body" || other.bodyB.label === "legs") && other.gameObjectB.ascean); // && other.gameObjectB.isAggressive
    isValidRushEnemy = (enemy: Enemy) => {
        if (!enemy?.enemyID) return;
        if (this.isRushing) {
            const newEnemy = this.rushedEnemies.every(obj => obj.enemyID !== enemy.enemyID);
            if (newEnemy) this.rushedEnemies.push(enemy);
        };
    };
    
    computerEngagement = (id: string) => {
        const enemy = this.scene.getEnemy(id);
        if (!enemy) return;
        if (this.isNewEnemy(enemy)) this.targets.push(enemy);
        this.inComputerCombat = true;
        this.targetID = id;
        this.currentTarget = enemy;
        this.highlightTarget(enemy);
        this.playerMachine.stateMachine.setState(States.CHASE);
    };

    quickTarget = (enemy: Enemy) => {
        this.targetID = enemy.enemyID;
        this.currentTarget = enemy;
        this.highlightTarget(enemy);
    };

    targetEngagement = (id: string) => {
        const enemy = this.scene.getEnemy(id);
        if (!enemy) return;
        if (this.isNewEnemy(enemy)) this.targets.push(enemy);
        this.inComputerCombat = true;
        this.targetID = id;
        this.currentTarget = enemy;
        this.highlightTarget(enemy);
    };

    invalidTarget = (id: string) => {
        const enemy = this.scene.getEnemy(id);
        if (enemy) return enemy.health === 0; // enemy.isDefeated;
        this.scene.showCombatText(this, `Combat Issue: NPC Targeted`, 1000, DAMAGE);
        return true;
    };

    outOfRange = (range: number) => {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget?.x as number, this.currentTarget?.y as number);
        if (distance > range) {
            this.scene.showCombatText(this, `Out of Range: -${Math.round(distance - range)}`, 1000, DAMAGE);
            return true;    
        };
        return false;
    };

    checkEvasion = (particle: Particle) => {
        const particleVector = new Phaser.Math.Vector2(particle.effect.x, particle.effect.y);
        const playerVector = new Phaser.Math.Vector2(this.x, this.y);
        const particleDistance = particleVector.subtract(playerVector);
        if (particleDistance.length() < 50 && !this.isPosted && !this.isCasting) { // 50 || 100
            return true;
        };
        return false;
    };
    
    killParticle = () => {
        this.scene.particleManager.removeEffect(this.particleEffect?.id as string);
        this.particleEffect = undefined;
    };

    isUnderRangedAttack = () => {
        const player = this.getEnemyParticle();
        if (!player) return false;
        return (this.currentTarget?.isRanged && this.checkEvasion(player) && !this.playerMachine.stateMachine.isCurrentState(States.EVADE));
    };

    clearAttacks = () => {
        const state = this.playerMachine.stateMachine.getCurrentState();
        return PARTY_ATTACK_STATES.includes(state as string);
        return(
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_ATTACK) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_PARRY) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_POSTURE) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_THRUST) &&
            !this.playerMachine.stateMachine.isCurrentState(States.DODGE) &&
            !this.playerMachine.stateMachine.isCurrentState(States.ROLL)
        );
    };

    dummyDirection = (): CacheDirection => {
        const x = this?.x || 0;
        const y = this?.y || 0;
        return {
            x,
            y,
            lengthSq: 0,
            ogLengthSq: 0,
            normal: false,
            normalize: () => {
                const len = 0;
                if (len > 0) {
                    this.cachedDirection.x = x / len,
                    this.cachedDirection.y = y / len,
                    this.cachedDirection.normal = true,
                    this.cachedDirection.lengthSq = 1 // normalized vector has length 1
                };
                return this.cachedDirection;
            }
        };
    };

    getCombatContext(): CombatContext {
        if (this.combatContext && (this.scene.frameCount - this.combatContextFrame) < 90) return this.combatContext;
        const direction = this.getCombatDirection();
        if (!direction) {
            this.combatContext = {
                direction: this.dummyDirection(),
                multiplier: 1,
                climbingModifier: 1,
                allies: [],
                isTargetRanged: false,
                lineOfSight: true,
                distanceY: 0,
            };
            return this.combatContext;
        };

        const distanceY = Math.abs(direction.y);
        const climbingModifier = this.isClimbing ? 0.65 : 1;
        const allies = this.getNearbyAllies();
        const multiplier = this.rangedDistanceMultiplier(DISTANCE.RANGED_MULTIPLIER);

        this.combatContext = {
            direction,
            multiplier,
            distanceY,
            climbingModifier,
            allies,
            isTargetRanged: this.currentTarget?.isRanged || false,
            lineOfSight: this.checkLineOfSight()
        };

        this.combatContextFrame = this.scene.frameCount;
        
        return this.combatContext;
    };

    getCombatDirection = () => {
        if (!this.currentTarget) return undefined;
        if (this.cachedDirection && (this.scene.frameCount - this.cachedDirectionFrame) < 60) return this.cachedDirection;
        const x = this.currentTarget.x - this.x;
        const y = this.currentTarget.y - this.y;
        const lengthSq = x * x + y * y;
        this.cachedDirection = {
            x,
            y,
            lengthSq, // Pre-calculate this once
            normal: false,
            ogLengthSq: lengthSq,
            normalize: () => {
                const len = Math.sqrt(this.cachedDirection.lengthSq);
                if (len > 0) {
                    this.cachedDirection.x = x / len,
                    this.cachedDirection.y = y / len,
                    this.cachedDirection.normal = true,
                    this.cachedDirection.lengthSq = 1 // normalized vector has length 1
                };
                return this.cachedDirection;
            }
        };
        this.cachedDirectionFrame = this.scene.frameCount;  
        return this.cachedDirection;
    };

    // getCombatDirection() {
    //     try {
    //         if (this.cachedDirection && this.cachedDirectionFrame && 
    //             (this.scene.frameCount - this.cachedDirectionFrame) < 60) {
    //             return this.cachedDirection;
    //         };
            
    //         const dx = ((this.currentTarget as Enemy)?.x - this.x) || 0;
    //         const dy = ((this.currentTarget as Enemy)?.y - this.y) || 0;
            
    //         this.cachedDirection = { 
    //             x: dx, 
    //             y: dy,
    //             normalized: false,
    //             length: () => Math.sqrt(dx * dx + dy * dy),
    //             lengthSq: () => dx * dx + dy * dy,
    //             normalize: () => {
    //                 const len = Math.sqrt(dx * dx + dy * dy);
    //                 if (len > 0) {
    //                     this.cachedDirection.x = dx / len;
    //                     this.cachedDirection.y = dy / len;
    //                 };
    //                 this.cachedDirection.normalized = true;
    //                 return this.cachedDirection;
    //             }
    //         };
    //         this.cachedDirectionFrame = this.scene.frameCount;
            
    //         return this.cachedDirection;
    //     } catch (e) {
    //         console.error("Combat direction error:", e);
    //         // this.cleanUpCombat();
    //         return undefined;
    //     };
    // };

    getNearbyAllies = () => {
        if (!this.currentTarget) return [];
        const allies = this.currentTarget.enemies;
        return allies;
    };

    swingCheck = () => {
        if (this.isSwinging) return;
        this.isSwinging = true;
        this.scene.time.delayedCall(this.swingTimer, () => {
            this.isSwinging = false;
            this.evaluateCombat();
        }, undefined, this);
    };

    swingTime = (): number => Math.max(0.2, 1 - (this.ascean.level - 1) * 0.1) * this.swingTimer;

    computerEnemyAttacker = () => {
        const enemy = this.scene.enemies.find((e: Enemy) => e.currentTarget?.enemyID === this.enemyID);
        return enemy;
    };

    shouldExitCombat = (): boolean => {
        if (!this.currentTarget || this.health <= 0) {
            this.inComputerCombat = false;
            return true;
        };

        if (this.inComputerCombat && this.currentTarget?.health <= 0) {
            this.clearComputerCombatWin(this.currentTarget.enemyID);
            this.inComputerCombat = false;
            return true;
        };

        return false;
    };

    cleanUpCombat() {
        if (this.inComputerCombat && this.currentTarget?.active && this.health > 0) {
            const enemy = this.computerEnemyAttacker();
            if (enemy?.active) {
                this.checkComputerEnemyCombatEnter(enemy);
                return;
            };
        };
        if (this.inComputerCombat) { // Making a pass through
            this.clearComputerCombatWin("NULL");
            return; // Trying this out?
        };
        if (!this.isValidTarget(this.currentTarget) && this.health > 0 && !this.playerMachine.stateMachine.isCurrentState(States.FOLLOW)) {
            this.playerMachine.stateMachine.setState(States.FOLLOW);
        };
        this.inCombat = false;
        this.inComputerCombat = false;
        this.currentAction = "";
        this.enemies = [];
    };

    isValidTarget(target: Enemy | undefined) {
        return target && target.active && target.body?.position && target.health > 0; // && !target.isDeleting && !target.isDefeated; // && this.scene?.children.exists(target);
    };

    canEvaluateCombat = () => {
        return !this.isCasting && !this.isSuffering() && !this.isHurt && !this.isContemplating && !this.isDeleting && !this.isDefeated; // && this.currentTarget?.body?.position && this.scene?.children.exists(this.currentTarget)
    };

    evaluateCombatDistance = () => {
        if (!this.canEvaluateCombat()) return;
        if (!this.isValidTarget(this.currentTarget)) {
            this.cleanUpCombat();
            return;
        };

        const ctx = this.getCombatContext();
        const mind = this.mindState;

        if (this.isRanged || (mind.keepDistance && this.ascean.level > 3)) {
            this.handleRangedCombat(ctx, mind);
        } else {
            this.handleMeleeCombat(ctx, mind);
        };
        
        this.handleAbilitiesAndCustomLogic(ctx, mind);
        this.swingCheck();
    };

    handleAbilitiesAndCustomLogic = (ctx: CombatContext, mind: MindState) => {
        if (this.ascean.level < 4) return;
        if (this.shouldCallForHelp(ctx, mind)) this.useHelpCall();
        if (this.shouldSummon(mind)) this.castSummon();
        if (mind.customEvaluate) mind.customEvaluate(this, ctx);
        if (mind.dynamicSwap) mind.dynamicSwap(this, ctx);
    };

    handleMeleeCombat = (ctx: CombatContext, mind: MindState) => {
        const attackThresholdSq = DISTANCE.ATTACK ** 2;
        const distanceSq = ctx.direction?.ogLengthSq || 0;
        const chaseThresholdSq = mind.chaseThresholdSq;
        
        if (distanceSq >= chaseThresholdSq) {
            this.playerMachine.stateMachine.setState(States.CHASE);
            return;
        };
        
        // if (!this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_COMBAT)) this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
        if (distanceSq > attackThresholdSq) {
            this.moveCloser(ctx);
            this.isPosted = false;
        } else {
            this.setVelocity(0);
            this.isPosted = true;
            if (!this.currentAction) this.anims.play(FRAMES.IDLE, true);
        };
    };

    handleRangedCombat = (ctx: CombatContext, mind: MindState) => {
        const distance = ctx.direction?.ogLengthSq || 0;
        const threshold = mind.minDistanceSq * ctx.multiplier;
        const thresholdMin = mind.minDistanceSq;
        const chaseThreshold = mind.chaseThresholdSq * ctx.multiplier;
        
        if (distance >= chaseThreshold) {
            this.playerMachine.stateMachine.setState(States.CHASE);
            return;
        }; 
        
        // if (!this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_COMBAT) && this.isRanged) this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
        
        if (distance > threshold) { // Move towards target
            this.moveCloser(ctx);
        } else if (distance < thresholdMin && !ctx.isTargetRanged) { // Keep distance from melee target
            this.moveAway(ctx);
            if (Phaser.Math.Between(1, 250) === 1 && !this.playerMachine.stateMachine.isCurrentState(States.EVADE)) this.playerMachine.stateMachine.setState(States.EVADE);
        } else if (ctx.lineOfSight && !this.playerMachine.stateMachine.isCurrentState(States.EVADE)) {
            this.playerMachine.stateMachine.setState(States.EVADE);
        } else if (ctx.distanceY < 15) { // Sweet spot for ranged enemies
            this.setVelocity(0);
            this.anims.play(FRAMES.IDLE, true);
        } else { // Adjust Y Position
            if (!ctx.direction.normal) ctx.direction.normalize();
            this.setVelocityY(ctx.direction.y * this.speed * ctx.climbingModifier);
            this.partyAnimation();
        };
    };

    moveAway = (ctx: CombatContext) => {
        this.partyAnimation();
        if (!ctx.direction.normal) ctx.direction.normalize();
        this.setVelocityX(ctx.direction.x * -this.speed * ctx.climbingModifier);
        this.setVelocityY(ctx.direction.y * -this.speed * ctx.climbingModifier);    
    };

    moveCloser = (ctx: CombatContext) => {
        this.partyAnimation();
        if (!ctx.direction.normal) ctx.direction.normalize();
        this.setVelocityX(ctx.direction.x * this.speed * ctx.climbingModifier);
        this.setVelocityY(ctx.direction.y * this.speed * ctx.climbingModifier);
    };

    partyAnimation = () => {
        if (this.isClimbing) {
            if (this.velMoving()) {
                this.anims.play(FRAMES.CLIMB, true);
            } else {
                this.anims.play(FRAMES.CLIMB, true);
                this.anims.pause();
            };
        } else if (this.inWater) {
            if (this.velocity?.y as number > 0) {
                this.anims.play(FRAMES.SWIM_DOWN, true);
            } else {
                this.anims.play(FRAMES.SWIM_UP, true);
            };
        } else {
            if (this.velMoving()) {
                this.anims.play(FRAMES.RUNNING, true);
            } else {
                this.anims.play(FRAMES.IDLE, true);
            };
        };
    };

    useHelpCall = () => {
        ++this.summons;
        this.scene.showCombatText(this, `${this.ascean.name} is calling for help!`, DURATION.TEXT, BONE, false, true);
        this.playerMachine.stateMachine.setState(States.HELP);
    };

    shouldCallForHelp = (ctx: CombatContext, mind: MindState) => {
        return this.summons <= 3 && ctx.allies.length > 1 && mind.callHelp && (this.health / this.ascean.health.max < 0.35) && !this.playerMachine.stateMachine.isCurrentState(States.HELP) && this.scene.scene.key === "Game";
    };

    castSummon = () => {
        ++this.summons;
        this.scene.showCombatText(this, `${this.ascean.name} is summoning help!`, DURATION.TEXT, BONE, false, true);
        this.playerMachine.stateMachine.setState(States.SUMMON);
    };

    shouldSummon = (mind: MindState) => {
        return mind.summon && this.summons === 0 && (this.health / this.ascean.health.max < 0.5) && !this.playerMachine.stateMachine.isCurrentState(States.SUMMON) && this.scene.scene.key === "Game";
    };
    
    evaluateCombat = () => {
        if (this.isCasting || this.isPraying || this.isSuffering() || this.health <= 0) return;
        let actionNumber = Math.floor(Math.random() * 101);
        let action = "";
        const loadout = this.scene.hud.settings.computerLoadout || { attack: 30, parry: 10, roll: 10, thrust: 15, posture: 15 };
        if (actionNumber > 100 - loadout.attack) { // 71-100 (30%)
            action = States.COMPUTER_ATTACK;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry) { // 26-40 (15%) || 25 && !this.isRanged
            action = States.COMPUTER_PARRY;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry - loadout.roll) { // 41-55 (15%) || 40 && !this.isRanged
            action = States.ROLL;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry - loadout.roll - loadout.thrust) { // 11-20 (10%) || 11-40 (this.isRanged) (30%)
            action = States.COMPUTER_THRUST;
        } else if (actionNumber > 100 - loadout.attack - loadout.parry - loadout.roll - loadout.thrust - loadout.posture) { // 56-70 (15%)
            action = States.COMPUTER_POSTURE;
        } else { // New State 1-10 (10%)
            action = States.CONTEMPLATE;
        };
        if (this.playerMachine.stateMachine.isState(action)) {
            this.playerMachine.stateMachine.setState(action);
        };
    };

    handleAnimations = () => {
        if (this.isDodging) {
            this.anims.play(FRAMES.DODGE, true);
            this.spriteWeapon.setVisible(false);
            if (this.dodgeCooldown === 0) this.dodge();
        };
        if (this.isRolling) {
            this.anims.play(FRAMES.ROLL, true);
            this.spriteWeapon.setVisible(false);
            if (this.rollCooldown === 0) this.roll();
        }; 
    };

    dodge = () => {
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

    roll = () => {
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

    handleComputerConcerns = () => {
        this.syncPositions();
        this.getDirection();
        if (this.scene.combat === true && (!this.currentTarget || !this.inComputerCombat)) this.findEnemy();
        this.particleCheck();
    };

    handleStealth = () => {
        this.scene.combatManager.paralyze(this.attackedTarget.enemyID);
        this.scene.combatEngaged(true);
        this.inComputerCombat = true;
        this.attackedTarget.jumpIntoCombat();
        this.stealthUpdate();
    };

    weaponActionSuccess = () => {
        if (!this.attackedTarget) return;
        let action = "";
        if (this.particleEffect) {
            action = this.particleEffect.action;
            this.killParticle();
            if (action === "hook") {
                this.hook(this.attackedTarget, 1500);
                return;
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
                    if (this.attackedTarget.isWarding === true) this.attackedTarget.ward(this.enemyID);
                    return;
                };
                if (this.attackedTarget.isMenacing === true) this.attackedTarget.menace(this.enemyID);
                if (this.attackedTarget.isModerating === true) this.attackedTarget.moderate(this.enemyID);  
                if (this.attackedTarget.isMultifaring === true) this.attackedTarget.multifarious(this.enemyID); 
                if (this.attackedTarget.isMystifying === true) this.attackedTarget.mystify(this.enemyID);
                if (this.attackedTarget.isShadowing === true) this.attackedTarget.pursue(this.enemyID);
                if (this.attackedTarget.isTethering === true) this.attackedTarget.tether(this.enemyID);
            };
            this.scene.combatManager.partyAction({ action, origin: this.enemyID, enemyID: this.attackedTarget.enemyID });
        } else {
            if (!this.isAstrifying) {
                if (this.attackedTarget.isShimmering && Phaser.Math.Between(1, 100) > 50) {
                    this.attackedTarget.shimmer();
                    return;
                };
                if (this.attackedTarget.isAbsorbing || this.attackedTarget.isEnveloping || this.attackedTarget.isProtecting || this.attackedTarget.isShielding || this.attackedTarget.isWarding) {
                    if (this.attackedTarget.isAbsorbing === true) this.attackedTarget.absorb();
                    if (this.attackedTarget.isEnveloping === true) this.attackedTarget.envelop();
                    if (this.attackedTarget.isShielding === true) this.attackedTarget.shield();
                    if (this.attackedTarget.isWarding === true) this.attackedTarget.ward(this.enemyID);
                    return;    
                };
                if (this.attackedTarget.isMenacing === true) this.attackedTarget.menace(this.enemyID);
                if (this.attackedTarget.isModerating === true) this.attackedTarget.moderate(this.enemyID);
                if (this.attackedTarget.isMultifaring === true) this.attackedTarget.multifarious(this.enemyID);
                if (this.attackedTarget.isMystifying === true) this.attackedTarget.mystify(this.enemyID);
                if (this.attackedTarget.isShadowing === true) this.attackedTarget.pursue(this.enemyID);
                if (this.attackedTarget.isTethering === true) this.attackedTarget.tether(this.enemyID);
            };
            action = this.currentAction;
            this.scene.combatManager.partyAction({ action: this.currentAction, origin: this.enemyID, enemyID: this.attackedTarget.enemyID } );
        };
        if (this.isStealthing) {
            this.handleStealth();
        } else {
            this.applyKnockback(this.attackedTarget, SWING_FORCE[this.weapons[0]?.grip] * this.ascean[SWING_FORCE_ATTRIBUTE[this.weapons[0]?.attackType]] * SWING_FORCE[action]);
        };
    };

    update(dt: number) {
        this.handleComputerConcerns();
        this.playerMachine.stateMachine.update(dt);
        this.playerMachine.positiveMachine.update(dt);
        this.playerMachine.negativeMachine.update(dt);
        this.updatePositionHistory();
        // if (this.scene.frameCount % 60 === 0) console.log({ state: this.playerMachine.stateMachine.getCurrentState() });
    };
};