import Enemy from "../entities/Enemy";
import { States } from "./StateMachine";

type state = {
    [key: string]: number
};

type color = { [key:string|number]: string; };

const STATE_COLORS: state = {
    [States.ATTACK]: 0xff0000,
    [States.POSTURE]: 0xff0000,
    [States.ROLL]: 0xff0000,
    [States.THRUST]: 0xff0000,
    [States.PARRY]: 0xff0000,

    [States.CLEAN]: 0xfdf6d8,
    [States.AWARE]: 0xfdf6d8,
    [States.CHASE]: 0xfdf6d8,
    [States.HURT]: 0xfdf6d8,
    [States.LEASH]: 0xfdf6d8,
    [States.IDLE]: 0xfdf6d8,
    [States.PATROL]: 0xfdf6d8,
    [States.IDLE]: 0xfdf6d8,
    
    [States.COMBAT]: 0xffc700,
    [States.EVADE]: 0xffc700,
    [States.CONTEMPLATE]: 0xffc700,
    [States.DEFEATED]: 0xffc700,

    [States.STUNNED]: 0x800080,
    [States.FEARED]: 0x800080,
    [States.CONFUSED]: 0x800080,
    [States.POLYMORPHED]: 0x800080,
    
    [States.ARC]: 0x0000FF,
    [States.BLINK]: 0x0000FF,
    [States.CHIOMISM]: 0x0000FF,
    [States.CONFUSE]: 0x0000FF,
    [States.DESPERATION]: 0x0000FF,
    [States.FEAR]: 0x0000FF,
    [States.FROST]: 0x0000FF,
    [States.PARALYZE]: 0x0000FF,
    [States.HEALING]: 0x0000FF,
    [States.KYRNAICISM]: 0x0000FF,
    [States.LEAP]: 0x0000FF,
    [States.POLYMORPH]: 0x0000FF,
    [States.PURSUIT]: 0x0000FF,
    [States.RUSH]: 0x0000FF,
    [States.SACRIFICE]: 0x0000FF,
    [States.SUTURE]: 0x0000FF,
    [States.DISPEL]: 0x0000FF,
    [States.SHADOW]: 0x0000FF,
    [States.SHIRK]: 0x0000FF,
    [States.TETHER]: 0x0000FF,
    [States.ACHIRE]: 0x0000FF,
    [States.ASTRAVE]: 0x0000FF,
    [States.QUOR]: 0x0000FF,
    [States.KYRISIAN]: 0x0000FF,
    [States.LIKYR]: 0x0000FF,
    [States.MAIERETH]: 0x0000FF,
    [States.ILIRECH]: 0x0000FF,
    [States.RECONSTITUTE]: 0x0000FF,
    [States.WRITHE]: 0x0000FF,
    [States.SLOW]: 0x0000FF,
    [States.SNARE]: 0x0000FF,
    [States.SLOWING]: 0x0000FF,
    [States.DEVOUR]: 0x0000FF,
};

const CONVERTER: color = {
    0xff0000: "#f00",
    0xfdf6d8: "#fdf6d8",
    0xffc700: "#ffc700",
    0x0000ff: "#00f",
    0x800080: "#800080"
};

export class DebugMonitor extends Phaser.GameObjects.Container {
    private target: Enemy;
    private background: Phaser.GameObjects.Graphics;
    private stateText: Phaser.GameObjects.Text;
    private healthText: Phaser.GameObjects.Text;
    private positionText: Phaser.GameObjects.Text;
    private timerText: Phaser.GameObjects.Text;
    private timerBarBg: Phaser.GameObjects.Graphics;
    private timerBarFill: Phaser.GameObjects.Graphics;
    private historyContainer: Phaser.GameObjects.Container;
    private stateHistory: Phaser.GameObjects.Text[] = [];
    private monitorTimer: Phaser.Time.TimerEvent | undefined = undefined;
    private timeInState: number = 0;

    constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene.add.existing(this);

        this.background = this.scene.add.graphics({
            fillStyle: { color: 0x000000, alpha: 0.7 }
        });
        this.background.fillRoundedRect(0, 0, 200, 270, 5);
        this.add(this.background);

        this.stateText = this.scene.add.text(10, 10, "State: IDLE", {
            fontSize: "12px",
            color: "#00ff00",
            backgroundColor: "transparent"
        });
        this.healthText = this.scene.add.text(10, 30, "Health: 100", {
            fontSize: "12px",
            color: "#00ff00",
            backgroundColor: "transparent"
        });
        this.positionText = this.scene.add.text(10, 50, "Pos: (0, 0)", {
            fontSize: "12px",
            color: "#00ff00",
            backgroundColor: "transparent"
        });

        this.timerBarBg = this.scene.add.graphics();
        this.timerBarBg.fillStyle(0x333333, 1);
        this.timerBarBg.fillRoundedRect(10, 75, 175, 16, 2);
        this.timerBarFill = this.scene.add.graphics();
        this.timerText = this.scene.add.text(10, 75, "", {
            fontSize: "12px",
            color: "#000"
        }).setOrigin(0, 0);

        this.add([this.stateText, this.healthText, this.positionText, this.timerBarBg, this.timerBarFill, this.timerText ]); // this.historyContainer

        const maskWorldX = this.x + 25;   // this.x is world X because this container is parented to the scene
        const maskWorldY = this.y + 175;  // offset inside the widget
        const maskShape = scene.add.graphics();
        maskShape.fillStyle(0x333333, 1);
        maskShape.fillRoundedRect(maskWorldX, maskWorldY, 175, 150, 2);

        const mask = maskShape.createGeometryMask();

        this.historyContainer = scene.add.container(maskWorldX, maskWorldY);
        this.historyContainer.setMask(mask);
        scene.add.existing(this.historyContainer);
        
        this.stateHistory = [];

        this.scene.input.on("wheel", (pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
            const px = pointer.worldX, py = pointer.worldY;
            const left = this.x, top = this.y, right = left + 200, bottom = top + 270;
            if (px >= left && px <= right && py >= top && py <= bottom) {
                // move history container local Y (clamped)
                this.historyContainer.y = Phaser.Math.Clamp(
                    this.historyContainer.y - deltaY * 0.25,
                    -Math.max(0, this.stateHistory.length * 14), // lower bound
                    0 // top bound (no positive offset)
                );
            };
        });
    
        this.setPosition(15, 75);
    };

    monitor(target: Enemy) {
        this.target = target;
        this.stateText.setText(`State: ${target.stateMachine.getCurrentState()}`);
        this.healthText.setText(`Health: ${target.health} / ${target.ascean.health.max}`);
        this.positionText.setText(`Position: ${target.x} / ${target.y}`);

        if (this.monitorTimer) {
            this.monitorTimer.remove(false);
            this.monitorTimer.destroy();
            this.monitorTimer = undefined;
        };

        this.monitorTimer = this.scene.time.addEvent({
            delay: 50,
            callback: () => this.updateMonitor(),
            callbackScope: this,
            loop: true
        });
    };

    recordState(state: string, duration: number, col: number) {
        const color = CONVERTER[col];
        // console.log({color});
        const txt = this.scene.add.text(12, this.stateHistory.length * 12, 
            `${state}: ${(duration / 1000).toFixed(2)}s`, {
            fontSize: "12px",
            color,
            backgroundColor: "transparent"
        });

        this.historyContainer.add(txt);
        this.stateHistory.push(txt);

        // console.log({ state, text: txt.text, history: txt });
    };

    updateMonitor() {
        const currentState = this.target.stateMachine.getCurrentState() as string;
        const timerState = this.stateText.text.split("State: ")[1];
        if (currentState === timerState) {
            this.timeInState += 50;
        } else {
            this.recordState(timerState, this.timeInState, STATE_COLORS[timerState]);
            this.stateText.setText(`State: ${currentState}`);
            this.timeInState = 0;
        };
        this.positionText.setText(`Pos: (${Math.round(this.target.x)}, ${Math.round(this.target.y)})`);
        this.healthText.setText(`Health: ${Math.round(this.target.health)} / ${this.target.ascean.health.max}`);

        const barWidth = Math.min(175, (this.timeInState / 10000) * 175);
        this.timerBarFill.clear();
        this.timerBarFill.fillStyle(STATE_COLORS[currentState], 1);
        this.timerBarFill.fillRoundedRect(10, 75, barWidth, 16, 2);
        this.timerText.setText(`${(this.timeInState / 1000).toFixed(2)}s`);
    };
};