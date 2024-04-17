import { Accessor, For, Show, createEffect, createSignal } from 'solid-js';
import MerchantLoot from './MerchantLoot';
import { GameState } from '../stores/game';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import { EventBus } from '../game/EventBus';
import ItemModal from '../components/ItemModal';

interface Props {
    table: Accessor<Equipment[]>;
    ascean: Ascean;
    game: Accessor<GameState>;
};

const MerchantTable = ({ table, ascean, game }: Props) => {
    const [show, setShow] = createSignal<boolean>(false);
    const [highlight, setHighlight] = createSignal<Equipment | undefined>(undefined);
    const [thievery, setThievery] = createSignal<boolean>(false);
    const [thieveryTraits, setThieveryTraits] = createSignal<any>({});
    const [purchaseSetting, setPurchaseSetting] = createSignal<any>({
        ascean: ascean,
        item: undefined,
        cost: { silver: 0, gold: 0 }
    });
    createEffect(() => {
        storyThievery();
    });
    const storyThievery = async (): Promise<void> => {
        const traits = {
            primary: game()?.traits?.primary,
            secondary: game()?.traits?.secondary,
            tertiary: game()?.traits?.tertiary,
        };
        // console.log(traits, 'Traits');
        const thieveryTraits = ["Ma'anreic"];
        const matchingTraits = Object.values(traits).filter(trait => thieveryTraits.includes(trait.name));
        // console.log(matchingTraits, 'Matching Traits');
        if (matchingTraits.length === 0) {
            setThievery(false);
            return;
        };
        setThievery(true);
        setThieveryTraits(matchingTraits);
    };
    const checkStatisticalValue = (rarity: string): number => {
        switch (rarity) {
            case 'Common': return 10;
            case 'Uncommon': return 100;
            case 'Rare': return 400;
            case 'Epic': return 1200;
            case 'Legendary': return 12000;
            default: return 0;
        };
    };
    // const getFine = (rarity: string): number | string => {
    //     switch (rarity) {
    //         case 'Common': return '5 silver';
    //         case 'Uncommon': return '50 silver';
    //         case 'Rare': return '2 gold';
    //         case 'Epic': return '6 gold';
    //         case 'Legendary': return '120 gold';
    //         default: return 0;
    //     };
    // };

    createEffect(() => {
        determineCost(ascean, highlight()?.rarity as string, highlight()?.type as string);
    }); // , [item]

    const determineCost = async ( ascean: any, rarity: string, type: string ) => {
        try {
            let cost = { silver: 0, gold: 0 };
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
                item: highlight(),
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
            // setAlert({
            //     haeder: 'Transaction User Error',
            //     body: `You do not have enough money (${asceanTotal} total wealth), to purchase this: ${highlight()?.name}, at ${costTotal}.`
            // });
            return;
        };
        try {
            console.log(purchaseSetting(), 'Purchase Setting');            
            // EventBus.emit('purchase-item', purchaseSetting());
            // EventBus.emit('blend-game', { merchantEquipment: table().filter((i: any) => i._id !== item._id) });

            // dispatch(setMerchantEquipment(table.filter((i: any) => i._id !== item._id)));
        } catch (err: any) {
            console.warn(err.message, 'Error Purchasing Item!');
        };
    };
    const stealItem = async (purchaseSetting: { ascean: Ascean, item: Equipment, cost: { silver: number, gold: number } }): Promise<void> => {
        try {
            // const weight = {
            //     Common: 0,
            //     Uncommon: 5,
            //     Rare: 10,
            //     Epic: 25,
            //     Legendary: 50,
            // };
            // const chance = Math.floor(Math.random() * 100) + 1 + weight[purchaseSetting.item.rarity as keyof typeof weight];
            // const successChance = ascean.agility + ascean.achre;
            // console.log(successChance, 'Success Chance', chance, 'Chance');
            // if (chance > successChance) { // Failure
            //     const statistic = {
            //         asceanID: ascean._id, 
            //         successes: 0,
            //         failures: 1,
            //         total: 1,
            //         totalValue: 0,
            //     };
            //     const fineCost = getFine(purchaseSetting.item.rarity); 
            //     gameDispatch({ 
            //         type: GAME_ACTIONS.SET_STORY_CONTENT, 
            //         payload: `You were caught stealing. The merchant protested your censure, and simply have been fined ${fineCost}. \n\n The item has been pulled from the table.` 
            //     });
            //     const response = await asceanAPI.recordThievery(statistic);
            //     console.log(response, "Thievery Failure Response Recorded");
            //     gameDispatch({
            //         type: GAME_ACTIONS.SET_MERCHANT_EQUIPMENT,
            //         payload: table.filter((i: any) => i._id !== purchaseSetting.item._id)
            //     });
            //     const fine = await asceanAPI.asceanTax({ tax: checkStatisticalValue(purchaseSetting.item.rarity), id: ascean._id });
            //     setTimeout(() => {
            //         gameDispatch({ type: GAME_ACTIONS.SET_STATISTICS, payload: response });
            //         dispatch({ type: 'SET_CURRENCY', payload: fine });
            //         gameDispatch({ type: GAME_ACTIONS.SET_PLAYER_CURRENCY, payload: fine });
            //         setThievery(false);
            //     }, 1500);
            //     return;
            // };
            // getThieverySuccessFetch({ item: purchaseSetting, id: ascean._id });
            // setMerchantEquipment(table().filter((i: any) => i._id !== purchaseSetting.item._id));
            EventBus.emit('thievery', { item: purchaseSetting, id: ascean._id });
            EventBus.emit('blend-game', { merchantEquipment: table().filter((i: any) => i._id !== purchaseSetting.item._id) });
            
            // setTimeout (() => {
            //     getOnlyInventoryFetch(ascean._id);
            // }, 250);
            setThievery(false);
        } catch (err: any) {
            console.warn(err.message, 'Error Stealing Item!');
            // setAlert({
            //     title: 'Theft Error',
            //     content: err.message
            // });
        };
    };
    return (
        <div style={{ display: 'grid', width: '100%', 'grid-template-columns': 'repeat(3, 1fr)' }}>
        <For each={table()}>
            {(item: any, _index: Accessor<number>) => (
                <MerchantLoot item={item} ascean={ascean} show={show} setShow={setShow} setHighlight={setHighlight} />
            )}
        </For>
        <Show when={show()}>
            <div class='modal' onClick={() => setShow(false)}>
                <ItemModal item={highlight()} caerenic={false} stalwart={false} />
                {/* <button class='verticalBottom highlight' onClick={purchaseItem} style={{ 'font-size': '1em', 'font-weight': 700, color: 'green', padding: '0.75em' }}>
                    Purchase {highlight()?.name}
                </button> */}
            </div>
        </Show>
        </div>
    );
};

export default MerchantTable;