import { Accessor, Setter, Show, createSignal } from "solid-js"
import Equipment from "../models/equipment";
import Ascean from "../models/ascean";
import { font, getRarityColor } from "../utility/styling";
import { EventBus } from "../game/EventBus";
import { Currency } from "./Dialog";
interface Props {
    item: Equipment;
    ascean: Accessor<Ascean>;
    setShow: Setter<boolean>;
    setHighlight: Setter<Equipment | undefined> | any;
    thievery: Accessor<boolean>;
    steal(item: Equipment): void;
    cost: Currency;
};
export default function MerchantLoot({ item, ascean, setShow, setHighlight, thievery, steal, cost }: Props) {
    const [thieveryModal, setThieveryModal] = createSignal<boolean>(false);
    const purchaseLoot = (): void => {
        let asceanTotal = 0;
        let costTotal = 0;
        asceanTotal = ascean().currency.silver + (ascean().currency.gold * 100);
        costTotal = cost.silver + (cost.gold * 100);
        if (asceanTotal < costTotal) {
            EventBus.emit("alert", { header: "Insufficient Funds", body: `You do not have enough money. You require ${costTotal - asceanTotal} more silver to purchase the ${item.name}.` });
            return;
        };
        try {
            EventBus.emit("alert", { header: `Purchasing ${item?.name}`, body: `You have purchased the ${item?.name} for ${cost.gold}g, ${cost.silver}s.`});
            EventBus.emit("purchase-item", {item,cost});
        } catch (err) {
            console.warn(err, "Error Purchasing Item!");
        };
    };
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
        <div style={{ color:"", "font-size": "0.75em", "margin-top": "4%", "margin-bottom": "0" }}>
            <span style={{color:"gold"}}>{cost?.gold > 0 && `${cost.gold}g${" "}`}</span>
            {cost?.silver > 0 && `${cost.silver}s${" "}`}
        </div>
        <button class="highlight super" onClick={purchaseLoot} style={{ "font-size": "0.675em", "font-weight": 700, color: "green", padding: "0.5em", "z-index": 999 }}>
            Purchase {item?.name}
        </button>
        <Show when={thievery()}>
            <button class="highlight super" onClick={() => setThieveryModal(true)} style={{ "font-size": "0.675em", "color": "red", padding: "0.5em" }}>Steal {item?.name}</button>
        </Show>
        <Show when={thieveryModal()}> 
            <div class="modal">
            <div class="button superCenter" style={{ "background-color": "black", width: "75%" }}>
                <div class="">
                <div class="center" style={font("1.5em")}>Do You Really Wish To Steal this Poor Merchant's  <span style={{ color: "gold" }}>{item?.name}?</span> <br /><br /><div>
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