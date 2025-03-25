import { EventBus } from "../game/EventBus";

class CountdownTimer {
    private remaining: number = 0;
    private timer: NodeJS.Timeout | undefined = undefined;
    private healthValue: number = 0;
    private inCombat: boolean = false;

    public adjustTime(amount: number, combat: boolean, health: number, cancel?: boolean): void {
        if (cancel) {
            this.clearTimer();
            return;
        };

        if (amount <= 0) {
            console.warn("adjustTime: amount should be positive");
            return;
        };

        this.inCombat = combat;
        this.healthValue = health;
        this.remaining += amount;

        if (!this.timer) {
            this.startCountdown();
        };
    };

    private startCountdown(): void {
        if (!this.inCombat) {
            this.saveHealth();
            return;
        };

        this.timer = setInterval(() => {
            this.remaining -= 1000;
            
            if (this.remaining <= 0) {
                this.clearTimer();
                this.remaining = 0;
                this.saveHealth();
            };
        }, 1000);
    };

    private saveHealth(): void {
        EventBus.emit("save-health", this.healthValue);
    };

    private clearTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        };
    };

    public cleanup(): void {
        this.clearTimer();
    };
};

export const timer = new CountdownTimer();