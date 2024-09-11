import { Combat } from "../stores/combat";
import * as Dispatcher from "./Dispatcher";
import { EventBus } from "../game/EventBus";

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
    'Weapon': (data: KVI) => Dispatcher.weapon(data),
    'Health': (data: KVI) => Dispatcher.health(data),
    'Set Health': (data: KVI) => Dispatcher.setHealth(data),
    'Instant': (data: string) => Dispatcher.instant(data),
    'Consume': (data: any[]) => Dispatcher.prayer(data),
    'Chiomic': (data: number) => Dispatcher.chiomic(data),
    'Sacrifice': (data: number) => Dispatcher.sacrifice(data),
    'Suture': (data: number) => Dispatcher.suture(data),
    'Enemy Chiomic': (data: number) => Dispatcher.enemyChiomic(data),
    'Enemy Sacrifice': (data: number) => Dispatcher.enemySacrifice(data),
    'Enemy Suture': (data: number) => Dispatcher.enemySuture(data),
    'Enemy Tshaeral': (data: number) => Dispatcher.enemyTshaeral(data),
    'Tshaeral': (data: number) => Dispatcher.tshaeral(data),
    'Player': (data: any) => Dispatcher.player(data),
    'Enemy': (data: any) => Dispatcher.enemy(data),
};

export default class CombatMachine {
    private context: any;
    private actionQueue: Action[];
    private clearQueue: string[];
    private inputQueue: KVI[];

    constructor(context: any) { // dispatch: any
        this.context = context;
        this.actionQueue = [];
        this.clearQueue = [];
        this.inputQueue = [];
        this.listener();
    };
    public cleanUp = () => EventBus.off('combat', this.listener);
    private listener = () => EventBus.on('combat', (e: Combat): Combat => (this.context = e));
    public process = (): void => {
        while (this.clearQueue.length > 0) {
            const clearId = this.clearQueue.shift()!;
            this.inputQueue = this.inputQueue.filter(({ id }) => id !== clearId);
            this.actionQueue = this.actionQueue.filter(({ id }) => id !== clearId);
        };
        while (this.inputQueue.length > 0) {
            const { key, value, id } = this.inputQueue.shift()!;
            if (!id || this.context.enemyID === id) {
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