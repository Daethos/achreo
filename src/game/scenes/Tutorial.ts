import { Combat, initCombat } from "../../stores/combat";
import { EventBus } from "../EventBus";
import LootDrop from "../matter/LootDrop";
import Equipment from "../../models/equipment";
import { States } from "../phaser/StateMachine";
import Player from "../entities/Player";
import Enemy from "../entities/Enemy";
import { CombatManager } from "../phaser/CombatManager";
import { screenShake } from "../phaser/ScreenShake";
import ParticleManager from "../matter/ParticleManager";
import { Hud, X_OFFSET, X_SPEED_OFFSET, Y_OFFSET, Y_SPEED_OFFSET } from "./Hud";
import ScrollingCombatText from "../phaser/ScrollingCombatText";
import { ObjectPool } from "../phaser/ObjectPool";
import { Compiler } from "../../utility/ascean";
import DM from "../entities/DM";
// @ts-ignore
import { PhaserNavMeshPlugin } from "phaser-navmesh";
import Party from "../entities/PartyComputer";
import { AoEPool } from "../phaser/AoE";
import { ENTITY_FLAGS } from "../phaser/Collision";
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
interface ChunkData {
    key: string;
    x: number;
    y: number;
    map: Phaser.Tilemaps.Tilemap;
    entities: {
        enemies: Enemy[];
    };
    navMesh: any;
    overlay: Phaser.GameObjects.Graphics;
};
export class Tutorial extends Phaser.Scene {
    offsetX: number = 0;
    offsetY: number = 0;
    state: Combat = initCombat;
    player: Player;
    centerX: number = window.innerWidth / 2;
    centerY: number = window.innerHeight / 2;
    enemies: Enemy[] = [];
    party: Party[] = [];
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
    musicBackground: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicCombat2: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    musicStealth: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    combatManager: CombatManager;
    matterCollision: any;
    glowFilter: any;
    targetTarget: Enemy;
    hud: Hud;
    scrollingTextPool: ObjectPool<ScrollingCombatText>;
    aoePool: AoEPool;
    frameCount: number = 0;
    cachedWidthOffset: number = 0;
    cachedHeightOffset: number = 0;
    isTransitioning: boolean = false;
    loadedChunks: Map<string, ChunkData> = new Map();
    playerChunkX: number = 0;
    playerChunkY: number = 0;

    constructor () {
        super("Tutorial");
    };

    preload() {};

    create (hud: Hud) {
        this.cameras.main.fadeIn();
        this.hud = hud;
        this.gameEvent();
        this.state = this.registry.get("combat");
        const map = this.make.tilemap({ key: "tutorial" });
        this.map = map;
        const tileSize = 32;
        const tileSet = map.addTilesetImage("GrasslandMainLev2.0", "GrasslandMainLev2.0", tileSize, tileSize, 1, 2);
        let layer0 = map.createLayer("Tile Layer 0 - Base", tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        let layer1 = map.createLayer("Tile Layer 1 - Top", tileSet as Phaser.Tilemaps.Tileset, 0, 0);
        [layer0, layer1].forEach((layer) => {
            layer?.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer!);
            layer?.forEachTile(tile => {
                if ((tile.physics as any).matterBody) {
                    (tile.physics as any).matterBody.body.collisionFilter = {
                        category: ENTITY_FLAGS.WORLD,
                        mask: 4294967295, // ENTITY_FLAGS.UPPER_BODY, // Collides with legs/full body
                        group: 0, // -1, // Negative group prevents self-collisions
                    };
                };
            });
        });
        const objectLayer = map.getObjectLayer("navmesh");
        const navMesh = this.navMeshPlugin.buildMeshFromTiled("navmesh", objectLayer, tileSize);
        this.navMesh = navMesh;
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.player = new Player({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0" });
        if (this.hud.prevScene === "Game") this.player.setPosition(415,697);
        map?.getObjectLayer("Npcs")?.objects.forEach((npc: any) => 
            this.dms.push(new DM({ scene: this, x: npc.x, y: npc.y, texture: "player_actions", frame: "player_idle_0", npcType: "Tutorial Teacher", id: 12 })));

        map?.getObjectLayer("pillars")?.objects.forEach((pillar: any) => {
            const type = pillar.properties?.[0].value;
            const graphics = new Phaser.Physics.Matter.Image(this.matter.world, pillar.x, pillar.y, "beam");
            const shift = {x: type === "exit" ? 32 : 16, y: 16}
            const sensor = Bodies.circle(pillar.x + shift.x, pillar.y + shift.y, 16, { isSensor: true, label: `${type}PillarSensor` });
            graphics.setExistingBody(sensor);
            graphics.setCollisionCategory(ENTITY_FLAGS.WORLD);
            const body = 
                type === "game" ? `This is an action roleplaying game. As you may have noted, you've created a character and entered this world. \n\n You can speak to and attack any enemy, and trade with local merchants to yield better equipment and improve yourself.` :
                type === "movement" ? `The game starts with mobile in mind; twin joysticks for movement and aiming (ranged and specials). \n\n The left joystick allows you to move your character, and the right is used for certain special abilities and manual targeting if you have it enabled in the settings menu. \n\n However, in desktop, the keyboard and mouse are both modular and can be used for either movement or actions.` :
                type === "combat" ? `The Physical and Special action buttons allow you to perform damage in combat. \n\n Physically, everyone is capable of swinging their weapon and/or shooting projectiles, in addition to forms of evasion with dodge and roll. \n\n With Specials, you are restricted to your current 'mastery', and perform specialized abilities that can heal yourself, directly damage the enemy, or control them via magical effects.` :
                type === "settings" ? `Clicking on your name, your character in-game, or toggling the book menu and clicking on the first 'player' icon will all lead you to the main settings menu. \n\n From here, you can tab and change multiple options for gameplay concerns, including but not limited to: enemy aggression, special capability, and movement speed.` :
                type === "improvement" ? `Defeated enemies drop loot, and chances are that it may be an improvement of your current garb. \n\n Merchants also sell multitudes of armor, shields, and weapons, with some being able to forge greater qualities from lesser ones. \n\n You can compare and contrast the different peculiarities of each item and decide how to augment and enhance your character, even in combat.` :
                type === "exit" ? "If you feel comfortable with what you've learned and have a fair understanding of what this game asks of you, feel free to enter the world and explore!" : "";
            const extra = 
                type === "movement" ? "Movement" :
                type === "combat" ? "Combat" :
                type === "settings" ? "Settings" :
                type === "exit" ? "Enter World" : "";
            this.matterCollision.addOnCollideStart({
                objectA: [sensor],
                callback: (other: any) => {
                    if (other.gameObjectB?.name !== "player") return;
                    EventBus.emit("alert", { header: `${type.charAt(0).toUpperCase() + type.slice(1)} Post`, body, delay: 60000, key: "Close", extra });
                },
                context: this
            });
        });
        
        // for (let i = 0; i < 12; i++) {
        //     const e = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: undefined });
        //     this.enemies.push(e);
        //     e.setPosition(Phaser.Math.Between(200, 800), Phaser.Math.Between(200, 800));
        // };

        let camera = this.cameras.main;
        camera.zoom = this.hud.settings.positions?.camera?.zoom;
        camera.startFollow(this.player, false, 0.1, 0.1);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.setRoundPixels(true);
        this.target = this.add.sprite(0, 0, "target").setDepth(99).setScale(0.15).setVisible(false);
        this.player.inputKeys = {
            up: this?.input?.keyboard?.addKeys("W,UP"),
            down: this?.input?.keyboard?.addKeys("S,DOWN"),
            left: this?.input?.keyboard?.addKeys("A,LEFT"),
            right: this?.input?.keyboard?.addKeys("D,RIGHT"),
            action: this?.input?.keyboard?.addKeys("ONE,TWO,THREE,FOUR,FIVE"),
            strafe: this?.input?.keyboard?.addKeys("E,Q"),
            shift: this?.input?.keyboard?.addKeys("SHIFT"),
            firewater: this?.input?.keyboard?.addKeys("T"),
            tab: this?.input?.keyboard?.addKeys("TAB"),
            escape: this?.input?.keyboard?.addKeys("ESC"),
        }; 
        this.lights.enable();
        this.playerLight = this.add.pointlight(this.player.x, this.player.y, 0xDAA520, 150, 0.05, 0.05);
        this.game.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        this.musicBackground = this.sound.add(Math.random() > 0.5 ? "background" : "background2", { volume: this?.hud?.settings?.volume / 2 || 0.1, loop: true });
        this.musicCombat = this.sound.add("combat", { volume: this?.hud?.settings?.volume, loop: true });
        this.musicCombat2 = this.sound.add("combat2", { volume: this?.hud?.settings?.volume, loop: true });
        this.musicStealth = this.sound.add("stealthing", { volume: this?.hud?.settings?.volume, loop: true });
        if (this.hud.settings?.music === true) this.musicBackground.play();
        this.particleManager = new ParticleManager(this);
        this.combatManager = new CombatManager(this);
        this.input.mouse?.disableContextMenu();
        this.glowFilter = this.plugins.get("rexGlowFilterPipeline");
        this.aoePool = new AoEPool(this, 30);
        this.scrollingTextPool = new ObjectPool<ScrollingCombatText>(() =>  new ScrollingCombatText(this, this.scrollingTextPool));
        for (let i = 0; i < 50; i++) {
            this.scrollingTextPool.release(new ScrollingCombatText(this, this.scrollingTextPool));
        };
        EventBus.emit("add-postfx", this);
        EventBus.emit("current-scene-ready", this);
    };

    showCombatText(text: string, duration: number, context: string, critical: boolean, constant: boolean, onDestroyCallback: () => void): ScrollingCombatText {
        const combatText = this.scrollingTextPool.acquire();
        combatText.reset(text, duration, context, critical, constant, onDestroyCallback);
        return combatText;
    };

    cleanUp = (): void => {
        EventBus.off("combat");
        EventBus.off("enemyLootDrop");
        EventBus.off("aggressive-enemy");
        EventBus.off("update-postfx");
        EventBus.off("music");
        EventBus.off("game-map-load");
        EventBus.off("update-current-fps");
        EventBus.off("update-camera-zoom");
        EventBus.off("update-speed");
        EventBus.off("update-enemy-aggression");
        EventBus.off("update-enemy-special");
        EventBus.off("resetting-game");
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].cleanUp();
        };
        for (let i = 0; i < this.dms.length; i++) {
            this.dms[i].cleanUp();
        };
        this.player.cleanUp();
    };

    gameEvent = (): void => {
        EventBus.on("combat", (combat: any) => this.state = combat); 
        EventBus.on("game-map-load", (data: { camera: any, map: any }) => {this.map = data.map;});
        EventBus.on("enemyLootDrop", (drops: any) => {
            if (drops.scene !== "Tutorial") return;
            drops.drops.forEach((drop: Equipment) => this.lootDrops.push(new LootDrop({ scene: this, enemyID: drops.enemyID, drop })));
        });
        EventBus.on("aggressive-enemy", (e: {id: string, isAggressive: boolean}) => {
            let enemy = this.enemies.find((enemy: any) => enemy.enemyID === e.id);
            if (!enemy) return;
            enemy.isAggressive = e.isAggressive;
            if (e.isAggressive === true) {
                enemy.setSpecialCombat(true);
                enemy.currentTarget = this.player;
                enemy.inCombat = true;
                enemy.originPoint = new Phaser.Math.Vector2(enemy.x, enemy.y).clone();
                enemy.stateMachine.setState(States.CHASE);
            };
        });
        EventBus.on("check-stealth", (stealth: boolean) => {
            this.stealth = stealth;
        });
        EventBus.on("update-camera-zoom", (zoom: number) => {
            let camera = this.cameras.main;
            camera.zoom = zoom;
        });
        EventBus.on("update-speed", (data: { speed: number, type: string }) => {
            switch (data.type) {
                case "playerSpeed":
                    this.player.adjustSpeed(data.speed);
                    break;
                case "enemySpeed":
                    for (let i = 0; i < this.enemies.length; i++) {
                        this.enemies[i].adjustSpeed(data.speed);
                    };
                    break;
                default: break;
            };
        });
        EventBus.on("update-enemy-aggression", (aggression: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isAggressive = aggression >= Math.random();
            };
        });
        EventBus.on("update-enemy-special", (special: number) => {
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].isSpecial = special >= Math.random();
            };
        });
        EventBus.on("create-tutorial-enemy", this.createTutorialEnemy);
        EventBus.on("resetting-game", this.resetting);
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
        this.matter.resume();
        this.scene.wake();
        EventBus.emit("current-scene-ready", this);
    };
    switchScene = (current: string) => {
        this.cameras.main.fadeOut().once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_cam: any, _effect: any) => {
            this.registry.set("combat", this.state);
            this.registry.set("ascean", this.state.player);
            this.player.disengage();
            this.pauseMusic();
            this.matter.pause();
            this.scene.sleep(current);
        });
    };

    resetting = (): void => {
        this.sound.play("TV_Button_Press", { volume: this?.hud?.settings?.volume * 2 });
        this.cameras.main.fadeOut();
        this.pause();
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (_came: any, _effect: any) => {
            EventBus.emit("reset-game");
        });
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
                    ease: "Circ.easeInOut",
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
                } else if (this.enemies[i].health <= 0) {
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
        EventBus.emit("combat-engaged", bool);
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

    drinkFlask = (): boolean => EventBus.emit("drink-firewater");

    createTutorialEnemy = () => {
        EventBus.emit("alert", { header: "Tutorial", body: "The tutorial enemy is being summoned.", key: "Close" });
        this.time.delayedCall(1500, () => {
            let data: Compiler[] = this.registry.get("enemies");
            for (let j = 0; j < data.length; j++) {
                const enemy = new Enemy({ scene: this, x: 200, y: 200, texture: "player_actions", frame: "player_idle_0", data: data[j] });
                this.enemies.push(enemy);
                enemy.setPosition(this.player.x - 50, this.player.y);
                this.time.delayedCall(1500, () => {
                    enemy.checkEnemyCombatEnter();
                    this.player.targetEngagement(enemy.enemyID);
                }, undefined, this);
            };
        }, undefined, this);
    };

    destroyEnemy = (enemy: Enemy) => {
        enemy.isDeleting = true;
        const saying = enemy.isDefeated ? `I'll have my revenge in this world!` : `I'll be seeing you, ${this.state.player?.name}.`;
        enemy.specialCombatText = this.showCombatText(saying, 1500, "bone", false, true, () => enemy.specialCombatText = undefined);
        enemy.stateMachine.setState(States.DEATH);
        if (enemy.isCurrentTarget) {
            this.player.disengage();
        };
        this.time.delayedCall(2000, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };
    killEnemy = (enemy: Enemy) => {
        if (enemy.isCurrentTarget) {
            this.player.disengage();
        };
        this.time.delayedCall(500, () => {
            this.enemies = this.enemies.filter((e: Enemy) => e.enemyID !== enemy.enemyID);
            enemy.cleanUp();
            enemy.destroy();
        }, undefined, this);
    };
    playerUpdate = (delta: number): void => {
        this.player.update(delta); 
        this.playerLight.setPosition(this.player.x, this.player.y);
        this.setCameraOffset();
        this.hud.rightJoystick.update();
    };

    setCameraOffset = () => {
        if (this.frameCount % 4 !== 0) return;
        if (this.frameCount % 60 === 0) {
            const { width, height } = this.cameras.main.worldView;
            this.cachedWidthOffset = width / X_OFFSET;
            this.cachedHeightOffset = height / Y_OFFSET;
        };
        
        const prevOffsetX = this.offsetX;
        const prevOffsetY = this.offsetY;
        
        if (this.player.flipX) {
            this.offsetX = Math.min(this.cachedWidthOffset, this.offsetX + X_SPEED_OFFSET);
        } else {
            this.offsetX = Math.max(this.offsetX - X_SPEED_OFFSET, -this.cachedWidthOffset);
        };
        
        const playerVelY = this.player.velocity?.y || 0;
        if (playerVelY > 0) {
            this.offsetY = Math.max(this.offsetY - Y_SPEED_OFFSET, -this.cachedHeightOffset);
        } else if (playerVelY < 0) {
            this.offsetY = Math.min(this.cachedHeightOffset, this.offsetY + Y_SPEED_OFFSET);
        };
        
        if (prevOffsetX !== this.offsetX || prevOffsetY !== this.offsetY) this.cameras.main.setFollowOffset(this.offsetX, this.offsetY);
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
                EventBus.emit("update-combat-timer", this.combatTime);
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
        EventBus.emit("update-combat-timer", this.combatTime);
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
        this.combatManager.combatMachine.process();
        this.frameCount++;
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