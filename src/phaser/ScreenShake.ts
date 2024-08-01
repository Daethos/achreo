var totalTrauma = 0;
export function screenShake(scene: Phaser.Scene, duration = 96, intensity = 0.0035) {
    totalTrauma += 1.04;
    intensity *= Math.pow(totalTrauma, 2);
    if ("vibrate" in navigator) navigator.vibrate(duration);
    scene.cameras.main.shake(duration, intensity);
    const decayInterval = setInterval(() => {
        totalTrauma -= 1.04 / duration;
        if (totalTrauma <= 0) {
            totalTrauma = 0;
            clearInterval(decayInterval);
        };
    }, 1);
};
export function sprint(scene: Phaser.Scene, duration = 64, intensity = 0.0005) { // 48 || 0.0004
    scene.cameras.main.shake(duration, intensity);
};
export function walk(scene: Phaser.Scene, duration = 32, intensity = 0.0003) { // 32 || 0.0003
    scene.cameras.main.shake(duration, intensity);
};