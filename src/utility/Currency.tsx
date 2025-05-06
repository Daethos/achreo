import { Accessor } from "solid-js";
import Ascean from "../models/ascean";

const Currency = ({ ascean }: {ascean: Accessor<Ascean>;}) => {
    return <div style={{ padding: '2%' }}>
        <img src={'../assets/images/gold-full.png'} alt="Gold Stack" /> <span class='gold'>{ascean().currency.gold}</span> <img src={'../assets/images/silver-full.png'} alt="Silver Stack" /> {ascean().currency.silver}
    </div>;
};

export default Currency;