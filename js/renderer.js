// ============================================================
// RENDERER.JS - Canvas Rendering Engine
// ============================================================

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileSize = 32;
    this.scale = 2; // pixel scale for sprites (16px * 2 = 32px)
    this.cameraX = 0;
    this.cameraY = 0;
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.animFrame = 0;
    this.animTimer = 0;

    // UI layout
    this.sidebarWidth = 260;
    this.messageLogHeight = 160;

    this.ctx.imageSmoothingEnabled = false;

    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
    this.viewportWidth = Math.floor((this.canvas.width - this.sidebarWidth) / this.tileSize);
    this.viewportHeight = Math.floor((this.canvas.height - this.messageLogHeight) / this.tileSize);
  }

  render(game) {
    this.animTimer++;
    if (this.animTimer % 15 === 0) this.animFrame++;

    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    switch (game.state) {
      case GAME_STATES.TITLE:
        this.renderTitle(game);
        break;
      case GAME_STATES.CLASS_SELECT:
        this.renderClassSelect(game);
        break;
      case GAME_STATES.PLAYING:
      case GAME_STATES.LEVEL_UP:
        this.renderGame(game);
        if (game.state === GAME_STATES.LEVEL_UP) this.renderLevelUp(game);
        break;
      case GAME_STATES.INVENTORY:
        this.renderGame(game);
        this.renderInventory(game);
        break;
      case GAME_STATES.DIALOGUE:
        this.renderGame(game);
        this.renderDialogue(game);
        break;
      case GAME_STATES.COMBAT:
        this.renderGame(game);
        this.renderCombat(game);
        break;
      case GAME_STATES.SHOP:
        this.renderGame(game);
        this.renderShop(game);
        break;
      case GAME_STATES.GAME_OVER:
        this.renderGameOver(game);
        break;
      case GAME_STATES.VICTORY:
        this.renderVictory(game);
        break;
    }
  }

  // ---- TITLE SCREEN ----
  renderTitle(game) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Background
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Decorative border
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cx - 300, cy - 220, 600, 440);
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.strokeRect(cx - 296, cy - 216, 592, 432);

    // Title
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 42px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DUNGEONS', cx, cy - 140);
    this.ctx.fillText('OF', cx, cy - 90);
    this.ctx.fillText('ETHERMOOR', cx, cy - 40);

    // Subtitle
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.fillText('A Roguelike Adventure', cx, cy + 10);

    // Menu options
    const options = ['New Game', 'Controls'];
    for (let i = 0; i < options.length; i++) {
      const selected = i === game.titleSelection;
      this.ctx.fillStyle = selected ? '#FFD700' : '#888888';
      this.ctx.font = `${selected ? 'bold ' : ''}20px "Press Start 2P", monospace`;
      const y = cy + 70 + i * 50;
      this.ctx.fillText(options[i], cx, y);
      if (selected) {
        this.ctx.fillText('>', cx - 120, y);
        this.ctx.fillText('<', cx + 120, y);
      }
    }

    // Tip
    this.ctx.fillStyle = '#555555';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('Arrow keys to select, Enter to confirm', cx, cy + 190);

    // Animated torches
    const flicker = Math.sin(this.animTimer * 0.15) * 0.3 + 0.7;
    this.ctx.fillStyle = `rgba(255, 165, 0, ${flicker * 0.3})`;
    this.ctx.beginPath();
    this.ctx.arc(cx - 280, cy - 160, 30, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(cx + 280, cy - 160, 30, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // ---- CLASS SELECT ----
  renderClassSelect(game) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cx - 350, cy - 260, 700, 520);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Choose Your Class', cx, cy - 210);

    const classes = game.classOptions;
    for (let i = 0; i < classes.length; i++) {
      const cls = PLAYER_CLASSES[classes[i]];
      const selected = i === game.selectedMenuItem;
      const y = cy - 140 + i * 110;

      // Background highlight
      if (selected) {
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        this.ctx.fillRect(cx - 320, y - 15, 640, 100);
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.strokeRect(cx - 320, y - 15, 640, 100);
      }

      // Sprite
      const sprite = getSprite(cls.sprite, this.scale);
      if (sprite) {
        this.ctx.drawImage(sprite, cx - 300, y - 5);
      }

      // Name
      this.ctx.fillStyle = selected ? '#FFD700' : '#CCCCCC';
      this.ctx.font = `${selected ? 'bold ' : ''}16px "Press Start 2P", monospace`;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(cls.name, cx - 240, y + 12);

      // Stats
      this.ctx.fillStyle = '#888888';
      this.ctx.font = '10px "Press Start 2P", monospace';
      const stats = cls.stats;
      this.ctx.fillText(
        `STR:${stats.str} DEX:${stats.dex} CON:${stats.con} INT:${stats.int} WIS:${stats.wis} CHA:${stats.cha}`,
        cx - 240, y + 35
      );
      this.ctx.fillText(`HP: ${cls.hp + statModifier(stats.con)}  AC: ${cls.baseAC + statModifier(stats.dex)}  Ability: ${cls.abilities[0]}`, cx - 240, y + 55);
      this.ctx.fillText(`Attack: ${cls.attacks[0].name} (${cls.attacks[0].damage})`, cx - 240, y + 75);
    }

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#555555';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('Arrow keys to select, Enter to confirm, Esc to go back', cx, cy + 240);
  }

  // ---- MAIN GAME ----
  renderGame(game) {
    // Update camera
    this.cameraX = game.player.x - Math.floor(this.viewportWidth / 2);
    this.cameraY = game.player.y - Math.floor(this.viewportHeight / 2);

    // Screen shake
    let shakeX = 0, shakeY = 0;
    if (game.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * game.screenShake * 2;
      shakeY = (Math.random() - 0.5) * game.screenShake * 2;
    }

    // Render map
    const gameAreaWidth = this.canvas.width - this.sidebarWidth;
    const gameAreaHeight = this.canvas.height - this.messageLogHeight;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, gameAreaWidth, gameAreaHeight);
    this.ctx.clip();
    this.ctx.translate(shakeX, shakeY);

    this.renderMap(game, gameAreaWidth, gameAreaHeight);
    this.renderItems(game);
    this.renderNPCs(game);
    this.renderMonsters(game);
    this.renderPlayer(game);
    this.renderParticles(game);

    this.ctx.restore();

    // Flash effect
    if (game.flashDuration > 0) {
      this.ctx.fillStyle = game.flashColor + '33';
      this.ctx.fillRect(0, 0, gameAreaWidth, gameAreaHeight);
    }

    // UI
    this.renderSidebar(game, gameAreaWidth);
    this.renderMessageLog(game, gameAreaHeight);
    this.renderMinimap(game, gameAreaWidth);
  }

  renderMap(game, areaWidth, areaHeight) {
    const startX = Math.max(0, this.cameraX);
    const startY = Math.max(0, this.cameraY);
    const endX = Math.min(game.generator.width, this.cameraX + this.viewportWidth + 1);
    const endY = Math.min(game.generator.height, this.cameraY + this.viewportHeight + 1);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const screenX = (x - this.cameraX) * this.tileSize;
        const screenY = (y - this.cameraY) * this.tileSize;

        if (screenX < -this.tileSize || screenX > areaWidth || screenY < -this.tileSize || screenY > areaHeight) continue;

        const inFOV = game.fov[y][x];
        const explored = game.explored[y][x];

        if (!explored) continue;

        const tile = game.map[y][x];
        let spriteName = null;

        switch (tile) {
          case TILE.FLOOR: spriteName = 'tile_floor'; break;
          case TILE.WALL:
            // Check if wall has floor below it (render as wall_top)
            if (y + 1 < game.generator.height && (game.map[y+1][x] === TILE.FLOOR || game.map[y+1][x] === TILE.DOOR)) {
              spriteName = 'tile_wall_top';
            } else {
              spriteName = 'tile_wall';
            }
            break;
          case TILE.DOOR: spriteName = 'tile_door'; break;
          case TILE.STAIRS_DOWN: spriteName = 'tile_stairs_down'; break;
          case TILE.STAIRS_UP: spriteName = 'tile_stairs_up'; break;
          case TILE.CHEST: spriteName = 'tile_chest'; break;
        }

        if (spriteName) {
          const sprite = getSprite(spriteName, this.scale);
          if (sprite) {
            if (!inFOV) {
              this.ctx.globalAlpha = 0.35;
            }
            this.ctx.drawImage(sprite, screenX, screenY);
            this.ctx.globalAlpha = 1.0;
          }
        }
      }
    }
  }

  renderItems(game) {
    for (const item of game.items) {
      if (!game.fov[item.y] || !game.fov[item.y][item.x]) continue;
      const screenX = (item.x - this.cameraX) * this.tileSize;
      const screenY = (item.y - this.cameraY) * this.tileSize;
      const sprite = getSprite(item.sprite, this.scale);
      if (sprite) {
        // Slight bob animation
        const bob = Math.sin(this.animTimer * 0.08 + item.x * 3) * 2;
        this.ctx.drawImage(sprite, screenX, screenY + bob);
      }
    }
  }

  renderNPCs(game) {
    for (const npc of game.npcs) {
      if (!game.fov[npc.y] || !game.fov[npc.y][npc.x]) continue;
      const screenX = (npc.x - this.cameraX) * this.tileSize;
      const screenY = (npc.y - this.cameraY) * this.tileSize;
      const sprite = getSprite(npc.sprite, this.scale);
      if (sprite) {
        this.ctx.drawImage(sprite, screenX, screenY);
        // Name tag
        this.ctx.fillStyle = '#90EE90';
        this.ctx.font = '8px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(npc.name, screenX + this.tileSize / 2, screenY - 4);
        // Interaction hint
        const dist = Math.abs(npc.x - game.player.x) + Math.abs(npc.y - game.player.y);
        if (dist <= 1) {
          this.ctx.fillStyle = '#FFD700';
          this.ctx.fillText('[E] Talk', screenX + this.tileSize / 2, screenY - 16);
        }
      }
    }
  }

  renderMonsters(game) {
    for (const monster of game.monsters) {
      if (monster.isDead) continue;
      if (!game.fov[monster.y] || !game.fov[monster.y][monster.x]) continue;
      const screenX = (monster.x - this.cameraX) * this.tileSize;
      const screenY = (monster.y - this.cameraY) * this.tileSize;
      const sprite = getSprite(monster.sprite, this.scale);
      if (sprite) {
        this.ctx.drawImage(sprite, screenX, screenY);
        // HP bar
        if (monster.hp < monster.maxHp) {
          const barWidth = this.tileSize - 4;
          const barHeight = 3;
          const hpRatio = monster.hp / monster.maxHp;
          this.ctx.fillStyle = '#333333';
          this.ctx.fillRect(screenX + 2, screenY - 6, barWidth, barHeight);
          this.ctx.fillStyle = hpRatio > 0.5 ? '#32CD32' : hpRatio > 0.25 ? '#FFD700' : '#FF0000';
          this.ctx.fillRect(screenX + 2, screenY - 6, barWidth * hpRatio, barHeight);
        }
        // Boss indicator
        if (monster.isBoss) {
          this.ctx.fillStyle = '#FF0000';
          this.ctx.font = '8px "Press Start 2P", monospace';
          this.ctx.textAlign = 'center';
          const pulse = Math.sin(this.animTimer * 0.1) > 0;
          if (pulse) {
            this.ctx.fillText('BOSS', screenX + this.tileSize / 2, screenY - 10);
          }
        }
      }
    }
  }

  renderPlayer(game) {
    const screenX = (game.player.x - this.cameraX) * this.tileSize;
    const screenY = (game.player.y - this.cameraY) * this.tileSize;
    const sprite = getSprite(game.player.sprite, this.scale);
    if (sprite) {
      this.ctx.drawImage(sprite, screenX, screenY);
    }
  }

  renderParticles(game) {
    for (const p of game.particles) {
      const screenX = (p.x - this.cameraX) * this.tileSize + this.tileSize / 2;
      const screenY = (p.y - this.cameraY) * this.tileSize + p.offsetY;
      const alpha = p.duration / p.maxDuration;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.font = 'bold 12px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(p.text, screenX, screenY);
      this.ctx.globalAlpha = 1.0;
    }
  }

  // ---- SIDEBAR ----
  renderSidebar(game, gameAreaWidth) {
    const x = gameAreaWidth + 1;
    const w = this.sidebarWidth;
    const p = game.player;

    // Background
    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(x, 0, w, this.canvas.height);
    this.ctx.strokeStyle = '#333333';
    this.ctx.strokeRect(x, 0, w, this.canvas.height);

    let y = 15;
    this.ctx.textAlign = 'left';

    // Player info header
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 12px "Press Start 2P", monospace';
    this.ctx.fillText(p.classData.name, x + 10, y += 15);

    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText(`Level ${p.level}`, x + 10, y += 20);

    // HP Bar
    y += 15;
    this.ctx.fillStyle = '#888888';
    this.ctx.fillText('HP', x + 10, y);
    const hpBarX = x + 40;
    const hpBarW = w - 55;
    const hpRatio = p.hp / p.maxHp;
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(hpBarX, y - 9, hpBarW, 12);
    this.ctx.fillStyle = hpRatio > 0.5 ? '#32CD32' : hpRatio > 0.25 ? '#FFD700' : '#FF0000';
    this.ctx.fillRect(hpBarX, y - 9, hpBarW * hpRatio, 12);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText(`${p.hp}/${p.maxHp}`, hpBarX + 4, y - 1);

    // XP Bar
    y += 18;
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('XP', x + 10, y);
    const xpRatio = p.xp / p.xpToLevel;
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(hpBarX, y - 9, hpBarW, 12);
    this.ctx.fillStyle = '#4169E1';
    this.ctx.fillRect(hpBarX, y - 9, hpBarW * xpRatio, 12);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText(`${p.xp}/${p.xpToLevel}`, hpBarX + 4, y - 1);

    // Stats
    y += 25;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('-- Stats --', x + 10, y);

    const statColors = { str: '#FF6666', dex: '#66FF66', con: '#FFAA66', int: '#6666FF', wis: '#FF66FF', cha: '#66FFFF' };
    for (const [stat, val] of Object.entries(p.stats)) {
      y += 16;
      this.ctx.fillStyle = statColors[stat];
      this.ctx.fillText(`${stat.toUpperCase()}: ${val} (${statModifier(val) >= 0 ? '+' : ''}${statModifier(val)})`, x + 10, y);
    }

    // Equipment
    y += 25;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText('-- Equipment --', x + 10, y);
    y += 16;
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.fillText(`AC: ${p.getEffectiveAC()}`, x + 10, y);
    y += 16;
    this.ctx.fillText(`Wpn: ${p.weapon ? p.weapon.name : 'None'}`, x + 10, y);
    y += 16;
    this.ctx.fillText(`Arm: ${p.armor ? p.armor.name : 'None'}`, x + 10, y);

    // Gold
    y += 25;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`Gold: ${p.gold}`, x + 10, y);

    // Abilities
    y += 25;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText('-- Abilities --', x + 10, y);
    for (let i = 0; i < p.abilities.length; i++) {
      y += 16;
      const ability = p.abilities[i];
      const cd = p.abilityCooldowns[ability] || 0;
      this.ctx.fillStyle = cd > 0 ? '#666666' : '#87CEEB';
      this.ctx.fillText(`[${i+1}] ${ability}${cd > 0 ? ` (${cd})` : ''}`, x + 10, y);
    }

    // Dungeon info
    y += 25;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText('-- Dungeon --', x + 10, y);
    y += 16;
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.fillText(`Level: ${game.dungeonLevel}/${MAX_DUNGEON_LEVEL}`, x + 10, y);
    y += 16;
    this.ctx.fillText(`Kills: ${p.kills}`, x + 10, y);
    y += 16;
    this.ctx.fillText(`Turns: ${p.turnsPlayed}`, x + 10, y);

    // Controls reminder
    y += 30;
    this.ctx.fillStyle = '#555555';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('WASD/Arrows: Move', x + 10, y);
    y += 14;
    this.ctx.fillText('E: Interact', x + 10, y);
    y += 14;
    this.ctx.fillText('G: Pick up', x + 10, y);
    y += 14;
    this.ctx.fillText('I: Inventory', x + 10, y);
    y += 14;
    this.ctx.fillText('>: Descend stairs', x + 10, y);
    y += 14;
    this.ctx.fillText('1-4: Use ability', x + 10, y);
  }

  // ---- MESSAGE LOG ----
  renderMessageLog(game, gameAreaTop) {
    const logX = 0;
    const logY = gameAreaTop;
    const logW = this.canvas.width - this.sidebarWidth;
    const logH = this.messageLogHeight;

    this.ctx.fillStyle = '#0d0d0d';
    this.ctx.fillRect(logX, logY, logW, logH);
    this.ctx.strokeStyle = '#333333';
    this.ctx.strokeRect(logX, logY, logW, logH);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Message Log', logX + 10, logY + 15);

    const maxVisible = Math.floor((logH - 25) / 14);
    const startIdx = Math.max(0, game.messages.length - maxVisible);

    for (let i = startIdx; i < game.messages.length; i++) {
      const msg = game.messages[i];
      const my = logY + 30 + (i - startIdx) * 14;
      this.ctx.fillStyle = msg.color;
      this.ctx.font = '9px "Press Start 2P", monospace';
      this.ctx.fillText(msg.text, logX + 10, my, logW - 20);
    }
  }

  // ---- MINIMAP ----
  renderMinimap(game, gameAreaWidth) {
    const mmSize = 2;
    const mmX = gameAreaWidth - game.generator.width * mmSize - 15;
    const mmY = this.canvas.height - this.messageLogHeight - game.generator.height * mmSize - 15;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(mmX - 2, mmY - 2, game.generator.width * mmSize + 4, game.generator.height * mmSize + 4);

    for (let y = 0; y < game.generator.height; y++) {
      for (let x = 0; x < game.generator.width; x++) {
        if (!game.explored[y][x]) continue;
        const tile = game.map[y][x];
        const px = mmX + x * mmSize;
        const py = mmY + y * mmSize;

        if (tile === TILE.WALL) {
          this.ctx.fillStyle = game.fov[y][x] ? '#666666' : '#333333';
        } else if (tile === TILE.FLOOR || tile === TILE.DOOR) {
          this.ctx.fillStyle = game.fov[y][x] ? '#444444' : '#222222';
        } else if (tile === TILE.STAIRS_DOWN) {
          this.ctx.fillStyle = '#FFD700';
        } else if (tile === TILE.STAIRS_UP) {
          this.ctx.fillStyle = '#87CEEB';
        } else {
          continue;
        }
        this.ctx.fillRect(px, py, mmSize, mmSize);
      }
    }

    // NPCs on minimap
    for (const npc of game.npcs) {
      if (game.explored[npc.y][npc.x]) {
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(mmX + npc.x * mmSize, mmY + npc.y * mmSize, mmSize, mmSize);
      }
    }

    // Monsters on minimap (only in FOV)
    for (const m of game.monsters) {
      if (!m.isDead && game.fov[m.y] && game.fov[m.y][m.x]) {
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fillRect(mmX + m.x * mmSize, mmY + m.y * mmSize, mmSize, mmSize);
      }
    }

    // Player on minimap
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(mmX + game.player.x * mmSize, mmY + game.player.y * mmSize, mmSize + 1, mmSize + 1);
  }

  // ---- OVERLAY UIS ----
  drawPanel(cx, cy, w, h, title) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(cx - w/2, cy - h/2, w, h);
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cx - w/2, cy - h/2, w, h);
    this.ctx.strokeStyle = '#8B4513';
    this.ctx.strokeRect(cx - w/2 + 3, cy - h/2 + 3, w - 6, h - 6);

    if (title) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 14px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(title, cx, cy - h/2 + 25);
    }
  }

  renderInventory(game) {
    const cx = (this.canvas.width - this.sidebarWidth) / 2;
    const cy = (this.canvas.height - this.messageLogHeight) / 2;
    this.drawPanel(cx, cy, 450, 400, 'Inventory');

    const startY = cy - 150;
    for (let i = 0; i < game.player.inventory.length; i++) {
      const item = game.player.inventory[i];
      const selected = i === game.inventorySelection;
      const y = startY + i * 30;

      if (selected) {
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        this.ctx.fillRect(cx - 200, y - 12, 400, 26);
      }

      // Item sprite
      const sprite = getSprite(item.sprite, 1);
      if (sprite) {
        this.ctx.drawImage(sprite, cx - 195, y - 10, 20, 20);
      }

      this.ctx.fillStyle = selected ? '#FFD700' : '#CCCCCC';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.name, cx - 165, y + 2);

      this.ctx.fillStyle = '#888888';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(item.description, cx + 190, y + 2);
    }

    // Controls
    this.ctx.fillStyle = '#555555';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Enter: Use/Equip | X: Drop | I/Esc: Close', cx, cy + 180);
  }

  renderDialogue(game) {
    const cx = (this.canvas.width - this.sidebarWidth) / 2;
    const cy = (this.canvas.height - this.messageLogHeight) / 2;
    this.drawPanel(cx, cy, 550, 420, game.currentNpc ? game.currentNpc.fullName : 'Dialogue');

    const npc = game.currentNpc;
    if (!npc) return;

    // NPC sprite
    const sprite = getSprite(npc.sprite, 3);
    if (sprite) {
      this.ctx.drawImage(sprite, cx - 250, cy - 170);
    }

    // Race/title
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '9px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${npc.race}`, cx - 195, cy - 160);

    // Messages
    const msgStartY = cy - 130;
    const maxVisible = 8;
    const startIdx = Math.max(0, game.dialogueMessages.length - maxVisible);

    for (let i = startIdx; i < game.dialogueMessages.length; i++) {
      const msg = game.dialogueMessages[i];
      const y = msgStartY + (i - startIdx) * 32;
      const color = msg.role === 'player' ? '#87CEEB' : msg.role === 'system' ? '#666666' : '#FFFFFF';
      this.ctx.fillStyle = color;
      this.ctx.font = '9px "Press Start 2P", monospace';
      this.ctx.textAlign = 'left';

      // Word wrap
      const prefix = msg.role === 'player' ? 'You: ' : '';
      const text = prefix + msg.text;
      this.wrapText(text, cx - 250, y, 480, 14);
    }

    // Input field
    const inputY = cy + 160;
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(cx - 250, inputY, 500, 25);
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.strokeRect(cx - 250, inputY, 500, 25);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    const cursor = this.animFrame % 2 === 0 ? '_' : '';
    this.ctx.fillText(`> ${game.dialogueInput}${cursor}`, cx - 245, inputY + 17);

    // Controls
    this.ctx.fillStyle = '#555555';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    let controls = 'Type and Enter to chat | Esc: Close';
    if (npc.sells) controls += ' | T: Trade';
    if (npc.heals) controls += ' | H: Heal';
    this.ctx.fillText(controls, cx, cy + 200);
  }

  renderCombat(game) {
    const cx = (this.canvas.width - this.sidebarWidth) / 2;
    const cy = (this.canvas.height - this.messageLogHeight) / 2;
    this.drawPanel(cx, cy, 500, 450, 'COMBAT');

    const monster = game.currentMonster;
    if (!monster) return;

    // Monster sprite (large)
    const sprite = getSprite(monster.sprite, 4);
    if (sprite) {
      this.ctx.drawImage(sprite, cx - 32, cy - 190);
    }

    // Monster info
    this.ctx.fillStyle = monster.isBoss ? '#FF0000' : '#FF6666';
    this.ctx.font = 'bold 12px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(monster.name, cx, cy - 115);

    // Monster HP bar
    const barW = 200;
    const hpRatio = Math.max(0, monster.hp / monster.maxHp);
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(cx - barW/2, cy - 105, barW, 14);
    this.ctx.fillStyle = hpRatio > 0.5 ? '#32CD32' : hpRatio > 0.25 ? '#FFD700' : '#FF0000';
    this.ctx.fillRect(cx - barW/2, cy - 105, barW * hpRatio, 14);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText(`${Math.max(0, monster.hp)}/${monster.maxHp}`, cx, cy - 96);

    // Combat log
    const logY = cy - 75;
    const maxLogVisible = 5;
    const logStart = Math.max(0, game.combatLog.length - maxLogVisible);
    for (let i = logStart; i < game.combatLog.length; i++) {
      const entry = game.combatLog[i];
      this.ctx.fillStyle = entry.color;
      this.ctx.font = '9px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(entry.text, cx, logY + (i - logStart) * 18, 460);
    }

    // Actions
    const actY = cy + 50;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('-- Actions --', cx, actY);

    for (let i = 0; i < game.combatActions.length; i++) {
      const selected = i === game.combatAction;
      const y = actY + 20 + i * 22;
      this.ctx.fillStyle = selected ? '#FFD700' : '#888888';
      this.ctx.font = `${selected ? 'bold ' : ''}10px "Press Start 2P", monospace`;
      this.ctx.fillText(`${selected ? '> ' : '  '}${game.combatActions[i]}`, cx, y);
    }

    // Player HP
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    const php = game.player;
    this.ctx.fillText(`Your HP: ${php.hp}/${php.maxHp} | AC: ${php.getEffectiveAC()}`, cx, cy + 200);
  }

  renderShop(game) {
    const cx = (this.canvas.width - this.sidebarWidth) / 2;
    const cy = (this.canvas.height - this.messageLogHeight) / 2;
    this.drawPanel(cx, cy, 500, 400, 'Shop');

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Your Gold: ${game.player.gold}`, cx + 220, cy - 160);

    for (let i = 0; i < game.shopItems.length; i++) {
      const item = game.shopItems[i];
      const selected = i === game.shopSelection;
      const y = cy - 130 + i * 35;

      if (selected) {
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        this.ctx.fillRect(cx - 220, y - 12, 440, 30);
      }

      const sprite = getSprite(item.sprite, 1);
      if (sprite) {
        this.ctx.drawImage(sprite, cx - 210, y - 8, 20, 20);
      }

      this.ctx.fillStyle = selected ? '#FFD700' : '#CCCCCC';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.name, cx - 180, y + 5);

      this.ctx.fillStyle = '#888888';
      this.ctx.font = '9px "Press Start 2P", monospace';
      this.ctx.fillText(item.description, cx - 180, y + 20);

      const canAfford = game.player.gold >= item.value;
      this.ctx.fillStyle = canAfford ? '#FFD700' : '#FF4444';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${item.value}g`, cx + 210, y + 5);
    }

    this.ctx.fillStyle = '#555555';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Enter: Buy | Esc: Close', cx, cy + 180);
  }

  renderLevelUp(game) {
    const cx = (this.canvas.width - this.sidebarWidth) / 2;
    const cy = (this.canvas.height - this.messageLogHeight) / 2;
    this.drawPanel(cx, cy, 400, 200, 'LEVEL UP!');

    for (let i = 0; i < game.pendingLevelUpMessages.length; i++) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(game.pendingLevelUpMessages[i], cx, cy - 30 + i * 25, 360);
    }

    this.ctx.fillStyle = '#888888';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('Press Enter to continue', cx, cy + 70);
  }

  renderGameOver(game) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawPanel(cx, cy, 500, 350, '');

    this.ctx.fillStyle = '#FF0000';
    this.ctx.font = 'bold 32px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('YOU DIED', cx, cy - 100);

    if (game.player) {
      this.ctx.fillStyle = '#CCCCCC';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText(`Level ${game.player.level} ${game.player.classData.name}`, cx, cy - 50);
      this.ctx.fillText(`Dungeon Level: ${game.dungeonLevel}`, cx, cy - 25);
      this.ctx.fillText(`Monsters Slain: ${game.player.kills}`, cx, cy);
      this.ctx.fillText(`Gold Collected: ${game.player.gold}`, cx, cy + 25);
      this.ctx.fillText(`Turns Survived: ${game.player.turnsPlayed}`, cx, cy + 50);
    }

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('Press Enter to return to title', cx, cy + 120);
  }

  renderVictory(game) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = 'rgba(0, 100, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawPanel(cx, cy, 550, 400, '');

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 28px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('VICTORY!', cx, cy - 130);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '11px "Press Start 2P", monospace';
    this.ctx.fillText('You have defeated the Ethermoor Lich', cx, cy - 80);
    this.ctx.fillText('and claimed the Ethereal Crown!', cx, cy - 60);

    if (game.player) {
      this.ctx.fillStyle = '#CCCCCC';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText(`Level ${game.player.level} ${game.player.classData.name}`, cx, cy - 20);
      this.ctx.fillText(`Monsters Slain: ${game.player.kills}`, cx, cy + 10);
      this.ctx.fillText(`Gold Collected: ${game.player.gold}`, cx, cy + 40);
      this.ctx.fillText(`Turns Played: ${game.player.turnsPlayed}`, cx, cy + 70);
      this.ctx.fillText(`Dungeons Cleared: ${game.player.dungeonsCleared}`, cx, cy + 100);
    }

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('Press Enter to play again', cx, cy + 160);
  }

  // ---- UTILITY ----
  wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        this.ctx.fillText(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line.trim(), x, currentY);
  }
}
