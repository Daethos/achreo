import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import { Particle } from "../matter/ParticleManager";
import { Play } from "../main";
import { Underground } from "../scenes/Underground";
import { Tutorial } from "../scenes/Tutorial";
import { Arena } from "../scenes/Arena";
import { Game } from "../scenes/Game";
import Party from "../entities/PartyComputer";
import { ENTITY_FLAGS, EntityFlag } from "./Collision";
// @ts-ignore
const { Bodies } = Phaser.Physics.Matter.Matter;

const COLORS = {
    "astrave": 0xFFFF00,
    "blind": 0xCC5500,
    "caerenesis": 0x00FFFF,
    "chiomic": 0xFFC700,
    "freeze": 0x0000FF,
    "fyerus": 0xE0115F,
    "howl": 0xFF0000,
    "kynisos": 0xFFD700,
    "renewal": 0xFDF6D8,
    "scream": 0xFF00FF,
    "shock": 0x00FFFF,
    "tendril": 0x00FF00,
    "writhe": 0x080080,

    "earth": 0x000000,
    "fire": 0xFF0000,
    "frost": 0x0000FF,
    "lightning": 0xFFFF00,
    "righteous": 0xFFD700,
    "sorcery": 0xA700FF,
    "spooky": 0x080080,
    "wild": 0x50C878,
    "wind": 0x00FFFF
};

const PARTICLE_SCALE = 0.0075;
const SCALE = 0.01875;
const Y_OFFSET = 6;
const RADIUS = 60;
const REPEAT = 20;
const ENEMY = "enemy";
const PARTY = "party";
const PLAYER = "player";
const ENEMY_COLLIDER = "enemyCollider";
const PARTY_COLLIDER = "partyCollider";
const PLAYER_COLLIDER = "playerCollider";

type Player_Scene = Arena | Underground | Game | Tutorial; 
type Target = Player | Enemy | Party;

interface ListenerCondition<T = any> {
    // name: string;
    // label: string;
    mask: EntityFlag;
    filter: (gameObject: T) => boolean;
};

export default class AoE extends Phaser.Physics.Matter.Sprite {
    count: number;
    hit: any[];
    bless: any[];
    timer: Phaser.Time.TimerEvent | undefined;
    sensor: MatterJS.BodyType;
    scene: Play;
    manual: boolean = false;
    enhanced: boolean = false;
    hitMask: EntityFlag = ENTITY_FLAGS.NONE;
    blessMask: EntityFlag = ENTITY_FLAGS.NONE;

    constructor(
        scene: Play, 
        type: string, 
        count = 1, 
        positive = false, 
        enemy: Enemy | Party | undefined = undefined, 
        manual: boolean = false, 
        target: Target | undefined = undefined, 
        particle: undefined | {effect: Particle; entity: Player | Enemy } = undefined
    ) {
        super(scene.matter.world, 0, 6, "target");
        this.name = type;
        this.setAngle(0);
        this.setVisible(false);
        // this.setScale(0.375); // 0.375 IS THE FINAL SIZE
        this.setOrigin(0.5);
        this.scene = scene;
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
        this.manual = manual;
        if (enemy !== undefined) {
            if (enemy.name === ENEMY) {
                this.hitMask = ENTITY_FLAGS.ENTITY;
                this.blessMask = ENTITY_FLAGS.ENEMY;
                this.setupSensor(target ? target.x : enemy.x, target ? target.y : enemy.y, RADIUS, "aoeSensor");
                this.setupEnemyListener(enemy as Enemy);
                this.scalingTimer(target ? target : enemy, SCALE, Y_OFFSET, REPEAT); // *NEW*
                this.setupEnemyCount(scene, type, positive, enemy as Enemy);
            } else if (enemy.name === "party") {
                this.hitMask = ENTITY_FLAGS.ENEMY;
                this.blessMask = ENTITY_FLAGS.GOOD;
                this.setupSensor(target ? target.x : enemy.x, target ? target.y : enemy.y, RADIUS, "aoeSensor");
                this.setupPartyListener(enemy as Party);
                this.scalingTimer(target ? target : enemy, SCALE, Y_OFFSET, REPEAT);
                this.setPartyCount(scene, type, positive, enemy as Party);
            };
        } else if (particle !== undefined) {
            this.hitMask = ENTITY_FLAGS.ENTITY;
            this.setupSensor(particle.effect.effect.x, particle.effect.effect.y, RADIUS, "particleAoeSensor");
            this.setupParticleListener();
            this.scalingTimer(particle.effect.effect, PARTICLE_SCALE, 0, REPEAT); // *NEW*
            this.setParticleCount(particle.entity, scene);
        } else if ((scene as Player_Scene).player) {
            this.hitMask = ENTITY_FLAGS.ENEMY;
            this.blessMask = ENTITY_FLAGS.GOOD;
            this.enhanced = scene.hud.talents.talents[this.name as keyof typeof scene.hud.talents.talents].enhanced;
            const manualPoint = scene.getWorldPointer();
            this.setupSensor(target ? target.x : manual ? manualPoint.x : scene.player.x, target ? target.y : manual ? manualPoint.y : scene.player.y + Y_OFFSET, RADIUS, "aoeSensor");
            // this.setupListener();
            this.setupPlayerListener();
            this.scalingTimer(target ? target : manual ? manualPoint : scene.player, SCALE * (this.enhanced ? 1.5 : 1), manual ? 0 : Y_OFFSET, REPEAT);
            this.setCount(scene, type, positive);
        };
    };
    cleanAnimation = (scene: Play) => {
        scene.rotateTween(this, 0, false);
    };
    cleanup = () => {
        this.scene.glowFilter.remove(this);
        this.bless = [];
        this.hit = [];
        if (this.timer) {
            this.timer.destroy();
            this.timer.remove(false);
            this.timer = undefined;
        };
        this.destroy();
    };
    protected fadeOut(duration: number, onComplete?: () => void) {
        this.scene.tweens.add({
            targets: [this],
            alpha: 0,
            duration,
            onComplete: () => {
                if (onComplete) onComplete();
                this.cleanup();
            }
        });    
    };
    protected setupSensor(x: number, y: number, radius: number, label: string) {
        if (this.manual === true) {
            const centerX = this.scene.cameras.main.width / 2;
            const centerY = this.scene.cameras.main.height / 2;
            const point = this.scene.cameras.main.getWorldPoint(centerX, centerY);
            const offsetX = (x - point.x);
            const offsetY = (y - point.y);
            x -= offsetX / 5;
            y -= offsetY / 5;
        };
        const sensor = Bodies.circle(x, y, radius, {
            isSensor: true,
            label
        });
        this.setExistingBody(sensor);
        this.setStatic(true);
        this.sensor = sensor;
        return sensor;
    };
    protected scalingTimer(target: Phaser.Physics.Matter.Sprite, scaleIncrement: number, yOffset: number = 0, repeatCount: number = 20) {
        let scale = scaleIncrement;
        let count = 0;
        if (this.manual === true) {
            const centerX = this.scene.cameras.main.width / 2;
            const centerY = this.scene.cameras.main.height / 2;
            const point = this.scene.cameras.main.getWorldPoint(centerX, centerY);
            const offsetX = (target.x - point.x);
            const offsetY = (target.y - point.y);
            target.x -= offsetX / 5;
            target.y -= offsetY / 5;
        };
        this.scene.rotateTween(this, this.count, true);
        this.setScale(scale);
        this.setVisible(true);
        this.timer = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= repeatCount || !this.timer || !target) return;
                scale += scaleIncrement;
                this.setScale(scale);
                this.setPosition(target.x, target.y + yOffset);
                count++;
            },
            callbackScope: this,
            repeat: repeatCount
        });
    };
    protected setupBaseListener(conditions: {hitConditions: ListenerCondition[]; blessConditions: ListenerCondition[]; origin?: Enemy | Party;}) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any }) => {
                const { gameObjectB } = collision;
                for (const condition of conditions.hitConditions) {
                    if ((gameObjectB?.aoeMask & condition.mask) && condition.filter(gameObjectB)) {
                        if (!this.hit.some(h => h.particleID === gameObjectB.particleID)) {
                            this.hit.push(gameObjectB);
                        };
                        break;
                    };
                };
                for (const condition of conditions.blessConditions) {
                    if ((gameObjectB?.aoeMask & condition.mask) && condition.filter(gameObjectB)) {
                        if (!this.bless.some(b => b.particleID === gameObjectB.particleID)) {
                            this.bless.push(gameObjectB);
                        };
                        break;
                    };
                };
            },
            context: this.scene
        });
    
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [this.sensor],
            callback: (collision: { gameObjectB: any; bodyB: any }) => {
                const { gameObjectB } = collision;
                this.hit = this.hit.filter(target => 
                    !conditions.hitConditions.some(cond => 
                        gameObjectB?.aoeMask & cond.mask && target.particleID === gameObjectB.particleID
                    )
                );
                this.bless = this.bless.filter(target => 
                    !conditions.blessConditions.some(cond => 
                        gameObjectB?.aoeMask & cond.mask && target.particleID === gameObjectB.particleID
                    )
                );
            },
            context: this.scene
        });
    };

    setCount = (scene: Play, type: string, positive: boolean) => {
        if (type === "fyerus") {
            if ((scene as Player_Scene).player.isMoving) {
                this.fadeOut(1000);
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
                    this.fadeOut(1000);
                } else {
                    this.setCount(scene, type, positive);
                };
            });
        } else {
            scene.time.delayedCall(975, () => {
                this.hit.forEach((target) => {
                    (scene.combatManager as any)[type](target.enemyID, scene.player.playerID);
                });
                this.count -= 1;
                if (this.count === 0) {
                    this.fadeOut(1000);
                } else {
                    this.setCount(scene, type, false);
                };
            });
        };
    };
    setPartyCount = (scene: Play, type: string, positive: boolean, origin: Party) => {
        if (type === "fyerus") {
            if ((scene as Player_Scene).player.isMoving) {
                this.fadeOut(1000);
                return;
            };
        };
        if (positive === true) {
            scene.time.delayedCall(975, () => {
                const blessing = `party${type.charAt(0).toUpperCase() + type.slice(1)}`;
                this.bless.forEach((blessed) => {
                    (scene.combatManager as any)[blessing](blessed.playerID);
                });
                this.count -= 1;
                if (this.count === 0) {
                    this.fadeOut(1000);
                } else {
                    this.setPartyCount(scene, type, positive, origin);
                };
            });
        } else {
            scene.time.delayedCall(975, () => {
                this.hit.forEach((hit) => {
                    (scene.combatManager as any)[type](hit.enemyID, origin.enemyID);
                });
                this.count -= 1;
                if (this.count === 0) {
                    this.fadeOut(1000);
                } else {
                    this.setPartyCount(scene, type, false, origin);
                };
            });
        };
    };
    setParticleCount = (entity: Player | Enemy, scene: Play) => {
        scene.time.delayedCall(1000, () => {
            this.hit.forEach((target) => {
                (scene.combatManager as any).magic(entity, target);
            });
            this.count -= 1;
            if (this.count === 0) {
                this.fadeOut(1000);
            } else {
                this.setParticleCount(entity, scene);
            };
        });
    };
    setupEnemyCount = (scene: Play, type: string, positive: boolean, enemy: Enemy) => {
        if (enemy.isDeleting) {
            this.fadeOut(1000);
            return;
        };
        if (positive === true) {
            scene.time.delayedCall(975, () => {
                this.hit.forEach((hit) => {
                    if (hit.name === PLAYER) {
                        if ((scene as Player_Scene).player.checkPlayerResist() === true) {
                            (scene.combatManager as any)[type](hit.playerID, enemy.enemyID);
                        };
                    } else if (hit.name === ENEMY || hit.name === PARTY) {
                        (scene.combatManager as any)[type](hit.enemyID, enemy.enemyID);
                    };
                });
                this.count -= 1;
                if (this.count === 0) {
                    this.fadeOut(1000);
                } else {
                    this.setupEnemyCount(scene, type, positive, enemy);
                };
            });
        } else {
            scene.time.delayedCall(975, () => {
                const blessing = `enemy${type.charAt(0).toUpperCase() + type.slice(1)}`;
                this.bless.forEach((blessed) => {
                    (scene.combatManager as any)[blessing](blessed.enemyID);
                });
                this.count -= 1;
                if (this.count === 0) {
                    this.fadeOut(1000);
                } else {
                    this.setupEnemyCount(scene, type, false, enemy);
                };
            });
        };
    };
    protected setupEnemyListener(origin: Enemy) {
        this.setupBaseListener({
            hitConditions: [
                {
                    mask: ENTITY_FLAGS.PLAYER,
                    filter: (gameObject) => !this.hit.some(h => h.playerID === gameObject.playerID)
                }, {
                    mask: ENTITY_FLAGS.ENEMY | ENTITY_FLAGS.PARTY,
                    filter: (gameObject) => {
                        const isEnemy = gameObject.aoeMask & ENTITY_FLAGS.ENEMY;
                        if (isEnemy) {
                            return !origin.enemies.some(e => e.id === gameObject.enemyID) && !this.hit.some(h => h.enemyID === gameObject.enemyID) && gameObject.enemyID !== origin.enemyID;
                        };
                        return !this.hit.some(h => h.enemyID === gameObject.enemyID);
                    }
                }
            ],
            blessConditions: [
                {
                    mask: ENTITY_FLAGS.ENEMY,
                    filter: (gameObject) => {
                        return !origin.enemies.some(e => e.id === gameObject.enemyID) && !this.bless.some(b => b.enemyID === gameObject.enemyID);
                    }
                }
            ],
            origin
        });
    };

    protected setupParticleListener() {
        this.setupBaseListener({
            hitConditions: [
                {
                    mask: ENTITY_FLAGS.ALL,
                    filter: (gameObject) => !this.hit.some(h => h.particleID === gameObject.particleID)
                }
            ],
            blessConditions: []
        });
    };

    protected setupPlayerListener() {
        this.setupBaseListener({
            hitConditions: [
                {
                    mask: ENTITY_FLAGS.ENEMY,
                    filter: (gameObject) => !this.hit.some(h => h.enemyID === gameObject.enemyID)
                }
            ],
            blessConditions: [
                {
                    mask: ENTITY_FLAGS.PLAYER | ENTITY_FLAGS.PARTY,
                    filter: (gameObject) => !this.bless.some(b => b.particleID === gameObject.particleID)
                }
            ]
        });
    };

    protected setupPartyListener(origin: Party) {
        this.setupBaseListener({
            hitConditions: [
                {
                    mask: ENTITY_FLAGS.ENEMY,
                    filter: (gameObject) => !this.hit.some(h => h.enemyID === gameObject.enemyID)
                }
            ],
            blessConditions: [
                {
                    mask: ENTITY_FLAGS.PLAYER | ENTITY_FLAGS.PARTY,
                    filter: (gameObject) => !this.bless.some(b => b.particleID === gameObject.particleID)
                }
            ],
            origin
        });
    };
};