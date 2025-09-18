import { Cameras, GameObjects, Scene, Tilemaps, Time } from "phaser";
import { Combat, initCombat } from "../../stores/combat";
import { EventBus } from "../EventBus";
import LootDrop from "../matter/LootDrop";
import { GameState } from "../../stores/game";
import Equipment from "../../models/equipment";
import { States } from "../phaser/StateMachine";
import Fov from "../phaser/Fov";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import NPC from "../entities/NPC";
// @ts-ignore
import AnimatedTiles from "phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js";
import Tile from "../phaser/Tile";
import { CombatManager } from "../phaser/CombatManager";
import MiniMap from "../phaser/MiniMap";
import ParticleManager from "../matter/ParticleManager";
import { screenShake } from "../phaser/ScreenShake";
import { Hud, X_OFFSET, X_SPEED_OFFSET, Y_OFFSET, Y_SPEED_OFFSET } from "./Hud";
import DM from "../entities/DM";
import { Compiler } from "../../utility/ascean";
import { ObjectPool } from "../phaser/ObjectPool";
import ScrollingCombatText, { BONE } from "../phaser/ScrollingCombatText";
import Party from "../entities/PartyComputer";
import { AoEPool } from "../phaser/AoE";
import { ENTITY_FLAGS } from "../phaser/Collision";
import Treasure from "../matter/Treasure";
import { DEFEATED, VICTORIOUS } from "../../utility/enemy";
import { Entity } from "../main";

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
    navMesh: any;
    overlay: Phaser.GameObjects.Graphics;
};

export class Underground extends Scene {
    animatedTiles: any[];
    offsetX: number;
    offsetY: number;
    gameState: GameState | undefined;
    state: Combat = initCombat;
    player: any;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] | any[] = [];
    party: Party[] = [];
    focus: any;
    target: any;
    targetTarget: any;
    playerLight: any;
    dms: DM[] = [];
    npcs: NPC[] | [] = [];
    lootDrops: LootDrop[] = [];
    combat: boolean = false;
    stealth: boolean = false;
    combatTime: number = 0;
    combatTimer: Time.TimerEvent;
    tweenManager: any;
    particleManager: ParticleManager;
    map: Tilemaps.Tilemap;
    background: GameObjects.Image;
    camera: Cameras.Scene2D.Camera;
    minimap: MiniMap;
    navMesh: any;
    navMeshPlugin: any;
    musicBackground: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    volumeEvent: () => void;
    matterCollision: any;
    combatManager: CombatManager;
    vision: any;
    fov?: any;
    groundLayer?: any;
    layer2?: any;
    layer3?: any;
    layer4?: any;
    north: any;
    south: any;
    east: any;
    west: any;
    markers: any;
    glowFilter: any;
    hud: Hud;
    wager = { silver: 0, gold: 0, multiplier: 0 };
    scrollingTextPool: ObjectPool<ScrollingCombatText>;
    aoePool: AoEPool;
    lastSafePosition: {x:number;y:number;};
    frameCount: number = 0;
    cachedWidthOffset: number = 0;
    cachedHeightOffset: number = 0;
    isTransitioning: boolean = false;
    loadedChunks: Map<string, ChunkData> = new Map();
    playerChunkX: number = 0;
    playerChunkY: number = 0;
    pillars: any[] = [];

    constructor () {
        super("Underground");
    };

    preload() {
        this.load.scenePlugin("animatedTiles", AnimatedTiles, "animatedTiles", "animatedTiles");
    };

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.hud = hud;
        this.gameEvent();
        this.state = this.registry.get("combat");
        this.offsetX = 0;
        this.offsetY = 0;
        this.tweenManager = {};
        this.markers = [];
        let camera = this.cameras.main;
        camera.zoom = this.hud.settings.positions?.camera?.zoom || 0.8;
        const map = this.make.tilemap({ key: "underground" });
        this.map = map;
        this.add.rectangle(0, 0, 2048, 2048, 0x000000);
        const tileSize = 32;
        const castleInterior = map.addTilesetImage("Castle Interior", "Castle Interior", tileSize, tileSize, 0, 0);
        const castleDecorations = map.addTilesetImage("Castle Decoratives", "Castle Decoratives", tileSize, tileSize, 0, 0);
        let layer1 = map.createLayer("Floors", castleInterior as Tilemaps.Tileset, 0, 0);
        let layer2 = map.createLayer("Back", castleInterior as Tilemaps.Tileset, 0, 0);
        let layer3 = map.createLayer("Stairs", castleInterior as Tilemaps.Tileset, 0, 0);
        let layer4 = map.createLayer("Decorations", castleDecorations as Tilemaps.Tileset, 0, 0);


        layer1?.setCollisionByProperty({ collides: true });
        [layer1, layer2, layer3, layer4].forEach((layer) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            layer?.forEachTile(tile => {
                if ((tile.physics as any).matterBody) {
                    // console.log((tile.physics as any).matterBody.body.collisionFilter, "Collsion Filter BEFORE");
                    (tile.physics as any).matterBody.body.collisionFilter = {
                        category: ENTITY_FLAGS.WORLD,
                        mask: 4294967295, // ENTITY_FLAGS.UPPER_BODY, // Collides with legs/full body
                        group: 0, // -1, // Negative group prevents self-collisions
                    };
                    // console.log((tile.physics as any).matterBody.body.collisionFilter, "Collsion Filter AFTER");
                };
            });
            layer?.forEachTile((tile) => {tile = new Tile(tile);});
        });
        layer2?.setDepth(6);
        layer3?.setDepth(2); // 6
        this.groundLayer = layer1;
        this.layer2 = layer2;
        this.layer3 = layer3;
        this.layer4 = layer4;
        this.layer4.forEachTile((tile: any) => {
            if (tile?.properties && tile.properties?.key === "north") {
                this.north = new Phaser.Math.Vector2(tile.pixelX, tile.pixelY);
            };
            if (tile?.properties && tile.properties?.key === "south") {
                this.south = new Phaser.Math.Vector2(tile.pixelX, tile.pixelY + 16);
            };
            if (tile?.properties && tile.properties?.key === "east") {
                this.east = new Phaser.Math.Vector2(tile.pixelX + 32, tile.pixelY);
            };
            if (tile?.properties && tile.properties?.key === "west") {
                this.west = new Phaser.Math.Vector2(tile.pixelX, tile.pixelY);
            };
        });
        this.fov = new Fov(this, this.map, [this.groundLayer, this.layer2, this.layer3, this.layer4]);
        const objectLayer = map.getObjectLayer("navmesh");
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        (this.sys as any).animatedTiles.init(this.map);
        
        this.player = new Player({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0" });
        this.player.setPosition(500, 64);

        map?.getObjectLayer("pillars")?.objects.forEach((pillar: any) => this.pillars.push(pillar));
        map?.getObjectLayer("summons")?.objects.forEach((summon: any) => this.markers.push(summon));
        map?.getObjectLayer("dms")?.objects.forEach((_dm: any) => {
            (this.dms as any).push(new DM({ scene: this, x: 912, y: 78, texture: "player_actions", frame: "player_idle_0", npcType: "Merchant-All", id: 11 }));
        });

        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setRoundPixels(true);

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
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 100, 0.05, 0.05); // 0xFFD700 || 0xFDF6D8 || 0xDAA520
        this.game.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        
        this.musicBackground = this.sound.add("isolation", { volume: this?.hud?.settings?.volume || 0.1, loop: true });
        if (this.hud.settings?.music === true) this.musicBackground.play();
        this.musicCombat = this.sound.add("industrial", { volume: this?.hud?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add("stealthing", { volume: this?.hud?.settings?.volume, loop: true });
        this.particleManager = new ParticleManager(this);
        this.combatManager = new CombatManager(this);
        this.minimap = new MiniMap(this);
        this.input.mouse?.disableContextMenu();
        this.glowFilter = this.plugins.get("rexGlowFilterPipeline");
        const party = this.registry.get("party");
        if (party.length) {
            for (let i = 0; i < party.length; i++) {
                const p = new Party({scene:this,x: this.centerX, y: 64,texture:"player_actions",frame:"player_idle_0",data:party[i],position:i});
                p.setPosition(500, 64);
                this.party.push(p);
            };
        };
        this.aoePool = new AoEPool(this, 110);
        this.scrollingTextPool = new ObjectPool<ScrollingCombatText>(() =>  new ScrollingCombatText(this, this.scrollingTextPool));
        for (let i = 0; i < 50; i++) {
            this.scrollingTextPool.release(new ScrollingCombatText(this, this.scrollingTextPool));
        };
        EventBus.emit("add-postfx", this);
        EventBus.emit("current-scene-ready", this);
    };

    showCombatText(entity: Entity, text: string, duration: number, context: string, critical: boolean = false, constant: boolean = false): void {
        const combatText = this.scrollingTextPool.acquire();
        combatText.reset(entity, text, duration, context, critical, constant);
    };

    cleanUp = (): void => {
        EventBus.off("combat");
        EventBus.off("enemyLootDrop");
        EventBus.off("minimap");
        EventBus.off("update-postfx");
        EventBus.off("update-camera-zoom");
        EventBus.off("update-speed");
        EventBus.off("update-enemy-special");
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].cleanUp();
        };
        this.player.cleanUp();
    };

    gameEvent = (): void => {
        EventBus.on("combat", (combat: any) => this.state = combat); 
        EventBus.on("create-arena", this.createArenaEnemy);
        EventBus.on("enemyLootDrop", (drops: any) => {
            if (drops.scene !== "Underground") return;
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
        EventBus.on("check-stealth", (stealth: boolean) => {
            this.stealth = stealth;
        });
        EventBus.on("update-camera-zoom", (zoom: number) => {
            let camera = this.cameras.main;
            camera.zoom = zoom;
        });
        EventBus.on("create-enemy", this.createEnemy);
        EventBus.on("summon-enemy", this.summonEnemy);
        EventBus.on("Port", (direction: string) => {
            switch (direction) {
                case "North":
                    this.player.teleport(this.north.x, this.north.y + 32);
                    break;
                case "South":
                    this.player.teleport(this.south.x, this.south.y + 32);
                    break;
                case "East":
                    this.player.teleport(this.east.x, this.east.y + 32);
                    break;
                case "West":
                    this.player.teleport(this.west.x, this.west.y + 32);
                    break;
                default: break;
            };
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
            };
        });
        EventBus.on("update-enemy-special", (special: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isSpecial = special >= Math.random();
            };
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
        this.hud.actionBar.setVisible(true);
        if (!this.hud.settings.desktop) {
            this.hud.joystick.joystick.setVisible(true);
            this.hud.rightJoystick.joystick.setVisible(true);
        };
        this.matter.resume();
        this.scene.wake();
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

    getEnemy = (id: string): Enemy => {
        return this.enemies.find((enemy: any) => enemy.enemyID === id);
    };

    getWorldPointer = () => {
        const pointer = this.hud.rightJoystick.pointer;
        const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
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
                if (this.player.health <= 0 || this.state.newPlayerHealth <= 0) {
                    this.enemies[i].clearArenaWin();
                } else {
                    this.enemies[i].clearArenaLoss();
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
        if (bool === true && this.combat === false) {
            this.player.startCombat();
            this.musicCombat.play();
            if (this.musicBackground.isPlaying) this.musicBackground.pause();
            if (this.musicStealth.isPlaying) this.musicStealth.stop();
            this.startCombatTimer();
        } else if (bool === false) {
            this.clearAggression();
            this.musicCombat.pause();
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
            this.combatManager.resetCombatFlags();
        };
        this.combat = bool;
        EventBus.emit("combat-engaged", bool);
    };

    stealthEngaged = (bool: boolean) => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (bool) {
            if (this.musicBackground.isPlaying) this.musicBackground.pause();
            if (this.musicCombat.isPlaying) this.musicCombat.pause();
            if (this.musicStealth.isPaused) {
                this.musicStealth.resume();
            } else {
                this.musicStealth.play();
            };
        } else {
            this.musicStealth.stop();
            if (this.combat) {
                this.musicCombat.play();
            } else {
                this.musicBackground.resume();
            };
        };
    };

    pauseMusic = (): void => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (this.musicBackground.isPlaying) this.musicBackground.pause();
        if (this.musicCombat.isPlaying) this.musicCombat.pause();
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
            this.musicCombat.resume();
        };
    };

    drinkFlask = (): boolean => EventBus.emit("drink-firewater");

    createEnemy = () => {
        let marker: any, markers: any[] = [];
        for (let i = 0; i < this.markers.length; i++) {
            const position = new Phaser.Math.Vector2(this.markers[i].x, this.markers[i].y);
            const direction = position.subtract(this.player.position);
            if (direction.length() < 600) {
                markers.push(this.markers[i]);
            };
        };
        marker = markers[Math.floor(Math.random() * markers.length)];
        const enemy = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: undefined  });
        enemy.setPosition(marker.x, marker.y);
        this.enemies.push(enemy);
        return enemy;
    };

    createArenaEnemy = (data: Compiler[]) => {
        let marker: any, markers: any[] = [], count = 0, current = 600;
        for (let i = 0; i < this.markers.length; i++) {
            const position = new Phaser.Math.Vector2(this.markers[i].x, this.markers[i].y);
            const direction = position.subtract(this.player.position);
            if (direction.length() < 600) {
                markers.push(this.markers[i]);
            };
        };
        for (let j = 0; j < data.length; j++) {
            marker = markers[Math.floor(Math.random() * markers.length)];
            const enemy = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: data[j] });
            this.enemies.push(enemy);
            enemy.setPosition(marker.x, marker.y);
            const markerPosition = new Phaser.Math.Vector2(marker.x, marker.y);
            const distance = markerPosition.subtract(this.player.position).length();
            if (distance < current) {
                count = j;
                current = distance;
            };
            for (let k = 0; k < this.party.length; k++) {
                this.party[k].enemies.push({id:enemy.enemyID, threat:0});
                enemy.enemies.push({id:this.party[k].enemyID,threat:0});
            };
            this.time.delayedCall(3000, () => {
                // enemy.checkEnemyCombatEnter();                    
                if (this.party.length > 0 && Math.random() > 0.5) {
                    enemy.checkComputerEnemyCombatEnter(this.party[Math.floor(Math.random() * this.party.length)]);
                    enemy.enemies.push({id:this.player.playerID,threat:0});
                    enemy.inCombat = true;
                } else {
                    enemy.checkEnemyCombatEnter();
                };
                this.player.targets.push(enemy);
                if (count === j) {
                    this.player.targetEngagement(enemy.enemyID);
                };
            }, undefined, this);
        };
        this.wager = this.registry.get("wager");
    };

    destroyEnemy = (enemy: Enemy) => {
        enemy.isDeleting = true;
        const saying = enemy.isDefeated ? DEFEATED[Math.floor(Math.random() * DEFEATED.length)] : VICTORIOUS[Math.floor(Math.random() * VICTORIOUS.length)];
        enemy.specialCombatText = this.showCombatText(enemy, saying, 2500, BONE, false, false);
        enemy.stateMachine.setState(States.DESTROY);
        this.time.delayedCall(3000, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            if (this.enemies.length === 0) {
                if (enemy.isDefeated) {
                    EventBus.emit("settle-wager", { wager: this.wager, win: true });
                } else if (enemy.isTriumphant) {
                    EventBus.emit("settle-wager", { wager: this.wager, win: false });
                };
                this.wager = { silver: 0, gold: 0, multiplier: 0 };
                this.player.clearEnemies();
                this.hud.clearNonAggressiveEnemy();
            };
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };

    killEnemy = (enemy: Enemy) => {
        if (enemy.isCurrentTarget) this.player.disengage();
        
        this.time.delayedCall(500, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };

    summonEnemy = (summons: number) => {
        for (let i = 0; i < summons; i++) {
            const enemy = this.createEnemy();
            this.time.delayedCall(3000, () => {
                enemy.checkEnemyCombatEnter();
                this.player.targets.push(enemy);
                this.player.targetEngagement(enemy.enemyID);
            }, undefined, this);
        };
    };

    playerUpdate = (delta: number): void => {// In your playerUpdate method, before any movement:
        this.player.update(delta);
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
        this.hud.rightJoystick.update();
        if (this.frameCount % 10 !== 0) return;
        if (!this.pillars) return;
        for (let i = 0; i < this.pillars.length; i++) {
            const pillar = this.pillars[i];
            if (
                (this.player.x + 6) > pillar.x &&
                (this.player.x - 6) < pillar.x + pillar.width &&
                (this.player.y + 12) > pillar.y - pillar.height &&
                (this.player.y - 12) < pillar.y + pillar.height
            ) {
                if ((this.player.y + 12) < pillar.y) {
                    this.player.setDepth(1); // Behind pillar
                } else {
                    this.player.setDepth(3); // In front of pillar
                };
                return;
            };
        };
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

    update(_time: number, delta: number): void {
        this.playerUpdate(delta);
        for (let i = 0; i < this.party.length; i++) {
            if (this.party[i].isDeleting) continue;
            this.party[i].update(delta);
        };
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update(delta);
            if ((this.enemies[i].isDefeated || this.enemies[i].isTriumphant) && !this.enemies[i].isDeleting) this.destroyEnemy(this.enemies[i]);
        };
        for (let i = 0; i < this.dms.length; i++) {
            this.dms[i].update(delta);
        };
        const camera = this.cameras.main;
        const bounds = new Phaser.Geom.Rectangle(
            this.map.worldToTileX(camera.worldView.x) as number - 2,
            this.map.worldToTileY(camera.worldView.y) as number - 2,
            this.map.worldToTileX(camera.worldView.width) as number + 6,
            this.map.worldToTileX(camera.worldView.height) as number + 6
        );
        const player = new Phaser.Math.Vector2({
            x: this.map.worldToTileX(this.player.x) as number,
            y: this.map.worldToTileY(this.player.y) as number
        });
        this.fov?.update(player, bounds, delta);
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