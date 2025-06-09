import { Game, OVERLAY_BUFFER } from "../scenes/Game";
type weather = "clear" | "fog" | "rain" | "snow" | "storm";
export default class WeatherManager {
    private scene: Game;
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
        this.fogOverlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width * 2, this.scene.cameras.main.height * 2, 0x888888, 0.3);
        this.fogOverlay.setDepth(98);
        this.fogOverlay.setAlpha(0);
        this.fogOverlay.setVisible(false);
        this.fogOverlay.setScrollFactor(0);
    }
;
    private createLightning() {
        this.lightningFlash = this.scene.add.rectangle(0, 0, this.scene.cameras.main.worldView.width, this.scene.cameras.main.worldView.height, 0xffffff, 1);
        this.lightningFlash.setDepth(101);
        this.lightningFlash.setAlpha(0);
    };

    private createRain() {
        const drop = this.scene.make.graphics({ x: 0, y: 0 });
        drop.fillStyle(0xffffff, 1);
        drop.fillRect(0, 0, 2, 10);
        drop.generateTexture("rainDrop", 2, 10);
        drop.destroy();

        this.rainParticles = this.scene.add.particles(0, 0, 'rainDrop', {
            x: () => Phaser.Math.Between(0, this.scene.cameras.main.width),
            y: () => Phaser.Math.Between(0, this.scene.cameras.main.height),
            lifespan: { min: 500, max: 1500 },
            accelerationY: { min: 50, max: 100 },
            scale: { start: 0.6, end: 0 },
            quantity: 5,
            speedY: { min: 35, max: 75 },
            blendMode: 'ADD',
            visible: false
        });
        this.rainParticles.setScrollFactor(0).setDepth(100).stop();
    };

    private createSnow() {
        const flake = this.scene.make.graphics({ x: 0, y: 0 });
        flake.fillStyle(0xffffff, 0.9);
        flake.fillCircle(4, 4, 4);
        flake.generateTexture("snowFlake", 8, 8);
        flake.destroy();

        this.snowParticles = this.scene.add.particles(0, 0, "snowFlake", {
            x: () => Phaser.Math.Between(0, this.scene.cameras.main.width),
            y: () => Phaser.Math.Between(0, this.scene.cameras.main.height),
            lifespan: { min: 2000, max: 4000 },
            speedY: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            quantity: 3,
            frequency: 100,
            blendMode: "ADD",
            visible: false    
        });
        this.snowParticles.setScrollFactor(0).setDepth(100).stop();
    };

    private triggerLightningFlash() {
        const { width, height, x, y } = this.scene.cameras.main.worldView;
        this.lightningFlash.width = width + OVERLAY_BUFFER;
        this.lightningFlash.height = height + OVERLAY_BUFFER;
        this.lightningFlash.setPosition(x - OVERLAY_BUFFER / 2, y - OVERLAY_BUFFER / 2);
        this.scene.tweens.add({
            targets: this.lightningFlash,
            alpha: { from: 0, to: 0.8 },
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.scene.time.delayedCall(Phaser.Math.Between(200, 500), () => {
                    this.scene.sound.play('thunder', { volume: this.scene.hud.settings.volume });
                });
            }
        });
    };

    private fadeOut(obj: Phaser.GameObjects.Particles.ParticleEmitter | Phaser.GameObjects.Rectangle) {
        this.scene.tweens.add({
            targets: obj,
            alpha: 0,
            duration: 2000,
            ease: "Sine.easeInOut",
            onComplete: () => {
                obj.setActive(false).setVisible(false); 
                if (obj instanceof Phaser.GameObjects.Particles.ParticleEmitter) obj.stop();
            }
        });
        if (this.lightningTimer) {
            this.lightningTimer.remove();
            this.lightningTimer = undefined;
        };
    };

    private setupWeatherCycle() {
        this.setWeather("fog");
        this.scene.time.addEvent({
            delay: 60000,
            loop: true,
            callback: () => {
                const roll = Phaser.Math.Between(0, 100);
                if (roll > 75) {
                    this.setWeather("clear");
                // } else if (roll > 60) {
                //     this.setWeather("fog");
                } else if (roll > 50) {
                    this.setWeather("rain");
                } else if (roll > 25) {
                    this.setWeather("snow");
                } else {
                    this.setWeather("storm");
                };
            },
        })
    };

    public setWeather(type: weather) {
        if (this.currentWeather === type) return;
        switch (this.currentWeather) {
            case "fog":
                this.fadeOut(this.fogOverlay);
                break;
            case 'rain':
                this.fadeOut(this.rainParticles);
                break;
            case 'snow':
                this.fadeOut(this.snowParticles);
                break;
            case "storm":
                this.fadeOut(this.rainParticles);
                break;
        };
        switch (type) {
            case "fog":
                // const { width, height, x, y } = this.scene.cameras.main.worldView;
                // this.fogOverlay.width = width + OVERLAY_BUFFER;
                // this.fogOverlay.height = height + OVERLAY_BUFFER;
                // this.fogOverlay.setPosition(x - OVERLAY_BUFFER / 2, y - OVERLAY_BUFFER / 2);
                this.fogOverlay.setAlpha(0).setVisible(true);
                this.scene.tweens.add({ 
                    targets: this.fogOverlay, 
                    alpha: 1, 
                    duration: 2000, 
                    yoyo: true, 
                    repeat: 30,
                    onRepeat: () => {
                        const { width, height, x, y } = this.scene.cameras.main.worldView;
                        console.log(width, height, x, y, "onRepeat Triggering");
                        // this.fogOverlay.width = width + OVERLAY_BUFFER;
                        // this.fogOverlay.height = height + OVERLAY_BUFFER;
                        // this.fogOverlay.setPosition(x - OVERLAY_BUFFER / 2, y - OVERLAY_BUFFER / 2);        
                    } 
                });
                break;
            case 'rain':
                this.rainParticles.setAlpha(0).setActive(true).setVisible(true).start();
                this.scene.tweens.add({
                    targets: this.rainParticles,
                    alpha: 1,
                    duration: 2000
                });
                break;
            case 'snow':
                this.snowParticles.setAlpha(0).setActive(true).setVisible(true).start();
                this.scene.tweens.add({
                    targets: this.snowParticles,
                    alpha: 1,
                    duration: 2000
                });
                break;
            case "storm":
                this.rainParticles.setAlpha(0).setActive(true).setVisible(true).start();
                this.scene.tweens.add({ targets: this.rainParticles, alpha: 1, duration: 2000 });
                this.lightningTimer = this.scene.time.addEvent({
                    delay: Phaser.Math.Between(5000, 15000),
                    loop: true,
                    callback: () => this.triggerLightningFlash()
                });
                break;
        };
        this.currentWeather = type;
        console.log(`Weather changed to: ${type}`);
    };
};