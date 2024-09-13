import { EventBus } from "../game/EventBus";
var remaining: number = 0, timer: any = undefined;
function startCountdown(combat: boolean, health: number) {
    if (combat === false) {
        EventBus.emit('save-health', health);
        return;
    };
    timer = setInterval(() => {
        remaining -= 1000;
        if (remaining <= 0) {
            clearInterval(timer);
            remaining = 0;
            timer = undefined;
            EventBus.emit('save-health', health);
        };
    }, 1000);
};
export function adjustTime(amount: number, combat: boolean, health: number, cancel?: boolean) {
    if (cancel === true) {
        clearInterval(timer);
        timer = undefined;
        return;
    };
    remaining += amount;
    if (!timer) startCountdown(combat,health);
};