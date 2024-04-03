import Phaser from "phaser";
import { EventBus } from "../game/EventBus";

export const { Bodies } = Phaser.Physics.Matter.Matter;

export default class LootDrop extends Phaser.Physics.Matter.Image { // Physics.Matter.Image  
    constructor(data) {
        console.log(data, 'Data of Loot Drop');
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
    console.log(url, 'Url of Loot Drop')
    const newUrl = url.split('/')[3].split('.')[0];
    console.log(newUrl, 'New Url Texture of Loot Drop')
    return url.split('/')[3].split('.')[0];
};