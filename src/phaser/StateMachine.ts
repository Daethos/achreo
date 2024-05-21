export interface StateInterface {
    name: string;
    onEnter?: () => void;
    onUpdate?: (dt: number) => void;
    onExit?: () => void;
};

export const States = {
    DEFEATED: "defeated",
    DEATH: "death",
    
    AWARE: "aware",
    CHASE: "chase",
    IDLE: "idle",
    LEASH: "leash",
    PATROL: "patrol",
    
    COMBAT: "combat",
    NONCOMBAT: "noncombat",
    
    ATTACK: "attack",
    PARRY: "parry",
    DODGE: "dodge",
    POSTURE: "posture",
    ROLL: "roll",
    EVADE: "evade",
    HEAL: "heal",
    HURT: "hurt",
    
    ARC: 'arc',
    BLINK: "blink",
    CONFUSE: "confuse",
    CONSUME: "consume",
    DESPERATION: "desperation",
    KYRNAICISM: "kyrnaicism",
    FEAR: "fear",
    FREEZE_CAST: "freeze_cast",
    HEALING: "healing",
    INVOKE: "invoke",
    LEAP: "leap",
    POLYMORPH: "polymorph",
    PURSUIT: "pursuit",
    RANGED_STUN: "ranged_stun",
    ROOT: "root",
    RUSH: "rush",
    SACRIFICE: "sacrifice",
    SHROUD: "shroud",
    SLOW: "slow",
    SLOWING: "slowing",
    SNARE: "snare",
    STORM: "storm",
    SUTURE: "suture",
    TSHAERAL: "tshaeral",
    TSHAER: "tshaer",
    TSHAERING: "tshaering",

    // Meta Machine
    CLEAN: "clean",
    CHIOMIC: "chiomic",
    DISEASE: "disease",
    ENVELOP: "envelop",
    FREEZE: "freeze",
    HOWL: "howl",
    MALICE: "malice",
    MEND: "mend",
    PROTECT: "protect",
    RECOVER: "recover",
    RENEWAL: "renewal",
    SCREAM: "scream",
    SHIELD: "shield",
    SHIMMER: "shimmer",
    SPRINTING: "sprint",
    STEALTH: "stealth",
    WARD: "ward",
    WRITHE: "writhe",
    
    // Negative States
    CONFUSED: "confused",
    CONSUMED: "consumed",
    FEARED: "feared",
    FROZEN: "frozen",
    POLYMORPHED: "polymorphed",
    ROOTED: "rooted",
    SLOWED: "slowed",
    SNARED: "snared",
    STUN: "stun",
    STUNNED: "stunned",
};

let idCount = 0;

export default class StateMachine {
    private states: Map<string, StateInterface>;
    private currentState?: StateInterface;
    private id: string = (++idCount).toString();
    private context?: object;
    private isChangingState: boolean = false;
    private changeStateQueue: string[] = []; 

    constructor(context?: object, id?: string) {
        this.id = id || this.id;
        this.context = context;
        this.states = new Map();
    };

    isState(name: string) {
        const state = this.states.has(name);
        if (!state) console.warn(`State ${name} does not exist`);
        return state;
    };

    isCurrentState(name: string) {
        if (!this.currentState) return false;
        return this.currentState.name === name;
    };

    addState(name: string, config?: StateInterface) {
        this.states.set(name, {
            name,
            onEnter: config?.onEnter?.bind(this.context),
            onUpdate: config?.onUpdate?.bind(this.context),
            onExit: config?.onExit?.bind(this.context)
        });
        return this;
    };

    public clearStates(): void {
        this.changeStateQueue = [];
    };

    setState(name: string) {  
        if (!this.states.has(name)) {
            console.warn(`State ${name} does not exist`);
            return;
        }; 
        if (this.isCurrentState(name)) return;
        if (this.isChangingState === true) {
            this.changeStateQueue.push(name); 
            return;
        }; 
        this.isChangingState = true;
        if (this.currentState && this.currentState.onExit) this.currentState.onExit();
        this.currentState = this.states.get(name)!;
        if (this.currentState && this.currentState.onEnter) this.currentState.onEnter();
        this.isChangingState = false;
    };

    update(dt: number) {
        if (this.changeStateQueue.length > 0) {
            this.setState(this.changeStateQueue.shift()!);
            return;
        };
        if (this.currentState && this.currentState.onUpdate) this.currentState?.onUpdate?.(dt);
    }; 
};