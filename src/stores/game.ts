import { Inventory, initInventory } from "../models/inventory";
import { SpecialInventory, initSpecialInventory } from "../models/specialInventory";
import { DialogNode, DialogNodeOption } from "../utility/DialogNode";

export interface GameState {
    player: any;
    dialog: any;
    asceanViews: string;
    settingViews: string;
    characterViews: string;
    controlSetting: string;
    traits: {} | any;
    primary: any;
    secondary: any;
    tertiary: any;

    currentGame: boolean;
    gameTimer: number;
    gameChange: boolean;
    staminaPercentage: number;

    instantStatus: boolean;
    selectedPrayerIndex: number;
    selectedDamageTypeIndex: number;
    selectedWeaponIndex: number;
    selectedHighlight: string;
    scrollEnabled: boolean;

    smallHud: boolean;
    dialogTag: boolean;
    lootTag: boolean;
    showCombat: boolean;
    showDialog: boolean;
    showInventory: boolean;
    showLoot: boolean;
    showPlayer: boolean;

    currentIntent: string;
    inventory: Inventory;
    specialInventory: SpecialInventory;
    lootDrops: any[];
    merchantEquipment: any[];
    repurchase: any[];
    showLootIds: any[];
    interactCount: number;
    tutorialEncounter: number;

    actionButtons: any[];
    specialButtons: any[];

    pauseState: boolean;
    shake: { duration: number; intensity: number; };
    vibration: number;
    joystickSpeed: number;
    soundEffectVolume: number;

    currentNodeIndex: number;
    currentNode: DialogNode | undefined;
    renderedOptions: DialogNodeOption[];
    renderedText: string;

    healthDisplay: string;
    experienceDisplay: string;
};

export const initGame: GameState = {
    player: {},
    dialog: {},
    asceanViews: 'Inventory',
    settingViews: 'Control',
    characterViews: 'Statistics',
    controlSetting: 'Buttons',
    traits: {},
    primary: {},
    secondary: {},
    tertiary: {},

    currentGame: false,
    gameTimer: 0,
    gameChange: false,
    staminaPercentage: 0,
    
    instantStatus: false,
    selectedPrayerIndex: 0,
    selectedDamageTypeIndex: 0,
    selectedWeaponIndex: 0,
    selectedHighlight: 'Weapon',
    scrollEnabled: false,

    smallHud: false,
    dialogTag: false,
    lootTag: false,
    currentIntent: 'challenge',
    showCombat: false,
    showDialog: false,
    showInventory: false,
    showLoot: false,
    showPlayer: false,

    inventory: initInventory,
    specialInventory: initSpecialInventory,
    lootDrops: [],
    merchantEquipment: [],
    repurchase: [],
    showLootIds: [],
    interactCount: 0,
    tutorialEncounter: 0,

    actionButtons: ['Attack', 'Posture', 'Roll', 'Dodge', 'Counter'],
    specialButtons: ['Consume', 'Invoke', 'Polymorph', 'Root', 'Tshaeral'],

    pauseState: false,
    shake: { duration: 100, intensity: 0.05 },
    vibration: 100,
    joystickSpeed: 0,
    soundEffectVolume: 0.3,

    currentNodeIndex: 0,
    currentNode: undefined,
    renderedOptions: [],
    renderedText: '',

    healthDisplay: 'FULL',
    experienceDisplay: 'FULL',
};