import { Setter } from "solid-js"
import Equipment from "../models/equipment";
import { getRarityColor } from "../utility/styling";
interface Props {
    item: Equipment;
    setShow: Setter<boolean>;
    setHighlight: Setter<Equipment | undefined> | any;
    steal(item: Equipment): void;
};
export default function PickpocketLoot({ item, setShow, setHighlight, steal }: Props) {
    function sneed() {
        steal(item);
    };
    const select = () => {
        setHighlight(item);
        setShow(true)
    };
    const getItemStyle = {
        background: "black",
        border: `0.15em solid ${getRarityColor(item?.rarity as string)}`
    };
    return <div style={{ margin: "3%" }}>
        <button onClick={select} class="my-3 mx-2 p-2" style={getItemStyle}><img src={item?.imgUrl} alt={item?.name} /></button>
        <button class="highlight super" onClick={sneed} style={{ "color": "red", padding: "0.75em" }}>Steal {item?.name}</button>
    </div>;
};