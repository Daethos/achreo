import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Reputation } from "./player";
const QUESTING = {
    PLAYER_THRESHOLD_ONE: 4,
    PLAYER_THRESHOLD_TWO: 8,
    EXPERIENCE_MULTIPLIER: 500,
    SILVER_ADDED: 25,
    SILVER_MULTIPLIER: 10,
};
export default class Quest {
    public _id: string;
    public title: string;
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


    constructor(id: string, quest: any) {
        this._id = id;
        this.title = quest.title;    
        this.description = this.getDescription(quest);
        this.giver = quest.giver.name;
        this.level = quest.giver.level;
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
        return level * QUESTING.EXPERIENCE_MULTIPLIER;
    };

    private getItems(level: number) {
        const choices = ['Weapon', 'Armor', 'Jewelry', 'Shield'];
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
        name: ["Marauder", "Southron Wanderer", "Fang Mercenary", "Quor'eite Occultist"],
        title: "Lost Temple",
        description: "Travel deep into the jungle to find a hidden temple and explore its secrets", 
        requirements: {
            description: `Discover the depths of the lost temple.`,
        },
    }, {
        name: ["Tshaeral Shaman", "Kyn'gian Shaman", "Achreon Druid", "Cambiren Druid", "Se'va Shrieker", "Fyers Occultist"],
        title: "Replenish Firewater",
        description: "To walk in the land of hush and tendril and refill your flask, you must let it bleed--not of yourself but of our enemy",
        requirements: {
            description: `Kill 10 enemies of the {name} that are worthy of replenishing your flask of Fyervas Firewater.`,
        },
    }, {
        name: ["Northren Wanderer", "Southron Wanderer", "Nyren", "Rahvrecur", "Se'dyrist"],
        title: "Sunken Cities",
        description: "Explore the ruins of an ancient city and discover its treasures",
        requirements: {
            description: `Explore the depths of the sunken city.`,
        },
    }, {
        name: ["Fang Duelist", "Shrygeian Bard", "Chiomic Jester"],
        title: "The Murder of a Merchant",
        description: "Aid in the investigation of a murder that occured recently",
        requirements: {
            description: "Solve the murder.",
        },
    }, {
        name: ["Ma'ier Occultist", "Old Li'ivi Occultist", "Eugenes", "Garris Ashenus"],
        title: "Mist of the Moon",
        description: "Ingratiate yourself with the Ma'ier and gain their trust to understand the Blood Moon Prophecy",
        requirements: {
            description: `Discover the Blood Moon Prophecy.`,
        },
    }, {
        name: ["Ma'ier Occultist", "Old Li'ivi Occultist", "Eugenes", "Garris Ashenus"],
        title: "Blessed Hunt",
        description: "Come frolicking with the Ma'ier in the merriment of the night to their mooon mother.",
        requirements: {
            completed: ["Mist of the Moon"],
            description: `Participate in a Blessed Hunt with the Ma'ier.`,
        },
    }, {
        name: ["Ilire Occultist", "Old Li'ivi Occultist"],
        title: "Sheath of the Sun",
        description: "Ingratiate yourself with the Ilire and gain their trust to understand the Black Sun Prophecy",
        requirements: {
            description: `Discover the Black Sun Prophecy.`,
        },
    }, {
        name: ["Ilire Occultist", "Old Li'ivi Occultist"],
        title: "Blinding Hunt",
        description: "Steel yourself into the savage tshaering of the Ilire.",
        requirements: {
            completed: ["Mist of the Moon"],
            description: `Participate in a Blind Hunt with the Ilire.`,
        },
    }, {
        name: ["Achreon Druid", "Cambiren Druid", "Leaf", "Vincere", "Jadei Myelle", "Dorien Caderyn"],
        title: "The Caerchre",
        description: "Ingratiate yourself with the Caerchre, a loose collection of occult worshipers in the Northren provinces, and gain their trust to understand the Wild",
        requirements: {
            description: `Discover and ingratiate yourself to the Caerchre and their adherence to the Wild.`,
        },
    }, {
        name: ["Achreon Druid", "Cambiren Druid"],
        title: "Caerchre Writhing",
        description: "Find the way one can become more; adhere their caer to the bond of wild nature, and instantiate.",
        requirements: {
            completed: ["The Caerchre"],
            description: `Discover the ritual of the Caerchre and initiate.`,
        },
    }, {
        name: ["Tshaeral Shaman", "Kyn'gian Shaman", "Dorien Caderyn", "Mirio", "Rahvrecur", "Old Li'ivi Occultist", "Fierous Ashfyre"],
        title: "The Land of Hush and Tendril",
        description: "Peer into this. Spoken as though not of this world, yet all the same it wraps. Do you wish this?",
        requirements: {
            description: `Discover a way to enter the Land of Hush and Tendril.`,
        },
    }, {
        name: ["Tshaeral Shaman", "Kyn'gian Shaman", "Dorien Caderyn", "Mirio", "Rahvrecur", "Old Li'ivi Occultist", "Fierous Ashfyre"],
        title: "Shatter",
        description: "Are you ready to relax yourself, and give into the yearning other?",
        requirements: {
            description: `Enter the Land of Hush and Tendril, and experience your wild caer.`,
        },
    }, {
        
        name: ["Tshaeral Shaman", "Kyn'gian Shaman", "Dorien Caderyn", "Mirio", "Rahvrecur", "Old Li'ivi Occultist", "Fierous Ashfyre"],
        title: "Sleep",
        description: "Take the poultice and drink deeply, allow us to entwine our minds and step into the otherland.",
        requirements: {
            description: `Experience the otherland in your slumber.`,
        },
    }, {
        name: ["Fyers Occultist", "Firesworn", "Torreous Ashfyre", "Fierous Ashfyre"],
        title: "The Phoenix",
        description: "Learn more about the Phoenix and its origin of rebirth",
        requirements: {
            description: `Discover the ritual of the Phoenix.`,
        },
    }, {
        name: ["Ahn'are Apostle", "Synaethis Spiras", "Kreceus", "Ah'gani Descaer"],
        title: "The Ahn'are",
        description: "Learn more about the Ahn'are, the soaring angels of Ahn've, and their origin of flight",
        requirements: {
            description: `Discover the ritual Ahn'are ascension.`,
        },
    }, {
        name: ["Daethic Inquisitor", "Daethic Knight", "Lorian", "Mavros Ilios", "Sera Lorian"],
        title: "Seek Devotion",
        description: "Become initiated into the faith of Daethos",
        requirements: {
            description: `Become Devoted to Daethos.`,
        },
    }, {
        name: ["Anashtre", "Ahn'are Apostle", "Astral Apostle", "Kreceus", "Ah'gani Descaer"],
        title: "Anashtre Ascension",
        description: "Seek information about the Anashtre and the ritual of the past to form the lightning wing of Astra",
        requirements: {
            description: `Discover the ritual to ascend to an Anashtre.`,
        },
    }, {
        name: ["Anashtre", "Ahn'are Apostle", "Astral Apostle", "Kreceus", "Ah'gani Descaer"],
        title: "Astrification",
        description: "Seek information about Astrification and the ritual of the past to form the lightning spear of Astra",
        requirements: {
            description: `Discover the ritual of Astrification.`,
        },
    }, {
        name: ["Old Li'ivi Occultist", "Chiomic Jester", "Shrygeian Bard", "Tshios Ash'air"],
        title: "Curse of the Ky'myr",
        description: "Track down the mystery behind the Ky'myr and its curse of ceaselessness.",
        requirements: {
            description: `Discover the source of the Ky'myr curse.`,
        },
    }, {
        name: ["Daethic Inquisitor", "Daethic Knight", "Lorian", "Mavros Ilios", "Sera Lorian"],
        title: "Providence",
        description: "Aid in the proliferation of Daethos across the land",
        requirements: {
            description: `Proselytize 10 Adherent to the faith of Daethos.`,
        },
    }
]
export const getQuests = (name: string) => {
    return QUEST_TEMPLATES.filter(quest => quest.name.includes(name));
};

export const getQuest = async (id: string, enemy: Ascean, reputation: Reputation) => {
    try {
        const thisQuest = getQuests(enemy.name);
        const template = thisQuest[Math.floor(Math.random() * thisQuest.length)];
        // Get repuation().factions.find(faction => faction.name === enemy.faction).reputation
        const rep = reputation?.factions?.find(faction => faction.name === enemy.name)?.reputation ?? 0;
        const prospect = {
            giver: enemy,
            title: template.title,
            description: template.description,
            requirements: {
                level: enemy.level,
                reputation: rep,
                description: template.requirements.description,
            }
        };
        return new Quest(id, prospect);
    } catch (err) {
        console.warn(err, 'Error Getting Quest');
    };
};