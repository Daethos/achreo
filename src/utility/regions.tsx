export interface RacialRegion {
    "Ashtre": ["Astralands"];
    "Notheo": ["Kingdom", "Soverains"];
    "Nothos": ["Soverains", "Kingdom"];
    "Li'ivi": ["Licivitas", "Firelands", "West Fangs"];
    "Fyers": ["Firelands", "West Fangs"];
    "Quor'eite": ["Sedyrus", "Isles"];
    "Sedyreal": ["Sedyrus", "Isles"];
};

// Info Based on Race
export interface RegionInformation {
    Astralands: {
        Entity: {
            "Ahn'are": string;
            Cerchre: string;
            Chioba: string;
            Dwarf: string;
            Gatshyr: string;
            Quoros: string;
            Tavore: string;
            Anashtre: string;
            Carrier_Birds: string;
            Sinacyn: string;
        };
        Phenomena: {
            Insight: string;
            Dreamshivers: string;
            Keening: string;
        };
    };
    Kingdom: {
        Entity: {
            "Ahn'are": string;
            Cerchre: string;
            Chioba: string;
            Cragore: string;
            Dwarf: string;
            Gatshyr: string;
            Ilire: string;
            "Ma'ier": string;
            Morath: string;
            "Re'vas": string;
            Shyr: string;
            Tavore: string;
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
            Shatter: string;
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

export interface SupernaturalEntity {
    // Hybrid
    "Ahn'are": string;
    Cerchre: string;
    Chioba: string;
    Cragore: string;
    Dwarf: string;
    Gatshyr: string;
    Ilire: string;
    "Ma'ier": string;
    Morath: string;
    Quoros: string;
    "Re'vas": string;
    Shyr: string;
    Tavore: string;
    Tshios: string;
    // Special
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
    // Animal
    Canire: string;
    Carrier_Birds: string;
    Kraken: string;
    "Rana'vas": string;
    Phoenix: string;
    Shamanic: string;
};

export interface SupernaturalPhenomena {
    Shatter: string;
    Charm: string;
    Vielo: string;
    Scrying: string;
    Insight: string;
    Dreamshivers: string;
    Keening: string;
};

export const SupernaturalLore: SupernaturalEntity = {
    "Ahn'are": `"These creatures are mnight, standing as tall as a man, but fare a bit lighter, making up for it tenfold in their gracious ability to fly on wings spanning twice their height. Legend speaks of Ahn've, a capricious Ancient, never comfortable with her choice of setting, weaving a spell to tether a unique bird to that land with a worthy sacrifice of an adherent follower,
        so as to keep her company. Depending on the breed it took after, these creatures could soar far and above, out of eye shot of an observer, and come swooping down at terrifying speeds, capable fo snatching unsuspecting folk from the land, never to be seen again. It is said there is a distinction for every one of the lands in which they inhabit, and for this reason the various leaders
        have made it their unofficial moniker to breed the pure variants for their carrier birds, and are cared for more deeply and thoroughly thanthe rest. Oral tradition has given way to the writing of various tomes, books, and scrolls on the subject, witn most conjecture believing in their existence now or once before, as said writings keep valuable information on the instructions to tend
        for the birds, in addition to quirks, breeding practices, behavior, dietary preferences, and preferred places of habitation. The Ahn'are themself, though, seem to take after more pernicious, human-like  behaviors, and are said to be full of tricky and luring with their songs and voice--Shrygei believed to having gifted them with such beauty they could not help but sing such sweet music,
        an affectation for his love of Ahn've, keeping in tight flocks and picking off prey when necessary to feed themselves and their children, or so the tales say. Evidence has been noted of larger nesting grounds that could house such creatures of size they're purported to be, though fewer still have any proof of their legitimacy, sans witness reports and 'honest' accounts. Invariably, it's
        hard to boil down which features are the most prominent between them, as you would to better to spy the bird in question of a specific province, and extend in your ming what he creature would look like, overlaying a human specimen."`,
    Cerchre: `"This is not to be confused wiht the uncommon, unfortunate, unforgiving small fok you may see plague and curse a family. These folk are cut from something harder than flesh and bone. They look heavy, of squat stone, carved into being and given achre from one of the more creative Ancients, Se'dyro. These dwarves tend to live around the North in the mountainous ranges, said to be 
        working with the neighboring folk, even the provincial Eulexes and Soverains. They bear a reasonable likeness to humans in the varieties of human expression, physically and caerenically. Short stout in all regard, their bodies have stuned limbs, which easily cord heavily with muscle and coarse hair through maturity, and when given exposure to certain fields of work. While they would not 
        do well in an agile envrionment, they have a heart body that causes little breakdown of energy or determinatino, able to work and cloister themselves in harsh conditions for periods on end, much to the cagrin of some humans, and admiration and exploitation of others. They do not appear to be stout of mind, capable of working with various parts of human society to extreme precision, 
        aiding them master craftsmen and engineers, though the more unfortunate may work in other capacities, namely field work and mining. It is rumored that they are not truly different from human in their breeding quality, and it may be that their kind are propogated by shameful lords, nobility, and peasants sending their cursed children tot hese places as a means to rid themselves of a burden and keep 
        their stock well bred. If you have not seen a true dwarf, they are not as one may expect, whether to assume they were truly cut from stone, or a malformed human given away."`,
    Chioba: `"Much has been discussed ove the ages as to what exactly these creatures are: dwarven cousins, stunted Tshios, a runaway strain of human that severed their connection long ago? Regardless, the agreements remain the same, Chioba live in the destittue cohabitations on the brink of society, found in various regions South of the Northren Soverain. Perhaps it is their appearance that gives 
        them admonishment form the common folk, standing shorter on average than humans, with a bit of curvature about their spin that seems to naturally occur in all their kin. It does not appear to be the case that their complexion and features differ all too much to that of humans or dwarves, though it has been said they give off monstrous feature not quite found in either of the two. Their skin 
        appears a bit sagger, a little more worn and putty-like, giving them alrger noses, ears, and lips, looking like a poorly carved statue resembling a human. Their teeth appear a bit more loose and jagged, stained yellow from their eating habits, and look to carry a few too many to ease someone's comfort if they were to offer a smile. They do not carry much weight, with elongated limbs, stretchy 
        and bony all the same, their joints poking wide than the breadth of their muscle. They have no issue wearing clothing and take to human cultures rather well, yet their distinct appearance shows their true nature rather readily, even when bundled up in cloth, silks, leather, or furs. Their nature is in keeping with that of a human or dwarf, rather wild and as varied as the next. They do not 
        appear to suffer any ill's of the mind, for better or for worse, and while they seem to suffer a natural impairment physically which doesn't take to large scale agriculture, hard labor, or martial prowess, their ability to work a quick, set a scale, or fine tune a string is well appreciated. To this degree they seem to have set themselves appear mildly from their dwarven counterparts, as they are 
        all but useless when subjugated to hard, manual work. And, like the dwarves, those who find their kin to be cursed with the blood of the Chioba tend to offer them over to their kind, perhaps in misguided love, to give them a life more accepting and tolerable. It is not certain where exactly these man-like creatures have risen, with soem saying they are a deviated of an Ancient, or the creation of one: 
        Chiomyr if you despise them, or Shrygei if you are cordial."`,
    Cragore: `"As the tale goes, these are strong, brutish creatures that live among the rocky hills and mountains, heard to reside on the ranged separating the Achreon, now Daethic Kingdom from the South, and around the spine of the Astralands. Standing tall relative to humans, they are well over six feet on average, with stone-carbed muscles and patches of hair strewn about their body. Replete with harsh, 
        bone-crushing jaws filed with two sets of dog-like teeth--often said to be maneaters, and potentially cannibals as well. Their eyes are large and darker in color, with pupils covering almost its entirety, granting vision as night when hunting nocturnal game. With that, they seem to have flat noses with smaller nasal passages to more easily warm and wet the thin air, and larger ears to pick up on trace 
        sounds about the wilderness. A darker complexion adorns them, with mixtures of bronze and mahogany, to forest greens and subdued colors in between. Legend has it that their lives are ruled in a hierarchical structure, with bands of them that may venture down the mountains to raid if they see travelers or passersby. Different weathers along the mountain ranges precipitate different tribes and within them, 
        various beliefs and interwarring. It is not ceratin if they believe in an Ancient and still pratice adherence toward the old, but if one were to bet, it would be easy to imagine prayers being sent to Kyn'gi, Se'vas, and Tshaer. No one is certain how stable or fruitful their population remains, though it does not seem to affect the amount of reports that accumulate, based on season and variance of travel. 
        Some tribes are rumored to speak and understand neightboring languages, going so far as to gleam and mimic their cultures as well, though most don't believe these creatures are capable of such thought. Some of the boastful even go so far as to say they have barted with these monsters, and seen their villages, sharing in food and drink. Believe these tales at your peril."`,
    Dwarf: `""`,
    Gatshyr: `"Human-like cat creatures with reversed palms being their most notable trait after the fur, color, and head of a feline. They come in different breeds depending on the land, with some looking like that of lions, lynxes, jaguars, and even tigers in the Isles. Their size is precipitaed by a relative breakdown of how large the cat tends towards, with a tiger Gatshyr stretching out past ten feet, 
        and the Lynx making to just about five. The framing of their bodies appear to be a mixture of cat and human, with an elongated torso and tail ala the feline, but the levers, muscle insertion, and hand-like paws of the human counterpart. These often look like betwitched animals, having growls and roars as though it were a poor imitation of speech, but many have said to hear the utterances close in pattern 
        to that of a human. Dangerous predators that tend to be seen in smaller packs, and odn't spare humans from their eating habits as a consequence, it has been said that there are no natural predadtors of the Gatshyr. do not wander the hills, forests, and mountains by your lonesome, lest you test the patience and stalking powerss of a Gatshyr lying in wait. Where you would normally find its pure, animal 
        counterpart is where you may find them, leaving one wondering if the spotting of the pure animal breed is a harbinger for osmething much crueler, frightening, and savage, loitering in the trees above, or down below in the bush, watching you. Commonly associated with Tshaer, and perhaps were creations by the most ardent followers submitting themselves to be physically transformed or have their mind placed 
        into the beasts to defend nature during the War of the Ancients. Another belief is that its more natural, pure cousin was captured long ago, and the Dachreon would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, mending itself into the creature, becoming one and transforming."`,
    Ilire: `"These beasts mix a great deal of belief, fear, and goodness into a harrowing monster. IT is believes that Ma'anre cursed followers of Ilios during the War of the Ancients, transforming them and showering their hideous true nature under her unyielding glow, marking them as enemies or potentially traitors to their cause. Another belief is that its more natural, pure cousin was captured 
        long ago, and the Dachreon would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, and mend itself into the creature, becoming one and transforming. The appearance of one tends to differ based on which inn or region and which drunk is prattling on about their account, or whose wife's brother swears 
        upon his belongings he's seen one. Generally, it seems to deal with a wolf-like man, which takes on feature of wolven skin, temperance, and head, but adds a man's cruelty, cleverness, and rage that couldn't be found amongst such a common beast. Reports of size varies based on the man possessed with such a foul caer, only shifting in appearance and adding a bit of length about the snout, legs, and 
        paws. The natural hair fo the man is reflected in the coloring of the wolf's fur, so if you witness a righteous 'Faith Cloak' on a midsummer night's stroll violently thrash about and remove his armor to reveal a man of black locks, prepare for a most righteous and rueful smiting only a creature of the void can summon. And if you witness a wolf behaving a bit transge, a good tell would be to hear 
        its howl augmented with the nuanced pitch, coupled with the remarkable and terrifying gaze as it stares you downwith two enlarged, yet distinctly human eyes. Accounts vary on whether it can function only on four legs or if it's capable of stalking on two. One thing all men swear by is the timing of their encounters, relating to the swelling of the Mother Moon, give or take a day for good measure. 
        This does not seem to be reasonable given that a man is a man and a wolf is a wolf, needless to say the evidence is quick stacked, if you would believe them. Either they only hunt during the moon's swelling, or a cursed man turns during it sfull breadth. And one more thing, in case you feel frightening to go out during the hours it might be prowling, one should be safe when holding a weapon or armor 
        'encased in purity'--What this means it is not certain. Some believe it to require faith in Daethos, or a blessing by a member of the Seyr. Others take it to mean someone who is absolutely in their bloodline or lineage. Be careful of their swipes and bites, however, as the curse of the Ilire may spread like disease if they can entrench themselves in your coursing blood."`,
    "Ma'ier": `"The most human-like of all these entities, their appearance ranges as much as the average human differs fro manother. They can be short, bald, and take, to tall, lithe, and handsome. Men and women have been said to possess ma'ierec qualities or outright be one. First stories recognize that perhaps some fo these most adherent worshipers of Kyr'na are said to have been warped into, 
        or perhaps that was their cruel reward to an appeasement toward her. Other stories mention Ilios cursed the followers of Ma'anre, who joined sides with Kyr'na during the War of the Ancients, expunging and erupting them into flames upon the purifying light of his unwavering presence. There is old, traditionally oral lore, coupled with tomes eventually transcribed, that details the behaviors and traits 
        of a Ma'ier. One may notice their gray, ashen complexion that seems to soak in the moonlight--others take a different path with a bronzed tone. Antoher would be their dull, lifeless eyes, stricken from a rich color, whatever it had been tends to recede to a faint, glassy, grayed hue. Their scene smells similar to that of well-worn chainmail and a smith's lair. What is not obvious at first glance 
        is their avarice, which may take on a feral trance, and their passion can consume them in a variety of manners. Need to know if you are consorting with one? Lock them in a cell for a few days and check back up on them. Their eyes will ahve sunken skin--taut and rigorous, with gums receding to show a peculiar set of sawn and jagged teeth. They will have labored breathing, rapidly callapsing their chest, 
        with a hunch caused from the unbearable pain in their abdomen. Other issues for them include the 'Right of Invitation,' in which a Ma'ier will never overtly mention, they will require acceptance to enter private doman or suffer irrevocable pain akin to their 'Curse of Avarice.' Another if their admonishment of Ilios, and Daethos. This causes a slew of issues when dealing with members of the 
        religion in positions of power, the baneful sigils and relics of it, and places of worship. Another detail written is their concern with natural running water, absurd as it may be. One would not wilfully cross it, and only be subjec to passing through if he were carried in some manner. One last measure to lookout for is their dealings with the Sun. They may seem folly, as how can one scorn the Sun 
        while masquerading? One does not have to lead a life where this is an issue, where the Sun does not appear, for long or at all; or a life that does not beg for one, such as a guard through the night. This leaves much time during the day for other actions and events, though even a Ma'ier must rest. Beliefs diverge on how long such activity must last, though no one has noted less than three hours time 
        in the soil of the land which bore him life. Which poses another concern, is it his first life mortal, or his second, born again? These do not seem believable or true for an actual creature to suffer, a sort of caerenic pain being experienced. Then again, the power of belief in one's caerenic pain is palpable and embedded in all things, even humans, so do not assume these are not possible if you believe such a foul 
        monster persists throughout all this time. For all these flaws one might hear, they are not without their spoils. These cruelties have powerful charms that can be cast with as little effort as a piercing gaze, effectively charming said humans for a time. Abother is their enhanced prowess and strength in many forms, through a strict concentration on man's blood, he gains insight to embolden himself with 
        heightened sense, strength, agility, recovery, ceaselessenes, and recollection, with some times at the expense of a victim. Of course, this is the totality and amalgamation of various accounts, but one wonders if such a creature exists, with its years of cleverness and experience, just how far one has risen?"`,
    Morath: `""`,
    Quoros: `"Often these horrific monsters are characterized as being similar in vein, whether through witness accounts or descriptions in oral tradition, as bearing likeness to the Cragore, or Tshios. However, this appears to be misguided myth. Quoros are believed to range between eight to well oevr twleve feet high, described as a shambling mountain slide. Their face is said to be similar to craftwork 
        dating to a pre-written time, rough, large, and calloused, without an effort for finer details, mirrored in its set of thick, flat-edged teeth, each looking like a sword cut near the hilt. Adoring their head, if not bare, have accounts ranging from hollowerd out tree stumps, crude and rusted iron caldrons, to skulls of ancient animals or perhaps mightier, dead Quoros. Large is an understatement, 
        with shoulders that would take a pavise repurposed to fit like pauldrons, body's that would require a fully-grown ox to field the leather to strap around, hands like beaten slas of stone, with each finger the size of a man's gaultlet. Tehri arms and legs are effectively tree trunks, which as legend has it, does allow for a strangely reasonable amount of concealment, in no small part due to their 
        hair growing in length and color witht he changing of the seasons. These creature may stand as still as oak, and allow you to pass by a time or two, but if their temperance wavers, they would be quicker to snatch you than a snare built by an expert trapmaker. Do not let this lull you into a sense of security insofar as keeping a wide berth around the surrounding areas in which they are sighted, for while 
        a man's wits may suit him where he's from, it will not match that which this mer has established its life. These creatures, for all the awfulness of their physical nature, have not much written ont heir behavior, though some testimonies believe a monster this foul cannot have a kindness in their caer, and live as a twisted representation of a cruel jest from an Ancient long since past. Said to have awoken, 
        or been created by Quor'ei to be used as soldiers in the War of the Ancients. Another belief helf was that some worshipers, clamouring for the Ancient's favor and being bestowed with an unhinged rage in their manifestation. In this legend, the followers were submerged beneat the earth, entombed in clay, mud, rock, and salt, to be transformed into these wicked beasts."`,
    "Re'vas": `"Said to be the one, true abonimation that has been spoken about throughout the ages, and formally scribed in scrolls and various tomes throughout writen history. These shambling creatures are described in myriad ways, whether near human-like in appearance, to referencing gross amounts of decayed and rotting flesh strewn about the face and appendages, to carrying on a more caerenic nature, 
        able to smoke through physical objects and even possess people. If encountering one that appears more life-like, it will carry with it a more taut and still manner, still able to flex and accentuate movements and posture, but something will definitely be off when detailing its actions. The flesh will be mottled, and fading from it any semblance of coursing blood, leaving a pale, gray complexion, 
        somewhat dry and ashen. From there, to go by degree of rot seems natural but is rather strange, will reports on the same Re'vas at differnet points in time denote the same level of decay! This would make one wonder if there is a property, whether natural of otherwise, that causes a cessation once a curse, affliction, or possession takes place. The writing is not entirely certain as to how these 
        abominations crop up from time to time, and what would not only be the certain cause, but the cirumstance that calls for it, if otherworldly. These creatures have been said to appear, or arise, whenever a great misfortune or severing of justice has occurred, plauging whomever they intent to cause harm before returning to become a lifeless corpse, or a vanishing spirit. Of course, this would imply some 
        form of retribution or vengeance in death, which not everyone believes is correct if following the teachings espoused by Daethos. It isn't in keeping with understanding what manifests itself after death, and the idea that the dead can continue living is considered shameful and afflicts on a curse on the remaining and subsequent lineage of the Re'vas. Due to this, it can be imagined why some are adhorrent 
        to the notion that these creatures exist at all. There is another table to be told about the Re'vas, and that is one that speaks directly on the belief of the elder Ancients, and Daethos. In it, ceratin tome's have spoken of a pact, older than written history, that culminated in the steadfast opposition to the rise of Daethos. Various adherent worshipers of the Ancients, namely Lilos, Ma'anre, Ilios, and 
        Se'vas. With this pact, time and time again throughout history, the worshipers would rise anew, either in their old bodies, possessing the corposes of others, or if truly stark, their caeren itself in order to drive back the corrupt and harmful devout associated with the Seyr of Daethos, to tear it down and restore the rightful worship of the Ancients, through the Blood Moon Prophecy. Re'vas are also 
        vaguely associated in part with the Ky'myr, due to the nature of a once human becoming wrought with meaning that presisted beyond death itself, and seeks to attend to such aims."`,
    Shyr: `"The mischievous, human-like goat abomination, why anyone would imagine such a union, look no further than just thoughts of mutated dwarves, using unpolished stone for barter. Such tales illuminate depictions of a creature with the legs of a goat, and upperbody of a man. Unless cruel stitching and witchcraft was involved, nature would rarely be so sloppy. These machinatinos are smaller in size, 
        from three and a half feet to five feet tall, with cruel faces that twitch even when not uttering, and horns that curl about their ears. Cold, blinking black eyes dot the sides of their faces, and a strong set of sawn, flat edged teeth adorn their mouth. Their body appears a bit slight, with arms that double as legs for galloping, covered in matted hair that reflect its environment, ranging from dull 
        yellows, whites and grays, to richer, fuller browns and blacks. It has been said to never travel near one with small children at night, for their size betrays their true strength, and their appettie extends to humans. A few moments begot of a traveling companion, and a Shyr would snatch them up, back toward its abyss, a couple deft jumps here and there, up the cliffside and gone, the last traces an echoing 
        of the unlucky person's screams, and the Shyr 'bawwing' manically. It is unknown where exactly you would find them, you hear about a certain mountain that may cater to their preferences, a port shor that may harbor them, or a series of forests that stretch through a field from them to graze. Perhaps rocky streams and rivers that bleed into a basin, the sightnings have been endless through oral and written 
        history. Commonly associated with Tshaer, and perhaps were creations by the most ardent followers submitting themselves to be physically transformed or have their mind placed into beasts to defend nature during the War of the Ancients. Another belief is that its more natural, pure cousin was captured long ago, and the Dachreon would sacrifice it on an altar or brazier to the spirits of nature and Achreo, 
        spilling forth its contents and climbing inside to awake his inner animal, mending itself into the creature, becoming one and transforming."`,
    Tavore: `"A famed beast of legend, possessing the head of a bull with the body of a man. Of course, these don't exist so cleanly seperate in truth I believe. Invariably they have the head of a bull, but this leather, short-haired skin comes all the way down, standing on two legs with hooved feet and the arms of a man.
        These hands can curl into a fist as effectively as behaving as another foot, enabling short sprints on all fours, committing to devastating charges. They stand quite larger than a normal man, nearing and tipping over eight feet in height, causing their head to be larger than a man, but perhaps smaller than an actual bull. 
        They horns jut about the sides and curve forward, possessing the strength to life a man off the ground, even one adorned in full plate, goring in close quarters. A larger snout enables them to house a great many teeth, capable of severing bone. Their eyes pitch, reflecting all encompassing light, set at the sides of their head, keeping in fashion with the commong bull one might find.
        Their smooth, leathered skin can come in various coats, from an oft-colored brown, to black, to start white in contrast, depending on where it may be encountered. Most have been heard to live on the plains and stretching fields, some North of the great range of mountains, and some further South between Licivitas and Sedyrus. As to how they propogate, well, many stories entail
        maidens going astray and disappearing, perhaps to fulfill the carnal rage of one of these monsters. Few have said to been in contact with them, and appear to be the stuff of legend since the Last Rites. They are associated with Tshaer, and may have been their creation by the most ardent followers submitting themselves to be physically transformed or have their mind placed into beasts
        to defend nature during the War of the ancients; and Kyn'gi of the Hunt, fot its nature to prey on man and take maidens as right of conquest or ceding to its aforementioned lust. Another belief is that its more natural, pure, cousin was captured long ago, and the Dachreon of the North would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its
        contents and climbing insde to awake his inner animal, mending itself into the creature, becoming one and transforming."`,
    Tshios: `"Taller, leaner creatures not without a liveliness and strength that live among the Boreal, Temperate, Tropical, and subtropical forests around the lands that sustain the foliage, such as the Eye in the Daethic Kingdom/Soverains, the Astralands, the Firelands, Sedyrus, and the Alluring Isles. Tshios stand near eight feel tall according to some accounts, with long, sinewy limbs, both upper and lower body, 
        and natural patches of matted hair. Their eyes are set deep into their face, human-like in the size of the pupils relative to the whites, with a broad nose, and agape mouth that is filled with sawn, flat-edged teeth, and  acouple jagged adorning where a human's would sit. The mouth, as mentioned, sits open, with visible, constant breathing, though why this is a recurring report is not certain. Their skin color 
        seems to adapt to the condition of the forest htey surround themselves, with white hair and light skin inthe North, toa richer green in Sedyrus. Their behavior seems to change from Tshios to Tshios, as rarely do travelers recount the same tale when encountering one, but perhaps that is due to a form of achre rarely witness in other beasts. Some swear they have found one, stabbed it, cut off their limbs, 
        only to have them scurry off, limb in hand, no worse for wear, and the Tshios treating it with minor issue. They are said to be isolated creatures, not having a report been written or recalled in which more than one was spotted, which causes one to wonder how they propogate. Extremely rare and waved off as legend and rumor, those said to have communicated and treated with them have boasted a renewed vigor 
        that one was lost, and any fright or confusion held by witnessing such a creature should be waived off in favor of calm and peace. Some say these creatures are doomed creation of some humans attemping to usurp the Ancients seat of power long ago, and must walk their days in ceaselessness, slowly losing their memories and their sins. Other's posit a more deliberate spellcrafting, believing them to be the 
        creation of Astra during the War of the Ancients, blasting bolts of lightning down from teh skies onto elder trees, granting the shedding bark life to protect her land and people. A similar story is told of entombing a member of the Dachreon of Druids inside flourishing treets ripe of sap, engorging nourishment to aid in the metamorphosis into the famed creature."`,
    
    Tshiathail_Kon: `""`, // Skeleton Knight King
    "Ky'myr": `""`,
    Nyrae: `""`,
    Sinacyn: `""`,
    Anashtre: `""`,
    Draochre: `""`,
    Aphyero: `""`,
    Fyrash: `""`,
    "Quor'eo": `""`,
    Chyrolus: `""`,
    Phoenix: `""`,

    Canire: `"One of the more sinister creatures we have heard rumor of, thought to be a gross mixture of misplaced obedience and uncontrollable avarice. These notions, unfortunately, appear to have a bite of truth to them, more than we care to imagine. It is said, largely through conjecture--through some of this has been put to parchment by various quills, to have been a plotted effort to breed a more savage, 
        ravenous hound, with thrice the loyalty of a normal one. A by chance occurrence took place long ago, where a litter of pups were birthed carrying two heads in place of one. The connicing breeder pondered an idea, and began attempting to breed the pups among their own, cursious as to the effects. Some of the pups died shortly afterward, whether due toao a cursed illness or lack of nourishment, they seem 
        fated for the same end. However, over time, a small few managed to mature, and mate, which began more disturbing trends. This time over, thre heads propagated for the pups, bore to two-headed mothers and fathers. Again, the same curse befell many of the litter, with more dyring before reaching a healthy, mature age than not. Nothing appeared to stave off the issues that were brought from attemping to 
        feed thrice-many mouths as would normally be constituted. However, those few who were lucky, strong, and willed to live, became great beasts of burden--not to mention loyal, cunning, and aggressive. These hounds seem to share a mind with the others, both in themself and their kin, and can respond to events transpiring near one even when far away from the others. Since, much has been written after the 
        matter about these monsters, how to raise them, their behavior, eating habits, preferences of other animals and humans, a heavy treatise on steeling yourself for the journey. Very few are gifted in the sense of animal bonding, which coupled with the specific nature of the breeding, causes these creatures to be a rare sight throughout most of the lands, those who may afford the services tend to 
        establish a whole keep and kennel for them alone."`,
    Kraken: `"Due to his peculiar qualities, Nyrolus most appreciated the octopus over any fish in all the depths of the sea. He saw their brilliance as predators, thieves, and problem-solvers with great amusement, and with this, when it came time to forge a being that would herald victory in the coming War of the Ancients, he forged this monster. While some is scribed in parchments, sun-worn and salt-stained, 
        it is invariable shocking to those that hear this, despite countless tales and legends told, these monsters due in fact exist, or at least once long ago. While many of these other beasts from the past have issues of hard evidence, unable to touch levity with a captured monster, or corpse drug back to a Sage for earnest approval, we have encountered the remnants of Kraken as recently as 250 years prior. 
        Large, slimy, puckered tentacles, still teeming with life have been hauled back to shore, stretching well over sixty feet in length, larger than any animal we have been able to record well over thrice-fold. The varied tales upon the ship carrying back a piece of the Kraken may stretch from a near miss, being capsized and pulled under, to a whole slough of them attacking mass numbers of fleets, with fledgling 
        survivors taking trophies. Whether either story rings true, we have to deal with the possibility that these creatures are still out there, and what that means for seafaring. Some port-cities have put an embargo on their ships traveling too far from shore, lest it be pulled under by these foul monsters lurking below. Others, mainly Sages, have had their interest piqued and moved towrads the shores, 
        eager to study the lesser threat known as the octopus, to learn from its habits and temperament. Time will tell if these matters yield project, but until it comes to pass, I recommend you stay close to a couple leagues near the sandied beaches, and pray you do not meet a wet and dreary end."`,
    "Rana'vas": `"Almost nothing is known of these frogmen, and much information that does exist is extrapolated from the writing of other human-like creatures. Commonly associated with Tshaer, and may have been their creation by the most ardent followers submitting themselves to be physically transformed or have their mind placed into beasts
        to defend nature during the War of the ancients; and Kyn'gi of the Hunt, fot its nature to prey on man and take maidens as right of conquest or ceding to its aforementioned lust. Another belief is that its more natural, pure, cousin was captured long ago, and the Dachreon of the North would sacrifice it on an altar or brazier to the spirits of nature and Achreo, spilling forth its
        contents and climbing insde to awake his inner animal, mending itself into the creature, becoming one and transforming."`,
    Shamanic: `"Dire animals that are inhabited with the mind of some gifted, spoken of as shattering, more specficially its shifting variant. In this form, one has the requisite abilites of the animal, but carry with them a human's capacity for cleverness, creativity, and malice. It is not clearly written in the scrolls and tomes as to how long, thorugh what distance, and when such occurrences and possession can take place. 
        Some believe the Shaman must perform meditative practices throughought the project, others believing he can sever his mind during periods of rest. The most abnormal and rarely written shaman are parashifters, who can arrest and use such creatures and their own bodies at once. Through these measures, a person can use the new, teeming senses to collect and transport information, hunt, main, and kill, or perhaps 
        something more sinishter, staging. A couple treastises remain on the subject, heralded as the fundamentals of understanding such a concept from an observer's perspective, but now most people do not believe that these abilities occur, or such a technique has long since faded from this world. Another belief is that its more natural, pure cousin was captured long ago, and the Dachreon would sacrifice it on an altar or 
        brazier to the spirits of nature and Achreo, spilling forth its contents and climbing inside to awaken his inner animal, mending itself into a creature, becoming one and transforming."`,
    Carrier_Birds: `"It is said there is a dinctiont of an Ahn'are for every one fot eh lands in which they inhabit, and for this reason, the various leaders have made these birds their moniker to breed and use as carriers of messages, and are cared after more thoroughly the the rest. Oral tradition has given way to the writing of various books, scrolls, and tomes on the subject, with most conjecture believing in the 
    existence of said Ahn'are, now or once before, as said writings keep valuable information on the instructuion to tend for the birds, in addition to quirks, breeding practices, behaviors, eating habits, and preferred places of habitation. They are as follows: Gray Parrots of the Astralands, Ilian Eagles of the Daethic Kingdom, Long Dobes of Licivitas, Prime Owls of the Soverains, Rainbow Parrots and Harpy Eagles 
    of the Alluring Isles, Burnished Crows of the West Fangs, Ghost Hawks of the Firelands, and Blue Pigeons of Sedyrus."`,
};

export const SupernaturalPhenomenaButtons = ({ options, handleSupernatural }: { options: any, handleSupernatural: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <button class='dialog-buttons' style={{ background: '#000', margin: '2%' }} onClick={() => handleSupernatural(o)}>{o}</button>;
    });
    return <>{buttons}</>;
};

export const SupernaturalEntityButtons = ({ options, handleSupernatural }: { options: any, handleSupernatural: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <button class='dialog-buttons' style={{ background: '#000', margin: '2%' }} onClick={() => handleSupernatural(o)}>{o}</button>;
    });
    return <>{buttons}</>;
};

export const localLore: Region = { // Localized Provincial Lore
    Astralands: "Good one, those Ashtre have quite the mouth on them I hear yet never heard. Perhaps you'll be able to catch their whispers.", 
    Kingdom: "The King, Mathyus Caderyn II, has been away from his court as of late, his son Dorien sitting the throne--though constant feathers aid his communication when abroad. Despite its unification, groans have increased with disparate and slow recovery from the century long war only having quelled for 7 years prior, with select places receiving abundance of aid over others, the discernment itself seeming weighed in favor of longstanding allies. As the King reaches further East to establish peaceable connections with the Soverains, it leads one to speculate on the disposition of those houses already under his kingship.", 
    Soverains: "The Soverain-Eulex, Garrick Myelle, is throwing a week's long feast for the coming manhood of his son, Relien Myelle. It is his last surviving son, others perishing in the Kingdom-Soverain War, and his daughter being wed off to the Kingdom as part of a truce. It has been wondered whether the boy can live up to the immense fortune and luck of his father, who started not long ago as a would-be trader lord, slowly building roads and connectivitiy throughout the Soverains during the war, a wild boon during the war economically--its enhancement of intra-provincial aid notwithstanding.", 
    Fangs: "Word has spread that the growing settlement and peaceable futures of provinces has caused the chaotic stability of mercenary life in the Fangs to decouple from the consistent pattern of war occurring throughout the land for centuries. Some have been accepting work which brings them far and away from their homelands, by whom and for what purpose remains to be recorded. The Fang Lords themselves have outstretched their lands to incorporate better agriculture, with some of the more inland mercenaries providing a challenge as they wish to graze the land as any animal would. What do you believe?", 
    Licivitas: "The Ascean, General Peroumes, is avoiding the prospect of coming back to Lor without cause of the authority of both the First Lorian and the Dae it seems. Much criticism of his prolonged campaign among the optimate fall to whipsers on the shoulders of the adoring populare, tales of his commentaries reaching further than the Good Lorian's word, its been said. The Cragorean, enemies in the current war against Licivitas, despite their fewer numbers and armament, have proved ruthless in their willingness to defy Licivitan conquest. What do you make of that growing sentiment?", 
    Firelands: "The Ghosthawk of Greyrock, Theogeni Spiras, has not been seen as of late--his wife's health has been failing worse. He has been leaning on his administration housed with devoted, a strong change from the previous Protectorate, the Ashfyres and their adherence to Fyer, tradition that has persisted since written word. Peculiar, the man, once wildly famed from his crowning at the Ascea in 130, to overthrowing the longstanding Fyerslord, Laveous Ashfyre. The last vestige of their lineage, Searous Ashfyre, has been left in a fragile position, and many are curious as to the future of the Firelands. What do you think?", 
    Sedyrus: "The Sedyren Sun, Cyrian Shyne, has reached an agreement with a lesser Quor'ator to betrothe his firstborn son to one of their daughters, hoping to stem general unrest from the cooling tempers of various families being uprooted of the Quor'eite, who lost a surprise war against their neighboring Sedyreal some decades past--the province solidifying after centuries of a Sedyrus/Quor'eia split into Sedyrus. Would you believe those that say this will leads toward a more peaceful future?", 
    Isles: "The Alluring Isles is its own world, gigantic and terrifying despite its grandeur isolated by strange tides. The land itself a shade of this world, yet what can allow a man to travel a fortnight here, and a day there? I've heard about the size of the animals that stalk those jungles and swim in the waters, hard to believe anyone can sustain themselves there. Would you wish to see this place?",
};
export const LocalLoreButtons = ({ options, handleRegion }: { options: any, handleRegion: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <button class='dialog-buttons' style={{ background: '#000', margin: '2%' }} onClick={() => handleRegion(o)}>{o}</button>;
    });
    return <>{buttons}</>;
};

export const localWhispers: Region = { // Localized, Smaller Concerned Knowledge of Provinces
    Astralands: "Good one, those Ashtre have quite the mouth on them I hear yet never heard. Perhaps you'll be able to catch their whispers.", 
    Kingdom: "The King, Mathyus Caderyn II, has been away from his court as of late, his son Dorien sitting the throne--though constant feathers aid his communication when abroad. Despite its unification, groans have increased with disparate and slow recovery from the century long war only having quelled for 7 years prior, with select places receiving abundance of aid over others, the discernment itself seeming weighed in favor of longstanding allies. As the King reaches further East to establish peaceable connections with the Soverains, it leads one to speculate on the disposition of those houses already under his kingship.", 
    Soverains: "The Soverain-Eulex, Garrick Myelle, is throwing a week's long feast for the coming manhood of his son, Relien Myelle. It is his last surviving son, others perishing in the Kingdom-Soverain War, and his daughter being wed off to the Kingdom as part of a truce. It has been wondered whether the boy can live up to the immense fortune and luck of his father, who started not long ago as a would-be trader lord, slowly building roads and connectivitiy throughout the Soverains during the war, a wild boon during the war economically--its enhancement of intra-provincial aid notwithstanding.", 
    Fangs: "Word has spread that the growing settlement and peaceable futures of provinces has caused the chaotic stability of mercenary life in the Fangs to decouple from the consistent pattern of war occurring throughout the land for centuries. Some have been accepting work which brings them far and away from their homelands, by whom and for what purpose remains to be recorded. The Fang Lords themselves have outstretched their lands to incorporate better agriculture, with some of the more inland mercenaries providing a challenge as they wish to graze the land as any animal would. What do you believe?", 
    Licivitas: "The Ascean, General Peroumes, is avoiding the prospect of coming back to Lor without cause of the authority of both the First Lorian and the Dae it seems. Much criticism of his prolonged campaign among the optimate fall to whipsers on the shoulders of the adoring populare, tales of his commentaries reaching further than the Good Lorian's word, its been said. The Cragorean, enemies in the current war against Licivitas, despite their fewer numbers and armament, have proved ruthless in their willingness to defy Licivitan conquest. What do you make of that growing sentiment?", 
    Firelands: "The Ghosthawk of Greyrock, Theogeni Spiras, has not been seen as of late--his wife's health has been failing worse. He has been leaning on his administration housed with devoted, a strong change from the previous Protectorate, the Ashfyres and their adherence to Fyer, tradition that has persisted since written word. Peculiar, the man, once wildly famed from his crowning at the Ascea in 130, to overthrowing the longstanding Fyerslord, Laveous Ashfyre. The last vestige of their lineage, Searous Ashfyre, has been left in a fragile position, and many are curious as to the future of the Firelands. What do you think?", 
    Sedyrus: "The Sedyren Sun, Cyrian Shyne, has reached an agreement with a lesser Quor'ator to betrothe his firstborn son to one of their daughters, hoping to stem general unrest from the cooling tempers of various families being uprooted of the Quor'eite, who lost a surprise war against their neighboring Sedyreal some decades past--the province solidifying after centuries of a Sedyrus/Quor'eia split into Sedyrus. Would you believe those that say this will leads toward a more peaceful future?", 
    Isles: "The Alluring Isles is its own world, gigantic and terrifying despite its grandeur isolated by strange tides. The land itself a shade of this world, yet what can allow a man to travel a fortnight here, and a day there? I've heard about the size of the animals that stalk those jungles and swim in the waters, hard to believe anyone can sustain themselves there. Would you wish to see this place?",
};
export const LocalWhispersButtons = ({ options, handleRegion }: { options: any, handleRegion: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <button class='dialog-buttons' style={{ background: '#000', margin: '2%' }} onClick={() => handleRegion(o)}>{o}</button>;
    });
    return <>{buttons}</>;
};


export const worldLore: Region = { // Old World Lore of each Province
    Astralands: "Good one, those Ashtre have quite the mouth on them I hear yet never heard. Perhaps you'll be able to catch their whispers.", 
    Kingdom: "The King, Mathyus Caderyn II, has been away from his court as of late, his son Dorien sitting the throne--though constant feathers aid his communication when abroad. Despite its unification, groans have increased with disparate and slow recovery from the century long war only having quelled for 7 years prior, with select places receiving abundance of aid over others, the discernment itself seeming weighed in favor of longstanding allies. As the King reaches further East to establish peaceable connections with the Soverains, it leads one to speculate on the disposition of those houses already under his kingship.", 
    Soverains: "The Soverain-Eulex, Garrick Myelle, is throwing a week's long feast for the coming manhood of his son, Relien Myelle. It is his last surviving son, others perishing in the Kingdom-Soverain War, and his daughter being wed off to the Kingdom as part of a truce. It has been wondered whether the boy can live up to the immense fortune and luck of his father, who started not long ago as a would-be trader lord, slowly building roads and connectivitiy throughout the Soverains during the war, a wild boon during the war economically--its enhancement of intra-provincial aid notwithstanding.", 
    Fangs: "Word has spread that the growing settlement and peaceable futures of provinces has caused the chaotic stability of mercenary life in the Fangs to decouple from the consistent pattern of war occurring throughout the land for centuries. Some have been accepting work which brings them far and away from their homelands, by whom and for what purpose remains to be recorded. The Fang Lords themselves have outstretched their lands to incorporate better agriculture, with some of the more inland mercenaries providing a challenge as they wish to graze the land as any animal would. What do you believe?", 
    Licivitas: "The Ascean, General Peroumes, is avoiding the prospect of coming back to Lor without cause of the authority of both the First Lorian and the Dae it seems. Much criticism of his prolonged campaign among the optimate fall to whipsers on the shoulders of the adoring populare, tales of his commentaries reaching further than the Good Lorian's word, its been said. The Cragorean, enemies in the current war against Licivitas, despite their fewer numbers and armament, have proved ruthless in their willingness to defy Licivitan conquest. What do you make of that growing sentiment?", 
    Firelands: "The Ghosthawk of Greyrock, Theogeni Spiras, has not been seen as of late--his wife's health has been failing worse. He has been leaning on his administration housed with devoted, a strong change from the previous Protectorate, the Ashfyres and their adherence to Fyer, tradition that has persisted since written word. Peculiar, the man, once wildly famed from his crowning at the Ascea in 130, to overthrowing the longstanding Fyerslord, Laveous Ashfyre. The last vestige of their lineage, Searous Ashfyre, has been left in a fragile position, and many are curious as to the future of the Firelands. What do you think?", 
    Sedyrus: "The Sedyren Sun, Cyrian Shyne, has reached an agreement with a lesser Quor'ator to betrothe his firstborn son to one of their daughters, hoping to stem general unrest from the cooling tempers of various families being uprooted of the Quor'eite, who lost a surprise war against their neighboring Sedyreal some decades past--the province solidifying after centuries of a Sedyrus/Quor'eia split into Sedyrus. Would you believe those that say this will leads toward a more peaceful future?", 
    Isles: "The Alluring Isles is its own world, gigantic and terrifying despite its grandeur isolated by strange tides. The land itself a shade of this world, yet what can allow a man to travel a fortnight here, and a day there? I've heard about the size of the animals that stalk those jungles and swim in the waters, hard to believe anyone can sustain themselves there. Would you wish to see this place?",
};
export const WorldLoreButtons = ({ options, handleRegion }: { options: any, handleRegion: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <button class='dialog-buttons' style={{ background: '#000', margin: '2%' }} onClick={() => handleRegion(o)}>{o}</button>;
    });
    return <>{buttons}</>;
};

export const provincialInformation: Region = { // Current Provincial Knowledge
    Astralands: "Good one, those Ashtre have quite the mouth on them I hear yet never heard. Perhaps you'll be able to catch their whispers.", 
    Kingdom: "The King, Mathyus Caderyn II, has been away from his court as of late, his son Dorien sitting the throne--though constant feathers aid his communication when abroad. Despite its unification, groans have increased with disparate and slow recovery from the century long war only having quelled for 7 years prior, with select places receiving abundance of aid over others, the discernment itself seeming weighed in favor of longstanding allies. As the King reaches further East to establish peaceable connections with the Soverains, it leads one to speculate on the disposition of those houses already under his kingship.", 
    Soverains: "The Soverain-Eulex, Garrick Myelle, is throwing a week's long feast for the coming manhood of his son, Relien Myelle. It is his last surviving son, others perishing in the Kingdom-Soverain War, and his daughter being wed off to the Kingdom as part of a truce. It has been wondered whether the boy can live up to the immense fortune and luck of his father, who started not long ago as a would-be trader lord, slowly building roads and connectivitiy throughout the Soverains during the war, a wild boon during the war economically--its enhancement of intra-provincial aid notwithstanding.", 
    Fangs: "Word has spread that the growing settlement and peaceable futures of provinces has caused the chaotic stability of mercenary life in the Fangs to decouple from the consistent pattern of war occurring throughout the land for centuries. Some have been accepting work which brings them far and away from their homelands, by whom and for what purpose remains to be recorded. The Fang Lords themselves have outstretched their lands to incorporate better agriculture, with some of the more inland mercenaries providing a challenge as they wish to graze the land as any animal would. What do you believe?", 
    Licivitas: "The Ascean, General Peroumes, is avoiding the prospect of coming back to Lor without cause of the authority of both the First Lorian and the Dae it seems. Much criticism of his prolonged campaign among the optimate fall to whipsers on the shoulders of the adoring populare, tales of his commentaries reaching further than the Good Lorian's word, its been said. The Cragorean, enemies in the current war against Licivitas, despite their fewer numbers and armament, have proved ruthless in their willingness to defy Licivitan conquest. What do you make of that growing sentiment?", 
    Firelands: "The Ghosthawk of Greyrock, Theogeni Spiras, has not been seen as of late--his wife's health has been failing worse. He has been leaning on his administration housed with devoted, a strong change from the previous Protectorate, the Ashfyres and their adherence to Fyer, tradition that has persisted since written word. Peculiar, the man, once wildly famed from his crowning at the Ascea in 130, to overthrowing the longstanding Fyerslord, Laveous Ashfyre. The last vestige of their lineage, Searous Ashfyre, has been left in a fragile position, and many are curious as to the future of the Firelands. What do you think?", 
    Sedyrus: "The Sedyren Sun, Cyrian Shyne, has reached an agreement with a lesser Quor'ator to betrothe his firstborn son to one of their daughters, hoping to stem general unrest from the cooling tempers of various families being uprooted of the Quor'eite, who lost a surprise war against their neighboring Sedyreal some decades past--the province solidifying after centuries of a Sedyrus/Quor'eia split into Sedyrus. Would you believe those that say this will leads toward a more peaceful future?", 
    Isles: "The Alluring Isles is its own world, gigantic and terrifying despite its grandeur isolated by strange tides. The land itself a shade of this world, yet what can allow a man to travel a fortnight here, and a day there? I've heard about the size of the animals that stalk those jungles and swim in the waters, hard to believe anyone can sustain themselves there. Would you wish to see this place?",
};
export const ProvincialWhispersButtons = ({ options, handleRegion }: { options: any, handleRegion: any }) => {
    const buttons = Object.keys(options).map((o: any) => {
        return <button class='dialog-buttons' style={{ background: '#000', margin: '2%' }} onClick={() => handleRegion(o)}>{o}</button>;
    });
    return <>{buttons}</>;
};