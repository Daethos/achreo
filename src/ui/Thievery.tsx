import { Accessor, createEffect, createSignal, JSX, Setter, Show } from "solid-js";
import { GameState } from "../stores/game";
import { font } from "../utility/styling";
import { ThreeDots } from "solid-spinner";
import { EventBus } from "../game/EventBus";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
export default function Thievery({ ascean, game, setThievery, stealing, setStealing }: { ascean: Accessor<Ascean>; game: Accessor<GameState>; setThievery: Setter<boolean>; stealing: Accessor<{ stealing: boolean; item: any }>; setStealing: Setter<{ stealing: boolean; item: any }> }) {
    const [thieveryAnimation, setThieveryAnimation] = createSignal<{ item: any, player: number, merchant: number, dialog: any, on: boolean, cancel: boolean, rolling: boolean, step: number }>({
        item: {imgUrl:'',name:''},
        player: 0,
        merchant: 0,
        dialog: '',
        on: false,
        cancel: false,
        rolling: false,
        step: 0,
    });
    createEffect(() => checkThievery());
    createEffect(() => {
        if (thieveryAnimation().on && thieveryAnimation().rolling) {
            let dialog: JSX.Element | string = '';
            switch (thieveryAnimation().step) {
                case 1:
                    dialog = <div><i>Calculating</i> the ability of <span class='gold'>{ascean().name}</span>. <br /><br /></div>;
                    break;
                case 2: // <span class='gold'>{ascean().name}</span>, y 
                    dialog = <div>You have a <span class='gold'>{thieveryAnimation().player}</span>% of succeeding. <br /><br /> <i>Calculating</i> Merchant's Awareness</div>;
                    break;
                case 3:
                    dialog = <div><i>Comparing</i> your <span class='gold'>guile</span> with the Merchant's</div>;
                    break;
                case 4:
                    dialog = <div>Player: <span class='gold'>{thieveryAnimation().player}</span>% <br /> <br />
                        The Merchant's current awareness is rated at <span class='gold'>{thieveryAnimation().merchant}</span>% <br /> <br />
                        {thieveryAnimation().merchant > thieveryAnimation().player ? 'Aww, well. Better luck next time, Fiend! Hah Hah Hah!' : `You rapscallion, you did it; the ${thieveryAnimation().item.name} is yours!`}</div> ;
                    break;
                default: break;
            };
            setThieveryAnimation({
                ...thieveryAnimation(),
                dialog,
                rolling: false,
            });
        };
        if (stealing().stealing && stealing().item) {
            steal(stealing().item);
            setStealing({ ...stealing(), stealing: false });
        };
    });
    function checkThievery(): void {
        const traits = {
            primary: game()?.traits?.primary,
            secondary: game()?.traits?.secondary,
            tertiary: game()?.traits?.tertiary,
        };
        const thieveryTraits = ["Ma'anreic"];
        const matchingTraits = Object.values(traits).filter(trait => thieveryTraits.includes(trait.name));
        setThievery(matchingTraits.length > 0);
    };
    function checkStatisticalValue(rarity: string): number {
        switch (rarity) {
            case 'Common': return 5;
            case 'Uncommon': return 25;
            case 'Rare': return 100;
            case 'Epic': return 300;
            case 'Legendary': return 10000;
            default: return 0;
        };
    };
    function getFine(rarity: string): number | string {
        switch (rarity) {
            case 'Common': return '5 silver';
            case 'Uncommon': return '25 silver';
            case 'Rare': return '1 gold';
            case 'Epic': return '3 gold';
            case 'Legendary': return '100 gold';
            default: return 0;
        };
    };
    function steal(item: Equipment): void {
        try {
            const weight = {
                Common: 0,
                Uncommon: 5,
                Rare: 10,
                Epic: 25,
                Legendary: 50,
            };
            const merchant = Math.floor(Math.random() * 101) + weight[item.rarity as keyof typeof weight];
            const player = ascean().agility + ascean().achre + Math.round(Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1));
            const success = player > merchant;
            const value = checkStatisticalValue(item.rarity as string);
            setThieveryAnimation({ ...thieveryAnimation(), item, on: true, rolling: true, step: 1 });
            setTimeout(() => {
                if (thieveryAnimation().cancel === true) {
                    setThieveryAnimation({ ...thieveryAnimation(), cancel: false, rolling: false, step: 0 });
                    return;    
                };
                setThieveryAnimation({ ...thieveryAnimation(), player, rolling: true, step: 2 });
                setTimeout(() => {
                    if (thieveryAnimation().cancel === true) {
                        setThieveryAnimation({ ...thieveryAnimation(), cancel: false, rolling: false, step: 0 });
                        return;    
                    };
                    setThieveryAnimation({ ...thieveryAnimation(), merchant, rolling: true, step: 3 });
                    setTimeout(() => {
                        if (thieveryAnimation().cancel === true) {
                            setThieveryAnimation({  ...thieveryAnimation(),  cancel: false,  rolling: false,  step: 0 });
                            return;    
                        };
                        setThieveryAnimation({ ...thieveryAnimation(), merchant, rolling: true, step: 4 });
                        if (success) {
                            EventBus.emit('steal-item', { success: true, item: item, value });
                        } else {
                            EventBus.emit('steal-item', { success: false, item: item, value });
                        };
                        setTimeout(() => {
                            if (thieveryAnimation().cancel === true) {
                                setThieveryAnimation({ ...thieveryAnimation(), cancel: false, rolling: false, step: 0 });
                                return;    
                            };
                            if (success) { // Failure
                                EventBus.emit('alert', { header: 'You Have Appropriated Goods!', body: `You have successfully lifted the item from the table. The merchant has no idea they no longer possess the ${item.name}. Good job, criminal scum!`, delay: 6000, key: 'Close'});    
                            } else {
                                const fineCost = getFine(item.rarity as string); 
                                EventBus.emit('alert', {header: 'You Have Been Caught!', body: `You were caught stealing. The merchant protested your censure, and have simply been fined ${fineCost} instead. The item has subsequently been pulled from the table.`, delay: 6000, key: 'Close'});    
                                setThievery(false);
                            };
                            setThieveryAnimation({ ...thieveryAnimation(), on: false, step: 0 });
                        }, 3000);
                    }, 3000);
                }, 3000);
            }, 3000);
        } catch (err: any) {
            console.warn(err.message, 'Error Stealing Item!'); 
        };
    };
    return <div>
        <Show when={thieveryAnimation().on}>
            <div class='modal'>
            <div class='button superCenter' style={{ 'background-color': 'black', width: '30%' }}>
                <div class='wrap' style={{ margin: '5%' }}>

                <div class='center' style={font('1.15em')}>Lets see if you can successfully swipe  <span style={{ color: 'gold' }}>{thieveryAnimation()?.item?.name}!</span> <br /><br /><div>
                    <img style={{ transform: 'scale(1.25)' }} src={thieveryAnimation()?.item?.imgUrl} alt={thieveryAnimation()?.item?.name} />
                </div>
                <div class='center' style={{...font('1em'), 'margin-top': '7.5%'}}>
                    {thieveryAnimation()?.dialog}
                </div>
                </div>
                <Show when={thieveryAnimation().step !== 4} fallback={<>
                    <br />
                </>}>
                <br /> Please Stand By <br />
                <ThreeDots color='gold' width='30' />
                <br />
                <br />
                <div class='gold'>Press X to Cancel</div>
                <br />
                <button class='highlight cornerBR' onClick={() => setThieveryAnimation({...thieveryAnimation(), on:false, cancel: true})} 
                    style={{ transform: 'scale(0.85)', bottom: '0', right: '0', 'background-color': 'red', 
                        'white-space': 'normal'
                    }}>
                    <p style={font('0.5em')}>X</p>
                </button>
                </Show>
                </div>

            </div>
            </div>
        </Show>
    </div>
};