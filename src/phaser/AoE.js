const { Bodies } = Phaser.Physics.Matter.Matter;

const COLORS = {
    'scream': 0xFF0000,
    'freeze': 0x0000FF,
};

export default class AoE extends Phaser.Physics.Matter.Sprite {
    constructor(scene, type) {
        super(scene.matter.world, scene.player.x, scene.player.y + 6, 'target');
        this.setVisible(false);
        this.setScale(0.375); // 375
        // this.setOrigin(0.5, -1);
        scene.add.existing(this);
        this.glowFilter = this.scene.plugins.get('rexGlowFilterPipeline');
        this.glowFilter.add(this, {
            outerStrength: 1,
            innerStrength: 1,
            glowColor: COLORS[type],
            intensity: 0.25,
            knockout: true,
        });
        this.hit = [];    
        this.setupSensor(scene);
        this.setupListener(scene);
        this.fire(type, scene);
    };
    
    fire = (type, scene) => {
        let scale = 0;
        const timer = scene.time.addEvent({
            delay: 50,
            callback: () => {
                scale += 0.01875;
                this.setScale(scale);
                this.setVisible(true);
                this.setPosition(scene.player.x, scene.player.y + 6);
            },
            callbackScope: this,
            loop: true,
        });
        scene.time.delayedCall(1000, () => {
            this.hit.forEach((target) => {
                scene[type](target.enemyID);
                // console.log('aoe hit in fire callback', target, type);
                this.glowFilter.remove(this);
            });
            timer.destroy(false);
            timer.remove();    
            this.hit = [];
            this.destroy();    
        });
    };

    setupSensor = (scene) => {
        const aoeSensor = Bodies.circle(scene.player.x, scene.player.y + 6, 60, { 
            isSensor: true, label: 'aoeSensor' 
        });
        this.setExistingBody(aoeSensor);
        this.setStatic(true);
        this.sensor = aoeSensor;
    };

    setupListener = (scene) => {
        scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (collision) => {
                const { gameObjectB } = collision;
                if (gameObjectB instanceof Phaser.Physics.Matter.Sprite) {
                    if (gameObjectB.name === 'enemy') {
                        this.hit.push(gameObjectB);    
                    };
                };
            },
            context: scene
        });
    };
};