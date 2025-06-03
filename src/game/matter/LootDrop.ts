import { EventBus } from "../EventBus";
import Equipment from "../../models/equipment";
import { ENTITY_FLAGS } from "../phaser/Collision";
// @ts-ignore
export const { Bodies } = Phaser.Physics.Matter.Matter;

export default class LootDrop extends Phaser.Physics.Matter.Image { // Physics.Matter.Image  
    _id: string;
    drop: Equipment;
    scene: any;
    tween: Phaser.Tweens.Tween;
    particles: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(data: any) {
        let { scene, enemyID, drop } = data;
        let x = 0, y = 0, type = "";
        const texture = imgUrl(drop.imgUrl);
        const enemy = scene.enemies?.find((e: any) => e.enemyID === enemyID);
        if (enemy) {
            type = "enemy";
            x = enemy.body.position.x - 16;
            y = enemy.body.position.x + 16;
        } else { // Treasure Chest
            const treasure = scene.treasures?.find((e: any) => e._id === enemyID);
            type = "treasure";
            x = treasure.x;
            y = treasure.y;
            // x = Phaser.Math.Between(treasure.x-16, treasure.x+16);
            // y = Phaser.Math.Between(treasure.y-16, treasure.y+16);
        };
        super (scene.matter.world, 200, 200, texture);
        this.setPosition(x,y);
        this.scene = scene;
        this.scene.plugins.get('rexGlowFilterPipeline').add(this, {
            outerStrength: 3,
            glowColor: this.scene.player.setColor(this.scene.player.ascean?.mastery),
            quality: 0.5,
            knockout: false,
        });
        this.scene.add.existing(this);
        this.setScale(0.5);
        this.setDepth(10);
        this._id = drop._id;
        this.drop = drop;
        this.setupCollider();
        this.setupListener();
        if (type === "treasure") {
            const distance = Phaser.Math.Between(32, 64);
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const newX = x + Math.cos(angle) * distance;
            const newY = y + Math.sin(angle) * distance;
            const variance = () => Phaser.Math.Between(-16, 16);
            scene.tweens.add({
                targets: this,
                x: {value:newX,variance:variance()},
                y: {value:newY,variance:variance()},
                duration: 1000,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    this.tween = scene.tweens.add({
                        targets: this,
                        duration: 1000,
                        scale: 1,
                        y: newY - 25,
                        repeat: -1,
                        yoyo: true
                    });
                }
            });
        } else {
            this.tween = scene.tweens.add({
                targets: this,
                duration: 1000,
                scale: 1,
                y: this.y - 25,
                repeat: -1,
                yoyo: true
            });
        };

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
        this.setCollisionCategory(ENTITY_FLAGS.LOOT);
        this.scene.matterCollision.addOnCollideStart({
            objectA: [lootSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.bodyB.label === 'playerSensor') {
                    other.gameObjectB.interacting.push(this);
                    const interactingLoot = { loot: this._id, interacting: true };
                    EventBus.emit('interacting-loot', interactingLoot);
                    this.scene.hud.smallHud.activate('loot', true);
                    // EventBus.emit('blend-game', { lootTag: true });
                    // EventBus.emit('blend-game', { showLoot: true });
                };
            },
            context: this.scene,
        }); 
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [lootSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.bodyB.label === 'playerSensor') {
                    // this.scene.hud.smallHud.activate('loot', false);
                    other.gameObjectB.interacting = other.gameObjectB.interacting.filter((obj: any) => obj._id !== this._id);
                    const interactingLoot = { loot: this._id, interacting: false };
                    EventBus.emit('interacting-loot', interactingLoot);
                    if (other.gameObjectB.interacting.length === 0) EventBus.emit('smallhud-deactivate', 'loot');
                };
            },
            context: this.scene,
        });
    };
    setupListener = () => EventBus.on('destroy-lootdrop', this.destroyLootDrop);
    destroyLootDrop = (e: string) => {
        if (e === this._id) {
            EventBus.emit('equip-sound');
            this.scene.player.interacting = this.scene.player.interacting.filter((obj: any) => obj._id !== this._id);
            if (this.scene.player.interacting.length === 0) EventBus.emit('smallhud-deactivate', 'loot');
            this.scene.plugins.get('rexGlowFilterPipeline').remove(this);
            this.tween.stop();
            this.cleanUp();
            this.destroy();
        };
    }; 
};

const imgUrl = (url: string): string => url.split('/')[3].split('.')[0];