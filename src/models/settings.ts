import { startingSpecials } from "../utility/abilities";

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
    public control: string;
    public creationLeft: string;
    public creationRight: string;
    public desktop: boolean;
    public difficulty: { 
        aggression: number; 
        aim: boolean; 
        computer: boolean;
        special: number;
        tidbits: boolean; 
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
        solidHud: { right: number; };
    };

    public constructor(id: string, mastery: string) {
        this._id = id;
        this.music = true;
        this.sound = true;
        this.volume = 0.3;
        this.joystick = 0.5;
        this.vibration = 100;
        this.actions = ['Attack', 'Posture', 'Roll', 'Dodge', 'Parry'];
        this.specials = startingSpecials[mastery as keyof typeof startingSpecials];
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
        this.control = 'Buttons';
        this.desktop = false;
        this.difficulty = {
            aggression: 0.5,
            aim: false,
            computer: false,
            special: 0.5,
            tidbits: false,
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
                base: 0x000000,
                thumb: 0xfdf6d8,
                opacity: 0.2,
                x: 0.05, 
                y: 0.8,
                width: 1, 
            },
            rightJoystick: { 
                base: 0x000000,
                thumb: 0xfdf6d8,
                opacity: 0.2,
                x: 0.95, 
                y: 0.8,
                width: 1, 
            },
            actionButtons: {
                border: 0xfdf6d8,
                color: 0x800080,
                display: 'arc',
                opacity: 0.2,
                spacing: 3.57,
                x: 0.825,
                y: 0.75,
                width: 1,
            },
            specialButtons: {
                border: 0xfdf6d8,
                color: 0x000000,
                display: 'arc',
                opacity: 0.2,
                spacing: 3.57,
                x: 0.7675,
                y: 0.6125,
                width: 1,
            },
            fpsText: {
                x: 0.45,
                y: -0.1,
            },
            leftHud: {
                offset: 43.75,
                scale: 0.095,
                x: 0.1,
                y: 1.025,
            },
            smallHud: { 
                offset: 43.75,
                scale: 0.095,
                x: 0.575, 
                y: 1.025 
            },
            solidHud: {
                right: 0.5,
            },
        };
    };
    [key: string]: any;
};

export const initSettings: Settings = new Settings('settings', 'constitution');