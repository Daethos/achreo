import { Accessor, createEffect, createMemo, createSignal } from 'solid-js';
import { Combat } from '../stores/combat';
import { useResizeListener } from '../utility/dimensions';

export default function CombatText({ combat }: { combat: Accessor<Combat> }) {
    const dimensions = useResizeListener();
    const [combatHistory, setCombatHistory] = createSignal<any>(
        "This is where the combat text will be displayed. Which combatant perform which action, failures and sucesses. \n\n" +
        "Prayers and Effects would bubble up here as well. They can benevolent or pernicious in nature. \n\n" +
        "At the moment the only thing missed by tech is the color of the text built in because that would need to be parsed, and the timestamps to view with precision when actions occurred. \n\n" +
        "And perhaps I should prase through to highlight critical and glancing blows. This might add a much needed dramatic effect and punch to reading the combat logs. \n\n" +
        "dramatic effect and punch to reading the combat logs"
    );
    const text = () => {
        let result = "";
        if (combat().playerStartDescription) result += combat().playerStartDescription + "\n";
        if (combat().computerStartDescription) result += combat().computerStartDescription + "\n";
        if (combat().playerSpecialDescription) result += combat().playerSpecialDescription + "\n";
        if (combat().computerSpecialDescription) result += combat().computerSpecialDescription + "\n";
        if (combat().playerActionDescription) result += combat().playerActionDescription + "\n";
        if (combat().computerActionDescription) result += combat().computerActionDescription + "\n";
        if (combat().playerInfluenceDescription) result += combat().playerInfluenceDescription + "\n";
        if (combat().playerInfluenceDescriptionTwo) result += combat().playerInfluenceDescriptionTwo + "\n";
        if (combat().computerInfluenceDescription) result += combat().computerInfluenceDescription + "\n";
        if (combat().computerInfluenceDescriptionTwo) result += combat().computerInfluenceDescriptionTwo + "\n";
        if (combat().playerDeathDescription) result += combat().playerDeathDescription + "\n";
        if (combat().computerDeathDescription) result += combat().computerDeathDescription + "\n";
        if (combat().combatTimer) result += `Combat Timer: ${combat().combatTimer} \n`;
        // setCombatHistory(combatHistory() + "\n" + result);
        result += combatHistory();
        const history = <>
                This is where the combat text will be displayed. Which combatant perform what action, its failures and sucesses, and <span style={{ color: '#fdf6d8' }}>othernature phenomena</span>.
                <br /><br />
                Prayers and Effects would <span style={{ color: 'green' }}>bubble up</span> here as well. They can <span style={{ color: 'gold' }}>benevolent</span> or <span style={{ color: '#800080' }}>pernicious</span> in nature.
                <br /><br />
                At the moment the only thing missed by tech is the <span style={{ color: 'teal' }}>color</span> of the text built in because that would need to be parsed, and the <span style={{ color: 'red' }}>timestamps</span> to view with precision when actions occurred.
                <br /><br />
                And perhaps I should parse through to highlight <span style={{ color: 'red' }}>critical</span> and <span style={{ color: 'blue' }}>glancing</span> blows. This might add a much needed 
                <span style={{ color: 'purple' }}>dramatic</span> effect and <span style={{ color: 'gold'}}>punch</span> to reading the combat logs.
                <br /><br />
                This is where the combat text will be displayed. Which combatant perform which action, failures and sucesses.
                <br /><br />
                Prayers and Effects would <span style={{ color: 'green' }}>bubble up</span> here as well. They can <span style={{ color: 'gold' }}>benevolent</span> or <span style={{ color: '#800080' }}>pernicious</span> in nature.
                <br /><br />
                At the moment the only thing missed by tech is the <span style={{ color: 'teal' }}>color</span> of the text built in because that would need to be parsed, and the <span style={{ color: 'red' }}>timestamps</span> to view with precision when actions occurred.
                <br /><br />
                And perhaps I should parse through to highlight <span style={{ color: 'red' }}>critical</span> and <span style={{ color: 'blue' }}>glancing</span> blows. This might add a much needed 
                <span style={{ color: 'purple' }}>dramatic</span> effect and <span style={{ color: 'gold'}}>punch</span> to reading the combat logs.</>
        console.log(result, 'result')
        return history;
    };

    const history = createMemo(() => text());

    return (
        <div style={dimensions().ORIENTATION === 'landscape' ? { 
            position: 'absolute', left: '25vw', height: '30vh', width: '50vw', top: '55vh', margin: 'auto 0', 'text-align': 'center', 'align-items': 'center', 'justify-content': 'center', overflow: 'scroll',
            'background-color': '#000', 'border': '0.15em solid #FFC700', 'border-radius': '0.25em', 'box-shadow': '0 0 0.5em #FFC700' 
            
        } : { 
            position: 'absolute', top: '50vh', 'align-items': 'center', 'justify-content': 'center', overflow: 'scroll' 
        }}>
            {/* <img src={'../assets/gui/message_window.png'} alt="message window" style={{ 
                position: 'fixed', bottom: '10vh', left: '15vw', // 'z-index': 0
            }} /> */}
            <div style={{ 'text-wrap': 'balance', margin: '5%' }}>
                <p class='gold' style={{ 'z-index': 1, 'font-size': '0.6em' }}>{history()}</p>
            </div> 
        </div>
    );
};
