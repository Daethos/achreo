import { v4 as uuidv4 } from "uuid";
import { ITEMS } from "../assets/db/items";
import { addItem } from "../assets/db/db";

export type BaseEffect = {
    trigger: "Buff" | "Debuff" | "Periodic" | "Instant",
};

export type BuffEffect = BaseEffect & {
    statKey: string; // player attributes
    value: number;
    duration: number; // in seconds
};

export type DebuffEffect = BaseEffect & {
    statKey: string;
    value: number;
    duration: number;
};

export type PeriodicEffect = BaseEffect & {
    resourceKey: "health" | "stamina" | "grace" | string;
    value: number;
    interval: number; // in seconds
    duration: number; // in seconds
    isPercent: boolean;
};

export type InstantEffect = BaseEffect & {
    resourceKey: "health" | "stamina" | "grace" | "experience" | string;
    value: number;
    isPercent: boolean;
};

export type Effects = BuffEffect | DebuffEffect | PeriodicEffect | InstantEffect;

ITEMS.forEach(deepFreeze);

export function deepFreeze<T>(obj: T): T {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
        const value = (obj as any)[prop];
        if (value && typeof value === "object" && !Object.isFrozen(value)) {
            deepFreeze(value);
        };
    });
    return obj;
};

export async function getSpecificItem(name: string, id: string): Promise<Item> {
    const item = ITEMS.find(i => i.name === name) as Item;
    const newItem = new Item(item);
    await addItem(newItem, id);
    return newItem;
};

export class Item {
    public _id: string; // Unique identifier
    public name: string; // Name of the item
    public description: string; // Flavor text of the item
    public type: string; // "Tool", "Consumable", "Quest Item", "Material", "Key Item" | Relays the purpose of said item
    public imgUrl: string; // Image URL to represent the item
    public quantity: number; // Number of items in the stack

    public effects: Effects[]; // Type of effect it may grant, whether from Consumable or perhaps Constant EFfect ala Morrowind ??

    public isConsumable: boolean; // Can be consumed and "used up" for an effect
    public isQuestItem: boolean; // Tied to a quest
    public isSellable: boolean; // Can it be sold to vendors
    public isUnique: boolean; // Unique items cannot be purchased beyond (1)

    public value: number; // Value of the item in currency
    public weight: number; // Weight per (1) item. Burdens player. Is not currently a utilized variable in-game.
    public rarity: string; // Common, Uncommon, Rare, Epic, Legendary

    public maxStack?: number; // Max stack per item slot. Is not currently a utilized variable in-game.
    public systemTrigger?: string; // Special prompt to utilize in-game

    constructor(item: Item) {
        this._id = uuidv4();
        this.name = item.name;
        this.description = item.description;
        this.type = item.type;
        this.imgUrl = item.imgUrl;
        this.quantity = item.quantity;

        this.effects = item.effects;

        this.isConsumable = item.isConsumable;
        this.isQuestItem = item.isQuestItem;
        this.isSellable = item.isSellable;
        this.isUnique = item.isUnique;

        this.value = item.value;
        this.weight = item.weight;
        this.rarity = item.rarity;

        this.maxStack = item.maxStack;
        this.systemTrigger = item.systemTrigger;
    };
    [key: string]: any;
};