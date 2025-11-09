export class Positioning {
    private scene: Phaser.Scene;
    private elements: { [key: string]: any } = {};
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createGUI();
    }
    
    private createGUI(): void {
        // Create container div
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: Arial;
            z-index: 1000;
            width: 250px;
        `;
        
        container.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">Position Tweaker</h3>
            <div>
                <label>Background X: <input type="range" id="bgX" min="-100" max="500" value="0"></label>
                <span id="bgXValue">0</span>
            </div>
            <div>
                <label>Background Y: <input type="range" id="bgY" min="-100" max="500" value="0"></label>
                <span id="bgYValue">0</span>
            </div>
            <div>
                <label>Button X: <input type="range" id="btnX" min="-100" max="500" value="0"></label>
                <span id="btnXValue">0</span>
            </div>
            <div>
                <label>Button Y: <input type="range" id="btnY" min="-100" max="500" value="0"></label>
                <span id="btnYValue">0</span>
            </div>
            <div>
                <label>Padding: <input type="range" id="padding" min="0" max="50" value="10"></label>
                <span id="paddingValue">10</span>
            </div>
            <button id="resetBtn" style="margin-top: 10px;">Reset</button>
        `;
        
        document.body.appendChild(container);
        
        // Store references and set up event listeners
        this.elements.bgX = document.getElementById('bgX');
        this.elements.bgY = document.getElementById('bgY');
        this.elements.btnX = document.getElementById('btnX');
        this.elements.btnY = document.getElementById('btnY');
        this.elements.padding = document.getElementById('padding');
        this.elements.resetBtn = document.getElementById('resetBtn');
        
        this.setupEventListeners();
    };
    
    private setupEventListeners(): void {
        // Update values display
        const updateValueDisplay = (inputId: string, valueId: string) => {
            const input = this.elements[inputId];
            const valueSpan = document.getElementById(valueId);
            if (valueSpan) valueSpan.textContent = input.value;
        };
        
        this.elements.bgX.addEventListener('input', () => {
            updateValueDisplay('bgX', 'bgXValue');
            this.onChange();
        });
        
        this.elements.bgY.addEventListener('input', () => {
            updateValueDisplay('bgY', 'bgYValue');
            this.onChange();
        });
        
        this.elements.btnX.addEventListener('input', () => {
            updateValueDisplay('btnX', 'btnXValue');
            this.onChange();
        });
        
        this.elements.btnY.addEventListener('input', () => {
            updateValueDisplay('btnY', 'btnYValue');
            this.onChange();
        });
        
        this.elements.padding.addEventListener('input', () => {
            updateValueDisplay('padding', 'paddingValue');
            this.onChange();
        });
        
        this.elements.resetBtn.addEventListener('click', () => {
            this.elements.bgX.value = 0;
            this.elements.bgY.value = 0;
            this.elements.btnX.value = 0;
            this.elements.btnY.value = 0;
            this.elements.padding.value = 10;
            this.onChange();
        });
        
        // Initialize displays
        updateValueDisplay('bgX', 'bgXValue');
        updateValueDisplay('bgY', 'bgYValue');
        updateValueDisplay('btnX', 'btnXValue');
        updateValueDisplay('btnY', 'btnYValue');
        updateValueDisplay('padding', 'paddingValue');
    };
    
    private onChange(): void {
        // Emit event with current values
        const values = {
            backgroundX: parseInt(this.elements.bgX.value),
            backgroundY: parseInt(this.elements.bgY.value),
            buttonX: parseInt(this.elements.btnX.value),
            buttonY: parseInt(this.elements.btnY.value),
            padding: parseInt(this.elements.padding.value)
        };
        
        this.scene.events.emit('positionTweakerChange', values);
    };
    
    getValues(): any {
        return {
            backgroundX: parseInt(this.elements.bgX.value),
            backgroundY: parseInt(this.elements.bgY.value),
            buttonX: parseInt(this.elements.btnX.value),
            buttonY: parseInt(this.elements.btnY.value),
            padding: parseInt(this.elements.padding.value)
        };
    };
    
    destroy(): void {
        const container = document.querySelector('div[style*="position: absolute"]');
        if (container) {
            container.remove();
        };
    };
};