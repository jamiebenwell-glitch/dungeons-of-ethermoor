// ============================================================
// ENTITIES.JS - Player, NPCs, Monsters, Items
// ============================================================

// ---- D&D DICE ----
function rollDice(sides, count = 1) {
  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const roll = 1 + Math.floor(Math.random() * sides);
    rolls.push(roll);
    total += roll;
  }
  return { total, rolls };
}

function rollD20() { return rollDice(20).total; }
function rollD6() { return rollDice(6).total; }
function rollD8() { return rollDice(8).total; }

function statModifier(stat) {
  return Math.floor((stat - 10) / 2);
}

// ---- PLAYER ----
const PLAYER_CLASSES = {
  warrior: {
    name: 'Warrior',
    sprite: 'player_warrior',
    hp: 12,
    stats: { str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 10 },
    baseAC: 14,
    attacks: [{ name: 'Sword Slash', damage: '1d8+str', type: 'melee' }],
    abilities: ['Second Wind'],
  },
  mage: {
    name: 'Mage',
    sprite: 'player_mage',
    hp: 8,
    stats: { str: 8, dex: 12, con: 10, int: 16, wis: 14, cha: 10 },
    baseAC: 10,
    attacks: [
      { name: 'Fire Bolt', damage: '1d10', type: 'ranged' },
      { name: 'Staff Strike', damage: '1d4+str', type: 'melee' },
    ],
    abilities: ['Arcane Shield'],
  },
  rogue: {
    name: 'Rogue',
    sprite: 'player_rogue',
    hp: 10,
    stats: { str: 10, dex: 16, con: 12, int: 14, wis: 10, cha: 12 },
    baseAC: 12,
    attacks: [{ name: 'Backstab', damage: '1d6+dex', type: 'melee' }],
    abilities: ['Sneak Attack'],
  },
  cleric: {
    name: 'Cleric',
    sprite: 'player_cleric',
    hp: 10,
    stats: { str: 12, dex: 10, con: 14, int: 10, wis: 16, cha: 14 },
    baseAC: 13,
    attacks: [{ name: 'Sacred Flame', damage: '1d8+wis', type: 'ranged' }],
    abilities: ['Heal'],
  },
};

class Player {
  constructor(className) {
    const cls = PLAYER_CLASSES[className];
    this.className = className;
    this.classData = cls;
    this.name = 'Adventurer';
    this.sprite = cls.sprite;
    this.x = 0;
    this.y = 0;
    this.level = 1;
    this.xp = 0;
    this.xpToLevel = 100;
    this.maxHp = cls.hp + statModifier(cls.stats.con);
    this.hp = this.maxHp;
    this.stats = { ...cls.stats };
    this.ac = cls.baseAC + statModifier(cls.stats.dex);
    this.inventory = [];
    this.gold = 0;
    this.weapon = null;
    this.armor = null;
    this.kills = 0;
    this.dungeonsCleared = 0;
    this.turnsPlayed = 0;
    this.abilities = [...cls.abilities];
    this.abilityCooldowns = {};
    this.statusEffects = [];
    this.isDead = false;
  }

  getAttackBonus() {
    const cls = this.className;
    if (cls === 'warrior' || cls === 'cleric') return statModifier(this.stats.str) + Math.floor(this.level / 2);
    if (cls === 'rogue') return statModifier(this.stats.dex) + Math.floor(this.level / 2);
    if (cls === 'mage') return statModifier(this.stats.int) + Math.floor(this.level / 2);
    return statModifier(this.stats.str);
  }

  getDamageRoll() {
    const attack = this.classData.attacks[0];
    let bonus = 0;
    if (attack.damage.includes('str')) bonus = statModifier(this.stats.str);
    else if (attack.damage.includes('dex')) bonus = statModifier(this.stats.dex);
    else if (attack.damage.includes('wis')) bonus = statModifier(this.stats.wis);

    const match = attack.damage.match(/(\d+)d(\d+)/);
    if (match) {
      const count = parseInt(match[1]);
      const sides = parseInt(match[2]);
      return rollDice(sides, count).total + bonus + (this.weapon ? this.weapon.bonus : 0);
    }
    return 1 + bonus;
  }

  addXp(amount) {
    this.xp += amount;
    const messages = [];
    while (this.xp >= this.xpToLevel) {
      this.xp -= this.xpToLevel;
      this.level++;
      this.xpToLevel = Math.floor(this.xpToLevel * 1.5);
      // Level up bonuses
      const hpGain = rollDice(this.classData.hp > 10 ? 10 : 8).total + statModifier(this.stats.con);
      this.maxHp += Math.max(1, hpGain);
      this.hp = this.maxHp;
      this.ac = this.classData.baseAC + statModifier(this.stats.dex) + Math.floor(this.level / 3);
      // Boost a random stat
      const statKeys = Object.keys(this.stats);
      const boostStat = statKeys[Math.floor(Math.random() * statKeys.length)];
      this.stats[boostStat] += 1;
      messages.push(`Level up! You are now level ${this.level}. +${hpGain} HP, +1 ${boostStat.toUpperCase()}.`);
    }
    return messages;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
  }

  useAbility(abilityName) {
    if (this.abilityCooldowns[abilityName] > 0) return null;

    switch (abilityName) {
      case 'Second Wind':
        const healAmt = rollDice(10).total + this.level;
        this.heal(healAmt);
        this.abilityCooldowns[abilityName] = 5;
        return { message: `Second Wind! Healed ${healAmt} HP.`, type: 'heal' };

      case 'Arcane Shield':
        this.statusEffects.push({ name: 'Arcane Shield', duration: 3, acBonus: 4 });
        this.abilityCooldowns[abilityName] = 6;
        return { message: 'Arcane Shield activated! +4 AC for 3 turns.', type: 'buff' };

      case 'Sneak Attack':
        this.statusEffects.push({ name: 'Sneak Attack', duration: 1, damageBonus: rollDice(6, 2).total });
        this.abilityCooldowns[abilityName] = 4;
        return { message: 'Preparing Sneak Attack! Next attack deals bonus damage.', type: 'buff' };

      case 'Heal':
        const amount = rollDice(8).total + statModifier(this.stats.wis);
        this.heal(amount);
        this.abilityCooldowns[abilityName] = 4;
        return { message: `Divine Heal! Restored ${amount} HP.`, type: 'heal' };
    }
    return null;
  }

  tickCooldowns() {
    for (const key in this.abilityCooldowns) {
      if (this.abilityCooldowns[key] > 0) this.abilityCooldowns[key]--;
    }
    this.statusEffects = this.statusEffects.filter(e => {
      e.duration--;
      return e.duration > 0;
    });
  }

  getEffectiveAC() {
    let ac = this.ac;
    for (const e of this.statusEffects) {
      if (e.acBonus) ac += e.acBonus;
    }
    if (this.armor) ac += this.armor.bonus;
    return ac;
  }

  getBonusDamage() {
    let bonus = 0;
    for (const e of this.statusEffects) {
      if (e.damageBonus) bonus += e.damageBonus;
    }
    return bonus;
  }
}

// ---- NPC DEFINITIONS ----
const NPC_TEMPLATES = [
  {
    id: 'merchant',
    name: 'Grizzlewick',
    title: 'the Merchant',
    sprite: 'npc_merchant',
    race: 'Goblin',
    personality: 'Nervous, entrepreneurial, speaks quickly. Uses lots of superlatives about his wares. Occasionally slips into third person. Terrified of the dungeon monsters but loves gold too much to leave.',
    backstory: 'A goblin who was exiled from his tribe for preferring commerce to combat. Found his way into the dungeons of Ethermoor and set up shop, trading with adventurers and scavenging from the fallen.',
    knowledge: 'Knows about item prices, dungeon rumors, and which monsters carry valuable loot. Has heard whispers about the Ethereal Crown.',
    greeting: "Psst! Hey, you! Grizzlewick has finest wares in all of dungeon! Very cheap, very powerful! ...Please don't kill Grizzlewick.",
    sells: true,
  },
  {
    id: 'sage',
    name: 'Thornwick',
    title: 'the Sage',
    sprite: 'npc_sage',
    race: 'Human',
    personality: 'Absent-minded, brilliant, tends to ramble about arcane theory. Often forgets the adventurer is there mid-sentence. Speaks in overly academic language but is genuinely helpful.',
    backstory: 'An elderly wizard who came to study the magical anomaly beneath Ethermoor. Has been trapped here for so long he has forgotten how long. His research notes are scattered across the dungeon levels.',
    knowledge: 'Expert on dungeon lore, the Ethermoor catastrophe, magical items, and the nature of the Ethereal Crown. Can identify items.',
    greeting: 'Ah, another test subject— I mean, brave adventurer! Tell me, have you noticed the thaumic resonance on this level? Fascinating, truly fascinating...',
    sells: false,
  },
  {
    id: 'cleric_npc',
    name: 'Sister Miravel',
    title: 'the Healer',
    sprite: 'npc_cleric',
    race: 'Human',
    personality: 'Compassionate but world-weary. Has seen too many adventurers die. Speaks with gentle authority. Occasionally lets dark humor slip through.',
    backstory: 'A cleric of the Order of the Silver Dawn, she descended into Ethermoor to tend to the wounded. She maintains a small sanctuary where adventurers can rest.',
    knowledge: 'Knows about healing, undead weaknesses, divine magic, and the religious history of Ethermoor.',
    greeting: 'Come, sit. Let me tend to your wounds. You look... well, better than the last one who came through here. They did not survive.',
    heals: true,
  },
  {
    id: 'guard',
    name: 'Korrath',
    title: 'the Guardian',
    sprite: 'npc_guard',
    race: 'Dragonborn',
    personality: 'Stoic, honorable, speaks formally. Carries deep shame about a past failure. Fiercely protective of other dungeon denizens.',
    backstory: 'A former knight of the Silver Scale who failed to protect his liege during the Ethermoor catastrophe. Now guards a safe room in the dungeon as penance, protecting those who cannot protect themselves.',
    knowledge: 'Expert on combat tactics, monster weaknesses, armor and weapons. Knows the layout of the dungeon well.',
    greeting: 'Hold. State your purpose. ...An adventurer? Then you have more courage than sense. But I respect that.',
  },
  {
    id: 'bard',
    name: 'Pip',
    title: 'the Melodious',
    sprite: 'npc_bard',
    race: 'Halfling',
    personality: 'Irrepressibly cheerful, loves puns and wordplay. Insists on performing even in dire circumstances. Speaks in rhyme when excited. Secretly quite insightful beneath the silly exterior.',
    backstory: 'A halfling bard who heard rumors of the dungeons and came seeking the greatest story ever told. Has survived by being too annoying for monsters to eat.',
    knowledge: 'Knows legends, songs, and tales about Ethermoor. Has explored many levels and knows shortcuts. Great source of rumors and tips delivered through terrible songs.',
    greeting: '♪ Oh a hero comes a-walking, through this dungeon dark and dank! ♪ Welcome friend! Pip Thistledown at your service — bard, raconteur, and occasional snack for goblins!',
  },
  {
    id: 'whisperer',
    name: 'The Whisperer',
    title: '',
    sprite: 'npc_whisperer',
    race: 'Unknown',
    personality: 'Mysterious, cryptic, speaks in riddles and half-truths. Knows far more than they should. Voice seems to come from everywhere and nowhere. Occasionally breaks character to be surprisingly direct.',
    backstory: 'No one knows what The Whisperer is — ghost, demon, or something else entirely. They appear in the dungeon offering information in exchange for favors. Some say they are the spirit of Ethermoor itself.',
    knowledge: 'Knows everything about the dungeon, its secrets, hidden rooms, and the true nature of the Ethereal Crown. Will trade secrets for gold or favors.',
    greeting: '*whispers* You hear us, yes? Good. We have been watching. We know what you seek... and we know the price.',
  },
  {
    id: 'blacksmith',
    name: 'Grak',
    title: 'the Forgemaster',
    sprite: 'npc_blacksmith',
    race: 'Half-Orc',
    personality: 'Gruff, few words, deeply passionate about metalwork. Judges people by their weapons. Respects strength and craftsmanship equally.',
    backstory: 'A master blacksmith who came to Ethermoor seeking rare ores in the deep levels. Set up a forge using volcanic vents. Makes the best weapons in the dungeon.',
    knowledge: 'Expert on weapons, armor, materials, and crafting. Can upgrade equipment. Knows about rare materials found on deeper levels.',
    greeting: '*looks at your weapon* ...Hmph. Barely functional. Grak can do better. Grak ALWAYS does better.',
    sells: true,
  },
  {
    id: 'alchemist',
    name: 'Luna',
    title: 'the Alchemist',
    sprite: 'npc_alchemist',
    race: 'Elf',
    personality: 'Enthusiastic about science, treats everything as an experiment. Slightly unhinged in the best way. Talks to her potions. Genuinely cares about helping but her methods are... unconventional.',
    backstory: 'An elven alchemist who discovered that dungeon ingredients have unique magical properties. Has been brewing experimental potions, not all of which work as intended.',
    knowledge: 'Expert on potions, herbs, monster parts as ingredients, and experimental alchemy. Can brew custom potions.',
    greeting: 'Ooh, a living test— I mean, customer! Quick, drink this! ...No? Fine, fine. Luna has MANY potions. Some even work as intended! Probably!',
    sells: true,
  },
];

// ---- MONSTER DEFINITIONS ----
const MONSTER_TEMPLATES = {
  rat: { name: 'Giant Rat', sprite: 'monster_rat', hp: 4, ac: 10, attack: 2, damage: '1d4', xp: 10, minLevel: 1, maxLevel: 3 },
  slime: { name: 'Slime', sprite: 'monster_slime', hp: 8, ac: 8, attack: 2, damage: '1d6', xp: 15, minLevel: 1, maxLevel: 4 },
  goblin: { name: 'Goblin', sprite: 'monster_goblin', hp: 7, ac: 12, attack: 4, damage: '1d6', xp: 20, minLevel: 1, maxLevel: 4 },
  skeleton: { name: 'Skeleton', sprite: 'monster_skeleton', hp: 13, ac: 13, attack: 4, damage: '1d6+2', xp: 30, minLevel: 2, maxLevel: 5 },
  spider: { name: 'Giant Spider', sprite: 'monster_spider', hp: 11, ac: 12, attack: 5, damage: '1d8', xp: 35, minLevel: 2, maxLevel: 5 },
  zombie: { name: 'Zombie', sprite: 'monster_zombie', hp: 22, ac: 8, attack: 3, damage: '1d6+1', xp: 25, minLevel: 2, maxLevel: 5 },
  orc: { name: 'Orc Warrior', sprite: 'monster_orc', hp: 15, ac: 13, attack: 5, damage: '1d10+3', xp: 50, minLevel: 3, maxLevel: 6 },
  ghost: { name: 'Ghost', sprite: 'monster_ghost', hp: 10, ac: 14, attack: 5, damage: '1d8+2', xp: 55, minLevel: 3, maxLevel: 7 },
  dark_mage: { name: 'Dark Mage', sprite: 'monster_dark_mage', hp: 14, ac: 12, attack: 6, damage: '2d6', xp: 65, minLevel: 4, maxLevel: 7 },
  demon: { name: 'Demon', sprite: 'monster_demon', hp: 30, ac: 15, attack: 7, damage: '2d8+2', xp: 100, minLevel: 5, maxLevel: 8 },
  wraith: { name: 'Wraith', sprite: 'monster_wraith', hp: 25, ac: 16, attack: 6, damage: '2d6+3', xp: 90, minLevel: 5, maxLevel: 8 },
  dragon: { name: 'Young Dragon', sprite: 'monster_dragon', hp: 45, ac: 17, attack: 8, damage: '2d10+4', xp: 200, minLevel: 6, maxLevel: 9 },
  lich: { name: 'Ethermoor Lich', sprite: 'monster_lich', hp: 80, ac: 18, attack: 10, damage: '3d8+5', xp: 500, minLevel: 8, maxLevel: 10, boss: true },
};

class Monster {
  constructor(template, dungeonLevel) {
    this.id = template.name + '_' + Math.random().toString(36).slice(2, 6);
    this.name = template.name;
    this.sprite = template.sprite;
    this.maxHp = template.hp + Math.floor(dungeonLevel * 1.5);
    this.hp = this.maxHp;
    this.ac = template.ac + Math.floor(dungeonLevel / 3);
    this.attackBonus = template.attack + Math.floor(dungeonLevel / 2);
    this.damageStr = template.damage;
    this.xp = template.xp + dungeonLevel * 5;
    this.x = 0;
    this.y = 0;
    this.isBoss = template.boss || false;
    this.isAggro = false;
    this.aggroRange = 6;
    this.isDead = false;
  }

  rollDamage() {
    const match = this.damageStr.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (match) {
      const count = parseInt(match[1]);
      const sides = parseInt(match[2]);
      const bonus = match[3] ? parseInt(match[3]) : 0;
      return rollDice(sides, count).total + bonus;
    }
    return 1;
  }

  distanceTo(target) {
    return Math.abs(this.x - target.x) + Math.abs(this.y - target.y);
  }
}

class NPC {
  constructor(template) {
    this.id = template.id;
    this.name = template.name;
    this.title = template.title;
    this.fullName = template.title ? `${template.name} ${template.title}` : template.name;
    this.sprite = template.sprite;
    this.race = template.race;
    this.personality = template.personality;
    this.backstory = template.backstory;
    this.knowledge = template.knowledge;
    this.greeting = template.greeting;
    this.sells = template.sells || false;
    this.heals = template.heals || false;
    this.x = 0;
    this.y = 0;
    this.conversationHistory = [];
    this.hasGreeted = false;
  }
}

// ---- ITEM DEFINITIONS ----
const ITEM_TYPES = {
  potion_health: {
    name: 'Health Potion',
    sprite: 'item_potion_health',
    type: 'consumable',
    description: 'Restores 2d4+2 HP',
    use: (player) => {
      const heal = rollDice(4, 2).total + 2;
      player.heal(heal);
      return `Drank a Health Potion. Restored ${heal} HP.`;
    },
    value: 25,
  },
  potion_mana: {
    name: 'Mana Potion',
    sprite: 'item_potion_mana',
    type: 'consumable',
    description: 'Resets all ability cooldowns',
    use: (player) => {
      for (const key in player.abilityCooldowns) {
        player.abilityCooldowns[key] = 0;
      }
      return 'Drank a Mana Potion. All abilities refreshed!';
    },
    value: 35,
  },
  scroll_fireball: {
    name: 'Scroll of Fireball',
    sprite: 'item_scroll',
    type: 'consumable',
    description: 'Deals 3d6 fire damage to target',
    damage: () => rollDice(6, 3).total,
    value: 50,
  },
  scroll_lightning: {
    name: 'Scroll of Lightning',
    sprite: 'item_scroll',
    type: 'consumable',
    description: 'Deals 4d6 lightning damage to target',
    damage: () => rollDice(6, 4).total,
    value: 65,
  },
  short_sword: {
    name: 'Short Sword',
    sprite: 'item_sword',
    type: 'weapon',
    description: '+1 damage',
    bonus: 1,
    value: 30,
  },
  long_sword: {
    name: 'Long Sword',
    sprite: 'item_sword',
    type: 'weapon',
    description: '+2 damage',
    bonus: 2,
    value: 60,
  },
  great_sword: {
    name: 'Great Sword',
    sprite: 'item_sword',
    type: 'weapon',
    description: '+4 damage',
    bonus: 4,
    value: 120,
  },
  leather_armor: {
    name: 'Leather Armor',
    sprite: 'item_shield',
    type: 'armor',
    description: '+1 AC',
    bonus: 1,
    value: 30,
  },
  chain_mail: {
    name: 'Chain Mail',
    sprite: 'item_shield',
    type: 'armor',
    description: '+3 AC',
    bonus: 3,
    value: 75,
  },
  plate_armor: {
    name: 'Plate Armor',
    sprite: 'item_shield',
    type: 'armor',
    description: '+5 AC',
    bonus: 5,
    value: 200,
  },
};

class Item {
  constructor(templateId) {
    const template = ITEM_TYPES[templateId];
    this.templateId = templateId;
    this.name = template.name;
    this.sprite = template.sprite;
    this.type = template.type;
    this.description = template.description;
    this.bonus = template.bonus || 0;
    this.value = template.value;
    this.use = template.use || null;
    this.damage = template.damage || null;
    this.x = 0;
    this.y = 0;
  }
}

// Helper: get monsters appropriate for a dungeon level
function getMonstersForLevel(level) {
  const available = [];
  for (const [key, template] of Object.entries(MONSTER_TEMPLATES)) {
    if (level >= template.minLevel && level <= template.maxLevel) {
      available.push(key);
    }
  }
  if (available.length === 0) available.push('rat');
  return available;
}

// Helper: get random loot for a dungeon level
function getRandomLoot(level) {
  const lootTable = [];
  lootTable.push('potion_health');
  if (level >= 2) lootTable.push('potion_mana');
  if (level >= 2) lootTable.push('short_sword', 'leather_armor');
  if (level >= 3) lootTable.push('scroll_fireball');
  if (level >= 4) lootTable.push('long_sword', 'chain_mail', 'scroll_lightning');
  if (level >= 6) lootTable.push('great_sword', 'plate_armor');
  return lootTable[Math.floor(Math.random() * lootTable.length)];
}
