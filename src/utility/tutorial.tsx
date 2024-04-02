import { Accessor, Setter } from "solid-js";
import { saveTutorial } from "../assets/db/db";
import { EventBus } from "../game/EventBus";

export type Tutorial = {
    boot: boolean,
    character: boolean,
    controls: boolean,
    dialog: boolean,
    inventory: boolean,
    loot: boolean,
    settings: boolean,
    views: boolean;
};

export const initTutorial: Tutorial = {
    boot: false,
    character: false,
    controls: false,
    dialog: false,
    inventory: false,
    loot: false,
    settings: false,
    views: false
} as Tutorial;

const arrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
}

export default function TutorialOverlay({ id, tutorial, show, setShow }: { id: string; tutorial: Accessor<string>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    async function exitTutorial(): Promise<void> {
        try {
            await saveTutorial(id, tutorial());
            EventBus.emit('fetch-ascean', id);
            setShow(!show());
        } catch (err: any) {
            console.warn(err.message);
        };
    };
    return (
        <div class='modal' style={{ background: 'rgba(0, 0, 0, 0.75)', 'z-index': 1000 }}>
            { tutorial() === 'boot' && <div>
                <p class='cornerTL gold highlight' style={{ left: '0', top: '5em', 'font-weight': 700 }}>
                   Game HUD {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Click your Name or Weapon to Display more Information]</span>
                </p>
                <p class='cornerTL gold highlight' style={{ left: '23.5em', top: '2em', 'font-weight': 700 }}>
                   FPS {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Current FPS, click to toggle Fullscreen]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ right: '0', top: '3.5em', 'font-weight': 700 }}>
                    Specials (Black) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Actions of an Othernature that are only available during Combat]</span>
                </p>
                <p class='cornerBR gold highlight' style={{ right: '22.5em', bottom: '2.5em', 'font-weight': 700 }}>
                    Actions (Purple) {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Physical Actions that Perform Attacks and Movements]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ right: '1em', top: '16em', 'font-weight': 700 }}>
                    Joystick (Aim) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Manual Aim for Ranged Attacks and Specials]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '0', left: '1em', 'font-weight': 700 }}>
                    Joystick (Movement) {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Use this Joystick to Move your Character]</span>
                </p>
            </div> }
            { tutorial() === 'character' && <div>
                <p class='cornerTR gold highlight' style={{ right: '12.5em', 'font-weight': 700 }}>
                    Cycle between character information {arrows.right}  <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Statistics display combat history, Traits display percularities of your character]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '3em', left: '50%', 'font-weight': 700, transform: 'translateX(-50%)' }}>
                    {arrows.up} <br /> 
                    Expanded Character Statistics <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Attributes can be clicked for more information]</span>
                </p>
            </div> }
            { tutorial() === 'controls' && <div class='border superCenter'>
                This is the controls tutorial
            </div> }
            { tutorial() === 'dialog' && <div class='border superCenter'>
                This is the dialog tutorial
            </div> }
            { tutorial() === 'inventory' && <div>
                <p class='cornerTR gold highlight' style={{ right: '4.5em', 'font-weight': 700 }}>
                    Click here to view your flask of firewater {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Information is Displayed in the Third Panel]</span>
                </p> 
                <p class='superCenter gold highlight' style={{ 'font-weight': 700 }}>
                {arrows.down} Click an Item to Compare {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[You May Remove and Equip such Items if you Qualify, <br /> and can Switch Rings and Weapons for Specific Comparison.]</span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '5em', right: '4em', 'font-weight': 700 }} onClick={() => exitTutorial()}>
                    {arrows.up} Inventory Pouch <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Contains all the loot you've collected]</span>
                </p>
            </div> }
            { tutorial() === 'loot' && <div>
                <p class='cornerTL gold highlight' style={{ left: '18em', top: '12.5em', 'font-weight': 700 }}>
                   Loot Drops from Enemies and the Wild {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Scrollable container displaying equipment information and the option to pick it up]</span>
                </p>
            </div> }
            { tutorial() === 'settings' && <div>
                <p class='cornerTL gold highlight' style={{ left: '0', top: '0', 'font-weight': 700 }}>
                    Click to switch game topics {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Information is Displayed in the Third Panel]</span>
                </p>
                <p class='cornerTL gold highlight' style={{ left: '50%', top: '3.5em', 'font-weight': 700, transform: 'translateX(-50%)' }}> 
                   Click to re-map between actions 
                   <br />{arrows.down} 
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '3.5em', right: '2em', 'font-weight': 700 }}>
                    {arrows.up} <br /> <br />
                    Displayed Game Information <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Each Topic Sheds Clarity on Aspects of Gameplay]</span>
                </p>
            </div> }
            { tutorial() === 'views' && <div>
                <p class='cornerTL gold highlight' style={{ left: '7.5em', 'font-weight': 700 }}>
                   {arrows.left} Click here to cycle between different views. <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Inventory Displays All Your Loot, Character Displays Expanded Player Info, Settings Show Gameplay Information]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ right: '2.5em', 'font-weight': 700 }}>
                    Click here to exit views {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Your postiion in these views is saved]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '2.5em', left: '2.5em', 'font-weight': 700 }}>
                    {arrows.up} <br /> 
                    Character Display <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Equipment can be clicked for more information]</span>
                </p>
            </div> }
            <p class='cornerBR gold highlight' style={{ bottom: '0', right: '0', 'font-weight': 700 }} onClick={() => exitTutorial()}>
                {arrows.right} Exit
            </p>
        </div>
    );
};