import { useResizeListener } from "../utility/dimensions";

export default function StaminaModal() {
    const dimensions = useResizeListener();
    return (
        <div class="border superCenter" style={{ width: dimensions()?.ORIENTATION === 'landscape' ? '50%' : '75%' }}> 
        <div class='creature-heading wrap' style={{ height: '100%' }}>
                <h1 style={{ 'text-align': 'center', width: '100%' }}>Stamina</h1>
            <svg height="5" width="100%" class="tapered-rule" style={{ 'margin-bottom': '3%', 'margin-top': '2%' }}>
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div class='center'>
                <h2>Your body and mind's capacity to continue. An amalgamation of your Constitution, Agility, and Caeren. Governs the ability to perform a physical or special action.</h2>
                <p class='gold' style={{ 'font-size': '0.75em' }}>
                    Stamina recovery is paused for 1s, cumulatively, for every action. Increasing your stamina also increases the rate of recovery.
                </p>
            </div> 
        </div>
        </div>
    );
};