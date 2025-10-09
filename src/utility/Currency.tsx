import { Accessor } from "solid-js";
import Ascean from "../models/ascean";

export function fixGold(gold: number) {
    if (gold >= 1000) {
        return `${gold/1000}k`;
    };
    return gold;
};

const Currency = ({ ascean }: {ascean: Accessor<Ascean>;}) => {
    return <div>
        <img src={'../assets/images/gold-full.png'} alt="Gold Stack" /> <span class='gold'>{fixGold(ascean().currency.gold)}</span> <img src={'../assets/images/silver-full.png'} alt="Silver Stack" /> {ascean().currency.silver}
    </div>;
};

export default Currency;