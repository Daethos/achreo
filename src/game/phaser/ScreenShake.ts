var totalTrauma = 0;
var timeScale = false;

export function hitStop(scene: Phaser.Scene, duration = 32) {
    if (timeScale) return;
    timeScale = true;
    scene.time.timeScale = 0.01;
    setTimeout(() => { 
        scene.time.timeScale = 1; 
        timeScale = false; 
    }, duration);
};

export function screenShake(scene: Phaser.Scene, duration = 32, intensity = 0.003) {
    totalTrauma += 1.03;
    intensity *= Math.pow(totalTrauma, 2);
    if ("vibrate" in navigator && navigator?.vibrate !== undefined) navigator.vibrate(duration);
    const decayInterval = setInterval(() => {
        scene.cameras.main.shake(duration, intensity);
        totalTrauma -= 1.03 / duration;
        if (totalTrauma <= 0) {
            totalTrauma = 0;
            clearInterval(decayInterval);
        };
    }, 16);
};
export function sprint(scene: Phaser.Scene, duration = 32, intensity = 0.002) { // 48 || 0.0004
    scene.cameras.main.shake(duration, intensity);
};
export function walk(scene: any, duration = 32, intensity = 0.000675) { // 32 || 0.0003
    scene.cameras.main.shake(duration, intensity);
};
export function vibrate(duration = 64) {
    if ("vibrate" in navigator && navigator?.vibrate !== undefined) navigator.vibrate(duration);
};