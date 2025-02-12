import { Cameras, GameObjects, Scene, Tilemaps, Time } from 'phaser';
import { Combat, initCombat } from '../../stores/combat';
import { EventBus } from '../EventBus';
import LootDrop from '../matter/LootDrop';
import Equipment from '../../models/equipment';
import { States } from '../phaser/StateMachine';
import { Reputation, initReputation } from '../../utility/player';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import NPC from '../entities/NPC';
import { CombatManager } from '../phaser/CombatManager';
import MiniMap from '../phaser/MiniMap';
import { screenShake } from '../phaser/ScreenShake';
import ParticleManager from '../matter/ParticleManager';
import { Hud } from './Hud';
import ScrollingCombatText from '../phaser/ScrollingCombatText';
import { ObjectPool } from '../phaser/ObjectPool';
import Party from '../entities/PartyComputer';
import Ascean from '../../models/ascean';
import { getEnemy, populateEnemy } from '../../assets/db/db';
import { asceanCompiler, Compiler } from '../../utility/ascean';
// import { WindPipeline } from '../shaders/Wind';
// @ts-ignore
import { PhaserNavMeshPlugin } from 'phaser-navmesh';
// @ts-ignore
import AnimatedTiles from 'phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js';
import { PARTY_OFFSET } from '../../utility/party';

export class Game extends Scene {
    overlay: Phaser.GameObjects.Graphics;
    animatedTiles: any[];
    offsetX: number = 0;
    offsetY: number = 0;
    state: Combat = initCombat;
    reputation: Reputation = initReputation;
    player: Player;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] = [];
    party: Party[] = [];
    npcs: NPC[] = [];
    lootDrops: LootDrop[] = [];
    target: Phaser.GameObjects.Sprite;
    playerLight: Phaser.GameObjects.PointLight;
    combat: boolean = false;
    stealth: boolean = false;
    combatTime: number = 0;
    combatTimer: Time.TimerEvent;
    tweenManager: any = {};
    particleManager: ParticleManager;
    map: Tilemaps.Tilemap;
    camera: Cameras.Scene2D.Camera;
    minimap: MiniMap;
    navMesh: any;
    navMeshPlugin: PhaserNavMeshPlugin;
    postFxPipeline: any;
    musicDay: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicNight: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat2: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    fpsText: GameObjects.Text;
    combatManager: CombatManager;
    baseLayer: Phaser.Tilemaps.TilemapLayer;
    climbingLayer: Phaser.Tilemaps.TilemapLayer;
    flowers: Phaser.Tilemaps.TilemapLayer;
    plants: Phaser.Tilemaps.TilemapLayer;
    matterCollision: any;
    glowFilter: any;
    targetTarget: Enemy;
    hud: Hud;
    scrollingTextPool: ObjectPool<ScrollingCombatText>;
    daytime: number = 0.0;
    compositeTextures: any;
    day: boolean = true;

    constructor () {
        super('Game');
    };

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
        this.load.glsl('windShader', './src/game/shaders/Wind.glsl');
    };

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.hud = hud;
        this.gameEvent();
        this.state = this.registry.get("combat");
        this.reputation = this.getReputation();
        const map = this.make.tilemap({ key: 'ascean_test' });
        this.map = map;
        const tileSize = 32;
        const camps = map.addTilesetImage('Camp_Graves', 'Camp_Graves', tileSize, tileSize, 0, 0);
        const decorations = map.addTilesetImage('AncientForestDecorative', 'AncientForestDecorative', tileSize, tileSize, 0, 0);
        const tileSet = map.addTilesetImage('AncientForestMain', 'AncientForestMain', tileSize, tileSize, 1, 2);
        const campfire = map.addTilesetImage('CampFireB', 'CampFireB', tileSize, tileSize, 0, 0);
        const light = map.addTilesetImage('light1A', 'light1A', tileSize, tileSize, 0, 0);
        let layer0 = map.createLayer('Tile Layer 0 - Base', tileSet as Tilemaps.Tileset, 0, 0);
        let layer1 = map.createLayer('Tile Layer 1 - Top', tileSet as Tilemaps.Tileset, 0, 0);
        let layerC = map.createLayer('Tile Layer - Construction', tileSet as Tilemaps.Tileset, 0, 0);
        let layer4 = map.createLayer('Tile Layer 4 - Primes', decorations as Tilemaps.Tileset, 0, 0);
        let layer5 = map.createLayer('Tile Layer 5 - Snags', decorations as Tilemaps.Tileset, 0, 0);
        let layerT = map.createLayer('Tile Layer - Tree Trunks', decorations as Tilemaps.Tileset, 0, 0);
        let layerB = map.createLayer('Tile Layer - Camp Base', camps as Tilemaps.Tileset, 0, 0);
        let layer6 = map.createLayer('Tile Layer 6 - Camps', camps as Tilemaps.Tileset, 0, 0);
        this.baseLayer = layer0 as Phaser.Tilemaps.TilemapLayer;
        this.climbingLayer = layer1 as Phaser.Tilemaps.TilemapLayer;
        const layer2 =  map.createLayer('Tile Layer 2 - Flowers', decorations as Tilemaps.Tileset, 0, 0)//?.setVisible(false);
        const layer3 =  map.createLayer('Tile Layer 3 - Plants', decorations as Tilemaps.Tileset, 0, 0)//?.setVisible(false);
        this.flowers = layer2 as Phaser.Tilemaps.TilemapLayer;
        this.plants = layer3 as Phaser.Tilemaps.TilemapLayer;
        map.createLayer('Tile Layer - Campfire', campfire as Tilemaps.Tileset, 0, 0);
        map.createLayer('Tile Layer - Lights', light as Tilemaps.Tileset, 0, 0);
        [layer0, layer1, layerB, layerC, layerT, layer4, layer5, layer6].forEach((layer, index) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            if (index < 5) return;
            layer?.setDepth(5);
        });
        [layer2, layer3].forEach((layer) => { // Flowers, Plants
            this.matter.world.convertTilemapLayer(layer!);
            layer?.setDepth(3);
        });
        // this.matter.world.createDebugGraphic();
        const objectLayer = map.getObjectLayer('navmesh');
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;

        this.overlay = this.add.graphics();
        this.overlay.fillStyle(0x000000, 1); // Start Full
        this.overlay.fillRect(0, 0, 4096, 4096);
        this.overlay.setDepth(99);

        // var windPipeline = new WindPipeline(this.game);
        // (this.game.renderer as any).pipelines.add('Wind', windPipeline);
        // layer2?.setPipeline('Wind');
        // layer3?.setPipeline('Wind');
        // layer4?.setPipeline('Wind');
        // this.time.addEvent({
        //     delay: 100,
        //     loop: true,
        //     callback: () => {
        //         windPipeline.updateTime(this.time.now / 1000);
        //     },
        //     callbackScope: this
        // });

        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.navMesh.enableDebug(debugGraphics); 
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        (this.sys as any).animatedTiles.init(this.map);
        this.player = new Player({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });
        if (this.hud.prevScene === 'Underground') this.player.setPosition(1410,130);
        if (this.hud.prevScene === 'Tutorial') this.player.setPosition(38,72);
        map?.getObjectLayer('Enemies')?.objects.forEach((enemy: any) => {
            const e = new Enemy({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0', data: undefined });
            this.enemies.push(e);
            e.setPosition(enemy.x, enemy.y)
        });
        map?.getObjectLayer('Npcs')?.objects.forEach((npc: any) => 
            this.npcs.push(new NPC({ scene: this, x: npc.x, y: npc.y, texture: 'player_actions', frame: 'player_idle_0' })));
        let camera = this.cameras.main;
        camera.zoom = this.hud.settings.positions?.camera?.zoom || 0.8;
        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.setRoundPixels(true);
        var postFxPlugin = this.plugins.get('rexHorrifiPipeline');
        this.postFxPipeline = (postFxPlugin as any)?.add(this.cameras.main);
        this.setPostFx(this.hud.settings?.postFx, this.hud.settings?.postFx.enable);
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
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 150, 0.05, 0.05);
        this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.musicDay = this.sound.add('background2', { volume: this?.hud?.settings?.volume / 2, loop: true });
        this.musicNight = this.sound.add('background', { volume: this?.hud?.settings?.volume / 2, loop: true });
        this.musicCombat = this.sound.add('combat', { volume: this?.hud?.settings?.volume, loop: true });
        this.musicCombat2 = this.sound.add('combat2', { volume: this?.hud?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add('stealthing', { volume: this?.hud?.settings?.volume, loop: true });

        const party = this.registry.get("party");
        if (party.length) {
            for (let i = 0; i < party.length; i++) {
                const p = new Party({scene:this,x:200,y:200,texture:'player_actions',frame:'player_idle_0',data:party[i],position:i});
                this.party.push(p);
                if (this.hud.prevScene === 'Underground') p.setPosition(1410, 130);
                if (this.hud.prevScene === 'Tutorial') p.setPosition(38, 72);
                if (this.hud.prevScene === '') p.setPosition(200 + PARTY_OFFSET[i].x, 200 + PARTY_OFFSET[i].y);
            };
        };

        this.postFxEvent();
        this.particleManager = new ParticleManager(this);
        this.combatManager = new CombatManager(this);
        this.minimap = new MiniMap(this);
        this.input.mouse?.disableContextMenu();
        this.glowFilter = this.plugins.get('rexGlowFilterPipeline');

        this.startDayCycle();

        this.scrollingTextPool = new ObjectPool<ScrollingCombatText>(() =>  new ScrollingCombatText(this, this.scrollingTextPool));
        for (let i = 0; i < 200; i++) {
            this.scrollingTextPool.release(new ScrollingCombatText(this, this.scrollingTextPool));
        };
        EventBus.emit('current-scene-ready', this);
    };

    startDayCycle() {
        if (this.hud.settings?.music === true) {
            if (this.musicNight.isPlaying) {
                this.tweens.add({
                    targets: this.musicNight,
                    volume: 0,
                    duration: 4000,
                    onComplete: () => {
                        this.musicNight.stop();
                        this.musicDay.play("", { volume: this.hud.settings.volume });
                    }
                });
            } else {
                this.musicDay.play();
            };
        };
        this.day = true;
        this.sound.play('day', { volume: this?.hud?.settings?.volume * 3 });
        const duration = 80000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0, to: 0.25 },
            duration,
            ease: 'Sine.easeInOut',
            onComplete: () => this.transitionToEvening()
        });
    };

    transitionToEvening() {
        const duration = 40000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0.25, to: 0.5 },
            duration,
            ease: 'Sine.easeInOut',
            onComplete: () => this.transitionToNight()
        });
    };

    transitionToNight() {
        if (this.hud.settings?.music === true) {
            if (this.musicDay.isPlaying) {
                this.tweens.add({
                    targets: this.musicDay,
                    volume: 0,
                    duration: 4000,
                    onComplete: () => {
                        this.musicDay.stop();
                        this.musicNight.play("", { volume: this.hud.settings.volume });
                    }
                });
            } else {
                this.musicNight.play();
            };
        };
        this.day = false;
        this.sound.play('night', { volume: this?.hud?.settings?.volume });
        const duration = 40000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0.5, to: 0.65 },
            duration,
            ease: 'Sine.easeInOut',
            onComplete: () => this.transitionToMorning()
        });
    };

    transitionToMorning() {
        const duration = 80000;
        this.tweens.add({
            targets: this.overlay,
            alpha: { from: 0.65, to: 0 },
            duration,
            ease: 'Sine.easeInOut',
            onComplete: () => this.startDayCycle()
        });
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
        EventBus.off('aggressive-enemy');
        EventBus.off('update-postfx');
        EventBus.off('update-camera-zoom');
        EventBus.off('update-speed');
        EventBus.off('update-enemy-aggression');
        EventBus.off('update-enemy-special');
        EventBus.off('add-to-party');
        EventBus.off('despawn-enemy');
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].cleanUp();
        };
        for (let i = 0; i < this.party.length; i++) {
            this.party[i].cleanUp();
        };
        this.player.cleanUp();
    };

    gameEvent = (): void => {
        EventBus.on('combat', (combat: any) => this.state = combat); 
        EventBus.on('reputation', (reputation: Reputation) => this.reputation = reputation);
        EventBus.on('enemyLootDrop', (drops: any) => {
            if (drops.scene !== 'Game') return;
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
            if (!enemy) return;
            enemy.isAggressive = e.isAggressive;
            if (e.isAggressive === true) {
                enemy.setSpecialCombat(true);
                enemy.attacking = this.player;
                enemy.inCombat = true;
                enemy.originPoint = new Phaser.Math.Vector2(enemy.x, enemy.y).clone();
                enemy.stateMachine.setState(States.CHASE);
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
                default: break;
            };
        });
        EventBus.on('update-enemy-aggression', (aggression: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isAggressive = aggression >= Math.random();

            };
        });
        EventBus.on('update-enemy-special', (special: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isSpecial = special >= Math.random();
            };
        });
        EventBus.on('add-to-party', this.addToParty);
        EventBus.on('remove-from-party', this.removeFromParty);
        EventBus.on('despawn-enemy-to-party', this.despawnEnemyToParty);
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
        this.scene.wake();
        EventBus.emit('current-scene-ready', this);
    };

    switchScene = (current: string) => {
        this.cameras.main.fadeOut().once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
            this.registry.set("combat", this.state);
            this.registry.set("ascean", this.state.player);
            this.player.disengage();
            this.pauseMusic();
            this.scene.sleep(current);
        });
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
                    ease: 'Circ.easeInOut',
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
                } else {
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
            if (this.musicDay.isPlaying) this.musicDay.pause();
            if (this.musicNight.isPlaying) this.musicNight.pause();
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
                if (this.day) {
                    this.musicDay.resume();
                } else {
                    this.musicNight.resume();
                };
            };
            this.stopCombatTimer();    
        };
        this.combat = bool;
        EventBus.emit('combat-engaged', bool);
    };

    stealthEngaged = (bool: boolean) => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (this.hud.settings?.music === false) return;
        if (bool) {
            if (this.musicDay.isPlaying) this.musicDay.pause();
            if (this.musicNight.isPlaying) this.musicNight.pause();
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
                if (this.day) {
                    this.musicDay.resume();
                } else {
                    this.musicNight.resume();
                };
            };
        };
    };

    pauseMusic = (): void => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (this.musicDay.isPlaying) this.musicDay.pause();
        if (this.musicNight.isPlaying) this.musicNight.pause();
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
            } else {
                if (this.day) {
                    if (this.musicDay.isPaused) {
                        this.musicDay.resume();
                    } else {
                        this.musicDay.play();
                    };

                } else {
                    if (this.musicNight.isPaused) {
                        this.musicNight.resume();
                    } else {
                        this.musicNight.play();
                    };
                };
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

    addToParty = (party: Ascean) => {
        const position = this.party.length;
        const ascean = populateEnemy(party);
        const compile = asceanCompiler(ascean) as Compiler;
        const newParty = new Party({scene:this,x:200,y:200,texture:'player_actions',frame:'player_idle_0',data:compile, position});
        this.party.push(newParty);
        newParty.setPosition(this.player.x - 40, this.player.y - 40);
    };
    despawnEnemyToParty = (id: string) => {
        const enemy = this.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) return;
        enemy.specialCombatText = this.showCombatText(`Excellent! I will not disappoint you, ${this.player.ascean.name}.`, 1500, 'bone', false, true, () => enemy.specialCombatText = undefined);
        const party = getEnemy(enemy.ascean.name, enemy.ascean.level);
        this.player.removeEnemy(enemy);
        this.player.disengage();
        this.time.delayedCall(2000, () => {
            enemy.isDeleting = true;
            this.addToParty(party);
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };
    removeFromParty = (remove: Ascean) => {
        const party = this.party.find((e: Party) => e.playerID === remove._id);
        if (!party) return;
        const prevCoords = new Phaser.Math.Vector2(party.x,party.y);
        party.specialCombatText = this.showCombatText(`I understand. I'll be seeing you, ${this.player.ascean.name}.`, 1500, 'bone', false, true, () => party.specialCombatText = undefined);
        // party.specialCombatText.update(this);
        this.player.disengage();
        this.time.delayedCall(1500, () => {
            this.party = this.party.filter((par: Party) => par.playerID !== remove._id);
            party.isDeleting = true;
            party.cleanUp();
            party.destroy();

            const compile = asceanCompiler(remove) as Compiler;
            const enemy = new Enemy({scene:this,x:200,y:200,texture:'player_actions',frame:'player_idle_0',data:compile});
            this.enemies.push(enemy);
            enemy.setPosition(prevCoords.x, prevCoords.y);
        }, undefined, this);
        
    };
    checkEnvironment = (player: Player | Enemy | Party) => {
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

    playerUpdate = (delta: number): void => {
        this.player.update(delta); 
        this.combatManager.combatMachine.process();
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
        this.checkEnvironment(this.player);
        if (!this.hud.settings.desktop) this.hud.rightJoystick.update();
    };

    setCameraOffset = () => {
        const { width, height } = this.cameras.main.worldView;
        if (this.player.flipX === true) {
            this.offsetX = Math.min((width / 12.5), this.offsetX + 3);
        } else {
            this.offsetX = Math.max(this.offsetX - 3, -(width / 12.5));
        };
        if (this.player.velocity?.y as number > 0) {
            this.offsetY = Math.max(this.offsetY - 2, -(height / 9));
        } else if (this.player.velocity?.y as number < 0) {
            this.offsetY = Math.min((height / 9), this.offsetY + 2);
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
        this.playerUpdate(delta);
        for (let i = 0; i < this.party.length; i++) {
            if (this.party[i].isDeleting) return;
            this.party[i].update(delta);
            this.checkEnvironment(this.party[i]);
        };
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].isDeleting) return;
            this.enemies[i].update(delta);
            this.checkEnvironment(this.enemies[i]);
        };
        for (let i = 0; i < this.npcs.length; i++) {
            this.npcs[i].update();
        };
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