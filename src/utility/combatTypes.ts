import Equipment from "../models/equipment";
import { PRAYERS } from "./prayer";

export const ARMOR_WEIGHT: any = {helmet:2,chest:1.5,legs:1};
export const ATTACKS = {
    achire: "achire",
    attack: "attack",
    hook: "hook",
    parry: "parry",
    posture: "posture against",
    roll: "roll into",
    quor: "quorse through",
    leap: "leap onto",
    rush: "rush through",
    storm: "storm through",
    thrust: "thrust attack",
    writhe: "writhe into",
};
export const ACTION_TYPES = {
    ACHIRE: "achire",
    ARC: "arc",
    ATTACK: "attack",
    HOOK: "hook",
    LEAP: "leap",
    POSTURE: "posture",
    QUOR: "quor",
    ROLL: "roll",
    PARRY: "parry",
    RUSH: "rush",
    STORM: "storm",
    THRUST: "thrust",
    WRITHE: "writhe",
};
export const ATTACK_TYPES = { MAGIC: "Magic", PHYSICAL: "Physical" };

export const DAMAGE = {
    CUMULATIVE: 0.03,
    CUMULATIVE_TALENTED: 0.06,
    CAERENEIC_NEG: 1.25,
    CAERENIC_NEG_OP: 1.15,
    CAERENIC_POS_EN: 1.25,
    CAERENEIC_POS: 1.15,
    STALWART: 0.85,
    STALWART_EN: 0.75,
    SEVENTY_FIVE: 0.75,
    NINETY: 0.9,
    ONE_TEN: 1.1,
    ONE_FIFTEEN: 1.15,
    ONE_FIFTY: 1.5,
    ONE_TWENTY_FIVE: 1.25,
    ONE_THIRTY: 1.3,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    SIX: 6,
    TICK_HALF: 0.165,
    TICK_FULL: 0.33,
    HALF: 0.5,
};
export const ARMORS = {
    FIFTEEN: 1.15,
    TEN: 1.1,
    EIGHT: 1.08,
    FIVE: 1.05,
    THREE: 1.03,

    NINETY_SEVEN: 0.97,
    NINETY_FIVE: 0.95,
    NINETY_TWO: 0.92,
    NINETY: 0.9,
    EIGHTY_FIVE: 0.85,

    RANDOM: 0.15,
};

export const DAMAGE_TYPE_NUMS = {
    BLUNT: 0,
    FIRE: 1,
    EARTH: 2,
    SPOOKY: 3,
    PIERCE: 4,
    LIGHTNING: 5,
    FROST: 6,
    RIGHTEOUS: 7,
    SLASH: 8,
    WIND: 9,
    SORCERY: 10,
    WILD: 11
} as const;

export const ATTACK_TYPE_NUMS = {
    PHYSICAL: 0,
    MAGIC: 1
} as const;

export const DEFENSE_TYPE_NUMS = {
    PLATE_MAIL: 0,
    CHAIN_MAIL: 1,
    LEATHER_MAIL: 2,
    LEATHER_CLOTH: 3
} as const;

export const LOCATION_NUMS = {
    head: 0,
    chest: 1,
    legs: 2
} as const;

export const MASTERY = {
    CONSTITUTION: "constitution",
    STRENGTH: "strength",
    AGILITY: "agility",
    ACHRE: "achre",
    CAEREN: "caeren",
    KYOSIR: "kyosir"
};
export const HOLD_TYPES = { ONE_HAND: "One Hand", TWO_HAND: "Two Hand" };
export const THRESHOLD = {ONE_HAND: 100, TWO_HAND: 150};

export const DUAL_ELIGIBILITY = {
    [HOLD_TYPES.ONE_HAND]: {
        [ATTACK_TYPES.PHYSICAL]: {
            attribute: "totalAgility",
            threshold: THRESHOLD.ONE_HAND,
            offCondition: (offWeapon: Equipment) => offWeapon.grip === HOLD_TYPES.ONE_HAND && offWeapon.attackType === ATTACK_TYPES.PHYSICAL
        },
        [ATTACK_TYPES.MAGIC]: {
            attribute: "totalAchre",
            threshold: THRESHOLD.ONE_HAND,
            offCondition: (offWeapon: Equipment) => offWeapon.grip === HOLD_TYPES.ONE_HAND && offWeapon.attackType === ATTACK_TYPES.MAGIC
        }
    },
    [HOLD_TYPES.TWO_HAND]: {
        [ATTACK_TYPES.PHYSICAL]: {
            attribute: "totalStrength",
            threshold: THRESHOLD.TWO_HAND,
            offCondition: (offWeapon: Equipment) => offWeapon.type !== WEAPON_TYPES.BOW && offWeapon.type !== WEAPON_TYPES.GREATBOW && offWeapon.attackType === ATTACK_TYPES.PHYSICAL
        },
        [ATTACK_TYPES.MAGIC]: {
            attribute: "totalCaeren",
            threshold: THRESHOLD.TWO_HAND,
            offCondition: (offWeapon: Equipment) => offWeapon.type !== WEAPON_TYPES.BOW && offWeapon.type !== WEAPON_TYPES.GREATBOW && offWeapon.attackType === ATTACK_TYPES.MAGIC
        }
    }
};

export const ATTACK_LOOKUP = {
    [HOLD_TYPES.ONE_HAND]: {
        [ATTACK_TYPES.MAGIC]: {
            [MASTERY.ACHRE]: {
                MAGICAL: DAMAGE.ONE_THIRTY,
                PHYSICAL: DAMAGE.ONE_FIFTEEN
            },
            [MASTERY.KYOSIR]: {
                MAGICAL: DAMAGE.ONE_THIRTY,
                PHYSICAL: DAMAGE.ONE_FIFTEEN
            },
        },
        [ATTACK_TYPES.PHYSICAL]: {
            [MASTERY.AGILITY]: {
                MAGICAL: DAMAGE.ONE_FIFTEEN,
                PHYSICAL: DAMAGE.ONE_THIRTY
            },
            [MASTERY.CONSTITUTION]: {
                MAGICAL: DAMAGE.ONE_FIFTEEN,
                PHYSICAL: DAMAGE.ONE_THIRTY
            },
        }
    },
    [HOLD_TYPES.TWO_HAND]: {
        [ATTACK_TYPES.MAGIC]: {
            [MASTERY.CAEREN]: {
                MAGICAL: DAMAGE.ONE_THIRTY,
                PHYSICAL: DAMAGE.ONE_FIFTEEN
            },
            [MASTERY.KYOSIR]: {
                MAGICAL: DAMAGE.ONE_THIRTY,
                PHYSICAL: DAMAGE.ONE_FIFTEEN
            },
        },
        [ATTACK_TYPES.PHYSICAL]: {
            [MASTERY.STRENGTH]: {
                MAGICAL: DAMAGE.ONE_FIFTEEN,
                PHYSICAL: DAMAGE.ONE_THIRTY
            },
            [MASTERY.CONSTITUTION]: {
                MAGICAL: DAMAGE.ONE_FIFTEEN,
                PHYSICAL: DAMAGE.ONE_THIRTY
            },
        }
    }
};

export const ACTION_MULTIPLIER_LOOKUP: { [key: string]: { physical: number; magical: number } } = {
    [ACTION_TYPES.ACHIRE]: { physical: DAMAGE.ONE_TWENTY_FIVE, magical: DAMAGE.ONE_TWENTY_FIVE },
    [ACTION_TYPES.ARC]: { physical: DAMAGE.TWO, magical: DAMAGE.TWO },
    [ACTION_TYPES.LEAP]: { physical: DAMAGE.ONE_TWENTY_FIVE, magical: DAMAGE.ONE_TWENTY_FIVE },
    [ACTION_TYPES.QUOR]: { physical: DAMAGE.TWO, magical: DAMAGE.TWO },
    [ACTION_TYPES.RUSH]: { physical: DAMAGE.ONE_TWENTY_FIVE, magical: DAMAGE.ONE_TWENTY_FIVE },
    [ACTION_TYPES.WRITHE]: { physical: DAMAGE.ONE_TWENTY_FIVE, magical: DAMAGE.ONE_TWENTY_FIVE },
    [ACTION_TYPES.STORM]: { physical: DAMAGE.SEVENTY_FIVE, magical: DAMAGE.SEVENTY_FIVE },
    [ACTION_TYPES.THRUST]: { physical: DAMAGE.SEVENTY_FIVE, magical: DAMAGE.SEVENTY_FIVE },
};

export const DAMAGE_TYPE_DIALOG: {[key:string]: {description:string;types:string;}} = {
    Blunt: {
        description: "The damage types equivalency, governed through harsh and brutal attacks.",
        types: "Blunt, Earth, Fire, Spooky"
    },
    Pierce: {
        description: "The damage types equivalency, governed through sharp and impaling attacks.",
        types: "Pierce, Frost, Lightning, Righteous"
    },
    Slash: {
        description: "The damage types equivalency, governed through its own mercurial nature.",
        types: "Slash, Sorcery, Wild, Wind"
    }
};

export const deriveArmorTypeToArrayLocation = (type: string): number => {
    switch (type) {
        case "Plate-Mail":
            return 0;
        case "Chain-Mail":
            return 1;
        case "Leather-Mail":
            return 2;
        case "Leather-Cloth":
            return 3;
    }
    return 0;
};

// Structure: LOOKUP[damageType][attackType][location][defenseType] = multiplier
export const DAMAGE_LOOKUP: number[][][] = [
    // BLUNT (0)
    [
        [1.15, 1.08, 0.92, 0.85], // head: [PLATE, CHAIN, LEATHER, CLOTH]
        [1.10, 1.05, 0.95, 0.90], // chest 
        [1.05, 1.03, 0.97, 0.95]  // legs
    ],
    // FIRE (1) - same as blunt
    [
        [1.15, 1.08, 0.92, 0.85],
        [1.10, 1.05, 0.95, 0.90],
        [1.05, 1.03, 0.97, 0.95]
    ],
    // EARTH (2) - same as blunt
    [
        [1.15, 1.08, 0.92, 0.85],
        [1.10, 1.05, 0.95, 0.90],
        [1.05, 1.03, 0.97, 0.95]
    ],
    // SPOOKY (3) - same as blunt
    [
        [1.15, 1.08, 0.92, 0.85],
        [1.10, 1.05, 0.95, 0.90],
        [1.05, 1.03, 0.97, 0.95]
    ],
    // PIERCE (4)
    [
        [0.85, 0.92, 1.08, 1.15],
        [0.90, 0.95, 1.05, 1.10],
        [0.95, 0.97, 1.03, 1.05]
    ],
    // LIGHTNING (5) - same as pierce
    [
        [0.85, 0.92, 1.08, 1.15],
        [0.90, 0.95, 1.05, 1.10],
        [0.95, 0.97, 1.03, 1.05]
    ],
    // FROST (6) - same as pierce
    [
        [0.85, 0.92, 1.08, 1.15],
        [0.90, 0.95, 1.05, 1.10],
        [0.95, 0.97, 1.03, 1.05]
    ],
    // RIGHTEOUS (7) - same as pierce
    [
        [0.85, 0.92, 1.08, 1.15], 
        [0.90, 0.95, 1.05, 1.10], 
        [0.95, 0.97, 1.03, 1.05]
    ],
    // SLASH (8)
    [
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97]
    ],
    // WIND (9) - same as slash
    [
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97]
    ],
    // SORCERY (10) - same as slash
    [
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97]
    ],
    // WILD (11) - same as slash
    [
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97], 
        [0.90, 0.92, 0.95, 0.97]
    ]
];

export const DAMAGE_TYPES = {
    BLUNT: "Blunt",
    PIERCE: "Pierce",
    SLASH: "Slash",
    EARTH: "Earth",
    FIRE: "Fire",
    FROST: "Frost",
    LIGHTNING: "Lightning",
    RIGHTEOUS: "Righteous",
    SORCERY: "Sorcery",
    SPOOKY: "Spooky",
    WIND: "Wind",
    WILD: "Wild",
};
export const DEFENSE_TYPES = {
    LEATHER_CLOTH: "Leather-Cloth",
    LEATHER_MAIL: "Leather-Mail",
    CHAIN_MAIL: "Chain-Mail",
    PLATE_MAIL: "Plate-Mail"
};

export const DAMAGE_TYPE_TO_NUM = new Map([
    [DAMAGE_TYPES.BLUNT, DAMAGE_TYPE_NUMS.BLUNT],
    [DAMAGE_TYPES.FIRE, DAMAGE_TYPE_NUMS.BLUNT], // Same as blunt
    [DAMAGE_TYPES.EARTH, DAMAGE_TYPE_NUMS.BLUNT], // Same as blunt  
    [DAMAGE_TYPES.SPOOKY, DAMAGE_TYPE_NUMS.BLUNT], // Same as blunt
    [DAMAGE_TYPES.PIERCE, DAMAGE_TYPE_NUMS.PIERCE],
    [DAMAGE_TYPES.LIGHTNING, DAMAGE_TYPE_NUMS.PIERCE], // Same as pierce
    [DAMAGE_TYPES.FROST, DAMAGE_TYPE_NUMS.PIERCE], // Same as pierce
    [DAMAGE_TYPES.RIGHTEOUS, DAMAGE_TYPE_NUMS.PIERCE], // Same as pierce
    [DAMAGE_TYPES.SLASH, DAMAGE_TYPE_NUMS.SLASH],
    [DAMAGE_TYPES.WIND, DAMAGE_TYPE_NUMS.SLASH], // Same as slash
    [DAMAGE_TYPES.SORCERY, DAMAGE_TYPE_NUMS.SLASH], // Same as slash
    [DAMAGE_TYPES.WILD, DAMAGE_TYPE_NUMS.SLASH] // Same as slash
]);

export const ATTACK_TYPE_TO_NUM = new Map([
    [ATTACK_TYPES.PHYSICAL, ATTACK_TYPE_NUMS.PHYSICAL],
    [ATTACK_TYPES.MAGIC, ATTACK_TYPE_NUMS.MAGIC]
]);

export const DEFENSE_TYPE_TO_NUM = new Map([
    [DEFENSE_TYPES.PLATE_MAIL, DEFENSE_TYPE_NUMS.PLATE_MAIL],
    [DEFENSE_TYPES.CHAIN_MAIL, DEFENSE_TYPE_NUMS.CHAIN_MAIL],
    [DEFENSE_TYPES.LEATHER_MAIL, DEFENSE_TYPE_NUMS.LEATHER_MAIL],
    [DEFENSE_TYPES.LEATHER_CLOTH, DEFENSE_TYPE_NUMS.LEATHER_CLOTH]
]);

export const LOCATION_TO_NUM = new Map([
    ["head", LOCATION_NUMS.head],
    ["chest", LOCATION_NUMS.chest], 
    ["legs", LOCATION_NUMS.legs]
]);

export const ENEMY_ATTACKS = {
    achire: "achires into",
    attack: "attacks",
    hook: "hooks into",
    leap: "leaps onto",
    parry: "parries",
    posture: "postures against",
    roll: "rolls into",
    quor: "quorses through",
    rush: "rushes through",
    storm: "storms through",
    thrust: "thrusts",
    writhe: "writhes into",
};

export const STRONG_ATTACKS = ["achire", "attack", "arc", "leap", "quor", "rush", "special", "storm", "writhe"];
export const STRONG_TYPES: {[key:string]: string[]} = {
    "Leather-Cloth": ["Frost","Lightning","Righteous","Pierce"],
    "Leather-Mail": ["Pierce","Slash","Wind","Sorcery","Wild"],
    "Chain-Mail": ["Blunt","Slash","Sorcery","Wind","Wild"],
    "Plate-Mail": ["Blunt","Earth","Fire","Spooky"],
};

export const WEAPON_TYPES = {
    BOW: "Bow",
    GREATBOW: "Greatbow"
};

export const DEITIES = {DAETHOS: "Daethos"};
export const FAITH_RARITY: {[key: string]: number} = {
    "Common": 0,
    "Uncommon": 0.5,
    "Rare": 1,
    "Epic": 2,
    "Legendary": 3
};

export const CHIOMISM = 100;
export const DEVOUR = 150;
export const SACRIFICE = 75;
export const SUTURE = 200;

export const GLANCING_MULTIPLIERS = [
    // threshold differences: 
    // [80+, 75-79, 70-74, 65-69, 60-64, 55-59, 50-54, 45-49, 40-44, 35-39, 30-34, 25-29, 20-24]
    0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7
];

export const ENEMY_PRAYERS = [PRAYERS.BUFF, PRAYERS.DAMAGE, PRAYERS.DEBUFF, PRAYERS.HEAL];