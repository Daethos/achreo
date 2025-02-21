import { createSignal, Show, For, Accessor, Setter } from "solid-js";
import { useResizeListener } from "../utility/dimensions";
import { CharacterSheet } from "../utility/ascean";

export const FAITHS = [{
    name: 'Ancients',
    origin: "The Ancients were figures of fantastic might existing before historical recording of time, commanding worshipers of all peoples of this world. These godlike beings interacted with humans at their leisure, whether distantly ala Achreo of the Wild, or heavily involved in the daily lives of their worshipersers, such as Ilios of the Sun, and Ma'anre of the Moon. \n\n Some time a thousand years past, a great war between the Ancients--heavily involving humans, broke out and wiped out the majority of both. It's unknown at this time who remains, and in what form they may be existing.",
    quote: "A tendril swirls soothing about your senses, \n It's sweetness teasing as hush soon possesses.",
    worshipers: 'Adherent',
    character: 'Adherence holds fyers to true form, and may invoke this comfort.',
    iconography: '../assets/images/achreo-rising.jpg'
}, {
    name: 'Daethos',
    origin: "Founded by mythic general, Laetrois Ath'Shaorah, chosen during the War of the Ancients. Of unknown origin, Laetrois and his soliders are believed to have descended from obscure lands in the nothren'eas; seen as a force entering in the later stages of the war against both armies led by Ilios and Ma'anre, respectively. \n\n Saving humanity, the death of the general during the aftermath of the war led to his faithful companion, the Good Lorian, to establish the Seyr in the City of Lor, later codifying the oratory nature of its principles and providence into the Daethica, or, the 'Good Books.'",
    quote: "Writhing, it warps to wrap round you, seething, \n Forms of shade simmer to dance upon your being",
    worshipers: 'Devoted',
    character: "To be Daethic is to become Atshaer Ascean, the Shaorahi, Laetrois Ath'Shaorah.",
    iconography: '../assets/images/daethos-forming.jpg'
}, {
    name: 'None',
    origin: 'You have no faith and seek other means to hold yourself together.',
    quote: "And yet perchance you seek to twist adherence in its seams, \n To taste its achre burning at the resin of your dreams.",
    worshipers: 'None',
    character: 'Although this does not absolve you of othernatural machinations, your aim elsewhere may lead toward a wholly new glory.',
    iconography: '../assets/images/godHand.png'
}]; 

export const FaithModal = ({ faith }: { faith: string }) => {
    const dimensions = useResizeListener();
    const religion = FAITHS.find((f) => f.worshipers === faith);
    return <div class="border verticalCenter" style={dimensions()?.ORIENTATION === 'landscape' ? { position: 'absolute', left: '15%', width: '70%' } : { }}>
        <div class="creature-heading border" style={{ 'text-wrap': 'balance' }}> 
            <img src={religion?.iconography} alt={religion?.name} id="origin-pic" style={{ width: dimensions().ORIENTATION === 'landscape' ? '15%' : '', 'margin-top': '3%' }} />
            <p class='gold small wrap' style={{ margin: '3%' }}>{religion?.origin}</p>
            <h2 class='gold wrap' style={{ margin: '3%' }}>{religion?.character}</h2>
        </div>
    </div>;
};
 
const FaithCard = ({ faith, newAscean, setNewAscean }: { faith: any; newAscean: Accessor<CharacterSheet>; setNewAscean: Setter<CharacterSheet>; }) => {
    const [show, setShow] = createSignal(false);
    const dimensions = useResizeListener();
    const handleShow = () => setShow(!show()); 
    const handleFaith = () => {
        setNewAscean({ ...newAscean(), faith: faith.worshipers });
        setShow(!show());
    };
    return <Show when={show()} fallback={<button onClick={handleFaith} class='highlight' style={{ color: faith.worshipers === newAscean().faith ? 'gold' : '#fdf6d8' }}>{faith.name}</button>}>
        <div class='modal' onClick={handleShow}>
        <div class="border verticalCenter" style={dimensions()?.ORIENTATION === 'landscape' ?{ position: 'absolute', left: '15%', width: '70%' } : { }}>
        <div class="creature-heading" style={{ 'white-space': 'pre-wrap' }}> 
            <img src={faith.iconography} alt={faith.name} id="origin-pic" style={{ width: dimensions().ORIENTATION === 'landscape' ? '15%' : '', 'margin-top': '3%' }} />
            <p class='gold small' style={{ margin: '3%' }}>{faith.origin}</p>
            <h2 class='gold wrap' style={{ margin: '3%' }}>{faith.character}</h2>
        </div>
        </div>
        </div>
    </Show>;
};

export default function Faith({ newAscean, setNewAscean }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet> }) {
    return <div class='center creature-heading fadeIn' style={{ 'margin-bottom': '3%' }}>
        <h1 class='gold'>Faith</h1>
        <div>
            <For each={FAITHS}>
                {(faith) => (
                    <FaithCard faith={faith} newAscean={newAscean} setNewAscean={setNewAscean} />
                )}
            </For>
        </div> 
    </div>;
};