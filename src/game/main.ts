import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";
import GlowFilterPipelinePlugin from "phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin.js";
import HorrifiPipelinePlugin from "phaser3-rex-plugins/plugins/horrifipipeline-plugin.js";
import WarpPipelinePlugin from "phaser3-rex-plugins/plugins/warppipeline-plugin.js";
// @ts-ignore
import { PhaserNavMeshPlugin } from "phaser-navmesh";
import { Boot } from "./scenes/Boot";
import { Game } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { Hud } from "./scenes/Hud";
import { Preloader } from "./scenes/Preloader";
import { dimensions } from "../utility/dimensions";
import { Intro } from "./scenes/Intro";
import { Underground } from "./scenes/Underground";
import { Arena } from "./scenes/Arena";
import { Tutorial } from "./scenes/Tutorial";
import { ArenaCvC } from "./scenes/ArenaCvC";
import { Gauntlet } from "./scenes/Gauntlet";
import Player from "./entities/Player";
import Enemy from "./entities/Enemy";
import Party from "./entities/PartyComputer";
export type Play = Arena | ArenaCvC | Game | Gauntlet | Tutorial | Underground;
export type Entity = Player | Enemy | Party;
const dims = dimensions();
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    height: dims.HEIGHT,
    width: dims.WIDTH,
    scale: {
        mode: Phaser.Scale.FIT, // FIT
        autoCenter: Phaser.Scale.CENTER_BOTH, // CENTER_BOTH
    },
    backgroundColor: "#000",
    input: {
        activePointers: 10,
        mouse:true, 
        windowEvents:false
    },
    scene: [Boot,Preloader,MainMenu,Tutorial,Game,Intro,Underground,Arena,ArenaCvC,Gauntlet,Hud],
    physics: {
        default: "matter",
        matter: {
            // debug: true,
            // enableSleeping: true,
            gravity: {x: 0, y: 0}
        }, 
    },
    fps: {target: 60,limit: 90},
    fullscreenTarget: "base-ui",
    // render: {
    //     clearBeforeRender: false,
    //     antialias: false
    // },
    plugins: {
        global: [{
            key: "rexHorrifiPipeline",
            plugin: HorrifiPipelinePlugin,
            start: true
        }, {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            start: true
        }, {
            key: "rexGlowFilterPipeline",
            plugin: GlowFilterPipelinePlugin,
            start: true
        },{
            key: "rexWarpPipeline",
            plugin: WarpPipelinePlugin,
            start: true
        }],
        scene: [{
            plugin: PhaserMatterCollisionPlugin,
            key: "matterCollision",
            mapping: "matterCollision"
        }, {
            key: "PhaserNavMeshPlugin",
            plugin: PhaserNavMeshPlugin,
            mapping: "navMeshPlugin",
            start: true
        }],
    }
};
const StartGame = (parent: string, fps: any): Phaser.Game => {
    return new Phaser.Game({ ...config, parent, fps });
};
export default StartGame;