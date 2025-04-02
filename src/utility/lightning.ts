const config = {
    segments: 15,
    segmentMult: 10,
    opacityHigh: 0.6,
    opacityLow: 0.2,
    intensity: 1.25,
    startingBolts: 7,
    boltSize: 0.5,
    frequency: 660,
    duration: 1,
    color: [50, 255, 255], // 150, 200, 255
    gold: [255, 215, 0], 
    purple: [128, 0, 128], 
};
export const lightning = () => {
    const canvas = document.getElementById('lightning') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    let lightningInterval: number;
    let activeTimers: any[] = [];

    function createBolt() {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        
        const startX = Math.random() > 0.5 ? 0 : canvas.width;
        const startY = Math.random() * canvas.height;
        const segments = config.segments + Math.floor(Math.random() * config.segmentMult * config.intensity);
        const life = 50 + Math.random() * 100 * config.duration;
        
        ctx?.beginPath();
        ctx?.moveTo(startX, startY);
        
        let x = startX;
        let y = startY;
        
        for (let i = 0; i < segments; i++) {
            x += (Math.random() * 100 - 50) * (startX === 0 ? 1 : -1) * config.boltSize;
            y += Math.random() * 50 * config.boltSize;
            x = Math.max(0, Math.min(x, canvas.width));
            
            ctx?.lineTo(x, y);
            
            if (Math.random() > 0.7) {
                ctx?.moveTo(x, y);
                ctx?.lineTo(
                    x + (Math.random() * 50 - 25) * config.boltSize,
                    y + Math.random() * 25 * config.boltSize
                );
                ctx?.moveTo(x, y);
            };
        };
        
        ctx!.strokeStyle = `rgba(${(startX === 0 ? config.gold : config.purple).join(',')}, ${config.opacityHigh * config.intensity})`;
        ctx!.lineWidth = 2 * config.boltSize;
        ctx?.stroke();
        
        ctx!.strokeStyle = `rgba(200, 230, 255, ${config.opacityLow * config.intensity})`;
        ctx!.lineWidth = 8 * config.boltSize;
        ctx?.stroke();
        
        const fadeTimer = setTimeout(() => {
            ctx!.clearRect(0, 0, canvas.width, canvas.height);
        }, life);

        activeTimers.push(fadeTimer);
    };

    function startLightning() {
        for (let i = 0; i < config.startingBolts; i++) {
            activeTimers.push(setTimeout(createBolt, i * 250) as unknown as number);
        };
        
        lightningInterval = setInterval(() => {
            if (Math.random() > 0.5) createBolt();
        }, config.frequency) as unknown as number;
    };

    function stopLightning() {
        clearInterval(lightningInterval);
        activeTimers.forEach(timer => clearTimeout(timer));
        activeTimers = [];
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };

    startLightning();

    return stopLightning;
};