import { EventBus } from "../EventBus";
import { ENTITY_FLAGS } from "../phaser/Collision";
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import { Bodies } from "./LootDrop";

export default class Treasure extends Phaser.Physics.Matter.Image {
    _id: string;
    scene: any;
    tween: Phaser.Tweens.Tween;
    sensor: any;

    constructor(data: any) {
        let { scene, x, y } = data;
        super (scene.matter.world, x, y, "treasure-chest");
        scene.add.existing(this);
        this.scene = scene;
        this._id = uuidv4();
        this.setScale(0.75);
        this.setAlpha(0.75);
        this.collider();
        this.listener();
    };

    cleanUp = () => {
        this.scene.matterCollision.removeOnCollideStart({ objectA: [this.sensor] });
        this.scene.matterCollision.removeOnCollideEnd({ objectA: [this.sensor] });
        this.sensor = undefined;
        EventBus.off("open-chest", this.open);
    };


    collider = () => {
        this.sensor = Bodies.circle(this.x, this.y, 12, { isSensor: true, label: "treasureSensor" })
        this.setExistingBody(this.sensor);
        this.setStatic(true);
        this.setCollisionCategory(ENTITY_FLAGS.LOOT);
        this.scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB.name === "player" && other.bodyB.label === "body") {
                    EventBus.emit("lockpick", {id: this._id, interacting: true, type: "treasure"});
                };
            },
            context: this.scene
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [this.sensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB.name === "player" && other.bodyB.label === "body") {
                    EventBus.emit("lockpick", {id: "", interacting: false, type: ""});
                };
            },
            context: this.scene
        });
    };

    listener = () => EventBus.on("open-chest", this.open);

    open = (e: string) => {
        if (e !== this._id) return;
        EventBus.off("open-chest", this.open);
        const treasures = Phaser.Math.Between(1,3);
        for (let i = 0; i < treasures; ++i) {
            EventBus.emit("enemy-loot", { enemyID: this._id, level: this.scene.player.ascean.level });
        };
        this.scene.tweens.add({
            targets: this,
            duration: 1000,
            opacity: 0,
            onComplete: () => this.destroy()
        });
    };
};