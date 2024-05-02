import { Scene } from "phaser";
import TextTyping from 'phaser3-rex-plugins/plugins/texttyping.js';
import { EventBus } from "../EventBus";

const INTRO_NODES = {
    0: {
        key: 0,
        prev: undefined, // undefined
        next: 1,
        text: "Welcome to the Ascean. This world is a menagerie of beauty and horror. Full of bounty and peaceable where folk gather; its jungle's reach is long and wild. Marred and mutated, this land is rife with the blood of Ancients. Beings of fantastic might and worship, commanding and enlightening humans at their lesiure, some of pointed interest, others with apathy. The Sundering eclipsed such flourishing; a War of the Ancients.",
    },
    1: {
        key: 1,
        prev: 0,
        next: 2,
        text: "Most humans died. Those who lived did so from the brilliance of Laetrois Ath'Shaorah, prophet of Daethos, bringing such peace and warring against the Ancients. Humans were free, from the Ancients, and from their homes; the Sundering's last gift to the world. For a thousand years, strange peoples from strange lands clashed, with few coalescing.",
    },
    2: {
        key: 2,
        prev: 1,
        next: 3,
        text: "And yet, the beauty of this world has bloomed once more, and many find themselves traveling, despite whispers of the old and the Ancient being seen again, whether in their mythic forms or of an othernature altogether. Perhaps not all perished in their war. Perhaps its horror has returned.",
    },
    3: {
        key: 3,
        prev: 2,
        next: 4,
        text: "Inside of the last century, warring has ceased into uncomfortable peace. Many great sons and fathers died for it; remembered well. Those reverent still alive, rapt with placidity. For some, the Ascea is satiating, a decennial tournament full of jest and joust, where prestige is now sought, and the va'Esai crowned. To be 'Worthy of the Preservation of Being.'",
    },
    4: {
        key: 4,
        prev: 3,
        next: 5,
        text: "A great, distinguishing burden befall the Ascean who claim the mantle. \n King Mathyus Caderyn II, the Daethic, and Warden of the Eye; \n High Lord Theogeni Spiras, Ghost Hawk of Greyrock, and Fyers Protectorate of the Firelands; \n General Evrio Lorian Peroumes, Proconsul of Licivitas, and current va'Esai. \n Such titles achieved post coronation.",
    },
    5: {
        key: 5,
        prev: 4,
        next: undefined, // undefined
        text: "The Ascea may grant land, prestige, titles--the inert and the material. To become the Ascean, the va'Esai, to be Worthy. That is the offer. Do not listen to whispers otherwise. Do not be led astray. Do not fear the bleating of the fallen and beaten. There is no such c̷u̴r̷s̴e̴.",
    },
};

export class Intro extends Scene {
    private background: Phaser.GameObjects.Graphics;
    private introText: Phaser.GameObjects.Text;
    private introTextBorder: Phaser.GameObjects.Rectangle;
    private nextText: Phaser.GameObjects.Text;    
    private prevText: Phaser.GameObjects.Text;
    private node: any;

    constructor() {
        super('Intro');
    };

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