import { Accessor, createEffect, createSignal } from 'solid-js';
import Equipment from '../models/equipment';
import LootDrop from './LootDrop';
import { GameState } from '../stores/game';
import { For, Show } from 'solid-js';
import ItemModal from '../components/ItemModal';
import Ascean from '../models/ascean';

interface Props {
    ascean: Accessor<Ascean>;
    game: Accessor<GameState>;
};

export default function LootDropUI({ ascean, game }: Props) {
    const [visibleLoot, setVisibleLoot] = createSignal<any[]>([]);
    const [show, setShow] = createSignal<boolean>(false);
    const [lootDrop, setLootDrop] = createSignal<Equipment | undefined>(undefined);

    createEffect(() => {
        const visible: any = game()?.lootDrops?.filter((drop: Equipment) => game()?.showLootIds?.includes(drop._id));
        setVisibleLoot(visible);
    });
    return (
        <div class='center lootDropWindow' style={{ 
            position: 'fixed', height: '100vh', width: '100vw', left: 0, top: 0, bottom: 0, right: 0, // 'z-index': 2
        }}>
            <div class='gold' style={{ position: 'absolute', 'font-family': 'Cinzel-Regular', 'background-color': '#000', height: '35%', width: '45%',
                top: '70%', left: '50%', 'transform': 'translate(-50%, -50%)', 'padding': '0.5em', 'border': '0.15em solid #FFC700',
                'border-radius': '0.25em', 'box-shadow': '0 0 0.5em #FFC700', 'overflow-y': 'scroll'
            }}>

                <Show when={visibleLoot()}>
                    <For each={visibleLoot()}>
                        {((lootDrop: Equipment) => {
                            console.log(lootDrop, 'lootDrop');
                            return (
                                <LootDrop ascean={ascean} lootDrop={lootDrop} show={show} setShow={setShow} setLootDrop={setLootDrop} />
                            ) 
                        })}
                    </For>
                </Show>
            </div>
            <Show when={show()}>
                <div class='modal' onClick={() => setShow(!show())}>
                    <ItemModal item={lootDrop()} stalwart={false} caerenic={false} />
                </div>
            </Show> 
        </div>
    );
};