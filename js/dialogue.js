// ============================================================
// DIALOGUE.JS - AI-Powered NPC Dialogue System
// Uses a local Markov-chain-inspired personality engine
// No external API needed - all personality runs client-side
// ============================================================

class DialogueEngine {
  constructor() {
    // Vocabulary pools organized by mood/topic
    this.vocabulary = {
      greetings: ['Ah', 'Well well', 'Hmm', 'Ho there', 'Greetings', 'Welcome', 'Hail', 'By the gods'],
      farewells: ['Safe travels', 'Watch your back', 'May the gods watch over you', 'Until next time', "Don't die out there", 'Go with caution'],
      affirmative: ['Indeed', 'Certainly', 'Of course', 'Absolutely', 'Without question', 'Naturally', 'Aye'],
      negative: ["I'm afraid not", 'Alas, no', 'That would be unwise', 'I cannot help with that', 'That is beyond my knowledge'],
      filler: ['you see', 'as it happens', 'truth be told', 'between you and me', 'mark my words', 'if you ask me'],
      danger: ['deadly', 'treacherous', 'cursed', 'haunted', 'twisted', 'corrupted', 'forsaken'],
      positive: ['magnificent', 'remarkable', 'splendid', 'extraordinary', 'wonderful', 'fine', 'excellent'],
      dungeon_lore: [
        'They say the Ethereal Crown lies on the deepest level, guarded by an ancient lich.',
        'The dungeon was once the great citadel of Ethermoor, before the Cataclysm pulled it underground.',
        'Strange energies flow through these halls. The walls themselves seem alive sometimes.',
        'Many have entered these depths. Few return. Those who do are... changed.',
        'The deeper you go, the stronger the creatures become. But so does the loot.',
        'I have heard whispers of secret rooms, hidden behind walls that shimmer.',
        "There are creatures here older than the dungeon itself. They don't like visitors.",
        'The lich was once the archmage of Ethermoor. Power corrupted him utterly.',
      ],
      combat_tips: [
        'Undead are slow but relentless. Keep your distance if you can.',
        'Goblins are cowards alone but dangerous in groups.',
        'Slimes dissolve metal. Be careful with your equipment around them.',
        'Ghosts can phase through walls. There is nowhere to hide from them.',
        'Orcs respect only strength. Show weakness and they will exploit it.',
        'Spiders are ambush predators. Watch the ceilings.',
        'Dark mages will try to weaken you before closing in for the kill.',
        'Dragons are nearly invincible from the front. Flank them if you can.',
      ],
      merchant_lines: [
        'have the finest wares this side of the abyss',
        'guarantee quality or your gold back — terms and conditions may apply',
        'found this on a, uh, deceased customer. Barely used!',
        'offer special price, just for you, best friend',
        'warn you — buy now or someone else will',
        'accept gold, gems, and the occasional favor',
      ],
      healer_lines: [
        'The light still reaches even this deep.',
        'Your wounds tell a story of bravery. Or foolishness. Often the same thing.',
        'Rest here a moment. The darkness can wait.',
        'I have tended to hundreds of adventurers. You are among the more... intact.',
        'The healing arts require concentration. Please stop bleeding everywhere.',
      ],
      mysterious_lines: [
        'The walls have ears. And teeth. And occasionally tentacles.',
        'What you seek and what you find are rarely the same thing.',
        'Every step deeper is a step further from who you were.',
        'The crown calls to those with ambition. It consumed the last one who answered.',
        'We see many paths before you. Most end in darkness.',
        'There are things in these depths that have no name. Be grateful for that.',
      ],
    };

    // Response templates per NPC personality type
    this.responsePatterns = {
      nervous: [
        '{greeting}! Oh, you startled {name}! {filler}, {name} {content}. Please don\'t hurt {name}!',
        'Oh oh oh! {content}! {name} knows these things, yes yes. Very {adjective}!',
        '{name} has heard that {lore}. Scary scary! But {name} is brave! ...Mostly.',
        'Yes yes! {content}. {name} deals fairly! ...{name} has no choice, you have a {weapon}.',
      ],
      academic: [
        '{greeting}. {filler}, {content}. Fascinating, wouldn\'t you agree?',
        'From a theoretical perspective, {content}. I have extensive notes on this subject.',
        'My research indicates that {lore}. The implications are quite {adjective}.',
        'Ah, an interesting query! {content}. I wrote a treatise on this — three volumes, illustrated.',
      ],
      compassionate: [
        '{greeting}, weary traveler. {content}. You carry a heavy burden.',
        'I sense {content}. Let me help ease your suffering.',
        '{lore}. But take heart — there is always hope, even in the deepest dark.',
        'Come, rest a moment. {content}. The path ahead will demand much of you.',
      ],
      stoic: [
        '{content}. That is all I know on the matter.',
        'Hmph. {content}. Make of that what you will.',
        '{greeting}. {content}. I have said my piece.',
        'In my experience, {content}. But you will learn that yourself, in time.',
      ],
      cheerful: [
        '♪ {greeting}! ♪ {content}! Isn\'t that just {adjective}?',
        'Ooh ooh! {filler}, {content}! I could write a song about it! ...I already did!',
        '♪ {lore_rhyme} ♪ Oh right, the actual answer — {content}!',
        'Ha! {content}! That reminds me of the time I — well, that\'s another story!',
      ],
      cryptic: [
        '*whispers* {content}. But you did not hear this from us.',
        'The shadows speak of {content}. Listen carefully...',
        '{lore}. *the air grows cold* ...Remember what we have told you.',
        'We know many things. {content}. The question is... what will you do with this knowledge?',
      ],
      gruff: [
        'Hmph. {content}. Now stop wasting my time.',
        '{content}. Good steel speaks louder than words.',
        '*examines your gear* {content}. You need better equipment.',
        '{greeting}. {content}. That is Grak\'s professional opinion.',
      ],
      enthusiastic: [
        'Oh! OH! {content}! This is SO exciting!',
        '*bubbling sounds* {filler}, {content}! Science is AMAZING!',
        'I tested this on a rat and {content}! ...The rat was fine. Eventually.',
        '{greeting}! {content}! Want to see what happens when I mix these? ...Maybe stand back.',
      ],
    };

    // Topic detection keywords
    this.topicKeywords = {
      combat: ['fight', 'monster', 'attack', 'weapon', 'armor', 'battle', 'kill', 'enemy', 'dragon', 'lich', 'strong', 'damage', 'hit', 'war', 'sword', 'die', 'death'],
      lore: ['dungeon', 'ethermoor', 'history', 'story', 'crown', 'lich', 'cataclysm', 'past', 'ancient', 'secret', 'mystery', 'legend', 'tell me', 'what is', 'who'],
      trade: ['buy', 'sell', 'shop', 'price', 'gold', 'potion', 'item', 'wares', 'trade', 'cost', 'how much', 'purchase', 'stock', 'deal', 'offer'],
      healing: ['heal', 'hurt', 'wound', 'health', 'rest', 'recovery', 'potion', 'cure', 'aid', 'help', 'pain', 'injured'],
      self: ['who are you', 'your name', 'about you', 'yourself', 'tell me about you', 'what are you', 'your story', 'how did you'],
      deeper: ['deeper', 'next level', 'stairs', 'below', 'descend', 'lower', 'further', 'down'],
      greeting: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'sup', 'good day', 'well met'],
      thanks: ['thank', 'thanks', 'grateful', 'appreciate', 'cheers'],
      farewell: ['bye', 'goodbye', 'farewell', 'leaving', 'go now', 'gotta go', 'see you'],
      joke: ['joke', 'funny', 'laugh', 'humor', 'jest', 'sing', 'song', 'entertain'],
    };

    // NPC personality to response pattern mapping
    this.personalityMap = {
      'Grizzlewick': 'nervous',
      'Thornwick': 'academic',
      'Sister Miravel': 'compassionate',
      'Korrath': 'stoic',
      'Pip': 'cheerful',
      'The Whisperer': 'cryptic',
      'Grak': 'gruff',
      'Luna': 'enthusiastic',
    };
  }

  detectTopic(input) {
    const lower = input.toLowerCase();
    let bestTopic = 'general';
    let bestScore = 0;

    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lower.includes(keyword)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    }
    return bestTopic;
  }

  generateContent(npc, topic, gameState) {
    const player = gameState.player;
    const level = gameState.dungeonLevel;

    switch (topic) {
      case 'combat': {
        const tips = this.vocabulary.combat_tips;
        const tip = tips[Math.floor(Math.random() * tips.length)];
        const extras = [
          `On level ${level}, I'd watch out for ${this.getMonsterWarning(level)}`,
          `Your ${player.classData.name.toLowerCase()} skills should serve you well against most foes here`,
          `With AC ${player.getEffectiveAC()}, you can handle the creatures on this level — probably`,
          tip,
        ];
        return extras[Math.floor(Math.random() * extras.length)];
      }

      case 'lore': {
        const lore = this.vocabulary.dungeon_lore;
        return lore[Math.floor(Math.random() * lore.length)];
      }

      case 'trade': {
        if (npc.sells) {
          const lines = this.vocabulary.merchant_lines;
          return `${npc.name} ${lines[Math.floor(Math.random() * lines.length)]}`;
        }
        return `I don't sell anything, but ${this.getTraderReference(npc)} might have what you need`;
      }

      case 'healing': {
        if (npc.heals) {
          if (player.hp < player.maxHp) {
            return `you look wounded — ${player.hp}/${player.maxHp} health. Let me channel the light to mend your injuries`;
          }
          return 'you seem healthy enough for now. Come back when the dungeon has had its way with you';
        }
        const healLines = this.vocabulary.healer_lines;
        return player.hp < player.maxHp
          ? `you should find Sister Miravel for healing. You look like you need it — ${player.hp}/${player.maxHp} health`
          : 'you seem to be in good shape. For now';
      }

      case 'self': {
        return npc.backstory;
      }

      case 'deeper': {
        const warnings = [
          `level ${level + 1} will have ${this.getMonsterWarning(level + 1)}. Prepare yourself`,
          `the deeper you go, the richer the rewards — and the more ${this.pick(this.vocabulary.danger)} the threats`,
          `at level ${level + 1}, you will need at least AC ${12 + level} to survive comfortably`,
          `I've heard ${this.pick(this.vocabulary.danger)} things lurk on level ${level + 1}`,
        ];
        return this.pick(warnings);
      }

      case 'greeting':
        return npc.greeting;

      case 'thanks': {
        const responses = [
          'you are most welcome, adventurer',
          'think nothing of it',
          'just doing what I can in these dark times',
          "stay alive — that's thanks enough",
          'may your gratitude translate to more gold next time',
        ];
        return this.pick(responses);
      }

      case 'farewell':
        return this.pick(this.vocabulary.farewells);

      case 'joke': {
        const jokes = [
          "Why did the skeleton go to the party alone? Because he had NO BODY to go with! ...I'll see myself out",
          "What's a dungeon's favorite music? Heavy metal! ...Get it? Because of the chains?",
          "I asked a ghost if he was real. He said 'I'm dead serious'",
          "What do you call a lazy goblin? A goblin't",
          "Why don't skeletons fight each other? They don't have the guts",
          "A bard, a rogue, and a wizard walk into a bar. The fighter ducks",
        ];
        return this.pick(jokes);
      }

      default: {
        // General conversation — mix of knowledge and personality
        const options = [
          ...this.vocabulary.dungeon_lore,
          ...this.vocabulary.combat_tips,
          npc.knowledge,
          `You're a level ${player.level} ${player.classData.name} with ${player.hp}/${player.maxHp} health on dungeon level ${level}. Not bad`,
          `${player.kills} creatures have fallen to your hand. The dungeon takes notice`,
        ];
        return this.pick(options);
      }
    }
  }

  generateResponse(npc, playerInput, gameState) {
    const topic = this.detectTopic(playerInput);
    const content = this.generateContent(npc, topic, gameState);
    const patternType = this.personalityMap[npc.name] || 'stoic';
    const patterns = this.responsePatterns[patternType];
    let pattern = this.pick(patterns);

    // Fill in template variables
    const response = pattern
      .replace(/\{greeting\}/g, this.pick(this.vocabulary.greetings))
      .replace(/\{farewell\}/g, this.pick(this.vocabulary.farewells))
      .replace(/\{filler\}/g, this.pick(this.vocabulary.filler))
      .replace(/\{content\}/g, content)
      .replace(/\{name\}/g, npc.name)
      .replace(/\{adjective\}/g, Math.random() < 0.5 ? this.pick(this.vocabulary.positive) : this.pick(this.vocabulary.danger))
      .replace(/\{lore\}/g, this.pick(this.vocabulary.dungeon_lore))
      .replace(/\{lore_rhyme\}/g, this.generateRhyme())
      .replace(/\{weapon\}/g, gameState.player.weapon ? gameState.player.weapon.name : 'sharp-looking weapon');

    // Store conversation history
    npc.conversationHistory.push(
      { role: 'player', text: playerInput },
      { role: 'npc', text: response }
    );

    // Keep last 10 exchanges
    if (npc.conversationHistory.length > 20) {
      npc.conversationHistory = npc.conversationHistory.slice(-20);
    }

    return response;
  }

  getGreeting(npc, gameState) {
    if (npc.hasGreeted) {
      const returnGreetings = [
        `${npc.name}: Ah, you're back! ${this.pick(this.vocabulary.filler)}, what can I do for you?`,
        `${npc.name}: We meet again, adventurer. What do you need?`,
        `${npc.name}: Back so soon? ${this.pick(this.vocabulary.filler)}, I suppose the dungeon hasn't killed you yet.`,
      ];
      return this.pick(returnGreetings);
    }
    npc.hasGreeted = true;
    return `${npc.fullName}: ${npc.greeting}`;
  }

  generateRhyme() {
    const rhymes = [
      "Deep in the dark where the shadows play, heroes come but don't always stay",
      'Gold and glory wait below, but mind the monsters row by row',
      'The lich king sits upon his throne, of adventurers\' skulls and heroes\' bone',
      "A sword, a shield, a prayer, a spell — you'll need them all in Ethermoor's hell",
      'The crown! The crown! It gleams so bright! But those who wear it lose their sight',
    ];
    return this.pick(rhymes);
  }

  getMonsterWarning(level) {
    const monsters = getMonstersForLevel(level);
    if (monsters.length === 0) return 'unknown horrors';
    const monsterKey = this.pick(monsters);
    return MONSTER_TEMPLATES[monsterKey].name + 's';
  }

  getTraderReference(currentNpc) {
    const traders = NPC_TEMPLATES.filter(n => n.sells && n.name !== currentNpc.name);
    if (traders.length === 0) return 'a merchant';
    return this.pick(traders).name;
  }

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
