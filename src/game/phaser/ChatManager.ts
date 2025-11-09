import DM from "../entities/DM";
import Enemy from "../entities/Enemy";
import NPC from "../entities/NPC";
import { EventBus } from "../EventBus";
import { Play } from "../main";
import { ChatBubble } from "./ChatBubble";

export type Speaker = DM | Enemy | NPC;

export interface ChatMessage {
    message: string;
    duration: number;
    priority?: number;
    isSerial: boolean;        // Whether this is part of a serial dialogue
    sequenceIndex?: number;    // Position in sequence (0, 1, 2...)
    totalInSequence?: number;  // Total messages in this sequence
    messageKey: string;       // Which message pool this came from
    special: {key:string;value:string};
};

export class ChatManager {
    private scene: Play;
    private bubbles: Map<string, ChatBubble> = new Map();
    private messageQueues: Map<string, ChatMessage[]> = new Map();
    private messagePools: Map<string, Map<string, string[]>> = new Map();
    private specialPool: Map<string, Map<string, any[]>> = new Map();
    private currentSequences: Map<string, { messages: string[], currentIndex: number, messageKey: string, specials: any[] }> = new Map();

    constructor(scene: Play) {
        this.scene = scene;
    };

    registerMessages(npcId: string, messageKey: string, messages: string[], specials: any[] = []): void {
        if (!this.messagePools.has(npcId)) {
            this.messagePools.set(npcId, new Map());
        };
        if (!this.specialPool.has(npcId)) {
            this.specialPool.set(npcId, new Map());
        };
        
        const npcMessages = this.messagePools.get(npcId)!;
        npcMessages.set(messageKey, [...messages]); // Store copy of messages

        const specialPool = this.specialPool.get(npcId);
        specialPool?.set(messageKey, [...specials]);

        // console.log(`Registered ${messages.length} messages for NPC ${npcId}, key: ${messageKey}`);
    };
    
    registerNPC(npcId: string): void {
        if (!this.bubbles.has(npcId)) {
            this.bubbles.set(npcId, new ChatBubble(this.scene));
            this.messageQueues.set(npcId, []);
        };
    };

    speak(npcId: string, messageKey: string, priority: number = 1, random: boolean = true): boolean {
        const bubble = this.bubbles.get(npcId);
        const queue = this.messageQueues.get(npcId);
        const messagePool = this.messagePools.get(npcId);
        const specialPool = this.specialPool.get(npcId);

        if (!bubble || !queue || !messagePool) return false;

        const messages = messagePool.get(messageKey);
        if (!messages || messages.length === 0) return false;

        let chatMessage: ChatMessage;
        let specials = [];

        if (specialPool) {
            specials = specialPool.get(messageKey) as any[];
        };

        if (random || messages.length === 1) {
            // Single or random message
            const message = random ? 
                messages[Math.floor(Math.random() * messages.length)] : 
                messages[0];
            
            chatMessage = { 
                message,
                messageKey,
                duration: 5000, 
                priority,
                isSerial: false,
                special: specials[0]
            };
        } else {
            // Serial dialogue - start from beginning
            this.currentSequences.set(npcId, {
                messages: [...messages],
                currentIndex: 0,
                messageKey,
                specials
            });
            
            chatMessage = this.getNextSerialMessage(npcId) as ChatMessage;
        };

        // Queue logic
        if (!bubble.isVisible() || priority > this.getCurrentPriority(npcId)) {
            this.showMessage(npcId, chatMessage);
        } else {
            queue.push(chatMessage);
            queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        };

        return true;
    };

    private getNextSerialMessage(npcId: string): ChatMessage | undefined {
        const sequence = this.currentSequences.get(npcId);
        if (!sequence) return undefined;

        if (sequence.currentIndex >= sequence.messages.length) {
            // End of sequence
            this.currentSequences.delete(npcId);
            return undefined;
        };

        const message = sequence.messages[sequence.currentIndex];
        const specialPool = this.specialPool.get(npcId);
        const specials = specialPool?.get(sequence.messageKey) || [];
        const special = specials[sequence.currentIndex];

        const chatMessage: ChatMessage = {
            message,
            duration: 0,
            priority: 2,
            isSerial: true,
            sequenceIndex: sequence.currentIndex,
            totalInSequence: sequence.messages.length,
            messageKey: sequence.messageKey,
            special
        };


        if (chatMessage.special) {
            const { key, value } = chatMessage.special;
            if (key || value) {
                EventBus.emit(key, value);
                // console.log("getNextSerialMessage", { sequenceIndex: chatMessage.sequenceIndex, key, value });
            };
        };

        sequence.currentIndex++;
        return chatMessage;
    };

    private showMessage(npcId: string, chatMessage: ChatMessage): void {
        const bubble = this.bubbles.get(npcId);
        const queue = this.messageQueues.get(npcId);
        if (!bubble || !queue) return;

        const entity = this.scene.children.list.find(child => (child as any).particleID === npcId) as Speaker;
        if (!entity) return;

        // Setup continue callback for serial messages
        const onContinue = chatMessage.isSerial ? () => {
            const nextMessage = this.getNextSerialMessage(npcId);
            if (nextMessage) {
                this.showMessage(npcId, nextMessage);
            } else {
                // Sequence ended, check queue for next message
                if (queue.length > 0) {
                    const nextQueued = queue.shift();
                    if (nextQueued) this.showMessage(npcId, nextQueued);
                } else {
                    // console.log("Clearning Queue", chatMessage.messageKey);
                    this.clearQueue(npcId, chatMessage.messageKey);
                };
            };
        } : undefined;

        bubble.showAbove(entity, chatMessage, onContinue);

        // For non-serial messages, setup next message from queue
        if (!chatMessage.isSerial && queue.length > 0) {
            const nextMessage = queue.shift();
            if (nextMessage) {
                this.scene.time.delayedCall(chatMessage.duration || 4000, () => {
                    this.showMessage(npcId, nextMessage);
                });
            };
        };
    };

    speakRandom(npcId: string, priority: number = 0): boolean {
        const messagePool = this.messagePools.get(npcId);
        if (!messagePool || messagePool.size === 0) return false;
        
        const messageKeys = Array.from(messagePool.keys());
        const randomKey = messageKeys[Math.floor(Math.random() * messageKeys.length)];
        
        return this.speak(npcId, randomKey, priority, true);
    };
    
    private getCurrentPriority(npcId: string): number {
        const queue = this.messageQueues.get(npcId);
        return queue && queue.length > 0 ? (queue[0].priority || 0) : 0;
    };

    stopSpeaking(npcId: string) {
        const bubble = this.bubbles.get(npcId);
        if (bubble) bubble.hide();        
    };
    
    clearQueue(npcId: string, key: string | undefined): void {
        const queue = this.messageQueues.get(npcId);
        const bubble = this.bubbles.get(npcId);
        
        if (queue) queue.length = 0;
        if (bubble) bubble.hide();
        if (key) EventBus.emit("section-completed", key);

    };
    
    destroy(): void {
        this.bubbles.forEach(bubble => bubble.destroy());
        this.bubbles.clear();
        this.messageQueues.clear();
    };
};