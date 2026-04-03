// ============================================================
// CONFIG.JS  — Constants, palette helpers, shared utilities
// ============================================================

const C = {
  // Canvas layout
  SIDEBAR_W: 220,         // right companion panel
  LOG_H:      140,        // bottom narrative log
  PORTRAIT_W: 200,        // chat portrait panel width
  TILE:        16,        // base sprite unit

  // Animation
  FPS:         30,
  ANIM_SPEED:  8,          // frames per sprite frame

  // Combat
  PARTY_MAX:   5,
  CRIT_MULT:   2.0,
  FLEE_BASE:   0.45,

  // Relationship tiers (out of 100)
  REL_STRANGER:  0,
  REL_ALLY:     30,
  REL_FRIEND:   60,
  REL_DEVOTED:  85,

  // Colors — named palette
  P: {
    BLACK:     '#0a0a0f',
    DARKBG:    '#12121a',
    PANEL:     '#1a1a28',
    PANELBORD: '#3a3a5c',
    GOLD:      '#f0c040',
    GOLDLT:    '#ffe080',
    RED:       '#e03030',
    REDLT:     '#ff6060',
    GREEN:     '#40c060',
    GREENLT:   '#80f0a0',
    BLUE:      '#4080e0',
    BLUELT:    '#80b0ff',
    PURPLE:    '#9040d0',
    PURPLELT:  '#c080ff',
    TEAL:      '#30b0b0',
    ORANGE:    '#e08020',
    WHITE:     '#f0f0f0',
    GREY:      '#888888',
    DARKGREY:  '#444455',
    SKIN:      '#f0c898',
    SKIN2:     '#c89060',
    HAIR_BRN:  '#5a3010',
    HAIR_BLD:  '#d0a020',
    HAIR_BLK:  '#181818',
    HAIR_SLV:  '#c0c0d0',
    HAIR_RED:  '#c03010',
  },
};

// Draw a "pixel-art rectangle" — snapped to integer pixels
function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x|0, y|0, (w+0.5)|0, (h+0.5)|0);
}

// Draw a circle pixel-art style (filled, no anti-alias)
function pxCircle(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx|0, cy|0, r, 0, Math.PI * 2);
  ctx.fill();
}

// Lerp color (hex strings) — for flashing effects
function lerpHex(a, b, t) {
  const ar = parseInt(a.slice(1,3),16), ag = parseInt(a.slice(3,5),16), ab = parseInt(a.slice(5,7),16);
  const br = parseInt(b.slice(1,3),16), bg = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16);
  const r = (ar + (br-ar)*t)|0, g = (ag + (bg-ag)*t)|0, bl = (ab + (bb-ab)*t)|0;
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

// HSL color helper
function hsl(h,s,l) { return `hsl(${h},${s}%,${l}%)`; }

function roll(sides) { return 1 + Math.floor(Math.random() * sides); }
function rollN(n, sides) { let t=0; for(let i=0;i<n;i++) t+=roll(sides); return t; }
function clamp(v,lo,hi) { return Math.max(lo, Math.min(hi, v)); }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(lo, hi) { return lo + Math.floor(Math.random()*(hi-lo+1)); }

// Round a number to make it "game-y"
function fmtNum(n) { return n >= 1000 ? (n/1000).toFixed(1)+'k' : String(Math.round(n)); }

// Wrap text and return array of lines
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Rounded rect path — works in all browsers (roundRect is Chrome99+/FF112+)
function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// Panel with border
function drawPanel(ctx, x, y, w, h, {
  fill   = C.P.PANEL,
  border = C.P.PANELBORD,
  radius = 4,
  alpha  = 1,
} = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = fill;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
