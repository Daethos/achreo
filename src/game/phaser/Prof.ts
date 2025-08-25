export class Prof {
    private t0 = 0;
    private acc: Record<string, number> = {};
    private cnt: Record<string, number> = {};
    private lastPrint = 0;

    begin() { this.t0 = performance.now(); };

    mark(tag: string) {
        const dt = performance.now() - this.t0;
        this.acc[tag] = (this.acc[tag] ?? 0) + dt;
        this.cnt[tag] = (this.cnt[tag] ?? 0) + 1;
        this.t0 = performance.now();
    };
    
    printEvery(ms = 2000) {
        const now = performance.now();
        if (now - this.lastPrint < ms) return;
        this.lastPrint = now;
        const out = Object.entries(this.acc).map(([k, v]) => `${k}: ${(v / (this.cnt[k]||1)).toFixed(2)}ms`);
        console.log(`[Perf] ${out.join(' | ')}`);
        this.acc = {}; this.cnt = {};
    };
};