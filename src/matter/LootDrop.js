import Phaser from "phaser";
import { EventBus } from "../game/EventBus";

export const { Bodies } = Phaser.Physics.Matter.Matter;

export default class LootDrop extends Phaser.Physics.Matter.Image { // Physics.Matter.Image  
    constructor(data) {
        let { scene, enemyID, drop } = data;
        const texture = imgUrl(drop.imgUrl);
        const enemy = scene.enemies?.find((e) => e.enemyID === enemyID);
        super (scene.matter.world, 
            enemy.body.position.x - 16, 
            enemy.body.position.y + 16, 
            texture);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setScale(0.5);
        this._id = drop._id;
        this.drop = drop;
        this.setupCollider();
        this.setupListener();
    }; 

    cleanUp() {
        EventBus.off('destroy-lootdrop', this.destroyLootDrop);
    };

    setupCollider = () => {
        const circleCollider = Bodies.circle(this.x, this.y, 12, {
          isSensor: false,
          label: "lootdropCollider",
        });
        this.setExistingBody(circleCollider);
        this.setStatic(true);

        this.scene.matterCollision.addOnCollideStart({
            objectA: [circleCollider],
            callback: (other) => {
                if (other.gameObjectB && other.bodyB.label === 'playerSensor') {
                    other.gameObjectB.interacting.push(this);
                    const interactingLoot = { loot: this._id, interacting: true };
                    EventBus.emit('interacting-loot', interactingLoot);
                };
            },
            context: this.scene,
        }); 

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [circleCollider],
            callback: (other) => {
                if (other.gameObjectB && other.bodyB.label === 'playerSensor') {
                    other.gameObjectB.interacting = other.gameObjectB.interacting.filter(obj => obj.id !== this.id);
                    const interactingLoot = { loot: this._id, interacting: false };
                    EventBus.emit('interacting-loot', interactingLoot);
                };
            },
            context: this.scene,
        });
    };


    setupListener = () => EventBus.on('destroy-lootdrop', this.destroyLootDrop);
    
    destroyLootDrop = (e) => {
        if (e === this._id) {
            this.cleanUp();
            this.destroy();
        };
    }; 
};

const imgUrl = (url) => {
    const newUrl = url.split('/')[3].split('.')[0];
    // console.log(newUrl, 'New Url Texture of Loot Drop')
    return newUrl;
};