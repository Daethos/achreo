import { Weapons } from "../assets/db/weaponry";
import { Legs, Chests, Shields, Helmets } from "../assets/db/equipment";
import { Amulets, Rings, Trinkets } from "../assets/db/jewelry";
import { v4 as uuidv4 } from "uuid";
import { addEquipment } from "../assets/db/db";
const COLLECTION = [Weapons, Legs, Chests, Shields, Helmets, Amulets, Rings, Trinkets];
const ATTRIBUTES = ["strength", "constitution", "agility", "achre", "caeren", "kyosir"];
const CHANCE = ["criticalChance", "physicalPenetration", "magicalPenetration", "roll", "dodge"];
const DAMAGE = ["physicalDamage", "magicalDamage"];
const DEFENSE = ["physicalResistance", "magicalResistance"];
const CRITICAL = ["criticalDamage"];
const ATTRIBUTE_MUTATION_RANGES = {
    1: [1, 1],
    2: [1, 2],
    3: [2, 3],
    4: [2, 4],
    5: [3, 5],
    6: [4, 6],
    7: [5, 7],
    8: [5, 8],
    9: [6, 9],
    10: [7, 10],
    11: [7, 11],
    12: [8, 12],
    13: [9, 13],
    14: [10, 14],
    15: [11, 15],
    16: [12, 16],
    17: [13, 17],
    18: [14, 18],
    19: [15, 19],
};
const CHANCE_MUTATION_RANGES = [
    { threshold: 24, range: [0, 4] },
    { threshold: 20, range: [0, 2] },
    { threshold: 18, range: [0, 2] },
    { threshold: 16, range: [0, 1.5] },
    { threshold: 14, range: [0, 1.5] },
    { threshold: 12, range: [-1, 1.5] },
    { threshold: 10, range: [-1, 1.5] },
    { threshold: 8, range: [-1, 1] },
    { threshold: 6, range: [-1, 1] },
    { threshold: 4, range: [-1, 0.5] },
    { threshold: 2, range: [-1, 0.5] },
    { threshold: 0, range: [-1, 0] }
];
const DAMAGE_MUTATION_RANGES = [
    { threshold: 20, range: [0, 4] },
    { threshold: 18, range: [0, 2] },
    { threshold: 16, range: [0, 2] },
    { threshold: 14, range: [0, 2] },
    { threshold: 12, range: [-1, 2] },
    { threshold: 10, range: [-1, 2] },
    { threshold: 8, range: [-1, 1] },
    { threshold: 6, range: [-1, 1] },
    { threshold: 4, range: [-1, 0] },
    { threshold: 2, range: [-1, 0] },
    { threshold: 0, range: [0, 0] }
];
const DEFENSE_MUTATION_RANGES = [
    { threshold: 20, range: [0, 3] },
    { threshold: 18, range: [0, 1.5] },
    { threshold: 16, range: [0, 1.5] },
    { threshold: 14, range: [0, 1.5] },
    { threshold: 12, range: [-1, 1] },
    { threshold: 10, range: [-1, 1] },
    { threshold: 8, range: [-1, 0.5] },
    { threshold: 6, range: [-1, 0.5] },
    { threshold: 4, range: [-1, 0] },
    { threshold: 2, range: [-1, 0] },
    { threshold: 0, range: [-1, 0] }
];
const CRITICAL_MUTATION_RANGES = [
    { threshold: 1.99, range: [-0.2, 0.25] },
    { threshold: 1.74, range: [-0.15, 0.2] },
    { threshold: 1.49, range: [-0.1, 0.15] },
    { threshold: 1.24, range: [-0.05, 0.1] },
    { threshold: 1.09, range: [-0.02, 0.03] },
    { threshold: 1.05, range: [-0.01, 0.03] },
    { threshold: 1.03, range: [-0.01, 0.02] },
    { threshold: 1.02, range: [-0.01, 0.02] },
    { threshold: 1.01, range: [0, 0.01] }
];

COLLECTION.forEach(deepFreeze);

export function deepFreeze<T>(obj: T): T {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
        const value = (obj as any)[prop];
        if (value && typeof value === "object" && !Object.isFrozen(value)) {
            deepFreeze(value);
        };
    });
    return obj;
};

function findMutationRange(value: number, ranges: Array<{threshold: number, range: number[]}>) {
    return ranges.find(r => value >= r.threshold)?.range || [0, 0];
};

export function getSpecificItem(name: string, rarity: string) {
    for (const collection of COLLECTION) {
        const found = collection.find(i => i.name === name && i.rarity === rarity);
        if (found) return Object.freeze(found);
    };
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
    public imgUrl: string = "../assets/images/gladius.png";

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

export const initEquipment: Equipment = new Equipment({
    _id: "",
    name: "Moontear",
    type: "Dagger",
    rarity: "Common",
    grip: "One Hand",
    attackType: "Physical",
    damageType: ["Pierce"],
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 0,
    magicalPenetration: 1,
    criticalChance: 1,
    criticalDamage: 1,
    dodge: 0,
    roll: 3,
    constitution: 0,
    strength: 0,
    agility: 2,
    achre: 2,
    caeren: 0,
    kyosir: 2,
    influences: ["Ma'anre"],
    imgUrl: "../assets/images/maanre-dagger.png"
});

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
        console.warn(err, "Error Mutating Equipment");
    };
};

function determineMutation(eqp: Equipment, sans: string[]): Equipment | undefined {
    try {
        // console.log(eqp, "Starting EQP");
        const baseItem = deepClone(getSpecificItem(eqp.name, eqp.rarity as string)); // JSON.parse(JSON.stringify(getSpecificItem(item)));
        const base = deepClone(baseItem);
        // console.log(base, "Base!");
        let item = deepClone(eqp);
        // console.log(item, "Item!");
        // console.log(base, "Base Item");
        for (const attribute of ATTRIBUTES) {
            if (sans.includes(attribute)) continue;
            const baseline: number = base![attribute as keyof typeof base];
            if (!baseline || baseline <= 0 || baseline >= 20) continue;
            const [min, max] = ATTRIBUTE_MUTATION_RANGES[baseline as keyof typeof ATTRIBUTE_MUTATION_RANGES];
            item[attribute] = randomIntFromInterval(min, max);
        };
        for (const attribute of CHANCE) {
            if (sans.includes(attribute)) continue;
            const baseline = base![attribute as keyof typeof base];
            const [minMod, maxMod] = findMutationRange(baseline, CHANCE_MUTATION_RANGES);
            item[attribute] = randomFloatFromInterval(
                Math.max(baseline + minMod, 0),
                baseline + maxMod
            );
        };

        for (const attribute of DAMAGE) {
            if (sans.includes(attribute)) continue;
            const baseline = base![attribute as keyof typeof base];
            const [minMod, maxMod] = findMutationRange(baseline, DAMAGE_MUTATION_RANGES);
            item[attribute] = randomIntFromInterval(
                Math.max(baseline + minMod, 0),
                baseline + maxMod
            );
        };

        for (const attribute of DEFENSE) {
            if (sans.includes(attribute)) continue;
            const baseline = base![attribute as keyof typeof base];
            const [minMod, maxMod] = findMutationRange(baseline, DEFENSE_MUTATION_RANGES);
            item[attribute] = randomFloatFromInterval(
                Math.max(baseline + minMod, 0),
                baseline + maxMod
            );
        };

        for (const attribute of CRITICAL) {
            if (sans.includes(attribute)) continue;
            const baseline = base![attribute as keyof typeof base];
            const [minMod, maxMod] = findMutationRange(baseline, CRITICAL_MUTATION_RANGES);
            item[attribute] = randomFloatFromInterval(
                Math.max(baseline + minMod, 0),
                baseline + maxMod
            );
        };
        return item;
    } catch (err) {
        console.warn(err, "Error Determining Mutation");
    };
};

async function mutate(equipment: Equipment[], _rarity?: string | "Common") { 
    try {
        // const range = ATTRIBUTE_RANGE[rarity as keyof typeof ATTRIBUTE_RANGE];
        for (const item of equipment) {
            item._id = uuidv4(); // uuidv4();
            item.influences = influence((item as any)?.influences);
            // console.log(item.influences, "Current Influence of Item!")
            // const attributeCount = ATTRIBUTES.filter(attribute => item[attribute] > 0).length;
            for (const attribute of ATTRIBUTES) {
                const baseline: number = item[attribute];
                if (!baseline || baseline <= 0 || baseline >= 20) continue;
                const [min, max] = ATTRIBUTE_MUTATION_RANGES[baseline as keyof typeof ATTRIBUTE_MUTATION_RANGES];
                item[attribute] = randomIntFromInterval(min, max);
            };
            for (const attribute of CHANCE) {
                const baseline = item![attribute as keyof typeof item];
                const [minMod, maxMod] = findMutationRange(baseline, CHANCE_MUTATION_RANGES);
                item[attribute] = randomFloatFromInterval(
                    Math.max(baseline + minMod, 0),
                    baseline + maxMod
                );
            };

            for (const attribute of DAMAGE) {
                const baseline = item![attribute as keyof typeof item];
                const [minMod, maxMod] = findMutationRange(baseline, DAMAGE_MUTATION_RANGES);
                item[attribute] = randomIntFromInterval(
                    Math.max(baseline + minMod, 0),
                    baseline + maxMod
                );
            };

            for (const attribute of DEFENSE) {
                const baseline = item![attribute as keyof typeof item];
                const [minMod, maxMod] = findMutationRange(baseline, DEFENSE_MUTATION_RANGES);
                item[attribute] = randomFloatFromInterval(
                    Math.max(baseline + minMod, 0),
                    baseline + maxMod
                );
            };

            for (const attribute of CRITICAL) {
                const baseline = item![attribute as keyof typeof item];
                const [minMod, maxMod] = findMutationRange(baseline, CRITICAL_MUTATION_RANGES);
                item[attribute] = randomFloatFromInterval(
                    Math.max(baseline + minMod, 0),
                    baseline + maxMod
                );
            };
            await addEquipment(item);
        };
        return equipment;
    } catch (err) {
        console.warn(err, "Error Mutating Equipment");
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
    if ((type === "Amulet" || type === "Ring" || type === "Trinket") && rarity === "Common") rarity = "Uncommon";
    if (level < 4) {
        rarity = "Common";
        if (eqpCheck > 70) {
            type = "Weapon";
        } else if (eqpCheck > 60) {
            type = "Shield";
        } else if (eqpCheck > 40) {
            type = "Helmet";
        } else if (eqpCheck > 20) {
            type = "Chest";
        } else {
            type = "Legs";
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
        console.warn(err, "Error Getting One Equipment");
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
        if ((type === "Amulet" || type === "Ring" || type === "Trinket") && rarity === "Common") rarity = "Uncommon";
        if (level < 4) {
            rarity = "Common";
            if (eqpCheck > 70) {
                type = "Weapon";
            } else if (eqpCheck > 60) {
                type = "Shield";
            } else if (eqpCheck > 40) {
                type = "Helmet";
            } else if (eqpCheck > 20) {
                type = "Chest";
            } else {
                type = "Legs";
            };
        };
        equipment = await aggregate(rarity, type, 1) as Equipment[];
        equipment.forEach(item => new Equipment(deepClone(item)));
        return equipment;
    } catch (err) {
        console.warn(err, "Error Getting One Equipment");
    };
};

async function aggregate(rarity: string, type: string, size: number, name?: string): Promise<Equipment[] | undefined> {
    try {
        let equipment: Equipment = {} as Equipment;
        let total: Equipment[] = [];
        for (let i = 0; i < size; i++) {
            (equipment as any) = deepClone(fetcher(equipment, rarity, type, name));
            total.push(equipment);
        };
        total = await mutate(total, rarity) as Equipment[];
        return total;
    } catch (err: any) {
        console.warn(err, "Error Aggregating Equipment");
    };
};

const fetcher = (equipment: {}, rarity: string, type: string, name?: string) => {
    switch (type) {
        case "Weapon":
            if (name) {
                equipment = Weapons.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Weapons.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case "Shield":
            if (name) {
                equipment = Shields.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Shields.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case "Helmet":
            if (name) {
                equipment = Helmets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Helmets.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case "Chest":
            if (name) {
                equipment = Chests.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Chests.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case "Legs":
            if (name) {
                equipment = Legs.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Legs.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case "Ring":
            if (name) {
                equipment = Rings.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Rings.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case "Amulet":
            if (name) {
                equipment = Amulets.find((eq) => eq.name === name && eq.rarity === rarity) as Equipment;
            } else {
                equipment = shuffleArray(Amulets.filter((eq) => eq.rarity === rarity))[0];
            };
            break;
        case "Trinket":
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

function determineRarityByLevel(level: number): string {
    const chance = randomFloatFromInterval(0.0, 1.0);
    let rarity = "";
    let uScale = level / 40;
    let rScale = level / 200;
    let eScale = level / 500;
    let lScale = level / 10000;
    if (level < 4) {
        rarity = "Common";
    } else if (level >= 4 && level < 12) {
        if (rScale > chance) {
            rarity = "Rare";
        } else if (uScale > chance) {
            rarity = "Uncommon";
        } else {
            rarity = "Common";
        };
    } else if (level >= 12 && level < 20) {
        if (eScale > chance) {
            rarity = "Epic";
        } else if (rScale > chance) {
            rarity = "Rare";
        } else if (uScale > chance) {
            rarity = "Uncommon";
        } else {
            rarity = "Common";
        };
    } else if (level >= 20 && level < 30) {
        if (lScale > chance) {
            rarity = "Legendary";
        } else if (eScale > chance) {
            rarity = "Epic";
        } else if (rScale > chance) {
            rarity = "Rare";
        } else {
            rarity = "Uncommon";
        };
    }; 
    return rarity;
};

function determineEquipmentType(): string {
    const roll = randomIntFromInterval(1, 100);
    if (roll <= 32) {
        return "Weapon";
    } else if (roll <= 40) {
        return "Shield";
    } else if (roll <= 50) {
        return "Helmet";
    } else if (roll <= 60) {
        return "Chest";
    } else if (roll <= 70) {
        return "Legs";
    } else if (roll <= 80) {
        return "Ring";
    } else if (roll <= 90) {
        return "Amulet";
    } else {
        return "Trinket";
    };
};

async function getHigherRarity(name: string, type: string, rarity: string): Promise<Equipment[] | undefined> {
    let nextRarity: string = "";
    if (rarity === "Common") {
        nextRarity = "Uncommon";
    } else if (rarity === "Uncommon") {
        nextRarity = "Rare";
    } else if (rarity === "Rare") {
        nextRarity = "Epic";
    } else if (rarity === "Epic") {
        nextRarity = "Legendary";
    };
    const nextItem = await aggregate(nextRarity, type, 1, name);
    return nextItem || undefined;
};  

async function upgradeEquipment(data: any) {
    try {
        let realType: string = "";
        switch (data.inventoryType) {
            case "weaponOne": 
                realType = "Weapon"; 
                break;
            case "weaponTwo": 
                realType = "Weapon";
                break;
            case "weaponThree": 
                realType = "Weapon";
                break;
            case "shield": 
                realType = "Shield";
                break;
            case "helmet": 
                realType = "Helmet";
                break;
            case "chest": 
                realType = "Chest";
                break;
            case "legs": 
                realType = "Legs";
                break;
            case "ringOne": 
                realType = "Ring";
                break;
            case "ringTwo": 
                realType = "Ring";
                break;
            case "amulet": 
                realType = "Amulet";
                break;
            case "trinket": 
                realType = "Trinket";
                break;
            default: 
                realType = "Weapon";
                break;
        };
        let item = await getHigherRarity(data.upgradeName, realType as string, data.currentRarity);
        const clone = deepClone(item?.[0]);
        return [clone];
    } catch (err: any) {
        console.warn(err, "err")
    };
};

async function getPhysicalWeaponEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {
            const rarity = determineRarityByLevel(level);
            let item = shuffleArray(Weapons.filter((eq) => (eq.rarity === rarity && eq.attackType === "Physical")))[0];
            const cloneItem = deepClone(item);
            let equipment = await mutate([cloneItem], rarity) as Equipment[];
            equipment.forEach(it => new Equipment(it));
            const clone = deepClone(equipment[0]);
            merchantEquipment.push(clone);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, "Error in Merchant Function");
    };
};

async function getMagicalWeaponEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {
            const rarity = determineRarityByLevel(level);
            let item = shuffleArray(Weapons.filter((eq) => (eq.rarity === rarity && eq.attackType === "Magic")))[0];
            const cloneItem = deepClone(item);
            let equipment = await mutate([cloneItem], rarity) as Equipment[];
            equipment.forEach(it => new Equipment(it));
            const clone = deepClone(equipment[0]);
            merchantEquipment.push(clone);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, "Error in Merchant Function");
    };
};

async function getArmorEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {        
            let type;
            let rarity;
            let types = ["Shield", "Helmet", "Chest", "Legs", "Helmet", "Chest", "Legs", "Helmet", "Chest", "Legs"];
            const rand = randomIntFromInterval(0, types.length - 1);
            rarity = determineRarityByLevel(level);
            type = types[rand];
            let eqpCheck = randomIntFromInterval(1, 100);
            let item;
            if (level < 4) {
                if (eqpCheck > 90) {
                    item = shuffleArray(Shields.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];
                } else if (eqpCheck > 60) {
                    item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];
                } else if (eqpCheck > 30) {
                    item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];  
                } else {
                    item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];
                };
            } else if (type === "Shield") {
                item = shuffleArray(Shields.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];
            } else if (type === "Helmet") {
                item = shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];
            } else if (type === "Chest") {
                item = shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];
            } else if (type === "Legs") {
                item = shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type !== "Leather-Cloth")))[0];
            };
            const cloneItem = deepClone(item);
            let equipment = await mutate([cloneItem as Equipment], rarity) as Equipment[];
            equipment.forEach(it => new Equipment(it));
            const clone = deepClone(equipment[0]);
            merchantEquipment.push(clone);
        };
        return merchantEquipment;
    } catch (err) {
        console.warn(err, "Error in Merchant Function");
    };
};

async function getJewelryEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {        
            let type;
            let rarity;
            let types = ["Ring", "Amulet", "Trinket"];
            const rand = randomIntFromInterval(0, types.length - 1);
            rarity = determineRarityByLevel(level);
            if (rarity === "Common") {
                rarity = "Uncommon";
            };
            type = types[rand];
            let item;
            if (type === "Ring") {
                item = shuffleArray( Rings.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === "Amulet") {
                item = shuffleArray(Amulets.filter((eq) => (eq.rarity === rarity)))[0];
            } else if (type === "Trinket") {
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
        console.warn(err, "Error in Merchant Function");
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
        console.warn(err, "Error in Merchant Function");
    };
};

async function getClothEquipment(level: number): Promise<Equipment[] | undefined> {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {        
            let type;
            let rarity;
            let types = ["Helmet", "Chest", "Legs"];
            const rand = randomIntFromInterval(0, types.length - 1);
            rarity = determineRarityByLevel(level);
            type = types[rand];
            let item;
            if (type === "Helmet") {
                item = deepClone(shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type === "Leather-Cloth" )))[0]);
            } else if (type === "Chest") {
                item = deepClone(shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type === "Leather-Cloth" )))[0]);
            } else if (type === "Legs") {
                item = deepClone(shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type === "Leather-Cloth" )))[0]); 
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
        console.warn(err, "Error in Merchant Function");
    };
};

async function getSpecificArmor(level: number, type: string) {
    try {
        let merchantEquipment = [];
        for (let i = 0; i < 12; i++) {
            let item: any = undefined,
                armorType: string = "",
                armorTypes: string[] = ["Helmet", "Chest", "Legs"],
                rarity: string = "";
            
            const rand = randomIntFromInterval(0, 2);
            rarity = determineRarityByLevel(level);
            armorType = armorTypes[rand];

            item = deepClone(shuffleArray([armorType].filter((eq: any) => (eq.rarity === rarity && eq.type === type)))[0]);
            // const baseItem = deepClone(getGeneralItem({rarity, type}));

            if (item) {
                let mutatedItems = await mutate([item], rarity) as Equipment[];
                mutatedItems.forEach(item => new Equipment(item));
                const clonedItem = deepClone(mutatedItems[0]);
                merchantEquipment.push(clonedItem);
            } else {
                if (armorType === "Helmet") {
                    item = deepClone(shuffleArray(Helmets.filter((eq) => (eq.rarity === rarity && eq.type === type)))[0]);
                } else if (armorType === "Chest") {
                    item = deepClone(shuffleArray(Chests.filter((eq) => (eq.rarity === rarity && eq.type === type)))[0]);
                } else if (armorType === "Legs") {
                    item = deepClone(shuffleArray(Legs.filter((eq) => (eq.rarity === rarity && eq.type === type)))[0]);
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

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomIntFromInterval(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    };
    return array;
};

function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
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