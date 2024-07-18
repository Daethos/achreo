import { Accessor, For, JSX, Match, Show, Switch } from 'solid-js';
import { EventBus } from '../game/EventBus';
import { borderColor } from '../utility/styling'; 
import { useResizeListener } from '../utility/dimensions';
import { GameState } from '../stores/game';
import { Combat } from '../stores/combat';

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

export default function CombatSettings({ combat, game }: { combat: Accessor<Combat>; game: Accessor<GameState>; }) {
    const prayers = ['Buff', 'Heal', 'Debuff', 'Damage', 'Avarice', 'Denial', 'Dispel', 'Silence'];
    const dimensions = useResizeListener();
    const mapTypes = (types: any) => {
        let newTypes = []; 
        for (let i = 0; i < types.length; i++) {
            newTypes.push(
                <p style={{ color: borderColor(types[i]), display: 'inline-block', margin: '0%', 'text-shadow': '0.065em 0.065em 0.065em #fdf6d8', 'font-size': '1.25em' }}>
                    {`-> ${types[i]} <- ${(i + 1) % 4 === 0 ? '\n\n' : ''}`}    
                </p>
            );
        };
        return newTypes;
    };
    const highlightStyle: JSX.CSSProperties = {
        color: 'gold', 'font-size': '1.15em', 'font-weight': 700, 'text-align': 'center', margin: '3%'
    };
    const optionStyle: JSX.CSSProperties = {
        color: '#fdf6d8', 'font-size': '0.9em', 'font-weight': 700, 'text-align': 'center'
    };
    const Buttons = [
        {direction: 'left', symbol: '<-'}, 
        {direction:'up', symbol: '^'}, 
        {direction:'down', symbol:'v'},
        {direction:'right', symbol:'->'}, 
    ];
    function handleButton(direction: string) {
        if (direction === 'up' || direction === 'down') {
            if (game().selectedHighlight === 'Prayer') {
                const index = direction === 'up' ? -1 : 1;
                const newIndex = (game().selectedPrayerIndex + index + prayers.length) % prayers.length;
                EventBus.emit('selectPrayer', { index: newIndex, highlight: 'Prayer' });
                EventBus.emit('changePrayer', prayers[newIndex]);
            } else if (game().selectedHighlight === 'Damage') {
                const index = direction === 'up' ? -1 : 1;
                const newIndex = (game().selectedDamageTypeIndex + index + (combat()?.weapons?.[0]?.damageType?.length ?? 0)) % (combat()?.weapons?.[0]?.damageType?.length ?? 0) as number;
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
        if (direction === 'left') {
            EventBus.emit('useHighlight', highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].prev);
        };
        if (direction === 'right') {
            EventBus.emit('useHighlight', highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].next);
        };
    };

    function buttonText(direction: string, highlight: string | undefined) {
        return direction === 'up' && highlight !== 'Weapon' ? 'Left' : direction === 'up' ? 'Up' 
        : direction === 'down' && highlight !== 'Weapon' ? 'Right' : direction === 'down' ? 'Down' 
        : direction === 'left' ? `${highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].prev}` 
        : `${highlightCycle[game().selectedHighlight as keyof typeof highlightCycle].next}`;
    };

    return (
        <div class='center combatSettings' style={dimensions().ORIENTATION === 'landscape' ? { height: '40%', width: "50%", top: '50%', left: '25%', background: '#000', 'border': '0.1em solid #FFC700', 'border-radius': '0.25em', 'box-shadow': '0 0 0.1em 0.1em #FFC700' }: { top: '70%', left: '10%' }}>
            <div class='center shadow' style={{ display: 'flex', 'flex-direction': 'row', 'margin-top': '1%', width: '100%', 'z-index': 1 }}>
            <For each={Buttons}>{((button) => {
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
                        <p class='shadow' style={highlightStyle}>Damage Style: {combat()?.weapons?.[0]?.damageType?.[game().selectedDamageTypeIndex]}</p>
                        <p style={optionStyle}>{mapTypes(combat()?.weapons?.[0]?.damageType)}</p>
                    </div>
                </Match>
                <Match when={game().selectedHighlight === 'Prayer'}>
                    <div class='center'>
                        <p class='shadow' style={highlightStyle}>Current Prayer: {prayers[game().selectedPrayerIndex]}</p>
                        <div style={optionStyle}>{mapTypes(prayers)}</div>
                    </div>
                </Match>
                </Switch>
            </Show>
            <br />
        </div>
    );
};