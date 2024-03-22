import { Accessor, createSignal, For, Setter, Show } from 'solid-js';
import { useResizeListener } from '../utility/dimensions';
import { CharacterSheet } from '../utility/ascean';

const ORIGINS = [{
    name: "Ashtre",
    bio: `A hard people from an inhospitable land to the East in the Astralands, many are ashen from tempest weather. Martial and religious--monotheistic in nature to Astra, the Lightning Ancient, 
        their governance forms of their leaders in a tetrarchy shored by commerce and law. Laconic and mistrusting, few outsiders get to know these folk, 
        drawing further tension from being the only civilization not to collapse during the Shattering in the War of the Ancients a millenia prior.`,
    index: 'ashtre',
    bonus: '+2 STR, +2 AGI, +3% Crit, +3% Crit Dam, +3% Phys Dam',
    imgUrl: '../assets/images/Ashtre-Man.jpg'
},{
    name: "Fyers",
    bio: `"Fair folk from the Firelands, these people enjoy mild weather and bountiful harvest, leaving themselves to leisure time in pursuit of broad body and mind, often advancing both fields in competition and technology. 
        Unsure of their origin, it is said they became a fusion of the Noth whom migrated south during the Sundering, mixing with Westothi battle clans, and moving further South, claiming the rich, fertile lands from the Quor'eite and Sedyreal.`,
    bioTwo: `The Fyers Lord Protectorate Theogeni Spiras, the Ghost Hawk of Greyrock, came to govern the land, siezing power after civil warring against House Ashfyre whose lineage held the title for centuries. 
        To note, also a former Ascean in 130 AE. Fyer is the Ancient heralded in the land and has been worshiped for centuries, influencing the people's culture and language, though not the only Ancient worshiped, 
        with known allied Ancients in Ilios, Kyrisos, and Nyrolus were well celebrated. As of late, Daethic worship has seen its rise in the land, with Lord Spiras himself cozying to the Seyr, though his personal beliefs are unknown.`,
    index: 'fyers',
    bonus: '+2 ACH, +2 KYO, +3% Mag Pen, +3% Phys Pen, +3% Roll',
    imgUrl: '../assets/images/Fyers-Woman.jpg'
}, {
    name: "Li'ivi",
    bio: `In the centralands of Licivitas live a keen and practical people whose ambition and drive has helped economically enhance and ensnare the other cultures. Whether bartering or brokering, peacemaking or warring, a Li'ivi excels. 
        The One Above, Daethos, is founded and worshiped at the Seyr in its oldest city, Lor, and while not a theocracy, heavily leans on its teachings for guidance. Its governance is currently run by a loose-affiliate of city-states.`,
    bioTwo: `Highest general Evrio Lorian Peroumes, current va'Esai, is waging a 10 years long war in the Northren border against the monstrous Cragore. Tension has risen over the years as only letters have been sent to Lor from General Peroumes, 
        and the Noble Lorians have grown weary of the war's effect on the popularity of General Peroumes, whose had official leave to maintain the war after winning the Ascea, 
        first boosting his popularity as being the first Li'ivi to be crowed the va'Esai this century.`,
    index: "li'ivi",
    bonus: '+1 STR, +1 AGI, +1 ACH, +1 CAER, +1 KYO, +1% Crit, +1% Crit Dam, +1% Roll, +1% Phys Dam, +1% Mag Dam, +1% Mag Pen, +1% Phys Pen',
    imgUrl: "../assets/images/Li'ivi-Woman.jpg"
}, {
    name: "Notheo",
    bio: `Northren folk inhabiting the west, as it stands the Daethic Kingdom (formerly Achreon). Cold and imposing, they reflect their lands, coming from a history of druidic clans, semi-nomadic, 
        clashing with advent of agriculture some brethren took for security and stability.`,
    bioTwo: `Only kingdom in the land with blessing of the Seyr, Mathyus Caderyn II has reigned for almost 25 years, a former Ascean in 120 AE. 
        Recent warring against their brethren to the east in the Soverains has ceased since the last Ascea in 140 AE, culminating in the marriage of his son and the daughter of a Soverains, now Princess Jadei Myelle. 
        The son, Prince Dorien Caderyn and heir to the throne--Mathyus II's firstborn son having perished in the war--is effectively an ambassador and mouth of the King, 
        routinely traveling the various provinces to handle sensitive work on behalf of his father. King Caderyn himself tends his court in the Fox Hollow, rebuilt after the war, its destruction occurring during 'Fires of Fox Hollow' in 133 AE. 
        If not at home, the King travels around the kingdom, lending aid to the peoples affected by war.`,
    index: "noth'eo",
    bonus: '+2 CON, +2 ACH, +3% Phys Dam, +3% Phys Pen, +3% Mag Def',
    imgUrl: '../assets/images/Notheo-Man.jpg'
}, {
    name: "Nothos",
    bio: `The Soverain people of the nothren'eas have kept to their own culturally and spiritually, passionately rejecting advances of the Daethic word with blood and bile. As the name states, 
        this tentative collection of Soverains form a coalition in name only, having banded together to stop encroachment of King Caderyn after having seen many short-sighted 'lords' succumbing to the Arctic Fox--
        as the King came to be known for successfully sieging a tundra stronghold inside a single winter. Soverains range in their power and influence, each distinguishing themselves in forms of competence whether through agriculture, 
        commerce, or warfare in all their forms.`,
    bioTwo: `Soverian Garrick Myelle yielded greatest fruit in the treaty among the Soverain men, his daughter Jadei wedded to the Prince, Dorien Caderyn. 
        The arrangement of his daughter a choice only known to the Soverains themselves, with a secret vote cast to determine whose daughter were chosen.`,
    index: "noth'os",
    bonus: '+2 CON, +2 CAER, +3% Mag Dam, +3% Mag Pen, +3% Phys Def',
    imgUrl: '../assets/images/Nothos-Woman.jpg'
}, {
    name: "Quor'eite",
    bio: `"Relaxed folk of the southernmost tip of the land, they owed much of their pleasure in life to the hospitable regions affording luxurious living and supply, thus Quor'ei, the Ancient of Earth, garnerning the most appreciation. 
        This became disrupted during the invasion of the Sedyreal post-Sedyren War against Licivitas, culminating in the loss of life for many Quor'eite, many losing faith and seeking the word of Daethos as a means to calm their spirit. 
        From the war, many of the 'Quor'ator's as their lords are to be called, have been displaced from settling Sedyreal and have sought refuge in the harsher lands of Sedyrus as the whole province came to be called, others in the never settled, 
        sparse jungles; the entire land pocketed with dense hazards being an effective natural barrier for sometime between the peoples and their cultures changing worldviews.`,
    bioTwo: `Quor'ator Mauricio Capulo has recently come upon a windfall atop mountainous jungle ranges, a new crop becoming a local favorite and extending East toward the Alluring Isles. This is thought to be the genesis for the Sedyren Sun, 
        Cyrian Shyne, betrothing his firstborn son to Capulo's third daughter, the first two already having wed to lower caste families.`,
    index: "quor'eite",
    bonus: '+2 AGI, +2 KYO, +3% Crit, +3% Roll, +10% Stamina',
    imgUrl: "../assets/images/Quor'eite-Man.jpg"
}, {
    name: "Sedyreal",
    bio: `Southron people living in the further temperate and wild jungles that await someone adventurous enough to travel south of Licivitas by land, it lies home to a festive people whom celebrate the triumph of life, 
        and curb the penchant to show this excitement with love of warfare. Having lost territory to the elements and the Li'ivi in the hard fought double-sided loss in the Sedyrus Mountains, 
        they've moved further south and took their frustrations out on the neighboring Quor'eite, taking over and displacing the peoples to claim full territories. The province of Sedyrus and Quor'eia now entirely merged into Sedyrus, 
        with some Sedyren taking rich lands of the Quor'ators who passed, others whom has enviable locales.`,
    bioTwo: `The Sedyren Sun, Cyrian Shyne has taken to a life of travel and exploration, 
        having two homes with a new mountainous jungle range in the central lands of Sedyrus after the old fortress in the Sedyrus mountains were extinguished and melted from the eruption, killing many from Licivitas and Sedyrus alike. 
        It is a wonder that the Sedyreal were still so capable, after having sustained such losses, to invade and capture a sizable portion of land and conquer a neighboring people.`,
    index: 'sedyreal',
    bonus: '+2 STR, +2 CAER, +3% Mag Def, +3% Phys Def, +3% Crit Dam',
    imgUrl: '../assets/images/Sedyreal-Man.jpg'
}];

const OriginsCard = ({ origin, newAscean, setNewAscean }: { origin: any; newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet> }) =>{  
    const [show, setShow] = createSignal(false);
    const handleShow = () => setShow(!show());
    const handleOrigin = () => {
        setNewAscean({ ...newAscean(), origin: origin.name });
        setShow(!show());
    }; 
    const dimensions = useResizeListener();
// position: 'absolute', maxHeight: '80%', width: '80%', left: '10%', top: '10%', oveflow: 'scroll'
    return (
        <Show when={show()} fallback={<button onClick={handleOrigin} class="highlight" style={{ color: origin.name === newAscean()?.origin ? 'gold' : '#fdf6d8' }}>{origin.name}</button>}>
            <div class='modal' onClick={handleShow}>
            <div class="border verticalCenter" style={{ 'align-items': 'center', 'justify-content': 'center', 'text-align': 'center',
                width: dimensions().ORIENTATION === 'landscape' ? '85%' : '', left: dimensions().ORIENTATION === 'landscape' ? '7.5%' : '', position: 'absolute'
            }}>
                <div class="border creature-heading" style={{ 'text-align': 'center', height: '100%' }}><br />
                    {/* <img src={origin.imgUrl} alt={origin.name} id="origin-pic" style={{ width: dimensions().ORIENTATION === 'landscape' ? '15%' : '' }} /> */}
                    <h2 class='m-3 super' style={{ 'text-align': 'center' }}>
                        {origin.bio}<br /><br />{origin.bioTwo}
                    </h2>
                    <p class="gold small mb-3 mx-3">Bonuses: {origin.bonus}</p>
                </div>
            </div>
            </div>
        </Show>
    );
};

export default function Origin({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet> }) { 
    return (
        <div class='center creature-heading'>
            <h1 class='gold'>Origins</h1> 
            <div>
                <For each={ORIGINS}> 
                    {((origin) => (
                        <OriginsCard origin={origin} newAscean={newAscean} setNewAscean={setNewAscean} />
                    ))} 
                </For>
            </div>
        </div>
    );
};