import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { ComputerCombat } from "../stores/computer";
import { computerCaerenic, computerStalwart, criticalCompiler, damageTypeCompiler, penetrationCompiler } from "./combat";
import { ACTION_TYPES, ARMOR_WEIGHT, ATTACK_TYPES, DAMAGE, HOLD_TYPES, MASTERY, STRONG_TYPES, THRESHOLD, WEAPON_TYPES } from "./combatTypes";
// import { PRAYERS } from "./prayer";

function computerWeaponMaker(combat: ComputerCombat): ComputerCombat {
    // let prayers = [PRAYERS.BUFF, PRAYERS.DAMAGE, PRAYERS.DEBUFF, PRAYERS.HEAL];
    // let newPrayer = Math.floor(Math.random() * prayers.length);
    // combat.computerBlessing = prayers[newPrayer];
    const change = Math.floor(Math.random() * 101);
    if (change < 50) {
        combat.computerWeapons = [combat.computerWeapons[1], combat.computerWeapons[2], combat.computerWeapons[0]];
        combat.computerDamageType = combat.computerWeapons[0]?.damageType?.[0] as string;
        return combat;
    };
    let defenseTypes: any = {"Leather-Cloth": 0,"Leather-Mail": 0,"Chain-Mail": 0,"Plate-Mail": 0};
    defenseTypes[combat.computerEnemy?.helmet.type as keyof typeof defenseTypes] += ARMOR_WEIGHT.helmet;
    defenseTypes[combat.computerEnemy?.chest.type as keyof typeof defenseTypes] += ARMOR_WEIGHT.chest;
    defenseTypes[combat.computerEnemy?.legs.type as keyof typeof defenseTypes] += ARMOR_WEIGHT.legs;
    const sortedDefenses = Object.entries(defenseTypes)
        .sort((a, b) => b[1] as number - (a[1] as number)) // Sort based on the values in descending order
        .map(([type, weight]) => ({ type, weight })); // Convert back to an array of objects

    let computerTypes: any = {0: [],1: [],2: []};
    combat.computerWeapons.forEach((weapon, index) => {
        weapon?.damageType?.forEach((type) => {
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

function doubleRollCompiler(combat: ComputerCombat, combatTwo: ComputerCombat, combatOneInitiative: number, combatTwoInitiative: number) {
    let computerOneRoll: number = combat.computerWeapons?.[0]?.roll as number;
    let computerTwoRoll: number = combatTwo.computerWeapons?.[0]?.roll as number;
    let computerRollCatch: number = Math.floor(Math.random() * 101) + (combat.computerAttributes?.kyosirMod as number / 2);
    let computerTwoRollCatch: number = Math.floor(Math.random() * 101) + (combatTwo.computerAttributes?.kyosirMod as number / 2);

    if (combatOneInitiative >= combatTwoInitiative) { // Computer One Higher Initiative
        if (computerOneRoll >= computerTwoRollCatch) { // Computer One Succeeds the Roll
            combat.rollSuccess = true;
            combatTwo.computerEnemyRollSuccess = true;
            attackCompiler(combat);
        } else if (computerTwoRoll >= computerTwoRollCatch) { // Computer One Fails the Roll and the Computer Succeeds
            combatTwo.rollSuccess = true;
            combat.computerEnemyRollSuccess = true;
            attackCompiler(combatTwo);
        } else { // Neither Player nor Computer Succeed
            attackCompiler(combat);
            if (!combat.computerWin) attackCompiler(combatTwo);
        };
    } else { // Computer Two has Higher Initiative
        if (computerTwoRoll >= computerRollCatch) { // Computer Two Succeeds the Roll
            combatTwo.rollSuccess = true;
            combat.computerEnemyRollSuccess = true;
            attackCompiler(combatTwo);
        } else if (computerOneRoll >= computerRollCatch) { // Computer Two Fails the Roll and the Player Succeeds
            combat.rollSuccess = true;
            combatTwo.computerEnemyRollSuccess = true;
            attackCompiler(combat);
        } else { // Neither Computer nor Player Succeed
            attackCompiler(combatTwo);
            if (!combatTwo.computerWin) attackCompiler(combat);
        };
    };
    return {combat, combatTwo};
};

function rollCompiler(combat: ComputerCombat): ComputerCombat {
    let computerRoll = combat.computerWeapons[0]?.roll as number;
    let rollCatch = Math.floor(Math.random() * 101) + (combat.computerEnemyAttributes?.kyosirMod as number);
    if (computerRoll >= rollCatch) {
        combat.rollSuccess = true;
        attackCompiler(combat);
    };
    return combat;
};

function attackCompiler(combat: ComputerCombat): ComputerCombat {
    const computerAction = combat.computerAction;
    let computerWeapon = combat.computerWeapons[0]!;
    let computerPhysicalDamage: number = computerWeapon?.physicalDamage as number;
    let computerMagicalDamage: number = computerWeapon?.magicalDamage as number;
    let computerTotalDamage: number = 0;
    let playerPhysicalDefenseMultiplier = combat.computerEnemyDefense?.physicalDefenseModifier as number;
    let playerMagicalDefenseMultiplier = combat.computerEnemyDefense?.magicalDefenseModifier as number;
    const computerCaer = computerCaerenic(combat.computerCaerenic);
    const computerEnemyCaer = computerCaerenic(combat.computerEnemyCaerenic);
    const computerEnemyStal = computerStalwart(combat.computerEnemyStalwart);
    const mastery = combat.computer?.mastery as string;

    if (combat.computerEnemyAction === ACTION_TYPES.POSTURE && combat.computerEnemyParrySuccess !== true && combat.computerEnemyRollSuccess !== true) {
        playerPhysicalDefenseMultiplier = combat.computerEnemyDefense?.physicalPosture as number;
        playerMagicalDefenseMultiplier = combat.computerEnemyDefense?.magicalPosture as number;
    };

    if (computerAction === ACTION_TYPES.ATTACK) {
        if (computerWeapon?.grip === HOLD_TYPES.ONE_HAND) {
            if (computerWeapon?.attackType === ATTACK_TYPES.PHYSICAL) {
                if (mastery === MASTERY.AGILITY || mastery === MASTERY.CONSTITUTION) {
                    if (combat.computerAttributes?.totalAgility as number >= THRESHOLD.ONE_HAND) {
                        if (combat.computerWeapons[1]?.grip === HOLD_TYPES.ONE_HAND) {
                            combat.dualWielding = true;
                            // computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
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
            if (computerWeapon?.attackType === ATTACK_TYPES.MAGIC) {
                if (mastery === MASTERY.ACHRE || mastery === MASTERY.KYOSIR) {
                    if (combat.computerAttributes?.totalAchre as number >= THRESHOLD.ONE_HAND) {
                        if (combat.computerWeapons[1]?.grip === HOLD_TYPES.ONE_HAND) {
                            combat.dualWielding = true;
                            // computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
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
        if (computerWeapon?.grip === HOLD_TYPES.TWO_HAND) {
            if (computerWeapon?.attackType === ATTACK_TYPES.PHYSICAL && computerWeapon?.type !== WEAPON_TYPES.BOW && computerWeapon?.type !== WEAPON_TYPES.GREATBOW) {
                if (mastery === MASTERY.STRENGTH || mastery === MASTERY.CONSTITUTION) {
                    if (combat.computerAttributes?.totalStrength as number >= THRESHOLD.TWO_HAND) {
                        if (combat.computerWeapons[1]?.type !== WEAPON_TYPES.BOW) {
                            combat.dualWielding = true;
                            // computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
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
            if (computerWeapon?.attackType === ATTACK_TYPES.MAGIC) {
                if (mastery === MASTERY.CAEREN || mastery === MASTERY.KYOSIR) {
                    if (combat.computerAttributes?.totalCaeren as number >= THRESHOLD.TWO_HAND) {
                        if (combat.computerWeapons[1]?.type !== WEAPON_TYPES.BOW) {
                            combat.dualWielding = true;
                            // computerDualWieldCompiler(combat, playerPhysicalDefenseMultiplier, playerMagicalDefenseMultiplier);
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
            if (computerWeapon?.type === WEAPON_TYPES.BOW || computerWeapon?.type === WEAPON_TYPES.GREATBOW) {
                computerPhysicalDamage *= DAMAGE.HIGH;
                computerMagicalDamage *= DAMAGE.HIGH; 
            };
        };
    };

    if (computerAction === ACTION_TYPES.ROLL) {
        if (combat.rollSuccess === true) {
            computerPhysicalDamage *= DAMAGE.MID;
            computerMagicalDamage *= DAMAGE.MID;
        } else {
            computerPhysicalDamage *= DAMAGE.NEG_HIGH;
            computerMagicalDamage *= DAMAGE.NEG_HIGH;
        };
    };
    if (computerAction === ACTION_TYPES.POSTURE) {
        computerPhysicalDamage *= DAMAGE.NEG_HIGH;
        computerMagicalDamage *= DAMAGE.NEG_HIGH;
    };
    if (computerAction === ACTION_TYPES.ACHIRE) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };
    if (computerAction === ACTION_TYPES.LEAP) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };
    if (computerAction === ACTION_TYPES.QUOR) {
        computerPhysicalDamage *= DAMAGE.THREE;
        computerMagicalDamage *= DAMAGE.THREE;
    };
    if (computerAction === ACTION_TYPES.RUSH) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };
    if (computerAction === ACTION_TYPES.THRUST) {
        computerPhysicalDamage *= DAMAGE.NEG_LOW;
        computerMagicalDamage *= DAMAGE.NEG_LOW;
    };
    if (computerAction === ACTION_TYPES.WRITHE) {
        computerPhysicalDamage *= DAMAGE.ONE_FIFTY;
        computerMagicalDamage *= DAMAGE.ONE_FIFTY;
    };

    const criticalClearance = Math.floor(Math.random() * 101);
    let criticalChance = computerWeapon.criticalChance;
    criticalChance -= (combat.computerEnemyAttributes?.kyosirMod as number / 2);
    // if (combat.weather === "Astralands") criticalChance += 10;
    const criticalResult = criticalCompiler(false, combat.computer as Ascean, criticalChance, criticalClearance, computerWeapon, computerPhysicalDamage, computerMagicalDamage, combat.weather, combat.glancingBlow, combat.criticalSuccess);
    combat.glancingBlow = criticalResult.glancingBlow;
    combat.criticalSuccess = criticalResult.criticalSuccess;
    computerPhysicalDamage = criticalResult.physicalDamage;
    computerMagicalDamage = criticalResult.magicalDamage;
    const physicalPenetration = computerWeapon.physicalPenetration as number;
    const magicalPenetration = computerWeapon.magicalPenetration as number;
    computerPhysicalDamage *= penetrationCompiler(playerPhysicalDefenseMultiplier, physicalPenetration);
    computerMagicalDamage *= penetrationCompiler(playerMagicalDefenseMultiplier, magicalPenetration);
    const damageType = damageTypeCompiler(combat.computerDamageType, combat.computerEnemy as Ascean, computerWeapon, computerPhysicalDamage, computerMagicalDamage);
    computerPhysicalDamage = damageType.physicalDamage;
    computerMagicalDamage = damageType.magicalDamage;
    // const weatherResult = weatherEffectCheck(computerWeapon, computerMagicalDamage, computerPhysicalDamage, combat.weather, combat.computerCriticalSuccess);
    // computerPhysicalDamage = weatherResult.physicalDamage;
    // computerMagicalDamage = weatherResult.magicalDamage; 
    computerTotalDamage = computerPhysicalDamage + computerMagicalDamage;
    if (computerTotalDamage < 0) computerTotalDamage = 0;
    combat.realizedComputerDamage = computerTotalDamage;
    if (computerAction === ACTION_TYPES.ATTACK) combat.realizedComputerDamage *= DAMAGE.LOW;
    if (computerAction === ACTION_TYPES.POSTURE) combat.realizedComputerDamage *= DAMAGE.NEG_HIGH;
    combat.realizedComputerDamage *= (computerCaer.pos * computerEnemyCaer.neg * computerEnemyStal);
    // if (combat.isStalwart) combat.realizedComputerDamage *= DAMAGE.STALWART;
    // if (combat.isCaerenic) combat.realizedComputerDamage *= DAMAGE.CAERENEIC_NEG;
    // if (combat.berserk.active === true) combat.berserk.charges += 1;
    combat.newComputerEnemyHealth -= combat.realizedComputerDamage;
    combat.computerEnemyDamaged = true;
    if (combat.newComputerEnemyHealth <= 0) {
        // if (combat.playerEffects.find(effect => effect.prayer === PRAYERS.DENIAL)) {
        //     combat.newComputerEnemyHealth = 1;
        //     combat.playerEffects = combat.playerEffects.filter(effect => effect.prayer !== PRAYERS.DENIAL);
        // } else {
            combat.newComputerEnemyHealth = 0;
            combat.computerWin = true;
        // };
    };
    if (combat.newComputerEnemyHealth > 0) combat.computerWin = false;
    if (combat.newComputerHealth > 0) combat.computerEnemyWin = false;

    return combat;
};

function computerCombatSplitter(data: { computerOne: ComputerCombat, computerTwo: ComputerCombat }) {
    try {
        let { computerOne, computerTwo } = data;
        const computerTwoLive = (computerTwo.computerAction !== "" && computerOne.personalID === computerTwo.enemyID) ? true : false;
        checkCombatSheetData(computerOne, computerTwo);

        if (computerTwoLive) {
            const res = dualComputerActionSplitter(computerOne, computerTwo);
            computerOne = res.combat;
            computerTwo = res.combatTwo;
            computerOne.newComputerHealth = computerTwo.newComputerEnemyHealth;
            computerTwo.newComputerHealth = computerOne.newComputerEnemyHealth;
            computerOne.computerEnemyWin = computerTwo.computerWin;
            computerTwo.computerEnemyWin = computerOne.computerWin;
            computerOne.damagedID = computerTwo.personalID;
            computerTwo.damagedID = computerOne.personalID;
        } else { // Only computerOne performs an action
            computerOne.computerEnemy = computerTwo.computer;
            computerOne.computerEnemyHealth = computerTwo.computerHealth;
            computerOne.newComputerEnemyHealth = computerTwo.newComputerHealth;
            computerOne.computerEnemyWeapons = computerTwo.computerWeapons as Equipment[];
            computerOne.computerEnemyWeaponOne = computerTwo.computerWeaponOne;
            computerOne.computerEnemyWeaponTwo = computerTwo.computerWeaponTwo;
            computerOne.computerEnemyWeaponThree = computerTwo.computerWeaponThree;
            computerOne.computerEnemyAttributes = computerTwo.computerAttributes;
            computerOne.computerEnemyDamageType = computerTwo.computerDamageType;
            computerOne.computerEnemyDefense = computerTwo.computerDefense;
            computerOne.computerEnemyCaerenic = computerTwo.computerCaerenic;
            computerOne.computerEnemyStalwart = computerTwo.computerStalwart;
            computerOne.enemyID = computerTwo.personalID;

            attackCompiler(computerOne);
            computerTwo.newComputerHealth = computerOne.newComputerEnemyHealth;
            computerTwo.computerEnemyWin = computerOne.computerWin;
            computerTwo.damagedID = computerOne.personalID;
        };

        computerOne.computerEnemyDamageType = computerTwo.computerDamageType;
        computerOne.computerEnemyCriticalSuccess = computerTwo.criticalSuccess;
        computerOne.computerEnemyGlancingBlow = computerTwo.glancingBlow;
        computerOne.computerEnemyParrySuccess = computerTwo.parrySuccess;
        computerOne.computerDamaged = computerTwo.computerEnemyDamaged;
        
        computerTwo.computerEnemyDamageType = computerOne.computerDamageType;
        computerTwo.computerEnemyCriticalSuccess = computerOne.criticalSuccess;
        computerTwo.computerEnemyGlancingBlow = computerOne.glancingBlow;
        computerTwo.computerEnemyParrySuccess = computerOne.parrySuccess;
        computerTwo.computerDamaged = computerOne.computerEnemyDamaged;

        return {computerOne, computerTwo};
    } catch (err) {
        console.warn(err, "Error in the Computer Combat Splitter of Game Services");
        return data;
    };
};

function checkCombatSheetData(computerOne: ComputerCombat, computerTwo: ComputerCombat) {
    computerOne.computerEnemy = computerTwo.computer;
    computerOne.computerEnemyHealth = computerTwo.computerHealth;
    computerOne.newComputerEnemyHealth = computerTwo.newComputerHealth;
    computerOne.computerEnemyWeapons = computerTwo.computerWeapons as Equipment[];
    computerOne.computerEnemyWeaponOne = computerTwo.computerWeaponOne;
    computerOne.computerEnemyWeaponTwo = computerTwo.computerWeaponTwo;
    computerOne.computerEnemyWeaponThree = computerTwo.computerWeaponThree;
    computerOne.computerEnemyAttributes = computerTwo.computerAttributes;
    computerOne.computerEnemyDamageType = computerTwo.computerDamageType;
    computerOne.computerEnemyDefense = computerTwo.computerDefense;
    computerOne.computerEnemyCaerenic = computerTwo.computerCaerenic;
    computerOne.computerEnemyStalwart = computerTwo.computerStalwart;
    computerOne.enemyID = computerTwo.personalID;

    
    computerTwo.computerEnemy = computerOne.computer;
    computerTwo.computerEnemyHealth = computerOne.computerHealth;
    computerTwo.newComputerEnemyHealth = computerOne.newComputerHealth;
    computerTwo.computerEnemyWeapons = computerOne.computerWeapons as Equipment[];
    computerTwo.computerEnemyWeaponOne = computerOne.computerWeaponOne;
    computerTwo.computerEnemyWeaponTwo = computerOne.computerWeaponTwo;
    computerTwo.computerEnemyWeaponThree = computerOne.computerWeaponThree;
    computerTwo.computerEnemyAttributes = computerOne.computerAttributes;
    computerTwo.computerEnemyDamageType = computerOne.computerDamageType;
    computerTwo.computerEnemyDefense = computerOne.computerDefense;
    computerTwo.computerEnemyCaerenic = computerOne.computerCaerenic;
    computerTwo.computerEnemyStalwart = computerOne.computerStalwart;
    computerTwo.enemyID = computerOne.personalID;

    return { computerOne, computerTwo };
};

function dualComputerActionSplitter(combat: ComputerCombat, combatTwo: ComputerCombat) {
    const computerOneInitiative = combat.computerAttributes?.initiative as number;
    const computerTwoInitiative = combatTwo.computerAttributes?.initiative as number;
    const computerOneAction = combat.computerAction;
    const computerTwoAction = combatTwo.computerAction;

    computerWeaponMaker(combat);
    computerWeaponMaker(combatTwo);

    // ==================== PARRY ==================== \\
    if (computerOneAction === ACTION_TYPES.PARRY && computerTwoAction === ACTION_TYPES.PARRY) {
        if (computerOneInitiative >= computerTwoInitiative) {
            combat.parrySuccess = true;
            combatTwo.computerEnemyParrySuccess = true;
        } else {
            combatTwo.parrySuccess = true;
            combat.computerEnemyParrySuccess = true;
        };
        return {combat, combatTwo};
    };
    
    if (computerOneAction === ACTION_TYPES.PARRY) {
        combat.parrySuccess = true;
        combatTwo.computerEnemyParrySuccess = true;
        return {combat, combatTwo};
    };

    if (computerTwoAction === ACTION_TYPES.PARRY) {
        combatTwo.parrySuccess = true;
        combat.computerEnemyParrySuccess = true;
        return {combat, combatTwo};
    };

    // ==================== ROLL ==================== \\
    if (computerOneAction === ACTION_TYPES.ROLL && computerTwoAction === ACTION_TYPES.ROLL) {
        const res = doubleRollCompiler(combat, combatTwo, computerOneInitiative, computerTwoInitiative);
        return {combat:res.combat, combatTwo:res.combatTwo};
    };
    if (computerOneAction === ACTION_TYPES.ROLL && computerTwoAction !== ACTION_TYPES.ROLL) {
        rollCompiler(combat);
        combatTwo.computerEnemyRollSuccess = combat.rollSuccess;
    };
    if (computerTwoAction === ACTION_TYPES.ROLL && computerOneAction !== ACTION_TYPES.ROLL) {
        rollCompiler(combatTwo);
        combat.computerEnemyRollSuccess = combatTwo.rollSuccess;
    };

    // ==================== OTHER ==================== \\
    if (!combat.rollSuccess && !combatTwo.rollSuccess) {
        if (computerOneInitiative >= computerTwoInitiative) {
            attackCompiler(combat);
            if (!combat.computerWin) attackCompiler(combatTwo);
        } else {
            attackCompiler(combatTwo);
            if (!combatTwo.computerWin) attackCompiler(combat);
        };
    };

    return {combat, combatTwo};
};

function validateComputer(combat: ComputerCombat): boolean {
    return combat.computer !== undefined;
};

function computerCombatCompiler(combat: { computerOne: ComputerCombat, computerTwo: ComputerCombat }): { computerOne: ComputerCombat, computerTwo: ComputerCombat } {
    try {
        if (!validateComputer(combat.computerOne) || !validateComputer(combat.computerTwo)) return combat;
        const res = computerCombatSplitter(combat);
        return res;
    } catch (err) {
        console.warn(err, "Error in the Computer Combat Compiler of Game Services");
        return combat;
    };
};

export { computerCombatCompiler };