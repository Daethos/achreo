import { Accessor, Setter, createEffect, createSignal } from 'solid-js'
import Equipment from '../models/equipment';
import Ascean from '../models/ascean';
import { getRarityColor } from '../utility/styling';
import { EventBus } from '../game/EventBus';

interface Props {
    item: Equipment;
    ascean: Accessor<Ascean>;
    setShow: Setter<boolean>;
    setHighlight: Setter<Equipment | undefined>;
};

const MerchantLoot = ({ item, ascean, setShow, setHighlight }: Props) => {
    const [purchaseSetting, setPurchaseSetting] = createSignal({
        item: item,
        cost: { silver: 0, gold: 0 }
    });
    
    createEffect(() => {
        determineCost(item?.rarity as string, item?.type);
    });

    const determineCost = async (rarity: string, type: string) => {
        try {
            let cost = { silver: 0, gold: 0 };
            switch (rarity) {
                case 'Common': {
                    cost = {
                        silver: Math.floor(Math.random() * 15) + 10,
                        gold: 0
                    };
                    break;
                };
                case 'Uncommon': {
                    cost = {
                        silver: Math.floor(Math.random() * 30) + 30, // 30
                        gold: Math.floor(Math.random() * 2) + 1 // 1
                    };
                    break;
                };
                case 'Rare': {
                    cost = {
                        silver: Math.floor(Math.random() * 45) + 30,
                        gold: Math.floor(Math.random() * 6) + 2
                    };
                    break;
                };
                case 'Epic': {
                    cost = {
                        silver: Math.floor(Math.random() * 60) + 40,
                        gold: Math.floor(Math.random() * 12) + 12
                    };
                    break;
                };
            };

            if (type === 'Weapon') {
                cost.silver = cost.silver * 1.25;
                cost.gold = cost.gold * 1.25;
            } else if (type === 'Shield') {
                cost.silver = cost.silver * 1.15;
                cost.gold = cost.gold * 1.15; 
            } else if (type === 'Chest') {
                cost.silver = cost.silver * 1;
                cost.gold = cost.gold * 1;
            } else if (type === 'Helmet') {
                cost.silver = cost.silver * 1;
                cost.gold = cost.gold * 1;
            } else if (type === 'Legs') {
                cost.silver = cost.silver * 1;
                cost.gold = cost.gold * 1;
            } else if (type === 'Amulet') {
                cost.silver = cost.silver * 1.1;
                cost.gold = cost.gold * 1.1;
            } else if (type === 'Ring') {
                cost.silver = cost.silver * 1.1;
                cost.gold = cost.gold * 1.1;
            } else if (type === 'Trinket') {
                cost.silver = cost.silver * 1.1;
                cost.gold = cost.gold * 1.1;
            };
            cost.silver = Math.floor(cost.silver);
            cost.gold = Math.floor(cost.gold);
            // console.log(cost, 'How Much Does This Cost?');
            setPurchaseSetting({
                item: item,
                cost: cost
            });
        } catch (err: any) {
            console.log(err.message, 'Error Determining Cost!');
        };
    };

    const purchaseItem = async (): Promise<void> => {
        let asceanTotal = 0;
        let costTotal = 0;
        asceanTotal = ascean().currency.silver + (ascean().currency.gold * 100);
        costTotal = purchaseSetting().cost.silver + (purchaseSetting().cost.gold * 100);
        if (asceanTotal < costTotal) {
            EventBus.emit('alert', { header: 'Insufficient Funds', body: `You do not have enough money. You require ${costTotal - asceanTotal} more silver to purchase the ${item.name}.` });
            return;
        };
        try {
            EventBus.emit('alert', { header: `Purchasing ${item?.name}`, body: `You have purchased the ${item?.name} for ${purchaseSetting().cost.gold}g, ${purchaseSetting().cost.silver}s.`});
            EventBus.emit('purchase-item', purchaseSetting());
        } catch (err: any) {
            console.log(err.message, 'Error Purchasing Item!');
        };
    };

    const select = () => {
        setHighlight(item);
        setShow(true)
    };

    const getItemStyle = {
        background: 'black',
        border: '0.15em solid ' + getRarityColor(item?.rarity as string)
    };
    
    return (
        <div style={{ margin: '3%' }}>
            <button onClick={select} class="my-3 mx-2 p-2" style={getItemStyle}><img src={item?.imgUrl} alt={item?.name} /></button>
            <div style={{ 'font-size': "0.75em", 'margin-top': '4%', 'margin-bottom': '0' }}>
                {purchaseSetting()?.cost?.gold ? `${purchaseSetting().cost.gold}g${' '}` : ''}
                {purchaseSetting()?.cost?.silver ? `${purchaseSetting().cost.silver}s${' '}` : ''}
            </div>
            <button class='highlight super' onClick={purchaseItem} style={{ 'font-size': '', 'font-weight': 700, color: 'green', padding: '0.75em', 'z-index': 999 }}>
                Purchase {item?.name}
            </button>
        </div>
    );
};

export default MerchantLoot;