import { Accessor, Setter } from "solid-js";
import { saveTutorial } from "../assets/db/db";
import { EventBus } from "../game/EventBus";

export type Tutorial = {
    boot: boolean,
    character: boolean,
    controls: boolean,
    death: boolean,
    dialog: boolean,
    intro: boolean,
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
    intro: false,
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
                <p class='cornerTL gold highlight' style={{ left: '0', top: '17.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   Game HUD {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Displays your Name, Health, Stamina, and main Weapon <br />
                        Click your Name or Weapon to Display More Information]</span>
                </p>
                <p class='verticalTop gold highlight' style={{ top: '2em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   FPS {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Current Game FPS (Frames Per Second), <br />
                        click this to toggle Fullscreen Mode]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ right: '0', top: '10%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Specials (Black) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Actions of an Othernature that are only available during Combat. <br />
                        These abilities are much more varied than physical actions.]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '10%', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Actions (Purple) {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Physical Actions that perform various attacks and movements. <br />
                        Movement can still be used outside of combat, attacks become ineffective.]</span>
                </p>
                <p class='middleRight gold highlight' style={{ right: '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Joystick (Aim) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Manual Aim for Ranged Attacks and certain Specials]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '0', left: '1em', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Joystick (Movement) {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Joystick allows you to move your Character]</span>
                </p>
            </div> }
            { tutorial() === 'death' && <div>
                <p class='cornerTL gold highlight' style={{ left: '0', top: '5em', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   Your Health {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[It's 0 and Red. Get used to seeing that.]</span>
                </p>
                <p class='verticalTop gold highlight' style={{ 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.left} Your Weapon <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Perhaps it isn't your fault, it's simply the tool. <br /> Don't forget its damage types and your prayers!]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ top: '5em', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Specials Actions {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Perhaps there are too many buttons? Maybe just have one big one?]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '0', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    So You Died (I'm Sorry) <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[At the moment, death isn't so bad. The enemies that were attacking you revert to a docile state. You can still travel and play with 0 health, although combat is inaccessible until you gain at least 1 health point back. You can drink your firewater flask in your inventory, or acquire the healing special action and cast it. Good luck!]</span>
                </p>
                <p class='middleRight gold highlight' style={{ 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Joystick (Aim) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Manual Aim, Should I Even Bother? Is this Absurd or Reasonable?]</span>
                </p>
            </div> }
            { tutorial() === 'character' && <div>
                <p class='cornerTR gold highlight' style={{ right: '12.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Cycle between character information {arrows.right}  <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[(Statistics) display your combat history, like which prayer you hope for the most, and to whom.<br /> 
                        (Traits) display percularities of your character, e.g. who you embody of the Ancients or Daethos]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '0', left: '49%', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.up} Expanded Character Info <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Extra information about your character's combat statistics. <br />
                        Attributes can be Clicked for Expanded information]</span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '10%', right: '2%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }} onClick={() => exitTutorial()}>
                    Statistics / Traits {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Information that is toggled between Statistics and Traits.]</span>
                </p>
            </div> }
            { tutorial() === 'controls' && <div class='border superCenter'>
                This is the controls tutorial
            </div> }
            { tutorial() === 'dialog' && <div class='border superCenter'>
                This is the dialog tutorial
            </div> }
            { tutorial() === 'inventory' && <div>
                <p class='cornerTR gold highlight' style={{ right: '20%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Click here to view your Equipment or Expanded Stats {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[When equipping gear, will allow you to see its real time changes to your character.]</span>
                </p> 
                <p class='cornerTR gold highlight' style={{ right: '0%', top: '10%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Firewater {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Replenishes Health.]</span>
                </p> 
                <p class='superCenter gold highlight' style={{ 'font-weight': 700, border: '0.1em solid #fdf6d8', 'left': '65%', 'width': '50%' }}>
                {arrows.down} Click an Inventory Item to Compare {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Clicking on an inventory item will compare it to the like item you have equipped. <br /> You May Remove and Destroy, Equip such Items if you Qualify, or even Upgrade! <br /> You can Inspect to switch Rings and Weapons for Specific Comparison.]</span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '10%', right: '1.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }} onClick={() => exitTutorial()}>
                    Inventory Pouch {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Contains All the Loot You've Collected. <br /> Click an Item to Highlight it for Comparison. <br /> Double-Click Items to Swap and Reorganize Your Inventory.]</span>
                </p>
            </div> }
            { tutorial() === 'loot' && <div style={{ 'z-index': 1000 }}>
                <p class='superCenter gold highlight' style={{ top: '30%', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   Loot Drops from Enemies and the Wild {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Scrollable container displaying equipment information and the option to pick it up <br />
                        This will stay on the ground in the world if you don't pick it up.]</span>
                </p>
            </div> }
            { tutorial() === 'settings' && <div>
                <p class='cornerTL gold highlight' style={{ left: '1%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Click to switch game topics {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Information is Displayed in the Third Panel <br />
                        (Actions) Physical Action Button Info <br />
                        (Specials) Othernaturual Action Button Info <br />
                        (Control) Button Mapping / Difficulty / Post Fx <br />
                        (General) Game Information <br />
                        (Inventory) How to Use the Inventory Panel <br />
                        (Tactics) Weapon / Damage Type / Prayer Info]</span>
                </p>
                <p class='cornerTL gold highlight' style={{ left: '49%', top: '25%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8', transform: 'translateX(-50%)' }}> 
                    Click to Control Setting Type 
                    {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>
                        [Adjust and/or Change Gameplay Settings<br />
                        (Actions) Remap Physical and Special Action Buttons<br />
                        (Difficulty) Toggle Aim Assist (Auto-Manual)<br />
                        (Post Fx) Enable and Adjust Visual Effects.]
                    </span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '10%', right: '1.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.up} Displayed Game Information
                    <br /> 
                    <span class='super' style={{ color: '#fdf6d8' }}>[Each topic displays extended information and <br /> sheds clarity on aspects of the game and gameplay]</span>
                </p>
            </div> }
            { tutorial() === 'views' && <div>
                <p class='cornerTL gold highlight' style={{ left: '12.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   {arrows.left} Click here to cycle between different views. <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[(Inventory) Displays All Your Loot, (Character) Displays Expanded Player Info, (Settings) Show Gameplay Information]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ right: '5%', 'font-weight': 700, border: '0.1em solid #fdf6d8', width: '20%' }}>
                    Click again to exit {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Your viewing postiion is saved.]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '0', left: '1.25%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.up} Character Display <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Displaying your name, health, equipment, and experience. <br />
                        Equipment can be clicked for more information]</span>
                </p>
            </div> }
            <button class='cornerBR gold highlight' style={{ bottom: '0', right: '0', 'font-weight': 700 }} onClick={() => exitTutorial()}>
                {arrows.right} Exit
            </button>
        </div>
    );
};