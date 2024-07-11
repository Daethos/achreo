import { useResizeListener } from "../utility/dimensions";

export default function StaminaModal() {
    const dimensions = useResizeListener();
    return (
        <div class="border superCenter" style={{ width: dimensions()?.ORIENTATION === 'landscape' ? '50%' : '75%' }}> 
        <div class='wrap' style={{ height: '100%' }}>
            <div class='creature-heading' style={{ width: '100%'}}>
                <h1 style={{ 'text-align': 'center' }}>Stamina</h1>
            </div>
            <svg height="5" width="100%" class="tapered-rule" style={{ 'margin-bottom': '3%', 'margin-top': '2%' }}>
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div class='center'>
                An amalgamation of your Constitution, Strength, and Caeren. Its current value governs whether you can perform an action at that time. 
                <p class='gold' style={{ 'font-size': '0.75em' }}>
                    Stamina recovery is paused for 1s, cumulatively, for every action. Increasing your stamina also increases the rate of recovery.
                </p>
            </div> 
        </div>
        </div>
    );
};