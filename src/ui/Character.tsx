import { Accessor, For, JSX, lazy, Match, Setter, Show, Suspense, Switch, createEffect, createSignal, createMemo } from "solid-js";
import { Form } from "solid-bootstrap";
import AttributeModal, { AttributeCompiler, AttributeNumberModal } from "../components/Attributes";
import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import Settings from "../models/settings";
import { deleteEquipment, updateSettings } from "../assets/db/db";
import { OriginModal } from "../components/Origin";
import { FaithModal } from "../components/Faith";
import { EventBus } from "../game/EventBus";
import { GameState } from "../stores/game";
import { Combat } from "../stores/combat";
import { Modal } from "../utility/buttons";
import { font, getRarityColor, masteryColor } from "../utility/styling";
import { dimensions } from "../utility/dimensions";
import { Attributes } from "../utility/attributes";
import { Reputation, FACTION } from "../utility/player";
import { playerTraits } from "../utility/ascean";
import { ACTIONS, addStance, TRAIT_SPECIALS } from "../utility/abilities"; // SPECIALS, TRAITS
import { DEITIES } from "../utility/deities";
import { Puff } from "solid-spinner";
import PhaserSettings from "./PhaserSettings";
import Statistics from "../utility/statistics";
import { DAMAGE_LOOKUP, DAMAGE_TYPE_DIALOG, deriveArmorTypeToArrayLocation, FAITH_RARITY } from "../utility/combatTypes";
import Talents from "../utility/talents";
import { ACTION_ORIGIN } from "../utility/actions";
import { svg } from "../utility/settings";
import QuestManager, { Quest, replaceChar } from "../utility/quests";
import Currency from "../utility/Currency";
import { usePhaserEvent } from "../utility/hooks";
import { roundToTwoDecimals } from "../utility/combat";
const AsceanImageCard = lazy(async () => await import("../components/AsceanImageCard"));
const ExperienceBar = lazy(async () => await import("./ExperienceBar"));
const Firewater = lazy(async () => await import("./Firewater"));
const HealthBar = lazy(async () => await import("./HealthBar"));
const Highlight = lazy(async () => await import("./Highlight"));
const InventoryPouch = lazy(async () => await import("./InventoryPouch"));
const ItemModal = lazy(async () => await import("../components/ItemModal"));
const LevelUp = lazy(async () => await import("./LevelUp"));
const SettingSetter = lazy(async () => await import("../utility/settings"));
const TutorialOverlay = lazy(async () => await import("../utility/tutorial"));
export const COST = {
    "-30": "-45 Grace",
    "-15": "-30 Grace",
    "0": "-15 Grace",
    "10": "0 Grace",
    "15": "0 Grace",
    "30": "15 Grace",
    "45": "30 Grace",
    "60": "45 Grace",
};
export const COOLDOWN = {
    "0s": "0s",
    "3s": "1s",
    "6s": "3s",
    "10s": "6s",
    "15s": "10s",
};
export const viewCycleMap = {
    Character: "Inventory",
    Inventory: "Settings",
    Settings: "Faith", // Character
    Faith: "Character",
};
const REPUTATION = {
    DEITY: "Deity",
    ENEMY: "Enemy",
    PROVINCE: "Province"
};
const nextReputation = {
    Deity: "ENEMY",
    Enemy: "PROVINCE",
    Province: "DEITY"
};
const CHARACTERS = {
    CHARACTER: "Character",
    QUESTS: "Quests",
    REPUTATION: "Reputation",
    SKILLS: "Skills",
    STATISTICS: "Statistics",
    TALENTS: "Talents",
    TRAITS: "Traits",
};
const VIEWS = {
    CHARACTER: "Character",
    INVENTORY: "Inventory",
    SETTINGS: "Settings",
    FAITH: "Faith",
};
const SETTINGS = {
    ACTIONS: "Actions",
    CONTROL: "Control",
    INVENTORY: "Inventory",
    GENERAL: "General",
    SPECIALS: "Specials",
    TACTICS: "Tactics",
};
const CONTROLS = {
    BUTTONS: "Buttons",
    DIFFICULTY: "Difficulty",
    POST_FX: "Post FX",
    PHASER_UI: "Phaser UI",
};
const FAITH = {
    DEITIES: "Deities",
    JOURNAL: "Journal",
};
const GET_FORGE_COST = {
    Common: 1,
    Uncommon: 3,
    Rare: 12,
    Epic: 60,
};
const GET_NEXT_RARITY = {
    Common: "Uncommon",
    Uncommon: "Rare",
    Rare: "Epic",
    Epic: "Legendary",
};
interface Props {
    reputation: Accessor<Reputation>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    quests: Accessor<QuestManager>;
    statistics: Accessor<Statistics>;
    talents: Accessor<Talents>;
    ascean: Accessor<Ascean>; 
    asceanState: Accessor<any>;
    game: Accessor<GameState>;
    combat: Accessor<Combat>;
};
const Character = ({ quests, reputation, settings, setSettings, statistics, talents, ascean, asceanState, game, combat }: Props) => {
    const [playerTraitWrapper, setPlayerTraitWrapper] = createSignal<any>({});
    const [dragAndDropInventory, setDragAndDropInventory] = createSignal(game()?.inventory.inventory);
    const [canUpgrade, setCanUpgrade] = createSignal<boolean>(false);
    const [forgeModalShow, setForgeModalShow] = createSignal(false); 
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [inventoryType, setInventoryType] = createSignal<string>("");
    const [highlighted, setHighlighted] = createSignal<{ item: Equipment | undefined; comparing: boolean; type: string }>({ item: undefined, comparing: false, type: "" });
    const [show, setShow] = createSignal<boolean>(false);
    const [actions, setActions] = createSignal<any[]>([]);
    const [specials, setSpecials] = createSignal<any[]>([]);
    const [inspectModalShow, setInspectModalShow] = createSignal<boolean>(false);
    const [inspectItems, setInspectItems] = createSignal<{ item: Equipment | undefined; type: string; } | any[]>([]);
    const [attrShow, setAttrShow] = createSignal<boolean>(false);
    const [attributeDisplay, setAttributeDisplay] = createSignal<{ attribute: any; show: boolean; total: number, equip: number, base: number }>({ attribute: undefined, show: false, base: 0, equip: 0, total: 0 });
    const [asceanPic, setAsceanPic] = createSignal<string>("");
    const [ringCompared, setRingCompared] = createSignal<string>("");
    const [removeModalShow, setRemoveModalShow] = createSignal<boolean>(false);
    const [weaponCompared, setWeaponCompared] = createSignal<string>("");
    const [showTalent, setShowTalent] = createSignal<any>({show:false,talent:undefined});
    const [showTalentConfirm, setShowTalentConfirm] = createSignal<any>({show:false, type:""});
    const [showQuest, setShowQuest] = createSignal<any>({show:false,quest:undefined,complete:false});
    const [showTutorial, setShowTutorial] = createSignal<boolean>(false);
    const [showInventory, setShowInventory] = createSignal<boolean>(false);
    const [tutorial, setTutorial] = createSignal<string>("");
    const [levelUpModalShow, setLevelUpModalShow] = createSignal<boolean>(false);
    const [expandedCharacter, showExpandedCharacter] = createSignal<boolean>(false);
    const [showOrigin, setShowOrigin] = createSignal<boolean>(false);
    const [showFaith, setShowFaith] = createSignal<boolean>(false);
    const [deity, setDeity] = createSignal<any>(undefined);
    const [entry, setEntry] = createSignal<any>(undefined);
    const [reputationConcern, setReputationConcern] = createSignal<string>(settings()?.reputationViews || REPUTATION.ENEMY);
    const [highlighter, setHighlighter] = createSignal<string>("");
    const [damageType, setDamageType] = createSignal({ show: false, type: "" });
    const dims = dimensions();
    const bMargin = {"margin-bottom":"3%"};
 
    createEffect(() => {
        if (ascean) {
            setAsceanPic(`../assets/images/${ascean().origin}-${ascean().sex}.jpg`);
            playerTraits(game, setPlayerTraitWrapper);
            checkSpecials();
        };
    });

    createEffect(() => {
        if (!settings().tutorial.views) {
            setShowTutorial(true);
            setTutorial("views");
        } else if (!settings().tutorial.inventory && dragAndDropInventory().length && settings().asceanViews === "Inventory") {
            setShowTutorial(true);
            setTutorial("inventory");
        } else if (!settings().tutorial.settings && settings().asceanViews === "Settings") {
            setShowTutorial(true);
            setTutorial("settings");
        } else if (!settings().tutorial.character && settings().asceanViews === "Character") {
            setShowTutorial(true);
            setTutorial("character");
        } else if (!settings().tutorial.faith && settings().asceanViews === "Faith") {
            setShowTutorial(true);
            setTutorial("faith");
        };
    });

    createEffect(() => {
        setDragAndDropInventory(game().inventory.inventory);
        checkHighlight();
    }); 

    function checkSpecials() {
        const potential = [playerTraitWrapper().primary.name, playerTraitWrapper().secondary.name, playerTraitWrapper().tertiary.name];
        const mastery = settings().totalSpecials;
        
        /* Everything pertaining to the potential specials per mastery 
            const mastery = SPECIAL[ascean().mastery]; 
        */

        /* Everything for testing 
            const mastery = SPECIALS;
        */
        
        const speaking = playerTraitWrapper();
        let extra: any[] = []; // ["Lightning"]; // Testing
        let physical = JSON.parse(JSON.stringify(ACTIONS));

        if (ascean().level >= 4) {
            for (let i = 0; i < 3; ++i) {
                const trait = TRAIT_SPECIALS[potential[i]];
                if (trait && trait.length > 0) {
                    extra = [ ...extra, ...trait ];
                };
            };
        };

        for (const traitType in speaking) {
            const trait = speaking[traitType];
            const { traitOneName, traitTwoName, traitThreeName } = trait;
            if (traitOneName === "Persuasion") {
                const pTraitOne = `${traitOneName} (${trait.name})`;
                physical.push(pTraitOne);
            };
            if (traitTwoName === "Persuasion") {
                const pTraitTwo = `${traitTwoName} (${trait.name})`;
                physical.push(pTraitTwo);
            };
            if (traitThreeName === "Persuasion") {
                const pTraitTwo = `${traitTwoName} (${trait.name})`;
                physical.push(pTraitTwo);
            };

            if (traitOneName === "Luckout") {
                const sTraitOne = `${traitOneName} (${trait.name})`;
                extra.push(sTraitOne);
            };
            if (traitTwoName === "Luckout") {
                const sTraitTwo = `${traitTwoName} (${trait.name})`;
                extra.push(sTraitTwo);
            };

            
            if (traitOneName === "Stealth" || traitTwoName === "Stealth" || traitThreeName === "Stealth") {
                if (!settings().stances.stealth && ascean().level >= 2) {
                    addStance(settings, "stealth");
                };
            };
        };

        if (extra.length > 0) {
            let start = [...mastery, ...extra];
            start.sort();
            setSpecials(start);
        } else {
            let start = [...mastery];
            start.sort();
            setSpecials(start);
        };

        setActions(physical);
    };

    const addTalent = (talent: string, type: string) => {
        if (talents().points.spent === talents().points.total) {
            setShowTalentConfirm({ show: false, type: "" });    
            return;
        };
        let newTalents = JSON.parse(JSON.stringify(talents()));
        (newTalents.talents[talent as keyof typeof newTalents.talents] as any)[type] = true;
        newTalents.points.spent += 1;
        EventBus.emit("update-talents", newTalents);
        setShowTalentConfirm({ show: false, type: "" });
    };

    const currentItemStyle = (rarity: string): JSX.CSSProperties => {
        return {border: `thick ridge ${getRarityColor(rarity)}`, "background-color": "transparent"};
    };

    const checkHighlight = () => {
        if (highlighted()?.item) {
            const item = game().inventory.inventory.find((item) => item?._id === highlighted()?.item?._id);
            if (!item) setHighlighted({ item: undefined, comparing: false, type: "" });
        };
    };

    const checkQuest = (quest: Quest) => {
        const completed = quest.requirements.technical.id === "fetch" ? quest.requirements.technical.current === quest.requirements.technical.total : quest.requirements.technical.solved;
        const questReputation = quest.requirements.reputation <= reputation().factions.find((f: FACTION) => f.name === quest.giver)?.reputation!;
        setShowQuest({show:true,quest,complete:completed&&questReputation});
    };

    const saveSettings = async (newSettings: Settings) => {
        try {
            await updateSettings(newSettings);
            setSettings(newSettings);
        } catch (err) {
            console.warn(err, "Error Saving Game Settings");
        };
    };

    const currentCharacterView = async (e: string) => {
        const newSettings: Settings = { ...settings(), characterViews: e };
        await saveSettings(newSettings);
    };

    const currentFaithView = async (e: string) => {
        const newSettings: Settings = { ...settings(), faithViews: e };
        await saveSettings(newSettings);
    };

    const currentReputationView = async (e: string) => {
        setReputationConcern(e);
        const newSettings: Settings = { ...settings(), reputationViews: e };
        await saveSettings(newSettings);
    };

    const processReputation = (concern: string) => {
        const key = concern.toLowerCase(); // "deity" or "group"
        const factions = reputation().factions.filter(faction => faction.named === false);
        
        // Separate single factions & grouped factions
        const singleFactions: FACTION[] = [];
        const groupedFactions: Record<string, FACTION> = {};
    
        factions.forEach(faction => {
            const identifiers = Array.isArray(faction[key]) ? faction[key] as string[] : [faction[key] as string];
    
            if (identifiers.length === 1) {
                const identifier = identifiers[0];
                if (!groupedFactions[identifier]) {
                    groupedFactions[identifier] = { ...faction, reputation: 0, name: identifier };
                }
                groupedFactions[identifier].reputation += faction.reputation;
            } else {
                // Multiple deities case
                identifiers.forEach(identifier => {
                    if (!groupedFactions[identifier]) {
                        groupedFactions[identifier] = { ...faction, reputation: 0, name: identifier };
                    }
                    groupedFactions[identifier].reputation += faction.reputation / identifiers.length; // Split reputation equally
                });
            };
        });
    
        return [...singleFactions, ...Object.values(groupedFactions)].sort((a, b) => a.name.localeCompare(b.name));
    };

    const createReputationBar = (faction: FACTION, concern: string): JSX.Element => {
        const positive = faction.reputation >= 0;
        let text: string;
        
        if (concern === "Enemy") {
            text = faction.name; // Keep enemy faction name
        } else if (concern === "Deity" || concern === "Province") {
            text = faction.name; // Aggregated deity/group/province name
        } else {
            text = faction[concern.toLowerCase()] as string;
        };
    
        const num = concern === "Enemy" ? 100 : concern === "Province" ? 500 : 1000;
        return <div class="skill-bar">
            <p class="skill-bar-text fadeInScale">{text}: {positive ? `${Math.floor(faction.reputation)} / ${num}` : `${Math.floor(faction.reputation)} / -${num}`}</p>
            <div class="skill-bar-fill" style={{"background":`${positive ? "blue" : "red"}`, "width": `${Math.abs(faction.reputation / (concern === "Enemy" ? 1 : concern === "Province" ? 5 : 10))}%`}}></div>
        </div>;  
    };

    const createSkillBar = (skill: string): JSX.Element => {
        const skillLevel = (ascean().skills as any)[skill];
        const skillCap = ascean().level * 100;
        const skillPercentage = Math.round((skillLevel / skillCap) * 100);
        return <div class="skill-bar">
            <p class="skill-bar-text fadeInScale">{skill}: {Math.floor(skillLevel / 10)} / {skillCap / 10}</p>
            <div class="skill-bar-fill" style={{"width": `${skillPercentage}%`}}></div>
        </div>;
    };

    const displayedSpecials = createMemo(() => {
        const stances = ["Stalwart"];
        if (settings().stances.caerenic) stances.push("Caerenic");
        if (settings().stances.stealth) stances.push("Stealth");
        return stances
            .concat(actions())
            .concat(specials())
            .filter((spec) => {
                let low = spec.toLowerCase();
                if (low.includes("luckout") || low.includes("persuasion")) {
                    low = low.split(" ")[0];
                };
            return talents().talents[low as keyof typeof talents];
        });
    });
    
    const characterInfo = createMemo(() => {
        switch (settings()?.characterViews) {
            case CHARACTERS.CHARACTER:
                return <div class="playerWindow creature-heading" style={{ height: `${dims.HEIGHT * 0.8}px`, left: "0.25vw", overflow: "scroll", "--glow-color":"#000", "border-color": masteryColor(ascean().mastery) }}>
                    <div>
                        <img onClick={() => setShowOrigin(!showOrigin())} id="origin-pic" src={asceanPic()} alt={ascean().name} style={{ "margin-top": "1.5%", "margin-bottom": "2.5%" }} />
                        <h2 style={{ "margin": "2%" }}>{combat()?.player?.description}</h2>
                        <div style={{ transform: dims.WIDTH > 1200 ? "scale(1)" : "scale(0.9)", "margin-top": dims.WIDTH > 1200 ? "5%" : dims.HEIGHT > 410 ? "1%" : dims.WIDTH < 875 ? "1%" : "" }}>
                            <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} setDisplay={setAttributeDisplay} />
                        </div>
                        <div style={{ "margin-bottom": "0%", "font-size": dims.WIDTH > 1200 ? "1.5em" : dims.WIDTH < 875 ? "0.95em" : "1.05em", "font-family": "Cinzel Regular", "margin-top": dims.HEIGHT > 410 ? "2.5%" : "" }}>
                            <div>Level: <span class="gold">{combat()?.player?.level}</span>{"\n"}</div>
                            <div onClick={() => setShowFaith(!showFaith())}>Faith: <span class="gold">{ascean().faith}</span> | Mastery: <span class="gold">{combat()?.player?.mastery?.charAt(0).toUpperCase() as string + combat()?.player?.mastery.slice(1)}</span></div>
                            <div>Health: <span class="gold">{Math.round(combat()?.newPlayerHealth)} / {combat()?.playerHealth}{"\n"}</span></div>
                            <div>Stamina: <span class="gold">{Math.round(combat()?.playerAttributes?.stamina as number)}</span> Grace: <span class="gold">{Math.round(combat()?.playerAttributes?.grace as number)}</span></div>
                            <div>Damage: <span class="gold">{combat()?.weapons?.[0]?.physicalDamage}</span> Physical | <span class="gold">{combat()?.weapons?.[0]?.magicalDamage}</span> Magical</div>
                            <div>Critical: <span class="gold">{combat()?.weapons?.[0]?.criticalChance}%</span> | <span class="gold">{combat()?.weapons?.[0]?.criticalDamage}x</span></div>
                            <div>Magical Defense: <span class="gold">{combat()?.playerDefense?.magicalDefenseModifier}% / [{combat()?.playerDefense?.magicalPosture}%]</span>{"\n"}</div>
                            <div>Physical Defense: <span class="gold">{combat()?.playerDefense?.physicalDefenseModifier}% / [{combat()?.playerDefense?.physicalPosture}%]</span>{"\n"}</div>
                        </div>
                    </div>
                </div>;
            case CHARACTERS.QUESTS:
                return <div class="creature-heading">
                    <h1 style={{...bMargin}}>Quests</h1>
                    <For each={quests().quests}>{(quest, _index) => {
                        const completed = quest.requirements.technical.id === "fetch"
                            ? quest.requirements.technical.current === quest.requirements.technical.total && quest.requirements.reputation <= reputation().factions.find((f: FACTION) => f.name === quest.giver)?.reputation!
                            : quest.requirements.technical.solved && quest.requirements.reputation <= reputation().factions.find((f: FACTION) => f.name === quest.giver)?.reputation!;
                        return <div class="border juiced wrap" onClick={() => checkQuest(quest)} classList={{ "borderTalent": completed }} style={{ "min-height": "100%", margin: "5% auto", "text-align": "center", "border-color": masteryColor(quest.mastery), "box-shadow": `#000 0 0 0 0.2em, ${masteryColor(quest.mastery)} 0 0 0 0.3em`, "--base-shadow":"#000 0 0 0 0.2em", "--glow-color": masteryColor(quest.mastery) }}>
                            <h2 classList={{ "animate-flicker-infinite": completed }} style={{ color: "gold", "font-size": completed ? "1.15em" : "", padding: "5px" }}>{quest.title} {completed ? "(Completed)" : ""}</h2>
                            <p style={{ "margin-left": "10%", width: "80%" }}>{quest.description}</p>    
                            <p classList={{ "animate-flicker-infinite": completed }} style={{ color: "gold", "font-size": completed ? "1.15em" : "" }}>{quest.giver}</p>
                        </div>
                    }}</For>
                </div>;
            case CHARACTERS.REPUTATION:
                const unnamed = reputationConcern() === "Enemy" 
                    ? reputation().factions.filter((faction) => faction.named === false)
                    : processReputation(reputationConcern().toLowerCase());
                return <div class="creature-heading">
                    <h1 onClick={() => currentReputationView(REPUTATION[nextReputation[reputationConcern() as keyof typeof nextReputation] as keyof typeof REPUTATION])} style={{...bMargin}}>Reputation ({reputationConcern()})</h1>
                    <div style={bMargin}>
                        <For each={unnamed}>
                            {(faction: FACTION) => (
                                createReputationBar(faction, reputationConcern())
                            )}
                        </For>
                    </div>
                </div>;
            case CHARACTERS.SKILLS:
                const skills = Object.keys(ascean().skills).map((skill) => {
                    return createSkillBar(skill);
                });
                return <div class="creature-heading">
                    <h1 style={{...bMargin}}>Skills</h1>
                    <div style={bMargin}>
                        {skills}
                    </div>
                </div>;
            case CHARACTERS.STATISTICS:
                let highestDeity = Object.entries(statistics().combat?.deities).reduce((a, b) => a?.[1] > b?.[1] ? a : b) || combat().weapons?.[0]?.influences?.[0]; // || combat().weapons?.[0]?.influences?.[0]
                const highestPrayer = Object.entries(statistics().combat?.prayers).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
                let highestMastery = Object.entries(statistics().mastery).reduce((a, b) => a[1] > b[1] ? a : b);
                if (highestMastery?.[1] === 0) highestMastery = [ascean()?.mastery, 0];
                if (highestDeity?.[1] === 0) highestDeity[0] = combat().weapons?.[0]?.influences?.[0] as string; 
                return <div class="creature-heading" style={{ "padding-bottom": "5%" }}>
                    <h1 style={{...bMargin}}>Attacks</h1>
                        Magical: <span class="gold">{statistics().combat?.attacks?.magical}</span> <br />
                        Physical: <span class="gold">{statistics().combat?.attacks?.physical}</span><br />
                        Highest Damage: <span class="gold">{Math.round(statistics().combat?.attacks?.total)}</span>
                    <h1 style={{...bMargin}}>Combat</h1>
                        Mastery: <span class="gold">{highestMastery[0].charAt(0).toUpperCase() + highestMastery[0].slice(1)} - {highestMastery[1]}</span><br />
                        Wins / Losses: <span class="gold">{statistics().combat?.wins} / {statistics().combat?.losses}</span>
                    <h1 style={{...bMargin}}>Prayers</h1>
                        Consumed / Invoked: <span class="gold">{statistics().combat?.actions?.consumes} / {statistics().combat?.actions?.prayers} </span><br />
                        Highest Prayer: <span class="gold">{highestPrayer[0].charAt(0).toUpperCase() + highestPrayer[0].slice(1)} - {highestPrayer[1]}</span><br />
                        Favored Deity: <span class="gold">{highestDeity[0]}</span><br />
                        Blessings: <span class="gold">{highestDeity[1]}</span>
                </div>;
            case CHARACTERS.TALENTS:
                if (ascean().level < 2) {
                    return <div class="creature-heading">
                        <h1>Talents Unavailable</h1>
                        <h2>Reach Level 2 to Unlock Talents</h2>
                    </div>;
                };
                return <div class="creature-heading">
                    <h1>{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</h1>
                    <h3 classList={{
                        "animate-flicker-infinite":talents().points.spent !== talents().points.total,
                        "animate-texty-infinite":talents().points.spent === talents().points.total,
                    }} style={{color:"#fdf6d8", "--glow-color":"#fdf6d8", "margin":"2.5% 0 5%"}}>{talents().points.spent} / {talents().points.total}</h3>
                    <For each={displayedSpecials()}>{(special) => {
                        let lower = special.toLowerCase();
                        if (lower.includes("luckout") || lower.includes("persuasion")) {
                            lower = lower.split(" ")[0];
                        };
                        const spec = ACTION_ORIGIN[special.toUpperCase() as keyof typeof ACTION_ORIGIN];
                        const talent = () => talents().talents[lower as keyof typeof talents] as any;
                        const physical = spec?.special.includes("Physical");
                        const stance = spec?.special.includes("Stance");
                        const efficient = () => talent().efficient;
                        const enhanced = () => talent().enhanced;
                        const cost = () => efficient()
                            ? (physical || stance) 
                                ? spec?.cost
                                : COST[spec?.cost.split(" Grace")[0] as keyof typeof COST]
                            : spec?.cost;
                        const cooldown = () => efficient()
                            ? (physical || stance) 
                                ? spec?.cooldown 
                                : COOLDOWN[spec?.cooldown as keyof typeof COOLDOWN]
                            : spec?.cooldown;
                        return <div class="border row juiced" onClick={() => setShowTalent({show:true,talent:spec})} style={{ margin: "1em auto", "border-color": masteryColor(ascean().mastery), "box-shadow": `#000 0 0 0 0.2em, ${masteryColor(ascean().mastery)} 0 0 0 0.3em` }}>
                            <div style={{ padding: "1em" }}>
                            <p style={{ color: "gold", "font-size": "1.25em", margin: "3%" }}>
                                {svg(spec?.svg)} {special.charAt(0).toUpperCase() + special.slice(1)} <br />
                            </p>
                            <p style={{ "color":"#fdf6d8", "font-size":"1em" }}>
                                {spec?.description} <span style={{ color: "gold" }}>{enhanced() ? spec?.talent.split(".")[1] : ""}</span>
                            </p>
                            <p style={{ color: stance ? "#A19D94" : physical ? "green" : "aqua" }}>
                                {spec?.time} {spec?.special} <br />
                                <span style={{ color: efficient() ? "gold" : stance ? "#A19D94" : physical ? "green" : "aqua" }}>{cost()}. {cooldown()} Cooldown</span> <br />
                            </p>
                            </div>
                        </div>
                    }}</For>
                </div>;
            case CHARACTERS.TRAITS:
                return <div class="creature-heading">
                    <h1>Traits</h1>
                    <h2><span class="gold">Dialog</span> is immediately available. <span class="gold">Stances</span> are available at level 2. <span class="gold">Specials</span> are available at level 4.</h2>
                    <h1>{playerTraitWrapper()?.primary?.name}</h1>
                    <h2> <span class="gold">{playerTraitWrapper()?.primary?.traitOneName}</span> - {playerTraitWrapper()?.primary?.traitOneDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.primary?.traitTwoName}</span> - {playerTraitWrapper()?.primary?.traitTwoDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.primary?.traitThreeName}</span> - {playerTraitWrapper()?.primary?.traitThreeDescription}</h2>
                    <h1>{playerTraitWrapper()?.secondary?.name}</h1>
                    <h2> <span class="gold">{playerTraitWrapper()?.secondary?.traitOneName}</span> - {playerTraitWrapper()?.secondary?.traitOneDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.secondary?.traitTwoName}</span> - {playerTraitWrapper()?.secondary?.traitTwoDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.secondary?.traitThreeName}</span> - {playerTraitWrapper()?.secondary?.traitThreeDescription}</h2>
                    <h1>{playerTraitWrapper()?.tertiary?.name}</h1>
                    <h2> <span class="gold">{playerTraitWrapper()?.tertiary?.traitOneName}</span> - {playerTraitWrapper()?.tertiary?.traitOneDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.tertiary?.traitTwoName}</span> - {playerTraitWrapper()?.tertiary?.traitTwoDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.tertiary?.traitThreeName}</span> - {playerTraitWrapper()?.tertiary?.traitThreeDescription}</h2>
                </div>;
            default: return ("");
        };
    });

    const createCharacterInfo = (character: string): JSX.Element | "" => {
        switch (character) {
            case CHARACTERS.CHARACTER:
                return <div class="playerWindow creature-heading" classList={{
                    "tutorial-highlight": highlighter() === "character-display",
                }} style={{ height: `${dims.HEIGHT * 0.8}px`, left: "0.25vw", overflow: "scroll", "--glow-color":"#000", "border-color": masteryColor(ascean().mastery) }}>
                    <div class="stat-panel souls" style={{ transform: dims.WIDTH > 1200 ? "scale(1)" : "scaleX(0.95) scaleY(0.99)" }}>
                    <div class="stat-section stat-row">
                        <img onClick={() => setShowOrigin(!showOrigin())} id="origin-pic" src={asceanPic()} alt={ascean().name} style={{ }} />
                        <div style={{ display: "block"}}>
                            <h1 style={{ margin: "2% auto 1%", "font-size":"1.25rem" }}>{combat()?.player?.name}</h1>
                            <h2 style={{ margin: "2% auto 1%" }}>{combat()?.player?.description}</h2>
                        </div>
                    </div>
                    <AttributeCompiler
                        ascean={ascean} 
                        setAttribute={setAttribute} 
                        show={attrShow} 
                        setShow={setAttrShow} 
                        setDisplay={setAttributeDisplay} 
                    />
                    <div class="stat-section" />
                    <div class="stat-section">
                        <div class="stat-row">
                            <span class="stat-label">Level:</span>
                            <span class="stat-value gold">{combat()?.player?.level}</span>
                        </div>
                        <div class="stat-row" onClick={() => setShowFaith(!showFaith())}>
                            <span class="stat-label">Faith:</span>
                            <span class="stat-value gold">{ascean().faith}</span>
                        </div>
                        <div class="stat-row" onClick={() => setShowFaith(!showFaith())}>
                            <span class="stat-label">Mastery:</span>
                            <span class="stat-value gold">
                                {combat()?.player?.mastery?.charAt(0).toUpperCase() as string + combat()?.player?.mastery.slice(1)}
                            </span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Health:</span>
                            <span class="stat-value gold">{Math.round(combat()?.newPlayerHealth)} / {combat()?.playerHealth}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Stamina:</span>
                            <span class="stat-value gold">{Math.round(combat()?.playerAttributes?.stamina as number)}</span>
                            <span class="divider">|</span>
                            <span class="stat-label">Grace:</span>
                            <span class="stat-value gold">{Math.round(combat()?.playerAttributes?.grace as number)}</span>
                        </div>
                    </div>

                    <div class="stat-card" style={{ "margin-bottom": "1rem"}}>
                        <div class="stat-label-header">OFFENSE</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.type === "Ancient Shard" ? "Shard" : combat()?.weapons?.[0]?.type}</div>
                                <div class="small-label">Style</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.playerDamageType}</div>
                                <div class="small-label">Type</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.grip}</div>
                                <div class="small-label">Grip</div>
                            </div>
                        </div>
                        
                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">DAMAGE</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.physicalDamage}</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.magicalDamage}</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">CRITICAL</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.criticalChance}%</div>
                                <div class="small-label">Chance</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.criticalDamage}x</div>
                                <div class="small-label">Damage</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">PENETRATION</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.magicalPenetration}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.physicalPenetration}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                        </div>
                        
                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">SPECIAL</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">+{roundToTwoDecimals(combat()?.weapons?.[0]?.dodge)}%</div>
                                <div class="small-label">Dodge</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{roundToTwoDecimals(combat()?.weapons?.[0]?.roll)}%</div>
                                <div class="small-label">Roll</div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label-header">DEFENSE</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.playerDefense?.magicalDefenseModifier}% / [{combat()?.playerDefense?.magicalPosture}%]</div>
                                <div class="small-label">Magical [Postured]</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.playerDefense?.physicalDefenseModifier}% / [{combat()?.playerDefense?.physicalPosture}%]</div>
                                <div class="small-label">Physical [Postured]</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">-{combat().playerAttributes.kyosirMod / 2}%</div>
                                <div class="small-label">Critical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat().stalwart.active ? roundToTwoDecimals(combat().playerDefense?.magicalPosture / 4) : roundToTwoDecimals(combat().playerDefense?.magicalDefenseModifier / 4)}%</div>
                                <div class="small-label">Resist</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">-{roundToTwoDecimals(combat().playerAttributes.kyosirMod / 3)}%</div>
                                <div class="small-label">Roll</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">HELMET</div>
                        <div class="stat-label gold" style={{ margin: "-2% auto 3%" }}>({ascean().helmet.type})</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div class="center">
                                <div class="gold">{ascean().helmet.physicalResistance}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{ascean().helmet.magicalResistance}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div onClick={() => setDamageType({ show: true, type: "Blunt" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[0][0][deriveArmorTypeToArrayLocation(ascean().helmet.type)]}x</div>
                                <div class="small-label">Blunt</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Pierce" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[4][0][deriveArmorTypeToArrayLocation(ascean().helmet.type)]}x</div>
                                <div class="small-label">Pierce</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Slash" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[8][0][deriveArmorTypeToArrayLocation(ascean().helmet.type)]}x</div>
                                <div class="small-label">Slash</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">CHEST</div>
                        <div class="stat-label gold" style={{ margin: "-2% auto 3%" }}>({ascean().chest.type})</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div class="center">
                                <div class="gold">{ascean().chest.physicalResistance}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{ascean().chest.magicalResistance}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div onClick={() => setDamageType({ show: true, type: "Blunt" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[0][1][deriveArmorTypeToArrayLocation(ascean().chest.type)]}x</div>
                                <div class="small-label">Blunt</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Pierce" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[4][1][deriveArmorTypeToArrayLocation(ascean().chest.type)]}x</div>
                                <div class="small-label">Pierce</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Slash" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[8][1][deriveArmorTypeToArrayLocation(ascean().chest.type)]}x</div>
                                <div class="small-label">Slash</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">LEGS</div>
                        <div class="stat-label gold" style={{ margin: "-2% auto 3%" }}>({ascean().legs.type})</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div class="center">
                                <div class="gold">{ascean().legs.physicalResistance}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{ascean().legs.magicalResistance}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div onClick={() => setDamageType({ show: true, type: "Blunt" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[0][2][deriveArmorTypeToArrayLocation(ascean().legs.type)]}x</div>
                                <div class="small-label">Blunt</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Pierce" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[4][2][deriveArmorTypeToArrayLocation(ascean().legs.type)]}x</div>
                                <div class="small-label">Pierce</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Slash" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[8][2][deriveArmorTypeToArrayLocation(ascean().legs.type)]}x</div>
                                <div class="small-label">Slash</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
            case CHARACTERS.QUESTS:
                return <div class="creature-heading">
                    <h1 style={{...bMargin}}>Quests</h1>
                    <For each={quests().quests}>{(quest, _index) => {
                        return <div class="border juiced wrap" onClick={() => checkQuest(quest)} style={{ "min-height": "100%", margin: "5% auto", "text-align": "center", "border-color": masteryColor(quest.mastery), "box-shadow": `#000 0 0 0 0.2em, ${masteryColor(quest.mastery)} 0 0 0 0.3em` }}>
                            <h2 style={{ color: "gold" }}>{quest.title}</h2>
                            <p style={{ "margin-left": "10%", width: "80%" }}>{quest.description}</p>    
                            <p style={{ color: "gold" }}>{quest.giver}</p>
                        </div>
                    }}</For>
                </div>;
            case CHARACTERS.REPUTATION:
                const unnamed = reputationConcern() === "Enemy" 
                    ? reputation().factions.filter((faction) => faction.named === false)
                    : processReputation(reputationConcern().toLowerCase());
                return <div class="creature-heading">
                    <h1 onClick={() => currentReputationView(REPUTATION[nextReputation[reputationConcern() as keyof typeof nextReputation] as keyof typeof REPUTATION])} style={{...bMargin}}>Reputation ({reputationConcern()})</h1>
                    <div style={bMargin}>
                        <For each={unnamed}>
                            {(faction: FACTION) => (
                                createReputationBar(faction, reputationConcern())
                            )}
                        </For>
                    </div>
                </div>;
            case CHARACTERS.SKILLS:
                const skills = Object.keys(ascean().skills).map((skill) => {
                    return createSkillBar(skill);
                });
                return <div class="creature-heading">
                    <h1 style={{...bMargin}}>Skills</h1>
                    <div style={bMargin}>
                        {skills}
                    </div>
                </div>;
            case CHARACTERS.STATISTICS:
                let highestDeity = Object.entries(statistics().combat?.deities).reduce((a, b) => a?.[1] > b?.[1] ? a : b) || combat().weapons?.[0]?.influences?.[0]; // || combat().weapons?.[0]?.influences?.[0]
                const highestPrayer = Object.entries(statistics().combat?.prayers).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
                let highestMastery = Object.entries(statistics().mastery).reduce((a, b) => a[1] > b[1] ? a : b);
                if (highestMastery?.[1] === 0) highestMastery = [ascean()?.mastery, 0];
                if (highestDeity?.[1] === 0) highestDeity[0] = combat().weapons?.[0]?.influences?.[0] as string; 
                return <div class="creature-heading ">
                    <h1 style={{...bMargin}}>Attacks</h1>
                        Magical: <span class="gold">{statistics().combat?.attacks?.magical}</span> <br />
                        Physical: <span class="gold">{statistics().combat?.attacks?.physical}</span><br />
                        Highest Damage: <span class="gold">{Math.round(statistics().combat?.attacks?.total)}</span>
                    <h1 style={{...bMargin}}>Combat</h1>
                        Mastery: <span class="gold">{highestMastery[0].charAt(0).toUpperCase() + highestMastery[0].slice(1)} - {highestMastery[1]}</span><br />
                        Wins / Losses: <span class="gold">{statistics().combat?.wins} / {statistics().combat?.losses}</span>
                    <h1 style={{...bMargin}}>Prayers</h1>
                        Consumed / Invoked: <span class="gold">{statistics().combat?.actions?.consumes} / {statistics().combat?.actions?.prayers} </span><br />
                        Highest Prayer: <span class="gold">{highestPrayer[0].charAt(0).toUpperCase() + highestPrayer[0].slice(1)} - {highestPrayer[1]}</span><br />
                        Favored Deity: <span class="gold">{highestDeity[0]}</span><br />
                        Blessings: <span class="gold">{highestDeity[1]}</span>
                </div>;
            case CHARACTERS.TALENTS:
                if (ascean().level < 2) {
                    return <div class="creature-heading">
                        <h1>Talents Are Available Starting at Level 2.</h1>
                    </div>;
                };
                return <div class="creature-heading">
                    <h1>{ascean().mastery.charAt(0).toUpperCase() + ascean().mastery.slice(1)}</h1>
                    <h3 classList={{
                        "animate-flicker-infinite":talents().points.spent !== talents().points.total,
                        "animate-texty-infinite":talents().points.spent === talents().points.total,
                    }} style={{color:"#fdf6d8", "--glow-color":"#fdf6d8", "margin":"2.5% 0 5%"}}>{talents().points.spent} / {talents().points.total}</h3>
                    <For each={displayedSpecials()}>{(special) => {
                        const spec = ACTION_ORIGIN[special.toUpperCase() as keyof typeof ACTION_ORIGIN];
                        const efficient = (talents().talents[special.toLowerCase() as keyof typeof talents] as any).efficient;
                        const enhanced = (talents().talents[special.toLowerCase() as keyof typeof talents] as any).enhanced;
                        const cost = efficient ? COST[spec?.cost.split(" Grace")[0] as keyof typeof COST] : spec?.cost;
                        const cooldown = efficient ? COOLDOWN[spec?.cooldown as keyof typeof COOLDOWN] : spec?.cooldown;
                        return <div class="border row juiced" onClick={() => setShowTalent({show:true,talent:spec})} style={{ margin: "1em auto", "border-color": masteryColor(ascean().mastery), "box-shadow": `#000 0 0 0 0.2em, ${masteryColor(ascean().mastery)} 0 0 0 0.3em` }}>
                            <div style={{ padding: "1em" }}>
                            <p style={{ color: "gold", "font-size": "1.25em", margin: "3%" }}>
                                {svg(spec?.svg)} {special.charAt(0).toUpperCase() + special.slice(1)} <br />
                            </p>
                            <p style={{ "color":"#fdf6d8", "font-size":"1em" }}>
                                {spec?.description} <span style={{ color: "gold" }}>{enhanced ? spec?.talent.split(".")[1] : ""}</span>
                            </p>
                            <p style={{ color: "aqua" }}>
                                {spec?.time} {spec?.special} <br />
                                <span style={{ color: efficient ? "gold" : "aqua" }}>{cost}. {cooldown} Cooldown</span> <br />
                            </p>
                            </div>
                        </div>
                    }}</For>
                </div>;
            case CHARACTERS.TRAITS:
                return <div class="creature-heading">
                    <h1>{playerTraitWrapper()?.primary?.name}</h1>
                    <h2> <span class="gold">{playerTraitWrapper()?.primary?.traitOneName}</span> - {playerTraitWrapper()?.primary?.traitOneDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.primary?.traitTwoName}</span> - {playerTraitWrapper()?.primary?.traitTwoDescription}</h2>
                    <h1>{playerTraitWrapper()?.secondary?.name}</h1>
                    <h2> <span class="gold">{playerTraitWrapper()?.secondary?.traitOneName}</span> - {playerTraitWrapper()?.secondary?.traitOneDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.secondary?.traitTwoName}</span> - {playerTraitWrapper()?.secondary?.traitTwoDescription}</h2>
                    <h1>{playerTraitWrapper()?.tertiary?.name}</h1>
                    <h2> <span class="gold">{playerTraitWrapper()?.tertiary?.traitOneName}</span> - {playerTraitWrapper()?.tertiary?.traitOneDescription}</h2>
                    <h2> <span class="gold">{playerTraitWrapper()?.tertiary?.traitTwoName}</span> - {playerTraitWrapper()?.tertiary?.traitTwoDescription}</h2>
                </div>;
            default: return ("");
        };
    }; 

    const createPrayerInfo = (): JSX.Element => {
        const highestDeity = Object.entries(statistics().combat?.deities).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
        const highestPrayer = Object.entries(statistics().combat?.prayers).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
        let highestMastery = Object.entries(statistics().mastery).reduce((a, b) => a[1] > b[1] ? a : b);
        if (highestMastery?.[1] === 0) highestMastery = [ascean()?.mastery, 0];
        const weaponInfluenceStrength = FAITH_RARITY[ascean().weaponOne.rarity as keyof typeof FAITH_RARITY];
        const amuletInfluenceStrength = FAITH_RARITY[ascean().amulet.rarity as keyof typeof FAITH_RARITY];
        const trinketInfluenceStrength = FAITH_RARITY[ascean().trinket.rarity as keyof typeof FAITH_RARITY];
        return <div class="creature-heading" style={{ padding: "5%" }}>
            <h1 style={{...bMargin}}>Influence</h1>
            <h2>The influences of your equipment increase the likelihood of receiving a prayer from the associated deity.</h2>
                {ascean().weaponOne.name}: <span class="gold" style={{ animation: "flicker 0.75s ease alternate", "--glow-color":"gold" }}>{ascean().weaponOne?.influences?.[0]} [{weaponInfluenceStrength}]</span><br />
                {ascean().amulet.name}: <span class="gold" style={{ animation: "flicker 0.75s ease alternate", "--glow-color":"gold" }}>{ascean().amulet?.influences?.length as number > 0 ? `${ascean().amulet?.influences?.[0]}` : ""} [{amuletInfluenceStrength}]</span><br />
                {ascean().trinket.name}: <span class="gold" style={{ animation: "flicker 0.75s ease alternate", "--glow-color":"gold" }}>{ascean().amulet?.influences?.length as number > 0 ? `${ascean().trinket?.influences?.[0]}` : ""} [{trinketInfluenceStrength}]</span>        
            <h1 style={{...bMargin}}>Prayers</h1>
            <h2>That which you seek in combat.</h2>
                Mastery: <span class="gold">{highestMastery[0].charAt(0).toUpperCase() + highestMastery[0].slice(1)} - {highestMastery[1]}</span><br />
                Consumed / Invoked: <span class="gold">{statistics().combat?.actions?.consumes} / {statistics().combat?.actions?.prayers} </span><br />
                Highest Prayer: <span class="gold">{highestPrayer[0].charAt(0).toUpperCase() + highestPrayer[0].slice(1)} - {highestPrayer[1]}</span><br />
                Favored Deity: <span class="gold">{highestDeity[0]}</span><br />
                Blessings: <span class="gold">{highestDeity[1]}</span>
            <h1 style={{...bMargin}}>Traits</h1>
            <h2>That which you invoke without intent.</h2>
            {playerTraitWrapper()?.primary?.name} <span class="gold">({playerTraitWrapper()?.primary?.traitOneName}, {playerTraitWrapper()?.primary?.traitTwoName}, {playerTraitWrapper()?.primary?.traitThreeName})</span><br />
            {playerTraitWrapper()?.secondary?.name} <span class="gold">({playerTraitWrapper()?.secondary?.traitOneName}, {playerTraitWrapper()?.secondary?.traitTwoName}, {playerTraitWrapper()?.secondary?.traitThreeName})</span><br />
            {playerTraitWrapper()?.tertiary?.name} <span class="gold">({playerTraitWrapper()?.tertiary?.traitOneName}, {playerTraitWrapper()?.tertiary?.traitTwoName}, {playerTraitWrapper()?.tertiary?.traitThreeName})</span>
        </div>;
    };

    const createDeityInfo = (deity: string): JSX.Element => {
        const info = DEITIES[deity as keyof typeof DEITIES];
        return <div class="creature-heading">
            <h1>{info?.name}</h1>
            <h4 class="gold cinzel">{info?.favor}</h4>
            <h2>{info?.origin}</h2>
            <p class="gold">{info?.description}</p>
            <h2>{info?.worship}</h2>
        </div>;
    };

    const journalScroll = (): JSX.Element => {
        if (ascean().journal.entries.length === 0) {
            setEntry(undefined);
            return <div class="center creature-heading">
                <h1>Journal</h1>
                <h2>There are no entries in your journal.</h2>
            </div>;
        };
        const currentEntry = ascean().journal.entries[ascean().journal.currentEntry];
        setEntry(currentEntry);
        const next = ascean().journal.entries.length > ascean().journal.currentEntry + 1 ? ascean().journal.currentEntry + 1 : 0;
        const prev = ascean().journal.currentEntry > 0 ? ascean().journal.entries[ascean().journal.currentEntry - 1] : ascean().journal.entries.length - 1;
        const formattedDate = new Date(entry().date).toISOString().split("T")[0].replace(/-/g, " ");
        return <div class="center creature-heading wrap" style={{ "flex-wrap": "wrap", "margin-top": "12.5%" }}>
            <button onClick={() => setCurrentEntry(prev as number)} class="highlight cornerTL">Prev</button>
            <button onClick={() => setCurrentEntry(next as number)} class="highlight cornerTR">Next</button>
            <h1>{entry().title}</h1>
            <h4 style={{ margin: "4%" }}>{formattedDate}</h4>
            <h2>{entry().body}</h2>
            <h6 class="gold">{entry().footnote}</h6>
            <h6>[Location: {entry().location || "???"}]</h6>
        </div>;
    };

    const createDeityScroll = (): JSX.Element => {
        const deities = [];
        for (const deity in DEITIES) {
            deities.push(DEITIES[deity as keyof typeof DEITIES]);
        };
        return <div class="center" style={{ "flex-wrap": "wrap" }}>
            <div class="creature-heading">
            <For each={deities}>
                {(deity: any) => (
                    <div>
                        <h1 style={{ "font-size": "1.2em" }}>{deity?.name}</h1>
                        <h2>Favor: {deity?.favor}</h2> 
                    </div>
                )}
            </For>
            </div>
        </div>;
    };

    function setCurrentEntry(e: number) {
        const newEntry = ascean().journal.entries[e];
        setEntry(newEntry);
        const newJournal = { ...ascean().journal, currentEntry: e };
        const update = { ...ascean(), journal: newJournal };
        EventBus.emit("update-ascean", update);
    };

    async function currentView(e: string) {
        const newSettings: Settings = { ...settings(), settingViews: e };
        await saveSettings(newSettings);
    };

    async function setNextView() {
        const nextView = viewCycleMap[settings().asceanViews as keyof typeof viewCycleMap];
        if (nextView) {
            showExpandedCharacter(false);
            const newSettings: Settings = { ...settings(), asceanViews: nextView };
            await saveSettings(newSettings);
        };
    }; 

    async function handleUpgradeItem() {
        if (highlighted().item?.rarity === "Common" && ascean()?.currency?.gold < GET_FORGE_COST.Common) {
            return;
        } else if (highlighted().item?.rarity === "Uncommon" && ascean()?.currency?.gold < 3) {
            return;
        } else if (highlighted().item?.rarity === "Rare" && ascean()?.currency?.gold < 12) {
            return;
        } else if (highlighted().item?.rarity === "Epic" && ascean()?.currency?.gold < 60) {
            return;
        } else if (highlighted().item?.rarity === "Legendary" && ascean()?.currency?.gold < 300) {
            return;
        } else if (highlighted().item?.rarity === "Mythic" && ascean()?.currency?.gold < 1500) {
            return;
        } else if (highlighted().item?.rarity === "Divine" && ascean()?.currency?.gold < 7500) {
            return;
        } else if (highlighted().item?.rarity === "Ascended" && ascean()?.currency?.gold < 37500) {
            return;
        } else if (highlighted().item?.rarity === "Godly" && ascean()?.currency?.gold < 225000) {
            return;
        };
        try {
            EventBus.emit("alert", { header: `Upgrading ${highlighted().item?.name}`, body: `You have upgraded several ${highlighted().item?.rarity} ${highlighted().item?.name} to one of ${GET_NEXT_RARITY[highlighted()?.item?.rarity as string as keyof typeof GET_NEXT_RARITY]} rarity.`});
            let match = JSON.parse(JSON.stringify(dragAndDropInventory()));
            match = match.filter((item: Equipment) => item && item.name === highlighted().item?.name && item?.rarity === highlighted().item?.rarity);
            const data = {
                asceanID: ascean()._id,
                upgradeID: highlighted().item?._id,
                upgradeName: highlighted().item?.name,
                upgradeType: highlighted().item?.itemType,
                currentRarity: highlighted().item?.rarity,
                inventoryType: inventoryType(),
                upgradeMatches: match,
            };
            EventBus.emit("upgrade-item", data);
            EventBus.emit("play-equip");
            setForgeModalShow(false);
            setCanUpgrade(false);
            setInspectModalShow(false);
        } catch (err: any) {
            EventBus.emit("alert", { header: `ERROR: Upgrading ${highlighted().item?.name}`, body: `${err?.message}`});
            EventBus.emit("special-combat-text", { playerSpecialDescription: `Warning: Upgrading ${highlighted().item?.name} \n ${err?.message}`});
        };
    };

    function handleInspect(type: string): void {
        try {
            if (type === "weaponOne" || type === "weaponTwo" || type === "weaponThree") {
                setWeaponCompared(type);
            } else if (type === "ringOne" || type === "ringTwo") {
                setRingCompared(type);
            };
            setInspectModalShow(false);
        } catch (err: any) {
            EventBus.emit("alert", { header: "ERROR: Inspecting Equipment", body: `${err?.message}`});
            EventBus.emit("special-combat-text", { playerSpecialDescription: `Warning: Inspecting Equipment \n ${err?.message}`});
        };
    };

    async function removeItem(id: string): Promise<void> {
        await deleteEquipment(id);
        const newInventory = game().inventory.inventory.filter((item) => item._id !== id);
        EventBus.emit("refresh-inventory", newInventory);
        setRemoveModalShow(false);
    }; 

    function item(rarity: string) {
        return {
            "border": "0.2em solid " + getRarityColor(rarity),
            "transform": "scale(1.1)",
            "background-color": "black",
            "margin-top": "0.25em",
            "margin-bottom": "0.25em",
            "padding-bottom": "-0.25em"
        };
    };

    function info(item: Equipment) {
        setDeity(item?.influences?.[0]);
    };

    usePhaserEvent("character", (type: string) => {
        console.log({ type });
        setHighlighter(type);
    });

    return (
        <div class="characterMenu" classList={{
            "tutorial-highlight": !settings().tutorial.boot,
        }}>
        {/*  <<----------- BUTTONS ----------->> */}
        { settings().asceanViews === VIEWS.CHARACTER ? ( <>
            <button class="highlight menuHeader" onClick={() => setNextView()}><div class="playerMenuHeading">Character</div></button>
            <div class="playerSettingSelect" classList={{
                "tutorial-highlight": highlighter() === "character-buttons",
            }}>
                { settings().characterViews === CHARACTERS.QUESTS ? (
                    <button class="highlight menuButton" classList={{
                        "animate": highlighter() === "character-buttons",
                    }} onClick={() => currentCharacterView(CHARACTERS.REPUTATION)}>
                        <div>Quests</div>
                    </button> 
                ) : settings().characterViews === CHARACTERS.REPUTATION ? (
                    <button class="highlight menuButton" classList={{
                        "animate": highlighter() === "character-buttons",
                    }} onClick={() => currentCharacterView(CHARACTERS.SKILLS)}>
                        <div>Reputation</div>
                    </button>
                ) : settings().characterViews === CHARACTERS.SKILLS ? (
                    <button class="highlight menuButton" classList={{
                        "animate": highlighter() === "character-buttons",
                    }} onClick={() => currentCharacterView(CHARACTERS.STATISTICS)}>
                        <div>Skills</div>
                    </button>
                ) : settings().characterViews === CHARACTERS.STATISTICS ? (
                    <button class="highlight menuButton" classList={{
                        "animate": highlighter() === "character-buttons",
                    }} onClick={() => currentCharacterView(CHARACTERS.TALENTS)}>
                        <div>Statistics</div>
                    </button>
                ) : settings().characterViews === CHARACTERS.TALENTS ? (
                    <button class="highlight menuButton" classList={{
                        "animate": highlighter() === "character-buttons",
                    }} onClick={(() => currentCharacterView(CHARACTERS.TRAITS))}>
                        <div>Talents</div>
                    </button>
                ) : (
                    <button class="highlight menuButton" classList={{
                        "animate": highlighter() === "character-buttons",
                    }} onClick={() => currentCharacterView(CHARACTERS.QUESTS)}>
                        <div>Traits</div>
                    </button>
                ) }     
            </div> 
        </> ) : settings().asceanViews === VIEWS.INVENTORY ? ( <>
            <button class="highlight menuHeader" classList={{
                "tutorial-highlight": highlighter() === "inv-button",
                "animate": highlighter() === "inv-button",
            }} onClick={() => setNextView()} style={{ position: "fixed", top: "0", left: "0", margin: "0.5%" }}>
                <div class="playerMenuHeading">Inventory</div>
            </button>

            <button class="highlight" classList={{
                "tutorial-highlight": highlighter() === "stats-display",
                "animate": highlighter() === "stats-display",
            }} onClick={() => showExpandedCharacter(!expandedCharacter())} style={{ position: "fixed", top: "", right: "20vw", "z-index": 1 }}>
                <div>{expandedCharacter() === true ? "Player Stats" : "Equipment"}</div>
            </button>

            <div class="center" style={{ position: "fixed", top: "-0.25vh", right: "5.5vw", height: "10vh", width: "15vw", background: "#000", "scale": "0.8", border: `1px solid ${masteryColor(ascean().mastery)}` }}>
                <Currency ascean={ascean} />
            </div>
            <Suspense fallback={<Puff color="gold"/>}>
                <Firewater ascean={ascean} highlighter={highlighter} />
            </Suspense>
        </> ) : settings().asceanViews === VIEWS.SETTINGS ? ( <>
            <button class="highlight menuHeader" onClick={() => setNextView()}><div class="playerMenuHeading">Gameplay</div></button>
            {(settings().control !== CONTROLS.POST_FX && settings().control !== CONTROLS.PHASER_UI) && (
                <div class="playerSettingSelect" classList={{
                    "tutorial-highlight": highlighter() === "settings-buttons",
                    animate: highlighter() === "settings-buttons"
                }} style={{ right: "0.75vw" }}>
                    <button class="highlight menuButton insideMenu" classList={{
                    animate: highlighter() === "settings-buttons"
                }} onClick={() => currentView(SETTINGS.ACTIONS)}><div>Actions</div></button>
                    <button class="highlight menuButton insideMenu" classList={{
                    animate: highlighter() === "settings-buttons"
                }} onClick={() => currentView(SETTINGS.SPECIALS)}><div>Specials</div></button>
                    <button class="highlight menuButton insideMenu" classList={{
                    animate: highlighter() === "settings-buttons"
                }} onClick={() => currentView(SETTINGS.CONTROL)}><div>Control</div></button>
                    <button class="highlight menuButton insideMenu" classList={{
                    animate: highlighter() === "settings-buttons"
                }} onClick={() => currentView(SETTINGS.GENERAL)}><div>General</div></button>
                    <button class="highlight menuButton insideMenu" classList={{
                    animate: highlighter() === "settings-buttons"
                }} onClick={() => currentView(SETTINGS.INVENTORY)}><div>Inventory</div></button>
                    <button class="highlight menuButton insideMenu" classList={{
                    animate: highlighter() === "settings-buttons"
                }} onClick={() => currentView(SETTINGS.TACTICS)}><div>Tactics</div></button>
                </div>
            )}
        </> ) : ( <>
            <button class="highlight menuHeader" onClick={() => setNextView()}><div class="playerMenuHeading">Personal</div></button>
            <div class="playerSettingSelect">
            { settings().faithViews === FAITH.DEITIES ? (
                <button class="highlight menuButton" onClick={() => currentFaithView(FAITH.JOURNAL)}>
                    <div>Deities</div>
                </button>
            ) : (
                <button class="highlight menuButton" onClick={() => currentFaithView(FAITH.DEITIES)}>
                    <div>Journal</div>
                </button>
            ) }     
            </div>
        </> ) }
        {/* <<---------- WINDOW ONE ---------->> */}
        <Show when={(settings().control !== CONTROLS.POST_FX && settings().control !== CONTROLS.PHASER_UI) || settings().asceanViews !== VIEWS.SETTINGS}>
            <Switch>
                <Match when={settings().asceanViews === VIEWS.SETTINGS}>
                    <div class="playerWindow" style={{ height: `${dims.HEIGHT * 0.8}px`, left: "0.25vw", overflow: "hidden", "border-color": masteryColor(ascean().mastery) }}>
                        <div style={{ "justify-content": "center", "align-items": "center", "text-align": "center" }}>
                            <p style={{ color: "gold", "font-size": "1.25em" }}>Feedback</p>
                            <Form class="verticalCenter" style={{ "text-wrap": "balance" }}>
                                <Form.Text class="text-muted">
                                    If you happen across any bugs, errors, or have any thoughts about the game, please leave an email. It would greatly help understanding my blindspots as a developer and programmer.
                                </Form.Text>
                                <br /><br />
                            <Form.Group class="mb-3" controlId="formBasicEmail">
                                <Form.Text class="text-muted gold">
                                    Warning: This will prompt your browser to open up a mail service of your choice.
                                </Form.Text>
                                <br /><br />
                                <a href="mailto:ascean@gmx.com">Send Gameplay Feedback</a>
                                <br /><br />
                                <Form.Text class="text-muted gold">
                                    [Bugs, Errors, Issues, Suggestions]
                                </Form.Text>
                            </Form.Group>
                            </Form>
                        </div>
                    </div>
                </Match>    
                <Match when={settings().asceanViews === VIEWS.INVENTORY && expandedCharacter() === true}>
                    {createCharacterInfo(CHARACTERS.CHARACTER)}
                </Match>
                <Match when={settings().asceanViews !== VIEWS.SETTINGS && settings().asceanViews !== VIEWS.FAITH && expandedCharacter() !== true}>
                    <div class="playerWindow" classList={{
                        "tutorial-highlight": highlighter() === "character-display",
                    }} style={{ height: `${dims.HEIGHT * 0.8}px`, left: "0.25vw", "border-color": masteryColor(ascean().mastery) }}>
                        {/* <button class="highlight cornerTL" style={{ "background-color": "blue", "z-index": 1, "font-size": "0.25em", padding: "0.25em" }} onClick={() => getInventory()}>
                            <p>Get Eqp</p>
                        </button> */}
                        {/* <button class="highlight cornerBL" style={{ "background-color": "green", "z-index": 1, "font-size": "0.25em", padding: "0.25em" }} onClick={() => getMoney()}>
                            <p>Get Money</p>
                        </button> */}
                        {/* <button class="highlight cornerBR" style={{ "background-color": "gold", "z-index": 1, "font-size": "0.25em", padding: "0.25em" }} onClick={() => getExperience()}>
                            <p>Get Exp</p>
                        </button> */}
                        <Show when={ascean().experience >= ascean().level * 1000}>
                            <button class="highlight cornerTR" style={{ "background-color": "purple", "z-index": 1, "font-size": "0.5em", padding: "0.25em", "border-radius":"0.25rem" }} onClick={() => setLevelUpModalShow(!levelUpModalShow())}>
                                <p class="animate" style={{ "padding-left": "0.75em", "padding-right": "0.75em", margin: "0 0 3% 0" }}>Level++</p>
                            </button>
                        </Show>
                        <div style={{ "display": "grid", "align-items": "center", "grid-template-rows": "auto 1fr auto" }}>
                            <div style={{ "padding-top": (ascean().experience >= ascean().level * 1000) ? "1.5rem" : "1.25rem" }}>
                                <Suspense fallback={<Puff color="gold"/>}>
                                    <HealthBar combat={combat} enemy={false} game={game} />
                                </Suspense>
                            </div>
                            <div style={{ transform: "scale(0.9)", "margin-top":"5%", "margin-bottom":"-5%" }}>
                                <Suspense fallback={<Puff color="gold"/>}>
                                    <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
                                </Suspense>
                            </div>
                            <div style={{ "padding-bottom": "" }}>
                                <Suspense fallback={<Puff color="gold"/>}>
                                    <ExperienceBar ascean={ascean} game={game} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </Match>
                <Match when={settings().asceanViews === VIEWS.FAITH}>
                    <div class="playerWindow" classList={{
                        "tutorial-highlight": highlighter() === "blessing-display",
                    }} style={{ height: `${dims.HEIGHT * 0.8}px`, left: "0.25vw", overflow: "scroll", "border-color": masteryColor(ascean().mastery) }}>
                        <div style={{ "margin-left": "0", "margin-top": "7.5%", transform: "scale(0.9)" }}>
                            <div class="creature-heading" style={{ "margin-top": "-5%" }}>
                                <h1>Blessings</h1>
                            </div>
                            <div style={{ width: "70%", margin: "auto", padding: "1em", display: "grid" }}>
                            <div class="imageCardMiddle" style={{ "left": "50%" }}>
                                <div onClick={() =>info(ascean().weaponOne)} style={item(ascean().weaponOne.rarity as string)}>
                                    <img alt="item" style={{ height: "100%", width: "100%" }} src={ascean().weaponOne.imgUrl} />
                                </div>
                                <div onClick={() =>info(ascean().amulet)} style={item(ascean().amulet.rarity as string)}>
                                    <img alt="item" style={{ height: "100%", width: "100%" }} src={ascean().amulet.imgUrl} />
                                </div>
                                <div onClick={() =>info(ascean().trinket)} style={item(ascean().trinket.rarity as string)}>
                                    <img alt="item" style={{ height: "100%", width: "100%" }} src={ascean().trinket.imgUrl} />
                                </div>
                            </div>
                            </div>
                        </div>
                        <div class="wrap">
                            {createDeityInfo(deity())}
                        </div>
                    </div>
                </Match>    
            </Switch>
        </Show>
        {/* <<---------- WINDOW TWO ---------->> */}
        <div class="playerWindow" classList={{
                "tutorial-highlight": (highlighter() === "deity-concern" || highlighter() === "expanded-info" || highlighter() === "inventory-compare"),
            }} style={{ height: `${dims.HEIGHT * ((settings().asceanViews === VIEWS.SETTINGS && (settings().control === CONTROLS.POST_FX || settings().control === CONTROLS.PHASER_UI)) ? 0.7 : 0.8)}px`, left: "33.5vw", top: (settings().asceanViews === VIEWS.SETTINGS && (settings().control === CONTROLS.POST_FX || settings().control === CONTROLS.PHASER_UI)) ? "1vh" : "", "border-color": masteryColor(ascean().mastery) }}>
            { settings().asceanViews === VIEWS.CHARACTER ? (
                <div class="center creature-heading" style={{ overflow: "scroll", "scrollbar-width": "none" }}>
                    <div class="stat-panel souls" style={{ transform: dims.WIDTH > 1200 ? "scale(1)" : "scaleX(0.95) scaleY(0.99)" }}>
                    <div class="stat-section stat-row">
                        <img class="" onClick={() => setShowOrigin(!showOrigin())} id="origin-pic" src={asceanPic()} alt={ascean().name} />
                        <div style={{ display: "block"}}>
                            <h1 style={{ margin: "2% auto 1%", "font-size":"1.25rem" }}>{combat()?.player?.name}</h1>
                            <h2 style={{ margin: "2% auto 1%" }}>{combat()?.player?.description}</h2>
                        </div>
                    </div>
                    <AttributeCompiler
                        ascean={ascean} 
                        setAttribute={setAttribute} 
                        show={attrShow} 
                        setShow={setAttrShow} 
                        setDisplay={setAttributeDisplay} 
                    />
                    <div class="stat-section" />
                    <div class="stat-section">
                        <div class="stat-row">
                            <span class="stat-label">Level:</span>
                            <span class="stat-value gold">{combat()?.player?.level}</span>
                        </div>
                        <div class="stat-row" onClick={() => setShowFaith(!showFaith())}>
                            <span class="stat-label">Faith:</span>
                            <span class="stat-value gold">{ascean().faith}</span>
                        </div>
                        <div class="stat-row" onClick={() => setShowFaith(!showFaith())}>
                            <span class="stat-label">Mastery:</span>
                            <span class="stat-value gold">
                                {combat()?.player?.mastery?.charAt(0).toUpperCase() as string + combat()?.player?.mastery.slice(1)}
                            </span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Health:</span>
                            <span class="stat-value gold">{Math.round(combat()?.newPlayerHealth)} / {combat()?.playerHealth}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Stamina:</span>
                            <span class="stat-value gold">{Math.round(combat()?.playerAttributes?.stamina as number)}</span>
                            <span class="divider">|</span>
                            <span class="stat-label">Grace:</span>
                            <span class="stat-value gold">{Math.round(combat()?.playerAttributes?.grace as number)}</span>
                        </div>
                    </div>

                    <div class="stat-card" style={{ "margin-bottom": "1rem"}}>
                        <div class="stat-label-header">OFFENSE</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.type === "Ancient Shard" ? "Shard" : combat()?.weapons?.[0]?.type}</div>
                                <div class="small-label">Style</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.playerDamageType}</div>
                                <div class="small-label">Type</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.grip}</div>
                                <div class="small-label">Grip</div>
                            </div>
                        </div>
                        
                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">DAMAGE</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.physicalDamage}</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.magicalDamage}</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">CRITICAL</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.criticalChance}%</div>
                                <div class="small-label">Chance</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.criticalDamage}x</div>
                                <div class="small-label">Damage</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">PENETRATION</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.magicalPenetration}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.weapons?.[0]?.physicalPenetration}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                        </div>
                        
                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">SPECIAL</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">+{roundToTwoDecimals(combat()?.weapons?.[0]?.dodge)}%</div>
                                <div class="small-label">Dodge</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{roundToTwoDecimals(combat()?.weapons?.[0]?.roll)}%</div>
                                <div class="small-label">Roll</div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label-header">DEFENSE</div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">{combat()?.playerDefense?.magicalDefenseModifier}% / [{combat()?.playerDefense?.magicalPosture}%]</div>
                                <div class="small-label">Magical [Postured]</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat()?.playerDefense?.physicalDefenseModifier}% / [{combat()?.playerDefense?.physicalPosture}%]</div>
                                <div class="small-label">Physical [Postured]</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div class="center">
                                <div class="gold">-{combat().playerAttributes.kyosirMod / 2}%</div>
                                <div class="small-label">Critical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{combat().stalwart.active ? roundToTwoDecimals(combat().playerDefense?.magicalPosture / 4) : roundToTwoDecimals(combat().playerDefense?.magicalDefenseModifier / 4)}%</div>
                                <div class="small-label">Resist</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">-{roundToTwoDecimals(combat().playerAttributes.kyosirMod / 3)}%</div>
                                <div class="small-label">Roll</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">HELMET</div>
                        <div class="stat-label gold" style={{ margin: "-2% auto 3%" }}>({ascean().helmet.type})</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div class="center">
                                <div class="gold">{ascean().helmet.physicalResistance}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{ascean().helmet.magicalResistance}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div onClick={() => setDamageType({ show: true, type: "Blunt" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[0][0][deriveArmorTypeToArrayLocation(ascean().helmet.type)]}x</div>
                                <div class="small-label">Blunt</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Pierce" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[4][0][deriveArmorTypeToArrayLocation(ascean().helmet.type)]}x</div>
                                <div class="small-label">Pierce</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Slash" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[8][0][deriveArmorTypeToArrayLocation(ascean().helmet.type)]}x</div>
                                <div class="small-label">Slash</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">CHEST</div>
                        <div class="stat-label gold" style={{ margin: "-2% auto 3%" }}>({ascean().chest.type})</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div class="center">
                                <div class="gold">{ascean().chest.physicalResistance}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{ascean().chest.magicalResistance}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div onClick={() => setDamageType({ show: true, type: "Blunt" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[0][1][deriveArmorTypeToArrayLocation(ascean().chest.type)]}x</div>
                                <div class="small-label">Blunt</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Pierce" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[4][1][deriveArmorTypeToArrayLocation(ascean().chest.type)]}x</div>
                                <div class="small-label">Pierce</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Slash" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[8][1][deriveArmorTypeToArrayLocation(ascean().chest.type)]}x</div>
                                <div class="small-label">Slash</div>
                            </div>
                        </div>

                        <div class="softBottomBorder" />
                        <div class="stat-label-middle">LEGS</div>
                        <div class="stat-label gold" style={{ margin: "-2% auto 3%" }}>({ascean().legs.type})</div>
                        <div style={{ display: "flex", "justify-content": "space-around" }}>
                            <div class="center">
                                <div class="gold">{ascean().legs.physicalResistance}%</div>
                                <div class="small-label">Physical</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div class="center">
                                <div class="gold">{ascean().legs.magicalResistance}%</div>
                                <div class="small-label">Magical</div>
                            </div>
                        </div>
                        <div class="stat-flex">
                            <div onClick={() => setDamageType({ show: true, type: "Blunt" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[0][2][deriveArmorTypeToArrayLocation(ascean().legs.type)]}x</div>
                                <div class="small-label">Blunt</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Pierce" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[4][2][deriveArmorTypeToArrayLocation(ascean().legs.type)]}x</div>
                                <div class="small-label">Pierce</div>
                            </div>
                            <div class="softLeftBorder"></div>
                            <div onClick={() => setDamageType({ show: true, type: "Slash" })} class="center">
                                <div class="gold">{DAMAGE_LOOKUP[8][2][deriveArmorTypeToArrayLocation(ascean().legs.type)]}x</div>
                                <div class="small-label">Slash</div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            ) : settings().asceanViews === VIEWS.INVENTORY ? (
                highlighted().comparing && (
                    <Suspense fallback={<Puff color="gold"/>}>
                    <Highlight ascean={ascean} pouch={dragAndDropInventory} 
                        highlighted={highlighted as Accessor<{item: Equipment, comparing: boolean, type: string}>} 
                        inventoryType={inventoryType} ringCompared={ringCompared} weaponCompared={weaponCompared} 
                        setInspectItems={setInspectItems as Setter<{ item: Equipment | undefined; type: string; }[]>} 
                        setInspectModalShow={setInspectModalShow} 
                        setRemoveModalShow={setRemoveModalShow} removeModalShow={removeModalShow} 
                        upgrade={canUpgrade} setUpgrade={setCanUpgrade}
                    />
                    </Suspense>
                )
            ) : settings().asceanViews === VIEWS.SETTINGS ? (
                <PhaserSettings settings={settings} setSettings={setSettings} actions={actions} specials={specials} />
            ) : ( 
                <div class="center wrap" style={{ "margin-top": "-2.5%" }}> 
                    {createPrayerInfo()}
                </div>
             ) }
        </div>
        {/* <<---------- WINDOW THREE ---------->> */}
        <Show when={(settings().control !== CONTROLS.POST_FX && settings().control !== CONTROLS.PHASER_UI) || settings().asceanViews !== VIEWS.SETTINGS}>
            <div class="playerWindow" classList={{
                    "tutorial-highlight": (highlighter() === "deity-display" || highlighter() === "character-buttons" || highlighter() === "inventory" || highlighter() === "inventory-compare" || highlighter() === "settings-buttons"),
                }} style={{height: `${dims.HEIGHT * 0.8}px`, left: "66.75vw", "border-color": masteryColor(ascean().mastery)}}>
                { settings().asceanViews === VIEWS.CHARACTER ? (
                    <div class="center wrap"> 
                        {characterInfo()}
                    </div>
                ) : settings().asceanViews === VIEWS.INVENTORY ? ( 
                    <Suspense fallback={<Puff color="gold"/>}>
                        <InventoryPouch ascean={ascean} setRingCompared={setRingCompared} highlighted={highlighted} setHighlighted={setHighlighted} setInventoryType={setInventoryType} setWeaponCompared={setWeaponCompared} setDragAndDropInventory={setDragAndDropInventory} dragAndDropInventory={dragAndDropInventory} />
                    </Suspense>
                ) : settings().asceanViews === VIEWS.SETTINGS ? (
                    <div style={{ "scrollbar-width": "none", overflow: "scroll" }}> 
                        <div class="center" style={{ padding: "5%", "font-size": "0.75em" }}>
                        <Suspense fallback={<Puff color="gold"/>}>
                            <SettingSetter actions={actions} setting={settings} specials={specials} />
                        </Suspense>
                        </div>
                    </div>
                ) : ( 
                    <div style={{ "scrollbar-width": "none", overflow: "scroll" }}>
                        <div class="center" style={{ padding: "2.5%" }}>{settings().faithViews === FAITH.DEITIES ? (createDeityScroll()) : (journalScroll())}</div>
                    </div>
                 ) }
            </div>
        </Show>
        {/* <<---------- MODAL WINDOWS ---------->> */}
        <Show when={levelUpModalShow()}>
            <Suspense fallback={<Puff color="gold"/>}>
                <LevelUp ascean={ascean} asceanState={asceanState} show={levelUpModalShow} setShow={setLevelUpModalShow} />
            </Suspense>
        </Show>
        <Show when={show()}>
            <div class="modal" onClick={() => setShow(!show)}>
            <Suspense fallback={<Puff color="gold"/>}>
                <ItemModal item={equipment()} stalwart={false} caerenic={false} /> 
            </Suspense>
            </div> 
        </Show>
        <Show when={attributeDisplay().show}>
            <div class="modal" onClick={() => setAttributeDisplay({ ...attributeDisplay(), show: false })}>
                <AttributeNumberModal attribute={attributeDisplay} />
            </div>
        </Show>
        <Show when={attrShow()}>
            <div class="modal" onClick={() => setAttrShow(!attrShow())}>
                <AttributeModal attribute={attribute()} />
            </div> 
        </Show>
        <Show when={showOrigin()}>
            <div class="modal" onClick={() => setShowOrigin(!showOrigin())}>
                <OriginModal origin={ascean().origin} />
            </div>
        </Show>
        <Show when={showFaith()}>
            <div class="modal" onClick={() => setShowFaith(!showFaith())}>
                <FaithModal faith={ascean().faith} />
            </div>
        </Show>
        <Show when={(inspectModalShow() && inspectItems())}> 
            <div class="modal">
                <Modal 
                    items={inspectItems as Accessor<{ item: Equipment | undefined; type: string; }[]>} 
                    inventory={highlighted().item} callback={handleInspect} forge={forgeModalShow} setForge={setForgeModalShow} 
                    upgrade={canUpgrade} show={inspectModalShow} setShow={setInspectModalShow} 
                />
            </div>
        </Show>
        <Show when={forgeModalShow()}> 
            <div class="modal">
                <div class="border superCenter wrap" style={{ width: "50%" }}>
                <p class="center wrap" style={{ color: "red", "font-size": "1.25em", margin: "3%" }}>
                    Do You Wish To Collapse Three {highlighted()?.item?.name} into one of {GET_NEXT_RARITY[highlighted()?.item?.rarity as string as keyof typeof GET_NEXT_RARITY]} Quality for {GET_FORGE_COST[highlighted()?.item?.rarity as string as keyof typeof GET_FORGE_COST]} Gold?
                </p>
                <div>
                    <button class="highlight" style={{ color: "gold", "font-weight": 600, "font-size": "1.5em" }} onClick={() => handleUpgradeItem()}>
                        {highlighted()?.item?.rarity && GET_FORGE_COST[highlighted()?.item?.rarity as string as keyof typeof GET_FORGE_COST]} Gold Forge
                    </button>    
                    <div style={{ color: "gold", "font-weight": 600 }}>
                        <p style={{ "font-size": "2em" }}>
                            (3) <img src={highlighted()?.item?.imgUrl} alt={highlighted()?.item?.name} style={currentItemStyle(highlighted()?.item?.rarity as string)} /> 
                            {" => "} <img src={highlighted()?.item?.imgUrl} alt={highlighted()?.item?.name} style={currentItemStyle(GET_NEXT_RARITY[highlighted()?.item?.rarity as string as keyof typeof GET_NEXT_RARITY])} />
                            </p> 
                    </div>
                <button class="highlight cornerBR" style={{ "background-color": "red" }} onClick={() => setForgeModalShow(false)}>x</button>
                </div>
                </div>
            </div>
        </Show>
        <Show when={removeModalShow()}>
            <div class="modal">
            <div class="button superCenter" style={{ "background-color": "black", width: "25%" }}>
                <div>
                <div class="center" style={font("1.5em")}>Do You Wish To Remove and Destroy Your <span style={{ color: "gold" }}>{highlighted()?.item?.name}?</span> <br /><br /><div>
                    <img style={{ transform: "scale(1.25)" }} src={highlighted()?.item?.imgUrl} alt={highlighted()?.item?.name} onClick={() => removeItem(highlighted()?.item?._id as string)} />
                </div>
                </div>
                </div>
                <br /><br /><br />
                <button class="highlight cornerBR" style={{ transform: "scale(0.85)", bottom: "0", right: "0", "background-color": "red" }} onClick={() => setRemoveModalShow(!removeModalShow())}>
                    <p style={font("0.5em")}>X</p>
                </button>
            </div>
            </div>
        </Show>
        <Show when={showTutorial()}>
            <Suspense fallback={<Puff color="gold"/>}>
                <TutorialOverlay ascean={ascean} settings={settings} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} /> 
            </Suspense>
        </Show>
        <Show when={showInventory()}>
            <Suspense fallback={<Puff color="gold"/>}>
                <TutorialOverlay ascean={ascean} settings={settings} tutorial={tutorial} show={showInventory} setShow={setShowInventory} /> 
            </Suspense>
        </Show>
        <Show when={showQuest().show}>
            <div class="modal">
                <div class="superCenter" style={{ width:"65%", "max-height": "90%" }}>
                <div class="border juice" style={{ margin: "1em auto", 
                    "border-color": masteryColor(showQuest()?.quest?.mastery),
                    animation: `borderTalent 1.5s infinite ease alternate`, 
                    "--base-shadow":"#000 0 0 0 0.2em", 
                    "box-shadow": `#000 0 0 0 0.2em, ${masteryColor(showQuest()?.quest?.mastery)} 0 0 0 0.3em`, 
                    "--glow-color": masteryColor(showQuest()?.quest.mastery) 
                }}>
                    <div class="creature-heading" style={{ padding: "0.5em" }}>
                    <h1 class="center" classList={{
                    "animate-flicker-infinite": showQuest()?.complete,
                }} style={{ color: showQuest()?.complete ? "gold" : "#fdf6d8", margin: "2.5%" }}>
                        {showQuest()?.quest.title} {showQuest()?.complete ? "(Completed)" : ""}<br />
                    </h1>
                    <h2 class="center" style={{ color: "gold" }}>
                        Quest Giver: {showQuest()?.quest.giver}, Level {showQuest()?.quest.level} ({showQuest()?.quest?.mastery.charAt(0).toUpperCase() + showQuest()?.quest?.mastery.slice(1)}) <br />
                    </h2>
                    <p class="wrap" style={{ "color":"#fdf6d8", "font-size":"1em", "margin": "2.5%" }}>
                        {showQuest()?.quest.description}
                    </p>
                    <div class="row" style={{ display: "block" }}>
                    <h4 class="gold" style={{margin: "0", padding: "1% 0", display: "inline-block", width: "40%", "margin-left": "5%"}}>
                        Requirements
                    </h4>
                    <h4 class="gold" style={{margin: "0", padding: "1% 0", display: "inline-block", width: "40%", "margin-left": "5%"}}>
                        Rewards
                    </h4>
                    <br />
                    <p style={{ display: "inline-block", width: "40%", "margin": "0 0 1.5% 7.5%" }}>
                        Level: <span class="gold">{showQuest()?.quest?.requirements.level}</span><br />
                        Reputation: <span class="gold">{showQuest()?.quest?.requirements.reputation}</span><br />
                        <span>{showQuest()?.quest?.requirements?.technical?.id === "fetch" ? <>Task: <span class="gold">{showQuest()?.quest?.requirements?.technical?.current} / {showQuest()?.quest?.requirements?.technical?.total}</span></> : showQuest()?.quest?.requirements?.technical?.solved ? <span class="gold">Solved</span> : "Unsolved"}</span><br />
                    </p>
                    <p style={{ display: "inline-block", width: "40%", "margin": "0 0 1.5% 7.5%" }}>
                        Currency: <span class="gold">{showQuest()?.quest?.rewards?.currency?.gold}g {showQuest()?.quest.rewards?.currency?.silver}s.</span><br />
                        Experience: <span class="gold">{showQuest()?.quest?.rewards?.experience}</span><br />
                        Items: <For each={showQuest()?.quest?.rewards?.items}>{(item, index) => {
                            const length = showQuest()?.quest?.rewards?.items.length;
                            return <div style={{ display: "inline-block", color: "gold" }}>
                                {item}{length === 0 || length - 1 === index() ? "" : `,\xa0`}{" "}
                            </div>
                        }}</For>
                        {/* {showQuest()?.quest?.special ? <><br /> Special: <span class="gold">{showQuest()?.quest?.special}</span></> : ""} */}
                    </p>
                    </div>
                    {showQuest()?.quest?.special ? <h4 class="center">Special?: <span class="gold">It's a Mystery</span></h4> : ""}
                    <h2 class="wrap" style={{ "text-align":"center", color: "gold", margin: "1.5% auto", padding: "" }}>
                        {replaceChar(showQuest()?.quest?.requirements.description, showQuest()?.quest?.giver)}
                    </h2>
                    </div>
                </div>
                </div>
                <button class="highlight cornerTR" style={{ "color": "red" }} onClick={() => {EventBus.emit("remove-quest", showQuest().quest); setShowQuest({ show: false, quest: undefined, complete: false });}}>
                    <p style={font("1em")}>Remove Quest</p>
                </button>
                <button class="highlight cornerBR" style={{ "color": "red" }} onClick={() => setShowQuest({ show: false, quest: undefined, complete: false })}>
                    <p style={font("1em")}>X</p>
                </button>
            </div>
        </Show>
        <Show when={showTalent().show}>
            <div class="modal">
                <div class="superCenter" style={{ "width":"65%" }}>
                <div class="border row moisten" style={{ margin: "1em auto", "max-height":"90vh",
                    overflow: "scroll", "scrollbar-width": "none",
                    "--glow-color":masteryColor(ascean().mastery),
                    "--base-shadow":"#000 0 0 0 0.2em", "border-color": masteryColor(ascean().mastery),
                    "box-shadow": `#000 0 0 0 0.2em, ${masteryColor(ascean().mastery)} 0 0 0 0.3em`,
                    animation: "borderTalent 1.5s infinite ease alternate"
                }}>
                    <div style={{ padding: "1em" }}>
                        <p class="row" style={{ color: "gold", "font-size": "1.5em", margin: "1%" }}>
                            <span style={{color:"#0ff", "margin": "1%", "--glow-color": "#0ff",
                                animation: (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).enhanced || (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? "flicker 0.75s infinite alternate" : "" }}>{svg(showTalent()?.talent.svg)}</span>
                            <span style={{color:"#0ff", "font-weight":"bold", margin:"1%", "--glow-color": "#0ff",
                                animation: (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).enhanced || (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? "flicker 0.75s infinite alternate" : ""}}>{showTalent()?.talent.name}</span>{" "} 
                        </p>
                        <span class="gold">
                        {(talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).enhanced ? <span style={{}}>(Enhanced)</span> : talents().points.spent < talents().points.total ?
                            <button class="highlight" style={{ bottom: "0", right: "0", "color": "green", padding: "" }} onClick={() => setShowTalentConfirm({show:true,type:"enhanced"})}>
                                <p style={{...font("1.1rem"), margin: "3% auto", "font-weight":900}}>Enhance</p>
                        </button> : ""}{" "}
                        {(talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? <span style={{ "margin-left": (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).enhanced ? "1%" : "" }}>(Optimized)</span> : talents().points.spent < talents().points.total ?
                            <button class="highlight" style={{ bottom: "0", right: "0", "color": "green", padding: "" }} onClick={() => setShowTalentConfirm({show:true,type:"efficient"})}>
                                <p style={{...font("1.1rem"), margin: "3% auto", "font-weight":900}}>Optimize</p>
                            </button> : ""}{" "}
                        </span>
                        {(talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient || (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).enhanced ? <br /> : ""}
                        <p style={{ "color":"gold", "font-size":"0.75em" }}>{showTalent()?.talent.talent.split(".")[1]} <br /> {showTalent()?.talent.talent.split("Enhanced:")[0]}</p>
                        <p style={{ "color":"#fdf6d8", "font-size":"1em", margin: "3% auto" }}>{showTalent()?.talent.description}</p>
                        <span style={{ color: "gold", "--glow-color":"gold","text-shadow": "0 0 5px gold, 0 0 10px gold",animation: "flicker 0.5s infinite alternate" }}>{(talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).enhanced ? showTalent()?.talent.talent.split(".")[1] : ""}</span>
                        <p style={{ color: "#0ff", margin: "2% auto"}}>
                            <span>
                                {showTalent()?.talent.time} {showTalent()?.talent.special} <br />
                            </span>
                            <span style={{ color: (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? "gold" : "#0ff", 
                                "--glow-color":(talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? "gold" : "#0ff",
                                animation: (talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? "flicker 0.5s infinite alternate" : ""
                            }}>
                                {(talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? (showTalent()?.talent.special.includes("Physical") || showTalent()?.talent.special.includes("Stance")) ? showTalent()?.talent.cost : COST[showTalent()?.talent.cost.split(" Grace")[0] as keyof typeof COST] : showTalent()?.talent.cost}.{" "}
                                {(talents().talents[showTalent()?.talent.name.toLowerCase() as keyof typeof talents] as any).efficient ? (showTalent()?.talent.special.includes("Physical") || showTalent()?.talent.special.includes("Stance")) ? showTalent()?.talent.cooldown : COOLDOWN[showTalent()?.talent.cooldown as keyof typeof COOLDOWN] : showTalent()?.talent.cooldown} Cooldown. <br />
                            </span>
                        </p>
                    </div>
                </div>
                </div>
                <button class="highlight cornerBR" style={{ "color": "red" }} onClick={() => setShowTalent({ show: false, talent: undefined })}>
                    <p style={font("1em")}>X</p>
                </button>
            </div>
        </Show>
        <Show when={showTalentConfirm().show}>
            <div class="modal">
                <div class="superCenter" style={{ width: "50%" }}>
                <div class="border row" style={{ margin: "1em auto", "border-color": masteryColor(ascean().mastery), "box-shadow": `#000 0 0 0 0.2em, ${masteryColor(ascean().mastery)} 0 0 0 0.3em` }}>
                    <div class="center" style={{ padding: "1em" }}>
                        Do you wish to <b>{showTalentConfirm().type === "efficient" ? "Optimize" : "Enhance"}</b> {showTalent()?.talent.name}? <br /><br />
                        <div class="" style={{ display: "flex", "justify-content":"space-evenly" }}>
                            <button class="highlight" style={{ bottom: "0", left: "0", "color": "green" }} onClick={() => addTalent(showTalent()?.talent.name.toLowerCase(), showTalentConfirm().type)}>
                                <p style={{...font("1.1rem"), margin: "3% auto", "font-weight":900}}>Confirm</p>
                            </button>
                            <button class="highlight" style={{ bottom: "0", right: "0", "color": "red" }} onClick={() => setShowTalentConfirm({ show: false, type: "" })}>
                                <p style={{...font("1.1rem"), margin: "3% auto", "font-weight":900}}>Cancel</p>
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </Show>
        <Show when={damageType().show}>
            <div class="modal" onClick={() => setDamageType({ show: false, type: "" })}>
                <div class="border superCenter" style={{width:"50%"}}>
                    <div class="creature-heading center wrap">
                        <h1 style={{ margin: "5% auto 3%" }}>{DAMAGE_TYPE_DIALOG[damageType().type].types}</h1>
                        <svg height="5" width="100%" class="tapered-rule" style={{ margin: "3% auto" }}>
                            <polyline points={`0,0 ${dims.WIDTH * 0.5},2.5 0,5`}></polyline>
                        </svg>
                        <h2 style={{ margin: "3% auto 5%" }}>{DAMAGE_TYPE_DIALOG[damageType().type].description}</h2>
                    </div>
                </div>
            </div>
        </Show>
        </div>
    );
}; 

export default Character;