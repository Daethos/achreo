import StateMachine, { StateInterface, States } from "./StateMachine";

    this.addState(States.CLEAN, {
        onEnter: this.onCleanEnter,
        onExit: this.onCleanExit,
    })
    this.addState(States.CHIOMIC, {
        onEnter: this.onChiomicEnter,
        onUpdate: this.onChiomicUpdate,
        onExit: this.onChiomicExit,
    })
    this.addState(States.DISEASE, {
        onEnter: this.onDiseaseEnter,
        onUpdate: this.onDiseaseUpdate,
        onExit: this.onDiseaseExit,
    })
    this.addState(States.ENVELOP, {
        onEnter: this.onEnvelopEnter,
        onUpdate: this.onEnvelopUpdate,
        onExit: this.onEnvelopExit,
    })
    this.addState(States.FREEZE, {
        onEnter: this.onFreezeEnter,
        onUpdate: this.onFreezeUpdate,
        onExit: this.onFreezeExit,
    })
    this.addState(States.HOWL, {
        onEnter: this.onHowlEnter,
        onUpdate: this.onHowlUpdate,
        onExit: this.onHowlExit,
    })
    this.addState(States.MALICE, {
        onEnter: this.onMaliceEnter,
        onUpdate: this.onMaliceUpdate,
        onExit: this.onMaliceExit,
    })
    this.addState(States.MEND, {
        onEnter: this.onMendEnter,
        onUpdate: this.onMendUpdate,
        onExit: this.onMendExit,
    })
    this.addState(States.STEALTH, {
        onEnter: this.onStealthEnter,
        onUpdate: this.onStealthUpdate,
        onExit: this.onStealthExit,
    })
    this.addState(States.PROTECT, {
        onEnter: this.onProtectEnter,
        onUpdate: this.onProtectUpdate,
        onExit: this.onProtectExit,
    })
    this.addState(States.RECOVER, {
        onEnter: this.onRecoverEnter,
        onUpdate: this.onRecoverUpdate,
        onExit: this.onRecoverExit,
    })
    this.addState(States.RENEWAL, {
        onEnter: this.onRenewalEnter,
        onUpdate: this.onRenewalUpdate,
        onExit: this.onRenewalExit,
    })
    this.addState(States.SCREAM, {
        onEnter: this.onScreamEnter,
        onUpdate: this.onScreamUpdate,
        onExit: this.onScreamExit,
    })
    this.addState(States.SHIELD, {
        onEnter: this.onShieldEnter,
        onUpdate: this.onShieldUpdate,
        onExit: this.onShieldExit,
    })
    this.addState(States.SHIMMER, {
        onEnter: this.onShimmerEnter,
        onUpdate: this.onShimmerUpdate,
        onExit: this.onShimmerExit,
    })
    this.addState(States.SPRINTING, {
        onEnter: this.onSprintEnter,
        onUpdate: this.onSprintUpdate,
        onExit: this.onSprintExit,
    })
    this.addState(States.WARD, {
        onEnter: this.onWardEnter,
        onUpdate: this.onWardUpdate,
        onExit: this.onWardExit,
    })
    this.addState(States.WRITHE, {
        onEnter: this.onWritheEnter,
        onUpdate: this.onWritheUpdate,
        onExit: this.onWritheExit,
    }) // ==================== NEGATIVE META STATES ==================== //
    this.addState(States.FROZEN, {
        onEnter: this.onFrozenEnter,
        // onUpdate: this.onFrozenUpdate,
        onExit: this.onFrozenExit,
    })
    this.addState(States.SLOWED, {
        onEnter: this.onSlowedEnter,
        // onUpdate: this.onSlowedUpdate,
        onExit: this.onSlowedExit,
    })
    this.addState(States.SNARED, {
        onEnter: this.onSnaredEnter,
        // onUpdate: this.onSnaredUpdate,
        onExit: this.onSnaredExit,
    })

playerMetaMachine.setState(States.CLEAN);

export class PlayerStateMachine extends StateMachine {
    constructor(context?: object, id?: string) {
        super();
    };
    // playerStateMachine.setState(States.NONCOMBAT);

onNonCombatEnter = () => {
    this?.context?.anims.play('player_idle', true);
    if (this?.context?.scene.combatTimer) this?.context?.scene.stopCombatTimer();
    if (this?.context?.currentRound !== 0) this?.context?.currentRound = 0;
};
onNonCombatUpdate = (_dt) => {
    if (this?.context?.isMoving) this?.context?.isMoving = false;
    if (this?.context?.inCombat) this?.context?.stateMachine.setState(States.COMBAT);
};
onNonCombatExit = () => {
    this?.context?.anims.stop('player_idle');
};

onCombatEnter = () => {};
onCombatUpdate = (_dt) => { 
    if (!this?.context?.inCombat) this?.context?.stateMachine.setState(States.NONCOMBAT);  
}; 

onAttackEnter = () => {
    if (this?.context?.isRanged === true && this?.context?.inCombat === true) {
        const correct = this?.context?.getEnemyDirection(this?.context?.currentTarget);
        if (!correct) {
            console.log(`%c Error (Attack): You are not looking at nor targeting an enemy.`, 'color: #ff0000');
            return;
        };
    };
    if (this?.context?.isPosturing || this?.context?.isParrying) return;
    this?.context?.isAttacking = true;
    this?.context?.swingReset(States.ATTACK, true);
    // this?.context?.swingReset(States.POSTURE);
    this?.context?.scene.useStamina(this?.context?.staminaModifier + PLAYER.STAMINA.ATTACK);
}; 
onAttackUpdate = (_dt) => {
    if (this?.context?.frameCount === FRAME_COUNT.ATTACK_LIVE && !this?.context?.isRanged) {
        this?.context?.scene.combatMachine.input('action', 'attack');
    };
    this?.context?.combatChecker(this?.context?.isAttacking);
}; 
onAttackExit = () => {
    if (this?.context?.scene.state.action !== '') {
        this?.context?.scene.combatMachine.input('action', '');
    };
};

onParryEnter = () => {
    this?.context?.isParrying = true;    
    this?.context?.swingReset(States.PARRY, true);
    this?.context?.scene.useStamina(this?.context?.staminaModifier + PLAYER.STAMINA.PARRY);
    if (this?.context?.hasMagic === true) {
        this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Counter Spell', 750, 'hush');
        this?.context?.isCounterSpelling = true;
        this?.context?.flickerCarenic(750); 
        this?.context?.scene.time.delayedCall(750, () => {
            this?.context?.isCounterSpelling = false;
        }, undefined, this);
    };
};
onParryUpdate = (_dt) => {
    if (this?.context?.frameCount === FRAME_COUNT.PARRY_LIVE && !this?.context?.isRanged) {
        this?.context?.scene.combatMachine.input('action', 'parry');
    };
    this?.context?.combatChecker(this?.context?.isParrying);
};
onParryExit = () => {
    if (this?.context?.scene.state.action !== '') {
        this?.context?.scene.combatMachine.input('action', '');
    };
};

onPostureEnter = () => {
    if (this?.context?.isRanged === true) {
        if (this?.context?.isMoving === true) { // The || needs to be a check that the player is 'looking at' the enemy
            console.log(`%c Error (Posture): You are moving. Please Stand Still.`, 'color: #ff0');
            return;
        };
        const correct = this?.context?.getEnemyDirection(this?.context?.currentTarget);
        if (!correct && this?.context?.inCombat === true) {
            console.log(`%c Error (Posture): You are not looking at nor targeting an enemy.`, 'color: #f00');
            return;
        };
    };
    if (this?.context?.isAttacking || this?.context?.isParrying) return;
    this?.context?.isPosturing = true;
    this?.context?.swingReset(States.POSTURE, true);
    this?.context?.scene.useStamina(this?.context?.staminaModifier + PLAYER.STAMINA.POSTURE);
};
onPostureUpdate = (_dt) => {
    if (this?.context?.frameCount === FRAME_COUNT.POSTURE_LIVE && !this?.context?.isRanged) { //
        this?.context?.scene.combatMachine.input('action', 'posture');
    };
    this?.context?.combatChecker(this?.context?.isPosturing);
};
onPostureExit = () => {
    if (this?.context?.scene.state.action !== '') {
        this?.context?.scene.combatMachine.input('action', '');
    };
};

onDodgeEnter = () => {
    if (this?.context?.isStalwart || this?.context?.isStorming || this?.context?.isRolling) return;
    this?.context?.isDodging = true;
    this?.context?.swingReset(States.DODGE, true);
    this?.context?.scene.useStamina(PLAYER.STAMINA.DODGE);
    this?.context?.scene.sound.play('dodge', { volume: this?.context?.scene.settings.volume });
    this?.context?.wasFlipped = this?.context?.flipX; 
    this?.context?.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
    this?.context?.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
    this?.context?.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
    this?.context?.body.parts[0].vertices[0].x += this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[1].x += this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[0].vertices[1].x += this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[0].x += this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
};
onDodgeUpdate = (_dt) => { 
    this?.context?.combatChecker(this?.context?.isDodging);
};
onDodgeExit = () => {
    if (this?.context?.isStalwart || this?.context?.isStorming) return;
    this?.context?.spriteWeapon.setVisible(true);
    this?.context?.dodgeCooldown = 0;
    this?.context?.isDodging = false;
    this?.context?.body.parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
    this?.context?.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
    this?.context?.body.parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT; 
    this?.context?.body.parts[0].vertices[0].x -= this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[1].x -= this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[0].vertices[1].x -= this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[0].x -= this?.context?.wasFlipped ? PLAYER.COLLIDER.DISPLACEMENT : -PLAYER.COLLIDER.DISPLACEMENT;
};

onRollEnter = () => {
    if (this?.context?.isStalwart || this?.context?.isStorming || this?.context?.isDodging) return;
    this?.context?.isRolling = true;
    this?.context?.swingReset(States.ROLL, true);
    // this?.context?.swingReset(States.DODGE);
    this?.context?.scene.useStamina(this?.context?.staminaModifier + PLAYER.STAMINA.ROLL);
    this?.context?.scene.sound.play('roll', { volume: this?.context?.scene.settings.volume });
    this?.context?.body.parts[2].position.y += PLAYER.SENSOR.DISPLACEMENT;
    this?.context?.body.parts[2].circleRadius = PLAYER.SENSOR.EVADE;
    this?.context?.body.parts[1].vertices[0].y += PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[1].y += PLAYER.COLLIDER.DISPLACEMENT; 
};
onRollUpdate = (_dt) => {
    if (this?.context?.frameCount === FRAME_COUNT.ROLL_LIVE && !this?.context?.isRanged) {
        this?.context?.scene.combatMachine.input('action', 'roll');
    };
    this?.context?.combatChecker(this?.context?.isRolling);
};
onRollExit = () => {
    if (this?.context?.isStalwart || this?.context?.isStorming) return;
    this?.context?.spriteWeapon.setVisible(true);
    this?.context?.rollCooldown = 0; 
    if (this?.context?.scene.state.action !== '') {
        this?.context?.scene.combatMachine.input('action', '');
    };
    this?.context?.body.parts[2].position.y -= PLAYER.SENSOR.DISPLACEMENT;
    this?.context?.body.parts[2].circleRadius = PLAYER.SENSOR.DEFAULT;
    this?.context?.body.parts[1].vertices[0].y -= PLAYER.COLLIDER.DISPLACEMENT;
    this?.context?.body.parts[1].vertices[1].y -= PLAYER.COLLIDER.DISPLACEMENT;
};

onFlaskEnter = () => {
    this?.context?.isHealing = true;
    this?.context?.setStatic(true);
};
onFlaskUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isHealing);
};
onFlaskExit = () => {
    this?.context?.scene.drinkFlask();
    this?.context?.setStatic(false);
};

onAchireEnter = () => {
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Achire', PLAYER.DURATIONS.ACHIRE / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.ACHIRE);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true); // !this?.context?.isCaerenic && 
    this?.context?.castbar.setVisible(true);  
};
onAchireUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.ACHIRE) {
        this?.context?.achireSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) {
        this?.context?.castbar.update(dt, 'cast');
    };
};
onAchireExit = () => {
    if (this?.context?.achireSuccess === true) {
        const anim = this?.context?.getWeaponAnim();
        this?.context?.particleEffect =  this?.context?.scene.particleManager.addEffect('achire', this, anim, true);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `Your Achre and Caeren entwine; projecting it through the ${this?.context?.scene.state.weapons[0].name}.`
        });
        this?.context?.setTimeEvent('achireCooldown', this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000); // PLAYER.COOLDOWNS.SHORT
        this?.context?.achireSuccess = false;
        this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
        this?.context?.scene.useStamina(PLAYER.STAMINA.ACHIRE);    
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onAstraveEnter = () => {
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Astrave', PLAYER.DURATIONS.ASTRAVE / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.ASTRAVE);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true); // !this?.context?.isCaerenic && 
    this?.context?.castbar.setVisible(true);  
    this?.context?.isCasting = true;
};
onAstraveUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.ASTRAVE) {
        this?.context?.astraveSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) {
        this?.context?.castbar.update(dt, 'cast');
    };
};
onAstraveExit = () => {
    if (this?.context?.astraveSuccess === true) {
        this?.context?.aoe = new AoE(this?.context?.scene, 'astrave', 1, false, undefined, true);    
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You unearth the winds and lightning from the land of hush and tendril.`
        });
        this?.context?.setTimeEvent('astraveCooldown', this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : 2000); // PLAYER.COOLDOWNS.SHORT
        this?.context?.astraveSuccess = false;
        this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
        this?.context?.scene.useStamina(PLAYER.STAMINA.ASTRAVE);    
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onArcEnter = () => {
    this?.context?.isArcing = true;
    this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Arcing', PLAYER.DURATIONS.ARCING / 2, 'damage');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.ARCING);
    this?.context?.castbar.setTime(PLAYER.DURATIONS.ARCING, 0xFF0000);
    this?.context?.setStatic(true);
    this?.context?.castbar.setVisible(true); 
    this?.context?.flickerCarenic(3000); 
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You begin arcing with your ${this?.context?.scene.state.weapons[0].name}.`
    });
};
onArcUpdate = (dt) => {
    this?.context?.combatChecker(this?.context?.isArcing);
    if (this?.context?.isArcing) this?.context?.castbar.update(dt, 'channel', 0xFF0000);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.ARCING * 0.25 && this?.context?.castbar.time <= PLAYER.DURATIONS.ARCING * 0.26) {
        this?.context?.isAttacking = true;
    };
    if (this?.context?.castbar.time <= 0) {
        this?.context?.arcSuccess = true;
        this?.context?.isArcing = false;
    };
};
onArcExit = () => {
    if (this?.context?.arcSuccess) {
        this?.context?.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.SHORT);  
        this?.context?.arcSuccess = false;
        this?.context?.scene.useStamina(PLAYER.STAMINA.ARC);
        if (this?.context?.currentTarget && this?.context?.inCombat === true) {
            if (this?.context?.flipX) {
                this?.context?.weaponHitbox.setAngle(270);
            } else {
                this?.context?.weaponHitbox.setAngle(0);
            };
            // this?.context?.weaponHitbox.setPosition(this?.context?.x + (this?.context?.flipX ? -32 : 32), this?.context?.y - 12);  
            this?.context?.weaponHitbox.x = this?.context?.flipX ? this?.context?.x - 32 : this?.context?.x + 32;
            this?.context?.weaponHitbox.y = this?.context?.y - 12;
            if (this?.context?.weaponHitbox.getBounds().contains(this?.context?.currentTarget.x, this?.context?.currentTarget.y)) {
                this?.context?.scene.combatMachine.action({ type: 'Weapon',  data: { key: 'action', value: 'arc' } });
                this?.context?.setTimeEvent('arcCooldown', PLAYER.COOLDOWNS.MODERATE);
            };
        };
        this?.context?.castbar.reset();
        this?.context?.setStatic(false);
    };
};

onBlinkEnter = () => {
    this?.context?.scene.sound.play('caerenic', { volume: this?.context?.scene.settings.volume });
    if (this?.context?.velocity.x > 0) {
        this?.context?.setVelocityX(PLAYER.SPEED.BLINK);
    } else if (this?.context?.velocity.x < 0) {
        this?.context?.setVelocityX(-PLAYER.SPEED.BLINK);
    };
    if (this?.context?.velocity.y > 0) {
        this?.context?.setVelocityY(PLAYER.SPEED.BLINK);
    } else if (this?.context?.velocity.y < 0) {
        this?.context?.setVelocityY(-PLAYER.SPEED.BLINK);
    };
    if (Math.abs(this?.context?.velocity.x) || Math.abs(this?.context?.velocity.y)) {
        this?.context?.scene.useStamina(PLAYER.STAMINA.BLINK);
    };
    const blinkCooldown = this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
    this?.context?.setTimeEvent('blinkCooldown', blinkCooldown);
    this?.context?.flickerCarenic(750); 
};
onBlinkUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isBlinking);
};
onBlinkExit = () => {};

onKyrnaicismEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.MODERATE)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.MODERATE) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.isCasting = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.KYRNAICISM);
    this?.context?.scene.sound.play('absorb', { volume: this?.context?.scene.settings.volume });
    this?.context?.flickerCarenic(3000); 
    // if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true);
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Kyrnaicism', PLAYER.DURATIONS.KYRNAICISM / 2, 'damage');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.KYRNAICISM);
    this?.context?.castbar.setTime(PLAYER.DURATIONS.KYRNAICISM);
    this?.context?.currentTarget.isConsumed = true;
    this?.context?.scene.slow(this?.context?.getEnemyId());
    this?.context?.chiomicTimer = this?.context?.scene.time.addEvent({
        delay: 1000,
        callback: () => {
            if (!this?.context?.isCasting || this?.context?.scene.state.playerWin || this?.context?.scene.state.newComputerHealth <= 0) {
                this?.context?.isCasting = false;
                this?.context?.chiomicTimer.remove(false);
                this?.context?.chiomicTimer = undefined;
                return;
            };
            this?.context?.scene.combatMachine.action({ type: 'Chiomic', data: 10 });
            // updateBeam(this?.context?.scene.time.now);
        },
        callbackScope: this,
        repeat: 3,
    });
    this?.context?.setTimeEvent('kyrnaicismCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.scene.time.addEvent({
        delay: 3000,
        callback: () => {
            this?.context?.isCasting = false;
        },
        callbackScope: this,
        loop: false,
    });
    this?.context?.setStatic(true);
    this?.context?.castbar.setVisible(true);  
};
onKyrnaicismUpdate = (dt) => {
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.isCasting) this?.context?.castbar.update(dt, 'channel', 0xA700FF);
};
onKyrnaicismExit = () => {
    this?.context?.castbar.reset();
    this?.context?.setStatic(false);
    if (this?.context?.chiomicTimer) {
        this?.context?.chiomicTimer.remove(false);
        this?.context?.chiomicTimer = undefined;
    };
    // if (this?.context?.beamTimer) {
    //     this?.context?.beamTimer.remove();
    //     this?.context?.beamTimer = undefined;
    // };
    // this?.context?.chiomicGraphic.destroy();
    // this?.context?.chiomicGraphic = undefined;
};

onConfuseEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.MODERATE)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.LONG) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Confusing', PLAYER.DURATIONS.CONFUSE / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.CONFUSE);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true); // !this?.context?.isCaerenic && 
    this?.context?.castbar.setVisible(true);  
};
onConfuseUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.CONFUSE) {
        this?.context?.confuseSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'cast');
};
onConfuseExit = () => {
    if (this?.context?.confuseSuccess === true) {
        this?.context?.scene.confuse(this?.context?.getEnemyId());
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You confuse ${this?.context?.scene.state.computer?.name}, and they stumble around in a daze.`
        });
        this?.context?.setTimeEvent('confuseCooldown', this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
        this?.context?.confuseSuccess = false;
        this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
        this?.context?.scene.useStamina(PLAYER.STAMINA.CONFUSE);    
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onConsumeEnter = () => {
    if (this?.context?.scene.state.playerEffects.length === 0) return;
    this?.context?.isConsuming = true;
    this?.context?.scene.sound.play('consume', { volume: this?.context?.scene.settings.volume });
    this?.context?.setTimeEvent('consumeCooldown', PLAYER.COOLDOWNS.SHORT);
};
onConsumeUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isConsuming);
};
onConsumeExit = () => {
    if (this?.context?.scene.state.playerEffects.length === 0) return;
    this?.context?.scene.combatMachine.action({ type: 'Consume', data: this?.context?.scene.state.playerEffects[0].id });        
    this?.context?.scene.useStamina(PLAYER.STAMINA.CONSUME);
};

onDesperationEnter = () => {
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Desperation', PLAYER.DURATIONS.HEALING / 2, 'heal');
    this?.context?.scene.useStamina(PLAYER.STAMINA.DESPERATION);
    this?.context?.flickerCarenic(PLAYER.DURATIONS.HEALING); 
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `Your caeren shrieks like a beacon, and a hush of ${this?.context?.scene.state.weapons[0].influences[0]} soothes your body.`
    });
};
onDesperationUpdate = (_dt) => {
    this?.context?.combatChecker(false);
};
onDesperationExit = () => {
    const desperationCooldown = this?.context?.inCombat ? PLAYER.COOLDOWNS.LONG : PLAYER.COOLDOWNS.SHORT;
    this?.context?.setTimeEvent('desperationCooldown', desperationCooldown);  
    this?.context?.scene.combatMachine.action({ data: { key: 'player', value: 50, id: this?.context?.playerID }, type: 'Health' });
    this?.context?.scene.sound.play('phenomena', { volume: this?.context?.scene.settings.volume });
};

onFearingEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.MODERATE)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.LONG) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Fearing', PLAYER.DURATIONS.FEAR / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.FEAR);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true);
    this?.context?.castbar.setVisible(true);  
};
onFearingUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.FEAR) {
        this?.context?.fearSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'cast');
};
onFearingExit = () => {
    if (this?.context?.fearSuccess === true) {
        this?.context?.scene.fear(this?.context?.getEnemyId());
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You strike fear into ${this?.context?.scene.state.computer?.name}!`
        });
        this?.context?.setTimeEvent('fearCooldown', this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
        this?.context?.fearSuccess = false;
        this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
        this?.context?.scene.useStamina(PLAYER.STAMINA.FEAR);    
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onParalyzeEnter = () => { 
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.MODERATE)) return;
    const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    if (distance > PLAYER.RANGE.LONG) {
        this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
        return;    
    };
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Paralyzing', PLAYER.DURATIONS.PARALYZE / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.PARALYZE);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true);
    this?.context?.castbar.setVisible(true); 
};
onParalyzeUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.PARALYZE) {
        this?.context?.paralyzeSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'cast');
};
onParalyzeExit = () => {
    console.log('Paralyze Success: ', this?.context?.paralyzeSuccess);
    if (this?.context?.paralyzeSuccess === true) {
        this?.context?.scene.paralyze(this?.context?.getEnemyId());
        this?.context?.setTimeEvent('paralyzeCooldown', PLAYER.COOLDOWNS.MODERATE);  
        this?.context?.scene.useStamina(PLAYER.STAMINA.PARALYZE);
        this?.context?.paralyzeSuccess = false;
        this?.context?.scene.mysterious.play();
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onFyerusEnter = () => {
    this?.context?.isCasting = true;
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    if (this?.context?.isCasting === false) return;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Fyerus', PLAYER.DURATIONS.FYERUS / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.FYERUS);
    this?.context?.castbar.setTime(PLAYER.DURATIONS.FYERUS);
    this?.context?.castbar.setVisible(true);  
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true); // !this?.context?.isCaerenic && 
    // this?.context?.flickerCarenic(6000);  
    this?.context?.aoe = new AoE(this?.context?.scene, 'fyerus', 6, false, undefined, true);    
    this?.context?.scene.useStamina(PLAYER.STAMINA.FYERUS);    
    this?.context?.setTimeEvent('fyerusCooldown', 2000); // PLAYER.COOLDOWNS.SHORT
    this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You unearth the fires and water from the land of hush and tendril.`
    });
};
onFyerusUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    if (this?.context?.castbar.time <= 0) {
        this?.context?.isCasting = false;
    };
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.isCasting === true) {
        this?.context?.castbar.update(dt, 'channel', 0xE0115F);
    };
};
onFyerusExit = () => {
    this?.context?.castbar.reset();
    this?.context?.isFyerus = false;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onHealingEnter = () => {
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Healing', PLAYER.DURATIONS.HEALING / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.HEALING);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true);
    this?.context?.castbar.setVisible(true);  
};
onHealingUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.HEALING) {
        this?.context?.healingSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'cast', 0x00C200);
};
onHealingExit = () => {
    if (this?.context?.healingSuccess === true) {
        this?.context?.setTimeEvent('healingCooldown', this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);  
        this?.context?.scene.useStamina(PLAYER.STAMINA.HEALING);
        this?.context?.healingSuccess = false;
        this?.context?.scene.combatMachine.action({ data: { key: 'player', value: 25, id: this?.context?.playerID }, type: 'Health' });
        this?.context?.scene.sound.play('phenomena', { volume: this?.context?.scene.settings.volume });
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onInvokeEnter = () => {
    if (!this?.context?.inCombat || !this?.context?.currentTarget) return;
    this?.context?.isPraying = true;
    this?.context?.setStatic(true);
    this?.context?.flickerCarenic(1000); 
    this?.context?.setTimeEvent('invokeCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.invokeCooldown = 30;
    if (this?.context?.playerBlessing === '' || this?.context?.playerBlessing !== this?.context?.scene.state.playerBlessing) {
        this?.context?.playerBlessing = this?.context?.scene.state.playerBlessing;
    };
};
onInvokeUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isPraying);
};
onInvokeExit = () => {
    if (!this?.context?.inCombat || !this?.context?.currentTarget) return;
    this?.context?.setStatic(false);
    this?.context?.scene.combatMachine.action({ type: 'Instant', data: this?.context?.scene.state.playerBlessing });
    this?.context?.scene.sound.play('prayer', { volume: this?.context?.scene.settings.volume });
    this?.context?.scene.useStamina(PLAYER.STAMINA.INVOKE);
};

onKynisosEnter = () => { 
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Kynisos', PLAYER.DURATIONS.KYNISOS / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.KYNISOS);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true); // !this?.context?.isCaerenic && 
    this?.context?.castbar.setVisible(true);   
};
onKynisosUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.KYNISOS) {
        this?.context?.kynisosSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) {
        this?.context?.castbar.update(dt, 'cast');
    };
};
onKynisosExit = () => {
    if (this?.context?.kynisosSuccess === true) {
        this?.context?.aoe = new AoE(this?.context?.scene, 'kynisos', 3, false, undefined, true);    
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You unearth the netting of the golden hunt.`
        });
        this?.context?.setTimeEvent('kynisosCooldown', 2000); // PLAYER.COOLDOWNS.SHORT
        this?.context?.kynisosSuccess = false;
        this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
        this?.context?.scene.useStamina(PLAYER.STAMINA.KYNISOS);    
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
};

onLeapEnter = () => {
    this?.context?.isLeaping = true;
    const target = this?.context?.scene.getWorldPointer();
    const direction = target.subtract(this?.context?.position);
    direction.normalize();
    this?.context?.flipX = direction.x < 0;
    this?.context?.isAttacking = true;
    this?.context?.scene.tweens.add({
        targets: this,
        x: this?.context?.x + (direction.x * 125),
        y: this?.context?.y + (direction.y * 125),
        duration: 750,
        ease: 'Elastic',
        onStart: () => {
            this?.context?.scene.sound.play('leap', { volume: this?.context?.scene.settings.volume });
            this?.context?.flickerCarenic(750); 
        },
        onComplete: () => { 
            this?.context?.scene.useStamina(PLAYER.STAMINA.LEAP);
            this?.context?.isLeaping = false; 
            if (this?.context?.touching.length > 0 && this?.context?.inCombat === true) {
                this?.context?.touching.forEach(enemy => {
                    this?.context?.scene.writhe(enemy.enemyID, 'leap');
                });
            };
        },
    });       
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You launch yourself through the air!`
    });
};
onLeapUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isLeaping);
};
onLeapExit = () => {
    const leapCooldown = this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
    this?.context?.setTimeEvent('leapCooldown', leapCooldown);
};

onRushEnter = () => {
    this?.context?.isRushing = true;
    this?.context?.scene.sound.play('stealth', { volume: this?.context?.scene.settings.volume });        
    const target = this?.context?.scene.getWorldPointer();
    const direction = target.subtract(this?.context?.position);
    direction.normalize();
    this?.context?.flipX = direction.x < 0;
    this?.context?.isParrying = true;
    this?.context?.scene.tweens.add({
        targets: this,
        x: this?.context?.x + (direction.x * 250),
        y: this?.context?.y + (direction.y * 250),
        duration: 500,
        ease: 'Circ.easeOut',
        onStart: () => {
            this?.context?.flickerCarenic(500);  
        },
        onComplete: () => {
            if (this?.context?.rushedEnemies.length > 0 && this?.context?.inCombat === true) {
                this?.context?.rushedEnemies.forEach(enemy => {
                    this?.context?.scene.writhe(enemy.enemyID, 'rush');
                });
            };
            this?.context?.isRushing = false;
        },
    });         
};
onRushUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isRushing);
};
onRushExit = () => {
    this?.context?.rushedEnemies = [];
    const rushCooldown = this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
    this?.context?.setTimeEvent('rushCooldown', rushCooldown);
    this?.context?.scene.useStamina(PLAYER.STAMINA.RUSH);
};

onPolymorphingEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.MODERATE)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.LONG) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Polymorphing', PLAYER.DURATIONS.POLYMORPH / 2, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.POLYMORPH);
    this?.context?.isCasting = true;
    if (!this?.context?.isCaerenic && !this?.context?.isGlowing) this?.context?.checkCaerenic(true);
    this?.context?.castbar.setVisible(true);  
};
onPolymorphingUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.POLYMORPH) {
        this?.context?.polymorphSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'cast');
};
onPolymorphingExit = () => {
    if (this?.context?.polymorphSuccess === true) {
        this?.context?.scene.polymorph(this?.context?.getEnemyId());
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this?.context?.scene.state.computer?.name}, polymorphing them!`
        });
        this?.context?.setTimeEvent('polymorphCooldown', PLAYER.COOLDOWNS.SHORT);  
        this?.context?.scene.useStamina(PLAYER.STAMINA.POLYMORPH);
        this?.context?.polymorphSuccess = false;
        this?.context?.scene.mysterious.play();
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false);
};

onPursuitEnter = () => {
    if (this?.context?.outOfRange(PLAYER.RANGE.LONG)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x || this?.context?.x, this?.context?.currentTarget.y || this?.context?.y);
    // if (distance > PLAYER.RANGE.LONG) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.scene.sound.play('wild', { volume: this?.context?.scene.settings.volume });
    if (this?.context?.currentTarget) {
        if (this?.context?.currentTarget.flipX) {
            this?.context?.setPosition(this?.context?.currentTarget.x + 16, this?.context?.currentTarget.y);
        } else {
            this?.context?.setPosition(this?.context?.currentTarget.x - 16, this?.context?.currentTarget.y);
        };
    };

    this?.context?.scene.useStamina(PLAYER.STAMINA.PURSUIT);
    const pursuitCooldown = this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
    this?.context?.setTimeEvent('pursuitCooldown', pursuitCooldown);
    this?.context?.flickerCarenic(750); 
};
onPursuitUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isPursuing);
};
onPursuitExit = () => {
    if (!this?.context?.inCombat && !this?.context?.isStealthing && !this?.context?.isShimmering) {
        const button = this?.context?.scene.smallHud.stances.find(b => b.texture.key === 'stealth');
        this?.context?.scene.smallHud.pressStance(button);
    };
};

onRootingEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.LONG)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.LONG) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.isCasting = true;
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.ROOTING);
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Rooting', PLAYER.DURATIONS.ROOTING / 2, 'cast');
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true);
    this?.context?.castbar.setVisible(true);
};
onRootingUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.ROOTING) {
        this?.context?.rootingSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'cast');
};
onRootingExit = () => { 
    if (this?.context?.rootingSuccess === true) {
        this?.context?.rootingSuccess = false;
        this?.context?.scene.root();
        this?.context?.setTimeEvent('rootCooldown', PLAYER.COOLDOWNS.SHORT); 
        this?.context?.scene.useStamina(PLAYER.STAMINA.ROOT);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this?.context?.scene.state.computer?.name}, rooting them!`
        });
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false);
};

onSlowEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.LONG)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.LONG) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.isSlowing = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Slow', 750, 'cast');
    this?.context?.scene.sound.play('debuff', { volume: this?.context?.scene.settings.volume });
    this?.context?.scene.slow(this?.context?.getEnemyId());
    this?.context?.scene.useStamina(PLAYER.STAMINA.SLOW);
    this?.context?.setTimeEvent('slowCooldown', PLAYER.COOLDOWNS.SHORT); 
    this?.context?.flickerCarenic(500); 
    this?.context?.scene.time.delayedCall(500, () => { 
        this?.context?.isSlowing = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You ensorcel ${this?.context?.scene.state.computer?.name}, slowing them!`
    });
};
onSlowUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isSlowing);
};
onSlowExit = () => {};

onSacrificeEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.MODERATE)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.MODERATE) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.isSacrificing = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Sacrifice', 750, 'effect');
    this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
    this?.context?.scene.useStamina(PLAYER.STAMINA.SACRIFICE);
    this?.context?.scene.combatMachine.action({ type: 'Sacrifice', data: undefined });
    this?.context?.setTimeEvent('sacrificeCooldown', PLAYER.COOLDOWNS.MODERATE);
    this?.context?.flickerCarenic(500);  
    this?.context?.scene.time.delayedCall(500, () => { 
        this?.context?.isSacrificing = false;
    });
};
onSacrificeUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isSacrificing);
};
onSacrificeExit = () => {};

onSnaringEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    if (this?.context?.outOfRange(PLAYER.RANGE.LONG)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.LONG) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Snaring', PLAYER.DURATIONS.SNARE, 'cast');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.SNARE);
    this?.context?.isCasting = true;
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === false) this?.context?.checkCaerenic(true);
    this?.context?.castbar.setVisible(true); 
};
onSnaringUpdate = (dt) => {
    if (this?.context?.isMoving === true) this?.context?.isCasting = false;
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.castbar.time >= PLAYER.DURATIONS.SNARE) {
        this?.context?.snaringSuccess = true;
        this?.context?.isCasting = false;
    };
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'cast');
};
onSnaringExit = () => {
    if (this?.context?.snaringSuccess === true) {
        this?.context?.setTimeEvent('snareCooldown', PLAYER.DURATIONS.SHORT);
        EventBus.emit('special-combat-text', {
            playerSpecialDescription: `You ensorcel ${this?.context?.scene.state.computer?.name}, snaring them!`
        });
        this?.context?.scene.useStamina(PLAYER.STAMINA.SNARE);
        this?.context?.scene.snare(this?.context?.getEnemyId());
        this?.context?.snaringSuccess = false;
        this?.context?.scene.sound.play('debuff', { volume: this?.context?.scene.settings.volume });
    };
    this?.context?.castbar.reset();
    if (this?.context?.isCaerenic === false && this?.context?.isGlowing === true) this?.context?.checkCaerenic(false);
};

// Spins and attacks all enemies in range 3 times in 3 seconds.
onStormEnter = () => {
    this?.context?.isStorming = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Storming', 750, 'effect');
    // this?.context?.originalLeapPosition = new Phaser.Math.Vector2(this?.context?.x, this?.context?.y);
    // this?.context?.stormPointer = this?.context?.scene.rightJoystick.pointer;
    // const pointer = this?.context?.scene.rightJoystick.pointer;
    // const worldX = this?.context?.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).x;
    // const worldY = this?.context?.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).y;
    // const target = new Phaser.Math.Vector2(worldX, worldY);
    // const target = this?.context?.scene.getWorldPointer();
    // const direction = target.subtract(this?.context?.position);
    // const length = direction.length();
    // direction.normalize();
    // this?.context?.flipX = direction.x < 0;
    this?.context?.isAttacking = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.STORM);
    this?.context?.scene.tweens.add({
        targets: this,
        angle: 360,
        duration: 750,
        onStart: () => {
            this?.context?.flickerCarenic(3000); 
        },
        onLoop: () => {
            console.log('Storming!');
            if (this?.context?.inCombat === false) return;
            this?.context?.isAttacking = true;
            this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Storming', 750, 'effect');
            if (this?.context?.touching.length > 0) {
                this?.context?.touching.forEach(enemy => {
                    // console.log(`%c Touched Enemy: ${enemy.enemyID}`, 'color: #ff0000');
                    this?.context?.scene.storm(enemy.enemyID);
                });
            };
        },
        onComplete: () => {
            this?.context?.isStorming = false; 
        },
        loop: 3,
    });  
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You begin storming with your ${this?.context?.scene.state.weapons[0].name}.`
    });
};
onStormUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isStorming);
};
onStormExit = () => {
    // this?.context?.originalLeapPosition = undefined;
    // this?.context?.stormPointer = undefined;
    // const stormCooldown = this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3;
    this?.context?.setTimeEvent('stormCooldown', this?.context?.inCombat ? PLAYER.COOLDOWNS.SHORT : PLAYER.COOLDOWNS.SHORT / 3);
};

onSutureEnter = () => {
    if (this?.context?.currentTarget === undefined) return;
    const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    if (distance > PLAYER.RANGE.MODERATE) {
        this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
        return;    
    };
    this?.context?.isSuturing = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Suture', 750, 'effect');
    this?.context?.scene.sound.play('debuff', { volume: this?.context?.scene.settings.volume });
    this?.context?.scene.useStamina(PLAYER.STAMINA.SUTURE);
    this?.context?.scene.combatMachine.action({ type: 'Suture', data: undefined });
    this?.context?.setTimeEvent('sutureCooldown', PLAYER.COOLDOWNS.MODERATE);
    
    this?.context?.flickerCarenic(500); 
    this?.context?.scene.time.delayedCall(500, () => {
        this?.context?.isSuturing = false;
    });
    
};
onSutureUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isSuturing);
};
onSutureExit = () => {};

onTshaeralEnter = () => {
    if (this?.context?.currentTarget === undefined) return; 
    if (this?.context?.outOfRange(PLAYER.RANGE.MODERATE)) return;
    // const distance = Phaser.Math.Distance.Between(this?.context?.x, this?.context?.y, this?.context?.currentTarget.x, this?.context?.currentTarget.y);
    // if (distance > PLAYER.RANGE.MODERATE) {
    //     this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `Out of Range: ${Math.round(distance - PLAYER.RANGE.MODERATE)} Distance`, 1500, 'damage');
    //     return;    
    // };
    this?.context?.isCasting = true;
    this?.context?.currentTarget.isConsumed = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.TSHAERAL);
    this?.context?.scene.sound.play('absorb', { volume: this?.context?.scene.settings.volume });
    this?.context?.flickerCarenic(2000); 
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Tshaering', PLAYER.DURATIONS.TSHAERAL / 2, 'damage');
    this?.context?.castbar.setTotal(PLAYER.DURATIONS.TSHAERAL);
    this?.context?.castbar.setTime(PLAYER.DURATIONS.TSHAERAL);
    this?.context?.tshaeringTimer = this?.context?.scene.time.addEvent({
        delay: 250,
        callback: () => {
            if (this?.context?.isCasting === false || this?.context?.scene.state.playerWin === true || this?.context?.scene.state.newComputerHealth <= 0) {
                this?.context?.isCasting = false;
                this?.context?.tshaeringTimer.remove(false);
                this?.context?.tshaeringTimer = undefined;
                return;
            };
            this?.context?.scene.combatMachine.action({ type: 'Tshaeral', data: 3 });
        },
        callbackScope: this,
        repeat: 8,
    });
    this?.context?.setTimeEvent('tshaeralCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.scene.time.addEvent({
        delay: 2000,
        callback: () => {
            this?.context?.isCasting = false;
        },
        callbackScope: this,
        loop: false,
    });
    this?.context?.setStatic(true);
    this?.context?.castbar.setVisible(true); 
};
onTshaeralUpdate = (dt) => {
    this?.context?.combatChecker(this?.context?.isCasting);
    if (this?.context?.isCasting === true) this?.context?.castbar.update(dt, 'channel', 0xA700FF);
};
onTshaeralExit = () => {
    this?.context?.castbar.reset(); 
    this?.context?.setStatic(false);
    if (this?.context?.tshaeringTimer !== undefined) {
        this?.context?.tshaeringTimer.remove(false);
        this?.context?.tshaeringTimer = undefined;
    };
};

// ================= META MACHINE STATES ================= \\

onCleanEnter = () => {};
onCleanExit = () => {};

onChiomicEnter = () => {
    this?.context?.scene.useStamina(PLAYER.STAMINA.CHIOMIC);    
    this?.context?.aoe = new AoE(this?.context?.scene, 'chiomic', 1);    
    this?.context?.scene.sound.play('death', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Hah! Hah!', PLAYER.DURATIONS.CHIOMIC, 'effect');
    this?.context?.isChiomic = true;
    this?.context?.setTimeEvent('chiomicCooldown', PLAYER.COOLDOWNS.SHORT);  
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.CHIOMIC, () => {
        this?.context?.isChiomic = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You mock and confuse your surrounding foes.`
    });
};
onChiomicUpdate = (_dt) => {
    if (this?.context?.isChiomic === false) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onChioimicExit = () => {};

onDiseaseEnter = () => {
    this?.context?.isDiseasing = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.DISEASE);    
    this?.context?.aoe = new AoE(this?.context?.scene, 'tendril', 6);    
    this?.context?.scene.sound.play('dungeon', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Tendrils Swirl', 750, 'tendril');
    this?.context?.setTimeEvent('diseaseCooldown', PLAYER.COOLDOWNS.MODERATE);  
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.DISEASE, () => {
        this?.context?.isDiseasing = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You swirl such sweet tendrils which wrap round and reach to writhe.`
    });
};
onDiseaseUpdate = (_dt) => {
    // this?.context?.combatChecker(this?.context?.isDiseasing);
    if (this?.context?.isDiseasing === false) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onDiseaseExit = () => {};

onHowlEnter = () => {
    this?.context?.scene.useStamina(PLAYER.STAMINA.HOWL);    
    this?.context?.aoe = new AoE(this?.context?.scene, 'howl', 1);    
    this?.context?.scene.sound.play('howl', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Howling', PLAYER.DURATIONS.HOWL, 'damage');
    this?.context?.isHowling = true;
    this?.context?.setTimeEvent('howlCooldown', PLAYER.COOLDOWNS.SHORT);  
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.HOWL, () => {
        this?.context?.isHowling = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You howl, it's otherworldly nature stunning nearby foes.`
    });
};
onHowlUpdate = (_dt) => {
    // this?.context?.combatChecker(this?.context?.isHowling);
    if (this?.context?.isHowling === false) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onHowlExit = () => {};

onEnvelopEnter = () => {
    this?.context?.isEnveloping = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.ENVELOP);    
    this?.context?.scene.sound.play('caerenic', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Enveloping', 750, 'cast');
    this?.context?.envelopBubble = new Bubble(this?.context?.scene, this?.context?.x, this?.context?.y, 'blue', PLAYER.DURATIONS.ENVELOP);
    this?.context?.setTimeEvent('envelopCooldown', PLAYER.COOLDOWNS.MODERATE);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.ENVELOP, () => {
        this?.context?.isEnveloping = false;    
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You envelop yourself, shirking oncoming attacks.`
    });
};
onEnvelopUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isEnveloping);
    if (this?.context?.isEnveloping) {
        this?.context?.envelopBubble.update(this?.context?.x, this?.context?.y);
    } else {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onEnvelopExit = () => {
    if (this?.context?.envelopBubble !== undefined) {
        this?.context?.envelopBubble.destroy();
        this?.context?.envelopBubble = undefined;
    };
};

envelopHit = () => {
    if (this?.context?.envelopBubble === undefined || this?.context?.isEnveloping === false) {
        if (this?.context?.envelopBubble) {
            this?.context?.envelopBubble.destroy();
            this?.context?.envelopBubble = undefined;
        };
        this?.context?.isEnveloping = false;
        return;
    };
    this?.context?.scene.sound.play('caerenic', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Enveloped', 500, 'effect');
    this?.context?.scene.useStamina(40);
    if (this?.context?.stamina - 40 <= 0) {
        this?.context?.isEnveloping = false;
    };
};

onFreezeEnter = () => {
    this?.context?.aoe = new AoE(this?.context?.scene, 'freeze', 1);
    this?.context?.scene.sound.play('freeze', { volume: this?.context?.scene.settings.volume });
    this?.context?.scene.useStamina(PLAYER.STAMINA.FREEZE);
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Freezing', PLAYER.DURATIONS.FREEZE, 'cast');
    this?.context?.isFreezing = true;
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.FREEZE, () => {
        this?.context?.isFreezing = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You freeze nearby foes.`
    });
};
onFreezeUpdate = (_dt) => {
    // this?.context?.combatChecker(this?.context?.isFreezing);
    if (!this?.context?.isFreezing) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onFreezeExit = () => {
    if (this?.context?.inCombat === false) return;
    this?.context?.setTimeEvent('freezeCooldown', PLAYER.COOLDOWNS.SHORT);
};

onMaliceEnter = () => {
    this?.context?.scene.useStamina(PLAYER.STAMINA.MALICE);    
    this?.context?.scene.sound.play('debuff', { volume: this?.context?.scene.settings.volume });
    this?.context?.isMalicing = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Malice', 750, 'hush');
    this?.context?.maliceBubble = new Bubble(this?.context?.scene, this?.context?.x, this?.context?.y, 'purple', PLAYER.DURATIONS.MALICE);
    this?.context?.setTimeEvent('maliceCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.MALICE, () => {
        this?.context?.isMalicing = false;    
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You wrack malicious foes with the hush of their own attack.`
    });
};
onMaliceUpdate = (_dt) => {
    if (this?.context?.isMalicing) {
        this?.context?.maliceBubble.update(this?.context?.x, this?.context?.y);
    } else {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onMaliceExit = () => {
    if (this?.context?.maliceBubble) {
        this?.context?.maliceBubble.destroy();
        this?.context?.maliceBubble = undefined;
    };
};

maliceHit = () => {
    if (this?.context?.maliceBubble === undefined || this?.context?.isMalicing === false) {
        if (this?.context?.maliceBubble) {
            this?.context?.maliceBubble.destroy();
            this?.context?.maliceBubble = undefined;
        };
        this?.context?.isMalicing = false;
        return;
    };
    this?.context?.scene.sound.play('debuff', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Malice', 750, 'hush');
    this?.context?.scene.combatMachine.action({ data: 10, type: 'Chiomic' });
    this?.context?.maliceBubble.setCharges(this?.context?.maliceBubble.charges - 1);
    if (this?.context?.maliceBubble.charges <= 0) {
        this?.context?.isMalicing = false;
    };
};

onMendEnter = () => {
    this?.context?.scene.useStamina(PLAYER.STAMINA.MEND);    
    this?.context?.scene.sound.play('caerenic', { volume: this?.context?.scene.settings.volume });
    this?.context?.isMending = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Mending', 750, 'tendril');
    this?.context?.mendBubble = new Bubble(this?.context?.scene, this?.context?.x, this?.context?.y, 'purple', PLAYER.DURATIONS.MEND);
    this?.context?.setTimeEvent('mendCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.MEND, () => {
        this?.context?.isMending = false;    
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You seek to mend oncoming attacks.`
    });
};
onMendUpdate = (_dt) => {
    // this?.context?.combatChecker(this?.context?.isMending);
    if (this?.context?.isMending) {
        this?.context?.mendBubble.update(this?.context?.x, this?.context?.y);
    } else {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onMendExit = () => {
    if (this?.context?.mendBubble) {
        this?.context?.mendBubble.destroy();
        this?.context?.mendBubble = undefined;
    };
};

mendHit = () => {
    if (this?.context?.mendBubble === undefined || this?.context?.isMending === false) {
        if (this?.context?.mendBubble) {
            this?.context?.mendBubble.destroy();
            this?.context?.mendBubble = undefined;
        };
        this?.context?.isMending = false;
        return;
    };
    this?.context?.scene.sound.play('caerenic', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Mending', 500, 'tendril');
    
    this?.context?.scene.combatMachine.action({ data: { key: 'player', value: 15, id: this?.context?.playerID }, type: 'Health' });
    
    this?.context?.mendBubble.setCharges(this?.context?.mendBubble.charges - 1);
    if (this?.context?.mendBubble.charges <= 0) {
        this?.context?.isMending = false;
    };
};

onProtectEnter = () => {
    this?.context?.isProtecting = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.PROTECT);    
    this?.context?.scene.sound.play('shield', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Protecting', 750, 'effect');
    this?.context?.protectBubble = new Bubble(this?.context?.scene, this?.context?.x, this?.context?.y, 'gold', PLAYER.DURATIONS.PROTECT);
    this?.context?.setTimeEvent('protectCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.PROTECT, () => {
        this?.context?.isProtecting = false;    
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You protect yourself from oncoming attacks.`
    });
};
onProtectUpdate = (_dt) => {
    if (this?.context?.isProtecting) {
        this?.context?.protectBubble.update(this?.context?.x, this?.context?.y);
    } else {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onProtectExit = () => {
    if (this?.context?.protectBubble) {
        this?.context?.protectBubble.destroy();
        this?.context?.protectBubble = undefined;
    };
};

onRecoverEnter = () => {
    this?.context?.isRecovering = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.RECOVER);    
    this?.context?.scene.sound.play('absorb', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Recovering', 750, 'effect');
    this?.context?.recoverBubble = new Bubble(this?.context?.scene, this?.context?.x, this?.context?.y, 'green', PLAYER.DURATIONS.RECOVER);
    this?.context?.setTimeEvent('recoverCooldown', PLAYER.COOLDOWNS.MODERATE);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.RECOVER, () => {
        this?.context?.isRecovering = false;    
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You warp oncoming damage into stamina.`
    });
};
onRecoverUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isRecovering);
    if (this?.context?.isRecovering) {
        this?.context?.recoverBubble.update(this?.context?.x, this?.context?.y);
    } else {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onRecoverExit = () => {
    if (this?.context?.recoverBubble) {
        this?.context?.recoverBubble.destroy();
        this?.context?.recoverBubble = undefined;
    };
};

recoverHit = () => {
    this?.context?.scene.sound.play('absorb', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Recovered', 500, 'effect');
    this?.context?.scene.useStamina(-25);
};

onRenewalEnter = () => {
    this?.context?.isRenewing = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.RENEWAL);    
    this?.context?.aoe = new AoE(this?.context?.scene, 'renewal', 6, true);    
    this?.context?.scene.sound.play('shield', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Hush Tears', 750, 'bone');
    this?.context?.setTimeEvent('renewalCooldown', PLAYER.COOLDOWNS.MODERATE);  
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.RENEWAL, () => {
        this?.context?.isRenewing = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `Tears of a Hush proliferate and heal old wounds.`
    });
};
onRenewalUpdate = (_dt) => {
    if (this?.context?.isRenewing) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onRenewalExit = () => {};

onScreamEnter = () => {
    this?.context?.scene.useStamina(PLAYER.STAMINA.SCREAM);    
    this?.context?.aoe = new AoE(this?.context?.scene, 'scream', 1);    
    this?.context?.scene.sound.play('scream', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Screaming', 750, 'hush');
    this?.context?.isScreaming = true;
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.SCREAM, () => {
        this?.context?.isScreaming = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You scream, fearing nearby foes.`
    });
};
onScreamUpdate = (_dt) => {
    // this?.context?.combatChecker(this?.context?.isScreaming);
    if (!this?.context?.isScreaming) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onScreamExit = () => {
    if (this?.context?.inCombat === false) return;
    this?.context?.setTimeEvent('screamCooldown', PLAYER.COOLDOWNS.SHORT);  
};

onShieldEnter = () => {
    this?.context?.scene.useStamina(PLAYER.STAMINA.SHIELD);    
    this?.context?.scene.sound.play('shield', { volume: this?.context?.scene.settings.volume });
    this?.context?.isShielding = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Shielding', 750, 'bone');
    this?.context?.shieldBubble = new Bubble(this?.context?.scene, this?.context?.x, this?.context?.y, 'bone', PLAYER.DURATIONS.SHIELD);
    this?.context?.setTimeEvent('shieldCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.SHIELD, () => {
        this?.context?.isShielding = false;    
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You shield yourself from oncoming attacks.`
    });
};
onShieldUpdate = (_dt) => {
    // this?.context?.combatChecker(this?.context?.isShielding);
    if (this?.context?.isShielding) {
        this?.context?.shieldBubble.update(this?.context?.x, this?.context?.y);
    } else {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onShieldExit = () => {
    if (this?.context?.shieldBubble) {
        this?.context?.shieldBubble.destroy();
        this?.context?.shieldBubble = undefined;
    };
};

shieldHit = () => {
    if (this?.context?.shieldBubble === undefined || this?.context?.isShielding === false) {
        if (this?.context?.shieldBubble) {
            this?.context?.shieldBubble.destroy();
            this?.context?.shieldBubble = undefined;
        };
        this?.context?.isShielding = false;
        return;
    };
    this?.context?.scene.sound.play('shield', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Shield Hit', 500, 'effect');
    this?.context?.shieldBubble.setCharges(this?.context?.shieldBubble.charges - 1);
    if (this?.context?.shieldBubble.charges <= 0) {
        this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Shield Broken', 500, 'damage');
        this?.context?.isShielding = false;
    };
};

onShimmerEnter = () => {
    this?.context?.isShimmering = true; 
    this?.context?.scene.sound.play('stealth', { volume: this?.context?.scene.settings.volume });
    this?.context?.scene.useStamina(PLAYER.STAMINA.SHIMMER);
    this?.context?.setTimeEvent('shimmerCooldown', PLAYER.COOLDOWNS.MODERATE);
    if (!this?.context?.isStealthing) this?.context?.stealthEffect(true);    
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.SHIMMER, () => {
        this?.context?.isShimmering = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You shimmer, fading in and out of this world.`
    });
};
onShimmerUpdate = (_dt) => {
    if (!this?.context?.isShimmering) {
        this?.context?.metaMachine.setState(States.CLEAN); 
    };
};
onShimmerExit = () => { 
    this?.context?.stealthEffect(false);
};

shimmerHit = () => {
    this?.context?.scene.sound.play('stealth', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, `You simply weren't there`, 500, 'effect');
};

onSprintEnter = () => {
    this?.context?.isSprinting = true;
    this?.context?.scene.sound.play('blink', { volume: this?.context?.scene.settings.volume / 3 });
    this?.context?.adjustSpeed(PLAYER.SPEED.SPRINT);
    this?.context?.scene.useStamina(PLAYER.STAMINA.SPRINT);
    this?.context?.setTimeEvent('sprintCooldown', PLAYER.COOLDOWNS.MODERATE);
    if (!this?.context?.isCaerenic && !this?.context?.isGlowing) this?.context?.checkCaerenic(true);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.SPRINT, () => {
        this?.context?.isSprinting = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You tap into your caeren, bursting into an otherworldly sprint.`
    });
};
onSprintUpdate = (_dt) => {
    if (!this?.context?.isSprinting) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onSprintExit = () => {
    if (this?.context?.isGlowing) this?.context?.checkCaerenic(false); // !this?.context?.isCaerenic && 
    this?.context?.adjustSpeed(-PLAYER.SPEED.SPRINT);
};

onStealthEnter = () => {
    if (!this?.context?.isShimmering) this?.context?.isStealthing = true; 
    this?.context?.stealthEffect(true);    
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You step halfway into the land of hush and tendril.`
    });
};
onStealthUpdate = (_dt) => {
    if (!this?.context?.isStealthing || this?.context?.currentRound > 1 || this?.context?.scene.combat) {
        this?.context?.metaMachine.setState(States.CLEAN); 
    };
};
onStealthExit = () => { 
    this?.context?.isStealthing = false;
    this?.context?.stealthEffect(false);
};

stealthEffect = (stealth) => {
    if (stealth) {
        const getStealth = (object) => {
            object.setAlpha(0.5); // 0.7
            object.setBlendMode(Phaser.BlendModes.SCREEN);
            this?.context?.scene.tweens.add({
                targets: object,
                tint: 0x00AAFF, // 0x00AAFF
                duration: 500,
                yoyo: true,
                repeat: -1,
            }); 
        };
        this?.context?.adjustSpeed(-PLAYER.SPEED.STEALTH);
        getStealth(this);
        getStealth(this?.context?.spriteWeapon);
        getStealth(this?.context?.spriteShield);
    } else {
        const clearStealth = (object) => {
            this?.context?.scene.tweens.killTweensOf(object);
            object.setAlpha(1);
            object.clearTint();
            object.setBlendMode(Phaser.BlendModes.NORMAL);
        };
        this?.context?.adjustSpeed(PLAYER.SPEED.STEALTH);
        clearStealth(this);
        clearStealth(this?.context?.spriteWeapon);
        clearStealth(this?.context?.spriteShield);
        this?.context?.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF);
    };
    this?.context?.scene.sound.play('stealth', { volume: this?.context?.scene.settings.volume });
};

onWardEnter = () => {
    this?.context?.isWarding = true;
    this?.context?.scene.useStamina(PLAYER.STAMINA.WARD);    
    this?.context?.scene.sound.play('combat-round', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Warding', 750, 'damage');
    this?.context?.wardBubble = new Bubble(this?.context?.scene, this?.context?.x, this?.context?.y, 'red', PLAYER.DURATIONS.WARD);
    this?.context?.setTimeEvent('wardCooldown', PLAYER.COOLDOWNS.LONG);
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.WARD, () => {
        this?.context?.isWarding = false;    
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You ward yourself from oncoming attacks.`
    });
};
onWardUpdate = (_dt) => {
    // this?.context?.combatChecker(this?.context?.isWarding);
    if (this?.context?.isWarding) {
        this?.context?.wardBubble.update(this?.context?.x, this?.context?.y);
    } else {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onWardExit = () => {
    if (this?.context?.wardBubble) {
        this?.context?.wardBubble.destroy();
        this?.context?.wardBubble = undefined;
    };
};

wardHit = () => {
    if (this?.context?.wardBubble === undefined || this?.context?.isWarding === false) {
        if (this?.context?.wardBubble) {
            this?.context?.wardBubble.destroy();
            this?.context?.wardBubble = undefined;
        };
        this?.context?.isWarding = false;
        return;
    };
    this?.context?.scene.sound.play('parry', { volume: this?.context?.scene.settings.volume });
    this?.context?.scene.stunned(this?.context?.getEnemyId());
    this?.context?.wardBubble.setCharges(this?.context?.wardBubble.charges - 1);
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Warded', 500, 'effect');
    if (this?.context?.wardBubble.charges <= 3) {
        this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Ward Broken', 500, 'damage');
        this?.context?.wardBubble.setCharges(0);
        this?.context?.isWarding = false;
    };
};

onWritheEnter = () => {
    this?.context?.scene.useStamina(PLAYER.STAMINA.WRITHE);    
    this?.context?.aoe = new AoE(this?.context?.scene, 'writhe', 1);    
    this?.context?.scene.sound.play('spooky', { volume: this?.context?.scene.settings.volume });
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Writhing', 750, 'tendril');
    this?.context?.isWrithing = true;
    this?.context?.scene.time.delayedCall(PLAYER.DURATIONS.WRITHE, () => {
        this?.context?.isWrithing = false;
    });
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `Your caeren grips your body and contorts, writhing around you.`
    });
};
onWritheUpdate = (_dt) => {
    this?.context?.combatChecker(this?.context?.isWrithing);
    if (!this?.context?.isWrithing) {
        this?.context?.metaMachine.setState(States.CLEAN);
    };
};
onWritheExit = () => {
    if (!this?.context?.inCombat) return;
    this?.context?.setTimeEvent('writheCooldown', PLAYER.COOLDOWNS.SHORT);  
};

onStunEnter = () => {
    this?.context?.scene.joystick.joystick.setVisible(false);
    this?.context?.scene.rightJoystick.joystick.setVisible(false);
    this?.context?.scene.actionBar.setVisible(false);
    this?.context?.isStunned = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Stunned', PLAYER.DURATIONS.STUNNED, 'effect');
    this?.context?.scene.input.keyboard.enabled = false;
    this?.context?.stunDuration = PLAYER.DURATIONS.STUNNED;
    this?.context?.setTint(0x888888);
    this?.context?.setStatic(true);
    this?.context?.anims.pause();
    EventBus.emit('special-combat-text', {
        playerSpecialDescription: `You've been stunned.`
    });
};
onStunUpdate = (dt) => {
    this?.context?.setVelocity(0);
    this?.context?.stunDuration -= dt;
    if (this?.context?.stunDuration <= 0) this?.context?.isStunned = false;
    this?.context?.combatChecker(this?.context?.isStunned);
};
onStunExit = () => {
    this?.context?.scene.joystick.joystick.setVisible(true);
    this?.context?.scene.rightJoystick.joystick.setVisible(true);
    this?.context?.scene.actionBar.setVisible(true);
    this?.context?.stunDuration = PLAYER.DURATIONS.STUNNED;
    this?.context?.scene.input.keyboard.enabled = true;
    this?.context?.setTint(0xFF0000, 0xFF0000, 0x0000FF, 0x0000FF)
    this?.context?.setStatic(false);
    this?.context?.anims.resume();
};

// ================= NEGATIVE MACHINE STATES ================= \\
onConfusedEnter = () => { 
    this?.context?.scene.joystick.joystick.setVisible(false);
    this?.context?.scene.rightJoystick.joystick.setVisible(false);
    this?.context?.scene.actionBar.setVisible(false);
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, '?c .on-f-u`SeD~', DURATION.TEXT, 'effect');
    this?.context?.spriteWeapon.setVisible(false);
    this?.context?.spriteShield.setVisible(false);
    this?.context?.confuseDirection = 'down';
    this?.context?.confuseMovement = 'idle';
    this?.context?.confuseVelocity = { x: 0, y: 0 };
    this?.context?.isAttacking = false;
    this?.context?.isParrying = false;
    this?.context?.isPosturing = false;
    this?.context?.isRolling = false;
    this?.context?.currentAction = ''; 
    this?.context?.setGlow(this, true);
    let iteration = 0;
    const randomDirection = () => {  
        const move = Phaser.Math.Between(1, 100);
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Phaser.Math.Between(0, 3)];
        if (move > 25) {
            if (direction === 'up') {
                this?.context?.confuseVelocity = { x: 0, y: -1.75 };
            } else if (direction === 'down') {
                this?.context?.confuseVelocity = { x: 0, y: 1.75 };
            } else if (direction === 'right') {
                this?.context?.confuseVelocity = { x: -1.75, y: 0 };
            } else if (direction === 'left') {
                this?.context?.confuseVelocity = { x: 1.75, y: 0 };
            };
            this?.context?.confuseMovement = 'move';
        } else {
            this?.context?.confuseVelocity = { x: 0, y: 0 };
            this?.context?.confuseMovement = 'idle';                
        };
        this?.context?.confuseDirection = direction;
    };
    const confusions = ['~?  ? ?!', 'Hhwat?', 'Wh-wor; -e ma i?', 'Woh `re ewe?', '...'];

    this?.context?.confuseTimer = this?.context?.scene.time.addEvent({
        delay: 1500,
        callback: () => {
            iteration++;
            if (iteration === 5) {
                iteration = 0;
                this?.context?.isConfused = false;
            } else {   
                this?.context?.specialCombatText.destroy();
                randomDirection();
                this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, confusions[Math.floor(Math.random() * 5)], 1000, 'effect');
            };
        },
        callbackScope: this,
        repeat: 4,
    }); 

};
onConfusedUpdate = (_dt) => {
    if (!this?.context?.isConfused) this?.context?.combatChecker(this?.context?.isConfused);
    this?.context?.setVelocity(this?.context?.confuseVelocity.x, this?.context?.confuseVelocity.y);
    if (Math.abs(this?.context?.velocity.x) > 0 || Math.abs(this?.context?.velocity.y) > 0) {
        this?.context?.anims.play(`player_running`, true);
    } else {
        this?.context?.anims.play(`player_idle`, true);
    };
};
onConfusedExit = () => { 
    if (this?.context?.isConfused) this?.context?.isConfused = false;
    this?.context?.scene.joystick.joystick.setVisible(true);
    this?.context?.scene.rightJoystick.joystick.setVisible(true);
    this?.context?.scene.actionBar.setVisible(true);
    this?.context?.anims.play('player_running', true);
    this?.context?.spriteWeapon.setVisible(true);
    if (this?.context?.confuseTimer) {
        this?.context?.confuseTimer.destroy();
        this?.context?.confuseTimer = undefined;
    };
    this?.context?.setGlow(this, false);
};

onFearedEnter = () => { 
    this?.context?.scene.joystick.joystick.setVisible(false);
    this?.context?.scene.rightJoystick.joystick.setVisible(false);
    this?.context?.scene.actionBar.setVisible(false);
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'F̶e̷a̴r̷e̵d̴', DURATION.TEXT, 'damage');
    this?.context?.spriteWeapon.setVisible(false);
    this?.context?.spriteShield.setVisible(false);
    this?.context?.fearDirection = 'down';
    this?.context?.fearMovement = 'idle';
    this?.context?.fearVelocity = { x: 0, y: 0 };
    this?.context?.isAttacking = false;
    this?.context?.isParrying = false;
    this?.context?.isPosturing = false;
    this?.context?.isRolling = false;
    this?.context?.currentAction = ''; 
    this?.context?.setGlow(this, true);
    let iteration = 0;
    const fears = ['...ahhh!', 'c̶o̷m̷e̷ ̴h̴e̵r̶e̶', 'Stay Away!', 'Somebody HELP ME', 'g̴̠̊ͅu̷͝ͅṱ̶͐ṯ̶̆u̸̼̚̚r̶̰̔ȃ̴̫l̴͈͝ ̶̹̎͛s̸͎͋ḥ̶̛̙́r̵̡̤̋͠ì̶͈̓e̸̬͕̅̈́k̵͔͌ī̸̮̹̎n̷̰̟̂͒g̷̦̓'];
    const randomDirection = () => {  
        const move = Phaser.Math.Between(1, 100);
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Phaser.Math.Between(0, 3)];
        if (move > 25) {
            if (direction === 'up') {
                this?.context?.fearVelocity = { x: 0, y: -2 };
            } else if (direction === 'down') {
                this?.context?.fearVelocity = { x: 0, y: 2 };
            } else if (direction === 'right') {
                this?.context?.fearVelocity = { x: -2, y: 0 };
            } else if (direction === 'left') {
                this?.context?.fearVelocity = { x: 2, y: 0 };
            };
            this?.context?.fearMovement = 'move';
        } else {
            this?.context?.fearVelocity = { x: 0, y: 0 };
            this?.context?.fearMovement = 'idle';                
        };
        this?.context?.fearDirection = direction;
    };

    this?.context?.fearTimer = this?.context?.scene.time.addEvent({
        delay: 1500,
        callback: () => {
            iteration++;
            if (iteration === 4) {
                iteration = 0;
                this?.context?.isFeared = false;
            } else {   
                randomDirection();
                this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, fears[Math.floor(Math.random() * 5)], 1000, 'effect');
            };
        },
        callbackScope: this,
        repeat: 3,
    }); 

};
onFearedUpdate = (_dt) => {
    if (!this?.context?.isFeared) this?.context?.combatChecker(this?.context?.isFeared);
    this?.context?.setVelocity(this?.context?.fearVelocity.x, this?.context?.fearVelocity.y);
    if (Math.abs(this?.context?.velocity.x) > 0 || Math.abs(this?.context?.velocity.y) > 0) {
        this?.context?.anims.play(`player_running`, true);
    } else {
        this?.context?.anims.play(`player_idle`, true);
    };
};
onFearedExit = () => { 
    this?.context?.scene.joystick.joystick.setVisible(true);
    this?.context?.scene.rightJoystick.joystick.setVisible(true);
    this?.context?.scene.actionBar.setVisible(true);
    if (this?.context?.isFeared) this?.context?.isFeared = false;
    this?.context?.anims.play('player_running', true);
    this?.context?.spriteWeapon.setVisible(true);
    if (this?.context?.fearTimer) {
        this?.context?.fearTimer.destroy();
        this?.context?.fearTimer = undefined;
    };
    this?.context?.setGlow(this, false);
};

onFrozenEnter = () => {
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Frozen', DURATION.TEXT, 'cast');
    if (!this?.context?.isPolymorphed) this?.context?.clearAnimations();
    this?.context?.anims.play('player_idle', true);
    this?.context?.setStatic(true);
    this?.context?.scene.time.addEvent({
        delay: DURATION.FROZEN,
        callback: () => {
            this?.context?.isFrozen = false;
            this?.context?.metaMachine.setState(States.CLEAN);
        },
        callbackScope: this,
        loop: false,
    });
};
onFrozenExit = () => {
    this?.context?.setStatic(false);
};

onPolymorphedEnter = () => {
    this?.context?.scene.joystick.joystick.setVisible(false);
    this?.context?.scene.rightJoystick.joystick.setVisible(false);
    this?.context?.scene.actionBar.setVisible(false);
    this?.context?.isPolymorphed = true;
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Polymorphed', DURATION.TEXT, 'effect');
    this?.context?.clearAnimations();
    this?.context?.clearTint();
    this?.context?.anims.pause();
    this?.context?.anims.play('rabbit_idle_down', true);
    this?.context?.anims.resume();
    this?.context?.spriteWeapon.setVisible(false);
    this?.context?.spriteShield.setVisible(false);
    this?.context?.polymorphDirection = 'down';
    this?.context?.polymorphMovement = 'idle';
    this?.context?.polymorphVelocity = { x: 0, y: 0 };

    this?.context?.isAttacking = false;
    this?.context?.isParrying = false;
    this?.context?.isPosturing = false;
    this?.context?.isRolling = false;
    this?.context?.currentAction = ''; 

    let iteration = 0;
    const randomDirection = () => {  
        const move = Phaser.Math.Between(1, 100);
        const directions = ['up', 'down', 'left', 'right'];
        const direction = directions[Phaser.Math.Between(0, 3)];
        if (move > 25) {
            if (direction === 'up') {
                this?.context?.polymorphVelocity = { x: 0, y: -1.25 };
            } else if (direction === 'down') {
                this?.context?.polymorphVelocity = { x: 0, y: 1.25 };
            } else if (direction === 'right') {
                this?.context?.polymorphVelocity = { x: -1.25, y: 0 };
            } else if (direction === 'left') {
                this?.context?.polymorphVelocity = { x: 1.25, y: 0 };
            };
            this?.context?.polymorphMovement = 'move';
        } else {
            this?.context?.polymorphVelocity = { x: 0, y: 0 };
            this?.context?.polymorphMovement = 'idle';                
        };
        this?.context?.polymorphDirection = direction;
    };

    this?.context?.polymorphTimer = this?.context?.scene.time.addEvent({
        delay: 2000,
        callback: () => {
            iteration++;
            if (iteration === 5) {
                iteration = 0;
                this?.context?.isPolymorphed = false;
            } else {   
                randomDirection();
                this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, '...thump', 1000, 'effect');
                this?.context?.scene.combatMachine.action({ type: 'Health', data: { key: 'player', value: 15, id: this?.context?.playerID } });
            };
        },
        callbackScope: this,
        repeat: 5,
    }); 

};
onPolymorphedUpdate = (_dt) => {
    if (!this?.context?.isPolymorphed) this?.context?.combatChecker(this?.context?.isPolymorphed);
    this?.context?.anims.play(`rabbit_${this?.context?.polymorphMovement}_${this?.context?.polymorphDirection}`, true);
    this?.context?.setVelocity(this?.context?.polymorphVelocity.x, this?.context?.polymorphVelocity.y);
};
onPolymorphedExit = () => { 
    this?.context?.scene.joystick.joystick.setVisible(true);
    this?.context?.scene.rightJoystick.joystick.setVisible(true);
    this?.context?.scene.actionBar.setVisible(true);
    if (this?.context?.isPolymorphed) this?.context?.isPolymorphed = false;
    this?.context?.clearAnimations();
    this?.context?.anims.play('player_running', true);
    this?.context?.setTint(0x000000);
    this?.context?.spriteWeapon.setVisible(true);
    if (this?.context?.polymorphTimer) {
        this?.context?.polymorphTimer.destroy();
        this?.context?.polymorphTimer = undefined;
    };
};

onSlowedEnter = () => {
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Slowed', DURATION.TEXT, 'damage');
    this?.context?.slowDuration = DURATION.SLOWED;
    this?.context?.setTint(0xFFC700); // 0x888888
    this?.context?.adjustSpeed(-PLAYER.SPEED.SLOW);
    this?.context?.scene.time.delayedCall(this?.context?.slowDuration, () =>{
        this?.context?.isSlowed = false;
        this?.context?.metaMachine.setState(States.CLEAN);
    });
};

onSlowedExit = () => {
    this?.context?.clearTint();
    this?.context?.setTint(0x000000);
    this?.context?.adjustSpeed(PLAYER.SPEED.SLOW);
};

onSnaredEnter = () => {
    this?.context?.specialCombatText = new ScrollingCombatText(this?.context?.scene, this?.context?.x, this?.context?.y, 'Snared', DURATION.TEXT, 'damage');
    this?.context?.snareDuration = 3000;
    this?.context?.setTint(0x0000FF); // 0x888888
    this?.context?.adjustSpeed(-PLAYER.SPEED.SNARE);
    this?.context?.scene.time.delayedCall(this?.context?.snareDuration, () =>{
        this?.context?.isSnared = false;
        this?.context?.metaMachine.setState(States.CLEAN);
    });
};
// onSnaredUpdate = (dt) => {};
onSnaredExit = () => { 
    this?.context?.clearTint();
    this?.context?.setTint(0x000000);
    this?.context?.adjustSpeed(PLAYER.SPEED.SNARE);
};

};