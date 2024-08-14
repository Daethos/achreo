export const ACTIONS = ['Attack', 'Posture', 'Roll', 'Dodge', 'Parry'];
export const SPECIALS = [
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
    'Invoke',
    'Kynisos', 
    'Kyrnaicism',
    'Leap', 
    'Malice',
    'Mend', 
    'Paralyze',
    'Polymorph',
    'Protect', 
    'Pursuit', 
    'Recover', 
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
export const SPECIAL = {
    'constitution': [ // 15
        'Astrave',
        'Consume', 
        'Desperation', 
        'Disease', 
        'Healing', 
        'Invoke', 
        'Kyrnaicism', 
        'Mend', 
        'Paralyze',
        'Polymorph', 
        'Recover', 
        'Renewal', 
        'Sacrifice', 
        'Shield', 
        'Ward'
    ], // 15
    'strength': [ // 14
        'Achire',
        'Arc', 
        'Chiomic',
        'Consume', 
        'Desperation', 
        'Howl', 
        'Invoke', 
        'Leap', 
        'Recover', 
        'Rush', 
        'Scream', 
        'Sprint', 
        'Storm', 
        'Suture', 
        'Ward', 
        'Writhe'
    ], // 14
    'agility': [ // 15
        'Achire',
        'Consume', 
        'Desperation', 
        'Envelop', 
        'Invoke', 
        'Kynisos',
        'Leap', 
        'Pursuit', 
        'Recover', 
        'Rush', 
        'Shimmer', 
        'Snare', 
        'Sprint', 
        'Storm', 
        'Writhe'
    ], // 15
    'achre': [ // 15
        'Absorb',
        'Achire',
        'Astrave',
        'Blink', 
        'Consume', 
        'Desperation', 
        'Envelop', 
        'Freeze', 
        'Invoke', 
        'Polymorph', 
        'Recover', 
        'Root', 
        'Sacrifice', 
        'Shimmer', 
        'Slow'
    ], // 15
    'caeren': [ // 15
        'Absorb',
        'Astrave',
        'Blink', 
        'Consume', 
        'Desperation', 
        'Fear', 
        'Fyerus',
        'Healing', 
        'Invoke', 
        'Kyrnaicism', 
        'Mend', 
        'Protect', 
        'Sacrifice', 
        'Shield', 
        'Suture'
    ], // 15
    'kyosir': [ // 15
        'Absorb',
        'Achire',
        'Astrave',
        'Chiomic',
        'Confuse', 
        'Consume', 
        'Healing', 
        'Invoke', 
        'Kynisos',
        'Kyrnaicism', 
        'Malice', 
        'Paralyze',
        'Protect', 
        'Scream', 
        'Suture', 
    ], // 15
};
export const STARTING_SPECIALS = {
    'constitution': ['Healing', 'Kyrnaicism', 'Mend', 'Shield', 'Ward'],
    'strength': ['Arc', 'Howl', 'Leap', 'Storm', 'Writhe'],
    'agility': ['Pursuit', 'Recover', 'Rush', 'Shimmer', 'Sprint'],
    'achre': ['Blink', 'Envelop', 'Polymorph', 'Root', 'Slow'],
    'caeren': ['Desperation', 'Fear', 'Protect', 'Sacrifice', 'Suture'],
    'kyosir': ['Chiomic', 'Confuse', 'Malice', 'Paralyze', 'Scream'],
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
    "Astral": 'Astrication',
    "Cambiren": 'Caerenesis',
    "Fyeran": 'Seer',
    "Ilian": 'Blind',
    "Kyn'gian": 'Endurance',
    "Sedyrist" : 'Stimulate',
    "Se'van": 'Berserk',
    "Shaorahi": 'Conviction',
    "Shrygeian": 'Impermanence',
    "Tshaeral": 'Devour',
};
export const TRAITS = ["Astrication", "Caerenesis", "Seer", "Blind", "Endurance", "Stimulate", "Berserk", "Conviction", "Impermanence", "Devour"];