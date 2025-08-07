import { Accessor } from "solid-js";
import { Combat } from "../stores/combat";
import { GameState } from "../stores/game";
import { createHealthDisplay } from "../utility/health";
import { useResizeListener } from "../utility/dimensions";
export default function HealthBar({ combat, enemy, game }: {combat: Accessor<Combat>;enemy: boolean;game: Accessor<GameState>;}) {
    const { healthDisplay, changeDisplay, healthPercentage } = createHealthDisplay(combat, game, enemy);
    const dimensions = useResizeListener();
    return <div class="healthbar" style={{ height: "7.5%" }} onClick={changeDisplay}>
        <p class="playerPortrait center" style={{ color: "purple", "font-family": "Cinzel Regular", "text-shadow": "0 0 0 #000", "font-size": dimensions().WIDTH > 850 ? "1.25EM" : "1em" }}>{healthDisplay()}</p>
        <div style={{ position: "absolute", bottom: 0, left: 0, top: 0, width: `${healthPercentage()}%`, 
            "background": "linear-gradient(gold, #fdf6d8)", 
            transition: "width 1s ease-out, background 1s ease-out" }}></div>
    </div>;
};