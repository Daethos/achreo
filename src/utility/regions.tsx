import { Accessor, createSignal, Setter, Show } from "solid-js";

export interface RacialRegion {
    "Ashtre": ["Astralands"];
    "Notheo": ["Kingdom", "Soverains"];
    "Nothos": ["Soverains", "Kingdom"];
    "Li'ivi": ["Licivitas", "Firelands", "West Fangs"];
    "Fyers": ["Firelands", "West Fangs"];
    "Quor'eite": ["Sedyrus", "Isles"];
    "Sedyreal": ["Sedyrus", "Isles"];
};

export interface Institutions {
    Ascea: {
        preamble: string;
        history: string;
        function: string;
        location: string;
        past_events: string;
        upcoming_event: string;
    };
    Augmentum: {
        preamble: string;
        requirements: string;
        abilities: string;
        function: string;
        ethics: string;
        duties: string;
        other: string;
    }; // Arbiters
    Museum: {
        preamble: string;
        requirements: string;
        abilities: string;
        hierarchy: string;
        function: string;
        innovations: string;
    };
};

export interface Whispers {
    // Work on other Occult eventually
    Ancients: {
        history: string;
        belief: string;
        worship: string;
    };
    Blood_Moon: {
        history: string;
        belief: string;
        prophecy: string;
    };
    Black_Sun: {
        history: string;
        belief: string;
        prophecy: string;
    };
    Ilire: {
        history: string;
        belief: string;
        hierarchy: string;
        tenets: string;
        worship: string;
    };
    "Ma'ier": {
        history: string;
        belief: string;
        hierarchy: string;
        tenets: string;
        worship: string;
    };
    Draochre: {
        history: string;
        belief: string;
        hierarchy: string;
        tenets: string;
        worship: string;
    };
};

export interface Region {
    Astralands: string;
    Kingdom: string;
    Soverains: string;
    Fangs: string;
    Licivitas: string;
    Firelands: string;
    Sedyrus: string;
    Isles: string; 
};

export interface World_Events {
    Flourishing: string;
    Sundering: string;
    Last_Rites: string;
    Age_of_Darkness: string;
    Age_of_Wars: string;
    Purification_Trials: string;
    False_Prophecy_Wars: string;
};

export interface SupernaturalEntity {
    Hybrida: {
        Preamble: string;
        "Ahn'are": string;
        Cerchre: string;
        Chioba: string;
        Cragore: string;
        Dwarves: string;
        Gatshyr: string;
        Ilire: string;
        "Ma'ier": string;
        Morath: string;
        Quoros: string;
        "Re'vas": string;
        Shyr: string;
        Tavore: string;
        Tshios: string;
    };
    Specificus: {
        Preamble: string;
        Anashtre: string;
        Aphyero: string;
        Chyrolus: string;
        Draochre: string;
        Fyrash: string;
        "Ky'myr": string;
        Nyrae: string;
        "Quor'eo": string;
        Sinacyn: string;
        Tshiathail_Kon: string; // Skeleton Knight King
    };
    Animalis: {
        Preamble: string;
        Canire: string;
        Carrier_Birds: string;
        Kraken: string;
        "Rana'vas": string;
        Phoenix: string;
        Shamanic: string;
    };
};

export interface SupernaturalPhenomena {
    Shifting: string;
    Splitting: string;
    Charm: string;
    Vielo: string;
    Scrying: string;
    Insight: string;
};

export const institutions: Institutions = {
    Ascea:  {
        preamble: `"Ahh, the Ascea. Such a wonderful event could not possibly be put into words as eloquent as the cheers of the crowd, the gracious acceptance of rewards, and the lingering scent of trade and diplomacy as is seen during the games. \n
            "Truly a master stroke penned by the leaderse of Licivitas, and much is owed to them in lieu of their assembly, not just from the people, but all across the realm. \n
            "Not a single tournament has ever afford the opportunity to increase relations with people who are your neighbors you had never met, nor barter for objects of desire, or perhaps necessities you had not known were available. It is for many reasons known as what mends the realm from splitting once more into a greater and terrible Sundering."`,

        history: `"Long ago, in an effort to aid the ceasing of wars, frustration, rebellions, and uprising from the masters, the great Seyr of Daethos thought to combine several tournaments across the realm, the oldest in performance being forms of athleticism and feats of strength. They sought to quell such concerns and heighten the possibility of forging new alliances and gathering those willing to show their absolve towards more peaceful times. \n
            "With this, it also acted as a treaty for neighboring houses and cities and provinces to be dissuaded into old feuds and warring habits, as one much sign a declaration when competing or offering champions to hold the peace through the entirety of the games."`,
            
        function: `"While perhaps there may be favor toward the richer, more noble bloodlines from across different provinces, the ability to compete and win talents, admiration, and rewards is not limited to such. What is also most wondrous about the Ascea, in addition to older and more established bloodlines, is that it grants the chance of new and competing cloaks, families, and knights of all kinds, to showcase their best of the best and gain prestige and renown throughout the land. \n
            "This is not just time filled with concern for the unfortunate to have the spurned caer of their nature to revert and cause mayhelm across the realm, no, there is more to it than just the affordance of an armistice granted for the season. In addition to the creases of bartering, trade, and the justifiable taxation here and there to keep everyone's agreements in order, this offers the benefit of new friends and allies to be pursued. Why, it would not be the first time a betrothal was enacted by two noblemen of realms not even adjacent to each other, let alone whom had ever met face to face. Truly, the games have aided in committing many to a pact that has embolded and served the realm greatly, for the good of us all. \n
            "This does not even get to the actual rewards one may hope to win when competing in various aspects and games of the Ascea. Not only is one destined to gain a highly crowned and distuinshed title of being crowned champion in their field of play, which is bestowed here and forever, beyond and through time, but something that always aids in bolstering attendance in multiple fields, gold. Large amounts of gold tend to be rewarded for the winners of each and every competition, though of course it may depend on the exact game one participates. \n
            "While it is said that the quantity of the competitors within the games separately determine the stake of the reward, it is known that events come with a fair amount of ingrained prestige that affords just a bit more than the rest, for instance, the Joust to be certain. However, this is not the only measure in which someone may feel more gold heading back home than what one came with, as trade and taking place in the games is not the only form of money to be made. \n
            "While it is not banned and outlawed, though not exactly endorsed, gambling with those around you is thought to be a sort of event on the side, all its own. The bankers of Licivitas do not exactly field the issuance of receiving and paying wins or losses, there have been high ranking members of society known to dabble as a form of high risk, high reward fun of which we encourage so long as the mischief remains to a minimum."`,
            
        location: `"Of course, due to the nature of the events, we have been able to establish and maintain and build our own city of sorts as host to The Ascea. First being hosted in the city of Lor, slowly as more and more realms decided to join and try their hands at the games, we ended up fielding more than could possibly, pleasantly be held, within and outside the city walls. And so, during the interim between the Ascea VIII and IX, a grand, vast, and large scale city, perhaps the biggest in Licivitas, was constructed for the purposes of fielding all necessary guests to feel as comfortable and welcome as we can allow. \n
            "Large towering walls shield us from wildlife and dangers of nature creeping in. Huge bestiaries have been constructed, along with many a stable to hold all horses of travel, in addition to any creatures and pets that may have been brought, all with trained handlers and workers to take care of their every need during your stay. \n
            "What’s more, large scale, permanent housing structures the size of some of the realm’s manors in the form of inns that had been put together and separated graciously by province, for the convenience of the Lords and others who wish to keep with their traveling companions. All are set with hearths, rooms the size upwards of three stories in height, taverns as large as any inn you’d wish to come upon on a weary night's travel. There are places there as well to have a personal stable boy handle your horse if you see yourself traveling throughout the games. \n
            "We do warn you not to venture too far out, for these woods are alive with the remnants of the Ancients, and are sometimes at odds with the locals, or so say themselves. Nevertheless, our guard is to remain posted no further than several hundred feet away from the parameters of the city and inns, and will not be patrolling, so please be careful if you wish to explore. \n
            "And speaking of the guard, in addition to our standing cloaks, we hired on many for the appeasement of everyone’s safety during the games, as rivalries and embittered folk may find they don’t prefer the taste of defeat. We are always welcome to new recruits from all provinces, as we believe Licivitas to be welcoming towards all for the duration of the games. \n
            "Several stadiums have been built to hold and showcase the events which tend to draw in higher spectators, namely the more traditional forms of martial combat, though the athletic performance has been rising higher in viewing, with higher participation every year--the notion of competing and not being injured seems to lure in those of more classic events. There are also several stages with audiences all around the lands attending, whether to be beguiled by the leery words of a bard, or hypnotized by the smooth, flowing moves of the dancers, this is an occasion to truly distinguish yourself from your contemporaries. \n
            "As well during the games, allow us not to forget the stands set in place for many a merchant to have loaned to them for the ongoing events taking place, free to sell whatever they had brought with them, the grounds for their sales completely up to them, trade with items you peddle yourself, favors you can offer, or purchase outright with gold you saved for this very opportunity."`,
        
        past_events: `"1 AE - The Ascea I, The va’Esai  containing only Licivitas \n
            4 AE - The Ascea III, The va’Esai ‘West Fang’ containing Licivitas and the West Fangs \n
            12 AE - The Ascea V, The va’Esai ‘Fyers’ containing the aforementioned and the Firelands \n
            20 AE - The Ascea VI, The va’Esai, ‘Fyers’ containing the aforementioned and Sedyrus \n
            33 AE - The Ascea VII, The va’Esai, Mathyus Caderyn, Noth’eo Containing the aforementioned, the Northren Lords (some), and the Ashtralands, Mathyus Caderyn places high in the competitions, winning the grand melee and melee. Caelus Dachreon also enlists and places highly in the grand melee as well, in addition to the Art of Rhetoric showcase. \n
            40 AE - The Ascea VIII, The va’Esai, ‘Ashtre’ containing Licivitas, the West Fangs, the Firelands, Sedyrus, and the Astralands \n
            50 AE - The Ascea IX, The va’Esai, ‘Alluring Islander’ containing the aforementioned and The Alluring Isles. Almost did not take place because of the advent of the Arbitration Wars.
            50 AE - False Treaty, culmination of the Achreon Kingdom Conquest. Mathyus proclaims himself King Mathyus Caderyn.
            58 AE - Arbitration War Ends, Achreon Kingdom Concordat. The Daethos formally coronates and recognizes the title, naming the First Fox King Mathyus Caderyn I, Mathyus the Merciful, The Ascean va’Esai, the Daethic, Warden of the Eye. \n
            60 AE - The Ascea X, The The va’Esai, ‘Fyers’ containing all the realms for the first time, albeit some of the Northren Houses did not participate due to the Great Northren War. \n
            120 AE - The Ascea XVI, The va’Esai, Mathyus Caderyn II, Northren (Achreon Kingdom)
            122 AE - The Exiled Rebellion occurs, with Mathyus Caderyn dethroning and exiling Fyn Caderyn I. \n
            130 AE - The Ascea XVII, The va’Esai, Theogeni Spiras, Ashtre
            133 AE - The Fireland civil war occurs between House Ashfyre and House Spiras, culminating in a Blessed Hunt by the Ma'ier, killing High Lord Laveous Ashfyre, along with heirs Torreous and Fierous--the youngest, Searous, surviving and being dethroned by Theogeni, whose own heir perished, Synaethi.
            133 AE - The Siege of Fox Hollow occurs, a simultaneous siege involving the exiled king Fyn Caderyn and multiple houses of the Soverains. Massive death ensues. \n    
            140 AE - The Ascea XVIII, The va’Esai, Evrio Lorian Peroumes, Licivitan
            140 AE - The Armistice of the Achreon Kingdom and the Soverains occurs.
            141 AE - The treaty between the Achreon Kingdom and the Soverains is signed, ending the Great Northren War."`,
        upcoming_event: `"The Ascea XIX is the upcoming tournament of tournaments, taking place in 150 AE."`,
    },

    Augmentum: {
        preamble: `"A training ground to embetter and refine traveling judges across the ley, its institution housed in the coastal Licivitan city of Vatre."`, 

        requirements: `Requirements \n
            "Green Eyes, interpreted as given the Achreo (Wild) Gift of Nature’s Neutrality. This is the first and oldest security measure for identifying genuine Arbiters, and was incorporated with old religious connotations, namely druidism, amongst other forms of worship for the Ancients. \n
            Solemnity - A second requirement involved in the path of becoming an Arbiter is giving up and severing ties to a surname and presumably house loyalty, in addition to the inheritance that may bequeath one thereafter. This is the second security measure forged for maintaining the purpose and investment of Arbiters, giving ill reason to sway themselves from their duty. This obligation was drawn up after the scandal during the Achreon Kingdom Wars, when the man who would later be known as the First Fox summarily used the power and authority wielded by an Arbiter for purposes of forging a Achreon Kingdom under false pretenses. \n
            Falling in with this line of correction for possible outside influence, the limit at which we accept those seeking this duty to the realm was lowered to four. We find that children by this age have well learned the ability to speak the common tongue, and have properly been exposed to other children in an effort to give them comfort around folk in general. This allows for an easier adjustment at the institution, where their minds are more readily accepting of knowledge and information at large. \n
            Tree of Law - Another requirement that was weaved into later generations was the branding of an achieved Arbiter with a unique seal to the institution, and only once they’ve proven themselves adept at the trade. This was the third security measure for identifying genuine Arbiters, in order to separate those who were eligible for the practice upon approval by their superiors, and granting a measure of comfort for the lands unfamiliar to a new face. This deterred folk who may have been expelled from the school, and were known to have attended at one time in the past, from masquerading as a genuine Arbiter. \n
            Admission - While this position is held in high regard for the duties performed, and all are eligible on the basis of the child faring in good health as well as green eyes, it is noted that there is never a lack of demand for suitable candidates. Of the ways one can go about gathering children, they tend to be offered in several fashions:
            Poorer families in exchange for money. It’s not always possible in these times to cover the mouths of your family members, and if certain parents were desperate enough, it is not for us to decide whether they should be held accountable for the upbringing of their child. This isn’t without its proper compensation on the approval of an application. \n
            Wealthy can scheme to give children to shift ‘Wills and Testaments’. While there may be quibbles about who may give them the right of what during inheritance, this does become a precarious way to go about the issues down the line. \n
            Nobility can give them up to shift succession. This falls more or less in line with the previous way people may offer their child’s life and duty for our cause. It may seem inscrutable for parents to partake in an action with these intentions, but we are not to decide those kind fates. \n
            All can perform that act as a note of honor. This is more or less the belief we stand by when accepting the children of families. This is a most noble practice for the good of the realm and a chance to truly give back to everyone for the greatest good achievable."`,

        abilities: `Abilities \n
            "Martial Prowess - Functional with standard sets of armor and weaponry, a second security measure for maintaining the purpose and investment of Arbiters \n
            Diplomatic Immunity - They’re not to be subject to the ‘Rules of the Land’ - third security measure for maintaining the purpose and investment of Arbiters \n
            Study of Law - In every province and culture, with a slant towards Licivitan Law, seen as the backbone of much of the ethics these are derived from. This includes different cultural norms and ways of thinking when it comes to how one may act and conduct themself within a Achreon Kingdom, or a Soverain province, to the freer cities south of there. Trained to abstain from rhetorical fallacies, committed to ethics and reason above all else. \n
            Study of Nature and Travel - Constantly traveling every change of two seasons requires familiarity with surviving the climates and geography. Much is to be said about the effectiveness and efficiency of an Arbiter traveling about the land. It is not uncommon for him to gain attachments from people wishing to keep a steady pace and follow safe routes and passage about the land. However, it is of the utmost secrecy and important for the Arbiter to keep the whereabouts and which destination he is charged to travel toward. A savvy person may be able to guess where one is headed, though it may not do well to use the information as it’s well known that Arbiters travel quite fast, and always remember a face. \n
            Mannered - Formal with grammar, ethics, and courtesy - Arbitration requires and thorough understanding of written laws, cultural beliefs on judgment and punishment, and quirks of the people he’s currently aiding \n
            Language - Well learned in coded language to communicate with the school of Arbiters. This is seen as another  security measure for identifying genuine Arbiters, and keeping various letters from reaching into the wrong hands."`,
            
        function: `"Roaming from City to City and rendering judgment on behalf of the reigning Lord, King, or de facto leader of the city or port. The largest question once posed when getting other parts of the realm to agree to such practices was, why? Take that question and hold it, to all of the following scenarios."`, 

        ethics: `Ethics and Morality \n 
            "The Lord’s son is charged with breaking a betrothal, and the woman he’s set to marry is not of his realm. Upon which judgment shall he find correct? \n
            Does he side with the betrothal, and by extension the brokered law? 
            Does he side with his son, and by extension his family? 
            Does he side with tradition in the realm, his realm, or the bride-to-be’s? 
            Does he find his son a new bride-to-be, lawfully ending the betrothal, removing him from his charges, and potentially insulting another realm’s Lord’s daughter? 
            Would he rather find himself removed for the issue at hand, and seek another’s counsel? 
            What Lord would deign to seat his authority to someone else beneath him, would that make him no Lord at all? \n
            What if he could transfer the judgment to a neutral party, whose only insistence is the consistency in which the law is upheld? Who would argue against the authority of the entire realm at stake? The betrothal is broken, or perhaps not, and the bride-to-be’s father is slighted at the accusation that her honor is stained. Any move made by the Lord of the son is positioned to anger or insult one person or another. However, the Arbiter would see this for its folly, that the bride-to-be’s father, the Lord of another house is pushing his House’s honor, legacy, and legitimacy above the truth of the matter, and the law all must abide. And the first Lord, can he stay his hand when rendering judgment and remain above the emotion begot at such time to clearly choose the path of justice? Such questions needn’t be posited, for the matter can, and shall be taken care of with a compassionate yet firm and ultimately steady hand. \n "`, 
            
        duties: `Duties \n
            "Commoner’s Upkeep: Of course, not all such concerns will be of high regard and duty, where one’s sense of justice may conflict with potential personal loss or gain. Such pleas and queries as: disputes over selling livestock, bartering over a horse for travel, armor and weapons for protection, spoiled and hardened bread, a woodcutter’s axe, a miner’s pickaxe, a fur-cloak for the change of seasons, the unending disagreement over plots of farmland and titlement, claims of adultery, theft, and rape, so on and so forth. The issues of the realm at large can beggar a poor Lord who hadn’t the time nor energy for such tasks, yet the Arbiter does. The principled man of law and courtesy is at your service for all tasks needed of the land, from small and inconsequential, toward more concerning and grave. \n
            First Duties - Upon reaching the destined site to begin his duties, he will invariably be met by the guard whom he acknowledges and presents himself as the newly enacting Arbiter for the duration of his stay. At this point the Arbiter seeks out a trainer of carrier birds, while either a messenger of the guard reaches the steward of the Lord or the reigning Lord himself, whichever is common to that land. Once reaching the bird keeper, typically a Sage, he pens down a formal letter, and seals it with his personal marking stating his arrival, with confirmation of his identity, and the duration of his stay, to verify that the information sent was correct. \n
            Second Duties - Afterwards, it is apropos for the steward, if not the Lord of the land, is to escort them to their lodgings. If offered only the inn, that shall suffice. If offered only the guest quarters of a castle or personal fortress, that shall suffice. If offered any measure of option, we find it is best for the Arbiter to choose the more formal preference. Our observations make note that the host of our Arbiters appears to be more cordial and open to their duties and judgment if they presume the Arbiter is indebted to him, despite the belief being figmentary."`,
        
        other: `"Compensation - Their life is one of solemnity and practice of their art, not for personal profit or gain. All they have carried with them are but necessities for a life of travel on the road. \n
            Travel - Typically accompanied with a horse or such animal befitting faster travel, it may vary from Arbiter to Arbiter, with some preferring a quick courser, leisured palfrey, or hitching an entire wagon or cart to a couple of horses. \n
            Lodgings - While on location, they are to live without excess, typically at Inn’s when available, or Castle guest wings, for the duration of their stay. Pertaining to issues of cost, for their beds, meals, modest entertainment, these are to be directed toward the Leader’s pursestrings. \n
            Relationships - In a word, nonexistent. To put it short, the saying goes along the lines of “Hold no Houses, Bear no Babes, Tie no Tryst, Continue no Correspondence.” This is for the good of the Arbiter to keep a semblance of neutrality with their decision-making and judgement, as well as allowing good faith among the host, knowing that any verdict rendered is just and without bias."`
        },

    Museum: {
        preamble: `"To others within the Museum, it is ineffectual to hail everyone as Sage, for there are rungs to be climbed. Do not take this for arrogance or insolence however, as there are many Sages bustling about, and you may never see one’s eyes or veritable features enough to recall them by name. Nor in this respect is it likely to remember their title, however, it is fairly easy to track given their raiment worn. \n 
            "This is standard practice for the Neophytes as they are by design, novice in their understanding. Over time, the level of familiarity will grow, and mentorships will be forged, leaving some to be preferred by their given name, and others more stringent in their adherence to the tradition and always have their name preceded by their ranking. \n
            "However, to the outside world, the common folk, and those not a part of their society, collectively they refer to the members as Sages, formally. Again, over time this may change and shift due to the nature of respect, yet it remains the most common and distinguishable euphemism."`,
        requirements: `"Blue Eyes, interpreted as given Nyrolus’s (Water) Gift of Curiosity / Senari’s (Wisdom) Kiss of Knowledge. This is a holdover from the Age of Ancients, a sort of appeasement to the ways of old and a concession in order to form a bridge of peace when many still clamoured for the old faith. It is one of their older requirements, and while it doesn’t carry any belief as it once had, it remains in effect."`,
        abilities: `"The Sage doesn’t tend to speak of any ability in the traditional sense one might believe of a wizard, magician, or soothsayer. However, he is quite well versed in history of the realms, through the reading and translation of various texts time immemorial. What’s more, they are also educated in the function of the world and nature, through careful study and observation. This is also seen in their recording of the stars, the sun, the moon, and the patterns they bring about. \n"`,
        hierarchy: `"Hierarchy
            Magister - Those who have summarily achieved all positions and worked to attain the ranks of Sedyrist, Nyren, and Sophanus are heralded as master of all trades within the confines of the college, and are elevated to the position of Magister. These esteemed wizards of the mind run the Museum, and are free to come and go as they please from the grounds of the college, taking part in courses and lectures as they see fit, to reading and exploring old texts no one bothers to look at. They’ve certainly earned the allowance to do so. \n
            Sedyrist - This sect of the Museum appears in no small part crucial for the Sages at large, yet in some sense the most removed. They are those well inclined to the knowledge and practice befitting a Nyren or a Senarus, yet choose not to widen the breadth of that pool, and instead apply it in some form, not only within the halls of their college, but to forge that gift all around the realm. Notably they are to have been encountered in any major city, port, castle or fortress, hired on as an established intellectual to further the progress of a particular governance, or in some cases tasked with the aid in development or improving upon a society in some manner. The breadth of their knowledge (for the most sought after Sedyrist) reaches across the full gamut of their interests, and can be seen working with tradesmen, smiths, port captains, and Arbiters--to educating the children of nobility, or even counseling a Lord in his duties to his people. An experienced Sedyrist is worth every coin it is said, and can raise a land of meager beginnings into a prosperous and established player in the realm. Surprisingly, this title is in homage to Se’dyro (Iron), for his unyielding interests into the function of the world at large, and applying it without error. \n
            Nyren - This is seen as a specialization in the aspect of seeking knowledge. These Sages have a wandering and curious mind, constantly playing at the seams of what understanding has been established and pushing it further. This may take effect in the form of the extrapolation of previously written and archived texts concerning the peculiar properties of certain flora that grows in a specific part of the realm, or the connection of the octopus to its fearsome and monstrous kin, the Kraken. This rank gains its affection from Nyrolus (Water), for his inquisitive nature and flexible mind. \n
            Senarus - Those who walk the path of this particular Sage have a more charitable vision in their mind. They seek to raise up young initiates and educate them in the most profound literature attained, giving them the gift of knowledge and aid them in their quest to further the studies and practices of the Museum. They serve as dutiful teachers, imparting all they’ve gained for use on the next generation of Sedyrists, Nyrens, and themselves. Their namesake is taken from Senari (Wisdom), for her compassion in helping mankind become more learned and knowledgeable in their lives. \n
            Adept - Similar to the scholar, these members have in effect been awarded a prodigious understanding of texts, education and methodology to practice the arts and specialize any way they see fit to their interests. However, this isn’t to happen in the immediate time frame after their achievement, and may be granted up toward one year's time to return to their home. This allows them to rejoin their family and experience a life outside the halls of the building, its courtyards, menageries, and botanical gardens. \n
            Scholar - These members have grown into adulthood, and while still educated in the practices and studies of a Sage, they are not quite as gifted in those respects. They are the backbone of the Museum regardless, and are relegated to the updating of texts as they decay over time, and awarding new translations to those still held in the old tongue. Most conveniently, they are also the stewards of Magisters, and those specialized in their training for the time they spend at the Museum. \n
            Neophyte - An initiate to the Museum, untrained and unskilled. These members tend to be young in age when their minds are fertile and can be expected to grow steadily in an environment full of knowledge and study."`,
        function: `"As written and explained before, they are typically utilized to further knowledge and instruction to those who can afford such talents to their lands, typically seen in places all around the realm, from the South in the Firelands, Sedyrus, and The Alluring Isles, all the way North towards the Achreon Kingdom and Soverains. The King himself keeps with him a Sedyrist on hand."`,
        innovations: `Innovations:
            "Nyrolus Lens: This operated as a form of magnification using panes of clear glass and water. More rudimentary in nature and has gone out of favor in lieu of the Sedyren variety. \n
            Sedyren Lens: Cut and ornate measured to allow magnification of sight, sometimes can be held as is in the hand and traced over writing for better clarity and legibility. Can be utilized through tubing to allow further sight gained favor."`,
    },
};
export const IntstitutionalButtons = ({ current, options, handleConcept, handleInstitution }: { current: any, options: any, handleConcept: (con: string) => void, handleInstitution: any }) => {
    const [show, setShow] = createSignal<boolean>(false);
    const buttons = Object.keys(options).map((o: any) => {
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceSub' style={{ "font-size": "0.65em" }} onClick={() => {checkShow(current, o, show, setShow); handleInstitution(o);}}>{o}</button>
            <Show when={current() === o && show()}>
                <SubConceptButtons options={institutions[o as keyof typeof institutions]} handleConcept={handleConcept} />
            </Show>
        </div>;
    });
    return <>{buttons}</>;
};
export const SubConceptButtons = ({ options, handleConcept }: { options: any, handleConcept: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        if (o === "Preamble") return;
        const text = o.split("_").join(" ");
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceConcept' style={{ "font-size": "0.65em" }} onClick={() => handleConcept(o)}>{text}</button>
        </div>;
    });
    return <>{buttons}</>;
};

export const SupernaturalEntityLore: SupernaturalEntity = {
    Hybrida: {
        Preamble: `Hybrida \n
            "These are twisted unions of flesh and caer or man and beast, neither wholly one nor the other. Some regions use the term Vasthari, a stitched vessel of sewn flesh, with others the Likyrvain, the unnatural forging of two caers in one body."`,
        "Ahn'are": `The Ahn'are \n
            "These creatures are mighty, standing as tall as a man, but fare a bit lighter, making up for it tenfold in their gracious ability to fly on wings spanning twice their height. Legend speaks of Ahn've, a capricious Ancient, never comfortable with her choice of setting, weaving a spell to tether a unique bird to that land with a worthy sacrifice of an adherent follower, so as to keep her company. \n 
            "Depending on the breed it took after, these creatures could soar far and above, out of eyesight of an observer, and come swooping down at terrifying speeds, capable of snatching unsuspecting folk from the land, never to be seen again. It is said there is a distinction for every one of the lands in which they inhabit, and for this reason the various leaders have made it their unofficial moniker to breed the pure variants for their carrier birds, and are cared for more deeply and thoroughly than the rest. \n 
            "Oral tradition has given way to the writing of various tomes, books, and scrolls on the subject, with most conjecture believing in their existence now or once before, as said writings keep valuable information on the instructions to tend for the birds, in addition to quirks, breeding practices, behavior, dietary preferences, and preferred places of habitation. \n 
            "The Ahn'are themself, though, seem to take after more pernicious, human-like behaviors, and are said to be full of trickery, luring with their voice--Shrygei believed to having gifted them with such beauty that they could not help but sing such sweet music, an affectation for his love of Ahn've, keeping in tight flocks and picking off prey when necessary to feed themselves and their children, or so the tales say. \n 
            "Evidence has been noted of larger nesting grounds that could house such creatures of size they're purported to be, though fewer still have any proof of their legitimacy, sans witness reports and 'honest' accounts. Invariably, it's hard to know which features are the most prominent between them, as you would do better to spy the bird of the specific province in question, and extend your mind to what the creature would look like, overlaying a human specimen."`,
        
        Cerchre: `The Cerchre \n
            "These beasts are imagined to be some splicing of a stag and a man, managing to stay upright and bring their height well past that of a giant man, anywhere from eight to ten feet depending on the account, and that is without consideration of its antlers. \n 
            "They can move on four legs for fast travel, or stand on its hinds and unfurl its front hooves to become finger-like, with its hooves acting as knuckles, each acting as its own battering ram. Covered in a thick tuft of fur that lines it from hooves to antlers, with varying colors of brown, to red, to gray, and white, with some having myriad throughout its hide. A hulking spectacle when seen upright and shoulder to should with muscle and brawn, keeping most of its stag-like qualities, yet able to flex, bend, and move like a man. \n 
            "Only seen as a man, with a large rack of antlers, no accounts mention those bare and without, unless they have been broken or severed recently. Their mouth has a dangerous bite with a large row of sawn, flat-edged teeth, esaily capable of crunching the bones of a foe, it is unknown for sure whether they devour or simply kill man. They have been said to go into a fervor and break apart their antlers to use as a multi-edged weapon, increasing its reach in a bloodthirsty attempt to kill or main whatever is in its path, leaving blood stumps to adorn its head until they grow anew. \n 
            "It is a mystery where exactly these may live, though most stories come near the Eye and its surrounding parts, where very few venture, fewer return, and the fewest of all have their wits about them to retell any misfortunes their eyes were desieged with. Rare and in legend, folk are not certain if they breed with elk or human women, though tales recount the disappearances of fair maidens where they have been known to reside. \n
            "Commonly associated with Tshaer, and perhaps were creations by the most devout followers submitting themselves to be physically transformed or have their consciousness placed into beasts to defend nature during the War of the Ancients, and Kyn’gi, for its nature to prey on man and take maiden’s as rights of conquest or ceding to a carnal lust. \n 
            "Another belief is that it’s more natural, pure cousin was captured long ago, and The Dachreon of Druids would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, and mend itself into the creature, becoming one and transforming. "`,
        
        Chioba: `The Chioba \n
            "Much has been discussed ove the ages as to what exactly these creatures are: dwarven cousins, stunted Tshios, a runaway strain of human that severed their connection long ago? Regardless, the agreements remain the same, Chioba live in the destittue cohabitations on the brink of society, found in various regions South of the Northren Soverain. \n
            "Perhaps it is their appearance that gives them admonishment form the common folk, standing shorter on average than humans, with a bit of curvature about their spin that seems to naturally occur in all their kin. It does not appear to be the case that their complexion and features differ all too much to that of humans or dwarves, though it has been said they give off monstrous feature not quite found in either of the two. \n
            "Their skin appears a bit sagger, a little more worn and putty-like, giving them alrger noses, ears, and lips, looking like a poorly carved statue resembling a human. Their teeth appear a bit more loose and jagged, stained yellow from their eating habits, and look to carry a few too many to ease someone's comfort if they were to offer a smile. They do not carry much weight, with elongated limbs, stretchy and bony all the same, their joints poking wide than the breadth of their muscle. \n
            "They have no issue wearing clothing and take to human cultures rather well, yet their distinct appearance shows their true nature rather readily, even when bundled up in cloth, silks, leather, or furs. Their nature is in keeping with that of a human or dwarf, rather wild and as varied as the next. \n
            "They do not appear to suffer any ill's of the mind, for better or for worse, and while they seem to suffer a natural impairment physically which doesn't take to large scale agriculture, hard labor, or martial prowess, their ability to work a quick, set a scale, or fine tune a string is well appreciated. To this degree they seem to have set themselves appear mildly from their dwarven counterparts, as they are all but useless when subjugated to hard, manual work. And, like the dwarves, those who find their kin to be cursed with the blood of the Chioba tend to offer them over to their kind, perhaps in misguided love, to give them a life more accepting and tolerable. \n
            "It is not certain where exactly these man-like creatures have risen, with some saying they are a deviation of an Ancient, or the creation of one: Chiomyr if you despise them, or Shrygei if you are cordial."`,
        
        Cragore: `The Cragore \n
            "As the tale goes, these are strong, brutish creatures that live among the rocky hills and mountains, heard to reside on the ranged separating the Achreon, now Daethic Kingdom from the South, and around the spine of the Astralands. \n
            "Standing tall relative to humans, they are well over six feet on average, with stone-carbed muscles and patches of hair strewn about their body. Replete with harsh, bone-crushing jaws filed with two sets of dog-like teeth--often said to be maneaters, and potentially cannibals as well. \n
            "Their eyes are large and darker in color, with pupils covering almost its entirety, granting vision as night when hunting nocturnal game. With that, they seem to have flat noses with smaller nasal passages to more easily warm and wet the thin air, and larger ears to pick up on trace sounds about the wilderness. \n
            "A darker complexion adorns them, with mixtures of bronze and mahogany, to forest greens and subdued colors in between. Legend has it that their lives are ruled in a hierarchical structure, with bands of them that may venture down the mountains to raid if they see travelers or passersby. \n
            "Different weathers along the mountain ranges precipitate different tribes and within them, various beliefs and interwarring. It is not ceratin if they believe in an Ancient and still pratice adherence toward the old, but if one were to bet, it would be easy to imagine prayers being sent to Kyn'gi, Se'vas, and Tshaer. \n
            "No one is certain how stable or fruitful their population remains, though it does not seem to affect the amount of reports that accumulate, based on season and variance of travel. Some tribes are rumored to speak and understand neightboring languages, going so far as to gleam and mimic their cultures as well, though most don't believe these creatures are capable of such thought. \n
            "Some of the boastful even go so far as to say they have barted with these monsters, and seen their villages, sharing in food and drink. Believe these tales at your peril."`,
        
        Dwarves: `Dwarves \n
            "This is not to be confused with the uncommon, unfortunate, unforgiving small folk you may see plague and curse a family. These creatures are cut from something harder than flesh and bone. They look heavy, of squat stone, carved into being and given achre from one of the more creative Ancients, Se'dyro. \n
            "These dwarves tend to live around the North in the mountainous ranges, said to be working with the neighboring folk, even the provincial Eulexes and Soverains. They bear a reasonable likeness to humans in the varieties of human expression, physically and caerenically. \n
            "Short and stout in all regard, their bodies have stuned limbs, which easily cord heavily with muscle and coarse hair through maturity, and when given exposure to certain fields of work. While they would not do well in an agile envrionment, they have a heart body that causes little breakdown of energy or determinatino, able to work and cloister themselves in harsh conditions for periods on end, much to the chagrin of some humans, and admiration and exploitation of others. \n
            "They do not appear to be stout of mind, capable of working with various parts of human society to extreme precision, aiding them master craftsmen and engineers, though the more unfortunate may work in other capacities, namely field work and mining. \n
            "It is rumored that they are not truly different from human in their breeding quality, and it may be that their kind are propogated by shameful lords, nobility, and peasants sending their cursed children tot hese places as a means to rid themselves of a burden and keep their stock well bred. \n
            "If you have not seen a true dwarf, they are not as one may expect, whether to assume they were truly cut from stone, or a malformed human given away."`,
        
        Gatshyr: `The Gatshyr \n
            "Human-like cat creatures with reversed palms being their most notable trait after the fur, color, and head of a feline. They come in different breeds depending on the land, with some looking like that of lions, lynxes, jaguars, and even tigers in the Isles. \n
            "Their size is precipitated by a relative breakdown of how large the cat tends towards, with a tiger Gatshyr stretching out past ten feet, and the Lynx making to just about five. The framing of their bodies appear to be a mixture of cat and human, with an elongated torso and tail ala the feline, but the levers, muscle insertion, and hand-like paws of the human counterpart. \n
            "These often look like betwitched animals, having growls and roars as though it were a poor imitation of speech, but many have said to hear the utterances close in pattern to that of a human. \n
            "Dangerous predators that tend to be seen in smaller packs, and odn't spare humans from their eating habits as a consequence, it has been said that there are no natural predadtors of the Gatshyr. Do not wander the hills, forests, and mountains by your lonesome, lest you test the patience and stalking powerss of a Gatshyr lying in wait. \n
            "Where you would normally find its pure, animal counterpart is where you may find them, leaving one wondering if the spotting of the pure animal breed is a harbinger for osmething much crueler, frightening, and savage, loitering in the trees above, or down below in the bush, watching you. \n
            "Commonly associated with Tshaer, and perhaps were creations by the most ardent followers submitting themselves to be physically transformed or have their mind placed into the beasts to defend nature during the War of the Ancients. \n
            "Another belief is that its more natural, pure cousin was captured long ago, and the Dachreon would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, mending itself into the creature, becoming one and transforming."`,
        
        Ilire: `The Ilire \n
            "These beasts mix a great deal of belief, fear, and goodness into a harrowing monster. It is believed that Ma'anre cursed followers of Ilios during the War of the Ancients, transforming them and showering their hideous true nature under her unyielding glow, marking them as enemies or potentially traitors to their cause. \n
            "Another belief is that its more natural, pure cousin was captured long ago, and the Dachreon would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, and mend itself into the creature, becoming one and transforming. \n
            "The appearance of one tends to differ based on which inn or region and which drunk is prattling on about their account, or whose wife's brother swears upon his belongings he's seen one. Generally, it seems to deal with a wolf-like man, which takes on feature of wolven skin, temperance, and head, but adds a man's cruelty, cleverness, and rage that couldn't be found amongst such a common beast. \n
            "Reports of size varies based on the man possessed with such a foul caer, only shifting in appearance and adding a bit of length about the snout, legs, and paws. The natural hair of the man is reflected in the coloring of the wolf's fur, so if you witness a righteous 'Faith Cloak' on a midsummer night's stroll violently thrash about and remove his armor to reveal a man of black locks, prepare for a most righteous and rueful smiting only a creature of the void can summon. \n
            "And if you witness a wolf behaving a bit strange, a good tell would be to hear its howl augmented with the nuanced pitch, coupled with the remarkable and terrifying gaze as it stares you downwith two enlarged, yet distinctly human eyes. \n
            "Accounts vary on whether it can function only on four legs or if it's capable of stalking on two. One thing all men swear by is the timing of their encounters, relating to the swelling of the Mother Moon, give or take a day for good measure. \n
            "This does not seem to be reasonable given that a man is a man and a wolf is a wolf, needless to say the evidence is quick stacked, if you would believe them. Either they only hunt during the moon's swelling, or a cursed man turns during its full breadth. \n
            "And one more thing, in case you feel frightening to go out during the hours it might be prowling, one should be safe when holding a weapon or armor 'encased in purity'--What this means it is not certain. Some believe it to require faith in Daethos, or a blessing by a member of the Seyr. Others take it to mean someone who is absolutely in their bloodline or lineage. \n
            "Be careful of their swipes and bites, however, as the curse of the Ilire may spread like disease if they can entrench themselves in your coursing blood."`,
        
        "Ma'ier": `The Ma'ier \n
            "The most human-like of all these entities, their appearance ranges as much as the average human differs fro manother. They can be short, bald, and take, to tall, lithe, and handsome. Men and women have been said to possess ma'ierec qualities or outright be one. \n
            "First stories recognize that perhaps some of these most adherent worshipers of Kyr'na are said to have been warped into, or perhaps that was their cruel reward to an appeasement toward her. Other stories mention Ilios cursed the followers of Ma'anre, who joined sides with Kyr'na during the War of the Ancients, expunging and erupting them into flames upon the purifying light of his unwavering presence. \n
            "There is old, traditionally oral lore, coupled with tomes eventually transcribed, that details the behaviors and traits of a Ma'ier. One may notice their gray, ashen complexion that seems to soak in the moonlight--others take a different path with a bronzed tone. Another would be their dull, lifeless eyes, stricken from a rich color, whatever it had been tends to recede to a faint, glassy, grayed hue. \n
            "Their scent smells similar to that of well-worn chainmail and a smith's lair. What is not obvious at first glance is their avarice, which may take on a feral trance, and their passion can consume them in a variety of manners. Need to know if you are consorting with one? Lock them in a cell for a few days and check back up on them. Their eyes will have sunken skin--taut and rigorous, with gums receding to show a peculiar set of sawn and jagged teeth. They will have labored breathing, rapidly callapsing their chest, with a hunch caused from the unbearable pain in their abdomen. \n
            "Other issues for them include the 'Right of Invitation,' in which a Ma'ier will never overtly mention, they will require acceptance to enter private doman or suffer irrevocable pain akin to their 'Curse of Avarice.' Another if their admonishment of Ilios, and Daethos. This causes a slew of issues when dealing with members of the religion in positions of power, the baneful sigils and relics of it, and places of worship. \n
            "Another detail written is their concern with natural running water, absurd as it may be. One would not wilfully cross it, and only be subjec to passing through if he were carried in some manner. \n
            "One last measure to lookout for is their dealings with the Sun. They may seem folly, as how can one scorn the Sun while masquerading? One does not have to lead a life where this is an issue, where the Sun does not appear, for long or at all; or a life that does not beg for one, such as a guard through the night. This leaves much time during the day for other actions and events, though even a Ma'ier must rest. \n
            "Beliefs diverge on how long such activity must last, though no one has noted less than three hours time in the soil of the land which bore him life. Which poses another concern, is it his first life mortal, or his second, born again? These do not seem believable or true for an actual creature to suffer, a sort of caerenic pain being experienced. \n
            "Then again, the power of belief in one's caerenic pain is palpable and embedded in all things, even humans, so do not assume these are not possible if you believe such a foul monster persists throughout all this time. \n
            "For all these flaws one might hear, they are not without their spoils. These cruelties have powerful charms that can be cast with as little effort as a piercing gaze, effectively charming said humans for a time. Abother is their enhanced prowess and strength in many forms, through a strict concentration on man's blood, he gains insight to embolden himself with heightened sense, strength, agility, recovery, ceaselessenes, and recollection, with some times at the expense of a victim. \n
            "Of course, this is the totality and amalgamation of various accounts, but one wonders if such a creature exists, with its years of cleverness and experience, just how far one has risen?"`,
        
        Morath: `The Morath \n
            "Possibly the most fearsome of these abominations, one must be thankful that these appear to be of little truth--yet further still, its pure counterpart is dangerous enough to give pause all the same. \n
            "Thought to be the mending of bear and man, these appear in legend similar to that of the Cerchre and the Tavore, with various tales teeming with potential truth, and some a clear farce from any analytical perspective. \n
            "Comfortable on all fours yet capable of walking on its hinds, these great beasts rival the Quoros in stature, toppling over fifteen feet if some accounts are to be believed. In their rage, they are capable of felling trees in its way, seeking to attack and devour its sights, whatever it may be, even those that are its monstrous hybrid counterparts. \n
            "Beliefs diverge in its human qualities, with some imagining the skull of a man is blended onto that of a bear, its eyes appearing intelligent and clever, its speech jarring, like a man roaring in unison with a bear, revealing teeth that can bisect through full plate if it housed its next meal. \n
            "Its fur appears to match that of its purer cousin, and had been said to lead such packs and corral them in its environments, ambushing and upending groups of Dachreon who thought they were in better communion with nature. \n
            "Mainly seen among the North, there have been sightings and witness accounts littering the coast along the Fangs and the Firelands, with similar concerns mentioned toward their appetite for humans. It is not known for certain whether these creatures had ever existed, or were mistaken for simply a larger bear coupled with a weary traveler whose mind wandered during an encounter. \n
            "Not much has been said aside from rumors as to the propagation of their existence, and it isn’t unheard of to hear whispers of maidens that go astray and disappear, perhaps to fulfill the carnal rage of one of these monsters. \n
            "Commonly associated with Tshaer, and perhaps were creations by the most devout followers submitting themselves to be physically transformed or have their consciousness placed into beasts to defend nature during the War of the Ancients, and Kyn’gi, for its nature to prey on man and take maiden’s as rights of conquest or ceding to a carnal lust. \n
            "Another belief is that it’s more natural, pure cousin was captured long ago, and The Dachreon of Druids would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, and mend itself into the creature, becoming one and transforming."`,
        
        Quoros: `The Quoros \n
            "Often these horrific monsters are characterized as being similar in vein, whether through witness accounts or descriptions in oral tradition, as bearing likeness to the Cragore, or Tshios. \n
            "However, this appears to be misguided myth. Quoros are believed to range between eight to well oevr twleve feet high, described as a shambling mountain slide. Their face is said to be similar to craftwork dating to a pre-written time, rough, large, and calloused, without an effort for finer details, mirrored in its set of thick, flat-edged teeth, each looking like a sword cut near the hilt. Adorning their head, if not bare, have accounts ranging from hollowerd out tree stumps, crude and rusted iron caldrons, to skulls of ancient animals or perhaps mightier, dead Quoros. \n
            "Large is an understatement, with shoulders that would take a pavise repurposed to fit like pauldrons, body's that would require a fully-grown ox to field the leather to strap around, hands like beaten slas of stone, with each finger the size of a man's gaultlet. Their arms and legs are effectively tree trunks, which as legend has it, does allow for a strangely reasonable amount of concealment, in no small part from their hair growing in length and color witht he changing of the seasons. \n
            "These creature may stand as still as oak, and allow you to pass by a time or two, but if their temperance wavers, they would be quicker to snatch you than a snare built by an expert trapmaker. Do not let this lull you into a sense of calm insofar as keeping a wide berth around the surrounding areas in which they are sighted, for while a man's wits may suit him where he's from, it will not match that which this mer has established its life. \n
            "These creatures, for all the awfulness of their physical nature, have not much written ont heir behavior, though some testimonies believe a monster this foul cannot have a kindness in their caer, and live as a twisted representation of a cruel jest from an Ancient long since past. Said to have awoken, or been created by Quor'ei to be used as soldiers in the War of the Ancients. \n
            "Another belief held was that some worshipers, clamouring for the Ancient's favor and being bestowed with an unhinged rage in their manifestation. In this legend, the followers were submerged beneat the earth, entombed in clay, mud, rock, and salt, to be transformed into these wicked beasts."`,
        
        "Re'vas": `The Re'vas \n
            "Said to be the one, true abonimation that has been spoken about throughout the ages, and formally scribed in scrolls and various tomes throughout writen history. These shambling creatures are described in myriad ways, whether near human-like in appearance, to referencing gross amounts of decayed and rotting flesh strewn about the face and appendages, to carrying on a more caerenic nature, able to smoke through physical objects and even possess people. If encountering one that appears more life-like, it will carry with it a more taut and still manner, still able to flex and accentuate movements and posture, but something will definitely be off when detailing its actions. \n
            "The flesh will be mottled, and fading from it any semblance of coursing blood, leaving a pale, gray complexion, somewhat dry and ashen. From there, to go by degree of rot seems natural but is rather strange, will reports on the same Re'vas at differnet points in time denote the same level of decay! \n
            "This would make one wonder if there is a property, whether natural of otherwise, that causes a cessation once a curse, affliction, or possession takes place. The writing is not entirely certain as to how these abominations crop up from time to time, and what would not only be the certain cause, but the cirumstance that calls for it, if otherworldly. \n
            "These creatures have been said to appear, or arise, whenever a great misfortune or severing of justice has occurred, plauging whomever they intent to cause harm before returning to become a lifeless corpse, or a vanishing spirit. Of course, this would imply some form of retribution or vengeance in death, which not everyone believes is correct if following the teachings espoused by Daethos. \n
            "It isn't in keeping with understanding what manifests itself after death, and the idea that the dead can continue living is considered shameful and afflicts on a curse on the remaining and subsequent lineage of the Re'vas. Due to this, it can be imagined why some are adhorrent to the notion that these creatures exist at all. \n
            "There is another table to be told about the Re'vas, and that is one that speaks directly on the belief of the elder Ancients, and Daethos. In it, ceratin tome's have spoken of a pact, older than written history, that culminated in the steadfast opposition to the rise of Daethos. \n
            "Various adherent worshipers of the Ancients, namely Lilos, Ma'anre, Ilios, and Se'vas. With this pact, time and time again throughout history, the worshipers would rise anew, either in their old bodies, possessing the corposes of others, or if truly stark, their caeren itself in order to drive back the corrupt and harmful devout associated with the Seyr of Daethos, to tear it down and restore the rightful worship of the Ancients, through the Blood Moon Prophecy. \n
            "Re'vas are also vaguely associated in part with the Ky'myr, due to the nature of a once human becoming wrought with meaning that presisted beyond death itself, and seeks to attend to such aims."`,
        
        Shyr: `The Shyr \n
            "The mischievous, human-like goat abomination, why anyone would imagine such a union, look no further than just thoughts of mutated dwarves, using unpolished stone for barter. Such tales illuminate depictions of a creature with the legs of a goat, and upperbody of a man. Unless cruel stitching and witchcraft was involved, nature would rarely be so sloppy. \n
            "These machinatinos are smaller in size, from three and a half feet to five feet tall, with cruel faces that twitch even when not uttering, and horns that curl about their ears. Cold, blinking black eyes dot the sides of their faces, and a strong set of sawn, flat edged teeth adorn their mouth. \n
            "Their body appears a bit slight, with arms that double as legs for galloping, covered in matted hair that reflect its environment, ranging from dull yellows, whites and grays, to richer, fuller browns and blacks. It has been said to never travel near one with small children at night, for their size betrays their true strength, and their appettie extends to humans. \n
            "A few moments begot of a traveling companion, and a Shyr would snatch them up, back toward its abyss, a couple deft jumps here and there, up the cliffside and gone, the last traces an echoing of the unlucky person's screams, and the Shyr 'bawwing' manically. \n
            "It is unknown where exactly you would find them, you hear about a certain mountain that may cater to their preferences, a port shor that may harbor them, or a series of forests that stretch through a field from them to graze. Perhaps rocky streams and rivers that bleed into a basin, the sightnings have been endless through oral and written history. \n
            "Commonly associated with Tshaer, and perhaps were creations by the most ardent followers submitting themselves to be physically transformed or have their mind placed into beasts to defend nature during the War of the Ancients. \n
            "Another belief is that its more natural, pure cousin was captured long ago, and the Dachreon would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awake his inner animal, mending itself into the creature, becoming one and transforming."`,
        
        Tavore: `The Tavore \n
            "A famed beast of legend, possessing the head of a bull with the body of a man. Of course, these don't exist so cleanly seperate in truth I believe. Invariably they have the head of a bull, but this leather, short-haired skin comes all the way down, standing on two legs with hooved feet and the arms of a man. These hands can curl into a fist as effectively as behaving as another foot, enabling short sprints on all fours, committing to devastating charges. \n
            "They stand quite larger than a normal man, nearing and tipping over eight feet in height, causing their head to be larger than a man, but perhaps smaller than an actual bull. They horns jut about the sides and curve forward, possessing the strength to life a man off the ground, even one adorned in full plate, goring in close quarters. \n
            "A larger snout enables them to house a great many teeth, capable of severing bone. Their eyes pitch, reflecting all encompassing light, set at the sides of their head, keeping in fashion with the commong bull one might find. Their smooth, leathered skin can come in various coats, from an oft-colored brown, to black, to start white in contrast, depending on where it may be encountered. \n
            "Most have been heard to live on the plains and stretching fields, some North of the great range of mountains, and some further South between Licivitas and Sedyrus. As to how they propogate, well, many stories entail maidens going astray and disappearing, perhaps to fulfill the carnal rage of one of these monsters. Few have said to been in contact with them, and appear to be the stuff of legend since the Last Rites. \n
            "They are associated with Tshaer, and may have been their creation by the most ardent followers submitting themselves to be physically transformed or have their mind placed into beasts to defend nature during the War of the ancients; and Kyn'gi of the Hunt, fot its nature to prey on man and take maidens as right of conquest or ceding to its aforementioned lust. \n
            "Another belief is that its more natural, pure, cousin was captured long ago, and the Dachreon of the North would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth itscontents and climbing insde to awake his inner animal, mending itself into the creature, becoming one and transforming."`,
        
        Tshios: `The Tshios \n
            "Taller, leaner creatures not without a liveliness and strength that live among the Boreal, Temperate, Tropical, and subtropical forests around the lands that sustain the foliage, such as the Eye in the Daethic Kingdom/Soverains, the Astralands, the Firelands, Sedyrus, and the Alluring Isles. \n
            "Tshios stand near eight feel tall according to some accounts, with long, sinewy limbs, both upper and lower body, and natural patches of matted hair. Their eyes are set deep into their face, human-like in the size of the pupils relative to the whites, with a broad nose, and agape mouth that is filled with sawn, flat-edged teeth, and a couple jagged adorning where a human's would sit. The mouth, as mentioned, sits open, with visible, constant breathing, though why this is a recurring report is not certain. \n
            "Their skin color seems to adapt to the condition of the forest htey surround themselves, with white hair and light skin inthe North, toa richer green in Sedyrus. Their behavior seems to change from Tshios to Tshios, as rarely do travelers recount the same tale when encountering one, but perhaps that is due to a form of achre rarely witness in other beasts. \n
            "Some swear they have found one, stabbed it, cut off their limbs, only to have them scurry off, limb in hand, no worse for wear, and the Tshios treating it with minor issue. They are said to be isolated creatures, not having a report been written or recalled in which more than one was spotted, which causes one to wonder how they propogate. \n
            "Extremely rare and waved off as legend and rumor, those said to have communicated and treated with them have boasted a renewed vigor that one was lost, and any fright or confusion held by witnessing such a creature should be waived off in favor of calm and peace. \n
            "Some say these creatures are doomed creation of some humans attemping to usurp the Ancients seat of power long ago, and must walk their days in ceaselessness, slowly losing their memories and their sins. Other's posit a more deliberate spellcrafting, believing them to be the creation of Astra during the War of the Ancients, blasting bolts of lightning down from teh skies onto elder trees, granting the shedding bark life to protect her land and people. \n
            "A similar story is told of entombing a member of the Dachreon of Druids inside flourishing treets ripe of sap, engorging nourishment to aid in the metamorphosis into the famed creature."`,
    },
    Specificus: {
        Preamble: `Specificus \n
            "Seen as an instantiation of Ancient and Man, and despite much writing, uncertain of their caste within the Ancient's concern. Some greatly cursed, others greatly rewarded. Such terms as the Othuim, referring their an unbound transcendence even in their horror, or the Vaelith, for their eternal and unnatural state, are used to describe this kind of entity."`,
        Tshiathail_Kon: `The Tshiathail Kon \n
            "Every land has their tail of this roaming entity, traveling about while gathering and uniting forces both man and mer in order to usher a new reign over the realm, one brought to its knees under its unyielding wrath. Or is this an artful tale told, not to spoiled children and those who don't wish to finish their meal, or those who bite and claw once put to bed, not wishing to end the night. \n
            "No, this legend is often said to burgeoning lords and nobility, various lineages and even kings. What is the point of this outlandish story, to carve fright through a man's chest? What do these say to them, what is their aim? One idea posited is that it warns the prideful youth to stay fyers in their beliefs, for straying away from justice and the right of the people is not to be trammeled with, or perhaps it tells them what not to do, and who not to become, the Tshiathail Kon. \n
            "A dreaful, heinous tyrant whom nature sought to banish and entomb for the good of man--it was said not a single act could be imagined that in some form the Kon had no performed. Committing such forms of treason as the killing of his own lords at a feast in his castle in celebration of a great harvest, which the poorest and most meager of lords were found missing from the plethora of dishes and cuisine. \n
            "Eventually, during the dinner, another lord spoke and asked his grace where might the poor lords be, were they denied invitation for their failing crops? 'Of course not,' exclaimed the king, with glee in his eyes, 'Why a bounty they have bequeathed to us, for it fills your mouths and bellies now.' \n
            "To say it was not love that kept their loyalty, and for that, despite his harrowing of the woods, the soil, the fields and the sea, the honor of a guests passage was one vow the Ancients could not forgive. Stories conflate such a monster's appearance, that of a human quality, however much he may have slid into a feral nature. \n
            "Standing over a head taller than a brute, it is hard to know the full breadth of his physicality; said to wear layers of armor and cloak, with once fine chainmail tarnished and cracked, aged and worn through time and conquest. Above that, a set of rich full plate, with enormous gauntlets scaled up to his pauldrons, enabling sharp twists in his jagged, indomitable approach. Heavy and dusted sabatons, beaten and caked in dirt and mud, up toward his greaves and cuirass, said to carry a faded coat of arms once held and known about the land. \n
            "Draped overhead, a thick, rich cloak, a mixture of once-great silk and more refined textures with fresh pelt of a felled beast. And always in hand, his greatsword equaling him in scale, its believed plundered from deep below Kash Amalur where the famed steel was forged. \n
            "Some posit he may have been of the Dachreon, for a grotesque crown adorns his head, a massive rack of antlers look more a series of spears than anything, melded to a skull, whether his or a trophy, it seems to move with his gestures regardless. His glaring red eyes smolder and burn outside his gaze, with a deep grin of sawn teeth, beckoning the observer. \n
            "Of course, this is not to be taken in truth, and there are no records of a king's existence in any land who ran cruel governance, nor being punished by the Ancients or nature itself. However, that is not to say that were the story's purpose."`,
        
        "Ky'myr": `The Ky'myr \n
            "Legends speak of it sability to thwart the glowering and overwhelming effects of, interestingly, the death of Lilos and Kyr'na, fracturing its caer and disposing of it in a bejeweled object or personal heirloom, which keeps the creature in a state of permanence for as long as the item in question persists. \n
            "While some sources claim that this is due to their rejection of the Ancients and their worship, admonishing the flasehoods or their nature and becoming deathless through sheer force of will, that is not the only taken spoken on the matter. Another, perhaps more pernicious writing posits their nature can be classified as a myth with far reaching effects. \n
            "These speak of a great and foul, seditions Sage", before there were Sages, becoming enamored with tbe beauty, rawness, and strength of these two Ancients. In this perverse fascination, he sought to strike at their power for his own, first pleasing for the gift, much to the bemusement of the other Ancients. \n
            "It is said that Chiomyr, upon seeing the crestfallen thinker, offered him the same gift he sought, and at once the man begged for it. It was all so easy, the Ancient of Humor chided, and within the details, which remain obscure and up for argument in some translations, that it was necessary to involve several requirements: the choosing of a personal item that bore some sentiment to store his caer, the acquirement of a legendary Sedyrus blade, and the consumption of a potion during the full breadth of a Blood Moon, of which the list of ingredients compiled a trip through all the known parts of the realm. \n
            "Some were easy enough, depending on where the Sage had begun his quest, yet others would take more than guesswork--traveling to merchant squares, ports, inns, wherever, to gather through trade or learn their whereabouts. Invariably, many moons would pass before finding all the necessary leaves, roots, bulbs, seeds, blood, and bone. \n
            "The only adjustment to bind and forge the poultice would be the cruelst task, to bask the ingredients in a mortar filled with devout, kinslayed blood, grinding and mixing them into a thickened paste. Well, the man had no the child to give to such a wicked fate, nor even a wife to have one with. And so, in his obsession, he sought a bride who loved him like no other, and after several change of seasons, the child was born. And he raised and cherished them both, filling them with every joy and touch of bliss a man can give his family. \n
            "And when the foretold Blood Moon came, were woefully sacrificed despite their cries, killing them quick with his forged steel, for his shame could not bear his wife to see his nature manifest. And, after creating the potion and imbibing, collapsed to the floor, colvusing and dying with the mixture spilling from his hands and mouth. \n
            "However, Chiomyr was true to his word, and at the rising of the next Blood Moon, the man arose as well, min ever present, but his flesh mottled and rotting, its deep seeded muscle taut to his bones. No longer would he be imprisoned in his body mortal, and never again would he deal with the aching drudge of life. \n
            "And for all that was worth, never would he know what it was like to truly live again, having forsaken his friends, his wife, his child, and the Ancients themselves, doomed with a crisp memory of all that transpired up to his transformation. Forced to exist seeing his passions and meaning of which there were none. \n
            "This tale is often spoken to folk, young and old, to warn of the dangers at seeking the end of your ambition without regard to its journey, and scholars believe that this is the true aim of these legends, rather than a rogue thinker from centuries past who found the key to ceaselessness. \n
            "For all the woe that besieges such a foul creature, they are not without the inherent advantages over the living: firstly being its immortality, in a seeming balance that nature cannot upend. due to this, they have a long standing association with Vielo, and have inclination toward the use of Insight, and Shattering, as demonstrated previously with their use of split caer. \n
            "It is not believed that these ability are innate, however, rather through their use of time and lack of distractions: eating, resting, bathing, and remaining in seclusion for years upon years on end. Invariably, with all the time to be had, one may suspect that they have come upon hidden knowledge, scrollwork, or spellcraft that would allow such possibilities to manifest. \n
            "Re'vasi are vaguely associated in part with the Ky'myr, due to the nature of a once-human who became wrought with meaning that persisted beyond death itself, and seeks to attend to such aims. And much like the former, the idea that the living may continue in a state of deathlessness is considered shameful and afflicts on a curse on the remaining and subsequent lineage of the Ky'myr, as per the Seyr."`,
        
        Nyrae: `The Nyrae \n
            "This horrific, aquatic creture has a habit of being told in the same breath as the Kraken, though in place of its many arms, the Nyrae appends its many heads. Ferociously large, though no thought near the aforementioned Kraken, it carries with it a great belly, softer than its other skin, and while I mention this girth, keep in mind it is not the same as you would expect of a drunken oarsmen, this beast is wall to wall solid and brimming with muscle, heavily corded and thick, with tales of javelins and arrows breaking upon it, leaving the monster unscathed. \n
            "Scaly on its flanks and back, it would be seen as an ever worse place to attemp an attack, with darkened, blush coloring blending well within the murky waters it finds its home. It appears, for a serpent, to have legs, though these are said to be shorter than ever the necks of this great monster. \n
            "A tail adorns its rear, thick at the base and stretching, narrowing further down the way with lobstered scaling, able to come roaring to its front without so much as a tell to be weary of its swing. Hard to believe such a creature exists, though we have the Canire to look toward to imagine some truth in its legend, with over a century of intentional breeding of the hound, well kept and maintained, and many deaths and failures litter its forced birth. \n
            "This creature, however, has no good account on its heads, be it just two in some tales, others three, and some count further, five, seven, nine even. Regardless, we do have an idea on the reasoning of it staying int he waters, as the heads and necks are quite large, so much so they are said to stretch further than the body of the beast itself. \n
            "With several heads roaming about, hungry for flesh and human morsels, each jaw opens impossibly wide as a common snake found amongst the lands, with rows of long, thin, razor-sharp and recurved teeth, ready to shred and devour anything it may get its many mouths around. \n
            "Many stories harbor around the issue from whence it came, stating to have been seen in the great Northren lake to the East, affectionately called the Nyren. Legends have it that a great and greedy lord around those parts, with a port to his name and fantastic ships under his command, sailed about the known realm in search of a beautiful wife. \n
            "With every trip, he had brought a new paramour, and taken her to bed after the ceremy to constitute their marriage. It was said he had such a large manor that he could house them without any being wise to his avaricious nature, and after the third wife had been brought back, the time would slowly count down tot heir whereabouts becoming known to the others. \n
            "When he came back to port once more with another to call his wife, his many previous wives were waiting at the docks, having seen his sails coming up river. They pleaded and protested, cried in anger and shouted in despair as their husband had betrayed their love for his lust.\n
            "Not to be controlled by his women, he had them locked away, even his new wife to be--after the bedding of course, and sailed once more in search of another, perhaps more dutiful wife. Some tales conflate this point and mention that perhaps his next betrothed was the famed daughter of the legend of the Sinacyn, though that may be speechcraft. \n
            "Whatever it was to be, sources claim that upon reaching his ports for the last time, and there are disputes on how many wives he had at this time, as he walked along the docks he was greeted by a friend, the Ancient of Water, himself disgusted by his acts of using the lakes, rivers, and seas to fulfill his improprieties, and cursed him to permanently live amongst the waters, turning him into that which he was, a grossly large serpent, with a head grown for every women he had betrayed. \n
            "It is a fun tale to be certain, and it still works for our time as a paramount reason why the bedding of many wives is disavowed in many lands, and the Seyr."`,
        
        Sinacyn: `The Sinacyn \n
            "The ever infamous woman whose sole ascension into our memories of myth and horror pertains to a beauty she possesses that is deadly, and harboring a cruelty waiting to inflict its victim. I would say that is undoubtedly true, that these terrors most assuredly exist throughout all the realm. Oh but yes, unfortunately we are speaking of the legends of these foul abominations. \n
            "There are few tales about the origins of them, and their nature, so it is at leaset easier to be concise in the telling of their species. Thought to have been a curse by Chiomyr, who was pursued by a beautiful human woman. \n
            "It is mentioned in various ways, depending on the source and translation, that she was the princess of a land where every man succumbed to her desires, and she sought it not possible to be turned away. When the Ancient thwarted her advances, she grew hysterical, and spiteful, claiming he was no greater than he pretended to be. \n
            "The Ancient of Humor corrected her appearance to accurately reflect her caer, and she lived out her days in horror and seclusion, frightened to even look upon herself. A second tale, well subscribed to believes the same princess, as beautiful as had been described, recklessly foregoing her betrothal to a lord or king of some faraway land, going so far as to give her maidenhood to her brother in hopes of spurning such a marriage pact. \n
            "This act, cursing her and turning her into the hideous creature we hear tales of now, is postulated ast he underpinning on the severity of breaking an oath towards betrothal, in addition to the woes and sin of incestual love. The Seyr adopted such tales to propagate their belief towards a more fulfilling and holy unity. \n
            "Now, what these beasts actually appear to be is the most contentious of arguments, with most depictions having her strands of hair grown intertwined, moving about capriciously until the form of snakes emerged, endlessly moving about and slithering, jutting their forked tongues about their many mouths. \n
            "From here, descriptions split further, with some accounts ranging from having the normal body of a voluptuous woman, to the full-grown body of a snake, to a more bestial, furred lower half, containing cloven hooves akin to a goat, and tallons or claws for hands, depending on whom you read. \n
            "At least one idea remains universal, her famed beauty she possessed is still there, forever ageless and as enchanting as the day she were cursed. Believed to possess the ability of charm, with her affectation being capable of casting with as little effort as a soft, passive gaze. \n
            "The old stories seem to press the tale of petrifying men and turning them to stone, but later scholars believe that if such belief were the case, it more likely coincided with the written works on 'charm.' However, the actual application more so would have been to freeze the individual and root them in place on a more mind-rapturing level. \n
            "This is of course to perform a commentary on the texts and legends as more than mere falsehood."`,
        
        Anashtre: `The Anashtre \n
            "Thought to be the manifestation of Wild Lightning. This peculiarity has a soft, diffusing glow about it--stark white in nature, kept hidden and under wraps by a heavy cloak thrown over itself. Through the back of the cloak are heavy protusions, iridescent of the earth. Not one is rumored to exist, and if a sighting was tenable and carried away from the event, scare few would believe in its nature. \n
            "It stands to reason from several descriptions since the times of oral tradition that it is of a human likeness, with affectations befitting someone you could recognize if not a fait bit 'touched.' No one has gauged their true size, though perhaps one could guess anywhere from six to seven feet in height, barefoot and dressed modestly, wearing faint garb that may have once been regal in appearance and threading. Or those could have always been set in textures more dour in nature, rough linens and leathers, furs and pelts, with an aura that has been described as palpable. \n
            "Presumed to be not quite human, it would not seem to require the use of powerful limbs, yet nevertheless it is spoken of as lean and sinewy, though how anyone could tell from its constant, faint shimmer is beyond myself. Whatever it is that adorns their back, be it plating, a shell, or wings, some invariably inhuman trait, it has been described as being seen in myriad colors. \n
            "This, coupled with the glow, has folk saying that seeing one, or something derivative, is an omen of bad tidings, for it showers the night like a beacon, distoring nature. Others attribute more beatufiul qualities to this myth, having a gentle touch, handsome face, sweet voice that sweels with music in every exhalation, and a calming presence that evokes serenity to those nearby. \n
            "To keep in line with the beliefs as they are presented, there does seem to be a number of occurrences attributed to their behavior and external to their being. As posited before, it is under a strong assertion that they do herald a form of omen, and awakening a doom to spread across the land, bringing about various signs of the awakening of the Ancients. \n
            "This leads to speculation in gossip, rumor, whispers, and even scholarly commentaries ont he subject at large--with some believing at various times int he past we were witness the dawn of the Ancients once more. As we look about us and understand, this is simply not the case. \n
            "However, seemingly less grand in scale, it has been said they are capable of a number of dazzling feats and traits, notably their soft, radiant glimmer. It is argued that this is innate of the creature, and affords hindrance to the light in way of wearing the heavily layered cloaks. \n
            "Another, presumably exuding from it without effort is the calming effect it gives tot hose around, potetnailly at an immeasurable distance, and without need for awareness of the being for its nature to grab at the passerby. Beyond that, it is said through a couple of the more ancient texts, around the time words were first put to parchment, that it carries with a slough of manifestations of its raw power, namely what we now refer to as the art of Vielo, Charm, Insight, and Shattering. \n
            "Several commentaries argue the effectiveness of these translations and posit the idea that is may be an inscription error, conflating several sources of creature and othernatural being, not granting the notion of something not an Ancient to have the gift of so many talents. \n
            "In any case, if just one belief is held to be correct, after all this time, it would endear us to hope that it has died off long ago. The Anashtre, as has been in oral tradition, has a couple tales of its origins, the cleanest and simplest being that is it indeed an Ancient from a time long since past, surviving the War of the Ancient and the Last Rites, moving into seclusion, awaiting a time for it to reveal itself once more and take back the world into its old ways. \n
            "This leads to a bit of fun on the parts of some people, playing a game of sorts, attempting to fit what we know of the Ancients from various accounts and writing, to match with what has been said of the Anashtre, with some fitting beter than others, depending on which sources one may reference. \n
            "Rahvre, Lilos, Kyr'na, Senari, and Achreo. Some go further and cross reference the scrolls as orated from those who experiences the War and Last Rites, pushing against the notion of Lilos, Kyr'na, and Senari, due to their nature of having chosen a side. \n
            "This leaves some commentary on the idea of it having been Rahvre or Achreo, as it is widely held through several sources that these Ancients remained neutral throughout the conflict, with the Dream Ancient disappearing as early as the War, and the Wild Ancient only said to have engaged in the Last Rites, neither shedding blood for either side. Another, albeit more tenuous circumstance, has it posited that this is the birth between a mortal and an Ancient, which by many accounts would have devastating consequences for all the Ancients and mankind. \n
            "If one were to take a concubine or true bride, it would elicit responses from both sides of the matter, erupting in great conflict no matter what view one held. The ancient in question could be shunned by their fellow greaters, causing a rift in their duty to the realm and service to the people. The mortal involved may be held as between Ancient and human loyalties, and may be regarded with contempt, scorn, or maladapted ideas and schemes if it were the case, not to mention the potential for others to attemtp the seduction of another Ancient or perhaps the very same, as their tastes and desires would have been aligned with humans. \n
            "Tall tales and wishful thinking on the matter does not placate reason, though, and is disregarded by many. A rare scholar might have believed such a thing were possible, but he had correctly held his tongue in uttering the idea; by all measures and despite their form, it was a widely held belief that the Ancients were not human and such propagation was not a matter of choice, or desireable for either party. This of course has the possibility of starting from false pretenses from the beginning, namely that the Ancients truly existed. \n
            "There is much account of them, their ways, and music is discussed of the Wars and the Last Rites, however, with some few scholars citing the idea that it may be storytelling and myth all this time, from the underpinnings of belief in these primals or ancients, so called. \n
            "This becomes contentious when taking into acount the Seyr of Daethos, due to the nature of it spawning from the Last Rites, and its recognition of the Ancients playing a role in the genesis of the new faith. Perhaps to buffet the criticism, scorn, and potential cries of heresy, many of those commentaries are kept in the Museum of Sages, and out of the hands of potential zealotry on the concerns of blasphemy. \n
            "However, regardless of what many have said to know, or reasonably postulate, some questions still remain in the realm that it may still be out there, lurking, waiting. How old this being is, its true nature, its wants and desires, no one can truly say, for it is mere lengend that carries with it a strong lack of belief. \n
            "Just steer clear of the Eye, if you wish not to chance your luck, which is advice even a Sage has the good sense, or perhaps grace, to adhere himself towards."`,
        
        Draochre: `The Draochre \n
            "Tales of the old regale us with the wood mystics' belief and worship of the trees and serenity of nature, though some say the reverence had spoken into life a beauty and balance between the two. Many stories exist about them in our legends, though fewer have been mentioned oevr time as the foliage and dense forests have given way towards people's communities and civilization. \n
            "It is not ceratin where these myths originate, some saying they were awakened during the War of the Ancients to protect nature from the ensuing chaos and destruction that plagued the realm, warding off the armoes that marched, putting Ancient against Ancient. \n
            "A similar story is told of the entombment of a member of the Dachreon of Druids inside the flourishing trees and ripe with sap, the engorging nourishment to aid in the transformation into the famed creature, under the guise or watch of Achreo. Perhaps in this light it harbored the same effect, though it begot of man paying penance for the crimes of his brother. \n
            "It remains a guess as to what people actually see when it is said they have encountered the creature, though it may be more apropos to say flora. the form appears to be of a human woman, with the cuts and cures as though a statue were carved from a felled tree--aligned with that which they have mended toward. \n
            "Their skin resembles a refined and smoothed texture of wood, some mention as though the bark of a tree were burned with a faint luster, producing a fierce, untangled beauty, resembling colors reflecting the changes of seasons much like the Tshios in other tales. \n
            "One decidedly human feature among their king is a rich, wild resolution that playfully dances about their almond-shaped eyes, glistening and watery like pools of sap. It is said from this they are capable of seducing men who come to steal and plunder the riches of the forest, turning them in mind and heart to aid in their cause as wardens of the wild. \n
            "This has led to much speculation in its application as being similar to the effect of Charm, written about extensively in other texts and tomes. It is unknown as to the reason for this, yet it may be an exaggeration of their natural allure due to having tales spoken of their graceful and ultimately feminine features. \n
            "Most stories mention oak as being the choice of the flora that these creatures have bonded to, for its nature to burst forth with sap, yielding a nourishment that is though to aid in their metamorphosis, as well as boasting a long life-span, coupled with a towering influence and robust nature. \n
            "Others mention having seen those aligned with other trees though to house an even greater wealth of protection, hyperions, centurions, cedars, and firs. Accounts postulate that there is a form of Insight held among them with the trees they are linked to, and perhaps others like it, though this may be myth claimed due to their nature of being great trackers and guides, so the feeling of being watched amongst the trees if ever present gives that sense. \n
            "Nevertheless, the accent of the Draochre form apperas to be directly influenced by the tree, as some hold the conjecture based on the writings that their life force is inextricably tied to the tree, and as one is affected, so shall the other. This has further implications as some trees are seated as places of worship or of equal heraldry. \n
            "Much is said about these creatures in folklore and myth, though seldom are they encountered, which can be accounted for in a variety of wars. With the advent of roads, either permanently paved or deeply walked upon as to give clear guidance about the land, it is rarely the case that men walk about untrammeled forest and denser pathings, leaving the chance of witnessing a Draochre less than days long since past. \n
            "Another cause is that the more we have learned about this world, the less there is for people to prattle about, claiming sights and spooks in their dealings with the wilderness. Having catalogued many of the creatures we do know quite verily, it lessens the case of there being something we have no witnessed in these more tranquil settings. \n
            "More theories tend to go with the idea that these forms of fey or mer were commonly mistaken for the more primitive bands of folk who would live off the ley of the land, foraging every day for their basic needs, and over time people have more readily moved towards larger villages, ports, castles, and cities to live. Lastly, and humorously, by their own nature it is said that it would not be but a rare sight to come upon a Draochre, as they have been orated time immemorial to live in deep seculsion amonst various thickets, woodlands, and forests; rarely are they noted as having a semblance of interacting with humans by their own wishes, and are said to be hands off, unless their homeland is disturbed and threatened. \n
            "In any case, while much has been spoken of and turned ot writings, perhaps more is to be gained through the understanding of what they mean to us abtractly, for the good of us all."`,
        
        Aphyero: `The Aphyero \n
            "Though to be the manifestation of Wild. Fire Much of its history is chronicled and conflated with that of the Anashtre, and it is difficult to tease out its distinctions from what has been written, unfortunately. \n
            "However, be mindful of what is thought to be its nature, if you have a mind for it, you may be able to come to your own conclusions."`,
        
        Fyrash: `The Fyrash \n
            "Thought to be the manifestation of Fire and Lightning. Much of its history is chronicled and conflated with that of the Anashtre, and it is difficult to tease out its distinctions from what has been written, unfortunately. \n
            "However, be mindful of what is thought to be its nature, if you have a mind for it, you may be able to come to your own conclusions."`,
        
        "Quor'eo": `The Quor'eo \n
            "Thought to be the manifestation of Wild Earth. Much of its history is chronicled and conflated with that of the Anashtre, and it is difficult to tease out its distinctions from what has been written, unfortunately. \n
            "However, be mindful of what is thought to be its nature, if you have a mind for it, you may be able to come to your own conclusions."`,
        
        Chyrolus: `The Chyrolus \n
            "Thought to be the manifestation of Wild Water. Much of its history is chronicled and conflated with that of the Anashtre, and it is difficult to tease out its distinctions from what has been written, unfortunately. \n
            "However, be mindful of what is thought to be its nature, if you have a mind for it, you may be able to come to your own conclusions."`,
    },
    Animalis: {
        Preamble: `Animalis \n
            "Animals elevated beyond natural limits, whether by some otherworldly influence or the hand of Man."`,
        Canire: `Canire \n
            "One of the more sinister creatures we have heard rumor of, thought to be a gross mixture of misplaced obedience and uncontrollable avarice. These notions, unfortunately, appear to have a bite of truth to them, more than we care to imagine. \n
            "It is said, largely through conjecture--through some of this has been put to parchment by various quills, to have been a plotted effort to breed a more savage, ravenous hound, with thrice the loyalty of a normal one. A by chance occurrence took place long ago, where a litter of pups were birthed carrying two heads in place of one. \n
            "The conniving breeder pondered an idea, and began attempting to breed the pups among their own, cursious as to the effects. Some of the pups died shortly afterward, whether due toao a cursed illness or lack of nourishment, they seem fated for the same end. However, over time, a small few managed to mature, and mate, which began more disturbing trends. \n
            "This time over, thre heads propagated for the pups, bore to two-headed mothers and fathers. Again, the same curse befell many of the litter, with more dyring before reaching a healthy, mature age than not. Nothing appeared to stave off the issues that were brought from attemping to feed thrice-many mouths as would normally be constituted. However, those few who were lucky, strong, and willed to live, became great beasts of burden--not to mention loyal, cunning, and aggressive. \n
            "These hounds seem to share a mind with the others, both in themself and their kin, and can respond to events transpiring near one even when far away from the others. Since, much has been written after the matter about these monsters, how to raise them, their behavior, eating habits, preferences of other animals and humans, a heavy treatise on steeling yourself for the journey. \n
            "Very few are gifted in the sense of animal bonding, which coupled with the specific nature of the breeding, causes these creatures to be a rare sight throughout most of the lands, those who may afford the services tend to establish a whole keep and kennel for them alone."`,
        
        Carrier_Birds: `Carrier Birds \n
            "It is said there is a distinction of an Ahn'are for every one fot eh lands in which they inhabit, and for this reason, the various leaders have made these birds their moniker to breed and use as carriers of messages, and are cared after more thoroughly the the rest. \n
            "Oral tradition has given way to the writing of various books, scrolls, and tomes on the subject, with most conjecture believing in the existence of said Ahn'are, now or once before, as said writings keep valuable information on the instructuion to tend for the birds, in addition to quirks, breeding practices, behaviors, eating habits, and preferred places of habitation. \n
            "They are as follows: 
                - Gray Parrots of the Astralands, 
                - Ilian Eagles of the Daethic Kingdom, 
                - Long Dobes of Licivitas, 
                - Prime Owls of the Soverains, 
                - Rainbow Parrots and Harpy Eagles of the Alluring Isles, 
                - Burnished Crows of the West Fangs, 
                - Ghost Hawks of the Firelands, 
                - Blue Pigeons of Sedyrus."`,
        
        Kraken: `Kraken \n
            "Due to his peculiar qualities, Nyrolus most appreciated the octopus over any fish in all the depths of the sea. He saw their brilliance as predators, thieves, and problem-solvers with great amusement, and with this, when it came time to forge a being that would herald victory in the coming War of the Ancients, he forged this monster. \n
            "While some is scribed in parchments, sun-worn and salt-stained, it is invariable shocking to those that hear this, despite countless tales and legends told, these monsters due in fact exist, or at least once long ago. \n
            "While many of these other beasts from the past have issues of hard evidence, unable to touch levity with a captured monster, or corpse drug back to a Sage for earnest approval, we have encountered the remnants of Kraken as recently as 250 years prior. \n
            "Large, slimy, puckered tentacles, still teeming with life have been hauled back to shore, stretching well over sixty feet in length, larger than any animal we have been able to record well over thrice-fold. The varied tales upon the ship carrying back a piece of the Kraken may stretch from a near miss, being capsized and pulled under, to a whole slough of them attacking mass numbers of fleets, with fledgling survivors taking trophies. \n
            "Whether either story rings true, we have to deal with the possibility that these creatures are still out there, and what that means for seafaring. Some port-cities have put an embargo on their ships traveling too far from shore, lest it be pulled under by these foul monsters lurking below. \n
            "Others, mainly Sages, have had their interest piqued and moved towrads the shores, eager to study the lesser threat known as the octopus, to learn from its habits and temperament. Time will tell if these matters yield project, but until it comes to pass, I recommend you stay close to a couple leagues near the sandied beaches, and pray you do not meet a wet and dreary end."`,
        
        Phoenix: `The Phoenix \n
            "A masterful forging of a peculiar, aged bird that Fyer breathed life back into, bursting into flames before renewing itself and granting a brilliant aura of light, revivified and ever grateful--his constant companion. Of course, thid does not do well with explaining the multiple sitess at various locations throughought the realm, if there truly is not more than just the single instance of its creation. \n
            "From the tales, this creature does not appear to be made for any nefarious cause, and is seemingly one of the more innocent creations attributed to an Ancient. From the rare sightnings and glipses caught of the bird, some accounts range from a nondescript variation--leaving one wondering why they would believe it to be the fabled bird, to a brilliant, burning comet soaring about the night sky, lighting up a trail as it passed over towns and villages, fields and forests, or whever the person stood in awe. \n
            "Most scholars shake their head at these claims, though every so often a man of more credible status has the proclamation to herald commentary on the matter more lenient of preponderance than one would grant a common hand or delirious guard out on night duty. This does not take into account the sightings that purvey at times closely measured yet in cities or lands far away from each other by tenfold the distance a bird has been recorded to travel in a fortnight. \n
            "Perhaps there is more levity to the idea that Fyer had the inclination to create more of the creature, as the aged bird was granted a life once over to spread its wings and soar to new beginnings, he may have taken it upon himself to bestow the gift to another, keeping company wherever he may have traveled over time."`,
        
        "Rana'vas": `The Rana'vas \n
            "Almost nothing is known of these frog beasts, whether they are some variant of its pure cousin, or a mendind of them into that of man, and much information that does exist is extrapolated from the writing of other human-like creatures. \n
            "Commonly associated with Tshaer, and may have been their creation by the most ardent followers submitting themselves to be physically transformed or have their mind placed into beaststo defend nature during the War of the ancients; and Kyn'gi of the Hunt, fot its nature to prey on man and take maidens as right of conquest or ceding to its aforementioned lust. \n
            "Another belief is that its more natural, pure, cousin was captured long ago, and the Dachreon of the North would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth itscontents and climbing insde to awake his inner animal, mending itself into the creature, becoming one and transforming."`,
        
        Shamanic: `Shamanic Animalia \n
            "Dire animals that are inhabited with the mind of some gifted, spoken of as shattering, more specficially its shifting variant. In this form, one has the requisite abilites of the animal, but carry with them a human's capacity for cleverness, creativity, and malice. \n
            "It is not clearly written in the scrolls and tomes as to how long, thorugh what distance, and when such occurrences and possession can take place. Some believe the Shaman must perform meditative practices throughought the project, others believing he can sever his mind during periods of rest. \n
            "The most abnormal and rarely written shaman are parashifters, who can arrest and use such creatures and their own bodies at once. Through these measures, a person can use the new, teeming senses to collect and transport information, hunt, main, and kill, or perhaps something more sinishter, staging. \n
            "A couple treastises remain on the subject, heralded as the fundamentals of understanding such a concept from an observer's perspective, but now most people do not believe that these abilities occur, or such a technique has long since faded from this world. \n
            "Another belief is that its more natural, pure cousin was captured long ago, and the Dachreon would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, mending itself into a creature, becoming one and transforming."`,
    }    
};
function checkShow(current: Accessor<string>, option: string, show: Accessor<boolean>, setShow: Setter<boolean>) {
    if (option === current()) {
        setShow(!show());
    } else {
        setShow(true);
    };
};
export const SupernaturalEntityButtons = ({ current, options, handleEntity, handleConcept }: { current: any, options: any, handleEntity: any, handleConcept: (con: string) => void }) => {
    const [show, setShow] = createSignal<boolean>(false);
    const buttons = Object.keys(options).map((o: any) => {
        const text = o.split("_").join(" ");
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceSub' style={{ "font-size": "0.65em" }} onClick={() => {checkShow(current, o, show, setShow); handleEntity(o);}}>{text}</button>
            <Show when={current() === o && show()}>
                <SubConceptButtons options={SupernaturalEntityLore[o as keyof typeof SupernaturalEntityLore]} handleConcept={handleConcept} />
            </Show>
        </div>;
    });
    return <>{buttons}</>;
};

export const SupernaturalPhenomenaLore: SupernaturalPhenomena = {
    Charm: `Charm \n
        "Capable of casting with as little effort as a gaze, whisper, or glancing touch, effectively influenceing said individual for a time, depending on the application of the charm itself. \n
        "Said to be marked with the gift of Kyrisos in reference to their hypnotic gaze, sweet, honeyed voice, or golden touch, it is also imagined that Chiomyr and Shrygei may have had a hand in this ability's formation. \n
        "Belief in the true ability of such power is up for debate, and multiple writings have taken positions on one side or the other, with criticism and commentaries far outweighing the writings on the topic."`,
        
    Insight: `Insight \n
        "The power of Insight takes on quite a few qualities, namely those skewed toward mental ability. There is more written on these ideas of the expanded mind than aany other subject on the matter of phenomena of another nature. That does not necessarily lend itself toward hard evnidence on the matter, though plenty of ocnjecture and belief in certain events being augmented by such. \n
        "Details vary depending on which scholar is writing from which perspective, people have associated Insight with the ability to read minds, and dig through someone's consciousness to find secrets, ideas, and memories hidden away. The idea of implanting false ideas and memories seem to be speculated as well, though it does not show up as regularly as merely sensing them in others. \n
        "These were affectionately known as Dreamshivers, a subset of the trait and ability within Insight itself. Those gifted with Insight are often said to have a higher spectrum of sense, the existing onces detecting smaller ripples and motions, and extending further as well toward the application of these senses. \n
        "It has been speculated that perhaps those artisans of martial powess, culinary arts, tracking and travel, and merchant trade have the gift affectionately known as Keening. Another concept frequently broached is the subject of manipulating the physical with the mental, an energy that invisibly moves matter around through sheer force of concentration and caer. \n
        "Most commentaries on these ideas have the notion in contempt of betraying the serious speculation and belief in the other concepts. Depending on whom you may read, they are said to be marked with the gift of Rahvre, or Senari."`,
        
    Scrying: `Scrying \n
        "Those who scry various patterns, whether in man, mer, or nature, to seek prophecy or details of future events and fortune. Such examples could range from the patterns of the moon, the sun, bones of scorched sacrifices, the flight of birds, charting weather courses, or the movement of the stars, to the height and breadth of a fire. Even the sway and movement and dance of a Lady-to-Be at the Ascea. \n
        "The implication of these insights is up to the interpretation of the gifted individual. Some say they are capable of determining events in the immediate, transpiring at an event later that night or the following day. Others claim to foresee large scale events in the future: battles, wars, lines of succession, and births of important figures yet to come or those alive who will shine into prominence. \n
        "The Selini of the Ma'ier are an example of such scryers, divining the skies and nights and patterns of the moon, looking for places that hold a great boon for a Blessed Hunt to take place. Another example being the Dachreon of Druids, thought to be able to read into various forms of nature to perceive the future. \n
        "Said to be marked with the gift of Cambire, the concern being that the future shifts and coalesces to events present that change in turn. Belief in the true ability of such power is up for debate, and multiple writings have taken positison on one side or the other, with criticism and commentaries far outweighing the writings on the topic."`,
    
    Shifting: `Shatter Shifting \n
        "A form of shattering your one's caer. Capable of sailing through the skies with your achre and caeren, a form of projection of your form without substance. Can use this new recruitment of senses to collect and/or transport information, hunt, main, and kill, or perhaps something more sinsister, staging. \n
        "Can utilize the moon if it is showing between two individuals as a form of tracking--said to be marked with the gift of Ma'anre. Can allow a mark to be imprinted on a target under the guise of the sun, to gain an intuitive sense of tracking till it wanes and sets--set to be marked with the gift of Ilios. \n
        "Belief in the true ability of such power is up for debate, and multiple writings have taken positions on both sides, with criticism and commentaries far outweighing the writings on the topic."`,

    Splitting: `Shatter Splitting \n
        "A form of shattering your one's caer. Capable of splitting your mind and sundering it from your physical form, and having it catch onto another, parasityzing and possessing to form two separate beings of similar achre and caer. Can arrest and use creatures and their own bodies in simultaneity, though unknown if they are capable with other humans. \n
        "Can use the new recruitment of senses to collection and/or transport information, hunt, main, and kill, or perhaps something more sinister, staging. Said to be marked with the gift of Achreo. \n
        "Belief in the true ability of such power is up for debate, and multiple writings have taken positions on one side or the other, with criticism and commentaries far outweighing the writings on the topic."`,
    
    Vielo: `Vielo \n
        "'A strict concentration' as described in the passage many times over by the Ma'ier, these qualities can live and permeate in other gifted individuals. As Ma'ier are often assicated with Kyrn'a and Ma'anre, it is often the case that Vielo is a perverse application of the practice, not truly granted new life, but returning old vigor. \n
        "Coupled with Kyr'na's long standing rivalry with Lilos, this would not interfere in her granting of the ability, though it is not as well established in writing as the Life Ancient's doman, so to speak. Life transference is an idea held in contention, though most sources claim that blood contact is required for the transfer to take place. \n
        "Methods such as drinking blood, or mixing blood through cuts and wounds, may have inherent effects depending on the context. A gifted user may take an dutilize another person's blood through ingestion or direct injection into their coursing blood. Gifted users may share between each other as well, invariably to the same effect is it written. \n
        "An innocent person can be blessed with its effects only through a grant from a gifted user. This appears to be the only other way to gain its effects. Two users who have no predilection for the gift would do well not to try, as there is no recording of a novice or unblessed to work these abilities. \n
        "According to oral tradition later written into works, one gains this ability to embolden himself with heightened senses, perhaps extending beyond the normal few we appear to innately possess. Physical enhancements take the form of increased strength, agility, regeneration, and recalling of memories of the victim or volunteer, depending on the nature of the transference. \n
        "Said to be marked with a gift of Kyr'na, and interestingly some espouse Lilos, an Ancient whose nature remained most mysterious through annals of recorded history."`,
};
export const SupernaturalPhenomenaButtons = ({ options, handlePhenomena }: { options: any, handlePhenomena: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceSub' style={{ "font-size": "0.65em" }} onClick={() => handlePhenomena(o)}>{o}</button>
        </div>;
    });
    return <>{buttons}</>;
};

export const localLore: Region = { // Localized, Smaller Concerned Knowledge of Provinces
    Astralands: `The Spinal Fusion \n
        "Not much is known or recorded by the texts held at the Museum concerning the customs, cultures, and people of the Spine. What is known is they were among the primal worshipers of the Ancients, who fought most loyally for their side in a zealous fervor, causing even the Ancients to pause with concern. \n
        "After the Last Rites, nothing was left for the accumulation of knowledge on the Northren and Central parts of the realm to continuously record, yet all the same they seemed to have developed a written language not unlike ours, as both were developed from Shaorahi. \n
        "One of the peculiar qualities over this part of the realm is their formal use of the term 'The Spine' for their countryside, embedded in their vernacular. Another most curious observation being that from their sources, there does not appear to be a war held in their lands after the Last Rites, which would put them as perhaps the most unfied, whole, and pure hold of people left over from the War of the Ancients. \n
        "Much of their general customs seem to ahve followed with what was known to be commponplace before the Wars, that rule of Archons over vast parts of the land, and underpinning it, a tetrad: the Valour, their martial lord over weapons, strategy, and commander of their army and fleets; Justiciar, their political lord, governing their laws, civility, and diplomacy; Metalurge, the craftsman, concerning commerce, creativity, travel, and trade; the Ashtral, their religious lord over worship of Astra, ceremony, and belief. \n
        "How they go about their choosing of whom may reign appears to be a mixture, in one ethos, a vote spread across their voices, those of age who are active members of their land, and worsking for the better of themselves, their family, and their ruling body at large. In aother, it seems as though these choices of who reigns are preselected by means we are not able to discern.\n
        "It appears there exists bloodlines that run down throughout their history, tracing back to the Age of the ancients, if their texts are true, and rarely have there ever been cases of those not of a blessed blood put at the forefront to rule their masses, and in the event of, I doubt they were considered with much weight."`,
    
    Kingdom: `The Achreon Kingdom Conquest \n
        "Their rule by unification of a king came under the tile of the 'Achreon' Kingdom, under House Caderyn, whose heradly is that of the Fox. The king, Mathyus Caderyn I was a well educated man, and in his youth, instead of being charged under an allied house specifically, was encouraged by his father to scour the known world with several allied houses children. \n
        "In doing so, he learned from each province he visited, the House's wealth aiding in cordiality and admiration of the people. Being gone for for over a decade, he returned at new of his father's mortal illness, settling as heir to his name, and the Fox Hollow settlement. The Northren'wes became engulfed in a massive war amongst itself, with the returning heirs agitating reaching eastward to the Eye. \n
        "Many houses experienced multiple crises from the attrition, their natural resources and wealth depleting and seizing, many tied their fates to each other in an effort to stabilize, and various bands warred further, till all that were left to trade were words and oaths. \n
        "A summit was called to agree to terms between all factions and houses, and through patience and tact, coupled with the timing of an Arbiter of an allied house, crimes were charged and arrests made, thwarting peace deals, with the First Fox executing enemy leaders, and proclaiming kingship. No retaliation could be surmounted, and with an Arbiter, such justice was served with the weight of all ley law behind it, the Augmentum known to carry their word with a sword. \n
        "The First Fox conquers the northwest in 50 AE, and has since become a kingdom, first the 'Achreon,' then 'Daethic' after the Arbitration War [51-58 AE], back to the Achreon after the Second Insurrection in 113 AE, and once again back to the Daethic Kingdom, after the return of Mathyus Caderyn [II] in 122 AE, during the Exiled Rebellion. \n
        "Many issues with infight accrued, as throughout this time the Kingdom sought expansion into the West, past the old border of the Eye. Some Houses were subsumed and assimilated, and many others sought to repel the invasion. Those East of the Eye became hardened in their isolation, and began to proclaim soverainty in response. \n
        "Entreatment occurred during the Ascean in 140 AE, with a treaty written and signed in 141 AE, ending almost a century of agitation and war."`, // 
    
    Soverains: `The Soverain Pact \n
        "Originally, lords were simply those who accrued land and resources greater than others, settling in areas they could defend and manage their wealth, which slowly accumulated peasantry who needed to survive after the Last Rites. However, through the unification of the Western Achreon Kingdom under the First Fox, and his declaration of gathering all the North under one realm, the lords of the east opted for a different title. \n
        "Through the Soverain Pact, they renamed themselves the Sveraoins to proclaim their independence in perpetuity. This remains in effect to this day, with the Soverains being the title in the Northren'eas--the king abiding by the ranking, though not without his proper mockery. It is said that whenever he visited the father of his daughter in law, he speaks of him as his 'Soverain Eulex', though it is unknown to what degree this is endearing. \n
        "Each Soverain had been proclaimed for different merits, some had became wealthy through trade and commerce, some had rich mineral deposits under their feet, others had an insular culture that became paramount in the land, be is martial or one of worship. All had become sworn to each other in the Great Northren War, knowing their fates intertwined against the cleverness of the Fox, and became dilluted of their isolation as many of their peoples interacted to bolster each other's defense and resources for the better part of a century. \n
        "It has only been seven years since the treaty after the Ascea in 141 AE, and relations have no ceased in the least."`,
    
    Fangs: `The Rapier Rebellion \n
        "First, Licivitan Honor must be explained: to be a Good Lorian is foundation to the culture of Licivitas, post War of the Ancients. This manner of conduct, whilst extended toward everyone of this world loosely, tends to be restricted toward those of Li'ivi Blood, which encompasses the Fang Lords to an extent, at least at the beginning of their settlements. \n
        "Because the War of the Ancients had seen such a rise in mortality between provinces and within, it has been an unofficial yet practiced decree that no Li'ivi blood should be spilled upon its soil, nor of one to take the life of another fellow Li'ivi. The loss of life suffered throughout the War of the Ancients caused a depression in birthing and repopulation while the Seyr of Daethos and the Good Lorian attempted to restructure and rebuild their civilization. \n
        "This caused a fundamental warping of how life before Daethos had been, a loose affiliation of warring tribes, looking to conquer and subsume their neighbors.\n
        "Now that you know of their honor, this follows suit with not waging an all out war against the burgeoning Fang Lords, but still attmpting to corrale them in some measure, starting with an embargo. The lords, determined to cut out their own independence from the heavy hand of Licivitas, had to find ways to thrive, and with them being of foreign blood, caused caustic relations initially with the folk that had settled the area post War of the Ancients: those emigrating from the North, No'theo; the East, exiled Old Li'ivi; and South, the Fyers. \n
        "These people had created anarchic tribal low lord provincial battle clans with times of tentative peace. The Fang Lords, as they were later known, at this time it would be an apocryphal declaration, were unwelcome and pushed to the coast in an effort to establish ports and trade and work around the embargo, trying to carve out homes and settlements on the prcipitous cliffsides of the 'fangs,' which most tribes had stayed away from to settle along the easier, more seal level coasts of teh West and South. \n
        "The Li'ivi, through their ingenuity, were able to functionally use the coast to establish trade by working tirelessly to create paths that would allow transport not only of the people but commerce down to the rocky coasts, and build flourishing economies. To circumvent this old code of honor, the lords worked in turn to hire the battle clans and loose coalitions of armies, and through these mercenaries, sought to thwart the Licivitan forefathers, and became an independent faction of port-cities. \n
        "The ensuing war left both sides with depleting resources, and from suing for peace, negotations were made with the Augmentum to create a formal variant of duels as means of severing the authority of Licivitas. This was seen as more human than the slaughtering and spilling of Li'ivi blood, and would grant the prospect of earning freedom and letting go of lands in a more dignified manner.\n
        "The craft members of the newly settled land, who would in retrospect herald their first fang lords, had their blacksmiths craft various weapons for the occasion, knowing the customs. Taking inspiration from the legendary weapon, Ancient's Bane, lost in the annals of history and warfare, they crafted what they surmised what such a weapon might look like, based on the records and vague descriptions still existing. \n
        "A series of duels from their best representatives came ot be one of the most contentious events in the history of the realm, as the livelikhood and indepenedence rested on the quick-witted and agile bodyies of a selected few. The original ruling was to have it go to three cuts, and quickly it devoled into three cuts discounting arms. When the first man fell upon the third duel, it was rectified to henceforth be to the death, for the weight of every duel needed to be reflected in the determination of a whole people. \n
        "Despite the nature of the newly crafted weapon being lighter, more nimble, and with a longer reach, the time it took t opractice and impart eperience ont he user caused a gamble to occur. Would the effort of learning a new style to carry such a weaon be worth the short time invested against the long-standing tradition offered witht he longsword, carried and trained for centuries previously? It was a high risk, but riskier they believed were their freedoms under the weight of Licivitas, a home they no longer knew and were not longing to be subjugated under."`,
    
    Licivitas: `Daethos Rising \n
        "As many of what now are to be considered separate lands became settled and established, it allowed the burgeoning of what started as a form of cult fromthe time between the Sundering and the Last Rites to begin flourishing, with the uprising of Laetrois Ath'shaorah. Worship of Daethos sweapt through Licivitas as the old faith waned in its stranglehold in people's minds and beliefs. \n
        "While many of the oral traditions were transcribed with quil over voluminous texts and tomes, not everyone was capable of reading these and slowly the stories became quieter and more distant. In addition, as generations of new poeple were born, the remembrance of the past became more vague, and slowly seeped out of sight for many of the common folk and peasantry, as they looked simply to survive throughout their lives and make something of and for themselves. \n
        "During this transition of those who could read and were teaching those who could not, the small and once-heretical sect overtook the Ancients in the majority of the faith for the population. For some time, it grew and many of the higher birthed nobles converted, and those in ambition reigned in power, eventually unifying with the governance of society. \n
        "For a time which aided in peaceable terms and agreements between the rulers of Licivitas and the commoners who were subservient, the new established faith aided in better establishing the ability of the nedy and downtrodden to earn and move up in the land. This included many reforms to plot out land for the average folk, becoming farmers and bolstering their ability to produce agriculture as a whole. \n
        "Toward the South and the East, newly discovered caves and mines were found and laid claim to by Licivitas, causing books in iron, coal, silver, and gold, allowing them to grow to a powerful enterprise that would aid in the development of their society. \n
        "To reiterate, one ofthe ways they sustained their existence into a prosperous chain of city-states is putting resources toward bolstering their agriculture and engineering. Every poor hand needed not be, and could enable themselves to live off the land given by the First Commoner, Lorian, in return for a portion of the goods and wealth accumulated. Everything else he may trade, offter to traders and merchants in exchange for minted coins, or utilize themselves. \n
        "Farmers worked together to extend their fields, lending hands in culvation, joining through marriage pacts to strength the joint unity of their fields in perpetuity. This allowed a great strengthening throughout their land, including the prospect and expansion, establishing ports and cities elsewhere. \n
        "One of their most celebrated and successful excursions in claiming new territory for settlement became what is now reffered to as the Teeth in the West Fangs, although a rebellion took place and Licivitas no longer rules over that province, though the relations maintained afterward have been congenial and healthy."`,
    
    Firelands: `The Smoldering \n
        "The Firelands appear to be a bit of a mystery even to those who have ventured to the province and subsequently forged cities and castles. \n
        "From what is known, based on the accounts of their history, they appeared to have the paramount seat of power of Fyer, the Fire Ancient. Much of this is reflected in their prominent status and shrined that were built caeremoniously to the Ancient, in addition to the perennial Fyers Protectorate, the Ashfyres, carrying the Phoenix as their coat of arms. \n
        "It is said that whatever was to be made of the Ancient and his penchant for modality, it is reflected amongst the lives of its people. This is not to say they are of a nomadic variance, but more a freely shifting and interconnected society that has arranged more marrieages in each generation than the totality of which the Seyr could hope to yield. \n
        "Some claim that it is their lessened strain due to the nature of their land, yielding constant and bountiful harvests, when combined with their milder weather, leaves much time for frivollities. Whether they can be seen honing their crafts at carpentry and engineering, archery and jousting, needlework and writing, these people danced well, fought well, sung well, and lead well. \n
        "But was it always this way? If stories are to be believed, during the Sundering, and after the Last Rites, a series of wars had sprung up amongst the lords with split loyalties causing severe death and turmoil by its end. A tenuous truce loosely held them together in order to pick up the pieces of their homelands, and to ward off the evil that was influcted in horrific, nightly raids by the leftover entities of the Ancients. \n
        "And yet, as though a cycle of the moon instantiated fervor once more, the lords began again in their battles for supremacy, with none ever managing more than sieging one or two castles before needing defense and stabilization of their own. The Phoenix, Bryne Ashfyre, came to prominence, utilizing a Shaorahi strategy on the battlefield, uniting the arring armies and forgeing themselves greater. In the end, he was nominally named their king, though he revoked the right of it himself, knowing the follow of such grandeur against the Seyr, but the title remained in their hearts, and he became the leading figure for guidance and displacy as other lands began surfacing. \n
        "His title and legend became haralded across the realm during the Fourth Purification Trials, showing his unmatched brilliance in warfare and righteouness, with his appeasement toward the new faith in trickery."`,
    
    Sedyrus: `The Sedyren Wars \n
        "Previous understanding of the dispute between Licivitas and Sedyrus is necessary to understand the conquest of Quor'eia by the Sedyreal. Much contention arises to this day as to who may place ownership of the Sedyrus mountain chain, for WArs were fought for the rights to hold these lands. \n
        "This sounds folly , to wage such large scale wars due to the rights of claiming the mountain, as it would not move its position in our realm, and it seemed as though the crafted who lived there had no been unwilling to provide their services for all who were worthy, 'One's heart, mind, and caer who had been tempered by Kyrisos himself, and whose body were protected by Se'dyro to meet out those ends. Only a noble Man may lay claim to these treasures by which both Ancients regard as fyers.' \n
        "This was a heavy price for Licivitas to bargain with, considering their change of aith towards Daethos, though I imagine they would not quite impose those beliefs upon the smiths of these mountaintops. However, as tragic as this may have been, onces the fires were extinguished and those who lived amongst the rocks and caverns perished for reasons we are not yet to discern, the knowledge to accrue such refinment passed away with them. \n
        "The war between Licivitas and Sedyrus was held near entirely for this reason, amongst perhaps other quarrels due to displomacy, trade, and raids--yet the fervor and passion for these wars were smothered with the last traces of ember in the furnaces.\n
        "One of the emergent learnings from the Sedyren Wars was the frightening lethality of the Sedyreal archers amongst their cavalry. Their level of mastery as whown in several battles over the course of a multi-stage war saw the icivitan armies routing and submitting in awe of their expertise in saddle with speras and bows. Both riding heavy destriers with full plate adorning themselves and their horses, bred to break lines and trample over infantry, and mthe much more agile courses, the premier choice for their archers who swarmed in dazzling displays of destness and fury. \n
        "A contentious belief is that the people of northern Quor'eia, who are now known as the Sedyreal, were pehaps rebranded by their chief hierarch, the Sedyren Sun, to lay better claim over the cluster of mountains, and the forges that lie within."`,
    
    Isles: `The Enchanted Wars \n
        "These isles are thought to not have any indigenous habitation in part because little exists of historical context, and that the first records seem to showcase a battle for its reign in the land between the Astralands, Licivitas, and Sedyrus after the Last Rites and the beginning of the Age of Wars. \n
        "It is often speculated among the writings that we do have, some of the more outspoken or 'touched' folk who survived the Age of the Ancients were exiled from their lands, and sought refuge across the war in the form of an uninhabited jungle. It appears around this time that the folk of Sedyur who left the lands in search of other pastures and did not take to the cohesion after the Southron Sedyren War, taking to the island chain to start anew. \n
        "Folk of Licivitas were positioned in such a way to not be driven North, or perhaps did not have steadfasts or holdings there, and felt more inclined to run the risk of moving further South. It is unknown about the conditions that led some of the people from the Astralands to be driven south, as not much is given in understanding the Ashtrean perspective. \n
        "The lands were and are currently rich in agriculture and landscape, with smooth, sandy beaches in myriad colors, warm waters, temperate weather, strong sunlight, and a host of bizarre animals. On the last part, it is good to note that a varying amount of new animals had been discovered from the advent of migrating there, with the largest cats we now have on record, tigers, and their horrific variants in the Gatshyr being reported through the settlements. \n
        "Vicious and feral apes seem to rule parts of the more dangerous jungle. Amongst other findings are the largest land animal we have seen recorded through work and observation of the Sages, elephants. These monstrous creatures dwarf even bears in measure, and have the surprising ability to be tamed for use in agriculture, and as been demonstrated more recently, warfare. \n
        "Over time, the warring between the three more established lands gave way to commonality in the midst of sheer survival, and through multiple arrangements with peace treaties, marriages, and the joining of houses, it has been somewhat settled and calmer. Though, whenever the houses have risen arms against a larger-scale threat, such as the attempted qcquisition of their land by Licivitas, or the raiding of Sedyrus, they have proven to be formidable warriors, taking to the conditions of their envrionment in the form of sneak attacks, ambush tactics, and overall hidden warfare. \n
        "Folk from the Alluring Isles whose ancestry is infused with Astral blood are referred to as Mire, Mirefolk, Miren, and Miremen.\n
        "Folk from the Alluring Isles whose ancestry is infused with Licivitan blood are referred to as Lilos if they are adherent, or Daefarer's if devoted.\n
        "Folk from the Alluring Isles whose ancestry is infused with Sedyren blood are referred to as Slabs, referring to their worship of Quor'ei and Se'dyro alike, and neither are fit for Island and sailing like. Quite derogatory."`
};
export const LocalLoreButtons = ({ options, handleRegion }: { options: any, handleRegion: any }) => {
    const [show, setShow] = createSignal<boolean>(false);
    const buttons = Object.keys(options).map((o: any) => {
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceSub' style={{ "font-size": "0.65em" }} onClick={() => {handleRegion(o); setShow(!show())}}>{o}</button>
        </div>;
    });
    return <>{buttons}</>;
};

export const whispers: Whispers = { // Localized Provincial Lore
    Ancients: {
        history: `"Referred to as the Ancients, these primal beings who were among the first and most powerful forms of sentience to walk the waking world. The Ancients were aspects of nature and humanity, taking on many forms one would expect of the world and its reverence, as well as certain manifestations which are puzzling to many scholars to this day. \n
            "The Ancients were quite literal once upon a time, as far as the historical records show, including various monuments and statues presumably built as forms of homage, adherence, and meditation. Worshiped, revered, placated to, and sought out for their wisdom, favor, and advice. \n
            "Historical records weren’t in written form until after the Last Rites of the Ancients, and were only oratory up until then. These writings encompass the knowledge of the Ancients themselves, in addition to utterances and messages proclaimed to have come from them specifically. Some scarce tomes and scrolls still exist that contain these inscriptions, however some have gone missing or were burned in great fires during the revolt with the establishment of the Daethos. Despite the loss of a great number of the works, many commentaries still exist pertaining to the subjects, though there are blanks insofar as historical events and timelines, in addition to a lack of the source material being referenced. \n
            "The War of the Ancients lasted from the inception through the warrior’s children, and children’s children. Not a man alive who had seen its beginning that witnessed its end. \n
            "The Last Rites of the Ancients saw the last of the first generation's interaction with the Ancients, those who stood before and besieged the primal beings, eventually forsaken and adrift in a cold, uncaring world without the guidance they’d always sought and relied upon."`,
        belief: `"Still heavily worshiped throughout the Soverains, in parts of Sedyrus, The Alluring Isles, The Spine, and places Touched. Not entirely uncommon in certain houses of the Achreon Kingdom, though it is not the most adhered to. During the Achreon Kingdom vs. Licivitas Wars, an appeasement was made when drawing truce agreements, and the First Fox adopted the Daethos, establishing a two-strike delineation; the recognized coronation of the King in the Northren realm (First Fox), and recognition of the new faith. Scholars argue who gave whom the decree of power, with believers on both sides arguing to this day."`,
        worship: `"Those truly devout, faithful in worship, or perhaps just lucky for varying reasons, had certain gifts or rewards bestowed to them, said to augment and grant a peculiar nature about them. Colloquially, if you were of the faith, the term used for such individuals was to say that they were Favored. If one were not so inclined to believe, or had chosen to honor the New Faith, you were seen as heretical, and Touched. \n
            "Touched or Favored by the Ancients, these words are the colloquial terms for people, one disparaging the other a sign of heralding their superiority, depending on one's disposition and concerns of another nature."`
    },
    Blood_Moon: {
        history: `"The Blood Moon Reborn is a legend of the cataclysmic Last Rites of the Ancients, specifically tailored to Laetrois Ath'Shaorah. It was orated that a hero, Laetrois Ath’Shaorah, united the human’s during the tumultuous events, and saved the lands from sundering and coming apart against the conspiracy of Mavros Ilios and his followers bringing about the end of the world. He’s reborn and eventually rends the world, purifying it from Mavros Ilios."`,
        prophecy: `"It is written, “The tides will rise and crash into earth, the crest will be riven and pull in the skies, the heavens descend to uproot the fires, the furnace will rage as night turns to day, it splutters and fades as day yields to night.”"`,
        belief: `"The tale has it the Redeemer is born:
            Bathed in Blood and Element
            Under one of the foretold natural disasters
            Under an engorged Blood Moon \n
        And when recognized:
            Will be heralded as a savior and a slaughterer
            Blessed Savant
            Mastery an Element
            Mastery of Warfare \n
        ‘Crushed in Earth, Drowned in Water, Clarified in Windshear, Swathed in Fire’"`
    }, 
    Black_Sun: {
        history: `"Black Sun Awakens as foretold in the Blood Moon Prophecy, heralded when the Red Moon is Reborn. It is said that their timelines will rival each other, invariably intertwined at several points throughout their tempering. \n
            "There does not appear to be as many documents surviving throughout time, and it is uncertain what exactly will hail the Black Sun’s return, though scholars have written observations based on the movements of the Sun and stars. As was his role in the Last Rites of the Ancients, he will bring about the end of the world along with his followers."`,
        prophecy: `"Commonly associated as the champion of Ilios (Sun). It is written, “The Black Sun will be dawned when the Moon surrenders its Light.”"`,
        belief: `"Mavros is an outlawed name in some cultures and parts of the realm. However, this person is said to have similar affections to the original Ilios:
            Highly charismatic, thought to enchant others with their conversation and manner;
            Rivals Laetrois Ath’Shaorah in accomplishments and warfare; 
            Is heralded in alignment with the Black Sun, which follows the Blood Moon \n
        ‘Crushed in Sunlight, Entombed in Sunset, Renewed in Starlight, Conquers in Twilight’"`
    },   
    Ilire: {
        history:`"During the initial Northren Wars, an indeterminate band of soldiers were routed from an ambush in the dead of night and attempted to scatter but were mercilessly stalked and led out of a forest onto a field of open clearing, drab gray-green brush carrying on far past what sight any man held. \n
            "These horseless men were stranded, cut off from each other, and sank down to the height of the crops in prayer of Ilios to help, and began tearing at their armor, removing it with haste as they became afflicted with exposure to the moon coming out behind the clouds and through the clearing. \n
            "These soldiers so resolute in their worship of the Sun Ancient, transformed in rebuke of the moon, turning to wild bestial monsters of more Ancient times, and tore at the horses the skirmishing men were corralling the monstrous footpads, felling them and bringing the fight down amongst the quiet clearing. \n
            "Tears of flesh and entrail, blood and bone laid along the greet the morning dew, and cheering sun, ready to wash away the tears of cold and night, and instill a fervor and warmth in his adherents to renew their spirits and carry on, living Wild along the lands of the North."`,
        belief: `""One day their group will birth Mavros Ilios (The Black Sun) and vanquish the Blood Moon and their hidden followers from the realm and bring the land into a prosperous, burgeoning society."`,
        hierarchy: `"Hierarchy \n
            Solith (Champion of the Sun): Highest Caste of the cult. These warriors carry with them the Sun-Touched armor worn during Blessed Hunts. Only several are members of this highest rank and act as a small council. \n
            Illochre (Iligion): Warrior caste directly below the Solith on their combative nature. Participate in Blessed Hunts and are in line to ascend to Solith as replacements of the fallen. \n
            Nesirea (Sun Seeker): Their diviners who scry the skies during daytime and patterns of the sun, looking for places that hold a great boon for a Sheathed Hunt to take place. Do not directly participate in Blessed Hunts unless shown to be formidably talented. Otherwise hold a Priest-like position in the cult. Are in line to ascend to Solith as replacements of the fallen if they also commit themselves to Sheathed Hunts. These members are born, or found few and far between, and as many as six tend to be active at a time. \n
            Ilire (Children of the Sun): Colloquially used as the lesser ranked members of the cult. Composed of the women, children, and boys not yet of age to participate in Sheathed Hunts. They tend to forage and build shelter when setting encampment, as well as look after their livestock which include oxen, horses, and at times boars. The most numerous of their caste."`,
        tenets: `Central Tenets of the Ilire \n
            "Must not take up arms against each other.
            Must not share wives and mates.
            Must not abandon a sheathed hunt.
            Must not abandon the Ilire. \n
            "Committing any of the above is a signifier of working on behalf of The Blood Moon Prophecy, and are stained to the worship of the Sun Ancient."`,
        worship: `"The worshippers have to birth or awaken their savior, however, until then, they must scour the land for resources, and mates, as these men were not accustomed to an agricultural lifestyle. Partake in Sheathed Hunts, raiding towns, or villages during a full moon, taking stores of grain, animals, wagons, carts, anything necessary for provisions and stockpiling or switching out clothes, armor, weapons, and goods. \n
            "These Sheathed Hunts occur silently, with little to no communication between the Ilire during the event, to maintain secrecy and quiet. No survivors may be left that stumble upon the ceremony, though if left slumbering, may be kept undisturbed through the Ilire’s discretion. Penance for violating one of the central tenets of the Ilire is possible under the strictest settings, and all is possible to be forgiven except for becoming an apostate. It is rumored that those who become apostate’s are hunted down as traitors to the cause, and is the harshest crime one can be sentenced to in the Ilire. \n
            "The Ilire were forged under the sunlight’s watchful gaze down field from the dense Wild of the Eye, closing in on the mountainous ranges that guarded well-kept secrets of the Cragore. They tend to move around the various parts of both Northren lands of the Daethic Kingdom and the Soverains, bouncing from one to the other when their Sheathed Hunts become less fruitful, but returning once every summer solstice to the original river that their ancestors first discovered the still alluring power and care of the Sun Ancient. \n
            "Many dozens still carry the banner of their cult, a pale, golden sun besieged by greyed clouds pouring rain atop an ashen sage field. Some say there are several groups moving and navigating at all times, though those are just rumors."`,
    }, 
    
    "Ma'ier": {
        history: `"During the Sedyren Wars generations past, a legion of Licivitan soldiers were routed from a battle due to their massive casualties, and couldn’t afford to venture back Noth towards their encampments for getting rundown or captured as prisoners of war. These soldiers continually traveled down river in enemy territory they’d never ventured previously, and by the light of the full moon out they found their way to an embankment and hid overnight to watch for any enemy troops that followed. As they slowly crept along further south, the moon guided their way until it gave way to sunlight. At night once more, the moon crept up, even larger than the last night, allowing them safe navigation through the land. \n
            "Once more, the sun rose and shone away the moonlight, and the legion kept moving along downstream. On the third night, the moon did not show, obfuscated by clouds and downpour. And on this night, the returning troops from the war had caught up with them, and proceeded to run them down. The legion booked it toward the bank of the river and forded at the nearest opportunity, narrowly dodging arrows along the way. \n
            "Afterwards they hurried up a cliff face overlooking the river, away from the ensuing arrowfall. The men gathered their strength to make a steadfast defense against the inevitable when their legion commander dropped to his knees, his men believing him to have taken an arrow. Instead he was praying, praying to be saved from their plight and be given a chance to renew themselves. \n
            "A higher power must have been listening, for as more men joined their commander in prayer, the waters poured harder, widening the river and causing countless enemy cavalry to be swept along the enraging current. Enough time passed for the river to turn into a gushing, deep channel, sweeping more and more of the horses and men the enemy had waiting to cross. Soon the remaining troops of the enemy had to flee from the fording, as the clouds dispersed partly to reveal once more, the great and full moon overhead, for the third night in a row, guiding their actions. \n
            "After that night, the men no longer walked and waded in fear, christened from their unyielding commitment and blessing from Ma’anre, the Moon Ancient."`,
        belief: `"The Moon Ancient looks over her children, offering guidance and safe passage throughout the land. One day their group will birth Laetrois Ath'Shaorah (Blood Moon) and vanquish the Black Sun and their hidden followers from the realm and bring the land into a prosperous, burgeoning society."`,
        hierarchy: `Hierarchy \n
            Fengariou (Champion of the Moon) - Highest Caste of the cult. These warriors carry with them the Moon-Touched armor worn during Blessed Hunts. Only several are members of this highest rank and act as a small council. \n
            Maeandrei (Marauder) - Warrior caste directly below the Fengariou on their combative nature. Participate in Blessed Hunts and are in line to ascend to Fengariou as replacements of the fallen.. \n
            Selini (Moon Chaser) - Their diviners who scry the skies and nights and patterns of the moon, looking for places that hold a great boon for a Blessed Hunt to take place. Do not directly participate in Blessed Hunts unless shown to be formidably talented. Otherwise hold a Priest-like position in the cult. Are in line to ascend to Fengariou as replacements of the fallen if they also commit themselves to Blessed Hunts. These members are born, or found few and far between, and as many as six tend to be active at a time. \n
            Ma'ier (Children of the Moon) - Colloquially used as the lesser ranked members of the cult. Composed of the women, children, and boys not yet of age to participate in Blessed Hunts. They tend to forage and build shelter when setting encampment, as well as look after their livestock which include oxen, horses, and at times boars. The most numerous of their caste.`,
        tenets: `Central Tenets of the Ma'ier \n
            Must not take up arms against each other.
            Must not share wives and mates.
            Must not abandon a blessed hunt.
            Must not abandon the Ma'ier. \n 
            "Committing any of the above is a signifier of working on behalf of The Black Sun Prophecy, and are stained to the worship of the Moon Ancient"`,
        worship: `"The worshippers have to birth or awaken their savior, however, until then, they must scour the land for resources, and mates, as these men were not accustomed to an agricultural lifestyle. Partake in Blessed Hunts, raiding towns, or villages during a full moon, taking stores of grain, animals, wagons, carts, anything necessary for provisions and stockpiling or switching out clothes, armor, weapons, and goods. \n
            "These Blessed Hunts occur silently, with little to no communication between the Ma'ier during the event, to maintain secrecy and quiet. No survivors may be left that stumble upon the ceremony, though if left slumbering, may be kept undisturbed through the Ma'ier’s discretion. Penance for violating one of the central tenets of the Ma'ier is possible under the strictest settings, and all is possible to be forgiven except for becoming an apostate. It is rumored that those who become apostate’s are hunted down as traitors to the cause, and is the harshest crime one can be sentenced to in the Ma'ier. \n
            "the Ma'ier were forged under the moonlight’s watchful gaze down river from the freer cities of Licivitas, closing in on the mountainous ranges that guarded well-kept secrets bleeding into Sedyrus, and the Firelands. They tend to move around the various parts of both lands, bouncing from one to the other when their Blessed Hunts become less fruitful, but returning once in a Blue Moon to the original river where their ancestors first discovered the still alluring power and care of the Moon Ancient. \n
            "Many dozens still carry the banner of their cult, a pale, red hued moon besieged by gray clouds pouring rain atop a cesious field cut by a river. Some say there are several groups moving and navigating at all times, though those are just rumors."`
    }, 
    Draochre: {
        history:`"The Dachreon were forged in times long since past, during the age of the Ancients. While it’s unclear as to how many of the Ancients they worshiped in addition to nature, scholars argue whether the Primal Ancients were adhered to in addition to Achreo and Cambire, who had more scrolls and tomes attributed to their reverence. \n
            "The Dachreon had a role to play in the Last Rites of the Ancients, giving themselves over to Achreo in order to restore the lands from breaking and sundering. To this day, Licivitas has adopted a variant of these beliefs in their institution of Arbiters, paying homage to the ways of old. \n
            "The Wild Ancient looks over his followers, offering guidance and safe passage throughout the land. One day their group will birth a Primal Draochre if necessary to aid in restoring peace to the land, bringing the realm into a prosperous, burgeoning paradise."`,
        belief: `"Others took a different approach and wilfully hunted a suitable adversary, large enough to encase himself in. Capturing the beast alive, the Druid would sacrifice it on an altar or brazier to the spirits of nature and Achreo or Cambire, spilling forth its contents and climbing inside to awaken his inner animal spirit, and mend itself into the creature, becoming one and transforming. \n
            "These led to the belief of The Dachreon having a hand in spawning the legends of the Tavore, Ilire, Gatshyr, Shyr, Cerchre, and Rana'vas. A similar story is told but for the entombing of the Druid inside flourishing trees ripe with sap, the engorging nourishment to aid in the metamorphosis into the famed Tshios and Draochre.
            "They tend to move around the various parts of the Northren lands, which were seen as the seat of power of Achreo, and encompass the newly forged alliance of the Achreon Kingdom and the Soverains, bouncing from one to the other when the seasons change and it’s advantageous to move towards more favorable settings. \n
            "Many dozens still carry the belief in the Achreo’s Rite of Way, granting peaceful terms with nature and allowing it to flourish by interfering as little as possible and living symbiotically. Some say there are several groups moving and navigating at all times, though those are just rumor."`,
        hierarchy: `Hierarchy \n
            Primal Dachreon: This is the leader of the Dachreon. He is not always alive in the world, only being reborn during times of great distress, when forces threaten the land. He is typically represented as a Snag, in a constant state of life and death, awaiting renewal in the form of a Seedling, though there is no guarantee that every Seedling derived from the fruit of a Prime matures. \n
            This has been noted in history, later penned onto various tomes and scrolls, that an Primal Dachreon aided in maintaining the land from fissuring, spluttering and breaking with the aid of Achreo or Cambire. This, by the way, is one of the only recorded measures that Achreo took an interest in, mending the earth; rumored to have sacrificed himself in the process as it went against his ethics of neutrality. Despite his nature as being the Primal Dachreon, he is typically not one to treat, or communicate with outsiders of the Dachreon, and sparsely shows use of any magic or ability around those uninitiated to the higher rungs. The Dachreon itself can persist and function well without an actual Primal Dachreon at any time. \n
            Eulex: These members of the Dachreon effectively serve as a small council of leaders. They are said to be in direct communion with nature, and its whims and wearies. They have the belief of being possessed by a fragment shattered during the Last Rites, and embody within themselves a partial mind of Achreo or Cambire, to guide them and the Dachreon towards attaining a true reverence for the Wild and position of neutrality. \n
            They effectively maintain sole control of the direction the Dachreon moves, both literally and figuratively. No more than three serve in any Dachreon, to allow the full breadth of the spectrum in ideas, passions, and decisions to be adhered to loyally. Colloquially referred to as the Ancient, for they have come past the Prime and into their roles, serving till death. No Eulex has ever been effectively crowned a Primal Dachreon. \n
            Guardian: Warrior and scholarly caste directly in inspiration due to their combative and lore driven nature, keeping a semblance of balance. Participate in councils when deliberating on rendering judgments of travel, trade, and punishment. However, their votes are weighted slightly when compared to the Eulex, and may be overridden entirely depending on the nature of the query. Are in line to ascend to Eulex as replacements of the fallen. \n
            These members tend to be higher in number than the higher ranked, and take on an Acolyte under their stead to train and teach formally, acting as a first mind to break down and open up the uninitiated towards the transcendent nature of the earth. Colloquially referred to as a Sapling, for its more matured nature taking root and growing towards a destination. \n
            Acolyte: The Acolyte is a Druid uninitiated, training to be worthy to be a full-fledged member of the Dachreon, which isn’t just a formal education on life and nature. There are steps of knowledge one must attain before moving through to attain the next rank. One must be diligent, have an avarice for learning all there is about the mysteries of the ley, beast, mer, and even man, for all succumb to the whims of nature. \n
            One’s body must be as open, flexible, and strong as his mind, training with their hands, legs, and natural weapons; daggers, axes, clubs, spears, bows, and nets. Nothing may be mastered, but all must be known. Colloquially these members are also called Seedlings, for their youth, and ability to grow rapidly over time.`,
        tenets: `Central Tenets of the Draochre \n
            "Must not take up arms against each other, for violation is a signifier of losing your rational spirit and giving into unbridled passions. \n
            "Must not take wives and mates, for violation is a signifier of losing your priorities toward keeping nature at peace, and can lessen your communion with the spirits. \n
            "Must not abandon the fruitful lands in favor of manmade structures and societies, for violation is a signifier of losing your adherence to nature. \n
            "Must not abandon the Dachreon, for violation revealing one as an apostate stains worship of the reverence and beauty of nature, and is a signifier of losing sight of your connection to it and Achreo or Cambire, cutting yourself off from their gentle guidance. \n
            "Violation of these tenets was not to be taken lightly, and depending on the severity or frequency could result in being sacrificed to nature and the Ancients."`,
        worship: `"Multiple shrines were built throughout the land (including man-shaped braziers that entombed a human sacrifice) in homage, currying the Ancient’s favor, keeping the surrounding areas undisturbed as recompense for the resources used in building said monuments, marked as places of worship, though scholars are unsure if this was the best measure to showcase their faithfulness to Achreo or Cambire, renowned to be absent and capricious Ancients. These forms of worship even went so far as to take place in human sacrifice. The Dachreon of Druids clamored to his favor as well, as most orations and written scrolls tend to adhere to this perception. \n
            "The reckless abandon of any gifts offered never deterred those who remained vigilant in their worship and endless attempts of appeasement to make their lives better for it. Achreo and Cambire are associated with Shattering, and lead some to speculate on the abilities of some Druids henceforth on their proclivities toward the supernatural phenomena. In addition Shattering, it’s also believed that Druids were capable of Scrying (Divination), reading the flight patterns of birds, the arrangement of the stars in the night sky, as well as the formations of branches in a Snag, the bones found of a decomposed animal, the twitches and convulsions of a sacrificial human to the Ancients, so on and so forth. \n
            "One disturbing practice of the Druids of old was to sacrifice a human and input his soul into the desired animal companion. The following hunt, it would show itself to the recipient and become his Familiar henceforth, sharing a bond with the animal and torturing the sacrificed as penance for his crimes, till the animal itself were put to rest."`,
    } 
};
export const WhispersButtons = ({ current, options, handleConcept, handleWhisper }: { current: any, options: any, handleConcept: (con: string) => void, handleWhisper: any }) => {
    const [show, setShow] = createSignal<boolean>(false);
    const buttons = Object.keys(options).map((o: any) => {
        const text = o.split("_").join(" ");
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceSub' style={{ "font-size": "0.65em" }} onClick={() => {checkShow(current, o, show, setShow); handleWhisper(o);}}>{text}</button>
            <Show when={current() === o && show()}>
                <SubConceptButtons options={whispers[o as keyof typeof whispers]} handleConcept={handleConcept} />
            </Show>
        </div>;
    });
    return <>{buttons}</>;
};

export const worldLore: World_Events = { // Old World Lore of each Province
    Flourishing: `The Flourishing \n
        "Many of the settlements insofar as wondrous fortresses, castles, and cities were built around this time with the aid of the Ancients themselves as a means of guidance and knowledge. Some created large scale cities with walls that spanned as far as the eye could see. Heights of a castle tower where no arrow could hope to pass. Rich ports that could field a fleet of warships and not have a moment's concern over the interference with trade. \n
        "Many statues were built in reverence to these primal beings, and peace were had throughout the land as man lived cohesively amongst each other, and without a blade having been raised in many centuries time. However, not all was seen as miraculous and beautiful. The Ancients themselves, for all their ceaselessness, appeared throughout the scrolls and texts penned thereafter, to be at odds with one another, depending on their form of worship and belief held sacred. \n
        "Over time, this caused uprisings in their most adent followers, clashing at times when their faith ran amok amongst countrer beliefs and cultures. These were not noticed in any specific event, but the general impression seemed to dictate that more occurred within the last several decades toward the Sundering than in the accumulation of centuries previous."`,
    
    Sundering: `The Sundering \n
        "Cataclysmic events caused unheralded and devastating natural disasters to occur simultaneously around the world at large. The earth fissured and cracked, the waters bubbled, foamed, and raged, the sky became covered in ashen darkness and pitch, and liquid fire spat forth from the bowels of the underworld. \n
        "Other than what was spoken off and eventually written down, with partial conjecture, gaps of time missing from the events in addition to some conflicting reports--depending on the text read, not as much is known about what exactly transpired. Most people who have heard the stories and perhaps have been able to read a single selection of works by a famed scholar, what we were to as common folk, tend to lok towards the ancient beliefs of the prophetic underpinning which brought about the worship of Daethos and the Seyr. \n
        "[Excerpt from the Blood Moon Prophecy]: Commonly associated as the champion of Ma’anre (Moon). It is written, “The tides will rise and crash into earth, the crest will be riven and pull in the skies, the heavens descend to uproot the fires, the furnace will rage as night turns to day, it splutters and fades as day yields to night.” \n 
        "[Excerpt from the Black Sun Prophecy]: As his role in the Last Rites of the Ancients, he will bring about the end of the world along with his followers. Commonly associated as the champion of Ilios (Sun). It is written, “The Black Sun will be dawned when the Moon surrenders its Light.” \n
        "From these sources in particular, which rooted sections of asserted dialogue and quotation exemplified, we may begin to see the beginning as it arose. Stemming on one side of the conflict, the Moon Ancient Ma’anre held her guard against Ilios, the Sun Ancient. It isn’t clear insofar as this being the beginning of the Wars, with other Ancients following suit and joining on one side or the other. We can assess by the description of nature in the excerpt of the Blood Moon Prophecy that all of the Primal Ancients were involved in the cascade that led to the momentary unraveling of civilization. \n
        "From historical accounts of the War, to beliefs linked to various Ancients, we can slowly begin to draw parallels of which of these supreme beings were at odds with another. In one instance, the interest and alignment of Kyrisos (Gold), with his scope viewed on mankind, appeared to be opposite Se’dyro (Iron) who bequeathed his ambitions on the mechanistic in nature. This is also seen most strikingly in Lilos (Life) with her more passionate approach towards her followers, a genuine fact of her character, posited against Kyr’na (Time), who was seen as similar in vain to her spoken virtues, which some writing belie were held with false pretensess. \n
        "From this, we can see a fissure within the Ancients themselves, those of whom preferred them affection towards humanity, and those who were more occupied with the nature of their own being, or things outside of human perspective. Using this form of logic as a first principle in the investigation, we can determine that in addition to Kyrisos and Lilos, other ancients that held more compassionate views towards mankind were Chiomyr, Ashtra, Shrygei, Nyrolus, Senari, Rahvre, and Cambire, based on various sources and orations that persist after the Last Rites. \n
        "The other Ancients who may have represented a more detached view of the realm in addition to Se’dyro and Kyr’na (If we believe the commentaries about her) are Quor'ei, Kyn’gi, Se'vas, Ahn've, Tshaer, and Achreo. \n
        "The next step would be to determine who we have a reliable narrative of--insofar as having a placement in the war itself. Thankfully, the sources that have survived keep a relative consistency to the narrative, with only a select few that appeared to remain absent during the events. Remaining careful in the assessment, we have Tshaer, Rahvre, Cambire, and Achreo having several sources to back up the claim of remaining neutral throughout the war effort, despite pressure (presumably) from both sides for their objection to the conflict. \n
        "The motivations of these Ancients to remain separate from all the warring, and to effectually endanger their own well being for rendering themself an apostate of the victors is a question posed from time even during the war, tracing down to commentaries written today on the subject. There remains to be seen whether new links connected henceforth grant a different vantage point amidst all the chaos that ensued during that time frame, issues including but by no means comprehensive: unreliable narration due to the bias of a scholar having been a follow of a certain Ancient, secondhand information on the front lines during the war effort, the penning of these works taking place after the advent of letters forged from our language--oration was the only form of historical context until after the Last Rites and people were resettled throughout the realm. \n
        "One issue most peculiar of all is the flux of time that seems to have been the belief held for why such accounts of the war, and timelines don’t appear to match. This may have in some part been due to the perishing of Kyr’na, though it is said she had given herself to the restoration of the realm during the Last Rites (Along with Lilos), and that her death may have inflicted a metaphysical shift with the occurrences, similar to the Sundering of the realm. Whatever happened, it does appear to be a mystery insofar as the motivations and first upheaval of the War, though it seems that it’s not uncommon given the nature of the Ancients, and by extension us. \n
        "The man who would be crowned Laetrois Ath'Shaorah wages war and great victory under an engorged, bleeding moon. Mythically, he was given divine inspiration by Daethos and originates from the mountains that exist between the present-day Soverains, Licivitas, and the Astralands. In this inspiration, a sword was forged in Ancient blood, capable of felling Ancients, and granting defense against its creatures in battle. \n
        "Laetrois Ath’Shaorah is the only recorded human who ever took the life of an Ancient. It is not presently known which Ancient fell by the sword, some interpretations believe it to be Ilios, and others Ma’anre. Laetrois is routinely conscripted into the myth and prophecy of both sides, in addition to a third sect believing him to rebuke both the Ancients in the war and fighting solely in the interest of humanity and Daethos, as its come to be more considered since the flourishing of the religion. Not sure whether others gave him countenance despite not having been pledged in their service, as those such as Achreo, Cambire, and Rahvre were known to be neutral during the war and may have had a hand in aiding the famed general."`,

    Last_Rites: `The Last Rites \n
        "With the passing of the Ancients, a destructive and ravaging war for life and liberty occurred on all fronts of every culture and society in the land. Those Touched or Favored [These are the colloquial terms for people, one disparaging the other a sign of heralding their superiority] by the Ancients, while holding more personal power in ability, were steadfastly outnumbered by the cursed folks sheer quantity. \n
        "This caused humans to take the land for themselves and rid themselves of being pawns or playthings to most of the Touched or so was claimed. Many more of the common folk stood as opposed to the Favored, even before the war. Furthering the disparity was the account that many of the personal soldiers and loyalists of the Ancients were specifically gifted. They held positions of commanders and generals on the battlefield, in addition to holding many ranks of troops, forming the bulk of their cavalry, archers, and frontline. \n
        "The Touched and their lesser kin were pushed away and out of the more hospitable and sought after lands to the brinks and edges of certain regions Licivitas, the Achreon Kingdom, the Fang Lords, the Firelands, and parts of Sedyrus remained the most human-like in their deviations. The Soverains, The Spine, The Alluring Isles, and parts of Sedyrus were more integrated with the Touched, and overtime these traits became less noticeable, but every so often issues would arise, or defections and mutations would be substantive. \n
        "This isn’t to say that the former regions lands were completely unTouched, however, these alterations appeared less commonly and may be heralded as lucky or blessed by an Ancient, or rebuked as an abomination of a lesser time."`,

    Age_of_Darkness: `Age of Darkness \n
        "The longest period of time after the Age of the Ancients, and before the beginning of the Age of Wars, all communication seems to have been lost, with many deaths leading the war from malnutrition, lack of means of survival, and the uprising of monsters that had persisted through the Last Rites."`,
    
    Age_of_Wars: `Age of Wars \n
        "This would be the time when the Ancients were worshiped throughout the land, from the Northern parts of the continent towards the central, their worship and the people surrounding them not reaching further south into what is now recorded as the Firelands, Sedyrus, and The Alluring Isles. The Ancients in the days of old repudiated the notion of traveling further, as the peoples would be thrown into fear and confusion, sources believe, not understanding the change of seasons and shifting lands. This also has to do with the waters that kept the lands separate. \n
        "No oral tradition is recorded with information about the lands South of what is now recorded as Licivitas, however, this may have been due to reports of the land reforming from the Sundering and Last Rites--the Ancients sacrificing themselves to keep the world tethered, which kept the land from fissuring and severing completely. This caused the waters to recede, revealing land to the South, connecting Licivitas to the Firelands and Sedyrus, and The Alluring Isles. Sages today remain with the stories presented as such, though some have produced commentaries on the subject expressing their doubt of such legends being legitimate in nature. \n
        "It does appear to be on record that many peoples were found on these lands after the Last Rites, which led to great wars taking place when the fight for land, resources, and fortresses abounded. The wars themselves caused much shifting amongst great families and the armies that survived to retake their once held lands, or occupy new territory. It is considered by way of ranking, that these are the most pure descendants of the Ancients: The Spine (Favored/Touched), Soverains and Achreon Kingdom, Licivitas. This may have been due to the natural barriers in place at the Spine, causing their culture and practices to be shut off toward the rest of the continent for much time until stabilization occurred after the Age of Wars and commerce, travel, and trade started once more. \n
        "The Soverains and the Lords of what eventually would be united as a Achreon Kingdom separated brutally among the more purist and zealous (Achreon Kingdom) and those considered Favored (Amicable) or Touched (Disparaging). Licivitas, for its nature to be in a central spot of travel, trade, and without many natural barriers, produced the most diverse culture, spreading further out than any of the others and mixing into their ranks people of the Firelands, Sedyrus, and The Alluring Isles over time, though still predominantly of the Ancient lineage. \n
        "Licivitas has a long-standing history of being one of the most powerful armies ever fielded in battle against any opponent, but over time it has grown accustomed to more civility in their interactions with the other lands. The Ancient lineage has taken a liking toward colloquially referring to the southern lands as the Firelands, Sedyrus, and The Alluring Isles in accordance with their directions in reference to themselves. They appear to have had no formal name for their lands, merely adopting it as the land of their leader’s Coat of Arms, yet seemingly have no admonishment for the terms frequently spoken in any regard. \n
        "One curious aside on the matter of the people South of the land that once ended at the central part of Licivitas; there were statues of similar variation to the Ancients of their land. In addition, it appears as though they worshipped the same beings, with comparable architecture, aesthetics (albeit reflecting their environment somewhat), and language (with twists on accents and such). This leaves the Sages with the belief that either travel and trade were more common than believed at the Age of the Ancients. Another theory posited is that the Ancients themselves had moved around, to and fro, or perhaps emigrated from the land in hopes of seeking more of the land at large. \n
        "However, this does lead to bouts of confusion over whether or not they truly were exposed to the Ancients and their ways or worship before the Sundering, as there isn’t any official record as such with writing being developed afterwards. This leads other Sages to speculate that the shifting murkiness of the history of the land South of the realm that became connected after the Last Rites may have actually been influenced by those humans traveling South, whether to conquer newly traversable lands, or perhaps escaping to resettle and avoid the wars. \n
        "There may also have been issues with the advent of persecution on the side of Daethos with the uprising of Laetrois Ath'Shaorah, as fervor for it began surfacing sometime between the Sundering and the Last Rites it is assumed, and the Ancients were blamed for the massacres of most of humanity due to their flawed nature as not being true primals and playing false, masquerading as Daethos for all intent."`,
    
    Purification_Trials: `Purification Trials \n
        "The trials of Purification are not the terminology regarding literal trials entirely, though those had taken place as well. These were a sort of crusade, the faith’s face for snuffing out those who were afflicted or Touched by the Ancients, perhaps in an attempt to aid in stabilizing the dominance of the new faith. There is also some skepticism involved as to the specific targets, and the issues surrounding their demonizing and accusations. \n
        "Some had the effect of warding humanity against those who were perceived as having special abilities, or who were perverse abominations of nature. The beliefs in the sincerity of such trials remains a mystery and point of contention depending on the sources being read, by whom, in which realms, and to what ends. \n
        "In total, there have been five purification trials, each changing in scope and direction of the realm: \n
        First Purification 1100 - 1099 AD, 
            Trial I - I   1100 - 1099 AD, 
            Trial I - II   1099 AD; \n  
        Second Purification 1098 - 1097 AD, 
            Trial II - I   1098 AD, 
            Trial II - II   1097 AD; \n
        Third Purification 403 - 387 AD, 
            Trial III - I   403 - 397 AD, 
            Trial III - II   395 - 393 AD, 
            Trial III - III   392 - 387 AD; \n 
        Fourth Purification 342 - 328 AD, 
            Trial IV - I   342 - 338 AD, 
            Trial IV - II   335 - 332 AD, 
            Trial IV - III   330 - 328 AD; \n 
        Fifth Purification 291 - 280 AD, 
            Trial V - I   291 - 288 AD, 
            Trial V - II   286 - 284 AD, 
            Trial V - III   283 - 280 AD"`,
    
        False_Prophecy_Wars: `"Over the centuries following the Last Rites, once Laetrois Ath'Shaorah had passed away and gave rise to the Seyr, there have been times when an uprising occurred, upholding the belief of the rebirth of the savior during the great Sundering. Or worse yet, the prominence and conquest of Mavros Ilios reborn, his greatest rival championed on the other side of the war, that which had been manifested from the rage and death echoes of the Ancients who had perished. These two have had much speculation written about them coming from various sources, be it oral stories passed down till the possibility of quill put to parchment came to being, in addition to first person narratives and encounters in the war, and of those who followed and worshiped the cherished and infamous men. \n
        "Due to the circumstances regarding conjecture based on their upbringings, of whether they were of noble birth disguised as normal folk, a true commoner who forged his legend through being made of some greater substance--perhaps Favored by the Ancients themselves, or even some that hold it having been an Ancient possessing or becoming a mortal, tasked with vanquishing the opposing side and stopping the world from tearing apart. \n
        "Over time, the Seyr has postulated a theory that is more or less the consensus of which were are to believe, that a man of obscure birth, be it noble or common, was championed by the One Above as his Avatar to purify the land of the ignoble Ancients, ridding us of their taint and affliction, thereby substantiating the time of peace and adherence to the one, true faith. This of course as we all know is but one side to the story, as it negates the tellings and accounts of Laetrois Ath'Shaorah having been the champion of Ma’anre (Moon) during the wars, and the conflation of the two seeming to be contradictory is not lost on those more mindful of their history. \n
        "The story may never fully be known, but what we do have evidence of, is the utilization of these prophecies to carry with it an affliction all its own--the ambition of those capable of weaponing such beliefs for their own gain, whether taking on the mantle with such a proclamation or thrusting it upon an enemy in the hopes of aid and excuse to vanquish him, and the accusations of the church to espouse heresy on another person or person’s lineage and bloodline, be it people of the faith or the old way. \n
        "In total, there have been seven false prophecy wars:
        The First False Prophecy War of 491 AD (Age of Darkness)
        The Second False Prophecy War of 474 AD
        The Third False Prophecy War of 443 AD
        The Fourth False Prophecy War of 386 AD
        The Fifth False Prophecy War of 327 AD
        The Sixth False Prophecy War of 279 AD
        The Seventh False Prophecy War of 58 AE"`
};
export const WorldLoreButtons = ({ options, handleWorld }: { options: any, handleWorld: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        const text = o.split("_").join(" ");
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceSub' style={{ "font-size": "0.65em" }} onClick={() => handleWorld(o)}>{text}</button>
        </div>;
    });
    return <>{buttons}</>;
};

export const provincialInformation: Region = { // Current Provincial Knowledge
    Astralands: `"Good one, those Ashtre have quite the mouth on them I hear yet never heard. Perhaps you'll be able to catch their whispers."`, 
    Kingdom: `"The King, Mathyus Caderyn II, has been away from his court as of late, his son Dorien sitting the throne--though constant feathers aid his communication when abroad. Despite its unification, groans have increased with disparate and slow recovery from the century long war only having quelled for 7 years prior, with select places receiving abundance of aid over others, the discernment itself seeming weighed in favor of longstanding allies. As the King reaches further East to establish peaceable connections with the Soverains, it leads one to speculate on the disposition of those houses already under his kingship."`, 
    Soverains: `"The Soverain-Eulex, Garrick Myelle, is throwing a week's long feast for the coming manhood of his son, Relien Myelle. It is his last surviving son, others perishing in the Kingdom-Soverain War, and his daughter being wed off to the Kingdom as part of a truce. It has been wondered whether the boy can live up to the immense fortune and luck of his father, who started not long ago as a would-be trader lord, slowly building roads and connectivitiy throughout the Soverains during the war, a wild boon during the war economically--its enhancement of intra-provincial aid notwithstanding."`, 
    Fangs: `"Word has spread that the growing settlement and peaceable futures of provinces has caused the chaotic stability of mercenary life in the Fangs to decouple from the consistent pattern of war occurring throughout the land for centuries. Some have been accepting work which brings them far and away from their homelands, by whom and for what purpose remains to be recorded. The Fang Lords themselves have outstretched their lands to incorporate better agriculture, with some of the more inland mercenaries providing a challenge as they wish to graze the land as any animal would. What do you believe?"`, 
    Licivitas: `"The Ascean, General Peroumes, is avoiding the prospect of coming back to Lor without cause of the authority of both the First Lorian and the Dae it seems. Much criticism of his prolonged campaign among the optimate fall to whipsers on the shoulders of the adoring populare, tales of his commentaries reaching further than the Good Lorian's word, its been said. The Cragorean, enemies in the current war against Licivitas, despite their fewer numbers and armament, have proved ruthless in their willingness to defy Licivitan conquest. What do you make of that growing sentiment?"`, 
    Firelands: `"The Ghosthawk of Greyrock, Theogeni Spiras, has not been seen as of late--his wife's health has been failing worse. He has been leaning on his administration housed with devoted, a strong change from the previous Protectorate, the Ashfyres and their adherence to Fyer, tradition that has persisted since written word. Peculiar, the man, once wildly famed from his crowning at the Ascea in 130, to overthrowing the longstanding Fyerslord, Laveous Ashfyre. The last vestige of their lineage, Searous Ashfyre, has been left in a fragile position, and many are curious as to the future of the Firelands. What do you think?"`, 
    Sedyrus: `"The Sedyren Sun, Cyrian Shyne, has reached an agreement with a lesser Quor'ator to betrothe his firstborn son to one of their daughters, hoping to stem general unrest from the cooling tempers of various families being uprooted of the Quor'eite, who lost a surprise war against their neighboring Sedyreal some decades past--the province solidifying after centuries of a Sedyrus/Quor'eia split into Sedyrus. Would you believe those that say this will leads toward a more peaceful future?"`, 
    Isles: `"The Alluring Isles is its own world, gigantic and terrifying despite its grandeur isolated by strange tides. The land itself a shade of this world, yet what can allow a man to travel a fortnight here, and a day there? I've heard about the size of the animals that stalk those jungles and swim in the waters, hard to believe anyone can sustain themselves there. Would you wish to see this place?"`,
};
export const ProvincialWhispersButtons = ({ options, handleRegion }: { options: any, handleRegion: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <div style={{ margin: "5%"}}>
            <button class='highlight dialog-buttons juiceSub' style={{ "font-size": "0.65em" }} onClick={() => handleRegion(o)}>{o}</button>
        </div>;
    });
    return <>{buttons}</>;
};

// Info Based on Race
export interface RegionInformation {
    Astralands: {
        SupernaturalEntity: {
            "Ahn'are": string;
            Cerchre: string;
            Chioba: string;
            Dwarves: string;
            Gatshyr: string;
            Quoros: string;
            Tavore: string;
            Anashtre: string;
            Sinacyn: string;
            Tshiathail_Kon: string; // Skeleton Knight King
            
            Carrier_Birds: string;
            "Rana'vas": string;
        };
        SupernaturalPhenomena: {
            Insight: string;
            Dreamshivers: string;
            Keening: string;
        };
        Institutions: {
            Ascea: {};
        };
        Region:{

        };
        World_Events: {

        };
    };
    Kingdom: {
        Entity: {
            "Ahn'are": string;
            Cerchre: string;
            Chioba: string;
            Cragore: string;
            Dwarves: string;
            Gatshyr: string;
            Ilire: string;
            "Ma'ier": string;
            Morath: string;
            "Re'vas": string;
            Shyr: string;
            Tshios: string;
            Aphyero: string;
            Chyrolus: string;
            Draochre: string;
            Sinacyn: string;
            Tshiathail_Kon: string; // Skeleton Knight King

            Carrier_Birds: string;
            "Rana'vas": string;
        };
        Phenomena: {
            Shifting: string;
            Vielo: string;
            Insight: string;
        };
    };
    Soverains: {

    };
    Fangs: {

    };
    Licivitas: {

    };
    Firelands: {

    };
    Sedyrus: {

    };
    Isles: {

    };
};