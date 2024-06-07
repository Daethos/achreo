import Phaser from 'phaser';
import { EventBus } from '../game/EventBus';

const FORCE = {
    MULTIPLIER: 0.1,
};

export default class Joystick extends Phaser.GameObjects.Container {
    public scene: any;
    public pointer: any;
    public joystick: any;

    constructor(scene: any, x: number, y: number) {
        super(scene, x, y);
        this.scene = scene;
        this.scene.add.existing(this);
        this.pointer = null;
        const height = window.innerHeight;
        this.joystick = scene.plugins.get('rexVirtualJoystick').add(scene, {
            x: x,
            y: y,
            radius: height / 6,
            base: scene.add.circle(0, 0, height / 6, 0x000000, 1),
            thumb: scene.add.circle(0, 0, height / 12, 0xfdf6d8, 1),
            dir: '8dir',
            // forceMin: 0,
            // enable: true
        });
        this.doubleTap();
    };

    cleanUp() {
        EventBus.off('update-cursor');
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
    };

    controlPointer() {
        this.joystick.on('update', this.update, this);
    };

    doubleTap() {
        EventBus.on('update-cursor', () => {
            if (!this.pointer) return;
            this.pointer.x = this.scene.cameras.main.width / 2;
            this.pointer.y = this.scene.cameras.main.height / 2;
        });
    };

    update() {
        if (this.joystick.force > 0) {
            if (this.joystick.forceX > 15) {
                this.pointer.x += this.joystick.forceX * FORCE.MULTIPLIER;
            };
            if (this.joystick.forceX < -15) {
                this.pointer.x += this.joystick.forceX * FORCE.MULTIPLIER;
            };
            if (this.joystick.forceY > 15) {
                this.pointer.y += this.joystick.forceY * FORCE.MULTIPLIER;
            };
            if (this.joystick.forceY < -15) {
                this.pointer.y += this.joystick.forceY * FORCE.MULTIPLIER;
            };
        };
    };
};