import { Accessor, Setter, createEffect, createSignal } from 'solid-js';
import { asceanCompiler } from '../utility/ascean';
import { useResizeListener } from '../utility/dimensions';
import { Attributes } from '../utility/attributes';
import { CombatAttributes } from '../utility/combat';
import Ascean from '../models/ascean';

const font = {
    'font-size': '1em',
    margin: '0'
};

export default function AttributeModal({ attribute }: { attribute: any }) {
    const dimensions = useResizeListener();
    return (
        <div class="border superCenter" style={dimensions()?.ORIENTATION === 'landscape' ? { width: '50%', padding: '1%' } : { width: '75%' }}>
        <div class="creature-heading border center" style={{ 'text-wrap': 'balance' }}>
            <h1>{attribute.name.charAt(0).toUpperCase() + attribute.name.slice(1)}</h1>
            <br />
            <svg height="5" width="100%" class="tapered-rule mt-2">
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div>
                <h2 style={{ color: 'gold' }}>{attribute.title}</h2>
            </div>
            <h2 class="center">{attribute.description}</h2>
            <br />
            <p class="gold" style={font}>{attribute.gameplay}</p>
            <br />
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
    const inline = {
        width: dimensions().ORIENTATION === 'landscape' ? `28%` : `40%`,
        display: 'inline-block',
    };
    return (
        <div style={{ width: '100%', display: 'inline-flex' }}>
            <div style={inline}>
                <button class='buttonBorderless' onClick={() => toggle('constitution')} style={font}>Con</button>
                <p class='gold' style={font}>{abilities()?.totalConstitution}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawConstitution} + {abilities()?.equipConstitution})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={inline}>
                <button class='buttonBorderless' onClick={() => toggle('strength')} style={font}>Str</button>
                <p class='gold' style={font}>{abilities()?.totalStrength}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawStrength} + {abilities()?.equipStrength})</div> */}
            </div>
            <div>{'\n'}</div>

            <div style={inline}>
                <button class='buttonBorderless' onClick={() => toggle('agility')} style={font}>Agi</button>
                <p class='gold' style={font}> {abilities()?.totalAgility}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawAgility} + {abilities()?.equipAgility})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={inline}>
                <button class='buttonBorderless' onClick={() => toggle('achre')} style={font}>Ach</button>
                <p class='gold' style={font}>{abilities()?.totalAchre}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawAchre} + {abilities()?.equipAchre})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={inline}>
                <button class='buttonBorderless' onClick={() => toggle('caeren')} style={font}>Caer</button>
                <p class='gold' style={font}>{abilities()?.totalCaeren}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawCaeren} + {abilities()?.equipCaeren})</div> */}
            </div>
            <div>{'\n'}</div>
            <div style={inline}>
                <button class='buttonBorderless' onClick={() => toggle('kyosir')} style={font}>Kyo</button>
                <p class='gold' style={font}>{abilities()?.totalKyosir}</p>
                {/* <div style={styles.abilitiesP]}>({abilities()?.rawKyosir} + {abilities()?.equipKyosir})</div> */}
            </div>
        </div>
    );
};