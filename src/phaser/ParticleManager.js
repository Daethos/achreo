import Phaser from 'phaser'; 
import { v4 as uuidv4 } from 'uuid';

export const PARTICLES = ['arrow', 'earth',  'fire',  'frost',  'lightning', 'righteous', 'sorcery', 'spooky', 'wild', 'wind'];

function angleTarget(target) {
    let angle = 0;
    if (target.x > 0) {
        if (target.y > 0) { angle = 90; } else { angle = 0; };
    } else {
        if (target.y > 0) { angle = 180; } else { angle = 270 };
    };
    return angle;
};

class Particle {
    constructor(scene, action, key, player, special) {
        const particle = PARTICLES.includes(key);
        const id = uuidv4();
        this.scene = scene;
        this.id = id;
        this.action = action;
        this.effect = this.spriteMaker(this.scene, player, particle === true ? key + '_effect' : key, particle, special); 
        this.isParticle = particle === true;
        this.key = particle === true ? key + '_effect' : key;
        this.sensorSize = special === false ? 6 : 12;
        this.special = special;
        this.success = false;
        this.target = this.setTarget(player, scene, special);
        this.timer = this.setTimer(action, id);
        this.triggered = false;
        this.velocity = this.setVelocity(action);
        const { Bodies } = Phaser.Physics.Matter.Matter;
        const effectSensor = Bodies.circle(player.x, player.y, this.sensorSize, { isSensor: true, label: `effectSensor-${id}`}); 
        this.effect.setExistingBody(effectSensor); 
        scene.add.existing(this.effect);
        this.sensorListener(player, effectSensor);
    };

    sensorListener = (player, sensor) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [sensor],
            callback: (other) => {
                if (other.gameObjectB && player.particleEffect && other.gameObjectB.name === 'enemy' && !other.gameObjectB.isDefeated && player.name === 'player') {
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

                    if (other.gameObjectB?.isMalicing && !player.isAstrifying) {
                        other.gameObjectB?.maliceHit();
                    };
                    if (other.gameObjectB?.isMending && !player.isAstrifying) {
                        other.gameObjectB?.mendHit();
                    };

                    const match = this.scene.state?.enemyID === other.gameObjectB.enemyID;
                    player.attackedTarget = other.gameObjectB;
                    
                    if (match === true) {
                        this.scene.combatMachine.action({ type: 'Weapon', data: { key: 'action', value: this.action }});
                    } else {
                        this.scene.combatMachine.action({ type: 'Player', data: { 
                            playerAction: { 
                                action: this.action, 
                                parry: this.scene.state.parryGuess 
                            },  
                            enemyID: other.gameObjectB.enemyID, 
                            ascean: other.gameObjectB.ascean, 
                            damageType: other.gameObjectB.currentDamageType, 
                            combatStats: other.gameObjectB.combatStats, 
                            weapons: other.gameObjectB.weapons, 
                            health: other.gameObjectB.health, 
                            actionData: { 
                                action: other.gameObjectB.currentAction, 
                                parry: other.gameObjectB.parryAction 
                            },
                        }});
                    };
                    player.particleEffect.success = true;
                };
                if (other.gameObjectB && player.particleEffect && other.gameObjectB.name === 'player' && player.name === 'enemy' && !other.gameObjectB.isProtecting && !other.gameObjectB.isImpermanent) {
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
        const time = { achire: 1500, attack: 1500, counter: 1000, posture: 1750, roll: 1250 };
        this.scene.time.addEvent({
            delay: time[action],
            callback: () => {
                this.scene.particleManager.removeEffect(id);
            },
            callbackScope: this.scene,
            loop: false,
        })
    };

    setVelocity(action) {
        const velocity = { achire: 5, attack: 4, counter: 6, posture: 3, roll: 3, special: 5 }; // 7.5 || 9 || 6 || 6
        return velocity[action];
    };

    spriteMaker(scene, player, key, particle, special) {
        return new Phaser.Physics.Matter.Sprite(scene.matter.world, player.x, player.y, key).setScale(particle === true && special === false ? 0.3 : 1).setOrigin(0.5, 0.5).setDepth(player.depth + 1).setVisible(false);    
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
    };

    constructor(scene) {
        super(scene.matter.world, 0, 0, 'particle_effects');
        this.scene = scene; 
        this.particles = []; 
    };  

    addEffect(action, player, key, special = false) {
        const newParticle = new Particle(this.scene, action, key, player, special); 
        this.particles.push(newParticle);
        return newParticle;
    };

    getEffect(id) {
        return this.particles.find(particle => particle.id === id);
    };

    removeEffect(id) {
        this.stopEffect(id);
        let particle = this.particles.find(particle => particle.id === id);
        if (particle) {
            particle.effect.destroy();
            this.particles = this.particles.filter(particle => particle.id !== id);
        };
    };

    startEffect(player, id) {
        let particle = this.particles.find(particle => particle.id === id);
        if (particle) {
            const direction = player.flipX ? -1 : 1;
            particle.effect.play(particle.key, true);
            particle.setVelocity(7 * direction, 0);
        };
    };

    stopEffect(id) {
        let particle = this.particles.find(particle => particle.id === id);
        if (particle) {
            particle.effect.setVisible(false);
            particle.effect.stop();
        };
    };

    update(player) { 
        if (!player.particleEffect) return;
        if (!player.particleEffect.effect.visible) player.particleEffect.effect.setVisible(true); 
        if (!player.flipX && !player.particleEffect.effect.flipX && player.particleEffect.isParticle === true) player.particleEffect.effect.flipX = true;
        if (player.particleEffect && player.particleEffect.effect && this.particles.find((particle) => particle.id === player.particleEffect.id)) {
            if (player.particleEffect.isParticle === true) {
                player.particleEffect.effect.play(player.particleEffect.key, true);
            } else {
                player.particleEffect.effect.setAngle(angleTarget(player.particleEffect.target));
            };
            const target = player.particleEffect.target;
            player.particleEffect.effect.setVelocity(player.particleEffect.velocity * target.x, target.y * player.particleEffect.velocity);
        };
    };
};