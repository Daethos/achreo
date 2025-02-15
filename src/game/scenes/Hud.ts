import { Game } from "./Game";
import SmallHud from "../phaser/SmallHud";
import ActionButtons from "../phaser/ActionButtons";
import Joystick from "../phaser/Joystick";
import { GameState } from "../../stores/game";
import Ascean from "../../models/ascean";
import { initReputation, Reputation } from "../../utility/player";
import Settings, { initSettings } from "../../models/settings";
import { EventBus } from "../EventBus";
import { useResizeListener } from "../../utility/dimensions";
import Logger, { ConsoleLogger } from '../../utility/Logger';
import { roundToTwoDecimals } from "../../utility/combat";
import { Play } from "../main";
import { Tutorial } from "./Tutorial";
import { Arena } from "./Arena";
import { Underground } from "./Underground";
import { EnemySheet } from "../../utility/enemy";
// import { ArenaCvC, ArenaView } from "./ArenaCvC";
const dimensions = useResizeListener();

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
    evCache: any[] = [];
    prevDiff: number = -1;
    prevScene: string = '';
    currScene: string = '';
    // private arenaContainers: Phaser.GameObjects.Container[] = [];
    // private arenaButton: Phaser.GameObjects.Image;
    // private borders: Phaser.GameObjects.Graphics[] = [];

    constructor() {
        super('Hud');
        this.gameHeight = dimensions()?.HEIGHT;
        this.gameWidth = dimensions()?.WIDTH;
    };

    create() {
        this.gameEvents();
        this.gameState = this.registry.get('game');
        this.settings = this.registry.get('settings');
        this.currentZoom = this.settings.positions.camera.zoom;
        this.smallHud = new SmallHud(this);
        this.actionBar = new ActionButtons(this);
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

        // [this.smallHud, this.actionBar, this.joystick, this.rightJoystick].forEach(container => this.containers.main.add(container));

        this.logger = new Logger();
        this.logger.add('console', new ConsoleLogger());
        this.time.delayedCall(2000, () => {
            this.logger.log('Console: Something potentially innocuous!');
            this.logger.log('Warning: Some function did not work, but did not crash the game!');
            this.logger.log('Error: Some portion if not all of the game has crashed!');
            this.logger.log(`Console: Current Height: ${this.gameHeight} / Width: ${this.gameWidth}`);
        }, undefined, this);
        this.input.keyboard?.on('keydown-P', () => {
            EventBus.emit('action-button-sound');
            EventBus.emit('update-pause')
        });
        this.input.on('wheel', (event: Phaser.Input.Pointer) => {
            if (event.deltaY > 0) {
                this.currentZoom = Math.max(roundToTwoDecimals(Number(this.currentZoom - 0.05)), 0.5);
            } else if (event.deltaY < 0) {
                this.currentZoom = Math.min(roundToTwoDecimals(Number(this.currentZoom + 0.05)), 1.5);
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
            EventBus.emit('save-settings', newSettings);
            EventBus.emit('update-camera-zoom', this.currentZoom);
        });
        
        const swipe = this.add.rectangle(0, 0, this.gameWidth * 0.225, this.gameHeight * 0.1, 0x000000, 0);
        swipe.setPosition(this.gameWidth * 0.125, this.gameHeight * 0.2125);

        swipe.setInteractive().on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.evCache.push(pointer);
            this.currentX = pointer.x;
        })
        .on('pointermove', (pointer: Phaser.Input.Pointer) => {
            var curDiff = Math.abs(this.currentX - pointer.x);
            if (curDiff > 0 || this.prevDiff > 0) {
                if (pointer.x < this.currentX) {
                    this.currentZoom = Math.min(roundToTwoDecimals(Number(this.currentZoom + 0.00675)), 1.5);
                } else if (pointer.x > this.currentX) {
                    this.currentZoom = Math.max(roundToTwoDecimals(Number(this.currentZoom - 0.00675)), 0.5);
                };
                EventBus.emit('update-camera-zoom', this.currentZoom);
            };
            this.prevDiff = curDiff;
        })
        .on('pointerup', (pointer: Phaser.Input.Pointer) => {
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
            EventBus.emit('save-settings', newSettings);

        });
        // this.arenaButton = this.add.image(this.cameras.main.width - 20, this.cameras.main.height - 50, 'toggleButton').setDepth(10).setInteractive(); 
        // this.arenaButton.on('pointerdown', this.toggleArenaView, this);
        // // Create a gridSize squared grid of containers 
        // const gridSize = 3; 
        // const containerWidth = (this.gameWidth) / gridSize - 50;
        // const containerHeight = (this.gameHeight) / gridSize; 
        // const colors = [0xfdf6d8,0xff0000,0x00ff00,0x0000ff,0x800080,0xffc700];
        // for (let i = 0; i < gridSize; i++) { 
        //     for (let j = 0; j < gridSize; j++) { 
        //         const x = Math.round(i * containerWidth + 50);
        //         const y = Math.round(j * containerHeight);
        //         console.log(x, y, 'X and Y Position');
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
        this.game.scale.on('resize', this.resize, this);
        this.startGameScene();
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

    resize(_gameSize: Phaser.Structs.Size, _: Phaser.Structs.Size, displaySize: Phaser.Structs.Size, previousWidth: number, previousHeight: number) {
        if (this.settings.tutorial.boot) {
            this.actionBar.resizeScale(displaySize.width / previousWidth * displaySize.height / previousHeight);
            
            EventBus.emit('update-small-hud-scale', (this.settings.positions.smallHud.scale * (displaySize.width / previousWidth) * (displaySize.height / previousHeight)));
            EventBus.emit('update-left-hud-scale', (this.settings.positions.leftHud.scale * (displaySize.width / previousWidth) * (displaySize.height / previousHeight)));
            
            this.joystick.joystick.scaleX = displaySize.width / previousWidth;
            this.joystick.joystick.scaleY = displaySize.height / previousHeight;
            
            this.rightJoystick.joystick.scaleX = displaySize.width / previousWidth;
            this.rightJoystick.joystick.scaleY = displaySize.height / previousHeight;
            
            this.actionBar.draw();
            EventBus.emit('update-hud-position', ({ x: this.settings.positions.smallHud.x, y: this.settings.positions.smallHud.y }));
            // EventBus.emit('update-hud-scale', (this.settings.positions.smallHud.scale * previousWidth / displaySize.width * previousHeight / displaySize.height));
            EventBus.emit('update-left-hud-position', ({ x: this.settings.positions.leftHud.x, y: this.settings.positions.leftHud.y }));
            // EventBus.emit('update-left-hud-scale', (this.settings.positions.leftHud.scale * previousWidth / displaySize.width * previousHeight / displaySize.height));
            this.joystick.joystick.setPosition(displaySize.width * this.settings.positions.leftJoystick.x, displaySize.height * this.settings.positions.leftJoystick.y);
            this.rightJoystick.joystick.setPosition(displaySize.width * this.settings.positions.rightJoystick.x, displaySize.height * this.settings.positions.rightJoystick.y);
        };
        
        this.gameWidth = displaySize.width;
        this.gameHeight = displaySize.height;
    };

    horizontal = () => {
        return this.joystickKeys.right.isDown || this.joystickKeys.left.isDown;
    };

    vertical = () => {
        return this.joystickKeys.up.isDown || this.joystickKeys.down.isDown;
    };

    removeEvent = (ev: Phaser.Input.Pointer) => {
        const index = this.evCache.findIndex(
            (cachedEv: Phaser.Input.Pointer) => cachedEv.pointerId === ev.pointerId,
        );
        this.evCache.splice(index, 1);
    };
    clearNonAggressiveEnemy = () => EventBus.emit('remove-non-aggressive-enemy'); // this.combatManager.combatMachine.action({ data: { key: 'player', value: 0, id: 0 }, type: 'Remove Enemy' });
    clearNPC = (): boolean => EventBus.emit('clear-npc');
    setupEnemy = (enemy: any): void => {
        const data: EnemySheet = { 
            id: enemy.enemyID, 
            game: enemy.ascean, 
            enemy: enemy.combatStats,
            weapons: enemy.weapons,
            health: enemy.health, 
            isAggressive: enemy.isAggressive, 
            startedAggressive: enemy.startedAggressive, 
            isDefeated: enemy.isDefeated, 
            isTriumphant: enemy.isTriumphant,
            isLuckout: enemy.isLuckout, 
            isPersuaded: enemy.isPersuaded, 
            playerTrait: enemy.playerTrait,
            name: enemy.name
        };
        EventBus.emit('setup-enemy', data);
    };

    setupNPC = (npc: any): void => {
        const data = { id: npc.id, game: npc.ascean, enemy: npc.combatStats, health: npc.health, type: npc.npcType, interactCount: npc.interactCount };
        EventBus.emit('setup-npc', data);    
    };

    startGameScene = () => {
        if (!this.settings.tutorial?.boot) return;
        const scene = this.settings?.map ? this.settings.map : 'Tutorial';
        this.currScene = scene;
        this.scene.launch(scene, this);
    };

    gameEvents = (): void => {
        EventBus.on('game', (game: GameState) => {
            this.gameState = game;
        });
        EventBus.on('settings', (settings: Settings) => {
            this.settings = settings;
            this.currentZoom = settings.positions.camera.zoom;
            if (settings.desktop === true) {
                this.input.setDefaultCursor('url(assets/images/cursor.png), pointer');
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
        EventBus.on('equip-sound', () => this.sound.play('equip', { volume: this.settings.volume }));
        EventBus.on('unequip-sound', () => this.sound.play('unequip', { volume: this.settings.volume }));
        EventBus.on('purchase-sound', () => this.sound.play('purchase', { volume: this.settings.volume }));
        EventBus.on('stealth-sound', () => this.sound.play('stealth', { volume: this.settings.volume }));
        EventBus.on('death-sound', () => this.sound.play('death', { volume: this.settings.volume / 2 }));
        EventBus.on('weapon-order-sound', () => this.sound.play('weaponOrder', { volume: this.settings.volume }));
        EventBus.on('action-button-sound', () => this.sound.play('TV_Button_Press', { volume: this?.settings?.volume * 2 }));
        EventBus.on('music', (on: boolean) => {
            const game = this.scene.manager.getScene('Game') as Game;
            const tutorial = this.scene.manager.getScene('Tutorial') as Tutorial;
            const arena = this.scene.manager.getScene('Arena') as Arena;
            const underground = this.scene.manager.getScene('Underground') as Underground;
            if (this.scene.isActive('Game')) {
                if (on) {
                    game.resumeMusic();
                } else {
                    game.pauseMusic();
                };
            } else if (this.scene.isActive('Tutorial')) {
                if (on) {
                    tutorial.resumeMusic();
                } else {
                    tutorial.pauseMusic();
                };
            } else if (this.scene.isActive('Underground')) {
                if (on) {
                    underground.resumeMusic();
                } else {
                    underground.pauseMusic();
                };
            } else if (this.scene.isActive('Arena')) {
                if (on) {
                    arena.resumeMusic();
                } else {
                    arena.pauseMusic();
                };
            };
        });
        EventBus.on('switch-scene', (data: {current: string, next: string}) => {
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
                } else {
                    this.scene.launch(next, this);
                };
                this.scene.bringToTop(this);
            });
        });
        EventBus.on('update-joystick-color', (data: { color: number, side: string, type: string }) => {
            const { side, color, type } = data;
            switch (side) {
                case 'left':
                    if (type === 'base') {
                        this.joystick.joystick.base.setFillStyle();
                        this.joystick.joystick.base.setFillStyle(color);
                    } else {
                        this.joystick.joystick.thumb.setFillStyle();
                        this.joystick.joystick.thumb.setFillStyle(color);
                    };
                    break;
                case 'right':
                    if (type === 'base') {
                        this.rightJoystick.joystick.base.setFillStyle();
                        this.rightJoystick.joystick.base.setFillStyle(color);
                    } else {
                        this.rightJoystick.joystick.thumb.setFillStyle();
                        this.rightJoystick.joystick.thumb.setFillStyle(color);
                    };
                    break;
            };
        });
        EventBus.on('update-joystick-position', (data: {side : string, x: number, y: number}) => {
            const { side, x, y } = data;
            const newX = this.cameras.main.width * x;
            const newY = this.cameras.main.height * y;
            switch (side) {
                case 'left':
                    this.joystick.joystick.setPosition(newX, newY);
                    break;
                case 'right':
                    this.rightJoystick.joystick.setPosition(newX, newY);
                    break;
            };
        });
        EventBus.on('update-joystick-opacity', (data: { side: string, opacity: number }) => {
            const { side, opacity } = data;
            switch (side) {
                case 'left':
                    this.joystick.joystick.base.setAlpha(opacity);
                    this.joystick.joystick.thumb.setAlpha(opacity);
                    break;
                case 'right':
                    this.rightJoystick.joystick.base.setAlpha(opacity);
                    this.rightJoystick.joystick.thumb.setAlpha(opacity);
                    break;
            };
        });
        EventBus.on('update-joystick-width', (data: { side: string, width: number }) => {
            const { side, width } = data;
            switch (side) {
                case 'left':
                    this.joystick.joystick.base.setScale(width);
                    this.joystick.joystick.thumb.setScale(width);
                    break;
                case 'right':
                    this.rightJoystick.joystick.base.setScale(width);
                    this.rightJoystick.joystick.thumb.setScale(width);
                    break;
            };
        });
        EventBus.on('highlight', (element: string) => {
            switch (element) {
                case 'action-bar':
                    this.highlightElements('action');
                    break;
                case 'joystick':
                    this.highlightElements('joystick');
                    break;
                case 'smallhud':
                    this.highlightElements('smallhud');
                    break;
                default: break;
            };
        });
        EventBus.on('show-dialog-false', () => this.showDialog(false));
    };
    
    highlightElements(type: string) {
        if (type === 'smallhud') {
            this.smallHud.highlightAnimation();
        } else if (type === 'joystick') {
            this.joystick.highlightAnimation('left');
            this.rightJoystick.highlightAnimation('right');
        } else {
            this.actionBar.highlightAnimation();
        };
    };
    
    showDialog = (dialogTag: boolean) => {
        EventBus.emit('blend-game', { dialogTag });
        this.smallHud.activate('dialog', dialogTag);
    };
};