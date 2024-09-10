import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Combat } from "../stores/combat";
import { CombatAttributes } from "./combat";
import { v4 as uuidv4 } from 'uuid';

export type Effect = { 
    physicalDamage?: number;
    magicalDamage?: number;
    physicalPenetration?: number;
    magicalPenetration?: number;
    criticalChance?: number;
    criticalDamage?: number;
    physicalDefenseModifier?: number;
    magicalDefenseModifier?: number;
    physicalPosture?: number;
    magicalPosture?: number;
    dodge?: number;
    roll?: number;
    healing?: number;
    damage?: number;
    [key: string]: any;
};

export type Intensity = {
    initial: number;
    value: number;
    magnitude: number;
    governance: string;
};

export type Tick = {
    start: number;
    end: number;
};

const EFFECT = {
    BASE: 1.1,
    ONE_FIFTEEN: 1.15,
    ONE_TWENTY_FIVE: 1.25,
    ONE_FIFTY: 1.5,
    TWO: 2,
    TWO_FIFTY: 2.5,
    FIVE: 5,
    TEN: 10,
    FIFTEEN: 15,
    TWENTY_FIVE: 25,
    FIFTY: 50,
    HUNDRED: 100,
    DURATION_MODIFIER: 3,
    DURATION_MAX: 6
};

const FAITHS = {
    ADHERENT: 'Adherent',
    DEVOTED: 'Devoted',
};

export const PRAYERS = {
    AVARICE: "Avarice",
    BUFF: "Buff",
    DAMAGE: "Damage",
    DEBUFF: "Debuff",
    DENIAL: "Denial",
    HEAL: "Heal",
};

export default class StatusEffect {
    public id: string;
    public name: string;
    public description: string;
    public playerName: string;
    public enemyName: string;
    public deity: string;
    public special: boolean;
    public debuffTarget: string;
    public duration: number;
    public tick: Tick;
    public intensity: Intensity;
    public refreshes: boolean;
    public activeRefreshes: number;
    public stacks: boolean;
    public activeStacks: number;
    public prayer: string;
    public effect: Effect;
    public imgUrl: string;
    public weapon: { name: string; id: string };
    public startTime: number;
    public endTime: number;

    constructor(combat: Combat, player: Ascean, enemy: Ascean, weapon: Equipment, attributes: CombatAttributes, prayer: string) {
        this.name = this.setName(weapon?.influences?.[0] as string);
        this.playerName = player.name;
        this.enemyName = enemy.name;
        this.deity = weapon?.influences?.[0] as string;
        this.weapon = { name: weapon.name, id: weapon._id as string};
        this.special = this.setSpecial(prayer);
        this.debuffTarget = this.setDebuffTarget(combat, player, prayer);
        this.duration = this.setDuration(player);
        this.tick = this.setTick(combat);
        this.intensity = this.setIntensity(weapon, weapon?.influences?.[0] as string, attributes, player);
        this.refreshes = this.setRefreshes(prayer);
        this.stacks = this.setStacks(prayer);
        this.activeStacks = 1;
        this.activeRefreshes = 0;
        this.prayer = prayer;
        this.effect = this.setEffect(combat, player, weapon, prayer);
        this.description = this.setDescription(combat, player, enemy, weapon, prayer);
        this.imgUrl = this.setImgURL(weapon);
        this.startTime = combat.combatTimer;
        this.endTime = this.startTime + (this.duration * EFFECT.DURATION_MODIFIER);
        this.id = this.setID();
    };
    [key: string]: any;

    setID = () => {
        return uuidv4();
    };
    setSpecial = (prayer: string) => {
        const specials = ['Avarice', 'Denial', 'Dispel', 'Silence'];
        return specials.includes(prayer) ? true : false;
    };
    static buff(potentialModifiers: any, realizedModifiers: any): any {
        realizedModifiers.physicalDefenseModifier = potentialModifiers.physicalDefenseModifier ? Math.round(potentialModifiers.physicalDefenseModifier * 100) / 100 : 0;
        realizedModifiers.magicalDefenseModifier = potentialModifiers.magicalDefenseModifier ? Math.round(potentialModifiers.magicalDefenseModifier * 100) / 100 : 0;
        realizedModifiers.physicalPosture = potentialModifiers.physicalPosture ? Math.round(potentialModifiers.physicalPosture * 100) / 100 : 0;
        realizedModifiers.magicalPosture = potentialModifiers.magicalPosture ? Math.round(potentialModifiers.magicalPosture * 100) / 100 : 0;
        realizedModifiers.roll = potentialModifiers.roll ? Math.round(potentialModifiers.roll * 100) / 100 : 0;
        realizedModifiers.dodge = potentialModifiers.dodge ? Math.round(potentialModifiers.dodge * 100) / 100 : 0;
        realizedModifiers.criticalChance = potentialModifiers.criticalChance ? Math.round(potentialModifiers.criticalChance * 100) / 100 : 0;
        realizedModifiers.criticalDamage = potentialModifiers.criticalDamage ? Math.round(potentialModifiers.criticalDamage * 100) / 100 : 0;
        realizedModifiers.physicalPenetration = potentialModifiers.physicalPenetration ? Math.round(potentialModifiers.physicalPenetration * 100) / 100 : 0;
        realizedModifiers.magicalPenetration = potentialModifiers.magicalPenetration ? Math.round(potentialModifiers.magicalPenetration * 100) / 100 : 0;
        realizedModifiers.physicalDamage = potentialModifiers.physicalDamage ? Math.round(potentialModifiers.physicalDamage * 100) / 100 : 0;
        realizedModifiers.magicalDamage = potentialModifiers.magicalDamage ? Math.round(potentialModifiers.magicalDamage * 100) / 100 : 0;
        let cleanSlate: { [key: string]: any } = {};
        for (let key in realizedModifiers) {
            if (realizedModifiers[key] !== 0) {
                cleanSlate[key] = realizedModifiers[key];
            };
        };
        return cleanSlate;
    };
    static damage(potentialModifiers: any, realizedModifiers: any): any {
        realizedModifiers.damage = potentialModifiers.damage;
        return realizedModifiers;
    };
    static debuff(potentialModifiers: any, realizedModifiers: any): any {
        realizedModifiers.physicalDefenseModifier = potentialModifiers.physicalDefenseModifier ? Math.round(potentialModifiers.physicalDefenseModifier * 100) / 100 : 0;
        realizedModifiers.magicalDefenseModifier = potentialModifiers.magicalDefenseModifier ? Math.round(potentialModifiers.magicalDefenseModifier * 100) / 100 : 0;
        realizedModifiers.physicalPosture = potentialModifiers.physicalPosture ? Math.round(potentialModifiers.physicalPosture * 100) / 100 : 0;
        realizedModifiers.magicalPosture = potentialModifiers.magicalPosture ? Math.round(potentialModifiers.magicalPosture * 100) / 100 : 0;
        realizedModifiers.roll = potentialModifiers.roll ? Math.round(potentialModifiers.roll * 100) / 100 : 0;
        realizedModifiers.dodge = potentialModifiers.dodge ? Math.round(potentialModifiers.dodge * 100) / 100 : 0;
        realizedModifiers.criticalChance = potentialModifiers.criticalChance ? Math.round(potentialModifiers.criticalChance * 100) / 100 : 0;
        realizedModifiers.criticalDamage = potentialModifiers.criticalDamage ? Math.round(potentialModifiers.criticalDamage * 100) / 100 : 0;
        realizedModifiers.physicalPenetration = potentialModifiers.physicalPenetration ? Math.round(potentialModifiers.physicalPenetration * 100) / 100 : 0;
        realizedModifiers.magicalPenetration = potentialModifiers.magicalPenetration ? Math.round(potentialModifiers.magicalPenetration * 100) / 100 : 0;
        realizedModifiers.physicalDamage = potentialModifiers.physicalDamage ? Math.round(potentialModifiers.physicalDamage * 100) / 100 : 0;
        realizedModifiers.magicalDamage = potentialModifiers.magicalDamage ? Math.round(potentialModifiers.magicalDamage * 100) / 100 : 0;
        let cleanSlate: { [key: string]: any } = {};
        for (let key in realizedModifiers) {
            if (realizedModifiers[key] !== 0) {
                cleanSlate[key] = realizedModifiers[key];
            };
        };
        return cleanSlate;
    };
    static heal(potentialModifiers: any, realizedModifiers: any): any {
        realizedModifiers.healing = potentialModifiers.healing;
        return realizedModifiers;
    };
    static setModifiers = (weapon: Equipment, potentialModifiers: any, effectModifiers: any): any => {
        switch(weapon?.influences?.[0]) {
            case "Daethos": {
                potentialModifiers.physicalDamage = effectModifiers.physicalDamage / EFFECT.FIVE;
                potentialModifiers.magicalDamage = effectModifiers.magicalDamage / EFFECT.FIVE;
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration / EFFECT.FIVE;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration / EFFECT.FIVE;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_TWENTY_FIVE;
                break;
            };
            case "Achreo": {
                potentialModifiers.physicalDamage = effectModifiers.healing / EFFECT.FIVE;
                potentialModifiers.magicalDamage = effectModifiers.healing / EFFECT.FIVE;
                potentialModifiers.criticalChance = effectModifiers.damage / EFFECT.FIVE;
                potentialModifiers.criticalDamage = effectModifiers.damage / EFFECT.HUNDRED;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_TWENTY_FIVE;
                break;
            };
            case "Ahn've": {
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage * EFFECT.ONE_FIFTEEN;
                potentialModifiers.dodge = effectModifiers.dodge * EFFECT.ONE_FIFTEEN;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Astra": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage / EFFECT.ONE_FIFTY;
                potentialModifiers.roll = effectModifiers.roll;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Cambire": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance;
                potentialModifiers.roll = effectModifiers.roll;
                potentialModifiers.magicalDamage = effectModifiers.magicalDamage;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Chiomyr": {
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;
                potentialModifiers.criticalChance = effectModifiers.criticalChance;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_FIFTY;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Fyer": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance / EFFECT.TWO;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage * EFFECT.TWO;
            
                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_TWENTY_FIVE;
                break;
            };
            case "Ilios": {
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration / EFFECT.ONE_FIFTY;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration / EFFECT.ONE_FIFTY;
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier / EFFECT.ONE_FIFTY;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier / EFFECT.ONE_FIFTY;
                potentialModifiers.physicalPosture = effectModifiers.physicalPosture / EFFECT.ONE_FIFTY;
                potentialModifiers.magicalPosture = effectModifiers.magicalPosture / EFFECT.ONE_FIFTY;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_TWENTY_FIVE;
                break;
            };
            case "Kyn'gi": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance * EFFECT.ONE_FIFTEEN;
                potentialModifiers.roll = effectModifiers.roll * EFFECT.ONE_FIFTEEN;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Kyrisos": {
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier;
                potentialModifiers.roll = effectModifiers.roll;
            
                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_FIFTY;
                break;
            };
            case "Kyr'na": {
                potentialModifiers.magicalDamage = effectModifiers.magicalDamage;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;
                
                potentialModifiers.damage = effectModifiers.damage * EFFECT.TWO_FIFTY;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_TWENTY_FIVE;
                break;
            };
            case "Lilos": {
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.physicalDamage = effectModifiers.physicalDamage;

                potentialModifiers.healing = effectModifiers.healing * EFFECT.TWO_FIFTY;
                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                break;
            };
            case "Ma'anre": {
                potentialModifiers.roll = effectModifiers.roll / EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.dodge = effectModifiers.dodge / EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.criticalChance = effectModifiers.criticalChance / EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage / EFFECT.ONE_TWENTY_FIVE;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Nyrolus": {
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier / EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier;
                potentialModifiers.physicalPosture = effectModifiers.physicalPosture / EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.magicalPosture = effectModifiers.magicalPosture;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_FIFTY;
                break;
            };
            case "Quor'ei": {
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier / EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.physicalPosture = effectModifiers.physicalPosture;
                potentialModifiers.magicalPosture = effectModifiers.magicalPosture / EFFECT.ONE_TWENTY_FIVE;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_FIFTY;
                break;
            };
            case "Rahvre": {
                potentialModifiers.magicalDamage = effectModifiers.magicalDamage;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage / EFFECT.ONE_FIFTY;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Senari": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance / EFFECT.TWO;
                potentialModifiers.roll = effectModifiers.roll;
                potentialModifiers.dodge = effectModifiers.dodge;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.ONE_TWENTY_FIVE;
                break;
            };
            case "Se'dyro": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance;
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Se'vas": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance * EFFECT.BASE;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage * EFFECT.BASE;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Shrygei": {
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration * EFFECT.BASE;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration * EFFECT.BASE;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Tshaer": {
                potentialModifiers.physicalDamage = effectModifiers.physicalDamage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.criticalChance = effectModifiers.criticalChance;

                potentialModifiers.damage = effectModifiers.damage * EFFECT.ONE_TWENTY_FIVE;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            default: {
                break;
            };
        };
        return potentialModifiers;
    };
    static updateEffectStack(statusEffect: StatusEffect, combat: Combat, player: Ascean, weapon: Equipment) {
        let updatedEffect = statusEffect;
        updatedEffect.tick.end += 2;
        updatedEffect.endTime += EFFECT.DURATION_MAX;
        updatedEffect.activeStacks += 1;
        let playerIntensity = updatedEffect.intensity.initial * updatedEffect.intensity.magnitude;
        let isEnemy = combat.computer;
        let playerFaith = combat?.player?.name === player.name ? combat.player.faith.toLowerCase() : isEnemy?.faith.toLowerCase();
        if ((weapon?.influences?.[0] === 'Daethos' && playerFaith === FAITHS.DEVOTED) || (weapon?.influences?.[0] !== 'Daethos' && playerFaith === FAITHS.ADHERENT)) {
            playerIntensity *= EFFECT.ONE_FIFTEEN;
        };
        updatedEffect.intensity.value += playerIntensity;
        let effectModifiers = {
            physicalDamage: playerIntensity,
            magicalDamage: playerIntensity,
            physicalPenetration: playerIntensity,
            magicalPenetration: playerIntensity,
            criticalChance: playerIntensity,
            criticalDamage: playerIntensity / EFFECT.TEN,
            physicalDefenseModifier: playerIntensity,
            magicalDefenseModifier: playerIntensity,
            physicalPosture: playerIntensity,
            magicalPosture: playerIntensity,
            dodge: playerIntensity,
            roll: playerIntensity,
            constitution: playerIntensity,
            strength: playerIntensity,
            agility: playerIntensity,
            achre: playerIntensity,
            caeren: playerIntensity,
            kyosir: playerIntensity,
            healing: playerIntensity * EFFECT.TEN,
            damage: playerIntensity * EFFECT.TEN,
            buff: playerIntensity,
            debuff: playerIntensity,
        };
        let potentialModifiers = {};
        let realizedModifiers: any = {};

        potentialModifiers = StatusEffect.setModifiers(weapon, potentialModifiers,  effectModifiers); 

        switch (updatedEffect.prayer) {
            case "Buff": {
                realizedModifiers = StatusEffect.buff(potentialModifiers, realizedModifiers);
                break;
            };
            case "Damage": {
                realizedModifiers = StatusEffect.damage(potentialModifiers, realizedModifiers);
                realizedModifiers.damage *= updatedEffect.activeStacks;
                break;
            };
            default:
                break;
        };

        updatedEffect.effect = realizedModifiers;
        return updatedEffect;
    };

    setActiveStacks(intensity: { initial: number; value: number; }): number {
        return this.activeStacks = intensity.value / intensity.initial; // Value is the cumulative stacking of the initial intensity. Initial is the base intensity.
    };
    setDebuffTarget(data: Combat, player: Ascean, prayer: string): string {
        if (prayer !== 'Debuff') return '';
        let enemyWeapon = data.computerWeapons[0].name;
        if (player.name === data?.player?.name) {
            return this.debuffTarget = enemyWeapon;
        } else {
            return this.debuffTarget = data?.weapons?.[0]?.name as string;
        };
    };
    setDuration(player: Ascean): number {
        let duration = Math.floor(player.level / EFFECT.DURATION_MODIFIER + 1) > EFFECT.DURATION_MAX ? EFFECT.DURATION_MAX : Math.floor(player.level / EFFECT.DURATION_MODIFIER + 1);
        return this.duration = duration;
    };
    setImgURL = (weapon: Equipment): string => {
        return this.imgUrl = weapon.imgUrl;
    };
    setIntensity(weapon: Equipment, deity: string, attributes: CombatAttributes, player: Ascean): { initial: number; value: number; magnitude: number; governance: string; } {
        let attribute = 0;
        let type = '';
        if (deity === 'Achreo' || deity === 'Astra' || deity === "Quor'ei" || deity === "Senari") {
            if (weapon.grip === 'One Hand' || weapon.type === 'Bow') {
                type = 'achre';
                attribute = (attributes.totalAchre + weapon.achre) * (player.mastery === type ? EFFECT.ONE_FIFTY : EFFECT.ONE_TWENTY_FIVE);
            } else {
                type = 'caeren';
                attribute = attributes.totalCaeren + weapon.caeren * (player.mastery === type ? EFFECT.ONE_TWENTY_FIVE : 1);
            };
        } else if (deity === "Ahn've" || deity === "Cambire" || deity === "Fyer" || deity === "Nyrolus") {
            if (weapon.grip === 'One Hand') {
                type = 'achre';
                attribute = attributes.totalAchre + weapon.achre * (player.mastery === type ? EFFECT.ONE_TWENTY_FIVE : 1);
            } else {
                type = 'caeren';
                attribute = (attributes.totalCaeren + weapon.caeren) * (player.mastery === type ? EFFECT.ONE_FIFTY : EFFECT.ONE_TWENTY_FIVE);
            };
        } else if (deity === "Kyn'gi" || deity === "Se'dyro" || deity === "Ma'anre") {
            if (weapon.grip === 'One Hand' || weapon.type === 'Bow') {
                type = 'agility';
                attribute = (attributes.totalAgility + weapon.agility) * (player.mastery === type ? EFFECT.ONE_FIFTY : EFFECT.ONE_TWENTY_FIVE);
            } else {
                type = 'strength';
                attribute = attributes.totalStrength + weapon.strength * (player.mastery === type ? EFFECT.ONE_TWENTY_FIVE : 1);
            };
        } else if (deity === "Ilios" || deity === "Se'vas" || deity === "Tshaer") {
            if (weapon.grip === 'One Hand') {
                type = 'agility';
                attribute = attributes.totalAgility + weapon.agility * (player.mastery === type ? EFFECT.ONE_TWENTY_FIVE : 1);
            } else {
                type = 'strength';
                attribute = (attributes.totalStrength + weapon.strength) * (player.mastery === type ? EFFECT.ONE_FIFTY : EFFECT.ONE_TWENTY_FIVE);
            };
        } else if (deity === "Chiomyr" || deity === "Kyrisos" || deity === "Shrygei") {
            type = 'kyosir';
            attribute = (attributes.totalKyosir + weapon.kyosir) * (player.mastery === type ? EFFECT.ONE_FIFTY : EFFECT.ONE_TWENTY_FIVE);
        } else if (deity === "Lilos" || deity === "Kyr'na" || deity === "Rahvre") {
            type = 'constitution';
            attribute = (attributes.totalConstitution) * (player.mastery === type ? EFFECT.TWO : EFFECT.ONE_FIFTY);
        } else if (deity === "Daethos") {
            if (weapon.grip === 'One Hand' || weapon.type === 'Bow') {
                type = 'daethic';
                attribute = (attributes.totalAchre + weapon.achre + attributes.totalAgility + weapon.agility) / (player.mastery === 'achre' || player.mastery === 'agility' ? 1 : EFFECT.ONE_FIFTY);
            } else {
                type = 'daethic';
                attribute = (attributes.totalStrength + weapon.strength + attributes.totalCaeren + weapon.caeren) / (player.mastery === 'caeren' || player.mastery === 'strength' ? 1 : EFFECT.ONE_FIFTY);
            };
        };
        attribute = Math.round(attribute * 100) / 100;
        return this.intensity = {
            initial: attribute,
            value: attribute,
            magnitude: player.level / EFFECT.FIFTY,
            governance: type,
        };
    };
    setName(deity: string): string {
        return this.name = `Gift of ${deity}`;
    };
    setTick(combatData: Combat): { start: number; end: number; } {
        return this.tick = {
            start: combatData.combatRound,
            end: combatData.combatRound + this.duration,
        };
    };
    setRefreshes(prayer: string): boolean {
        return this.refreshes = (prayer === 'Heal' || prayer === 'Debuff' || prayer === 'Avarice' || prayer === 'Denial' || prayer === 'Dispel' || prayer === 'Silence') ? true : false;
    };
    setStacks(prayer: string): boolean {
        return this.stacks = prayer === 'Buff' || prayer === 'Damage' ? true : false;
    };

    setEffect(combat: Combat, player: Ascean, weapon: Equipment, prayer: string) {
        if (this.setSpecial(prayer)) return;
        let playerIntensity = this.intensity.value * this.intensity.magnitude;
        let enemyFaith = combat.computer;
        let playerFaith = combat?.player?.name === player.name ? combat.player.faith.toLowerCase() : enemyFaith?.faith.toLowerCase();
        if (weapon?.influences?.[0] as string === 'Daethos' && playerFaith === FAITHS.DEVOTED) playerIntensity *= EFFECT.ONE_FIFTEEN;
        if (weapon?.influences?.[0] as string !== 'Daethos' && playerFaith === FAITHS.ADHERENT) playerIntensity *= EFFECT.ONE_FIFTEEN;
        let effectModifiers = {
            physicalDamage: playerIntensity,
            magicalDamage: playerIntensity,
            physicalPenetration: playerIntensity,
            magicalPenetration: playerIntensity,
            criticalChance: playerIntensity,
            criticalDamage: playerIntensity / EFFECT.TEN,
            physicalDefenseModifier: playerIntensity,
            magicalDefenseModifier: playerIntensity,
            physicalPosture: playerIntensity,
            magicalPosture: playerIntensity,
            dodge: playerIntensity,
            roll: playerIntensity,
            constitution: playerIntensity,
            strength: playerIntensity,
            agility: playerIntensity,
            achre: playerIntensity,
            caeren: playerIntensity,
            kyosir: playerIntensity,
            healing: playerIntensity * EFFECT.TEN,
            damage: playerIntensity * EFFECT.TEN,
            buff: playerIntensity,
            debuff: playerIntensity,
        };
        let potentialModifiers = {};
        let realizedModifiers = {};
        potentialModifiers = StatusEffect.setModifiers(weapon, potentialModifiers, effectModifiers);

        switch (prayer) {
            case "Buff": {
                return this.effect = StatusEffect.buff(potentialModifiers, realizedModifiers);
            };
            case "Damage": {
                return this.effect = StatusEffect.damage(potentialModifiers, realizedModifiers);
            };
            case "Debuff": {
                return this.effect = StatusEffect.debuff(potentialModifiers, realizedModifiers);
            };
            case "Heal": {
                return this.effect = StatusEffect.heal(potentialModifiers, realizedModifiers);
            };
        };
        return this.effect = realizedModifiers;
    }; 
    setDescription(combat: Combat, player: Ascean, enemy: Ascean, weapon: Equipment, prayer: string) {
        let duration = this.setDuration(player);
        let playerDescription = combat?.player?.name === player.name ? true : false;
        const article = ['a','e','i','o','u'].includes(weapon.name[0].toLowerCase()) ? "an" : "a";
        if (playerDescription) {
            if (this.setSpecial(prayer)) {
                return this.description = `You channel an old, lost prayer from ${weapon?.influences?.[0]} through their sigil, ${article} ${weapon.name}.`;
            };
            let description = `You channel a gift from ${weapon?.influences?.[0]} through their sigil, ${article} ${weapon.name}, ${prayer === 'Debuff' ? `cursing ${enemy.name}` : prayer === 'Heal' ? `renewing ${player.name} for ${Math.round(this.effect.healing as number * 0.33)} per round` : prayer === 'Damage' ? `damaging ${enemy.name} for ${Math.round(this.effect.damage as number * 0.33)} per tick` : `blessing ${player.name}`} for ${duration} combat rounds [Initial].`;
            return this.description = description;    
        } else {
            if (this.setSpecial(prayer)) {
                return this.description = `${player.name} channels an old, lost prayer from ${weapon?.influences?.[0]} through their sigil, ${article} ${weapon.name}.`;
            };
            let description = `${player.name} channels a gift from ${weapon?.influences?.[0]} through their sigil, ${article} ${weapon.name}, ${prayer === 'Debuff' ? `cursing ${enemy.name}` : prayer === 'Heal' ? `renewing ${player.name} for ${Math.round(this.effect.healing as number * 0.33)} per round` : prayer === 'Damage' ? `damaging ${enemy.name} for ${Math.round(this.effect.damage as number * 0.33)} per tick` : `blessing ${player.name}`} for ${duration} combat rounds [Initial].`;
            return this.description = description;
        };
    };
};