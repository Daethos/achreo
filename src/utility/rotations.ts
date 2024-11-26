export const WEAPON_FRAME_CONFIG = {
    prayingCasting: {
        flipX: {
            0: { origin: [0.65, 1.5], angle: -175 },
            8: { origin: [-0.3, 0.65], angle: -225 }
        },
        noFlipX: {
            0: { origin: [-0.75, 0.65], angle: -275 },
            8: { origin: [0.35, 1.3], angle: -225 }
        }
    },
    attacking: {
        bow: {
            flipX: {
                0: { origin: [0.15, 0.85], angle: 90 },
                4: { angle: 72.5 },
                12: { angle: 90 },
                13: { angle: 130 },
                14: { angle: 170 },
                15: { angle: 210 },
                16: { angle: 250 },
                18: { origin: [0.5, 0.5], angle: 340 },
                20: { angle: 290 },
                22: { origin: [0.25, 0.5], angle: 250 },
                32: { origin: [0.25, 0.25], angle: -45 },
                33: { angle: -30 },
                34: { angle: -15 },
                35: { angle: 0 },
                36: { angle: 15 },
                37: { origin: [0.85, 0.15], angle: 30 },
                38: { angle: 45 },
                39: { angle: 60 },
            },
            noFlipX: {
                0: { origin: [0.85, 0.1], angle: 0 },
                4: { angle: 17.5 },
                12: { angle: 0 },
                13: { angle: -30 },
                14: { angle: -60 },
                15: { angle: -90 },
                16: { angle: -120 },
                18: { origin: [0, 0.5], angle: -75 },
                20: { angle: -10 },
                22: { origin: [0.25, 0.5], angle: -125 },
                32: { origin: [0.25, 0.25], angle: 45 },
                33: { angle: 60 },
                34: { angle: 75 },
                35: { angle: 90 },
                36: { angle: 75 },
                37: { origin: [0.85, 0.1], angle: 60 },
                38: { angle: 45 },
                39: { angle: 30 },
            },
        },
        noBow: {
            flipX: {
                0: { origin: [-0.25, 1.2], angle: -250 },
                4: { angle: -267.5 },
                12: { angle: -250 },
                13: { angle: -210 },
                14: { angle: -170 },
                15: { angle: -130 },
                16: { angle: -90 },
                18: { origin: [0.5, 0.75], angle: 0 },
                20: { angle: 30 },
                22: { origin: [0.25, 1.1], angle: 55 },
                35: { origin: [0.5, 0.75], angle: 30 },
                36: { angle: 0 },
                37: { origin: [-0.25, 1.2], angle: -90 },
                38: { angle: -130 },
                39: { angle: -170 },
                // Flagged if (this.isRanged === false) this.checkActionSuccess(entity, target);
                40: { angle: -210 },
                41: { angle: -250 },
                42: { angle: -267.5 },
            },
            noFlipX: {
                0: { origin: [-0.15, 1.25], angle: -185 },
                4: { angle: -182.5 },
                12: { angle: 150 },
                13: { angle: 120 },
                14: { angle: 90 },
                15: { angle: 60 },
                16: { angle: 30 },
                18: { origin: [-0.25, 0.75], angle: -75 },
                20: { angle: -90 },
                22: { origin: [0, 0.5], angle: -150 },
                35: { origin: [-0.25, 0.75], angle: -90 },
                36: { angle: -75 },
                37: { origin: [-0.15, 1.25], angle: 30 },
                38: { angle: 60 },
                39: { angle: 90 },
                // Flagged if (this.isRanged === false) this.checkActionSuccess(entity, target);
                40: { angle: 120 },
                41: { angle: 150 },
                42: { angle: 180 },
            }
        }
    },
    parrying: {
        bow: {
            flipX: {
                0: { origin: [0.15, 0.85], angle: 90 },
                4: { angle: 72.5 },
                12: { angle: 90 },
                13: { angle: 130 },
                14: { angle: 170 },
                15: { angle: 210 },
                16: { angle: 250 },
                18: { origin: [0.5, 0.5], angle: 340 },
                20: { angle: 290 },
                22: { origin: [0.25, 0.5], angle: 250 },
            },
            noFlipX: {
                0: { origin: [0.85, 0.1], angle: 0 },
                4: { angle: 17.5 },
                12: { angle: 0 },
                13: { angle: -30 },
                14: { angle: -60 },
                15: { angle: -90 },
                16: { angle: -120 },
                18: { origin: [0, 0.5], angle: -75 },
                20: { angle: -10 },
                22: { origin: [0.25, 0.5], angle: -125 },
            },
        },
        noBow: {
            flipX: {
                0: { origin: [-0.25, 1.2], angle: -250 },
                4: { angle: -267.5 },
                12: { angle: -250 },
                13: { angle: -210 },
                14: { angle: -170 },
                15: { angle: -130 },
                16: { angle: -90 },
                18: { origin: [0.5, 0.75], angle: 0 },
                20: { angle: 30 },
                22: { origin: [0.25, 1.1], angle: 55 },
            },
            noFlipX: {
                0: { origin: [-0.15, 1.25], angle: -185 },
                4: { angle: -182.5 },
                12: { angle: 150 },
                13: { angle: 120 },
                14: { angle: 90 },
                15: { angle: 60 },
                16: { angle: 30 },
                18: { origin: [-0.25, 0.75], angle: -75 },
                20: { angle: -90 },
                22: { origin: [0, 0.5], angle: -150 },
            }
        }
    },
    posturing: {
        bow: {
            flipX: {
                0: { origin: [0.75, 0], angle: 235 },
                5: { angle: 155 },
                8: { origin: [0, 0.25], angle: 135 }
            },
            noFlipX: {
                0: { origin: [0, 0.5], angle: -165 },
                5: { angle: -90 },
                8: { origin: [0.25, 0], angle: -45 }
            }
        },
        noBow: {
            flipX: {
                0: { origin: [0.25, 1.1], angle: 55 },
                5: { origin: [0.5, 0.75], angle: 40 },
                8: { angle: 25 },
                11: { origin: [0, 1.2], angle: -220 },
                14: { origin: [0, 1.4], angle: -235 },
                17: { angle: -250 }
                // Flagged if (this.isRanged === false) this.checkActionSuccess(entity, target);
            },
            noFlipX: {
                0: { origin: [0, 0.5], angle: -165 },
                5: { origin: [0, 1], angle: -45 },
                8: { origin: [-0.25, 1.1], angle: 15 },
                11: { origin: [-0.1, 1.2], angle: -205 },
                14: { angle: -190 },
                17: { angle: -175 }
                // Flagged if (this.isRanged === false) this.checkActionSuccess(entity, target);
            }
        }
    },
    thrusting: {
        bow: {
            flipX: {
                0: { origin: [0.1, 0.2], angle: -225 },
            },
            noFlipX: {
                0: { origin: [0.25, 0], angle: -45 },
            },
        },
        noBow: {
            flipX: {
                0: { origin: [-0.4, 1.6], angle: -135 },
            },
            noFlipX: {
                0: { origin: [-0.4, 1.2], angle: 45 },
            }
        }
    }
};

export const SHIELD_FRAME_CONFIG = {
    posturing: {
        flipX: {
            0: { origin: [1, 0.15] },
            5: { origin: [1.05, 0.15] },
            8: { origin: [1.1, 0.15] },
            11: { origin: [1.15, 0.15] },
            14: { origin: [1.2, 0.15] },
            17: { origin: [1, 0.15] },
        },
        noFlipX: {
            0: { origin: [0, 0.25] },
            5: { origin: [-0.05, 0.15] },
            8: { origin: [-0.1, 0.15] },
            11: { origin: [-0.15, 0.15] },
            14: { origin: [-0.2, 0.15] },
            17: { origin: [0, 0.15] },
        }
    },
};

export function applyStaticFrameSettings(spriteWeapon: Phaser.GameObjects.Sprite, frameConfig: any) {
    if (!frameConfig) return; // Skip if no settings for this frame
    if (frameConfig.origin) spriteWeapon.setOrigin(...frameConfig.origin);
    if (frameConfig.angle) spriteWeapon.setAngle(frameConfig.angle);
};

export function applyWeaponFrameSettings(spriteWeapon: Phaser.GameObjects.Sprite, frameConfig: any, frameCount: number) {
    const frameSettings = frameConfig[frameCount];
    if (!frameSettings) return; // Skip if no settings for this frame
    if (frameSettings.origin) spriteWeapon.setOrigin(...frameSettings.origin);
    if (frameSettings.angle) spriteWeapon.setAngle(frameSettings.angle);
};

export function applyShieldFrameSettings(spriteShield: Phaser.GameObjects.Sprite, frameConfig: any, frameCount: number) {
    const frameSettings = frameConfig[frameCount];
    if (!frameSettings) return; // Skip if no settings for this frame
    if (frameSettings.origin) spriteShield.setOrigin(...frameSettings.origin);
};