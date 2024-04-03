import Ascean from '../../models/ascean';
import { Combat, initCombat } from '../../stores/combat';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
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

export class Game extends Scene {
    gameText: Phaser.GameObjects.Text;
    gameState: GameState | undefined;
    ascean: Ascean  | undefined;
    state: Combat = initCombat;
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
    combatTimer: Phaser.Time.TimerEvent;
    
    actionBar: ActionButtons;
    combatMachine: CombatMachine;
    particleManager: ParticleManager;
    
    map: Phaser.Tilemaps.Tilemap;
    background: Phaser.GameObjects.Image;
    camera: Phaser.Cameras.Scene2D.Camera;
    rexUI: any;
    navMesh: any;
    navMeshPlugin: any;
    joystick: any;
    baseSprite: Phaser.GameObjects.Sprite;
    thumbSprite: Phaser.GameObjects.Sprite;
    postFxPipeline: any;

    music: Phaser.Sound.BaseSound;
    spooky: Phaser.Sound.BaseSound;
    righteous: Phaser.Sound.BaseSound;
    wild: Phaser.Sound.BaseSound;
    earth: Phaser.Sound.BaseSound;
    fire: Phaser.Sound.BaseSound;
    frost: Phaser.Sound.BaseSound;
    lightning: Phaser.Sound.BaseSound;
    wind: Phaser.Sound.BaseSound;
    sorcery: Phaser.Sound.BaseSound;
    bow: Phaser.Sound.BaseSound;
    slash: Phaser.Sound.BaseSound;
    blunt: Phaser.Sound.BaseSound;
    pierce: Phaser.Sound.BaseSound;
    roll: Phaser.Sound.BaseSound;
    counter: Phaser.Sound.BaseSound;
    weaponOrder: Phaser.Sound.BaseSound;
    actionButton: Phaser.Sound.BaseSound;
    equip: Phaser.Sound.BaseSound;
    unequip: Phaser.Sound.BaseSound;
    purchase: Phaser.Sound.BaseSound;
    treasure: Phaser.Sound.BaseSound;
    phenomena: Phaser.Sound.BaseSound;
    fpsText: Phaser.GameObjects.Text;
    volumeEvent: () => void;

    constructor () {
        super('Game');
    };

    create () {

        // ================== Camera ================== \\

        let camera = this.cameras.main;
        camera.zoom = 0.8;

        // ================== Event Bus ================== \\

        EventBus.emit('current-scene-ready', this);

        this.asceanEvent();
        this.getAscean();
        this.combatEvent();
        this.getCombat();
        this.gameEvent();
        this.getGame();
        this.settingsEvent();
        this.getSettings();

        // ================== Add Multiple Inputs ================== \\
        this.input.addPointer(3);
        this.input.addPointer(4);
        this.input.addPointer(5);

        // ================== Ascean Test Map ================== \\
        const map = this.make.tilemap({ key: 'ascean_test' });
        this.map = map;
        const camps = map.addTilesetImage('Camp_Graves', 'Camp_Graves', 32, 32, 0, 0);
        const decorations = map.addTilesetImage('AncientForestDecorative', 'AncientForestDecorative', 32, 32, 0, 0);
        const tileSet = map.addTilesetImage('AncientForestMain', 'AncientForestMain', 32, 32, 0, 0);
        const layer0 = map.createLayer('Tile Layer 0 - Base', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        const layer1 = map.createLayer('Tile Layer 1 - Top', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        const layerC = map.createLayer('Tile Layer - Construction', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 2 - Flowers', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 3 - Plants', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 4 - Primes', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 5 - Snags', decorations as Phaser.Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer 6 - Camps', camps as Phaser.Tilemaps.Tileset, 0, 0);
        layer0?.setCollisionByProperty({ collides: true });
        layer1?.setCollisionByProperty({ collides: true });
        layerC?.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer0 as Phaser.Tilemaps.TilemapLayer);
        this.matter.world.convertTilemapLayer(layer1 as Phaser.Tilemaps.TilemapLayer);
        this.matter.world.convertTilemapLayer(layerC as Phaser.Tilemaps.TilemapLayer); 
        // this.matter.world.createDebugGraphic(); 

        const objectLayer = map.getObjectLayer('navmesh');
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, 32);
        this.navMesh = navMesh;
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.navMesh.enableDebug(debugGraphics); 
        this.matter.world.setBounds(0, 0, 4096, 4096); // Top Down

        this.player = new Player({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });
        map?.getObjectLayer('Enemies')?.objects.forEach((enemy: any) => 
            this.enemies.push(new Enemy({ scene: this, x: enemy.x, y: enemy.y, texture: 'player_actions', frame: 'player_idle_0' })));
        map?.getObjectLayer('Npcs')?.objects.forEach((npc: any) => 
            this.npcs.push(new NPC({ scene: this, x: npc.x, y: npc.y, texture: 'player_actions', frame: 'player_idle_0' })));

        // ====================== Camera ====================== \\
            
        camera.startFollow(this.player);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, 4096, 4096);
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.35); // Black with 50% opacity
        darkOverlay.fillRect(0, 0, 4096, 4096);

        var postFxPlugin = this.plugins.get('rexHorrifiPipeline');
        console.log(this.settings, this.settings?.postFx?.scanlinesEnable, 'Settings');
        this.postFxPipeline = (postFxPlugin as any)?.add(this.cameras.main, { 
            enable: this.settings?.postFx?.enable,
            bloomRadius: 25,
            bloomIntensity: 0.5,
            bloomThreshold: 0.5,
            // Chromatic abberation
            chromaticEnable: this.settings?.postFx?.chromaticEnable,
            chabIntensity: this.settings?.postFx?.chabIntensity,
            // Vignette
            vignetteEnable: this.settings?.postFx?.vignetteEnable,
            vignetteStrength: this.settings?.postFx?.vignetteStrength,
            vignetteIntensity: this.settings?.postFx?.vignetteIntensity,
            // Noise
            noiseEnable: this.settings?.postFx?.noiseEnable,
            noiseStrength: this.settings?.postFx?.noiseStrength,
            // seed: 0.5,
            
            // VHS
            vhsEnable: this.settings?.postFx?.vhsEnable,
            vhsStrength: this.settings?.postFx?.vhsStrength,

            // Scanlines
            scanLinesEnable: this.settings?.postFx?.scanlinesEnable,
            scanStrength: this.settings?.postFx?.scanStrength,

            // CRT
            crtEnable: this.settings?.postFx?.crtEnable,
            crtWidth: this.settings?.postFx?.crtWidth,
        });

        this.setPostFx(this.settings?.postFx, this.settings?.postFx.enable);

        // ====================== Combat Machine ====================== \\

        this.combatMachine = new CombatMachine(this);
        this.particleManager = new ParticleManager(this);

        // ================= Action Buttons ================= \\

        this.target = this.add.sprite(0, 0, "target").setDepth(10).setScale(0.15).setVisible(false);
        this.actionBar = new ActionButtons(this);

        // ====================== Input Keys ====================== \\

        this.player.inputKeys = {
            up: this?.input?.keyboard?.addKeys('W,UP'),
            down: this?.input?.keyboard?.addKeys('S,DOWN'),
            left: this?.input?.keyboard?.addKeys('A,LEFT'),
            right: this?.input?.keyboard?.addKeys('D,RIGHT'),
            attack: this?.input?.keyboard?.addKeys('ONE'),
            counter: this?.input?.keyboard?.addKeys('FIVE'),
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


        // =========================== Lighting =========================== \\

        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 200, 0.0675, 0.0675); // 0xFFD700 || 0xFDF6D8 || 0xDAA520
        
        // =========================== Music =========================== \\

        this.music = this.sound.add('background', { volume: this?.settings?.volume ?? 0 / 2, loop: true });
        this.music.play();
        // this.volumeEvent = () => EventBus.on('update-volume', (e) => this.music.setVolume(e));
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
        this.counter = this.sound.add('counter', { volume: this?.settings?.volume });
        this.weaponOrder = this.sound.add('weaponOrder', { volume: this?.settings?.volume });
        this.actionButton = this.sound.add('action-button', { volume: this?.settings?.volume });
        this.equip = this.sound.add('equip', { volume: this?.settings?.volume });
        this.unequip = this.sound.add('unequip', { volume: this?.settings?.volume });
        this.purchase = this.sound.add('purchase', { volume: this?.settings?.volume });
        this.treasure = this.sound.add('treasure', { volume: this?.settings?.volume });
        this.phenomena = this.sound.add('phenomena', { volume: this?.settings?.volume });

        // =========================== FPS =========================== \\

        this.fpsText = this.add.text(window.innerWidth / 2 - 32, -40, 'FPS: ', { font: '16px Cinzel', color: '#fdf6d8' });
        this.fpsText.setScrollFactor(0);
        this.fpsText.setInteractive()
            .on('pointerup', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                };
            });

        this.equipEvent();
        this.unequipEvent();
        this.purchaseEvent();
        this.weaponEvent();
        this.actionButtonEvent();
        this.postFxEvent();
        this.lootDropEvent();
    };

    asceanEvent():void {
        EventBus.on('ascean', (ascean: Ascean) => {
            this.ascean = ascean;
        });
    };

    combatEvent():void {
        EventBus.on('combat', (combat: any) => {
            this.state = combat;
        });
    };

    gameEvent():void {
        EventBus.on('game', (game: GameState) => {
            this.gameState = game;
        });
    };

    settingsEvent():void {
        EventBus.on('settings', (settings: Settings) => {
            this.settings = settings;
        });
    };

    lootDropEvent(): void {
        EventBus.on('enemyLootDrop', (drops: any) => {
            drops.drops.forEach((drop: Equipment) => {
                this.lootDrops.push(new LootDrop({ scene: this, enemyID: drops.enemyID, drop }))
            })
        });
    };

    postFxEvent = () => EventBus.on('update-postfx', (data: {type: string, val: boolean | number}) => {
        const { type, val } = data;
        console.log(type, val, 'Type and Value') 
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

    setPostFx = (settings: any, enable: boolean) => { 
        console.log(settings, 'PostFx Settings being Set in Phaser')
        if (enable) this.postFxPipeline.setEnable();
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

    equipEvent():void {
        EventBus.on('equip-sound', () => {
            this.equip.play();
        });
    };
    unequipEvent():void {
        EventBus.on('unequip-sound', () => {
            this.unequip.play();
        });
    };
    purchaseEvent():void {
        EventBus.on('purchase-sound', () => {
            this.purchase.play();
        });
    };
    weaponEvent():void {
        EventBus.on('weapon-order-sound', () => {
            this.weaponOrder.play();
        });
    };
    actionButtonEvent():void {
        EventBus.on('action-button-sound', () => {
            this.actionButton.play();
        });
    };

    changeScene(): void {
        this.scene.start('GameOver');
    };

    getAscean(): void {
        EventBus.emit('request-ascean');
    };

    getCombat(): void {
        EventBus.emit('request-combat');
    };

    getGame(): void {
        EventBus.emit('request-game');
    };

    getSettings(): void {
        EventBus.emit('request-settings');
    };

    handleJoystickUpdate() {
        var cursorKeys = this.joystick.createCursorKeys();
        for (let name in cursorKeys) {
           console.log(name,  'Name of Cursor Key')
            if (cursorKeys[name].isDown) {
                console.log(name, 'IS DOWN')
                if (name === 'up') this.player.setVelocityY(-1.5);
                if (name === 'down') this.player.setVelocityY(1.5);
                if (name === 'left') this.player.setVelocityX(-1.5);
                if (name === 'right') this.player.setVelocityX(1.5);
            };
        };
    };

    // ================== Combat ================== \\

    getEnemy(id: string) {
        return this.enemies.find((enemy: any) => enemy.enemyID === id);
    };

    // ============================ Combat ============================ \\ 
    polymorph = (id: string) => {
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        enemy.isPolymorphed = true;
    };
    root = () => {
        // const { worldX, worldY } = this.input.activePointer;
        console.log(this.player.rightJoystick.pointer.worldX, this.player.rightJoystick.pointer.worldY, 'Right Joystick Pointer')
        const bounds = this.player.rightJoystick.pointer.getBounds();
        console.log(bounds, 'Bounds');
        const worldX = bounds.centerX;
        const worldY = bounds.centerY;
        // const worldX = this.player.rightJoystick.pointer.x;
        // const worldY = this.player.rightJoystick.pointer.y;
        console.log(worldX, worldY, 'World X and Y');
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, worldX, worldY);
        const duration = 2 * distance;
        const rise = 0.5 * distance;
        const sensorRadius = 25;
        const sensorBounds = new Phaser.Geom.Circle(worldX, worldY, sensorRadius);

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
                onUpdate: (_tween, target: Phaser.GameObjects.Sprite, key: any, current) => {
                    if (key !== 'z') return;
                    target.y += current;
                },
                onComplete: () => {
                    this.enemies.forEach((enemy: any) => {
                        if (Phaser.Geom.Circle.ContainsPoint(sensorBounds, new Phaser.Geom.Point(enemy.x, enemy.y))) {
                            enemy.isRooted = true;
                        };
                    });
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
    snare = (id: string): void => {
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        enemy.isSnared = true;
    };
    stun = (id: string): void => {
        let enemy = this.enemies.find((enemy: any) => enemy.enemyID === id);
        enemy.isBlindsided = true;
    };

    // ============================ Game ============================ \\

    checkPlayerSuccess = () => {
        if (!this.player.actionSuccess && (this.state.action !== 'counter' && this.state.action !== 'roll' && this.state.action !== '')) this.combatMachine.input('action', '');
    };
    clearNAEnemy = () => EventBus.emit('clear-enemy');
    clearNPC = () => EventBus.emit('clear-npc'); 
    combatEngaged = (bool: boolean) => {
        this.combat = bool;
        console.log(`Combat engaged: ${bool}`);
        // this.dispatch(getCombatFetch(bool));
    };
    drinkFlask = () => EventBus.emit('drink-firewater');
    setupEnemy = (enemy: any) => {
        const data = { id: enemy.enemyID, game: enemy.ascean, enemy: enemy.combatStats, health: enemy.health, isAggressive: enemy.isAggressive, startedAggressive: enemy.startedAggressive, isDefeated: enemy.isDefeated, isTriumphant: enemy.isTriumphant };
        EventBus.emit('setup-enemy', data);
    };
    setupNPC = (npc: any) => {
        const data = { id: npc.id, game: npc.ascean, enemy: npc.combatStats, health: npc.health, type: npc.npcType };
        EventBus.emit('setup-npc', data);    
    };
    showDialog = (dialog: boolean) => EventBus.emit('show-dialog', dialog);

    // ============================ Player ============================ \\

    caerenic = () => EventBus.emit('update-caerenic');
    stalwart = () => EventBus.emit('update-stalwart');
    useStamina = (value: number) => EventBus.emit('update-stamina', value);

    createTextBorder(text: NewText) {
        const border = this.add.graphics();
        border.lineStyle(4, 0x2A0134, 1);
        border.strokeRect(
            text.x - text.width * text.origin.x - 2.5,
            text.y - text.height * text.origin.y - 2.5, 
            text.width + 5, 
            text.height + 5 
        );
            
        this.add.existing(border);
        return border;
    };   

    startCombatTimer = () => {
        console.log('Starting Combat Timer')
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

    stopCombatTimer = () => {
        console.log('Stopping Combat Timer')
        this.combatTimer.destroy();
        // this.combatTimer = undefined;
        this.combatTime = 0;
        EventBus.emit('update-combat-timer', this.combatTime);
    };

    // ================== Update ================== \\

    update() {
        this.player.update(); 
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update();
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].update();
        }; 
        this.combatMachine.processor();

        this.playerLight.setPosition(this.player.x, this.player.y);
        this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(2));
    };

    pause() {
        this.scene.pause();
        this.music.pause();
    };
    resume() {
        this.scene.resume();
        this.music.resume();
    };
};