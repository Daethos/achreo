import EnemyDialogNodes from '../utility/EnemyDialogNodes.json';
import { DialogNodeOption, DialogNode } from '../utility/DialogNode';
import { Accessor, createEffect, createSignal } from 'solid-js';
import Ascean from '../models/ascean';
import { Combat } from '../stores/combat';
import { GameState } from '../stores/game';
import { EventBus } from '../game/EventBus';
import { NPC } from '../utility/npc';
import { DialogTree } from './Dialog';
import { evaluateDeity } from '../utility/deities';

const colors = {
    constitution: '#fdf6d8',
    strength: '#ff0000',
    agility: '#00ff00',
    achre: '#0000ff',
    caeren: '#080080',
    kyosir: '#ffc700'
};

const deityBorder = (mastery: string) => {
    return {
        'border': `0.15em solid ${colors[mastery as keyof typeof colors]}`,
        'border-radius': '50%',
        'box-shadow': `0 0 5em ${colors[mastery as keyof typeof colors]}`,
        'margin-bottom': '5%',
        'margin-top': '2.5%',
        'width': '40%',
        'position': 'fixed',
        'left': '50%',
        'transform': 'translateX(-50%)',
    } as any;
};

function checkRootId(node: DialogNode, id: string) {
    return node.rootId === id;
};

function getNodesForDeity(enemy: string, interactions: any): DialogNode[] {
    const nodeRange = `000${interactions}`; // interactions
    const matchingNodes: DialogNode[] = [];
    for (const node of EnemyDialogNodes.nodes) {
        if (node.options.length === 0 || !checkRootId(node, nodeRange)) {
            continue;
        };
        const npcOptions = (node.options as any).filter((option: DialogNodeOption) => (option as DialogNodeOption)?.npcIds?.includes(enemy))
        if (npcOptions.length > 0) {
            const updatedNode = { ...node, options: npcOptions };
            matchingNodes.push(updatedNode);
        };
    };
    return matchingNodes;
};

interface DeityProps {
    ascean: Accessor<Ascean>;
    combat: Accessor<Combat>;
    game: Accessor<GameState>;
};

export default function Deity({ ascean, combat, game }: DeityProps) {
    const [playerResponses, setPlayerResponses] = createSignal<string[]>([]);
    const [keywordResponses, setKeywordResponses] = createSignal<string[]>([]);
    const [dialogNodes, setDialogNodes] = createSignal<DialogNode[]>([]);
    const [showDeity, setShowDeity] = createSignal<boolean>(true);
    const [deity, setDeity] = createSignal({ name: '' });
    createEffect(() => {
        setDeity({
            name: ascean()?.statistics.relationships.deity.name === '' ? highestFaith() : ascean()?.statistics.relationships.deity.name,
        });
        getDialogNodes();
        checkOptions(game()?.currentNode as DialogNode);
    }); 

    const actions = {
        giveExp: () => giveExp(),
        resolveDeity: () => resolveDeity(),
    };

    function checkOptions(node: DialogNode) {
        if (node === undefined || node === null) return;
        if (node.options.length === 0) {
            return;
        };
        node.options.forEach((option: DialogNodeOption) => {
            if (option.next === '' || option.next === undefined || option.next === null) {
                setShowDeity(false);
                return;
            } else if (option.next !== '' && !showDeity()) {
                setShowDeity(true);
            };
        });
    };

    const getDialogNodes = async () => {
        setDialogNodes(getNodesForDeity('Deity', ascean().interactions.deity));
    };

    const giveExp = () => {
        const update = {
            ...ascean(),
            experience: Math.min(0, ascean().experience - 500),
        };
        EventBus.emit('update-ascean', update);
    };

    const resolveDeity = async () => {
        try {
            const data = {
                asceanID: ascean()._id,
                deity: deity().name,
                entry: {
                    title: 'Phenomenon',
                    body: playerResponses(),
                    footnote: '',
                    date: Date.now(),
                    keywords: keywordResponses(),
                },
            };
            const res = await evaluateDeity(data);
            EventBus.emit('fetch-ascean', res.data._id);
            EventBus.emit('show-deity', false);
            if (game().pauseState) {
                EventBus.emit('update-pause', false);
                EventBus.emit('update-small-hud');
            };
        } catch (err: any) {
            console.log(err, "Error Resolving Deity Encounter");
        };
    };

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

    return (
        <div class='modal' style={{ background: 'rgba(0, 0, 0, 1)' }} >
        <img style={deityBorder(ascean().mastery as string)} class={showDeity() === true ? 'fade-in' : 'fade-out'} src={ascean()?.faith === 'Adherent' ? '../assets/images/achreo-rising.jpg' : ascean()?.faith === 'Devoted' ? '../assets/images/daethos-forming.jpg' : '../assets/images/' + ascean().origin + '-' + ascean().sex + '.jpg'} alt={ascean().faith} id={'godBorder-'+ascean().mastery} />
        <div style={{ 
            position: 'absolute', height: '40%', width: '60%', left: '20%', background: 'rgba(0, 0, 0, 0.95)', top: '50%', 
            border: '0.1em solid gold', 'border-radius': '0.25em', 'box-shadow': '0 0 0.5em #FFC700', display: 'inline-flex', overflow: 'scroll', 'scrollbar-width': 'none' 
        }}>
            <div class='wrap' style={{ width: '100%' }}>
            <br />
            { dialogNodes().length > 0 ? (
                <DialogTree combat={combat} game={game} ascean={ascean()} enemy={deity() as Ascean | NPC} dialogNodes={dialogNodes()} actions={actions} setKeywordResponses={setKeywordResponses} setPlayerResponses={setPlayerResponses} />
            ) : ( '' ) }
            </div>
        </div>
      </div>
    );
};
