import Ascean from '../../models/ascean';
import { Combat, initCombat } from '../../stores/combat';
import { EventBus } from '../EventBus';
import { Cameras, GameObjects, Scene, Sound, Tilemaps, Time } from 'phaser';
import Player from '../../entities/Player';
import Enemy from '../../entities/Enemy';
import NPC from '../../entities/NPC';
import NewText from '../../phaser/NewText';
import ParticleManager from '../../phaser/ParticleManager';
import LootDrop from '../../matter/LootDrop';
import CombatMachine from '../../phaser/CombatMachine';
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
import AnimatedTiles from 'phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js';

const dimensions = useResizeListener();

export class Game extends Scene {
    animatedTiles: any[];
    offsetX: number;
    offsetY: number;
    gameText: GameObjects.Text;
    gameState: GameState | undefined;
    ascean: Ascean  | undefined;
    state: Combat = initCombat;
    reputation: Reputation = initReputation;
    settings: Settings = initSettings;
    player: any;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemy: any;
    enemies: any = [];
    focus: any;
    target: any;
    playerLight: any;
    npcs: any = [];
    lootDrops: LootDrop[] = [];
    combat: boolean = false;
    combatTime: number = 0;
    combatTimer: Time.TimerEvent;
    
    actionBar: ActionButtons;
    combatMachine: CombatMachine;
    particleManager: ParticleManager;
    
    map: Tilemaps.Tilemap;
    background: GameObjects.Image;
    camera: Cameras.Scene2D.Camera;
    minimap: Cameras.Scene2D.Camera;
    minimapBorder: GameObjects.Rectangle;
    minimapReset: GameObjects.Rectangle;
    rexUI: any;
    navMesh: any;
    navMeshPlugin: any;
    postFxPipeline: any;

    musicBackground: Sound.BaseSound;
    musicCombat: Sound.BaseSound;
    spooky: Sound.BaseSound;
    righteous: Sound.BaseSound;
    wild: Sound.BaseSound;
    earth: Sound.BaseSound;
    fire: Sound.BaseSound;
    frost: Sound.BaseSound;
    lightning: Sound.BaseSound;
    wind: Sound.BaseSound;
    sorcery: Sound.BaseSound;
    bow: Sound.BaseSound;
    slash: Sound.BaseSound;
    blunt: Sound.BaseSound;
    pierce: Sound.BaseSound;
    roll: Sound.BaseSound;
    parry: Sound.BaseSound;
    weaponOrder: Sound.BaseSound;
    actionButton: Sound.BaseSound;
    equip: Sound.BaseSound;
    unequip: Sound.BaseSound;
    purchase: Sound.BaseSound;
    treasure: Sound.BaseSound;
    phenomena: Sound.BaseSound;
    mysterious: Sound.BaseSound;
    tshaeral: Sound.BaseSound;
    dungeon: Sound.BaseSound;
    frozen: Sound.BaseSound;

    fpsText: GameObjects.Text;
    combatTimerText: GameObjects.Text;
    joystick: Joystick;
    rightJoystick: Joystick;
    joystickKeys: any;
    volumeEvent: () => void;
    matterCollision: any;
    smallHud: SmallHud;

    constructor () {
        super('Game');
    };

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    };

    create () {
        this.gameEvent();
        this.getAscean();
        this.state = this.getCombat();
        this.getGame();
        this.reputation = this.getReputation();
        this.settings = this.getSettings();
        this.rexUI = this.plugins.get('rexuiplugin');
        this.offsetX = 0;
        this.offsetY = 0;
        
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
        let layer1 = map.createLayer('Tile Layer 1 - Top', tileSet as Tilemaps.Tileset, 0, 0);
        let layerC = map.createLayer('Tile Layer - Construction', tileSet as Tilemaps.Tileset, 0, 0);
        let layer4 = map.createLayer('Tile Layer 4 - Primes', decorations as Tilemaps.Tileset, 0, 0);
        let layer5 = map.createLayer('Tile Layer 5 - Snags', decorations as Tilemaps.Tileset, 0, 0);
        let layer6 = map.createLayer('Tile Layer 6 - Camps', camps as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 2 - Flowers', decorations as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 3 - Plants', decorations as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer - Campfire', campfire as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer - Lights', light as Tilemaps.Tileset, 0, 0);
        
        [layer0, layer1, layerC, layer4, layer5, layer6].forEach((layer, index) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            if (index < 3) return;
            layer?.setDepth(3);
        });
        map.createLayer('Tile Layer 4 - Primes', decorations as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 5 - Snags', decorations as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 6 - Camps', camps as Tilemaps.Tileset, 0, 0);
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
        camera.startFollow(this.player, false, 0.1, 0.1, );
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.setRoundPixels(true);
        var postFxPlugin = this.plugins.get('rexHorrifiPipeline');
        this.postFxPipeline = (postFxPlugin as any)?.add(this.cameras.main);
        this.setPostFx(this.settings?.postFx, this.settings?.postFx.enable);

        this.combatMachine = new CombatMachine(this);
        this.particleManager = new ParticleManager(this);
        this.target = this.add.sprite(0, 0, "target").setDepth(10).setScale(0.15).setVisible(false);
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

        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 200, 0.0675, 0.0675); // 0xFFD700 || 0xFDF6D8 || 0xDAA520
        
    // =========================== Music =========================== \\
        this.musicBackground = this.sound.add('background', { volume: this?.settings?.volume ?? 0 / 2, loop: true });
        if (this.settings?.music === true) {
            this.musicBackground.play();
        };
        this.musicCombat = this.sound.add('combat', { volume: this?.settings?.volume, loop: true });
        this.spooky = this.sound.add('spooky', { volume: this?.settings?.volume });
        this.righteous = this.sound.add('righteous', { volume: this?.settings?.volume });
        this.wild = this.sound.add('wild', { volume: this?.settings?.volume });
        this.earth = this.sound.add('earth', { volume: this?.settings?.volume });
        this.fire = this.sound.add('fire', { volume: this?.settings?.volume });
        this.frost = this.sound.add('frost', { volume: this?.settings?.volume });
        this.lightning = this.sound.add('lightning', { volume: this?.settings?.volume });
        this.wind = this.sound.add('wind', { volume: this?.settings?.volume });
        this.sorcery = this.sound.add('sorcery', { volume: this?.settings?.volume });
        this.bow = this.sound.add('bow', { volume: this?.settings?.volume });
        this.slash = this.sound.add('slash', { volume: this?.settings?.volume });
        this.blunt = this.sound.add('blunt', { volume: this?.settings?.volume });
        this.pierce = this.sound.add('pierce', { volume: this?.settings?.volume });
        this.roll = this.sound.add('roll', { volume: this?.settings?.volume });
        this.parry = this.sound.add('parry', { volume: this?.settings?.volume });
        this.weaponOrder = this.sound.add('weaponOrder', { volume: this?.settings?.volume });
        this.actionButton = this.sound.add('action-button', { volume: this?.settings?.volume });
        this.equip = this.sound.add('equip', { volume: this?.settings?.volume });
        this.unequip = this.sound.add('unequip', { volume: this?.settings?.volume });
        this.purchase = this.sound.add('purchase', { volume: this?.settings?.volume });
        this.treasure = this.sound.add('treasure', { volume: this?.settings?.volume });
        this.phenomena = this.sound.add('phenomena', { volume: this?.settings?.volume });
        this.mysterious = this.sound.add('combat-round', { volume: this?.settings?.volume });
        this.tshaeral = this.sound.add('absorb', { volume: this?.settings?.volume });
        this.dungeon = this.sound.add('dungeon', { volume: this?.settings?.volume });
        this.frozen = this.sound.add('freeze', { volume: this?.settings?.volume });

    // =========================== FPS =========================== \\
        this.fpsText = this.add.text(
            dimensions()?.WIDTH * this.settings.positions.fpsText.x, 
            dimensions()?.HEIGHT * this.settings.positions.fpsText.y, 
            'FPS: ', { font: '16px Cinzel', color: '#fdf6d8' }
        );
        this.fpsText.setScrollFactor(0);
        this.fpsText.setInteractive()
            .on('pointerup', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                };
            });

    // =========================== Combat Timer =========================== \\
        this.combatTimerText = this.add.text(window.innerWidth / 2 - 40, window.innerHeight + 30, 'Combat Timer: ', { font: '16px Cinzel', color: '#fdf6d8' });
        this.combatTimerText.setScrollFactor(0);
        this.combatTimerText.setVisible(false);
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
        this.minimap.ignore(this.fpsText);
        this.minimap.ignore(this.combatTimerText);
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
        this.smallHud = new SmallHud(this);
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
        EventBus.off('equip-sound');
        EventBus.off('unequip-sound');
        EventBus.off('purchase-sound');
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
        this.combatMachine.cleanUp();
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
        EventBus.on('settings', (settings: Settings) => this.settings = settings);    
        EventBus.on('enemyLootDrop', (drops: any) => {
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
        EventBus.on('weapon-order-sound', () => this.sound.play('weaponOrder', { volume: this.settings.volume }));
        EventBus.on('action-button-sound', () => this.sound.play('TV_Button_Press', { volume: this?.settings?.volume * 2 }));
        EventBus.on('music', (on: boolean) => {
            if (on === true && !this.scene.isPaused('Game')) {
                this.resumeMusic();
            } else {
                this.pauseMusic();
            };
        });
        EventBus.on('switch-scene', (data: { current: string, next: string }) => {
            if (data.current !== 'Game') return;
            if (this.combat) {
                this.musicCombat.pause();
                this.stopCombatTimer();    
            } else {
                this.musicBackground.pause();
            };
            this.scene.pause(data.current);
            this.scene.launch(data.next, { ascean: this.ascean, combat: this.state, game: this.gameState, settings: this.settings });
        });
        EventBus.on('wake-up', (scene: string) => {
            this.scene.resume(scene);
            if (this.combat) {
                this.musicCombat.resume();
                this.startCombatTimer();    
            } else {
                this.musicBackground.resume();
            };
            EventBus.emit('current-scene-ready', this);
        });
        EventBus.on('update-fps', (data: {x: number, y: number}) => {
            const { x, y } = data;
            const newX = dimensions()?.WIDTH * x;
            const newY = dimensions()?.HEIGHT * y;
            console.log(newX, newY, 'New X and Y');
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
            console.log(this.joystick.joystick.base, this.joystick.joystick.thumbj, '<<<--- BASE and THUMB')
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
                // this.postFxPipeline.setEnable();
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
        const point = this.cameras.main.getWorldPoint(this.rightJoystick.pointer.x, this.rightJoystick.pointer.y);
        const target = new Phaser.Math.Vector2(point.x, point.y);
        return target;
    };

    // ============================ Combat Specials ============================ \\ 
    astrave = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0 && enemy.isDefeated !== true) {
            const damage = Math.round(this?.state?.player?.[this?.state?.player?.mastery as keyof typeof this.state.player] * 1);
            const health = enemy.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
            enemy.isStunned = true;
        };
    };
    chiomic = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) {
            this.player.isConfused = true;
        } else {
            enemy.isConfused = true;
        };
    };
    confuse = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) {
            this.player.isConfused = true;
        } else {
            enemy.isConfused = true;
        };
    };

    fear = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) {
            this.player.isFeared = true;
        } else {
            enemy.isFeared = true;
        };
    };
    freeze = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) {
            this.player.isFrozen = true;
        } else {
            enemy.isFrozen = true;
        };
    };
    fyerus = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0 && enemy.isDefeated !== true) {
            const damage = Math.round(this?.state?.player?.[this?.state?.player?.mastery as keyof typeof this.state.player] * 0.3);
            const health = enemy.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
            enemy.isSlowed = true;
        };
    };
    howl = (id: string): void => {
        if (id === '') return;
        this.stunned(id);
    };
    kynisos = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) {
            this.player.isRooted = true;
        } else {
            const damage = Math.round(this?.state?.player?.[this?.state?.player?.mastery as keyof typeof this.state.player] * 0.3);
            const health = enemy.health - damage;
            enemy.isRooted = true;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
        };
    };
    paralyze = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) {
            this.player.isParalyzed = true;
        } else {
        console.log('Paralyzing Enemy');
            enemy.isParalyzed = true;
        };
    };
    polymorph = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) {
            this.player.isPolymorphed = true;
        } else {
            enemy.isPolymorphed = true;
        };
    };
    renewal = () => {
        this.combatMachine.action({ data: { key: 'player', value: 7.5, id: this.player.playerID }, type: 'Health' });
    };
    enemyRenewal = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        if (!enemy) return;
        const heal = enemy.ascean.health.max * 0.1;
        const health = Math.min(enemy.health + heal, enemy.ascean.health.max);
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
    };
    root = (): void => {
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === this.state.enemyID);
        if (!enemy) return;
        enemy.isRooted = true;

        let x = this.rightJoystick.pointer.x;
        let x2 = window.innerWidth / 2;

        let y = this.rightJoystick.pointer.y;
        let y2 = window.innerHeight / 2;

        const worldX = (x > x2 ? x : -x) + this.player.x;
        const worldY = (y > y2 ? y : -y) + this.player.y;
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, worldX, worldY);
        const duration = 2 * distance;
        const rise = 0.5 * distance;
        const rootTween = this.add.tween({
            targets: this.target,
            props: {
                x: { from: this.player.x, to: worldX, duration: duration },
                y: { from: this.player.y, to: worldY, duration: duration }, 
                z: {
                    from: 0,
                    to: -rise,
                    duration: 0.5 * duration,
                    ease: 'Quad.easeOut',
                    yoyo: true
                },
                onStart: () => {
                    this.target.setVisible(true);
                },    
                onUpdate: (_tween, target: GameObjects.Sprite, key: any, current) => {
                    if (key !== 'z') return;
                    target.y += current;
                },
                onComplete: () => {
                    this.time.addEvent({
                        delay: 3000,
                        callback: () => {
                            this.target.setVisible(false);
                            rootTween.destroy();
                        },
                        callbackScope: this
                    });
                }, 
            },
        });
    };
    scream = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) {
            this.player.isFeared = true;
        } else {
            enemy.isFeared = true;
        };
    };
    slow = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) {
            this.player.isSlowed = true;
        } else {
            enemy.isSlowed = true;
        };
    };
    snare = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) {
            this.player.isSnared = true;
        } else {
            enemy.isSnared = true;
        };
    };
    storm = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);

        const match = this.player.enemyIdMatch();
        if (match) { // Target Player Attack
            console.log('Matched Storm')
            this.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: 'storm' } });
        } else { // Blind Player Attack
            console.log('Blind Storm')
            this.combatMachine.action({ type: 'Player', data: { 
                playerAction: { action: 'storm', parry: this.state.parryGuess }, 
                enemyID: enemy.enemyID, 
                ascean: enemy.ascean, 
                damageType: enemy.currentDamageType, 
                combatStats: enemy.combatStats, 
                weapons: enemy.weapons, 
                health: enemy.health, 
                actionData: { action: enemy.currentAction, parry: enemy.parryAction }
            }});
        };
    };
    stun = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) {
            this.player.isStunned = true;
        } else {
            enemy.isBlindsided = true;
        };
    };
    stunned = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) {
            this.player.isStunned = true;
        } else {
            enemy.isStunned = true;
        };
    };
    tendril = (id: string): void => {
        if (id === '') return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0 && enemy.isDefeated !== true) {
            const damage = Math.round(this?.state?.player?.[this?.state?.player?.mastery as keyof typeof this.state.player] * 0.3);
            const total = Math.max(0, enemy.health - damage);
            this.combatMachine.action({ data: { key: 'enemy', value: total, id }, type: 'Health' });
        } else if (id === this.player.playerID) {
            this.combatMachine.action({ data: 10, type: 'Enemy Chiomic' });
        };
    };
    writhe = (id: string, special?: string): void => {
        if (id === '') return;
        if (!this.player.inCombat) return;
        let enemy = this.enemies.find((e: any) => e.enemyID === id);

        if (!enemy) {
            if (id === this.player.playerID) {
                this.combatMachine.action({ data: 20, type: 'Enemy Chiomic' });
            };
        } else {
            const match = this.player.enemyIdMatch();
            if (match) { // Target Player Attack
                console.log('Matched Writhe');
                this.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: special ? special : 'writhe' } });
            } else { // Blind Player Attack
                console.log('Blind Writhe');
                this.combatMachine.action({ type: 'Player', data: { 
                    playerAction: { action: 'writhe', parry: this.state.parryGuess }, 
                    enemyID: enemy.enemyID, 
                    ascean: enemy.ascean, 
                    damageType: enemy.currentDamageType, 
                    combatStats: enemy.combatStats, 
                    weapons: enemy.weapons, 
                    health: enemy.health, 
                    actionData: { action: enemy.currentAction, parry: enemy.parryAction }
                }});
            };
        };
    };

    // ============================ Game ============================ \\

    checkPlayerSuccess = (): void => {
        if (!this.player.actionSuccess && (this.state.action !== 'parry' && this.state.action !== 'roll' && this.state.action !== '')) this.combatMachine.input('action', '');
    };
    clearNAEnemy = (): boolean => EventBus.emit('clear-enemy');
    clearNPC = (): boolean => EventBus.emit('clear-npc'); 
    combatEngaged = (bool: boolean) => {
        EventBus.emit('combat-engaged', bool);
        if (bool === true && this.combat !== bool) {
            this.musicCombat.play();
            this.musicBackground.pause();
            this.startCombatTimer();
        } else if (bool === false) {
            this.musicCombat.pause();
            this.musicBackground.resume();
            this.stopCombatTimer();    
        };
        this.combat = bool;
    };
    pauseMusic = (): void => {
        this.musicBackground.pause();
        this.musicCombat.pause();
    };
    resumeMusic = (): void => {
        if (!this.combat) {
            this.musicBackground.resume();
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
        const data = { id: npc.id, game: npc.ascean, enemy: npc.combatStats, health: npc.health, type: npc.npcType };
        EventBus.emit('setup-npc', data);    
    };
    showDialog = (dialog: boolean): boolean => EventBus.emit('blend-game', { dialogTag: dialog }); // smallHud: dialog

    // ============================ Player ============================ \\
    caerenic = (): boolean => EventBus.emit('update-caerenic');
    stalwart = (): boolean => EventBus.emit('update-stalwart');
    useStamina = (value: number): boolean => EventBus.emit('update-stamina', value);
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
        this.combatMachine.processor();
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
        this.cameras.main.setFollowOffset(this.offsetX, this.offsetY);
    };
    setCameraOffset = () => {
        if (this.player.flipX === true) {
            this.offsetX = Math.min(125, this.offsetX + 2);
        } else {
            this.offsetX = Math.max(this.offsetX - 2, -125);
        };
        if (this.player.velocity.y > 0) {
            this.offsetY = Math.max(this.offsetY - 1.5, -75);
        } else if (this.player.velocity.y < 0) {
            this.offsetY = Math.min(75, this.offsetY + 1.5);
        };
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
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].update();
        };
        this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(2)); 
    };
    pause(): void {
        this.scene.pause();
        if (!this.combat) {
            this.musicBackground.pause();
        } else {
            this.musicCombat.pause();
        };
    };
    resume(): void {
        this.scene.resume();
        if (this.settings?.music === false) return;
        if (!this.combat) {
            if (this.musicBackground.isPaused) {
                this.musicBackground.resume();
            } else {
                this.musicBackground.play();
            }
        } else {
            this.musicCombat.resume();
        };
    };
};