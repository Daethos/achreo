import { createSignal, For, Show, Switch, Match, Accessor, Setter, lazy, Suspense } from "solid-js";
import { dimensions } from "../utility/dimensions";
import { Menu, SCREENS } from "../utility/screens";
import { CharacterSheet, STARTING_CHARACTERS } from "../utility/ascean";
import { Puff } from "solid-spinner";
import { backgroundGradient, masteryColor } from "../utility/styling";
import { Attributes } from "../utility/attributes";
import AttributeModal from "./Attributes";
import { click } from "../App";
import { ArmorModal, preferenceState } from "./Preference";
import { FaithModal } from "./Faith";
import { OriginModal } from "./Origin";
const Character = lazy(async () => await import("./Character"));
const Sex = lazy(async () => await import("./Sex"));
const Origin = lazy(async () => await import("./Origin"));
const Faith = lazy(async () => await import("./Faith"));
const Mastery = lazy(async () => await import("./Mastery"));
const Preference = lazy(async () => await import("./Preference"));
const AttributesCreate = lazy(async () => await import("./AttributesCreate"));
const Review = lazy(async () => await import("./Review"));
const Preview = lazy(async () => await import("./Preview"));

export default function AsceanBuilder({ newAscean, setNewAscean, menu }: { newAscean: Accessor<CharacterSheet>, setNewAscean: Setter<CharacterSheet>, menu: Accessor<Menu> }) {
    const [prevMastery, setPrevMastery] = createSignal("");
    const [attrShow, setAttrShow] = createSignal(false);
    const [armorShow, setArmorShow] = createSignal(false);
    const [showFaith, setShowFaith] = createSignal(false);
    const [showOrigin, setShowOrigin] = createSignal(false);
    const [attribute, setAttribute] = createSignal(Attributes[0]);
    const dims = dimensions();
    const photo = { 
        "height": dims.ORIENTATION === "landscape" ? "auto" : "auto", 
        "width": dims.ORIENTATION === "landscape" ? "5vw" : "15vw", 
        "top": dims.ORIENTATION === "landscape" ? "3vh" : "0", 
        "left": dims.ORIENTATION === "landscape" ? "20vw" : "3vw",
        "border": "0.15em solid #fdf6d8", "border-radius": "50%",  };
    const font = { "font-size": "1em", margin: "0" };
    const inline = { width: dims.ORIENTATION === "landscape" ? `28%` : `40%`, display: "inline-block", "padding":"2%" };
    function toggle(attr: string) {
        setAttribute(Attributes.find(a => a.name === attr) as any);
        setAttrShow(!attrShow());
    };
    async function clickPlay(ascean: CharacterSheet) {
        setNewAscean(ascean); 
        if (!click.ended) click.pause();
        await click.play();
    };
    return <div class="stat-block superCenter" style={{ overflow: "hidden", "scrollbar-width": "none" }}>
        <Show when={menu().screen !== SCREENS.COMPLETE.KEY && dims.ORIENTATION !== "landscape"}>
            <Preview newAscean={newAscean} />
        </Show>
        {/* <<---------- PORTRAIT ---------->> */}
        <Show when={dims?.ORIENTATION === "landscape"} fallback={ 
            <Switch>
                <Match when={menu().screen === SCREENS.CHARACTER.KEY}>
                    <div class="border superCenter center" style={{ height: "70%", width: "85%", "margin-top": "10%" }}>
                        <div class="superCenter" style={{ width: "90%" }}>
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
                    <div class="border superCenter center" style={{ height: "70%", width: "85%", "margin-top": "10%" }}>
                        <div class="superCenter" style={{ width: "90%" }}>
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
                    <div class="border superCenter center" style={{ height: "70%", width: "85%", "margin-top": "10%" }}>
                    <div class="superCenter" style={{ width: "90%" }}>
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
                    <div class="border superCenter center" style={{ height: "70%", width: "85%", "margin-top": "10%" }}>
                        <div class="superCenter" style={{ width: "90%"}}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <AttributesCreate newAscean={newAscean} setNewAscean={setNewAscean} prevMastery={prevMastery} setPrevMastery={setPrevMastery} />
                        </Suspense>
                        </div>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.COMPLETE.KEY}>
                    <div class="border superCenter center" style={{ height: "80%", width: "85%", "margin-top": "0%" }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Review newAscean={newAscean} />
                        </Suspense>
                    </div>
                </Match>
            </Switch>
        }> 
        {/* <<---------- LANDSCAPE ---------->> */}
                <div class="sunburst" style={{ "--glow-color":masteryColor(newAscean().mastery) }}></div>
                <Switch>
                <Match when={menu().screen === SCREENS.PREMADE.KEY}>
                    <div class="drop-25 left" style={{ height: "60%", width: "48%", display: "inline-block", "margin-top": "4%", "overflow-y": "scroll", "scrollbar-width": "none" }}>
                        <Suspense fallback={<Puff color="gold" />}>
                        <div class="menu-3d">
                        <For each={STARTING_CHARACTERS}>
                            {(ascean, _index) => (
                                <div class="border row card juice glowJuice flickerJuiceInsert menu-item-3d backgroundFocus" onClick={() => clickPlay(ascean)} style={{ width: "70%", margin: "1em auto", "border-color": masteryColor(ascean.mastery),"--glow-color": masteryColor(ascean.mastery),"--base-shadow": "#000 0 0 0 0.2em","box-shadow": `#000 0 0 0 0.2em, ${masteryColor(ascean.mastery)} 0 0 0 0.3em`, "--background-color": backgroundGradient(ascean.mastery, false) }}>
                                    <img style={{...photo, "border-color": masteryColor(ascean.mastery)}} src={`../assets/images/${ascean.origin}-${ascean.sex}.jpg`} /><br />
                                    <h4 class={`gold`} style={{ "font-family": "Cinzel-Regular", width: "50%", "margin-left":"5%" }}>{ascean.name}</h4>
                                </div>
                            )}
                        </For>
                        </div>
                        </Suspense>
                    </div>
                    <div class="drop-25 right" style={{ height: "82.5%", width: "48%", display: "inline-block", animation: "fadein 1.5s ease" }}>
                        <Suspense fallback={<Puff color="gold" />}>
                        <div class="creature-heading center" style={{ width: "90%" }}>
                            <h1>{newAscean().name}</h1>
                            <h2>{newAscean().description}</h2>
                            <img onClick={() => setShowOrigin(!showOrigin())} src={`../assets/images/${newAscean().origin}-${newAscean().sex}.jpg`} id="origin-pic" style={{ "border": `thick groove ${masteryColor(newAscean().mastery)}` }} />
                            <p onClick={() => setArmorShow(!armorShow())} style={{margin:"2%"}}>Armor: <span class="gold">{newAscean().preference}</span></p>
                            <p style={{margin:"2%"}}>Faith: <span class="gold" onClick={() => setShowFaith(!showFaith())}>{newAscean().faith}</span> | Mastery: <span class="gold" onClick={() => toggle(newAscean().mastery)}>{newAscean().mastery.charAt(0).toUpperCase() + newAscean().mastery.slice(1)}</span></p>
                            <div style={{ display: "inline-flex", "justify-content":"center" }}>
                                <div style={inline}>
                                    <div onClick={() => toggle("constitution")} style={font}>Con</div>
                                    <p class="gold" style={font}>{newAscean()?.constitution}</p>
                                </div>
                                <div>{"\n"}</div>
                                <div style={inline}>
                                    <div onClick={() => toggle("strength")} style={font}>Str</div>
                                    <p class="gold" style={font}>{newAscean()?.strength}</p>
                                </div>
                                <div>{"\n"}</div>

                                <div style={inline}>
                                    <div onClick={() => toggle("agility")} style={font}>Agi</div>
                                    <p class="gold" style={font}> {newAscean()?.agility}</p>
                                </div>
                                <div>{"\n"}</div>
                                <div style={inline}>
                                    <div onClick={() => toggle("achre")} style={font}>Ach</div>
                                    <p class="gold" style={font}>{newAscean()?.achre}</p>
                                </div>
                                <div>{"\n"}</div>
                                <div style={inline}>
                                    <div onClick={() => toggle("caeren")} style={font}>Caer</div>
                                    <p class="gold" style={font}>{newAscean()?.caeren}</p>
                                </div>
                                <div>{"\n"}</div>
                                <div style={inline}>
                                    <div onClick={() => toggle("kyosir")} style={font}>Kyo</div>
                                    <p class="gold" style={font}>{newAscean()?.kyosir}</p>
                                </div>
                            </div>
                        </div>
                        </Suspense>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.CHARACTER.KEY}>
                    <div class="drop-25 left" style={{ height: "82.5%", width: "48%", display: "inline-block" }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Character newAscean={newAscean} setNewAscean={setNewAscean} /> 
                            <Sex newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    </div>
                    <div class="drop-25 right" style={{ height: "82.5%", width: "48%", display: "inline-block" }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Origin newAscean={newAscean} setNewAscean={setNewAscean} />
                            <br />
                            <br />
                            <Faith newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    </div>
                </Match>
                <Match when={menu().screen === SCREENS.ATTRIBUTES.KEY}>
                    <div class="drop-25 left" style={{ height: "82.5%", width: "48%", display: "inline-block" }}>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Mastery newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                        <Suspense fallback={<Puff color="gold" />}>
                            <Preference newAscean={newAscean} setNewAscean={setNewAscean} />
                        </Suspense>
                    </div>
                    <div class="drop-25 right" style={{ height: "82.5%", width: "48%", display: "inline-block" }}>
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
        <Show when={armorShow()}>
        <div class="modal" onClick={() => setArmorShow(!armorShow())}>
            <ArmorModal armor={preferenceState.find(pref => pref.name === newAscean().preference) as { name: string; description: string; }}/>
        </div> 
        </Show>
        <Show when={attrShow()}>
        <div class="modal" onClick={() => setAttrShow(!attrShow())}>
            <AttributeModal attribute={attribute()}/>
        </div> 
        </Show>
        <Show when={showFaith()}>
            <div class="modal" onClick={() => setShowFaith(!showFaith())}>
                <FaithModal faith={newAscean().faith} />
            </div>
        </Show> 
        <Show when={showOrigin()}>
            <div class="modal" onClick={() => setShowOrigin(!showOrigin())}>
                <OriginModal origin={newAscean().origin} />
            </div>
        </Show>
    </div>;
};