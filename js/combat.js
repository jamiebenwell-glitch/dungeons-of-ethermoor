// ============================================================
// COMBAT.JS — Turn-based combat engine
// ============================================================

const COMBAT_PHASE = {
  INIT:         'init',
  PLAYER_TURN:  'player_turn',
  ENEMY_TURN:   'enemy_turn',
  COMPANION_TURN:'companion_turn',
  ANIMATING:    'animating',
  VICTORY:      'victory',
  DEFEAT:       'defeat',
};

class CombatEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.phase         = COMBAT_PHASE.INIT;
    this.turnOrder     = [];
    this.turnIdx       = 0;
    this.enemies       = [];
    this.party         = [];   // [player, ...companions]
    this.log           = [];   // { text, color }
    this.selectedAction= 0;
    this.selectedTarget= 0;
    this.pendingAnim   = null; // { type, src, targets, onDone }
    this.animTimer     = 0;
    this.animDuration  = 0;
    this.isFinalBoss   = false;
    this.fled          = false;
    this.xpGained      = 0;
    this.goldGained    = 0;
  }

  // ---- SETUP ----
  begin(player, companions, encounter, ps) {
    this.reset();
    this.ps = ps;

    // Build live enemy list
    this.enemies = encounter.enemies.map(key => makeEnemy(key));
    this.isFinalBoss = encounter.isFinalBoss || false;

    // Party = player + living companions
    this.party = [player, ...companions.filter(c => !c.isDead)];

    // Build initiative order (sorted by spd descending)
    const allCombatants = [
      ...this.party.map(p => ({ entity: p, isEnemy: false })),
      ...this.enemies.map(e => ({ entity: e, isEnemy: true })),
    ];
    this.turnOrder = allCombatants.sort((a, b) => b.entity.spd - a.entity.spd);

    this.addLog(`Combat begins: ${encounter.name}!`, C.P.GOLD);
    if (this.isFinalBoss) {
      this.addLog('⚠ BOSS BATTLE ⚠', '#ff2040');
    }

    this.xpGained = encounter.xp || 0;
    const [gMin, gMax] = encounter.gold || [0, 0];
    this.goldGained = randInt(gMin, gMax);

    this.advanceTurn();
  }

  addLog(text, color = C.P.WHITE) {
    this.log.push({ text, color });
    if (this.log.length > 60) this.log = this.log.slice(-60);
  }

  // ---- TURN MANAGEMENT ----
  advanceTurn() {
    // Skip dead combatants
    let attempts = 0;
    do {
      this.turnIdx = (this.turnIdx + 1) % this.turnOrder.length;
      attempts++;
    } while (this.turnOrder[this.turnIdx].entity.isDead && attempts < this.turnOrder.length * 2);

    if (this.checkEndCondition()) return;

    const current = this.turnOrder[this.turnIdx];
    if (current.isEnemy) {
      this.phase = COMBAT_PHASE.ENEMY_TURN;
      this.doEnemyTurn(current.entity);
    } else if (current.entity === this.party[0]) {
      this.phase = COMBAT_PHASE.PLAYER_TURN;
      this.selectedAction = 0;
      this.selectedTarget = this.firstAliveEnemy();
      current.entity.tickCooldown();
    } else {
      this.phase = COMBAT_PHASE.COMPANION_TURN;
      current.entity.tickCooldown();
      setTimeout(() => this.doCompanionTurn(current.entity), 800);
    }
  }

  firstAliveEnemy() {
    return this.enemies.findIndex(e => !e.isDead);
  }

  currentActor() {
    return this.turnOrder[this.turnIdx]?.entity;
  }

  isPlayerTurn() {
    return this.phase === COMBAT_PHASE.PLAYER_TURN;
  }

  // ---- ACTIONS ----
  playerAttack(targetIdx) {
    const player = this.party[0];
    const target = this.enemies[targetIdx];
    if (!target || target.isDead) return;

    const { damage, isCrit, missed } = this.calcHit(player.atk, target.def);

    this.animate('attack', player, [target], () => {
      if (missed) {
        this.addLog(`${player.name} missed!`, C.P.GREY);
      } else {
        target.hp = Math.max(0, target.hp - damage);
        if (isCrit) {
          this.ps.floatingText(target.x + 20, target.y, `CRIT! -${damage}`, C.P.GOLD, 16);
          this.ps.hit(target.x + 20, target.y + 30, C.P.GOLD);
          this.addLog(`CRITICAL HIT! ${player.name} deals ${damage} damage!`, C.P.GOLD);
        } else {
          this.ps.floatingText(target.x + 20, target.y, `-${damage}`, C.P.REDLT, 13);
          this.ps.hit(target.x + 20, target.y + 30);
          this.ps.slash(target.x + 10, target.y + 30);
          this.addLog(`${player.name} attacks ${target.name} for ${damage} damage.`, C.P.WHITE);
        }
        if (target.hp <= 0) this.killEnemy(target);
      }

      if (!this.checkEndCondition()) this.advanceTurn();
    });
  }

  playerAbility(targetIdx) {
    const player = this.party[0];
    if (player.abilityCooldown > 0) {
      this.addLog('Ability on cooldown!', C.P.GREY);
      return;
    }

    const target = this.enemies[targetIdx];
    if (!target || target.isDead) return;

    // Ranger's Shot: ignore 4 defence
    const rawAtk = player.atk + 4;
    const { damage, isCrit } = this.calcHit(rawAtk, Math.max(0, target.def - 4));

    player.abilityCooldown = player.ability.cooldown;

    this.animate('cast', player, [target], () => {
      target.hp = Math.max(0, target.hp - damage);
      this.ps.magic(target.x + 20, target.y + 30, '#80e040');
      this.ps.floatingText(target.x + 20, target.y, `-${damage}`, '#80e040', 14);
      this.addLog(`Ranger's Shot! ${damage} piercing damage to ${target.name}!`, '#80e040');
      if (target.hp <= 0) this.killEnemy(target);
      if (!this.checkEndCondition()) this.advanceTurn();
    });
  }

  playerItem(itemKey, targetIsPlayer = false) {
    const player = this.party[0];
    let msg = '';

    if (itemKey === 'potion') {
      const heal = rollN(2, 8) + 5;
      if (targetIsPlayer) {
        player.heal(heal);
        this.ps.heal(player.x + 20, player.y + 30);
        this.ps.floatingText(player.x + 20, player.y, `+${heal}`, C.P.GREENLT, 13);
        msg = `${player.name} drinks a health potion: +${heal} HP.`;
      }
    }

    this.addLog(msg || 'Used an item.', C.P.GREENLT);
    if (!this.checkEndCondition()) this.advanceTurn();
  }

  tryFlee(player) {
    const chance = C.FLEE_BASE + (player.spd - 10) * 0.02;
    if (Math.random() < chance) {
      this.addLog(`${player.name} flees the battle!`, C.P.GOLD);
      this.fled  = true;
      this.phase = COMBAT_PHASE.DEFEAT;
    } else {
      this.addLog('Failed to flee!', C.P.REDLT);
      this.advanceTurn();
    }
  }

  // ---- COMPANION AI ----
  doCompanionTurn(companion) {
    if (companion.isDead || this.phase === COMBAT_PHASE.VICTORY || this.phase === COMBAT_PHASE.DEFEAT) return;

    this.phase = COMBAT_PHASE.ANIMATING;

    // Decide action based on personality
    const lowestAllyHp = Math.min(...this.party.map(p => p.hp / p.maxHp));
    const aliveEnemies = this.enemies.filter(e => !e.isDead);
    if (aliveEnemies.length === 0) { this.checkEndCondition(); return; }

    let action = 'attack';
    let abilityUsed = false;

    if (companion.id === 'seraphina') {
      // Healer: heal if anyone below 40%, else attack
      const wounded = this.party.find(p => !p.isDead && p.hp / p.maxHp < 0.40);
      if (wounded && companion.abilityCooldown === 0) {
        action = 'heal'; abilityUsed = true;
        companion.abilityCooldown = companion.ability.cooldown;
        const heal = rollN(2, 10) + 8;
        this.animate('cast', companion, [wounded], () => {
          wounded.heal(heal);
          this.ps.heal(wounded.x + 20, wounded.y + 30);
          this.ps.floatingText(wounded.x + 20, wounded.y, `+${heal}`, C.P.GREENLT, 13);
          this.addLog(`${companion.name}: Radiant Heal on ${wounded.name}! +${heal} HP.`, C.P.GREENLT);
          if (!this.checkEndCondition()) this.advanceTurn();
        });
        return;
      }
    }

    if (companion.id === 'miriel' && companion.abilityCooldown === 0 && aliveEnemies.length >= 2) {
      // AOE spell on multiple enemies
      abilityUsed = true;
      companion.abilityCooldown = companion.ability.cooldown;
      const targets = aliveEnemies.slice(0, 3);
      this.animate('cast', companion, targets, () => {
        for (const e of targets) {
          const dmg = rollN(1, 12) + 12;
          e.hp = Math.max(0, e.hp - dmg);
          this.ps.magic(e.x + 20, e.y + 30, C.P.PURPLELT);
          this.ps.floatingText(e.x + 20, e.y, `-${dmg}`, C.P.PURPLELT, 13);
          if (e.hp <= 0) this.killEnemy(e);
        }
        this.addLog(`${companion.name}: Arcane Nova hits ${targets.length} enemies!`, C.P.PURPLELT);
        if (!this.checkEndCondition()) this.advanceTurn();
      });
      return;
    }

    if (companion.id === 'finn' && companion.abilityCooldown === 0) {
      // Target weakest enemy for kill
      const weakest = aliveEnemies.reduce((a, b) => a.hp < b.hp ? a : b);
      abilityUsed = true;
      companion.abilityCooldown = companion.ability.cooldown;
      const dmg = rollN(1, 10) + 10;
      this.animate('attack', companion, [weakest], () => {
        weakest.hp = Math.max(0, weakest.hp - dmg);
        this.ps.slash(weakest.x + 10, weakest.y + 30);
        this.ps.floatingText(weakest.x + 20, weakest.y, `-${dmg}`, C.P.GOLDLT, 13);
        if (weakest.hp <= 0) this.killEnemy(weakest);
        this.addLog(`${companion.name}: Shadow Step! ${dmg} damage!`, C.P.GOLDLT);
        if (!this.checkEndCondition()) this.advanceTurn();
      });
      return;
    }

    // Default: basic attack on random alive enemy
    const target = pick(aliveEnemies);
    const { damage, isCrit, missed } = this.calcHit(companion.atk, target.def);

    this.animate('attack', companion, [target], () => {
      if (!missed) {
        target.hp = Math.max(0, target.hp - damage);
        this.ps.hit(target.x + 20, target.y + 30, companion.color);
        this.ps.floatingText(target.x + 20, target.y, `-${damage}`, companion.colorLight, 12);
        const critStr = isCrit ? ' (CRIT!)' : '';
        this.addLog(`${companion.name} attacks ${target.name} for ${damage}${critStr}.`, C.P.WHITE);
        if (target.hp <= 0) this.killEnemy(target);
      } else {
        this.addLog(`${companion.name} misses ${target.name}!`, C.P.GREY);
      }
      if (!this.checkEndCondition()) this.advanceTurn();
    });
  }

  // ---- ENEMY AI ----
  doEnemyTurn(enemy) {
    if (enemy.isDead) { this.advanceTurn(); return; }
    this.phase = COMBAT_PHASE.ANIMATING;

    const alivePart = this.party.filter(p => !p.isDead);
    if (alivePart.length === 0) { this.checkEndCondition(); return; }

    // Boss has a 30% chance of multi-target
    if (enemy.isBoss && Math.random() < 0.3) {
      const targets = alivePart.slice(0, Math.min(3, alivePart.length));
      this.animate('attack', enemy, targets, () => {
        for (const t of targets) {
          const dmg = Math.max(1, rollN(1, 8) + Math.floor(enemy.atk * 0.7) - Math.floor(t.def * 0.5));
          t.takeDamage(dmg);
          this.ps.hit(t.x + 20, t.y + 30, '#ff2040');
          this.ps.floatingText(t.x + 20, t.y, `-${dmg}`, C.P.REDLT, 12);
          this.addLog(`${enemy.name} strikes ${t.name} for ${dmg}!`, C.P.REDLT);
        }
        if (!this.checkEndCondition()) this.advanceTurn();
      });
      return;
    }

    // Target: prefer lowest HP party member
    const target = alivePart.reduce((a, b) => (a.hp < b.hp ? a : b));
    const rawDmg = rollN(1, 8) + Math.floor(enemy.atk * 0.6);
    const dmg = Math.max(1, rawDmg - Math.floor(target.def * 0.4));

    this.animate('attack', enemy, [target], () => {
      target.takeDamage(dmg);
      this.ps.hit(target.x + 20, target.y + 30, '#ff2040');
      this.ps.floatingText(target.x + 20, target.y, `-${dmg}`, C.P.REDLT, 12);
      this.addLog(`${enemy.name} attacks ${target.name} for ${dmg}.`, C.P.REDLT);
      if (target.isDead) {
        this.addLog(`${target.name} has fallen!`, '#ff4060');
        this.ps.death(target.x + 20, target.y + 30, target.color || C.P.GREY);
        target.animState = 'dead';
      }
      if (!this.checkEndCondition()) this.advanceTurn();
    });
  }

  // ---- DAMAGE CALC ----
  calcHit(atk, def) {
    const hitRoll = rollN(1, 20);
    const isCrit  = hitRoll === 20;
    const missed  = hitRoll === 1;
    const base    = rollN(2, 6) + Math.floor(atk * 0.8) - Math.floor(def * 0.5);
    const damage  = Math.max(1, isCrit ? base * C.CRIT_MULT : base) | 0;
    return { damage, isCrit, missed };
  }

  killEnemy(enemy) {
    enemy.isDead = true;
    enemy.hp     = 0;
    enemy.animState = 'dead';
    this.ps.death(enemy.x + 20, enemy.y + 30, enemy.deathColor || C.P.GREY);
    this.addLog(`${enemy.name} has been defeated!`, C.P.GOLD);
  }

  // ---- ANIMATION HELPER ----
  animate(type, src, targets, onDone) {
    this.phase = COMBAT_PHASE.ANIMATING;
    src.animState = type;
    src.animTimer = 0;
    for (const t of targets) { t.animState = t.isDead ? 'dead' : 'hurt'; t.animTimer = 0; }

    const dur = type === 'cast' ? 40 : 28;
    this.pendingAnim = { type, src, targets, onDone, duration: dur, elapsed: 0 };
  }

  tickAnim() {
    if (!this.pendingAnim) return;
    this.pendingAnim.elapsed++;
    if (this.pendingAnim.elapsed >= this.pendingAnim.duration) {
      const { src, targets, onDone } = this.pendingAnim;
      src.animState = src.isDead ? 'dead' : 'idle';
      for (const t of targets) { if (!t.isDead) t.animState = 'idle'; }
      this.pendingAnim = null;
      onDone();
    }
  }

  // ---- END CONDITIONS ----
  checkEndCondition() {
    const allEnemiesDead = this.enemies.every(e => e.isDead);
    const allPartyDead   = this.party.every(p => p.isDead);

    if (allEnemiesDead) {
      this.phase = COMBAT_PHASE.VICTORY;
      this.addLog('Victory! The enemy is defeated.', C.P.GOLD);
      return true;
    }
    if (allPartyDead) {
      this.phase = COMBAT_PHASE.DEFEAT;
      this.addLog('The fellowship has fallen...', C.P.REDLT);
      return true;
    }
    return false;
  }

  get isOver() {
    return this.phase === COMBAT_PHASE.VICTORY || this.phase === COMBAT_PHASE.DEFEAT;
  }

  get playerWon() { return this.phase === COMBAT_PHASE.VICTORY; }
}
