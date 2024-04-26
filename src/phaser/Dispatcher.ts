import { KVI } from "./CombatMachine";
import { EventBus } from "../game/EventBus";

const ActionTypes = {
    WEAPON: 'Weapon',
    INSTANT: 'Instant',
    CONSUME: 'Consume',
    PRAYER: 'Prayer',
    PLAYER: 'Player',
    ENEMY: 'Enemy',
    INPUT: 'Input',
    CHIOMIC: 'Chiomic',
    TSHAERAL: 'Tshaeral',
    HEALTH: 'Health',
    SACRIFICE: 'Sacrifice',
    SUTURE: 'Suture',
};

function weapon(data: KVI): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.WEAPON });
};

function instant(data: string): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.INSTANT });
};

function prayer(data: any[]): void {
    console.log('Prayer action: ', data);
    EventBus.emit('initiate-combat', { data: { prayerSacrificeId: data }, type: ActionTypes.CONSUME });
};

function player(data: any): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.PLAYER });
};

function enemy(data: any): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.ENEMY });
};

function actionInput({ key, value }: { key: string, value: string | number | boolean }): void {
    console.log(`Action input: ${key} with value: ${value}`);
    EventBus.emit('update-combat-state', { key, value });
};

function chiomic(data: number): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.CHIOMIC });
};

function sacrifice(): void {
    EventBus.emit('initiate-combat', { type: ActionTypes.SACRIFICE });
};

function suture(): void {
    EventBus.emit('initiate-combat', { type: ActionTypes.SUTURE });
};

function tshaeral(data: number): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.TSHAERAL });
};

function health(data: KVI): void {
    EventBus.emit('initiate-combat', { data, type: ActionTypes.HEALTH });
};

export { weapon, instant, prayer, player, enemy, actionInput, chiomic, tshaeral, health, sacrifice, suture };