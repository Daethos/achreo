export const ACTIONS = ['Attack', 'Posture', 'Roll', 'Dodge', 'Parry', 'Thrust'];
export const SPECIALS = [
    'Hook',
    'Mark',
    'Netherswap',
    'Recall',
    'Absorb',
    'Achire',
    'Astrave',
    'Arc',
    'Blink',
    'Chiomic',
    'Confuse',
    'Consume',
    'Desperation',
    'Disease',
    'Envelop',
    'Fear',
    'Freeze',
    'Fyerus',
    'Healing',
    'Howl',
    'Ilirech',
    'Invoke',
    'Kynisos',
    'Kyrnaicism',
    'Leap',
    'Maiereth',
    'Malice',
    'Menace',
    'Mend',
    'Moderate',
    'Multifarious',
    'Mystify',
    'Paralyze',
    'Polymorph',
    'Protect',
    'Pursuit',
    'Quor',
    'Reconstitute',
    'Recover',
    'Rein',
    'Renewal',
    'Root',
    'Rush',
    'Sacrifice',
    'Scream',
    'Shield',
    'Shimmer',
    'Slow',
    'Snare',
    'Sprint',
    'Storm',
    'Suture',
    'Ward',
    'Writhe',
]; // 'Charm', 'Shroud'
export const SPECIAL = { // 12 Each + Invoke, Consume, and New: [Hook, Mark, Netherswap, Recall]
    'constitution': [ // 12
        'Invoke', 
        'Consume', 
        'Hook',
        'Mark',
        'Recall',

        'Absorb',
        'Fyerus',
        'Healing', 
        'Ilirech',
        'Maiereth',
        'Kyrnaicism', 
        'Kynisos', 
        'Mend', 
        'Paralyze',
        'Renewal', 
        'Shield', 
        'Ward',
    ], // 12 
    'strength': [ // 12
        'Invoke', 
        'Consume',
        'Hook',
        'Mark',
        'Recall',

        'Arc',
        'Desperation',
        'Howl',
        'Leap',
        'Quor',
        'Recover',
        'Rush',
        'Scream',
        'Sprint',
        'Storm',
        'Ward', 
        'Writhe'
    ], // 12
    'agility': [ // 12
        'Invoke', 
        'Consume',
        'Hook',
        'Mark',
        'Recall',
        
        'Achire',
        'Desperation', 
        'Envelop', 
        'Kynisos',
        'Leap', 
        'Pursuit', 
        'Recover', 
        'Rush', 
        'Shimmer', 
        'Snare', 
        'Sprint', 
        'Storm', 
    ], // 12
    'achre': [ // 12 
        'Invoke', 
        'Consume', 
        'Hook',
        'Mark',
        'Netherswap',
        'Recall',

        'Absorb',
        'Achire',
        'Astrave',
        'Blink', 
        'Freeze',
        'Moderate',
        'Multifarious',
        'Polymorph', 
        'Quor',
        'Reconstitute',
        'Rein',
        'Slow'
    ], // 12 
    'caeren': [ // 12
        'Invoke', 
        'Consume', 
        'Hook',
        'Mark',
        'Recall',

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
    ], // 12
    'kyosir': [ // 12
        'Invoke', 
        'Consume', 
        'Hook',
        'Netherswap',

        'Achire',
        'Chiomic',
        'Confuse', 
        'Disease',
        'Maiereth',
        'Malice', 
        'Mystify',
        'Paralyze',
        'Protect', 
        'Reconstitute',
        'Sacrifice', 
        'Suture'
    ], // 12
};
export const STARTING_SPECIALS = {
    'constitution': ['Healing', 'Kyrnaicism', 'Mend', 'Shield', 'Ward'],
    'strength': ['Arc', 'Desperation', 'Howl', 'Leap', 'Storm'],
    'agility': ['Pursuit', 'Recover', 'Rush', 'Shimmer', 'Sprint'],
    'achre': ['Blink', 'Envelop', 'Polymorph', 'Root', 'Slow'],
    'caeren': ['Fear', 'Ilirech', 'Mend', 'Sacrifice', 'Suture'],
    'kyosir': ['Confuse', 'Maiereth', 'Malice', 'Paralyze', 'Reconstitute'],
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