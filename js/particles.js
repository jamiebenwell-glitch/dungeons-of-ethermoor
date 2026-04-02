// ============================================================
// PARTICLES.JS — Particle system for combat & ambient FX
// ============================================================

class Particle {
  constructor(x, y, opts = {}) {
    this.x  = x;
    this.y  = y;
    this.vx = opts.vx ?? (Math.random()-0.5)*3;
    this.vy = opts.vy ?? (Math.random()-0.5)*3;
    this.life    = opts.life    ?? 40;
    this.maxLife = this.life;
    this.size    = opts.size    ?? 3;
    this.color   = opts.color   ?? '#ffffff';
    this.color2  = opts.color2  ?? null;   // fade-to color
    this.gravity = opts.gravity ?? 0;
    this.drag    = opts.drag    ?? 0.96;
    this.glow    = opts.glow    ?? false;
    this.text    = opts.text    ?? null;   // floating text
    this.shape   = opts.shape   ?? 'circle'; // 'circle' | 'rect' | 'spark'
  }

  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.vy += this.gravity;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.life--;
  }

  get alpha() { return clamp(this.life / this.maxLife, 0, 1); }
  get dead()  { return this.life <= 0; }

  draw(ctx) {
    const a = this.alpha;
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;

    let color = this.color;
    if (this.color2) color = lerpHex(this.color2, this.color, a);

    if (this.text) {
      ctx.fillStyle = color;
      ctx.font = `bold ${this.size}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(this.text, this.x, this.y);
    } else if (this.glow) {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size*2);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size*2, 0, Math.PI*2);
      ctx.fill();
    } else if (this.shape === 'rect') {
      ctx.fillStyle = color;
      ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    } else if (this.shape === 'spark') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx*4, this.y - this.vy*4);
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() { this.pool = []; }

  emit(x, y, opts) {
    this.pool.push(new Particle(x, y, opts));
  }

  burst(x, y, count, opts) {
    for (let i = 0; i < count; i++) this.emit(x, y, opts);
  }

  update() {
    this.pool = this.pool.filter(p => { p.update(); return !p.dead; });
  }

  draw(ctx) {
    for (const p of this.pool) p.draw(ctx);
  }

  clear() { this.pool = []; }

  // --- Named effects ---

  hit(x, y, color = '#ff4040') {
    this.burst(x, y, 12, {
      vx: 0, vy: 0, life: 25, size: 4, color, color2: '#ffff80',
      glow: true, gravity: 0.15,
    });
    this.burst(x, y, 8, {
      size: 2, color, shape: 'spark', life: 18, gravity: 0.08,
    });
  }

  heal(x, y) {
    for (let i = 0; i < 16; i++) {
      this.emit(x + randInt(-20,20), y + randInt(-10,10), {
        vx: (Math.random()-0.5)*1.5,
        vy: -(Math.random()*2 + 0.5),
        life: 50 + randInt(0,30),
        size: randInt(2,5),
        color: '#40ff80',
        color2: '#ffffff',
        glow: true,
        gravity: -0.02,
        drag: 0.99,
      });
    }
  }

  magic(x, y, color = '#a060ff') {
    this.burst(x, y, 20, {
      vx: 0, vy: 0, size: 5, color, color2: '#ffffff',
      glow: true, life: 35, gravity: 0.05,
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      this.emit(x, y, {
        vx: Math.cos(angle) * (2 + Math.random()*3),
        vy: Math.sin(angle) * (2 + Math.random()*3),
        size: 3, color, shape: 'spark', life: 25, drag: 0.92,
      });
    }
  }

  slash(x, y) {
    for (let i = 0; i < 8; i++) {
      this.emit(x, y, {
        vx: randInt(-3,3),
        vy: randInt(-4,0),
        size: 2, color: '#ffe0a0', shape: 'spark', life: 20, drag: 0.9,
      });
    }
  }

  death(x, y, color = '#888888') {
    for (let i = 0; i < 24; i++) {
      this.emit(x + randInt(-15,15), y + randInt(-20,5), {
        vx: (Math.random()-0.5)*4,
        vy: -Math.random()*3,
        size: randInt(2,5),
        color,
        color2: '#000000',
        life: 60 + randInt(0,40),
        gravity: 0.12,
        drag: 0.95,
      });
    }
  }

  floatingText(x, y, text, color = '#ffffff', size = 14) {
    this.emit(x, y, {
      vx: (Math.random()-0.5)*0.5,
      vy: -1.8,
      life: 55,
      size,
      color,
      text,
      gravity: 0,
      drag: 0.99,
    });
  }

  ambient(x, y, type) {
    if (type === 'ember') {
      this.emit(x + randInt(-30,30), y + randInt(-5,5), {
        vx: (Math.random()-0.5)*0.8,
        vy: -(Math.random()*1.5 + 0.3),
        size: randInt(1,3),
        color: pick(['#ff8020','#ff4010','#ffb040','#ffe060']),
        life: 80 + randInt(0,60),
        glow: true,
        gravity: -0.02,
        drag: 0.99,
      });
    } else if (type === 'snow') {
      this.emit(x + randInt(0, 800), randInt(-10,0), {
        vx: (Math.random()-0.5)*0.6,
        vy: Math.random()*1.5 + 0.5,
        size: randInt(1,3),
        color: '#e0e8ff',
        life: 200 + randInt(0,100),
        drag: 0.995,
        gravity: 0.02,
        shape: 'rect',
      });
    } else if (type === 'firefly') {
      this.emit(x + randInt(-100,100), y + randInt(-50,50), {
        vx: (Math.random()-0.5)*0.8,
        vy: (Math.random()-0.5)*0.8,
        size: 2,
        color: '#a0ff60',
        life: 120 + randInt(0,80),
        glow: true,
        drag: 0.99,
      });
    } else if (type === 'leaves') {
      this.emit(x + randInt(0,800), randInt(-10,0), {
        vx: Math.random()*1.5 + 0.5,
        vy: Math.random()*1.2 + 0.4,
        size: randInt(2,4),
        color: pick(['#40a020','#60b830','#80c840','#a0b020']),
        life: 160 + randInt(0,80),
        drag: 0.98,
        gravity: 0.03,
        shape: 'rect',
      });
    } else if (type === 'ash') {
      this.emit(x + randInt(-200,200), y + randInt(-200,0), {
        vx: (Math.random()-0.5)*1.2,
        vy: Math.random()*0.8 + 0.2,
        size: randInt(1,3),
        color: pick(['#888880','#aaaaaa','#666660']),
        life: 180 + randInt(0,100),
        drag: 0.995,
        gravity: 0.01,
        shape: 'rect',
      });
    }
  }
}
