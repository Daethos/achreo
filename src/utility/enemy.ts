import { nonRandomEnemy, populateEnemy, randomEnemy } from "../assets/db/db";
import { EventBus } from "../game/EventBus";
import Ascean from "../models/ascean";
import { States } from "../game/phaser/StateMachine";
import { Compiler, asceanCompiler } from "./ascean";
export const ENEMY_SPECIAL = {
    'constitution': [ // 14
        'Desperation', 
        'Disease', 
        'Healing', 
        'Ilirech',
        'Kyrnaicism', 
        'Malice', 
        'Maiereth',
        'Mend', 
        'Renewal', 
        'Sacrifice', 
        'Scream', 
        'Shield', 
        'Suture', 
        'Ward'
    ], // 14

    'strength': [ // 12
        'Desperation',
        'Howl', 
        'Malice', 
        'Mend',
        'Pursuit', 
        'Rush',
        'Scream', 
        'Sprint', 
        'Suture', 
        'Tshaeral', 
        'Ward', 
        'Writhe'
    ], // 12

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

    'achre': [ // 14
        'Blink',
        'Freeze', 
        'Ilirech',
        'Kyrnaicism', 
        'Maiereth',
        'Multifarious', 
        'Mystify', 
        'Polymorph', 
        'Reconstitute',
        'Sacrifice', 
        'Shimmer', 
        'Slowing',
        'Snare',
        'Suture', 
    ], // 14
        
    'caeren': [ // 14
        'Blink',
        'Devour',
        'Fear', 
        'Healing', 
        'Ilirech',
        'Kyrnaicism', 
        'Maiereth',
        'Menace',
        'Mend', 
        'Protect', 
        'Sacrifice', 
        'Scream', 
        'Shield', 
        'Suture'
    ], // 14

    'kyosir': [ // 15
        'Chiomic', 
        'Confuse',
        'Devour',
        'Disease', 
        'Ilirech',
        'Kyrnaicism', 
        'Maiereth',
        'Malice', 
        'Mystify',
        'Protect', 
        'Reconstitute',
        'Sacrifice', 
        'Scream', 
        'Suture', 
        'Tshaeral'
    ], // 15
};
export const DISTANCE = {
    MIN: 0,
    ATTACK: 25,
    MOMENTUM: 2,
    THRESHOLD: 75,
    CHASE: 75,
    RANGED_ALIGNMENT: 25,
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
export const PADDING = {
    HEIGHT: 10,
    WIDTH: 10
};
export const RANGE = {
    LEASH: 1000,
    Underground: 2000,
    Game: 1000,
    Arena: 2000,
}; 

export const INSTINCTS = {
    'constitution': [
        { // 0 - Desperate Heal
            key: 'stateMachine',
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: 'stateMachine',
            value: States.HEALING
        },{ // 2 - Desperate Damage
            key: 'stateMachine',
            value: States.MAIERETH
        },{ // 3 - Casual Damage
            key: 'stateMachine',
            value: States.KYRNAICISM
        },{ // 4 - Within 100 Distance
            key: 'positiveMachine',
            value: States.DISEASE
        },{ // 5 - Melee at Distance
            key: 'positiveMachine',
            value: States.WARD
        },{ // 6 - Ranged at Distance
            key: 'stateMachine',
            value: States.ILIRECH
        }
    ],
    'strength': [
        { // 0
            key: 'stateMachine',
            value: States.DESPERATION
        },{ // 1
            key: 'stateMachine',
            value: States.TSHAERAL
        },{ // 2
            key: 'stateMachine',
            value: States.RUSH
        },{ // 3
            key: 'stateMachine',
            value: States.MAIERETH
        },{ // 4
            key: 'positiveMachine',
            value: States.WRITHE
        },{ // 5
            key: 'positiveMachine',
            value: States.WARD
        },{ // 6
            key: 'stateMachine',
            value: States.ILIRECH
        }
    ],
    'agility': [
        { // 0
            key: 'stateMachine',
            value: States.DESPERATION
        },{ // 1
            key: 'positiveMachine',
            value: States.MEND
        },{ // 2
            key: 'stateMachine',
            value: States.RUSH
        },{ // 3
            key: 'stateMachine',
            value: States.SUTURE
        },{ // 4
            key: 'positiveMachine',
            value: States.WRITHE
        },{ // 5
            key: 'stateMachine',
            value: States.PURSUIT
        },{ // 6
            key: 'positiveMachine',
            value: States.SHIMMER
        }
    ],
    'achre': [
        { // 0
            key: 'stateMachine',
            value: States.HEALING
        },{ // 1
            key: 'stateMachine',
            value: States.SUTURE
        },{ // 2
            key: 'stateMachine',
            value: States.MAIERETH
        },{ // 3
            key: 'stateMachine',
            value: States.ILIRECH
        },{ // 4
            key: 'positiveMachine',
            value: States.FREEZE
        },{ // 5
            key: 'positiveMachine',
            value: States.MULTIFARIOUS
        },{ // 6
            key: 'stateMachine',
            value: States.SLOWING
        }
    ],
    'caeren': [
        { // 0
            key: 'stateMachine',
            value: States.HEALING
        },{ // 1
            key: 'positiveMachine',
            value: States.MEND
        },{ // 2
            key: 'stateMachine',
            value: States.MAIERETH
        },{ // 3
            key: 'stateMachine',
            value: States.KYRNAICISM
        },{ // 4
            key: 'positiveMachine',
            value: States.SCREAM
        },{ // 5
            key: 'positiveMachine',
            value: States.MENACE
        },{ // 6
            key: 'stateMachine',
            value: States.ILIRECH
        }
    ],
    'kyosir': [
        { // 0
            key: 'stateMachine',
            value: States.HEALING
        },{ // 1
            key: 'stateMachine',
            value: States.TSHAERAL
        },{ // 2
            key: 'stateMachine',
            value: States.MAIERETH
        },{ // 3
            key: 'stateMachine',
            value: States.ILIRECH
        },{ // 4
            key: 'positiveMachine',
            value: States.CHIOMIC
        },{ // 5
            key: 'positiveMachine',
            value: States.PROTECT
        },{ // 6
            key: 'stateMachine',
            value: States.KYRNAICISM
        }
    ]
};
export type ARENA_ENEMY = {
    level: number;
    mastery: string;
    id: string;
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
    { range: [1, 2], min: 0.5, max: 2 }, // { range: [1, 2], min: 1, max: 2 },  
    { range: [3, 4], min: 1, max: 4 }, // { range: [3, 4], min: 2, max: 4 }, 
    { range: [5, 6], min: 2, max: 6 }, // { range: [5, 6], min: 4, max: 6 }, 
    { range: [7, 8], min: 4, max: 9 }, // { range: [7, 8], min: 5, max: 9 }, 
    { range: [9, 10], min: 4, max: 12 }, // { range: [9, 10], min: 7, max: 12 }, 
    { range: [11, 12], min: 6, max: 14 }, // { range: [11, 12], min: 8, max: 14 }, 
    { range: [13, 14], min: 6, max: 16 }, // { range: [13, 14], min: 10, max: 16 }, 
    { range: [15, 18], min: 6, max: 18 }, // { range: [15, 18], min: 12, max: 18 }, 
    { range: [19, 20], min: 8, max: 20 } // { range: [19, 20], min: 16, max: 20 }, 
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
    } catch (err) {
        console.warn(err, 'Error retrieving Enemies');
    };
};
export function fetchArena(enemies: ARENA_ENEMY[]) {
    try {
        let complete: any[] = [];
        for (let i = 0; i < enemies.length; i++) {
            let enemy = nonRandomEnemy(enemies[i].level, enemies[i].mastery);
            enemy = populateEnemy(enemy);
            const res = asceanCompiler(enemy);
            complete.push(res);
        };
        return complete;
    } catch (err) {
        console.warn(err, 'Error Retrieving Enemies');
    };
};
export function fetchTutorial(enemies: ARENA_ENEMY[] = [{level:0.5,mastery: ['constitution','strength','agility','achre','caeren','kyosir'][Math.floor(Math.random() * 6)], id: '0'}]) {
    try {
        let complete: any[] = [];
        for (let i = 0; i < enemies.length; i++) {
            let enemy = nonRandomEnemy(enemies[i].level, enemies[i].mastery);
            enemy = populateEnemy(enemy);
            const res = asceanCompiler(enemy);
            complete.push(res);
        };
        return complete;
    } catch (err) {
        console.warn(err, 'Error Retrieving Enemies');
    };
};