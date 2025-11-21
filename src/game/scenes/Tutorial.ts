import { Combat, initCombat } from "../../stores/combat";
import { EventBus } from "../EventBus";
import LootDrop from "../matter/LootDrop";
import Equipment from "../../models/equipment";
import { States } from "../phaser/StateMachine";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import { CombatManager } from "../phaser/CombatManager";
import { screenShake } from "../phaser/ScreenShake";
import ParticleManager from "../matter/ParticleManager";
import { Hud, X_OFFSET, X_SPEED_OFFSET, Y_OFFSET, Y_SPEED_OFFSET } from "./Hud";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import { ObjectPool } from "../phaser/ObjectPool";
import { Compiler } from "../../utility/ascean";
import DM from "../entities/DM";
// @ts-ignore
import AnimatedTiles from "phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js";
// @ts-ignore
import { PhaserNavMeshPlugin } from "phaser-navmesh";
import Party from "../entities/PartyComputer";
import { AoEPool } from "../phaser/AoE";
import { ENTITY_FLAGS } from "../phaser/Collision";
import { Entity } from "../main";
import { ExperienceManager } from "../phaser/ExperienceManager";
import { ChatManager } from "../phaser/ChatManager";
import { ParticleTextures } from "../matter/ParticleTextures";
import { fetchTutorial } from "../../utility/enemy";
import Treasure from "../matter/Treasure";
import { getSpecificItem, Item } from "../../models/item";
import { updateItemData } from "../../assets/db/db";
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
interface ChunkData {
    key: string;
    x: number;
    y: number;
    map: Phaser.Tilemaps.Tilemap;
    entities: {
        enemies: Enemy[];
    };
    navMesh: any;
    overlay: Phaser.GameObjects.Graphics;
};

const PROGRESSION = {
    WELCOME: "welcome", 
    MOVEMENT: "movement", 
    SETTINGS: "settings", 
    COMBAT: "combat", 
    IMPROVEMENT: "improvement",
    RESOLUTION: "resolution",
    ENEMY: "enemy",
    ARENA: "arena",
    FINAL: "final",
    EXIT: "exit"
};

const tileSize = 32;

export class Tutorial extends Phaser.Scene {
    animatedTiles: any[];
    offsetX: number = 0;
    offsetY: number = 0;
    state: Combat = initCombat;
    player: Player;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] = [];
    party: Party[] = [];
    dms: DM[] = [];
    dm: DM;
    lootDrops: LootDrop[] = [];
    target: Phaser.GameObjects.Sprite;
    playerLight: Phaser.GameObjects.PointLight;
    combat: boolean = false;
    stealth: boolean = false;
    combatTime: number = 0;
    combatTimer: Phaser.Time.TimerEvent;
    tweenManager: any = {};
    particleManager: ParticleManager;
    map: Phaser.Tilemaps.Tilemap;
    camera: Phaser.Cameras.Scene2D.Camera;
    navMesh: any;
    navMeshPlugin: PhaserNavMeshPlugin;
    musicBackground: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat2: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    combatManager: CombatManager;
    matterCollision: any;
    glowFilter: any;
    targetTarget: Enemy;
    hud: Hud;
    scrollingTextPool: ObjectPool<ScrollingCombatText>;
    aoePool: AoEPool;
    frameCount: number = 0;
    cachedWidthOffset: number = 0;
    cachedHeightOffset: number = 0;
    isTransitioning: boolean = false;
    loadedChunks: Map<string, ChunkData> = new Map();
    playerChunkX: number = 0;
    playerChunkY: number = 0;
    experienceManager: ExperienceManager;
    chatManager: ChatManager;
    completedSections: Set<string> = new Set();
    triggers: any[] = [];
    particleGenerator: ParticleTextures;
    treasures: Treasure[] = [];
    tileCache = new Map<string, {climb:boolean, water:boolean}>();
    climbing: any;
    swimming: any;
    private treeComposites: { id: string; x: number; y: number; bottomY: number; width: number; height: number; tiles: Phaser.Tilemaps.Tile[] }[] = [];

    constructor () {
        super("Tutorial");
    };

    preload() {
        this.load.scenePlugin("animatedTiles", AnimatedTiles, "animatedTiles", "animatedTiles");
    };

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.hud = hud;
        this.gameEvent();
        this.state = this.registry.get("combat");
        const map = this.make.tilemap({ key: "new_tutorial" }); // tutorial
        this.map = map;
        const tileSet = map.addTilesetImage("MainLev2.0", "MainLev2.0", tileSize, tileSize, 1, 2) as Phaser.Tilemaps.Tileset;
        const decorative = map.addTilesetImage("decorative", "decorative", tileSize, tileSize, 0, 0) as Phaser.Tilemaps.Tileset;
        const waterLayer = map.addTilesetImage("water_layerA_ef", "water_layerA_ef", 160, 96, 0, 0) as Phaser.Tilemaps.Tileset;
        const water1 = map.addTilesetImage("Water_tafle_1B", "Water_tafle_1B", tileSize, tileSize, 0, 0) as Phaser.Tilemaps.Tileset;
        const water2 = map.addTilesetImage("Water_tafle_2B", "Water_tafle_2B", tileSize, tileSize, 0, 0) as Phaser.Tilemaps.Tileset;
        const water3 = map.addTilesetImage("Water_tafle_3B", "Water_tafle_3B", tileSize, tileSize, 0, 0) as Phaser.Tilemaps.Tileset;
        const water4 = map.addTilesetImage("Water_tafle_4B", "Water_tafle_4B", tileSize, tileSize, 0, 0) as Phaser.Tilemaps.Tileset;

        let layer0 = map.createLayer("Base", [tileSet, waterLayer], 0, 0) as Phaser.Tilemaps.TilemapLayer;
        let layer1 = map.createLayer("Water Top", [tileSet, waterLayer, water1, water2, water3, water4], 0, 0) as Phaser.Tilemaps.TilemapLayer;
        let layer2 = map.createLayer("Top", [tileSet, decorative], 0, 0) as Phaser.Tilemaps.TilemapLayer;
        let layer3 = map.createLayer("Flora Base", decorative, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        let layer4 = map.createLayer("Flora Top", decorative, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        let layer5 = map.createLayer("Earth Base", decorative, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        let layer6 = map.createLayer("Earth Top", [tileSet, decorative], 0, 0) as Phaser.Tilemaps.TilemapLayer;

        this.climbing = [layer2, layer5, layer6];
        this.swimming = layer0;

        [layer0, layer1, layer2, layer3, layer4, layer5, layer6].forEach((layer) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            layer?.forEachTile(tile => {
                if ((tile.physics as any).matterBody) {
                    (tile.physics as any).matterBody.body.collisionFilter = {
                        category: ENTITY_FLAGS.WORLD,
                        mask: 4294967295, // ENTITY_FLAGS.UPPER_BODY, // Collides with legs/full body
                        group: 0, // -1, // Negative group prevents self-collisions
                    };
                };
            });
        });

        this.buildTreeComposites([layer2, layer3, layer4]);

        // const posts = map.getObjectLayer("Posts");
        const triggerLayer = map.getObjectLayer("Triggers");

        triggerLayer?.objects.forEach(triggerObj => {
            this.createMatterTrigger(triggerObj);
        });


        const objectLayer = map.getObjectLayer("navmesh");
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.player = new Player({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0" });
        this.player.setPosition(965, 328);
        if (this.hud.prevScene !== "Game") {
            this.player.setPosition(this.hud.settings?.coordinates?.x || 965, this.hud.settings?.coordinates?.y || 328);
        } else if (this.hud.prevScene === "Game") {
            this.player.setPosition(1024, 104);
        };

        (this.sys as any).animatedTiles.init(map);
        
        this.chatManager = new ChatManager(this);
        this.combatManager = new CombatManager(this);
        this.experienceManager = new ExperienceManager(this);
        this.particleManager = new ParticleManager(this);

        map?.getObjectLayer("Npcs")?.objects.forEach((npc: any) => 
            this.dm = new DM({ scene: this, x: npc.x, y: npc.y, texture: "player_actions", frame: "player_idle_0", npcType: "Tutorial Teacher", id: 12 })
        );
        this.dm.setPosition(1036, 328);

        this.time.addEvent({
            delay: 10000,
            loop: true,
            callback: () => this.hud.updateCoordinates(this.player.x, this.player.y),
            callbackScope: this           
        });

        this.particleGenerator = new ParticleTextures(this);

        // map?.getObjectLayer("pillars")?.objects.forEach((pillar: any) => {
        //     const type = pillar.properties?.[0].value;
        //     const graphics = new Phaser.Physics.Matter.Image(this.matter.world, pillar.x, pillar.y, "beam");
        //     const shift = {x: type === "exit" ? 32 : 16, y: 16}
        //     const sensor = Bodies.circle(pillar.x + shift.x, pillar.y + shift.y, 16, { isSensor: true, label: `${type}PillarSensor` });
        //     graphics.setExistingBody(sensor);
        //     graphics.setCollisionCategory(ENTITY_FLAGS.WORLD);
        //     const body = 
        //         type === "game" ? `This is an action roleplaying game. As you may have noted, you've created a character and entered this world. \n\n You can speak to and attack any enemy (who are tinted red), or spreak to helpful npcs (tinted in blue) and trade with local merchants to yield better equipment and improve yourself.` :
        //         type === "movement" ? `The game starts with mobile in mind; twin joysticks for movement and aiming (ranged and specials). \n\n The left joystick allows you to move your character, and the right is used for certain special abilities and manual targeting if you have it enabled in the settings menu. \n\n However, in desktop, the keyboard and mouse are both modular and can be used for either movement or actions.` :
        //         type === "combat" ? `The Physical and Special action buttons allow you to perform damage in combat. \n\n Physically, everyone is capable of swinging their weapon and/or shooting projectiles, in addition to forms of evasion with dodge and roll. \n\n With Specials, you are restricted to your current 'mastery', and perform specialized abilities that can heal yourself, directly damage the enemy, or control them via magical effects.` :
        //         type === "settings" ? `Clicking on your name, your character in-game, or toggling the book menu and clicking on the first 'player' icon will all lead you to the main settings menu. \n\n From here, you can tab and change multiple options for gameplay concerns, including but not limited to: enemy aggression, special capability, and movement speed.` :
        //         type === "improvement" ? `Defeated enemies drop loot, and chances are that it may be an improvement of your current garb. \n\n Merchants also sell multitudes of armor, shields, and weapons, with some being able to forge greater qualities from lesser ones. \n\n You can compare and contrast the different peculiarities of each item and decide how to augment and enhance your character, even in combat.` :
        //         type === "exit" ? "If you feel comfortable with what you've learned and have a fair understanding of what this game asks of you, feel free to enter the world and explore!" : "";
        //     const extra = 
        //         type === "movement" ? "Movement" :
        //         type === "combat" ? "Combat" :
        //         type === "settings" ? "Settings" :
        //         type === "exit" ? "Enter World" : "";
        //     this.matterCollision.addOnCollideStart({
        //         objectA: [sensor],
        //         callback: (other: any) => {
        //             if (other.gameObjectB?.name !== "player") return;
        //             EventBus.emit("alert", { header: `${type.charAt(0).toUpperCase() + type.slice(1)} Post`, body, delay: 60000, key: "Close", extra });
        //         },
        //         context: this
        //     });
        // });
        
        // for (let i = 0; i < 16; i++) {
        //     const e = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: undefined });
        //     this.enemies.push(e);
        //     e.setPosition(Phaser.Math.Between(200, 800), Phaser.Math.Between(200, 800));
        // };

        // for (let i = 0; i < 1; i++) {
        //     const e = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: undefined });
        //     this.enemies.push(e);
        //     e.setPosition(this.player.x + 50, this.player.y);
        //     e.stateMachine.setState(States.DEFEATED);
        // };

        let camera = this.cameras.main;
        camera.zoom = this.hud.settings.positions?.camera?.zoom;
        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.setRoundPixels(true);

        this.target = this.add.sprite(0, 0, "target").setDepth(99).setScale(0.15).setVisible(false);
        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 150, 0.05, 0.05);
        this.game.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        this.musicBackground = this.sound.add(Math.random() > 0.5 ? "background" : "background2", { volume: this?.hud?.settings?.volume / 2 || 0.1, loop: true });
        this.musicCombat = this.sound.add("combat", { volume: this?.hud?.settings?.volume, loop: true });
        this.musicCombat2 = this.sound.add("combat2", { volume: this?.hud?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add("stealthing", { volume: this?.hud?.settings?.volume, loop: true });
        if (this.hud.settings?.music === true) this.musicBackground.play();
        this.input.mouse?.disableContextMenu();

        this.glowFilter = this.plugins.get("rexGlowFilterPipeline");
        this.aoePool = new AoEPool(this, 30);
        this.scrollingTextPool = new ObjectPool<ScrollingCombatText>(() =>  new ScrollingCombatText(this, this.scrollingTextPool));
        for (let i = 0; i < 50; i++) {
            this.scrollingTextPool.release(new ScrollingCombatText(this, this.scrollingTextPool));
        };
        
        EventBus.emit("add-postfx", this);
        EventBus.emit("current-scene-ready", this);
    };

    createMatterTrigger(obj: any) {
        const type = obj?.properties?.[0]?.value;
        if (!type) return;
        const graphics = new Phaser.Physics.Matter.Image(this.matter.world, obj.x, obj.y, "beam");

        const trigger = Bodies.rectangle(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, obj.height, {
            isSensor: true,
            label: type
        });

        graphics.setExistingBody(trigger);
        graphics.setCollisionCategory(ENTITY_FLAGS.WORLD);

        let count = 0;

        this.matterCollision.addOnCollideStart({
            objectA: [trigger],
            callback: (other: any) => {
                if (other.gameObjectB?.name !== "player") return;
                if (other.bodyB.label !== "body") return;
                switch(type) {
                    case PROGRESSION.ARENA:
                        if (this.dm.x !== 1125) {
                            this.dm.currentStage = PROGRESSION.ARENA;
                            this.particleGenerator.cinematicTeleport(this.dm, 1125, 640, true);
                        };
                        break;
                    case PROGRESSION.COMBAT:
                        if (this.dm.x !== 1720) {
                            this.dm.currentStage = PROGRESSION.COMBAT;
                            this.particleGenerator.cinematicTeleport(this.dm, 1720, 1400, true);
                        };
                        break;
                    case PROGRESSION.ENEMY:
                        if (count > 2) return;
                        EventBus.emit("fetch-tutorial-enemy");
                        count++;
                        break;
                    case PROGRESSION.EXIT:
                        EventBus.emit("alert", {
                            header: "Exit",
                            body: `If you feel comfortable with what you've learned and have a fair understanding of what this game asks of you, feel free to enter the world and explore!`, 
                            delay: 30000,
                            key: "Close",
                            extra: "Enter World"
                        });
                        break;
                    case PROGRESSION.FINAL:
                        if (this.dm.x !== 1036) {
                            this.dm.currentStage = PROGRESSION.FINAL;
                            this.particleGenerator.cinematicTeleport(this.dm, 1036, 328, true);
                        };
                        break;
                    case PROGRESSION.IMPROVEMENT:
                        if (this.dm.x !== 290) {
                            this.dm.currentStage = PROGRESSION.IMPROVEMENT;
                            this.particleGenerator.cinematicTeleport(this.dm, 290, 515, true);
                        };
                        break;
                    case PROGRESSION.RESOLUTION:
                        if (this.dm.x !== 240) {
                            this.dm.currentStage = PROGRESSION.RESOLUTION;
                            this.particleGenerator.cinematicTeleport(this.dm, 240, 1200, true);
                        };
                        break;
                    case PROGRESSION.SETTINGS:
                        if (this.dm.x !== 1700) {
                            this.dm.currentStage = PROGRESSION.SETTINGS;
                            this.particleGenerator.cinematicTeleport(this.dm, 1700, 300, true);
                        };
                        break;
                    case PROGRESSION.WELCOME:
                        if (this.dm.x !== 1036) {
                            this.dm.currentStage = PROGRESSION.FINAL;
                            this.particleGenerator.cinematicTeleport(this.dm, 1036, 328, true);
                        };
                        break;
                    default:
                        console.log("Unknown trigger type:", type);
                };
            },
            context: this
        });
    };


    private buildTreeComposites(treeLayers: Phaser.Tilemaps.TilemapLayer[]): void {
        this.treeComposites = [];
        
        treeLayers.forEach((layer, layerIndex) => {
            if (!layer) return;
            const layerTrees: any[] = [];
            
            // Build composites for this layer only
            layer.forEachTile(tile => {
                layer.setDepth(2);
                if (tile.properties?.tree) {
                    this.addTileToLayerComposite(tile, layerTrees, layerIndex);
                };
            });
        
            // Add this layer's trees to the main list
            this.treeComposites.push(...layerTrees);
        });
        
    };

    // private debugLogTreeComposites(): void {
    //     // console.log(`=== Tree Composites (${this.treeComposites.length}) ===`);
    //     this.treeComposites.forEach((tree, index) => {

    //         const debugGraphics = this.add.graphics();
    //         // Draw the tree bounds in green
    //         debugGraphics.lineStyle(2, 0x00ff00);
    //         debugGraphics.strokeRect(tree.x, tree.y, tree.width, tree.bottomY - tree.y);
            
    //         // Draw the bottom line in red (the important line for depth sorting)
    //         debugGraphics.lineStyle(3, 0xff0000);
    //         debugGraphics.lineBetween(tree.x, tree.bottomY, tree.x + tree.width, tree.bottomY);
            
    //         // Draw a label with the index and bottomY value
    //         debugGraphics.fillStyle(0xffffff, 1);
    //         debugGraphics.fillRect(tree.x, tree.bottomY + 2, 40, 14);
    //         debugGraphics.fillStyle(0x000000, 1);
    //         this.add.text(tree.x + 3, tree.bottomY, `${index}:${Math.round(tree.bottomY)}`, {
    //             font: '10px Arial',
    //             color: '#000000'
    //         });
            
    //         // Draw each individual tile in the composite with a blue outline
    //         tree.tiles.forEach(tile => {
    //             debugGraphics.lineStyle(1, 0x0000ff, 0.5);
    //             debugGraphics.strokeRect(
    //                 tile.getLeft(), 
    //                 tile.getTop(), 
    //                 tile.width, 
    //                 tile.height
    //             );
    //         });
        
    //         // console.log(`Tree ${index}: [${Math.round(tree.x)},${Math.round(tree.y)}] -> [${Math.round(tree.x + tree.width)},${Math.round(tree.bottomY)}] (${tree.tiles.length} tiles)`);
    //     });
    // };

    private addTileToLayerComposite(tile: Phaser.Tilemaps.Tile, layerTrees: any[], layerIndex: number): void {
        const tileWorldX = tile.getLeft();
        const tileWorldY = tile.getTop();
        const tileRight = tile.getRight();
        const tileBottom = tile.getBottom();
        
        // Only merge with trees in the SAME layer
        let foundComposite = layerTrees.find(tree => 
            tileWorldX >= tree.x && 
            tileWorldX <= tree.x + tree.width &&
            tileWorldY >= tree.y && 
            tileWorldY <= tree.y + tree.height
        );
        
        if (foundComposite) {
            foundComposite.tiles.push(tile);
            foundComposite.x = Math.min(foundComposite.x, tileWorldX);
            foundComposite.y = Math.min(foundComposite.y, tileWorldY);
            foundComposite.bottomY = Math.max(foundComposite.bottomY, tileBottom);
            foundComposite.width = Math.max(foundComposite.width, tileRight - foundComposite.x);
            foundComposite.height = Math.max(foundComposite.height, tileBottom - foundComposite.y);
        } else {
            const newComposite = {
                id: `tree_layer${layerIndex}_${tileWorldX}_${tileWorldY}`,
                x: tileWorldX,
                y: tileWorldY,
                bottomY: tileBottom,
                width: tile.width,
                height: tile.height,
                tiles: [tile],
                layer: layerIndex
            };
            layerTrees.push(newComposite);
        };
    };

    showCombatText(entity: Entity, text: string, duration: number, context: string, critical: boolean = false, constant: boolean = false): void {
        const combatText = this.scrollingTextPool.acquire();
        combatText.reset(entity, text, duration, context, critical, constant);
    };

    cleanUp = (): void => {
        EventBus.off("combat");
        EventBus.off("enemyLootDrop");
        EventBus.off("aggressive-enemy");
        EventBus.off("update-postfx");
        EventBus.off("music");
        EventBus.off("game-map-load");
        EventBus.off("update-current-fps");
        EventBus.off("update-camera-zoom");
        EventBus.off("update-speed");
        EventBus.off("update-enemy-aggression");
        EventBus.off("update-enemy-special");
        EventBus.off("resetting-game");
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
        this.dm.cleanUp();
        this.player.cleanUp();
    };

    gameEvent = (): void => {
        EventBus.on("combat", (combat: any) => this.state = combat); 
        EventBus.on("game-map-load", (data: { camera: any, map: any }) => {this.map = data.map;});
        EventBus.on("enemyLootDrop", (drops: any) => {
            if (drops.scene !== "Tutorial") return;
            drops.drops.forEach((drop: Equipment) => this.lootDrops.push(new LootDrop({ scene: this, enemyID: drops.enemyID, drop })));
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
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isAggressive = aggression >= Math.random();
            };
        });
        EventBus.on("update-enemy-special", (special: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isSpecial = special >= Math.random();
            };
        });
        EventBus.on("create-tutorial-enemy", this.createTutorialEnemy);
        EventBus.on("resetting-game", this.resetting);
        EventBus.on("section-completed", (section: string) => {
            switch (section) {
                case PROGRESSION.WELCOME:
                    this.particleGenerator.cinematicTeleport(this.dm, 0, 0, false);
                    break;
                case PROGRESSION.SETTINGS:
                    this.particleGenerator.cinematicTeleport(this.dm, 0, 0, false);
                    break;
                case PROGRESSION.COMBAT:
                    this.particleGenerator.cinematicTeleport(this.dm, 0, 0, false);
                    break;
                case PROGRESSION.IMPROVEMENT:
                    this.particleGenerator.cinematicTeleport(this.dm, 0, 0, false);
                    break;
                case PROGRESSION.RESOLUTION:
                    this.particleGenerator.cinematicTeleport(this.dm, 0, 0, false);
                    break;
                case PROGRESSION.FINAL:
                    this.particleGenerator.cinematicTeleport(this.dm, 0, 0, false);
                    break;
                case PROGRESSION.ARENA:
                    this.particleGenerator.cinematicTeleport(this.dm, 1036, 328, true);
                    break;
                default: break;
            };
        });
        EventBus.on("fetch-arena-combat", () => {
            const amount = Phaser.Math.Between(6, 12);
            let enemies = [];
            for (let i = 0; i < amount; ++i) {
                const enemy = fetchTutorial();
                enemies.push(enemy?.[0]);
            };
            this.registry.set("enemies", enemies);
            this.createTutorialEnemy(false);
        });
        EventBus.on("fetch-tutorial-enemy", () => {
            const enemy = fetchTutorial();
            this.registry.set("enemies", enemy);
            this.createTutorialEnemy();
        });
        EventBus.on("fetch-treasure-chest", async () => {
            const treasure = new Treasure({
                scene: this,
                x: 290,
                y: 515,
            });
            this.treasures.push(treasure);
            const game = this.hud.gameState;
            const specialInventory = JSON.parse(JSON.stringify(game.specialInventory));
            
            const index = specialInventory.inventory.findIndex((item: Item) => item.name === "Lockpick");
            if (index === -1) {
                let lockpick = await getSpecificItem("Lockpick", this.player.ascean._id);
                lockpick.quantity = 5;
                await updateItemData(lockpick);
                const tensionWrench = await getSpecificItem("Tension Wrench", this.player.ascean._id);
                specialInventory.inventory.push(lockpick);
                specialInventory.inventory.push(tensionWrench);
            } else {
                const update = specialInventory.inventory[index].quantity < 5;
                if (update) {
                    specialInventory.inventory[index].quantity = Math.max(specialInventory.inventory[index].quantity, 5);
                    await updateItemData(specialInventory.inventory[index]);
                };
            };
            EventBus.emit("set-special-inventory", specialInventory);
        });
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

    resetting = (): void => {
        this.sound.play("TV_Button_Press", { volume: this?.hud?.settings?.volume * 2 });
        this.cameras.main.fadeOut();
        this.pause();
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_came: any, _effect: any) => {
            EventBus.emit("reset-game");
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
                } else if (this.enemies[i].health <= 0) {
                    this.enemies[i].clearCombatLoss();
                };
            };
        };
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
            if (this.musicBackground.isPlaying) this.musicBackground.pause();
            if (this.musicStealth.isPlaying) this.musicStealth.stop();
            this.startCombatTimer();
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
                this.musicBackground.resume();
            };
            this.stopCombatTimer();    
        };
        this.combat = bool;
        EventBus.emit("combat-engaged", bool);
    };

    stealthEngaged = (bool: boolean) => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (bool) {
            if (this.musicBackground.isPlaying) this.musicBackground.pause();
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
                this.musicBackground.resume();
            };
        };
    };

    pauseMusic = (): void => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (this.musicBackground.isPlaying) this.musicBackground.pause();
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
            } else if (this.musicBackground.isPaused) {
                this.musicBackground.resume();
            } else {
                this.musicBackground.play();
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

    createTutorialEnemy = (solo = true) => {
        const body = solo ? "An enemy is being summoned." : "A bevy of enemies are being summoned.";
        EventBus.emit("alert", { header: "Tutorial", body, key: "Close" });
        const randomX = [-100, -150, -200, -250, -300, 100, 150, 200, 250, 300];
        const randomY = [100, 150, 200, 250, 300, 350, 400, 450, 500];

        this.time.delayedCall(1500, () => {
            let data: Compiler[] = this.registry.get("enemies");
            for (let j = 0; j < data.length; j++) {
                const enemy = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: data[j] });
                this.enemies.push(enemy);
                
                if (solo) {
                    enemy.setPosition(this.player.x + 50, this.player.y);
                } else {
                    const x = randomX[Math.floor(Math.random() * randomX.length)];
                    const y = randomY[Math.floor(Math.random() * randomY.length)];
                    enemy.setPosition(this.player.x + x, this.player.y + y);    
                };
                
                this.time.delayedCall(1500, () => {
                    if (solo) {
                        enemy.checkEnemyCombatEnter();
                        this.player.targetEngagement(enemy.enemyID);
                    } else {
                        const length = this.enemies.length;
                        this.player.targets.push(enemy);
                        const targets: (Enemy | Player)[] = [];
                        
                        for (let k = 0; k < length; ++k) {
                            const otherEnemy = this.enemies[k];
                            if (otherEnemy.enemyID === enemy.enemyID) continue;
                            enemy.enemies.push({ id: otherEnemy.enemyID, threat: 0 });    
                            targets.push(otherEnemy);  
                        };

                        enemy.inCombat = true;
                        enemy.inComputerCombat = true;
                        
                        const target = targets[Math.floor(Math.random() * targets.length)];
                        const shouldTargetPlayer = Math.random() > 0.65;

                        if (shouldTargetPlayer) {
                            enemy.checkEnemyCombatEnter();
                        } else {
                            enemy.checkComputerEnemyCombatEnter(target as Enemy);
                        };
                    };
                    const random = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                    this.player.targetEngagement(random.enemyID);
                    this.player.sendEnemies(this.player.targets);
                }, undefined, this);
            };
        }, undefined, this);
    };

    destroyEnemy = (enemy: Enemy) => {
        enemy.isDeleting = true;
        // const saying = enemy.isDefeated ? `I'll have my revenge in this world!` : `I'll be seeing you, ${this.state.player?.name}.`;
        // enemy.specialCombatText = this.showCombatText(enemy, saying, 1500, "bone", false, false);
        enemy.stateMachine.setState(States.DEATH);
        if (enemy.isCurrentTarget) {
            this.player.disengage();
        };
        this.time.delayedCall(2000, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };

    killEnemy = (enemy: Enemy) => {
        if (enemy.isCurrentTarget) {
            this.player.disengage();
        };
        this.time.delayedCall(500, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };

    private coordCache = { chunk: '', tile: '' };

    checkEnvironment = (entity: Player | Enemy) => {
        if (this.frameCount % 20 !== 0) return;

        const x = this.map.worldToTileX(entity.x || 0) as number;
        const y = this.map.worldToTileY(entity.y || 0) as number;
        this.coordCache.tile = x + ',' + y;

        let cached = this.tileCache.get(this.coordCache.tile);

        if (!cached) {
            // const climb = this.climbing.getTileAt(x, y);
            const water = this.swimming.getTileAt(x, y);

            // cached = {
            //     climb: !!(climb?.properties?.climb),
            //     water: !!(water?.properties?.water),
            // };

            const climb = this.climbing.some((layer: Phaser.Tilemaps.TilemapLayer) => {
                const tile = layer.getTileAt(x, y);
                return !!tile?.properties?.climb;
            }); 

            cached = {
                climb: climb,
                water: !!(water?.properties?.water),
            };

            this.tileCache.set(this.coordCache.tile, cached);
        };
        
        entity.isClimbing = cached.climb;
        entity.inWater = cached.water;
    };
    
    private eHeight = 51.2;
    private eWidth = 12;

    private updateTreeDepthSorting(entity: Player | Enemy): void {
        if (this.frameCount % 15 !== 0) return;
        if (!entity) return;
        const bounds = {
            left: Math.round(entity.x - this.eWidth / 2),
            right: Math.round(entity.x + this.eWidth / 2),
            top: Math.round(entity.y + this.eHeight * 0.25),
            bottom: Math.round(entity.y + this.eHeight * 0.75),
        };
        
        let entityDepth = 3;
        let highestBottomY = -Infinity;
        let overlappingTrees: any[] = [];

        const length = this.treeComposites.length;

        for (let i = 0; i < length; ++i) {
            const tree = this.treeComposites[i];
            
            const treeLeft = tree.x;
            const treeRight = tree.x + tree.width;
            const treeTop = tree.y;
            const treeBottom = tree.bottomY;
            
            const overlapsHorizontally = bounds.right > treeLeft && bounds.left < treeLeft + treeRight;
            const overlapsVertically = bounds.bottom > treeTop && bounds.top < treeBottom;
            
            if (overlapsHorizontally && overlapsVertically) {
                overlappingTrees.push(tree);
                if (treeBottom > highestBottomY) {
                    highestBottomY = treeBottom;
                };
            };
        };

        
        if (highestBottomY !== -Infinity && bounds.bottom < highestBottomY) {
            entityDepth = 1;
        };

        entity.setDepth(entityDepth);
    };

    playerUpdate = (delta: number): void => {
        this.player.update(delta); 
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
        this.checkEnvironment(this.player);
        this.updateTreeDepthSorting(this.player);
        this.hud.rightJoystick.update();
    };

    setCameraOffset = () => {
        if (this.frameCount % 4 !== 0 || this.hud.cinemaMode) return;
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
        
        if (prevOffsetX !== this.offsetX || prevOffsetY !== this.offsetY) this.cameras.main.setFollowOffset(this.offsetX, this.offsetY);
    };

    startCombatTimer = (): void => {
        if (this.combatTimer) {
            this.combatTimer.destroy();
        };
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
        if (this.combatTimer) {
            this.combatTimer.destroy();
        };
        this.combatTime = 0;
        EventBus.emit("update-combat-timer", this.combatTime);
    };

    update(_time: number, delta: number): void {
        this.playerUpdate(delta);
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            enemy.update(delta);
            this.checkEnvironment(enemy);
            this.updateTreeDepthSorting(enemy);
            if ((enemy.isDefeated || enemy.isTriumphant) && !enemy.isDeleting) this.destroyEnemy(enemy);
        };
        this.dm.update(delta);
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