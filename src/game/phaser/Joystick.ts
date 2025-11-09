import { EventBus } from "../EventBus";
import { Hud } from "../scenes/Hud";
const FORCE = 0.15; // 0.125;
const DEAD_ZONE = 15; // Configurable dead zone
const MAX_SPEED = 10; // Prevent extreme movements

export default class Joystick extends Phaser.GameObjects.Container {
    public scene: Hud;
    public pointer: any;
    public joystick: any;
    constructor(scene: Hud, x: number, y: number, base: number, thumb: number) {
        super(scene, x, y);
        this.scene = scene;
        this.scene.add.existing(this);
        this.pointer = null;
        const height = window.innerHeight;
        this.joystick = (scene?.plugins?.get("rexVirtualJoystick") as any).add(scene, {
            x,
            y,
            radius: height / 6,
            base: scene.add.circle(0, 0, height / 6, base, 1),
            thumb: scene.add.circle(0, 0, height / 12, thumb, 1),
            dir: "8dir",
        });
        this.joystick.setVisible(!scene.settings.desktop);
        this.doubleTap();
    };

    cleanUp() {
        EventBus.off("update-cursor");
        EventBus.off("update-desktop-cursor");
        this.joystick.off("update", this.update, this);
        this?.pointer?.destroy();
        this.joystick.destroy();
    };
    createCursorKeys() {
        return this.joystick.createCursorKeys();
    };
    createPointer(scene: any) {
        this.pointer = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'cursor');
        this.pointer.setScrollFactor(0);
        this.pointer.setDepth(3);
        this.pointer.setOrigin(0.5);
        if (scene.settings.desktop) {
            this.attachMouseToPointer();
        } else {
            this.detachMouseFromPointer();
        };    
    };
    controlPointer() {
        this.joystick.on("update", this.update, this);
    };
    attachMouseToPointer() {
        this.scene.input.on("pointermove", this.updatePointerPosition, this);
    };
    detachMouseFromPointer() {
        this.scene.input.off("pointermove", this.updatePointerPosition, this);
    };
    updatePointerPosition(pointer: any) {
        this.pointer.x = pointer.x;
        this.pointer.y = pointer.y;
    };
    doubleTap() {
        EventBus.on("update-cursor", () => {
            if (!this.pointer) return;
            this.pointer.x = this.scene.cameras.main.width / 2;
            this.pointer.y = this.scene.cameras.main.height / 2;
        });
        EventBus.on("update-desktop-cursor", (desktop: boolean) => {
            if (!this.pointer) return;
            if (desktop) {
                this.attachMouseToPointer();
            } else {
                this.detachMouseFromPointer();
            };
        });
    };
    highlightAnimation(type: string) {
        const base = type === "left" ? this.scene.settings.positions.leftJoystick.base : this.scene.settings.positions.rightJoystick.base;
        const thumb = type === "left" ? this.scene.settings.positions.leftJoystick.thumb : this.scene.settings.positions.rightJoystick.thumb;
        const opacity = type === "left" ? this.scene.settings.positions.leftJoystick.opacity : this.scene.settings.positions.rightJoystick.opacity;
        this.joystick.base.setFillStyle();
        this.joystick.base.setFillStyle(thumb);
        this.joystick.thumb.setFillStyle();
        this.joystick.thumb.setFillStyle(base);
        this.joystick.base.setAlpha(1);
        this.joystick.thumb.setAlpha(1);

        this.scene.time.delayedCall(500, () => {
            this.joystick.base.setFillStyle();
            this.joystick.base.setFillStyle(base);
            this.joystick.thumb.setFillStyle();
            this.joystick.thumb.setFillStyle(thumb);
            this.joystick.base.setAlpha(opacity);
            this.joystick.thumb.setAlpha(opacity);
        }, undefined, this);
    };

    update() {
        if (this.joystick.force === 0) return;
        const { width, height } = this.scene.cameras.main;
        
        if (Math.abs(this.joystick.forceX) > DEAD_ZONE) {
            this.pointer.x += Phaser.Math.Clamp(this.joystick.forceX * FORCE, -MAX_SPEED, MAX_SPEED);
        };
        
        if (Math.abs(this.joystick.forceY) > DEAD_ZONE) {
            this.pointer.y += Phaser.Math.Clamp(this.joystick.forceY * FORCE, -MAX_SPEED, MAX_SPEED);
        };
        
        this.pointer.x = Phaser.Math.Wrap(this.pointer.x, 0, width);
        this.pointer.y = Phaser.Math.Wrap(this.pointer.y, 0, height);
    };
};