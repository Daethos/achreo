export enum ENTITY_FLAGS {
    NONE = 0,
    PLAYER = 1 << 0,  // 1
    ENEMY = 1 << 1,   // 2
    PARTY = 1 << 2,   // 4
    LOOT = 1 << 3,    // 8
    NPC = 1 << 4,     // 16
    WORLD = 1 << 5,   // 32
    // Combined flags
    GOOD = PLAYER | PARTY,
    ENTITY = PLAYER | ENEMY | PARTY,
    ALL = PLAYER | ENEMY | PARTY | LOOT | NPC | WORLD
};

export type EntityFlag = typeof ENTITY_FLAGS[keyof typeof ENTITY_FLAGS];