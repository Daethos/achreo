export const ACTIONS = ['Attack', 'Posture', 'Roll', 'Dodge', 'Parry', 'Thrust'];
export const SPECIALS = [
    'Invoke',
    'Consume',
    'Absorb',
    'Achire',
    'Astrave',
    "Astrication", 
    'Arc',
    "Berserk", 
    "Blind", 
    'Blink',
    'Chiomic',
    'Chiomism',
    "Caerenesis", 
    'Confuse',
    "Conviction", 
    'Desperation',
    "Devour",
    'Disease',
    'Dispel',
    "Endurance", 
    'Envelop',
    'Fear',
    'Freeze',
    'Frost',
    'Fyerus',
    'Healing',
    'Hook',
    'Howl',
    'Ilirech',
    "Impermanence", 
    'Kynisos',
    'Kyrisian',
    'Kyrnaicism',
    'Leap',
    'Likyr',
    'Maiereth',
    'Malice',
    'Mark',
    'Menace',
    'Mend',
    'Moderate',
    'Multifarious',
    'Mystify',
    'Netherswap',
    'Paralyze',
    'Polymorph',
    'Protect',
    'Pursuit',
    'Recall',
    'Quor',
    'Reconstitute',
    'Recover',
    'Rein',
    'Renewal',
    'Root',
    'Rush',
    'Sacrifice',
    'Scream',
    "Seer",
    'Shadow',
    'Shield',
    'Shimmer',
    'Shirk',
    'Slow',
    'Snare',
    'Sprint',
    "Stimulate",
    'Storm',
    'Suture',
    'Tether',
    'Ward',
    'Writhe',
]; // 'Charm', 'Shroud'
export const SPECIAL = { // 14 Each + Invoke, Consume, Mark, Recall
    'constitution': [
        'Invoke',
        'Consume',
        'Mark',
        'Recall',

        'Absorb',
        'Desperation',
        'Dispel',
        'Healing',
        'Ilirech',
        'Kyrnaicism', 
        'Kynisos',
        'Kyrisian',
        'Likyr',
        'Mend',
        'Paralyze',
        'Reconstitute',
        'Renewal',
        'Shield',
        'Shirk',
        'Suture',
        'Tether',
        'Ward'
    ], 
    'strength': [
        'Invoke',
        'Consume',
        
        'Arc',
        'Desperation',
        'Healing',
        'Hook',
        'Howl',
        'Ilirech',
        'Leap',
        'Quor',
        'Reconstitute',
        'Recover',
        'Rush',
        'Scream',
        'Shield',
        'Sprint',
        'Storm',
        'Tether',
        'Ward',
        'Writhe'
    ],
    'agility': [
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Achire',
        'Desperation',
        'Envelop',
        'Healing',
        'Hook',
        'Kynisos',
        'Leap',
        'Pursuit',
        'Reconstitute',
        'Recover',
        'Rush',
        'Shadow',
        'Shimmer',
        'Shirk',
        'Snare',
        'Sprint',
        'Storm',
        'Writhe'
    ],
    'achre': [
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Absorb',
        'Achire',
        'Astrave',
        'Blink',
        'Desperation',
        'Dispel',
        'Freeze',
        'Frost',
        'Fyerus',
        'Healing',
        'Moderate',
        'Multifarious',
        'Netherswap',
        'Polymorph',
        'Quor',
        'Reconstitute',
        'Rein',
        'Sacrifice',
        'Slow',
        'Snare'
    ], 
    'caeren': [
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Achire',
        'Astrave',
        'Desperation',
        'Fear',
        'Fyerus',
        'Healing',
        'Ilirech',
        'Kyrnaicism',
        'Maiereth',
        'Malice',
        'Menace',
        'Mend',
        'Reconstitute',
        'Rein',
        'Sacrifice',
        'Scream',
        'Shirk',
        'Suture'
    ],
    'kyosir': [
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Chiomic',
        'Chiomism',
        'Confuse',
        'Desperation',
        'Disease',
        'Dispel',
        'Healing',
        'Hook',
        'Ilirech',
        'Kynisos',
        'Kyrnaicism',
        'Malice',
        'Mystify',
        'Netherswap',
        'Protect',
        'Reconstitute',
        'Sacrifice',
        'Suture'
    ],
};
export const STARTING_SPECIALS = {
    'constitution': ['Healing', 'Kyrnaicism', 'Likyr', 'Renewal', 'Shield'],
    'strength': ['Arc', 'Desperation', 'Howl', 'Leap', 'Storm'],
    'agility': ['Pursuit', 'Recover', 'Rush', 'Shimmer', 'Sprint'],
    'achre': ['Absorb', 'Achire', 'Blink', 'Frost', 'Polymorph'],
    'caeren': ['Fear', 'Maiereth', 'Mend', 'Scream', 'Suture'],
    'kyosir': ['Chiomism', 'Confuse', 'Malice', 'Reconstitute', 'Sacrifice'],
};
export const STARTING_MASTERY_UI = {
    'constitution': {
        'leftJoystick': {
            'base': 0x000000,
            'thumb': 0xfdf6d8
        },
        'rightJoystick': {
            'base': 0x000000,
            'thumb': 0xfdf6d8
        },
        'actionButtons': {
            'border': 0xb8a30b,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0xfdf6d8,
            'color': 0x000000
        }
    },
    'strength': {
        'leftJoystick': {
            'base': 0x000000,
            'thumb': 0xff0000
        },
        'rightJoystick': {
            'base': 0x000000,
            'thumb': 0xff0000
        },
        'actionButtons': {
            'border': 0x301934,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0xff0000,
            'color': 0x000000
        }
    },
    'agility': {
        'leftJoystick': {
            'base': 0x000000,
            'thumb': 0x00ff00
        },
        'rightJoystick': {
            'base': 0x000000,
            'thumb': 0x00ff00
        },
        'actionButtons': {
            'border': 0x191970,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x00ff00,
            'color': 0x000000
        }
    },
    'achre': {
        'leftJoystick': {
            'base': 0x000000,
            'thumb': 0x0000ff
        },
        'rightJoystick': {
            'base': 0x000000,
            'thumb': 0x0000ff
        },
        'actionButtons': {
            'border': 0x355E3B,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x0000ff,
            'color': 0x000000
        }
    },
    'caeren': {
        'leftJoystick': {
            'base': 0x000000,
            'thumb': 0x800080
        },
        'rightJoystick': {
            'base': 0x000000,
            'thumb': 0x800080
        },
        'actionButtons': {
            'border': 0x8B0000,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x800080,
            'color': 0x000000
        }
    },
    'kyosir': {
        'leftJoystick': {
            'base': 0x000000,
            'thumb': 0xFFD700
        },
        'rightJoystick': {
            'base': 0x000000,
            'thumb': 0xFFD700
        },
        'actionButtons': {
            'border': 0xd9d9d9,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0xFFD700,
            'color': 0x000000
        }
    },
};
export const TRAIT_SPECIALS = {
    "Astral": ['Astrication', 'Devour'],
    "Cambiren": ['Caerenesis'],
    "Fyeran": ['Caerenesis', 'Seer'],
    "Ilian": ['Blind'],
    "Kyn'gian": ['Endurance'],
    "Sedyrist" : ['Stimulate'],
    "Se'van": ['Berserk', 'Seer'],
    "Shaorahi": ['Caerenesis', 'Conviction'],
    "Shrygeian": ['Impermanence', 'Devour'],
    "Tshaeral": ['Devour'],
};
export const TRAITS = ["Astrication", "Caerenesis", "Seer", "Blind", "Endurance", "Stimulate", "Berserk", "Conviction", "Impermanence", "Devour"];

export const INVOKE = 'Invoke';
export const CONSUME = 'Consume';
export const ABSORB = "Absorb";
export const ACHIRE = "Achire";
export const ASTRAVE = "Astrave";
export const ASTRICATION = "Astrication";
export const ARC = "Arc";
export const BERSERK = "Berserk";
export const BLIND = "Blind";
export const BLINK = "Blink";
export const CHIOMIC = "Chiomic";
export const CHIOMISM = "Chiomism";
export const CAERENESIS = "Caerenesis";
export const CONFUSE = "Confuse";
export const CONVICTION = "Conviction";
export const DESPERATION = "Desperation";
export const DEVOUR = "Devour";
export const DISEASE = "Disease";
export const DISPEL = "Dispel";
export const ENDURANCE = "Endurance";
export const ENVELOP = "Envelop";
export const FEAR = "Fear";
export const FREEZE = "Freeze";
export const FROST = "Frost";
export const FYERUS = "Fyerus";
export const HEALING = "Healing";
export const HOOK = "Hook";
export const HOWL = "Howl";
export const ILIRECH = "Ilirech";
export const IMPERMANENCE = "Impermanence";
export const KYNISOS = "Kynisos";
export const KYRISIAN = "Kyrisian";
export const KYRNAICISM = "Kyrnaicism";
export const LEAP = "Leap";
export const LIKYR = "Likyr";
export const MAIERETH = "Maiereth";
export const MALICE = "Malice";
export const MARK = "Mark";
export const MENACE = "Menace";
export const MEND = "Mend";
export const MODERATE = "Moderate";
export const MULTIFARIOUS = "Multifarious";
export const MYSTIFY = "Mystify";
export const NETHERSWAP = "Netherswap";
export const PARALYZE = "Paralyze";
export const POLYMORPH = "Polymorph";
export const PROTECT = "Protect";
export const PURSUIT = "Absorb";
export const RECALL = "Recall";
export const QUOR = "Quor";
export const RECONSTITUTE = "Reconstitute";
export const RECOVER = "Recover";
export const REIN = "Rein";
export const RENEWAL = "Renewal";
export const ROOT = "Root";
export const RUSH = "Rush";
export const SACRIFICE = "Sacrifice";
export const SCREAM = "Scream";
export const SEER = "Seer";
export const SHADOW = "Shadow";
export const SHIELD = "Shield";
export const SHIMMER = "Shimmer";
export const SHIRK = "Shirk";
export const SLOW = "Slow";
export const SNARE = "Snare";
export const SPRINT = "Sprint";
export const STIMULATE = "Stimulate";
export const STORM = "Storm";
export const SUTURE = "Suture";
export const TETHER = "Tether";
export const WARD = "Ward";
export const WRITHE = "Writhe";