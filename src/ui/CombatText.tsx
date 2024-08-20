import { Accessor } from 'solid-js';
import { Combat } from '../stores/combat';
export default function CombatText({ combat, combatHistory }: { combat: Accessor<Combat>, combatHistory: Accessor<string> }) {
    console.log(combatHistory());
    return <div class='combatText' style={{ left: '20vw', top: '50vh', height: '40vh', width: '60vw' }}>
        <div style={{ 'text-wrap': 'balance', margin: '3%' }}> 
            <div style={{ 'z-index': 1 }} innerHTML={combatHistory()} />
            <div class='center creature-heading'>
                {combat().combatTimer && <p class='gold' style={{ 'z-index': 1, 'font-size': '0.75em' }}>Combat Timer: {combat().combatTimer}</p>}
            </div>
        </div> 
    </div>;
};