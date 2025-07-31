import { Cameras, GameObjects, Scene, Sound, Tilemaps, Time } from "phaser";
import { Combat, initCombat } from "../../stores/combat";
import { EventBus } from "../EventBus";
import LootDrop from "../matter/LootDrop";
import Equipment from "../../models/equipment";
import { States } from "../phaser/StateMachine";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import NPC from "../entities/NPC";
import { CombatManager } from "../phaser/CombatManager";
import MiniMap from "../phaser/MiniMap";
import { screenShake } from "../phaser/ScreenShake";
import ParticleManager from "../matter/ParticleManager";
import { Hud, X_OFFSET, X_SPEED_OFFSET, Y_OFFSET, Y_SPEED_OFFSET } from "./Hud";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import { ObjectPool } from "../phaser/ObjectPool";
import Party from "../entities/PartyComputer";
import Ascean from "../../models/ascean";
import { getEnemy, populateEnemy } from "../../assets/db/db";
import { asceanCompiler, Compiler } from "../../utility/ascean";
// import { WindPipeline } from "../shaders/Wind";
// @ts-ignore
import { PhaserNavMeshPlugin } from "phaser-navmesh";
// @ts-ignore
import AnimatedTiles from "phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js";
import { PARTY_OFFSET } from "../../utility/party";
import { FACTION } from "../../utility/player";
import { AoEPool } from "../phaser/AoE";
import { ENTITY_FLAGS } from "../phaser/Collision";
import Treasure from "../matter/Treasure";
import WeatherManager from "../matter/Weather";

export const CHUNK_SIZE = 4096;
const DISTANCE_CLOSE = 640000;
const DISTANCE_MID = 1440000;
const DISTANCE_FAR = 2560000;
const TILE_SIZE = 32;
export const OVERLAY_BUFFER = 64;

interface ChunkData {
    key: string;
    x: number;
    y: number;
    map: Phaser.Tilemaps.Tilemap;
    entities: {
        enemies: Enemy[];
        treasures: Treasure[];
        npcs: NPC[];
    };
    layers: {
        base: Phaser.Tilemaps.TilemapLayer | null;
        climbing: Phaser.Tilemaps.TilemapLayer | null;
        flowers: Phaser.Tilemaps.TilemapLayer | null;
        plants: Phaser.Tilemaps.TilemapLayer | null;
    };
    navMesh: any;
    // overlay: Phaser.GameObjects.Graphics;
};

export class Game extends Scene {
    overlay: GameObjects.Rectangle;
    animatedTiles: any[];
    offsetX: number = 0;
    offsetY: number = 0;
    state: Combat = initCombat;
    player: Player;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] = [];
    party: Party[] = [];
    npcs: NPC[] = [];
    lootDrops: LootDrop[] = [];
    treasures: Treasure[] = [];
    target: GameObjects.Sprite;
    playerLight: GameObjects.PointLight;
    combat: boolean = false;
    stealth: boolean = false;
    combatTime: number = 0;
    combatTimer: Time.TimerEvent;
    tweenManager: any = {};
    particleManager: ParticleManager;
    map: Tilemaps.Tilemap;
    camera: Cameras.Scene2D.Camera;
    minimap: MiniMap;
    navMesh: any = undefined;
    navMeshPlugin: PhaserNavMeshPlugin;
    postFxPipeline: any;
    musicDay: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;
    musicNight: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;
    musicCombat: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;
    musicCombat2: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;
    musicStealth: Sound.NoAudioSound | Sound.HTML5AudioSound | Sound.WebAudioSound;
    fpsText: GameObjects.Text;
    combatManager: CombatManager;
    baseLayer: Tilemaps.TilemapLayer;
    climbingLayer: Tilemaps.TilemapLayer;
    flowers: Tilemaps.TilemapLayer;
    plants: Tilemaps.TilemapLayer;
    matterCollision: any;
    glowFilter: any;
    targetTarget: Enemy;
    hud: Hud;
    scrollingTextPool: ObjectPool<ScrollingCombatText>;
    daytime: number = 0.0;
    compositeTextures: any;
    day: boolean = true;
    aoePool: AoEPool;
    frameCount: number = 0;
    cachedWidthOffset: number = 0;
    cachedHeightOffset: number = 0;
    tileCache = new Map<string, {climb:boolean, water:boolean}>();
    chunkSet: number = 0;
    currentChunkX: number = 0;
    currentChunkY: number = 0;
    isTransitioning: boolean = false;
    loadedChunks: Map<string, ChunkData> = new Map();
    playerChunkX: number = 0;
    playerChunkY: number = 0;
    weather: WeatherManager;
    // fog: any;
    // fogBrush: any;
    // rainParticles: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor () {
        super("Game");
    };

    preload() {
        this.load.scenePlugin("animatedTiles", AnimatedTiles, "animatedTiles", "animatedTiles");
        // this.load.glsl("windShader", "./src/game/shaders/Wind.glsl");
    };

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.hud = hud;
        this.gameEvent();
        this.state = this.registry.get("combat");
        this.player = new Player({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0" });
        if (this.hud.prevScene === "Underground") {
            this.player.setPosition(1410, 130);
        } else if (this.hud.prevScene === "Tutorial") {
            this.player.setPosition(38, 72);
        } else {
            this.player.setPosition(this.hud.settings?.coordinates?.x || 200, this.hud.settings?.coordinates?.y || 200);
        };
        this.hud.updateCoordinates(this.player.x, this.player.y);
        this.loadChunk("ascean_test", this.playerChunkX, this.playerChunkY);
        
        // this.matter.world.createDebugGraphic();

        // this.matter.world.setBounds(-CHUNK_SIZE * 5, -CHUNK_SIZE * 5, CHUNK_SIZE * 5, CHUNK_SIZE * 5);

        // // ==================================================================
        // const map = this.make.tilemap({ key: "ascean_test" });
        // this.map = map;
        // const camps = map.addTilesetImage("Camp_Graves", "Camp_Graves", TILE_SIZE, TILE_SIZE, 0, 0);
        // const decorations = map.addTilesetImage("AncientForestDecorative", "AncientForestDecorative", TILE_SIZE, TILE_SIZE, 0, 0);
        // const tileSet = map.addTilesetImage("AncientForestMain", "AncientForestMain", TILE_SIZE, TILE_SIZE, 1, 2);
        // const campfire = map.addTilesetImage("CampFireB", "CampFireB", TILE_SIZE, TILE_SIZE, 0, 0);
        // const light = map.addTilesetImage("light1A", "light1A", TILE_SIZE, TILE_SIZE, 0, 0);
        // let layer0 = map.createLayer("Tile Layer 0 - Base", tileSet as Tilemaps.Tileset, 0, 0);
        // let layer1 = map.createLayer("Tile Layer 1 - Top", tileSet as Tilemaps.Tileset, 0, 0);
        // let layerC = map.createLayer("Tile Layer - Construction", tileSet as Tilemaps.Tileset, 0, 0);
        // let layer4 = map.createLayer("Tile Layer 4 - Primes", decorations as Tilemaps.Tileset, 0, 0);
        // let layer5 = map.createLayer("Tile Layer 5 - Snags", decorations as Tilemaps.Tileset, 0, 0);
        // let layerT = map.createLayer("Tile Layer - Tree Trunks", decorations as Tilemaps.Tileset, 0, 0);
        // let layerB = map.createLayer("Tile Layer - Camp Base", camps as Tilemaps.Tileset, 0, 0);
        // let layer6 = map.createLayer("Tile Layer 6 - Camps", camps as Tilemaps.Tileset, 0, 0);
        // this.baseLayer = layer0 as Tilemaps.TilemapLayer;
        // this.climbingLayer = layer1 as Tilemaps.TilemapLayer;
        // const layer2 =  map.createLayer("Tile Layer 2 - Flowers", decorations as Tilemaps.Tileset, 0, 0)//?.setVisible(false);
        // const layer3 =  map.createLayer("Tile Layer 3 - Plants", decorations as Tilemaps.Tileset, 0, 0)//?.setVisible(false);
        // this.flowers = layer2 as Tilemaps.TilemapLayer;
        // this.plants = layer3 as Tilemaps.TilemapLayer;
        // map.createLayer("Tile Layer - Campfire", campfire as Tilemaps.Tileset, 0, 0);
        // map.createLayer("Tile Layer - Lights", light as Tilemaps.Tileset, 0, 0);
        // [layer0, layer1, layerB, layerC, layerT, layer4, layer5, layer6].forEach((layer, index) => {
        //     layer?.setCollisionByProperty({ collides: true });
        //     this.matter.world.convertTilemapLayer(layer!);
        //     layer?.forEachTile(tile => {
        //         if ((tile.physics as any).matterBody) {
        //             // console.log((tile.physics as any).matterBody.body.collisionFilter, "Collsion Filter BEFORE");
        //             (tile.physics as any).matterBody.body.collisionFilter = {
        //                 category: ENTITY_FLAGS.WORLD,
        //                 mask: 4294967295, // ENTITY_FLAGS.UPPER_BODY, // Collides with legs/full body
        //                 group: 0, // -1, // Negative group prevents self-collisions
        //             };
        //             // console.log((tile.physics as any).matterBody.body.collisionFilter, "Collsion Filter AFTER");
        //         };
        //     });
        //     if (index < 5) return;
        //     layer?.setDepth(5);
        // });
        // [layer2, layer3].forEach((layer) => { // Flowers, Plants
        //     this.matter.world.convertTilemapLayer(layer!);
        //     layer?.setDepth(2);
        // });
        // // this.matter.world.createDebugGraphic();
        // const objectLayer = map.getObjectLayer('navmesh');
        // const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, TILE_SIZE);
        // this.navMesh = navMesh;

        // // ========================================================================

        // // if (this.game.renderer.type === Phaser.WEBGL) {
        // //     var windPipeline = new WindPipeline(this.game);
        // //     (this.game.renderer as any).pipelines.add('Wind', windPipeline);
        // //     layer2?.setPipeline('Wind');
        // //     layer3?.setPipeline('Wind');
        // //     layer4?.setPipeline('Wind');
        // //     this.time.addEvent({
        // //         delay: 100,
        // //         loop: true,
        // //         callback: () => {
        // //             windPipeline.updateTime(this.time.now / 1000);
        // //         },
        // //         callbackScope: this
        // //     });
        // // };

        // // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // // this.navMesh.enableDebug(debugGraphics); 
        // this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        // (this.sys as any).animatedTiles.init(this.map);
        // this.player = new Player({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0" });
        // if (this.hud.prevScene === "Underground") {
        //     this.player.setPosition(1410, 130);
        // };
        // if (this.hud.prevScene === "Tutorial") {
        //     this.player.setPosition(38, 72);
        // };
        // map?.getObjectLayer("Treasure")?.objects.forEach((treasure:any) => {
        //     const t = new Treasure({ scene:this, x:treasure.x, y:treasure.y });
        //     this.treasures.push(t);
        // });
        // map?.getObjectLayer("Enemies")?.objects.forEach((enemy: any) => {
        //     const e = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: undefined });
        //     this.enemies.push(e);
        //     e.setPosition(enemy.x, enemy.y);
        // });
        // if (this.hud.settings.desktop) {
        //     for (let i = 0; i < 60; ++i) {
        //         const e = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: undefined });
        //         this.enemies.push(e);
        //         e.setPosition(Phaser.Math.Between(200, 3800), Phaser.Math.Between(200, 3800));
        //     };
        // } else { // Mobile pushed to 30 enemies
        //     for (let i = 0; i < 10; ++i) {
        //         const e = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: undefined });
        //         this.enemies.push(e);
        //         e.setPosition(Phaser.Math.Between(200, 3800), Phaser.Math.Between(200, 3800));
        //     };
        // };
        // map?.getObjectLayer("Npcs")?.objects.forEach((npc: any) => 
        //     this.npcs.push(new NPC({ scene: this, x: npc.x, y: npc.y, texture: "player_actions", frame: "player_idle_0" })));


        let camera = this.cameras.main;
        camera.zoom = this.hud.settings.positions.camera.zoom || 0.8;
        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setBounds(0, 0, CHUNK_SIZE, CHUNK_SIZE);
        camera.setLerp(0.1, 0.1);
        camera.setRoundPixels(true);
        
        this.overlay = this.add.rectangle(0, 0, camera.worldView.width, camera.worldView.height, 0x000000, 1)
            .setDepth(99);
        this.weather = new WeatherManager(this);

        this.target = this.add.sprite(0, 0, "target").setDepth(99).setScale(0.15).setVisible(false);
        this.player.inputKeys = {
            up: this?.input?.keyboard?.addKeys("W,UP"),
            down: this?.input?.keyboard?.addKeys("S,DOWN"),
            left: this?.input?.keyboard?.addKeys("A,LEFT"),
            right: this?.input?.keyboard?.addKeys("D,RIGHT"),
            action: this?.input?.keyboard?.addKeys("ONE,TWO,THREE,FOUR,FIVE"),
            strafe: this?.input?.keyboard?.addKeys("E,Q"),
            shift: this?.input?.keyboard?.addKeys("SHIFT"),
            firewater: this?.input?.keyboard?.addKeys("T"),
            tab: this?.input?.keyboard?.addKeys("TAB"),
            escape: this?.input?.keyboard?.addKeys("ESC"),
        }; 
        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 150, 0.05, 0.05);
        this.game.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        this.musicDay = this.sound.add("background2", { volume: this?.hud?.settings?.volume / 2, loop: true });
        this.musicNight = this.sound.add("background", { volume: this?.hud?.settings?.volume / 2, loop: true });
        this.musicCombat = this.sound.add("combat", { volume: this?.hud?.settings?.volume, loop: true });
        this.musicCombat2 = this.sound.add("combat2", { volume: this?.hud?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add("stealthing", { volume: this?.hud?.settings?.volume, loop: true });

        const party = this.registry.get("party");
        if (party.length) {
            for (let i = 0; i < party.length; i++) {
                const p = new Party({scene:this,x:200,y:200,texture:"player_actions",frame:"player_idle_0",data:party[i],position:i});
                this.party.push(p);
                if (this.hud.prevScene === "Underground") p.setPosition(1410, 130);
                if (this.hud.prevScene === "Tutorial") p.setPosition(38, 72);
                if (this.hud.prevScene === "") p.setPosition(this.player.x + (PARTY_OFFSET[i].x / 2), this.player.y + (PARTY_OFFSET[i].y / 2));
            };
        };

        this.particleManager = new ParticleManager(this);
        this.combatManager = new CombatManager(this);
        // this.minimap = new MiniMap(this);
        this.input.mouse?.disableContextMenu();
        this.glowFilter = this.plugins.get("rexGlowFilterPipeline");

        this.startDayCycle();
        
        this.aoePool = new AoEPool(this, 220);
        this.scrollingTextPool = new ObjectPool<ScrollingCombatText>(() =>  new ScrollingCombatText(this, this.scrollingTextPool));
        for (let i = 0; i < 200; i++) {
            this.scrollingTextPool.release(new ScrollingCombatText(this, this.scrollingTextPool));
        };
        this.time.addEvent({
            delay: 10000,
            loop: true,
            callback: () => this.hud.updateCoordinates(this.player.x, this.player.y),
            callbackScope: this           
        });
        EventBus.emit("add-postfx", this);
        EventBus.emit("current-scene-ready", this);
    };

    private updateChunks() {
        this.isTransitioning = true;

        this.loadChunk("ascean_test", this.playerChunkX, this.playerChunkY);
        
        // // 3x3 grid of chunks around player
        // const chunksToLoad: Array<{x: number, y: number}> = [];
        
        // for (let dx = -1; dx <= 1; dx++) {
        //     for (let dy = -1; dy <= 1; dy++) {
        //         const chunkX = this.playerChunkX + (dx * CHUNK_SIZE);
        //         const chunkY = this.playerChunkY + (dy * CHUNK_SIZE);
        //         chunksToLoad.push({ x: chunkX, y: chunkY });
        //     };
        // };
        
        // // Load new chunks that aren't already loaded
        // chunksToLoad.map(chunk => {
        //     const chunkKey = `${chunk.x},${chunk.y}`;
        //     if (!this.loadedChunks.has(chunkKey)) {
        //         this.loadChunk("ascean_test", chunk.x, chunk.y);
        //     };
        // });
        
        // Unload chunks that are too far away (keep 5x5 grid for safety)
        const chunksToUnload: string[] = [];
        this.loadedChunks.forEach((chunkData, chunkKey) => {
            const distance = Math.max(
                Math.abs(chunkData.x - this.playerChunkX) / CHUNK_SIZE,
                Math.abs(chunkData.y - this.playerChunkY) / CHUNK_SIZE
            );
            
            if (distance > 2) { // Unload chunks more than 2 chunks away
                chunksToUnload.push(chunkKey);
            };
        });
        
        // Unload distant chunks
        chunksToUnload.forEach(chunkKey => {
            this.unloadChunk(chunkKey);
        });
        
        // Update camera bounds to encompass loaded area
        this.updateCameraBounds();
        
        // console.log(`%c Updated Chunks. Player at Chunk (${this.playerChunkX}, ${this.playerChunkY})`, "color:gold");
        this.isTransitioning = false;
    };

    private loadChunk(key: string, offsetX: number, offsetY: number): void {
        const chunkKey = `${offsetX},${offsetY}`;
        if (this.loadedChunks.has(chunkKey)) return;
        
        console.log(`Loading chunk: ${chunkKey}`);
        this.player.setActive(false);

        const map = this.make.tilemap({ key });

        const tileSet = map.addTilesetImage("AncientForestMain", "AncientForestMain", TILE_SIZE, TILE_SIZE, 1, 2);
        const decorations = map.addTilesetImage("AncientForestDecorative", "AncientForestDecorative", TILE_SIZE, TILE_SIZE, 0, 0);
        const camps = map.addTilesetImage("Camp_Graves", "Camp_Graves", TILE_SIZE, TILE_SIZE, 0, 0);
        const campfire = map.addTilesetImage("CampFireB", "CampFireB", TILE_SIZE, TILE_SIZE, 0, 0);
        const light = map.addTilesetImage("light1A", "light1A", TILE_SIZE, TILE_SIZE, 0, 0);
        
        const layers = this.createMapLayers(map, offsetX, offsetY, { camps, decorations, tileSet, campfire, light });
        this.setupLayerPhysics(layers.collisionLayers);
        this.setupDecorationLayers(layers.decorationLayers);
        const navMesh = this.setupNavMesh(map, offsetX, offsetY);

        (this.sys as any).animatedTiles.init(map);

        const entities = this.spawnChunkEntities(map, offsetX, offsetY);

        const chunkData: ChunkData = {
            key: chunkKey,
            x: offsetX,
            y: offsetY,
            layers: layers.refLayers,
            map,
            entities,
            navMesh,
        };

        this.loadedChunks.set(chunkKey, chunkData);
        
        console.log(`Successfully Loaded Chunk ${chunkKey}`);
        this.player.setActive(true);
    };

    private createMapLayers(map: Phaser.Tilemaps.Tilemap,offsetX: number, offsetY: number, tilesets: any) {
        const layer0 = map.createLayer("Tile Layer 0 - Base", tilesets.tileSet, offsetX, offsetY);
        const layer1 = map.createLayer("Tile Layer 1 - Top", tilesets.tileSet, offsetX, offsetY);
        const layerC = map.createLayer("Tile Layer - Construction", tilesets.tileSet, offsetX, offsetY);
        const layer4 = map.createLayer("Tile Layer 4 - Primes", tilesets.decorations, offsetX, offsetY);
        const layer5 = map.createLayer("Tile Layer 5 - Snags", tilesets.decorations, offsetX, offsetY);
        const layerT = map.createLayer("Tile Layer - Tree Trunks", tilesets.decorations, offsetX, offsetY);
        const layerB = map.createLayer("Tile Layer - Camp Base", tilesets.camps, offsetX, offsetY);
        const layer6 = map.createLayer("Tile Layer 6 - Camps", tilesets.camps, offsetX, offsetY);
        const layer2 = map.createLayer("Tile Layer 2 - Flowers", tilesets.decorations, offsetX, offsetY);
        const layer3 = map.createLayer("Tile Layer 3 - Plants", tilesets.decorations, offsetX, offsetY);
        map.createLayer("Tile Layer - Campfire", tilesets.campfire, offsetX, offsetY);
        map.createLayer("Tile Layer - Lights", tilesets.light, offsetX, offsetY);
        return {
            refLayers: {
                base: layer0,
                climbing: layer1,
                flowers: layer2,
                plants: layer3
            },
            collisionLayers: [layer0, layer1, layerB, layerC, layerT, layer4, layer5, layer6],
            decorationLayers: [layer2, layer3]
        };
    };
    /*
        type LAYER_TYPE = {
            name: string;
            depth: number;
            layer: Phaser.Tilemaps.TilemapLayer;
        };

        private setupLayers(layers: (Tilemaps.TilemapLayer | undefined)[]) {
            layers.forEach((layer, index) => {
                if (!layer) return;
                
                layer.setCollisionByProperty({ collides: true });
                this.matter.world.convertTilemapLayer(layer);
                
                layer.forEachTile(tile => {
                    if ((tile.physics as any)?.matterBody) {
                        (tile.physics as any).matterBody.body.collisionFilter = {
                            category: ENTITY_FLAGS.WORLD,
                            mask: 4294967295,
                            group: 0,
                        };
                    };
                });
                
                if (index >= 5) {
                    layer.setDepth(5);
                };
            });    
        };
    */

    private setupLayerPhysics(layers: (Tilemaps.TilemapLayer | null)[]) {
        layers.forEach((layer, index) => {
            if (!layer) return;
            
            layer.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer);
            
            layer.forEachTile(tile => {
                if ((tile.physics as any)?.matterBody) {
                    (tile.physics as any).matterBody.body.collisionFilter = {
                        category: ENTITY_FLAGS.WORLD,
                        mask: 4294967295,
                        group: 0,
                    };
                };
            });
            
            if (index >= 5) {
                layer.setDepth(5);
            };
        });
    };

    private setupDecorationLayers(layers: (Tilemaps.TilemapLayer | null)[]) {
        layers.forEach((layer) => {
            if (!layer) return;
            this.matter.world.convertTilemapLayer(layer);
            layer.setDepth(2);
        });
    };

    private setupNavMesh(map: Phaser.Tilemaps.Tilemap, x: number, y: number) {
        const navKey = `navmesh_${x}_${y}`;
        
        const objectLayer = map.getObjectLayer('navmesh');
        objectLayer?.objects.forEach(obj => {
            obj.x! += x; // offsetX
            obj.y! += y; // offsetY
            if (obj.polygon) {
                obj.polygon.forEach(p => {
                    p.x += x;
                    p.y += y;
                });
            };
        });
        return this.navMeshPlugin.buildMeshFromTiled(navKey, objectLayer, TILE_SIZE);
    };

    private unloadChunk(chunkKey: string) {
        const chunkData = this.loadedChunks.get(chunkKey);
        if (!chunkData) return;

        // console.log(`Unloading Chunk: ${chunkKey}`);

        // Clean up entities
        chunkData.entities.enemies.forEach(e => {
            if (e.body && this.matter.world) {
                this.matter.world.remove(e.body);
            };
            e.isDeleting = true;
            e.cleanUp();
            e.destroy();
        });

        chunkData.entities.treasures.forEach(t => {
            if (t.body && this.matter.world) {
                this.matter.world.remove(t.body);
            };
            t.cleanUp();
            t.destroy();
        });

        chunkData.entities.npcs.forEach(n => {
            if (n.body && this.matter.world) {
                this.matter.world.remove(n.body);
            };
            n.cleanUp();
            n.destroy();
        });

        // Clean up navigation mesh
        if (chunkData.navMesh) {
            chunkData.navMesh.destroy();
        };

        // Clean up map physics
        this.cleanupMapPhysics(chunkData.map);

        // Destroy the map
        chunkData.map.destroy();

        // Remove from loaded chunks
        this.loadedChunks.delete(chunkKey);
    };

    private cleanupMapPhysics(map: Phaser.Tilemaps.Tilemap) {
        if (!map) return;
        
        // Get all layers that have physics bodies
        map.layers.forEach(layerData => {
            const layer = layerData.tilemapLayer;
            if (layer) {
                // Remove all tile bodies from Matter world
                layer.forEachTile(tile => {
                    if (tile.physics && (tile.physics as any).matterBody) {
                        this.matter.world.remove((tile.physics as any).matterBody.body);
                    };
                });
            };
        });
    };

    private updateCameraBounds() {
        // Calculate bounds that encompass all loaded chunks
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        this.loadedChunks.forEach(chunk => {
            minX = Math.min(minX, chunk.x);
            minY = Math.min(minY, chunk.y);
            maxX = Math.max(maxX, chunk.x + CHUNK_SIZE);
            maxY = Math.max(maxY, chunk.y + CHUNK_SIZE);
        });
        
        if (minX !== Infinity) {
            this.cameras.main.setBounds(minX, minY, maxX - minX, maxY - minY);
        };
    };

    private spawnChunkEntities(map: Phaser.Tilemaps.Tilemap, offsetX: number, offsetY: number) {
        const enemies: Enemy[] = [];
        const treasures: Treasure[] = [];
        const npcs: NPC[] = [];

        // Spawn treasures
        map?.getObjectLayer("Treasure")?.objects.forEach((treasure: any) => {
            const t = new Treasure({ 
                scene: this, 
                x: treasure.x + 16 + offsetX, 
                y: treasure.y + offsetY 
            });
            this.treasures.push(t);
            treasures.push(t);
        });

        // Spawn enemies from map
        map?.getObjectLayer("Enemies")?.objects.forEach((enemy: any) => {
            const e = new Enemy({ 
                scene: this, 
                x: 200, 
                y: 200, 
                texture: "player_actions", 
                frame: "player_idle_0", 
                data: undefined 
            });
            this.enemies.push(e);
            enemies.push(e);
            e.setPosition(enemy.x + offsetX, enemy.y + offsetY);
        });

        // Spawn additional random enemies
        const enemyCount = this.hud.settings.desktop ? 60 : 20;
        for (let i = 0; i < enemyCount; i++) {
            const e = new Enemy({
                scene: this, 
                x: 200, 
                y: 200, 
                texture: "player_actions", 
                frame: "player_idle_0", 
                data: undefined 
            });
            this.enemies.push(e);
            enemies.push(e);
            e.setPosition(Phaser.Math.Between(offsetX + 200, offsetX + CHUNK_SIZE - 200), Phaser.Math.Between(offsetY + 200, offsetY + CHUNK_SIZE - 200));
        };

        // Spawn NPCs
        map?.getObjectLayer("Npcs")?.objects.forEach((npc: any) => {
            const type = npc.properties.find((prop: {name: string, value: string}) => prop.name === "name").value;
            const n = new NPC({ 
                scene: this, 
                x: npc.x + offsetX, 
                y: npc.y + offsetY, 
                texture: "player_actions", 
                frame: "player_idle_0",
                type
            });
            this.npcs.push(n);
            npcs.push(n);
        });
        return { enemies, treasures, npcs };
    };

    private checkChunkTransition() {
        if (this.isTransitioning) return;
        const { x, y } = this.player;
        const currentChunkX = Math.floor(x / CHUNK_SIZE) * CHUNK_SIZE;
        const currentChunkY = Math.floor(y / CHUNK_SIZE) * CHUNK_SIZE;
        
        if (currentChunkX !== this.playerChunkX || currentChunkY !== this.playerChunkY) {
            this.isTransitioning = true;            
            this.playerChunkX = currentChunkX;
            this.playerChunkY = currentChunkY;
            this.updateChunks();
            this.isTransitioning = false;
        };
    };

    private startDayCycle() {
        if (this.hud.settings?.music === true) {
            if (this.musicNight.isPlaying) {
                this.tweens.add({
                    targets: this.musicNight,
                    volume: 0,
                    duration: 4000,
                    onComplete: () => {
                        if (!this.player.isStealthing) {
                            this.musicNight.stop();
                            this.musicDay.play("", { volume: this.hud.settings.volume });
                        };
                        this.aoePool.shrink(15);
                    }
                });
            } else {
                this.musicDay.play();
            };
        };
        this.day = true;
        this.sound.play("day", { volume: this?.hud?.settings?.volume * 3 });
        const duration = 80000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0, to: 0.25 },
            duration,
            ease: "Sine.easeInOut",
            onComplete: () => this.transitionToEvening()
        });
    };

    private transitionToEvening() {
        const duration = 40000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0.25, to: 0.5 },
            duration,
            ease: "Sine.easeInOut",
            onComplete: () => this.transitionToNight()
        });
    };

    private transitionToNight() {
        if (this.hud.settings?.music === true) {
            if (this.musicDay.isPlaying) {
                this.tweens.add({
                    targets: this.musicDay,
                    volume: 0,
                    duration: 4000,
                    onComplete: () => {
                        if (!this.player.isStealthing) {
                            this.musicDay.stop();
                            this.musicNight.play("", { volume: this.hud.settings.volume });
                        };
                    }
                });
            } else {
                this.musicNight.play();
            };
        };
        this.day = false;
        this.sound.play("night", { volume: this?.hud?.settings?.volume });
        const duration = 40000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0.5, to: 0.65 },
            duration,
            ease: "Sine.easeInOut",
            onComplete: () => this.transitionToMorning()
        });
    };

    private transitionToMorning() {
        const duration = 80000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0.65, to: 0 },
            duration,
            ease: "Sine.easeInOut",
            onComplete: () => this.startDayCycle()
        });
    };

    showCombatText(text: string, duration: number, context: string, critical: boolean, constant: boolean, onDestroyCallback: () => void): ScrollingCombatText {
        const combatText = this.scrollingTextPool.acquire();
        combatText.reset(text, duration, context, critical, constant, onDestroyCallback);
        return combatText;
    };

    cleanUp = (): void => {
        EventBus.off("combat");
        EventBus.off("enemyLootDrop");
        EventBus.off("minimap");
        EventBus.off("aggressive-enemy");
        EventBus.off("update-postfx");
        EventBus.off("update-camera-zoom");
        EventBus.off("update-speed");
        EventBus.off("update-enemy-aggression");
        EventBus.off("update-enemy-special");
        EventBus.off("add-to-party", this.addToParty);
        EventBus.off("despawn-enemy", this.despawnEnemyToParty);
        EventBus.off("kill-enemy", this.killEnemy)
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
            this.enemies[i].destroy();
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].cleanUp();
            this.npcs[i].destroy();
        };
        for (let i = 0; i < this.party.length; i++) {
            this.party[i].cleanUp();
            this.party[i].cleanUp();
        };
        this.player.cleanUp();
    };

    gameEvent = (): void => {
        EventBus.on("combat", (combat: any) => this.state = combat); 
        EventBus.on("enemyLootDrop", (drops: any) => {
            if (drops.scene !== "Game") return;
            drops.drops.forEach((drop: Equipment) => this.lootDrops.push(new LootDrop({ scene: this, enemyID: drops.enemyID, drop })));
        });
        EventBus.on("minimap", () => {
            if (this.minimap.minimap.visible === true) {
                this.minimap.minimap.setVisible(false);
                this.minimap.border.setVisible(false);
                this.minimap.reset.setVisible(false);
            } else {
                this.minimap.minimap.setVisible(true);
                this.minimap.border.setVisible(true);
                this.minimap.minimap.startFollow(this.player);
            };
        });
        EventBus.on("aggressive-enemy", (e: {id: string, isAggressive: boolean}) => {
            let enemy = this.enemies.find((enemy: any) => enemy.enemyID === e.id);
            if (!enemy) return;
            enemy.isAggressive = e.isAggressive;
            if (e.isAggressive === true) {
                enemy.setSpecialCombat(true);
                enemy.currentTarget = this.player;
                enemy.inCombat = true;
                enemy.originPoint = new Phaser.Math.Vector2(enemy.x, enemy.y).clone();
                enemy.stateMachine.setState(States.CHASE);
            };
        });
        EventBus.on("check-stealth", (stealth: boolean) => {
            this.stealth = stealth;
        });
        EventBus.on("update-camera-zoom", (zoom: number) => {
            let camera = this.cameras.main;
            camera.zoom = zoom;
        });
        EventBus.on("update-speed", (data: { speed: number, type: string }) => {
            switch (data.type) {
                case "playerSpeed":
                    this.player.adjustSpeed(data.speed);
                    break;
                case "enemySpeed":
                    for (let i = 0; i < this.enemies.length; i++) {
                        this.enemies[i].adjustSpeed(data.speed);
                    };
                    break;
                default: break;
            };
        });
        EventBus.on("update-enemy-aggression", (aggression: number) => {
            if (this.hud.settings.difficulty.aggressionImmersion) return;
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isAggressive = aggression >= Math.random();
            };
        });
        EventBus.on("update-enemy-aggression-immersion", (aggression: boolean) => {
            if (aggression) {
                for (let i = 0; i < this.enemies.length; i++) {
                    this.enemies[i].isAggressive = this.hud.reputation.factions.find((f: FACTION) => f.name === this.enemies[i].ascean.name)?.aggressive as boolean;
                };
            } else {
                for (let i = 0; i < this.enemies.length; i++) {
                    this.enemies[i].isAggressive = this.hud.settings.difficulty.aggression >= Math.random();
                };
            };
        });
        EventBus.on("update-enemy-special", (special: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isSpecial = special >= Math.random();
            };
        });
        EventBus.on("add-to-party", this.addToParty);
        EventBus.on("remove-from-party", this.removeFromParty);
        EventBus.on("despawn-enemy-to-party", this.despawnEnemyToParty);
        EventBus.on("kill-enemy", this.killEnemy);
    };

    resumeScene = () => {
        this.cameras.main.fadeIn();
        this.resumeMusic();
        this.state = this.registry.get("combat");
        this.player.health = this.state.newPlayerHealth;
        this.player.healthbar.setValue(this.state.newPlayerHealth);
        this.player.healthbar.setTotal(this.state.playerHealth);
        this.registry.set("player", this.player);
        if (this.state.isStealth) {
            this.player.playerMachine.positiveMachine.setState(States.STEALTH);
            this.stealthEngaged(true);
        };
        this.matter.resume();
        this.scene.wake();
        // Add an EventBus.emit("save-this-setting", {coordinates:{x:this.player.x,y:this.player.y}});
        this.hud.updateCoordinates(this.player.x, this.player.y);
        EventBus.emit("current-scene-ready", this);
    };

    switchScene = (current: string) => {
        this.cameras.main.fadeOut().once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
            this.registry.set("combat", this.state);
            this.registry.set("ascean", this.state.player);
            this.player.disengage();
            this.pauseMusic();
            this.matter.pause();
            this.scene.sleep(current);
        });
    };

    getEnemy = (id: string): Enemy | undefined => {
        return this.enemies.find((enemy: any) => enemy.enemyID === id);
    };

    getWorldPointer = () => {
        const pointer = this.hud.rightJoystick.pointer;
        let point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        return point;
    };

    rotateTween = (tween: any, count: number, active: boolean) => {
        if (active === true) {
            if (tween && tween.name) {
                this.tweenManager[tween.name] = this.tweens.add({
                    targets: tween,
                    angle: count * 360,
                    duration: count * 925,
                    ease: "Circ.easeInOut",
                    yoyo: false,
                });
            } else {
                console.warn("Tween or Tween name is undefined.", tween);
            };
        } else {
            if (this.tweenManager[tween.name]) {
                this.tweenManager[tween.name].stop();
            } else {
                console.warn("Tween Manager does not have the specified tween.", tween.name);
            };
        };
    };

    isStateEnemy = (id: string): boolean => id === this.state.enemyID;

    quickCombat = () => {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].inCombat === true) {
                this.player.quickTarget(this.enemies[i]);
                return;    
            };
        };
    };

    clearAggression = () => {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].inCombat === true) {
                if (this.player.health <= 0) {
                    this.enemies[i].clearCombatWin();
                } else {
                    this.enemies[i].clearCombatLoss();
                };
            };
        };
        this.player.currentRound = 0;
    };

    combatEngaged = (bool: boolean) => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (bool === true) {
            screenShake(this);
            this.cameras.main.flash(60, 156, 163, 168, false, undefined, this);
        };
        if (bool === true && this.combat !== bool) {
            this.player.startCombat();
            if (Math.random() > 0.5) {
                this.musicCombat.play();
            } else {
                this.musicCombat2.play();
            };
            if (this.musicDay.isPlaying) this.musicDay.pause();
            if (this.musicNight.isPlaying) this.musicNight.pause();
            if (this.musicStealth.isPlaying) this.musicStealth.stop();
            this.startCombatTimer();
            this.registry.set("inCombat", true);
        } else if (bool === false) {
            this.clearAggression();
            this.musicCombat.stop();
            this.musicCombat2.stop();
            if (this.player.isStealthing) {
                if (this.musicStealth.isPaused) {
                    this.musicStealth.resume();
                } else {
                    this.musicStealth.play();
                };
            } else {
                if (this.day) {
                    this.musicDay.resume();
                } else {
                    this.musicNight.resume();
                };
            };
            this.stopCombatTimer();    
            this.registry.set("inCombat", false);
            this.combatManager.resetCombatFlags();
        };
        this.combat = bool;
        EventBus.emit("combat-engaged", bool);
    };

    stealthEngaged = (bool: boolean) => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (this.hud.settings?.music === false) return;
        if (bool) {
            if (this.musicDay.isPlaying) this.musicDay.pause();
            if (this.musicNight.isPlaying) this.musicNight.pause();
            if (this.musicCombat.isPlaying) this.musicCombat.pause();
            if (this.musicCombat2.isPlaying) this.musicCombat2.pause();
            if (this.musicStealth.isPaused) {
                this.musicStealth.resume();
            } else {
                this.musicStealth.play();
            };
        } else {
            this.musicStealth.stop();
            if (this.combat) {
                if (Math.random() > 0.5) {
                    this.musicCombat.play();
                } else {
                    this.musicCombat2.play();
                };
            } else {
                if (this.day) {
                    this.musicDay.resume();
                } else {
                    this.musicNight.resume();
                };
            };
        };
    };

    pauseMusic = (): void => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (this.musicDay.isPlaying) this.musicDay.pause();
        if (this.musicNight.isPlaying) this.musicNight.pause();
        if (this.musicCombat.isPlaying) this.musicCombat.pause();
        if (this.musicCombat2.isPlaying) this.musicCombat2.pause();
        if (this.musicStealth.isPlaying) this.musicStealth.pause();
    };

    resumeMusic = (): void => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (this.hud.settings?.music === false) return;
        if (!this.combat) {
            if (this.player.isStealthing) {
                if (this.musicStealth.isPaused) {
                    this.musicStealth.resume();
                } else {
                    this.musicStealth.play();
                };
            } else {
                if (this.day) {
                    if (this.musicDay.isPaused) {
                        this.musicDay.resume();
                    } else {
                        this.musicDay.play();
                    };

                } else {
                    if (this.musicNight.isPaused) {
                        this.musicNight.resume();
                    } else {
                        this.musicNight.play();
                    };
                };
            };
        } else {
            if (this.musicCombat.isPaused) {
                this.musicCombat.resume();
            } else {
                this.musicCombat2.resume();
            };
        };
    };

    drinkFlask = (): boolean => EventBus.emit("drink-firewater");

    createEnemy = () => {
        this.time.delayedCall(10000, () => {
            const newEnemy = new Enemy({scene:this, x:200, y:200, texture:"player_actions", frame:"player_idle_0", data:undefined});
            this.enemies.push(newEnemy);
            newEnemy.setPosition(Phaser.Math.Between(200, 3800), Phaser.Math.Between(200, 3800));
        }, undefined, this);
    };

    killEnemy = (enemy: Enemy) => {
        enemy.isDeleting = true;
        EventBus.emit("remove-computer-enemy", enemy.enemyID);
        if (enemy.isCurrentTarget) {
            this.player.disengage();
        };
        this.time.delayedCall(1000, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
            this.createEnemy();
        }, undefined, this);
    };

    addToParty = (party: Ascean) => {
        const position = this.party.length;
        const ascean = populateEnemy(party);
        const compile = asceanCompiler(ascean) as Compiler;
        const newParty = new Party({scene:this,x:200,y:200,texture:"player_actions",frame:"player_idle_0",data:compile, position});
        this.party.push(newParty);
        newParty.setPosition(this.player.x - 40, this.player.y - 40);
    };
    
    despawnEnemyToParty = (id: string) => {
        const enemy = this.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) return;
        enemy.specialCombatText = this.showCombatText(`Excellent! I will not disappoint you, ${this.player.ascean.name}.`, 1500, "bone", false, true, () => enemy.specialCombatText = undefined);
        const party = getEnemy(enemy.ascean.name, enemy.ascean.level);
        this.player.removeEnemy(enemy);
        this.player.disengage();
        this.time.delayedCall(2000, () => {
            enemy.isDeleting = true;
            this.addToParty(party);
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };

    removeFromParty = (remove: Ascean) => {
        const party = this.party.find((e: Party) => e.playerID === remove._id);
        if (!party) return;
        const prevCoords = new Phaser.Math.Vector2(party.x,party.y);
        party.specialCombatText = this.showCombatText(`I understand. I'll be seeing you, ${this.player.ascean.name}.`, 1500, "bone", false, true, () => party.specialCombatText = undefined);
        this.player.disengage();
        this.time.delayedCall(1500, () => {
            this.party = this.party.filter((par: Party) => par.playerID !== remove._id);
            party.isDeleting = true;
            party.cleanUp();
            party.destroy();

            const compile = asceanCompiler(remove) as Compiler;
            const enemy = new Enemy({scene:this,x:200,y:200,texture:"player_actions",frame:"player_idle_0",data:compile});
            this.enemies.push(enemy);
            enemy.setPosition(prevCoords.x, prevCoords.y);
        }, undefined, this);
    };

    checkEnvironment = (entity: Player | Enemy | Party) => {
        if (this.frameCount % 20 !== 0) return;
        const chunkKey = `${this.playerChunkX},${this.playerChunkY}`;
        const chunkData = this.loadedChunks.get(chunkKey);
        if (!chunkData) return;
        const x = chunkData.map.worldToTileX(entity.x || 0) as number;
        const y = chunkData.map.worldToTileY(entity.y || 0) as number;
        const key = `${x},${y}`;
        let cached = this.tileCache.get(key);

        if (!cached) {
            const climb = chunkData.layers?.climbing?.getTileAt(x, y);
            const water = chunkData.layers?.base?.getTileAt(x, y);
            // const climb = this.climbingLayer?.getTileAt(x, y);
            // const water = this.baseLayer?.getTileAt(x, y);
            cached = {
                climb: !!(climb?.properties?.climb),
                water: !!(water?.properties?.water)
            };
            this.tileCache.set(key, cached);
        };
        
        entity.isClimbing = cached.climb;
        entity.inWater = cached.water;

        const flower = chunkData.layers?.flowers?.getTileAt(x as number, y as number);
        if (flower) {
            if (flower.pixelY > entity.y - 8) {
                entity.setDepth(1);
            } else {
                entity.setDepth(3);
            };
        };
        const plant = chunkData.layers?.plants?.getTileAt(x as number, y as number);
        if (plant) {
            if (plant.pixelY > entity.y - 8) {
                entity.setDepth(1);
            } else {
                entity.setDepth(3);
            };
        };
    };

    distanceToPlayer = (entity: Enemy | NPC) => {
        if (!entity || !entity.body) return 6250000; // 2500^2
        if (entity.lastDistanceFrame && (this.frameCount - entity.lastDistanceFrame) < 180) return entity.distanceToPlayer;

        const dx = entity.x - this.player.x;
        const dy = entity.y - this.player.y;
        const distanceSq = dx * dx + dy * dy;
        
        entity.distanceToPlayer = distanceSq;
        entity.lastDistanceFrame = this.frameCount;
        return distanceSq;
    };

    playerUpdate = (delta: number): void => {
        this.player.update(delta);
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
        this.checkEnvironment(this.player);
        this.hud.rightJoystick.update();
        if (this.frameCount % 60 !== 0) return;
        this.checkChunkTransition();
    };

    setCameraOffset = () => {
        if (this.frameCount % 4 !== 0) return;
        if (this.frameCount % 60 === 0) {
            const { width, height } = this.cameras.main.worldView;
            this.cachedWidthOffset = width / X_OFFSET;
            this.cachedHeightOffset = height / Y_OFFSET;
        };
        
        const prevOffsetX = this.offsetX;
        const prevOffsetY = this.offsetY;
        
        if (this.player.flipX) {
            this.offsetX = Math.min(this.cachedWidthOffset, this.offsetX + X_SPEED_OFFSET);
        } else {
            this.offsetX = Math.max(this.offsetX - X_SPEED_OFFSET, -this.cachedWidthOffset);
        };
        
        const playerVelY = this.player.velocity?.y || 0;
        if (playerVelY > 0) {
            this.offsetY = Math.max(this.offsetY - Y_SPEED_OFFSET, -this.cachedHeightOffset);
        } else if (playerVelY < 0) {
            this.offsetY = Math.min(this.cachedHeightOffset, this.offsetY + Y_SPEED_OFFSET);
        };
        
        if (prevOffsetX !== this.offsetX || prevOffsetY !== this.offsetY) {
            this.cameras.main.setFollowOffset(this.offsetX, this.offsetY);
        };
        const { width, height, x, y } = this.cameras.main.worldView;
        this.overlay.width = width + OVERLAY_BUFFER;
        this.overlay.height = height + OVERLAY_BUFFER;
        this.overlay.setPosition(x - OVERLAY_BUFFER / 2, y - OVERLAY_BUFFER / 2);
    };

    startCombatTimer = (): void => {
        if (this.combatTimer) this.combatTimer.destroy();
        this.combatTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.scene.isPaused()) return;
                this.combatTime += 1;
                EventBus.emit("update-combat-timer", this.combatTime);
            },
            callbackScope: this,
            loop: true
        });
    };

    stopCombatTimer = (): void => {
        if (this.combatTimer) this.combatTimer.destroy();
        this.combatTime = 0;
        EventBus.emit("update-combat-timer", this.combatTime);
    };

    checkChunk = (entity: Enemy | NPC): boolean => entity.chunkX === this.playerChunkX && entity.chunkY === this.playerChunkY;
    
    update(_time: number, delta: number): void {
        this.playerUpdate(delta);
        for (let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i], chunk = this.checkChunk(enemy), distance = this.distanceToPlayer(enemy), shouldUpdate = false; // 4096 grid
            if (!chunk) {
                enemy.visible = false;
                enemy.active = false;
                continue;
            };
            if (distance < DISTANCE_CLOSE) { // < 800px
                shouldUpdate = true;
            } else if (distance < DISTANCE_MID) { // < 1200px 30fps
                shouldUpdate = (this.frameCount & 1) === 0;
            } else if (distance < DISTANCE_FAR) { // < 1600px 5fps
                shouldUpdate = this.frameCount % 12 === 0;
            } else { // > 1600px 1fps
                shouldUpdate = this.frameCount % 60 === 0;
            };
            if (shouldUpdate) {
                enemy.visible = true;
                enemy.active = true;
                enemy.update(delta);
                if (enemy.isDeleting) continue;
                this.checkEnvironment(enemy);
            };
        };
        for (let i = 0; i < this.party.length; i++) {
            const party = this.party[i];
            if (party.isDeleting) continue;
            party.update(delta);
            this.checkEnvironment(party);
        };
        for (let i = 0; i < this.npcs.length; i++) {
            let npc = this.npcs[i], chunk = this.checkChunk(npc), distance = this.distanceToPlayer(npc), shouldUpdate = false;
            if (!chunk) {
                npc.visible = false;
                npc.active = false;
                continue;
            };
            if (distance < DISTANCE_CLOSE) shouldUpdate = this.frameCount % 180 === 0;
            if (shouldUpdate) {
                npc.visible = true;
                npc.active = true;
                npc.update();
            };
        };
        this.combatManager.combatMachine.process();
        this.frameCount++;
    };

    pause(): void {
        this.scene.pause();
        this.matter.pause();
        this.pauseMusic();
    };

    resume(): void {
        this.scene.resume();
        this.matter.resume();
        this.resumeMusic();
    };
};