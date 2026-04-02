// ============================================================
// SCENE.JS — Animated background renderers for each location
// Each drawScene_X(ctx, w, h, t, ps) takes:
//   ctx = canvas context
//   w,h = dimensions
//   t   = animation timer (incrementing integer)
//   ps  = ParticleSystem (for ambient particles)
// ============================================================

const SCENES = {
  millhaven:   drawScene_millhaven,
  whisperwood: drawScene_whisperwood,
  frostpeak:   drawScene_frostpeak,
  sunken_city: drawScene_sunken_city,
  dreadmoor:   drawScene_dreadmoor,
  citadel:     drawScene_citadel,
  camp:        drawScene_camp,
  title:       drawScene_title,
};

function drawScene(ctx, locationId, w, h, t, ps) {
  const fn = SCENES[locationId] || drawScene_millhaven;
  fn(ctx, w, h, t, ps);
}

// ---- Shared drawing helpers ----
function sky(ctx, w, h, top, bot) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

function ground(ctx, w, h, y, col, layers = []) {
  ctx.fillStyle = col;
  ctx.fillRect(0, y, w, h - y);
  for (const [ly, lh, lc] of layers) {
    ctx.fillStyle = lc;
    ctx.fillRect(0, y + ly, w, lh);
  }
}

function stars(ctx, w, h, t, count = 80) {
  ctx.fillStyle = '#ffffff';
  const rand = (n) => { // seeded pseudo-random
    let x = Math.sin(n*127.1)*43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < count; i++) {
    const sx = rand(i*3) * w;
    const sy = rand(i*3+1) * h * 0.6;
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.05 + rand(i*3+2) * 10));
    ctx.globalAlpha = twinkle * 0.8;
    ctx.fillRect(sx|0, sy|0, 1 + (rand(i*3+2) > 0.8 ? 1 : 0), 1);
  }
  ctx.globalAlpha = 1;
}

function mountain(ctx, x, y, w, h, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w/2, y);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function tree(ctx, x, y, S, col = '#2a5a20', trunkCol = '#5a3010') {
  // trunk
  ctx.fillStyle = trunkCol;
  ctx.fillRect(x + S*1.5, y + S*4, S, S*3);
  // canopy layers
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y + S*5); ctx.lineTo(x+S*2, y); ctx.lineTo(x+S*4, y+S*5);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x+S*0.5, y+S*4); ctx.lineTo(x+S*2, y+S*1.5); ctx.lineTo(x+S*3.5, y+S*4);
  ctx.closePath(); ctx.fill();
}

function building(ctx, x, y, w, h, wallCol, roofCol) {
  ctx.fillStyle = wallCol;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = roofCol;
  ctx.beginPath();
  ctx.moveTo(x-4, y); ctx.lineTo(x+w/2, y-h*0.4); ctx.lineTo(x+w+4, y);
  ctx.closePath(); ctx.fill();
}

function drawWater(ctx, x, y, w, h, col, t) {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
  // ripple lines
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  for (let wy = y+8; wy < y+h; wy += 12) {
    ctx.beginPath();
    for (let wx = x; wx < x+w; wx += 4) {
      const oy = Math.sin((wx + t*1.5) * 0.08) * 2;
      wx === x ? ctx.moveTo(wx, wy + oy) : ctx.lineTo(wx, wy + oy);
    }
    ctx.stroke();
  }
}

function fog(ctx, w, h, yStart, alpha, t) {
  const g = ctx.createLinearGradient(0, yStart, 0, h);
  g.addColorStop(0, `rgba(180,200,180,0)`);
  g.addColorStop(0.5, `rgba(180,200,180,${alpha})`);
  g.addColorStop(1, `rgba(180,200,180,${alpha})`);
  ctx.fillStyle = g;
  // Animated fog blobs
  for (let i = 0; i < 5; i++) {
    const bx = (i * 200 + t * 0.3) % (w + 100) - 50;
    const by = yStart + 20 + i * 15;
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = 'rgba(160,200,160,0.6)';
    ctx.beginPath();
    ctx.ellipse(bx, by, 120, 30, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, yStart, w, h - yStart);
}

// ============================================================
// 1. MILLHAVEN — Warm village at dawn
// ============================================================
function drawScene_millhaven(ctx, w, h, t, ps) {
  // Dawn sky
  sky(ctx, w, h, '#1a1040', '#c87040');
  // Horizon glow
  const glow = ctx.createLinearGradient(0, h*0.5, 0, h*0.7);
  glow.addColorStop(0, 'rgba(255,180,80,0.4)');
  glow.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, h*0.35, w, h*0.35);
  // Far mountains
  ctx.globalAlpha = 0.4;
  mountain(ctx, -40, h*0.35, 280, h*0.35, '#303050');
  mountain(ctx, 160, h*0.28, 240, h*0.42, '#383560');
  mountain(ctx, 380, h*0.32, 300, h*0.38, '#282840');
  ctx.globalAlpha = 1;
  // Ground
  ground(ctx, w, h, h*0.65, '#3a5020',
    [[0, 8, '#2a4018'], [8, 4, '#4a6028']]);
  // Cobblestone path
  ctx.fillStyle = '#706858';
  ctx.fillRect(w*0.35, h*0.65, w*0.3, h*0.35);
  for (let cy = h*0.67; cy < h; cy += 14) {
    for (let cx = w*0.36; cx < w*0.64; cx += 18) {
      ctx.fillStyle = '#80786a';
      ctx.fillRect(cx, cy, 16, 12);
      ctx.fillStyle = '#606050';
      ctx.fillRect(cx+1, cy+1, 14, 10);
    }
  }
  // Buildings (background)
  building(ctx, w*0.05, h*0.38, 120, h*0.27, '#a08060', '#704030');
  building(ctx, w*0.7, h*0.40, 100, h*0.25, '#b09070', '#804040');
  building(ctx, w*0.82, h*0.35, 80, h*0.30, '#907050', '#603020');
  // Windows glow
  ctx.fillStyle = '#ffe080';
  ctx.globalAlpha = 0.8 + 0.2*Math.sin(t*0.05);
  ctx.fillRect(w*0.07+20, h*0.42, 18, 14);
  ctx.fillRect(w*0.07+50, h*0.42, 18, 14);
  ctx.fillRect(w*0.72+10, h*0.45, 16, 12);
  ctx.globalAlpha = 1;
  // Trees (sides)
  tree(ctx, w*0.28, h*0.42, 14, '#2a5a18', '#5a3010');
  tree(ctx, w*0.60, h*0.44, 12, '#3a6a20', '#5a3010');
  tree(ctx, w*0.68, h*0.40, 16, '#204a10', '#4a2808');
  // Chimney smoke
  for (let i = 0; i < 3; i++) {
    if (Math.random() < 0.04) {
      ps.emit(w*0.13 + i*w*0.36, h*0.38 - 10, {
        vx: (Math.random()-0.5)*0.5, vy: -(Math.random()*0.8+0.3),
        size: 4+i*2, color: '#c0c0b0', life: 80, drag: 0.98, gravity: -0.01, glow: false,
      });
    }
  }
}

// ============================================================
// 2. WHISPERWOOD — Ethereal ancient forest
// ============================================================
function drawScene_whisperwood(ctx, w, h, t, ps) {
  sky(ctx, w, h, '#0a0820', '#1a1a40');
  stars(ctx, w, h, t, 60);
  // Moon
  pxCircle(ctx, w*0.8, h*0.12, 28, '#f0f0d0');
  ctx.fillStyle = '#0a0820';
  pxCircle(ctx, w*0.83, h*0.10, 24, '#0a0820');
  // Far trees (dark silhouette)
  ctx.fillStyle = '#080818';
  for (let i = 0; i < 20; i++) {
    const tx = (i / 19) * w;
    const th = 60 + (i%3)*40;
    const tw = 40 + (i%4)*20;
    ctx.fillRect(tx - tw/2, h*0.4 - th, tw, th + h*0.2);
    // Pointed tops
    ctx.beginPath();
    ctx.moveTo(tx - tw/2, h*0.4 - th);
    ctx.lineTo(tx, h*0.4 - th - 30);
    ctx.lineTo(tx + tw/2, h*0.4 - th);
    ctx.closePath(); ctx.fill();
  }
  // Ground mist
  ground(ctx, w, h, h*0.65, '#141a10');
  fog(ctx, w, h, h*0.55, 0.6, t);
  // Glowing mushrooms
  const mushrooms = [[w*0.15,h*0.63,'#60ff80'],[w*0.42,h*0.67,'#a060ff'],
    [w*0.68,h*0.64,'#60c0ff'],[w*0.85,h*0.66,'#80ff60']];
  for (const [mx, my, mc] of mushrooms) {
    const glow2 = ctx.createRadialGradient(mx, my, 0, mx, my, 30);
    glow2.addColorStop(0, mc + '80'); glow2.addColorStop(1, mc + '00');
    ctx.fillStyle = glow2; ctx.beginPath(); ctx.arc(mx, my, 30, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = mc; ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(mx-2, my-2, 2, 0, Math.PI*2); ctx.fill();
  }
  // Firefly particles
  if (Math.random() < 0.15) ps.ambient(w/2, h*0.6, 'firefly');
  // Foreground root/tree trunks
  ctx.fillStyle = '#0d0d18';
  ctx.fillRect(0, h*0.68, 30, h*0.32);
  ctx.fillRect(w-35, h*0.65, 35, h*0.35);
  // Magical leaf drift
  if (Math.random() < 0.08) ps.ambient(0, 0, 'leaves');
}

// ============================================================
// 3. FROSTPEAK — Snow-capped mountain pass
// ============================================================
function drawScene_frostpeak(ctx, w, h, t, ps) {
  sky(ctx, w, h, '#0a1828', '#3060a8');
  stars(ctx, w, h, t, 120);
  // Distant peaks
  ctx.fillStyle = '#c0d0e8';
  mountain(ctx, -60, h*0.2, 350, h*0.6, '#8090b0');
  mountain(ctx, 200, h*0.15, 400, h*0.65, '#9aaac0');
  mountain(ctx, 450, h*0.22, 300, h*0.55, '#8898b0');
  // Snow caps
  ctx.fillStyle = '#e8f0ff';
  ctx.beginPath(); ctx.moveTo(-60,h*0.2); ctx.lineTo(115,h*0.2-80); ctx.lineTo(290,h*0.2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(200,h*0.15); ctx.lineTo(400,h*0.15-100); ctx.lineTo(600,h*0.15); ctx.closePath(); ctx.fill();
  // Ground snow
  ground(ctx, w, h, h*0.62, '#c8d8f0', [[0,12,'#d8e8ff'],[12,8,'#b8c8e0']]);
  // Rock outcrops
  ctx.fillStyle = '#7080a0';
  ctx.fillRect(w*0.08, h*0.55, 80, 50);
  ctx.fillRect(w*0.75, h*0.57, 60, 45);
  ctx.fillStyle = '#d0e0f0';
  ctx.fillRect(w*0.09, h*0.55, 78, 8); // snow on rock
  // Icicles from top
  ctx.fillStyle = '#c0d8f8';
  for (let i = 0; i < 12; i++) {
    const ix = w*0.2 + i * (w*0.6/12);
    const il = 20 + Math.sin(i*1.7)*15;
    ctx.beginPath(); ctx.moveTo(ix, 0); ctx.lineTo(ix-4, il); ctx.lineTo(ix+4, il); ctx.closePath(); ctx.fill();
  }
  // Wind-blown snow particles
  if (Math.random() < 0.4) ps.ambient(w/2, h/2, 'snow');
}

// ============================================================
// 4. SUNKEN CITY — Drowned ruins, ethereal purple sky
// ============================================================
function drawScene_sunken_city(ctx, w, h, t, ps) {
  sky(ctx, w, h, '#100828', '#301848');
  stars(ctx, w, h, t, 50);
  // Purple nebula
  const nb = ctx.createRadialGradient(w*0.3, h*0.2, 0, w*0.3, h*0.2, w*0.5);
  nb.addColorStop(0, 'rgba(100,20,160,0.4)'); nb.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nb; ctx.fillRect(0,0,w,h);
  // Submerged ruins
  ctx.fillStyle = '#241430';
  // Broken towers
  const towers = [[w*0.1,h*0.3,50,h*0.4],[w*0.35,h*0.22,65,h*0.48],
    [w*0.62,h*0.28,55,h*0.42],[w*0.82,h*0.25,45,h*0.45]];
  for (const [tx,ty,tw,th] of towers) {
    ctx.fillRect(tx, ty, tw, th);
    // Crumbled top
    ctx.fillStyle = '#1a0e24';
    ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+tw/2,ty-20+Math.random()*10);
    ctx.lineTo(tx+tw,ty); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#241430';
  }
  // Water surface (reflective)
  drawWater(ctx, 0, h*0.62, w, h*0.38, '#0a1830', t);
  // Reflection of towers in water
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.scale(1, -0.6);
  for (const [tx,ty,tw,th] of towers) {
    ctx.fillStyle = '#4030a0';
    ctx.fillRect(tx, -(h*0.62)*1, tw, th*0.5);
  }
  ctx.restore();
  // Glowing artifacts
  const glows = [[w*0.2,h*0.5,'#8040ff'],[w*0.55,h*0.45,'#4080ff'],[w*0.78,h*0.52,'#a030c0']];
  for (const [gx,gy,gc] of glows) {
    const pulse = 0.5 + 0.5*Math.sin(t*0.06 + gx);
    const rg = ctx.createRadialGradient(gx,gy,0,gx,gy,20);
    rg.addColorStop(0,gc); rg.addColorStop(1,gc+'00');
    ctx.globalAlpha = pulse * 0.8;
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(gx,gy,20,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ============================================================
// 5. DREADMOOR — Dark swamp, red moon, dead trees
// ============================================================
function drawScene_dreadmoor(ctx, w, h, t, ps) {
  sky(ctx, w, h, '#080808', '#1a0808');
  stars(ctx, w, h, t, 30);
  // Blood moon
  const moonGlow = ctx.createRadialGradient(w*0.7, h*0.15, 0, w*0.7, h*0.15, 60);
  moonGlow.addColorStop(0,'rgba(200,40,40,0.5)'); moonGlow.addColorStop(1,'rgba(200,40,40,0)');
  ctx.fillStyle = moonGlow; ctx.beginPath(); ctx.arc(w*0.7,h*0.15,60,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c02020'; ctx.beginPath(); ctx.arc(w*0.7,h*0.15,22,0,Math.PI*2); ctx.fill();
  // Murky water
  drawWater(ctx, 0, h*0.58, w, h*0.42, '#0a1508', t);
  // Mud banks
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(0, h*0.62, w*0.3, h*0.38);
  ctx.fillRect(w*0.55, h*0.64, w*0.45, h*0.36);
  // Dead trees
  const deadTrees = [w*0.05,w*0.18,w*0.33,w*0.66,w*0.79,w*0.92];
  for (const dtx of deadTrees) {
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect(dtx, h*0.3, 6, h*0.35);
    // Bare branches
    ctx.strokeStyle = '#1a0e08'; ctx.lineWidth = 2;
    [[dtx+3, h*0.33, dtx-20, h*0.28],[dtx+3, h*0.38, dtx+22, h*0.33],
     [dtx+3, h*0.42, dtx-15, h*0.38],[dtx+3, h*0.45, dtx+18, h*0.41]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
  }
  // Fog tendrils
  fog(ctx, w, h, h*0.5, 0.5, t);
  // Firefly particles (green-red tint)
  if (Math.random() < 0.1) {
    ps.emit(randInt(0,w), randInt(h*0.4,h*0.7), {
      vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.8,
      size: 2, color: '#a0ff30', life: 100, glow: true, drag: 0.99,
    });
  }
}

// ============================================================
// 6. OBSIDIAN CITADEL — Final boss, volcanic sky
// ============================================================
function drawScene_citadel(ctx, w, h, t, ps) {
  sky(ctx, w, h, '#050005', '#200010');
  stars(ctx, w, h, t, 20);
  // Volcanic glow on horizon
  const volc = ctx.createLinearGradient(0, h*0.5, 0, h);
  volc.addColorStop(0,'rgba(200,60,0,0)'); volc.addColorStop(1,'rgba(200,60,0,0.5)');
  ctx.fillStyle = volc; ctx.fillRect(0, h*0.5, w, h*0.5);
  // The citadel silhouette
  const cx2 = w/2;
  ctx.fillStyle = '#0a0008';
  // Main tower
  ctx.fillRect(cx2-30, h*0.1, 60, h*0.6);
  // Flanking towers
  ctx.fillRect(cx2-90, h*0.25, 40, h*0.45);
  ctx.fillRect(cx2+50, h*0.22, 45, h*0.48);
  // Battlements
  for (let bi = 0; bi < 6; bi++) {
    ctx.fillRect(cx2-28 + bi*12, h*0.10 - 14, 8, 14);
  }
  // Glowing windows
  const winPulse = 0.6 + 0.4*Math.sin(t*0.08);
  ctx.globalAlpha = winPulse;
  ctx.fillStyle = '#ff2000';
  [[cx2-10,h*0.2],[cx2+5,h*0.2],[cx2-5,h*0.35],[cx2-5,h*0.5]].forEach(([wx,wy]) => {
    ctx.fillRect(wx, wy, 10, 16);
  });
  ctx.globalAlpha = 1;
  // Lightning
  if (Math.sin(t*0.3) > 0.95) {
    ctx.strokeStyle = '#c040ff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.8;
    ctx.beginPath();
    let lx = cx2 + randInt(-80,80), ly = 0;
    ctx.moveTo(lx, ly);
    while (ly < h*0.4) { lx += randInt(-20,20); ly += randInt(20,40); ctx.lineTo(lx,ly); }
    ctx.stroke(); ctx.globalAlpha = 1;
  }
  // Lava ground
  const lava = ctx.createLinearGradient(0, h*0.7, 0, h);
  lava.addColorStop(0,'#1a0800'); lava.addColorStop(0.4,'#401000'); lava.addColorStop(1,'#802000');
  ctx.fillStyle = lava; ctx.fillRect(0, h*0.7, w, h*0.3);
  // Lava cracks
  ctx.strokeStyle = '#ff6000'; ctx.lineWidth = 2;
  [[0.1,0.75,0.35,0.82],[0.4,0.78,0.6,0.85],[0.65,0.73,0.9,0.80]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1*w,y1*h); ctx.lineTo(x2*w,y2*h); ctx.stroke();
  });
  // Ash particles
  if (Math.random() < 0.3) ps.ambient(w/2, h/2, 'ash');
}

// ============================================================
// 7. CAMP — Bonfire at night
// ============================================================
function drawScene_camp(ctx, w, h, t, ps) {
  sky(ctx, w, h, '#050510', '#0a0a20');
  stars(ctx, w, h, t, 160);
  // Moon
  pxCircle(ctx, w*0.15, h*0.1, 22, '#e8e8d0');
  // Ground
  ground(ctx, w, h, h*0.65, '#1a150a', [[0,6,'#120e06']]);
  // Trees silhouette
  ctx.fillStyle = '#080808';
  [0.0,0.12,0.75,0.88].forEach((tx,i) => {
    const tw = 50 + i*20, th = h*0.38+i*20;
    ctx.fillRect(tx*w, h*0.28-th+h*0.38, tw, th);
    ctx.beginPath();
    ctx.moveTo(tx*w, h*0.28-th+h*0.38);
    ctx.lineTo(tx*w+tw/2, h*0.28-th+h*0.38-40);
    ctx.lineTo(tx*w+tw, h*0.28-th+h*0.38);
    ctx.closePath(); ctx.fill();
  });
  // Campfire glow
  const fx = w/2, fy = h*0.72;
  const fireGlow = ctx.createRadialGradient(fx,fy,0,fx,fy,140);
  const flicker = 0.7 + 0.3*Math.sin(t*0.3 + Math.sin(t*0.7));
  fireGlow.addColorStop(0,`rgba(255,160,40,${flicker*0.6})`);
  fireGlow.addColorStop(0.4,`rgba(255,80,0,${flicker*0.25})`);
  fireGlow.addColorStop(1,'rgba(255,80,0,0)');
  ctx.fillStyle = fireGlow; ctx.beginPath(); ctx.arc(fx,fy,140,0,Math.PI*2); ctx.fill();
  // Logs
  ctx.fillStyle = '#4a2a10';
  ctx.save(); ctx.translate(fx,fy+10); ctx.rotate(0.4);
  ctx.fillRect(-30,-5,60,10); ctx.restore();
  ctx.save(); ctx.translate(fx,fy+10); ctx.rotate(-0.4);
  ctx.fillRect(-30,-5,60,10); ctx.restore();
  // Flames
  const flameH = 30 + 15*Math.sin(t*0.4);
  [[fx-8,'#ff2000'],[fx,'#ff8000'],[fx+8,'#ffcc00']].forEach(([fx2,fc],i) => {
    const fh = flameH - i*5;
    ctx.fillStyle = fc;
    ctx.beginPath();
    ctx.moveTo(fx2-10, fy+5); ctx.quadraticCurveTo(fx2-5, fy-fh/2, fx2, fy-fh);
    ctx.quadraticCurveTo(fx2+5, fy-fh/2, fx2+10, fy+5);
    ctx.closePath(); ctx.fill();
  });
  // Ember particles
  if (Math.random() < 0.35) ps.ambient(fx, fy, 'ember');
  // Sitting spots around fire (visual indicator)
  ctx.fillStyle = '#2a1e0c';
  [[fx-90,fy+15],[fx+85,fy+15],[fx-50,fy+40],[fx+45,fy+40]].forEach(([lx,ly]) => {
    ctx.fillRect(lx-15, ly, 30, 10);
  });
}

// ============================================================
// 8. TITLE — Epic sweeping landscape
// ============================================================
function drawScene_title(ctx, w, h, t, ps) {
  sky(ctx, w, h, '#020210', '#101030');
  stars(ctx, w, h, t, 200);
  // Aurora borealis
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const au = ctx.createLinearGradient(0, 0, 0, h*0.5);
    au.addColorStop(0,'rgba(0,0,0,0)');
    au.addColorStop(0.5,`rgba(${20+i*20},${80+i*30},${40+i*15},0.15)`);
    au.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = au;
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    for (let ax = 0; ax <= w+50; ax += 30) {
      const ay = h * 0.2 + Math.sin((ax + t*0.8 + i*100)*0.015)*60;
      ctx.lineTo(ax, ay);
    }
    ctx.lineTo(w+50, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // Distant range
  ctx.fillStyle = '#0c0c20';
  mountain(ctx, -100, h*0.35, 450, h*0.45, '#0c0c20');
  mountain(ctx, 300, h*0.28, 500, h*0.52, '#0a0a1c');
  mountain(ctx, 650, h*0.32, 400, h*0.48, '#0c0c1e');
  // Snow caps
  ctx.fillStyle = '#c0c8e0';
  ctx.beginPath(); ctx.moveTo(-100,h*0.35); ctx.lineTo(125,h*0.35-80); ctx.lineTo(350,h*0.35); ctx.closePath(); ctx.fill();
  // Foreground hills
  const hg = ctx.createLinearGradient(0, h*0.6, 0, h);
  hg.addColorStop(0,'#141a0c'); hg.addColorStop(1,'#0a100a');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.moveTo(0,h*0.62);
  for (let hx=0; hx<=w; hx+=40) ctx.lineTo(hx, h*0.6 + Math.sin(hx*0.02)*20);
  ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fill();
  // Road
  ctx.fillStyle = '#1a1810';
  ctx.beginPath(); ctx.moveTo(w*0.4,h*0.65); ctx.lineTo(w*0.5,h); ctx.lineTo(w*0.6,h); ctx.lineTo(w*0.6,h*0.65); ctx.closePath(); ctx.fill();
}
