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
    'constitution': [ // 14
        'Astrave',
        'Consume', 
        'Desperation', 
        'Disease', 
        'Healing', 
        'Invoke', 
        'Kyrnaicism', 
        'Mend', 
        'Paralyze',
        'Recover', 
        'Renewal', 
        'Sacrifice', 
        'Shield', 
        'Ward'
    ], // 14
    'strength': [ // 13
        'Achire',
        'Arc', 
        'Consume', 
        'Howl', 
        'Invoke', 
        'Leap', 
        'Recover', 
        'Rush', 
        'Scream', 
        'Storm', 
        'Suture', 
        'Ward', 
        'Writhe'
    ], // 13
    'agility': [ // 14
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
    ], // 14
    'achre': [ // 15
        'Absorb',
        'Achire',
        'Astrave',
        'Blink', 
        'Confuse', 
        'Consume', 
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
    'caeren': [ // 13
        'Absorb',
        'Astrave',
        'Consume', 
        'Desperation', 
        'Fear', 
        'Fyerus',
        'Healing', 
        'Invoke', 
        'Mend', 
        'Protect', 
        'Sacrifice', 
        'Shield', 
        'Suture'
    ], // 13
    'kyosir': [ // 13
        'Absorb',
        'Astrave',
        'Chiomic',
        'Confuse', 
        'Consume', 
        'Invoke', 
        'Kynisos',
        'Kyrnaicism', 
        'Malice', 
        'Paralyze',
        'Protect', 
        'Scream', 
        'Suture', 
    ], // 13
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
            'border': 0xfdf6d8,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x000000,
            'color': 0xfdf6d8
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
            'border': 0xff0000,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x000000,
            'color': 0xff0000
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
            'border': 0x00ff00,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x000000,
            'color': 0x00ff00
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
            'border': 0x0000ff,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x000000,
            'color': 0x0000ff
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
            'border': 0x800080,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x000000,
            'color': 0x800080
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
            'border': 0xFFD700,
            'color': 0x000000
        },
        'specialButtons': {
            'border': 0x000000,
            'color': 0xFFD700
        }
    },
}
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