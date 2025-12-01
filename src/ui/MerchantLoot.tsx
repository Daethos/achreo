import { Accessor, Setter, Show, createEffect, createSignal } from "solid-js"
import Equipment from "../models/equipment";
import Ascean from "../models/ascean";
import { font, getRarityColor, sellRarity } from "../utility/styling";
import { EventBus } from "../game/EventBus";
import { Currency } from "./Dialog";
interface SellProps {
    item: Equipment;
    sellIitem(item: Equipment): void;
    setItem(item: Equipment): void; 
    checkMassSell(item: Equipment): void;
    getCheckmark(id: string): boolean;
};
export function MassSell({item, sellIitem, setItem, checkMassSell, getCheckmark}: SellProps){
    return <div style={{ display: "grid", margin: "5%", border: "thick ridge #fdf6d8", padding: "5%", height: "90%", "max-height": "auto", "grid-template-rows": "0.5fr 1fr 0.5fr 0.5fr 0.5fr" }}>
        <h6 style={{ margin: "0 auto 5%" }}>{item?.name}</h6>
        <div class="center" onClick={() => setItem(item)} style={{ border: `thick ridge ${getRarityColor(item?.rarity as string)}`, "margin": "5.5% auto 0", padding: "0.25em", width: "60%" }}>
            <img src={item?.imgUrl} alt={item?.name} style={{ margin: "5% auto -5%" }} />
        </div>
        <button class="highlight" onClick={() => sellIitem(item)} style={{ color: item?.rarity as string === "Common" ? "silver" : "gold", "grid-row": 4 }}>{sellRarity(item?.rarity as string)}</button>
        <button class="highlight" onClick={() => checkMassSell(item)} style={{ color: getCheckmark(item._id) ? "gold" : "red", "grid-row": 5 }}>{getCheckmark(item._id) ? "✓" : "▢"}</button>
    </div>;
};

export function QuickSell({item, sellIitem, setItem, checkMassSell, getCheckmark}: SellProps) {
    return <div class="row menu-item-3d center" style={{ width: "100%", height: "25%" }}>
        <div onClick={() => setItem(item)} style={{ margin: "0 5%", padding: "0.5em",width: "12.5%", height: "50%", border: `thick ridge ${getRarityColor(item?.rarity as string)}` }}>
            <img src={item?.imgUrl} alt={item?.name} />
        </div>
        <p style={{ margin: "auto", width: "25%" }}>{item.name}</p>
        <span style={{width:"50%"}}>
        <button class="highlight" onClick={() => sellIitem(item)} style={{ color: item?.rarity as string === "Common" ? "silver" : "gold" }}>{sellRarity(item?.rarity as string)}</button>
        <button class="highlight" onClick={() => checkMassSell(item)} style={{ color: getCheckmark(item._id) ? "gold" : "red" }}>{getCheckmark(item._id) ? "✓" : "▢"}</button>
        </span>
    </div>;
};

interface MerchantLootProps {
    item: Equipment;
    ascean: Accessor<Ascean>;
    setShow: Setter<boolean>;
    setHighlight: Setter<Equipment | undefined> | any;
    thievery: Accessor<boolean>;
    steal(item: Equipment): void;
    cost: Currency;
    checkMassBuy(item: Equipment): void;
    getBuyMark(id: string): boolean;
    mass: boolean;
};

export default function MerchantLoot({ item, ascean, setShow, setHighlight, thievery, steal, cost, checkMassBuy, getBuyMark, mass }: MerchantLootProps) {
    const [thieveryModal, setThieveryModal] = createSignal<boolean>(false);
    const [rows, setRows] = createSignal<number>(5);
    const [template, setTemplate] = createSignal<string>("0.5fr 1fr 0.5fr 0.5fr");
    createEffect(() => {
        let rowNum = 4, temp = "";
        mass ? rowNum++ : rowNum;
        thievery() ? rowNum++ : rowNum;
        setRows(rowNum);
        for (let i = 0; i < rows(); i++) {
            if (i === 0) {
                temp += "0.5fr"
            } else if (i === 1) {
                temp += " 1fr";
            } else {
                temp += " 0.5fr";
            };
        };
        setTemplate(temp);
    });
    const purchaseLoot = (): void => {
        try {
            let asceanTotal = 0;
            let costTotal = 0;
            asceanTotal = ascean().currency.silver + (ascean().currency.gold * 100);
            costTotal = cost.silver + (cost.gold * 100);
            if (asceanTotal < costTotal) {
                EventBus.emit("alert", { header: "Insufficient Funds", body: `You do not have enough money. You require ${costTotal - asceanTotal} more silver to purchase the ${item.name}.` });
                return;
            };
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
        border: `thick ridge ${getRarityColor(item?.rarity as string)}`, 
        margin: "5.5% auto 0",
        padding: "0.25em", 
        width: "60%",
        "height": "fit-content"
    };
    return <div style={{ display: "grid", margin: "5%", border: "thick ridge #fdf6d8", padding: "5%", height: "90%", "max-height": "auto", "grid-template-rows": template() }}>
        <h6 style={{ margin: "0 auto 5%" }}>{item?.name}</h6>
        <div class="center" onClick={select} style={getItemStyle}>
            <img src={item?.imgUrl} alt={item?.name} style={{ margin: "5% auto -5%" }} />
        </div>
        <button class="highlight" onClick={purchaseLoot} style={{ color: "silver", "font-size": mass ? "" : "0.75em", "grid-row": rows() - ((thievery() && mass) ? 2 : (thievery() || mass) ? 1 : 0) }}>
            <span style={{color:"gold"}}>{cost?.gold > 0 && `${cost.gold}g`}</span> {cost?.silver > 0 && `${cost.silver}s${" "}`}
        </button>
        <Show when={thievery()}>
            <button class="highlight" onClick={() => setThieveryModal(true)} style={{ "font-size": "0.75em", "font-weight": 700, "color": "red", padding: "0.5em", width: "auto", "grid-row": rows() - (mass ? 1 : 0) }}>Steal</button>
        </Show>
        <Show when={mass}>
            <button class="highlight" onClick={() => checkMassBuy(item)} style={{ color: getBuyMark(item._id) ? "gold" : "red", "grid-row": rows() }}>{getBuyMark(item._id) ? "✓" : "▢"}</button>
        </Show>
        <Show when={thieveryModal()}> 
            <div class="modal">
            <div class="button superCenter" style={{ "background-color": "black", width: "75%" }}>
                <div class="center" style={font("1.5em")}>Do You Really Wish To Steal this Poor Merchant's  <span style={{ color: "gold" }}>{item?.name}?</span> <br /><br /><div>
                    <img style={{ transform: "scale(1.25)" }} src={item?.imgUrl} alt={item?.name} onClick={sneed} />
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