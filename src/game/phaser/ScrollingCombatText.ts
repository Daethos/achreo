import Enemy from "../entities/Enemy";
import Player from "../entities/Player";
import { Entity, Play } from "../main";
import { Hud } from "../scenes/Hud";
import { ObjectPool } from "./ObjectPool";

export const BONE = "bone";
export const CAST = "cast";
export const DAMAGE = "damage";
export const EFFECT = "effect";
export const GLANCE = "glancing";
export const HEAL = "heal";
export const HUSH = "hush";
export const TENDRIL = "tendril";
const POSITION = 35, HEALTH_POSITION = 55; // 70

export type CombatText = {
    x: number;
    y: number;
    text: string;
    duration: number;
    context: string;
    critical: boolean;
    constant: boolean;
};

export default class ScrollingCombatText extends Phaser.GameObjects.Container {
    private color: string;
    public duration: number;
    private timerTime: number;
    private constant: boolean;
    private pool: ObjectPool<ScrollingCombatText>;
    public text: Phaser.GameObjects.Text;
    public dialog: boolean;

    constructor(scene: Phaser.Scene, pool: ObjectPool<ScrollingCombatText>, x: number = 0, y: number = 0) {
        super(scene, x, y);
        this.pool = pool;

        this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", {
            color: "#fff",
            fontFamily: "Cinzel-Regular",
            fontSize: "20px",
            stroke: "black",
            strokeThickness: 2,
        });

        this.add(this.text);
        this.setDepth(100);
        scene.add.existing(this);

        this.timerTime = 0;
        this.duration = 0;
        this.constant = false;
    };

    public reset(entity: Entity, text: string, duration: number, context: string, critical: boolean = false, constant: boolean = false): void {
        this.color = this.setColor(context);
        this.text.setText(text).setColor(this.color).setFontSize(critical ? "32px" : "20px");
        this.timerTime = 0;
        this.duration = duration;
        this.constant = constant;
        
        const isNonNumeric = isNaN(Number(text));
        const pos = new Phaser.Math.Vector2(entity.x, entity.y);
        const floatHeight = Phaser.Math.Between(POSITION, HEALTH_POSITION) * 1.25;
        const arcAmplitude = Phaser.Math.Between(10, 30);
        const arcDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // Left or right
        const side = arcDirection * (arcDirection > 0 ? Phaser.Math.Between(8, 24) : Phaser.Math.Between(24, 40));        
        const startX = constant ? pos.x - (this.text.displayWidth / 2) : pos.x + side;
        const startY = pos.y - (entity.healthbar.visible ? HEALTH_POSITION : POSITION);
        const initialScale = this.text.scale;

        const tweenObj = { t: 0 };

        this.setPosition(startX, startY);
        this.text.setActive(true).setVisible(true).setWordWrapWidth((this.scene as Play).cameras.main.width / 1.5, true);

        this.scene.tweens.add({
            delay: 64,
            targets: tweenObj,
            t: 1,
            duration: this.duration,
            ease: critical ? Phaser.Math.Easing.Elastic.Out : Phaser.Math.Easing.Sine.Out,
            onStart: () => {
                this.active = true;
                this.visible = true;
            },
            onUpdate: () => {
                const t = tweenObj.t;
                
                const curveX = constant ? pos.x - (this.text.displayWidth / 2) : startX + arcDirection * Math.sin(t * Math.PI) * arcAmplitude;
                const curveY = constant ? startY : startY - t * floatHeight;
                
                const newAlpha = isNonNumeric && constant
                    ? Phaser.Math.Interpolation.Linear([0.65, 1], t)
                    : critical 
                        ? 0.8 + Math.sin(t * Math.PI * 4) * 0.2
                        : Phaser.Math.Interpolation.Linear([0.9, 1.0, 0.75], t);
                
                const newScale = isNonNumeric && constant
                    ? Phaser.Math.Interpolation.Linear([0.65, 0.75], t) 
                    : critical 
                        ? 1 + Math.sin(t * Math.PI * 4) * 0.1
                        : Phaser.Math.Interpolation.Linear([initialScale, 1.1, 1], t);
                    
                this.setPosition(curveX, curveY);
                this.text.setAlpha(newAlpha).setScale(newScale);
            },
            onComplete: () => this.release(),
            callbackScope: this,
        });
    };

    public write(text: string, color?: string, duration: number = 2000) {
        const context = color 
            ? color : text.includes("Glancing") 
            ? GLANCE : text.includes("Critical") 
            ? DAMAGE : (text.includes("desperation") || text.includes("heals") || text.includes("reconstitutes"))
            ? HEAL : text.includes("Cast") 
            ? EFFECT : text.includes("Prayer") 
            ? TENDRIL : BONE
        this.color = this.setColor(context);
        this.text.setText(text).setColor(this.color).setFontSize("20px").setFontStyle("italic").setWordWrapWidth((this.scene as Hud).gameWidth / 3, true);
        this.timerTime = 0;
        this.duration = duration;
        this.constant = false;
        (this.scene as Hud).combatText(this);
    };

    private setColor = (context: string) => {
        switch (context) {
            case BONE:
                return "#fdf6d8";
            case CAST:
                return "blue";
            case DAMAGE:
                return "red";
            case EFFECT:
                return "gold";
            case GLANCE:
                return "lightblue";
            case HEAL:
                return "green";
            case HUSH:
                return "fuchsia";
            case TENDRIL:
                return "purple";
            default:
                return "red";
        };
    };
    
    public update(player: Player | Enemy) {
        this.timerTime += 1;
        if (this.constant === true) { 
            this.setPosition(player.x - (this.text.width * this.text.scale / 2), player.y - (player.healthbar.visible ? HEALTH_POSITION : POSITION));
         } else { 
            this.setPosition(player.x - (this.text.width * this.text.scale / 2), player.y - POSITION - this.timerTime);
        }; 
    };

    public release(): void {
        this.scene.tweens.add({
            targets: this.text,
            duration: Phaser.Math.Between(500, 750),
            alpha: 0,
            onComplete: () => {
                this.active = false;
                this.visible = false;
                this.setScrollFactor(1);
                this.setPosition(-1000, -1000);
                this.text.setAlpha(1).setScale(0.65);
                this.pool.release(this);
            },
            callbackScope: this
        });
    };
};