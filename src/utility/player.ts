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

// [6]: Melee < 100 Distance
// [7]: Ranged < 100 Distance

// [8]: Melee > 100 && < 200 Distance
// [9]: Ranged > 100 && < 200 Distance

// [10]: Melee > 200 Distance && Distance < 300
// [11]: Ranged > 200 Distance && Distance < 300

// [12]: Melee > 300 Distance
// [13]: Ranged > 300 Distance

// Currently 10 'Instincts' and 16 Options + Invoke

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
            value: States.POLYMORPH
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

export const ENEMY_ENEMIES = {
    "Achreon Druid": ["Kyn'gian Shaman", "Tshaeral Shaman", "Kingsman", "Northren Wanderer"],
    "Ahn'are Apostle": ["Astral Apostle", "Licivitan Soldier", "Daethic Inquisitor", "Daethic Knight"],
    "Anashtre": ["Daethic Knight", "Soverain Blood Cloak", "Licivitan Soldier", "Daethic Inquisitor"],
    "Astral Apostle": ["Ahn'are Apostle", "Licivitan Soldier", "Daethic Inquisitor", "Daethic Knight"],
    "Cambiren Druid": ["Kyn'gian Shaman", "Tshaeral Shaman", "Kingsman", "Northren Wanderer"],
    "Chiomic Jester": ["Fang Duelist", "Fang Mercenary", "Marauder", "Shrygeian Bard"],
    "Daethic Inquisitor": ["Ilire Occultist", "Fyers Occultist", "Ma'ier Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Daethic Knight": ["Anashtre", "Soverain Blood Cloak", "Firesworn", "Se'va Shrieker", "Quor'eite Stalker"],
    "Fang Duelist": ["Chiomic Jester", "Fang Mercenary", "Marauder", "Shrygeian Bard"],
    "Fang Mercenary": ["Chiomic Jester", "Fang Duelist", "Marauder", "Shrygeian Bard"],
    "Firesworn": ["Daethic Knight", "Fang Mercenary", "Se'va Shrieker", "Quor'eite Stalker", "Southron Wanderer"],
    "Fyers Occultist": ["Daethic Inquisitor", "Ilire Occultist", "Ma'ier Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Ilire Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ma'ier Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Kingsman": ["Achreon Druid", "Cambiren Druid", "Northren Wanderer", "Soverain Blood Cloak"],
    "Kyn'gian Shaman": ["Achreon Druid", "Cambiren Druid", "Southron Wanderer", "Sedyreal Guard", "Quor'eite Stalker"],
    "Licivitan Soldier": ["Old Li'ivi Occultist", "Firesworn", "Soverain Blood Cloak", "Kingsman", "Se'va Shrieker"],
    "Ma'ier Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ilire Occultist", "Quor'eite Occultist", "Old Li'ivi Occultist"],
    "Marauder": ["Fang Duelist", "Fang Mercenary", "Chiomic Jester", "Shrygeian Bard"],
    "Mavrosin Occultist": [],
    "Northren Wanderer": ["Achreon Druid", "Cambiren Druid", "Kingsman", "Soverain Blood Cloak"],
    "Nyren": ["Rahvrecur", "Se'va Shrieker", "Marauder", "Fang Mercenary"],
    "Old Li'ivi Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ilire Occultist", "Ma'ier Occultist", "Quor'eite Occultist"],
    "Quor'eite Occultist": ["Daethic Inquisitor", "Fyers Occultist", "Ilire Occultist", "Ma'ier Occultist", "Old Li'ivi Occultist"],
    "Quor'eite Stalker": ["Daethic Knight", "Firesworn", "Se'va Shrieker", "Sedyreal Guard", "Southron Wanderer"],
    "Rahvrecur": ["Nyren", "Se'va Shrieker", "Marauder", "Fang Mercenary"],
    "Se'dyrist": ["Se'va Shrieker", "Fang Mercenary", "Sedyreal Guard", "Firesworn"],
    "Sedyreal Guard": ["Se'dyrist", "Se'va Shrieker", "Firesworn", "Quor'eite Stalker", "Southron Wanderer"],
    "Se'va Shrieker": ["Se'dyrist", "Sedyreal Guard", "Firesworn", "Quor'eite Stalker", "Southron Wanderer"],
    "Shrygeian Bard": ["Chiomic Jester", "Fang Duelist", "Fang Mercenary", "Marauder"],
    "Southron Wanderer": ["Firesworn", "Quor'eite Stalker", "Sedyreal Guard", "Se'va Shrieker"],
    "Soverain Blood Cloak": ["Anashtre", "Licivitan Soldier", "Kingsman", "Northren Wanderer"],
    "Tshaeral Shaman": ["Achreon Druid", "Cambiren Druid", "Daethic Knight", "Daethic Inquisitor"],

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