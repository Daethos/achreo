export const ARMOR_WEIGHT: any = {helmet:2,chest:1.5,legs:1};
export const ATTACKS = {
    achire: 'achire',
    attack: 'attack',
    hook: 'hook',
    parry: 'parry',
    posture: 'posture against',
    roll: 'roll into',
    quor: 'quorse through',
    leap: 'leap onto',
    rush: 'rush through',
    storm: 'storm through',
    thrust: 'thrust attack',
    writhe: 'writhe into',
};
export const ACTION_TYPES = {
    ACHIRE: "achire",
    ARC: "arc",
    ATTACK: "attack",
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
    CAERENEIC_NEG: 1.25,
    CAERENEIC_POS: 1.15,
    STALWART: 0.85,
    NEG_LOW: 0.75,
    NEG_HIGH: 0.9,
    LOW: 1.1,
    MID: 1.15,
    HIGH: 1.3,
    ONE_FIFTY: 1.5,
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
export const ENEMY_ATTACKS = {
    attack: 'attacks',
    posture: 'postures against',
    roll: 'rolls into',
    parry: 'parries',
    achire: 'achires into',
    hook: 'hooks into',
    leap: 'leaps onto',
    quor: 'quorses through',
    rush: 'rushes through',
    thrust: 'thrust attacks',
    writhe: 'writhes into',
};
export const MASTERY = {
    CONSTITUTION: 'constitution',
    STRENGTH: 'strength',
    AGILITY: 'agility',
    ACHRE: 'achre',
    CAEREN: 'caeren',
    KYOSIR: 'kyosir'
};
export const STRONG_ATTACKS = ['achire', 'attack', 'arc', 'leap', 'quor', 'rush', 'special', 'storm', 'writhe'];
export const STRONG_TYPES = {
    "Leather-Cloth": ["Frost","Lightning","Righteous","Pierce"],
    "Leather-Mail": ["Pierce","Slash","Wind","Sorcery","Wild"],
    "Chain-Mail": ["Blunt","Slash","Sorcery","Wind","Wild"],
    "Plate-Mail": ["Blunt","Earth","Fire","Spooky"],
};
export const HOLD_TYPES = { ONE_HAND: "One Hand", TWO_HAND: "Two Hand" };
export const THRESHOLD = {ONE_HAND: 100, TWO_HAND: 150};
export const WEAPON_TYPES = {
    BOW: "Bow",
    GREATBOW: "Greatbow"
};
export const DEITIES = {DAETHOS: "Daethos"};
export const FAITH_RARITY = {
    'Common': 0,
    'Uncommon': 0.5,
    'Rare': 1,
    'Epic': 2,
    'Legendary': 3
};