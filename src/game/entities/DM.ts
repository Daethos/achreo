import Entity from "./Entity"; 
import StateMachine, { States } from "../phaser/StateMachine";
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from "../EventBus";
import { vibrate } from "../phaser/ScreenShake";
import { Compiler } from "../../utility/ascean";
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
const colliderWidth = 20; 
const colliderHeight = 36; 
const paddingWidth = 10; 
const paddingHeight = 10; 
const x = colliderWidth + 2 * paddingWidth;
const y = colliderHeight + 2 * paddingHeight;
export default class DM extends Entity { 
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

    constructor(data: any) {
        let { scene, npcType, id } = data;
        super({ ...data, name: "npc", ascean: undefined, health: 0 }); 
        this.scene = scene;
        this.id = id;
        this.enemyID = uuidv4();
        this.npcType = npcType;
        this.npcTarget = undefined;
        this.createNPC();
        this.stateMachine = new StateMachine(this, 'npc');
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
        let npcCollider = Bodies.rectangle(this.x, this.y + 10, colliderWidth, colliderHeight, { isSensor: false, label: 'npcCollider' });
        npcCollider.boundsPadding = { x, y };
        let npcSensor = Bodies.circle(this.x, this.y + 2, 48, { isSensor: true, label: 'npcSensor' });
        const compoundBody = Body.create({
            parts: [npcCollider, npcSensor],
            frictionAir: 0.1, 
            restitution: 0.3,
            friction: 0.15,
        });
        this.setExistingBody(compoundBody);                                    
        this.setFixedRotation();
        this.npcSensor = npcSensor;
        this.npcCollision(npcSensor); 
        this.setStatic(true);
        this.setTint(0x0000FF);
        this.flipX = true;
        this.scene.add.existing(this as any);
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                if (this.scene.combat === true) return;
                EventBus.emit('combat-round');
                vibrate();
                this.clearTint();
                this.setTint(0x00FF00); 
                this.scene.hud.setupNPC(this);
                this.scene.player.setCurrentTarget(this);
                this.scene.player.animateTarget();
            })
            .on('pointerout', () => {
                this.clearTint();
                this.setTint(0x0000FF);
            });
        scene.time.delayedCall(3000, () => this.setVisible(true));
    };

    cleanUp() {
        EventBus.off('dm-fetched', this.dmFetched);
        this.removeAllListeners();
        this.removeInteractive();
    };

    createNPC = () => {
        EventBus.once('dm-fetched', this.dmFetched);
        EventBus.emit('fetch-dm', { enemyID: this.enemyID, npcType: this.npcType });
    };

    dmFetched = (e: Compiler) => {
        this.ascean = e.ascean;
        this.health = e.attributes.healthTotal;
        this.combatStats = e;
    };

    npcCollision = (npcSensor: any) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [npcSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB.name === 'player' && !other.gameObjectB.inCombat && !this.isInteracting) {
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
                if (other.gameObjectB && other.gameObjectB.name === 'player' && this.isInteracting) {
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

    onIdleEnter = () => this.anims.play('player_idle', true);
    onAwarenessEnter = () => this.scene.hud.showDialog(true);
    onAwarenessUpdate = (_dt: number) => {
        if (this.npcTarget) {
            const direction = this.npcTarget.position.subtract(this.position);
            if (direction.x < 0) { this.flipX = true } else { this.flipX = false };
        };
    };
    onAwarenessExit = () => this.scene.hud.showDialog(false);

    update = (delta: number) => this.stateMachine.update(delta || 16);
};