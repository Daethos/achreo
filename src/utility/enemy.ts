import { getEnemies, nonRandomEnemy, populateEnemy, randomEnemy } from "../assets/db/db";
import { EventBus } from "../game/EventBus";
import Ascean from "../models/ascean";
import { States } from "../game/phaser/StateMachine";
import { Compiler, asceanCompiler } from "./ascean";
import Equipment from "../models/equipment";

export const BROADCAST_DEATH = "broadcast-computer-death";
export const COMPUTER_BROADCAST = "computer-broadcast";
export const NEW_COMPUTER_ENEMY_HEALTH = "newComputerEnemyHealth";
export const UPDATE_COMPUTER_COMBAT = "update-computer-combat";
export const UPDATE_COMPUTER_DAMAGE = "update-computer-damage";

export const DEFEATED = [
    "Something is tearing into me. Please, help!", 
    "I hope you feel good about yourself, bullying someone like me.", 
    "Get ahold of yourself man, you're feverish over a calm duel.", 
    "Does your cruelty know no bounds, savage?", 
    "I'm sure you think could could take Evrio on now, don't you?", 
    "Noooooooo! This wasn't supposed to happen.", 
    "I still don't believe you are that capable. Absurd.",
    `Curse you! I'll be back for your head.`, 
    `Well fought.`,
    `You did well, I commend you.`,
    `Can't believe I lost to you. I'm in utter digust with myself.`, 
    "Why did it have to be you?",
    "Very good! May we meet again."
];
  
export const VICTORIOUS = [
    `I'll be seeing you again.`, 
    "Perhaps try fighting someone of a different mastery, may be easier for you.",
    "You're joking?", 
    "You will never defeat the likes of me. I can't believe you would even try.", 
    "What is the matter with you, playing at some grand hero.",
    "What did you think was going to happen here?",
    "Why did you even bother me with this?", 
    "Goodness, maybe find someone of a weaker nature.", 
    "Oh my, well, no need to tell anyone about this.", 
    "Apologies for thrashing you, I had no idea it was going to be so easy.", 
    `Well fought.`, 
    `Well, perchance you could do better... next time.`, 
    "Very good! May we meet again."
];

export const HELP = [
    "Nooooooo! Somebody help me!!",
    "...ahhh! Get away from me. Someone. Anyone. Help!",
    "Come, I'm in need of aid against this plauging evil!",
    "Stay Away!",
    "Somebody HELP ME",
    "Can anyone help me against this maniac?"
];

type MasteryAbility = { [key:string]: string[] };
export const HEALS = [States.HEALING, States.DESPERATION, States.RECONSTITUTE];
export const ENEMY_SPECIAL: MasteryAbility = {
    "constitution": [ // 17
        "Desperation",
        "Disease",
        "Dispel",
        "Healing",
        "Ilirech",
        "Kyrisian",
        "Kyrnaicism",
        "Likyr",
        "Mend",
        "Paralyze",
        "Renewal",
        "Sacrifice",
        "Scream",
        "Shield",
        "Shirk",
        "Suture",
        "Tether",
        "Ward"
    ], // 17

    "strength": [ // 12
        "Desperation",
        "Envelop",
        "Hook",
        "Howl",
        "Leap",
        "Pursuit",
        "Rush",
        "Scream",
        "Shield",
        "Sprint",
        "Suture",
        "Tether",
        "Tshaeral",
        "Ward",
        "Writhe"
    ], // 12

    "agility": [ // 12
        "Achire",
        "Desperation",
        "Envelop",
        "Hook",
        "Howl",
        "Leap",
        "Pursuit",
        "Rush",
        "Shadow",
        "Shimmer",
        "Shirk",
        "Slowing",
        "Snare",
        "Sprint",
        "Suture",
    ], // 12

    "achre": [ // 16
        "Absorb",
        "Achire",
        "Astrave",
        "Blink",
        "Dispel",
        "Freeze",
        "Frost",
        "Ilirech",
        "Moderate",
        "Multifarious",
        "Polymorph",
        "Quor",
        "Reconstitute",
        "Sacrifice",
        "Slowing",
        "Snare",
    ], // 16
        
    "caeren": [ // 15
        "Astrave",
        "Blink",
        "Fear",
        "Healing",
        "Ilirech",
        "Kyrnaicism",
        "Maiereth",
        "Malice",
        "Menace",
        "Mend",
        "Protect",
        "Sacrifice",
        "Scream",
        "Shield",
        "Shirk",
        "Suture"
    ], // 15

    "kyosir": [ // 16
        "Chiomic",
        "Chiomism",
        "Confuse",
        "Desperation",
        "Disease",
        "Dispel",
        "Hook",
        "Kyrnaicism",
        "Malice",
        "Mystify",
        "Protect",
        "Reconstitute",
        "Sacrifice",
        "Scream",
        "Suture",
        "Tshaeral"
    ], // 16
};
export const ENEMY_AOE: MasteryAbility = {
    "constitution": [
        "Disease",
        "Renewal",
        "Scream",
    ],

    "strength": [
        "Howl",
        "Leap",
        "Writhe"
    ],

    "agility": [
        "Howl",
        "Rush",
    ],

    "achre": [
        "Astrave",
        "Freeze",
    ],
        
    "caeren": [
        "Astrave",
        "Scream",
    ],

    "kyosir": [
        "Chiomic",
        "Disease",
        "Scream",
    ],
};
export const ENEMY_RANGED: MasteryAbility = {
    "constitution": [ // 17
        "Dispel",
        "Ilirech",
        "Kyrisian",
        "Kyrnaicism",
        "Likyr",
        "Paralyze",
        "Sacrifice",
        "Suture",
    ], // 17

    "strength": [ // 12
        "Hook",
        "Leap",
        "Pursuit",
        "Rush",
        "Suture",
        "Tshaeral",
    ], // 12

    "agility": [ // 12
        "Achire",
        "Hook",
        "Leap",
        "Rush",
        "Slowing",
        "Snare",
        "Suture",
    ], // 12

    "achre": [ // 16
        "Achire",
        "Astrave",
        "Dispel",
        "Frost",
        "Ilirech",
        "Quor",
        "Sacrifice",
        "Slowing",
        "Snare",
    ], // 16
        
    "caeren": [ // 15
        "Astrave",
        "Fear",
        "Ilirech",
        "Kyrnaicism",
        "Maiereth",
        "Sacrifice",
        "Suture"
    ], // 15

    "kyosir": [ // 16
        "Chiomism",
        "Dispel",
        "Hook",
        "Kyrnaicism",
        "Sacrifice",
        "Suture",
        "Tshaeral"
    ], // 16
};
export const DISTANCE = {
    MIN: 0,
    ATTACK: 25,
    MOMENTUM: 1.25,
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
    Gauntlet: 3000,
};
type Instinct = {
    [key: string]: {key:string; value:string;}[]
};
export const INSTINCTS: Instinct = {
    "constitution": [
        { // 0 - Desperate Heal
            key: "stateMachine",
            value: States.DESPERATION
        },{ // 1 - Casual Heal
            key: "stateMachine",
            value: States.HEALING
        },{ // 2 - Desperate Damage
            key: "stateMachine",
            value: States.KYRISIAN
        },{ // 3 - Casual Damage
            key: "stateMachine",
            value: States.KYRNAICISM
        },{ // 4 - Within 100 Distance
            key: "positiveMachine",
            value: States.DISEASE
        },{ // 5 - Melee at Distance
            key: "positiveMachine",
            value: States.WARD
        },{ // 6 - Ranged at Distance
            key: "stateMachine",
            value: States.ILIRECH
        }
    ],
    "strength": [
        { // 0
            key: "stateMachine",
            value: States.DESPERATION
        },{ // 1
            key: "stateMachine",
            value: States.TSHAERAL
        },{ // 2
            key: "stateMachine",
            value: States.RUSH
        },{ // 3
            key: "stateMachine",
            value: States.MAIERETH
        },{ // 4
            key: "positiveMachine",
            value: States.WRITHE
        },{ // 5
            key: "positiveMachine",
            value: States.WARD
        },{ // 6
            key: "stateMachine",
            value: States.ILIRECH
        }
    ],
    "agility": [
        { // 0
            key: "stateMachine",
            value: States.DESPERATION
        },{ // 1
            key: "positiveMachine",
            value: States.MEND
        },{ // 2
            key: "stateMachine",
            value: States.RUSH
        },{ // 3
            key: "stateMachine",
            value: States.SUTURE
        },{ // 4
            key: "positiveMachine",
            value: States.WRITHE
        },{ // 5
            key: "stateMachine",
            value: States.PURSUIT
        },{ // 6
            key: "positiveMachine",
            value: States.SHIMMER
        }
    ],
    "achre": [
        { // 0
            key: "stateMachine",
            value: States.RECONSTITUTE
        },{ // 1
            key: "stateMachine",
            value: States.HEALING
        },{ // 2
            key: "stateMachine",
            value: States.ACHIRE
        },{ // 3
            key: "stateMachine",
            value: States.FROST
        },{ // 4
            key: "positiveMachine",
            value: States.FREEZE
        },{ // 5
            key: "positiveMachine",
            value: States.MULTIFARIOUS
        },{ // 6
            key: "stateMachine",
            value: States.SLOWING
        }
    ],
    "caeren": [
        { // 0
            key: "stateMachine",
            value: States.HEALING
        },{ // 1
            key: "positiveMachine",
            value: States.MEND
        },{ // 2
            key: "stateMachine",
            value: States.SACRIFICE
        },{ // 3
            key: "stateMachine",
            value: States.KYRNAICISM
        },{ // 4
            key: "positiveMachine",
            value: States.SCREAM
        },{ // 5
            key: "positiveMachine",
            value: States.MENACE
        },{ // 6
            key: "stateMachine",
            value: States.ILIRECH
        }
    ],
    "kyosir": [
        { // 0
            key: "stateMachine",
            value: States.HEALING
        },{ // 1
            key: "stateMachine",
            value: States.TSHAERAL
        },{ // 2
            key: "stateMachine",
            value: States.CHIOMISM
        },{ // 3
            key: "stateMachine",
            value: States.ILIRECH
        },{ // 4
            key: "positiveMachine",
            value: States.CHIOMIC
        },{ // 5
            key: "positiveMachine",
            value: States.PROTECT
        },{ // 6
            key: "stateMachine",
            value: States.KYRNAICISM
        }
    ]
};
type MIND_STATE = {
    [key: string]: string[];
};
export const MIND_STATES: MIND_STATE = {
    constitution: ["Controller", "Priest", "Sorcerer"], // "Controller", "Priest", "Sorcerer"
    strength: ["Berserker", "Commander", "Stalwart"], // "Berserker", "Commander", "Stalwart"
    agility: ["Rogue", "Ranger"], // "Jester", "Rogue", "Ranger"
    achre: ["Battlemage", "Controller", "Sorcerer"], // "Battlemage", "Controller", "Sorcerer"
    caeren: ["Battlemage", "Priest", "Sorcerer"], // "Battlemage", "Priest", "Sorcerer"
    kyosir: ["Battlemage", "Controller", "Sorcerer"], // "Battlemage", "Jester", "Sorcerer"
};
export type ARENA_ENEMY = {
    level: number;
    mastery: string;
    id: string;
};
export const GRIP_SCALE = { "One Hand": 0.5, "Two Hand": 0.65 };
export type EnemySheet = {
    id: string;
    game: Ascean;
    enemy: Compiler;
    name: string;
    weapons: Equipment[];
    health: number;
    isAggressive: boolean;
    startedAggressive: boolean;
    isCaerenic: boolean;
    isDefeated: boolean;
    isTriumphant: boolean;
    isLuckout: boolean;
    isPersuaded: boolean;
    isStalwart: boolean;
    playerTrait: string;
};
const levelRanges = [
    { range: [1, 1], min: 0.25, max: 1 }, // { range: [1, 2], min: 1, max: 2 },  
    { range: [2, 2], min: 0.5, max: 2 }, // { range: [1, 2], min: 1, max: 2 },  
    { range: [3, 4], min: 1, max: 4 }, // { range: [3, 4], min: 2, max: 4 }, 
    { range: [5, 6], min: 2, max: 6 }, // { range: [5, 6], min: 4, max: 6 }, 
    { range: [7, 8], min: 4, max: 12 }, // { range: [7, 8], min: 5, max: 9 }, 
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
        EventBus.emit("enemy-fetched", { enemy: res?.ascean, combat: res, enemyID: e.enemyID });
    } catch (err) {
        console.warn(err, "Error retrieving Enemies");
    };
};
export function fetchArena(enemies: ARENA_ENEMY[]): Compiler[] {
    // try {
        let complete: any[] = [];
        for (let i = 0; i < enemies.length; i++) {
            let enemy = nonRandomEnemy(enemies[i].level, enemies[i].mastery);
            enemy = populateEnemy(enemy);
            const res = asceanCompiler(enemy);
            complete.push(res);
        };
        return complete;
    // } catch (err) {
    //     console.warn(err, "Error Retrieving Enemies");
    // };
};
export function fetchTutorial(enemies: ARENA_ENEMY[] = [{level:0.5, mastery: ["constitution", "strength", "agility", "achre", "caeren", "kyosir"][Math.floor(Math.random() * 6)], id: "0"}]) {
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
        console.warn(err, "Error Retrieving Enemies");
    };
};
export function fetchPartyPotential(level: number, mastery: string) {
    try {
        return getEnemies(level, mastery);
    } catch (err) {
        console.warn(err, "Error Fetching Potential Party Members");
    };
};