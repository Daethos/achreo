import { Accessor, For, Show, createSignal } from 'solid-js';
import MerchantLoot from './MerchantLoot';
import { GameState } from '../stores/game';
import Ascean from '../models/ascean';
import Equipment from '../models/equipment';
import ItemModal from '../components/ItemModal';
import Thievery from './Thievery';
interface Props {
    table: Accessor<Equipment[]>;
    ascean: Accessor<Ascean>;
    game: Accessor<GameState>;
};
export default function MerchantTable({ table, ascean, game }: Props) {
    const [show, setShow] = createSignal<boolean>(false);
    const [highlight, setHighlight] = createSignal<Equipment | undefined>(undefined);
    const [thievery, setThievery] = createSignal<boolean>(false);
    const [stealing, setStealing] = createSignal<{ stealing: boolean, item: any }>({ stealing: false, item: undefined });
    function steal(item: Equipment): void {
        setStealing({ stealing: true, item });
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
        <Thievery ascean={ascean} game={game} setThievery={setThievery} stealing={stealing} setStealing={setStealing} />
        </div>
    );
};