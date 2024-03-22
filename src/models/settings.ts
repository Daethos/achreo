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
    public control: string;
    public creationLeft: string;
    public creationRight: string;

    public constructor(id: string) {
        this._id = id;
        this.music = true;
        this.sound = true;
        this.volume = 0.3;
        this.joystick = 0.5;
        this.vibration = 100;
        this.actions = ['Attack', 'Posture', 'Roll', 'Dodge', 'Counter'];
        this.specials = ['Consume', 'Invoke', 'Polymorph', 'Root', 'Tshaeral'];
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
        this.control = 'Buttons';
    };
    [key: string]: any;
};

export const initSettings: Settings = new Settings('settings');