import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import Player from '../entities/Player';
import NPC from '../entities/NPC';
import Joystick from "../phaser/Joystick";
import { Combat } from "../../stores/combat";
import { GameState } from "../../stores/game";
import Settings from "../../models/settings";
import Ascean from "../../models/ascean";
import { useResizeListener } from "../../utility/dimensions";
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';

const dimensions = useResizeListener();

export class Tent extends Scene {
    npc: NPC;
    ascean: Ascean;
    player: Player;
    map: any;
    target: Phaser.GameObjects.Sprite;
    joystick: Joystick;
    rightJoystick: Joystick;
    joystickKeys: any;
    state: Combat;
    gameState: GameState;
    settings: Settings;
    coordinates: Phaser.GameObjects.Text;
    guiPanel: Phaser.GameObjects.Container;
    xCameraButton: Phaser.GameObjects.Rectangle;
    yCameraButton: Phaser.GameObjects.Rectangle;
    xCameraText: Phaser.GameObjects.Text;
    yCameraText: Phaser.GameObjects.Text;

    constructor() {
        super('Tent');
    };

    preload() {};

    create(data: any) {
        this.ascean = data.ascean;
        this.state = data.combat;
        this.gameState = data.game;
        this.settings = data.settings;
        let camera = this.cameras.main;
        camera.zoom = 0.8;

        console.log(this.cameras.main, 'Camera')
        const map = this.make.tilemap({ key: 'tent' });
        this.map = map;
        const camps = map.addTilesetImage('Camp_Graves', 'Camp_Graves', 32, 32, 0, 0);
        const ground = map.addTilesetImage('DeepCaveMainLev', 'DeepCaveMainLev', 32, 32, 0, 0);

        const layer0 = map.createLayer('Ground', ground as Phaser.Tilemaps.Tileset, 0, 0);
        map.createLayer('Camps', camps as Phaser.Tilemaps.Tileset, 0, 0);
        layer0?.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer0 as Phaser.Tilemaps.TilemapLayer);
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        const screenWidth = dimensions().WIDTH;
        const screenHeight = dimensions().HEIGHT;
        const cameraX = (screenWidth - mapWidth) / 2;
        const cameraY = (screenHeight - mapHeight) / 2;
        camera.setPosition(cameraX, cameraY);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.guiPanel = this.add.container(0, 0);
        this.guiPanel.setScrollFactor(0);
        this.guiPanel.setDepth(10);
        // const moveCamera = (x: number, y: number) => {
        //     console.log('Move Camera', x, y);
        //     camera.pan(x, y, 500, 'Linear', true);
        // };

        EventBus.on('move-camera', this.moveCamera);

        // this.xCameraButton = this.add.rectangle(100, 0, 32, 32, 0x000000, 0.5);
        // this.xCameraButton.setInteractive();
        // this.xCameraButton.setScrollFactor(0);
        // this.xCameraButton.setDepth(10);
        // this.xCameraButton.on('pointerdown', () => {
        //     console.log('X Camera Button');
        //     EventBus.emit('move-camera', Math.random() * mapWidth, camera.y);
        // });

        this.xCameraText = this.add.text(100, 0, `X: ${camera.x}`, { font: '16px Cinzel', color: '#fdf6d8' });
        this.xCameraText.setScrollFactor(0);
        this.xCameraText.setOrigin(0.5);
        this.xCameraText.setDepth(10);

        var xInputText = new InputText(this, 100, 32, 100, 32, {
            id: 'xInputText',
            type: 'number',
            text: `${camera.x}`,
            fontSize: '16px',
        })
            .resize(100, 32)
            // .setOrigin(0.5)
            .on('textchange', (inputText: any) => {
                console.log(inputText, 'Input Text');
                this.xCameraText.setText(`X: ${inputText.text}`);
                EventBus.emit('move-camera', Number(inputText.text), camera.y);
        }, this);
        this.add.existing(xInputText);

        this.yCameraText = this.add.text(100, 100, `Y: ${camera.y}`, { font: '16px Cinzel', color: '#fdf6d8' });
        this.yCameraText.setScrollFactor(0);
        this.yCameraText.setOrigin(0.5);
        this.yCameraText.setDepth(10);

        var yInputText = new InputText(this, 100, 132, 100, 32, {
            id: 'yInputText',
            type: 'number',
            text: `${camera.y}`,
            fontSize: '16px',
        })
            .resize(100, 32)
            // .setOrigin(0.5)
            .on('textchange', (inputText: any) => {
                console.log(inputText, 'Input Text');
                this.yCameraText.setText(`Y: ${inputText.text}`);
                EventBus.emit('move-camera', camera.x, Number(inputText.text));
        }, this);
        this.add.existing(yInputText);
        
        // Calculate the position of the top-left corner of the map on the screen
        // const offsetX = (screenWidth - mapWidth) / 2;
        // const offsetY = (screenHeight - mapHeight) / 2;

        // Set the camera viewport to start at the top-left corner of the screen
        // but center the map within the viewport
        // camera.setViewport(offsetX - 100, offsetY - 100, mapWidth, mapHeight);

        // const centerX = this.cameras.main.worldView.centerX;
        // const topY = this.cameras.main.worldView.top;
        // this.coordinates = this.add.text(centerX, topY, 'x: y: ', { font: '16px Cinzel', color: '#fdf6d8' });
        // this.coordinates.setScrollFactor(0);
        // this.coordinates.setOrigin(0.5);
        // this.coordinates.setInteractive()
        //     .on('pointerup', () => {
        //         if (this.scale.isFullscreen) {
        //             this.scale.stopFullscreen();
        //         } else {
        //             this.scale.startFullscreen();
        //         };
        //     });

        this.npc = new NPC({ scene: this, x: -32, y: 64, texture: 'player_actions', frame: 'player_idle_0' });
        this.player = new Player({ scene: this, x: 0, y: 128, texture: 'player_actions', frame: 'player_idle_0' });
        this.player.flipX = true;
        this.player.inputKeys = {
            up: this?.input?.keyboard?.addKeys('W,UP'),
            down: this?.input?.keyboard?.addKeys('S,DOWN'),
            left: this?.input?.keyboard?.addKeys('A,LEFT'),
            right: this?.input?.keyboard?.addKeys('D,RIGHT'),
            attack: this?.input?.keyboard?.addKeys('ONE'),
            parry: this?.input?.keyboard?.addKeys('FIVE'),
            dodge: this?.input?.keyboard?.addKeys('FOUR'),
            posture: this?.input?.keyboard?.addKeys('TWO'),
            roll: this?.input?.keyboard?.addKeys('THREE'), 
            hurt: this?.input?.keyboard?.addKeys('H'),
            consume: this?.input?.keyboard?.addKeys('F'),
            pray: this?.input?.keyboard?.addKeys('R'),
            strafe: this?.input?.keyboard?.addKeys('E,Q'),
            shift: this?.input?.keyboard?.addKeys('SHIFT'),
            firewater: this?.input?.keyboard?.addKeys('T'),
            target: this?.input?.keyboard?.addKeys('TAB'),
            snare: this?.input?.keyboard?.addKeys('V'),
            stalwart: this?.input?.keyboard?.addKeys('G'),
        }; 

        camera.startFollow(this.player);
        camera.setLerp(0.1, 0.1);
        const leftJoystickX = 345;
        const leftJoystickY = 175;
        const rightJoystickX = 100;
        const rightJoystickY = 100;

        this.target = this.add.sprite(0, 0, "target").setDepth(10).setScale(0.15).setVisible(false);
        this.joystick = new Joystick(this, leftJoystickX, leftJoystickY, this.settings.positions.leftJoystick.base, this.settings.positions.leftJoystick.thumb);
        this.rightJoystick = new Joystick(this, rightJoystickX, rightJoystickY, this.settings.positions.rightJoystick.base, this.settings.positions.rightJoystick.thumb);

        this.rightJoystick.joystick.setVisible(false);

        this.joystickKeys = this.joystick.createCursorKeys();
        this.sceneListener();
        EventBus.emit('current-scene-ready', this);
    };

    moveCamera = (x: number, y: number) => {
        console.log('Move Camera', x, y);
        // camera.pan(x, y, 500, 'Linear', true);
        let camera = this.cameras.main;
        // camera.pan(x, y, 500, 'Linear', true);
        camera.setPosition(x, y);
        // this.cameras.main.pan(x, y, 500, 'Linear', true);
        this.xCameraText.setText(`X: ${x}`);
        this.yCameraText.setText(`Y: ${y}`);
    };

    pause = () => {
        this.scene.pause();
    };
    resume = () => {
        this.scene.resume();
    };

    clearNAEnemy = () => EventBus.emit('clear-enemy');
    clearNPC = () => EventBus.emit('clear-npc'); 
    combatEngaged = (bool: boolean) => {
        console.log(`Combat Engaged: ${bool}`);
        EventBus.emit('combat-engaged', bool);
        if (bool) {
            // this.combatTimerText.setVisible(true);
        } else {
            // this.combatTimerText.setVisible(false);
        };
    };
    setupNPC = (npc: any) => {
        const data = { id: npc.id, game: npc.ascean, enemy: npc.combatStats, health: npc.health, type: npc.npcType };
        EventBus.emit('setup-npc', data);    
    };
    showDialog = (dialog: boolean) => EventBus.emit('blend-game', { dialogTag: dialog }); // smallHud: dialog
    sceneListener() {
        EventBus.on('ascean', (ascean: Ascean) => {
            this.ascean = ascean;
        });
        EventBus.on('combat', (combat: any) => {
            this.state = combat;
        });
        EventBus.on('action-button-sound', () => {
            this.sound.play('TV_Button_Press', { volume: this?.settings?.volume * 2 });
        });
        EventBus.on('equip-sound', () => {
            this.sound.play('equip', { volume: this.settings.volume });
        });
        EventBus.on('unequip-sound', () => {
            this.sound.play('unequip', { volume: this.settings.volume });
        });
        EventBus.on('purchase-sound', () => {
            this.sound.play('purchase', { volume: this.settings.volume });
        });
        EventBus.on('switch-scene', (data: { current: string, next: string }) => {
            if (data.current !== 'Tent') return;
            this.scene.stop(data.current);
            EventBus.emit('wake-up', data.next);
        });
    };
    useStamina = (value: number) => EventBus.emit('update-stamina', value);
    update() {
        this.npc.update();
        this.player.update();
        // this.coordinates.setText(`X: ${this.player.x.toFixed(2)} Y: ${this.player.y.toFixed(2)}
        //     WorldX: ${this.cameras.main.getWorldPoint(this.player.x, this.player.y).x.toFixed(2)}
        //     WorldY: ${this.cameras.main.getWorldPoint(this.player.x, this.player.y).y.toFixed(2)}
        // `); 
    };
};