import { Weapons } from './weaponry';
import { Amulets, Rings, Trinkets } from './jewelry';
import { Helmets, Chests, Legs, Shields } from './equipment';
import Settings from '../../models/settings';
import Ascean from '../../models/ascean';
import { Asceans } from './ascean';
import Equipment from '../../models/equipment';


export const getSettings = (id: string): Object => {
    const settings = new Settings(id);
    return settings;
    // const settings = await db.collection(SETTINGS).doc({ _id: id }).get();
    // if (settings) {
    //     return settings;
    // } else {
    //     const newSettings = new Settings(id);
        // await db.collection(SETTINGS).add(newSettings);
        // return newSettings;
    // };
};

export function indexEquipment(): Object[] {
    const weapons = Weapons.filter(weapon => weapon.rarity === 'Common');
    const amulets = Amulets.filter(amulet => amulet.rarity === 'Common');
    const rings = Rings.filter(ring => ring.rarity === 'Common');
    const trinkets = Trinkets.filter(trinket => trinket.rarity === 'Common');
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

export function randomEnemy() {
    const random = Math.floor(Math.random() * Asceans.length);
    return Asceans[random];
};