import { Accessor, createMemo, createSignal, For } from "solid-js";
import { Menu } from "../utility/screens";
import { backgroundGradient, masteryColor } from "../utility/styling";
import { click } from "../App";
interface IProps {
    menu: Accessor<Menu>;
    viewAscean: (asc: string) => void;
    loadAscean: (id: string) => Promise<void>;
};
export default function MenuAscean({ menu, viewAscean, loadAscean }: IProps) {
    const [focus, setFocus] = createSignal("");
    const shortDescription = (desc: string): string => desc.split(" ").slice(0, 3).join(" ") + (desc.split(" ").length > 3 ? "..." : "");
    const shortName = (name: string): string => name.split(" ").slice(0, 2).join(" ") + (name.split(" ").length > 2 ? "..." : "");
    const buttonStyle = {
        "margin": "1% 2.5% 6%", 
        "font-size": menu().asceans.length === 3 ? "0.8rem" : ""
    };
    async function clickPlay() {
        if (!click.ended) click.pause();
        await click.play();
    };
    return <div class="menu menu-3d" style={{ display: "inline-flex", "flex-direction": "row", "align-items": "center", "gap": "1%", "justify-content": "center", height: "0" }}>
        <For each={menu()?.asceans}> 
            {((asc, ind) => {
                const style = createMemo(() => {
                    const currentFocus = focus() === asc._id;
                    const length = menu()?.asceans.length;
                    const mastery = backgroundGradient(asc.mastery, currentFocus);
                    return {
                        "height": length === 3 ? "60%" : "",
                        "padding-top": length === 3 ? "1%" : "",
                        "padding-bottom": length === 3 ? "1%" : "",
                        "width": (length === 3 ? "30vw" : length === 2 ? "40vw" : "50vw"),
                        "margin-left": (length === 3 ? "0%" : length === 2 ? "1%" : "0%"),
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
                return <div class="set-float menu-item-3d" style={{ "z-index": focus() === asc._id ? 10 :1 }}> 
                    <div class="border center card juice focused-card"
                        id={`slot${ind()}`}
                        tabIndex={0}
                        onFocusOut={() => {
                            if (focus() === asc._id) setFocus("");
                        }} 
                        onFocus={() => setFocus(asc._id)}
                        onBlur={() => focus() === asc._id && setFocus("")}
                        style={style()}
                        onClick={clickPlay}
                    >
                    <div class="center creature-heading flickerJuiceInsert" style={{ width: "100%", height: "100%", margin: "auto" }}>
                        <h1 style={{ "margin-top": "3%" }}>{shortName(asc.name)}</h1>
                        <h2>{shortDescription(asc.description)}</h2>
                        <img src={`../assets/images/${asc.origin}-${asc.sex}.jpg`} id="origin-pic" style={{ transform: menu()?.asceans?.length === 3 ? "scale(1.3)" : "", "margin": menu()?.asceans?.length === 3 ? "7.5% auto" : "", "pointer-events":"none" }} />
                        <h4 class="gold" style={{ margin: "2%" }}>Level: {asc.level}</h4>
                        <button class="highlight" style={buttonStyle} onClick={() => viewAscean(asc._id)}>View {asc.name.split(" ")[0]}</button>
                        <button class="highlight" style={buttonStyle} onClick={() => loadAscean(asc._id)}>Quick Load</button>
                    </div> 
                </div>
                </div>;
            })} 
        </For>
    </div>;
};