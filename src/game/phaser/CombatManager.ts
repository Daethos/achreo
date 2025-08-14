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
import { PLAYER } from "../../utility/player";
import { getHitFeedbackContext, HitFeedbackSystem } from "./HitFeedbackSystem";
import { Combat } from "../../stores/combat";
import { calculateThreat, ENEMY } from "../entities/Entity";
import { fetchArena } from "../../utility/enemy";

export class CombatManager {
    combatMachine: CombatMachine;
    context: Play;
    hitFeedbackSystem: HitFeedbackSystem;

    constructor(scene: Play) {
        this.context = scene;
        this.combatMachine = new CombatMachine(this);
        this.hitFeedbackSystem = new HitFeedbackSystem(scene);
        EventBus.on("update-combat", this.updateCombat.bind(this));
        EventBus.on("use-stamina", this.useStamina.bind(this));
        EventBus.on("use-grace", this.useGrace.bind(this));
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

    private updateCombat = (e: Combat) => {
        if (this.context.scene.isSleeping(this.context.scene.key)) return;

        const { computerCriticalSuccess, newPlayerHealth } = e;
        const player = this.context.player;

        player.currentRound = e.combatRound;
        
        if (player.health > newPlayerHealth) {
            this.handlePlayerDamage(e);
        } else if (player.health < newPlayerHealth) { // newPlayerHealth - player.health
            this.context.showCombatText(this.context.player, `${Math.round(newPlayerHealth - player.health)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false);
        };
        
        player.health = newPlayerHealth;
        player.healthbar.setValue(player.health);
        if (player.healthbar.getTotal() < e.playerHealth) player.healthbar.setTotal(e.playerHealth);
        
        if (e.parrySuccess) {
            this.context.showCombatText(this.context.player, "Parry", PLAYER.DURATIONS.TEXT, HEAL, true, false);
            this.stunned(e.enemyID);
            this.useStamina(-5);
        };
        
        if (e.rollSuccess) {
            this.context.showCombatText(this.context.player, "Roll", PLAYER.DURATIONS.TEXT, HEAL, e.criticalSuccess, false);
            this.useStamina(-5);
        };
        
        if (e.computerParrySuccess) {
            this.stunned(player.playerID);
            this.context.showCombatText(this.context.player, "Parry", PLAYER.DURATIONS.TEXT, DAMAGE, computerCriticalSuccess, false);    
        };

        if (e.computerRollSuccess) {
            this.context.showCombatText(this.context.player, "Roll", PLAYER.DURATIONS.TEXT, DAMAGE, computerCriticalSuccess, false);
        };
        
        if (e.newComputerHealth <= 0 && e.playerWin === true) player.defeatedEnemyCheck(e.enemyID);
        if (newPlayerHealth <= 0) {
            player.isDefeated = true;
            player.disengage();
        };
        player.maxStamina = Math.max(player.maxStamina, e.playerAttributes?.stamina ?? 0);
        player.maxGrace = Math.max(player.maxGrace, e.playerAttributes?.grace ?? 0);
    
        if (player.inCombat === false && this.context.combat === true) this.context.combatEngaged(false);

        this.handleEnemyUpdate(e);
        
        this.handleHitFeedback(e);
        this.resetCombatFlags();
    };

    private handleEnemyUpdate = (e: Combat) => {
        const enemy = this.context.getEnemy(e.enemyID);
        if (!enemy) return;
        const { criticalSuccess, computerDamageType, computerWeapons, computerWin, computerHealth, newComputerHealth, newPlayerHealth } = e;

        const player = this.context.player;
        
        if (enemy.health > newComputerHealth) {
            let damage: number | string = Math.round(e.realizedPlayerDamage); // enemy.health - newComputerHealth
            this.context.showCombatText(enemy, `${damage}`, 1500, BONE, criticalSuccess, false);
            enemy.checkHurt();
            if (enemy.isFeared) enemy.checkFear();
            if (enemy.isConfused) enemy.checkConfuse();
            if (enemy.isPolymorphed) enemy.isPolymorphed = false;
            if (enemy.isMalicing) enemy.malice(player.playerID);
            if (enemy.isMending) enemy.mend(player.playerID);
            if (!enemy.inCombat && newComputerHealth > 0 && newPlayerHealth > 0) enemy.checkEnemyCombatEnter();
            const id = enemy.enemies.find((en: ENEMY) => en.id === player.playerID);
            if (id && newComputerHealth > 0) {
                enemy.updateThreat(player.playerID, calculateThreat(Math.round(enemy.health - newComputerHealth), newComputerHealth, computerHealth));
            } else if (!id && newComputerHealth > 0) {
                enemy.enemies.push({ id: player.playerID, threat: 0 });
                enemy.updateThreat(player.playerID, calculateThreat(Math.round(enemy.health - newComputerHealth), newComputerHealth, computerHealth));
            };
        } else if (enemy.health < newComputerHealth) { 
            let heal = Math.round(newComputerHealth - enemy.health);
            this.context.showCombatText(enemy, `${heal}`, 1500, HEAL, false, false);
        };
        
        enemy.health = newComputerHealth;
        enemy.computerCombatSheet.newComputerHealth = enemy.health;
        if (enemy.healthbar.getTotal() < computerHealth) enemy.healthbar.setTotal(computerHealth);
        enemy.updateHealthBar(newComputerHealth);
        
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
        const comp = player.currentTarget?.enemyID === e.enemyID
            ? player.currentTarget
            : this.context.getEnemy(e.enemyID);

        if (isEnemyHit && comp?.body) {
            this.hitFeedbackSystem.play(getHitFeedbackContext(e, new Phaser.Math.Vector2(comp.x, comp.y), true));
        };

        if (isPlayerHit) {
            this.hitFeedbackSystem.play(getHitFeedbackContext(e, new Phaser.Math.Vector2(player.x, player.y), false));
        };
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

    public updateComputerDamage = (damage: number, id: string, origin: string) => {
        const computer = this.combatant(id);
        computer.health = Math.max(computer.health - damage, 0);
        computer.updateHealthBar(computer.health);
        if (computer.name === "enemy") {
            this.context.showCombatText(computer, `${Math.round(damage)}`, 1500, BONE, false, false);
            computer.checkHurt();
    
            if (computer.isFeared) computer.checkFear();
            if (computer.isConfused) computer.checkConfuse();
            computer.isPolymorphed = false;
            if (computer.isMalicing) computer.malice(origin);
            if (computer.isMending) computer.mend(origin);
    
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
    
            if (computer.health <= 0) computer.killingBlow = origin;
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
        };

        this.checkPlayerFocus(computer.enemyID, computer.health);
    };

    checkPlayerFocus = (id: string, value: number) => {
        if (this.context.state.enemyID !== id) return;
        EventBus.emit("update-combat-state", { key: "newComputerHealth", value });
    };
        
    checkPlayerSuccess = (): void => {
        if (!this.context.player.actionSuccess && (this.context.state.action !== "parry" && this.context.state.action !== "roll" && this.context.state.action !== "")) this.combatMachine.input("action", "");
    };

    ifPlayer = (concern: string): boolean => this.context.player[concern];

    playerCaerenicNeg = () => this.context.player.isCaerenic ? (this.context.hud.talents.talents.caerenic.efficient ? 1.15 : 1.25) : 1;
    playerCaerenicPro = () => this.context.player.isCaerenic ? (this.context.hud.talents.talents.caerenic.enhanced ? 1.25 : 1.15) : 1;
    playerStalwart = () => this.context.player.isStalwart ? (this.context.hud.talents.talents.stalwart.efficient ? 0.75 : 0.85) : 1;

    computerCaerenicNeg = (entity: Enemy | Party) =>{
        return entity.isCaerenic ? 1.25 : 1
    };

    computerCaerenicPro = (entity: Enemy | Party) => {
        return entity.isCaerenic ? 1.15 : 1
    };

    computerStalwart = (entity: Enemy | Party) => {
        return entity.isStalwart ? 0.85 : 1
    }; 

    computerCaerenicNegID = (id: string) =>{
        const entity = this.combatant(id);
        return entity.isCaerenic ? 1.25 : 1;
    };

    computerCaerenicProID = (id: string) => {
        const entity = this.combatant(id);
        return entity.isCaerenic ? 1.15 : 1;
    };

    computerStalwartID = (id: string) => {
        const entity = this.combatant(id);
        return entity.isStalwart ? 0.85 : 1;
    }; 

    // ============================ Computer Combat ============================= \\

    summon = (entity: Enemy) => {
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

    // ============================ Magic Impact ============================= \\
    magic = (target: Player | Enemy | Party, entity: Player | Enemy | Party): void => {
        if (target.health <= 0) return;
        const ascean = entity.ascean;
        if (target.name === "player") {
            const damage = Math.round(ascean[ascean?.mastery as keyof typeof ascean] * 0.2);
            const health = target.health - damage;
            this.combatMachine.action({ data: { key: "player", value: health, id: (entity as Enemy).enemyID }, type: "Set Health" });
        } else if (entity.name === "player") {
            const damage = Math.round(ascean[ascean.mastery as keyof typeof ascean] * 0.2);
            const health = target.health - damage;
            this.combatMachine.action({ data: { key: "enemy", value: health, id: (target as Enemy).enemyID }, type: "Health" });
        } else { // Computer Entity + Computer Target
            const damage = Math.round(ascean?.[ascean?.mastery as keyof typeof ascean] * 0.2);
            const health = target.health - damage;
            (entity as Enemy).computerCombatSheet.newComputerEnemyHealth = health;
            (target as Enemy).computerCombatSheet.newComputerHealth = health;
            this.updateComputerDamage(damage, (target as Enemy | Party).enemyID, (entity as Enemy | Party).enemyID);
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
        computerOne.enemyID = computerTwo.personalID;
        computerTwo.enemyID = computerOne.personalID;
        const result = computerCombatCompiler({computerOne, computerTwo});
        computerOneEntity.computerCombatUpdate(result.computerOne);
        computerTwoEntity.computerCombatUpdate(result.computerTwo);
        // EventBus.emit("party-combat-text", { text: `${result?.computerOne?.computer?.name} ${ENEMY_ATTACKS[result?.computerOne?.computerAction as keyof typeof ENEMY_ATTACKS]} ${result?.computerOne?.computerEnemy?.name} with their ${result?.computerOne?.computerWeapons[0]?.name} for ${Math.round(result?.computerOne?.realizedComputerDamage as number)} ${result?.computerOne?.computerDamageType} damage.` });
    };

    // ============================ Combat Specials ============================ \\ 
    playerMelee = (id: string, type: string): void => {
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
    astrave = (id: string, enemyID: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            let caster = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            caster.chiomic(15, id);
            this.context.player.isStunned = true;
            return;    
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            if (enemy.health <= 0) return;
            enemy.count.stunned++;
            enemy.isStunned = true;
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
            enemy.count.feared++;
            enemy.isFeared = true;
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
            enemy.count.paralyzed++;
            enemy.isParalyzed = true;
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
    chiomic = (id: string, origin: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isConfused = true;
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.confused++;
            enemy.isConfused = true;
            if (origin === this.context.player.playerID) {
                enemy.specialConfuse = this.context.player.checkTalentEnhanced(States.CONFUSE);
            };
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.confused++;
            party.isConfused = true;
        };
    };
    confuse = (id: string, special: boolean = false): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isConfused = true;
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.confused++;
            enemy.isConfused = true;
            enemy.specialConfuse = special;
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.confused++;
            party.isConfused = true;
        };
    };
    fear = (id: string, special: boolean = false): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isFeared = true;
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.feared++;
            enemy.isFeared = true;
            enemy.specialFear = special;
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.feared++;
            party.isFeared = true;
        };
    };
    freeze = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isFrozen = true;
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.frozen++;
            enemy.isFrozen = true;
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.frozen++;
            party.isFrozen = true;
        };
    };
    fyerus = (id: string, origin: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0 && enemy.isDefeated !== true) {
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
    paralyze = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isParalyzed = true;
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.paralyzed++;
            enemy.isParalyzed = true;
            return;    
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.paralyzed++;
            party.isParalyzed = true;
        };
    };
    polymorph = (id: string, special: boolean = false): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.context.player.isPolymorphed = true;
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.polymorphed += 1;
            enemy.isPolymorphed = true;
            enemy.specialPolymorph = special;
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.polymorphed += 1;
            party.isPolymorphed = true;
        };
    };
    renewal = (id: string) => {
        // this.combatMachine.action({ data: { key: "player", value: 10, id: this.context?.player?.playerID }, type: "Health" });
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
        this.context.targetTarget = enemy;
        enemy.isRooted = true;
        enemy.count.rooted += 1;
    };
    scream = (id: string, origin: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.useGrace(10);
            this.context.player.isFeared = true;
            return;    
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.isFeared = true;
            enemy.count.feared++;
            if (origin === this.context.player.playerID) {
                enemy.specialFear = this.context.player.checkTalentEnhanced(States.FEAR);
            };
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
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.slowed++;
            enemy.isSlowed = true;
            enemy.slowDuration = time;
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.slowed++;
            party.isSlowed = true;
            party.slowDuration = time;
        };
    };
    snare = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.context.player.isSnared = true;
            this.useGrace(5);
            this.useStamina(5);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.snared += 1;
            enemy.isSnared = true;
            return;    
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.snared += 1;
            party.isSnared = true;
        };
    };
    stun = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.context.player.isStunned = true;
            this.useStamina(10);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.stunned += 1;
            enemy.isStunned = true;
            return;    
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.stunned += 1;
            party.isStunned = true;
        };
    };
    stunned = (id: string): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            this.context.player.isStunned = true;
            this.useStamina(10);
            return;
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) {
            enemy.count.stunned += 1;
            enemy.isStunned = true;
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            party.count.stunned += 1;
            party.isStunned = true;
        };
    };
    disease = (combatID: string, enemySpecialID?: string): void => {
        if (!combatID) return;
        if (combatID === this.context?.player?.playerID && enemySpecialID) { // Enemy Special is Damaging Player
            const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemySpecialID);
            if (origin.checkPlayerResist()) {
                origin.chiomic(10, combatID);
            };
            return;
        };
        const enemy = this.context.enemies.find((e: Enemy) => e.enemyID === combatID);
        if (enemy) { // Enemy Taking Damage
            if (enemySpecialID === this.context.player.playerID) {
                if (enemy.enemyID === this.context.player.getEnemyId()) {
                    this.combatMachine.action({ type: "Chiomic", data: this.context.player.entropicMultiplier(20) }); 
                } else {
                    if (enemy.health <= 0) return;
                    const tendril = Math.round(this.context.player.playerMachine.mastery() * (1 + (this.context.player.entropicMultiplier(20) / 100)) 
                        * this.context.combatManager.playerCaerenicPro() * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy) * this.context.player.playerMachine.levelModifier());
                    const newComputerHealth = enemy.health - tendril < 0 ? 0 : enemy.health - tendril;
                    const playerActionDescription = `Your wreathing tendrils rip ${tendril} health from ${enemy.ascean?.name}.`;
                    EventBus.emit("add-combat-logs", { ...this.context, playerActionDescription });
                    this.combatMachine.action({ type: "Health", data: { key: "enemy", value: newComputerHealth, id: enemy.enemyID } });
                };
            } else {
                const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemySpecialID);
                if (origin) { // CvC
                    // const damage = Math.round(origin.ascean[origin.ascean.mastery as keyof typeof origin.ascean]);
                    const damage = Math.round(origin.mastery() / 2 * this.computerCaerenicPro(origin) 
                        * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                        * (1 + (origin.entropicMultiplier(10))) * ((origin.ascean.level + 9) / 10));
                    this.updateComputerDamage(damage, combatID, enemySpecialID as string);
                } else {
                    const party = this.context.party.find((e: Party) => e.enemyID === enemySpecialID);
                    if (!party) return;
                    const damage = Math.round(party.mastery() / 2 * this.computerCaerenicPro(party) 
                        * this.computerCaerenicNeg(enemy) * this.computerStalwart(enemy)
                        * (1 + (party.entropicMultiplier(10))) * ((party.ascean.level + 9) / 10));
                    // const damage = Math.round(party.ascean[party?.ascean.mastery as keyof typeof party.ascean]);
                    this.updateComputerDamage(damage, combatID, enemySpecialID as string);
                };  
            };
        } else { // Party Taking Damage
            const party = this.context.party.find((e: Party) => e.enemyID === combatID);
            if (party) {
                const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemySpecialID);
                if (origin) { // CvC
                    const damage = Math.round(origin.mastery() / 2 * this.computerCaerenicPro(origin) 
                    * this.computerCaerenicNeg(party) * this.computerStalwart(party)
                    * (1 + (origin.entropicMultiplier(10))) * ((origin.ascean.level + 9) / 10));
                    // const damage = Math.round(origin.ascean[origin.ascean.mastery as keyof typeof origin.ascean]);
                    this.updateComputerDamage(damage, combatID, enemySpecialID as string);
                };
            };
        };
    };
    writhe = (id: string, enemyID: string, type = "writhe"): void => {
        if (!id) return;
        if (id === this.context.player.playerID) {
            let en = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            if (!en) return;
            if (en.isCurrentTarget) {
                this.combatMachine.action({ type: "Weapon", data: { key: "computerAction", value: type, id: en.enemyID } });
            } else {
                this.combatMachine.action({ type: "Enemy", data: { 
                    enemyID: en.enemyID, ascean: en.ascean, damageType: en.currentDamageType, combatStats: en.combatStats, weapons: en.weapons, health: en.health, 
                    actionData: { action: type, parry: en.parryAction, id: enemyID }}});
            };
            this.useGrace(10);
            return;    
        };
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy) { // Enemy Taking Damage
            if (enemyID === this.context.player.playerID) { // Player Combat
                const match = this.context.isStateEnemy(id);
                if (match) { // Target Player Attack
                    this.combatMachine.action({ type: "Weapon",  data: { key: "action", value: type } });
                } else { // Blind Player Attack
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
            this.combatMachine.input("isInsight",false);
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
            this.combatMachine.input("isQuicken",false);
            return;
        };
        EventBus.emit("update-stamina", value);
        this.context.player.stamina -= value;
    };
};