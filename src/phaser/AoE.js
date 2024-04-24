const { Bodies } = Phaser.Physics.Matter.Matter;

const COLORS = {
    'scream': 0xFF0000,
    'freeze': 0x0000FF,
    'tendril': 0x080080,
};

export default class AoE extends Phaser.Physics.Matter.Sprite {
    constructor(scene, type, count = 1) {
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
        this.count = count;
        this.hit = [];
        this.timer = undefined;    
        this.setupSensor(scene);
        this.setupListener(scene);
        this.setTimer(scene);
        this.setCount(scene, type);
    };

    setCount = (scene, type) => {
        scene.time.delayedCall(1000, () => {
            this.hit.forEach((target) => {
                scene[type](target.enemyID);
            });
            this.count -= 1;
            if (this.count === 0) {
                this.glowFilter.remove(this);
                this.hit = [];
                this.timer.destroy();
                this.timer.remove(false);
                this.timer = undefined;
                this.destroy();    
            } else {
                this.setCount(scene, type);
            };
        });

        // scene.time.addEvent({
        //     delay: 1000,
        //     callback: () => {
        //         this.hit.forEach((target) => {
        //             scene[type](target.enemyID);
        //         });
        //     },
        //     callbackScope: this,
        //     loop: this.count,
        // });
    };
    
    setTimer = (scene) => {
        let scale = 0;
        this.timer = scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (this && this.timer) {
                    scale += 0.01875;
                    this.setScale(scale);
                    this.setVisible(true);
                    this.setPosition(scene.player.x, scene.player.y + 6);
                };
            },
            callbackScope: this,
            loop: 20,
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
        scene.matterCollision.addOnCollideEnd({
            objectA: [this.sensor],
            callback: (collision) => {
                const { gameObjectB } = collision;
                if (gameObjectB instanceof Phaser.Physics.Matter.Sprite) {
                    if (gameObjectB.name === 'enemy') {
                        this.hit = this.hit.filter((target) => target.enemyID !== gameObjectB.enemyID);
                    };
                };
            },
            context: scene
        });
    };
};