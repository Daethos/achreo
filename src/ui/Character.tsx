import { Accessor, For, JSX, Match, Setter, Show, Switch, createEffect, createSignal } from 'solid-js';
import { Form } from 'solid-bootstrap';
import AsceanImageCard from '../components/AsceanImageCard';
import AttributeModal, { AttributeCompiler } from '../components/Attributes';
import InventoryPouch from './InventoryPouch';
import { EventBus } from '../game/EventBus';
import HealthBar from './HealthBar';
import ExperienceBar from './ExperienceBar';
import Firewater from './Firewater';
import { ActionButtonModal, Modal } from '../utility/buttons';
import { font, getRarityColor } from '../utility/styling';
import ItemModal from '../components/ItemModal';
import Equipment from '../models/equipment';
import { useResizeListener } from '../utility/dimensions';
import { Attributes } from '../utility/attributes';
import Settings from '../models/settings';
import Ascean from '../models/ascean';
import { GameState } from '../stores/game';
import { Combat } from '../stores/combat';
import Highlight from './Highlight';
import { deleteEquipment, updateSettings } from '../assets/db/db';
import SettingSetter from '../utility/settings';
import TutorialOverlay from '../utility/tutorial';
import LevelUp from './LevelUp';
import { playerTraits } from '../utility/ascean';
import { ACTIONS, SPECIALS, TRAIT_SPECIALS } from '../utility/abilities';
import { OriginModal } from '../components/Origin';
import { FaithModal } from '../components/Faith';
import { DEITIES } from '../utility/deities';
import { PhaserShaper } from './PhaserShaper';
import { Reputation, faction } from '../utility/player';

export const viewCycleMap = {
    Character: 'Inventory',
    Inventory: 'Settings',
    Settings: 'Faith', // Character
    Faith: 'Character',
};
const CHARACTERS = {
    REPUTATION: 'Reputation',
    SKILLS: 'Skills',
    STATISTICS: 'Statistics',
    TRAITS: 'Traits',
};
const VIEWS = {
    CHARACTER: 'Character',
    INVENTORY: 'Inventory',
    SETTINGS: 'Settings',
    FAITH: 'Faith',
};
const SETTINGS = {
    ACTIONS: 'Actions',
    CONTROL: 'Control',
    INVENTORY: 'Inventory',
    GENERAL: 'General',
    SPECIALS: 'Specials',
    TACTICS: 'Tactics',
};
const CONTROLS = {
    BUTTONS: 'Buttons',
    DIFFICULTY: 'Difficulty',
    POST_FX: 'Post FX',
    PHASER_UI: 'Phaser UI',
};
const FAITH = {
    DEITIES: 'Deities',
    JOURNAL: 'Journal',
};
const GET_FORGE_COST = {
    Common: 1,
    Uncommon: 3,
    Rare: 12,
    Epic: 60,
};
const GET_NEXT_RARITY = {
    Common: "Uncommon",
    Uncommon: 'Rare',
    Rare: "Epic",
    Epic: "Legendary",
};
interface Props {
    reputation: Accessor<Reputation>;
    settings: Accessor<Settings>;
    setSettings: Setter<Settings>;
    ascean: Accessor<Ascean>; 
    asceanState: Accessor<any>;
    game: Accessor<GameState>;
    combatState: Accessor<Combat>;
};

const Character = ({ reputation, settings, setSettings, ascean, asceanState, game, combatState }: Props) => {
    const [playerTraitWrapper, setPlayerTraitWrapper] = createSignal<any>({});
    const [dragAndDropInventory, setDragAndDropInventory] = createSignal(game()?.inventory);
    const [canUpgrade, setCanUpgrade] = createSignal<boolean>(false);
    const [forgeModalShow, setForgeModalShow] = createSignal(false); 
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const [equipment, setEquipment] = createSignal<Equipment | undefined>(undefined);
    const [inventoryType, setInventoryType] = createSignal<string>('');
    const [highlighted, setHighlighted] = createSignal<{ item: Equipment | undefined; comparing: boolean; type: string }>({ item: undefined, comparing: false, type: '' });
    const [show, setShow] = createSignal<boolean>(false);
    const [actionShow, setActionShow] = createSignal<boolean>(false);
    const [currentAction, setCurrentAction] = createSignal({action: ACTIONS[0],index: 0});
    const [specialShow, setSpecialShow] = createSignal<boolean>(false);
    const [currentSpecial, setCurrentSpecial] = createSignal({special: SPECIALS[0],index: 0});
    const [specials, setSpecials] = createSignal<any[]>([]);
    const [inspectModalShow, setInspectModalShow] = createSignal<boolean>(false);
    const [inspectItems, setInspectItems] = createSignal<{ item: Equipment | undefined; type: string; } | any[]>([]);
    const [attrShow, setAttrShow] = createSignal<boolean>(false);
    const [asceanPic, setAsceanPic] = createSignal<string>('');
    const [ringCompared, setRingCompared] = createSignal<string>('');
    const [removeModalShow, setRemoveModalShow] = createSignal<boolean>(false);
    const [weaponCompared, setWeaponCompared] = createSignal<string>('');
    const [showTutorial, setShowTutorial] = createSignal<boolean>(false);
    const [showInventory, setShowInventory] = createSignal<boolean>(false);
    const [scaleImage, setScaleImage] = createSignal({ id: '', scale: 48 });
    const [tutorial, setTutorial] = createSignal<string>('');
    const [levelUpModalShow, setLevelUpModalShow] = createSignal<boolean>(false);
    const [expandedCharacter, showExpandedCharacter] = createSignal<boolean>(false);
    const [showOrigin, setShowOrigin] = createSignal<boolean>(false);
    const [showFaith, setShowFaith] = createSignal<boolean>(false);
    const [deity, setDeity] = createSignal<any>(undefined);
    const [showRestart, setShowRestart] = createSignal<boolean>(false);
    const [entry, setEntry] = createSignal<any>(undefined);
    const dimensions = useResizeListener();
 
    createEffect(() => {
        if (ascean) {
            setAsceanPic(`../assets/images/${ascean().origin}-${ascean().sex}.jpg`);
            playerTraits(game, setPlayerTraitWrapper);
            checkSpecials();
        };
    });

    createEffect(() => {
        if (!ascean().tutorial.views) {
            setShowTutorial(true);
            setTutorial('views');
        } else if (!ascean().tutorial.inventory && dragAndDropInventory().length && settings().asceanViews === 'Inventory') {
            setShowTutorial(true);
            setTutorial('inventory');
        } else if (!ascean().tutorial.settings && settings().asceanViews === 'Settings') {
            setShowTutorial(true);
            setTutorial('settings');
        } else if (!ascean().tutorial.character && settings().asceanViews === 'Character') {
            setShowTutorial(true);
            setTutorial('character');
        } else if (!ascean().tutorial.faith && settings().asceanViews === 'Faith') {
            setShowTutorial(true);
            setTutorial('faith');
        };
    });

    createEffect(() => {
        setDragAndDropInventory(game().inventory);
        checkHighlight();
    }); 

    function checkSpecials() {
        const potential = [playerTraitWrapper().primary.name, playerTraitWrapper().secondary.name, playerTraitWrapper().tertiary.name];
        const extra = [];
        for (let i = 0; i < 3; i++) {
            const trait = TRAIT_SPECIALS[potential[i] as keyof typeof TRAIT_SPECIALS];
            if (trait) {
                extra.push(trait);
            };
        };
        console.log(extra, 'Extra Specials');
        if (extra.length > 0) {
            let start = [...SPECIALS, ...extra];
            start.sort();
            setSpecials([...SPECIALS, ...extra]);
        };
    };

    const getBackgroundStyle = () => {
        if (scaleImage().scale > 48 && scaleImage().id === highlighted()?.item?._id) {
            console.log('ScaleImage is greater than 48');
            return 'gold';
        } else if (highlighted()?.item && (highlighted()?.item?._id === highlighted()?.item?._id)) {
            return '#820303';
        } else {
            return 'transparent';
        };
    };

    const currentItemStyle = (rarity: string): JSX.CSSProperties => {
        return {border: `0.15em solid ${getRarityColor(rarity)}`, 'background-color': getBackgroundStyle()};
    };

    const checkHighlight = () => {
        if (highlighted()?.item) {
            const item = game().inventory.find((item) => item?._id === highlighted()?.item?._id);
            if (!item) setHighlighted({ item: undefined, comparing: false, type: '' });
        };
    }; 

    const saveSettings = async (newSettings: Settings) => {
        try {
            await updateSettings(newSettings);
        } catch (err) {
            console.warn(err, "Error Saving Game Settings");
        };
    };

    const currentCharacterView = async (e: string) => {
        const newSettings: Settings = { ...settings(), characterViews: e };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const currentFaithView = async (e: string) => {
        const newSettings: Settings = { ...settings(), faithViews: e };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const createReputationBar = (faction: faction) => {
        return (
            <div class='skill-bar'>
            <p class='skill-bar-text'>{faction.name}: {faction.reputation} / 100</p>
                <div class='skill-bar-fill' style={{'width': `${faction.reputation}%`}}></div>
            </div>
        );    
    };

    const createSkillBar = (skill: string) => {
        const skillLevel = (ascean().skills as any)[skill];
        const skillCap = ascean().level * 100;
        const skillPercentage = Math.round((skillLevel / skillCap) * 100);
        return (
            <div class='skill-bar'>
                <p class='skill-bar-text'>{skill}: {skillLevel} / {skillCap}</p>
                <div class='skill-bar-fill' style={{'width': `${skillPercentage}%`}}></div>
            </div>
        );
    };

    const createCharacterInfo = (character: string) => {
        switch (character) {
            case CHARACTERS.REPUTATION:
                const unnamed = reputation().factions.filter((faction) => faction.named === false);
                return (
                    <div class='creature-heading'>
                        <h1 style={{ 'margin-bottom': '3%' }}>Reputation</h1>
                        <div style={{ 'margin-bottom': '3%' }}>
                            <For each={unnamed}>
                                {(faction: faction) => (
                                    createReputationBar(faction)
                                )}
                            </For>
                        </div>
                    </div>
                );
            case CHARACTERS.SKILLS:
                return (
                    <div class='creature-heading'>
                        <h1 style={{ 'margin-bottom': '3%' }}>Skills</h1>
                        <div style={{ 'margin-bottom': '3%' }}>
                            {createSkillBar('Axe')}
                            {createSkillBar('Bow')}
                            {createSkillBar('Curved Sword')}
                            {createSkillBar('Dagger')}
                            {createSkillBar('Earth')}
                            {createSkillBar('Fire')}
                            {createSkillBar('Frost')}
                            {createSkillBar('Greataxe')}
                            {createSkillBar('Greatbow')}
                            {createSkillBar('Greatmace')}
                            {createSkillBar('Greatsword')}
                            {createSkillBar('Lightning')}
                            {createSkillBar('Long Sword')}
                            {createSkillBar('Mace')}
                            {createSkillBar('Polearm')}
                            {createSkillBar('Righteous')}
                            {createSkillBar('Scythe')}
                            {createSkillBar('Short Sword')}
                            {createSkillBar('Spooky')}
                            {createSkillBar('Sorcery')}
                            {createSkillBar('Wild')}
                            {createSkillBar('Wind')}
                        </div>
                    </div>
                );
            case CHARACTERS.STATISTICS:
                const highestDeity = Object.entries(ascean()?.statistics?.combat?.deities).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
                const highestPrayer = Object.entries(ascean()?.statistics?.combat?.prayers).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
                let highestMastery = Object.entries(ascean()?.statistics?.mastery).reduce((a, b) => a[1] > b[1] ? a : b);
                if (highestMastery?.[1] === 0) highestMastery = [ascean()?.mastery, 0];
                console.log(ascean().statistics.combat.attacks, 'Attacks')
                return (
                    <div class='creature-heading'>
                        <h1 style={{ 'margin-bottom': '3%' }}>Attacks</h1>
                            Magical: <span class='gold'>{ascean()?.statistics?.combat?.attacks?.magical}</span> <br />
                            Physical: <span class='gold'>{ascean()?.statistics?.combat?.attacks?.physical}</span><br />
                            Highest Damage: <span class='gold'>{Math.round(ascean()?.statistics?.combat?.attacks?.total)}</span>
                        <h1 style={{ 'margin-bottom': '3%' }}>Combat</h1>
                            Mastery: <span class='gold'>{highestMastery[0].charAt(0).toUpperCase() + highestMastery[0].slice(1)} - {highestMastery[1]}</span><br />
                            Wins / Losses: <span class='gold'>{ascean()?.statistics?.combat?.wins} / {ascean()?.statistics?.combat?.losses}</span>
                        <h1 style={{ 'margin-bottom': '3%' }}>Prayers</h1>
                            Consumed / Invoked: <span class='gold'>{ascean()?.statistics?.combat?.actions?.consumes} / {ascean()?.statistics?.combat?.actions?.prayers} </span><br />
                            Highest Prayer: <span class='gold'>{highestPrayer[0].charAt(0).toUpperCase() + highestPrayer[0].slice(1)} - {highestPrayer[1]}</span><br />
                            Favored Deity: <span class='gold'>{highestDeity[0]}</span><br />
                            Blessings: <span class='gold'>{highestDeity[1]}</span>
                    </div>
                );
            case CHARACTERS.TRAITS:
                return (
                    <div class='creature-heading'>
                    <h1>{playerTraitWrapper()?.primary?.name}</h1>
                        <h2> <span class='gold'>{playerTraitWrapper()?.primary?.traitOneName}</span> - {playerTraitWrapper()?.primary?.traitOneDescription}</h2>
                        <h2> <span class='gold'>{playerTraitWrapper()?.primary?.traitTwoName}</span> - {playerTraitWrapper()?.primary?.traitTwoDescription}</h2>
                    <h1>{playerTraitWrapper()?.secondary?.name}</h1>
                        <h2> <span class='gold'>{playerTraitWrapper()?.secondary?.traitOneName}</span> - {playerTraitWrapper()?.secondary?.traitOneDescription}</h2>
                        <h2> <span class='gold'>{playerTraitWrapper()?.secondary?.traitTwoName}</span> - {playerTraitWrapper()?.secondary?.traitTwoDescription}</h2>
                    <h1>{playerTraitWrapper()?.tertiary?.name}</h1>
                        <h2> <span class='gold'>{playerTraitWrapper()?.tertiary?.traitOneName}</span> - {playerTraitWrapper()?.tertiary?.traitOneDescription}</h2>
                        <h2> <span class='gold'>{playerTraitWrapper()?.tertiary?.traitTwoName}</span> - {playerTraitWrapper()?.tertiary?.traitTwoDescription}</h2>
                    </div>
                );
            default:
                return ('');
        };
    }; 

    const createPrayerInfo = () => {
        const highestDeity = Object.entries(ascean()?.statistics?.combat?.deities).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
        const highestPrayer = Object.entries(ascean()?.statistics?.combat?.prayers).reduce((a, b) => a?.[1] > b?.[1] ? a : b);
        let highestMastery = Object.entries(ascean()?.statistics?.mastery).reduce((a, b) => a[1] > b[1] ? a : b);
        if (highestMastery?.[1] === 0) highestMastery = [ascean()?.mastery, 0];
        const rarity = { 'Default': 0, 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Epic': 4, 'Legendary': 5 };
        const weaponInfluenceStrength = rarity[ascean().weaponOne.rarity as keyof typeof rarity];
        const amuletInfluenceStrength = rarity[ascean().amulet.rarity as keyof typeof rarity];
        const trinketInfluenceStrength = rarity[ascean().trinket.rarity as keyof typeof rarity];

        return (
            <div class='creature-heading' style={{ padding: '5%' }}>
                <h1 style={{ 'margin-bottom': '3%' }}>Influence</h1>
                <h2>The influences of your equipment increase the likelihood of receiving a prayer from the associated deity.</h2>
                    {ascean().weaponOne.name}: <span class='gold'>[{ascean().weaponOne?.influences?.[0]}] +{weaponInfluenceStrength}%</span><br />
                    {ascean().amulet.name}: <span class='gold'>{ascean().amulet?.influences?.length as number > 0 ? [ascean().amulet?.influences?.[0]] : ''} +{amuletInfluenceStrength}%</span><br />
                    {ascean().trinket.name}: <span class='gold'>{ascean().amulet?.influences?.length as number > 0 ? [ascean().trinket?.influences?.[0]] : ''} +{trinketInfluenceStrength}%</span>        
                <h1 style={{ 'margin-bottom': '3%' }}>Prayers</h1>
                <h2>That which you seek in combat.</h2>
                    Mastery: <span class='gold'>{highestMastery[0].charAt(0).toUpperCase() + highestMastery[0].slice(1)} - {highestMastery[1]}</span><br />
                    Consumed / Invoked: <span class='gold'>{ascean()?.statistics?.combat?.actions?.consumes} / {ascean()?.statistics?.combat?.actions?.prayers} </span><br />
                    Highest Prayer: <span class='gold'>{highestPrayer[0].charAt(0).toUpperCase() + highestPrayer[0].slice(1)} - {highestPrayer[1]}</span><br />
                    Favored Deity: <span class='gold'>{highestDeity[0]}</span><br />
                    Blessings: <span class='gold'>{highestDeity[1]}</span>
                <h1 style={{ 'margin-bottom': '3%' }}>Traits</h1>
                <h2>That which you invoke without intent.</h2>
                {playerTraitWrapper()?.primary?.name} <span class='gold'>({playerTraitWrapper()?.primary?.traitOneName}, {playerTraitWrapper()?.primary?.traitTwoName})</span><br />
                {playerTraitWrapper()?.secondary?.name} <span class='gold'>({playerTraitWrapper()?.secondary?.traitOneName}, {playerTraitWrapper()?.secondary?.traitTwoName})</span><br />
                {playerTraitWrapper()?.tertiary?.name} <span class='gold'>({playerTraitWrapper()?.tertiary?.traitOneName}, {playerTraitWrapper()?.tertiary?.traitTwoName})</span>
            </div>
        );
    };

    const createDeityInfo = (deity: string) => {
        const info = DEITIES[deity as keyof typeof DEITIES];
        return (
            <div class='creature-heading'>
                <h1>{info?.name}</h1>
                <h4 class='gold cinzel'>{info?.favor}</h4>
                <h2>{info?.origin}</h2>
                <p class='gold'>{info?.description}</p>
            </div>
        );
    };

    const journalScroll = () => {
        if (ascean().journal.entries.length === 0) {
            setEntry(undefined);
            return (
                <div class='center creature-heading'>
                    <h1>Journal</h1>
                    <h2>There are no entries in your journal.</h2>
                </div>
            );
        };
        const currentEntry = ascean().journal.entries[ascean().journal.currentEntry];
        setEntry(currentEntry);
        const next = ascean().journal.entries.length > ascean().journal.currentEntry + 1 ? ascean().journal.currentEntry + 1 : 0;
        const prev = ascean().journal.currentEntry > 0 ? ascean().journal.entries[ascean().journal.currentEntry - 1] : ascean().journal.entries.length - 1;
        const formattedDate = new Date(entry().date).toISOString().split('T')[0].replace(/-/g, ' ');
        return (
            <div class='center creature-heading wrap' style={{ 'flex-wrap': 'wrap', 'margin-top': '12.5%' }}>
                <button onClick={() => setCurrentEntry(prev as number)} class='highlight cornerTL'>Prev</button>
                <button onClick={() => setCurrentEntry(next as number)} class='highlight cornerTR'>Next</button>
                <h1>{entry().title}</h1>
                <h4 style={{ margin: '4%' }}>{formattedDate}</h4>
                <h2>{entry().body}</h2>

                <h6 class='gold'>{entry().footnote}</h6>
                <h6>[Location: {entry().location || '???'}]</h6>
            </div>
        );
    };

    const createDeityScroll = () => {
        const deities = [];
        for (const deity in DEITIES) {
            deities.push(DEITIES[deity as keyof typeof DEITIES]);
        };
        return (
            <div class='center' style={{ 'flex-wrap': 'wrap' }}>
                <div class='creature-heading'>
                <For each={deities}>
                    {(deity: any) => (
                        <div>
                            <h1 style={{ 'font-size': '1.2em' }}>{deity?.name}</h1>
                            <h2>Favor: {deity?.favor}</h2> 
                        </div>
                    )}
                </For>
                </div>
            </div>
        );
    };

    function setCurrentEntry(e: number) {
        const newEntry = ascean().journal.entries[e];
        setEntry(newEntry);
        const newJournal = { ...ascean().journal, currentEntry: e };
        const update = { ...ascean(), journal: newJournal };
        EventBus.emit('update-ascean', update);
    };

    async function currentControl(e: string) {
        const newSettings: Settings = { ...settings(), control: e };
        setSettings(newSettings);
        await saveSettings(newSettings);
        if (e === CONTROLS.PHASER_UI) {
            EventBus.emit('show-castbar', true);
        };
    };

    async function currentView(e: string) {
        const newSettings: Settings = { ...settings(), settingViews: e };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    async function setNextView() {
        const nextView = viewCycleMap[settings().asceanViews as keyof typeof viewCycleMap];
        if (nextView) {
            showExpandedCharacter(false);
            const newSettings: Settings = { ...settings(), asceanViews: nextView };
            setSettings(newSettings);
            await saveSettings(newSettings);
        };
    }; 

    function actionModal(action: string, index: number) {
        setCurrentAction({ action: action, index: index });
        setActionShow(true);
    };

    function specialModal(special: string, index: number) {
        setCurrentSpecial({ special: special, index: index });
        setSpecialShow(true);
    };

    async function handleActionButton(e: string, i: number) {
        const newActions = [...settings().actions];
        const newAction = e;
        
        const oldAction = newActions[i];
        newActions[newActions.indexOf(newAction)] = oldAction;
        newActions[i] = newAction;
        
        const newSettings: Settings = { ...settings(), actions: newActions };
        await saveSettings(newSettings);
        setSettings(newSettings);
        EventBus.emit('reorder-buttons', { list: newActions, type: 'action' }); 
    };

    async function handleSpecialButton(e: string, i: number) {
        const newSpecials = [...settings().specials];
        const newSpecial = e;

        if (newSpecials.includes(newSpecial)) {
            const oldSpecial = newSpecials[i];
            newSpecials[newSpecials.indexOf(newSpecial)] = oldSpecial;
        };
        newSpecials[i] = newSpecial;
        const newSettings: Settings = { ...settings(), specials: newSpecials };
        setSettings(newSettings);
        await saveSettings(newSettings);
        EventBus.emit('reorder-buttons', { list: newSpecials, type: 'special' }); 
    };

    async function handlePostFx(type: string, val: any) {
        EventBus.emit('update-postfx', { type, val });
        const newSettings = { ...settings(), postFx: { ...settings().postFx, [type]: val } };
        await saveSettings(newSettings);
        setSettings(newSettings);
    };

    async function handleAim() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, aim: !settings().difficulty.aim } };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    async function handleAggression(e: any) {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, aggression: e.target.value } };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    async function handleComputerCombat() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, computer: !settings().difficulty.computer } };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };
 
    async function handleSpecial(e: any) {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, special: e.target.value } };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    async function handleMusic() {
        const newSettings = { ...settings(), music: !settings().music };
        setSettings(newSettings);
        await saveSettings(newSettings);
        EventBus.emit('music', newSettings.music);
    };

    async function handleTidbits() {
        const newSettings = { ...settings(), difficulty: { ...settings().difficulty, tidbits: !settings().difficulty.tidbits } };
        setSettings(newSettings);
        await saveSettings(newSettings);
        EventBus.emit('set-tips', newSettings.difficulty.tidbits);
    };

    async function handleVolume(e: number) {
        const newSettings = { ...settings(), volume: e };
        setSettings(newSettings);
        await saveSettings(newSettings);
        EventBus.emit('update-volume', e);
    };

    async function handleUpgradeItem() {
        if (highlighted().item?.rarity === 'Common' && ascean()?.currency?.gold < GET_FORGE_COST.Common) {
            return;
        } else if (highlighted().item?.rarity === 'Uncommon' && ascean()?.currency?.gold < 3) {
            return;
        } else if (highlighted().item?.rarity === 'Rare' && ascean()?.currency?.gold < 12) {
            return;
        } else if (highlighted().item?.rarity === 'Epic' && ascean()?.currency?.gold < 60) {
            return;
        } else if (highlighted().item?.rarity === 'Legendary' && ascean()?.currency?.gold < 300) {
            return;
        } else if (highlighted().item?.rarity === 'Mythic' && ascean()?.currency?.gold < 1500) {
            return;
        } else if (highlighted().item?.rarity === 'Divine' && ascean()?.currency?.gold < 7500) {
            return;
        } else if (highlighted().item?.rarity === 'Ascended' && ascean()?.currency?.gold < 37500) {
            return;
        } else if (highlighted().item?.rarity === 'Godly' && ascean()?.currency?.gold < 225000) {
            return;
        };
        try {
            console.log(`Upgrading ${highlighted().item?.name} of ${highlighted().item?.rarity} quality.`);
            const matches = dragAndDropInventory().filter((item) => item.name === highlighted().item?.name && item?.rarity === highlighted().item?.rarity);
            const data = {
                asceanID: ascean()._id,
                upgradeID: highlighted().item?._id,
                upgradeName: highlighted().item?.name,
                upgradeType: highlighted().item?.itemType,
                currentRarity: highlighted().item?.rarity,
                inventoryType: inventoryType(),
                upgradeMatches: matches,
            };
            EventBus.emit('upgrade-item', data);
            EventBus.emit('play-equip');
            setForgeModalShow(false);
            setCanUpgrade(false);
            setInspectModalShow(false);
        } catch (err: any) {
            console.log(err, '<- Error upgrading item');
        };
    };

    function handleInspect(type: string) {
        try {
            if (type === 'weaponOne' || type === 'weaponTwo' || type === 'weaponThree') {
                setWeaponCompared(type);
            } else if (type === 'ringOne' || type === 'ringTwo') {
                setRingCompared(type);
            };
            setInspectModalShow(false);
        } catch (err) {
            console.warn(err, '<- This is the error in Inspecting Equipment');
        };
    };

    async function removeItem(id: string) {
        await deleteEquipment(id);
        const newInventory = game().inventory.filter((item) => item._id !== id);
        EventBus.emit('refresh-inventory', newInventory);
        setRemoveModalShow(false);
    }; 

    function item(rarity: string) {
        return {
            border: '0.2em solid ' + getRarityColor(rarity),
            transform: 'scale(1.1)',
            'background-color': 'black',
            'margin-top': '0.25em',
            'margin-bottom': '0.25em',
            'padding-bottom': '-0.25em'
        };
    };

    function info(item: Equipment) {
        setDeity(item?.influences?.[0])
    };

    return (
        <div style={{ 'z-index': 1, position: 'fixed', top: 0, left: 0 }}>
        { settings().asceanViews === VIEWS.CHARACTER ? ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}>
                <div class='playerMenuHeading'>Character</div>
            </button>
            <div class='playerSettingSelect' style={{ position: 'fixed', top: 0, right: '0.5vh', 'z-index': 1 }}>
                { settings().characterViews === CHARACTERS.REPUTATION ? (
                    <button class='highlight p-3' onClick={() => currentCharacterView(CHARACTERS.SKILLS)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '0.9em' : '0.65em' }}>
                        <div>Reputation</div>
                    </button>
                ) : settings().characterViews === CHARACTERS.SKILLS ? (
                    <button class='highlight p-3' onClick={() => currentCharacterView(CHARACTERS.STATISTICS)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '0.9em' : '0.65em' }}>
                        <div>Skills</div>
                    </button>
                ) : settings().characterViews === CHARACTERS.STATISTICS ? (
                    <button class='highlight p-3' onClick={() => currentCharacterView(CHARACTERS.TRAITS)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '0.9em' : '0.65em' }}>
                        <div>Statistics</div>
                    </button>
                ) : (
                    <button class='highlight p-3' onClick={() => currentCharacterView(CHARACTERS.REPUTATION)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '0.9em' : '0.65em' }}>
                        <div>Traits</div>
                    </button>
                ) }     
            </div> 
        </> ) : settings().asceanViews === VIEWS.INVENTORY ? ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}><div class='playerMenuHeading'>Inventory</div></button>
            <button class='highlight p-3' onClick={() => showExpandedCharacter(!expandedCharacter())} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '0.9em' : '0.65em',position: 'fixed', top: 0, right: '10vh', 'z-index': 1 }}>
                <div>{expandedCharacter() === true ? 'Stats' : 'Equipment'}</div>
            </button>
            <Firewater ascean={ascean} />
        </> ) : settings().asceanViews === VIEWS.SETTINGS ? ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}><div class='playerMenuHeading'>Gameplay</div></button>
            {(settings().control !== CONTROLS.POST_FX && settings().control !== CONTROLS.PHASER_UI) && (
                <div class='playerSettingSelect' style={{ position: 'fixed', top: 0, right: '0.5vh', 'z-index': 1 }}>
                    <button class='highlight p-3' onClick={() => currentView(SETTINGS.ACTIONS)}><div style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Actions</div></button>
                    <button class='highlight p-3' onClick={() => currentView(SETTINGS.SPECIALS)}><div style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Specials</div></button>
                    <button class='highlight p-3' onClick={() => currentView(SETTINGS.CONTROL)}><div style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Control</div></button>
                    <button class='highlight p-3' onClick={() => currentView(SETTINGS.GENERAL)}><div style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>General</div></button>
                    <button class='highlight p-3' onClick={() => currentView(SETTINGS.INVENTORY)}><div style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Inventory</div></button>
                    <button class='highlight p-3' onClick={() => currentView(SETTINGS.TACTICS)}><div style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '1em' : '0.65em' }}>Tactics</div></button>
                </div>
            )}
        </> ) : ( <>
            <button class='highlight' style={{ 'margin-left': '4%' }} onClick={() => setNextView()}><div class='playerMenuHeading'>Personal</div></button>
            <div class='playerSettingSelect' style={{ position: 'fixed', top: 0, right: '0.5vh', 'z-index': 1 }}>
            { settings().faithViews === FAITH.DEITIES ? (
                <button class='highlight p-3' onClick={() => currentFaithView(FAITH.JOURNAL)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '0.9em' : '0.65em' }}>
                    <div>Deities</div>
                </button>
            ) : (
                <button class='highlight p-3' onClick={() => currentFaithView(FAITH.DEITIES)} style={{ 'font-size': dimensions().ORIENTATION === 'landscape' ? '0.9em' : '0.65em' }}>
                    <div>Journal</div>
                </button>
            ) }     
            </div>
        </> ) }
        {/* <<----- WINDOW ONE ----->> */}
        <Show when={(settings().control !== CONTROLS.POST_FX && settings().control !== CONTROLS.PHASER_UI) || settings().asceanViews !== VIEWS.SETTINGS}>
            <Switch>
                <Match when={settings().asceanViews === VIEWS.SETTINGS}>
                <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? 
                    { height: `${dimensions().HEIGHT * 0.8}px`, left: '0.5vw', overflow: 'hidden' } : { height: `${dimensions().HEIGHT * 0.31}`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, 
                }}>
                    <div class='' style={{ 'justify-content': 'center', 'align-items': 'center', 'text-align': 'center' }}>
                        <p style={{ color: 'gold', 'font-size': '1.25em' }}>Feedback</p>
                        <Form class='verticalCenter' style={{ 'text-wrap': 'balance' }}>
                        <Form.Group class="mb-3" controlId="formBasicEmail">
                            <Form.Text class="text-muted">
                                Warning: This will prompt your browser to open up a mail service of your choice.
                            </Form.Text>
                            <br />
                            <br />
                            <a href="mailto:ascean@gmx.com">Send Gameplay Feedback </a>
                            <br />
                            <br />
                            <Form.Text class="text-muted">
                                [Bugs, Errors, Issues, or Suggestions]
                            </Form.Text>
                        </Form.Group>
                        </Form>
                    </div>
                </div>
                </Match>    
                <Match when={settings().asceanViews === VIEWS.INVENTORY && expandedCharacter() === true}>
                <div class='playerWindow creature-heading' style={{ height: `${dimensions().HEIGHT * 0.8}px`, left: '0.5vw', overflow: 'scroll' }}>
                    { dimensions().ORIENTATION === 'landscape' ? ( <>
                        <img onClick={() => setShowOrigin(!showOrigin())} id='origin-pic' src={asceanPic()} alt={ascean().name} style={{ 'margin-top': '2.5%', 'margin-bottom': '2.5%' }} />
                        <h2 style={{ margin: '2%' }}>{combatState()?.player?.description}</h2>
                    </> ) : ( <>
                        <h2 style={{ 'margin-top': '15%' }}>
                            <span>
                                <img id='origin-pic' src={asceanPic()} alt={ascean().name} style={{ position: 'absolute', left: '-75%', top: '50%' }} />
                            </span>
                            {combatState()?.player?.description}
                        </h2>
                    </> ) }

                    <div class='propertyBlock' style={{ 'margin-bottom': '0%', 'font-size': '0.9em', 'font-family': 'Cinzel Regular' }}>
                        <div>Level: <span class='gold'>{combatState()?.player?.level}</span>{'\n'}</div>
                        <div>Silver: <span class='gold'>{ascean().currency.silver}</span> Gold: <span class='gold'>{ascean().currency.gold} {'\n'}</span></div>
                        <div onClick={() => setShowFaith(!showFaith())}>Faith: <span class='gold'>{ascean().faith}</span> | Mastery: <span class='gold'>{combatState()?.player?.mastery?.charAt(0).toUpperCase() as string + combatState()?.player?.mastery.slice(1)}</span></div>
                        <div>Health: <span class='gold'>{Math.round(combatState()?.newPlayerHealth)} / {combatState()?.playerHealth}</span> Stamina: <span class='gold'>{combatState()?.playerAttributes?.stamina}</span></div>
                        <div>Damage: <span class='gold'>{combatState()?.weapons?.[0]?.physicalDamage}</span> Physical | <span class='gold'>{combatState()?.weapons?.[0]?.magicalDamage}</span> Magical</div>
                        <div>Critical: <span class='gold'>{combatState()?.weapons?.[0]?.criticalChance}%</span> | <span class='gold'>{combatState()?.weapons?.[0]?.criticalDamage}x</span></div>
                        <div>Magical Defense: <span class='gold'>{combatState()?.playerDefense?.magicalDefenseModifier}% / [{combatState()?.playerDefense?.magicalPosture}%]</span>{'\n'}</div>
                        <div>Physical Defense: <span class='gold'>{combatState()?.playerDefense?.physicalDefenseModifier}% / [{combatState()?.playerDefense?.physicalPosture}%]</span>{'\n'}</div>
                    </div>
                    <div style={{ transform: 'scale(0.9)' }}>
                    <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                    </div>
                </div>
                </Match>
                <Match when={settings().asceanViews !== VIEWS.SETTINGS && settings().asceanViews !== VIEWS.FAITH && expandedCharacter() !== true}>
                    <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? 
                        { height: `${dimensions().HEIGHT * 0.8}px`, left: '0.5vw', overflow: 'hidden' } : { height: `${dimensions().HEIGHT * 0.31}`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, 
                    }}>
                            {/* <button class='highlight cornerTR' style={{ 'background-color': 'blue', 'z-index': 1, 'font-size': '0.25em', padding: '0.25em' }}onClick={() => getInventory()}>
                                <p>Get Eqp</p>
                            </button> */}
                            {/* <button class='highlight cornerTR' style={{ 'background-color': 'green', 'z-index': 1, 'font-size': '0.25em', padding: '0.25em' }}onClick={() => getMoney()}>
                                <p>Get Money</p>
                            </button> */}
                            {/* <button class='highlight cornerTR' style={{ 'background-color': 'gold', 'z-index': 1, 'font-size': '0.25em', padding: '0.25em' }}onClick={() => getExperience()}>
                                <p>Get Exp</p>
                            </button> */}
                            { ascean().experience >= ascean().level * 1000 && (
                                <button class='highlight cornerTR' style={{ 'background-color': 'purple', 'z-index': 1, 'font-size': '0.25em', padding: '0.25em' }} onClick={() => setLevelUpModalShow(!levelUpModalShow())}>
                                    <p>Level++</p>
                                </button>
                            ) }
                        <div class='gold' style={dimensions().ORIENTATION === 'landscape' ? { margin: '5%', 'text-align': 'center' } : { margin: '5%', 'text-align': 'center' }}>
                            {combatState()?.player?.name}
                        </div>
                        <HealthBar combat={combatState} />
                        <div style={dimensions().ORIENTATION === 'landscape' ? { 'margin-left': '0', 'margin-top': '7.5%', transform: 'scale(0.9)' } : { 'margin-left': '5%', transform: 'scale(0.75)', 'margin-top': '20%' }}>
                            <AsceanImageCard ascean={ascean} show={show} setShow={setShow} setEquipment={setEquipment} />
                        </div>
                        <div style={{ 'margin-top': '-5%' }}>
                            <ExperienceBar ascean={ascean} />
                        </div>
                    </div>
                </Match>
                <Match when={settings().asceanViews === VIEWS.FAITH}>
                    <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? 
                        { height: `${dimensions().HEIGHT * 0.8}px`, left: '0.5vw', overflow: 'scroll' } : { height: `${dimensions().HEIGHT * 0.31}`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, 
                    }}>
                        <div style={dimensions().ORIENTATION === 'landscape' ? { 'margin-left': '0', 'margin-top': '7.5%', transform: 'scale(0.9)' } : { 'margin-left': '5%', transform: 'scale(0.75)', 'margin-top': '20%' }}>
                            <div class='creature-heading' style={{ 'margin-top': '-5%' }}>
                                <h1>Blessings</h1>
                            </div>
                            <div class='' style={{ width: '70%', margin: 'auto', padding: '1em', display: 'grid' }}>
                            <div class='imageCardMiddle' style={{ 'left': '50%' }}>
                                <div onClick={() =>info(ascean().weaponOne)} style={item(ascean().weaponOne.rarity as string)}>
                                    <img alt='item' style={{ height: '100%', width: '100%' }} src={ascean().weaponOne.imgUrl} />
                                </div>
                                <div onClick={() =>info(ascean().amulet)} style={item(ascean().amulet.rarity as string)}>
                                    <img alt='item' style={{ height: '100%', width: '100%' }} src={ascean().amulet.imgUrl} />
                                </div>
                                <div onClick={() =>info(ascean().trinket)} style={item(ascean().trinket.rarity as string)}>
                                    <img alt='item' style={{ height: '100%', width: '100%' }} src={ascean().trinket.imgUrl} />
                                </div>
                            </div>
                            </div>
                        </div>
                        <div class='wrap'>
                            {createDeityInfo(deity())}
                        </div>
                    </div>
                </Match>    
            </Switch>
        </Show>
        {/* <<----- WINDOW TWO -----> */}
        <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? { height: `${dimensions().HEIGHT * 0.8}px`, left: '33.5vw', } : {
            height: `${dimensions().HEIGHT * 0.31}px`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, 'margin-top': '64%'
        }}>
            { settings().asceanViews === VIEWS.CHARACTER ? (
                <div class='center creature-heading' style={{ overflow: 'scroll' }}>
                    { dimensions().ORIENTATION === 'landscape' ? ( <>
                        <img onClick={() => setShowOrigin(!showOrigin())} id='origin-pic' src={asceanPic()} alt={ascean().name} style={{ 'margin-top': '2.5%', 'margin-bottom': '2.5%' }} />
                        <h2 style={{ margin: '2%' }}>{combatState()?.player?.description}</h2>
                    </> ) : ( <>
                        <h2 style={{ 'margin-top': '15%' }}>
                            <span>
                                <img id='origin-pic' src={asceanPic()} alt={ascean().name} style={{ position: 'absolute', left: '-75%', top: '50%' }} />
                            </span>
                            {combatState()?.player?.description}
                        </h2>
                    </> ) }

                    <div class='propertyBlock' style={{ 'margin-bottom': '0%', 'font-size': '0.9em', 'font-family': 'Cinzel Regular' }}>
                        <div>Level: <span class='gold'>{combatState()?.player?.level}</span>{'\n'}</div>
                        <div>Silver: <span class='gold'>{ascean().currency.silver}</span> Gold: <span class='gold'>{ascean().currency.gold} {'\n'}</span></div>
                        <div onClick={() => setShowFaith(!showFaith())}>Faith: <span class='gold'>{ascean().faith}</span> | Mastery: <span class='gold'>{combatState()?.player?.mastery?.charAt(0).toUpperCase() as string + combatState()?.player?.mastery.slice(1)}</span></div>
                        <div>Health: <span class='gold'>{Math.round(combatState()?.newPlayerHealth)} / {combatState()?.playerHealth}</span> Stamina: <span class='gold'>{combatState()?.playerAttributes?.stamina}</span></div>
                        <div>Damage: <span class='gold'>{combatState()?.weapons?.[0]?.physicalDamage}</span> Physical | <span class='gold'>{combatState()?.weapons?.[0]?.magicalDamage}</span> Magical</div>
                        <div>Critical: <span class='gold'>{combatState()?.weapons?.[0]?.criticalChance}%</span> | <span class='gold'>{combatState()?.weapons?.[0]?.criticalDamage}x</span></div>
                        <div>Magical Defense: <span class='gold'>{combatState()?.playerDefense?.magicalDefenseModifier}% / [{combatState()?.playerDefense?.magicalPosture}%]</span>{'\n'}</div>
                        <div>Physical Defense: <span class='gold'>{combatState()?.playerDefense?.physicalDefenseModifier}% / [{combatState()?.playerDefense?.physicalPosture}%]</span>{'\n'}</div>
                    </div>
                    <div style={{ transform: 'scale(0.9)' }}>
                    <AttributeCompiler ascean={ascean} setAttribute={setAttribute} show={attrShow} setShow={setAttrShow} />
                    </div>
                </div>
            ) : settings().asceanViews === VIEWS.INVENTORY ? (
                highlighted().comparing && (
                    <Highlight ascean={ascean} pouch={dragAndDropInventory} 
                        highlighted={highlighted as Accessor<{item: Equipment, comparing: boolean, type: string}>} 
                        inventoryType={inventoryType} ringCompared={ringCompared} weaponCompared={weaponCompared} 
                        setInspectItems={setInspectItems as Setter<{ item: Equipment | undefined; type: string; }[]>} 
                        setInspectModalShow={setInspectModalShow} 
                        setRemoveModalShow={setRemoveModalShow} removeModalShow={removeModalShow} 
                        forge={forgeModalShow} setForge={setForgeModalShow} 
                        upgrade={canUpgrade} setUpgrade={setCanUpgrade}
                    />
                )
            ) : settings().asceanViews === VIEWS.SETTINGS ? (
                <div class='center' style={{ display: 'flex', 'flex-direction': 'row' }}>
                    <div class='gold' style={{ position: 'absolute', top: '5%', 'font-size': '1.25em', display: 'inline' }}>Controls <br />
                        <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.BUTTONS ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.BUTTONS)}>Actions</button>
                        <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.POST_FX ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.POST_FX)}>PostFx</button>
                        <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.DIFFICULTY ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.DIFFICULTY)}>Settings</button>
                        <button class='highlight' style={{ 'font-size': '0.3em', display: 'inline', width: 'auto', color: settings().control === CONTROLS.PHASER_UI ? 'gold': '#fdf6d8' }} onClick={() => currentControl(CONTROLS.PHASER_UI)}>UI</button>
                    </div>
                    <Switch>
                        <Match when={settings().control === CONTROLS.BUTTONS}>
                            <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                            <div style={font('1em', '#fdf6d8')}>Action Buttons<br /></div>
                            {settings().actions?.map((action: string, index: number) =>
                                <button class='highlight' onClick={() => actionModal(action, index)}>
                                    <div style={{ width: '100%', 'font-size': '0.75em', margin: '3%' }}><span class='gold'>{index + 1} </span> {action}</div>
                                </button>
                            )}
                            </div>
                            <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                                <div style={font('1em', '#fdf6d8')}>Special Buttons<br /></div>
                                {settings().specials?.map((special: string, index: number) => 
                                    <button  class='highlight' onClick={() => specialModal(special, index)}>
                                        <div style={{ width: '100%', 'font-size': '0.75em', margin: '3%' }}><span class='gold'>{index + 1} </span> {special}</div>
                                    </button>
                                )}
                            </div>
                        </Match>
                        <Match when={settings().control === CONTROLS.POST_FX}>
                            <div class='center' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                                <div style={font('0.75em', '#fdf6d8')}>PostFx
                                <button class='highlight' onClick={() => handlePostFx('enable', !settings().postFx?.enable)}>
                                    {settings().postFx?.enable ? 'On' : 'Off'}
                                </button> 
                                </div>

                                <div style={font('0.75em', '#fdf6d8')}>Chromatic Abb.
                                <button class='highlight' onClick={() => handlePostFx('chromaticEnable', !settings().postFx?.chromaticEnable)}>
                                    {settings().postFx?.chromaticEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Chab ({settings().postFx.chabIntensity})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.chabIntensity} onChange={(e) => handlePostFx('chabIntensity', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />



                                <div style={font('0.75em', '#fdf6d8')}>Vignette Enable
                                <button class='highlight' onClick={() => handlePostFx('vignetteEnable', !settings().postFx?.vignetteEnable)}>
                                    {settings().postFx?.vignetteEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Vignette Strength ({settings().postFx.vignetteStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vignetteStrength} onChange={(e) => handlePostFx('vignetteStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                <div style={font('0.75em', '#fdf6d8')}>Vignette Intensity ({settings().postFx.vignetteIntensity})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vignetteIntensity} onChange={(e) => handlePostFx('vignetteIntensity', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />

                                <div style={font('0.75em', '#fdf6d8')}>Noise Enable
                                <button class='highlight' onClick={() => handlePostFx('noiseEnable', !settings().postFx?.noiseEnable)}>
                                    {settings().postFx?.noiseEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Noise Strength ({settings().postFx.noiseStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.noiseStrength} onChange={(e) => handlePostFx('noiseStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                <div style={font('0.75em', '#fdf6d8')}>Noise Seed ({settings().postFx.noiseSeed})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.noiseSeed} onChange={(e) => handlePostFx('noiseSeed', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />


                                <div style={font('0.75em', '#fdf6d8')}>VHS Enable
                                <button class='highlight' onClick={() => handlePostFx('vhsEnable', !settings().postFx?.vhsEnable)}>
                                    {settings().postFx?.vhsEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>VHS Strength ({settings().postFx.vhsStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.vhsStrength} onChange={(e) => handlePostFx('vhsStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />


                                <div style={font('0.75em', '#fdf6d8')}>Scanline Enable
                                <button class='highlight' onClick={() => handlePostFx('scanlinesEnable', !settings().postFx?.scanlinesEnable)}>
                                    {settings().postFx?.scanlinesEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>Scanline Strength ({settings().postFx.scanStrength})</div>
                                <Form.Range min={0} max={1} step={0.01} value={settings().postFx.scanStrength} onChange={(e) => handlePostFx('scanStrength', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />


                                <div style={font('0.75em', '#fdf6d8')}>CRT Enable
                                <button class='highlight' onClick={() => handlePostFx('crtEnable', !settings().postFx?.crtEnable)}>
                                    {settings().postFx?.crtEnable ? 'On' : 'Off'}
                                </button>
                                </div>
                                <div style={font('0.75em', '#fdf6d8')}>CRT Height ({settings().postFx.crtHeight})</div>
                                <Form.Range min={0} max={5} step={0.1} value={settings().postFx.crtHeight} onChange={(e) => handlePostFx('crtHeight', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                <div style={font('0.75em', '#fdf6d8')}>CRT Width ({settings().postFx.crtWidth})</div>
                                <Form.Range min={0} max={5} step={0.1} value={settings().postFx.crtWidth} onChange={(e) => handlePostFx('crtWidth', Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                </div>
                        </Match>
                        <Match when={settings().control === CONTROLS.DIFFICULTY}>
                            <div class='center creature-heading wrap' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                                <div style={font('1em', '#fdf6d8')}>
                                    <h1 style={font('1.25em')}>Computer Combat</h1>
                                    <button class='gold highlight' onClick={() => handleComputerCombat()}>{settings().difficulty.computer ? 'Enabled' : 'Disabled'}</button>
                                </div>
                                <div style={font('0.5em')}>[Whether Computer Enemies Will Engage In Combat With Each Other (Not Yet Implemented)]</div>

                                <div style={font('1em', '#fdf6d8')}>
                                    <h1 style={font('1.25em')}>Computer Targeting</h1>
                                    <button class='gold highlight' onClick={() => handleAim()}>{settings().difficulty.aim ? 'Manual' : 'Auto'} Aim</button>
                                </div>
                                <div style={font('0.5em')}>[Whether You Use the Second Joystick to Aim Ranged Attacks in Combat]</div>

                                <div style={font('1em', '#fdf6d8')}>
                                    <h1 style={font('1.25em')}>Enemy Aggression</h1>
                                    <span class='gold'>{settings().difficulty.aggression * 100}%</span> <br />
                                    <Form.Range min={0} max={1} step={0.05} value={settings().difficulty.aggression} onChange={(e) => handleAggression(e)} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                </div>
                                <div style={font('0.5em')}>[Aggressive Enemy Occurrence: 0 - 100% <br /> Restart Game For This Change To Take Effect.]</div>

                                <h1 style={font('1.25em')}>Enemy Specials</h1>
                                <div style={font('1em', '#fdf6d8')}>
                                    <span class='gold'>{settings().difficulty.special * 100}%</span> <br />
                                    <Form.Range min={0} max={1} step={0.05} value={settings().difficulty.special} onChange={(e) => handleSpecial(e)} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                </div>
                                <div style={font('0.5em')}>[Special (Elite) Enemy Occurrence: 0 - 100% <br /> Restart Game For This Change To Take Effect.]</div>

                                <h1 style={font('1.25em')}>Sound</h1>
                                <div style={font('0.75em', '#fdf6d8')}> 
                                    <button class='gold highlight' onClick={() => handleMusic()}>{settings().music ? 'Enabled' : 'Disabled'}</button>
                                </div>
                                <div style={font('0.5em')}>[Whether any music or sound effects are enabled. Restart Game For This Change To Take Effect.]</div>

                                <div style={{...font('0.75em', '#fdf6d8'), 'margin': '3%' }}>Volume ({settings().volume})</div>
                                <Form.Range min={0} max={1} step={0.1} value={settings().volume} onChange={(e) => handleVolume(Number(e.target.value))} style={{ color: 'red', background: 'red', 'background-color': 'red' }} />
                                <br />

                                <h1 style={font('1.25em')}>Tidbit Popups</h1>
                                    <button class='gold highlight' onClick={() => handleTidbits()}>{settings().difficulty.tidbits ? 'On' : 'Off'}</button>
                                <div style={font('0.5em')}>[On = Helpful Hints and Lore Popups, False = No Info Popups]</div>
                                <br />
                            </div>
                        </Match>
                        <Match when={settings().control === CONTROLS.PHASER_UI}>
                            <div class='center creature-heading' style={dimensions().ORIENTATION === 'landscape' ? { 'margin-top': '25%' } : { 'margin-top': '50%' }}>
                                <PhaserShaper settings={settings} />
                                <br />
                            </div>
                        </Match>
                    </Switch>
                        <button class='highlight cornerTR' style={{ 'background-color': 'red', 'z-index': 1, 'font-size': '0.25em', padding: '0.25em' }} onClick={() => setShowRestart(true)}>
                            <p>Restart</p>
                        </button>
                </div>
            ) : ( 
                <div class='center' style={{ display: 'flex', 'flex-direction': 'row' }}>
                    <div class='center wrap' style={{ 'margin-top': '-2.5%' }}> 
                        {createPrayerInfo()}
                    </div>
                </div>
             ) }
        </div>
        {/* <<----- WINDOW THREE ----->> */}
        <Show when={(settings().control !== CONTROLS.POST_FX && settings().control !== CONTROLS.PHASER_UI) || settings().asceanViews !== VIEWS.SETTINGS}>
            <div class='playerWindow' style={dimensions().ORIENTATION === 'landscape' ? {height: `${dimensions().HEIGHT * 0.8}px`, left: '66.5vw' } : { height: `${dimensions().HEIGHT * 0.31}px`, left: '1vw', width: `${dimensions().WIDTH * 0.98}px`, 'margin-top': '129%' }}>
                { settings().asceanViews === VIEWS.CHARACTER ? (
                    <div class='center wrap'> 
                        {createCharacterInfo(settings()?.characterViews)}
                    </div>
                ) : settings().asceanViews === VIEWS.INVENTORY ? ( 
                    <InventoryPouch ascean={ascean} setRingCompared={setRingCompared} highlighted={highlighted} setHighlighted={setHighlighted} setInventoryType={setInventoryType} inventoryType={inventoryType} setWeaponCompared={setWeaponCompared} setDragAndDropInventory={setDragAndDropInventory} dragAndDropInventory={dragAndDropInventory} scaleImage={scaleImage} setScaleImage={setScaleImage} />
                ) : settings().asceanViews === VIEWS.SETTINGS ? (
                    <div style={{ 'scrollbar-width': "none", overflow: 'scroll' }}> 
                        <div class='center' style={{ padding: '5%', 'font-size': '0.75em' }}>
                            <SettingSetter setting={settings} />
                        </div>
                    </div>
                ) : ( 
                    <div style={{ 'scrollbar-width': 'none', overflow: 'scroll' }}>
                        <div class='center' style={{ padding: '2.5%' }}>{settings().faithViews === FAITH.DEITIES ? (createDeityScroll()) : (journalScroll())}</div>
                    </div>
                 ) }
            </div>
        </Show>
        <Show when={levelUpModalShow()}>
            <LevelUp ascean={ascean} asceanState={asceanState} show={levelUpModalShow} setShow={setLevelUpModalShow} />
        </Show>
        <Show when={show()}>
            <div class='modal' onClick={() => setShow(!show)}>
                <ItemModal item={equipment()} stalwart={combatState().isStalwart} caerenic={combatState().isCaerenic} /> 
            </div> 
        </Show>
        <Show when={actionShow()}>
            <div class='modal' onClick={() => setActionShow(!actionShow())}>
                <ActionButtonModal currentAction={currentAction} actions={ACTIONS}  handleAction={handleActionButton} /> 
            </div>
        </Show>
        <Show when={attrShow()}>
            <div class='modal' onClick={() => setAttrShow(!attrShow())}>
                <AttributeModal attribute={attribute()} />
            </div> 
        </Show>
        <Show when={showOrigin()}>
            <div class='modal' onClick={() => setShowOrigin(!showOrigin())}>
                <OriginModal origin={ascean().origin} />
            </div>
        </Show>
        <Show when={showFaith()}>
            <div class='modal' onClick={() => setShowFaith(!showFaith())}>
                <FaithModal faith={ascean().faith} />
            </div>
        </Show> 
        <Show when={specialShow()}>
            <div class='modal' onClick={() => setSpecialShow(!specialShow())}>
                <ActionButtonModal currentAction={currentSpecial} actions={specials()} handleAction={handleSpecialButton} special={true} /> 
            </div>
        </Show>
        <Show when={(inspectModalShow() && inspectItems())}> 
            <div class='modal'>
                <Modal 
                    items={inspectItems as Accessor<{ item: Equipment | undefined; type: string; }[]>} 
                    inventory={highlighted().item} callback={handleInspect} 
                    forge={forgeModalShow} setForge={setForgeModalShow} upgrade={canUpgrade} setUpgrade={setCanUpgrade} 
                    show={inspectModalShow} setShow={setInspectModalShow} 
                />
            </div>
        </Show>
        <Show when={forgeModalShow()}> 
            <div class='modal'>
                <div class='border superCenter wrap' style={{ width: '50%' }}>
                <p class='center wrap' style={{ color: "red", 'font-size': "1.25em", margin: '3%' }}>
                    Do You Wish To Collapse Three {highlighted()?.item?.name} into one of {GET_NEXT_RARITY[highlighted()?.item?.rarity as string as keyof typeof GET_NEXT_RARITY]} Quality for {GET_FORGE_COST[highlighted()?.item?.rarity as string as keyof typeof GET_FORGE_COST]} Gold?
                </p>
                <div>
                    <button class='highlight' style={{ color: 'gold', 'font-weight': 600, 'font-size': "1.5em" }} onClick={() => handleUpgradeItem()}>
                        {highlighted()?.item?.rarity && GET_FORGE_COST[highlighted()?.item?.rarity as string as keyof typeof GET_FORGE_COST]} Gold Forge
                    </button>    
                    <div style={{ color: "gold", 'font-weight': 600 }}>
                        <p style={{ 'font-size': '2em' }}>
                            (3) <img src={highlighted()?.item?.imgUrl} alt={highlighted()?.item?.name} style={currentItemStyle(highlighted()?.item?.rarity as string)} /> 
                            {' => '} <img src={highlighted()?.item?.imgUrl} alt={highlighted()?.item?.name} style={currentItemStyle(GET_NEXT_RARITY[highlighted()?.item?.rarity as string as keyof typeof GET_NEXT_RARITY])} />
                            </p> 
                    </div>
                <button class='highlight cornerBR' style={{ 'background-color': 'red' }} onClick={() => setForgeModalShow(false)}>x</button>
                </div>
                </div>
            </div>
        </Show>
        <Show when={removeModalShow()}>
            <div class='modal'>
            <div class='button superCenter' style={{ 'background-color': 'black', width: '25%' }}>
                <div class=''>
                <div class='center' style={font('1.5em')}>Do You Wish To Remove and Destroy Your <span style={{ color: 'gold' }}>{highlighted()?.item?.name}?</span> <br /><br /><div>
                    <img style={{ transform: 'scale(1.25)' }} src={highlighted()?.item?.imgUrl} alt={highlighted()?.item?.name} onClick={() => removeItem(highlighted()?.item?._id as string)} />
                </div>
                </div>
                </div>
                <br /><br /><br />
                <button class='highlight cornerBR' style={{ transform: 'scale(0.85)', bottom: '0', right: '0', 'background-color': 'red' }} onClick={() => setRemoveModalShow(!removeModalShow())}>
                    <p style={font('0.5em')}>X</p>
                </button>
            </div>
            </div>
        </Show>
        <Show when={showRestart()}>
            <div class='modal'>

            <div class='border superCenter creature-heading' style={{ width: '50%' }}>
            <h1 class='center' style={{ color: 'red', margin: '5%' }}>Restart Game</h1>
            <p class='center' style={{ 'margin-bottom': '15%' }}>Do you with to go back to the Main Menu?</p>
            <button class='cornerBL highlight' style={{ color: 'gold' }} onClick={() => setShowRestart(false)}>No</button>
            <button class='cornerBR highlight' style={{ color: 'red' }} onClick={() => document.location.reload()}>Yes</button>
            </div>
            </div> 
        </Show>
        <Show when={showTutorial()}>
            <TutorialOverlay ascean={ascean} id={ascean()._id} tutorial={tutorial} show={showTutorial} setShow={setShowTutorial} /> 
        </Show>
        <Show when={showInventory()}>
            <TutorialOverlay ascean={ascean} id={ascean()._id} tutorial={tutorial} show={showInventory} setShow={setShowInventory} /> 
        </Show>
        </div>
    );
}; 

export default Character;