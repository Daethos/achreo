import Ascean from "./ascean";

export class Party<T> {
    public _id: string;
    public party: T[] | any[];
    public constructor(id: string) {
        this._id = id;
        this.party = [];
    };
};

export const initParty: Party<Ascean> = new Party("party");