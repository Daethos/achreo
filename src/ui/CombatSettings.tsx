import { Accessor, For, JSX, Match, Setter, Show, Switch, createEffect, createSignal, onMount } from 'solid-js';
import { EventBus } from '../game/EventBus';
import { borderColor } from '../utility/styling'; 
import { GameState } from '../stores/game';
import { Combat } from '../stores/combat';
import Settings from '../models/settings';
import { svg } from '../utility/settings';
const BUTTONS = [
    {direction: 'left', symbol: '<-'}, 
    {direction:'up', symbol: '^'}, 
    {direction:'down', symbol:'v'},
    {direction:'right', symbol:'->'}, 
];
const highlightCycle = { 
    Weapon: {
        next: 'Damage',
        prev: 'Prayer'
    },
    Damage: {
        next: 'Prayer',
        prev: 'Weapon'
    },
    Prayer: {
        next: 'Weapon',
        prev: 'Damage'
    }
};
const PRAYERS = ['Buff', 'Heal', 'Debuff', 'Damage', 'Avarice', 'Denial', 'Dispel', 'Insight', 'Silence'];

export default function CombatSettings({ combat, game, settings, editShow, setEditShow }: { combat: Accessor<Combat>; game: Accessor<GameState>; settings: Accessor<Settings>; editShow: Accessor<boolean>; setEditShow: Setter<boolean>; }) {
    const [edit, setEdit] = createSignal({
        top: settings()?.combatSettings?.top || '40%',
        left: settings()?.combatSettings?.left || '25%',
        height: settings()?.combatSettings?.height || '50%',
        width: settings()?.combatSettings?.width || '50%',
    });
    createEffect(() => {
        if (!settings().combatSettings) return;
        setEdit({...settings().combatSettings});
    });
    function editCombatText(key: string, value: string): void {
        const update = {
            ...settings(),
            combatSettings: {
                ...edit(),
                [key]: value
            }
        };
        EventBus.emit('save-settings', update);
    };
    const prayer = (el: string) => el === combat().playerBlessing ?  true : false;
    onMount(() => EventBus.emit('selectPrayer', { index: PRAYERS.findIndex(prayer), highlight: game().selectedHighlight }));
    const mapTypes = (types: any) => {
        let newTypes = []; 
        for (let i = 0; i < types.length; i++) {
            newTypes.push(
                <p style={{ color: borderColor(types[i]), display: 'inline-block', margin: '0%', 'text-shadow': '0.025em 0.025em 0.025em #fdf6d8', 'font-size': '1.25em' }}>
                    {`-> ${types[i]} <- ${(i + 1) % 4 === 0 ? '\n\n' : ''}`}    
                </p>
            );
        };
        return newTypes;
    };
    const highlightStyle: JSX.CSSProperties = {color: 'gold', 'font-size': '1.15em', 'font-weight': 700, 'text-align': 'center', margin: '3%'};
    const optionStyle: JSX.CSSProperties = {color: '#fdf6d8', 'font-size': '0.9em', 'font-weight': 700, 'text-align': 'center'};
    function handleButton(direction: string) {
        if (direction === 'up' || direction === 'down') {
            if (game().selectedHighlight === 'Prayer') {
                const index = direction === 'up' ? -1 : 1;
                const newIndex = (game().selectedPrayerIndex + index + PRAYERS.length) % PRAYERS.length;
                EventBus.emit('selectPrayer', { index: newIndex, highlight: 'Prayer' });
                EventBus.emit('changePrayer', PRAYERS[newIndex]);
            } else if (game().selectedHighlight === 'Damage') {
                const index = direction === 'up' ? -1 : 1;
                const newIndex = (game().selectedDamageTypeIndex + index + (combat()?.weapons?.[0]?.damageType?.length || 0)) % (combat()?.weapons?.[0]?.damageType?.length || 0) as number;
                EventBus.emit('selectDamageType', { index: newIndex, highlight: 'Damage' });
                EventBus.emit('changeDamageType', combat()?.weapons?.[0]?.damageType?.[newIndex]);
            } else if (game().selectedHighlight === 'Weapon') {    
                let newIndex = direction === 'up' ? 1 : 2;
                if (!combat()?.weapons[newIndex]) return;
                let one: any[] = [];
                if (combat()?.weapons?.[2]?._id === combat()?.weapons?.[newIndex]?._id) { // Down
                    one = [combat()?.weapons?.[newIndex], combat()?.weapons?.[0], combat()?.weapons?.[1]];
                } else { // Up
                    one = [combat()?.weapons?.[newIndex], combat()?.weapons?.[2], combat()?.weapons?.[0]];
                };
                EventBus.emit('selectWeapon', { index: newIndex, highlight: 'Weapon' });
                EventBus.emit('changeWeapon', one);
            };
            EventBus.emit('weapon-order-sound');
        };
        if (direction === 'left') EventBus.emit('useHighlight', highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].prev);
        if (direction === 'right') EventBus.emit('useHighlight', highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].next);
    };
    function buttonText(direction: string, highlight: string | undefined) {
        return direction === 'up' && highlight !== 'Weapon' ? 'Left' : direction === 'up' ? 'Up' 
        : direction === 'down' && highlight !== 'Weapon' ? 'Right' : direction === 'down' ? 'Down' 
        : direction === 'left' ? `${highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].prev}` 
        : `${highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].next}`;
    };
    return <div>
        <button class='highlight' onClick={() => setEditShow(!editShow())} style={{ top: `${Number(edit().top.split('%')[0]) - 12.5}%`, left: `${Number(edit().left.split('%')[0]) - 1.25}%`, position: 'absolute', color: 'gold', transform: 'scale(0.75)' }}>{svg('UI')}</button>
        <div class='center combatSettings' style={{ ...edit(), background: '#000', 'border': '0.1em solid #FFC700', 'border-radius': '0.25em', 'box-shadow': '0 0 0.5em #FFC700' }}>
            <div class='center shadow' style={{ display: 'flex', 'flex-direction': 'row', 'margin-top': '1%', width: '100%', 'z-index': 1 }}>
            <For each={BUTTONS}>{((button) => {
                return <button class='highlight gold' style={{ 'z-index': 1 }} onClick={() => handleButton(button.direction)}>
                    {buttonText(button.direction, game().selectedHighlight)}
                </button>;
            })}</For>
            </div>
            <Show when={game().scrollEnabled}>
                <Switch>
                <Match when={game().selectedHighlight === 'Weapon'}>
                    <div>
                        <p class='shadow' style={highlightStyle}>Main Weapon: {combat()?.weapons?.[0]?.name}</p>
                        <p style={optionStyle}>Up{' ->> '} {combat()?.weapons?.[1]?.name} {' <<- '}Up</p>
                        <Show when={combat()?.weapons?.[2]}><p class='shadow' style={optionStyle}>Down{' ->> '} {combat()?.weapons?.[2]?.name} {' <<- '}Down</p></Show> 
                    </div>
                </Match>
                <Match when={game().selectedHighlight === 'Damage'}>
                    <div>
                        <p class='shadow' style={highlightStyle}>Damage Style: <span style={{ color: borderColor(combat()?.weapons?.[0]?.damageType?.[game().selectedDamageTypeIndex] as string) }}>{combat()?.weapons?.[0]?.damageType?.[game().selectedDamageTypeIndex]}</span></p>
                        <p style={optionStyle}>{mapTypes(combat()?.weapons?.[0]?.damageType)}</p>
                    </div>
                </Match>
                <Match when={game().selectedHighlight === 'Prayer'}>
                    <div class='center'>
                        <p class='shadow' style={highlightStyle}>Current Prayer: <span style={{ color: borderColor(PRAYERS[game().selectedPrayerIndex]), 'text-shadow': '0.025em 0.025em 0.025em #fdf6d8' }}>{PRAYERS[game().selectedPrayerIndex]}</span></p>
                        <div style={optionStyle}>{mapTypes(PRAYERS)}</div>
                    </div>
                </Match>
                </Switch>
            </Show>
        </div>
        <Show when={editShow()}>
            <div class='modal'>
            <div class='border creature-heading center superCenter' style={{ padding: '2.5%', width: '30vw' }}>
                <h1>Top</h1>
                <button class='highlight' onClick={() => editCombatText('top', 
                    `${Math.max(Number(edit().top.split('%')[0]) - 1, 0)}%`)}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().top.split('%')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('top', 
                    `${Math.min(Number(edit().top.split('%')[0]) + 1, 100)}%`
                )}>+</button>
                <h1>Left</h1>
                <button class='highlight' onClick={() => editCombatText('left', 
                    `${Math.max(Number(edit().left.split('%')[0]) - 1, 0)}%`
                )}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().left.split('%')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('left', 
                    `${Math.min(Number(edit().left.split('%')[0]) + 1, 100)}%`
                )}>+</button>
                <h1>Height</h1>
                <button class='highlight' onClick={() => editCombatText('height', 
                    `${Math.max(Number(edit().height.split('%')[0]) - 1, 10)}%`
                )}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().height.split('%')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('height', 
                    `${Math.min(Number(edit().height.split('%')[0]) + 1, 100)}%`
                )}>+</button>
                <h1>Width</h1>
                <button class='highlight' onClick={() => editCombatText('width', 
                    `${Math.max(Number(edit().width.split('%')[0]) - 1, 10)}%`
                )}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().width.split('%')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('width', 
                    `${Math.min(Number(edit().width.split('%')[0]) + 1, 100)}%`
                )}>+</button>
            <button class='highlight cornerTR' style={{ color: 'red' }} onClick={() => setEditShow(false)}>X</button>
            </div>
            </div>
        </Show>
    </div>;
};