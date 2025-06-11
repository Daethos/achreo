import { Game, OVERLAY_BUFFER } from "../scenes/Game";

const FADE_IN = 2050;
const FADE_OUT = 2000;
const OSCILLATE = 10;
const WEATHER_DURATION = 60000;
type weather = "clear" | "foggy" | "raining" | "snowing" | "stormy";

export default class WeatherManager {
    private scene: Game;
    private fogParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private rainParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private snowParticles: Phaser.GameObjects.Particles.ParticleEmitter;
    private fogOverlay: Phaser.GameObjects.Rectangle;
    private lightningFlash: Phaser.GameObjects.Rectangle;
    private lightningTimer?: Phaser.Time.TimerEvent;
    private currentWeather: weather = "clear";

    constructor(scene: Game) {
        this.scene = scene;
        this.createRain();
        this.createFog();
        this.createLightning();
        this.createSnow();
        this.setupWeatherCycle();
    };

    private createFog() {
        this.fogOverlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height, 0x888888, 0.3);
        this.fogOverlay.setDepth(98);
        this.fogOverlay.setAlpha(0);
        this.fogOverlay.setVisible(false);
        // this.fogOverlay.setScrollFactor(1);
        const fogClouds = this.scene.make.graphics({ x: 0, y: 0 });
        fogClouds.fillStyle(0xffffff, 0.1);
        fogClouds.fillEllipse(64, 64, 128, 64);
        fogClouds.generateTexture("fogClouds", 128, 128);
        fogClouds.destroy();

        this.fogParticles = this.scene.add.particles(0, 0, "fogClouds", this.fogSetting());
        this.fogParticles.setScrollFactor(0).setDepth(100).stop();
    };
;
    private createLightning() {
        this.lightningFlash = this.scene.add.rectangle(0, 0, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height, 0xffffff, 1);
        this.lightningFlash.setDepth(101);
        this.lightningFlash.setAlpha(0);
    };

    private fogSetting() {
        return {
            x: () => Phaser.Math.Between(0, this.scene.cameras.main.width),
            y: () => Phaser.Math.Between(0, this.scene.cameras.main.height),
            lifespan: { min: 5000, max: 75000 },
            quantity: 1,
            frequency: 3000,
            maxParticles: 20,
            scale: { start: 0.5, end: 1 },
            alpha: { start: 0.5, end: 0 },
            speedX: { min: 5, max: 15 },
            speedY: { min: -1, max: 1 },
            blendMode: "NORMAL",
            visible: false
        };
    };

    private rainSetting() {
        return {
            x: () => Phaser.Math.Between(0, this.scene.cameras.main.width),
            y: () => Phaser.Math.Between(0, this.scene.cameras.main.height),
            lifespan: { min: 500, max: 1500 },
            accelerationY: { min: 50, max: 100 },
            scale: { start: 0.6, end: 0 },
            quantity: 5,
            speedY: { min: 35, max: 75 },
            blendMode: "ADD",
            visible: false
        };
    };

    private snowSetting () {
        return {
            x: () => Phaser.Math.Between(0, this.scene.cameras.main.width),
            y: () => Phaser.Math.Between(0, this.scene.cameras.main.height),
            lifespan: { min: 2000, max: 4000 },
            speedY: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            quantity: 3,
            frequency: 100,
            blendMode: "ADD",
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
        this.rainParticles.setScrollFactor(0).setDepth(100).stop();
    };

    private createSnow() {
        const flake = this.scene.make.graphics({ x: 0, y: 0 });
        flake.fillStyle(0xffffff, 0.9);
        flake.fillCircle(4, 4, 4);
        flake.generateTexture("snowFlake", 8, 8);
        flake.destroy();

        this.snowParticles = this.scene.add.particles(0, 0, "snowFlake", this.snowSetting());
        this.snowParticles.setScrollFactor(0).setDepth(100).stop();
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

    private setupWeatherCycle() {
        // this.setWeather("stormy");
        this.scene.time.addEvent({
            delay: WEATHER_DURATION,
            loop: true,
            callback: () => {
                const roll = Phaser.Math.Between(0, 100);
                if (roll > 60) { // 40% Clear
                    this.setWeather("clear");
                } else if (roll > 50) { // 10% Fog
                    this.setWeather("foggy");
                } else if (roll > 40) { // 20% Rain
                    this.setWeather("raining");
                } else if (roll > 20) { // 10% Snow
                    this.setWeather("snowing");
                } else { // 20% Storm
                    this.setWeather("stormy");
                };
            },
        });
    };

    public setWeather(type: weather) {
        if (this.currentWeather === type) return;
        switch (this.currentWeather) {
            case "foggy":
                this.fadeOut(this.fogParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "raining":
                this.fadeOut(this.rainParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "snowing":
                this.fadeOut(this.snowParticles);
                this.fadeOut(this.fogOverlay);
                break;
            case "stormy":
                this.fadeOut(this.rainParticles);
                this.fadeOut(this.fogOverlay);
                break;
        };
        this.scene.time.delayedCall(FADE_IN, () => {
            switch (type) {
                case "clear":
                    this.fadeOut(this.fogOverlay);
                    break;
                case "foggy":
                    this.fogParticles.setAlpha(0).setVisible(true).start();
                    this.scene.tweens.add({ targets: this.fogParticles, alpha: 1, duration: FADE_IN });
                    this.setupFog(0.35, 0.5, 0x888888);
                    break;
                case "raining":
                    this.rainParticles.setAlpha(0).setVisible(true).start();
                    this.scene.tweens.add({ targets: this.rainParticles, alpha: 1, duration: FADE_IN });
                    this.setupFog(0.2, 0.3, 0x6699CC);
                    break;
                case "snowing":
                    this.snowParticles.setAlpha(0).setVisible(true).start();
                    this.scene.tweens.add({ targets: this.snowParticles, alpha: 1, duration: FADE_IN });
                    this.setupFog(0.3, 0.4, 0x38AEE6);
                    break;
                case "stormy":
                    this.rainParticles.setAlpha(0).setVisible(true).start();
                    this.scene.tweens.add({ targets: this.rainParticles, alpha: 1, duration: FADE_IN });
                    this.setupFog(0.35, 0.5, 0x050a30);
                    this.lightningTimer = this.scene.time.addEvent({
                        delay: Phaser.Math.Between(5000, 10000),
                        loop: true,
                        callback: () => this.triggerLightningFlash()
                    });
                    break;
            };
        }, undefined, this);
        this.scene.hud.logger.log(`Console: The weather has changed from ${this.currentWeather} to ${type}.`);
        this.currentWeather = type;
    };
};