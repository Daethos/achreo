import { Cameras, GameObjects, Scene, Tilemaps, Time } from 'phaser';
import { Combat, initCombat } from '../../stores/combat';
import { EventBus } from '../EventBus';
import LootDrop from '../matter/LootDrop';
import { GameState } from '../../stores/game';
import Equipment from '../../models/equipment';
import { States } from '../phaser/StateMachine';
import { EnemySheet } from '../../utility/enemy';
import Fov from '../phaser/Fov';
import { Reputation, initReputation } from '../../utility/player';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
// @ts-ignore
import AnimatedTiles from 'phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js';
import Tile from '../phaser/Tile';
import { CombatManager } from '../phaser/CombatManager';
import MiniMap from '../phaser/MiniMap';
// import ScrollingCombatText from '../phaser/ScrollingCombatText';
import ParticleManager from '../matter/ParticleManager';
import { screenShake } from '../phaser/ScreenShake';
import { Hud } from './Hud';
import { Compiler } from '../../utility/ascean';
import PlayerComputer from '../entities/PlayerComputer';
import MovingPlatform from '../matter/MovingPlatform';
import { ObjectPool } from '../phaser/ObjectPool';
import ScrollingCombatText from '../phaser/ScrollingCombatText';

export class Arena extends Scene {
    animatedTiles: any[];
    offsetX: number;
    offsetY: number;
    gameState: GameState | undefined;
    state: Combat = initCombat;
    reputation: Reputation = initReputation;
    player: any;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] | any[] = [];
    focus: any;
    target: any;
    targetTarget: any;
    playerLight: any;
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
    postFxPipeline: any;
    musicBackground: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat2: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    volumeEvent: () => void;
    matterCollision: any;
    combatManager: CombatManager;
    vision: any;
    fov?: any;
    groundLayer?: any;
    layer2?: any;
    layer3?: any;
    north: any;
    south: any;
    east: any;
    west: any;
    markers: any;
    glowFilter: any;
    hud: Hud;
    platform: MovingPlatform;
    platform2: MovingPlatform;
    platform3: MovingPlatform;
    wager = { silver: 0, gold: 0, multiplier: 0 };
    scrollingTextPool: ObjectPool<ScrollingCombatText>;

    constructor () {
        super('Arena');
    };

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    };

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.hud = hud;
        this.gameEvent();
        this.state = this.registry.get("combat");
        this.reputation = this.getReputation();
        this.offsetX = 0;
        this.offsetY = 0;
        this.tweenManager = {};
        this.markers = [];
        let camera = this.cameras.main;
        camera.zoom = this.hud.settings.positions?.camera?.zoom || 1;
        const map = this.make.tilemap({ key: 'arena' });
        this.map = map;
        this.add.rectangle(0, 0, 4096, 4096, 0x000000);
        const tileSize = 32;
        const castleInterior = map.addTilesetImage('Castle Interior', 'Castle Interior', tileSize, tileSize, 0, 0);
        const castleDecorations = map.addTilesetImage('Castle Decoratives', 'Castle Decoratives', tileSize, tileSize, 0, 0);
        let layer1 = map.createLayer('Floors', castleInterior as Tilemaps.Tileset, 0, 0);
        let layer2 = map.createLayer('Decorations', castleDecorations as Tilemaps.Tileset, 0, 0);
        let layer3 = map.createLayer('Top Layer', castleInterior as Tilemaps.Tileset, 0, 0);
        layer1?.setCollisionByProperty({ collides: true });
        [layer1, layer2, layer3].forEach((layer) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            layer?.forEachTile((tile) => {tile = new Tile(tile);});
        });
        layer3?.setDepth(6);
        this.groundLayer = layer1;
        this.layer2 = layer2;
        this.layer3 = layer3;
        this.fov = new Fov(this, this.map, [this.groundLayer, this.layer2, this.layer3]);
        const objectLayer = map.getObjectLayer('navmesh');
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels); // Top Down
        (this.sys as any).animatedTiles.init(this.map);
        map?.getObjectLayer('summons')?.objects.forEach((summon: any) => this.markers.push(summon));
        const random = this.markers[Math.floor(Math.random() * this.markers.length)];        
        if (this.hud.settings.difficulty.arena) {
            this.player = new Player({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });
        } else {
            this.player = new PlayerComputer({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });
            this.hud.actionBar.setVisible(false);
            this.hud.joystick.joystick.setVisible(false);
            this.hud.rightJoystick.joystick.setVisible(false);
        };
        this.player.setPosition(random.x,random.y);

        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setRoundPixels(true);

        var postFxPlugin = this.plugins.get('rexHorrifiPipeline');
        this.postFxPipeline = (postFxPlugin as any)?.add(this.cameras.main);
        this.setPostFx(this.hud.settings?.postFx, this.hud.settings?.postFx.enable);
        this.particleManager = new ParticleManager(this);
        this.target = this.add.sprite(0, 0, "target").setDepth(99).setScale(0.15).setVisible(false);

        this.player.inputKeys = {
            up: this?.input?.keyboard?.addKeys('W,UP'),
            down: this?.input?.keyboard?.addKeys('S,DOWN'),
            left: this?.input?.keyboard?.addKeys('A,LEFT'),
            right: this?.input?.keyboard?.addKeys('D,RIGHT'),
            action: this?.input?.keyboard?.addKeys('ONE,TWO,THREE,FOUR,FIVE'),
            strafe: this?.input?.keyboard?.addKeys('E,Q'),
            shift: this?.input?.keyboard?.addKeys('SHIFT'),
            firewater: this?.input?.keyboard?.addKeys('T'),
            tab: this?.input?.keyboard?.addKeys('TAB'),
            escape: this?.input?.keyboard?.addKeys('ESC'),
        };
        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 100, 0.05, 0.05); // 0xFFD700 || 0xFDF6D8 || 0xDAA520
        this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        this.musicBackground = this.sound.add('isolation', { volume: this?.hud?.settings?.volume || 0.1, loop: true });
        if (this.hud.settings?.music === true) this.musicBackground.play();
        this.musicCombat = this.sound.add('industrial', { volume: this?.hud?.settings?.volume, loop: true });
        this.musicCombat2 = this.sound.add('combat2', { volume: this?.hud?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add('stealthing', { volume: this?.hud?.settings?.volume, loop: true });
        
        // this.platform = new MovingPlatform(this, 1440, 640, 'player-castbar', { isStatic: true });
        // this.platform.vertical(0, 1320, 12000);
        
        // this.platform2 = new MovingPlatform(this, 768, 224, 'player-castbar', { isStatic: true });
        // this.platform2.setAngle(90);
        // this.platform2.horizontal(0, 1824, 12000);
        
        // this.platform3 = new MovingPlatform(this, 192, 1792, 'player-castbar', { isStatic: true });
        // this.platform3.setAngle(90);
        // this.platform3.horizontal(0, 1440, 12000);
        
        this.postFxEvent();
        if (this.hud.settings.desktop === true) {
            this.input.setDefaultCursor('url(assets/images/cursor.png), pointer');
        };
        this.combatManager = new CombatManager(this);
        this.minimap = new MiniMap(this);
        this.input.mouse?.disableContextMenu();
        this.glowFilter = this.plugins.get('rexGlowFilterPipeline');
        
        this.createArenaEnemy();
        this.scrollingTextPool = new ObjectPool<ScrollingCombatText>(() =>  new ScrollingCombatText(this, this.scrollingTextPool));
        for (let i = 0; i < 50; i++) {
            this.scrollingTextPool.release(new ScrollingCombatText(this, this.scrollingTextPool));
        };
        EventBus.emit('current-scene-ready', this);
    };

    showCombatText(text: string, duration: number, context: string, critical: boolean, constant: boolean, onDestroyCallback: () => void): ScrollingCombatText {
        const combatText = this.scrollingTextPool.acquire();
        combatText.reset(text, duration, context, critical, constant, onDestroyCallback);
        return combatText;
    };

    cleanUp = (): void => {
        EventBus.off('combat');
        EventBus.off('reputation');
        EventBus.off('enemyLootDrop');
        EventBus.off('minimap');
        EventBus.off('update-postfx');
        EventBus.off('music');
        EventBus.off('game-map-load');
        EventBus.off('update-camera-zoom');
        EventBus.off('update-speed');
        EventBus.off('update-enemy-special');
        EventBus.off('resetting-game');
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
        this.player.cleanUp();
    };

    gameEvent = (): void => {
        EventBus.on('combat', (combat: any) => this.state = combat); 
        EventBus.on('reputation', (reputation: Reputation) => this.reputation = reputation);
        EventBus.on('game-map-load', (data: { camera: any, map: any }) => {this.map = data.map;});
        EventBus.on('enemyLootDrop', (drops: any) => {
            if (drops.scene !== 'Arena') return;
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
        EventBus.on('music', (on: boolean) => {
            if (on === true && !this.scene.isPaused('Arena')) {
                this.resumeMusic();
            } else {
                this.pauseMusic();
            };
        });
        EventBus.on('check-stealth', (stealth: boolean) => {
            this.stealth = stealth;
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
        EventBus.on('update-enemy-special', (special: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isSpecial = special >= Math.random();
            };
        });
        EventBus.on('resetting-game', () => {
            this.sound.play('TV_Button_Press', { volume: this?.hud?.settings?.volume * 2 });
            this.cameras.main.fadeOut().once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_came: any, _effect: any) => {
                EventBus.emit('reset-game');
            });
        });
        EventBus.on('switch-arena', this.switchArena);
    };

    resumeScene = () => {
        this.cameras.main.fadeIn();
        this.resumeMusic();
        this.state = this.registry.get("combat");
        this.player.health = this.state.newPlayerHealth;
        this.player.healthbar.setValue(this.state.newPlayerHealth);
        this.registry.set("player", this.player);
        if (this.state.isStealth) {
            this.player.playerMachine.positiveMachine.setState(States.STEALTH);
            this.stealthEngaged(true);
        };
        const random = this.markers[Math.floor(Math.random() * this.markers.length)];
        this.player.setPosition(random.x, random.y);
        if (this.player.isComputer) {
            this.hud.actionBar.setVisible(false);
            this.hud.joystick.joystick.setVisible(false);
            this.hud.rightJoystick.joystick.setVisible(false);
        };
        this.createArenaEnemy();
        this.scene.wake();
        EventBus.emit('current-scene-ready', this);
    };

    switchScene = (current: string) => {
        this.cameras.main.fadeOut().once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
            this.registry.set("combat", this.state);
            this.registry.set("settings", this.hud.settings);
            this.registry.set("ascean", this.state.player);
            this.hud.actionBar.setVisible(true);
            this.player.disengage();
            this.pauseMusic();
            this.scene.sleep(current);
        });
    };

    wakeUp = () => {
        this.scene.resume();
        if (this.combat) {
            if (this.musicCombat.isPaused) {
                this.musicCombat.resume();
            } else {
                this.musicCombat2.resume();
            };
            this.startCombatTimer();    
        } else if (this.player.isStealthing) {
            this.musicStealth.resume();
        } else {
            this.musicBackground.resume();
        };
        this.createArenaEnemy();
        EventBus.emit('current-scene-ready', this);
    };

    postFxEvent = () => EventBus.on('update-postfx', (data: {type: string, val: boolean | number}) => {
        const { type, val } = data;
        if (type === 'bloom') this.postFxPipeline.setBloomRadius(val);
        if (type === 'threshold') this.postFxPipeline.setBloomThreshold(val);
        if (type === 'chromatic') {
            if (val === true) {
                this.postFxPipeline.setChromaticEnable();
            } else {
                this.postFxPipeline.setChromaticEnable(val);
            };
        };
        if (type === 'chabIntensity') this.postFxPipeline.setChabIntensity(val);
        if (type === 'vignetteEnable') {
            if (val === true) {
                this.postFxPipeline.setVignetteEnable();
            } else {
                this.postFxPipeline.setVignetteEnable(val);
            };
        };
        if (type === 'vignetteStrength') this.postFxPipeline.setVignetteStrength(val);
        if (type === 'vignetteIntensity') this.postFxPipeline.setVignetteIntensity(val);
        if (type === 'noiseEnable') {
            if (val === true) {
                this.postFxPipeline.setNoiseEnable();
            } else {
                this.postFxPipeline.setNoiseEnable(val);
            };
        };
        if (type === 'noiseSeed') this.postFxPipeline.setNoiseSeed(val);
        if (type === 'noiseStrength') this.postFxPipeline.setNoiseStrength(val);
        if (type === 'vhsEnable') {
            if (val === true) {
                this.postFxPipeline.setVHSEnable();
            } else {
                this.postFxPipeline.setVHSEnable(val);
            };
        };
        if (type === 'vhsStrength') this.postFxPipeline.setVhsStrength(val);
        if (type === 'scanlinesEnable') {
            if (val === true) {
                this.postFxPipeline.setScanlinesEnable();
            } else {
                this.postFxPipeline.setScanlinesEnable(val);
            };
        };
        if (type === 'scanStrength') this.postFxPipeline.setScanStrength(val);
        if (type === 'crtEnable') {
            if (val === true) {
                this.postFxPipeline.setCRTEnable();
            } else {
                this.postFxPipeline.setCRTEnable(val);
            };
        };
        if (type === 'crtHeight') this.postFxPipeline.crtHeight = val;
        if (type === 'crtWidth') this.postFxPipeline.crtWidth = val;
        if (type === 'enable') {
            if (val === true) {
                this.setPostFx(this.hud.settings?.postFx, true);
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

    getReputation = (): Reputation => {
        EventBus.emit('request-reputation');
        return this.reputation;
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

    isStateEnemy = (id: string): boolean => id === this.state.enemyID;

    quickCombat = () => {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].inCombat === true) {
                this.player.quickTarget(this.enemies[i]);
                return;    
            };
        };
    };

    clearNonAggressiveEnemy = () => this.combatManager.combatMachine.action({ data: { key: 'player', value: 0, id: this.player.playerID }, type: 'Remove Enemy' });
    
    clearNPC = (): boolean => EventBus.emit('clear-npc');

    clearAggression = () => {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].inCombat === true) {
                this.enemies[i].clearCombat();
            };
        };
    };

    switchArena = () => {
        this.wager = { silver: 0, gold: 0, multiplier: 0 };
        EventBus.emit("alert", { header: "Exiting the Eulex", body: `You are now poised to leave the arena. Stand by, this experience is automated.`, duration: 3000, key: "Close" });    
        this.time.delayedCall(3000, () => {
            EventBus.emit("scene-switch", {current:"Arena", next:"Underground"});
        }, undefined, this);
    };

    clearArena = () => {
        if (this.enemies.length > 0) {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].cleanUp();
                this.enemies[i].destroy();
            };
            this.enemies = [];
        };
        this.player.disengage();
        this.player.clearEnemies();
        if (this.player.isComputer) (this.player as PlayerComputer).completeReset();
    };

    computerDisengage = () => {
        this.player.disengage();
        this.player.clearEnemies();
        if (this.player.isComputer) (this.player as PlayerComputer).completeReset();
    };

    combatEngaged = (bool: boolean) => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (bool === true) {
            screenShake(this);
            this.cameras.main.flash(60, 156, 163, 168, false, undefined, this);
        };
        if (bool === true && this.combat === false) {
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
        EventBus.emit('combat-engaged', bool);
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
    showDialog = (dialogTag: boolean) => {
        EventBus.emit('blend-game', { dialogTag });
        this.hud.smallHud.activate('dialog', dialogTag);
    };
    createArenaEnemy = () => {
        EventBus.emit('alert', { header: "Prepare!", body: "The enemies are being summoned. Prepare for the Eulex.", key: "Close" });
        this.time.delayedCall(1500, () => {
            let data: Compiler[] = this.registry.get("enemies");
            let marker: any, markers: any[] = [], count = data.length - 1;
            for (let i = 0; i < this.markers.length; i++) {
                const position = new Phaser.Math.Vector2(this.markers[i].x, this.markers[i].y);
                const direction = position.subtract(this.player.position);
                if (direction.length() < 1250) {
                    markers.push(this.markers[i]);
                };
            };
            for (let j = 0; j < data.length; j++) {
                marker = markers[Math.floor(Math.random() * markers.length)];
                const enemy = new Enemy({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0', data: data[j] });
                this.enemies.push(enemy);
                enemy.setPosition(marker.x, marker.y);
                this.time.delayedCall(1500, () => {
                    enemy.checkEnemyCombatEnter();
                    this.player.targets.push(enemy);
                    if (count === j) {
                        if (this.player.isComputer) {
                            this.player.computerEngagement(enemy.enemyID);
                        } else {
                            this.player.targetEngagement(enemy.enemyID);
                        };
                    };
                    if (this.player.isComputer || !this.hud.settings.difficulty.arena) this.player.playerMachine.stateMachine.setState(States.CHASE);
                }, undefined, this);
            };
        }, undefined, this);
        this.wager = this.registry.get("wager");
    };
    destroyEnemy = (enemy: Enemy) => {
        enemy.isDeleting = true;
        const saying = enemy.isDefeated ? "Something is tearing into me. Please, help!" : `I'll be seeing you, ${this.state.player?.name}.`;
        enemy.specialCombatText = this.showCombatText(saying, 1500, 'bone', false, true, () => enemy.specialCombatText = undefined);
        enemy.stateMachine.setState(States.DEATH);
        this.time.delayedCall(2000, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            if (this.enemies.length === 0) { // || !this.inCombat
                if (enemy.isDefeated) {
                    EventBus.emit('settle-wager', { wager: this.wager, win: true });
                } else if (enemy.isTriumphant) {
                    EventBus.emit('settle-wager', { wager: this.wager, win: false });
                };
                this.computerDisengage();
            };
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };
    playerUpdate = (delta: number): void => {
        this.player.update(delta); 
        this.combatManager.combatMachine.process();
        this.playerLight.setPosition(this.player.x, this.player.y);
        // this.setCameraOffset();
        if (!this.hud.settings.desktop) this.hud.rightJoystick.update();
    };
    setCameraOffset = () => {
        const { width, height } = this.cameras.main.worldView;
        if (this.player.flipX === true) {
            this.offsetX = Math.min((width / 12.5), this.offsetX + 2);
        } else {
            this.offsetX = Math.max(this.offsetX - 2, -(width / 12.5));
        };
        if (this.player.velocity?.y as number > 0) {
            this.offsetY = Math.max(this.offsetY - 1.5, -(height / 9));
        } else if (this.player.velocity?.y as number < 0) {
            this.offsetY = Math.min((height / 9), this.offsetY + 1.5);
        };
        this.cameras.main.setFollowOffset(this.offsetX, this.offsetY);
    };
    startCombatTimer = (): void => {
        if (this.combatTimer) this.combatTimer.destroy();
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
        if (this.combatTimer) this.combatTimer.destroy();
        this.combatTime = 0;
        EventBus.emit('update-combat-timer', this.combatTime);
    };
    update(_time: number, delta: number): void {
        this.playerUpdate(delta);
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update(delta);
            if ((this.enemies[i].isDefeated || this.enemies[i].isTriumphant) && !this.enemies[i].isDeleting) this.destroyEnemy(this.enemies[i]);
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