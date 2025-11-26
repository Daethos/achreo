import { Item } from "../../models/item";

export const ITEMS: Item[] = [
    { /* ------------------------------------------------- TOOLS ----------------------------------------------------- */
        _id: "",
        name: "Lockpick",
        description: "A small, slender tool used to unlock contraptions without a key.",
        type: "Tool",
        imgUrl: "../assets/images/lockpick.png",
        quantity: 1,
        effects: [],
        isConsumable: false,
        isQuestItem: false,
        isSellable: true,
        isUnique: false,
        value: 0.1, // 10 Silver, per item, so quantity 10 would be 1 Gold,
        weight: 0.01, // 0.01 lbs per item, 1/100th
        rarity: "Common",
        maxStack: 50,
        // systemTrigger: "" // This is a mini-game and handled in-game
    },{
        _id: "",
        name: "Tension Wrench",
        description: "A small tool used to apply tension to locks while picking them.",
        type: "Tool",
        imgUrl: "../assets/images/tension_wrench.png",
        quantity: 1,
        effects: [],
        isConsumable: false,
        isQuestItem: false,
        isSellable: true,
        isUnique: true,
        value: 1, // 1 Gold
        weight: 0.01, // 0.01 lbs, 1/100th
        rarity: "Common",
        // systemTrigger: "" // This is a mini-game and handled in-game

    },{
        _id: "",
        name: "Net",
        description: "A sturdy net used to capture dead bodies for transport.",
        type: "Tool",
        imgUrl: "../assets/images/net.png",
        quantity: 1,
        effects: [],
        isConsumable: false,
        isQuestItem: false,
        isSellable: true,
        isUnique: true,
        value: 1, // 1 Gold
        weight: 3, // 3 lbs
        rarity: "Common",
        // systemTrigger: "" // This is physics based and handled in-game
    },{
        _id: "",
        name: "Tree Tap",
        description: "A tap to collect sap from trees. Different saps may have different properties.",
        type: "Tool",
        imgUrl: "../assets/images/tree_tap.png",
        quantity: 1,
        effects: [],
        isConsumable: false,
        isQuestItem: true, // May be false, not sure if using it will be an initial quest
        isSellable: true,
        isUnique: true,
        value: 1, // 1 Gold
        weight: 1, // 1 lb
        rarity: "Common",

        // systemTrigger: "" // Don’t think this is necessary, unless systemTrigger becomes a sort of use insofar as checking for an allowance of in-game behavior, i.e. tapping a tree for sap
    },{
        _id: "",
        name: "Marker",
        description: "A hardened, flat piece of petrified wood. Good for inscription.",
        type: "Tool",
        imgUrl: "../assets/images/marker.png",
        quantity: 1,
        effects: [],
        isConsumable: false,
        isQuestItem: false,
        isSellable: true,
        isUnique: false,
        value: 0.25, // 25 Silver
        weight: 1, // 1 lb
        rarity: "Common",
        maxStack: 10,
        systemTrigger: "marker" // Brings up form to create title and content of marker you leave in the world
    // }, { /* ------------------------------------- RITUAL COMPONENT (UNIQUE) ----------------------------------------------- */

    // }, { /* -------------------------------------------- CONSUMABLES ------------------------------------------------------ */

    }
];