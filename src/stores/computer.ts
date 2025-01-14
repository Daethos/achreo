import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { CombatAttributes, Defense } from "../utility/combat";
import StatusEffect from "../utility/prayer";

export interface ComputerCombat {
    computer: Ascean | undefined;
    computerAction: string;
    computerBlessing: string;
    computerHealth: number;
    newComputerHealth: number;
    
    computerWeapons: [Equipment | undefined, Equipment | undefined, Equipment | undefined];
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

    criticalSuccess: boolean;
    parrySuccess: boolean;
    dualWielding: boolean;
    glancingBlow: boolean;
    religiousSuccess: boolean;
    rollSuccess: boolean;
    computerWin: boolean;

    computerEnemy: Ascean | undefined;
    computerEnemyAction: string;
    computerEnemyBlessing: string;
    computerEnemyHealth: number;
    newComputerEnemyHealth: number;

    computerEnemyWeapons: Equipment[];
    computerEnemyWeaponOne: Equipment | undefined;
    computerEnemyWeaponTwo: Equipment | undefined;
    computerEnemyWeaponThree: Equipment | undefined;
    
    computerEnemyAttributes: CombatAttributes | undefined;
    computerEnemyDamageType: string;
    computerEnemyDefense: Defense | undefined;
    computerEnemyDefenseDefault: Defense | undefined;
    computerEnemyEffects: StatusEffect[];
    potentialComputerEnemyDamage: number;
    realizedComputerEnemyDamage: number;
    computerEnemyDamaged: boolean;

    computerEnemyCriticalSuccess: boolean;
    computerEnemyParrySuccess: boolean;
    computerEnemyDualWielding: boolean;
    computerEnemyGlancingBlow: boolean;
    computerEnemyReligiousSuccess: boolean;
    computerEnemyRollSuccess: boolean;
    computerEnemyWin: boolean;

    combatInitiated: boolean;
    combatEngaged: boolean;
    combatRound: number;

    weather: string;
    astrication: { active: boolean; charges: number; };
    berserk: { active: boolean; charges: number; };
    conviction: { active: boolean; charges: number; };
    isStalwart: boolean;
    isCaerenic: boolean;
    isStealth: boolean; //
    isSeering: boolean;
    isInsight: boolean;
    enemyID: string;
    damagedID: string;
    personalID: string;
    combatTimer: number;

    isAggressive: boolean;
    startedAggressive: boolean;
};

export const initComputerCombat: ComputerCombat = {
    computer: undefined,
    computerAction: '',
    computerBlessing: 'Buff',
    computerHealth: 0,
    newComputerHealth: 0,
    
    computerWeapons: [undefined, undefined, undefined],
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

    criticalSuccess: false,
    parrySuccess: false,
    dualWielding: false,
    glancingBlow: false,
    religiousSuccess: false,
    rollSuccess: false,
    computerWin: false,

    computerEnemy: undefined,
    computerEnemyAction: '',
    computerEnemyBlessing: '',
    computerEnemyHealth: 0,
    newComputerEnemyHealth: 0,

    computerEnemyWeapons: [],
    computerEnemyWeaponOne: undefined,
    computerEnemyWeaponTwo: undefined,
    computerEnemyWeaponThree: undefined,
    
    computerEnemyEffects: [],
    computerEnemyDamageType: '',
    computerEnemyDefense: undefined,
    computerEnemyAttributes: undefined,
    computerEnemyDefenseDefault: undefined,
    potentialComputerEnemyDamage: 0,
    realizedComputerEnemyDamage: 0,
    computerEnemyDamaged: false,

    computerEnemyCriticalSuccess: false,
    computerEnemyParrySuccess: false,
    computerEnemyDualWielding: false,
    computerEnemyGlancingBlow: false,
    computerEnemyReligiousSuccess: false,
    computerEnemyRollSuccess: false,
    computerEnemyWin: false,

    combatInitiated: false,
    combatEngaged: false,
    combatRound: 0,

    weather: '',
    astrication: { active: false, charges: 0 },
    berserk: { active: false, charges: 0 },
    conviction: { active: false, charges: 0 },
    isStalwart: false,
    isCaerenic: false,
    isStealth: false,
    isSeering: false,
    isInsight: false,
    enemyID: '',
    damagedID: '',
    personalID: '',
    combatTimer: 0,

    isAggressive: false,
    startedAggressive: false,
};