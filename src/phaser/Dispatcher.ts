import { KVI } from "./CombatMachine";
import { EventBus } from "../game/EventBus";

const ActionTypes = {
    WEAPON: 'Weapon',
    INSTANT: 'Instant',
    PRAYER: 'Prayer',
    PLAYER: 'Player',
    ENEMY: 'Enemy',
    INPUT: 'Input',
    TSHAERAL: 'Tshaeral',
    HEALTH: 'Health',
};

function weaponAction(data: KVI): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.WEAPON });
};

function instantAction(data: string): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.INSTANT });
};

function prayerAction(data: any[]): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.PRAYER });
};

function playerAction(data: any): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.PLAYER });
};

function enemyAction(data: any): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.ENEMY });
};

function actionInput({ key, value }: { key: string, value: string | number | boolean }): void {
    console.log(`Action input: ${key} with value: ${value}`);
    EventBus.emit('update-combat-state', { key, value });
};

function tshaeralAction(): void {
    EventBus.emit('initiate-combat', { data: null, type: ActionTypes.TSHAERAL });
};

function healthAction(data: KVI): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.HEALTH });
};

export { weaponAction, instantAction, prayerAction, playerAction, enemyAction, actionInput, tshaeralAction, healthAction };