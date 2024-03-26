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
    volumeListener: () => void;

    constructor () {
        super('Game');
    };

    create () {
        EventBus.emit('current-scene-ready', this);
        EventBus.on('ascean', (ascean: Ascean) => {
            console.log('ascean', ascean);
            this.ascean = ascean;
        });
        this.getAscean();
        EventBus.on('combat', (combat: any) => {
            console.log('state', combat);
            this.state = combat;
        });
        this.getCombat();
        EventBus.on('game', (game: GameState) => {
            console.log('game', game);
            this.gameState = game;
        });
        this.getGame();
        EventBus.on('settings', (settings: Settings) => {
            console.log('settings', settings);
            this.settings = settings;
        });
        // this.setup();

        // ================== Add Multiple Inputs ================== \\
        this.input.addPointer(3);


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
        const debugGraphics = this.add.graphics().setAlpha(0.75);
        this.navMesh.enableDebug(debugGraphics); 
        this.matter.world.setBounds(0, 0, 4096, 4096); // Top Down

        this.player = new Player({ scene: this, x: 200, y: 200, texture: 'player_actions', frame: 'player_idle_0' });
        map?.getObjectLayer('Enemies')?.objects.forEach((enemy: any) => 
            this.enemies.push(new Enemy({ scene: this, x: enemy.x, y: enemy.y, texture: 'player_actions', frame: 'player_idle_0' })));
        map?.getObjectLayer('Npcs')?.objects.forEach((npc: any) => 
            this.npcs.push(new NPC({ scene: this, x: npc.x, y: npc.y, texture: 'player_actions', frame: 'player_idle_0' })));


        // ====================== Combat Machine ====================== \\

        this.combatMachine = new CombatMachine(this);
        this.particleManager = new ParticleManager(this);

        // ================= Action Buttons ================= \\

        this.target = this.add.sprite(0, 0, "target").setScale(0.15).setVisible(false);
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

        // ====================== Camera ====================== \\
            
        let camera = this.cameras.main;
        camera.zoom = 0.8;
        camera.startFollow(this.player);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, 4096, 4096);
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.35); // Black with 50% opacity
        darkOverlay.fillRect(0, 0, 4096, 4096);

        // =========================== Lighting =========================== \\

        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 200, 0.0675, 0.0675); // 0xFFD700 || 0xFDF6D8 || 0xDAA520
        
        // =========================== Music =========================== \\

        this.music = this.sound.add('background', { volume: this?.settings?.volume ?? 0 / 2, loop: true });
        this.music.play();
        // this.volumeListener = () => EventBus.on('update-volume', (e) => this.music.setVolume(e));
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

        this.equipListener();
        this.unequipListener();
        this.purchaseListener();
        this.weaponListener();
        this.actionButtonListener();

        // =========================== FPS =========================== \\

        this.fpsText = this.add.text(window.innerWidth / 2 - 32, window.innerHeight + 20, 'FPS: ', { font: '16px Cinzel', color: '#fdf6d8' });
        this.fpsText.setScrollFactor(0);

        this.equipListener();
        this.unequipListener();
        this.purchaseListener();
        this.weaponListener();
        this.actionButtonListener();

        // =========================== FULLSCREEN =========================== \\
        // this.scale.fullscreenTarget = document.getElementById('game-container');
        // this.scale.startFullscreen();
    };

    equipListener = () => EventBus.on('equip-sound', () => {
        this.equip.play();
    });
    unequipListener = () => EventBus.on('unequip-sound', () => {
        this.unequip.play();
    });
    purchaseListener = () => EventBus.on('purchase-sound', () => {
        this.purchase.play();
    });
    weaponListener = () => EventBus.on('weapon-order-sound', () => {
        this.weaponOrder.play();
    });
    actionButtonListener = () => EventBus.on('action-button-sound', () => {
        this.actionButton.play();
    });

    changeScene () {
        this.scene.start('GameOver');
    };

    getAscean (): void {
        EventBus.emit('request-ascean');
    };

    getCombat (): void {
        EventBus.emit('request-combat');
    };

    getGame (): void {
        EventBus.emit('request-game');
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
    }

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
        const worldX = this.player.rightJoystick.pointer.x;
        const worldY = this.player.rightJoystick.pointer.y;
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
                // onUpdate: (_tween, target, key, current) => {
                //     if (key !== 'z') return;
                //     target.y += current;
                // }, 
            },
        });
        this.time.addEvent({
            delay: duration,
            callback: () => { 
                this.enemies.forEach((enemy: any) => {
                    if (Phaser.Geom.Circle.ContainsPoint(sensorBounds, new Phaser.Geom.Point(enemy.x, enemy.y))) {
                        enemy.isRooted = true;
                    };
                });
            },
            callbackScope: this
        });
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.target.setVisible(false);
                rootTween.destroy();
            },
            callbackScope: this
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
    clearNAEnemy = () => {
        EventBus.emit('clear-enemy');
    };
    clearNPC = () => EventBus.emit('clear-npc'); 
    combatEngaged = (bool: boolean) => {
        if (bool) { 
            this.combat = true; 
            this.actionBar.setVisible(true);
        } else { 
            this.combat = false; 
            this.actionBar.setVisible(false);
        };
        console.log(`Combat engaged: ${bool}`);
        // this.dispatch(getCombatFetch(bool));
    };
    drinkFlask = () => {
        EventBus.emit('drink-firewater');
        // this.dispatch(getDrinkFirewaterFetch(this.state.player._id));
    };
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

        caerenic = () => {
            EventBus.emit('update-caerenic');
        } ;
        stalwart = () => {
            EventBus.emit('update-stalwart');
        } ;
        useStamina = (value: number) => EventBus.emit('update-stamina', value);
    
        createTextBorder(text: NewText) {
            const border = this.add.graphics();
            border.lineStyle(4, 0x2A0134, 1);
            border.strokeRect(
                text.x - text.width * text.originX - 2.5,
                text.y - text.height * text.originY - 2.5, 
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