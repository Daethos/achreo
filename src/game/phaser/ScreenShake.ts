import { Haptics } from "@capacitor/haptics";
import { Play } from "../main";

export function screenShake(scene: Play, duration = 128, int = 0.0025) { // 32 / 0.0025
    scene.combatManager.hitFeedbackSystem.screenShake(duration, int);
    vibrate(duration);
};
export function sprint(scene: Phaser.Scene, duration = 32, intensity = 0.0015) { // 48 || 0.0004
    scene.cameras.main.shake(duration, intensity);
};
export function walk(scene: any, duration = 32, intensity = 0.000675) { // 32 || 0.0003
    scene.cameras.main.shake(duration, intensity);
};
export function vibrate(duration: number[] | number = 320) {
    if ("vibrate" in navigator && navigator?.vibrate !== undefined) {
        navigator.vibrate(duration);
    } else {
        const int = Number.isInteger(duration) ? duration as number : 640;
        Haptics.vibrate({duration:int});
    };
};