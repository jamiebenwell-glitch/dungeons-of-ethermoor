// ============================================================
// GAME.JS — Master state machine
// ============================================================

const GS = {
  TITLE:        'title',
  INTRO:        'intro',
  NAME_INPUT:   'name_input',
  API_KEY:      'api_key',
  JOURNEY:      'journey',
  EVENT:        'event',
  COMBAT:       'combat',
  COMBAT_END:   'combat_end',
  CAMP:         'camp',
  CHAT:         'chat',
  GAME_OVER:    'game_over',
  VICTORY:      'victory',
};

// How long intro lines display before advancing (ms)
const INTRO_LINES = [
  { text: 'In the age before the last darkness fell...', delay: 2800 },
  { text: 'A scepter of shadow was forged from stolen starlight.', delay: 2800 },
  { text: 'Whoever wields it commands death itself.', delay: 2400 },
  { text: 'Malachar the Undying took it.', delay: 2200 },
  { text: 'The world had one hope:', delay: 2000 },
  { text: 'A fellowship. Five unlikely souls.', delay: 2200 },
  { text: 'And the road that lay between them', delay: 2000 },
  { text: 'and the end of everything.', delay: 2800 },
];

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ps     = new ParticleSystem();
    this.combat = new CombatEngine();
    this.ai     = new CompanionAI();

    this.state  = GS.TITLE;
    this.timer  = 0;       // global frame counter
    this.sceneTimer = 0;   // per-scene timer

    // Title
    this.titleSel = 0;

    // Intro
    this.introIdx      = 0;
    this.introProgress = 0;
    this.introAlpha    = 0;

    // Name input
    this.nameInput     = '';
    this.nameError     = '';

    // API key
    this.apiKeyInput   = '';
    this.apiKeyError   = '';
    this.apiKeyStatus  = '';

    // Journey
    this.player     = null;
    this.companions = [];
    this.narrativeLog = [];
    this.eventQueue   = [];
    this.currentEvent = null;
    this.currentChoice= 0;
    this.reactionIdx  = 0;
    this.reactionLines= [];
    this.reactionTimer= 0;
    this.journeyActions = ['Continue Journey', 'Make Camp', 'Chat with Companions', 'Examine Location'];
    this.journeyActionSel = 0;
    this.justArrivedAt = null;

    // Chat
    this.chatCompanion = null;
    this.chatMessages  = [];
    this.chatInput     = '';
    this.chatThinking  = false;
    this.chatScroll    = 0;
    this.companionSel  = 0;

    // Camp
    this.campSel       = 0;
    this.campLog       = [];

    // Combat result display
    this.combatResultTimer = 0;
    this.combatResultMsg   = [];
    this.pendingFlee       = false;
  }

  // ---- RESIZE ----
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }

  // ---- INIT ----
  init() {
    this.state = GS.TITLE;
    this.sceneTimer = 0;
  }

  // ---- LOG ----
  addNarrative(text, color = C.P.WHITE) {
    this.narrativeLog.push({ text, color, age: 0 });
    if (this.narrativeLog.length > 80) this.narrativeLog.shift();
  }

  addCampLog(text, color = C.P.WHITE) {
    this.campLog.push({ text, color });
    if (this.campLog.length > 40) this.campLog.shift();
  }

  // ---- KEYBOARD ----
  handleKey(key) {
    switch (this.state) {
      case GS.TITLE:        this.keyTitle(key);     break;
      case GS.INTRO:        this.keyIntro(key);     break;
      case GS.NAME_INPUT:   this.keyNameInput(key); break;
      case GS.API_KEY:      this.keyApiKey(key);    break;
      case GS.JOURNEY:      this.keyJourney(key);   break;
      case GS.EVENT:        this.keyEvent(key);     break;
      case GS.COMBAT:       this.keyCombat(key);    break;
      case GS.COMBAT_END:   this.keyCombatEnd(key); break;
      case GS.CAMP:         this.keyCamp(key);      break;
      case GS.CHAT:         this.keyChat(key);      break;
      case GS.GAME_OVER:
      case GS.VICTORY:      if (key === 'Enter' || key === ' ') this.backToTitle(); break;
    }
  }

  keyTitle(key) {
    const opts = 2;
    if (key === 'ArrowUp'   || key === 'w') this.titleSel = Math.max(0, this.titleSel - 1);
    if (key === 'ArrowDown' || key === 's') this.titleSel = Math.min(opts - 1, this.titleSel + 1);
    if (key === 'Enter' || key === ' ') {
      if (this.titleSel === 0) {
        this.state = GS.INTRO;
        this.introIdx = 0; this.introProgress = 0; this.introAlpha = 0;
        this.sceneTimer = 0;
      }
      // Option 1: How to Play — handled by renderer showing overlay
    }
  }

  keyIntro(key) {
    if (key === 'Enter' || key === ' ' || key === 'Escape') {
      this.introIdx++;
      if (this.introIdx >= INTRO_LINES.length) {
        this.state = GS.NAME_INPUT;
        this.nameInput = '';
      }
      this.introAlpha = 0;
      this.sceneTimer = 0;
    }
  }

  keyNameInput(key) {
    if (key === 'Enter') {
      const name = this.nameInput.trim();
      if (!name) { this.nameError = 'Enter a name!'; return; }
      if (name.length > 20) { this.nameError = 'Name too long (max 20 chars)'; return; }
      this.nameError = '';
      this.state = GS.API_KEY;
      this.apiKeyInput = this.ai.apiKey || '';
    } else if (key === 'Backspace') {
      this.nameInput = this.nameInput.slice(0, -1);
      this.nameError = '';
    } else if (key.length === 1 && this.nameInput.length < 20) {
      this.nameInput += key;
    }
  }

  keyApiKey(key) {
    if (key === 'Enter') {
      this.ai.setApiKey(this.apiKeyInput);
      this.beginAdventure(this.nameInput.trim() || 'Aldric');
    } else if (key === 'Escape' || (key === 'Tab')) {
      // Skip API key setup
      this.ai.setApiKey('');
      this.beginAdventure(this.nameInput.trim() || 'Aldric');
    } else if (key === 'Backspace') {
      this.apiKeyInput = this.apiKeyInput.slice(0, -1);
    } else if (key.length === 1 && this.apiKeyInput.length < 100) {
      this.apiKeyInput += key;
    }
  }

  keyJourney(key) {
    const numActions = this.journeyActions.length;
    if (key === 'ArrowUp'   || key === 'w') this.journeyActionSel = Math.max(0, this.journeyActionSel - 1);
    if (key === 'ArrowDown' || key === 's') this.journeyActionSel = Math.min(numActions - 1, this.journeyActionSel + 1);
    if (key === 'Enter' || key === ' ') this.doJourneyAction(this.journeyActionSel);

    // Quick companion chat shortcuts (1-4)
    if (key === '1') this.openChat(0);
    if (key === '2') this.openChat(1);
    if (key === '3') this.openChat(2);
    if (key === '4') this.openChat(3);
  }

  keyEvent(key) {
    if (this.reactionLines.length > 0) {
      // Advancing through companion reactions
      if (key === 'Enter' || key === ' ' || key === 'ArrowRight') {
        this.reactionIdx++;
        this.reactionTimer = 0;
        if (this.reactionIdx >= this.reactionLines.length) {
          this.reactionLines = [];
          this.reactionIdx   = 0;
          this.currentEvent  = null;
          // Check if event triggered combat
          if (this._pendingCombat) {
            this.startCombat(this._pendingCombat);
            this._pendingCombat = null;
          } else {
            this.state = GS.JOURNEY;
          }
        }
      }
      return;
    }

    const evt = this.currentEvent;
    if (!evt) return;
    const choices = evt.choices || [];
    if (key === 'ArrowUp'   || key === 'w') this.currentChoice = Math.max(0, this.currentChoice - 1);
    if (key === 'ArrowDown' || key === 's') this.currentChoice = Math.min(choices.length - 1, this.currentChoice + 1);
    if (key === 'Enter' || key === ' ') this.resolveEventChoice(this.currentChoice);
  }

  keyCombat(key) {
    if (this.combat.phase === COMBAT_PHASE.ANIMATING) return;
    if (!this.combat.isPlayerTurn()) return;

    const actions = ['Attack', 'Ability', 'Heal Self', 'Flee'];
    const numAct = actions.length;
    const numTar = this.combat.enemies.filter(e => !e.isDead).length;

    if (key === 'ArrowUp'   || key === 'w') this.combat.selectedAction = Math.max(0, this.combat.selectedAction - 1);
    if (key === 'ArrowDown' || key === 's') this.combat.selectedAction = Math.min(numAct - 1, this.combat.selectedAction + 1);
    if (key === 'ArrowLeft' || key === 'a') this.combat.selectedTarget = Math.max(0, this.combat.selectedTarget - 1);
    if (key === 'ArrowRight'|| key === 'd') {
      this.combat.selectedTarget = Math.min(this.combat.enemies.length - 1, this.combat.selectedTarget + 1);
      // Skip dead
      while (this.combat.selectedTarget < this.combat.enemies.length - 1 &&
             this.combat.enemies[this.combat.selectedTarget].isDead) {
        this.combat.selectedTarget++;
      }
    }

    if (key === 'Enter' || key === ' ') {
      const action = actions[this.combat.selectedAction];
      const target = this.combat.selectedTarget;
      if (action === 'Attack')     this.combat.playerAttack(target);
      else if (action === 'Ability')  this.combat.playerAbility(target);
      else if (action === 'Heal Self') this.combat.playerItem('potion', true);
      else if (action === 'Flee')  this.combat.tryFlee(this.player);

      if (this.combat.isOver) this.endCombat();
    }
  }

  keyCombatEnd(key) {
    if (key === 'Enter' || key === ' ') {
      this.combatResultTimer = 0;
      if (this.pendingFlee) {
        this.pendingFlee = false;
        this.state = GS.JOURNEY;
      } else if (this.combat.playerWon) {
        this.state = GS.JOURNEY;
        this.checkVictory();
      } else {
        this.state = GS.GAME_OVER;
      }
    }
  }

  keyCamp(key) {
    const options = ['Rest (restore HP)', 'Back to Journey'];
    if (key === 'ArrowUp'   || key === 'w') this.campSel = Math.max(0, this.campSel - 1);
    if (key === 'ArrowDown' || key === 's') this.campSel = Math.min(options.length - 1, this.campSel + 1);
    if (key === 'Enter' || key === ' ') this.doCampAction(this.campSel);
    // Quick chat in camp
    if (key === '1') this.openChat(0, true);
    if (key === '2') this.openChat(1, true);
    if (key === '3') this.openChat(2, true);
    if (key === '4') this.openChat(3, true);
    if (key === 'Escape') this.state = GS.JOURNEY;
  }

  keyChat(key) {
    if (key === 'Escape') {
      this.state = this._chatReturnState || GS.JOURNEY;
      return;
    }
    if (key === 'Enter' && this.chatInput.trim() && !this.chatThinking) {
      this.sendChatMessage();
      return;
    }
    if (key === 'Tab') {
      // Switch companion
      this.companionSel = (this.companionSel + 1) % this.companions.length;
      this.openChat(this.companionSel, this._chatReturnState === GS.CAMP);
      return;
    }
    if (key === 'Backspace') { this.chatInput = this.chatInput.slice(0, -1); return; }
    if (key.length === 1 && this.chatInput.length < 120) this.chatInput += key;
  }

  // ---- GAME FLOW ----
  beginAdventure(playerName) {
    const { player, companions } = buildParty(playerName);
    this.player     = player;
    this.companions = companions;
    this.narrativeLog = [];
    this.campLog      = [];

    this.state = GS.JOURNEY;
    this.justArrivedAt = LOCATIONS[0];
    this.addNarrative(`The Long Road begins. ${playerName} and the fellowship set out.`, C.P.GOLD);
    this.addNarrative(LOCATIONS[0].description, '#c0c0e0');
    this.triggerLocationArrival(0);
  }

  triggerLocationArrival(idx) {
    const loc = LOCATIONS[idx];
    this.addNarrative(`— ${loc.name} —`, C.P.GOLD);
    // Companion spontaneous comments
    for (const comp of this.companions) {
      const comment = this.ai.eventComment(comp, `arriving at ${loc.name}`);
      if (comment && Math.random() < 0.6) {
        setTimeout(() => {
          this.addNarrative(`${comp.name}: "${comment}"`, comp.colorLight);
        }, 800 + this.companions.indexOf(comp) * 400);
      }
    }
  }

  doJourneyAction(sel) {
    switch (sel) {
      case 0: this.continueJourney(); break;
      case 1: this.openCamp();        break;
      case 2: this.openChat(0);       break;
      case 3: this.examineLocation(); break;
    }
  }

  continueJourney() {
    const locIdx = this.player.locationIdx;
    const loc    = LOCATIONS[locIdx];

    const completedEvents = this.player.eventsCompleted;
    const available = (loc.events || []).filter(e => !completedEvents.includes(e));
    const hasEncounters = loc.encounters && loc.encounters.length > 0;

    if (available.length > 0) {
      // Events still available — mostly story, occasionally combat
      if (Math.random() < 0.70) {
        this.triggerEvent(pick(available));
      } else if (hasEncounters) {
        const encounter = pick(loc.encounters);
        this.addNarrative(`⚔ Encounter: ${encounter.name}!`, C.P.REDLT);
        this.startCombat(encounter);
      } else {
        this.triggerEvent(pick(available));
      }
    } else if (hasEncounters && !this.player.hadEncounterAt(locIdx)) {
      // All events done — guarantee one encounter, then advance
      this.player.markEncounter(locIdx);
      const encounter = pick(loc.encounters);
      this.addNarrative(`⚔ Encounter: ${encounter.name}!`, C.P.REDLT);
      this.startCombat(encounter);
    } else {
      // All done here — move on
      this.advanceLocation();
    }
  }

  advanceLocation() {
    const next = this.player.locationIdx + 1;
    if (next >= LOCATIONS.length) {
      this.checkVictory();
      return;
    }
    this.player.locationIdx = next;
    const loc = LOCATIONS[next];
    this.addNarrative(loc.travelText, '#c0c0d0');
    this.addNarrative(`— Arrived: ${loc.name} —`, C.P.GOLD);
    this.addNarrative(loc.description, '#c0c0e0');
    this.triggerLocationArrival(next);
    this.sceneTimer = 0;
  }

  examineLocation() {
    const loc = LOCATIONS[this.player.locationIdx];
    this.addNarrative(loc.description, '#c0d0e0');
    // Location-specific companion observations
    const comp = pick(this.companions);
    const locObs = {
      millhaven: [
        `${comp.name}: "The harvest failure is spreading. I've seen this shadow magic before — it seeps from the ground itself."`,
        `${comp.name}: "Those dark shapes on the road north... Scouts. They're watching us already."`,
        `${comp.name}: "There's something wrong with the light here. It's been wrong for weeks."`,
      ],
      whisperwood: [
        `${comp.name}: "Don't speak anything you wouldn't want the trees to remember. They do."`,
        `${comp.name}: "The forest's watching. Not hunting — watching. There's a difference."`,
        `${comp.name}: "I've never seen fireflies that colour before. That's not natural light."`,
      ],
      frostpeak: [
        `${comp.name}: "The cold this high is different. It gets inside you. Keep moving."`,
        `${comp.name}: "That path there — see where the snow's undisturbed? Something's been steering us."`,
        `${comp.name}: "We need to get through before nightfall. The things that patrol up here don't sleep."`,
      ],
      sunken_city: [
        `${comp.name}: "The towers are still intact. Whatever sank this city did it all at once."`,
        `${comp.name}: "Those lights in the water aren't reflections. Things are moving down there."`,
        `${comp.name}: "The magic here is old enough to have a name. Multiple names. None of them good."`,
      ],
      dreadmoor: [
        `${comp.name}: "The fog never moves the same way twice. Don't trust your eyes here."`,
        `${comp.name}: "That blood-red moon doesn't set. It just watches."`,
        `${comp.name}: "I can hear them. The ones who died here and stayed. We should move quickly."`,
      ],
      citadel: [
        `${comp.name}: "Every stone in this place was laid by someone who didn't want to lay it."`,
        `${comp.name}: "He's letting us this far on purpose. Remember that."`,
        `${comp.name}: "We've come a long way. Whatever happens next — I'm glad it's with you lot."`,
      ],
    };
    const pool = locObs[loc.id] || [
      `${comp.name}: "Stay alert. This isn't what it looks like."`,
      `${comp.name}: "Stick together. Whatever happens."`,
    ];
    this.addNarrative(pick(pool), comp.colorLight);
  }

  // ---- EVENTS ----
  triggerEvent(evtId) {
    const evt = EVENTS[evtId];
    if (!evt) { this.continueJourney(); return; }
    this.player.eventsCompleted.push(evtId);
    this.currentEvent  = evt;
    this.currentChoice = 0;
    this.reactionLines = [];
    this.reactionIdx   = 0;
    this.state = GS.EVENT;
  }

  resolveEventChoice(choiceIdx) {
    const evt    = this.currentEvent;
    const choice = evt.choices[choiceIdx];
    if (!choice) return;

    this.addNarrative(choice.outcome, '#d0d0ff');

    // Apply effects
    const fx = choice.effects || {};
    if (fx.gold)   this.player.gold = Math.max(0, this.player.gold + fx.gold);
    if (fx.morale) {
      for (const c of this.companions) c.adjustRelationship(fx.morale > 0 ? 5 : -3);
    }
    if (fx.clue)   this.player.clues.push(fx.clue);
    if (fx.combat) this._pendingCombat = LOCATIONS[this.player.locationIdx].encounters.find(e => e.name.toLowerCase().includes('encounter')) || pick(LOCATIONS[this.player.locationIdx].encounters);

    // Build companion reaction lines
    this.reactionLines = [];
    const reactions = choice.companionReactions || {};
    for (const comp of this.companions) {
      if (reactions[comp.id]) {
        this.reactionLines.push({ name: comp.name, color: comp.colorLight, text: reactions[comp.id] });
      }
    }
    this.reactionIdx   = 0;
    this.reactionTimer = 0;
  }

  // ---- COMBAT ----
  startCombat(encounter) {
    this.state = GS.COMBAT;
    this.combat.reset();
    this.combat.begin(this.player, this.companions, encounter, this.ps);
    this.ps.clear();
  }

  endCombat() {
    const won = this.combat.playerWon;

    if (!won && this.combat.phase !== COMBAT_PHASE.DEFEAT) {
      this.pendingFlee = true;
    }

    this.combatResultMsg = [];
    if (won) {
      this.combatResultMsg.push({ text: 'Victory!', color: C.P.GOLD });
      const xp = this.combat.xpGained;
      const gold = this.combat.goldGained;
      const lvlMsgs = this.player.addXp(xp);
      this.player.gold += gold;
      this.combatResultMsg.push({ text: `+${xp} XP  +${gold} Gold`, color: C.P.GOLDLT });
      for (const m of lvlMsgs) this.combatResultMsg.push({ text: m, color: C.P.GOLD });

      // Revive any downed companions (at low HP after combat)
      for (const c of this.companions) {
        if (c.isDead) c.revive();
      }
    } else if (this.pendingFlee) {
      this.combatResultMsg.push({ text: 'You fled!', color: C.P.GREY });
    } else {
      this.combatResultMsg.push({ text: 'The fellowship has fallen...', color: C.P.REDLT });
    }

    this.state = GS.COMBAT_END;

    // Check for final boss victory
    if (won && this.combat.isFinalBoss) {
      setTimeout(() => { this.state = GS.VICTORY; }, 3000);
    }
  }

  checkVictory() {
    if (this.player.locationIdx >= LOCATIONS.length - 1) {
      // Not yet won — need to defeat final boss
    }
  }

  // ---- CAMP ----
  openCamp() {
    this.state   = GS.CAMP;
    this.campSel = 0;
    this.campLog = [];
    this.addCampLog('The fellowship makes camp. Fire crackles, stars wheel overhead.', C.P.GOLD);
    // Companion spontaneous camp comments
    const comp = pick(this.companions);
    const campComments = [
      `${comp.name}: "I could get used to this. Almost."`,
      `${comp.name}: "We've come a long way."`,
      `${comp.name}: "Get some rest. Tomorrow demands everything."`,
      `${comp.name}: "I keep thinking about what comes next. I can't stop."`,
    ];
    this.addCampLog(pick(campComments), comp.colorLight);
  }

  doCampAction(sel) {
    if (sel === 0) { // Rest
      const healed = [];
      for (const c of [this.player, ...this.companions]) {
        const h = Math.floor(c.maxHp * 0.4);
        c.heal(h);
        if (c.isDead) c.revive();
        healed.push(`${c.name} +${h}HP`);
      }
      this.addCampLog('The fellowship rests. HP restored.', C.P.GREENLT);
      this.addCampLog(healed.join('  '), '#80d080');
    } else if (sel === 1) {
      this.state = GS.JOURNEY;
    }
  }

  // ---- CHAT ----
  openChat(companionIdx, fromCamp = false) {
    if (companionIdx >= this.companions.length) return;
    this.companionSel     = companionIdx;
    this.chatCompanion    = this.companions[companionIdx];
    this.chatMessages     = this.chatCompanion.history.map(h => ({
      role: h.role === 'user' ? 'player' : 'companion',
      text: h.content,
      color: h.role === 'user' ? '#87CEEB' : this.chatCompanion.colorLight,
    }));
    if (this.chatMessages.length === 0) {
      // Opening line based on relationship
      const tier = this.chatCompanion.relationshipTier;
      const opens = {
        stranger: `${this.chatCompanion.name} glances up. "Yes?"`,
        ally:     `${this.chatCompanion.name} nods. "What's on your mind?"`,
        friend:   `${this.chatCompanion.name} smiles. "I was wondering when you'd come talk to me."`,
        devoted:  `${this.chatCompanion.name}: "I was just thinking about you, actually."`,
      };
      this.chatMessages.push({ role: 'system', text: opens[tier], color: C.P.GREY });
    }
    this.chatInput        = '';
    this.chatThinking     = false;
    this._chatReturnState = fromCamp ? GS.CAMP : GS.JOURNEY;
    this.state = GS.CHAT;
  }

  async sendChatMessage() {
    const msg = this.chatInput.trim();
    if (!msg) return;
    this.chatInput    = '';
    this.chatThinking = true;

    this.chatMessages.push({ role: 'player', text: msg, color: '#87CEEB' });

    try {
      const reply = await this.ai.respond(this.chatCompanion, msg, { player: this.player });
      this.chatMessages.push({
        role: 'companion',
        text: `${this.chatCompanion.name}: ${reply}`,
        color: this.chatCompanion.colorLight,
      });
      // Positive interaction boosts relationship slightly
      this.chatCompanion.adjustRelationship(2);
    } catch (e) {
      this.chatMessages.push({ role: 'system', text: '(connection lost)', color: C.P.GREY });
    }

    this.chatThinking = false;
    // Keep messages from exploding
    if (this.chatMessages.length > 40) this.chatMessages = this.chatMessages.slice(-40);
  }

  // ---- MISC ----
  backToTitle() {
    this.state      = GS.TITLE;
    this.titleSel   = 0;
    this.player     = null;
    this.companions = [];
    this.narrativeLog = [];
    this.ps.clear();
    this.combat.reset();
    this.sceneTimer = 0;
  }

  // ---- UPDATE ----
  update() {
    this.timer++;
    this.sceneTimer++;
    this.ps.update();

    // Animate all entities
    const entities = [
      this.player,
      ...(this.companions || []),
      ...(this.combat.enemies || []),
    ].filter(Boolean);

    for (const e of entities) {
      e.animTimer = (e.animTimer || 0) + 1;
    }

    // Tick combat animation
    if (this.state === GS.COMBAT || this.state === GS.COMBAT_END) {
      this.combat.tickAnim();
      if (this.combat.isOver && this.state === GS.COMBAT) {
        this.endCombat();
      }
    }

    // Intro line advancement
    if (this.state === GS.INTRO) {
      this.introProgress++;
      const line = INTRO_LINES[this.introIdx];
      if (line && this.introProgress >= line.delay / (1000 / C.FPS)) {
        this.introIdx++;
        this.introProgress = 0;
        if (this.introIdx >= INTRO_LINES.length) {
          this.state = GS.NAME_INPUT;
          this.nameInput = '';
        }
      }
    }
  }

  currentLocation() {
    if (!this.player) return LOCATIONS[0];
    return LOCATIONS[this.player.locationIdx] || LOCATIONS[0];
  }

  currentSceneId() {
    if (this.state === GS.CAMP) return 'camp';
    if (this.state === GS.TITLE) return 'title';
    return this.currentLocation().scene;
  }
}
