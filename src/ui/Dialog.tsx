import { createSignal, createEffect, Setter, Accessor, Show, onMount, For, JSX, Switch, Match, batch, Suspense, createMemo } from "solid-js"
import { EventBus } from "../game/EventBus";
import { Combat } from "../stores/combat";
import Ascean from "../models/ascean";
import { GameState } from "../stores/game";
import { Institutions, IntstitutionalButtons, LocalLoreButtons, ProvincialWhispersButtons, Region, SupernaturalEntity, SupernaturalEntityButtons, SupernaturalEntityLore, SupernaturalPhenomena, SupernaturalPhenomenaButtons, SupernaturalPhenomenaLore, Whispers, WhispersButtons, WorldLoreButtons, World_Events, institutions, localLore, provincialInformation, whispers, worldLore, INSTITUTIONS_CHECK, WHISPER_CHECK, REGION_CHECK, WORLD_EVENTS_CHECK, SUPERNATURAL_PHENOMENA_CHECK, FLAT_ENTITY_CHECK_MAP } from "../utility/regions";
import { LUCKOUT, LuckoutModal, PERSUASION, PersuasionModal, QuestModal, checkTraits } from "../utility/traits";
import { DialogNode, DialogNodeOption, getNodesForEnemy, getNodesForNPC, npcIds } from "../utility/DialogNode";
import Typewriter from "../utility/Typewriter";
import Currency from "../utility/Currency";
import Equipment, { determineMutation, getArmorEquipment, getClothEquipment, getJewelryEquipment, getMagicalWeaponEquipment, getMerchantEquipment, getOneDetermined, getPhysicalWeaponEquipment, getSpecificArmor } from "../models/equipment";
import { LevelSheet } from "../utility/ascean";
import { font, getRarityColor, masteryColor, sellRarity } from "../utility/styling";
import ItemModal, { attrSplitter } from "../components/ItemModal";
import QuestManager, { Condition, getQuests, Quest, QUEST_TEMPLATES, replaceChar } from "../utility/quests";
import { ENEMY_ENEMIES, FACTION, initFaction, namedNameCheck, Reputation } from "../utility/player";
import Thievery from "./Thievery";
import Merchant from "./Merchant";
import Roster from "./Roster";
import { ArenaRoster } from "./BaseUI";
import Settings from "../models/settings";
import { usePhaserEvent } from "../utility/hooks";
import { fetchTutorial } from "../utility/enemy";
import { getParty, updateItem } from "../assets/db/db";
import { IRefPhaserGame, rebalanceCurrency } from "../game/PhaserGame";
import { Weapons } from "../assets/db/weaponry";
import { Amulets, Trinkets } from "../assets/db/jewelry";
import { roundToTwoDecimals } from "../utility/combat";
import MerchantLoot, { MassSell, QuickSell } from "./MerchantLoot";
import Registry from "./Registry";
import { Play } from "../game/main";
import { addSpecial, SPECIAL } from "../utility/abilities";
import { ACTION_ORIGIN } from "../utility/actions";
import AsceanImageCard from "../components/AsceanImageCard";
import { Puff } from "solid-spinner";
import { ITEMS } from "../assets/db/items";
import { Item } from "../models/item";
import SpecialItemModal from "../components/SpecialItemModal";

function itemCostConverter(cost: number) {
    const convert = cost * 100;
    const gold = Math.floor(convert / 100);
    const silver = Math.floor(convert % 100);
    return { gold, silver };
};

export type Currency = {gold:number; silver:number;};
export type Purchase = {item: Equipment;cost: Currency;};

const GET_ETCH_COST = {
    Common: 0.1,
    Uncommon: 0.25,
    Rare: 1,
    Epic: 2,
};
const GET_FORGE_COST = {
    Common: 1,
    Uncommon: 3,
    Rare: 12,
    Epic: 60,
};
const GET_REFORGE_COST = {
    Common: 0.05,
    Uncommon: 0.1,
    Rare: 0.5,
    Epic: 1,
};
const GET_PRICE = {
    Common: 0.1,
    Uncommon: 1,
    Rare: 3,
    Epic: 12,
    Legendary: 50
};
const GET_NEXT_RARITY = {
    Common: "Uncommon",
    Uncommon: "Rare",
    Rare: "Epic",
    Epic: "Legendary",
};
const SANITIZE = {
    criticalChance: "Critical Chance",
    criticalDamage: "Critical Damage",
    magicalDamage: "Magical Damage",
    physicalDamage: "Physical Damage",
    magicalPenetration: "Magical Penetration",
    physicalPenetration: "Physical Penetration",
    magicalResistance: "Magical Resistance",
    physicalResistance: "Physical Resistance",
    roll: "Roll",
    constitution: "Constitution",
    strength: "Strength",
    agility: "Agility",
    achre: "Achre",
    caeren: "Caeren",
    kyosir: "Kyosir",
    influences: "Influences",
};
const TYPEWRITER = { 
    "font-size": "1.15rem", margin: "0 auto", width: "95%", "white-space": "pre-wrap", padding: "0.5rem 0" , height: "auto"
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
        <Show when={showDialogOptions()}>
            <button class="highlight" style={{ "font-size": "0.85rem" }} onClick={handleClick} data-function-name="handleClick">
                <Typewriter stringText={option.text} styling={{ "overflow-y": "auto", "scrollbar-width": "none", "text-align": "left" }} performAction={hollowClick} />
            </button>
        </Show>
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
    const [etchModalShow, setEtchModalShow] = createSignal<{show:boolean;item:Equipment|undefined;types:string[];}>({show:false,item:undefined,types:[]});
    const [influence, setInfluence] = createSignal(combat()?.weapons[0]?.influences?.[0]);
    const [sans, setSans] = createSignal<string[]>([]);
    const [persuasionString, setPersuasionString] = createSignal<string>("");
    const [luckoutString, setLuckoutString] = createSignal<string>("");
    const [upgradeItems, setUpgradeItems] = createSignal<any | undefined>(undefined);
    const [namedEnemy, setNamedEnemy] = createSignal<boolean>(false);
    const [playerResponses, setPlayerResponses] = createSignal<string[]>([]);
    const [keywordResponses, setKeywordResponses] = createSignal<string[]>([]);
    const [toggleInventorySell, setToggleInventorySell] = createSignal<boolean>(false);
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
    const [concept, setConcept] = createSignal<any>("");//(institutions["Ascea"].preamble);
    const [currentInstitution, setCurrentInstitution] = createSignal<any>("");//("Ascea");
    const [institution, setInstitution] = createSignal<any>("");//(institutions["Ascea"]);
    const [local, setLocal] = createSignal<any>("");//(localLore["Astralands"]);
    const [region, setRegion] = createSignal<any>("");//(provincialInformation["Astralands"]);
    const [entity, setEntity] = createSignal<any>(SupernaturalEntityLore["Hybrida"]);
    const [entityPreamble, setEntityPreamble] = createSignal<any>(SupernaturalEntityLore["Hybrida"].Preamble);
    const [currentEntity, setCurrentEntity] = createSignal<any>("");//("Ahn'are"); // ("")
    const [entityConcept, setEntityConcept] = createSignal<any>("");//(SupernaturalEntityLore["Hybrida"]["Ahn'are"]); // ("");
    const [phenomena, setPhenomena] = createSignal<any>("");//(SupernaturalPhenomenaLore["Charm"]);
    const [currentWhisper, setCurrentWhisper] = createSignal<any>("");//("Ancients");
    const [whisper, setWhisper] = createSignal<any>("");//(whispers["Ancients"]);
    const [whisperConcept, setWhisperConcept] = createSignal<any>("");//(whispers["Ancients"].history);
    const [world, setWorld] = createSignal<any>("");//(worldLore["Age_of_Darkness"])
    const [showSell, setShowSell] = createSignal<boolean>(false);
    const [sellItem, setSellItem] = createSignal<Equipment | undefined>(undefined);
    const [showItem, setShowItem] = createSignal<boolean>(false);
    const [showItemBuy, setShowItemBuy] = createSignal<boolean>(false);
    const [showBuy, setShowBuy] = createSignal<boolean>(false);
    const [completeQuests, setCompleteQuests] = createSignal<any[]>([]);
    const [prospectiveQuests, setProspectiveQuests] = createSignal<any[]>([]);
    const [showQuests, setShowQuests] = createSignal<boolean>(false);
    const [fetchQuests, setFetchQuests] = createSignal<any>([]);
    const [solveQuests, setSolveQuests] = createSignal<any>([]);
    const [showQuestComplete, setShowQuestComplete] = createSignal<any>(false);
    const [showQuestSave, setShowQuestSave] = createSignal<any>(false);
    const [showCompleteQuest, setShowCompleteQuest] = createSignal<any>(undefined);
    const [completeQuestPre, setCompleteQuestPre] = createSignal<any>(undefined);
    const [massLootSell, setMassLootSell] = createSignal<{id:string;rarity:string;}[]>([]);
    const [massLootBuy, setMassLootBuy] = createSignal<{id:string;cost:Currency}[]>([]);
    const [merchantSell, setMerchantSell] = createSignal<boolean>(false);
    const [itemShow, setItemShow] = createSignal<any>({ show: false, item: undefined });
    const [forge, setForge] = createSignal<Equipment | undefined>(undefined);
    const [forgeSee, setForgeSee] = createSignal<boolean>(false);
    const [etchings, setEtchings] = createSignal<{show:boolean; items:Equipment[];}>({show:false,items:[]});
    const [forgings, setForgings] = createSignal<{highlight:string;show:boolean;items:Equipment[];}>({highlight:"",show:false,items:[]});
    const [reforge, setReforge] = createSignal<{show:boolean;item:Equipment|undefined;cost:number;}>({show:false,item:undefined,cost:0});
    const [stealing, setStealing] = createSignal<{ stealing: boolean, item: any }>({ stealing: false, item: undefined });
    const [rewardItem, setRewardItem] = createSignal<{show:boolean,item:any}>({show:false,item:undefined});
    const [thievery, setThievery] = createSignal<boolean>(false);
    const [specialMerchant, setSpecialMerchant] = createSignal<boolean>(false);
    const [arena, setArena] = createSignal<ArenaRoster>({ show: false, enemies: [], wager: { silver: 0, gold: 0, multiplier: 0 }, party: false, result: false, win: false, map: "ARENA", gauntlet: { opponents: 1, type: "RANDOMIZED", round: 1 } });
    const [rep, setRep] = createSignal<FACTION>(initFaction);
    const [party, setParty] = createSignal(false);
    const [registry, setRegistry] = createSignal(false); // setShowTools
    const [showTools, setShowTools] = createSignal(false); // setShowTools
    const [itemCosts, setItemCosts] = createSignal<Record<string, {silver: number, gold: number}>>({});
    const [popupReward, setPopupReward] = createSignal<any>(null); // Holds the reward object/text to display
    const [rewardQueue, setRewardQueue] = createSignal<any[]>([]); // Holds the list of remaining rewards
    const [isOverlayVisible, setIsOverlayVisible] = createSignal(false);
    const [showSpecial, setShowSpecial] = createSignal<{show:boolean,special:any}>({ show: false, special: ACTION_ORIGIN["ATTACK"] });
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [show, setShow] = createSignal<boolean>(false);
    const [enemy, setEnemy] = createSignal(combat().computer as Ascean);
    // const capitalize = (word: string): string => word === "a" ? word?.charAt(0).toUpperCase() : word?.charAt(0).toUpperCase() + word?.slice(1);
    const getItemKey = (item: Equipment) => `${item._id}-${item.name}`;
    const getItemStyle = (rarity: string): JSX.CSSProperties => {
        return {
            border: `thick ridge ${getRarityColor(rarity)}`,
            "background-color": "#000",
        };
    };

    function generateAllCostsImmediately(items: Equipment[]) {        
        const newCosts: Record<string, {silver: number, gold: number}> = {};
        for (const item of items) {
            newCosts[getItemKey(item)] = determineItemCost(item);
        };
        setItemCosts(newCosts);
    };

    createEffect(() => setMerchantTable(game().merchantEquipment));

    createEffect(() => { 
        checkEnemy(combat()?.computer as Ascean, quests);
        checkLuckout(game());
        checkPersuasion(game());
        checkInfluence(ascean);
        checkUpgrades();
        checkParty();
    });

    const tools = createMemo(() => {
        const toolItems = ITEMS.filter((item: Item) => item.type === "Tool");

        const soldTools: Item[] = [];
        for (let i = 0; i < toolItems.length; ++i) {
            let tool = toolItems[i];
            const duplicate = uniqueItem(tool);
            if (!duplicate) {
                soldTools.push(tool);
            };
        };

        return soldTools.sort((a: Item, b: Item) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
    });

    function uniqueItem(item: Item) {
        const isUnique = game().specialInventory.inventory.find((i: Item) => i.name === item.name && i.isUnique);
        return isUnique !== undefined;
    };

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
        setForgeSee: () => {setForgeSee(!forgeSee()); setEtchings({...etchings(), show:false}); setForgings({...forgings(), show:false});},
        setReetchSee: () => {checkEtchings(); setForgeSee(false); setForgings({...forgings(), show:false});},
        setReforgeSee: () => {checkForgings(); setForgeSee(false); setEtchings({...etchings(), show:false});},
        setRegistry: () => setRegistry(true),
        setTools: () => setShowTools(true),
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

    function determineItemCost(item: Equipment): {silver: number, gold: number} {
        switch (item.rarity) {
            case "Common": 
                return { silver: Math.floor(Math.random() * 15) + 10, gold: 0 };
            case "Uncommon": 
                return { silver: Math.floor(Math.random() * 99) + 1, gold: 1 };
            case "Rare": 
                return { silver: Math.floor(Math.random() * 99) + 1, gold: Math.floor(Math.random() * 3) + 3 };
            case "Epic": 
                return { silver: Math.floor(Math.random() * 99) + 1, gold: Math.floor(Math.random() * 5) + 10 };
            default: 
                return { silver: 10, gold: 0 };
        };
    };

    const getItemCost = (item: Equipment) => {
        const costs = itemCosts();
        const key = getItemKey(item);
        return costs[key] || {silver: 0, gold: 0};
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

    function checkEtchings() {
        const items: any[] = [];
        const prospect: Equipment[] = game()?.inventory.inventory.filter((eqp: Equipment) => eqp?.influences !== undefined);
        prospect.push(ascean().weaponOne);
        prospect.push(ascean().weaponTwo);
        prospect.push(ascean().weaponThree);
        prospect.push(ascean().amulet);
        prospect.push(ascean().trinket);
        let jewelry = Amulets.concat(Trinkets);
        jewelry = jewelry.filter((j: any) => j.rarity === "Uncommon");
        for (let i = 0; i < prospect.length; ++i) {
            const item = prospect[i];
            if (item?.grip !== undefined) { // Weapon
                const base = Weapons.find((w: any) => w.name === item.name);
                if (base?.influences.length! > 1) items.push(item);
            } else { // Amulet / Trinket
                const base = jewelry.find((j: any) => j.name === item.name);
                if (base?.influences.length! > 1) items.push(item);
            };
        };

        setEtchings({show:true, items});
    };

    function checkForgings() {
        let items = [ascean().weaponOne, ascean().weaponTwo, ascean().weaponThree, ascean().shield, ascean().helmet, ascean().chest, ascean().legs, ascean().amulet, ascean().ringOne, ascean().ringTwo, ascean().trinket].filter((i: Equipment) => !i.rarity?.includes("Default"));
        setForgings({...forgings(),show:true,items});
    };

    const checkEnemy = (enemy: Ascean, manager: Accessor<QuestManager>) => {
        if (!enemy) return;
        setEnemy(enemy);
        setNamedEnemy(namedNameCheck(enemy.name.split("(Converted)")[0].trim()));
        setEnemyArticle(() => ["a", "e", "i", "o", "u"].includes(enemy.name.charAt(0).toLowerCase()) ? "an" : "a");
        setEnemyDescriptionArticle(() => combat().computer?.description.split(" ")[0].toLowerCase() === "the" ? "the" : ["a", "e", "i", "o", "u"].includes((combat().computer?.description as string).charAt(0).toLowerCase()) ? "an" : "a");
        const rep = reputation().factions.find((f: FACTION) => f.name === combat().computer?.name.split("(Converted)")[0].trim()) as FACTION;
        if (rep) setRep(rep);
        checkQuests(enemy, manager().quests);
    };
    
    const checkInfluence = (a: Accessor<Ascean>) => setInfluence(a()?.weaponOne?.influences?.[0]);
    
    const checkParty = async () => {
        const par = await getParty(ascean()._id);
        setParty(par.party.length < 3);
    }; 

    function checkCondition(conditions: Condition) {
        let { key, operator, value } = conditions;
        // console.log({key, operator, value});
        switch (operator) {
            case ">":
                return ascean()[key] > value;
            case ">=":
                return ascean()[key] >= value;
            case "<":
                return ascean()[key] < value;
            case "<=":
                return ascean()[key] <= value;
            case "=":
                return ascean()[key] === value;
            default:
                return false;
        };
    };

    const checkQuests = (enemy: Ascean, quest: Quest[]) => {
        // This will create quests for a (Converted) version of the enemy. Good for the future, but not right now for archtecting and general functionality.
        // const name = enemy.name.split("(Converted)")[0].trim();
        const completedQuests = [];
        const fetch = [];
        const solve = [];
        for (const q of quest) {
            const completed = q.requirements.technical.id === "fetch" ? q.requirements.technical.current === q.requirements.technical.total : q.requirements.technical.solved;
            const qRep = rep().reputation >= q.requirements.reputation;
            if (q.giver === enemy.name && completed && qRep) { // Quest The Enemy of One of the Faction Has Given the Player
                completedQuests.push(q);
            };

            if (q.requirements.technical.id === "fetch") {
                fetch.push(q);
            };
            if (q.requirements.technical.id === "solve") {
                solve.push(q);
            };
        };
        setCompleteQuests(completedQuests);
        setFetchQuests(fetch);
        setSolveQuests(solve);

        const enemyQuests = getQuests(enemy.name);
        const prospectiveQuests = [];
        if (enemyQuests.length === 0) return;
        // const playerQuests = new Set(quest.map(q => q.title)); // Convert player quests to a set for easy lookup
        const questGiverCheck = (enemyQuest: any) => {
            let check = true;
            if (enemyQuest.requirements?.conditions !== undefined) {
                check = checkCondition(enemyQuest.requirements.conditions as Condition);
            };
            for (let i = 0; i < quest.length; ++i) {
                if (quest[i].title === enemyQuest.title && quest[i].giver === enemy.name) {
                    check = false;
                };
            };
            return check;
        };
        for (const enemyQuest of enemyQuests) {
            if (questGiverCheck(enemyQuest)) { // && enemyQuest.giver !== computer().name || !playerQuests.has(enemyQuest.title) || 
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
            let complete = {
                ...quest,
                rewards: {
                    ...quest.rewards,
                    items
                }
            };
            let completed = JSON.parse(JSON.stringify(completeQuests()));
            completed = completed.filter((q: Quest) => q._id !== quest._id);
            setCompleteQuests(completed);

            const rewards = [];

            if (quest.rewards.currency.gold > 0 || quest.rewards.currency.silver > 0) {
                rewards.push({ type: "Currency", value: `${quest.rewards.currency.gold}g ${quest.rewards.currency.silver}s` });
            };
            if (quest.rewards.experience > 0) {
                rewards.push({ type: "Experience", value: `${quest.rewards.experience} EXP` });
            };
            if (complete.rewards?.items?.length as number > 0) {
                complete.rewards?.items?.forEach(item => {
                    rewards.push({ type: "Item", value: item });
                });
            };
            if (quest.special) {
                const duplicate = settings().totalSpecials.includes(quest.special);
                if (duplicate) {
                    const template = QUEST_TEMPLATES.find((q) => q.title === quest.title)!;
                    const totalSpecials = template.reward.filter(r => SPECIAL[ascean().mastery].includes(r) && !settings().totalSpecials.includes(r));
                    if (totalSpecials.length) {
                        const newSpecial = totalSpecials[Math.floor(Math.random() * totalSpecials.length)];
                        rewards.push({ type: "Special", value: newSpecial });
                        complete.special = newSpecial;
                    };
                } else {
                    rewards.push({ type: "Special", value: quest.special });
                };
            };
            
            setCompleteQuestPre(complete);
            setIsOverlayVisible(true);
            setRewardQueue(rewards);
            
            processRewardQueue(rewards);
        } catch (err) {
            console.warn(err, "Error Completing Quest");
        };
    };

    const checkQueue = () => {
        setTimeout(() => {
            setPopupReward(null);
            processRewardQueue(rewardQueue());
        }, 128)
    };

    const processRewardQueue = (queue: any[]) => {
        if (queue.length === 0) {
            setPopupReward(null);
            setTimeout(() => setIsOverlayVisible(false), 128);
            return;
        };
        
        setPopupReward(null);
        const [nextReward, ...rest] = queue;
        setRewardQueue(rest);

        const type = nextReward.type;
        const length = rest.length;

        switch (type) {
            case "Currency":
                EventBus.emit("purchase-sound");
                break;
            case "Experience":
                (instance.scene as Play).hud.sound.play("treasure", { volume: settings().volume }); // phenomena
                break;
            case "Item":
                (instance.scene as Play).hud.sound.play("phenomena", { volume: settings().volume });
                break;
            case "Special":
                (instance.scene as Play).hud.sound.play("righteous", { volume: 1 });
                break;
            default: break;
        };
        
        if (type === "Item" || type === "Special") {
            setPopupReward(nextReward);

            if (length === 0) { // type === "Special"
                // console.log("Length is now 0");
                setTimeout(() => {
                    const complete = completeQuestPre();
                    addSpecial(ascean, settings, complete.special);
                    setShowCompleteQuest(complete);
                    EventBus.emit("save-quest-to-player", complete);
                    EventBus.emit("complete-quest", complete);
                    setShowQuestSave(true);
                    setCompleteQuestPre(undefined);
                }, 320);
            };
            return;
        };
        
        setTimeout(() => {
            setPopupReward(nextReward);

            setTimeout(() => {
                processRewardQueue(rest);
            }, 2000);
        }, 32);
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
            EventBus.emit(PERSUASION, { persuasion, persuaded: true });
            const num = Math.floor(Math.random() * 2); 
            const str = `${persuasionTrait?.persuasion.success[num].replace("{enemy.name}", combat()?.computer?.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", combat()?.player?.name).replace("{enemy.weaponOne.influences[0]}", combat()?.computerWeapons[0]?.influences?.[0]).replace("{enemy.faith}", combat()?.computer?.faith)}`;
            setPersuasionString(str);
        } else {
            checkingLoot();
            EventBus.emit(PERSUASION, { persuasion, persuaded: false });
            const str = `Failure. ${persuasionTrait?.persuasion?.failure.replace("{enemy.name}", combat()?.computer?.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", combat()?.player?.name).replace("{enemy.weaponOne.influences[0]}", combat()?.computerWeapons[0]?.influences?.[0]).replace("{enemy.faith}", combat()?.computer?.faith)} \n\n Nevertheless, prepare for some chincanery, ${combat().player?.name}, and perhaps leave the pleasantries for warmer company.`;
            setPersuasionString(str);
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
            const computerLevel = combat().computer?.level as number;
            let experience = ascean().experience +Math.round(computerLevel * 100 * (computerLevel / ascean().level) + combat().playerAttributes.rawKyosir);
            const newState: LevelSheet = { 
                ...asceanState(), 
                avarice: combat().prayerData.length > 0 ? combat().prayerData.includes("Avarice") : false, 
                currency: ascean().currency,
                firewater: ascean().firewater,
                currentHealth: combat().newPlayerHealth,
                opponent: computerLevel,
                opponentExp: Math.min(experience, combat()?.player?.level! * 1000),
            };
            const loot = { enemyID: combat().enemyID, level: computerLevel };
            EventBus.emit("gain-experience", newState);
            EventBus.emit("enemy-loot", loot);
            EventBus.emit(LUCKOUT, { luck, luckout: true });
            const num = Math.floor(Math.random() * 2);
            setLuckoutString(`${luckoutTrait?.luckout?.success[num].replace("{enemy.name}", enemy.name).replace("{ascean.weaponOne.influences[0]}", influence()).replace("{ascean.name}", ascean().name).replace("{enemy.weaponOne.influences[0]}", enemy.weaponOne.influences?.[0]).replace("{enemy.faith}", enemy.faith).replace("{article}", enemyArticle)}`);
        } else {
            EventBus.emit(LUCKOUT, { luck, luckout: false });
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

    const handleInstitutionalConcept = (con: string): void => setConcept(institution()[con]);
    
    const handleEntityConcept = (con: string): void => setEntityConcept(entity()[con]);
    
    const handleWhisperConcept = (con: string): void => setWhisperConcept(whisper()[con]);

    const handleInstitution = (inst: keyof Institutions) => {
        setCurrentInstitution(inst);
        setInstitution(institutions[inst]);
        setConcept(institutions[inst]["preamble"]);
    };

    const handleLocal = (local: keyof Region) => setLocal(localLore[local]);
    
    const handleRegion = (region: keyof Region) => setRegion(provincialInformation[region]);
    
    const handleEntity = (ent: keyof SupernaturalEntity) => {
        setCurrentEntity(ent);
        setEntity(SupernaturalEntityLore[ent]);
        setEntityPreamble(entity().Preamble);
    };

    const handlePhenomena = (phenomena: keyof SupernaturalPhenomena) => setPhenomena(SupernaturalPhenomenaLore[phenomena]);
    
    const handleWhisper = (worship: keyof Whispers) => {
        setCurrentWhisper(worship);
        setWhisper(whispers[worship]);
        setWhisperConcept(whispers[worship]["history"]);
    };

    const handleWorld = (world: keyof World_Events) => setWorld(worldLore[world]);
    
    const engageCombat = (id: string): void => {
        checkingLoot();
        EventBus.emit("aggressive-enemy", { id, isAggressive: true });
        EventBus.emit("blend-game", { showDialog: false });
        EventBus.emit("update-pause", false);
        EventBus.emit("action-button-sound");
        EventBus.emit("engage");
    };

    const clearDuel = () => {
        EventBus.emit("outside-press", "dialog");
        EventBus.emit("action-button-sound");
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
            batch(() => {
                setMerchantTable(merchantEquipment);
                generateAllCostsImmediately(merchantEquipment); // Sync cost calculation
            });
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
    
    function checkMassSell(item: Equipment) {
        if (massLootSell().find((loot: {id:string,rarity:string}) => loot.id === item._id) !== undefined) {
            setMassLootSell((prev) => prev.filter((p: {id:string, rarity:string}) => p.id !== item._id));
        } else {
            setMassLootSell([
                ...massLootSell(),
                {id:item._id, rarity: item.rarity as string}
            ]);
        };
    };

    function checkMassBuy(item: Equipment) {
        if (massLootBuy().find((loot: {id:string,cost:Currency}) => loot.id === item._id) !== undefined) {
            setMassLootBuy((prev) => prev.filter((p: {id:string, cost:Currency}) => p.id !== item._id));
        } else {
            const cost = getItemCost(item);
            setMassLootBuy([
                ...massLootBuy(),
                {id:item._id, cost}
            ]);
        };
    };

    function getCheckmark(id: string) {
        return massLootSell().find((loot: {id:string,rarity:string}) => loot.id === id) !== undefined;
    };

    function getBuyMark(id: string) {
        return massLootBuy().find((loot: {id:string,cost:Currency}) => loot.id === id) !== undefined;
    };

    function setItem(item: Equipment) {
        setSellItem(item);
        setShowItem(true);
    };

    function setItemBuy(item:Equipment) {
        setSellItem(item);
        setShowItemBuy(true)
    };
    
    function sellIitem(item: Equipment) {
        const cost = determineItemCost(item);
        const key = getItemKey(item);
        setItemCosts(prev => ({ ...prev, [key]: cost }));
        
        EventBus.emit("alert", { header: "Selling Item In Inventory", body: `You have sold your ${item?.name} for ${sellRarity(item?.rarity as string)}` })
        EventBus.emit("sell-item", item);
    };

    function sellInventory() {
        const cost = determineItemCost(sellItem() as Equipment);
        const key = getItemKey(sellItem() as Equipment);
        setItemCosts(prev => ({ ...prev, [key]: cost }));
        
        EventBus.emit("alert", { header: "Selling Item In Inventory", body: `You have sold your ${sellItem()?.name} for ${sellRarity(sellItem()?.rarity as string)}` })
        EventBus.emit("sell-item", sellItem());
    };

    function sellMassLoot() {
        const stitch: any = {};
        for (let i = 0; i < massLootSell().length; ++i) {
            const item = game().inventory.inventory.find((inventory: Equipment) => inventory._id === massLootSell()[i].id);
            if (item) {
                const cost = determineItemCost(item);
                const key = getItemKey(item);
                stitch[key] = cost;
            };
        };
        setItemCosts(prev => ({ ...prev, ...stitch }));
        EventBus.emit("alert", { header: "Selling Item(s) In Inventory", body: `You have sold ${massLootSell().length} items for ${totalLoot(massLootSell).gold}g ${totalLoot(massLootSell).silver}s!` });
        EventBus.emit("sell-items", massLootSell());
        setMassLootSell([]);
    };
    
    function buyMassLoot() {
        if (totalBuyLoot() > ascean().currency) {
            EventBus.emit("alert", { header: "[ERROR] Purchasing Item(s) From Merchant", body: `You do not have the funds to purchase the ${massLootBuy().length} items for ${totalBuyLoot().gold}g ${totalBuyLoot().silver}s!` });
            return;    
        };
        EventBus.emit("alert", { header: "Purchasing Item(s) From Merchant", body: `You have purchased ${massLootBuy().length} items for ${totalBuyLoot().gold}g ${totalBuyLoot().silver}s!` });
        EventBus.emit("buy-items", {items:massLootBuy(), total:totalBuyLoot()});
        setMassLootBuy([]);
    };

    function totalLoot(type: Accessor<any>) {
        let total = 0;
        for (let i = 0; i < type().length; ++i) {
            total += GET_PRICE[type()[i].rarity as keyof typeof GET_PRICE];
        };
        return rebalanceCurrency({gold:total,silver:0});
    };

    function totalBuyLoot() {
        let total: Currency = {gold:0,silver:0};
        for (let i = 0; i < massLootBuy().length; ++i) {
            total.silver += massLootBuy()[i].cost.silver;
            total.gold += massLootBuy()[i].cost.gold;
        };
        return rebalanceCurrency(total);
    };

    async function handleEtching(type: string, cost: number, item: Equipment) {
        let currency = ascean().currency;
        const silver = cost * 100;
        if (silver > ascean().currency.silver && ascean().currency.gold === 0) {
            EventBus.emit("alert", { header: "Insufficient Funds", body: `You do not have enough money. The blacksmith requires ${silver} silver to etch ${type} into your ${item.name}.` });
            setEtchModalShow({show:false,item:undefined,types:[]});
            return;
        };
        if (cost > ascean().currency.gold) {
            EventBus.emit("alert", { header: "Insufficient Funds", body: `You do not have enough money. The blacksmith requires ${cost} gold to etch ${type} into your ${item.name}.` });
            setEtchModalShow({show:false,item:undefined,types:[]});
            return;
        };
        if (cost < 1) { // silver cost
            currency.silver -= silver;
        } else { // Gold Cost
            currency.gold -= cost;
        };
        currency = rebalanceCurrency(currency);
        EventBus.emit("alert", {header:"Change Etching",body:`You have changed your ${item.name}'s influence from ${item.influences?.[0]} to ${type}`});
        let equipment = JSON.parse(JSON.stringify(item));
        equipment.influences = [type];
        await updateItem(equipment);
        const inventoryIndex = game().inventory.inventory.findIndex((inv: Equipment) => inv._id === equipment._id);

        if (inventoryIndex !== -1) { // In Inventory
            let newInventory = JSON.parse(JSON.stringify(game().inventory.inventory));
            newInventory[inventoryIndex] = equipment;
            EventBus.emit("refresh-inventory", newInventory);
        } else { // On Player
            EventBus.emit("fetch-ascean", ascean()._id);
        };

        setEtchModalShow({show:false,item:undefined,types:[]});
        EventBus.emit("purchase-sound");
        setTimeout(() => {
            EventBus.emit("update-currency", currency);
            checkEtchings();
        }, 500);
    };

    function handleUpgradeItem() { // async
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

    function itemReforge(item: Equipment) {
        setReforge({...reforge(), show:true, item, cost:GET_REFORGE_COST[item.rarity as keyof typeof GET_REFORGE_COST]});
    };

    async function handleReforge() {
        let currency = ascean().currency;
        const silver = reforge().cost * 100;
        if (silver > currency.silver && currency.gold === 0) {
            EventBus.emit("alert", {header:"Insufficient Funds",body:`You do not have enough money. The blacksmith requires ${silver} silver to reforge your ${reforge().item?.name}`});
            setReforge({...reforge(),show:false,item:undefined,cost:0});
            setSans([]);
            return;
        };
        if (reforge().cost > currency.gold) {
            EventBus.emit("alert", {header:"Insufficient Funds",body:`You do not have enough money. The blacksmith requires ${reforge().cost} gold to reforge your ${reforge().item?.name}`});
            setReforge({...reforge(),show:false,item:undefined,cost:0});
            setSans([]);
            return;
        };
        if (reforge().cost < 1) {
            currency.silver -= silver;
        } else {
            currency.gold -= reforge().cost;
        };
        currency = rebalanceCurrency(currency);
        // EventBus.emit("alert", {header:"Reforging Item",body:`You have reforged your ${reforge().item?.name}! Hopefully it is more to your liking, ${ascean().name}.`});
        const equipment = determineMutation(reforge().item as Equipment, sans());
        await updateItem(equipment as Equipment);
        const inventoryIndex = game().inventory.inventory.findIndex((inv: Equipment) => inv._id === equipment?._id);
        if (inventoryIndex !== -1) { // In Inventory
            let newInventory = JSON.parse(JSON.stringify(game().inventory.inventory));
            newInventory[inventoryIndex] = equipment;
            EventBus.emit("refresh-inventory", newInventory);
        } else { // On Player
            EventBus.emit("fetch-ascean", ascean()._id);
        };
        setForgings({...forgings(),highlight:reforge().item?._id as string});
        setReforge({show:false,item:undefined,cost:0});
        setSans([]);
        EventBus.emit("purchase-sound");
        setTimeout(() => {
            EventBus.emit("update-currency", currency);
            checkForgings();
            setTimeout(() => {
                setForgings({
                    ...forgings(),
                    highlight: ""
                });
            }, 1500);
        }, 500);
    };

    function itemReetch(item: Equipment) {
        let types;
        if (item?.grip !== undefined) {
            types = Weapons.find((w:any) => w.name === item.name)?.influences;
        } else {
            types = Amulets.find((w:any) => w.name === item.name)?.influences || Trinkets.find((t:any) => t.name === item.name)?.influences;
        };
        setEtchModalShow({show:true,item,types:types as string[]});
    };

    function performAction(actionName: string) {
        const actionFunction = actions[actionName as keyof typeof actions];
        if (actionFunction) {
            actionFunction();
        };
    };

    function convertEnemy(quest: Quest) {
        const newQuests = quests().quests.map((q: Quest) => {
            const newQ = q.title === quest.title // was _id 
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
        (instance.scene as Play).combatManager.convert(combat().enemyID, quest.requirements.action.value);
    };

    function convertPlayer(quest: Quest) {
        const newQuests = quests().quests.map((q: Quest) => {
            const newQ = q._id === quest._id 
                ? {
                    ...q, 
                    requirements: {
                        ...q.requirements,
                        technical: {
                            ...q.requirements.technical,
                            solved: true
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
        
        EventBus.emit("alert", { header: `Updating ${quest.title}`, body: `You have successfully converted from ${ascean().faith} to become ${quest.requirements.action.value}. Rejoice!`, key: "Close" });
        EventBus.emit("update-quests", newQuestManager);
        EventBus.emit("update-ascean", {
            ...ascean(),
            faith: quest.requirements.action.value
        });

    };

    function specialMerchantStyle(animation: string) {
        return {
            "font-weight": 700,
            display: "block",
            margin: "5% auto",
            padding: "5%",
            animation
        };
    };

    function changeEnemyToParty() {
        EventBus.emit("add-party", {name: combat().computer?.name.split(" (Converted)")[0], level: combat().computer?.level});
        EventBus.emit("despawn-enemy-to-party", combat().enemyID);
        EventBus.emit("clear-enemy");
        EventBus.emit("action-button-sound");
        EventBus.emit("blend-game", { showDialog: false });
        EventBus.emit("update-pause", false);
        EventBus.emit("show-dialog-false");
    };

    function checkConditions() {
        const name = combat().computer?.name.split(" (Converted)")[0];
        const enemies = ENEMY_ENEMIES[name as keyof typeof ENEMY_ENEMIES].map((e: any, i: number) => {
            const length = ENEMY_ENEMIES[name as keyof typeof ENEMY_ENEMIES].length; 
            return `${length - 1 === i ? " and " : " "}${e}`
        });
        return enemies;
    };

    function checkReward(item: string | Equipment, num = "4mm") {
        if (typeof item === "string") {
            return item;
        } else { // Equipment
            return <div onClick={() => setRewardItem({show:true,item})} style={{ "border": `${num} ridge ${getRarityColor(item.rarity as string)}`, "transform": "scale(1.1)", "background-color": "#000", "margin": "0.25em" }}>
                <img src={item.imgUrl} alt={item.name} class="juiceNB" style={{ height: "100%", width: "100%" }} />
            </div>;
        };
    };

    const reforgeConcerns = (item: Equipment) => {
        return { 
            magicalDamage: item?.grip !== undefined ? item.magicalDamage : undefined,
            physicalDamage: item?.grip !== undefined ? item.physicalDamage : undefined,
            criticalChance: item?.criticalChance,
            criticalDamage: item?.criticalDamage,
            magicalPenetration: item?.magicalPenetration !== undefined ? item.magicalPenetration : undefined,
            physicalPenetration: item?.physicalPenetration !== undefined ? item.physicalPenetration : undefined,
            magicalResistance: item?.magicalResistance,
            physicalResistance: item?.physicalResistance,
            roll: item?.roll,
            constitution: item?.constitution > 0 ? item.constitution : undefined,
            strength: item?.strength > 0 ? item.strength : undefined,
            agility: item?.agility > 0 ? item.agility : undefined,
            achre: item?.achre > 0 ? item.achre : undefined,
            caeren: item?.caeren > 0 ? item.caeren : undefined,
            kyosir: item?.kyosir > 0 ? item.kyosir : undefined,
        };
    };

    async function purchaseItem(item: Item) {
        try {
            setItemShow({ show: false, item: undefined });
            let asceanTotal = 0;
            let costTotal = 0;
            asceanTotal = ascean().currency.silver + (ascean().currency.gold * 100);
            costTotal = item.value * 100;
            if (costTotal > asceanTotal) {
                EventBus.emit("alert", { header: "Insufficient Funds", body: `You do not have enough money. You require ${costTotal - asceanTotal} more silver to purchase the ${item.name}.` });
                return;
            };
            const cost = itemCostConverter(item.value);
            EventBus.emit("alert", { header: `Purchasing ${item.name}`, body: `You have purchased the ${item.name} for ${cost.gold}g, ${cost.silver}s.` });
            EventBus.emit("purchase-special-item", { item, cost });
        } catch (err) {
            console.warn(err, "Error Purchasing Item");
        };
    };

    // function addFunds() {
    //     const update = {
    //         ...ascean(),
    //         currency: {
    //             silver: ascean().currency.silver,
    //             gold: ascean().currency.gold + 100
    //         }
    //     };
    //     EventBus.emit("update-ascean", update);
    // };

    // usePhaserEvent("highlight-typing", (e: boolean) => {
    //     setIsTyping(e);
    // });

    function fetchOptions() {
        const currentRep = reputation().factions.find((f: FACTION) => f.name === combat().computer?.name.split("(Converted)")[0].trim()) as FACTION;
        // console.log({ currentRep, isEnemy: combat().isEnemy, isHostile: combat().isHostile });
        if (!currentRep) {
            return {};
        };
        if (combat().isHostile) {
            return {
                challenge: {},
                persuasion: {},
            };
        };
        if (currentRep.reputation < 10) {
            return {
                conditions: {},
                challenge: {}, 
                farewell: {},
                persuasion: {}, 
            };
        };
        return game().dialog;
    };
    
    const dialogOptionKeys = createMemo(() => {
        const baseOptions = Object.keys(fetchOptions());
        const enemyName = enemy().name;

        // 3. Filter the base options
        return baseOptions.filter(optionKey => {
            switch (optionKey) {
                case "institutions":
                    return Object.keys(institutions).some(instKey => {
                        const allowedEnemies = INSTITUTIONS_CHECK[instKey];
                        return allowedEnemies && allowedEnemies.includes(enemyName);
                    });

                case "entities":
                    return Array.from(FLAT_ENTITY_CHECK_MAP.values()).some(allowedEnemiesList => {
                        // We only check arrays that are truthy (not undefined/null)
                        return allowedEnemiesList && allowedEnemiesList.includes(enemyName);
                    });

                case "phenomena":
                    return Object.keys(SupernaturalPhenomenaLore).some(phenomKey => {
                        const allowedEnemies = SUPERNATURAL_PHENOMENA_CHECK[phenomKey];
                        return allowedEnemies && allowedEnemies.includes(enemyName);
                    });

                case "localLore":
                    return Object.keys(localLore).some(loreKey => {
                        const allowedEnemies = REGION_CHECK[loreKey];
                        return allowedEnemies && allowedEnemies.includes(enemyName);
                    });
                case "worldLore":
                    return Object.keys(worldLore).some(worldKey => {
                        const allowedEnemies = WORLD_EVENTS_CHECK[worldKey];
                        return allowedEnemies && allowedEnemies.includes(enemyName);
                    });
                case "whispers":
                    return Object.keys(whispers).some(whisperKey => {
                        const allowedEnemies = WHISPER_CHECK[whisperKey];
                        return allowedEnemies && allowedEnemies.includes(enemyName);
                    });
                    
                // --- Default Case ---
                default:
                    // For buttons that don't need filtering (like "challenge", "persuasion", "farewell"), just let them through.
                    return true; 
            };
        });
    });
    return (
        <Show when={combat().computer}>
        {/* <<---------- ENEMY DIALOG TABS ---------->> */}
        <Show when={combat().isEnemy}>
            <div class="story-dialog-options" style={{ height: "97.5%", left: "84%", top: "0%", "z-index": 3 }}>
                <For each={dialogOptionKeys()}>{(optionKey) => {
                        let buttonText = optionKey;
                        switch (optionKey) {
                            case "localLore":     buttonText = "Local Lore";     break;
                            case "worldLore":     buttonText = "World Lore";     break;
                            case "localWhispers": buttonText = "Local Whispers"; break;
                            default: break;
                        };
                        return (
                            <div class="dialog-topic-group"> 
                                
                                {/* 1. The Main Button */}
                                <div style={{ margin: "1%" }}>
                                    <button class="highlight dialog-buttons juiceSmall" onClick={() => handleIntent(optionKey)} 
                                        style={{ background: "#000", "font-size": "1rem", "font-weight": 900, margin: "5% auto", color: "#0f0" }}
                                    >
                                        {buttonText}
                                    </button>
                                </div>

                                {/* 2. The Sub-Menu (renders right below the button) */}
                                <Show when={game().currentIntent === optionKey}>
                                    <Switch>
                                        <Match when={optionKey === "institutions"}>
                                            <IntstitutionalButtons enemy={enemy} current={currentInstitution} options={institutions} handleConcept={handleInstitutionalConcept} handleInstitution={handleInstitution}  />
                                        </Match>
                                        <Match when={optionKey === "localLore"}>
                                            <LocalLoreButtons enemy={enemy} options={localLore} handleRegion={handleLocal}  />
                                        </Match>
                                        <Match when={optionKey === "provinces"}>
                                            <ProvincialWhispersButtons enemy={enemy} options={provincialInformation} handleRegion={handleRegion}  />
                                        </Match>
                                        <Match when={optionKey === "entities"}>
                                            <SupernaturalEntityButtons enemy={enemy} current={currentEntity} options={SupernaturalEntityLore} handleEntity={handleEntity} handleConcept={handleEntityConcept} />
                                        </Match>
                                        <Match when={optionKey === "phenomena"}>
                                            <SupernaturalPhenomenaButtons enemy={enemy} options={SupernaturalPhenomenaLore} handlePhenomena={handlePhenomena} />
                                        </Match>
                                        <Match when={optionKey === "whispers"}>
                                            <WhispersButtons enemy={enemy} current={currentWhisper} options={whispers} handleConcept={handleWhisperConcept} handleWhisper={handleWhisper} />
                                        </Match>
                                        <Match when={optionKey === "worldLore"}>
                                            <WorldLoreButtons enemy={enemy} options={worldLore} handleWorld={handleWorld} />
                                        </Match>
                                    </Switch>
                                </Show>
                            </div>
                        );
                }}</For>
            </div>
        </Show>
        {/* <<---------- DIALOG WINDOW ---------->> */} {/* "55%" : "70%" height: "97.5%", left: "0%", top: "0%", width: combat().isEnemy && combat().computer ? "83%" : "99%" */}
        <div class="center" style={{ border: "thick ridge #fdf6d8", position: "absolute", top: "0", left: "0", background: "#000", color: "gold", "font-size": "1.25rem", 
            height: "15%", width: combat().isEnemy && combat().computer ? "83%" : "99%", "align-content": "center", display: "flex", "z-index": 3 }}>
                <img src={`../assets/images/${combat()?.computer?.origin}-${combat()?.computer?.sex}.jpg`} alt={combat()?.computer?.name} 
                    style={{ height: "75%", "border-radius": "50%", border: "thick ridge #fdf6d8" }} class="origin-pic" />
                <div style={{ display: "inline", margin: "0 1%" }}>{combat()?.computer?.name}</div> 
                <div style={{ display: "inline" }}><p style={{ display: "inline" }}>[Level {combat()?.computer?.level}]</p><br /></div>
        </div>
        <div class="dialog-window" style={{ width: combat().isEnemy && combat().computer ? "83%" : "99%", "text-align": "center" }}>
            {/* <div class="dialog-tab wrap">  */}
                <Show when={combat().npcType}>
                    <button class="highlight cornerBR" onClick={clearDuel} style={{ position: "fixed", bottom: "1vh", right: "0.5vw" }}>Goodbye</button>
                </Show>
            {/* Uncommon: Achiom, Rare: Senic, Epic: Kyr, Legendary: Sedyreal */}
            { combat().npcType === "Merchant-Smith" ? ( <>
                <Typewriter stringText={`"You've come for forging? I only handle chiomic quality and above. Check my rates and hand me anything you think worth's it. Elsewise I trade with the Armorer if you want to find what I've made already.\n\n"Also, if you wish to find some companion to engage in your journey, I've a registry of those looking to venture and find treasure in this world."
                    <p class="gold">Hanging on the wall is a list of prices for the various items you can forge. The prices are based on the quality.</p>
                                    <p class="greenMarkup">[Uncommon - 1g]</p> <p class="blueMarkup">[Rare - 3g]</p> <p class="purpleMarkup">[Epic - 12g]</p> <p class="darkorangeMarkup">[Legendary - 60g]</p></br />
        <button class="highlight" data-function-name="setRegistry">Check the Registry.</button>
        <button class="highlight" data-function-name="setTools">Purchase Tools.</button>
        <button class="highlight" data-function-name="setForgeSee">See if any of your equipment can be forged greater.</button>
        <button class="highlight" data-function-name="setReforgeSee">Reforge an item you possess.</button>
        <button class="highlight" data-function-name="setReetchSee">Etch new primal influences on your weapons or jewelry.</button>
        <button class="highlight" data-function-name="getSell">Sell your equipment to the Traveling Blacksmith.</button>
                `} styling={TYPEWRITER} performAction={performAction} noScroll={true} />
                <br />
                <Show when={showTools()}>
                    <div>
                        <Currency ascean={ascean} />
                    </div>
                    <div class="playerInventoryBag center" style={{ width: "90%", "margin-bottom": "5%" }}>
                        <For each={tools()}>{(item: Item, _index: Accessor<number>) => {
                            // if (uniqueItem(item)) return;
                            const cost = itemCostConverter(item.value);
                            return (
                                <div class="center" onClick={() => setItemShow({ show: true, item })}>
                                    <img src={item.imgUrl} alt={item.name} style={{ ...getItemStyle(item.rarity), margin: "5%" }} />
                                    <div><span class="gold">{cost.gold}g</span> <span class="silver">{cost.silver}s</span></div>
                                </div>
                            )
                        }}</For>
                    </div>
                </Show>
                <Switch>
                    <Match when={forgeSee() && upgradeItems()}>
                        <div class="playerInventoryBag center" style={{ width: "90%", "margin-bottom": "5%" }}> 
                            {upgradeItems().map((item: any) => {
                                if (item === undefined) return;
                                return (
                                    <div class="center" onClick={() => itemForge(item)} style={{ ...getItemStyle(item?.rarity as string), margin: "5%",padding: "0.25em", width: "auto" }}>
                                        <img src={item?.imgUrl} alt={item?.name} /><br />
                                        Forge
                                    </div>
                                );
                            })}
                        </div> 
                    </Match>
                    <Match when={forgeSee()}>
                        <span style={{ color: "red" }}>There is nothing in your inventory that can be forged into its greater version.</span> 
                    </Match>
                </Switch>
                <Switch>
                    <Match when={forgings().show && forgings().items.length}>
                        <div>
                            <Currency ascean={ascean} />
                            <div class="playerInventoryBag center" style={{ width: "90%", "margin": "0 auto 5%", "grid-template-columns":"repeat(7, 1fr)" }}>                    
                                <For each={forgings().items.concat(game().inventory.inventory)}>{(item: Equipment) => {
                                    if (item === undefined) return;
                                    return (
                                        <div class="center" onClick={() => itemReforge(item)} style={{ ...getItemStyle(item?.rarity as string), margin: "2%", padding: "0.25em", width: "auto", color: item._id === forgings().highlight ? "gold" : "" }}>
                                            <img src={item?.imgUrl} alt={item?.name} style={{ transform: "scale(1.1)" }} />
                                            <span style={{ "font-size":"0.75em" }}>{item._id === forgings().highlight ? "Forging!" : "Reforge"}</span>
                                        </div>
                                    );
                                }}</For>
                            </div>
                        </div>
                    </Match>
                    <Match when={forgings().show && !forgings().items.length}>
                        <span style={{ color: "red" }}>There is nothing you possess that can be etched into another primal form of influence.</span> 
                    </Match>
                </Switch>
                <Switch>
                    <Match when={etchings().show && etchings().items.length > 0}>
                        <div>
                            <Currency ascean={ascean} />
                            <div class="playerInventoryBag center" style={{ width: "90%", "margin-bottom": "5%", "grid-template-columns":"repeat(7, 1fr)", "grid-template-rows": "repeat(3, 1fr)" }}> 
                            {etchings().items.map((item: any) => {
                                if (item === undefined) return;
                                return (
                                    <div class="center" onClick={() => itemReetch(item)} style={{ ...getItemStyle(item?.rarity as string), margin: "5%",padding: "0.25em",width: "auto" }}>
                                        <img src={item?.imgUrl} alt={item?.name} />
                                        Etch
                                    </div>
                                );
                            })}
                            </div>
                        </div> 
                    </Match>
                    <Match when={etchings().show}>
                        <span style={{ color: "red" }}>There is nothing you possess that can be etched into another primal form of influence.</span> 
                    </Match>
                </Switch>
                <br />
                <Show when={blacksmithSell()}>
                    <div class="playerInventoryBag center" style={{ width: "90%", "margin-bottom": "5%", "grid-template-columns":"repeat(7, 1fr)" }}>
                        <For each={game()?.inventory.inventory}>{(item) => {
                            if (item === undefined || item === undefined) return;
                            return <div class="center" onClick={() => setItem(item)} style={{ ...getItemStyle(item?.rarity as string), margin: "5.5%",padding: "0.25em",width: "auto" }}>
                                <img src={item?.imgUrl} alt={item?.name} />
                            </div>;
                        }}</For>
                    </div> 
                </Show>
                </>
            ) : combat().npcType === "Merchant-Alchemy" ? (
                <> 
                    <Show when={ascean()?.firewater?.current < 5} fallback={
                        <Typewriter styling={TYPEWRITER} stringText={`The Alchemist sways in a slight tune to the swish of your flask as he turns to you. <br /><br /> ^500 "If you're needing potions of amusement and might I'm setting up craft now. Seems you're set for now, come back when you're needing more."`} performAction={hollowClick} />
                    }>
                        <>
                            <Typewriter styling={TYPEWRITER}  stringText={`The Alchemist's eyes scatter about your presence, eyeing ${ascean().firewater?.current} swigs left of your Fyervas Firewater before tapping on on a pipe, its sound wrapping round and through the room to its end, a quaint, little spigot with a grated catch on the floor.<br /><br /> ^500 "If you're needing potions of amusement and might I'm setting up craft now. Fill up your flask meanwhile, 10s a fifth what you say? I'll need you alive for patronage."`} performAction={hollowClick} />
                            <br />
                            <button class="highlight dialog-buttons" style={{ color: "blueviolet", "font-size":"1em" }} onClick={refillFlask}>Walk over and refill your firewater?</button>
                        </>
                    </Show>
                    <Show when={party()}>
                        <>
                            <br />
                            <Typewriter styling={{ color: "gold", "font-size": "1.15rem" }} stringText={`Look upon the registry and perchance recruit someone of your preference to your party.`} performAction={hollowClick} />
                            <br />
                            <button class="highlight dialog-buttons" onClick={() => setRegistry(true)} style={{ "font-size":"1em" }}>Check the Registry</button> 
                        </>
                    </Show>
                </>
            ) : ( "" ) }
            { combat().isEnemy && combat().computer ? (
                <div style={{ "overflow-y": "auto", "scrollbar-width": "none", position: "absolute", width: "99%", left: "0.5%" }}>
                    <DialogTree game={game} combat={combat} ascean={ascean() as Ascean} enemy={combat().computer} dialogNodes={getNodesForEnemy(combat()?.computer as Ascean) as DialogNode[]} setKeywordResponses={setKeywordResponses} setPlayerResponses={setPlayerResponses} actions={actions} styling={{"white-space":"pre-wrap"}} reputation={reputation} />
                { game().currentIntent === "challenge" ? (
                    <>
                        { combat().persuasionScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter styling={TYPEWRITER} stringText={persuasionString} performAction={hollowClick} />
                                <br />
                                { combat().enemyPersuaded ? (
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You persuaded {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Continue moving along your path.</button>
                                    </>
                                ) : ( "" ) }
                            </div>
                        ) : combat().luckoutScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter styling={TYPEWRITER} stringText={luckoutString} performAction={hollowClick} />
                                <br />
                                { combat().playerLuckout ? (
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You lucked out against {namedEnemy() ? "" : ` the`} {combat().computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Continue moving along your path.</button>
                                    </>
                                ) : ( "" ) }    
                            </div>   
                        ) : combat().playerWin ? (
                            <div>
                                { namedEnemy() ? (
                                    <Typewriter styling={TYPEWRITER} stringText={`"Congratulations ${combat()?.player?.name}, you were fated this win. This is all I have to offer, if it pleases you."`} performAction={hollowClick} />
                                ) : ( 
                                    <Typewriter styling={TYPEWRITER} stringText={`"Appears I were wrong to treat with you in such a way, ${combat()?.player?.name}. By the way, did you happen to find any equipment I may have dropped in the fall? Must have left it somewhere else, I imagine."`} performAction={hollowClick} />
                                ) } 
                            </div> 
                        ) : combat().computerWin ? (
                            <div>
                                { namedEnemy() ? (
                                    <Typewriter styling={TYPEWRITER} stringText={`"${combat()?.player?.name}, surely this was a jest? Come now, you disrespect me with such play. What was it that possessed you to even attempt this failure?"`} performAction={hollowClick} />
                                ) : ( 
                                    <Typewriter styling={TYPEWRITER} stringText={`"The ${combat()?.computer?.name} are not to be trifled with."`} performAction={hollowClick} />
                                ) } 
                            </div> 
                        ) : (
                            <div>
                                <div class="cornerTL player-explode-in" classList={{ // player-explode-in
                                    }} style={{ left: "-4.5%", top: "-6%", transform: "scale(0.75)" }}>
                                        <div style={{ transform: "scale(1.15) translateY(-15px)" }}>
                                            <div class="sunburst" style={{ "--glow-color": masteryColor(ascean().mastery) }} />
                                        </div>
                                        <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
                                </div>
                                <Show when={!namedEnemy()} fallback={
                                    <>
                                        <Typewriter styling={{ "font-size": "1.15rem", margin: "0 auto", width: "50%", "text-align":"center" }} stringText={`"Greetings traveler, I am ${combat()?.computer?.name}. ${combat()?.player?.name}, is it? You seem a bit dazed, can I be of some help?"`} performAction={hollowClick} />
                                        <br />
                                        <button class="highlight" style={{ color: "red" }} onClick={() => engageCombat(combat()?.enemyID)}>Forego pleasantries and surprise attack {combat()?.computer?.name}?</button>
                                    </> 
                                
                                }>
                                    <div style={{ "font-size": "1.15rem", margin: "0 auto", width: "50%" }}>
                                        The {combat()?.computer?.name} stares at you, unflinching. Eyes lightly trace about you, reacting to your movements in wait. Grip your {combat().weapons[0]?.name} and get into position?
                                        {/* {capitalize(enemyArticle())} <Typewriter styling={{ "font-size": "1.15rem", margin: "0 auto", width: "50%", "text-align":"center" }} stringText={`The ${capitalize(enemyArticle())} ${combat()?.computer?.name} stares at you, unflinching. Eyes lightly trace about you, reacting to your movements in wait. Grip your ${combat().weapons[0]?.name} and get into position?`} performAction={hollowClick} /> */}
                                        <br /><br />
                                        <button class="highlight" style={{ color: "red", "font-size":"1.15rem", "font-weight": 900, width: "100%" }} onClick={() => engageCombat(combat()?.enemyID)}>Engage in hostilities with {combat()?.computer?.name}?</button>
                                    </div> 
                                </Show>
                                <div class="cornerTR enemy-explode-in" classList={{ // enemy-explode-in
                                    }} style={{ right: "-3.5%", top: "-6%", transform: "scale(0.75)" }}>
                                        <div style={{ transform: "scale(1.15) translateY(-15px)" }}>
                                            <div class="sunburst" style={{ "--glow-color": masteryColor(enemy().mastery) }} />
                                        </div>
                                        <AsceanImageCard ascean={enemy} show={show} setShow={setShow} setEquipment={setEquipment} />
                                </div>
                                <Show when={luckout()}> 
                                    <>
                                        <Show when={luckoutShow()} fallback={
                                            <button class="highlight" onClick={() => setLuckoutShow(!luckoutShow())} style={{ "font-size":"1.15rem", "font-weight": 900, margin: "3% auto" }}><span class="gold">[Luckout]:</span> You are capable of lucking out the enemy. Show scenarios?</button>
                                        }>
                                            <button class="highlight" onClick={() => setLuckoutShow(!luckoutShow())} style={{ "font-size":"1.15rem", "font-weight": 900, margin: "3% auto" }}><span class="gold">[Luckout]:</span> Hide Scenarios</button>
                                        </Show>
                                        <br />
                                        <Show when={luckoutShow()}>
                                            <LuckoutModal traits={luckoutTraits} callback={attemptLuckout} name={combat()?.computer?.name as string} influence={influence as Accessor<string>} show={luckoutModalShow} setShow={setLuckoutModalShow} /> 
                                        </Show>
                                    </>
                                </Show>
                            </div>
                        ) } 
                    </>
                ) : game().currentIntent === "conditions" ? (
                    <>
                    <Typewriter styling={TYPEWRITER} stringText={`"If you wish to elevate yourself in mine and my other's eyes, it would serve you well to quell nature of${checkConditions()}."`} performAction={hollowClick} />
                    <br />
                    {rep()?.reputation >= 25 && party() ? (
                        <div style={{ color: "gold", "font-size":"1.15rem" }}>
                            [Congratulations, you are capable of recruiting this enemy to your party, endearing themself to your journey and protecting you with their life. Do you wish to recruit this enemy to your party? This is {enemyArticle()} {combat().computer?.name}. They are {enemyDescriptionArticle()} {combat().computer?.description}. You are allowed to have up to 3 party members accompanying you on your journey. Choose wisely.]
                            <br />
                            <button class="highlight" onClick={changeEnemyToParty}>
                                <Typewriter styling={{ "font-size": "1.15rem" }} stringText={`Recruit ${rep().name} to join your party.`} performAction={hollowClick} />
                            </button>
                        </div>
                    ) : rep()?.reputation >= 25 && !party() ? (
                        <div style={{ color: "gold", "font-size":"1.15rem" }}>
                            [You have reached maximum party size. The {combat().computer?.name} is not capable of being recruited to your party. You must remove a current party member in order to recruit them for your journey.]
                        </div>
                    ) : ( <div style={{ color: "gold", "font-size":"1.15rem" }}>
                        [The {combat().computer?.name} is not capable of being recruited to your party. You must reach a higher level of reputation with them in order to recruit them for your journey, which include defeating members of enemy factions, and completing quests they may have available for you to take upon yourself.]
                    </div> )}
                    </>
                ) : game().currentIntent === "farewell" ? (
                    <>
                        { combat().persuasionScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter styling={TYPEWRITER} stringText={persuasionString} performAction={hollowClick} />
                                <br />
                                { combat().enemyPersuaded ? (
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You persuaded {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Continue moving along your path.</button>
                                    </>
                                ) : ( "" ) }
                            </div>
                        ) : combat().luckoutScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter styling={TYPEWRITER} stringText={luckoutString} performAction={hollowClick} />
                                <br />
                                { combat().playerLuckout ? (
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You lucked out against {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Continue moving along your path.</button>
                                    </>
                                ) : ( "" ) }    
                            </div>   
                        ) : combat().playerWin ? (
                            <>
                                { namedEnemy() ? (
                                    <Typewriter styling={TYPEWRITER} stringText={`"${combat()?.player?.name}, you are truly unique in someone's design. Before you travel further, if you wish to have it, its yours."`} performAction={hollowClick} />
                                ) : ( 
                                    <Typewriter styling={TYPEWRITER} stringText={`"Go now, ${combat()?.player?.name}, take what you will and find those better pastures."`} performAction={hollowClick} />
                                ) }
                                <br />
                                <button class="highlight" onClick={clearDuel}>Seek those pastures and leave your lesser to their pitious nature.</button>
                            </>
                        ) : combat().computerWin ? (
                            <>
                                <Typewriter styling={TYPEWRITER} stringText={`"If you weren't entertaining in defeat I'd have a mind to simply snuff you out here and now. Seek refuge, ${combat().player?.name}, your frailty wears on my caer."`} performAction={hollowClick} />
                                <button class="highlight" style={{ color: "teal", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Feign scamperping away to hide your shame and wounds. There's always another chance, perhaps.</button>
                            </>
                        ) : !combat().isHostile ? (
                            <>
                            { namedEnemy() ? ( 
                                <Typewriter styling={TYPEWRITER} stringText={`"I hope you find what you seek, ${combat()?.player?.name}. Take care in these parts, you may never know when someone wishes to approach out of malice and nothing more. Strange denizens these times."`} performAction={hollowClick} />
                            ) : ( 
                                <Typewriter styling={TYPEWRITER} stringText={`The ${combat()?.computer?.name}'s mild flicker of thought betrays their stance, lighter and relaxed.`} performAction={hollowClick} />
                            ) }
                                <br />
                                <button class="highlight" onClick={clearDuel} style={{ "font-size":"1.15rem" }} >Keep moving.</button>
                            </>
                        ) : (
                            <></>
                        ) }
                        { !checkTraits("Kyn'gian", game().traits) && !combat().playerWin && !combat().computerWin ? (
                            <button class="highlight" style={{ "font-size": "1.15rem", margin: "3% auto", width: "90%" }} onClick={clearDuel}><span class="gold">[Kyn'gian]:</span> You remain at the edges of sight and sound, and before {combat()?.computer?.name} can react, you attempt to flee.</button>
                        ) : ( "" ) }
                    </>
                ) : game().currentIntent === "institutions" ? (
                    <>
                        <Typewriter styling={TYPEWRITER} stringText={`"What institution do you wish to understand?"`} performAction={hollowClick}  />
                        <br />
                            <Typewriter styling={{...TYPEWRITER, color: "gold"}} stringText={concept} performAction={hollowClick} />
                    </>
                ) : game().currentIntent === "localLore" ? (
                    <>
                        <Typewriter styling={TYPEWRITER} stringText={`"Which province's formation do you wish to understand a little more?"`} performAction={hollowClick} />
                        <br />
                            <Typewriter styling={{...TYPEWRITER, color: "gold"}} stringText={local} performAction={hollowClick} />
                    </>
                ) : game().currentIntent === PERSUASION ? (
                    <>
                        <Show when={combat()?.computer?.name?.includes("(Converted)")}>
                            <Typewriter styling={TYPEWRITER} stringText={`"I sure do love being ${combat()?.computer?.faith} now! Thank you so much for showing me the proper path, ${ascean().name}. Don't tell anyone though, my old comrades may not take kind to me if they find out about my new faith."`} performAction={hollowClick} />
                        </Show>
                        { combat().playerWin ? (
                            <button class="highlight" style={{ color: "teal", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Continue moving along your path, perhaps words will work next time.</button>
                        ) : combat().computerWin ? (
                            <button class="highlight" style={{ color: "red", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Continue moving along your path, there's nothing left to say now.</button>
                        ) : persuasion() && !combat().persuasionScenario ? (
                                <>
                                <Show when={persuasionShow()} fallback={
                                    <button class="highlight" onClick={() => setPersuasionShow(!persuasionShow())} style={{ "font-size":"1.15rem", "font-weight": 900 }}><span class="gold">[Persuasion]:</span> You are capable of persuading the enemy. Show scenarios?</button>
                                }>
                                    <button class="highlight" onClick={() => setPersuasionShow(!persuasionShow())} style={{ "font-size":"1.15rem", "font-weight": 900 }}><span class="gold">[Persuasion]:</span> Hide Scenarios</button>
                                </Show>
                                <br />
                                <Show when={persuasionShow()}>
                                    <PersuasionModal traits={persuasionTraits} callback={attemptPersuasion} name={combat().computer?.name as string} influence={influence as Accessor<string>} show={persuasionModalShow} setShow={setPersuasionModalShow} /> 
                                </Show>
                                    {/* <PersuasionModal traits={persuasionTraits} callback={attemptPersuasion} name={combat().computer?.name as string} influence={influence as Accessor<string>} show={persuasionModalShow} setShow={setPersuasionModalShow} />  */}
                                </>
                        ) : ("") }
                        <Show when={combat().persuasionScenario}> 
                            <Typewriter styling={{...TYPEWRITER, color: "gold"}} stringText={persuasionString} performAction={hollowClick} />
                            <div style={{ color: "gold" }}>
                                <br />
                                <Show when={combat().enemyPersuaded}>
                                    <>
                                        <p style={{ color: "#fdf6d8" }}>
                                        You persuaded {namedEnemy() ? "" : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class="highlight" style={{ color: "teal", "font-size":"1.15rem", "font-weight": 900 }} onClick={clearDuel}>Continue moving along your path.</button>
                                    </>
                                </Show>
                            </div>
                        </Show>
                        <QuestModal quests={prospectiveQuests} show={showQuests} setShow={setShowQuests} enemy={combat().computer as Ascean} />
                        <Show when={fetchQuests().length > 0}>
                            <div class="creature-heading">
                                <For each={fetchQuests()}>{(quest) => {
                                    if (!quest.requirements.dialog) return;
                                    return <Switch>
                                        <Match when={(quest.title === "Adherence" || quest.title === "Providence") && (rep().reputation >= 15 || combat().playerWin) && !combat().computer?.name.includes("(Converted)") && quest.requirements.action.value !== combat().computer?.faith}>
                                            <div class="wrap" style={{ margin: "2.5% auto" }}>
                                                <button class="highlight" onClick={() => convertEnemy(quest)}>
                                                    <Typewriter styling={{ "font-size": "1.15rem" }} stringText={`${combat().computer?.name}: "${quest.requirements.dialog as string} ${combat().computer?.faith ? `Perhaps I may strike up an affection for ${combat().weapons[0]?.influences?.[0]}, as you have.` : ""}"`} performAction={hollowClick} />
                                                </button>
                                            </div>
                                        </Match> 
                                    </Switch>
                                }}</For>
                            </div>
                        </Show>
                        <Show when={solveQuests().length > 0}>
                            <div class="creature-heading">
                                <For each={solveQuests()}>{(quest) => {
                                    if (!quest.requirements.dialog) return;
                                    return <Switch>
                                        <Match when={(quest.title === "Primal Nature" || quest.title === "Seek Devotion") && quest.requirements.action.value !== ascean()?.faith}>
                                            <div class="wrap" style={{ margin: "2.5% auto" }}>
                                                <button class="highlight gold" onClick={() => convertPlayer(quest)}>
                                                    <Typewriter styling={{ "font-size": "1.15rem" }} stringText={`"${quest.requirements.dialog as string}"`} performAction={hollowClick} />
                                                </button>
                                            </div>
                                        </Match> 
                                    </Switch>
                                }}</For>
                            </div>
                        </Show>
                        <Show when={completeQuests().length > 0}>
                            <h1 class="gold">Completed Quests</h1>
                            <div class="creature-heading">
                            <For each={completeQuests()}>{(quest) => {
                                return <div class="border juice wrap creature-heading" style={{ margin: "3% auto" }}>
                                    <div class="highlight" onClick={() => {
                                        setShowCompleteQuest(quest);
                                        setShowQuestComplete(true);
                                        setShowQuestSave(false);
                                }}>{quest.title}</div>
                                </div>
                            }}</For>
                            </div>
                        </Show>
                    </>
                ) : game().currentIntent === "provinces" ? (
                    <>
                        <Typewriter styling={TYPEWRITER} stringText={`"There's concern in places all over, despite what has been said about steadying tides of war amongst the more civilized. Of where are you inquiring?"`} performAction={hollowClick} />
                        <br />
                        <Typewriter styling={{...TYPEWRITER, color: "gold"}} stringText={region} performAction={hollowClick} />

                    </>
                ) : game().currentIntent === "entities" ? (
                    <>
                        <Typewriter stringText={entityPreamble} styling={TYPEWRITER} performAction={hollowClick} />
                        <br />
                        <Typewriter stringText={entityConcept} styling={{...TYPEWRITER, color: "gold"}} performAction={hollowClick} />
                    </>
                ) : game().currentIntent === "phenomena" ? (
                    <>
                        <Typewriter styling={TYPEWRITER} stringText={`"Many notions exist of man extending themselves further than they are readily capable of physically. Of which are you curious?"`} performAction={hollowClick} />
                        <br />
                        <Typewriter stringText={phenomena} styling={{...TYPEWRITER, color: "gold"}} performAction={hollowClick} />
                    </>
                ) : game().currentIntent === "worldLore" ? (
                    <>
                        <Typewriter styling={TYPEWRITER} stringText={`"What do you wish to know about the history of this world?"`} performAction={hollowClick} />
                        <br />
                        <Typewriter stringText={world} styling={{...TYPEWRITER, color: "gold"}} performAction={hollowClick} />
                    </>
                ) : game().currentIntent === "whispers" ? (
                    <>
                        <Typewriter styling={TYPEWRITER} stringText={`"What do you wish to know of the worship and intrigue on the occult and religiosity around the realm."`} performAction={hollowClick} />
                        <br />
                        <Typewriter stringText={whisperConcept} styling={{...TYPEWRITER, color: "gold"}} performAction={hollowClick} />
                    </>
                ) : ( "" ) }
                </div>
            ) : combat().computer && combat().npcType !== "Merchant-Alchemy" && combat().npcType !== "Merchant-Smith" ? (
                <DialogTree
                    game={game} combat={combat} ascean={ascean()} enemy={combat().computer} dialogNodes={getNodesForNPC(npcIds[combat().npcType])} reputation={reputation}
                    setKeywordResponses={setKeywordResponses} setPlayerResponses={setPlayerResponses} actions={actions} styling={{"white-space":"pre-wrap", margin: "2% auto"}}
                />
            ) : ( "" ) } 
            <Show when={merchantTable()?.length > 0}>
                <button class="highlight" style={{ "color": "gold", display: "block", margin: "3% 5%" }} onClick={() => setShowBuy(true)}>See the merchant's current set of items</button>
            </Show>
            {/* </div> */}
        </div>
        {/* <<---------- MODAL WINDOWS ---------->> */}
        <Merchant ascean={ascean} />
        <Thievery ascean={ascean} game={game} setThievery={setThievery} stealing={stealing} setStealing={setStealing} />
        <Registry ascean={ascean} show={registry} setShow={setRegistry} instance={instance} />
        <Roster arena={arena} ascean={ascean} setArena={setArena} base={false} game={game} settings={settings} instance={instance} />
        <Show when={itemShow().show}>
            <div class="modal" style={{ "z-index": 99 }}>
                <SpecialItemModal item={itemShow().item} />
                <button class="highlight cornerTR animate" style={{ right: "1vw", top: "2vh", "font-size": "1rem" }} onClick={() => purchaseItem(itemShow().item)}>Purchase {itemShow().item.name}</button>
                <button class="highlight cornerBR" style={{ right: "1vw", bottom: "2vh", "font-size": "1rem", color: "red" }} onClick={() => setItemShow({ show: false, item: undefined })}>X</button>
            </div>
        </Show>
        <Show when={reforge().show}> 
            <div class="modal" style={{ "z-index": 99 }}>
                <div class="border left moisten" style={{width: "48%", height: "95%" }}>
                <div class="creature-heading center">
                <h1 style={{ "justify-content": "space-evenly", margin: "24px 0 16px" }}>{reforge().item?.name} 
                    <span style={{ transform: `scale(${1})`, float: "right", "margin-right": "5%" }}>
                        <img src={reforge().item?.imgUrl} alt={reforge().item?.name} />
                    </span>
                    </h1>
                <svg height="5" width="100%" class="tapered-rule mt-2" style={{ "margin-left":"5%" }}>
                    <polyline points={`0,0 ${window.innerWidth * 0.435},2.5 0,5`}></polyline>
                </svg>
                <div class="center">
                    <Show when={reforge().item?.type && reforge().item?.grip}>
                        <div class="my-2" style={{"font-size":"1.35em", margin:"3%"}}>
                            {reforge().item?.type} [<span style={{ "font-style": "italic", color: "gold" }}>{reforge().item?.grip}</span>] <br />
                            {reforge().item?.attackType} [<span style={{ "font-style": "italic", color: "gold" }}>{reforge().item?.damageType?.[0]}{reforge().item?.damageType?.[1] ? " / " + reforge().item?.damageType?.[1] : "" }{reforge().item?.damageType?.[2] ? " / " + reforge().item?.damageType?.[2] : "" }</span>] <br />
                        </div>
                    </Show>
                    <Show when={reforge().item?.type && !reforge().item?.grip}>
                        <div style={{"font-size":"1.35em", margin:"3%"}}>{reforge().item?.type}</div>
                    </Show>
                    <div style={{ "font-size":"1.15em" }}>
                    {attrSplitter("CON", reforge().item?.constitution as number)}
                    {attrSplitter("STR", reforge().item?.strength as number)}
                    {attrSplitter("AGI", reforge().item?.agility as number)}
                    {attrSplitter("ACH", reforge().item?.achre as number)}
                    {attrSplitter("CAER", reforge().item?.caeren as number)}
                    {attrSplitter("KYO", reforge().item?.kyosir as number)}
                    { reforge().item?.constitution as number + (reforge().item?.strength as number) + (reforge().item?.agility as number) 
                        + (reforge().item?.achre as number) + (reforge().item?.caeren as number) + (reforge().item?.kyosir as number) > 0 ? <br /> : "" }
                    Damage: <span class="gold">{reforge().item?.physicalDamage}</span> Phys | <span class="gold">{reforge().item?.magicalDamage}</span> Magi <br />
                    <Show when={reforge().item?.physicalResistance !== undefined && reforge().item?.physicalResistance as number > 0 || reforge().item?.magicalResistance !== undefined && reforge().item?.magicalResistance as number > 0}>
                        Defense: <span class="gold">{roundToTwoDecimals(reforge().item?.physicalResistance as number)}</span> Phys | <span class="gold">{roundToTwoDecimals(reforge().item?.magicalResistance as number)}</span> Magi <br />
                    </Show>
                    <Show when={reforge().item?.physicalPenetration !== undefined && reforge().item?.physicalPenetration as number > 0 || reforge().item?.magicalPenetration !== undefined && reforge().item?.magicalPenetration as number > 0}>
                        Penetration: <span class="gold">{roundToTwoDecimals(reforge().item?.physicalPenetration as number)}</span> Phys | <span class="gold">{roundToTwoDecimals(reforge().item?.magicalPenetration as number)}</span> Magi <br />
                    </Show>
                    Crit Chance: <span class="gold">{roundToTwoDecimals(reforge().item?.criticalChance as number)}%</span> <br />
                    Crit Damage: <span class="gold">{roundToTwoDecimals(reforge().item?.criticalDamage as number)}x</span> <br />
                    Roll Chance: <span class="gold">{roundToTwoDecimals(reforge().item?.roll as number)}%</span> <br />
                    <Show when={reforge().item?.influences && reforge().item?.influences?.length as number > 0}>
                        Influence: <span class="gold">{reforge().item?.influences?.[0]}</span>
                    </Show>
                    </div>
                    <div style={{ color: getRarityColor(reforge().item?.rarity as string), "font-size": "1.5em", "margin-top": "3%", "margin-bottom": "4%" }}>
                        {reforge().item?.rarity}
                    </div>
                </div>
                <button class="highlight cornerBL" style={{ "background-color": "green" }} onClick={handleReforge}>Reforge</button>
                </div>
                </div>
                <div class="border right moisten" style={{width:"48%", height:"95%","margin-left":"-1%"}}>
                    <div class="creature-heading center">
                        <p class="center wrap" style={{ "font-size": "1.25em", margin: "5%" }}>
                            Do You Wish To Reforge Your <span class="gold">{reforge().item?.name}</span> For 
                            <span style={{ color: `${reforge().cost < 1 ? "silver" : "gold"}` }}>{reforge().cost < 1 ? `${reforge().cost * 100} Silver` : `${reforge().cost} Gold`}</span>?
                            <br /><br /> [<span class="gold">Gold: Locked</span> | <span style={{ color: "red" }}>Red: Rerolled</span>]
                        </p>
                        <div>
                            <For each={Object.keys(reforgeConcerns(reforge().item as Equipment))}>{(type: string) => {
                                const concern = reforgeConcerns(reforge().item as Equipment);
                                if (concern[type as keyof typeof concern] === undefined) return;
                                return <button class="highlight" style={{ color: sans().includes(type) ? "gold" : "red", "font-weight": 600, "font-size": "1em" }} 
                                    onClick={() => {
                                        let length = sans().length;
                                        const cost = GET_REFORGE_COST[reforge().item?.rarity as string as keyof typeof GET_REFORGE_COST];
                                        setSans((prev) =>
                                            prev.includes(type) 
                                            ? prev.filter((p: string) => p !== type) 
                                            : [...prev, type]
                                        );
                                        setReforge({...reforge(), cost: roundToTwoDecimals(reforge().cost + (length > sans().length ? -cost : cost))});
                                    }}>
                                    {SANITIZE[type as keyof typeof SANITIZE]} {sans().includes(type) ? "✓" : "✗"}
                                </button>
                            }}</For>
                        <button class="highlight cornerBR" style={{ "background-color": "red" }} onClick={() => {setReforge({show:false,item:undefined,cost:0}); setSans([])}}>x</button>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
        <Show when={etchModalShow().show}> 
            <div class="modal" style={{ "z-index": 99 }}>
                <div class="border superCenter wrap" style={{ width: "50%" }}>
                <p class="center wrap" style={{ "font-size": "1.25em", margin: "3%" }}>
                    Do You Wish To Change the Nature of your <span class="gold">{etchModalShow().item?.name} [{etchModalShow().item?.influences?.[0]}]</span> into either {etchModalShow().types?.map((type:string, i: number) => `${type}${i === etchModalShow().types.length - 1 ? "" : " or "}`)} for 
                    <span style={{ color: `${GET_ETCH_COST[etchModalShow().item?.rarity as string as keyof typeof GET_ETCH_COST] < 1 ? "silver" : "gold"}` }}>{GET_ETCH_COST[etchModalShow().item?.rarity as string as keyof typeof GET_ETCH_COST] < 1 ? `${GET_ETCH_COST[etchModalShow().item?.rarity as string as keyof typeof GET_ETCH_COST] * 100} Silver` : `${GET_ETCH_COST[etchModalShow().item?.rarity as string as keyof typeof GET_ETCH_COST]} Gold`}</span>?
                </p>
                <div>
                    <For each={etchModalShow().types}>{(type: string) => {
                        return <button class="highlight" style={{ color: "gold", "font-weight": 600, "font-size": "1.5em", margin: "0 3% 5%" }} onClick={() => handleEtching(type, GET_ETCH_COST[etchModalShow().item?.rarity as string as keyof typeof GET_ETCH_COST], etchModalShow()?.item as Equipment)}>
                            {type}
                        </button>
                    }}</For>
                <button class="highlight cornerBR" style={{ "background-color": "red" }} onClick={() => setEtchModalShow({show:false,item:undefined,types:[]})}>x</button>
                </div>
                </div>
            </div>
        </Show>
        <Show when={forgeModalShow()}> 
            <div class="modal" style={{ "z-index": 99 }}>
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
        <Show when={showSell() || showBuy()}>
            <div class="modal" style={{ background: "rgba(0, 0, 0, 0.5)", "z-index": 99 }}>
                <div class="creature-heading " style={{  position: "absolute","left": "12.5%",top: "1%",height: "95%",width: "75%",background: "#000","border":"thick ridge #fdf6d8",
                    // "border":"0.1rem solid #fdf6d8", "box-shadow":"inset #000 0 0 0 0.2em, inset #fdf6d8 0 0 0 0.3em",
                }}>
                    <h1 class="center" style={{ "margin-bottom": "0%" }}>Merchant Menu</h1>
                    <div class="center" style={{ "margin-bottom": "5%" }}>
                        <Currency ascean={ascean} />
                    </div>
                    <span onClick={() => setMerchantSell(!merchantSell())} style={{ float: "left", "margin-left": "2%", "margin-top":"-4%", color:"gold" }}>{merchantSell() ? "Merchant - Focus Buy" : toggleInventorySell() ? "Merchant - Focus Sell" : "Merchant - Split View"} <span style={{color:"#fdf6d8"}}></span></span>
                    <Show when={merchantSell()} fallback={
                        <span style={{ float: "right", "margin-right": "2%", "margin-top":"-4%" }}> <span onClick={() => setToggleInventorySell(!toggleInventorySell())} style={{color:"green"}}>{toggleInventorySell() ? "Focus Sell" : "Quick Sell"}</span> | <span onClick={sellMassLoot} style={{color:"red"}}>Mass Sell <span style={{color:"red"}}>{massLootSell().length > 0 && `(${massLootSell().length})`}</span> </span> | <span class="" onClick={sellMassLoot} style={{color:"gold"}}>({totalLoot(massLootSell).gold}g {totalLoot(massLootSell).silver}s)</span></span>
                    }>
                        <span style={{ float: "right", "margin-right": "2%", "margin-top":"-4%" }}> <span style={{color:"green"}}>Quick Buy</span> | <span onClick={buyMassLoot} style={{color:"red"}}>Mass Buy <span style={{color:"red"}}>{massLootBuy().length > 0 && `(${massLootBuy().length})`}</span></span> | <span onClick={buyMassLoot} style={{color:"gold"}}>({totalBuyLoot().gold}g {totalBuyLoot().silver}s)</span></span>
                    </Show>
                <Switch>
                    <Match when={merchantSell()}>
                        <div class="border left menu-3d-container" style={{ display: "inline-block", height: "72%", left:"1.5%", width: "96.5%", "margin-bottom": "5%" }}>
                            <div class="center" style={{ margin:"1%", height: "96%", overflow: "scroll", "scrollbar-width": "none" }}>
                                <div style={{ display: "grid", "margin-bottom": "5%", width: "100%", "grid-template-columns": "repeat(6, 1fr)" }}>
                                <For each={merchantTable()}>
                                    {(item: any, _index: Accessor<number>) => {
                                        const cost = getItemCost(item);
                                        return <MerchantLoot item={item} ascean={ascean} setShow={setShowItemBuy} setHighlight={setItemBuy} thievery={thievery} steal={steal} cost={cost} checkMassBuy={checkMassBuy} getBuyMark={getBuyMark} mass={true} />;
                                    }}
                                </For>
                                </div>
                            </div>
                        </div>
                    </Match>
                    
                    <Match when={!merchantSell() && toggleInventorySell()}>
                        <div class="border left menu-3d-container" style={{ display: "inline-block", height: "72%", left:"1.5%", width: "96.5%", "margin-bottom": "5%" }}>
                            <div class="center" style={{ margin:"1%", height: "96%", overflow: "scroll", "scrollbar-width": "none" }}>
                                <div style={{ display: "grid", "margin-bottom": "5%", "grid-template-columns": "repeat(6, 1fr)" }}> 
                                    <For each={game()?.inventory.inventory}>{(item, _index) => {
                                        if (item === undefined || item === undefined) return;
                                        return <MassSell item={item} setItem={setItem} sellIitem={sellIitem} checkMassSell={checkMassSell} getCheckmark={getCheckmark} />
                                    }}</For>
                                </div>
                            </div>
                        </div>
                    </Match>
                
                    <Match when={!merchantSell()}>
                        <div class="border left menu-3d-container" style={{ display: "inline-block", height: "72%", left:"1.5%", width: "48%", "margin-bottom": "5%" }}>
                            <div class="center" style={{margin:"2%", height: "98%"}}>
                                <div style={{ display: "grid", "max-height": "97.5%", width: "100%", "grid-template-columns": "repeat(3, 1fr)", overflow: "scroll", "scrollbar-width": "none" }}>
                                <For each={merchantTable()}>
                                    {(item: any, _index: Accessor<number>) => {
                                        const cost = getItemCost(item);
                                        return <MerchantLoot item={item} ascean={ascean} setShow={setShowItemBuy} setHighlight={setItemBuy} thievery={thievery} steal={steal} cost={cost} checkMassBuy={checkMassBuy} getBuyMark={getBuyMark} mass={false} />;
                                    }}
                                </For>
                                </div>
                            </div>
                        </div>
                        <div class="border right menu-3d-container" style={{ display: "inline-block", height: "72%", left:"50%", width: "48%", "margin-bottom": "5%" }}>
                            <div style={{ margin: "2%", height:"96%", overflow: "scroll", "scrollbar-width": "none" }}>
                                <For each={game()?.inventory.inventory}>{(item, _index) => {
                                    if (item === undefined || item === undefined) return;
                                    return <QuickSell item={item} setItem={setItem} sellIitem={sellIitem} checkMassSell={checkMassSell} getCheckmark={getCheckmark} />
                                }}</For>
                            </div>
                        </div>
                    </Match>
                </Switch>
                <br /><br />
                </div>
                <Show when={combat().npcType !== "Merchant-Smith"}>
                    <button class="cornerTL highlight" style={{color:"green"}} onClick={() => refreshLoot()}>Refresh</button>
                </Show>
                <Show when={merchantSell()} fallback={
                    <button class="highlight cornerTR" classList={{ "animate": massLootSell().length > 0}} style={{ "font-weight": 700 }} onClick={sellMassLoot}>Sell {massLootSell().length > 0 ? `(${massLootSell().length})` : ""}</button>
                }>
                    <button class="highlight cornerTR" classList={{ "animate": massLootBuy().length > 0}} style={{ "font-weight": 700 }} onClick={buyMassLoot}>Buy {massLootBuy().length > 0 ? `(${massLootBuy().length})` : ""}</button>
                </Show>
                <button class="cornerBR highlight" onClick={() => {setShowBuy(false); setShowSell(false)}} style={{ color: "red" }}>X</button>
                {/* <button class="cornerBL highlight" onClick={addFunds} style={{ "background-color": "green" }}>Add</button> */}
            </div>
        </Show>
        <Show when={specialMerchant()}>
            <div class="modal" style={{ "z-index": 99 }}>
            <div class="superCenter creature-heading textGlow" style={{ position: "absolute",background: "#000",border: "thick ridge gold","border-radius": "0.25em","box-shadow": "0 0 0.5em #FFC700",height:"90%", overflow: "scroll","text-align": "center", "scrollbar-width":"none", width: "35%" }}>
                {combat().computer?.name === "Traveling Kyrisian" && ( <> 
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("cloth"); setSpecialMerchant(false);}}>Soft Cloth</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("jewelry"); setSpecialMerchant(false);}}>Jewelry</button></>)}
                {combat().computer?.name === "Traveling Sedyreal" && ( <> 
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("physical-weapon"); setSpecialMerchant(false);}}>Physical Weapons</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                </>)}
                {combat().computer?.name === "Ashreu'ul" && ( <> 
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("armor"); setSpecialMerchant(false);}}>Armor + Shields</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("cloth"); setSpecialMerchant(false);}}>Soft Cloth</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("physical-weapon"); setSpecialMerchant(false);}}>Physical Weapons</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("jewelry"); setSpecialMerchant(false);}}>Jewelry</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("", "Plate-Mail"); setSpecialMerchant(false);}}>Plate Armor</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("", "Chain-Mail"); setSpecialMerchant(false);}}>Chain Armor</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("", "Leather-Mail"); setSpecialMerchant(false);}}>Leather Mail</button>
                </>)}
                {combat().computer?.name === "Kreceus" && ( <> 
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("armor"); setSpecialMerchant(false);}}>Armor + Shields</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("cloth"); setSpecialMerchant(false);}}>Soft Cloth</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("physical-weapon"); setSpecialMerchant(false);}}>Physical Weapons</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("magical-weapon"); setSpecialMerchant(false);}}>Other Weapons</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("jewelry"); setSpecialMerchant(false);}}>Jewelry</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("", "Plate-Mail"); setSpecialMerchant(false);}}>Plate Armor</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 2.5s ease infinite")} onClick={async () => {await getLoot("", "Chain-Mail"); setSpecialMerchant(false);}}>Chain Armor</button>
                    <button class="highlight animate" style={specialMerchantStyle("gradient 5s ease infinite")} onClick={async () => {await getLoot("", "Leather-Mail"); setSpecialMerchant(false);}}>Leather Mail</button>
                </>)}
            </div>
            <button class="highlight cornerBR" style={{ "background-color": "red" }} onClick={() => setSpecialMerchant(false)}>x</button>
            </div>
        </Show>
        <Show when={showItemBuy()}>
            <div class="modal" onClick={() => setShowItemBuy(false)} style={{ background: "rgba(0, 0, 0, 0)", "z-index": 99 }}> 
                <ItemModal item={sellItem()} caerenic={false} stalwart={false} />
            </div>
        </Show>
        <Show when={showItem()}>
            <div class="modal" onClick={() => setShowItem(false)} style={{ background: "rgba(0, 0, 0, 0)", "z-index": 99 }}> 
                <ItemModal item={sellItem()} caerenic={false} stalwart={false} />
                <button class="verticalBottom highlight" onClick={() => sellInventory()} style={{ 
                    color: "green", "font-size": "1em", "font-weight": 700, padding: "0.5em", "box-shadow": "0 0 0.75em #00FF00",
                }}>
                    Sell {sellItem()?.name} for {sellRarity(sellItem()?.rarity as string)}
                </button>
            </div>
        </Show>
        <Show when={showQuestComplete()}>
            <div class="modal" style={{ "z-index": 99 }}>
                <div class="creature-heading superCenter" style={{ width: "65%", "--glow-color":"#fdf6d8", "--base-shadow":"#000 0 0 0 0.2em" }}>
                    <div class="border moisten borderTalent">
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
                        <p style={{ display: "inline-block", width: "40%", "margin": "0 auto 1.5% 7.5%" }}>
                            Level: <span class="gold">{showCompleteQuest()?.requirements.level}</span><br />
                            Reputation: <span class="gold">{showCompleteQuest()?.requirements.reputation}</span><br />
                            <span>{showCompleteQuest()?.requirements?.technical?.id === "fetch" ? <>Task: <span class="gold">{showCompleteQuest()?.requirements?.technical?.current} / {showCompleteQuest()?.requirements?.technical?.total}</span></> : showCompleteQuest()?.requirements?.technical?.solved ? <span class="gold">Solved</span> : "Unsolved"}</span><br />
                        </p>
                        <p style={{ display: "inline-block", width: "40%", "margin": "0 auto 1.5% 7.5%" }}>
                            Currency: <span class="gold">{showCompleteQuest()?.rewards?.currency?.gold}g {showCompleteQuest().rewards?.currency?.silver}s.</span><br />
                            Experience: <span class="gold">{showCompleteQuest()?.rewards?.experience}</span><br />
                            Items: <For each={showCompleteQuest()?.rewards?.items}>{(item, index) => {
                                const length = showCompleteQuest()?.rewards?.items.length;
                                return <div style={{ display: "inline-block", color: "gold" }}>
                                    {checkReward(item, "1mm")}{typeof item === "string" ? length === 0 || length - 1 === index() ? "" : `,\xa0` : ""}{" "}
                                </div>
                            }}</For>
                        </p>
                    </div>
                    {(showCompleteQuest()?.special && showQuestSave()) ? <h4 class="center" onClick={() => setShowSpecial({show:true,special:ACTION_ORIGIN[showCompleteQuest()?.special.toUpperCase()]})}>Special: <span class="animate">{showCompleteQuest()?.special}</span></h4> : ""}
                    <h2 class="wrap" style={{ "text-align":"center", color: "gold", margin: "2.5% auto" }}>
                        {replaceChar(showCompleteQuest()?.requirements.description, showCompleteQuest()?.giver)}
                    </h2>
                    </div>
                </div>
                    <Show when={!showQuestSave()}>
                        <button class="highlight cornerTR animate" style={{ right: "0", "font-size" : "1em", "font-weight": 700 }} onClick={() => completeQuest(showCompleteQuest())}>
                            <p style={font("1em")}>Complete Quest</p>
                        </button>
                    </Show>
                    <button class={`highlight cornerBR ${showQuestSave() ? "animate" : ""}`} style={{ "color": "red" }} onClick={() => {setShowQuestComplete(false); setShowCompleteQuest(undefined); setShowQuestSave(false)}}>
                        <p style={font("0.75em")}>X</p>
                    </button>
            </div>
        </Show>
        <Show when={isOverlayVisible()}>
            <div class="modal" style={{ "z-index": 99 }}> 
                <Show when={popupReward()}>
                    <div class="reward-card superCenter animate-explode-in" style={{ "--glow-color":"gold", "--base-shadow":"#000 0 0 0 0.2em", "max-width":popupReward()?.type === "Item" ? "35%" : "50%", "max-height":"85vh" }}>
                            <div class="creature-heading center" style={{ padding: "1rem" }}>
                                <h1 class="gold">{popupReward()?.type} Acquired!</h1>
                                <Show when={typeof popupReward().value === "string"} fallback={
                                    <>
                                        <h3 class="vibrant-shimmer bone" style={{ "font-size":"2rem", margin: "5% auto -15%" }}>{popupReward().value.name}</h3>
                                        <div style={{ transform: "scale(0.5)" }}>
                                            {checkReward(popupReward().value)}
                                        </div>
                                    </>
                                }>
                                    <h3 class="vibrant-shimmer bone" style={{ margin: popupReward()?.type === "Special" ? "3% auto" : "" }}>{popupReward()?.value}</h3>
                                </Show>
                                <Show when={popupReward()?.type === "Special"}>
                                    <h2 class="wrap" style={{ "font-size": "1.25rem" }}>{ACTION_ORIGIN[popupReward()?.value.toUpperCase()]?.description}</h2>
                                    <h4 class="gold">
                                        {ACTION_ORIGIN[popupReward()?.value.toUpperCase()]?.cost}. {ACTION_ORIGIN[popupReward()?.value.toUpperCase()]?.cooldown} Cooldown.
                                        <br />
                                        {ACTION_ORIGIN[popupReward()?.value.toUpperCase()]?.time} ({ACTION_ORIGIN[popupReward()?.value.toUpperCase()]?.special})
                                    </h4>
                                </Show>
                            </div>
                    </div>
                    <Show when={popupReward()?.type === "Item" || popupReward()?.type === "Special"}> 
                        <button class="highlight middleRight animate" onClick={checkQueue} style={{ "font-size": "1.25rem" }}>{popupReward().type === "Special" ? "Exit" : "Next"}</button>
                    </Show>
                </Show>
            </div>
        </Show>
        <Show when={rewardItem().show}>
            <div class="modal" onClick={() => setRewardItem({show:false, item:undefined})} style={{ "z-index": 1000 }} >
                <ItemModal item={rewardItem().item} caerenic={false} stalwart={false} />
            </div>
        </Show>
        <Show when={showSpecial().show}>
            <div class="modal" onClick={() => setShowSpecial({ show: false, special: undefined })} style={{ "z-index": 99 }}>
                <div class="reward-card superCenter animate-explode-in" style={{ "--glow-color":"gold", "--base-shadow":"#000 0 0 0 0.2em" }}>
                    <div class="creature-heading center" style={{ padding: "1rem" }}>
                        <h1>Special Acquired!</h1>
                        <h3 class="vibrant-shimmer bone" style={{ margin: "3% auto" }}>{showSpecial()?.special.name}</h3>
                        <h2 style={{ "font-size": "1.25rem" }}>{showSpecial()?.special.description}</h2>
                        <h4 class="gold">{showSpecial()?.special.cost}. {showSpecial()?.special.cooldown} Cooldown.
                            <br />
                            {showSpecial()?.special.time} ({showSpecial()?.special.special})
                        </h4>
                    </div>
                </div>
            </div>
        </Show>
        <Show when={show()}>
            <div class="modal" onClick={() => setShow(!show)} style={{ "z-index": 99 }}>
            <Suspense fallback={<Puff color="gold"/>}>
                <ItemModal item={equipment()} stalwart={false} caerenic={false} /> 
            </Suspense>
            </div> 
        </Show>
        </Show> 
    );
};