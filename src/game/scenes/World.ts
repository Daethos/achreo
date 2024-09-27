import Settings from "../../models/settings";
import { Game } from "./Game";
// @ts-ignore
import Player from '../entities/Player';
// @ts-ignore
import Enemy from '../entities/Enemy';
// @ts-ignore
import NPC from '../entities/NPC';
import { EventBus } from "../EventBus";

export class World extends Phaser.Scene {
    host: Game;
    map: any;
    settings: Settings;
    navMesh: any;
    navMeshPlugin: any;;
    enemies: Enemy[];
    npcs: NPC[];
    minimap: any;
    minimapReset: any;
    minimapBorder: any;

    constructor() {
        super('World');
    };

    preload() {};

    create(host: Game) {
        this.host = host;
        let camera = this.cameras.main;
        camera.zoom = host.settings.positions?.camera?.zoom || 0.8; // 0.8 

        const map = this.make.tilemap({ key: 'ascean_test' });
        this.map = map;
        const tileSize = 32;
        const camps = map.addTilesetImage('Camp_Graves', 'Camp_Graves', tileSize, tileSize, 0, 0);
        const decorations = map.addTilesetImage('AncientForestDecorative', 'AncientForestDecorative', tileSize, tileSize, 0, 0);
        const tileSet = map.addTilesetImage('AncientForestMain', 'AncientForestMain', tileSize, tileSize, 0, 0);
        const campfire = map.addTilesetImage('CampFireB', 'CampFireB', tileSize, tileSize, 0, 0);
        const light = map.addTilesetImage('light1A', 'light1A', tileSize, tileSize, 0, 0);
        let layer0 = map.createLayer('Tile Layer 0 - Base', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        let layerC = map.createLayer('Tile Layer - Construction', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        let layer1 = map.createLayer('Tile Layer 1 - Top', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        let layer4 = map.createLayer('Tile Layer 4 - Primes', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        let layer5 = map.createLayer('Tile Layer 5 - Snags', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        let layer6 = map.createLayer('Tile Layer 6 - Camps', camps as Phaser.Tilemaps.Tileset, 0, 0);
        host.baseLayer = layer0;
        host.climbingLayer = layer1;
        const layer2 =  map.createLayer('Tile Layer 2 - Flowers', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        const layer3 =  map.createLayer('Tile Layer 3 - Plants', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        host.flowers = layer2;
        host.plants = layer3;
        
        map.createLayer('Tile Layer - Campfire', campfire as Phaser.Tilemaps.Tileset, 0, 0);
        let lights = map.createLayer('Tile Layer - Lights', light as Phaser.Tilemaps.Tileset, 0, 0);
        lights?.setDepth(5);
        [layer0, layer1, layerC, layer4, layer5, layer6].forEach((layer, index) => { // castle_bottom, castle_top, 
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            if (index < 3) return;
            layer?.setDepth(5);
        });
        [layer2, layer3].forEach((layer) => { // castle_bottom, castle_top, 
            this.matter.world.convertTilemapLayer(layer!);
            layer?.setDepth(3);
        });

        const objectLayer = map.getObjectLayer('navmesh');
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.navMesh.enableDebug(debugGraphics); 
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels); // Top Down
        (host.sys as any).animatedTiles.init(this.map);
        host.player = new Player({ scene: host, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });

        map?.getObjectLayer('Enemies')?.objects.forEach((enemy: any) => 
            host.enemies.push(new Enemy({ scene: host, x: enemy.x, y: enemy.y, texture: 'player_actions', frame: 'player_idle_0' })));
        map?.getObjectLayer('Npcs')?.objects.forEach((npc: any) => 
            host.npcs.push(new NPC({ scene: host, x: npc.x, y: npc.y, texture: 'player_actions', frame: 'player_idle_0' })));
        // =========================== Camera =========================== \\
        camera.startFollow(host.player, false, 0.1, 0.1, );
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.setRoundPixels(true);

        host.player.inputKeys = {
            up: this?.input?.keyboard?.addKeys('W,UP'),
            down: this?.input?.keyboard?.addKeys('S,DOWN'),
            left: this?.input?.keyboard?.addKeys('A,LEFT'),
            right: this?.input?.keyboard?.addKeys('D,RIGHT'),
            attack: this?.input?.keyboard?.addKeys('ONE'),
            parry: this?.input?.keyboard?.addKeys('FIVE'),
            dodge: this?.input?.keyboard?.addKeys('FOUR'),
            posture: this?.input?.keyboard?.addKeys('TWO'),
            roll: this?.input?.keyboard?.addKeys('THREE'), 
            strafe: this?.input?.keyboard?.addKeys('E,Q'),
            shift: this?.input?.keyboard?.addKeys('SHIFT'),
            firewater: this?.input?.keyboard?.addKeys('T'),
        }; 
        host.playerLight = this.add.pointlight(host.player.x, host.player.y, 0xDAA520, 200, 0.0675, 0.0675); // 0xFFD700 || 0xFDF6D8 || 0xDAA520

        // =========================== Mini Map =========================== \\
        this.minimap = this.cameras.add((this.scale.width * 0.5) - (this.scale.width * 0.1171875), this.scale.height * 0.75, this.scale.width * 0.234375, this.scale.height * 0.234375).setName('mini');
        this.minimap.setOrigin(0.5); 
        this.minimap.setBounds(0, 0, 4096, 4096);
        this.minimap.zoom = 0.125;
        this.minimap.startFollow(host.player);
        this.minimap.setLerp(0.1, 0.1);
        this.minimap.setBackgroundColor(0x000000); // Suggested
        this.minimap.ignore(host.actionBar);
        // this.minimap.ignore(this.fpsText);
        // this.minimap.ignore(this.combatTimerText);
        this.minimap.ignore(host.target);
        this.minimap.ignore(host.joystick.joystick.base);
        this.minimap.ignore(host.joystick.joystick.thumb);
        this.minimap.ignore(host.rightJoystick.joystick.base);
        this.minimap.ignore(host.rightJoystick.joystick.thumb);
        this.minimap.ignore(host.rightJoystick.pointer);
        this.minimap.setVisible(false);
        this.minimap.on('pointerdown', (pointer: any) => {
            this.minimap.scrollX = pointer.worldX; 
            this.minimap.scrollY = pointer.worldY; 
        });

        this.minimapReset = this.add.rectangle((this.scale.width * 0.3125), this.scale.height * 1.05 + 5, this.scale.width * 0.1 * (this.scale.height / this.scale.width), this.scale.height * 0.1);
        this.minimapReset.setDepth(0);
        this.minimapReset.setOrigin(0.5);
        this.minimapReset.setFillStyle(0xFF0000, 1);
        this.minimapReset.setStrokeStyle(2, 0x000000);
        this.minimapReset.setScrollFactor(0);
        this.minimapReset.setInteractive();
        this.minimapReset.on('pointerdown', () => {
            this.minimap.startFollow(host.player);
            this.minimapReset.setVisible(false);
        });
        this.minimapReset.setVisible(false);
        this.minimap.ignore(this.minimapReset);

        this.minimapBorder = this.add.rectangle((this.scale.width * 0.5 + 1) , this.scale.height * 0.95 + 5, this.scale.width * 0.234375 + 4 , this.scale.height * 0.234375 + 4);
        this.minimapBorder.setDepth(0);
        this.minimapBorder.setOrigin(0.5); 
        this.minimapBorder.setFillStyle(0x000000, 0.5);
        this.minimapBorder.setStrokeStyle(2, 0x000000);
        this.minimapBorder.setScrollFactor(0);
        this.minimapBorder.setScale(1 / camera.zoom);
        this.minimapBorder.setInteractive();
        this.minimapBorder.setVisible(false);
        this.minimapBorder.on('pointerdown', (pointer: any) => {
            this.minimap.stopFollow();
            this.minimapReset.setVisible(true);
            const world = this.minimap.getWorldPoint(pointer.x, pointer.y);
            this.minimap.setScroll(world.x, world.y);
        });
        this.minimap.ignore(this.minimapBorder);

        EventBus.emit('game-map-load', {camera, map: this.map});
    };
};