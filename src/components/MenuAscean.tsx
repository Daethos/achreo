import { Accessor, createEffect, createMemo, createSignal, For, Setter } from "solid-js";
import { useResizeListener } from "../utility/dimensions";
import { Menu } from "../utility/screens";
import { backgroundGradient, masteryColor } from "../utility/styling";
interface IProps {
    menu: Accessor<Menu>;
    setMenu: Setter<Menu>;
    viewAscean: (asc: string) => void;
    loadAscean: (id: string) => Promise<void>;
};
export default function MenuAscean({ menu, setMenu, viewAscean, loadAscean }: IProps) {
    const [focus, setFocus] = createSignal("");
    const dimensions = useResizeListener();
    const shortDescription = (desc: string): string => desc.split(" ").slice(0, 3).join(" ") + (desc.split(" ").length > 3 ? "..." : "");
    const shortName = (name: string): string => name.split(" ").slice(0, 2).join(" ") + (name.split(" ").length > 2 ? "..." : "");
    // createEffect(() => {
    //     const ascean = menu().asceans.find(a => a._id === focus());
    //     // console.log(ascean, "IDX?");
    //     if (ascean) {
    //         const idx = menu().asceans.indexOf(ascean as never);
    //         console.log(idx, "IDX?");
    //         if (menu().asceans.length === 3 && idx !== 1) {
    //             console.log("CUT ME UP!");
    //             const asceans = menu().asceans;
    //             [asceans[1], asceans[idx]] = [asceans[idx], asceans[1]];
    //             setMenu({...menu(), asceans});
    //         };
    //     };
    // });
    const buttonStyle = {
        "margin-bottom": "5%", "font-size": menu().asceans.length === 3 ? "0.8em" : "1em"
    };
    return <div class="menu menu-3d" style={{ display: "inline-flex", "flex-direction": dimensions().ORIENTATION === "landscape" ? "row" : "column", "align-items": "center", "gap": "1%", "justify-content": "center" }}>
        <For each={menu()?.asceans}> 
            {((asc, ind) => {
                const style = createMemo(() => {
                    const orientation = dimensions()?.ORIENTATION;
                    const currentFocus = focus() === asc._id;
                    const length = menu()?.asceans.length;
                    const mastery = backgroundGradient(asc.mastery, currentFocus);
                    return {
                        "height": length === 3 ? "60%" : "",
                        "padding-top": length === 3 ? "1%" : "",
                        "padding-bottom": length === 3 ? "1%" : "",
                        "width": orientation === "landscape"
                            ? (length === 3 ? "30vw" : length === 2 ? "45vw" : "55vw") 
                            : length === 1 ? "100%" : "80vw",
                        "margin-left": orientation === "landscape" 
                            ? (length === 3 ? "0%" : length === 2 ? "1%" : "0%") 
                            : (length === 3 ? "1.25%" : length === 2 ? "2%" : "0%"),
                        "margin-bottom": length > 1 ? "0%" : "0%",
                        "margin-top": length === 3 ? "0%" : "0%",
                        "--base-shadow": `#000 0 0 0 0.2rem`,
                        "border-color": `${currentFocus ? masteryColor(asc.mastery) : "#fdf6d8"}`,
                        "--glow-color": masteryColor(asc.mastery),
                        "--mastery-color": backgroundGradient(asc.mastery, true),
                        "--mastery-base": backgroundGradient(asc.mastery, false),
                        "--pulse-duration": "2s",
                        "background": `linear-gradient(#000, ${mastery})`,
                    };
                });
                return <div class={dimensions().ORIENTATION === "landscape" ? "border center card glowJuice juice focused-card menu-item-3d" : "border center glowJuice juice"} 
                    // label
                    id={`slot${ind()}`}
                    tabIndex={0}
                    onFocusOut={() => {if (focus() === asc._id) setFocus("");}} 
                    onfocus={() => setFocus(asc._id)}
                    onBlur={() => focus() === asc._id && setFocus("")}
                    style={style()}
                >
                <div class="center creature-heading flickerJuiceInsert" style={{ width: "100%", height: "100%", margin: "auto" }}>
                    <h1>{shortName(asc.name)}</h1>
                    <h2>{shortDescription(asc.description)}</h2>
                    <img src={`../assets/images/${asc.origin}-${asc.sex}.jpg`} id="origin-pic" style={{ transform: menu()?.asceans?.length === 3 ? "scale(1.3)" : "", "margin": menu()?.asceans?.length === 3 ? "7.5% auto" : "", "pointer-events":"none" }} />
                    <h4 class="gold" style={{ margin: "2%" }}>Level: {asc.level}</h4>
                    <button class="highlight" style={buttonStyle} onClick={() => viewAscean(asc._id)}>View {asc.name.split(" ")[0]}</button>
                    <button class="highlight" style={buttonStyle} onClick={() => loadAscean(asc._id)}>Quick Load</button>
                </div> 
                </div>
            })} 
        </For>
    </div>;
};