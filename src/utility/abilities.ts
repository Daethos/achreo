import { Accessor } from "solid-js";
import Settings from "../models/settings";
import { EventBus } from "../game/EventBus";
import Ascean from "../models/ascean";

export function addStance(settings: Accessor<Settings>, stance: "caerenic" | "stealth") {
    let newSettings = JSON.parse(JSON.stringify(settings()));
    if (newSettings.stances[stance]) return;

    newSettings.stances[stance] = true;

    setTimeout(() => {
        EventBus.emit("save-this-setting", { stances: newSettings.stances });
        EventBus.emit("add-stance", stance);    
    }, 1000);
};

export function addSpecial(ascean: Accessor<Ascean>, settings: Accessor<Settings>, newSpecial: string) {
    let totalSpecials = JSON.parse(JSON.stringify(settings().totalSpecials));
    if (totalSpecials.includes(newSpecial)) return;

    totalSpecials.push(newSpecial);

    let specials = JSON.parse(JSON.stringify(settings().specials));
    if (specials.length < 5 && specials.length < ascean().level) specials.push(newSpecial);

    setTimeout(() => {
        EventBus.emit("save-this-setting", { totalSpecials, specials });
        EventBus.emit("reorder-buttons", { list: specials, type: "special" }); 
    }, 1000);
};

export const ACTIONS = Object.freeze(["Attack", "Posture", "Roll", "Dodge", "Hurl", "Jump", "Parry", "Thrust"]);
export const SPECIALS = [
    "Invoke",
    "Consume",
    "Absorb",
    "Achire",
    "Astrave",
    "Astrication", // Trait
    "Arc",
    "Berserk", // Trait
    "Blind", // Trait
    "Blink",
    "Chiomic",
    "Chiomism",
    "Caerenesis", // Trait
    "Confuse",
    "Conviction", // Trait
    "Desperation",
    "Devour", // Trait
    "Disease",
    "Dispel",
    "Endurance", // Trait
    "Envelop",
    "Fear",
    "Freeze",
    "Frost",
    "Fyerus",
    "Grappling Hook",
    "Healing",
    "Hook",
    "Howl",
    "Ilirech",
    "Impermanence", // Trait
    "Kynisos",
    "Kyrisian",
    "Kyrnaicism",
    "Leap",
    "Lightning",
    "Likyr",
    "Maiereth",
    "Malice",
    "Mark",
    "Menace",
    "Mend",
    "Moderate",
    "Multifarious",
    "Mystify",
    "Netherswap",
    "Paralyze",
    "Polymorph",
    "Protect",
    "Pursuit",
    "Recall",
    "Quor",
    "Reconstitute",
    "Recover",
    "Rein",
    "Renewal",
    "Root",
    "Rush",
    "Sacrifice",
    "Scream",
    "Seer", // Trait
    "Shadow",
    "Shield",
    "Shimmer",
    "Shirk",
    "Slow",
    "Snare",
    "Sprint",
    "Stimulate", // Trait
    "Storm",
    "Suture",
    "Tether",
    "Ward",
    "Writhe",
]; // "Charm", "Shroud"
export const SPECIAL: {[key:string]: string[]} = { // 14 Each + Invoke, Consume, Mark, Recall
    "constitution": [
        "Invoke",
        "Consume",
        "Mark",
        "Recall",
        "Netherswap",

        "Desperation",
        "Healing",
        "Reconstitute",

        "Absorb",
        "Disease",
        "Dispel",
        "Grappling Hook",
        "Hook",
        "Ilirech",
        "Kyrnaicism",
        "Kynisos",
        "Kyrisian",
        "Lightning",
        "Likyr",
        "Mend",
        "Paralyze",
        "Renewal",
        "Sacrifice",
        "Shield",
        "Shirk",
        "Suture",
        "Tether",
        "Ward"
    ], 
    "strength": [
        "Invoke",
        "Consume",
        "Mark",
        "Recall",
        
        "Desperation",
        "Healing",
        "Reconstitute",

        "Arc",
        "Grappling Hook",
        "Hook",
        "Howl",
        "Ilirech",
        "Leap",
        // "Quor",
        "Recover",
        "Rush",
        "Scream",
        "Shield",
        "Sprint",
        "Storm",
        "Tether",
        "Ward",
        "Writhe"
    ],
    "agility": [
        "Invoke",
        "Consume",
        "Mark",
        "Recall",
        
        "Desperation",
        "Healing",
        "Reconstitute",

        // "Achire",
        "Envelop",
        "Grappling Hook",
        "Hook",
        "Kynisos",
        "Leap",
        "Pursuit",
        "Recover",
        "Rush",
        "Shadow",
        "Shimmer",
        "Shirk",
        "Snare",
        "Sprint",
        "Storm",
        "Writhe"
    ],
    "achre": [
        "Invoke",
        "Consume",
        "Mark",
        "Recall",
        "Netherswap",
        
        "Desperation",
        "Healing",
        "Reconstitute",

        "Absorb",
        "Achire",
        "Astrave",
        "Blink",
        "Dispel",
        "Freeze",
        "Frost",
        "Fyerus",
        "Lightning",
        "Moderate",
        "Multifarious",
        "Polymorph",
        "Quor",
        "Rein",
        "Sacrifice",
        "Slow",
        "Snare"
    ], 
    "caeren": [
        "Invoke",
        "Consume",
        "Mark",
        "Recall",
        
        "Desperation",
        "Healing",
        "Reconstitute",

        "Achire",
        "Astrave",
        "Blink",
        "Dispel",
        "Fear",
        "Fyerus",
        "Ilirech",
        "Kyrnaicism",
        "Maiereth",
        "Malice",
        "Menace",
        "Mend",
        "Rein",
        "Sacrifice",
        "Scream",
        "Shirk",
        "Suture"
    ],
    "kyosir": [
        "Invoke",
        "Consume",
        "Mark",
        "Recall",
        "Netherswap",
        
        "Desperation",
        "Healing",
        "Reconstitute",

        "Blink",
        "Chiomic",
        "Chiomism",
        "Confuse",
        "Disease",
        "Dispel",
        "Fyerus",
        "Grappling Hook",
        "Hook",
        "Ilirech",
        "Kynisos",
        "Kyrnaicism",
        "Lightning",
        "Malice",
        "Mystify",
        "Protect",
        "Rein",
        "Sacrifice",
        "Shirk",
        "Suture"
    ],
};

export const STARTING_SPECIALS: {[key:string]: string[]} = {
    "constitution": ["Healing"],
    // "constitution": ["Healing", "Kyrnaicism", "Likyr", "Renewal", "Shield"],
    "strength": ["Desperation"],
    // "strength": ["Arc", "Desperation", "Howl", "Leap", "Storm"],
    "agility": ["Recover"],
    // "agility": ["Pursuit", "Recover", "Rush", "Shimmer", "Sprint"],
    "achre": ["Absorb"],
    // "achre": ["Absorb", "Achire", "Blink", "Frost", "Polymorph"],
    "caeren": ["Mend"],
    // "caeren": ["Fear", "Maiereth", "Mend", "Scream", "Suture"],
    "kyosir": ["Reconstitute"],
    // "kyosir": ["Chiomism", "Confuse", "Malice", "Reconstitute", "Sacrifice"],
};

export const STARTING_MASTERY_UI = {
    "constitution": {
        "leftJoystick": {
            "base": 0x000000,
            "thumb": 0xfdf6d8
        },
        "rightJoystick": {
            "base": 0x000000,
            "thumb": 0xfdf6d8
        },
        "actionButtons": {
            "border": 0xb8a30b,
            "color": 0x000000
        },
        "specialButtons": {
            "border": 0xfdf6d8,
            "color": 0x000000
        }
    },
    "strength": {
        "leftJoystick": {
            "base": 0x000000,
            "thumb": 0xff0000
        },
        "rightJoystick": {
            "base": 0x000000,
            "thumb": 0xff0000
        },
        "actionButtons": {
            "border": 0x301934,
            "color": 0x000000
        },
        "specialButtons": {
            "border": 0xff0000,
            "color": 0x000000
        }
    },
    "agility": {
        "leftJoystick": {
            "base": 0x000000,
            "thumb": 0x00ff00
        },
        "rightJoystick": {
            "base": 0x000000,
            "thumb": 0x00ff00
        },
        "actionButtons": {
            "border": 0x191970,
            "color": 0x000000
        },
        "specialButtons": {
            "border": 0x00ff00,
            "color": 0x000000
        }
    },
    "achre": {
        "leftJoystick": {
            "base": 0x000000,
            "thumb": 0x0000ff
        },
        "rightJoystick": {
            "base": 0x000000,
            "thumb": 0x0000ff
        },
        "actionButtons": {
            "border": 0x355E3B,
            "color": 0x000000
        },
        "specialButtons": {
            "border": 0x0000ff,
            "color": 0x000000
        }
    },
    "caeren": {
        "leftJoystick": {
            "base": 0x000000,
            "thumb": 0x800080
        },
        "rightJoystick": {
            "base": 0x000000,
            "thumb": 0x800080
        },
        "actionButtons": {
            "border": 0x8B0000,
            "color": 0x000000
        },
        "specialButtons": {
            "border": 0x800080,
            "color": 0x000000
        }
    },
    "kyosir": {
        "leftJoystick": {
            "base": 0x000000,
            "thumb": 0xFFD700
        },
        "rightJoystick": {
            "base": 0x000000,
            "thumb": 0xFFD700
        },
        "actionButtons": {
            "border": 0xd9d9d9,
            "color": 0x000000
        },
        "specialButtons": {
            "border": 0xFFD700,
            "color": 0x000000
        }
    },
};

export const TRAIT_SPECIALS: {[key:string]: string[]} = {
    "Astral": ["Astrication", "Devour"],
    "Cambiren": ["Astrication", "Caerenesis"],
    "Chiomic": ["Devour"],
    "Fyeran": ["Caerenesis", "Seer"],
    "Ilian": ["Blind", "Devour"],
    "Kyn'gian": ["Conviction", "Endurance"],
    "Kyr'naic": ["Stimulate"],
    "Ma'anreic": ["Blind"],
    "Sedyrist" : ["Astrication", "Stimulate"],
    "Se'van": ["Berserk", "Seer"],
    "Shaorahi": ["Caerenesis", "Conviction"],
    "Shrygeian": ["Impermanence", "Charm"],
    "Tshaeral": ["Berserk", "Devour"],
};

export const TRAITS = ["Astrication", "Caerenesis", "Seer", "Blind", "Endurance", "Stimulate", "Berserk", "Conviction", "Impermanence", "Devour", "Charm"];

export const BOW = "bow";
export const NOBOW = "noBow";

export const ATTACK = "attack";
export const DODGE = "dodge";
export const JUMP = "jump";
export const PARRY = "parry";
export const POSTURE = "posture";
export const ROLL = "roll";
export const THRUST = "thrust";

export const INVOKE = "Invoke";
export const CONSUME = "Consume";
export const ABSORB = "Absorb";
export const ACHIRE = "Achire";
export const ASTRAVE = "Astrave";
export const ASTRICATION = "Astrication";
export const ARC = "Arc";
export const BERSERK = "Berserk";
export const BLIND = "Blind";
export const BLINK = "Blink";
export const CHARM = "Charm";
export const CHIOMIC = "Chiomic";
export const CHIOMISM = "Chiomism";
export const CAERENESIS = "Caerenesis";
export const CONFUSE = "Confuse";
export const CONVICTION = "Conviction";
export const DESPERATION = "Desperation";
export const DEVOUR = "Devour";
export const DISEASE = "Disease";
export const DISPEL = "Dispel";
export const ENDURANCE = "Endurance";
export const ENVELOP = "Envelop";
export const FEAR = "Fear";
export const FREEZE = "Freeze";
export const FROST = "Frost";
export const FYERUS = "Fyerus";
export const GRAPPLE = "Grappling Hook";
export const HEALING = "Healing";
export const HOOK = "Hook";
export const HOWL = "Howl";
export const ILIRECH = "Ilirech";
export const IMPERMANENCE = "Impermanence";
export const KYNISOS = "Kynisos";
export const KYRISIAN = "Kyrisian";
export const KYRNAICISM = "Kyrnaicism";
export const LEAP = "Leap";
export const LIGHTNING = "Lightning";
export const LIKYR = "Likyr";
export const MAIERETH = "Maiereth";
export const MALICE = "Malice";
export const MARK = "Mark";
export const MENACE = "Menace";
export const MEND = "Mend";
export const MODERATE = "Moderate";
export const MULTIFARIOUS = "Multifarious";
export const MYSTIFY = "Mystify";
export const NETHERSWAP = "Netherswap";
export const PARALYZE = "Paralyze";
export const POLYMORPH = "Polymorph";
export const PROTECT = "Protect";
export const PURSUIT = "Absorb";
export const RECALL = "Recall";
export const QUOR = "Quor";
export const RECONSTITUTE = "Reconstitute";
export const RECOVER = "Recover";
export const REIN = "Rein";
export const RENEWAL = "Renewal";
export const ROOT = "Root";
export const RUSH = "Rush";
export const SACRIFICE = "Sacrifice";
export const SCREAM = "Scream";
export const SEER = "Seer";
export const SHADOW = "Shadow";
export const SHIELD = "Shield";
export const SHIMMER = "Shimmer";
export const SHIRK = "Shirk";
export const SLOW = "Slow";
export const SNARE = "Snare";
export const SPRINT = "Sprint";
export const STIMULATE = "Stimulate";
export const STORM = "Storm";
export const SUTURE = "Suture";
export const TETHER = "Tether";
export const WARD = "Ward";
export const WRITHE = "Writhe";