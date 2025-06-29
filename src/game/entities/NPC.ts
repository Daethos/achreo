import Entity from "./Entity"; 
import StateMachine, { States } from "../phaser/StateMachine";
import { v4 as uuidv4 } from "uuid";
import { EventBus } from "../EventBus";
import { vibrate } from "../phaser/ScreenShake";
import { ENTITY_FLAGS } from "../phaser/Collision";
let idCount = 0;
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
const colliderWidth = 20; 
const colliderHeight = 36; 
const paddingWidth = 10; 
const paddingHeight = 10; 
const x = colliderWidth + 2 * paddingWidth;
const y = colliderHeight + 2 * paddingHeight;
const types = ["Merchant-Alchemy", "Merchant-Armor", "Merchant-Smith", "Merchant-Jewelry", "Merchant-General", "Merchant-Tailor", "Merchant-Mystic", "Merchant-Weapon", "Merchant-Weapon-All", "Merchant-Armor-All"];
export default class NPC extends Entity { 
    enemyID: string;
    id: number;
    npcType: string;
    npcTarget: any;
    isDefeated: boolean = true;
    isEnemy: boolean = false;
    isInteracting: boolean = false;
    interactCount: number = 0;
    stateMachine: StateMachine;
    originalPosition: any;
    originPoint: any;
    npcSensor: any;
    weapons: any;
    distanceToPlayer: number = 0;
    lastDistanceFrame: number = 0;
    chunkX: number = 0;
    chunkY: number = 0;

    constructor(data: any) {
        let { scene, type } = data;
        super({ ...data, name: "npc", ascean: undefined, health: 0 }); 
        this.scene = scene;
        if (idCount >= 10) idCount = 0;
        this.id = type ? type === "Merchant-All-Armor" ? 9 : 10 : idCount++;
        this.enemyID = uuidv4();
        this.npcType = type ? type : types[this.id];
        this.npcTarget = undefined;
        this.chunkX = this.scene.playerChunkX;
        this.chunkY = this.scene.playerChunkY;
        this.createNPC();
        this.stateMachine = new StateMachine(this, "npc");
        this.stateMachine
        .addState(States.IDLE, {
                onEnter: this.onIdleEnter, 
            }) 
            .addState(States.AWARE, {
                onEnter: this.onAwarenessEnter,
                onUpdate: this.onAwarenessUpdate,
                onExit: this.onAwarenessExit,
            });
        this.stateMachine.setState(States.IDLE);
        this.setScale(0.8);
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {}; 
        let npcCollider = Bodies.rectangle(this.x, this.y + 10, colliderWidth, colliderHeight, { isSensor: false, label: "npcCollider" });
        npcCollider.boundsPadding = { x, y };
        let npcSensor = Bodies.circle(this.x, this.y + 2, 48, { isSensor: true, label: "npcSensor" });
        const compoundBody = Body.create({
            parts: [npcCollider, npcSensor],
            frictionAir: 0.1, 
            restitution: 0.3,
            friction: 0.15,
        });
        this.setExistingBody(compoundBody);                                    
        this.setFixedRotation();
        this.npcSensor = npcSensor;
        this.setCollisionCategory(ENTITY_FLAGS.NPC);
        this.npcCollision(npcSensor); 
        this.setStatic(true);
        this.setTint(0x0000FF);
        this.flipX = Math.random() >= 0.5;
        this.scene.add.existing(this as any);
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on("pointerdown", () => {
                if (this.scene.combat === true) return;
                EventBus.emit("purchase-sound");
                vibrate();
                this.clearTint();
                this.setTint(0x00FF00); 
                this.scene.hud.setupNPC(this);
                this.scene.player.setCurrentTarget(this);
                this.scene.player.animateTarget();
            })
            .on("pointerout", () => {
                this.clearTint();
                this.setTint(0x0000FF);
            });
        scene.time.delayedCall(1000, () => this.setVisible(true));
    };

    cleanUp() {
        EventBus.off("npc-fetched", this.npcFetched);
        this.removeAllListeners();
        this.removeInteractive();
    };

    createNPC = () => {
        EventBus.once("npc-fetched", this.npcFetched);
        EventBus.emit("fetch-npc", { enemyID: this.enemyID, npcType: this.npcType });
    };

    npcFetched = (e: any) => {
        if (this.enemyID !== e.enemyID) return;
        this.ascean = e.game;
        this.health = e.combat.attributes.healthTotal;
        this.combatStats = e.combat;
        this.weapons = [e.combat.combatWeaponOne, e.combat.combatWeaponTwo, e.combat.combatWeaponThree]
    };

    npcCollision = (npcSensor: any) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [npcSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB.name === "player" && !other.gameObjectB.inCombat && !this.isInteracting) {
                    this.isInteracting = true;
                    this.interactCount++;
                    this.scene.hud.setupNPC(this);
                    this.npcTarget = other.gameObjectB;
                    this.stateMachine.setState(States.AWARE);
                    other.gameObjectB.currentTarget = this;
                    other.gameObjectB.targetID = this.enemyID;
                    const isNewNPC = !other.gameObjectB.targets.some((obj: any) => obj.enemyID === this.enemyID);
                    if (isNewNPC) {
                        other.gameObjectB.targets.push(this);
                    };
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [npcSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB.name === "player" && this.isInteracting) {
                    this.isInteracting = false;
                    this.stateMachine.setState(States.IDLE); 
                    other.gameObjectB.targets = other.gameObjectB.targets.filter((obj: any) => obj.enemyID !== this.enemyID);
                    this.scene.hud.clearNPC();
                    other.gameObjectB.checkTargets();
                };
            },
            context: this.scene,
        }); 
    }; 

    onIdleEnter = () => this.anims.play("player_idle", true);
    onAwarenessEnter = () => this.scene.hud.showDialog(true);
    onAwarenessUpdate = (_dt: number) => {
        if (this.npcTarget) {
            const direction = this.npcTarget.position.subtract(this.position);
            if (direction.x < 0) { this.flipX = true } else { this.flipX = false };
        };
    };
    onAwarenessExit = () => this.scene.hud.showDialog(false);

    update = () => this.stateMachine.update(this.scene.sys.game.loop.delta);
};