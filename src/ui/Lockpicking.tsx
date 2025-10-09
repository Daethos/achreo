import { Accessor, createEffect, createSignal, onMount, Setter, Show } from "solid-js";
import { load } from "../App";
import Ascean from "../models/ascean";
import Settings from "../models/settings";
import { screenShake, vibrate } from "../game/phaser/ScreenShake";
import { Store } from "solid-js/store";
import { IRefPhaserGame } from "../game/PhaserGame";
import { font } from "../utility/styling";
import { EventBus } from "../game/EventBus";
import { Play } from "../game/main";
var picking = new Audio("../assets/sounds/lockpick-sound.mp3");
var success = new Audio("../assets/sounds/lockpick-success.mp3");
const PLAYING = "PLAYING";
const SUCCESS = "SUCCESS";
const FAILURE = "FAILURE";

const LOCKPICK: {[key:string]: any} = {
    Easy: { DIFFICULTY: "Easy", HEALTH: 10, SIZE: 40, DURABILITY: 0.05, ROTATION: 480, TUMBLERS: 2, PLAYER: 2, DURATION: 32, RESET_ALL: false, INTENSITY: 0.002, NEXT: "Medium" },
    Medium: { DIFFICULTY: "Medium", HEALTH: 20, SIZE: 25, DURABILITY: 0.1, ROTATION: 420, TUMBLERS: 3, PLAYER: 3, DURATION: 32, RESET_ALL: false, INTENSITY: 0.00175, NEXT: "Hard" },
    Hard: { DIFFICULTY: "Hard", HEALTH: 30, SIZE: 15, DURABILITY: 0.15, ROTATION: 360, TUMBLERS: 4, PLAYER: 4, DURATION: 32, RESET_ALL: true, INTENSITY: 0.0015, NEXT: "Master" },
    Master: { DIFFICULTY: "Master", HEALTH: 50, SIZE: 10, DURABILITY: 0.2, ROTATION: 300, TUMBLERS: 4, PLAYER: 5, DURATION: 32, RESET_ALL: true, INTENSITY: 0.00125, NEXT: "Legendary" },
    Legendary: { DIFFICULTY: "Legendary", HEALTH: 100, SIZE: 5, DURABILITY: 0.25, ROTATION: 240, TUMBLERS: 5, PLAYER: 10, DURATION: 32, RESET_ALL: true, INTENSITY: 0.001, NEXT: "Easy" },
};

const COLORS: {[key:string]: string} = {
    Easy: "#4CAF50",
    Medium: "#FFC107",
    Hard: "#FF9800",
    Master: "#F44336",
    Legendary: "#9C27B0",
};

/* 
    <<---------- LOCKPICKING ---------->>
    Mini-Game: Set tumblers one at a time, rotating the pick 
    in the proper place, and setting the tension wrench further
    to unlock. Difficulty based on flat tiers.
    <<---------- LOCKPICKING ---------->> 
*/

export default function Lockpicking({ ascean, lockpick, settings, setLockpicking, instance }: { ascean: Accessor<Ascean>; lockpick: Accessor<{id: string; interacting: boolean; type: string;}>; settings: Accessor<Settings>; setLockpicking: Setter<boolean>; instance: Store<IRefPhaserGame>; }) {
    const [angle, setAngle] = createSignal(0); // Lockpick rotation (0-360°)
    const [tension, setTension] = createSignal(115); // Wrench rotation (0-360°)
    const [lockDifficulty, setLockDifficulty] = createSignal(LOCKPICK[settings()?.lockpick?.difficulty] || LOCKPICK["Easy"]); // Easy/medium/hard
    const [gameStatus, setGameStatus] = createSignal(PLAYING);
    const [sweetSpotStart, setSweetSpotStart] = createSignal<number>(0);
    const [sweetSpotEnd, setSweetSpotEnd] = createSignal<number>(0);
    const [showManual, setShowManual] = createSignal<boolean>(false);
    const [lockpicks, setLockpicks] = createSignal<number>(settings()?.lockpick?.count || 5);
    const [debugMode, setDebugMode] = createSignal<boolean>(false);
    const [rumble, setRumble] = createSignal(false);
    const [broke, setBroke] = createSignal(false);
    const [totalRotation, setTotalRotation] = createSignal(0); // Tracks cumulative rotation
    const [pickDurability, setPickDurability] = createSignal(100); // 100% = new pick
    const [activeTouch, setActiveTouch] = createSignal<"pick" | "wrench" | undefined>(undefined);
    const [tumblers, setTumblers] = createSignal<{ current: number; total: number; }>({ current: 0, total: lockDifficulty().TUMBLERS });
    const [currentTumblerIndex, setCurrentTumblerIndex] = createSignal(0);
    const [setTumblerPositions, setSetTumblerPositions] = createSignal<number[]>([]);
    const [tumblerDown, setTumblerDown] = createSignal<boolean>(false);

    createEffect(() => setLockDifficulty(LOCKPICK[settings()?.lockpick?.difficulty] || LOCKPICK["Easy"]));

    async function changeDifficulty() {
        try {
            const difficulty = LOCKPICK[settings()?.lockpick?.difficulty || "Easy"].NEXT;
            const newSettings = { ...settings(), lockpick: { ...settings()?.lockpick, difficulty } };
            EventBus.emit("save-settings", newSettings);
            setTimeout(() => resetLock(), 500);
        } catch (err) {
            console.warn(err, "Error Changing Difficulty");
        };
    };

    const resetLock = (pick: boolean = false) => {
        const size = lockDifficulty().SIZE + ((ascean().achre + ascean().agility) / lockDifficulty().PLAYER);
        const start = Math.floor(Math.random() * (360 - size));
        setAngle(0);
        setTension(115);
        setSweetSpotStart(start);
        setSweetSpotEnd(start + size);
        if (pick) setPickDurability(100);
        setTotalRotation(0);
        setGameStatus(PLAYING);
        setTumblers({current:0, total:lockDifficulty().TUMBLERS});
        setSetTumblerPositions([]);
        setCurrentTumblerIndex(0);
    };

    const breakPick = () => {
        if (!load.ended) load.pause();
        load.play();
        vibrate(1000); // Long buzz
        setBroke(true);
        setActiveTouch(undefined);
        setTotalRotation(0);
        setTimeout(() => {
            setBroke(false);
            setLockpicks(prev => Math.max(prev - 1, 0));
            if (lockpicks() > 0) {
                setPickDurability(100);
                setAngle(0);
            } else {
                setPickDurability(0);
                setGameStatus(FAILURE);
            };
        }, 1000);
    };

    const checkSweetSpot = () => {
        const currentAngle = angle();
        const currentTumbler = currentTumblerIndex();
        
        if (currentAngle >= sweetSpotStart() && currentAngle <= sweetSpotEnd()) {
            success.play();
            vibrate([200, 100, 200]);
            
            // Store the position of this tumbler
            setSetTumblerPositions(prev => [...prev, currentAngle]);
            
            const nextTumbler = currentTumbler + 1;
            
            if (nextTumbler < tumblers().total) {
                // More tumblers to go - generate new sweet spot
                setCurrentTumblerIndex(nextTumbler);
                generateNewSweetSpot();
                
                setTotalRotation(0);
                setTumblerDown(true);
                setTimeout(() => setTumblerDown(false), 2000);
            } else {
                setGameStatus(SUCCESS);
                setTumblerDown(true);
                setTimeout(() => setTumblerDown(false), 2000);
                setTimeout(() => {
                    if (lockpick().type === "treasure") {
                        EventBus.emit("open-chest", lockpick().id);
                    } else if (lockpick().type === "door") {
                        EventBus.emit("open-door", lockpick().id);
                    }
                    setLockpicking(false);
                }, 2000); // 1000
            };
        } else {
            // Hard mode: reset everything
            if (lockDifficulty().RESET_ALL) {
                setCurrentTumblerIndex(0);
                setSetTumblerPositions([]);
                setTension(115);
                setAngle(0);
            };
            
            setPickDurability(prev => Math.max(prev - lockDifficulty().HEALTH, 0));
            load.play();
            vibrate(1000);
            
            if (pickDurability() <= 0) {
                breakPick();
            };
        };
    };

    function checkDistance() {
        const currentAngle = angle();
        const sweetSpotCenter = (sweetSpotStart() + sweetSpotEnd()) / 2; // Midpoint of sweet spot
        const sweetSpotWidth = sweetSpotEnd() - sweetSpotStart();

        let distance = Math.abs(currentAngle - sweetSpotCenter); // Calculate angular distance (0-180°)
        distance = Math.min(distance, 360 - distance); // Handle wrap-around (e.g., 350° to 10°)

        const normalizedDistance = Math.min(distance / (sweetSpotWidth / 2), 1); // Normalize distance to 0-1 range (0 = center, 1 = edge of sweet spot)

        if (distance * 2 < sweetSpotWidth) {
            const duration = Math.max(24, (1 - normalizedDistance) * lockDifficulty().DURATION);
            screenShake(instance?.scene as Play, duration, lockDifficulty().INTENSITY); // Tweak multipliers
        };
    };

    function isInSweetSpot(): boolean {
        const currentAngle = angle();
        const isBetween = (angle: number, start: number, end: number) => 
            (start <= end) 
            ? angle >= start && angle <= end
            : angle >= start || angle <= end;
        return isBetween(currentAngle, sweetSpotStart(), sweetSpotEnd());
    };

    function generateNewSweetSpot() {
        // Make sure new sweet spot doesn't overlap with already-set tumblers
        const size = lockDifficulty().SIZE + ((ascean().achre + ascean().agility) / lockDifficulty().PLAYER);
        let newStart, newEnd;
        let attempts = 0;
        
        do {
            newStart = Math.floor(Math.random() * (360 - size)); // Math.random() * 360;
            newEnd = newStart + size;
            attempts++;
        } while (overlapsWithSetTumblers(newStart, newEnd) && attempts < 20);
        
        setSweetSpotStart(newStart);
        setSweetSpotEnd(newEnd);
    };

    function overlapsWithSetTumblers(start: number, end: number): boolean {
        return setTumblerPositions().some(pos => {
            return pos >= start && pos <= end;
        });
    };

    const handlePickTouch = (e: TouchEvent) => {
        e.preventDefault();
        if (gameStatus() !== PLAYING || lockpicks() === 0) return;
        picking.loop = true;
        picking.play();
        setActiveTouch("pick");
    };

    const handleWrenchTouch = (e: TouchEvent) => {
        e.preventDefault();
        setActiveTouch("wrench");
        const wobble = () => {
            if (!rumble()) return;
            const wobbleAngle = angle() + (Math.random() * 0.5 - 0.25); // +/- 5deg jitter
            setAngle(wobbleAngle);
            requestAnimationFrame(wobble);
        };
        setRumble(true);
        wobble();
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (gameStatus() !== PLAYING || lockpicks() === 0 || activeTouch() === undefined) return;
        e.preventDefault();
        
        const lockRect = (e.currentTarget as any)?.getBoundingClientRect();
        const centerX = lockRect.left + lockRect.width / 2;
        const centerY = lockRect.top + lockRect.height / 2;
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const ang = Math.atan2(touchY - centerY, touchX - centerX) * (180 / Math.PI);
        const newAngle = (ang + 360) % 360;
        if (activeTouch() === "pick") {
            setAngle(newAngle);
            setTotalRotation(prev => Math.min(prev + 1, lockDifficulty().ROTATION));
            checkDistance();
            if (totalRotation() >= lockDifficulty().ROTATION) breakPick();
        } else if (activeTouch() === "wrench") {
            if (!isInSweetSpot()) {
                setPickDurability(prev => Math.max(prev - lockDifficulty().DURABILITY * 2, 0)); // Penalty for forcing wrench
                vibrate(32);
                setTension(115 + (Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1));
                if (pickDurability() === 0) {
                    breakPick();
                };
                return; // Don't allow wrench movement
            };
            
            const maxTension = 115 + (currentTumblerIndex() * 20 + 20); // Wrench turns further with each tumbler
            setTension(Math.max(newAngle, 110));
            vibrate(16);
            
            if (pickDurability() === 0) {
                breakPick();
            };
            
            // Check if wrench turned far enough to lock this tumbler
            if (tension() >= maxTension) {
                checkSweetSpot();
                handleTouchEnd();
            };
        };
    };

    const handleTouchEnd = () => {
        setRumble(false);
        // setTension(115);
        picking.pause();
        setActiveTouch(undefined);
    };

    const getDifficultyColor = (difficulty: string) => {
        return COLORS[difficulty];
    };
    
    onMount(() => resetLock());

    return (
        <div class="lockpicking-game border creature-heading" style={{ position: "absolute", left: "20vw", top: "1vh", height: "95vh", width: "60vw", "--glow-color": "teal", "z-index": 99 }}>
        <h1 onClick={changeDifficulty} style={{ margin: "3% auto" }}>Lockpicking (<span style={{ color: getDifficultyColor(lockDifficulty().DIFFICULTY) }}>{(lockDifficulty().DIFFICULTY)}</span>)</h1>
        <Show when={tumblerDown()}>
            <div class="modal" style={{ background: "rgba(0,0,0,0.75)" }}>
                <h1 class="superCenter animate-fade-inout" style={{ top: "20%", "font-size":"4rem", "font-family":"Centaur", width: "100%" }}>{gameStatus() === SUCCESS ? "The Lock Opened!" : "Tumbler Set"}</h1>
            </div>
        </Show>
        <div class="lock" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div class="lock-body">
                <Show when={lockpicks() > 0}>
                    <div class="lockpick" classList={{ "animate-flickerDiv": broke() }} style={{ transform: `rotate(${angle()}deg)`, "--glow-color": "red" }} onTouchStart={handlePickTouch} />
                    <div class="tension-wrench" style={{ background: "silver", transform: `rotate(${tension()}deg)`, "z-index": 1 }} onTouchStart={handleWrenchTouch} />
                </Show>
                <div class="keyhole" style={{ transform: `translate(-50%, -50%) rotate(${tension() - 115}deg)` }} />
                <Show when={debugMode()}>
                    <div 
                        class="sweet-spot"
                        style={{
                            top: "50%",
                            left: "50%",
                            height: "100%",
                            width: `${(sweetSpotEnd() - sweetSpotStart())}%`,
                            transform: `translate(-50%, -50%) rotate(${sweetSpotStart() + (sweetSpotEnd() - sweetSpotStart()) / 2 + 90}deg)`,
                            "transform-origin": "center",
                        }}
                    />
                </Show>
            </div>
        </div>
        <p style={{ margin: "-1% auto 0" }}>Lockpicks Remaining: <span class="gold" classList={{ "animate-flicker": broke() }} style={{ "--glow-color": "red" }}>{lockpicks()}</span></p>
        <div style={{ display: "inline-flex", width: "50%" }}>
            <p style={{ margin: "1%" }}>Tumblers:</p>
            {/* <p style={{ margin: "1%" }}>Durability:</p> */}
            <div class="durability-bar">
                <div class="durability-fill" style={{ width: `${(currentTumblerIndex()) / tumblers().total * 100}%`}} />
                {/* <div class="durability-fill" style={{ width: `${pickDurability()}%`}} /> */}
            </div>
            <p class="gold" classList={{ "animate-flicker": broke() }} style={{ "--glow-color": "red" , margin: "1%" }}>
                {currentTumblerIndex()} / {tumblers().total}
            </p>
            {/* <p style={{ color: pickDurability() > 80 ? "#fdf6d8" : pickDurability() > 60 ? "gold" : pickDurability() > 40 ? "#ffbf00" : pickDurability() > 20 ? "orange" : "red", margin: "1%" }}>({Math.round(pickDurability())}%)</p> */}
            {/* <p style={{ color: pickDurability() > 80 ? "#fdf6d8" : pickDurability() > 60 ? "gold" : pickDurability() > 40 ? "#ffbf00" : pickDurability() > 20 ? "orange" : "red", margin: "1%" }}>({Math.round(pickDurability())}%)</p> */}
        </div>
            {/* <div class="durability-bar" style={{ display: "inline-flex" }}>
            <p style={{ margin: "0" }}>Tumblers: <span class="gold" classList={{ "animate-flicker": broke() }} style={{ "--glow-color": "red" }}>
                {currentTumblerIndex() + 1} / {tumblers().total}</span>
            </p>
                <div class="durability-fill" style={{ width: `${currentTumblerIndex() + 1 / tumblers().total}%`}} />
            </div> */}
            {/* gameStatus() !== PLAYING */}
        <Show when={gameStatus() === FAILURE}>
            <div class="result modal">
                <div class="border superCenter" style={{ height: "50vh", width: "40vw", "z-index": 2 }}>
                    <div class="center creature-heading wrap">
                    <h1 style={{ "margin-top": "10%" }}>{gameStatus() === SUCCESS ? "The Lock Opened!" : "Your Lockpick(s) Broke!"}</h1><br />
                    {/* <p>A door would now be open, or perhaps your spoils of treasure if you were successful at lockpicking. Still a work in progress!</p> */}
                    <Show when={gameStatus() === FAILURE}>
                        <p>Nice try {ascean().name}, but not everyone is capable of such deft precision.</p>
                        <button class="highlight verticalBottom" onClick={() => resetLock(true)}>Try Again</button> <br />
                    </Show>
                    {/* <button class="highlight cornerBL" onClick={() => resetLock(gameStatus() !== SUCCESS)}>{gameStatus() === SUCCESS ? "Unlock Another" : "Try Again"}</button> <br /> */}
                    {/* <button class="highlight cornerBR" onClick={() => setLockpicking(false)} style={{ color: "red" }}>{gameStatus() === SUCCESS ? "Leave Satisfied" : "Give Up"}</button> */}
                    <Show when={gameStatus() === SUCCESS}>
                        <p>Congratulations {ascean().name}, you have successfully opened the lock! Good job, you rapscallion.</p>
                        {/* <button class="highlight cornerBR" onClick={() => setLockpicking(false)} style={{ color: "teal" }}>Leave Satisfied</button> */}
                    </Show>
                    </div>
                </div>
            </div>
        </Show>
        <Show when={showManual()}>
            <div class="result modal" onClick={() => setShowManual(false)}>
                <div class="border superCenter">
                    <div class="center creature-heading wrap">
                        <h1>How to Lockpick</h1>
                        <h2 class="wrap" style={{ margin: "3% auto" }}>Rotate the <span class="gold">lockpick</span> around, feeling for vibrations of the tumbler setting into place.{" "}
                        Once set, rotate the <span style={{ color: "silver" }}>tension wrench</span> either clockwise or counter in order to attempt to set the tumblers in place to further move the lockpick into more tumblers.</h2>
                        <p style={font("1em")}><span style={{ color: "red" }}>Warning: </span>You can break the <span class="gold">lockpick</span> from over rotation when feeling around to set in place. You can also break the <span class="gold">lockpick</span> as you rotate the <span style={{ color: "silver" }}>tension wrench</span>, if not set correctly.</p>
                    </div>
                </div>
            </div>
        </Show>
        {/* <Show when={lockpicks() > 0}>
            <button class="highlight cornerBL" onClick={checkSweetSpot} style={{ color: "green" }}>Tap</button>
        </Show> */}
        <button class="highlight cornerTL" onClick={() => setShowManual(true)}>Manual</button>
        <button class="highlight cornerBR" onClick={() => setLockpicking(false)} style={{ color: "red" }}>X</button>
        <button class="highlight cornerTR" onClick={() => setDebugMode(!debugMode())} style={{ color: "teal" }}>Debug</button>
        </div>
    );
};