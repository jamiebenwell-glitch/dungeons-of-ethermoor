// ============================================================
// GAME.JS - Core Game Engine / State Machine
// ============================================================

const GAME_STATES = {
  TITLE: 'title',
  CLASS_SELECT: 'class_select',
  PLAYING: 'playing',
  INVENTORY: 'inventory',
  DIALOGUE: 'dialogue',
  COMBAT: 'combat',
  SHOP: 'shop',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
  LEVEL_UP: 'level_up',
};

const MAX_DUNGEON_LEVEL = 8;

class Game {
  constructor() {
    this.state = GAME_STATES.TITLE;
    this.player = null;
    this.dungeonLevel = 1;
    this.dungeon = null;
    this.map = null;
    this.rooms = null;
    this.monsters = [];
    this.npcs = [];
    this.items = [];
    this.particles = [];
    this.messages = [];
    this.maxMessages = 50;
    this.generator = new DungeonGenerator();
    this.dialogueEngine = new DialogueEngine();
    this.currentNpc = null;
    this.currentMonster = null;
    this.combatLog = [];
    this.shopItems = [];
    this.animationFrame = 0;
    this.turnCount = 0;
    this.explored = null;
    this.fov = null;
    this.fovRadius = 7;
    this.selectedMenuItem = 0;
    this.titleSelection = 0;
    this.classOptions = ['warrior', 'mage', 'rogue', 'cleric'];
    this.dialogueInput = '';
    this.dialogueMessages = [];
    this.inventorySelection = 0;
    this.shopSelection = 0;
    this.combatAction = 0;
    this.combatActions = [];
    this.pendingLevelUpMessages = [];
    this.screenShake = 0;
    this.flashColor = null;
    this.flashDuration = 0;
  }

  init() {
    this.state = GAME_STATES.TITLE;
    this.addMessage('Welcome to the Dungeons of Ethermoor!', '#FFD700');
  }

  addMessage(text, color = '#cccccc') {
    this.messages.push({ text, color, age: 0 });
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }

  addParticle(x, y, text, color, duration = 30) {
    this.particles.push({ x, y, text, color, duration, maxDuration: duration, offsetY: 0 });
  }

  startNewGame(className) {
    this.player = new Player(className);
    this.dungeonLevel = 1;
    this.generateLevel();
    this.state = GAME_STATES.PLAYING;
    this.addMessage(`${this.player.classData.name} enters the Dungeons of Ethermoor...`, '#FFD700');
    this.addMessage('Use arrow keys or WASD to move. Bump into monsters to attack.', '#87CEEB');
    this.addMessage('Press E near NPCs to talk, I for inventory, G to pick up items.', '#87CEEB');
  }

  generateLevel() {
    const { map, rooms } = this.generator.generate(this.dungeonLevel);
    this.map = map;
    this.rooms = rooms;
    this.monsters = [];
    this.npcs = [];
    this.items = [];
    this.explored = [];
    this.fov = [];

    for (let y = 0; y < this.generator.height; y++) {
      this.explored[y] = [];
      this.fov[y] = [];
      for (let x = 0; x < this.generator.width; x++) {
        this.explored[y][x] = false;
        this.fov[y][x] = false;
      }
    }

    // Place player
    const startPos = this.generator.getRandomFloorTile(map, rooms);
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    const occupied = [{ x: this.player.x, y: this.player.y }];

    // Place stairs down (or boss on last level)
    if (this.dungeonLevel < MAX_DUNGEON_LEVEL) {
      const stairsPos = this.generator.getRandomFloorTile(map, rooms, occupied);
      map[stairsPos.y][stairsPos.x] = TILE.STAIRS_DOWN;
      occupied.push(stairsPos);
    }

    // Place stairs up (except on level 1)
    if (this.dungeonLevel > 1) {
      map[this.player.y][this.player.x] = TILE.STAIRS_UP;
    }

    // Place monsters
    const monsterCount = 4 + this.dungeonLevel * 2;
    const availableMonsters = getMonstersForLevel(this.dungeonLevel);
    for (let i = 0; i < monsterCount; i++) {
      const pos = this.generator.getRandomFloorTile(map, rooms, occupied);
      const templateKey = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
      const monster = new Monster(MONSTER_TEMPLATES[templateKey], this.dungeonLevel);
      monster.x = pos.x;
      monster.y = pos.y;
      this.monsters.push(monster);
      occupied.push(pos);
    }

    // Place boss on final level
    if (this.dungeonLevel === MAX_DUNGEON_LEVEL) {
      const bossPos = this.generator.getRandomFloorTile(map, rooms, occupied);
      const boss = new Monster(MONSTER_TEMPLATES.lich, this.dungeonLevel);
      boss.x = bossPos.x;
      boss.y = bossPos.y;
      this.monsters.push(boss);
      occupied.push(bossPos);
      this.addMessage('You sense an overwhelming evil presence on this level...', '#FF0000');
    }

    // Place NPCs (2-4 per level, from the pool)
    const npcCount = 2 + Math.floor(Math.random() * 3);
    const shuffledNPCs = [...NPC_TEMPLATES].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(npcCount, shuffledNPCs.length); i++) {
      const pos = this.generator.getRandomFloorTile(map, rooms, occupied);
      const npc = new NPC(shuffledNPCs[i]);
      npc.x = pos.x;
      npc.y = pos.y;
      this.npcs.push(npc);
      occupied.push(pos);
    }

    // Place items
    const itemCount = 3 + Math.floor(Math.random() * 3) + Math.floor(this.dungeonLevel / 2);
    for (let i = 0; i < itemCount; i++) {
      const pos = this.generator.getRandomFloorTile(map, rooms, occupied);
      const templateId = getRandomLoot(this.dungeonLevel);
      const item = new Item(templateId);
      item.x = pos.x;
      item.y = pos.y;
      this.items.push(item);
      occupied.push(pos);
    }

    // Place some gold piles
    const goldCount = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < goldCount; i++) {
      const pos = this.generator.getRandomFloorTile(map, rooms, occupied);
      const gold = new Item('potion_health'); // repurpose as gold
      gold.name = 'Gold';
      gold.sprite = 'item_gold';
      gold.type = 'gold';
      gold.value = 10 + Math.floor(Math.random() * 20) * this.dungeonLevel;
      gold.x = pos.x;
      gold.y = pos.y;
      this.items.push(gold);
      occupied.push(pos);
    }

    // Place chests
    const chestCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < chestCount; i++) {
      const pos = this.generator.getRandomFloorTile(map, rooms, occupied);
      map[pos.y][pos.x] = TILE.CHEST;
      occupied.push(pos);
    }

    this.updateFOV();
    this.addMessage(`--- Dungeon Level ${this.dungeonLevel} ---`, '#FFD700');
  }

  updateFOV() {
    // Clear FOV
    for (let y = 0; y < this.generator.height; y++) {
      for (let x = 0; x < this.generator.width; x++) {
        this.fov[y][x] = false;
      }
    }

    // Simple raycasting FOV
    const px = this.player.x;
    const py = this.player.y;
    const r = this.fovRadius;

    for (let angle = 0; angle < 360; angle += 1) {
      const rad = (angle * Math.PI) / 180;
      const dx = Math.cos(rad);
      const dy = Math.sin(rad);

      let x = px + 0.5;
      let y = py + 0.5;

      for (let step = 0; step < r; step++) {
        const tx = Math.floor(x);
        const ty = Math.floor(y);

        if (tx < 0 || tx >= this.generator.width || ty < 0 || ty >= this.generator.height) break;

        this.fov[ty][tx] = true;
        this.explored[ty][tx] = true;

        if (this.map[ty][tx] === TILE.WALL) break;

        x += dx * 0.5;
        y += dy * 0.5;
      }
    }
  }

  handleInput(key) {
    switch (this.state) {
      case GAME_STATES.TITLE:
        this.handleTitleInput(key);
        break;
      case GAME_STATES.CLASS_SELECT:
        this.handleClassSelectInput(key);
        break;
      case GAME_STATES.PLAYING:
        this.handlePlayingInput(key);
        break;
      case GAME_STATES.INVENTORY:
        this.handleInventoryInput(key);
        break;
      case GAME_STATES.DIALOGUE:
        this.handleDialogueInput(key);
        break;
      case GAME_STATES.COMBAT:
        this.handleCombatInput(key);
        break;
      case GAME_STATES.SHOP:
        this.handleShopInput(key);
        break;
      case GAME_STATES.GAME_OVER:
        this.handleGameOverInput(key);
        break;
      case GAME_STATES.VICTORY:
        this.handleGameOverInput(key);
        break;
      case GAME_STATES.LEVEL_UP:
        this.handleLevelUpInput(key);
        break;
    }
  }

  handleTitleInput(key) {
    if (key === 'ArrowUp' || key === 'w') {
      this.titleSelection = Math.max(0, this.titleSelection - 1);
    } else if (key === 'ArrowDown' || key === 's') {
      this.titleSelection = Math.min(1, this.titleSelection + 1);
    } else if (key === 'Enter' || key === ' ') {
      if (this.titleSelection === 0) {
        this.state = GAME_STATES.CLASS_SELECT;
        this.selectedMenuItem = 0;
      }
    }
  }

  handleClassSelectInput(key) {
    if (key === 'ArrowUp' || key === 'w') {
      this.selectedMenuItem = Math.max(0, this.selectedMenuItem - 1);
    } else if (key === 'ArrowDown' || key === 's') {
      this.selectedMenuItem = Math.min(this.classOptions.length - 1, this.selectedMenuItem + 1);
    } else if (key === 'Enter' || key === ' ') {
      this.startNewGame(this.classOptions[this.selectedMenuItem]);
    } else if (key === 'Escape') {
      this.state = GAME_STATES.TITLE;
    }
  }

  handlePlayingInput(key) {
    let dx = 0, dy = 0;
    let moved = false;

    if (key === 'ArrowUp' || key === 'w') { dy = -1; moved = true; }
    else if (key === 'ArrowDown' || key === 's') { dy = 1; moved = true; }
    else if (key === 'ArrowLeft' || key === 'a') { dx = -1; moved = true; }
    else if (key === 'ArrowRight' || key === 'd') { dx = 1; moved = true; }
    else if (key === 'i') { this.openInventory(); return; }
    else if (key === 'e') { this.interactNearby(); return; }
    else if (key === 'g') { this.pickupItem(); return; }
    else if (key === '1' || key === '2' || key === '3' || key === '4') {
      const abilityIdx = parseInt(key) - 1;
      if (abilityIdx < this.player.abilities.length) {
        const result = this.player.useAbility(this.player.abilities[abilityIdx]);
        if (result) {
          this.addMessage(result.message, result.type === 'heal' ? '#90EE90' : '#87CEEB');
          this.addParticle(this.player.x, this.player.y, result.type === 'heal' ? '+HP' : 'BUFF', result.type === 'heal' ? '#90EE90' : '#87CEEB');
          this.endTurn();
        } else {
          this.addMessage('That ability is on cooldown.', '#FF6666');
        }
      }
      return;
    }
    else if (key === '>') {
      this.tryDescend();
      return;
    }

    if (moved) {
      this.tryMove(dx, dy);
    }
  }

  tryMove(dx, dy) {
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;

    if (nx < 0 || nx >= this.generator.width || ny < 0 || ny >= this.generator.height) return;

    const tile = this.map[ny][nx];
    if (tile === TILE.WALL) return;
    if (tile === TILE.VOID) return;

    // Check for monster collision (melee combat)
    const monster = this.monsters.find(m => m.x === nx && m.y === ny && !m.isDead);
    if (monster) {
      this.startCombat(monster);
      return;
    }

    // Move player
    this.player.x = nx;
    this.player.y = ny;

    // Check for stairs
    if (tile === TILE.STAIRS_DOWN) {
      this.addMessage('You see stairs leading down. Press > to descend.', '#FFD700');
    }

    // Check for chest
    if (tile === TILE.CHEST) {
      this.openChest(nx, ny);
    }

    // Auto-pickup gold
    const goldItem = this.items.find(item => item.x === nx && item.y === ny && item.type === 'gold');
    if (goldItem) {
      this.player.gold += goldItem.value;
      this.addMessage(`Picked up ${goldItem.value} gold.`, '#FFD700');
      this.addParticle(nx, ny, `+${goldItem.value}g`, '#FFD700');
      this.items = this.items.filter(i => i !== goldItem);
    }

    this.endTurn();
  }

  tryDescend() {
    const tile = this.map[this.player.y][this.player.x];
    if (tile === TILE.STAIRS_DOWN) {
      this.dungeonLevel++;
      this.player.dungeonsCleared++;
      this.addMessage(`Descending to level ${this.dungeonLevel}...`, '#FFD700');
      this.generateLevel();
    } else {
      this.addMessage('There are no stairs here.', '#FF6666');
    }
  }

  openChest(x, y) {
    this.map[y][x] = TILE.FLOOR;
    const goldAmount = 20 + Math.floor(Math.random() * 30) * this.dungeonLevel;
    this.player.gold += goldAmount;
    this.addMessage(`Opened a chest! Found ${goldAmount} gold!`, '#FFD700');
    this.addParticle(x, y, `+${goldAmount}g`, '#FFD700');

    // Chance for item
    if (Math.random() < 0.6) {
      const templateId = getRandomLoot(this.dungeonLevel);
      const item = new Item(templateId);
      this.player.inventory.push(item);
      this.addMessage(`Found ${item.name}!`, '#90EE90');
    }
  }

  interactNearby() {
    // Find adjacent NPC
    for (const npc of this.npcs) {
      const dist = Math.abs(npc.x - this.player.x) + Math.abs(npc.y - this.player.y);
      if (dist <= 1) {
        this.openDialogue(npc);
        return;
      }
    }
    this.addMessage('No one nearby to talk to.', '#888888');
  }

  pickupItem() {
    const item = this.items.find(i => i.x === this.player.x && i.y === this.player.y && i.type !== 'gold');
    if (item) {
      if (this.player.inventory.length >= 10) {
        this.addMessage('Inventory full! (max 10 items)', '#FF6666');
        return;
      }
      this.player.inventory.push(item);
      this.items = this.items.filter(i => i !== item);
      this.addMessage(`Picked up ${item.name}.`, '#90EE90');
      this.addParticle(this.player.x, this.player.y, item.name, '#90EE90');
    } else {
      this.addMessage('Nothing to pick up here.', '#888888');
    }
  }

  openInventory() {
    if (this.player.inventory.length === 0) {
      this.addMessage('Your inventory is empty.', '#888888');
      return;
    }
    this.state = GAME_STATES.INVENTORY;
    this.inventorySelection = 0;
  }

  handleInventoryInput(key) {
    if (key === 'Escape' || key === 'i') {
      this.state = GAME_STATES.PLAYING;
    } else if (key === 'ArrowUp' || key === 'w') {
      this.inventorySelection = Math.max(0, this.inventorySelection - 1);
    } else if (key === 'ArrowDown' || key === 's') {
      this.inventorySelection = Math.min(this.player.inventory.length - 1, this.inventorySelection + 1);
    } else if (key === 'Enter' || key === ' ') {
      this.useItem(this.inventorySelection);
    } else if (key === 'x') {
      this.dropItem(this.inventorySelection);
    }
  }

  useItem(index) {
    const item = this.player.inventory[index];
    if (!item) return;

    if (item.type === 'consumable') {
      if (item.use) {
        const msg = item.use(this.player);
        this.addMessage(msg, '#90EE90');
        this.player.inventory.splice(index, 1);
        if (this.player.inventory.length === 0) {
          this.state = GAME_STATES.PLAYING;
        } else {
          this.inventorySelection = Math.min(this.inventorySelection, this.player.inventory.length - 1);
        }
      }
    } else if (item.type === 'weapon') {
      if (this.player.weapon) {
        this.player.inventory.push(this.player.weapon);
      }
      this.player.weapon = item;
      this.player.inventory.splice(index, 1);
      this.addMessage(`Equipped ${item.name}.`, '#87CEEB');
      if (this.player.inventory.length === 0) {
        this.state = GAME_STATES.PLAYING;
      } else {
        this.inventorySelection = Math.min(this.inventorySelection, this.player.inventory.length - 1);
      }
    } else if (item.type === 'armor') {
      if (this.player.armor) {
        this.player.inventory.push(this.player.armor);
      }
      this.player.armor = item;
      this.player.inventory.splice(index, 1);
      this.addMessage(`Equipped ${item.name}.`, '#87CEEB');
      if (this.player.inventory.length === 0) {
        this.state = GAME_STATES.PLAYING;
      } else {
        this.inventorySelection = Math.min(this.inventorySelection, this.player.inventory.length - 1);
      }
    }
  }

  dropItem(index) {
    const item = this.player.inventory[index];
    if (!item) return;
    item.x = this.player.x;
    item.y = this.player.y;
    this.items.push(item);
    this.player.inventory.splice(index, 1);
    this.addMessage(`Dropped ${item.name}.`, '#888888');
    if (this.player.inventory.length === 0) {
      this.state = GAME_STATES.PLAYING;
    } else {
      this.inventorySelection = Math.min(this.inventorySelection, this.player.inventory.length - 1);
    }
  }

  // ---- COMBAT ----
  startCombat(monster) {
    this.currentMonster = monster;
    this.state = GAME_STATES.COMBAT;
    this.combatLog = [];
    this.combatAction = 0;

    this.combatActions = ['Attack', 'Use Item', 'Flee'];
    // Add class abilities
    for (const ability of this.player.abilities) {
      const cd = this.player.abilityCooldowns[ability] || 0;
      this.combatActions.push(cd > 0 ? `${ability} (CD:${cd})` : ability);
    }
    // Add scroll attacks
    for (const item of this.player.inventory) {
      if (item.damage) {
        this.combatActions.push(`Use ${item.name}`);
      }
    }

    this.combatLog.push({ text: `A ${monster.name} blocks your path!`, color: '#FF6666' });
    if (monster.isBoss) {
      this.combatLog.push({ text: 'This is a BOSS encounter!', color: '#FF0000' });
      this.screenShake = 10;
    }
  }

  handleCombatInput(key) {
    if (key === 'ArrowUp' || key === 'w') {
      this.combatAction = Math.max(0, this.combatAction - 1);
    } else if (key === 'ArrowDown' || key === 's') {
      this.combatAction = Math.min(this.combatActions.length - 1, this.combatAction + 1);
    } else if (key === 'Enter' || key === ' ') {
      this.executeCombatAction();
    }
  }

  executeCombatAction() {
    const action = this.combatActions[this.combatAction];
    const monster = this.currentMonster;

    if (action === 'Attack') {
      this.playerAttack(monster);
    } else if (action === 'Use Item') {
      // Use first health potion if available
      const potionIdx = this.player.inventory.findIndex(i => i.templateId === 'potion_health');
      if (potionIdx >= 0) {
        const msg = this.player.inventory[potionIdx].use(this.player);
        this.player.inventory.splice(potionIdx, 1);
        this.combatLog.push({ text: msg, color: '#90EE90' });
      } else {
        this.combatLog.push({ text: 'No health potions!', color: '#FF6666' });
        return;
      }
    } else if (action === 'Flee') {
      if (Math.random() < 0.5 + statModifier(this.player.stats.dex) * 0.1) {
        this.combatLog.push({ text: 'You fled successfully!', color: '#FFD700' });
        this.state = GAME_STATES.PLAYING;
        // Move player back
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dx,dy] of dirs) {
          const nx = this.player.x + dx;
          const ny = this.player.y + dy;
          if (nx >= 0 && nx < this.generator.width && ny >= 0 && ny < this.generator.height) {
            if (this.map[ny][nx] === TILE.FLOOR && !this.monsters.some(m => m.x === nx && m.y === ny && !m.isDead)) {
              this.player.x = nx;
              this.player.y = ny;
              break;
            }
          }
        }
        this.endTurn();
        return;
      } else {
        this.combatLog.push({ text: 'Failed to flee!', color: '#FF6666' });
      }
    } else if (action.startsWith('Use ')) {
      // Scroll usage
      const scrollName = action.replace('Use ', '');
      const scrollIdx = this.player.inventory.findIndex(i => i.name === scrollName && i.damage);
      if (scrollIdx >= 0) {
        const scroll = this.player.inventory[scrollIdx];
        const damage = scroll.damage();
        monster.hp -= damage;
        this.combatLog.push({ text: `Used ${scroll.name}! Dealt ${damage} damage!`, color: '#FFA500' });
        this.addParticle(monster.x, monster.y, `-${damage}`, '#FFA500');
        this.screenShake = 5;
        this.player.inventory.splice(scrollIdx, 1);
        // Refresh combat actions
        this.combatActions = this.combatActions.filter(a => a !== action);
      }
    } else {
      // Class ability
      const abilityName = action.replace(/ \(CD:\d+\)/, '');
      const result = this.player.useAbility(abilityName);
      if (result) {
        this.combatLog.push({ text: result.message, color: result.type === 'heal' ? '#90EE90' : '#87CEEB' });
      } else {
        this.combatLog.push({ text: 'Ability on cooldown!', color: '#FF6666' });
        return;
      }
    }

    // Check if monster died
    if (monster.hp <= 0) {
      this.monsterDefeated(monster);
      return;
    }

    // Monster attacks back
    this.monsterAttack(monster);

    // Check player death
    if (this.player.isDead) {
      this.state = GAME_STATES.GAME_OVER;
      return;
    }

    // Refresh combat action labels
    this.refreshCombatActions();
  }

  playerAttack(monster) {
    const attackRoll = rollD20();
    const totalAttack = attackRoll + this.player.getAttackBonus();
    const bonusDamage = this.player.getBonusDamage();

    if (attackRoll === 20) {
      // Critical hit!
      const damage = (this.player.getDamageRoll() + bonusDamage) * 2;
      monster.hp -= damage;
      this.combatLog.push({ text: `CRITICAL HIT! You deal ${damage} damage!`, color: '#FFD700' });
      this.addParticle(monster.x, monster.y, `CRIT -${damage}`, '#FFD700');
      this.screenShake = 8;
      this.flashColor = '#FFD700';
      this.flashDuration = 5;
    } else if (totalAttack >= monster.ac) {
      const damage = Math.max(1, this.player.getDamageRoll() + bonusDamage);
      monster.hp -= damage;
      this.combatLog.push({ text: `You hit the ${monster.name} for ${damage} damage! (${attackRoll}+${this.player.getAttackBonus()} vs AC ${monster.ac})`, color: '#FFFFFF' });
      this.addParticle(monster.x, monster.y, `-${damage}`, '#FF6666');
      this.screenShake = 3;
    } else {
      this.combatLog.push({ text: `You miss the ${monster.name}. (${attackRoll}+${this.player.getAttackBonus()} vs AC ${monster.ac})`, color: '#888888' });
    }
  }

  monsterAttack(monster) {
    const attackRoll = rollD20();
    const totalAttack = attackRoll + monster.attackBonus;

    if (attackRoll === 20) {
      const damage = monster.rollDamage() * 2;
      this.player.takeDamage(damage);
      this.combatLog.push({ text: `CRITICAL! The ${monster.name} hits you for ${damage} damage!`, color: '#FF0000' });
      this.addParticle(this.player.x, this.player.y, `CRIT -${damage}`, '#FF0000');
      this.screenShake = 10;
      this.flashColor = '#FF0000';
      this.flashDuration = 5;
    } else if (totalAttack >= this.player.getEffectiveAC()) {
      const damage = Math.max(1, monster.rollDamage());
      this.player.takeDamage(damage);
      this.combatLog.push({ text: `The ${monster.name} hits you for ${damage} damage.`, color: '#FF6666' });
      this.addParticle(this.player.x, this.player.y, `-${damage}`, '#FF6666');
      this.screenShake = 4;
    } else {
      this.combatLog.push({ text: `The ${monster.name} misses you.`, color: '#90EE90' });
    }

    this.player.tickCooldowns();
  }

  monsterDefeated(monster) {
    monster.isDead = true;
    monster.hp = 0;
    this.player.kills++;
    const xpMsgs = this.player.addXp(monster.xp);
    this.combatLog.push({ text: `${monster.name} defeated! +${monster.xp} XP`, color: '#FFD700' });
    this.addMessage(`Defeated ${monster.name}! +${monster.xp} XP`, '#FFD700');
    this.addParticle(monster.x, monster.y, `+${monster.xp}XP`, '#FFD700');

    // Check for level up
    if (xpMsgs.length > 0) {
      this.pendingLevelUpMessages = xpMsgs;
      for (const msg of xpMsgs) {
        this.combatLog.push({ text: msg, color: '#FFD700' });
        this.addMessage(msg, '#FFD700');
      }
    }

    // Boss defeat = victory
    if (monster.isBoss) {
      this.state = GAME_STATES.VICTORY;
      return;
    }

    // Drop loot
    if (Math.random() < 0.4) {
      const templateId = getRandomLoot(this.dungeonLevel);
      const item = new Item(templateId);
      item.x = monster.x;
      item.y = monster.y;
      this.items.push(item);
      this.addMessage(`The ${monster.name} dropped ${item.name}!`, '#90EE90');
    }

    // Drop gold
    if (Math.random() < 0.6) {
      const goldAmt = 5 + Math.floor(Math.random() * 15) * this.dungeonLevel;
      this.player.gold += goldAmt;
      this.addMessage(`Found ${goldAmt} gold.`, '#FFD700');
    }

    if (this.pendingLevelUpMessages.length > 0) {
      this.state = GAME_STATES.LEVEL_UP;
    } else {
      this.state = GAME_STATES.PLAYING;
    }
    this.endTurn();
  }

  refreshCombatActions() {
    this.combatActions = ['Attack', 'Use Item', 'Flee'];
    for (const ability of this.player.abilities) {
      const cd = this.player.abilityCooldowns[ability] || 0;
      this.combatActions.push(cd > 0 ? `${ability} (CD:${cd})` : ability);
    }
    for (const item of this.player.inventory) {
      if (item.damage) {
        this.combatActions.push(`Use ${item.name}`);
      }
    }
    this.combatAction = Math.min(this.combatAction, this.combatActions.length - 1);
  }

  handleLevelUpInput(key) {
    if (key === 'Enter' || key === ' ') {
      this.pendingLevelUpMessages = [];
      this.state = GAME_STATES.PLAYING;
    }
  }

  // ---- DIALOGUE ----
  openDialogue(npc) {
    this.currentNpc = npc;
    this.state = GAME_STATES.DIALOGUE;
    this.dialogueInput = '';
    this.dialogueMessages = [];

    const greeting = this.dialogueEngine.getGreeting(npc, { player: this.player, dungeonLevel: this.dungeonLevel });
    this.dialogueMessages.push({ role: 'npc', text: greeting });

    if (npc.sells) {
      this.dialogueMessages.push({ role: 'system', text: '[Press T to trade, or type a message and press Enter to chat]' });
    }
    if (npc.heals) {
      this.dialogueMessages.push({ role: 'system', text: '[Press H to receive healing]' });
    }
  }

  handleDialogueInput(key) {
    if (key === 'Escape') {
      this.state = GAME_STATES.PLAYING;
      this.currentNpc = null;
      return;
    }

    if (key === 'Enter' && this.dialogueInput.trim()) {
      const input = this.dialogueInput.trim();
      this.dialogueMessages.push({ role: 'player', text: input });

      const response = this.dialogueEngine.generateResponse(
        this.currentNpc,
        input,
        { player: this.player, dungeonLevel: this.dungeonLevel }
      );
      this.dialogueMessages.push({ role: 'npc', text: `${this.currentNpc.name}: ${response}` });
      this.dialogueInput = '';

      // Keep messages manageable
      if (this.dialogueMessages.length > 20) {
        this.dialogueMessages = this.dialogueMessages.slice(-20);
      }
      return;
    }

    if (key === 't' && this.currentNpc.sells && this.dialogueInput === '') {
      this.openShop();
      return;
    }

    if (key === 'h' && this.currentNpc.heals && this.dialogueInput === '') {
      this.healPlayer();
      return;
    }

    if (key === 'Backspace') {
      this.dialogueInput = this.dialogueInput.slice(0, -1);
    } else if (key.length === 1 && this.dialogueInput.length < 80) {
      this.dialogueInput += key;
    }
  }

  healPlayer() {
    if (this.player.hp >= this.player.maxHp) {
      this.dialogueMessages.push({ role: 'npc', text: `${this.currentNpc.name}: You are already in full health, adventurer.` });
      return;
    }
    const cost = 10 * this.dungeonLevel;
    if (this.player.gold < cost) {
      this.dialogueMessages.push({ role: 'npc', text: `${this.currentNpc.name}: I need ${cost} gold for the healing ritual. You don't have enough.` });
      return;
    }
    this.player.gold -= cost;
    const oldHp = this.player.hp;
    this.player.hp = this.player.maxHp;
    const healed = this.player.hp - oldHp;
    this.dialogueMessages.push({ role: 'npc', text: `${this.currentNpc.name}: *channels divine light* You are healed! (+${healed} HP, -${cost} gold)` });
    this.addParticle(this.player.x, this.player.y, `+${healed}HP`, '#90EE90');
  }

  openShop() {
    this.state = GAME_STATES.SHOP;
    this.shopSelection = 0;
    this.shopItems = [];

    // Generate shop inventory based on dungeon level
    const possibleItems = [];
    possibleItems.push('potion_health', 'potion_health');
    if (this.dungeonLevel >= 2) possibleItems.push('potion_mana', 'short_sword', 'leather_armor');
    if (this.dungeonLevel >= 3) possibleItems.push('scroll_fireball');
    if (this.dungeonLevel >= 4) possibleItems.push('long_sword', 'chain_mail', 'scroll_lightning');
    if (this.dungeonLevel >= 6) possibleItems.push('great_sword', 'plate_armor');

    // Pick 4-6 items
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const templateId = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      this.shopItems.push(new Item(templateId));
    }
  }

  handleShopInput(key) {
    if (key === 'Escape') {
      this.state = GAME_STATES.DIALOGUE;
      return;
    }
    if (key === 'ArrowUp' || key === 'w') {
      this.shopSelection = Math.max(0, this.shopSelection - 1);
    } else if (key === 'ArrowDown' || key === 's') {
      this.shopSelection = Math.min(this.shopItems.length - 1, this.shopSelection + 1);
    } else if (key === 'Enter' || key === ' ') {
      this.buyItem(this.shopSelection);
    }
  }

  buyItem(index) {
    const item = this.shopItems[index];
    if (!item) return;

    if (this.player.gold < item.value) {
      this.addMessage(`Not enough gold! Need ${item.value}g.`, '#FF6666');
      return;
    }
    if (this.player.inventory.length >= 10) {
      this.addMessage('Inventory full!', '#FF6666');
      return;
    }

    this.player.gold -= item.value;
    this.player.inventory.push(item);
    this.shopItems.splice(index, 1);
    this.addMessage(`Bought ${item.name} for ${item.value}g.`, '#90EE90');
    if (this.shopItems.length === 0) {
      this.state = GAME_STATES.DIALOGUE;
    } else {
      this.shopSelection = Math.min(this.shopSelection, this.shopItems.length - 1);
    }
  }

  // ---- MONSTER AI ----
  endTurn() {
    this.turnCount++;
    this.player.turnsPlayed++;
    this.updateFOV();
    this.moveMonsters();
    this.updateParticles();
  }

  moveMonsters() {
    for (const monster of this.monsters) {
      if (monster.isDead) continue;

      const dist = monster.distanceTo(this.player);

      // Aggro check
      if (dist <= monster.aggroRange && this.fov[monster.y][monster.x]) {
        monster.isAggro = true;
      }

      if (!monster.isAggro) continue;

      // Simple pathfinding toward player
      const dx = Math.sign(this.player.x - monster.x);
      const dy = Math.sign(this.player.y - monster.y);

      // Adjacent to player? Attack!
      if (dist <= 1) {
        // Monster initiates combat if not already in combat
        if (this.state === GAME_STATES.PLAYING) {
          this.startCombat(monster);
        }
        return;
      }

      // Try to move toward player
      const moves = [];
      if (dx !== 0) moves.push({ x: monster.x + dx, y: monster.y });
      if (dy !== 0) moves.push({ x: monster.x, y: monster.y + dy });
      // Add diagonal and alternate moves
      if (dx !== 0 && dy !== 0) moves.push({ x: monster.x + dx, y: monster.y + dy });

      for (const move of moves) {
        if (move.x >= 0 && move.x < this.generator.width && move.y >= 0 && move.y < this.generator.height) {
          const tile = this.map[move.y][move.x];
          if (tile === TILE.FLOOR || tile === TILE.DOOR) {
            const blocked = this.monsters.some(m => m !== monster && m.x === move.x && m.y === move.y && !m.isDead);
            if (!blocked && !(move.x === this.player.x && move.y === this.player.y)) {
              monster.x = move.x;
              monster.y = move.y;
              break;
            }
          }
        }
      }
    }
  }

  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.duration--;
      p.offsetY -= 0.5;
      return p.duration > 0;
    });

    if (this.screenShake > 0) this.screenShake--;
    if (this.flashDuration > 0) this.flashDuration--;
  }

  handleGameOverInput(key) {
    if (key === 'Enter' || key === ' ') {
      // Reset game
      this.state = GAME_STATES.TITLE;
      this.player = null;
      this.dungeonLevel = 1;
      this.messages = [];
      this.titleSelection = 0;
    }
  }

  getGameState() {
    return {
      player: this.player,
      dungeonLevel: this.dungeonLevel,
    };
  }
}
