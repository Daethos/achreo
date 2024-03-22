import { Accessor, Setter, createEffect, createSignal } from 'solid-js';
import { asceanCompiler } from '../utility/ascean';
import { useResizeListener } from '../utility/dimensions';
import { Attributes } from '../utility/attributes';
import { CombatAttributes } from '../utility/combat';
import Ascean from '../models/ascean';

export default function AttributeModal({ attribute }: { attribute: any }) {
    const dimensions = useResizeListener();
    return (
        <div class="border superCenter" style={dimensions()?.ORIENTATION === 'landscape' ? 
        { width: '50%' } : 
        { width: '70%' }}>
            <div class="creature-heading border p-5">
                <h1 class="gold">{attribute.name.charAt(0).toUpperCase() + attribute.name.slice(1)}</h1>
                <br />
                <div>
                    <h2>{attribute.title}</h2>
                </div>
                <br />
                <h2 class="center">{attribute.description}</h2>
                <br />
                <p class="gold wrap" style={{ 'font-size': '1em' }}>{attribute.gameplay}</p>
            </div>
        </div>            
    );
};

export function AttributeCompiler({ ascean, setAttribute, show, setShow }: { ascean: Accessor<Ascean>, setAttribute: Setter<any>, show: Accessor<boolean>, setShow: Setter<boolean> }) {
    const [abilities, setAbilities] = createSignal<CombatAttributes | undefined>(undefined);
    const dimensions = useResizeListener();
    function toggle(attr: string) {
        setAttribute(Attributes.find(a => a.name === attr));
        setShow(!show());
    };
    function compiler() {
        try {
            const res = asceanCompiler(ascean());
            setAbilities(res?.attributes);
        } catch (err) {
            console.error(err);
        };
    };
    createEffect(() => {
        compiler();    
    });

    return (
        <div class='my-2' style={{ width: '100%', display: 'inline-flex' }}>
            <div style={{ width: dimensions().ORIENTATION === 'landscape' ? `28%` : `40%`, display: 'inline-block' }}>
                <button class='' onClick={() => toggle('constitution')} style={{ 'font-size': '1em' }}>Con</button>
                <p class='gold' style={{ 'font-size': '1em' }}>{abilities()?.totalConstitution}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawConstitution} + {abilities()?.equipConstitution})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={{ width: dimensions().ORIENTATION === 'landscape' ? `28%` : `40%`, display: 'inline-block' }}>
                <button class='' onClick={() => toggle('strength')} style={{ 'font-size': '1em' }}>Str</button>
                <p class='gold' style={{ 'font-size': '1em' }}>{abilities()?.totalStrength}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawStrength} + {abilities()?.equipStrength})</div> */}
            </div>
            <div>{'\n'}</div>

            <div style={{ width: dimensions().ORIENTATION === 'landscape' ? `28%` : `40%`, display: 'inline-block' }}>
                <button class='' onClick={() => toggle('agility')} style={{ 'font-size': '1em' }}>Agi</button>
                <p class='gold' style={{ 'font-size': '1em' }}> {abilities()?.totalAgility}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawAgility} + {abilities()?.equipAgility})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={{ width: dimensions().ORIENTATION === 'landscape' ? `28%` : `40%`, display: 'inline-block' }}>
                <button class='' onClick={() => toggle('achre')} style={{ 'font-size': '1em' }}>Ach</button>
                <p class='gold' style={{ 'font-size': '1em' }}>{abilities()?.totalAchre}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawAchre} + {abilities()?.equipAchre})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={{ width: dimensions().ORIENTATION === 'landscape' ? `28%` : `40%`, display: 'inline-block' }}>
                <button class='' onClick={() => toggle('caeren')} style={{ 'font-size': '1em' }}>Caer</button>
                <p class='gold' style={{ 'font-size': '1em' }}>{abilities()?.totalCaeren}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawCaeren} + {abilities()?.equipCaeren})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={{ width: dimensions().ORIENTATION === 'landscape' ? `28%` : `40%`, display: 'inline-block' }}>
                <button class='' onClick={() => toggle('kyosir')} style={{ 'font-size': '1em' }}>Kyo</button>
                <p class='gold' style={{ 'font-size': '1em' }}>{abilities()?.totalKyosir}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawKyosir} + {abilities()?.equipKyosir})</div> */}
            </div>
        </div>
    );
};