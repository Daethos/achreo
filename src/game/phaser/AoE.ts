import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import { Particle } from "../matter/ParticleManager";
import { Play } from "../main";
// @ts-ignore
const { Bodies } = Phaser.Physics.Matter.Matter;

const COLORS = {
    'astrave': 0xFFFF00,
    'blind': 0xCC5500,
    'caerenesis': 0x00FFFF,
    'chiomic': 0xFFC700,
    'freeze': 0x0000FF,
    'fyerus': 0xE0115F,
    'howl': 0xFF0000,
    'kynisos': 0xFFD700,
    'renewal': 0xFDF6D8,
    'scream': 0xFF00FF,
    'shock': 0x00FFFF,
    'tendril': 0x00FF00,
    'writhe': 0x080080,

    'earth': 0x000000,
    'fire': 0xFF0000,
    'frost': 0x0000FF,
    'lightning': 0xFFFF00,
    'righteous': 0xFFD700,
    'sorcery': 0xA700FF,
    'spooky': 0x080080,
    'wild': 0x50C878,
    'wind': 0x00FFFF
};
export default class AoE extends Phaser.Physics.Matter.Sprite {
    count: number;
    hit: any[];
    bless: any[];
    timer: any;
    sensor: any;

    constructor(scene: Play, type: string, count = 1, positive = false, enemy: undefined | Enemy = undefined, manual: boolean = false, target: undefined | any = undefined, particle: undefined | {effect: Particle; entity: Player | Enemy } = undefined) {
        super(scene.matter.world, scene.player.x, scene.player.y + 6, 'target');
        this.name = type;
        this.setAngle(0);
        this.setVisible(false);
        this.setScale(0.375); // 0.375
        this.setOrigin(0.5, 0.5);
        scene.add.existing(this);
        scene.glowFilter.add(this, {
            outerStrength: 1,
            innerStrength: 1,
            glowColor: COLORS[type as keyof typeof COLORS],
            intensity: 0.25,
            knockout: true,
        });
        this.count = count;
        this.hit = [];
        this.bless = [];
        this.timer = undefined;    
        if (enemy !== undefined) {
            this.setupEnemySensor(enemy, target);
            this.setupEnemyListener(scene);
            this.setEnemyTimer(scene, enemy, target);
            this.setupEnemyCount(scene, type, positive, enemy);
        } else if (particle !== undefined) {
            this.setupParticleSensor(particle.effect);
            this.setupParticleListener(scene);
            this.setParticleTimer(scene, particle.effect);
            this.setParticleCount(particle.entity, scene);
        } else {
            this.setupSensor(scene, manual, target);
            this.setupListener(scene);
            this.setTimer(scene, manual, target);
            this.setCount(scene, type, positive);
        };
    };
    cleanAnimation = (scene: Play) => {
        scene.rotateTween(this, 0, false);
    };
    setCount = (scene: Play, type: string, positive: boolean) => {
        if (type === 'fyerus') {
            if (scene.player.isMoving) {
                scene.glowFilter.remove(this);
                this.bless = [];
                this.timer.destroy();
                this.timer.remove(false);
                this.timer = undefined;
                this.destroy();
                return;
            };
        };
        if (positive === true) {
            scene.time.delayedCall(975, () => {
                this.bless.forEach((_target) => {
                    (scene.combatManager as any)[type]();
                });
                this.count -= 1;
                if (this.count === 0) {
                    scene.glowFilter.remove(this);
                    this.bless = [];
                    this.timer.destroy();
                    this.timer.remove(false);
                    this.timer = undefined;
                    this.destroy();
                } else {
                    this.setCount(scene, type, positive);
                };
            });
        } else {
            scene.time.delayedCall(975, () => {
                this.hit.forEach((target) => {
                    (scene.combatManager as any)[type](target.enemyID);
                });
                this.count -= 1;
                if (this.count === 0) {
                    scene.glowFilter.remove(this);
                    this.hit = [];
                    this.timer.destroy();
                    this.timer.remove(false);
                    this.timer = undefined;
                    this.destroy();    
                } else {
                    this.setCount(scene, type, false);
                };
            });
        };
    };
    setParticleCount = (entity: Player | Enemy, scene: Play) => {
        scene.time.delayedCall(975, () => {
            this.hit.forEach((target) => {
                (scene.combatManager as any).magic(entity, target);
            });
            this.count -= 1;
            if (this.count === 0) {
                scene.glowFilter.remove(this);
                this.hit = [];
                this.timer.destroy();
                this.timer.remove(false);
                this.timer = undefined;
                this.destroy();    
            } else {
                this.setParticleCount(entity, scene);
            };
        });
    };
    setupEnemyCount = (scene: Play, type: string, positive: boolean, enemy: Enemy) => {
        if (positive === true) {
            scene.time.delayedCall(975, () => {
                this.hit.forEach((hit) => {
                    if (scene.player.checkPlayerResist() === true && hit.playerID === scene.player.playerID) {
                        (scene.combatManager as any)[type](hit.playerID, enemy.enemyID);
                    };
                });
                this.count -= 1;
                if (this.count === 0) {
                    scene.glowFilter.remove(this);
                    this.hit = [];
                    this.timer.destroy();
                    this.timer.remove(false);
                    this.timer = undefined;
                    this.destroy();
                } else {
                    this.setupEnemyCount(scene, type, positive, enemy);
                };
            });
        } else {
            scene.time.delayedCall(975, () => {
                this.bless.forEach((blessed) => {
                    (scene.combatManager as any)[`enemy${type.charAt(0).toUpperCase() + type.slice(1)}`](blessed.enemyID);
                });
                this.count -= 1;
                if (this.count === 0) {
                    scene.glowFilter.remove(this);
                    this.bless = [];
                    this.timer.destroy();
                    this.timer.remove(false);
                    this.timer = undefined;
                    this.destroy();    
                } else {
                    this.setupEnemyCount(scene, type, false, enemy);
                };
            });
        };
    };
    setEnemyTimer = (scene: Play, enemy: Enemy, target: Player | Enemy) => {
        let scale = 0;
        let count = 0;
        let targ = target !== undefined ? target : enemy;
        this.setVisible(true);
        this.timer = scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= 20) return;
                if (this && this.timer) {
                    scale += 0.01875;
                    this.setScale(scale);
                    this.setPosition(targ.x, targ.y + 6);
                };
                count++;
            },
            callbackScope: this,
            repeat: 20,
        });
    };
    setParticleTimer = (scene: Play, target: Particle) => {
        let scale = 0.0075; // 0.1875 || .009375 tOTAL .25215 || .0106075
        this.setScale(scale);
        let count = 0;
        const y = target.effect.y;
        this.setOrigin(0.5, 0.5);
        this.setVisible(true);
        this.timer = scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= 20) return;
                if (this && this.timer) {
                    scale += 0.0075;
                    this.setScale(scale);
                    this.setPosition(target.effect.x, y);
                };
                count++;
            },
            callbackScope: this,
            repeat: 20,
        });
    };
    setTimer = (scene: Play, manual: boolean, target: Player | Enemy) => {
        let scale = 0.01875;
        this.setScale(scale);
        let count = 0;
        let targ = target !== undefined ? target : manual === true ? scene.getWorldPointer() : scene.player;
        if (manual === true) {
            const centerX = scene.cameras.main.width / 2;
            const centerY = scene.cameras.main.height / 2;
            const point = scene.cameras.main.getWorldPoint(centerX, centerY);
            const offsetX = (targ.x - point.x);
            const offsetY = (targ.y - point.y);
            targ.x -= offsetX / 5;
            targ.y -= offsetY / 5;
        };
        const y = manual === true ? targ.y : targ.y + 6;
        this.setOrigin(0.5, 0.5);
        scene.rotateTween(this, this.count, true);
        this.setVisible(true);
        this.timer = scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= 20) return;
                if (this && this.timer) {
                    scale += 0.01875;
                    this.setScale(scale);
                    this.setPosition(targ.x, y);
                };
                count++;
            },
            callbackScope: this,
            repeat: 20,
        });
    };
    setupEnemySensor = (enemy: Enemy, target: Player | Enemy) => {
        let targ = target !== undefined ? target : enemy;
        const aoeSensor = Bodies.circle(targ.x, targ.y, 60, { 
            isSensor: true, label: 'aoeSensor' 
        });
        this.setExistingBody(aoeSensor);
        this.setStatic(true);
        this.sensor = aoeSensor;
    };
    setupParticleSensor = (target: Particle) => {
        const aoeSensor = Bodies.circle(target.effect.x, target.effect.y, 60, { 
            isSensor: true, label: 'particleAoeSensor' 
        });
        this.setExistingBody(aoeSensor);
        this.setStatic(true);
        this.setOrigin(0.5, 0.5);
        this.sensor = aoeSensor;
    };
    setupSensor = (scene: Play, manual: boolean, target: undefined) => {
        let targ;
        if (target !== undefined) {
            targ = target;
        } else if (manual === true) {
            targ = scene.getWorldPointer();
        } else {
            targ = scene.player;
        };
        if (manual === true) {
            const centerX = scene.cameras.main.width / 2;
            const centerY = scene.cameras.main.height / 2;
            const point = scene.cameras.main.getWorldPoint(centerX, centerY);
            const offsetX = (targ.x - point.x);
            const offsetY = (targ.y - point.y);
            targ.x -= offsetX / 5;
            targ.y -= offsetY / 5;
        };
        const y = manual === true ? targ.y : targ.y + 6;
        const aoeSensor = Bodies.circle(targ.x, y, 60, { 
            isSensor: true, label: 'aoeSensor' 
        });
        this.setExistingBody(aoeSensor);
        this.setStatic(true);
        this.setOrigin(0.5, 0.5);
        this.sensor = aoeSensor;
    };
    setupEnemyListener = (scene: Play) => {
        scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any; }) => {
                const { gameObjectB, bodyB } = collision;
                if (gameObjectB?.name === 'player' && bodyB?.label === 'playerCollider') {
                    const hit = this.hit.find((h) => h.playerID === gameObjectB.playerID);
                    if (!hit) this.hit.push(gameObjectB);
                } else if (gameObjectB?.name === 'enemy' && bodyB?.label === 'enemyCollider') {
                    this.bless.push(gameObjectB);
                };
            },
            context: scene
        });
        scene.matterCollision.addOnCollideEnd({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any; }) => {
                const { gameObjectB, bodyB } = collision;
                if (gameObjectB?.name === 'player' && bodyB?.label === 'playerCollider') {
                    this.hit = this.hit.filter((target) => target !== gameObjectB);
                } else if (gameObjectB?.name === 'enemy' && bodyB?.label === 'enemyCollider') {
                    this.bless = this.bless.filter((target) => target !== gameObjectB);
                };
            },
            context: scene
        });
    };
    setupParticleListener = (scene: Play) => {
        scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any; }) => {
                const { gameObjectB, bodyB } = collision;
                if ((gameObjectB?.name === 'enemy' && bodyB?.label === 'enemyCollider') ||
                    (gameObjectB?.name === 'player' && bodyB?.label === 'playerCollider')) {
                    this.hit.push(gameObjectB);    
                };
            },
            context: scene
        });
        scene.matterCollision.addOnCollideEnd({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any; }) => {
                const { gameObjectB, bodyB } = collision;
                if ((gameObjectB?.name === 'enemy' && bodyB?.label === 'enemyCollider') || 
                    (gameObjectB?.name === 'player' && bodyB?.label === 'playerCollider')) {
                    this.hit = this.hit.filter((target) => target.enemyID !== gameObjectB.enemyID);
                };
            },
            context: scene
        });
    };
    setupListener = (scene: Play) => {
        scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any; }) => {
                const { gameObjectB, bodyB } = collision;
                if (gameObjectB?.name === 'enemy' && bodyB?.label === 'enemyCollider') {
                    this.hit.push(gameObjectB);    
                } else if (gameObjectB?.name === 'player' && bodyB?.label === 'playerCollider') {
                    this.bless.push(gameObjectB);
                };
            },
            context: scene
        });
        scene.matterCollision.addOnCollideEnd({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any; }) => {
                const { gameObjectB, bodyB } = collision;
                if (gameObjectB?.name === 'enemy' && bodyB?.label === 'enemyCollider') {
                    this.hit = this.hit.filter((target) => target.enemyID !== gameObjectB.enemyID);
                } else if (gameObjectB?.name === 'player' && bodyB?.label === 'playerCollider') {
                    this.bless = this.bless.filter((target) => target !== gameObjectB);
                };
            },
            context: scene
        });
    };
};