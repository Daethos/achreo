import Ascean from "../../models/ascean";
import Equipment from "../../models/equipment";
import { ComputerCombat, initComputerCombat } from "../../stores/computer";
import { Compiler } from "../../utility/ascean";
import { ENEMY_ATTACKS } from "../../utility/combatTypes";
import { BROADCAST_DEATH, DISTANCE } from "../../utility/enemy";
import { PARTY_SPECIAL } from "../../utility/party";
import { ENEMY_ENEMIES, PLAYER } from "../../utility/player";
import { EventBus } from "../EventBus";
import { Play } from "../main";
import Beam from "../matter/Beam";
import { Particle } from "../matter/ParticleManager";
import CastingBar from "../phaser/CastingBar";
import { ENTITY_FLAGS } from "../phaser/Collision";
import HealthBar from "../phaser/HealthBar";
import PartyMachine from "../phaser/PartyMachine";
import { vibrate } from "../phaser/ScreenShake";
import { CAST, DAMAGE, EFFECT, HEAL, HUSH, TENDRIL } from "../phaser/ScrollingCombatText";
import { States } from "../phaser/StateMachine";
import { Arena } from "../scenes/Arena";
import { Underground } from "../scenes/Underground";
import Enemy from "./Enemy";
import Entity, { assetSprite, calculateThreat, ENEMY, FRAMES, Player_Scene, SWING_FORCE, SWING_FORCE_ATTRIBUTE, SWING_TIME } from "./Entity";
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

export const COLOR = 0x00FF00;
const TARGET_COLOR = 0xFFC700;
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
        this.setTint(COLOR);
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
        this.isMoving = false;
        this.currentShieldSprite = assetSprite(this.ascean?.shield);
        this.spriteShield = this.createSprite(this.currentShieldSprite, 0, 0, PLAYER.SCALE.SHIELD, ORIGIN.SHIELD.X, ORIGIN.SHIELD.Y);
        this.spriteShield.setVisible(false);
        this.playerVelocity = new Phaser.Math.Vector2();
        this.speed = this.startingSpeed(ascean);
        this.potentialEnemies = ENEMY_ENEMIES[this.ascean.name as keyof typeof ENEMY_ENEMIES] || [];
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
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health, "party");
        this.castbar = new CastingBar(this.scene, this.x, this.y, 0, this);
        this.rushedEnemies = [];
        this.playerStateListener();
        this.setFixedRotation();   
        this.checkEnemyCollision(partySensor);
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on("pointerdown", () => {
                this.scene.hud.logger.log(`Console: ${this.ascean.name}"s current State: ${this.playerMachine.stateMachine.getCurrentState()?.charAt(0).toUpperCase()}${this.playerMachine.stateMachine.getCurrentState()?.slice(1)}`)
                if (this.currentTarget) {
                    this.scene.hud.logger.log(`Console: ${this.ascean.name} is currently attacking ${this.currentTarget.ascean.name}`);
                };
                if (this.scene.player.isComputer) return;
                this.clearTint();
                this.setTint(TARGET_COLOR);
                this.ping();
                vibrate();
                if (this.enemyID !== this.scene.state.enemyID) this.scene.hud.setupEnemy(this);
                this.scene.player.setCurrentTarget(this);
            })
            .on("pointerout", () => {
                this.clearTint();
                this.setTint(COLOR);
            });
        this.scene.time.delayedCall(1000, () => {
            this.setVisible(true);
            this.spriteWeapon.setVisible(true);
            this.originPoint = new Phaser.Math.Vector2(this.x, this.y);
        });
        this.beam = new Beam(this);
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {}; // For Leashing
        this.checkSpecials(ascean);
        scene.time.delayedCall(3000, () => {
            if (this.scene.state.caerenic.active) this.caerenicUpdate();
            if (this.scene.state.stalwart.active) this.stalwartUpdate(this.scene.state.stalwart.active);
        }, undefined, this);
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

    // computerBroadcast = (e: { id: string; key: string; value: number; }) => {
    //     if (this.computerCombatSheet.enemyID !== e.id) return;
    //     (this.computerCombatSheet as any)[e.key] = e.value;
    // };

    cleanUp() {
        EventBus.off(BROADCAST_DEATH, this.clearComputerCombatWin);
        EventBus.off("engage", this.engage);
        EventBus.off("speed", this.speedUpdate);
        EventBus.off("update-stealth", this.stealthUpdate);
        EventBus.off("update-caerenic", this.caerenicUpdate);
        EventBus.off("update-stalwart", this.stalwartUpdate);
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
        EventBus.on("update-caerenic", this.caerenicUpdate);
        EventBus.on("update-stalwart", this.stalwartUpdate);
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

    callToArms = (enemy: Enemy) => {
        this.checkComputerEnemyCombatEnter(enemy);
        for (let i = 0; i < this.scene.party.length; i++) {
            const p = this.scene.party[i];
            if (!p.inComputerCombat) {
                p.checkComputerEnemyCombatEnter(enemy);
            };
        };
    };

    checkComputerEnemyCombatEnter = (enemy: Enemy) => {
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
        this.specialCombatText = this.scene.showCombatText("!", 1000, EFFECT, true, true, () => this.specialCombatText = undefined);
        this.scene.hud.logger.log(`Console: ${this.ascean.name} is being called to arms against ${enemy.ascean.name}!`);
        const distance = this.currentTarget.position.subtract(this.position).length();
        const state = distance > 100 ? States.CHASE : States.COMPUTER_COMBAT;
        this.playerMachine.stateMachine.setState(state);
        if (!enemy.inComputerCombat) {
            enemy.checkComputerEnemyCombatEnter(this);
        };
    };

    isNewComputerEnemy = (enemy: Enemy) => {
        const newEnemy = this.enemies.every(obj => obj.id !== enemy.enemyID);
        return newEnemy;
    };

    playerInCombat = (enemy: Enemy) => enemy && enemy.name === "enemy" && this.scene.combat;

    checkEnemyCollision(partySensor: any) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [partySensor],
            callback: (other: any) => {
                if (this.isDeleting) return;
                if (other.gameObjectB?.isDeleting) return;
                this.isValidRushEnemy(other.gameObjectB);
                if (other.gameObjectB?.name === "enemy") this.touching.push(other.gameObjectB);
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
                if (this.isDeleting) return;
                if (other.gameObjectB?.name === "enemy") this.touching = this.touching.filter((target) => target !== other.gameObjectB);
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
        this.specialCombatText = this.scene.showCombatText(`New Target: ${target.ascean.name}`, 1500, EFFECT, false, true, () => this.specialCombatText = undefined);
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

    computerCombatUpdate = (e: ComputerCombat) => {
        // if (this.enemyID !== e.personalID) return;
        const { enemyID, newComputerHealth } = e;
        if (this.health > newComputerHealth) {
            let damage: number | string = Math.round(this.health - newComputerHealth);
            // damage = e.computerEnemyCriticalSuccess ? `${damage} (Critical)` : e.computerEnemyGlancingBlow ? `${damage} (Glancing)` : damage;
            this.scrollingCombatText = this.scene.showCombatText(`${damage}`, 1500, EFFECT, e.computerEnemyCriticalSuccess, false, () => this.scrollingCombatText = undefined);
            if (!this.isSuffering() && !this.isTrying() && !this.isCasting && !this.isContemplating) this.isHurt = true;
            if (this.isFeared) {
                const chance = Math.random() < 0.1 + this.fearCount;
                if (chance) {
                    this.specialCombatText = this.scene.showCombatText("Fear Broken", PLAYER.DURATIONS.TEXT, EFFECT, false, false, () => this.specialCombatText = undefined);
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
                if (enemy) {
                    this.checkComputerEnemyCombatEnter(enemy);
                };
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
            this.scrollingCombatText = this.scene.showCombatText(`+${heal}`, 1500, HEAL, false, false, () => this.scrollingCombatText = undefined);
        }; 
        this.health = newComputerHealth;
        this.computerCombatSheet.newComputerHealth = this.health;
        if (this.healthbar.getTotal() < e.computerHealth) this.healthbar.setTotal(e.computerHealth);
        this.updateHealthBar(newComputerHealth);
        this.weapons = e.computerWeapons;
        this.currentRound = e.combatRound;
        this.computerCombatSheet.criticalSuccess = false;
        this.computerCombatSheet.glancingBlow = false;
        this.computerCombatSheet.computerWin = e.computerWin;
        if (e.newComputerEnemyHealth <= 0 && this.computerCombatSheet.computerWin) {
            this.computerCombatSheet.computerWin = false;
            this.clearComputerCombatWin(enemyID);
        };
        this.checkGear(e.computer?.shield as Equipment, e.computerWeapons?.[0] as Equipment, e.computerDamageType.toLowerCase());
        this.scene.combatManager.checkPlayerFocus(this.enemyID, this.health);
        if (e?.realizedComputerDamage > 0) {
            EventBus.emit("party-combat-text", { text: `${this.ascean.name} ${ENEMY_ATTACKS[e.computerAction as keyof typeof ENEMY_ATTACKS]} ${e.computerEnemy?.name} with their ${e.computerWeapons[0]?.name} for ${Math.round(e?.realizedComputerDamage as number)} ${e.computerDamageType} damage.` });
        };
    };
    

    checkGear = (shield: Equipment, weapon: Equipment, damage: string) => {
        if (!shield || !weapon) return;
        this.currentDamageType = damage;    
        this.hasMagic = this.checkDamageType(damage, "magic");
        this.checkMeleeOrRanged(weapon);
        if (this.currentWeaponSprite !== assetSprite(weapon)) {
            this.currentWeaponSprite = assetSprite(weapon);
            this.spriteWeapon.setTexture(this.currentWeaponSprite);
            if (weapon.grip === "One Hand") {
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_ONE);
            } else {
                this.spriteWeapon.setScale(PLAYER.SCALE.WEAPON_TWO);
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
        if (this.inComputerCombat) {
            this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
        } else {
            this.playerMachine.stateMachine.setState(States.IDLE);
        };
    };

    caerenicUpdate = () => {
        this.isCaerenic = this.isCaerenic ? false : true;
        if (this.isCaerenic) {
            this.setGlow(this, true);
            this.setGlow(this.spriteWeapon, true, "weapon");
            this.setGlow(this.spriteShield, true, "shield"); 
            this.adjustSpeed(PLAYER.SPEED.CAERENIC);
        } else {
            this.setGlow(this, false);
            this.setGlow(this.spriteWeapon, false, "weapon")
            this.setGlow(this.spriteShield, false, "shield"); 
            this.adjustSpeed(-PLAYER.SPEED.CAERENIC);
        };
    };

    stalwartUpdate = (stalwart: boolean) => {
        this.isStalwart = stalwart;
        this.spriteShield.setVisible(this.isStalwart);
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
        this.combatSpecials = PARTY_SPECIAL[ascean.mastery as keyof typeof PARTY_SPECIAL];
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
        this.resistCombatText = this.scene.showCombatText("Resisted", PLAYER.DURATIONS.TEXT, EFFECT, false, false, () => this.resistCombatText = undefined);
    };

    startCasting = (name: string, duration: number, style: string, channel = false) => {
        this.castbar.reset();
        this.castbar.setVisible(true); // Added
        this.castbar.setup(this.x, this.y, name);
        this.isCasting = true;
        this.specialCombatText = this.scene.showCombatText(name, duration / 2, style, false, true, () => this.specialCombatText = undefined);
        this.castbar.setTotal(duration);
        if (name !== "Healing" && name !== "Reconstituting") this.beam.enemyEmitter(this.currentTarget, duration, this.ascean.mastery); // scene.player
        if (channel === true) this.castbar.setTime(duration);
        if (this.isCaerenic === false && this.isGlowing === false) this.checkCaerenic(true);
        this.setVelocity(0);
    };

    stopCasting = () => {
        this.isCasting = false;
        this.castingSuccess = false;
        this.castbar.reset();
        this.beam.reset();
        this.spellTarget = "";
        this.spellName = "";
        this.frameCount = 0;
        if (this.isCaerenic === false && this.isGlowing === true) this.checkCaerenic(false);
    };

    leap = () => {
        this.frameCount = 0;
        this.isLeaping = true;
        const target = this.currentTarget ? this.currentTarget.position : this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        const distance = direction.length();
        direction.normalize();
        this.flipX = direction.x < 0;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * Math.min(distance, 200)),
            y: this.y + (direction.y * Math.min(distance, 200)),
            duration: 900,
            ease: Phaser.Math.Easing.Back.InOut,
            onStart: () => {
                this.isAttacking = true;
                this.enemySound("leap", true);
                this.flickerCaerenic(900); 
            },
            onComplete: () => { 
                this.isLeaping = false; 
                if (this.touching.length > 0) {
                    for (let i = 0; i < this.touching.length; ++i) {
                        this.scene.combatManager.partyAction({enemyID: this.touching[i].enemyID, action: "leap", origin: this.enemyID});
                    };
                };
            },
        });       
        EventBus.emit("party-combat-text", {
            playerSpecialDescription: `You launch yourself through the air!`
        });
    };

    rush = () => {
        this.frameCount = 0;
        this.isRushing = true;
        this.isThrusting = true;
        this.enemySound("stealth", true);
        const target = this.currentTarget ? this.currentTarget.position : this.scene.getWorldPointer();
        const direction = target.subtract(this.position);
        direction.normalize();
        this.flipX = direction.x < 0;
        this.scene.tweens.add({
            targets: this,
            x: this.x + (direction.x * 300),
            y: this.y + (direction.y * 300),
            duration: 600,
            ease: "Circ.easeOut",
            onStart: () => {
                this.flickerCaerenic(600);  
            },
            onComplete: () => {
                if (this.rushedEnemies.length > 0) {
                    for (let i = 0; i < this.rushedEnemies.length; ++i) {
                        const enemy = this.rushedEnemies[i];
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
                } else if (this.touching.length > 0) {
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
                        this.scene.combatManager.partyAction({enemyID: enemy.enemyID, action: "rush", origin: this.enemyID});
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
        this.specialCombatText = this.scene.showCombatText("Storming", 800, DAMAGE, false, false, () => this.specialCombatText = undefined); 
        this.isAttacking = true;
        this.adjustSpeed(0.5);
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
                this.specialCombatText = this.scene.showCombatText("Storming", 800, DAMAGE, false, false, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Absorbed", 500, EFFECT, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Enveloped", 500, EFFECT, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Maliced", 750, HUSH, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Menaced", 500, TENDRIL, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Mended", 500, TENDRIL, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Moderated", 500, TENDRIL, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Multifarious`d", 500, CAST, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Mystified", 500, EFFECT, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Shielded", 500, EFFECT, false, true, () => this.specialCombatText = undefined);
        this.negationBubble.setCharges(this.negationBubble.charges - 1);
        if (this.negationBubble.charges <= 0) {
            this.specialCombatText = this.scene.showCombatText("Shield Broken", 500, DAMAGE, false, true, () => this.specialCombatText = undefined);
            this.isShielding = false;
        };
    };
    
    shimmer = () => {
        const shimmers = ["It fades through them", "They simply weren't there", "Perhaps they never were", "They don't seem certain of them at all"];
        const shim = shimmers[Math.floor(Math.random() * shimmers.length)];
        this.enemySound("stealth", true);
        this.specialCombatText = this.scene.showCombatText(shim, 1500, EFFECT, false, true, () => this.specialCombatText = undefined);
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
        this.specialCombatText = this.scene.showCombatText("Warded", 500, EFFECT, false, true, () => this.specialCombatText = undefined);
        if (this.negationBubble.charges <= 0) {
            this.specialCombatText = this.scene.showCombatText("Ward Broken", 500, DAMAGE, false, true, () => this.specialCombatText = undefined);
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
        this.resistCombatText = this.scene.showCombatText(`Combat Issue: NPC Targeted`, 1000, DAMAGE, false, false, () => this.resistCombatText = undefined);
        return true;
    };

    outOfRange = (range: number) => {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget?.x as number, this.currentTarget?.y as number);
        if (distance > range) {
            this.resistCombatText = this.scene.showCombatText(`Out of Range: -${Math.round(distance - range)}`, 1000, DAMAGE, false, false, () => this.resistCombatText = undefined);
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
    
    currentParticleCheck = () => {
        if (!this.particleEffect?.triggered) this.scene.particleManager.updateParticle(this.particleEffect as Particle);
        if (this.particleEffect?.success) {
            this.particleEffect.triggered = true;
            this.particleEffect.success = false;
            this.partyActionSuccess();
        } else if (this.particleEffect?.collided) {
            this.scene.particleManager.removeEffect(this.particleEffect?.id as string);
            this.particleEffect = undefined;              
        };
    };

    getEnemyParticle = () => {
        return this.currentTarget?.particleEffect
            ? this.scene.particleManager.getEffect(this.currentTarget?.particleEffect.id)
            : undefined;
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

    checkLineOfSight() {
        if (this.scene.scene.key === "Game") return false;
        const line = new Phaser.Geom.Line(this.currentTarget?.x, this.currentTarget?.y, this.x, this.y);
        const points = line.getPoints(30);  // Adjust number of points based on precision
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const layer = (this.scene as Arena | Underground).groundLayer;
            const tile = this.scene.map.getTileAtWorldXY(point.x, point.y, false, this.scene.cameras.main, layer);
            if (tile && (tile.properties.collides || tile.properties.wall)) {
                return true;  // Wall is detected
            };
        };
        return false;  // Clear line of sight
    };

    clearAttacks = () => {
        return(
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_ATTACK) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_PARRY) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_POSTURE) &&
            !this.playerMachine.stateMachine.isCurrentState(States.COMPUTER_THRUST) &&
            !this.playerMachine.stateMachine.isCurrentState(States.DODGE) &&
            !this.playerMachine.stateMachine.isCurrentState(States.ROLL)
        );
    };

    getCombatDirection() {
        try {
            // Use cached distance if available and recent
            if (this.cachedDirection && this.cachedDirectionFrame && 
                (this.scene.frameCount - this.cachedDirectionFrame) < 60) {
                return this.cachedDirection;
            };
            
            // Calculate direction manually (no clone needed)
            const dx = (this.currentTarget as Enemy).x - this.x;
            const dy = (this.currentTarget as Enemy).y - this.y;
            
            // Cache the direction vector
            this.cachedDirection = { 
                x: dx, 
                y: dy,
                normalized: false,
                length: () => Math.sqrt(dx * dx + dy * dy),
                lengthSq: () => dx * dx + dy * dy,
                normalize: () => {
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len > 0) {
                        this.cachedDirection.x = dx / len;
                        this.cachedDirection.y = dy / len;
                    };
                    this.cachedDirection.normalized = true;
                    return this.cachedDirection;
                }
            };
            this.cachedDirectionFrame = this.scene.frameCount;
            
            return this.cachedDirection;
        } catch (e) {
            console.error("Combat direction error:", e);
            // this.cleanUpCombat();
            return undefined;
        };
    };

    evaluateCombatDistance = () => {
        this.getDirection();
        if (this.currentTarget) this.highlightTarget(this.currentTarget);
        const state = this.playerMachine.stateMachine.getCurrentState();
        if (this.health <= 0 && state !== States.DEFEATED) { // this.isDefeated ||
            this.playerMachine.stateMachine.setState(States.DEFEATED);
            return;
        };
        if (state === States.DEFEATED) return;
        if (!this.inComputerCombat) {
            if (state !== States.DEFEATED && state !== States.IDLE && state !== States.FOLLOW) {
                this.playerMachine.stateMachine.setState(States.FOLLOW);
            };
            return;
        };
        if (this.isCasting || this.isPraying || this.isContemplating) {
            this.isMoving = false;
            this.setVelocity(0);
            return;    
        };
        if (this.isSuffering() || !this.currentTarget || !this.currentTarget.body || state === States.CHASE || state === States.EVADE) return;
        
        const direction = this.getCombatDirection();
        if (!direction) return;

        const distanceY = Math.abs(direction.y);
        const multiplier = this.rangedDistanceMultiplier(PLAYER.DISTANCE.RANGED_MULTIPLIER);
        const climbingModifier = this.isClimbing ? 0.65 : 1;
        
        const distanceSq = direction.lengthSq();
        const chaseThresholdSq = (DISTANCE.CHASE * multiplier) ** 2;
        
        if (this.isUnderRangedAttack()) { //  && this.evasionTimer === 0 // Switch to EVADE the Enemy
            // this.evasionTimer = 1000;
            this.playerMachine.stateMachine.setState(States.EVADE);
            return;
        } else if (distanceSq >= chaseThresholdSq) { // Switch to CHASE the Enemy
            this.playerMachine.stateMachine.setState(States.CHASE);
            return;
        } else if (this.isRanged) { // RANGED ENEMY LOGIC
            this.playerMachine.stateMachine.setState(States.COMBAT);
            
            if (distanceY > DISTANCE.RANGED_ALIGNMENT) {
                direction.normalize();
                this.setVelocityY(direction.y * this.speed * climbingModifier + 0.5);
            };
            
            const thresholdSq = (DISTANCE.THRESHOLD * multiplier) ** 2;
            const thresholdMinSq = DISTANCE.THRESHOLD ** 2;
            
            if (distanceSq > thresholdSq) { // Move towards target
                direction.normalize();
                this.setVelocityX(direction.x * this.speed * climbingModifier);
                this.setVelocityY(direction.y * this.speed * climbingModifier);
            } else if (distanceSq < thresholdMinSq && !this.currentTarget.isRanged) { // Keep distance from melee target
                if (Phaser.Math.Between(1, 250) === 1 && state !== States.EVADE) { //  && this.evasionTimer === 0
                    // this.evasionTimer = 1000;
                    this.playerMachine.stateMachine.setState(States.EVADE);
                    return;
                };
                
                direction.normalize();
                this.setVelocityX(direction.x * -this.speed * climbingModifier);
                this.setVelocityY(direction.y * -this.speed * climbingModifier);
            } else if (this.checkLineOfSight() && state !== States.EVADE) { //  && this.evasionTimer === 0
                // this.evasionTimer = 1000;
                this.playerMachine.stateMachine.setState(States.EVADE);
                return;
            } else if (distanceY < 15) { // Sweet spot for ranged enemies
                this.setVelocity(0);
                if (this.clearAttacks()) this.anims.play(FRAMES.IDLE, true);
            } else { // Adjust Y position
                direction.normalize();
                this.setVelocityY(direction.y * this.speed * climbingModifier);
            };
        } else { // MELEE ENEMY LOGIC
            if (state !== States.COMPUTER_COMBAT) {
                this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
                return;
            };
            const attackThresholdSq = DISTANCE.ATTACK ** 2;
            
            if (distanceSq > attackThresholdSq) {
                direction.normalize();
                this.setVelocityX(direction.x * this.speed * climbingModifier);
                this.setVelocityY(direction.y * this.speed * climbingModifier);
                this.isPosted = false;
            } else { // Inside melee range
                this.setVelocity(0);
                this.isPosted = true;
                if (this.clearAttacks()) this.anims.play(FRAMES.IDLE, true);
            };
        };


        // if (this.isUnderRangedAttack()) { //  && this.evasionTimer === 0 // Switch to EVADE the Enemy
        //     // this.evasionTimer = 1000;
        //     this.playerMachine.stateMachine.setState(States.EVADE);
        //     return;
        // } else if (direction.length() >= PLAYER.DISTANCE.CHASE * multiplier) { // Switch to CHASE the Enemy
        //     this.playerMachine.stateMachine.setState(States.CHASE);
        //     return;
        // } else if (this.isRanged) { // Contiually Checking Distance for RANGED ENEMIES.
        //     if (state !== States.COMPUTER_COMBAT) { // !this.computerAction && 
        //         this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
        //         return;    
        //     };
        //     if (distanceY > PLAYER.DISTANCE.RANGED_ALIGNMENT) {
        //         direction.normalize();
        //         this.setVelocityY(direction.y * this.speed * climbingModifier + 0.5);
        //     };
        //     // if (distanceY > PLAYER.DISTANCE.RANGED_ALIGNMENT) {
        //     //     direction.normalize();
        //     //     this.setVelocityY(direction.y * (this.speed + 0.5)); // 2 || 4
        //     // };
        //     if (this.currentTarget.position.subtract(this.position).length() > PLAYER.DISTANCE.THRESHOLD * multiplier) { // 225-525 
        //         direction.normalize();
        //         this.setVelocityX(direction.x * (this.speed + 0.25)); // 2.25
        //         this.setVelocityY(direction.y * (this.speed + 0.25)); // 2.25
        //     } else if (this.currentTarget.position.subtract(this.position).length() < PLAYER.DISTANCE.THRESHOLD && !this.currentTarget.isRanged) { // Contiually Keeping Distance for RANGED ENEMIES and MELEE PLAYERS.
        //         if (Phaser.Math.Between(1, 250) === 1 && state !== States.EVADE) { //  && this.evasionTimer === 0
        //             // this.evasionTimer = 1000;
        //             this.playerMachine.stateMachine.setState(States.EVADE);
        //             return;
        //         } else {
        //             direction.normalize();
        //             this.setVelocityX(direction.x * -this.speed + 0.5); // -2.25 | -2 | -1.75
        //             this.setVelocityY(direction.y * -this.speed + 0.5); // -1.5 | -1.25
        //         };
        //     } else if (this.checkLineOfSight() && state !== States.EVADE) { //  && this.evasionTimer === 0
        //         // this.evasionTimer = 1000;
        //         this.playerMachine.stateMachine.setState(States.EVADE);
        //         return;
        //     } else if (distanceY < 15) { // The Sweet Spot for RANGED ENEMIES.
        //         this.setVelocity(0);
        //         if (this.clearAttacks()) this.anims.play(FRAMES.IDLE, true);
        //     } else { // Between 75 and 225 and outside y-distance
        //         direction.normalize();
        //         this.setVelocityY(direction.y * (this.speed + 0.5)); // 2.25
        //     };
        // } else { // Melee || Continually Maintaining Reach for MELEE ENEMIES.
        //     if (state !== States.COMPUTER_COMBAT) {
        //         this.playerMachine.stateMachine.setState(States.COMPUTER_COMBAT);
        //         return;
        //     };
        //     if (direction.length() > PLAYER.DISTANCE.ATTACK) { 
        //         direction.normalize();
        //         this.setVelocityX(direction.x * (this.speed + 0.25)); // 2.5
        //         this.setVelocityY(direction.y * (this.speed + 0.25)); // 2.5
        //         this.isPosted = false;
        //     } else { // Inside melee range
        //         this.isPosted = true;
        //         this.setVelocity(0);
        //         if (this.clearAttacks()) this.anims.play(FRAMES.IDLE, true);
        //     };
        // };
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

    handlePartyAnimations = () => {
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
            this.anims.play(FRAMES.ATTACK, true).on("animationcomplete", () => this.isParrying = false);
        } else if (this.isThrusting) {
            this.anims.play(FRAMES.THRUST, true).on("animationcomplete", () => this.isThrusting = false);
        } else if (this.isDodging) { 
            this.anims.play(FRAMES.DODGE, true);
            if (this.dodgeCooldown === 0) this.playerDodge();
        } else if (this.isRolling) {
            this.anims.play(FRAMES.ROLL, true);
            if (this.rollCooldown === 0) this.playerRoll();
        } else if (this.isPosturing) {
            this.anims.play(FRAMES.POSTURE, true).on("animationcomplete", () => this.isPosturing = false);
        } else if (this.isAttacking) {
            this.anims.play(FRAMES.THRUST, true).on("animationcomplete", () => this.isAttacking = false);
        } else if (this.moving()) { // && this.computerActionsClear()
            this.handleMovementAnimations();
            this.isMoving = true;
        } else if (this.isCasting) {
            this.anims.play(FRAMES.CAST, true);
        } else if (this.isPraying) {
            this.anims.play(FRAMES.PRAY, true).on("animationcomplete", () => this.isPraying = false);
        } else { //  if (this.computerActionsClear())
            this.isMoving = false;
            this.handleIdleAnimations();
        };
    };

    handleComputerConcerns = () => {
        if (this.actionSuccess === true) {
            this.actionSuccess = false;
            this.partyActionSuccess();
        };
        if (this.particleEffect !== undefined) {
            if (this.particleEffect.success) {
                this.particleEffect.success = false;
                this.particleEffect.triggered = true;
                this.partyActionSuccess();
            } else if (this.particleEffect.collided) {
                this.scene.particleManager.removeEffect(this.particleEffect.id);
                this.particleEffect = undefined;                
            } else if (!this.particleEffect.effect?.active) {
                this.particleEffect = undefined;   
            } else {
                this.scene.particleManager.updateParticle(this.particleEffect);
            };
        };
        if (this.healthbar) this.healthbar.update(this);
        if (this.scrollingCombatText) this.scrollingCombatText.update(this);
        if (this.specialCombatText) this.specialCombatText.update(this);
        if (this.resistCombatText) this.resistCombatText.update(this);
        if (this.negationBubble) this.negationBubble.update(this.x, this.y);
        if (this.reactiveBubble) this.reactiveBubble.update(this.x, this.y);
        this.spriteWeapon.setPosition(this.x, this.y);
        this.spriteShield.setPosition(this.x, this.y);
        if (this.scene.combat === true && (!this.currentTarget || !this.inComputerCombat)) this.findEnemy();
        if (this.isConfused && !this.sansSuffering("isConfused") && !this.playerMachine.stateMachine.isCurrentState(States.CONFUSED)) {
            this.playerMachine.stateMachine.setState(States.CONFUSED);
            return;
        };
        if (this.isFeared && !this.sansSuffering("isFeared") && !this.playerMachine.stateMachine.isCurrentState(States.FEARED)) {
            this.playerMachine.stateMachine.setState(States.FEARED);
            return;
        };
        if (this.isHurt && !this.sansSuffering("isHurt") && !this.playerMachine.stateMachine.isCurrentState(States.HURT)) {
            this.playerMachine.stateMachine.setState(States.HURT);
            return;
        };
        if (this.isParalyzed && !this.sansSuffering("isParalyzed") && !this.playerMachine.stateMachine.isCurrentState(States.PARALYZED)) {
            this.playerMachine.stateMachine.setState(States.PARALYZED);
            return;
        };
        if (this.isPolymorphed && !this.sansSuffering("isPolymorphed") && !this.playerMachine.stateMachine.isCurrentState(States.POLYMORPHED)) {
            this.playerMachine.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        if (this.isStunned && !this.sansSuffering("isStunned") && !this.playerMachine.stateMachine.isCurrentState(States.STUN)) {
            this.playerMachine.stateMachine.setState(States.STUN);
            return;
        };
        if (this.isFrozen && !this.playerMachine.negativeMachine.isCurrentState(States.FROZEN) && !this.currentNegativeState(States.FROZEN)) {
            this.playerMachine.negativeMachine.setState(States.FROZEN);
            return;
        };

        this.functionality("party", this.currentTarget as Enemy);

        if (this.isRooted && !this.playerMachine.negativeMachine.isCurrentState(States.ROOTED) && !this.currentNegativeState(States.ROOTED)) {
            this.playerMachine.negativeMachine.setState(States.ROOTED);
            return;
        };
        if (this.isSlowed && !this.playerMachine.negativeMachine.isCurrentState(States.SLOWED) && !this.currentNegativeState(States.SLOWED)) {
            this.playerMachine.negativeMachine.setState(States.SLOWED);
            return;
        };
        if (this.isSnared && !this.playerMachine.negativeMachine.isCurrentState(States.SNARED) && !this.currentNegativeState(States.SNARED)) {
            this.playerMachine.negativeMachine.setState(States.SNARED);
            return;
        };
    };

    partyActionSuccess = () => {
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
            this.scene.combatManager.paralyze(this.attackedTarget.enemyID);
            this.scene.combatEngaged(true);
            this.inComputerCombat = true;
            this.attackedTarget.jumpIntoCombat();
            this.stealthUpdate();
        } else {
            this.applyKnockback(this.attackedTarget, SWING_FORCE[this.weapons[0]?.grip as keyof typeof SWING_FORCE] * this.ascean[SWING_FORCE_ATTRIBUTE[this.weapons[0]?.attackType as keyof typeof SWING_FORCE_ATTRIBUTE]] * SWING_FORCE[action as keyof typeof SWING_FORCE]);
        };
    };

    update(dt: number) {
        this.handleComputerConcerns();
        this.evaluateCombatDistance();
        this.handlePartyAnimations();
        this.playerMachine.stateMachine.update(dt);
        this.playerMachine.positiveMachine.update(dt);
        this.playerMachine.negativeMachine.update(dt);
    };
};