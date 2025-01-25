import { Accessor } from "solid-js";
import { getAscean, updateAscean } from "../assets/db/db";
import Statistics from "./statistics";
import { EventBus } from "../game/EventBus";

export const DEITIES = {
    "Daethos": {
        name: "Daethos",
        description: "The God awaiting man in the Land of Hush and Tendril, the Arbiter of the Caer.",
        origin: "Thought to be Licivitas as the Good Lorian founded the Seyr in the city of his namesake. However, the origin of its herald and prophet, Laetrois Ath'Shaorah, is unknown.",
        favor: "Caeren",
        worship: "Charity and Penance. For whether born bastard or regal, man or woman, gifted or afflicted, it is the duty in what one can bear and manifest greater that will carry forward in his lineage and those around him. The Good instantiated may only be birthed through the individual, his ascertainment of truth evidenced through the perception of the world around him, and for that right may it converge and coalesce to his brothers on the whole.",
    }, 
    "Achreo": {
        name: "Achreo, the Wild Ancient",
        description: "Not much is known or remembered of Achreo in his ways with humans, nor how the title came to suit him. It is currently believed that he were apathetic towards human struggle and resigned to his own meditations. Associated with a multitude of human-like entities: the Anashtre, Aphyero, Chyrolus, Draochre, Fyerash, and Quor'eo.",
        origin: "Achreo tended to move about in the Northren lands, before it was settled as the Achreon Kingdom and the Soverains. Is used as the colloquial term for a bastard's surname of the Achreon [now Daethic] Kingdom, Achreo.",
        favor: "Achre",
        worship: "Shrines were built throughout the land in honor the Wild Ancient, keeping surrounding areas undisturbed as recompense for the resources used, with uncertainty if this were the best measure to show faithfulness to Achreo. The Draochre of Druids clamored to his favor, as most orations and written scrolls tend to adhere to this perception, with sacrifice also prevalent in seeking virtue and favor.",
    },
    "Ahn've": {
        name: "Ahn've, the Ancient of the Wind",
        description: "Said to have been capricious, never comfortable with her choice of setting. She made due with gaining followers wherever she resided for a time, having sprinkled about places of worship and reverence near every stretch. This pleased her, though temporary, and would venture off again, to return anew, and take leave once more. Thought to be the lover of Shrygei, though perhaps may have been only the target of his affections. Associated with the Ahn'are",
        origin: "Tempestuous with her sister Astra, and not one for the stagnation and sedentary lifestyle, she moved about the realm to her own whims and queries, thereby reigning in no one place in particular.",
        favor: "Caeren",
        worship: "It was never certain who she preferred in her stead, those who worshiped Ahn've, with her feminine beauty, body, and wings that could spread thrice-fold her own reach, or the birds she grew a kinship with, for they were the only ones who could see the grandiosity of her nature in the skies. Nevertheless, wherever she went, she was welcomed and placated to, having many statues of her divinity set about the land, typically up hillsides and mountain pathings.",
    },
    "Astra": {
        name: "Astra, the Ancient of Lightning",
        description: "Twisted as her storms, like a suffocating mother that slapped her children for their rowdiness then held them close to wipe away the tears. Rewardful of worship, and wrothful of those obstinate. Wickedly rueful of followers leaving the land, or strangers entering without due consent, her worshipers adopted such attitudes.",
        origin: "The Astralands is where the seat of this Ancient was held. Associated with the othernatural Tshios and the Anashtre. Is used as a colloquial term for a bastard's surname of the Spine, Astra.",
        favor: "Achre",
        worship: "Obeisance of the utmost, with lavish praise of those shown their devotion in the form of children. Not gifts and sacrifice, it let her know they followed her wishes.",
    },
    "Cambire": {
        name: "Cambire, the Potential Ancient",
        description: "Rarely seen in proper visage, speaking to followers in poetry and speech behind his sacred walls. Had scarce communication with other Ancients as well, wtih direct contact with Achreo, Kyr’na and Lilos on occasion.",
        origin: "Idea of an Ancient being worshiped through the lighting of a brazier at it’s statue and it igniting incense attuned to the land of hush and tendril. These were housed at what are now the city-states known as the Teeth of the West Fangs.",
        favor: "Caeren",
        worship: "One of the less revered of the Ancients, the few who followed Cambire led a belief that their ultimate fruition were held in their own hands and not succumbing to the virtue of their given bloodline.",
    },
    "Chiomyr": {
        name: "Chiomyr, the Ancient of Humor",
        description: "Often regarded as the patron of entertainment, coupled with Shrygei, he spent his time when regaling his followers, and even those not under his tutelage, with various musings, jests, and points of mockery--to the delights of the crowds gathering and himself most of all. He hadn’t the inclination to take much of anything serious, and is even said to have dying laughing, one last jape for the world he left behind.",
        origin: "Associated with the creation of the Chioba. This appears to be more of a legend concerning the unfortunate creature, though it is no less heralded as common wisdom due to Chiomyr’s seat of power being established near the same place as these folk reside even now, in various regions south of the Northren Lords. Also associated with the infamous tales of the Synacyn and the Ky'myr.",
        favor: "Kyosir",
        worship: "Merely engaging with the Ancient was well enough a form of homage, as his restless nature afforded him the ability to send barbs and jest with those who were not soft of heart or mind. It swelled his to have the company to participate in such ruses, and his long memory never forewent a face who aided in his pleasure.",
    },
    "Fyer": {
        name: "Fyer, the Ancient of Fire",
        description: "Despite his nature, there were many testimonies to the relaxed and carefree attitude of Fyer. Orators from time immemorial recall ideas leading to this belief that his passions were worn outside his internal being, therefore it never exuded outside himself from a place harbored within.",
        origin: "While the Firelands were considered more akin to his likeness and sensibilities due to finding many statues of worship, he did partake in travels of a kind toward the Northren lands, bringing him with warmth and joy wherever he strode. Associated with the Aphyero, Fyrash, and the Phoenix. Is used as the colloquial term for a bastard's surname of the Firelands, Fyer.",
        favor: "Caeren",
        worship: "Despite being attributed to the Ancient of Fire, sacrifice was not a form of homage nor honor. He appeared to be an Ancient of the people, and took part in society more so than many of his brethren, having granted man the gift of fire as one of the more famous tales mention.",
    },
    "Ilios": {
        name: "Ilios, the Sun Ancient",
        description: "One of the chief Ancients, he shared a half of the same whole as Ma’anre, with Ilios being the stern sentinel that posted and held the evils at bay for the world and humanity to exist and thrive. Much is unknown of his disposition, tending to stay at a distance from his followers.",
        origin: "One of the more universal Ancients, his seat stemmed the full breadth of the realm. Is used as the colloquial term for a bastard's surname of the Soverains, Ilios.",
        favor: "Strength",
        worship: "Cultivation and direct communion with the Ancient was forbidden unless strict consent were given from his stewards. Placating to his honor in the form of statues, buildings and entire settlements seemed to appease Ilios, though his favor was held in some regions more than others.",
    },
    "Kyn'gi": {
        name: "Kyngi, the Ancient of the Hunt",
        description: "Those who were not adherent to these beliefs were in turn hunted and slain, whether by a follower or Kyn’gi himself, it was not known. Strict, unwavering yet ever faithful to those who were adherent to himself.",
        origin: "Wherever one would find the concept of pursuit of the hunt worthy, is where one would find him wandering and traveling. Believed to be worshiped by the Cragore and southron shaman to this day, and would reside where they are found as well. Commonly associated with the othernatural Cerchre and Tavore, as they’re renowned for actively hunting man and taking maiden’s for their carnal lust.",
        favor: "Agility",
        worship: "A hardened code of ethics forged in the wake of the discovery to slay fair and honorable game. Understanding of and practice was all necessary to portray an adherence to Kyn’gi.",
    },
    "Kyrisos": {
        name: "Kyrisos, the Ancient of Gold",
        description: "One of the most charming and dynamic Ancients, Kyrisos was well received by many followers even outside his own worship. To this day, many people use his goods as homage.",
        origin: "His seat of power ranged across the land, gaining many followers from place to place, even those traveling enroute toward destinations of other Ancients. Due to this, you may find monuments to his likeness in every division of the realm.",
        favor: "Kyosir",
        worship: "Not one to be placated through dreary appeasements such as utter devotion and forsaking all that life were to offer an individual. The things other Ancient’s seemed to prefer he’d quip, instead enjoying the livelihood and rambunctious nature of humanity, engaging with them on a more personal level and being apart of their festivals, parades, markets, plays, rituals and more.",
    },
    "Kyr'na": {
        name: "Kyr'na, the Ancient of Time",
        description: "A beautiful and charming Ancient that caused a spell-bound effect on those gazing upon her. Was said to stop time herself when immersed in thought or conversation with a follower.",
        origin: "Thought to have lived near the centralands of the realm, traveling between what we now call the West Fangs, Licivitas, and the northern parts of the Firelands and Sedyrus, due to the abrogation of various statues in her honor.",
        favor: "Consitution",
        worship: "Mortal gifts and reverence were seen as principal ways to appease Kyr’na, for she loved life, beauty and adolescence. Took the offerings of her followers in the form of their children, wives, husbands, or animals.",
    },
    "Lilos": {
        name: "Lilos, the Ancient of Life",
        description: "Embodying the dutiful and loving mother to her children across the land, she was graceful, nurturing, understanding, and ever vigilant to push her followers toward something greater in their lives which she had bestowed them, it was said.",
        origin: "Known not to stay in any one place for long, her statues and monuments to her nature have been found still at the Northren and Southron ends of the realm, from above the great ranges to below the Teeth.",
        favor: "Consitution",
        worship: "One of the more popular and loved Ancients, Lilos was worshiped in near every way a person had believed to seek favor from an Ancient. People built places of worship, they made pilgrimages towards her sites, threw celebrations and festivals, dancing and loving throughout the nights during the change of seasons. The only way she disavowed was of relation to any form of sacrifice, regardless of the individual offering themself over to her.",
    },
    "Ma'anre": {
        name: "Ma'anre, the Moon Ancient",
        description: "Ma’anre was present, protective and ever watchful of her children, always ready to bless her followers with a soft, caring glow. Translation of Ma’anre tends to coalesce with the term ‘Mother’.",
        origin: "One of the more universal Ancients, her seat stemmed the full breadth of the realm.",
        favor: "Agility",
        worship: "Cultivation and direct communion with the Ancient during the risen Moon’s gaze. At times when not present during such phases, requests of sacrifice were set to reach the Moon above.",
    },
    "Nyrolus": {
        name: "Nyrolus, the Ancient of the Water",
        description: "Due to his peculiar qualities, he most appreciated the Octopus, over any fish in the sea. He saw their brilliance as predators, thieves, and problem-solvers. With this, when it came time to forge a being that would herald his victory in the coming war, Nyrolus forged the Kraken, an octopus swelled to monstrous proportions.",
        origin: "Nyrolus is believed to be instrumental in forging what are now many of the major port-cities around the realm. Most heavily worshiped in what is now The Alluring Isles. Is used as the colloquial term for a bastard's surname of The Alluring Isles, Nyrolus.",
        favor: "Caeren",
        worship: "Inquisitive in nature and vigilant in his measures, he himself more recluse than leader. A preference for contemplation, followers saw him steeped in such activities more often than not, and sought to appease him in kind. Sitting with him, watching the waves break into the shores and recede, the activities heralded a certain quality of an individual to beleaguer himself to Nyrolus. Gradually the activities moved toward exploring the tides, and waters, building up great ships to venture further out, which amused the Ancient, delving into the murky waters below, not to return for ages.",
    },
    "Quor'ei": {
        name: "Quor'ei, the Ancient of the Earth",
        description: "Said to have awoken, or created Quoros; large, bouldering creatures wrought of stone, sand, and clay--given sentience and bloodlust, used as Quor'ei’s protectors during the War of the Ancients. Another belief held was that his devout, clamouring for the Ancient’s favor, were bestowed with an unhinged rage manifested in their creation. In this, the followers were submerged beneath the earth, entombed of salt, mud, clay, and rock, to be transformed into such wicked machinations.",
        origin: "Said to have traveled upon the great ranges that separated what we now call the Achreon Kingdom and Soverains, to Licivitas and perhaps even further South, tunneling underground between the lands as it has been noted in Sedyrus of worship of the deity. Is used as a colloquial term for a bastard's surname of Sedyrus, Quor'ei.",
        favor: "Achre",
        worship: "Those who adhered to one of the most elder Ancient’s sought their approval through a manner of living earthly lives, and tending to it undisturbed. Some went so far as to build into the earth, believing it to be a more pure lifestyle.",
    },
    "Rahvre": {
        name: "Rahvre, the Ancient of Dreams",
        description: "Belief that the meditation of dreams and recollection would open a passage to move between their visage inside the dreamscape. Associated with the othernatural phenomena of Insight. Those devout also believed to have received words and clawing messages, affectionately known as Dreamshivers. The contents or meaning of them have been written about extensively in several volumes, with more commentaries on the matter.",
        origin: "The Teeth were and are the settlements and last remnants of worship, or so it is believed. There aren’t many texts about the lands and people in the Teeth before some of those hailing from Licivitas emigrated there.",
        favor: "Achre",
        worship: "A careful study of and belief in the power of dreams to culminate in alterations or adjustments of reality. Strong intuition was placed on the truth and insight that dreams tapped into.",
    },
    "Se'dyro": {
        name: "Se'dyro, the Iron Ancient",
        description: "Despite his demeanor to be gruff and demanding, Se’dyro was by all accounts a humble and honorable Ancient, never turning from a true worhsiper. Said to have been cordial in conversation, if not a bit too rambling once the topic steeped into his passions.",
        origin: "Associated with sects of monks who lived near the North in the mountainous ranges, said to work with the neighboring folk and even provincial lords of their time. Many believe these parts were his seat of power. This may have been attributed to him after the war, as some scholars and Sages are weary of such connections. Also associated to the famed mountains of Sedyrus, derived from his name. The greatest steel ever forged, various weapons attribute their brilliance and perfection to these lands.",
        favor: "Agility",
        worship: "Honoring and pledging oneself to the Iron Ancient; aiding in his goals and helping meet out his ends. It doesn’t seem like much to ask, but his sights were set beyond most of humanity’s imagination, and those today who take up after Se’dyro still lack his precise nature, and scale of fortitude.",
    },
    "Se'vas": {
        name: "Se'vas, the Ancient of War",
        description: "Appears to have been a rogue Ancient like that of Kyn’gi; an ethos carved for humanity and held by his followers. If there were ever a sense of justice thought to promulgate into this world, it is said to have derived from him.",
        origin: "Believed to be worshiped by the Cragores to this day, Se'vas was said to reside where they are found, south of the Daethic Kingdom, and north of Licivitas, among the great ranges. Associated with the othernatural Re’vas.",
        favor: "Strength",
        worship: "Followers were famed to show mercy to those mortally or caerenically dying--even those who didn’t worship the Ancient, for there would be no cruelty in allowing someone who could no longer live their life proper. These interpretations of this form of homage is one of the only surviving testaments found along the inner scribbles of writings devoted to the Ancient of War.",
    },
    "Senari": {
        name: "Senari, the Ancient of Wisdom",
        description: "Noted that Senari was a thoughtful, contemplative, and engaging Ancient. Her serenity bore a form of tranquility with her followers.",
        origin: "Said to have kept her seat of power harbored in the realm now known as Licivitas.",
        favor: "Achre",
        worship: "Senari asked of her followers not to placate in the form of sacrifice or cruelty, but an appeasement toward curiosity and determination. Quietly, she would reflect on their agitation and frustrations; ever graceful, gently fording their way.",
    },
    "Shrygei": {
        name: "Shrygei, the Ancient of Song",
        description: "A terror-stricken Ancient whose concern, paranoia and fear were calmed when creating instruments and patterns of speech for music to be enjoyed and created in turn by his followers. Said to have been in love with, if not the lover of Ahn've, granting his gift of music in song to twist into the speech and beauty of her creation, the Ahn'are.",
        origin: "Associated with the creation of Chioba, which marks his seat of power as having been south of the Northren Lords, just above what is now known as Licivitas.",
        favor: "Agility",
        worship: "Followers playing with harmony assauged Shrygei’s anxious nature, which bequeathed an affordance of appeasement to the Ancient, particularly when serenaded with original offerings.",
    },
    "Tshaer": {
        name: "Tshaer, the Animal Ancient",
        description: "Believed to be worshiped by the Cragore to this day, and thought to have resided among those mountains. Attributed to the creation of the othernatural Cerchre, Gatshyr, Shyr, and Tavore that would prey upon man. These perhaps were creations by the most devout followers submitting themselves to be physically transformed or have their minds placed into beasts to protect nature from the ensuing War of the Ancients.",
        origin: "Tshaer seemed to take on the aspect of whichever animal he was inhabiting, or forming the likeness thereof.",
        favor: "Strength",
        worship: "Care and tending of various animals and others that took on a more feral form, including the elevation of certain species to more Achreon forms.",
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

export async function evaluateDeity(data: { statistics: Accessor<Statistics>, asceanID: string, deity: string, entry: any }): Promise<any> {
    try {
        let { statistics, asceanID, deity, entry } = data;
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
        let newStats = statistics();
        if (newStats.relationships.deity.name === '') newStats.relationships.deity.name = deity;
        newStats.relationships.deity.Compliant.occurrence += keywordCount.Compliant.occurrence;
        newStats.relationships.deity.Faithful.occurrence += keywordCount.Faithful.occurrence;
        newStats.relationships.deity.Unfaithful.occurrence += keywordCount.Unfaithful.occurrence;
        newStats.relationships.deity.Disobedient.occurrence += keywordCount.Disobedient.occurrence;
        newStats.relationships.deity.Compliant.value += keywordCount.Compliant.value;
        newStats.relationships.deity.Faithful.value += keywordCount.Faithful.value;
        newStats.relationships.deity.Unfaithful.value += keywordCount.Unfaithful.value;
        newStats.relationships.deity.Disobedient.value += keywordCount.Disobedient.value;
        newStats.relationships.deity.value += valueSum;
        (newStats.relationships.deity.behaviors as any).push(behavior);
        EventBus.emit('update-statistics', newStats);
        if (ascean.capable < 5) {
            ascean.capable += 1;
        };
        // const goodBehavior = newStats.relationships.deity.behaviors.filter(behavior => behavior === 'Faithful' || behavior === 'Compliant');
        // const badBehavior = newStats.relationships.deity.behaviors.filter(behavior => behavior === 'Unfaithful' || behavior === 'Disobedient');
        // const middlingBehavior = newStats.relationships.deity.behaviors.filter(behavior => behavior === 'Somewhat Faithful' || behavior === 'Somewhat Compliant' || behavior === 'Somewhat Unfaithful' || behavior === 'Somewhat Disobedient');
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