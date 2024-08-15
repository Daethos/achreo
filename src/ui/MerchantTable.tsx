import { Accessor, For, Show, createEffect, createSignal, onCleanup } from 'solid-js';
import MerchantLoot from './MerchantLoot';
import { GameState } from '../stores/game';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import { EventBus } from '../game/EventBus';
import ItemModal from '../components/ItemModal';
import { font } from '../utility/styling';

interface Props {
    table: Accessor<Equipment[]>;
    ascean: Accessor<Ascean>;
    game: Accessor<GameState>;
};

const MerchantTable = ({ table, ascean, game }: Props) => {
    const [show, setShow] = createSignal<boolean>(false);
    const [highlight, setHighlight] = createSignal<Equipment | undefined>(undefined);
    const [thievery, setThievery] = createSignal<boolean>(false);
    const [thieveryAnimation, setThieveryAnimation] = createSignal<{ item: any, player: number, merchant: number, dialog: any, on: boolean, cancel: boolean }>({
        item: {imgUrl:'',name:''},
        player: 0,
        merchant: 0,
        dialog: '',
        on: false,
        cancel: false,
    });
    createEffect(() => checkThievery());
    const checkThievery = async (): Promise<void> => {
        const traits = {
            primary: game()?.traits?.primary,
            secondary: game()?.traits?.secondary,
            tertiary: game()?.traits?.tertiary,
        };
        const thieveryTraits = ["Ma'anreic"];
        const matchingTraits = Object.values(traits).filter(trait => thieveryTraits.includes(trait.name));
        setThievery(matchingTraits.length > 0);
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
    // function rollDice(item: any) {
    //     const weight = {
    //         Common: 0,
    //         Uncommon: 5,
    //         Rare: 10,
    //         Epic: 25,
    //         Legendary: 50,
    //     };
    //     const chance = Math.floor(Math.random() * 101) + weight[item.rarity as keyof typeof weight];
    //     const successChance = ascean().agility + ascean().achre + Math.round(Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1));
    //     const value = checkStatisticalValue(item.rarity as string);
    //     setThieveryAnimation({
    //         ...thieveryAnimation(),
    //         item,
    //         on: true,
    //         dialog: <div>Calculating the ability of <span class='gold'>{ascean().name}</span>. <br /> Please Stand By...</div>
    //     });
    //     setTimeout(() => {
    //         if (thieveryAnimation().cancel === true) {
    //             setThieveryAnimation({
    //                 ...thieveryAnimation(),
    //                 cancel: false,
    //             });
    //             return;    
    //         };
    //         setThieveryAnimation({
    //             ...thieveryAnimation(),
    //             player: successChance,
    //             dialog: <div><span class='gold'>{ascean().name}</span>, you have a <span class='gold'>{successChance}</span>% of succeeding. <br /> Let's see how sharp this Merchant is...</div>
    //         });
    //         setTimeout(() => {
    //             if (thieveryAnimation().cancel === true) {
    //                 setThieveryAnimation({
    //                     ...thieveryAnimation(),
    //                     cancel: false,
    //                 });
    //                 return;    
    //             };
    //             setThieveryAnimation({
    //                 ...thieveryAnimation(),
    //                 merchant: chance,
    //                 dialog: <div>Player: <span class='gold'>{successChance}</span>% <br /> The Merchant's current awareness is rated at <span class='gold'>{chance}</span>%... <br /> {chance > successChance ? 'Aww well. Better luck next time, fiend.' : 'Congratulations, you rapscallion. You did it!'}</div>    
    //             });
    //             setTimeout(() => {
    //                 if (thieveryAnimation().cancel === true) {
    //                     setThieveryAnimation({
    //                         ...thieveryAnimation(),
    //                         cancel: false,
    //                     });
    //                     return;    
    //                 };
    //                 if (chance > successChance) { // Failure
    //                     console.log('Loss!');
    //                     const fineCost = getFine(item.rarity as string); 
    //                     EventBus.emit('alert', {header: 'You Have Been Caught!', body: `You were caught stealing. The merchant protested your censure, and simply have been fined ${fineCost}. \n\n The item has been pulled from the table.`, delay: 3000, key: 'Close'});    
    //                     EventBus.emit('steal-item', { success: false, item: item, value });
    //                 } else {
    //                     console.log('Success!');
    //                     EventBus.emit('steal-item', { success: true, item: item, value });
    //                     EventBus.emit('alert', { header: 'You Have Appropriated Goods!', body: `You have successfully lifted an item from the table. The merchant has no idea they no longer possess the ${item.name}. \n\n Good job!`, delay: 3000, key: 'Close'});    
    //                 };
    //                 setThieveryAnimation({
    //                     ...thieveryAnimation(),
    //                     on: false,
    //                 });
    //             }, 4000);
    //         }, 4000);
    //     }, 4000);
    // };
    function steal(item: Equipment): void {
        try {
            // rollDice(item);
            const weight = {
                Common: 0,
                Uncommon: 5,
                Rare: 10,
                Epic: 25,
                Legendary: 50,
            };
            const chance = Math.floor(Math.random() * 101) + weight[item.rarity as keyof typeof weight];
            const successChance = ascean().agility + ascean().achre + Math.round(Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1));
            console.log(chance, successChance, 'What is going on ')
            const value = checkStatisticalValue(item.rarity as string);
            if (chance > successChance) { // Failure
                console.log('Loss!');
                const fineCost = getFine(item.rarity as string); 
                EventBus.emit('alert', {
                    header: 'You Have Been Caught!', 
                    body: `You were caught stealing. The merchant protested your censure, and simply have been fined ${fineCost}. \n\n The item has been pulled from the table.`, 
                    delay: 3000, 
                    key: 'Close'
                });    
                EventBus.emit('steal-item', { success: false, item: item, value });
            } else {
                console.log('Success!');
                EventBus.emit('steal-item', { success: true, item: item, value });
                EventBus.emit('alert', {
                    header: 'You Have Appropriated Goods!', 
                    body: `You have successfully lifted an item from the table. The merchant has no idea they no longer possess the ${item.name}. \n\n Good job!`, 
                    delay: 3000, 
                    key: 'Close'
                });    
            };
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
        <Show when={thieveryAnimation().on}>
            <div class='modal'>
            <div class='button superCenter' style={{ 'background-color': 'black', width: '25%' }}>
                <div class='center' style={font('1.5em')}>Lets see if you can successfully swipe  <span style={{ color: 'gold' }}>{thieveryAnimation()?.item?.name}!</span> <br /><br /><div>
                    <img style={{ transform: 'scale(1.25)' }} src={thieveryAnimation()?.item?.imgUrl} alt={thieveryAnimation()?.item?.name} />
                </div>
                <div class='center' style={{...font('0.75em'), 'margin-top': '7.5%'}}>
                    {thieveryAnimation()?.dialog}<div>
                </div>
                </div>
                </div>
                <br />
                <div class='gold'>Press X to Cancel</div>
                <br />
                <br />
                <button class='highlight cornerBR' onClick={() => setThieveryAnimation({...thieveryAnimation(), on:false, cancel: true})} 
                    style={{ transform: 'scale(0.85)', bottom: '0', right: '0', 'background-color': 'red', 
                        'white-space': 'normal'
                    }}>
                    <p style={font('0.5em')}>X</p>
                </button>
            </div>
            </div>
        </Show>
        </div>
    );
};

export default MerchantTable;