import { masteryNumber } from "../../utility/styling";
import { Play } from "../main";
const CONVERSION = {
    Arena: {
        X: 265,
        Y: 165
    },
    ArenaView0: {
        X: 265,
        Y: 165
    },
    ArenaView1: {
        X: 265,
        Y: 165
    },
    ArenaView2: {
        X: 265,
        Y: 165
    },
    ArenaView3: {
        X: 265,
        Y: 165
    },
    ArenaView4: {
        X: 265,
        Y: 165
    },
    ArenaView5: {
        X: 265,
        Y: 165
    },
    ArenaView6: {
        X: 265,
        Y: 165
    },
    ArenaView7: {
        X: 265,
        Y: 165
    },
    ArenaView8: {
        X: 265,
        Y: 165
    },
    Game: {
        X: 265,
        Y: 165
    },
    Tutorial: {
        X: 265,
        Y: 165
    },
    Underground: {
        X: 500, // 500
        Y: 35 // 35
    },
};
export default class Beam {
    player: any;
    color: number;
    scene: Play;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    enemyEmitters: any;
    target: any;
    settings: any;
    xOffset: number;
    yOffset: number;
    constructor(player: any) {
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

    // Get the player's position in the world
    getPlayerWorldPosition = () => {
        const worldPoint = this.scene.cameras.main.getWorldPoint(this.player.x, this.player.y);
        return { x: worldPoint.x, y: worldPoint.y };
    };

    // Get the target's position in the world
    getTargetWorldPosition = (target: any) => {
        const worldPoint = this.scene.cameras.main.getWorldPoint(target.x, target.y);
        return { x: worldPoint.x, y: worldPoint.y };
    };

    enemyEmitter = (enemy: any, time: number, mastery: string) => { // Mastery for Enemy using Player Beam ??
        const color = masteryNumber(mastery);
        this.emitter.start();
        this.updateEnemyEmitter(enemy, color);
        this.scene.time.addEvent({
            delay: time / 20,
            callback: () => {if (enemy && this.player.body) this.updateEnemyEmitter(enemy, color);},
            callbackScope: this,
            repeat: 19
        });
    };
    startEmitter = (target: any, time: number) => {
        this.emitter.start();
        this.target = target;
        this.updateEmitter(target);
        this.scene.time.addEvent({
            delay: time / 20,
            callback: () => {if (this.target !== undefined) this.updateEmitter(this.target);},
            callbackScope: this,
            repeat: 19
        });
    };

    updateEmitter = (target: any) => {
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