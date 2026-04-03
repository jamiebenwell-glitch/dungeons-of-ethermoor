// ============================================================
// SPRITES.JS — Procedural animated sprites
// FIX: drawSprite() uses ctx.translate(x,y) so all internal
//      drawing happens at (0,0) — no double-multiply of S.
//      Internal coords are UNIT space (×S = pixels).
// ============================================================

// Draw a unit-space rect (origin already translated by drawSprite)
function U(ctx, x, y, w, h, col, S) {
  if (!col) return;
  ctx.fillStyle = col;
  ctx.fillRect((x*S)|0, (y*S)|0, Math.max(1,(w*S)|0), Math.max(1,(h*S)|0));
}

// Outline rect
function UO(ctx, x, y, w, h, col, S) {
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1, S*0.4);
  ctx.strokeRect((x*S)|0+0.5, (y*S)|0+0.5, (w*S)|0, (h*S)|0);
}

// Circle in unit space
function UC(ctx, x, y, r, col, S) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc((x*S)|0, (y*S)|0, r*S, 0, Math.PI*2);
  ctx.fill();
}

// Glow circle
function UGlow(ctx, x, y, r, col, S) {
  const g = ctx.createRadialGradient(x*S, y*S, 0, x*S, y*S, r*S);
  g.addColorStop(0, col); g.addColorStop(1, col.slice(0,7)+'00');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x*S, y*S, r*S, 0, Math.PI*2); ctx.fill();
}

// ============================================================
//  HUMANOID BASE — all companions and many enemies share this
// ============================================================
function drawHumanoid(ctx, S, frame, state, opts) {
  const {
    skin      = '#f0c898',
    hair      = '#5a3010',
    body      = '#4060a0',
    legs      = '#303070',
    arms      = null,
    accent    = '#c0a030',
    eye       = '#101010',
    beard     = false,
    beardCol  = '#8a5020',
    ears      = false,
    earCol    = null,
    extraFn   = null,
  } = opts;
  const armCol = arms || body;

  // Animation
  let bobY=0, lLegY=0, rLegY=0, lArmY=0, rArmY=0, leanX=0;

  if (state === 'idle') {
    bobY  = Math.sin(frame*0.18)*0.35;
    lArmY = Math.sin(frame*0.18)*0.3;
    rArmY = -lArmY;
  } else if (state === 'walk') {
    bobY  = Math.abs(Math.sin(frame*0.35))*0.5;
    lLegY = Math.sin(frame*0.35)*1.4;
    rLegY = -lLegY;
    lArmY = rLegY*0.6; rArmY = lLegY*0.6;
  } else if (state === 'attack') {
    const t2 = (frame%18)/18;
    leanX = Math.sin(t2*Math.PI)*3;
    lArmY = -Math.sin(t2*Math.PI)*3;
    rArmY = lArmY*0.5;
  } else if (state === 'cast') {
    rArmY = -2.5 - Math.abs(Math.sin(frame*0.25))*1.5;
    bobY  = Math.sin(frame*0.12)*0.4;
  } else if (state === 'hurt') {
    leanX = (frame%6 < 3) ? -1.5 : 1.5;
    bobY  = 0.5;
  } else if (state === 'dead') {
    // Draw lying on side
    ctx.save();
    ctx.translate(5*S, 14*S);
    ctx.rotate(Math.PI/2);
    ctx.globalAlpha = 0.45;
    drawHumanoidParts(ctx, S, 0, 'idle', opts, 0,0,0,0, -5, -10);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(leanX*S, 0);
  drawHumanoidParts(ctx, S, frame, state, opts, lLegY, rLegY, lArmY, rArmY, 0, bobY);
  ctx.restore();
}

function drawHumanoidParts(ctx, S, frame, state, opts, lLegY,rLegY,lArmY,rArmY, bx, by) {
  const {
    skin='#f0c898', hair='#5a3010', body='#4060a0', legs='#303070',
    arms=null, accent='#c0a030', eye='#101010',
    beard=false, beardCol='#8a5020', ears=false, earCol=null, extraFn=null,
  } = opts;
  const armCol = arms||body;
  const bX = bx||0, bY = by||0;

  // Outline shadow for depth
  ctx.globalAlpha = 0.18;
  U(ctx, bX+1.5, bY+1, 8, 13.5, '#000000', S);
  ctx.globalAlpha = 1;

  // --- HEAD ---
  if (ears) {
    U(ctx, bX+1.8, bY+1.2, 1, 1.5, earCol||skin, S);
    U(ctx, bX+7.2, bY+1.2, 1, 1.5, earCol||skin, S);
  }
  U(ctx, bX+2.5, bY+0, 5, 4, skin, S);
  // hair
  if (hair) {
    U(ctx, bX+2.5, bY+0,   5, 1.2, hair, S);
    U(ctx, bX+2.5, bY+0,   1, 3,   hair, S); // sideburn left
    U(ctx, bX+6.5, bY+0,   1, 2,   hair, S); // sideburn right
  }
  // eyes
  U(ctx, bX+3.5, bY+1.8, 1, 0.8, eye, S);
  U(ctx, bX+5.5, bY+1.8, 1, 0.8, eye, S);
  // eye whites
  U(ctx, bX+3.2, bY+1.5, 1.6, 1.2, '#e8e8e8', S);
  U(ctx, bX+5.2, bY+1.5, 1.6, 1.2, '#e8e8e8', S);
  U(ctx, bX+3.7, bY+1.8, 0.9, 0.7, eye, S);
  U(ctx, bX+5.7, bY+1.8, 0.9, 0.7, eye, S);
  // nose
  U(ctx, bX+4.8, bY+2.4, 0.6, 0.6, skin, S);
  // mouth
  U(ctx, bX+3.8, bY+3.0, 2.4, 0.5, '#a06050', S);
  if (beard) {
    U(ctx, bX+2.8, bY+3.5, 4.4, 1.8, beardCol, S);
    U(ctx, bX+3.5, bY+5.0, 3, 1,   beardCol, S);
  }

  // --- NECK ---
  U(ctx, bX+4.2, bY+4, 1.6, 1, skin, S);

  // --- BODY ---
  U(ctx, bX+2, bY+5, 6, 5, body, S);
  U(ctx, bX+2, bY+5, 6, 1, accent, S);   // collar
  U(ctx, bX+2, bY+8.5, 6, 0.8, accent, S); // belt
  // body highlight
  ctx.globalAlpha = 0.15;
  U(ctx, bX+2.2, bY+5.2, 1.5, 3, '#ffffff', S);
  ctx.globalAlpha = 1;

  // --- ARMS ---
  U(ctx, bX+0,   bY+5+lArmY, 2.2, 4, armCol, S);  // left upper
  U(ctx, bX+0.2, bY+8.5+lArmY, 1.8, 1.5, skin, S); // left hand
  U(ctx, bX+7.8, bY+5+rArmY, 2.2, 4, armCol, S);  // right upper
  U(ctx, bX+8,   bY+8.5+rArmY, 1.8, 1.5, skin, S); // right hand

  // --- LEGS ---
  U(ctx, bX+2.2, bY+10,  2.2, 4.5+lLegY, legs, S);
  U(ctx, bX+5.6, bY+10,  2.2, 4.5+rLegY, legs, S);
  // boots
  U(ctx, bX+1.8, bY+14+lLegY, 3,   1.2, '#201008', S);
  U(ctx, bX+5.2, bY+14+rLegY, 3,   1.2, '#201008', S);
  // boot highlight
  ctx.globalAlpha = 0.2;
  U(ctx, bX+2,   bY+14+lLegY, 2,   0.5, '#ffffff', S);
  U(ctx, bX+5.4, bY+14+rLegY, 2,   0.5, '#ffffff', S);
  ctx.globalAlpha = 1;

  if (extraFn) extraFn(ctx, S, frame, state, lArmY, rArmY, bX, bY);
}

// ============================================================
//  COMPANIONS
// ============================================================
function drawAldric(ctx, S, frame, state) {
  drawHumanoid(ctx, S, frame, state, {
    skin: '#e8c080', hair: '#5a3010', body: '#3a5828', legs: '#2a3820',
    accent: '#8a6020', eye: '#3a2010',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Ranger cloak
      U(ctx, bX+1, bY+5,   1.5, 6, '#2a4018', S);
      U(ctx, bX+7.5, bY+5, 1.5, 6, '#2a4018', S);
      // Quiver
      U(ctx, bX+8.2, bY+3, 1.2, 5, '#6a3010', S);
      U(ctx, bX+8.4, bY+2.5, 0.8, 1, '#c0c060', S); // arrow fletch
      // Sword
      if (state === 'attack') {
        const t = (frame%18)/18;
        const sy = bY + 4 - Math.sin(t*Math.PI)*5;
        U(ctx, bX+9.5, sy+0.5, 0.7, 5, '#d0d8e0', S);
        U(ctx, bX+8.5, sy+4,   2.7, 0.7, '#c0a020', S); // crossguard
        // Blade shine
        ctx.globalAlpha = 0.4;
        U(ctx, bX+9.7, sy+0.5, 0.3, 3, '#ffffff', S);
        ctx.globalAlpha = 1;
      } else {
        U(ctx, bX+9, bY+7+rAY, 0.7, 4.5, '#b0b8c0', S);
        U(ctx, bX+8.2, bY+10.5+rAY, 2.2, 0.6, '#c0a020', S);
      }
    }
  });
}

function drawMiriel(ctx, S, frame, state) {
  drawHumanoid(ctx, S, frame, state, {
    skin: '#f8ecd8', hair: '#d0d8f0', body: '#4a1070', legs: '#350a60',
    accent: '#b080f0', eye: '#1030c0', ears: true, earCol: '#f8ecd8',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Tall elf ears (pointed)
      U(ctx, bX+1.2, bY+0.5, 1, 2.5, '#f8ecd8', S);
      U(ctx, bX+1.0, bY+0.5, 0.8, 0.8, '#f8ecd8', S); // tip
      U(ctx, bX+7.8, bY+0.5, 1, 2.5, '#f8ecd8', S);
      U(ctx, bX+8.2, bY+0.5, 0.8, 0.8, '#f8ecd8', S);
      // Mage hat
      U(ctx, bX+1.5, bY+0,   7, 1,   '#3a0860', S); // brim
      U(ctx, bX+3,   bY-3.5, 4, 4,   '#3a0860', S); // cone
      U(ctx, bX+3.5, bY-4.5, 3, 1.5, '#2a0650', S); // top
      // Star on hat
      U(ctx, bX+4.5, bY-2.5, 1, 1, '#e0c0ff', S);
      // Robe flare at bottom
      U(ctx, bX+1, bY+11, 8, 3.5, '#4a1070', S);
      // Staff
      const stY = bY + rAY;
      U(ctx, bX-1.2, stY+2, 0.9, 10, '#7a5030', S);
      if (state === 'cast') {
        const pulse = 0.5 + 0.5*Math.sin(frame*0.25);
        UGlow(ctx, bX-0.7, stY+1.8, 3, `rgba(180,100,255,${pulse})`, S);
        UC(ctx, bX-0.7, stY+1.8, 1.5, '#d0a0ff', S);
        UC(ctx, bX-0.7, stY+1.8, 0.8, '#ffffff', S);
      } else {
        UC(ctx, bX-0.7, stY+1.8, 1.5, '#8040c0', S);
        UC(ctx, bX-0.7, stY+1.8, 0.6, '#c080ff', S);
      }
    }
  });
}

function drawBrom(ctx, S, frame, state) {
  // Dwarves — stockier, offset down
  ctx.save();
  ctx.translate(0, 2*S);
  drawHumanoid(ctx, S, frame, state, {
    skin: '#c87840', hair: '#a03010', body: '#686868', legs: '#484848',
    accent: '#c09030', eye: '#301010', beard: true, beardCol: '#a03010',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Helmet
      U(ctx, bX+2,   bY-1.2, 6,  1.8, '#787878', S);
      U(ctx, bX+1.5, bY+0.2, 7,  0.8, '#888888', S); // brim
      U(ctx, bX+4.5, bY-1.2, 1,  1,   '#c09030', S); // crest
      // Chain detail on body
      ctx.globalAlpha = 0.3;
      for (let i=0; i<3; i++) U(ctx, bX+2.2+i*1.8, bY+6, 1.5, 3, '#aaaaaa', S);
      ctx.globalAlpha = 1;
      // Axe
      if (state === 'attack') {
        const t = (frame%18)/18;
        const ay = bY+2 - Math.sin(t*Math.PI)*5;
        U(ctx, bX-1.5, ay+2,  1, 8, '#6a3010', S); // handle
        U(ctx, bX-4,   ay,    3.5, 5.5, '#909090', S); // head
        U(ctx, bX-4,   ay+3,  3.5, 2.5, '#787878', S); // head bottom
        ctx.globalAlpha = 0.3; U(ctx, bX-3.8, ay, 1, 4, '#ffffff', S); ctx.globalAlpha=1;
      } else {
        U(ctx, bX-1.5, bY+4+lAY, 1, 7, '#6a3010', S);
        U(ctx, bX-4,   bY+4+lAY, 3.5, 5, '#909090', S);
      }
      // Shield
      U(ctx, bX+8.5, bY+5, 3, 5.5, '#686868', S);
      U(ctx, bX+9,   bY+6, 2, 3.5, '#c09030', S);
      UC(ctx, bX+9.8, bY+7.5, 0.8, '#f0e0a0', S);
    }
  });
  ctx.restore();
}

function drawSeraphina(ctx, S, frame, state) {
  drawHumanoid(ctx, S, frame, state, {
    skin: '#f0d8b0', hair: '#c06828', body: '#d8d8e8', legs: '#a8a8c8',
    accent: '#f0d030', eye: '#206050', ears: true, earCol: '#f0d8b0',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Pointed elf ears (half-elf, shorter)
      U(ctx, bX+1.5, bY+0.8, 0.8, 1.8, '#f0d8b0', S);
      U(ctx, bX+7.7, bY+0.8, 0.8, 1.8, '#f0d8b0', S);
      // Holy symbol
      U(ctx, bX+4.5, bY+5.5, 1, 2.5, '#f0d030', S); // vertical
      U(ctx, bX+3.5, bY+6.5, 3, 0.8, '#f0d030', S); // horizontal
      // Healing aura when casting
      if (state === 'cast') {
        const pulse = 0.3+0.4*Math.abs(Math.sin(frame*0.18));
        UGlow(ctx, bX+5, bY+7, 6, `rgba(100,255,160,${pulse})`, S);
        ctx.globalAlpha = pulse*0.6;
        U(ctx, bX+1, bY+4, 8, 8, '#80ffb0', S);
        ctx.globalAlpha = 1;
      }
      // Mace / staff
      U(ctx, bX-1, bY+3+lAY, 0.9, 9, '#8a6020', S);
      UC(ctx, bX-0.5, bY+3+lAY, 1.8, '#f0d030', S);
      UC(ctx, bX-0.5, bY+3+lAY, 1,   '#ffffff', S);
    }
  });
}

function drawFinn(ctx, S, frame, state) {
  ctx.save();
  ctx.translate(0, 3*S); // halflings are shorter
  drawHumanoid(ctx, S, frame, state, {
    skin: '#e8b870', hair: '#7a4010', body: '#5a6830', legs: '#384018',
    accent: '#c08020', eye: '#402010',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Hooded cloak
      U(ctx, bX+2, bY-1,  6, 1.5, '#384020', S); // hood peak
      U(ctx, bX+1.5, bY+0, 7, 1,  '#384020', S); // hood rim
      // Belt pouches
      U(ctx, bX+4, bY+9, 2, 1.5, '#8a6020', S);
      U(ctx, bX+6, bY+9, 1.5, 1.5, '#7a5018', S);
      // Dagger
      if (state === 'attack') {
        const t = (frame%12)/12;
        const dy = bY + 4 - Math.sin(t*Math.PI)*4;
        U(ctx, bX+9.5, dy, 0.6, 4, '#d0d8e0', S);
        U(ctx, bX+8.8, dy+3.5, 2.2, 0.6, '#c0a020', S);
      } else {
        U(ctx, bX+9, bY+6+rAY, 0.6, 3.5, '#b0b8c0', S);
        U(ctx, bX+8.3, bY+9+rAY, 2, 0.5, '#c0a020', S);
      }
      // Curly hair detail
      UC(ctx, bX+4.5, bY+0.8, 0.8, '#7a4010', S);
      UC(ctx, bX+6,   bY+0.5, 0.8, '#7a4010', S);
    }
  });
  ctx.restore();
}

// ============================================================
//  ENEMIES
// ============================================================
function drawGoblin(ctx, S, frame, state) {
  ctx.save(); ctx.translate(0, 3*S);
  drawHumanoid(ctx, S, frame, state, {
    skin: '#508030', hair: '#1a2808', body: '#503010', legs: '#301808',
    accent: '#808020', eye: '#ff4000',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Big pointy ears
      U(ctx, bX+0.5, bY-0.5, 2, 3, '#508030', S);
      U(ctx, bX+7.5, bY-0.5, 2, 3, '#508030', S);
      // Crude knife
      U(ctx, bX+9.2, bY+5+rAY, 0.8, 4, '#888080', S);
      U(ctx, bX+8.5, bY+8.5+rAY, 2, 0.5, '#808080', S);
      // Warty nose
      UC(ctx, bX+4.8, bY+2.5, 0.8, '#407028', S);
    }
  });
  ctx.restore();
}

function drawOrc(ctx, S, frame, state) {
  drawHumanoid(ctx, S, frame, state, {
    skin: '#406030', hair: '#101010', body: '#604020', legs: '#402010',
    accent: '#806030', eye: '#ff2000', beard: true, beardCol: '#101010',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Tusks
      U(ctx, bX+3.5, bY+3.5, 0.8, 2, '#e0e0c0', S);
      U(ctx, bX+5.7, bY+3.5, 0.8, 2, '#e0e0c0', S);
      // Great axe
      U(ctx, bX-2, bY+3+lAY, 1.2, 10, '#6a2808', S);
      U(ctx, bX-5,   bY+2+lAY, 4, 6,   '#909090', S);
      U(ctx, bX-4.5, bY+7+lAY, 3, 2.5, '#787878', S);
      ctx.globalAlpha=0.3; U(ctx, bX-4.8, bY+2+lAY, 1.5, 5, '#ffffff', S); ctx.globalAlpha=1;
      // Armour plates
      U(ctx, bX+2, bY+5, 6, 5, '#503520', S);
      U(ctx, bX+2.5, bY+5.5, 5, 4, '#604020', S);
    }
  });
}

function drawWarg(ctx, S, frame, state) {
  const bob = state==='idle' ? Math.sin(frame*0.2)*0.4 : 0;
  const lunge = state==='attack' ? (frame%14)/14*2 : 0;
  // Body
  U(ctx, 1+lunge, 5+bob,  11, 5.5, '#3a2818', S);
  // Head
  U(ctx, 9+lunge, 3+bob,  5,  5,   '#3a2818', S);
  // Snout
  U(ctx, 12.5+lunge, 5+bob, 3.5, 2.2, '#2a1c10', S);
  // Teeth
  U(ctx, 13+lunge, 4.5+bob, 2.5, 0.8, '#d8d8c0', S);
  // Eyes
  U(ctx, 10+lunge, 3.8+bob, 1.2, 1, '#ff3000', S);
  U(ctx, 12+lunge, 3.8+bob, 1.2, 1, '#ff3000', S);
  ctx.globalAlpha=0.5; U(ctx, 10.2+lunge, 3.8+bob, 0.5, 0.7, '#ffff00', S); ctx.globalAlpha=1;
  // Legs
  [[1.5,9],[4,9],[7,9],[10,9]].forEach(([lx,ly])=>{
    U(ctx, lx+lunge*0.5, ly+bob, 2, 4.5, '#2a1c10', S);
    U(ctx, lx-0.2+lunge*0.5, ly+4+bob, 2.4, 1, '#1a0e08', S);
  });
  // Tail
  U(ctx, 0, 5+bob, 2, 1.5, '#3a2818', S);
  // Fur texture
  ctx.globalAlpha=0.15;
  U(ctx, 2, 5+bob, 2, 4, '#604030', S);
  U(ctx, 5, 5+bob, 2, 4, '#604030', S);
  ctx.globalAlpha=1;
}

function drawTroll(ctx, S, frame, state) {
  ctx.save(); ctx.scale(1.3, 1.3); // larger
  drawHumanoid(ctx, S, frame, state, {
    skin: '#507058', hair: '#101810', body: '#303828', legs: '#202820',
    accent: '#606858', eye: '#80ff00',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Club
      U(ctx, bX-3, bY+2+lAY, 2.5, 10, '#6a3808', S);
      U(ctx, bX-4.5, bY+2+lAY, 5, 4, '#5a2e08', S);
      // Spikes on club
      U(ctx, bX-4.2, bY+2.5+lAY, 0.8, 1, '#808070', S);
      U(ctx, bX-2, bY+2.2+lAY, 0.8, 1, '#808070', S);
      // Rocky skin texture
      ctx.globalAlpha=0.2;
      U(ctx, bX+3, bY+6, 2, 2, '#308050', S);
      U(ctx, bX+5, bY+8, 2, 2, '#308050', S);
      ctx.globalAlpha=1;
    }
  });
  ctx.restore();
}

function drawWraith(ctx, S, frame, state) {
  const alpha = 0.65 + Math.sin(frame*0.12)*0.25;
  ctx.save(); ctx.globalAlpha = alpha;
  drawHumanoid(ctx, S, frame, state, {
    skin: '#181828', hair: null, body: '#080818', legs: '#040410',
    accent: '#3030a0', eye: '#a000ff',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Ghostly aura
      UGlow(ctx, bX+5, bY+8, 7, `rgba(30,30,150,0.6)`, S);
      // Robe fades at bottom (transparent)
      const fade = ctx.createLinearGradient(0, (bY+11)*S, 0, (bY+17)*S);
      fade.addColorStop(0,'rgba(8,8,24,0.9)'); fade.addColorStop(1,'rgba(8,8,24,0)');
      ctx.fillStyle=fade; ctx.fillRect((bX+1.5)*S, (bY+11)*S, 7*S, 6*S);
      // Spirit tendrils
      ctx.globalAlpha=0.3;
      U(ctx, bX+3, bY+15, 1, 2, '#2020a0', S);
      U(ctx, bX+5, bY+16, 1, 2, '#2020a0', S);
      U(ctx, bX+7, bY+15, 1, 2, '#2020a0', S);
      ctx.globalAlpha=1;
    }
  });
  ctx.restore();
}

function drawDragonKnight(ctx, S, frame, state) {
  drawHumanoid(ctx, S, frame, state, {
    skin: '#c08060', hair: '#101010', body: '#181818', legs: '#101010',
    arms: '#202020', accent: '#800000', eye: '#ff0000',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Full helmet
      U(ctx, bX+2, bY-0.5, 6, 5.5, '#1e1e1e', S);
      U(ctx, bX+2.5, bY+1.5, 5, 1, '#ff000030', S); // eye slit glow
      ctx.globalAlpha=0.7;
      U(ctx, bX+3, bY+1.8, 4, 0.6, '#ff0000', S);
      ctx.globalAlpha=1;
      // Crest
      U(ctx, bX+4.5, bY-1.5, 1, 2, '#800000', S);
      // Great sword
      const sy = bY+2+lAY;
      U(ctx, bX-2, sy, 1, 12, '#c0c8d0', S); // blade
      U(ctx, bX-3.5, sy+2, 4, 1, '#c0a020', S); // crossguard
      U(ctx, bX-1.6, sy-1.5, 0.6, 2, '#808888', S); // pommel
      ctx.globalAlpha=0.4; U(ctx, bX-1.8, sy, 0.5, 9, '#ffffff', S); ctx.globalAlpha=1;
      // Cape
      U(ctx, bX+8, bY+5, 2.5, 9, '#600000', S);
      U(ctx, bX+7, bY+8, 2, 6, '#500000', S);
      // Shoulder plates
      U(ctx, bX+0,   bY+4, 2.5, 2, '#282828', S);
      U(ctx, bX+7.5, bY+4, 2.5, 2, '#282828', S);
    }
  });
}

function drawLichLord(ctx, S, frame, state) {
  // Aura first (behind body)
  const pulse = 0.3+0.5*Math.abs(Math.sin(frame*0.08));
  UGlow(ctx, 5, 9, 10, `rgba(90,0,180,${pulse})`, S);

  drawHumanoid(ctx, S, frame, state, {
    skin: '#c8c8b0', hair: null, body: '#120020', legs: '#0a0018',
    accent: '#7000e0', eye: '#ff00ff',
    extraFn(ctx, S, frame, state, lAY, rAY, bX, bY) {
      // Bone skull face
      U(ctx, bX+2.5, bY+0, 5, 4, '#c8c8b0', S); // skull
      U(ctx, bX+3,   bY+0.5, 1.2, 0.8, '#c8c8b0', S); // zygomatic
      U(ctx, bX+5.8, bY+0.5, 1.2, 0.8, '#c8c8b0', S);
      // Dark eye sockets
      U(ctx, bX+3.2, bY+1.2, 1.6, 1.6, '#000000', S);
      U(ctx, bX+5.2, bY+1.2, 1.6, 1.6, '#000000', S);
      // Glowing eyes in sockets
      const ep = 0.5+0.5*Math.abs(Math.sin(frame*0.15));
      ctx.globalAlpha=ep;
      U(ctx, bX+3.5, bY+1.5, 1, 1, '#ff00ff', S);
      U(ctx, bX+5.5, bY+1.5, 1, 1, '#ff00ff', S);
      ctx.globalAlpha=1;
      // Crown
      U(ctx, bX+2, bY-1, 6, 1.5, '#804000', S);
      U(ctx, bX+2.8, bY-2.5, 1.2, 2, '#804000', S);
      U(ctx, bX+5,   bY-3.5, 1.2, 3, '#804000', S);
      U(ctx, bX+7,   bY-2.5, 1.2, 2, '#804000', S);
      // Crown gems
      U(ctx, bX+3.2, bY-2, 0.8, 0.8, '#ff00ff', S);
      U(ctx, bX+5.4, bY-3, 0.8, 0.8, '#ff80ff', S);
      U(ctx, bX+7.2, bY-2, 0.8, 0.8, '#ff00ff', S);
      // Robe voluminous
      U(ctx, bX+1, bY+10, 8, 5, '#120020', S);
      U(ctx, bX+0, bY+12, 10, 4, '#120020', S);
      // Staff of damnation
      U(ctx, bX-2, bY+1, 1, 13, '#3a0850', S);
      UGlow(ctx, bX-1.5, bY+1, 3, `rgba(150,0,255,${pulse})`, S);
      UC(ctx, bX-1.5, bY+1, 2, '#8000ff', S);
      UC(ctx, bX-1.5, bY+1, 1, lerpHex('#8000ff','#ffffff',pulse), S);
      // Floating particles around him
      ctx.globalAlpha=0.4;
      for (let i=0; i<3; i++) {
        const angle = frame*0.05 + i*(Math.PI*2/3);
        const px = bX+5 + Math.cos(angle)*4;
        const py = bY+8 + Math.sin(angle)*3;
        UC(ctx, px, py, 0.6, '#c040ff', S);
      }
      ctx.globalAlpha=1;
    }
  });
}

// ============================================================
//  REGISTRY + ENTRY POINT
// ============================================================
const DRAW_FNS = {
  aldric:        drawAldric,
  miriel:        drawMiriel,
  brom:          drawBrom,
  seraphina:     drawSeraphina,
  finn:          drawFinn,
  goblin:        drawGoblin,
  orc:           drawOrc,
  warg:          drawWarg,
  troll:         drawTroll,
  wraith:        drawWraith,
  dragon_knight: drawDragonKnight,
  lich_lord:     drawLichLord,
};

// THE KEY FIX: translate context to pixel position,
// then draw all sprite internals relative to (0,0)
function drawSprite(ctx, name, x, y, S, frame, state = 'idle') {
  const fn = DRAW_FNS[name];
  if (!fn) return;
  ctx.save();
  ctx.translate(x|0, y|0);   // position in pixel space
  fn(ctx, S, frame, state);   // draw at origin in unit space
  ctx.restore();
}
