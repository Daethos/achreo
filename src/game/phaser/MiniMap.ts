import { Game } from "../scenes/Game";
import { Underground } from "../scenes/Underground";

const SCALE_FACTOR = 0.3, X = 0.675, Y = 0.05, ZOOM = 0.2; // 125

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
        .setAlpha(0.75)
        .setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels)
        .startFollow(scene.player)
        .setLerp(0.1)
        .setOrigin(0.5)
        .setVisible(false)
        .setZoom(ZOOM)
        .ignore(scene.hud.actionBar)
        .ignore(scene.hud.smallHud.bar)
        .ignore(scene.hud.smallHud.stances)
        .ignore(scene.target)
        .ignore(scene.hud.joystick.joystick.base)
        .ignore(scene.hud.joystick.joystick.thumb)
        .ignore(scene.hud.rightJoystick.joystick.base)
        .ignore(scene.hud.rightJoystick.joystick.thumb)
        .ignore(scene.hud.rightJoystick.pointer)
        .on('pointerdown', (pointer: any) => {
            this.minimap.scrollX = pointer.worldX;
            this.minimap.scrollY = pointer.worldY;
        });
        this.reset = scene.hud.add.rectangle(
            this.minimap.x + this.minimap.width - 15,
            this.minimap.y + this.minimap.height + 30,
            30,
            30,
            0xFF0000, 1
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
        this.border = scene.hud.add.rectangle(
            this.minimap.x - 2, // x + 24,
            this.minimap.y - 2, //y - 34,
            this.minimap.width + 4,
            this.minimap.height + 4,
            0x000000, 0.15
        )
        .setDepth(0)
        .setInteractive()
        .setOrigin(0)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0x000000)
        .setVisible(false)
        .on('pointerdown', (pointer: any) => {
            this.minimap.stopFollow();
            this.reset.setVisible(true);
            const mini = this.minimap.getWorldPoint(pointer.x, pointer.y);
            this.minimap.setScroll(mini.x, mini.y);
        });
        this.minimap.ignore(this.border);
        this.minimap.ignore(this.reset);
        scene.scene.bringToTop(this);

        scene.input.keyboard?.on('keydown-M', () => {
            if (this.minimap.visible === true) {
                this.minimap.setVisible(false);
                this.border.setVisible(false);
                this.reset.setVisible(false);
            } else {
                this.minimap.setVisible(true);
                this.border.setVisible(true);
                this.minimap.startFollow(scene.player);
            };
        });
    };
};