import { Accessor } from 'solid-js';
import { Combat } from '../stores/combat';
// import { useResizeListener } from '../utility/dimensions';

export default function CombatText({ combat, combatHistory }: { combat: Accessor<Combat>, combatHistory: Accessor<string> }) {
    // const dimensions = useResizeListener();

    return (
        <div class='combatText' 
        // style={dimensions().ORIENTATION === 'landscape' ? { 
        //     position: 'absolute', left: '25vw', height: '30vh', width: '50vw', top: '60vh', margin: 'auto 0', 
        //     'text-align': 'center', 'align-items': 'center', 'justify-content': 'center', overflow: 'scroll',
        //     'background-color': '#000', 'border': '0.15em solid #FFC700', 'border-radius': '0.25em', 'box-shadow': '0 0 0.25em #FFC700',
        //     'white-space': 'pre', 
        // } : { 
        //     position: 'absolute', top: '50vh', 'align-items': 'center', 'justify-content': 'center', overflow: 'scroll' 
        // }}
        >
            <div style={{ 'text-wrap': 'balance', margin: '3%' }}>
                <div style={{ 'text-wrap': 'balance', 'z-index': 1 }} innerHTML={combatHistory()} />
                <div class='center creature-heading'>
                {combat().combatTimer && <p class='gold' style={{ 'text-wrap': 'balance', 'z-index': 1, 'font-size': '0.75em' }}>Combat Timer: {combat().combatTimer}</p>}
                </div>
            </div> 
        </div>
    );
};
