import { Accessor, createEffect, createSignal, onMount, Setter, Show } from "solid-js";
import { load } from "../App";
import Ascean from "../models/ascean";
import Settings from "../models/settings";
import { screenShake, vibrate } from "../game/phaser/ScreenShake";
import { Store } from "solid-js/store";
import { IRefPhaserGame } from "../game/PhaserGame";
import { font } from "../utility/styling";
import { EventBus } from "../game/EventBus";
var picking = new Audio("../assets/sounds/lockpick-sound.mp3");
var success = new Audio("../assets/sounds/lockpick-success.mp3");
const PLAYING = "PLAYING";
const SUCCESS = "SUCCESS";
const FAILURE = "FAILURE";

const LOCKPICK = {
    Easy: { DIFFICULTY: "Easy", HEALTH: 10, SIZE: 40, DURABILITY: 0.05, ROTATION: 480, PLAYER: 2, DURATION: 20, INTENSITY: 0.002, NEXT: "Medium" },
    Medium: { DIFFICULTY: "Medium", HEALTH: 20, SIZE: 25, DURABILITY: 0.1, ROTATION: 420, PLAYER: 3, DURATION: 20, INTENSITY: 0.00175, NEXT: "Hard" },
    Hard: { DIFFICULTY: "Hard", HEALTH: 30, SIZE: 15, DURABILITY: 0.15, ROTATION: 360, PLAYER: 4, DURATION: 20, INTENSITY: 0.0015, NEXT: "Master" },
    Master: { DIFFICULTY: "Master", HEALTH: 50, SIZE: 10, DURABILITY: 0.2, ROTATION: 300, PLAYER: 5, DURATION: 20, INTENSITY: 0.00125, NEXT: "Legendary" },
    Legendary: { DIFFICULTY: "Legendary", HEALTH: 100, SIZE: 5, DURABILITY: 0.25, ROTATION: 240, PLAYER: 10, DURATION: 20, INTENSITY: 0.001, NEXT: "Easy" },
};

export default function Lockpicking({ ascean, lockpick, settings, setLockpicking, instance }: { ascean: Accessor<Ascean>; lockpick: Accessor<{id: string; interacting: boolean; type: string;}>; settings: Accessor<Settings>; setLockpicking: Setter<boolean>; instance: Store<IRefPhaserGame>; }) {
    const [angle, setAngle] = createSignal(0); // Lockpick rotation (0-360°)
    const [tension, setTension] = createSignal(115); // Wrench rotation (0-360°)
    const [lockDifficulty, setLockDifficulty] = createSignal(LOCKPICK[settings()?.lockpick?.difficulty as keyof typeof LOCKPICK] || LOCKPICK["Easy"]); // Easy/medium/hard
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

    createEffect(() => setLockDifficulty(LOCKPICK[settings()?.lockpick?.difficulty as keyof typeof LOCKPICK] || LOCKPICK["Easy"]));

    async function changeDifficulty() {
        try {
            const difficulty = LOCKPICK[settings()?.lockpick?.difficulty as keyof typeof LOCKPICK || "Easy"].NEXT;
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
    };

    const checkSweetSpot = () => {
        const currentAngle = angle();
        if (currentAngle >= sweetSpotStart() && currentAngle <= sweetSpotEnd()) {
            success.play();
            vibrate([500, 250, 500]);
            setGameStatus(SUCCESS); // Lock opened!
            setTimeout(() => {
                if (lockpick().type === "treasure") {
                    EventBus.emit("open-chest", lockpick().id);
                } else if (lockpick().type === "door") {
                    EventBus.emit("open-door", lockpick().id);
                };
                setLockpicking(false);
            }, 1000);
        } else {
            setPickDurability(prev => Math.max(prev - lockDifficulty().HEALTH, 0));
            load.play();
            vibrate(1000);
            setTension(115);
            if (pickDurability() <= 0) {
                setBroke(true);
                setTimeout(() => {
                    setBroke(false);
                    setLockpicks(prev => Math.max(prev - 1, 0));
                    if (lockpicks() > 0) {
                        setPickDurability(100);
                        return;
                    };
                    setGameStatus(FAILURE);
                }, 1000)
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

        if (distance < sweetSpotWidth * 1.5) {
            const duration = 1 - normalizedDistance;
            screenShake(instance?.scene as Phaser.Scene, duration * lockDifficulty().DURATION, lockDifficulty().INTENSITY); // Tweak multipliers
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
            // if (!isInSweetSpot() && startTouchX() !== touchX && startTouchY() !== touchY) setPickDurability(prev => Math.max(prev - lockDifficulty().DURABILITY, 0));
            setAngle(newAngle);
            setTotalRotation(prev => prev + 1);
            checkDistance();
            if (totalRotation() > lockDifficulty().ROTATION) {
                if (!load.ended) {   
                    load.pause();
                };
                load.play();
                setTotalRotation(0);
                setPickDurability(0);
                vibrate(1000); // Long buzz
                setBroke(true);
                setTimeout(() => {
                    setBroke(false);
                    setLockpicks(prev => Math.max(prev - 1, 0));
                    if (lockpicks() > 0) {
                        setPickDurability(100);
                        return;
                    };
                }, 1000);
            };
        } else if (activeTouch() === "wrench") {
            if (!isInSweetSpot()) {
                setPickDurability(prev => Math.max(prev - lockDifficulty().DURABILITY, 0));
            };
            setTension(newAngle);
            vibrate(16); // totalRotation() > lockDifficulty().ROTATION * 0.5 && 

            if (pickDurability() === 0) {
                if (!load.ended) {   
                    load.pause();
                };
                load.play();
                vibrate(1000); // Long buzz
                setBroke(true);
                setTimeout(() => {
                    setBroke(false);
                }, 1000);
                setLockpicks(prev => Math.max(prev - 1, 0));
                if (lockpicks() > 0) {
                    setPickDurability(100);
                    return;
                };
                setPickDurability(0);
                setGameStatus(FAILURE);
            };

            if (tension() >= 205 || tension() <= 25) {
                checkSweetSpot();
                handleTouchEnd();
                return;
            };
        };
    };

    const handleTouchEnd = () => {
        setRumble(false);
        setTension(115);
        picking.pause();
        setActiveTouch(undefined);
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
    
    onMount(() => resetLock());

    return (
        <div class="lockpicking-game border creature-heading" style={{ position: "absolute", left: "25vw", top: "1vh", height: "95vh", width: "50vw", "--glow-color": "teal", "z-index": 99 }}>
        <h1 onClick={changeDifficulty} style={{ margin: "3% auto" }}>Lockpicking (<span style={{ color: getDifficultyColor(lockDifficulty().DIFFICULTY) }}>{(lockDifficulty().DIFFICULTY)}</span>)</h1>
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
        {/* <div style={{ display: "inline-flex" }}>
            <p style={{ margin: "1%" }}>Durability:</p>
            <div class="durability-bar">
                <div class="durability-fill" style={{ width: `${pickDurability()}%`}} />
            </div>
            <p style={{ color: pickDurability() > 80 ? "#fdf6d8" : pickDurability() > 60 ? "gold" : pickDurability() > 40 ? "#ffbf00" : pickDurability() > 20 ? "orange" : "red", margin: "1%" }}>({Math.round(pickDurability())}%)</p>
        </div> */}
        <p style={{ margin: "0" }}>Lockpicks Remaining: <span class="gold" classList={{ "animate-flicker": broke() }} style={{ "--glow-color": "red" }}>{lockpicks()}</span></p>
        <Show when={gameStatus() !== PLAYING}>
            <div class="result modal">
                <div class="border superCenter" style={{ height: "50vh", width: "40vw", "z-index": 2 }}>
                    <div class="center creature-heading wrap">
                    <h1 style={{ "margin-top": "10%" }}>{gameStatus() === SUCCESS ? "The Lock Opened!" : "Your Lockpick(s) Broke!"}</h1><br />
                    {/* <p>A door would now be open, or perhaps your spoils of treasure if you were successful at lockpicking. Still a work in progress!</p> */}
                    {/* <p class="gold">"[Item] [Item] [Item] 1g 50s"</p> */}
                    {/* <div style={font("0.5em")}>[This is automatically saved to your character.]</div> */}
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
                        <h2 class="wrap" style={{ margin: "3% auto" }}>Rotate the <span class="gold">lockpick</span> around, feeling for vibrations of the tumblers setting into place.{" "}
                        Once set, rotate the <span style={{ color: "silver" }}>tension wrench</span> either clockwise or counter in order to attempt to unlock.</h2>
                        <p style={font("1em")}><span style={{ color: "red" }}>Warning: </span>You can break the <span class="gold">lockpick</span> from over rotation when feeling around to set in place. You can also break the <span class="gold">lockpick</span> as you rotate the <span style={{ color: "silver" }}>tension wrench</span>, if not set correctly.</p>
                    </div>
                </div>
            </div>
        </Show>
        {/* <Show when={lockpicks() > 0}>
            <button class="highlight cornerBL" onClick={checkSweetSpot} style={{ color: "green" }}>Tap</button>
        </Show> */}
        <button class="highlight cornerTL" onClick={() => setShowManual(true)} style={{ color: "green" }}>Manual</button>
        <button class="highlight cornerBR" onClick={() => setLockpicking(false)} style={{ color: "red" }}>X</button>
        <button class="highlight cornerTR" onClick={() => setDebugMode(!debugMode())} style={{ color: "teal" }}>Debug</button>
        </div>
    );
};