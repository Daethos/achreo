const { Bodies } = Phaser.Physics.Matter.Matter;

const COLORS = {
    'achire': 0x00FFFF,
    'astrave': 0xFFFF00,
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
};

export default class AoE extends Phaser.Physics.Matter.Sprite {
    constructor(scene, type, count = 1, positive = false, enemy = undefined, manual = false) {
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
        if (enemy !== undefined) {
            this.setupEnemySensor(enemy);
            this.setupEnemyListener(scene);
            this.setEnemyTimer(scene, enemy);
            this.setupEnemyCount(scene, type, positive, enemy);
        } else {
            this.setupSensor(scene, manual);
            this.setupListener(scene);
            this.setTimer(scene, manual);
            this.setCount(scene, type, positive);
        };
    };

    setCount = (scene, type, positive) => {
        if (type === 'fyerus') {
            if (scene.player.isMoving) {
                this.glowFilter.remove(this);
                this.bless = [];
                this.timer.destroy();
                this.timer.remove(false);
                this.timer = undefined;
                this.destroy();
                return;
            };
        };
        if (positive === true) {
            scene.time.delayedCall(950, () => {
                this.bless.forEach((_target) => {
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
            scene.time.delayedCall(950, () => {
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

    setupEnemyCount = (scene, type, positive, enemy) => {
        if (positive === true) {
            scene.time.delayedCall(950, () => {
                this.hit.forEach((target) => {
                    if (this.scene.player.checkPlayerResist() === true && target.playerID === this.scene.player.playerID) {
                        scene[type](target.playerID, enemy.enemyID);
                    };
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
                    this.setupEnemyCount(scene, type, positive);
                };
            });
        } else {
            scene.time.delayedCall(950, () => {
                this.bless.forEach((target) => {
                    scene[`enemy${type.charAt(0).toUpperCase() + type.slice(1)}`](target.enemyID);
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
                    this.setupEnemyCount(scene, type);
                };
            });
        };
    };

    setEnemyTimer = (scene, enemy) => {
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
                    this.setPosition(enemy.x, enemy.y + 6);
                };
                count++;
            },
            callbackScope: this,
            loop: 20,
        });
    };
    
    setTimer = (scene, manual) => {
        let scale = 0;
        let count = 0;
        const target = manual === true ? scene.getWorldPointer() : scene.player;
        const y = manual === true ? target.y : target.y + 6;
        this.timer = scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (count >= 20) return;
                if (this && this.timer) {
                    scale += 0.01875;
                    this.setScale(scale);
                    this.setVisible(true);
                    this.setPosition(target.x, y);
                };
                count++;
            },
            callbackScope: this,
            loop: 20,
        });
    };

    setupEnemySensor = (enemy) => {
        const aoeSensor = Bodies.circle(enemy.x, enemy.y, 60, { 
            isSensor: true, label: 'aoeSensor' 
        });
        this.setExistingBody(aoeSensor);
        this.setStatic(true);
        this.sensor = aoeSensor;
    };

    setupSensor = (scene, manual) => {
        let target;
        if (manual) {
            target = scene.getWorldPointer();
        } else {
            target = scene.player;
        };
        const y = manual === true ? target.y : target.y + 6;

        const aoeSensor = Bodies.circle(target.x, y, 60, { 
            isSensor: true, label: 'aoeSensor' 
        });
        this.setExistingBody(aoeSensor);
        this.setStatic(true);
        this.sensor = aoeSensor;
    };

    setupEnemyListener = (scene) => {
        scene.matterCollision.addOnCollideStart({
            objectA: [this.sensor],
            callback: (collision) => {
                const { gameObjectB, bodyB } = collision;
                if (gameObjectB instanceof Phaser.Physics.Matter.Sprite) {
                    if (gameObjectB.name === 'player' && bodyB.label === 'playerCollider') {
                        const hit = this.hit.find((h) => h.playerID === gameObjectB.playerID);
                        if (!hit) this.hit.push(gameObjectB);
                    } else if (gameObjectB.name === 'enemy' && bodyB.label === 'enemyCollider') {
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
                    if (gameObjectB.name === 'player' && bodyB.label === 'playerCollider') {
                        this.hit = this.hit.filter((target) => target === gameObjectB);
                    } else if (gameObjectB.name === 'enemy' && bodyB.label === 'enemyCollider') {
                        this.bless = this.bless.filter((target) => target === gameObjectB);
                    };
                };
            },
            context: scene
        });
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