import { STARTING_MASTERY_UI } from "../utility/abilities";
import { initTutorial, Tutorial } from "../utility/tutorial";

export type Marker = {
    id: string;
    title: string;
    content: string;
    scene: string;
    x: number;
    y: number;
};

export default class Settings {
    public _id: string;
    public map: string;
    public music: boolean;
    public sound: boolean;
    public volume: number;
    public joystick: number;
    public vibration: number;
    public lockpick: {difficulty:string;count:number;};
    public pickpocket: {difficulty:string;};
    public actions: string[];
    public specials: string[];
    public totalSpecials: string[];
    public prayer: string;
    public prayers: string[];
    public fps: { 
        min: number; 
        target: number; 
        limit: number; 
        forceSetTimeOut: boolean; 
        deltaHistory: number; 
        panicMax: number; 
        smoothStep: boolean; 
    };
    public shake: { 
        enabled: boolean; duration: number; intensity: number; 
    };
    public selected: { 
        prayer: number; 
        damageType: number; 
        weapon: number; 
        highlight: string; 
    };
    public show: { 
        combat: boolean; 
        dialog: boolean; 
        inventory: boolean; 
        loot: boolean; 
        player: boolean;
        hudCombatText: boolean;
    };
    public asceanViews: string;
    public settingViews: string;
    public characterViews: string;
    public faithViews: string;
    public healthViews: string;
    public reputationViews: string;
    public grace: string;
    public stamina: string;
    public coordinates: { x: number; y: number; };
    public combatText: { 
        size: string;
        left: string; 
        top: string; 
        height: string; 
        width: string; 
    };
    public combatSettings: { 
        size: string;
        left: string; 
        top: string; 
        height: string; 
        width: string; 
    };
    public control: string;
    public desktop: boolean;
    public computerFocus: string;
    public computerLoadout: {
        attack: number;
        posture: number;
        roll: number;
        thrust: number;
        parry: number;
        jump: number;
        hurl: number;
        special: number;
    };
    public difficulty: {
        arena: boolean;
        aggression: number; 
        aggressionImmersion: boolean;
        aim: boolean;
        computer: boolean;
        special: number;
        tidbits: boolean; 
        tooltips: boolean;
        playerSpeed: number;
        enemySpeed: number;
        enemyCombatInteract: boolean;
    };
    public markers: Marker[];
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
        fpsText: { 
            x: number; 
            y: number; 
        };
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
    stances: {
        caerenic: boolean;
        stealth: boolean;
    };
    public tutorial: Tutorial;

    public constructor(id: string, mastery: string) {
        this._id = id;
        this.map = "Tutorial";
        this.music = true;
        this.sound = true;
        this.volume = 0.3;
        this.joystick = 0.5;
        this.vibration = 100;
        this.lockpick = { difficulty:"Easy", count:5 };
        this.pickpocket = { difficulty: "Easy" }
        this.actions = ["Attack", "Posture", "Roll", "Dodge", "Parry"];
        this.specials = []; // STARTING_SPECIALS[mastery];
        this.totalSpecials = []; // STARTING_SPECIALS[mastery];
        this.prayer = "Buff";
        this.prayers = ["Buff", "Heal", "Debuff", "Damage"];
        this.fps = {
            min: 5,
            target: 60,
            limit: 90,
            forceSetTimeOut: false,
            deltaHistory: 10,
            panicMax: 120,
            smoothStep: true
        };
        this.shake = { enabled: true, duration: 100, intensity: 0.05 };
        this.selected = {
            prayer: 0,
            damageType: 0,
            weapon: 0,
            highlight: "Weapon",
        };
        this.show = {
            combat: false,
            dialog: false,
            inventory: false,
            loot: false,
            player: false,
            hudCombatText: false
        };
        this.asceanViews = "Inventory";
        this.settingViews = "Control";
        this.characterViews = "Statistics";
        this.reputationViews = "Enemy";
        this.faithViews = "Deities";
        this.healthViews = "FULL";
        this.grace = "NUMBER";
        this.stamina = "NUMBER";
        this.coordinates = { x: 200, y: 200 };
        this.combatText = { size: "1.25em", left: "20vw", top: "40vh", height: "50vh", width: "60vw" };
        this.combatSettings = { size: "1.25em", left: "20%", top: "40%", height: "50%", width: "60%" };
        this.control = "Buttons";
        this.desktop = window.innerWidth > 1200;
        this.computerFocus = "Balanced";
        this.computerLoadout = {
            attack: 15,
            posture: 15,
            roll: 15,
            thrust: 15,
            parry: 15,
            jump: 0,
            hurl: 0,
            special: 25,
        };
        this.difficulty = {
            arena: true,
            aggressionImmersion: true,
            aggression: 0.25,
            aim: false,
            computer: false,
            special: 0,
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
        this.markers = [];
        this.positions = {
            camera: {
                x: 0,
                y: 0,
                z: 0,
                zoom: window.innerWidth > 1200 ? 3 : 1.25,
            },
            castbar: {
                barHeight: 20,
                barWidth: 180,
                barY: 0,
            },
            leftJoystick: { 
                base: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].leftJoystick.base,
                thumb: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].leftJoystick.thumb,
                opacity: 0.1,
                x: 0.1, 
                y: 0.725,
                width: 1, 
            },
            rightJoystick: { 
                base: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].rightJoystick.base,
                thumb: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].rightJoystick.thumb,
                opacity: 0.1,
                x: 0.9,
                y: 0.725,
                width: 1, 
            },
            actionButtons: {
                border: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].actionButtons.border,
                color: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].actionButtons.color,
                display: "arc",
                opacity: 0.75,
                spacing: 4,
                x: 0.75,
                y: 0.725,
                width: 1,
            },
            specialButtons: {
                border: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].specialButtons.border,
                color: STARTING_MASTERY_UI[mastery as keyof typeof STARTING_MASTERY_UI].specialButtons.color,
                display: "arc",
                opacity: 0.75,
                spacing: 4,
                x: 0.7,
                y: 0.62,
                width: 0.75,
            },
            fpsText: {
                x: 0.45,
                y: -0.1,
            },
            leftHud: {
                offset: 36,
                scale: 0.085,
                x: 0.005,
                y: 0.9125,
            },
            smallHud: { 
                offset: 36,
                scale: 0.085,
                x: 0.5,
                y: 0.9125
            },
        };
        this.stances = {
            caerenic: false,
            stealth: false,
        };
        this.tutorial = initTutorial;
    };
    [key: string]: any;
};

export const initSettings: Settings = new Settings("settings", "constitution");