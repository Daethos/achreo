import Entity from "./Entity"; 
import StateMachine, { States } from "../phaser/StateMachine";
import { v4 as uuidv4 } from "uuid";
import { EventBus } from "../EventBus";
import { vibrate } from "../phaser/ScreenShake";
import { Compiler } from "../../utility/ascean";
import { ENTITY_FLAGS } from "../phaser/Collision";
import { MESSAGES } from "../../utility/ChatBubbleMessages";
// @ts-ignore
const { Body, Bodies } = Phaser.Physics.Matter.Matter;
const colliderWidth = 16; 
const colliderHeight = 12; 
const paddingWidth = 10; 
const paddingHeight = 10; 
const x = colliderWidth + 2 * paddingWidth;
const y = colliderHeight + 2 * paddingHeight;
export default class DM extends Entity { 
    enemyID: string;
    id: number;
    npcType: string;
    npcTarget: any;
    isDefeated: boolean = true;
    isEnemy: boolean = false;
    isInteracting: boolean = false;
    interactCount: number = 0;
    stateMachine: StateMachine;
    originalPosition: any;
    originPoint: any;
    npcSensor: any;
    currentStage: string = "welcome";
    private completedSections: Set<string> = new Set();

    constructor(data: any) {
        let { scene, npcType, id } = data;
        super({ ...data, name: "npc", ascean: undefined, health: 0 }); 
        this.scene = scene;
        this.id = id;
        this.enemyID = uuidv4();
        this.npcType = npcType;
        this.npcTarget = undefined;
        this.createNPC();
        this.stateMachine = new StateMachine(this, "npc");
        this.stateMachine
        .addState(States.IDLE, {
                onEnter: this.onIdleEnter, 
            }) 
            .addState(States.AWARE, {
                onEnter: this.onAwarenessEnter,
                onUpdate: this.onAwarenessUpdate,
                onExit: this.onAwarenessExit,
            });
        this.stateMachine.setState(States.IDLE);
        this.setScale(0.8);
        this.originalPosition = new Phaser.Math.Vector2(this.x, this.y);
        this.originPoint = {}; 
        let npcCollider = Bodies.rectangle(this.x, this.y + 22, colliderWidth, colliderHeight, { isSensor: false, label: "npcCollider" });
        npcCollider.boundsPadding = { x, y };
        let npcSensor = Bodies.circle(this.x, this.y + 2, 48, { isSensor: true, label: "npcSensor" });
        const compoundBody = Body.create({
            parts: [npcCollider, npcSensor],
            frictionAir: 0.1, 
            restitution: 0.3,
            friction: 0.15,
        });
        this.setExistingBody(compoundBody);                                    
        this.setFixedRotation();
        this.npcSensor = npcSensor;
        this.npcCollision(npcSensor); 
        this.setCollisionCategory(ENTITY_FLAGS.NPC);
        this.setStatic(true);
        this.setTint(0x0000FF);
        this.flipX = true;
        
        this.setupMessages();
        this.setupProgressionListeners();
        this.loadProgressionState();

        this.scene.add.existing(this as any);
        this.setInteractive(new Phaser.Geom.Rectangle(
            48, 0,
            32, this.height
        ), Phaser.Geom.Rectangle.Contains)
            .on("pointerdown", () => {
                if (this.scene.combat === true) return;
                EventBus.emit("combat-round");
                vibrate();
                this.clearTint();
                this.setTint(0x00FF00); 
                this.scene.hud.setupNPC(this);
                this.scene.player.setCurrentTarget(this);
                this.scene.player.animateTarget();
            })
            .on("pointerout", () => {
                this.clearTint();
                this.setTint(0x0000FF);
            });
        scene.time.delayedCall(16, () => {
            this.setVisible(true);
            this.createShadow(true);
        });
    };

    cleanUp() {
        EventBus.off("dm-fetched", this.dmFetched);
        this.removeAllListeners();
        this.removeInteractive();
    };

    createNPC = () => {
        EventBus.once("dm-fetched", this.dmFetched);
        EventBus.emit("fetch-dm", { enemyID: this.enemyID, npcType: this.npcType });
    };

    dmFetched = (e: Compiler) => {
        this.ascean = e.ascean;
        this.health = e.attributes.healthTotal;
        this.combatStats = e;
    };

    npcCollision = (npcSensor: any) => {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [npcSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB.name === "player" && !other.gameObjectB.inCombat && !this.isInteracting) {
                    this.isInteracting = true;
                    this.interactCount++;
                    this.scene.hud.setupNPC(this);
                    this.npcTarget = other.gameObjectB;
                    this.stateMachine.setState(States.AWARE);
                    other.gameObjectB.currentTarget = this;
                    other.gameObjectB.targetID = this.enemyID;
                    const isNewNPC = !other.gameObjectB.targets.some((obj: any) => obj.enemyID === this.enemyID);
                    if (isNewNPC) {
                        other.gameObjectB.targets.push(this);
                    };
                    // this.scene.hud.showDialog(true);
                };
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [npcSensor],
            callback: (other: any) => {
                if (other.gameObjectB && other.gameObjectB.name === "player" && this.isInteracting) {
                    this.isInteracting = false;
                    this.stateMachine.setState(States.IDLE); 
                    other.gameObjectB.targets = other.gameObjectB.targets.filter((obj: any) => obj.enemyID !== this.enemyID);
                    this.scene.hud.clearNPC();
                    other.gameObjectB.checkTargets();
                };
            },
            context: this.scene,
        }); 
    };

    private setupProgressionListeners(): void {
        EventBus.on("section-completed", (section: string) => {
            this.onSectionCompleted(section);
        });

        EventBus.on("reset-progression", () => {
            this.completedSections.clear();
            this.currentStage = "welcome";
            this.saveProgressionState();
        });
    }

    private onSectionCompleted(section: string): void {
        // console.log(`DM ${this.npcType} noted section completed: ${section}`);
        this.completedSections.add(section);
        
        this.checkForStageAdvancement();

        const execute = MESSAGES[this.npcType].stages[section].unlockConditions?.execute;
        // console.log({ execute });
        if (execute) {
            for (let i = 0; i < execute.length; ++i) {
                const e = execute[i];
                // console.log("Execute", { e });
                EventBus.emit(e);
            };
        };

        this.saveProgressionState();
    };

    private checkForStageAdvancement(): void {
        const npcMessages = MESSAGES[this.npcType];
        if (!npcMessages?.stages) return;

        const currentStageData = npcMessages.stages[this.currentStage];
        if (currentStageData?.nextStage) {
            const nextStageData = npcMessages.stages[currentStageData.nextStage];
            if (nextStageData && this.meetsConditions(nextStageData.unlockConditions)) {
                this.currentStage = currentStageData.nextStage;
                // console.log(`Advanced to stage: ${this.currentStage}`);
            };
        };

        this.checkForStageJumps();
    };

    private checkForStageJumps(): void {
        const npcMessages = MESSAGES[this.npcType];
        if (!npcMessages?.stages) return;

        // Check all stages to find the highest one we qualify for
        let bestStage = this.currentStage;
        let bestStagePriority = -1;

        for (const [stageKey, stageData] of Object.entries(npcMessages.stages)) {
            if (this.meetsConditions(stageData.unlockConditions)) {
                // Simple priority: later stages are better
                const stagePriority = Object.keys(npcMessages.stages).indexOf(stageKey);
                if (stagePriority > bestStagePriority) {
                    bestStage = stageKey;
                    bestStagePriority = stagePriority;
                };
            };
        };

        if (bestStage !== this.currentStage) {
            this.currentStage = bestStage;
            // console.log(`Jumped to stage: ${this.currentStage}`);
        };
    };

    private meetsConditions(conditions: any): boolean {
        if (!conditions || Object.keys(conditions).length === 0) return true;
        if (conditions.playerCompleted) {
            return conditions.playerCompleted.every((section: string) => 
                this.completedSections.has(section)
            );
        };
        
        return true;
    };

    private saveProgressionState(): void {
        const saveData = {
            currentStage: this.currentStage,
            completedSections: Array.from(this.completedSections),
            npcType: this.npcType,
            timestamp: Date.now()
        };
        
        this.scene.registry.set(`npc_${this.particleID}_progression`, saveData);
    };

    private loadProgressionState(): void {
        const saved = this.scene.registry.get(`npc_${this.particleID}_progression`);
        
        if (saved) {
            this.currentStage = saved.currentStage || "welcome";
            this.completedSections = new Set(saved.completedSections || []);
            // console.log(`Loaded progression for ${this.npcType}: ${this.currentStage}`);
        };
    };

    // private speakRandomAmbient(priority: number = 0): boolean {
    //     const npcMessages = MESSAGES[this.npcType];
    //     if (!npcMessages?.ambient) return false;
        
    //     // Get all ambient categories
    //     const ambientCategories = Object.keys(npcMessages.ambient);
    //     if (ambientCategories.length === 0) return false;
        
    //     // Pick a random category
    //     const randomCategory = ambientCategories[Math.floor(Math.random() * ambientCategories.length)];
    //     const ambientMessages = npcMessages.ambient[randomCategory];
        
    //     if (ambientMessages && ambientMessages.length > 0) {
    //         // Use the ambient category as the message key
    //         return this.speak(`ambient_${randomCategory}`, priority, true);
    //     };
    //     return false;
    // };

    private setupMessages = () => {
        this.scene.chatManager.registerNPC(this.particleID);
        const npcMessages = MESSAGES[this.npcType];
        
        if (npcMessages) {
            // Register stage messages
            if (npcMessages.stages) {
                for (let stageKey in npcMessages.stages) {
                    const stage = npcMessages.stages[stageKey];
                    // console.log(`Registering ${stage.messages.length} messages for stage: ${stageKey}`);
                    this.scene.chatManager.registerMessages(this.particleID, stageKey, stage.messages, stage?.specials || []);
                };
            };
            
            // Register ambient messages by category
            if (npcMessages.ambient) {
                for (let ambientKey in npcMessages.ambient) {
                    const ambientMessages = npcMessages.ambient[ambientKey];
                    // console.log(`Registering ${ambientMessages.length} ambient messages for category: ${ambientKey}`);
                    this.scene.chatManager.registerMessages(this.particleID, `ambient_${ambientKey}`, ambientMessages);
                };
            };
        };
    };

    speak(messageKey: string, priority: number = 1, random: boolean = true): boolean {
        if (!this.scene.chatManager) {
            this.scene.hud.logger.log("Warning: ChatManager Not Available");
            return false;
        };

        return this.scene.chatManager.speak(this.particleID, messageKey, priority, random);
    };

    // NEW: Speak the current progression stage
    speakCurrentStage(priority: number = 2): boolean {
        return this.speak(this.currentStage, priority, false); // Always serial for progression
    };

    speakRandom(priority: number = 0): boolean {
        if (!this.scene.chatManager) return false;
        return this.scene.chatManager.speakRandom(this.particleID, priority);
    };

    onIdleEnter = () => {
        this.anims.play("player_idle", true);
        if (this.shadow) {
            this.shadow.setPosition(x, y + 40);
            this.shadow.setFlipX(this.flipX);
        };
    };
    
    onAwarenessEnter = () => {
        this.scene.time.delayedCall(80, () => {
            this.scene.hud.showDialog(true);
        });
        // this.checkForStageAdvancement();
        this.speak(this.currentStage, 2, false);
    };
    onAwarenessUpdate = (_dt: number) => {
        if (this.npcTarget) {
            const direction = this.npcTarget.position.subtract(this.position);
            this.setFlipX(direction.x < 0);
        };
    };
    onAwarenessExit = () => {
        this.scene.hud.showDialog(false);
        this.scene.chatManager.stopSpeaking(this.particleID);
        if (this.shadow) {
            this.shadow.setPosition(x, y + 40);
            this.shadow.setFlipX(this.flipX);
        };
    };

    update = (delta: number) => this.stateMachine.update(delta || 16);
};