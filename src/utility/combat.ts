import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Combat } from "../stores/combat";
import StatusEffect from "./prayer";

export type CombatAttributes = {
    rawConstitution: number;
    rawStrength: number;
    rawAgility: number;
    rawAchre: number;
    rawCaeren: number;
    rawKyosir: number;

    totalConstitution: number;
    totalStrength: number;
    totalAgility: number;
    totalAchre: number;
    totalCaeren: number;
    totalKyosir: number;

    constitutionMod: number;
    strengthMod: number;
    agilityMod: number;
    achreMod: number;
    caerenMod: number;
    kyosirMod: number;

    equipConstitution: number;
    equipStrength: number;
    equipAgility: number;
    equipAchre: number;
    equipCaeren: number;
    equipKyosir: number;

    healthTotal: number;
    initiative: number;
    stamina: number;
    grace: number;
    [key: string]: any;
};

export type Defense = {
    physicalDefenseModifier: number;
    magicalDefenseModifier: number;
    physicalPosture: number;
    magicalPosture: number;
    [key: string]: any;
};

export type CombatStats =  {
    ascean: Ascean;
    attributes: CombatAttributes;
    combatWeaponOne: Equipment;
    combatWeaponTwo: Equipment;
    combatWeaponThree: Equipment;
    defense: Defense;
    [key: string]: any;
};


//return { ascean, attributes, combatWeaponOne, combatWeaponTwo, combatWeaponThree, defense };

// ====================================== HELPERS ====================================== \\

function roundToTwoDecimals(num: number): number {
    const roundedNum = Number(num.toFixed(2));
    if (roundedNum.toString().match(/\.\d{3,}$/)) {
        return parseFloat(roundedNum.toString());
    };
    return roundedNum;
};

function damageTypeCompiler(damageType: string, enemy: Ascean, weapon: Equipment, physicalDamage: number, magicalDamage: number): { physicalDamage: number, magicalDamage: number } {
    if (damageType === 'Blunt' || damageType === 'Fire' || damageType === 'Earth' || damageType === 'Spooky') {
        if (weapon.attackType === 'Physical') {
            if (enemy.helmet.type === 'Plate-Mail') {
                physicalDamage *= 1.15;
            };
            if (enemy.helmet.type === 'Chain-Mail') {
                physicalDamage *= 1.08;
            };
            if (enemy.helmet.type === 'Leather-Mail') {
                physicalDamage *= 0.92;
            };
            if (enemy.helmet.type === 'Leather-Cloth') {
                physicalDamage *= 0.85;
            };
            if (enemy.chest.type === 'Plate-Mail') {
                physicalDamage *= 1.1;
            };
            if (enemy.chest.type === 'Chain-Mail') {
                physicalDamage *= 1.05;
            };
            if (enemy.chest.type === 'Leather-Mail') {
                physicalDamage *= 0.95;
            };
            if (enemy.chest.type === 'Leather-Cloth') {
                physicalDamage *= 0.9;
            };
            if (enemy.legs.type === 'Plate-Mail') {
                physicalDamage *= 1.05;
            };
            if (enemy.legs.type === 'Chain-Mail') {
                physicalDamage *= 1.03;
            };
            if (enemy.legs.type === 'Leather-Mail') {
                physicalDamage *= 0.97;
            };
            if (enemy.legs.type === 'Leather-Cloth') {
                physicalDamage *= 0.95;
            };
        };
        if (weapon.attackType === 'Magic') {
            if (enemy.helmet.type === 'Plate-Mail') {
                magicalDamage *= 1.15;
            };
            if (enemy.helmet.type === 'Chain-Mail') {
                magicalDamage *= 1.08;
            };
            if (enemy.helmet.type === 'Leather-Mail') {
                magicalDamage *= 0.92;
            };
            if (enemy.helmet.type === 'Leather-Cloth') {
                magicalDamage *= 0.85;
            };
            if (enemy.chest.type === 'Plate-Mail') {
                magicalDamage *= 1.1;
            };
            if (enemy.chest.type === 'Chain-Mail') {
                magicalDamage *= 1.05;
            };
            if (enemy.chest.type === 'Leather-Mail') {
                magicalDamage *= 0.95;
            };
            if (enemy.chest.type === 'Leather-Cloth') {
                magicalDamage *= 0.9;
            };
            if (enemy.legs.type === 'Plate-Mail') {
                magicalDamage *= 1.05;
            };
            if (enemy.legs.type === 'Chain-Mail') {
                magicalDamage *= 1.03;
            };
            if (enemy.legs.type === 'Leather-Mail') {
                magicalDamage *= 0.97;
            };
            if (enemy.legs.type === 'Leather-Cloth') {
                magicalDamage *= 0.95;
            };
        };
    };
    if (damageType === 'Pierce' || damageType === 'Lightning' || damageType === 'Frost' || damageType === 'Righteous') {
        if (weapon.attackType === 'Physical') {
            if (enemy.helmet.type === 'Plate-Mail') {
                physicalDamage *= 0.85;
            };
            if (enemy.helmet.type === 'Chain-Mail') {
                physicalDamage *= 0.92;
            };
            if (enemy.helmet.type === 'Leather-Mail') {
                physicalDamage *= 1.08;
            };
            if (enemy.helmet.type === 'Leather-Cloth') {
                physicalDamage *= 1.15;
            };
            if (enemy.chest.type === 'Plate-Mail') {
                physicalDamage *= 0.9;
            };
            if (enemy.chest.type === 'Chain-Mail') {
                physicalDamage *= 0.95;
            };
            if (enemy.chest.type === 'Leather-Mail') {
                physicalDamage *= 1.05;
            };
            if (enemy.chest.type === 'Leather-Cloth') {
                physicalDamage *= 1.1;
            };
            if (enemy.legs.type === 'Plate-Mail') {
                physicalDamage *= 0.95;
            };
            if (enemy.legs.type === 'Chain-Mail') {
                physicalDamage *= 0.97;
            };
            if (enemy.legs.type === 'Leather-Mail') {
                physicalDamage *= 1.03;
            };
            if (enemy.legs.type === 'Leather-Cloth') {
                physicalDamage *= 1.05;
            };
        };
        if (weapon.attackType === 'Magic') {
            if (enemy.helmet.type === 'Plate-Mail') {
                magicalDamage *= 0.85;
            };
            if (enemy.helmet.type === 'Chain-Mail') {
                magicalDamage *= 0.92;
            };
            if (enemy.helmet.type === 'Leather-Mail') {
                magicalDamage *= 1.08;
            };
            if (enemy.helmet.type === 'Leather-Cloth') {
                magicalDamage *= 1.15;
            };
            if (enemy.chest.type === 'Plate-Mail') {
                magicalDamage *= 0.9;
            };
            if (enemy.chest.type === 'Chain-Mail') {
                magicalDamage *= 0.95;
            };
            if (enemy.chest.type === 'Leather-Mail') {
                magicalDamage *= 1.05;
            };
            if (enemy.chest.type === 'Leather-Cloth') {
                magicalDamage *= 1.1;
            };
            if (enemy.legs.type === 'Plate-Mail') {
                magicalDamage *= 0.95;
            };
            if (enemy.legs.type === 'Chain-Mail') {
                magicalDamage *= 0.97;
            };
            if (enemy.legs.type === 'Leather-Mail') {
                magicalDamage *= 1.03;
            };
            if (enemy.legs.type === 'Leather-Cloth') {
                magicalDamage *= 1.05;
            };
        };
    };
    if (damageType === 'Slash' || damageType === 'Wind' || damageType === 'Sorcery' || damageType === 'Wild') {
        if (weapon.attackType === 'Physical') {
            if (enemy.helmet.type === 'Plate-Mail') {
                physicalDamage *= 0.9 + Math.random() * 0.15;
            };
            if (enemy.helmet.type === 'Chain-Mail') {
                physicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.helmet.type === 'Leather-Mail') {
                physicalDamage *= 0.95 + Math.random() * 0.15;
            };
            if (enemy.helmet.type === 'Leather-Cloth') {
                physicalDamage *= 0.975 + Math.random() * 0.15;
            };
    
            if (enemy.chest.type === 'Plate-Mail') {
                physicalDamage *= 0.9 + Math.random() * 0.15;
            };
            if (enemy.chest.type === 'Chain-Mail') {
                physicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.chest.type === 'Leather-Mail') {
                physicalDamage *= 0.95 + Math.random() * 0.15;
            };
            if (enemy.chest.type === 'Leather-Cloth') {
                physicalDamage *= 0.975 + Math.random() * 0.15;
            };
    
            if (enemy.legs.type === 'Plate-Mail') {
                physicalDamage *= 0.9 + Math.random() * 0.15;
            };
            if (enemy.legs.type === 'Chain-Mail') {
                physicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.legs.type === 'Leather-Mail') {
                physicalDamage *= 0.95 + Math.random() * 0.15;
            };
            if (enemy.legs.type === 'Leather-Cloth') {
                physicalDamage *= 0.975 + Math.random() * 0.15;
            };
        };
        if (weapon.attackType === 'Magic') {
            if (enemy.helmet.type === 'Plate-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.helmet.type === 'Chain-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.helmet.type === 'Leather-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.helmet.type === 'Leather-Cloth') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.chest.type === 'Plate-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.chest.type === 'Chain-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.chest.type === 'Leather-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.chest.type === 'Leather-Cloth') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.legs.type === 'Plate-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.legs.type === 'Chain-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.legs.type === 'Leather-Mail') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
            if (enemy.legs.type === 'Leather-Cloth') {
                magicalDamage *= 0.925 + Math.random() * 0.15;
            };
        };
    };
    return { physicalDamage, magicalDamage };
};

function criticalCompiler(player: Ascean, critChance: number, critClearance: number, weapon: Equipment, physicalDamage: number, magicalDamage: number, weather: string, glancingBlow: boolean, criticalSuccess: boolean):{ criticalSuccess: boolean, glancingBlow: boolean, physicalDamage: number, magicalDamage: number } {
    if (weather === 'Alluring Isles') critChance -= 10;
    if (weather === 'Astralands') critChance += 10;
    if (weather === 'Kingdom') critChance += 5;
    if (critChance >= critClearance) {
        physicalDamage *= weapon.criticalDamage;
        magicalDamage *= weapon.criticalDamage;
        criticalSuccess = true;
    };
    if (critClearance > critChance + player.level + 80) {
        physicalDamage *= 0.1;
        magicalDamage *= 0.1;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 75) {
        physicalDamage *= 0.15;
        magicalDamage *= 0.15;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 70) {
        physicalDamage *= 0.2;
        magicalDamage *= 0.2;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 65) {
        physicalDamage *= 0.25;
        magicalDamage *= 0.25;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 60) {
        physicalDamage *= 0.3;
        magicalDamage *= 0.3;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 55) {
        physicalDamage *= 0.35;
        magicalDamage *= 0.35;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 50) {
        physicalDamage *= 0.4;
        magicalDamage *= 0.4;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 45) {
        physicalDamage *= 0.45;
        magicalDamage *= 0.45;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 40) {
        physicalDamage *= 0.5;
        magicalDamage *= 0.5;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 35) {
        physicalDamage *= 0.55;
        magicalDamage *= 0.55;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 30) {
        physicalDamage *= 0.6;
        magicalDamage *= 0.6;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 25) {
        physicalDamage *= 0.65;
        magicalDamage *= 0.65;
        glancingBlow = true;
    } else if (critClearance > critChance + player.level + 20) {
        physicalDamage *= 0.7;
        magicalDamage *= 0.7;
        glancingBlow = true;
    }
    // else if (critClearance > critChance + 20) {
    //     physicalDamage *= 0.8;
    //     magicalDamage *= 0.8;
    //     glancingBlow = true;
    // } else if (critClearance > critChance + 10) {
    //     physicalDamage *= 0.9;
    //     magicalDamage *= 0.9;
    //     glancingBlow = true;
    // }
    return { criticalSuccess, glancingBlow, physicalDamage, magicalDamage };
}; 

function phaserActionConcerns(action: string): boolean {
    if (action === 'attack' || action === 'posture' || action === 'roll') {
        return true;
    };
    return false;
};

function phaserSuccessConcerns(parrySuccess: boolean, rollSuccess: boolean, computerParrySuccess: boolean, computerRollSuccess: boolean): boolean {
    if (parrySuccess || rollSuccess || computerParrySuccess || computerRollSuccess) {
        return true;
    };
    return false;
};

function weatherEffectCheck(weapon: Equipment, magDam: number, physDam: number, weather: string, critical: boolean): { magicalDamage: number, physicalDamage: number } {
    let magicalDamage = magDam;
    let physicalDamage = physDam;
    switch (weather) {
        case 'Alluring Isles':
            if (weapon.type === 'Bow' || weapon.type === 'Greatbow') {
                physicalDamage *= 1.1;
                magicalDamage *= 1.1;
            };
            break;
        case 'Astralands':
            magicalDamage *= 1.1;
            physicalDamage *= 1.1;
            break;
        case 'Fangs': 
            if (weapon.attackType === 'Physical') {
                if (weapon.type !== 'Bow' && weapon.type !== 'Greatbow') {
                    physicalDamage *= 1.1; // +10% Physical Melee Damage
                } else {
                    physicalDamage *= 0.9; // -10% Physical Ranged Damage
                };
            } else {
                if (weapon?.damageType?.includes('Fire') || weapon?.damageType?.includes('Frost') || weapon?.damageType?.includes('Earth') || weapon?.damageType?.includes('Wind') || weapon?.damageType?.includes('Lightning') || weapon?.damageType?.includes('Wild')) {
                    magicalDamage *= 1.1; // +10% Magical Damage
                };
            };
            if (weapon?.influences?.[0] !== 'Daethos') {
                magicalDamage *= 1.1; // +10% Magical Damage
            };
            break;
        case 'Firelands':
            physicalDamage *= 1.1;
            magicalDamage *= 1.1;
            if (critical) {
                magicalDamage *= 1.25;
                physicalDamage *= 1.25;
            };
            break;
        case 'Kingdom':
            physicalDamage *= 1.1;
            if (weapon?.influences?.[0] !== 'Daethos') {
                magicalDamage *= 1.1;
                physicalDamage *= 1.1;
            };
            break;
        case 'Licivitas':
            if (weapon?.influences?.[0] === 'Daethos') {
                magicalDamage *= 1.15;
                physicalDamage *= 1.15;
            };
            if (critical) {
                magicalDamage *= 1.25;
                physicalDamage *= 1.25;
            };
            break;
        case 'Sedyrus':
            magicalDamage *= 1.1;
            if (weapon?.influences?.[0] !== 'Daethos') {
                magicalDamage *= 1.1;
                physicalDamage *= 1.1;
            };
            if (weapon.type === 'Bow' || weapon.type === 'Greatbow') {
                physicalDamage *= 1.1;
                magicalDamage *= 1.1;
            };
            if (critical) {
                magicalDamage *= 1.1;
                physicalDamage *= 1.1;
            };
            break;
        case 'Soverains':
            magicalDamage *= 1.1;
            if (weapon.influences?.[0] !== 'Daethos') {
                magicalDamage *= 1.1;
                physicalDamage *= 1.1;
            };
            break;
        default:
            break;
    };
    return { magicalDamage, physicalDamage };
};

function damageTick(combat: Combat, effect: StatusEffect, player: boolean): Combat {
    if (player) {
        combat.newComputerHealth -= effect.effect.damage as number * 0.33;
        if (combat.newComputerHealth < 0) {
            combat.newComputerHealth = 0;
            combat.computerWin = false;
            combat.playerWin = true;
        };
    } else {
        combat.newPlayerHealth -= effect.effect.damage as number * 0.33;
        if (combat.newPlayerHealth < 0) {
            if (combat.playerEffects.find(effect => effect.prayer === 'Denial')) {
                combat.newPlayerHealth = 1;
                combat.playerEffects = combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== 'Denial');
            } else {
                combat.newPlayerHealth = 0;
                combat.computerWin = true;
                combat.playerWin = false;
            };
        };
    };
    return combat;
};

function healTick(combat: Combat, effect:StatusEffect, player: boolean): Combat {
    if (player) {
        combat.newPlayerHealth += effect.effect.healing as number * 0.33;
        if (combat.newPlayerHealth > 0) combat.computerWin = false;
    } else {
        combat.newComputerHealth += effect.effect.healing as number * 0.33;
        if (combat.newComputerHealth > 0) combat.playerWin = false;
    };
    return combat;
};

function statusEffectCheck(combat: Combat): Combat {
    combat.playerEffects = combat.playerEffects.filter(effect => {
        const matchingWeapon = combat.weapons.find(weapon => weapon?._id === effect.weapon.id);
        const matchingWeaponIndex = combat.weapons.indexOf(matchingWeapon);
        const matchingDebuffTarget = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget);
        const matchingDebuffTargetIndex = combat.weapons.indexOf(matchingDebuffTarget);
        
        if ((effect.endTime <= combat.combatTimer || combat.playerWin === true || combat.computerWin === true)) { // The Effect Expires, Now checking for Nmae too || && effect.enemyName === combat.computer.name
            if (effect.prayer === 'Buff') { // Reverses the Buff Effect to the magnitude of the stack to the proper weapon
                const deBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingWeaponIndex] as Equipment, false);
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
                combat.playerDefense = deBuff.defense;
            };
            if (effect.prayer === 'Debuff') { // Revereses the Debuff Effect to the proper weapon
                const reBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingDebuffTargetIndex] as Equipment, true);
                combat.weapons[matchingDebuffTargetIndex] = reBuff.weapon;
                combat.playerDefense = reBuff.defense;
            };
            return false;
        };
        return true;
    });

    combat.computerEffects = combat.computerEffects.filter(effect => {
        const matchingWeapon = combat.computerWeapons.find(weapon => weapon._id === effect.weapon.id);
        const matchingWeaponIndex = combat.computerWeapons.indexOf(matchingWeapon as Equipment);
        const matchingDebuffTarget = combat.computerWeapons.find(weapon => weapon.name === effect.debuffTarget);
        const matchingDebuffTargetIndex = combat.computerWeapons.indexOf(matchingDebuffTarget as Equipment);

        if (effect.endTime <= combat.combatTimer || combat.playerWin === true || combat.computerWin === true) { // The Effect Expires
            if (effect.prayer === 'Buff') { // Reverses the Buff Effect to the magnitude of the stack to the proper weapon
                const deBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingWeaponIndex], false);
                combat.computerWeapons[matchingWeaponIndex] = deBuff.weapon;
                combat.computerDefense = deBuff.defense;
            };
            if (effect.prayer === 'Debuff') { // Revereses the Debuff Effect to the proper weapon
                const reBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingDebuffTargetIndex], true);
                combat.computerWeapons[matchingDebuffTargetIndex] = reBuff.weapon;
                combat.computerDefense = reBuff.defense;
            };
            return false;
        };
        return true;
    });

    if (combat.newPlayerHealth > 0 && combat.computerWin) combat.computerWin = false;
    if (combat.newComputerHealth > 0 && combat.playerWin) combat.playerWin = false;
    
    return combat;
};

function applyEffect(prayer: StatusEffect, defense: Defense, weapon: Equipment, isBuff: boolean): { defense: Defense, weapon: Equipment } {
    const modifier = isBuff ? 1 : -1; 
    for (let key in weapon) {
        if (prayer.effect?.[key] as string) {
            let modifiedValue = weapon[key] + prayer.effect[key] * modifier;
            modifiedValue = roundToTwoDecimals(modifiedValue);
            weapon[key] = modifiedValue;
        };
    };
    for (let key in defense) {
        if (prayer.effect[key]) {
            let modifiedValue = defense[key] + prayer.effect[key] * modifier;
            modifiedValue = roundToTwoDecimals(modifiedValue);
            defense[key] = modifiedValue;
        };
    };
    return { defense, weapon };
};

function stripEffect(prayer: StatusEffect, defense: Defense, weapon: Equipment, isDebuff: boolean): { defense: Defense, weapon: Equipment } {
    const modifier = isDebuff ? 1 : -1;
    console.log(`Stripping ${prayer.prayer} from ${prayer.weapon.name} of ${isDebuff ? prayer.enemyName : prayer.playerName}`);
    for (let key in weapon) {
        if (prayer.effect[key]) {
            let modifiedValue = weapon[key] + prayer.effect[key] * modifier * prayer.activeStacks;
            modifiedValue = roundToTwoDecimals(modifiedValue);
            weapon[key] = modifiedValue;
        };
    };
    for (let key in defense) {
        if (prayer.effect[key]) {
            let modifiedValue = defense[key] + prayer.effect[key] * modifier * prayer.activeStacks;
            modifiedValue = roundToTwoDecimals(modifiedValue);
            defense[key] = modifiedValue;
        };
    };
    return { defense, weapon };
};

function faithSuccess(combat: Combat, name: string, weapon: Equipment, index: number): Combat {
    const desc = index === 0 ? '' : 'Two'
    if (name === 'player') {
        const blessing = combat.playerBlessing;
        console.log(`${combat.player?.name} ${blessing} Success`);
        combat.prayerData.push(blessing);
        combat.deityData.push(weapon.influences?.[0] as string);
        combat.religiousSuccess = true;
        const negativeEffect = blessing === 'Damage' || blessing === 'Debuff';
        let exists: StatusEffect | undefined;

        if (negativeEffect) {
            exists = combat.computerEffects.find(effect => effect.name === `Gift of ${weapon.influences?.[0]}` && effect.prayer === blessing);
        } else {
            exists = combat.playerEffects.find(effect => effect.name === `Gift of ${weapon.influences?.[0]}` && effect.prayer === blessing);   
        };

        if (!exists) {
            exists = new StatusEffect(combat, combat.player as Ascean, combat.computer as Ascean, weapon, combat.playerAttributes as CombatAttributes, blessing);
            if (negativeEffect) {
                combat.computerEffects.push(exists);
            } else {
                combat.playerEffects.push(exists);
            };
            if (exists.prayer === 'Buff') {
                const buff = applyEffect(exists, combat.playerDefense as Defense, weapon, true);
                combat.playerDefense = buff.defense;
                weapon = buff.weapon;
            };
            if (exists.prayer === 'Damage') damageTick(combat, exists, true);
            if (exists.prayer === 'Dispel') {
                if (combat.computerEffects.length > 0) computerDispel(combat); 
                combat.playerEffects.pop();
            };
            if (exists.prayer === 'Debuff') {
                const debuff = applyEffect(exists, combat.computerDefense as Defense, combat.computerWeapons[0], false);
                combat.computerDefense = debuff.defense;
                weapon = debuff.weapon;
            };
            if (exists.prayer === 'Heal') healTick(combat, exists, true);
            
            combat[`playerInfluenceDescription${desc}`] = exists.description;
        } else {
            if (exists.stacks) {
                console.log(`${name} stacked ${exists.prayer}`);
                exists = StatusEffect.updateEffectStack(exists, combat, combat.player as Ascean, weapon);
                combat[`playerInfluenceDescription${desc}`] = `${exists.description} Stacked ${exists.activeStacks} times.`; 
                if (exists.prayer === 'Buff') {
                    const buff = applyEffect(exists, combat.computerDefense as Defense, weapon, true);
                    combat.playerDefense = buff.defense;
                    weapon = buff.weapon;
                };
                
                if (exists.prayer === 'Damage') damageTick(combat, exists, true);
            }; 
            if (exists.refreshes) {
                console.log(`${name} refreshed ${exists.prayer}`);
                exists.duration = Math.floor(combat?.player?.level as number / 3 + 1) > 6 ? 6 : Math.floor(combat?.player?.level as number / 3 + 1);
                exists.tick.end += exists.duration;
                exists.endTime += 6;
                exists.activeRefreshes += 1;
                
                if (exists.prayer === 'Heal') healTick(combat, exists, true);
                
                combat[`playerInfluenceDescription${desc}`] = `${exists.description} Refreshed ${exists.activeRefreshes} time(s).`;
            };
        };
    } else { // Computer Effect
        const blessing = combat.computerBlessing;
        // console.log(`${combat.computer.name} ${blessing} Success`);
        combat.computerReligiousSuccess = true;
        const negativeEffect = blessing === 'Damage' || blessing === 'Debuff';
        let exists: StatusEffect | undefined;

        if (negativeEffect) {
            exists = combat.playerEffects.find(effect => effect.name === `Gift of ${weapon?.influences?.[0]}` && effect.prayer === blessing);
        } else {
            exists = combat.computerEffects.find(effect => effect.name === `Gift of ${weapon?.influences?.[0]}` && effect.prayer === blessing);   
        };

        if (!exists) {
            exists = new StatusEffect(combat, combat.computer as Ascean, combat.player as Ascean, weapon, combat.computerAttributes as CombatAttributes, blessing);
            if (negativeEffect) {
                combat.playerEffects.push(exists);
            } else {
                combat.computerEffects.push(exists);
            };
            if (exists.prayer === 'Buff') {
                const buff = applyEffect(exists, combat.computerDefense as Defense, weapon, true);
                combat.computerDefense = buff.defense;
                weapon = buff.weapon;
            };
            if (exists.prayer === 'Damage') damageTick(combat, exists, false);
            if (exists.prayer === 'Debuff') {
                const debuff = applyEffect(exists, combat.playerDefense as Defense, combat.weapons?.[0] as Equipment, false);
                combat.computerDefense = debuff.defense;
                weapon = debuff.weapon;
            };
            if (exists.prayer === 'Heal') healTick(combat, exists, false);
            
            combat[`computerInfluenceDescription${desc}`] = exists.description;
        } else {
            if (exists.stacks) {
                exists = StatusEffect.updateEffectStack(exists, combat, combat.computer as Ascean, weapon);
                combat[`computerInfluenceDescription${desc}`] = `${exists.description} Stacked ${exists.activeStacks} times.`;
                if (exists.prayer === 'Buff') {
                    const buff = applyEffect(exists, combat.computerDefense as Defense, weapon, true);
                    combat.computerDefense = buff.defense;
                    weapon = buff.weapon;
                };
            };
            if (exists.refreshes) {
                exists.duration = Math.floor(combat?.computer?.level as number / 3 + 1) > 6 ? 6 : Math.floor(combat.computer?.level as number / 3 + 1);
                exists.tick.end += exists.duration;
                exists.endTime += 6;
                exists.activeRefreshes += 1;
                combat[`computerInfluenceDescription${desc}`] = `${exists.description} Refreshed ${exists.activeRefreshes} time(s) for ${exists.duration + 1} round(s).`;
            };
        };
    };
    return combat;
};

function faithModCompiler(player: Ascean, faithOne: number, weaponOne: Equipment, faithTwo: number, weaponTwo: Equipment, amuletInfluence: string, trinketInfluence: string): { faithOne: number, faithTwo: number }{
    if (player.faith === 'devoted' && weaponOne?.influences?.[0] === 'Daethos') faithOne += 5;
    if (player.faith === 'adherent' && weaponOne?.influences?.[0] !== 'Daethos') faithOne += 5;
    if (player.faith === 'devoted' && weaponTwo?.influences?.[0] === 'Daethos') faithTwo += 5;
    if (player.faith === 'adherent' && weaponTwo?.influences?.[0] !== 'Daethos') faithTwo += 5;
    
    const addRarity = (rarity: string, faith: number): number => {
        const modifier = {
            'Common': 1,
            'Uncommon': 2,
            'Rare': 3,
            'Epic': 5,
            'Legendary': 10
        };
        faith += modifier[rarity as keyof typeof modifier]; 
        return faith;
    };

    faithOne = addRarity(weaponOne.rarity as string, faithOne);
    faithTwo = addRarity(weaponTwo.rarity as string, faithTwo); 
    if (weaponOne?.influences?.[0] === amuletInfluence) {
        faithOne = addRarity(player.amulet.rarity as string, faithOne); 
    };
    if (weaponTwo?.influences?.[0] === amuletInfluence) {
        faithTwo = addRarity(player.amulet.rarity as string, faithTwo); 
    }; 
    if (weaponOne?.influences?.[0] === trinketInfluence) {
        faithOne = addRarity(player.trinket.rarity as string, faithOne); 
    };
    if (weaponTwo?.influences?.[0] === trinketInfluence) {
        faithTwo = addRarity(player.trinket.rarity as string, faithTwo); 
    };
    return { faithOne, faithTwo };
};

function faithCompiler(combat: Combat): Combat { // The influence will add a chance to have a special effect occur
    if (combat.playerWin === true || combat.computerWin === true || combat.playerBlessing === '') return combat;
    let faithNumber = Math.floor(Math.random() * 101);
    let faithNumberTwo = Math.floor(Math.random() * 101); 
    let computerFaithNumber = Math.floor(Math.random() * 101);
    let computerFaithNumberTwo = Math.floor(Math.random() * 101);

    combat.weapons[0]!.criticalChance = Number(combat.weapons[0]?.criticalChance);
    combat.weapons[0]!.criticalDamage = Number(combat.weapons[0]?.criticalDamage);

    combat.weapons[1]!.criticalChance = Number(combat.weapons[1]?.criticalChance);
    combat.weapons[1]!.criticalDamage = Number(combat.weapons[1]?.criticalDamage);

    combat.computerWeapons[0].criticalChance = Number(combat.computerWeapons[0].criticalChance);
    combat.computerWeapons[0].criticalDamage = Number(combat.computerWeapons[0].criticalDamage);

    combat.computerWeapons[1].criticalChance = Number(combat.computerWeapons[1].criticalChance);
    combat.computerWeapons[1].criticalDamage = Number(combat.computerWeapons[1].criticalDamage);

    const playerFaith = faithModCompiler(combat.player as Ascean, faithNumber, combat.weapons[0] as Equipment, faithNumberTwo, combat.weapons[1] as Equipment, combat.player?.amulet?.influences?.[0] as string, combat.player?.trinket?.influences?.[0] as string);
    faithNumber = playerFaith.faithOne;
    faithNumberTwo = playerFaith.faithTwo;

    const computerFaith = faithModCompiler(combat.computer as Ascean, computerFaithNumber, combat.computerWeapons[0], computerFaithNumberTwo, combat.computerWeapons[1], combat.computer?.amulet?.influences?.[0] as string, combat.computer?.trinket?.influences?.[0] as string);
    computerFaithNumber = computerFaith.faithOne;
    computerFaithNumberTwo = computerFaith.faithTwo;

    if (faithNumber > 90) {
        combat.actionData.push('prayer');
        faithSuccess(combat, 'player', combat.weapons[0] as Equipment, 0);
    };
    if (combat.dualWielding === true && faithNumberTwo > 90) {
        combat.actionData.push('prayer');    
        faithSuccess(combat, 'player', combat.weapons[1] as Equipment, 1);
    };

    if (!combat.playerEffects.find(effect => effect.prayer === 'Silence')) {
        if (computerFaithNumber > 90) {
            faithSuccess(combat, 'computer', combat.computerWeapons[0], 0);
        };
        if (combat.computerDualWielding === true && computerFaithNumberTwo > 90) {
            faithSuccess(combat, 'computer', combat.computerWeapons[1], 1);
        };
    };

    return combat;
};

// ================================= COMPUTER COMPILER FUNCTIONS ================================== \\

function computerActionCompiler(combat: Combat, playerAction: string): Combat {
    if (combat.sessionRound > 50) {
        combat.sessionRound = 0;
        combat.attackWeight = 0;
        combat.parryWeight = 0;
        combat.dodgeWeight = 0;
        combat.postureWeight = 0;
        combat.rollWeight = 0;
        combat.parryAttackWeight = 0;
        combat.parryParryWeight = 0;
        combat.parryDodgeWeight = 0;
        combat.parryPostureWeight = 0;
        combat.parryRollWeight = 0;
    };
    const computerActions = {
        attack: 50 + combat.attackWeight,
        parry: 10 + combat.parryWeight,
        dodge: 10 + combat.dodgeWeight,
        posture: 15 + combat.postureWeight,
        roll: 15 + combat.rollWeight,
        parryAttack: 20 + combat.parryAttackWeight,
        parryParry: 20 + combat.parryParryWeight,
        parryDodge: 20 + combat.parryDodgeWeight,
        parryPosture: 20 + combat.parryPostureWeight,
        parryRoll: 20 + combat.parryRollWeight,
        rollRating: combat.computerWeapons[0].roll,
        armorRating: (combat?.computerDefense?.physicalPosture  as number) + (combat?.computerDefense?.magicalPosture  as number)  /  4,
    };

    if (playerAction === 'attack') { 
        if (computerActions.rollRating > computerActions.armorRating) {
            combat.rollWeight += 1.5;
            combat.postureWeight += 0.5;
        } else {
            combat.postureWeight += 1.5;
            combat.rollWeight += 0.5;
        };
        // combat.rollWeight += 1;
        // combat.postureWeight += 1;
        combat.parryWeight += 1;
        combat.attackWeight -= 3;
        combat.parryAttackWeight += 4;
        combat.parryParryWeight -= 1;
        combat.parryDodgeWeight -= 1;
        combat.parryPostureWeight -= 1;
        combat.parryRollWeight -= 1;
    };
    if (playerAction === 'parry') { 
        combat.parryWeight += 3;
        // combat.dodgeWeight += 2;
        combat.attackWeight -= 1;
        combat.postureWeight -= 1;
        combat.rollWeight -= 1;
        combat.parryParryWeight += 2;
        combat.parryAttackWeight -= 1;
        combat.parryDodgeWeight -= 1;
    };
    if (playerAction === 'dodge') { 
        // combat.parryWeight += 2;
        // combat.dodgeWeight -= 2;
        combat.parryDodgeWeight += 4;
        combat.parryAttackWeight -= 1;
        combat.parryParryWeight -= 1;
        combat.parryPostureWeight -= 1;
        combat.parryRollWeight -= 1;
    };
    if (playerAction === 'posture') { 
        combat.attackWeight += 2;  
        combat.postureWeight -= 3;
        combat.parryWeight += 1;
        combat.parryPostureWeight += 3;
        combat.parryRollWeight -= 2;
        combat.parryAttackWeight -= 1;
    };

    if (playerAction === 'roll') { 
        combat.attackWeight += 2;  
        combat.rollWeight -= 3;
        combat.parryWeight += 1;
        combat.parryRollWeight += 3;
        combat.parryPostureWeight -= 2;
        combat.parryAttackWeight -= 1;
    };

    return combat;
};

function computerDualWieldCompiler(combat: Combat, playerPhysicalDefenseMultiplier: number, playerMagicalDefenseMultiplier: number): Combat { // Triggers if 40+ Str/Caer for 2h, 1h + Agi/Achre Mastery and 2nd weapon is 1h
    const computer = combat.computer;
    const weapons = combat.computerWeapons;

    let computerWeaponOnePhysicalDamage: number = weapons[0].physicalDamage;
    let computerWeaponOneMagicalDamage: number = weapons[0].magicalDamage;
    let computerWeaponTwoOhysicalDamage: number = weapons[1].physicalDamage;
    let computerWeaponTwoMagicalDamage: number = weapons[1].magicalDamage;
    let computerWeaponOneTotalDamage: number = 0;
    let computerWeaponTwoTotalDamage: number = 0;
    let firstWeaponCrit: boolean = false;
    let secondWeaponCrit: boolean = false;

    const weapOneClearance: number = Math.floor(Math.random() * 101);
    const weapTwoClearance: number = Math.floor(Math.random() * 101);
    let weapOneCrit: number = combat.computerWeapons[0].criticalChance;
    let weapTwoCrit: number = combat.computerWeapons[1].criticalChance;
    weapOneCrit -= combat?.playerAttributes?.kyosirMod as number;
    weapTwoCrit -= combat?.playerAttributes?.kyosirMod as number;
    const resultOne = criticalCompiler(combat.computer as Ascean, weapOneCrit, weapOneClearance, combat.computerWeapons[0], computerWeaponOnePhysicalDamage, computerWeaponOneMagicalDamage, combat.weather, combat.computerGlancingBlow, combat.computerCriticalSuccess);
    combat.computerGlancingBlow = resultOne.glancingBlow;
    combat.computerCriticalSuccess = resultOne.criticalSuccess;
    computerWeaponOnePhysicalDamage = resultOne.physicalDamage;
    computerWeaponOneMagicalDamage = resultOne.magicalDamage;
    if (weapOneCrit >= weapOneClearance) {
        firstWeaponCrit = true;
    };
    const resultTwo = criticalCompiler(combat.computer as Ascean, weapTwoCrit, weapTwoClearance, combat.computerWeapons[1], computerWeaponTwoOhysicalDamage, computerWeaponTwoMagicalDamage, combat.weather, combat.computerGlancingBlow, combat.computerCriticalSuccess);
    combat.computerGlancingBlow = resultTwo.glancingBlow;
    combat.computerCriticalSuccess = resultTwo.criticalSuccess;
    computerWeaponTwoOhysicalDamage = resultTwo.physicalDamage;
    computerWeaponTwoMagicalDamage = resultTwo.magicalDamage;
    if (weapTwoCrit >= weapTwoClearance) {
        secondWeaponCrit = true;
    };
    
    computerWeaponOnePhysicalDamage *= 1 - ((1 - playerPhysicalDefenseMultiplier) * (1 - (weapons[0].physicalPenetration as number / 100 )));
    computerWeaponOneMagicalDamage *= 1 - ((1 - playerMagicalDefenseMultiplier) * (1 - (weapons[0].magicalPenetration as number  / 100 )));

    computerWeaponTwoOhysicalDamage *= 1 - ((1 - playerPhysicalDefenseMultiplier) * (1 - (weapons[1].physicalPenetration as number / 100 )));
    computerWeaponTwoMagicalDamage *= 1 - ((1 - playerMagicalDefenseMultiplier) * (1 - (weapons[1].magicalPenetration as number / 100 )));

    const damageType = damageTypeCompiler(combat.computerDamageType, combat.player as Ascean, weapons[0], computerWeaponOnePhysicalDamage, computerWeaponOneMagicalDamage);
    computerWeaponOnePhysicalDamage = damageType.physicalDamage;
    computerWeaponOneMagicalDamage = damageType.magicalDamage;

    const damageTypeTwo = damageTypeCompiler(combat.computerDamageType, combat.player as Ascean, weapons[1], computerWeaponTwoOhysicalDamage, computerWeaponTwoMagicalDamage);
    computerWeaponTwoOhysicalDamage = damageTypeTwo.physicalDamage;
    computerWeaponTwoMagicalDamage = damageTypeTwo.magicalDamage;

    // =============== WEATHER EFFECTS ================ \\
    const weatherResult = weatherEffectCheck(weapons[0], computerWeaponOneMagicalDamage, computerWeaponOnePhysicalDamage, combat.weather, firstWeaponCrit);
    computerWeaponOnePhysicalDamage = weatherResult.physicalDamage;
    computerWeaponOneMagicalDamage = weatherResult.magicalDamage;

    const weatherResultTwo = weatherEffectCheck(weapons[1], computerWeaponTwoMagicalDamage, computerWeaponTwoOhysicalDamage, combat.weather, secondWeaponCrit);
    computerWeaponTwoOhysicalDamage = weatherResultTwo.physicalDamage;
    computerWeaponTwoMagicalDamage = weatherResultTwo.magicalDamage;
    // =============== WEATHER EFFECTS ================ \\

    computerWeaponOneTotalDamage = computerWeaponOnePhysicalDamage + computerWeaponOneMagicalDamage;
    computerWeaponTwoTotalDamage = computerWeaponTwoOhysicalDamage + computerWeaponTwoMagicalDamage;

    combat.realizedComputerDamage = computerWeaponOneTotalDamage + computerWeaponTwoTotalDamage;
    if (combat.realizedComputerDamage < 0) {
        combat.realizedComputerDamage = 0;
    };

    let strength = combat?.computerAttributes?.totalStrength as number + combat.computerWeapons[0].strength  + combat.computerWeapons[1].strength;
    let agility = combat?.computerAttributes?.totalAgility as number + combat.computerWeapons[0].agility  + combat.computerWeapons[1].agility;
    let achre = combat?.computerAttributes?.totalAchre as number + combat.computerWeapons[0].achre  + combat.computerWeapons[1].achre;
    let caeren = combat?.computerAttributes?.totalCaeren as number + combat.computerWeapons[0].caeren  + combat.computerWeapons[1].caeren;

    if (combat.computerWeapons[0].grip === 'One Hand') {
        if (combat.computerWeapons[0].attackType === 'Physical') {
            combat.realizedComputerDamage *= (agility / 100)
        } else {
            combat.realizedComputerDamage *= (achre / 100)
        };
    };

    if (combat.computerWeapons[0].grip === 'Two Hand') {
        if (combat.computerWeapons[0].attackType === 'Physical') {
            combat.realizedComputerDamage *= (strength / 150) 
        } else {
            combat.realizedComputerDamage *= (caeren / 150)
        };
    };

    if (combat.action === 'attack') {
        combat.realizedComputerDamage *= 1.1;
    };
    if (combat.action === 'posture') {
        combat.realizedComputerDamage *= 0.95;
    };
    if (combat.prayerData.includes('Avarice')) {
        combat.realizedComputerDamage *= 1.1;
    };
    // ================== PHASER EFFECTS ================== \\
    if (combat.isStalwart) {
        combat.realizedComputerDamage *= 0.85;
    };
    if (combat.isCaerenic) {
        combat.realizedComputerDamage *= 1.25;
    };

    combat.newPlayerHealth -= combat.realizedComputerDamage;

    if (combat.newPlayerHealth < 0) {
        if (combat.playerEffects.find(effect => effect.prayer === 'Denial')) {
            combat.newPlayerHealth = 1;
            combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== 'Denial');
        } else {
            combat.newPlayerHealth = 0;
            combat.computerWin = true;
        };
    };
    
    combat.computerActionDescription = 
        `${computer?.name} dual-wield attacks you with ${weapons[0].name} and ${weapons[1].name} for ${Math.round(combat.realizedComputerDamage)} ${combat.computerDamageType} and ${weapons[1].damageType?.[0] ? weapons[1].damageType[0] : ''}${weapons[1]?.damageType?.[1] ? ' / ' + weapons[1].damageType?.[1] : ''} ${firstWeaponCrit === true && secondWeaponCrit === true ? 'Critical Strike Damage' : firstWeaponCrit === true || secondWeaponCrit === true ? 'Partial Crit Damage' : combat.computerGlancingBlow === true ? 'Damage (Glancing)' : 'Damage'}.`    
    
    return combat;
};

function computerAttackCompiler(combat: Combat, computerAction: string): Combat {
    if (combat.playerWin === true) return combat;
    let computerPhysicalDamage: number = combat.computerWeapons[0].physicalDamage;
    let computerMagicalDamage: number = combat.computerWeapons[0].magicalDamage;
    let computerTotalDamage: number = 0;

    let playerPhysicalDefenseMultiplier = 1 - (combat.playerDefense?.physicalDefenseModifier as number / 100);
    let playerMagicalDefenseMultiplier = 1 - (combat.playerDefense?.magicalDefenseModifier as number / 100);

    if ((combat.action === 'posture' || combat.isStalwart) && combat.computerParrySuccess !== true && combat.computerRollSuccess !== true) {
        playerPhysicalDefenseMultiplier = 1 - (combat.playerDefense?.physicalPosture as number / 100);
        playerMagicalDefenseMultiplier = 1 - (combat.playerDefense?.magicalPosture as number / 100);
    };

    if (combat.computerAction === 'attack') {
        if (combat.computerWeapons[0].grip === 'One Hand') {
            if (combat.computerWeapons[0].attackType === 'Physical') {
                if (combat.computer?.mastery === 'agility' || combat.computer?.mastery === 'constitution') {
                    if (combat.computerAttributes?.totalAgility as number + combat.computerWeapons[0].agility + combat.computerWeapons[1].agility >= 50) {
                        if (combat.computerWeapons[1].grip === 'One Hand') { // If you're Focusing Attack + 1h + Agi Mastery + 1h in Second Slot
                           combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
                            return combat;
                        } else {
                            computerPhysicalDamage *= 1.3;
                            computerMagicalDamage *= 1.15;
                        };
                    } else {
                        computerPhysicalDamage *= 1.3;
                        computerMagicalDamage *= 1.15;
                    };
                } else {
                    computerPhysicalDamage *= 1.1;
                    computerMagicalDamage *= 1.1;
                };
            };
            if (combat.computerWeapons[0].attackType === 'Magic') {
                if (combat.computer?.mastery === 'achre' || combat.computer?.mastery === 'kyosir') {
                    if (combat.computerAttributes?.totalAchre as number + combat.computerWeapons[0].achre + combat.computerWeapons[1].achre >= 50) {
                        if (combat.computerWeapons[1].grip === 'One Hand') { // Might be a dual-wield compiler instead to take the rest of it
                            combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
                            return combat;
                        } else {
                            computerPhysicalDamage *= 1.15;
                            computerMagicalDamage *= 1.3;
                        };
                    } else {
                        computerPhysicalDamage *= 1.15;
                        computerMagicalDamage *= 1.3;
                    };
                } else {
                    computerPhysicalDamage *= 1.1;
                    computerMagicalDamage *= 1.1;
                };
            };
        };
        if (combat.computerWeapons[0].grip === 'Two Hand') {
            if (combat.computerWeapons[0].attackType === 'Physical' && combat.computerWeapons[0].type !== 'Bow' && combat.computerWeapons[0].type !== 'Greatbow') {
                if (combat.computer?.mastery === 'strength' || combat.computer?.mastery === 'constitution') {
                    if (combat.computerAttributes?.totalStrength as number + combat.computerWeapons[0].strength + combat.computerWeapons[1].strength >= 75) { // Might be a dual-wield compiler instead to take the rest of it
                        if (combat.computerWeapons[1].type !== 'Bow') {
                            combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
                            return combat;
                        } else { // Less than 50 Srength 
                            computerPhysicalDamage *= 1.3;
                            computerMagicalDamage *= 1.15;
                        };
                    } else { // Less than 50 Srength 
                        computerPhysicalDamage *= 1.3;
                        computerMagicalDamage *= 1.15;
                    };
                } else {
                    computerPhysicalDamage *= 1.1;
                    computerMagicalDamage *= 1.1;
                };
            };
            if (combat.computerWeapons[0].attackType === 'Magic') {
                if (combat.computer?.mastery === 'caeren' || combat.computer?.mastery === 'kyosir') {
                    if (combat.computerAttributes?.totalCaeren as number + combat.computerWeapons[0].caeren + combat.computerWeapons[1].caeren >= 75) {
                        if (combat.computerWeapons[1].type !== 'Bow') {
                            combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
                            return combat;
                        } else {
                            computerPhysicalDamage *= 1.15;
                            computerMagicalDamage *= 1.3;
                        };
                    } else {
                        computerPhysicalDamage *= 1.15;
                        computerMagicalDamage *= 1.3;
                    };
                } else {
                    computerPhysicalDamage *= 1.1;
                    computerMagicalDamage *= 1.1;
                };
            };
            if (combat.computerWeapons[0].type === 'Bow' || combat.computerWeapons[0].type === 'Greatbow') {
                computerPhysicalDamage *= 1.3;
                computerMagicalDamage *= 1.3; 
            };
        };
    };

    if (computerAction === 'parry') {
        if (combat.computerParrySuccess === true) {
            computerPhysicalDamage *= 3;
            computerMagicalDamage *= 3;    
        } else {
            computerPhysicalDamage *= 0.9;
            computerMagicalDamage *= 0.9;
        };
    };

    if (computerAction === 'dodge') {
        computerPhysicalDamage *= 0.9;
        computerMagicalDamage *= 0.9;
    };

    if (computerAction === 'roll' ) {
        if (combat.computerRollSuccess === true) {
            computerPhysicalDamage *= 1.15;
            computerMagicalDamage *= 1.15;
        } else {
            computerPhysicalDamage *= 0.95;
            computerMagicalDamage *= 0.95;
        };
    };

    const criticalClearance = Math.floor(Math.random() * 101);
    let criticalChance = combat.computerWeapons[0].criticalChance;
    criticalChance -= combat.playerAttributes?.kyosirMod as number;
    if (combat.weather === 'Astralands') criticalChance += 10;

    const criticalResult = criticalCompiler(combat.computer as Ascean, criticalChance, criticalClearance, combat.computerWeapons[0], computerPhysicalDamage, computerMagicalDamage, combat.weather, combat.computerGlancingBlow, combat.computerCriticalSuccess);
    combat.computerGlancingBlow = criticalResult.glancingBlow;
    combat.computerCriticalSuccess = criticalResult.criticalSuccess;
    computerPhysicalDamage = criticalResult.physicalDamage;
    computerMagicalDamage = criticalResult.magicalDamage;

    computerPhysicalDamage *= 1 - ((1 - playerPhysicalDefenseMultiplier) * (1 - (combat.computerWeapons[0]?.physicalPenetration as number / 100)));
    computerMagicalDamage *= 1 - ((1 - playerMagicalDefenseMultiplier) * (1 - (combat.computerWeapons[0]?.magicalPenetration as number / 100)));
    const damageType = damageTypeCompiler(combat.computerDamageType, combat.player as Ascean, combat.computerWeapons[0], computerPhysicalDamage, computerMagicalDamage);
    computerPhysicalDamage = damageType.physicalDamage;
    computerMagicalDamage = damageType.magicalDamage;

    const weatherResult = weatherEffectCheck(combat.computerWeapons[0], computerMagicalDamage, computerPhysicalDamage, combat.weather, combat.computerCriticalSuccess);
    computerPhysicalDamage = weatherResult.physicalDamage;
    computerMagicalDamage = weatherResult.magicalDamage; 

    computerTotalDamage = computerPhysicalDamage + computerMagicalDamage;
    if (computerTotalDamage < 0) {
        computerTotalDamage = 0;
    };
    combat.realizedComputerDamage = computerTotalDamage;
    if (combat.action === 'attack') {
        combat.realizedComputerDamage *= 1.1;
    };
    if (combat.action === 'posture') {
        combat.realizedComputerDamage *= 0.95;
    };

    if (combat.prayerData.includes('Avarice')) {
        combat.realizedComputerDamage *= 1.1;
    };

    if (combat.isStalwart) {
        combat.realizedComputerDamage *= 0.85;
    };
    if (combat.isCaerenic) {
        combat.realizedComputerDamage *= 1.25;
    };


    combat.newPlayerHealth -= combat.realizedComputerDamage;


    combat.computerActionDescription = 
        `${combat.computer?.name} attacks you with their ${combat.computerWeapons[0].name} for ${Math.round(computerTotalDamage)} ${combat.computerDamageType} ${combat.computerCriticalSuccess === true ? 'Critical Strike Damage' : combat.computerGlancingBlow === true ? 'Damage (Glancing)' : 'Damage'}.`    

    if (combat.newPlayerHealth < 0) {
        if (combat.playerEffects.find(effect => effect.prayer === 'Denial')) {
            combat.newPlayerHealth = 1;
            combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== 'Denial');
        } else {
            combat.newPlayerHealth = 0;
            combat.computerWin = true;
        };
    };

    if (combat.newPlayerHealth > 0) {
        combat.computerWin = false;
    };

    if (combat.newComputerHealth > 0) {
        combat.playerWin = false;
    };
    return combat;
}; 
    
function computerRollCompiler(combat: Combat, playerAction: string, computerAction: string): Combat {
    let computerRoll = combat.computerWeapons[0].roll;
    let rollCatch = Math.floor(Math.random() * 101) + (combat.playerAttributes?.kyosirMod as number);
    if (combat.weather === 'Alluring Isles') {
        computerRoll -= 10;
    };
    if (combat.weather === 'Kingdom' || combat.weather === 'Sedyrus') {
        computerRoll -= 5;
    };
    if (combat.weather === 'Fangs' || combat.weather === 'Roll') {
        computerRoll += 5;
    };
    if (computerRoll > rollCatch) {
        combat.computerRollSuccess = true;
        combat.computerSpecialDescription = `${combat.computer?.name} successfully rolls against you, avoiding your ${playerAction === 'attack' ? 'Focused' : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } Attack.`
        computerAttackCompiler(combat, computerAction);
    } else {
        combat.computerSpecialDescription = `${combat.computer?.name} fails to roll against your ${  playerAction === 'attack' ? 'Focused' : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } Attack.`
        return combat;
    };
    return combat;
};

// ================================== PLAYER COMPILER FUNCTIONS ====================================== \\

function dualWieldCompiler(combat: Combat): Combat { // Triggers if 40+ Str/Caer for 2h, 1h + Agi/Achre Mastery and 2nd weapon is 1h
    const computer = combat.computer;
    const weapons = combat.weapons;

    let playerWeaponOnePhysicalDamage = combat.weapons[0]?.physicalDamage;
    let playerWeaponOneMagicalDamage = combat.weapons[0]?.magicalDamage;
    let playerWeaponTwoPhysicalDamage = combat.weapons[1]?.physicalDamage;
    let playerWeaponTwoMagicalDamage = combat.weapons[1]?.magicalDamage;
    let playerWeaponOneTotalDamage;
    let playerWeaponTwoTotalDamage;
    let firstWeaponCrit = false;
    let secondWeaponCrit = false;
    
    let computerPhysicalDefenseMultiplier = 1 - (combat.computerDefense?.physicalDefenseModifier as number / 100);
    let computerMagicalDefenseMultiplier = 1 - (combat.computerDefense?.magicalDefenseModifier as number / 100);

    const weapOneClearance = Math.floor(Math.random() * 10100) / 100;
    const weapTwoClearance = Math.floor(Math.random() * 10100) / 100;
    let weapOneCrit = combat.weapons[0]?.criticalChance as number
    let weapTwoCrit = combat.weapons[1]?.criticalChance as number;
    weapOneCrit -= combat.computerAttributes?.kyosirMod as number;
    weapTwoCrit -= combat.computerAttributes?.kyosirMod as number;
    const resultOne = criticalCompiler(combat.player as Ascean, weapOneCrit, weapOneClearance, combat.weapons[0] as Equipment, playerWeaponOnePhysicalDamage as number, playerWeaponOneMagicalDamage as number, combat.weather, combat.glancingBlow, combat.criticalSuccess);
    combat.criticalSuccess = resultOne.criticalSuccess;
    combat.glancingBlow = resultOne.glancingBlow;
    playerWeaponOnePhysicalDamage = resultOne.physicalDamage;
    playerWeaponOneMagicalDamage = resultOne.magicalDamage;
    if (weapOneCrit >= weapOneClearance) {
        firstWeaponCrit = true;
    };
    const resultTwo = criticalCompiler(combat.player as Ascean, weapTwoCrit, weapTwoClearance, combat.weapons[1] as Equipment, playerWeaponTwoPhysicalDamage as number, playerWeaponTwoMagicalDamage as number, combat.weather, combat.glancingBlow, combat.criticalSuccess);
    combat.criticalSuccess = resultTwo.criticalSuccess;
    combat.glancingBlow = resultTwo.glancingBlow;
    playerWeaponTwoPhysicalDamage = resultTwo.physicalDamage;
    playerWeaponTwoMagicalDamage = resultTwo.magicalDamage;
    if (weapTwoCrit >= weapTwoClearance) {
        secondWeaponCrit = true;
    };

    playerWeaponOnePhysicalDamage *= 1 - ((1 - computerPhysicalDefenseMultiplier) * (1 - (weapons[0]?.physicalPenetration as number / 100)));
    playerWeaponOneMagicalDamage *= 1 - ((1 - computerMagicalDefenseMultiplier) * (1 - (weapons[0]?.magicalPenetration as number / 100)));

    playerWeaponTwoPhysicalDamage *= 1 - ((1 - computerPhysicalDefenseMultiplier) * (1 - (weapons[1]?.physicalPenetration as number / 100)));
    playerWeaponTwoMagicalDamage *= 1 - ((1 - computerMagicalDefenseMultiplier) * (1 - (weapons[1]?.magicalPenetration as number / 100)));

    const damageType = damageTypeCompiler(combat.playerDamageType, combat.computer as Ascean, weapons[0] as Equipment, playerWeaponOnePhysicalDamage, playerWeaponOneMagicalDamage);
    playerWeaponOnePhysicalDamage = damageType.physicalDamage;
    playerWeaponOneMagicalDamage = damageType.magicalDamage;

    const damageTypeTwo = damageTypeCompiler(combat.playerDamageType, combat.computer as Ascean, weapons[1] as Equipment, playerWeaponTwoPhysicalDamage, playerWeaponTwoMagicalDamage);
    playerWeaponTwoPhysicalDamage = damageTypeTwo.physicalDamage;
    playerWeaponTwoMagicalDamage = damageTypeTwo.magicalDamage;

    const weatherResult = weatherEffectCheck(combat.weapons[0] as Equipment, playerWeaponOneMagicalDamage, playerWeaponOnePhysicalDamage, combat.weather, firstWeaponCrit);
    playerWeaponOnePhysicalDamage = weatherResult.physicalDamage;
    playerWeaponOneMagicalDamage = weatherResult.magicalDamage;

    const weatherResultTwo = weatherEffectCheck(combat.weapons[1] as Equipment, playerWeaponTwoMagicalDamage, playerWeaponTwoPhysicalDamage, combat.weather, secondWeaponCrit);
    playerWeaponTwoPhysicalDamage = weatherResultTwo.physicalDamage;
    playerWeaponTwoMagicalDamage = weatherResultTwo.magicalDamage;

    playerWeaponOneTotalDamage = playerWeaponOnePhysicalDamage + playerWeaponOneMagicalDamage;
    playerWeaponTwoTotalDamage = playerWeaponTwoPhysicalDamage + playerWeaponTwoMagicalDamage;

    combat.realizedPlayerDamage = playerWeaponOneTotalDamage + playerWeaponTwoTotalDamage;
    if (combat.realizedPlayerDamage < 0) {
        combat.realizedPlayerDamage = 0;
    };

    let strength = combat.playerAttributes?.totalStrength as number + (combat.weapons[0]?.strength as number)  + (combat.weapons[1]?.strength as number);
    let agility = combat.playerAttributes?.totalAgility as number + (combat.weapons[0]?.agility as number)  + (combat.weapons[1]?.agility as number);
    let achre = combat.playerAttributes?.totalAchre as number + (combat.weapons[0]?.achre as number) + (combat.weapons[1]?.achre as number);
    let caeren = combat.playerAttributes?.totalCaeren as number + (combat.weapons[0]?.caeren as number)  + (combat.weapons[1]?.caeren as number);

    if (combat.weapons[0]?.grip === 'One Hand') {
        if (combat.weapons[0]?.attackType === 'Physical') {
            combat.realizedPlayerDamage *= (agility / 100)
        } else {
            combat.realizedPlayerDamage *= (achre / 100)
        };
    };

    if (combat.weapons[0]?.grip === 'Two Hand') {
        if (combat.weapons[0]?.attackType === 'Physical') {
            combat.realizedPlayerDamage *= (strength / 150) 
        } else {
            combat.realizedPlayerDamage *= (caeren / 150)
        };
    };

    if (combat.computerAction === 'attack') {
        combat.realizedPlayerDamage *= 1.1;
    };
    if (combat.computerAction === 'posture') {
        combat.realizedPlayerDamage *= 0.95;
    };
    if (combat.isCaerenic) {
        combat.realizedPlayerDamage *= 1.15;
    };

    combat.newComputerHealth -= combat.realizedPlayerDamage;

    if (combat.newComputerHealth <= 0) {
        combat.newComputerHealth = 0;
        combat.playerWin = true;
    };
  
    // ==================== STATISTIC LOGIC ====================
    combat.typeAttackData.push(combat.weapons[0]?.attackType as string, combat.weapons[1]?.attackType as string);
    combat.typeDamageData.push(combat.playerDamageType);
    combat.totalDamageData = combat.realizedPlayerDamage > combat.totalDamageData ? combat.realizedPlayerDamage : combat.totalDamageData;
    // ==================== STATISTIC LOGIC ====================
    
    combat.playerActionDescription = 
        `You dual-wield attack ${computer?.name} with ${weapons[0]?.name} and ${weapons[1]?.name} for ${Math.round(combat.realizedPlayerDamage)} ${combat.playerDamageType} and ${weapons[1]?.damageType?.[0] ? weapons[1]?.damageType?.[0] : ''} ${firstWeaponCrit === true && secondWeaponCrit === true ? 'Critical Strike Damage' : firstWeaponCrit === true || secondWeaponCrit === true ? 'Partial Crit Damage' : combat.glancingBlow === true ? 'Damage (Glancing)' : 'Damage'}.`    
        
    return combat;
};
    
function attackCompiler(combat: Combat, playerAction: string): Combat {
    if (combat.computerWin === true) return combat;
    let playerPhysicalDamage = combat.weapons[0]?.physicalDamage as number;
    let playerMagicalDamage = combat.weapons[0]?.magicalDamage as number;
    let playerTotalDamage;

    let computerPhysicalDefenseMultiplier = 1 - (combat.computerDefense?.physicalDefenseModifier as number / 100);
    let computerMagicalDefenseMultiplier = 1 - (combat.computerDefense?.magicalDefenseModifier as number / 100);
    
    // This is for Opponent's who are Posturing
    if (combat.computerAction === 'posture' && !combat.parrySuccess && !combat.rollSuccess) {
        computerPhysicalDefenseMultiplier = 1 - (combat.computerDefense?.physicalPosture as number / 100);
        computerMagicalDefenseMultiplier = 1 - (combat.computerDefense?.magicalPosture as number / 100);
    };

    // This is for the Focused Attack Action i.e. you chose to Attack over adding a defensive component
    if (combat.action === 'attack' || combat.action === 'arc') {
        if (combat.weapons[0]?.grip === 'One Hand') {
            if (combat.weapons[0]?.attackType === 'Physical') {
                if (combat.player?.mastery === 'agility' || combat.player?.mastery === 'constitution') {
                    if (combat.playerAttributes?.totalAgility as number + combat.weapons[0]?.agility + (combat.weapons[1]?.agility as number) >= 50) {
                        if (combat.weapons[1]?.grip === 'One Hand') { // If you're Focusing Attack + 1h + Agi Mastery + 1h in Second Slot
                            combat.dualWielding = true;
                            dualWieldCompiler(combat);
                            return combat;
                        } else {
                            playerPhysicalDamage *= 1.3; // DAMAGE_**_HIGH
                            playerMagicalDamage *= 1.15; // DAMAGE_**_MID
                        };
                    } else {
                        playerPhysicalDamage *= 1.3; // DAMAGE_**_HIGH
                        playerMagicalDamage *= 1.15; // DAMAGE_**_MID
                    };
                } else {
                    playerPhysicalDamage *= 1.1; // DAMAGE_**_LOW
                    playerMagicalDamage *= 1.1; // DAMAGE_**_LOW
                };
            };
            if (combat.weapons[0]?.attackType === 'Magic') {
                if (combat.player?.mastery === 'achre' || combat.player?.mastery === 'kyosir') {
                    if (combat.playerAttributes?.totalAchre as number + combat.weapons[0].achre + combat.weapons[0].achre + (combat.weapons[1]?.achre as number) >= 50) {
                        if (combat.weapons[1]?.grip === 'One Hand') { // Might be a dual-wield compiler instead to take the rest of it
                            combat.dualWielding = true;
                            dualWieldCompiler(combat);
                            return combat;
                        } else {
                            playerPhysicalDamage *= 1.15;
                            playerMagicalDamage *= 1.3;
                        };
                    } else {
                        playerPhysicalDamage *= 1.15;
                        playerMagicalDamage *= 1.3;
                    };
                } else {
                    playerPhysicalDamage *= 1.1;
                    playerMagicalDamage *= 1.1;
                };
            };
        };
        if (combat.weapons[0]?.grip === 'Two Hand') { // Weapon is TWO HAND
            if (combat.weapons[0]?.attackType === 'Physical' && combat.weapons[0]?.type !== 'Bow' && combat.weapons[0]?.type !== 'Greatbow') {
                if (combat.player?.mastery === 'strength' || combat.player?.mastery === 'constitution') {
                    if (combat.playerAttributes?.totalStrength as number + (combat.weapons[0]?.strength as number)  + (combat.weapons[1]?.strength as number) >= 75) { // Might be a dual-wield compiler instead to take the rest of it
                        if (combat.weapons[1]?.type !== 'Bow') {
                            combat.dualWielding = true;
                            dualWieldCompiler(combat);
                            return combat;
                        } else { // Less than 40 Srength 
                            playerPhysicalDamage *= 1.3;
                            playerMagicalDamage *= 1.15;
                        };
                    } else { // Less than 40 Srength 
                        playerPhysicalDamage *= 1.3;
                        playerMagicalDamage *= 1.15;
                    };
                } else {
                    playerPhysicalDamage *= 1.1;
                    playerMagicalDamage *= 1.1;
                };
            };
            if (combat.weapons[0].attackType === 'Magic') {
                if (combat.player?.mastery === 'caeren' || combat.player?.mastery === 'kyosir') {
                    if (combat.playerAttributes?.totalCaeren as number + (combat.weapons[0]?.caeren as number) + (combat.weapons[1]?.caeren as number) >= 75) {
                        if (combat.weapons[1]?.type !== 'Bow') {
                            combat.dualWielding = true;
                            dualWieldCompiler(combat);
                            return combat;
                        } else {
                            playerPhysicalDamage *= 1.15;
                            playerMagicalDamage *= 1.3;
                        }
                    } else {
                        playerPhysicalDamage *= 1.15;
                        playerMagicalDamage *= 1.3;
                    };
                } else {
                    playerPhysicalDamage *= 1.1;
                    playerMagicalDamage *= 1.1;
                };
            };
            if (combat.weapons[0]?.type === 'Bow' || combat.weapons[0]?.type !== 'Greatbow') {
                playerPhysicalDamage *= 1.3;
                playerMagicalDamage *= 1.3;
            };
        }; 
    };

    // Checking For Player Actions
    if (playerAction === 'arc') {
        playerPhysicalDamage *= 2;
        playerMagicalDamage *= 2;
    };
    if (playerAction === 'parry') {
        if (combat.parrySuccess) {
            playerPhysicalDamage *= 3;
            playerMagicalDamage *= 3;
        } else {
            playerPhysicalDamage *= 0.9;
            playerMagicalDamage *= 0.9;
        };
    };

    if (playerAction === 'dodge') {
        playerPhysicalDamage *= 0.9;
        playerMagicalDamage *= 0.9;
    };

    if (playerAction === 'roll' ) {
        if (combat.rollSuccess) {
            playerPhysicalDamage *= 1.15;
            playerMagicalDamage *= 1.15;
        } else {
            playerPhysicalDamage *= 0.95;
            playerMagicalDamage *= 0.95;
        };
    };
    const criticalClearance = Math.floor(Math.random() * 10100) / 100;
    let criticalChance = combat.weapons[0]?.criticalChance as number;
    criticalChance -= combat.computerAttributes?.kyosirMod as number;
    if (combat.weather === 'Astralands') criticalChance += 10;
    if (combat.weather === 'Astralands' && combat.weapons[0]?.influences?.[0] === 'Astra') criticalChance += 10;
    const criticalResult = criticalCompiler(combat.player as Ascean, criticalChance, criticalClearance, combat.weapons[0] as Equipment, playerPhysicalDamage, playerMagicalDamage, combat.weather, combat.glancingBlow, combat.criticalSuccess);
    combat.criticalSuccess = criticalResult.criticalSuccess;
    combat.glancingBlow = criticalResult.glancingBlow;
    playerPhysicalDamage = criticalResult.physicalDamage;
    playerMagicalDamage = criticalResult.magicalDamage;

    // If you made it here, your basic attack now resolves itself
    playerPhysicalDamage *= 1 - ((1 - computerPhysicalDefenseMultiplier) * (1 - (combat.weapons[0]?.physicalPenetration as number / 100)));
    playerMagicalDamage *=1 - ((1 - computerMagicalDefenseMultiplier) * (1 - (combat.weapons[0]?.magicalPenetration  as number/ 100)));
    const damageType = damageTypeCompiler(combat.playerDamageType, combat.computer as Ascean, combat.weapons[0] as Equipment, playerPhysicalDamage, playerMagicalDamage);
    playerPhysicalDamage = damageType.physicalDamage;
    playerMagicalDamage = damageType.magicalDamage;
    const weatherResult = weatherEffectCheck(combat.weapons[0] as Equipment, playerMagicalDamage, playerPhysicalDamage, combat.weather, combat.criticalSuccess);
    playerPhysicalDamage = weatherResult.physicalDamage;
    playerMagicalDamage = weatherResult.magicalDamage;

    playerTotalDamage = playerPhysicalDamage + playerMagicalDamage;
    if (playerTotalDamage < 0) {
        playerTotalDamage = 0;
    };
    combat.realizedPlayerDamage = playerTotalDamage;

    if (combat.computerAction === 'attack') {
        combat.realizedPlayerDamage *= 1.1;
    };
    if (combat.isCaerenic) {
        combat.realizedPlayerDamage *= 1.15;
    };

    combat.newComputerHealth -= combat.realizedPlayerDamage;

    // ==================== STATISTIC LOGIC ====================
    combat.typeAttackData.push(combat.weapons[0]?.attackType as string);
    combat.typeDamageData.push(combat.playerDamageType);
    combat.totalDamageData = combat.realizedPlayerDamage > combat.totalDamageData ? combat.realizedPlayerDamage : combat.totalDamageData;
    // ==================== STATISTIC LOGIC ====================

    combat.playerActionDescription = 
        `You attack ${combat.computer?.name} with your ${combat.weapons[0]?.name} for ${Math.round(playerTotalDamage)} ${combat.playerDamageType} ${combat.criticalSuccess === true ? 'Critical Strike Damage' : combat.glancingBlow === true ? 'Damage (Glancing)' : 'Damage'}.`    

    if (combat.newComputerHealth <= 0) {
        combat.newComputerHealth = 0;
        combat.playerWin = true;
    };

    return combat;
};

function playerRollCompiler(combat: Combat, playerAction: string, computerAction: string): Combat { 
    let playerRoll = combat.weapons[0]?.roll as number;
    let rollCatch = Math.floor(Math.random() * 101) + (combat.computerAttributes?.kyosirMod as number);
    if (combat.weather === 'Alluring Isles') {
        playerRoll -= 10;
    };
    if (combat.weather === 'Kingdom' || combat.weather === 'Sedyrus') {
        playerRoll -= 5;
    };
    if (combat.weather === 'Fangs' || combat.weather === 'Roll') {
        playerRoll += 5;
    };
    if (playerRoll > rollCatch) {
        combat.rollSuccess = true;
        combat.playerSpecialDescription = 
                `You successfully roll against ${combat.computer?.name}, avoiding their ${ computerAction === 'attack' ? 'Focused' : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } Attack.`;
        attackCompiler(combat, playerAction);
    } else {
        combat.playerSpecialDescription =
        `You failed to roll against ${combat.computer?.name}'s ${ computerAction === 'attack' ? 'Focused' : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } Attack.`
         
    };
    return combat;
};

// ================================== COMBAT COMPILER FUNCTIONS ====================================== \\

function doubleRollCompiler(combat: Combat, playerInitiative: number, computerInitiative: number, playerAction: string, computerAction: string): Combat {
    let playerRoll: number = combat.weapons[0]?.roll as number;
    let computerRoll: number = combat.computerWeapons[0].roll;
    let rollCatch: number = Math.floor(Math.random() * 101) + (combat.computerAttributes?.kyosirMod as number);
    if (combat.weather === 'Alluring Isles') {
        playerRoll -= 10;
        computerRoll -= 10;
    };
    if (combat.weather === 'Kingdom' || combat.weather === 'Sedyrus') {
        playerRoll -= 5;
        computerRoll -= 5;
    };
    if (combat.weather === 'Fangs' || combat.weather === 'Roll') {
        playerRoll += 5;
        computerRoll += 5;
    };
    if (playerInitiative > computerInitiative) { // You have Higher Initiative
        if (playerRoll > rollCatch) { // The Player Succeeds the Roll
            combat.playerSpecialDescription = 
                `You successfully roll against ${combat.computer?.name}, avoiding their ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} Attack`;
            attackCompiler(combat, playerAction);
        } else if (computerRoll > rollCatch) { // The Player Fails the Roll and the Computer Succeeds
            combat.playerSpecialDescription = 
                `You failed to roll against ${combat.computer?.name}'s ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} Attack`;
            combat.computerSpecialDescription = 
                `${combat.computer?.name} successfully rolls against you, avoiding your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} Attack`;
            computerAttackCompiler(combat, computerAction);
        } else { // Neither Player nor Computer Succeed
            combat.playerSpecialDescription = 
                `You failed to roll against ${combat.computer?.name}'s ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} Attack`;
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} Attack`;
            attackCompiler(combat, playerAction);
            computerAttackCompiler(combat, computerAction);
        }
    } else { // The Computer has Higher Initiative
        if (computerRoll > rollCatch) { // The Computer Succeeds the Roll
            combat.computerSpecialDescription = 
                `${combat.computer?.name} successfully rolls against you, avoiding your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} Attack`;
            computerAttackCompiler(combat, computerAction);
        } else if (playerRoll > rollCatch) { // The Computer Fails the Roll and the Player Succeeds
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} Attack`;
            combat.playerSpecialDescription = 
                `You successfully roll against ${combat.computer?.name}, avoiding their ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} Attack`;
            attackCompiler(combat, playerAction);
        } else { // Neither Computer nor Player Succeed
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} Attack`;
            combat.playerSpecialDescription = 
                `You failed to roll against ${combat.computer?.name}'s ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} Attack`;
            computerAttackCompiler(combat, computerAction);
            attackCompiler(combat, playerAction);
        };
    };
    return combat;
};

function actionSplitter(combat: Combat): Combat {
    let newData = newDataCompiler(combat);
    newData.actionData.push(newData.action);
    const playerInitiative = newData.playerAttributes.initiative;
    const computerInitiative = newData.computerAttributes.initiative;
    let playerAction = newData.action;
    const playerParry = newData.parryGuess;
    let computerParry = newData.computerParryGuess;
    let computerAction = newData.computerAction;

    if (playerAction === '' && !newData.phaser) {
        let possibleChoices = ['attack', 'posture', 'roll'];
        let postureRating = ((combat.playerDefense?.physicalPosture as number + (combat.playerDefense?.magicalPosture as number)) / 4) + 5;
        let rollRating: number = combat.weapons[0]?.roll as number;
        let posture = 'posture';
        let roll = 'roll';

        if (rollRating >= 100) {
            possibleChoices.push(roll);
        } else  if (postureRating >= 100) {
            possibleChoices.push(posture);
        } else if (postureRating >= rollRating) { 
            possibleChoices.push(posture);
        } else { 
            possibleChoices.push(roll);
        };
        let newChoice = Math.floor(Math.random() * possibleChoices.length);
        newData.action = possibleChoices[newChoice];
        newData.playerAction = possibleChoices[newChoice];
        playerAction = possibleChoices[newChoice];
    };
    computerWeaponMaker(newData);

    computerActionCompiler(newData, playerAction);
    computerParry = newData.computerParryGuess;
    computerAction = newData.computerAction;

    newData.computerStartDescription = 
        `${newData.computer.name} sets to ${computerAction === '' ? 'defend' : computerAction.charAt(0).toUpperCase() + computerAction.slice(1)}${computerParry ? '-' + computerParry.charAt(0).toUpperCase() + computerParry.slice(1) : ''} against you.`

    newData.playerStartDescription = 
        `You attempt to ${playerAction === '' ? 'defend' : playerAction.charAt(0).toUpperCase() + playerAction.slice(1)}${playerParry ? '-' + playerParry.charAt(0).toUpperCase() + playerParry.slice(1) : ''} against ${newData.computer.name}.`
    
    // If both Player and Computer Parry -> Parry [Fastest Resolution]
    if (playerAction === 'parry' && computerAction === 'parry') { // This is if PARRY: 'ACTION' Is the Same for Both
        if (playerParry === computerParry && playerParry === 'parry') {
            if (playerInitiative > computerInitiative) {
                newData.parrySuccess = true;
                newData.playerSpecialDescription = 
                    `You successfully Parried ${newData.computer.name}'s Parry-Parry! Absolutely Brutal`;
                attackCompiler(newData, playerAction);
                faithCompiler(newData); 
                // statusEffectCheck(newData);
                newData.combatRound += 1;
                newData.sessionRound += 1;
                return newData;
            } else {
                newData.computerParrySuccess = true;
                newData.computerSpecialDescription = 
                    `${newData.computer.name} successfully Parried your Parry-Parry! Absolutely Brutal`
                computerAttackCompiler(newData, computerAction);
                faithCompiler(newData);

                // statusEffectCheck(newData);
                newData.combatRound += 1;
                newData.sessionRound += 1;
                return newData;
            };
        };
        // If the Player Guesses Right and the Computer Guesses Wrong
        if (playerParry === computerAction && computerParry !== playerAction) {
            newData.parrySuccess = true;
            newData.playerSpecialDescription = 
                `You successfully Parried ${newData.computer.name}'s Parry-${computerParry.charAt(0).toUpperCase() + computerParry.slice(1)}! Absolutely Brutal`
            attackCompiler(newData, playerAction)
            faithCompiler(newData);
            // statusEffectCheck(newData);
            newData.combatRound += 1;
            newData.sessionRound += 1;
            return newData;
        };
    
        // If the Computer Guesses Right and the Player Guesses Wrong
        if (computerParry === playerAction && playerParry !== computerAction) {
            newData.computerParrySuccess = true;
            newData.computerSpecialDescription = 
                `${newData.computer.name} successfully Parried your Parry-${playerParry.charAt(0).toUpperCase() + playerParry.slice(1)}! Absolutely Brutal`
            computerAttackCompiler(newData, computerAction);
            faithCompiler(newData);
            // statusEffectCheck(newData);
            newData.combatRound += 1;
            newData.sessionRound += 1;
            return newData;
        } ;
    
        if (playerParry !== computerAction && computerParry !== playerAction) {
            newData.playerSpecialDescription = 
                `You failed to Parry ${newData.computer.name}'s Parry! Heartbreaking`
            newData.computerSpecialDescription = 
                `${newData.computer.name} fails to Parry your Parry! Heartbreaking`
                if (playerInitiative > computerInitiative) {
                    attackCompiler(newData, playerAction);
                    computerAttackCompiler(newData, computerAction);
                } else {
                    computerAttackCompiler(newData, computerAction);
                    attackCompiler(newData, playerAction);
                };
        };
    };

    if (playerAction === 'parry' && computerAction !== 'parry') {
        if (playerParry === computerAction) {
            newData.parrySuccess = true;
            newData.playerSpecialDescription = 
                `You successfully Parried ${newData.computer.name}'s ${ newData.computerAction === 'attack' ? 'Focused' : newData.computerAction.charAt(0).toUpperCase() + newData.computerAction.slice(1) } Attack.`
            attackCompiler(newData, playerAction);
            faithCompiler(newData);
            // statusEffectCheck(newData);
            newData.combatRound += 1;
            newData.sessionRound += 1;
            return newData;
        } else {
            newData.playerSpecialDescription = 
                `You failed to Parry ${newData.computer.name}'s ${ newData.computerAction === 'attack' ? 'Focused' : newData.computerAction.charAt(0).toUpperCase() + newData.computerAction.slice(1) } Attack. Heartbreaking!`
        };
    };

    if (computerAction === 'parry' && playerAction !== 'parry') {
        if (computerParry === playerAction) {
            newData.computerParrySuccess = true;
            newData.computerSpecialDescription = 
                `${newData.computer.name} successfully Parried your ${ newData.action === 'attack' ? 'Focused' : newData.action.charAt(0).toUpperCase() + newData.action.slice(1) } Attack.`
            computerAttackCompiler(newData, computerAction);
            faithCompiler(newData);
            // statusEffectCheck(newData);
            newData.combatRound += 1;
            newData.sessionRound += 1;
            return newData;
        } else {
            newData.computerSpecialDescription = 
                `${newData.computer.name} fails to Parry your ${ newData.action === 'attack' ? 'Focused' : newData.action.charAt(0).toUpperCase() + newData.action.slice(1) } Attack. Heartbreaking!`
        };
    };
    
    if (playerAction === 'dodge' && computerAction === 'dodge') { // If both choose Dodge
        if (playerInitiative > computerInitiative) {
            newData.playerSpecialDescription = 
                `You successfully Dodge ${newData.computer.name}'s ${  newData.computerAction === 'attack' ? 'Focused' : newData.computerAction.charAt(0).toUpperCase() + newData.computerAction.slice(1) } Attack`
            attackCompiler(newData, playerAction);
        } else {
            `${newData.computer.name} successfully Dodges your ${  newData.action === 'attack' ? 'Focused' : newData.action.charAt(0).toUpperCase() + newData.action.slice(1) } Attack`
            computerAttackCompiler(newData, computerAction);
        };
    };

    // If the Player Dodges and the Computer does not *Parry or Dodge  *Checked for success
    if (playerAction === 'dodge' && computerAction !== 'dodge') {
        newData.playerSpecialDescription = 
            `You successfully Dodge ${newData.computer.name}'s ${ newData.computerAction === 'attack' ? 'Focused' : newData.computerAction.charAt(0).toUpperCase() + newData.computerAction.slice(1) } Attack`
        attackCompiler(newData, playerAction);
        faithCompiler(newData);
        // statusEffectCheck(newData);
        newData.combatRound += 1;
        newData.sessionRound += 1;
        return newData;
    };

    // If the Computer Dodges and the Player does not *Parry or Dodge *Checked for success
    if (computerAction === 'dodge' && playerAction !== 'dodge') {
        `${newData.computer.name} successfully Dodges your ${ newData.action === 'attack' ? 'Focused' : newData.action.charAt(0).toUpperCase() + newData.action.slice(1) } Attack`
        computerAttackCompiler(newData, computerAction);
        faithCompiler(newData);
        // statusEffectCheck(newData);
        newData.combatRound += 1;
        newData.sessionRound += 1;
        return newData;
    };

    if (playerAction === 'roll' && computerAction === 'roll') { // If both choose Roll
        doubleRollCompiler(newData, playerInitiative, computerInitiative, playerAction, computerAction);
    };

    if (playerAction === 'roll' && computerAction !== 'roll') {
        playerRollCompiler(newData, playerAction, computerAction);
        if (newData.rollSuccess === true) {
            faithCompiler(newData);
            // statusEffectCheck(newData);
            newData.combatRound += 1;
            newData.sessionRound += 1;
            return newData;
        };
    };

    if (computerAction === 'roll' && playerAction !== 'roll') {
        computerRollCompiler(newData, playerAction, computerAction);
        if (newData.computerRollSuccess === true) {
            faithCompiler(newData);
            // statusEffectCheck(newData);
            newData.combatRound += 1;
            newData.sessionRound += 1;
            return newData;
        };
    };

    if (playerAction === 'attack' || playerAction === 'posture' || computerAction === 'attack' || computerAction === 'posture') { // If both choose Attack
        if (playerInitiative > computerInitiative) {
            if (playerAction !== '') attackCompiler(newData, playerAction);
            if (computerAction !== '') computerAttackCompiler(newData, computerAction);
        } else {
            if (computerAction !== '') computerAttackCompiler(newData, computerAction);
            if (playerAction !== '') attackCompiler(newData, playerAction);
        };
    };

    faithCompiler(newData);
    // statusEffectCheck(newData);
    
    if (newData.playerWin === true) {
        newData.computerDeathDescription = 
        `${newData.computer.name} has been defeated. Hail ${newData.player.name}, you have won.`;
    };
    if (newData.computerWin === true) {
        newData.playerDeathDescription = 
        `You have been defeated. Hail ${newData.computer.name}, they have won.`;
    };
    if (newData.playerWin === true || newData.computerWin === true) {
        statusEffectCheck(newData);
    };

    newData.combatRound += 1;
    newData.sessionRound += 1;

    console.log(newData, 'NEW DATA');
    return newData;
};

function computerWeaponMaker(combat: Combat): Combat {
    let prayers = ['Buff', 'Damage', 'Debuff', 'Heal'];
    let newPrayer = Math.floor(Math.random() * prayers.length);
    combat.computerBlessing = prayers[newPrayer];

    let defenseTypes: any = {
        "Leather-Cloth": 0,
        "Leather-Mail": 0,
        "Chain-Mail": 0,
        "Plate-Mail": 0,
    };
    let armorWeights: any = {
        "helmet": 2,
        "chest": 1.5,
        "legs": 1,
    };
    defenseTypes[combat.player?.helmet.type as keyof typeof defenseTypes] += armorWeights.helmet;
    defenseTypes[combat.player?.chest.type as keyof typeof defenseTypes] += armorWeights.chest;
    defenseTypes[combat.player?.legs.type as keyof typeof defenseTypes] += armorWeights.legs;
    const sortedDefenses = Object.entries(defenseTypes)
        .sort((a, b) => b[1] as number - (a[1] as number)) // Sort based on the values in descending order
        .map(([type, weight]) => ({ type, weight })); // Convert back to an array of objects
    
    let strongTypes = {
        "Leather-Cloth": ["Frost", "Lightning", "Righteous", "Pierce"],
        "Leather-Mail": ["Pierce", "Slash", "Wind", "Sorcery", "Wild"],
        "Chain-Mail": ["Blunt", "Slash", "Sorcery", "Wind", "Wild"],
        "Plate-Mail": ["Blunt", "Earth", "Fire", "Spooky"],
    };
    let computerTypes: any = {
        0: [],
        1: [],
        2: [],
    };
    combat.computerWeapons.forEach((weapon, index) => {
        weapon.damageType?.forEach((type) => {
            if (strongTypes[sortedDefenses[0].type as keyof typeof strongTypes].includes(type)) {
                computerTypes[index as keyof typeof computerTypes].push({ type, rank: 1 });
            } else if (strongTypes[sortedDefenses[1].type as keyof typeof strongTypes].includes(type)) {
                computerTypes[index].push({ type, rank: 2 });
            } else if (strongTypes[sortedDefenses[2].type  as keyof typeof strongTypes].includes(type)) {
                computerTypes[index].push({ type, rank: 3 });
            } else if (strongTypes[sortedDefenses[3].type  as keyof typeof strongTypes].includes(type)) {
                computerTypes[index].push({ type, rank: 4 });
            };
        });      
    });

    for (let rank = 1; rank <= 4; rank++) {
        if (computerTypes[0].length && computerTypes[0].find((type: { rank: number; }) => type.rank === rank)) {
            if (rank === 1) {
                combat.computerDamageType = computerTypes[0].sort((a: { rank: number; }, b: { rank: number; }) => a.rank - b.rank)[0].type;
            } else {
                combat.computerDamageType = computerTypes[0][Math.floor(Math.random() * computerTypes[0].length)].type;
            };
            break;
        } else if (computerTypes[1].length && computerTypes[1].find((type: { rank: number; }) => type.rank === rank)) {
            combat.computerWeapons = [combat.computerWeapons[1], combat.computerWeapons[0], combat.computerWeapons[2]];
            combat.computerDamageType = computerTypes[1][Math.floor(Math.random() * computerTypes[1].length)].type;
            break;
        } else if (computerTypes[2].length && computerTypes[2].find((type: { rank: number; }) => type.rank === rank)) {
            combat.computerWeapons = [combat.computerWeapons[2], combat.computerWeapons[0], combat.computerWeapons[1]];
            combat.computerDamageType = computerTypes[2][Math.floor(Math.random() * computerTypes[2].length)].type;
            break;
        };
    };

    return combat;
};

function dualActionSplitter(combat: Combat): Combat {
    let newCombat = newDataCompiler(combat);
    newCombat.actionData.push(newCombat.action);
    const playerInitiative = newCombat.playerAttributes.initiative;
    const computerInitiative = newCombat.computerAttributes.initiative;
    const playerAction = newCombat.action;
    const playerParry = newCombat.parryGuess;
    const computerAction = newCombat.computerAction;
    const computerParry = newCombat.computerParryGuess;

    computerWeaponMaker(newCombat);
    computerActionCompiler(newCombat, playerAction);

    newCombat.computerStartDescription = 
        `${newCombat.computer.name} sets to ${computerAction === '' ? 'defend' : computerAction.charAt(0).toUpperCase() + computerAction.slice(1)}${computerParry ? '-' + computerParry.charAt(0).toUpperCase() + computerParry.slice(1) : ''} against you.`

    newCombat.playerStartDescription = 
        `You attempt to ${playerAction === '' ? 'defend' : playerAction.charAt(0).toUpperCase() + playerAction.slice(1)}${playerParry ? '-' + playerParry.charAt(0).toUpperCase() + playerParry.slice(1) : ''} against ${newCombat.computer.name}.`
    
    // ========================== PARRY LOGIC (PHASER) ========================== \\

    if (playerAction === 'parry' && computerAction === 'parry') {
        if (playerParry === computerParry && playerParry === 'parry') {
            if (playerInitiative > computerInitiative) {
                newCombat.parrySuccess = true;
                newCombat.playerSpecialDescription = `You successfully Parried ${newCombat.computer.name}'s Parry-Parry! Absolutely Brutal`;
            } else {
                newCombat.computerParrySuccess = true;
                newCombat.computerSpecialDescription = `${newCombat.computer.name} successfully Parried your Parry-Parry! Absolutely Brutal`; 
            };
            return newCombat;
        };
    };

    if (playerAction === 'parry' && computerAction !== 'parry') {
        newCombat.parrySuccess = true;
        newCombat.playerSpecialDescription = `You successfully Parried ${newCombat.computer.name}'s ${ computerAction === 'attack' ? 'Focused' : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } Attack.`;
        return newCombat;
    };

    if (computerAction === 'parry' && playerAction !== 'parry') {
        newCombat.computerParrySuccess = true;
        newCombat.computerSpecialDescription = `${newCombat.computer.name} successfully Parried your ${ newCombat.action === 'attack' ? 'Focused' : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } Attack.`;
        return newCombat;    
    };


    // ========================== PARRY LOGIC (TURN BASED) ========================== \\

    // if (playerAction === 'parry' && computerAction === 'parry') { 
    //     if (playerParry === computerParry && playerParry === 'parry') {
    //         if (playerInitiative > computerInitiative) {
    //             newCombat.parrySuccess = true;
    //             newCombat.playerSpecialDescription = `You successfully Parried ${newCombat.computer.name}'s Parry-Parry! Absolutely Brutal`;
    //         } else {
    //             newCombat.computerParrySuccess = true;
    //             newCombat.computerSpecialDescription = `${newCombat.computer.name} successfully Parried your Parry-Parry! Absolutely Brutal`; 
    //         };
    //         return newCombat;
    //     };
    //     if (playerParry === computerAction && computerParry !== playerAction) {
    //         newCombat.parrySuccess = true;
    //         newCombat.playerSpecialDescription = `You successfully Parried ${newCombat.computer.name}'s Parry-${computerParry.charAt(0).toUpperCase() + computerParry.slice(1)}! Absolutely Brutal`;
    //         return newCombat; 
    //     };
    
    //     if (computerParry === playerAction && playerParry !== computerAction) {
    //         newCombat.computerParrySuccess = true;
    //         newCombat.computerSpecialDescription = `${newCombat.computer.name} successfully Parried your Parry-${playerParry.charAt(0).toUpperCase() + playerParry.slice(1)}! Absolutely Brutal`;
    //         return newCombat; 
    //     };
    
    //     if (playerParry !== computerAction && computerParry !== playerAction) {
    //         newCombat.playerSpecialDescription = `You failed to Parry ${newCombat.computer.name}'s Parry! Heartbreaking`;
    //         newCombat.computerSpecialDescription = `${newCombat.computer.name} fails to Parry your Parry! Heartbreaking`;
    //         return newCombat;
    //     };
    // };

    // if (playerAction === 'parry' && computerAction !== 'parry') {
    //     if (playerParry === computerAction) {
    //         newCombat.parrySuccess = true;
    //         newCombat.playerSpecialDescription = `You successfully Parried ${newCombat.computer.name}'s ${ computerAction === 'attack' ? 'Focused' : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } Attack.`;
    //         return newCombat;
    //     } else {
    //         newCombat.playerSpecialDescription = 
    //             `You failed to Parry ${newCombat.computer.name}'s ${ computerAction === 'attack' ? 'Focused' : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } Attack. Heartbreaking!`;
    //     };
    // };

    // if (computerAction === 'parry' && playerAction !== 'parry') {
    //     if (computerParry === playerAction) {
    //         newCombat.computerParrySuccess = true;
    //         newCombat.computerSpecialDescription = `${newCombat.computer.name} successfully Parried your ${ newCombat.action === 'attack' ? 'Focused' : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } Attack.`;
    //         return newCombat;    
    //     } else {
    //         newCombat.computerSpecialDescription = `${newCombat.computer.name} fails to Parry your ${ playerAction === 'attack' ? 'Focused' : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } Attack. Heartbreaking!`;
    //     };
    // };

    if (playerAction === 'roll' && computerAction === 'roll') { // If both choose Roll
        doubleRollCompiler(newCombat, playerInitiative, computerInitiative, playerAction, computerAction);
        return newCombat;
    };

    if (playerAction === 'roll' && computerAction !== 'roll') {
        playerRollCompiler(newCombat, playerAction, computerAction);
    };

    if (computerAction === 'roll' && playerAction !== 'roll') {
        computerRollCompiler(newCombat, playerAction, computerAction);
    };

    if (phaserSuccessConcerns(newCombat.parrySuccess, newCombat.rollSuccess, newCombat.computerParrySuccess, newCombat.computerRollSuccess) === false) { // If both choose Attack
        if (playerInitiative > computerInitiative) {
            if (phaserActionConcerns(newCombat.action)) attackCompiler(newCombat, playerAction);
            if (phaserActionConcerns(newCombat.computerAction)) computerAttackCompiler(newCombat, computerAction);
        } else {
            if (phaserActionConcerns(newCombat.computerAction)) computerAttackCompiler(newCombat, computerAction);
            if (phaserActionConcerns(newCombat.action)) attackCompiler(newCombat, playerAction);
        };
    };

    return newCombat;
};

function weaponActionSplitter(combat: Combat): Combat {
    let cleanData = newDataCompiler(combat);
    let changes = { ...cleanData };
    const playerActionLive = cleanData.action !== '' ? true : false;
    const computerActionLive = cleanData.computerAction !== '' ? true : false;
    if (playerActionLive && computerActionLive) {
        console.log("Dual Actions");
        cleanData = dualActionSplitter(cleanData);
        changes = {
            ...changes,
            'playerSpecialDescription': cleanData.playerSpecialDescription,
            'playerStartDescription': cleanData.playerStartDescription,
            'playerInfluenceDescription': cleanData.playerInfluenceDescription,
            'playerInfluenceDescriptionTwo': cleanData.playerInfluenceDescriptionTwo,
            'playerActionDescription': cleanData.playerActionDescription,
            'realizedPlayerDamage': cleanData.realizedPlayerDamage,
            'parrySuccess': cleanData.parrySuccess,
            'rollSuccess': cleanData.rollSuccess,
            'criticalSuccess': cleanData.criticalSuccess,
            'religiousSuccess': cleanData.religiousSuccess,
            'glancingBlow': cleanData.glancingBlow,
            'dualWielding': cleanData.dualWielding,

            'computerSpecialDescription': cleanData.computerSpecialDescription,
            'computerStartDescription': cleanData.computerStartDescription,
            'computerInfluenceDescription': cleanData.computerInfluenceDescription,
            'computerInfluenceDescriptionTwo': cleanData.computerInfluenceDescriptionTwo,
            'computerActionDescription': cleanData.computerActionDescription,
            'realizedComputerDamage': cleanData.realizedComputerDamage,
            'computerDamageType': cleanData.computerDamageType,
            'computerParrySuccess': cleanData.computerParrySuccess,
            'computerRollSuccess': cleanData.computerRollSuccess,
            'computerCriticalSuccess': cleanData.computerCriticalSuccess,
            'computerReligiousSuccess': cleanData.computerReligiousSuccess,
            'computerGlancingBlow': cleanData.computerGlancingBlow,
            'computerDualWielding': cleanData.computerDualWielding, 
        };
    } else if (playerActionLive && !computerActionLive) {
        if (cleanData.action === 'parry') return cleanData;
        computerActionCompiler(cleanData, cleanData.action);
        attackCompiler(cleanData, cleanData.action);
        changes = {
            ...changes,
            'playerSpecialDescription': cleanData.playerSpecialDescription,
            'playerStartDescription': cleanData.playerStartDescription,
            'playerInfluenceDescription': cleanData.playerInfluenceDescription,
            'playerInfluenceDescriptionTwo': cleanData.playerInfluenceDescriptionTwo,
            'playerActionDescription': cleanData.playerActionDescription,
            'realizedPlayerDamage': cleanData.realizedPlayerDamage,
            'potentialPlayerDamage': cleanData.potentialPlayerDamage,
            'parrySuccess': cleanData.parrySuccess,
            'rollSuccess': cleanData.rollSuccess,
            'criticalSuccess': cleanData.criticalSuccess,
            'religiousSuccess': cleanData.religiousSuccess,
            'glancingBlow': cleanData.glancingBlow,
            'dualWielding': cleanData.dualWielding,
        };
    } else if (!playerActionLive && computerActionLive) {
        // console.log(cleanData.computer.name, "Computer Attacking");
        if (cleanData.computerAction === 'parry') return cleanData;
        computerWeaponMaker(cleanData);
        computerAttackCompiler(cleanData, cleanData.computerAction);
        changes = {
            ...changes,
            'computerSpecialDescription': cleanData.computerSpecialDescription,
            'computerStartDescription': cleanData.computerStartDescription,
            'computerInfluenceDescription': cleanData.computerInfluenceDescription,
            'computerInfluenceDescriptionTwo': cleanData.computerInfluenceDescriptionTwo,
            'computerActionDescription': cleanData.computerActionDescription,
            'realizedComputerDamage': cleanData.realizedComputerDamage,
            'potentialComputerDamage': cleanData.potentialComputerDamage,
            'computerDamageType': cleanData.computerDamageType,
            'computerParrySuccess': cleanData.computerParrySuccess,
            'computerRollSuccess': cleanData.computerRollSuccess,
            'computerCriticalSuccess': cleanData.computerCriticalSuccess,
            'computerReligiousSuccess': cleanData.computerReligiousSuccess,
            'computerGlancingBlow': cleanData.computerGlancingBlow,
            'computerDualWielding': cleanData.computerDualWielding,    
        };
    };
    faithCompiler(cleanData);
    
    if (cleanData.playerWin === true) cleanData.computerDeathDescription = `${cleanData.computer.name} has been defeated. Hail ${cleanData.player.name}, you have won.`;
    if (cleanData.computerWin === true) cleanData.playerDeathDescription = `You have been defeated. Hail ${cleanData.computer.name}, they have won.`;
    
    cleanData.action = '';
    cleanData.computerAction = '';
    cleanData.combatRound += 1;
    cleanData.sessionRound += 1;
    
    if (cleanData.playerWin === true || cleanData.computerWin === true) statusEffectCheck(cleanData);

    changes = {
        ...changes,
        'action': cleanData.action,
        'computerAction': cleanData.computerAction,
        'combatRound': cleanData.combatRound,
        'sessionRound': cleanData.sessionRound,
        'playerDamaged': cleanData.realizedComputerDamage > 0,
        'computerDamaged': cleanData.realizedPlayerDamage > 0,
        
        'newPlayerHealth': cleanData.newPlayerHealth,
        'playerDefense': cleanData.playerDefense,
        'playerEffects': cleanData.playerEffects,
        'weapons': cleanData.weapons,
        
        'newComputerHealth': cleanData.newComputerHealth,
        'computerDefense': cleanData.computerDefense,
        'computerEffects': cleanData.computerEffects,
        'computerWeapons': cleanData.computerWeapons,
        'computerBlessing': cleanData.computerBlessing,
        
        'actionData': cleanData.actionData,
        'typeAttackData': cleanData.typeAttackData,
        'typeDamageData': cleanData.typeDamageData,
        'deityData': cleanData.deityData,
        'prayerData': cleanData.prayerData,

        'attackWeight': cleanData.attackWeight,
        'parryWeight': cleanData.parryWeight,
        'dodgeWeight': cleanData.dodgeWeight,
        'postureWeight': cleanData.postureWeight,
        'rollWeight': cleanData.rollWeight,
        'parryAttackWeight': cleanData.parryAttackWeight,
        'parryParryWeight': cleanData.parryParryWeight,
        'parryDodgeWeight': cleanData.parryDodgeWeight,
        'parryPostureWeight': cleanData.parryPostureWeight,
        'parryRollWeight': cleanData.parryRollWeight,

        'playerDeathDescription': cleanData.playerDeathDescription,
        'computerDeathDescription': cleanData.computerDeathDescription,
        'playerWin': cleanData.playerWin,
        'computerWin': cleanData.computerWin,
    };
    return changes;
};

function newDataCompiler(combat: Combat): any {
    const newData: Combat = {
        player: combat.player, // The player's Ascean
        action: combat.action, // The player's action
        playerAction: combat.action,
        parryGuess: combat.parryGuess, // The action chosen believed to be 
        playerHealth: combat.playerHealth, // Total Player Health
        weaponOne: combat.weaponOne, // Clean Slate of Weapon One
        weaponTwo: combat.weaponTwo, // Clean Slate of Weapon Two
        weaponThree: combat.weaponThree, // Clean Slate of Weapon Three
        weapons: combat.weapons, // Array of 3 Weapons in current affect and order
        playerDamageType: combat.playerDamageType,
        playerDefense: combat.playerDefense, // Posseses Base + Postured Defenses
        playerAttributes: combat.playerAttributes, // Possesses compiled CombatAttributes, Initiative
        playerDefenseDefault: combat.playerDefenseDefault, // Possesses Base Defenses
        computer: combat.computer, // Computer Enemy
        computerHealth: combat.computerHealth,
        computerAttributes: combat.computerAttributes, // Possesses compiled CombatAttributes, Initiative
        computerDefense: combat.computerDefense, // Posseses Base + Postured Defenses
        computerDefenseDefault: combat.computerDefenseDefault, // Possesses Base Defenses
        computerAction: combat.computerAction, // Action Chosen By Computer
        computerParryGuess: combat.computerParryGuess, // Comp's Parry Guess if Action === 'Parry'
        computerWeapons: combat.computerWeapons,  // All 3 Weapons
        computerWeaponOne: combat.computerWeaponOne, // Clean Slate of Weapon One
        computerWeaponTwo: combat.computerWeaponTwo, // Clean Slate of Weapon Two
        computerWeaponThree: combat.computerWeaponThree, // Clean Slate of Weapon Three
        computerDamageType: combat.computerDamageType,
        potentialPlayerDamage: 0, // All the Damage that is possible on hit for a player
        potentialComputerDamage: 0, // All the Damage that is possible on hit for a computer
        realizedPlayerDamage: 0, // Player Damage - Computer Defenses
        realizedComputerDamage: 0, // Computer Damage - Player Defenses
        playerDamaged: false,
        computerDamaged: false,
        playerStartDescription: '',
        computerStartDescription: '',
        playerSpecialDescription: '',
        computerSpecialDescription: '',
        playerActionDescription: '', 
        computerActionDescription: '',
        playerInfluenceDescription: '',
        computerInfluenceDescription: '',
        playerInfluenceDescriptionTwo: '',
        computerInfluenceDescriptionTwo: '',
        playerDeathDescription: '',
        computerDeathDescription: '',
        newPlayerHealth: combat.newPlayerHealth, // New player health post-combat action
        newComputerHealth: combat.newComputerHealth, // New computer health post-combat action
        attackWeight: combat.attackWeight,
        parryWeight: combat.parryWeight,
        dodgeWeight: combat.dodgeWeight,
        postureWeight: combat.postureWeight,
        rollWeight: combat.rollWeight,
        parryAttackWeight: combat.parryAttackWeight,
        parryParryWeight: combat.parryParryWeight,
        parryDodgeWeight: combat.parryDodgeWeight,
        parryPostureWeight: combat.parryPostureWeight,
        parryRollWeight: combat.parryRollWeight,
        religiousSuccess: false,
        computerReligiousSuccess: false,
        dualWielding: false,
        computerDualWielding: false,
        rollSuccess: false,
        parrySuccess: false,
        computerRollSuccess: false,
        computerParrySuccess: false,
        playerWin: false,
        playerLuckout: false,
        // playerTrait: combat.playerTrait,
        enemyPersuaded: false,
        computerWin: false,
        criticalSuccess: false,
        computerCriticalSuccess: false,
        glancingBlow: false,
        computerGlancingBlow: false,
        combatRound: combat.combatRound,
        sessionRound: combat.sessionRound,
        playerEffects: combat.playerEffects,
        computerEffects: combat.computerEffects,
        playerBlessing: combat.playerBlessing,
        computerBlessing: combat.computerBlessing,
        prayerSacrifice: combat.prayerSacrifice,
        prayerSacrificeId: combat.prayerSacrificeId,
        prayerSacrificeName: combat.prayerSacrificeName,
        enemyPrayerConsumed: combat.enemyPrayerConsumed,
        combatInitiated: combat.combatInitiated,
        actionStatus: combat.actionStatus,
        gameIsLive: combat.gameIsLive,
        combatEngaged: combat.combatEngaged,
        instantStatus: combat.instantStatus,
        actionData: combat.actionData,
        typeAttackData: combat.typeAttackData,
        typeDamageData: combat.typeDamageData,
        totalDamageData: combat.totalDamageData,
        prayerData: combat.prayerData,
        deityData: combat.deityData,
        weather: combat.weather,
        enemyID: combat.enemyID,
        combatTimer: combat.combatTimer,
        isCaerenic: combat.isCaerenic,
        isStalwart: combat.isStalwart,
        npcType: combat.npcType,
        // persuasionScenario: combat.persuasionScenario,
        // luckoutScenario: combat.luckoutScenario,
        isEnemy: combat.isEnemy,
        isAggressive: combat.isAggressive,
        startedAggressive: combat.startedAggressive,
        isStealth: combat.isStealth,
        persuasionScenario: combat.persuasionScenario,
        luckoutScenario: combat.luckoutScenario,
        playerTrait: combat.playerTrait,
        soundEffects: combat.soundEffects,
    };
    return newData;
};

function computerDispel(combat: Combat): Combat {
    const effect: StatusEffect = combat.computerEffects.find(effect => (effect.prayer !== 'Debuff' && effect.prayer !== 'Damage')) as StatusEffect;
    const matchingWeapon: Equipment = combat.computerWeapons.find(weapon => weapon._id === effect.weapon.id) as Equipment;
    const matchingWeaponIndex: number = combat.computerWeapons.indexOf(matchingWeapon);
    if (effect.prayer === 'Buff') {
        const deBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingWeaponIndex], false);
        combat.computerDefense = deBuff.defense;
        combat.computerWeapons[matchingWeaponIndex] = deBuff.weapon; 
    };
    combat.computerEffects = combat.computerEffects.filter(prayer => prayer.id !== effect.id);
    return combat;
};

// ================================== ACTION - SPLITTERS ===================================== \\

function prayerSplitter(combat: Combat, prayer: string): Combat {
    console.log(`Prayer: ${prayer}`);
    let originalPrayer = combat.playerBlessing;
    combat.playerBlessing = prayer; 
    faithSuccess(combat, 'player', combat.weapons[0] as Equipment, 0);
    combat.playerBlessing = originalPrayer;
    return combat;
};

function instantDamageSplitter(combat: Combat, mastery: string): Combat {
    let damage = combat.player?.[mastery] * 0.5 + (combat.player?.level as number);
    combat.realizedPlayerDamage = damage;
    combat.newComputerHealth -= combat.realizedPlayerDamage;
    combat.computerDamaged = true;
    combat.playerAction = 'invoke';
    combat.playerActionDescription = `You attack ${combat.computer?.name}'s Caeren with your ${combat.player?.mastery}'s Invocation of ${combat.weapons[0]?.influences?.[0]} for ${Math.round(damage)} Pure Damage.`;    
    return combat;
};

function instantActionSplitter(combat: Combat): any {
    switch (combat.player?.mastery) {
        case 'constitution':
            prayerSplitter(combat, 'Heal');
            prayerSplitter(combat, 'Buff');
            break;
        case 'strength':
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, 'strength');
            break;
        case 'agility':
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, 'agility');
            break;
        case 'achre':
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, 'achre');
            break;
        case 'caeren':
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, 'caeren');
            break;
        case 'kyosir':
            prayerSplitter(combat, 'Damage');
            prayerSplitter(combat, 'Debuff');
            break;
        default:
            break;
    };

    combat.actionData.push('invoke'); 
        
    if (combat.newComputerHealth <= 0) {
        combat.newComputerHealth = 0;
        combat.playerWin = true;
    };
    if (combat.playerWin) statusEffectCheck(combat);

    const changes = {
        'actionData': combat.actionData,
        'deityData': combat.deityData,
        'prayerData': combat.prayerData,

        'weapons': combat.weapons,
        'computerWeapons': combat.computerWeapons,
        'playerEffects': combat.playerEffects,
        'computerEffects': combat.computerEffects,
        'playerDefense': combat.playerDefense,
        'computerDefense': combat.computerDefense,

        'newPlayerHealth': combat.newPlayerHealth,
        'newComputerHealth': combat.newComputerHealth,
        
        'realizedPlayerDamage': combat.realizedPlayerDamage,
        'computerDamaged': combat.computerDamaged,
        'playerWin': combat.playerWin,
        'playerActionDescription': combat.playerActionDescription,
        'playerInfluenceDescription': combat.playerInfluenceDescription,
    };
    return changes;
};

function consumePrayerSplitter(combat: Combat): any {
    if (combat.prayerSacrificeId === '') {
        combat.prayerSacrifice = combat.playerEffects[0].prayer;
        combat.prayerSacrificeId = combat.playerEffects[0].id;
        combat.prayerSacrificeName = combat.playerEffects[0].name;
    };
    // if (combat.prayerSacrifice === '') combat.prayerSacrifice = combat.playerEffects[0].prayer;
    // if (combat.prayerSacrificeName === '') combat.prayerSacrificeName = combat.playerEffects[0].name;
    combat.actionData.push('consume');
    combat.prayerData.push(combat.prayerSacrifice);
    console.log(`Sacrificing: ${combat.prayerSacrifice} - ${combat.prayerSacrificeName}?`);
    combat.playerEffects = combat.playerEffects.filter(effect => {
        if (effect.id !== combat.prayerSacrificeId) return true; // || effect.enemyName !== combat.computer.name
        console.log(`Sacrificing: ${combat.prayerSacrifice} - ${combat.prayerSacrificeName}!`);
        const matchingWeapon = combat.weapons.find(weapon => weapon?._id === effect.weapon.id);
        const matchingWeaponIndex = combat.weapons.indexOf(matchingWeapon);
        const matchingDebuffTarget = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget);
        const matchingDebuffTargetIndex = combat.weapons.indexOf(matchingDebuffTarget);

        console.log(`Sacrificing: ${combat.prayerSacrifice}`);
        switch (combat.prayerSacrifice) {
            case 'Heal':
                combat.newPlayerHealth += effect.effect?.healing as number * 0.165;
                if (combat.newPlayerHealth > 0) combat.computerWin = false;
                break;
            case 'Buff':
                combat.newComputerHealth -= (combat.realizedPlayerDamage * 0.5);
                combat.playerActionDescription = `${combat.weapons[0]?.influences?.[0]}'s Tendrils serenade ${combat.computer?.name}, echoing ${Math.round(combat.realizedPlayerDamage * 0.5)} more damage.`    
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                };
                const deBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingWeaponIndex] as Equipment, false);
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
                combat.playerDefense = deBuff.defense;
                break;
            case 'Damage':
                combat.newComputerHealth -= effect.effect?.damage as number * 0.165;
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                }; 
                break;
            case 'Debuff':
                combat.newComputerHealth -= (combat.realizedComputerDamage * 0.5);
                combat.playerActionDescription = `The Hush of ${combat.weapons[0]?.influences?.[0]} wracks ${combat.computer?.name}, wearing for ${Math.round(combat.realizedComputerDamage * 0.5)} more damage.`;   
            
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                };
                const reBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingDebuffTargetIndex] as Equipment, true);
                combat.playerDefense = reBuff.defense;
                combat.weapons[matchingDebuffTargetIndex] = reBuff.weapon;
                break;
            default: break;
        };
        console.log('Effect Sacrificed');
        return false;
    });

    combat.playerAction = 'prayer';
    combat.prayerSacrifice = '';
    combat.prayerSacrificeId = '';
    combat.prayerSacrificeName = '';
    combat.action = '';
    if (combat.prayerSacrifice !== 'Heal' && combat.realizedPlayerDamage > 0) combat.computerDamaged = true;
    if (combat.playerWin === true) statusEffectCheck(combat);

    const changes = {
        actionData: combat.actionData,
        prayerData: combat.prayerData,

        playerEffects: combat.playerEffects,
        computerEffects: combat.computerEffects,
        weapons: combat.weapons,
        computerWeapons: combat.computerWeapons,
        playerDefense: combat.playerDefense,
        computerDefense: combat.computerDefense,

        newPlayerHealth: combat.newPlayerHealth,
        newComputerHealth: combat.newComputerHealth,

        playerWin: combat.playerWin,
        playerActionDescription: combat.playerActionDescription,
        prayerSacrifice: combat.prayerSacrifice,
        prayerSacrificeId: combat.prayerSacrificeId,
        prayerSacrificeName: combat.prayerSacrificeName,
        
        computerDamaged: combat.computerDamaged,
        realizedPlayerDamage: combat.realizedPlayerDamage,
        action: combat.action,
        playerAction: combat.playerAction,
    };

    return changes;
};

function prayerEffectTickSplitter(data: { combat: Combat, effect: StatusEffect, effectTimer: number }): any { 
    let { combat, effect, effectTimer } = data;

    if (effect.playerName === combat.player?.name) { 
        if (effect.prayer === 'Damage') { 
            damageTick(combat, effect, true);
            if (combat.combatTimer >= effect.endTime || effectTimer === 0) combat.computerEffects = combat.computerEffects.filter(compEffect => compEffect.id !== effect.id);
        };
        if (effect.prayer === 'Heal') { 
            healTick(combat, effect, true);
            if (combat.combatTimer >= effect.endTime || effectTimer === 0) combat.playerEffects = combat.playerEffects.filter(playerEffect => playerEffect.id !== effect.id);
        };  
    } else if (effect.playerName === combat.computer?.name) {
        if (effect.prayer === 'Damage') {
            damageTick(combat, effect, false);
            if (combat.combatTimer >= effect.endTime || effectTimer === 0) combat.playerEffects = combat.playerEffects.filter(playEffect => playEffect.id !== effect.id);
        };
        if (effect.prayer === 'Heal') { 
            healTick(combat, effect, false);
            if (combat.combatTimer >= effect.endTime || effectTimer === 0) combat.computerEffects = combat.computerEffects.filter(computerEffect => computerEffect.id !== effect.id);
        };
    };

    if (combat.playerWin === true || combat.computerWin === true) statusEffectCheck(combat);

    const changes = {
        'actionData': combat.actionData,
        'prayerData': combat.prayerData,

        'playerEffects': combat.playerEffects,
        'computerEffects': combat.computerEffects,
        'weapons': combat.weapons,
        'computerWeapons': combat.computerWeapons,
        'playerDefense': combat.playerDefense,
        'computerDefense': combat.computerDefense,

        'newPlayerHealth': combat.newPlayerHealth,
        'newComputerHealth': combat.newComputerHealth,

        'playerWin': combat.playerWin,
        'computerWin': combat.computerWin,
    };
    return changes;
};

function prayerRemoveTickSplitter(combat: Combat, statusEffect: StatusEffect): Combat {
    // const { combat, statusEffect } = data;
    const target = (statusEffect.prayer === 'Damage' || statusEffect.prayer === 'Debuff') ? statusEffect.enemyName : statusEffect.playerName;
    // console.log(target, combat.player?.name, combat.computer?.name, 'Removing Tick from Target - Player Name - Computer Name');
    // console.log(`%c Removing ${statusEffect.prayer} from ${statusEffect.playerName}`, 'color: #ff0000');

    if (target === combat.player?.name) { 
        combat.playerEffects = combat.playerEffects.filter(effect => {
            if (effect.id !== statusEffect.id) return true; 

            const matchingWeapon: Equipment = combat.weapons.find(weapon => weapon?._id === effect.weapon.id) as Equipment;
            const matchingWeaponIndex: number = combat.weapons.indexOf(matchingWeapon);
            const matchingDebuffTarget: Equipment = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget) as Equipment;
            const matchingDebuffTargetIndex: number = combat.weapons.indexOf(matchingDebuffTarget);

            if (effect.prayer === 'Buff') { 
                // console.log(`Removing Buff Effect from ${effect.playerName}`);
                const deBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingWeaponIndex] as Equipment, false);
                combat.playerDefense = deBuff.defense;
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
            };

            if (effect.prayer === 'Debuff') { 
                // console.log(`Removing Debuff Effect from ${effect.playerName} against ${effect.debuffTarget}`);
                const reBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingDebuffTargetIndex] as Equipment, true);
                combat.playerDefense = reBuff.defense;
                combat.weapons[matchingDebuffTargetIndex] = reBuff.weapon;
            };

            return false;
        });
    } else if (target === combat.computer?.name) {
        combat.computerEffects = combat.computerEffects.filter(effect => {
            if (effect.id !== statusEffect.id) return true;

            const matchingWeapon: Equipment = combat.computerWeapons.find(weapon => weapon._id === effect.weapon.id) as Equipment;
            const matchingWeaponIndex: number = combat.computerWeapons.indexOf(matchingWeapon);
            const matchingDebuffTarget: Equipment = combat.computerWeapons.find(weapon => weapon.name === effect.debuffTarget) as Equipment;
            const matchingDebuffTargetIndex: number = combat.computerWeapons.indexOf(matchingDebuffTarget);

            if (effect.prayer === 'Buff') { 
                // console.log(`Removing Buff Effect from ${effect.playerName}`);
                const deBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingWeaponIndex], false);
                combat.computerDefense = deBuff.defense;
                combat.computerWeapons[matchingWeaponIndex] = deBuff.weapon;
            };

            if (effect.prayer === 'Debuff') { 
                // console.log(`Removing Debuff Effect from ${effect.playerName} against ${effect.debuffTarget}`);
                const reBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingDebuffTargetIndex], true);
                combat.computerDefense = reBuff.defense;
                combat.computerWeapons[matchingDebuffTargetIndex] = reBuff.weapon;
            };

            return false;
        });
    };
    return combat;
};

function computerCombatSplitter(data: { computerOne: Combat, computerTwo: Combat }) {
    try {
        let { computerOne, computerTwo } = data;
        console.log(computerOne, computerTwo, 'Computer Combat Splitter Data');
        newDataCompiler(computerOne);
        newDataCompiler(computerTwo);
        const computerOneActionLive = computerOne.computerAction !== '' ? true : false;
        const computerTwoActionLive = computerTwo.computerAction !== '' ? true : false;

        if (computerOneActionLive && computerTwoActionLive) {
            console.log("Dual Actions");
            computerOne = dualActionSplitter(computerOne);
            computerTwo = dualActionSplitter(computerTwo);
        } else if (computerOneActionLive && !computerTwoActionLive) {
            computerActionCompiler(computerTwo, computerOne.computerAction);
            computerAttackCompiler(computerTwo, computerOne.computerAction);
        } else if (!computerOneActionLive && computerTwoActionLive) {
            computerActionCompiler(computerOne, computerTwo.computerAction);
            computerAttackCompiler(computerOne, computerTwo.computerAction);
        };



        // Discern the Computer's actions against each other as would be against the player
        computerWeaponMaker(computerOne);
        computerWeaponMaker(computerTwo);
        computerActionCompiler(computerOne, computerTwo.computerAction);
        computerActionCompiler(computerTwo, computerOne.computerAction);


        return { computerOne, computerTwo } as { computerOne: Combat, computerTwo: Combat };
    } catch (err) {
        console.log(err, 'Error in the Phaser Effect Tick of Game Services');
    };
};

// ================================= VALIDATOR - SPLITTERS ===================================== \\

function validate(combat: Combat): boolean {
    if (combat.player != undefined && combat.computer != undefined && combat.player != null && combat.computer != null && combat.player !== undefined && combat.computer !== null && combat.player !== undefined && combat.computer !== null) {
        return true;
    };
    return false;
};

// ================================= CONTROLLER - SERVICE ===================================== \\

function actionCompiler (combat: Combat): Combat | undefined {
    try {
        if (validate(combat) === false) return combat;
        let res = actionSplitter(combat);
        if (res.realizedComputerDamage > 0) res.playerDamaged = true;
        if (res.realizedPlayerDamage > 0) res.computerDamaged = true;
        if (res.playerWin || res.computerWin) statusEffectCheck(res);
        return res;
    } catch (err) {
        console.log(err, 'Error in the Action Compiler of Game Services');
    };
};

function instantActionCompiler(combat: Combat): Combat | undefined {
    try {
        if (validate(combat) === false) return combat;
        console.log('Instant Action Compiler');
        const res = instantActionSplitter(combat);
        return res;
    } catch (err) {
        console.log(err, 'Error in the Instant Action Compiler of Game Services');
    };
};

function consumePrayer(combat: Combat): Combat | undefined {
    try {
        if (validate(combat) === false) return combat;
        const res = consumePrayerSplitter(combat);
        return res;
    } catch (err) {
        console.log(err, 'Error in the Consume Prayer of Game Services');
    };
};

function weaponActionCompiler(combat: Combat): Combat | undefined {
    try {
        if (validate(combat) === false) return combat;
        const res = weaponActionSplitter(combat);
        return res as Combat;
    } catch (err) {
        console.log(err, 'Error in the Phaser Action Compiler of Game Services');
    };
};

function prayerEffectTick(data: {
    combat: Combat;
    effect: StatusEffect;
    effectTimer: number;
}): Combat | undefined {
    try {
        if (!validate(data.combat)) return data.combat;
        const res = prayerEffectTickSplitter(data);
        return res;
    } catch (err) {
        console.log(err, 'Error in the Phaser Effect Tick of Game Services');
    };
};

function prayerRemoveTick(combat: Combat, statusEffect: StatusEffect): Combat | undefined {
    try {
        // if (validate(combat) === false) return combat;
        const res = prayerRemoveTickSplitter(combat, statusEffect);
        return res;
    } catch (err) {
        console.log(err, 'Error in the Phaser Effect Tick of Game Services');
    };
};

function computerCombatCompiler(combat: { computerOne: Combat, computerTwo: Combat }): { computerOne: Combat, computerTwo: Combat } | undefined {
    try {
        if (!validate(combat.computerOne) || !validate(combat.computerTwo)) return combat;
        const res = computerCombatSplitter(combat);
        return res;
    } catch (err) {
        console.log(err, 'Error in the Phaser Effect Tick of Game Services');
    };
}

export {
    // actionCompiler,
    prayerSplitter,
    instantActionCompiler,
    consumePrayer,
    weaponActionCompiler,
    prayerEffectTick,
    prayerRemoveTick,
};