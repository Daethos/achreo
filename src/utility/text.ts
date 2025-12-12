import { EventBus } from "../game/EventBus";
import { Combat } from "../stores/combat";
const ATTACKS = ["Attack", "Posture", "Roll", "Parry", "attack", "posture", "roll", "parry", "attacks", "rolls", "postures", "parries", "parried", "rolled", "attacked", "defend", "postured", "stunned",
    "tshaer", "tshaers", "tshaering", "leap", "leaps", "rush", "rushes", "writhe", "writhes", "writhing", "devour", "devours", "storm", "storming", "storms", "thrust", "thrusts", "Hooks", "hooks", "quorse", "quorses"];
const QUALITIES = ["(Critical)", "(Glancing)", "Critical)"];
const CAST = ["chiomic", "confuse", "confusing", "fear", "fearing", "freezes", "multifare", "paralyze", "paralyzes", "polymorph", "polymorphs", "polymorphing", "slow", "slowing", "shirk", "shimmers", "snare", "snares", "snaring", "sprint", "warps"];
const COLORS = { BONE: "#fdf6d8", GREEN: "green", HEAL: "#0BDA51", GOLD: "gold", PURPLE: "purple", TEAL: "teal", RED: "red", BLUE: "blue", LIGHT_BLUE: "lightblue", FUCHSIA: "fuchsia" };
const DAMAGE = ["Blunt", "Pierce",  "Slash",  "Earth", "Fire",  "Frost", "Lightning", "Righteous", "Sorcery", "Spooky", "Wild", "Wind"];
const HEALS = ["heal", "heals", "reconstitutes"];
const HUSH = ["envelops", "Invocation", "Hush", "hush", "moderate", "tendril", "shimmer", "shimmers", "protect", "protects", "astrave", "fyerus", "suture", "sutures", "sacrifice", "sacrifices", "wards"];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const TENDRIL = ["flays", "tendril", "tendrils", "suture", "sutures", "sutured", "shield", "shields", "mend", "achire", "kynisos", "quorse"];
const PRAYERS = ["desperation", "sacrifices", "slowing", "sutures", "Gift"];
const CRITICAL = "Critical";
const GLANCING = "Glancing";
const PARTIAL = "Partial";
const CONSOLE = "Console";
const PROVIDENCE = "Providence";
const ERROR = "Error";
const WARNING = "Warning";
export const text = (prev: string, data: Combat) => {
    let oldText: any = prev !== undefined ? prev : undefined;
    let newText: any = "";
    if (data.playerStartDescription !== "") newText += data.playerStartDescription + "\n";
    if (data.computerStartDescription !== "") newText += data.computerStartDescription + "\n";
    if (data.playerSpecialDescription !== "") newText += data.playerSpecialDescription + "\n";
    if (data.computerSpecialDescription !== "") {
        hud(data.computerSpecialDescription, "special");
        newText += data.computerSpecialDescription + "\n";
    };
    if (data.playerActionDescription !== "") newText += data.playerActionDescription + "\n";
    if (data.computerActionDescription !== "") {
        hud(data.computerActionDescription, "action");
        newText += data.computerActionDescription + "\n";
    }; 
    if (data.playerInfluenceDescription !== "") newText += data.playerInfluenceDescription + "\n";
    if (data.playerInfluenceDescriptionTwo !== "") newText += data.playerInfluenceDescriptionTwo + "\n";
    if (data.computerInfluenceDescription !== "") newText += data.computerInfluenceDescription + "\n";
    if (data.computerInfluenceDescriptionTwo !== "") newText += data.computerInfluenceDescriptionTwo + "\n";
    if (data.playerDeathDescription !== "") newText += data.playerDeathDescription + "\n";
    if (data.computerDeathDescription !== "") newText += data.computerDeathDescription + "\n";
    if (newText !== "") {
        newText = styleText(newText);
        oldText += newText;
    };
    return oldText;
};
const hud = (text: string, type: string) => {
    // console.log({text, type});
    if (!text) return;
    let realType = type;
    let append = "Cast";
    let newText = text.split(".")[0].split(" ")
        .filter((t: string) => {
            if (type === "special" && PRAYERS.includes(t)) {
                append = "Prayer";
            };
            if (type === "special" && (t.includes("leaps") || t.includes("parried"))) {
                realType = "action";
            };
            return ATTACKS.includes(t) || QUALITIES.includes(t) 
                || HUSH.includes(t) || TENDRIL.includes(t) 
                || CAST.includes(t) || HEALS.includes(t) || PRAYERS.includes(t)
        })
        .join(" ");
    newText = realType === "special" ? `${append} ${newText}` : newText;
    // console.log({newText});
    EventBus.emit("hud-text", newText);
};
export const partyText = (prev: string, data: { text: string; }) => {
    let oldText: any = prev !== undefined ? prev : undefined;
    let newText: any = "";
    if (data.text) newText += data.text + "\n";
    if (newText !== "") {
        newText = styleText(newText, true);
        oldText += newText;
    };
    return oldText;
};
function checkNumber(line: string[]) {
    for (let i = 0; i < line.length; i++) {
        if (HEALS.includes(line[i])) { 
            return "GREEN";
        } else if (ATTACKS.includes(line[i]) || HUSH.includes(line[i])) { 
            return "RED";
        };
    };
    return "GOLD";
};
function checkAlignment(line: string[]) {
    let count = 0;
    for (let i = 0; i < line.length; i++) {
        if (line[i].includes("You")) { 
            count++;
        } else if (line[i].includes("defeated") || line[i].includes("Providence") || line[i].includes("Resetting") || line[i].includes("Console") || line[i].includes("Warning") || line[i].includes("Error") || line[i].includes("Initial")) {
            return "center";
        };
    };
    if (count > 0) return "left";
    return "right";
};
function styleText(text: string, party?: boolean) {
    var numberCheck: string[] = [];
    const style = (t: string) => { 
        const numCheck = t.split("").find((c: string) => NUMBERS.includes(parseInt(c)));
        const isNumber = numCheck !== undefined;
        const isAttack = ATTACKS.includes(t);
        const isCast = CAST.includes(t);
        const isDamage = DAMAGE.includes(t);
        const isHeal = HEALS.includes(t);
        const isHush = HUSH.includes(t);
        const isTendril = TENDRIL.includes(t);
        const isCritical = t.includes(CRITICAL);
        const isGlancing = t.includes(GLANCING);
        const isPartial = t.includes(PARTIAL);
        const isConsole = t.includes(CONSOLE);
        const isProvidence = t.includes(PROVIDENCE);
        const isError = t.includes(ERROR);
        const isWarning = t.includes(WARNING);
        const lush = isAttack === true || isCast === true || isNumber === true || isHush === true || isTendril === true;
        const fontWeight = isNumber ? 700 : "normal";
        const fontSize = lush ? "0.7em" : "0.6em";
        const newLine = t === "\n" ? "<br>" : t;
        const style = (isGlancing || isCritical || lush || isPartial) ? "italic" : "normal";
        numberCheck.push(newLine);
        const numType = checkNumber(numberCheck);
        const color = 
            (isCast || isConsole) ? COLORS.BLUE :
            isDamage ? COLORS.TEAL :
            isNumber ? COLORS[numType as keyof typeof COLORS] : 
            (isHeal || isProvidence) ? COLORS.HEAL :
            isGlancing ? COLORS.LIGHT_BLUE : 
            isTendril ? COLORS.PURPLE : 
            (isAttack || isCritical || isPartial || isError) ? COLORS.RED : 
            isHush ? COLORS.FUCHSIA :
            isWarning ? COLORS.GOLD :
            COLORS.BONE;
        const line = `<span style="color: ${color}; font-style: ${style}; font-weight: ${fontWeight}; font-size: ${fontSize}; margin: 0 auto;">${newLine}</span>`;
        return line;
    };
    const lines = text.split("\n").map(line => {
        const styledLine = line.split(" ").map(t => style(t)).join(" ");
        const alignment = party ? "left" : checkAlignment(line.split(" "));
        return `<div style="text-align: ${alignment};">${styledLine}</div>`;
    }).join("");
    return lines;
};