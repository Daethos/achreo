import { Accessor, createEffect, createSignal } from 'solid-js';
import { Combat } from '../stores/combat';
import { useResizeListener } from '../utility/dimensions';

export default function CombatText({ combat }: { combat: Accessor<Combat> }) {
    const dimensions = useResizeListener();
    const [combatHistory, setCombatHistory] = createSignal<string>(
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
        setCombatHistory(combatHistory + "\n" + result);
        return result;
    };

    createEffect(() => {
        text();   
    });

    return (
        <div style={dimensions().ORIENTATION === 'landscape' ? { top: '30%', flex: 1, 'align-items': 'center', 'justify-content': 'center', overflow: 'scroll' } : 
            { top: '50%', flex: 1, 'align-items': 'center', 'justify-content': 'center', overflow: 'scroll' }}>
                {/* <View >
                    <p style={styles.basicText}>{combatHistory}</p>
                </View> */}
            <img src={'../assets/gui/message_window.png'} alt="message window" />
            {/* <p style={[styles.basicText, styles.center, styles.cinzelRegular, { 
                position: 'absolute', fontSize: 12, width: '90%', height: '100%', borderColor: 'gold', borderWidth: 1
            }]}>
                {combatHistory}
            </p> */}
            <p style={{ 'font-size': '0.75em', border: '0.15em solidgold', flex: 1,
                // dimensions().ORIENTATION === 'landscape' ? { width: '50%', maxHeight: 125 } : { width: '90%', maxHeight: 175 }
            }}>
                This is where the combat text will be displayed. Which combatant perform which action, failures and sucesses.
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
                <span style={{ color: 'purple' }}>dramatic</span> effect and <span style={{ color: 'gold'}}>punch</span> to reading the combat logs.
            </p>
        </div>
    );
};
