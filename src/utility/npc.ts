import { EventBus } from "../game/EventBus";
import Equipment from "../models/equipment";
import { asceanCompiler } from "./ascean";

export type NPC = {
    name: string;
    named: boolean;
    type: string;
    description: string;
    
    constitution: number;
    strength: number;
    agility: number;
    achre: number;
    caeren: number;
    kyosir: number;
    
    weaponOne: Equipment;
    weaponTwo: Equipment;
    weaponThree: Equipment;
    shield: Equipment;
    helmet: Equipment;
    chest: Equipment; 
    legs: Equipment;
    amulet: Equipment;
    ringOne: Equipment;
    ringTwo: Equipment;
    trinket: Equipment;
    
    faith: string;
    mastery: string;
    origin: string;
    sex: string;
    alive: boolean;
    
    health: { current: number; max: number };
    currency: { silver: number; gold: number };
    level: number;
    experience: number;
    dialogId: string;
};

function findFaith() {
    const chance = Math.floor(Math.random() * 101);
    if (chance > 50) {
        return "devoted";
    } else {
        return "adherent";
    };
};

function findSex() {
    const chance = Math.floor(Math.random() * 101);
    if (chance > 25) {
        return "Man";
    } else {
        return "Woman";
    };
};

function findMastery() {
    const chance = Math.floor(Math.random() * 101);
    if (chance > 50) {
        return "achre";
    } else {
        return "kyosir";
    };
};

function findOrigin() {
    const chance = Math.floor(Math.random() * 101);
    if (chance > 60) {
        return "Li'ivi";
    } else if (chance > 30) {
        return "Fyers";
    } else {
        return "Quor'eite";
    };
};

const Ledger: Equipment = {
    name: 'Ledger',
    type: 'Paper',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: 'One Hand',
    attackType: 'Physical',
    damageType: ['Slash'],
    physicalDamage: 0,
    magicalDamage: 0,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 0,
    magicalResistance: 0,
    criticalChance: 0,
    criticalDamage: 0,
    dodge: 0,
    roll: 5,
    constitution: 0,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 0,
    kyosir: 0,
    influences: ["Quor'ei"],
    imgUrl: '../assets/images/ledger.png',
    _id: '001'
};

const Quill: Equipment = {
    name: 'Quill',
    type: 'Dagger',
    rarity: 'Common',
    itemType: 'Equipoment',
    grip: 'One Hand',
    attackType: 'Physical',
    damageType: ['Pierce'],
    physicalDamage: 1,
    magicalDamage: 0,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 0,
    magicalResistance: 0,
    criticalChance: 0,
    criticalDamage: 0,
    dodge: 0,
    roll: 0,
    constitution: 0,
    strength: 0,
    agility: 1,
    achre: 0,
    caeren: 0,
    kyosir: 0,
    influences: ['Chiomyr'],
    imgUrl: '../assets/images/quill.png',
    _id: '002'
}

const Ley_Book: Equipment = {
    name: 'Ley Book',
    type: 'Book',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: 'One Hand',
    attackType: 'Physical',
    damageType: ['Blunt'],
    physicalDamage: 1,
    magicalDamage: 0,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 0,
    magicalResistance: 0,
    criticalChance: 0,
    criticalDamage: 0,
    dodge: 0,
    roll: 0,
    constitution: 0,
    strength: 0,
    agility: 0,
    achre: 2,
    caeren: 0,
    kyosir: 0,
    influences: [`Quor'ei`],
    imgUrl: '../assets/images/nature-book.png',
    _id: '003'
}

const Coins: Equipment = {
    name: 'Coins',
    type: 'Projectiles',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: undefined,
    attackType: undefined,
    damageType: undefined,
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 3,
    magicalPenetration: 3,
    physicalResistance: 3,
    magicalResistance: 3,
    criticalChance: 1,
    criticalDamage: 1.01,
    dodge: 0,
    roll: 3,
    constitution: 0,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 0,
    kyosir: 2,
    influences: ['Kyrisos'],
    imgUrl: '../assets/images/coins.png',
    _id: '004'
};

const Merchant_Hat: Equipment = {
    name: "Merchant's Hat",
    type: 'Leather-Cloth',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: undefined,
    attackType: undefined,
    damageType: undefined,
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 3,
    magicalResistance: 3,
    criticalChance: 0,
    criticalDamage: 1,
    dodge: 0,
    roll: 3,
    constitution: 1,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 0,
    kyosir: 1,
    influences: undefined,
    imgUrl: '../assets/images/merchant-hat.png',
    _id: '005'
};

const Merchant_Robes: Equipment = {
    name: "Merchant's Robes",
    type: 'Leather-Cloth',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: undefined,
    attackType: undefined,
    damageType: undefined,
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 3,
    magicalResistance: 3,
    criticalChance: 0,
    criticalDamage: 1,
    dodge: 0,
    roll: 3,
    constitution: 1,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 0,
    kyosir: 1,
    influences: undefined,
    imgUrl: '../assets/images/merchant-robes.png',
    _id: '006'
};

const Merchant_Skirt: Equipment = {
    name: "Merchant's Skirt",
    type: 'Leather-Cloth',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: undefined,
    attackType: undefined,
    damageType: undefined,
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 3,
    magicalResistance: 3,
    criticalChance: 0,
    criticalDamage: 1,
    dodge: 0,
    roll: 3,
    constitution: 1,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 0,
    kyosir: 1,
    influences: undefined,
    imgUrl: '../assets/images/merchant-skirt.png',
    _id: '007'
};

const Dae_Amulet: Equipment = {
    name: 'Dae Amulet',
    type: 'Magical',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: undefined,
    attackType: undefined,
    damageType: undefined,
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 1,
    magicalResistance: 1,
    criticalChance: 0,
    criticalDamage: 1,
    dodge: 0,
    roll: 1,
    constitution: 1,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 1,
    kyosir: 0,
    influences: ['Daethos'],
    imgUrl: '../assets/images/dae-amulet.png',
    _id: '008'
};

const Simple_Ring: Equipment = {
    name: 'Simple Ring',
    type: 'Physical',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: undefined,
    attackType: undefined,
    damageType: undefined,
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 0,
    magicalResistance: 0,
    criticalChance: 0,
    criticalDamage: 1,
    dodge: 0,
    roll: 0,
    constitution: 0,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 0,
    kyosir: 0,
    influences: undefined,
    imgUrl: '../assets/images/simple-ring.png',
    _id: '009'
};

const Dae_Trinket: Equipment = {
    name: 'Dae Trinket',
    type: 'Magical',
    rarity: 'Common',
    itemType: 'Equipment',
    grip: undefined,
    attackType: undefined,
    damageType: undefined,
    physicalDamage: 1,
    magicalDamage: 1,
    physicalPenetration: 0,
    magicalPenetration: 0,
    physicalResistance: 1,
    magicalResistance: 1,
    criticalChance: 0,
    criticalDamage: 1,
    dodge: 0,
    roll: 1,
    constitution: 1,
    strength: 0,
    agility: 0,
    achre: 0,
    caeren: 1,
    kyosir: 0,
    influences: ['Daethos'],
    imgUrl: '../assets/images/dae-trinket.png',
    _id: '010'
};

export const Merchant: NPC = {
    name: 'Traveling General Merchant',
    named: false,
    type: 'Merchant',
    description: 'Merchant from Licivitas making their way round the ley.',
    constitution: 10,
    strength: 10,
    agility: 12,
    achre: 14,
    caeren: 10,
    kyosir: 12,
    weaponOne: Quill,
    weaponTwo: Ledger,
    weaponThree: Ley_Book,
    shield: Coins,
    helmet: Merchant_Hat,
    chest: Merchant_Robes,
    legs: Merchant_Skirt,
    amulet: Dae_Amulet,
    ringOne: Simple_Ring,
    ringTwo: Simple_Ring,
    trinket: Dae_Trinket,
    faith: '',
    mastery: '',
    origin: '',
    sex: '',
    health: { current: 100, max: 100 },
    currency: { gold: Math.floor(Math.random() * 50) + 1, silver: Math.floor(Math.random() * 100) + 1},
    experience: 0,
    level: 4,
    alive: true,
    dialogId: "Merchant-General",
};

const CITY_OPTIONS = {
    'Merchant-Alchemy': 'Alchemist',
    'Merchant-Armor': 'Armorer',
    'Merchant-Smith': 'Blacksmith',
    'Merchant-Jewelry': 'Jeweler',
    'Merchant-General': 'General Merchant',
    'Merchant-Tailor': 'Tailor',
    'Merchant-Mystic': 'Senarian',
    'Merchant-Weapon': 'Sevasi',
};

export function fetchNpc(e: { enemyID: string; npcType: string; }): void { 
    try {
        const getNPC = () => {
            let npc: NPC = Object.assign({}, Merchant);
            npc.name = 'Traveling ' + CITY_OPTIONS[e.npcType as keyof typeof CITY_OPTIONS];
            npc.faith = findFaith();
            npc.mastery = findMastery();
            npc.origin = findOrigin();
            npc.sex = findSex();
            const res = asceanCompiler(npc);
            return { game: npc, combat: res, enemyID: e.enemyID };
        };
        const npc = getNPC();
        EventBus.emit('npc-fetched', npc); 
    } catch (err: any) {
        console.log("Error Getting an NPC");
    };
}; 