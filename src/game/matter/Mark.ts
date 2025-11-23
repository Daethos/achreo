import { EventBus } from "../EventBus";
import { ENTITY_FLAGS } from "../phaser/Collision";
import { Play } from "../main";
import { Marker } from "../../models/settings";
// @ts-ignore
export const { Bodies } = Phaser.Physics.Matter.Matter;

export default class Mark extends Phaser.Physics.Matter.Image { // Physics.Matter.Image  
    marker: Marker;
    scene: any;
    sensor: any;
    tween: Phaser.Tweens.Tween;

    constructor(scene: Play, marker: Marker) {
        let x = marker.x, y = marker.y;
        super (scene.matter.world, 0, 0, "marker");
        this.setPosition(x, y);
        this.scene = scene;
        this.marker = marker;
        this.scene.add.existing(this);
        this.setScale(0.5);
        this.setDepth(1);
        this.setupCollider();
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 32, 32), Phaser.Geom.Rectangle.Contains)
            .on("pointerdown", () => {
                this.clearTint();
                this.setTint(0x00FF00); 
                EventBus.emit("action-button-sound");
            })
            .on("pointerout", () => {
                this.clearTint();
            });
    };

    cleanup = () => {
        this.removeInteractive();
        this.world.remove(this.body!);
        this.world.remove(this.sensor);
    };
    
    setupCollider = () => {
        const sensor = Bodies.circle(this.x, this.y, 12, { isSensor: true, label: "sensor" });
        this.setExistingBody(sensor);
        this.sensor = sensor;
        this.setStatic(true);
        this.setCollisionCategory(ENTITY_FLAGS.LOOT);
        this.scene.matterCollision.addOnCollideStart({
            objectA: [sensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.bodyB.label === "playerSensor") {
                    EventBus.emit("alert", { header: this.marker.title, body: this.marker.content, delay: 6000, key: "Close", extra: "Remove Marker", arg: this.marker.id });
                };
            },
            context: this.scene,
        });
    };
};