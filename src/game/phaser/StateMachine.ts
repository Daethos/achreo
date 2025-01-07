export interface StateInterface {
    name?: string;
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
    COMPUTER_COMBAT: "computer_combat",

    ATTACK: "attack",
    PARRY: "parry",
    DODGE: "dodge",
    POSTURE: "posture",
    ROLL: "roll",
    THRUST: "thrust",
    COMPUTER_ATTACK: "computer_attack",
    COMPUTER_PARRY: "computer_parry",
    COMPUTER_POSTURE: "computer_posture",
    COMPUTER_THRUST: "computer_thrust",
    CONTEMPLATE: "contemplate",
    EVADE: "evade",
    HEAL: "heal",
    HURT: "hurt",
    LULL: "lull",

    ARC: 'arc',
    BLINK: "blink",
    CONFUSE: "confuse",
    CONSUME: "consume",
    DESPERATION: "desperation",
    FEAR: "fear",
    PARALYZE: "paralyze",
    HEALING: "healing",
    INVOKE: "invoke",
    KYRNAICISM: "kyrnaicism",
    LEAP: "leap",
    POLYMORPH: "polymorph",
    PURSUIT: "pursuit",
    RANGED_STUN: "ranged_stun",
    ROOT: "root",
    RUSH: "rush",
    SACRIFICE: "sacrifice",

    DISPEL: "dispel",
    SHADOW: "shadow",
    SHIRK: "shirk",
    TETHER: "tether",

    HOOK: "hook",
    MARK: "mark",
    NETHERSWAP: "netherswap",
    RECALL: "recall",

    ACHIRE: 'achire', // Casted, Damage Projectile, Manual Aim || Fuchsia & Teal
    ASTRAVE: 'astrave', // Casted, AoE, Damage, Manual Aim || Yelllow & Bone
    FYERUS: 'fyerus', // Channeled, AoE, Damage w/ Snare?, Manual Aim || Aqua & Ruby
    KYNISOS: 'kynisos', // Casted, AoE, Root, Manual Aim || Gold & Green
    QUOR: 'quor', // 3s, 6x, can crit, manual, mid grace, low cooldown
    MAIERETH: 'maiereth', // cast, 1-1.5s, direct, (var of Ascean).damage, can crit, mid range, low grace, low cooldown
    ILIRECH: 'ilirech', // cast, 1s, direct, -X health, X * 2 damage, low range, low grace, 2s cooldown
    RECONSTITUTE: 'reconstitute', // channel, 5s, 1s/tick, +10-15% health
    
    SHROUD: "shroud",
    SLOW: "slow",
    SLOWING: "slowing",
    SNARE: "snare",
    STORM: "storm",
    SUTURE: "suture",
    TSHAERAL: "tshaeral",
    TSHAER: "tshaer",
    TSHAERING: "tshaering",
    
    // Traits
    ASTRICATION: "astrication",
    BERSERK: "berserk",
    BLIND: "blind",
    CAERENESIS: "caerenesis",
    CONVICTION: "conviction",
    DEVOUR: "devour",
    ENDURANCE: "endurance",
    IMPERMANENCE: "impermanence",
    SEER: "seer",
    STIMULATE: "stimulate",

    // Meta Machine
    CLEAN: "clean",
    ABSORB: "absorb",
    CHIOMIC: "chiomic",
    DISEASE: "disease",
    ENVELOP: "envelop",
    FREEZE: "freeze",
    HOWL: "howl",
    MALICE: "malice",
    MENACE: "menace",
    MEND: "mend",
    MODERATE: "moderate",
    MULTIFARIOUS: "multifarious",
    MYSTIFY: "mystify",
    PROTECT: "protect",
    RECOVER: "recover",
    REIN: 'rein', // reactive shield, grace++
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
    COUNTERSPELLED: 'counterspelled',
    FEARED: "feared",
    FROZEN: "frozen",
    PARALYZED: 'paralyzed',
    POLYMORPHED: "polymorphed",
    ROOTED: "rooted",
    SLOWED: "slowed",
    SNARED: "snared",
    STUN: "stun",
    STUNNED: "stunned",
};

export const specialStateMachines = [States.ARC, States.BLINK, States.CONFUSE, States.CONSUME, States.DESPERATION, States.FEAR, States.PARALYZE, 
    States.HEALING, States.INVOKE, States.KYRNAICISM, States.LEAP, States.POLYMORPH, States.PURSUIT, States.ROOT, States.RUSH, States.SACRIFICE, 
    States.DISPEL, States.SHADOW, States.SHIRK, States.TETHER, States.ACHIRE, States.ASTRAVE, States.FYERUS, States.KYNISOS, States.QUOR, 
    States.MAIERETH, States.ILIRECH, States.RECONSTITUTE, States.SHROUD, States.SLOW, States.SLOWING, States.STORM, States.SNARE, States.STORM, 
    States.SUTURE, States.TSHAERAL, States.TSHAER, States.TSHAERING];
export const specialPositiveMachines = [States.ABSORB, States.CHIOMIC, States.DISEASE, States.ENVELOP, States.FREEZE, States.HOWL, States.MALICE, 
    States.MEND, States.MODERATE, States.MULTIFARIOUS, States.MYSTIFY, States.PROTECT, States.RECOVER, States.REIN, States.RENEWAL, States.SCREAM, 
    States.SHIELD, States.SHIMMER, States.SPRINTING, States.WARD, States.WRITHE];

let idCount = 0;

export default class StateMachine {
    private states: Map<string, StateInterface>;
    private currentState?: StateInterface;
    private id: string = (++idCount).toString();
    private context?: object;
    public isChangingState: boolean = false;
    private changeStateQueue: string[] = []; 

    constructor(context?: object, id?: string) {
        this.id = id || this.id;
        this.context = context;
        this.states = new Map();
    };

    getCurrentState() {
        return this.currentState?.name;
    };

    // if (!state) console.warn(`State ${name} does not exist`);
    isState(name: string) {
        const state = this.states.has(name);
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

    // console.warn(`State ${name} does not exist`);
    setState(name: string) {  
        if (!this.states.has(name)) {
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