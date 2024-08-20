import { populateEnemy, randomEnemy } from "../assets/db/db";
import { EventBus } from "../game/EventBus";
import Ascean from "../models/ascean";
import { States } from "../phaser/StateMachine";
import { Compiler, asceanCompiler } from "./ascean";
export const ENEMY_SPECIAL = {
    'constitution': [ // 11
        'Chiomic', 
        'Desperation', 
        'Disease', 
        'Healing', 
        'Kyrnaicism', 
        'Malice', 
        'Mend', 
        'Renewal', 
        'Sacrifice', 
        'Shield', 
        'Ward'
    ], // 11

    'strength': [ // 11
        'Desperation',
        'Howl', 
        'Malice', 
        'Mend', 
        'Rush',
        'Scream', 
        'Sprint', 
        'Suture', 
        'Tshaeral', 
        'Ward', 
        'Writhe'
    ], // 11

    'agility': [ // 12
        'Desperation', 
        'Disease', 
        'Howl', 
        'Mend', 
        'Pursuit', 
        'Rush', 
        'Shimmer', 
        'Snare', 
        'Slowing',
        'Sprint', 
        'Suture', 
        'Writhe'
    ], // 12

    'achre': [ // 12
        'Blink',
        'Chiomic', 
        'Confuse',
        'Freeze', 
        'Healing',
        'Mend', 
        'Malice', 
        'Polymorph', 
        'Shimmer', 
        'Slowing',
        'Snare',
        'Suture', 
    ], // 12
        
    'caeren': [ // 11
        'Chiomic', 
        'Desperation', 
        'Devour',
        'Fear', 
        'Healing', 
        'Kyrnaicism', 
        'Mend', 
        'Protect', 
        'Sacrifice', 
        'Shield', 
        'Suture'
    ], // 11

    'kyosir': [ // 12
        'Chiomic', 
        'Confuse',
        'Devour',
        'Disease', 
        'Healing', 
        'Kyrnaicism', 
        'Malice', 
        'Protect', 
        'Sacrifice', 
        'Scream', 
        'Suture', 
        'Tshaeral'
    ], // 12
};
export const DISTANCE = {
    MIN: 0,
    ATTACK: 25,
    MOMENTUM: 2,
    THRESHOLD: 75,
    CHASE: 75,
    RANGED_ALIGNMENT: 10,
    RANGED_MULTIPLIER: 3,
    DODGE: 1152, // 2304
    ROLL: 960, // 1920
};
export const DURATION = {
    CONSUMED: 2000,
    FEARED: 3000,
    FROZEN: 3000,
    PARALYZED: 4000,
    ROOTED: 3000,
    SLOWED: 3000,
    SNARED: 5000,
    STUNNED: 3000,
    TEXT: 1500,
    DODGE: 288, // 288
    ROLL: 320, // 320
    SPECIAL: 10000,
};
export const RANGE = {
    LEASH: 750,
}; 
export const INSTINCTS = {
    'constitution': [{
            key: 'stateMachine',
            value: States.HEALING
        },{
            key: 'positiveMachine',
            value: States.RENEWAL
        },{
            key: 'positiveMachine',
            value: States.WARD
        },{
            key: 'stateMachine',
            value: States.KYRNAICISM
    }],
    'strength': [{
            key: 'stateMachine',
            value: States.DEVOUR
        },{
            key: 'positiveMachine',
            value: States.WARD
        },{
            key: 'stateMachine',
            value: States.DESPERATION
        },{
            key: 'stateMachine',
            value: States.RUSH
    }],
    'agility': [{
            key: 'stateMachine',
            value: States.DESPERATION
        },{
            key: 'positiveMachine',
            value: States.SHIMMER
        },{
            key: 'positiveMachine',
            value: States.SPRINTING
        },{
            key: 'stateMachine',
            value: States.RUSH
    }],
    'achre': [{
            key: 'stateMachine',
            value: States.HEALING
        },{
            key: 'positiveMachine',
            value: States.MEND
        },{
            key: 'stateMachine',
            value: States.SLOW
        },{
            key: 'stateMachine',
            value: States.SACRIFICE
    }],
    'caeren': [{
            key: 'stateMachine',
            value: States.DESPERATION
        },{
            key: 'positiveMachine',
            value: States.MEND
        },{
            key: 'stateMachine',
            value: States.SUTURE
        },{
            key: 'stateMachine',
            value: States.SACRIFICE
    }],
    'kyosir': [{
            key: 'stateMachine',
            value: States.HEALING
        },{
            key: 'positiveMachine',
            value: States.MALICE
        },{
            key: 'stateMachine',
            value: States.KYRNAICISM
        },{
            key: 'stateMachine',
            value: States.DEVOUR
    }]
};
export const GRIP_SCALE = { 'One Hand': 0.5, 'Two Hand': 0.65 };
export type EnemySheet = {
    id: string;
    game: Ascean;
    enemy: Compiler;
    health: number;
    isAggressive: boolean;
    startedAggressive: boolean;
    isDefeated: boolean;
    isTriumphant: boolean;
    isLuckout: boolean;
    isPersuaded: boolean;
    playerTrait: string;
};
const levelRanges = [
    { range: [1, 2], min: 1, max: 2 },
    { range: [3, 4], min: 2, max: 4 },
    { range: [5, 6], min: 4, max: 6 },
    { range: [7, 8], min: 5, max: 9 },
    { range: [9, 10], min: 7, max: 12 },
    { range: [11, 12], min: 8, max: 14 },
    { range: [13, 14], min: 10, max: 16 },
    { range: [15, 18], min: 12, max: 18 },
    { range: [19, 20], min: 16, max: 20 }
];
function getEnemyLevels(level: number): { min: number, max: number } {
    let min: number = 0, max: number = 0; 
    for (const { range, min: rangeMin, max: rangeMax } of levelRanges) {
        const [rangeStart, rangeEnd] = range;
        if (level >= rangeStart && level <= rangeEnd) {
            min = rangeMin;
            max = rangeMax;
            break;
        };
    };
    return { min, max };
}; 
export function fetchEnemy(e: { enemyID: string; level: number; }): void {
    try { 
        const { min, max } = getEnemyLevels(e.level); 
        let enemy = randomEnemy(min, max);
        enemy = populateEnemy(enemy);
        const res = asceanCompiler(enemy);
        EventBus.emit('enemy-fetched', { enemy: res?.ascean, combat: res, enemyID: e.enemyID });
        EventBus.emit('update-enemies', { ...res?.ascean, enemyID: e.enemyID });
    } catch (err: any) {
        console.log(err.message, 'Error retrieving Enemies')
    };
};