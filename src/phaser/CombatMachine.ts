// import { CombatData } from "../../components/GameCompiler/CombatStore";
// import { StatusEffect } from "../../components/GameCompiler/StatusEffects";
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
            const { key, value } = data;
            console.log(`Weapon action: ${key} with value: ${value}`);
            if (key === 'action' && value === 'counter' && this.state.computerAction === '') {
                return; // Don't allow counter if computer hasn't acted yet. Null action.
            };
            if (key === 'computerAction' && value === 'counter' && this.state.action === '') {
                return; // Don't allow counter if player hasn't acted yet. Null action.
            };
            Dispatcher.weaponAction(data);
        },
        Health: (data: KVI) => Dispatcher.healthAction(data),
        Instant: (data: string) => Dispatcher.instantAction(data),
        Consume: (data: any[]) => Dispatcher.prayerAction(data),
        Tshaeral: (_data: KVI) => Dispatcher.tshaeralAction(),
        Player: (data: any) => Dispatcher.playerAction(data),
        Enemy: (data: any) => Dispatcher.enemyAction(data),
    };

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
            console.log(`Inputting key: ${key} with value: ${value} and id: ${id}`, this.context.enemyID, 'enemyID')
            if (!id || this.context.enemyID === id) {
                console.log(`Inputting key: ${key} with value: ${value}`);    
                console.log(`updating combat with: ${key} and ${value}`);
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