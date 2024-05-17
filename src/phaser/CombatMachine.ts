import { EventBus } from "../game/EventBus";
import * as Dispatcher from "./Dispatcher";
import { Combat } from "../stores/combat";

type ActionHandler = (data: any) => void;

interface Action {
    type: string;
    data: any;
    id?: string;
};
export interface KVI {
    key: string;
    value: string | number | boolean;
    id?: string; 
};

// function valid(key: string, value: string, state: Combat): boolean {
//     if (key === 'action' && value === 'counter' && state.computerAction === '') {
//         return false;
//     };
//     if (key === 'computerAction' && value === 'counter' && state.action === '') {
//         return false;
//     };
//     return true;
// };

export default class CombatMachine {
    private context: any;
    private actionQueue: Action[];
    private clearQueue: string[];
    private inputQueue: KVI[];
    // private dispatch: any;
    private state: any;

    constructor(context: any) { // dispatch: any
        this.context = context;
        this.actionQueue = [];
        this.clearQueue = [];
        this.inputQueue = [];
        // this.dispatch = dispatch;
        this.state = {};
        this.listener();
    };
    
    private actionHandlers: { [key: string]: ActionHandler } = {
        Weapon: (data: KVI) => {
            // const { key, value } = data;
            // if (!valid(key, value as string, this.context)) {
            //     return; // Don't allow counter if computer hasn't acted yet. Null action.
            // };
            Dispatcher.weapon(data);
        },
        Health: (data: KVI) => Dispatcher.health(data),
        Instant: (data: string) => Dispatcher.instant(data),
        Consume: (data: any[]) => Dispatcher.prayer(data),
        Chiomic: (data: number) => Dispatcher.chiomic(data),
        Sacrifice: (_data: undefined) => Dispatcher.sacrifice(),
        Suture: (_data: undefined) => Dispatcher.suture(),
        'Enemy Chiomic': (data: number) => Dispatcher.enemyChiomic(data),
        'Enemy Sacrifice': (_data: undefined) => Dispatcher.enemySacrifice(),
        'Enemy Suture': (_data: undefined) => Dispatcher.enemySuture(),
        Tshaeral: (data: number) => Dispatcher.tshaeral(data),
        Player: (data: any) => Dispatcher.player(data),
        Enemy: (data: any) => Dispatcher.enemy(data),
    };

    public cleanUp = () => EventBus.off('combat', this.listener);

    private listener = () => EventBus.on('combat', (e: Combat): Combat => (this.context = e));

    private process = (): void => {
        if (this.context.computerWin) {
            this.inputQueue = [];
            this.actionQueue = [];
        };

        while (this.clearQueue.length) {
            const clearId = this.clearQueue.shift()!;
            this.inputQueue = this.inputQueue.filter(({ id }) => id !== clearId);
            this.actionQueue = this.actionQueue.filter(({ id }) => id !== clearId);
        };

        while (this.inputQueue.length) {
            const { key, value, id } = this.inputQueue.shift()!;
            if (!id || this.context.enemyID === id) {
                EventBus.emit('update-combat-state', { key, value });
            };
        };

        while (this.actionQueue.length) {
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