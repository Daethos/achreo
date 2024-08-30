export default class Tile extends Phaser.Tilemaps.Tile {
    public collides: boolean;
    public readonly x: number;
    public readonly y: number;
    public seen: boolean;
    public standing: boolean;
    public desiredAlpha: number; 
    public readonly corridor: boolean;

    constructor(tile: Phaser.Tilemaps.Tile) {
        const { layer, collides, index, x, y, width, height, baseWidth, baseHeight } = tile;
        super(layer, index, x, y, width, height, baseWidth, baseHeight)
        this.collides = collides;
        this.desiredAlpha = 0;
        this.seen = false;
        this.standing = false;
        this.x = x;
        this.y = y;
    };

    open() {
        this.collides = false;
    };
};