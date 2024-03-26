import { createSignal, Show, Switch, Match, Accessor, Setter } from "solid-js";
import Character from "./Character";
import Sex from './Sex';
import Origin from "./Origin";
import Faith from "./Faith";
import Mastery from './Mastery';
import Preference from './Preference';
import AttributesCreate from "./AttributesCreate";
import Review from "./Review";
import { Preview } from "./Preview";
import { useResizeListener } from "../utility/dimensions";
import { Menu, SCREENS } from "../utility/screens";
import { CharacterSheet } from "../utility/ascean";

export default function AsceanBuilder({ newAscean, setNewAscean, menu }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet>, menu: Accessor<Menu> }) {
    const [prevMastery, setPrevMastery] = createSignal('');
    const dimensions = useResizeListener();

    return (
        <div class='stat-block superCenter' style={{ overflow: 'scroll' }}>
        <Show when={menu().screen !== SCREENS.COMPLETE.KEY && dimensions().ORIENTATION !== 'landscape'}>
            <Preview newAscean={newAscean} />
        </Show>
            {/* <p class='border'>
                The Ascean is a game of skill and strategy, with a focus on real-time combat. You will be able to choose from a variety of weapons, armor, and skills to create a character that suits your playstyle.
            </p> */}
            {/* <<---------- PORTRAIT ---------->> */}
            <Show when={dimensions()?.ORIENTATION === 'landscape'} fallback={ 
                <Switch>
                    <Match when={menu().screen === SCREENS.CHARACTER.KEY}>
                        <Character newAscean={newAscean} setNewAscean={setNewAscean} />
                        <Sex newAscean={newAscean} setNewAscean={setNewAscean} />
                    </Match>
                    <Match when={menu().screen === SCREENS.ORIGIN.KEY}>
                        <Origin newAscean={newAscean} setNewAscean={setNewAscean} />
                        <br /><br />
                        <Faith newAscean={newAscean} setNewAscean={setNewAscean} />
                    </Match>
                    <Match when={menu().screen === SCREENS.PREFERENCE.KEY}>
                        <Mastery newAscean={newAscean} setNewAscean={setNewAscean} />
                        <br /><br />
                        <Preference newAscean={newAscean} setNewAscean={setNewAscean} />
                    </Match>
                    <Match when={menu().screen === SCREENS.ATTRIBUTES.KEY}>
                        <AttributesCreate newAscean={newAscean} setNewAscean={setNewAscean} prevMastery={prevMastery} setPrevMastery={setPrevMastery} />
                    </Match>
                    <Match when={menu().screen === SCREENS.COMPLETE.KEY}>
                        <Review newAscean={newAscean} />
                    </Match>
                </Switch>
            }> 
            {/* <<---------- LANDSCAPE ---------->> */}
                <Switch>
                    <Match when={menu().screen === SCREENS.CHARACTER.KEY}>
                        <div class='drop-25 left' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                            <Character newAscean={newAscean} setNewAscean={setNewAscean} /> 
                            <Sex newAscean={newAscean} setNewAscean={setNewAscean} />
                        </div>
                        <div class='drop-25 right' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                            <Origin newAscean={newAscean} setNewAscean={setNewAscean} />
                            <br />
                            <br />
                            <Faith newAscean={newAscean} setNewAscean={setNewAscean} />
                        </div>
                    </Match>
                    <Match when={menu().screen === SCREENS.ATTRIBUTES.KEY}>
                        <div class='drop-25 left' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                            <Mastery newAscean={newAscean} setNewAscean={setNewAscean} />
                            <Preference newAscean={newAscean} setNewAscean={setNewAscean} />
                        </div>
                        <div class='drop-25 right' style={{ height: '82.5%', width: '48%', display: 'inline-block' }}>
                            <AttributesCreate newAscean={newAscean} setNewAscean={setNewAscean} prevMastery={prevMastery} setPrevMastery={setPrevMastery} />    
                        </div>
                    </Match>
                    <Match when={menu().screen === SCREENS.COMPLETE.KEY}>
                        <Review newAscean={newAscean} />
                    </Match>
                </Switch> 
            </Show>
        </div>
    );
};