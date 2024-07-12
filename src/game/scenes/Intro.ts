import { Scene } from "phaser";
import TextTyping from 'phaser3-rex-plugins/plugins/texttyping.js';
import { EventBus } from "../EventBus";
import { INTRO_NODES } from "../../utility/scene";

export class Intro extends Scene {
    private background: Phaser.GameObjects.Graphics;
    private introText: Phaser.GameObjects.Text;
    private introTextBorder: Phaser.GameObjects.Rectangle;
    private nextText: Phaser.GameObjects.Text;    
    private prevText: Phaser.GameObjects.Text;
    private node: any;

    constructor() {super('Intro');};
    preload() {};
    create() {
        EventBus.emit('sleep-scene', 'Game');
        this.node = INTRO_NODES[0];
        this.background = new Phaser.GameObjects.Graphics(this, {
            x: 0,
            y: 0,
            fillStyle: { color: 0x000000 },
        });
        this.background.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        this.background.setDepth(4);
        this.introText = this.add.text(
            0, // this.game.canvas.width * 0.15 
            0, // this.game.canvas.height * 0.2 
            this.node.text, {
                color: '#fdf6d8',
                fontFamily: 'Cinzel Regular',
                fontSize: '24px',
                stroke: 'black',
                strokeThickness: 2,
                align: 'center',
            });
        this.introText.setPosition(this.game.canvas.width * 0.15, this.game.canvas.height * 0.2);
        this.introText.setWordWrapWidth(this.game.canvas.width * 0.7);
        this.introText.setOrigin(0);

        this.introTextBorder = new Phaser.GameObjects.Rectangle(this,
            0, // this.introText.x - this.introText.width * this.introText.originX
            0, // this.introText.y - this.introText.height * this.introText.originY
            this.introText.width * 1.1,
            this.introText.height * 1.1,
        );
        this.introTextBorder.setStrokeStyle(2, 0xfdf6d8);
        this.introTextBorder.setDepth(8);
        this.introText.setDepth(6);

        this.node = INTRO_NODES[0];
        var typing = new TextTyping(this.introText, {
            wrap: true,
            speed: 30, // type speed in ms
            typeMode: 0, //0|'left-to-right'|1|'right-to-left'|2|'middle-to-sides'|3|'sides-to-middle'
            setTextCallback: function (text, _isLastChar, _insertIdx) { 
                return text;
            }, // callback before set-text
            setTextCallbackScope: undefined,
        });
        typing.start(this.node.text);
        this.nextText = this.add.text(this.game.canvas.width * 0.9, this.game.canvas.height * 0.85, 'Next', {
            color: '#fdf6d8',
            fontFamily: 'Cinzel',
            fontSize: '18px',
            stroke: 'black',
            strokeThickness: 2,
            align: 'center',
        });
        this.nextText.setOrigin(0);
        this.prevText = this.add.text(this.game.canvas.width * 0.075, this.game.canvas.height * 0.85, 'Previous', {
            color: '#fdf6d8',
            fontFamily: 'Cinzel',
            fontSize: '18px',
            stroke: 'black',
            strokeThickness: 2,
            align: 'center',
        });
        this.prevText.setOrigin(0); 
        if (this.node.prev === undefined) {
            this.prevText.visible = false;
        };
        if (this.node.next === undefined) {
            this.nextText.visible = false;
        };
        this.nextText.setInteractive()
            .on('pointerdown', () => {
                this.nextText.setColor('gold');
            })
            .on('pointerout', () => {
                this.sound.play('TV_Button_Press', { loop: false });
                if (this.node.key === 5) {
                    EventBus.emit('save-intro');
                    return;
                };
                if (INTRO_NODES[this.node.next as keyof typeof INTRO_NODES]?.prev === undefined) {
                    this.prevText.visible = false;
                } else {
                    this.prevText.visible = true;
                };
                if (INTRO_NODES[this.node.next as keyof typeof INTRO_NODES]?.next === undefined) {
                    this.nextText.setText('Enter');
                } else {
                    this.nextText.visible = true;
                };
                if (this.node.next) {
                    this.node = INTRO_NODES[this.node.next as keyof typeof INTRO_NODES];
                    typing.start(this.node.text);
                };
                this.nextText.setColor('#fdf6d8');
            })

        this.prevText.setInteractive()
            .on('pointerdown', () => {
                this.prevText.setColor('gold');
            })
            .on('pointerout', () => {
                this.sound.play('TV_Button_Press', { loop: false }); 
                if (INTRO_NODES[this.node.prev as keyof typeof INTRO_NODES]?.prev === undefined) {
                    this.prevText.visible = false;
                } else {
                    this.prevText.visible = true;
                };
                if (INTRO_NODES[this.node.prev as keyof typeof INTRO_NODES]?.next === undefined) {
                    this.nextText.visible = false;
                } else {
                    this.nextText.setText('Next');
                    this.nextText.visible = true;
                };
                if (this.node.prev !== undefined) {
                    console.log(this.node.prev, 'This is not undefined')
                    this.node = INTRO_NODES[this.node.prev as keyof typeof INTRO_NODES];
                    typing.start(this.node.text);
                };
                this.prevText.setColor('#fdf6d8');
            })

        EventBus.emit('current-scene-ready', this);
    };
};