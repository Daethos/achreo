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
import { Gauntlet } from "../scenes/Gauntlet";
// @ts-ignore
const { Bodies, Body } = Phaser.Physics.Matter.Matter;

export const COLORS = {
    "astrave": 0xFFFF00,
    "blind": 0xCC5500,
    "caerenesis": 0x00FFFF,
    "chiomic": 0xFFC700,
    "disease": 0x00FF00,
    "freeze": 0x0000FF,
    "fyerus": 0xE0115F,
    "howl": 0xFF0000,
    "kynisos": 0xFFD700,
    "renewal": 0xFDF6D8,
    "scream": 0xFF00FF,
    "shock": 0x00FFFF,
    "tendril": 0x00FF00,
    "writhe": 0x080080,
    "help": 0xFDF6D8,

    "arrow": 0xFFFFFF,
    "earth": 0x000000,
    "fire": 0xFF0000,
    "frost": 0x0000FF,
    "lightning": 0xFFFF00,
    "righteous": 0xFFD700,
    "sorcery": 0xA700FF,
    "spooky": 0x080080,
    "wild": 0x50C878,
    "wind": 0x00FFFF,
    // "": 0x000000
};
const TYPES = ["astrave", "blind", "caeresis", "chiomic", "disease", "freeze", "fyerus", "help", "howl", "kynisos", "renewal", "scream", "shock", "tendril", "writhe", "earth", "fire", "frost", "lightning", "righteous", "sorcery", "spooky", "wild", "wind"];
const PARTICLES = ["earth", "fire", "frost", "lightning", "righteous", "sorcery", "spooky", "wild", "wind"];
const PARTICLE_SCALE = 0.0075;
const SCALE = 0.01875;
const Y_OFFSET = 6;
const PARTICLE_RADIUS = 24; // / 1.5;
const RADIUS = 60; // / 3;
const REPEAT = 20;
const ENEMY = "enemy";
const PARTY = "party";
const PLAYER = "player";

type Player_Scene = Arena | Underground | Game | Tutorial | Gauntlet; 
type Target = Player | Enemy | Party;
interface CountCallbacks {
    concern?: () => boolean;
    hit: (target: Target, originId?: string) => void;
    bless?: (target: Target) => void; // Bless typically affects allies
};
interface ListenerCondition<T = any> {
    mask: EntityFlag;
    filter: (gameObject: T) => boolean;
};

export class AoEPool {
    private readonly pool: AoE[] = [];
    private readonly activeAoEs: AoE[] = [];
    private readonly scene: Play;
    private readonly typePools = new Map<string, AoE[]>();

    constructor(scene: Play, initialSize = 110) {
        this.scene = scene;
        this.preallocate(initialSize);
    };
    
    private createNewAoE(): AoE {
        const aoe = new AoE(this.scene);
        aoe.setVisible(false);
        aoe.setActive(false);
        return aoe;
    };

    private preallocate(count: number) {
        for (let i = 0; i < count; i++) {
            this.pool.push(this.createNewAoE());
        };
    };

    pinch(type: string): AoE | undefined {
        let aoe = this.pool.find((a: AoE) => a.type === type);
        if (aoe) this.pool.splice(this.pool.indexOf(aoe), 1);
        return aoe;
    };

    get(type:string, count = 1, positive = false, enemy?: Enemy | Party, manual = false, target?: Target, particle?: {effect:Particle; entity: Target;}): AoE {
        const typePool = this.typePools.get(type) || [];
        let aoe = typePool.pop() || this.pinch(type) || this.pool.pop();
        if (!aoe) {
            aoe = this.createNewAoE();
        };
        aoe.reset(type, count, positive, enemy, manual, target, particle);
        this.activeAoEs.push(aoe);
        return aoe;
    };

    release(aoe: AoE) {
        if (!aoe || !(aoe instanceof AoE)) return;
        if (aoe.active) {
            console.warn('Releasing active AoE - forcing cleanup', aoe.type);
            aoe.cleanup(false);
        };
        const index = this.activeAoEs.indexOf(aoe);
        if (index !== -1) {
            this.activeAoEs[index] = this.activeAoEs[this.activeAoEs.length - 1];
            this.activeAoEs.pop();
        } else {
            console.warn('AoE not found in active pool:', aoe.type);
        };
        if (aoe.visible || aoe.active) {
            aoe.setVisible(false);
            aoe.setActive(false);
        };
        if (!this.typePools.has(aoe.type)) {
            // console.log("Creating new type pool for:", aoe.type);
            this.typePools.set(aoe.type, []);
        };
        this.typePools.get(aoe.type)!.push(aoe);
    };

    releaseAll() {
        while (this.activeAoEs.length) {
            this.release(this.activeAoEs[0]);
        };
    };

    shrink(keepCount = 10) {
        for (const [_, pool] of this.typePools) {
            while (pool.length > keepCount) {
                const aoe = pool.pop()!;
                aoe.destroy();
            };
        };
    };
};

export default class AoE extends Phaser.Physics.Matter.Sprite {
    private count: number = 1;
    private bless: any[] = [];
    private hit: any[] = [];
    private enhanced: boolean = false;
    private manual: boolean = false;
    public sensor: MatterJS.BodyType | undefined = undefined;
    private timer: Phaser.Time.TimerEvent | undefined = undefined;
    public type: string = "";
    public name: string = "";
    public scene: Play;

    constructor(scene: Play) {
        super(scene.matter.world, 0, 0, "target");
        this.scene = scene;
        scene.add.existing(this);
        this.setVisible(false);
        this.setActive(false);
        this.setOrigin(0.5);
        this.type = TYPES[Math.floor(Math.random() * TYPES.length)];
        this.name = this.type;
        this.sensor = this.setupSensor(0, 0, PARTICLES.includes(this.type) ? PARTICLE_RADIUS: RADIUS, PARTICLES.includes(this.type) ? "particleAoeSensor" : "aoeSensor");
        this.hollowTimer();
    };

    public cleanAnimation = (scene: Play) => {
        scene.rotateTween(this, 0, false);
    };
    
    public cleanup = (returning: boolean = true) => {
        if (this.scene && this.sensor) {
            this.scene.matterCollision.removeOnCollideStart({ objectA: [this.sensor] });
            this.scene.matterCollision.removeOnCollideEnd({ objectA: [this.sensor] });
            this.scene.glowFilter.remove(this);
        };
        
        if (this.timer) {
            this.timer.destroy();
            this.timer.remove(false);
            this.timer = undefined;
        };

        this.bless = [];
        this.hit = [];

        this.setVisible(false);
        this.setActive(false);

        if (this.sensor) {
            this.scene.matter.world.remove(this.sensor);
            this.sensor = undefined;
        };

        this.scene.tweens.killTweensOf(this);

        if (returning) this.scene.aoePool.release(this);
    };
    
    public reset(type: string, count = 1, positive = false, enemy?: Enemy | Party, manual = false, target?: Target, particle?: { effect: Particle; entity: Target }): AoE {
        if (this.active) this.cleanup(false);

        // this.name = type;
        this.count = count;
        this.manual = manual;

        this.scene.glowFilter.add(this, {
            outerStrength: 1,
            innerStrength: 1,
            glowColor: COLORS[type as keyof typeof COLORS],
            intensity: 0.25,
            knockout: true
        });

        this.setPosition(0, 0);
        this.setAlpha(1);
        this.setAngle(0);
        
        if (enemy !== undefined) {
            if (enemy.name === ENEMY) {
                this.enemyAoe(type, positive, enemy, target);
            } else if (enemy.name === PARTY) {
                this.partyAoe(type, positive, enemy as Party, target);
            };
        } else if (particle !== undefined) {
            this.particleAoe(particle, positive);
        } else if ((this.scene as Player_Scene).player) {
            this.playerAoe(type, positive, manual, enemy);
        };

        this.setActive(true);
        this.setVisible(true);

        return this;
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

    private enemyAoe(type: string, positive: boolean, enemy: Enemy | Party, target: Target | undefined) {
        this.sensor = this.setupSensor(target ? target.x : enemy.x, target ? target.y : enemy.y, RADIUS, "aoeSensor");
        this.setupEnemyListener(enemy as Enemy);
        this.scalingTimer(target ? target : enemy, SCALE, Y_OFFSET, REPEAT); // *NEW*
        this.baseCount(type, !positive, enemy, {
            concern: () => enemy.isDeleting,
            hit: (target, originId) => {
                if (target.name === PLAYER) {
                    (this.scene.combatManager as any)[type]((target as Player).playerID, originId);
                } else {
                    (this.scene.combatManager as any)[type]((target as Enemy | Party).enemyID, originId);
                };
            },
            bless: (target) => (this.scene.combatManager as any)[type]((target as Enemy).enemyID)
        });
    };

    private particleAoe(particle: { effect: Particle; entity: Target }, positive: boolean) {
        this.sensor = this.setupSensor(particle.effect.effect.x, particle.effect.effect.y, PARTICLE_RADIUS, "particleAoeSensor");
        this.setupParticleListener();
        this.scalingTimer(particle.effect.effect, PARTICLE_SCALE, 0, REPEAT); // *NEW*
        this.baseCount("magic", positive, particle.entity, {
            hit: (target) => this.scene.combatManager.magic(target, particle.entity)
        });
    };

    private partyAoe(type: string, positive: boolean, party: Party, target: Target | undefined) {
        this.sensor = this.setupSensor(target ? target.x : party.x, target ? target.y : party.y, RADIUS, "aoeSensor");
        this.setupPartyListener(party);
        this.scalingTimer(target ? target : party, SCALE, Y_OFFSET, REPEAT);
        this.baseCount(type, positive, party, {
            hit: (target) => (this.scene.combatManager as any)[type]((target as Enemy).enemyID, party.enemyID),
            bless: (target) => (this.scene.combatManager as any)[type]((target as Player | Party).playerID)
            
        });
    };

    private playerAoe(type: string, positive: boolean, manual: boolean, target: Target | undefined) {
        this.enhanced = this.scene.hud.talents.talents[this.name as keyof typeof this.scene.hud.talents.talents].enhanced;
        const manualPoint = this.scene.getWorldPointer();
        this.sensor = this.setupSensor(target ? target.x : manual ? manualPoint.x : this.scene.player.x, target ? target.y : manual ? manualPoint.y : this.scene.player.y + Y_OFFSET, RADIUS, "aoeSensor");
        this.setupPlayerListener();
        this.scalingTimer(target ? target : manual ? manualPoint : this.scene.player, 
            SCALE * (this.enhanced ? 1.5 : 1), 
            manual ? 0 : Y_OFFSET, REPEAT);
        this.baseCount(type, positive, this.scene.player, {
            concern: () => type === "fyerus" && (this.scene as Player_Scene).player.isMoving,
            bless: (target) => (this.scene.combatManager as any)[type]((target as Player | Party).playerID), 
            hit: (target) => (this.scene.combatManager as any)[type]((target as Enemy).enemyID, this.scene.player.playerID)
        });
    };

    private baseCount(type: string, positive: boolean, origin: Target, onTick: CountCallbacks) {
        if (onTick.concern && onTick.concern()) {
            this.fadeOut(1000);
            return;    
        };
        this.scene.time.delayedCall(1000, () => {
            if (positive && onTick.bless) {
                this.bless.forEach(target => onTick.bless!(target));
            } else if (!positive && onTick.hit) {
                this.hit.forEach(target => onTick.hit!(target, (origin as Player).playerID ?? (origin as Enemy).enemyID));
            };
            this.count -= 1;
            if (this.count === 0) {
                this.fadeOut(1000);
            } else {
                this.baseCount(type, positive, origin, onTick);
            };
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
        // Body.scale(sensor, this.scale);
        this.setExistingBody(sensor);
        this.setCollisionCategory(ENTITY_FLAGS.PARTICLES);
        this.setStatic(true);
        return sensor;
    };

    protected hollowTimer(repeatCount: number = 20) {
        let count = 0, scale = PARTICLES.includes(this.type) ? PARTICLE_SCALE : SCALE, increment = PARTICLES.includes(this.type) ? PARTICLE_SCALE : SCALE;
        this.setScale(scale);

        this.timer = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= repeatCount || !this.timer) {
                    this.cleanup(false);
                    return;
                };
                scale += increment;
                this.setScale(scale);
                count++;
            },
            callbackScope: this,
            repeat: repeatCount
        });
    };

    protected scalingTimer(target: Phaser.Physics.Matter.Sprite, scaleIncrement: number, yOffset: number = 0, repeatCount: number = 20) {
        let count = 0, scale = scaleIncrement;
        if (this.manual === true) {
            const centerX = this.scene.cameras.main.width / 2;
            const centerY = this.scene.cameras.main.height / 2;
            const point = this.scene.cameras.main.getWorldPoint(centerX, centerY);
            const offsetX = (target.x - point.x);
            const offsetY = (target.y - point.y);
            target.x -= offsetX / 5;
            target.y -= offsetY / 5;
        };
        this.scene.rotateTween(this, 1, true); // this.count
        this.setScale(scale);
        // console.log(`
        //     ====================================
        //     Aoe Scale ${scale} | Sensor Scale ${this.sensor?.scale.x}
        //     ====================================
        // `);
        this.timer = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= repeatCount || !this.timer || !target) return;
                scale += scaleIncrement;
                this.setScale(scale);
                this.setPosition(target.x, target.y + yOffset);
                // console.log(`
                //     ====================================
                //     Aoe Scale ${scale} | Sensor Scale ${this.sensor?.scale.x}
                //     ====================================
                // `);
                // if (this.sensor) {
                    // Body.scale(this.sensor, 1 + scaleIncrement / scale);
                // }
                count++;
            },
            callbackScope: this,
            repeat: repeatCount
        });
    };

    protected setupBaseListener(conditions: {hitConditions: ListenerCondition[]; blessConditions: ListenerCondition[]; origin?: Enemy | Party;}) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (collision: any) => {
                const { bodyB, gameObjectB } = collision;
                for (const condition of conditions.hitConditions) {
                    if ((gameObjectB?.aoeMask & condition.mask) && condition.filter(gameObjectB)) {
                        if (!this.hit.some(h => h.particleID === gameObjectB.particleID) && bodyB.label === "legs") {
                            this.hit.push(gameObjectB);
                        };
                        break;
                    };
                };
                for (const condition of conditions.blessConditions) {
                    if ((gameObjectB?.aoeMask & condition.mask) && condition.filter(gameObjectB) && bodyB.label === "legs") {
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
            callback: (collision: any) => {
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

    protected setupEnemyListener(origin: Enemy) {
        this.setupBaseListener({
            hitConditions: [
                {
                    mask: ENTITY_FLAGS.PLAYER,
                    filter: (gameObject) => !this.hit.some(h => h.playerID === gameObject.playerID)
                }, {
                    mask: ENTITY_FLAGS.ENEMY | ENTITY_FLAGS.PARTY,
                    filter: (gameObject) => {
                        return !this.hit.some(h => h.enemyID === gameObject.enemyID) && gameObject.enemyID !== origin.enemyID;
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