import { createSignal, createEffect, Setter, Accessor, Show, onMount, For, JSX } from 'solid-js'
import { EventBus } from '../game/EventBus';
import { Combat } from '../stores/combat';
import Ascean from '../models/ascean';
import { GameState } from '../stores/game';
import { ProvincialWhispersButtons, Region, regionInformation } from '../utility/regions';
import { LuckoutModal, PersuasionModal, checkTraits } from '../utility/traits';
import { DialogNode, DialogNodeOption, getNodesForEnemy, getNodesForNPC, npcIds } from '../utility/DialogNode';
import Typewriter from '../utility/Typewriter';
import Currency from '../utility/Currency';
import MerchantTable from './MerchantTable';
import Equipment, { getArmorEquipment, getClothEquipment, getJewelryEquipment, getMagicalWeaponEquipment, getMerchantEquipment, getPhysicalWeaponEquipment } from '../models/equipment';
import { LevelSheet } from '../utility/ascean';
import { useResizeListener } from '../utility/dimensions';
import { getRarityColor, sellRarity } from '../utility/styling';
import ItemModal from '../components/ItemModal';

const named = [
    "Achreus", "Ashreu'ul", "Caelan Greyne", "Chios Dachreon", "Cyrian Shyne", "Daetheus", 
    "Dorien Caderyn", "Eugenes", "Evrio Lorian Peroumes", "Fierous Ashfyre", "Garris Ashenus", 
    "King Mathyus Caderyn", "Kreceus", "Laetrois Ath'Shaorah", "Leaf", "Lorian", "Mavros Ilios", 
    "Mirio", "Quor'estes", "Relien Myelle", "Sedeysus", "Sera Lorian", "Synaethi Spiras", "Torreous Ashfyre", 
    "Tshios Ash'air", "Vincere"
];

const nameCheck = (name: string) => {
    if (named.includes(name)) {
        return true;
    } else {
        return false;
    };
};

interface DialogOptionProps {
    option: DialogNodeOption;
    onClick: (nextNodeId: string | null) => void;
    actions: { [key: string]: Function };
    setPlayerResponses: Setter<string[]>;
    setKeywordResponses: Setter<string[]>;
    setShowDialogOptions: Setter<boolean>;
    showDialogOptions: Accessor<boolean>;
};

const DialogOption = ({ option, onClick, actions, setPlayerResponses, setKeywordResponses, setShowDialogOptions, showDialogOptions }: DialogOptionProps) => {
    const hollowClick = () => console.log("Hollow Click");
    const handleClick = async (): Promise<void> => {
        setPlayerResponses((prev) => [...prev, option.text]);
        if (option?.keywords && option.keywords.length > 0) {
            setKeywordResponses((prev) => [...prev, ...option.keywords || []]);
        };
          
        if (option.action && typeof option.action === 'string') {
            const actionName = option.action.trim();
            const actionFunction = actions[actionName];
            if (actionFunction) {
                actionFunction();
                // return;
            };
        };
        onClick(option.next);
        setShowDialogOptions(false);
    };

    return (
      <div>
        { showDialogOptions() && (
            <button class='highlight dialog-buttons' onClick={handleClick} data-function-name='handleClick'>
                <Typewriter stringText={option.text} styling={{ 'overflow-y': 'auto' }} performAction={hollowClick} />
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
};

export const DialogTree = ({ ascean, enemy, dialogNodes, game, combat, actions, setPlayerResponses, setKeywordResponses }: DialogTreeProps) => {
    const [showDialogOptions, setShowDialogOptions] = createSignal<boolean>(false);
    const [renderedText, setRenderedText] = createSignal<string>('');
    const [renderedOptions, setRenderedOptions] = createSignal<any>(undefined);

    const processText = (text: string, context: any): string => {
        if (!text) return '';
        return text.replace(/\${(.*?)}/g, (_, g) => {
            const value = g.split('.').reduce((obj: { [x: string]: any; }, key: string | number) => obj && obj[key], context);
            return value;
        });
    };
    
    const processOptions = (options: DialogNodeOption[], context: any): DialogNodeOption[] => {
        return options
            .filter(option => !option.conditions || option.conditions.every(condition => {
                const { key, operator, value } = condition;
                const optionValue = getOptionKey(ascean, combat, key);
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
                };
            }))
            .map(option => ({
                ...option,
                text: processText(option.text, context),
            }));
    };
    
    onMount(() => searchCurrentNode(game()?.currentNodeIndex));

    function searchCurrentNode(index: number) {
        let newText: string = '';
        let newOptions: DialogNodeOption[] = [];
        let currentNode = dialogNodes?.[index];
        if (currentNode === undefined) return;

        const { text, options } = currentNode as DialogNode;
        newText = processText(text, { ascean, enemy, combat });
        newOptions = processOptions(options, { ascean, enemy, combat });
        EventBus.emit('blend-game', { 
            currentNode: currentNode,
            currentNodeIndex: index || 0,
            renderedOptions: newOptions, 
            renderedText: newText
        });
        setRenderedOptions(newOptions);
        setRenderedText(newText);
        
        const dialogTimeout = setTimeout(() => {
            setShowDialogOptions(true);
        }, currentNode?.text.split('').reduce((a: number, s: string | any[]) => a + s.length * 35, 0));
        
        return(() => {
            clearTimeout(dialogTimeout);
        }); 
    };


    const getOptionKey = (ascean: Ascean, combat: any, key: string) => {
        const newKey = key === 'mastery' ? ascean[key].toLowerCase() : key;
        return ascean[newKey] !== undefined ? ascean[newKey] : combat[newKey];
    };
  
    const handleOptionClick = (nextNodeId: string | null) => {
        if (nextNodeId === null) {
            EventBus.emit('blend-game', { currentNodeIndex: 0 });
        } else {
            let nextNodeIndex = dialogNodes.findIndex((node: any) => node.id === nextNodeId);
            if (nextNodeIndex === -1) nextNodeIndex = 0;
            searchCurrentNode(nextNodeIndex);
        };
    };
  
    return (
        <div class='wrap'> 
            <Typewriter stringText={renderedText} styling={{ 'overflow-y': 'auto' }} performAction={handleOptionClick} />
            <br />
            {renderedOptions()?.map((option: DialogNodeOption) => (
                <DialogOption option={option} onClick={handleOptionClick} actions={actions} setPlayerResponses={setPlayerResponses} setKeywordResponses={setKeywordResponses} setShowDialogOptions={setShowDialogOptions} showDialogOptions={showDialogOptions} />
            ))}
            <br />
        </div>
    );
};

const DialogButtons = ({ options, setIntent }: { options: any, setIntent: any }) => {
    const filteredOptions = Object.keys(options);
    const buttons = filteredOptions.map((o: any) => {
        switch (o) {
            case 'localLore':
                o = 'Local Lore';
                break;
            case 'provincialWhispers':
                o = 'Provincial Whispers';
                break;
            case 'worldLore':
                o = 'World Lore';
                break;
            case 'localWhispers':
                o = 'Local Whispers';
                break;
            default:
                break;
        };
        return (
            <div style={{ margin: '5%' }}>
                <button class='dialog-buttons' onClick={() => setIntent(o)} style={{ background: '#000', 'font-size': '0.5em' }}>{o}</button>
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
};

export default function Dialog({ ascean, asceanState, combat, game }: StoryDialogProps) {
    const [influence, setInfluence] = createSignal(combat()?.weapons[0]?.influences?.[0]);
    const [persuasionString, setPersuasionString] = createSignal<string>('');
    const [luckoutString, setLuckoutString] = createSignal<string>('');
    const [upgradeItems, setUpgradeItems] = createSignal<any | null>(null);
    const [namedEnemy, setNamedEnemy] = createSignal<boolean>(false);
    const [playerResponses, setPlayerResponses] = createSignal<string[]>([]);
    const [keywordResponses, setKeywordResponses] = createSignal<string[]>([]);
    const [luckoutModalShow, setLuckoutModalShow] = createSignal<boolean>(false);
    const [persuasionModalShow, setPersuasionModalShow] = createSignal<boolean>(false);
    const [luckout, setLuckout] = createSignal<boolean>(false);
    const [luckoutTraits, setLuckoutTraits] = createSignal<any>([]);
    const [persuasion, setPersuasion] = createSignal<boolean>(false);
    const [persuasionTraits, setPersuasionTraits] = createSignal<any>([]);
    const [miniGame, setMiniGame] = createSignal<boolean>(false);
    const [miniGameTraits, setMiniGameTraits] = createSignal<any>([]);
    const [enemyArticle, setEnemyArticle] = createSignal<any>('');
    const [merchantTable, setMerchantTable] = createSignal<any>({});
    const [region, setRegion] = createSignal<any>(regionInformation['Astralands']);
    const [showSell, setShowSell] = createSignal<boolean>(false);
    const [sellItem, setSellItem] = createSignal<Equipment | undefined>(undefined);
    const [showItem, setShowItem] = createSignal<boolean>(false);
    const dimensions = useResizeListener();
    const capitalize = (word: string): string => word === 'a' ? word?.charAt(0).toUpperCase() : word?.charAt(0).toUpperCase() + word?.slice(1);
    const getItemStyle = (rarity: string): JSX.CSSProperties => {
        return {
            border: `0.15em solid ${getRarityColor(rarity)}`,
            'background-color': 'black',
        };
    };

    createEffect(() => { 
        checkEnemy(combat()?.computer as Ascean);
        checkLuckout(game());
        checkPersuasion(game());
        checkInfluence(ascean);
    });

    createEffect(() => {
        setMerchantTable(game().merchantEquipment);
    });
    
    onMount(() => {
        if (game()?.inventory?.length > 2) {
            const matchedItem = canUpgrade(game()?.inventory);
            if (matchedItem) {
                setUpgradeItems(matchedItem);
            } else {
                setUpgradeItems(null);
            };
        };
    });

    const actions = {
        getCombat: () => engageCombat(combat()?.enemyID),
        getArmor: async () => await getLoot('armor'),
        getGeneral: async () => await getLoot('general'),
        getJewelry: async () => await getLoot('jewelry'),
        getMystic: async () => await getLoot('magical-weapon'),
        getTailor: async () => await getLoot('cloth'),
        getWeapon: async () => await getLoot('physical-weapon'),
        getFlask: () => refillFlask()
    };

    const engageGrappling = (): void => {
        checkingLoot();
    }; 

    const checkEnemy = (enemy: Ascean) => {
        if (enemy) {
            setNamedEnemy(nameCheck(enemy.name));
            setEnemyArticle(() => {
                return ['a', 'e', 'i', 'o', 'u'].includes(enemy.name.charAt(0).toLowerCase()) ? 'an' : 'a';
            });
        };
    };

    const checkInfluence = (a: Accessor<Ascean>) => {
        setInfluence(a()?.weaponOne?.influences?.[0]);
    };
    
    const hollowClick = () => console.log('Hollow Click');

    const attemptPersuasion = async (persuasion: string): Promise<void> => {
        let playerPersuasion: number = 0;
        let enemyPersuasion: number = 0;
        switch (persuasion) {
            case 'Arbituous': // Ethos
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.achre as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.achre as number);
                break;
            case 'Chiomic': // Humor
                playerPersuasion = combat()?.player?.achre as number + (combat()?.player?.kyosir as number);
                enemyPersuasion = combat()?.computer?.achre as number + (combat()?.computer?.kyosir as number);
                break;
            case 'Kyr\'naic': // Apathy
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.kyosir as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.kyosir as number);
                break;
            case 'Lilosian': // Peace
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.caeren as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.caeren as number);
                break;
            case 'Ilian': // Heroism
                playerPersuasion = combat()?.player?.constitution as number + (combat()?.player?.strength as number);
                enemyPersuasion = combat()?.computer?.constitution as number + (combat()?.computer?.strength as number);
                break;
            case 'Fyeran': // Seer
                playerPersuasion = combat()?.player?.achre as number + (combat()?.player?.caeren as number);
                enemyPersuasion = combat()?.computer?.achre as number + (combat()?.computer?.caeren as number);
                break;
            case 'Shaorahi': // Awe
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
            EventBus.emit('persuasion', { persuasion, persuaded: true });
            const num = Math.floor(Math.random() * 2); 
            setPersuasionString(`${persuasionTrait?.persuasion.success[num].replace('{enemy.name}', combat()?.computer?.name).replace('{ascean.weaponOne.influences[0]}', influence()).replace('{ascean.name}', combat()?.player?.name).replace('{enemy.weaponOne.influences[0]}', combat()?.computer?.weaponOne?.influences?.[0]).replace('{enemy.faith}', combat()?.computer?.faith)}`);
        } else {
            checkingLoot();
            EventBus.emit('persuasion', { persuasion, persuaded: false });
            setPersuasionString(`Failure. ${persuasionTrait?.persuasion?.failure.replace('{enemy.name}', combat()?.computer?.name).replace('{ascean.weaponOne.influences[0]}', influence()).replace('{ascean.name}', combat()?.player?.name).replace('{enemy.weaponOne.influences[0]}', combat()?.computer?.weaponOne?.influences?.[0]).replace('{enemy.faith}', combat()?.computer?.faith)} \n\n Nevertheless, prepare for some chincanery, ${combat().player?.name}, and perhaps leave the pleasantries for warmer company.`);
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
            case 'Arbituous': // Rhetoric
                playerLuck = ascean().constitution + ascean().achre;
                enemyLuck = enemy.constitution + enemy.achre;
                break;
            case 'Chiomic': // Shatter
                playerLuck = ascean().achre + ascean().kyosir;
                enemyLuck = enemy.achre + enemy.kyosir;
                break;
            case 'Kyr\'naic': // Apathy
                playerLuck = ascean().constitution + ascean().kyosir;
                enemyLuck = enemy.constitution + enemy.kyosir;
                break;
            case 'Lilosian': // Peace
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
            // playReligion();
            // dispatch(getLuckoutFetch({ luck, id: combat().player._id, luckedOut: true }));
            let experience = 
                ascean().experience +
                Math.round((combat().computer?.level as number) * 
                100 * 
                (combat().computer?.level as number / combat()?.player?.level!) + 
                (combat()?.playerAttributes?.rawKyosir as number));
            const newState: LevelSheet = { 
                ...asceanState(), 
                avarice: combat().prayerData.length > 0 ? combat().prayerData.includes('Avarice') : false, 
                currency: ascean().currency,
                firewater: ascean().firewater,
                currentHealth: combat().newPlayerHealth,
                opponent: combat().computer?.level as number,
                opponentExp: Math.min(experience, combat()?.player?.level! * 1000),
            };
            const loot = { enemyID: combat().enemyID, level: combat().computer?.level as number };
            EventBus.emit('gain-experience', newState);
            EventBus.emit('enemy-loot', loot);
            EventBus.emit('luckout', { luck, luckout: true });
            const num = Math.floor(Math.random() * 2);
            setLuckoutString(`${luckoutTrait?.luckout?.success[num].replace('{enemy.name}', enemy.name).replace('{ascean.weaponOne.influences[0]}', influence()).replace('{ascean.name}', ascean().name).replace('{enemy.weaponOne.influences[0]}', enemy.weaponOne.influences?.[0]).replace('{enemy.faith}', enemy.faith).replace('{article}', enemyArticle)}`);
            // shakeScreen({ duration: 1000, intensity: 1.5 });
            // if ('vibrate' in navigator) navigator.vibrate(1000);
        } else {
            // getLuckoutFetch({ luck, id: combat().player._id, luckout: false });
            EventBus.emit('luckout', { luck, luckout: false });
            checkingLoot();
            setLuckoutString(`${luckoutTrait?.luckout?.failure.replace('{enemy.name}', enemy.name).replace('{ascean.weaponOne.influences[0]}', influence()).replace('{ascean.name}', ascean().name).replace('{enemy.weaponOne.influences[0]}', enemy.weaponOne.influences?.[0]).replace('{enemy.faith}', enemy.faith).replace('{article}', enemyArticle)} \n\n Prepare for combat, ${ascean().name}, and may your weapon strike surer than your words.`);
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
        const lTraits = ['Lilosian', 'Arbituous', "Kyr'naic", 'Chiomic'];
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
            setLuckoutString(`${luckoutTrait?.luckout.success[num].replace('{enemy.name}', combat()?.computer?.name).replace('{ascean.weaponOne.influences[0]}', influence()).replace('{ascean.name}', ascean().name).replace('{enemy.weaponOne.influences[0]}', combat()?.computer?.weaponOne?.influences?.[0]).replace('{enemy.faith}', combat()?.computer?.faith)}`);
        };
    };

    const checkPersuasion = (g: GameState): void => {
        const traits = {
            primary: g?.traits?.primary,
            secondary: g?.traits?.secondary,
            tertiary: g?.traits?.tertiary,
        };
        const pTraits = ['Ilian', 'Lilosian', 'Arbituous', "Kyr'naic", 'Chiomic', 'Fyeran', 'Shaorahi', 'Tashaeral'];
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
            setPersuasionString(`${persuasionTrait?.persuasion.success[num].replace('{enemy.name}', combat()?.computer?.name).replace('{ascean.weaponOne.influences[0]}', influence()).replace('{ascean.name}', combat()?.player?.name).replace('{enemy.weaponOne.influences[0]}', combat()?.computer?.weaponOne?.influences?.[0]).replace('{enemy.faith}', combat()?.computer?.faith)}`);
        };
    };

    const checkMiniGame = () => {
        const traits = {
            primary: game()?.primary,
            secondary: game()?.secondary,
            tertiary: game()?.tertiary,
        };
        const miniGameTraits = ['Cambiren', "Se'van", 'Shrygeian', 'Tashaeral'];
        const matchingTraits = Object.values(traits).filter(trait => miniGameTraits.includes(trait?.name));
        if (matchingTraits.length === 0) {
            setMiniGame(false);
            return;
        };
        setMiniGame(true);
        setMiniGameTraits(matchingTraits);
    };

    const canUpgrade = (inventory: any[]): any[] | null => {
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
        return matches.length > 0 ? matches : null;
    };

    const checkingLoot = (): void => {
        if (game().merchantEquipment.length > 0) {
            // await deleteEquipment(game().merchantEquipment);
            EventBus.emit('delete-equipment', { equipment: game().merchantEquipment });
            // setMerchantEquipment([]);
            EventBus.emit('blend-game', { merchantEquipment: [] });
        };
    };

    const handleIntent = (intent: string): void => {
        let clean: string = '';
        switch (intent) {
            case 'Local Lore':
                clean = 'localLore';
                break;
            case 'Provincial Whispers':
                clean = 'provincialWhispers';
                break;
            case 'World Lore':
                clean = 'worldLore';
                break;
            case 'Local Whispers':
                clean = 'localWhispers';
                break;
            default:
                clean = intent;
                break;
        };
        // setCurrentIntent(clean);
        EventBus.emit('blend-game', { currentIntent: clean });
    };
    const handleRegion = (region: keyof Region) => {
        setRegion(regionInformation[region]);
    };
    
    const engageCombat = (id: string): void => {
        checkingLoot();
        EventBus.emit('aggressive-enemy', { id, isAggressive: true });
        EventBus.emit('blend-game', { showDialog: false });
        EventBus.emit('update-pause', false);
        EventBus.emit('action-button-sound');
        EventBus.emit('engage');
    };

    const clearDuel = () => {
        // EventBus.emit('blend-game', { showDialog: false })
        EventBus.emit('show-dialogue');
        EventBus.emit('action-button-sound');
        EventBus.emit('update-pause', false);
    };

    const refillFlask = () => {
        console.log('refilling flask!')
        // restore firewater flask
        // deduct currency
        // save ascean
    };

    const getLoot = async (type: string): Promise<void> => {
        if (game()?.merchantEquipment.length > 0) {
            EventBus.emit('delete-merchant-equipment', { equipment: game()?.merchantEquipment });
        };
        try {
            // console.log(type, 'Type!');
            let merchantEquipment: any;
            if (type === 'physical-weapon') {
                merchantEquipment = await getPhysicalWeaponEquipment(combat()?.player?.level as number);
            } else if (type === 'magical-weapon') {
                merchantEquipment = await getMagicalWeaponEquipment(combat()?.player?.level as number);
            } else if (type === 'armor') {
                merchantEquipment = await getArmorEquipment(combat()?.player?.level as number);
            } else if (type === 'jewelry') {
                merchantEquipment = await getJewelryEquipment(combat()?.player?.level as number);
            } else if (type === 'general') {
                merchantEquipment = await getMerchantEquipment(combat()?.player?.level as number);
            } else if (type === 'cloth') {
                merchantEquipment = await getClothEquipment(combat()?.player?.level as number);
            };
            setMerchantTable(merchantEquipment);
            EventBus.emit('blend-game', { merchantEquipment: merchantEquipment });
        } catch (err) {
            console.warn(err, '--- Error Getting Loot! ---');
        };
    };

    function setItem(item: Equipment) {
        setSellItem(item);
        setShowItem(true);
    };

    function sellInventory() {
        EventBus.emit('alert', { header: 'Selling Item In Inventory', body: `You have sold your ${sellItem()?.name} for ${sellRarity(sellItem()?.rarity as string)}` })
        EventBus.emit('sell-item', sellItem());    
    };

    // {combat()?.computer?.alive ? '' : '[Deceased]'}
    return (
        <Show when={combat().computer}>
        <div style={{ 
            position: 'absolute', height: '50%', width: '60%', left: '20%', background: '#000', top: '40%', 
            border: '0.1em solid gold', 'border-radius': '0.25em', 'box-shadow': '0 0 0.5em #FFC700', display: 'inline-flex', overflow: 'scroll' 
        }}>
            <div class='wrap' style={{ width: combat().isEnemy ? '75%' : '100%', padding: '3%', height: 'auto' }}> 
            <div style={{ color: 'gold', 'font-size': '1em', 'margin-bottom': "5%" }}>
                <div style={{ display: 'inline' }}>
                    <img src={`../assets/images/${combat()?.computer?.origin}-${combat()?.computer?.sex}.jpg`} alt={combat()?.computer?.name} style={{ width: '10%', 'border-radius': '50%', border: '0.1em solid #fdf6d8' }} class='origin-pic' />
                    {' '}<div style={{ display: 'inline' }}>{combat()?.computer?.name} <p style={{ display: 'inline', 'font-size': '0.75em' }}>[Level {combat()?.computer?.level}]</p>
                    <br />
                    </div>
                </div>
            </div>
            { combat().npcType === 'Merchant-Smith' ? (
                <>
                    <Typewriter stringText={`"You've come for forging? I only handle chiomic quality and above. Check my rates and hand me anything you think worth's it. Elsewise I trade with the Armorer if you want to find what I've made already."
                        <br /><br />
                        Hanging on the wall is a list of prices for the various items you can forge. The prices are based on the quality. <br /><br />
                        <p class='greenMarkup'>Kyn'gian: 1g</p>  
                        <p class='blueMarkup'>Senic: 3g</p> 
                        <p class='purpleMarkup'>Kyris: 12g</p>  
                        <p class='darkorangeMarkup'>Sedyrus: 60g</p>`} 
                    styling={{ overflow: 'auto' }} performAction={hollowClick} />
                    <br />
                    { upgradeItems() ? (
                        upgradeItems().map((item: any) => {
                            console.log(item, 'Item!');
                            return (
                                <div style={{ display: 'inline-block', 'margin-right': '5%', 'margin-bottom': '10%' }}>
                                    {/* <Inventory inventory={item} bag={gameState.player.inventory} ascean={gameState.player} blacksmith={true} index={index} /> */}
                                </div>
                            )
                        })
                    ) : ( '' ) }
                    <br />
                </>
            ) : combat().npcType === 'Merchant-Alchemy' ? (
                <> 
                    { game().player?.firewater?.charges === 5 ? (
                        <Typewriter stringText={`The Alchemist sways in a slight tune to the swish of your flask as he turns to you. <br /><br /> ^500 "If you're needing potions of amusement and might I'm setting up craft now. Seems you're set for now, come back when you're needing more."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                    ) : (
                        <>
                            <Typewriter stringText={`The Alchemist's eyes scatter about your presence, eyeing ${game().player?.firewater?.charges} swigs left of your Fyervas Firewater before tapping on on a pipe, its sound wrapping round and through the room to its end, a quaint, little spigot with a grated catch on the floor.<br /><br /> ^500 "If you're needing potions of amusement and might I'm setting up craft now. Fill up your flask meanwhile, 10s a fifth what you say? I'll need you alive for patronage."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            <br />
                            <button class='highlight dialog-buttons' style={{ color: 'blueviolet' }} onClick={refillFlask}>Walk over and refill your firewater?</button>
                        </>
                    ) }
                </>
            ) : ( '' ) }
            { combat().isEnemy && combat().computer ? (
                <div style={{ 'font-size': '0.75em' }}>
                    <DialogTree 
                        game={game} combat={combat} ascean={ascean() as Ascean} enemy={combat().computer} dialogNodes={getNodesForEnemy(combat()?.computer as Ascean) as DialogNode[]} 
                        setKeywordResponses={setKeywordResponses} setPlayerResponses={setPlayerResponses} actions={actions} 
                    />
                { game().currentIntent === 'challenge' ? (
                    <>
                    { combat().persuasionScenario ? (
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={persuasionString} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            <br />
                            { combat().enemyPersuaded ? (
                                <>
                                    <p style={{ color: '#fdf6d8' }}>
                                    You persuaded {namedEnemy() ? '' : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                    </p>
                                    <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                </>
                            ) : ( '' ) }
                        </div>
                    ) : combat().luckoutScenario ? (
                        <div style={{ color: "gold" }}>
                            <Typewriter stringText={luckoutString} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            <br />
                            { combat().playerLuckout ? (
                                <>
                                    <p style={{ color: '#fdf6d8' }}>
                                    You lucked out against {namedEnemy() ? '' : ` the`} {combat().computer?.name} to forego hostilities. You may now travel freely through this area.
                                    </p>
                                    <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                </>
                            ) : ( '' ) }    
                        </div>   
                    ) : combat().playerWin ? (
                        <div>
                            { namedEnemy() ? (
                                <Typewriter stringText={`"Congratulations ${combat()?.player?.name}, you were fated this win. This is all I have to offer, if it pleases you."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            ) : ( 
                                <Typewriter stringText={`"Appears I were wrong to treat with you in such a way, ${combat()?.player?.name}. Take this if it suits you, I've no need."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            ) } 
                        </div> 
                    ) : combat().computerWin ? (
                        <div>
                            { namedEnemy() ? (
                                <Typewriter stringText={`"${combat()?.player?.name}, surely this was a jest? Come now, you disrespect me with such play. What was it that possessed you to even attempt this failure?"`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            ) : ( 
                                <Typewriter stringText={`"The ${combat()?.computer?.name} are not to be trifled with."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            ) } 
                        </div> 
                    ) : (
                        <div>
                            { namedEnemy() ? ( 
                                <>
                                    <Typewriter stringText={`"Greetings traveler, I am ${combat()?.computer?.name}. ${combat()?.player?.name}, is it? You seem a bit dazed, can I be of some help?"`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                    <br />
                                    <button class='highlight dialog-buttons' style={{ color: 'red' }} onClick={() => engageCombat(combat()?.enemyID)}>Forego pleasantries and surprise attack {combat()?.computer?.name}?</button>
                                </> 
                            ) : ( 
                                <>
                                    <Typewriter stringText={`${capitalize(enemyArticle())} ${combat()?.computer?.name} stares at you, unflinching. Eyes lightly trace about you, reacting to your movements in wait. Grip your ${combat().weapons[0]?.name} and get into position?`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                    <br />
                                    <button class='highlight dialog-buttons' style={{ color: 'red' }} onClick={() => engageCombat(combat()?.enemyID)}>Engage in hostilities with {combat()?.computer?.name}?</button>
                                </> 
                            ) }
                            { luckout() ? ( 
                                <LuckoutModal traits={luckoutTraits} callback={attemptLuckout} name={combat()?.computer?.name as string} influence={influence as Accessor<string>} show={luckoutModalShow} setShow={setLuckoutModalShow} /> 
                            ) : ('') }
                            { miniGame() ? (
                                miniGameTraits().map((trait: any) => {
                                    return (
                                        <div>
                                            {trait.name === "Se'van" ? (
                                                <button class='highlight dialog-buttons' onClick={() => engageGrappling()}>[Testing] Surprise {combat()?.computer?.name} and initiate Se'van Grappling</button>
                                            ) : trait.name === "Cambiren" ? (
                                                <button class='highlight dialog-buttons' >[WIP] Cambiren Combat</button>
                                            ) : trait.name === "Tshaeral" ? (
                                                <button class='highlight dialog-buttons' >[WIP] Tshaeral Combat</button>
                                            ) : trait.name === "Shrygeian" ? (
                                                <button class='highlight dialog-buttons' >[WIP] Shrygeian Combat</button>
                                            ) : ('')}
                                        </div>
                                    )
                                })
                            ) : ('') }
                        </div>
                    ) } 
                    </>
                ) : game().currentIntent === 'conditions' ? (
                    <Typewriter stringText={"This portion has not yet been written. Here you will be able to evaluate the conditions you have with said individual; disposition and the like."} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                ) : game().currentIntent === 'farewell' ? (
                    <>
                        { combat().persuasionScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter stringText={persuasionString} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                <br />
                                { combat().enemyPersuaded ? (
                                    <>
                                        <p style={{ color: '#fdf6d8' }}>
                                        You persuaded {namedEnemy() ? '' : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                    </>
                                ) : ( '' ) }
                            </div>
                        ) : combat().luckoutScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter stringText={luckoutString} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                <br />
                                { combat().playerLuckout ? (
                                    <>
                                        <p style={{ color: '#fdf6d8' }}>
                                        You lucked out against {namedEnemy() ? '' : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                    </>
                                ) : ( '' ) }    
                            </div>   
                        ) : combat().playerWin ? (
                            <>
                                { namedEnemy() ? (
                                    <Typewriter stringText={`"${combat()?.player?.name}, you are truly unique in someone's design. Before you travel further, if you wish to have it, its yours."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                ) : ( 
                                    <Typewriter stringText={`"Go now, ${combat()?.player?.name}, take what you will and find those better pastures."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                ) }
                                <br />
                                <button class='highlight dialog-buttons' onClick={() => clearDuel()}>Seek those pastures and leave your lesser to their pitious nature.</button>
                            </>
                        ) : combat().computerWin ? (
                            <>
                                <Typewriter stringText={`"If you weren't entertaining in defeat I'd have a mind to simply snuff you out here and now. Seek refuge, ${combat().player?.name}, your frailty wears on my caer."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Feign scamperping away to hide your shame and wounds. There's always another chance, perhaps.</button>
                            </>
                        ) : (
                            <>
                            { namedEnemy() ? ( 
                                <Typewriter stringText={`"I hope you find what you seek, ${combat()?.player?.name}. Take care in these parts, you may never know when someone wishes to approach out of malice and nothing more. Strange denizens these times."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            ) : ( 
                                <Typewriter stringText={`The ${combat()?.computer?.name}'s mild flicker of thought betrays their stance, lighter and relaxed.`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                            ) }
                                <br />
                                <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Keep moving.</button>
                            </>
                        ) }
                        { checkTraits("Kyn'gian", game().traits) && !combat().playerWin && !combat().computerWin ? (
                            <button class='highlight dialog-buttons' onClick={() => clearDuel()}>You remain at the edges of sight and sound, and before {combat()?.computer?.name} can react, you attempt to flee.</button>
                        ) : ( '' ) }
                    </>
                ) : game().currentIntent === 'localLore' ? (
                    <Typewriter stringText={`This will entail the local lore of the region you inhabit, and the history of the area from the perspective of the enemy in question, and hopefully grant more insight into the world.`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                ) : game().currentIntent === 'localWhispers' ? (
                    <Typewriter stringText={`Local Whispers will provide localized intrigue to the region you're inhabiting and the actual details of the map itself.`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                ) : game().currentIntent === 'persuasion' ? (
                    <>
                        { combat().playerWin ? (
                            <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Continue moving along your path, perhaps words will work next time.</button>
                        ) : combat().computerWin ? (
                            <button class='highlight dialog-buttons' style={{ color: 'red' }} onClick={() => clearDuel()}>Continue moving along your path, there's nothing left to say now.</button>
                        ) : persuasion() && !combat().persuasionScenario ? (
                                <PersuasionModal traits={persuasionTraits} callback={attemptPersuasion} name={combat().computer?.name as string} influence={influence as Accessor<string>} show={persuasionModalShow} setShow={setPersuasionModalShow} /> 
                        ) : ('') }
                        { combat().persuasionScenario ? (
                            <div style={{ color: "gold" }}>
                                <Typewriter stringText={persuasionString} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                <br />
                                { combat().enemyPersuaded ? (
                                    <>
                                        <p style={{ color: '#fdf6d8' }}>
                                        You persuaded {namedEnemy() ? '' : ` the`} {combat()?.computer?.name} to forego hostilities. You may now travel freely through this area.
                                        </p>
                                        <button class='highlight dialog-buttons' style={{ color: 'teal' }} onClick={() => clearDuel()}>Continue moving along your path.</button>
                                    </>
                                ) : ( '' ) }
                            </div>
                        ) : ( '' ) }
                    </>
                ) : game().currentIntent === 'provincialWhispers' ? (
                    <>
                        { combat().playerWin || combat().enemyPersuaded ? (
                            <>
                                <ProvincialWhispersButtons options={regionInformation} handleRegion={handleRegion}  />
                                <Typewriter stringText={`"There's concern in places all over, despite what has been said about steadying tides of war amongst the more civilized. Of where are you inquiring?"`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                <br />
                                <div style={{ color: 'gold' }}>
                                    <Typewriter stringText={region} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                                </div>
                            </>
                        ) : combat().computerWin ? (
                            <Typewriter stringText={`"I guess those whipspers must wait another day."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                        ) : ( 
                            <Typewriter stringText={`"What is it you wish to hear? If you can best me I will tell you what I know in earnest."`} styling={{ overflow: 'auto' }} performAction={hollowClick} />                            
                        ) }
                    </>
                ) : game().currentIntent === 'worldLore' ? (
                        <Typewriter stringText={"This will entail the world lore of the region you inhabit, the history of the world from the perspective of the enemy in question, and hopefully grant more insight into the cultural mindset."} styling={{ overflow: 'auto' }} performAction={hollowClick} />
                ) : ( '' ) }
                </div>
            ) : combat().computer && combat().npcType !== 'Merchant-Alchemy' && combat().npcType !== 'Merchant-Smith' ? (
                <DialogTree 
                    game={game} combat={combat} ascean={ascean()} enemy={combat().computer} dialogNodes={getNodesForNPC(npcIds[combat().npcType])} 
                    setKeywordResponses={setKeywordResponses} setPlayerResponses={setPlayerResponses} actions={actions}
                />
            ) : ( '' ) } 
            { combat().npcType !== '' ? (
                <Currency ascean={ascean} />
            ) : ( '' ) }
            { merchantTable()?.length > 0 ? (
                <>
                <button class='highlight' onClick={() => setShowSell(!showSell())}>
                    Sell to {combat().computer?.name}?
                </button>
                <MerchantTable table={merchantTable} game={game} ascean={ascean}  />
                </>
            ) : ( '' ) }
            </div>
            { combat().isEnemy ? (
                <div class='story-dialog-options' style={{ width: '30%', margin: 'auto', 'text-align': 'center', overflow: 'scroll', height: 'auto' }}>
                    <DialogButtons options={game().dialog} setIntent={handleIntent} />
                </div>
            ) : ( '' ) }
        </div>
        <Show when={showSell()}>
            <div class='modal' style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                <div class='creature-heading' style={{ 
                    position: 'absolute',
                    left: '50%',
                    top: '65%',
                    height: '50%',
                    width: '60%',
                    transform: 'translate(-50%, -50%)',
                    background: '#000',
                    border: '0.1em solid gold',
                    'border-radius': '0.25em',
                    'box-shadow': '0 0 0.5em #FFC700',
                    overflow: 'scroll',
                 }}>
                    <h1 class='center' style={{ 'margin-bottom': '3%' }}>Sell Items</h1>
                <div class='center'>
                <Currency ascean={ascean} />
                </div>
                <div class='playerInventoryBag center' style={{ width: '65%', 'margin-bottom': '5%' }}> 
                    <For each={game()?.inventory}>{(item, _index) => {
                        if (item === undefined || item === null) return;
                        return (
                            <div class='center' onClick={() => setItem(item)} style={{ 
                                ...getItemStyle(item?.rarity as string), 
                                margin: dimensions().ORIENTATION === 'landscape' ? '5.5%' : '2.5%',
                                padding: '0.25em',
                                width: 'auto', 
                            }}>
                                <img src={item?.imgUrl} alt={item?.name} />
                            </div>
                        );
                    }}</For>
                </div>
                <br /><br />
                </div>
                <button class='cornerBR highlight' onClick={() => setShowSell(false)} style={{ 'background-color': 'red' }}>
                    X
                </button>
            </div>
        </Show>
        <Show when={showItem()}>
            <div class='modal' onClick={() => setShowItem(false)} style={{ background: 'rgba(0, 0, 0, 0)' }}> 
                <ItemModal item={sellItem()} caerenic={false} stalwart={false} />
                <button class='verticalBottom highlight' onClick={() => sellInventory()} style={{ 
                    color: 'green', 'font-size': '1em', 'font-weight': 700, padding: '0.5em', 'box-shadow': '0 0 0.75em #00FF00',
                }}>
                    Sell {sellItem()?.name} for {sellRarity(sellItem()?.rarity as string)}
                </button>
            </div>
        </Show>
        </Show> 
    );
};