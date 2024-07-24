import { Accessor } from 'solid-js';
import { Combat } from '../stores/combat';
export default function CombatText({ combat, combatHistory }: { combat: Accessor<Combat>, combatHistory: Accessor<string> }) {
    return <div class='combatText'>
        <div style={{ 'text-wrap': 'balance', margin: '3%' }}>
            <div style={{ 'text-wrap': 'balance', 'z-index': 1 }} innerHTML={combatHistory()} />
            <div class='center creature-heading'>
            {combat().combatTimer && <p class='gold' style={{ 'text-wrap': 'balance', 'z-index': 1, 'font-size': '0.75em' }}>Combat Timer: {combat().combatTimer}</p>}
            </div>
        </div> 
    </div>;
};