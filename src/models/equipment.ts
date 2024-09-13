import { Weapons } from '../assets/db/weaponry';
import { Legs, Chests, Shields, Helmets } from '../assets/db/equipment';
import { Amulets, Rings, Trinkets } from '../assets/db/jewelry';
import { v4 as uuidv4 } from 'uuid';
import { addEquipment } from '../assets/db/db';

const ATTRIBUTE_RANGE = {
    Default: [0, 0, 0, 0, 0, 0, 0], 
    Common: [0, 1, 1, 1, 2, 2, 3], 
    Uncommon: [1, 1, 2, 2, 3, 4, 5],
    Rare: [2, 3, 4, 5, 6, 7, 8],
    Epic: [4, 5, 6, 7, 8, 10, 12],
    Legendary: [10, 14, 17, 20, 24, 27, 30],
};
const ATTRIBUTES = ['strength', 'constitution', 'agility', 'achre', 'caeren', 'kyosir'];
const CHANCE = ['criticalChance', 'physicalPenetration', 'magicalPenetration', 'roll', 'dodge'];
const DAMAGE = ['physicalDamage', 'magicalDamage'];
const DEFENSE = ['physicalResistance', 'magicalResistance'];
const CRITICAL = ['criticalDamage'];

function influence(influences: string[] | undefined): string[] | undefined {
    if (!influences) return undefined;
    const deity = influences[Math.floor(Math.random() * influences.length)];
    return [deity];
};

export default class Equipment {
    public _id: string | number[] = uuidv4();
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
        this.magicalDamage = equipment.magicalDamage,
        this.physicalDamage = equipment.physicalDamage,
        this.damageType = equipment?.damageType,
        this.criticalChance = equipment.criticalChance,
        this.criticalDamage = equipment.criticalDamage,
        this.magicalPenetration = equipment?.magicalPenetration,
        this.physicalPenetration = equipment?.physicalPenetration,
        this.magicalResistance = equipment?.magicalResistance,
        this.physicalResistance = equipment?.physicalResistance,
        this.dodge = equipment.dodge,
        this.roll = equipment.roll,
        this.constitution = equipment.constitution;
        this.strength = equipment.strength;
        this.agility = equipment.agility;
        this.achre = equipment.achre;
        this.caeren = equipment.caeren;
        this.kyosir = equipment.kyosir;
        this.influences = influence(equipment?.influences);
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
        console.log(err, 'Error Mutating Equipment');
    };
};

async function mutate(equipment: Equipment[], rarity?: string | 'Common') { 
    try {
        const range = ATTRIBUTE_RANGE[rarity as keyof typeof ATTRIBUTE_RANGE];
        for (const item of equipment) {
            item._id = uuidv4(); // uuidv4();
            const attributeCount = ATTRIBUTES.filter(attribute => item[attribute] > 0).length;
            for (const attribute of ATTRIBUTES) {   
                if (item[attribute] > 0) {
                    if (attributeCount === 1) {
                        item[attribute] = randomIntFromInterval(range[4], range[6]);
                    } else if (attributeCount === 2) {
                        item[attribute] = randomIntFromInterval(range[3], range[5]);
                    } else if (attributeCount === 3) {
                        item[attribute] = randomIntFromInterval(range[2], range[4]);
                    } else if (attributeCount === 4) {
                        item[attribute] = randomIntFromInterval(range[1], range[3]);
                    } else if (attributeCount === 5) {
                        item[attribute] = randomIntFromInterval(range[0], range[2]);
                    } else {
                        item[attribute] = randomIntFromInterval(range[0], range[1]);
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
            if (item.influences) {
                item.influences = influence(item.influences);
            };
            await addEquipment(item);
        };
        return equipment;
    } catch (err) {
        console.warn(err, 'Error Mutating Equipment');
    };
};

async function getOneRandom(level: number = 1) {
    try {
        let rarity = determineRarityByLevel(level);
        let type = determineEquipmentType();
        let equipment: Equipment[] = []; // Initialize equipment as an empty array
        let eqpCheck = Math.floor(Math.random() * 100  + 1);
        if ((type === 'Amulet' || type === 'Ring' || type === 'Trinket') && rarity === 'Common') rarity = 'Uncommon';
        if (level < 4) {
            rarity = 'Common';
            if (eqpCheck > 75) {
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
        equipment.forEach(item => new Equipment(item));
        return equipment;
    } catch (err) {
        console.warn(err, 'Error Getting One Equipment');
    };
};

async function aggregate(rarity: string, type: string, size: number, name?: string): Promise<Equipment[] | undefined> {
    try {
        let equipment: Equipment = {} as Equipment;
        let total: Equipment[] = [];
        const fetcher = () => {
            switch (type) {
                case 'Weapon':
                    if (name) {
                        equipment = Weapons.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Weapons.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment}; 
                case 'Shield':
                    if (name) {
                        equipment = Shields.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Shields.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment};
                case 'Helmet':
                    if (name) {
                        equipment = Helmets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Helmets.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment};
                case 'Chest':
                    if (name) {
                        equipment = Chests.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Chests.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment};
                case 'Legs':
                    if (name) {
                        equipment = Legs.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Legs.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment};
                case 'Ring':
                    if (name) {
                        equipment = Rings.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Rings.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment};
                case 'Amulet':
                    if (name) {
                        equipment = Amulets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Amulets.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment};
                case 'Trinket':
                    if (name) {
                        equipment = Trinkets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Trinkets.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return {...equipment};
                default:
                    const allEquipmentOfType = [...Weapons, ...Shields, ...Helmets /* add other types here */];
                    const filteredEquipment = allEquipmentOfType.filter((eq) => eq.rarity === rarity);
                    const randomIndex = Math.floor(Math.random() * filteredEquipment.length);
                    return equipment = {...filteredEquipment[randomIndex]};
            };                       
        };
        for (let i = 0; i < size; i++) {
            fetcher();
            total.push(equipment);
        };
        total = await mutate(total, rarity) as Equipment[];
        return total;
    } catch (err: any) {
        console.log(err, 'Error Aggregating Equipment');
    };
};

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    };
    return array;
};

function determineRarityByLevel(level: number): string {
    const chance = Math.random();
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
    const roll = Math.floor(Math.random() * 100  + 1);
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

async function getHigherRarity(name: string, type: string, rarity: string) {
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
    return nextItem || null;
};  

async function upgradeEquipment(data: any) {
    try {
        let realType;
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
                realType = undefined;
                break;
        };
        let item = await getHigherRarity(data.upgradeName, realType as string, data.currentRarity);
        return item;
    } catch (err: any) {
        console.log(err, 'err')
    };
};

function randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

function randomFloatFromInterval(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}; 

async function getPhysicalWeaponEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 9; i++) {
            const rarity = determineRarityByLevel(level);
            let item = shuffleArray(Weapons.filter((eq) => (eq.rarity === rarity && eq.attackType === 'Physical')))[0];
            let equipment = await mutate([item], rarity) as Equipment[];
            equipment.forEach(item => new Equipment(item));
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
        for (let i = 0; i < 9; i++) {
            const rarity = determineRarityByLevel(level);
            let item = shuffleArray(Weapons.filter((eq) => (eq.rarity === rarity && eq.attackType === 'Magic')))[0];
            let equipment = await mutate([item], rarity) as Equipment[];
            equipment.forEach(item => new Equipment(item));
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
        for (let i = 0; i < 9; i++) {        
            let type;
            let rarity;
            let types = ['Shield', 'Helmet', 'Chest', 'Legs', 'Helmet', 'Chest', 'Legs', 'Helmet', 'Chest', 'Legs'];
            rarity = determineRarityByLevel(level);
            type = types[Math.floor(Math.random() * types.length)];
            let eqpCheck = Math.floor(Math.random() * 100 + 1);
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
            let equipment = await mutate([item as Equipment], rarity) as Equipment[];
            equipment.forEach(item => new Equipment(item));
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
        for (let i = 0; i < 9; i++) {        
            let type;
            let rarity;
            let types = ['Ring', 'Amulet', 'Trinket'];
            rarity = determineRarityByLevel(level);
            if (rarity === 'Common') {
                rarity = 'Uncommon';
            };
            type = types[Math.floor(Math.random() * types.length)];
            let item;
            if (type === 'Ring') {
                item = shuffleArray( Rings.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === 'Amulet') {
                item = shuffleArray(Amulets.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === 'Trinket') {
                item = shuffleArray(Trinkets.filter((eq) => (eq.rarity === rarity)))[0]; 
            };
            let equipment = await mutate([item as Equipment], rarity) as Equipment[];
            equipment.forEach(item => new Equipment(item));
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
        for (let i = 0; i < 9; i++) {
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
        for (let i = 0; i < 9; i++) {        
            let type;
            let rarity;
            let types = ['Helmet', 'Chest', 'Legs'];
            rarity = determineRarityByLevel(level);
            type = types[Math.floor(Math.random() * types.length)];
            let item;
            if (type === 'Helmet') {
                item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type === 'Leather-Cloth' )))[0];
            } else if (type === 'Chest') {
                item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type === 'Leather-Cloth' )))[0];
            } else if (type === 'Legs') {
                item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type === 'Leather-Cloth' )))[0]; 
            };
            if (item) {
                let mutatedItems = await mutate([item], rarity) as Equipment[];
                mutatedItems.forEach(item => new Equipment(item));
                const clonedItem = deepClone(mutatedItems[0]);
                merchantEquipment.push(clonedItem);
            };
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
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

export { create, defaultMutate, mutate, getOneRandom, upgradeEquipment, getPhysicalWeaponEquipment, getMagicalWeaponEquipment, getArmorEquipment, getJewelryEquipment, getMerchantEquipment, getClothEquipment };