import Entity from "./Entity"; 
import StateMachine, { States } from "../phaser/StateMachine";
import HealthBar from "../phaser/HealthBar";  
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from "../game/EventBus";
let idCount = 0;

export default class NPC extends Entity { 
    constructor(data) {
        let { scene } = data;
        super({ ...data, name: "npc", ascean: undefined, health: 0 }); 
        this.scene = scene;
        if (idCount >= 8) idCount = 0;
        this.id = idCount++;
        this.scene.add.existing(this);
        this.enemyID = uuidv4();
        const types = ['Merchant-Alchemy', 'Merchant-Armor', 'Merchant-Smith', 'Merchant-Jewelry', 'Merchant-General', 'Merchant-Tailor', 'Merchant-Mystic', 'Merchant-Weapon'];
        this.npcType = types[this.id];
        this.npcTarget = null;
        this.interacting = false;
        this.createNPC();
        this.stateMachine = new StateMachine(this, 'npc');
        this.stateMachine
            .addState(States.IDLE, {
                onEnter: this.onIdleEnter, 
                onExit: this.onIdleExit,
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
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const colliderWidth = 20; 
        const colliderHeight = 36; 
        const paddingWidth = 10; 
        const paddingHeight = 10; 

        const paddedWidth = colliderWidth + 2 * paddingWidth;
        const paddedHeight = colliderHeight + 2 * paddingHeight;
        let npcCollider = Bodies.rectangle(this.x, this.y + 10, colliderWidth, colliderHeight, { isSensor: false, label: 'npcCollider' });
        npcCollider.boundsPadding = { x: paddedWidth, y: paddedHeight };
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
        this.flipX = Math.random() >= 0.5;
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.clearTint();
                this.setTint(0x00FF00); 
                this.scene.setupNPC(this);
                this.scene.player.setCurrentTarget(this);
                this.scene.player.animateTarget();
            })
            .on('pointerout', () => {
                this.clearTint();
                this.setTint(0x0000FF);
            });
    };

    cleanUp() {
        EventBus.off('npc-fetched', this.npcFetched);
    };

    createNPC = () => {
        EventBus.on('npc-fetched', this.npcFetched);
        EventBus.emit('fetch-npc', { enemyID: this.enemyID, npcType: this.npcType });
    };

    npcFetched = (e) => {
        if (this.enemyID !== e.enemyID) return;
        this.ascean = e.game;
        this.health = e.combat.attributes.healthTotal;
        this.combatStats = e.combat;
        this.healthbar = new HealthBar(this.scene, this.x, this.y, this.health);
    };

    npcCollision = (npcSensor) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [npcSensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player' && !this.isDead && !other.gameObjectB.inCombat && !this.interacting) {
                    if (this.healthbar) this.healthbar.setVisible(true);
                    this.interacting = true;
                    this.scene.setupNPC(this);
                    this.npcTarget = other.gameObjectB;
                    this.stateMachine.setState(States.AWARE);

                    other.gameObjectB.currentTarget = this;
                    other.gameObjectB.targetID = this.enemyID;

                    const isNewNPC = !other.gameObjectB.targets.some(obj => obj.enemyID === this.enemyID);
                    if (isNewNPC) {
                        other.gameObjectB.targets.push(this);
                    };
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [npcSensor],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.name === 'player' && this.interacting) {
                    if (this.healthbar) this.healthbar.setVisible(false);
                    this.interacting = false;
                    this.stateMachine.setState(States.IDLE); 

                    other.gameObjectB.targets = other.gameObjectB.targets.filter(obj => obj.enemyID !== this.enemyID);
                    this.scene.clearNPC();
                    other.gameObjectB.checkTargets();
                };
            },
            context: this.scene,
        }); 
    }; 

    onIdleEnter = () => {
        this.anims.play('player_idle', true);
    };  
    onIdleExit = () => {
        this.anims.stop('player_idle');
    };  

    onAwarenessEnter = () => {
        this.anims.play('player_idle', true);
        this.scene.showDialog(true);
        this.setVelocity(0);
    };
    onAwarenessUpdate = (dt) => {
        if (this.npcTarget) {
            const direction = this.npcTarget.position.subtract(this.position);
            if (direction.x < 0) { this.flipX = true } else { this.flipX = false };
        };
    };
    onAwarenessExit = () => {
        this.anims.stop('player_idle');
        this.scene.showDialog(false);
    };

    update = () => {
        this.stateMachine.update(this.scene.sys.game.loop.delta);
        if (this.healthbar) this.healthbar.update(this);
    };
};