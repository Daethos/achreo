import { KVI } from "./CombatMachine";
import { EventBus } from "../EventBus";
import StatusEffect from "../../utility/prayer";
const INITIATE = "initiate-combat";
const UPDATE = "update-combat-state";
const ActionTypes = {
    WEAPON: "Weapon",
    INSTANT: "Instant",
    CONSUME: "Consume",
    PRAYER: "Prayer",
    TALENT_PRAYER: "Talent Prayer",
    PLAYER: "Player",
    ENEMY: "Enemy",
    INPUT: "Input",
    CHIOMIC: "Chiomic",
    TSHAERAL: "Tshaeral",
    HEALTH: "Health",
    SET_HEALTH: "Set Health",
    SACRIFICE: "Sacrifice",
    SUTURE: "Suture",
    ENEMY_CHIOMIC: "Enemy Chiomic",
    ENEMY_SACRIFICE: "Enemy Sacrifice",
    ENEMY_SUTURE: "Enemy Suture",
    ENEMY_TSHAERAL: "Enemy Tshaeral",
    REMOVE: "Remove Enemy",
};
function weapon(data: KVI): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.WEAPON });
};
function instant(data: string): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.INSTANT });
};
function prayer(data: any[]): void {
    EventBus.emit(INITIATE, { data: { prayerSacrificeId: data }, type: ActionTypes.CONSUME });
};
function player(data: any): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.PLAYER });
};
function enemy(data: any): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.ENEMY });
};
function actionInput({ key, value }: { key: string, value: string | number | boolean }): void {
    EventBus.emit(UPDATE, { key, value });
};
function chiomic(data: {power:number,type:string}): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.CHIOMIC });
};
function sacrifice(data: number): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.SACRIFICE });
};
function suture(data: number): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.SUTURE });
};
function enemyChiomic(data: number): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.ENEMY_CHIOMIC });
};
function enemySacrifice(data: number): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.ENEMY_SACRIFICE });
};
function enemySuture(data: number): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.ENEMY_SUTURE });
};
function tshaeral(data: number): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.TSHAERAL });
};
function enemyTshaeral(data: number): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.ENEMY_TSHAERAL });
};
function health(data: KVI): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.HEALTH });
};
function setHealth(data: KVI): void {
    EventBus.emit(INITIATE, { data, type: ActionTypes.SET_HEALTH });
};
function removeEnemy(data: KVI) {
    EventBus.emit(INITIATE, { data, type: ActionTypes.REMOVE });
};
function removeEffect(data: StatusEffect) {
    EventBus.emit(INITIATE, { data, type: "Remove Tick" });
};
function talentPrayer(data: string) {
    EventBus.emit(INITIATE, { data, type: ActionTypes.TALENT_PRAYER });
};

export { weapon, instant, prayer, player, enemy, actionInput, chiomic, tshaeral, health, setHealth, sacrifice, suture, enemyChiomic, enemySacrifice, enemySuture, enemyTshaeral, removeEnemy, removeEffect, talentPrayer };