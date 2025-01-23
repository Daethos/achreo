export class WindPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    private time: number;
    private intensity: number;
    constructor(game: Phaser.Game) {
        super({
            game,
            fragShader: game.cache.shader.get('windShader').fragmentSrc,
            vertShader: game.cache.shader.get('windShader').vertShader
        });
        this.time = 0.0;
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
};