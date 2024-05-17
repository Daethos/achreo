import Phaser from 'phaser';
let totalTrauma = 0;

export function screenShake(scene: Phaser.Scene, duration = 96, intensity = 0.005) {
    totalTrauma += 1.05;
    intensity *= Math.pow(totalTrauma, 2);
    if ("vibrate" in navigator) {
        navigator.vibrate(duration);
    };
    scene.cameras.main.shake(duration, intensity);
    
    const decayInterval = setInterval(() => {
        totalTrauma -= 1.05 / duration;
        if (totalTrauma <= 0) {
            totalTrauma = 0;
            clearInterval(decayInterval);
        };
    }, 1);
};
 
export function walk(scene: Phaser.Scene, duration = 48, intensity = 0.0004) { // 32 || 0.0003
    scene.cameras.main.shake(duration, intensity);
};