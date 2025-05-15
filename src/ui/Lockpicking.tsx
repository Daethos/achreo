import { Accessor, createEffect, createSignal, onMount, Setter, Show } from "solid-js";
import Ascean from "../models/ascean";
import Settings from "../models/settings";
import { screenShake } from "../game/phaser/ScreenShake";
import { Store } from "solid-js/store";
import { IRefPhaserGame } from "../game/PhaserGame";
import { font } from "../utility/styling";

const LOCKPICK = {
    Easy: { DIFFICULTY: "Easy", HEALTH: 10, SIZE: 40, ROTATION: 720, PLAYER: 2 },
    Medium: { DIFFICULTY: "Medium", HEALTH: 20, SIZE: 25, ROTATION: 540, PLAYER: 2.5 },
    Hard: { DIFFICULTY: "Hard", HEALTH: 30, SIZE: 15, ROTATION: 360, PLAYER: 3 },
    Master: { DIFFICULTY: "Master", HEALTH: 40, SIZE: 10, ROTATION: 270, PLAYER: 5 },
    Legendary: { DIFFICULTY: "Legendary", HEALTH: 50, SIZE: 5, ROTATION: 180, PLAYER: 10 },
};

export default function Lockpicking({ ascean, settings, setLockpicking, instance }: { ascean: Accessor<Ascean>; settings: Accessor<Settings>; setLockpicking: Setter<boolean>; instance: Store<IRefPhaserGame>; }) {
    const [angle, setAngle] = createSignal(0); // Lockpick rotation (0-360°)
    const [lockDifficulty, setLockDifficulty] = createSignal(LOCKPICK[settings()?.lockpick as keyof typeof LOCKPICK] || LOCKPICK["Easy"]); // Easy/medium/hard
    const [gameStatus, setGameStatus] = createSignal("playing"); // playing/success/fail
    const [sweetSpotStart, setSweetSpotStart] = createSignal(0);
    const [sweetSpotEnd, setSweetSpotEnd] = createSignal(0);
    // const [debugMode, setDebugMode] = createSignal(false); // Toggle debug view
    const [rumble, setRumble] = createSignal(false);
    const [totalRotation, setTotalRotation] = createSignal(0); // Tracks cumulative rotation
    const [pickDurability, setPickDurability] = createSignal(100); // 100% = new pick

    createEffect(() => setLockDifficulty(LOCKPICK[settings()?.lockpick as keyof typeof LOCKPICK] || LOCKPICK["Easy"]));

    const resetLock = (pick: boolean = false) => {
        const size = lockDifficulty().SIZE + ((ascean().achre + ascean().agility) / lockDifficulty().PLAYER);
        const start = Math.floor(Math.random() * (360 - size));
        setSweetSpotStart(start);
        setSweetSpotEnd(start + size);
        if (pick) setPickDurability(100);
        setTotalRotation(0);
        setGameStatus("playing");
    };

    const checkSweetSpot = () => {
        const currentAngle = angle();
        if (currentAngle >= sweetSpotStart() && currentAngle <= sweetSpotEnd()) {
            setGameStatus("success"); // Lock opened!
            if ("vibrate" in navigator && navigator?.vibrate !== undefined) navigator.vibrate([100, 50, 100]);
        } else {
            setPickDurability(prev => Math.max(prev - lockDifficulty().HEALTH, 0));
            if ("vibrate" in navigator && navigator?.vibrate !== undefined) navigator.vibrate(200);
            if (pickDurability() <= 0) {
                setGameStatus("fail"); // Pick broke
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
            setRumble(true);
            const intensity = 1 - normalizedDistance;
            screenShake(instance?.scene as Phaser.Scene, intensity * 50, 0.001); // Tweak multipliers
            setTimeout(() => setRumble(false), 500);
        };
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (gameStatus() !== "playing") return;
        e.preventDefault();
        
        const lockRect = (e.currentTarget as any)?.getBoundingClientRect();
        const centerX = lockRect.left + lockRect.width / 2;
        const centerY = lockRect.top + lockRect.height / 2;
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const ang = Math.atan2(touchY - centerY, touchX - centerX) * (180 / Math.PI);
        
        setPickDurability(prev => Math.max(prev - 0.1, 0));
        setTotalRotation(prev => prev + 1);
        setAngle((ang + 360) % 360); // Convert to 0-360 range

        // Vibrate when pick is stressed (optional)
        if (totalRotation() > lockDifficulty().ROTATION * 0.5 && "vibrate" in navigator && navigator?.vibrate !== undefined) {
            navigator.vibrate(10); // Short pulse
        };

        // Break pick if rotated too much
        if (totalRotation() >= lockDifficulty().ROTATION || pickDurability() === 0) {
            setPickDurability(0);
            setGameStatus("fail");
            if ("vibrate" in navigator && navigator?.vibrate !== undefined) navigator.vibrate(200); // Long buzz
        };
        checkDistance();
    };

    const handleTouchEnd = () => {
        if (settings()?.lockpick !== "Easy") {
            checkSweetSpot();
        };
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
    onMount(() => {
        resetLock();
    });

    return (
        <div class="lockpicking-game border creature-heading" style={{ position: "absolute", left: "25vw", top: "1vh", height: "95vh", width: "50vw", "--glow-color": "teal" }}>
        <h1 style={{ margin: "3% auto" }}>Lockpicking (<span style={{ color: getDifficultyColor(lockDifficulty().DIFFICULTY) }}>{(lockDifficulty().DIFFICULTY)}</span>)</h1>
        <div class="lock" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div class="lock-body">
                <div class="lockpick" style={{ transform: `rotate(${angle()}deg)` }} />
                <div class="keyhole" />
                <div class="tension-wrench" classList={{
                    "animate-flicker": rumble(),
                    "reset-animation": !rumble()
                }} />
            {/* <Show when={debugMode()}>
                <div 
                    class="sweet-spot"
                    style={{
                        top: "50%",
                        left: "50%",
                        height: `50%`,
                        width: `${(sweetSpotEnd() - sweetSpotStart()) / 360 * 200}%`, // because lock is 200px I think is why it neesd this
                        transform: `rotate(${sweetSpotEnd()}deg)`,
                    }}
                />
            </Show> */}
            </div>
        </div>

        <div style={{ display: "inline-flex" }}>
            <p style={{ margin: "1%" }}>Durability:</p>
            <div class="durability-bar">
                <div class="durability-fill" style={{ width: `${pickDurability()}%`}} />
            </div>
            <p style={{ color: pickDurability() > 75 ? "#fdf6d8" : pickDurability() > 50 ? "gold" : pickDurability() > 25 ? "orange" : "red", margin: "1%" }}>{Math.round(pickDurability())}%</p>
        </div>
        <h2 style={{ margin: "2%" }}>Rotate the Pick and Tap to attempt.</h2>
        <Show when={gameStatus() !== "playing"}>
            <div class="result modal">
                <div class="border superCenter" style={{ height: "70vh", width: "40vw" }}>
                    <div class="center creature-heading wrap">
                    <h1 style={{ "margin-top": "10%" }}>{gameStatus() === "success" ? "The lock opened!" : "Your pick broke!"}</h1><br />
                    <p>Here would be your spoils if you were successful in lockpicking. Still a work in progress!</p>
                    <p class="gold">"[Item] [Item] [Item] 1g 50s"</p>
                    <div style={font("0.5em")}>[This is automatically saved to your character.]</div>
                    <button class="highlight cornerBL" onClick={() => resetLock(gameStatus() !== "success")}>{gameStatus() === "success" ? "Unlock Another" : "Try Again"}</button> <br />
                    <button class="highlight cornerBR" onClick={() => setLockpicking(false)} style={{ color: "red" }}>{gameStatus() === "success" ? "Leave Satisfied" : "Give Up"}</button>
                    </div>
                </div>
            </div>
        </Show>
        <button class="highlight cornerBL" onClick={checkSweetSpot} style={{ color: "green" }}>Tap</button>
        <button class="highlight cornerBR" onClick={() => setLockpicking(false)} style={{ color: "red" }}>X</button>
        </div>
    );
};