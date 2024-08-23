import { Game } from "./Game";
import SmallHud from "../../phaser/SmallHud";

export class HudScene extends Phaser.Scene {
    gameScene: Game;
    smallHud: SmallHud;

    constructor() {
        super('Hud');
    };
    create(game: Game) {
        this.gameScene = game;
        this.smallHud = new SmallHud(game);
    };
    cleanUp() {
        this.smallHud.cleanUp();
        this.smallHud.destroy();
    };
};