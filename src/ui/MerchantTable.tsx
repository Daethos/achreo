import { Accessor, For, Show, createSignal } from "solid-js";
import MerchantLoot from "./MerchantLoot";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import ItemModal from "../components/ItemModal";
import { Purchase } from "./Dialog";
interface Props {
    table: Accessor<Equipment[]>;
    ascean: Accessor<Ascean>;
    steal: any;
    thievery: Accessor<boolean>;
    purchaseSetting: Accessor<Purchase[]>;
};
export default function MerchantTable({ table, ascean, steal, thievery, purchaseSetting }: Props) {
    const [show, setShow] = createSignal<boolean>(false);
    const [highlight, setHighlight] = createSignal<Equipment | undefined>(undefined);
    return (
        <div style={{ display: "grid", width: "100%", "grid-template-columns": "repeat(4, 1fr)" }}>
        <For each={table()}>
            {(item: any, _index: Accessor<number>) => (
                <MerchantLoot item={item} ascean={ascean} setShow={setShow} setHighlight={setHighlight} thievery={thievery} steal={steal} purchaseSetting={purchaseSetting().find((purchase: any) => purchase.item._id === item._id) as Purchase} />
            )}
        </For>
        <Show when={show()}>
            <div class="modal" onClick={() => setShow(false)}>
                <ItemModal item={highlight()} caerenic={false} stalwart={false} /> 
            </div>
        </Show>
        </div>
    );
};