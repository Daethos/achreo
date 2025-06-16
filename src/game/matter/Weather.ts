import { screenShake } from "../phaser/ScreenShake";
import { Game, OVERLAY_BUFFER } from "../scenes/Game";

const FADE_IN = 2050;
const FADE_OUT = 2000;
const OSCILLATE = 10;
const WEATHER_DURATION = 60000;
type weather = "clear" | "ash" | "celestial" | "fog" | "fog rain" | "fog snow" | "hail" | "meteor" | "rain" | "sand" | "snow" | "thunderash" | "thunderstorm" | "thundersnow";
const phrase = {
    clear: "clear skies",
    ash: "ashfall",
    celestial: "celestial rainfall",
    fog: "a thick fog",
    "fog rain": "foggy rainfall",
    "fog snow": "foggy snowfall",
    hail: "a hailstorm",
    meteor: "a meteor shower",
    "rain": "rainfall",
    sand: "a sandstorm",
    snow: "snowfall",
    thunderash: "thunderash",
    thundersnow: "thundersnow",
    thunderstorm: "a thunderstorm"
};
type WeightedTransition = { type: weather; weight: number };

const weatherTransitions: { [key in weather]: WeightedTransition[] } = {
    clear: [
        { type: "clear", weight: 4 },
        { type: "celestial", weight: 1 },
        { type: "fog", weight: 2 },
        { type: "rain", weight: 2 },
        { type: "snow", weight: 2 }
    ],
    ash: [
        { type: "clear", weight: 2 },
        { type: "ash", weight: 1 },
        { type: "thunderash", weight: 1 }
    ],
    celestial: [
        { type: "clear", weight: 5 },
        { type: "celestial", weight: 1 },
        { type: "meteor", weight: 1 },
        { type: "sand", weight: 1 },
        { type: "thunderash", weight: 1 },
        { type: "thundersnow", weight: 1 },
        { type: "thunderstorm", weight: 1 }
    ],
    fog: [
        { type: "clear", weight: 1 },
        { type: "fog", weight: 1 },
        { type: "fog rain", weight: 1 },
        { type: "fog snow", weight: 1 }
    ],
    "fog rain": [
        { type: "clear", weight: 2 },
        { type: "fog", weight: 1 },
        { type: "fog rain", weight: 2 },
        { type: "fog snow", weight: 1 },
        { type: "rain", weight: 1 },
        { type: "thunderstorm", weight: 1 }
    ],
    "fog snow": [
        { type: "clear", weight: 2 },
        { type: "fog", weight: 1 },
        { type: "fog rain", weight: 1 },
        { type: "fog snow", weight: 2 },
        { type: "snow", weight: 1 },
        { type: "thundersnow", weight: 1 }
    ],
    hail: [
        { type: "clear", weight: 3 },
        { type: "rain", weight: 2 },
        { type: "snow", weight: 1 },
        { type: "thunderstorm", weight: 2 }

    ],
    meteor: [
        { type: "clear", weight: 1 },
    ],
    rain: [
        { type: "clear", weight: 3 },
        { type: "fog rain", weight: 1 },
        { type: "rain", weight: 2 },
        { type: "snow", weight: 1 },
        { type: "thunderstorm", weight: 2 }
    ],
    sand: [
        { type: "clear", weight: 3 },
        { type: "sand", weight: 2 },
        { type: "thunderstorm", weight: 1 }
    ],
    snow: [
        { type: "clear", weight: 3 },
        { type: "fog snow", weight: 1 },
        { type: "rain", weight: 1 },
        { type: "snow", weight: 2 },
        { type: "thundersnow", weight: 2 }
    ],
    thunderash: [
        { type: "clear", weight: 3 },
        { type: "ash", weight: 2 },
        { type: "thunderash", weight: 2 },
        { type: "thundersnow", weight: 1 },
        { type: "thunderstorm", weight: 1 }
    ],
    thundersnow: [
        { type: "clear", weight: 3 },
        { type: "snow", weight: 2 },
        { type: "thunderash", weight: 1 },
        { type: "thundersnow", weight: 2 },
        { type: "thunderstorm", weight: 1 }
    ],
    thunderstorm: [
        { type: "clear", weight: 3 },
        { type: "rain", weight: 2 },
        { type: "thunderash", weight: 1 },
        { type: "thundersnow", weight: 1 },
        { type: "thunderstorm", weight: 2 }
    ],
};

export default class WeatherManager {
    private scene: Game;
    private ashParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private celestialParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private fogParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private hailParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private meteorParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private rainParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private sandParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private snowParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private fogOverlay: Phaser.GameObjects.Rectangle;
    private lightningFlash: Phaser.GameObjects.Rectangle;
    private lightningTimer?: Phaser.Time.TimerEvent;
    private shakeTimer?: Phaser.Time.TimerEvent;
    private currentWeather: weather = "clear";

    constructor(scene: Game) {
        this.scene = scene;
        this.createAshfall();
        this.createCelestialRain();
        this.createRain();
        this.createFog();
        this.createHail();
        this.createLightning();
        this.createMeteors();
        this.createSandstorm();
        this.createSnow();
        this.setupWeatherCycle();
    };

    private createAshfall() {
        const ash = this.scene.make.graphics({ x: 0, y: 0 });
        ash.fillStyle(0x333333, 0.4); // Dark gray
        ash.fillRect(0, 0, 2, 4);
        ash.generateTexture("ashFlake", 2, 4);
        ash.destroy();

        this.ashParticles = this.scene.add.particles(0, 0, "ashFlake", this.ashfallSetting());
        this.ashParticles.setScrollFactor(1).setDepth(100).stop();
    };

    private createCelestialRain() {
        const glow = this.scene.make.graphics({ x: 0, y: 0 });
        glow.fillStyle(0xffffff, 1);
        glow.fillCircle(4, 4, 4);
        glow.generateTexture("celestialDrop", 8, 8);
        glow.destroy();

        this.celestialParticles = this.scene.add.particles(0, 0, "celestialDrop", this.celestialRainSetting());
        this.celestialParticles.setScrollFactor(1).setDepth(100).stop();
    };

    private createFog() {
        this.fogOverlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height, 0x888888, 0.3);
        this.fogOverlay.setDepth(98);
        this.fogOverlay.setAlpha(0);
        this.fogOverlay.setVisible(false);
        const fogClouds = this.scene.make.graphics({ x: 0, y: 0 });
        fogClouds.fillStyle(0xffffff, 0.1);
        fogClouds.fillEllipse(64, 64, 128, 64);
        fogClouds.generateTexture("fogClouds", 128, 128);
        fogClouds.destroy();

        this.fogParticles = this.scene.add.particles(0, 0, "fogClouds", this.fogSetting());
        this.fogParticles.setScrollFactor(1).setDepth(100).stop();
    };

    private createHail() {
        const hail = this.scene.make.graphics({ x: 0, y: 0 });
        hail.fillStyle(0xccccff, 1);
        hail.fillCircle(1, 1, 2);
        hail.generateTexture("hailDrop", 4, 4);
        hail.destroy();

        this.hailParticles = this.scene.add.particles(0, 0, "hailDrop", this.hailSetting());
        this.hailParticles.setScrollFactor(1).setDepth(100).stop();
    };

    private createLightning() {
        this.lightningFlash = this.scene.add.rectangle(0, 0, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height, 0xffffff, 1);
        this.lightningFlash.setDepth(101);
        this.lightningFlash.setAlpha(0);
    };

    private createMeteors() {
        const meteor = this.scene.make.graphics({ x: 0, y: 0 });
        meteor.fillStyle(0xffdd99, 1);
        meteor.beginPath();
        meteor.moveTo(0, 0);
        meteor.lineTo(2, 10);
        meteor.lineTo(4, 0);
        meteor.closePath();
        meteor.fillPath();
        meteor.generateTexture("meteorStreak", 4, 10);
        meteor.destroy();

        this.meteorParticles = this.scene.add.particles(0, 0, "meteorStreak", this.meteorSetting());
        this.meteorParticles.setScrollFactor(1).setDepth(150).stop();
    };

    private createSandstorm() {
        const dust = this.scene.make.graphics({ x: 0, y: 0 });
        dust.fillStyle(0xDEB887, 0.5);
        dust.fillCircle(4, 4, 4);
        dust.generateTexture("sandDust", 8, 8);
        dust.destroy();

        this.sandParticles = this.scene.add.particles(0, 0, "sandDust", this.sandstormSetting());
        this.sandParticles.setScrollFactor(1).setDepth(100).stop();
    };

    private ashfallSetting() {
        const { width, height } = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width),
            y: () => Phaser.Math.Between(0, height),
            follow: this.scene.player,
            followOffset: {x: -width * 0.75, y: -height * 0.6},
            lifespan: { min: 3000, max: 5000 },
            speedY: { min: 10, max: 20 },
            scale: { start: 1, end: 0.1 },
            alpha: { start: 1, end: 0 },
            quantity: 4,
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 1.2),
                type: "random",
                quantity: 4,
            },
            visible: false
        };
    };

    private celestialRainSetting() {
        const { width, height } = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width),
            y: () => Phaser.Math.Between(0, height),
            follow: this.scene.player,
            followOffset: {x: -width * 0.75, y: -height * 0.6},
            lifespan: { min: 2000, max: 4000 },
            speedY: { min: 20, max: 40 },
            scale: { start: 0.8, end: 0.2 },
            alpha: { start: 0.6, end: 0 },
            tint: [0x6f42c1, 0x42a5f5, 0x9c27b0],
            quantity: 4,
            blendMode: "ADD",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 1.2),
                type: "random",
                quantity: 4,
            },
            visible: false
        };
    };

    private fogSetting() {
        const { width, height} = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width),
            y: () => Phaser.Math.Between(0, height),
            follow: this.scene.player,
            followOffset: {x: -width * 0.75, y: -height * 0.6},
            lifespan: { min: 5000, max: 10000 },
            quantity: 1,
            frequency: 1500,
            scale: { start: 0.5, end: 1 },
            alpha: { start: 0.5, end: 0 },
            speedX: { min: 5, max: 15 },
            speedY: { min: -1, max: 1 },
            blendMode: "NORMAL",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 1.2),
                type: "random",
                quantity: 5,
            },
            visible: false
        };
    };

    private hailSetting() {
        const { width, height } = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width),
            y: () => Phaser.Math.Between(0, height),
            follow: this.scene.player,
            followOffset: { x: -width * 0.75, y: -height * 0.6 },
            lifespan: 400,
            accelerationY: 300,
            gravityY: 500,
            bounce: 0.5,
            scale: { start: 1, end: 0 },
            quantity: 6,
            speedY: { min: 150, max: 250 },
            angle: { min: 85, max: 95 },
            blendMode: "NORMAL",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 1.2),
                type: "random",
                quantity: 6,
            },
            collideBottom: true,
            visible: false
        };
    };

    private meteorSetting() {
        const { width, height } = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width * 1.5),
            y: () => Phaser.Math.Between(-height * 0.5, 0),
            follow: this.scene.player,
            followOffset: { x: -width * 0.75, y: -height * 0.6 },
            lifespan: 300,
            speedX: { min: -200, max: -300 },
            speedY: { min: 300, max: 400 },
            scale: { start: 1.2, end: 0.2 },
            angle: 60,
            quantity: 2,
            frequency: 300,
            blendMode: "ADD",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 0.6),
                type: "random",
                quantity: 2,
            },
            visible: false
        };
    };

    private rainSetting() {
        const { width, height} = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width),
            y: () => Phaser.Math.Between(0, height),
            follow: this.scene.player,
            followOffset: {x: -width * 0.75, y: -height * 0.6},
            lifespan: { min: 500, max: 1500 },
            accelerationY: { min: 50, max: 100 },
            scale: { start: 0.6, end: 0 },
            quantity: 5,
            speedY: { min: 35, max: 75 },
            blendMode: "ADD",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 1.2),
                type: "random",
                quantity: 5,
            },
            visible: false
        };
    };

    private sandstormSetting() {
        const { width, height } = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width),
            y: () => Phaser.Math.Between(0, height),
            follow: this.scene.player,
            followOffset: {x: -width * 0.75, y: -height * 0.6},
            lifespan: { min: 1500, max: 3000 },
            speedX: { min: 100, max: 200 },
            speedY: { min: -10, max: 10 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: "NORMAL",
            quantity: 6,
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 1.2),
                type: "random",
                quantity: 6,
            },
            visible: false
        };
    };

    private snowSetting () {
        const { width, height} = this.scene.cameras.main;
        return {
            x: () => Phaser.Math.Between(0, width),
            y: () => Phaser.Math.Between(0, height),
            follow: this.scene.player,
            followOffset: {x: -width * 0.75, y: -height * 0.6},
            lifespan: { min: 2000, max: 4000 },
            speedY: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            quantity: 3,
            frequency: 100,
            blendMode: "ADD",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.5, height * 1.2),
                type: "random",
                quantity: 5,
            },
            visible: false
        };
    };

    private createRain() {
        const drop = this.scene.make.graphics({ x: 0, y: 0 });
        drop.fillStyle(0xffffff, 1);
        drop.fillRect(0, 0, 2, 10);
        drop.generateTexture("rainDrop", 2, 10);
        drop.destroy();

        this.rainParticles = this.scene.add.particles(0, 0, "rainDrop", this.rainSetting());
        this.rainParticles.setScrollFactor(1).setDepth(100).stop();
    };

    private createSnow() {
        const flake = this.scene.make.graphics({ x: 0, y: 0 });
        flake.fillStyle(0xffffff, 0.9);
        flake.fillCircle(4, 4, 4);
        flake.generateTexture("snowFlake", 8, 8);
        flake.destroy();

        this.snowParticles = this.scene.add.particles(0, 0, "snowFlake", this.snowSetting());
        this.snowParticles.setScrollFactor(1).setDepth(100).stop();
    };

    private quickFog(type: weather) {
        switch (type) {
            case "ash":
                this.setupFog(0.2, 0.3, 0x666666);
                break;
            case "celestial":
                this.setupFog(0.2, 0.3, 0x00FFFF);
                break;
            case "fog":
            case "fog rain":
            case "fog snow":
                this.setupFog(0.35, 0.5, 0x888888);
                break;
            case "hail":
            case "rain":
                this.setupFog(0.2, 0.3, 0x6699CC);
                break;
            case "meteor":
                this.setupFog(0.2, 0.3, 0x555555);
                break;
            case "sand":
                this.setupFog(0.2, 0.3, 0xDEB887);
                break;
            case "snow":
                this.setupFog(0.3, 0.4, 0x38AEE6);
                break;
            case "thunderash":
            case "thundersnow":
            case "thunderstorm":
                this.setupFog(0.35, 0.5, 0x050a30);
                break;
        };
    };

    private setupFog(start: number, end: number, color: number) {
        this.fogOverlay.setVisible(true).setFillStyle(color); // setAlpha(start).
        this.scene.tweens.chain({
            targets: this.fogOverlay,
            tweens: [
                {
                    alpha: end,
                    duration: WEATHER_DURATION / OSCILLATE,
                    onUpdate: () => this.updateOverlay(this.fogOverlay, true)
                },
                {
                    alpha: start,
                    duration: WEATHER_DURATION / OSCILLATE,
                    onUpdate: () => this.updateOverlay(this.fogOverlay, true)
                },
                {
                    alpha: { from: start, to: end },
                    duration: WEATHER_DURATION / OSCILLATE,
                    yoyo: true,
                    repeat: OSCILLATE - 6, // yoyo so lasts 2x
                    // onRepeat: () => console.log(start, end, "Repeating Again"),
                    onUpdate: () => this.updateOverlay(this.fogOverlay, true)
                }
            ]
        });
    };

    private setupLightning() {
        this.lightningTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(5000, 10000),
            loop: true,
            callback: () => this.triggerLightningFlash()
        });
    };

    private triggerLightningFlash() {
        this.updateOverlay(this.lightningFlash);
        this.scene.tweens.add({
            targets: this.lightningFlash,
            alpha: { from: 0, to: 0.8 },
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.scene.time.delayedCall(Phaser.Math.Between(200, 500), () => {
                    this.scene.sound.play("thunder", { volume: this.scene.hud.settings.volume });
                    screenShake(this.scene);
                });
            }
        });
    };

    private updateOverlay(obj: Phaser.GameObjects.Rectangle, frameCheck: boolean = false) {
        if (frameCheck && this.scene.frameCount % 6 !== 0) return;
        const { width, height, x, y } = this.scene.cameras.main.worldView;
        obj.width = width + OVERLAY_BUFFER;
        obj.height = height + OVERLAY_BUFFER;
        obj.setPosition(x - OVERLAY_BUFFER / 2, y - OVERLAY_BUFFER / 2);
    };

    private fadeIn(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
        emitter.setAlpha(0).setVisible(true).start();
        this.scene.tweens.add({ targets: emitter, alpha: 1, duration: FADE_IN });
    };

    private fadeOut(obj: Phaser.GameObjects.Particles.ParticleEmitter | Phaser.GameObjects.Rectangle) {
        this.scene.tweens.add({
            targets: obj,
            alpha: 0,
            duration: FADE_OUT,
            ease: "Sine.easeInOut",
            onComplete: () => {
                obj.setVisible(false); 
                if (obj instanceof Phaser.GameObjects.Particles.ParticleEmitter) obj.stop();
            }
        });
        if (this.lightningTimer) {
            this.lightningTimer.remove();
            this.lightningTimer = undefined;
        };
        if (this.shakeTimer) {
            this.shakeTimer.remove();
            this.shakeTimer = undefined;
        };
    };

    private getNextWeather(current: weather): weather {
        const options = weatherTransitions[current];
        if (!options || options.length === 0) return current;

        const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
        const roll = Phaser.Math.Between(1, totalWeight);

        let accumulated = 0;
        for (const opt of options) {
            accumulated += opt.weight;
            if (roll <= accumulated) return opt.type;
        };

        return current;
    };

    private setupWeatherCycle() {
        // this.setWeather("thunderstorm");
        this.scene.time.addEvent({
            delay: WEATHER_DURATION,
            loop: true,
            callback: () => this.setWeather(this.getNextWeather(this.currentWeather)),
        });
    };

    public setWeather(type: weather) {
        if (this.currentWeather === type) {
            this.scene.hud.logger.log(`Console: The weather continues.`);
            this.quickFog(this.currentWeather);
            return;
        };
        switch (this.currentWeather) {
            case "ash":
            case "thunderash":
                this.fadeOut(this.ashParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "celestial":
                this.fadeOut(this.celestialParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "fog":
                this.fadeOut(this.fogParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "fog rain":
                this.fadeOut(this.fogParticles);
                this.fadeOut(this.rainParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "fog snow":
                this.fadeOut(this.fogParticles);
                this.fadeOut(this.snowParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "hail":
                this.fadeOut(this.hailParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "meteor":
                this.fadeOut(this.meteorParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "rain":
            case "thunderstorm":
                this.fadeOut(this.rainParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "sand":
                this.fadeOut(this.sandParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "snow":
            case "thundersnow":
                this.fadeOut(this.snowParticles);
                this.fadeOut(this.fogOverlay);
                break;
        };
        this.scene.time.delayedCall(FADE_IN, () => {
            this.quickFog(type);
            switch (type) {
                case "ash":
                    this.ashParticles.ops.speedY.loadConfig({ speedY: {min: 10, max: 20} });
                    this.ashParticles.ops.quantity.loadConfig({ quantity: 4 });
                    this.fadeIn(this.ashParticles);
                    break;
                case "celestial":
                    this.fadeIn(this.celestialParticles);
                    break;
                case "fog":
                    this.fadeIn(this.fogParticles);
                    break;
                case "fog rain":
                    this.rainParticles.ops.speedY.loadConfig({ speedY: {min: 25, max: 55} });
                    this.rainParticles.ops.quantity.loadConfig({ quantity: 3 });
                    this.fadeIn(this.rainParticles);
                    this.fadeIn(this.fogParticles);
                    break;
                case "fog snow":
                    this.snowParticles.ops.speedY.loadConfig({ speedY: {min: 15, max: 30} });
                    this.snowParticles.ops.quantity.loadConfig({ quantity: 2 });
                    this.fadeIn(this.fogParticles);
                    this.fadeIn(this.snowParticles);
                    break;
                case "hail":
                    this.fadeIn(this.hailParticles);
                    break;
                case "meteor":
                    this.fadeIn(this.meteorParticles);
                    this.shakeTimer = this.scene.time.addEvent({
                        delay: Phaser.Math.Between(1500, 2500),
                        loop: true,
                        callback: () => screenShake(this.scene)
                    });
                    break;
                case "rain":
                    this.rainParticles.ops.speedY.loadConfig({ speedY: {min: 35, max: 75} });
                    this.rainParticles.ops.quantity.loadConfig({ quantity: 5 });
                    this.fadeIn(this.rainParticles);
                    break;
                case "sand":
                    this.fadeIn(this.sandParticles);
                    break;
                case "snow":
                    this.snowParticles.ops.speedY.loadConfig({ speedY: {min: 20, max: 40} });
                    this.snowParticles.ops.quantity.loadConfig({ quantity: 3 });
                    this.fadeIn(this.snowParticles);
                    break;
                case "thunderash":
                    this.ashParticles.ops.speedY.loadConfig({ speedY: {min: 15, max: 30} });
                    this.ashParticles.ops.quantity.loadConfig({ quantity: 6 });

                    this.fadeIn(this.ashParticles);
                    this.setupLightning();
                    break;
                case "thundersnow":
                    this.snowParticles.ops.speedY.loadConfig({ speedY: {min: 30, max: 50} });
                    this.snowParticles.ops.quantity.loadConfig({ quantity: 5 });
                    this.fadeIn(this.snowParticles);
                    this.setupLightning();
                    break;
                case "thunderstorm":
                    this.rainParticles.ops.speedY.loadConfig({ speedY: {min: 75, max: 115} });
                    this.rainParticles.ops.quantity.loadConfig({ quantity: 15 });
                    this.fadeIn(this.rainParticles);
                    this.setupLightning();
                    break;
            };
        }, undefined, this);
        this.scene.hud.logger.log(`Console: The weather has changed from ${phrase[this.currentWeather]} to ${phrase[type]}.`);
        this.currentWeather = type;
    };
};