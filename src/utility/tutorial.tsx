import { Accessor, JSX, Match, Setter, Show, Switch, createEffect, createSignal } from "solid-js";
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

type STEP = {
    id: string;
    type: string;
    position: JSX.CSSProperties;
    class: string;
    title: string;
    content: string;
}

const BOOT_TUTORIAL_STEPS: STEP[] = [
    {
        id: "combatHud",
        type: "",
        position: { top: "17.5%", left: "2%" },
        class: "cornerTL",
        title: "↑ Game HUD ↑",
        content: "This displays your Name, Health, Stamina, and Weapon. Click your stamina, weapon or something else to potentially display more information.",
    },
    // {
    //     id: "special-actions",
    //     position: { top: "2%", right: "2%" },
    //     class: "cornerTR",
    //     title: "Special Actions ↓",
    //     content: "Actions of an othernature that are available during combat. These abilities are much more varied than physical actions, augmented by your mastery. From crowd control, damage, and healing, to moving enemies and yourself.",
    // },
    {
        id: "highlight",
        type: "action-bar",
        position: { bottom: "10%", left: "40%" },
        class: "verticalBottom",
        title: "Physical Actions →",
        content: "Physical actions that perform various attacks and movements. Each action performs a similar but distinct behavior. Some range from full fledged attacks, to forms of evasion and movement. You can 'hover' over them by dragging your finger outside the button toward and onto the button to see information specific to that button.",
    },
    {
        id: "highlight",
        type: "joystick-right",
        position: { right: "2%", top: "30%" },
        class: "middleRight",
        title: "↓ Joystick (Aim) ↓",
        content: "Manual Aim for Ranged Attacks. This grants a finer grain for projectiles. Certain specials must be manually aimed in direction and/or distance.",
    },
    {
        id: "highlight",
        type: "joystick-left",
        position: { bottom: "45%", left: "2%" },
        class: "cornerBL",
        title: "↓ Joystick (Movement) ↓",
        content: "This Joystick allows you to move your Character. Omnidirectional, and the main way you navigate this world.",
    },
    {
        id: "highlight",
        type: "smallhud",
        position: { bottom: "25%", right: "2%" },
        class: "cornerBR",
        title: "↓ Small HUD ↓",
        content: "These settings allow you to: Bring up character sheets, combat settings, combat logs, resetting the cursor (if mobile), pause (if mobile), and toggle its visibility.",
    },
    {
        id: "",
        type: "",
        position: {},
        class: "superCenter",
        title: "Enemies and NPCs",
        content: "When encountering other entities, beware of their colors: if they are tinted BLUE, they are friendly NPCs, capable of giving either important information, or perhaps trade for better garments. If they are tinted RED, they are potential enemies, and it is up to you to decide how you wish to engage with them, as dialog is still an option.",
    }
];

const DEATH_TUTORIAL_STEPS: STEP[] = [
    {
        id: "",
        type: "",
        position: {},
        class: "superCenter",
        title: "So You Died (I'm Sorry)",
        content: "At the moment, death isn't so bad. The enemies that were attacking you revert to a docile state (I hope). You can still travel and play with 0 health, although combat is inaccessible until you gain at least 1 health point back. You can drink your firewater flask in your inventory, or acquire the healing special action and cast it. Good luck!"
    },{
        id: "combatHud",
        type: "",
        position: { top: "17.5%", left: "2%" },
        class: "cornerTL",
        title: "↑ Your Death ↑",
        content: "It's 0 and Red. You may get used to seeing that, unfortunately."
    },{
        id: "combatHud",
        type: "",
        position: { left: "50%", transform: "translateX(-25%)" },
        class: "verticalTop",
        title: "← Your Weapon?",
        content: "Perhaps it isn't your fault, it's simply the tool you possess. Do you have another? Don't forget its damage types and your prayers!"
    },{
        id: "highlight",
        type: "action-bar",
        position: { bottom: "10%", left: "40%" },
        class: "verticalBottom",
        title: "Specials Actions →",
        content: "Perhaps there are too many buttons? Juggling five potential specials on top of physicals. Maybe just have one big button? Only physicals? 5 Total, a mix between physicals and specials?"
    },{
        id: "highlight",
        type: "joystick-right",
        position: { right: "2%", top: "30%" },
        class: "middleRight",
        title: "↓ Joystick (Aim) ↓",
        content: "Manual Aim, Should I Even Bother? Is this absurd or reasonable? It seems like it works fine, and auto aim is the default."
    },
];

const CHARACTER_TUTORIAL_STEPS: STEP[] = [
    {
        id: "character",
        type: "character-buttons",
        position: {left: "40%", height: "75vh", "text-align":"left"},
        class: "superCenter",
        title: "Cycle between character information →",
        content: `Press the button in the top right corner to switch info.
(Quests) Your current quests and their progress.
(Reputation) Your standing with various factions.
(Skills) Your effectiveness to wield a type of weapon.
(Statistics) Your combat and prayer history.
(Talents) The enhancement of your physicals and specials. 
(Traits) Percularities of your character, e.g. who you embody of the Ancients or Daethos.`
    },{
        id: "character",
        type: "expanded-info",
        position: {left: "2%", top: "15%", width: "25%", height: "55%"},
        class: "cornerTL",
        title: "Expanded Character Info →",
        content: "Extra information about your character's combat statistics. Click on various aspects for Expanded information"
    }
];

const FAITH_TUTORIAL_STEPS: STEP[] = [
    {
        id: "character",
        type: "blessing-display",
        position: {transform: "translate(-25%,-50%)"},
        class: "superCenter",
        title: "← Blessing Display",
        content: "Displaying equipment to inspect their influence, detailing information about the Ancient or Deity in question."
    },{
        id: "character",
        type: "deity-concern",
        position: {left: "2%", top: "15%", width: "25%"},
        class: "cornerTL",
        title: "\nDeific Concerns →",
        content: "Your conscious and othernatural connections with the deities of this world.\n\n"
    },{
        id: "character",
        type: "deity-display",
        position: {transform: "translate(-75%,-50%)"},
        class: "superCenter",
        title: "Deity Display →",
        content: "Contains all the deities you may have heard about. Displays their favored and governed attribute."
    },
];

const INVENTORY_TUTORIAL_STEPS: STEP[] = [
    {
        id: "character",
        type: "inventory",
        position: {left: "2%", top: "20%", height: "55%", width: "25%"},
        class: "cornerTL",
        title: "Inventory →",
        content: "Click Inventory to view your Equipment or Expanded Stats. When equipping gear, will allow you to see its real time changes to your character."
    },{
        id: "character",
        type: "inventory-compare",
        position: {left: "0.25%", top: "10%", height: "70%", width: "28.5%"},
        class: "cornerTL",
        title: "Click inventory for Comparison →",
        content: "Clicking on an inventory item will compare it to the like item you have equipped. You may remove and destroy, equip (if you qualify), or even upgrade! Rings and Weapons can be inspected for specific comparison."
    },{
        id: "character",
        type: "inventory",
        position: {right: "25%", width: "28%", height: "70%"},
        class: "superCenter",
        title: "\nInventory Pouch →",
        content: "Contains all the loot you've collected. Click an item to highlight it for comparison. You can also drag and drop, or double-click items to swap and reorganize your inventory."
    },
];

const LOOT_TUTORIAL_STEPS: STEP[] = [
    {
        id: "",
        type: "",
        position: {top: "25%", width: "75%"},
        class: "superCenter",
        title: "↓ Loot Drops ↓",
        content: `Displays equipment information and the option to pick it up. This will stay on the ground in the world if you don't.`
    },
];

const SETTINGS_TUTORIAL_STEPS: STEP[] = [
    {
        id: "character",
        type: "settings-buttons",
        position: {width: "28.5%", "text-align":"left"},
        class: "superCenter",
        title: "↑ Game Topics →",
        content: `(Actions) Physical Action Details.
(Specials) Special Action Details.
(Control) In-Game Controls.
(General) Game Information.
(Inventory) Inventory Panel Information.
(Tactics) Combat Setting Details.\n\n`
    },{
        id: "character",
        type: "expanded-info",
        position: {left: "75%", width: "28.5%", transform: "translate(-25%,-50%)", "text-align":"left"},
        class: "superCenter",
        title: "← Setting Type",
        content: `Adjust or Change Gameplay Settings.
(Buttons) Remap Physical and Special Action Buttons.
(Post Fx) Adjust/Enable VFX.
(Settings) Change various gameplay settings, e.g. combat, sound.
(UI) Change the position and/or scale of elements. \n\n`
    }
];

const VIEWS_TUTORIAL_STEPS: STEP[] = [
    {
        id: "character",
        type: "inv-button",
        position: {left: "15%", "text-align":"left"},
        class: "cornerTL",
        title: "← Click to Cycle Between Different Sheets.",
        content: `(Inventory) Displays all your loot. \n(Character) Displays expanded player info. \n(Settings) show gameplay information. \n(Personal) Shows general and personal deific info.`
    },{
        id: "character",
        type: "stats-display",
        position: {height: "65%", width: "27%"},
        class: "superCenter",
        title: "← Equipment / Stats / Special Inventory ↑",
        content: "Toggles your current inventory equipment and your character's current statistics. Also can switch between your equipment and special inventory."
    },{
        id: "character",
        type: "character-display",
        position: {height: "55%", width: "27%"},
        class: "superCenter",
        title: "← Character Display",
        content: `Displaying your name, health, equipment, and experience. Each equipment can be clicked for more information`
    },{
        id: "character",
        type: "firewater-button",
        position: {right: "1%", top: "15%", height: "45%", width: "27%"},
        class: "cornerTR",
        title: "Firewater ↑",
        content: `This is a bottle of Fyervas Firewater to replenish health to full, containing a maximum of 5 uses before needing to be refilled.`
    },
];

// const arrows = {
//     up: "↑",
//     down: "↓",
//     left: "←",
//     right: "→",
// };

export default function TutorialOverlay({ ascean, settings, tutorial, show, setShow }: { ascean: Accessor<Ascean>; settings: Accessor<Settings>; tutorial: Accessor<string>; show: Accessor<boolean>; setShow: Setter<boolean>; }) {
    const [deity, setDeity] = createSignal<string>("");
    const [currentStep, setCurrentStep] = createSignal<number>(0);

    const actions: {[key:string]: () => Promise<void>} = {
        blessPlayer: () => blessPlayer(),
        rebukePlayer: () => rebukePlayer(),
    };
    function performAction(key: string) {
        const actionFunction = actions[key];
        if (actionFunction) {
            actionFunction();
        };
    };

    const steps = () => {
        switch (tutorial()) {
            case "boot": return BOOT_TUTORIAL_STEPS;
            case "death": return DEATH_TUTORIAL_STEPS;
            case "character": return CHARACTER_TUTORIAL_STEPS;
            case "faith": return FAITH_TUTORIAL_STEPS;
            case "views": return VIEWS_TUTORIAL_STEPS;
            case "loot": return LOOT_TUTORIAL_STEPS;
            case "settings": return SETTINGS_TUTORIAL_STEPS;
            case "inventory": return INVENTORY_TUTORIAL_STEPS;
            default: return [];
        };
    };

    const totalSteps = () => steps().length;
    const step = () => steps()[currentStep()];
    const isFirst = () => currentStep() === 0;
    const isLast = () => currentStep() === totalSteps() - 1;

    const updateHighlight = () => {
        const high = step()?.id;
        const type = step()?.type;
        if (high) {
            EventBus.emit(high, type);
        };
    };

    const clearHighlight = () => {
        const high = step()?.id;
        EventBus.emit(high, "");
    };

    const next = () => {
        if (!isLast()) {
            clearHighlight();
            setCurrentStep(currentStep() + 1);
            updateHighlight();
        };
    };

    const back = () => {
        if (!isFirst()) {
            clearHighlight();
            setCurrentStep(currentStep() - 1);
            updateHighlight();
        };
    };

    const skip = () => {
        clearHighlight();
        exitTutorial();
    };

    const complete = () => {
        clearHighlight();
        exitTutorial();
    };

    setTimeout(updateHighlight, 100);

    function burning(mastery: string) {
        const achre = mastery === "achre" || mastery === "agility" || mastery === "kyosir";    
        return achre ? "achre" : "caeren";
    };

    /*
        <p class="whisperText">"Who are you?"</p>
        <p class="journeyText">
            [If you wish to peer into the land of Hush and Tendril and begin a journey of yourself and what you mean to this world, click upon the avatar. You may rebuke this calling.] 
        </p>
        <button class="rebukeButton" data-function-name="rebukePlayer">X</button>
    */

    createEffect(() => {
        if (tutorial() === "deity") {
            setDeity(`<div class="typewriterContainer" key="phenomena">
                A tendril swirls soothing about your senses,<br /> 
                Its sweetness teasing as hush soon possesses. <br /><br />
                Writhing, it warps to wrap round you, seething,<br /> 
                Forms of shade simmer to dance upon your being. <br /><br />
                Willowing with swirling swathes, it furrows and unleashes,<br /> 
                It shears and sutures you; a sheath of torrid pain and pleases. <br /><br />
                Silhouettes of mirth seeking to nourish and delight us,<br /> 
                Dripping nerve seizes your caer to flourish in detritus. <br /><br />
                And yet perchance you seek to twist ${ascean()?.faith === "Adherent" ? "adherence" : "devotion"} in its seams,<br /> 
                To taste its ${burning(ascean()?.mastery)} burning at the resin of your dreams. <br />
                <p class="${ascean()?.faith === "Adherent" ? "adherentText" : ascean()?.faith === "Devoted" ? "devotedText" : "otherText"}">
                You become attuned to a halt and paltry whisper,<br /> 
                It rings and stretches your soft edges,<br /> 
                Pleading yield and hither.
                </p>
                <button class="button" data-function-name="blessPlayer">
                <img src=${ascean()?.faith === "Adherent" ? "../assets/images/achreo-rising.png" : ascean()?.faith === "Devoted" ? "../assets/images/daethos-forming.png" : "../assets/images/" + ascean().origin + "-" + ascean().sex + ".jpg"} alt=${ascean().faith}  class=${"godBorder"+ascean().mastery.charAt(0).toUpperCase()+ascean().mastery.slice(1)} />
                </button>
                </div>`
            );
        };
    });
    function highestFaith() {
        const influences = [ascean().weaponOne.influences?.[0], ascean()?.weaponTwo.influences?.[0], ascean()?.weaponThree.influences?.[0], ascean()?.amulet.influences?.[0], ascean().trinket.influences?.[0]];
        const faithsCount = influences.reduce((acc: any, faith: any) => {
            if (acc[faith]) { 
                acc[faith]++; 
            } else { 
                acc[faith] = 1; 
            };
            return acc;
        }, {});
        const faithsArray = Object.entries(faithsCount).filter((faith: any) => faith[0] !== "");
        const highestFaith = faithsArray.reduce((acc: any, faith: any) => {
            if (acc[1] < faith[1]) acc = faith;
            return acc;
        }, faithsArray[0]);
        return highestFaith[0];
    };
    async function blessPlayer(): Promise<void> {
        try {
            // const entry = {
            //     title: "Who am I?",
            //     body: `You felt the presence of... ${highestFaith()}? \n\n You become attuned to a halt and paltry whisper, ringing, it stretches your soft edges, serenity begging you hither. \n\n "Who are you?"`,
            //     footnote: `Seems you've been blessed by ${highestFaith()}, or some greater mimicry of them. It asked who you were, how would it not know?`,
            //     date: Date.now(),
            //     location: "Unknown",
            // };
            // const res = await blessAscean(ascean()._id, entry);
            // EventBus.emit("fetch-ascean", res.data._id);
            // EventBus.emit("update-pause", false);
            // EventBus.emit("update-small-hud");
            // addSpecial(ascean, settings, "Invoke");
            EventBus.emit("bless-player", highestFaith());
            await exitTutorial();
        } catch (err: any) {
            console.warn(err, "%c <- You have an error in blessing a player", "color: red");
        };
    };
    async function rebukePlayer(): Promise<void> {
        try {
            // const entry = {
            //     title: "Who am I?",
            //     body: `You felt the presence of... ${highestFaith()}? \n\n You become attuned to a halt and paltry whisper, ringing, it stretches your soft edges, serenity begging you hither. \n\n "Who are you?"`,
            //     footnote: `Some mimicry of ${highestFaith()} asked who you were, as though the true incarnation would not know? Careful of what you rebuke, ${ascean().name}.`,
            //     date: Date.now(),
            //     location: "Unknown",
            // };
            // const res = await curseAscean(ascean()._id, entry);
            // EventBus.emit("fetch-ascean", res.data._id);
            // EventBus.emit("update-pause", false);
            // EventBus.emit("update-small-hud");
            EventBus.emit("rebuke-player", highestFaith());
            await exitTutorial();
            // addSpecial(ascean, settings, "Invoke");
        } catch (err: any) {
            console.warn(err, "%c <- You have an error in rebuking a player", "color: red");
        };
    };
    async function exitTutorial(): Promise<void> {
        try {
            const tut = tutorial();
            const update = { ...settings(), tutorial: { ...settings().tutorial, [tut]: true} };
            EventBus.emit("save-settings", update);
            setShow(!show());
        } catch (err: any) {
            console.warn(err.message);
        };
    };
    return (
        <Switch>
            <Match when={tutorial() === "deity"}>
                <div class="modal deity-type" style={{ position: "absolute", height: "100%", width: "100%", "background-color": "rgba(0, 0, 0, 1)", overflow: "scroll", "scrollbar-width": "none" }}>
                    <Typewriter stringText={deity} styling={{ "overflow-y": "auto", "scrollbar-width": "none", "text-align" : "center" }} performAction={performAction} />
                </div>
            </Match>
            <Match when={totalSteps() > 0}>
                <div class="modal" style={{ "background-color": "rgba(0, 0, 0, 0.6)", "z-index": 999, "pointer-events": "none"}} />
                <Show when={step()}>
                    <div class={`creature-heading ${step().class}`} style={{ position: "fixed", "z-index": 999, padding: "1rem", "border-radius": "8px", "background-color": "rgba(0, 0, 0, 0.9)", border: "thick ridge #fdf6d8", "max-width": "400px", ...step().position }}>
                        <h1 style={{ margin: "2% auto", "white-space":"pre-wrap" }}>{step().title}</h1>
                        <p style={{ "text-align": step().position?.["text-align"] ? step().position?.["text-align"] : "center", color: "#fdf6d8", "font-size": step().class === "superCenter" ? "1.2em" : "1.5em", margin: "2% auto 10%", "white-space":"pre-wrap", "font-family":"Centaur" }}>
                            {step().content}
                        </p>

                        <div style={{ display: "flex", gap: "0.5rem", "margin-top": "1rem", "justify-content": "space-between" }}>
                            <Show when={!isLast()}>
                                <button class="highlight cornerTR" onClick={skip} style={{ padding: "0.5rem 1rem","pointer-events": "auto" }}>
                                    Skip
                                </button>
                            </Show>

                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <Show when={!isFirst()}>
                                    <button class="highlight cornerBL" onClick={back} style={{ padding: "0.5rem 1rem","pointer-events": "auto" }}>Back</button>
                                </Show>

                                <Show when={!isLast()}>
                                    <button class="highlight cornerBR" onClick={next} style={{ padding: "0.5rem 1rem","pointer-events": "auto" }}>Next ({currentStep() + 1}/{totalSteps()})</button>
                                </Show>

                                <Show when={isLast()}>
                                    <button class="animate highlight cornerBR" onClick={complete} style={{ padding: "0.5rem 1rem","pointer-events": "auto" }}>Complete</button>
                                </Show>
                            </div>
                        </div>
                    </div>
                </Show>
            </Match>
        </Switch>
    );
};