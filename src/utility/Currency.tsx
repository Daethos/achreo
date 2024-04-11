import { Accessor } from "solid-js";
import Ascean from "../models/ascean";

interface CurrencyProps {
    ascean: Accessor<Ascean>;
};
const Currency = ({ ascean }: CurrencyProps) => {
    return (
        <div>
            <img src={'../assets/images/gold-full.png'} alt="Gold Stack" /> {ascean().currency.gold} <img src={'../assets/images/silver-full.png'} alt="Silver Stack" /> {ascean().currency.silver}
            <br /><br />
        </div>
    );
};

export default Currency;