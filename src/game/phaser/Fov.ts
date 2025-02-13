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
    private scene: any;
    public layers: any[];
    private mrpas: Mrpas | undefined;
    private lastPos: Phaser.Math.Vector2;
    private map: Phaser.Tilemaps.Tilemap;
    public enemies: any[];
    private radius: number;

    constructor(scene: any, map: Phaser.Tilemaps.Tilemap, layers: any[]) {
        this.scene = scene;
        this.lastPos = new Phaser.Math.Vector2({x:-1,y:-1});
        this.layers = layers;
        this.map = map;
        this.enemies = [];
        this.radius = radius;
        this.recalculate(map);
    };

    lighting = () => radius + (this.scene.player.isCaerenic ? 2 : 0) + (this.scene.player.isStealthing ? -2 : 0);

    recalculate = (map: Phaser.Tilemaps.Tilemap) => {
        this.mrpas = new Mrpas(map.width, map.height, (x, y) => {
            const tile = this.layers[0].getTileAt(x, y);
			return tile && !tile.properties?.edge; // && !tile.collides;
        });
    };

    update(pos: Phaser.Math.Vector2,bounds: Phaser.Geom.Rectangle,dt: number) {
        if (!this.lastPos.equals(pos) || this.lighting() !== this.radius) {
            this.radius = this.lighting();
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
        if (this.scene.enemies.length > 0) this.updateEnemies();
        if (this.scene.party.length > 0) this.updateParty();
        if (this.scene.dms?.length > 0) this.updateDms();
        // if (this.scene.npcs.length > 0) this.updateNpcs();
        if (this.scene.player.highlight) this.updateHighlight();
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
        this.mrpas!.compute(pos.x,pos.y,this.radius,
            (x: number, y: number) => {
                const tile = this.layers[0].getTileAt(x, y);
                return tile && tile.seen;
            },
            (x: number, y: number) => {
                const tile = this.layers[0].getTileAt(x, y);
                if (!tile) return;
                const distance = Math.floor(new Phaser.Math.Vector2(x, y).distance(new Phaser.Math.Vector2(pos.x, pos.y)));
                const rolloffIdx = distance <= this.radius ? this.radius - distance : 0;
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

    updateHighlight = () => {
        const coords = new Phaser.Math.Vector2({
            x: this.map.worldToTileX(this.scene.player.highlight.x) as number,
            y: this.map.worldToTileY(this.scene.player.highlight.y) as number
        });
        const distance = Math.floor(new Phaser.Math.Vector2(coords.x, coords.y).distance(new Phaser.Math.Vector2(this.lastPos.x, this.lastPos.y)));
        const rolloffIdx = distance <= this.radius ? this.radius - distance : 0;
        const alpha = rolloffIdx < lightDropoff.length ? lightDropoff[rolloffIdx] : 1;
        this.scene.player.highlight.setAlpha(alpha);
    };

    updateParty = () => {
        for (let i = 0; i < this.scene.party.length; i++) {
            const party = this.scene.party[i];
            if (!party || !party.body) continue;
            const coords = new Phaser.Math.Vector2({
                x: this.map.worldToTileX(party.x) as number,
                y: this.map.worldToTileY(party.y) as number
            });
            const distance = Math.floor(new Phaser.Math.Vector2(coords.x, coords.y).distance(new Phaser.Math.Vector2(this.lastPos.x, this.lastPos.y)));
            const rolloffIdx = distance <= this.radius ? this.radius - distance : 0;
            const alpha = rolloffIdx < lightDropoff.length ? lightDropoff[rolloffIdx] : 1;
            party.setAlpha(alpha);
            party.spriteWeapon.setAlpha(alpha);
            party.spriteShield.setAlpha(alpha);
            party.healthbar.setAlpha(alpha);
            party.reactiveBubble?.setAlpha(alpha);
            party.negationBubble?.setAlpha(alpha);
        };
    };

    updateEnemies = () => {
        for (let i = 0; i < this.scene.enemies.length; i++) {
            const enemy = this.scene.enemies[i];
            if (!enemy || !enemy.body) continue;
            const coords = new Phaser.Math.Vector2({
                x: this.map.worldToTileX(enemy.x) as number,
                y: this.map.worldToTileY(enemy.y) as number
            });
            const distance = Math.floor(new Phaser.Math.Vector2(coords.x, coords.y).distance(new Phaser.Math.Vector2(this.lastPos.x, this.lastPos.y)));
            const rolloffIdx = distance <= this.radius ? this.radius - distance : 0;
            const alpha = rolloffIdx < lightDropoff.length ? lightDropoff[rolloffIdx] : 1;
            enemy.setAlpha(alpha);
            enemy.spriteWeapon.setAlpha(alpha);
            enemy.spriteShield.setAlpha(alpha);
            enemy.healthbar.setAlpha(alpha);
            enemy.reactiveBubble?.setAlpha(alpha);
            enemy.negationBubble?.setAlpha(alpha);
        };
    };

    updateDms = () => {
        for (let i = 0; i < this.scene.dms.length; i++) {
            const dm = this.scene.dms[i];
            if (!dm || !dm.body) continue;
            const coords = new Phaser.Math.Vector2({
                x: this.map.worldToTileX(dm?.x) as number,
                y: this.map.worldToTileY(dm?.y) as number
            });
            const distance = Math.floor(new Phaser.Math.Vector2(coords.x, coords.y).distance(new Phaser.Math.Vector2(this.lastPos.x, this.lastPos.y)));
            const rolloffIdx = distance <= this.radius ? this.radius - distance : 0;
            const alpha = rolloffIdx < lightDropoff.length ? lightDropoff[rolloffIdx] : 1;
            dm.setAlpha(alpha);
        };
    };

    updateNpcs = () => {
        for (let i = 0; i < this.scene.npcs.length; i++) {
            const npc = this.scene.npcs[i];
            if (!npc || !npc.body) continue;
            const coords = new Phaser.Math.Vector2({
                x: this.map.worldToTileX(npc?.x) as number,
                y: this.map.worldToTileY(npc?.y) as number
            });
            const distance = Math.floor(new Phaser.Math.Vector2(coords.x, coords.y).distance(new Phaser.Math.Vector2(this.lastPos.x, this.lastPos.y)));
            const rolloffIdx = distance <= this.radius ? this.radius - distance : 0;
            const alpha = rolloffIdx < lightDropoff.length ? lightDropoff[rolloffIdx] : 1;
            npc.setAlpha(alpha);
        };
    };
};