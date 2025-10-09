import { Game } from "./Game";
import SmallHud from "../phaser/SmallHud";
import ActionButtons from "../phaser/ActionButtons";
import Joystick from "../phaser/Joystick";
import { GameState } from "../../stores/game";
import Ascean from "../../models/ascean";
import { initReputation, Reputation } from "../../utility/player";
import Settings, { initSettings } from "../../models/settings";
import { EventBus } from "../EventBus";
import { dimensions } from "../../utility/dimensions";
import Logger, { ConsoleLogger } from "../../utility/Logger";
import { roundToTwoDecimals } from "../../utility/combat";
import { Play } from "../main";
import { Tutorial } from "./Tutorial";
import { Arena } from "./Arena";
import { Underground } from "./Underground";
import { EnemySheet } from "../../utility/enemy";
import Talents from "../../utility/talents";
import { Player_Scene } from "../entities/Entity";
import { Gauntlet } from "./Gauntlet";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import { ObjectPool } from "../phaser/ObjectPool";
import { DebugMonitor } from "../phaser/DebugMonitor";
// import { ArenaCvC, ArenaView } from "./ArenaCvC";
const dims = dimensions();
export const X_OFFSET = 12.5;
export const X_SPEED_OFFSET = 5;
export const Y_OFFSET = 10;
export const Y_SPEED_OFFSET = 3;
export class Hud extends Phaser.Scene {
    gameHeight: number;
    gameWidth: number;
    actionBar: ActionButtons;
    joystick: Joystick;
    joystickKeys: any;
    rightJoystick: Joystick;
    smallHud: SmallHud;
    gameState: GameState | undefined;
    ascean: Ascean  | undefined;
    reputation: Reputation = initReputation;
    settings: Settings = initSettings;
    logger!: Logger;
    currentZoom: number;
    currentX: number;
    currentX2: number;
    evCache: any[] = [];
    evCache2: any[] = [];
    prevDiff: number = -1;
    prevDiff2: number = -1;
    prevScene: string = "";
    currScene: string = "";
    talents: Talents;
    postFxPipeline: any;
    pipelines: any = {};
    hitStopping: boolean = false;
    switchingScene: boolean = false;
    scrollingTextPool: ObjectPool<ScrollingCombatText>;
    textQueue: ScrollingCombatText[] = [];
    lastTweenTime = 0;
    TEXT_BUFFER_TIME = 350;
    debugMonitor: DebugMonitor;
    cinemaMode: boolean = false;
    // private arenaContainers: Phaser.GameObjects.Container[] = [];
    // private arenaButton: Phaser.GameObjects.Image;
    // private borders: Phaser.GameObjects.Graphics[] = [];

    constructor() {
        super("Hud");
        this.gameHeight = dims.HEIGHT;
        this.gameWidth = dims.WIDTH;
    };

    create() {
        this.gameEvents();
        this.gameState = this.registry.get("game");
        this.reputation = this.registry.get("reputation");
        this.settings = this.registry.get("settings");
        this.talents = this.registry.get("talents");
        this.currentZoom = this.settings.positions.camera.zoom;
        this.smallHud = new SmallHud(this);
        this.actionBar = new ActionButtons(this);
        this.joysticks();
        this.postFxPipeline = this.plugins.get("rexHorrifiPipeline");

        this.scrollingTextPool = new ObjectPool<ScrollingCombatText>(() =>  new ScrollingCombatText(this, this.scrollingTextPool));
        for (let i = 0; i < 40; i++) {
            this.scrollingTextPool.release(new ScrollingCombatText(this, this.scrollingTextPool));
        };
        this.log();
        this.desktops();
        this.swipes();
        this.startGameScene();
        // this.debugMonitor = new DebugMonitor(this);

        // Testing Scrolling Combat Text
        // const random = ["Attack (Glancing)", "Thrust (Critical)", "Cast (Slowed)", "Posture (Hit)", "Prayer (Sacrifice)", "Cast (Heal)"];
        // this.time.addEvent({
        //     delay: 500,
        //     loop: true,
        //     callback: () => {
        //         const text = random[Math.floor(Math.random() * random.length)];
        //         this.showCombatHud(text);
        //     },
        //     callbackScope: this
        // });

        // this.createArenas();
        // this.game.scale.on("resize", this.resize, this);
    };
    // toggleArenaView() { 
    //     // Toggle visibility of the arena grid 
    //     const isVisible = this.arenaContainers[0].visible; 
    //     this.arenaContainers.forEach(container => container.setVisible(!isVisible)); 
    //     this.borders.forEach(border => border.setVisible(!isVisible));
    //     this.updateArenas(!isVisible);
    // }; 
    // updateArenas(visible: boolean) { 
    //     // Fetch new arena data and update each container 
    //     this.arenaContainers.forEach((_container, index) => { 
    //         const sceneKey = `ArenaView${index}`;
    //         const sceneInstance = this.scene.get(sceneKey) as ArenaCvC;
    //         if (visible) {
    //             if (sceneInstance && this.scene.isSleeping(sceneKey)) {
    //                 sceneInstance.resumeScene();
    //             };
    //         } else {
    //             if (sceneInstance && this.scene.isActive(sceneKey)) {
    //                 sceneInstance.sleepScene();
    //             };
    //         };
    //     }); 
    // };

    cleanUp() {
        this.actionBar.cleanUp();
        this.actionBar.destroy();
        this.joystick.cleanUp();
        this.rightJoystick.cleanUp();    
        this.joystick.destroy();
        this.rightJoystick.destroy();
        this.smallHud.cleanUp();
        this.smallHud.destroy();
    };

    createArenas = () => {
        // this.arenaButton = this.add.image(this.cameras.main.width - 20, this.cameras.main.height - 50, "toggleButton").setDepth(10).setInteractive(); 
        // this.arenaButton.on("pointerdown", this.toggleArenaView, this);
        // // Create a gridSize squared grid of containers 
        // const gridSize = 3; 
        // const containerWidth = (this.gameWidth) / gridSize - 50;
        // const containerHeight = (this.gameHeight) / gridSize; 
        // const colors = [0xfdf6d8,0xff0000,0x00ff00,0x0000ff,0x800080,0xffc700];
        // for (let i = 0; i < gridSize; i++) { 
        //     for (let j = 0; j < gridSize; j++) { 
        //         const x = Math.round(i * containerWidth + 50);
        //         const y = Math.round(j * containerHeight);
        //         console.log(x, y, "X and Y Position");
        //         const container = this.add.container(x, y); 
        //         container.setSize(containerWidth, containerHeight); 
        //         this.arenaContainers.push(container); 
        //         const arenaIndex = i * gridSize + j;
        //         const sceneKey = `ArenaView${arenaIndex}`;
        //         // Create the new scene instance
        //         this.scene.add(sceneKey, new ArenaView({scene:this,arenaIndex}), false);
        //         // Start the scene and configure its camera
        //         this.scene.launch(sceneKey); // Start the scene
        //         const sceneInstance = this.scene.get(sceneKey) as ArenaView;
        //         // Configure the viewport of the scene's camera
        //         const camera = sceneInstance.cameras.main;
        //         camera.setViewport(x, y, containerWidth - 2, containerHeight - 2);
        //         // Optionally scale the scene within the viewport
        //         camera.setZoom(0.625);

        //         // Create and style the border around the viewport 
        //         const border = this.add.graphics();
        //         border.lineStyle(4, colors[Math.floor(Math.random() * colors.length)], 1); 
        //         // White border with thickness of 4 
        //         border.strokeRect(x, y, containerWidth, containerHeight); 
        //         this.borders.push(border);
        //     };
        // };
    };

    desktops = () => {
        this.input.keyboard?.on("keydown-P", () => {
            EventBus.emit("action-button-sound");
            EventBus.emit("update-pause")
        });
        this.input.on("wheel", (event: Phaser.Input.Pointer) => {
            if (event.deltaY > 0) {
                this.currentZoom = Math.max(roundToTwoDecimals(Number(this.currentZoom - 0.05)), (window.innerWidth > 1200 ? 2 : 0.5));
            } else if (event.deltaY < 0) {
                this.currentZoom = Math.min(roundToTwoDecimals(Number(this.currentZoom + 0.05)), (window.innerWidth > 1200 ? 3 : 2));
            };
            const newSettings = {
                ...this.settings,
                positions: {
                    ...this.settings.positions,
                    camera: {
                        ...this.settings.positions.camera,
                        zoom: this.currentZoom,
                    }
                }
            };
            EventBus.emit("save-settings", newSettings);
            EventBus.emit("update-camera-zoom", this.currentZoom);
        });
    };

    joysticks = () => {
        this.joystick = new Joystick(this, 
            this.gameWidth * this.settings.positions.leftJoystick.x, 
            this.gameHeight * this.settings.positions.leftJoystick.y,
            this.settings.positions.leftJoystick.base,
            this.settings.positions.leftJoystick.thumb
        );
        this.joystick.joystick.base.setAlpha(this.settings.positions.leftJoystick.opacity);
        this.joystick.joystick.thumb.setAlpha(this.settings.positions.leftJoystick.opacity);
        this.rightJoystick = new Joystick(this,
            this.gameWidth * this.settings.positions.rightJoystick.x, 
            this.gameHeight * this.settings.positions.rightJoystick.y,
            this.settings.positions.rightJoystick.base,
            this.settings.positions.rightJoystick.thumb
        );
        this.rightJoystick.joystick.base.setAlpha(this.settings.positions.rightJoystick.opacity);
        this.rightJoystick.joystick.thumb.setAlpha(this.settings.positions.rightJoystick.opacity);
        this.rightJoystick.createPointer(this);
        this.joystickKeys = this.joystick.createCursorKeys();
    };

    log = () => {
        this.logger = new Logger();
        this.logger.add("console", new ConsoleLogger());
        this.time.delayedCall(2000, () => {
            this.logger.log("Console: [If you see this, it means something innocuous about the gameplay.]");
            this.logger.log("Warning: [If you see this, it means some function did not work, but did not crash the game]");
            this.logger.log("Error: [If you see this, it means some portion if not all of the game has crashed]");
            this.logger.log(`Console: Current Height: ${this.gameHeight} / Width: ${this.gameWidth}`);
            // this.logger.log(`Console: Scene Renderer Type: ${this.renderer.type === Phaser.WEBGL ? "WebGL" : this.renderer.type === Phaser.CANVAS ? "Canvas" : "Not Categorized"}`);
        }, undefined, this);
    };

    swipes = () => {
        const swipe = this.add.rectangle(0, 0, this.gameWidth * 0.225, this.gameHeight * 0.1, 0x000000, 0);
        swipe.setPosition(this.gameWidth * 0.125, this.gameHeight * 0.2125);
        
        swipe.setInteractive().on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.evCache.push(pointer);
            this.currentX = pointer.x;
        })
            .on("pointermove", (pointer: Phaser.Input.Pointer) => {
                var curDiff = Math.abs(this.currentX - pointer.x);
                if (curDiff > 0 || this.prevDiff > 0) {
                    if (pointer.x < this.currentX) {
                        this.currentZoom = Math.min(roundToTwoDecimals(Number(this.currentZoom + 0.00675)), (window.innerWidth > 1200 ? 3 : 2));
                    } else if (pointer.x > this.currentX) {
                        this.currentZoom = Math.max(roundToTwoDecimals(Number(this.currentZoom - 0.00675)), (window.innerWidth > 1200 ? 2 : 0.5));
                    };
                    EventBus.emit("update-camera-zoom", this.currentZoom);
                };
                this.prevDiff = curDiff;
            })
            .on("pointerup", (pointer: Phaser.Input.Pointer) => {
                this.removeEvent(pointer);
                this.prevDiff = -1;
                this.currentX = 0;
                const newSettings = {
                    ...this.settings,
                    positions: {
                        ...this.settings.positions,
                        camera: {
                            ...this.settings.positions.camera,
                            zoom: this.currentZoom,
                        }
                    }
                };
                EventBus.emit("save-settings", newSettings);
            });

        const swipe2 = this.add.rectangle(0, 0, this.gameWidth * 0.1125, this.gameHeight * 0.1, 0x000000, 0);
        swipe2.setPosition(this.gameWidth * 0.75, this.gameHeight * 0.2125);
        
        swipe2.setInteractive().on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.evCache.push(pointer);
            this.currentX2 = pointer.x;
        })
            .on("pointermove", (pointer: Phaser.Input.Pointer) => {
                var curDiff = Math.abs(this.currentX2 - pointer.x);
                if ((curDiff > 25 || this.prevDiff2 > 25)) {
                    const scene = this.scene.get(this.currScene);
                    if (scene && ((scene as Player_Scene).state.computer !== undefined || (scene as Player_Scene).player.currentTarget !== undefined) && !(scene as Player_Scene).player.inCombat) {
                        (scene as Player_Scene).player.disengage();
                    };
                };
                this.prevDiff2 = curDiff;
            })
            .on("pointerup", (pointer: Phaser.Input.Pointer) => {
                this.removeEvent(pointer);
                
                this.prevDiff2 = -1;
                this.currentX2 = 0;
            });
    };
    
    postFxEvent = (data: {type: string, val: boolean | number}) => {
        const { type, val } = data;
        if (type === "bloom") this.pipelines[this.currScene].setBloomRadius(val);
        if (type === "threshold") this.pipelines[this.currScene].setBloomThreshold(val);
        if (type === "chromatic") {
            if (val === true) {
                this.pipelines[this.currScene].setChromaticEnable();
            } else {
                this.pipelines[this.currScene].setChromaticEnable(val);
            };
        };
        if (type === "chabIntensity") this.pipelines[this.currScene].setChabIntensity(val);
        if (type === "vignetteEnable") {
            if (val === true) {
                this.pipelines[this.currScene].setVignetteEnable();
            } else {
                this.pipelines[this.currScene].setVignetteEnable(val);
            };
        };
        if (type === "vignetteStrength") this.pipelines[this.currScene].setVignetteStrength(val);
        if (type === "vignetteIntensity") this.pipelines[this.currScene].setVignetteIntensity(val);
        if (type === "noiseEnable") {
            if (val === true) {
                this.pipelines[this.currScene].setNoiseEnable();
            } else {
                this.pipelines[this.currScene].setNoiseEnable(val);
            };
        };
        if (type === "noiseSeed") this.pipelines[this.currScene].setNoiseSeed(val);
        if (type === "noiseStrength") this.pipelines[this.currScene].setNoiseStrength(val);
        if (type === "vhsEnable") {
            if (val === true) {
                this.pipelines[this.currScene].setVHSEnable();
            } else {
                this.pipelines[this.currScene].setVHSEnable(val);
            };
        };
        if (type === "vhsStrength") this.pipelines[this.currScene].setVhsStrength(val);
        if (type === "scanlinesEnable") {
            if (val === true) {
                this.pipelines[this.currScene].setScanlinesEnable();
            } else {
                this.pipelines[this.currScene].setScanlinesEnable(val);
            };
        };
        if (type === "scanStrength") this.pipelines[this.currScene].setScanStrength(val);
        if (type === "crtEnable") {
            if (val === true) {
                this.pipelines[this.currScene].setCRTEnable();
            } else {
                this.pipelines[this.currScene].setCRTEnable(val);
            };
        };
        if (type === "crtHeight") this.pipelines[this.currScene].crtHeight = val;
        if (type === "crtWidth") this.pipelines[this.currScene].crtWidth = val;
        if (type === "enable") {
            if (val === true) {
                this.setPostFx(true);
            } else {
                this.pipelines[this.currScene].setEnable(false);
            };
        };
    };

    setPostFx = (enable: boolean): void => { 
        if (enable === true) {
            this.pipelines[this.currScene].setEnable();
        } else {
            this.pipelines[this.currScene].setEnable(false);
            return;    
        };
        this.pipelines[this.currScene].setBloomRadius(25);
        this.pipelines[this.currScene].setBloomIntensity(0.5);
        this.pipelines[this.currScene].setBloomThreshold(0.5);
        this.pipelines[this.currScene].setChromaticEnable(this.settings.postFx.chromaticEnable);
        this.pipelines[this.currScene].setChabIntensity(this.settings.postFx.chabIntensity);
        this.pipelines[this.currScene].setVignetteEnable(this.settings.postFx.vignetteEnable);
        this.pipelines[this.currScene].setVignetteStrength(this.settings.postFx.vignetteStrength);
        this.pipelines[this.currScene].setVignetteIntensity(this.settings.postFx.vignetteIntensity);
        this.pipelines[this.currScene].setNoiseEnable(this.settings.postFx.noiseEnable);
        this.pipelines[this.currScene].setNoiseStrength(this.settings.postFx.noiseStrength);
        this.pipelines[this.currScene].setVHSEnable(this.settings.postFx.vhsEnable);
        this.pipelines[this.currScene].setVhsStrength(this.settings.postFx.vhsStrength);
        this.pipelines[this.currScene].setScanlinesEnable(this.settings.postFx.scanlinesEnable);
        this.pipelines[this.currScene].setScanStrength(this.settings.postFx.scanStrength);
        this.pipelines[this.currScene].setCRTEnable(this.settings.postFx.crtEnable);
        this.pipelines[this.currScene].crtHeight = this.settings.postFx.crtHeight;
        this.pipelines[this.currScene].crtWidth = this.settings.postFx.crtWidth;
    };

    addPostFxPipeline = (scene: Phaser.Scene) => {
        this.pipelines[scene.scene.key] = this.postFxPipeline.add(scene.cameras.main);
        this.setPostFx(this.settings.postFx.enable);
    };

    resize(_gameSize: Phaser.Structs.Size, _: Phaser.Structs.Size, displaySize: Phaser.Structs.Size, previousWidth: number, previousHeight: number) {
        if (this.settings.tutorial.boot) {
            this.actionBar.resizeScale(displaySize.width / previousWidth * displaySize.height / previousHeight);
            this.actionBar.draw();
            
            this.joystick.joystick.scaleX = displaySize.width / previousWidth;
            this.joystick.joystick.scaleY = displaySize.height / previousHeight;
            this.rightJoystick.joystick.scaleX = displaySize.width / previousWidth;
            this.rightJoystick.joystick.scaleY = displaySize.height / previousHeight;
            this.joystick.joystick.setPosition(displaySize.width * this.settings.positions.leftJoystick.x, displaySize.height * this.settings.positions.leftJoystick.y);
            this.rightJoystick.joystick.setPosition(displaySize.width * this.settings.positions.rightJoystick.x, displaySize.height * this.settings.positions.rightJoystick.y);
            
            EventBus.emit("update-hud-position", ({ x: this.settings.positions.smallHud.x, y: this.settings.positions.smallHud.y }));
            EventBus.emit("update-left-hud-position", ({ x: this.settings.positions.leftHud.x, y: this.settings.positions.leftHud.y }));
            EventBus.emit("update-small-hud-scale", (this.settings.positions.smallHud.scale * (displaySize.width / previousWidth) * (displaySize.height / previousHeight)));
            EventBus.emit("update-left-hud-scale", (this.settings.positions.leftHud.scale * (displaySize.width / previousWidth) * (displaySize.height / previousHeight)));
        };
        
        this.gameWidth = displaySize.width;
        this.gameHeight = displaySize.height;
    };

    horizontal = () => this.joystickKeys.right.isDown || this.joystickKeys.left.isDown;
    
    vertical = () => this.joystickKeys.up.isDown || this.joystickKeys.down.isDown;

    removeEvent = (ev: Phaser.Input.Pointer) => {
        const index = this.evCache.findIndex((cachedEv: Phaser.Input.Pointer) => cachedEv.pointerId === ev.pointerId,);
        this.evCache.splice(index, 1);
    };

    clearNonAggressiveEnemy = () => EventBus.emit("remove-non-aggressive-enemy"); // this.combatManager.combatMachine.action({ data: { key: "player", value: 0, id: 0 }, type: "Remove Enemy" });
    clearNPC = (): boolean => EventBus.emit("clear-npc");

    setupEnemy = (enemy: any): void => {
        const data: EnemySheet = { 
            id: enemy.enemyID, 
            game: enemy.ascean, 
            enemy: enemy.combatStats,
            weapons: enemy.weapons,
            health: enemy.health, 
            isAggressive: enemy.isAggressive, 
            startedAggressive: enemy.startedAggressive,
            isHostile: enemy.isHostile, 
            isCaerenic: enemy.isCaerenic,
            isDefeated: enemy.defeatedByPlayer, 
            isTriumphant: enemy.isTriumphant,
            isLuckout: enemy.isLuckout, 
            isPersuaded: enemy.isPersuaded,
            isStalwart: enemy.isStalwart, 
            playerTrait: enemy.playerTrait,
            name: enemy.name
        };
        EventBus.emit("setup-enemy", data);
    };

    setupNPC = (npc: any): void => {
        const data = { id: npc.enemyID, game: npc.ascean, enemy: npc.combatStats, health: npc.health, type: npc.npcType, interactCount: npc.interactCount };
        EventBus.emit("setup-npc", data);    
    };

    startGameScene = () => {
        const scene = this.settings?.map ? this.settings.map : "Tutorial";
        this.currScene = scene;
        if (!this.settings.tutorial?.boot) return;
        this.scene.launch(scene, this);
    };

    gameEvents = (): void => {
        EventBus.on("game", (game: GameState) => this.gameState = game);
        EventBus.on("reputation", (reputation: Reputation) => this.reputation = reputation);
        EventBus.on("talents", (talents: Talents) => this.talents = talents);
        EventBus.on("settings", (settings: Settings) => {
            this.settings = settings;
            this.currentZoom = settings.positions.camera.zoom;
            if (settings.desktop === true) {
                this.input.setDefaultCursor("url(assets/images/cursor.png), pointer");
                this.rightJoystick?.pointer?.setVisible(false);
                this.joystick?.joystick?.setVisible(false);
                this.rightJoystick?.joystick?.setVisible(false);
                if (this.actionBar) {
                    this.actionBar.draw();
                };
            } else {
                const player = this.registry.get("player");
                if (!player.isComputer) {
                    this.joystick?.joystick?.setVisible(true);
                    this.rightJoystick?.joystick?.setVisible(true);
                    this.rightJoystick?.pointer?.setVisible(true);
                    if (this.actionBar) {
                        this.actionBar.draw();
                    };
                };
            };
        }); 
        // EventBus.on("alien-sound", () => this.sound.play("alien-whoosh", { volume: this.settings.volume }));
        EventBus.on("equip-sound", () => this.sound.play("equip", { volume: this.settings.volume }));
        EventBus.on("unequip-sound", () => this.sound.play("unequip", { volume: this.settings.volume }));
        EventBus.on("purchase-sound", () => this.sound.play("purchase", { volume: this.settings.volume }));
        EventBus.on("stealth-sound", () => this.sound.play("stealth", { volume: this.settings.volume }));
        // EventBus.on("treasure-sound", () => this.sound.play("treasure", { volume: this.settings.volume }));
        EventBus.on("death-sound", () => this.sound.play("death", { volume: this.settings.volume / 2 }));
        EventBus.on("weapon-order-sound", () => this.sound.play("weaponOrder", { volume: this.settings.volume }));
        EventBus.on("action-button-sound", () => this.sound.play("TV_Button_Press", { volume: this?.settings?.volume * 2 }));
        EventBus.on("music", (on: boolean) => {
            const game = this.scene.manager.getScene("Game") as Game;
            const tutorial = this.scene.manager.getScene("Tutorial") as Tutorial;
            const arena = this.scene.manager.getScene("Arena") as Arena;
            const gauntlet = this.scene.manager.getScene("Gauntlet") as Gauntlet;
            const underground = this.scene.manager.getScene("Underground") as Underground;
            if (this.scene.isActive("Game")) {
                if (on) {
                    game.resumeMusic();
                } else {
                    game.pauseMusic();
                };
            } else if (this.scene.isActive("Tutorial")) {
                if (on) {
                    tutorial.resumeMusic();
                } else {
                    tutorial.pauseMusic();
                };
            } else if (this.scene.isActive("Underground")) {
                if (on) {
                    underground.resumeMusic();
                } else {
                    underground.pauseMusic();
                };
            } else if (this.scene.isActive("Arena")) {
                if (on) {
                    arena.resumeMusic();
                } else {
                    arena.pauseMusic();
                };
            } else if (this.scene.isActive("Gauntlet")) {
                if (on) {
                    gauntlet.resumeMusic();
                } else {
                    gauntlet.pauseMusic();
                };
            };
        });
        EventBus.on("add-postfx", this.addPostFxPipeline);
        EventBus.on("switch-scene", this.switchScene);
        EventBus.on("update-joystick-color", (data: { color: number, side: string, type: string }) => {
            const { side, color, type } = data;
            switch (side) {
                case "left":
                    if (type === "base") {
                        this.joystick.joystick.base.setFillStyle();
                        this.joystick.joystick.base.setFillStyle(color);
                    } else {
                        this.joystick.joystick.thumb.setFillStyle();
                        this.joystick.joystick.thumb.setFillStyle(color);
                    };
                    break;
                case "right":
                    if (type === "base") {
                        this.rightJoystick.joystick.base.setFillStyle();
                        this.rightJoystick.joystick.base.setFillStyle(color);
                    } else {
                        this.rightJoystick.joystick.thumb.setFillStyle();
                        this.rightJoystick.joystick.thumb.setFillStyle(color);
                    };
                    break;
            };
        });
        EventBus.on("update-joystick-position", (data: {side : string, x: number, y: number}) => {
            const { side, x, y } = data;
            const newX = this.cameras.main.width * x;
            const newY = this.cameras.main.height * y;
            switch (side) {
                case "left":
                    this.joystick.joystick.setPosition(newX, newY);
                    break;
                case "right":
                    this.rightJoystick.joystick.setPosition(newX, newY);
                    break;
            };
        });
        EventBus.on("update-joystick-opacity", (data: { side: string, opacity: number }) => {
            const { side, opacity } = data;
            switch (side) {
                case "left":
                    this.joystick.joystick.base.setAlpha(opacity);
                    this.joystick.joystick.thumb.setAlpha(opacity);
                    break;
                case "right":
                    this.rightJoystick.joystick.base.setAlpha(opacity);
                    this.rightJoystick.joystick.thumb.setAlpha(opacity);
                    break;
            };
        });
        EventBus.on("update-joystick-width", (data: { side: string, width: number }) => {
            const { side, width } = data;
            switch (side) {
                case "left":
                    this.joystick.joystick.base.setScale(width);
                    this.joystick.joystick.thumb.setScale(width);
                    break;
                case "right":
                    this.rightJoystick.joystick.base.setScale(width);
                    this.rightJoystick.joystick.thumb.setScale(width);
                    break;
            };
        });
        EventBus.on("highlight", (element: string) => {
            switch (element) {
                case "action-bar":
                    this.highlightElements("action");
                    break;
                case "joystick":
                    this.highlightElements("joystick");
                    break;
                case "joystick-left":
                    this.highlightElements("joystick-left");
                    break;
                case "joystick-right":
                    this.highlightElements("joystick-right");
                    break;
                case "smallhud":
                    this.highlightElements("smallhud");
                    break;
                default: break;
            };
        });
        EventBus.on("show-dialog-false", () => this.showDialog(false));
        EventBus.on("update-postfx", this.postFxEvent);
        EventBus.on("hud-text", this.showCombatHud);
    };

    combatText(sct: ScrollingCombatText) {
        this.textQueue.push(sct);
        this.processText();
    };

    processText() {
        if (this.textQueue.length === 0) return;

        const currentTime = this.time.now;
        const timeSinceLastTween = currentTime - this.lastTweenTime;

        if (timeSinceLastTween < this.TEXT_BUFFER_TIME) {
            const remainingTime = this.TEXT_BUFFER_TIME - timeSinceLastTween;
            this.time.delayedCall(remainingTime, this.processText, [], this);
            return;
        };
        
        this.lastTweenTime = currentTime;

        const sct = this.textQueue.shift() as ScrollingCombatText;
    
        sct.setPosition(this.gameWidth * 0.015, this.gameHeight * 0.7).setScrollFactor(0);
        sct.text.setActive(true).setVisible(true);

        const tweenObj = { t: 0 };
        this.tweens.add({
            targets: tweenObj,
            t: 1,
            duration: sct.duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onStart: () => {
                sct.active = true;
                sct.visible = true;
            },
            onUpdate: () => {
                const t = tweenObj.t;
                const linear = Phaser.Math.Interpolation.Linear([0.75, 1], t);

                sct.setPosition(sct.x, Math.max(sct.y-1, this.gameHeight * 0.175));
                sct.text.setAlpha(linear).setScale(linear);
            },
            onComplete: () => sct.release(),
            callbackScope: sct
        });
    };

    showCombatHud = (text: string, context?: string, duration: number = 3300) => {
        if (!this.settings.show?.hudCombatText) return;
        const combatText = this.scrollingTextPool.acquire();
        combatText.write(text, context, duration);
    };
    
    highlightElements(type: string) {
        if (type === "smallhud") {
            this.smallHud.highlightAnimation();
        } else if (type === "joystick") {
            this.joystick.highlightAnimation("left");
            this.rightJoystick.highlightAnimation("right");
        } else if (type === "joystick-left") {
            this.joystick.highlightAnimation("left");
        } else if (type === "joystick-right") {
            this.rightJoystick.highlightAnimation("right");
        } else {
            this.actionBar.highlightAnimation();
        };
    };
    
    showDialog = (dialogTag: boolean, activate: boolean = true) => {
        EventBus.emit("blend-game", { dialogTag });
        if (activate) this.smallHud.activate("dialog", dialogTag);
    };

    switchScene = (data: {current: string; next: string;}) => {
        if (this.switchingScene) {
            EventBus.emit("alert", { header: "Error Switching Scene", body: `Scene is already switching from ${this.prevScene} to ${this.currScene}` });
            return;
        };
        this.switchingScene = true;
        const { current, next } = data;
        this.prevScene = current;
        this.currScene = next;
        this.logger.log(`Console: Moving from ${current} to ${next}.`);
        const currentScene = this.scene.get(current) as Play;
        const nextScene = this.scene.get(next) as Play;
        currentScene.switchScene(current);
        this.time.delayedCall(1250, () => {
            const asleep = this.scene.isSleeping(next);
            const paused = this.scene.isPaused(next);
            const active = this.scene.isActive(next);
            if (active || asleep || paused) {
                nextScene.resumeScene();
                this.setPostFx(this.settings.postFx.enable);
            } else {
                this.scene.launch(next, this);
            };
            this.scene.bringToTop(this);
            EventBus.emit("update-enemies", []);
            this.switchingScene = false;
        });
    };

    hitStop = (duration: number) => {
        if (this.hitStopping) return;
        this.hitStopping = true;
        const scene = this.scene.get(this.currScene) as Play;
        scene.pause();

        this.time.delayedCall(duration, () => {
            scene.resume();
            this.hitStopping = false;
        }, undefined, this);
    };

    updateCoordinates(x: number, y: number) {
        EventBus.emit("save-this-setting", { coordinates: { x, y } });
    };
};