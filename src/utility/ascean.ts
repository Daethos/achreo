import { Accessor } from "solid-js";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { GameState } from "../stores/game";
import { CombatAttributes, Defense } from "./combat";

export type CharacterSheet = {
    name: string,
    description: string,
    sex: string,
    origin: string,
    constitution: number,
    strength: number,
    agility: number,
    achre: number,
    caeren: number,
    kyosir: number,
    mastery: string,
    faith: string,
    preference: string,
};

export const initCharacter: CharacterSheet = {
    name: 'Kreceus',
    description: 'Apostle of Astra',
    sex: 'Man',
    origin: 'Ashtre',
    constitution: 12,
    strength: 10,
    agility: 12,
    achre: 16,
    caeren: 10,
    kyosir: 13,
    mastery: 'achre',
    faith: 'Adherent',
    preference: 'Leather-Cloth',
};

export type LevelSheet = {
    ascean: Ascean;
    avarice: boolean;
    currentHealth: number;
    currency: { gold: number; silver: number; };
    experience: number;
    experienceNeeded: number;
    faith: string;
    firewater: { current: number; max: number; };
    mastery: string;
    opponent: number;
    opponentExp: number;
    constitution: number;
    strength: number;
    agility: number;
    achre: number;
    caeren: number;
    kyosir: number;
};

export type CombatStats = {
    combatAttributes: CombatAttributes;
    damagePhysical: number;
    damageMagical: number;
    criticalChance: number;
    criticalDamage: number;
    dodgeCombat: number;
    rollCombat: number;
    penetrationPhysical: number;
    penetrationMagical: number;
    defensePhysical: number;
    defenseMagical: number;
    originPhysDef: number;
    originMagDef: number;
};

export type Compiler = {
    ascean: Ascean;
    attributes: CombatAttributes;
    combatWeaponOne: Equipment;
    combatWeaponTwo: Equipment;
    combatWeaponThree: Equipment;
    defense: Defense;
};

const WEIGHTS = {
    MAJOR: 4,
    MINOR: 8,
    MODIFIER: 2,
    ATTRIBUTE_START: 10,
};

// ================================== HELPER FUNCTIONS =================================== \\
const attributeCompiler = (ascean: Ascean, rarities: { helmet: number; chest: number; legs: number; ringOne: number; ringTwo: number; amulet: number; shield: number; trinket: number }): CombatAttributes => {
    let newAttributes: CombatAttributes | any = {};
    let itemRarity = {
        helmCon: ascean.helmet.constitution * rarities.helmet,
        helmStr: ascean.helmet.strength * rarities.helmet,
        helmAgi: ascean.helmet.agility * rarities.helmet,
        helmAch: ascean.helmet.achre * rarities.helmet,
        helmCae: ascean.helmet.caeren * rarities.helmet,
        helmKyo: ascean.helmet.kyosir * rarities.helmet,
        chestCon: ascean.chest.constitution * rarities.chest,
        chestStr: ascean.chest.strength * rarities.chest,
        chestAgi: ascean.chest.agility * rarities.chest,
        chestAch: ascean.chest.achre * rarities.chest,
        chestCae: ascean.chest.caeren * rarities.chest,
        chestKyo: ascean.chest.kyosir * rarities.chest,
        legsCon: ascean.legs.constitution * rarities.legs,
        legsStr: ascean.legs.strength * rarities.legs,
        legsAgi: ascean.legs.agility * rarities.legs,
        legsAch: ascean.legs.achre * rarities.legs,
        legsCae: ascean.legs.caeren * rarities.legs,
        legsKyo: ascean.legs.kyosir * rarities.legs,
        ringOneCon: ascean.ringOne.constitution * rarities.ringOne,
        ringOneStr: ascean.ringOne.strength * rarities.ringOne,
        ringOneAgi: ascean.ringOne.agility * rarities.ringOne,
        ringOneAch: ascean.ringOne.achre * rarities.ringOne,
        ringOneCae: ascean.ringOne.caeren * rarities.ringOne,
        ringOneKyo: ascean.ringOne.kyosir * rarities.ringOne,
        ringTwoCon: ascean.ringTwo.constitution * rarities.ringTwo,
        ringTwoStr: ascean.ringTwo.strength * rarities.ringTwo,
        ringTwoAgi: ascean.ringTwo.agility * rarities.ringTwo,
        ringTwoAch: ascean.ringTwo.achre * rarities.ringTwo,
        ringTwoCae: ascean.ringTwo.caeren * rarities.ringTwo,
        ringTwoKyo: ascean.ringTwo.kyosir * rarities.ringTwo,
        amuletCon: ascean.amulet.constitution * rarities.amulet,
        amuletStr: ascean.amulet.strength * rarities.amulet,
        amuletAgi: ascean.amulet.agility * rarities.amulet,
        amuletAch: ascean.amulet.achre * rarities.amulet,
        amuletCae: ascean.amulet.caeren * rarities.amulet,
        amuletKyo: ascean.amulet.kyosir * rarities.amulet,
        shieldCon: ascean.shield.constitution * rarities.shield,
        shieldStr: ascean.shield.strength * rarities.shield,
        shieldAgi: ascean.shield.agility * rarities.shield,
        shieldAch: ascean.shield.achre * rarities.shield,
        shieldCae: ascean.shield.caeren * rarities.shield,
        shieldKyo: ascean.shield.kyosir * rarities.shield,
        trinketCon: ascean.trinket.constitution * rarities.trinket,
        trinketStr: ascean.trinket.strength * rarities.trinket,
        trinketAgi: ascean.trinket.agility * rarities.trinket,
        trinketAch: ascean.trinket.achre * rarities.trinket,
        trinketCae: ascean.trinket.caeren * rarities.trinket,
        trinketKyo: ascean.trinket.kyosir * rarities.trinket,
    };
        
    newAttributes.rawConstitution =  Math.round((ascean.constitution + (ascean?.origin === "Notheo" || ascean?.origin === 'Nothos' ? 2 : 0)) * (ascean?.mastery === 'Constitution' ? 1.1 : 1));
    newAttributes.rawStrength =  Math.round(((ascean?.strength + (ascean?.origin === 'Sedyreal' || ascean?.origin === 'Ashtre' ? 2 : 0) + (ascean?.origin === "Li'ivi" ? 1 : 0)) + (ascean?.sex === 'Man' ? 2 : 0)) * (ascean?.mastery === 'Strength' ? 1.15 : 1));
    newAttributes.rawAgility =  Math.round(((ascean?.agility + (ascean?.origin === "Quor'eite" || ascean?.origin === 'Ashtre' ? 2 : 0) + (ascean?.origin === "Li'ivi" ? 1 : 0))) * (ascean?.mastery === 'Agility' ? 1.15 : 1));
    newAttributes.rawAchre =  Math.round(((ascean?.achre + (ascean?.origin === 'Notheo' || ascean?.origin === 'Fyers' ? 2 : 0) + (ascean?.origin === "Li'ivi" ? 1 : 0)) + (ascean?.sex === 'Man' ? 2 : 0)) * (ascean?.mastery === 'Achre' ? 1.15 : 1));
    newAttributes.rawCaeren =  Math.round(((ascean?.caeren + (ascean?.origin === 'Nothos' || ascean?.origin === 'Sedyreal' ? 2 : 0) + (ascean?.origin === "Li'ivi" ? 1 : 0)) + (ascean?.sex === 'Woman' ? 2 : 0)) * (ascean?.mastery === 'Caeren' ? 1.15 : 1));
    newAttributes.rawKyosir =  Math.round(((ascean?.kyosir + (ascean?.origin === "Fyers" || ascean?.origin === "Quor'eite" ? 2 : 0) + (ascean?.origin === "Li'ivi" ? 1 : 0)) + (ascean?.sex === 'Woman' ? 2 : 0)) * (ascean.mastery === 'Kyosir' ? 1.15 : 1));

    // // Total CombatAttributes
    newAttributes.totalStrength = newAttributes.rawStrength + itemRarity.shieldStr + itemRarity.helmStr + itemRarity.chestStr + itemRarity.legsStr + itemRarity.ringOneStr + itemRarity.ringTwoStr + itemRarity.amuletStr + itemRarity.trinketStr;
    newAttributes.totalAgility = newAttributes.rawAgility + itemRarity.shieldAgi + itemRarity.helmAgi + itemRarity.chestAgi + itemRarity.legsAgi + itemRarity.ringOneAgi + itemRarity.ringTwoAgi + itemRarity.amuletAgi + itemRarity.trinketAgi;
    newAttributes.totalConstitution = newAttributes.rawConstitution + itemRarity.shieldCon + itemRarity.helmCon + itemRarity.chestCon + itemRarity.legsCon + itemRarity.ringOneCon + itemRarity.ringTwoCon + itemRarity.amuletCon + itemRarity.trinketCon;
    newAttributes.totalAchre = newAttributes.rawAchre + itemRarity.shieldAch + itemRarity.helmAch + itemRarity.chestAch + itemRarity.legsAch + itemRarity.ringOneAch + itemRarity.ringTwoAch + itemRarity.amuletAch + itemRarity.trinketAch;
    newAttributes.totalCaeren = newAttributes.rawCaeren + itemRarity.shieldCae + itemRarity.helmCae + itemRarity.chestCae + itemRarity.legsCae + itemRarity.ringOneCae + itemRarity.ringTwoCae + itemRarity.amuletCae + itemRarity.trinketCae;
    newAttributes.totalKyosir = newAttributes.rawKyosir + itemRarity.shieldKyo + itemRarity.helmKyo + itemRarity.chestKyo + itemRarity.legsKyo + itemRarity.ringOneKyo + itemRarity.ringTwoKyo + itemRarity.amuletKyo + itemRarity.trinketKyo;
    
    newAttributes.totalStrength = Math.round(newAttributes.totalStrength);
    newAttributes.totalAgility = Math.round(newAttributes.totalAgility);
    newAttributes.totalConstitution = Math.round(newAttributes.totalConstitution);
    newAttributes.totalAchre = Math.round(newAttributes.totalAchre);
    newAttributes.totalCaeren = Math.round(newAttributes.totalCaeren);
    newAttributes.totalKyosir = Math.round(newAttributes.totalKyosir);

    // Attribute Modifier
    newAttributes.strengthMod =  Math.floor((newAttributes.totalStrength - WEIGHTS.ATTRIBUTE_START) / WEIGHTS.MODIFIER);
    newAttributes.agilityMod =  Math.floor((newAttributes.totalAgility - WEIGHTS.ATTRIBUTE_START) / WEIGHTS.MODIFIER);
    newAttributes.constitutionMod =  Math.floor((newAttributes.totalConstitution - WEIGHTS.ATTRIBUTE_START) / WEIGHTS.MODIFIER);
    newAttributes.achreMod =  Math.floor((newAttributes.totalAchre - WEIGHTS.ATTRIBUTE_START) / WEIGHTS.MODIFIER);
    newAttributes.caerenMod =  Math.floor((newAttributes.totalCaeren - WEIGHTS.ATTRIBUTE_START) / WEIGHTS.MODIFIER);
    newAttributes.kyosirMod =  Math.floor((newAttributes.totalKyosir - WEIGHTS.ATTRIBUTE_START) / WEIGHTS.MODIFIER);
    
    // Equipment CombatAttributes
    newAttributes.equipStrength = newAttributes.totalStrength - newAttributes.rawStrength;
    newAttributes.equipConstitution = newAttributes.totalConstitution - newAttributes.rawConstitution;
    newAttributes.equipAgility = newAttributes.totalAgility - newAttributes.rawAgility;
    newAttributes.equipAchre = newAttributes.totalAchre - newAttributes.rawAchre;
    newAttributes.equipCaeren = newAttributes.totalCaeren - newAttributes.rawCaeren;
    newAttributes.equipKyosir = newAttributes.totalKyosir - newAttributes.rawKyosir;

    newAttributes.healthTotal = 15 + ((newAttributes.totalConstitution * ascean.level) + ((newAttributes.constitutionMod + Math.round((newAttributes.caerenMod + newAttributes.strengthMod) / 4)) * ascean.level));
    newAttributes.initiative = 10 + ((newAttributes.agilityMod + newAttributes.achreMod) / 2);
    newAttributes.stamina = 100 + (newAttributes.constitutionMod + newAttributes.agilityMod + newAttributes.caerenMod) / 2;
    newAttributes.grace = 100 + (newAttributes.strengthMod + newAttributes.achreMod + newAttributes.kyosirMod) / 2; // Future Idea Maybe

    return newAttributes;
};
  
function originCompiler(weapon: any, ascean: Ascean): Equipment {
    switch (ascean.origin) {
        case "Ashtre":
            weapon.criticalChance += 3;
            weapon.physicalDamage *= 1.03;
            weapon.criticalDamage *= 1.03;
            break;
        case "Fyers":
            weapon.magicalPenetration += 3;
            weapon.physicalPenetration += 3;
            weapon.roll += 3;
            break;
        case "Li'ivi":
            weapon.magicalPenetration += 1;
            weapon.physicalPenetration += 1;
            weapon.magicalDamage *= 1.01;
            weapon.physicalDamage *= 1.01;
            weapon.criticalChance += 1;
            weapon.criticalDamage *= 1.01;
            weapon.dodge -= 1;
            weapon.roll += 1;
            break;
        case "Notheo":
            weapon.physicalDamage *= 1.03;
            weapon.physicalPenetration += 3;
            break;
        case "Nothos":
            weapon.magicalPenetration += 3;
            weapon.magicalDamage *= 1.03;
            break;
        case "Quor'eite":
            weapon.dodge -= 3;
            weapon.roll += 3;
            weapon.criticalChance += 3;
            break;
        case "Sedyreal":
            weapon.criticalDamage *= 1.03;
            break;
    };
    return weapon;
};

function gripCompiler(weapon: Equipment, attributes: CombatAttributes, ascean: Ascean): Equipment {
    let physicalMultiplier: number = 1;
    let magicalMultiplier: number = 1;

    if (weapon.attackType === 'Physical') {
        physicalMultiplier = 1.05;
        magicalMultiplier = 0.95;
    };

    if (weapon.attackType === 'Magic') {
        physicalMultiplier = 0.95;
        magicalMultiplier = 1.05;
    };

    if (weapon.grip === 'One Hand' || weapon.type === 'Bow') {
        weapon.physicalDamage += 
            ((weapon.agility / WEIGHTS.MODIFIER + attributes.agilityMod) 
            + (weapon.strength / WEIGHTS.MINOR + attributes.strengthMod / WEIGHTS.MAJOR)) 
            * physicalMultiplier;
        weapon.magicalDamage += 
            ((weapon.achre / WEIGHTS.MODIFIER + attributes.achreMod) 
            + (weapon.caeren / WEIGHTS.MINOR + attributes.caerenMod / WEIGHTS.MAJOR)) 
            * magicalMultiplier;

        weapon.physicalDamage *= 1 
            + ((weapon.agility / WEIGHTS.MODIFIER + attributes.agilityMod) 
            + (weapon.strength / WEIGHTS.MINOR + attributes.strengthMod / WEIGHTS.MAJOR)) 
            / (100 + (20 / ascean.level));
        weapon.magicalDamage *= 1 
            + ((weapon.achre / WEIGHTS.MODIFIER + attributes.achreMod) 
            + (weapon.caeren / WEIGHTS.MINOR + attributes.caerenMod / WEIGHTS.MAJOR)) 
            / (100 + (20 / ascean.level));
    };
    if (weapon.grip === 'Two Hand' && weapon.type !== 'Bow') {
        weapon.physicalDamage += 
            ((weapon.strength / WEIGHTS.MODIFIER + attributes.strengthMod) 
            + (weapon.agility / WEIGHTS.MINOR + attributes.agilityMod / WEIGHTS.MAJOR)) 
            * physicalMultiplier;
        weapon.magicalDamage += 
            ((weapon.caeren / WEIGHTS.MODIFIER + attributes.caerenMod) 
            + (weapon.achre / WEIGHTS.MINOR + attributes.achreMod / WEIGHTS.MAJOR)) 
            * magicalMultiplier;

        weapon.physicalDamage *= 1 
            + ((weapon.strength / WEIGHTS.MODIFIER + attributes.strengthMod) 
            + (weapon.agility / WEIGHTS.MINOR + attributes.agilityMod / WEIGHTS.MAJOR)) 
            / (100 + (20 / ascean.level));
        weapon.magicalDamage *= 1 
            + ((weapon.caeren / WEIGHTS.MODIFIER + attributes.caerenMod) 
            + (weapon.achre / WEIGHTS.MINOR + attributes.achreMod / WEIGHTS.MAJOR)) 
            / (100 + (20 / ascean.level));    
    };
    return weapon;
};

function penetrationCompiler(weapon: any, attributes: CombatAttributes, combatStats: { penetrationMagical: number; penetrationPhysical: number; }): Equipment {
    weapon.magicalPenetration += Math.round(combatStats.penetrationMagical + attributes.kyosirMod + (weapon.kyosir / WEIGHTS.MAJOR));
    weapon.physicalPenetration += Math.round(combatStats.penetrationPhysical + attributes.kyosirMod + (weapon.kyosir / WEIGHTS.MAJOR));
    return weapon;
};

function critCompiler(weapon: Equipment, attributes: CombatAttributes, combatStats: { criticalChance: number; criticalDamage: number }): Equipment { 
    if (weapon.attackType === 'Physical') {
        weapon.criticalChance += 
            combatStats.criticalChance 
            + (attributes.agilityMod / WEIGHTS.MODIFIER) 
            + (weapon.agility / WEIGHTS.MAJOR);
        weapon.criticalDamage += 
            (combatStats.criticalDamage / WEIGHTS.ATTRIBUTE_START) 
            + (attributes.constitutionMod + attributes.strengthMod + (weapon.strength / WEIGHTS.MAJOR)) 
            / 50;
    } else {
        weapon.criticalChance += 
            combatStats.criticalChance 
            + (attributes.achreMod / WEIGHTS.MODIFIER) 
            + (weapon.achre / WEIGHTS.MAJOR);
        weapon.criticalDamage += 
            (combatStats.criticalDamage / WEIGHTS.ATTRIBUTE_START) 
            + (attributes.constitutionMod + attributes.caerenMod + (weapon.caeren / WEIGHTS.MAJOR)) 
            / 50;
    };
    // weapon.criticalChance += combatStats.criticalChance + ((attributes.agilityMod + attributes.achreMod + ((weapon.agility + weapon.achre) / 2)) / 3);
    // weapon.criticalDamage += (combatStats.criticalDamage / 10) + ((attributes.constitutionMod + attributes.strengthMod + attributes.caerenMod + ((weapon.strength + weapon.caeren) / 2)) / 50);
    weapon.criticalChance = Math.round(weapon.criticalChance * 100) / 100;
    weapon.criticalDamage = Math.round(weapon.criticalDamage * 100) / 100;
    return weapon;
};

function faithCompiler(weapon: Equipment, ascean: Ascean): Equipment { 
    if (ascean.faith === 'adherent') {
        if (weapon.damageType?.[0] === 'Earth' || weapon.damageType?.[0] === 'Wild' || weapon.damageType?.[0] === 'Fire' || weapon.damageType?.[0] === 'Frost' || weapon.damageType?.[0] === 'Lightning' || weapon.damageType?.[0] === 'Wind' || weapon.damageType?.[0] === 'Sorcery') {
            weapon.magicalDamage *= 1.075;
            weapon.criticalChance += 3;
        };
        if (weapon.type === 'Bow' || weapon.type === 'Greataxe' || weapon.type === 'Greatmace' || weapon.type === 'Greatbow') {
            weapon.physicalDamage *= 1.075;
        };
        if (weapon.type === 'Greatsword' || weapon.type === 'Polearm') {
            weapon.physicalDamage *= 1.05;
            weapon.magicalDamage *= 1.05;
        };
        if (weapon.type === 'Axe' || weapon.type === 'Mace' || weapon.type === 'Curved Sword' || weapon.type === 'Dagger' || weapon.type === 'Long Sword') {
            weapon.physicalDamage *= 1.05;
            weapon.criticalChance += 3;
        };
        if (weapon.grip === 'Two Hand') {
            weapon.physicalDamage *= 1.05;
            weapon.magicalDamage *= 1.05;
            weapon.criticalChance += 3
        };
        weapon.criticalChance *= 1.075;
        weapon.roll += 3;
    }
    if (ascean.faith === 'devoted') {
        if (weapon.damageType?.[0] === 'Wild' || weapon.damageType?.[0] === 'Righteous' || weapon.damageType?.[0] === 'Spooky' || weapon.damageType?.[0] === 'Sorcery') {
            weapon.physicalDamage *= 1.075;
            weapon.magicalDamage *= 1.075;
            weapon.criticalDamage *= 1.025;
        };
        if (weapon.type === 'Short Sword' || weapon.type === 'Long Sword' || weapon.type === 'Curved Sword' || weapon.type === 'Dagger' || weapon.type === 'Scythe' || weapon.type === 'Polearm') {
            weapon.physicalDamage *= 1.05;
            weapon.magicalDamage *= 1.05;
            weapon.criticalDamage *= 1.05;
        };
        if (weapon.grip === 'One Hand' || weapon.type === 'Bow' || weapon.type === 'Greatbow') {
            weapon.physicalDamage *= 1.05;
            weapon.magicalDamage *= 1.05;
            weapon.criticalDamage *= 1.05;
        };
        weapon.criticalDamage *= 1.075;
        weapon.dodge -= 3;
    };
    weapon.criticalChance = Math.round(weapon.criticalChance * 100) / 100;
    weapon.criticalDamage = Math.round(weapon.criticalDamage * 100) / 100;
    return weapon;
};

// =============================== COMPILER FUNCTIONS ================================== \\

const weaponCompiler = (weapon: any, ascean: Ascean, attributes: CombatAttributes, combatStats: CombatStats, rarity: number): Equipment => { 
    const newWeapon = {
        name: weapon.name,
        type: weapon.type,
        rarity: weapon.rarity,
        grip: weapon.grip,
        attackType: weapon.attackType,
        damageType: weapon.damageType,
        physicalDamage: (weapon.physicalDamage * rarity),
        magicalDamage: (weapon.magicalDamage * rarity),
        physicalPenetration: (weapon.physicalPenetration * rarity),
        magicalPenetration: (weapon.magicalPenetration * rarity),
        criticalChance: (weapon.criticalChance * rarity),
        criticalDamage: (weapon.criticalDamage),
        dodge: (weapon.dodge),
        roll: (weapon.roll * rarity),
        constitution: (weapon.constitution * rarity),
        strength: (weapon.strength * rarity),
        agility: (weapon.agility * rarity),
        achre: (weapon.achre * rarity),
        caeren: (weapon.caeren * rarity),
        kyosir: (weapon.kyosir * rarity),
        influences: weapon.influences,
        imgUrl: weapon.imgUrl,
        _id: weapon._id,
    };
    originCompiler(newWeapon, ascean);
    gripCompiler(newWeapon, attributes, ascean);
    penetrationCompiler(newWeapon, attributes, combatStats);
    critCompiler(newWeapon, attributes, combatStats);
    faithCompiler(newWeapon, ascean);
    newWeapon.dodge += (60 + (combatStats.dodgeCombat));
    newWeapon.roll += combatStats.rollCombat;
    newWeapon.physicalDamage = Math.round(newWeapon.physicalDamage * combatStats.damagePhysical);
    newWeapon.magicalDamage = Math.round(newWeapon.magicalDamage * combatStats.damageMagical);
    return newWeapon;
};

const defenseCompiler = (ascean: any, attributes: CombatAttributes, combatStats: CombatStats, rarities: any): Defense => { 
    const defense = {
        physicalDefenseModifier: 
            Math.round((ascean.helmet.physicalResistance * rarities.helmet) + (ascean.chest.physicalResistance * rarities.chest) + (ascean.legs.physicalResistance * rarities.legs) + 
            (ascean.ringOne.physicalResistance * rarities.ringOne) + (ascean.ringTwo.physicalResistance * rarities.ringTwo) + (ascean.amulet.physicalResistance * rarities.amulet) + (ascean.trinket.physicalResistance * rarities.trinket) 
            + Math.round(((attributes.constitutionMod + attributes.strengthMod + attributes.kyosirMod) / 12)) + combatStats.originPhysDef), // Need to create these in the backend as well
        
        magicalDefenseModifier: 
            Math.round((ascean.helmet.magicalResistance * rarities.helmet) + (ascean.chest.magicalResistance * rarities.chest) + (ascean.legs.magicalResistance * rarities.legs) + 
           (ascean.ringOne.magicalResistance * rarities.ringOne) + (ascean.ringTwo.magicalResistance * rarities.ringTwo) + (ascean.amulet.magicalResistance * rarities.amulet) + (ascean.trinket.magicalResistance * rarities.trinket) 
            + Math.round(((attributes.constitutionMod + attributes.caerenMod + attributes.kyosirMod) / 12)) + combatStats.originMagDef),

        physicalPosture: combatStats.defensePhysical + Math.round(ascean.shield.physicalResistance * rarities.shield),
        magicalPosture: combatStats.defenseMagical + Math.round(ascean.shield.magicalResistance * rarities.shield),
    };
    return defense;
};

const coefficientCompiler = (ascean: Ascean, item: Equipment): number => {
    let coefficient = 0;
    // console.log(item, 'Item')
    switch (item.rarity) {
        case 'Common':
            coefficient = ascean.level / 4;
            break;
        case 'Uncommon':
            coefficient = ascean.level / 8;
            break;
        case 'Rare':
            coefficient = 1;
            // coefficient = ascean.level / 12;
            break;
        case 'Epic':
            coefficient = 1;
            // coefficient = ascean.level / 16;
            break;
        case 'Legendary':
            coefficient = 1;
            break;
    };
    if (coefficient > 1) {
        if (coefficient > 3) {
            coefficient = 2;
        } else if (coefficient > 2) {
            coefficient = 1.5;
        } else {
            coefficient = 1;
        };
    };
    return coefficient;
};

function rarityCompiler(ascean: Ascean) {
    let rarities: {} | any = {};
    try {
        const helmetCoefficient = coefficientCompiler(ascean, ascean.helmet);
        const chestCoefficient = coefficientCompiler(ascean, ascean.chest);
        const legsCoefficient = coefficientCompiler(ascean, ascean.legs);
        const ringOneCoefficient = coefficientCompiler(ascean, ascean.ringOne);
        const ringTwoCoefficient = coefficientCompiler(ascean, ascean.ringTwo);
        const amuletCoefficient = coefficientCompiler(ascean, ascean.amulet);
        const trinketCoefficient = coefficientCompiler(ascean, ascean.trinket);
        const shieldCoefficient = coefficientCompiler(ascean, ascean.shield);
        const weaponOneCoefficient = coefficientCompiler(ascean, ascean.weaponOne);
        const weaponTwoCoefficient = coefficientCompiler(ascean, ascean.weaponTwo);
        const weaponThreeCoefficient = coefficientCompiler(ascean, ascean.weaponThree);
        rarities = {
            helmet: helmetCoefficient,
            chest: chestCoefficient,
            legs: legsCoefficient,
            ringOne: ringOneCoefficient,
            ringTwo: ringTwoCoefficient,
            amulet: amuletCoefficient,
            trinket: trinketCoefficient,
            shield: shieldCoefficient,
            weaponOne: weaponOneCoefficient,
            weaponTwo: weaponTwoCoefficient,
            weaponThree: weaponThreeCoefficient,
        };
        return rarities;
    } catch (err) {
        console.log(err, 'Rarity Compiler Error');
    };
};

// ================================== CONTROLLER - SERVICE ================================= \\

function setHealth(ascean: Ascean, max: number, current?: number): Ascean {
    if (current !== undefined) {
        ascean.health = {current, max};
    } else {
        ascean.health = {current:max, max};
    };
    return ascean;
}

const asceanCompiler = (ascean: any): Compiler | undefined => {
    try {
        const rarities = rarityCompiler(ascean);
        const attributes = attributeCompiler(ascean, rarities);
        const physicalDamageModifier = ascean.helmet.physicalDamage * ascean.chest.physicalDamage * ascean.legs.physicalDamage * ascean.ringOne.physicalDamage * ascean.ringTwo.physicalDamage * ascean.amulet.physicalDamage * ascean.trinket.physicalDamage;
        const magicalDamageModifier = ascean.helmet.magicalDamage * ascean.chest.magicalDamage * ascean.legs.magicalDamage * ascean.ringOne.magicalDamage * ascean.ringTwo.magicalDamage * ascean.amulet.magicalDamage * ascean.trinket.magicalDamage;
        const critChanceModifier = (ascean.helmet.criticalChance * rarities.helmet) + (ascean.chest.criticalChance * rarities.chest) + (ascean.legs.criticalChance * rarities.legs) + 
            (ascean.ringOne.criticalChance * rarities.ringOne) + (ascean.ringTwo.criticalChance * rarities.ringTwo) + (ascean.amulet.criticalChance * rarities.amulet) + (ascean.trinket.criticalChance * rarities.trinket);
        const critDamageModifier = (ascean.helmet.criticalDamage * rarities.helmet) * (ascean.chest.criticalDamage * rarities.chest) * (ascean.legs.criticalDamage * rarities.legs) * 
            (ascean.ringOne.criticalDamage * rarities.ringOne) * (ascean.ringTwo.criticalDamage * rarities.ringTwo) * (ascean.amulet.criticalDamage * rarities.amulet) * (ascean.trinket.criticalDamage * rarities.trinket);
        const dodgeModifier = Math.round((ascean.shield.dodge * rarities.shield) + (ascean.helmet.dodge * rarities.helmet) + (ascean.chest.dodge * rarities.chest) + (ascean.legs.dodge * rarities.legs) + 
            (ascean.ringOne.dodge * rarities.ringOne) + (ascean.ringTwo.dodge * rarities.ringTwo) + (ascean.amulet.dodge * rarities.amulet) + (ascean.trinket.dodge * rarities.trinket) - Math.round(((attributes.agilityMod + attributes.achreMod) / 4))); // Was 3
        const rollModifier = Math.round((ascean.shield.roll * rarities.shield) + (ascean.helmet.roll * rarities.helmet) + (ascean.chest.roll * rarities.chest) + (ascean.legs.roll * rarities.legs) + 
            (ascean.ringOne.roll * rarities.ringOne) + (ascean.ringTwo.roll * rarities.ringTwo) + (ascean.amulet.roll * rarities.amulet) + (ascean.trinket.roll * rarities.trinket) + 
            Math.round(((attributes.agilityMod + attributes.achreMod) / 4))); // Was 3
        const originPhysPenMod = (ascean.origin === 'Fyers' || ascean.origin === 'Notheo' ? 3 : 0)
        const originMagPenMod = (ascean.origin === 'Fyers' || ascean.origin === 'Nothos' ? 3 : 0)
        const physicalPenetration = (ascean.ringOne.physicalPenetration * rarities.ringOne) + (ascean.ringTwo.physicalPenetration * rarities.ringTwo) + (ascean.amulet.physicalPenetration * rarities.amulet) + (ascean.trinket.physicalPenetration * rarities.trinket) + originPhysPenMod;
        const magicalPenetration = (ascean.ringOne.magicalPenetration * rarities.ringOne) + (ascean.ringTwo.magicalPenetration * rarities.ringTwo) + (ascean.amulet.magicalPenetration * rarities.amulet) + (ascean.trinket.magicalPenetration * rarities.trinket) + originMagPenMod;
        const originPhysDefMod = (ascean.origin === 'Sedyreal' || ascean.origin === 'Nothos' ? 3 : 0);
        const originMagDefMod = (ascean.origin === 'Sedyreal' || ascean.origin === 'Notheo' ? 3 : 0);
        const physicalDefenseModifier = Math.round((ascean.helmet.physicalResistance * rarities.helmet) + (ascean.chest.physicalResistance * rarities.chest) + (ascean.legs.physicalResistance * rarities.legs) + 
            (ascean.ringOne.physicalResistance * rarities.ringOne) + (ascean.ringTwo.physicalResistance * rarities.ringTwo) + (ascean.amulet.physicalResistance * rarities.amulet) + (ascean.trinket.physicalResistance * rarities.trinket) + 
            Math.round(((attributes.constitutionMod + attributes.strengthMod + attributes.kyosirMod) / 8)) + originPhysDefMod);
        const magicalDefenseModifier = Math.round((ascean.helmet.magicalResistance * rarities.helmet) + (ascean.chest.magicalResistance * rarities.chest) + (ascean.legs.magicalResistance * rarities.legs) + 
            (ascean.ringOne.magicalResistance * rarities.ringOne) + (ascean.ringTwo.magicalResistance * rarities.ringTwo) + (ascean.amulet.magicalResistance * rarities.amulet) + (ascean.trinket.magicalResistance * rarities.trinket) + 
            Math.round(((attributes.constitutionMod + attributes.caerenMod + attributes.kyosirMod) / 8)) + originMagDefMod);
    
        const combatStats = {
            combatAttributes: attributes,
            damagePhysical: physicalDamageModifier,
            damageMagical: magicalDamageModifier,
            criticalChance: critChanceModifier,
            criticalDamage: critDamageModifier,
            dodgeCombat: dodgeModifier,
            rollCombat: rollModifier,
            penetrationPhysical: physicalPenetration,
            penetrationMagical: magicalPenetration,
            defensePhysical: physicalDefenseModifier,
            defenseMagical: magicalDefenseModifier,
            originPhysDef: originPhysDefMod,
            originMagDef: originMagDefMod
        };

        if (ascean.health.max === 0) {
            ascean = setHealth(ascean, attributes.healthTotal);
        } else {
            ascean = setHealth(ascean, attributes.healthTotal, ascean.health.current);
        };
        if (Number.isNaN(ascean.experience)) {
            ascean.experience = ascean.level * 1000;
        };

        const combatWeaponOne = weaponCompiler(ascean.weaponOne, ascean, attributes, combatStats, rarities.weaponOne);
        const combatWeaponTwo = weaponCompiler(ascean.weaponTwo, ascean, attributes, combatStats, rarities.weaponTwo);
        const combatWeaponThree = weaponCompiler(ascean.weaponThree, ascean, attributes, combatStats, rarities.weaponThree);
        const defense = defenseCompiler(ascean, attributes, combatStats, rarities);
        return { ascean, attributes, combatWeaponOne, combatWeaponTwo, combatWeaponThree, defense } as Compiler;
    } catch (err) {
        console.log(err, 'Ascean Compiler Error');
    };
};

function playerTraits(game: Accessor<GameState>, setPlayerTraitWrapper: any) {
    const fetchTrait = (trait:  string): { name: string; traitOneName: string; traitOneDescription: string; traitTwoName: string; traitTwoDescription: string; } => {
        switch (trait) {
            case "Arbituous":
                return {
                    name: "Arbituous",
                    traitOneName: "Luckout",
                    traitOneDescription: "Convince the enemy through rhetoric to cease hostility.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "Use knowledge of Ley Law to deter enemies from aggression."
                };
            case "Astral":
                return {
                    name: "Astral",
                    traitOneName: "Impermanence",
                    traitOneDescription: "Perform combat maneuvers that are impossible to follow, and thus impossible to counter.",
                    traitTwoName: "Pursuit",
                    traitTwoDescription: "Force encounters, even with enemies that would normally avoid you."
                };
            case "Cambiren":
                return {
                    name: "Cambiren",
                    traitOneName: "Caerenicism",
                    traitOneDescription: "Your caer explodes and engulfs you.",
                    traitTwoName: "Caerenisis",
                    traitTwoDescription: "You can disarm and evoke your enemy's caer into a battle of its own."
                };
            case "Chiomic":
                return {
                    name: "Chiomic",
                    traitOneName: "Luckout",
                    traitOneDescription: "Invoke the Ancient Chiomyr, reducing the enemy to a broken mind of mockery.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "Cause bouts of confusion and disorientation in the enemy."
                };
            case "Fyeran":
                return {
                    name: "Fyeran",
                    traitOneName: "Persuasion",
                    traitOneDescription: "You can convince those who see this world with peculiarity.",
                    traitTwoName: "Seer",
                    traitTwoDescription: "Your next attack is Fyers."
                };
            case "Kyn'gian":
                return {
                    name: "Kyn'gian",
                    traitOneName: "Avoidance",
                    traitOneDescription: "You can avoid most encounters.",
                    traitTwoName: "Endurance",
                    traitTwoDescription: "You are able to recover your health over time."
                };
            case "Kyr'naic":
                return {
                    name: "Kyr'naic",
                    traitOneName: "Luckout",
                    traitOneDescription: "Convince the enemy to acquiesce, giving their life to the Aenservaesai.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "Cause the enemy to embrace the hush and tendril."
                };
            case "Ilian":
                return {
                    name: "Ilian",
                    traitOneName: "Heroism",
                    traitOneDescription: "You exude a nature that touches others inexplicably.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "The weight of your words can sway the minds of others."
                };
            case "Lilosian":
                return {
                    name: "Lilosian",
                    traitOneName: "Luckout",
                    traitOneDescription: "Convince the enemy to profess their follies and willow.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "Speak to your enemy's faith and stay their hand."
                };
            case "Ma'anreic":
                return {
                    name: "Ma'anreic",
                    traitOneName: "Stealth",
                    traitOneDescription: "You can use your caeren to shimmer and stealth.",
                    traitTwoName: "Thievery",
                    traitTwoDescription: "You can steal items from anyone and anywhere."
                };
            case "Sedyrist":
                return {
                    name: "Sedyrist",
                    traitOneName: "Investigative",
                    traitOneDescription: "You have a knack for piecing together peculiarities.",
                    traitTwoName: "Tinkerer",
                    traitTwoDescription: "You can deconstruct and reconstruct armor and weapons."
                };
            case "Se'van":
                return {
                    name: "Se'van",
                    traitOneName: "Berserk",
                    traitOneDescription: "Your attacks grow stronger for each successive form of damage received.",
                    traitTwoName: "Grapple",
                    traitTwoDescription: "Grip your enemy in a vice of your own design."
                };
            case "Shaorahi":
                return {
                    name: "Shaorahi",
                    traitOneName: "Conviction",
                    traitOneDescription: "Your attacks grow stronger the more you realize them.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "You can put the enemy in awe of your power, and have them cease their assault."
                };
            case "Shrygeian":
                return {
                    name: "Shrygeian",
                    traitOneName: "Knavery",
                    traitOneDescription: "Your explorations are amusing.",
                    traitTwoName: "Mini-Game",
                    traitTwoDescription: "You can duel the enemy."
                };
            case "Tshaeral":
                return {
                    name: "Tshaeral",
                    traitOneName: "Tshaering",
                    traitOneDescription: "Your caer is imbued with tshaeral desire, a hunger to devour the world.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "Your nature has a way of wilting the caer of your enemies."
                };
            default: 
                return {
                    name: "Arbituous",
                    traitOneName: "Luckout",
                    traitOneDescription: "Convince the enemy through rhetoric to cease hostility.",
                    traitTwoName: "Persuasion",
                    traitTwoDescription: "Use knowledge of Ley Law to deter enemies from aggression."
                };
        };
    };
    setPlayerTraitWrapper({
        'primary': fetchTrait(game().traits.primary.name),
        'secondary': fetchTrait(game().traits.secondary.name),
        'tertiary': fetchTrait(game().traits.tertiary.name)
    });
};

export { asceanCompiler, playerTraits };