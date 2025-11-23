import Ascean from "./ascean";
import Equipment from "./equipment";
import Settings from "./settings";
import { ABSORB, ACHIRE, ARC, ASTRAVE, BLINK, CHARM, CHIOMIC, CHIOMISM, CONFUSE, DESPERATION, DISEASE, DISPEL, ENVELOP, FEAR, FREEZE, FROST, FYERUS, GRAPPLE, HEALING, HOOK, HOWL, ILIRECH, KYNISOS, KYRISIAN, KYRNAICISM, LEAP, LIGHTNING, LIKYR, MAIERETH, MALICE, MARK, MENACE, MEND, MODERATE, MULTIFARIOUS, MYSTIFY, NETHERSWAP, PARALYZE, POLYMORPH, PROTECT, PURSUIT, QUOR, RECALL, RECONSTITUTE, RECOVER, REIN, RENEWAL, RUSH, SACRIFICE, SCREAM, SHADOW, SHIELD, SHIMMER, SHIRK, SLOW, SNARE, SPECIAL, SPRINT, STORM, SUTURE, TETHER, WARD, WRITHE } from "../utility/abilities";
import { ACHREON_DRUID, AHNARE_APOSTLE, ANASHTRE, ASTRAL_APOSTLE, CAMBIREN_DRUID, CHIOMIC_JESTER, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, DORIEN, EUGENES, FANG_DUELIST, FANG_MERCENARY, FIEROUS, FIRESWORN, FYERS_OCCULTIST, GARRIS, ILIRE_OCCULTIST, KINGSMAN, KRECEUS, KYNGIAN_SHAMAN, KYRISIAN_OCCULTIST, LEAF, LIIVI_LEGIONNAIRE, MAIER_OCCULTIST, MARAUDER, MAVROSIN_OCCULTIST, MIRIO, NORTHREN_WANDERER, NYREN, OLD_LIIVI_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, RAHVREHCUR, SEDYRIST, SERA, SEVA_SHRIEKER, SHRYGEIAN_BARD, SOUTHRON_WANDERER, SYNAETHI, TORREOUS, TSHAERAL_SHAMAN, VINCERE } from "../utility/player";
import { v4 as uuidv4 } from 'uuid';
import { SPECIAL_PRAYERS } from "../ui/CombatSettings";

const QUESTING = {
    PLAYER_THRESHOLD_ONE: 4,
    PLAYER_THRESHOLD_TWO: 8,
    EXPERIENCE_MULTIPLIER: 500,
    SILVER_ADDED: 25,
    SILVER_MULTIPLIER: 15,
};

type FETCH = {
    id: "fetch";
    current: number;
    total: number;
    [key: string]: number | string;
};

type SOLVE = {
    id: "solve";
    solved: boolean;
    [key: string]: boolean | string;
};

const initFetch: FETCH = {
    id: "fetch",
    current: 0,
    total: 5
};

// const initSolve: SOLVE = {
//     id: "solve",
//     solved: false,
// };

export function replaceChar(str: string, rep: string): string {
    const yes = str?.split("").find((char: string) => char === "{");
    if (yes) {
        const replace = str?.replace("{name}", rep);
        return replace; 
    };
    return str;
};

export default class QuestManager {
    public _id: string;
    public quests: Quest[];

    constructor(id: string) {
        this._id = id;
        this.quests = [];
    };
    [key: string]: any;
};

export const initQuests = new QuestManager("quest");
export const createQuests = (id: string): QuestManager => new QuestManager(id);
export type Condition = {key: string; operator: string; value: number | string;}
type Prospect = {
    giver: Ascean;
    mastery: string;
    title: string;
    description: string;
    requirements: {
        level: number;
        reputation: number;
        description: string;
        technical: FETCH | SOLVE;
        action?: { name: string, key: string, value: string };
        dialog?: string;
        conditions?: Condition;
    };
    rewards: string[];
    prayer: string;   
};

export class Quest {
    public _id: string;
    public title: string;
    public mastery: string;
    public description: string;
    public giver: string;
    public level: number;
    public completed: boolean = false;
    public repeatable: boolean = false;
    public requirements: {
        level: number,
        reputation: number,
        description: string,
        technical: FETCH | SOLVE,
        dialog?: string,
        action?: { name: string, key: string, value: string },
        conditions?: Condition;
    };
    public rewards: {
        currency: { silver: number, gold: number },
        experience: number,
        items: Equipment[] | string[] | undefined,
    };
    public special: string;
    public prayer: string;

    constructor(quest: Prospect) {
        this._id = uuidv4();
        this.title = quest.title;    
        this.description = this.getDescription(quest);
        this.giver = quest.giver.name;
        this.level = quest.giver.level;
        this.mastery = quest.giver.mastery;
        this.requirements = quest.requirements;
        this.rewards = this.getReward(quest);
        this.special = quest.rewards.length ? quest.rewards[Math.floor(Math.random() * quest.rewards.length)] : "";    
        this.prayer = quest.prayer;    
    };
    [key: string]: any;

    private getCurrency(level: number) {
        let currency = { silver: 0, gold: 0 };
        currency.silver = Math.round(Math.random() * (level * QUESTING.SILVER_MULTIPLIER) + QUESTING.SILVER_ADDED);
        if (currency.silver > 100) {
            currency.gold += Math.floor(currency.silver / 100);
            currency.silver = currency.silver % 100;
        };
        if (level >= QUESTING.PLAYER_THRESHOLD_ONE) {
            currency.gold += Math.round(Math.random() * (level - QUESTING.PLAYER_THRESHOLD_ONE) + 1);
        };
        return currency;
    };

    private getDescription(quest: any) {
        // const article = ["a", "e", "i", "o", "u"].includes(quest.giver.name[0].toLowerCase()) ? "an" : "a";
        // const namelessDescriptors = ["druid", "shaman", "apostle", "jester", "occultist", "stalker", "guard", "knight", "daethic", "bard", "kingsman", "firesword", "shrieker", "northren", "southron", "marauder", "fang", "soldier", "soverain", "rahvrecur", "se'dyrist", "nyren"];
        // const nameParts = quest.giver.name.toLowerCase().split(" ");
        // const hasDescriptor = nameParts.some((part: string) => namelessDescriptors.includes(part));
        // const nameless = hasDescriptor ? true : false;
        // const description = `${quest.description}`; // . You have been tasked with ${quest.title} by ${nameless ? article + " " : ""}${quest.giver.name}.
        return quest.description;
    };

    private getExperience(level: number) {
        const experience = level * QUESTING.EXPERIENCE_MULTIPLIER;
        return experience;
    };

    private getItems(level: number) {
        const choices = ["Weapon", "Weapon", "Weapon", "Armor", "Armor", "Armor", "Jewelry", "Shield"];
        const items = [];
        items.push(choices[Math.floor(Math.random() * choices.length)]);
        if (level >= QUESTING.PLAYER_THRESHOLD_ONE) {
            items.push(choices[Math.floor(Math.random() * choices.length)]);
        } else if (level >= QUESTING.PLAYER_THRESHOLD_TWO) {
            items.push(choices[Math.floor(Math.random() * choices.length)]);
        };
        return items;
    };

    private getReward(quest: any) {
        return {
            currency: this.getCurrency(quest.giver.level),
            items: this.getItems(quest.giver.level),
            experience: this.getExperience(quest.giver.level),
        };
    };
};

/*
{
    name: [MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST],
    title: "Mist of the Moon",
    description: "Gain the Ma'ier’s trust by either aiding their rituals or betraying their rivals.",
    requirements: {
        // Dynamic steps:
        steps: [
            { type: "KILL", target: ILIRE_OCCULTIST, count: 3 }, // Option A
            { type: "FETCH_ITEM", item: MOON_RELIC, for: MAIER_OCCULTIST }, // Option B
        ],
        completed: false,
    },
    reward: [BLINK, MAIERETH],
    onComplete: () => {
        // WORLD REACTION:
        ILIRE_FACTION.anger += 20; // Ilire now ambush you
        SPAWN_ENEMIES(ILIRE_ZEALOT, nearPlayer); // Retribution squad
    }
}

// When recruiting a bandit:
player.recruitedBandits.push({ id: BANDIT_JACK, formerGang: "RedClaws" });

// Later, during world traversal:
function checkAmbushes() {
    player.recruitedBandits.forEach(bandit => {
        if (Math.random() < 0.3) { // 30% chance per trip
            spawnAmbush(bandit.formerGang);
            // Log for save file:
            player.worldFlags.push(`AMBUSH_${bandit.formerGang}_PENDING`); 
        }
    });
}

const MAIER_FACTION = {
    trust: 0, // 0-100
    knownPlayers: [], // Track who you’ve helped/harmed
    globalBehavior: {
        hostility: "NEUTRAL", // Changes to "HOSTILE" if you betray them
        patrolRoutes: [] // Dynamically adjusted if they’re hunting you
    },
    update() {
        if (this.trust < 30) {
            SPAWN_ENEMIES(MAIER_ASSASSIN, nearPlayer);
        }
    }
};
*/

export const QUEST_TEMPLATES = [
    {
        name: [ACHREON_DRUID, AHNARE_APOSTLE, ANASHTRE, CAMBIREN_DRUID, CHIOMIC_JESTER, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, DORIEN, EUGENES, FANG_DUELIST, FANG_MERCENARY, FIEROUS, FIRESWORN, FYERS_OCCULTIST, GARRIS, ILIRE_OCCULTIST, KINGSMAN, KRECEUS, KYNGIAN_SHAMAN, KYRISIAN_OCCULTIST, LEAF, LIIVI_LEGIONNAIRE, MAIER_OCCULTIST, MARAUDER, MAVROSIN_OCCULTIST, MIRIO, NORTHREN_WANDERER, NYREN, OLD_LIIVI_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, RAHVREHCUR, SEDYRIST, SERA, SEVA_SHRIEKER, SHRYGEIAN_BARD, SOUTHRON_WANDERER, SYNAETHI, TORREOUS, TSHAERAL_SHAMAN, VINCERE],
        title: "Principles and Principalities",
        description: "The land is becoming profuse with the stain of enemies, please stem the tide and leave this place awash with their blood.",
        requirements: {
            description: "Defeat 5 enemies of the {name}, ingratiating yourself toward their cause.",
            technical: initFetch
        },
        reward: [ACHIRE, ARC, CHIOMISM, FROST, GRAPPLE, HOOK, ILIRECH, KYRNAICISM, KYRISIAN, LEAP, LIGHTNING, LIKYR, MAIERETH, PURSUIT, QUOR, RUSH, SACRIFICE, SHADOW, SHIMMER, SPRINT, STORM, SUTURE, TETHER]
    }, {
    //     name: [MARAUDER, SOUTHRON_WANDERER, FANG_MERCENARY, QUOREITE_OCCULTIST, QUOREITE_STALKER],
    //     title: "Lost Temple",
    //     description: "Travel deep into the jungle to find a hidden temple and explore its secrets.", 
    //     requirements: {
    //         description: "Discover the depths of the lost temple.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [MARK, RECALL],
    // }, {
        name: [ACHREON_DRUID, AHNARE_APOSTLE, ANASHTRE, CAMBIREN_DRUID, CHIOMIC_JESTER, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, DORIEN, EUGENES, FANG_DUELIST, FANG_MERCENARY, FIEROUS, FIRESWORN, FYERS_OCCULTIST, GARRIS, ILIRE_OCCULTIST, KINGSMAN, KRECEUS, KYNGIAN_SHAMAN, KYRISIAN_OCCULTIST, LEAF, LIIVI_LEGIONNAIRE, MAIER_OCCULTIST, MARAUDER, MAVROSIN_OCCULTIST, MIRIO, NORTHREN_WANDERER, NYREN, OLD_LIIVI_OCCULTIST, QUOREITE_OCCULTIST, QUOREITE_STALKER, RAHVREHCUR, SEDYRIST, SERA, SEVA_SHRIEKER, SHRYGEIAN_BARD, SOUTHRON_WANDERER, SYNAETHI, TORREOUS, TSHAERAL_SHAMAN, VINCERE],
        // name: [AHNARE_APOSTLE, ASTRAL_APOSTLE, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, ACHREON_DRUID, CAMBIREN_DRUID, SEVA_SHRIEKER, FIRESWORN, FYERS_OCCULTIST, LIIVI_LEGIONNAIRE, QUOREITE_OCCULTIST, SEDYRIST],
        title: "Replenish Firewater",
        description: "To walk in the land of hush and tendril and refill your flask, you must let it bleed--not of yourself but of our enemy.",
        requirements: {
            description: "Defeat 5 enemies of the {name} that are worthy of replenishing your flask of Fyervas Firewater.",
            technical: initFetch
        },
        reward: [BLINK, CHARM, CONFUSE, DESPERATION, DISPEL, FEAR, FREEZE, HEALING, MARK, NETHERSWAP, PARALYZE, POLYMORPH, RECALL, RECONSTITUTE, SHIRK, SLOW, SNARE],
    }, {
    //     name: [NORTHREN_WANDERER, SOUTHRON_WANDERER, NYREN, RAHVREHCUR, SEDYRIST, QUOREITE_STALKER],
    //     title: "Sunken Cities",
    //     description: "Explore the ruins of an ancient city, discovering and recovering its treasures.",
    //     requirements: {
    //         description: "Explore the depths of the sunken city.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [MARK, RECALL],
    // }, {
    //     name: [FANG_DUELIST, SHRYGEIAN_BARD, CHIOMIC_JESTER, LIIVI_LEGIONNAIRE, RAHVREHCUR],
    //     title: "The Murder of a Merchant",
    //     description: "Aid in the investigation of a murdered merchant that has occured recently. Find the culprit, and bring them to justice.",
    //     requirements: {
    //         description: "Solve the murder.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [BLINK, CHIOMIC, CHIOMISM, CONFUSE, ILIRECH, KYRISIAN, KYRNAICISM, LIKYR, MAIERETH, MYSTIFY, SHADOW],
    // }, {
    //     name: [MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST, EUGENES, GARRIS],
    //     title: "Mist of the Moon",
    //     description: "Ingratiate yourself with the Ma'ier, occultists of the Ma'anreic Moon, and gain their trust to understand the Blood Moon Prophecy.",
    //     requirements: {
    //         description: "Discover the Blood Moon Prophecy.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [BLINK, HOOK, MAIERETH, MALICE, PURSUIT, RUSH, SACRIFICE, SHIMMER], // Con, Str, Agi, Caer, Kyo
    // }, {
    //     name: [MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST, EUGENES, GARRIS],
    //     title: "Blessed Hunt",
    //     description: "Come frolicking with the Ma'ier in the Merriment of the night to the Mother Moon.",
    //     requirements: {
    //         completed: ["Mist of the Moon"],
    //         description: "Participate in a Blessed Hunt with the Ma'ier.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [BLINK, HOOK, MAIERETH, MALICE, PURSUIT, RUSH, SACRIFICE, SHIMMER, SPRINT], // Con, Str, Agi, Caer, Kyo
    // }, {
    //     name: [ILIRE_OCCULTIST, MAVROSIN_OCCULTIST, OLD_LIIVI_OCCULTIST],
    //     title: "Sheath of the Sun",
    //     description: "Ingratiate yourself with the Ilire, occultists of the Ilian Sun, and gain their trust to understand the Black Sun Prophecy.",
    //     requirements: {
    //         description: "Discover the Black Sun Prophecy.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ARC, HOOK, HOWL, ILIRECH, LEAP, MYSTIFY, SACRIFICE, SHIMMER, STORM],
    // }, {
    //     name: [ILIRE_OCCULTIST, MAVROSIN_OCCULTIST, OLD_LIIVI_OCCULTIST],
    //     title: "Blinding Hunt",
    //     description: "Steel yourself into the savage tshaering of the Ilire.",
    //     requirements: {
    //         completed: ["Mist of the Moon"],
    //         description: "Participate in a Blind Hunt with the Ilire.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ARC, HOOK, HOWL, ILIRECH, LEAP, MYSTIFY, SACRIFICE, SHIMMER, STORM],
    // }, {
    //     name: [ACHREON_DRUID, CAMBIREN_DRUID, LEAF, VINCERE, DORIEN],
    //     title: "The Cerchre",
    //     description: "Ingratiate yourself with the Cerchre, a loose collection of occult worshipers in the Northren provinces, and gain their trust to understand the Wild.",
    //     requirements: {
    //         description: "Discover and ingratiate yourself to the Cerchre and their adherence to the Wild.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ACHIRE, BLINK, HOWL, LEAP, MODERATE, MULTIFARIOUS, POLYMORPH, REIN, RUSH, WRITHE],
    // }, {
    //     name: [ACHREON_DRUID, CAMBIREN_DRUID],
    //     title: "Cerchre Writhing",
    //     description: "Find the way one can become more; adhere their caer to the bond of wild nature, and instantiate.",
    //     requirements: {
    //         completed: ["The Cerchre"],
    //         description: "Discover the ritual of the Cerchre and initiate.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ACHIRE, BLINK, HOWL, LEAP, MODERATE, MULTIFARIOUS, POLYMORPH, REIN, RUSH, WRITHE],
    // }, {
    //     name: [ANASHTRE, ACHREON_DRUID, AHNARE_APOSTLE, ASTRAL_APOSTLE, CAMBIREN_DRUID, FYERS_OCCULTIST, TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, KYRISIAN_OCCULTIST, DORIEN, MIRIO, QUOREITE_OCCULTIST, RAHVREHCUR, OLD_LIIVI_OCCULTIST, FIEROUS],
    //     title: "The Otherland", // Vildivor (The Vast WIlderness), Blutlache (Blood Pool), the Ascean, the Necropolitan, the Hushland, Tonaltzin (The Land of Sunsets), Tlalcaxiuh (The Land of the Sun Setting Moon), Vildevaor (The Black Lake), Tho'nasine, La'zolteal, Cho'mir Liesto (Lies to Eat)
    //     description: "Learn all the names of the Land of Hush and Tendril.",
    //     requirements: {
    //         description: "Discover all the terms of the otherland.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ABSORB, ENVELOP, MALICE, MENACE, MEND, MODERATE, MYSTIFY, PROTECT, RECOVER, REIN, SHIELD, WARD],
    // }, {
    //     name: [TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, DORIEN, MIRIO, RAHVREHCUR, OLD_LIIVI_OCCULTIST, FIEROUS],
    //     title: "The Land of Hush and Tendril",
    //     description: "Peer into this. Spoken as though not of this world, yet all the same it wraps. Do you wish this?",
    //     requirements: {
    //         completed: ["The Otherland"],
    //         description: "Discover a way to enter the Land of Hush and Tendril.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [DISPEL, ENVELOP, NETHERSWAP, QUOR, RECOVER, SHIRK],
    // }, {
    //     name: [TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, DORIEN, MIRIO, RAHVREHCUR, OLD_LIIVI_OCCULTIST, FIEROUS],
    //     title: "Shatter",
    //     description: "Are you ready to relax yourself, and give into the yearning other?",
    //     requirements: {
    //         completed: ["The Land of Hush and Tendril"],
    //         description: "Enter the Land of Hush and Tendril, and experience your wild caer.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [DISPEL, ENVELOP, NETHERSWAP, QUOR, RECOVER, SHIRK],
    // }, {
        
    //     name: [TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, DORIEN, MIRIO, RAHVREHCUR, OLD_LIIVI_OCCULTIST, FIEROUS],
    //     title: "Sleep",
    //     description: "Take the poultice and drink deeply, allow us to entwine our minds and step into the otherland.",
    //     requirements: {
    //         description: "Experience the otherland in your slumber.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ACHIRE, HOOK, PURSUIT, RUSH, SHADOW, SHIMMER, TETHER],
    // }, {
    //     name: [FYERS_OCCULTIST, FIRESWORN, TORREOUS, FIEROUS],
    //     title: "The Phoenix",
    //     description: "Learn more about the Phoenix and its origin of rebirth.",
    //     requirements: {
    //         description: "Discover the ritual of the Phoenix.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ABSORB, ACHIRE, FYERUS, QUOR, REIN, SACRIFICE],
    // }, {
    //     name: [AHNARE_APOSTLE, SYNAETHI, KRECEUS],
    //     title: "The Ahn'are",
    //     description: "Learn more about the Ahn'are, the soaring angels of Ahn've, and their origin of flight.",
    //     requirements: {
    //         description: "Discover the ritual Ahn'are ascension.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ACHIRE, ASTRAVE, BLINK],
    // }, {
    //     name: [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KINGSMAN, SERA, LIIVI_LEGIONNAIRE],
    //     title: "Seek Devotion",
    //     description: "Become initiated into the faith of Daethos.",
    //     requirements: {
    //         description: "Become Devoted to Daethos.",
    //         technical: initSolve,
    //         dialog: "I am stricken by the mercy of Laetrois, I give myself over to Daethos. I am no longer adherent to the past and primal, I am fully Devoted.",
    //         action: {
    //             key: "faith",
    //             value: "Devoted"
    //         },
    //         conditions: {
    //             key: "faith",
    //             operator: "=",
    //             value: "Adherent"
    //         }
    //     },
    //     reward: [CHIOMIC, DISEASE, FREEZE, FYERUS, HOWL, KYNISOS, RENEWAL, SCREAM, WRITHE],
    // }, {
    //     name: [ANASHTRE, AHNARE_APOSTLE, "Astral Apostle", KRECEUS],
    //     title: "Anashtre Ascension",
    //     description: "Seek information about the Anashtre and the ritual of the past to form the lightning wing of Astra.",
    //     requirements: {
    //         description: "Discover the ritual to ascend to an Anashtre.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ASTRAVE, BLINK, DISPEL, KYNISOS, PARALYZE, ROOT, RUSH, SHADOW, SHIRK, SPRINT],
    // }, {
    //     name: [ANASHTRE, AHNARE_APOSTLE, "Astral Apostle", KRECEUS],
    //     title: "Astrification",
    //     description: "Seek information about Astrification and the ritual of the past to form the lightning spear of Astra.",
    //     requirements: {
    //         description: "Discover the ritual of Astrification.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [ASTRAVE, BLINK, DISPEL, KYNISOS, PARALYZE, ROOT, RUSH, SHADOW, SHIRK, SPRINT],
    // }, {
    //     name: [OLD_LIIVI_OCCULTIST, CHIOMIC_JESTER, SHRYGEIAN_BARD],
    //     title: "Curse of the Ky'myr",
    //     description: "Track down the mystery behind the Ky'myr and its curse of ceaselessness.",
    //     requirements: {
    //         description: "Discover the source of the Ky'myr curse. Perhaps you will be allured by its thwarting of death itself, and seek means to become one.",
    //         technical: initSolve,
    //         dialog: "",
    //     },
    //     reward: [DISEASE, HOOK, KYRISIAN, KYRNAICISM, LIKYR, RENEWAL, SACRIFICE, SUTURE],
    // }, {
    //     name: [ANASHTRE, ACHREON_DRUID, AHNARE_APOSTLE, ASTRAL_APOSTLE, CAMBIREN_DRUID, FYERS_OCCULTIST, TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, KYRISIAN_OCCULTIST, QUOREITE_OCCULTIST, RAHVREHCUR, OLD_LIIVI_OCCULTIST],
    //     title: "Primal Nature",
    //     description: "Come over to the primal nature of your being and become Adherent.",
    //     requirements: {
    //         description: "Become Adherent to the Ancients.",
    //         technical: initSolve,
    //         dialog: "I am stricken with the ancient and the primal, I give myself to the Ancients and their ways.",
    //         action: {
    //             key: "faith",
    //             value: "Adherent"
    //         },
    //         conditions: {
    //             key: "faith",
    //             operator: "=",
    //             value: "Devoted"
    //         }
    //     },
    //     reward: [CHIOMIC, DISEASE, FREEZE, FYERUS, HOWL, KYNISOS, RENEWAL, SCREAM, WRITHE],
    // }, {
        name: [ANASHTRE, ACHREON_DRUID, AHNARE_APOSTLE, ASTRAL_APOSTLE, CAMBIREN_DRUID, FIRESWORN, FYERS_OCCULTIST, ILIRE_OCCULTIST, KYNGIAN_SHAMAN, KYRISIAN_OCCULTIST, MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST, QUOREITE_OCCULTIST, RAHVREHCUR, TSHAERAL_SHAMAN],
        title: "Adherence",
        description: "Bring back the devoted across the land toward the ancient worship.",
        requirements: {
            description: "Convert 5 Devoted to the worship of the Ancients.",
            technical: initFetch,
            dialog: "I am stricken with the ancient and the primal, I give myself to the Ancients and their ways.",
            action: {
                key: "_id",
                name: "convert",
                value: "Adherent"
            },
            conditions: {
                key: "faith",
                operator: "=",
                value: "Adherent"
            }
        },
        reward: [ASTRAVE, CHIOMIC, DESPERATION, DISEASE, FREEZE, FYERUS, HEALING, HOWL, KYNISOS, RENEWAL, SCREAM, WRITHE, ABSORB, ENVELOP, MALICE, MENACE, MEND, MODERATE, MULTIFARIOUS, MYSTIFY, PROTECT, RECONSTITUTE, RECOVER, REIN, SHIELD, WARD],
        prayer: SPECIAL_PRAYERS
    }, {
        name: [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, KINGSMAN, SERA, LIIVI_LEGIONNAIRE],
        title: "Providence",
        description: "Aid in the proliferation of Daethos across the land.",
        requirements: {
            description: "Proselytize 5 Adherent to the faith of Daethos.",
            technical: initFetch,
            dialog: "I am stricken by the mercy of Laetrois, I give myself over to Daethos. I am no longer adherent to the past and primal, I am fully Devoted.",
            action: {
                key: "_id",
                name: "convert",
                value: "Devoted"
            },
            conditions: {
                key: "faith",
                operator: "=",
                value: "Devoted"
            }
        },
        reward: [ASTRAVE, CHIOMIC, DESPERATION, DISEASE, FREEZE, FYERUS, HEALING, HOWL, KYNISOS, RENEWAL, SCREAM, WRITHE, ABSORB, ENVELOP, MALICE, MENACE, MEND, MODERATE, MULTIFARIOUS, MYSTIFY, PROTECT, RECONSTITUTE, RECOVER, REIN, SHIELD, WARD],
        prayer: SPECIAL_PRAYERS
    }
]
export const getQuests = (name: string) => {
    return QUEST_TEMPLATES.filter(quest => quest.name.includes(name));
};

export const getQuest = (title: string, enemy: Ascean, ascean: Ascean, settings: Settings): Quest | undefined => {
    try {
        const template = QUEST_TEMPLATES.filter(quest => quest.title === title)[0];
        let rewards = template.reward.filter((r: string) => SPECIAL[ascean.mastery].includes(r) && !settings.totalSpecials.includes(r));
        let prayer = "";
        if (template.prayer) {
            const prayers = settings.prayers ? SPECIAL_PRAYERS.filter((p: string) => settings.prayers.includes(p)) : SPECIAL_PRAYERS;
            prayer = prayers[Math.floor(Math.random() * prayers.length)];
        };
        const prospect: Prospect = {
            giver: enemy,
            mastery: enemy.mastery,
            title: template.title,
            description: template.description,
            requirements: {
                level: enemy.level,
                reputation: enemy.level * 5,
                description: template.requirements.description,
                technical: template.requirements.technical,
                action: template.requirements?.action,
                dialog: template.requirements?.dialog,
                conditions: template.requirements?.conditions
            },
            rewards,
            prayer   
        };
        return new Quest(prospect);
    } catch (err) {
        console.warn(err, "Error Getting Quest");
    };
};