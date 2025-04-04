import * as Dispatcher from "./Dispatcher";
import { EventBus } from "../EventBus";
import { CombatManager } from "./CombatManager";
import { Combat } from "../../stores/combat";
import StatusEffect from "../../utility/prayer";

type ActionHandler = (data: any) => void;

interface Action {
    type: string;
    data: any;
    id?: string | undefined;
};

export type KVI = {
    key: string;
    value: string | number | boolean;
    id?: string; 
};

const ACTIONS: { [key: string]: ActionHandler } = {
    "Weapon": (data: KVI) => Dispatcher.weapon(data),
    "Health": (data: KVI) => Dispatcher.health(data),
    "Set Health": (data: KVI) => Dispatcher.setHealth(data),
    "Instant": (data: string) => Dispatcher.instant(data),
    "Consume": (data: any[]) => Dispatcher.prayer(data),
    "Chiomic": (data: number) => Dispatcher.chiomic(data),
    "Prayer": (data: string) => Dispatcher.talentPrayer(data),
    "Sacrifice": (data: number) => Dispatcher.sacrifice(data),
    "Suture": (data: number) => Dispatcher.suture(data),
    "Enemy Chiomic": (data: number) => Dispatcher.enemyChiomic(data),
    "Enemy Sacrifice": (data: number) => Dispatcher.enemySacrifice(data),
    "Enemy Suture": (data: number) => Dispatcher.enemySuture(data),
    "Enemy Tshaeral": (data: number) => Dispatcher.enemyTshaeral(data),
    "Tshaeral": (data: number) => Dispatcher.tshaeral(data),
    "Player": (data: any) => Dispatcher.player(data),
    "Enemy": (data: any) => Dispatcher.enemy(data),
    "Remove Enemy": (data: KVI) => Dispatcher.removeEnemy(data),
    "Remove Effect": (data: StatusEffect) => Dispatcher.removeEffect(data),
};

export default class CombatMachine {
    private combat: Combat;
    private actionQueue: Action[];
    private clearQueue: string[];
    private inputQueue: KVI[];

    constructor(manager: CombatManager) { // dispatch: any
        this.combat = manager.context.state;
        this.actionQueue = [];
        this.clearQueue = [];
        this.inputQueue = [];
    };

    public process(): void {
        if (this.clearQueue.length) {
            const clearSet = new Set(this.clearQueue);
            this.inputQueue = this.inputQueue.filter(({ id }) => !clearSet.has(id!));
            this.actionQueue = this.actionQueue.filter(({ id }) => !clearSet.has(id!));
            this.clearQueue = [];
        };
        
        if (this.inputQueue.length) {
            const inputs = this.inputQueue;
            this.inputQueue = [];
            for (const { key, value, id } of inputs) {
                if (!id || this.combat.enemyID === id) {
                    EventBus.emit("update-combat-state", { key, value });
                };
            };
        };
        
        if (this.actionQueue.length) {
            const actions = this.actionQueue;
            this.actionQueue = [];
            for (const action of actions) {
                const handler = ACTIONS[action.type];
                handler?.(action.data);
            };
        };
    };

    public action = (act: Action): number => this.actionQueue.push(act);
    public clear = (id: string): number => this.clearQueue.push(id); 
    public input = (key: string, value: string | number | boolean | any, id?: string): number => this.inputQueue.push({key, value, id}); 
};