import { Mrpas } from "mrpas";
import Tile from "./Tile";

const radius = 7;
const fogAlpha = 0.15;
const lightDropoff = [0.15, 0.3, 0.6, 0.7];
const alphaPerMs = 0.004;

function updateTileAlpha(desiredAlpha: number,dt: number,tile: Tile) {
    const distance = Math.max(Math.abs(tile.alpha - desiredAlpha), 0.05);
    const updateFactor = alphaPerMs * dt * distance;
    if (tile.alpha > desiredAlpha) {
        tile.setAlpha(Phaser.Math.MinSub(tile.alpha, updateFactor, desiredAlpha));
    } else if (tile.alpha < desiredAlpha) {
        tile.setAlpha(Phaser.Math.MaxAdd(tile.alpha, updateFactor, desiredAlpha));
    };
};

export default class Fov {
    public layers: any[];
    private mrpas: Mrpas | undefined;
    private lastPos: Phaser.Math.Vector2;
    private map: Phaser.Tilemaps.Tilemap;

    constructor(map: Phaser.Tilemaps.Tilemap, layers: any[]) {
        this.lastPos = new Phaser.Math.Vector2({x:-1,y:-1});
        this.layers = layers;
        this.map = map;
        this.recalculate(map);
    };

    recalculate = (map: Phaser.Tilemaps.Tilemap) => {
        this.mrpas = new Mrpas(map.width, map.height, (x, y) => {
            const tile = this.layers[0].getTileAt(x, y);
			return tile && !tile.collides;
        });
    };

    update(pos: Phaser.Math.Vector2,bounds: Phaser.Geom.Rectangle,dt: number) {
        if (!this.lastPos.equals(pos)) {
            this.updateMRPAS(pos);
            this.lastPos = pos.clone();
        };
        for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
            for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
                if (y < 0 || y >= this.map.height || x < 0 || x >= this.map.width) continue;
                const tile = this.layers[0].getTileAt(x, y);
                if (!tile) continue;
                const desiredAlpha = tile.desiredAlpha || 0;
                if (tile) updateTileAlpha(desiredAlpha, dt, tile);
                const tile2 = this.layers[1].getTileAt(x, y);
                if (tile2) updateTileAlpha(desiredAlpha, dt, tile2);
                const tile3 = this.layers[2].getTileAt(x, y);
                if (tile3) updateTileAlpha(desiredAlpha, dt, tile3);
            };
        };
    };

    updateMRPAS(pos: Phaser.Math.Vector2) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].forEachTile((tile: Tile) => {
                if (tile?.seen) {
                    tile.desiredAlpha = fogAlpha;
                    tile.tint = 0x00ffff; // 0x002b2b;
                };
            });
        };

        this.mrpas!.compute(pos.x,pos.y,radius,
            (x: number, y: number) => {
                const tile = this.layers[0].getTileAt(x, y);
                return tile && tile.seen;
            },
            (x: number, y: number) => {
                const tile = this.layers[0].getTileAt(x, y);
                if (!tile) return;
                const distance = Math.floor(new Phaser.Math.Vector2(x, y).distance(new Phaser.Math.Vector2(pos.x, pos.y)));
                const rolloffIdx = distance <= radius ? radius - distance : 0;
                const alpha = rolloffIdx < lightDropoff.length ? lightDropoff[rolloffIdx] : 1;
                tile.desiredAlpha = alpha;
                tile.tint = 0xffffff;
                tile.seen = true;

                const tile2 = this.layers[1].getTileAt(x, y);
                const tile3 = this.layers[2].getTileAt(x, y);
                if (tile2) {
                    tile2.desiredAlpha = alpha;
                    tile2.seen = true;
                    tile2.tint = 0xffffff;
                };
                if (tile3) {
                    tile3.desiredAlpha = alpha;
                    tile3.seen = true;
                    tile3.tint = 0xffffff;
                };
            }
        );
    };
};