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