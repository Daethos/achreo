import { Weapons } from '../assets/db/weaponry';
import { Legs, Chests, Shields, Helmets } from '../assets/db/equipment';
import { Amulets, Rings, Trinkets } from '../assets/db/jewelry';
import { v4 as uuidv4 } from 'uuid';
import { addEquipment } from '../assets/db/db';

// const ATTRIBUTE_RANGE = {
//     Default: [0, 0, 0, 0, 0, 0, 0],
//     Common: [0, 1, 1, 1, 2, 2, 3],
//     Uncommon: [1, 1, 2, 2, 3, 4, 6],
//     Rare: [2, 3, 4, 5, 6, 7, 10],
//     Epic: [4, 5, 6, 7, 8, 10, 15],
//     Legendary: [10, 14, 17, 20, 24, 27, 30],
// };
const ATTRIBUTES = ['strength', 'constitution', 'agility', 'achre', 'caeren', 'kyosir'];
const CHANCE = ['criticalChance', 'physicalPenetration', 'magicalPenetration', 'roll', 'dodge'];
const DAMAGE = ['physicalDamage', 'magicalDamage'];
const DEFENSE = ['physicalResistance', 'magicalResistance'];
const CRITICAL = ['criticalDamage'];

export function getSpecificItem(item: Equipment) {
    return Weapons.find((w: any) => w.name === item.name && w.rarity === item.rarity) ||
    Legs.find((l: any) => l.name === item.name && l.rarity === item.rarity) ||
    Chests.find((c: any) => c.name === item.name && c.rarity === item.rarity) ||
    Shields.find((s: any) => s.name === item.name && s.rarity === item.rarity) ||
    Helmets.find((h: any) => h.name === item.name && h.rarity === item.rarity) ||
    Amulets.find((a: any) => a.name === item.name && a.rarity === item.rarity) ||
    Rings.find((r: any) => r.name === item.name && r.rarity === item.rarity) ||
    Trinkets.find((t: any) => t.name === item.name && t.rarity === item.rarity);
};

export function randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export function randomFloatFromInterval(min: number, max: number): number {
    return Number(parseFloat((Math.random() * (max - min) + min).toString()).toFixed(2));
};

function influence(influences: string[] | undefined): string[] | undefined {
    if (!influences) return undefined;
    const int = randomIntFromInterval(0, influences.length - 1);
    const deity = influences[int];
    return [deity];
};

export default class Equipment {
    public _id: string = uuidv4();
    public name: string;
    public type: string;
    public rarity?: string;
    public grip?: string;
    public attackType?: string;
    public magicalDamage: number;
    public physicalDamage: number;
    public damageType?: string[];
    public criticalChance: number;
    public criticalDamage: number;
    public magicalPenetration?: number;
    public physicalPenetration?: number;
    public magicalResistance?: number;
    public physicalResistance?: number;
    public dodge: number;
    public roll: number;
    public constitution: number;
    public strength: number;
    public agility: number;
    public achre: number;
    public caeren: number;
    public kyosir: number;
    public influences?: string[];
    public imgUrl: string = '../assets/images/gladius.png';

    constructor(equipment: Equipment) {
        this._id = equipment._id;
        this.name = equipment.name;
        this.type = equipment.type;
        this.rarity = equipment?.rarity;
        this.grip = equipment?.grip;
        this.attackType = equipment.attackType;
        this.magicalDamage = equipment.magicalDamage;
        this.physicalDamage = equipment.physicalDamage;
        this.damageType = equipment?.damageType;
        this.criticalChance = equipment.criticalChance;
        this.criticalDamage = equipment.criticalDamage;
        this.magicalPenetration = equipment?.magicalPenetration;
        this.physicalPenetration = equipment?.physicalPenetration;
        this.magicalResistance = equipment?.magicalResistance;
        this.physicalResistance = equipment?.physicalResistance;
        this.dodge = equipment.dodge;
        this.roll = equipment.roll;
        this.constitution = equipment.constitution;
        this.strength = equipment.strength;
        this.agility = equipment.agility;
        this.achre = equipment.achre;
        this.caeren = equipment.caeren;
        this.kyosir = equipment.kyosir;
        this.influences = equipment?.influences;
        this.imgUrl = equipment.imgUrl;
    };
    [key: string]: any;
};

async function create(data: any): Promise<Equipment> {
    const equipment = new Equipment(data);
    await mutate([equipment], equipment?.rarity);
    return equipment;
};

async function defaultMutate(equipment: Equipment[]) {
    try {
        equipment.forEach(async (item: Equipment) => {
            item._id = uuidv4();
        });
        return equipment;
    } catch (err) {
        console.warn(err, 'Error Mutating Equipment');
    };
};

function determineMutation(item: Equipment, sans: string[]): Equipment | undefined {
    try {
        const base = getSpecificItem(item);
        for (const attribute of ATTRIBUTES) {
            if (sans.includes(attribute)) continue;
            if (base![attribute as keyof typeof base] > 0) {
                // console.log(attribute, item[attribute], 'Current Attribute Rating');
                switch (base![attribute as keyof typeof base]) {
                    case 1:
                        item[attribute] = 1;
                        break;
                    case 2: 
                        item[attribute] = randomIntFromInterval(1, 2);
                        break;
                    case 3: 
                        item[attribute] = randomIntFromInterval(2, 3);
                        break;
                    case 4: 
                        item[attribute] = randomIntFromInterval(2, 4);
                        break;
                    case 5: 
                        item[attribute] = randomIntFromInterval(3, 5);
                        break;
                    case 6: 
                        item[attribute] = randomIntFromInterval(4, 6);
                        break;
                    case 7: 
                        item[attribute] = randomIntFromInterval(5, 7);
                        break;
                    case 8: 
                        item[attribute] = randomIntFromInterval(5, 8);
                        break;    
                    case 9: 
                        item[attribute] = randomIntFromInterval(6, 9);
                        break;
                    case 10: 
                        item[attribute] = randomIntFromInterval(7, 10);
                        break;
                    case 11:
                        item[attribute] = randomIntFromInterval(7, 11);
                        break;
                    case 12: 
                        item[attribute] = randomIntFromInterval(8, 12);
                        break;
                    case 13:
                        item[attribute] = randomIntFromInterval(9, 13);
                        break;
                    case 14: 
                        item[attribute] = randomIntFromInterval(10, 14);
                        break;
                    case 15: 
                        item[attribute] = randomIntFromInterval(11, 15);
                        break;
                    case 16: 
                        item[attribute] = randomIntFromInterval(12, 16);
                        break;
                    case 17: 
                        item[attribute] = randomIntFromInterval(13, 17);
                        break;
                    case 18: 
                        item[attribute] = randomIntFromInterval(14, 18);
                        break;    
                    case 19: 
                        item[attribute] = randomIntFromInterval(15, 19);
                        break;
                    case base![attribute as keyof typeof base] >= 20: 
                        item[attribute] = item[attribute];
                        break;
                    default: break;
                };
            };
        };
        for (const attribute of CHANCE) {    
            if (sans.includes(attribute)) continue;
            if (base![attribute as keyof typeof base] >= 24) { // 24+ +/- 2/0
                item[attribute] = randomFloatFromInterval(base![attribute as keyof typeof base], base![attribute as keyof typeof base] + 4);
            } else if (base![attribute as keyof typeof base] >= 20) { // 20-23 +/- 2/0
                item[attribute] = randomFloatFromInterval(base![attribute as keyof typeof base], base![attribute as keyof typeof base] + 2);
            } else if (base![attribute as keyof typeof base] >= 18) { // 18-19 +/- 2/0
                item[attribute] = randomFloatFromInterval(base![attribute as keyof typeof base], base![attribute as keyof typeof base] + 2);
            } else if (base![attribute as keyof typeof base] >= 16) { // 16-17 +/- 2/0
                item[attribute] = randomFloatFromInterval(base![attribute as keyof typeof base], base![attribute as keyof typeof base] + 1.5);
            } else if (base![attribute as keyof typeof base] >= 14) { // 14-15 +/- 2/0
                item[attribute] = randomFloatFromInterval(base![attribute as keyof typeof base], base![attribute as keyof typeof base] + 1.5);
            } else if (base![attribute as keyof typeof base] >= 12) { // 12-13 +/- 2/0
                item[attribute] = randomFloatFromInterval(Math.max(base![attribute as keyof typeof base] - 1, 0), base![attribute as keyof typeof base] + 1.5);
            } else if (base![attribute as keyof typeof base] >= 10) { // 10-11 +/- 2/1
                item[attribute] = randomFloatFromInterval(Math.max(base![attribute as keyof typeof base] - 1, 0), base![attribute as keyof typeof base] + 1.5);
            } else if (base![attribute as keyof typeof base] >= 8) { // 8-9 +/- 2/1
                item[attribute] = randomFloatFromInterval(Math.max(base![attribute as keyof typeof base] - 1, 0), base![attribute as keyof typeof base] + 1);
            } else if (base![attribute as keyof typeof base] >= 6) { // 6-7 +/- 1/1
                item[attribute] = randomFloatFromInterval(Math.max(base![attribute as keyof typeof base] - 1, 0), base![attribute as keyof typeof base] + 1);
            } else if (base![attribute as keyof typeof base] >= 4) { // 2-5 +/- 1/1
                item[attribute] = randomFloatFromInterval(Math.max(base![attribute as keyof typeof base] - 1, 0), base![attribute as keyof typeof base] + 0.5);
            } else if (base![attribute as keyof typeof base] >= 2) { // 2-3 +/- 0/1
                item[attribute] = randomFloatFromInterval(Math.max(base![attribute as keyof typeof base] - 1, 0), base![attribute as keyof typeof base] + 0.5);
            } else { // 0-1  +/ 0/1
                item[attribute] = randomFloatFromInterval(Math.max(base![attribute as keyof typeof base] - 1, 0), base![attribute as keyof typeof base]);
            };
        };
        for (const damage of DAMAGE) {    
            if (sans.includes(damage)) continue;
            if (base![damage as keyof typeof base] >= 20) { // 20+ +/- 2/0
                item[damage] = randomIntFromInterval(base![damage as keyof typeof base], base![damage as keyof typeof base] + 4);
            } else if (base![damage as keyof typeof base] >= 18) { // 18-19 +/- 2/0
                item[damage] = randomIntFromInterval(base![damage as keyof typeof base], base![damage as keyof typeof base] + 2);
            } else if (base![damage as keyof typeof base] >= 16) { // 16-17 +/- 2/0
                item[damage] = randomIntFromInterval(base![damage as keyof typeof base], base![damage as keyof typeof base] + 2);
            } else if (base![damage as keyof typeof base] >= 14) { // 14-15 +/- 2/0
                item[damage] = randomIntFromInterval(base![damage as keyof typeof base], base![damage as keyof typeof base] + 2);
            } else if (base![damage as keyof typeof base] >= 12) { // 12-13 +/- 2/0
                item[damage] = randomIntFromInterval(Math.max(base![damage as keyof typeof base] - 1, 0), base![damage as keyof typeof base] + 2);
            } else if (base![damage as keyof typeof base] >= 10) { // 10-11 +/- 2/1
                item[damage] = randomIntFromInterval(Math.max(base![damage as keyof typeof base] - 1, 0), base![damage as keyof typeof base] + 2);
            } else if (base![damage as keyof typeof base] >= 8) { // 8-9 +/- 2/1
                item[damage] = randomIntFromInterval(Math.max(base![damage as keyof typeof base] - 1, 0), base![damage as keyof typeof base] + 1);
            } else if (base![damage as keyof typeof base] >= 6) { // 6-7 +/- 1/1
                item[damage] = randomIntFromInterval(Math.max(base![damage as keyof typeof base] - 1, 0), base![damage as keyof typeof base] + 1);
            } else if (base![damage as keyof typeof base] >= 4) { // 2-5 +/- 1/1
                item[damage] = randomIntFromInterval(Math.max(base![damage as keyof typeof base] - 1, 0), base![damage as keyof typeof base]);
            } else if (base![damage as keyof typeof base] >= 2) { // 2-3 +/- 0/1
                item[damage] = randomIntFromInterval(Math.max(base![damage as keyof typeof base] - 1, 0), base![damage as keyof typeof base]);
            } else { // 0-1  +/ 0/1
                item[damage] = randomIntFromInterval(base![damage as keyof typeof base], base![damage as keyof typeof base]);
            };
        };
        for (const defense of DEFENSE) {    
            if (sans.includes(defense)) continue;
            if (base![defense as keyof typeof base] >= 20) { // 20+ +/- 2/0
                item[defense] = randomFloatFromInterval(base![defense as keyof typeof base], base![defense as keyof typeof base] + 3);
            } else if (base![defense as keyof typeof base] >= 18) { // 18-19 +/- 2/0
                item[defense] = randomFloatFromInterval(base![defense as keyof typeof base], base![defense as keyof typeof base] + 1.5);
            } else if (base![defense as keyof typeof base] >= 16) { // 16-17 +/- 2/0
                item[defense] = randomFloatFromInterval(base![defense as keyof typeof base], base![defense as keyof typeof base] + 1.5);
            } else if (base![defense as keyof typeof base] >= 14) { // 14-15 +/- 2/0
                item[defense] = randomFloatFromInterval(base![defense as keyof typeof base], base![defense as keyof typeof base] + 1.5);
            } else if (base![defense as keyof typeof base] >= 12) { // 12-13 +/- 2/0
                item[defense] = randomFloatFromInterval(Math.max(base![defense as keyof typeof base] - 1, 0), base![defense as keyof typeof base] + 1);
            } else if (base![defense as keyof typeof base] >= 10) { // 10-11 +/- 2/1
                item[defense] = randomFloatFromInterval(Math.max(base![defense as keyof typeof base] - 1, 0), base![defense as keyof typeof base] + 1);
            } else if (base![defense as keyof typeof base] >= 8) { // 8-9 +/- 2/1
                item[defense] = randomFloatFromInterval(Math.max(base![defense as keyof typeof base] - 1, 0), base![defense as keyof typeof base] + 0.5);
            } else if (base![defense as keyof typeof base] >= 6) { // 6-7 +/- 1/1
                item[defense] = randomFloatFromInterval(Math.max(base![defense as keyof typeof base] - 1, 0), base![defense as keyof typeof base] + 0.5);
            } else if (base![defense as keyof typeof base] >= 4) { // 2-5 +/- 1/1
                item[defense] = randomFloatFromInterval(Math.max(base![defense as keyof typeof base] - 1, 0), base![defense as keyof typeof base]);
            } else if (base![defense as keyof typeof base] >= 2) { // 2-3 +/- 0/1
                item[defense] = randomFloatFromInterval(Math.max(base![defense as keyof typeof base] - 1, 0), base![defense as keyof typeof base]);
            } else { // 0-1  +/ 0/1
                item[defense] = randomFloatFromInterval(Math.max(base![defense as keyof typeof base] - 1, 0), base![defense as keyof typeof base]);
            };
        };
        for (const damage of CRITICAL) {    
            if (sans.includes(damage)) continue;
            if (base![damage as keyof typeof base] > 1.99) { // 2.0 +/- 0.3/0.25 (0.55 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.2, base![damage as keyof typeof base] + 0.25);
            } else if (base![damage as keyof typeof base] > 1.74) { // 1.75 +/- 0.25/0.2 (0.45 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.15, base![damage as keyof typeof base] + 0.2);
            } else if (base![damage as keyof typeof base] > 1.49) { // 1.5 +/- 0.2/0.15 (0.35 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.1, base![damage as keyof typeof base] + 0.15);
            } else if (base![damage as keyof typeof base] > 1.24) { // 1.25 +/- 0.15/0.1 (0.25 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.05, base![damage as keyof typeof base] + 0.1);
            } else if (base![damage as keyof typeof base] > 1.09) { // 1.1 +/- 0.05/0.02 (0.07 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.02, base![damage as keyof typeof base] + 0.03);
            } else if (base![damage as keyof typeof base] > 1.05) { // 1.05 +/- 0.04/0.01 (0.05 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.01, base![damage as keyof typeof base] + 0.03);
            } else if (base![damage as keyof typeof base] === 1.03) { // 1.00 +/- 0.03/0 (0.03 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.01, base![damage as keyof typeof base] + 0.02);
            } else if (base![damage as keyof typeof base] === 1.02) { // 1.00 +/- 0.02/0 (0.02 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base] - 0.01, base![damage as keyof typeof base] + 0.02);
            } else if (base![damage as keyof typeof base] === 1.01) { // 1.00 +/- 0.01/0 (0.01 Range)
                item[damage] = randomFloatFromInterval(base![damage as keyof typeof base], base![damage as keyof typeof base] + 0.01);
            };
        };
        return item;
    } catch (err) {
        console.warn(err, "Error Determining Mutation");
    };
};

async function mutate(equipment: Equipment[], _rarity?: string | 'Common') { 
    try {
        // const range = ATTRIBUTE_RANGE[rarity as keyof typeof ATTRIBUTE_RANGE];
        for (const item of equipment) {
            item._id = uuidv4(); // uuidv4();
            item.influences = influence((item as any)?.influences);
            // console.log(item.influences, 'Current Influence of Item!')
            // const attributeCount = ATTRIBUTES.filter(attribute => item[attribute] > 0).length;
            for (const attribute of ATTRIBUTES) {   
                if (item[attribute] > 0) {
                    // console.log(attribute, item[attribute], 'Current Attribute Rating');
                    switch (item[attribute]) {
                        case 1:
                            item[attribute] = 1;
                            break;
                        case 2: 
                            item[attribute] = randomIntFromInterval(1, 2);
                            break;
                        case 3: 
                            item[attribute] = randomIntFromInterval(2, 3);
                            break;
                        case 4: 
                            item[attribute] = randomIntFromInterval(2, 4);
                            break;
                        case 5: 
                            item[attribute] = randomIntFromInterval(3, 5);
                            break;
                        case 6: 
                            item[attribute] = randomIntFromInterval(4, 6);
                            break;
                        case 7: 
                            item[attribute] = randomIntFromInterval(5, 7);
                            break;
                        case 8: 
                            item[attribute] = randomIntFromInterval(5, 8);
                            break;    
                        case 9: 
                            item[attribute] = randomIntFromInterval(6, 9);
                            break;
                        case 10: 
                            item[attribute] = randomIntFromInterval(7, 10);
                            break;
                        case 11:
                            item[attribute] = randomIntFromInterval(7, 11);
                            break;
                        case 12: 
                            item[attribute] = randomIntFromInterval(8, 12);
                            break;
                        case 13:
                            item[attribute] = randomIntFromInterval(9, 13);
                            break;
                        case 14: 
                            item[attribute] = randomIntFromInterval(10, 14);
                            break;
                        case 15: 
                            item[attribute] = randomIntFromInterval(11, 15);
                            break;
                        case 16: 
                            item[attribute] = randomIntFromInterval(12, 16);
                            break;
                        case 17: 
                            item[attribute] = randomIntFromInterval(13, 17);
                            break;
                        case 18: 
                            item[attribute] = randomIntFromInterval(14, 18);
                            break;    
                        case 19: 
                            item[attribute] = randomIntFromInterval(15, 19);
                            break;
                        case item[attribute] >= 20: 
                            item[attribute] = item[attribute];
                            break;
                        default: break;
                    };
                };
            };
            for (const attribute of CHANCE) {    
                if (item[attribute] >= 24) { // 24+ +/- 2/0
                    item[attribute] = randomFloatFromInterval(item[attribute], item[attribute] + 4);
                } else if (item[attribute] >= 20) { // 20-23 +/- 2/0
                    item[attribute] = randomFloatFromInterval(item[attribute], item[attribute] + 2);
                } else if (item[attribute] >= 18) { // 18-19 +/- 2/0
                    item[attribute] = randomFloatFromInterval(item[attribute], item[attribute] + 2);
                } else if (item[attribute] >= 16) { // 16-17 +/- 2/0
                    item[attribute] = randomFloatFromInterval(item[attribute], item[attribute] + 1.5);
                } else if (item[attribute] >= 14) { // 14-15 +/- 2/0
                    item[attribute] = randomFloatFromInterval(item[attribute], item[attribute] + 1.5);
                } else if (item[attribute] >= 12) { // 12-13 +/- 2/0
                    item[attribute] = randomFloatFromInterval(Math.max(item[attribute] - 1, 0), item[attribute] + 1.5);
                } else if (item[attribute] >= 10) { // 10-11 +/- 2/1
                    item[attribute] = randomFloatFromInterval(Math.max(item[attribute] - 1, 0), item[attribute] + 1.5);
                } else if (item[attribute] >= 8) { // 8-9 +/- 2/1
                    item[attribute] = randomFloatFromInterval(Math.max(item[attribute] - 1, 0), item[attribute] + 1);
                } else if (item[attribute] >= 6) { // 6-7 +/- 1/1
                    item[attribute] = randomFloatFromInterval(Math.max(item[attribute] - 1, 0), item[attribute] + 1);
                } else if (item[attribute] >= 4) { // 2-5 +/- 1/1
                    item[attribute] = randomFloatFromInterval(Math.max(item[attribute] - 1, 0), item[attribute] + 0.5);
                } else if (item[attribute] >= 2) { // 2-3 +/- 0/1
                    item[attribute] = randomFloatFromInterval(Math.max(item[attribute] - 1, 0), item[attribute] + 0.5);
                } else { // 0-1  +/ 0/1
                    item[attribute] = randomFloatFromInterval(Math.max(item[attribute] - 1, 0), item[attribute]);
                };
            };
            for (const damage of DAMAGE) {    
                if (item[damage] >= 20) { // 20+ +/- 2/0
                    item[damage] = randomIntFromInterval(item[damage], item[damage] + 4);
                } else if (item[damage] >= 18) { // 18-19 +/- 2/0
                    item[damage] = randomIntFromInterval(item[damage], item[damage] + 2);
                } else if (item[damage] >= 16) { // 16-17 +/- 2/0
                    item[damage] = randomIntFromInterval(item[damage], item[damage] + 2);
                } else if (item[damage] >= 14) { // 14-15 +/- 2/0
                    item[damage] = randomIntFromInterval(item[damage], item[damage] + 2);
                } else if (item[damage] >= 12) { // 12-13 +/- 2/0
                    item[damage] = randomIntFromInterval(Math.max(item[damage] - 1, 0), item[damage] + 2);
                } else if (item[damage] >= 10) { // 10-11 +/- 2/1
                    item[damage] = randomIntFromInterval(Math.max(item[damage] - 1, 0), item[damage] + 2);
                } else if (item[damage] >= 8) { // 8-9 +/- 2/1
                    item[damage] = randomIntFromInterval(Math.max(item[damage] - 1, 0), item[damage] + 1);
                } else if (item[damage] >= 6) { // 6-7 +/- 1/1
                    item[damage] = randomIntFromInterval(Math.max(item[damage] - 1, 0), item[damage] + 1);
                } else if (item[damage] >= 4) { // 2-5 +/- 1/1
                    item[damage] = randomIntFromInterval(Math.max(item[damage] - 1, 0), item[damage]);
                } else if (item[damage] >= 2) { // 2-3 +/- 0/1
                    item[damage] = randomIntFromInterval(Math.max(item[damage] - 1, 0), item[damage]);
                } else { // 0-1  +/ 0/1
                    item[damage] = randomIntFromInterval(item[damage], item[damage]);
                };
            };
            for (const defense of DEFENSE) {    
                if (item[defense] >= 20) { // 20+ +/- 2/0
                    item[defense] = randomFloatFromInterval(item[defense], item[defense] + 3);
                } else if (item[defense] >= 18) { // 18-19 +/- 2/0
                    item[defense] = randomFloatFromInterval(item[defense], item[defense] + 1.5);
                } else if (item[defense] >= 16) { // 16-17 +/- 2/0
                    item[defense] = randomFloatFromInterval(item[defense], item[defense] + 1.5);
                } else if (item[defense] >= 14) { // 14-15 +/- 2/0
                    item[defense] = randomFloatFromInterval(item[defense], item[defense] + 1.5);
                } else if (item[defense] >= 12) { // 12-13 +/- 2/0
                    item[defense] = randomFloatFromInterval(Math.max(item[defense] - 1, 0), item[defense] + 1);
                } else if (item[defense] >= 10) { // 10-11 +/- 2/1
                    item[defense] = randomFloatFromInterval(Math.max(item[defense] - 1, 0), item[defense] + 1);
                } else if (item[defense] >= 8) { // 8-9 +/- 2/1
                    item[defense] = randomFloatFromInterval(Math.max(item[defense] - 1, 0), item[defense] + 0.5);
                } else if (item[defense] >= 6) { // 6-7 +/- 1/1
                    item[defense] = randomFloatFromInterval(Math.max(item[defense] - 1, 0), item[defense] + 0.5);
                } else if (item[defense] >= 4) { // 2-5 +/- 1/1
                    item[defense] = randomFloatFromInterval(Math.max(item[defense] - 1, 0), item[defense]);
                } else if (item[defense] >= 2) { // 2-3 +/- 0/1
                    item[defense] = randomFloatFromInterval(Math.max(item[defense] - 1, 0), item[defense]);
                } else { // 0-1  +/ 0/1
                    item[defense] = randomFloatFromInterval(Math.max(item[defense] - 1, 0), item[defense]);
                };
            };
            for (const damage of CRITICAL) {    
                if (item[damage] > 1.99) { // 2.0 +/- 0.3/0.25 (0.55 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.2, item[damage] + 0.25);
                } else if (item[damage] > 1.74) { // 1.75 +/- 0.25/0.2 (0.45 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.15, item[damage] + 0.2);
                } else if (item[damage] > 1.49) { // 1.5 +/- 0.2/0.15 (0.35 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.1, item[damage] + 0.15);
                } else if (item[damage] > 1.24) { // 1.25 +/- 0.15/0.1 (0.25 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.05, item[damage] + 0.1);
                } else if (item[damage] > 1.09) { // 1.1 +/- 0.05/0.02 (0.07 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.02, item[damage] + 0.03);
                } else if (item[damage] > 1.05) { // 1.05 +/- 0.04/0.01 (0.05 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.01, item[damage] + 0.03);
                } else if (item[damage] === 1.03) { // 1.00 +/- 0.03/0 (0.03 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.01, item[damage] + 0.02);
                } else if (item[damage] === 1.02) { // 1.00 +/- 0.02/0 (0.02 Range)
                    item[damage] = randomFloatFromInterval(item[damage] - 0.01, item[damage] + 0.02);
                } else if (item[damage] === 1.01) { // 1.00 +/- 0.01/0 (0.01 Range)
                    item[damage] = randomFloatFromInterval(item[damage], item[damage] + 0.01);
                };
            };
            await addEquipment(item);
        };
        return equipment;
    } catch (err) {
        console.warn(err, 'Error Mutating Equipment');
    };
};

function checkType(types: string[]) {
    return types[Math.floor(Math.random() * types.length)];
};

function getOneTemplate(level: number = 1) {
    let equipment: Equipment = {} as Equipment;
    let rarity = determineRarityByLevel(level);
    let type = determineEquipmentType();
    let eqpCheck = randomIntFromInterval(1, 100);
    if ((type === 'Amulet' || type === 'Ring' || type === 'Trinket') && rarity === 'Common') rarity = 'Uncommon';
    if (level < 4) {
        rarity = 'Common';
        if (eqpCheck > 70) {
            type = 'Weapon';
        } else if (eqpCheck > 60) {
            type = 'Shield';
        } else if (eqpCheck > 40) {
            type = 'Helmet';
        } else if (eqpCheck > 20) {
            type = 'Chest';
        } else {
            type = 'Legs';
        };
    };
    (equipment as any) = fetcher((equipment as any), rarity, type, undefined);
    return equipment;
};

async function getOneDetermined(level: number = 1, type: string) {
    try {
        const levelCheck = type === "Jewelry" ? Math.max(level, 4) : level;
        const typeCheck =
            type === "Jewelry" ? checkType(["Amulet", "Ring", "Trinket"])
            : type === "Armor" ? checkType(["Helmet", "Chest", "Legs"])
            : type;
        let rarity = determineRarityByLevel(levelCheck);
        if (type === "Jewelry" && rarity === "Common") rarity = "Uncommon";
        let equipment: Equipment[] = []; // Initialize equipment as an empty array
        equipment = await aggregate(rarity, typeCheck, 1) as Equipment[];
        equipment.forEach(item => new Equipment(deepClone(item)));
        return equipment;
    } catch (err) {
        console.warn(err, 'Error Getting One Equipment');
    };
};

async function getOneSpecific(item: any) {
    try {
        let equipment: Equipment[] = []; // Initialize equipment as an empty array
        equipment = await mutate([item], item.rarity) as Equipment[];
        return equipment;
    } catch (err) {
        console.warn(err, "Error Getting One Specific");
        return undefined;
    };
};

async function getOneRandom(level: number = 1) {
    try {
        let rarity = determineRarityByLevel(level);
        let type = determineEquipmentType();
        let equipment: Equipment[] = []; // Initialize equipment as an empty array
        let eqpCheck = randomIntFromInterval(1, 100);
        if ((type === 'Amulet' || type === 'Ring' || type === 'Trinket') && rarity === 'Common') rarity = 'Uncommon';
        if (level < 4) {
            rarity = 'Common';
            if (eqpCheck > 70) {
                type = 'Weapon';
            } else if (eqpCheck > 60) {
                type = 'Shield';
            } else if (eqpCheck > 40) {
                type = 'Helmet';
            } else if (eqpCheck > 20) {
                type = 'Chest';
            } else {
                type = 'Legs';
            };
        };
        equipment = await aggregate(rarity, type, 1) as Equipment[];
        equipment.forEach(item => new Equipment(deepClone(item)));
        return equipment;
    } catch (err) {
        console.warn(err, 'Error Getting One Equipment');
    };
};

async function aggregate(rarity: string, type: string, size: number, name?: string): Promise<Equipment[] | undefined> {
    try {
        let equipment: Equipment = {} as Equipment;
        let total: Equipment[] = [];
        // const fetcher = () => {
        //     switch (type) {
        //         case 'Weapon':
        //             if (name) {
        //                 equipment = Weapons.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Weapons.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment}; 
        //         case 'Shield':
        //             if (name) {
        //                 equipment = Shields.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Shields.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment};
        //         case 'Helmet':
        //             if (name) {
        //                 equipment = Helmets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Helmets.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment};
        //         case 'Chest':
        //             if (name) {
        //                 equipment = Chests.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Chests.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment};
        //         case 'Legs':
        //             if (name) {
        //                 equipment = Legs.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Legs.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment};
        //         case 'Ring':
        //             if (name) {
        //                 equipment = Rings.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Rings.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment};
        //         case 'Amulet':
        //             if (name) {
        //                 equipment = Amulets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Amulets.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment};
        //         case 'Trinket':
        //             if (name) {
        //                 equipment = Trinkets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
        //             } else {
        //                 equipment = shuffleArray(Trinkets.filter((eq) => eq.rarity === rarity))[0];
        //             };
        //             return {...equipment};
        //         default:
        //             const allEquipmentOfType = [...Weapons, ...Shields, ...Helmets /* add other types here */];
        //             const filteredEquipment = allEquipmentOfType.filter((eq) => eq.rarity === rarity);
        //             const randomIndex = randomIntFromInterval(0, filteredEquipment.length - 1);
        //             return equipment = {...filteredEquipment[randomIndex]};
        //     };                       
        // };
        for (let i = 0; i < size; i++) {
            (equipment as any) = fetcher(equipment, rarity, type, name);
            total.push(equipment);
        };
        total = await mutate(total, rarity) as Equipment[];
        return total;
    } catch (err: any) {
        console.warn(err, 'Error Aggregating Equipment');
    };
};

const fetcher = (equipment: {}, rarity: string, type: string, name?: string) => {
    switch (type) {
        case 'Weapon':
            if (name) {
                equipment = Weapons.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Weapons.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case 'Shield':
            if (name) {
                equipment = Shields.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Shields.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case 'Helmet':
            if (name) {
                equipment = Helmets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Helmets.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case 'Chest':
            if (name) {
                equipment = Chests.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Chests.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case 'Legs':
            if (name) {
                equipment = Legs.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Legs.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case 'Ring':
            if (name) {
                equipment = Rings.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Rings.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case 'Amulet':
            if (name) {
                equipment = Amulets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Amulets.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case 'Trinket':
            if (name) {
                equipment = Trinkets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Trinkets.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        default:
            const allEquipmentOfType = [...Weapons, ...Shields, ...Helmets /* add other types here */];
            const filteredEquipment = allEquipmentOfType.filter((eq) => eq.rarity === rarity);
            const randomIndex = randomIntFromInterval(0, filteredEquipment.length - 1);
            equipment = {...filteredEquipment[randomIndex]};
            break;
    };
    return equipment;
};

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomIntFromInterval(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    };
    return array;
};

function determineRarityByLevel(level: number): string {
    const chance = randomFloatFromInterval(0.0, 1.0);
    let rarity = '';
    let uScale = level / 40;
    let rScale = level / 200;
    let eScale = level / 500;
    let lScale = level / 10000;
    if (level < 4) {
        rarity = 'Common';
    } else if (level >= 4 && level < 12) {
        if (rScale > chance) {
            rarity = 'Rare';
        } else if (uScale > chance) {
            rarity = 'Uncommon';
        } else {
            rarity = 'Common';
        };
    } else if (level >= 12 && level < 20) {
        if (eScale > chance) {
            rarity = 'Epic';
        } else if (rScale > chance) {
            rarity = 'Rare';
        } else if (uScale > chance) {
            rarity = 'Uncommon';
        } else {
            rarity = 'Common';
        };
    } else if (level >= 20 && level < 30) {
        if (lScale > chance) {
            rarity = 'Legendary';
        } else if (eScale > chance) {
            rarity = 'Epic';
        } else if (rScale > chance) {
            rarity = 'Rare';
        } else {
            rarity = 'Uncommon';
        };
    }; 
    return rarity;
};

function determineEquipmentType(): string {
    const roll = randomIntFromInterval(1, 100);
    if (roll <= 32) {
        return 'Weapon';
    } else if (roll <= 40) {
        return 'Shield';
    } else if (roll <= 50) {
        return 'Helmet';
    } else if (roll <= 60) {
        return 'Chest';
    } else if (roll <= 70) {
        return 'Legs';
    } else if (roll <= 80) {
        return 'Ring';
    } else if (roll <= 90) {
        return 'Amulet';
    } else {
        return 'Trinket';
    };
};

async function getHigherRarity(name: string, type: string, rarity: string): Promise<Equipment[] | undefined> {
    let nextRarity: string = '';
    if (rarity === 'Common') {
        nextRarity = 'Uncommon';
    } else if (rarity === 'Uncommon') {
        nextRarity = 'Rare';
    } else if (rarity === 'Rare') {
        nextRarity = 'Epic';
    } else if (rarity === 'Epic') {
        nextRarity = 'Legendary';
    };
    const nextItem = await aggregate(nextRarity, type, 1, name);
    return nextItem || undefined;
};  

async function upgradeEquipment(data: any) {
    try {
        let realType: string = '';
        switch (data.inventoryType) {
            case 'weaponOne': 
                realType = 'Weapon'; 
                break;
            case 'weaponTwo': 
                realType = 'Weapon';
                break;
            case 'weaponThree': 
                realType = 'Weapon';
                break;
            case 'shield': 
                realType = 'Shield';
                break;
            case 'helmet': 
                realType = 'Helmet';
                break;
            case 'chest': 
                realType = 'Chest';
                break;
            case 'legs': 
                realType = 'Legs';
                break;
            case 'ringOne': 
                realType = 'Ring';
                break;
            case 'ringTwo': 
                realType = 'Ring';
                break;
            case 'amulet': 
                realType = 'Amulet';
                break;
            case 'trinket': 
                realType = 'Trinket';
                break;
            default: 
                realType = 'Weapon';
                break;
        };
        let item = await getHigherRarity(data.upgradeName, realType as string, data.currentRarity);
        const clone = deepClone(item?.[0]);
        return [clone];
    } catch (err: any) {
        console.warn(err, 'err')
    };
};

async function getPhysicalWeaponEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {
            const rarity = determineRarityByLevel(level);
            let item = shuffleArray(Weapons.filter((eq) => (eq.rarity === rarity && eq.attackType === 'Physical')))[0];
            const cloneItem = deepClone(item);
            let equipment = await mutate([cloneItem], rarity) as Equipment[];
            equipment.forEach(it => new Equipment(it));
            const clone = deepClone(equipment[0]);
            merchantEquipment.push(clone);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
    };
};

async function getMagicalWeaponEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {
            const rarity = determineRarityByLevel(level);
            let item = shuffleArray(Weapons.filter((eq) => (eq.rarity === rarity && eq.attackType === 'Magic')))[0];
            const cloneItem = deepClone(item);
            let equipment = await mutate([cloneItem], rarity) as Equipment[];
            equipment.forEach(it => new Equipment(it));
            const clone = deepClone(equipment[0]);
            merchantEquipment.push(clone);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
    };
};

async function getArmorEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {        
            let type;
            let rarity;
            let types = ['Shield', 'Helmet', 'Chest', 'Legs', 'Helmet', 'Chest', 'Legs', 'Helmet', 'Chest', 'Legs'];
            const rand = randomIntFromInterval(0, types.length - 1);
            rarity = determineRarityByLevel(level);
            type = types[rand];
            let eqpCheck = randomIntFromInterval(1, 100);
            let item;
            if (level < 4) {
                if (eqpCheck > 90) {
                    item = shuffleArray(Shields.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];
                } else if (eqpCheck > 60) {
                    item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];
                } else if (eqpCheck > 30) {
                    item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];  
                } else {
                    item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];
                };
            } else if (type === 'Shield') {
                item = shuffleArray(Shields.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];
            } else if (type === 'Helmet') {
                item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];
            } else if (type === 'Chest') {
                item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];
            } else if (type === 'Legs') {
                item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type !== 'Leather-Cloth')))[0];
            };
            const cloneItem = deepClone(item);
            let equipment = await mutate([cloneItem as Equipment], rarity) as Equipment[];
            equipment.forEach(it => new Equipment(it));
            const clone = deepClone(equipment[0]);
            merchantEquipment.push(clone);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
    };
};

async function getJewelryEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {        
            let type;
            let rarity;
            let types = ['Ring', 'Amulet', 'Trinket'];
            const rand = randomIntFromInterval(0, types.length - 1);
            rarity = determineRarityByLevel(level);
            if (rarity === 'Common') {
                rarity = 'Uncommon';
            };
            type = types[rand];
            let item;
            if (type === 'Ring') {
                item = shuffleArray( Rings.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === 'Amulet') {
                item = shuffleArray(Amulets.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === 'Trinket') {
                item = shuffleArray(Trinkets.filter((eq) => (eq.rarity === rarity)))[0]; 
            };
            const cloneItem = deepClone(item);
            let equipment = await mutate([cloneItem as Equipment], rarity) as Equipment[];
            equipment.forEach(it => new Equipment(it));
            const clone = deepClone(equipment[0]);
            merchantEquipment.push(clone);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
    };
};

async function getMerchantEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {
            const item = await getOneRandom(level);
            const clone = deepClone(item)
            merchantEquipment.push(clone);
        };
        return merchantEquipment as unknown as Equipment[];
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
    };
};

async function getClothEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {        
            let type;
            let rarity;
            let types = ['Helmet', 'Chest', 'Legs'];
            const rand = randomIntFromInterval(0, types.length - 1);
            rarity = determineRarityByLevel(level);
            type = types[rand];
            let item;
            if (type === 'Helmet') {
                item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type === 'Leather-Cloth' )))[0];
            } else if (type === 'Chest') {
                item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type === 'Leather-Cloth' )))[0];
            } else if (type === 'Legs') {
                item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type === 'Leather-Cloth' )))[0]; 
            };
            if (item) {
                const clone = deepClone(item);
                let mutatedItems = await mutate([clone], rarity) as Equipment[];
                mutatedItems.forEach(it => new Equipment(it));
                const clonedItem = deepClone(mutatedItems[0]);
                merchantEquipment.push(clonedItem);
            };
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
    };
};

async function getSpecificArmor(level: number, type: string) {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {
            let item: any = undefined,
                armorType: string = '',
                armorTypes: string[] = ["Helmet", "Chest", "Legs"],
                rarity: string = '';
            
            const rand = randomIntFromInterval(0, 2);
            rarity = determineRarityByLevel(level);
            armorType = armorTypes[rand];

            item = shuffleArray([armorType].filter((eq: any) => (eq.rarity === rarity && eq.type === type)))[0];
            
            if (item) {
                let mutatedItems = await mutate([item], rarity) as Equipment[];
                mutatedItems.forEach(item => new Equipment(item));
                const clonedItem = deepClone(mutatedItems[0]);
                merchantEquipment.push(clonedItem);
            } else {
                if (armorType === "Helmet") {
                    item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type === type)))[0];
                } else if (armorType === "Chest") {
                    item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type === type)))[0];
                } else if (armorType === "Legs") {
                    item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type === type)))[0];
                };
                if (item) {
                    let mutatedItems = await mutate([item], rarity) as Equipment[];
                    mutatedItems.forEach(item => new Equipment(item));
                    const clonedItem = deepClone(mutatedItems[0]);
                    merchantEquipment.push(clonedItem);
                };
            };
        };
        return merchantEquipment;
    } catch(err) {
        console.warn(err, `Error Getting "${type}" Equipment`);
    };
};

function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    };
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as unknown as T;
    };
    if (obj instanceof Array) {
        const arrCopy = [] as unknown as T;
        (obj as unknown as Array<unknown>).forEach((item, index) => {
            (arrCopy as any)[index] = deepClone(item);
        });
        return arrCopy;
    };
    const objCopy = {} as T;
    Object.keys(obj).forEach((key) => {
        (objCopy as unknown as Record<string, unknown>)[key] = deepClone((obj as unknown as Record<string, unknown>)[key]);
    });
    return objCopy;
};

export { create, defaultMutate, determineMutation, mutate, getOneDetermined, getOneRandom, getOneSpecific, upgradeEquipment, getPhysicalWeaponEquipment, getMagicalWeaponEquipment, getArmorEquipment, getJewelryEquipment, getMerchantEquipment, getClothEquipment, getSpecificArmor, getOneTemplate, deepClone };