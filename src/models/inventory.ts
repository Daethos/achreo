import Equipment from "./equipment";

export class Inventory {
    public _id: string;
    public inventory: Equipment[] | [];
    public constructor(id: string) {
        this._id = id;
        this.inventory = [];
    };
};

export const initInventory: Inventory = new Inventory("inventory");