import { masteryNumber } from "../../utility/styling";
import Enemy from "../entities/Enemy";
import Party from "../entities/PartyComputer";
import Player from "../entities/Player";
import { Play } from "../main";

interface Dimension {
    X: number;
    Y: number;
};

const Default: Dimension = {
    X: 265,
    Y: 165
};

const CONVERSION = {
    Arena: Default,
    ArenaCvC: Default,
    ArenaView0: Default,
    ArenaView1: Default,
    ArenaView2: Default,
    ArenaView3: Default,
    ArenaView4: Default,
    ArenaView5: Default,
    ArenaView6: Default,
    ArenaView7: Default,
    ArenaView8: Default,
    Game: Default,
    Gauntlet: Default,
    Tutorial: Default,
    Underground: {
        X: 555, // 500
        Y: 30 // 35
    },
};

type Entity = Enemy | Party | Player;

export default class Beam {
    player: Entity;
    color: number;
    scene: Play;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    enemyEmitters: any;
    target: Entity | Phaser.Physics.Matter.Sprite | undefined;
    settings: any;
    xOffset: number;
    yOffset: number;
    constructor(player: Entity) {
        this.player = player;
        this.color = masteryNumber(player.ascean.mastery);
        this.scene = player.scene;
        this.target = undefined;
        this.xOffset = CONVERSION[this.scene.scene.key as keyof typeof CONVERSION].X;
        this.yOffset = CONVERSION[this.scene.scene.key as keyof typeof CONVERSION].Y;
        this.settings = {
            alpha: 0.25,
            angle: {min:0, max:360},
            color: [this.color],
            lifespan: {min:100, max:300},
            accelerationX: {min:35, max:75},
            accelerationY: {min:35, max:75},
            scale: 0.1,
            quantity: 25,
            speedX: {min:35, max:75},
            speedY: {min:35, max:75},
            reserve: 25,
            follow: player,
            followOffset: { x: -this.xOffset, y: -this.yOffset },
            visible: true
        };
        this.emitter = this.scene.add.particles(player.x, player.y, 'beam', this.settings);
        this.scene.add.existing(this.emitter);
        this.emitter.stop();
        this.emitter.setVisible(false);
        this.enemyEmitters = {};
    };

    getPlayerWorldPosition = () => {
        const worldPoint = this.scene.cameras.main.getWorldPoint(this.player.x, this.player.y);
        return { x: worldPoint.x, y: worldPoint.y };
    };

    getTargetWorldPosition = (target: any) => {
        const worldPoint = this.scene.cameras.main.getWorldPoint(target.x, target.y);
        return { x: worldPoint.x, y: worldPoint.y };
    };

    enemyEmitter = (enemy: Entity | Phaser.Physics.Matter.Sprite | undefined, time: number, mastery: string) => { // Mastery for Enemy using Player Beam ??
        const color = masteryNumber(mastery);
        this.emitter.start();
        this.updateEnemyEmitter(enemy, color);
        this.scene.time.addEvent({
            delay: time / 30,
            callback: () => this.updateEnemyEmitter(enemy, color),
            callbackScope: this,
            repeat: 29
        });
    };
    startEmitter = (target: Player | Party | Enemy | Phaser.Physics.Matter.Sprite | any, time: number) => {
        this.emitter.start();
        this.target = target;
        this.updateEmitter(target);
        this.scene.time.addEvent({
            delay: time / 30,
            callback: () => this.updateEmitter(this.target),
            callbackScope: this,
            repeat: 29
        });
    };

    updateEmitter = (target: Entity | Phaser.Physics.Matter.Sprite | undefined) => {
        if (target === undefined || target.body === undefined) return;
        let dynamicConfig = {};
        if (this.player === target) {
            dynamicConfig = {
                moveToX: target.x - this.xOffset + this.randomize(),
                moveToY: target.y - this.yOffset + this.randomize(),
                scale: this.glow(),
            };
        } else {
            dynamicConfig = {
                moveToX: target.x - this.xOffset,
                moveToY: target.y - this.yOffset,
                scale: this.glow(),
            };
        };
        this.emitter.setConfig({...this.settings, ...dynamicConfig});
    };

    updateEnemyEmitter = (enemy: any, color: number) => {
        if (!enemy || !enemy.body) return;
        const dynamicConfig = {
            color: [color],
            moveToX: enemy.x - this.xOffset,
            moveToY: enemy.y - this.yOffset,
            scale: this.glow(),
        };
        this.emitter.setConfig({ ...this.settings, ...dynamicConfig });
    };
    
    glow = (): number => Math.random() / 10;
    
    randomize = (): number => Math.random() * 50 * (Math.random() > 0.5 ? 1 : -1); 
    
    reset = () => {
        this.emitter.stop(); // Added
        this.emitter.setVisible(false);
        this.target = undefined;
    };
    
    resetEnemy = (enemy: any) => {
        this.enemyEmitters[enemy.enemyID].stop(); // Added
        this.enemyEmitters[enemy.enemyID].setVisible(false);
    };
};