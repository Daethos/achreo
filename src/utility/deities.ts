import { getAscean, updateAscean } from "../assets/db/db";
import { Statistics } from "./statistics";

export const DEITIES = {
    Daethos: {
        name: "Daethos",
        description: "The One True God awaiting man in the Land of Hush and Tendril, the Arbiter of the Caer.",
        origin: "Thought to be Licivitas as the Good Lorian founded the Seyr in the city of his namesake. However, the origin of its prophet, Laetrois Ath'Shaorah, is unknown.",
        favor: "Caeren",
        worship: "Charity and Penance, for whether born bastard or regal, man or woman, gifted or afflicted, it is the duty in what one can bear and manifest greater, that will carry forward in his lineage and those around him. The Good may only be birthed through the individual, his ascertainment of the truth as evidenced through the perception of the world around him, and for that right may it converge and coalesce to his brothers on the whole.",
    },
    Achreo: {
        name: "Achreo, the Wild Ancient",
        description: "Not much is known or remembered of Acheo in his ways with humans, nor how the title came to suit him. It is currently believed that he were apathetic towards human struggle and resigned to his own meditations.",
        origin: "Achreo tended to move about in the Northren lands, before it was settled as the Achreon Kingdom and the Soverains. Is used as the colloquial term for a bastard of the Achreon Kingdom, Achreo.",
        favor: "Achre",
        worship: "Multiple shrines were built throughout the land in homage for the Wild Ancient’s favor, keeping the surrounding areas undisturbed as recompense for the resources used in building said monuments. Unsure if this were the best measure to showcase their faithfulness to Achreo. The Draochre of Druids clamored to his favor as well, as most orations and written scrolls tend to adhere to this perception. Human sacrifice was prevalent as well in seeking virtue and favor.",
    },
    "Ahn've": {
        name: "Ahn've, the Ancient of the Wind",
        description: "Said to have been capricious, never comfortable with her choice of setting. She made due with gaining followers wherever she resided for a time, having sprinkled about places of worship and reverence near every stretch. This pleased her, but never for long, and would venture off every so often, eventually to return, before taking leave once more. Thought to be the lover of Shrygei, though perhaps may have been only the target of his affections.",
        origin: "Not one for the stagnation and sedentary lifestyle, she moved about the realm to her own whims and queries, thereby reigning in no one place in particular.",
        favor: "Caeren",
        worship: "It was never certain whom she preferred in her stead, those who worshiped Ahn've, with her feminine beauty, statuesque body and wings that could spread thrice-fold her own length, or the birds she grew a kinship with, for they were the only ones who could see the grandiosity of nature in the skies. Nevertheless, wherever she went, she was welcomed and placated to, having many statues of her divinity set about the land, typically up hillsides and mountain pathings.",
    },
    Astra: {
        name: "Astra, the Ancient of Lightning",
        description: "As twisted and moody as her storms, like a suffocating mother that slapped her children for their rowdiness then held them close to wipe away the tears. She was good to them when they obeyed, and wrothful when not. Didn’t like her followers leaving the land, or strangers entering without due consent.",
        origin: "The Astralands is where the seat of this Ancient was held. Associated with the othernatural Tshios and the Anashtre. Is used as a colloquial term for a bastard's surname of the Spine, Astra.",
        favor: "Achre",
        worship: "Obeisance of the utmost, with lavish praise and show their devotion in the form of children. Not gifts and sacrifice, it let her know they followed her wishes.",
    },
    Cambire: {
        name: "Cambire, the Potential Ancient",
        description: "Cambire was rarely seen in proper visage, and tended to speak to its followers in long-form poetry and speech behind his sacred walls. Had scarce communication with other Ancients as well, and only had direct contact with Achreo, Kyr’na and Lilos on occasion.",
        origin: "Idea of an Ancient being worshipped through the lighting of a brazier at it’s statue and it igniting incense attuned to the land of hush and tendril. These were housed at what are now the city-states known as the Teeth of the West Fangs.",
        favor: "Caeren",
        worship: "One of the less revered of the Ancients, the few who followed Dynitho led a life of understanding that their ultimate fruition were held in their own hands and not succumbing to the virtue of their given bloodline.",
    },
    Chiomyr: {
        name: "Chiomyr, the Ancient of Humor",
        description: "Often regarded as the patron of entertainment, coupled with Shrygei, he spent his time when regaling his followers, and even those not under his tutelage, with various musings, jests, and points of mockery--to the delights of the crowds gathering and himself most of all. He hadn’t the inclination to take much of anything serious, and is even said to have dying laughing, one last jape for the world he left behind.",
        origin: "Associated with the creation (albeit tongue-in-cheek) of Kobalos. This appears to be more of a legend concerning the unfortunate creature, though it is no less heralded as common wisdom due to Chiomyr’s seat of power being established near the same place as these folk reside even now, in various regions south of the Northren Lords. Also associated with the infamous tales of the Synacyn and the Ky'myr.",
        favor: "Kyosir",
        worship: "Merely engaging with the Ancient was well enough of a form of homage, as his restless nature afforded him the ability to send barbs and jest with those who were not soft of heart or mind. It swelled his to have the company to participate in such ruses, and his long memory never forewent a face who aided in his pleasure.",
    },
    Fyer: {
        name: "Fyer, the Ancient of Fire",
        description: "Despite his nature, there were many testimonies to the relaxed and carefree attitude of Fyer. Orators from time immemorial recall ideas leading to this behavior being that his passions were worn outside his internal being, therefore it never exuded outside himself from a place harbored within.",
        origin: "While the Southron lands, namely what came to be known as the Firelands were considered more akin to his likeness and sensibilities--much in the way due to finding many statues of worship to him specifically there, he did partake in travels of a kind toward the Northren lands, bringing him with warmth and joy wherever he strode. Is used as the colloquial term for a bastard of Westoth, Fyer.",
        favor: "Caeren",
        worship: "Despite being attributed to the Ancient of Fire, he wasn’t looking to be paid homage in forms of sacrifice. On the contrary he appeared to be an Ancient of the people, and took part in society more so than many of his brethren, having granted man the gift of fire as one of the more famous tales mention.",
    },
    Ilios: {
        name: "Ilios, the Sun Ancient",
        description: "One of the chief Ancients, it shared a half of the same whole as Ma’anre, with Ilios being the stern sentinel that posted and held the evils at bay for the world and humanity to exist and thrive. Not much was known as to his disposition however, as he tended to stay at a distance from his followers.",
        origin: "One of the more universal worships of an Ancient, their seat stemmed the full breadth of the realm. Is used as the colloquial term for a bastard of the Soverains, Ilios.",
        favor: "Strength",
        worship: "Cultivation and direct communion with the Ancient was forbidden unless strict consent were given from his stewards. Placating to his honor in the form of statues, buildings and entire settlements seemed to appease Ilios, though his favor was held in some regions more than others.",
    },
    "Kyn'gi": {
        name: "Kyngi, the Ancient of Hunt",
        description: "Those who were not adherent to these beliefs were in turn hunted and slain, whether by a follower or Kyn’gi himself, it was not known. Strict, unwavering yet ever faithful to those who were faithful to himself.",
        origin: "Wherever one would find the concept of pursuit of the hunt worthy, is where one would find him wandering and traveling. Believed to be worshipped by the Cragore to this day, and would reside where they are found as well. Commonly associated with the othernatural human hybrid Morath and Cerchre, as they’re renowned for actively hunting man and taking maiden’s for their carnal lust.",
        favor: "Agility",
        worship: "A hardened code of ethics forged in the wake of the discovery to slay fair and honorable game. Understanding of and practice was all necessary to portray an adherence to Kyn’gi.",
    },
    Kyrisos: {
        name: "Kyrisos, the Ancient of Gold",
        description: "One of the most dynamic and charming of Ancients, Kyrisos was well received by many followers even outside his own worship. To this day, many people use his goods as homage.",
        origin: "Kyrisos’ seat of power ranged in various places through the land, gaining many followers from place to place, even those traveling enroute toward destinations of other Ancients. Due to this, you may find monuments to his likeness in every division of the realm.",
        favor: "Kyosir",
        worship: "Kyrisos wasn’t one to be placated through dreary appeasements such as utter devotion and forsaking all that life were to offer an individual. The things other Ancient’s seemed to prefer he’d quip, instead enjoying the livelihood and rambunctious nature of humanity, engaging with them on a more personal level and being apart of their festivals, parades, markets, plays, rituals and more.",
    },
    "Kyr'na": {
        name: "Kyr'na, the Ancient of Time",
        description: "A beautiful and charming Ancient that caused a spell-bound effect on those who gazed upon her. Was said to stop time herself when immersed in thought and conversation with a follower.",
        origin: "Kyr’na has been thought to have lived near the central lands of the realm, darting between what we now call the West Fangs, Licivitas, the Firelands, and Sedyrus, due to the abrogation of various statues in her honor.",
        favor: "Consitution",
        worship: "Mortal gifts and reverence were seen as principal ways to appease Kyr’na, for she loved life, beauty and adolescence. Took the offerings of her followers in the form of their children, wives, husbands, or animals.",
    },
    Lilos: {
        name: "Lilos, the Ancient of Life",
        description: "She embodied the role of the dutiful and loving mother, to her children across the land. She was graceful, caring, nurturing, understanding, and ever vigilant to push her followers toward something greater in their lives which she had bestowed upon to them, and all others it was said.",
        origin: "Lilos hadn’t been known to stay in any one place long, though it seems her statues and monuments to her nature have been found still at the Northren and Southron ends of the realm, from above the great ranges to below the Teeth.",
        favor: "Consitution",
        worship: "One of the more popular and loved Ancients, Lilos was worshiped in near every way a person had believed to seek favor from an Ancient. People built places of worship, they made pilgrimages towards her sites, threw celebrations and festivals, dancing and loving throughout the nights during the change of seasons. The only way she disavowed was of relation to any form of sacrifice, regardless of the consent of the individual offering themself over to Lilos.",
    },
    "Ma'anre": {
        name: "Ma'anre, the Moon Ancient",
        description: "Ma’anre was present, protective and ever watchful of her children, always ready to bless her followers with a soft, caring glow. Translation of Ma’anre tends to coalesce with the term ‘Mother’.",
        origin: "One of the more universal worships of an Ancient, their seat stemmed the full breadth of the realm.",
        favor: "Agility",
        worship: "Cultivation and direct communion with the Ancient during the risen Moon’s gaze. At times when not present during such phases, requests of sacrifice were set to reach the Moon above.",
    },
    Nyrolus: {
        name: "Nyrolus, the Ancient of the Water",
        description: "Due to his peculiar qualities, he most appreciated the Octopus, over any fish in the sea. He saw their brilliance as predators, thieves, and problem-solvers. With this, when it came time to forge a being that would herald his victory in the coming war, Nyrolus forged the Kraken, an octopus swelled to monstrous proportions.",
        origin: "Nyrolus is believed to be instrumental in forging what are now many of the major port-cities around the realm. Seems to have been heralded most heavily in what is now The Alluring Isles. Is used as the colloquial term for a bastard of The Alluring Isles, Nyrolus.",
        favor: "Caeren",
        worship: "Inquisitive in nature and vigilant in his measures, he sat himself more so the recluse than leader. A preference for watching and contemplation, more followers saw him steeped in such activities more often than not, and sought to appease him as such. Sitting with him, watching the waves break into the shores, and climb up cliff-faces, though this was not the life for many, the activities heralded a certain quality of an individual to beleaguer himself to Nyrolus. Gradually the activities moved toward exploring the tides, and waters, building up great ships to venture further out, which amused the Ancient, often joining crew out the sea for long periods at a time, and delving into the murky waters below, not to return for ages.",
    },
    "Quor'ei": {
        name: "Quor'ei, the Ancient of the Earth",
        description: "Said to have awoken, or created Augres; large, bouldering creatures wrought of stone, sand, and clay--given sentience and bloodlust, used as Quor'ei’s pawns in war during the War of the Ancients. Another belief classically held was that devout worshippers, clamouring for the Ancient’s favor and being bestowed with an unhinged rage manifested in their creation. In this legend, the followers were submerged beneath the earth, entombed of salt, mud, clay, and rock, to be transformed into these wicked beasts.",
        origin: "Quor'ei was said to have traveled upon the great ranges that separated what we now call the Achreon Kingdom and Soverains, to Licivitas and perhaps even further South, tunneling underground between the lands as it has been noted in Sedyrus of worship of the deity.  Is used as a colloquial term for a bastard of Sedyrus, Quor'ei.",
        favor: "Achre",
        worship: "Those who adhered to invariably one of the most elder of Ancient’s sought their approval through a manner of living meager lives, keeping the earth undisturbed. Some went so far as to build into the earth, believing it to be a more pure lifestyle.",
    },
    Rahvre: {
        name: "Rahvre, the Ancient of Dreams",
        description: "Belief that the meditation of dreams and recollection would open a passage to move between their visage inside the dreamscape. Associated with the othernatural phenomena of Insight. Those devout also believed to have received words and clawing messages, affectionately known as Dreamshivers. The contents or meaning of them have been written about extensively in several volumes, with more commentaries on the matter.",
        origin: "The Teeth were and are the settlements and last remnants of worship, or so it is believed. There aren’t many texts about the lands and people in the Teeth before some of those hailing from Licivitas emigrated there.",
        favor: "Achre",
        worship: "A careful study of and belief in the power of dreams to culminate in alterations or adjustments of reality. Strong intuition was placed on the truth and insight that dreams tapped into.",
    },
    "Se'dyro": {
        name: "Se'dyro, the Iron Ancient",
        description: "Despite his demeanor to be gruff, stiff, and demanding, Se’dyro was by all accounts a humble and one of the more honorable Ancients, never turning away from a follower in need if their heart and mind were aligned and pure. Said to have been cordial, if not a bit too rambling once the topic steeped into his forte.",
        origin: "Associated with the creation of Dwarves, who live around the North in the mountainous ranges, said to be working with the neighboring folk, even the provincial Lords and Soverains. This leads many to believe that he resided around these parts as his seat of power. This may have been attributed to him after the fact, as some scholars and Sages are weary of such connections. Also connected to the famed mountains of Sedyrus, of which is derived from his name. These mountains are forged of legend, and where much of the greatest steel has been created, with various weapons attributing their brilliance and perfection to these smiths that reside there.",
        favor: "Agility",
        worship: "Typically the way of honoring and pledging yourself to the Iron Ancient would only need to go so far as aiding in his goals and helping meet out his ends. It doesn’t seem like much to ask, but his sights were set beyond most of humanity’s imagination, and those today who take up after Se’dyro still lack his precise nature, and scale of fortitude.",
    },
    "Se'vas": {
        name: "Se'vas, the Ancient of War",
        description: "War appears to been a rogue Ancient like that of Kyn’gi (Hunt), a code of ethics carved for humanity and held by his followers. If there were ever a sense of justice thought to promulgate into the world, it is said to have derived from him.",
        origin: "Believed to be worshiped by the Cragores to this day, Se'vas was said to reside where they are found, south of the Daethic Kingdom, and north of Licivitas, among the great ranges. Associated with the othernatural hybrid Re’vas.",
        favor: "Strength",
        worship: "Followers of Se'vas were famed to show the act of mercy to the sick, wounded, dying, and otherwise maimed individuals--even those who didn’t worship the Ancient. This involved the just cause to remove them of their suffering, for there would be no cruelty in allowing someone who could no longer lead a life worth living. These interpretations of this form of homage is one of the only surviving testaments found along the inner scribbles of writings devoted to the Ancient of War.",
    },
    Senari: {
        name: "Senari, the Ancient of Wisdom",
        description: "Noted that Senari was a thoughtful, contemplative, and engaging Ancient. Her serene nature bore a form of peace with her followers.",
        origin: "Said to have kept her seat of power harbored in the realm now known as Licivitas.",
        favor: "Agility",
        worship: "Senari didn’t ask much from her followers, only their lives. This may seem strange, but this Ancient didn’t placate in the form of sacrifice or cruelty, but an appeasement toward self-determination. Quietly, she would reflect on their agitation and frustrations; ever graceful, gently fording their way.",
    },
    Shrygei: {
        name: "Shrygei, the Ancient of Song",
        description: "A terror-stricken Ancient whose concern, paranoia and fear were calmed when creating instruments and patterns of speech for music to be enjoyed and created in turn by his followers. Said to have been in love with, if not the lover of Ahn've (Wind), granting his gift of music in song to twist into the speech and beauty of her creation, the Ahn'are.",
        origin: "Associated with the creation (albeit tongue-in-cheek) of Kobalos, which marks his seat of power as having been south of the Northren Lords, just above what is now known as Licivitas.",
        favor: "Agility",
        worship: "Followers playing assuaged Shrygei’s anxious nature, which bequeathed an affordance of appeasement to the Ancient, particularly when serenaded with original offerings.",
    },
    Tshaer: {
        name: "Tshaer, the Animal Ancient",
        description: "Believed to be worshipped by the Cragore to this day, and would reside where they are found. Is perhaps conjecture, but is attributed in some fashion to the creation of the othernatural Morath, Gatshyr, Shyr, and Cerchre that would prey upon man. These perhaps were creations by the most devout followers submitting themselves to be physically transformed or have their consciousness placed into beasts to protect nature from the ensuing War of the Ancients.",
        origin: "Tshaer seemed to take on the aspect of whichever animal she was inhabiting, or forming the likeness of.",
        favor: "Strength",
        worship: "Care and tending of various animals and hybrids that took on a more feral form. Included the elevation of certain species to more achreon and dire forms.",
    },
};

const deities = {
    "Daethos": { // God
        luckout: {
            arbituous: 1,
            chiomic: -1,
            kyrnaic: -1,
            lilosian: 1,
        },
        mastery: {
            constitution: 1,
            achre: 1,
            caeren: 1,
        },
        persuasion: {
            arbituous: 1,
            chiomic: -1,
            kyrnaic: -1,
            lilosian: 1,
            shaorahi: 1,
        }
    },
    "Achreo": { // Ancient of Wild
        luckout: {
            arbituous: 2,
            kyrnaic: 1,
        },
        mastery: { 
            achre: 3,
            caeren: -1, 
        },
        persuasion: {
            arbituous: 1,
            kyrnaic: 1,
        }
    }, 
    "Ahn've": { // Ancient of Wind
        mastery: {
            constitution: 1,
            achre: 1,
            caeren: 1,
        },
        persuasion: {
            chiomic: 1,
            fyeran: -1,
            shaorahi: 1,
        }
    }, 
    "Astra": { // Ancient of Lightning

        mastery: { 
            achre: 2,
            caeren: -1,
        },
        persuasion: {
            ilian: 1,
            shaorahi: 1,
        }
    },
    "Cambire": { // Ancient of Potential

        mastery: {  
            achre: -1,
            caeren: 3,
        }
    },
    "Chiomyr": { // Ancient of Humor
        luckout: {
            chiomic: 2,
            lilosian: -1,
        },
        mastery: { 
            achre: 1,
            caeren: -1,
            kyosir: 1,
        },
        persuasion: {
            chiomic: 1,
            ilian: -1,
            lilosian: -1,
        }
    },
    "Fyer": { // Ancient of Fire
        
        mastery: { 
            achre: -1,
            caeren: 2,
        },
        persuasion: {
            fyeran: 2,
        }
    },
    "Ilios": { // Ancient of the Sun
        
        mastery: {
            constitution: 1,
            strength: 1, 
        },
        persuasion: {
            ilian: 2,
            shaorahi: 1,
        }
    }, 
    "Kyn'gi": { // Ancient of Hunt
        combat: {
            value: 1,
        },
        mastery: {
            constitution: 1,
            agility: 1, 
        },
        persuasion: {
            arbituous: 1,
        }
    },
    "Kyrisos": { // Ancient of Gold
        luckout: {
            chiomic: 1,
            lilosian: 1,
        },
        mastery: { 
            constitution: 1,
            caeren: 1,
            kyosir: 1,
        },
        persuasion: {
            chiomic: 1,
            ilian: 1,
            lilosian: 1,
        }
    }, 
    "Kyr'na": { // Ancient of Time
        luckout: {
            kyrnaic: 2,
        }, 
        mastery: {
            constitution: 1, 
            kyosir: 1,
        },
        persuasion: {
            kyrnaic: 1,
        }
    },
    "Lilos": { // Ancient of Life
        luckout: {
            lilosian: 2,
        },
        
        mastery: {
            constitution: 1, 
            caeren: 1,
        },
        persuasion: {
            lilosian: 1,
        }
    },
    "Ma'anre": { // Ancient of the Moon
        
        mastery: { 
            achre: 1,
            agility: 1,
        },
        persuasion: {
            chioimic: 1,
            ilian: -1,
            shaorahi: 1,
        },
        thievery: {
            value: 1,
        }
    },
    "Nyrolus": { // Ancient of Water
        luckout: {
            arbituous: 1,
            lilosian: 1,
        },
        mastery: {
            constitution: 1,
            caeren: 1, 
        },
        persuasion: {
            arbituous: 1,
            fyeran: 1,
            lilosian: 1,
        }
    },
    "Quor'ei": { // Ancient of Earth
        mastery: {
            constitution: 1,
            achre: 1, 
        },
    },
    "Rahvre": { // Ancient of Dreams 
        mastery: {
            achre: 1,
            kyosir: 1, 
        },
        persuasion: {
            chiomic: 1,
            fyeran: 1,
        }
    },
    "Se'dyro": { // Ancient of Iron
        mastery: {
            strength: 1,
            agility: 1,
            achre: 1, 
        },
        sedyrist: {
            value: 1,
        },
    }, 
    "Se'vas": { // Ancient of War
        combat: {
            value: 1,
        },
        mastery: {
            strength: 2,
        }
    }, 
    "Senari": { // Ancient of Wisdom
        luckout: {
            arbituous: 1,
        },
        mastery: {
            achre: 1,
            caeren: 1, 
        },
        persuasion: {
            arbituous: 1,
            fyeran: 1,
            lilosian: 1
        }
    },
    "Shrygei": { // Ancient of Song
        mastery: {
            agility: 1,
            kyosir: 1,
        },
        persuasion: {
            chiomic: 1,
            fyeran: 1,
        }
    },
    "Tshaer": { // Ancient of Animals
        combat: {
            value: 1,
        }, 
        mastery: { 
            strength: 1,
            agility: 1,
        }
    }, 
};

const keywords = {
    'Daethos': 'Daethos',
    'Daethic': 'Daethic',
    'Daethos\'s': 'Daethos\'s',
    'Ancient': 'Ancient',
    'Ancients': 'Ancients',
    'Ancient\'s': 'Ancient\'s',
    
    'Achreo': 'Achreo',
    'Achreo\'s': 'Achreo\'s',
    
    'Ahn\'ve': 'Ahn\'ve',
    'Ahn\'ve\'s': 'Ahn\'ve\'s',
    
    'Astra': 'Astra',
    'Astra\'s': 'Astra\'s',
    
    'Cambire': 'Cambire',
    'Cambire\'s': 'Cambire\'s',
    
    'Chiomyr': 'Chiomyr',
    'Chiomyr\'s': 'Chiomyr\'s',

    'Fyer': 'Fyer',
    'Fyer\'s': 'Fyer\'s',

    'Ilios': 'Ilios',
    'Ilios\'s': 'Ilios\'s',
    
    'Kyn\'gi': 'Kyn\'gi',
    'Kyn\'gi\'s': 'Kyn\'gi\'s',
    
    'Kyr\'na': 'Kyr\'na',
    'Kyr\'na\'s': 'Kyr\'na\'s',

    'Kyrisos': 'Kyrisos',
    'Kyrisos\'s': 'Kyrisos\'s',

    'Lilos': 'Lilos',
    'Lilos\'s': 'Lilos\'s',

    'Ma\'anre': 'Ma\'anre',
    'Ma\'anre\'s': 'Ma\'anre\'s',

    'Nyrolus': 'Nyrolus',
    'Nyrolus\'s': 'Nyrolus\'s',
    
    'Quor\'ei': 'Quor\'ei',
    'Quor\'ei\'s': 'Quor\'ei\'s',

    'Rahvre': 'Rahvre',
    'Rahvre\'s': 'Rahvre\'s',
    
    'Senari': 'Senari',
    'Senari\'s': 'Senari\'s',
    
    'Se\'dyro': 'Se\'dyro',
    'Se\'dyro\'s': 'Se\'dyro\'s',
    
    'Se\'vas': 'Se\'vas',
    'Se\'vas\'s': 'Se\'vas\'s',

    'Shrygei': 'Shrygei',
    'Shrygei\'s': 'Shrygei\'s',
    
    'Tshaer': 'Tshaer',
    'Tshaer\'s': 'Tshaer\'s',
};

export const checkDeificConcerns = (statistics: Statistics, worship: string, stat: string, innerStat: string) => {
    try {
        const deity = deities[worship as keyof typeof deities];
        const statConcerns = deity[stat as keyof typeof deity];
        if (statConcerns) {
            const innerStatConcerns = statConcerns[innerStat as keyof typeof statConcerns];
            if (innerStatConcerns) {
                statistics.relationships.deity.value += innerStatConcerns;
            };
        };
        return statistics;
    } catch (err) {
        console.warn(err, "Error Checking Deific stats");
    };
};

export async function evaluateDeity(data: { asceanID: string, deity: string, entry: any }): Promise<any> {
    try {
        let { asceanID, deity, entry } = data;
        let ascean = await getAscean(asceanID);

        const keywordCount = {
            'Compliant': {
                occurrence: 0,
                value: 0
            },
            'Faithful': {
                occurrence: 0,
                value: 0
            },
            'Unfaithful': {
                occurrence: 0,
                value: 0
            },
            'Disobedient': {
                occurrence: 0,
                value: 0
            },
        };

        entry.body = entry.body.join('\n\n'); 
 
        entry.keywords.forEach((keyword: string) => {
            if (keywordCount[keyword as keyof typeof keywordCount]) {
                keywordCount[keyword as keyof typeof keywordCount].occurrence += 1;
            };
        });
        
        keywordCount.Compliant.value = keywordCount.Compliant.occurrence;
        keywordCount.Faithful.value = keywordCount.Faithful.occurrence * 2;
        keywordCount.Unfaithful.value = -keywordCount.Unfaithful.occurrence * 2;
        keywordCount.Disobedient.value = -keywordCount.Disobedient.occurrence;

        const valueSum = keywordCount.Compliant.value + keywordCount.Faithful.value + keywordCount.Unfaithful.value + keywordCount.Disobedient.value;

        const evaluateBehavior = (count: { [s: string]: unknown; } | ArrayLike<unknown>) => {
            const sortCountOccurrence = Object.entries(count as { [key: string]: { occurrence: number, value: number } }).sort((a, b) => b[1].occurrence - a[1].occurrence);
            const mostFrequentBehavior = sortCountOccurrence[0][0];

            console.log(sortCountOccurrence, mostFrequentBehavior, "sortCountOccurrence, sortCountValue");

            if (mostFrequentBehavior === 'Faithful') {
                if (valueSum >= 4) {
                    return 'Convicted';
                } else if (valueSum >= 2) {
                    return 'Faithful';
                } else if (valueSum === 1) {
                    return 'Somewhat Faithful';
                } else {
                    return 'Strained Faith';
                };
            } else if (mostFrequentBehavior === 'Compliant') {
                if (valueSum >= 4) {
                    return 'Zealous';
                } else if (valueSum >= 2) {
                    return 'Compliant';
                } else if (valueSum >= 1) {
                    return 'Somewhat Compliant';
                } else {
                    return 'Strained Compliance';
                };
            } else if (mostFrequentBehavior === 'Unfaithful') {
                if (valueSum <= -4) {
                    return 'Hostile';
                } else if (valueSum <= -2) {
                    return 'Unfaithful';
                } else if (valueSum <= -1) {
                    return 'Somewhat Unfaithful';
                } else {
                    return 'Waning Faith';
                };
            } else if (mostFrequentBehavior === 'Disobedient') {
                if (valueSum <= -4) {
                    return 'Rabid';
                } else if (valueSum <= -2) {
                    return 'Disobedient';
                } else if (valueSum <= -1) {
                    return 'Somewhat Disobedient';
                } else {
                    return 'Waning Compliance';
                };
            } else {
                return 'Neutral';
            };
        };

        const behavior = evaluateBehavior(keywordCount);

        ascean.interactions.deity += 1;

        console.log(behavior, "Behavior");
        if (ascean.statistics.relationships.deity.name === '') ascean.statistics.relationships.deity.name = deity;
        ascean.statistics.relationships.deity.Compliant.occurrence += keywordCount.Compliant.occurrence;
        ascean.statistics.relationships.deity.Faithful.occurrence += keywordCount.Faithful.occurrence;
        ascean.statistics.relationships.deity.Unfaithful.occurrence += keywordCount.Unfaithful.occurrence;
        ascean.statistics.relationships.deity.Disobedient.occurrence += keywordCount.Disobedient.occurrence;
        ascean.statistics.relationships.deity.Compliant.value += keywordCount.Compliant.value;
        ascean.statistics.relationships.deity.Faithful.value += keywordCount.Faithful.value;
        ascean.statistics.relationships.deity.Unfaithful.value += keywordCount.Unfaithful.value;
        ascean.statistics.relationships.deity.Disobedient.value += keywordCount.Disobedient.value;
        ascean.statistics.relationships.deity.value += valueSum;
        ascean.statistics.relationships.deity.behaviors.push(behavior);

        if (ascean.capable < 5) {
            ascean.capable += 1;
        };

        // const goodBehavior = ascean.statistics.relationships.deity.behaviors.filter(behavior => behavior === 'Faithful' || behavior === 'Compliant');
        // const badBehavior = ascean.statistics.relationships.deity.behaviors.filter(behavior => behavior === 'Unfaithful' || behavior === 'Disobedient');
        // const middlingBehavior = ascean.statistics.relationships.deity.behaviors.filter(behavior => behavior === 'Somewhat Faithful' || behavior === 'Somewhat Compliant' || behavior === 'Somewhat Unfaithful' || behavior === 'Somewhat Disobedient');
        // const goodBehaviorCount = goodBehavior.length;
        // const badBehaviorCount = badBehavior.length;
        // const middlingBehaviorCount = middlingBehavior.length;

        const presentTense = ascean.faith === 'Adherent' ? 'adherence to' : ascean.faith === 'Devoted' ? 'devotion to' : 'curiosity with';
        const pastTense = ascean.faith === 'Adherent' ? 'adherent toward' : ascean.faith === 'Devoted' ? 'devoted toward' : 'curious with';

        switch (behavior) {
            case 'Convicted':
                ascean[keywords[ascean.mastery as keyof typeof keywords]] += 1;
                entry.footnote = `${ascean.name} seems convicted of their ${presentTense} ${deity}.`;
                break;
            case 'Zealous':
                entry.footnote = `${ascean.name} seems zealous in their ${presentTense} ${deity}.`;
                ascean[keywords[ascean.mastery as keyof typeof keywords]] += 0.75;
                break;
            case 'Faithful':
                entry.footnote = `${ascean.name} seems faithful to ${deity}.`;
                ascean[keywords[ascean.mastery as keyof typeof keywords]] += 0.5;
                break;
            case 'Somewhat Faithful':
                entry.footnote = `${ascean.name} seems somewhat faithful to ${deity}.`;
                ascean[keywords[ascean.mastery as keyof typeof keywords]] += 0.25;
                break;
            case 'Compliant':
                entry.footnote = `${ascean.name}'s ${pastTense} ${deity}.`;
                break;
            case 'Waning Faith':
                entry.footnote = `${ascean.name}'s waning in their ${presentTense} ${deity}.`;
                break;
            case 'Somewhat Compliant':
                entry.footnote = `${ascean.name}'s somewhat ${pastTense} ${deity}.`;
                
                break;
            case 'Strained Compliance':
                entry.footnote = `${ascean.name}'s strained in their ${presentTense} ${deity}.`;
                // It'll sense that the deity notices this behavior
                break;
            case 'Waning Compliance':
                entry.footnote = `${ascean.name}'s waning in their ${presentTense} ${deity}.`;
                // Over time, this will have another closure that writes the footnote based on the specific deity
                break;
            case 'Somewhat Disobedient':
                entry.footnote = `${ascean.name} has been somewhat disobedient to ${deity}.`;
                // This is where Chiomyr would mess with someone's inventory, etc...
                break;
            case 'Disobedient':
                entry.footnote = `${ascean.name} has been disobedient to ${deity}.`;
                // Or put their current health at level 1 as punishment
                break;
            case 'Somewhat Unfaithful':
                entry.footnote = `${ascean.name} has been somewhat unfaithful to ${deity}.`;
                ascean[keywords[ascean.mastery as keyof typeof keywords]] -= 0.25;
                break;
            case 'Unfaithful':
                ascean[keywords[ascean.mastery as keyof typeof keywords]] -= 0.5;
                entry.footnote = `${ascean.name} has been unfaithful to ${deity}.`;
                break;
            case 'Rabid':
                ascean[keywords[ascean.mastery as keyof typeof keywords]] -= 0.75;
                entry.footnote = `${ascean.name} has been rabid in their unfaithfulness to ${deity}.`;
                break;
            case 'Hostile':
                ascean[keywords[ascean.mastery as keyof typeof keywords]] -= 1;
                entry.footnote = `${ascean.name} has been hostile to ${deity}.`;
                break;
            default:
                break;
        };
        ascean.journal.entries.push(entry);
        const update = await updateAscean(ascean);
        return update;
    } catch (err: any) {
        console.log(err.message, "Error Evaluating Experience");
    };
};