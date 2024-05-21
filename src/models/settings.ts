import { startingSpecials } from "../utility/abilities";
import { useResizeListener } from "../utility/dimensions";

const dimensions = useResizeListener();

export default class Settings {
    public _id: string;
    public music: boolean;
    public sound: boolean;
    public volume: number;
    public joystick: number;
    public vibration: number;
    public actions: string[];
    public specials: string[];
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
    public difficulty: { 
        aggression: number; 
        aim: boolean; 
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
        leftJoystick: { x: number; y: number; };
        rightJoystick: { x: number; y: number; };
        actionButtons: { x: number; y: number; };
        specialButtons: { x: number; y: number; };
        fpsText: { x: number; y: number; };
        leftHud: { x: number; y: number; };
        smallHud: { x: number; y: number; };
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
        this.difficulty = {
            aggression: 0.5,
            aim: false,
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
            leftJoystick: { 
                x: 0.05, 
                y: 0.8 
            },
            rightJoystick: { 
                x: 0.95, 
                y: 0.8 
            },
            actionButtons: {
                x: 0.825,
                y: 0.75,
            },
            specialButtons: {
                x: 0.7675,
                y: 0.6125,
            },
            fpsText: {
                x: 0.45,
                y: -0.1,
            },
            leftHud: {
                x: 0.025,
                y: 1.025,
            },
            smallHud: { 
                x: 0.4625, 
                y: 1.025 
            },
        };
    };
    [key: string]: any;
};

export const initSettings: Settings = new Settings('settings', 'constitution');