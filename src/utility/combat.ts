import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Combat } from "../stores/combat";
import { ARMOR_WEIGHT, ARMORS, ACTION_TYPES, ATTACKS, DAMAGE, ENEMY_ATTACKS, HOLD_TYPES, STRONG_ATTACKS, STRONG_TYPES, THRESHOLD, ATTACK_TYPES, DEFENSE_TYPES, DAMAGE_TYPES, MASTERY, WEAPON_TYPES, DEITIES, FAITH_RARITY } from "./combatTypes";
import StatusEffect, { PRAYERS } from "./prayer";

export type CombatAttributes = {
    rawConstitution: number;
    rawStrength: number;
    rawAgility: number;
    rawAchre: number;
    rawCaeren: number;
    rawKyosir: number;

    rawConMod: number;
    rawStrMod: number;
    rawAgiMod: number;
    rawAchMod: number;
    rawCaerMod: number;
    rawKyoMod: number;
    
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

// const actionMultipliers: { [key: string]: { physical: number; magical: number } } = {
const actionMultipliers: { [key: string]: { physical: number; magical: number } } = {
    [ACTION_TYPES.ACHIRE]: { physical: DAMAGE.ONE_FIFTY, magical: DAMAGE.ONE_FIFTY },
    [ACTION_TYPES.ARC]: { physical: DAMAGE.THREE, magical: DAMAGE.THREE },
    [ACTION_TYPES.LEAP]: { physical: DAMAGE.ONE_FIFTY, magical: DAMAGE.ONE_FIFTY },
    [ACTION_TYPES.QUOR]: { physical: DAMAGE.THREE, magical: DAMAGE.THREE },
    [ACTION_TYPES.RUSH]: { physical: DAMAGE.ONE_FIFTY, magical: DAMAGE.ONE_FIFTY },
    [ACTION_TYPES.WRITHE]: { physical: DAMAGE.ONE_FIFTY, magical: DAMAGE.ONE_FIFTY },
    [ACTION_TYPES.STORM]: { physical: DAMAGE.NEG_LOW, magical: DAMAGE.NEG_LOW },
    [ACTION_TYPES.THRUST]: { physical: DAMAGE.NEG_LOW, magical: DAMAGE.NEG_LOW },
    // [ACTION_TYPES.ROLL]: combat.rollSuccess
    //     ? { physical: DAMAGE.MID, magical: DAMAGE.MID }
    //     : { physical: DAMAGE.NEG_HIGH, magical: DAMAGE.NEG_HIGH }
};


// ====================================== HELPERS ====================================== \\

export function roundToTwoDecimals(num: number, dec: number = 2): number {
    const roundedNum = Number(num.toFixed(dec));
    if (roundedNum.toString().match(/\.\d{3,}$/)) {
        return parseFloat(roundedNum.toString());
    };
    return roundedNum;
};

export function caerenic(caer: { active: boolean, enhanced: boolean, optimized: boolean }): { pos: number, neg: number } {
    const pos = caer.active ? caer.enhanced ? DAMAGE.CAERENIC_POS_EN : DAMAGE.CAERENEIC_POS : 1;
    const neg = caer.active ? caer.optimized ? DAMAGE.CAERENIC_NEG_OP : DAMAGE.CAERENEIC_NEG : 1; 
    return { pos, neg };
};

export function stalwart(stal: {active: boolean, enhanced: boolean, optimized: boolean}): number {
    return stal.active ? stal.optimized ? DAMAGE.STALWART_EN : DAMAGE.STALWART : 1;
};

export function damageTypeCompiler(damageType: string, enemy: Ascean, weapon: Equipment, physicalDamage: number, magicalDamage: number): { physicalDamage: number, magicalDamage: number } {
    if (damageType === DAMAGE_TYPES.BLUNT || damageType === DAMAGE_TYPES.FIRE || damageType === DAMAGE_TYPES.EARTH || damageType === DAMAGE_TYPES.SPOOKY) {
        if (weapon.attackType === ATTACK_TYPES.PHYSICAL) {
            if (enemy.helmet.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.FIFTEEN;
            } else if (enemy.helmet.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.EIGHT;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.NINETY_TWO;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.EIGHTY_FIVE;
            };

            if (enemy.chest.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.TEN;
            } else if (enemy.chest.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.NINETY_FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.NINETY;
            };

            if (enemy.legs.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.FIVE;
            } else if (enemy.legs.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.THREE;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.NINETY_SEVEN;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.NINETY_FIVE;
            };
        };
        if (weapon.attackType === ATTACK_TYPES.MAGIC) {
            if (enemy.helmet.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.FIFTEEN;
            } else if (enemy.helmet.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.EIGHT;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.EIGHTY_FIVE;
            };

            if (enemy.chest.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.TEN;
            } else if (enemy.chest.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.NINETY_FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.NINETY;
            };

            if (enemy.legs.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.FIVE;
            } else if (enemy.legs.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.THREE;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.NINETY_SEVEN;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.NINETY_FIVE;
            };
        };
    };
    if (damageType === DAMAGE_TYPES.PIERCE || damageType === DAMAGE_TYPES.LIGHTNING || damageType === DAMAGE_TYPES.FROST || damageType === DAMAGE_TYPES.RIGHTEOUS) {
        if (weapon.attackType === ATTACK_TYPES.PHYSICAL) {
            if (enemy.helmet.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.EIGHTY_FIVE;
            } else if (enemy.helmet.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.NINETY_TWO;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.EIGHT;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.FIFTEEN;
            };

            if (enemy.chest.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.NINETY;
            } else if (enemy.chest.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.NINETY_FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.TEN;
            };

            if (enemy.legs.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.NINETY_FIVE;
            } else if (enemy.legs.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.NINETY_SEVEN;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.THREE;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.FIVE;
            };
        };
        if (weapon.attackType === ATTACK_TYPES.MAGIC) {
            if (enemy.helmet.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.EIGHTY_FIVE;
            } else if (enemy.helmet.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.EIGHT;
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.FIFTEEN;
            };

            if (enemy.chest.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.NINETY;
            } else if (enemy.chest.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.NINETY_FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.FIVE;
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.TEN;
            };

            if (enemy.legs.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.NINETY_FIVE;
            } else if (enemy.legs.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.NINETY_SEVEN;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.THREE;
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.FIVE;
            };
        };
    };
    if (damageType === DAMAGE_TYPES.SLASH || damageType === DAMAGE_TYPES.WIND || damageType === DAMAGE_TYPES.SORCERY || damageType === DAMAGE_TYPES.WILD) {
        if (weapon.attackType === ATTACK_TYPES.PHYSICAL) {
            if (enemy.helmet.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.NINETY + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.helmet.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.NINETY_FIVE + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.NINETY_SEVEN + (Math.random() * ARMORS.RANDOM);
            };
    
            if (enemy.chest.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.NINETY + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.chest.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.NINETY_FIVE + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.NINETY_SEVEN + (Math.random() * ARMORS.RANDOM);
            };
    
            if (enemy.legs.type === DEFENSE_TYPES.PLATE_MAIL) {
                physicalDamage *= ARMORS.NINETY + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.legs.type === DEFENSE_TYPES.CHAIN_MAIL) {
                physicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_MAIL) {
                physicalDamage *= ARMORS.NINETY_FIVE + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                physicalDamage *= ARMORS.NINETY_SEVEN + (Math.random() * ARMORS.RANDOM);
            };
        };
        if (weapon.attackType === ATTACK_TYPES.MAGIC) {
            if (enemy.helmet.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.helmet.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.helmet.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            };

            if (enemy.chest.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.chest.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.chest.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            };

            if (enemy.legs.type === DEFENSE_TYPES.PLATE_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.legs.type === DEFENSE_TYPES.CHAIN_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_MAIL) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            } else if (enemy.legs.type === DEFENSE_TYPES.LEATHER_CLOTH) {
                magicalDamage *= ARMORS.NINETY_TWO + (Math.random() * ARMORS.RANDOM);
            };
        };
    };
    return { physicalDamage, magicalDamage };
};

export function criticalCompiler(player: boolean, ascean: Ascean, critChance: number, critClearance: number, weapon: Equipment, physicalDamage: number, magicalDamage: number, _weather: string, glancingBlow: boolean, criticalSuccess: boolean, isSeering: boolean = false):{ criticalSuccess: boolean, glancingBlow: boolean, physicalDamage: number, magicalDamage: number, isSeering: boolean } {
    // if (weather === "Alluring Isles") critChance -= 10;
    // if (weather === "Astralands") critChance += 10;
    // if (weather === "Kingdom") critChance += 5;
    if (player === true) {
        if (critChance >= critClearance || isSeering === true) {
            physicalDamage *= weapon.criticalDamage;
            magicalDamage *= weapon.criticalDamage;
            criticalSuccess = true;
            isSeering = false;
        } else {
            const skills = ascean.skills;
            let skill: number = 1;
            if (weapon.type === "Ancient Shard") {
                skill = skills[weapon.damageType?.[0] as keyof typeof skills];
            } else {
                skill = skills[weapon.type as keyof typeof skills];
            };
            const modifier = skill / (ascean.level * 100);
            const glancing = critClearance / 100;
            if (glancing >= modifier) {
                glancingBlow = true;
                physicalDamage *= (1 - glancing); 
                magicalDamage *= (1 - glancing); 
            };
        };
    } else {
        if (critChance >= critClearance) {
            physicalDamage *= weapon.criticalDamage;
            magicalDamage *= weapon.criticalDamage;
            criticalSuccess = true;
        } else if (critClearance > critChance + ascean.level + 80) {
            physicalDamage *= 0.1;
            magicalDamage *= 0.1;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 75) {
            physicalDamage *= 0.15;
            magicalDamage *= 0.15;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 70) {
            physicalDamage *= 0.2;
            magicalDamage *= 0.2;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 65) {
            physicalDamage *= 0.25;
            magicalDamage *= 0.25;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 60) {
            physicalDamage *= 0.3;
            magicalDamage *= 0.3;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 55) {
            physicalDamage *= 0.35;
            magicalDamage *= 0.35;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 50) {
            physicalDamage *= 0.4;
            magicalDamage *= 0.4;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 45) {
            physicalDamage *= 0.45;
            magicalDamage *= 0.45;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 40) {
            physicalDamage *= 0.5;
            magicalDamage *= 0.5;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 35) {
            physicalDamage *= 0.55;
            magicalDamage *= 0.55;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 30) {
            physicalDamage *= 0.6;
            magicalDamage *= 0.6;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 25) {
            physicalDamage *= 0.65;
            magicalDamage *= 0.65;
            glancingBlow = true;
        } else if (critClearance > critChance + ascean.level + 20) {
            physicalDamage *= 0.7;
            magicalDamage *= 0.7;
            glancingBlow = true;
        };
    };
    return { criticalSuccess, glancingBlow, physicalDamage, magicalDamage, isSeering };
}; 

export function penetrationCompiler(defense: number, penetration: number): number {
    return 1 - (defense - penetration) / 100;
};

function phaserActionConcerns(action: string): boolean {
    return STRONG_ATTACKS.includes(action);
};

function phaserSuccessConcerns(parrySuccess: boolean, rollSuccess: boolean, computerParrySuccess: boolean, computerRollSuccess: boolean): boolean {
    return parrySuccess || rollSuccess || computerParrySuccess || computerRollSuccess;
};

// function weatherEffectCheck(weapon: Equipment, magDam: number, physDam: number, weather: string, critical: boolean): { magicalDamage: number, physicalDamage: number } {
//     let magicalDamage = magDam;
//     let physicalDamage = physDam;
//     switch (weather) {
//         case "Alluring Isles":
//             if (weapon.type === WEAPON_TYPES.BOW || weapon.type === WEAPON_TYPES.GREATBOW) {
//                 physicalDamage *= DAMAGE.LOW;
//                 magicalDamage *= DAMAGE.LOW;
//             };
//             break;
//         case "Astralands":
//             magicalDamage *= DAMAGE.LOW;
//             physicalDamage *= DAMAGE.LOW;
//             break;
//         case "Fangs": 
//             if (weapon.attackType === ATTACK_TYPES.PHYSICAL) {
//                 if (weapon.type !== WEAPON_TYPES.BOW && weapon.type !== WEAPON_TYPES.GREATBOW) {
//                     physicalDamage *= DAMAGE.LOW; // +10% Physical Melee Damage
//                 } else {
//                     physicalDamage *= DAMAGE.NEG_HIGH; // -10% Physical Ranged Damage
//                 };
//             } else {
//                 if (weapon?.damageType?.includes(DAMAGE_TYPES.FIRE) || weapon?.damageType?.includes(DAMAGE_TYPES.FROST) || weapon?.damageType?.includes(DAMAGE_TYPES.EARTH) || weapon?.damageType?.includes(DAMAGE_TYPES.WIND) || weapon?.damageType?.includes(DAMAGE_TYPES.LIGHTNING) || weapon?.damageType?.includes(DAMAGE_TYPES.WILD)) {
//                     magicalDamage *= DAMAGE.LOW; // +10% Magical Damage
//                 };
//             };
//             if (weapon?.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.LOW; // +10% Magical Damage
//             };
//             break;
//         case "Firelands":
//             physicalDamage *= DAMAGE.LOW;
//             magicalDamage *= DAMAGE.LOW;
//             if (critical === true) {
//                 magicalDamage *= DAMAGE.HIGH;
//                 physicalDamage *= DAMAGE.HIGH;
//             };
//             break;
//         case "Kingdom":
//             physicalDamage *= DAMAGE.LOW;
//             if (weapon?.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.LOW;
//                 physicalDamage *= DAMAGE.LOW;
//             };
//             break;
//         case "Licivitas":
//             if (weapon?.influences?.[0] === DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.MID;
//                 physicalDamage *= DAMAGE.MID;
//             };
//             if (critical === true) {
//                 magicalDamage *= DAMAGE.HIGH;
//                 physicalDamage *= DAMAGE.HIGH;
//             };
//             break;
//         case "Sedyrus":
//             magicalDamage *= DAMAGE.LOW;
//             if (weapon?.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.LOW;
//                 physicalDamage *= DAMAGE.LOW;
//             };
//             if (weapon.type === WEAPON_TYPES.BOW || weapon.type === WEAPON_TYPES.GREATBOW) {
//                 physicalDamage *= DAMAGE.LOW;
//                 magicalDamage *= DAMAGE.LOW;
//             };
//             if (critical === true) {
//                 magicalDamage *= DAMAGE.LOW;
//                 physicalDamage *= DAMAGE.LOW;
//             };
//             break;
//         case "Soverains":
//             magicalDamage *= DAMAGE.LOW;
//             if (weapon.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.LOW;
//                 physicalDamage *= DAMAGE.LOW;
//             };
//             break;
//         default:
//             break;
//     };
//     return { magicalDamage, physicalDamage };
// };

function damageTick(combat: Combat, effect: StatusEffect, player: boolean): Combat {
    const caer = caerenic(combat.caerenic);
    if (player) {
        const playerDamage = effect.effect.damage as number * DAMAGE.TICK_FULL * caer.pos;
        combat.newComputerHealth -= playerDamage;
        if (combat.newComputerHealth < 0) {
            combat.newComputerHealth = 0;
            combat.computerWin = false;
            combat.playerWin = true;
        };
        combat.playerSpecialDescription = `${combat.computer?.name} is damaged for ${Math.round(playerDamage)} from your ${effect.name}.`;
    } else {
        const computerDamage = effect.effect.damage as number * DAMAGE.TICK_FULL * caer.neg;
        combat.newPlayerHealth -= computerDamage;
        if (combat.newPlayerHealth < 0) {
            if (combat.playerEffects.find(effect => effect.prayer === PRAYERS.DENIAL)) {
                combat.newPlayerHealth = 1;
                combat.playerEffects = combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== PRAYERS.DENIAL);
            } else {
                combat.newPlayerHealth = 0;
                combat.computerWin = true;
                combat.playerWin = false;
            };
        };
        combat.computerSpecialDescription = `You are damaged for ${Math.round(computerDamage)} from ${combat.computer?.name}'s ${effect.name}.`;
    };
    return combat;
};

function healTick(combat: Combat, effect:StatusEffect, player: boolean): Combat {
    const caer = caerenic(combat.caerenic);
    if (player) {
        const playerHeal = effect.effect.healing as number * DAMAGE.TICK_FULL * caer.pos;
        combat.newPlayerHealth = Math.min(playerHeal + combat.newPlayerHealth, combat.playerHealth);
        combat.playerSpecialDescription = `You heal for ${Math.round(playerHeal)} from your ${effect.name}.`;
        if (combat.newPlayerHealth > 0) combat.computerWin = false;
    } else {
        const computerHeal = effect.effect.healing as number * DAMAGE.TICK_FULL * caer.pos;
        combat.newComputerHealth = Math.min(computerHeal + combat.newComputerHealth, combat.computerHealth);
        combat.computerSpecialDescription = `${combat.computer?.name} heals for ${Math.round(computerHeal)} from their ${effect.name}.`;
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
            if (effect.prayer === PRAYERS.BUFF) { // Reverses the Buff Effect to the magnitude of the stack to the proper weapon
                const deBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingWeaponIndex] as Equipment, false);
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
                combat.playerDefense = deBuff.defense;
            };
            if (effect.prayer === PRAYERS.DEBUFF) { // Revereses the Debuff Effect to the proper weapon
                const reBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingDebuffTargetIndex] as Equipment, true);
                combat.weapons[matchingDebuffTargetIndex] = reBuff.weapon;
                combat.playerDefense = reBuff.defense;
            };
            if (effect.prayer === PRAYERS.INSIGHT) {
                combat.isInsight = false;
            };
            if (effect.prayer === PRAYERS.QUICKEN) {
                combat.isQuicken = false;
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
            if (effect.prayer === PRAYERS.BUFF) { // Reverses the Buff Effect to the magnitude of the stack to the proper weapon
                const deBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingWeaponIndex], false);
                combat.computerWeapons[matchingWeaponIndex] = deBuff.weapon;
                combat.computerDefense = deBuff.defense;
            };
            if (effect.prayer === PRAYERS.DEBUFF) { // Revereses the Debuff Effect to the proper weapon
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
    const desc = index === 0 ? "" : "Two"
    if (name === "player") {
        const blessing = combat.playerBlessing;
        combat.prayerData.push(blessing);
        combat.deityData.push(weapon.influences?.[0] as string);
        combat.religiousSuccess = true;
        const negativeEffect = blessing === PRAYERS.DAMAGE || blessing === PRAYERS.DEBUFF;
        let exists: StatusEffect | undefined;
        if (negativeEffect === true) {
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
            if (exists.prayer === PRAYERS.BUFF) {
                const buff = applyEffect(exists, combat.playerDefense as Defense, weapon, true);
                combat.playerDefense = buff.defense;
                weapon = buff.weapon;
            };
            if (exists.prayer === PRAYERS.DAMAGE) damageTick(combat, exists, true);
            if (exists.prayer === PRAYERS.DISPEL) {
                if (combat.computerEffects.length > 0) computerDispel(combat); 
                combat.playerEffects.pop();
            };
            if (exists.prayer === PRAYERS.INSIGHT) {
                combat.isInsight = true;
            };
            if (exists.prayer === PRAYERS.QUICKEN) {
                combat.isQuicken = true;
            };
            if (exists.prayer === PRAYERS.DEBUFF) {
                const debuff = applyEffect(exists, combat.computerDefense as Defense, combat.computerWeapons[0], false);
                combat.computerDefense = debuff.defense;
                weapon = debuff.weapon;
            };
            if (exists.prayer === PRAYERS.HEAL) healTick(combat, exists, true);
            combat[`playerInfluenceDescription${desc}`] = exists.description;
        } else {
            if (exists.stacks) {
                exists = StatusEffect.updateEffectStack(exists, combat, combat.player as Ascean, weapon);
                combat[`playerInfluenceDescription${desc}`] = `${exists.description} Stacked ${exists.activeStacks} times.`; 
                if (exists.prayer === PRAYERS.BUFF) {
                    const buff = applyEffect(exists, combat.computerDefense as Defense, weapon, true);
                    combat.playerDefense = buff.defense;
                    weapon = buff.weapon;
                };
                if (exists.prayer === PRAYERS.DAMAGE) damageTick(combat, exists, true);
            }; 
            if (exists.refreshes) {
                exists.duration = Math.floor(combat?.player?.level as number / 3 + 1) > 6 ? 6 : Math.floor(combat?.player?.level as number / 3 + 1);
                exists.tick.end += exists.duration;
                exists.endTime += 6;
                exists.activeRefreshes += 1;
                if (exists.prayer === PRAYERS.HEAL) healTick(combat, exists, true);
                combat[`playerInfluenceDescription${desc}`] = `${exists.description} Refreshed ${exists.activeRefreshes} time(s).`;
            };
        };
    } else { // Computer Effect
        const blessing = combat.computerBlessing;
        combat.computerReligiousSuccess = true;
        const negativeEffect = blessing === PRAYERS.DAMAGE || blessing === PRAYERS.DEBUFF;
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
            if (exists.prayer === PRAYERS.BUFF) {
                const buff = applyEffect(exists, combat.computerDefense as Defense, weapon, true);
                combat.computerDefense = buff.defense;
                weapon = buff.weapon;
            };
            if (exists.prayer === PRAYERS.DAMAGE) damageTick(combat, exists, false);
            if (exists.prayer === PRAYERS.DEBUFF) {
                const debuff = applyEffect(exists, combat.playerDefense as Defense, combat.weapons?.[0] as Equipment, false);
                combat.computerDefense = debuff.defense;
                weapon = debuff.weapon;
            };
            if (exists.prayer === PRAYERS.HEAL) healTick(combat, exists, false);
            
            combat[`computerInfluenceDescription${desc}`] = exists.description;
        } else {
            if (exists.stacks) {
                exists = StatusEffect.updateEffectStack(exists, combat, combat.computer as Ascean, weapon);
                combat[`computerInfluenceDescription${desc}`] = `${exists.description} Stacked ${exists.activeStacks} times.`;
                if (exists.prayer === PRAYERS.BUFF) {
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
    if (player.faith === "Devoted" && weaponOne?.influences?.[0] === DEITIES.DAETHOS) faithOne += 3;
    if (player.faith === "Adherent" && weaponOne?.influences?.[0] !== DEITIES.DAETHOS) faithOne += 3;
    if (player.faith === "Devoted" && weaponTwo?.influences?.[0] === DEITIES.DAETHOS) faithTwo += 3;
    if (player.faith === "Adherent" && weaponTwo?.influences?.[0] !== DEITIES.DAETHOS) faithTwo += 3;
    const addRarity = (rarity: string, faith: number): number => {
        faith += FAITH_RARITY[rarity as keyof typeof FAITH_RARITY]; 
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
    if (combat.playerWin === true || combat.computerWin === true || combat.playerBlessing === "") return combat;
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
    const computerFaith = faithModCompiler(combat.computer as Ascean, computerFaithNumber, combat.computerWeapons[0], computerFaithNumberTwo, combat.computerWeapons[1], combat.computer?.amulet?.influences?.[0] as string, combat.computer?.trinket?.influences?.[0] as string);
    if (playerFaith.faithOne > 95) {
        combat.actionData.push("prayer");
        faithSuccess(combat, "player", combat.weapons[0] as Equipment, 0);
    };
    if (combat.dualWielding === true && playerFaith.faithTwo > 95) {
        combat.actionData.push("prayer");    
        faithSuccess(combat, "player", combat.weapons[1] as Equipment, 1);
    };
    if (!combat.playerEffects.find(effect => effect.prayer === "Silence")) {
        if (computerFaith.faithOne > 95) {
            faithSuccess(combat, "computer", combat.computerWeapons[0], 0);
        };
        if (combat.computerDualWielding === true && computerFaith.faithTwo > 95) {
            faithSuccess(combat, "computer", combat.computerWeapons[1], 1);
        };
    };
    return combat;
};

// ================================= COMPUTER COMPILER FUNCTIONS ================================== \\
// function computerActionCompiler(combat: Combat, playerAction: string): Combat {
//     if (combat.sessionRound > 50) {
//         combat.sessionRound = 0;
//         combat.attackWeight = 0;
//         combat.parryWeight = 0;
//         combat.postureWeight = 0;
//         combat.rollWeight = 0;
//         combat.thrustWeight = 0;
//         combat.parryAttackWeight = 0;
//         combat.parryParryWeight = 0;
//         combat.parryPostureWeight = 0;
//         combat.parryRollWeight = 0;
//         combat.parryThrustWeight = 0;
//     };
//     const computerActions = {
//         attack: 50 + combat.attackWeight,
//         parry: 10 + combat.parryWeight,
//         posture: 15 + combat.postureWeight,
//         roll: 15 + combat.rollWeight,
//         thrust: 10 + combat.thrustWeight,
//         parryAttack: 20 + combat.parryAttackWeight,
//         parryParry: 20 + combat.parryParryWeight,
//         parryPosture: 20 + combat.parryPostureWeight,
//         parryRoll: 20 + combat.parryRollWeight,
//         parryThrust: 20 + combat.parryThrustWeight,
//         rollRating: combat.computerWeapons[0].roll,
//         armorRating: (combat?.computerDefense?.physicalPosture  as number) + (combat?.computerDefense?.magicalPosture  as number)  /  4,
//     };

//     if (playerAction === ACTION_TYPES.ATTACK) { 
//         if (computerActions.rollRating > computerActions.armorRating) {
//             combat.rollWeight += 1.5;
//             combat.postureWeight += 0.5;
//         } else {
//             combat.postureWeight += 1.5;
//             combat.rollWeight += 0.5;
//         };
//         combat.parryWeight += 1;
//         combat.thrustWeight -= 1;
//         combat.parryAttackWeight += 2;
//         combat.parryThrustWeight += 1;
//         combat.parryParryWeight -= 1;
//         combat.parryPostureWeight -= 1;
//         combat.parryRollWeight -= 1;
//     };
//     if (playerAction === ACTION_TYPES.PARRY) { 
//         combat.parryWeight -= 2;
//         combat.attackWeight += 2;
//         combat.parryParryWeight += 2;
//         combat.parryAttackWeight -= 1;
//     };
//     if (playerAction === ACTION_TYPES.POSTURE) { 
//         combat.rollWeight -= 1;
//         combat.parryWeight += 1;
//         combat.parryPostureWeight += 1;
//         combat.parryRollWeight -= 1;
//     };

//     if (playerAction === ACTION_TYPES.ROLL) { 
//         combat.postureWeight -= 1;
//         combat.parryWeight += 1;
//         combat.parryRollWeight += 3;
//         combat.parryPostureWeight -= 2;
//         combat.parryAttackWeight -= 1;
//     };

//     if (playerAction === ACTION_TYPES.THRUST) { 
//         combat.attackWeight -= 1;
//         combat.parryWeight += 1;
//         combat.parryThrustWeight += 3;
//         combat.parryPostureWeight -= 1;
//         combat.parryAttackWeight -= 1;
//         combat.parryRollWeight -= 1;
//     };
//     return combat;
// };

function computerDualWieldCompiler(combat: Combat, playerPhysicalDefense: number, playerMagicalDefense: number): Combat { // Triggers if 40+ Str/Caer for 2h, 1h + Agi/Achre Mastery and 2nd weapon is 1h
    const computer = combat.computer;
    const weapons = combat.computerWeapons;
    const computerAction = combat.computerAction;
    const caer = caerenic(combat.caerenic);
    const stal = stalwart(combat.stalwart);
    let computerWeaponOnePhysicalDamage: number = weapons[0].physicalDamage;
    let computerWeaponOneMagicalDamage: number = weapons[0].magicalDamage;
    let computerWeaponTwoPhysicalDamage: number = weapons[1].physicalDamage;
    let computerWeaponTwoMagicalDamage: number = weapons[1].magicalDamage;
    let computerWeaponOneTotalDamage: number = 0;
    let computerWeaponTwoTotalDamage: number = 0;
    let firstWeaponCrit: boolean = false;
    let secondWeaponCrit: boolean = false;

    const weapOneClearance: number = Math.floor(Math.random() * 101);
    const weapTwoClearance: number = Math.floor(Math.random() * 101);
    let weapOneCrit: number = weapons[0].criticalChance;
    let weapTwoCrit: number = weapons[1].criticalChance;
    weapOneCrit -= (combat?.playerAttributes?.kyosirMod as number / 2);
    weapTwoCrit -= (combat?.playerAttributes?.kyosirMod as number / 2);

    const resultOne = criticalCompiler(false, combat.computer as Ascean, weapOneCrit, weapOneClearance, weapons[0], computerWeaponOnePhysicalDamage, computerWeaponOneMagicalDamage, combat.weather, combat.computerGlancingBlow, combat.computerCriticalSuccess);
    combat.computerGlancingBlow = resultOne.glancingBlow;
    combat.computerCriticalSuccess = resultOne.criticalSuccess;
    computerWeaponOnePhysicalDamage = resultOne.physicalDamage;
    computerWeaponOneMagicalDamage = resultOne.magicalDamage;
    if (weapOneCrit >= weapOneClearance) firstWeaponCrit = true;

    const resultTwo = criticalCompiler(false, combat.computer as Ascean, weapTwoCrit, weapTwoClearance, weapons[1], computerWeaponTwoPhysicalDamage, computerWeaponTwoMagicalDamage, combat.weather, combat.computerGlancingBlow, combat.computerCriticalSuccess);
    combat.computerGlancingBlow = resultTwo.glancingBlow;
    combat.computerCriticalSuccess = resultTwo.criticalSuccess;
    computerWeaponTwoPhysicalDamage = resultTwo.physicalDamage;
    computerWeaponTwoMagicalDamage = resultTwo.magicalDamage;
    if (weapTwoCrit >= weapTwoClearance) secondWeaponCrit = true;
    
    computerWeaponOnePhysicalDamage *= penetrationCompiler(playerPhysicalDefense, weapons[0].physicalPenetration as number);
    computerWeaponOneMagicalDamage *= penetrationCompiler(playerMagicalDefense, weapons[0].magicalPenetration as number);
    computerWeaponTwoPhysicalDamage *= penetrationCompiler(playerPhysicalDefense, weapons[1].physicalPenetration as number);
    computerWeaponTwoMagicalDamage *= penetrationCompiler(playerMagicalDefense, weapons[1].magicalPenetration as number);

    const damageType = damageTypeCompiler(combat.computerDamageType, combat.player as Ascean, weapons[0], computerWeaponOnePhysicalDamage, computerWeaponOneMagicalDamage);
    computerWeaponOnePhysicalDamage = damageType.physicalDamage;
    computerWeaponOneMagicalDamage = damageType.magicalDamage;

    const damageTypeTwo = damageTypeCompiler(combat.computerDamageType, combat.player as Ascean, weapons[1], computerWeaponTwoPhysicalDamage, computerWeaponTwoMagicalDamage);
    computerWeaponTwoPhysicalDamage = damageTypeTwo.physicalDamage;
    computerWeaponTwoMagicalDamage = damageTypeTwo.magicalDamage;

    // =============== WEATHER EFFECTS ================ \\
    // const weatherResult = weatherEffectCheck(weapons[0], computerWeaponOneMagicalDamage, computerWeaponOnePhysicalDamage, combat.weather, firstWeaponCrit);
    // computerWeaponOnePhysicalDamage = weatherResult.physicalDamage;
    // computerWeaponOneMagicalDamage = weatherResult.magicalDamage;

    // const weatherResultTwo = weatherEffectCheck(weapons[1], computerWeaponTwoMagicalDamage, computerWeaponTwoPhysicalDamage, combat.weather, secondWeaponCrit);
    // computerWeaponTwoPhysicalDamage = weatherResultTwo.physicalDamage;
    // computerWeaponTwoMagicalDamage = weatherResultTwo.magicalDamage;
    // =============== WEATHER EFFECTS ================ \\

    computerWeaponOneTotalDamage = computerWeaponOnePhysicalDamage + computerWeaponOneMagicalDamage;
    computerWeaponTwoTotalDamage = computerWeaponTwoPhysicalDamage + computerWeaponTwoMagicalDamage;

    combat.realizedComputerDamage = computerWeaponOneTotalDamage + computerWeaponTwoTotalDamage;
    if (combat.realizedComputerDamage < 0) combat.realizedComputerDamage = 0;

    let strength = combat?.computerAttributes?.totalStrength as number + weapons[0].strength  + weapons[1].strength;
    let agility = combat?.computerAttributes?.totalAgility as number + weapons[0].agility  + weapons[1].agility;
    let achre = combat?.computerAttributes?.totalAchre as number + weapons[0].achre  + weapons[1].achre;
    let caeren = combat?.computerAttributes?.totalCaeren as number + weapons[0].caeren  + weapons[1].caeren;

    if (weapons[0].grip === HOLD_TYPES.ONE_HAND) {
        if (weapons[0].attackType === ATTACK_TYPES.PHYSICAL) {
            combat.realizedComputerDamage *= (agility / 100);
        } else {
            combat.realizedComputerDamage *= (achre / 100);
        };
    };
    if (weapons[0].grip === HOLD_TYPES.TWO_HAND) {
        if (weapons[0].attackType === ATTACK_TYPES.PHYSICAL) {
            combat.realizedComputerDamage *= (strength / 150); 
        } else {
            combat.realizedComputerDamage *= (caeren / 150);
        };
    };
    if (computerAction === ACTION_TYPES.ATTACK) combat.realizedComputerDamage *= DAMAGE.LOW;    
    if (computerAction === ACTION_TYPES.POSTURE) combat.realizedComputerDamage *= DAMAGE.NEG_HIGH;
    if (computerAction === ACTION_TYPES.ACHIRE) combat.realizedComputerDamage *= DAMAGE.ONE_FIFTY;
    if (computerAction === ACTION_TYPES.QUOR) combat.realizedComputerDamage *= DAMAGE.THREE;
    if (computerAction === ACTION_TYPES.LEAP) combat.realizedComputerDamage *= DAMAGE.ONE_FIFTY;
    if (computerAction === ACTION_TYPES.RUSH) combat.realizedComputerDamage *= DAMAGE.ONE_FIFTY;
    if (computerAction === ACTION_TYPES.WRITHE) combat.realizedComputerDamage *= DAMAGE.ONE_FIFTY;
    if (combat.prayerData.includes(PRAYERS.AVARICE)) combat.realizedComputerDamage *= DAMAGE.LOW;
    combat.realizedComputerDamage *= stal;
    combat.realizedComputerDamage *= caer.neg;
    if (combat.berserk.active === true) combat.berserk.charges += 1;
    combat.newPlayerHealth -= combat.realizedComputerDamage;
    if (combat.newPlayerHealth < 0) {
        if (combat.playerEffects.find(effect => effect.prayer === PRAYERS.DENIAL)) {
            combat.newPlayerHealth = 1;
            combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== PRAYERS.DENIAL);
        } else {
            combat.newPlayerHealth = 0;
            combat.computerWin = true;
        };
    };
    combat.computerActionDescription = `${computer?.name} dual-wield ${ENEMY_ATTACKS[combat.computerAction as keyof typeof ENEMY_ATTACKS]} you with ${weapons[0].name} and ${weapons[1].name} for ${Math.round(combat.realizedComputerDamage)} ${combat.computerDamageType} and ${weapons[1].damageType?.[0] ? weapons[1].damageType[0] : ""}${weapons[1]?.damageType?.[1] ? " / " + weapons[1].damageType?.[1] : ""} ${firstWeaponCrit === true && secondWeaponCrit === true ? "damage (Critical)" : firstWeaponCrit === true || secondWeaponCrit === true ? "damage (Partial Critical)" : combat.computerGlancingBlow === true ? "damage (Glancing)" : "damage"}.`;
    return combat;
};

function computerAttackCompiler(combat: Combat, computerAction: string): Combat {
    if (combat.playerWin === true) return combat;
    let computerTotalDamage: number = 0;
    let computerPhysicalDamage: number = combat.computerWeapons[0].physicalDamage, computerMagicalDamage: number = combat.computerWeapons[0].magicalDamage;
    let playerPhysicalDefense = combat.playerDefense?.physicalDefenseModifier as number, playerMagicalDefense = combat.playerDefense?.magicalDefenseModifier as number;
    const caer = caerenic(combat.caerenic);
    const stal = stalwart(combat.stalwart);
    if ((combat.action === ACTION_TYPES.POSTURE || combat.stalwart.active) && combat.computerParrySuccess !== true && combat.computerRollSuccess !== true) {
        playerPhysicalDefense = combat.playerDefense?.physicalPosture as number;
        playerMagicalDefense = combat.playerDefense?.magicalPosture as number;
    };
    if (computerAction === ACTION_TYPES.ATTACK || computerAction === ACTION_TYPES.LEAP || computerAction === ACTION_TYPES.RUSH || computerAction === ACTION_TYPES.WRITHE) {
        if (combat.computerWeapons[0].grip === HOLD_TYPES.ONE_HAND) {
            if (combat.computerWeapons[0].attackType === ATTACK_TYPES.PHYSICAL) {
                if (combat.computer?.mastery === MASTERY.AGILITY || combat.computer?.mastery === MASTERY.CONSTITUTION) {
                    if (combat.computerAttributes?.totalAgility as number >= THRESHOLD.ONE_HAND) {
                        if (combat.computerWeapons[1].grip === HOLD_TYPES.ONE_HAND) {
                           combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefense, playerMagicalDefense);
                            return combat;
                        } else {
                            computerPhysicalDamage *= DAMAGE.HIGH;
                            computerMagicalDamage *= DAMAGE.MID;
                        };
                    } else {
                        computerPhysicalDamage *= DAMAGE.HIGH;
                        computerMagicalDamage *= DAMAGE.MID;
                    };
                } else {
                    computerPhysicalDamage *= DAMAGE.LOW;
                    computerMagicalDamage *= DAMAGE.LOW;
                };
            };
            if (combat.computerWeapons[0].attackType === ATTACK_TYPES.MAGIC) {
                if (combat.computer?.mastery === MASTERY.ACHRE || combat.computer?.mastery === MASTERY.KYOSIR) {
                    if (combat.computerAttributes?.totalAchre as number >= THRESHOLD.ONE_HAND) {
                        if (combat.computerWeapons[1].grip === HOLD_TYPES.ONE_HAND) {
                            combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefense, playerMagicalDefense);
                            return combat;
                        } else {
                            computerPhysicalDamage *= DAMAGE.MID;
                            computerMagicalDamage *= DAMAGE.HIGH;
                        };
                    } else {
                        computerPhysicalDamage *= DAMAGE.MID;
                        computerMagicalDamage *= DAMAGE.HIGH;
                    };
                } else {
                    computerPhysicalDamage *= DAMAGE.LOW;
                    computerMagicalDamage *= DAMAGE.LOW;
                };
            };
        };
        if (combat.computerWeapons[0].grip === HOLD_TYPES.TWO_HAND) {
            if (combat.computerWeapons[0].attackType === ATTACK_TYPES.PHYSICAL && combat.computerWeapons[0].type !== WEAPON_TYPES.BOW && combat.computerWeapons[0].type !== WEAPON_TYPES.GREATBOW) {
                if (combat.computer?.mastery === MASTERY.STRENGTH || combat.computer?.mastery === MASTERY.CONSTITUTION) {
                    if (combat.computerAttributes?.totalStrength as number >= THRESHOLD.TWO_HAND) {
                        if (combat.computerWeapons[1].type !== WEAPON_TYPES.BOW) {
                            combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefense, playerMagicalDefense);
                            return combat;
                        } else { 
                            computerPhysicalDamage *= DAMAGE.HIGH;
                            computerMagicalDamage *= DAMAGE.MID;
                        };
                    } else { 
                        computerPhysicalDamage *= DAMAGE.HIGH;
                        computerMagicalDamage *= DAMAGE.MID;
                    };
                } else {
                    computerPhysicalDamage *= DAMAGE.LOW;
                    computerMagicalDamage *= DAMAGE.LOW;
                };
            };
            if (combat.computerWeapons[0].attackType === ATTACK_TYPES.MAGIC) {
                if (combat.computer?.mastery === MASTERY.CAEREN || combat.computer?.mastery === MASTERY.KYOSIR) {
                    if (combat.computerAttributes?.totalCaeren as number >= THRESHOLD.TWO_HAND) {
                        if (combat.computerWeapons[1].type !== WEAPON_TYPES.BOW) {
                            combat.computerDualWielding = true;
                            computerDualWieldCompiler(combat, playerPhysicalDefense, playerMagicalDefense);
                            return combat;
                        } else {
                            computerPhysicalDamage *= DAMAGE.MID;
                            computerMagicalDamage *= DAMAGE.HIGH;
                        };
                    } else {
                        computerPhysicalDamage *= DAMAGE.MID;
                        computerMagicalDamage *= DAMAGE.HIGH;
                    };
                } else {
                    computerPhysicalDamage *= DAMAGE.LOW;
                    computerMagicalDamage *= DAMAGE.LOW;
                };
            };
            if (combat.computerWeapons[0].type === WEAPON_TYPES.BOW || combat.computerWeapons[0].type === WEAPON_TYPES.GREATBOW) {
                computerPhysicalDamage *= DAMAGE.HIGH;
                computerMagicalDamage *= DAMAGE.HIGH; 
            };
        };
    };
    if (computerAction === ACTION_TYPES.ROLL ) {
        if (combat.computerRollSuccess === true) {
            computerPhysicalDamage *= DAMAGE.MID;
            computerMagicalDamage *= DAMAGE.MID;
        } else {
            computerPhysicalDamage *= DAMAGE.NEG_HIGH;
            computerMagicalDamage *= DAMAGE.NEG_HIGH;
        };
    };
    if (computerAction === ACTION_TYPES.POSTURE ) {
        computerPhysicalDamage *= DAMAGE.NEG_HIGH;
        computerMagicalDamage *= DAMAGE.NEG_HIGH;
    };
    if (computerAction === ACTION_TYPES.ACHIRE) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };
    if (computerAction === ACTION_TYPES.LEAP ) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };
    if (computerAction === ACTION_TYPES.QUOR) {
        computerPhysicalDamage *= DAMAGE.THREE;
        computerMagicalDamage *= DAMAGE.THREE;
    };
    if (computerAction === ACTION_TYPES.RUSH ) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };
    if (computerAction === ACTION_TYPES.THRUST ) {
        computerPhysicalDamage *= DAMAGE.NEG_LOW;
        computerMagicalDamage *= DAMAGE.NEG_LOW;
    };
    if (computerAction === ACTION_TYPES.WRITHE ) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };
    const criticalClearance = Math.floor(Math.random() * 101);
    let criticalChance = combat.computerWeapons[0].criticalChance;
    criticalChance -= (combat.playerAttributes?.kyosirMod as number / 2);
    // if (combat.weather === "Astralands") criticalChance += 10;
    const criticalResult = criticalCompiler(false, combat.computer as Ascean, criticalChance, criticalClearance, combat.computerWeapons[0], computerPhysicalDamage, computerMagicalDamage, combat.weather, combat.computerGlancingBlow, combat.computerCriticalSuccess);
    combat.computerGlancingBlow = criticalResult.glancingBlow;
    combat.computerCriticalSuccess = criticalResult.criticalSuccess;
    computerPhysicalDamage = criticalResult.physicalDamage;
    computerMagicalDamage = criticalResult.magicalDamage;
    const physicalPenetration = combat.computerWeapons?.[0].physicalPenetration as number;
    const magicalPenetration = combat.computerWeapons?.[0].magicalPenetration as number;
    computerPhysicalDamage *= penetrationCompiler(playerPhysicalDefense, physicalPenetration);
    computerMagicalDamage *= penetrationCompiler(playerMagicalDefense, magicalPenetration);
    const damageType = damageTypeCompiler(combat.computerDamageType, combat.player as Ascean, combat.computerWeapons[0], computerPhysicalDamage, computerMagicalDamage);
    computerPhysicalDamage = damageType.physicalDamage;
    computerMagicalDamage = damageType.magicalDamage;
    // const weatherResult = weatherEffectCheck(combat.computerWeapons[0], computerMagicalDamage, computerPhysicalDamage, combat.weather, combat.computerCriticalSuccess);
    // computerPhysicalDamage = weatherResult.physicalDamage;
    // computerMagicalDamage = weatherResult.magicalDamage; 
    computerTotalDamage = computerPhysicalDamage + computerMagicalDamage;
    if (computerTotalDamage < 0) computerTotalDamage = 0;
    combat.realizedComputerDamage = computerTotalDamage;
    if (combat.action === ACTION_TYPES.ATTACK) combat.realizedComputerDamage *= DAMAGE.LOW;
    if (combat.action === ACTION_TYPES.POSTURE) combat.realizedComputerDamage *= DAMAGE.NEG_HIGH;
    if (combat.prayerData.includes(PRAYERS.AVARICE)) combat.realizedComputerDamage *= DAMAGE.LOW;
    combat.realizedComputerDamage *= stal;
    combat.realizedComputerDamage *= caer.neg;
    if (combat.berserk.active === true) combat.berserk.charges += 1;
    combat.newPlayerHealth -= combat.realizedComputerDamage;
    combat.computerActionDescription = `${combat.computer?.name} ${ENEMY_ATTACKS[combat.computerAction as keyof typeof ENEMY_ATTACKS]} you with their ${combat.computerWeapons[0].name} for ${Math.round(computerTotalDamage)} ${combat.computerDamageType} ${combat.computerCriticalSuccess === true ? "damage (Critical)" : combat.computerGlancingBlow === true ? "damage (Glancing)" : "damage"}.`;
    if (combat.newPlayerHealth <= 0) {
        if (combat.playerEffects.find(effect => effect.prayer === PRAYERS.DENIAL)) {
            combat.newPlayerHealth = 1;
            combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== PRAYERS.DENIAL);
        } else {
            combat.newPlayerHealth = 0;
            combat.computerWin = true;
        };
    };
    if (combat.newPlayerHealth > 0) combat.computerWin = false;
    if (combat.newComputerHealth > 0) combat.playerWin = false;
    return combat;
}; 
    
function computerRollCompiler(combat: Combat, playerAction: string, computerAction: string): Combat {
    let computerRoll = combat.computerWeapons[0].roll;
    let rollCatch = Math.floor(Math.random() * 101) + (combat.playerAttributes?.kyosirMod as number);
    // if (combat.weather === "Alluring Isles") {
    //     computerRoll -= 10;
    // };
    // if (combat.weather === "Kingdom" || combat.weather === "Sedyrus") {
    //     computerRoll -= 5;
    // };
    // if (combat.weather === "Fangs" || combat.weather === "Roll") {
    //     computerRoll += 5;
    // };
    if (computerRoll > rollCatch && !combat.astrication.active) {
        combat.computerRollSuccess = true;
        combat.computerSpecialDescription = `${combat.computer?.name} successfully rolls against you, avoiding your ${playerAction === ACTION_TYPES.ATTACK ? "focused" : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } attack.`
        computerAttackCompiler(combat, computerAction);
    } else {
        combat.computerSpecialDescription = `${combat.computer?.name} fails to roll against your ${  playerAction === ACTION_TYPES.ATTACK ? "focused" : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } attack.`
        return combat;
    };
    return combat;
};

// ================================== PLAYER COMPILER FUNCTIONS ====================================== \\
function dualWieldCompiler(combat: Combat, computerPhysicalDefense: number, computerMagicalDefense: number): Combat { // Triggers if 40+ Str/Caer for 2h, 1h + Agi/Achre Mastery and 2nd weapon is 1h
    const computer = combat.computer;
    const weapons = combat.weapons;
    let playerWeaponOnePhysicalDamage = weapons[0]?.physicalDamage;
    let playerWeaponOneMagicalDamage = weapons[0]?.magicalDamage;
    let playerWeaponTwoPhysicalDamage = weapons[1]?.physicalDamage;
    let playerWeaponTwoMagicalDamage = weapons[1]?.magicalDamage;
    let playerWeaponOneTotalDamage;
    let playerWeaponTwoTotalDamage;
    let firstWeaponCrit = false;
    let secondWeaponCrit = false;
    const caer = caerenic(combat.caerenic);
    const weapOneClearance = Math.floor(Math.random() * 10100) / 100;
    const weapTwoClearance = Math.floor(Math.random() * 10100) / 100;
    let weapOneCrit = weapons[0]?.criticalChance as number
    let weapTwoCrit = weapons[1]?.criticalChance as number;
    weapOneCrit -= (combat.computerAttributes?.kyosirMod as number / 2);
    weapTwoCrit -= (combat.computerAttributes?.kyosirMod as number / 2);
    const resultOne = criticalCompiler(true, combat.player as Ascean, weapOneCrit, weapOneClearance, weapons[0] as Equipment, playerWeaponOnePhysicalDamage as number, playerWeaponOneMagicalDamage as number, combat.weather, combat.glancingBlow, combat.criticalSuccess, combat.isSeering);
    combat.criticalSuccess = resultOne.criticalSuccess;
    combat.glancingBlow = resultOne.glancingBlow;
    playerWeaponOnePhysicalDamage = resultOne.physicalDamage;
    playerWeaponOneMagicalDamage = resultOne.magicalDamage;
    if (weapOneCrit >= weapOneClearance) firstWeaponCrit = true;
    const resultTwo = criticalCompiler(true, combat.player as Ascean, weapTwoCrit, weapTwoClearance, weapons[1] as Equipment, playerWeaponTwoPhysicalDamage as number, playerWeaponTwoMagicalDamage as number, combat.weather, combat.glancingBlow, combat.criticalSuccess, combat.isSeering);
    combat.criticalSuccess = resultTwo.criticalSuccess;
    combat.glancingBlow = resultTwo.glancingBlow;
    combat.isSeering = resultTwo.isSeering;
    playerWeaponTwoPhysicalDamage = resultTwo.physicalDamage;
    playerWeaponTwoMagicalDamage = resultTwo.magicalDamage;
    if (weapTwoCrit >= weapTwoClearance) secondWeaponCrit = true;
    
    playerWeaponOnePhysicalDamage *= penetrationCompiler(computerPhysicalDefense, weapons[0]?.physicalPenetration as number);
    playerWeaponOneMagicalDamage *= penetrationCompiler(computerMagicalDefense, weapons[0]?.magicalPenetration as number);

    playerWeaponTwoPhysicalDamage *= penetrationCompiler(computerPhysicalDefense, weapons[1]?.physicalPenetration as number);
    playerWeaponTwoMagicalDamage *= penetrationCompiler(computerMagicalDefense, weapons[1]?.magicalPenetration as number);

    const damageType = damageTypeCompiler(combat.playerDamageType, computer as Ascean, weapons[0] as Equipment, playerWeaponOnePhysicalDamage, playerWeaponOneMagicalDamage);
    playerWeaponOnePhysicalDamage = damageType.physicalDamage;
    playerWeaponOneMagicalDamage = damageType.magicalDamage;

    const damageTypeTwo = damageTypeCompiler(combat.playerDamageType, computer as Ascean, weapons[1] as Equipment, playerWeaponTwoPhysicalDamage, playerWeaponTwoMagicalDamage);
    playerWeaponTwoPhysicalDamage = damageTypeTwo.physicalDamage;
    playerWeaponTwoMagicalDamage = damageTypeTwo.magicalDamage;

    // const weatherResult = weatherEffectCheck(combat.weapons[0] as Equipment, playerWeaponOneMagicalDamage, playerWeaponOnePhysicalDamage, combat.weather, firstWeaponCrit);
    // playerWeaponOnePhysicalDamage = weatherResult.physicalDamage;
    // playerWeaponOneMagicalDamage = weatherResult.magicalDamage;

    // const weatherResultTwo = weatherEffectCheck(combat.weapons[1] as Equipment, playerWeaponTwoMagicalDamage, playerWeaponTwoPhysicalDamage, combat.weather, secondWeaponCrit);
    // playerWeaponTwoPhysicalDamage = weatherResultTwo.physicalDamage;
    // playerWeaponTwoMagicalDamage = weatherResultTwo.magicalDamage;

    playerWeaponOneTotalDamage = playerWeaponOnePhysicalDamage + playerWeaponOneMagicalDamage;
    playerWeaponTwoTotalDamage = playerWeaponTwoPhysicalDamage + playerWeaponTwoMagicalDamage;

    combat.realizedPlayerDamage = playerWeaponOneTotalDamage + playerWeaponTwoTotalDamage;
    if (combat.realizedPlayerDamage < 0) combat.realizedPlayerDamage = 0;
    let strength = combat.playerAttributes?.totalStrength as number + (weapons[0]?.strength as number)  + (weapons[1]?.strength as number);
    let agility = combat.playerAttributes?.totalAgility as number + (weapons[0]?.agility as number)  + (weapons[1]?.agility as number);
    let achre = combat.playerAttributes?.totalAchre as number + (weapons[0]?.achre as number) + (weapons[1]?.achre as number);
    let caeren = combat.playerAttributes?.totalCaeren as number + (weapons[0]?.caeren as number)  + (weapons[1]?.caeren as number);
    const playerAction = combat.action;
    if (weapons[0]?.grip === HOLD_TYPES.ONE_HAND) {
        if (weapons[0]?.attackType === ATTACK_TYPES.PHYSICAL) {
            combat.realizedPlayerDamage *= (agility / 200)
        } else {
            combat.realizedPlayerDamage *= (achre / 200)
        };
    };

    if (weapons[0]?.grip === HOLD_TYPES.TWO_HAND) {
        if (weapons[0]?.attackType === ATTACK_TYPES.PHYSICAL) {
            combat.realizedPlayerDamage *= (strength / 300) 
        } else {
            combat.realizedPlayerDamage *= (caeren / 300)
        };
    };

    if (combat.computerAction === ACTION_TYPES.ATTACK) {
        combat.realizedPlayerDamage *= DAMAGE.LOW;
    };
    if (combat.computerAction === ACTION_TYPES.POSTURE) {
        combat.realizedPlayerDamage *= DAMAGE.NEG_HIGH;
    };

    if (playerAction === ACTION_TYPES.ROLL) {
        const rollMult = combat.rollSuccess ? DAMAGE.MID : DAMAGE.NEG_HIGH;
        combat.realizedPlayerDamage *= rollMult;
    } else {
        const mult = actionMultipliers[playerAction];
        if (mult) {
            combat.realizedPlayerDamage *= mult.physical;
        };
    };

    combat.realizedPlayerDamage *= caer.pos;
    if (combat.astrication.active === true) {
        combat.astrication.charges += 1;
    };
    if (combat.conviction.active === true) {
        const conviction = combat.conviction.talent ? DAMAGE.CUMULATIVE_TALENTED : DAMAGE.CUMULATIVE;
        combat.realizedPlayerDamage *= (1 + combat.conviction.charges * conviction);
    };
    if (combat.berserk.active === true) {
        const berserk = combat.berserk.talent ? DAMAGE.CUMULATIVE_TALENTED : DAMAGE.CUMULATIVE;
        combat.realizedPlayerDamage *= (1 + combat.berserk.charges * berserk);
    };
    if (combat.conviction.active === true) {
        combat.conviction.charges += 1;
    };
    combat.newComputerHealth -= combat.realizedPlayerDamage;

    if (combat.newComputerHealth <= 0) {
        combat.newComputerHealth = 0;
        combat.playerWin = true;
    };
  
    // ==================== STATISTIC LOGIC ====================
    combat.typeAttackData.push(weapons[0]?.attackType as string, weapons[1]?.attackType as string);
    combat.typeDamageData.push(combat.playerDamageType);
    const skill = weapons[0]?.type === "Ancient Shard" ? weapons[0]?.damageType?.[0] : weapons[0]?.type;
    combat.skillData.push(skill as string);
    const skillTwo = weapons[1]?.type === "Ancient Shard" ? weapons[1]?.damageType?.[0] : weapons[1]?.type;
    combat.skillData.push(skillTwo as string);
    combat.totalDamageData = Math.max(combat.realizedPlayerDamage, combat.totalDamageData);
    // ==================== STATISTIC LOGIC ====================
    
    combat.playerActionDescription = 
        `You dual-wield ${combat.action} ${computer?.name} with ${weapons[0]?.name} and ${weapons[1]?.name} for ${Math.round(combat.realizedPlayerDamage)} ${combat.playerDamageType} and ${weapons[1]?.damageType?.[0] ? weapons[1]?.damageType?.[0] : ""} ${firstWeaponCrit === true && secondWeaponCrit === true ? "damage (Critical)" : firstWeaponCrit === true || secondWeaponCrit === true ? "damage (Partial Critical)" : combat.glancingBlow === true ? "damage (Glancing)" : "damage"}.`    
        
    return combat;
};
    
function attackCompiler(combat: Combat, playerAction: string): Combat {
    if (combat.computerWin === true) return combat;
    let playerTotalDamage;
    const mainWeapon = combat.weapons[0] as Equipment, offWeapon = combat.weapons[1] as Equipment;
    const mastery = combat.player?.mastery as string;
    const caer = caerenic(combat.caerenic);
    let playerPhysicalDamage = mainWeapon.physicalDamage as number, playerMagicalDamage = mainWeapon.magicalDamage as number;
    let computerPhysicalDefense = combat.computerDefense?.physicalDefenseModifier as number, computerMagicalDefense = combat.computerDefense?.magicalDefenseModifier as number;
    let physPen = mainWeapon.physicalPenetration as number, magPen = mainWeapon.magicalPenetration as number;
    if (combat.computerAction === ACTION_TYPES.POSTURE && !combat.parrySuccess && !combat.rollSuccess) {
        computerPhysicalDefense = combat.computerDefense?.physicalPosture as number;
        computerMagicalDefense = combat.computerDefense?.magicalPosture as number;
    };
    if (playerAction === ACTION_TYPES.ATTACK) {
        if (mainWeapon.grip === HOLD_TYPES.ONE_HAND) {
            if (mainWeapon.attackType === ATTACK_TYPES.PHYSICAL) {
                if (mastery === MASTERY.AGILITY || mastery === MASTERY.CONSTITUTION) {
                    if (combat.playerAttributes?.totalAgility as number >= THRESHOLD.ONE_HAND) {
                        if (offWeapon.grip === HOLD_TYPES.ONE_HAND) { // If you're Focusing attack + 1h + Agi Mastery + 1h in Second Slot
                            combat.dualWielding = true;
                            dualWieldCompiler(combat, computerPhysicalDefense, computerMagicalDefense);
                            return combat;
                        } else {
                            playerPhysicalDamage *= DAMAGE.HIGH;
                            playerMagicalDamage *= DAMAGE.MID;
                        };
                    } else {
                        playerPhysicalDamage *= DAMAGE.HIGH;
                        playerMagicalDamage *= DAMAGE.MID;
                    };
                } else {
                    playerPhysicalDamage *= DAMAGE.LOW;
                    playerMagicalDamage *= DAMAGE.LOW;
                };
            };
            if (mainWeapon.attackType === ATTACK_TYPES.MAGIC) {
                if (mastery === MASTERY.ACHRE || mastery === MASTERY.KYOSIR) {
                    if (combat.playerAttributes?.totalAchre as number + mainWeapon.achre >= THRESHOLD.ONE_HAND) {
                        if (offWeapon.grip === HOLD_TYPES.ONE_HAND) { // Might be a dual-wield compiler instead to take the rest of it
                            combat.dualWielding = true;
                            dualWieldCompiler(combat, computerPhysicalDefense, computerMagicalDefense);
                            return combat;
                        } else {
                            playerPhysicalDamage *= DAMAGE.MID;
                            playerMagicalDamage *= DAMAGE.HIGH;
                        };
                    } else {
                        playerPhysicalDamage *= DAMAGE.MID;
                        playerMagicalDamage *= DAMAGE.HIGH;
                    };
                } else {
                    playerPhysicalDamage *= DAMAGE.LOW;
                    playerMagicalDamage *= DAMAGE.LOW;
                };
            };
        };
        if (mainWeapon.grip === HOLD_TYPES.TWO_HAND) { // Weapon is TWO HAND
            if (mainWeapon.attackType === ATTACK_TYPES.PHYSICAL && mainWeapon.type !== WEAPON_TYPES.BOW && mainWeapon.type !== WEAPON_TYPES.GREATBOW) {
                if (mastery === MASTERY.STRENGTH || mastery === MASTERY.CONSTITUTION) {
                    if (combat.playerAttributes?.totalStrength as number >= THRESHOLD.TWO_HAND) { // Might be a dual-wield compiler instead to take the rest of it
                        if (offWeapon.type !== WEAPON_TYPES.BOW) {
                            combat.dualWielding = true;
                            dualWieldCompiler(combat, computerPhysicalDefense, computerMagicalDefense);
                            return combat;
                        } else {
                            playerPhysicalDamage *= DAMAGE.HIGH;
                            playerMagicalDamage *= DAMAGE.MID;
                        };
                    } else {
                        playerPhysicalDamage *= DAMAGE.HIGH;
                        playerMagicalDamage *= DAMAGE.MID;
                    };
                } else {
                    playerPhysicalDamage *= DAMAGE.LOW;
                    playerMagicalDamage *= DAMAGE.LOW;
                };
            };
            if (mainWeapon.attackType === ATTACK_TYPES.MAGIC) {
                if (mastery === MASTERY.CAEREN || mastery === MASTERY.KYOSIR) {
                    if (combat.playerAttributes?.totalCaeren as number >= THRESHOLD.TWO_HAND) {
                        if (offWeapon.type !== WEAPON_TYPES.BOW) {
                            combat.dualWielding = true;
                            dualWieldCompiler(combat, computerPhysicalDefense, computerMagicalDefense);
                            return combat;
                        } else {
                            playerPhysicalDamage *= DAMAGE.MID;
                            playerMagicalDamage *= DAMAGE.HIGH;
                        }
                    } else {
                        playerPhysicalDamage *= DAMAGE.MID;
                        playerMagicalDamage *= DAMAGE.HIGH;
                    };
                } else {
                    playerPhysicalDamage *= DAMAGE.LOW;
                    playerMagicalDamage *= DAMAGE.LOW;
                };
            };
            if (mainWeapon.type === WEAPON_TYPES.BOW || mainWeapon.type !== WEAPON_TYPES.GREATBOW) {
                playerPhysicalDamage *= DAMAGE.HIGH;
                playerMagicalDamage *= DAMAGE.HIGH;
            };
        }; 
    };
    if (playerAction === ACTION_TYPES.ROLL) {
        const rollMult = combat.rollSuccess ? DAMAGE.MID : DAMAGE.NEG_HIGH;
        playerPhysicalDamage *= rollMult;
        playerMagicalDamage *= rollMult;
    } else {
        const mult = actionMultipliers[playerAction];
        if (mult) {
            playerPhysicalDamage *= mult.physical;
            playerMagicalDamage *= mult.magical;
        };
    };
    const criticalClearance = Math.floor(Math.random() * 10100) / 100;
    let criticalChance = mainWeapon.criticalChance as number;
    criticalChance -= (combat.computerAttributes?.kyosirMod as number / 2);
    const criticalResult = criticalCompiler(true, combat.player as Ascean, criticalChance, criticalClearance, combat.weapons[0] as Equipment, playerPhysicalDamage, playerMagicalDamage, combat.weather, combat.glancingBlow, combat.criticalSuccess, combat.isSeering);
    combat.criticalSuccess = criticalResult.criticalSuccess;
    combat.glancingBlow = criticalResult.glancingBlow;
    combat.isSeering = criticalResult.isSeering;
    playerPhysicalDamage = criticalResult.physicalDamage;
    playerMagicalDamage = criticalResult.magicalDamage;
    // 50% Defense, 30% Pen = 20% Defense. 1 - .2 = 0.8x Multiplier.
    playerPhysicalDamage *= penetrationCompiler(computerPhysicalDefense, physPen);
    playerMagicalDamage *= penetrationCompiler(computerMagicalDefense, magPen);
    const damageType = damageTypeCompiler(combat.playerDamageType, combat.computer as Ascean, combat.weapons[0] as Equipment, playerPhysicalDamage, playerMagicalDamage);
    playerPhysicalDamage = damageType.physicalDamage;
    playerMagicalDamage = damageType.magicalDamage;
    // const weatherResult = weatherEffectCheck(combat.weapons[0] as Equipment, playerMagicalDamage, playerPhysicalDamage, combat.weather, combat.criticalSuccess);
    // playerPhysicalDamage = weatherResult.physicalDamage;
    // playerMagicalDamage = weatherResult.magicalDamage;
    playerTotalDamage = playerPhysicalDamage + playerMagicalDamage;
    if (playerTotalDamage < 0) {
        playerTotalDamage = 0;
    };
    combat.realizedPlayerDamage = playerTotalDamage;
    if (combat.computerAction === ACTION_TYPES.ATTACK) {
        combat.realizedPlayerDamage *= DAMAGE.LOW;
    };
    combat.realizedPlayerDamage *= caer.pos;
    if (combat.astrication.active === true) {
        combat.astrication.charges += 1;
    };
    if (combat.conviction.active === true) {
        const conviction = combat.conviction.talent ? DAMAGE.CUMULATIVE_TALENTED : DAMAGE.CUMULATIVE;
        combat.realizedPlayerDamage *= (1 + combat.conviction.charges * conviction);
    };
    if (combat.berserk.active === true) {
        const berserk = combat.berserk.talent ? DAMAGE.CUMULATIVE_TALENTED : DAMAGE.CUMULATIVE;
        combat.realizedPlayerDamage *= (1 + combat.berserk.charges * berserk);
    };
    if (combat.conviction.active === true) {
        combat.conviction.charges += 1;
    };
    combat.newComputerHealth -= combat.realizedPlayerDamage;
    combat.typeAttackData.push(mainWeapon.attackType as string);
    combat.typeDamageData.push(combat.playerDamageType);
    const skill = mainWeapon.type === "Ancient Shard" ? mainWeapon.damageType?.[0] : mainWeapon.type;
    combat.skillData.push(skill as string);
    combat.totalDamageData = Math.max(combat.realizedPlayerDamage, combat.totalDamageData);
    combat.playerActionDescription = `You ${ATTACKS[playerAction as keyof typeof ATTACKS]} ${combat.computer?.name} with your ${mainWeapon.name} for ${Math.round(combat.realizedPlayerDamage)} ${combat.playerDamageType} ${combat.criticalSuccess === true ? "damage (Critical)" : combat.glancingBlow === true ? "damage (Glancing)" : "damage"}.`    
    if (combat.newComputerHealth <= 0) {
        combat.newComputerHealth = 0;
        combat.playerWin = true;
    };
    return combat;
};

function playerRollCompiler(combat: Combat, playerAction: string, computerAction: string): Combat { 
    let playerRoll = combat.weapons[0]?.roll as number;
    let rollCatch = Math.floor(Math.random() * 101) + (combat.computerAttributes?.kyosirMod as number / 2);
    // if (combat.weather === "Alluring Isles") {
    //     playerRoll -= 10;
    // };
    // if (combat.weather === "Kingdom" || combat.weather === "Sedyrus") {
    //     playerRoll -= 5;
    // };
    // if (combat.weather === "Fangs" || combat.weather === "Roll") {
    //     playerRoll += 5;
    // };
    if (playerRoll > rollCatch) {
        combat.rollSuccess = true;
        combat.playerSpecialDescription = 
            `You successfully roll and evade ${combat.computer?.name}, avoiding their ${ computerAction === ACTION_TYPES.ATTACK ? "focused" : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } attack.`;
        attackCompiler(combat, playerAction);
    } else {
        combat.playerSpecialDescription =
        `You failed to roll and evade against ${combat.computer?.name}'s ${ computerAction === ACTION_TYPES.ATTACK ? "focused" : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } attack.`
         
    };
    return combat;
};

// ================================== COMBAT COMPILER FUNCTIONS ====================================== \\
function doubleRollCompiler(combat: Combat, playerInitiative: number, computerInitiative: number, playerAction: string, computerAction: string): Combat {
    let playerRoll: number = combat.weapons[0]?.roll as number;
    let computerRoll: number = combat.computerWeapons[0].roll;
    let rollCatch: number = Math.floor(Math.random() * 101) + (combat.computerAttributes?.kyosirMod as number / 2);
    // if (combat.weather === "Alluring Isles") {
    //     playerRoll -= 10;
    //     computerRoll -= 10;
    // };
    // if (combat.weather === "Kingdom" || combat.weather === "Sedyrus") {
    //     playerRoll -= 5;
    //     computerRoll -= 5;
    // };
    // if (combat.weather === "Fangs" || combat.weather === "Roll") {
    //     playerRoll += 5;
    //     computerRoll += 5;
    // };
    if (playerInitiative > computerInitiative) { // You have Higher Initiative
        if (playerRoll > rollCatch) { // The Player Succeeds the Roll
            combat.playerSpecialDescription = 
                `You successfully roll and evade ${combat.computer?.name}, avoiding their ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} attack`;
            attackCompiler(combat, playerAction);
        } else if (computerRoll > rollCatch && !combat.astrication.active) { // The Player Fails the Roll and the Computer Succeeds
            combat.playerSpecialDescription = 
                `You failed to roll and evade against ${combat.computer?.name}'s ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} attack`;
            combat.computerSpecialDescription = 
                `${combat.computer?.name} successfully rolls and evades you, avoiding your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} attack`;
            computerAttackCompiler(combat, computerAction);
        } else { // Neither Player nor Computer Succeed
            combat.playerSpecialDescription = 
                `You failed to roll and evade against ${combat.computer?.name}'s ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} attack`;
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} attack`;
            attackCompiler(combat, playerAction);
            computerAttackCompiler(combat, computerAction);
        }
    } else { // The Computer has Higher Initiative
        if (computerRoll > rollCatch && !combat.astrication.active) { // The Computer Succeeds the Roll
            combat.computerSpecialDescription = 
                `${combat.computer?.name} successfully rolls and evades you, avoiding your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} attack`;
            computerAttackCompiler(combat, computerAction);
        } else if (playerRoll > rollCatch) { // The Computer Fails the Roll and the Player Succeeds
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} attack`;
            combat.playerSpecialDescription = 
                `You successfully roll and evade ${combat.computer?.name}, avoiding their ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} attack`;
            attackCompiler(combat, playerAction);
        } else { // Neither Computer nor Player Succeed
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${combat.playerAction.charAt(0).toUpperCase() + combat.playerAction.slice(1)} attack`;
            combat.playerSpecialDescription = 
                `You failed to roll and evade against ${combat.computer?.name}'s ${combat.computerAction.charAt(0).toUpperCase() + combat.computerAction.slice(1)} attack`;
            computerAttackCompiler(combat, computerAction);
            attackCompiler(combat, playerAction);
        };
    };
    return combat;
};

function computerWeaponMaker(combat: Combat): Combat {
    let prayers = [PRAYERS.BUFF, PRAYERS.DAMAGE, PRAYERS.DEBUFF, PRAYERS.HEAL];
    let newPrayer = Math.floor(Math.random() * prayers.length);
    combat.computerBlessing = prayers[newPrayer];
    const change = Math.floor(Math.random() * 101);
    if (change < 50) {
        combat.computerWeapons = [combat.computerWeapons[1], combat.computerWeapons[2], combat.computerWeapons[0]];
        combat.computerDamageType = combat.computerWeapons[0]?.damageType?.[0] as string;
        return combat;
    };
    let defenseTypes: any = {"Leather-Cloth": 0,"Leather-Mail": 0,"Chain-Mail": 0,"Plate-Mail": 0};
    defenseTypes[combat.player?.helmet.type as keyof typeof defenseTypes] += ARMOR_WEIGHT.helmet;
    defenseTypes[combat.player?.chest.type as keyof typeof defenseTypes] += ARMOR_WEIGHT.chest;
    defenseTypes[combat.player?.legs.type as keyof typeof defenseTypes] += ARMOR_WEIGHT.legs;
    const sortedDefenses = Object.entries(defenseTypes)
        .sort((a, b) => b[1] as number - (a[1] as number)) // Sort based on the values in descending order
        .map(([type, weight]) => ({ type, weight })); // Convert back to an array of objects

    let computerTypes: any = {0: [],1: [],2: []};
    combat.computerWeapons.forEach((weapon, index) => {
        weapon.damageType?.forEach((type) => {
            if (STRONG_TYPES[sortedDefenses[0].type as keyof typeof STRONG_TYPES].includes(type)) {
                computerTypes[index as keyof typeof computerTypes].push({ type, rank: 1 });
            } else if (STRONG_TYPES[sortedDefenses[1].type as keyof typeof STRONG_TYPES].includes(type)) {
                computerTypes[index].push({ type, rank: 2 });
            } else if (STRONG_TYPES[sortedDefenses[2].type  as keyof typeof STRONG_TYPES].includes(type)) {
                computerTypes[index].push({ type, rank: 3 });
            } else if (STRONG_TYPES[sortedDefenses[3].type  as keyof typeof STRONG_TYPES].includes(type)) {
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
    // computerActionCompiler(newCombat, playerAction);

    newCombat.computerStartDescription = 
        `${newCombat.computer.name} sets to ${computerAction === "" ? "defend" : computerAction.charAt(0).toUpperCase() + computerAction.slice(1)}${computerParry ? "-" + computerParry.charAt(0).toUpperCase() + computerParry.slice(1) : ""} against you.`

    newCombat.playerStartDescription = 
        `You attempt to ${playerAction === "" ? "defend" : playerAction.charAt(0).toUpperCase() + playerAction.slice(1)} against ${newCombat.computer.name}.`

    if (playerAction === ACTION_TYPES.PARRY && computerAction === ACTION_TYPES.PARRY) {
        if (playerParry === computerParry && playerParry === ACTION_TYPES.PARRY) {
            if (playerInitiative > computerInitiative) {
                newCombat.parrySuccess = true;
                newCombat.playerSpecialDescription = `You successfully parried ${newCombat.computer.name}'s parry-parry! Absolutely brutal`;
            } else if (!newCombat.astrication.active) {
                newCombat.computerParrySuccess = true;
                newCombat.computerSpecialDescription = `${newCombat.computer.name} successfully parried your parry-parry! Absolutely brutal`; 
            };
            return newCombat;
        };
    };
    if (playerAction === ACTION_TYPES.PARRY && computerAction !== ACTION_TYPES.PARRY) {
        newCombat.parrySuccess = true;
        newCombat.playerSpecialDescription = `You successfully parried ${newCombat.computer.name}'s ${ computerAction === ACTION_TYPES.ATTACK ? "focused" : computerAction.charAt(0).toUpperCase() + computerAction.slice(1) } attack.`;
        return newCombat;
    };
    if (computerAction === ACTION_TYPES.PARRY && playerAction !== ACTION_TYPES.PARRY && !newCombat.astrication.active) {
        newCombat.computerParrySuccess = true;
        newCombat.computerSpecialDescription = `${newCombat.computer.name} successfully parried your ${ newCombat.action === ACTION_TYPES.ATTACK ? "focused" : playerAction.charAt(0).toUpperCase() + playerAction.slice(1) } attack.`;
        return newCombat;    
    };
    if (playerAction === ACTION_TYPES.ROLL && computerAction === ACTION_TYPES.ROLL) { // If both choose Roll
        doubleRollCompiler(newCombat, playerInitiative, computerInitiative, playerAction, computerAction);
        return newCombat;
    };
    if (playerAction === ACTION_TYPES.ROLL && computerAction !== ACTION_TYPES.ROLL) {
        playerRollCompiler(newCombat, playerAction, computerAction);
    };
    if (computerAction === ACTION_TYPES.ROLL && playerAction !== ACTION_TYPES.ROLL) {
        computerRollCompiler(newCombat, playerAction, computerAction);
    };
    if (phaserSuccessConcerns(newCombat.parrySuccess, newCombat.rollSuccess, newCombat.computerParrySuccess, newCombat.computerRollSuccess) === false) { // If both choose attack
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
    const playerActionLive = cleanData.action !== "" ? true : false;
    const computerActionLive = cleanData.computerAction !== "" ? true : false;
    if (playerActionLive && computerActionLive) {
        cleanData = dualActionSplitter(cleanData);
        changes = {
            ...changes,
            "playerSpecialDescription": cleanData.playerSpecialDescription,
            "playerStartDescription": cleanData.playerStartDescription,
            "playerInfluenceDescription": cleanData.playerInfluenceDescription,
            "playerInfluenceDescriptionTwo": cleanData.playerInfluenceDescriptionTwo,
            "playerActionDescription": cleanData.playerActionDescription,
            "realizedPlayerDamage": cleanData.realizedPlayerDamage,
            "parrySuccess": cleanData.parrySuccess,
            "rollSuccess": cleanData.rollSuccess,
            "criticalSuccess": cleanData.criticalSuccess,
            "religiousSuccess": cleanData.religiousSuccess,
            "glancingBlow": cleanData.glancingBlow,
            "dualWielding": cleanData.dualWielding,

            "computerSpecialDescription": cleanData.computerSpecialDescription,
            "computerStartDescription": cleanData.computerStartDescription,
            "computerInfluenceDescription": cleanData.computerInfluenceDescription,
            "computerInfluenceDescriptionTwo": cleanData.computerInfluenceDescriptionTwo,
            "computerActionDescription": cleanData.computerActionDescription,
            "realizedComputerDamage": cleanData.realizedComputerDamage,
            "computerDamageType": cleanData.computerDamageType,
            "computerParrySuccess": cleanData.computerParrySuccess,
            "computerRollSuccess": cleanData.computerRollSuccess,
            "computerCriticalSuccess": cleanData.computerCriticalSuccess,
            "computerReligiousSuccess": cleanData.computerReligiousSuccess,
            "computerGlancingBlow": cleanData.computerGlancingBlow,
            "computerDualWielding": cleanData.computerDualWielding, 
        };
    } else if (playerActionLive && !computerActionLive) {
        if (cleanData.action === ACTION_TYPES.PARRY) return cleanData;
        attackCompiler(cleanData, cleanData.action);
        changes = {
            ...changes,
            "playerSpecialDescription": cleanData.playerSpecialDescription,
            "playerStartDescription": cleanData.playerStartDescription,
            "playerInfluenceDescription": cleanData.playerInfluenceDescription,
            "playerInfluenceDescriptionTwo": cleanData.playerInfluenceDescriptionTwo,
            "playerActionDescription": cleanData.playerActionDescription,
            "realizedPlayerDamage": cleanData.realizedPlayerDamage,
            "potentialPlayerDamage": cleanData.potentialPlayerDamage,
            "parrySuccess": cleanData.parrySuccess,
            "rollSuccess": cleanData.rollSuccess,
            "criticalSuccess": cleanData.criticalSuccess,
            "religiousSuccess": cleanData.religiousSuccess,
            "glancingBlow": cleanData.glancingBlow,
            "dualWielding": cleanData.dualWielding,
        };
    } else if (!playerActionLive && computerActionLive) {
        if (cleanData.computerAction === ACTION_TYPES.PARRY) return cleanData;
        computerWeaponMaker(cleanData);
        computerAttackCompiler(cleanData, cleanData.computerAction);
        changes = {
            ...changes,
            "computerSpecialDescription": cleanData.computerSpecialDescription,
            "computerStartDescription": cleanData.computerStartDescription,
            "computerInfluenceDescription": cleanData.computerInfluenceDescription,
            "computerInfluenceDescriptionTwo": cleanData.computerInfluenceDescriptionTwo,
            "computerActionDescription": cleanData.computerActionDescription,
            "realizedComputerDamage": cleanData.realizedComputerDamage,
            "potentialComputerDamage": cleanData.potentialComputerDamage,
            "computerDamageType": cleanData.computerDamageType,
            "computerParrySuccess": cleanData.computerParrySuccess,
            "computerRollSuccess": cleanData.computerRollSuccess,
            "computerCriticalSuccess": cleanData.computerCriticalSuccess,
            "computerReligiousSuccess": cleanData.computerReligiousSuccess,
            "computerGlancingBlow": cleanData.computerGlancingBlow,
            "computerDualWielding": cleanData.computerDualWielding,    
        };
    };
    faithCompiler(cleanData);
    if (cleanData.playerWin === true) cleanData.computerDeathDescription = `${cleanData.computer.name} has been defeated.`;
    if (cleanData.computerWin === true) cleanData.playerDeathDescription = `You have been defeated.`;
    cleanData.action = "";
    cleanData.computerAction = "";
    cleanData.combatRound += 1;
    cleanData.sessionRound += 1;
    if (cleanData.playerWin === true || cleanData.computerWin === true) statusEffectCheck(cleanData);
    changes = {
        ...changes,
        "action": cleanData.action,
        "computerAction": cleanData.computerAction,
        "combatRound": cleanData.combatRound,
        "sessionRound": cleanData.sessionRound,
        "playerDamaged": cleanData.realizedComputerDamage > 0,
        "computerDamaged": cleanData.realizedPlayerDamage > 0,
        
        "newPlayerHealth": cleanData.newPlayerHealth,
        "playerDefense": cleanData.playerDefense,
        "playerEffects": cleanData.playerEffects,
        "weapons": cleanData.weapons,
        
        "newComputerHealth": cleanData.newComputerHealth,
        "computerDefense": cleanData.computerDefense,
        "computerEffects": cleanData.computerEffects,
        "computerWeapons": cleanData.computerWeapons,
        "computerBlessing": cleanData.computerBlessing,
        
        "actionData": cleanData.actionData,
        "typeAttackData": cleanData.typeAttackData,
        "typeDamageData": cleanData.typeDamageData,
        "totalDamageData": cleanData.totalDamageData,
        "deityData": cleanData.deityData,
        "prayerData": cleanData.prayerData,
        "skillData": cleanData.skillData,

        // "attackWeight": cleanData.attackWeight,
        // "parryWeight": cleanData.parryWeight,
        // "dodgeWeight": cleanData.dodgeWeight,
        // "postureWeight": cleanData.postureWeight,
        // "rollWeight": cleanData.rollWeight,
        // "parryAttackWeight": cleanData.parryAttackWeight,
        // "parryParryWeight": cleanData.parryParryWeight,
        // "parryDodgeWeight": cleanData.parryDodgeWeight,
        // "parryPostureWeight": cleanData.parryPostureWeight,
        // "parryRollWeight": cleanData.parryRollWeight,

        "playerDeathDescription": cleanData.playerDeathDescription,
        "computerDeathDescription": cleanData.computerDeathDescription,
        "playerWin": cleanData.playerWin,
        "computerWin": cleanData.computerWin,

        "isSeering": cleanData.isSeering,
        "caerenic": cleanData.caerenic,
        "stalwart": cleanData.stalwart,
        "isStealth": cleanData.isStealth,
        "isInsight": cleanData.isInsight,
        "isQuicken": cleanData.isQuicken,
        "astrication": cleanData.astrication,
        "berserk": cleanData.berserk,
        "conviction": cleanData.conviction,
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
        computerParryGuess: combat.computerParryGuess, // Comp's parry Guess if Action === ACTION_TYPES.PARRY
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
        playerStartDescription: "",
        computerStartDescription: "",
        playerSpecialDescription: "",
        computerSpecialDescription: "",
        playerActionDescription: "", 
        computerActionDescription: "",
        playerInfluenceDescription: "",
        computerInfluenceDescription: "",
        playerInfluenceDescriptionTwo: "",
        computerInfluenceDescriptionTwo: "",
        playerDeathDescription: "",
        computerDeathDescription: "",
        newPlayerHealth: combat.newPlayerHealth, // New player health post-combat action
        newComputerHealth: combat.newComputerHealth, // New computer health post-combat action
        // attackWeight: combat.attackWeight,
        // parryWeight: combat.parryWeight,
        // dodgeWeight: combat.dodgeWeight,
        // postureWeight: combat.postureWeight,
        // rollWeight: combat.rollWeight,
        // thrustWeight: combat.thrustWeight,
        // parryAttackWeight: combat.parryAttackWeight,
        // parryParryWeight: combat.parryParryWeight,
        // parryDodgeWeight: combat.parryDodgeWeight,
        // parryPostureWeight: combat.parryPostureWeight,
        // parryRollWeight: combat.parryRollWeight,
        // parryThrustWeight: combat.parryThrustWeight,
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
        skillData: combat.skillData,
        weather: combat.weather,
        enemyID: combat.enemyID,
        damagedID: combat.enemyID,
        combatTimer: combat.combatTimer,
        caerenic: combat.caerenic,
        stalwart: combat.stalwart,
        npcType: combat.npcType,
        isEnemy: combat.isEnemy,
        isAggressive: combat.isAggressive,
        startedAggressive: combat.startedAggressive,
        isStealth: combat.isStealth,
        isSeering: combat.isSeering,
        isInsight: combat.isInsight,
        isQuicken: combat.isQuicken,
        persuasionScenario: combat.persuasionScenario,
        luckoutScenario: combat.luckoutScenario,
        playerTrait: combat.playerTrait,
        blindStrike: combat.blindStrike,
        astrication: combat.astrication,
        berserk: combat.berserk,
        conviction: combat.conviction,
    };
    return newData;
};

function computerDispel(combat: Combat): Combat {
    const effect: StatusEffect = combat.computerEffects.find(effect => (effect.prayer !== PRAYERS.DEBUFF && effect.prayer !== PRAYERS.DAMAGE)) as StatusEffect;
    const matchingWeapon: Equipment = combat.computerWeapons.find(weapon => weapon._id === effect.weapon.id) as Equipment;
    const matchingWeaponIndex: number = combat.computerWeapons.indexOf(matchingWeapon);
    if (effect.prayer === PRAYERS.BUFF) {
        const deBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingWeaponIndex], false);
        combat.computerDefense = deBuff.defense;
        combat.computerWeapons[matchingWeaponIndex] = deBuff.weapon; 
    };
    combat.computerEffects = combat.computerEffects.filter(prayer => prayer.id !== effect.id);
    return combat;
};

// ================================== ACTION - SPLITTERS ===================================== \\

function prayerSplitter(combat: Combat, prayer: string): Combat {
    let originalPrayer = combat.playerBlessing;
    combat.playerBlessing = prayer; 
    faithSuccess(combat, "player", combat.weapons[0] as Equipment, 0);
    combat.playerBlessing = originalPrayer;
    return combat;
};
function instantDamageSplitter(combat: Combat, mastery: string): Combat {
    const caer = caerenic(combat.caerenic);
    let damage = combat.player?.[mastery] * (0.5 + (combat.player?.level as number / 10)) * caer.pos;
    combat.realizedPlayerDamage = damage;
    combat.newComputerHealth -= combat.realizedPlayerDamage;
    combat.computerDamaged = true;
    combat.playerAction = "invoke";
    combat.playerActionDescription = `You tshaer ${combat.computer?.name}'s caeren with your ${combat.player?.mastery}"s Invocation of ${combat.weapons[0]?.influences?.[0]} for ${Math.round(damage)} Damage.`;    
    return combat;
};

function talentPrayer(combat: Combat, prayer: string) {
    prayerSplitter(combat, prayer);
    if (combat.playerWin) statusEffectCheck(combat);
    const changes = {
        "actionData": combat.actionData,
        "deityData": combat.deityData,
        "prayerData": combat.prayerData,
        "skillData": combat.skillData,

        "weapons": combat.weapons,
        "computerWeapons": combat.computerWeapons,
        "playerEffects": combat.playerEffects,
        "computerEffects": combat.computerEffects,
        "playerDefense": combat.playerDefense,
        "computerDefense": combat.computerDefense,

        "newPlayerHealth": combat.newPlayerHealth,
        "newComputerHealth": combat.newComputerHealth,
        
        "realizedPlayerDamage": combat.realizedPlayerDamage,
        "computerDamaged": combat.computerDamaged,
        "playerWin": combat.playerWin,
        "playerActionDescription": combat.playerActionDescription,
        "playerInfluenceDescription": combat.playerInfluenceDescription,

        "isInsight": combat.isInsight,
        "isQuicken": combat.isQuicken,
    };
    return changes;
};

function instantActionSplitter(combat: Combat): any {
    switch (combat.player?.mastery) {
        case MASTERY.CONSTITUTION:
            prayerSplitter(combat, PRAYERS.HEAL);
            prayerSplitter(combat, PRAYERS.BUFF);
            break;
        case MASTERY.STRENGTH:
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, MASTERY.STRENGTH);
            break;
        case MASTERY.AGILITY:
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, MASTERY.AGILITY);
            break;
        case MASTERY.ACHRE:
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, MASTERY.ACHRE);
            break;
        case MASTERY.CAEREN:
            prayerSplitter(combat, combat.playerBlessing);
            instantDamageSplitter(combat, MASTERY.CAEREN);
            break;
        case MASTERY.KYOSIR:
            prayerSplitter(combat, PRAYERS.DAMAGE);
            prayerSplitter(combat, PRAYERS.DEBUFF);
            break;
        default:
            break;
    };

    combat.actionData.push("invoke"); 
        
    if (combat.newComputerHealth <= 0) {
        combat.newComputerHealth = 0;
        combat.playerWin = true;
    };
    if (combat.playerWin === true) statusEffectCheck(combat);

    const changes = {
        "actionData": combat.actionData,
        "deityData": combat.deityData,
        "prayerData": combat.prayerData,
        "skillData": combat.skillData,

        "weapons": combat.weapons,
        "computerWeapons": combat.computerWeapons,
        "playerEffects": combat.playerEffects,
        "computerEffects": combat.computerEffects,
        "playerDefense": combat.playerDefense,
        "computerDefense": combat.computerDefense,

        "newPlayerHealth": combat.newPlayerHealth,
        "newComputerHealth": combat.newComputerHealth,
        
        "realizedPlayerDamage": combat.realizedPlayerDamage,
        "computerDamaged": combat.computerDamaged,
        "playerWin": combat.playerWin,
        "playerActionDescription": combat.playerActionDescription,
        "playerInfluenceDescription": combat.playerInfluenceDescription,

        "isInsight": combat.isInsight,
        "isQuicken": combat.isQuicken,
    };
    return changes;
};

function consumePrayerSplitter(combat: Combat): any {
    if (combat.prayerSacrificeId === "") {
        combat.prayerSacrifice = combat.playerEffects[0].prayer;
        combat.prayerSacrificeId = combat.playerEffects[0].id;
        combat.prayerSacrificeName = combat.playerEffects[0].name;
    };
    combat.actionData.push("consume");
    combat.prayerData.push(combat.prayerSacrifice);
    combat.playerEffects = combat.playerEffects.filter(effect => {
        if (effect.id !== combat.prayerSacrificeId) return true; // || effect.enemyName !== combat.computer.name
        const matchingWeapon = combat.weapons.find(weapon => weapon?._id === effect.weapon.id);
        const matchingWeaponIndex = combat.weapons.indexOf(matchingWeapon);
        const matchingDebuffTarget = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget);
        const matchingDebuffTargetIndex = combat.weapons.indexOf(matchingDebuffTarget);

        switch (combat.prayerSacrifice) {
            case PRAYERS.HEAL:
                combat.newPlayerHealth += effect.effect?.healing as number * DAMAGE.TICK_HALF;
                if (combat.newPlayerHealth > 0) combat.computerWin = false;
                break;
            case PRAYERS.BUFF:
                combat.newComputerHealth -= (combat.realizedPlayerDamage * DAMAGE.HALF);
                combat.playerActionDescription = `${combat.weapons[0]?.influences?.[0]}'s Tendrils serenade ${combat.computer?.name}, echoing ${Math.round(combat.realizedPlayerDamage * DAMAGE.HALF)} more damage.`    
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                };
                const deBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingWeaponIndex] as Equipment, false);
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
                combat.playerDefense = deBuff.defense;
                break;
            case PRAYERS.DAMAGE:
                combat.newComputerHealth -= effect.effect?.damage as number * DAMAGE.TICK_HALF;
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                }; 
                break;
            case PRAYERS.DEBUFF:
                combat.newComputerHealth -= (combat.realizedComputerDamage * DAMAGE.HALF);
                combat.playerActionDescription = `The Hush of ${combat.weapons[0]?.influences?.[0]} wracks ${combat.computer?.name}, wearing for ${Math.round(combat.realizedComputerDamage * DAMAGE.HALF)} more damage.`;   
            
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
        return false;
    });

    combat.playerAction = "prayer";
    combat.prayerSacrifice = "";
    combat.prayerSacrificeId = "";
    combat.prayerSacrificeName = "";
    combat.action = "";

    if (combat.prayerSacrifice !== PRAYERS.HEAL && combat.realizedPlayerDamage > 0) combat.computerDamaged = true;
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
        if (effect.prayer === PRAYERS.DAMAGE) { 
            damageTick(combat, effect, true);
        };
        if (effect.prayer === PRAYERS.HEAL) { 
            healTick(combat, effect, true);
        };  
    } else if (effect.playerName === combat.computer?.name) {
        if (effect.prayer === PRAYERS.DAMAGE) {
            damageTick(combat, effect, false);
        };
        if (effect.prayer === PRAYERS.HEAL) { 
            healTick(combat, effect, false);
        };
    };
    if (combat.combatTimer >= effect.endTime || effectTimer <= 0) {
        combat = prayerRemoveTickSplitter(combat, effect);
    };
    if (combat.playerWin === true || combat.computerWin === true) {
        combat = statusEffectCheck(combat);
    };

    const changes = {
        "actionData": combat.actionData,
        "prayerData": combat.prayerData,

        "playerEffects": combat.playerEffects,
        "computerEffects": combat.computerEffects,
        "weapons": combat.weapons,
        "computerWeapons": combat.computerWeapons,
        "playerDefense": combat.playerDefense,
        "computerDefense": combat.computerDefense,

        "newPlayerHealth": combat.newPlayerHealth,
        "newComputerHealth": combat.newComputerHealth,

        "playerWin": combat.playerWin,
        "computerWin": combat.computerWin,
    };
    return changes;
};

function prayerRemoveTickSplitter(combat: Combat, statusEffect: StatusEffect): Combat {
    const target = (statusEffect.prayer === PRAYERS.DAMAGE || statusEffect.prayer === PRAYERS.DEBUFF) ? statusEffect.enemyName : statusEffect.playerName;
    if (target === combat.player?.name) { 
        combat.playerEffects = combat.playerEffects.filter(effect => {
            if (effect.id !== statusEffect.id) return true; 
            if (effect.prayer === PRAYERS.DAMAGE || effect.prayer === PRAYERS.HEAL) return false;
            const matchingWeapon: Equipment = combat.weapons.find(weapon => weapon?._id === effect.weapon.id) as Equipment;
            const matchingWeaponIndex: number = combat.weapons.indexOf(matchingWeapon);
            const matchingDebuffTarget: Equipment = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget) as Equipment;
            const matchingDebuffTargetIndex: number = combat.weapons.indexOf(matchingDebuffTarget);
            if (effect.prayer === PRAYERS.BUFF) { 
                const deBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingWeaponIndex] as Equipment, false);
                combat.playerDefense = deBuff.defense;
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
            };
            if (effect.prayer === PRAYERS.DEBUFF) { 
                const reBuff = stripEffect(effect, combat.playerDefense as Defense, combat.weapons[matchingDebuffTargetIndex] as Equipment, true);
                combat.playerDefense = reBuff.defense;
                combat.weapons[matchingDebuffTargetIndex] = reBuff.weapon;
            };
            if (effect.prayer === PRAYERS.INSIGHT) {
                combat.isInsight = false;
            };
            if (effect.prayer === PRAYERS.QUICKEN) {
                combat.isQuicken = false;
            };
            return false;
        });
    } else if (target === combat.computer?.name) {
        combat.computerEffects = combat.computerEffects.filter(effect => {
            if (effect.id !== statusEffect.id) return true;
            if (effect.prayer === PRAYERS.DAMAGE || effect.prayer === PRAYERS.HEAL) return false;
            const matchingWeapon: Equipment = combat.computerWeapons.find(weapon => weapon._id === effect.weapon.id) as Equipment;
            const matchingWeaponIndex: number = combat.computerWeapons.indexOf(matchingWeapon);
            const matchingDebuffTarget: Equipment = combat.computerWeapons.find(weapon => weapon.name === effect.debuffTarget) as Equipment;
            const matchingDebuffTargetIndex: number = combat.computerWeapons.indexOf(matchingDebuffTarget);
            if (effect.prayer === PRAYERS.BUFF) { 
                const deBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingWeaponIndex], false);
                combat.computerDefense = deBuff.defense;
                combat.computerWeapons[matchingWeaponIndex] = deBuff.weapon;
            };
            if (effect.prayer === PRAYERS.DEBUFF) { 
                const reBuff = stripEffect(effect, combat.computerDefense as Defense, combat.computerWeapons[matchingDebuffTargetIndex], true);
                combat.computerDefense = reBuff.defense;
                combat.computerWeapons[matchingDebuffTargetIndex] = reBuff.weapon;
            };
            return false;
        });
    };
    combat.playerEffects = combat.playerEffects.filter((effect: StatusEffect) => effect !== statusEffect);
    combat.computerEffects = combat.computerEffects.filter((effect: StatusEffect) => effect !== statusEffect);
    return combat;
};


// ================================= VALIDATOR - SPLITTERS ===================================== \\

function validate(combat: Combat): boolean {
    return (combat.player !== undefined && combat.computer !== undefined && combat.player !== undefined && combat.computer !== undefined);
};

// ================================= CONTROLLER - SERVICE ===================================== \\

function instantActionCompiler(combat: Combat): Combat | undefined {
    try {
        if (validate(combat) === false) return combat;
        const res = instantActionSplitter(combat);
        return res;
    } catch (err) {
        console.warn(err, "Error in the Instant Action Compiler of Game Services");
    };
};

function talentPrayerCompiler(combat: Combat, prayer: string) {
    try {
        if (validate(combat) === false) return combat;
        const res = talentPrayer(combat, prayer);
        return res;
    } catch (err) {
        console.warn(err, "Error in Talent Prayer Compiler");
    };
};

function consumePrayer(combat: Combat): Combat | undefined {
    try {
        if (validate(combat) === false) return combat;
        const res = consumePrayerSplitter(combat);
        return res;
    } catch (err) {
        console.warn(err, "Error in the Consume Prayer of Game Services");
    };
};

function weaponActionCompiler(combat: Combat): Combat | undefined {
    try {
        if (validate(combat) === false) return combat;
        const res = weaponActionSplitter(combat);
        return res as Combat;
    } catch (err) {
        console.warn(err, "Error in the Phaser Action Compiler of Game Services");
    };
};

function prayerEffectTick(data: { combat: Combat; effect: StatusEffect; effectTimer: number; }): Combat | undefined {
    try {
        if (!validate(data.combat)) return data.combat;
        const res = prayerEffectTickSplitter(data);
        return res;
    } catch (err) {
        console.warn(err, "Error in the Phaser Effect Tick of Game Services");
    };
};

function prayerRemoveTick(combat: Combat, statusEffect: StatusEffect): Combat | undefined {
    try {
        const res = prayerRemoveTickSplitter(combat, statusEffect);
        return res;
    } catch (err) {
        console.warn(err, "Error in the Phaser Effect Tick of Game Services");
    };
};


export {
    statusEffectCheck,
    prayerSplitter,
    instantActionCompiler,
    consumePrayer,
    weaponActionCompiler,
    prayerEffectTick,
    prayerRemoveTick,
    talentPrayerCompiler
};