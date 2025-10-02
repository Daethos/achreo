import { EventBus } from "../EventBus";
import { Play } from "../main";
import { Hud } from "../scenes/Hud";

const MOBILE = ["cursor-reset", "minimap", "pause"];

function xModifier(x: number, index: number, offset = 43.75) {
    return x * 1.35 + (index * offset);
};

function leftXModifier(x: number, index: number, offset = 43.75) {
    return x * 0.35 + (index * offset);
};

export default class SmallHud extends Phaser.GameObjects.Container {
    public scene: Hud;
    public bar: Phaser.GameObjects.Image[] = [];
    public desktopBar: Phaser.GameObjects.Image[] = [];
    public stances: Phaser.GameObjects.Image[] = [];
    public x: number;
    public y: number;
    public leftX: number;
    public leftY: number;
    public controls: Phaser.GameObjects.Container
    public closed: boolean = true;
    public switches: {
        loot: boolean;
        dialog: boolean;
        info: boolean;
        settings: boolean;
        logs: boolean;
        caerenic: boolean;
        stalwart: boolean;
        stealth: boolean;
        strafe: boolean;
        minimap: boolean;
        pause: boolean;
        cursor: boolean;
        closed: boolean;
        open: boolean;
    } = {
        loot: false,
        dialog: false,
        info: false,
        settings: false,
        logs: false,
        caerenic: false,
        stalwart: false,
        stealth: false,
        strafe: false,
        minimap: false,
        pause: false,
        cursor: false,
        closed: false,
        open: false,
    };

    constructor(scene: Hud) {
        const x = scene.gameWidth * scene.settings.positions.smallHud.x;
        const y = scene.gameHeight * scene.settings.positions.smallHud.y;
        super(scene, x, y);
        this.scene = scene;
        this.scene.add.existing(this);
        this.x = x;
        this.y = y;
        this.leftX = scene.gameWidth * scene.settings.positions.leftHud.x;
        this.leftY = scene.gameHeight * scene.settings.positions.leftHud.y;
        this.setDepth(6);
        this.createBar();
        this.listener();
        this.draw();
    };

    createBar = () => {
        let open = this.scene.add.image(this.x, this.y, "open");
        let closed = this.scene.add.image(this.x, this.y, "closed");
        let pause = this.scene.add.image(this.x, this.y, "pause");
        // let minimap = this.scene.add.image(this.x, this.y, "minimap");
        let cursor = this.scene.add.image(this.x, this.y, "cursor-reset");
        let stalwart = this.scene.add.image(this.x, this.y, "stalwart");
        let logs = this.scene.add.image(this.x, this.y, "logs");
        let settings = this.scene.add.image(this.x, this.y, "settings");
        let info = this.scene.add.image(this.x, this.y, "info");
        let dialog = this.scene.add.image(this.x, this.y, "dialog");
        let loot = this.scene.add.image(this.x, this.y, "loot");
        let strafe = this.scene.add.image(this.x, this.y, "strafe");
        this.bar.push(loot);
        this.bar.push(dialog);
        this.bar.push(info);
        this.bar.push(settings);
        this.bar.push(logs);
        this.bar.push(cursor);
        // this.bar.push(minimap);
        this.bar.push(pause);
        this.bar.push(closed);
        this.bar.push(open);

        let bar = [];
        for (let i = 0; i < this.bar.length; i++) {
            this.bar[i].setScrollFactor(0, 0);
            this.bar[i].setDepth(6);
            this.bar[i].setOrigin(0, 0);
            this.bar[i].setInteractive();
            this.bar[i].setScale(this.scene.settings.positions.smallHud.scale); // || 0.095
            if (this.scene.settings.desktop) {
                const key = this.bar[i].texture.key;
                if (!MOBILE.includes(key)) {
                    bar.push(this.bar[i])
                } else {
                    this.bar[i].setVisible(false);
                };
            } else {
                bar.push(this.bar[i]);
            };
        };
        bar.forEach((item, index) => {
            item.setScrollFactor(0, 0);
            item.setDepth(6);
            item.setOrigin(0, 0);
            item.setInteractive();
            item.setScale(this.scene.settings.positions.smallHud.scale); // || 0.095
            if (this.closed === true) {
                if (item.texture.key !== "closed") {
                    item.setVisible(false);
                };
            };
            item.x = xModifier(this.x, Math.min(index, bar.length - 2), this.scene.settings.positions.smallHud.offset); // || 43.75
            if (item.texture.key === "dialog") {
                const dialog = this.scene.gameState?.dialogTag as boolean;
                const num = this.closed ? bar.length - 3 : 1;
                item.setVisible(dialog);
                item.x = xModifier(this.x, num, this.scene.settings.positions.smallHud.offset); // || 43.75
            };
            if (item.texture.key === "loot") {
                const loot = this.scene.gameState?.lootTag as boolean;
                const num = this.closed ? this.scene.gameState?.dialogTag as boolean 
                    ? bar.length - 4 
                    : bar.length - 3 
                        : this.scene.gameState?.dialogTag as boolean 
                            ? 0
                            : 1;
                item.setVisible(loot);
                item.x = xModifier(this.x, num, this.scene.settings.positions.smallHud.offset); // || 43.75
            };
            item.on("pointerdown", () => {
                this.pressButton(item);
            });
        });

        this.pressButton(closed);
        
        this.stances.push(strafe);
        if (this.scene.settings.stances.caerenic) {
            let caerenic = this.scene.add.image(this.x, this.y, "caerenic");
            this.stances.push(caerenic);
        };
        this.stances.push(stalwart);
        if (this.scene.settings.stances.stealth) {
            let stealth = this.scene.add.image(this.x, this.y, "stealth");
            this.stances.push(stealth);
        };

        this.stances.forEach((item, index) => {
            item.setScrollFactor(0, 0);
            item.setDepth(6);
            item.setOrigin(0, 0);
            item.setInteractive();
            item.setScale(this.scene.settings.positions.leftHud.scale); // || 0.095
            item.setVisible(true);
            item.x = leftXModifier(this.leftX, Math.min(index, this.stances.length), this.scene.settings.positions.leftHud.offset); // || 43.75
            item.on("pointerdown", () => {
                this.pressStance(item);
            });
        });
    };

    cleanUp = () => {
        EventBus.off("outside-press");
        EventBus.off("update-hud-position");
        EventBus.off("update-left-hud-position");
        EventBus.off("update-small-hud-scale");
        EventBus.off("update-left-hud-scale");
        EventBus.off("update-small-hud-offset");
        EventBus.off("update-left-hud-offset");
        this.bar.forEach((button) => {
            button.removeAllListeners();
            button.removeInteractive();
            button.destroy();
        });
        this.stances.forEach((button) => {
            button.removeAllListeners();
            button.removeInteractive();
            button.destroy();
        });
    };

    draw = () => {
        let bar = [];
        for (let i = 0; i < this.bar.length; i++) {
            if (this.scene.settings.desktop) {
                const key = this.bar[i].texture.key;
                if (!MOBILE.includes(key)) {
                    bar.push(this.bar[i])
                } else {
                    this.bar[i].setVisible(false);
                };
            } else {
                bar.push(this.bar[i]);
            };
        };
        bar.forEach((item, index) => {
            item.x = xModifier(this.x, Math.min(index, bar.length - 2), this.scene.settings.positions.smallHud.offset); // || 43.75
            item.y = this.y;
            if (this.closed === true) {
                if (item.texture.key === "closed") {
                    item.setVisible(true); // false
                } else {
                    item.setVisible(false); // true
                };
            } else {
                if (item.texture.key === "closed") {
                    item.setVisible(false); // true
                } else {
                    item.setVisible(true); // false
                };
            };
            if (item.texture.key === "loot") {
                const loot = this.scene.gameState?.lootTag as boolean;
                const num = this.closed ? this.scene.gameState?.dialogTag as boolean ? bar.length - 4 : bar.length - 3 
                    : this.scene.gameState?.dialogTag as boolean ? 0 : 1;
                item.setVisible(loot);
                item.x = xModifier(this.x, num, this.scene.settings.positions.smallHud.offset); // || 43.75
            };
            if (item.texture.key === "dialog") {
                const dialog = this.scene.gameState?.dialogTag as boolean;
                const num = this.closed ? bar.length - 3 : 1;
                item.setVisible(dialog);
                item.x = xModifier(this.x, num, this.scene.settings.positions.smallHud.offset); // || 43.75
            };
        });

        this.stances.forEach((item, index) => {
            item.x = leftXModifier(this.leftX, Math.min(index, this.stances.length), this.scene.settings.positions.leftHud.offset); // || 43.75
            item.y = this.leftY;
        });
    };

    listener = () => {
        EventBus.on("outside-press", this.outsidePress);
        EventBus.on("outside-stance", this.outsideStance);
        EventBus.on("smallhud-deactivate", this.deactivate);
        EventBus.on("update-hud-position", (data: {x: number, y: number}) => {
            const { x, y } = data;
            this.x = this.scene.gameWidth * x;
            this.y = this.scene.gameHeight * y;
            this.draw();
        });
        EventBus.on("update-left-hud-position", (data: {x: number, y: number}) => {
            const { x, y } = data;
            this.leftX = this.scene.gameWidth * x;
            this.leftY = this.scene.gameHeight * y;
            this.draw();
        });
        EventBus.on("update-small-hud-scale", (scale: number) => {
            this.bar.forEach((item) => {
                item.setScale(scale);
            });
        });
        EventBus.on("update-left-hud-scale", (scale: number) => {
            this.stances.forEach((item) => {
                item.setScale(scale);
            });
        });
        EventBus.on("update-small-hud-offset", (offset: number) => {
            this.bar.forEach((item, index) => {
                item.x = xModifier(this.x, Math.min(index, 8), offset); // || 43.75
            });
        });
        EventBus.on("update-left-hud-offset", (offset: number) => {
            this.stances.forEach((item, index) => {
                item.x = leftXModifier(this.leftX, Math.min(index, 4), offset);
            });
        });
        EventBus.on("add-stance", (stance: string) => {
            let button = this.stances.find((b: any) => b.texture.key === stance.toLowerCase());
            if (button) return;
            const leftHud = this.scene.settings.positions.leftHud;
            switch (stance) {
                case "caerenic":
                    button = this.scene.add.image(this.leftX, this.leftY, "caerenic");
                    break;
                case "stealth":
                    button = this.scene.add.image(this.leftX, this.leftY, "stealth");
                    break;
                default:
                    break;
            };
            if (!button) return;
            button.setScrollFactor(0, 0);
            button.setDepth(6);
            button.setOrigin(0, 0);
            button.setInteractive();
            button.setScale(leftHud.scale); // || 0.095
            button.setVisible(true);
            button.on("pointerdown", () => {
                this.pressStance(button);
            });
            this.stances.push(button);
            this.stances.forEach((item, index) => {
                item.x = leftXModifier(this.leftX, Math.min(index, this.stances.length), leftHud.offset); // || 43.75
            });
        });
    };

    activate = (type: string, active: boolean) => {
        const button = this.getButton(type);
        button?.setVisible(active);
        this.draw();
    };

    deactivate = (type: string) => {
        const button = this.getButton(type);
        if (!button) return;
        this.switches[type as keyof typeof this.switches] = false;
        button.setBlendMode(Phaser.BlendModes.NORMAL);    
        button.setAlpha(1);
        button?.setVisible(false);
        this.draw();
    };

    highlightAnimation() {
        this.bar.forEach((button: Phaser.GameObjects.Image, index: number) => {
            this.scene.time.delayedCall(250 * index, () => {
                button.setBlendMode(Phaser.BlendModes.MULTIPLY);
                button.setScale(this.scene.settings.positions.smallHud.scale * 1.15);
                this.scene.time.delayedCall(250 * index, () => {
                    button.setBlendMode(Phaser.BlendModes.NORMAL);
                    button.setScale(this.scene.settings.positions.smallHud.scale);
                }, undefined, this);
            }, undefined, this);
        });
        this.stances.forEach((button: Phaser.GameObjects.Image, index: number) => {
            this.scene.time.delayedCall(250 * index, () => {
                button.setBlendMode(Phaser.BlendModes.MULTIPLY);
                button.setScale(this.scene.settings.positions.leftHud.scale * 1.15);
                this.scene.time.delayedCall(250 * index, () => {
                    button.setBlendMode(Phaser.BlendModes.NORMAL);
                    button.setScale(this.scene.settings.positions.leftHud.scale);
                }, undefined, this);
            }, undefined, this);
        });
    };

    getButton = (key: string) => {
        const bar = this.bar.find((b: any) => b.texture.key === key.toLowerCase());
        const stance = this.stances.find((b: any) => b.texture.key === key.toLowerCase());
        return bar || stance;
    };

    outsidePress = (type: string) => {
        const button = this.getButton(type);
        this.pressButton(button as Phaser.GameObjects.Image);
    };

    outsideStance = (key: string) => {
        const button = this.getButton(key);
        this.pressStance(button as Phaser.GameObjects.Image);
    };

    pressButton = (item: Phaser.GameObjects.Image) => {
        this.bar.forEach((button) => {
            if (button !== item) return;
            switch (button.texture.key) {
                case "open":
                    this.closed = true;
                    EventBus.emit("closed");
                    EventBus.emit("action-button-sound");
                    this.draw();
                    break;
                case "closed":
                    this.closed = false;
                    EventBus.emit("open");
                    EventBus.emit("action-button-sound");
                    this.draw();
                    break;
                case "pause":
                    EventBus.emit("action-button-sound");
                    EventBus.emit("update-pause", !this.switches.pause); // variable
                    this.switches.pause = !this.switches.pause;
                    break;
                case "minimap":
                    EventBus.emit("action-button-sound");
                    EventBus.emit("minimap");
                    this.switches.minimap = !this.switches.minimap;
                    break;
                case "cursor-reset":
                    EventBus.emit("action-button-sound");
                    EventBus.emit("update-cursor");
                    break; 
                case "logs":
                    EventBus.emit("action-button-sound");
                    EventBus.emit("show-combat"); // variable
                    this.switches.logs = !this.switches.logs;
                    break;
                case "settings":
                    EventBus.emit("action-button-sound");
                    EventBus.emit("useScroll");
                    this.switches.settings = !this.switches.settings;
                    break;
                case "info":
                    EventBus.emit("set-show-player");
                    if (this.switches.info === true) {
                        this.closed = false;
                        this.draw();
                    };
                    this.switches.info = !this.switches.info;
                    break;
                case "dialog":
                    EventBus.emit("action-button-sound");
                    EventBus.emit("show-dialogue");
                    this.switches.dialog = !this.switches.dialog;
                    break;
                case "loot":
                    this.switches.loot = !this.switches.loot;
                    EventBus.emit("action-button-sound");
                    EventBus.emit("blend-game", { showLoot: this.switches.loot });
                    break;
                default:
                    break;
            };
            if (this.switches[button.texture.key as keyof typeof this.switches] === true) {
                button.setBlendMode(Phaser.BlendModes.SCREEN);
                button.setAlpha(0.25);
            } else {
                button.setBlendMode(Phaser.BlendModes.NORMAL);    
                button.setAlpha(1);
            };
        });
        EventBus.emit("update-small-hud");
    };

    pressStance = (stance: Phaser.GameObjects.Image) => {
        this.stances.forEach((button) => {
            if (button === stance) {
                switch (button.texture.key) { 
                    case "stealth":
                        const currentScene = this.scene.scene.get(`${this.scene.currScene}`) as Play;
                        if (currentScene.combat) {
                            if (this.switches.stealth) {
                                this.switches.stealth = false;
                            };
                            break;
                        };
                        this.switches.stealth = !this.switches.stealth;
                        EventBus.emit("update-stealth");
                        if (this.switches.stealth) {
                            EventBus.emit("use-stamina", 10);             
                            if (this.scene.talents.talents.stealth.enhanced) EventBus.emit("disengage");
                        };
                        break;
                    case "stalwart":
                        this.switches.stalwart = !this.switches.stalwart;
                        EventBus.emit("update-stalwart", this.switches.stalwart);
                        if (this.switches.stalwart) EventBus.emit("use-stamina", 10);
                        break;
                    case "caerenic":
                        this.switches.caerenic = !this.switches.caerenic;
                        EventBus.emit("update-caerenic");                
                        if (this.switches.caerenic) EventBus.emit("use-grace", 10);
                        break; 
                    case "strafe":
                        this.switches.strafe = !this.switches.strafe;
                        let player = this.scene.registry.get("player");
                        player.isStrafing = this.switches.strafe;
                        break;
                    default:
                        break;
                };
            };
            if (this.switches[button.texture.key as keyof typeof this.switches] === true) {
                button.setBlendMode(Phaser.BlendModes.SCREEN);
                button.setAlpha(0.25);
            } else {
                button.setBlendMode(Phaser.BlendModes.NORMAL);    
                button.setAlpha(1);
            };
        });
    };
};