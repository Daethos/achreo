export class SpecialInventory {
    public _id: string;
    public inventory: any[] | [];
    public constructor(id: string) {
        this._id = id;
        this.inventory = [];
    };
};

export const initSpecialInventory: SpecialInventory = new SpecialInventory("specialInventory");