import { Shields, Helmets, Legs, Chests } from "../assets/db/equipment";
import { Weapons } from "../assets/db/weaponry";
import Equipment, { deepClone, mutate } from "./equipment";
import { Amulets, Rings, Trinkets } from "../assets/db/jewelry";
import { Skills, initCharacter, initSkills } from "../utility/ascean"; 
import { v4 as uuidv4 } from "uuid";
import { addAscean } from "../assets/db/db";
import Quest from "./quests";

export type Entry = {
    title: string,
    body: any,
    footnote: string,
    date: Date | number,
    location: string,
    keywords: string[],
};

export default class Ascean {
    _id: string = uuidv4();
    origin: string = "Ashtre";
    sex: string = "Man";
    mastery: string = "achre";
    level: number = 1;
    experience: number = 0;
    faith: string = "Adherent";
    currency: { silver: number; gold: number; } = { silver: 0, gold: 0 };
    firewater: { current: number; max: number; } = { current: 5, max: 5 };
    health: { current: number; max: number; } = { current: 0, max: 0 };
    name: string = "Kreceus";
    description: string = "Apostle of Astra";
    constitution: number = 12;
    strength: number = 10;
    agility: number = 12;
    achre: number = 16;
    caeren: number = 10;
    kyosir: number = 13;
    imgUrl: string = "../assets/images/Asthre-Man.jpg";
    helmet: Equipment;
    chest: Equipment;
    legs: Equipment;
    weaponOne: Equipment;
    weaponTwo: Equipment;
    weaponThree: Equipment;
    shield: Equipment;
    amulet: Equipment;
    ringOne: Equipment;
    ringTwo: Equipment;
    trinket: Equipment;
    journal: {
        entries: Entry[],
        currentEntry: number,
        lastEntry: number,
    };
    quests: Quest[];
    interactions: {
        deity: number,
    };
    capable: number;
    skills: Skills;

    constructor(ascean: Ascean) {
        this._id = ascean._id;
        this.experience = ascean.experience;
        this.faith = ascean.faith;
        this.level = ascean.level;
        this.mastery = ascean.mastery;
        this.sex = ascean.sex;
        this.origin = ascean.origin;
        this.currency = { silver: ascean?.currency.silver, gold: 0 };
        this.firewater = { current: ascean?.firewater?.current || 5, max: ascean?.firewater?.max || 5 };
        this.health = { current: ascean?.health?.current || 0, max: ascean?.health?.max || 0 };
        this.level = ascean.level || 1;
        this.name = ascean.name;
        this.description = ascean.description;
        this.constitution = ascean.constitution;
        this.strength = ascean.strength;
        this.agility = ascean.agility;
        this.achre = ascean.achre;
        this.caeren = ascean.caeren;
        this.kyosir = ascean.kyosir;
        this.imgUrl = ascean.imgUrl;
        this.helmet = ascean.helmet;
        this.chest = ascean.chest;
        this.legs = ascean.legs;
        this.weaponOne = ascean.weaponOne;
        this.weaponTwo = ascean.weaponTwo;
        this.weaponThree = ascean.weaponThree;
        this.shield = ascean.shield;
        this.amulet = ascean.amulet;
        this.ringOne = ascean.ringOne;
        this.ringTwo = ascean.ringTwo;
        this.trinket = ascean.trinket;
        this.journal = {
            entries: [],
            currentEntry: 0,
            lastEntry: 0,
        };    
        this.quests = [];
        this.interactions = {
            deity: 0,
        };
        this.capable = 0;
        this.skills = initSkills;
    };
    [key: string]: any;
};

async function createAscean(data: any, template?: boolean): Promise<Ascean> {
    const pref = data.preference;
    const faith = data.faith;
    switch (pref) {
        case "Plate-Mail":
            data.helmet = deepClone(Helmets.find(item => item.name === "Plate Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Plate Cuirass (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Plate Greaves (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Pavise" && item.rarity === "Common"));
            break;
        case "Chain-Mail":
            data.helmet = deepClone(Helmets.find(item => item.name === "Chain Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Chain Armor (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Chain Greaves (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Scutum" && item.rarity === "Common"));
            break;
        case "Leather-Mail":
            data.helmet = deepClone(Helmets.find(item => item.name === "Leather Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Leather Brigandine (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Leather Sandals (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Heater" && item.rarity === "Common"));
            break;
        case "Leather-Cloth":
            data.helmet = deepClone(Helmets.find(item => item.name === "Cloth Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Cloth Robes (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Cloth Skirt (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Parma" && item.rarity === "Common"));
            break;
        default:
            break;
    };
    const strength = parseInt(data.strength);
    const agility = parseInt(data.agility);
    const achre = parseInt(data.achre);
    const caeren = parseInt(data.caeren);
    const physical = strength + agility;
    const magical = achre + caeren;
    if (faith === "Adherent") {
        if (physical > magical) {
            if (strength > agility) {
                data.weaponOne = "War Hammer";
                data.weaponTwo = "Sunshatter";
            } else if (strength < agility) {
                data.weaponOne = "Longsword";
                data.weaponTwo = "Sevashyr";
            } else {
                data.weaponOne = "Claymore";
                data.weaponTwo = "Longbow";
            };
        } else {
            if (achre > caeren) {
                data.weaponOne = "Astral Spear";
                data.weaponTwo = "Quor'eite Crush";
            } else if (achre < caeren) {
                data.weaponOne = "Ashfyre";
                data.weaponTwo = "Nyrolean Wave";
            } else {
                data.weaponOne = "Wildstrike";
                data.weaponTwo = "Nightmare";
            };
        };
    } else {
        if (physical > magical) {
            if (strength > agility) {
                data.weaponOne = "Daethic Halberd";
                data.weaponTwo = "Hush of Daethos";
            } else if (strength < agility) {
                data.weaponOne = "Gladius";
                data.weaponTwo = "Daethic Bow";
            } else {
                data.weaponOne = "Daethic Halberd";
                data.weaponTwo = "Daethic Bow";
            };
        } else {
            if (achre > caeren) {
                data.weaponOne = "Tendril";
                data.weaponTwo = "Daethic Bow";
            } else if (achre < caeren) {
                data.weaponOne = "Hush of Daethos";
                data.weaponTwo = "Tendril of Daethos";
            } else {
                data.weaponOne = "Blessed Dagger";
                data.weaponTwo = "Cursed Dagger";
            };
        };
    };
    const weaponOne = deepClone(Weapons.find(item => (item.name === data.weaponOne && item.rarity === "Common")));
    const weaponTwo = deepClone(Weapons.find(item => (item.name === data.weaponTwo && item.rarity === "Common")));
    const helmet = data.helmet;
    const chest = data.chest;
    const legs = data.legs;
    const shield = data.shield;
    const weaponThree = deepClone(Weapons.find(item => item.rarity === "Default"));
    const ringOne = deepClone(Rings.find(ring => ring.name === "Empty Ring Slot"));
    const ringTwo = deepClone(Rings.find(ring => ring.name === "Empty Ring Slot Two"));
    const amulet = deepClone(Amulets.find(amulet => amulet.rarity === "Default"));
    const trinket = deepClone(Trinkets.find(trinket => trinket.rarity === "Default"));
    if (!template) {
        await mutate([weaponOne, weaponTwo, shield, weaponThree, helmet, chest, legs, ringOne, ringTwo, amulet, trinket] as any[], "Common");
    };
    
    if (template) {
        const ascean = new Ascean({
            ...data,
            _id: uuidv4(),
            weaponOne: weaponOne,
            weaponTwo: weaponTwo,
            weaponThree: weaponThree,
            shield: shield,
            helmet: helmet,
            chest: chest,
            legs: legs,
            ringOne: ringOne,
            ringTwo: ringTwo,
            amulet: amulet,
            trinket: trinket,
            currency: {
                silver: Math.round(Math.random() * data.kyosir * 5.5),
                gold: data.kyosir === 18 ? 1 : 0
            },
            experience: 0,
            imgUrl: `../assets/images/${data.origin}-${data.sex}.jpg`
        });
        return ascean;
    } else {
        const ascean = new Ascean({
            ...data,
            _id: uuidv4(),
            weaponOne: weaponOne?._id,
            weaponTwo: weaponTwo?._id,
            weaponThree: weaponThree?._id,
            shield: shield?._id,
            helmet: helmet?._id,
            chest: chest?._id,
            legs: legs?._id,
            ringOne: ringOne?._id,
            ringTwo: ringTwo?._id,
            amulet: amulet?._id,
            trinket: trinket?._id,
            currency: {
                silver: Math.round(Math.random() * data.kyosir * 5.5),
                gold: data.kyosir === 18 ? 1 : 0
            },
            experience: 0,
            imgUrl: `../assets/images/${data.origin}-${data.sex}.jpg`
        });
        // const res = 
        await addAscean(ascean);
        return ascean;
    };
};

function createTemplate(data: any): Ascean {
    const pref = data.preference;
    const faith = data.faith;
    switch (pref) {
        case "Plate-Mail":
            data.helmet = deepClone(Helmets.find(item => item.name === "Plate Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Plate Cuirass (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Plate Greaves (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Pavise" && item.rarity === "Common"));
            break;
        case "Chain-Mail":
            data.helmet = deepClone(Helmets.find(item => item.name === "Chain Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Chain Armor (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Chain Greaves (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Scutum" && item.rarity === "Common"));
            break;
        case "Leather-Mail":
            data.helmet = deepClone(Helmets.find(item => item.name === "Leather Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Leather Brigandine (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Leather Sandals (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Heater" && item.rarity === "Common"));
            break;
        case "Leather-Cloth":
            data.helmet = deepClone(Helmets.find(item => item.name === "Cloth Helm (Starter)"));
            data.chest = deepClone(Chests.find(item => item.name === "Cloth Robes (Starter)"));
            data.legs = deepClone(Legs.find(item => item.name === "Cloth Skirt (Starter)"));
            data.shield = deepClone(Shields.find(item => item.name === "Parma" && item.rarity === "Common"));
            break;
        default:
            break;
    };

    const strength = parseInt(data.strength);
    const agility = parseInt(data.agility);
    const achre = parseInt(data.achre);
    const caeren = parseInt(data.caeren);
    const physical = strength + agility;
    const magical = achre + caeren;

    if (faith === "Adherent") {
        if (physical > magical) {
            if (strength > agility) {
                data.weaponOne = "War Hammer";
                data.weaponTwo = "Sunshatter";
            } else if (strength < agility) {
                data.weaponOne = "Longsword";
                data.weaponTwo = "Sevashyr";
            } else {
                data.weaponOne = "Claymore";
                data.weaponTwo = "Longbow";
            };
        } else {
            if (achre > caeren) {
                data.weaponOne = "Astral Spear";
                data.weaponTwo = "Quor'eite Crush";
            } else if (achre < caeren) {
                data.weaponOne = "Ashfyre";
                data.weaponTwo = "Nyrolean Wave";
            } else {
                data.weaponOne = "Wildstrike";
                data.weaponTwo = "Nightmare";
            };
        };
    } else {
        if (physical > magical) {
            if (strength > agility) {
                data.weaponOne = "Daethic Halberd";
                data.weaponTwo = "Hush of Daethos";
            } else if (strength < agility) {
                data.weaponOne = "Hush";
                data.weaponTwo = "Daethic Bow";
            } else {
                data.weaponOne = "Daethic Halberd";
                data.weaponTwo = "Daethic Bow";
            };
        } else {
            if (achre > caeren) {
                data.weaponOne = "Tendril";
                data.weaponTwo = "Daethic Bow";
            } else if (achre < caeren) {
                data.weaponOne = "Hush of Daethos";
                data.weaponTwo = "Tendril of Daethos";
            } else {
                data.weaponOne = "Blessed Dagger";
                data.weaponTwo = "Cursed Dagger";
            };
        };
    };

    const weaponOne = deepClone(Weapons.find(item => (item.name === data.weaponOne && item.rarity === "Common")));
    const weaponTwo = deepClone(Weapons.find(item => (item.name === data.weaponTwo && item.rarity === "Common")));
    const helmet = data.helmet;
    const chest = data.chest;
    const legs = data.legs;
    const shield = data.shield;

    const weaponThree = deepClone(Weapons.find(item => item.rarity === "Default"));
    const ringOne = deepClone(Rings.find(ring => ring.rarity === "Default"));
    const ringTwo = deepClone(Rings.find(ring => ring.rarity === "Default"));
    const amulet = deepClone(Amulets.find(amulet => amulet.rarity === "Default"));
    const trinket = deepClone(Trinkets.find(trinket => trinket.rarity === "Default"));
    
    const ascean = new Ascean({
        ...data,
        _id: uuidv4(),
        weaponOne: weaponOne,
        weaponTwo: weaponTwo,
        weaponThree: weaponThree,
        shield: shield,
        helmet: helmet,
        chest: chest,
        legs: legs,
        ringOne: ringOne,
        ringTwo: ringTwo,
        amulet: amulet,
        trinket: trinket,
        currency: {
            silver: data.kyosir * 3,
            gold: 0
        },
        experience: 0,
        imgUrl: `../assets/images/${data.origin}-${data.sex}.jpg`
    });
    return ascean;
};

const initAscean = createTemplate(initCharacter);

export { createAscean, initAscean };