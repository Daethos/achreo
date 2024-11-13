import { Accessor, createSignal, For, JSX, Setter, Show } from "solid-js";
import { ARENA_ENEMY, fetchArena } from "../utility/enemy";
import Ascean from "../models/ascean";
import { EventBus } from "../game/EventBus";
import { v4 as uuidv4 } from 'uuid';
import Currency from "../utility/Currency";
import { FloatingLabel, Form } from "solid-bootstrap";
import { ArenaRoster } from "./BaseUI";
import { GameState } from "../stores/game";
import { rebalanceCurrency } from "../game/PhaserGame";
import Equipment from "../models/equipment";
import LootDrop from "./LootDrop";
import ItemModal from "../components/ItemModal";
import { roundToTwoDecimals } from "../utility/combat";
import { masteryColor } from "../utility/styling";
const selectors = {
    1: { prev: 1, next: 2 },
    2: { prev: 1, next: 4 },
    4: { prev: 2, next: 6 },
    6: { prev: 4, next: 8 },
    8: { prev: 6, next: 8 },
};

export default function Roster({ arena, ascean, setArena, base, game }: { arena: Accessor<ArenaRoster>; ascean: Accessor<Ascean>; setArena: Setter<ArenaRoster>; base: boolean; game: Accessor<GameState>; }) {
    const [selector, setSelector] = createSignal<ARENA_ENEMY>({ level: Math.min((ascean().level % 2 === 0 ? ascean().level : ascean().level + 1), 8), mastery: 'constitution', id: '' });
    const [switchScene, setSwitchScene] = createSignal<boolean>(true);
    const [lootDrop, setLootDrop] = createSignal<Equipment | undefined>(undefined);
    const [show, setShow] = createSignal<boolean>(false);

    function createArena() {
        EventBus.emit('alert', { header: 'Duel Commencing', body: `The Eulex has begun. You have chosen to face ${arena().enemies.length} enemies of various might. Dae Ky'veshyr, ${ascean().name}.` }); // godspeed
        const enemies = fetchArena(arena().enemies);
        let multiplier = 0;
        for (let i = 0; i < arena().enemies.length; i++) {
            multiplier += (arena().enemies[i].level / ascean().level);
        };
        if (arena().enemies.length > 1) multiplier *= ((arena().enemies.length - 1) * 1.5);
        multiplier /= 2;
        const wager = { ...arena().wager, multiplier };
        if (switchScene()) {
            EventBus.emit('set-wager-arena', {wager, enemies});
        } else {
            EventBus.emit('set-wager-underground', {wager, enemies});
        };
        setArena({ ...arena(), show: false });
        if (!base) EventBus.emit('outside-press', 'dialog');
    };

    function opponentAdd() {
        let newEnemies = JSON.parse(JSON.stringify(arena().enemies));
        let newEnemy = { ...selector(), id: uuidv4() };
        newEnemies.push(newEnemy);
        setArena({ ...arena(), enemies: newEnemies });
    };

    function opponentRemove(enemy: ARENA_ENEMY) {
        let newEnemies = JSON.parse(JSON.stringify(arena().enemies));
        newEnemies = newEnemies.filter((ae: ARENA_ENEMY) => ae.id !== enemy.id);
        setArena({ ...arena(), enemies: newEnemies });
    };

    function selectOpponent(type: string, value: number | string) {
        setSelector({
            ...selector(),
            [type]: value
        });
    };

    function setWager(type: string, value: number) {
        setArena({
            ...arena(),
            wager: {
                ...arena().wager,
                [type]: value
            }
        });
    };
    function safe(e: any, floor: number, ceiling: number): number {
        const wager = e.currentTarget.value;
        if (wager > floor && wager <= ceiling) {
            return wager;
        };
        return 0;
    };
    function clearWager() {
        let silver = ascean().currency.silver, gold = ascean().currency.gold;
        if (arena().win) {
            silver +=  (arena().wager.silver * arena().wager.multiplier);
            gold += (arena().wager.gold * arena().wager.multiplier);
        } else {
            silver -= arena().wager.silver;
            gold -= arena().wager.gold;
        };
        let currency = { silver, gold };
        currency = rebalanceCurrency(currency);
        const update = { ...ascean(), currency };
        EventBus.emit('update-ascean', update);
        setArena({ ...arena(), enemies: [], wager: { silver: 0, gold: 0, multiplier: 0 }, win: false, show: false, result: false });
        if (switchScene()) EventBus.emit('switch-arena');
    };
    const style = { position: 'absolute',left: '20%',top: '10%',height: '80%',width: '60%',background: '#000',border: '0.1em solid gold','border-radius': '0.25em','box-shadow': '0 0 0.5em #FFC700',overflow: 'scroll','text-align': 'center', 'scrollbar-width':'none','z-index': 999 } as JSX.PropAttributes;
    // Math.max(selector().level - 2, 2) || Math.min(selector().level + 2, 8)
    return <Show when={arena().show}>
        <div class='modal'>
            <Show when={arena().result} fallback={<>
                <div class='center creature-heading moisten' style={style}>
                    <h1 style={{ margin: '8px 0' }}><span style={{ color: '#fdf6d8' }}>Opponents Chosen:</span> {arena().enemies.length}</h1>
                    <h1 style={{ margin: '8px 0' }}><span style={{ color: '#fdf6d8' }}>Wager:</span> {arena().wager.gold}g {arena().wager.silver}s</h1>
                    <h1 style={{ margin: '8px 0' }} onClick={() => setSwitchScene(!switchScene())}><span style={{ color: '#fdf6d8' }}>Map Selected: </span>{switchScene() ? 'Arena' : 'Underground'}</h1>
                    <p style={{ 'font-size': '0.75em', 'margin': '0' }}>Click to switch maps. [Note]: Player AI is available only in the Arena at this time.</p>
                    {arena().enemies.length > 0 && <button class='highlight animate' onClick={() => createArena()} style={{ 'font-size': '1.25em' }}>Enter the Eulex</button>}
                    <For each={arena().enemies}>{(enemy) => {
                        return (
                            <div style={{ color: masteryColor(enemy.mastery) }}>Level {enemy.level} - {enemy.mastery.charAt(0).toUpperCase() + enemy.mastery.slice(1)} <button class='highlight' onClick={() => opponentRemove(enemy)}>Remove</button></div>
                        )
                    }}</For>
                    <div>
                        <button class='highlight' style={{ 'font-size': '1.1em' }} onClick={() => opponentAdd()}>Add ({selector().level} | {selector().mastery.charAt(0).toUpperCase() + selector().mastery.slice(1)})</button>
                    </div>
                    
                    <div style={{ display: 'grid', 'grid-template-columns': 'repeat(2, 1fr)' }}>
                        <div>
                            <p style={{ color: 'gold', margin: '8px 0', 'font-size': '1.4em' }}>Level ({selector().level})</p>
                            <button class='highlight' onClick={() => selectOpponent('level', selectors[selector().level as keyof typeof selectors].prev)}>-</button>
                            <button class='highlight' onClick={() => selectOpponent('level', selectors[selector().level as keyof typeof selectors].next)}>+</button>
                        </div>
                        <div style={{ 'margin-bottom': '8px' }}><p style={{ color: 'gold', margin: '8px 0', 'font-size': '1.4em' }}>Mastery ({selector().mastery.charAt(0).toUpperCase() + selector().mastery.slice(1)})</p>
                            <button class='highlight' onClick={() => selectOpponent('mastery', 'constitution')}>Con</button>
                            <button class='highlight' onClick={() => selectOpponent('mastery', 'strength')}>Str</button>
                            <button class='highlight' onClick={() => selectOpponent('mastery', 'agility')}>Agi</button>
                            <button class='highlight' onClick={() => selectOpponent('mastery', 'achre')}>Ach</button>
                            <button class='highlight' onClick={() => selectOpponent('mastery', 'caeren')}>Caer</button>
                            <button class='highlight' onClick={() => selectOpponent('mastery', 'kyosir')}>Kyo</button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', 'grid-template-columns': 'repeat(2, 1fr)', 'grid-template-rows': 'repeat(2, 1fr)' }}>
                        <p style={{ color: 'gold', margin: '8px 0 ', 'font-size': '1.4em', padding: '0' }}>Currency</p>
                        <p style={{ color: 'gold', margin: '8px 0 ', 'font-size': '1.4em', padding: '0' }}>Wager</p>
                        <Currency ascean={ascean} />
                        <div style={{ padding: '2%' }}>
                            <img src={'../assets/images/gold-full.png'} alt="Gold Stack" /> {arena().wager.gold} <img src={'../assets/images/silver-full.png'} alt="Silver Stack" /> {arena().wager.silver}
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', 'grid-template-columns': 'repeat(2, 1fr)', 'grid-template-rows': 'repeat(2, 1fr)' }}>
                        <p style={{ color: 'gold', margin: '8px 0 ', 'font-size': '1.4em', padding: '0' }}>Gold</p>
                        <p style={{ margin: '8px 0 ', 'font-size': '1.4em', padding: '0' }}>Silver</p>
                        <FloatingLabel controlId="floatingGold" label="Gold" style={{ color: 'black', margin: '0 auto' }}>
                            <Form.Control  oninput={(e: any) => setWager('gold', safe(e, 0, ascean().currency.gold))} type="number" placeholder={`${ascean().currency.gold}`} style={{ color: 'black', margin: '0 auto 0 15%', 'text-align': 'right', width: '50%' }} />
                        </FloatingLabel>

                        <FloatingLabel controlId="floatingSilver" label="Silver"  style={{ color: 'black', margin: '0 auto' }}>
                            <Form.Control  oninput={(e: any) => setWager('silver', safe(e, 0, ascean().currency.silver))} type="number" placeholder={`${ascean().currency.silver}`} style={{ color: 'black', margin: '0 auto 0 15%', 'text-align': 'right', width: '50%' }} />
                        </FloatingLabel>
                    </div>

                    <div  style={{ display: 'grid', 'grid-template-columns': 'repeat(2, 1fr)' }}>
                        <div style={{ margin: '0 0 7.5%' }}>
                            <button class='highlight' onClick={() => setWager('gold', Math.max(0, arena().wager.gold - 1))}>-</button>
                            <button class='highlight' onClick={() => setWager('gold', Math.min(ascean().currency.gold, arena().wager.gold + 1))}>+</button>
                        </div>
                        <div style={{ margin: '0 0 7.5%' }}>
                            <button class='highlight' onClick={() => setWager('silver', Math.max(0, arena().wager.silver - 1))}>-</button>
                            <button class='highlight' onClick={() => setWager('silver', Math.min(ascean().currency.silver, arena().wager.silver + 1))}>+</button>
                        </div>
                    </div>
                </div>
                <button class='highlight cornerBR' onClick={() => setArena({ ...arena(), show: false })} style={{ color: 'red' }}>X</button>
            </>}>
                <div class='center creature-heading moisten' style={style}>
                    <p style={{ color: 'gold', margin: '8px 0', 'font-size': '2em' }}>{arena().win ? 'You Win' : 'You Lose'}</p>
                    <h1 style={{ margin: '8px 0' }}><span style={{ color: '#fdf6d8' }}>Opponents Chosen:</span> {arena().enemies.length}</h1>
                    <For each={arena().enemies}>{(enemy) => {
                        return (
                            <div style={{ color: masteryColor(enemy.mastery) }}>Level {enemy.level} - {enemy.mastery.charAt(0).toUpperCase() + enemy.mastery.slice(1)}</div>
                        )
                    }}</For>
                    <h1 style={{ margin: '8px 0' }}><span style={{ color: '#fdf6d8' }}>Wager:</span> {arena().wager.gold}g {arena().wager.silver}s</h1>
                    <p class='gold' style={{ margin: '0 auto', 'font-size': '1.25em' }}>
                        {arena().win ? `+${roundToTwoDecimals(arena().wager.gold * arena().wager.multiplier)}g` : `-${arena().wager.gold}g`} <span style={{ color: '#fdf6d8' }}>{arena().win ? `+${roundToTwoDecimals(arena().wager.silver * arena().wager.multiplier)}s` : `-${arena().wager.silver}s`}</span>
                    </p>
                    <Show when={game().lootDrops.length > 0}>
                        <For each={game().lootDrops}>
                            {((lootDrop: Equipment) => {
                                return <LootDrop lootDrop={lootDrop} setShow={setShow} setLootDrop={setLootDrop} />
                            })}
                        </For>
                    </Show>
                </div>
                <Show when={show()}>
                    <div class='modal' onClick={() => setShow(!show())} style={{ 'z-index': 3 }}>
                        <ItemModal item={lootDrop()} stalwart={false} caerenic={false} />
                    </div>
                </Show> 
                <button class='highlight cornerBR' onClick={() => clearWager()}>Settle Wager</button>
            </Show>
        </div>
    </Show>
};