import { v4 as uuidv4 } from 'uuid';
export const PARTICLES = ['achire', 'arrow', 'earth',  'fire',  'frost', 'hook', 'lightning', 'righteous', 'quor', 'sorcery', 'spooky', 'wild', 'wind'];
const TIME = { quor: 2500, achire: 1500, attack: 1250, hook: 1500, thrust: 900, posture: 1500, roll: 1250, special: 1500 };
const VELOCITY = { quor: 4.5, achire: 6, attack: 5, hook: 5.5, thrust: 6, posture: 4, roll: 4, special: 5 }; // 7.5 || 9 || 6 || 6
const { Bodies } = Phaser.Physics.Matter.Matter;

function angleTarget(x, y) {
    if (x > 0) {
        if (y > 0) { return 90; } else { return 0; };
    } else {
        if (y > 0) { return 180; } else { return 270 };
    };
};

class Particle {
    constructor(scene, action, key, player, special) {
        const particle = PARTICLES.includes(key);
        const id = uuidv4();
        this.scene = scene;
        this.id = id;
        this.pID = player.particleID;
        this.action = action;
        this.effect = this.spriteMaker(this.scene, player, particle === true ? key + '_effect' : key, particle, special); 
        this.isParticle = particle === true;
        this.key = particle === true ? key + '_effect' : key;
        this.player = player;
        this.sensorSize = this.sensorer(special, action);
        this.special = special;
        this.collided = false;
        this.success = false;
        this.target = this.setTarget(player, scene, special);
        this.timer = this.setTimer(action, id);
        this.triggered = false;
        this.velocity = this.setVelocity(action);
        const effectSensor = Bodies.circle(player.x, player.y, this.sensorSize, { isSensor: true, label: `effectSensor-${id}`}); 
        this.effect.setExistingBody(effectSensor); 
        scene.add.existing(this.effect);
        this.sensorListener(player, effectSensor);
        this.effect.setVisible(true);
        this.effect.flipX = !player.flipX && !this.effect.flipX;
    };

    construct(particle, action, player, special, key) {
        const idKey = PARTICLES.includes(key) ? `${key}_effect` : key;
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
        this.effect.flipX = !player.flipX && !this.effect.flipX;
    };
    scaler = (particle, special, action) => {
        if (particle && !special) {
            return 0.5;
        } else if (action === 'achire') {
            return 0.75;
        } else {
            return 0.6; // 0.75
        };
    };
    sensorer = (special, action) => {
        return !special ? 6 : action === 'achire' ? 9 : 16;
    };
    sensorListener = (player, sensor) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [sensor],
            callback: (other) => {
                if (other.gameObjectB?.properties?.wall === true) {
                    this.collided = true;
                    return;
                };
                if (other.bodyB.label === 'enemyCollider' && other.gameObjectB && player.particleEffect && other.gameObjectB.name === 'enemy' && other.gameObjectB.health > 0 && player.name === 'player') { // !other.gameObjectB.isDefeated
                    if (this.action === 'hook') {
                        player.hook(other.gameObjectB, 1500);
                        player.particleEffect.success = true;
                        return;
                    };
                    if (other.gameObjectB?.isShimmering && !player.isAstrifying) {
                        const shimmer = Phaser.Math.Between(1, 100);
                        if (shimmer > 50) {
                            player.particleEffect.success = true;
                            other.gameObjectB?.shimmerHit();
                            return;
                        };
                    };
                    if ((other.gameObjectB?.isProtecting || other.gameObjectB?.isShielding || other.gameObjectB?.isWarding) && !player.isAstrifying) {
                        if (other.gameObjectB?.isShielding) {
                            other.gameObjectB?.shieldHit();
                        };
                        if (other.gameObjectB?.isWarding) {
                            other.gameObjectB?.wardHit();
                        };
                        player.particleEffect.success = true;
                        return;
                    };
                    if (other.gameObjectB.isMenacing && !player.isAstrifying) other.gameObjectB.menace(); 
                    if (other.gameObjectB.isMultifaring && !player.isAstrifying) other.gameObjectB.multifarious(); 
                    if (other.gameObjectB.isMystifying && !player.isAstrifying) other.gameObjectB.mystify(); 
                    const match = this.scene.state?.enemyID === other.gameObjectB.enemyID;
                    player.attackedTarget = other.gameObjectB;
                    if (match === true) {
                        this.scene.combatManager.combatMachine.action({ type: 'Weapon', data: { key: 'action', value: this.action }});
                    } else {
                        this.scene.combatManager.combatMachine.action({ type: 'Player', data: { 
                            playerAction: { 
                                action: this.action, 
                                thrust: this.scene.state.parryGuess 
                            },  
                            enemyID: player.attackedTarget.enemyID, 
                            ascean: player.attackedTarget.ascean, 
                            damageType: player.attackedTarget.currentDamageType, 
                            combatStats: player.attackedTarget.combatStats, 
                            weapons: player.attackedTarget.weapons, 
                            health: player.attackedTarget.health, 
                            actionData: { 
                                action: player.attackedTarget.currentAction, 
                                thrust: player.attackedTarget.parryAction 
                            },
                        }});
                    };
                    player.particleEffect.success = true;
                };
                if (other.bodyB.label === 'playerCollider' && other.gameObjectB && player.particleEffect && other.gameObjectB.name === 'player' && player.name === 'enemy' && !other.gameObjectB.isProtecting && !other.gameObjectB.isImpermanent) {
                    player.particleEffect.success = true;
                };
            },
            context: this.scene,
        });
    };

    setTarget(player, scene, special = false) {
        if (player.name === 'enemy') {
            const target = new Phaser.Math.Vector2(player.attacking.body.position.x, player.attacking.body.position.y);
            const direction = target.subtract(player.position);
            direction.normalize();
            return direction;
        } else {
            if (scene.settings.difficulty.aim === true || !player.attacking || special === true) {
                const target = scene.getWorldPointer();
                const direction = target.subtract(player.position);
                direction.normalize();
                return direction;
            } else {
                const target = new Phaser.Math.Vector2(player.attacking.body.position.x, player.attacking.body.position.y);
                const direction = target.subtract(player.position);
                direction.normalize();
                return direction;
            };
        };
    };

    setTimer(action, id) {
        this.scene.time.delayedCall(TIME[action], () => {
            this.scene.particleManager.removeEffect(id);
        }, undefined, this);
    };

    setVelocity(action) {
        return VELOCITY[action];
    };

    spriteMaker(scene, player, key, particle, special) {
        return new Phaser.Physics.Matter.Sprite(scene.matter.world, player.x, player.y, key)
            .setScale(this.scaler(particle, special, this.action))
            .setOrigin(0.5, 0.5).setDepth(player.depth + 1).setVisible(false);    
    };
};

export default class ParticleManager extends Phaser.Scene { 
    static preload(scene) {
        scene.load.atlas('arrow_effect', '../assets/gui/arrow_effect.png', '../assets/gui/arrow_effect_atlas.json');
        scene.load.animation('arrow_anim', '../assets/gui/arrow_anim.json');    
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

    constructor(scene) {
        super(scene.matter.world, 0, 0, 'particle_effects');
        this.scene = scene; 
        this.particles = []; 
    };  

    despawnEffect(particle) {
        particle.setVelocity(0);
        particle.effect.setActive(false);
        particle.effect.setVisible(false);
        particle.effect.world.remove(particle.effect.body);
    };

    spawnEffect(particle) {
        particle.effect.setActive(true);
        particle.effect.setVisible(true);
        particle.effect.setPosition(particle.player.x, particle.player.y);
        particle.effect.world.add(particle.effect.body);
    };

    addEffect(action, player, key, special = false) {
        let particle = this.particles.find((particle) => particle.effect?.active === false && particle.pID === player.particleID && particle.key === key);
        if (particle) {
            particle.construct(particle, action, player, special, key);
            this.spawnEffect(particle);
        } else {
            particle = new Particle(this.scene, action, key, player, special); 
            this.particles.push(particle);
        };
        return particle;
    };

    getEffect(id) {
        return this.particles.find(particle => particle.id === id);
    };

    removeEffect(id) {
        this.stopEffect(id);
        let particle = this.particles.find(particle => particle.id === id);
        if (particle) {
            this.despawnEffect(particle);
        };
    };

    stopEffect(id) {
        let particle = this.particles.find(particle => particle.id === id);
        if (!particle) return;
        particle.effect.setActive(false);
        particle.effect.setVisible(false);
        particle.effect.world.remove(particle.effect.body);
        particle.effect.stop();
    };

    update(particle) { 
        if (particle == undefined || particle.effect == undefined || !this.particles.find((part) => part.id === particle.id)) return;
        if (particle.isParticle === true) {
            particle.effect.play(particle.key, true);
        } else {
            particle.effect.setAngle(angleTarget(particle.target.x, particle.target.y));
        };
        particle.effect.setVelocity(particle.velocity * particle.target.x, particle.target.y * particle.velocity);
    };
};