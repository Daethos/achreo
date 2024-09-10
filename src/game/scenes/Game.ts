import Ascean from '../../models/ascean';
import { Cameras, GameObjects, Scene, Tilemaps, Time } from 'phaser';
import { Combat, initCombat } from '../../stores/combat';
import { EventBus } from '../EventBus';
import NewText from '../../phaser/NewText';
import LootDrop from '../../matter/LootDrop';
import ActionButtons from '../../phaser/ActionButtons';
import { GameState } from '../../stores/game';
import Settings, { initSettings } from '../../models/settings';
import Equipment from '../../models/equipment';
import { States } from '../../phaser/StateMachine';
import { EnemySheet } from '../../utility/enemy';
import Joystick from '../../phaser/Joystick';
import SmallHud from '../../phaser/SmallHud';
import { useResizeListener } from '../../utility/dimensions';
import { Reputation, initReputation } from '../../utility/player';
// @ts-ignore
import Player from '../../entities/Player';
// @ts-ignore
import Enemy from '../../entities/Enemy';
// @ts-ignore
import NPC from '../../entities/NPC';
// @ts-ignore
import ParticleManager from '../../phaser/ParticleManager';
// @ts-ignore
import AnimatedTiles from 'phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js';
import Logger, { ConsoleLogger } from '../../utility/Logger';
import MovingPlatform from '../../phaser/MovingPlatform';
import { CombatManager } from '../CombatManager';
const dimensions = useResizeListener();

export class Game extends Scene {
    animatedTiles: any[];
    offsetX: number;
    offsetY: number;
    gameState: GameState | undefined;
    ascean: Ascean  | undefined;
    state: Combat = initCombat;
    reputation: Reputation = initReputation;
    settings: Settings = initSettings;
    player: any;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: any = [];
    focus: any;
    target: any;
    targetTarget: any;
    playerLight: any;
    npcs: any = [];
    lootDrops: LootDrop[] = [];
    combat: boolean = false;
    combatTime: number = 0;
    combatTimer: Time.TimerEvent;
    tweenManager: any;
    actionBar: ActionButtons;
    particleManager: ParticleManager;
    map: Tilemaps.Tilemap;
    background: GameObjects.Image;
    camera: Cameras.Scene2D.Camera;
    minimap: Cameras.Scene2D.Camera;
    minimapBorder: GameObjects.Rectangle;
    minimapReset: GameObjects.Rectangle;
    navMesh: any;
    navMeshPlugin: any;
    postFxPipeline: any;
    musicBackground: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    fpsText: GameObjects.Text;
    combatTimerText: GameObjects.Text;
    joystick: Joystick;
    rightJoystick: Joystick;
    joystickKeys: any;
    volumeEvent: () => void;
    smallHud: SmallHud;
    combatManager: CombatManager;
    baseLayer: any;
    climbingLayer: any;
    flowers: any;
    plants: any;
    logger!: Logger;
    platform: MovingPlatform;
    platform2: MovingPlatform;

    constructor () {
        super('Game');
    };

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    };

    create () {
        this.cameras.main.fadeIn(1500, 0, 0, 0)
        this.gameEvent();
        this.getAscean();
        this.state = this.getCombat();
        this.getGame();
        this.reputation = this.getReputation();
        this.settings = this.getSettings();
        this.offsetX = 0;
        this.offsetY = 0;
        this.tweenManager = {};

    // =========================== Camera =========================== \\
        let camera = this.cameras.main;
        camera.zoom = this.settings.positions?.camera?.zoom || 0.8; // 0.8 
    // =========================== Ascean Test Map =========================== \\
        const map = this.make.tilemap({ key: 'ascean_test' });
        this.map = map;
        const tileSize = 32;
        const camps = map.addTilesetImage('Camp_Graves', 'Camp_Graves', tileSize, tileSize, 0, 0);
        const decorations = map.addTilesetImage('AncientForestDecorative', 'AncientForestDecorative', tileSize, tileSize, 0, 0);
        const tileSet = map.addTilesetImage('AncientForestMain', 'AncientForestMain', tileSize, tileSize, 0, 0);
        const campfire = map.addTilesetImage('CampFireB', 'CampFireB', tileSize, tileSize, 0, 0);
        const light = map.addTilesetImage('light1A', 'light1A', tileSize, tileSize, 0, 0);
        let layer0 = map.createLayer('Tile Layer 0 - Base', tileSet as Tilemaps.Tileset, 0, 0);
        let layerC = map.createLayer('Tile Layer - Construction', tileSet as Tilemaps.Tileset, 0, 0);
        let layer1 = map.createLayer('Tile Layer 1 - Top', tileSet as Tilemaps.Tileset, 0, 0);
        let layer4 = map.createLayer('Tile Layer 4 - Primes', decorations as Tilemaps.Tileset, 0, 0);
        let layer5 = map.createLayer('Tile Layer 5 - Snags', decorations as Tilemaps.Tileset, 0, 0);
        let layer6 = map.createLayer('Tile Layer 6 - Camps', camps as Tilemaps.Tileset, 0, 0);
        this.baseLayer = layer0;
        this.climbingLayer = layer1;
        const layer2 =  map.createLayer('Tile Layer 2 - Flowers', decorations as Tilemaps.Tileset, 0, 0);
        const layer3 =  map.createLayer('Tile Layer 3 - Plants', decorations as Tilemaps.Tileset, 0, 0);
        this.flowers = layer2;
        this.plants = layer3;
        map.createLayer('Tile Layer - Campfire', campfire as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer - Lights', light as Tilemaps.Tileset, 0, 0);
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
        // castle_decor?.setDepth(3);
        // this.matter.world.createDebugGraphic(); 
        const objectLayer = map.getObjectLayer('navmesh');
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.navMesh.enableDebug(debugGraphics); 
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels); // Top Down
        (this.sys as any).animatedTiles.init(this.map);
        this.player = new Player({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });
        map?.getObjectLayer('Enemies')?.objects.forEach((enemy: any) => 
            this.enemies.push(new Enemy({ scene: this, x: enemy.x, y: enemy.y, texture: 'player_actions', frame: 'player_idle_0' })));
        map?.getObjectLayer('Npcs')?.objects.forEach((npc: any) => 
            this.npcs.push(new NPC({ scene: this, x: npc.x, y: npc.y, texture: 'player_actions', frame: 'player_idle_0' })));
    // =========================== Camera =========================== \\
        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.setRoundPixels(true);

        var postFxPlugin = this.plugins.get('rexHorrifiPipeline');
        this.postFxPipeline = (postFxPlugin as any)?.add(this.cameras.main);
        this.setPostFx(this.settings?.postFx, this.settings?.postFx.enable);
        this.particleManager = new ParticleManager(this);
        this.target = this.add.sprite(0, 0, "target").setDepth(99).setScale(0.15).setVisible(false);
        this.actionBar = new ActionButtons(this);
    // =========================== Input Keys =========================== \\
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
            strafe: this?.input?.keyboard?.addKeys('E,Q'),
            shift: this?.input?.keyboard?.addKeys('SHIFT'),
            firewater: this?.input?.keyboard?.addKeys('T'),
        }; 
        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 200, 0.0675, 0.0675); // 0xFFD700 || 0xFDF6D8 || 0xDAA520
        this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    // =========================== Music =========================== \\
        this.musicBackground = this.sound.add('background', { volume: this?.settings?.volume ?? 0 / 2, loop: true });
        if (this.settings?.music === true) {
            this.musicBackground.play();
        };
        this.musicCombat = this.sound.add('combat', { volume: this?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add('stealthing', { volume: this?.settings?.volume, loop: true });
        this.musicStealth.play();
        this.musicStealth.pause();

        this.logger = new Logger();
        this.logger.add('console', new ConsoleLogger());
        this.time.delayedCall(2000, () => {
            this.logger.log('Console: Something concerning but potentially innocuous!');
            this.logger.log('Warning: Some function did not work, but did not crash the game!');
            this.logger.log('Error: Some portion if not all of the game has crashed!');
        }, undefined, this);

        // this.platform = new MovingPlatform(this, 650, 3200, 'player-castbar', { isStatic: true });
        // this.platform.vertical(0, -3000, 12000);
        
        // this.platform2 = new MovingPlatform(this, 500, 3950, 'player-castbar', { isStatic: true });
        // this.platform2.setAngle(90);
        // this.platform2.horizontal(0, 3500, 14000);

        // =========================== FPS =========================== \\
        // this.fpsText = this.add.text(
        //     dimensions()?.WIDTH * this.settings.positions.fpsText.x, 
        //     dimensions()?.HEIGHT * this.settings.positions.fpsText.y, 
        //     'FPS: ', { font: '16px Cinzel', color: '#fdf6d8' }
        // );
        // this.fpsText.setScrollFactor(0);
    // =========================== Combat Timer =========================== \\
        // this.combatTimerText = this.add.text(window.innerWidth / 2 - 40, window.innerHeight + 30, 'Combat Timer: ', { font: '16px Cinzel', color: '#fdf6d8' });
        // this.combatTimerText.setScrollFactor(0);
        // this.combatTimerText.setVisible(false);
        this.postFxEvent();
    // =========================== Joystick =========================== \\
        this.joystick = new Joystick(this, 
            camera.width * this.settings.positions.leftJoystick.x, 
            camera.height * this.settings.positions.leftJoystick.y,
            this.settings.positions.leftJoystick.base,
            this.settings.positions.leftJoystick.thumb
        );
        this.joystick.joystick.base.setAlpha(this.settings.positions.leftJoystick.opacity);
        this.joystick.joystick.thumb.setAlpha(this.settings.positions.leftJoystick.opacity);
        
        this.rightJoystick = new Joystick(this,
            camera.width * this.settings.positions.rightJoystick.x, 
            camera.height * this.settings.positions.rightJoystick.y,
            this.settings.positions.rightJoystick.base,
            this.settings.positions.rightJoystick.thumb
        );
        this.rightJoystick.joystick.base.setAlpha(this.settings.positions.rightJoystick.opacity);
        this.rightJoystick.joystick.thumb.setAlpha(this.settings.positions.rightJoystick.opacity);
        this.rightJoystick.createPointer(this); 
        this.joystickKeys = this.joystick.createCursorKeys();

    // =========================== Mini Map =========================== \\
        this.minimap = this.cameras.add((this.scale.width * 0.5) - (this.scale.width * 0.1171875), this.scale.height * 0.75, this.scale.width * 0.234375, this.scale.height * 0.234375).setName('mini');
        this.minimap.setOrigin(0.5); 
        this.minimap.setBounds(0, 0, 4096, 4096);
        this.minimap.zoom = 0.125;
        this.minimap.startFollow(this.player);
        this.minimap.setLerp(0.1, 0.1);
        this.minimap.setBackgroundColor(0x000000); // Suggested
        this.minimap.ignore(this.actionBar);
        this.minimap.ignore(this.target);
        this.minimap.ignore(this.joystick.joystick.base);
        this.minimap.ignore(this.joystick.joystick.thumb);
        this.minimap.ignore(this.rightJoystick.joystick.base);
        this.minimap.ignore(this.rightJoystick.joystick.thumb);
        this.minimap.ignore(this.rightJoystick.pointer);
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
            this.minimap.startFollow(this.player);
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
        this.minimapBorder.setScale(1 / 0.8);
        this.minimapBorder.setInteractive();
        this.minimapBorder.setVisible(false);
        this.minimapBorder.on('pointerdown', (pointer: any) => {
            this.minimap.stopFollow();
            this.minimapReset.setVisible(true);
            const world = this.minimap.getWorldPoint(pointer.x, pointer.y);
            this.minimap.setScroll(world.x, world.y);
        });
        this.minimap.ignore(this.minimapBorder);
        this.smallHud = new SmallHud(this);
        this.combatManager = new CombatManager(this);
        this.input.mouse?.disableContextMenu();
        EventBus.emit('current-scene-ready', this);
    };

    cleanUp = (): void => {
        EventBus.off('ascean');
        EventBus.off('combat');
        EventBus.off('game');
        EventBus.off('reputation');
        EventBus.off('settings');
        EventBus.off('enemyLootDrop');
        EventBus.off('minimap');
        EventBus.off('aggressive-enemy');
        EventBus.off('death-sound');
        EventBus.off('equip-sound');
        EventBus.off('unequip-sound');
        EventBus.off('purchase-sound');
        EventBus.off('stealth-sound');
        EventBus.off('weapon-order-sound');
        EventBus.off('action-button-sound');
        EventBus.off('update-postfx');
        EventBus.off('music');
        EventBus.off('switch-scene');
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].cleanUp();
        };
        this.player.cleanUp();
        this.actionBar.cleanUp();
        this.actionBar.destroy();
        this.smallHud.cleanUp();
        this.smallHud.destroy();
        this.joystick.cleanUp();
        this.rightJoystick.cleanUp();    
        this.joystick.destroy();
        this.rightJoystick.destroy();
    };

    gameEvent = (): void => {
        EventBus.on('ascean', (ascean: Ascean) => this.ascean = ascean);
        EventBus.on('combat', (combat: any) => this.state = combat); 
        EventBus.on('game', (game: GameState) => this.gameState = game);
        EventBus.on('reputation', (reputation: Reputation) => this.reputation = reputation);
        EventBus.on('settings', (settings: Settings) => {
            this.settings = settings;
            if (settings.desktop === true) {
                this.joystick?.joystick?.setVisible(false);
                this.rightJoystick?.joystick?.setVisible(false);
                if (this.actionBar) this.actionBar.draw();
                // if (this.actionBar) this.actionBar?.setVisible(false);
            } else {
                this.joystick?.joystick?.setVisible(true);
                this.rightJoystick?.joystick?.setVisible(true);
                if (this.actionBar) this.actionBar.draw();
                // if (this.actionBar) this.actionBar?.setVisible(true);
            };
        });    
        EventBus.on('game-map-load', (data: { camera: any, map: any }) => {this.map = data.map;});
        EventBus.on('enemyLootDrop', (drops: any) => {
            if (drops.scene !== 'Game') return;
            drops.drops.forEach((drop: Equipment) => this.lootDrops.push(new LootDrop({ scene: this, enemyID: drops.enemyID, drop })));
        });    
        EventBus.on('minimap', () => {
            if (this.minimap.visible === true) {
                this.minimap.setVisible(false);
                this.minimapBorder.setVisible(false);
                this.minimapReset.setVisible(false);
            } else {
                this.minimap.setVisible(true);
                this.minimapBorder.setVisible(true);
                this.minimap.startFollow(this.player);
            };
        });
        EventBus.on('aggressive-enemy', (e: {id: string, isAggressive: boolean}) => {
            let enemy = this.enemies.find((enemy: any) => enemy.enemyID === e.id);
            enemy.isAggressive = e.isAggressive;
            if (e.isAggressive === true) {
                enemy.setSpecialCombat(true);
                enemy.attacking = this.player;
                enemy.inCombat = true;
                enemy.originPoint = new Phaser.Math.Vector2(enemy.x, enemy.y).clone();
                enemy.stateMachine.setState(States.CHASE);
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
            if (on === true && !this.scene.isPaused('Game')) {
                this.resumeMusic();
            } else {
                this.pauseMusic();
            };
        });
        EventBus.on('resume', (scene: string) => {
            if (scene !== 'Game') return;
            this.cameras.main.fadeIn(1500, 0, 0, 0);
            this.scene.wake(scene);
            this.resumeMusic();
            EventBus.emit('current-scene-ready', this);
        });
        EventBus.on('switch-scene', (data: { current: string, next: string }) => {
            if (data.current !== 'Game') return;
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
                this.pauseMusic();
                this.scene.sleep(data.current);
                const scene = this.scene.get(data.next);
                if (scene.scene?.isSleeping()) {
                    EventBus.emit('resume', data.next);
                } else {
                    this.scene.launch(data.next);
                };
            });
        });
        EventBus.on('wake-up', (scene: string) => {
            this.scene.resume(scene);
            if (this.combat) {
                this.musicCombat.resume();
                this.startCombatTimer();    
            } else if (this.player.isStealth) {
                this.musicStealth.resume();
            } else {
                this.musicBackground.resume();
            };
            EventBus.emit('current-scene-ready', this);
        });
        EventBus.on('update-fps', (data: {x: number, y: number}) => {
            const { x, y } = data;
            const newX = dimensions()?.WIDTH * x;
            const newY = dimensions()?.HEIGHT * y;
            this.fpsText.setPosition(newX, newY);
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
        EventBus.on('update-camera-zoom', (zoom: number) => {
            let camera = this.cameras.main;
            camera.zoom = zoom;
        });
        EventBus.on('update-speed', (data: { speed: number, type: string }) => {
            switch (data.type) {
                case 'playerSpeed':
                    this.player.adjustSpeed(data.speed);
                    break;
                case 'enemySpeed':
                    for (let i = 0; i < this.enemies.length; i++) {
                        this.enemies[i].adjustSpeed(data.speed);
                    };
                    break;
            };
        });
        // EventBus.on('summon-enemy', this.summonEnemy);
    };

    postFxEvent = () => EventBus.on('update-postfx', (data: {type: string, val: boolean | number}) => {
        const { type, val } = data;
        if (type === 'bloom') {
            this.postFxPipeline.setBloomRadius(val);
        };
        if (type === 'threshold') {
            this.postFxPipeline.setBloomThreshold(val);
        };
        if (type === 'chromatic') {
            if (val === true) {
                this.postFxPipeline.setChromaticEnable();
            } else {
                this.postFxPipeline.setChromaticEnable(val);
            };
        };
        if (type === 'chabIntensity') {
            this.postFxPipeline.setChabIntensity(val);
        };
        if (type === 'vignetteEnable') {
            if (val === true) {
                this.postFxPipeline.setVignetteEnable();
            } else {
                this.postFxPipeline.setVignetteEnable(val);
            };
        };
        if (type === 'vignetteStrength') {
            this.postFxPipeline.setVignetteStrength(val);
        };
        if (type === 'vignetteIntensity') {
            this.postFxPipeline.setVignetteIntensity(val);
        };

        if (type === 'noiseEnable') {
            if (val === true) {
                this.postFxPipeline.setNoiseEnable();
            } else {
                this.postFxPipeline.setNoiseEnable(val);
            };
        };
        if (type === 'noiseSeed') {
            this.postFxPipeline.setNoiseSeed(val);
        };
        if (type === 'noiseStrength') {
            this.postFxPipeline.setNoiseStrength(val);
        };

        if (type === 'vhsEnable') {
            if (val === true) {
                this.postFxPipeline.setVHSEnable();
            } else {
                this.postFxPipeline.setVHSEnable(val);
            };
        };
        if (type === 'vhsStrength') {
            this.postFxPipeline.setVhsStrength(val);
        };

        if (type === 'scanlinesEnable') {
            if (val === true) {
                this.postFxPipeline.setScanlinesEnable();
            } else {
                this.postFxPipeline.setScanlinesEnable(val);
            };
        };
        if (type === 'scanStrength') {
            this.postFxPipeline.setScanStrength(val);
        };
        
        if (type === 'crtEnable') {
            if (val === true) {
                this.postFxPipeline.setCRTEnable();
            } else {
                this.postFxPipeline.setCRTEnable(val);
            };
        };
        if (type === 'crtHeight') {
            this.postFxPipeline.crtHeight = val;
        };
        if (type === 'crtWidth') {
            this.postFxPipeline.crtWidth = val;
        };

        if (type === 'enable') {
            if (val === true) {
                this.setPostFx(this.settings?.postFx, true);
            } else {
                this.postFxPipeline.setEnable(false);
            };
        };
    });

    setPostFx = (settings: any, enable: boolean): void => { 
        if (enable === true) {
            this.postFxPipeline.setEnable();
        } else {
            this.postFxPipeline.setEnable(false);
            return;    
        };
        this.postFxPipeline.setBloomRadius(25);
        this.postFxPipeline.setBloomIntensity(0.5);
        this.postFxPipeline.setBloomThreshold(0.5);
        this.postFxPipeline.setChromaticEnable(settings.chromaticEnable);
        this.postFxPipeline.setChabIntensity(settings.chabIntensity);
        this.postFxPipeline.setVignetteEnable(settings.vignetteEnable);
        this.postFxPipeline.setVignetteStrength(settings.vignetteStrength);
        this.postFxPipeline.setVignetteIntensity(settings.vignetteIntensity);
        this.postFxPipeline.setNoiseEnable(settings.noiseEnable);
        this.postFxPipeline.setNoiseStrength(settings.noiseStrength);
        this.postFxPipeline.setVHSEnable(settings.vhsEnable);
        this.postFxPipeline.setVhsStrength(settings.vhsStrength);
        this.postFxPipeline.setScanlinesEnable(settings.scanlinesEnable);
        this.postFxPipeline.setScanStrength(settings.scanStrength);
        this.postFxPipeline.setCRTEnable(settings.crtEnable);
        this.postFxPipeline.crtHeight = settings.crtHeight;
        this.postFxPipeline.crtWidth = settings.crtWidth;

    };
    changeScene(): void {
        this.scene.start('GameOver');
    };
    getAscean(): void {
        EventBus.emit('request-ascean');
    };
    getCombat = (): Combat => {
        EventBus.once('request-combat-ready', (combat: Combat) => {
            this.state = combat;
        });
        EventBus.emit('request-combat');
        return this.state;
    };
    getGame(): void {
        EventBus.emit('request-game');
    };
    getReputation = (): Reputation => {
        EventBus.emit('request-reputation');
        return this.reputation;
    };
    getSettings = (): Settings => {
        EventBus.emit('request-settings');
        return this.settings;
    };
    // ================== Combat ================== \\
    getEnemy = (id: string): Enemy => {
        return this.enemies.find((enemy: any) => enemy.enemyID === id);
    };
    getWorldPointer = () => {
        const pointer = this.rightJoystick.pointer;
        const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        return point;
    };

    // ============================ Game ============================ \\
    rotateTween = (tween: any, count: number, active: boolean) => {
        if (active === true) {
            this.tweenManager[tween.name] = this.tweens.add({
                targets: tween,
                angle: count * 360,
                duration: count * 925,
                ease: 'Circ.easeInOut',
                yoyo: false,
            });
        } else {
            this.tweenManager[tween.name].stop();
        };
    };
    clearNonAggressiveEnemy = (): boolean => EventBus.emit('clear-enemy');
    clearNPC = (): boolean => EventBus.emit('clear-npc'); 
    combatEngaged = (bool: boolean) => {
        EventBus.emit('combat-engaged', bool);
        if (bool === true && this.combat !== bool) {
            this.musicCombat.play();
            if (this.musicBackground.isPlaying) this.musicBackground.pause();
            if (this.musicStealth.isPlaying) this.musicStealth.pause();
            this.startCombatTimer();
        } else if (bool === false) {
            this.musicCombat.stop();
            if (this.player.isStealth) {
                this.musicStealth.resume();
            } else {
                this.musicBackground.resume();
            };
            this.stopCombatTimer();    
        };
        this.combat = bool;
    };
    pauseMusic = (): void => {
        if (this.musicBackground.isPlaying) this.musicBackground.pause();
        if (this.musicCombat.isPlaying) this.musicCombat.pause();
        if (this.musicStealth.isPlaying) this.musicStealth.pause();
    };
    resumeMusic = (): void => {
        if (!this.combat) {
            if (this.player.isStealth) {
                this.musicStealth.resume();
            } else {
                this.musicBackground.resume();
            };
        } else {
            this.musicCombat.resume();
        };
    };
    drinkFlask = (): boolean => EventBus.emit('drink-firewater');
    setupEnemy = (enemy: any): void => {
        const data: EnemySheet = { 
            id: enemy.enemyID, 
            game: enemy.ascean, 
            enemy: enemy.combatStats, 
            health: enemy.health, 
            isAggressive: enemy.isAggressive, 
            startedAggressive: enemy.startedAggressive, 
            isDefeated: enemy.isDefeated, 
            isTriumphant: enemy.isTriumphant,
            isLuckout: enemy.isLuckout, 
            isPersuaded: enemy.isPersuaded, 
            playerTrait: enemy.playerTrait
        };
        EventBus.emit('setup-enemy', data);
    };
    setupNPC = (npc: any): void => {
        const data = { id: npc.id, game: npc.ascean, enemy: npc.combatStats, health: npc.health, type: npc.npcType, interactCount: npc.interactCount };
        EventBus.emit('setup-npc', data);    
    };
    showDialog = (dialog: boolean): boolean => EventBus.emit('blend-game', { dialogTag: dialog }); // smallHud: dialog
    summonEnemy = (val: number) => {
        let count = 0;
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.isDefeated === true) continue;
            enemy.setPosition(this.player.x + Phaser.Math.Between(-500, 500), this.player.y + Phaser.Math.Between(-500, 500));
            enemy.checkEnemyCombatEnter();
            if (this.player.isEnemyInTargets(enemy.enemyID) === false) {
                this.player.targets.push(enemy);
            };
            if (this.player.currentTarget === undefined || this.player.currentTarget?.enemyID !== enemy.enemyID) {
                this.player.targetEngagement(enemy.enemyID);
            };
            count++;
            if (count === val) return;
        };
    };
    // ============================ Player ============================ \\
    checkEnvironment = (player: Player) => {
        const x = this.map.worldToTileX(player.x || 0);
        const y = this.map.worldToTileY(player.y || 0);
        if (!this.climbingLayer) return;
        const climb = this.climbingLayer.getTileAt(x as number, y as number);
        if (climb && climb.properties && climb.properties.climb) {
            player.isClimbing = true;
        } else {
            player.isClimbing = false;
        };
        if (!this.baseLayer) return;
        const water = this.baseLayer.getTileAt(x as number, y as number);
        if (water && water.properties && water.properties.water) {
            player.inWater = true;
        } else {
            player.inWater = false;
        };
        const flower = this.flowers.getTileAt(x as number, y as number);
        if (flower) {
            if (flower.pixelY > player.y - 12) {
                player.setDepth(2);
            } else {
                player.setDepth(4);
            };
        };
        const plant = this.plants.getTileAt(x as number, y as number);
        if (plant) {
            if (plant.pixelY > player.y - 12) {
                player.setDepth(2);
            } else {
                player.setDepth(4);
            };
        };
    };
    createTextBorder(text: NewText): GameObjects.Graphics {
        const border = this.add.graphics();
        border.lineStyle(4, 0x2A0134, 1);
        border.strokeRect(text.x - text.width * text.origin.x - 2.5,text.y - text.height * text.origin.y - 2.5, text.width + 5, text.height + 5 );
        this.add.existing(border);
        return border;
    };   
    enemyUpdate = (): void => {
        const enemies = this.sortEnemies(this.enemies);
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].update();
        };
    };
    npcUpdate = (): void => {
        const npcs = this.sortNpcs(this.npcs);
        for (let i = 0; i < npcs.length; i++) {
            npcs[i].update();
        };
    };
    playerUpdate = (): void => {
        this.player.update(); 
        this.combatManager.combatMachine.process();
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
        this.checkEnvironment(this.player);
    };
    setCameraOffset = () => {
        if (this.player.flipX === true) {
            this.offsetX = Math.min(105, this.offsetX + 3);
        } else {
            this.offsetX = Math.max(this.offsetX - 3, -105);
        };
        if (this.player.velocity.y > 0) {
            this.offsetY = Math.max(this.offsetY - 2.5, -70);
        } else if (this.player.velocity.y < 0) {
            this.offsetY = Math.min(70, this.offsetY + 2.5);
        };
        this.cameras.main.setFollowOffset(this.offsetX, this.offsetY);
    };
    sortEnemies = (enemies: Enemy[]): Enemy[] => {
        let sorted = [];
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].inCombat === true ? sorted.unshift(enemies[i]) : sorted.push(enemies[i]);
        };
        return sorted;
    };
    sortNpcs = (npcs: NPC[]): NPC[] => {
        let sorted = [];
        for (let i = 0; i < npcs.length; i++) {
            npcs[i].interacing === true ? sorted.unshift(npcs[i]) : sorted.push(npcs[i]);
        };
        return sorted;
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
                EventBus.emit('update-combat-timer', this.combatTime);
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
        EventBus.emit('update-combat-timer', this.combatTime);
    };
    update(): void {
        this.playerUpdate();
        this.rightJoystick.update();
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update();
            this.checkEnvironment(this.enemies[i]);
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].update();
        };
    };
    // this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(2)); 
    pause(): void {
        this.scene.pause();
        if (!this.combat) {
            this.musicBackground.pause();
        } else {
            this.musicCombat.pause();
            this.musicStealth.pause();
        };
    };
    resume(): void {
        this.scene.resume();
        if (this.settings?.music === false) return;
        if (!this.combat) {
            if (this.player.isStealth) {
                this.musicStealth.resume();
            } else if (this.musicBackground.isPaused) {
                this.musicBackground.resume();
            } else {
                this.musicBackground.play();
            }
        } else {
            this.musicCombat.resume();
        };
    };
};