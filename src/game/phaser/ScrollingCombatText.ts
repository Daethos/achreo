import Enemy from "../entities/Enemy";
import Player from "../entities/Player";
import { ObjectPool } from "./ObjectPool";

export const BONE = "bone";
export const CAST = "cast";
export const DAMAGE = "damage";
export const EFFECT = "effect";
export const HEAL = "heal";
export const HUSH = "hush";
export const TENDRIL = "tendril";
const POSITION = 50;
const HEALTH_POSITION = 70;

export type CombatText = {
    x: number;
    y: number;
    text: string;
    duration: number;
    context: string;
    critical: boolean;
    constant: boolean;
    onDestroyCallback: () => void;
};

export default class ScrollingCombatText extends Phaser.GameObjects.Container {
    private color: string;
    private text: Phaser.GameObjects.Text;
    private duration: number;
    private timerTime: number;
    private constant: boolean;
    private pool: ObjectPool<ScrollingCombatText>;
    onDestroyCallback: () => void;

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

    public reset(text: string, duration: number, context: string, critical: boolean, constant: boolean, onDestroyCallback: () => void): void {
        this.color = this.setColor(context);
        this.text.setText(text).setColor(this.color).setFontSize(critical ? "32px" : "20px");
        this.timerTime = 0;
        this.duration = duration;
        this.constant = constant;
        this.onDestroyCallback = onDestroyCallback;

        this.scene.tweens.add({
            targets: this.text,
            duration: this.duration,
            ease: critical ? Phaser.Math.Easing.Elastic.Out : Phaser.Math.Easing.Sine.Out,
            alpha: { from: 0.65, to: 1 },
            scale: { from: 0.65, to: 1 },
            onStart: () => {
                this.active = true;
                this.visible = true;
            },
            onComplete: () => {
                this.onDestroyCallback();
                this.release();
            },
            callbackScope: this,
        });
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

    private release(): void {
        this.active = false;
        this.visible = false;
        this.setPosition(-1000);
        this.text.setAlpha(1).setScale(1);
        this.pool.release(this);
    };
};