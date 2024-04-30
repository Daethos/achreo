import { Weapons } from '../assets/db/weaponry';
import { Legs, Chests, Shields, Helmets } from '../assets/db/equipment';
import { Amulets, Rings, Trinkets } from '../assets/db/jewelry';
import { v4 as uuidv4 } from 'uuid';
import { addEquipment, deleteEquipment, getAscean, updateAscean } from '../assets/db/db';
import { EventBus } from '../game/EventBus';

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
        this.influences = equipment?.influences;
        this.imgUrl = equipment.imgUrl;
    };
    [key: string]: any;

};

async function create(data: any): Promise<Equipment> {
    const equipment = new Equipment(data);
    mutate([equipment], equipment?.rarity);
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
        const attributeRanges = {
            Default: [0, 0, 0, 0, 0, 0],
            Common: [0, 1, 1, 1, 2, 3],
            Uncommon: [1, 1, 2, 2, 3, 5],
            Rare: [2, 3, 4, 5, 6, 8],
            Epic: [4, 5, 6, 7, 10, 12],
            Legendary: [10, 14, 17, 20, 24, 30],
        };
        const range = attributeRanges[rarity as keyof typeof attributeRanges];
        const attributes = ['strength', 'constitution', 'agility', 'achre', 'caeren', 'kyosir'];
        const chance = ['criticalChance', 'physicalPenetration', 'magicalPenetration', 'roll', 'dodge'];
        const damage = ['physicalDamage', 'magicalDamage'];
        const critDamage = ['criticalDamage'];
        
    
        equipment.forEach(async (item: Equipment) => {
            item._id = uuidv4(); // uuidv4();
            const attributeCount = attributes.filter(attribute => item[attribute] > 0).length;
    
            attributes.forEach(async attribute => {
                if (item[attribute] > 0) {
                    if (attributeCount === 1) {
                        item[attribute] = randomIntFromInterval(range[4], range[5]);
                    } else if (attributeCount === 2) {
                        item[attribute] = randomIntFromInterval(range[2], range[4]);
                    } else if (attributeCount === 3) {
                        item[attribute] = randomIntFromInterval(range[1], range[3]);
                    } else if (attributeCount === 4) { // 4-6
                        item[attribute] = randomIntFromInterval(range[0], range[2]);
                    } else if (attributeCount === 5) { // 5-6
                        item[attribute] = randomIntFromInterval(range[0], range[1]);
                    } else { // 6
                        item[attribute] = randomIntFromInterval(range[0], range[0]);
                    };
                };
            });
        
            chance.forEach(async att => {
                if (item[att] > 10) {
                    item[att] = randomIntFromInterval(item[att] -2, item[att] + 5);
                } else if (item[att] > 5) { // 6-10
                    item[att] = randomIntFromInterval(item[att] - 1, item[att] + 3);
                } else if (item[att] >= 3) { // 3-5
                    item[att] = randomIntFromInterval(item[att], item[att] + 2);
                } else if (item[att] > 0) { // 1-2
                    item[att] = randomIntFromInterval(item[att], item[att] + 1);
                };
            });
        
            damage.forEach(async dam => {
                if (item[dam] > 20) { // 21 +/- 5/3
                    item[dam] = randomIntFromInterval(item[dam] - 1, item[dam] + 5);
                } else if (item[dam] > 10) { // 11-20 +/- 3/2
                    item[dam] = randomIntFromInterval(item[dam] - 1, item[dam] + 3);
                } else if (item[dam] > 5) { // 6-10 +/- 2/1
                    item[dam] = randomIntFromInterval(item[dam], item[dam] + 2);
                } else if (item[dam] > 1) { // 2-5 +/- 1/0
                    item[dam] = randomIntFromInterval(item[dam], item[dam] + 1);
                };
            });
        
            critDamage.forEach(async dam => {
                if (item[dam] > 1.99) { // 2.0 +/- 0.3/0.25 (0.55 Range)
                    item[dam] = randomFloatFromInterval(item[dam] - 0.25, item[dam] + 0.3);
                } else if (item[dam] > 1.74) { // 1.75 +/- 0.25/0.2 (0.45 Range)
                    item[dam] = randomFloatFromInterval(item[dam] - 0.2, item[dam] + 0.25);
                } else if (item[dam] > 1.49) { // 1.5 +/- 0.2/0.15 (0.35 Range)
                    item[dam] = randomFloatFromInterval(item[dam] - 0.15, item[dam] + 0.2);
                } else if (item[dam] > 1.24) { // 1.25 +/- 0.15/0.1 (0.25 Range)
                    item[dam] = randomFloatFromInterval(item[dam] - 0.1, item[dam] + 0.15);
                } else if (item[dam] > 1.09) { // 1.1 +/- 0.05/0.02 (0.07 Range)
                    item[dam] = randomFloatFromInterval(item[dam] - 0.02, item[dam] + 0.05);
                } else if (item[dam] > 1.05) { // 1.05 +/- 0.04/0.01 (0.05 Range)
                    item[dam] = randomFloatFromInterval(item[dam] - 0.01, item[dam] + 0.04);
                } else if (item[dam] === 1.03) { // 1.00 +/- 0.03/0 (0.03 Range)
                    item[dam] = randomFloatFromInterval(item[dam], item[dam] + 0.03);
                } else if (item[dam] === 1.02) { // 1.00 +/- 0.02/0 (0.02 Range)
                    item[dam] = randomFloatFromInterval(item[dam], item[dam] + 0.02);
                } else if (item[dam] === 1.01) { // 1.00 +/- 0.01/0 (0.01 Range)
                    item[dam] = randomFloatFromInterval(item[dam], item[dam] + 0.01);
                };
            });
            await addEquipment(item);
        });
        return equipment;
    } catch (err) {
        console.log(err, 'Error Mutating Equipment');
    };
};

async function getOneRandom(level: number = 1) {
    try {
        let rarity = determineRarityByLevel(level);
        let type = determineEquipmentType();
        let equipment: Equipment[] = []; // Initialize equipment as an empty array
        let eqpCheck = Math.floor(Math.random() * 100  + 1);

        // ==============
        // eqpCheck = 65;
        // ==============

        if ((type === 'Amulet' || type === 'Ring' || type === 'Trinket') && rarity === 'Common') {
            rarity = 'Uncommon';
        };

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
        console.log(err, 'Error Getting One Equipment')
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
                    return { ...equipment }; 
                case 'Shield':
                    if (name) {
                        equipment = Shields.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Shields.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return { ...equipment };
                case 'Helmet':
                    if (name) {
                        equipment = Helmets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Helmets.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return { ...equipment };
                case 'Chest':
                    if (name) {
                        equipment = Chests.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Chests.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return { ...equipment };
                case 'Legs':
                    if (name) {
                        equipment = Legs.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Legs.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return { ...equipment };
                case 'Ring':
                    if (name) {
                        equipment = Rings.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Rings.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return { ...equipment };
                case 'Amulet':
                    if (name) {
                        equipment = Amulets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Amulets.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return { ...equipment };
                case 'Trinket':
                    if (name) {
                        equipment = Trinkets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
                    } else {
                        equipment = shuffleArray(Trinkets.filter((eq) => eq.rarity === rarity))[0];
                    };
                    return { ...equipment };
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
        console.log(err, 'Error Aggregating Equipment')
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
    } else if (roll < 40) {
        return 'Shield';
    } else if (roll < 50) {
        return 'Helmet';
    } else if (roll < 60) {
        return 'Chest';
    } else if (roll < 70) {
        return 'Legs';
    } else if (roll < 80) {
        return 'Ring';
    } else if (roll < 90) {
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

function getRandomNumStr(length: number): string {
    const sets = [
        'abcdefghijklmnopqrstuvwxyz', // Lowercase letters
        '0123456789', // Digits
    ];

    const characters = sets.join('');
    const charactersLength = characters.length;
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
        if (i % 8 === 0 && i > 0) {
            result += '-';
        };
    };
    return result;
}; 

async function getPhysicalWeaponEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 9; i++) {
            const rarity = determineRarityByLevel(level);
            let item = shuffleArray(Weapons.filter((eq) => (eq.rarity === rarity && eq.attackType === 'Physical')))[0];
            let equipment = await mutate([item], rarity) as Equipment[];
            equipment.forEach(item => new Equipment(item));
            merchantEquipment.push(equipment[0]);
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
            merchantEquipment.push(equipment[0]);
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
                    item = shuffleArray(Shields.filter((eq) => (eq.rarity === rarity)))[0];
                } else if (eqpCheck > 60) {
                    item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity)))[0];
                } else if (eqpCheck > 30) {
                    item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity)))[0];  
                } else {
                    item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity)))[0];
                };
            } else if (type === 'Shield') {
                item = shuffleArray(Shields.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === 'Helmet') {
                item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === 'Chest') {
                item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === 'Legs') {
                item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity)))[0];
            };
            let equipment = await mutate([item as Equipment], rarity) as Equipment[];
            equipment.forEach(item => new Equipment(item));
            merchantEquipment.push(equipment[0]);
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
            merchantEquipment.push(equipment[0]);
            // EventBus.emit('blend-game', { merchantEquipment });
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
            merchantEquipment.push(item?.[0]);
        };
        return merchantEquipment as Equipment[];
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
            let equipment = await mutate([item as Equipment], rarity) as Equipment[];
            equipment.forEach(item => new Equipment(item));
            merchantEquipment.push(equipment[0]);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, 'Error in Merchant Function');
    };
};

export { create, defaultMutate, mutate, getOneRandom, getRandomNumStr, upgradeEquipment, getPhysicalWeaponEquipment, getMagicalWeaponEquipment, getArmorEquipment, getJewelryEquipment, getMerchantEquipment, getClothEquipment };