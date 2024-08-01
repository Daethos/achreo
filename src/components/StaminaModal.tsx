export default function StaminaModal() {
    return <div class="border superCenter" style={{ width: '50%', 'border-color': 'green' }}> 
        <div class='creature-heading wrap' style={{ height: '100%' }}>
                <h1 style={{ 'text-align': 'center', width: '100%' }}>Stamina</h1>
            <svg height="5" width="100%" class="tapered-rule" style={{ 'margin-bottom': '3%', 'margin-top': '2%', 'stroke': 'green' }}>
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div class='center'>
                <h2>Your body's capacity to exert and continue. An amalgamation of your Constitution, Strength, and Agility. Governs the ability to perform a physical action.</h2>
                <p class='gold' style={{ 'margin-bottom': '5%', 'font-size': '0.75em' }}>
                    Stamina recovery is paused for 1s, cumulatively, for every action. Increasing your stamina also increases the rate of recovery.
                </p>
            </div> 
        </div>
    </div>;
};