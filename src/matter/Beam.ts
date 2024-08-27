import { Game } from "../game/scenes/Game";
import { masteryNumber } from "../utility/styling";
export default class Beam {
    player: any;
    color: number;
    scene: Game;
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    enemyEmitters: any;
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
            accelerationX: {min:35, max:75},
            accelerationY: {min:35, max:75},
            scale: 0.1,
            quantity: 25,
            speedX: {min:35, max:75},
            speedY: {min:35, max:75},
            reserve: 25,
            follow: this.player,
            followOffset: { x: -265, y: -165 },
            visible: true
        };
        this.emitter = this.scene.add.particles(player.x, player.y, 'beam', this.settings);
        this.emitter.stop();
        this.emitter.setVisible(false);
        this.enemyEmitters = {};
    };
    enemyEmitter = (enemy: any, time: number, mastery: string) => { // Mastery for Enemy using Player Beam ??
        const color = masteryNumber(mastery);
        if (!this.enemyEmitters[enemy.enemyID]) {
            this.enemyEmitters[enemy.enemyID] = this.scene.add.particles(enemy.x, enemy.y, 'beam', {
                ...this.settings, color: [color], follow: enemy,
            });
        };
        this.enemyEmitters[enemy.enemyID].start();
        this.updateEnemyEmitter(enemy, color);
        this.scene.time.addEvent({
            delay: time / 20,
            callback: () => {if (enemy) this.updateEnemyEmitter(enemy, color);},
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
                moveToX: target.x - 265 + this.randomize(),
                moveToY: target.y - 165 + this.randomize(),
                scale: this.glow(),
            };
        } else {
            dynamicConfig = {
                moveToX: target.x - 265,
                moveToY: target.y - 165,
                scale: this.glow(),
            };
        };
        this.emitter.setConfig({...this.settings, ...dynamicConfig});
    };
    updateEnemyEmitter = (enemy: any, color: number) => {
        const dynamicConfig = {
            color: [color],
            moveToX: this.player.x - 795,
            moveToY: this.player.y - 330,
            scale: this.glow(),
        };
        this.enemyEmitters[enemy.enemyID].setConfig({ ...this.settings, ...dynamicConfig });
    };
    glow = (): number => Math.random() / 10;
    randomize = (): number => Math.random() * 20 * (Math.random() > 0.5 ? 1 : -1); 
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