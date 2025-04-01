import CombatMachine from "../phaser/CombatMachine";
import Enemy from "../entities/Enemy";
import { EventBus } from "../EventBus";
import Player from "../entities/Player";
import { Play } from "../main";
import StatusEffect, { PRAYERS } from "../../utility/prayer";
import { COMPUTER_BROADCAST, NEW_COMPUTER_ENEMY_HEALTH, UPDATE_COMPUTER_COMBAT, UPDATE_COMPUTER_DAMAGE } from "../../utility/enemy";
import { computerCombatCompiler } from "../../utility/computerCombat";
import Party from "../entities/PartyComputer";
import { States } from "./StateMachine";
import { HEAL } from "./ScrollingCombatText";
import { PLAYER } from "../../utility/player";

export class CombatManager {
    combatMachine: CombatMachine;
    context: Play;

    constructor(scene: Play) {
        this.context = scene;
        this.combatMachine = new CombatMachine(this);
    };
        
    checkPlayerSuccess = (): void => {
        if (!this.context.player.actionSuccess && (this.context.state.action !== "parry" && this.context.state.action !== "roll" && this.context.state.action !== "")) this.combatMachine.input("action", "");
    };

    ifPlayer = (concern: string) => {
        return this.context.player[concern];
    };

    playerCaerenicNeg = () => this.context.player.isCaerenic ? 1.25 : 1;
    playerCaerenicPro = () => this.context.player.isCaerenic ? 1.15 : 1;

    // ============================ Computer Combat ============================= \\
    computer = (combat: { type: string; payload: { action: string; origin: string; enemyID: string; } }) => {
        const { type, payload } = combat;
        const { action, origin, enemyID } = payload;
        switch (type) {
            case "Weapon":
                let computerOne = this.context.enemies.find((e: Enemy) => e.enemyID === origin).computerCombatSheet;
                let computerTwo;
                let computer = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
                if (computer) {
                    computerTwo = computer.computerCombatSheet;
                } else {
                    computerTwo = this.context.party.find((e: Party) => e.enemyID === enemyID)?.computerCombatSheet;
                };
                computerOne.computerAction = action;
                computerOne.computerEnemyAction = computerTwo.computerAction;
                computerTwo.computerEnemyAction = action;
                computerOne.enemyID = computerTwo.personalID;
                computerTwo.enemyID = computerOne.personalID;
                const result = computerCombatCompiler({computerOne, computerTwo});
                EventBus.emit(UPDATE_COMPUTER_COMBAT, result?.computerOne);
                EventBus.emit(UPDATE_COMPUTER_COMBAT, result?.computerTwo);
                break;
            default: break;
        };
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
            EventBus.emit(COMPUTER_BROADCAST, { id: (target as Enemy | Party).enemyID, key: NEW_COMPUTER_ENEMY_HEALTH, value: health });
            EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id: (target as Enemy | Party).enemyID, origin: (entity as Enemy | Party).enemyID });
        };
    };

    partyAction = (payload: { action: string; origin: string; enemyID: string; }) => {
        const { action, origin, enemyID } = payload;
        let computerOne = this.context.party.find((e: Party) => e.enemyID === origin)!.computerCombatSheet;
        let computerTwo = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID).computerCombatSheet;
        computerOne.computerAction = action;
        computerOne.computerEnemyAction = computerTwo.computerAction;
        computerTwo.computerEnemyAction = action;
        computerOne.enemyID = computerTwo.personalID;
        computerTwo.enemyID = computerOne.personalID;
        const result = computerCombatCompiler({computerOne,computerTwo});
        EventBus.emit(UPDATE_COMPUTER_COMBAT, result?.computerOne);
        EventBus.emit(UPDATE_COMPUTER_COMBAT, result?.computerTwo);
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
                const damage = Math.round(this.context.state?.player?.[this.context.state?.player.mastery as keyof typeof this.context.state.player]);
                const health = enemy.health - damage;
                this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
                return;
            };
            const comp = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            if (comp) { // CvC Combat
                const damage = Math.round(comp.ascean[comp.ascean.mastery as keyof typeof comp.ascean]);
                EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin: enemyID });
                return;
            } else { // Party Combat
                const party = this.context.party.find((e: Party) => e.enemyID === enemyID);
                if (party) {  
                    const damage = Math.round(party.ascean[party.ascean.mastery as keyof typeof party.ascean]);
                    EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin: enemyID });
                };
            };
            return;
        };
        let party = this.context.party.find((e: Party) => e.enemyID === id);
        if (party) {
            if (party.health <= 0) return;
            const comp = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            if (comp) {
                const damage = Math.round(comp.ascean[comp.ascean.mastery as keyof typeof comp.ascean]);
                EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin: enemyID });
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
                const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 1);
                const health = enemy.health - damage;
                this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
                enemy.specialFear = this.context.player.checkTalentEnhanced(States.FEAR);
            } else { // Party Combat
                const party = this.context.party.find((e: Party) => e.enemyID === origin);
                if (party) {
                    const damage = Math.round(party.ascean[party?.ascean.mastery as keyof typeof party.ascean]);
                    EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin });
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
                if (this.context.player.currentTarget && this.context.player.currentTarget.enemyID === this.context.player.getEnemyId()) {
                    this.combatMachine.action({ type: "Tshaeral", data: 15 });
                } else {
                    const drained = Math.round(this.context.state.playerHealth * 0.15 * (this.context.player.isCaerenic ? 1.15 : 1) * ((this.context.state.player?.level as number + 9) / 10));
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
                    const damage = Math.round(party.computerCombatSheet.computerHealth * 0.15);
                    const newComputerHealth = Math.min(party.health + damage, party.computerCombatSheet.computerHealth);
                    party.health = newComputerHealth;
                    party.computerCombatSheet.newComputerHealth = party.health;
                    EventBus.emit(COMPUTER_BROADCAST, { id: origin, key: NEW_COMPUTER_ENEMY_HEALTH, value: party.health })
                    EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin });
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
                const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 0.35) * (this.context.player.isCaerenic ? 1.15 : 1) * ((this.context.state.player?.level as number + 9) / 10);
                const health = enemy.health - damage;
                this.combatMachine.action({ data: { key: "enemy", value: health, id }, type: "Health" });
            } else { // Party
                const party = this.context.party.find((e: Party) => e.enemyID === origin);
                if (party) {
                    const damage = Math.round(party.ascean[party.ascean.mastery as keyof typeof party.ascean] * 0.35);
                    EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin });
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
            EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id, origin });
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
                enemy.scrollingCombatText = this.context.showCombatText(`${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false, () => enemy.scrollingCombatText = undefined);
                EventBus.emit(COMPUTER_BROADCAST, { id, key: NEW_COMPUTER_ENEMY_HEALTH, value: health });    
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
            party.scrollingCombatText = this.context.showCombatText(`${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false, () => party.scrollingCombatText = undefined);
            EventBus.emit(COMPUTER_BROADCAST, { id, key: NEW_COMPUTER_ENEMY_HEALTH, value: health });    
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
            enemy.scrollingCombatText = this.context.showCombatText(`${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false, () => enemy.scrollingCombatText = undefined);
            EventBus.emit(COMPUTER_BROADCAST, { id, key: NEW_COMPUTER_ENEMY_HEALTH, value: health });    
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
            party.scrollingCombatText = this.context.showCombatText(`${Math.round(heal)}`, PLAYER.DURATIONS.TEXT, HEAL, false, false, () => party.scrollingCombatText = undefined);
            EventBus.emit(COMPUTER_BROADCAST, { id, key: NEW_COMPUTER_ENEMY_HEALTH, value: health });    
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
    tendril = (combatID: string, enemySpecialID?: string): void => {
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
                if (this.context.player.spellTarget === this.context.player.getEnemyId()) {
                    this.combatMachine.action({ type: "Chiomic", data: this.context.player.entropicMultiplier(20) }); 
                } else {
                    if (!enemy || enemy.health <= 0 || enemy.isDefeated) return;
                    const tendril = Math.round(this.context.player.mastery() * (1 + (this.context.player.entropicMultiplier(20) / 100)) * this.context.player.caerenicDamage() * this.context.player.levelModifier());
                    const newComputerHealth = enemy.health - tendril < 0 ? 0 : enemy.health - tendril;
                    const playerActionDescription = `Your wreathing tendrils rip ${tendril} health from ${enemy.ascean?.name}.`;
                    EventBus.emit("add-combat-logs", { ...this.context, playerActionDescription });
                    this.combatMachine.action({ type: "Health", data: { key: "enemy", value: newComputerHealth, id: this.context.player.spellTarget } });
                };
            } else {
                const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemySpecialID);
                if (origin) { // CvC
                    const damage = Math.round(origin.ascean[origin.ascean.mastery as keyof typeof origin.ascean] * 0.3);
                    EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id: combatID, origin: enemySpecialID });
                } else {
                    const party = this.context.party.find((e: Party) => e.enemyID === enemySpecialID);
                    if (!party) return;
                    const damage = Math.round(party.ascean[party?.ascean.mastery as keyof typeof party.ascean] * 0.3);
                    EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id: combatID, origin: enemySpecialID });
                };  
            };
        } else { // Party Taking Damage
            const party = this.context.party.find((e: Party) => e.enemyID === combatID);
            if (party) {
                const origin = this.context.enemies.find((e: Enemy) => e.enemyID === enemySpecialID);
                if (origin) { // CvC
                    const damage = Math.round(origin.ascean[origin.ascean.mastery as keyof typeof origin.ascean] * 0.3);
                    EventBus.emit(UPDATE_COMPUTER_DAMAGE, { damage, id: combatID, origin: enemySpecialID });
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