import { STARTING_MASTERY_UI, STARTING_SPECIALS } from "../utility/abilities";
import { initTutorial, Tutorial } from "../utility/tutorial";

export default class Settings {
    public _id: string;
    public music: boolean;
    public sound: boolean;
    public volume: number;
    public joystick: number;
    public vibration: number;
    public actions: string[];
    public specials: string[];
    public prayer: string;
    public shake: { duration: number; intensity: number; };
    public selected: { prayer: number; damageType: number; weapon: number; highlight: string; };
    public show: { combat: boolean; dialog: boolean; inventory: boolean; loot: boolean; player: boolean; };
    public asceanViews: string;
    public settingViews: string;
    public characterViews: string;
    public faithViews: string;
    public healthViews: string;
    public grace: string;
    public stamina: string;
    public control: string;
    public desktop: boolean;
    public difficulty: {
        arena: boolean;
        aggression: number; 
        aim: boolean; 
        computer: boolean;
        special: number;
        tidbits: boolean; 
        tooltips: boolean;
        playerSpeed: number;
        enemySpeed: number;
        enemyCombatInteract: boolean;
    };
    public postFx: { 
        enable: boolean; 
        chromaticEnable: boolean; 
        chabIntensity: number; 
        vignetteEnable: boolean; 
        vignetteStrength: number; 
        vignetteIntensity: number; 
        noiseEnable: boolean;
        noiseSeed: number; 
        noiseStrength: number; 
        vhsEnable: boolean; 
        vhsStrength: number; 
        scanlinesEnable: boolean; 
        scanStrength: number;
        crtEnable: boolean; 
        crtHeight: number;
        crtWidth: number;
    };
    public positions: {
        camera: {
            x: number;
            y: number;
            z: number;
            zoom: number;
        };
        castbar: {
            barHeight: number;
            barWidth: number;
            barY: number;
        };
        leftJoystick: { 
            base: number;
            thumb: number;
            opacity: number; 
            x: number; 
            y: number; 
            width: number; 
        };
        rightJoystick: { 
            base: number;
            thumb: number;
            opacity: number; 
            x: number; 
            y: number; 
            width: number; 
        };
        actionButtons: { 
            border: number;
            color: number;
            display: string; 
            opacity: number; 
            spacing: number; 
            x: number; 
            y: number; 
            width: number; 
        };
        specialButtons: { 
            border: number;
            color: number;
            display: string; 
            opacity: number; 
            spacing: number; 
            x: number; 
            y: number; 
            width: number; 
        };
        fpsText: { x: number; y: number; };
        leftHud: { 
            offset: number;
            scale: number
            x: number; 
            y: number; 
        };
        smallHud: { 
            offset: number;
            scale: number
            x: number; 
            y: number; 
        };
        // solidHud: { right: number; };
    };
    public tutorial: Tutorial;

    public constructor(id: string, mastery: string) {
        this._id = id;
        this.music = true;
        this.sound = true;
        this.volume = 0.3;
        this.joystick = 0.5;
        this.vibration = 100;
        this.actions = ['Attack', 'Posture', 'Roll', 'Dodge', 'Parry'];
        this.specials = STARTING_SPECIALS[mastery as keyof typeof STARTING_SPECIALS];
        this.prayer = 'Buff';
        this.shake = { duration: 100, intensity: 0.05 };
        this.selected = {
            prayer: 0,
            damageType: 0,
            weapon: 0,
            highlight: 'Weapon',
        };
        this.show = {
            combat: false,
            dialog: false,
            inventory: false,
            loot: false,
            player: false,
        };
        this.asceanViews = 'Inventory';
        this.settingViews = 'Control';
        this.characterViews = 'Statistics';
        this.faithViews = 'Deities';
        this.healthViews = 'FULL';
        this.grace = 'NUMBER';
        this.stamina = 'NUMBER';
        this.control = 'Buttons';
        this.desktop = false;
        this.difficulty = {
            arena: true,
            aggression: 0.5,
            aim: false,
            computer: false,
            special: 0.5,
            tidbits: false,
            tooltips: true,
            playerSpeed: 0,
            enemySpeed: 0,
            enemyCombatInteract: true,
        };
        this.postFx = {
            enable: false, 
            chromaticEnable: false, 
            chabIntensity: 0.5, 
            vignetteEnable: false,
            vignetteStrength: 0.5, 
            vignetteIntensity: 0.5, 
            noiseEnable: false, 
            noiseSeed: 0.5,
            noiseStrength: 0.5, 
            vhsEnable: false, 
            vhsStrength: 0.5, 
            scanlinesEnable: false, 
            scanStrength: 0.5,
            crtEnable: false, 
            crtHeight: 2,
            crtWidth: 2,
        };
        this.positions = {
            camera: {
                x: 0,
                y: 0,
                z: 0,
                zoom: 0.8,
            },
            castbar: {
                barHeight: 24,
                barWidth: 200,
                barY: 0,
            },
            leftJoystick: { 
                base: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].leftJoystick.base,
                thumb: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].leftJoystick.thumb,
                opacity: 0.1,
                x: 0.15, 
                y: 0.7,
                width: 1, 
            },
            rightJoystick: { 
                base: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].rightJoystick.base,
                thumb: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].rightJoystick.thumb,
                opacity: 0.1,
                x: 0.85,
                y: 0.7,
                width: 1, 
            },
            actionButtons: {
                border: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].actionButtons.border,
                color: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].actionButtons.color,
                display: 'arc',
                opacity: 0.75,
                spacing: 3.57,
                x: 0.7,
                y: 0.7,
                width: 1,
            },
            specialButtons: {
                border: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].specialButtons.border,
                color: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].specialButtons.color,
                display: 'arc',
                opacity: 0.75,
                spacing: 3.57,
                x: 0.6425,
                y: 0.5625,
                width: 1,
            },
            fpsText: {
                x: 0.45,
                y: -0.1,
            },
            leftHud: {
                offset: 36,
                scale: 0.08,
                x: 0.365,
                y: 0.9125,
            },
            smallHud: { 
                offset: 36,
                scale: 0.08,
                x: 0.5,
                y: 0.9125
            },
        };
        this.tutorial = initTutorial;
    };
    [key: string]: any;
};

export const initSettings: Settings = new Settings('settings', 'constitution');