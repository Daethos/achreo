import { Accessor, For, Show, createEffect, createSignal } from 'solid-js';
import MerchantLoot from './MerchantLoot';
import { GameState } from '../stores/game';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import { EventBus } from '../game/EventBus';
import ItemModal from '../components/ItemModal';

interface Props {
    table: Accessor<Equipment[]>;
    ascean: Accessor<Ascean>;
    game: Accessor<GameState>;
};

const MerchantTable = ({ table, ascean, game }: Props) => {
    const [show, setShow] = createSignal<boolean>(false);
    const [highlight, setHighlight] = createSignal<Equipment | undefined>(undefined);
    const [thievery, setThievery] = createSignal<boolean>(false);
    createEffect(() => checkThievery());
    const checkThievery = async (): Promise<void> => {
        const traits = {
            primary: game()?.traits?.primary,
            secondary: game()?.traits?.secondary,
            tertiary: game()?.traits?.tertiary,
        };
        const thieveryTraits = ["Ma'anreic"];
        const matchingTraits = Object.values(traits).filter(trait => thieveryTraits.includes(trait.name));
        setThievery(matchingTraits.length === 0);
    };
    const checkStatisticalValue = (rarity: string): number => {
        switch (rarity) {
            case 'Common': return 5;
            case 'Uncommon': return 25;
            case 'Rare': return 100;
            case 'Epic': return 300;
            case 'Legendary': return 10000;
            default: return 0;
        };
    };
    const getFine = (rarity: string): number | string => {
        switch (rarity) {
            case 'Common': return '5 silver';
            case 'Uncommon': return '25 silver';
            case 'Rare': return '1 gold';
            case 'Epic': return '3 gold';
            case 'Legendary': return '100 gold';
            default: return 0;
        };
    };
 
  
    async function steal(purchaseSetting: Accessor<{ item: Equipment, cost: { silver: number, gold: number } }>): Promise<void> {
        try {
            const weight = {
                Common: 0,
                Uncommon: 5,
                Rare: 10,
                Epic: 25,
                Legendary: 50,
            };
            const chance = Math.floor(Math.random() * 101) + weight[purchaseSetting().item.rarity as keyof typeof weight];
            const successChance = ascean().agility + ascean().achre;
            console.log(successChance, 'Success Chance', chance, 'Chance');
            if (chance > successChance) { // Failure
                const statistic = {
                    failures: 1,
                    value: checkStatisticalValue(purchaseSetting().item.rarity as string),
                };
                console.log(statistic, 'LOSS!');
                const fineCost = getFine(purchaseSetting().item.rarity as string); 
                EventBus.emit('alert', {header: 'You Have Been Caught!', body: `You were caught stealing. The merchant protested your censure, and simply have been fined ${fineCost}. \n\n The item has been pulled from the table.`, delay: 3000, key: 'Close'});    
                // EventBus.emit('remove-item', purchaseSetting().item._id);
                // EventBus.emit('record-thievery', statistic);
                console.log(statistic.value, 'Taxed!');
                EventBus.emit('steal-item', { success: false, fine: statistic.value, statistic });
                // setThievery(false);
                return;
            } else {
                const statistic = {
                    successes: 1,
                    value: checkStatisticalValue(purchaseSetting().item.rarity as string),
                };
                console.log('Success!');
                EventBus.emit('steal-item', { success: true, item: purchaseSetting().item, statistic });
                // EventBus.emit('purchase-item', { item: purchaseSetting().item, cost: { silver: 0, gold: 0 } });
                EventBus.emit('alert', { header: 'You Have Appropriated Goods!', body: `You have successfully lifted an item from the table. The merchant has no idea they no longer possess the ${purchaseSetting().item.name}. \n\n Good job!`, delay: 3000, key: 'Close'});    
            }
            // EventBus.emit('thievery', { item: purchaseSetting(), id: ascean._id });
            
            // setThievery(false);
        } catch (err: any) {
            console.warn(err.message, 'Error Stealing Item!'); 
        };
    };
    return (
        <div style={{ display: 'grid', width: '100%', 'grid-template-columns': 'repeat(3, 1fr)' }}>
        <For each={table()}>
            {(item: any, _index: Accessor<number>) => (
                <MerchantLoot item={item} ascean={ascean} setShow={setShow} setHighlight={setHighlight} thievery={thievery} steal={steal} />
            )}
        </For>
        <Show when={show()}>
            <div class='modal' onClick={() => setShow(false)}>
                <ItemModal item={highlight()} caerenic={false} stalwart={false} /> 
            </div>
        </Show>
        </div>
    );
};

export default MerchantTable;