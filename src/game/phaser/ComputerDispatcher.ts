import { KVI } from "./CombatMachine";
import { EventBus } from "../EventBus";
import StatusEffect from "../../utility/prayer";
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
    SET_HEALTH: 'Set Health',
    SACRIFICE: 'Sacrifice',
    SUTURE: 'Suture',
    ENEMY_CHIOMIC: 'Enemy Chiomic',
    ENEMY_SACRIFICE: 'Enemy Sacrifice',
    ENEMY_SUTURE: 'Enemy Suture',
    ENEMY_TSHAERAL: 'Enemy Tshaeral',
    REMOVE: 'Remove Enemy',
};

function computerWeapon(data: KVI): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.WEAPON });
};
function computerPlayer(data: any): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.PLAYER });
};
function computerEnemy(data: any): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.ENEMY });
};
function computerActionInput({ key, value }: { key: string, value: string | number | boolean }): void {
    EventBus.emit('update-computer-combat-state', { key, value });
};
function computerChiomic(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.CHIOMIC });
};
function computerSacrifice(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.SACRIFICE });
};
function computerSuture(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.SUTURE });
};
function computerEnemyChiomic(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.ENEMY_CHIOMIC });
};
function computerEnemySacrifice(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.ENEMY_SACRIFICE });
};
function computerEnemySuture(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.ENEMY_SUTURE });
};
function computerTshaeral(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.TSHAERAL });
};
function computerEnemyTshaeral(data: number): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.ENEMY_TSHAERAL });
};
function computerHealth(data: KVI): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.HEALTH });
};
function computerSetHealth(data: KVI): void {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.SET_HEALTH });
};
function computerRemoveEnemy(data: KVI) {
    EventBus.emit('initiate-computer-combat', { data, type: ActionTypes.REMOVE })
};
function computerRemoveEffect(data: StatusEffect) {
    EventBus.emit('initiate-computer-combat', { data, type: 'Remove Tick' });
};

export { computerWeapon, computerPlayer, computerEnemy, computerActionInput, computerChiomic, computerEnemyChiomic, computerEnemySacrifice, computerEnemySuture, computerEnemyTshaeral, computerHealth, computerRemoveEffect, computerRemoveEnemy, computerSacrifice, computerSetHealth, computerSuture, computerTshaeral };