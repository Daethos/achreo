import Phaser from "phaser";
import { EventBus } from "../EventBus";
import Equipment from "../../models/equipment";
// @ts-ignore
export const { Bodies } = Phaser.Physics.Matter.Matter;

export default class LootDrop extends Phaser.Physics.Matter.Image { // Physics.Matter.Image  
    _id: string;
    drop: Equipment;
    scene: any;
    tween: Phaser.Tweens.Tween;

    constructor(data: any) {
        let { scene, enemyID, drop } = data;
        const texture = imgUrl(drop.imgUrl);
        const enemy = scene.enemies?.find((e: any) => e.enemyID === enemyID);
        super (scene.matter.world, enemy.body.position.x - 16, enemy.body.position.y + 16, texture);
        this.scene = scene;
        this.scene.plugins.get('rexGlowFilterPipeline').add(this, {
            outerStrength: 3,
            glowColor: this.scene.player.setColor(this.scene.player.ascean?.mastery),
            quality: 0.5,
            knockout: false,
        });
        this.scene.add.existing(this);
        this.setScale(0.5);
        this._id = drop._id;
        this.drop = drop;
        this.setupCollider();
        this.setupListener();
        this.tween = scene.tweens.add({
            targets: this,
            duration: 1000,
            scale: 1,
            y: this.y - 25,
            repeat: -1,
            yoyo: true
        });

        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 32, 32), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.clearTint();
                this.setTint(0x00FF00); 
                this.scene.player.interacting.push(this);
                const interactingLoot = { loot: this._id, interacting: true };
                EventBus.emit('interacting-loot', interactingLoot);
                EventBus.emit('blend-game', { showLoot: true });
                EventBus.emit('action-button-sound');
            })
            .on('pointerout', () => {
                this.clearTint();
            });
    }; 
    cleanUp = () => EventBus.off('destroy-lootdrop', this.destroyLootDrop);
    setupCollider = () => {
        const lootSensor = Bodies.circle(this.x, this.y, 12, { isSensor: true, label: "lootSensor" });
        this.setExistingBody(lootSensor);
        this.setStatic(true);
        this.scene.matterCollision.addOnCollideStart({
            objectA: [lootSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.bodyB.label === 'playerSensor') {
                    other.gameObjectB.interacting.push(this);
                    const interactingLoot = { loot: this._id, interacting: true };
                    EventBus.emit('interacting-loot', interactingLoot);
                    // EventBus.emit('blend-game', { lootTag: true });
                    EventBus.emit('blend-game', { showLoot: true });
                };
            },
            context: this.scene,
        }); 
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [lootSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.bodyB.label === 'playerSensor') {
                    other.gameObjectB.interacting = other.gameObjectB.interacting.filter((obj: any) => obj._id !== this._id);
                    const interactingLoot = { loot: this._id, interacting: false };
                    EventBus.emit('interacting-loot', interactingLoot);
                };
            },
            context: this.scene,
        });
    };
    setupListener = () => EventBus.on('destroy-lootdrop', this.destroyLootDrop);
    destroyLootDrop = (e: string) => {
        if (e === this._id) {
            EventBus.emit('equip-sound');
            this.scene.plugins.get('rexGlowFilterPipeline').remove(this);
            this.tween.stop();
            this.cleanUp();
            this.destroy();
        };
    }; 
};

const imgUrl = (url: string): string => url.split('/')[3].split('.')[0];