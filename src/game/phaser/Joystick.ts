import { EventBus } from "../EventBus";
const FORCE = 0.1;
export default class Joystick extends Phaser.GameObjects.Container {
    public scene: any;
    public pointer: any;
    public joystick: any;
    constructor(scene: any, x: number, y: number, base: number, thumb: number) {
        super(scene, x, y);
        this.scene = scene;
        this.scene.add.existing(this);
        this.pointer = null;
        const height = window.innerHeight;
        this.joystick = scene.plugins.get('rexVirtualJoystick').add(scene, {
            x: x,
            y: y,
            radius: height / 6,
            base: scene.add.circle(0, 0, height / 6, base, 1),
            thumb: scene.add.circle(0, 0, height / 12, thumb, 1),
            dir: '8dir',
        });
        this.joystick.setVisible(!scene.settings.desktop);
        this.doubleTap();
    };
    cleanUp() {
        EventBus.off('update-cursor');
        EventBus.off('update-desktop-cursor');
        this.joystick.off('update', this.update, this);
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
        this.joystick.on('update', this.update, this);
    };
    attachMouseToPointer() {
        this.scene.input.on('pointermove', this.updatePointerPosition, this);
    };
    detachMouseFromPointer() {
        this.scene.input.off('pointermove', this.updatePointerPosition, this);
    };
    updatePointerPosition(pointer: any) {
        this.pointer.x = pointer.x;
        this.pointer.y = pointer.y;
    };
    doubleTap() {
        EventBus.on('update-cursor', () => {
            if (!this.pointer) return;
            this.pointer.x = this.scene.cameras.main.width / 2;
            this.pointer.y = this.scene.cameras.main.height / 2;
        });
        EventBus.on('update-desktop-cursor', (desktop: boolean) => {
            if (!this.pointer) return;
            if (desktop) {
                this.attachMouseToPointer();
            } else {
                this.detachMouseFromPointer();
            };
        });
    };
    update() {
        if (this.joystick.force > 0) {
            if (this.joystick.forceX > 15) {
                this.pointer.x += this.joystick.forceX * FORCE;
            };
            if (this.joystick.forceX < -15) {
                this.pointer.x += this.joystick.forceX * FORCE;
            };
            if (this.joystick.forceY > 15) {
                this.pointer.y += this.joystick.forceY * FORCE;
            };
            if (this.joystick.forceY < -15) {
                this.pointer.y += this.joystick.forceY * FORCE;
            };
        };
    };
};