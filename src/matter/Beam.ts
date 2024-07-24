import { Game } from "../game/scenes/Game";
import { masteryNumber } from "../utility/styling";

export default class Beam {
    player: any;
    color: number;
    scene: Game;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    target: any;
    constructor(player: any) {
        this.player = player;
        this.color = masteryNumber(player.ascean.mastery);
        this.scene = player.scene;
        this.target = undefined;    
        this.emitter = this.scene.add.particles(player.x, player.y, 'beam', {
            alpha: 0.25,
            angle: {min:-100, max:100},
            color: [this.color],
            lifespan: {min:100, max:300},
            accelerationX: {min:35, max:55},
            accelerationY: {min:35, max:55},
            scale: 0.1,
            quantity: 50,
            speedX: {min:35, max:55},
            speedY: {min:35, max:55},
            reserve: 100,
            follow: this.player,
            followOffset: { x: -265, y: -165 },
            visible: false
        });
    };

    checkEmitter = () => {
        this.emitter.setConfig({
            alpha: 0.25,
            angle: {min:-100, max:100},
            bounce: 1,
            x: this.player.x - 265,
            y: this.player.y - 165,
            color: [this.color],
            moveToX: this.target.x - 265,
            moveToY: this.target.y - 165,
            scale: 0.1, // {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            frequency: 30,
            quantity: 50,
            lifespan: {min: 100, max: 300},
            accelerationX: {min: 25, max: 50},
            accelerationY: {min: 25, max: 50},
            speedX: {min: 25, max: 50},
            speedY: {min: 25, max: 50},
            visible: true,
            follow: this.player,
            followOffset: { x: -265, y: -165 },
        });
    };
    
    createEmitter = (target: any, time: number) => {
        this.target = target;
        this.emitter.setConfig({
            alpha: 0.25,
            bounce: 1,
            angle: {min:-100, max:100},
            x: this.player.x - 265,
            y: this.player.y - 165,
            color: [this.color],
            moveToX: target.x - 265,
            moveToY: target.y - 165,
            scale: 0.1, // {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            frequency: 30,
            quantity: 50,
            lifespan: {min: 100, max: 300},
            accelerationX: {min: 25, max: 50},
            accelerationY: {min: 25, max: 50},
            speedX: {min: 25, max: 50},
            speedY: {min: 25, max: 50},
            visible: true,
            follow: this.player,
            followOffset: { x: -265, y: -165 },
        });
        this.scene.time.addEvent({
            delay: time / 20,
            callback: () => {
                if (this.target) this.checkEmitter();
            },
            callbackScope: this,
            repeat: 19
        });
    };

    reset = () => {
        this.emitter.setVisible(false);
        this.target = undefined;
    };
};