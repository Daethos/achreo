import { Accessor, Setter, Show, createSignal } from "solid-js"
import Equipment from "../models/equipment";
import { font, getRarityColor } from "../utility/styling";
interface Props {
    item: Equipment;
    setShow: Setter<boolean>;
    setHighlight: Setter<Equipment | undefined> | any;
    thievery: Accessor<boolean>;
    steal(item: Equipment): void;
};
export default function PickpocketLoot({ item, setShow, setHighlight, thievery, steal }: Props) {
    const [thieveryModal, setThieveryModal] = createSignal<boolean>(false);
    function sneed() {
        steal(item);
        setThieveryModal(false);
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
        <Show when={thievery()}>
            <button class="highlight super" onClick={() => setThieveryModal(true)} style={{ "color": "red", padding: "0.75em" }}>Steal {item?.name}</button>
        </Show>
        <Show when={thieveryModal()}> 
            <div class="modal">
            <div class="button superCenter" style={{ "background-color": "black", width: "25%" }}>
                <div class="">
                <div class="center" style={font("1.5em")}>Do You Really Wish To Steal  <span style={{ color: "gold" }}>{item?.name}?</span> <br /><br /><div>
                    <img style={{ transform: "scale(1.25)" }} src={item?.imgUrl} alt={item?.name} onClick={sneed} />
                </div>
                </div>
                </div>
                <br /><br /><br />
                <button class="highlight cornerBR" style={{ transform: "scale(0.85)", bottom: "0", right: "0", "background-color": "red" }} onClick={() => setThieveryModal(false)}>
                    <p style={font("0.5em")}>X</p>
                </button>
            </div>
            </div> 
            </Show>
    </div>;
};