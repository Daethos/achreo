const { Bodies } = Phaser.Physics.Matter.Matter;

const COLORS = {
    'chiomic': 0xFFC700,
    'freeze': 0x0000FF,
    'howl': 0xFF0000,
    'renewal': 0xFDF6D8,
    'scream': 0xFF00FF,
    'shock': 0x00FFFF,
    'tendril': 0x00FF00,
    'writhe': 0x080080,
};

export default class AoE extends Phaser.Physics.Matter.Sprite {
    constructor(scene, type, count = 1, positive = false) {
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
        this.bless = [];
        this.timer = undefined;    
        this.setupSensor(scene);
        this.setupListener(scene);
        this.setTimer(scene);
        this.setCount(scene, type, positive);
    };

    setCount = (scene, type, positive) => {
        if (positive === true) {
            scene.time.delayedCall(1000, () => {
                this.bless.forEach((target) => {
                    scene[type]();
                });
                this.count -= 1;
                if (this.count === 0) {
                    this.glowFilter.remove(this);
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
        };
    };
    
    setTimer = (scene) => {
        let scale = 0;
        let count = 0;
        this.timer = scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= 20) return;
                if (this && this.timer) {
                    scale += 0.01875;
                    this.setScale(scale);
                    this.setVisible(true);
                    this.setPosition(scene.player.x, scene.player.y + 6);
                };
                count++;
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
                const { gameObjectB, bodyB } = collision;
                if (gameObjectB instanceof Phaser.Physics.Matter.Sprite) {
                    if (gameObjectB.name === 'enemy' && bodyB.label === 'enemyCollider') {
                        this.hit.push(gameObjectB);    
                    } else if (gameObjectB.name === 'player' && bodyB.label === 'playerCollider') {
                        this.bless.push(gameObjectB);
                    };
                };
            },
            context: scene
        });
        scene.matterCollision.addOnCollideEnd({
            objectA: [this.sensor],
            callback: (collision) => {
                const { gameObjectB, bodyB } = collision;
                if (gameObjectB instanceof Phaser.Physics.Matter.Sprite) {
                    if (gameObjectB.name === 'enemy' && bodyB.label === 'enemyCollider') {
                        this.hit = this.hit.filter((target) => target.enemyID !== gameObjectB.enemyID);
                    } else if (gameObjectB.name === 'player' && bodyB.label === 'playerCollider') {
                        this.bless = this.bless.filter((target) => target === gameObjectB);
                    };
                };
            },
            context: scene
        });
    };
};