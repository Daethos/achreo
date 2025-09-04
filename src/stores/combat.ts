import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { CombatAttributes, Defense } from "../utility/combat";
import StatusEffect from "../utility/prayer";

export interface Combat {
    player: Ascean | undefined;
    action: string;
    playerAction: string;
    parryGuess: string;
    playerBlessing: string;
    prayerSacrifice: string;
    prayerSacrificeId: string,
    prayerSacrificeName: string,
    playerHealth: number;
    newPlayerHealth: number;
    
    weapons: Equipment[];
    weaponOne: Equipment | undefined;
    weaponTwo: Equipment | undefined;
    weaponThree: Equipment | undefined;

    playerAttributes: CombatAttributes | undefined;
    playerDamageType: string;
    playerDamagedType: string;
    playerDefense: Defense | undefined;
    playerDefenseDefault: Defense | undefined;
    playerEffects: StatusEffect[];
    potentialPlayerDamage: number;
    realizedPlayerDamage: number;
    playerDamaged: boolean;
    enemyPrayerConsumed: boolean;

    playerStartDescription: string;
    playerSpecialDescription: string;
    playerActionDescription: string;
    playerInfluenceDescription: string;
    playerInfluenceDescriptionTwo: string;
    playerDeathDescription: string;

    criticalSuccess: boolean;
    parrySuccess: boolean;
    dualWielding: boolean;
    glancingBlow: boolean;
    religiousSuccess: boolean;
    rollSuccess: boolean;
    playerWin: boolean;

    computer: Ascean | undefined;
    computerAction: string;
    computerParryGuess: string;
    computerBlessing: string;
    computerHealth: number;
    newComputerHealth: number;

    computerWeapons: Equipment[];
    
    computerWeaponOne: Equipment | undefined;
    computerWeaponTwo: Equipment | undefined;
    computerWeaponThree: Equipment | undefined;
    
    computerAttributes: CombatAttributes | undefined;
    computerDamageType: string;
    computerDamagedType: string;
    computerDefense: Defense | undefined;
    computerDefenseDefault: Defense | undefined;
    computerEffects: StatusEffect[];
    potentialComputerDamage: number;
    realizedComputerDamage: number;
    computerDamaged: boolean;

    // attackWeight: number;
    // parryWeight: number;
    // dodgeWeight: number;
    // postureWeight: number;
    // rollWeight: number;
    // thrustWeight: number;
    // parryAttackWeight: number;
    // parryParryWeight: number;
    // parryDodgeWeight: number;
    // parryPostureWeight: number;
    // parryRollWeight: number;
    // parryThrustWeight: number;

    computerStartDescription: string;
    computerSpecialDescription: string;
    computerActionDescription: string;
    computerInfluenceDescription: string;
    computerInfluenceDescriptionTwo: string;
    computerDeathDescription: string;

    computerCriticalSuccess: boolean;
    computerParrySuccess: boolean;
    computerDualWielding: boolean;
    computerGlancingBlow: boolean;
    computerReligiousSuccess: boolean;
    computerRollSuccess: boolean;
    computerWin: boolean;

    computerCaerenic: boolean;
    computerStalwart: boolean;

    combatInitiated: boolean;
    actionStatus: boolean;
    gameIsLive: boolean;
    combatEngaged: boolean;
    instantStatus: boolean;

    combatRound: number;
    sessionRound: number;
    blindStrike: boolean;

    actionData: string[];
    typeAttackData: string[];
    typeDamageData: string[];
    totalDamageData: number;
    prayerData: string[];
    deityData: string[];
    skillData: string[];

    weather: string;
    astrication: { active: boolean; charges: number; };
    berserk: { active: boolean; charges: number; talent: boolean; };
    conviction: { active: boolean; charges: number; talent: boolean; };
    caerenic: {active:boolean; enhanced:boolean, optimized: boolean};
    stalwart: {active:boolean; enhanced:boolean, optimized: boolean};
    physicals: {
        attack: {enhanced: boolean; optimized: boolean;};
        dodge: {enhanced: boolean; optimized: boolean;};
        parry: {enhanced: boolean; optimized: boolean;};
        posture: {enhanced: boolean; optimized: boolean;};
        roll: {enhanced: boolean; optimized: boolean;};
        thrust: {enhanced: boolean; optimized: boolean;};
    };
    isStealth: boolean; //
    isSeering: boolean;
    isInsight: boolean;
    isQuicken: boolean;
    enemyID: string;
    damagedID: string;
    combatTimer: number;

    isEnemy: boolean;
    npcType: string;
    isAggressive: boolean;
    startedAggressive: boolean;
    enemyPersuaded: boolean;
    playerLuckout: boolean;
    persuasionScenario: boolean;
    luckoutScenario: boolean;
    playerTrait: string;
};

export const initCombat: Combat = {
    player: undefined,
    action: "",
    playerAction: "",
    parryGuess: "",
    playerBlessing: "Buff",
    prayerSacrifice: "",
    prayerSacrificeId: "",
    prayerSacrificeName: "",
    playerHealth: 0,
    newPlayerHealth: 0,
    
    weapons: [],

    weaponOne: undefined,
    weaponTwo: undefined,
    weaponThree: undefined,

    playerEffects: [],
    playerDamageType: "",
    playerDamagedType: "",
    playerDefense: undefined,
    playerAttributes: undefined,
    playerDefenseDefault: undefined,
    potentialPlayerDamage: 0,
    realizedPlayerDamage: 0,
    playerDamaged: false,
    enemyPrayerConsumed: false,

    playerStartDescription: "",
    playerSpecialDescription: "",
    playerActionDescription: "",
    playerInfluenceDescription: "",
    playerInfluenceDescriptionTwo: "",
    playerDeathDescription: "",

    criticalSuccess: false,
    parrySuccess: false,
    dualWielding: false,
    glancingBlow: false,
    religiousSuccess: false,
    rollSuccess: false,
    playerWin: false,

    computer: undefined,
    computerAction: "",
    computerParryGuess: "",
    computerBlessing: "",
    computerHealth: 0,
    newComputerHealth: 0,

    computerWeapons: [],
    
    computerWeaponOne: undefined,
    computerWeaponTwo: undefined,
    computerWeaponThree: undefined,
    
    computerEffects: [],
    computerDamageType: "",
    computerDamagedType: "",
    computerDefense: undefined,
    computerAttributes: undefined,
    computerDefenseDefault: undefined,
    potentialComputerDamage: 0,
    realizedComputerDamage: 0,
    computerDamaged: false,

    // attackWeight: 0,
    // parryWeight: 0,
    // dodgeWeight: 0,
    // postureWeight: 0,
    // rollWeight: 0,
    // thrustWeight: 0,
    // parryAttackWeight: 0,
    // parryParryWeight: 0,
    // parryDodgeWeight: 0,
    // parryPostureWeight: 0,
    // parryRollWeight: 0,
    // parryThrustWeight: 0,

    computerStartDescription: "",
    computerSpecialDescription: "",
    computerActionDescription: "",
    computerInfluenceDescription: "",
    computerInfluenceDescriptionTwo: "",
    computerDeathDescription: "",

    computerCriticalSuccess: false,
    computerParrySuccess: false,
    computerDualWielding: false,
    computerGlancingBlow: false,
    computerReligiousSuccess: false,
    computerRollSuccess: false,
    computerWin: false,

    computerCaerenic: false,
    computerStalwart: false,

    combatInitiated: false,
    actionStatus: false,
    gameIsLive: false,
    combatEngaged: false,
    instantStatus: false,

    combatRound: 0,
    sessionRound: 0,
    blindStrike: false,

    actionData: [],
    typeAttackData: [],
    typeDamageData: [],
    totalDamageData: 0,
    prayerData: [],
    deityData: [],
    skillData: [],

    weather: "",
    astrication: { active: false, charges: 0 },
    berserk: { active: false, charges: 0, talent: false },
    conviction: { active: false, charges: 0, talent: false },
    caerenic: {active:false, enhanced:false, optimized: false},
    stalwart: {active:false, enhanced:false, optimized: false},
    physicals: {
        attack: {enhanced: false, optimized: false,},
        dodge: {enhanced: false, optimized: false,},
        parry: {enhanced: false, optimized: false,},
        posture: {enhanced: false, optimized: false,},
        roll: {enhanced: false, optimized: false,},
        thrust: {enhanced: false, optimized: false,},
    },
    isStealth: false,
    isSeering: false,
    isInsight: false,
    isQuicken: false,
    enemyID: "",
    damagedID: "",
    combatTimer: 0,

    isEnemy: false,
    npcType: "",
    isAggressive: false,
    startedAggressive: false,
    enemyPersuaded: false,
    playerLuckout: false,
    persuasionScenario: false,
    luckoutScenario: false,
    playerTrait: "",
};