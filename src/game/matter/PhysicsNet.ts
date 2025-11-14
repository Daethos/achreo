import Enemy from "../entities/Enemy";
import { FRAMES } from "../entities/Entity";
import { Play } from "../main";
import { ENTITY_FLAGS } from "../phaser/Collision";

// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;

export class PhysicsNet {
    public bodies: MatterJS.BodyType[] = [];
    public constraints: MatterJS.ConstraintType[] = [];
    public isDeployed: boolean = false;
    public capturedBodies: MatterJS.BodyType[] = [];
    public capturedEnemies: Enemy[] = [];
    private captureConstraints: MatterJS.ConstraintType[] = [];
    private graphics!: Phaser.GameObjects.Graphics;
    private tether!: Phaser.GameObjects.Graphics;
    public sprites: Phaser.GameObjects.Arc[] = [];
    public sensorSprite!: Phaser.Physics.Matter.Sprite;
    private sensor: MatterJS.BodyType;
    private tetherPoints: number[] = [0, 3, 6, 9];
    private tetherLength: number = 75;
    private tetherStrength: number = 0.0005;
    private scene: Play;

    constructor(scene: Play) {
        this.scene = scene;
    };

    create(center: Phaser.Math.Vector2, radius: number = 15, segmentCount: number = 12): this {
        // Create graphics for drawing constraint lines
        this.graphics = this.scene.add.graphics();
        this.tether = this.scene.add.graphics();
        
        // Create circular arrangement of bodies
        for (let i = 0; i < segmentCount; i++) {
            const angle = (i / segmentCount) * Math.PI * 2;
            const x = center.x + Math.cos(angle) * radius;
            const y = center.y + Math.sin(angle) * radius;

            // console.log(`Creating net body ${i} at:`, { x, y });

            const body = this.scene.matter.add.circle(x, y, 2, {
                collisionFilter: {
                    category: ENTITY_FLAGS.WORLD,
                    mask: 4294967295
                },
                render: { 
                    lineColor: 0x8B0000, // Bright red for visibility
                    lineThickness: 1,
                    fillColor: 0xfdf6d8,
                    fillOpacity: 1,
                    visible: true
                },
                density: 0.005,
                frictionAir: 0.7,
                ignoreGravity: true,
                friction: 0.7,
                restitution: 0.3,
            });

            if (!body) {
                console.error(`Failed to create net body ${i}`);
                continue;
            };

            const sprite = this.scene.add.circle(x, y, 1, 0x8B0000, 1);
            this.sprites.push(sprite);
            this.bodies.push(body);
        };

        // console.log(`Created ${this.bodies.length} net bodies`);

        // Connect each body to its neighbors (circular constraints)
        for (let i = 0; i < segmentCount; i++) {
            const nextIndex = (i + 1) % segmentCount;
            
            // Calculate the actual straight-line distance between adjacent points
            const pointA = this.bodies[i].position;
            const pointB = this.bodies[nextIndex].position;
            const distance = Phaser.Math.Distance.Between(pointA.x, pointA.y, pointB.x, pointB.y);
            
            const constraint = this.scene.matter.add.constraint(
                this.bodies[i],
                this.bodies[nextIndex],
                distance, // Use actual calculated distance, not arc length
                0.1, // Increased stiffness - make it less stretchy
                {
                    render: { 
                        lineThickness: 1, 
                        lineColor: 0xfdf6d8, // Bright green to see constraints
                        visible: true    
                    }
                }
            );

            this.constraints.push(constraint);
        };

        // Add cross-constraints for stability
        for (let i = 0; i < segmentCount / 2; i++) {
            const oppositeIndex = (i + segmentCount / 2) % segmentCount;
            
            // Calculate actual distance for cross constraints too
            const pointA = this.bodies[i].position;
            const pointB = this.bodies[oppositeIndex].position;
            const crossDistance = Phaser.Math.Distance.Between(pointA.x, pointA.y, pointB.x, pointB.y);
            
            const crossConstraint = this.scene.matter.add.constraint(
                this.bodies[i],
                this.bodies[oppositeIndex],
                crossDistance, // Actual diameter distance
                0.1, // Softer stiffness for cross constraints
                {
                    render: { 
                        lineThickness: 1, 
                        lineColor: 0x8B0000, // Red for cross constraints
                        visible: true
                    }
                }
            );
            this.constraints.push(crossConstraint);
        };

        this.sensorSprite = this.scene.matter.add.sprite(center.x, center.y, '', undefined, {
            isSensor: true,
            label: "netSensor",
            collisionFilter: {
                category: ENTITY_FLAGS.WORLD,
                mask: ENTITY_FLAGS.DEFEATED_ENEMY
            }
        });
        this.sensorSprite.setAlpha(0);
        this.sensor = this.scene.matter.bodies.circle(center.x, center.y, radius * 1.2, {
            isSensor: true,
            collisionFilter: {
                group: 0,
                category: ENTITY_FLAGS.WORLD,
                mask: ENTITY_FLAGS.DEFEATED_ENEMY
            }
        });
        this.sensorSprite.setExistingBody(this.sensor);
        this.setupSensor(this.sensor);
        this.scene.events.on("update", this.update, this);
        this.isDeployed = true;

        return this;
    };

    private setupSensor(sensor: MatterJS.BodyType) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [sensor],
            callback: (collision: any) => {
                const { bodyB, gameObjectB } = collision;
                if (bodyB.label === "legs" 
                    && gameObjectB.name === "enemy" 
                    && gameObjectB.isDefeated 
                    && !gameObjectB.isNetted
                ) {
                    this.captureEnemy(bodyB, gameObjectB);
                };
            },
            context: this.scene
        });
    };

    private captureEnemy(body: MatterJS.BodyType, enemy: Enemy): void {
        if (this.capturedBodies.includes(body)) return;
        enemy.anims.play({
            key: FRAMES.GRAPPLE_ROLL,
            frameRate: 12,
            repeat: 2
        }, true);
        enemy.spriteWeapon.setVisible(false);
        enemy.isNetted = true;
        enemy.setStatic(false);

        this.capturedBodies.push(body);
        this.capturedEnemies.push(enemy);
        this.scene.matter.body.setMass(body, 0.001);
        
        this.attachEnemyToNet(body);
    };

    private attachEnemyToNet(enemyBody: MatterJS.BodyType): void {
        const closestBodies = this.getClosestBodies(enemyBody, 3);
        
        closestBodies.forEach((netBody, _index) => {
            const distance = Phaser.Math.Distance.Between(
                netBody.position.x, netBody.position.y,
                enemyBody.position.x, enemyBody.position.y
            );
            
            const constraint = this.scene.matter.add.constraint(
                netBody,
                enemyBody,
                distance * 1.2,
                0.4, // Stiffer constraints
                {
                    damping: 0.4,
                    render: {
                        lineColor: 0xff0000,
                        lineThickness: 1,
                        visible: true
                    }
                }
            );
            
            this.captureConstraints.push(constraint);
        });
    };

    private getClosestBodies(targetBody: MatterJS.BodyType, count: number): MatterJS.BodyType[] {
        return this.bodies
            .map(netBody => ({
                body: netBody,
                distance: Phaser.Math.Distance.Between(
                    netBody.position.x, netBody.position.y,
                    targetBody.position.x, targetBody.position.y
                )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, count)
            .map(item => item.body);
    };

    private updateCapturedBodies(): void {
        if (this.capturedEnemies.length === 0) return;
        const netCenter = this.getCenter();
        for (let i = 0; i < this.capturedEnemies.length; ++i) {
            const enemy = this.capturedEnemies[i];
            enemy.setPosition(netCenter.x , netCenter.y - 15);
        };
    };

    drag(dragPoint: Phaser.Math.Vector2, strength: number = 0.01): void {
        if (!this.isDeployed) return;

        this.bodies.forEach(body => {
            const direction = new Phaser.Math.Vector2(
                dragPoint.x - body.position.x,
                dragPoint.y - body.position.y
            );
            
            const distance = direction.length();
            if (distance === 0) return;

            direction.normalize();

            // Apply force - stronger for farther bodies to maintain net shape
            this.scene.matter.body.applyForce(body, body.position, {
                x: direction.x * strength * distance,
                y: direction.y * strength * distance
            });
        });
    };

    captureBody(body: MatterJS.BodyType): void {
        if (this.capturedBodies.includes(body)) return;

        this.capturedBodies.push(body);
        
        // Make captured body lighter
        this.scene.matter.body.setMass(body, body.mass * 0.1);
        
        // Add soft constraints to keep body centered in net
        this.bodies.forEach(netBody => {
        const constraint = this.scene.matter.add.constraint(
            netBody,
            body,
            10, // Length
            0.2, // Stiffness
            {
                render: {
                    lineColor: 0xff0000,
                    lineThickness: 1,
                    visible: true
                }
            }
        );
        
        this.constraints.push(constraint);
        });
    };
    
    private getCenter(): Phaser.Math.Vector2 {
        if (this.bodies.length === 0) {
            return new Phaser.Math.Vector2(0, 0);
        };

        let totalX = 0;
        let totalY = 0;
        
        this.bodies.forEach(body => {
            totalX += body.position.x;
            totalY += body.position.y;
        });
        
        return new Phaser.Math.Vector2(
            totalX / this.bodies.length,
            totalY / this.bodies.length
        );
    };
    
    private drawConstraints(): void {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xfdf6d8);
        this.graphics.setDepth(5);
        this.constraints.forEach(constraint => {
            if (constraint.bodyA && constraint.bodyB) {
                this.graphics.lineBetween(
                    constraint.bodyA.position.x,
                    constraint.bodyA.position.y,
                    constraint.bodyB.position.x,
                    constraint.bodyB.position.y
                );
            };
        });

        this.tether.clear();
        this.tether.lineStyle(2, 0x8B4513);
        const player = this.scene.player;
        const yAdjust = (player.isRolling || player.isDodging) ? 20 : 0; 
        const y = player.position.y + yAdjust
        this.tether.lineStyle(2, 0x8B4513);
        this.tether.setDepth(player.depth - 1);
        this.tetherPoints.forEach(bodyIndex => {
            if (bodyIndex < this.bodies.length) {
                this.tether.lineBetween(
                    this.scene.player.body.position.x,
                    y,
                    this.bodies[bodyIndex].position.x,
                    this.bodies[bodyIndex].position.y
                );
            };
        });
    };

    private applyManualTetherForces(): void {
        this.tetherPoints.forEach(bodyIndex => {
            if (bodyIndex >= this.bodies.length) return;
            const player = this.scene.player;
            const net = this.bodies[bodyIndex];
            const body = player.body;

            const distance = Phaser.Math.Distance.Between(
                body.position.x, body.position.y,
                net.position.x, net.position.y
            );

            // EMERGENCY: If net is way too far, teleport it back
            if (distance > this.tetherLength * 1.5) {
                this.scene.matter.body.setPosition(net, {
                    x: body.position.x + (Math.random() * 20 - 10),
                    y: body.position.y + (Math.random() * 20 - 10)
                });
                this.scene.matter.body.setVelocity(net, {
                    x: body.velocity.x * 0.5,
                    y: body.velocity.y * 0.5
                });
                return;
            };

            // Normal force application for reasonable distances
            if (distance > this.tetherLength * 1.1) {
                const stretch = distance - this.tetherLength;
                const force = Math.min(
                    this.tetherStrength * Math.sqrt(stretch),
                    0.001 // Conservative force cap
                );

                const direction = new Phaser.Math.Vector2(
                    body.position.x - net.position.x,
                    body.position.y - net.position.y
                ).normalize();

                this.applySmoothedForce(net, direction, force);
            };
        });
    };

    // private applyManualTetherForces(): void {
    //     this.tetherPoints.forEach(bodyIndex => {
    //         if (bodyIndex >= this.bodies.length) return;
    //         const player = this.scene.player;
    //         const net = this.bodies[bodyIndex];
    //         const body = player.body;

    //         const distance = Phaser.Math.Distance.Between(
    //             body.position.x, body.position.y,
    //             net.position.x, net.position.y
    //         );

    //         // Only apply force if significantly stretched AND moving
    //         if (distance > this.tetherLength * 1.1) { // 10% stretch threshold
    //             const stretch = distance - this.tetherLength;
    //             const force = this.tetherStrength * stretch;

    //             const direction = new Phaser.Math.Vector2(
    //                 body.position.x - net.position.x,
    //                 body.position.y - net.position.y
    //             ).normalize();

    //             // SMOOTHING: Apply force with some smoothing
    //             this.applySmoothedForce(net, direction, force);
    //         };
    //     });
    // };

    private applySmoothedForce(body: MatterJS.BodyType, direction: Phaser.Math.Vector2, force: number): void {
        const smoothedForce = {
            x: direction.x * force, // Reduced immediate effect
            y: direction.y * force
        };

        this.scene.matter.body.applyForce(body, body.position, smoothedForce);
    };

    private killTinyMovements(): void {
        const playerBody = this.scene.player.body;
        
        if (Math.abs(playerBody.velocity.x) < 0.1 && Math.abs(playerBody.velocity.y) < 0.1) {
            this.scene.matter.body.setVelocity(playerBody, { x: 0, y: 0 });
        };

        this.bodies.forEach(body => {
            if (Math.abs(body.velocity.x) < 0.1 && Math.abs(body.velocity.y) < 0.1) {
                this.scene.matter.body.setVelocity(body, { x: 0, y: 0 });
            }
            this.scene.matter.body.setAngularVelocity(body, 0);
        });
    };

    destroy(): void {
        // Clean up capture constraints
        this.captureConstraints.forEach(constraint => {
            this.scene.matter.world.removeConstraint(constraint);
        });
        this.captureConstraints = [];
        
        // Reset captured enemies
        this.capturedBodies.forEach(body => {
            // You might want to restore enemy properties here
            this.scene.matter.body.setMass(body, body.mass * 10); // Restore mass
        });
        this.capturedBodies = [];
        
        this.capturedEnemies.forEach(enemy => {
            enemy.isNetted = false;
            enemy.anims.play({
                key: FRAMES.DEATH,
                frameRate: 12,
                repeat: 0,
            }, true);
            enemy.spriteWeapon.setVisible(true);
            enemy.setStatic(true);
        });
        
        // Remove update listener
        this.scene.events.off('update', this.update, this);
        this.scene.matter.world.remove(this.sensorSprite);
        this.scene.matterCollision.removeOnCollideStart({ objectA: [this.sensor] });

        // Destroy all sprites
        this.sprites.forEach(sprite => sprite.destroy());
        this.sprites = [];

        // Destroy graphics
        if (this.graphics) {
            this.graphics.destroy();
        };

        
        if (this.tether) {
            this.tether.destroy();
        };

        const { world } = this.scene.matter;
        this.constraints.forEach(constraint => world.removeConstraint(constraint));
        this.bodies.forEach(body => world.remove(body));
        
        this.bodies = [];
        this.constraints = [];
        this.capturedBodies = [];
        this.isDeployed = false;
    };

    update(): void {
        for (let i = 0; i < this.bodies.length; i++) {
            const sprite = this.sprites[i];
            if (sprite && this.bodies[i]) {
                sprite.setPosition(
                    this.bodies[i].position.x, 
                    this.bodies[i].position.y
                );
                sprite.setDepth(5);
            };
        };
        
        this.drawConstraints();

        const center = this.getCenter();
        this.sensorSprite.setPosition(center.x, center.y);

        this.applyManualTetherForces();
        this.killTinyMovements();
        this.updateCapturedBodies();
    };
};