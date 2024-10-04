import { Game } from "../scenes/Game";
import SmallHud from "./SmallHud";
import ActionButtons from "./ActionButtons";
import Joystick from "./Joystick";
import { GameState } from "../../stores/game";
import Ascean from "../../models/ascean";
import { initReputation, Reputation } from "../../utility/player";
import Settings, { initSettings } from "../../models/settings";

export class Hud extends Phaser.GameObjects.Container {
    gameScene: Game;
    smallHud: SmallHud;
    joystick: Joystick;
    rightJoystick: Joystick;
    actionBar: ActionButtons;
    gameState: GameState | undefined;
    ascean: Ascean  | undefined;
    reputation: Reputation = initReputation;
    settings: Settings = initSettings;

    constructor(game: Game) {
        super(game, 0, 0);
        this.gameScene = game;
        game.smallHud = new SmallHud(game);
        game.actionBar = new ActionButtons(game);
        game.joystick = new Joystick(game, 
            game.cameras.main.width * game.settings.positions.leftJoystick.x, 
            game.cameras.main.height * game.settings.positions.leftJoystick.y,
            game.settings.positions.leftJoystick.base,
            game.settings.positions.leftJoystick.thumb
        );
        game.joystick.joystick.base.setAlpha(game.settings.positions.leftJoystick.opacity);
        game.joystick.joystick.thumb.setAlpha(game.settings.positions.leftJoystick.opacity);
        game.rightJoystick = new Joystick(game,
            game.cameras.main.width * game.settings.positions.rightJoystick.x, 
            game.cameras.main.height * game.settings.positions.rightJoystick.y,
            game.settings.positions.rightJoystick.base,
            game.settings.positions.rightJoystick.thumb
        );
        game.rightJoystick.joystick.base.setAlpha(game.settings.positions.rightJoystick.opacity);
        game.rightJoystick.joystick.thumb.setAlpha(game.settings.positions.rightJoystick.opacity);
        game.add.existing(this);    
    };
    cleanUp() {
        this.gameScene.smallHud.cleanUp();
        this.gameScene.smallHud.destroy();
    };
};