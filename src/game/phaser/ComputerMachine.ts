import * as Dispatcher from "./ComputerDispatcher";
import { EventBus } from "../EventBus";
import { CombatManager } from "./CombatManager";
import { Combat } from "../../stores/combat";
import StatusEffect from "../../models/prayer";

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
    'Computer Weapon': (data: KVI) => Dispatcher.computerWeapon(data),
    'Computer Health': (data: KVI) => Dispatcher.computerHealth(data),
    'Computer Set Health': (data: KVI) => Dispatcher.computerSetHealth(data),
    'Computer Chiomic': (data: number) => Dispatcher.computerChiomic(data),
    'Computer Sacrifice': (data: number) => Dispatcher.computerSacrifice(data),
    'Computer Suture': (data: number) => Dispatcher.computerSuture(data),
    'Computer Enemy Chiomic': (data: number) => Dispatcher.computerEnemyChiomic(data),
    'Computer Enemy Sacrifice': (data: number) => Dispatcher.computerEnemySacrifice(data),
    'Computer Enemy Suture': (data: number) => Dispatcher.computerEnemySuture(data),
    'Computer Enemy Tshaeral': (data: number) => Dispatcher.computerEnemyTshaeral(data),
    'Computer Tshaeral': (data: number) => Dispatcher.computerTshaeral(data),
    'Computer Player': (data: any) => Dispatcher.computerPlayer(data),
    'Computer Enemy': (data: any) => Dispatcher.computerEnemy(data),
    'Computer Remove Enemy': (data: KVI) => Dispatcher.computerRemoveEnemy(data),
    'Computer Remove Effect': (data: StatusEffect) => Dispatcher.computerRemoveEffect(data),
};

export default class ComputerMachine {
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
    public process = (): void => {
        while (this.clearQueue.length > 0) {
            const clearId = this.clearQueue.shift()!;
            this.inputQueue = this.inputQueue.filter(({ id }) => id !== clearId);
            this.actionQueue = this.actionQueue.filter(({ id }) => id !== clearId);
        };
        while (this.inputQueue.length > 0) {
            const { key, value, id } = this.inputQueue.shift()!;
            if (!id || this.combat.enemyID === id) {
                EventBus.emit('update-combat-state', { key, value });
            };
        };
        while (this.actionQueue.length > 0) {
            const action = this.actionQueue.shift()!;
            const handler = ACTIONS[action.type as keyof typeof ACTIONS];
            if (handler) {
                handler(action.data); 
            } else {
                console.warn(`No handler for action type: ${action.type}. Console data: ${action.data}.`);
            };
        };
    };

    public action = (act: Action): number => this.actionQueue.push(act);
    public clear = (id: string): number => this.clearQueue.push(id); 
    public input = (key: string, value: string | number | boolean | any, id?: string): number => this.inputQueue.push({key, value, id}); 
};