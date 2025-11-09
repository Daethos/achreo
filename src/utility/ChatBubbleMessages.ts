export type NPC_MESSAGES = {
    stages: {
        [key: string]: {
            messages: string[];
            nextStage: string | undefined; // When this stage is completed, progress to next stage
            specials?: ({key: string; value: string;} | {})[];
            unlockConditions: { // Conditions to unlock this stage (empty = always available)
                playerCompleted?: string[]; // Condition(s) that must be met to attain this stage of dialogue
                execute?: string[]; // EventBus.emit(execute) on completion
            };
        };
    };
    ambient?: {
        [category: string]: string[];
    };
};

export const MESSAGES: {[key: string]: NPC_MESSAGES} = {
    "Tutorial Teacher": {
        stages: {
            welcome: { // also movement for tutorial by necessity
                messages: [
                    `Welcome, {name}. I am your guide {speaker.name}, tasked with attempting to teach you everything you need to know to journey in this game.`,
                    `As you have noticed ... I'm tinted blue, marking me as a friendly, non-combatant character.`,
                    "Never fear seeing one like myself in this world. We are here of our own volition, and are not interested in antagonism.",
                    // "You may also press the dialog button (3 masks) in the bottom right corner to have a more in-depth conversation.",
                    "Allow yourself some time to adjust to this movement pattern, activated by moving your left joystick.",
                    "Your movement will get better in the days ahead, learning how to out maneuver opponents and become impossible to strike.",
                    "Head East toward the next area. Or, if you feel you're experienced, head north to the cave and begin your journey.",
                ],
                specials: [{}, {}, {}, {key:"highlight", value: "joystick-left"}], // {key: "highlight", value: "smallhud"} idx3
                nextStage: "settings",
                unlockConditions: {
                    playerCompleted: []
                }
            },
            settings: {
                messages: [
                    "Excellent! You've figured out how to use the joystick and navigate, you're about ready to conquer this world.",
                    "In the top left is your combat hud, containing your name, health, stamina, and weapon. These are interactive for more information.",
                    "Others can alter gameplay information displays or open information and menu systems.",
                    "Next, learn to customize your experience with the settings! The player icon (with heart and mind) in the bottom right.",
                    "Opening up this menu system will allow you to understand everything about this game, its capabilities and yours.",
                    "From configuring your button selection, to how enemies of this world view you and each other.",
                    "Other options include: combat settings, combat logs, resetting the cursor, pause (the game), and toggling its visibility.",
                    "After you're satisfied, continue your journey South, to learn more about this world's combat."
                ],
                specials: [{}, {key: "combatHud", value: ""}, {key: "combatHud", value: ""}, {key: "highlight", value: "smallhud"}, {key: "highlight", value: "smallhud"}],
                nextStage: "combat",
                unlockConditions: {
                    playerCompleted: [] // "welcome" // Player finished movement section
                }
            },
            combat: {
                messages: [
                    "Perfect! With the controls to your liking, you're ready for combat. Well ... possibly.",
                    "Your physical actions are all that is available in the beginning, but is more than enough to tackle your enemies.", 
                    "Physically, everyone is capable of swinging their weapon and shooting projectiles, in addition to forms of evasion with dodge and roll.",
                    "Your right joystick will capture your conceptual gaze, and where you manually aim your ranged attacks and eventually, specials.",
                    "When dealing with enemies, they're quite easy to spot as they are tinted red ... as you will soon see.",
                    "You won't have a training dummy ... but they're about as close as you will get.",
                    // "I would be beleaguered if you actually fail to defeat them, as I have been assured it's nigh impossible.",
                    // "Unless of course you stand idly by and allow them to vanquish you, which is your prerogrative. I don't judge.",
                    // "I do actually, and would be rather disappointed you didn't participate and take your training more seriously.",
                    // "At the very least give me a heads up and allow me to place a wager against you. May as well make the most of things.",
                    "Nevertheless, prepare for combat, {name}, you can't hope to stay level {level} and win the Ascea.",
                    "You may end up fighting against the likes of myself ... (level {speaker.level}), so I suggest you get started."
                ],
                nextStage: "resolution",
                specials: [{}, {key: "highlight", value: "action-bar"}, {key: "highlight", value: "action-bar"}, {key: "highlight", value: "joystick-right"}],
                unlockConditions: {
                    playerCompleted: [], // "settings"
                    execute: ["fetch-tutorial-enemy"]
                }
            },
            resolution: {
                messages: [
                    "Powerful, you survived, I hope it wasn't too much trouble, though ... you are at {health.current} health right now.",
                    "Seems quite low to me ({speaker.name} has {speaker.health.max} health, forgive him and his great constitution).", 
                    "But you do have a flask that'll aid in revitalizing you, which is in your player menu's inventory section.",
                    "Either way, you won't need be worried about any more enemies ... less you wander back into the fray.",
                    "Venture North and I'll meet you there, I have a couple more concepts for you to familiarize yourself with.",
                ],
                nextStage: "improvement", 
                unlockConditions: {
                    playerCompleted: [], // "combat"
                }
            },
            improvement: {
                messages: [
                    // "Greetings once more, now is the time to discover the power of equipment and improvement.",
                    "When defeating enemies, you have the chance of getting improved loot relative to your current garb.", 
                    "Merchants also sell multitudes of armor, weapons, and jewelry, some specialized and others more general in their wares.",
                    "Treasure chests are also abound in this world, for reasons I cannot explain ... nor fathom.",
                    "I have supplied for you lockpicks which will be the standard tool to combat these foes.",
                    "Most locks you encounter in this world are fairly standard, and the manual itself is short and sweet.",
                    // "No need for me to ramble on and explain... ahem. But yes, once you gather its treasures--",
                    "Once you gather its treasures, be sure to check your inventory and see if they are to your liking.",
                    "Afterwards, your venture in this circuit will come close to its end--complete the path and see me once more when you are finished."
                ],
                nextStage: "final",
                unlockConditions: {
                    playerCompleted: [], // "resolution"
                    execute: ["fetch-treasure-chest"]
                }
            },
            final: {
                messages: [
                    "Well, well, well. You thought you could escape me. You thought you outmaneuvered me. And where did it bring you?",
                    "BACK TO THE BEGINNING, {name.toUpperCase()}! ... ... Nifty little circuit, eh?",
                    "Which makes my job easier, since instead of chasing you down, I can get you in shape, {sex.toLowerCase()}.",
                    "You're becoming quite the adventurer already, though you still appear a vagrant. I don't judge, we all start somewhere.",
                    "Back to serious matters ... to the North you have your exit to this world, where you take with you all you've learned--",
                    "Regardless of how well the lessons have stuck and how quick you are to think broadly in any scenario.",
                    "South of here is an arena, which you can enter if you're feeling frisky. Beware, however--",
                    "This will be an engagement with multiple opponents in a free-for-all.",
                    "But how better to understand what the Ascea will entail, than getting a taste of it now?"
                ],
                nextStage: "arena",
                unlockConditions: {
                    playerCompleted: [] // "improvement"
                }
            },

            // ... more stages
            arena: {
                messages: [
                    "Magnificent! I love that you're adventurous enough to see what an arena will be like.",
                    "Hopefully you carry all the knowledge an adventurer and warrior needs to survive.",
                    "Prepare, {name}. And don't forget to enjoy yourself, they're still quite novice and easy to defeat."
                ],
                nextStage: "welcome", // End of progression
                unlockConditions: {
                    playerCompleted: [], // "final"
                    execute: ["fetch-arena-combat"]
                }
            },
            
            // Random chirps that can play anytime (not progression-based)
        },
        // ambient: {
        //     encouragement: [
        //         "Keep practicing - every master was once a beginner!",
        //         "You're doing great! Don't hesitate to ask if you need help.",
        //         "Progress takes time, but you're on the right path!"
        //     ],
        //     observations: [
        //         "Many adventurers start their journey here...",
        //         "I've trained heroes who went on to do great things.",
        //         "The world beyond these grounds is vast and full of wonder."
        //     ]
        // }
    },
    /* NEW NPC DIALOGUE */
};