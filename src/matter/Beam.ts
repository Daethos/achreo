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
            angle: {min:-2, max:2},
            color: [masteryNumber(player.ascean.mastery)],
            // frequency: 30,
            // lifespan: 2000,
            lifespan: {min:100, max:300},
            accelerationX: {min:35, max:55},
            accelerationY: {min:35, max:55},
            scale: 0.1,
            quantity: 100,
            speedX: {min:35, max:55},
            speedY: {min:35, max:55},
            reserve: 100,
            follow: this.player,
            followOffset: { x: -265, y: -165 },
            // emitZone: {
            //     type: 'edge',
            //     source: new Phaser.Geom.Line(this.player.x, this.player.y, this.player.x, this.player.y),
            //     quantity: 100
            // },
            visible: false
        });
        // this.emitter.setVisible(true);
    };
    
    createEmitter = (target: any, time: number) => {
        this.target = target;
        // this.emitter.setVisible(true);
        // this.emitter.addEmitZone({
        //     source: new Phaser.Geom.Line(this.player.x, this.player.y, target.x, target.y),
        //     type: 'edge',
        //     quantity: 100
        // } as any);
        // const world = this.scene.cameras.main.getWorldPoint(this.player.x, this.player.y);
        // const targ = this.scene.cameras.main.getWorldPoint(target.x, target.y);
        this.emitter.setConfig({
            alpha: 0.25,
            angle: {min:-2, max:2},
            x: this.player.x - 265,
            y: this.player.y - 165,
            color: [masteryNumber(this.player.ascean.mastery)],
            moveToX: target.x - 265,
            moveToY: target.y - 165,
            scale: 0.1, // {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            frequency: 30,
            quantity: 100,
            lifespan: {min: 100, max: 300},
            accelerationX: {min: 35, max: 55},
            accelerationY: {min: 35, max: 55},
            speedX: {min: 35, max: 55},
            speedY: {min: 35, max: 55},
            visible: true
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

    checkEmitter = () => {
        this.emitter.setConfig({
            alpha: 0.25,
            angle: {min:-2, max:2},
            x: this.player.x - 265,
            y: this.player.y - 165,
            color: [masteryNumber(this.player.ascean.mastery)],
            moveToX: this.target.x - 265,
            moveToY: this.target.y - 165,
            scale: 0.1, // {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            frequency: 30,
            quantity: 100,
            lifespan: {min: 100, max: 300},
            accelerationX: {min: 35, max: 55},
            accelerationY: {min: 35, max: 55},
            speedX: {min: 35, max: 55},
            speedY: {min: 35, max: 55},
            visible: true
        });
    };

    reset = () => {
        this.emitter.setVisible(false);
        this.target = undefined;
    };

    update = () => {
        if (this.target) {
            // this.emitter.setConfig({
            //     alpha: 0.25,
            //     x: this.player.x - 265,
            //     y: this.player.y - 165,
            //     color: [masteryNumber(this.player.ascean.mastery)],
            //     moveToX: this.target.x - 265,
            //     moveToY: this.target.y - 165,
            //     scale: 0.1, // {start: 0.0001, end: 0, ease: 'Quad.easeOut'},
            //     frequency: 30,
            //     quantity: 100,
            //     lifespan: {min: 100, max: 300},
            //     accelerationX: {min: 35, max: 55},
            //     accelerationY: {min: 35, max: 55},
            //     speedX: {min: 35, max: 55},
            //     speedY: {min: 35, max: 55},
            //     visible: true
            // });
            // this.emitter.setEmitZone({
            //     source: new Phaser.Geom.Line(this.player.x, this.player.y, this.target.x, this.target.y),
            //     type: 'edge',
            //     quantity: 100
            // } as any); 
        };
    };
};