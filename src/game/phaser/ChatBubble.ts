import Ascean from "../../models/ascean";
import { Play } from "../main";
import { ChatMessage, Speaker } from "./ChatManager";
import TextTyping from "phaser3-rex-plugins/plugins/texttyping.js";
// import { Positioning } from "./Positioning";

export class ChatBubble {
    private scene: Play;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Graphics;
    private text: Phaser.GameObjects.Text;
    private pointer: Phaser.GameObjects.Triangle;
    private continueButton: Phaser.GameObjects.Text;
    private buttonBackground: Phaser.GameObjects.Graphics;
    private onContinueCallback: (() => void) | undefined = undefined;
    private tween: Phaser.Tweens.TweenChain;
    private isSerial: boolean = false;
    private timer: Phaser.Time.TimerEvent | undefined = undefined;
    private typing: TextTyping;
    // private tweaker: Positioning;
    // private ellipsisPaused: boolean = false;
    // private pauseTime: number = 0;
    private readonly MAX_WIDTH = 300;
    private readonly PADDING = 10;
    private readonly POINTER_HEIGHT = 10;
    private readonly FADE_DURATION = 250;

    constructor(scene: Play) {
        this.scene = scene;
        this.container = scene.add.container(0, 0).setDepth(9999).setAlpha(0);
        this.background = scene.add.graphics();
        this.text = scene.add.text(0, 0, "", {
            fontFamily: "Centaur",
            fontSize: "16px",
            color: "#fdf6d8",
            padding: {
                bottom: 1,
                // top: 1
            },
            stroke: "#000000",
            strokeThickness: 1,
            resolution: 2,
            wordWrap: { 
                width: this.MAX_WIDTH - (this.PADDING * 2),
                useAdvancedWrap: true 
            }
        });
        this.pointer = scene.add.triangle(0, 0, 0, 0, 10, 0, 5, this.POINTER_HEIGHT, 0x000000);
        this.continueButton = scene.add.text(0, 0, "", {
            fontFamily: "Centaur",
            fontSize: "14px",
            color: "#ffd700",
            stroke: "#000000",
            strokeThickness: 1,    
        }).setVisible(false);
        this.buttonBackground = scene.add.graphics();
        this.typing = new TextTyping(this.text, {
            wrap: true,
            speed: 30,
            typeMode: 0,
            setTextCallback: (text: string, isLastChar: boolean, insertIdx: number) => {
                return this.handleTextWithPauses(text, isLastChar, insertIdx);
            }
        });
        this.typing.on("complete", () => {
            if (this.isSerial) this.showContinueButton();
        });
        this.continueButton.setInteractive();
        this.continueButton.on("pointerdown", () => this.continueDialogue())
        this.text.setInteractive();
        this.text.on("pointerdown", () => {
            if (this.typing.isTyping) {
                this.typing.stop(true);
            };
        });
        const spacebar = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spacebar?.on("down", () => {
            if (this.typing.isTyping) {
                this.typing.stop(true);
            } else if (this.onContinueCallback) {
                this.continueDialogue();
            };
        }, this);
        this.container.add([this.background, this.text, this.pointer, this.continueButton, this.buttonBackground]);
        // this.hide(); // Start hidden

        // this.tweaker = new Positioning(scene);
        // this.scene.events.on('positionTweakerChange', this.onTweakerChange, this);
    };

    // private onTweakerChange(values: any): void {
    //     this.updateButtonPosition(values);
    // };
    
    // private updateButtonPosition(tweakValues?: any): void {
    //     const buttonHeight = this.continueButton.height;
    //     const buttonWidth = this.continueButton.width;
    //     const textBounds = this.text.getBounds();
        
    //     // Use tweaked values or defaults
    //     const padding = tweakValues?.padding || this.PADDING;
    //     const backgroundX = tweakValues?.backgroundX || (textBounds.width - (buttonWidth + padding));
    //     const backgroundY = tweakValues?.backgroundY || (textBounds.height + padding);
    //     const buttonX = tweakValues?.buttonX || (backgroundX + padding / 2);
    //     const buttonY = tweakValues?.buttonY || (backgroundY + padding / 2);
        
    //     this.buttonBackground.clear();
    //     this.buttonBackground.fillStyle(0x000000, 0.9);
    //     this.buttonBackground.lineStyle(2, 0xfdf6d8, 1);
    //     this.buttonBackground.fillRoundedRect(backgroundX, backgroundY, buttonWidth + padding, buttonHeight + padding, 5);
    //     this.buttonBackground.strokeRoundedRect(backgroundX, backgroundY, buttonWidth + padding, buttonHeight + padding, 5);
        
    //     this.continueButton.setPosition(buttonX, buttonY);
        
    //     console.log('Current positions:', { backgroundX, backgroundY, buttonX, buttonY, padding });
    // };

    private handleTextWithPauses(text: string, _isLastChar: boolean, insertIdx: number): string {
        // Check for ellipsis at the current insert position
        if (text.substring(insertIdx - 3, insertIdx) === '...') {
            this.typing.pause();
            this.scene.time.delayedCall(500, () => this.typing.resume());
            return text.substring(0, insertIdx); // Show the ellipsis but pause
        };
        return text;
    };

    private showContinueButton(): void {
        if (this.tween) {
            this.tween.destroy();
        };
        
        const textBounds = this.text.getBounds();
        
        const buttonHeight = this.continueButton.height;
        const buttonWidth = this.continueButton.width;

        const bubbleWidth = Math.max(textBounds.width + (this.PADDING * 2), 100) - (buttonWidth + this.PADDING * 2);
        const bubbleHeight = textBounds.height - buttonHeight + this.PADDING * 4.5;

        const backgroundWidth = buttonWidth + this.PADDING * 2; // Padding on both sides
        const backgroundHeight = buttonHeight + this.PADDING;

        this.buttonBackground.clear();
        this.buttonBackground.fillStyle(0x000000, 0.9);
        this.buttonBackground.lineStyle(2, 0xfdf6d8, 1);
        this.buttonBackground.fillRoundedRect(bubbleWidth, bubbleHeight, backgroundWidth, backgroundHeight, 5);
        this.buttonBackground.strokeRoundedRect(bubbleWidth, bubbleHeight, backgroundWidth, backgroundHeight, 5);
        this.buttonBackground.setVisible(true);

        this.continueButton.setPosition(
            bubbleWidth + this.PADDING,
            bubbleHeight + this.PADDING / 2
        );

        this.continueButton.setVisible(true);
        this.tween = this.scene.tweens.chain({
            targets: this.continueButton,
            tweens: [
                {
                    alpha: 1,
                    duration: 500,
                    completeDelay: 500,
                },
                {
                    alpha: 0.5,
                    duration: 500
                }
            ],
            repeat: -1,
            callbackScope: this
        });
    };

    private continueDialogue(): void {
        this.buttonBackground.setVisible(false);
        this.continueButton.setVisible(false);

        if (this.onContinueCallback) {
            this.onContinueCallback();
        } else {
            this.hide();
        };
    };

    processText = (text: string, player: Ascean, speaker: Ascean): string => {
        if (!text) return "";

        // First pass: handle {variable} replacements
        let processed = text.replace(/\{(.*?)\}/g, (_, key) => {
            // Check if it's a speaker reference
            if (key.startsWith('speaker.')) {
                const speakerKey = key.substring(8); // Remove "speaker." prefix
                let value = speakerKey.split('.').reduce((obj: any, k: string) => obj && obj[k], speaker);
                return value !== undefined ? (Number(value) ? Math.round(value) : value) : `{${key}}`;
            } else {
                // Default to player
                let value = key.split('.').reduce((obj: any, k: string) => obj && obj[k], player);
                return value !== undefined ? (Number(value) ? Math.round(value) : value) : `{${key}}`;
            }
        });

        // Second pass: handle {function()} calls
        processed = processed.replace(/\{([^}]+)\(\)\}/g, (_, funcPath) => {
            // Check if it's a speaker function call
            if (funcPath.startsWith('speaker.')) {
                const speakerFuncPath = funcPath.substring(8); // Remove "speaker." prefix
                const parts = speakerFuncPath.split('.');
                const funcName = parts.pop()!;
                const objPath = parts.join('.');
                
                const obj = objPath ? 
                    objPath.split('.').reduce((obj: any, k: string) => obj && obj[k], speaker) : 
                    speaker;
                
                if (obj && typeof obj[funcName] === 'function') {
                    try {
                        const result = obj[funcName].call(obj);
                        return result !== undefined ? String(result) : `{${funcPath}()}`;
                    } catch (e) {
                        console.warn(`Error executing function ${funcPath}():`, e);
                        return `{${funcPath}()}`;
                    }
                }
            } else {
                // Default to player function call
                const parts = funcPath.split('.');
                const funcName = parts.pop()!;
                const objPath = parts.join('.');
                
                const obj = objPath ? 
                    objPath.split('.').reduce((obj: any, k: string) => obj && obj[k], player) : 
                    player;
                
                if (obj && typeof obj[funcName] === 'function') {
                    try {
                        const result = obj[funcName].call(obj);
                        return result !== undefined ? String(result) : `{${funcPath}()}`;
                    } catch (e) {
                        console.warn(`Error executing function ${funcPath}():`, e);
                        return `{${funcPath}()}`;
                    }
                }
            }
            
            return `{${funcPath}()}`;
        });

        return processed;
    };

    showAbove(entity: Speaker, chatMessage: ChatMessage, onContinue?: () => void): void {
        // Clear any existing timer
        if (this.timer) {
            this.timer.remove();
            this.timer = undefined;
        };

        this.isSerial = chatMessage.isSerial;
        this.onContinueCallback = onContinue || undefined;
        
        // Update text and layout
        const message = this.processText(chatMessage.message, this.scene.player.ascean, entity.ascean);
        this.text.setText(message);
        const height = this.updateLayout();
        this.text.setText("");

        if (((chatMessage?.sequenceIndex as number) + 1) === chatMessage?.totalInSequence) {
            this.continueButton.setText("Exit");
        } else {
            this.continueButton.setText("Continue");
        };
        
        // Position above entity
        this.positionAboveEntity(entity, height);
        
        // Show with fade in
        this.container.setAlpha(0);
        this.container.setVisible(true);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: this.FADE_DURATION,
            ease: "Power2",
            onComplete: () => {
                this.typing.start(message);
            }
        });
        
        // Handle serial vs timed messages
        if (!chatMessage.isSerial) {
            // Auto-hide after duration for random messages
            this.timer = this.scene.time.delayedCall(chatMessage.duration, () => {
                this.hide();
            });
        };
    };

    private updateLayout(): number {
        const textBounds = this.text.getBounds();
        const serial = this.isSerial ? this.continueButton.height : 0;
        const bubbleWidth = Math.max(textBounds.width + (this.PADDING * 2), 100);
        const bubbleHeight = textBounds.height + serial + (this.PADDING);
        
        // Clear and redraw background
        this.background.clear();
        this.background.fillStyle(0x000000, 0.9);
        this.background.lineStyle(2, 0xfdf6d8, 1);
        this.background.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10);
        this.background.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10);

        // Position text centered in bubble
        this.text.setPosition(
            (bubbleWidth - textBounds.width) / 2,
            (bubbleHeight - textBounds.height) / 2
        );
        
        // Position pointer at bottom center
        this.pointer.setPosition(
            bubbleWidth / 2,
            bubbleHeight
        );
        
        // Update container size for positioning
        this.container.setSize(bubbleWidth, bubbleHeight + this.POINTER_HEIGHT);
        this.container.bringToTop(this.continueButton);

        return bubbleHeight;
    };

    private positionAboveEntity(entity: Speaker, height: number): void {
        const bubbleX = entity.x - (this.container.width / 2);
        const bubbleY = entity.y - (height + this.PADDING * 2);
        this.container.setPosition(bubbleX, bubbleY);
    };

    hide(): void {
        if (this.timer) {
            this.timer.remove();
            this.timer = undefined;
        };
        
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: this.FADE_DURATION,
            ease: "Power2",
            onComplete: () => {
                this.continueButton.setVisible(false);
                this.buttonBackground.setVisible(false);
                this.container.setVisible(false);
                this.onContinueCallback = undefined;
                this.isSerial = false;
            }
        });
    };

    isVisible(): boolean {
        return this.container.alpha > 0 && this.container.visible;
    };

    destroy(): void {
        if (this.timer) {
            this.timer.remove();
        };
        this.container.destroy();
    };
};