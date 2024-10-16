import { Accessor, createSignal, For, Setter, Show } from "solid-js";
import { ARENA_ENEMY, fetchArena } from "../utility/enemy";
import Ascean from "../models/ascean";
import { EventBus } from "../game/EventBus";
import { v4 as uuidv4 } from 'uuid';

export default function Arena({ arena, ascean, setArena, base }: { arena: Accessor<{ show: boolean; enemies: ARENA_ENEMY[]; }>; ascean: Accessor<Ascean>; setArena: Setter<{ show: boolean; enemies: ARENA_ENEMY[] }>; base: boolean;}) {
    const [selector, setSelector] = createSignal<ARENA_ENEMY>({ level: Math.min((ascean().level % 2 === 0 ? ascean().level : ascean().level + 1), 8), mastery: 'constitution', id: '' });
    function createArena() {
        EventBus.emit('alert', { header: 'Duel Commencing', body: `You have started a duel against ${arena().enemies.length} of various might. Good luck.` });
        const complete = fetchArena(arena().enemies);
        EventBus.emit('create-arena', complete);
        setArena({ enemies: [], show: false });
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
    return <div>
        <Show when={arena().show}>
            <div class='modal'>
            <div class='center creature-heading' style={{ position: 'absolute',left: '20%',top: '20%',height: '70%',width: '60%',background: '#000',border: '0.1em solid gold','border-radius': '0.25em','box-shadow': '0 0 0.5em #FFC700',overflow: 'scroll','text-align': 'center', 'scrollbar-width':'none' }}>
                <h1>{arena().enemies.length} Opponents Selected</h1>
                {arena().enemies.length > 0 && <button class='highlight animate' onClick={() => createArena()} style={{ 'font-size': '1.25em' }}>Start the Eulex</button>}
                <For each={arena().enemies}>{(enemy) => {
                    return (
                        <div>Level {enemy.level} - {enemy.mastery.charAt(0).toUpperCase() + enemy.mastery.slice(1)} - <button class='highlight' onClick={() => opponentRemove(enemy)}>Remove</button></div>
                    )
                }}</For>
                <div>
                    <button class='highlight' style={{ 'font-size': '1.1em' }} onClick={() => opponentAdd()}>Add ({selector().level} | {selector().mastery.charAt(0).toUpperCase() + selector().mastery.slice(1)})</button>
                </div>
                <div>
                    <p style={{ color: 'gold' }}>Level ({selector().level})</p>
                    <button class='highlight' onClick={() => selectOpponent('level', Math.max(selector().level - 2, 2))}>-</button>
                    <button class='highlight' onClick={() => selectOpponent('level', Math.min(selector().level + 2, 8))}>+</button>
                </div>
                <div><p style={{ color: 'gold' }}>Mastery ({selector().mastery.charAt(0).toUpperCase() + selector().mastery.slice(1)})</p>
                    <button class='highlight' onClick={() => selectOpponent('mastery', 'constitution')}>Con</button>
                    <button class='highlight' onClick={() => selectOpponent('mastery', 'strength')}>Str</button>
                    <button class='highlight' onClick={() => selectOpponent('mastery', 'agility')}>Agi</button>
                    <button class='highlight' onClick={() => selectOpponent('mastery', 'achre')}>Ach</button>
                    <button class='highlight' onClick={() => selectOpponent('mastery', 'caeren')}>Caer</button>
                    <button class='highlight' onClick={() => selectOpponent('mastery', 'kyosir')}>Kyo</button>
                </div>
            </div>
            <button class='highlight cornerBR' onClick={() => setArena({ ...arena(), show: false })} style={{ color: 'red' }}>X</button>
            </div>
        </Show>
    </div>
};