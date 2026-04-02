// ============================================================
// SPRITES.JS — Draw-function sprites with procedural animation
// Each drawXxx(ctx, x, y, S, frame, state) draws a character
//   S     = pixel scale (1 unit = S pixels)
//   frame = animation counter (0..N)
//   state = 'idle'|'attack'|'hurt'|'cast'|'defend'|'dead'
// All coordinates are in "units"; multiply by S before drawing
// ============================================================

// --- shared drawing helpers that work in unit-space ---
function spr_rect(ctx, x, y, w, h, col, S) {
  ctx.fillStyle = col;
  ctx.fillRect((x*S)|0, (y*S)|0, (w*S)|0, (h*S)|0);
}
function spr_row(ctx, row, col_ranges, S, baseX=0, baseY=0) {
  // col_ranges: [[x, w, color], ...]
  for (const [cx, cw, color] of col_ranges) {
    spr_rect(ctx, baseX+cx, baseY+row, cw, 1, color, S);
  }
}

// Shared head-and-body structure at position (bx, by) in unit space
function drawHumanoid(ctx, bx, by, S, frame, state, opts) {
  const {
    skinColor   = C.P.SKIN,
    hairColor   = C.P.HAIR_BRN,
    bodyColor   = '#4060a0',
    legColor    = '#303070',
    armColor    = null,       // defaults to bodyColor
    accentColor = '#c0a030',
    eyeColor    = '#101010',
    extraFn     = null,       // draw extra gear (fn(ctx,bx,by,S))
    faceFn      = null,
    beard       = false,
    beardColor  = '#c08030',
    ears        = false,
    earColor    = null,
    hat         = false,
    hatColor    = '#2020a0',
    tall        = false,      // elf proportions
  } = opts;

  const arm = armColor || bodyColor;

  // Animation offsets
  let bobY   = 0;
  let lLegY  = 0, rLegY = 0;
  let lArmY  = 0, rArmY = 0;
  let leanX  = 0;

  if (state === 'idle') {
    bobY = Math.sin(frame * 0.18) * 0.4;
    lArmY = Math.sin(frame * 0.18) * 0.3;
    rArmY = -lArmY;
  } else if (state === 'walk') {
    bobY = Math.abs(Math.sin(frame * 0.35)) * 0.5;
    lLegY  = Math.sin(frame * 0.35) * 1.5;
    rLegY  = -lLegY;
    lArmY  = rLegY * 0.6;
    rArmY  = lLegY * 0.6;
  } else if (state === 'attack') {
    const t = (frame % 16) / 16;
    leanX = t < 0.4 ? t * 7 : (1-t) * 7 * (1/0.6);
    lArmY = -Math.sin(t * Math.PI) * 3;
  } else if (state === 'cast') {
    rArmY = -2 - Math.abs(Math.sin(frame * 0.25)) * 1.5;
    bobY  = Math.sin(frame * 0.15) * 0.5;
  } else if (state === 'hurt') {
    leanX = (frame % 6 < 3) ? -1.5 : 1.5;
  } else if (state === 'defend') {
    lArmY = 1; rArmY = 1;
  } else if (state === 'dead') {
    // Rotated — we'll fake it with a horizontal layout
    ctx.save();
    ctx.translate((bx + 5) * S, (by + 14) * S);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-5 * S, -7 * S);
    drawHumanoidParts(ctx, 0, 0, S, 0, 'idle', { ...opts, skipDead: true });
    ctx.globalAlpha = 0.5;
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(leanX * S, 0);
  drawHumanoidParts(ctx, bx, by + bobY, S, frame, state, opts, lLegY, rLegY, lArmY, rArmY);
  ctx.restore();
}

function drawHumanoidParts(ctx, bx, by, S, frame, state, opts, lLegY=0, rLegY=0, lArmY=0, rArmY=0) {
  const { skinColor=C.P.SKIN, hairColor=C.P.HAIR_BRN, bodyColor='#4060a0',
    legColor='#303070', armColor=null, accentColor='#c0a030', eyeColor='#101010',
    extraFn=null, faceFn=null, beard=false, beardColor='#c08030',
    ears=false, earColor=null, hat=false, hatColor='#2020a0', tall=false } = opts;

  const arm = armColor || bodyColor;

  // --- HEAD (3 wide, 3 tall at bx+3, by+0) ---
  spr_rect(ctx, bx+3, by+0, 4, 4, skinColor, S);       // head block
  if (hairColor) spr_rect(ctx, bx+3, by+0, 4, 1, hairColor, S); // hair top
  if (tall) spr_rect(ctx, bx+3, by-1, 4, 1, skinColor, S);      // taller elf head

  // eyes
  spr_rect(ctx, bx+4, by+1.5, 1, 0.8, eyeColor, S);
  spr_rect(ctx, bx+5.5, by+1.5, 1, 0.8, eyeColor, S);

  if (beard) spr_rect(ctx, bx+3.5, by+3, 3, 1.5, beardColor, S);
  if (ears)  {
    const ec = earColor || skinColor;
    spr_rect(ctx, bx+2.5, by+1, 1, 1.5, ec, S);
    spr_rect(ctx, bx+7, by+1, 1, 1.5, ec, S);
  }
  if (hat) {
    spr_rect(ctx, bx+2, by-2, 6, 2.5, hatColor, S);
    spr_rect(ctx, bx+1.5, by+0.2, 7, 0.8, hatColor, S); // brim
  }
  if (faceFn) faceFn(ctx, bx, by, S);

  // --- BODY (4 wide, 4 tall at bx+2.5, by+4) ---
  spr_rect(ctx, bx+2.5, by+4, 5, 4.5, bodyColor, S);
  spr_rect(ctx, bx+3, by+4, 4, 0.8, accentColor, S);   // collar/belt

  // --- ARMS ---
  // Left arm
  spr_rect(ctx, bx+0.5, by+4+lArmY, 2, 4, arm, S);
  spr_rect(ctx, bx+0.5, by+7.5+lArmY, 1.5, 1.5, skinColor, S); // hand
  // Right arm
  spr_rect(ctx, bx+7.5, by+4+rArmY, 2, 4, arm, S);
  spr_rect(ctx, bx+7.5, by+7.5+rArmY, 1.5, 1.5, skinColor, S); // hand

  // --- LEGS ---
  spr_rect(ctx, bx+2.5, by+8.5, 2, 4.5+lLegY, legColor, S);  // left leg
  spr_rect(ctx, bx+5.5, by+8.5, 2, 4.5+rLegY, legColor, S);  // right leg
  // Feet
  spr_rect(ctx, bx+2, by+12.5+lLegY, 2.5, 1, '#302010', S);
  spr_rect(ctx, bx+5.5, by+12.5+rLegY, 2.5, 1, '#302010', S);

  if (extraFn) extraFn(ctx, bx, by, S, frame, lArmY, rArmY);
}

// ============================================================
//  COMPANION DRAW FUNCTIONS
// ============================================================

function drawAldric(ctx, x, y, S, frame, state) {
  drawHumanoid(ctx, x, y, S, frame, state, {
    skinColor: C.P.SKIN,
    hairColor: C.P.HAIR_BRN,
    bodyColor: '#3a6030',    // ranger green
    legColor:  '#2a4020',
    accentColor: '#8a6030',
    eyeColor: '#3a2010',
    extraFn: (ctx, bx, by, S, fr, lAY, rAY) => {
      // Quiver on back
      spr_rect(ctx, bx+8, by+3, 1.5, 6, '#6a4020', S);
      // Cloak
      spr_rect(ctx, bx+1.5, by+4, 1.5, 5, '#3a5028', S);
      spr_rect(ctx, bx+7, by+4, 1.5, 5, '#3a5028', S);
      // Sword hilt on hip
      spr_rect(ctx, bx+7.5, by+7, 1, 3, '#888888', S);
      spr_rect(ctx, bx+7, by+7.5, 2, 0.8, '#c0a030', S);
      // In attack: sword swipe
      if (state === 'attack') {
        const t = (fr % 16) / 16;
        const swipeY = by + 5 - Math.sin(t * Math.PI) * 4;
        spr_rect(ctx, bx+9, swipeY, 0.8, 4, '#dddddd', S);
        spr_rect(ctx, bx+8.5, swipeY+3.5, 2.5, 0.8, '#c0a030', S); // crossguard
      }
    }
  });
}

function drawMiriel(ctx, x, y, S, frame, state) {
  drawHumanoid(ctx, x, y, S, frame, state, {
    skinColor: '#f8e8d0',    // pale elf
    hairColor: C.P.HAIR_SLV,
    bodyColor: '#4a1a8a',    // purple robes
    legColor:  '#3a0a7a',
    accentColor: '#c0a0e0',
    eyeColor: '#2040a0',     // blue eyes
    tall: true,
    ears: true,
    earColor: '#f8e8d0',
    hat: true,
    hatColor: '#3a1070',
    extraFn: (ctx, bx, by, S, fr, lAY, rAY) => {
      // Staff
      const staffY = by + rAY;
      spr_rect(ctx, bx+9, staffY+2, 0.8, 9, '#6a4820', S);
      // Staff orb — glows during cast
      const orbColor = state === 'cast'
        ? lerpHex('#a060ff', '#ffffff', Math.abs(Math.sin(fr * 0.2)))
        : '#8040c0';
      pxCircle(ctx, (bx+9.4)*S, (staffY+2)*S, 2.5*S, orbColor);
      // Robe flare
      spr_rect(ctx, bx+2, by+10, 6, 3, '#4a1a8a', S);
    }
  });
}

function drawBrom(ctx, x, y, S, frame, state) {
  // Dwarves are shorter and stockier
  const dy = 2; // shift down to account for shorter stature
  drawHumanoid(ctx, x, y+dy, S, frame, state, {
    skinColor: C.P.SKIN2,
    hairColor: C.P.HAIR_RED,
    bodyColor: '#707070',    // chainmail grey
    legColor:  '#505050',
    accentColor: '#c09030',
    eyeColor: '#301010',
    beard: true,
    beardColor: C.P.HAIR_RED,
    extraFn: (ctx, bx, by, S, fr, lAY, rAY) => {
      // Axe
      if (state === 'attack') {
        const t = (fr % 16) / 16;
        const ay = by + 3 - Math.sin(t * Math.PI) * 5;
        // Handle
        spr_rect(ctx, bx-1, ay+2, 1, 7, '#6a3010', S);
        // Axe head
        spr_rect(ctx, bx-2.5, ay, 2.5, 4, '#909090', S);
        spr_rect(ctx, bx-2.5, ay+3, 2.5, 3, '#808080', S);
      } else {
        spr_rect(ctx, bx-1, by+4+lAY, 1, 5, '#6a3010', S);
        spr_rect(ctx, bx-2.5, by+4+lAY, 2.5, 3, '#909090', S);
      }
      // Shield on back
      spr_rect(ctx, bx+8, by+4, 3, 5, '#707070', S);
      spr_rect(ctx, bx+9, by+5, 1.5, 3, '#c09030', S);
      // Helmet
      spr_rect(ctx, bx+3, by-1, 4, 1.5, '#808080', S);
      spr_rect(ctx, bx+2.5, by+0.2, 5, 0.8, '#909090', S);
    }
  });
}

function drawSeraphina(ctx, x, y, S, frame, state) {
  drawHumanoid(ctx, x, y, S, frame, state, {
    skinColor: '#f0d0b0',
    hairColor: '#d08030',    // warm auburn
    bodyColor: '#c0c0d0',    // white/silver robes
    legColor:  '#a0a0c0',
    accentColor: '#f0d040',
    eyeColor: '#204040',
    ears: true,
    earColor: '#f0d0b0',
    tall: true,
    extraFn: (ctx, bx, by, S, fr, lAY, rAY) => {
      // Holy symbol on chest
      spr_rect(ctx, bx+4.5, by+4.5, 1, 2, '#f0d040', S);
      spr_rect(ctx, bx+3.5, by+5.2, 3, 0.8, '#f0d040', S);
      // Healing glow during cast
      if (state === 'cast') {
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.abs(Math.sin(fr*0.2)) * 0.4;
        const grad = ctx.createRadialGradient((bx+5)*S, (by+7)*S, 0, (bx+5)*S, (by+7)*S, 25*S);
        grad.addColorStop(0, '#80ffb0');
        grad.addColorStop(1, '#80ffb000');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc((bx+5)*S, (by+7)*S, 25*S, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
      // Staff / mace
      spr_rect(ctx, bx-1, by+3+lAY, 0.8, 8, '#806020', S);
      pxCircle(ctx, (bx-0.6)*S, (by+3+lAY)*S, 1.8*S, '#f0d040');
    }
  });
}

function drawFinn(ctx, x, y, S, frame, state) {
  // Halflings are short — shift down
  const dy = 3;
  drawHumanoid(ctx, x, y+dy, S, frame, state, {
    skinColor: C.P.SKIN,
    hairColor: '#8a5010',    // curly brown
    bodyColor: '#5a7030',    // leather
    legColor:  '#3a4820',
    accentColor: '#c08030',
    eyeColor: '#402010',
    extraFn: (ctx, bx, by, S, fr, lAY, rAY) => {
      // Dagger
      if (state === 'attack') {
        const t = (fr % 12) / 12;
        spr_rect(ctx, bx+9, by+4+rAY-Math.sin(t*Math.PI)*3, 0.6, 3.5, '#d0d0d0', S);
        spr_rect(ctx, bx+8.2, by+7+rAY-Math.sin(t*Math.PI)*3, 2.2, 0.6, '#c0a030', S);
      } else {
        spr_rect(ctx, bx+9, by+5+rAY, 0.6, 3.5, '#c0c0c0', S);
      }
      // Cloak hood
      spr_rect(ctx, bx+3, by-1, 4, 1, '#3a4820', S);
      spr_rect(ctx, bx+2.5, by+0, 5, 1, '#3a4820', S);
      // Belt pouches
      spr_rect(ctx, bx+4, by+8, 2, 1.5, '#8a6020', S);
      spr_rect(ctx, bx+6, by+8, 1.5, 1.5, '#7a5020', S);
    }
  });
}

// ============================================================
//  ENEMY DRAW FUNCTIONS
// ============================================================

function drawGoblin(ctx, x, y, S, frame, state) {
  const dy = 3;
  drawHumanoid(ctx, x, y+dy, S, frame, state, {
    skinColor: '#508030',    // green skin
    hairColor: '#1a3010',
    bodyColor: '#503010',    // scrappy leather
    legColor:  '#301808',
    accentColor: '#808020',
    eyeColor: '#ff4000',
    extraFn: (ctx, bx, by, S) => {
      // Jagged ears
      spr_rect(ctx, bx+2, by+0.5, 1.5, 2, '#508030', S);
      spr_rect(ctx, bx+6.5, by+0.5, 1.5, 2, '#508030', S);
      // Crude knife
      spr_rect(ctx, bx+9, by+5, 0.8, 3.5, '#808080', S);
    }
  });
}

function drawOrc(ctx, x, y, S, frame, state) {
  drawHumanoid(ctx, x, y, S, frame, state, {
    skinColor: '#406030',
    hairColor: '#101010',
    bodyColor: '#604020',
    legColor:  '#402010',
    accentColor: '#806030',
    eyeColor: '#ff2000',
    beard: true,
    beardColor: '#101010',
    extraFn: (ctx, bx, by, S, fr, lAY) => {
      // Tusks
      spr_rect(ctx, bx+4, by+3.5, 0.8, 1.5, '#e0e0c0', S);
      spr_rect(ctx, bx+5.5, by+3.5, 0.8, 1.5, '#e0e0c0', S);
      // Great axe
      spr_rect(ctx, bx-1.5, by+3+lAY, 1, 9, '#6a3010', S);
      spr_rect(ctx, bx-4, by+2+lAY, 3.5, 5, '#909090', S);
    }
  });
}

function drawWarg(ctx, x, y, S, frame, state) {
  // Quadruped — completely custom
  const bobY = state === 'idle' ? Math.sin(frame*0.2)*0.3 : 0;
  const lunge = state === 'attack' ? (frame%12)/12 * 3 : 0;
  const bx = x, by = y + bobY;
  // Body
  spr_rect(ctx, bx+1, by+5, 10, 5, '#403020', S);
  // Head
  spr_rect(ctx, bx+8, by+3, 4, 4, '#403020', S);
  // Snout
  spr_rect(ctx, bx+11, by+5, 3, 2, '#352818', S);
  spr_rect(ctx, bx+12, by+4.5, 2, 0.8, '#c0c0c0', S); // teeth
  // Eyes
  spr_rect(ctx, bx+9, by+3.5, 1, 0.8, '#ff4000', S);
  spr_rect(ctx, bx+11, by+3.5, 1, 0.8, '#ff4000', S);
  // Legs
  spr_rect(ctx, bx+1.5, by+9, 2, 4, '#302010', S);
  spr_rect(ctx, bx+4.5, by+9, 2, 4, '#302010', S);
  spr_rect(ctx, bx+7.5, by+9, 2, 4, '#302010', S);
  spr_rect(ctx, bx+10, by+9, 2, 4, '#302010', S);
  // Tail
  spr_rect(ctx, bx-1, by+5, 2.5, 1.5, '#403020', S);
}

function drawTroll(ctx, x, y, S, frame, state) {
  // Bigger — uses scale internally
  drawHumanoid(ctx, x-2, y-4, S, frame, state, {
    skinColor: '#507058',
    hairColor: '#101810',
    bodyColor: '#303828',
    legColor:  '#202820',
    accentColor: '#606858',
    eyeColor: '#80ff00',
    extraFn: (ctx, bx, by, S) => {
      // Club
      spr_rect(ctx, bx-3, by+3, 2.5, 9, '#6a4010', S);
      spr_rect(ctx, bx-4.5, by+3, 5, 3, '#5a3008', S);
    }
  });
}

function drawWraith(ctx, x, y, S, frame, state) {
  const alpha = 0.7 + Math.sin(frame*0.15)*0.3;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawHumanoid(ctx, x, y, S, frame, state, {
    skinColor: '#1a1a2a',
    hairColor: null,
    bodyColor: '#0a0a1a',
    legColor:  '#050510',
    accentColor: '#4040a0',
    eyeColor: '#a000ff',
    hat: false,
    extraFn: (ctx, bx, by, S, fr) => {
      // Ghostly aura
      const gc = ctx.createRadialGradient((bx+5)*S,(by+8)*S,0,(bx+5)*S,(by+8)*S,20*S);
      gc.addColorStop(0,'#2020a060');
      gc.addColorStop(1,'#2020a000');
      ctx.fillStyle = gc;
      ctx.beginPath();
      ctx.arc((bx+5)*S,(by+8)*S,20*S,0,Math.PI*2);
      ctx.fill();
      // Floating effect — no feet
    }
  });
  ctx.restore();
}

function drawDragonKnight(ctx, x, y, S, frame, state) {
  drawHumanoid(ctx, x, y, S, frame, state, {
    skinColor: C.P.SKIN2,
    hairColor: '#101010',
    bodyColor: '#202020',    // black plate
    legColor:  '#181818',
    armColor:  '#282828',
    accentColor: '#800000',
    eyeColor: '#ff0000',
    extraFn: (ctx, bx, by, S, fr, lAY, rAY) => {
      // Helmet visor
      spr_rect(ctx, bx+3, by+0, 4, 4, '#202020', S);
      spr_rect(ctx, bx+3.5, by+1.5, 3, 1, '#ff000060', S); // eye slit (red)
      // Huge sword
      const sy = by+2+lAY;
      spr_rect(ctx, bx-1.5, sy, 1, 10, '#c0c0c0', S);
      spr_rect(ctx, bx-3, sy+1.5, 4, 1, '#c0a030', S);
      spr_rect(ctx, bx-1, sy-2, 0.8, 2.5, '#808080', S);
      // Cape
      spr_rect(ctx, bx+8, by+4, 2, 8, '#600000', S);
    }
  });
}

function drawLichLord(ctx, x, y, S, frame, state) {
  // Boss — bigger presence
  ctx.save();
  // Aura
  const pulse = 0.3 + Math.abs(Math.sin(frame*0.08))*0.4;
  const aura = ctx.createRadialGradient((x+5)*S,(y+8)*S,5*S,(x+5)*S,(y+8)*S,35*S);
  aura.addColorStop(0, `rgba(80,0,160,${pulse})`);
  aura.addColorStop(1, 'rgba(80,0,160,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc((x+5)*S,(y+8)*S,35*S,0,Math.PI*2);
  ctx.fill();

  drawHumanoid(ctx, x, y, S, frame, state, {
    skinColor: '#c0c0b0',    // bone
    hairColor: null,
    bodyColor: '#1a0030',
    legColor:  '#100020',
    accentColor: '#8000ff',
    eyeColor: '#ffffff',
    hat: true,
    hatColor: '#0a0020',
    extraFn: (ctx, bx, by, S, fr) => {
      // Crown
      spr_rect(ctx, bx+2.5, by-3, 5, 1.5, '#804000', S);
      spr_rect(ctx, bx+3, by-4.5, 1.2, 2, '#804000', S);
      spr_rect(ctx, bx+5.5, by-4.5, 1.2, 2, '#804000', S);
      spr_rect(ctx, bx+4.3, by-5.5, 1.2, 3, '#804000', S);
      // Gems on crown
      spr_rect(ctx, bx+4.5, by-5, 0.8, 0.8, '#ff00ff', S);
      // Staff (massive)
      spr_rect(ctx, bx-2, by+2, 1.2, 12, '#3a1050', S);
      pxCircle(ctx,(bx-1.4)*S,(by+2)*S,4*S,'#6000c0');
      pxCircle(ctx,(bx-1.4)*S,(by+2)*S,2*S,
        lerpHex('#8000ff','#ffffff',Math.abs(Math.sin(fr*0.12))));
      // Glowing eyes
      const eyePulse = 0.7 + Math.abs(Math.sin(fr*0.15))*0.3;
      ctx.save();
      ctx.globalAlpha = eyePulse;
      spr_rect(ctx, bx+4, by+1.5, 1.2, 0.8, '#ff00ff', S);
      spr_rect(ctx, bx+5.5, by+1.5, 1.2, 0.8, '#ff00ff', S);
      ctx.restore();
      // Bone collar
      spr_rect(ctx, bx+2.5, by+3.5, 5, 1, '#c0c0b0', S);
    }
  });
  ctx.restore();
}

// ============================================================
//  SPRITE REGISTRY
// ============================================================

const DRAW_FNS = {
  aldric:       drawAldric,
  miriel:       drawMiriel,
  brom:         drawBrom,
  seraphina:    drawSeraphina,
  finn:         drawFinn,
  goblin:       drawGoblin,
  orc:          drawOrc,
  warg:         drawWarg,
  troll:        drawTroll,
  wraith:       drawWraith,
  dragon_knight:drawDragonKnight,
  lich_lord:    drawLichLord,
};

// Draw a named sprite into an offscreen canvas or directly onto ctx
function drawSprite(ctx, name, x, y, S, frame, state = 'idle') {
  const fn = DRAW_FNS[name];
  if (!fn) { console.warn('Unknown sprite:', name); return; }
  ctx.save();
  fn(ctx, x, y, S, frame, state);
  ctx.restore();
}
