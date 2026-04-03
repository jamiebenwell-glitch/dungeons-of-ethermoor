// ============================================================
// RENDERER.JS — All canvas rendering
// ============================================================

class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.game   = game;
    this.ctx.imageSmoothingEnabled = false;
    this.transitionAlpha = 0;
    this.lastScene = null;
  }

  get W() { return this.canvas.width; }
  get H() { return this.canvas.height; }
  get sideW() { return Math.min(220, Math.floor(this.W * 0.2)); }
  get logH()  { return Math.min(150, Math.floor(this.H * 0.2)); }
  get gameW() { return this.W - this.sideW; }
  get gameH() { return this.H - this.logH; }

  render() {
    const g = this.game;
    const ctx = this.ctx;

    ctx.fillStyle = C.P.BLACK;
    ctx.fillRect(0, 0, this.W, this.H);

    switch (g.state) {
      case GS.TITLE:       this.renderTitle();     break;
      case GS.INTRO:       this.renderIntro();     break;
      case GS.NAME_INPUT:  this.renderNameInput(); break;
      case GS.API_KEY:     this.renderApiKey();    break;
      case GS.JOURNEY:     this.renderJourney();   break;
      case GS.EVENT:       this.renderEvent();     break;
      case GS.COMBAT:
      case GS.COMBAT_END:  this.renderCombat();    break;
      case GS.CAMP:        this.renderCamp();      break;
      case GS.CHAT:        this.renderChat();      break;
      case GS.GAME_OVER:   this.renderGameOver();  break;
      case GS.VICTORY:     this.renderVictory();   break;
    }
  }

  // ---- SCENE BACKGROUND ----
  renderSceneBg(sceneId) {
    drawScene(this.ctx, sceneId, this.gameW, this.gameH, this.game.sceneTimer, this.game.ps);
    this.game.ps.draw(this.ctx);
  }

  // ---- FONT HELPERS ----
  font(size, weight = '') {
    this.ctx.font = `${weight} ${size}px "Press Start 2P", monospace`.trim();
  }

  text(str, x, y, color, align = 'left', maxW) {
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    if (maxW) this.ctx.fillText(str, x, y, maxW);
    else       this.ctx.fillText(str, x, y);
  }

  // ---- PANEL ----
  panel(x, y, w, h, opts) { drawPanel(this.ctx, x, y, w, h, opts); }

  // ---- TITLE ----
  renderTitle() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const cx = W / 2, cy = H / 2;

    drawScene(ctx, 'title', W, H, this.game.sceneTimer, this.game.ps);
    this.game.ps.draw(ctx);

    // Dark vignette
    const vig = ctx.createRadialGradient(cx, cy, H*0.2, cx, cy, H*0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

    // Title box
    this.panel(cx - 320, cy - 180, 640, 360, { fill: 'rgba(5,5,15,0.82)', border: '#604010', radius: 6 });

    // Title text
    const glow = ctx.createLinearGradient(cx-200, cy-140, cx+200, cy-80);
    glow.addColorStop(0, '#ffe060'); glow.addColorStop(0.5, '#ffffff'); glow.addColorStop(1, '#ffc030');
    this.font(28, 'bold');
    ctx.fillStyle = glow; ctx.textAlign = 'center';
    ctx.fillText('THE LONG ROAD', cx, cy - 100);

    this.font(11);
    this.text('A Fellowship Adventure', cx, cy - 70, '#a08040', 'center');

    // Separator
    ctx.strokeStyle = '#604010'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-200, cy-52); ctx.lineTo(cx+200, cy-52); ctx.stroke();

    // Menu
    const options = ['Begin the Journey', 'How to Play'];
    for (let i = 0; i < options.length; i++) {
      const sel = i === this.game.titleSel;
      const y2  = cy - 20 + i * 48;
      if (sel) {
        ctx.fillStyle = 'rgba(255,200,50,0.12)';
        ctx.fillRect(cx - 200, y2 - 20, 400, 36);
        ctx.strokeStyle = '#c09020'; ctx.lineWidth = 1;
        ctx.strokeRect(cx - 200, y2 - 20, 400, 36);
      }
      this.font(sel ? 13 : 11, sel ? 'bold' : '');
      this.text(sel ? '▶  ' + options[i] : options[i], cx, y2, sel ? C.P.GOLD : C.P.GREY, 'center');
    }

    this.font(8);
    this.text('↑↓ Navigate   Enter Select', cx, cy + 150, '#404040', 'center');

    // How to Play overlay
    if (this.game.showHowToPlay) {
      ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, W, H);
      this.panel(cx - 300, cy - 210, 600, 420, { fill: 'rgba(5,5,20,0.98)', border: C.P.GOLD, radius: 6 });
      this.font(12, 'bold'); this.text('HOW TO PLAY', cx, cy - 178, C.P.GOLD, 'center');
      ctx.strokeStyle = '#604010'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx-260, cy-162); ctx.lineTo(cx+260, cy-162); ctx.stroke();

      const rows = [
        ['JOURNEY',  '↑↓ select action,  Enter to confirm'],
        ['',         '1-4 to open companion chat directly'],
        ['EVENTS',   '↑↓ select choice,  Enter to choose'],
        ['',         'Space/Enter to advance companion reactions'],
        ['COMBAT',   '↑↓ change action,  ←→ change target'],
        ['',         'Enter to confirm   (Attack/Ability/Heal/Flee)'],
        ['CAMP',     'Rest to restore 40% HP for all   1-4 to chat'],
        ['CHAT',     'Type freely,  Enter to send'],
        ['',         'Tab to switch companion   Esc to close'],
        ['AI',       'Add Anthropic API key at start for real AI chat'],
        ['',         'Skip with Tab/Esc to use built-in personalities'],
      ];
      this.font(8);
      let ry = cy - 140;
      for (const [label, desc] of rows) {
        if (label) { this.text(label, cx - 250, ry, C.P.GOLD); }
        this.text(desc, cx - 140, ry, '#c0c0d0');
        ry += 22;
      }
      ctx.strokeStyle = '#604010'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx-260, ry+4); ctx.lineTo(cx+260, ry+4); ctx.stroke();
      this.font(8); this.text('Press Enter or Esc to close', cx, ry + 22, C.P.GREY, 'center');
    }
  }

  // ---- INTRO ----
  renderIntro() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const cx = W / 2, cy = H / 2;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    const lineIdx = Math.min(this.game.introIdx, INTRO_LINES.length - 1);
    const line = INTRO_LINES[lineIdx];
    if (!line) return;

    const progress = this.game.introProgress / (line.delay / (1000 / C.FPS));
    const alpha = Math.min(1, progress * 3) * (progress > 0.8 ? 1 - (progress - 0.8) * 5 : 1);

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    this.font(14, 'bold');
    ctx.fillStyle = '#d0c090';
    ctx.textAlign = 'center';
    // Wrap text
    const lines = wrapText(ctx, line.text, W * 0.6);
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], cx, cy - (lines.length - 1) * 12 + i * 28);
    }
    ctx.restore();

    // Skip hint
    this.font(8);
    this.text('Press Space to advance', cx, H - 30, '#333333', 'center');
  }

  // ---- NAME INPUT ----
  renderNameInput() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const cx = W / 2, cy = H / 2;

    drawScene(ctx, 'millhaven', W, H, this.game.sceneTimer, this.game.ps);
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
    this.game.ps.draw(ctx);

    this.panel(cx - 260, cy - 120, 520, 240, { fill: 'rgba(5,5,15,0.90)' });

    this.font(13, 'bold');
    this.text('Name your Ranger', cx, cy - 80, C.P.GOLD, 'center');

    // Input field
    const inputY = cy - 30;
    ctx.fillStyle = '#0a0a18'; ctx.fillRect(cx - 180, inputY, 360, 38);
    ctx.strokeStyle = C.P.GOLD; ctx.lineWidth = 1.5; ctx.strokeRect(cx - 180, inputY, 360, 38);
    this.font(13);
    const cursor = this.game.timer % 40 < 20 ? '│' : '';
    this.text(this.game.nameInput + cursor, cx - 170, inputY + 25, C.P.WHITE);

    if (this.game.nameError) {
      this.font(9); this.text(this.game.nameError, cx, cy + 30, C.P.REDLT, 'center');
    }

    this.font(8); this.text('Enter to confirm', cx, cy + 70, C.P.GREY, 'center');
  }

  // ---- API KEY ----
  renderApiKey() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const cx = W / 2, cy = H / 2;

    drawScene(ctx, 'millhaven', W, H, this.game.sceneTimer, this.game.ps);
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, H);
    this.game.ps.draw(ctx);

    this.panel(cx - 310, cy - 165, 620, 330, { fill: 'rgba(5,5,15,0.92)' });

    this.font(12, 'bold');
    this.text('Claude AI (Optional)', cx, cy - 130, C.P.GOLD, 'center');

    this.font(8);
    const lines2 = [
      'Add your Anthropic API key to give companions real AI personalities.',
      'Without it, the built-in personality engine is used (still great!).',
      'Your key is stored only in this browser — never sent anywhere else.',
    ];
    for (let i = 0; i < lines2.length; i++) {
      this.text(lines2[i], cx, cy - 95 + i * 20, '#8888aa', 'center');
    }

    // Input
    const inputY = cy - 30;
    ctx.fillStyle = '#0a0a18'; ctx.fillRect(cx - 270, inputY, 540, 38);
    ctx.strokeStyle = '#4040a0'; ctx.lineWidth = 1.5; ctx.strokeRect(cx - 270, inputY, 540, 38);
    this.font(9);
    const masked = this.game.apiKeyInput ? '•'.repeat(Math.min(this.game.apiKeyInput.length, 40)) : '';
    const cur2 = this.game.timer % 40 < 20 ? '│' : '';
    this.text(masked + cur2, cx - 260, inputY + 24, C.P.WHITE);

    this.font(8);
    this.text('Enter: confirm   Tab/Esc: skip (use built-in AI)', cx, cy + 30, C.P.GREY, 'center');

    if (this.game.ai?.useReal) {
      this.text('✓ API key active', cx, cy + 55, C.P.GREEN, 'center');
    }
  }

  // ---- JOURNEY ----
  renderJourney() {
    const ctx = this.ctx;
    const loc  = this.game.currentLocation();

    // Scene background
    this.renderSceneBg(loc.scene);

    // Party walking animation
    this.renderPartyWalking();

    // Sidebar (companion panel)
    this.renderSidebar();

    // Narrative log (bottom)
    this.renderNarrativeLog();

    // Action menu (lower-left area of game pane)
    this.renderJourneyActions();

    // Location banner
    this.font(10, 'bold');
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const bannerW = ctx.measureText(loc.name).width + 30;
    ctx.fillRect(10, 10, bannerW, 30);
    ctx.strokeStyle = '#604010'; ctx.lineWidth = 1; ctx.strokeRect(10, 10, bannerW, 30);
    this.text(loc.name, 25, 31, C.P.GOLD);
    this.font(7);
    this.text(loc.subtitle, 25, 48, '#806030');
  }

  renderPartyWalking() {
    const ctx = this.ctx;
    const t   = this.game.sceneTimer;
    const members = [this.game.player, ...this.game.companions.filter(c => !c.isDead)];
    const spacing = 80;
    const startX  = Math.floor(this.gameW * 0.25);
    const y       = Math.floor(this.gameH * 0.58);
    const S       = 3;

    for (let i = 0; i < members.length; i++) {
      const m   = members[i];
      const mx  = startX + i * spacing;
      const bobY = Math.sin(t * 0.08 + i * 1.2) * 3;
      m.x = mx; m.y = y;
      drawSprite(ctx, m.sprite, mx, y + bobY, S, t + i * 4, 'idle');
    }
  }

  renderJourneyActions() {
    const ctx  = this.ctx;
    const panW = 230;
    const panH = 38 + this.game.journeyActions.length * 30;
    const panX = 14;
    const panY = this.gameH - panH - 10;

    this.panel(panX, panY, panW, panH, { fill: 'rgba(5,5,18,0.88)', border: '#3a3a60', radius: 4 });

    this.font(8, 'bold');
    this.text('ACTIONS', panX + 14, panY + 20, C.P.GOLD);

    for (let i = 0; i < this.game.journeyActions.length; i++) {
      const sel = i === this.game.journeyActionSel;
      const y2  = panY + 34 + i * 28;
      if (sel) {
        ctx.fillStyle = 'rgba(255,200,50,0.1)';
        ctx.fillRect(panX + 8, y2 - 12, panW - 16, 22);
      }
      this.font(sel ? 9 : 8, sel ? 'bold' : '');
      this.text((sel ? '▶ ' : '  ') + this.game.journeyActions[i], panX + 14, y2, sel ? C.P.GOLD : C.P.GREY);
    }

    this.font(7);
    this.text('1-4: Quick chat   ↑↓ Move   Enter: Select', panX + 14, panY + panH - 8, '#3a3a60');
  }

  // ---- NARRATIVE LOG ----
  renderNarrativeLog() {
    const ctx  = this.ctx;
    const logX = 0;
    const logY = this.gameH;
    const logW = this.gameW;
    const logH = this.logH;

    ctx.fillStyle = 'rgba(5,5,15,0.92)';
    ctx.fillRect(logX, logY, logW, logH);
    ctx.strokeStyle = '#2a2a45'; ctx.lineWidth = 1;
    ctx.strokeRect(logX, logY, logW, logH);

    const lineH  = 16;
    const maxVis = Math.floor((logH - 20) / lineH);
    const log    = this.game.state === GS.CAMP ? this.game.campLog : this.game.narrativeLog;
    const start  = Math.max(0, log.length - maxVis);

    this.font(8);
    for (let i = start; i < log.length; i++) {
      const entry = log[i];
      const y2    = logY + 16 + (i - start) * lineH;
      ctx.fillStyle = entry.color || C.P.WHITE;
      ctx.textAlign = 'left';
      ctx.fillText(entry.text, logX + 12, y2, logW - 24);
    }
  }

  // ---- SIDEBAR ----
  renderSidebar() {
    const ctx  = this.ctx;
    const sX   = this.gameW;
    const sW   = this.sideW;
    const sH   = this.H;

    ctx.fillStyle = 'rgba(5,5,18,0.96)';
    ctx.fillRect(sX, 0, sW, sH);
    ctx.strokeStyle = '#2a2a45'; ctx.lineWidth = 1;
    ctx.strokeRect(sX, 0, sW, sH);

    this.font(8, 'bold');
    this.text('FELLOWSHIP', sX + sW/2, 18, C.P.GOLD, 'center');

    let y = 32;
    const all = [this.game.player, ...this.game.companions];
    const cardH = Math.floor((sH - y - 10) / all.length);

    for (let i = 0; i < all.length; i++) {
      this.renderCompanionCard(all[i], sX + 6, y, sW - 12, cardH - 4, i);
      y += cardH;
    }
  }

  renderCompanionCard(member, x, y, w, h, idx) {
    const ctx = this.ctx;
    const isDead = member.isDead;

    ctx.fillStyle = isDead ? '#0a0508' : 'rgba(15,15,30,0.9)';
    ctx.fillRect(x, y, w, h);
    const borderCol = isDead ? '#400010' : member.color || '#3a3a5c';
    ctx.strokeStyle = borderCol; ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Mini sprite
    const S = 1.2;
    if (!isDead) {
      drawSprite(ctx, member.sprite, x + 4, y + 4, S, this.game.timer + idx * 7, 'idle');
    } else {
      ctx.globalAlpha = 0.3;
      drawSprite(ctx, member.sprite, x + 4, y + 4, S, 0, 'dead');
      ctx.globalAlpha = 1;
    }

    const tx = x + 26;

    // Name + role
    this.font(7, 'bold');
    this.text(member.name, tx, y + 14, isDead ? '#664444' : member.colorLight || C.P.WHITE);
    this.font(6);
    this.text(member.role || 'Ranger', tx, y + 24, C.P.GREY);

    if (isDead) {
      this.font(7); this.text('FALLEN', x + w/2, y + h/2, '#884444', 'center');
      return;
    }

    // HP bar
    const hpBarX = tx;
    const hpBarW = w - 30;
    const hpRatio = clamp(member.hp / member.maxHp, 0, 1);
    const hpY = y + 32;
    ctx.fillStyle = '#1a0808'; ctx.fillRect(hpBarX, hpY, hpBarW, 6);
    ctx.fillStyle = hpRatio > 0.5 ? C.P.GREEN : hpRatio > 0.25 ? '#d0a020' : C.P.RED;
    ctx.fillRect(hpBarX, hpY, hpBarW * hpRatio, 6);
    this.font(6);
    this.text(`${member.hp}/${member.maxHp}`, hpBarX, hpY + 14, '#888888');

    // Relationship bar (companions only)
    if (member.relationship !== undefined) {
      const relY   = hpY + 18;
      const relW   = hpBarW;
      const relR   = member.relationship / 100;
      ctx.fillStyle = '#080818'; ctx.fillRect(hpBarX, relY, relW, 4);
      ctx.fillStyle = '#4060c0'; ctx.fillRect(hpBarX, relY, relW * relR, 4);
    }

    // Ability cooldown indicator
    if (member.abilityCooldown > 0) {
      this.font(6);
      this.text(`CD:${member.abilityCooldown}`, x + w - 4, y + 14, '#8060a0', 'right');
    }

    // Chat hint
    if (idx > 0) { // companions (not player)
      this.font(6);
      this.text(`[${idx}]`, x + w - 4, y + h - 4, '#303050', 'right');
    }
  }

  // ---- EVENT ----
  renderEvent() {
    const ctx = this.ctx;
    const g   = this.game;

    this.renderSceneBg(g.currentLocation().scene);
    this.renderPartyWalking();
    this.renderSidebar();

    // Event panel
    const pw  = Math.min(640, this.gameW - 40);
    const ph  = Math.min(480, this.gameH - 40);
    const px  = (this.gameW - pw) / 2;
    const py  = (this.gameH - ph) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, this.gameW, this.gameH);
    this.panel(px, py, pw, ph, { fill: 'rgba(5,5,20,0.97)', border: '#604020', radius: 6 });

    if (g.reactionLines.length > 0) {
      // Showing companion reactions
      const line = g.reactionLines[g.reactionIdx];
      if (!line) return;
      const cy2 = py + ph / 2;
      this.font(9, 'bold');
      this.text(line.name, px + pw/2, cy2 - 40, line.color, 'center');
      ctx.strokeStyle = line.color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px + 40, cy2 - 28); ctx.lineTo(px + pw - 40, cy2 - 28); ctx.stroke();
      this.font(9);
      ctx.fillStyle = C.P.WHITE; ctx.textAlign = 'center';
      const rlines = wrapText(ctx, `"${line.text}"`, pw - 80);
      for (let i = 0; i < rlines.length; i++) ctx.fillText(rlines[i], px + pw/2, cy2 - 5 + i * 22);
      this.font(7);
      this.text(`${g.reactionIdx + 1}/${g.reactionLines.length}   Space to continue`, px + pw/2, py + ph - 18, '#404040', 'center');
      return;
    }

    const evt = g.currentEvent;
    if (!evt) return;

    // Title
    this.font(11, 'bold');
    this.text(evt.title, px + pw/2, py + 28, C.P.GOLD, 'center');
    ctx.strokeStyle = '#604020'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px + 20, py + 38); ctx.lineTo(px + pw - 20, py + 38); ctx.stroke();

    // Event text
    this.font(9);
    ctx.fillStyle = '#c0c0d0'; ctx.textAlign = 'left';
    const eventLines = wrapText(ctx, evt.text, pw - 40);
    let textY = py + 58;
    for (const el of eventLines) {
      ctx.fillText(el, px + 20, textY);
      textY += 20;
    }

    // Choices
    textY = Math.max(textY + 20, py + ph * 0.5);
    this.font(8, 'bold');
    this.text('Choose:', px + 20, textY, C.P.GOLD);
    textY += 18;

    for (let i = 0; i < evt.choices.length; i++) {
      const choice = evt.choices[i];
      const sel    = i === g.currentChoice;

      if (sel) {
        ctx.fillStyle = 'rgba(255,200,50,0.1)';
        ctx.fillRect(px + 14, textY - 13, pw - 28, 28);
        ctx.strokeStyle = '#604010'; ctx.lineWidth = 1;
        ctx.strokeRect(px + 14, textY - 13, pw - 28, 28);
      }
      this.font(8, sel ? 'bold' : '');
      this.text((sel ? '▶ ' : '  ') + choice.text, px + 20, textY, sel ? C.P.GOLD : C.P.GREY);
      textY += 30;
    }

    this.font(7);
    this.text('↑↓ Navigate   Enter: Choose', px + pw/2, py + ph - 14, '#303040', 'center');
  }

  // ---- COMBAT ----
  renderCombat() {
    const ctx = this.ctx;
    const g   = this.game;
    const cb  = this.game.combat;
    const W   = this.W, H = this.H;

    // Background — darker version of current scene
    drawScene(ctx, g.currentLocation().scene, W, H * 0.65, g.sceneTimer, g.ps);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H * 0.65);

    // Floor line
    ctx.fillStyle = '#1a1810'; ctx.fillRect(0, H * 0.6, W, H * 0.4);
    ctx.strokeStyle = '#3a3020'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H * 0.6); ctx.lineTo(W, H * 0.6); ctx.stroke();

    // COMBAT HEADER
    this.font(10, 'bold');
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, W, 32);
    const encName = cb.enemies[0]?.name ? `⚔ ${cb.isFinalBoss ? 'BOSS: ' : ''}${cb.enemies.map(e => e.name).join(' + ')}` : '⚔ Combat';
    this.text(encName, W/2, 22, cb.isFinalBoss ? '#ff4040' : C.P.GOLD, 'center');

    // --- ENEMIES (right side, mirrored) ---
    const enemyCount = cb.enemies.length;
    const enemySpacing = Math.min(140, (W * 0.5) / (enemyCount + 1));
    const enemyBaseY = H * 0.42;

    for (let i = 0; i < cb.enemies.length; i++) {
      const e = cb.enemies[i];
      const ex = W * 0.55 + i * enemySpacing;
      const ey = enemyBaseY - (i % 2) * 30;
      e.x = ex; e.y = ey;

      if (e.isDead) {
        ctx.save(); ctx.globalAlpha = 0.2;
        ctx.save(); ctx.translate(ex + 24, ey + 56); ctx.rotate(Math.PI/2);
        drawSprite(ctx, e.sprite, -24, -40, 3, cb.pendingAnim?.elapsed || 0, 'dead');
        ctx.restore(); ctx.restore();
        continue;
      }

      // Selection highlight
      if (cb.phase === COMBAT_PHASE.PLAYER_TURN && i === cb.selectedTarget) {
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(g.timer * 0.15);
        ctx.fillStyle = '#ffff40';
        ctx.beginPath(); ctx.arc(ex + 24, ey + 50, 30, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Mirror enemies horizontally
      ctx.save(); ctx.scale(-1, 1); ctx.translate(-ex * 2 - 48, 0);
      drawSprite(ctx, e.sprite, ex, ey, 3, g.timer + i * 5, e.animState || 'idle');
      ctx.restore();

      // HP bar above enemy
      const barW = 80, barX = ex - 16, barY = ey - 14;
      const hpR  = clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = '#1a0808'; ctx.fillRect(barX, barY, barW, 8);
      ctx.fillStyle = hpR > 0.5 ? C.P.GREEN : hpR > 0.25 ? '#d0a020' : C.P.RED;
      ctx.fillRect(barX, barY, barW * hpR, 8);
      this.font(7);
      this.text(e.name, ex + 24, barY - 4, e.color, 'center');
      this.text(`${e.hp}/${e.maxHp}`, ex + 24, barY + 6, C.P.WHITE, 'center');
    }

    // --- PARTY (left side) ---
    const partyMembers = cb.party;
    const partySpacing = Math.min(120, (W * 0.5) / (partyMembers.length + 1));
    const partyBaseY   = H * 0.43;

    for (let i = 0; i < partyMembers.length; i++) {
      const m  = partyMembers[i];
      const mx = W * 0.05 + i * partySpacing;
      const my = partyBaseY - (i % 2) * 25;
      m.x = mx; m.y = my;

      if (m.isDead) {
        ctx.save(); ctx.globalAlpha = 0.2;
        ctx.save(); ctx.translate(mx + 24, my + 50); ctx.rotate(-Math.PI/2);
        drawSprite(ctx, m.sprite, -24, -40, 3, 0, 'dead');
        ctx.restore(); ctx.restore();
        this.font(6); this.text('FALLEN', mx + 24, my + 60, '#884444', 'center');
        continue;
      }

      // Current actor glow
      const isCurrentActor = cb.currentActor() === m;
      if (isCurrentActor) {
        ctx.save(); ctx.globalAlpha = 0.2 + 0.15 * Math.sin(g.timer * 0.2);
        ctx.fillStyle = m.color || C.P.GOLD;
        ctx.beginPath(); ctx.arc(mx + 24, my + 48, 28, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      drawSprite(ctx, m.sprite, mx, my, 3, g.timer + i * 6, m.animState || 'idle');

      // Name + HP
      const hpR2  = clamp(m.hp / m.maxHp, 0, 1);
      const barX2 = mx - 8, barY2 = my - 14, barW2 = 64;
      ctx.fillStyle = '#0a1408'; ctx.fillRect(barX2, barY2, barW2, 7);
      ctx.fillStyle = hpR2 > 0.5 ? C.P.GREEN : hpR2 > 0.25 ? '#d0a020' : C.P.RED;
      ctx.fillRect(barX2, barY2, barW2 * hpR2, 7);
      this.font(7);
      this.text(m.name, mx + 24, barY2 - 4, m.colorLight || C.P.WHITE, 'center');
      this.text(`${m.hp}/${m.maxHp}`, mx + 24, barY2 + 6, C.P.WHITE, 'center');
    }

    // Particles
    g.ps.draw(ctx);

    // --- COMBAT PANELS ---
    const panelTop = H * 0.63;
    const panelH   = H - panelTop;

    // Action menu (left)
    const actW = Math.floor(W * 0.28);
    this.panel(0, panelTop, actW, panelH, { fill: 'rgba(5,5,18,0.97)', border: '#3a3060', radius: 0 });

    if (cb.phase === COMBAT_PHASE.PLAYER_TURN) {
      this.font(8, 'bold'); this.text('YOUR TURN', 14, panelTop + 20, C.P.GOLD);

      const actions = ['Attack', 'Ability', 'Heal Self', 'Flee'];
      for (let i = 0; i < actions.length; i++) {
        const sel = i === cb.selectedAction;
        const ay  = panelTop + 36 + i * 28;
        if (sel) { ctx.fillStyle = 'rgba(255,200,50,0.12)'; ctx.fillRect(6, ay - 12, actW - 12, 22); }
        const isAbility = i === 1;
        const cdStr = isAbility && this.game.player.abilityCooldown > 0 ? ` (CD:${this.game.player.abilityCooldown})` : '';
        this.font(sel ? 9 : 8, sel ? 'bold' : '');
        const col = (isAbility && this.game.player.abilityCooldown > 0) ? C.P.DARKGREY : (sel ? C.P.GOLD : C.P.GREY);
        this.text((sel ? '▶ ' : '  ') + actions[i] + cdStr, 14, ay, col);
      }
      this.font(7);
      this.text('↑↓ Action  ←→ Target  Enter: Confirm', 14, panelTop + panelH - 10, '#303050');
    } else if (cb.phase === COMBAT_PHASE.COMPANION_TURN) {
      const actor = cb.currentActor();
      this.font(8); this.text(`${actor?.name || '...'}`, 14, panelTop + 25, C.P.GOLD);
      this.font(7); this.text('thinking...', 14, panelTop + 44, C.P.GREY);
    } else if (cb.phase === COMBAT_PHASE.ENEMY_TURN) {
      this.font(8); this.text('ENEMY TURN', 14, panelTop + 25, C.P.REDLT);
    } else if (cb.phase === COMBAT_PHASE.ANIMATING) {
      this.font(8); this.text('...', 14, panelTop + 25, C.P.GREY);
    }

    // Combat log (right)
    const logX2 = actW;
    const logW2 = W - actW;
    this.panel(logX2, panelTop, logW2, panelH, { fill: 'rgba(5,5,12,0.97)', border: '#2a2a40', radius: 0 });

    const maxLogVis = Math.floor((panelH - 20) / 16);
    const logStart  = Math.max(0, cb.log.length - maxLogVis);
    this.font(8);
    for (let i = logStart; i < cb.log.length; i++) {
      const entry = cb.log[i];
      const ely   = panelTop + 16 + (i - logStart) * 16;
      ctx.fillStyle = entry.color; ctx.textAlign = 'left';
      ctx.fillText(entry.text, logX2 + 10, ely, logW2 - 20);
    }

    // Combat end overlay
    if (g.state === GS.COMBAT_END) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, W, H);
      this.panel(W/2 - 220, H/2 - 100, 440, 200, { fill: 'rgba(5,5,20,0.98)', border: C.P.GOLD });
      for (let i = 0; i < g.combatResultMsg.length; i++) {
        const m2 = g.combatResultMsg[i];
        this.font(i === 0 ? 16 : 10, 'bold');
        this.text(m2.text, W/2, H/2 - 55 + i * 36, m2.color, 'center');
      }
      this.font(8); this.text('Press Enter to continue', W/2, H/2 + 80, C.P.GREY, 'center');
    }
  }

  // ---- CAMP ----
  renderCamp() {
    const ctx = this.ctx;
    this.renderSceneBg('camp');

    // Party sprites around fire
    const members = [this.game.player, ...this.game.companions.filter(c => !c.isDead)];
    const cx2 = this.gameW / 2;
    const cy2 = this.gameH * 0.72;
    const positions = [
      [cx2 - 90, cy2 + 15], [cx2 + 80, cy2 + 15],
      [cx2 - 50, cy2 + 38], [cx2 + 45, cy2 + 38], [cx2, cy2 + 50],
    ];
    for (let i = 0; i < members.length; i++) {
      const [mx, my] = positions[i] || [cx2 + (i-2)*60, cy2 + 30];
      members[i].x = mx; members[i].y = my;
      const bob = Math.sin(this.game.sceneTimer * 0.06 + i) * 1.5;
      drawSprite(ctx, members[i].sprite, mx, my + bob, 2.5, this.game.timer + i * 5, 'idle');
    }

    this.game.ps.draw(ctx);
    this.renderSidebar();
    this.renderNarrativeLog();

    // Camp actions
    const campOpts = ['Rest (restore HP)', 'Back to Journey'];
    const panW = 220, panH = 36 + campOpts.length * 30 + 40;
    const panX = 14, panY = this.gameH - panH - 10;

    this.panel(panX, panY, panW, panH, { fill: 'rgba(5,5,18,0.9)', border: '#3a3060' });
    this.font(8, 'bold'); this.text('CAMP', panX + 14, panY + 20, C.P.GOLD);

    for (let i = 0; i < campOpts.length; i++) {
      const sel = i === this.game.campSel;
      const y2  = panY + 34 + i * 28;
      if (sel) { ctx.fillStyle = 'rgba(255,200,50,0.1)'; ctx.fillRect(panX + 8, y2 - 12, panW - 16, 22); }
      this.font(sel ? 9 : 8, sel ? 'bold' : '');
      this.text((sel ? '▶ ' : '  ') + campOpts[i], panX + 14, y2, sel ? C.P.GOLD : C.P.GREY);
    }
    this.font(7);
    this.text('1-4: Chat with companion', panX + 14, panY + panH - 12, '#404060');
  }

  // ---- CHAT ----
  renderChat() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    const comp = this.game.chatCompanion;
    if (!comp) return;

    // Blurred background
    drawScene(ctx, this.game.currentSceneId(), W, H, this.game.sceneTimer, this.game.ps);
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, W, H);

    // Portrait (left panel)
    const portW = 200;
    ctx.fillStyle = comp.portraitBg || 'rgba(5,5,20,0.97)';
    ctx.fillRect(0, 0, portW, H);
    ctx.strokeStyle = comp.color; ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, portW, H);

    // Companion sprite (large)
    drawSprite(ctx, comp.sprite, 16, H * 0.25, 6, this.game.timer, 'idle');

    // Companion name + title
    this.font(9, 'bold');
    this.text(comp.name, portW/2, H * 0.1, comp.colorLight, 'center');
    this.font(7);
    this.text(comp.role, portW/2, H * 0.1 + 18, C.P.GREY, 'center');

    // Relationship meter
    const relY = H * 0.75;
    this.font(7); this.text('Bond', portW/2, relY - 8, C.P.GREY, 'center');
    const relW = portW - 30;
    ctx.fillStyle = '#0a0818'; ctx.fillRect(15, relY, relW, 8);
    ctx.fillStyle = comp.color; ctx.fillRect(15, relY, relW * comp.relationship / 100, 8);
    this.font(6); this.text(comp.relationshipTier, portW/2, relY + 20, comp.color, 'center');

    // Mood
    this.font(7); this.text(`Mood: ${comp.mood}`, portW/2, relY + 36, '#6060a0', 'center');

    // Chat panel
    const chatX = portW + 8;
    const chatW = W - portW - 16;
    const inputH = 48;
    const msgH   = H - inputH - 16;

    // Messages
    this.panel(chatX, 0, chatW, msgH, { fill: 'rgba(5,5,18,0.97)', border: '#2a2a45' });

    this.font(9, 'bold'); this.text(`Chat — ${comp.name}`, chatX + 14, 20, comp.colorLight);
    ctx.strokeStyle = '#2a2a45'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(chatX + 8, 28); ctx.lineTo(chatX + chatW - 8, 28); ctx.stroke();

    const msgs   = this.game.chatMessages;
    const lineH  = 18;
    const msgW   = chatW - 24;
    const maxVis = Math.floor((msgH - 50) / lineH);

    // Expand every message into individual wrapped lines (preserving color)
    this.font(8);
    const displayLines = [];
    for (const m of msgs) {
      const wrapped = wrapText(ctx, m.text, msgW);
      for (const l of wrapped) displayLines.push({ text: l, color: m.color || C.P.WHITE });
    }
    const startLine = Math.max(0, displayLines.length - maxVis);
    ctx.textAlign = 'left';
    for (let i = startLine; i < displayLines.length; i++) {
      const dl  = displayLines[i];
      const my2 = 44 + (i - startLine) * lineH;
      ctx.fillStyle = dl.color;
      ctx.fillText(dl.text, chatX + 12, my2, msgW);
    }

    // Thinking indicator
    if (this.game.chatThinking) {
      this.font(8); this.text('...', chatX + 12, msgH - 14, comp.color);
    }

    // Input field
    this.panel(chatX, msgH + 4, chatW, inputH, { fill: 'rgba(5,5,18,0.97)', border: comp.color });
    this.font(9);
    const cursor2 = this.game.timer % 40 < 20 ? '│' : '';
    this.text(this.game.chatInput + cursor2, chatX + 12, msgH + 30, C.P.WHITE, 'left', chatW - 24);
    this.font(7);
    this.text('Enter: Send   Tab: Switch   Esc: Close', chatX + chatW - 12, msgH + inputH - 6, '#303050', 'right');

    // Companion switcher tabs
    for (let i = 0; i < this.game.companions.length; i++) {
      const c2  = this.game.companions[i];
      const sel = i === this.game.companionSel;
      const tx  = chatX + i * 52;
      ctx.fillStyle = sel ? c2.color : '#1a1a30';
      ctx.fillRect(tx, msgH - 28, 48, 22);
      this.font(7, sel ? 'bold' : '');
      this.text(c2.name.slice(0, 4), tx + 24, msgH - 12, sel ? C.P.BLACK : C.P.GREY, 'center');
    }
  }

  // ---- GAME OVER ----
  renderGameOver() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    ctx.fillStyle = '#050005'; ctx.fillRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.6);
    vg.addColorStop(0, 'rgba(100,0,0,0.3)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    this.panel(W/2 - 260, H/2 - 130, 520, 260, { fill: 'rgba(5,0,10,0.97)', border: '#600010' });
    this.font(22, 'bold'); this.text('THE FELLOWSHIP FALLS', W/2, H/2 - 80, '#cc2020', 'center');
    this.font(9); this.text('The darkness claims another fellowship.', W/2, H/2 - 40, '#884444', 'center');
    if (this.game.player) {
      this.font(8);
      this.text(`${this.game.player.name} reached Level ${this.game.player.level}`, W/2, H/2 - 10, C.P.GREY, 'center');
      this.text(`${LOCATIONS[this.game.player.locationIdx]?.name || 'unknown lands'}`, W/2, H/2 + 14, C.P.GREY, 'center');
    }
    this.font(8); this.text('Press Enter to return to the title', W/2, H/2 + 70, '#604040', 'center');
  }

  // ---- VICTORY ----
  renderVictory() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;
    drawScene(ctx, 'millhaven', W, H, this.game.sceneTimer, this.game.ps);
    const vg2 = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
    vg2.addColorStop(0, 'rgba(200,180,60,0.3)'); vg2.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vg2; ctx.fillRect(0, 0, W, H);
    this.game.ps.draw(ctx);

    this.panel(W/2 - 300, H/2 - 160, 600, 320, { fill: 'rgba(5,5,10,0.95)', border: C.P.GOLD });
    this.font(20, 'bold'); this.text('THE LONG ROAD ENDS', W/2, H/2 - 110, C.P.GOLD, 'center');

    const gl = ctx.createLinearGradient(W/2 - 200, H/2 - 80, W/2 + 200, H/2 - 60);
    gl.addColorStop(0, '#ffe060'); gl.addColorStop(0.5, '#ffffff'); gl.addColorStop(1, '#ffc030');
    ctx.fillStyle = gl; ctx.textAlign = 'center';
    this.font(13);
    ctx.fillText('Malachar falls. The Scepter is broken.', W/2, H/2 - 70);
    ctx.fillText('The realm breathes free.', W/2, H/2 - 46);

    if (this.game.player) {
      this.font(9); this.text(`${this.game.player.name} — Level ${this.game.player.level} Ranger`, W/2, H/2 + 10, C.P.WHITE, 'center');
      this.font(8); this.text(`Gold: ${this.game.player.gold}  XP: ${this.game.player.xp}`, W/2, H/2 + 34, C.P.GOLD, 'center');
    }

    // Companion farewell lines
    const farewells = [
      { name: 'Miriel', text: '"Eight centuries. This is the best they ended."', color: '#c080ff' },
      { name: 'Brom',   text: '"Right! Now. Who\'s buying the first round?"',     color: '#e09060' },
      { name: 'Sera',   text: '"We did it. All of us. Together."',                color: '#80e0f0' },
      { name: 'Finn',   text: '"...I am definitely writing a song about this."',  color: '#b0e060' },
    ];
    for (let i = 0; i < farewells.length; i++) {
      const f = farewells[i];
      this.font(7); this.text(`${f.name}: ${f.text}`, W/2, H/2 + 68 + i * 18, f.color, 'center');
    }

    this.font(8); this.text('Press Enter to return to title', W/2, H/2 + 140, '#604030', 'center');
  }
}
