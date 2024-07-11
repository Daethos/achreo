import { Weapons } from './weaponry';
import { Amulets, Rings, Trinkets } from './jewelry';
import { Helmets, Chests, Legs, Shields } from './equipment';
import Settings from '../../models/settings';
import Ascean from '../../models/ascean';
import { Asceans } from './ascean';
import PseudoBase from './pseudo';
import Equipment, { getOneRandom } from '../../models/equipment';
import { Reputation } from '../../utility/player';
let db = new PseudoBase('db');

const EQUIPMENT = 'Equipment';
const ASCEANS = 'Asceans';
const SETTINGS = 'Settings';
const REPUTATION = 'Reputation';

export const getAsceans = async () => await db.collection(ASCEANS).get();
export const getAscean = async (id: string) => await db.collection(ASCEANS).doc({ _id: id }).get();
export const addAscean = async (ascean: any) => await db.collection(ASCEANS).add(ascean);
export const updateAscean = async (ascean: any) => await db.collection(ASCEANS).doc({ _id: ascean._id }).update(ascean);
export const deleteAscean = async (id: string) => {
    const ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
    const equipment = [ascean.weaponOne, ascean.weaponTwo, ascean.weaponThree, ascean.shield, ascean.helmet, ascean.chest, ascean.legs, ascean.ringOne, ascean.ringTwo, ascean.amulet, ascean.trinket];
    const inventory = await getInventoryIds(id);
    equipment.forEach(async (item: string) => await db.collection(EQUIPMENT).doc({ _id: item }).delete());
    inventory.forEach(async (item: string) => await db.collection(EQUIPMENT).doc({ _id: item }).delete());
    await db.collection(ASCEANS).doc({ _id: id }).delete();
    const reputation = await db.collection(REPUTATION).doc({ _id: id }).get();
    if (reputation) await db.collection(REPUTATION).doc({ _id: id }).delete();
    const settings = await db.collection(SETTINGS).doc({ _id: id }).get();
    if (settings) await db.collection(SETTINGS).doc({ _id: id }).delete();
};

export const blessAscean = async (id: string, entry: any): Promise<any> => {
    try {
        let ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
        const blessing = ascean.mastery;
        ascean[blessing] += 1;
        ascean.health = { ...ascean.health, current: ascean.health.max };
        ascean.statistics.relationships.deity.Faithful.occurrence += 1;
        ascean.statistics.relationships.deity.Faithful.value += 5;
        ascean.statistics.relationships.deity.value += 5;
        ascean.statistics.relationships.deity.behaviors.push('Blessed');
        ascean.interactions.deity += 1;
        ascean.journal.entries.push(entry);
        const update = await db.collection(ASCEANS).doc({ _id: ascean._id }).update(ascean);
        return update;
    } catch (err) {
        console.warn(err, 'Error in Bless Ascean Controller');
    };
};

export const curseAscean = async (id: string, entry: any): Promise<any> => {
    try {
        let ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
        ascean.firewater.charges = 0;
        ascean.experience = 0;
        ascean.health = { ...ascean.health, current: 1 };
        ascean.statistics.relationships.deity.Unfaithful.occurrence += 1;
        ascean.statistics.relationships.deity.Unfaithful.value -= 5;
        ascean.statistics.relationships.deity.value -= 5;
        ascean.statistics.relationships.deity.behaviors.push('Cursed');
        ascean.interactions.deity += 1;
        ascean.journal.entries.push(entry);
        const update =  await db.collection(ASCEANS).doc({ _id: ascean._id }).update(ascean);
        return update;
    } catch (err) {
        console.warn(err, 'Error in Curse Ascean Controller');
    };
};

export const blessAsceanRandom = async (id: string) => {
    let ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
    const blessExperience = Math.min(ascean.experience + ascean.level * 250, ascean.level * 1000);
    const random = Math.floor(Math.random() * 5);
    switch (random) {
        case 0:
            ascean.firewater = { ...ascean.firewater, charges: 5 };
            ascean.experience = blessExperience;
            break;
        case 1:
            ascean.experience = blessExperience;
            ascean.health = { ...ascean.health, current: ascean.health.max };
            break;
        case 2:
            ascean.health = { ...ascean.health, current: ascean.health.max };
            ascean.firewater = { ...ascean.firewater, charges: 5 };
            break;
        case 3:
            const random = await getOneRandom(ascean().level);
            ascean.inventory.push(random?.[0]._id as string);
            break;
        case 4:
            ascean.firewater.charges = 0;
            ascean.experience = blessExperience;
            ascean.health = { ...ascean.health, current: ascean.health.max };
            break;
        default:
            break;
    };

    ascean.statistics.relationships.deity.Faithful.occurrence += 1;
    ascean.statistics.relationships.deity.Faithful.value += 5;
    ascean.statistics.relationships.deity.value += 5;
    ascean.statistics.relationships.deity.behaviors.push('Blessed');
    await db.collection(ASCEANS).doc({ _id: ascean._id }).update(ascean);
};

export const curseAsceanRandom = async (id: string) => {
    let ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
    const random = Math.floor(Math.random() * 5);
    switch (random) {
        case 0:
            ascean.firewater = { ...ascean.firewater, charges: 0 };
            ascean.experience = 0;
            break;
        case 1:
            ascean.experience = 0;
            ascean.health = { ...ascean.health, current: 1 };
            break;
        case 2:
            ascean.health = { ...ascean.health, current: 1 };
            ascean.firewater = { ...ascean.firewater, charges: 0 };
            break;
        case 3:
            const random = ascean.inventory[Math.floor(Math.random() * ascean.inventory.length)];
            ascean.inventory = ascean.inventory.filter((item: string) => item !== random);
            await db.collection(EQUIPMENT).doc({ _id: random }).delete();
            break;
        case 4:
            ascean.firewater.charges = 0;
            ascean.experience = 0;
            ascean.health = { ...ascean.health, current: 1 };
            break;
        default:
            break;
    };

    ascean.statistics.relationships.deity.Unfaithful.occurrence += 1;
    ascean.statistics.relationships.deity.Unfaithful.value -= 5;
    ascean.statistics.relationships.deity.value -= 5;
    ascean.statistics.relationships.deity.behaviors.push('Cursed');
    await db.collection(ASCEANS).doc({ _id: ascean._id }).update(ascean);
};

export const saveEntry = async (id: string, entry: any) => {
    try {
        let ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
        ascean.journal.entries.push(entry);
        await db.collection(ASCEANS).doc({ _id: id }).update(ascean);
    } catch (err: any) {
        console.warn(err.message, "Error Adding Journal Entry");
    };
};

export const saveTutorial = async (id: string, type: string) => {
    const ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
    const update = { ...ascean, tutorial: { ...ascean.tutorial, [type]: true} };
    const save = await db.collection(ASCEANS).doc({ _id: id }).update(update);
    return save;
};

export const scrub = async (ascean: Ascean) => {
    let inventory = Array.from(new Set(ascean.inventory));
    inventory = inventory.filter((item: Equipment) => {
        const real = (item !== undefined && item !== null && item != undefined && item != null)
        return real;
    }); 
    inventory = inventory.map((item: Equipment) => item._id);
    const scrubbed = { ...ascean, 
        weaponOne: ascean.weaponOne._id, weaponTwo: ascean.weaponTwo._id, weaponThree: ascean.weaponThree._id, shield: ascean.shield._id, 
        helmet: ascean.helmet._id, chest: ascean.chest._id, legs: ascean.legs._id, 
        ringOne: ascean.ringOne._id, ringTwo: ascean.ringTwo._id, amulet: ascean.amulet._id, trinket: ascean.trinket._id, 
        inventory: inventory };
    await updateAscean(scrubbed);
    return scrubbed;
};

export const getInventory = async (id: string) => {
    const ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
    const inventory = ascean.inventory;
    if (!inventory) return [];
    const populated = Promise.all(inventory.map(async (item: Equipment) => {
        const equipment = await db.collection(EQUIPMENT).doc({ _id: item }).get();
        return equipment;
    }));
    return populated;
};

export const getInventoryIds = async (id: string) => {
    const ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
    return ascean.inventory;
};

export const updateInventory = async (id: string, inventory: string[]) => {
    let ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
    ascean.inventory = inventory;
    await db.collection(ASCEANS).doc({ _id: id }).update(ascean);
};

export const getReputation = async (id: string) => {
    const reputation = await db.collection(REPUTATION).doc({ _id: id }).get();
    if (reputation) {
        return reputation;
    } else {
        const newReputation = new Reputation(id);
        await db.collection(REPUTATION).add(newReputation);
        return newReputation;
    };
};

export const updateReputation = async (reputation: Reputation) => {
    const update = await db.collection(REPUTATION).doc({ _id: reputation._id }).update(reputation);
    return update;
};

export const getSettings = async (id: string) => {
    const settings = await db.collection(SETTINGS).doc({ _id: id }).get();
    if (settings) {
        return settings;
    } else {
        const ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
        const newSettings = new Settings(id, ascean.mastery);
        await db.collection(SETTINGS).add(newSettings);
        return newSettings;
    };
};

export const updateSettings = async (settings: Settings) => {
    await db.collection(SETTINGS).doc({ _id: settings._id }).update(settings);
};

export const populate = async (ascean: any) => {
    const weaponOne = await db.collection(EQUIPMENT).doc({ _id: ascean.weaponOne }).get();
    const weaponTwo = await db.collection(EQUIPMENT).doc({ _id: ascean.weaponTwo }).get();
    const weaponThree = await db.collection(EQUIPMENT).doc({ _id: ascean.weaponThree }).get();
    const shield = await db.collection(EQUIPMENT).doc({ _id: ascean.shield }).get();
    const helmet = await db.collection(EQUIPMENT).doc({ _id: ascean.helmet }).get();
    const chest = await db.collection(EQUIPMENT).doc({ _id: ascean.chest }).get();
    const legs = await db.collection(EQUIPMENT).doc({ _id: ascean.legs }).get();
    const ringOne = await db.collection(EQUIPMENT).doc({ _id: ascean.ringOne }).get();
    const ringTwo = await db.collection(EQUIPMENT).doc({ _id: ascean.ringTwo }).get();
    const amulet = await db.collection(EQUIPMENT).doc({ _id: ascean.amulet }).get();
    const trinket = await db.collection(EQUIPMENT).doc({ _id: ascean.trinket }).get();

    const populated = Promise.all([weaponOne, weaponTwo, weaponThree, shield, helmet, chest, legs, ringOne, ringTwo, amulet, trinket]).then((values) => {
        return {
            ...ascean,
            weaponOne: values[0],
            weaponTwo: values[1],
            weaponThree: values[2],
            shield: values[3],
            helmet: values[4],
            chest: values[5],
            legs: values[6],
            ringOne: values[7],
            ringTwo: values[8],
            amulet: values[9],
            trinket: values[10],
        };
    });
    return populated;
};

export function indexEquipment(): Object[] {
    const weapons = Weapons.filter(weapon => weapon.rarity === 'Common');
    const amulets = Amulets.filter(amulet => amulet.rarity === 'Uncommon');
    const rings = Rings.filter(ring => ring.rarity === 'Uncommon');
    const trinkets = Trinkets.filter(trinket => trinket.rarity === 'Uncommon');
    const helmets = Helmets.filter(helmet => helmet.rarity === 'Common' || helmet.rarity === 'Default');
    const chests = Chests.filter(chest => chest.rarity === 'Common' || chest.rarity === 'Default');
    const legs = Legs.filter(leg => leg.rarity === 'Common' || leg.rarity === 'Default');
    const shields = Shields.filter(shield => shield.rarity === 'Common');
    const equipment = [...weapons, ...amulets, ...rings, ...trinkets, ...helmets, ...chests, ...legs, ...shields];
    return equipment;
};

export function populateEnemy(enemy: Ascean): Ascean {
    const weaponOne: Equipment = Weapons.find(weapon => weapon.name === enemy.weaponOne.name && weapon.rarity === enemy.weaponOne.rarity) as Equipment;
    const weaponTwo: Equipment = Weapons.find(weapon => weapon.name === enemy.weaponTwo.name && weapon.rarity === enemy.weaponTwo.rarity) as Equipment;
    const weaponThree: Equipment = Weapons.find(weapon => weapon.name === enemy.weaponThree.name && weapon.rarity === enemy.weaponThree.rarity) as Equipment;
    const shield: Equipment = Shields.find(shield => shield.name === enemy.shield.name && shield.rarity === enemy.shield.rarity) as Equipment;
    const helmet: Equipment = Helmets.find(helmet => helmet.name === enemy.helmet.name && helmet.rarity === enemy.helmet.rarity) as Equipment;
    const chest: Equipment = Chests.find(chest => chest.name === enemy.chest.name && chest.rarity === enemy.chest.rarity) as Equipment;
    const legs: Equipment = Legs.find(leg => leg.name === enemy.legs.name && leg.rarity === enemy.legs.rarity) as Equipment;
    const ringOne: Equipment = Rings.find(ring => ring.name === enemy.ringOne.name && ring.rarity === enemy.ringOne.rarity) as Equipment;
    const ringTwo: Equipment = Rings.find(ring => ring.name === enemy.ringTwo.name && ring.rarity === enemy.ringTwo.rarity) as Equipment;
    const amulet: Equipment = Amulets.find(amulet => amulet.name === enemy.amulet.name && amulet.rarity === enemy.amulet.rarity) as Equipment;
    const trinket: Equipment = Trinkets.find(trinket => trinket.name === enemy.trinket.name && trinket.rarity === enemy.trinket.rarity) as Equipment;

    return {
        ...enemy,
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
    };
};

export function randomEnemy(min: number, max: number): Ascean {
    const random = Asceans.filter(ascean => ascean.level >= min && ascean.level <= max);
    const enemy = random[Math.floor(Math.random() * random.length)];
    return enemy;
};

export const allEquipment = async () => await db.collection(EQUIPMENT).get();
export const addEquipment = async (equipment: Equipment) => await db.collection(EQUIPMENT).add(equipment);
export const deleteEquipment = async (id: string) => await db.collection(EQUIPMENT).doc({ _id: id }).delete();
export const getEquipment = async (id: string) => await db.collection(EQUIPMENT).doc({ _id: id }).get();
export const getEquipmentByName = async (name: string) => await db.collection(EQUIPMENT).doc({ name: name }).get();
export const getEquipmentByRarity = async (rarity: string) => await db.collection(EQUIPMENT).doc({ rarity: rarity }).get();

export const equipmentSwap = async (inventoryId: string, editState: any, id: string) => {
    try {
        let ascean = await db.collection(ASCEANS).doc({ _id: id }).get();
        const keyToUpdate = Object.keys(editState).find(key => {
            return editState[key as keyof typeof editState] !== '' && key === editState.inventoryType;
        });

        const currentItem = ascean[keyToUpdate];
        ascean[keyToUpdate] = inventoryId;
        const equipment = await getEquipment(currentItem);
        
        if (equipment.rarity === 'Default') {
            await db.collection(EQUIPMENT).doc({ _id: currentItem }).delete();
        } else { // Default rarities are deleted from the database
            ascean.inventory.push(currentItem);
        };

        const oldItemIndex = ascean.inventory.indexOf(inventoryId);
        ascean.inventory.splice(oldItemIndex, 1);
        await db.collection(ASCEANS).doc({ _id: id }).update(ascean);
        return ascean;
    } catch (error) {
        console.error(error);
    };
};

export const equipmentRemove = async (data: any) => {
    try {
        let ascean = await db.collection(ASCEANS).doc({ _id: data.id }).get();
        let inventory = ascean.inventory;
        const itemId = data.inventory._id;
        const itemIndex = ascean.inventory.indexOf(itemId);
        inventory.splice(itemIndex, 1);
        ascean.inventory = inventory;
        
        await db.collection(ASCEANS).doc({ _id: data.id }).update(ascean);
        await db.collection(EQUIPMENT).doc({ _id: itemId }).delete();
        return ascean.inventory;
    } catch (error) {
        console.error(error);
    };
};