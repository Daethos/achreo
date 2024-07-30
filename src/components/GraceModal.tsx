export default function GraceModal() {
    return <div class="border superCenter" style={{ width: '50%', 'border-color': 'blue' }}> 
        <div class='creature-heading wrap' style={{ height: '100%' }}>
                <h1 style={{ 'text-align': 'center', width: '100%' }}>Grace</h1>
            <svg height="5" width="100%" class="tapered-rule" style={{ 'margin-bottom': '3%', 'margin-top': '2%', 'fill': '', 'stroke': 'blue' }}>
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div class='center'>
                <h2>Your body and mind's capacity to continue. An amalgamation of your Achre, Caeren, and Kyosir. Governs the ability to perform a special action.</h2>
                <p class='gold' style={{ 'font-size': '0.75em' }}>
                    Grace recovery is paused for 1s, cumulatively, for every action. Increasing your grace also increases the rate of recovery.
                </p>
            </div> 
        </div>
    </div>;
};