export const SPECIAL = {

    'constitution': [
        'Consume', 
        'Desperation', 
        'Disease', 
        'Healing', 
        'Invoke', 
        'Mend', 
        'Renewal', 
        'Sacrifice', 
        'Shield', 
        'Ward'
    ], // 10

    'strength': [
        'Arc', 
        'Consume', 
        'Howl', 
        'Invoke', 
        'Leap', 
        'Recover', 
        'Scream', 
        'Storm', 
        'Suture', 
        'Tshaeral', 
        'Ward', 
        'Writhe'
    ], // 12

    'agility': [
        'Consume', 
        'Desperation', 
        'Envelop', 
        'Invoke', 
        'Pursuit', 
        'Recover', 
        'Rush', 
        'Shimmer', 
        'Snare', 
        'Sprint', 
        'Storm', 
        'Writhe'
    ], // 12

    'achre': [
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
        'Slow'], // 12
        
    'caeren': [
        'Chiomism', 
        'Consume', 
        'Desperation', 
        'Fear', 
        'Healing', 
        'Invoke', 
        'Mend', 
        'Protect', 
        'Sacrifice', 
        'Shield', 
        'Suture'
    ], // 12

    'kyosir': [
        'Chiomic', 
        'Chiomism', 
        'Confuse', 
        'Consume', 
        'Invoke', 
        'Malice', 
        'Protect', 
        'Scream', 
        'Suture', 
        'Tshaeral'
    ], // 10
};
export const ACTIONS = ['Attack', 'Posture', 'Roll', 'Dodge', 'Parry'];

export const SPECIALS = [
    'Arc',
    'Blink', 
    'Chiomic', 
    'Chiomism',
    'Confuse', 
    'Consume',
    'Desperation',
    'Disease',
    'Envelop',
    'Fear', 
    'Freeze',
    'Healing', 
    'Howl', 
    'Invoke', 
    'Leap', 
    'Malice',
    'Mend', 
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
    'Storm', // AoE that deals weapon damage on tick
    'Suture',
    'Tshaeral',
    'Ward',
    'Writhe',
]; // 'Charm', 'Counter', 'Shroud'

export const startingSpecials = {
    'constitution': ['Healing', 'Mend', 'Sacrifice', 'Shield', 'Ward'],
    'strength': ['Arc', 'Howl', 'Arc', 'Leap', 'Writhe'],
    'agility': ['Pursuit', 'Recover', 'Rush', 'Shimmer', 'Sprint'],
    'achre': ['Blink', 'Envelop', 'Polymorph', 'Root', 'Slow'],
    'caeren': ['Chiomism', 'Desperation', 'Fear', 'Protect', 'Suture'],
    'kyosir': ['Chiomic', 'Confuse', 'Malice', 'Scream', 'Tshaeral'],
};