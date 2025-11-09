import { Scene } from "phaser";
import TextTyping from "phaser3-rex-plugins/plugins/texttyping.js";
import { EventBus } from "../EventBus";
import { INTRO_NODES } from "../../utility/scene";
import { dimensions } from "../../utility/dimensions";
const dims = dimensions();
const WRAP = {
    HEIGHT: 0.7,
    WIDTH: 0.85
};

export class Intro extends Scene {
    private background: Phaser.GameObjects.Graphics;
    private introContainer: Phaser.GameObjects.Container;
    private introText: Phaser.GameObjects.Text;
    private introTextBorder: Phaser.GameObjects.Rectangle;
    private nextText: Phaser.GameObjects.Text;    
    private prevText: Phaser.GameObjects.Text;
    // private fullText: Phaser.GameObjects.Text;
    private node: any;

    constructor() {super("Intro");};
    preload() {};
    create() {
        const height = dims.HEIGHT;
        const width = dims.WIDTH;
        const fontSize = width > 1024 ? "32px" : width > 768 ? "24px" : "20px";
        
        this.scene.sleep("Hud");
        // this.scene.sleep("Game");
        this.node = INTRO_NODES[0];
        this.background = new Phaser.GameObjects.Graphics(this, {
            x: 0,
            y: 0,
            fillStyle: { color: 0x000000 },
        });
        this.background.fillRect(0, 0, width, height);
        this.introText = this.add.text(
            0, // width * 0.1
            0, // height * 0.2 
            this.node.text, {
                color: "#fdf6d8",
                fontFamily: "Cinzel Regular",
                fontSize,
                stroke: "black",
                strokeThickness: 2,
                fixedWidth: width * WRAP.WIDTH,
                align: "left",
                wordWrap: {
                    width: width * WRAP.WIDTH,
                    callback: undefined,
                    callbackScope: undefined,
                    useAdvancedWrap: true
                }
            });
        this.introText.setPosition(width * (1 - WRAP.WIDTH) / 2, height * 0.125).setOrigin(0, 0).setScrollFactor(0);

        this.introTextBorder = new Phaser.GameObjects.Rectangle(this,
            1, // this.introText.x * 0.9,
            1, // this.introText.y * 0.9,
            width - 4,
            height - 4,
        );
        this.introTextBorder.setStrokeStyle(3, 0xfdf6d8);
        this.introTextBorder.setOrigin(0);

        this.introContainer = new Phaser.GameObjects.Container(this, 0, 0, [this.introTextBorder, this.introText]);
        // this.introContainer.width = width * WRAP.WIDTH;
        // this.introContainer.height = height * WRAP.HEIGHT;
        this.add.existing(this.introContainer);

        this.node = INTRO_NODES[0];
        var typing = new TextTyping(this.introText, {
            wrap: true,
            speed: 40, // type speed in ms
            typeMode: 0, //0|"left-to-right"|1|"right-to-left"|2|"middle-to-sides"|3|"sides-to-middle"
            setTextCallback: function (text, _isLastChar, _insertIdx) { 
                return text;
            }, // callback before set-text
            
            setTextCallbackScope: undefined,
        });
        typing.start(this.node.text);
        
        // typing.on("complete", () => {
        //     this.nextText.setVisible(true);
        //     this.prevText.setVisible(true);
        // });

        this.nextText = this.add.text(width * 0.9, height * 0.85, "Next", {
            color: "#fdf6d8",
            fontFamily: "Cinzel",
            fontSize: "18px",
            stroke: "black",
            strokeThickness: 2,
            align: "center",
        });
        this.nextText.setOrigin(0);
        this.prevText = this.add.text(width * 0.075, height * 0.85, "Previous", {
            color: "#fdf6d8",
            fontFamily: "Cinzel",
            fontSize: "18px",
            stroke: "black",
            strokeThickness: 2,
            align: "center",
        });
        this.prevText.setOrigin(0); 
        // this.fullText = this.add.text(width * 0.475, height * 0.85, "Reveal", {
        //     color: "#fdf6d8",
        //     fontFamily: "Cinzel",
        //     fontSize: "18px",
        //     stroke: "black",
        //     strokeThickness: 2,
        //     align: "center",
        // });
        // this.fullText.setOrigin(0); 
        if (this.node.prev === undefined) {
            this.prevText.visible = false;
        };
        if (this.node.next === undefined) {
            this.nextText.visible = false;
        };
        this.nextText.setInteractive()
            // .on("pointerdown", () => {
            //     this.nextText.setColor("gold");
            // })
            .on("pointerup", () => {
                this.sound.play("TV_Button_Press", { loop: false });
                if (this.node.key === 5) {
                    EventBus.emit("save-intro");
                    return;
                };
                if (INTRO_NODES[this.node.next as keyof typeof INTRO_NODES]?.prev === undefined) {
                    this.prevText.visible = false;
                } else {
                    this.prevText.visible = true;
                };
                if (INTRO_NODES[this.node.next as keyof typeof INTRO_NODES]?.next === undefined) {
                    this.nextText.setText("Enter");
                } else {
                    this.nextText.visible = true;
                };
                if (this.node.next) {
                    this.node = INTRO_NODES[this.node.next as keyof typeof INTRO_NODES];
                    typing.start(this.node.text);
                };
                // this.nextText.setColor("#fdf6d8");
            })

        this.prevText.setInteractive()
            // .on("pointerdown", () => {
            //     this.prevText.setColor("gold");
            // })
            .on("pointerup", () => {
                this.sound.play("TV_Button_Press", { loop: false }); 
                if (INTRO_NODES[this.node.prev as keyof typeof INTRO_NODES]?.prev === undefined) {
                    this.prevText.visible = false;
                } else {
                    this.prevText.visible = true;
                };
                if (INTRO_NODES[this.node.prev as keyof typeof INTRO_NODES]?.next === undefined) {
                    this.nextText.visible = false;
                } else {
                    this.nextText.setText("Next");
                    this.nextText.visible = true;
                };
                if (this.node.prev !== undefined) {
                    this.node = INTRO_NODES[this.node.prev as keyof typeof INTRO_NODES];
                    typing.start(this.node.text);
                };
                // this.prevText.setColor("#fdf6d8");
            });

        this.introText.setInteractive()
            // .on("pointerdown", () => {
            //     this.introText.setColor("gold");
            // })
            .on("pointerup", () => {
                this.sound.play("TV_Button_Press", { loop: false });
                if (typing.isTyping) {
                    typing.stop(true);
                    // return;
                };
                this.introText.setColor("#fdf6d8");
            });
        EventBus.emit("current-scene-ready", this);
    };
};