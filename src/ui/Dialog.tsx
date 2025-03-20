import { createSignal, createEffect, Setter, Accessor, Show, onMount, For, JSX, Switch, Match } from "solid-js"
import { EventBus } from "../game/EventBus";
import { Combat } from "../stores/combat";
import Ascean from "../models/ascean";
import { GameState } from "../stores/game";
import { Institutions, IntstitutionalButtons, LocalLoreButtons, ProvincialWhispersButtons, Region, SupernaturalEntity, SupernaturalEntityButtons, SupernaturalEntityLore, SupernaturalPhenomena, SupernaturalPhenomenaButtons, SupernaturalPhenomenaLore, Whispers, WhispersButtons, WorldLoreButtons, World_Events, institutions, localLore, provincialInformation, whispers, worldLore } from "../utility/regions";
import { LuckoutModal, PersuasionModal, QuestModal, checkTraits } from "../utility/traits";
import { DialogNode, DialogNodeOption, getNodesForEnemy, getNodesForNPC, npcIds } from "../utility/DialogNode";
import Typewriter from "../utility/Typewriter";
import Currency from "../utility/Currency";
import MerchantTable from "./MerchantTable";
import Equipment, { getArmorEquipment, getClothEquipment, getJewelryEquipment, getMagicalWeaponEquipment, getMerchantEquipment, getOneDetermined, getPhysicalWeaponEquipment, getSpecificArmor } from "../models/equipment";
import { LevelSheet } from "../utility/ascean";
import { font, getRarityColor, sellRarity } from "../utility/styling";
import ItemModal from "../components/ItemModal";
import QuestManager, { getQuests, Quest, replaceChar } from "../utility/quests";
import { ENEMY_ENEMIES, faction, initFaction, namedNameCheck, Reputation } from "../utility/player";
import Thievery from "./Thievery";
import Merchant from "./Merchant";
import Roster from "./Roster";
import { ArenaRoster } from "./BaseUI";
import Settings from "../models/settings";
import { usePhaserEvent } from "../utility/hooks";
import { fetchTutorial } from "../utility/enemy";
import { getParty } from "../assets/db/db";
import { IRefPhaserGame } from "../game/PhaserGame";

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

interface DialogOptionProps {
    currentIndex: Accessor<number>;
    dialogNodes: any;
    option: DialogNodeOption;
    onClick: (nextNodeId: string | undefined) => void;
    actions: { [key: string]: Function };
    setPlayerResponses: Setter<string[]>;
    setKeywordResponses: Setter<string[]>;
    setShowDialogOptions: Setter<boolean>;
    showDialogOptions: Accessor<boolean>;
};

const DialogOption = ({ currentIndex, dialogNodes, option, onClick, actions, setPlayerResponses, setKeywordResponses, setShowDialogOptions, showDialogOptions }: DialogOptionProps) => {
    const hollowClick = () => console.log("Hollow Click");
    const handleClick = async (): Promise<void> => {
        setPlayerResponses((prev) => [...prev, option.text]);
        if (option?.keywords && option.keywords.length > 0) {
            setKeywordResponses((prev) => [...prev, ...option.keywords || []]);
        };
          
        if (option.action && typeof option.action === "string") {
            const actionName = option.action.trim();
            const actionFunction = actions[actionName];
            if (actionFunction) {
                actionFunction();
                // return;
            };
        };
        if (dialogNodes[currentIndex()]?.id !== option.next) {
            onClick(option.next as string);
        };
        setShowDialogOptions(false);
    };

    return (
      <div>
        { showDialogOptions() && (
            <button class="highlight" style={{ "font-size": "0.85em" }} onClick={handleClick} data-function-name="handleClick">
                <Typewriter stringText={option.text} styling={{ "overflow-y": "auto", "scrollbar-width": "none", "text-align": "left" }} performAction={hollowClick} />
            </button>
        ) }
      </div>
    );
};

interface DialogTreeProps {
    ascean: Ascean;
    enemy: any;
    dialogNodes: DialogNode[];
    combat: any;
    game: Accessor<GameState>;
    actions: any;
    setPlayerResponses: Setter<string[]>;
    setKeywordResponses: Setter<string[]>;
    styling?: any;
    reputation: Accessor<Reputation>;
};

export const DialogTree = ({ ascean, enemy, dialogNodes, game, combat, actions, setPlayerResponses, setKeywordResponses, styling, reputation }: DialogTreeProps) => {
    const [showDialogOptions, setShowDialogOptions] = createSignal<boolean>(false);
    const [renderedText, setRenderedText] = createSignal<string>("");
    const [renderedOptions, setRenderedOptions] = createSignal<any>(undefined);
    const [currentIndex, setCurrentIndex] = createSignal<number>(0);
    const [style, setStyle] = createSignal({
        "overflow-y": "auto",
        "scrollbar-width" : "none",
        "text-align": "left",
        ...styling
    });

    const processText = (text: string, context: any): string => {
        if (!text) return "";
        return text.replace(/\${(.*?)}/g, (_, g) => {
            const value = g.split(".").reduce((obj: { [x: string]: any; }, key: string | number) => obj && obj[key], context);
            return value;
        });
    };
    
    const processOptions = (options: DialogNodeOption[], context: any): DialogNodeOption[] => {
        return options
            .filter(option => !option.conditions || option.conditions.every(condition => {
                const { key, operator, value } = condition;
                const optionValue = getOptionKey(ascean, combat, game, key);
                switch (operator) {
                    case ">":
                        return Number(optionValue) > Number(value);
                    case ">=":
                        return Number(optionValue) >= Number(value);
                    case "<":
                        return Number(optionValue) < Number(value);
                    case "<=":
                        return Number(optionValue) <= Number(value);
                    case "=":
                        return Number(optionValue) === Number(value);
                    default:
                        return false;
                };
            }))
            .map(option => ({
                ...option,
                text: processText(option.text, context),
            }));
    };
    
    onMount(() => searchCurrentNode(game()?.currentNodeIndex));

    function searchCurrentNode(index: number) {
        let newText: string = "";
        let newOptions: DialogNodeOption[] = [];
        let currentNode = dialogNodes?.[index];
        if (currentNode === undefined) return;
        const { text, options } = currentNode as DialogNode;
        if (typeof text === "string") {
            newText = (text as string)?.replace(/\${(.*?)}/g, (_: any, g: string) => eval(g));
        } else if (Array.isArray(text)) {
            const npcOptions = text.filter((option: any) => {
                const id = npcIds[combat().npcType];
                const included = (option as DialogNodeOption)?.npcIds?.includes(id);
                let condition = true;
                if (option?.conditions?.length > 0) {
                    const { key, operator, value } = option.conditions[0];
                    const optionValue = getOptionKey(ascean, combat, game, key);
                    switch (operator) {
                        case ">":
                            condition = Number(optionValue) > Number(value);
                            break;
                        case ">=":
                            condition = Number(optionValue) >= Number(value);
                            break;
                        case "<":
                            condition = Number(optionValue) < Number(value);
                            break;
                        case "<=":
                            condition = Number(optionValue) <= Number(value);
                            break;
                        case "=":
                            condition = Number(optionValue) === Number(value);
                            break;
                        default:
                            condition = false;
                            break;        
                    };
                };
                return included && condition;
            });
            newText = (npcOptions[0]?.text as string)?.replace(/\${(.*?)}/g, (_: any, g: string) => eval(g));
        };
        newText = processText(newText, { ascean, enemy, combat });
        newOptions = processOptions(options, { ascean, enemy, combat });
        setRenderedOptions(newOptions);
        setRenderedText(newText);
        setCurrentIndex(index || 0);
        EventBus.emit("blend-game", { 
            currentNode: currentNode,
            currentNodeIndex: index || 0,
            renderedOptions: newOptions, 
            renderedText: newText
        });
    };

    const dialogTimeout = () => setShowDialogOptions(true);

    usePhaserEvent("typing-complete", dialogTimeout);

    const getOptionKey = (ascean: Ascean, combat: any, game: Accessor<GameState>, key: string) => {

        const newKey = key === "mastery" ? ascean[key].toLowerCase() : key;
        return ascean[newKey] !== undefined ? ascean[newKey] : combat[newKey] !== undefined ? combat[newKey] : game()[newKey as keyof typeof game];
    };
  
    const handleOptionClick = (nextNodeId: string | undefined) => {
        if (nextNodeId === undefined) {
            EventBus.emit("blend-game", { currentNodeIndex: 0 });
        } else {
            let nextNodeIndex = dialogNodes.findIndex((node: any) => node.id === nextNodeId);
            if (nextNodeIndex === -1) nextNodeIndex = 0;
            searchCurrentNode(nextNodeIndex);
        };
    };
  
    return (
        <div class="wrap" style={{ "text-align":"left" }}> 
            <Typewriter stringText={renderedText} styling={style()} performAction={handleOptionClick} main={true} />
            <br />
            {renderedOptions()?.map((option: DialogNodeOption) => (
                <DialogOption currentIndex={currentIndex} dialogNodes={dialogNodes} option={option} onClick={handleOptionClick} actions={actions} setPlayerResponses={setPlayerResponses} setKeywordResponses={setKeywordResponses} setShowDialogOptions={setShowDialogOptions} showDialogOptions={showDialogOptions} />
            ))}
        </div>
    );
};

const DialogButtons = ({ options, setIntent }: { options: any, setIntent: any }) => {
    const filteredOptions = Object.keys(options);
    const buttons = filteredOptions.map((o: any) => {
        switch (o) {
            case "localLore":
                o = "Local Lore";
                break;
            case "worldLore":
                o = "World Lore";
                break;
            case "localWhispers":
                o = "Local Whispers";
                break;
            default:
                break;
        };
        return (
            <div style={{ margin: "5%" }}>
                <button class="highlight dialog-buttons juiceSmall" onClick={() => setIntent(o)} style={{ background: "#000", "font-size": "0.75em" }}>{o}</button>
            </div>
        );
    });
    return <>{buttons}</>;
};

interface StoryDialogProps {
    ascean: Accessor<Ascean>;
    asceanState: Accessor<LevelSheet>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
    settings: Accessor<Settings>;
    quests: Accessor<QuestManager>;
    reputation: Accessor<Reputation>;
    instance: IRefPhaserGame
};

export default function Dialog({ ascean, asceanState, combat, game, settings, quests, reputation, instance }: StoryDialogProps) {
    const [forgeModalShow, setForgeModalShow] = createSignal(false); 
    const [influence, setInfluence] = createSignal(combat()?.weapons[0]?.influences?.[0]);
    const [persuasionString, setPersuasionString] = createSignal<string>("");
    const [luckoutString, setLuckoutString] = createSignal<string>("");
    const [upgradeItems, setUpgradeItems] = createSignal<any | undefined>(undefined);
    const [namedEnemy, setNamedEnemy] = createSignal<boolean>(false);
    const [playerResponses, setPlayerResponses] = createSignal<string[]>([]);
    const [keywordResponses, setKeywordResponses] = createSignal<string[]>([]);
    const [luckoutModalShow, setLuckoutModalShow] = createSignal<boolean>(false);
    const [persuasionModalShow, setPersuasionModalShow] = createSignal<boolean>(false);
    const [luckout, setLuckout] = createSignal<boolean>(false);
    const [luckoutShow, setLuckoutShow] = createSignal<boolean>(false);
    const [luckoutTraits, setLuckoutTraits] = createSignal<any>([]);
    const [persuasion, setPersuasion] = createSignal<boolean>(false);
    const [persuasionShow, setPersuasionShow] = createSignal<boolean>(false);
    const [persuasionTraits, setPersuasionTraits] = createSignal<any>([]);
    const [enemyArticle, setEnemyArticle] = createSignal<any>("");
    const [enemyDescriptionArticle, setEnemyDescriptionArticle] = createSignal<any>("");
    const [merchantTable, setMerchantTable] = createSignal<any>({});
    const [blacksmithSell, setBlacksmithSell] = createSignal<boolean>(false);
    const [concept, setConcept] = createSignal<any>(institutions["Ascea"].preamble);
    const [currentInstitution, setCurrentInstitution] = createSignal<any>("Ascea");
    const [institution, setInstitution] = createSignal<any>(institutions["Ascea"]);
    const [local, setLocal] = createSignal<any>(localLore["Astralands"]);
    const [region, setRegion] = createSignal<any>(provincialInformation["Astralands"]);
    const [entity, setEntity] = createSignal<any>(SupernaturalEntityLore["Ahn'are"]);
    const [phenomena, setPhenomena] = createSignal<any>(SupernaturalPhenomenaLore["Charm"]);
    const [currentWhisper, setCurrentWhisper] = createSignal<any>("Ancients");
    const [whisper, setWhisper] = createSignal<any>(whispers["Ancients"]);
    const [whisperConcept, setWhisperConcept] = createSignal<any>(whispers["Ancients"].history);
    const [world, setWorld] = createSignal<any>(worldLore["Age_of_Darkness"])
    const [showSell, setShowSell] = createSignal<boolean>(false);
    const [sellItem, setSellItem] = createSignal<Equipment | undefined>(undefined);
    const [showItem, setShowItem] = createSignal<boolean>(false);
    const [showBuy, setShowBuy] = createSignal<boolean>(false);
    const [completeQuests, setCompleteQuests] = createSignal<any[]>([]);
    const [prospectiveQuests, setProspectiveQuests] = createSignal<any[]>([]);
    const [showQuests, setShowQuests] = createSignal<boolean>(false);
    const [fetchQuests, setFetchQuests] = createSignal<any>([]);
    const [showQuestComplete, setShowQuestComplete] = createSignal<any>(false);
    const [showQuestSave, setShowQuestSave] = createSignal<any>(false);
    const [showCompleteQuest, setShowCompleteQuest] = createSignal<any>(undefined);
    const [forge, setForge] = createSignal<Equipment | undefined>(undefined);
    const [forgeSee, setForgeSee] = createSignal<boolean>(false);
    const [stealing, setStealing] = createSignal<{ stealing: boolean, item: any }>({ stealing: false, item: undefined });
    const [rewardItem, setRewardItem] = createSignal<{show:boolean,item:any}>({show:false,item:undefined});
    const [thievery, setThievery] = createSignal<boolean>(false);
    const [specialMerchant, setSpecialMerchant] = createSignal<boolean>(false);
    const [arena, setArena] = createSignal<ArenaRoster>({ show: false, enemies: [], wager: { silver: 0, gold: 0, multiplier: 0 }, party: false, result: false, win: false });
    const [rep, setRep] = createSignal<faction>(initFaction);
    const [party, setParty] = createSignal(false);
    const capitalize = (word: string): string => word === "a" ? word?.charAt(0).toUpperCase() : word?.charAt(0).toUpperCase() + word?.slice(1);
    const getItemStyle = (rarity: string): JSX.CSSProperties => {
        return {
            border: `0.15em solid ${getRarityColor(rarity)}`,
            "background-color": "#000",
        };
    };

    createEffect(() => { 
        checkEnemy(combat()?.computer as Ascean, quests);
        checkLuckout(game());
        checkPersuasion(game());
        checkInfluence(ascean);
        checkUpgrades();
        checkParty();
    });

    createEffect(() => setMerchantTable(game().merchantEquipment));
    
    const KEYS = {
        "Traveling Senarian":"magical-weapon",
        "Traveling Sevasi":"physical-weapon",
        "Traveling Armorer":"armor",
        "Traveling Jeweler":"jewelry",
        "Traveling Tailor":"cloth",
        "Traveling General Merchant":"general",
        "Traveling Sedyreal":"Sedyreal",
        "Traveling Kyrisian":"Kyrisian",
        "Kreceus": "Kreceus",
        "Ashreu'ul": "Ashreu'ul",
        "Tutorial Teacher": "Tutorial Teacher",
    };

    const actions = {
        getCombat: () => engageCombat(combat()?.enemyID),
        getArmor: async () => await getLoot("armor"),
        getGeneral: async () => await getLoot("general"),
        getJewelry: async () => await getLoot("jewelry"),
        getMystic: async () => await getLoot("magical-weapon"),
        getTailor: async () => await getLoot("cloth"),
        getWeapon: async () => await getLoot("physical-weapon"),
        getFlask: () => refillFlask(),
        getSell: () => setShowSell(!showSell()),
        setBlacksmithSell: () => setBlacksmithSell(!blacksmithSell()),
        setForgeSee: () => setForgeSee(!forgeSee()),
        setRoster: () => setArena({ ...arena(), show: true }),
        getTutorialMovement: () => EventBus.emit("highlight", "joystick"),
        getTutorialEnemy: () => fetchTutorialEnemyPrompt(), 
        getTutorialSettings: () => EventBus.emit("highlight", "smallhud"),
        getTutorialCombat: () => EventBus.emit("highlight", "action-bar"),
        getDialogClose: () => EventBus.emit("outside-press", "dialog"),
    };

    function fetchTutorialEnemyPrompt() {
        const enemy = fetchTutorial();
        setTimeout(() => {
            EventBus.emit("blend-game", { tutorialEncounter: game().tutorialEncounter + 1 });
            EventBus.emit("set-tutorial-enemy", enemy);
            EventBus.emit("outside-press", "dialog");
        }, 5000);
    };
    
    function steal(item: Equipment): void {
        setStealing({ stealing: true, item });
    };
    
    function checkUpgrades() {
        if (game().inventory.inventory.length < 3) return;
        const matchedItem = canUpgrade(game()?.inventory.inventory);
        if (matchedItem) {
            setUpgradeItems(matchedItem);
        } else {
            setUpgradeItems(undefined);
        };
    };

    const checkEnemy = (enemy: Ascean, manager: Accessor<QuestManager>) => {
        if (!enemy) return;
        setNamedEnemy(namedNameCheck(enemy.name));
        setEnemyArticle(() => ["a", "e", "i", "o", "u"].includes(enemy.name.charAt(0).toLowerCase()) ? "an" : "a");
        setEnemyDescriptionArticle(() => combat().computer?.description.split(" ")[0].toLowerCase() === "the" ? "the" : ["a", "e", "i", "o", "u"].includes((combat().computer?.description as string).charAt(0).toLowerCase()) ? "an" : "a");
        const rep = reputation().factions.find((f: faction) => f.name === combat().computer?.name) as faction;
        if (rep) setRep(rep);
        checkQuests(enemy, manager().quests);
    };
    
    const checkInfluence = (a: Accessor<Ascean>) => setInfluence(a()?.weaponOne?.influences?.[0]);
    
    const checkParty = async () => {
        const par = await getParty(ascean()._id);
        setParty(par.party.length < 2);
    }; 

    const checkQuests = (enemy: Ascean, quest: Quest[]) => {
        const completedQuests = [];
        const fetch = [];
        for (const q of quest) {
            const completed = q.requirements.technical.id === "fetch" ? q.requirements.technical.current === q.requirements.technical.total : q.requirements.technical.solved;
            const qRep = rep().reputation >= q.requirements.reputation;
            if (q.giver === enemy.name && completed && qRep) { // Quest The Enemy of One of the Faction Has Given the Player
                completedQuests.push(q);
            };

            if (q.requirements.technical.id === "fetch") {
                fetch.push(q);
            };
        };
        setCompleteQuests(completedQuests);
        setFetchQuests(fetch);

        const enemyQuests = getQuests(enemy.name);
        const prospectiveQuests = [];
        if (enemyQuests.length === 0) return;        
        if (quest.length === 0) {
            setProspectiveQuests(enemyQuests);
            return;
        };
        const playerQuests = new Set(quest.map(q => q.title)); // Convert player quests to a set for easy lookup
        const questGiverCheck = (enemyQuest: any) => {
            let check = true;
            for (let i = 0; i < quest.length; ++i) {
                if (quest[i].title === enemyQuest.title && quest[i].giver === enemy.name) {
                    check = false;
                };
            };
            return check;
        };
        for (const enemyQuest of enemyQuests) {
            if (!playerQuests.has(enemyQuest.title) || questGiverCheck(enemyQuest)) { // && enemyQuest.giver !== computer().name
                prospectiveQuests.push(enemyQuest);
            };
        };
        setProspectiveQuests(prospectiveQuests);
    };

    const completeQuest = async (quest: Quest) => {
        try {
            const items = [];
            for (let i = 0; i < (quest.rewards.items?.length as number); ++i) {
                const item = await getOneDetermined(ascean().level, quest.rewards.items?.[i] as string);
                items.push(item?.[0]);
            };
            const complete = {
                ...quest,
                rewards: {
                    ...quest.rewards,
                    items
                }
            };
            let completed = JSON.parse(JSON.stringify(completeQuests()));
            completed = completed.filter((q: Quest) => q._id !== quest._id);
            setCompleteQuests(completed);
            setShowCompleteQuest(complete);
            setShowQuestSave(true);
            EventBus.emit("complete-quest", quest);
            EventBus.emit("save-quest-to-player", complete);
        } catch (err) {
            console.warn(err, "Error Completing Quest");
        };
    };
    
    const hollowClick = () => console.log("Hollow Click");

    const attemptPersuasion = async (persuasion: string): Promise<void> => {
        let playerPersuasion: number = 0;
        let enemyPersuasion: number = 0;
        switch (persuasion) {
            case "Arbituous": // Ethos
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.achre as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.achre as number);
                break;
            case "Chiomic": // Humor
                playerPersuasion = combat()?.player?.achre as number + (combat()?.player?.kyosir as number);
                enemyPersuasion = combat()?.computer?.achre as number + (combat()?.computer?.kyosir as number);
                break;
            case "Kyr'naic": // Apathy
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.kyosir as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.kyosir as number);
                break;
            case "Lilosian": // Peace
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.caeren as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.caeren as number);
                break;
            case "Ilian": // Heroism
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.strength as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.strength as number);
                break;
            case "Fyeran": // Seer
                playerPersuasion = combat()?.player?.achre as number + (combat()?.player?.caeren as number);
                enemyPersuasion = combat()?.computer?.achre as number + (combat()?.computer?.caeren as number);
                break;
            case "Shaorahi": // Awe
                playerPersuasion = combat()?.player?.strength as number + (combat()?.player?.caeren as number);
                enemyPersuasion = combat()?.computer?.strength as number + (combat()?.computer?.caeren as number);
                break;
            default:
                break;
        };
        const specialEnemies = ["Laetrois Ath'Shaorah", "Mavros Ilios", "Lorian", "King Mathyus Caderyn", "Cyrian Shyne", "Vincere", "Eugenes", "Dorien Caderyn", "Ashreu'ul", "Kreceus"];
        const persuasionTrait = persuasionTraits().find((trait: { name: string; }) => trait.name === persuasion);
        if (namedEnemy() && specialEnemies.includes(combat()?.computer?.name as string)) {
            enemyPersuasion *= 1.5;
        } else if (namedEnemy()) { 
            enemyPersuasion *= 1.25; 
        } else { 
            enemyPersuasion *= 1.1; 
        };
        if (playerPersuasion >= enemyPersuasion) {
            EventBus.emit("persuasion", { persuasion, persuaded: true });
            const num = Math.floor(Math.random() * 2); 
            setPersuasionString(`${persuasionTrait?.persuasion.success[num].replace("{enemy.name}", combat()?.computer?.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", combat()?.player?.name).replace("{enemy.weaponOne.influences[0]}", combat()?.computer?.weaponOne?.influences?.[0]).replace("{enemy.faith}", combat()?.computer?.faith)}`);
        } else {
            checkingLoot();
            EventBus.emit("persuasion", { persuasion, persuaded: false });
            setPersuasionString(`Failure. ${persuasionTrait?.persuasion?.failure.replace("{enemy.name}", combat()?.computer?.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", combat()?.player?.name).replace("{enemy.weaponOne.influences[0]}", combat()?.computer?.weaponOne?.influences?.[0]).replace("{enemy.faith}", combat()?.computer?.faith)} \n\n Nevertheless, prepare for some chincanery, ${combat().player?.name}, and perhaps leave the pleasantries for warmer company.`);
            const timeout = setTimeout(() => {
                engageCombat(combat()?.enemyID);
                return () => clearTimeout(timeout);    
            }, 6000);
        };
    };

    const attemptLuckout = async (luck: string): Promise<void> => {
        let playerLuck: number = 0;
        let enemyLuck: number = 0;
        const enemy = combat()?.computer as Ascean;
        switch (luck) {
            case "Arbituous": // Rhetoric
                playerLuck = ascean().constitution + ascean().achre;
                enemyLuck = enemy.constitution + enemy.achre;
                break;
            case "Chiomic": // Shatter
                playerLuck = ascean().achre + ascean().kyosir;
                enemyLuck = enemy.achre + enemy.kyosir;
                break;
            case "Kyr'naic": // Apathy
                playerLuck = ascean().constitution + ascean().kyosir;
                enemyLuck = enemy.constitution + enemy.kyosir;
                break;
            case "Lilosian": // Peace
                playerLuck = ascean().constitution + ascean().caeren;
                enemyLuck = enemy.constitution + enemy.caeren;
                break;
            default:
                break;
        };
        const specialEnemies = ["Laetrois Ath'Shaorah", "Mavros Ilios", "Lorian", "King Mathyus Caderyn"];
        const luckoutTrait = luckoutTraits()?.find((trait: { name: string; }) => trait.name === luck);
        if (namedEnemy() && specialEnemies.includes(enemy.name)) { 
            enemyLuck *= 2; 
        } else if (namedEnemy()) {
            enemyLuck *= 1.5;
        } else { 
            enemyLuck *= 1.25; 
        };
        if (playerLuck >= enemyLuck) {
            let experience = 
                ascean().experience +
                Math.round((combat().computer?.level as number) * 
                100 * 
                (combat().computer?.level as number / combat()?.player?.level!) + 
                (combat()?.playerAttributes?.rawKyosir as number));
            const newState: LevelSheet = { 
                ...asceanState(), 
                avarice: combat().prayerData.length > 0 ? combat().prayerData.includes("Avarice") : false, 
                currency: ascean().currency,
                firewater: ascean().firewater,
                currentHealth: combat().newPlayerHealth,
                opponent: combat().computer?.level as number,
                opponentExp: Math.min(experience, combat()?.player?.level! * 1000),
            };
            const loot = { enemyID: combat().enemyID, level: combat().computer?.level as number };
            EventBus.emit("gain-experience", newState);
            EventBus.emit("enemy-loot", loot);
            EventBus.emit("luckout", { luck, luckout: true });
            const num = Math.floor(Math.random() * 2);
            setLuckoutString(`${luckoutTrait?.luckout?.success[num].replace("{enemy.name}", enemy.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", ascean().name).replace("{enemy.weaponOne.influences[0]}", enemy.weaponOne.influences?.[0]).replace("{enemy.faith}", enemy.faith).replace("{article}", enemyArticle)}`);
        } else {
            EventBus.emit("luckout", { luck, luckout: false });
            checkingLoot();
            setLuckoutString(`${luckoutTrait?.luckout?.failure.replace("{enemy.name}", enemy.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", ascean().name).replace("{enemy.weaponOne.influences[0]}", enemy.weaponOne.influences?.[0]).replace("{enemy.faith}", enemy.faith).replace("{article}", enemyArticle)} \n\n Prepare for combat, ${ascean().name}, and may your weapon strike surer than your words.`);
            const timeout = setTimeout(() => {
                engageCombat(combat()?.enemyID);
                return () => clearTimeout(timeout);    
            }, 6000);
        };
    };

    const checkLuckout = (g: GameState): void => {
        const traits = {
            primary: g?.traits?.primary,
            secondary: g?.traits?.secondary,
            tertiary: g?.traits?.tertiary,
        };
        const lTraits = ["Lilosian", "Arbituous", "Kyr'naic", "Chiomic"];
        const mTraits = Object.values(traits).filter(trait => lTraits.includes(trait?.name));
        if (mTraits.length === 0) {
            setLuckout(false);
            return;
        };
        setLuckout(true);
        setLuckoutTraits(mTraits);
        if (combat().luckoutScenario) {
            const num = Math.floor(Math.random() * 2); 
            const luckoutTrait = luckoutTraits().find((trait: { name: string; }) => trait.name === combat()?.playerTrait);
            setLuckoutString(`${luckoutTrait?.luckout.success[num].replace("{enemy.name}", combat()?.computer?.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", ascean().name).replace("{enemy.weaponOne.influences[0]}", combat()?.computer?.weaponOne?.influences?.[0]).replace("{enemy.faith}", combat()?.computer?.faith)}`);
        };
    };

    const checkPersuasion = (g: GameState): void => {
        const traits = {
            primary: g?.traits?.primary,
            secondary: g?.traits?.secondary,
            tertiary: g?.traits?.tertiary,
        };
        const pTraits = ["Ilian", "Lilosian", "Arbituous", "Kyr'naic", "Chiomic", "Fyeran", "Shaorahi", "Tashaeral"];
        const mTraits = Object.values(traits).filter(trait => pTraits.includes(trait?.name));
        if (mTraits.length === 0) {
            setPersuasion(false);
            return;
        };
        setPersuasion(true);
        setPersuasionTraits(mTraits);
        if (combat().persuasionScenario) {
            const num = Math.floor(Math.random() * 2); 
            const persuasionTrait = persuasionTraits().find((trait: { name: string; }) => trait.name === combat()?.playerTrait);
            setPersuasionString(`${persuasionTrait?.persuasion.success[num].replace("{enemy.name}", combat()?.computer?.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", combat()?.player?.name).replace("{enemy.weaponOne.influences[0]}", combat()?.computer?.weaponOne?.influences?.[0]).replace("{enemy.faith}", combat()?.computer?.faith)}`);
        };
    }; 

    const canUpgrade = (inventory: any[]): any[] | undefined => {
        const groups: Record<string, any[]> = {};
        inventory.forEach(item => {
            const key = `${item?.name}-${item?.rarity}`;
            groups[key] = groups[key] || [];
            groups[key].push(item);
        });
        const matches = [];
        for (const key in groups) {
            if (groups.hasOwnProperty(key)) {
                const items = groups[key];
                if (items.length >= 3) { 
                    matches.push(items[0]);
                };
            };
        };
        return matches.length > 0 ? matches : undefined;
    };

    const checkingLoot = (): void => {
        if (game().merchantEquipment.length > 0) {
            EventBus.emit("delete-equipment", { equipment: game().merchantEquipment });
            EventBus.emit("blend-game", { merchantEquipment: [] });
        };
    };

    const handleIntent = (intent: string): void => {
        let clean: string = "";
        switch (intent) {
            case "Local Lore":
                clean = "localLore";
                break;
            case "World Lore":
                clean = "worldLore";
                break;
            case "Local Whispers":
                clean = "localWhispers";
                break;
            default:
                clean = intent;
                break;
        };
        EventBus.emit("blend-game", { currentIntent: clean });
    };

    const handleInstitutionalConcept = (con: string) => {
        setConcept(institution()[con]);
    };
    
    const handleWhisperConcept = (con: string) => {
        setWhisperConcept(whisper()[con]);
    };

    const handleInstitution = (inst: keyof Institutions) => {
        setCurrentInstitution(inst);
        setInstitution(institutions[inst]);
        setConcept(institutions[inst]["preamble"]);
    };

    const handleLocal = (local: keyof Region) => {
        setLocal(localLore[local]);
    };

    const handleRegion = (region: keyof Region) => {
        setRegion(provincialInformation[region]);
    };
    
    const handleEntity = (entity: keyof SupernaturalEntity) => {
        setEntity(SupernaturalEntityLore[entity]);
    };

    const handlePhenomena = (phenomena: keyof SupernaturalPhenomena) => {
        setPhenomena(SupernaturalPhenomenaLore[phenomena]);
    };

    const handleWhisper = (worship: keyof Whispers) => {
        setCurrentWhisper(worship);
        setWhisper(whispers[worship]);
        setWhisperConcept(whispers[worship]["history"]);
    };

    const handleWorld = (world: keyof World_Events) => {
        setWorld(worldLore[world]);
    };
    
    const engageCombat = (id: string): void => {
        checkingLoot();
        EventBus.emit("aggressive-enemy", { id, isAggressive: true });
        EventBus.emit("blend-game", { showDialog: false });
        EventBus.emit("update-pause", false);
        EventBus.emit("action-button-sound");
        EventBus.emit("engage");
    };

    const clearDuel = () => {
        EventBus.emit("show-dialogue");
        EventBus.emit("action-button-sound");
        EventBus.emit("update-pause", false);
    };

    const refillFlask = () => console.log("refilling flask!");

    const getLoot = async (type: string, armor?: string): Promise<void> => {
        if (game()?.merchantEquipment.length > 0) {
            EventBus.emit("delete-merchant-equipment", { equipment: game()?.merchantEquipment });
        };
        try {
            let merchantEquipment: any;
            if (type === "physical-weapon") {
                merchantEquipment = await getPhysicalWeaponEquipment(combat()?.player?.level as number);
            } else if (type === "magical-weapon") {
                merchantEquipment = await getMagicalWeaponEquipment(combat()?.player?.level as number);
            } else if (type === "armor") {
                merchantEquipment = await getArmorEquipment(combat()?.player?.level as number);
            } else if (type === "jewelry") {
                merchantEquipment = await getJewelryEquipment(combat()?.player?.level as number);
            } else if (type === "general") {
                merchantEquipment = await getMerchantEquipment(combat()?.player?.level as number);
            } else if (type === "cloth") {
                merchantEquipment = await getClothEquipment(combat()?.player?.level as number);
            } else if (armor) {
                merchantEquipment = await getSpecificArmor(combat()?.player?.level as number, armor);
            };
            setMerchantTable(merchantEquipment);
            if (!showBuy()) setShowBuy(true);
            EventBus.emit("blend-game", { merchantEquipment });
        } catch (err) {
            console.warn(err, "--- Error Getting Loot! ---");
        };
    };

    function refreshLoot() {
        try {
            const refresh = async () => {
                const key = KEYS[combat().computer?.name as keyof typeof KEYS];
                if (key === "Kyrisian" || key === "Sedyreal" || key === "Kreceus" || key === "Ashreu'ul") {
                    setSpecialMerchant(true);
                    return;
                };
                await getLoot(key);
            };
            refresh();
        } catch (err) {
            console.warn(err, "Error Refreshing Loot");
        };
    };

    function switchToBuy() {
        setShowSell(false);
        setShowBuy(true);
        if (game()?.merchantEquipment.length > 0) return;

        const key = KEYS[combat().computer?.name as keyof typeof KEYS];
        if (key === "Kyrisian" || key === "Sedyreal" || key === "Kreceus" || key === "Ashreu'ul") {
            setSpecialMerchant(true);
            return;
        };

        const switching = async () => await getLoot(key);
        switching();
    };

    function setItem(item: Equipment) {
        setSellItem(item);
        setShowItem(true);
    };

    function sellInventory() {
        EventBus.emit("alert", { header: "Selling Item In Inventory", body: `You have sold your ${sellItem()?.name} for ${sellRarity(sellItem()?.rarity as string)}` })
        EventBus.emit("sell-item", sellItem());    
    };

    async function handleUpgradeItem() {
        let type = "";
        if (forge()?.grip) type = "weaponOne";
        if (forge()?.name.includes("Hood") || forge()?.name.includes("Helm") || forge()?.name.includes("Mask")) type = "helmet";
        if (forge()?.name.includes("Cuirass") || forge()?.name.includes("Robes") || forge()?.name.includes("Armor")) type = "chest";
        if (forge()?.name.includes("Greaves") || forge()?.name.includes("Pants") || forge()?.name.includes("Legs")) type = "legs";
        if (forge()?.name.includes("Amulet") || forge()?.name.includes("Necklace")) type = "amulet";
        if (forge()?.name.includes("Ring")) type = "ringOne";
        if (forge()?.name.includes("Trinket")) type = "trinket";
        if (forge()?.type.includes("Shield")) type = "shield";

        if (forge()?.rarity === "Common" && ascean()?.currency?.gold < GET_FORGE_COST.Common) {
            return;
        } else if (forge()?.rarity === "Uncommon" && ascean()?.currency?.gold < 3) {
            return;
        } else if (forge()?.rarity === "Rare" && ascean()?.currency?.gold < 12) {
            return;
        } else if (forge()?.rarity === "Epic" && ascean()?.currency?.gold < 60) {
            return;
        } else if (forge()?.rarity === "Legendary" && ascean()?.currency?.gold < 300) {
            return;
        // } else if (forge()?.rarity === "Mythic" && ascean()?.currency?.gold < 1500) {
        //     return;
        // } else if (forge()?.rarity === "Divine" && ascean()?.currency?.gold < 7500) {
        //     return;
        // } else if (forge()?.rarity === "Ascended" && ascean()?.currency?.gold < 37500) {
        //     return;
        // } else if (forge()?.rarity === "Godly" && ascean()?.currency?.gold < 225000) {
        //     return;
        };
        try {
            let match = JSON.parse(JSON.stringify(game().inventory.inventory));
            match = match.filter((item: Equipment) => item.name === forge()?.name && item?.rarity === forge()?.rarity);
            const data = {
                asceanID: ascean()._id,
                upgradeID: forge()?._id,
                upgradeName: forge()?.name,
                upgradeType: forge()?.itemType,
                currentRarity: forge()?.rarity,
                inventoryType: type,
                upgradeMatches: match,
            };
            EventBus.emit("upgrade-item", data);
            EventBus.emit("play-equip");
            setForgeModalShow(false);
        } catch (err) {
            console.warn(err, "<- Error upgrading item");
        };
    };

    const currentItemStyle = (rarity: string): JSX.CSSProperties => {
        return {border: `0.15em solid ${getRarityColor(rarity)}`, "background-color": "transparent"};
    };

    function itemForge(item: Equipment) {
        setForge(item);
        setForgeModalShow(true);
    };

    function performAction(actionName: string) {
        const actionFunction = actions[actionName as keyof typeof actions];
        if (actionFunction) {
            actionFunction();
        };
    };

    function convertEnemy(quest: Quest) {
        const newQuests = quests().quests.map((q: Quest) => {
            const newQ = q._id === quest._id 
                ? {
                    ...q, 
                    requirements: {
                        ...q.requirements,
                        technical: {
                            ...q.requirements.technical,
                            current: Math.min(q.requirements.technical.current as number + 1, q.requirements.technical.total as number)
                        }
                    },
                } 
                : q;
            return newQ;
        });
        const newQuestManager = {
            ...quests(),
            quests: newQuests
        };
        EventBus.emit("alert", { header: `Updating ${quest.title}`, body: `You have successfully converted ${enemyArticle()} ${combat().computer?.name} to become ${quest.requirements.action.value}. Rejoice!`, key: "Close" });
        EventBus.emit("update-quests", newQuestManager);
        EventBus.emit("convert-enemy", { _id: combat().enemyID, faith: quest.requirements.action.value });
        // const newEnemy = {
        //     ...combat().computer,
        //     weaponOne: {...combat().weapons[0], rarity: combat().weapons[0]?.name.includes("Default") ? "Default" :  combat().computerWeapons[0].rarity},
        //     weaponTwo: {...combat().weapons[1], rarity: combat().weapons[1]?.name.includes("Default") ? "Default" :  combat().computerWeapons[1].rarity},
        //     weaponThree: {...combat().weapons[2], rarity: combat().weapons[2]?.name.includes("Default") ? "Default" :  combat().computerWeapons[2].rarity},
        // };
    };

    function specialMerchantStyle(animation: string) {
        return {
            "font-weight": 700,
            display: "block",
            margin: "10% auto",
            padding: "5%",
            animation
        };
    };

    function changeEnemyToParty() {
        EventBus.emit("add-party", {name: combat().computer?.name, level: combat().computer?.level});
        EventBus.emit("despawn-enemy-to-party", combat().enemyID);
        EventBus.emit("clear-enemy");
        EventBus.emit("action-button-sound");
        EventBus.emit("blend-game", { showDialog: false });
        EventBus.emit("update-pause", false);
        EventBus.emit("show-dialog-false");
    };

    function checkReward(item: string | Equipment) {
        if (typeof item === "string") {
            return item;
        } else { // Equipment
            return <div onClick={() => setRewardItem({show:true,item})} style={{ "border": `0.2em solid ${getRarityColor(item.rarity as string)}`, "transform": "scale(1.1)", "background-color": "#000", "margin": "0.25em" }}>
                <img src={item.imgUrl} alt={item.name} class="juiceNB" style={{ height: "100%", width: "100%" }} />
            </div>;
        };
    };

    const typewriterStyling: JSX.CSSProperties = { };
    return (
        <Show when={combat().computer}>
        <Show when={combat().isEnemy}>
            <div class="story-dialog-options">
                <DialogButtons options={game().dialog} setIntent={handleIntent} />
                <Show when={game().currentIntent === "institutions"}>
                    <IntstitutionalButtons current={currentInstitution} options={institutions} handleConcept={handleInstitutionalConcept} handleInstitution={handleInstitution}  />
                </Show>
                <Show when={game().currentIntent === "localLore"}>
                    <LocalLoreButtons options={localLore} handleRegion={handleLocal}  />
                </Show>
                <Show when={game().currentIntent === "provinces"}>
                    <ProvincialWhispersButtons options={provincialInformation} handleRegion={handleRegion}  />
                </Show>
                <Show when={game().currentIntent === "entities"}>
                    <SupernaturalEntityButtons options={SupernaturalEntityLore} handleEntity={handleEntity} />
                </Show>
                <Show when={game().currentIntent === "phenomena"}>
                    <SupernaturalPhenomenaButtons options={SupernaturalPhenomenaLore} handlePhenomena={handlePhenomena} />
                </Show>
                <Show when={game().currentIntent === "whispers"}>
                    <WhispersButtons current={currentWhisper} options={whispers} handleConcept={handleWhisperConcept} handleWhisper={handleWhisper} />
                </Show>
                <Show when={game().currentIntent === "worldLore"}>
                    <WorldLoreButtons options={worldLore} handleWorld={handleWorld} />
                </Show>
            </div>
        </Show> 
        <div class="dialog-window" style={{ width: combat().isEnemy && combat().computer ? "55%" : "70%" }}>
            <div class="dialog-tab wrap"> 
            <div style={{ color: "gold", "font-size": "1em", "margin-bottom": "3%" }}>
                <div style={{ display: "inline" }}>
                    <img src={`../assets/images/${combat()?.computer?.origin}-${combat()?.computer?.sex}.jpg`} alt={combat()?.computer?.name} style={{ width: "10%", "border-radius": "50%", border: "0.1em solid #fdf6d8" }} class="origin-pic" />
                    {" "}<div style={{ display: "inline" }}>{combat()?.computer?.name} <p style={{ display: "inline", "font-size": "0.75em" }}>[Level {combat()?.computer?.level}]</p><br /></div>
                </div>
            </div>
            { combat().npcType === "Merchant-Smith" ? ( <>
                <Typewriter stringText={`"You've come for forging? I only handle chiomic quality and above. Check my rates and hand me anything you think worth's it. Elsewise I trade with the Armorer if you want to find what I've made already."
                    <br /><br />
                    Hanging on the wall is a list of prices for the various items you can forge. The prices are based on the quality. <br />
                    <p class="greenMarkup">[Achiom - 1g]</p>
                    <p class="blueMarkup">[Senic - 3g]</p>
                    <p class="purpleMarkup">[Kyr - 12g]</p>
                    <p class="darkorangeMarkup">[Sedyreal - 60g]</p>
                    <br /><button class="highlight" data-function-name="setForgeSee">See if any of your equipment can be Forged?</button>
                    <br /><button class="highlight" data-function-name="getSell">Sell your equipment to the Traveling Blacksmith?</button>
                `} styling={{ margin: "0 5%", width: "90%", overflow: "auto", "scrollbar-width": "none", "font-size":"0.9em" }} performAction={performAction} />
                <br />
                {forgeSee() && upgradeItems() ? ( <div class="playerInventoryBag center" style={{ width: "65%", "margin-bottom": "5%" }}> 
                    {upgradeItems().map((item: any) => {
                        if (item === undefined || item === undefined) return;
                        return (
                            <div class="center" onClick={() => itemForge(item)} style={{ ...getItemStyle(item?.rarity as string), margin: "5%",padding: "0.25em",width: "auto" }}>
                                <img src={item?.imgUrl} alt={item?.name} />
                                Forge
                            </div>
                        );
                    })}
                </div> ) : forgeSee() ? ( "There is nothing in your inventory to be forged." ) : ( "" )}
                <br />
                {blacksmithSell() && <div class="playerInventoryBag center" style={{ width: "65%", "margin-bottom": "5%" }}>
                    <For each={game()?.inventory.inventory}>{(item) => {
                        if (item === undefined || item === undefined) return;
                        return <div class="center" onClick={() => setItem(item)} style={{ ...getItemStyle(item?.rarity as string), margin: "5.5%",padding: "0.25em",width: "auto" }}>
                            <img src={item?.imgUrl} alt={item?.name} />
                        </div>;
                    }}</For>
                </div>}
                </>
            ) : combat().npcType === "Merchant-Alchemy" ? (
                <> 
                    { game().player?.firewater?.charges === 5 ? (
                        <Typewriter stringText={`The Alchemist sways in a slight tune to the swish of your flask as he turns to you. <br /><br /> ^500 "If you're needing potions of amusement and might I'm setting up craft now. Seems you're set for now, come back when you're needing more."`} styling={typewriterStyling} performAction={hollowClick} />
                    ) : (
                        <>
                            <Typewriter stringText={`The Alchemist's eyes scatter about your presence, eyeing ${game().player?.firewater?.charges} swigs left of your Fyervas Firewater before tapping on on a pipe, its sound wrapping round and through the room to its end, a quaint, little spigot with a grated catch on the floor.<br /><br /> ^500 "If you're needing potions of amusement and might I'm setting up craft now. Fill up your flask meanwhile, 10s a fifth what you say? I'll need you alive for patronage."`} styling={typewriterStyling} performAction={hollowClick} />
                            <br />
                            <button class="highlight dialog-buttons" style={{ color: "blueviolet" }} onClick={refillFlask}>Walk over and refill your firewater?</button>
                        </>
                    ) }
                </>
            ) : ( "" ) }
            { combat().isEnemy && combat().computer ? (
                <div style={{ "font-size": "0.75em", "overflow-y": "scroll", "scrollbar-width": "none" }}>
                    <DialogTree game={game} combat={combat} ascean={ascean() as Ascean} enemy={combat().computer} dialogNodes={getNodesForEnemy(combat()?.computer as Ascean) as DialogNode[]} setKeywordResponses={setKeywordResponses} setPlayerResponses={setPlayerResponses} actions={actions} styling={{"white-space":"pre-wrap"}} reputation={reputation} />
                { game().currentIntent === "challenge" ? (
                    <>
                    { combat().persuasionScenario ? (
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={persuasionString} styling={typewriterStyling} performAction={hollowClick} />
                            <br />
                            { combat().enemyPersuaded ? (
                                <>
                                    <p style={{ color: "#fdf6d8" }}>
                                    You persuaded {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                    </p>
                                    <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                </>
                            ) : ( "" ) }
                        </div>
                    ) : combat().luckoutScenario ? (
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={luckoutString} styling={typewriterStyling} performAction={hollowClick} />
                            <br />
                            { combat().playerLuckout ? (
                                <>
                                    <p style={{ color: "#fdf6d8" }}>
                                    You lucked out against {namedEnemy() ? "" : ` the`} {combat().computer?.name} to forego hostilities. You may now travel freely through this area.
                                    </p>
                                    <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                </>
                            ) : ( "" ) }    
                        </div>   
                    ) : combat().playerWin ? (
                        <div>
                            { namedEnemy() ? (
                                <Typewriter stringText={`"Congratulations ${combat()?.player?.name}, you were fated this win. This is all I have to offer, if it pleases you."`} styling={typewriterStyling} performAction={hollowClick} />
                            ) : ( 
                                <Typewriter stringText={`"Appears I were wrong to treat with you in such a way, ${combat()?.player?.name}. By the way, did you happen to find any equipment I may have dropped in the fall? Must have left it somewhere else, I imagine."`} styling={typewriterStyling} performAction={hollowClick} />
                            ) } 
                        </div> 
                    ) : combat().computerWin ? (
                        <div>
                            { namedEnemy() ? (
                                <Typewriter stringText={`"${combat()?.player?.name}, surely this was a jest? Come now, you disrespect me with such play. What was it that possessed you to even attempt this failure?"`} styling={typewriterStyling} performAction={hollowClick} />
                            ) : ( 
                                <Typewriter stringText={`"The ${combat()?.computer?.name} are not to be trifled with."`} styling={typewriterStyling} performAction={hollowClick} />
                            ) } 
                        </div> 
                    ) : (
                        <div>
                            { namedEnemy() ? ( 
                                <>
                                    <Typewriter stringText={`"Greetings traveler, I am ${combat()?.computer?.name}. ${combat()?.player?.name}, is it? You seem a bit dazed, can I be of some help?"`} styling={typewriterStyling} performAction={hollowClick} />
                                    <br />
                                    <button class="highlight" style={{ color: "red" }} onClick={() => engageCombat(combat()?.enemyID)}>Forego pleasantries and surprise attack {combat()?.computer?.name}?</button>
                                </> 
                            ) : ( 
                                <>
                                    <Typewriter stringText={`${capitalize(enemyArticle())} ${combat()?.computer?.name} stares at you, unflinching. Eyes lightly trace about you, reacting to your movements in wait. Grip your ${combat().weapons[0]?.name} and get into position?`} styling={typewriterStyling} performAction={hollowClick} />
                                    <br />
                                    <button class="highlight" style={{ color: "red" }} onClick={() => engageCombat(combat()?.enemyID)}>Engage in hostilities with {combat()?.computer?.name}?</button>
                                </> 
                            ) }
                            { luckout() ? ( 
                                <><br />
                                    <button class="highlight" onClick={() => setLuckoutShow(!luckoutShow())}>{luckoutShow() ? "Hide Scenarios" : "Show Luckout Scenarios"}</button><br />
                                    <Show when={luckoutShow()}>
                                        <LuckoutModal traits={luckoutTraits} callback={attemptLuckout} name={combat()?.computer?.name as string} influence={influence as Accessor<string>} show={luckoutModalShow} setShow={setLuckoutModalShow} /> 
                                    </Show>
                                </>
                            ) : ("") } 
                        </div>
                    ) } 
                    </>
                ) : game().currentIntent === "conditions" ? (
                    <>
                    <Typewriter stringText={`"If you wish to elevate yourself in mine and my other's eyes, it would serve you well to quell nature of${ENEMY_ENEMIES[combat().computer?.name as keyof typeof ENEMY_ENEMIES].map((e: any, i: number) => {const length = ENEMY_ENEMIES[combat().computer?.name as keyof typeof ENEMY_ENEMIES].length; return `${length - 1 === i ? " and " : " "}${e}s`}) }."`} styling={{ overflow: "auto", "scrollbar-width": "none", "white-space": "pre-wrap" }} performAction={hollowClick} />
                    <br />
                    {rep()?.reputation >= 25 && party() ? (
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={`[Congratulations, you are capable of recruiting this enemy to your party, endearing themself to your journey and protecting you with their life. Do you wish to recruit this enemy to your party? This is ${enemyArticle()} ${combat().computer?.name}. They are ${enemyDescriptionArticle()} ${combat().computer?.description}. You are allowed to have up to 2 party members accompanying you on your journey. Choose wisely.]`} styling={{ overflow: "auto", "scrollbar-width": "none", "white-space": "pre-wrap" }} performAction={hollowClick} />
                            <br />
                            <button class="highlight" onClick={changeEnemyToParty}>
                                <Typewriter stringText={`Recruit ${rep().name} to join your party.`} styling={typewriterStyling} performAction={hollowClick} />
                            </button>
                        </div>
                    ) : rep()?.reputation >= 25 && !party() ? (
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={`[You have reached maximum party size. The ${combat().computer?.name} is not capable of being recruited to your party. You must remove a current party member in order to recruit them for your journey.]`} styling={{ overflow: "auto", "scrollbar-width": "none", "white-space": "pre-wrap" }} performAction={hollowClick} />
                        </div>
                    ) : ( <div style={{ color: "gold" }}>
                        <Typewriter stringText={`[The ${combat().computer?.name} is not capable of being recruited to your party. You must reach a higher level of reputation with them in order to recruit for your journey.]`} styling={{ overflow: "auto", "scrollbar-width": "none", "white-space": "pre-wrap" }} performAction={hollowClick} />
                    </div> )}
                    </>
                ) : game().currentIntent === "farewell" ? (
                    <>
                        { combat().persuasionScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter stringText={persuasionString} styling={typewriterStyling} performAction={hollowClick} />
                                <br />
                                { combat().enemyPersuaded ? (
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You persuaded {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                    </>
                                ) : ( "" ) }
                            </div>
                        ) : combat().luckoutScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter stringText={luckoutString} styling={typewriterStyling} performAction={hollowClick} />
                                <br />
                                { combat().playerLuckout ? (
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You lucked out against {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                    </>
                                ) : ( "" ) }    
                            </div>   
                        ) : combat().playerWin ? (
                            <>
                                { namedEnemy() ? (
                                    <Typewriter stringText={`"${combat()?.player?.name}, you are truly unique in someone's design. Before you travel further, if you wish to have it, its yours."`} styling={typewriterStyling} performAction={hollowClick} />
                                ) : ( 
                                    <Typewriter stringText={`"Go now, ${combat()?.player?.name}, take what you will and find those better pastures."`} styling={typewriterStyling} performAction={hollowClick} />
                                ) }
                                <br />
                                <button class="highlight" onClick={() => clearDuel()}>Seek those pastures and leave your lesser to their pitious nature.</button>
                            </>
                        ) : combat().computerWin ? (
                            <>
                                <Typewriter stringText={`"If you weren't entertaining in defeat I'd have a mind to simply snuff you out here and now. Seek refuge, ${combat().player?.name}, your frailty wears on my caer."`} styling={typewriterStyling} performAction={hollowClick} />
                                <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Feign scamperping away to hide your shame and wounds. There's always another chance, perhaps.</button>
                            </>
                        ) : (
                            <>
                            { namedEnemy() ? ( 
                                <Typewriter stringText={`"I hope you find what you seek, ${combat()?.player?.name}. Take care in these parts, you may never know when someone wishes to approach out of malice and nothing more. Strange denizens these times."`} styling={typewriterStyling} performAction={hollowClick} />
                            ) : ( 
                                <Typewriter stringText={`The ${combat()?.computer?.name}'s mild flicker of thought betrays their stance, lighter and relaxed.`} styling={typewriterStyling} performAction={hollowClick} />
                            ) }
                                <br />
                                <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Keep moving.</button>
                            </>
                        ) }
                        { checkTraits("Kyn'gian", game().traits) && !combat().playerWin && !combat().computerWin ? (
                            <button class="highlight" onClick={() => clearDuel()}>You remain at the edges of sight and sound, and before {combat()?.computer?.name} can react, you attempt to flee.</button>
                        ) : ( "" ) }
                    </>
                ) : game().currentIntent === "institutions" ? (
                    <>
                        <Typewriter stringText={`"What institution do you wish to understand?"`} styling={typewriterStyling} performAction={hollowClick} />
                        <br />
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={concept} styling={{...typewriterStyling, "white-space": "pre-wrap"}} performAction={hollowClick} />
                        </div>    
                    </>
                ) : game().currentIntent === "localLore" ? (
                    <>
                        <Typewriter stringText={`"Which province's formation do you wish to understand a little more?"`} styling={typewriterStyling} performAction={hollowClick} />
                        <br />
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={local} styling={{...typewriterStyling, "white-space": "pre-wrap"}} performAction={hollowClick} />
                        </div>    
                    </>
                ) : game().currentIntent === "persuasion" ? (
                    <>
                        { combat().playerWin ? (
                            <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Continue moving along your path, perhaps words will work next time.</button>
                        ) : combat().computerWin ? (
                            <button class="highlight" style={{ color: "red" }} onClick={() => clearDuel()}>Continue moving along your path, there's nothing left to say now.</button>
                        ) : persuasion() && !combat().persuasionScenario ? (
                                <>
                                <button class="highlight" onClick={() => setPersuasionShow(!persuasionShow())}>{persuasionShow() ? "Hide Scenarios" : "Show Persuasion Scenarios"}</button><br />
                                <Show when={persuasionShow()}>
                                    <PersuasionModal traits={persuasionTraits} callback={attemptPersuasion} name={combat().computer?.name as string} influence={influence as Accessor<string>} show={persuasionModalShow} setShow={setPersuasionModalShow} /> 
                                </Show>
                                </>
                        ) : ("") }
                        { combat().persuasionScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter stringText={persuasionString} styling={typewriterStyling} performAction={hollowClick} />
                                <br />
                                { combat().enemyPersuaded ? (
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You persuaded {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal" }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                    </>
                                ) : ( "" ) }
                            </div>
                        ) : ( "" ) }
                        <QuestModal quests={prospectiveQuests} show={showQuests} setShow={setShowQuests} enemy={combat().computer as Ascean} />
                        <Show when={completeQuests().length > 0}>
                            <h1>Completed Quests</h1>
                            <div class="creature-heading">
                            <For each={completeQuests()}>{(quest) => {
                                return <div class="border juice wrap creature-heading">
                                    <div class="highlight" onClick={() => {
                                        setShowCompleteQuest(quest);
                                        setShowQuestComplete(true);
                                        setShowQuestSave(false);
                                }}>{quest.title}</div>
                                </div>
                            }}</For>
                            </div>
                        </Show>
                        <Show when={fetchQuests().length > 0}>
                            <div class="creature-heading">
                                <For each={fetchQuests()}>{(quest) => {
                                    if (!quest.requirements.dialog) return;
                                    return <Switch>
                                        <Match when={(quest.title === "Adherence" || quest.title === "Providence") && (combat().playerWin || rep().reputation >= 25) && !combat().computer?.name.includes("(Converted)") && quest.requirements.action.value.toLowerCase() !== combat().computer?.faith}>
                                            <div class="wrap">
                                                <button class="highlight" onClick={() => convertEnemy(quest)}>
                                                    <Typewriter stringText={`${combat().computer?.name}: "${quest.requirements.dialog as string}"`} styling={typewriterStyling} performAction={hollowClick} />
                                                </button>
                                            </div>
                                        </Match> 
                                    </Switch>
                                }}</For>
                            </div>
                        </Show>
                    </>
                ) : game().currentIntent === "provinces" ? (
                    <>
                        {/* { combat().playerWin || combat().enemyPersuaded ? (
                            <> */}
                                <Typewriter stringText={`"There's concern in places all over, despite what has been said about steadying tides of war amongst the more civilized. Of where are you inquiring?"`} styling={typewriterStyling} performAction={hollowClick} />
                                <br />
                                <div style={{ color: "gold" }}>
                                    <Typewriter stringText={region} styling={typewriterStyling} performAction={hollowClick} />
                                </div>
                            {/* </>
                        ) : combat().computerWin ? (
                            <Typewriter stringText={`"Those whispers must wait another day, then."`} styling={typewriterStyling} performAction={hollowClick} />
                        ) : ( 
                            <Typewriter stringText={`"What is it you wish to hear? If you can best me in combat, I will tell you what I know in earnest."`} styling={typewriterStyling} performAction={hollowClick} />                            
                        ) } */}
                    </>
                ) : game().currentIntent === "entities" ? (
                    <>
                        <Typewriter stringText={`"There are many tales from all over, concerning themselves with myths of beasts and creatures forged with that of man. Of which are you curious?"`} styling={typewriterStyling} performAction={hollowClick} />
                        <br />
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={entity} styling={{...typewriterStyling, "white-space": "pre-wrap"}} performAction={hollowClick} />
                        </div>
                    </>
                ) : game().currentIntent === "phenomena" ? (
                    <>
                        <Typewriter stringText={`"Many notions exist of man extending themselves further than they are readily capable of physically. Of which are you curious?"`} styling={typewriterStyling} performAction={hollowClick} />
                        <br />
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={phenomena} styling={{...typewriterStyling, "white-space": "pre-wrap"}} performAction={hollowClick} />
                        </div>
                    </>
                ) : game().currentIntent === "worldLore" ? (
                    <>
                        <Typewriter stringText={`"What do you wish to know about the history of this world?"`} styling={typewriterStyling} performAction={hollowClick} />
                        <br />
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={world} styling={{...typewriterStyling, "white-space": "pre-wrap"}} performAction={hollowClick} />
                        </div>
                    </>
                ) : game().currentIntent === "whispers" ? (
                    <>
                        <Typewriter stringText={`"What do you wish to know of the worship and intrigue on the occult and religiosity around the realm."`} styling={typewriterStyling} performAction={hollowClick} />
                        <br />
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={whisperConcept} styling={{...typewriterStyling, "white-space": "pre-wrap"}} performAction={hollowClick} />
                        </div>
                    </>
                ) : ( "" ) }
                </div>
            ) : combat().computer && combat().npcType !== "Merchant-Alchemy" && combat().npcType !== "Merchant-Smith" ? (
                <DialogTree 
                    game={game} combat={combat} ascean={ascean()} enemy={combat().computer} dialogNodes={getNodesForNPC(npcIds[combat().npcType])} reputation={reputation}
                    setKeywordResponses={setKeywordResponses} setPlayerResponses={setPlayerResponses} actions={actions} styling={{"white-space":"pre-wrap"}}
                />
            ) : ( "" ) } 
            <Show when={merchantTable()?.length > 0}> 
                <button class="highlight" style={{ "color": "green" }} onClick={() => setShowBuy(true)}>See the merchant's current set of items</button>
            </Show>
            </div>
        </div>
        <Merchant ascean={ascean} />
        <Thievery ascean={ascean} game={game} setThievery={setThievery} stealing={stealing} setStealing={setStealing} />
        <Roster arena={arena} ascean={ascean} setArena={setArena} base={false} game={game} settings={settings} instance={instance} />
        {/* && merchantTable()?.length > 0 */}
        <Show when={showBuy()}>
            <div class="modal">
            <div class="creature-heading" style={{ position: "absolute", left: "20%", top: "2.5%", height: "95%", width: "60%",background: "#000",border: "0.1em solid gold","border-radius": "0.25em","box-shadow": "0 0 0.5em #FFC700",overflow: "scroll","text-align": "center", "scrollbar-width":"none" }}>
                <Currency ascean={ascean} />
                <MerchantTable table={merchantTable} ascean={ascean} steal={steal} thievery={thievery} />
            </div>
            <button class="highlight cornerTR" style={{ "background-color": "green", color: "#000", "font-weight": 700 }} onClick={() => refreshLoot()}>Refresh Loot Table</button>
            <button class="highlight cornerTL" style={{ "background-color": "gold", color: "#000", "font-weight": 700 }} onClick={() => setShowSell(true)}>Sell Loot</button>
            <button class="highlight cornerBR" style={{ "background-color": "red" }} onClick={() => setShowBuy(false)}>x</button>
            </div>
        </Show>
        <Show when={specialMerchant()}>
            <div class="modal">
            <div class="superCenter creature-heading" style={{ position: "absolute",background: "#000",border: "0.1em solid gold","border-radius": "0.25em","box-shadow": "0 0 0.5em #FFC700",overflow: "scroll","text-align": "center", "scrollbar-width":"none", width: "25%" }}>
                {combat().computer?.name === "Traveling Kyrisian" && ( <> 
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("cloth"); setSpecialMerchant(false);}}>Soft Cloth</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("jewelry"); setSpecialMerchant(false);}}>Jewelry</button></>)}
                {combat().computer?.name === "Traveling Sedyreal" && ( <> 
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("physical-weapon"); setSpecialMerchant(false);}}>Physical Weapons</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                </>)}
                {combat().computer?.name === "Ashreu'ul" && ( <> 
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("armor"); setSpecialMerchant(false);}}>Armor + Shields</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("cloth"); setSpecialMerchant(false);}}>Soft Cloth</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("physical-weapon"); setSpecialMerchant(false);}}>Physical Weapons</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("jewelry"); setSpecialMerchant(false);}}>Jewelry</button>
                    {/* <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("", "Plate-Mail"); setSpecialMerchant(false);}}>Plate Armor</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("", "Chain-Mail"); setSpecialMerchant(false);}}>Chain Armor</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("", "Leather-Mail"); setSpecialMerchant(false);}}>Leather Mail</button> */}
                </>)}
                {combat().computer?.name === "Kreceus" && ( <> 
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("armor"); setSpecialMerchant(false);}}>Armor + Shields</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("cloth"); setSpecialMerchant(false);}}>Soft Cloth</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("physical-weapon"); setSpecialMerchant(false);}}>Physical Weapons</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("jewelry"); setSpecialMerchant(false);}}>Jewelry</button>
                    {/* <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("", "Plate-Mail"); setSpecialMerchant(false);}}>Plate Armor</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 2s ease infinite")} onClick={async () => {await getLoot("", "Chain-Mail"); setSpecialMerchant(false);}}>Chain Armor</button>
                    <button class="highlight animate center" style={specialMerchantStyle("gradient 1.5s ease infinite")} onClick={async () => {await getLoot("", "Leather-Mail"); setSpecialMerchant(false);}}>Leather Mail</button> */}
                </>)}
            </div>
            <button class="highlight cornerBR" style={{ "background-color": "red" }} onClick={() => setSpecialMerchant(false)}>x</button>
            </div>
        </Show>
        <Show when={forgeModalShow()}> 
            <div class="modal">
                <div class="border superCenter wrap" style={{ width: "50%" }}>
                <p class="center wrap" style={{ color: "red", "font-size": "1.25em", margin: "3%" }}>
                    Do You Wish To Collapse Three {forge()?.name} into one of {GET_NEXT_RARITY[forge()?.rarity as string as keyof typeof GET_NEXT_RARITY]} Quality for {GET_FORGE_COST[forge()?.rarity as string as keyof typeof GET_FORGE_COST]} Gold?
                </p>
                <div>
                    <button class="highlight" style={{ color: "gold", "font-weight": 600, "font-size": "1.5em" }} onClick={() => handleUpgradeItem()}>
                        {forge()?.rarity && GET_FORGE_COST[forge()?.rarity as string as keyof typeof GET_FORGE_COST]} Gold Forge
                    </button>    
                    <div style={{ color: "gold", "font-weight": 600 }}>
                        <p style={{ "font-size": "2em" }}>
                            (3) <img src={forge()?.imgUrl} alt={forge()?.name} style={currentItemStyle(forge()?.rarity as string)} /> 
                            {" => "} <img src={forge()?.imgUrl} alt={forge()?.name} style={currentItemStyle(GET_NEXT_RARITY[forge()?.rarity as string as keyof typeof GET_NEXT_RARITY])} />
                            </p> 
                    </div>
                <button class="highlight cornerBR" style={{ "background-color": "red" }} onClick={() => setForgeModalShow(false)}>x</button>
                </div>
                </div>
            </div>
        </Show>
        <Show when={showSell()}>
            <div class="modal" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                <div class="creature-heading" style={{  position: "absolute",left: "20%",top: "2.5%",height: "95%",width: "60%",background: "#000",border: "0.1em solid gold","border-radius": "0.25em","box-shadow": "0 0 0.5em #FFC700",overflow: "scroll", "scrollbar-width":"none"}}>
                    <h1 class="center" style={{ "margin-bottom": "3%" }}>Sell Items</h1>
                <div class="center">
                <Currency ascean={ascean} />
                </div>
                <div class="playerInventoryBag center" style={{ width: "65%", "margin-bottom": "5%" }}> 
                    <For each={game()?.inventory.inventory}>{(item, _index) => {
                        if (item === undefined || item === undefined) return;
                        return (
                            <div class="center" onClick={() => setItem(item)} style={{ ...getItemStyle(item?.rarity as string), margin: "5.5%",padding: "0.25em",width: "auto" }}>
                                <img src={item?.imgUrl} alt={item?.name} />
                            </div>
                        );
                    }}</For>
                </div>
                <br /><br />
                </div>
                <button class="highlight cornerTL" style={{ "background-color": "gold", color: "#000", "font-weight": 700 }} onClick={() => switchToBuy()}>Buy Loot</button>
                <button class="cornerBR highlight" onClick={() => setShowSell(false)} style={{ "background-color": "red" }}>X</button>
            </div>
        </Show>
        <Show when={showItem()}>
            <div class="modal" onClick={() => setShowItem(false)} style={{ background: "rgba(0, 0, 0, 0)" }}> 
                <ItemModal item={sellItem()} caerenic={false} stalwart={false} />
                <button class="verticalBottom highlight" onClick={() => sellInventory()} style={{ 
                    color: "green", "font-size": "1em", "font-weight": 700, padding: "0.5em", "box-shadow": "0 0 0.75em #00FF00",
                }}>
                    Sell {sellItem()?.name} for {sellRarity(sellItem()?.rarity as string)}
                </button>
            </div>
        </Show>
        <Show when={showQuestComplete()}>
            <div class="modal">
                <div class="creature-heading superCenter" style={{ width: "65%" }}>
                    <div class="border moisten">
                    <h1 class="center" style={{ margin: "3%", color: showQuestSave() ? "gold" : "#fdf6d8" }}>
                        {showCompleteQuest().title} {showQuestSave() ? "(Completed)" : ""} <br />
                    </h1>
                    <h2 class="center" style={{ color: "gold" }}>
                        Quest Giver: {showCompleteQuest().giver}, Level {showCompleteQuest().level} ({showCompleteQuest()?.mastery.charAt(0).toUpperCase() + showCompleteQuest()?.mastery.slice(1)}) <br />
                    </h2>
                    <p class="wrap" style={{ "color":"#fdf6d8", "font-size":"1em", "margin": "3%" }}>
                        {showCompleteQuest().description}
                    </p>
                    <div class="row" style={{ display: "block" }}>
                    <h4 class="gold" style={{margin: "0", padding: "1% 0", display: "inline-block", width: "40%", "margin-left": "5%"}}>
                        Requirements
                    </h4>
                    <h4 class="gold" style={{margin: "0", padding: "1% 0", display: "inline-block", width: "40%", "margin-left": "5%"}}>
                        Rewards
                    </h4>
                    <br />
                    <p style={{ display: "inline-block", width: "40%", "margin-left": "7.5%" }}>
                        Level: <span class="gold">{showCompleteQuest()?.requirements.level}</span><br />
                        Reputation: <span class="gold">{showCompleteQuest()?.requirements.reputation}</span><br />
                        <span>{showCompleteQuest()?.requirements?.technical?.id === "fetch" ? <>Task: <span class="gold">{showCompleteQuest()?.requirements?.technical?.current} / {showCompleteQuest()?.requirements?.technical?.total}</span></> : showCompleteQuest()?.requirements?.technical?.solved ? <span class="gold">Solved</span> : "Unsolved"}</span><br />
                    </p>
                    <p style={{ display: "inline-block", width: "40%", "margin-left": "7.5%" }}>
                        Currency: <span class="gold">{showCompleteQuest()?.rewards?.currency?.gold}g {showCompleteQuest().rewards?.currency?.silver}s.</span><br />
                        Experience: <span class="gold">{showCompleteQuest()?.rewards?.experience}</span><br />
                        Items: <For each={showCompleteQuest()?.rewards?.items}>{(item, index) => {
                            const length = showCompleteQuest()?.rewards?.items.length;
                            return <div style={{ display: "inline-block", color: "gold" }}>
                                {checkReward(item)}{typeof item === "string" ? length === 0 || length - 1 === index() ? "" : `,\xa0` : ""}{" "}
                            </div>
                        }}</For>
                        {showCompleteQuest()?.special ? <><br /> Special: <span class="gold">{showCompleteQuest()?.special}</span></> : ""}
                    </p>
                    </div>
                    <h2 style={{ "text-align":"center", color: "gold" }}>
                        {replaceChar(showCompleteQuest()?.requirements.description, showCompleteQuest()?.giver)}
                    </h2>
                    </div>
                </div>
                    <Show when={!showQuestSave()}>
                        <button class="highlight cornerTR" style={{ right: "0", "color": "green", "font-size" : "1em", "font-weight": 700 }} onClick={() => completeQuest(showCompleteQuest())}>
                            <p style={font("0.75em")}>Complete Quest</p>
                        </button>
                    </Show>
                    <button class="highlight cornerBR" style={{ bottom: "0", right: "0", "color": "red" }} onClick={() => {setShowQuestComplete(false); setShowCompleteQuest(undefined); setShowQuestSave(false)}}>
                        <p style={font("0.75em")}>X</p>
                    </button>
            </div>
        </Show>
        <Show when={rewardItem().show}>
            <div class="modal" onClick={() => setRewardItem({show:false, item:undefined})}>
                <ItemModal item={rewardItem().item} caerenic={false} stalwart={false} />
            </div>
        </Show>
        </Show> 
    );
};