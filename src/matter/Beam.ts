import { Game } from "../game/scenes/Game";
import { masteryNumber } from "../utility/styling";
export default class Beam {
    player: any;
    color: number;
    scene: Game;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    target: any;
    settings: any;
    constructor(player: any) {
        this.player = player;
        this.color = masteryNumber(player.ascean.mastery);
        this.scene = player.scene;
        this.target = undefined;    
        this.settings = {
            alpha: 0.25,
            angle: {min:0, max:360},
            color: [this.color],
            lifespan: {min:100, max:300},
            accelerationX: {min:35, max:55},
            accelerationY: {min:35, max:55},
            scale: 0.1,
            quantity: 25,
            speedX: {min:35, max:55},
            speedY: {min:35, max:55},
            reserve: 100,
            follow: this.player,
            followOffset: { x: -265, y: -165 },
            visible: false
        };
        this.emitter = this.scene.add.particles(player.x, player.y, 'beam', this.settings);
        this.emitter.stop();
    };
    createEmitter = (target: any, time: number) => { // Mastery for Enemy using Player Beam ??
        this.emitter.start();
        this.target = target;
        this.updateEmitter(target);
        this.scene.time.addEvent({
            delay: time / 20,
            callback: () => {if (this.target) this.updateEmitter(this.target);},
            callbackScope: this,
            repeat: 19
        });
    };
    updateEmitter(target: any) {
        const dynamicConfig = {
            moveToX: target.x - 265,
            moveToY: target.y - 165,
            scale: this.glow(),
            visible: true,
        };
        this.emitter.setConfig({...this.settings, ...dynamicConfig});
    };
    glow = (): number => Math.random() / 10; 
    reset = () => {
        this.emitter.stop(); // Added
        this.emitter.setVisible(false);
        this.target = undefined;
    };
};