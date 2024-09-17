import { Accessor, onMount } from "solid-js";
import Ascean from "../models/ascean";
import { GameState } from "../stores/game";
import DialogNodes from "./DialogNodes.json";
import EnemyDialogNodes from './EnemyDialogNodes.json';
import { EventBus } from "../game/EventBus";

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
            console.log(actionName, "Did we make it here?")
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
            console.log(typeof game().currentNode?.text, 'Type of text?')
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
                                    return optionValue > value;
                                case '>=':
                                    return optionValue >= value;
                                case '<':
                                    return optionValue < value;
                                case '<=':
                                    return optionValue <= value;
                                case '=':
                                    return optionValue === value;
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
                                return optionValue > value;
                            case '>=':
                                return optionValue >= value;
                            case '<':
                                return optionValue < value;
                            case '<=':
                                return optionValue <= value;
                            case '=':
                                return optionValue === value;
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