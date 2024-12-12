import { Combat, initCombat } from '../../stores/combat';
import { EventBus } from '../EventBus';
import LootDrop from '../matter/LootDrop';
import Equipment from '../../models/equipment';
import { States } from '../phaser/StateMachine';
import { EnemySheet } from '../../utility/enemy';
import { useResizeListener } from '../../utility/dimensions';
import { Reputation, initReputation } from '../../utility/player';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import { CombatManager } from '../phaser/CombatManager';
import { screenShake } from '../phaser/ScreenShake';
import ParticleManager from '../matter/ParticleManager';
import { Hud } from './Hud';
import ScrollingCombatText from '../phaser/ScrollingCombatText';
import { ObjectPool } from '../phaser/ObjectPool';
import { Compiler } from '../../utility/ascean';
import DM from '../entities/DM';
// @ts-ignore
import { PhaserNavMeshPlugin } from 'phaser-navmesh';
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
const dimensions = useResizeListener();
export class Tutorial extends Phaser.Scene {
    offsetX: number = 0;
    offsetY: number = 0;
    state: Combat = initCombat;
    reputation: Reputation = initReputation;
    player: Player;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] = [];
    dms: DM[] = [];
    lootDrops: LootDrop[] = [];
    target: Phaser.GameObjects.Sprite;
    playerLight: Phaser.GameObjects.PointLight;
    combat: boolean = false;
    stealth: boolean = false;
    combatTime: number = 0;
    combatTimer: Phaser.Time.TimerEvent;
    tweenManager: any = {};
    particleManager: ParticleManager;
    map: Phaser.Tilemaps.Tilemap;
    camera: Phaser.Cameras.Scene2D.Camera;
    navMesh: any;
    navMeshPlugin: PhaserNavMeshPlugin;
    postFxPipeline: any;
    musicBackground: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat2: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    fpsText: Phaser.GameObjects.Text;
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

    constructor () {
        super('Tutorial');
    };

    preload() {};

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.hud = hud;
        this.gameEvent();
        this.state = this.registry.get("combat");
        this.reputation = this.getReputation();
        const map = this.make.tilemap({ key: 'tutorial' });
        this.map = map;
        const tileSize = 32;
        const tileSet = map.addTilesetImage('GrasslandMainLev2.0', 'GrasslandMainLev2.0', tileSize, tileSize, 1, 2);
        let layer0 = map.createLayer('Tile Layer 0 - Base', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        let layer1 = map.createLayer('Tile Layer 1 - Top', tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        this.baseLayer = layer0 as Phaser.Tilemaps.TilemapLayer;
        this.climbingLayer = layer1 as Phaser.Tilemaps.TilemapLayer;
        [layer0, layer1].forEach((layer) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
        });
        // this.matter.world.createDebugGraphic(); 
        const objectLayer = map.getObjectLayer('navmesh');
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.navMesh.enableDebug(debugGraphics); 
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.player = new Player({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });
        map?.getObjectLayer('Npcs')?.objects.forEach((npc: any) => 
            this.dms.push(new DM({ scene: this, x: npc.x, y: npc.y, texture: 'player_actions', frame: 'player_idle_0', npcType: "Tutorial Teacher", id: 12 })));

        map?.getObjectLayer('pillars')?.objects.forEach((pillar: any) => {
            const type = pillar.properties?.[0].value;
            const graphics = new Phaser.Physics.Matter.Image(this.matter.world, pillar.x, pillar.y, 'beam');
            const sensor = Bodies.circle(pillar.x, pillar.y, 16, { isSensor: true, label: `${type}PillarSensor` });
            graphics.setExistingBody(sensor);
            const body = 
                type === 'game' ? `This is an action roleplaying game. As you may have noted, you've created a character and entered this world. \n\n You can speak to and attack any enemy, and trade with local merchants to yield better equipment and improve yourself.` :
                type === 'movement' ? `The game starts with mobile in mind; twin joysticks for movement and aiming (ranged and specials). \n\n The left joystick allows you to move your character, and the right is used for certain special abilities and manual targeting if you have it enabled in the settings menu. \n\n However, in desktop, the keyboard and mouse are both modular and can be used for either movement or actions.` :
                type === 'combat' ? `The Physical and Special action buttons allow you to perform damage in combat. \n\n Physically, everyone is capable of swinging their weapon and/or shooting projectiles, in addition to forms of evasion with dodge and roll. \n\n With Specials, you are restricted to your current 'mastery', and perform specialized abilities that can heal yourself, directly damage the enemy, or control them via magical effects.` :
                type === 'settings' ? `Clicking on your name, your character in-game, or toggling the book menu and clicking on the first 'player' icon will all lead you to the main settings menu. \n\n From here, you can tab and change multiple options for gameplay concerns, including but not limited to: enemy aggression, special capability, and movement speed.` :
                type === 'improvement' ? `Defeated enemies drop loot, and chances are that it may be an improvment of your current garb. \n\n Merchants also sell multitudes of armor, shields, and weapons, with some being able to forge greater qualities from lesser ones. \n\n You can compare and contrast the different peculiarities of each item and decide how to augment and enhance your character, even in combat.` :
                type === "exit" ? "If you feel comfortable with what you've learned and have a fair understanding of what this game asks of you, feel free to enter the world and explore!" : "";
            const extra = 
                type === 'movement' ? "Movement" :
                type === 'combat' ? "Combat" :
                type === 'settings' ? "Settings" :
                type === 'exit' ? "Enter World" : "";
            this.matterCollision.addOnCollideStart({
                objectA: [sensor],
                callback: (other: any) => {
                    if (other.gameObjectB?.name !== 'player') return;
                    EventBus.emit('alert', { header: `${type.charAt(0).toUpperCase() + type.slice(1)} Pillar`,
                        body,
                        delay: 10000,
                        key: 'Close',
                        extra
                    });
                },
                context: this
            });
        });

        let camera = this.cameras.main;
        camera.zoom = this.hud.settings.positions?.camera?.zoom;
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
        this.musicBackground = this.sound.add(Math.random() > 0.5 ? 'background' : 'background2', { volume: this?.hud?.settings?.volume / 2 || 0.1, loop: true });
        this.musicCombat = this.sound.add('combat', { volume: this?.hud?.settings?.volume, loop: true });
        this.musicCombat2 = this.sound.add('combat2', { volume: this?.hud?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add('stealthing', { volume: this?.hud?.settings?.volume, loop: true });
        if (this.hud.settings?.music === true) this.musicBackground.play();

        this.postFxEvent();
        this.particleManager = new ParticleManager(this);
        this.combatManager = new CombatManager(this);
        this.input.mouse?.disableContextMenu();
        this.glowFilter = this.plugins.get('rexGlowFilterPipeline');

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
        EventBus.off('aggressive-enemy');
        EventBus.off('update-postfx');
        EventBus.off('music');
        EventBus.off('game-map-load');
        EventBus.off('update-current-fps');
        EventBus.off('update-camera-zoom');
        EventBus.off('update-speed');
        EventBus.off('update-enemy-aggression');
        EventBus.off('update-enemy-special');
        EventBus.off('resetting-game');
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
        for (let i = 0; i < this.dms.length; i++) {
            this.dms[i].cleanUp();
        };
        this.player.cleanUp();
    };

    gameEvent = (): void => {
        EventBus.on('combat', (combat: any) => this.state = combat); 
        EventBus.on('reputation', (reputation: Reputation) => this.reputation = reputation);
        EventBus.on('game-map-load', (data: { camera: any, map: any }) => {this.map = data.map;});
        EventBus.on('enemyLootDrop', (drops: any) => {
            if (drops.scene !== 'Tutorial') return;
            drops.drops.forEach((drop: Equipment) => this.lootDrops.push(new LootDrop({ scene: this, enemyID: drops.enemyID, drop })));
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
        EventBus.on('music', (on: boolean) => {
            if (on === true && !this.scene.isPaused('Game')) {
                this.resumeMusic();
            } else {
                this.pauseMusic();
            };
        });
        EventBus.on('check-stealth', (stealth: boolean) => {
            this.stealth = stealth;
        });
        EventBus.on('update-current-fps', (data: {x: number, y: number}) => {
            const { x, y } = data;
            const newX = dimensions()?.WIDTH * x;
            const newY = dimensions()?.HEIGHT * y;
            this.fpsText.setPosition(newX, newY);
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
        EventBus.on('create-tutorial-enemy', this.createTutorialEnemy);
        EventBus.on('resetting-game', this.resetting);
    };

    sleepScene = () => {
        this.pauseMusic();
        this.scene.sleep('Game');
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
        this.scene.wake();
        EventBus.emit('current-scene-ready', this);
    };
    switchScene = (current: string) => {
        this.cameras.main.fadeOut().once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
            this.registry.set("combat", this.state);
            this.registry.set("settings", this.hud.settings);
            this.registry.set("ascean", this.state.player);
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
    resetting = (): void => {
        this.sound.play('TV_Button_Press', { volume: this?.hud?.settings?.volume * 2 });
        this.cameras.main.fadeOut();
        this.pause();
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_came: any, _effect: any) => {
            EventBus.emit('reset-game');
        });
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
                if (this.player.health <= 0) {
                    this.enemies[i].clearCombatWin();
                } else {
                    this.enemies[i].clearCombat();
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
            if (this.musicBackground.isPlaying) this.musicBackground.pause();
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
                if (Math.random() > 0.5) {
                    this.musicCombat.play();
                } else {
                    this.musicCombat2.play();
                };
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
    checkEnvironment = (player: Player | Enemy) => {
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

    createTutorialEnemy = () => {
        EventBus.emit('alert', { header: "Tutorial", body: "The tutorial enemy is being summoned.", key: "Close" });
        this.time.delayedCall(1500, () => {
            let data: Compiler[] = this.registry.get("enemies");
            for (let j = 0; j < data.length; j++) {
                const enemy = new Enemy({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0', data: data[j] });
                enemy.setPosition(this.player.x - 50, this.player.y);
                this.enemies.push(enemy);
                this.time.delayedCall(1500, () => {
                    enemy.checkEnemyCombatEnter();
                    this.player.targets.push(enemy);
                        this.player.targetEngagement(enemy.enemyID);
                }, undefined, this);
            };
        }, undefined, this);
    };
    destroyEnemy = (enemy: Enemy) => {
        enemy.isDeleting = true;
        const saying = enemy.isDefeated ? `I'll get my revenge in the real world!` : `I'll be seeing you, ${this.state.player?.name}.`;
        enemy.specialCombatText = this.showCombatText(saying, 1500, 'bone', false, true, () => enemy.specialCombatText = undefined);
        enemy.stateMachine.setState(States.DEATH);
        this.time.delayedCall(2000, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };


    playerUpdate = (delta: number): void => {
        this.player.update(delta); 
        this.combatManager.combatMachine.process();
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
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
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update(delta);
            if ((this.enemies[i].isDefeated || this.enemies[i].isTriumphant) && !this.enemies[i].isDeleting) this.destroyEnemy(this.enemies[i]);
        };
        for (let i = 0; i < this.dms.length; i++) {
            this.dms[i].update(delta);
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