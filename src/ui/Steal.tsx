import { Accessor, createEffect, createSignal, onMount, Setter, Show } from "solid-js";
import { creation } from "../App";
import Ascean from "../models/ascean";
import { Combat } from "../stores/combat";
import { EventBus } from "../game/EventBus";
import { vibrate } from "../game/phaser/ScreenShake";
import { font, getRarityColor } from "../utility/styling";
import Settings from "../models/settings";
import { GameState } from "../stores/game";
var failure = new Audio("../assets/sounds/religious.mp3");
var success = new Audio("../assets/sounds/steal.mp3");
const MAZE_SIZE = 100; // 10x10 grid
type Wall = { x1: number; y1: number; x2: number; y2: number, type: "outer" | "inner" };
const PICKPOCKET = {
    Easy: { DIFFICULTY: "Easy", WALL_GRID: 4, WALL_SIZE: 3, ALERT: 1, PADDING: 3, NEXT: "Medium" },
    Medium: { DIFFICULTY: "Medium", WALL_GRID: 5, WALL_SIZE: 4, ALERT: 2, PADDING: 3.5, NEXT: "Hard" },
    Hard: { DIFFICULTY: "Hard", WALL_GRID: 5, WALL_SIZE: 5, ALERT: 3, PADDING: 4, NEXT: "Master" },
    Master: { DIFFICULTY: "Master", WALL_GRID: 6, WALL_SIZE: 6, ALERT: 4, PADDING: 5, NEXT: "Legendary" },
    Legendary: { DIFFICULTY: "Legendary", WALL_GRID: 7, WALL_SIZE: 7, ALERT: 5, PADDING: 6, NEXT: "Easy" },
};
const getDifficultyColor = (difficulty: string) => {
    const colors = {
        Easy: "#4CAF50",
        Medium: "#FFC107",
        Hard: "#FF9800",
        Master: "#F44336",
        Legendary: "#9C27B0",
    };
    return colors[difficulty as keyof typeof colors];
};
export default function Steal({ ascean, combat, game, settings, stealing, setItems, setShowPickpocket, setStealing }: { ascean: Accessor<Ascean>; combat: Accessor<Combat>; game: Accessor<GameState>; settings: Accessor<Settings>; stealing: Accessor<{ stealing: boolean; item: any }>; setStealing: Setter<{ stealing: boolean; item: any }>; setItems: Setter<any[]>; setShowPickpocket:Setter<boolean>; }) {
    const [debugMode, setDebugMode] = createSignal<boolean>(true);
    const [stealProgress, setStealProgress] = createSignal<number>(0);
    const [pickDiff, setPickDiff] = createSignal(PICKPOCKET[settings()?.pickpocket?.difficulty as keyof typeof PICKPOCKET] || PICKPOCKET["Easy"]); // Easy/medium/hard
    const [alertLevel, setAlertLevel] = createSignal<number>(0);
    const [isStealing, setIsStealing] = createSignal<boolean>(false);
    const [showManual, setShowManual] = createSignal<boolean>(false);
    const [mazeWalls, setMazeWalls] = createSignal<Wall[]>([]);
    const [offset, setOffset] = createSignal({x:0,y:0});
    const [imgCenter, setImgCenter] = createSignal({x:0,y:0});
    const safeZone = { x: 89.5, y: 82.5, radius: 7.5 };
    let touchId: number | null = null;
    let touchStartPos = { x: 0, y: 0 };
    let target: any;
    let timer: any;

    createEffect(() => checkThievery());
    onMount(() => setMazeWalls(generateMaze(MAZE_SIZE, MAZE_SIZE)));

    async function changeDifficulty() {
        try {
            const difficulty = PICKPOCKET[settings()?.pickpocket?.difficulty as keyof typeof PICKPOCKET || "Easy"].NEXT;
            const newSettings = { ...settings(), pickpocket: { ...settings()?.pickpocket, difficulty } };
            EventBus.emit("save-settings", newSettings);
            setTimeout(() => {
                setMazeWalls(generateMaze(MAZE_SIZE, MAZE_SIZE));
            }, 500);
        } catch (err) {
            console.warn(err, "Error Changing Difficulty");
        };
    };

    function checkThievery(): void {
        setPickDiff(PICKPOCKET[settings()?.pickpocket?.difficulty as keyof typeof PICKPOCKET] || PICKPOCKET["Easy"]);
    };

    function stopThievery(): void {
        clearInterval(timer);
        timer = undefined;
        setStealing({...stealing(), stealing: false});
    };

    function checkStatisticalValue(rarity: string): number {
        switch (rarity) {
            case "Common": return 5;
            case "Uncommon": return 25;
            case "Rare": return 100;
            case "Epic": return 300;
            case "Legendary": return 10000;
            default: return 0;
        };
    };

    function engage() {
        setAlertLevel(0);
        EventBus.emit("aggressive-enemy", { id: combat().enemyID, isAggressive: true });
        EventBus.emit("blend-combat", { isStealth: false });
        EventBus.emit("action-button-sound");
        EventBus.emit("engage");
        if (game().showDialog) EventBus.emit('outside-press', "dialog");
        if (game().scrollEnabled) EventBus.emit('outside-press', "settings");
        if (game().showCombat) EventBus.emit('outside-press', "logs");
        setStealing({...stealing(), stealing: false});
        setShowPickpocket(false);
    };

    const checkMazeCollision = (x: number, y: number): { collides: boolean, type: string } => {
        const padding = pickDiff().PADDING;
        for (let i = 0; i < mazeWalls().length; ++i) { 
            const wall = mazeWalls()[i]; 
            const isHorizontal = wall.y1 === wall.y2;
            if (isHorizontal) {
                const check = { 
                    collides: y >= wall.y1 - padding && y <= wall.y1 + padding && x >= wall.x1 && x <= wall.x2, 
                    type: wall.type
                };
                if (check.collides) return check;
            } else {
                const check = { 
                    collides: x >= wall.x1 - padding && x <= wall.x1 + padding && y >= wall.y1 && y <= wall.y2, 
                    type: wall.type 
                };
                if (check.collides) return check;
            };
        };
        return { collides: false, type: "" };
    };

    function generateMaze(width: number, height: number): Wall[] {
        let walls: Wall[] = [];
        const gridSize = pickDiff().WALL_GRID;
        const divisions = Array.from({ length: gridSize + 1 }, (_, i) => (i * 100) / gridSize);
        const outerWalls: Wall[] = [
            { x1: 0, y1: 0, x2: width, y2: 0, type: "outer" },
            { x1: 0, y1: height, x2: width, y2: height, type: "outer" },
            { x1: 0, y1: 0, x2: 0, y2: height, type: "outer" },
            { x1: width, y1: 0, x2: width, y2: height, type: "outer" }
        ];
        const connectedCells = new Set<string>();
        clearInterval(timer);
        timer = undefined;

        const generateInnerWalls = () => {
            walls = [...outerWalls];
            connectedCells.clear();
            connectedCells.add('0,0'); // Start cell
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const [left, right] = [divisions[col], divisions[col + 1]];
                    const [top, bottom] = [divisions[row], divisions[row + 1]];
    
                    if (row < gridSize - 1 && (col === 0 || Math.random() > 0.5)) {
                        const gapWidth = (right - left) * 0.5;
                        const gapStart = left + (right - left - gapWidth) * Math.random();
                        
                        walls.push(
                            { x1: left, y1: bottom, x2: gapStart, y2: bottom, type: "inner" },
                            { x1: gapStart + gapWidth, y1: bottom, x2: right, y2: bottom, type: "inner" }
                        );
                        connectedCells.add(`${col},${row + 1}`); // Mark cell below as connected
                    } else if (row < gridSize - 1) {
                        walls.push({ x1: left, y1: bottom, x2: right, y2: bottom, type: "inner" });
                    };
    
                    if (col < gridSize - 1 && (row === 0 || Math.random() > 0.5)) {
                        const gapHeight = (bottom - top) * 0.5;
                        const gapStart = top + (bottom - top - gapHeight) * Math.random();
                        
                        walls.push(
                            { x1: right, y1: top, x2: right, y2: gapStart, type: "inner" },
                            { x1: right, y1: gapStart + gapHeight, x2: right, y2: bottom, type: "inner" }
                        );
                        connectedCells.add(`${col + 1},${row}`); // Mark cell to right as connected
                    } else if (col < gridSize - 1) {
                        walls.push({ x1: right, y1: top, x2: right, y2: bottom, type: "inner" });
                    };
                };
            };
        };

        do {
            generateInnerWalls();
        } while(connectedCells.size !== gridSize * gridSize);

        timer = setInterval(() => {
            if (stealProgress() >= 100) {
                clearInterval(timer);
                return;
            };
            setAlertLevel(prev => Math.min(prev + pickDiff().ALERT, 100));
            if (alertLevel() >= 100) {
                failure.play();
                const value = checkStatisticalValue(stealing().item.rarity as string);
                EventBus.emit("pocket-item", { success: false, item: stealing().item, value });
                EventBus.emit("alert", {header: "You Have Been Caught!", body: `You were caught stealing. The item has subsequently been alerted to your abhorrent presence.`, delay: 6000, key: "Close"});    
                vibrate(1000);
                setStealProgress(0);
                setTimeout(() => engage(), 5000);
                clearInterval(timer);
                timer = undefined;
            };
        }, 1000);
        return walls;
    };

    const isInSafeZone = (touchX: number, touchY: number) => {
        const zone = safeZone;
        const dist = Math.sqrt(
            Math.pow(touchX - 100, 2) + 
            Math.pow(touchY - 100, 2)
        );
        // console.log({imgX: roundToTwoDecimals(touchX), imgY: roundToTwoDecimals(touchY), safeX: zone.x, safeY: zone.y, distance: Math.round(dist)}, "Current Distance From Safe Zone");
        return dist <= zone.radius;
    };

    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        setIsStealing(true);
        target = e.currentTarget;
        touchId = e.touches[0].identifier;
        touchStartPos = {
            x: e.touches[0].clientX - offset().x,
            y: e.touches[0].clientY - offset().y
        };
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isStealing()) return;
        const touch = Array.from(e.touches).find(t => t.identifier === touchId);
        if (!touch) return;

        const rect = (e.currentTarget as any).getBoundingClientRect();
        const img = (target as any).getBoundingClientRect();
        const touchX = ((touch.clientX - rect.left) / rect.width) * 100;
        const touchY = ((touch.clientY - rect.top) / rect.height) * 100;
        const dx = touch.clientX - touchStartPos.x;
        const dy = touch.clientY - touchStartPos.y;
        const imgCenterX = ((img.left + img.width - rect.left) / rect.width) * 100;
        const imgCenterY = ((img.top + img.height - rect.top) / rect.height) * 100;
        setImgCenter({ x: imgCenterX, y: imgCenterY });
        const collision = checkMazeCollision(touchX, touchY);
        if (collision.collides) {
            const alert = collision.type === "outer" ? 100 : pickDiff().ALERT;
            setAlertLevel(prev => Math.min(prev + alert, 100));
            vibrate(150);
        } else {
            setOffset({ x: dx, y: dy });
        };
    };
    
    const handleTouchEnd = () => {
        setIsStealing(false);
        if (isInSafeZone(imgCenter().x, imgCenter().y)) {
            success.play();
            const value = checkStatisticalValue(stealing().item.rarity as string);
            clearInterval(timer);
            timer = undefined;
            setStealProgress(100);
            EventBus.emit("pocket-item", { success: true, item: stealing().item, value });
            EventBus.emit("alert", { header: "You Have Picked the Pocket!", body: `You have successfully lifted the item from their pocket. The enemy, ${combat().computer?.name} has no idea they no longer possess the ${stealing().item.name}. Good job, criminal scum!`, delay: 6000, key: "Close"});    
            vibrate([500, 250, 500]);
            setTimeout(() => setStealing({...stealing(), stealing: false}), 5000);
            setItems((prev: any[]) => prev.filter((i: any) => i.name !== stealing().item.name));
        };
        target = undefined;
    };
    
    return (
        <div class="modal">
            <div class="border" style={{ position: "absolute", height: "95%", width: "60%", left: "20%", top: "0%" }}>
                <div class="center creature-heading wrap">
                    <h1 onClick={changeDifficulty}>Pickpocketing (<span style={{ color: getDifficultyColor(pickDiff().DIFFICULTY) }}>{pickDiff().DIFFICULTY}</span>)</h1>
                    <Show when={stealProgress() >= 100 || alertLevel() >= 100}>
                        <div class="sunburst" style={{ "--glow-color": alertLevel() >= 100 ? "red" : "green", top: "-75vh", transform: "scale(2)" }}></div>
                    </Show>
                    <div
                        classList={{ shake: alertLevel() >= 100 }}
                        onTouchMove={handleTouchMove}
                        style={{ height: "75vh", width: "100%", background: "linear-gradient(#111, #333)" }}
                    >
                        <svg class="maze" style={{ height: "75vh", width: "100%" }}>
                            {mazeWalls().map((wall, _i) => { 
                                return (
                                    <line x1={`${wall.x1}%`} y1={`${wall.y1}%`} 
                                    x2={`${wall.x2}%`} y2={`${wall.y2}%`} 
                                    style={{ "--wall-thickness": `${pickDiff().WALL_SIZE}px`, stroke: "#777" }}
                                    />
                            )})}
                        </svg>
                        <Show when={debugMode()}>
                            <div class="safe-zone" style={{
                                left: `${safeZone.x}%`,
                                top: `${safeZone.y}%`,
                                width: `${safeZone.radius}%`,
                                height: `${safeZone.radius}%`,
                                "border-radius": "0.5em",
                                transform: "translate(-50%, -50%)",
                            }} />
                        </Show>
                        <img 
                            classList={{ "animate-flickerDiv-infinite": isStealing() }}
                            style={{
                                position: "absolute",
                                top: "12%",
                                left: "6.5%",
                                // opacity: isStealing() ? 1 : 0.7,
                                "box-shadow": isStealing() ? "0 0 0.5rem #ffc700" : "",
                                "--glow-color": "gold",
                                background: "#000",                            
                                border: isStealing() ? `0.15em solid gold` : `0.15em solid ${getRarityColor(stealing().item?.rarity as string)}`,
                                transform: `scale(${isStealing() ? 1 : 1}) translate(${offset().x}px, ${offset().y}px)`,
                            }}
                            src={stealing().item.imgUrl}
                            onTouchStart={handleTouchStart}                        
                            onTouchEnd={handleTouchEnd}
                        />
                    </div>
                    <div style={{ display: "block", margin: "1% auto" }}>
                        {/* <div style={{ display: "inline-flex" }}>
                            <p style={{ margin: "1%" }}>Pickpocket:</p>
                            <div class="durability-bar" style={{ background: "transparent" }}>
                                <div class="durability-fill" style={{ background: "green", width: `${stealProgress()}%`}} />
                            </div>
                            <p style={{ margin: "1%" }}>({Math.round(stealProgress())}%)</p>
                        </div><br /> */}
                        <div style={{ display: "inline-flex" }}>
                            <p style={{ margin: "1%" }}>Alert:</p>
                            <div class="durability-bar" style={{ background: "transparent" }}>
                                <div class="durability-fill" style={{ background: "red", width: `${alertLevel()}%`}} />
                            </div>
                            <p style={{ margin: "1%" }}>({Math.round(alertLevel())}%)</p>
                        </div>
                    </div>
                </div>
                <Show when={showManual()}>
                    <div class="result modal" onClick={() => setShowManual(false)}>
                        <div class="border superCenter">
                            <div class="center creature-heading wrap">
                                <h1>How to Pickpocket</h1>
                                <h2 class="wrap" style={{ margin: "3% auto" }}>Grip the <span class="gold">{stealing().item.name}</span> and carefully guide it through the maze of perception, toward the safe zone.{" "}
                                Once there, the <span style={{ color: "green" }}>pickpocket meter</span> will fill up, becoming a successful attempt once reaching 100%.</h2>
                                <p style={font("1em")}><span style={{ color: "red" }}>Warning: </span>You can fail the attempt if you end up <span style={{ color: "red" }}>alerting</span> the enemy, <span class="gold" style={{ "font-style":"italic" }}>{combat().computer?.name}</span>, through bashing clumsily into his walls of perception. You may also fail the attemped pickpocket if you take too long stealing the <span style={{ color: "gold" }}>{stealing().item.name}</span>.</p>
                            </div>
                        </div>
                    </div>
                </Show>
                <button class="highlight cornerTL" onClick={() => setShowManual(true)} style={{ color: "green" }}>Manual</button>
                <button class="highlight cornerTR" onClick={() => setDebugMode(!debugMode())} style={{ color: "teal" }}>Debug</button>
                <button class="highlight cornerBR" onClick={stopThievery} style={{ color: "red" }}>X</button>
            </div>
        </div>
    );
};