import { Accessor, createEffect, createSignal, Setter, Show } from 'solid-js';
import { Combat } from '../stores/combat';
import Settings from '../models/settings';
import { EventBus } from '../game/EventBus';
export default function CombatText({ settings, combat, combatHistory, editShow, setEditShow }: { settings: Accessor<Settings>; combat: Accessor<Combat>, combatHistory: Accessor<string>, editShow: Accessor<boolean>, setEditShow: Setter<boolean> }) {
    const [edit, setEdit] = createSignal({
        top: settings()?.combatText?.top || '40vh',
        left: settings()?.combatText?.left || '20vw',
        height: settings()?.combatText?.height || '50vh',
        width: settings()?.combatText?.width || '60vw',
    });
    createEffect(() => {
        if (!settings().combatText) return;
        setEdit({...settings().combatText});
    });
    function editCombatText(key: string, value: string): void {
        // if (key === 'left') value = '20vw';
        const update = {
            ...settings(),
            combatText: {
                ...edit(),
                [key]: value
            }
        };
        console.log(update, 'Updating Settings');
        EventBus.emit('save-settings', update);
    };
    return <div>
        <div class='combatText' style={{...edit(), 'border': '0.1em solid #FFC700', 'border-radius': '0.25em', 'box-shadow': '0 0 0.5em #FFC700'}}>
        <div style={{ 'text-wrap': 'balance', margin: '3%' }}> 
            <div style={{ 'z-index': 1 }} innerHTML={combatHistory()} />
            <div class='center creature-heading'>
                {combat().combatTimer && <p class='gold' style={{ 'z-index': 1, 'font-size': '0.75em' }}>Combat Timer: {combat().combatTimer}</p>}
            </div>
        </div> 
        </div>
        <Show when={editShow()}>
            <div class='modal'>
            <div class='border creature-heading center superCenter' style={{ padding: '2.5%', width: '30vw' }}>
                <h1>Top</h1>
                <button class='highlight' onClick={() => editCombatText('top', 
                    `${Math.max(Number(edit().top.split('vh')[0]) - 1, 0)}vh`)}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().top.split('vh')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('top', 
                    `${Math.min(Number(edit().top.split('vh')[0]) + 1, 100)}vh`
                )}>+</button>
                <h1>Left</h1>
                <button class='highlight' onClick={() => editCombatText('left', 
                    `${Math.max(Number(edit().left.split('vw')[0]) - 1, 0)}vw`
                )}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().left.split('vw')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('left', 
                    `${Math.min(Number(edit().left.split('vw')[0]) + 1, 100)}vw`
                )}>+</button>
                <h1>Height</h1>
                <button class='highlight' onClick={() => editCombatText('height', 
                    `${Math.max(Number(edit().height.split('vh')[0]) - 1, 10)}vh`
                )}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().height.split('vh')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('height', 
                    `${Math.min(Number(edit().height.split('vh')[0]) + 1, 100)}vh`
                )}>+</button>
                <h1>Width</h1>
                <button class='highlight' onClick={() => editCombatText('width', 
                    `${Math.max(Number(edit().width.split('vw')[0]) - 1, 10)}vw`
                )}>-</button>
                <span style={{ margin: '0 10%' }}>
                {edit().width.split('vw')[0]}%
                </span>
                <button class='highlight' onClick={() => editCombatText('width', 
                    `${Math.min(Number(edit().width.split('vw')[0]) + 1, 100)}vw`
                )}>+</button>
            <button class='highlight cornerTR' style={{ color: 'red' }} onClick={() => setEditShow(false)}>X</button>
            </div>
            </div>
        </Show>
    </div>;
};