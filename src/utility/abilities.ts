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
    'Fyerus',
    'Healing',
    'Hook',
    'Howl',
    'Ilirech',
    "Impermanence", 
    'Kynisos',
    'Kyrnaicism',
    'Leap',
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
        'Maiereth',
        'Kyrnaicism', 
        'Kynisos', 
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
        'Fyerus',
        'Healing',
        'Maiereth',
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
        'Confuse',
        'Desperation',
        'Disease',
        'Dispel',
        'Healing',
        'Hook',
        'Kynisos',
        'Kyrnaicism',
        'Maiereth',
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
    'constitution': ['Healing', 'Kyrnaicism', 'Mend', 'Renewal', 'Shield'],
    'strength': ['Arc', 'Desperation', 'Howl', 'Leap', 'Storm'],
    'agility': ['Pursuit', 'Recover', 'Rush', 'Shimmer', 'Sprint'],
    'achre': ['Blink', 'Absorb', 'Polymorph', 'Astrave', 'Slow'],
    'caeren': ['Fear', 'Ilirech', 'Mend', 'Sacrifice', 'Scream'],
    'kyosir': ['Confuse', 'Maiereth', 'Malice', 'Reconstitute', 'Sacrifice'],
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