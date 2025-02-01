import { States } from "../game/phaser/StateMachine";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";

export const PHYSICAL_ACTIONS = ['attack', 'posture', 'thrust'];
export const PHYSICAL_EVASIONS = ['dodge', 'roll'];
const COST = {LOW: 25, MID: 50, HIGH: 75};
const DURATION = {BOTTOM: 750, STANDARD: 1500, ONE: 1000, THREE: 3000, FIVE: 5000, MODERATE: 6000, HIGH: 8000, TEN: 10000};

export const PLAYER = {
    ACTION_WEIGHT: {
        ATTACK: 60,
        POSTURE: 45,
        ROLL: 30,
        PARRY: 20,
        THRUST: 5,
    },
    COLLIDER: {
        DISPLACEMENT: 16,
        HEIGHT: 32,
        WIDTH: 16,
    },
    DISTANCE: {
        MIN: 0,
        ATTACK: 50,
        MOMENTUM: 2,
        THRESHOLD: 75,
        CHASE: 75,
        RANGED_ALIGNMENT: 25,
        RANGED_MULTIPLIER: 3,
        DODGE: 1152, // 2304
        ROLL: 960, // 1920
    },
    DODGE: { // 8*
        DISTANCE: 240, // 2800, // 126 || 2304
        DURATION: 350, // 18 || 288
        MULTIPLIER: 9,
    },
    ROLL: { // 6*
        DISTANCE: 160, // 1920, // 140
        DURATION: 320, // 20
        MULTIPLIER: 6,
    },
    SPEED: {
        INITIAL: 1.5, // 1.75
        ACCELERATION: 0.5,
        DECELERATION: 0.05,
        CAERENIC: 0.5,
        SLOW: 1,
        SNARE: 1.5,
        SPRINT: 1.5,
        STEALTH: 0.5,
        LEAP: 300,
        BLINK: 250,
        RUSH: 300,
    },  
    SCALE: {
        SELF: 0.8,
        SHIELD: 0.6,
        WEAPON_ONE: 0.5,
        WEAPON_TWO: 0.65,
    },
    SENSOR: {
        COMBAT: 40, // 40
        DEFAULT: 40, // 40
        DISPLACEMENT: 12,
        EVADE: 21,
    },
    STAMINA: {
        // Physical
        ATTACK: 20,
        DODGE: 10, // 25
        PARRY: 10,
        POSTURE: 15,
        ROLL: 15, // 25
        THRUST: 15,
        CONTEMPLATE: 0,
        COMPUTER_ATTACK: 15,
        COMPUTER_DODGE: 5,
        COMPUTER_PARRY: 5,
        COMPUTER_POSTURE: 10,
        COMPUTER_ROLL: 10,
        COMPUTER_THRUST: 10,

        // Magical
        // Low Cost        
        INVOKE: -COST.LOW,
        CONSUME: 0,

        ACHIRE: COST.LOW,
        ARC: COST.LOW,
        BLINK: COST.LOW,
        CONFUSE: COST.LOW,
        DISPEL: COST.LOW,
        FEAR: COST.LOW,
        HEALING: COST.LOW,
        ILIRECH: COST.LOW,
        LEAP: COST.LOW,
        MAIERETH: COST.LOW,
        PARALYZE: COST.LOW,
        POLYMORPH: COST.LOW,
        ROOT: COST.LOW,
        RUSH: COST.LOW,
        SHIMMER: COST.LOW,
        SHIRK: COST.LOW,
        SLOW: COST.LOW,
        SPRINT: COST.LOW,
        

        HOOK: COST.LOW,
        MARK: COST.LOW,
        NETHERSWAP: COST.LOW,
        RECALL: COST.LOW,

        // Moderate Cost
        KYNISOS: COST.MID,
        KYRNAICISM: COST.MID,
        PURSUIT: COST.MID,
        SHADOW: COST.MID,
        QUOR: COST.MID,
        RECONSTITUTE: COST.MID,
        SACRIFICE: COST.MID,
        SNARE: COST.MID,
        STORM: COST.MID,
        SUTURE: COST.MID,
        TETHER: COST.MID,
        // High Cost
        ASTRAVE: COST.HIGH,
        DESPERATION: COST.HIGH,
        FYERUS: COST.HIGH,
        TSHAERAL: COST.HIGH,

        // Trait
        ENDURANCE: 0,
        ASTRICATION: COST.LOW,
        BERSERK: COST.LOW,
        CONVICTION: COST.LOW,
        IMPERMANENCE: COST.LOW,
        SEER: COST.LOW,
        STIMULATE: COST.LOW,
        BLIND: COST.MID,
        CAERENESIS: COST.HIGH,
        DEVOUR: COST.HIGH,

        // AoE
        CHIOMIC: COST.MID,  
        DISEASE: COST.MID,
        FREEZE: COST.MID,
        HOWL: COST.MID,
        RENEWAL: COST.MID,
        SCREAM: COST.MID,
        WRITHE: COST.MID,

        // Bubble
        ABSORB: 0,
        ENVELOP: 0,
        MALICE: COST.MID,
        MENACE: COST.MID,
        MEND: COST.MID,
        MODERATE: COST.LOW,
        MULTIFARIOUS: COST.MID,
        MYSTIFY: COST.MID,
        PROTECT: COST.HIGH,
        RECOVER: COST.LOW,
        REIN: 0,
        SHIELD: COST.HIGH,
        WARD: COST.MID,
    },
    COOLDOWNS: {
        SHORT: 6000,
        MODERATE: 10000,
        LONG: 15000,
    },
    DURATIONS: {
        ABSORB: DURATION.HIGH,
        ACHIRE: DURATION.STANDARD,
        ASTRAVE: DURATION.STANDARD,
        ARCING: DURATION.THREE,
        CHIOMIC: DURATION.ONE,
        CONFUSE: DURATION.ONE,
        DEFEATED: DURATION.HIGH,
        DESPERATION: DURATION.BOTTOM,
        DISEASE: DURATION.MODERATE,
        ENVELOP: DURATION.HIGH,
        FEAR: DURATION.STANDARD,
        FYERUS: DURATION.MODERATE,
        FREEZE: DURATION.BOTTOM,
        HEALING: DURATION.STANDARD,
        HOOK: DURATION.STANDARD,
        HOWL: DURATION.ONE,
        ILIRECH: DURATION.STANDARD,
        KYNISOS: DURATION.ONE,
        KYRNAICISM: DURATION.THREE,
        LEAP: DURATION.BOTTOM,
        MAIERETH: DURATION.ONE,
        MALICE: DURATION.HIGH,
        MENACE: DURATION.HIGH,
        MEND: DURATION.HIGH,
        MODERATE: DURATION.HIGH,
        MULTIFARIOUS: DURATION.HIGH,
        MYSTIFY: DURATION.HIGH,
        PROTECT: DURATION.MODERATE,
        POLYMORPH: DURATION.STANDARD,
        PARALYZE: DURATION.STANDARD,
        PURSUIT: DURATION.BOTTOM,
        QUOR: DURATION.THREE,
        RECONSTITUTE: DURATION.FIVE,
        RECOVER: DURATION.HIGH,
        REIN: DURATION.HIGH,
        RENEWAL: DURATION.MODERATE,
        ROOTING: DURATION.ONE,
        RUSH: DURATION.BOTTOM,
        SACRIFICE: DURATION.BOTTOM,
        SCREAM: DURATION.ONE,
        SHIELD: DURATION.HIGH,
        SHIMMER: DURATION.MODERATE,
        SNARE: DURATION.ONE,
        SPRINT: DURATION.MODERATE,
        STORM: DURATION.THREE,
        STUNNED: 2500,
        TEXT: DURATION.STANDARD,
        TSHAERAL: 2000,
        WARD: DURATION.HIGH,
        WRITHE: DURATION.ONE,
        // Trait
        ASTRICATION: DURATION.HIGH, // -1
        BERSERK: DURATION.HIGH,
        BLIND: DURATION.ONE,
        CAERENESIS: DURATION.ONE,
        CONVICTION: DURATION.HIGH,
        DEVOUR: 2000,
        ENDURANCE: 5000,
        IMPERMANENCE: DURATION.HIGH, // -1
        NEGATION: DURATION.HIGH, // -1
        SEER: DURATION.HIGH, // -1
        STIMULATE: DURATION.STANDARD,
        // Negative Durations
        SNARED: 5000,
        SLOWED: 5000,
    },
    RANGE: {
        SHORT: 200,
        MODERATE: 350,
        LONG: 500,
    },
};

// ELEMENT IN ARRAY

// [0]: Critical Heal
// [1]: Casual Heal
// [2]: Starter Heal

// [3]: Critical Damage
// [4]: Casual Damage
// [5]: Starter Damage

// [6]: Melee < 75 Distance
// [7]: Ranged < 75 Distance

// [8]: Melee > 75 && < 150 Distance
// [9]: Ranged > 75 && < 150 Distance

// [10]: Melee > 150 Distance && Distance < 225
// [11]: Ranged > 150 Distance && Distance < 225

// [12]: Melee > 225 Distance
// [13]: Ranged > 225 Distance

// Currently 14 'Instincts' and 16 Options + Invoke

const STATE = "stateMachine";
const POSITIVE = "positiveMachine";

export const PLAYER_INSTINCTS = {
    'constitution': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: STATE,
            value: States.HEALING
        },{ // 2 - Starter Heal
            key: STATE,
            value: States.INVOKE
        },{ // 3 - Critical Damage
            key: STATE,
            value: States.MAIERETH
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.ILIRECH
        },{ // 5 - Starter Damage
            key: STATE,
            value: States.KYRNAICISM
        },{ // 6 - Melee < 100 Distance
            key: POSITIVE,
            value: States.DISEASE
        },{ // 7 - Ranged < 100 Distance
            key: POSITIVE,
            value: States.RENEWAL
        },{ // 8 - Melee > 100 && < 200 Distance
            key: POSITIVE,
            value: States.TETHER
        },{ // 9 - Ranged > 100 && < 200 Distance
            key: STATE,
            value: States.PARALYZE
        },{ // 10 - Melee > 200 Distance && Distance < 300
            key: POSITIVE,
            value: States.WARD
        },{ // 11 - Ranged > 200 Distance && Distance < 300
            key: POSITIVE,
            value: States.SHIELD
        },{ // 12 - Melee > 300 Distance
            key: POSITIVE,
            value: States.ABSORB
        },{ // 13 - Ranged > 300 Distance
            key: STATE,
            value: States.WARD
        }
    ],
    'strength': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: STATE,
            value: States.DEVOUR
        },{ // 2 - Starter Heal
            key: STATE,
            value: States.INVOKE
        },{ // 3 - Critical Damage
            key: STATE,
            value: States.RUSH
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.STORM
        },{ // 5 - Starter Damage
            key: POSITIVE,
            value: States.RECOVER
        },{ // 6 - Melee < 100 Distance
            key: POSITIVE,
            value: States.WRITHE
        },{ // 7 - Ranged < 100 Distance
            key: POSITIVE,
            value: States.HOWL
        },{ // 8 - Melee > 100 && < 200 Distance
            key: POSITIVE,
            value: States.SPRINTING
        },{ // 9 - Ranged > 100 && < 200 Distance
            key: POSITIVE,
            value: States.SPRINTING
        },{ // 10 - Melee > 200 Distance && Distance < 300
            key: STATE,
            value: States.LEAP
        },{ // 11 - Ranged > 200 Distance && Distance < 300
            key: STATE,
            value: States.QUOR
        },{ // 12 - Melee > 300 Distance
            key: POSITIVE,
            value: States.HOOK
        },{ // 13 - Ranged > 300 Distance
            key: STATE,
            value: States.WARD
        }
    ],
    'agility': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: POSITIVE,
            value: States.ENVELOP
        },{ // 2 - Starter Heal
            key: STATE,
            value: States.INVOKE
        },{ // 3 - Critical Damage
            key: STATE,
            value: States.RUSH
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.STORM
        },{ // 5 - Starter Damage
            key: POSITIVE,
            value: States.SPRINTING
        },{ // 6 - Melee < 100 Distance
            key: POSITIVE,
            value: States.WRITHE
        },{ // 7 - Ranged < 100 Distance
            key: STATE,
            value: States.PURSUIT
        },{ // 8 - Melee > 100 && < 200 Distance
            key: POSITIVE,
            value: States.RECOVER
        },{ // 9 - Ranged > 100 && < 200 Distance
            key: POSITIVE,
            value: States.RECOVER
        },{ // 10 - Melee > 200 Distance && Distance < 300
            key: POSITIVE,
            value: States.SHADOW
        },{ // 11 - Ranged > 200 Distance && Distance < 300
            key: STATE,
            value: States.ACHIRE
        },{ // 12 - Melee > 300 Distance
            key: POSITIVE,
            value: States.LEAP
        },{ // 13 - Ranged > 300 Distance
            key: STATE,
            value: States.ACHIRE
        }
    ],
    'achre': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.HEALING
        },{ // 1 - Casual Heal
            key: STATE,
            value: States.RECONSTITUTE
        },{ // 2 - Starter Heal
            key: STATE,
            value: States.INVOKE
        },{ // 3 - Critical Damage
            key: STATE,
            value: States.ASTRAVE
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.ACHIRE
        },{ // 5 - Starter Damage
            key: STATE,
            value: States.SLOW
        },{ // 6 - Melee < 100 Distance
            key: POSITIVE,
            value: States.FREEZE
        },{ // 7 - Ranged < 100 Distance
            key: STATE,
            value: States.SNARE
        },{ // 8 - Melee > 100 && < 200 Distance
            key: POSITIVE,
            value: States.MODERATE
        },{ // 9 - Ranged > 100 && < 200 Distance
            key: POSITIVE,
            value: States.MULTIFARIOUS
        },{ // 10 - Melee > 200 Distance && Distance < 300
            key: STATE,
            value: States.BLINK
        },{ // 11 - Ranged > 200 Distance && Distance < 300
            key: STATE,
            value: States.FYERUS
        },{ // 12 - Melee > 300 Distance
            key: POSITIVE,
            value: States.ABSORB
        },{ // 13 - Ranged > 300 Distance
            key: STATE,
            value: States.QUOR
        }
    ],
    'caeren': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.HEALING
        },{ // 1 - Casual Heal
            key: POSITIVE,
            value: States.MEND
        },{ // 2 - Starter Heal
            key: STATE,
            value: States.INVOKE
        },{ // 3 - Critical Damage
            key: STATE,
            value: States.SACRIFICE
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.ILIRECH
        },{ // 5 - Starter Damage
            key: STATE,
            value: States.KYRNAICISM
        },{ // 6 - Melee < 100 Distance
            key: POSITIVE,
            value: States.SCREAM
        },{ // 7 - Ranged < 100 Distance
            key: STATE,
            value: States.FEAR
        },{ // 8 - Melee > 100 && < 200 Distance
            key: POSITIVE,
            value: States.MALICE
        },{ // 9 - Ranged > 100 && < 200 Distance
            key: STATE,
            value: States.ASTRAVE
        },{ // 10 - Melee > 200 Distance && Distance < 300
            key: STATE,
            value: States.SHIRK
        },{ // 11 - Ranged > 200 Distance && Distance < 300
            key: STATE,
            value: States.FYERUS
        },{ // 12 - Melee > 300 Distance
            key: STATE,
            value: States.SHIRK
        },{ // 13 - Ranged > 300 Distance
            key: STATE,
            value: States.MENACE
        }
    ],
    'kyosir': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.RECONSTITUTE
        },{ // 1 - Casual Heal
            key: STATE,
            value: States.HEALING
        },{ // 2 - Starter Heal
            key: STATE,
            value: States.SUTURE
        },{ // 3 - Critical Damage
            key: STATE,
            value: States.SACRIFICE
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.MAIERETH
        },{ // 5 - Starter Damage
            key: STATE,
            value: States.INVOKE
        },{ // 6 - Melee < 100 Distance
            key: POSITIVE,
            value: States.CHIOMIC
        },{ // 7 - Ranged < 100 Distance
            key: POSITIVE,
            value: States.CHIOMIC
        },{ // 8 - Melee > 100 && < 200 Distance
            key: STATE,
            value: States.CONFUSE
        },{ // 9 - Ranged > 100 && < 200 Distance
            key: STATE,
            value: States.KYRNAICISM
        },{ // 10 - Melee > 200 Distance && Distance < 300
            key: STATE,
            value: States.HOOK
        },{ // 11 - Ranged > 200 Distance && Distance < 300
            key: STATE,
            value: States.MAIERETH
        },{ // 12 - Melee > 300 Distance
            key: POSITIVE,
            value: States.MYSTIFY
        },{ // 13 - Ranged > 300 Distance
            key: STATE,
            value: States.PROTECT
        }
    ]
};

export const BALANCED = "Balance";
export const DEFENSIVE = "Defensive";
export const OFFENSIVE = "Offensive";

export const BALANCED_INSTINCTS = {
    "constitution": [States.INVOKE, States.ILIRECH, States.KYNISOS, States.PARALYZE, States.WARD],
    "strength": [States.INVOKE, States.RECOVER, States.SPRINTING, States.STORM, States.WARD],
    "agility": [States.INVOKE, States.ACHIRE, States.KYNISOS, States.RECOVER, States.SPRINTING],
    "achre": [States.INVOKE, States.ACHIRE, States.BLINK, States.FYERUS, States.REIN, States.SLOW],
    "caeren": [States.INVOKE, States.FEAR, States.ILIRECH, States.HEALING, States.SCREAM],
    "kyosir": [States.INVOKE, States.CONFUSE, States.DISPEL, States.KYNISOS, States.SUTURE],
};
export const DEFENSIVE_INSTINCTS = {
    "constitution": [States.ABSORB, States.HEALING, States.INVOKE, States.KYRNAICISM, States.SHIELD, States.SHIRK],
    "strength": [States.INVOKE, States.DESPERATION, States.HOWL, States.SPRINTING, States.WARD],
    "agility": [States.INVOKE, States.DESPERATION, States.ENVELOP, States.RECOVER, States.SHIMMER, States.SNARE],
    "achre": [States.INVOKE, States.ABSORB, States.BLINK, States.DESPERATION, States.MODERATE, States.SLOW],
    "caeren": [States.INVOKE, States.DESPERATION, States.FEAR, States.KYRNAICISM, States.MEND],
    "kyosir": [States.CONFUSE, States.DESPERATION, States.HEALING, States.MYSTIFY, States.PROTECT, States.SUTURE],
};
export const OFFENSIVE_INSTINCTS = {
    "constitution": [States.DISPEL, States.ILIRECH, States.KYNISOS, States.KYRNAICISM, States.MAIERETH, States.PARALYZE],
    "strength": [States.INVOKE, States.LEAP, States.QUOR, States.RECOVER, States.RUSH, States.SPRINTING, States.STORM],
    "agility": [States.INVOKE, States.ACHIRE, States.KYNISOS, States.RECOVER, States.SPRINTING, States.STORM],
    "achre": [States.INVOKE, States.ACHIRE, States.ASTRAVE, States.BLINK, States.FYERUS, States.QUOR, States.REIN],
    "caeren": [States.INVOKE, States.ACHIRE, States.ASTRAVE, States.MALICE, States.KYRNAICISM, States.SACRIFICE],
    "kyosir": [States.INVOKE, States.DISPEL, States.MAIERETH, States.MALICE, States.SACRIFICE],
};

export const STAMINA = ['attack', 'posture', 'roll', 'dodge', 'parry', 'thrust'];
export const staminaCheck = (stamina: number, cost: number): { success: boolean; cost: number } => {
    let success: boolean = stamina >= cost;
    return { success, cost };
};

export type faction = {
    name: string; // Name of faction type and functional key for factions[] array
    reputation: number; // 0 - 100. Higher reputation opens up dialog, quests, and trade
    named: boolean; // Unique enemies
    aggressive: boolean; // Attacks first if true
    betrayed: boolean; // Betrayed = went from aggressive = false to true, Permanent = always aggressive, no dialog
    faith: string; // Adherent || Devoted
    dialog: number; // Reputation threshold to enable dialog option
};

export const ACHREON_DRUID = "Achreon Druid";
export const AHNARE_APOSTLE = "Ahn'are Apostle";
export const ANASHTRE = "Anashtre";
export const ASTRAL_APOSTLE = "Astral Apostle";
export const CAMBIREN_DRUID = "Cambiren Druid";
export const CHIOMIC_JESTER = "Chiomic Jester";
export const DAETHIC_INQUISITOR = "Daethic Inquisitor";
export const DAETHIC_KNIGHT = "Daethic Knight";
export const FANG_DUELIST = "Fang Duelist";
export const FANG_MERCENARY = "Fang Mercenary";
export const FIRESWORN = "Firesworn";
export const FYERS_OCCULTIST = "Fyers Occultist";
export const ILIRE_OCCULTIST = "Ilire Occultist";
export const KINGSMAN = "Kingsman";
export const KYNGIAN_SHAMAN = "Kyn'gian Shaman";
export const KYRISIAN_OCCULTIST = "Kyrisian Occultist";
export const LIIVI_LEGIONNAIRE = "Li'ivi Legionnaire";
export const MAIER_OCCULTIST = "Ma'ier Occultist";
export const MARAUDER = "Marauder";
export const MAVROSIN_OCCULTIST = "Mavrosin Occultist";
export const NORTHREN_WANDERER = "Northren Wanderer";
export const NYREN = "Nyren";
export const OLD_LIIVI_OCCULTIST = "Old Li'ivi Occultist";
export const QUOREITE_OCCULTIST = "Quor'eite Occultist";
export const QUOREITE_STALKER = "Quor'eite Stalker";
export const RAHVREHCUR = "Rahvrehcur";
export const SEDYRIST = "Se'dyrist";
export const SEDYREAL_GUARD = "Sedyreal Guard";
export const SEVA_SHRIEKER = "Se'va Shrieker";
export const SHRYGEIAN_BARD = "Shrygeian Bard";
export const SOUTHRON_WANDERER = "Southron Wanderer";
export const SOVERAIN_BLOOD_CLOAK = "Soverain Blood Cloak";
export const TSHAERAL_SHAMAN = "Tshaeral Shaman";

export const CYRIAN = "Cyrian Shyne";
export const DORIEN = "Dorien Caderyn";
export const EUGENES = "Eugenes";
export const EVRIO = "Evrio Lorian Peroumes";
export const FIEROUS = "Fierous Ashfyre";
export const GARRIS = "Garris Ashenus";
export const KRECEUS = "Kreceus";
export const LEAF = "Leaf";
export const MIRIO = "Mirio";
export const SERA = "Sera Lorian";
export const SYNAETHI = "Synaethi Spiras";
export const TORREOUS = "Torreous Ashfyre";
export const VINCERE = "Vincere";

export const ENEMY_ENEMIES = {
    "Achreon Druid": [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KYNGIAN_SHAMAN, TSHAERAL_SHAMAN, KINGSMAN, NORTHREN_WANDERER, SOVERAIN_BLOOD_CLOAK],
    "Ahn'are Apostle": [ANASHTRE, ASTRAL_APOSTLE, LIIVI_LEGIONNAIRE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KINGSMAN, SOVERAIN_BLOOD_CLOAK],
    "Anashtre": [AHNARE_APOSTLE, ASTRAL_APOSTLE, DAETHIC_KNIGHT, SOVERAIN_BLOOD_CLOAK, LIIVI_LEGIONNAIRE, DAETHIC_INQUISITOR],
    "Astral Apostle": [AHNARE_APOSTLE, ANASHTRE, LIIVI_LEGIONNAIRE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, SOVERAIN_BLOOD_CLOAK, KINGSMAN],
    "Cambiren Druid": [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KYNGIAN_SHAMAN, TSHAERAL_SHAMAN, KINGSMAN, NORTHREN_WANDERER, SOVERAIN_BLOOD_CLOAK],
    "Chiomic Jester": [FANG_DUELIST, FANG_MERCENARY, KYRISIAN_OCCULTIST, MARAUDER, NYREN, RAHVREHCUR, SHRYGEIAN_BARD],
    "Daethic Inquisitor": [AHNARE_APOSTLE, ASTRAL_APOSTLE, ILIRE_OCCULTIST, FYERS_OCCULTIST, MAIER_OCCULTIST, MAVROSIN_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Daethic Knight": [ANASHTRE, FIRESWORN, KYNGIAN_SHAMAN, SEDYREAL_GUARD, SOVERAIN_BLOOD_CLOAK, SEVA_SHRIEKER, QUOREITE_STALKER, TSHAERAL_SHAMAN],
    "Fang Duelist": [CHIOMIC_JESTER, FANG_MERCENARY, KYRISIAN_OCCULTIST, NYREN, MARAUDER, RAHVREHCUR, SHRYGEIAN_BARD],
    "Fang Mercenary": [CHIOMIC_JESTER, FANG_DUELIST, KYRISIAN_OCCULTIST, NYREN, MARAUDER, RAHVREHCUR, SHRYGEIAN_BARD],
    "Firesworn": [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, FANG_MERCENARY, SEDYREAL_GUARD, SEVA_SHRIEKER, QUOREITE_OCCULTIST, QUOREITE_STALKER, SOUTHRON_WANDERER],
    "Fyers Occultist": [DAETHIC_INQUISITOR, ILIRE_OCCULTIST, MAIER_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Ilire Occultist": [DAETHIC_INQUISITOR, FYERS_OCCULTIST, MAIER_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Kingsman": [ACHREON_DRUID, ANASHTRE, CAMBIREN_DRUID, NORTHREN_WANDERER, SOVERAIN_BLOOD_CLOAK],
    "Kyn'gian Shaman": [ACHREON_DRUID, CAMBIREN_DRUID, SOUTHRON_WANDERER, SEDYREAL_GUARD, QUOREITE_STALKER],
    "Kyrisian Occultist": [CHIOMIC_JESTER, FANG_DUELIST, FANG_MERCENARY, MARAUDER, SHRYGEIAN_BARD],
    "Li'ivi Legionnaire": [OLD_LIIVI_OCCULTIST, FIRESWORN, SOVERAIN_BLOOD_CLOAK, KINGSMAN, SEVA_SHRIEKER],
    "Ma'ier Occultist": [DAETHIC_INQUISITOR, FYERS_OCCULTIST, ILIRE_OCCULTIST, MAVROSIN_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Marauder": [FANG_DUELIST, FANG_MERCENARY, CHIOMIC_JESTER, NYREN, RAHVREHCUR, SHRYGEIAN_BARD],
    "Mavrosin Occultist": [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, ILIRE_OCCULTIST, KINGSMAN, MAIER_OCCULTIST, NORTHREN_WANDERER],
    "Northren Wanderer": [ACHREON_DRUID, CAMBIREN_DRUID, MARAUDER, SOUTHRON_WANDERER, KINGSMAN, SOVERAIN_BLOOD_CLOAK],
    "Nyren": [FANG_DUELIST, FANG_MERCENARY, RAHVREHCUR, SEVA_SHRIEKER, MARAUDER, FANG_MERCENARY],
    "Old Li'ivi Occultist": [DAETHIC_INQUISITOR, FYERS_OCCULTIST, ILIRE_OCCULTIST, MAIER_OCCULTIST, QUOREITE_OCCULTIST],
    "Quor'eite Occultist": [DAETHIC_INQUISITOR, FYERS_OCCULTIST, ILIRE_OCCULTIST, MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Quor'eite Stalker": [DAETHIC_KNIGHT, FIRESWORN, SEVA_SHRIEKER, SEDYREAL_GUARD, SOUTHRON_WANDERER],
    "Rahvrehcur": [CHIOMIC_JESTER, NYREN, OLD_LIIVI_OCCULTIST, SEVA_SHRIEKER, MARAUDER, FANG_MERCENARY, SHRYGEIAN_BARD],
    "Se'dyrist": [SEVA_SHRIEKER, FANG_MERCENARY, SEDYREAL_GUARD, FIRESWORN],
    "Sedyreal Guard": [SEDYRIST, SEVA_SHRIEKER, FIRESWORN, FYERS_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, SOUTHRON_WANDERER],
    "Se'va Shrieker": [SEDYRIST, SEDYREAL_GUARD, FIRESWORN, QUOREITE_STALKER, SOUTHRON_WANDERER],
    "Shrygeian Bard": [CHIOMIC_JESTER, FANG_DUELIST, FANG_MERCENARY, MARAUDER, NYREN, RAHVREHCUR],
    "Southron Wanderer": [FIRESWORN, FYERS_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, SEDYREAL_GUARD, SEVA_SHRIEKER],
    "Soverain Blood Cloak": [ANASHTRE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, LIIVI_LEGIONNAIRE, LIIVI_LEGIONNAIRE, KINGSMAN, NORTHREN_WANDERER],
    "Tshaeral Shaman": [ACHREON_DRUID, CAMBIREN_DRUID, DAETHIC_KNIGHT, DAETHIC_INQUISITOR, QUOREITE_STALKER, SEDYREAL_GUARD],

    "Cyrian Shyne": ["King Mathyus Caderyn"],
    "Dorien Caderyn": ["Garris Ashenus"],
    "Eugenes": [""],
    "Evrio Lorian Peroumes": ["Mirio"],
    "Fierous Ashfyre": ["Synaethi Spiras"],
    "Garris Ashenus": ["Dorien Caderyn"],
    "King Mathyus Caderyn": ["Cyrian Shyne"],
    "Kreceus": ["Ahn'are Apostle", "Licivitan Soldier", "Evrio Lorian Peroumes", "Mirio"],
    "Laetrois Ath'Shaorah": ["Mavrios Ilios"],
    "Leaf": ["Kingsman", "Northren Wanderer"],
    "Lorian": ["Mavrios Ilios"],
    "Mavrios Ilios": ["Laetrois Ath'Shaorah", "Lorian"],
    "Mirio": ["Evrio Lorian Peroumes"],
    "Sera Lorian": ["Evrio Lorian Peroumes", "Dorien Caderyn"],
    "Synaethi Spiras": ["Fierous Ashfyre", "Torreous Ashfyre"],
    "Torreous Ashfyre": ["Synaethi Spiras"],
    "Tshios Ash'air": [],
    "Vincere": ["King Mathyus Caderyn", "Dorien Caderyn", "Sera Lorian", "Evrio Lorian Peroumes"]
};
export const NAMED_ENEMY = [
    "Achreus", 
    "Ah'gani",
    "Ashreu'ul", 
    "Caelan Greyne", 
    "Chios Dachreon", 
    "Cyrian Shyne", 
    "Daetheus", 
    "Dorien Caderyn", 
    "Eugenes", 
    "Evrio Lorian Peroumes", 
    "Fierous Ashfyre", 
    "Fyera Ashfyre", 
    "Garris Ashenus", 
    "Jadei Myelle", 
    "King Mathyus Caderyn", 
    "Kreceus", 
    "Lacheo of the Seyr", // Daethic Inquisitor. Mute
    "Laetrois Ath'Shaorah", 
    "Leaf", 
    "Lorian", 
    "Mavros Ilios", 
    "Mirio Lorian Kyr'na", 
    "Myrelle Raiq", 
    "Na'shaer", 
    "Na'shaeri", 
    "Ocelot Greyne",
    "Quir'ilynis",
    "Quoreia Se'vyr",
    "Quor'estes", 
    "Rangiltan Caderyn", 
    "Relien Myelle", 
    "Sedeysus", 
    "Sera Lorian", 
    "Seria Capulo", 
    "Se'teyo Nati",
    "Synaethi Spiras", 
    "Torreous Ashfyre", 
    "Tshios Ash'air", 
    "Vincere"
];

export const namedNameCheck = (name: string) => {
    if (NAMED_ENEMY.includes(name)) {
        return true;
    } else {
        return false;
    };
};

const initFactions: faction[] = [
    {
        name: "Achreon Druid",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Ahn'are Apostle",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Anashtre",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Astral Apostle",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Cambiren Druid",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Chiomic Jester",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Daethic Inquisitor",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Daethic Knight",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Fang Duelist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Fang Mercenary",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Firesworn",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Fyers Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Ilire Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Kingsman",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Kyn'gian Shaman",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Kyrisian Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Licivitan Soldier",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Ma'ier Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Marauder",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Northren Wanderer",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Nyren",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Old Li'ivi Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Quor'eite Occultist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Quor'eite Stalker",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Rahvrehcur",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Se'dyrist",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Sedyreal Guard",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Se'va Shrieker",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Shrygeian Bard",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Southron Wanderer",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Soverain Blood Cloak",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Tshaeral Shaman",
        reputation: 0,
        named: false,
        aggressive: true,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, { // ===== Named Enemies ===== 
        name: "Ah'gani",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Ashreu'ul",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Cyrian Shyne",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Daetheus",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Dorien Caderyn",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Eugenes",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Evrio Lorian Peroumes",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Fierous Ashfyre",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Garris Ashenus",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "King Mathyus Caderyn",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Kreceus",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Laetrois Ath'Shaorah",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Leaf",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Lorian",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Mavros Ilios",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Mirio",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Quor'estes",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Relien Myelle",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Sera Lorian",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Devoted',
        dialog: 25,
    }, {
        name: "Sky",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Synaethi Spiras",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Torreous Ashfyre",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    }, {
        name: "Vincere",
        reputation: 0,
        named: true,
        aggressive: false,
        betrayed: false,
        faith: 'Adherent',
        dialog: 25,
    },
];

export class Reputation {
    public _id: string;
    public factions: faction[];
    public constructor(id: string) {
        this._id = id;
        this.factions = initFactions;
    };
};

export const initReputation: Reputation = new Reputation('reputation');

export class Inventory {
    public _id: string;
    public inventory: Equipment[] | [];
    public constructor(id: string) {
        this._id = id;
        this.inventory = [];
    };
};

export const initInventory: Inventory = new Inventory('inventory');

export class Party<T> {
    public _id: string;
    public party: T[] | [];
    public constructor(id: string) {
        this._id = id;
        this.party = [];
    };
};

export const initParty: Party<Ascean> = new Party('party');