import { Game } from "../game/scenes/Game";
import { masteryNumber } from "../utility/styling";

export default class Beam {
    player: any;
    scene: Game;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    target: any;
    constructor(player: any) {
        this.player = player;
        this.scene = player.scene;
        this.target = undefined;    
        this.emitter = this.scene.add.particles(player.x, player.y, 'beam', {
            alpha: 0.25,
            angle: {min: -5, max: 5},
            blendMode: Phaser.BlendModes.ADD,
            color: [masteryNumber(player.ascean.mastery)],
            frequency: 30,
            lifespan: {min: 100, max: 300},
            accelerationX: {min: 500, max: 1000},
            accelerationY: {min: 500, max: 1000},
            scale: {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            speedX: {min: 25, max: 50},
            speedY: {min: 25, max: 50},
            reserve: 1000,
            visible: false,
        });
    };
    
    createEmitter = (target: any) => {
        this.target = target;
        this.emitter.setConfig({
            visible: true,
            quantity: 50,
            x: this.player.x - 10,
            y: this.player.y,
            color: [masteryNumber(this.player.ascean.mastery)],
            moveToX: this.target.x,
            moveToY: this.target.y,
            scale: {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
        });
    };

    reset = () => {
        this.emitter.setConfig({
            visible: false,
            x: 0,
            y: 0
        });
        this.target = undefined;
    };

    update = () => {
        
    };
};