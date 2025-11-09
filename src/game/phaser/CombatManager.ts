import CombatMachine from "../phaser/CombatMachine";
import Enemy from "../entities/Enemy";
import { EventBus } from "../EventBus";
import Player from "../entities/Player";
import { Play } from "../main";
import StatusEffect, { PRAYERS } from "../../utility/prayer";
import { computerCombatCompiler } from "../../utility/computerCombat";
import Party from "../entities/PartyComputer";
import { States } from "./StateMachine";
import { BONE, DAMAGE, EFFECT, HEAL } from "./ScrollingCombatText";
import { Counters, PLAYER } from "../../utility/player";
import { getHitFeedbackContext, HitFeedbackSystem } from "./HitFeedbackSystem";
import { Combat } from "../../stores/combat";
import { calculateThreat, ENEMY } from "../entities/Entity";
import { fetchArena } from "../../utility/enemy";
import { hitLocationDetector } from "./HitDetection";

export class CombatManager {
    combatMachine: CombatMachine;
    context: Play;
    hitFeedbackSystem: HitFeedbackSystem;

    constructor(scene: Play) {
        this.context = scene;
        this.combatMachine = new CombatMachine(this);
        this.hitFeedbackSystem = new HitFeedbackSystem(scene);
        EventBus.on("update-combat", this.updateCombat);
        EventBus.on("use-stamina", this.useStamina);
        EventBus.on("use-grace", this.useGrace);
    };

    public combatant(id: string) {
        if (id === this.context.player.playerID) {
            return this.context.player;
        } else {
            const enemy = this.context.enemies.find(e => e.enemyID === id);
            const party = this.context.party.find(p => p.enemyID === id);
            return enemy || party;
        };
    };

    public combatantByIdNo(id: number): Enemy | Party | undefined {
        const enemy = this.context.enemies.find(e => e.id === id);
        const party = this.context.party.find(p => p.id === id);
        return enemy || party;    
    };

    private updateCombat = (e: Combat) => {
        if (this.context.scene.isSleeping(this.context.scene.key)) return;

        const { newPlayerHealth } = e;
        const player = this.context.player;

        player.currentRound = e.combatRound;
        
        if (player.health > newPlayerHealth) {
            this.handlePlayerDamage(e);
        } else if (player.health < newPlayerHealth) { // newPlayerHealth - player.health
            this.context.showCombatText(this.context.player, `${Math.round(newPlayerHealth - player.health)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false);
        };

        this.handleHitFeedback(e);
        
        if (e.parrySuccess) {
            this.context.showCombatText(this.context.player, "Parry", PLAYER.DURATIONS.TEXT, EFFECT, true, false);
            this.stunned(e.enemyID);
            this.useStamina(-5);
        };
        
        if (e.rollSuccess) {
            this.context.showCombatText(this.context.player, "Roll", PLAYER.DURATIONS.TEXT, EFFECT, e.criticalSuccess, false);
            this.useStamina(-5);
        };
        
        player.health = newPlayerHealth;
        player.healthbar.setValue(player.health);
        if (player.healthbar.getTotal() < e.playerHealth) player.healthbar.setTotal(e.playerHealth);
        
        if (e.newComputerHealth <= 0 && e.playerWin === true) player.defeatedEnemyCheck(e.enemyID);

        if (newPlayerHealth <= 0) {
            player.isDefeated = true;
            player.disengage();
            player.playerMachine.stateMachine.setState(States.DEFEATED);
        };
    
        if (player.inCombat === false && this.context.combat === true) this.context.combatEngaged(false);

        this.handleEnemyUpdate(e);
        this.resetCombatFlags();
    };

    private handleEnemyUpdate = (e: Combat) => {
        const enemy = this.context.getEnemy(e.enemyID);
        if (!enemy) return;
        const { criticalSuccess, computerCriticalSuccess, computerDamageType, computerWeapons, computerWin, computerHealth, newComputerHealth, newPlayerHealth } = e;

        const player = this.context.player;
        
        if (enemy.health > newComputerHealth) {
            let damage: number | string = Math.round(e.realizedPlayerDamage); // enemy.health - newComputerHealth
            this.context.showCombatText(enemy, `${damage}`, 1500, BONE, criticalSuccess, false);
            if (enemy.isFeared) enemy.checkFear();
            if (enemy.isConfused) enemy.checkConfuse();
            if (enemy.isPolymorphed) enemy.isPolymorphed = false;
            if (enemy.isMalicing) enemy.malice(player.playerID);
            if (enemy.isMending) enemy.mend(player.playerID);
            if (!enemy.inCombat && newComputerHealth > 0 && newPlayerHealth > 0) enemy.checkEnemyCombatEnter();
            enemy.checkHurt();
            const id = enemy.enemies.find((en: ENEMY) => en.id === player.playerID);
            if (id && newComputerHealth > 0) {
                enemy.updateThreat(player.playerID, calculateThreat(Math.round(enemy.health - newComputerHealth), newComputerHealth, computerHealth));
            } else if (!id && newComputerHealth > 0) {
                enemy.enemies.push({ id: player.playerID, threat: 0 });
                enemy.updateThreat(player.playerID, calculateThreat(Math.round(enemy.health - newComputerHealth), newComputerHealth, computerHealth));
            };
        } else if (enemy.health < newComputerHealth) { 
            let heal = Math.round(newComputerHealth - enemy.health);
            this.context.showCombatText(enemy, `${heal}`, 1500, HEAL);
        };
        
        enemy.health = newComputerHealth;
        enemy.computerCombatSheet.newComputerHealth = enemy.health;
        if (enemy.healthbar.getTotal() < computerHealth) enemy.healthbar.setTotal(computerHealth);
        enemy.updateHealthBar(newComputerHealth);

        if (e.computerParrySuccess) {
            this.stunned(player.playerID);
            this.context.showCombatText(this.context.player, "Parry", PLAYER.DURATIONS.TEXT, DAMAGE, computerCriticalSuccess);    
        };

        if (e.computerRollSuccess) {
            this.context.showCombatText(this.context.player, "Roll", PLAYER.DURATIONS.TEXT, DAMAGE, computerCriticalSuccess);
        };
        
        enemy.weapons = computerWeapons;
        enemy.setWeapon(computerWeapons[0]); 
        enemy.checkDamage(computerDamageType.toLowerCase()); 
        enemy.checkMeleeOrRanged(computerWeapons?.[0]);
        enemy.currentWeaponCheck();
        enemy.currentRound = e.combatRound;
        
        if (newPlayerHealth <= 0 && computerWin === true) {
            enemy.isTriumphant = true;
            enemy.clearCombatWin();
        };

        if (enemy.health <= 0 && !enemy.stateMachine.isCurrentState(States.DEFEATED)) {
            enemy.stateMachine.setState(States.DEFEATED);
        };
    };

    private checkFearBreak() {
        const player = this.context.player;
        if (!player.isFeared) return;
        const chance = Math.random() < 0.1 + player.fearCount;
        if (chance) {
            this.context.showCombatText(player, "Fear Broken", PLAYER.DURATIONS.TEXT, EFFECT, false, false);
            player.isFeared = false;
        } else {
            player.fearCount += 0.1;
        };
    };

    private handlePlayerDamage(e: Combat) {
        const player = this.context.player;
        const damage = Math.round(e.realizedComputerDamage); // player.health - e.newPlayerHealth
        this.context.showCombatText(this.context.player, `${damage}`, PLAYER.DURATIONS.TEXT, DAMAGE, e.computerCriticalSuccess, false);

        player.isHurt = !(player.isSuffering() || player.isTrying() || player.isCasting || player.isContemplating || player.isPraying);
        player.isConfused = false;
        player.isPolymorphed = false;
        
        this.handleReactiveEffects(e.damagedID);
        this.checkFearBreak();
        if (player.isHurt) this.context.player.playerMachine.stateMachine.setState(States.HURT);
    };

    private handleReactiveEffects(id: string) {
        const player = this.context.player;
        if (!player.reactiveBubble) return;
        if (player.isMalicing) player.playerMachine.malice(id);
        if (player.isMending) player.playerMachine.mend();
        if (player.isRecovering) player.playerMachine.recover();
        if (player.isReining) player.playerMachine.rein();
        if (player.isMenacing) player.playerMachine.menace(player.reactiveTarget);
        if (player.isModerating) player.playerMachine.moderate(player.reactiveTarget);
        if (player.isMultifaring) player.playerMachine.multifarious(player.reactiveTarget);
        if (player.isMystifying) player.playerMachine.mystify(player.reactiveTarget);
    };

    private handleHitFeedback(e: Combat) {
        const isPlayerHit = e.playerDamaged || e.computerParrySuccess;
        const isEnemyHit = e.computerDamaged || e.parrySuccess;
        const player = this.context.player;
        const comp = player.currentTarget?.enemyID === e.enemyID ? player.currentTarget : this.combatant(e.enemyID);
        if (isEnemyHit && comp?.body) this.hitFeedbackSystem.play(getHitFeedbackContext(e, new Phaser.Math.Vector2(comp.x, comp.y), true));
        if (isPlayerHit) this.hitFeedbackSystem.play(getHitFeedbackContext(e, new Phaser.Math.Vector2(player.x, player.y), false));
    };

    public resetCombatFlags() {
        EventBus.emit("blend-combat", {
            computerDamaged: false,
            playerDamaged: false,
            glancingBlow: false,
            computerGlancingBlow: false,
            parrySuccess: false,
            computerParrySuccess: false,
            rollSuccess: false,
            computerRollSuccess: false,
            criticalSuccess: false,
            computerCriticalSuccess: false,
            religiousSuccess: false,
        });
    };

    public enemyHealthUpdate = (id: string, health: number, critical: boolean) => {
        const enemy = this.combatant(id);
        if (enemy.health > health) {
            let damage: number | string = Math.round(enemy.health - health);
            enemy.scene.showCombatText(enemy, `${damage}`, 1500, "bone", critical, false);
            if (enemy.isMalicing) enemy.malice(enemy.scene.player.playerID);
            if (enemy.isMending) enemy.mend(enemy.scene.player.playerID);
            if (!enemy.inCombat && health > 0) enemy.jumpIntoCombat();
            if (!enemy.isSuffering() && !enemy.isTrying() && !enemy.isCasting && !enemy.isContemplating) {
                enemy.isHurt = true;
                enemy.stateMachine.setState(States.HURT);
            };
            const id = enemy.enemies.find((en: ENEMY) => en.id === enemy.scene.player.playerID);
            if (id && health > 0) enemy.updateThreat(enemy.scene.player.playerID, calculateThreat(Math.round(enemy.health - health), health, enemy.ascean.health.max));
        } else if (enemy.health < health) {
            enemy.scene.showCombatText(enemy, `${Math.round(health - enemy.health)}`, 1500, HEAL);
        };

        enemy.health = health;
        enemy.computerCombatSheet.newComputerHealth = enemy.health;
        enemy.updateHealthBar(health);

        if (enemy.health <= 0 && !enemy.stateMachine.isCurrentState(States.DEFEATED)) {
            enemy.stateMachine.setState(States.DEFEATED);
        };
    };

    public convert = (id: string, faith: string) => {
        const enemy = this.combatant(id);
        enemy.ascean = {
            ...enemy.ascean,
            faith,
            name: `${enemy.ascean.name} (Converted)`,
        };
        enemy.combatStats = {
            ...enemy.combatStats,
            ascean: enemy.ascean
        };
        enemy.computerCombatSheet = {
            ...enemy.computerCombatSheet,
            computer: enemy.ascean
        };
        if (this.context.state.computer !== undefined) {
            this.context.hud.setupEnemy(enemy);
        };
    };

    public luckout = (e: {id: string, luck: string, luckout: boolean}) => {
        const enemy = this.combatant(e.id);
        if (e.luckout) {
            enemy.isLuckout = e.luckout;
            enemy.playerTrait = e.luck;
            enemy.isHostile = false;
            EventBus.emit("killing-blow", {e:enemy.ascean, enemyID:enemy.enemyID});
            enemy.stateMachine.setState(States.DEFEATED);
        } else if (!enemy.inCombat) {
            this.context.time.delayedCall(2000, () => {
                enemy.jumpIntoCombat();
            }, undefined, this);
        };
    };

    public persuasion = (e: {id: string, persuasion: string, persuaded: boolean}) => {
        const enemy = this.combatant(e.id);
        enemy.isPersuaded = e.persuaded;
        enemy.playerTrait = e.persuasion;
        if (enemy.inCombat && enemy.isPersuaded) enemy.clearPersuasion();
    };

    public removeComputerEnemy = (id: string) => {
        for (let i = 0; i < this.context.enemies.length; i++) {
            const enemy = this.context.enemies[i];
            if (enemy.currentTarget && enemy.currentTarget.enemyID === id) {
                enemy.clearComputerCombatWin(id);
            };
            enemy.enemies = enemy.enemies.filter((e: ENEMY) => e.id !== id);
        };
    };

    public updateComputerDamage = (damage: number, id: string, origin: string) => {
        const computer = this.combatant(id);
        computer.health = Math.max(computer.health - damage, 0);
        computer.updateHealthBar(computer.health);
        if (computer.name === "enemy") {
            this.context.showCombatText(computer, `${Math.round(damage)}`, 1500, BONE, false, false);
            computer.checkHurt();
    
            if (computer.isFeared) computer.checkFear();
            if (computer.isConfused) computer.checkConfuse();
            if (computer.isMalicing) computer.malice(origin);
            if (computer.isMending) computer.mend(origin);
            computer.isPolymorphed = false;
    
            if ((!computer.inComputerCombat || !computer.currentTarget) && computer.health > 0) {
                const enemy = this.context.enemies.find((en: Enemy) => en.enemyID === origin && origin !== computer.enemyID) || this.context.party.find((p: Party) => p.enemyID === origin);
                if (enemy && enemy.health > 0) computer.checkComputerEnemyCombatEnter(enemy);
            };
    
            computer.computerCombatSheet.newComputerHealth = computer.health;
    
            const enemy = computer.enemies.find((en: ENEMY) => en.id === origin && origin !== computer.enemyID);
    
            if (enemy && computer.health > 0 && computer.checkEnemyGame(origin)) {
                computer.updateThreat(origin, calculateThreat(damage, computer.health, computer.ascean.health.max));
            } else if (!enemy && computer.health > 0 && origin !== "" && computer.checkEnemyGame(origin)) {
                computer.enemies.push({id:origin,threat:0});
                computer.updateThreat(origin, calculateThreat(damage, computer.health, computer.ascean.health.max))
            };
    
            if (computer.health <= 0 && !computer.stateMachine.isCurrentState(States.DEFEATED)) {
                computer.stateMachine.setState(States.DEFEATED);
                computer.killingBlow = origin;
            };
            
        } else {
            this.context.showCombatText(computer, `${Math.round(damage)}`, 1500, EFFECT, false, false);
            computer.hurt = !computer.isSuffering() && !computer.isTrying() && !computer.isCasting && !computer.isContemplating;

            if (computer.isFeared) {
                const chance = Math.random() < 0.1 + computer.fearCount;
                if (chance) {
                    this.context.showCombatText(computer, "Fear Broken", PLAYER.DURATIONS.TEXT, EFFECT, false, false);
                    computer.isFeared = false;
                } else {
                    computer.fearCount += 0.1;
                };
            };
            computer.isConfused = false;
            computer.isPolymorphed = false;
            if (computer.isMalicing) computer.malice(origin);
            if (computer.isMending) computer.mend();

            if ((!computer.inComputerCombat || !computer.currentTarget) && computer.health > 0) {
                const enemy = this.context.getEnemy(origin);
                if (enemy && enemy.health > 0) computer.checkComputerEnemyCombatEnter(enemy);
            };

            computer.computerCombatSheet.newComputerHealth = computer.health;

            const enemy = computer.enemies.find((en: ENEMY) => en.id === origin);

            if (enemy && enemy.health > 0 && computer.health > 0) {
                computer.updateThreat(origin, calculateThreat(damage, computer.health, computer.ascean.health.max));
            } else if (!enemy && computer.health > 0 && origin !== "") {
                const enemy = this.context.getEnemy(origin);
                if (enemy && enemy.health > 0 && computer.health > 0) {
                    computer.enemies.push({id:origin,threat:0});
                    computer.updateThreat(origin, calculateThreat(damage, computer.health, computer.ascean.health.max));
                };
            };
            
            if (computer.health <= 0 && !computer.stateMachine.isCurrentState(States.DEFEATED)) {
                computer.stateMachine.setState(States.DEFEATED);
            };
        };

        this.checkPlayerFocus(computer.enemyID, computer.health);
    };

    public checkPlayerFocus = (id: string, value: number) => {
        if (this.context.state.enemyID !== id) return;
        EventBus.emit("update-combat-state", { key: "newComputerHealth", value });
    };
        
    public checkPlayerSuccess = (): void => {
        if (!this.context.player.actionSuccess && (this.context.state.action !== "parry" && this.context.state.action !== "roll" && this.context.state.action !== "")) this.combatMachine.input("action", "");
    };

    public ifPlayer = (concern: string): boolean => this.context.player[concern];

    public playerCaerenicNeg = () => this.context.player.isCaerenic ? (this.context.hud.talents.talents.caerenic.efficient ? 1.15 : 1.25) : 1;
    public playerCaerenicPro = () => this.context.player.isCaerenic ? (this.context.hud.talents.talents.caerenic.enhanced ? 1.25 : 1.15) : 1;
    public playerStalwart = () => this.context.player.isStalwart ? (this.context.hud.talents.talents.stalwart.efficient ? 0.75 : 0.85) : 1;

    public computerCaerenicNeg = (entity: Enemy | Party) => entity.isCaerenic ? 1.25 : 1;

    public computerCaerenicPro = (entity: Enemy | Party) => entity.isCaerenic ? 1.15 : 1;

    public computerStalwart = (entity: Enemy | Party) => entity.isStalwart ? 0.85 : 1;

    public computerCaerenicNegID = (id: string) =>{
        const entity = this.combatant(id);
        return entity?.isCaerenic ? 1.25 : 1;
    };

    public computerCaerenicProID = (id: string) => {
        const entity = this.combatant(id);
        return entity?.isCaerenic ? 1.15 : 1;
    };

    public computerStalwartID = (id: string) => {
        const entity = this.combatant(id);
        return entity?.isStalwart ? 0.85 : 1;
    }; 

    // ============================ Computer Combat ============================= \\

    summon = (entity: Enemy | Party) => {
        const ally = fetchArena([{ level: entity.ascean.level, mastery: entity.ascean.mastery, id: "0" }]);
        const newEnemy = new Enemy({scene:this.context, x:200, y:200, texture:"player_actions", frame:"player_idle_0", data: ally[0]});
        this.context.enemies.push(newEnemy);
        newEnemy.setPosition(Phaser.Math.Between(entity.x - 16, entity.x + 16), Phaser.Math.Between(entity.y - 24, entity.y + 24));
        newEnemy.callToArms(entity.currentTarget);
    };

    computer = (combat: { type: string; payload: { action: string; origin: string; enemyID: string; } }) => {
        const { payload } = combat;
        const { action, origin, enemyID } = payload;

        const computerOneEntity = this.context.enemies.find((e: Enemy) => e.enemyID === origin);
        const computerTwoEntity = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID) ?? this.context.party.find((e: Party) => e.enemyID === enemyID);

        if (!computerOneEntity || !computerTwoEntity) return;

        const computerOne = computerOneEntity.computerCombatSheet;
        const computerTwo = computerTwoEntity.computerCombatSheet;

        computerOne.computerAction = action;
        computerOne.computerEnemyAction = computerTwo.computerAction;
        computerTwo.computerEnemyAction = action;

        computerOne.computerHitLocation = computerOneEntity.lastHitLocation;

        if (computerTwo.computerAction) {
            const hitResult = hitLocationDetector.detectHitLocation(computerTwoEntity.weaponHitbox, computerOneEntity);
            computerTwo.computerHitLocation = hitResult;
        };

        computerOne.enemyID = computerTwo.personalID;
        computerTwo.enemyID = computerOne.personalID;

        const result = computerCombatCompiler({ computerOne, computerTwo });

        computerOneEntity.computerCombatUpdate(result.computerOne);
        computerTwoEntity.computerCombatUpdate(result.computerTwo);
    };

    computerMelee = (id: string, type: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) return;
        const match = this.context.isStateEnemy(id);
        if (match) { // Target Player Attack
            this.combatMachine.action({ type: "Weapon",  data: { key: "action", value: type } });
        } else { // Blind Player Attack
            if (enemy.health === 0) return;
            this.combatMachine.action({ type: "Player", data: { 
                playerAction: { action: type, parry: this.context.state.parryGuess }, 
                enemyID: enemy.enemyID, 
                ascean: enemy.ascean, 
                damageType: enemy.currentDamageType, 
                combatStats: enemy.combatStats, 
                weapons: enemy.weapons, 
                health: enemy.health, 
                actionData: { action: enemy.currentAction, parry: enemy.parryAction }
            }});
        };
    };

    partyAction = (payload: { action: string; origin: string; enemyID: string; }) => {
        const { action, origin, enemyID } = payload;
        let computerOneEntity = this.context.party.find((e: Party) => e.enemyID === origin)!;
        let computerTwoEntity = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);

        let computerOne = computerOneEntity.computerCombatSheet;
        let computerTwo = computerTwoEntity.computerCombatSheet;

        computerOne.computerAction = action;
        computerOne.computerEnemyAction = computerTwo.computerAction;
        computerTwo.computerEnemyAction = action;

        computerOne.computerHitLocation = computerOneEntity.lastHitLocation;

        if (computerTwo.computerAction) {
            const hitResult = hitLocationDetector.detectHitLocation(computerTwoEntity.weaponHitbox, computerOneEntity);
            computerTwo.computerHitLocation = hitResult;
        };
        
        computerOne.enemyID = computerTwo.personalID;
        computerTwo.enemyID = computerOne.personalID;

        const result = computerCombatCompiler({computerOne, computerTwo});
        computerOneEntity.computerCombatUpdate(result.computerOne);
        computerTwoEntity.computerCombatUpdate(result.computerTwo);
    };

    // ============================ Magic Impact ============================= \\

    magic = (target: Player | Enemy | Party, entity: Player | Enemy | Party): void => {
        if (target.health <= 0) return;
        const ascean = entity.ascean;
        let damage = Math.round(ascean[ascean.mastery] * 0.5);
        if (target.name === "player") {
            if (entity.name === "player") {
                damage *= this.playerCaerenicPro() * this.playerCaerenicNeg();
            } else {
                damage *= this.computerCaerenicPro(entity as Enemy | Party) * this.playerCaerenicNeg();
            };
            const health = target.health - damage;
            this.combatMachine.action({ data: { key: "player", value: health, id: (entity as Enemy).enemyID }, type: "Set Health" });
        } else if (entity.name === "player") {
            damage *= this.playerCaerenicPro() * this.computerCaerenicNeg(target as Enemy | Party);
            const health = target.health - damage;
            this.combatMachine.action({ data: { key: "enemy", value: health, id: (target as Enemy).enemyID }, type: "Health" });
        } else { // Computer Entity + Computer Target
            damage *= this.computerCaerenicPro(entity as Enemy | Party) * this.computerCaerenicNeg(target as Enemy | Party);
            const health = target.health - damage;
            (entity as Enemy).computerCombatSheet.newComputerEnemyHealth = health;
            (target as Enemy).computerCombatSheet.newComputerHealth = health;
            this.updateComputerDamage(damage, (target as Enemy | Party).enemyID, (entity as Enemy | Party).enemyID);
        };
    };

    // ============================ Combat Specials ============================ \\ 

    counterspellCheck = (enemy: Enemy, counter: string) => {
        const clean = counter.split("Countered ")[1];
        const counters = Counters[clean];
        const talented = this.context.hud.talents.talents.parry.enhanced;
        if (!counters || !talented) return;
        for (const key of counters) {
            if (key["enemy"]) {
                const record = key["enemy"];
                for (const status of record.status) {
                    (enemy as any)[status] = true;
                };
                (enemy as any)[record.state.key].setState(record.state.state);
            } else if (key["player"]) {
                const record = key["player"];
                (this.context.player as any).playerMachine[record.state.key].setState(record.state.state);
            };
        };
    };
    playerMelee = (id: string, type: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) return;
        const match = this.context.isStateEnemy(id);
        if (match) { // Target Player Attack
            this.combatMachine.action({ type: "Weapon",  data: { key: "action", value: type, hitLocation: this.context.player.lastHitLocation } });
        } else { // Blind Player Attack
            if (enemy.health === 0) return;
            this.combatMachine.action({ type: "Player", data: { 
                playerAction: { action: type, parry: this.context.state.parryGuess }, 
                enemyID: enemy.enemyID, 
                ascean: enemy.ascean, 
                damageType: enemy.currentDamageType, 
                combatStats: enemy.combatStats, 
                weapons: enemy.weapons, 
                health: enemy.health, 
                actionData: { action: enemy.currentAction, parry: enemy.parryAction },
                hitLocation: this.context.player.lastHitLocation
            }});
        };
    };
    astrave = (id: string, enemyID: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            let caster = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            caster.chiomic(15, id);
            this.context.player.isStunned = true;
            this.context.player.playerMachine.stateMachine.setState(States.STUN);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && enemy.health > 0) {
            if (!enemy.sansSuffering("isStunned")) {
                enemy.count.stunned++;
                enemy.isStunned = true;
                enemy.stateMachine.setState(States.STUNNED);
            };
            if (enemyID === this.context.player.playerID) { // PvC Combat
                const damage = Math.round(this.context.state?.player?.[this.context.state?.player.mastery as keyof typeof this.context.state.player]) 
                    * this.playerCaerenicPro() * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy) 
                    * this.context.player.playerMachine.levelModifier();
                const health = enemy.health - damage;
                this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
                return;
            };
            const comp = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            if (comp) { // CvC Combat
                const damage = Math.round(comp.ascean[comp.ascean.mastery as keyof typeof comp.ascean])
                    * this.computerCaerenicPro(comp) * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                    * (comp.ascean.level + 9) / 10;
                this.updateComputerDamage(damage, id, enemyID);
                return;
            } else { // Party Combat
                const party = this.context.party.find((e: Party) => e.enemyID === enemyID);
                if (party) {  
                    const damage = Math.round(party.ascean[party.ascean.mastery as keyof typeof party.ascean])
                        * this.computerCaerenicPro(party) * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                        * party.playerMachine.levelModifier();
                    this.updateComputerDamage(damage, id, enemyID);
                };
            };
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            if (party.health <= 0) return;
            const comp = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            if (comp) {
                const damage = Math.round(comp.ascean[comp.ascean.mastery as keyof typeof comp.ascean])
                    * this.computerCaerenicPro(party) * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                    * party.playerMachine.levelModifier();
                this.updateComputerDamage(damage, id, enemyID);
            };
        };
    };
    blind = (id: string, origin: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: any) => e.enemyID === id);
        if (enemy && enemy.health > 0) {
            if (!enemy.sansSuffering("isFeared")) {
                enemy.count.feared++;
                enemy.isFeared = true;
                enemy.stateMachine.setState(States.FEARED);
            };
            if (origin === this.context.player.playerID) {
                const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 1) 
                    * this.playerCaerenicPro() * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy) 
                    * this.context.player.playerMachine.levelModifier();
                const health = enemy.health - damage;
                this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
                enemy.specialFear = this.context.player.checkTalentEnhanced(States.FEAR);
            } else { // Party Combat
                const party = this.context.party.find((e: Party) => e.enemyID === origin);
                if (party) {
                    const damage = Math.round(party.ascean[party?.ascean.mastery as keyof typeof party.ascean])
                        * this.computerCaerenicPro(party) * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                        * party.playerMachine.levelModifier();
                    this.updateComputerDamage(damage, id, origin);
                };
            };
        };
    };
    caerenesis = (id: string, origin: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && enemy.health > 0) {
            if (!enemy.sansSuffering("isParalyzed")) {
                enemy.count.paralyzed++;
                enemy.isParalyzed = true;
                enemy.stateMachine.setState(States.PARALYZED);
            };
            if (origin === this.context.player.playerID) {  
                if (enemy.enemyID === this.context.player.getEnemyId()) {
                    this.combatMachine.action({ type: "Tshaeral", data: 15 });
                } else {
                    const drained = Math.round(this.context.state.playerHealth * 0.15
                        * this.playerCaerenicPro() * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy) 
                        * this.context.player.playerMachine.levelModifier());
                    const newPlayerHealth = drained / this.context.state.playerHealth * 100;
                    const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
                    const tshaeralDescription = `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;
                    EventBus.emit("add-combat-logs", { ...this.context.state, playerActionDescription: tshaeralDescription });
                    this.combatMachine.action({ type: "Health", data: { key: "player", value: newPlayerHealth, id: this.context?.player?.playerID } });
                    this.combatMachine.action({ type: "Health", data: { key: "enemy", value: newHealth, id: enemy.enemyID } });
                };
            } else { // Party Combat
                let party = this.context.party.find((e: Party) => e.enemyID === origin);
                if (party) {
                    const damage = Math.round(party.computerCombatSheet.computerHealth * 0.15)
                        * this.computerCaerenicPro(party) * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                        * party.playerMachine.levelModifier();
                    const newComputerHealth = Math.min(party.health + damage, party.computerCombatSheet.computerHealth);
                    party.health = newComputerHealth;
                    party.computerCombatSheet.newComputerHealth = party.health;
                    this.updateComputerDamage(damage, id, origin);
                };
            };
        };
    };
    charm = (id: string, _special: boolean = false) => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isCharmed = true;
            this.context.player.playerMachine.stateMachine.setState(States.CHARMED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.charmed();
        };
    };
    chiomic = (id: string, origin: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isConfused = true;
            this.context.player.playerMachine.stateMachine.setState(States.CONFUSED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isConfused")) {
            enemy.count.confused++;
            enemy.isConfused = true;
            if (origin === this.context.player.playerID) enemy.specialConfuse = this.context.player.checkTalentEnhanced(States.CONFUSE);
            enemy.stateMachine.setState(States.CONFUSED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.sansSuffering("isConfused")) {
            party.count.confused++;
            party.isConfused = true;
            party.playerMachine.stateMachine.setState(States.CONFUSED);
        };
    };
    confuse = (id: string, special: boolean = false): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isConfused = true;
            this.context.player.playerMachine.stateMachine.setState(States.CONFUSED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isConfused")) {
            enemy.count.confused++;
            enemy.isConfused = true;
            enemy.specialConfuse = special;
            enemy.stateMachine.setState(States.CONFUSED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.sansSuffering("isConfused")) {
            party.count.confused++;
            party.isConfused = true;
            party.playerMachine.stateMachine.setState(States.CONFUSED);
        };
    };
    disease = (combatID: string, enemySpecialID?: string): void => {
        if (!combatID) return;
        if (combatID === this.context?.player?.playerID && enemySpecialID) { // Enemy Special is Damaging Player
            const origin = this.combatant(enemySpecialID);
            if (origin.checkPlayerResist()) {
                origin.chiomic(10, combatID);
            };
            return;
        };
        const enemy = this.context.enemies.find((e: Enemy) => e.enemyID === combatID);
        if (enemy && enemy.health > 0) { // Enemy Taking Damage
            if (enemySpecialID === this.context.player.playerID) {
                this.context.player.playerMachine.chiomism(enemy.enemyID, 10, "disease");
            } else {
                const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemySpecialID);
                if (origin) { // CvC
                    origin.chiomic(10, enemy.enemyID);
                } else {
                    const party = this.context.party.find((e: Party) => e.enemyID === enemySpecialID);
                    if (!party) return;
                    party.playerMachine.chiomism(enemy.enemyID, 10);
                };  
            };
        } else { // Party Taking Damage
            const party = this.context.party.find((e: Party) => e.enemyID === combatID);
            if (party) {
                const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemySpecialID);
                if (origin) { // CvC
                    origin.chiomic(10, party.enemyID);
                };
            };
        };
    };
    fear = (id: string, special: boolean = false): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isFeared = true;
            this.context.player.playerMachine.stateMachine.setState(States.FEARED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isFeared")) {
            enemy.count.feared++;
            enemy.isFeared = true;
            enemy.specialFear = special;
            enemy.stateMachine.setState(States.FEARED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.sansSuffering("isFeared")) {
            party.count.feared++;
            party.isFeared = true;
            party.playerMachine.stateMachine.setState(States.FEARED);
        };
    };
    freeze = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isFrozen = true;
            this.context.player.playerMachine.negativeMachine.setState(States.FROZEN);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.currentNegativeState(States.FROZEN)) {
            enemy.count.frozen++;
            enemy.isFrozen = true;
            enemy.negativeMachine.setState(States.FROZEN);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.currentNegativeState(States.FROZEN)) {
            party.count.frozen++;
            party.isFrozen = true;
            party.playerMachine.negativeMachine.setState(States.FROZEN);
        };
    };
    fyerus = (id: string, origin: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && enemy.health > 0) {
            if (origin === this.context.player.playerID) { // Player Fyerus
                const damage = this.context.player.playerMachine.mastery() * 0.35 
                    * this.playerCaerenicPro() * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy) 
                    * this.context.player.playerMachine.levelModifier();
                const health = enemy.health - damage;
                this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
            } else { // Party
                const party = this.context.party.find((e: Party) => e.enemyID === origin);
                if (party) {
                    const damage = Math.round(party.ascean[party.ascean.mastery as keyof typeof party.ascean] * 0.35)
                    * this.computerCaerenicPro(party) * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                    * party.playerMachine.levelModifier();
                    this.updateComputerDamage(damage, id, origin);
                };
            };
            enemy.slowDuration = 1000;
            enemy.count.slowed++;
            enemy.isSlowed = true;
            enemy.negativeMachine.setState(States.SLOWED);
            // if (!enemy.currentNegativeState("isSlowed")) {
            // };
        };
    };
    howl = (id: string): void => {
        if (!id) return;
        this.stunned(id);
    };
    kynisos = (id: string, origin: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.context.player.isRooted = true;
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            this.root(id);
            const damage = Math.round(enemy.ascean[enemy.ascean.mastery as keyof typeof enemy.ascean]) * ((enemy.ascean.level as number + 9) / 10);
            this.updateComputerDamage(damage, id, origin);
        };
    };
    lightning = (id: string, power: number): void => {
        this.context.player.playerMachine.chiomism(id, power, "lightning");
    };

    paralyze = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isParalyzed = true;
            this.context.player.playerMachine.stateMachine.setState(States.PARALYZED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isParalyzed")) {
            enemy.count.paralyzed++;
            enemy.isParalyzed = true;
            enemy.stateMachine.setState(States.PARALYZED);
            return;    
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.sansSuffering("isParalyzed")) {
            party.count.paralyzed++;
            party.isParalyzed = true;
            party.playerMachine.stateMachine.setState(States.PARALYZED);
        };
    };
    polymorph = (id: string, special: boolean = false): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.context.player.isPolymorphed = true;
            this.context.player.playerMachine.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isPolymorphed")) {
            enemy.count.polymorphed += 1;
            enemy.isPolymorphed = true;
            enemy.specialPolymorph = special;
            enemy.stateMachine.setState(States.POLYMORPHED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.sansSuffering("isPolymorphed")) {
            party.count.polymorphed += 1;
            party.isPolymorphed = true;
            party.playerMachine.stateMachine.setState(States.POLYMORPHED);
        };
    };
    renewal = (id: string) => {
        if (!id) return;
        
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {        
            const heal = enemy.healthbar.getTotal() * 0.1;
            const health = Math.min(enemy.health + heal, enemy.healthbar.getTotal());
            if (enemy.inCombat) { // Player Combat
                this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
            } else { // CvC
                enemy.health = health;
                enemy.updateHealthBar(health);
                enemy.computerCombatSheet.newComputerHealth = health;
                this.context.showCombatText(enemy, `${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false);
                this.checkPlayerFocus(id, health);
            };
            return; 
        };

        let party = this.context.party.find((e: Party) => e.playerID === id);
        if (party) {
            const heal = party.healthbar.getTotal() * 0.1;
            const health = Math.min(party.health + heal, party.healthbar.getTotal());
            party.health = health;
            party.updateHealthBar(health);
            party.computerCombatSheet.newComputerHealth = health;
            this.context.showCombatText(party, `${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false);
            this.checkPlayerFocus(id, health);
            return;
        };

        this.combatMachine.action({ data: { key: "player", value: 10, id }, type: "Health" });
    };
    enemyRenewal = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) return;
        const heal = enemy.healthbar.getTotal() * 0.1;
        const health = Math.min(enemy.health + heal, enemy.healthbar.getTotal());
        if (enemy.inCombat) {
            this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
        } else { // CvC
            enemy.health = health;
            enemy.updateHealthBar(health);
            enemy.computerCombatSheet.newComputerHealth = health;
            this.context.showCombatText(enemy, `${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false);
            this.checkPlayerFocus(id, health);
        };
    };
    partyRenewal = (id: string): void => {
        if (!id) return;
        let party = this.context.party.find((e: Party) => e.playerID === id);
        if (!party) { // Player Blessed
            this.combatMachine.action({ data: { key: "player", value: 10, id: this.context?.player?.playerID }, type: "Health" });
        } else {
            const heal = party.healthbar.getTotal() * 0.1;
            const health = Math.min(party.health + heal, party.healthbar.getTotal());
            party.health = health;
            party.updateHealthBar(health);
            party.computerCombatSheet.newComputerHealth = health;
            this.context.showCombatText(party, `${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false);
            this.checkPlayerFocus(id, health);
        };
    };
    root = (id: string): void => {
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) return;
        if (!enemy.currentNegativeState(States.ROOTED)) {
            this.context.targetTarget = enemy;
            enemy.isRooted = true;
            enemy.count.rooted += 1;
            enemy.negativeMachine.setState(States.ROOTED);
        };
    };
    scream = (id: string, origin: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isFeared = true;
            this.context.player.playerMachine.stateMachine.setState(States.FEARED);
            return;    
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isFeared")) {
            enemy.isFeared = true;
            enemy.count.feared++;
            if (origin === this.context.player.playerID) {
                enemy.specialFear = this.context.player.checkTalentEnhanced(States.FEAR);
            };
            enemy.stateMachine.setState(States.FEARED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.isFeared = true;
            party.count.feared++;
        };
    };
    slow = (id: string, time: number = 3000): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            if (this.context.player.isSnared) return;
            this.context.player.isSlowed = true;
            this.context.player.slowDuration = time;
            this.context.player.playerMachine.negativeMachine.setState(States.SLOWED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.currentNegativeState(States.SLOWED)) {
            enemy.count.slowed++;
            enemy.isSlowed = true;
            enemy.slowDuration = time;
            enemy.negativeMachine.setState(States.SLOWED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.currentNegativeState(States.SLOWED)) {
            party.count.slowed++;
            party.isSlowed = true;
            party.slowDuration = time;
            party.playerMachine.negativeMachine.setState(States.SLOWED);
        };
    };
    snare = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.context.player.isSnared = true;
            this.useGrace(5);
            this.useStamina(5);
            this.context.player.playerMachine.negativeMachine.setState(States.SNARED);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.currentNegativeState(States.SNARED)) {
            enemy.count.snared += 1;
            enemy.isSnared = true;
            enemy.negativeMachine.setState(States.SNARED);
            return;    
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.currentNegativeState(States.SNARED)) {
            party.count.snared += 1;
            party.isSnared = true;
            party.playerMachine.negativeMachine.setState(States.SNARED);
        };
    };
    stun = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useStamina(10);
            this.context.player.isStunned = true;
            this.context.player.playerMachine.stateMachine.setState(States.STUN);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isStunned")) {
            enemy.count.stunned += 1;
            enemy.isStunned = true;
            enemy.stateMachine.setState(States.STUNNED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.sansSuffering("isStunned")) {
            party.count.stunned += 1;
            party.isStunned = true;
            party.playerMachine.stateMachine.setState(States.STUNNED);
        };
    };
    stunned = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useStamina(10);
            this.context.player.isStunned = true;
            this.context.player.playerMachine.stateMachine.setState(States.STUN);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy && !enemy.sansSuffering("isStunned")) {
            enemy.count.stunned += 1;
            enemy.isStunned = true;
            enemy.stateMachine.setState(States.STUNNED);
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party && !party.sansSuffering("isStunned")) {
            party.count.stunned += 1;
            party.isStunned = true;
            party.playerMachine.stateMachine.setState(States.STUNNED);
        };
    };
    writhe = (id: string, enemyID: string, type = "writhe"): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            let en = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            if (!en) return;
            const hitLocation = hitLocationDetector.detectHitLocation(en.weaponHitbox, this.context.player);
            if (en.isCurrentTarget) {
                this.combatMachine.action({ type: "Weapon", data: { key: "computerAction", value: type, id: en.enemyID, hitLocation } });
            } else {
                this.combatMachine.action({ type: "Enemy", data: { 
                    enemyID: en.enemyID, ascean: en.ascean, damageType: en.currentDamageType, combatStats: en.combatStats, weapons: en.weapons, health: en.health, 
                    actionData: { action: type, parry: en.parryAction, id: enemyID }, hitLocation }});
            };
            this.useGrace(10);
            return;    
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) { // Enemy Taking Damage
            if (enemyID === this.context.player.playerID) { // Player Combat
                const match = this.context.isStateEnemy(id);
                const hitLocation = hitLocationDetector.detectHitLocation(this.context.player.weaponHitbox, enemy);
                if (match) { // Target Player Attack
                    this.combatMachine.action({ type: "Weapon",  data: { key: "action", value: type, hitLocation } });
                } else { // Blind Player Attack
                    this.combatMachine.action({ type: "Player", data: { 
                        playerAction: { action: type, parry: this.context.state.parryGuess }, 
                        enemyID: enemy.enemyID, 
                        ascean: enemy.ascean, 
                        damageType: enemy.currentDamageType, 
                        combatStats: enemy.combatStats, 
                        weapons: enemy.weapons, 
                        health: enemy.health, 
                        actionData: { action: enemy.currentAction, parry: enemy.parryAction },
                        hitLocation
                    }});
                };
            } else { // Computer Combat
                const party = this.context.party.find((e: Party) => e.enemyID === enemyID);
                if (party) { // Party Combat
                    this.partyAction({action:type,origin:enemyID,enemyID:id});
                } else { // CvC
                    this.computer({ type: "Weapon", payload: { action: type, origin: enemyID, enemyID: id } });
                };
            };
        } else {
            const party = this.context.party.find((e: Party) => e.enemyID === id);
            if (party) {
                const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
                if (origin) { // Party Taking Damage vs Enemy
                    this.computer({ type: "Weapon", payload: { action: type, origin: enemyID, enemyID: id } });
                };
            };
        };
    };

    caerenic = (): boolean => EventBus.emit("update-caerenic");
    stalwart = (): boolean => EventBus.emit("update-stalwart");

    useGrace = (value: number) => {
        if (this.context.state.isInsight && value > 0) {
            const effect = this.context.state.playerEffects.find((prayer: StatusEffect) => prayer.prayer === PRAYERS.INSIGHT);
            if (effect) {
                this.combatMachine.action({ type: "Remove Effect", data: effect });
            };
            this.combatMachine.input("isInsight", false);
            return;
        };
        EventBus.emit("update-grace", value);
        this.context.player.grace -= value;
    };

    useStamina = (value: number) => {
        if (this.context.state.isQuicken && value > 0) {
            const effect = this.context.state.playerEffects.find((prayer: StatusEffect) => prayer.prayer === PRAYERS.QUICKEN);
            if (effect) {
                this.combatMachine.action({ type: "Remove Effect", data: effect });
            };
            this.combatMachine.input("isQuicken", false);
            return;
        };
        EventBus.emit("update-stamina", value);
        this.context.player.stamina -= value;
    };
};