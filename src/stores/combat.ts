import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { CombatAttributes, Defense } from "../utility/combat";
import StatusEffect from "../utility/prayer";

export interface Combat {
    player: Ascean | undefined;
    action: string;
    playerAction: string;
    counterGuess: string;
    playerBlessing: string;
    prayerSacrifice: string;
    prayerSacrificeName: string,
    playerHealth: number;
    newPlayerHealth: number;
    
    weapons: [Equipment | undefined, Equipment | undefined, Equipment | undefined];

    weaponOne: Equipment | undefined;
    weaponTwo: Equipment | undefined;
    weaponThree: Equipment | undefined;

    playerAttributes: CombatAttributes | undefined;
    playerDamageType: string;
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
    counterSuccess: boolean;
    dualWielding: boolean;
    glancingBlow: boolean;
    religiousSuccess: boolean;
    rollSuccess: boolean;
    playerWin: boolean;

    computer: Ascean | undefined;
    computerAction: string;
    computerCounterGuess: string;
    computerBlessing: string;
    computerHealth: number;
    newComputerHealth: number;

    computerWeapons: Equipment[];
    
    computerWeaponOne: Equipment | undefined;
    computerWeaponTwo: Equipment | undefined;
    computerWeaponThree: Equipment | undefined;
    
    computerAttributes: CombatAttributes | undefined;
    computerDamageType: string;
    computerDefense: Defense | undefined;
    computerDefenseDefault: Defense | undefined;
    computerEffects: StatusEffect[];
    potentialComputerDamage: number;
    realizedComputerDamage: number;
    computerDamaged: boolean;

    attackWeight: number;
    counterWeight: number;
    dodgeWeight: number;
    postureWeight: number;
    rollWeight: number;
    counterAttackWeight: number;
    counterCounterWeight: number;
    counterDodgeWeight: number;
    counterPostureWeight: number;
    counterRollWeight: number;

    computerStartDescription: string;
    computerSpecialDescription: string;
    computerActionDescription: string;
    computerInfluenceDescription: string;
    computerInfluenceDescriptionTwo: string;
    computerDeathDescription: string;

    computerCriticalSuccess: boolean;
    computerCounterSuccess: boolean;
    computerDualWielding: boolean;
    computerGlancingBlow: boolean;
    computerReligiousSuccess: boolean;
    computerRollSuccess: boolean;
    computerWin: boolean;

    combatInitiated: boolean;
    actionStatus: boolean;
    gameIsLive: boolean;
    combatEngaged: boolean;
    instantStatus: boolean;

    combatRound: number;
    sessionRound: number;

    actionData: string[];
    typeAttackData: string[];
    typeDamageData: string[];
    totalDamageData: number;
    prayerData: string[];
    deityData: string[];

    weather: string;
    isStalwart: boolean; // +15% Defense, Cannot Dodge, Roll
    isCaerenic: boolean; // +15% Attack, -15% Defense
    isStealth: boolean; //
    enemyID: string;
    combatTimer: number;
    soundEffects: boolean;

    isEnemy: boolean;
    npcType: string;
    isAggressive: boolean;
    startedAggressive: boolean;
    enemyPersuaded: boolean;
    playerLuckout: boolean;
};

export const initCombat: Combat = {

    player: undefined,
    action: '',
    playerAction: '',
    counterGuess: '',
    playerBlessing: 'Buff',
    prayerSacrifice: '',
    prayerSacrificeName: '',
    playerHealth: 0,
    newPlayerHealth: 0,
    
    weapons: [undefined, undefined, undefined],

    weaponOne: undefined,
    weaponTwo: undefined,
    weaponThree: undefined,

    playerEffects: [],
    playerDamageType: '',
    playerDefense: undefined,
    playerAttributes: undefined,
    playerDefenseDefault: undefined,
    potentialPlayerDamage: 0,
    realizedPlayerDamage: 0,
    playerDamaged: false,
    enemyPrayerConsumed: false,

    playerStartDescription: '',
    playerSpecialDescription: '',
    playerActionDescription: '',
    playerInfluenceDescription: '',
    playerInfluenceDescriptionTwo: '',
    playerDeathDescription: '',

    criticalSuccess: false,
    counterSuccess: false,
    dualWielding: false,
    glancingBlow: false,
    religiousSuccess: false,
    rollSuccess: false,
    playerWin: false,

    computer: undefined,
    computerAction: '',
    computerCounterGuess: '',
    computerBlessing: '',
    computerHealth: 0,
    newComputerHealth: 0,

    computerWeapons: [],
    
    computerWeaponOne: undefined,
    computerWeaponTwo: undefined,
    computerWeaponThree: undefined,
    
    computerEffects: [],
    computerDamageType: '',
    computerDefense: undefined,
    computerAttributes: undefined,
    computerDefenseDefault: undefined,
    potentialComputerDamage: 0,
    realizedComputerDamage: 0,
    computerDamaged: false,

    attackWeight: 0,
    counterWeight: 0,
    dodgeWeight: 0,
    postureWeight: 0,
    rollWeight: 0,
    counterAttackWeight: 0,
    counterCounterWeight: 0,
    counterDodgeWeight: 0,
    counterPostureWeight: 0,
    counterRollWeight: 0,

    computerStartDescription: '',
    computerSpecialDescription: '',
    computerActionDescription: '',
    computerInfluenceDescription: '',
    computerInfluenceDescriptionTwo: '',
    computerDeathDescription: '',

    computerCriticalSuccess: false,
    computerCounterSuccess: false,
    computerDualWielding: false,
    computerGlancingBlow: false,
    computerReligiousSuccess: false,
    computerRollSuccess: false,
    computerWin: false,

    combatInitiated: false,
    actionStatus: false,
    gameIsLive: false,
    combatEngaged: false,
    instantStatus: false,

    combatRound: 0,
    sessionRound: 0,

    actionData: [],
    typeAttackData: [],
    typeDamageData: [],
    totalDamageData: 0,
    prayerData: [],
    deityData: [],

    weather: '',
    isStalwart: false, // +15% Defense, Cannot Dodge, Roll
    isCaerenic: false, // +15% Attack, -15% Defense
    isStealth: false,
    enemyID: '',
    combatTimer: 0,
    soundEffects: false,

    isEnemy: false,
    npcType: '',
    isAggressive: false,
    startedAggressive: false,
    enemyPersuaded: false,
    playerLuckout: false,
};