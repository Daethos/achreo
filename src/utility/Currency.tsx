import { Accessor } from "solid-js";
import Ascean from "../models/ascean";

// function fixGold(gold: number) {
//     if (gold >= 1000) {
//         return `${gold/1000}k`;
//     };
//     return gold;
// };

const Currency = ({ ascean }: {ascean: Accessor<Ascean>;}) => {
    return <div style={{ padding: '2%' }}>
        <img src={'../assets/images/gold-full.png'} alt="Gold Stack" /> <span class='gold'>{ascean().currency.gold}</span> <img src={'../assets/images/silver-full.png'} alt="Silver Stack" /> {ascean().currency.silver}
    </div>;
};

export default Currency;