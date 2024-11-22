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
    'constitution': [ // 14
        'Invoke',
        'Consume',
        'Mark',
        'Recall',

        'Absorb',
        'Dispel',
        'Healing',
        'Ilirech',
        'Maiereth',
        'Kyrnaicism', 
        'Kynisos', 
        'Mend',
        'Paralyze',
        'Renewal',
        'Shield',
        'Shirk',
        'Tether',
        'Ward'
    ], // 14 
    'strength': [ // 14
        'Invoke',
        'Consume',
        
        'Arc',
        'Desperation',
        'Hook',
        'Howl',
        'Leap',
        'Quor',
        'Recover',
        'Rush',
        'Scream',
        'Sprint',
        'Storm',
        'Tether',
        'Ward',
        'Writhe'
    ], // 14
    'agility': [ // 14
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Achire',
        'Desperation',
        'Envelop',
        'Hook',
        'Kynisos',
        'Leap',
        'Pursuit',
        'Recover',
        'Rush',
        'Shadow',
        'Shimmer',
        'Snare',
        'Sprint',
        'Storm',
    ], // 14
    'achre': [ // 14 
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Absorb',
        'Achire',
        'Astrave',
        'Blink',
        'Freeze',
        'Fyerus',
        'Moderate',
        'Multifarious',
        'Netherswap',
        'Polymorph',
        'Quor',
        'Reconstitute',
        'Rein',
        'Slow'
    ], // 14 
    'caeren': [ // 14
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Achire',
        'Astrave',
        'Fear',
        'Fyerus',
        'Healing',
        'Ilirech',
        'Kyrnaicism',
        'Malice',
        'Menace',
        'Mend',
        'Rein',
        'Sacrifice', 
        'Scream',
        'Shirk'
    ], // 14
    'kyosir': [ // 14
        'Invoke',
        'Consume',
        'Mark',
        'Recall',
        
        'Chiomic',
        'Confuse',
        'Disease',
        'Dispel',
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
export const STARTING_SPECIALS = {
    'constitution': ['Healing', 'Kyrnaicism', 'Mend', 'Renewal', 'Shield'],
    'strength': ['Arc', 'Desperation', 'Howl', 'Leap', 'Storm'],
    'agility': ['Pursuit', 'Recover', 'Rush', 'Shimmer', 'Sprint'],
    'achre': ['Blink', 'Envelop', 'Polymorph', 'Root', 'Slow'],
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