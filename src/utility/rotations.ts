import { States } from "../game/phaser/StateMachine";

type FRAME = {[key: string]: string;};

export const FRAME_KEYS: FRAME = {
    "player_climb": "movingVertical",
    "player_crouch_idle": States.IDLE,
    "player_idle": States.IDLE,
    "player_running": States.MOVING,
    "run_down": "movingVertical",
    "run_up": "movingVertical",
    "swim_down": "movingVertical",
    "swim_up": "movingVertical",
    "player_health": "prayingCasting",
    "player_hurt": States.HURT,
    "player_pray": "prayingCasting",
    "player_attack_1": States.ATTACK,
    "player_slide": States.DODGE,
    "player_jump": States.JUMP,
    "player_attack_6": States.PARRY,
    "player_attack_7": States.HURL,
    "player_attack_3": States.POSTURE,
    "player_roll": States.ROLL,
    "grapple_roll": States.GRAPPLING_ROLL,
    "player_attack_2": States.THRUST,
};

export const WEAPON_ANIMATION_FRAME_CONFIG = {
    prayingCasting: {
        flipX: {
            // 1: { origin: [0.65, 1.5], angle: -175 },
            3: { origin: [-0.3, 0.65], angle: -225 }
        },
        noFlipX: {
            // 1: { origin: [-0.75, 0.65], angle: -275 },
            3: { origin: [0.35, 1.3], angle: -225 }
        }
    },
    attacking: {
        bow: {
            flipX: {
                1: { origin: [0.15, 0.85], angle: 90 },
                2: { angle: 130 },
                3: { angle: 190 },
                4: { angle: 250 },
                5: { angle: 290 },
                6: { origin: [0.25, 0.25], angle: 210 }, // -45
                7: { angle: 150 }, // -15
                8: { angle: 90 }, // 15
                9: { angle: 60 },
            },
            noFlipX: {
                1: { origin: [0.85, 0.1], angle: 0 },
                2: { angle: -30 },
                3: { angle: -90 },
                4: { angle: -150 },
                5: { angle: -210 }, // -10
                6: { origin: [0.25, 0.25], angle: -150 }, // 45
                7: { angle: -90 }, // 120
                8: { angle: -30 },
                9: { angle: 30 },
            },
        },
        noBow: {
            flipX: {
                1: { origin: [-0.25, 1.2], angle: -250 },
                2: { angle: -215 },
                3: { angle: -180 },
                4: { angle: -150 },
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
                3: { angle: 190 },
                4: { angle: 250 },
                5: { angle: 290 },
                6: { origin: [0.25, 0.25], angle: 210 }, // -45
            },
            noFlipX: {
                1: { origin: [0.85, 0.1], angle: 0 },
                2: { angle: -30 },
                3: { angle: -90 },
                4: { angle: -150 },
                5: { angle: -210 }, // -10
                6: { origin: [0.25, 0.25], angle: -150 }, // 45
            },
        },
        noBow: {
            flipX: {
                1: { origin: [-0.25, 1.2], angle: -250 },
                2: { angle: -215 },
                3: { angle: -180 },
                4: { angle: -150 },
                5: { origin: [0.5, 0.75], angle: 30 },
                6: { origin: [0.5, 0.75], angle: 30 },
            },
            noFlipX: {
                1: { origin: [-0.15, 1.25], angle: -185 },
                2: { angle: 150 },
                3: { angle: 90 },
                4: { angle: 30 },
                5: { origin: [-0.25, 0.75], angle: -90 },
                6: { origin: [-0.25, 0.75], angle: -75 },
            }
        }
    },
    posturing: {
        bow: {
            flipX: {
                1: { origin: [0.75, 0], angle: 235 },
                2: { angle: 200 },
                3: { angle: 170 },
                4: {  origin: [0, 0], angle: 145 },
                5: { angle: 110 }
            },
            noFlipX: {
                1: { origin: [0, 0.5], angle: -165 },
                2: { angle: -115 },
                3: { angle: -75},
                4: { origin: [0.35, 0], angle: -30 },
                5: { angle: 0 }
            }
        },
        noBow: {
            flipX: {
                1: { origin: [0, 1.1], angle: 30 },
                2: { origin: [-0.1, 1.2], angle: -90 },
                3: { angle: -150 },
                4: { origin: [0, 1.4], angle: -215 },
                5: { angle: -250 }
            },
            noFlipX: {
                1: { origin: [0, 0.75], angle: -150 },
                2: { origin: [-0.25, 1.1], angle: 10},
                3: { angle: 50 },
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
    },
    moving: {
        bow: {
            flipX: { // START origin: [0.25, 0.5], angle: -7.5
                // 0: { origin: [0.25, 0.5], angle: -7.5 },
                1: { origin: [0.25, 0.5], angle: -10 },
                4: { angle : -7.5 },
                7: { angle: -5 } 
            },
            noFlipX: { // START origin: [0.5, 0.25], angle: 107.5
                // 0: { origin: [0.5, 0.25], angle: 107.5 },
                1: { origin: [0.5, 0.25], angle: 110 },
                4: { angle : 107.5 },
                7: { angle: 105 }
            }
        },
        noBow: { 
            flipX: { // START origin: [0.5, 1.2], angle: -194.5
                // 0: { origin: [0.5, 1.2], angle: -194.5 },
                1: { origin: [0.5, 1.2], angle: -197 },
                4: { angle : -194.5 },
                7: { angle: -192 }
            },
            noFlipX: { // START origin: [-0.25, 0.5], angle: 107.5
                // 0: { origin: [-0.25, 0.5], angle: 107.5 },
                1: { origin: [-0.25, 0.5], angle: 110 },
                4: { angle : 107.5 },
                7: { angle: 105 }
            }
        }
    },
    movingVertical: {
        bow: {
            flipX: { // START origin: [0.25, 0.5], angle: -7.5
                1: { origin: [0.6, 0.75], angle: 75 },
                3: { angle : 72.5 },
                5: { angle: 70 } 
            },
            noFlipX: { // START origin: [0.5, 0.25], angle: 107.5
                1: { origin: [0.75, 0.5], angle: 10 },
                3: { angle : 7.5 },
                5: { angle: 5 }
            }
        },
        noBow: { 
            flipX: { // START origin: [0.5, 1.2], angle: -194.5
                1: { origin: [0.2, 1.2], angle: -197 },
                3: { angle : -194.5 },
                5: { angle: -192 }

            },
            noFlipX: { // START origin: [-0.25, 0.5], angle: 107.5
                1: { origin: [-0.35, 0.75], angle: 110 },
                3: { angle : 107.5 },
                5: { angle: 105 }
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