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
            angle: {min:0, max:360},
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
            accelerationX: {min: 25, max: 50},
            accelerationY: {min: 25, max: 50},
            alpha: 0.25,
            angle: {min:0, max:360},
            bounce: 1,
            color: [this.color],
            follow: this.player,
            followOffset: { x: -265, y: -165 },
            frequency: 15,
            lifespan: {min: 100, max: 300},
            moveToX: this.target.x - 265,
            moveToY: this.target.y - this.randomize(165),
            quantity: 25,
            radial: true,
            scale: this.glow(), // {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            speedX: {min: 25, max: 50},
            speedY: {min: 25, max: 50},
            visible: true,
        });
    };
    createEmitter = (target: any, time: number) => {
        this.target = target;
        this.emitter.setConfig({
            accelerationX: {min: 25, max: 50},
            accelerationY: {min: 25, max: 50},
            alpha: 0.25,
            angle: {min:0, max:360},
            bounce: 1,
            color: [this.color],
            follow: this.player,
            followOffset: { x: -265, y: -165 },
            frequency: 15,
            lifespan: {min: 100, max: 300},
            moveToX: target.x - 265,
            moveToY: target.y - this.randomize(165),
            quantity: 25,
            radial: true,
            scale: 0.01, // {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            speedX: {min: 25, max: 50},
            speedY: {min: 25, max: 50},
            visible: true,
        });
        this.scene.time.addEvent({
            delay: time / 20,
            callback: () => {if (this.target) this.checkEmitter();},
            callbackScope: this,
            repeat: 19
        });
    };
    glow = (): number => {
        const strength = Math.random() / 10;
        return strength;    
    };
    randomize = (val: number) => {
        const coin = Math.random() >= 0.5 ? 1 : -1
        const random = (Math.random() * 2.5) * coin;
        return random + val;    
    };
    reset = () => {
        this.emitter.setVisible(false);
        this.target = undefined;
    };
};