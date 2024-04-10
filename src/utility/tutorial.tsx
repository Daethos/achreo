import { Accessor, Setter } from "solid-js";
import { saveTutorial } from "../assets/db/db";
import { EventBus } from "../game/EventBus";

export type Tutorial = {
    boot: boolean,
    character: boolean,
    controls: boolean,
    death: boolean,
    dialog: boolean,
    inventory: boolean,
    loot: boolean,
    merchant: boolean,
    settings: boolean,
    views: boolean;
};

export const initTutorial: Tutorial = {
    boot: false,
    character: false,
    controls: false,
    death: false,
    dialog: false,
    inventory: false,
    loot: false,
    merchant: false,
    settings: false,
    views: false
};

const arrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
};

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
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Displays your Name, Health, Stamina, and main Weapon <br />
                        Click your Name or Weapon to Display More Information]</span>
                </p>
                <p class='verticalTop gold highlight' style={{ top: '2em', 'font-weight': 700 }}>
                   FPS {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Current Game FPS (Frames Per Second), <br />
                        click this to toggle Fullscreen Mode]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ right: '0', top: '3.5em', 'font-weight': 700 }}>
                    Specials (Black) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Actions of an Othernature that are only available during Combat. <br />
                        These abilities are much more varied than physical actions.]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '10%', 'font-weight': 700 }}>
                    Actions (Purple) {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Physical Actions that perform various attacks and movements. <br />
                        Movement can still be used outside of combat, attacks become ineffective.]</span>
                </p>
                <p class='middleRight gold highlight' style={{ right: '1em', 'font-weight': 700 }}>
                    Joystick (Aim) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Manual Aim for Ranged Attacks and certain Specials]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '0', left: '1em', 'font-weight': 700 }}>
                    Joystick (Movement) {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Joystick allows you to move your Character]</span>
                </p>
            </div> }
            { tutorial() === 'death' && <div>
                <p class='cornerTL gold highlight' style={{ left: '0', top: '5em', 'font-weight': 700 }}>
                   Your Health {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[It's 0 and Transparent. Get used to seeing that.]</span>
                </p>
                <p class='verticalTop gold highlight' style={{ 'font-weight': 700 }}>
                    {arrows.left} Your Weapon <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Perhaps it isn't your fault, it's simply the tool. <br /> Don't forget its damage types and your prayers!]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ top: '5em', 'font-weight': 700 }}>
                    Specials Actions {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Perhaps there are too many buttons? Maybe just have one big one?]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '0', 'font-weight': 700 }}>
                    So You Died (I'm Sorry) <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[At the moment, death isn't so bad. The enemies that were attacking you revert to a docile state. You can still travel and play with 0 health, although combat is inaccessible until you gain at least 1 health point back. You can drink your firewater flask in your inventory, or acquire the healing special action and cast it. Good luck!]</span>
                </p>
                <p class='middleRight gold highlight' style={{ 'font-weight': 700 }}>
                    Joystick (Aim) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Manual Aim, Should I Even Bother? Is this Absurd or Reasonable?]</span>
                </p>
            </div> }
            { tutorial() === 'character' && <div>
                <p class='cornerTR gold highlight' style={{ right: '20%', 'font-weight': 700 }}>
                    Cycle between character information {arrows.right}  <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[(Statistics) display your combat history, like which prayer you hope for the most, and to whom.<br /> 
                        (Traits) display percularities of your character, e.g. who you embody of the Ancients or Daethos]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '0', 'font-weight': 700 }}>
                    {arrows.up} <br /> 
                    Expanded Character Info <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This displays extra information about your character. <br />
                        Attributes can be clicked for extended information]</span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '10%', right: '0', 'font-weight': 700 }} onClick={() => exitTutorial()}>
                    Statistics / Traits {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This displays the information that is toggled between Statistics and Traits.]</span>
                </p>
            </div> }
            { tutorial() === 'controls' && <div class='border superCenter'>
                This is the controls tutorial
            </div> }
            { tutorial() === 'dialog' && <div class='border superCenter'>
                This is the dialog tutorial
            </div> }
            { tutorial() === 'inventory' && <div>
                <p class='cornerTR gold highlight' style={{ right: '10%', 'font-weight': 700 }}>
                    Click here to view your flask of firewater {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Standard way of replenishing health. Clicking this gives information about its properties and uses.]</span>
                </p> 
                <p class='superCenter gold highlight' style={{ 'font-weight': 700, 'left': '65%', 'width': '50%' }}>
                {arrows.down} Click an Inventory Item to Compare {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Clicking on an inventory item will compare it to the like item you have equipped. <br /> You May Remove and Destroy, Equip such Items if you Qualify, or even Upgrade! <br /> You can Inspect to switch Rings and Weapons for Specific Comparison.]</span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '10%', 'font-weight': 700 }} onClick={() => exitTutorial()}>
                    Inventory Pouch {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Contains all the loot you've collected, endless in its holdings. <br /> Clicking on an item will highlight it for comparison in the second window. <br /> Double-clicking between items allows one to swap and reorganize their inventory.]</span>
                </p>
            </div> }
            { tutorial() === 'loot' && <div style={{ 'z-index': 1000 }}>
                <p class='superCenter gold highlight' style={{ top: '35%', 'font-weight': 700 }}>
                   Loot Drops from Enemies and the Wild {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Scrollable container displaying equipment information and the option to pick it up <br />
                        This will stay on the ground in the world if you don't pick it up.]</span>
                </p>
            </div> }
            { tutorial() === 'settings' && <div>
                <p class='cornerTL gold highlight' style={{ 'font-weight': 700 }}>
                    Click to switch game topics {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Information is Displayed in the Third Panel <br />
                        (Actions) Physical Action Button Info <br />
                        (Specials) Othernaturual Action Button Info <br />
                        (Control) Button Mapping / Difficulty / Post Fx <br />
                        (General) Game Information <br />
                        (Inventory) How to use the inventory panel <br />
                        (Tactics) Weapon / Damage Type / Prayer Info]</span>
                </p>
                <p class='cornerTL gold highlight' style={{ left: '50%', top: '7.5%', 'font-weight': 700, transform: 'translateX(-50%)' }}> 
                    Click to Control Setting Type 
                    {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>
                        [This is where you can change and adjust game's settings<br />
                        (Buttons) Allows you to remap the physical and special action buttons<br />
                        (Difficulty) Allows you to toggle Aim Assist<br />
                        (Post Fx) allows you to toggle visual effects.]
                    </span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '10%', right: '3%', 'font-weight': 700 }}>
                    {arrows.up} <br /> <br />
                    Displayed Game Information <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Each topic displays extended information and <br /> sheds clarity on aspects of the game and gameplay]</span>
                </p>
            </div> }
            { tutorial() === 'views' && <div>
                <p class='cornerTL gold highlight' style={{ left: '12.5%', 'font-weight': 700 }}>
                   {arrows.left} Click here to cycle between different views. <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[(Inventory) Displays All Your Loot, (Character) Displays Expanded Player Info, (Settings) Show Gameplay Information]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ right: '5%', 'font-weight': 700 }}>
                    Click here to exit views {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Your postiion in these 'views' is saved.]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '0', left: '3%', 'font-weight': 700 }}>
                    {arrows.up} <br /> 
                    Character Display <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Displaying your name, health, equipment, and experience. <br />
                        Equipment can be clicked for more information]</span>
                </p>
            </div> }
            <p class='cornerBR gold highlight' style={{ bottom: '0', right: '0', 'font-weight': 700 }} onClick={() => exitTutorial()}>
                {arrows.right} Exit
            </p>
        </div>
    );
};