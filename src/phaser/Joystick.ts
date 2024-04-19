import Phaser from 'phaser';
import { EventBus } from '../game/EventBus';

const FORCE = {
    MULTIPLIER: 0.1,
};

export default class Joystick extends Phaser.GameObjects.Container {
    public play: any;
    private pointer: any;
    private joystick: any;

    constructor(scene: any, x: number, y: number) {
        super(scene, x, y);
        this.play = scene;
        this.play.add.existing(this);
        this.pointer = null;
        this.joystick = scene.plugins.get('rexVirtualJoystick').add(scene, {
            x: x,
            y: y,
            radius: window.innerHeight / 6,
            base: scene.add.circle(0, 0, window.innerHeight / 6, 0x000000, 0.25),
            thumb: scene.add.circle(0, 0, window.innerHeight / 12, 0xfdf6d8, 0.25),
            dir: '8dir',
            // forceMin: 0,
            // enable: true
        })
        // .on('pointerdown', function(pointer: any,){
        //     pointer.event.preventDefault();
        //     pointer.event.stopPropagation();
        // })
        // .on('pointerup', function(pointer: any){
        //     // console.log(pointer, '--- pointerup ---');
        // });
        this.doubleTap();
    };

    createCursorKeys() {
        return this.joystick.createCursorKeys();
    };

    createPointer(scene: any) {
        this.pointer = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'cursor');
        this.pointer.setScrollFactor(0);
    };

    controlPointer() {
        this.joystick.on('update', this.update, this);
    };

    doubleTap() {
        EventBus.on('update-cursor', () => {
            if (!this.pointer) return;
            this.pointer.x = this.play.cameras.main.width / 2;
            this.pointer.y = this.play.cameras.main.height / 2;
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