export interface GameState {
    player: any;
    dialog: any;
    asceanViews: string;
    settingViews: string;
    characterViews: string;
    controlSetting: string;
    traits: {} | any;

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

    showCombat: boolean;
    showDialog: boolean;
    showInventory: boolean;
    showLoot: boolean;
    showPlayer: boolean;

    inventory: any[];
    lootDrops: any[];
    merchantEquipment: any[];
    showLootIds: any[];

    actionButtons: any[];
    specialButtons: any[];

    pauseState: boolean;
    shake: { duration: number; intensity: number; };
    vibration: number;
    joystickSpeed: number;
    soundEffectVolume: number;
};

export const initGame: GameState = {
    player: {},
    dialog: {},
    asceanViews: 'Inventory',
    settingViews: 'Control',
    characterViews: 'Statistics',
    controlSetting: 'Buttons',
    traits: {},

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

    showCombat: false,
    showDialog: false,
    showInventory: false,
    showLoot: false,
    showPlayer: false,

    inventory: [],
    lootDrops: [],
    merchantEquipment: [],
    showLootIds: [],

    actionButtons: ['Attack', 'Posture', 'Roll', 'Dodge', 'Counter'],
    specialButtons: ['Consume', 'Invoke', 'Polymorph', 'Root', 'Tshaeral'],

    pauseState: false,
    shake: { duration: 100, intensity: 0.05 },
    vibration: 100,
    joystickSpeed: 0,
    soundEffectVolume: 0.3,
};