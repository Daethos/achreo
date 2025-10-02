import { DISTANCE } from "../../utility/enemy";
import Enemy from "../entities/Enemy";
import Party from "../entities/PartyComputer";
import { States } from "./StateMachine";

export type CacheDirection = {
    x: number;
    y: number;
    lengthSq: number;
    ogLengthSq: number;
    normal: boolean;
    normalize: () => CacheDirection;
};

export type CombatContext = {
    direction: CacheDirection;
    multiplier: number;
    distanceY: number;
    climbingModifier: number;
    allies: (Enemy | Party)[];
    isTargetRanged: boolean;
    lineOfSight: boolean;
    // closestAllyDistanceSq: number;
    // targetHealthPct: number;
    // isTargetGrouped: boolean;
    // environmentalHazardsNearby: boolean;
};

export type MindState = {
    healPriority: number;
    keepDistance: boolean;
    chaseThresholdSq: number;
    minDistanceSq: number;
    callHelp: boolean;
    summon: boolean;
    activations: number;
    startup?: (self: Enemy | Party, ctx: CombatContext) => void;
    customEvaluate?: (self: Enemy | Party, ctx: CombatContext) => void;
    dynamicSwap?: (self: Enemy | Party, ctx: CombatContext) => void;
    // preferredTargets?: string[];
    // riskTolerance?: number;
};

export const MindStates: {[key:string]: MindState;} = {
    Duelist: {
        healPriority: 0,
        keepDistance: false,
        chaseThresholdSq: (DISTANCE.CHASE * DISTANCE.RANGED_MULTIPLIER) ** 2,
        minDistanceSq: DISTANCE.ATTACK ** 2,
        callHelp: false,
        summon: false,
        activations: 0,
        startup: undefined,
        customEvaluate: undefined,
        dynamicSwap: undefined
    },
    
    Battlemage: {
        healPriority: 0,
        keepDistance: false,
        chaseThresholdSq: (DISTANCE.CHASE * 1.2) ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 1.2) ** 2,
        callHelp: false,
        summon: false, // true
        activations: 0,
        startup: (self, ctx) => {
             if (!self.isCaerenic && (self.inCombat || self.inComputerCombat)) {
                // console.log("%c Battlemage: Becoming Caerenic", "color:#00f");
                self.caerenicUpdate(true);
            };
        },
        customEvaluate: (self, ctx) => {
            if (ctx.direction.ogLengthSq > self.mindState.minDistanceSq && Math.random() > 0.995) {
                // console.log("%c Battlemage: Choosing a Ranged Blast", "color:#00f");
                self.mindState.activations++;
                self.rangedBlast();
            };
        },
        dynamicSwap: (self, ctx) => {
            if (self.mindState.activations > 25) {
                const mastery = self.ascean.mastery;
                if (self.isRanged && self.computerCombatSheet.computerWeapons?.[0]?.grip === "One Hand" && (mastery.includes("achre") || mastery.includes("kyosir"))) {
                    // console.log("%c Battlemage: Switching to Sorcerer", "color:#00f");
                    if (self.isCaerenic) self.caerenicUpdate(false);
                    self.setMindState("Sorcerer");
                } else if ((ctx.direction.ogLengthSq > self.mindState.minDistanceSq || self.health / self.ascean.health.max < 0.4) && mastery.includes("constitution")) {
                    // console.log("%c Battlemage: Switching to Priest", "color:#00f");
                    if (self.isCaerenic) self.caerenicUpdate(false);
                    self.setMindState("Priest");
                };
            };
        },
    },

    Berserker: {
        healPriority: 0,
        keepDistance: false,
        chaseThresholdSq: DISTANCE.CHASE ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 0.9) ** 2,
        callHelp: false,
        summon: false,
        activations: 0,
        startup: (self, ctx) => {
             if (!self.isCaerenic && (self.inCombat || self.inComputerCombat)) {
                // console.log("%c Berserker: Becoming Caerenic", "color:#f00");
                self.caerenicUpdate(true);
            };
        },
        customEvaluate: (self, ctx) => {
            if (Math.random() > 0.9 && ctx.direction.ogLengthSq > self.mindState.minDistanceSq ** 2) {
                // console.log("%c Berserker: Charging Tether", "color:#f00");
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.TETHER);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.TETHER);
                };
            } else if (Math.random() > 0.9 && ctx.direction.ogLengthSq > self.mindState.minDistanceSq ** 2) {
                // console.log("%c Berserker: Setting Leap", "color:#f00");
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.LEAP);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.LEAP);
                };
            };
        },
        dynamicSwap: (self, ctx) => {
            const grip = self.computerCombatSheet.computerWeapons?.[0]?.grip;
            if (grip === "One Hand") {
                // console.log("%c Berserker: Switching to Stalwart", "color:#f00");
                if (self.isCaerenic) self.caerenicUpdate(false);
                self.setMindState("Stalwart");
            };
        }
    },

    Commander: {
        healPriority: 0.3,
        keepDistance: false,
        chaseThresholdSq: (DISTANCE.CHASE * 1.2) ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 1.3) ** 2,
        callHelp: true,
        summon: false, // true
        activations: 0,
        startup: (self, ctx) => {
            const grip = self.computerCombatSheet.computerWeapons?.[0]?.grip;
            if (!self.isStalwart && grip === "One Hand") {
                // console.log("%c Commander: Becoming Stalwart", "color:#ff0");
                self.stalwartUpdate(true);
            };
            if (!self.isCaerenic && grip === "Two Hand" && (self.health / self.ascean.health.max > 0.5) && (self.inCombat || self.inComputerCombat)) {
                // console.log("%c Commander: Becoming Caerenic", "color:#ff0");
                self.caerenicUpdate(true);
            };
        },
        customEvaluate: (self, ctx) => {
            // const grip = self.computerCombatSheet.computerWeapons?.[0]?.grip;
            if (ctx.allies.length > 1) { // && ctx.closestAllyDistanceSq < 500 ** 2
                //     console.log("%c Commander: Issuing Rally Command!", "color:#ff0");
                //     // self.rallyAllies();
                if (ctx.allies.some(a => a.ascean && a.health / a.ascean.health.max < 0.5)) {
                    // console.log("%c Commander: Ordering Defensive Formation", "color:#ff0");
                    // self.defensiveBuff();
                };
            };
            
            if (self.isCaerenic && (self.health / self.ascean.health.max < 0.35)) {
                // console.log("%c Commander: Removing Caerenic", "color:#ff0");
                self.caerenicUpdate(false);
            };
        },
        dynamicSwap: (self, ctx) => {
            if (!ctx.allies.length) {
            //     console.log("%c Commander: No allies, becoming Duelist", "color:#ff0");
                self.setMindState("Berserker");
            } else if (self.health / self.ascean.health.max < 0.35) {
                if (self.isCaerenic) self.caerenicUpdate(false);
                self.setMindState("Stalwart");
            };
        }
    },

    Controller: {
        healPriority: 0,
        keepDistance: true,
        chaseThresholdSq: (DISTANCE.CHASE * 1.1) ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 1.1) ** 2,
        callHelp: false,
        summon: false,
        activations: 0,
        startup: (self, ctx) => {
            self.mindState.keepDistance = self.isRanged;
        },
        customEvaluate: (self, ctx) => { // self.enemies.length > 1 && 
            if (Math.random() > 0.995 && ctx.direction.ogLengthSq < self.mindState.minDistanceSq && !self.isRanged) { // Also check for distance from at least 1 is close
                // console.log("%c Controller: Casting AoE", "color:#0ff");
                self.mindState.activations++;
                self.castAoE();
            } else if (Math.random() > 0.995 && ctx.direction.ogLengthSq < self.mindState.minDistanceSq && self.isRanged && self.currentTarget) {
                // console.log("%c Controller: Pushing Target Back", "color:#0ff");
                self.mindState.activations++;
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.KNOCKBACK);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.KNOCKBACK);
                };
            };
            self.mindState.keepDistance = self.isRanged;
        },
        dynamicSwap: (self, ctx) => {
            if (self.mindState.activations > 25) {
                const grip = self.computerCombatSheet.computerWeapons?.[0]?.grip;
                if (grip === "One Hand") {
                    if (self.ascean.mastery.includes("achre")) {
                        // console.log("%c Controller: Out of control abilities, switching to Sorcerer", "color:#0ff");
                        self.setMindState("Sorcerer");
                    } else if (self.ascean.mastery.includes("constitution")) {
                        // console.log("%c Controller: Out of control abilities, switching to Priest", "color:#0ff");
                        self.setMindState("Priest");
                    };
                } else if (grip === "Two Hand") {
                    // console.log("%c Controller: Out of control abilities, switching to Battlemage", "color:#0ff");
                    self.setMindState("Battlemage");
                };
            };
        }
    },

    Jester: {
        healPriority: 0,
        keepDistance: false,
        chaseThresholdSq: DISTANCE.CHASE ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 0.8) ** 2,
        callHelp: false,
        summon: false, // true
        activations: 0,
        startup: (self, ctx) => {
            if (!self.isCaerenic && (self.inCombat || self.inComputerCombat)) {
                // console.log("%c Jester: Becoming Caerenic", "color:#ffc700");
                self.caerenicUpdate(true);
            };
        },
        customEvaluate: (self, ctx) => {
            if (Math.random() > 0.95 && ctx.direction.ogLengthSq < self.mindState.minDistanceSq) {
                // console.log("%c Jester: Feint retreat!", "color:#f0f");
                // self.fakeRetreat();
            } else if (Math.random() > 0.95 && ctx.direction.ogLengthSq > self.mindState.minDistanceSq) {
                // console.log("%c Jester: Throwing smoke bomb", "color:#f0f");
                // self.throwSmokeBomb();
            };
        },
        dynamicSwap: (self, ctx) => {
            if (self.health / self.ascean.health.max < 0.3) {
                // console.log(`%c Jester: Low health, switching to <s>Rogue</s>`, "color:#f0f");
                // self.setMindState("Rogue");
            };
        }
    },

    Priest: {
        healPriority: 1.0,
        keepDistance: true,
        chaseThresholdSq: DISTANCE.CHASE ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 0.8) ** 2,
        callHelp: true,
        summon: false,
        activations: 0,
        startup: (self, ctx) => {
            self.mindState.keepDistance = self.isRanged;
        },
        customEvaluate: (self, ctx) => {
            const ratio = self.health / self.ascean.health.max;
            if (ctx.allies) {
                const heal = (ratio < 0.5) || ctx.allies.some(a => a && a.ascean && a.health / a.ascean.health.max < 0.5);
                if (heal) {
                    self.mindState.activations++;
                    // console.log("%c Priest: Someone needs healing", "color:#fdf6d8");
                    self.randomHeal();
                }; 
            };
            if (!self.isStalwart && ratio < 0.5) {
                // console.log("%c Priest: Becoming Stalwart", "color:#fdf6d8");
                self.stalwartUpdate(true);
            };
            self.mindState.keepDistance = self.isRanged;
        },
        dynamicSwap: (self, ctx) => {
            if (self.mindState.activations > 25) {
                const mastery = self.ascean.mastery;
                if (mastery.includes("caeren")) { // !ctx.allies.length && 
                    // console.log("%c Priest: Switching to Battlemage", "color:#fdf6d8");
                    if (self.isStalwart) self.stalwartUpdate(false);
                    self.setMindState("Battlemage");
                };
                if (mastery.includes("constitution")) { // !ctx.allies.length && 
                    // console.log("%c Priest: Switching to Sorcerer", "color:#fdf6d8");
                    if (self.isStalwart) self.stalwartUpdate(false);
                    self.setMindState("Sorcerer");
                };
            };
        }
    },
    
    Ranger: {
        healPriority: 0,
        keepDistance: true,
        chaseThresholdSq: DISTANCE.CHASE ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 0.9) ** 2,
        callHelp: true,
        summon: false,
        activations: 0,
        startup: (self, ctx) => {
            if (!self.isCaerenic && self.health / self.ascean.health.max < 0.5 && (self.inCombat || self.inComputerCombat)) {
                // console.log("%c Ranger: Becoming Caerenic on Startup", "color:#0f0");
                self.caerenicUpdate(true);
            };
        },
        customEvaluate: (self, ctx) => {
            if (Math.random() > 0.98 && ctx.direction.ogLengthSq > self.mindState.minDistanceSq) {
                self.mindState.activations++;
                // console.log("%c Ranger: Charging Achire", "color:#0f0");
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.ACHIRE);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.ACHIRE);
                };
            } else if (Math.random() > 0.98 && ctx.direction.ogLengthSq < self.mindState.minDistanceSq) {
                self.mindState.activations++;
                // console.log("%c Ranger: Setting Astrave", "color:#0f0");
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.ASTRAVE);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.ASTRAVE);
                };
            };
            if (!self.isCaerenic && self.health / self.ascean.health.max < 0.5) {
                // console.log("%c Ranger: Becoming Caerenic", "color:#0f0");
                self.caerenicUpdate(true);
            };
        },
        dynamicSwap: (self, ctx) => {
            // if (self.isDetected) self.setMindState("Duelist");
            if (!self.isRanged) {
                // console.log("%c Ranger: Switching to Rogue", "color:#0f0");
                self.setMindState("Rogue");
            };
        }
    },

    Rogue: {
        healPriority: 0,
        keepDistance: false,
        chaseThresholdSq: DISTANCE.CHASE ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 0.9) ** 2,
        callHelp: true,
        summon: false,
        activations: 0,
        startup: (self, ctx) => {
            if (!self.isCaerenic && self.health / self.ascean.health.max < 0.5 && (self.inCombat || self.inComputerCombat)) {
                // console.log("%c Rogue: Becoming Caerenic on Startup", "color:#0f0");
                self.caerenicUpdate(true);
            };
        },
        customEvaluate: (self, ctx) => {
            // if (!self.isStealthing && !self.isDetected) {
            //     console.log("%c Rogue: Engaging in Stealth", "color:#0f0");
            //     self.enterStealthAndFlank();
            // };
            if (Math.random() > 0.995 && ctx.direction.ogLengthSq > self.mindState.minDistanceSq) {
                self.mindState.activations++;
                // console.log("%c Ranger: Charging Shadow", "color:#0f0");
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.SHADOW);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.SHADOW);
                };
            } else if (Math.random() > 0.995 && ctx.direction.ogLengthSq < self.mindState.minDistanceSq) {
                self.mindState.activations++;
                // console.log("%c Ranger: Setting Rush", "color:#0f0");
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.RUSH);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.RUSH);
                };
            };
            if (!self.isCaerenic && self.health / self.ascean.health.max < 0.5) {
                // console.log("%c Rogue: Becoming Caerenic", "color:#0f0");
                self.caerenicUpdate(true);
            };
        },
        dynamicSwap: (self, ctx) => {
            // if (self.isDetected) self.setMindState("Duelist");
            if (self.isRanged) {
                // console.log("%c Rogue: Switching to Ranger", "color:#0f0");
                self.setMindState("Ranger");
            };
        }
    },

    Sorcerer: {
        healPriority: 0,
        keepDistance: true,
        chaseThresholdSq: (DISTANCE.CHASE * 1.2) ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 1.2) ** 2,
        callHelp: false,
        summon: false, // true
        activations: 0,
        startup: (self, ctx) => {
            self.mindState.keepDistance = self.isRanged;
            if (!self.isCaerenic && (self.inCombat || self.inComputerCombat)) {
                // console.log("%c Sorcerer: Becoming Caerenic", "color:#0ff");
                self.caerenicUpdate(true);
            };
        },
        customEvaluate: (self, ctx) => {
            if (ctx.direction.ogLengthSq < self.mindState.minDistanceSq && Math.random() > 0.995) { //  / 2
                // console.log("%c Sorcerer: Blinking", "color:#0ff");
                self.mindState.activations++;
                if (self.name === "enemy") {
                    (self as Enemy).stateMachine.setState(States.BLINK);
                } else {
                    (self as Party).playerMachine.stateMachine.setState(States.BLINK);
                };
            };
            if (ctx.direction.ogLengthSq > self.mindState.minDistanceSq && Math.random() > 0.995) {
                // console.log("%c Battlemage: Choosing a Ranged Blast", "color:#00f");
                self.mindState.activations++;
                self.rangedBlast();
            };
            self.mindState.keepDistance = self.isRanged;
        },
        dynamicSwap: (self, ctx) => {
            if (self.mindState.activations > 15) {
                // console.log("%c Sorcerer: Out of special abilities, switching mindset", "color:#0ff");
                const grip = self.computerCombatSheet.computerWeapons?.[0]?.grip;
                const mastery = self.ascean.mastery;
                const ratio = self.health / self.ascean.health.max;
                self.setMindState("Sorcerer");
                if (grip === "Two Hand" && (mastery.includes("caeren") || mastery.includes("kyosir"))) {
                    // console.log("%c Sorcerer: Switching to Battlemage", "color:#0ff");
                    if (self.isCaerenic) self.caerenicUpdate(false);
                    self.setMindState("Battlemage");
                } else if (mastery.includes("constitution") && ratio < 0.5) {
                    // console.log("%c Sorcerer: Switching to Priest", "color:#0ff");
                    if (self.isCaerenic) self.caerenicUpdate(false);
                    self.setMindState("Priest");
                };
            };
        },
    },

    Stalwart: {
        healPriority: 0,
        keepDistance: false,
        chaseThresholdSq: DISTANCE.CHASE ** 2,
        minDistanceSq: (DISTANCE.THRESHOLD * 0.9) ** 2,
        callHelp: true,
        summon: false,
        activations: 0,
        startup: (self, ctx) => {
            const grip = self.computerCombatSheet.computerWeapons?.[0]?.grip;
            if (grip === "Two Hand") {
                self.setMindState("Berserker");
            } else if (!self.isStalwart) {
                // console.log("%c Stalwart: Becoming Stalwart", "color:#fdf6d8");
                self.stalwartUpdate(true);
            };},
        customEvaluate: (self, ctx) => {            
            const ratio = self.health / self.ascean.health.max;
            if (ratio < 0.35) {
                self.randomHeal();
                // console.log("%c Stalwart: Self Healing", "color:#fdf6d8");
            }; 
        },
        dynamicSwap: (self, ctx) => {
            const grip = self.computerCombatSheet.computerWeapons?.[0]?.grip;
            if (grip === "Two Hand") {
                // console.log("%c Stalwart: Switching to Berserker", "color:#0ff");
                if (self.isStalwart) self.stalwartUpdate(false);
                self.setMindState("Berserker");
            };
        }
    },
};