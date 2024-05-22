import Ascean from "../models/ascean";
import Equipment from "../models/equipment";
import { Reputation } from "./player";

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
        items: Equipment[] | string[] | null
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
        currency.silver = Math.floor(Math.random() * (level * 10) + 25);
        if (currency.silver > 100) {
            currency.gold = Math.floor(currency.silver / 100);
            currency.silver = currency.silver % 100;
        };
        if (level > 8) {
            currency.gold += Math.floor(Math.random() * (level - 6) + 1);
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
        return level * 1000;
    };

    private getItems(level: number) {
        const choices = ['Weapon', 'Armor', 'Jewelry', 'Shield'];
        const items = [];
        items.push(choices[Math.floor(Math.random() * choices.length)]);
        if (level > 5) {
            items.push(choices[Math.floor(Math.random() * choices.length)]);
        };
        if (level > 10) {
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
        name: ["Ilire Occultist", "Old Li'ivi Occultist"],
        title: "Sheath of the Sun",
        description: "Ingratiate yourself with the Ilire and gain their trust to understand the Black Sun Prophecy",
        requirements: {
            description: `Discover the Black Sun Prophecy.`,
        },
    }, {
        name: ["Achreon Druid", "Cambiren Druid"],
        title: "The Draochre",
        description: "Ingratiate yourself with the Druids and gain their trust to understand the Wild",
        requirements: {
            description: `Discover the ritual of the Draochre and their adherence to the Wild.`,
        },
    }, {
        name: ["Tshaeral Shaman", "Kyn'gian Shaman", "Dorien Caderyn", "Mirio"],
        title: "The Land of Hush and Tendril",
        description: "Peer into this. Spoken as though not of this world, yet all the same it wraps. Do you wish this?",
        requirements: {
            description: `Discover a way to enter the Land of Hush and Tendril.`,
        },
    }, {
        name: ["Fyers Occultist", "Firesworn", "Torreous Ashfyre", "Fierous Ashfyre"],
        title: "The Phoenix",
        description: "Learn more about the Phoenix and its origin of rebirth",
        requirements: {
            description: `Discover the ritual of the Phoenix.`,
        },
    }, {
        name: ["Ahn'are Apostle", "Synaethis Spiras", "Kreceus"],
        title: "The Ahn'are",
        description: "Learn more about the Ahn'are and their origin of flight",
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
        name: ["Anashtre", "Ahn'are Apostle", "Astral Apostle", "Kreceus"],
        title: "Anashtre Ascension",
        description: "Seek information about the Anashtre and the ritual of the past to form the lightning wing of Astra",
        requirements: {
            description: `Discover the ritual to ascend to an Anashtre.`,
        },
    }, {
        name: ["Old Li'ivi Occultist", "Chiomic Jester", "Shrygeian Bard"],
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