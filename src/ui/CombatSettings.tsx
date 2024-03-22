import { For, Match, Show, Switch } from 'solid-js';
import { EventBus } from '../game/EventBus';
import { borderColor } from '../utility/styling'; 
import { useResizeListener } from '../utility/dimensions';

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

interface Props {
    damageType: string[];
    weapons: any[];
    scrollEnabled: boolean;
    selectedDamageTypeIndex: number;
    selectedPrayerIndex: number;
    selectedHighlight: string;
};

export default function CombatSettings({ damageType, weapons, scrollEnabled, selectedDamageTypeIndex, selectedPrayerIndex, selectedHighlight }: Props) {
    // const [prayers, setPrayers] = createSignal([ 'Buff', 'Heal', 'Debuff', 'Damage', 'Avarice', 'Denial', 'Dispel', 'Silence']);
    const prayers = ['Buff', 'Heal', 'Debuff', 'Damage', 'Avarice', 'Denial', 'Dispel', 'Silence'];
    const dimensions = useResizeListener();
    
    const mapTypes = (types: any) => {
        let newTypes = []; 
        for (let i = 0; i < types.length; i++) {
            newTypes.push(
                <p style={{ color: borderColor(types[i]) }}>
                    {/* {types[i]}{' <-> '}{types[i] === types[types.length - 1] ? types[0] : ''} */}
                    {types[i] !== types[types.length - 1] ? `${types[i]} <-> ` : types[i]}
                </p>
            );
        };
        return newTypes;
    };

    const highlightStyle = {
        color: 'gold', 'font-size': '1.25em', 'font-weight': 700
    };
    const optionStyle = {
        color: '#fdf6d8', 'font-size': '1em', 'font-weight': 700
    };

    const Buttons = [
        {direction: 'left', symbol: '<-'}, 
        {direction:'up', symbol: '^'}, 
        {direction:'down', symbol:'v'},
        {direction:'right', symbol:'->'}, 
    ];

    function handleButton(direction: string) {
        if (direction === 'up' || direction === 'down') {
            if (selectedHighlight === 'Prayer') {
                const index = direction === 'up' ? -1 : 1;
                const newIndex = (selectedPrayerIndex + index + prayers.length) % prayers.length;
                EventBus.emit('selectPrayer', { index: newIndex, highlight: 'Prayer' });
                EventBus.emit('changePrayer', prayers[newIndex]);
            } else if (selectedHighlight === 'Damage') {
                const index = direction === 'up' ? -1 : 1;
                const newIndex = (selectedDamageTypeIndex + index + damageType.length) % damageType.length;
                
                EventBus.emit('selectDamageType', { index: newIndex, highlight: 'Damage' });
                EventBus.emit('changeDamageType', damageType[newIndex]);
            } else if (selectedHighlight === 'Weapon') {    
                let newIndex = direction === 'up' ? 1 : 2;
                if (!weapons[newIndex]) return;
                let one: any[] = [];
                if (weapons.length === 3) one = [weapons?.[newIndex], weapons?.[0], weapons?.[2]._id === weapons?.[newIndex]._id ? weapons?.[1] : weapons?.[2]];
                if (weapons.length === 2) one = [weapons?.[newIndex], weapons?.[0]];
                EventBus.emit('selectWeapon', { index: newIndex, highlight: 'Weapon' });
                EventBus.emit('changeWeapon', one);
            };
            EventBus.emit('weapon-order-sound');
        };
        if (direction === 'left') {
            EventBus.emit('useHighlight', highlightCycle[selectedHighlight as keyof typeof highlightCycle].prev);
        };
        if (direction === 'right') {
            EventBus.emit('useHighlight', highlightCycle[selectedHighlight as keyof typeof highlightCycle].next);
        };
    };

    function buttonText(direction: string) {
        return direction === 'up' ? 'Up' 
        : direction === 'down' ? 'Down' 
        : direction === 'left' ? `<< ${highlightCycle[selectedHighlight as keyof typeof highlightCycle].prev}` 
        : `${highlightCycle[selectedHighlight as keyof typeof highlightCycle].next} >>`;
    };
    // combatSettings { position: "absolute", 'border': '0.15em solid gold', 'background-color': 'transparent', 'z-index': 1 }
    return (
        <div class='center combatSettings' style={dimensions().ORIENTATION === 'landscape' ? {
                width: "50%", top: '50%', left: '23%', 
            }: {
                top: '70%', left: '10%'
        }}>
            <div class='mt-5' style={{ display: 'flex', 'flex-direction': 'row', width: '100%', 'z-index': 1 }}>
            <For each={Buttons}>{((button) => {
                return (
                    <button class='gold m-5' style={{ 'z-index': 1 }} onClick={() => handleButton(button.direction)}>
                        {buttonText(button.direction)}
                    </button>
                )
            })}</For>
            </div>
            <br />
            <Show when={scrollEnabled}>
                <Switch>
                <Match when={selectedHighlight === 'Weapon'}>
                    <div>
                        <p style={highlightStyle}>Main Weapon: {weapons?.[0]?.name}</p>
                        <br /><br />
                        <p style={optionStyle}>Up{' ->> '} {weapons?.[1]?.name} {' <<- '}Up</p>
                        <br /><br />
                        <Show when={weapons?.[2]}><p style={optionStyle}>Down{' ->> '} {weapons?.[2]?.name} {' <<- '}Down</p></Show> 
                    </div>
                </Match>
                <Match when={selectedHighlight === 'Damage'}>
                    <div>
                        <p style={highlightStyle}>Damage Style: {damageType[selectedDamageTypeIndex]}</p>
                        <br /><br />
                        <p style={optionStyle}>{mapTypes(damageType)}</p>
                    </div>
                </Match>
                <Match when={selectedHighlight === 'Prayer'}>
                    <div>
                        <p style={highlightStyle}>Prayer: {prayers[selectedPrayerIndex]}</p>
                        <br /><br />
                        <p style={optionStyle}>{mapTypes(prayers)}</p>
                    </div>
                </Match>
                </Switch>
            </Show>
            <br />
        </div>
    );
};