import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin.js';
// @ts-ignore
import { PhaserNavMeshPlugin } from 'phaser-navmesh';
import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { useResizeListener } from '../utility/dimensions';

const dimensions = useResizeListener();
//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: dimensions()?.ORIENTATION === 'landscape' ? window.innerWidth : window.innerHeight,
    height: dimensions()?.ORIENTATION === 'landscape' ? window.innerHeight : window.innerWidth,
    parent: 'game-container',
    backgroundColor: '#000',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ],
    physics: {
        default: 'matter',
        matter: {
            // debug: true,
            gravity: { x: 0, y: 0 },
        }
    },
    fps: { limit: 90, target: 60 },
    fullscreenTarget: 'base-ui',
    plugins: {
        global: [{
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
    },
};

const StartGame = (parent: string) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;