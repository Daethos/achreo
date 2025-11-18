import { States } from "../game/phaser/StateMachine";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
type Concerns = {
    "state": {
        key: string; // stateMachine / positiveMachine / negativeMachine
        state: string; // isStunned / isFeared etc.    
    };
    "status": string[];
};
export const Counters: Record<string, Record<string, Concerns>[]> = {
    "Achire" : [],
    "Astrave" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.STUNNED
        },
        status: ["isStunned"]
    }}],
    "Chiomism" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.CONFUSED
        },
        status: ["isConfused"]
    }}],
    "Confuse" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.CONFUSED
        },
        status: ["isConfused"]
    }}],
    "Devour" : [{"player": {
        state: {
            key: "stateMachine",
            state: States.SUTURE
        },
        status: [],
    }}],
    "Fear" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.FEARED
        },
        status: ["isFeared"],
    }}],
    "Frost" : [{"enemy": {
        state: {
            key: "negativeMachine",
            state: States.FROZEN
        },
        status: ["isFrozen"],
    }}],
    "Healing" : [],
    "Ilirech" : [],
    "Kyrisian" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.PARALYZED
        },
        status: ["isParalyzed"],
    }}],
    "Kyrnaicism" : [{"enemy": {
        state: {
            key: "negativeMachine",
            state: States.SLOWED
        },
        status: ["isSlowed"],
    }}],
    "Likyr" : [],
    "Maiereth" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.FEARED
        },
        status: ["isFeared"],
    }}],
    "Paralyze" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.PARALYZED
        },
        status: ["isParalyzed"],
    }}],
    "Polymorph" : [{"enemy": {
        state: {
            key: "stateMachine",
            state: States.POLYMORPHED
        },
        status: ["isPolymorphed"],
    }}],
    "Quor" : [],
    "Reconstitute" : [{"player": {
        state: {
            key: "positiveMachine",
            state:  States.RENEWAL
        },
        status: [],
    }}],
    "Snare" : [{"enemy": {
        state: {

            key: "negativeMachine",
            state: States.SNARED
        },
        status: ["isSnared"],

    }}],
};

export const PHYSICAL_ACTIONS = ["attack", "posture", "thrust"];
export const PHYSICAL_EVASIONS = ["dodge", "roll"];
const COST = {LOW: 15, MID: 30, HIGH: 45, HIGHEST: 60}; // Good, Better, Best, Bested. How is that for a declension
const DURATION = {BOTTOM: 750, STANDARD: 1500, ONE: 1000, TWO: 2000, THREE: 3000, FIVE: 5000, MODERATE: 6000, HIGH: 8000, TEN: 10000};
type Cost = {[key:string]: number;};
export const TALENT_COST: Cost = {
    "-30": -45,
    "-15": -30,
    "0": -15,
    "15": 0,
    "30": 15,
    "45": 30,
    "60": 45,
};
type Cooldown = {[key: number]: number;};
export const TALENT_COOLDOWN: Cooldown = {
    3000: 1000,
    6000: 3000,
    10000: 6000,
    15000: 10000,
};
export const PLAYER: {[key:string]: {[key:string]: number}} = {
    ACTION_WEIGHT: {
        ATTACK: 60,
        HURL: 50,
        POSTURE: 45,
        ROLL: 30,
        PARRY: 20,
        THRUST: 5,
    },
    COLLIDER: {
        DISPLACEMENT: 16,
        HEIGHT: 32, // 32,
        WIDTH: 12, // 16,
    },
    DISTANCE: {
        MIN: 0,
        ATTACK: 50,
        MOMENTUM: 2,
        THRESHOLD: 75,
        CHASE: 75,
        RANGED_ALIGNMENT: 25,
        RANGED_MULTIPLIER: 3,
        DODGE: 1056, // 1152
        ROLL: 960, // 960
    },
    DODGE: { // 8*
        DISTANCE: 200, // 2800, // 126 || 2304
        DURATION: 350, // 18 || 288
        MULTIPLIER: 8, //9,
    },
    ROLL: { // 6*
        DISTANCE: 160, // 1920, // 140
        DURATION: 320, // 20
        MULTIPLIER: 5.5, // 6,
    },
    SPEED: {
        INITIAL: 1.5, // 1.75
        ACCELERATION: 0.25,
        DECELERATION: 0.1,
        CAERENIC: 0.4,
        SLOW: 1,
        SNARE: 1.5,
        SPRINT: 1,
        STEALTH: 0.5,
        LEAP: 300,
        BLINK: 250,
        RUSH: 300,
    },  
    SCALE: {
        SELF: 0.8,
        SHIELD: 0.6,
        DAGGER: 0.4,
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
        HURL: 15,
        JUMP: 10, // 25
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

        LUCKOUT: COST.MID,
        "LUCKOUT (ARBITUOUS)": COST.MID,
        "LUCKOUT (CHIOMIC)": COST.MID,
        "LUCKOUT (KYR'NAIC)": COST.MID,
        "LUCKOUT (LILOSIAN)": COST.MID,
        "LUCKOUT (TSHAERAL)": COST.MID,

        PERSUASION: 10,
        "PERSUASION (ARBITUOUS)": 10,
        "PERSUASION (CHIOMIC)": 10,
        "PERSUASION (FYERAN)": 10,
        "PERSUASION (KYR'NAIC)": 10,
        "PERSUASION (ILIAN)": 10,
        "PERSUASION (LILOSIAN)": 10,
        "PERSUASION (SHAORAHI)": 10,
        "PERSUASION (TSHAERAL)": 10,

        // Special Cost
        INVOKE: -COST.MID,
        
        // Low Cost - 15
        CONSUME: COST.LOW,
        ARC: COST.LOW,
        BLINK: COST.LOW,
        CONFUSE: COST.LOW,
        DISPEL: COST.LOW,
        FEAR: COST.LOW,
        "GRAPPLING HOOK": COST.LOW,
        HOOK: COST.LOW,
        MARK: COST.LOW,
        NETHERSWAP: COST.LOW,
        PARALYZE: COST.LOW,
        POLYMORPH: COST.LOW,
        RECALL: COST.LOW,    
        ROOT: COST.LOW,
        SHIMMER: COST.LOW,
        SHIRK: COST.LOW,
        SLOW: COST.LOW,
        SPRINT: COST.LOW,
        
        // Moderate Cost - 30
        ACHIRE: COST.MID, // LOW
        CHARM: COST.MID, // LOW
        CHIOMISM: COST.MID, // LOW
        FROST: COST.MID, // LOW
        HEALING: COST.MID, // LOW
        ILIRECH: COST.MID, // LOW
        KYRISIAN: COST.MID,
        KYRNAICISM: COST.MID,
        LEAP: COST.MID, // LOW
        LIKYR: COST.MID, // LOW
        MAIERETH: COST.MID, // LOW
        PURSUIT: COST.MID,
        RUSH: COST.MID, // LOW
        SNARE: COST.MID,
        
        // High Cost - 45
        LIGHTNING: COST.HIGH, // MID
        QUOR: COST.HIGH, // MID
        RECONSTITUTE: COST.HIGH, // MID
        SACRIFICE: COST.HIGH, // MID
        SHADOW: COST.HIGH, // MID
        STORM: COST.HIGH, // MID
        SUTURE: COST.HIGH, // MID
        TETHER: COST.HIGH, // MID
        
        // Highest Cost - 60
        DESPERATION: COST.HIGHEST,
        TSHAERAL: COST.HIGHEST,
        
        // Trait
        ENDURANCE: 0,
        
        ASTRICATION: COST.LOW,
        BERSERK: COST.LOW,
        CONVICTION: COST.LOW,
        IMPERMANENCE: COST.LOW,
        SEER: COST.LOW,
        STIMULATE: COST.LOW,
        
        BLIND: COST.HIGH,
        CAERENESIS: COST.HIGH,
        
        DEVOUR: COST.HIGHEST,
        
        // AoE
        CHIOMIC: COST.MID,
        FREEZE: COST.MID,
        HOWL: COST.MID,
        SCREAM: COST.MID,
        
        ASTRAVE: COST.HIGH,
        DISEASE: COST.HIGH,
        FYERUS: COST.HIGH,
        KYNISOS: COST.HIGH,
        RENEWAL: COST.HIGH,
        WRITHE: COST.HIGH,

        // Bubble
        ABSORB: 0,
        REIN: 0,
        
        ENVELOP: COST.LOW,
        MODERATE: COST.LOW,
        RECOVER: COST.LOW,

        MALICE: COST.MID,
        MEND: COST.MID,
        
        MULTIFARIOUS: COST.HIGH,
        MYSTIFY: COST.HIGH,
        MENACE: COST.HIGH,
        
        PROTECT: COST.HIGHEST,
        SHIELD: COST.HIGHEST,
        WARD: COST.HIGHEST,
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
        LIGHTNING: DURATION.STANDARD,
        CHARM: DURATION.STANDARD,
        CHIOMIC: DURATION.ONE,
        CHIOMISM: DURATION.ONE,
        CONFUSE: DURATION.ONE,
        DEFEATED: DURATION.HIGH,
        DESPERATION: DURATION.BOTTOM,
        DISEASE: DURATION.MODERATE,
        ENVELOP: DURATION.HIGH,
        FEAR: DURATION.STANDARD,
        FYERUS: DURATION.MODERATE,
        FREEZE: DURATION.BOTTOM,
        FROST: DURATION.STANDARD,
        HEALING: DURATION.STANDARD,
        "GRAPPLING HOOK": DURATION.STANDARD,
        HOOK: DURATION.STANDARD,
        HOWL: DURATION.ONE,
        ILIRECH: DURATION.STANDARD,
        KYNISOS: DURATION.ONE,
        KYRISIAN: DURATION.ONE,
        KYRNAICISM: DURATION.THREE,
        LEAP: DURATION.BOTTOM,
        LIKYR: DURATION.STANDARD,
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
        STUNNED: DURATION.THREE,
        TEXT: DURATION.STANDARD,
        TSHAERAL: DURATION.TWO,
        WARD: DURATION.HIGH,
        WRITHE: DURATION.ONE,
        // Trait
        
        LUCKOUT: DURATION.THREE,
        PERSUASION: DURATION.THREE,

        ASTRICATION: DURATION.HIGH, // -1
        BERSERK: DURATION.HIGH,
        BLIND: DURATION.ONE,
        CAERENESIS: DURATION.ONE,
        CONVICTION: DURATION.HIGH,
        DEVOUR: DURATION.TWO,
        ENDURANCE: DURATION.FIVE,
        IMPERMANENCE: DURATION.HIGH, // -1
        NEGATION: DURATION.HIGH, // -1
        SEER: DURATION.HIGH, // -1
        STIMULATE: DURATION.STANDARD,
        // Negative Durations
        SNARED: DURATION.FIVE,
        SLOWED: DURATION.FIVE,
    },
    RANGE: {
        SHORT: 200,
        MODERATE: 350,
        LONG: 500,
    },
};

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

export const STATE = "stateMachine";
export const POSITIVE = "positiveMachine";

export const PLAYER_INSTINCTS: {[key:string]: {key:string; value:string;}[]} = {
    "constitution": [
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
            value: States.KYRISIAN
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.KYRNAICISM
        },{ // 5 - Starter Damage
            key: STATE,
            value: States.LIKYR
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
    "strength": [
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
    "agility": [
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
    "achre": [
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
            value: States.FROST
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
    "caeren": [
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
            value: States.KYRNAICISM
        },{ // 5 - Starter Damage
            key: STATE,
            value: States.MAIERETH
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
    "kyosir": [
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
            value: States.CHIOMISM
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
            value: States.CHIOMISM
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
type INSTINCT = { [key:string]: string[] };
export const BALANCED_INSTINCTS: INSTINCT = {
    "constitution": [States.INVOKE, States.ILIRECH, States.LIKYR, States.KYNISOS, States.KYRISIAN, States.PARALYZE, States.WARD],
    "strength": [States.INVOKE, States.RECOVER, States.SPRINTING, States.STORM, States.WARD],
    "agility": [States.INVOKE, States.ACHIRE, States.KYNISOS, States.RECOVER, States.SPRINTING],
    "achre": [States.INVOKE, States.ACHIRE, States.BLINK, States.FROST, States.FYERUS, States.REIN, States.SLOW],
    "caeren": [States.INVOKE, States.FEAR, States.ILIRECH, States.HEALING, States.SCREAM],
    "kyosir": [States.INVOKE, States.CONFUSE, States.DISPEL, States.KYNISOS, States.SUTURE],
};
export const DEFENSIVE_INSTINCTS: INSTINCT = {
    "constitution": [States.ABSORB, States.HEALING, States.INVOKE, States.LIKYR, States.SHIELD, States.SHIRK, States.WARD],
    "strength": [States.INVOKE, States.DESPERATION, States.HOWL, States.SPRINTING, States.WARD],
    "agility": [States.INVOKE, States.DESPERATION, States.ENVELOP, States.RECOVER, States.SHIMMER, States.SNARE],
    "achre": [States.INVOKE, States.ABSORB, States.BLINK, States.DESPERATION, States.FROST, States.MODERATE, States.SLOW],
    "caeren": [States.INVOKE, States.DESPERATION, States.FEAR, States.HEALING, States.KYRNAICISM, States.MEND],
    "kyosir": [States.CONFUSE, States.DESPERATION, States.HEALING, States.MYSTIFY, States.PROTECT, States.SUTURE],
};
export const OFFENSIVE_INSTINCTS: INSTINCT = {
    "constitution": [States.DISPEL, States.ILIRECH, States.KYNISOS, States.KYRISIAN, States.KYRNAICISM, States.LIKYR, States.PARALYZE],
    "strength": [States.INVOKE, States.LEAP, States.QUOR, States.RECOVER, States.RUSH, States.SPRINTING, States.STORM],
    "agility": [States.INVOKE, States.ACHIRE, States.KYNISOS, States.RECOVER, States.SPRINTING, States.STORM],
    "achre": [States.INVOKE, States.ACHIRE, States.ASTRAVE, States.BLINK, States.FROST, States.FYERUS, States.QUOR, States.REIN],
    "caeren": [States.INVOKE, States.ASTRAVE, States.ILIRECH, States.MAIERETH, States.MALICE, States.KYRNAICISM, States.SACRIFICE],
    "kyosir": [States.INVOKE, States.CHIOMISM, States.DISPEL, States.ILIRECH, States.KYRNAICISM, States.MALICE, States.SACRIFICE],
};

export const STAMINA = ["attack", "posture", "roll", "dodge", "hurl", "jump", "parry", "thrust"];
export const staminaCheck = (stamina: number, cost: number): { success: boolean; cost: number } => {
    let success: boolean = stamina >= cost;
    return { success, cost };
};

export const ENEMY_AGGRESSION = -15;
export const ENEMY_HOSTILE = -5;
const ADHERENT = "Adherent";
const DEVOTED = "Devoted";

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

export const ENEMY_ENEMIES: {[key:string]: string[]} = {
    "Achreon Druid": [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KYNGIAN_SHAMAN, TSHAERAL_SHAMAN, KINGSMAN, NORTHREN_WANDERER, SOVERAIN_BLOOD_CLOAK],
    "Ahn'are Apostle": [ANASHTRE, ASTRAL_APOSTLE, LIIVI_LEGIONNAIRE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KINGSMAN, SOVERAIN_BLOOD_CLOAK],
    "Anashtre": [AHNARE_APOSTLE, ASTRAL_APOSTLE, DAETHIC_KNIGHT, SOVERAIN_BLOOD_CLOAK, LIIVI_LEGIONNAIRE, DAETHIC_INQUISITOR],
    "Astral Apostle": [AHNARE_APOSTLE, ANASHTRE, LIIVI_LEGIONNAIRE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, SOVERAIN_BLOOD_CLOAK, KINGSMAN],
    "Cambiren Druid": [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KYNGIAN_SHAMAN, TSHAERAL_SHAMAN, KINGSMAN, NORTHREN_WANDERER, SOVERAIN_BLOOD_CLOAK],
    "Chiomic Jester": [FANG_DUELIST, FANG_MERCENARY, KYRISIAN_OCCULTIST, MARAUDER, NYREN, RAHVREHCUR, SHRYGEIAN_BARD],
    "Daethic Inquisitor": [ACHREON_DRUID, AHNARE_APOSTLE, ASTRAL_APOSTLE, CAMBIREN_DRUID, ILIRE_OCCULTIST, FIRESWORN, FYERS_OCCULTIST, KYRISIAN_OCCULTIST, MAIER_OCCULTIST, MAVROSIN_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST, RAHVREHCUR, SOVERAIN_BLOOD_CLOAK],
    "Daethic Knight": [ANASHTRE, FANG_DUELIST, FANG_MERCENARY, FIRESWORN, KYNGIAN_SHAMAN, ILIRE_OCCULTIST, MAIER_OCCULTIST, MAVROSIN_OCCULTIST, SEDYREAL_GUARD, SOVERAIN_BLOOD_CLOAK, SEVA_SHRIEKER, QUOREITE_STALKER, TSHAERAL_SHAMAN],
    "Fang Duelist": [CHIOMIC_JESTER, FANG_MERCENARY, KYRISIAN_OCCULTIST, NYREN, MARAUDER, RAHVREHCUR, SHRYGEIAN_BARD],
    "Fang Mercenary": [CHIOMIC_JESTER, FANG_DUELIST, KYRISIAN_OCCULTIST, NYREN, MARAUDER, RAHVREHCUR, SHRYGEIAN_BARD],
    "Firesworn": [AHNARE_APOSTLE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, FANG_MERCENARY, SEDYREAL_GUARD, SEVA_SHRIEKER, QUOREITE_OCCULTIST, QUOREITE_STALKER, SOUTHRON_WANDERER],
    "Fyers Occultist": [AHNARE_APOSTLE, ASTRAL_APOSTLE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, ILIRE_OCCULTIST, LIIVI_LEGIONNAIRE, MAIER_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Ilire Occultist": [AHNARE_APOSTLE, ASTRAL_APOSTLE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, FYERS_OCCULTIST, LIIVI_LEGIONNAIRE, MAIER_OCCULTIST, MAVROSIN_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Kingsman": [ACHREON_DRUID, ANASHTRE, CAMBIREN_DRUID, ILIRE_OCCULTIST, MAVROSIN_OCCULTIST, NORTHREN_WANDERER, SOVERAIN_BLOOD_CLOAK],
    "Kyn'gian Shaman": [ACHREON_DRUID, CAMBIREN_DRUID, DAETHIC_KNIGHT, SOUTHRON_WANDERER, SEDYREAL_GUARD, QUOREITE_OCCULTIST, QUOREITE_STALKER, SEDYRIST],
    "Kyrisian Occultist": [CHIOMIC_JESTER, FANG_DUELIST, FANG_MERCENARY, LIIVI_LEGIONNAIRE, MARAUDER, RAHVREHCUR, SHRYGEIAN_BARD],
    "Li'ivi Legionnaire": [OLD_LIIVI_OCCULTIST, FIRESWORN, MARAUDER, SOVERAIN_BLOOD_CLOAK, KINGSMAN, SEVA_SHRIEKER],
    "Ma'ier Occultist": [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, FYERS_OCCULTIST, ILIRE_OCCULTIST, MAVROSIN_OCCULTIST, QUOREITE_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Marauder": [CHIOMIC_JESTER, FANG_DUELIST, FANG_MERCENARY, LIIVI_LEGIONNAIRE, NYREN, RAHVREHCUR, SHRYGEIAN_BARD],
    "Mavrosin Occultist": [AHNARE_APOSTLE, ASTRAL_APOSTLE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, ILIRE_OCCULTIST, KINGSMAN, MAIER_OCCULTIST, NORTHREN_WANDERER],
    "Northren Wanderer": [ACHREON_DRUID, ASTRAL_APOSTLE, CAMBIREN_DRUID, LIIVI_LEGIONNAIRE, MARAUDER, MAVROSIN_OCCULTIST, SOUTHRON_WANDERER, KINGSMAN, SOVERAIN_BLOOD_CLOAK],
    "Nyren": [CHIOMIC_JESTER, FANG_DUELIST, FANG_MERCENARY, RAHVREHCUR, SEVA_SHRIEKER, MARAUDER, SHRYGEIAN_BARD],
    "Old Li'ivi Occultist": [DAETHIC_INQUISITOR, FYERS_OCCULTIST, ILIRE_OCCULTIST, MAIER_OCCULTIST, QUOREITE_OCCULTIST],
    "Quor'eite Occultist": [DAETHIC_INQUISITOR, FYERS_OCCULTIST, ILIRE_OCCULTIST, LIIVI_LEGIONNAIRE, MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST],
    "Quor'eite Stalker": [DAETHIC_KNIGHT, FIRESWORN, FYERS_OCCULTIST, SEVA_SHRIEKER, SEDYREAL_GUARD, SOUTHRON_WANDERER],
    "Rahvrehcur": [CHIOMIC_JESTER, NYREN, OLD_LIIVI_OCCULTIST, SEVA_SHRIEKER, MARAUDER, FANG_MERCENARY, SHRYGEIAN_BARD],
    "Se'dyrist": [ACHREON_DRUID, CAMBIREN_DRUID, SEVA_SHRIEKER, FANG_MERCENARY, KYNGIAN_SHAMAN, SEDYREAL_GUARD, TSHAERAL_SHAMAN],
    "Sedyreal Guard": [SEDYRIST, SEVA_SHRIEKER, FIRESWORN, FYERS_OCCULTIST, MAIER_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, SOUTHRON_WANDERER],
    "Se'va Shrieker": [SEDYRIST, SEDYREAL_GUARD, FIRESWORN, MAIER_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, SOUTHRON_WANDERER],
    "Shrygeian Bard": [CHIOMIC_JESTER, FANG_DUELIST, FANG_MERCENARY, LIIVI_LEGIONNAIRE, MARAUDER, NYREN, RAHVREHCUR],
    "Southron Wanderer": [FIRESWORN, FYERS_OCCULTIST, KYNGIAN_SHAMAN, MAIER_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, SEDYREAL_GUARD, SEVA_SHRIEKER, TSHAERAL_SHAMAN],
    "Soverain Blood Cloak": [ANASHTRE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, ILIRE_OCCULTIST, LIIVI_LEGIONNAIRE, MAVROSIN_OCCULTIST, KINGSMAN, NORTHREN_WANDERER],
    "Tshaeral Shaman": [ACHREON_DRUID, CAMBIREN_DRUID, DAETHIC_KNIGHT, DAETHIC_INQUISITOR, QUOREITE_OCCULTIST, QUOREITE_STALKER, SEDYREAL_GUARD, SEDYRIST, SOUTHRON_WANDERER],

    "Ashreu'ul": [AHNARE_APOSTLE, FYERS_OCCULTIST, ILIRE_OCCULTIST, KYRISIAN_OCCULTIST, MAIER_OCCULTIST, MAVROSIN_OCCULTIST, OLD_LIIVI_OCCULTIST, QUOREITE_OCCULTIST, RAHVREHCUR],
    // Ashreu'ul is Anashtre; stamping out the occult and wickedry that profranes Astra. 
    // Druid/Shaman are more 'loungers' in their eyes, xaplostra in greek, their reference
    // chymostra
    // Astra imbued with cosmos
    "Cyrian Shyne": ["King Mathyus Caderyn"],
    "Dorien Caderyn": ["Garris Ashenus"],
    "Eugenes Ma'ier": ["Dorien Caderyn"],
    "Evrio Lorian Peroumes": ["Mirio"],
    "Fierous Ashfyre": ["Synaethi Spiras"],
    "Garris Ashenus": ["Dorien Caderyn"],
    "King Mathyus Caderyn": ["Cyrian Shyne"],
    "Kreceus": ["Ahn'are Apostle", "Licivitan Soldier", "Evrio Lorian Peroumes", "Mirio"],
    "Laetrois Ath'Shaorah": ["Mavrios Ilios"],
    "Leaf": ["Kingsman", "Northren Wanderer"],
    "Lorian": ["Mavrios Ilios"],
    "Mavrios Ilios": ["Laetrois Ath'Shaorah", "Lorian"],
    "Mirio Lorian Kyr'na": ["Evrio Lorian Peroumes"],
    "Sera Lorian": ["Evrio Lorian Peroumes", "Dorien Caderyn"],
    "Synaethi Spiras": ["Fierous Ashfyre", "Torreous Ashfyre"],
    "Torreous Ashfyre": ["Synaethi Spiras"],
    "Vincere": ["King Mathyus Caderyn", "Dorien Caderyn", "Sera Lorian", "Evrio Lorian Peroumes"],
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
    "Lacheo of the Seyr",
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
    "Sedesyus", 
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

export type FACTION = {
    name: string; // Name of FACTION type and functional key for factions[] array
    reputation: number; // 0 - 100. Higher reputation opens up dialog, quests, and trade
    named: boolean; // Unique enemies
    aggressive: boolean; // Attacks first if true
    betrayed: boolean; // Betrayed = went from aggressive = false to true, Permanent = always aggressive, no dialog
    hostile: boolean; // Will approach and force dialog
    faith: string; // Adherent || Devoted
    deity: string[];
    province: string[];
    [key: string]: boolean | number | string | string[];
};

export const initFaction = {
    name: "", // Name of FACTION type and functional key for factions[] array
    reputation: 0, // 0 - 100. Higher reputation opens up dialog, quests, and trade
    named: false, // Unique enemies
    aggressive: false, // Attacks first if true
    betrayed: false, // Betrayed = went from aggressive = false to true, Permanent = always aggressive, no dialog
    hostile: false,
    faith: "", // Adherent || Devoted
    province: [""],
    deity: [""],
};

const initFactions: FACTION[] = [
    {
        ...initFaction,
        name: ACHREON_DRUID,
        faith: ADHERENT,
        deity: ["Achreo"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: AHNARE_APOSTLE,
        faith: ADHERENT,
        deity: ["Ahn've"],
        province: ["Astralands", "Firelands"],
    }, {
        ...initFaction,
        name: ANASHTRE,
        faith: ADHERENT,
        deity: ["Astra"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: ASTRAL_APOSTLE,
        faith: ADHERENT,
        deity: ["Astra"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: CAMBIREN_DRUID,
        faith: ADHERENT,
        deity: ["Cambire"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: CHIOMIC_JESTER,
        faith: ADHERENT,
        deity: ["Chiomyr", "Shrygei"],
        province: ["Firelands", "West Fangs"],
    }, {
        ...initFaction,
        name: DAETHIC_INQUISITOR,
        faith: DEVOTED,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: DAETHIC_KNIGHT,
        faith: DEVOTED,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: FANG_DUELIST,
        faith: ADHERENT,
        deity: ["Se'dyro", "Se'vas"],
        province: ["West Fangs"],
    }, {
        ...initFaction,
        name: FANG_MERCENARY,
        faith: ADHERENT,
        deity: ["Kyn'gi", "Tshaer"],
        province: ["West Fangs"],
    }, {
        ...initFaction,
        name: FIRESWORN,
        faith: ADHERENT,
        deity: ["Fyer", "Rahvre", "Se'dyro"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: FYERS_OCCULTIST,
        faith: ADHERENT,
        deity: ["Fyer"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: ILIRE_OCCULTIST,
        faith: ADHERENT,
        deity: ["Ilios"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: KINGSMAN,
        faith: DEVOTED,
        deity: ["Achreo", "Daethos"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: KYNGIAN_SHAMAN,
        faith: ADHERENT,
        deity: ["Kyn'gi"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: KYRISIAN_OCCULTIST,
        faith: ADHERENT,
        deity: ["Kyrisos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: LIIVI_LEGIONNAIRE,
        faith: DEVOTED,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: MAIER_OCCULTIST,
        faith: ADHERENT,
        deity: ["Ma'anre"],
        province: ["Firelands", "Sedyrus"],
    }, {
        ...initFaction,
        name: MARAUDER,
        faith: ADHERENT,
        deity: ["Kyn'gi", "Se'vas"],
        province: ["Firelands", "West Fangs"],
    }, {
        ...initFaction,
        name: MAVROSIN_OCCULTIST,
        faith: ADHERENT,
        deity: ["Ilios"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: NORTHREN_WANDERER,
        faith: ADHERENT,
        deity: ["Achreo", "Cambire"],
        province: ["Kingdom", "Soverains"],
    }, {
        ...initFaction,
        name: NYREN,
        faith: ADHERENT,
        deity: ["Nyrolus", "Senari"],
        province: ["Licivitas", "West Fangs"],
    }, {
        ...initFaction,
        name: OLD_LIIVI_OCCULTIST,
        faith: ADHERENT,
        deity: ["Kyr'na", "Lilos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: QUOREITE_OCCULTIST,
        faith: ADHERENT,
        deity: ["Quor'ei"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: QUOREITE_STALKER,
        faith: ADHERENT,
        deity: ["Quor'ei", "Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: RAHVREHCUR,
        faith: ADHERENT,
        deity: ["Rahvre"],
        province: ["West Fangs"],
    }, {
        ...initFaction,
        name: SEDYRIST,
        faith: ADHERENT,
        deity: ["Nyrolus", "Se'dyro", "Senari"],
        province: ["Firelands", "Licivitas"],
    }, {
        ...initFaction,
        name: SEDYREAL_GUARD,
        faith: ADHERENT,
        deity: ["Se'dyro", "Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: SEVA_SHRIEKER,
        faith: ADHERENT,
        deity: ["Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: SHRYGEIAN_BARD,
        faith: ADHERENT,
        deity: ["Chiomyr", "Shrygei"],
        province: ["Firelands", "West Fangs"],
    }, {
        ...initFaction,
        name: SOUTHRON_WANDERER,
        faith: ADHERENT,
        deity: ["Kyn'gi", "Quor'ei", "Se'dyro"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: SOVERAIN_BLOOD_CLOAK,
        faith: ADHERENT,
        deity: ["Achreo", "Cambire"],
        province: ["Soverains"],
    }, {
        ...initFaction,
        name: TSHAERAL_SHAMAN,
        faith: ADHERENT,
        deity: ["Tshaer"],
        province: ["Sedyrus"],
    }, { // ===== Named Enemies ===== 
        ...initFaction,
        name: "Ah'gani",
        faith: ADHERENT,
        named: true,
        deity: ["Astra", "Se'dyro", "Se'vas"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: "Ashreu'ul",
        faith: ADHERENT,
        named: true,
        deity: ["Astra", "Se'dyro", "Se'vas"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: "Cyrian Shyne",
        faith: ADHERENT,
        named: true,
        deity: ["Se'dyro", "Se'vas"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: "Daetheus",
        faith: ADHERENT,
        named: true,
        deity: ["Daethos", "Kyr'na", "Lilos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Dorien Caderyn",
        faith: DEVOTED,
        named: true,
        deity: ["Achreo", "Cambire", "Daethos"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Eugenes",
        faith: ADHERENT,
        named: true,
        deity: ["Ma'anre"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Evrio Lorian Peroumes",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Fierous Ashfyre",
        faith: ADHERENT,
        named: true,
        deity: ["Fyer"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Garris Ashenus",
        faith: DEVOTED,
        named: true,
        deity: ["Ma'anre"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "King Mathyus Caderyn",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Kreceus",
        faith: ADHERENT,
        named: true,
        deity: ["Astra"],
        province: ["Astralands"],
    }, {
        ...initFaction,
        name: "Laetrois Ath'Shaorah",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: [""],
    }, {
        ...initFaction,
        name: "Leaf",
        faith: ADHERENT,
        named: true,
        deity: ["Achreo"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Lorian",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos", "Lilos"],
        province: [""],
    }, {
        ...initFaction,
        name: "Mavros Ilios",
        faith: ADHERENT,
        named: true,
        deity: ["Daethos", "Ilios"],
        province: [""],
    }, {
        ...initFaction,
        name: "Mirio",
        faith: DEVOTED,
        named: true,
        deity: ["Cambire", "Chiomyr", "Daethos", "Kyr'na"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Quor'estes",
        faith: ADHERENT,
        named: true,
        deity: ["Chiomyr", "Shrygei"],
        province: ["Sedyrus"],
    }, {
        ...initFaction,
        name: "Relien Myelle",
        faith: ADHERENT,
        named: true,
        deity: ["Cambire", "Ilios"],
        province: ["Soverains"],
    }, {
        ...initFaction,
        name: "Sera Lorian",
        faith: DEVOTED,
        named: true,
        deity: ["Daethos"],
        province: ["Licivitas"],
    }, {
        ...initFaction,
        name: "Sky",
        faith: ADHERENT,
        named: true,
        deity: ["Achreo", "Nyrolus"],
        province: ["Kingdom"],
    }, {
        ...initFaction,
        name: "Synaethi Spiras",
        faith: ADHERENT,
        named: true,
        deity: ["Ahn've"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Torreous Ashfyre",
        faith: ADHERENT,
        named: true,
        deity: ["Fyer"],
        province: ["Firelands"],
    }, {
        ...initFaction,
        name: "Vincere",
        faith: ADHERENT,
        named: true,
        deity: ["Achreo"],
        province: ["Licivitas"],
    },
];

export class Reputation {
    public _id: string;
    public factions: FACTION[];
    public constructor(id: string) {
        this._id = id;
        this.factions = initFactions;
    };
};

export const initReputation: Reputation = new Reputation("reputation");

export class Inventory {
    public _id: string;
    public inventory: Equipment[] | [];
    public constructor(id: string) {
        this._id = id;
        this.inventory = [];
    };
};

export const initInventory: Inventory = new Inventory("inventory");

export class Party<T> {
    public _id: string;
    public party: T[] | any[];
    public constructor(id: string) {
        this._id = id;
        this.party = [];
    };
};

export const initParty: Party<Ascean> = new Party("party");

/*
    Effect Type Example:
    Agility Potion to increase Agility by 25 for 300 seconds
    effects: [{
        "agility": 25,
        "duration": 300    
    }]

    Experience Potion to increase Experience by 1000 instantly
    effects: [{
        "experience": 1000
    }]

    Heal Potion to heal 5% of max health every 3 seconds for 30 seconds
    effects: [{
        "healPercent": 5,
        "healInterval": 3,
        "duration": 30
    }]


*/

/*
    Special Inventory Item Example:

    Lockpicks
    {
        _id: "uuidv4()",
        name: "Lockpick",
        description: "A small, slender tool used to unlock contraptions without a key.",
        type: "Tool",
        imgUrl: "../assets/images/lockpick.png",
        quantity: 10,
        
        effects: [],

        isConsumable: false,
        isQuestItem: false,
        isSellable: true,
        isUnique: false,

        value: 0.1, // 10 Silver, per item, so quantity 10 would be 1 Gold,
        weight: 0.01, // 0.01 lbs per item, 1/100th 
        rarity: "Common",
        
        maxStack: 50,
        systemTrigger: "" // This is a mini-game and handled in-game
    }

    Tension Wrench
    {
        _id: "uuidv4()",
        name: "Tension Wrench",
        description: "A small tool used to apply tension to locks while picking them.",
        type: "Tool",
        imgUrl: "../assets/images/tension_wrench.png",
        quantity: 1,
        
        effects: [],

        isConsumable: false,
        isQuestItem: false,
        isSellable: true,
        isUnique: true,

        value: 1, // 1 Gold
        weight: 0.01, // 0.01 lbs, 1/100th 
        rarity: "Unique",

        // systemTrigger: "" // This is a mini-game and handled in-game
    }

    Net 
    {
        _id: "uuidv4()",
        name: "Net",
        description: "A sturdy net used to capture dead bodies for transport.",
        type: "Tool",
        imgUrl: "../assets/images/net.png",
        quantity: 1,

        effects: [],

        isConsumable: false,
        isQuestItem: false,
        isSellable: true,
        isUnique: true,

        value: 1, // 1 Gold
        weight: 3, // 3 lbs
        rarity: "Common",

        // systemTrigger: "" // This is physics based and handled in-game
        
    }

    Blood Honey 
    {
        _id: "uuidv4()",
        name: "Blood Honey",
        description: "A sweet honey made from the nectar of rare and fragile blood flowers, it is said. Known for a rich fragrance and crimson hue, this honey is thought to grant a charming allure to those who consume it.",
        type: "Component",
        imgUrl: "../assets/images/blood_honey.png",
        quantity: 1,

        effects: [{
            trigger: "Buff",
            statKey: "reputation",
            value: 25,
            duration: 600
        }],

        inConsumable: true,
        isQuestItem: true,
        isSellable: false,
        isUnique: true,

        value: 10, // 10 Gold
        weight: 0.5, // 0.5 lbs
        rarity: "Rare",

        systemTrigger: "Ritual"
    }

    Ritual Component (Unique)
    {
        _id: "uuidv4()",
        name: "Caerenic Shard",
        description: "A fragment of pure caerenic energy, pulsating with the rhythm of your heartbeat. This shard is said to be a vital component in Ancient rituals long forgotten. Perhaps you can make some use of it?",
        type: "Component",
        imgUrl: "../assets/images/caerenic_shard.png",
        quantity: 1,

        effects: [],

        isConsumable: false,
        isQuestItem: true,
        isSellable: false,
        inUnique: true,

        value: 50, // 50 Gold
        weight: 0.1, // 0.1 lbs
        rarity: "Legendary",

        systemTrigger: "Ritual"
    }

    "Generic Consumable Item"
    { // Example: Agility Potion
        _id: "uuidv4()",
        name: "Alacrity Elixir",
        description: "A sparkling elixir that invigorates the drinker, enhancing their agility and reflexes for a short duration.",
        type: "Consumeable",
        imgUrl: "../assets/images/alacrity_elixir.png",
        quantity: 1,

        effects: [{
            "trigger": "Buff",
            "statKey": "agility",
            "value": 25,
            "duration": 300    
        }],

        isConsumable: true,
        isQuestItem: false,
        isSellable: true,
        isUnique: false,

        value: 1, // 1 Gold,
        weight: 0.2, // 0.2 lbs,
        rarity: "Uncommon",

        maxStack: 10,
        // systemTrigger: "" // Handled in-game, may be a thing that is used in quests and/or rituals, etc.
    }

    { // Example: Health Potion
        _id: "uuidv4()",
        name: "Health Potion",
        description: "A red potion that restores a portion of the drinker's health over time.",
        type: "Consumable",
        imgUrl: "../assets/images/health_potion.png",
        quantity: 1,

        effects: [{
            "trigger": "Periodic",
            "resourceKey": "health",
            "value": 5,
            "interval": 3,
            "duration": 30,
            "isPercent": true
        }],

        isConsumable: true,
        isQuestItem: false,
        isSellable: true,
        isUnique: false,

        value: 0.5, // 50 Silver,
        weight: 0.2, // 0.2 lbs,
        rarity: "Common",

        maxStack: 10,
        // systemTrigger: "" // Handled in-game, may be a thing that is used in quests and/or rituals, etc.
    }
*/