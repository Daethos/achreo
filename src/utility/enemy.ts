import { populateEnemy, randomEnemy } from "../assets/db/db";
import { EventBus } from "../game/EventBus";
import { asceanCompiler } from "./ascean";

const levelRanges = [
    { range: [1, 2], minLevel: 1, maxLevel: 2 },
    { range: [3, 4], minLevel: 2, maxLevel: 4 },
    { range: [5, 6], minLevel: 4, maxLevel: 6 },
    { range: [7, 8], minLevel: 5, maxLevel: 9 },
    { range: [9, 10], minLevel: 7, maxLevel: 12 },
    { range: [11, 12], minLevel: 8, maxLevel: 14 },
    { range: [13, 14], minLevel: 10, maxLevel: 16 },
    { range: [15, 18], minLevel: 12, maxLevel: 18 },
    { range: [19, 20], minLevel: 16, maxLevel: 20 }
];

function getEnemyLevels(level: number): { minLevel: number, maxLevel: number } {
    let minLevel: number = 0;
    let maxLevel: number = 0; 
    
    for (const { range, minLevel: rangeMin, maxLevel: rangeMax } of levelRanges) {
        const [rangeStart, rangeEnd] = range;
        if (level >= rangeStart && level <= rangeEnd) {
            minLevel = rangeMin;
            maxLevel = rangeMax;
            break;
        };
    };
    
    return { minLevel, maxLevel };
}; 

export function fetchEnemy(e: { enemyID: string; level: number; }): void {
    function getOpponent(): void {
        try { 
            const { minLevel, maxLevel } = getEnemyLevels(e.level); 
            let enemy = randomEnemy(minLevel, maxLevel);
            enemy = populateEnemy(enemy);
            const res = asceanCompiler(enemy);
            EventBus.emit('enemy-fetched', { enemy: res?.ascean, combat: res, enemyID: e.enemyID });
            EventBus.emit('update-enemies', { ...res?.ascean, enemyID: e.enemyID });
        } catch (err: any) {
            console.log(err.message, 'Error retrieving Enemies')
        };
    };
    getOpponent();
};