import { States } from "../game/phaser/StateMachine";
/*        
    0     1     2

    3     -     4

    5     6     7
*/
type COORDINATES = { x: number, y: number };
export const PARTY_OFFSET: {[key:number]: COORDINATES} = {
    // Top Left to Right
    0: { x: -60, y: -30 },
    1: { x: 0, y: -30 },
    2: { x: 60, y: -30 },
    // Middle Left, Right
    3: { x: -60, y: 0 },
    4: { x: 60, y: 0 },
    // Bottom Left to Right
    5: { x: -60, y: 36 },
    6: { x: 0, y: 36 },
    7: { x: 60, y: 36 },
};
export const PARTY_SPECIAL = {
    'constitution': [ // 14
        'Absorb',
        'Blind',
        'Desperation',
        'Dispel',
        'Healing',
        'Ilirech',
        'Maiereth',
        'Kyrnaicism', 
        'Kynisos', 
        'Mend',
        'Paralyze',
        'Reconstitute',
        'Renewal',
        'Shield',
        'Shirk',
        'Tether',
        'Ward'
    ], // 14 
    'strength': [ // 14
        'Arc',
        'Blind',
        'Caerenesis',
        'Desperation',
        'Devour',
        'Healing',
        'Hook',
        'Howl',
        'Leap',
        'Quor',
        'Reconstitute',
        'Rush',
        'Scream',
        'Sprint',
        'Storm',
        'Tether',
        'Ward',
        'Writhe'
    ], // 14
    'agility': [ // 14
        'Achire',
        'Desperation',
        'Envelop',
        'Healing',
        'Hook',
        'Kynisos',
        'Leap',
        'Pursuit',
        'Reconstitute',
        'Rush',
        'Shadow',
        'Shimmer',
        'Snare',
        'Sprint',
        'Storm',
    ], // 14
    'achre': [ // 14
        'Absorb',
        'Achire',
        'Astrave',
        'Blink',
        'Caerenesis',
        'Desperation',
        'Devour',
        'Freeze',
        'Fyerus',
        'Healing',
        'Moderate',
        'Multifarious',
        'Netherswap',
        'Polymorph',
        'Quor',
        'Reconstitute',
        'Slow'
    ], // 14 
    'caeren': [ // 14
        'Achire',
        'Astrave',
        'Blink',
        'Caerenesis',
        'Desperation',
        'Fear',
        'Fyerus',
        'Healing',
        'Ilirech',
        'Kyrnaicism',
        'Malice',
        'Menace',
        'Mend',
        'Reconstitute',
        'Sacrifice', 
        'Scream',
        'Shirk'
    ], // 14
    'kyosir': [ // 14
        'Blink',
        'Chiomic',
        'Confuse',
        'Desperation',
        'Devour',
        'Disease',
        'Dispel',
        'Healing',
        'Hook',
        'Kynisos',
        'Maiereth',
        'Malice',
        'Mystify',
        'Netherswap',
        'Protect',
        'Reconstitute',
        'Sacrifice',
        'Suture'
    ], // 14
};

const STATE = "stateMachine";
const POSITIVE = "positiveMachine";

export const PARTY_INSTINCTS = {
    'constitution': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: STATE,
            value: States.HEALING
        },{ // 2 - Starter Heal
            key: POSITIVE,
            value: States.MEND
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
            key: POSITIVE,
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
            key: POSITIVE,
            value: States.MEND
        },{ // 3 - Critical Damage
            key: STATE,
            value: States.RUSH
        },{ // 4 - Casual Damage
            key: STATE,
            value: States.STORM
        },{ // 5 - Starter Damage
            key: STATE,
            value: States.LEAP
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
            key: POSITIVE,
            value: States.WARD
        }
    ],
    'agility': [
        { // 0 - Critical Heal
            key: STATE,
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: STATE,
            value: States.HEAL
        },{ // 2 - Starter Heal
            key: STATE,
            value: States.ENVELOP
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
            value: States.ABSORB
        },{ // 9 - Ranged > 100 && < 200 Distance
            key: POSITIVE,
            value: States.ABSORB
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
            key: POSITIVE,
            value: States.ABSORB
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
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: STATE,
            value: States.HEAL
        },{ // 2 - Starter Heal
            key: POSITIVE,
            value: States.MEND
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
            key: POSITIVE,
            value: States.MEND
        },{ // 13 - Ranged > 300 Distance
            key: POSITIVE,
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
            value: States.KYRNAICISM
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
            key: POSITIVE,
            value: States.PROTECT
        }
    ]
};

export const BALANCED = "Balance";
export const DEFENSIVE = "Defensive";
export const OFFENSIVE = "Offensive";

export const PARTY_BALANCED_INSTINCTS = {
    "constitution": [States.ILIRECH, States.KYNISOS, States.KYRNAICISM, States.PARALYZE, States.WARD],
    "strength": [States.QUOR, States.SPRINTING, States.STORM, States.WARD, States.LEAP],
    "agility": [States.ACHIRE, States.KYNISOS, States.RUSH, States.SPRINTING, States.PURSUIT],
    "achre": [States.ACHIRE, States.ASTRAVE, States.BLINK, States.FYERUS, States.SLOW],
    "caeren": [States.ASTRAVE, States.FEAR, States.ILIRECH, States.HEALING, States.SCREAM],
    "kyosir": [States.CONFUSE, States.DISPEL, States.KYNISOS, States.KYRNAICISM, States.SUTURE],
};
export const PARTY_DEFENSIVE_INSTINCTS = {
    "constitution": [States.ABSORB, States.DESPERATION, States.HEALING, States.KYRNAICISM, States.SHIELD, States.SHIRK],
    "strength": [States.DESPERATION, States.HOWL, States.MEND, States.SPRINTING, States.WARD],
    "agility": [States.DESPERATION, States.ENVELOP, States.KYRNAICISM, States.SHIMMER, States.SNARE],
    "achre": [States.ABSORB, States.BLINK, States.DESPERATION, States.MODERATE, States.SLOW],
    "caeren": [States.DESPERATION, States.FEAR, States.HEAL, States.KYRNAICISM, States.MEND],
    "kyosir": [States.CONFUSE, States.DESPERATION, States.HEALING, States.MYSTIFY, States.PROTECT, States.SUTURE],
};
export const PARTY_OFFENSIVE_INSTINCTS = {
    "constitution": [States.DISPEL, States.ILIRECH, States.KYNISOS, States.KYRNAICISM, States.MAIERETH, States.PARALYZE],
    "strength": [States.LEAP, States.QUOR, States.RUSH, States.SPRINTING, States.STORM],
    "agility": [States.ACHIRE, States.KYNISOS, States.RUSH, States.SPRINTING, States.STORM],
    "achre": [States.ACHIRE, States.ASTRAVE, States.BLINK, States.FYERUS, States.QUOR],
    "caeren": [States.ACHIRE, States.ASTRAVE, States.ILIRECH, States.MALICE, States.KYRNAICISM, States.SACRIFICE],
    "kyosir": [States.DISPEL, States.KYRNAICISM, States.MAIERETH, States.MALICE, States.SACRIFICE],
};