import { HitLocation, HitLocationResult } from "../game/phaser/HitDetection";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { CombatAttributes, Defense } from "../utility/combat";
import StatusEffect from "../models/prayer";

export interface ComputerCombat {
    computer: Ascean | undefined;
    computerAction: string;
    // computerBlessing: string;
    computerHealth: number;
    newComputerHealth: number;
    
    computerWeapons: [Equipment | undefined, Equipment | undefined, Equipment | undefined];
    computerWeaponOne: Equipment | undefined;
    computerWeaponTwo: Equipment | undefined;
    computerWeaponThree: Equipment | undefined;

    computerAttributes: CombatAttributes | undefined;
    computerDamageType: string;
    computerDamagedType: string;
    computerDefense: Defense | undefined;
    // computerDefenseDefault: Defense | undefined;
    computerEffects: StatusEffect[];
    potentialComputerDamage: number;
    realizedComputerDamage: number;
    computerDamaged: boolean;
    computerHitLocation: HitLocationResult;

    criticalSuccess: boolean;
    parrySuccess: boolean;
    dualWielding: boolean;
    glancingBlow: boolean;
    // religiousSuccess: boolean;
    rollSuccess: boolean;
    computerWin: boolean;

    computerCaerenic: boolean;
    computerStalwart: boolean;

    computerEnemy: Ascean | undefined;
    computerEnemyAction: string;
    // computerEnemyBlessing: string;
    computerEnemyHealth: number;
    newComputerEnemyHealth: number;

    computerEnemyWeapons: Equipment[];
    computerEnemyWeaponOne: Equipment | undefined;
    computerEnemyWeaponTwo: Equipment | undefined;
    computerEnemyWeaponThree: Equipment | undefined;
    
    computerEnemyAttributes: CombatAttributes | undefined;
    computerEnemyDamageType: string;
    computerEnemyDamagedType: string;
    computerEnemyDefense: Defense | undefined;
    // computerEnemyDefenseDefault: Defense | undefined;
    // computerEnemyEffects: StatusEffect[];
    potentialComputerEnemyDamage: number;
    realizedComputerEnemyDamage: number;
    computerEnemyDamaged: boolean;
    computerEnemyHitLocation: HitLocationResult;

    computerEnemyCriticalSuccess: boolean;
    computerEnemyParrySuccess: boolean;
    computerEnemyDualWielding: boolean;
    computerEnemyGlancingBlow: boolean;
    // computerEnemyReligiousSuccess: boolean;
    computerEnemyRollSuccess: boolean;
    computerEnemyWin: boolean;

    computerEnemyCaerenic: boolean;
    computerEnemyStalwart: boolean;

    // combatInitiated: boolean;
    // combatEngaged: boolean;
    combatRound: number;

    weather: string;
    // astrication: { active: boolean; charges: number; };
    // berserk: { active: boolean; charges: number; };
    // conviction: { active: boolean; charges: number; };
    // isStealth: boolean;
    // isSeering: boolean;
    // isInsight: boolean;
    enemyID: string;
    damagedID: string;
    personalID: string;
    // combatTimer: number;
};

export const initComputerCombat: ComputerCombat = {
    computer: undefined,
    computerAction: "",
    // computerBlessing: "Buff",
    computerHealth: 0,
    newComputerHealth: 0,
    
    computerWeapons: [undefined, undefined, undefined],
    computerWeaponOne: undefined,
    computerWeaponTwo: undefined,
    computerWeaponThree: undefined,

    computerEffects: [],
    computerDamageType: "",
    computerDamagedType: "",
    computerDefense: undefined,
    computerAttributes: undefined,
    // computerDefenseDefault: undefined,
    potentialComputerDamage: 0,
    realizedComputerDamage: 0,
    computerDamaged: false,
    computerHitLocation: { location: HitLocation.HEAD, hitPoint: { x: 0, y: 0 }, relativePosition: { x: 0, y: 0 } },

    criticalSuccess: false,
    parrySuccess: false,
    dualWielding: false,
    glancingBlow: false,
    // religiousSuccess: false,
    rollSuccess: false,
    computerWin: false,

    computerCaerenic: false,
    computerStalwart: false,

    computerEnemy: undefined,
    computerEnemyAction: "",
    // computerEnemyBlessing: "",
    computerEnemyHealth: 0,
    newComputerEnemyHealth: 0,

    computerEnemyWeapons: [],
    computerEnemyWeaponOne: undefined,
    computerEnemyWeaponTwo: undefined,
    computerEnemyWeaponThree: undefined,
    
    // computerEnemyEffects: [],
    computerEnemyDamageType: "",
    computerEnemyDamagedType: "",
    computerEnemyDefense: undefined,
    computerEnemyAttributes: undefined,
    // computerEnemyDefenseDefault: undefined,
    potentialComputerEnemyDamage: 0,
    realizedComputerEnemyDamage: 0,
    computerEnemyDamaged: false,
    computerEnemyHitLocation: { location: HitLocation.HEAD, hitPoint: { x: 0, y: 0 }, relativePosition: { x: 0, y: 0 } },

    computerEnemyCriticalSuccess: false,
    computerEnemyParrySuccess: false,
    computerEnemyDualWielding: false,
    computerEnemyGlancingBlow: false,
    // computerEnemyReligiousSuccess: false,
    computerEnemyRollSuccess: false,
    computerEnemyWin: false,

    computerEnemyCaerenic: false,
    computerEnemyStalwart: false,

    // combatInitiated: false,
    // combatEngaged: false,
    combatRound: 0,

    weather: "",
    // astrication: { active: false, charges: 0 },
    // berserk: { active: false, charges: 0 },
    // conviction: { active: false, charges: 0 },
    // isStealth: false,
    // isSeering: false,
    // isInsight: false,
    enemyID: "",
    damagedID: "",
    personalID: "",
    // combatTimer: 0,
};