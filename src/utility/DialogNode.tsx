import { Accessor, onMount } from "solid-js";
import Ascean from "../models/ascean";
import { GameState } from "../stores/game";
import DialogNodes from "./DialogNodes.json";
import EnemyDialogNodes from './EnemyDialogNodes.json';
import { EventBus } from "../game/EventBus";
import { populateEnemy } from "../assets/db/db";
import { asceanCompiler, Compiler } from "./ascean";

export interface DialogNodeOption {
    text: string;
    next: string | null;
    npcIds?: Array<number | string>;
    conditions?: { key: string; operator: string; value: string; }[];
    action?: string | null;
    keywords?: any[];
};

export interface DialogNodeText {
    text: string;
    next: string | null;
    npcIds?: Array<number | string>;
    conditions?: { key: string; operator: string; value: string; }[];
};

export interface DialogNode {
    id: string;
    text: string | DialogNodeText[];
    options: DialogNodeOption[] | [];
    npcIds: any[];
    rootId?: string;
};

interface NpcIds {
    [key: string]: number;
};

export function getNpcId(id: string) {
    return npcIds[REVERSE_KEY[id as keyof typeof REVERSE_KEY]];
};

const REVERSE_KEY = {
    'Traveling Alchemist': 'Merchant-Alchemy',
    'Traveling Armorer': 'Merchant-Armor',
    'Traveling Blacksmith': 'Merchant-Smith',
    'Traveling Jeweler': 'Merchant-Jewelry',
    'Traveling General Merchant': 'Merchant-General',
    'Traveling Tailor': 'Merchant-Tailor',
    'Traveling Senarian': 'Merchant-Mystic',
    'Traveling Sevasi': 'Merchant-Weapon',
    'Traveling Kyrisian': 'Merchant-All-Armor',
    'Traveling Sedyreal': 'Merchant-All-Weapon',
    'Kreceus': 'Merchant-All',
    "Ashreu'ul": 'Merchant-All',
    "Tutorial Teacher": 'Merchant-Tutorial',
};

export const npcIds: NpcIds = {
    "Enemy": 0,
    "Merchant-General": 1,
    "Merchant-Weapon": 2,
    "Merchant-Armor": 3,
    "Merchant-Jewelry": 4,
    "Merchant-Alchemy": 5,
    "Merchant-Smith": 6,
    "Merchant-Mystic": 7,
    "Merchant-Tailor": 8,
    "Merchant-All-Armor": 9,
    "Merchant-All-Weapon": 10,
    "Merchant-All": 11,
    "Tutorial Teacher": 12
};

export const TUTORIAL = {
    "_id":"tutorial_1",
    "origin":"Li'ivi",
    "sex":"Man",
    "mastery":"constitution",
    "level":0.5,
    "experience":0,
    "inventory":[],
    "name":"Tut",
    "description":"Tutorial Enemy for the Game",
    "constitution":10,
    "strength":10,
    "agility":10,
    "achre":10,
    "caeren":10,
    "kyosir":10,
    "weaponOne":{
        name: 'Pernach',
        rarity: 'Common',
    },"weaponTwo":{
        name: 'Spear',
        rarity: 'Common',
    },"weaponThree":{
        name: 'Achestra',
        rarity: 'Common',
    },"shield":{
        name: 'Parma',
        rarity: 'Common',
    },"helmet":{
        name: 'Cloth Helm (Starter)',
        rarity: 'Default',
    },"chest":{
        name: 'Cloth Robes (Starter)',
        rarity: 'Default',
    },"legs":{
        name: 'Cloth Skirt (Starter)',
        rarity: 'Default',
    },"ringOne":{
        name: 'Empty Ring Slow',
        rarity: 'Default',
    },"ringTwo":{
        name: 'Empty Ring Slow',
        rarity: 'Default',
    },"amulet":{
        name: 'Empty Amulet Slow',
        rarity: 'Default',
    },"trinket":    {
        name: 'Empty Trinket Slot',
        rarity: 'Default',
    },
    "faith":"adherent",
    "currency":{"silver":0,"gold":0},
    "firewater":{"current":5,"max":5},
    "health":{"current":10,"max":10}
};
const KRECEUS = {
    "_id":"kreceus_16",
    "origin":"Ashtre",
    "sex":"Man",
    "mastery":"achre",
    "level":16,
    "experience":0,
    "inventory":[],
    "name":"Kreceus",
    "description":"Apostle of Astra",
    "constitution":40,
    "strength":22,
    "agility":37,
    "achre":64,
    "caeren":22,
    "kyosir":39,
    "weaponOne":{
        name: 'Astral Spear',
        rarity: 'Epic',
    },"weaponTwo":{
        name: 'Astral Spear',
        rarity: 'Epic',
    },"weaponThree":{
        name: 'Achestra',
        rarity: 'Epic',
    },"shield":{
        name: 'Parma',
        rarity: 'Epic',
    },"helmet":{
        name: 'Astral Hood',
        rarity: 'Epic',
    },"chest":{
        name: 'Astral Robes',
        rarity: 'Epic',
    },"legs":{
        name: 'Astral Pants',
        rarity: 'Epic',
    },"ringOne":{
        name: 'Astral Ring',
        rarity: 'Epic',
    },"ringTwo":{
        name: 'Astral Ring',
        rarity: 'Epic',
    },"amulet":{
        name: 'Astral Amulet',
        rarity: 'Epic',
    },"trinket":    {
        name: 'Astral Trinket',
        rarity: 'Epic',
    },
    "faith":"adherent",
    "currency":{"silver":0,"gold":0},
    "firewater":{"current":5,"max":5},
    "health":{"current":1000,"max":1000}
};
const ASHREUUL = {
    "_id":"ashreuul_16",
    "origin":"Ashtre",
    "sex":"Man",
    "mastery":"strength",
    "level":16,
    "experience":0,
    "inventory":[],
    "name":"Ashreu'ul",
    "description":"Anashtre Incarnate",
    "constitution":44,
    "strength":68,
    "agility":34,
    "achre":22,
    "caeren":34,
    "kyosir":22,
    "weaponOne":{
        name: 'War Hammer',
        rarity: 'Epic',
    },"weaponTwo":{
        name: 'Claymore',
        rarity: 'Epic',
    },"weaponThree":{
        name: 'Battle Axe',
        rarity: 'Epic',
    },"shield":{
        name: 'Shaorahi',
        rarity: 'Epic',
    },"helmet":{
        name: 'Ashtre Helm',
        rarity: 'Epic',
    },"chest":{
        name: 'Ashtre Armor',
        rarity: 'Epic',
    },"legs":{
        name: 'Ashtre Greaves',
        rarity: 'Epic',
    },"ringOne":{
        name: 'Ashtre Ring',
        rarity: 'Epic',
    },"ringTwo":{
        name: 'Ashtre Ring',
        rarity: 'Epic',
    },"amulet":{
        name: 'Ashtre Amulet',
        rarity: 'Epic',
    },"trinket":    {
        name: 'Ashtre Trinket',
        rarity: 'Epic',
    },
    "faith":"adherent",
    "currency":{"silver":0,"gold":0},
    "firewater":{"current":5,"max":5},
    "health":{"current":1000,"max":1000}
};

export function fetchTutorialEnemy() {
    try {
        let enemy: any = populateEnemy(TUTORIAL as any);
        const res = asceanCompiler(enemy);
        EventBus.emit('tutorial-enemy-fetched', res);
    } catch (err) {
        console.warn(err, 'Error Fetching Tutorial Enemy');
    };
};

export function fetchDm(_data: { enemy: string; npcType: string; }) {
    try {
        let dm: any = Math.random() > 0.5 ? KRECEUS : ASHREUUL;
        dm = populateEnemy(dm);
        const res: Compiler = asceanCompiler(dm) as Compiler;
        EventBus.emit('dm-fetched', res); 
    } catch (err: any) {
        console.log("Error Getting an NPC");
    };
};

export function getNodesForEnemy(enemy: Ascean): DialogNode[] {
    const matchingNodes: DialogNode[] = [];
    for (const node of EnemyDialogNodes.nodes) {
        if (node.options.length === 0) {
            continue;
        };
        const npcOptions = (node.options as any).filter((option: DialogNodeOption) => (option as DialogNodeOption)?.npcIds?.includes(enemy.name))
        if (npcOptions.length > 0) {
            const updatedNode = { ...node, options: npcOptions };
            matchingNodes.push(updatedNode);
        };
    };
    return matchingNodes;
};

export function getNodesForNPC(npcId: number): DialogNode[] {
    const matchingNodes: DialogNode[] = [];
    for (const node of DialogNodes.nodes) {
        if (node.options.length === 0) {
            continue;
        };
        const npcOptions = node.options.filter((option) => (option as DialogNodeOption)?.npcIds?.includes(npcId));
        if (npcOptions.length > 0) {
            const updatedNode = { ...node, options: npcOptions };
            matchingNodes.push(updatedNode);
        };
    };
    return matchingNodes;
};

export interface DialogOptionProps {
    option: DialogNodeOption;
    onClick: (nextNodeId: string | null) => void;
    actions: { [key: string]: Function }
};

export const DialogOption = ({ option, onClick, actions }: DialogOptionProps) => {
    const handleClick = async () => {
        if (option.action && typeof option.action === 'string') {
            const actionName = option.action.trim();
            // console.log(actionName, "Did we make it here?")
            const actionFunction = actions[actionName];
            if (actionFunction) {
                actionFunction();
                return;
            };
        };
        onClick(option.next);
    };

    return (
      <div>
      <button onClick={handleClick} class='dialog-buttons inner' >
        {option.text}
      </button>
      </div>
    );
};

interface DialogTreeProps {
  ascean: Ascean;
  dialogNodes: DialogNode[];
  engageCombat: () => Promise<void>;
  getLoot: (type: string) => void;
  refillFlask: () => void;
  state: any;
  game: Accessor<GameState>;
};

const DialogTree = ({ ascean, engageCombat, getLoot, dialogNodes, game, state, refillFlask }: DialogTreeProps) => {
    const actions = {
        getCombat: () => engageCombat(),
        getArmor: () => getLoot('armor'),
        getGeneral: () => getLoot('general'),
        getJewelry: () => getLoot('jewelry'),
        getMystic: () => getLoot('magical-weapon'),
        getTailor: () => getLoot('cloth'),
        getWeapon: () => getLoot('physical-weapon'),
        getFlask: () => refillFlask()
    };

    onMount(() => {
        if (game()?.currentNode) {
            let newText = game()?.currentNode?.text;
            let newOptions: DialogNodeOption[] = [];
            // console.log(typeof game().currentNode?.text, 'Type of text?')
            if (typeof game().currentNode?.text === 'string') {
                newText = (game().currentNode?.text as string)?.replace(/\${(.*?)}/g, (_: any, g: string) => eval(g));
            } else if (Array.isArray(game().currentNode?.text)) {
                // newText = (game()?.currentNode?.text?.text as string)?.replace(/\${(.*?)}/g, (_: any, g: string) => eval(g));
                // const id = getNpcId(ascean.name);
                // const npcOptions = (game().currentNode?.text as DialogNodeText[]).filter((option: any) => {
                //     const id = getNpcId(enemy.name);
                //     const included = (option as DialogNodeOption)?.npcIds?.includes(id);
                //     console.log(enemy.name, id, option, included, 'enemy name, id, option,  included');
                //     return included;
                // });


                if (game().currentNode?.text) {
                    newOptions = (game()?.currentNode?.text as DialogNodeText[]).filter((node: any) => {
                        if (node.conditions) {
                            return node.conditions.every((condition: any) => {
                                const { key, operator, value } = condition;
                                const optionValue = ascean[key] !== undefined ? ascean[key] : state[key]; // Hopefully this works!
                                switch (operator) {
                                case '>':
                                    return Number(optionValue) > Number(value);
                                case '>=':
                                    return Number(optionValue) >= Number(value);
                                case '<':
                                    return Number(optionValue) < Number(value);
                                case '<=':
                                    return Number(optionValue) <= Number(value);
                                case '=':
                                    return Number(optionValue) === Number(value);
                                default:
                                    return false;
                                }
                            });
                        } else {
                            return true;
                        };
                    }).map((node: { text: string; }) => {
                        const renderedOption = node.text.replace(/\${(.*?)}/g, (_, g) => eval(g));
                        return {
                            ...node,
                            text: renderedOption,
                        };
                    }) as DialogNodeOption[];
                };
            };
            if (game()?.currentNode?.options) {
                newOptions = game()?.currentNode?.options.filter((option: any) => {
                    if (option.conditions) {
                        return option.conditions.every((condition: any) => {
                            const { key, operator, value } = condition;
                            const optionValue = ascean[key] !== undefined ? ascean[key] : state[key]; // Hopefully this works!
                            switch (operator) {
                            case '>':
                                return Number(optionValue) > Number(value);
                            case '>=':
                                return Number(optionValue) >= Number(value);
                            case '<':
                                return Number(optionValue) < Number(value);
                            case '<=':
                                return Number(optionValue) <= Number(value);
                            case '=':
                                return Number(optionValue) === Number(value);
                            default:
                                return false;
                            }
                        });
                    } else {
                        return true;
                    };
                }).map((option: { text: string; }) => {
                    const renderedOption = option.text.replace(/\${(.*?)}/g, (_, g) => eval(g));
                    return {
                        ...option,
                        text: renderedOption,
                    };
                }) as DialogNodeOption[];
            };
            EventBus.emit('blend-game', { renderedText: newText, renderedOptions: newOptions });
        };
    });

    const handleOptionClick = (nextNodeId: string | null) => {
        if (nextNodeId === null) {
            EventBus.emit('blend-game', { setCurrentNodeIndex: 0 });
        } else {
            let nextNodeIndex = dialogNodes.findIndex((node) => node.id === nextNodeId);
            if (nextNodeIndex === -1) nextNodeIndex = 0;
            EventBus.emit('blend-game', { setCurrentNodeIndex: nextNodeIndex });
        };
    };

    if (!game()?.currentNode) {
        return null;
    };

    return (
        <div>
            <p>{game()?.renderedText}</p>
            {game()?.renderedOptions?.map((option: DialogNodeOption) => (
                <DialogOption option={option} onClick={handleOptionClick} actions={actions} />
            ))}
            <br />
        </div>
    );
};

export default DialogTree;