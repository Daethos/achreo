export class WindPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    private time: number;
    private intensity: number;
    // private resolution: Float32Array;
    constructor(game: Phaser.Game) {
        super({
            game,
            fragShader: game.cache.shader.get('windShader').fragmentSrc,
            vertShader: game.cache.shader.get('windShader').vertShader
        });
        this.time = 0.0;
        this.intensity = 1.0;
        // this.resolution = new Float32Array([game.scale.width, game.scale.height]);
    };

    onBind(gameObject: Phaser.GameObjects.GameObject) {
        super.onBind();
        this.set1f('time', this.time);
        this.set1f('intensity', this.intensity);
    };
    onBatch(gameObject: Phaser.GameObjects.GameObject) {
        if (gameObject) this.flush();
    };
    updateTime(time: number) {
        this.time = time;
    };
    setIntensity(intensity: number) {
        this.intensity = intensity;
    };
};