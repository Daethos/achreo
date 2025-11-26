import { HitLocationResult } from "../game/phaser/HitDetection";
import Ascean, { initAscean } from "../models/ascean";
import Equipment, { initEquipment } from "../models/equipment";
import { Combat } from "../stores/combat";
import { ARMOR_WEIGHT, ARMORS, ACTION_TYPES, ATTACKS, DAMAGE, ENEMY_ATTACKS, HOLD_TYPES, STRONG_ATTACKS, STRONG_TYPES, ATTACK_TYPES, MASTERY, WEAPON_TYPES, DEITIES, FAITH_RARITY, DEFENSE_TYPE_TO_NUM, DAMAGE_TYPE_NUMS, DAMAGE_TYPE_TO_NUM, LOCATION_TO_NUM, DAMAGE_LOOKUP, ATTACK_LOOKUP, DUAL_ELIGIBILITY, ACTION_MULTIPLIER_LOOKUP, ENEMY_PRAYERS, THRESHOLD } from "./combatTypes";
import StatusEffect, { EFFECT, PRAYERS } from "../models/prayer";

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

export const initCombatAttributes: CombatAttributes = {
    rawConstitution: 0,
    rawStrength: 0,
    rawAgility: 0,
    rawAchre: 0,
    rawCaeren: 0,
    rawKyosir: 0,

    rawConMod: 0,
    rawStrMod: 0,
    rawAgiMod: 0,
    rawAchMod: 0,
    rawCaerMod: 0,
    rawKyoMod: 0,
    
    totalConstitution: 0,
    totalStrength: 0,
    totalAgility: 0,
    totalAchre: 0,
    totalCaeren: 0,
    totalKyosir: 0,

    constitutionMod: 0,
    strengthMod: 0,
    agilityMod: 0,
    achreMod: 0,
    caerenMod: 0,
    kyosirMod: 0,

    equipConstitution: 0,
    equipStrength: 0,
    equipAgility: 0,
    equipAchre: 0,
    equipCaeren: 0,
    equipKyosir: 0,

    healthTotal: 0,
    initiative: 0,
    stamina: 0,
    grace: 0
};

export const initDefense: Defense = {
    physicalDefenseModifier: 0,
    magicalDefenseModifier: 0,
    physicalPosture: 0,
    magicalPosture: 0
};

export const initCombatStats: CombatStats = {
    ascean: initAscean,
    attributes: initCombatAttributes,
    combatWeaponOne: initEquipment,
    combatWeaponTwo: initEquipment,
    combatWeaponThree: initEquipment,
    defense: initDefense
};

// ====================================== HELPERS ====================================== \\

const getArmorTypeNum = (enemy: Ascean, locationNum: number): number => {
    switch (locationNum) {
        case 0: return DEFENSE_TYPE_TO_NUM.get(enemy.helmet.type) ?? 0; // head
        case 1: return DEFENSE_TYPE_TO_NUM.get(enemy.chest.type) ?? 0;  // chest  
        case 2: return DEFENSE_TYPE_TO_NUM.get(enemy.legs.type) ?? 0;   // legs
        default: return 0;
    };
};

const usesRandomness = (damageTypeNum: number): boolean => damageTypeNum >= DAMAGE_TYPE_NUMS.SLASH; // SLASH, WIND, SORCERY, WILD

export function roundToTwoDecimals(num: number, dec: number = 2): number {
    if (!num) return num;
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

export function computerCaerenic(caerenic: boolean): { pos: number, neg: number } {
    const pos = caerenic ? DAMAGE.CAERENEIC_POS : 1;
    const neg = caerenic ? DAMAGE.CAERENEIC_NEG : 1;
    return { pos, neg };
};

export function computerStalwart(stalwart: boolean): number {
    return stalwart ? DAMAGE.STALWART : 1;
};

export function damageTypeCompiler(damageType: string, enemy: Ascean, hitLocation: HitLocationResult,  physicalDamage: number, magicalDamage: number): { physicalDamage: number, magicalDamage: number } {
    const damageTypeNum = DAMAGE_TYPE_TO_NUM.get(damageType);
    if (damageTypeNum === undefined) return { physicalDamage, magicalDamage };
    
    const locationNum = LOCATION_TO_NUM.get(hitLocation.location);
    if (locationNum === undefined) return { physicalDamage, magicalDamage };
    
    const armorTypeNum = getArmorTypeNum(enemy, locationNum);
    const useRandom = usesRandomness(damageTypeNum);
    
    const multiplier = DAMAGE_LOOKUP[damageTypeNum][locationNum][armorTypeNum] + (useRandom ? Math.random() * ARMORS.RANDOM : 0);
    
    return {
        physicalDamage: physicalDamage * multiplier,
        magicalDamage: magicalDamage * multiplier
    };
};

function checkSpecials(combat: Combat) {
    if (combat.astrication.active === true) {
        combat.astrication.charges += 1;
    };
    if (combat.conviction.active === true) {
        const conviction = combat.conviction.talent ? DAMAGE.CUMULATIVE_TALENTED : DAMAGE.CUMULATIVE;
        combat.realizedPlayerDamage *= (1 + combat.conviction.charges * conviction);
        combat.conviction.charges += 1;
    };
    if (combat.berserk.active === true) {
        const berserk = combat.berserk.talent ? DAMAGE.CUMULATIVE_TALENTED : DAMAGE.CUMULATIVE;
        combat.realizedPlayerDamage *= (1 + combat.berserk.charges * berserk);
    };
    return combat;
};

export function criticalCompiler(player: boolean, ascean: Ascean, critChance: number, critClearance: number, weapon: Equipment, physicalDamage: number, magicalDamage: number, _weather: string, isSeering: boolean = false): { criticalSuccess: boolean, glancingBlow: boolean, physicalDamage: number, magicalDamage: number, isSeering: boolean } {
    if (critChance >= critClearance || isSeering) {
        const critMultiplier = weapon.criticalDamage;
        return {
            criticalSuccess: true,
            glancingBlow: false,
            physicalDamage: physicalDamage * critMultiplier,
            magicalDamage: magicalDamage * critMultiplier,
            isSeering: false
        };
    };
    
    if (player) {
        const skills = ascean.skills;
        let skill: number = 1;
        
        if (weapon.type === "Ancient Shard") {
            skill = skills[weapon.damageType?.[0] as keyof typeof skills] || 1;
        } else {
            skill = skills[weapon.type as keyof typeof skills] || 1;
        };
        
        const modifier = skill / (ascean.level * 100);
        const glancingThreshold = critClearance / 100;
        
        if (glancingThreshold >= modifier) {
            const glancingMultiplier = 1 - glancingThreshold;
            return {
                criticalSuccess: false,
                glancingBlow: true,
                physicalDamage: physicalDamage * glancingMultiplier,
                magicalDamage: magicalDamage * glancingMultiplier,
                isSeering: false
            };
        };
    } else {
        const thresholdDiff = critClearance - critChance - ascean.level;
        
        if (thresholdDiff >= 20) {
            const steps = Math.floor((thresholdDiff - 20) / 5);
            const glancingMultiplier = Math.max(0.1, 0.7 - (steps * 0.05));
            
            return {
                criticalSuccess: false,
                glancingBlow: true,
                physicalDamage: physicalDamage * glancingMultiplier,
                magicalDamage: magicalDamage * glancingMultiplier,
                isSeering: false
            };
        };
    };
    
    return { criticalSuccess: false, glancingBlow: false, physicalDamage, magicalDamage, isSeering: false };
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
//                 physicalDamage *= DAMAGE.ONE_TEN;
//                 magicalDamage *= DAMAGE.ONE_TEN;
//             };
//             break;
//         case "Astralands":
//             magicalDamage *= DAMAGE.ONE_TEN;
//             physicalDamage *= DAMAGE.ONE_TEN;
//             break;
//         case "Fangs": 
//             if (weapon.attackType === ATTACK_TYPES.PHYSICAL) {
//                 if (weapon.type !== WEAPON_TYPES.BOW && weapon.type !== WEAPON_TYPES.GREATBOW) {
//                     physicalDamage *= DAMAGE.ONE_TEN; // +10% Physical Melee Damage
//                 } else {
//                     physicalDamage *= DAMAGE.NINETY; // -10% Physical Ranged Damage
//                 };
//             } else {
//                 if (weapon?.damageType?.includes(DAMAGE_TYPES.FIRE) || weapon?.damageType?.includes(DAMAGE_TYPES.FROST) || weapon?.damageType?.includes(DAMAGE_TYPES.EARTH) || weapon?.damageType?.includes(DAMAGE_TYPES.WIND) || weapon?.damageType?.includes(DAMAGE_TYPES.LIGHTNING) || weapon?.damageType?.includes(DAMAGE_TYPES.WILD)) {
//                     magicalDamage *= DAMAGE.ONE_TEN; // +10% Magical Damage
//                 };
//             };
//             if (weapon?.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.ONE_TEN; // +10% Magical Damage
//             };
//             break;
//         case "Firelands":
//             physicalDamage *= DAMAGE.ONE_TEN;
//             magicalDamage *= DAMAGE.ONE_TEN;
//             if (critical === true) {
//                 magicalDamage *= DAMAGE.ONE_THIRTY;
//                 physicalDamage *= DAMAGE.ONE_THIRTY;
//             };
//             break;
//         case "Kingdom":
//             physicalDamage *= DAMAGE.ONE_TEN;
//             if (weapon?.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.ONE_TEN;
//                 physicalDamage *= DAMAGE.ONE_TEN;
//             };
//             break;
//         case "Licivitas":
//             if (weapon?.influences?.[0] === DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.ONE_FIFTEEN;
//                 physicalDamage *= DAMAGE.ONE_FIFTEEN;
//             };
//             if (critical === true) {
//                 magicalDamage *= DAMAGE.ONE_THIRTY;
//                 physicalDamage *= DAMAGE.ONE_THIRTY;
//             };
//             break;
//         case "Sedyrus":
//             magicalDamage *= DAMAGE.ONE_TEN;
//             if (weapon?.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.ONE_TEN;
//                 physicalDamage *= DAMAGE.ONE_TEN;
//             };
//             if (weapon.type === WEAPON_TYPES.BOW || weapon.type === WEAPON_TYPES.GREATBOW) {
//                 physicalDamage *= DAMAGE.ONE_TEN;
//                 magicalDamage *= DAMAGE.ONE_TEN;
//             };
//             if (critical === true) {
//                 magicalDamage *= DAMAGE.ONE_TEN;
//                 physicalDamage *= DAMAGE.ONE_TEN;
//             };
//             break;
//         case "Soverains":
//             magicalDamage *= DAMAGE.ONE_TEN;
//             if (weapon.influences?.[0] !== DEITIES.DAETHOS) {
//                 magicalDamage *= DAMAGE.ONE_TEN;
//                 physicalDamage *= DAMAGE.ONE_TEN;
//             };
//             break;
//         default:
//             break;
//     };
//     return { magicalDamage, physicalDamage };
// };

function damageTick(combat: Combat, effect: StatusEffect, player: boolean): Combat {
    const caer = caerenic(combat.caerenic);
    const stal = stalwart(combat.stalwart);
    const computerCaer = computerCaerenic(combat.computerCaerenic);
    const computerStal = computerStalwart(combat.computerStalwart);

    if (player) {
        const playerDamage = effect.effect.damage as number * DAMAGE.TICK_FULL * caer.pos * computerCaer.neg * computerStal;
        combat.newComputerHealth -= playerDamage;
        combat.realizedPlayerDamage += playerDamage;
        combat.computerDamaged = true;
        if (combat.newComputerHealth < 0) {
            combat.newComputerHealth = 0;
            combat.computerWin = false;
            combat.playerWin = true;
        };
        combat.playerSpecialDescription = `${combat.computer?.name} is damaged for ${Math.round(playerDamage)} from your ${effect.name}.`;
    } else {
        const computerDamage = effect.effect.damage as number * DAMAGE.TICK_FULL * caer.neg * computerCaer.pos * stal;
        combat.newPlayerHealth -= computerDamage;
        combat.realizedComputerDamage += computerDamage;
        combat.playerDamaged = true;
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
        const matchingWeapon = combat.weapons.find(weapon => weapon?._id === effect.weapon.id) as Equipment;
        const matchingWeaponIndex = combat.weapons.indexOf(matchingWeapon);
        const matchingDebuffTarget = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget) as Equipment;
        const matchingDebuffTargetIndex = combat.weapons.indexOf(matchingDebuffTarget);
        if ((effect.endTime <= combat.combatTimer || combat.playerWin === true || combat.computerWin === true)) { // The Effect Expires, Now checking for Nmae too || && effect.enemyName === combat.computer.name
            if (effect.prayer === PRAYERS.BUFF) { // Reverses the Buff Effect to the magnitude of the stack to the proper weapon
                const deBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingWeaponIndex], false);
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
                combat.playerDefense = deBuff.defense;
            };
            if (effect.prayer === PRAYERS.DEBUFF) { // Revereses the Debuff Effect to the proper weapon
                const reBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingDebuffTargetIndex], true);
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

function applyEffectLogic(combat: Combat, effect: StatusEffect, weapon: Equipment, isPlayer: boolean) {
    switch (effect.prayer) {
        case PRAYERS.BUFF:
            const buff = applyEffect(effect, isPlayer ? combat.playerDefense : combat.computerDefense!, weapon, true);
            if (isPlayer) {
                combat.playerDefense = buff.defense;
            } else {
                combat.computerDefense = buff.defense;
            };
            weapon = buff.weapon;
            break;
        case PRAYERS.DAMAGE:
            damageTick(combat, effect, true);
            break;
        case PRAYERS.DISPEL:
            if (combat.computerEffects.length > 0) computerDispel(combat);
            if (isPlayer) combat.playerEffects.pop();
            break;
        case PRAYERS.INSIGHT:
            combat.isInsight = true;
            break;
        case PRAYERS.QUICKEN:
            combat.isQuicken = true;
            break;
        case PRAYERS.DEBUFF:
            const debuff = applyEffect(effect, isPlayer ? combat.computerDefense! : combat.playerDefense, weapon, false);
            if (isPlayer) {
                combat.computerDefense = debuff.defense;
            } else {
                combat.playerDefense = debuff.defense;
            };
            weapon = debuff.weapon;
            break;
        case PRAYERS.HEAL:
            healTick(combat, effect, true);
            break;
    };
};

export function faithSuccess(combat: Combat, name: string, weapon: Equipment, index: number): Combat {
    const desc = index === 0 ? "" : "Two"
    const blessing = name === "player" ? combat.playerBlessing : combat.computerBlessing;
    const negativeEffect = blessing === PRAYERS.DAMAGE || blessing === PRAYERS.DEBUFF;
    const effectName = `Gift of ${weapon.influences?.[0]}`;

    if (name === "player") {
        combat.prayerData.push(blessing);
        combat.deityData.push(weapon.influences?.[0] as string);
        combat.religiousSuccess = true;
        const targetEffects = negativeEffect ? combat.computerEffects : combat.playerEffects;
        const effectIndex = targetEffects.findIndex(effect => effect.name === effectName && effect.prayer === blessing);

        if (effectIndex === -1) {
            const newEffect = new StatusEffect(combat, combat.player, combat.computer!, weapon, combat.playerAttributes, blessing);
            targetEffects.push(newEffect);
            applyEffectLogic(combat, newEffect, weapon, true);
        } else {
            const existingEffect = targetEffects[effectIndex];
            if (existingEffect.stacks) {
                // Update the effect in the array directly
                targetEffects[effectIndex] = StatusEffect.updateEffectStack(existingEffect, combat, combat.player, weapon);
                combat[`playerInfluenceDescription${desc}`] = `${targetEffects[effectIndex].description} Stacked ${targetEffects[effectIndex].activeStacks} times.`;
                applyEffectLogic(combat, targetEffects[effectIndex], weapon, true);
            } else if (existingEffect.refreshes) {
                // Simple refresh - reset duration completely
                const duration = Math.floor(combat.player.level / EFFECT.DURATION_MODIFIER + 1);
                const ceiling = EFFECT.DURATION_MAX + EFFECT.DURATION_MODIFIER;
                const ticks = duration > ceiling ? ceiling : duration;

                existingEffect.duration = ticks;
                existingEffect.endTime = combat.combatTimer + (ticks * EFFECT.DURATION_MODIFIER);
                existingEffect.activeRefreshes += 1;
                
                combat[`playerInfluenceDescription${desc}`] = `${existingEffect.description} Refreshed ${existingEffect.activeRefreshes} time(s).`;
                applyEffectLogic(combat, existingEffect, weapon, true);
            };
        };
    } else { // Computer Effect
        combat.computerReligiousSuccess = true;    
        const targetEffects = negativeEffect ? combat.playerEffects : combat.computerEffects;
        const effectIndex = targetEffects.findIndex(effect => effect.name === effectName && effect.prayer === blessing);

        if (effectIndex === -1) {
            const newEffect = new StatusEffect(combat, combat.computer!, combat.player, weapon, combat.playerAttributes, blessing);
            targetEffects.push(newEffect);
            applyEffectLogic(combat, newEffect, weapon, true);
        } else {
            const existingEffect = targetEffects[effectIndex];
            if (existingEffect.stacks) {
                // Update the effect in the array directly
                targetEffects[effectIndex] = StatusEffect.updateEffectStack(existingEffect, combat, combat.computer!, weapon);
                combat[`computerInfluenceDescription${desc}`] = `${targetEffects[effectIndex].description} Stacked ${targetEffects[effectIndex].activeStacks} times.`;
                applyEffectLogic(combat, targetEffects[effectIndex], weapon, false);
            } else if (existingEffect.refreshes) {
                // Simple refresh - reset duration completely
                const duration = Math.floor(combat.computer!.level / EFFECT.DURATION_MODIFIER + 1);
                const ceiling = EFFECT.DURATION_MAX + EFFECT.DURATION_MODIFIER;
                const ticks = duration > ceiling ? ceiling : duration;
                existingEffect.duration = ticks;
                existingEffect.endTime = combat.combatTimer + (ticks * EFFECT.DURATION_MODIFIER);
                existingEffect.activeRefreshes += 1;
                
                combat[`computerInfluenceDescription${desc}`] = `${existingEffect.description} Refreshed ${existingEffect.activeRefreshes} time(s).`;
                applyEffectLogic(combat, existingEffect, weapon, false);
            };
        };
    };
    return combat;
};

function addRarity(rarity: string, faith: number): number {
    faith += FAITH_RARITY[rarity];
    return faith;
};

function faithModCompiler(player: Ascean, faithOne: number, weaponOne: Equipment, faithTwo: number, weaponTwo: Equipment, amuletInfluence: string, trinketInfluence: string): { faithOne: number, faithTwo: number }{
    if (player.faith === "Devoted" && weaponOne.influences?.[0] === DEITIES.DAETHOS) faithOne += 3;
    if (player.faith === "Adherent" && weaponOne.influences?.[0] !== DEITIES.DAETHOS) faithOne += 3;
    if (player.faith === "Devoted" && weaponTwo.influences?.[0] === DEITIES.DAETHOS) faithTwo += 3;
    if (player.faith === "Adherent" && weaponTwo.influences?.[0] !== DEITIES.DAETHOS) faithTwo += 3;

    const w1Rarity = weaponOne.rarity as string, w2Rarity = weaponTwo.rarity as string, aRarity = player.amulet.rarity as string, tRarity = player.trinket.rarity as string;
    faithOne = addRarity(w1Rarity, faithOne);
    faithTwo = addRarity(w2Rarity, faithTwo); 
    if (weaponOne.influences?.[0] === amuletInfluence) faithOne = addRarity(aRarity, faithOne); 
    if (weaponTwo.influences?.[0] === amuletInfluence) faithTwo = addRarity(aRarity, faithTwo); 
    if (weaponOne.influences?.[0] === trinketInfluence) faithOne = addRarity(tRarity, faithOne);
    if (weaponTwo.influences?.[0] === trinketInfluence) faithTwo = addRarity(tRarity, faithTwo);
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
    const playerFaith = faithModCompiler(combat.player, faithNumber, combat.weapons[0], faithNumberTwo, combat.weapons[1], combat.player.amulet?.influences?.[0] as string, combat.player.trinket?.influences?.[0] as string);
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
//         armorRating: (combat?.computerDefense?.physicalPosture as number) + (combat?.computerDefense?.magicalPosture  as number)  /  4,
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
    const computerCaer = computerCaerenic(combat.computerCaerenic);
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

    const resultOne = criticalCompiler(false, combat.computer as Ascean, weapOneCrit, weapOneClearance, weapons[0], computerWeaponOnePhysicalDamage, computerWeaponOneMagicalDamage, combat.weather);
    combat.computerGlancingBlow = resultOne.glancingBlow;
    combat.computerCriticalSuccess = resultOne.criticalSuccess;
    computerWeaponOnePhysicalDamage = resultOne.physicalDamage;
    computerWeaponOneMagicalDamage = resultOne.magicalDamage;
    if (weapOneCrit >= weapOneClearance) firstWeaponCrit = true;

    const resultTwo = criticalCompiler(false, combat.computer as Ascean, weapTwoCrit, weapTwoClearance, weapons[1], computerWeaponTwoPhysicalDamage, computerWeaponTwoMagicalDamage, combat.weather);
    combat.computerGlancingBlow = resultTwo.glancingBlow;
    combat.computerCriticalSuccess = resultTwo.criticalSuccess;
    computerWeaponTwoPhysicalDamage = resultTwo.physicalDamage;
    computerWeaponTwoMagicalDamage = resultTwo.magicalDamage;
    if (weapTwoCrit >= weapTwoClearance) secondWeaponCrit = true;
    
    computerWeaponOnePhysicalDamage *= penetrationCompiler(playerPhysicalDefense, weapons[0].physicalPenetration as number);
    computerWeaponOneMagicalDamage *= penetrationCompiler(playerMagicalDefense, weapons[0].magicalPenetration as number);
    computerWeaponTwoPhysicalDamage *= penetrationCompiler(playerPhysicalDefense, weapons[1].physicalPenetration as number);
    computerWeaponTwoMagicalDamage *= penetrationCompiler(playerMagicalDefense, weapons[1].magicalPenetration as number);

    const damageType = damageTypeCompiler(combat.computerDamageType, combat.player, combat.computerHitLocation, computerWeaponOnePhysicalDamage, computerWeaponOneMagicalDamage);
    computerWeaponOnePhysicalDamage = damageType.physicalDamage;
    computerWeaponOneMagicalDamage = damageType.magicalDamage;

    const damageTypeTwo = damageTypeCompiler(combat.computerDamageType, combat.player, combat.computerHitLocation, computerWeaponTwoPhysicalDamage, computerWeaponTwoMagicalDamage);
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

    let strength = combat.computerAttributes?.totalStrength as number + weapons[0].strength  + weapons[1].strength;
    let agility = combat.computerAttributes?.totalAgility as number + weapons[0].agility  + weapons[1].agility;
    let achre = combat.computerAttributes?.totalAchre as number + weapons[0].achre  + weapons[1].achre;
    let caeren = combat.computerAttributes?.totalCaeren as number + weapons[0].caeren  + weapons[1].caeren;

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
    if (computerAction === ACTION_TYPES.ATTACK) combat.realizedComputerDamage *= DAMAGE.ONE_TEN;
    if (computerAction === ACTION_TYPES.POSTURE) combat.realizedComputerDamage *= DAMAGE.NINETY;
    if (computerAction === ACTION_TYPES.ACHIRE) combat.realizedComputerDamage *= DAMAGE.ONE_TWENTY_FIVE;
    if (computerAction === ACTION_TYPES.QUOR) combat.realizedComputerDamage *= DAMAGE.TWO;
    if (computerAction === ACTION_TYPES.LEAP) combat.realizedComputerDamage *= DAMAGE.ONE_TWENTY_FIVE;
    if (computerAction === ACTION_TYPES.RUSH) combat.realizedComputerDamage *= DAMAGE.ONE_TWENTY_FIVE;
    if (computerAction === ACTION_TYPES.WRITHE) combat.realizedComputerDamage *= DAMAGE.ONE_TWENTY_FIVE;

    if (combat.prayerData.includes(PRAYERS.AVARICE)) combat.realizedComputerDamage *= DAMAGE.ONE_TEN;

    combat.realizedComputerDamage *= stal;
    combat.realizedComputerDamage *= caer.neg;
    combat.realizedComputerDamage *= computerCaer.pos;
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
    let computerWeapon = combat.computerWeapons[0] as Equipment;
    let computerTotalDamage: number = 0;
    let computerPhysicalDamage: number = computerWeapon.physicalDamage, computerMagicalDamage: number = computerWeapon.magicalDamage;
    let playerPhysicalDefense = combat.playerDefense.physicalDefenseModifier, playerMagicalDefense = combat.playerDefense.magicalDefenseModifier;
    const mastery = combat.computer?.mastery as string;
    const caer = caerenic(combat.caerenic);
    const stal = stalwart(combat.stalwart);
    if ((combat.action === ACTION_TYPES.POSTURE || combat.stalwart.active) && combat.computerParrySuccess !== true && combat.computerRollSuccess !== true) {
        playerPhysicalDefense = combat.playerDefense.physicalPosture;
        playerMagicalDefense = combat.playerDefense.magicalPosture;
    };

    bows: if (computerAction === ACTION_TYPES.ATTACK) {
        const grip = computerWeapon.grip as string, attackType = computerWeapon.attackType as string, weaponType = computerWeapon.type, offWeapon = combat.computerWeapons[1];

        if ((weaponType === WEAPON_TYPES.BOW || weaponType === WEAPON_TYPES.GREATBOW) && grip === HOLD_TYPES.TWO_HAND) {
            computerPhysicalDamage *= DAMAGE.ONE_THIRTY;
            computerMagicalDamage *= DAMAGE.ONE_THIRTY;
            break bows;
        };

        const lookupPath = ATTACK_LOOKUP[grip][attackType][mastery];
        const entry = lookupPath ?? { PHYSICAL: DAMAGE.ONE_TEN, MAGICAL: DAMAGE.ONE_TEN };
        const isMatching = lookupPath !== undefined;
        const elig = DUAL_ELIGIBILITY[grip][attackType];

        if (isMatching && elig) {
            let attrValue = combat.playerAttributes[elig.attribute];
            if (attrValue >= elig.threshold && elig.offCondition(offWeapon)) {
                combat.dualWielding = true;
                computerDualWieldCompiler(combat, playerPhysicalDefense, playerMagicalDefense);
                return combat;
            };
        };

        computerPhysicalDamage *= entry.PHYSICAL;
        computerMagicalDamage *= entry.MAGICAL;
    };
    if (computerAction === ACTION_TYPES.POSTURE) {
        if (combat.action) { // Dual Action (Trade)
            computerPhysicalDamage *= DAMAGE.ONE_TEN;
            computerMagicalDamage *= DAMAGE.ONE_TEN;
        } else { // Solo Action
            computerPhysicalDamage *= DAMAGE.NINETY;
            computerMagicalDamage *= DAMAGE.NINETY;
        };
    } else if (computerAction === ACTION_TYPES.ROLL) {
        const rollMult = combat.rollSuccess ? DAMAGE.ONE_FIFTEEN : DAMAGE.NINETY;
        computerPhysicalDamage *= rollMult;
        computerMagicalDamage *= rollMult;
    } else {
        const mult = ACTION_MULTIPLIER_LOOKUP[computerAction];
        if (mult) {
            computerPhysicalDamage *= mult.physical;
            computerMagicalDamage *= mult.magical;
        };
    };

    const criticalClearance = Math.floor(Math.random() * 101);
    let criticalChance = computerWeapon.criticalChance;
    criticalChance -= (combat.playerAttributes.kyosirMod / 2);
    // if (combat.weather === "Astralands") criticalChance += 10;
    const criticalResult = criticalCompiler(false, combat.computer as Ascean, criticalChance, criticalClearance, computerWeapon, computerPhysicalDamage, computerMagicalDamage, combat.weather);
    
    combat.computerGlancingBlow = criticalResult.glancingBlow;
    combat.computerCriticalSuccess = criticalResult.criticalSuccess;
    computerPhysicalDamage = criticalResult.physicalDamage;
    computerMagicalDamage = criticalResult.magicalDamage;
    
    const physicalPenetration = computerWeapon.physicalPenetration as number;
    const magicalPenetration = computerWeapon.magicalPenetration as number;
    computerPhysicalDamage *= penetrationCompiler(playerPhysicalDefense, physicalPenetration);
    computerMagicalDamage *= penetrationCompiler(playerMagicalDefense, magicalPenetration);
    
    const damageType = damageTypeCompiler(combat.computerDamageType, combat.player, combat.computerHitLocation, computerPhysicalDamage, computerMagicalDamage);
    computerPhysicalDamage = damageType.physicalDamage;
    computerMagicalDamage = damageType.magicalDamage;
    // const weatherResult = weatherEffectCheck(computerWeapon, computerMagicalDamage, computerPhysicalDamage, combat.weather, combat.computerCriticalSuccess);
    // computerPhysicalDamage = weatherResult.physicalDamage;
    // computerMagicalDamage = weatherResult.magicalDamage; 
    computerTotalDamage = computerPhysicalDamage + computerMagicalDamage;
    
    const computerCaer = computerCaerenic(combat.computerCaerenic);

    if (computerTotalDamage < 0) computerTotalDamage = 0;
    combat.realizedComputerDamage = computerTotalDamage;
    if (combat.action === ACTION_TYPES.ATTACK) combat.realizedComputerDamage *= DAMAGE.ONE_TEN;
    if (combat.action === ACTION_TYPES.POSTURE) combat.realizedComputerDamage *= DAMAGE.NINETY;
    if (combat.prayerData.includes(PRAYERS.AVARICE)) combat.realizedComputerDamage *= DAMAGE.ONE_TEN;
    combat.realizedComputerDamage *= stal;
    combat.realizedComputerDamage *= caer.neg;
    combat.realizedComputerDamage *= computerCaer.pos;
    if (combat.berserk.active === true) combat.berserk.charges += 1;
    combat.newPlayerHealth -= combat.realizedComputerDamage;

    combat.computerActionDescription = `${combat.computer?.name} ${ENEMY_ATTACKS[combat.computerAction as keyof typeof ENEMY_ATTACKS]} you with their ${computerWeapon.name} for ${Math.round(computerTotalDamage)} ${combat.computerDamageType} ${combat.computerCriticalSuccess === true ? "damage (Critical)" : combat.computerGlancingBlow === true ? "damage (Glancing)" : "damage"}.`;
    
    if (combat.newPlayerHealth <= 0) {
        if (combat.playerEffects.find(effect => effect.prayer === PRAYERS.DENIAL)) {
            combat.newPlayerHealth = 1;
            combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== PRAYERS.DENIAL);
        } else {
            combat.newPlayerHealth = 0;
            combat.computerWin = true;
        };
    };

    combat.computerWin = combat.newPlayerHealth <= 0;
    combat.playerWin = combat.newComputerHealth <= 0;

    return combat;
}; 
    
function computerRollCompiler(combat: Combat, playerAction: string, computerAction: string): Combat {
    let computerRoll = combat.computerWeapons[0].roll;
    let rollCatch = Math.floor(Math.random() * 101) + (combat.playerAttributes.kyosirMod / 3);
    // if (combat.weather === "Alluring Isles") computerRoll -= 10;
    // if (combat.weather === "Kingdom" || combat.weather === "Sedyrus") computerRoll -= 5;
    // if (combat.weather === "Fangs" || combat.weather === "Roll") computerRoll += 5;
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
    const computer = combat.computer as Ascean;
    const weapons = combat.weapons;
    let playerWeaponOnePhysicalDamage = weapons[0].physicalDamage;
    let playerWeaponOneMagicalDamage = weapons[0].magicalDamage;
    let playerWeaponTwoPhysicalDamage = weapons[1].physicalDamage;
    let playerWeaponTwoMagicalDamage = weapons[1].magicalDamage;
    let playerWeaponOneTotalDamage;
    let playerWeaponTwoTotalDamage;
    let firstWeaponCrit = false;
    let secondWeaponCrit = false;
    const caer = caerenic(combat.caerenic);
    const weapOneClearance = Math.floor(Math.random() * 10100) / 100;
    const weapTwoClearance = Math.floor(Math.random() * 10100) / 100;
    let weapOneCrit = weapons[0].criticalChance
    let weapTwoCrit = weapons[1].criticalChance;
    weapOneCrit -= (combat.computerAttributes?.kyosirMod as number / 2);
    weapTwoCrit -= (combat.computerAttributes?.kyosirMod as number / 2);

    const resultOne = criticalCompiler(true, combat.player, weapOneCrit, weapOneClearance, weapons[0], playerWeaponOnePhysicalDamage, playerWeaponOneMagicalDamage, combat.weather, combat.isSeering);
    combat.criticalSuccess = resultOne.criticalSuccess;
    combat.glancingBlow = resultOne.glancingBlow;
    playerWeaponOnePhysicalDamage = resultOne.physicalDamage;
    playerWeaponOneMagicalDamage = resultOne.magicalDamage;

    if (weapOneCrit >= weapOneClearance) firstWeaponCrit = true;

    const resultTwo = criticalCompiler(true, combat.player, weapTwoCrit, weapTwoClearance, weapons[1], playerWeaponTwoPhysicalDamage, playerWeaponTwoMagicalDamage, combat.weather, combat.isSeering);
    combat.criticalSuccess = resultTwo.criticalSuccess;
    combat.glancingBlow = resultTwo.glancingBlow;
    combat.isSeering = resultTwo.isSeering;
    playerWeaponTwoPhysicalDamage = resultTwo.physicalDamage;
    playerWeaponTwoMagicalDamage = resultTwo.magicalDamage;

    if (weapTwoCrit >= weapTwoClearance) secondWeaponCrit = true;
    
    playerWeaponOnePhysicalDamage *= penetrationCompiler(computerPhysicalDefense, weapons[0].physicalPenetration!);
    playerWeaponOneMagicalDamage *= penetrationCompiler(computerMagicalDefense, weapons[0].magicalPenetration!);

    playerWeaponTwoPhysicalDamage *= penetrationCompiler(computerPhysicalDefense, weapons[1].physicalPenetration!);
    playerWeaponTwoMagicalDamage *= penetrationCompiler(computerMagicalDefense, weapons[1].magicalPenetration!);

    const damageType = damageTypeCompiler(combat.playerDamageType, computer, combat.hitLocation, playerWeaponOnePhysicalDamage, playerWeaponOneMagicalDamage);
    playerWeaponOnePhysicalDamage = damageType.physicalDamage;
    playerWeaponOneMagicalDamage = damageType.magicalDamage;

    const damageTypeTwo = damageTypeCompiler(combat.playerDamageType, computer, combat.hitLocation, playerWeaponTwoPhysicalDamage, playerWeaponTwoMagicalDamage);
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
    let strength = combat.playerAttributes.totalStrength + weapons[0].strength + weapons[1].strength;
    let agility = combat.playerAttributes.totalAgility + weapons[0].agility + weapons[1].agility;
    let achre = combat.playerAttributes.totalAchre + weapons[0].achre + weapons[1].achre;
    let caeren = combat.playerAttributes.totalCaeren + weapons[0].caeren + weapons[1].caeren;

    if (weapons[0]?.grip === HOLD_TYPES.ONE_HAND) {
        if (weapons[0]?.attackType === ATTACK_TYPES.PHYSICAL) {
            combat.realizedPlayerDamage *= (agility / THRESHOLD.ONE_HAND);
        } else {
            combat.realizedPlayerDamage *= (achre / THRESHOLD.ONE_HAND);
        };
    };

    if (weapons[0]?.grip === HOLD_TYPES.TWO_HAND) {
        if (weapons[0]?.attackType === ATTACK_TYPES.PHYSICAL) {
            combat.realizedPlayerDamage *= (strength / THRESHOLD.TWO_HAND);
        } else {
            combat.realizedPlayerDamage *= (caeren / THRESHOLD.TWO_HAND);
        };
    };

    if (combat.computerAction === ACTION_TYPES.ATTACK) {
        combat.realizedPlayerDamage *= DAMAGE.ONE_TEN;
    };
    if (combat.computerAction === ACTION_TYPES.POSTURE) {
        combat.realizedPlayerDamage *= DAMAGE.NINETY;
    };

    combat.realizedPlayerDamage *= caer.pos;
    
    const computerCaer = computerCaerenic(combat.computerCaerenic);
    const computerStal = computerStalwart(combat.computerStalwart);

    combat.realizedPlayerDamage *= computerCaer.neg * computerStal;

    combat = checkSpecials(combat);

    combat.newComputerHealth -= combat.realizedPlayerDamage;

    if (combat.newComputerHealth <= 0) {
        combat.newComputerHealth = 0;
        combat.playerWin = true;
    };
  
    // ==================== STATISTIC LOGIC ====================
    combat.typeAttackData.push(weapons[0].attackType as string, weapons[1].attackType as string);
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

    const mainWeapon = combat.weapons[0], offWeapon = combat.weapons[1];
    const mastery = combat.player.mastery as string;
    const caer = caerenic(combat.caerenic);
    const computerCaer = computerCaerenic(combat.computerCaerenic);
    const computerStal = computerStalwart(combat.computerStalwart);
    let playerPhysicalDamage = mainWeapon.physicalDamage as number, playerMagicalDamage = mainWeapon.magicalDamage as number;
    let computerPhysicalDefense = combat.computerDefense?.physicalDefenseModifier as number, computerMagicalDefense = combat.computerDefense?.magicalDefenseModifier as number;
    let physPen = mainWeapon.physicalPenetration as number, magPen = mainWeapon.magicalPenetration as number;

    if ((combat.computerAction === ACTION_TYPES.POSTURE || combat.computerStalwart) && !combat.parrySuccess && !combat.rollSuccess) {
        computerPhysicalDefense = combat.computerDefense?.physicalPosture as number;
        computerMagicalDefense = combat.computerDefense?.magicalPosture as number;
    };

    bows: if (playerAction === ACTION_TYPES.ATTACK) {
        const grip = mainWeapon.grip as string, attackType = mainWeapon.attackType as string, weaponType = mainWeapon.type;

        if ((weaponType === WEAPON_TYPES.BOW || weaponType === WEAPON_TYPES.GREATBOW) && grip === HOLD_TYPES.TWO_HAND) {
            playerPhysicalDamage *= DAMAGE.ONE_THIRTY;
            playerMagicalDamage *= DAMAGE.ONE_THIRTY;
            break bows;
        };

        const lookupPath = ATTACK_LOOKUP[grip][attackType][mastery];
        const entry = lookupPath ?? { PHYSICAL: DAMAGE.ONE_TEN, MAGICAL: DAMAGE.ONE_TEN };
        const isMatching = lookupPath !== undefined;
        const elig = DUAL_ELIGIBILITY[grip][attackType];

        if (isMatching && elig) {
            let attrValue = combat.playerAttributes[elig.attribute];
            if (attrValue >= elig.threshold && elig.offCondition(offWeapon)) {
                combat.dualWielding = true;
                dualWieldCompiler(combat, computerPhysicalDefense, computerMagicalDefense);
                return combat;
            };
        };

        playerPhysicalDamage *= entry.PHYSICAL;
        playerMagicalDamage *= entry.MAGICAL;
    };
        
    if (playerAction === ACTION_TYPES.POSTURE) {
        if (combat.physicals.posture.optimized) {
            const num = 1 + (combat.player.shield.magicalResistance! + (combat.player.shield.physicalResistance!)) / 200;
            playerPhysicalDamage *= num;
            playerMagicalDamage *= num;
        };
        if (combat.computerAction) { // Dual Action (Trade)
            playerPhysicalDamage *= DAMAGE.ONE_TEN;
            playerMagicalDamage *= DAMAGE.ONE_TEN;
        } else { // Solo Action
            playerPhysicalDamage *= DAMAGE.NINETY;
            playerMagicalDamage *= DAMAGE.NINETY;
        };
    } else if (playerAction === ACTION_TYPES.ROLL) {
        const rollMult = combat.rollSuccess ? DAMAGE.ONE_FIFTEEN : DAMAGE.NINETY;
        playerPhysicalDamage *= rollMult;
        playerMagicalDamage *= rollMult;
    } else {
        const mult = ACTION_MULTIPLIER_LOOKUP[playerAction];
        if (mult) {
            playerPhysicalDamage *= mult.physical;
            playerMagicalDamage *= mult.magical;
        };
    };
    
    const criticalClearance = Math.floor(Math.random() * 10100) / 100;
    let criticalChance = mainWeapon.criticalChance as number;
    criticalChance -= (combat.computerAttributes?.kyosirMod as number / 2);
    
    const criticalResult = criticalCompiler(true, combat.player, criticalChance, criticalClearance, combat.weapons[0], playerPhysicalDamage, playerMagicalDamage, combat.weather, combat.isSeering);
    combat.criticalSuccess = criticalResult.criticalSuccess;
    combat.glancingBlow = criticalResult.glancingBlow;
    combat.isSeering = criticalResult.isSeering;
    
    playerPhysicalDamage = criticalResult.physicalDamage;
    playerMagicalDamage = criticalResult.magicalDamage;

    playerPhysicalDamage *= penetrationCompiler(computerPhysicalDefense, physPen);
    playerMagicalDamage *= penetrationCompiler(computerMagicalDefense, magPen);

    const damageType = damageTypeCompiler(combat.playerDamageType, combat.computer as Ascean, combat.hitLocation, playerPhysicalDamage, playerMagicalDamage);
    playerPhysicalDamage = damageType.physicalDamage;
    playerMagicalDamage = damageType.magicalDamage;

    // const weatherResult = weatherEffectCheck(combat.weapons[0] as Equipment, playerMagicalDamage, playerPhysicalDamage, combat.weather, combat.criticalSuccess);
    // playerPhysicalDamage = weatherResult.physicalDamage;
    // playerMagicalDamage = weatherResult.magicalDamage;

    combat.realizedPlayerDamage = playerPhysicalDamage + playerMagicalDamage;
    
    combat.realizedPlayerDamage *= caer.pos;
    combat.realizedPlayerDamage *= (computerCaer.neg * computerStal);

    if (combat.computerAction === ACTION_TYPES.ATTACK) combat.realizedPlayerDamage *= DAMAGE.ONE_TEN;
    if (combat.computerAction === ACTION_TYPES.POSTURE) combat.realizedPlayerDamage *= DAMAGE.NINETY;

    if (combat.realizedPlayerDamage < 0) combat.realizedPlayerDamage = 0;

    combat = checkSpecials(combat);
    
    combat.newComputerHealth -= combat.realizedPlayerDamage;
    combat.typeAttackData.push(mainWeapon.attackType as string);
    combat.typeDamageData.push(combat.playerDamageType);
    
    const skill = mainWeapon.type === "Ancient Shard" ? mainWeapon.damageType?.[0] as string : mainWeapon.type;
    combat.skillData.push(skill);
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
    // if (combat.weather === "Alluring Isles") playerRoll -= 10;
    // if (combat.weather === "Kingdom" || combat.weather === "Sedyrus") playerRoll -= 5;
    // if (combat.weather === "Fangs" || combat.weather === "Roll") playerRoll += 5;

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
    let rollCatch: number = Math.floor(Math.random() * 101) + (combat.computerAttributes?.kyosirMod as number / 3);
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
                `You successfully roll and evade ${combat.computer?.name}, avoiding their ${computerAction.charAt(0).toUpperCase() + computerAction.slice(1)} attack`;
            attackCompiler(combat, playerAction);
        } else if (computerRoll > rollCatch && !combat.astrication.active) { // The Player Fails the Roll and the Computer Succeeds
            combat.playerSpecialDescription = 
                `You failed to roll and evade against ${combat.computer?.name}'s ${computerAction.charAt(0).toUpperCase() + computerAction.slice(1)} attack`;
            combat.computerSpecialDescription = 
                `${combat.computer?.name} successfully rolls and evades you, avoiding your ${playerAction.charAt(0).toUpperCase() + playerAction.slice(1)} attack`;
            computerAttackCompiler(combat, computerAction);
        } else { // Neither Player nor Computer Succeed
            combat.playerSpecialDescription = 
                `You failed to roll and evade against ${combat.computer?.name}'s ${computerAction.charAt(0).toUpperCase() + computerAction.slice(1)} attack`;
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${playerAction.charAt(0).toUpperCase() + playerAction.slice(1)} attack`;
            attackCompiler(combat, playerAction);
            computerAttackCompiler(combat, computerAction);
        }
    } else { // The Computer has Higher Initiative
        if (computerRoll > rollCatch && !combat.astrication.active) { // The Computer Succeeds the Roll
            combat.computerSpecialDescription = 
                `${combat.computer?.name} successfully rolls and evades you, avoiding your ${playerAction.charAt(0).toUpperCase() + playerAction.slice(1)} attack`;
            computerAttackCompiler(combat, computerAction);
        } else if (playerRoll > rollCatch) { // The Computer Fails the Roll and the Player Succeeds
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${playerAction.charAt(0).toUpperCase() + playerAction.slice(1)} attack`;
            combat.playerSpecialDescription = 
                `You successfully roll and evade ${combat.computer?.name}, avoiding their ${computerAction.charAt(0).toUpperCase() + computerAction.slice(1)} attack`;
            attackCompiler(combat, playerAction);
        } else { // Neither Computer nor Player Succeed
            combat.computerSpecialDescription = 
                `${combat.computer?.name} fails to roll against your ${playerAction.charAt(0).toUpperCase() + playerAction.slice(1)} attack`;
            combat.playerSpecialDescription = 
                `You failed to roll and evade against ${combat.computer?.name}'s ${computerAction.charAt(0).toUpperCase() + computerAction.slice(1)} attack`;
            computerAttackCompiler(combat, computerAction);
            attackCompiler(combat, playerAction);
        };
    };
    return combat;
};

function computerWeaponMaker(combat: Combat): Combat {
    let newPrayer = Math.floor(Math.random() * ENEMY_PRAYERS.length);
    combat.computerBlessing = ENEMY_PRAYERS[newPrayer];
    combat.computerDamagedType = combat.computerDamageType;
    
    const change = Math.floor(Math.random() * 101);
    
    if (change < 25) { // Rando Scramble
        combat.computerWeapons = [combat.computerWeapons[1], combat.computerWeapons[2], combat.computerWeapons[0]];
        combat.computerDamageType = combat.computerWeapons[0].damageType?.[0] as string;
        return combat;
    } else if (change < 50) { // Keep Set
        return combat;
    };

    const armorWeights: {[key:string]: number} = {"Leather-Cloth": 0,"Leather-Mail": 0,"Chain-Mail": 0,"Plate-Mail": 0};
    armorWeights[combat.player.helmet.type] += ARMOR_WEIGHT.helmet;
    armorWeights[combat.player.chest.type] += ARMOR_WEIGHT.chest;
    armorWeights[combat.player.legs.type] += ARMOR_WEIGHT.legs;

    let dominantArmor = "";
    let maxWeight = -1;
    for (const [type, weight] of Object.entries(armorWeights)) {
        if (weight > maxWeight) {
            maxWeight = weight;
            dominantArmor = type;
        };
    };

    const weaponScores: Array<{index: number, score: number, damageTypes: string[]}> = [];
    combat.computerWeapons.forEach((weapon, index) => {
        let bestScore = 0;
        const effectiveTypes: string[] = [];
        
        weapon.damageType?.forEach((damageType) => {
            if (STRONG_TYPES[dominantArmor]?.includes(damageType)) {
                if (bestScore < 4) {
                    bestScore = 4;
                    effectiveTypes.length = 0; // Clear previous types
                };
                if (bestScore === 4) effectiveTypes.push(damageType);
            };
        });
        if (weaponScores.length > 0) {
            weaponScores.sort((a, b) => b.score - a.score);
            const bestWeapon = weaponScores[0];
            
            if (bestWeapon.index === 1) {
                combat.computerWeapons = [combat.computerWeapons[1], combat.computerWeapons[0], combat.computerWeapons[2]];
            } else if (bestWeapon.index === 2) {
                combat.computerWeapons = [combat.computerWeapons[2], combat.computerWeapons[0], combat.computerWeapons[1]];
            };
            
            combat.computerDamageType = bestWeapon.damageTypes[Math.floor(Math.random() * bestWeapon.damageTypes.length)];
        };

        if (bestScore > 0) {
            weaponScores.push({index, score: bestScore, damageTypes: effectiveTypes});
        };
    });
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
    if (!phaserSuccessConcerns(newCombat.parrySuccess, newCombat.rollSuccess, newCombat.computerParrySuccess, newCombat.computerRollSuccess)) { // If both choose attack
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
    let cleanCombat = newDataCompiler(combat) as Combat;
    const playerActionLive = cleanCombat.action !== "";
    const computerActionLive = cleanCombat.computerAction !== "";

    if (playerActionLive && computerActionLive) {
        cleanCombat = dualActionSplitter(cleanCombat);
    } else if (playerActionLive && !computerActionLive) {
        if (cleanCombat.action === ACTION_TYPES.PARRY) return cleanCombat;
        cleanCombat = attackCompiler(cleanCombat, cleanCombat.action);
    } else if (!playerActionLive && computerActionLive) {
        if (cleanCombat.computerAction === ACTION_TYPES.PARRY) return cleanCombat;
        cleanCombat = computerAttackCompiler(cleanCombat, cleanCombat.computerAction);
    };

    cleanCombat = faithCompiler(cleanCombat);
    cleanCombat = computerWeaponMaker(cleanCombat);

    if (cleanCombat.parrySuccess && cleanCombat.physicals.parry.optimized) {
        cleanCombat = checkParryTalent(cleanCombat);
    };

    cleanCombat.action = "";
    cleanCombat.computerAction = "";
    cleanCombat.combatRound++;
    cleanCombat.sessionRound++;
    cleanCombat.playerDamaged = cleanCombat.realizedComputerDamage > 0 || cleanCombat.playerDamaged;
    cleanCombat.computerDamaged = cleanCombat.realizedPlayerDamage > 0 || cleanCombat.computerDamaged;
    
    if (cleanCombat.playerWin || cleanCombat.computerWin) {
        cleanCombat = statusEffectCheck(cleanCombat);
        if (cleanCombat.playerWin) cleanCombat.computerDeathDescription = `${cleanCombat.computer?.name} has been defeated.`;
        if (cleanCombat.computerWin) cleanCombat.playerDeathDescription = "You have been defeated.";
    };

    return cleanCombat;
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
        playerDamagedType: combat.playerDamagedType,
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
        computerDamagedType: combat.computerDamagedType,
        potentialPlayerDamage: 0, // All the Damage that is possible on hit for a player
        potentialComputerDamage: 0, // All the Damage that is possible on hit for a computer
        realizedPlayerDamage: 0, // Player Damage - Computer Defenses
        realizedComputerDamage: 0, // Computer Damage - Player Defenses
        playerDamaged: false,
        computerDamaged: false,
        hitLocation: combat.hitLocation,
        computerHitLocation: combat.computerHitLocation,
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
        computerCaerenic: combat.computerCaerenic,
        computerStalwart: combat.computerStalwart,
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
        isHostile: combat.isHostile,
        startedAggressive: combat.startedAggressive,
        physicals: combat.physicals,
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

function checkParryTalent(combat: Combat): Combat {
    const compDispel = combat.computerEffects.some((effect) => effect.prayer === PRAYERS.BUFF || effect.prayer === PRAYERS.HEAL);
    const playDispel = combat.playerEffects.some((effect) => effect.prayer === PRAYERS.DAMAGE || effect.prayer === PRAYERS.DEBUFF);
    if (compDispel && playDispel) {
        if (Math.random() > 0.5) {
            combat = computerDispel(combat);
        } else {
            combat = playerDispel(combat, true);
        };
    } else if (playDispel) {
        combat = playerDispel(combat, true);
    } else if (compDispel) {
        combat = computerDispel(combat);
    };
    return combat;
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

function playerDispel(combat: Combat, positive: boolean): Combat {
    if (positive) {
        const effect: StatusEffect = combat.playerEffects.find(effect => (effect.prayer === PRAYERS.DEBUFF || effect.prayer === PRAYERS.DAMAGE)) as StatusEffect;
        if (effect) {
            if (effect.prayer === PRAYERS.DEBUFF) {
                const matchingDebuffTarget = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget) as Equipment;
                const matchingDebuffTargetIndex = combat.weapons.indexOf(matchingDebuffTarget);
                const reBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingDebuffTargetIndex] as Equipment, true);
                combat.playerDefense = reBuff.defense;
                combat.weapons[matchingDebuffTargetIndex] = reBuff.weapon;
            };

            combat.playerEffects = combat.playerEffects.filter(prayer => prayer.id !== effect.id);
        };
    } else {
        const effect: StatusEffect = combat.playerEffects.find(effect => (effect.prayer !== PRAYERS.DEBUFF && effect.prayer !== PRAYERS.DAMAGE)) as StatusEffect;
        if (effect) {
            if (effect.prayer === PRAYERS.BUFF) {
                const matchingWeapon: Equipment = combat.weapons.find(weapon => weapon._id === effect.weapon.id) as Equipment;
                const matchingWeaponIndex: number = combat.weapons.indexOf(matchingWeapon);
                const deBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingWeaponIndex], false);
                combat.playerDefense = deBuff.defense;
                combat.weapons[matchingWeaponIndex] = deBuff.weapon; 
            };
        };
        combat.playerEffects = combat.playerEffects.filter(prayer => prayer.id !== effect.id);
    };
    return combat;
};

// ================================== ACTION - SPLITTERS ===================================== \\

function prayerSplitter(combat: Combat, prayer: string): Combat {
    let originalPrayer = combat.playerBlessing;
    combat.playerBlessing = prayer; 
    combat = faithSuccess(combat, "player", combat.weapons[0], 0);
    combat.playerBlessing = originalPrayer;
    return combat;
};

function instantDamageSplitter(combat: Combat, mastery: string): Combat {
    const caer = caerenic(combat.caerenic);
    const computerCaer = computerCaerenic(combat.computerCaerenic);
    const computerStal = computerStalwart(combat.computerStalwart);
    let damage = combat.player[mastery] * (1 + (combat.player.level / 10)) * caer.pos * computerCaer.neg * computerStal;
    combat.realizedPlayerDamage = damage;
    combat.newComputerHealth -= combat.realizedPlayerDamage;
    combat.computerDamaged = true;
    combat.playerAction = "invoke";
    combat.playerActionDescription = `You tshaer ${combat.computer?.name}'s caeren with your ${combat.player.mastery}'s Invocation of ${combat.weapons[0]?.influences?.[0]} for ${Math.round(damage)} Damage.`;    
    return combat;
};

function talentPrayer(combat: Combat, prayer: string) {
    combat = prayerSplitter(combat, prayer);
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
    switch (combat.player.mastery) {
        case MASTERY.CONSTITUTION:
            combat = prayerSplitter(combat, PRAYERS.HEAL);
            combat = prayerSplitter(combat, PRAYERS.BUFF);
            break;
        case MASTERY.STRENGTH:
            combat = prayerSplitter(combat, combat.playerBlessing);
            combat = instantDamageSplitter(combat, MASTERY.STRENGTH);
            break;
        case MASTERY.AGILITY:
            combat = prayerSplitter(combat, combat.playerBlessing);
            combat = instantDamageSplitter(combat, MASTERY.AGILITY);
            break;
        case MASTERY.ACHRE:
            combat = prayerSplitter(combat, combat.playerBlessing);
            combat = instantDamageSplitter(combat, MASTERY.ACHRE);
            break;
        case MASTERY.CAEREN:
            combat = prayerSplitter(combat, combat.playerBlessing);
            combat = instantDamageSplitter(combat, MASTERY.CAEREN);
            break;
        case MASTERY.KYOSIR:
            combat = prayerSplitter(combat, PRAYERS.DAMAGE);
            combat = prayerSplitter(combat, PRAYERS.DEBUFF);
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
    const caer = caerenic(combat.caerenic);
    const computerCaer = computerCaerenic(combat.computerCaerenic);
    const computerStal = computerStalwart(combat.computerStalwart);
    combat.playerEffects = combat.playerEffects.filter(effect => {
        if (effect.id !== combat.prayerSacrificeId) return true; // || effect.enemyName !== combat.computer.name
        const matchingWeapon = combat.weapons.find(weapon => weapon?._id === effect.weapon.id) as Equipment;
        const matchingWeaponIndex = combat.weapons.indexOf(matchingWeapon);
        const matchingDebuffTarget = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget) as Equipment;
        const matchingDebuffTargetIndex = combat.weapons.indexOf(matchingDebuffTarget);

        switch (combat.prayerSacrifice) {
            case PRAYERS.HEAL:
                combat.newPlayerHealth += effect.effect?.healing as number * DAMAGE.TICK_HALF;
                if (combat.newPlayerHealth > 0) combat.computerWin = false;
                break;
            case PRAYERS.BUFF:
                const damage = combat.realizedPlayerDamage * DAMAGE.HALF * caer.pos * computerCaer.neg * computerStal;
                combat.newComputerHealth -= damage;
                combat.realizedPlayerDamage = damage;
                combat.computerDamaged = true;
                combat.playerActionDescription = `${combat.weapons[0]?.influences?.[0]}'s Tendrils serenade ${combat.computer?.name}, echoing ${Math.round(combat.realizedPlayerDamage * DAMAGE.HALF)} more damage.`    
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                };
                const deBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingWeaponIndex], false);
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
                combat.playerDefense = deBuff.defense;
                break;
            case PRAYERS.DAMAGE:
                combat.realizedPlayerDamage = effect.effect?.damage as number * DAMAGE.TICK_HALF * caer.pos * computerCaer.neg * computerStal;
                combat.newComputerHealth -= combat.realizedPlayerDamage;
                combat.computerDamaged = true;
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                }; 
                break;
            case PRAYERS.DEBUFF:
                combat.realizedPlayerDamage = combat.realizedComputerDamage * DAMAGE.HALF * caer.pos * computerCaer.neg * computerStal;
                combat.newComputerHealth -= combat.realizedPlayerDamage;
                combat.computerDamaged = true;
                combat.playerActionDescription = `The Hush of ${combat.weapons[0]?.influences?.[0]} wracks ${combat.computer?.name}, wearing for ${Math.round(combat.realizedComputerDamage * DAMAGE.HALF)} more damage.`;   
            
                if (combat.newComputerHealth <= 0) {
                    combat.newComputerHealth = 0;
                    combat.playerWin = true;
                };
                const reBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingDebuffTargetIndex], true);
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
    if (effect.playerName === combat.player.name) { 
        if (effect.prayer === PRAYERS.DAMAGE) { 
            combat = damageTick(combat, effect, true);
        };
        if (effect.prayer === PRAYERS.HEAL) { 
            healTick(combat, effect, true);
        };  
    } else if (effect.playerName === combat.computer?.name) {
        if (effect.prayer === PRAYERS.DAMAGE) {
            combat = damageTick(combat, effect, false);
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

        "realizedPlayerDamage": combat.realizedPlayerDamage,
        "realizedComputerDamage": combat.realizedComputerDamage,

        "playerDamaged": combat.playerDamaged,
        "computerDamaged": combat.computerDamaged,

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
    if (target === combat.player.name) { 
        combat.playerEffects = combat.playerEffects.filter(effect => {
            if (effect.id !== statusEffect.id) return true; 
            if (effect.prayer === PRAYERS.DAMAGE || effect.prayer === PRAYERS.HEAL) return false;
            const matchingWeapon: Equipment = combat.weapons.find(weapon => weapon?._id === effect.weapon.id) as Equipment;
            const matchingWeaponIndex: number = combat.weapons.indexOf(matchingWeapon);
            const matchingDebuffTarget: Equipment = combat.weapons.find(weapon => weapon?.name === effect.debuffTarget) as Equipment;
            const matchingDebuffTargetIndex: number = combat.weapons.indexOf(matchingDebuffTarget);
            if (effect.prayer === PRAYERS.BUFF) { 
                const deBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingWeaponIndex], false);
                combat.playerDefense = deBuff.defense;
                combat.weapons[matchingWeaponIndex] = deBuff.weapon;
            };
            if (effect.prayer === PRAYERS.DEBUFF) { 
                const reBuff = stripEffect(effect, combat.playerDefense, combat.weapons[matchingDebuffTargetIndex], true);
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
        if (!validate(combat)) return combat;
        const res = instantActionSplitter(combat);
        return res;
    } catch (err) {
        console.warn(err, "Error in the Instant Action Compiler of Game Services");
    };
};

function talentPrayerCompiler(combat: Combat, prayer: string) {
    try {
        if (!validate(combat)) return combat;
        const res = talentPrayer(combat, prayer);
        return res;
    } catch (err) {
        console.warn(err, "Error in Talent Prayer Compiler");
    };
};

function consumePrayer(combat: Combat): Combat | undefined {
    try {
        if (!validate(combat)) return combat;
        const res = consumePrayerSplitter(combat);
        return res;
    } catch (err) {
        console.warn(err, "Error in the Consume Prayer of Game Services");
    };
};

function weaponActionCompiler(combat: Combat): Combat | undefined {
    try {
        if (!validate(combat)) return combat;
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