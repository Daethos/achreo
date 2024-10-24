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

    constructor() {
        super('Hud');
        this.gameHeight = dimensions()?.HEIGHT;
        this.gameWidth = dimensions()?.WIDTH;
    };

    create() {
        this.gameEvents();
        this.gameState = this.registry.get('game');
        this.settings = this.registry.get('settings');
        this.currentZoom = this.settings.positions.camera?.zoom;
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

        this.logger = new Logger();
        this.logger.add('console', new ConsoleLogger());
        this.time.delayedCall(2000, () => {
            this.logger.log('Console: Something concerning but potentially innocuous!');
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
            EventBus.emit('update-camera-zoom', this.currentZoom);
        });
        this.startGameScene();
    };
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

    startGameScene = () => {
        if (!this.settings.tutorial?.boot) return;
        this.scene.launch('Game', this);
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
                    // this.actionBar.setVisible(true);
                    this.actionBar.draw();
                };
            } else {
                const player = this.registry.get("player");
                if (!player.isComputer) {
                    this.joystick?.joystick?.setVisible(true);
                    this.rightJoystick?.joystick?.setVisible(true);
                    this.rightJoystick?.pointer?.setVisible(true);
                    if (this.actionBar) {
                        // this.actionBar.setVisible(true);
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
            const scene = this.scene.manager.getScene('Game') as Game;
            if (on === true && !this.scene.isPaused('Game')) {
                scene.resumeMusic();
            } else {
                scene.pauseMusic();
            };
        });
        EventBus.on('switch-scene', (data: {current: string, next: string}) => {
            const { current, next } = data;
            this.logger.log(`Console: Moving from ${current} to ${next}.`);
            const currentScene = this.scene.get(current) as Play;
            const nextScene = this.scene.get(next) as Play;
            currentScene.switchScene(current);
            this.time.delayedCall(1250, () => {
                const asleep = this.scene.isSleeping(next);
                const paused = this.scene.isPaused(next);
                const active = this.scene.isActive(next);
                // console.log(`%c The next scene is active: ${active} The next scene asleep: ${asleep}. The next scene paused: ${paused}.`, 'color:gold');
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
    };

    showDialog = (dialogTag: boolean) => {
        EventBus.emit('blend-game', { dialogTag });
        this.smallHud.activate('dialog', dialogTag);
    }; // smallHud: dialog

};