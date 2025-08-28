export const WEAPON_ANIMATION_FRAME_CONFIG = {
    prayingCasting: {
        flipX: {
            1: { origin: [0.65, 1.5], angle: -175 },
            3: { origin: [-0.3, 0.65], angle: -225 }
        },
        noFlipX: {
            1: { origin: [-0.75, 0.65], angle: -275 },
            3: { origin: [0.35, 1.3], angle: -225 }
        }
    },
    attacking: {
        bow: {
            flipX: {
                1: { origin: [0.15, 0.85], angle: 90 },
                2: { angle: 90 },
                3: { angle: 170 },
                4: { angle: 250 },
                5: { angle: 290 },
                6: { origin: [0.25, 0.25], angle: -45 },
                7: { angle: -15 },
                8: { angle: 15 },
                9: { angle: 60 },
            },
            noFlipX: {
                1: { origin: [0.85, 0.1], angle: 0 },
                2: { angle: 0 },
                3: { angle: -60 },
                4: { angle: -120 },
                5: { angle: -10 },
                6: { origin: [0.25, 0.25], angle: 45 },
                7: { angle: 75 },
                8: { angle: 75 },
                9: { angle: 30 },
            },
        },
        noBow: {
            flipX: {
                1: { origin: [-0.25, 1.2], angle: -250 },
                2: { angle: -250 },
                3: { angle: -170 },
                4: { angle: -90 },
                5: { origin: [0.5, 0.75], angle: 30 },
                6: { origin: [0.5, 0.75], angle: 30 },
                7: { origin: [-0.25, 1.2], angle: -75 },
                8: { angle: -170 },
                9: { angle: -267.5 },
            },
            noFlipX: {
                1: { origin: [-0.15, 1.25], angle: -185 },
                2: { angle: 150 },
                3: { angle: 90 },
                4: { angle: 30 },
                5: { origin: [-0.25, 0.75], angle: -90 },
                6: { origin: [-0.25, 0.75], angle: -75 },
                7: { origin: [-0.15, 1.25], angle: 30 },
                8: { angle: 90 },
                9: { angle: 180 },
            }
        }
    },
    parrying: {
        bow: {
            flipX: {
                1: { origin: [0.15, 0.85], angle: 90 },
                2: { angle: 130 },
                3: { angle: 170 },
                4: { angle: 250 },
                5: { origin: [0.5, 0.5], angle: 340 },
                6: { origin: [0.25, 0.5], angle: 250 },
            },
            noFlipX: {
                1: { origin: [0.85, 0.1], angle: 0 },
                2: { angle: -30 },
                3: { angle: -60 },
                4: { angle: -120 },
                5: { origin: [0, 0.5], angle: -75 },
                6: { origin: [0.25, 0.5], angle: -125 },
            },
        },
        noBow: {
            flipX: {
                1: { origin: [-0.25, 1.2], angle: -250 },
                2: { angle: -250 },
                3: { angle: -170 },
                4: { angle: -90 },
                5: { origin: [0.5, 0.75], angle: 0 },
                6: { origin: [0.25, 1.1], angle: 55 },
            },
            noFlipX: {
                1: { origin: [-0.15, 1.25], angle: -185 },
                2: { angle: 150 },
                3: { angle: 90 },
                4: { angle: 30 },
                5: { origin: [-0.25, 0.75], angle: -75 },
                6: { origin: [0, 0.5], angle: -150 },
            }
        }
    },
    posturing: {
        bow: {
            flipX: {
                1: { origin: [0.75, 0], angle: 235 },
                2: { angle: 200 },
                3: { angle: 175 },
                4: { angle: 155 },
                5: { origin: [0, 0.25], angle: 135 }
            },
            noFlipX: {
                1: { origin: [0, 0.5], angle: -165 },
                2: { angle: -135 },
                3: { angle: -90 },
                4: { angle: -70 },
                5: { origin: [0.25, 0], angle: -45 }
            }
        },
        noBow: {
            flipX: {
                1: { origin: [0.25, 1.1], angle: 55 },
                2: { origin: [0.5, 0.75], angle: 40 },
                3: { origin: [0, 1.2], angle: -220 },
                4: { origin: [0, 1.4], angle: -235 },
                5: { angle: -250 }
            },
            noFlipX: {
                1: { origin: [0, 0.5], angle: -165 },
                2: { origin: [0, 1], angle: -45 },
                3: { origin: [-0.25, 1.1], angle: 15 },
                4: { origin: [-0.1, 1.2], angle: -205 },
                5: { angle: -175 }
            }
        }
    },
    thrusting: {
        bow: {
            flipX: {
                1: { origin: [0.1, 0.2], angle: -225 },
            },
            noFlipX: {
                1: { origin: [0.25, 0], angle: -45 },
            },
        },
        noBow: {
            flipX: {
                1: { origin: [-0.4, 1.6], angle: -135 },
            },
            noFlipX: {
                1: { origin: [-0.4, 1.2], angle: 45 },
            }
        }
    }
};

export const SHIELD_ANIMATION_FRAME_CONFIG = {
    posturing: {
        flipX: {
            1: { origin: [1, 0.15] },
            2: { origin: [1.05, 0.15] },
            3: { origin: [1.1, 0.15] },
            4: { origin: [1.15, 0.15] },
            5: { origin: [1, 0.15] },
        },
        noFlipX: {
            1: { origin: [0, 0.25] },
            2: { origin: [-0.05, 0.15] },
            3: { origin: [-0.1, 0.15] },
            4: { origin: [-0.15, 0.15] },
            5: { origin: [0, 0.15] },
        }
    },
};
export function applyStaticFrameSettings(spriteWeapon: Phaser.GameObjects.Sprite, frameConfig: any) {
    if (!frameConfig) return;
    if (frameConfig.origin) spriteWeapon.setOrigin(...frameConfig.origin);
    if (frameConfig.angle) spriteWeapon.setAngle(frameConfig.angle);
};

export function applyWeaponFrameSettings(spriteWeapon: Phaser.GameObjects.Sprite, frameConfig: any, frameCount: number) {
    const frameSettings = frameConfig[frameCount];
    if (!frameSettings) return;
    if (frameSettings.origin) spriteWeapon.setOrigin(...frameSettings.origin);
    if (frameSettings.angle) spriteWeapon.setAngle(frameSettings.angle);
};

export function applyShieldFrameSettings(spriteShield: Phaser.GameObjects.Sprite, frameConfig: any, frameCount: number) {
    const frameSettings = frameConfig[frameCount];
    if (!frameSettings) return;
    if (frameSettings.origin) spriteShield.setOrigin(...frameSettings.origin);
};