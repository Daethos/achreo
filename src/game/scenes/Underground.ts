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
import Fov from '../../phaser/Fov';
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
import Tile from '../../phaser/Tile';
import { CombatManager } from '../CombatManager';
import MiniMap from '../../phaser/MiniMap';

export class Underground extends Scene {
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
    enemy: any;
    enemies: Enemy[] | any[] = [];
    focus: any;
    target: any;
    targetTarget: any;
    playerLight: any;
    npcs: NPC[] | [] = [];
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
    minimap: MiniMap;
    // minimapBorder: GameObjects.Rectangle;
    // minimapReset: GameObjects.Rectangle;
    rexUI: any;
    navMesh: any;
    navMeshPlugin: any;
    postFxPipeline: any;
    musicBackground: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    joystick: Joystick;
    rightJoystick: Joystick;
    joystickKeys: any;
    volumeEvent: () => void;
    matterCollision: any;
    smallHud: SmallHud;
    combatManager: CombatManager;
    vision: any;
    private fov?: any;
    private groundLayer?: any;
    private layer2?: any;
    private layer3?: any;
    private north: any;
    private south: any;
    private east: any;
    private west: any;
    private markers: any;

    constructor () {
        super('Underground');
    };

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    };

    create () {
        this.cameras.main.fadeIn(1500, 0, 0, 0);
        this.gameEvent();
        this.getAscean();
        this.state = this.getCombat();
        this.getGame();
        this.reputation = this.getReputation();
        this.settings = this.getSettings();
        this.rexUI = this.plugins.get('rexuiplugin');
        this.offsetX = 0;
        this.offsetY = 0;
        this.tweenManager = {};
        this.markers = [];
        // =========================== Camera =========================== \\
        let camera = this.cameras.main;
        camera.zoom = this.settings.positions?.camera?.zoom || 0.8; // 0.8 
    // =========================== Ascean Test Map =========================== \\
        const map = this.make.tilemap({ key: 'underground' });
        this.map = map;
        this.add.rectangle(0, 0, 4096, 4096, 0x000000);
        const tileSize = 32;
        const castleInterior = map.addTilesetImage('Castle Interior', 'Castle Interior', tileSize, tileSize, 0, 0);
        const castleDecorations = map.addTilesetImage('Castle Decoratives', 'Castle Decoratives', tileSize, tileSize, 0, 0);
        // const castleOutside = map.addTilesetImage('Castle Outside', 'Castle Outside', tileSize, tileSize, 0, 0);
        let layer1 = map.createLayer('Floors', castleInterior as Tilemaps.Tileset, 0, 0);
        let layer2 = map.createLayer('Stairs', castleInterior as Tilemaps.Tileset, 0, 0);
        let layer3 = map.createLayer('Decorations', castleDecorations as Tilemaps.Tileset, 0, 0);
        layer1?.setCollisionByProperty({ collides: true });
        [layer1, layer2, layer3].forEach((layer) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            layer?.forEachTile((tile) => {
                tile = new Tile(tile);
            });
        });
        this.groundLayer = layer1;
        this.layer2 = layer2;
        this.layer3 = layer3;
        this.layer3.forEachTile((tile: any) => {
            if (tile?.properties && tile.properties?.key === 'north') {
                this.north = new Phaser.Math.Vector2(tile.pixelX, tile.pixelY);
            };
            if (tile?.properties && tile.properties?.key === 'south') {
                this.south = new Phaser.Math.Vector2(tile.pixelX, tile.pixelY + 16);
            };
            if (tile?.properties && tile.properties?.key === 'east') {
                this.east = new Phaser.Math.Vector2(tile.pixelX + 32, tile.pixelY);
            };
            if (tile?.properties && tile.properties?.key === 'west') {
                this.west = new Phaser.Math.Vector2(tile.pixelX, tile.pixelY);
            };
        });
        this.fov = new Fov(this, this.map, [this.groundLayer, this.layer2, this.layer3]);
        // this.matter.world.createDebugGraphic(); 
        const objectLayer = map.getObjectLayer('navmesh');
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.navMesh.enableDebug(debugGraphics); 
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels); // Top Down
        (this.sys as any).animatedTiles.init(this.map);
        // this.player = this.registry.get('player');
        this.player = new Player({ scene: this, x: this.centerX, y: 64, texture: 'player_actions', frame: 'player_idle_0' });
        map?.getObjectLayer('summons')?.objects.forEach((summon: any) => 
            this.markers.push(summon));

    // =========================== Camera =========================== \\
        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.setRoundPixels(true);

        var postFxPlugin = this.plugins.get('rexHorrifiPipeline');
        this.postFxPipeline = (postFxPlugin as any)?.add(this.cameras.main);
        this.setPostFx(this.settings?.postFx, this.settings?.postFx.enable);
        // this.combatMachine = new CombatMachine(this);
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
        if (this.settings?.music === true) this.musicBackground.play();
        this.musicCombat = this.sound.add('combat', { volume: this?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add('stealthing', { volume: this?.settings?.volume, loop: true });
        this.musicStealth.play();
        this.musicStealth.pause();
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

        if (this.settings.desktop === true) {
            this.joystick?.joystick?.setVisible(false);
            this.rightJoystick?.joystick?.setVisible(false);
            if (this.actionBar) this.actionBar.draw();
        } else {
            this.joystick?.joystick?.setVisible(true);
            this.rightJoystick?.joystick?.setVisible(true);
            if (this.actionBar) this.actionBar.draw();
        };

        this.smallHud = new SmallHud(this);
        this.combatManager = new CombatManager(this);
        this.minimap = new MiniMap(this);
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
        // for (let i = 0; i < this.npcs.length; i++) {
        //     this.npcs[i].cleanUp();
        // };
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
            } else {
                this.joystick?.joystick?.setVisible(true);
                this.rightJoystick?.joystick?.setVisible(true);
                if (this.actionBar) this.actionBar.draw();
            };
        });    
        EventBus.on('game-map-load', (data: { camera: any, map: any }) => {this.map = data.map;});
        EventBus.on('enemyLootDrop', (drops: any) => {
            if (drops.scene !== 'Underground') return;
            drops.drops.forEach((drop: Equipment) => this.lootDrops.push(new LootDrop({ scene: this, enemyID: drops.enemyID, drop })));
        });    
        EventBus.on('minimap', () => {
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
            if (on === true && !this.scene.isPaused('Underground')) {
                this.resumeMusic();
            } else {
                this.pauseMusic();
            };
        });
        EventBus.on('resume', (scene: string) => {
            if (scene !== 'Underground') return;
            this.cameras.main.fadeIn(1500, 0, 0, 0);
            this.scene.wake(scene);
            this.resumeMusic();
            EventBus.emit('current-scene-ready', this);
        });
        EventBus.on('switch-scene', (data: { current: string, next: string }) => {
            if (data.current !== 'Underground') return;
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
                this.pauseMusic();
                this.scene.sleep(data.current);
                EventBus.emit('resume', data.next);
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
        EventBus.on('create-enemy', this.createEnemy);
        EventBus.on('summon-enemy', this.summonEnemy);
        EventBus.on('Port', (direction: string) => {
            switch (direction) {
                case 'North':
                    // Search For South name Tile, set Position
                    this.player.setPosition(this.north.x, this.north.y + 32);
                    break;
                case 'South':
                    this.player.setPosition(this.south.x, this.south.y + 32);
                    break;
                case 'East':
                    this.player.setPosition(this.east.x, this.east.y + 32);
                    break;
                case 'West':
                    this.player.setPosition(this.west.x, this.north.y + 32);
                    break;
                default: break;
            };
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

    // ============================ Underground ============================ \\
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
    createEnemy = () => {
        const marker = this.markers[Math.floor(Math.random() * this.markers.length)];
        console.log(`%c Coordinates of Enemy: ${marker.x} ${marker.y}`, 'coior:red');
        const enemy = new Enemy({ scene: this, x: marker.x, y: marker.y , texture: 'player_actions', frame: 'player_idle_0' });
        this.enemies.push(enemy);
        return enemy;
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
    // ============================ Player ============================ \\
    createTextBorder(text: NewText): GameObjects.Graphics {
        const border = this.add.graphics();
        border.lineStyle(4, 0x2A0134, 1);
        border.strokeRect(text.x - text.width * text.origin.x - 2.5,text.y - text.height * text.origin.y - 2.5, text.width + 5, text.height + 5 );
        this.add.existing(border);
        return border;
    };   
    playerUpdate = (): void => {
        this.player.update(); 
        this.combatManager.combatMachine.process();
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
    };
    setCameraOffset = () => {
        if (this.player.flipX === true) {
            this.offsetX = Math.min(90, this.offsetX + 3);
        } else {
            this.offsetX = Math.max(this.offsetX - 3, -90);
        };
        if (this.player.velocity.y > 0) {
            this.offsetY = Math.max(this.offsetY - 2, -60);
        } else if (this.player.velocity.y < 0) {
            this.offsetY = Math.min(60, this.offsetY + 2);
        };
        this.cameras.main.setFollowOffset(this.offsetX, this.offsetY);
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
    update(_time: number, delta: number): void {
        this.playerUpdate();
        this.rightJoystick.update();
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update();
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
        this.fov!.update(player, bounds, delta);
        // for (let i = 0; i < this.npcs.length; i++) {
        //     this.npcs[i].update();
        // };
    };
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