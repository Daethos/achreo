import { Accessor, createEffect, createSignal } from 'solid-js';
import Equipment from '../models/equipment';
import LootDrop from './LootDrop';
import { GameState } from '../stores/game';
import Ascean from '../models/ascean';
import { For, Show } from 'solid-js';

interface Props {
    ascean: Accessor<Ascean>;
    gameState: Accessor<GameState>;
};

export default function LootDropUI({ ascean, gameState }: Props) {
    const [visibleLoot, setVisibleLoot] = createSignal<any[]>([]);
    createEffect(() => {
        const visible: any = gameState()?.lootDrops?.filter((drop: Equipment) => gameState()?.showLootIds?.includes(drop._id));
        // if (visible.length === 0) setShowLootOne(false);
        setVisibleLoot(visible);
    }, [gameState().showLootIds, gameState().lootDrops]);
    
    return (
        <div class='center lootDropWindow'>
            <img src={'../assets/gui/log_window.png'} alt='Log Window' 
                style={{ transform: 'scaleX(0.65)' }} />
            <div class='gold' style={{ position: 'absolute', 'font-family': 'Cinzel-Regular' }}>
                {/* <Image source={require('../assets/images/godHand.png')} alt='God Hand' 
                style={[styles.center, { maxWidth: '30%', marginLeft: '40%' },
                    itemStyle(getRarityColor('Uncommon')), border(getRarityColor('Uncommon'), '0.15em')]} />
                {'\n'}{'\n'}
                The Loot Will Be Displayed Here  */}
                <Show when={visibleLoot.length > 0}>
                    <For each={visibleLoot()}>{((lootDrop: Equipment) => ( 
                        <LootDrop lootDrop={lootDrop} ascean={ascean} gameState={gameState} />
                    ))}</For>
                </Show>
            </div> 
        </div>
    );
};