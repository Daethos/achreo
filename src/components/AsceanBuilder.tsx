import { createSignal, Show, Switch, Match, Accessor, Setter, lazy, Suspense } from "solid-js";
import { useResizeListener } from "../utility/dimensions";
import { Menu, SCREENS } from "../utility/screens";
import { CharacterSheet } from "../utility/ascean";
import { Puff } from 'solid-spinner';
const Character = lazy(async () => await import("./Character"));
const Sex = lazy(async () => await import('./Sex'));
const Origin = lazy(async () => await import("./Origin"));
const Faith = lazy(async () => await import("./Faith"));
const Mastery = lazy(async () => await import('./Mastery'));
const Preference = lazy(async () => await import('./Preference'));
const AttributesCreate = lazy(async () => await import("./AttributesCreate"));
const Review = lazy(async () => await import("./Review"));
const Preview = lazy(async () => await import("./Preview"));

export default function AsceanBuilder({ newAscean, setNewAscean, menu }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet>, menu: Accessor<Menu> }) {
    const [prevMastery, setPrevMastery] = createSignal('');
    const dimensions = useResizeListener();
    return <div class='stat-block superCenter' style={{ overflow: 'scroll', 'scrollbar-width': 'none' }}>
        <Show when={menu().screen !== SCREENS.COMPLETE.KEY && dimensions().ORIENTATION !== 'landscape'}>
            <Preview newAscean={newAscean} />
        </Show>
        {/* <<---------- PORTRAIT ---------->> */}
        <Show when={dimensions()?.ORIENTATION === 'landscape'} fallback={ 
            <Switch>
                <Match when={menu().screen === SCREENS.CHARACTER.KEY}>
                    <div class='border superCenter center' style={{ height: '70%', width: '85%', 'margin-top': '10%' }}>
                        <div class='superCenter' style={{ width: '90%' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Character newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                        <br /><br />
                        <Suspense fallback={<Puff color="gold" />}>
                            <Sex newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                        </div>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.ORIGIN.KEY}>
                    <div class='border superCenter center' style={{ height: '70%', width: '85%', 'margin-top': '10%' }}>
                        <div class='superCenter' style={{ width: '90%' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Origin newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                        <br /><br />
                        <Suspense fallback={<Puff color="gold" />}>
                            <Faith newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                        </div>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.PREFERENCE.KEY}>
                    <div class='border superCenter center' style={{ height: '70%', width: '85%', 'margin-top': '10%' }}>
                    <div class='superCenter' style={{ width: '90%' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Mastery newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    <br /><br />
                        <Suspense fallback={<Puff color="gold" />}>
                            <Preference newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    </div>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.ATTRIBUTES.KEY}>
                    <div class='border superCenter center' style={{ height: '70%', width: '85%', 'margin-top': '10%' }}>
                        <div class='superCenter' style={{ width: '90%'}}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <AttributesCreate newAscean={newAscean} setNewAscean={setNewAscean} prevMastery={prevMastery} setPrevMastery={setPrevMastery} />
                        </Suspense>
                        </div>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.COMPLETE.KEY}>
                    <div class='border superCenter center' style={{ height: '80%', width: '85%', 'margin-top': '0%' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Review newAscean={newAscean} />
                        </Suspense>
                    </div>
                </Match>
            </Switch>
        }> 
        {/* <<---------- LANDSCAPE ---------->> */}
            <Switch>
                <Match when={menu().screen === SCREENS.CHARACTER.KEY}>
                    <div class='drop-25 left' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Character newAscean={newAscean} setNewAscean={setNewAscean} /> 
                            <Sex newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    </div>
                    <div class='drop-25 right' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Origin newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                        <br />
                        <br />
                        <Suspense fallback={<Puff color="gold" />}>
                            <Faith newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.ATTRIBUTES.KEY}>
                    <div class='drop-25 left' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Mastery newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Preference newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    </div>
                    <div class='drop-25 right' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <AttributesCreate newAscean={newAscean} setNewAscean={setNewAscean} prevMastery={prevMastery} setPrevMastery={setPrevMastery} />    
                        </Suspense>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.COMPLETE.KEY}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Review newAscean={newAscean} />
                        </Suspense>
                </Match>
            </Switch> 
        </Show>
    </div>;
};