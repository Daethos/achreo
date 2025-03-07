import { Accessor, Setter, createEffect, createSignal } from "solid-js";
import { blessAscean, curseAscean } from "../assets/db/db";
import { EventBus } from "../game/EventBus";
import Typewriter from "./Typewriter";
import Ascean from "../models/ascean";
import Settings from "../models/settings";

export type Tutorial = {
    boot: boolean,
    character: boolean,
    controls: boolean,
    death: boolean,
    deity: boolean,
    dialog: boolean,
    faith: boolean,
    intro: boolean,
    inventory: boolean,
    level: boolean,
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
    deity: false,
    dialog: false,
    faith: false,
    intro: false,
    inventory: false,
    level: false,
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

export default function TutorialOverlay({ ascean, settings, tutorial, show, setShow }: { ascean: Accessor<Ascean>; settings: Accessor<Settings>; tutorial: Accessor<string>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [deity, setDeity] = createSignal<string>('');
    function performAction(actionName: string) {
        const actionFunction = actions[actionName as keyof typeof actions];
        if (actionFunction) {
            actionFunction();
        };
    };
    const actions = {
        blessPlayer: () => blessPlayer(),
        rebukePlayer: () => rebukePlayer(),
    };
    function burning(mastery: string) {
        const achre = mastery === 'achre' || mastery === 'agility' || mastery === 'kyosir';    
        return achre ? 'achre' : 'caeren';
    };
    createEffect(() => {
        if (tutorial() === 'deity') {
            setDeity(`<div class='typewriterContainer' key='phenomena'>
                A tendril swirls soothing about your senses,<br /> 
                Its sweetness teasing as hush soon possesses. <br /><br />
                Writhing, it warps to wrap round you, seething,<br /> 
                Forms of shade simmer to dance upon your being. <br /><br />
                Willowing with swirling swathes, it furrows and unleashes,<br /> 
                It shears and sutures you; a sheath of torrid pain and pleases. <br /><br />
                A silhouette of mirth, it seeks to perish and delight us,<br /> 
                Its dripping nerve seizes your caer to flourish in detritus. <br /><br />
                And yet perchance you seek to twist ${ascean()?.faith === 'Adherent' ? 'adherence' : 'devotion'} in its seams,<br /> To taste its ${burning(ascean()?.mastery)} burning at the resin of your dreams. <br /><br />
                
                <p class='${ascean()?.faith === 'Adherent' ? 'adherentText' : ascean()?.faith === 'Devoted' ? 'devotedText' : 'otherText'}'>
                You become attuned to a halt and paltry whisper,<br /> 
                It rings and stretches your soft edges,<br /> 
                Pleading yield and hither.
                </p>
                <button class='button' data-function-name='blessPlayer'>
                <img src=${ascean()?.faith === 'Adherent' ? '../assets/images/achreo-rising.jpg' : ascean()?.faith === 'Devoted' ? '../assets/images/daethos-forming.jpg' : '../assets/images/' + ascean().origin + '-' + ascean().sex + '.jpg'} alt=${ascean().faith}  class=${'godBorder'+ascean().mastery.charAt(0).toUpperCase()+ascean().mastery.slice(1)} />
                </button>
                <br />
                <p class='whisperText'>"Who are you?"</p>
                <p class='journeyText'>
                    [If you wish to peer into the land of Hush and Tendril and begin a journey of yourself and what you mean to this world, click upon the avatar. You may rebuke this calling.] 
                </p>
                <button class='rebukeButton' data-function-name='rebukePlayer'>X</button>
                </div>`
            );
        };
    });
    function highestFaith() {
        const influences = [ascean().weaponOne.influences?.[0], ascean()?.weaponTwo.influences?.[0], ascean()?.weaponThree.influences?.[0], ascean()?.amulet.influences?.[0], ascean().trinket.influences?.[0]];
        const faithsCount = influences.reduce((acc: any, faith: any) => {
            if (acc[faith]) { acc[faith]++; } else { acc[faith] = 1; };
            return acc;
        }, {});
        const faithsArray = Object.entries(faithsCount).filter((faith: any) => faith[0] !== '');
        const highestFaith = faithsArray.reduce((acc: any, faith: any) => {
            if (acc[1] < faith[1]) acc = faith;
            return acc;
        }, faithsArray[0]);
        return highestFaith[0];
    };
    async function blessPlayer(): Promise<void> {
        try {
            const entry = {
                title: 'Who am I?',
                body: `You felt the presence of... ${highestFaith()}? \n\n You become attuned to a halt and paltry whisper, ringing, it stretches your soft edges, serenity begging you hither. \n\n "Who are you?"`,
                footnote: `Seems you've been blessed by ${highestFaith()}, or some greater mimicry of them. It asked who you were, how would it not know?`,
                date: Date.now(),
                location: 'Unknown',
            };
            const res = await blessAscean(ascean()._id, entry);
            EventBus.emit('fetch-ascean', res.data._id);
            EventBus.emit('update-pause', false);
            EventBus.emit('update-small-hud');
            await exitTutorial();
        } catch (err: any) {
            console.warn(err, '%c <- You have an error in blessing a player', 'color: red');
        };
    };
    async function rebukePlayer(): Promise<void> {
        try {
            const entry = {
                title: 'Who am I?',
                body: `You felt the presence of... ${highestFaith()}? \n\n You become attuned to a halt and paltry whisper, ringing, it stretches your soft edges, serenity begging you hither. \n\n "Who are you?"`,
                footnote: `Some mimicry of ${highestFaith()} asked who you were, as though the true incarnation would not know? Careful of what you rebuke, ${ascean().name}.`,
                date: Date.now(),
                location: 'Unknown',
            };
            const res = await curseAscean(ascean()._id, entry);
            EventBus.emit('fetch-ascean', res.data._id);
            EventBus.emit('update-pause', false);
            EventBus.emit('update-small-hud');
            await exitTutorial();
        } catch (err: any) {
            console.warn(err, '%c <- You have an error in rebuking a player', 'color: red');
        };
    };
    async function exitTutorial(): Promise<void> {
        try {
            const tut = tutorial();
            console.log(tut, 'Tutorial type being saved');
            const update = { ...settings(), tutorial: { ...settings().tutorial, [tut]: true} };
            EventBus.emit('save-settings', update);
            // const save = await saveTutorial(id, tutorial());
            // console.log(save, 'Saved!');
            // EventBus.emit('fetch-ascean', id);
            setShow(!show());
        } catch (err: any) {
            console.warn(err.message);
        };
    };
    return (
        <div class='modal' style={{ background: tutorial() === 'deity' ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.75)', 'z-index': 1000 }}>
            {tutorial() === 'boot' && <div>
                <p class='cornerTL gold highlight' style={{ left: '0', top: '17.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   Game HUD {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Displays your Name, Health, Stamina, Grace and Weapon <br />
                        Click your name, weapon or something else to Display More Information]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ right: '0', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Specials Actions {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Actions of an othernature that are available during combat. <br />
                        These abilities are much more varied than physical actions, augmented by your mastery. <br /> From crowd control, damage, and healing, to moving enemies and yourself.]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '10%', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Physical Actions {arrows.right} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Physical Actions that perform various attacks and movements. <br />
                        Each action performs a similar but distinct behavior. <br /> Some range from full fledged attacks, to forms of evasion and movement.]</span>
                </p>
                <p class='middleRight gold highlight' style={{ right: '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Joystick (Aim) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Manual Aim for Ranged Attacks. This grants a finer grain for projectiles. <br /> Certain specials must be manually aimed.]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '0', left: '1em', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Joystick (Movement) {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[This Joystick allows you to move your Character. <br /> Omnidirectional, and the main way you navigate this world.]</span>
                </p>
            </div>}
            {tutorial() === 'death' && <div>
                <p class='cornerTL gold highlight' style={{ left: '0', top: '5em', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   Your Health! {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[It's 0 and Red. You may get used to seeing that, unfortunately.]</span>
                </p>
                <p class='verticalTop gold highlight' style={{ 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.left} Your Weapon? <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Perhaps it isn't your fault, it's simply the tool you possess. Do you have another? <br /> Don't forget its damage types and your prayers!]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ top: '5em', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Specials Actions {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Perhaps there are too many buttons? Juggling five specials on top of physicals. Maybe just have one big one?]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '0', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    So You Died (I'm Sorry) <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[At the moment, death isn't so bad. The enemies that were attacking you revert to a docile state (I hope). You can still travel and play with 0 health, although combat is inaccessible until you gain at least 1 health point back. You can drink your firewater flask in your inventory, or acquire the healing special action and cast it. Good luck!]</span>
                </p>
                <p class='middleRight gold highlight' style={{ 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Joystick (Aim) {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Manual Aim, Should I Even Bother? Is this absurd or reasonable? It seems like it works fine, and auto aim is the default.]</span>
                </p>
            </div>}
            {tutorial() === 'character' && <div>
                <p class='cornerTR gold highlight' style={{ right: '12.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    Cycle between character information {arrows.right}  <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[(Reputation) Your standing with other enemy factions, enabling other interactions, <br />
                        (Skills) Your ability to wield a type of weapon, affecting crit, glance, and blind attacks, <br />
                        (Statistics) display your combat history, like which prayer you hope for the most, and to whom,<br /> 
                        (Traits) display percularities of your character, e.g. who you embody of the Ancients or Daethos]</span>
                </p>
                <p class='verticalBottom gold highlight' style={{ bottom: '0', left: '49%', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.up} Expanded Character Info <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Extra information about your character's combat statistics. <br />
                        Attributes can be Clicked for Expanded information]</span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '25%', right: '2%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }} onClick={() => exitTutorial()}>
                    Reputation / Skills / Statistics / Traits {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>
                        [Information pertaining to the above theme]</span>
                </p>
            </div>}
            {tutorial() === 'controls' && <div class='border superCenter'>
                This is the controls tutorial
            </div>}
            {tutorial() === 'dialog' && <div class='border superCenter'>
                This is the dialog tutorial
            </div>}
            {tutorial() === 'faith' && <div>
                <p class='cornerBL gold highlight' style={{ bottom: '15%', left: '3%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.up} Blessing Display {arrows.up}<br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Displaying equipment to inspect their influence.]</span>
                </p>
                <p class='verticalTop gold highlight' style={{ left: '49%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.down} Deific Concerns {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Your conscious and othernatural connections with the deities of this world.]</span>
                </p> 
                <p class='cornerBR gold highlight' style={{ bottom: '10%', right: '3.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }} onClick={() => exitTutorial()}>
                    {arrows.up} Deity Display {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Contains all the deities you may have heard about. <br /> Displays their favored and governed attribute.]</span>
                </p>
            </div>}
            {tutorial() === 'inventory' && <div>
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
            </div>}
            {tutorial() === 'loot' && <div style={{ 'z-index': 1000 }}>
                <p class='superCenter gold highlight' style={{ top: '30%', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   Loot Drops from Enemies and the Wild {arrows.down} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Scrollable container displaying equipment information and the option to pick it up <br />
                        This will stay on the ground in the world if you don't pick it up.]</span>
                </p>
            </div>}
            {tutorial() === 'settings' && <div>
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
                        (Post Fx) Enable and Adjust Visual Effects.<br />
                        (UI) Change the Position and Scale of your UI.
                        ]
                    </span>
                </p>
                <p class='cornerBR gold highlight' style={{ bottom: '10%', right: '1.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.up} Displayed Game Information
                    <br /> 
                    <span class='super' style={{ color: '#fdf6d8' }}>[Each topic displays extended information and <br /> sheds clarity on aspects of the game and gameplay]</span>
                </p>
            </div>}
            {tutorial() === 'views' && <div>
                <p class='cornerTL gold highlight' style={{ left: '12.5%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                   {arrows.left} Click here to cycle between different overall views. <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[(Inventory) Displays All Your Loot, (Character) Displays Expanded Player Info, <br /> (Settings) Show Gameplay Information, (Personal) Shows General and Personal Deific Info]</span>
                </p>
                <p class='cornerTR gold highlight' style={{ top: '15%', right: '5%', 'font-weight': 700, border: '0.1em solid #fdf6d8', width: '20%' }}>
                    {arrows.up} Equipment / Player Stats {arrows.up} <br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Toggles your current equipment and your current statistics.]</span>
                </p>
                <p class='cornerBL gold highlight' style={{ bottom: '0', left: '1.25%', 'font-size': '1em', 'font-weight': 700, border: '0.1em solid #fdf6d8' }}>
                    {arrows.up} Character Display {arrows.up}<br />
                    <span class='super' style={{ color: '#fdf6d8' }}>[Displaying your name, health, equipment, and experience. <br />
                        Equipment can be clicked for more information]</span>
                </p>
            </div>}
            {tutorial() === 'deity' && <div 
                style={{ position: 'absolute', height: '100%', width: '100%', background: 'rgba(0, 0, 0, 1)', display: 'inline-flex', overflow: 'scroll', 'scrollbar-width': 'none' }}>
                <Typewriter stringText={deity} styling={{ 'overflow-y': 'auto', 'scrollbar-width': 'none', 'text-align' : 'center' }} performAction={performAction} />
            </div>}
            {tutorial() !== 'deity' && <button class='cornerBR gold highlight animate' style={{ bottom: '0', right: '0', 'font-weight': 700 }} onClick={() => exitTutorial()}>
                {arrows.right} Exit
            </button> }
        </div>
    );
};