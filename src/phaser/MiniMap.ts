import { Game } from "../game/scenes/Game";
import { Underground } from "../game/scenes/Underground";

const SCALE_FACTOR = 0.3;
const X = 0.675;
const Y = 0.05;
const ZOOM = 0.125;

export default class MiniMap extends Phaser.Scene {
    minimap: Phaser.Cameras.Scene2D.Camera;
    border: Phaser.GameObjects.Rectangle;
    reset: Phaser.GameObjects.Rectangle;
    constructor(scene: Game | Underground) {
        super('Mini');
        const x = scene.scale.width * X;
        const y = scene.scale.height * Y;
        const height = scene.scale.height * SCALE_FACTOR;
        const width = scene.scale.width * SCALE_FACTOR;
        this.minimap = scene.cameras.add(
            x,
            y,
            width,
            height,
            false,
            'minimap'
        )
        .setOrigin(0.5)
        .setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels)
        .startFollow(scene.player)
        .setLerp(0.1)
        .setVisible(false)
        .setZoom(ZOOM)
        .ignore(scene.actionBar)
        .ignore(scene.smallHud.bar)
        .ignore(scene.smallHud.stances)
        .ignore(scene.target)
        .ignore(scene.joystick.joystick.base)
        .ignore(scene.joystick.joystick.thumb)
        .ignore(scene.rightJoystick.joystick.base)
        .ignore(scene.rightJoystick.joystick.thumb)
        .ignore(scene.rightJoystick.pointer)
        .on('pointerdown', (pointer: any) => {
            this.minimap.scrollX = pointer.worldX;
            this.minimap.scrollY = pointer.worldY;
        });

        this.reset = scene.add.rectangle(
            scene.scale.width + 60,
            y + height + 16,
            width / 6.5,
            height / 3,
            0xFF0000,
            1
        )
        .setDepth(6)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0x000000)
        .setScrollFactor(0)
        .setVisible(false)
        .setInteractive()
        .on('pointerdown', () => {
            this.minimap.startFollow(scene.player);
            this.reset.setVisible(false);
        });
        this.border = scene.add.rectangle(
            x + 36,
            y - 46,
            width + 4,
            height + 4,
            0x000000, 0.5
        )
        .setDepth(6)
        .setInteractive()
        .setOrigin(0)
        .setScale(1 / 0.8)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0x000000)
        .setVisible(false)
        .on('pointerdown', (pointer: any) => {
            this.minimap.stopFollow();
            this.reset.setVisible(true);
            const mini = this.minimap.getWorldPoint(pointer.x, pointer.y);
            this.minimap.setScroll(mini.x, mini.y);
        });
        this.minimap.ignore(this.reset);
        this.minimap.ignore(this.border);
    };
};