import { Accessor, createMemo, createSignal, onMount } from "solid-js";
import Equipment from "../models/equipment";
import LootDrop from "./LootDrop";
import { GameState } from "../stores/game";
import { For, Show } from "solid-js";
import ItemModal from "../components/ItemModal";
import Ascean from "../models/ascean";
import TutorialOverlay from "../utility/tutorial";
import Settings from "../models/settings";
export default function LootDropUI({ ascean, game, settings }: { ascean: Accessor<Ascean>; game: Accessor<GameState>; settings: Accessor<Settings>; }) {
    const [show, setShow] = createSignal<boolean>(false);
    const [lootDrop, setLootDrop] = createSignal<Equipment | undefined>(undefined);
    const [showTutorial, setShowTutorial] = createSignal<boolean>(false);
    const [tutorial, setTutorial] = createSignal<string>("");

    const visibleLoot = createMemo(() => {
        const visible: any[] = game().lootDrops?.filter((drop: Equipment) => game().showLootIds?.includes(drop._id));
        return visible;
    });

    onMount(() => {
        if (!settings().tutorial.loot) {
            setShowTutorial(true);
            setTutorial("loot");
        };
    });
    return <div class="center">
        <div class="gold lootDropWindow">
            <Show when={visibleLoot()}>
            <For each={visibleLoot()}>
                {((lootDrop: Equipment) => {
                    return <LootDrop lootDrop={lootDrop} showTutorial={showTutorial} setShow={setShow} setLootDrop={setLootDrop} />
                })}
            </For>
            </Show>
        </div>
        <Show when={show()}>
            <div class="modal" onClick={() => setShow(!show())} style={{ "z-index": 3 }}>
                <ItemModal item={lootDrop()} stalwart={false} caerenic={false} />
            </div>
        </Show> 
        <Show when={showTutorial()}>
            <div class="modal">
                <TutorialOverlay ascean={ascean} settings={settings} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} />
            </div>
        </Show> 
    </div>;
};