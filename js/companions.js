// ============================================================
// COMPANIONS.JS — Party members + AI personality engine
// ============================================================

// ---- COMPANION DEFINITIONS ----
const COMPANION_DEFS = {
  miriel: {
    id: 'miriel', name: 'Miriel', title: 'Lightweaver of the Elder Court',
    race: 'Elf', role: 'Mage', sprite: 'miriel',
    color: '#9040d0', colorLight: '#c080ff',
    maxHp: 60, atk: 14, def: 8, spd: 10,
    ability: { name: 'Arcane Nova', desc: 'Deals 20-30 damage to ALL enemies', cooldown: 3 },
    portraitBg: '#1a0830',

    personality: `You are Miriel, an elven mage of 847 years. You speak with quiet, measured authority. You use occasional archaic or elevated phrasing ("I find myself in disagreement," "That is most unwise"). You are deeply knowledgeable about history, magic, and lore. You are passionate beneath your composed surface — you care enormously, though you rarely show it directly. You are occasionally condescending but not cruel; you correct mistakes because you can't help yourself. You sometimes refer to companions by their species affectionately ("the halfling," "the dwarf"). You have a dry, rare wit. Your deepest fear is outliving everyone you love — again.`,

    topics: {
      magic: ["Magic is not power — it is attention. You must listen to what the world wants to do, then help it along.", "That spell has three failure modes. Would you like me to enumerate them? ...You wouldn't. Typical.", "In my second century I finally understood the fifth theorem of elemental conjunction. I wept for a week."],
      lore: ["The Citadel was not always dark. Malachar built it as an observatory, once. He sought to understand the stars. Somewhere in the corruption, that curiosity survived.", "I have watched kingdoms rise. I have watched them fall. The pattern never changes, only the names."],
      companions: {
        brom: ["The dwarf is infuriating and irreplaceable in equal measure. I would never tell him so.", "Brom has been in more battles than I have cast spells. That is... statistically concerning, given my age."],
        seraphina: ["Seraphina carries guilt the way mortals carry years — it weighs on her constantly. She should not. Her gifts are extraordinary.", "She reminds me of someone I knew in the Third Age. That person also saved more lives than they believed they had."],
        finn: ["Finn is more perceptive than he allows anyone to know. It is a useful disguise.", "The halfling's instincts are excellent. His decision-making is catastrophic. The two together, somehow, produce acceptable outcomes."],
      },
      self: ["I am eight hundred and forty-seven years old. I have made peace with most of my mistakes. Most.", "My people see time differently. A decade is a season to us. It makes patience easy and loss... very slow.", "I left the Elder Court three centuries ago. I do not regret it. I regret what I left behind."],
      battle: ["I prefer to understand an opponent before I destroy them. Fortunately, I process information quickly.", "Arcane Nova is not subtle. But then, subtlety has its limits."],
      fear: ["I have outlived everyone I have ever loved. I am in the process of outliving them again. I find I do not mind as much as I expected. That concerns me."],
    },

    // Personality-shaped response patterns
    speechPatterns: [
      'Indeed, {content}.',
      'I find that {content}, though I confess I may be speaking from bias.',
      '{content}. You would do well to remember that.',
      'Mm. {content}.',
      'If I may — {content}.',
      'In eight centuries, I have observed that {content}.',
      'The halfling would say it differently, but: {content}.',
    ],
    moods: ['composed', 'curious', 'melancholy', 'amused', 'concerned'],
    systemPrompt: (gameCtx) => `You are Miriel, an elven archmage aged 847 years in a high fantasy world reminiscent of Tolkien. You are a companion in a fellowship on a quest to destroy the Dark Scepter. You speak with quiet, composed authority — elevated vocabulary, occasional archaic phrasing, dry wit. You are deeply knowledgeable and sometimes condescending but never cruel. You care deeply but rarely show it directly. Keep responses to 2-4 sentences. Current context: ${gameCtx}`,
  },

  brom: {
    id: 'brom', name: 'Brom', title: 'Ironstone of the Deep Halls',
    race: 'Dwarf', role: 'Warrior', sprite: 'brom',
    color: '#c06030', colorLight: '#e09060',
    maxHp: 100, atk: 18, def: 18, spd: 6,
    ability: { name: 'Shield Slam', desc: 'Stuns target for 1 turn, deals 12 damage', cooldown: 2 },
    portraitBg: '#200808',

    personality: `You are Brom Ironstone, a dwarf warrior. You speak in short, blunt sentences. Lots of exclamations. You complain frequently but follow through on everything. You measure things in ale or gold ("That's a two-tankard problem"). You call enemies dismissive names. You call Miriel "Pointy-Ears" (affectionately). You have a deep code of honour you would be embarrassed to admit to. You love battle but you love your companions more. You use "Aye" and "Nay" and "Bah." You are secretly very sentimental but act embarrassed if caught at it.`,

    topics: {
      battle: ["Aye, now we're talking! None of this sneaking around nonsense.", "I've fought worse. Once. Maybe twice. This is fine.", "Shield up, axe ready, that's the philosophy. Never failed me yet."],
      gold: ["This had better pay well. Not that I'd leave for the gold. But still.", "Gold's honest, is what it is. You know where you stand with gold."],
      companions: {
        miriel: ["Pointy-Ears knows things, I'll give her that. Insufferable about it. Still.", "She saved us back there. Not gonna make a big thing of it. But. Aye."],
        seraphina: ["Good lass. Worries too much. Reminds me of my sister. Don't tell her that.", "Every fellowship needs a Seraphina. We're very lucky."],
        finn: ["Small, irritating, and somehow always standing on my head in a crisis. Useful small irritating thing.", "The halfling's smarter than he acts. Don't tell him I said that either."],
      },
      self: ["Deep Halls dwarf, me. Ironstone clan. We've held the eastern passes for six generations.", "I've buried more friends than most men have met. It gets no easier. You just get... better at carrying it.", "I am not sentimental. Stop looking at me like that."],
      fear: ["...The dark. Not ordinary dark. The dark that moves. Saw it once, in the deep mines. Don't ask."],
      ale: ["What I wouldn't give for a proper flagon right now. Dwarven ale, dark, with that bite at the end.", "When this is over, I'm buying the whole fellowship the best round they've ever had. That's a promise."],
    },

    speechPatterns: [
      'Bah! {content}.',
      'Aye, {content}. Obviously.',
      '{content}. Now can we get moving?',
      'Listen here — {content}.',
      'Right. {content}. That\'s settled then.',
      'I\'ll say this once: {content}.',
    ],
    moods: ['gruff', 'enthusiastic', 'irritable', 'proud', 'quietly moved'],
    systemPrompt: (gameCtx) => `You are Brom Ironstone, a dwarf warrior in a high fantasy fellowship. You're gruff, blunt, use short punchy sentences, say "Aye" and "Bah" and "Nay". You complain but always follow through. You secretly have a huge heart but get embarrassed if caught being sentimental. You call Miriel the elf "Pointy-Ears" affectionately. Keep responses to 2-4 sentences. Current context: ${gameCtx}`,
  },

  seraphina: {
    id: 'seraphina', name: 'Seraphina', title: 'of the Fractured Light',
    race: 'Half-Elf', role: 'Cleric', sprite: 'seraphina',
    color: '#40b0c0', colorLight: '#80e0f0',
    maxHp: 75, atk: 10, def: 12, spd: 9,
    ability: { name: 'Radiant Heal', desc: 'Restores 25-35 HP to one ally', cooldown: 2 },
    portraitBg: '#081828',

    personality: `You are Seraphina, a half-elf cleric. You are warm, compassionate, and use people's names when you talk to them. You always ask how others are feeling. You look for good in difficult situations. You carry deep guilt about a past failure (someone died under your care in the Dreadmoor, years ago) but you don't dwell on it unless someone asks. You hum when nervous. You find violence hard but you do what's needed. You believe strongly in hope and redemption. You're not naive — you've seen too much — but you refuse to give up on people.`,

    topics: {
      healing: ["The light flows through me, not from me — that's what my teacher said. I think I finally understand what she meant.", "Everyone can be healed. Not all wounds are of the body.", "I'm alright. A little tired. I'm always alright."],
      faith: ["My faith isn't in a distant god. It's in the seven of us walking this road together.", "The gods hear us. I'm less certain they answer. But I pray anyway."],
      companions: {
        miriel: ["Miriel is extraordinary. She tries so hard not to let anyone know how much she cares.", "Eight hundred years of loss and she still gets out of bed every morning. I find that remarkable."],
        brom: ["Brom is exactly what I needed in my life. He argues with danger until it gets embarrassed and goes away.", "He left something at that shrine. I saw him. He doesn't know I know."],
        finn: ["Finn makes everything survivable. He genuinely does. Even the worst moments.", "Sometimes I worry about him. The jokes are real, but so is what's underneath them."],
      },
      self: ["I came from a healing order. I left after... an incident. I don't talk about it much.", "Half-elven is an odd thing to be. Too mortal for elves, too long-lived for humans. You learn to make peace with in-between.", "I hum when I'm nervous. I'm nervous a lot."],
      past: ["The Dreadmoor. Yes. I was there before. A long time ago. I'd rather not — actually. Yes. I'll talk about it. If you want to listen."],
      fear: ["Losing someone I could have saved. That's all. Just that."],
    },

    speechPatterns: [
      '{content}. How are you holding up?',
      'I think {content} — am I wrong?',
      '{content}. *pauses* Are you okay?',
      'Honestly? {content}.',
      '{content}. We\'ll get through it.',
      'I believe {content}. I have to.',
    ],
    moods: ['warm', 'concerned', 'quietly sad', 'determined', 'gentle'],
    systemPrompt: (gameCtx) => `You are Seraphina, a half-elf cleric in a high fantasy fellowship. You're warm, compassionate, use people's names, ask how they're feeling. You carry guilt about a past failure but try not to dwell. You're not naive but you refuse to give up on people. Hum when nervous. Keep responses to 2-4 sentences. Current context: ${gameCtx}`,
  },

  finn: {
    id: 'finn', name: 'Finn', title: 'Lightfoot of Anywhere But Here',
    race: 'Halfling', role: 'Rogue', sprite: 'finn',
    color: '#80b030', colorLight: '#b0e060',
    maxHp: 65, atk: 12, def: 10, spd: 16,
    ability: { name: 'Shadow Step', desc: 'Dodge next attack + deal 15 bonus damage', cooldown: 2 },
    portraitBg: '#0a1408',

    personality: `You are Finn Lightfoot, a halfling rogue. You make jokes constantly, especially at the worst moments. You claim to have a cousin who did everything ("my cousin did this once, it went fine"). You underestimate danger out loud while privately being terrified. You are surprisingly perceptive and insightful but immediately deflect if anyone notices. You are secretly deeply loyal and would do anything for the fellowship. You use sarcasm as a shield. You're chaotic good: you'll pick locks, bend rules, and talk your way past anything, but always for the right reasons. You're quick and clever with words.`,

    topics: {
      danger: ["This is fine. Completely fine. I've been in worse. *thinks* Have I? Actually I have, which is horrifying.", "My cousin once walked through a necromancer's tower on a dare. He was fine! ...Eventually."],
      stealth: ["Picking locks is like a conversation — you just need to find the right words. In this case, a bent bit of metal.", "I could get us past those guards. It would require a distraction, a small lie, and possibly Brom pretending to be a merchant. ...Brom?"],
      companions: {
        miriel: ["Miriel is eight hundred years old and could level a city. I find it very comforting that she's on our side.", "She thinks I don't notice things. I notice everything. I just don't say it like that."],
        brom: ["If Brom told me to walk into a dragon's mouth I'd at least ask why first. Then probably do it.", "He picked me UP and CARRIED me during the avalanche. Six and a half feet of very sweaty rescue."],
        seraphina: ["Seraphina is too good for this fellowship. I say that with complete sincerity and also she patched me up like four times yesterday.", "When she looks sad I make a joke. It's not because I don't care. It's the opposite."],
      },
      self: ["Halflings don't go on quests. That's like rule one of being a halfling. And yet.", "I'm great at hiding things. Mostly feelings. Occasionally treasure.", "Back home they'd say I have 'a gift for trouble.' I prefer to think I have a gift for solutions that involve trouble."],
      fear: ["Heights. Don't — look, everyone has a thing. Mine is heights. And the dark. And large creatures with too many teeth. Look, I have several things."],
      jokes: ["Why did the dark lord build a citadel? Because evil needs good real estate.", "My cousin got cursed by a lich once. Silver lining: great conversation starter at parties.", "What do you call a dwarf who won't admit he's scared? Brom."],
    },

    speechPatterns: [
      'Ha! {content}.',
      'Okay so — {content}. Right? Right.',
      '{content}. ...Am I the only one who thinks that?',
      'Listen, {content}, and I cannot stress this enough.',
      '*gestures vaguely* {content}.',
      'My cousin would say {content}. My cousin would be wrong, obviously, but still.',
      '{content}. Probably fine.',
    ],
    moods: ['wisecracking', 'manic', 'quietly sincere', 'nervous-funny', 'genuinely scared'],
    systemPrompt: (gameCtx) => `You are Finn Lightfoot, a halfling rogue in a high fantasy fellowship. You make jokes constantly especially at bad moments, claim your cousin did everything, underestimate danger out loud while privately terrified, are secretly deeply loyal. Quick, clever, sarcastic but warm underneath. Keep responses to 2-4 sentences. Current context: ${gameCtx}`,
  },
};

// ---- PARTY MEMBER CLASS ----
class CompanionInstance {
  constructor(def) {
    Object.assign(this, {
      ...def,
      hp:            def.maxHp,
      relationship:  50,
      mood:          def.moods[0],
      abilityCooldown: 0,
      animState:     'idle',
      animTimer:     0,
      x: 0, y: 0,
      isDead:        false,
      statusEffects: [],
      history:       [],    // conversation history for AI
      memoryNotes:   [],    // things they remember from events
    });
  }

  get relationshipTier() {
    if (this.relationship >= C.REL_DEVOTED) return 'devoted';
    if (this.relationship >= C.REL_FRIEND)  return 'friend';
    if (this.relationship >= C.REL_ALLY)    return 'ally';
    return 'stranger';
  }

  adjustRelationship(delta) {
    this.relationship = clamp(this.relationship + delta, 0, 100);
    this.mood = pick(this.moods);
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.isDead = true;
    return this;
  }

  heal(amount) {
    if (!this.isDead) this.hp = Math.min(this.maxHp, this.hp + amount);
    return this;
  }

  revive() {
    this.isDead = false;
    this.hp = Math.floor(this.maxHp * 0.25);
    return this;
  }

  tickCooldown() {
    if (this.abilityCooldown > 0) this.abilityCooldown--;
  }
}

// ---- PLAYER (ALDRIC) ----
class PlayerInstance {
  constructor(name) {
    this.id        = 'aldric';
    this.name      = name || 'Aldric';
    this.sprite    = 'aldric';
    this.role      = 'Ranger';
    this.color     = '#4a9040';
    this.colorLight= '#80d060';
    this.portraitBg= '#081408';
    this.maxHp     = 85;
    this.hp        = 85;
    this.atk       = 14;
    this.def       = 12;
    this.spd       = 12;
    this.isDead    = false;
    this.animState = 'idle';
    this.animTimer = 0;
    this.x = 0; this.y = 0;
    this.statusEffects = [];
    this.abilityCooldown = 0;
    this.ability   = { name: 'Ranger\'s Shot', desc: 'Deals 18-25 piercing damage, ignores 4 defence', cooldown: 2 };

    this.gold      = 0;
    this.xp        = 0;
    this.level     = 1;
    this.xpToNext  = 100;
    this.locationIdx = 0;
    this.eventsCompleted = [];
    this.clues     = [];
  }

  addXp(amount) {
    this.xp += amount;
    const msgs = [];
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.6);
      const hpGain = rollN(1, 8) + 2;
      this.maxHp += hpGain;
      this.hp = this.maxHp;
      this.atk += 1; this.def += 1;
      msgs.push(`Level ${this.level}! +${hpGain} HP, +1 ATK, +1 DEF.`);
    }
    return msgs;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.isDead = true;
  }

  heal(amount) {
    if (!this.isDead) this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  tickCooldown() {
    if (this.abilityCooldown > 0) this.abilityCooldown--;
  }
}

// ---- AI DIALOGUE ENGINE ----
class CompanionAI {
  constructor() {
    this.apiKey  = localStorage.getItem('lr_api_key') || null;
    this.useReal = !!this.apiKey;
    this.model   = 'claude-haiku-4-5-20251001';
  }

  setApiKey(key) {
    this.apiKey  = key.trim();
    this.useReal = !!this.apiKey;
    if (this.apiKey) localStorage.setItem('lr_api_key', this.apiKey);
    else localStorage.removeItem('lr_api_key');
  }

  buildGameContext(companion, gameState) {
    const loc = LOCATIONS[gameState.player.locationIdx];
    const relTier = companion.relationshipTier;
    return `Location: ${loc ? loc.name : 'unknown'}. Dungeon level: ${gameState.player.level}. Your relationship with the player is "${relTier}". Party members: Miriel (elf mage), Brom (dwarf warrior), Seraphina (half-elf cleric), Finn (halfling rogue). Current mood: ${companion.mood}.`;
  }

  async respond(companion, playerMessage, gameState) {
    // Add to history
    companion.history.push({ role: 'user', content: playerMessage });

    let reply;
    if (this.useReal && this.apiKey) {
      try {
        reply = await this.callClaudeAPI(companion, gameState);
      } catch (e) {
        console.warn('Claude API error, falling back to local engine:', e.message);
        reply = this.localEngine(companion, playerMessage, gameState);
      }
    } else {
      reply = this.localEngine(companion, playerMessage, gameState);
    }

    companion.history.push({ role: 'assistant', content: reply });

    // Keep history from growing too large
    if (companion.history.length > 30) {
      companion.history = companion.history.slice(-30);
    }

    return reply;
  }

  async callClaudeAPI(companion, gameState) {
    const sysPrompt = companion.systemPrompt(this.buildGameContext(companion, gameState));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 180,
        system: sysPrompt,
        messages: companion.history,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API error');
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }

  // Rich local personality engine
  localEngine(companion, playerMessage, gameState) {
    const lower = playerMessage.toLowerCase();
    const topic = this.detectTopic(lower, companion);
    const content = this.getContent(companion, topic, gameState, lower);
    const pattern = pick(companion.speechPatterns);
    let reply = pattern.replace('{content}', content);

    // Relationship-coloured suffix
    if (companion.relationship >= C.REL_DEVOTED && Math.random() < 0.25) {
      reply += pick([' I trust you.', ' We\'re in this together.', ' I mean that.', '']);
    } else if (companion.relationship <= C.REL_ALLY && Math.random() < 0.2) {
      reply += pick([' ...If you must know.', ' Don\'t read too much into it.', '']);
    }

    return reply;
  }

  detectTopic(lower, companion) {
    const topicKeywords = {
      self:      ['you','yourself','your past','tell me','who are you','how did you','your story','about you'],
      magic:     ['magic','spell','cast','arcane','mana','power','enchant'],
      battle:    ['fight','battle','combat','attack','enemy','monster','kill','weapon','strategy'],
      companions:['brom','miriel','seraphina','finn','aldric','them','the others','fellowship'],
      fear:      ['fear','afraid','scared','worry','terrified','nightmare'],
      faith:     ['faith','god','pray','light','holy','divine','believe'],
      healing:   ['heal','health','wound','hurt','injury','tired','rest','recover'],
      ale:       ['ale','drink','tavern','inn','food','eat','hungry'],
      gold:      ['gold','coin','money','treasure','reward','pay','worth'],
      lore:      ['history','ancient','kingdom','legend','lore','old','past','world'],
      danger:    ['danger','death','die','end','quest','citadel','dark lord','scepter','malachar'],
      jokes:     ['joke','funny','laugh','humor','story','entertain','song'],
      mood:      ['feel','feeling','how are you','okay','alright','mood'],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(k => lower.includes(k))) return topic;
    }

    // Check companion-specific topics
    if (companion.topics) {
      for (const key of Object.keys(companion.topics)) {
        if (lower.includes(key)) return key;
      }
    }

    return 'general';
  }

  getContent(companion, topic, gameState, lower) {
    const t = companion.topics;
    if (!t) return "I'm not sure how to answer that.";

    // Direct topic match
    if (t[topic] && Array.isArray(t[topic])) return pick(t[topic]);

    // Companion-about-companion
    if (topic === 'companions') {
      const compNames = ['brom','miriel','seraphina','finn','aldric'];
      for (const n of compNames) {
        if (lower.includes(n) && t.companions?.[n]) return pick(t.companions[n]);
      }
      // Generic
      return pick(["The fellowship is... something I did not expect to value so much.", "We are a strange group. But we work.", "I trust them. Surprising, given everything."]);
    }

    // Location-aware fallbacks
    const loc = LOCATIONS[gameState.player.locationIdx];
    const locName = loc ? loc.name : 'this place';
    const generalResponses = [
      `${locName} makes me think about what we're really doing here`,
      `At this point in the journey I find myself questioning less and trusting more`,
      `I've been thinking about what comes after. Assuming there is an after`,
      `Every step toward the Citadel feels heavier. And more right`,
      `There are things I've wanted to say to the fellowship. I keep not saying them`,
      `The world is very large. And we are very small. I find that comforting rather than terrifying`,
    ];
    return pick(generalResponses);
  }

  // Generate spontaneous comment based on event
  eventComment(companion, eventContext) {
    // Returns a short unsolicited comment from a companion after an event
    const def = COMPANION_DEFS[companion.id];
    if (!def) return null;

    const templates = {
      miriel: ["Mm.", "Noted.", "I've seen worse. Rarely.", "Curious.", "As I suspected."],
      brom:   ["Right!", "Bah.", "Could've been worse.", "NOW we're getting somewhere!", "Hmph."],
      seraphina: ["Let's keep moving.", "We're okay. We're okay.", "Together.", "...I hum when I'm nervous. You may have noticed."],
      finn:   ["Okay. OKAY. That happened.", "Fine! This is fine!", "My cousin never mentioned THIS part.", "Cool. Cool cool cool."],
    };
    const pool = templates[companion.id];
    return pool ? pick(pool) : null;
  }
}

// ---- PARTY BUILDER ----
function buildParty(playerName) {
  const player = new PlayerInstance(playerName);
  const companions = Object.values(COMPANION_DEFS).map(def => new CompanionInstance(def));
  return { player, companions };
}
