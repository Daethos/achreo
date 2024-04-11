import { Accessor, Setter, createEffect, createSignal } from 'solid-js'
import Equipment from '../models/equipment';
import Ascean from '../models/ascean';
import { getRarityColor } from '../utility/styling';
import { EventBus } from '../game/EventBus';

interface Props {
    item: Equipment;
    ascean: Ascean;
    error: Accessor<any>;
    setError: Setter<any>;
    table?: any;
    stealItem: (purchaseSetting: {
        ascean: Ascean;
        item: Equipment;
        cost: {
            silver: number;
            gold: number;
        };
    }) => Promise<void>;
    thievery: Accessor<boolean>;
    show: Accessor<boolean>;
    setShow: Setter<boolean>;
};

const MerchantLoot = ({ item, ascean, error, setError, table, stealItem, thievery, show, setShow }: Props) => {
    const [purchaseSetting, setPurchaseSetting] = createSignal({
        ascean: ascean,
        item: item,
        cost: { silver: 0, gold: 0 }
    });
    
    createEffect(() => {
        console.log(thievery, 'Thievery');
        determineCost(ascean, item?.rarity as string, item?.type);
    }); // , [item]

    const determineCost = async ( ascean: any, rarity: string, type: string ) => {
        try {
            let cost = { silver: 0, gold: 0 };
            if (location.pathname.startsWith('/GameAdmin')) {
                return setPurchaseSetting({
                    ascean: ascean,
                    item: item,
                    cost: cost
                });
            };
            switch (rarity) {
                case 'Common': {
                    cost = {
                        silver: Math.floor(Math.random() * 30) + 1,
                        gold: 0
                    };
                    break;
                };
                case 'Uncommon': {
                    cost = {
                        silver: Math.floor(Math.random() * 35) + 15,
                        gold: Math.floor(Math.random() * 2) + 1
                    };
                    break;
                };
                case 'Rare': {
                    cost = {
                        silver: Math.floor(Math.random() * 50) + 25,
                        gold: Math.floor(Math.random() * 6) + 2
                    };
                    break;
                };
                case 'Epic': {
                    cost = {
                        silver: Math.floor(Math.random() * 50) + 50,
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
            console.log(cost, 'How Much Does This Cost?');
            setPurchaseSetting({
                ascean: ascean,
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
        asceanTotal = ascean.currency.silver + (ascean.currency.gold * 100);
        costTotal = purchaseSetting().cost.silver + (purchaseSetting().cost.gold * 100);
        if (asceanTotal < costTotal) {
            setError({
                title: 'Transaction User Error',
                content: `You do not have enough money (${asceanTotal} total wealth), to purchase this: ${item.name}, at ${costTotal}.`
            });
            return;
        };
        try {
            // dispatch(getPurchaseFetch(purchaseSetting()));
            EventBus.emit('purchase-item', purchaseSetting());
            EventBus.emit('blend-game', { merchantEquipment: table.filter((i: any) => i._id !== item._id) });

            // dispatch(setMerchantEquipment(table.filter((i: any) => i._id !== item._id)));
        } catch (err: any) {
            console.log(err.message, 'Error Purchasing Item!');
            setError({
                title: 'Transaction Error',
                content: err.message
            });
        };
    };

    const getItemStyle = {
        background: 'black',
        border: '0.15em solid ' + getRarityColor(item?.rarity as string)
    };
    
    return (
        <div>
            <button onClick={() => setShow(!show())} class="my-3 mx-2 p-2" style={getItemStyle}><img src={process.env.PUBLIC_URL + item?.imgURL} alt={item?.name} /></button>
            <p style={{ 'font-size': "11px", 'margin-top': "-14px" }}>
                {purchaseSetting()?.cost?.gold ? `${purchaseSetting().cost.gold}g${' '}` : ''}
                {purchaseSetting()?.cost?.silver ? `${purchaseSetting().cost.silver}s${' '}` : ''}
            </p>
        </div>
    );
};

export default MerchantLoot;