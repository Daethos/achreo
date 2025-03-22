import { Accessor, Show } from "solid-js";
import { EnemySheet } from "../utility/enemy";
import { EventBus } from "../game/EventBus";

export default function EnemyPreview ({ enemies }: { enemies: Accessor<EnemySheet[]>; }) {
    function fetchEnemy(enemy: any) {
        EventBus.emit("setup-enemy", enemy);
        EventBus.emit("tab-target", enemy);    
    }; 
    return <>
        {enemies()?.length > 0 && enemies()?.map((enemy, index) => {
            if (enemies().length < 2 || index !== 0) return;
            const prevIdx = Number(index) - 1 === -1 ? enemies().length - 1 : Number(index) - 1;
            const prevIdxMore = prevIdx - 1 < 0 ? enemies().length + (prevIdx - 1) : prevIdx - 1;
            const truePrev = enemy.id !== enemies()[prevIdxMore].id;
            let cleanName = enemies()[prevIdxMore].game.name;
            cleanName = cleanName.includes(" ") ? cleanName.split(" ")[0] + " " + cleanName.split(" ")[1] : cleanName;
            let cleanEnemy = enemy.game.name;
            cleanEnemy = cleanEnemy.includes(" ") ? cleanEnemy.split(" ")[0] + " " + cleanEnemy.split(" ")[1] : cleanEnemy;
            return (
                <Show when={truePrev} fallback={
                <div style={{ transform: "scale(0.75)", "background-color": "#000", position: "fixed", height: "auto", width: "10vw", top: "0vh", right: "0vw" }}>
                    <button class="center" style={{ width: "auto", height: "100%", display: "inline-block", "background-color": "#000" }} onClick={() => fetchEnemy(enemy)}>
                        <img src={`../assets/images/${enemy.game.origin}-${enemy.game.sex}.jpg`} alt={cleanEnemy} id="deity-pic" style={{ transform: "scale(1.25)" }} />
                        <div style={{ color: "gold", "text-align": "center", "font-size": "0.75em" }}>{cleanEnemy}</div>
                    </button>
                </div>
                }>
                <div style={{ transform: "scale(0.75)", position: "fixed", width: "20vw", top: "0vh", right: "-1.5vw" }}>
                    <button class="center" style={{ height: "100%", width: "50%", display: "inline-block", "background-color": "#000" }} onClick={() => fetchEnemy(enemies()[prevIdxMore])}>
                        <img src={`../assets/images/${enemies()[prevIdxMore].game.origin}-${enemies()[prevIdxMore].game.sex}.jpg`} style={{ transform: "scale(1.25)" }} alt={enemies()[prevIdxMore].game.name} id="deity-pic" />
                        <div style={{ color: "gold", "text-align": "center", "font-size": "0.75em" }}>{cleanName}</div>
                    </button>
                    <button class="center" style={{ width: "50%", height: "100%", display: "inline-block", "background-color": "#000" }} onClick={() => fetchEnemy(enemy)}>
                        <img src={`../assets/images/${enemy.game.origin}-${enemy.game.sex}.jpg`} alt={cleanEnemy} id="deity-pic" style={{ transform: "scale(1.25)" }} />
                        <div style={{ color: "gold", "text-align": "center", "font-size": "0.75em" }}>{cleanEnemy}</div>
                    </button>
                </div>
                </Show> 
        )})}
    </>
};