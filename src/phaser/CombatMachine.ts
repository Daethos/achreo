import { Combat } from "../stores/combat";
import * as Dispatcher from "./Dispatcher";
import { EventBus } from "../game/EventBus";

type ActionHandler = (data: any) => void;
interface Action {
    type: string;
    data: any;
    id?: string;
};
export type KVI = {
    key: string;
    value: string | number | boolean;
    id?: string; 
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
    
    private actionHandlers: { [key: string]: ActionHandler } = {
        Weapon: (data: KVI) => Dispatcher.weapon(data),
        Health: (data: KVI) => Dispatcher.health(data),
        Instant: (data: string) => Dispatcher.instant(data),
        Consume: (data: any[]) => Dispatcher.prayer(data),
        Chiomic: (data: number) => Dispatcher.chiomic(data),
        Sacrifice: (_data: undefined) => Dispatcher.sacrifice(),
        Suture: (_data: undefined) => Dispatcher.suture(),
        'Enemy Chiomic': (data: number) => Dispatcher.enemyChiomic(data),
        'Enemy Sacrifice': (_data: undefined) => Dispatcher.enemySacrifice(),
        'Enemy Suture': (_data: undefined) => Dispatcher.enemySuture(),
        'Enemy Tshaeral': (data: number) => Dispatcher.enemyTshaeral(data),
        Tshaeral: (data: number) => Dispatcher.tshaeral(data),
        Player: (data: any) => Dispatcher.player(data),
        Enemy: (data: any) => Dispatcher.enemy(data),
    };

    public cleanUp = () => EventBus.off('combat', this.listener);
    private listener = () => EventBus.on('combat', (e: Combat): Combat => (this.context = e));
    private process = (): void => {
        // if (this.context.computerWin === true) {
        //     this.inputQueue = [];
        //     this.actionQueue = [];
        // };
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
            const handler = this.actionHandlers[action.type as keyof typeof this.actionHandlers];
            if (handler) {
                handler(action.data); 
            } else {
                console.warn(`No handler for action type: ${action.type}. Console data: ${action.data}.`);
            };
        };
    };

    public action = (act: Action): number => this.actionQueue.push(act);
    public clear = (id: string): number => this.clearQueue.push(id); 
    public input = (key: string, value: string | number | boolean, id?: string): number => this.inputQueue.push({key, value, id}); 
    public processor = (): void => this.process();
};