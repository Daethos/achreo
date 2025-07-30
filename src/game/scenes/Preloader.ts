import { Scene } from "phaser";
import { sanitize } from "../../stores/phaser";
import NewText from "../phaser/NewText" 
import Entity from "../entities/Entity";
// @ts-ignore
import ParticleManager from "../matter/ParticleManager";
import { EventBus } from "../EventBus";
import { audio, image } from "../../utility/scene";
const MASTERIES = ["#fdf6d8", "red", "green", "blue", "purple", "gold"];
// tile-extruder --tileWidth 32 --tileHeight 32 --input ./AncientForestMainLev.png --output ./AncientForestMainLev-extruded.png
export class Preloader extends Scene {
    assets: any;
    bg: Phaser.GameObjects.Graphics;
    centerX: number;
    centerY: number;
    border: Phaser.GameObjects.Graphics;
    borderBorder: Phaser.GameObjects.Graphics;
    progress: Phaser.GameObjects.Graphics;
    txt_file: NewText;
    txt_progress: NewText;
    title: NewText;
    width: number = window.innerWidth;
    height: number = window.innerHeight;
    constructor() {
        super("Preloader");
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
        this.height = window.innerWidth > 1200 ? 80 : 40;
        this.width = this.centerX * 1.5;
    };
    init() {};
    preload() {
        ParticleManager.preload(this);
        Entity.preload(this);
        this.load.tilemapTiledJSON("ascean_test", "../assets/gui/ascean_test.json");
        this.load.tilemapTiledJSON("tutorial", "../assets/gui/tutorial.json");
        this.load.tilemapTiledJSON("tent", "../assets/gui/tent.json");
        this.load.tilemapTiledJSON("underground", "../assets/gui/underground.json");
        this.load.tilemapTiledJSON("arena", "../assets/gui/arena.json");
        this.load.tilemapTiledJSON("gauntlet", "../assets/gui/gauntlet.json");
        this.load.atlas("clouds", "../assets/images/clouds.png", "../assets/images/clouds_atlas.json");
        this.load.plugin("rexvirtualjoystickplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js", true); 
        this.load.plugin("rexglowfilterpipelineplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js", true);
        this.load.plugin("rextexttypingplugin", "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexttypingplugin.min.js", true);
        this.load.scenePlugin({ key: "rexuiplugin", url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js", sceneKey: "rexUI" });
        for (let i = 0; i < audio.length; i++) {
            this.load.audio(audio[i].key, audio[i].value);
        };
        this.assets = sanitize();
        this.assets.forEach((asset: { sprite: string; imgUrl: string; }) => {
            this.load.image(asset.sprite, asset.imgUrl);

        });
        for (let i = 0; i < image.length; i++) {
            this.load.image(image[i].key, image[i].value);
        };
        this.createLoadingBar();
    };
    create() {
        this.introEvent();
        this.time.addEvent({
            delay: 500,
            callback: () => { 
                this.scene.start("MainMenu");
                this.progress.destroy();
                this.border.destroy();
                this.title.destroy();
                this.txt_progress.destroy();
                this.txt_file.destroy();
            },
            callbackScope: this
        }); 
    }; 
    createLoadingBar() {
        const shadow = MASTERIES[Math.floor(Math.random() * MASTERIES.length)];
        this.title = new NewText(this, this.centerX, this.centerY / 1.9, "Loading Game", window.innerWidth > 1200 ? "title" : "subtitle", 0.5, shadow);
        this.txt_progress = new NewText(this, this.centerX, this.centerY / 0.925, "Loading...", window.innerWidth > 1200 ? "subtitle" : "preload", { x: 0.5, y: 1 }, shadow);
        this.txt_file = new NewText( this, this.centerX, this.centerY / 0.6, "", window.innerWidth > 1200 ? "preload" : "play", { x: 0.5, y: 1 }, shadow);
        let x = this.centerX - (this.width / 2);
        let y = this.centerY / 0.85;
        this.progress = this.add.graphics({ x: x, y: y });
        this.border = this.add.graphics({ x: x, y: y });
        this.borderBorder = this.add.graphics({ x: x, y: y });
        this.load.on("progress", this.onProgress, this);
        this.load.on("fileprogress", this.onFileProgress, this);
    };
    onProgress(val: number) {
        this.progress.clear();
        this.progress.fillStyle(0xFDF6D8, 1);
        this.progress.fillRect(0, 0, this.width * val, this.height);
        this.border.clear();
        this.border.lineStyle(4, 0x000000, 1);
        this.border.strokeRect(0, 0, this.width * val, this.height + 2);
        this.borderBorder.clear();
        this.borderBorder.lineStyle(4, 0xFDF6D8, 1);
        this.borderBorder.strokeRect(0, 0, this.width, this.height + 2);
        this.txt_progress.setText(Math.round(val * 100) + "%");
    };
    onFileProgress(file: any) {
        this.txt_file.setText(`Loading: ${file.key}`);
    }; 
    introEvent = ():void => {
        EventBus.on("intro", () => {
            this.scene.start("Intro");
        });
    };
};