import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Combat } from "../stores/combat";
import { CombatAttributes } from "./combat";

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
    LOW: 1.15,
    MEDIUM: 1.25,
    HIGH: 1.5,
    CRITICAL: 2,
    FANTASTIC: 2.5,
    TIPPITY: 10,
    BIPPITY: 15,
    TOP: 100,
    DURATION_MODIFIER: 3,
    DURATION_MAX: 6
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
        console.log(prayer, 'prayer');
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
        this.effect = this.setEffect(combat, player, weapon, attributes, prayer);
        this.description = this.setDescription(combat, player, enemy, weapon, attributes, prayer);
        this.imgUrl = this.setImgURL(weapon);
        this.startTime = combat.combatTimer;
        this.endTime = this.startTime + (this.duration * EFFECT.DURATION_MODIFIER);
        this.id = this.setID();
    };
    [key: string]: any;

    setID = () => {
        let id = this.name + '_' + this.startTime + '_' + this.endTime;
        return id;
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
    // static getDeity = () => {
    //     return this.deity;
    // };
    static setModifiers = (weapon: Equipment, potentialModifiers: any, playerDamage: number, effectModifiers: any): any => {
        switch(weapon?.influences?.[0]) {
            case "Daethos": {
                potentialModifiers.physicalDamage = playerDamage / EFFECT.TIPPITY;
                potentialModifiers.magicalDamage = playerDamage / EFFECT.TIPPITY;
                potentialModifiers.physicalPenetration = playerDamage / EFFECT.TIPPITY;
                potentialModifiers.magicalPenetration = playerDamage / EFFECT.TIPPITY;

                potentialModifiers.damage = playerDamage;
                potentialModifiers.healing = playerDamage;
                break;
            };
            case "Achreo": {
                potentialModifiers.physicalDamage = playerDamage / EFFECT.TIPPITY;
                potentialModifiers.magicalDamage = playerDamage / EFFECT.TIPPITY;
                potentialModifiers.criticalChance = playerDamage / EFFECT.TIPPITY;
                potentialModifiers.criticalDamage = playerDamage / EFFECT.TOP;

                potentialModifiers.damage = playerDamage;
                potentialModifiers.healing = playerDamage * EFFECT.MEDIUM;
                break;
            };
            case "Ahn've": {
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage * EFFECT.LOW;
                potentialModifiers.dodge = effectModifiers.dodge * EFFECT.LOW;

                potentialModifiers.damage = playerDamage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Astra": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage / EFFECT.HIGH;
                potentialModifiers.roll = effectModifiers.roll;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Cambire": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance;
                potentialModifiers.roll = effectModifiers.roll;
                potentialModifiers.magicalDamage = effectModifiers.magicalDamage;

                potentialModifiers.damage = playerDamage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Chiomyr": {
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;
                potentialModifiers.criticalChance = effectModifiers.criticalChance;

                potentialModifiers.damage = playerDamage * EFFECT.HIGH;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Fyer": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance / EFFECT.CRITICAL;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage * EFFECT.BASE;
            
                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Ilios": {
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration / EFFECT.HIGH;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration / EFFECT.HIGH;
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier / EFFECT.HIGH;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier / EFFECT.HIGH;
                potentialModifiers.physicalPosture = effectModifiers.physicalPosture / EFFECT.HIGH;
                potentialModifiers.magicalPosture = effectModifiers.magicalPosture / EFFECT.HIGH;

                potentialModifiers.damage = playerDamage;
                potentialModifiers.healing = playerDamage * EFFECT.MEDIUM;
                break;
            };
            case "Kyn'gi": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance * EFFECT.LOW;
                potentialModifiers.roll = effectModifiers.roll * EFFECT.LOW;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Kyrisos": {
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier;
                potentialModifiers.roll = effectModifiers.roll;
            
                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = playerDamage * EFFECT.HIGH;
                break;
            };
            case "Kyr'na": {
                potentialModifiers.magicalDamage = effectModifiers.magicalDamage;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;
                
                potentialModifiers.damage = effectModifiers.damage * EFFECT.FANTASTIC;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.MEDIUM;
                break;
            };
            case "Lilos": {
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.physicalDamage = effectModifiers.physicalDamage;

                potentialModifiers.healing = effectModifiers.healing * EFFECT.FANTASTIC;
                potentialModifiers.damage = effectModifiers.damage * EFFECT.MEDIUM;
                break;
            };
            case "Ma'anre": {
                potentialModifiers.roll = effectModifiers.roll / EFFECT.MEDIUM;
                potentialModifiers.dodge = effectModifiers.dodge / EFFECT.MEDIUM;
                potentialModifiers.criticalChance = effectModifiers.criticalChance / EFFECT.MEDIUM;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage / EFFECT.MEDIUM;

                potentialModifiers.damage = playerDamage * EFFECT.MEDIUM;
                potentialModifiers.healing = playerDamage;
                break;
            };
            case "Nyrolus": {
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier / EFFECT.MEDIUM;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier;
                potentialModifiers.physicalPosture = effectModifiers.physicalPosture / EFFECT.MEDIUM;
                potentialModifiers.magicalPosture = effectModifiers.magicalPosture;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.HIGH;
                break;
            };
            case "Quor'ei": {
                potentialModifiers.physicalDefenseModifier = effectModifiers.physicalDefenseModifier;
                potentialModifiers.magicalDefenseModifier = effectModifiers.magicalDefenseModifier / EFFECT.MEDIUM;
                potentialModifiers.physicalPosture = effectModifiers.physicalPosture;
                potentialModifiers.magicalPosture = effectModifiers.magicalPosture / EFFECT.MEDIUM;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing * EFFECT.HIGH;
                break;
            };
            case "Rahvre": {
                potentialModifiers.magicalDamage = effectModifiers.magicalDamage;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;
                potentialModifiers.criticalDamage = effectModifiers.criticalDamage / EFFECT.HIGH;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Senari": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance / EFFECT.CRITICAL;
                potentialModifiers.roll = effectModifiers.roll;
                potentialModifiers.dodge = effectModifiers.dodge;

                potentialModifiers.damage = effectModifiers.damage;
                potentialModifiers.healing = effectModifiers.healing;
                break;
            };
            case "Se'dyro": {
                potentialModifiers.criticalChance = effectModifiers.criticalChance;
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.magicalPenetration = effectModifiers.magicalPenetration;

                potentialModifiers.damage = playerDamage;
                potentialModifiers.healing = playerDamage;
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
                potentialModifiers.physicalDamage = effectModifiers.physicalDamage;
                potentialModifiers.physicalPenetration = effectModifiers.physicalPenetration;
                potentialModifiers.criticalChance = effectModifiers.criticalChance;

                potentialModifiers.damage = effectModifiers.damage;
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
        let playerFaith = combat?.player?.name === player.name ? combat.player.faith : isEnemy?.faith;
        if ((weapon?.influences?.[0] === 'Daethos' && playerFaith === 'devoted') || (weapon?.influences?.[0] !== 'Daethos' && playerFaith === 'adherent')) {
            playerIntensity *= EFFECT.LOW;
        };
        updatedEffect.intensity.value += playerIntensity;
        let effectModifiers = {
            physicalDamage: playerIntensity,
            magicalDamage: playerIntensity,
            physicalPenetration: playerIntensity,
            magicalPenetration: playerIntensity,
            criticalChance: playerIntensity,
            criticalDamage: playerIntensity / EFFECT.TIPPITY,
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
            healing: playerIntensity * EFFECT.BIPPITY,
            damage: playerIntensity * EFFECT.BIPPITY,
            buff: playerIntensity,
            debuff: playerIntensity,
        };
        let potentialModifiers = {};
        let realizedModifiers: any = {};
        let enemyDamage = combat.realizedComputerDamage;
        let playerDamage = combat?.player?.name === player.name ? combat.realizedPlayerDamage : enemyDamage;

        playerDamage = effectModifiers.damage; 
        potentialModifiers = StatusEffect.setModifiers(weapon, potentialModifiers, playerDamage, effectModifiers); 

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
                type = 'Achre';
                attribute = (attributes.totalAchre + weapon.achre) * (player.mastery === type ? 1.5 : 1.25);
            } else {
                type = 'Caeren';
                attribute = attributes.totalCaeren + weapon.caeren * (player.mastery === type ? 1.25 : 1);
            };
        } else if (deity === "Ahn've" || deity === "Cambire" || deity === "Fyer" || deity === "Nyrolus") {
            if (weapon.grip === 'One Hand') {
                type = 'Achre';
                attribute = attributes.totalAchre + weapon.achre * (player.mastery === type ? 1.25 : 1);
            } else {
                type = 'Caeren';
                attribute = (attributes.totalCaeren + weapon.caeren) * (player.mastery === type ? 1.5 : 1.25);
            };
        } else if (deity === "Kyn'gi" || deity === "Se'dyro" || deity === "Ma'anre") {
            if (weapon.grip === 'One Hand' || weapon.type === 'Bow') {
                type = 'Agility';
                attribute = (attributes.totalAgility + weapon.agility) * (player.mastery === type ? 1.5 : 1.25);
            } else {
                type = 'Strength';
                attribute = attributes.totalStrength + weapon.strength * (player.mastery === type ? 1.25 : 1);
            };
        } else if (deity === "Ilios" || deity === "Se'vas" || deity === "Tshaer") {
            if (weapon.grip === 'One Hand') {
                type = 'Agility';
                attribute = attributes.totalAgility + weapon.agility * (player.mastery === type ? 1.25 : 1);
            } else {
                type = 'Strength';
                attribute = (attributes.totalStrength + weapon.strength) * (player.mastery === type ? 1.5 : 1.25);
            };
        } else if (deity === "Chiomyr" || deity === "Kyrisos" || deity === "Shrygei") {
            type = 'Kyosir';
            attribute = (attributes.totalKyosir + weapon.kyosir) * (player.mastery === type ? 1.5 : 1.25);
        } else if (deity === "Lilos" || deity === "Kyr'na" || deity === "Rahvre") {
            type = 'Constitution';
            attribute = (attributes.totalConstitution) * (player.mastery === type ? 2 : 1.5);
        } else if (deity === "Daethos") {
            if (weapon.grip === 'One Hand' || weapon.type === 'Bow') {
                type = 'daethic';
                attribute = (attributes.totalAchre + weapon.achre + attributes.totalAgility + weapon.agility) / (player.mastery === 'Achre' || player.mastery === 'Agility' ? 1 : 1.5);
            } else {
                type = 'daethic';
                attribute = (attributes.totalStrength + weapon.strength + attributes.totalCaeren + weapon.caeren) / (player.mastery === 'Caeren' || player.mastery === 'Strength' ? 1 : 1.5);
            };
        };
        attribute = Math.round(attribute * 100) / 100;
        return this.intensity = {
            initial: attribute,
            value: attribute,
            magnitude: player.level / 120,
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

    setEffect(combat: Combat, player: Ascean, weapon: Equipment, attributes: CombatAttributes, prayer: string) {
        if (this.setSpecial(prayer)) return;
        let intensity = { value: 0, magnitude: 0 };
        intensity = this.setIntensity(weapon, weapon?.influences?.[0] as string, attributes, player)
        let playerIntensity = intensity.value * intensity.magnitude;

        let enemyFaith = combat.computer;
        let playerFaith = combat?.player?.name === player.name ? combat.player.faith : enemyFaith?.faith;
        if (weapon?.influences?.[0] as string === 'Daethos' && playerFaith === 'devoted') {
            playerIntensity *= EFFECT.LOW;
        };
        if (weapon?.influences?.[0] as string !== 'Daethos' && playerFaith === 'adherent') {
            playerIntensity *= EFFECT.LOW;
        };
        let effectModifiers = {
            physicalDamage: playerIntensity,
            magicalDamage: playerIntensity,
            physicalPenetration: playerIntensity,
            magicalPenetration: playerIntensity,
            criticalChance: playerIntensity,
            criticalDamage: playerIntensity / 10,
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
            healing: playerIntensity * 15,
            damage: playerIntensity * 15,
            buff: playerIntensity,
            debuff: playerIntensity,
        };
        let potentialModifiers = {};
        let realizedModifiers = {};

        let enemyDamage: number = combat.realizedComputerDamage;
        let playerDamage: number = combat?.player?.name === player.name ? combat.realizedPlayerDamage : enemyDamage;
        playerDamage = effectModifiers.damage; 
        potentialModifiers = StatusEffect.setModifiers(weapon, potentialModifiers, playerDamage, effectModifiers);

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
    setDescription(combat: Combat, player: Ascean, enemy: Ascean, weapon: Equipment, attributes: CombatAttributes, prayer: string) {
        let duration = this.setDuration(player);
        let effect = this.setEffect(combat, player, weapon, attributes, prayer);
        const article = ['a','e','i','o','u'].includes(weapon.name[0].toLowerCase()) ? "an" : "a";
        if (this.setSpecial(prayer)) {
            return this.description = `${weapon?.influences?.[0]} has channeled an old, lost prayer through their sigil, ${article} ${weapon.name}.`
        };
        let description = `${weapon?.influences?.[0]} has channeled a gift through their sigil, ${article} ${weapon.name}, ${prayer === 'Debuff' ? `cursing ${enemy.name}` : prayer === 'Heal' ? `renewing ${player.name} for ${Math.round(effect.healing * 0.33)} per round` : prayer === 'Damage' ? `damaging ${enemy.name} for ${Math.round(effect.damage * 0.33)} per tick` : `blessing ${player.name}`} for ${duration} combat rounds [Initial].`;
        return this.description = description;
    };

};