import Enemy from "../entities/Enemy";
import { EventBus } from "../EventBus";
import ParticleManager from "../matter/ParticleManager";
import { CombatManager } from "../phaser/CombatManager";
import Fov from "../phaser/Fov";
import { ObjectPool } from "../phaser/ObjectPool";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import Tile from "../phaser/Tile";
import { Hud } from "./Hud";
// @ts-ignore
import AnimatedTiles from 'phaser-animated-tiles-phaser3.5/dist/AnimatedTiles.min.js';
import { States } from "../phaser/StateMachine";
import { screenShake } from "../phaser/ScreenShake";
import { Combat } from "../../stores/combat";
import { v4 as uuidv4 } from 'uuid';
import { ARENA_ENEMY, fetchArena } from '../../utility/enemy';
import Player from "../entities/Player";
import { Compiler } from "../../utility/ascean";

export class ArenaCvC extends Phaser.Scene {
    player: Player;
    sceneKey: string = '';
    state: Combat;
    animatedTiles: any[];
    offsetX: number;
    offsetY: number;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] | any[] = [];
    focus: any;
    target: any;
    targetLight: any;
    targetTarget: any;
    combat: boolean = false;
    combatTime: number = 0;
    combatTimer: Phaser.Time.TimerEvent;
    tweenManager: any;
    particleManager: ParticleManager;
    map: Phaser.Tilemaps.Tilemap;
    background: Phaser.GameObjects.Image;
    camera: Phaser.Cameras.Scene2D.Camera;
    navMesh: any;
    navMeshPlugin: any;
    postFxPipeline: any;
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
    // platform: MovingPlatform;
    // platform2: MovingPlatform;
    // platform3: MovingPlatform;
    wager = { silver: 0, gold: 0, multiplier: 0 };
    scrollingTextPool: ObjectPool<ScrollingCombatText>;
    highlight: Phaser.GameObjects.Graphics;
    highlightAnimation: boolean = false;

    constructor (view?: string) {
        const key = view || 'ArenaCvC';
        super(key);
        this.sceneKey = key;
    };

    preload() {
        this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
    };

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.state = this.registry.get("combat");
        this.hud = hud;
        this.gameEvent();
        this.offsetX = 0;
        this.offsetY = 0;
        this.tweenManager = {};
        this.markers = [];
        let camera = this.cameras.main;
        const map = this.make.tilemap({ key: 'arena' });
        this.map = map;
        this.add.rectangle(0, 0, 4096, 4096, 0x000000);
        const tileSize = 32;
        const castleInterior = map.addTilesetImage('Castle Interior', 'Castle Interior', tileSize, tileSize, 0, 0);
        const castleDecorations = map.addTilesetImage('Castle Decoratives', 'Castle Decoratives', tileSize, tileSize, 0, 0);
        let layer1 = map.createLayer('Floors', castleInterior as Phaser.Tilemaps.Tileset, 0, 0);
        let layer2 = map.createLayer('Decorations', castleDecorations as Phaser.Tilemaps.Tileset, 0, 0);
        let layer3 = map.createLayer('Top Layer', castleInterior as Phaser.Tilemaps.Tileset, 0, 0);
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

        this.highlight = this.add.graphics()
            .lineStyle(4, 0xFFc700)
            .setScale(0.2)
            .strokeCircle(0, 0, 12)
            .setDepth(99);
        (this.plugins?.get?.('rexGlowFilterPipeline') as any)?.add(this.highlight, {
            intensity: 0.005,
        });
        this.highlight.setVisible(false);
        this.player = new Player({ scene: this, x: 0, y: 0, texture: 'player_actions', frame: 'player_idle_0' });
        this.player.setActive(false);
        this.player.setVisible(false);
        this.target = this.add.sprite(0, 0, "target").setDepth(99).setScale(0.15).setVisible(false);
        camera.startFollow(this.highlight, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setRoundPixels(true);

        var postFxPlugin = this.plugins.get('rexHorrifiPipeline');
        this.postFxPipeline = (postFxPlugin as any)?.add(this.cameras.main);
        this.setPostFx(this.hud.settings?.postFx, this.hud.settings?.postFx.enable);
        this.particleManager = new ParticleManager(this);

        this.lights.enable();
        // this.targetLight = this.add.pointlight(this.target.x, this.target.y, 0xDAA520, 100, 0.05, 0.05); // 0xFFD700 || 0xFDF6D8 || 0xDAA520
        this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

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
        EventBus.off('game-map-load');
        EventBus.off('update-speed');
        EventBus.off('update-enemy-special');
        EventBus.off('resetting-game');
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
    };

    gameEvent = (): void => {
        EventBus.on('game-map-load', (data: { camera: any, map: any }) => {this.map = data.map;});
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
        if (this.enemies.length === 0) {
            this.createArenaEnemy();
        };
        this.scene.wake();
    };

    sleepScene = () => {
        this.cameras.main.fadeOut(500).once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
            this.scene.sleep(this);
        });
    };

    switchScene = (current: string) => {
        this.cameras.main.fadeOut().once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
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
    
    isStateEnemy = (_id: string): boolean => false;

    clearAggression = () => {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].inComputerCombat === true) {
                if (this.enemies[i].attacking?.health <= 0 || this.enemies[i].isTriumphant) {
                    this.enemies[i].clearArenaWin();
                } else {
                    this.enemies[i].clearArenaLoss();
                };
            };
        };
    };

    switchArena = () => {
        this.wager = { silver: 0, gold: 0, multiplier: 0 };
    };

    clearArena = () => {
        if (this.enemies.length > 0) {
            for (let i = 0; i < this.enemies.length; i++) {
                this.destroyEnemy(this.enemies[i]);
            };
            this.enemies = [];
        };
        this.hud.clearNonAggressiveEnemy();
    };

    combatEngaged = (bool: boolean) => {
        if (this.scene.isSleeping(this.scene.key)) return;
        if (bool === true) {
            screenShake(this);
            this.cameras.main.flash(60, 156, 163, 168, false, undefined, this);
        };
        this.combat = bool;
        EventBus.emit('combat-engaged', bool);
    };

    stealthEngaged = (_bool: boolean) => {};

    resumeMusic = (): void => {};

    drinkFlask = (): boolean => EventBus.emit('drink-firewater');

    createArenaEnemy = () => {
        this.time.delayedCall(1500, () => {
            let data: Compiler[] = this.registry.get(`enemies${this.sceneKey}`);
            if (!data) {
                this.switchArena();
                return;
            };
            for (let j = 0; j < data.length; j++) {
                let marker = this.markers[Math.floor(Math.random() * this.markers.length)];
                const enemy = new Enemy({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0', data: data[j] });
                this.enemies.push(enemy);
                enemy.setPosition(marker.x, marker.y);
                if (j === 0) {
                    // this.cameras.main.startFollow(enemy, false, 0.1, 0.1);
                    this.targetTarget = enemy;
                    this.highlightTarget(enemy);
                };
                if (j > 0) {
                    for (let i = 0; i < this.enemies.length; i++) {
                        if (this.enemies[i].enemyID !== enemy.enemyID) {
                            if (i === j - 1) {
                                enemy.checkComputerEnemyCombatEnter(this.enemies[i]);
                            } else {
                                enemy.enemies.push({id:this.enemies[i].enemyID,threat:0});
                            };
                        };
                    };
                };
            };
        }, undefined, this);
        this.wager = this.registry.get("wager");
    };

    destroyEnemy = (enemy: Enemy) => {
        enemy.isDeleting = true;
        const defeated = ["Something is tearing into me. Please, help!", "Noooooooo! This wasn't supposed to happen.", 
            `Curse you! I'll be back for your head.`, `Well fought.`,
            `Can't believe I lost to you. I'm in utter digust with myself.`, "Why did it have to be you?"
        ];
        const victorious = [`I'll be seeing you.`, "Perhaps try fighting someone of a different mastery, may be easier for you.",
            "You're joking?", "Why did you even bother me with this.", `Well fought.`, "Very good! May we meet again."
        ];
        const saying = enemy.isDefeated ? defeated[Math.floor(Math.random() * defeated.length)] : victorious[Math.floor(Math.random() * victorious.length)];
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
                this.hud.clearNonAggressiveEnemy();
                this.registry.set(`enemies${this.sceneKey}`, []);
            };
            this.removeHighlight();
            // this.cameras.main.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };
    setCameraOffset = () => {
        const { width, height } = this.cameras.main.worldView;
        if (this.targetTarget.flipX === true) {
            this.offsetX = Math.min((width / 12.5), this.offsetX + 2);
        } else {
            this.offsetX = Math.max(this.offsetX - 2, -(width / 12.5));
        };
        if (this.targetTarget.velocity?.y as number > 0) {
            this.offsetY = Math.max(this.offsetY - 1.5, -(height / 9));
        } else if (this.targetTarget.velocity?.y as number < 0) {
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
    animateTarget = () => {
        this.tweens.add({
            targets: this.highlight,
            scale: 0.45,
            duration: 250,
            yoyo: true
        });
    };
    highlightTarget = (sprite: Enemy) => {
        if (!sprite || !sprite.body) return;
        if (this.highlightAnimation === false) {
            this.highlightAnimation = true;
            this.animateTarget();
        };
        this.highlight.setPosition(sprite.x, sprite.y);
        this.highlight.setVisible(true);
        this.targetTarget = sprite;
        if (this.target.visible === true) this.target.setPosition(this.targetTarget.x, this.targetTarget.y);
    };
    removeHighlight() {
        this.highlight.setVisible(false);
        this.highlightAnimation = false;
    };
    update(_time: number, delta: number): void {
        this.combatManager.combatMachine.process();
        if (this.targetTarget && this.targetTarget.body) {
            this.highlightTarget(this.targetTarget); 
            this.setCameraOffset();
        } else if (this.highlight.visible) {
            this.removeHighlight();
        };
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update(delta);
            if ((this.enemies[i].isDefeated || this.enemies[i].isTriumphant) && !this.enemies[i].isDeleting) this.destroyEnemy(this.enemies[i]);
        };
        // const camera = this.cameras.main;
        // const bounds = new Phaser.Geom.Rectangle(
        //     this.map.worldToTileX(camera.worldView.x) as number - 2,
        //     this.map.worldToTileY(camera.worldView.y) as number - 2,
        //     this.map.worldToTileX(camera.worldView.width) as number + 6,
        //     this.map.worldToTileX(camera.worldView.height) as number + 6
        // );
        // const target = new Phaser.Math.Vector2({
        //     x: this.map.worldToTileX(this.target.x) as number,
        //     y: this.map.worldToTileY(this.target.y) as number
        // });
        // this.fov!.update(target, bounds, delta);
    };
    pause(): void {
        this.scene.pause();
        this.matter.pause();
    };
    resume(): void {
        this.scene.resume();
        this.matter.resume();
    };
};

export class ArenaView extends ArenaCvC {
    private arenaIndex: number;
    private hudScene: Hud;

    constructor(data: {scene: Hud; arenaIndex: number;}) {
        super(`ArenaView${data.arenaIndex}`);
        this.arenaIndex = data.arenaIndex;
        this.hudScene = data.scene;
    };

    preload() {super.preload();};

    create() {
        // this.registry.set("wager", {silver:0,gold:0,multiplier:0});
        super.create(this.hudScene);
        this.add.text(10, 10, `Arena ${this.arenaIndex}`, { font: 'Arial', fontSize: '16px', color: '#fdf6d8' });
        this.startArena();
    };

    reload() {
        this.startArena();
    };

    setNewTarget = (enemy: Enemy) => {
        this.removeHighlight();
        this.targetTarget = enemy;
        this.highlightTarget(enemy);
    };

    startArena = () => {
        const masteries = ['constitution', 'strength', 'agility', 'achre', 'caeren', 'kyosir'];
        // const rand = Phaser.Math.Between(2,4);
        let level = this.registry.get("combat")?.player?.level;
        if (level % 2 !== 0) level += 1; 
        let enemies: ARENA_ENEMY[] = [];
        for (let i = 0; i < 2; i++) {
            const mastery = masteries[Math.floor(Math.random() * masteries.length)];
            const enemy = { level, mastery, id: uuidv4() };
            enemies.push(enemy);
        };
        const fetch = fetchArena(enemies);
        this.registry.set(`enemies${this.sceneKey}`, fetch);
    };
};