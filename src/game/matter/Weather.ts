import { Game, OVERLAY_BUFFER } from "../scenes/Game";

const FADE_IN = 2050;
const FADE_OUT = 2000;
const OSCILLATE = 10;
const WEATHER_DURATION = 60000;
type weather = "clear" | "ashfall" | "celestial" | "foggy" | "foggy rain" | "foggy snow" | "rain" | "sandstorm" | "snowfall" | "thunderash" | "thunderstorm" | "thundersnow";
const weatherChain: { [key in weather]: weather[] } = { // EVentually { type: weather; weight: number } = { type: "clear", weight: 1 }
    clear: ["clear", "celestial", "foggy", "rain", "snowfall"],
    ashfall: ["clear", "ashfall", "thunderash"],
    celestial: ["clear", "sandstorm", "thunderash", "thundersnow", "thunderstorm"],
    foggy: ["clear", "foggy rain", "foggy snow"],
    "foggy rain": ["clear", "foggy", "rain", "foggy rain", "foggy snow", "thunderstorm"],
    "foggy snow": ["clear", "foggy", "foggy rain", "foggy snow", "snowfall", "thundersnow"],
    "rain": ["clear", "foggy rain", "rain", "snowfall", "thunderstorm"],
    sandstorm: ["clear", "sandstorm", "thunderstorm"],
    snowfall: ["clear", "foggy snow", "rain", "snowfall", "thundersnow"],
    thunderash: ["clear", "ashfall", "thunderash", "thundersnow", "thunderstorm"],
    thunderstorm: ["clear", "rain", "thunderash", "thundersnow", "thunderstorm"],
    thundersnow: ["clear", "snowfall", "thunderash", "thundersnow", "thunderstorm"]
};
const phrase = {
    clear: "clear skies",
    ashfall: "ashfall",
    celestial: "celestial rainfall",
    foggy: "a thick fog",
    "foggy rain": "foggy rainfall",
    "foggy snow": "foggy snowfall",
    "rain": "rainfall",
    sandstorm: "a sandstorm",
    snowfall: "snowfall",
    thunderash: "thunderash",
    thunderstorm: "a thunderstorm",
    thundersnow: "thundersnow"
};
type WeightedTransition = { type: weather; weight: number };

const weatherTransitions: { [key in weather]: WeightedTransition[] } = {
    clear: [
        { type: "clear", weight: 4 },
        { type: "celestial", weight: 1 },
        { type: "foggy", weight: 2 },
        { type: "rain", weight: 2 },
        { type: "snowfall", weight: 2 }
    ],
    rain: [
        { type: "clear", weight: 3 },
        { type: "foggy rain", weight: 1 },
        { type: "rain", weight: 2 },
        { type: "snowfall", weight: 1 },
        { type: "thunderstorm", weight: 2 }
    ],
    foggy: [
        { type: "clear", weight: 1 },
        { type: "foggy", weight: 1 },
        { type: "foggy rain", weight: 1 },
        { type: "foggy snow", weight: 1 }
    ],
    ashfall: [
        { type: "clear", weight: 2 },
        { type: "ashfall", weight: 1 },
        { type: "thunderash", weight: 1 }
    ],
    celestial: [
        { type: "clear", weight: 5 },
        { type: "celestial", weight: 1 },
        { type: "sandstorm", weight: 1 },
        { type: "thunderash", weight: 1 },
        { type: "thundersnow", weight: 1 },
        { type: "thunderstorm", weight: 1 }
    ],
    "foggy rain": [
        { type: "clear", weight: 2 },
        { type: "foggy", weight: 1 },
        { type: "foggy rain", weight: 2 },
        { type: "foggy snow", weight: 1 },
        { type: "rain", weight: 1 },
        { type: "thunderstorm", weight: 1 }
    ],
    "foggy snow": [
        { type: "clear", weight: 2 },
        { type: "foggy", weight: 1 },
        { type: "foggy rain", weight: 1 },
        { type: "foggy snow", weight: 2 },
        { type: "snowfall", weight: 1 },
        { type: "thundersnow", weight: 1 }
    ],
    sandstorm: [
        { type: "clear", weight: 3 },
        { type: "sandstorm", weight: 2 },
        { type: "thunderstorm", weight: 1 }
    ],
    snowfall: [
        { type: "clear", weight: 3 },
        { type: "foggy snow", weight: 1 },
        { type: "rain", weight: 1 },
        { type: "snowfall", weight: 2 },
        { type: "thundersnow", weight: 2 }
    ],
    thunderash: [
        { type: "clear", weight: 3 },
        { type: "ashfall", weight: 2 },
        { type: "thunderash", weight: 2 },
        { type: "thundersnow", weight: 1 },
        { type: "thunderstorm", weight: 1 }
    ],
    thunderstorm: [
        { type: "clear", weight: 3 },
        { type: "rain", weight: 2 },
        { type: "thunderash", weight: 1 },
        { type: "thundersnow", weight: 1 },
        { type: "thunderstorm", weight: 2 }
    ],
    thundersnow: [
        { type: "clear", weight: 3 },
        { type: "snowfall", weight: 2 },
        { type: "thunderash", weight: 1 },
        { type: "thundersnow", weight: 2 },
        { type: "thunderstorm", weight: 1 }
    ],
};

export default class WeatherManager {
    private scene: Game;
    private ashParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private celestialParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private fogParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private rainParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private sandParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private snowParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private fogOverlay: Phaser.GameObjects.Rectangle;
    private lightningFlash: Phaser.GameObjects.Rectangle;
    private lightningTimer?: Phaser.Time.TimerEvent;
    private currentWeather: weather = "clear";

    constructor(scene: Game) {
        this.scene = scene;
        this.createAshfall();
        this.createCelestialRain();
        this.createRain();
        this.createFog();
        this.createLightning();
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
;
    private createLightning() {
        this.lightningFlash = this.scene.add.rectangle(0, 0, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height, 0xffffff, 1);
        this.lightningFlash.setDepth(101);
        this.lightningFlash.setAlpha(0);
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
            followOffset: {x: -width * 0.625, y: -height * 0.6},
            lifespan: { min: 3000, max: 5000 },
            speedY: { min: 10, max: 20 },
            scale: { start: 1, end: 0.1 },
            alpha: { start: 1, end: 0 },
            quantity: 4,
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.25, height * 1.2),
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
            followOffset: {x: -width * 0.625, y: -height * 0.6},
            lifespan: { min: 2000, max: 4000 },
            speedY: { min: 20, max: 40 },
            scale: { start: 0.8, end: 0.2 },
            alpha: { start: 0.6, end: 0 },
            tint: [0x6f42c1, 0x42a5f5, 0x9c27b0],
            quantity: 4,
            blendMode: "ADD",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.25, height * 1.2),
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
            followOffset: {x: -width * 0.625, y: -height * 0.6},
            lifespan: { min: 5000, max: 10000 },
            quantity: 1,
            frequency: 1500,
            scale: { start: 0.5, end: 1 },
            alpha: { start: 0.5, end: 0 },
            speedX: { min: 5, max: 15 },
            speedY: { min: -1, max: 1 },
            blendMode: "NORMAL",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.25, height * 1.2),
                type: "random",
                quantity: 5,
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
            followOffset: {x: -width * 0.625, y: -height * 0.6},
            lifespan: { min: 500, max: 1500 },
            accelerationY: { min: 50, max: 100 },
            scale: { start: 0.6, end: 0 },
            quantity: 5,
            speedY: { min: 35, max: 75 },
            blendMode: "ADD",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.25, height * 1.2),
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
            followOffset: {x: -width * 0.625, y: -height * 0.6},
            lifespan: { min: 1500, max: 3000 },
            speedX: { min: 100, max: 200 },
            speedY: { min: -10, max: 10 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: "NORMAL",
            quantity: 6,
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.25, height * 1.2),
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
            followOffset: {x: -width * 0.625, y: -height * 0.6},
            lifespan: { min: 2000, max: 4000 },
            speedY: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            quantity: 3,
            frequency: 100,
            blendMode: "ADD",
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, width * 1.25, height * 1.2),
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
                    repeat: OSCILLATE - 2,
                    onUpdate: () => this.updateOverlay(this.fogOverlay, true)
                }
            ]
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
        this.setWeather("celestial");
        this.scene.time.addEvent({
            delay: WEATHER_DURATION,
            loop: true,
            callback: () => {
                // const newWeather = this.getNextWeather(this.currentWeather);
                this.setWeather(this.getNextWeather(this.currentWeather));
            },
        });
    };

    public setWeather(type: weather) {
        if (this.currentWeather === type) return;
        switch (this.currentWeather) {
            case "ashfall":
            case "thunderash":
                this.fadeOut(this.ashParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "celestial":
                this.fadeOut(this.celestialParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "foggy":
                this.fadeOut(this.fogParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "foggy rain":
                this.fadeOut(this.fogParticles);
                this.fadeOut(this.rainParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "foggy snow":
                this.fadeOut(this.fogParticles);
                this.fadeOut(this.snowParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "rain":
            case "thunderstorm":
                this.fadeOut(this.rainParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "sandstorm":
                this.fadeOut(this.sandParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "snowfall":
            case "thundersnow":
                this.fadeOut(this.snowParticles);
                this.fadeOut(this.fogOverlay);
                break;
        };
        this.scene.time.delayedCall(FADE_IN, () => {
            switch (type) {
                case "ashfall":
                    this.fadeIn(this.ashParticles);
                    this.setupFog(0.2, 0.3, 0x666666);
                    break;
                case "celestial":
                    this.fadeIn(this.celestialParticles);
                    this.setupFog(0.2, 0.3, 0x00FFFF);
                    break;
                case "foggy":
                    this.fadeIn(this.fogParticles);
                    this.setupFog(0.35, 0.5, 0x888888);
                    break;
                case "foggy rain":
                    this.fadeIn(this.rainParticles);
                    this.fadeIn(this.fogParticles);
                    this.setupFog(0.35, 0.5, 0x888888);
                    break;
                case "foggy snow":
                    this.fadeIn(this.fogParticles);
                    this.fadeIn(this.snowParticles);
                    this.setupFog(0.35, 0.5, 0x888888);
                    break;
                case "rain":
                    this.fadeIn(this.rainParticles);
                    this.setupFog(0.2, 0.3, 0x6699CC);
                    break;
                case "sandstorm":
                    this.fadeIn(this.sandParticles);
                    this.setupFog(0.2, 0.3, 0xDEB887);
                    break;
                case "snowfall":
                    this.fadeIn(this.snowParticles);
                    this.setupFog(0.3, 0.4, 0x38AEE6);
                    break;
                case "thunderash":
                    this.fadeIn(this.ashParticles);
                    this.setupFog(0.35, 0.5, 0x050a30);
                    this.lightningTimer = this.scene.time.addEvent({
                        delay: Phaser.Math.Between(5000, 10000),
                        loop: true,
                        callback: () => this.triggerLightningFlash()
                    });
                    break;
                case "thundersnow":
                    this.fadeIn(this.snowParticles);
                    this.setupFog(0.35, 0.5, 0x050a30);
                    this.lightningTimer = this.scene.time.addEvent({
                        delay: Phaser.Math.Between(5000, 10000),
                        loop: true,
                        callback: () => this.triggerLightningFlash()
                    });
                    break;
                case "thunderstorm":
                    this.fadeIn(this.rainParticles);
                    this.setupFog(0.35, 0.5, 0x050a30);
                    this.lightningTimer = this.scene.time.addEvent({
                        delay: Phaser.Math.Between(5000, 10000),
                        loop: true,
                        callback: () => this.triggerLightningFlash()
                    });
                    break;
            };
        }, undefined, this);
        this.scene.hud.logger.log(`Console: The weather has changed from ${this.currentWeather} to ${phrase[type]}.`);
        this.currentWeather = type;
    };
};