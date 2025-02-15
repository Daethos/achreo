import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { ACHREON_DRUID, AHNARE_APOSTLE, CAMBIREN_DRUID, CHIOMIC_JESTER, DAETHIC_INQUISITOR, DAETHIC_KNIGHT, DORIEN, EUGENES, FANG_DUELIST, FANG_MERCENARY, FIEROUS, FIRESWORN, FYERS_OCCULTIST, GARRIS, ILIRE_OCCULTIST, KRECEUS, KYNGIAN_SHAMAN, LEAF, MAIER_OCCULTIST, MARAUDER, MAVROSIN_OCCULTIST, MIRIO, NORTHREN_WANDERER, NYREN, OLD_LIIVI_OCCULTIST, QUOREITE_OCCULTIST, RAHVREHCUR, Reputation, SEDYRIST, SERA, SEVA_SHRIEKER, SHRYGEIAN_BARD, SOUTHRON_WANDERER, SYNAETHI, TORREOUS, TSHAERAL_SHAMAN, VINCERE } from "./player";
const QUESTING = {
    PLAYER_THRESHOLD_ONE: 4,
    PLAYER_THRESHOLD_TWO: 8,
    EXPERIENCE_MULTIPLIER: 500,
    SILVER_ADDED: 25,
    SILVER_MULTIPLIER: 10,
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

export const initQuests = new QuestManager('quest');
export const createQuests = (id: string): QuestManager => new QuestManager(id);

export class Quest {
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
    };
    public reward: {
        currency: { silver: number, gold: number },
        experience: number,
        items: Equipment[] | string[] | undefined
    };
    constructor(quest: any) {
        this.title = quest.title;    
        this.description = this.getDescription(quest);
        this.giver = quest.giver.name;
        this.level = quest.giver.level;
        this.mastery = quest.giver.mastery;
        this.requirements = quest.requirements;
        this.reward = this.getReward(quest);
    };

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
        const article = ['a', 'e', 'i', 'o', 'u'].includes(quest.giver.name[0].toLowerCase()) ? "an" : "a";
        const namelessDescriptors = ["druid", "shaman", "apostle", "jester", "occultist", "stalker", "guard", "knight", "daethic", "bard", "kingsman", "firesword", "shrieker", "northren", "southron", "marauder", "fang", "soldier", "soverain", "rahvrecur", "se'dyrist", "nyren"];
        const nameParts = quest.giver.name.toLowerCase().split(" ");
        const hasDescriptor = nameParts.some((part: string) => namelessDescriptors.includes(part));
        const nameless = hasDescriptor ? true : false;
        const description = `${quest.description}. You have been tasked with ${quest.title} by ${nameless ? article + ' ' : ''}${quest.giver.name}.`;
        return description;
    };

    private getExperience(level: number) {
        const experience = level * QUESTING.EXPERIENCE_MULTIPLIER;
        return experience;
    };

    private getItems(level: number) {
        const choices = ['Weapon', 'Weapon', 'Weapon', 'Armor', 'Armor', 'Armor', 'Jewelry', 'Shield'];
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
            experience: this.getExperience(quest.giver.level)
        };
    };
};

export const QUEST_TEMPLATES = [
    {
        name: [MARAUDER, SOUTHRON_WANDERER, FANG_MERCENARY, QUOREITE_OCCULTIST],
        title: "Lost Temple",
        description: "Travel deep into the jungle to find a hidden temple and explore its secrets", 
        requirements: {
            description: `Discover the depths of the lost temple.`,
            technical: ``
        },
    }, {
        name: [TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, ACHREON_DRUID, CAMBIREN_DRUID, SEVA_SHRIEKER, FYERS_OCCULTIST],
        title: "Replenish Firewater",
        description: "To walk in the land of hush and tendril and refill your flask, you must let it bleed--not of yourself but of our enemy",
        requirements: {
            description: `Kill 10 enemies of the {name} that are worthy of replenishing your flask of Fyervas Firewater.`,
            technical: ``
        },
    }, {
        name: [NORTHREN_WANDERER, SOUTHRON_WANDERER, NYREN, RAHVREHCUR, SEDYRIST],
        title: "Sunken Cities",
        description: "Explore the ruins of an ancient city and discover its treasures",
        requirements: {
            description: `Explore the depths of the sunken city.`,
            technical: ``
        },
    }, {
        name: [FANG_DUELIST, SHRYGEIAN_BARD, CHIOMIC_JESTER],
        title: "The Murder of a Merchant",
        description: "Aid in the investigation of a murder that occured recently",
        requirements: {
            description: "Solve the murder.",
            technical: ``
        },
    }, {
        name: [MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST, EUGENES, GARRIS],
        title: "Mist of the Moon",
        description: "Ingratiate yourself with the Ma'ier and gain their trust to understand the Blood Moon Prophecy",
        requirements: {
            description: `Discover the Blood Moon Prophecy.`,
            technical: ``
        },
    }, {
        name: [MAIER_OCCULTIST, OLD_LIIVI_OCCULTIST, EUGENES, GARRIS],
        title: "Blessed Hunt",
        description: "Come frolicking with the Ma'ier in the Merriment of the night to the Mother Moon",
        requirements: {
            completed: ["Mist of the Moon"],
            description: `Participate in a Blessed Hunt with the Ma'ier.`,
            technical: ``
        },
    }, {
        name: [ILIRE_OCCULTIST, MAVROSIN_OCCULTIST, OLD_LIIVI_OCCULTIST],
        title: "Sheath of the Sun",
        description: "Ingratiate yourself with the Ilire and gain their trust to understand the Black Sun Prophecy",
        requirements: {
            description: `Discover the Black Sun Prophecy.`,
            technical: ``
        },
    }, {
        name: [ILIRE_OCCULTIST, MAVROSIN_OCCULTIST, OLD_LIIVI_OCCULTIST],
        title: "Blinding Hunt",
        description: "Steel yourself into the savage tshaering of the Ilire.",
        requirements: {
            completed: ["Mist of the Moon"],
            description: `Participate in a Blind Hunt with the Ilire.`,
            technical: ``
        },
    }, {
        name: [ACHREON_DRUID, CAMBIREN_DRUID, LEAF, VINCERE, DORIEN],
        title: "The Cerchre",
        description: "Ingratiate yourself with the Cerchre, a loose collection of occult worshipers in the Northren provinces, and gain their trust to understand the Wild",
        requirements: {
            description: `Discover and ingratiate yourself to the Cerchre and their adherence to the Wild.`,
            technical: ``
        },
    }, {
        name: [ACHREON_DRUID, CAMBIREN_DRUID],
        title: "Cerchre Writhing",
        description: "Find the way one can become more; adhere their caer to the bond of wild nature, and instantiate.",
        requirements: {
            completed: ["The Cerchre"],
            description: `Discover the ritual of the Cerchre and initiate.`,
            technical: ``
        },
    }, {
        name: [TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, DORIEN, MIRIO, RAHVREHCUR, OLD_LIIVI_OCCULTIST, FIEROUS],
        title: "The Land of Hush and Tendril",
        description: "Peer into this. Spoken as though not of this world, yet all the same it wraps. Do you wish this?",
        requirements: {
            description: `Discover a way to enter the Land of Hush and Tendril.`,
            technical: ``
        },
    }, {
        name: [TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, DORIEN, MIRIO, RAHVREHCUR, OLD_LIIVI_OCCULTIST, FIEROUS],
        title: "Shatter",
        description: "Are you ready to relax yourself, and give into the yearning other?",
        requirements: {
            description: `Enter the Land of Hush and Tendril, and experience your wild caer.`,
            technical: ``
        },
    }, {
        
        name: [TSHAERAL_SHAMAN, KYNGIAN_SHAMAN, DORIEN, MIRIO, RAHVREHCUR, OLD_LIIVI_OCCULTIST, FIEROUS],
        title: "Sleep",
        description: "Take the poultice and drink deeply, allow us to entwine our minds and step into the otherland",
        requirements: {
            description: `Experience the otherland in your slumber.`,
            technical: ``
        },
    }, {
        name: [FYERS_OCCULTIST, FIRESWORN, TORREOUS, FIEROUS],
        title: "The Phoenix",
        description: "Learn more about the Phoenix and its origin of rebirth",
        requirements: {
            description: `Discover the ritual of the Phoenix.`,
            technical: ``
        },
    }, {
        name: [AHNARE_APOSTLE, SYNAETHI, KRECEUS],
        title: "The Ahn'are",
        description: "Learn more about the Ahn'are, the soaring angels of Ahn've, and their origin of flight",
        requirements: {
            description: `Discover the ritual Ahn'are ascension.`,
            technical: ``
        },
    }, {
        name: [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, SERA],
        title: "Seek Devotion",
        description: "Become initiated into the faith of Daethos",
        requirements: {
            description: `Become Devoted to Daethos.`,
            technical: ``
        },
    }, {
        name: ["Anashtre", AHNARE_APOSTLE, "Astral Apostle", KRECEUS],
        title: "Anashtre Ascension",
        description: "Seek information about the Anashtre and the ritual of the past to form the lightning wing of Astra",
        requirements: {
            description: `Discover the ritual to ascend to an Anashtre.`,
            technical: ``
        },
    }, {
        name: ["Anashtre", AHNARE_APOSTLE, "Astral Apostle", KRECEUS],
        title: "Astrification",
        description: "Seek information about Astrification and the ritual of the past to form the lightning spear of Astra",
        requirements: {
            description: `Discover the ritual of Astrification.`,
            technical: ``
        },
    }, {
        name: [OLD_LIIVI_OCCULTIST, CHIOMIC_JESTER, SHRYGEIAN_BARD],
        title: "Curse of the Ky'myr",
        description: "Track down the mystery behind the Ky'myr and its curse of ceaselessness.",
        requirements: {
            description: `Discover the source of the Ky'myr curse.`,
            technical: ``
        },
    }, {
        name: [DAETHIC_INQUISITOR, DAETHIC_KNIGHT, SERA],
        title: "Providence",
        description: "Aid in the proliferation of Daethos across the land",
        requirements: {
            description: `Proselytize 10 Adherent to the faith of Daethos.`,
            technical: ``
        },
    }
]
export const getQuests = (name: string) => {
    return QUEST_TEMPLATES.filter(quest => quest.name.includes(name));
};

export const getQuest = (title: string, enemy: Ascean, reputation: Reputation) => {
    try {
        const quest = QUEST_TEMPLATES.filter(quest => quest.title === title)[0];
        const rep = reputation?.factions?.find(faction => faction.name === enemy.name)?.reputation ?? 0;
        const prospect = {
            giver: enemy,
            mastery: enemy.mastery,
            title: quest.title,
            description: quest.description,
            requirements: {
                level: enemy.level,
                reputation: rep + (enemy.level * 2),
                description: quest.requirements.description,
            }
        };
        return new Quest(prospect);
    } catch (err) {
        console.warn(err, 'Error Getting Quest');
    };
};