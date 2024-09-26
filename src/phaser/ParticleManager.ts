import { v4 as uuidv4 } from 'uuid';
import { Game } from '../game/scenes/Game';
import { Underground } from '../game/scenes/Underground';
export const PARTICLES = ['achire', 'earth',  'fire',  'frost', 'hook', 'lightning', 'righteous', 'quor', 'sorcery', 'spooky', 'wild', 'wind'];
const TIME = { quor: 3000, achire: 2000, attack: 1500, hook: 1750, thrust: 1150, posture: 1750, roll: 1500, special: 2000 };
const VELOCITY = { quor: 4.5, achire: 6, attack: 5, hook: 5.5, thrust: 6, posture: 4, roll: 4, special: 5 }; // 7.5 || 9 || 6 || 6
// @ts-ignore
import Player from '../entities/Player';
// @ts-ignore
import Enemy from '../entities/Enemy';
// @ts-ignore
const { Bodies } = Phaser.Physics.Matter.Matter;

function angleTarget(target: Phaser.Math.Vector2): number {
    let angle = 0;
    if (target.x > 0 && target.y < 0) { // Up-Right
        angle += 90 * target.y;
    } else if (target.x < 0 && target.y < 0) { // Up-Left
        angle -= 90 * target.y;
    } else if (target.x > 0 && target.y > 0) { // Down-Right
        angle += 90 * target.y;
    } else if (target.x < 0 && target.y > 0) { // Down-Left
        angle -= 90 * target.y;
    };
    if (target.x > 0) angle += 180;
    return angle;
    
};

export class Particle {
    scene: Game | Underground;
    id: string;
    pID: string;
    action: string;
    effect: Phaser.Physics.Matter.Sprite;
    isParticle: boolean;
    key: string;
    player: Player | Enemy;
    sensorSize: number;
    special: boolean;
    collided: boolean = false;
    success: boolean = false;
    target: Phaser.Math.Vector2;
    timer: Phaser.Time.TimerEvent;
    triggered: boolean = false;
    velocity: number;

    constructor(scene: Game | Underground, action: string, key: string, player: Player | Enemy, special: boolean) {
        const particle = PARTICLES.includes(key);
        const id = uuidv4();
        const idKey = key + '_effect';
        this.scene = scene;
        this.id = id;
        this.pID = player.particleID;
        this.action = action;
        this.effect = this.spriteMaker(this.scene, player, idKey, particle, special); 
        this.isParticle = particle === true;
        this.key = idKey; // particle === true ? idKey : key;
        this.player = player;
        this.sensorSize = this.sensorer(special, action);
        this.special = special;
        this.target = this.setTarget(player, scene, special);
        this.timer = this.setTimer(action, id);
        this.velocity = this.setVelocity(action);
        const effectSensor = Bodies.circle(player.x, player.y, this.sensorSize, { isSensor: true, label: `effectSensor-${id}`}); 
        this.effect.setExistingBody(effectSensor); 
        scene.add.existing(this.effect);
        this.sensorListener(player, effectSensor);
        this.effect.setVisible(true);
        this.effect.setAngle(angleTarget(this.target));
    };

    construct(particle: Particle, action: string, player: Player | Enemy, special: boolean, key: string) {
        const idKey = `${key}_effect`;
        this.action = action
        this.isParticle = PARTICLES.includes(key);
        this.key = idKey;
        this.special = special;
        this.collided = false;
        this.success = false;
        this.target = this.setTarget(player, this.scene, special);
        this.timer = this.setTimer(action, this.id);
        this.triggered = false;
        this.velocity = this.setVelocity(action);
        this.effect.setScale(this.scaler(particle.isParticle, special, this.action));
        this.effect.setTexture(idKey);
        this.effect.setAngle(angleTarget(this.target));
    };
    scaler = (particle: boolean, special: boolean, action: string) => {
        if (particle && !special) {
            return 0.5;
        } else if (action === 'achire') {
            return 0.75;
        } else {
            return 0.6; // 0.75
        };
    };
    sensorer = (special: boolean, action: string): number => {
        return !special ? 6 : action === 'achire' ? 9 : 16;
    };
    sensorListener = (player: Player | Enemy, sensor: any) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [sensor],
            callback: (other: any) => {
                if (other.gameObjectB?.properties?.wall === true) {
                    this.collided = true;
                    return;
                };
                if (other.bodyB.label === 'enemyCollider' && other.gameObjectB && player.particleEffect && other.gameObjectB.name === 'enemy' && player.name === 'player') { // !other.gameObjectB.isDefeated, && other.gameObjectB.health > 0 
                    player.attackedTarget = other.gameObjectB;
                    player.particleEffect.success = true;
                };
                if (other.bodyB.label === 'playerCollider' && other.gameObjectB && player.particleEffect && other.gameObjectB.name === 'player' && player.name === 'enemy' && !other.gameObjectB.isProtecting && !other.gameObjectB.isImpermanent) {
                    player.particleEffect.success = true;
                };
            },
            context: this.scene,
        });
    };

    setTarget(player: Player | Enemy, scene: Game | Underground, special = false): Phaser.Math.Vector2 {
        if (player.name === 'enemy') {
            const target = new Phaser.Math.Vector2(player.attacking.body.position.x, player.attacking.body.position.y);
            const direction = target.subtract(player.position);
            direction.normalize();
            return direction;
        } else {
            if (scene.settings.difficulty.aim === true || !player.currentTarget || special === true) {
                const target = scene.getWorldPointer();
                const direction = target.subtract(player.position);
                direction.normalize();
                return direction;
            } else {
                const target = new Phaser.Math.Vector2(player.currentTarget.body.position.x, player.currentTarget.body.position.y);
                const direction = target.subtract(player.position);
                direction.normalize();
                return direction;
            };
        };
    };

    setTimer(action: string, id: string): Phaser.Time.TimerEvent {
        return this.scene.time.delayedCall(TIME[action as keyof typeof TIME], () => {
            this.scene.particleManager.removeEffect(id);
        }, undefined, this);
    };

    setVelocity(action: string): number {
        return VELOCITY[action as keyof typeof VELOCITY];
    };

    spriteMaker(scene: Game | Underground, player: Player | Enemy, key: string, particle: boolean, special: boolean): Phaser.Physics.Matter.Sprite {
        return new Phaser.Physics.Matter.Sprite(scene.matter.world, player.x, player.y, key)
            .setScale(this.scaler(particle, special, this.action))
            .setOrigin(0.5, 0.5).setDepth(player.depth + 1).setVisible(false);    
    };
};

export default class ParticleManager extends Phaser.Scene { 
    context: Game | Underground;
    particles: Particle[];

    static preload(scene: Phaser.Scene) {
        scene.load.image('arrow_effect', '../assets/gui/arrow_effect.png');
        scene.load.atlas('earth_effect', '../assets/gui/earth_effect.png', '../assets/gui/earth_json.json');
        scene.load.animation('earth_anim', '../assets/gui/earth_anim.json');
        scene.load.atlas('fire_effect', '../assets/gui/fire_effect.png', '../assets/gui/fire_json.json');
        scene.load.animation('fire_anim', '../assets/gui/fire_anim.json');
        scene.load.atlas('frost_effect', '../assets/gui/frost_effect.png', '../assets/gui/frost_json.json');
        scene.load.animation('frost_anim', '../assets/gui/frost_anim.json');
        scene.load.atlas('hook_effect', '../assets/gui/hook_effect.png', '../assets/gui/hook_atlas.json');
        scene.load.animation('hook_anim', '../assets/gui/hook_anim.json');
        scene.load.atlas('lightning_effect', '../assets/gui/lightning_effect.png', '../assets/gui/lightning_json.json');
        scene.load.animation('lightning_anim', '../assets/gui/lightning_anim.json');
        scene.load.atlas('wind_effect', '../assets/gui/wind_effect.png', '../assets/gui/wind_json.json');
        scene.load.animation('wind_anim', '../assets/gui/wind_anim.json');
        scene.load.atlas('wild_effect', '../assets/gui/wild_effect.png', '../assets/gui/wild_json.json');
        scene.load.animation('wild_anim', '../assets/gui/wild_anim.json');
        scene.load.atlas('sorcery_effect', '../assets/gui/sorcery_effect.png', '../assets/gui/sorcery_json.json');
        scene.load.animation('sorcery_anim', '../assets/gui/sorcery_anim.json');
        scene.load.atlas('righteous_effect', '../assets/gui/righteous_effect.png', '../assets/gui/righteous_json.json');
        scene.load.animation('righteous_anim', '../assets/gui/righteous_anim.json');
        scene.load.atlas('spooky_effect', '../assets/gui/spooky_effect.png', '../assets/gui/spooky_json.json');
        scene.load.animation('spooky_anim', '../assets/gui/spooky_anim.json');
        scene.load.atlas('achire_effect', '../assets/gui/achire_effect.png', '../assets/gui/achire_atlas.json');
        scene.load.animation('achire_anim', '../assets/gui/achire_anim.json');
        scene.load.atlas('quor_effect', '../assets/gui/quor_effect.png', '../assets/gui/quor_atlas.json');
        scene.load.animation('quor_anim', '../assets/gui/quor_anim.json');
    };

    constructor(scene: Game | Underground) {
        super('particle_effects'); // scene.matter.world, 0, 0, 
        this.context = scene; 
        this.particles = []; 
    };  

    despawnEffect(particle: Particle) {
        particle.effect.setVelocity(0);
        particle.effect.setActive(false);
        particle.effect.setVisible(false);
        particle.effect.world.remove(particle.effect.body!);
    };

    spawnEffect(particle: Particle) {
        particle.effect.setActive(true);
        particle.effect.setVisible(true);
        particle.effect.setPosition(particle.player.x, particle.player.y);
        particle.effect.world.add(particle.effect.body!);
    };

    addEffect(action: string, player: Player | Enemy, key: string, special = false) {
        let particle = this.particles.find((particle) => particle.effect?.active === false && particle.pID === player.particleID && particle.key === key);
        if (particle) {
            particle.construct(particle, action, player, special, key);
            this.spawnEffect(particle);
        } else {
            particle = new Particle(this.context, action, key, player, special); 
            this.particles.push(particle);
        };
        return particle;
    };

    getEffect(id: string) {
        return this.particles.find(particle => particle.id === id);
    };

    removeEffect(id: string) {
        this.stopEffect(id);
        let particle = this.particles.find(particle => particle.id === id);
        if (particle) {
            this.despawnEffect(particle);
        };
    };

    stopEffect(id: string) {
        let particle = this.particles.find(particle => particle.id === id);
        if (!particle) return;
        particle.effect.setActive(false);
        particle.effect.setVisible(false);
        particle.effect.world.remove(particle.effect.body!);
        particle.effect.stop();
    };

    updateParticle(particle: Particle) { 
        if (particle == undefined || particle.effect == undefined || !this.particles.find((part) => part.id === particle.id)) return;
        if (particle.isParticle === true) particle.effect.play(particle.key, true);
        particle.effect.setVelocity(particle.velocity * particle.target.x, particle.target.y * particle.velocity);
    };
};