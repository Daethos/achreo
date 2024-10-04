import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin.js';
import HorrifiPipelinePlugin from 'phaser3-rex-plugins/plugins/horrifipipeline-plugin.js';
// @ts-ignore
import { PhaserNavMeshPlugin } from 'phaser-navmesh';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { useResizeListener } from '../utility/dimensions';
import { Intro } from './scenes/Intro';
import { Tent } from './scenes/Interior';
import { Underground } from './scenes/Underground';

const dimensions = useResizeListener();
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    height: dimensions().HEIGHT,
    width: dimensions().WIDTH,
    scale: {
        mode: Phaser.Scale.RESIZE, // RESIZE
        autoCenter: Phaser.Scale.CENTER_BOTH, // CENTER_BOTH
    },
    parent: 'game-container',
    backgroundColor: '#000',
    dom: {createContainer: true},
    input: {activePointers: 10, mouse:true, windowEvents:false},
    scene: [Boot,Preloader,MainMenu,MainGame,Intro,Tent,Underground],
    physics: {
        default: 'matter',
        matter: {gravity: {x: 0, y: 0}}, // debug: true,
    },
    fps: {limit:90,target:60},
    fullscreenTarget: 'base-ui',
    plugins: {
        global: [{
            key: 'rexHorrifiPipeline',
            plugin: HorrifiPipelinePlugin,
            start: true
        }, {
            key: 'rexVirtualJoystick',
            plugin: VirtualJoystickPlugin,
            start: true
        }, {
            key: 'rexGlowFilterPipeline',
            plugin: GlowFilterPipelinePlugin,
            start: true
        }],
        scene: [{
            plugin: PhaserMatterCollisionPlugin,
            key: 'matterCollision',
            mapping: 'matterCollision'
        }, {
            key: "PhaserNavMeshPlugin",
            plugin: PhaserNavMeshPlugin,
            mapping: "navMeshPlugin",
            start: true
        }],
    }
};
const StartGame = (parent: string): Phaser.Game => {
    return new Phaser.Game({ ...config, parent });
};
export default StartGame;