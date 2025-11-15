import { EventBus } from "../EventBus";
import { Play } from "../main";
import { PhysicsNet } from "./PhysicsNet";

export class NetSystem {
    private activeNet: PhysicsNet | undefined = undefined;
    private scene: Play;

    constructor(scene: Play) {
        this.scene = scene;
        this.netSensor();
    };

    // private logNetState(context: string): void {
    //     console.log(`Net State [${context}]:`, {
    //         activeNet: this.activeNet,
    //         isDeployed: this.activeNet?.isDeployed,
    //         bodiesCount: this.activeNet?.bodies.length,
    //         timestamp: Date.now()
    //     });
    // };

    netSensor() {
        EventBus.on("throw-net", this.throwNetAuto);
        EventBus.on("retrieve-net", this.retrieveNet);
    };

    throwNetAuto = () => {
        EventBus.emit("roll-sound");

        const player = this.scene.player;
        const pos = new Phaser.Math.Vector2(player.position);

        const enemy = this.scene.combatManager.combatant(this.scene.state.enemyID);
        const target = new Phaser.Math.Vector2(enemy.x, enemy.y + 24);

        this.throwNet(pos, target);
    };

    throwNet = (throwPosition: Phaser.Math.Vector2, targetPosition: Phaser.Math.Vector2): void => {
        if (this.activeNet) {
            console.log("Retrieving Net");
            this.retrieveNet();
        };

        this.activeNet = new PhysicsNet(this.scene).create(throwPosition);
        
        if (this.activeNet.bodies.length === 0) {
            console.error('No net bodies were created!');
            return;
        };

        const forceDirection = new Phaser.Math.Vector2(
            targetPosition.x - throwPosition.x,
            targetPosition.y - throwPosition.y
        );
        forceDirection.normalize();

        const throwStrength = 0.0075;

        this.activeNet.bodies.forEach((body, _index) => {
            this.scene.matter.body.applyForce(body, body.position, {
                x: forceDirection.x * throwStrength,
                y: forceDirection.y * throwStrength
            });
        });
      
        EventBus.emit("net-thrown", true);
    };

    retrieveNet = (): void => {
        if (this.activeNet) {
            this.activeNet.destroy();
            this.activeNet = undefined;
            EventBus.emit("net-thrown", false);    
        };
    };

    hasActiveNet(): boolean {
        return this.activeNet !== undefined && this.activeNet.isDeployed;
    };
};