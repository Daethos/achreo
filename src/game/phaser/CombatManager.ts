import CombatMachine from '../phaser/CombatMachine';
import Enemy from '../entities/Enemy';
import { EventBus } from '../EventBus';
import Player from '../entities/Player';
import { Play } from '../main';
import StatusEffect, { PRAYERS } from '../../utility/prayer';
import ComputerMachine from './ComputerMachine';

export class CombatManager extends Phaser.Scene {
    combatMachine: CombatMachine;
    computerMachine: ComputerMachine;
    context: Play;

    constructor(scene: Play) {
        super('Combat');
        this.context = scene;
        this.combatMachine = new CombatMachine(this);
        this.computerMachine = new ComputerMachine(this);    
    };
        
    checkPlayerSuccess = (): void => {
        if (!this.context.player.actionSuccess && (this.context.state.action !== 'parry' && this.context.state.action !== 'roll' && this.context.state.action !== '')) this.combatMachine.input('action', '');
    };

    ifPlayer = (concern: string) => {
        return this.context.player[concern];
    };

    // ============================ Magic Impact ============================= \\
    magic = (entity: Player | Enemy, target: Player | Enemy): void => {
        // FIXME: This has the originator (ENTITY) and target hit. Enough to correctly orient it for figuring out if it's PLAYER v COMPUTER, or COMPUTER v COMPUTER
        if (target.health <= 0) return;
        if (target.name === 'player') {
            const damage = Math.round(entity.ascean?.[entity?.ascean?.mastery as keyof typeof this.context.state.player] * 0.2);
            const health = target.health - damage;
            this.combatMachine.action({ data: { key: 'player', value: health, id: (entity as Enemy).enemyID }, type: 'Set Health' });
        } else {
            const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 0.2);
            const health = target.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id: (target as Enemy).enemyID }, type: 'Health' });
        };
    };


    // ============================ Combat Specials ============================ \\ 
    playerMelee = (id: string, type: string): void => {
        // FIXME: Change to be id agnostic, it first attempts to find ENEMY, then PLAYER, then PARTY ?
        if (!id) return;
        let enemy = this.context.enemies.find((e: any) => e.enemyID === id);
        if (!enemy) return;
        const match = this.context.isStateEnemy(id);
        if (match) { // Target Player Attack
            this.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: type } });
        } else { // Blind Player Attack
            if (enemy.health === 0) return;
            this.combatMachine.action({ type: 'Player', data: { 
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
        // FIXME: Change to be id agnostic, it first attempts to find ENEMY, then PLAYER, then PARTY ?
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0) {
            const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 1);
            const health = enemy.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
            enemy.count.stunned += 1;    
            enemy.isStunned = true;
        } else if (id === this.context.player.playerID) {
            let caster = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
            caster.chiomic(15);
            this.context.player.isStunned = true;
        };
    };
    blind = (id: string): void => {
        // FIXME: Change to be id agnostic, it first attempts to find ENEMY, then PLAYER, then PARTY ?
        if (!id) return;
        let enemy = this.context.enemies.find((e: any) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0) {
            enemy.count.feared += 1;
            enemy.isFeared = true;
            const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 1);
            const health = enemy.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
        } else if (id === this.context.player.playerID) {

        };
    };
    caerenesis = (id: string): void => {
        // FIXME: Change to be id agnostic, it first attempts to find ENEMY, then PLAYER, then PARTY ?
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0) {
            enemy.isParalyzed = true;
            if (this.context.player.currentTarget && this.context.player.currentTarget.enemyID === this.context.player.getEnemyId()) {
                this.combatMachine.action({ type: 'Tshaeral', data: 15 });
            } else {
                const drained = Math.round(this.context.state.playerHealth * 0.15 * (this.context.player.isCaerenic ? 1.15 : 1) * ((this.context.state.player?.level as number + 9) / 10));
                const newPlayerHealth = drained / this.context.state.playerHealth * 100;
                const newHealth = enemy.health - drained < 0 ? 0 : enemy.health - drained;
                const tshaeralDescription = `You tshaer and devour ${drained} health from ${enemy.ascean?.name}.`;
                EventBus.emit('add-combat-logs', { ...this.context.state, playerActionDescription: tshaeralDescription });
                this.combatMachine.action({ type: 'Health', data: { key: 'player', value: newPlayerHealth, id: this.context.player.playerID } });
                this.combatMachine.action({ type: 'Health', data: { key: 'enemy', value: newHealth, id: enemy.enemyID } });
            };
        };
    };
    chiomic = (id: string): void => {
        // FIXME: Change to be id agnostic, it first attempts to find ENEMY, then PLAYER, then PARTY ?
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.useGrace(10);
            this.context.player.isConfused = true;
        } else {
            enemy.count.confused += 1;
            enemy.isConfused = true;
        };
    };
    confuse = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.useGrace(10);
            this.context.player.isConfused = true;
        } else {
            enemy.count.confused += 1;
            enemy.isConfused = true;
        };
    };
    fear = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.useGrace(10);
            this.context.player.isFeared = true;
        } else {
            enemy.isFeared = true;
            enemy.count.feared += 1;
        };
    };
    freeze = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.useGrace(10);
            this.context.player.isFrozen = true;
        } else {
            enemy.count.frozen += 1;
            enemy.isFrozen = true;
        };
    };
    fyerus = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0 && enemy.isDefeated !== true) {
            const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 0.35) * (this.context.player.isCaerenic ? 1.15 : 1) * ((this.context.state.player?.level as number + 9) / 10);
            const health = enemy.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
            enemy.slowDuration = 950;
            enemy.count.slowed += 1;
            enemy.isSlowed = true;
        };
    };
    howl = (id: string): void => {
        if (!id) return;
        this.stunned(id);
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0 && enemy.isDefeated !== true) {
            const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 0.75);
            const health = enemy.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
        };
    };
    kynisos = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.context.player.isRooted = true;
        } else {
            this.root(id);
            const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player]) * (this.context.player.isCaerenic ? 1.15 : 1) * ((this.context.state.player?.level as number + 9) / 10);
            const health = enemy.health - damage;
            this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
        };
    };
    paralyze = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.useGrace(15);
            this.context.player.isParalyzed = true;
        } else {
            enemy.count.paralyzed += 1;
            enemy.isParalyzed = true;
        };
    };
    polymorph = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.context.player.isPolymorphed = true;
        } else {
            enemy.count.polymorphed += 1;
            enemy.isPolymorphed = true;
        };
    };
    renewal = () => {
        this.combatMachine.action({ data: { key: 'player', value: 10, id: this.context.player.playerID }, type: 'Health' });
    };
    enemyRenewal = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) return;
        const heal = enemy.ascean.health.max * 0.1;
        const health = Math.min(enemy.health + heal, enemy.ascean.health.max);
        this.combatMachine.action({ data: { key: 'enemy', value: health, id }, type: 'Health' });
    };
    root = (id: string): void => {
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) return;
        this.context.targetTarget = enemy;
        enemy.isRooted = true;
        enemy.count.rooted += 1;
        // let x = enemy.x; // this.rightJoystick.pointer.x;
        // let x2 = window.innerWidth / 2;
        // let y = enemy.y; // this.rightJoystick.pointer.y;
        // let y2 = window.innerHeight / 2;
        // const worldX = (x > x2 ? x : -x) + this.context.player.x;
        // const worldY = (y > y2 ? y : -y) + this.context.player.y;
        // const duration = Phaser.Math.Distance.Between(this.context.player.x, this.context.player.y, worldX, worldY);
        // const rootTween = this.context.add.tween({
        //     targets: this.context.target,
        //     x: { from: this.context.player.x, to: worldX, duration: 1000 },
        //     y: { from: this.context.player.y, to: worldY, duration: 1000 }, 
        //     ease: 'Linear',
        //     yoyo: false,
        //     onStart: () => {
        //         this.context.target.setVisible(true);
        //         enemy.isRooted = true;
        //         enemy.count.rooted += 1;
        //     },    
        //     onComplete: () => {
        //         this.context.time.delayedCall(3000 - duration, () => {
        //             this.context.target.setVisible(false);
        //             rootTween.destroy();
        //         }, undefined, this);
        //     }, 
        // });
    };
    scream = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.useGrace(15);
            this.context.player.isFeared = true;
        } else {
            enemy.isFeared = true;
            enemy.count.feared += 1;
        };
    };
    slow = (id: string, time: number = 3000): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            if (this.context.player.isSnared) return;
            this.context.player.isSlowed = true;
            this.context.player.slowDuration = time;
        } else {
            enemy.count.slowed += 1;
            enemy.isSlowed = true;
            enemy.slowDuration = time;
        };
    };
    snare = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.context.player.isSnared = true;
            if (this.context.player.isSlowed) this.context.player.isSlowed = false;
        } else {
            enemy.count.snared += 1;
            enemy.isSnared = true;
        };
    };
    stun = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.context.player.isStunned = true;
            this.useStamina(15);
        } else {
            enemy.count.stunned += 1;
            enemy.isStunned = true;
        };
    };
    stunned = (id: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            this.context.player.isStunned = true;
            this.useStamina(15);
        } else {
            enemy.count.stunned += 1;
            enemy.isStunned = true;
        };
    };
    tendril = (id: string, _enemyID: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (enemy !== undefined && enemy.health > 0 && enemy.isDefeated !== true) {
            const damage = Math.round(this.context.state?.player?.[this.context.state?.player?.mastery as keyof typeof this.context.state.player] * 0.3);
            const total = Math.max(0, enemy.health - damage);
            this.combatMachine.action({ data: { key: 'enemy', value: total, id }, type: 'Health' });
        } else if (id === this.context.player.playerID) {
            this.combatMachine.action({ data: 10, type: 'Enemy Chiomic' });
        };
    };
    writhe = (id: string, enemyID?: string): void => {
        if (!id) return;
        let enemy = this.context.enemies.find((e: Enemy) => e.enemyID === id);
        if (!enemy) {
            if (id === this.context.player.playerID) {
                let en = this.context.enemies.find((e: Enemy) => e.enemyID === enemyID);
                if (!en) return;
                if (en.isCurrentTarget) {
                    this.combatMachine.action({ type: 'Weapon', data: { key: 'computerAction', value: 'writhe', id: en.enemyID } });
                } else {
                    this.combatMachine.action({ type: 'Enemy', data: { 
                        enemyID: en.enemyID, ascean: en.ascean, damageType: en.currentDamageType, combatStats: en.combatStats, weapons: en.weapons, health: en.health, 
                        actionData: { action: 'writhe', parry: en.parryAction, id: enemyID }}});
                };
                this.useGrace(10);
            };
        } else {
            const match = this.context.isStateEnemy(id);
            if (match) { // Target Player Attack
                this.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: 'writhe' } });
            } else { // Blind Player Attack
                this.combatMachine.action({ type: 'Player', data: { 
                    playerAction: { action: 'writhe', parry: this.context.state.parryGuess }, 
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
    };
    caerenic = (): boolean => EventBus.emit('update-caerenic');
    stalwart = (): boolean => EventBus.emit('update-stalwart');
    useGrace = (value: number) => {
        if (this.context.state.isInsight && value > 0) {
            const effect = this.context.state.playerEffects.find((prayer: StatusEffect) => prayer.prayer === PRAYERS.INSIGHT);
            if (effect) {
                this.combatMachine.action({ type: 'Remove Effect', data: effect });
            };
            this.combatMachine.input('isInsight',false);
            return;
        };
        EventBus.emit('update-grace', value);
        this.context.player.grace -= value;
    };
    useStamina = (value: number) => {
        EventBus.emit('update-stamina', value);
        this.context.player.stamina -= value;
    };
};