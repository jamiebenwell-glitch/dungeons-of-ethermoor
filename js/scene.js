// ============================================================
// SCENE.JS — Dramatic animated backgrounds
// drawScene(ctx, id, w, h, t, ps)
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

function drawScene(ctx, id, w, h, t, ps) {
  (SCENES[id] || drawScene_millhaven)(ctx, w, h, t, ps);
}

// ─── helpers ─────────────────────────────────────────────────
function skyGrad(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0,0,0,h);
  stops.forEach(([p,c]) => g.addColorStop(p,c));
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
}
function stars(ctx, w, h, t, n=120) {
  const seed = n => { let x=Math.sin(n*127.1)*43758.5453; return x-Math.floor(x); };
  for (let i=0;i<n;i++) {
    const sx=seed(i*3)*w, sy=seed(i*3+1)*h*0.55;
    const tw=0.4+0.6*Math.abs(Math.sin(t*0.04+seed(i*3+2)*10));
    ctx.globalAlpha=tw*0.9;
    const r=seed(i*3+2)>0.85?1.5:0.8;
    ctx.fillStyle=seed(i*3+2)>0.9?'#ffe8c0':'#e8e8ff';
    ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;
}
function mountain(ctx, x, y, w, h, c1, c2) {
  const g=ctx.createLinearGradient(x+w/2,y,x+w/2,y+h);
  g.addColorStop(0,c1); g.addColorStop(1,c2);
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(x,y+h); ctx.lineTo(x+w*0.5,y); ctx.lineTo(x+w,y+h);
  ctx.closePath(); ctx.fill();
}
function treeLine(ctx, y, w, cols, heights, t=0) {
  ctx.fillStyle=cols[0];
  ctx.beginPath(); ctx.moveTo(-10,y+heights[0]|0);
  for (let x=0;x<=w+20;x+=8) {
    const noise=Math.sin(x*0.04+t*0.002)*18+Math.sin(x*0.11)*10+Math.cos(x*0.07+t*0.003)*8;
    ctx.lineTo(x, (y+noise)|0);
  }
  ctx.lineTo(w+10,y+heights[0]); ctx.lineTo(w+10,y+300); ctx.lineTo(-10,y+300);
  ctx.closePath(); ctx.fill();
  if (cols[1]) {
    ctx.fillStyle=cols[1];
    ctx.beginPath(); ctx.moveTo(-10,y+heights[1]|0);
    for (let x=0;x<=w+20;x+=8) {
      const noise=Math.sin(x*0.06+0.5)*14+Math.sin(x*0.09)*8;
      ctx.lineTo(x,(y+heights[1]+noise)|0);
    }
    ctx.lineTo(w+10,y+heights[1]); ctx.lineTo(w+10,y+300); ctx.lineTo(-10,y+300);
    ctx.closePath(); ctx.fill();
  }
}
function fog(ctx, w, h, yStart, density, t) {
  for (let i=0;i<5;i++) {
    const bx=((i*230+t*0.4)%(w+300))-150;
    const by=yStart+i*20;
    const g=ctx.createRadialGradient(bx,by,0,bx,by,150);
    g.addColorStop(0,`rgba(160,200,160,${density*0.7})`);
    g.addColorStop(1,'rgba(160,200,160,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(bx,by,180,40,0,0,Math.PI*2); ctx.fill();
  }
  const g=ctx.createLinearGradient(0,yStart,0,h);
  g.addColorStop(0,'rgba(140,180,140,0)');
  g.addColorStop(0.4,`rgba(140,180,140,${density*0.5})`);
  g.addColorStop(1,`rgba(140,180,140,${density})`);
  ctx.fillStyle=g; ctx.fillRect(0,yStart,w,h-yStart);
}
function water(ctx, x, y, w, h, col, t) {
  ctx.fillStyle=col; ctx.fillRect(x,y,w,h);
  ctx.save();
  ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1.5;
  for (let wy=y+10;wy<y+h;wy+=14) {
    ctx.beginPath();
    for (let wx=x;wx<x+w;wx+=4) {
      const oy=Math.sin((wx*0.06+t*1.4))*2.5+Math.sin((wx*0.03+t*0.7))*1.5;
      wx===x?ctx.moveTo(wx,wy+oy):ctx.lineTo(wx,wy+oy);
    }
    ctx.stroke();
  }
  ctx.restore();
}
function godRay(ctx, sx, sy, ex, ey, color, alpha) {
  const g=ctx.createLinearGradient(sx,sy,ex,ey);
  g.addColorStop(0,`rgba(${color},${alpha})`);
  g.addColorStop(1,`rgba(${color},0)`);
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(sx-20,sy); ctx.lineTo(ex-60,ey);
  ctx.lineTo(ex+60,ey); ctx.lineTo(sx+20,sy);
  ctx.closePath(); ctx.fill();
}
function cloudLayer(ctx, w, h, y, t, col, speed=0.2) {
  for (let i=0;i<5;i++) {
    const cx=((i*w/4+t*speed)%(w+300))-150;
    const cy=y+Math.sin(i*1.7)*20;
    const cw=120+i*40; const ch=30+i*10;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,cw*0.7);
    g.addColorStop(0,col); g.addColorStop(1,col+'00');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(cx,cy,cw*0.7,ch*0.5,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx-40,cy+5,cw*0.5,ch*0.4,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+40,cy+5,cw*0.5,ch*0.4,0,0,Math.PI*2); ctx.fill();
  }
}

// ============================================================
// 1. MILLHAVEN — Golden dawn village
// ============================================================
function drawScene_millhaven(ctx, w, h, t, ps) {
  // Sky — warm sunrise gradient
  skyGrad(ctx, w, h, [
    [0,'#0d0820'],[0.25,'#1a1040'],[0.45,'#b04010'],[0.6,'#e07030'],[0.75,'#f0a040'],[1,'#c06820']
  ]);

  // Sun on horizon
  const sunY = h*0.52;
  const sunGlow=ctx.createRadialGradient(w*0.62,sunY,0,w*0.62,sunY,w*0.4);
  sunGlow.addColorStop(0,'rgba(255,230,120,0.5)');
  sunGlow.addColorStop(0.3,'rgba(255,160,40,0.25)');
  sunGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sunGlow; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#fff8d0';
  ctx.beginPath(); ctx.arc(w*0.62,sunY,18,0,Math.PI*2); ctx.fill();

  // God rays from sun
  ctx.save(); ctx.globalAlpha=0.08;
  for (let i=0;i<7;i++) {
    const angle=(i/7)*Math.PI*0.6-Math.PI*0.3;
    godRay(ctx, w*0.62,sunY, w*0.62+Math.cos(angle)*w, sunY+Math.sin(angle)*h,'255,200,80',0.12);
  }
  ctx.restore();

  // Clouds
  ctx.globalAlpha=0.5;
  cloudLayer(ctx, w, h, h*0.15, t, 'rgba(240,160,80,0.8)', 0.15);
  ctx.globalAlpha=1;

  // Far mountains — layered
  ctx.globalAlpha=0.35;
  mountain(ctx,-80,h*0.28,380,h*0.42,'#2a2040','#1a1030');
  mountain(ctx,250,h*0.22,320,h*0.48,'#352850','#201838');
  mountain(ctx,500,h*0.30,260,h*0.40,'#2a2040','#1a1030');
  ctx.globalAlpha=1;

  // Tree silhouettes — far
  treeLine(ctx, h*0.55, w, ['#1a2810','#202e14'], [20,35], t);

  // Ground
  const groundG=ctx.createLinearGradient(0,h*0.65,0,h);
  groundG.addColorStop(0,'#2a3e18'); groundG.addColorStop(0.3,'#1e2e10'); groundG.addColorStop(1,'#141e08');
  ctx.fillStyle=groundG; ctx.fillRect(0,h*0.65,w,h*0.35);

  // Cobblestone road
  const roadG=ctx.createLinearGradient(w/2,h*0.65,w/2,h);
  roadG.addColorStop(0,'#706858'); roadG.addColorStop(1,'#504840');
  ctx.fillStyle=roadG;
  ctx.beginPath();
  ctx.moveTo(w*0.38,h*0.65); ctx.lineTo(w*0.62,h*0.65);
  ctx.lineTo(w*0.75,h); ctx.lineTo(w*0.25,h);
  ctx.closePath(); ctx.fill();
  // Cobble detail
  ctx.strokeStyle='#3a3028'; ctx.lineWidth=1;
  for (let cy=h*0.67;cy<h;cy+=12) {
    for (let cx=w*0.3;cx<w*0.7;cx+=16) {
      ctx.strokeRect(cx+Math.sin(cy)*3,cy,14,10);
    }
  }

  // Buildings
  const bldgs=[
    [w*0.04,h*0.38,130,h*0.27,'#9a7850','#804030','#604020'],
    [w*0.68,h*0.40,110,h*0.25,'#b08860','#904040','#703020'],
    [w*0.82,h*0.35, 90,h*0.30,'#907050','#603030','#502018'],
  ];
  for (const [bx,by,bw,bh,wc,rc,dc] of bldgs) {
    // Wall
    ctx.fillStyle=wc; ctx.fillRect(bx,by,bw,bh);
    // Roof
    ctx.fillStyle=rc;
    ctx.beginPath(); ctx.moveTo(bx-6,by); ctx.lineTo(bx+bw/2,by-bh*0.4); ctx.lineTo(bx+bw+6,by); ctx.closePath(); ctx.fill();
    // Door
    ctx.fillStyle=dc; ctx.fillRect(bx+bw/2-8,by+bh-20,16,20);
    // Window glow
    const wg=0.7+0.3*Math.sin(t*0.04);
    ctx.fillStyle=`rgba(255,220,100,${wg})`;
    ctx.fillRect(bx+12,by+bh*0.25,20,16);
    if (bw>100) ctx.fillRect(bx+bw-32,by+bh*0.25,20,16);
    // Timber frame
    ctx.strokeStyle='#604020'; ctx.lineWidth=2;
    ctx.strokeRect(bx,by,bw,bh);
    ctx.beginPath(); ctx.moveTo(bx+bw/2,by); ctx.lineTo(bx+bw/2,by+bh); ctx.stroke();
  }

  // Tall trees foreground
  const treeData=[[w*0.25,h*0.35],[w*0.64,h*0.37],[w*0.73,h*0.33]];
  for (const [tx,ty] of treeData) {
    ctx.fillStyle='#2a1808'; ctx.fillRect(tx-5,ty+60,10,h-ty-60);
    // Layered canopy
    [[0,0,'#2a5018'],[0,18,'#345e20'],[8,12,'#3a6a24']].forEach(([dy,dr,col],i)=>{
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.arc(tx,ty+dy,35-i*6,0,Math.PI*2); ctx.fill();
    });
  }

  // Smoke particles
  if (Math.random()<0.05) {
    [[w*0.12,h*0.37],[w*0.74,h*0.39],[w*0.87,h*0.34]].forEach(([sx,sy])=>{
      ps.emit(sx,sy,{vx:(Math.random()-0.5)*0.4,vy:-(Math.random()*0.7+0.3),
        size:5+Math.random()*4,color:'#c0c0a0',life:120,drag:0.99,gravity:-0.008,glow:false});
    });
  }

  // Birds
  for (let i=0;i<5;i++) {
    const bx=((i*180+t*0.6)%(w+60))-30;
    const by=h*0.18+Math.sin(i*2.3+t*0.05)*30;
    ctx.strokeStyle='#1a1020'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(bx-8,by); ctx.quadraticCurveTo(bx-2,by-6,bx,by);
    ctx.quadraticCurveTo(bx+2,by-6,bx+8,by); ctx.stroke();
  }
}

// ============================================================
// 2. WHISPERWOOD — Moonlit ancient forest
// ============================================================
function drawScene_whisperwood(ctx, w, h, t, ps) {
  skyGrad(ctx, w, h, [
    [0,'#020208'],[0.3,'#060614'],[0.6,'#080c18'],[1,'#040808']
  ]);
  stars(ctx, w, h, t, 180);

  // Moon — large, atmospheric
  const mx=w*0.78, my=h*0.12;
  const moonGlow=ctx.createRadialGradient(mx,my,0,mx,my,80);
  moonGlow.addColorStop(0,'rgba(220,230,255,0.35)');
  moonGlow.addColorStop(0.4,'rgba(180,200,255,0.12)');
  moonGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=moonGlow; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#e8eeff'; ctx.beginPath(); ctx.arc(mx,my,28,0,Math.PI*2); ctx.fill();
  // Moon surface detail
  ctx.fillStyle='rgba(0,0,20,0.15)';
  ctx.beginPath(); ctx.arc(mx-8,my-5,8,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx+10,my+8,5,0,Math.PI*2); ctx.fill();

  // Moonlight shaft
  ctx.save(); ctx.globalAlpha=0.06;
  const mlg=ctx.createLinearGradient(mx,my,mx-40,h);
  mlg.addColorStop(0,'rgba(200,210,255,0.8)'); mlg.addColorStop(1,'rgba(200,210,255,0)');
  ctx.fillStyle=mlg;
  ctx.beginPath(); ctx.moveTo(mx-15,my); ctx.lineTo(mx-80,h); ctx.lineTo(mx+20,h); ctx.lineTo(mx+15,my); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Far forest silhouette
  treeLine(ctx, h*0.35, w, ['#04060e','#060810'], [0,18], t);

  // Ground mist
  const groundY=h*0.62;
  ctx.fillStyle='#080e08'; ctx.fillRect(0,groundY,w,h-groundY);
  fog(ctx, w, h, groundY-20, 0.7, t);

  // Ancient tree trunks — foreground
  const fgTrees=[
    [w*0.04,h*0.3,22,h*0.75,'#0a0c08','#080a06'],
    [w*0.18,h*0.2,30,h*0.85,'#080c06','#060a04'],
    [w*0.68,h*0.25,28,h*0.82,'#080c06','#060a04'],
    [w*0.88,h*0.22,26,h*0.78,'#0a0c08','#080a06'],
    [w*0.96,h*0.28,20,h*0.72,'#080c06','#060a04'],
  ];
  for (const [tx,ty,tw,th,bc,rc] of fgTrees) {
    // Bark texture
    const trunkG=ctx.createLinearGradient(tx,ty,tx+tw,ty);
    trunkG.addColorStop(0,bc); trunkG.addColorStop(0.3,rc); trunkG.addColorStop(1,bc);
    ctx.fillStyle=trunkG; ctx.fillRect(tx,ty,tw,h-ty);
    // Root flare
    ctx.fillStyle=bc; ctx.beginPath();
    ctx.moveTo(tx,h); ctx.lineTo(tx-tw*0.5,h); ctx.lineTo(tx,ty+tw*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx+tw,h); ctx.lineTo(tx+tw+tw*0.5,h); ctx.lineTo(tx+tw,ty+tw*2); ctx.closePath(); ctx.fill();
    // Branches
    ctx.strokeStyle='#080c06'; ctx.lineWidth=tw*0.25;
    [[tx+tw/2,ty+30,tx-40,ty-20],[tx+tw/2,ty+50,tx+60,ty+10],[tx+tw/2,ty+80,tx-30,ty+50]].forEach(([x1,y1,x2,y2])=>{
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
  }

  // Glowing runes on trees
  const runeGlyphs=['⋄','◈','⊕','⊗','✦'];
  const runePositions=[[w*0.08,h*0.5],[w*0.24,h*0.45],[w*0.72,h*0.48],[w*0.90,h*0.43]];
  runePositions.forEach(([rx,ry],i)=>{
    const rp=0.4+0.6*Math.abs(Math.sin(t*0.04+i*1.5));
    const rc2=['#40ff80','#8040ff','#40c0ff','#ff4080'][i%4];
    ctx.save();
    ctx.globalAlpha=rp*0.8;
    ctx.font=`${14+i*2}px serif`; ctx.fillStyle=rc2; ctx.textAlign='center';
    ctx.fillText(runeGlyphs[i%runeGlyphs.length],rx,ry);
    // Glow
    const rg=ctx.createRadialGradient(rx,ry-8,0,rx,ry-8,20);
    rg.addColorStop(0,rc2+'60'); rg.addColorStop(1,rc2+'00');
    ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(rx,ry-8,20,0,Math.PI*2); ctx.fill();
    ctx.restore();
  });

  // Glowing mushrooms on ground
  [[w*0.15,groundY-5,'#50ff80'],[w*0.38,groundY-3,'#a050ff'],
   [w*0.55,groundY-4,'#50c0ff'],[w*0.82,groundY-6,'#80ff50']].forEach(([mx2,my2,mc])=>{
    const mp=0.6+0.4*Math.sin(t*0.06+mx2);
    const mg=ctx.createRadialGradient(mx2,my2,0,mx2,my2,35);
    mg.addColorStop(0,mc+'90'); mg.addColorStop(1,mc+'00');
    ctx.globalAlpha=mp; ctx.fillStyle=mg;
    ctx.beginPath(); ctx.arc(mx2,my2,35,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle=mc; ctx.beginPath(); ctx.arc(mx2,my2,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(mx2-3,my2-3,2.5,0,Math.PI*2); ctx.fill();
    // Stalk
    ctx.fillStyle='#c8ffb8'; ctx.fillRect(mx2-2,my2,4,10);
  });

  // Fireflies
  if (Math.random()<0.18) ps.ambient(w/2,groundY,'firefly');
}

// ============================================================
// 3. FROSTPEAK — Blizzard mountain
// ============================================================
function drawScene_frostpeak(ctx, w, h, t, ps) {
  skyGrad(ctx, w, h, [
    [0,'#060810'],[0.3,'#0a1020'],[0.55,'#182040'],[0.75,'#2a3858'],[1,'#384868']
  ]);
  stars(ctx, w, h, t, 80);

  // Aurora borealis
  ctx.save();
  for (let i=0;i<3;i++) {
    ctx.globalAlpha=0.12+0.08*Math.sin(t*0.03+i);
    const aug=ctx.createLinearGradient(0,0,0,h*0.4);
    aug.addColorStop(0,'rgba(0,0,0,0)');
    aug.addColorStop(0.5,`rgba(${40+i*30},${150+i*20},${80+i*40},1)`);
    aug.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=aug;
    ctx.beginPath(); ctx.moveTo(-50,0);
    for (let ax=0;ax<=w+50;ax+=30) {
      const ay=h*0.15+Math.sin((ax+t*1.2+i*100)*0.012)*50;
      ctx.lineTo(ax,ay);
    }
    ctx.lineTo(w+50,0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Far peak backdrop
  const peakG=ctx.createLinearGradient(0,h*0.1,0,h*0.7);
  peakG.addColorStop(0,'#c8d8f0'); peakG.addColorStop(0.5,'#8898b8'); peakG.addColorStop(1,'#505870');
  mountain(ctx,-80,h*0.12,450,h*0.6,  '#8090b0','#606888');
  mountain(ctx,260,h*0.06,480,h*0.68, '#9aaac4','#6a7898');
  mountain(ctx,580,h*0.15,350,h*0.58, '#7888a8','#586080');

  // Snow caps
  [[[-80,h*0.12,290],[260,h*0.06,500],[580,h*0.15,405]],].flat().forEach(([px,py,pw])=>{
    ctx.fillStyle='#e8f0ff';
    ctx.beginPath();
    ctx.moveTo(px,py+h*0.08); ctx.lineTo(px+pw/2,py); ctx.lineTo(px+pw,py+h*0.08);
    ctx.closePath(); ctx.fill();
  });

  // Icicles along top
  ctx.fillStyle='#c0d8f8';
  for (let i=0;i<16;i++) {
    const ix=w*0.15+i*(w*0.7/16);
    const il=15+Math.sin(i*1.9)*12;
    ctx.beginPath(); ctx.moveTo(ix-4,0); ctx.lineTo(ix,il); ctx.lineTo(ix+4,0); ctx.closePath(); ctx.fill();
    // Glint
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillRect(ix-0.5,0,1,il*0.3);
    ctx.fillStyle='#c0d8f8';
  }

  // Ground snow — layered
  const snowG=ctx.createLinearGradient(0,h*0.62,0,h);
  snowG.addColorStop(0,'#c8d8f0'); snowG.addColorStop(0.3,'#b8c8e0'); snowG.addColorStop(1,'#a0b0d0');
  ctx.fillStyle=snowG; ctx.fillRect(0,h*0.62,w,h*0.38);

  // Snow mounds
  ctx.fillStyle='#d8e8ff';
  for (let i=0;i<6;i++) {
    const mx2=w*0.1+i*w*0.15;
    ctx.beginPath(); ctx.ellipse(mx2,h*0.63,50+i*15,20,0,0,Math.PI*2); ctx.fill();
  }

  // Rocks poking through snow
  [[w*0.1,h*0.58],[w*0.72,h*0.60],[w*0.44,h*0.61]].forEach(([rx,ry])=>{
    ctx.fillStyle='#607090'; ctx.beginPath(); ctx.ellipse(rx,ry,45,22,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#d8e8ff'; ctx.beginPath(); ctx.ellipse(rx,ry-12,42,8,0,0,Math.PI*2); ctx.fill();
  });

  // Wind-blown snow
  if (Math.random()<0.5) ps.ambient(w/2,h/2,'snow');
  // Extra driven snow
  ctx.save(); ctx.globalAlpha=0.15;
  for (let i=0;i<8;i++) {
    const sx=(t*3+i*120)%(w+60)-30;
    const sy=Math.sin(i*0.7+t*0.02)*h*0.3+h*0.3;
    ctx.fillStyle='#e0eeff'; ctx.fillRect(sx,sy,40,1.5);
  }
  ctx.restore();
}

// ============================================================
// 4. SUNKEN CITY — Drowned ruins, bioluminescent
// ============================================================
function drawScene_sunken_city(ctx, w, h, t, ps) {
  skyGrad(ctx, w, h, [
    [0,'#050210'],[0.25,'#0a0520'],[0.5,'#100830'],[0.75,'#180a40'],[1,'#0a0820']
  ]);
  stars(ctx, w, h, t, 60);

  // Nebula
  [[w*0.3,h*0.2,'rgba(80,20,160,0.35)'],[w*0.65,h*0.25,'rgba(20,60,180,0.25)']].forEach(([nx,ny,nc])=>{
    const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,w*0.4);
    ng.addColorStop(0,nc); ng.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ng; ctx.fillRect(0,0,w,h);
  });

  // Ruined towers
  const towers=[
    [w*0.08,h*0.18,58,h*0.52],
    [w*0.30,h*0.10,70,h*0.60],
    [w*0.58,h*0.14,62,h*0.56],
    [w*0.78,h*0.20,50,h*0.50],
  ];
  for (const [tx,ty,tw,th] of towers) {
    const tg=ctx.createLinearGradient(tx,ty,tx,ty+th);
    tg.addColorStop(0,'#1a0c28'); tg.addColorStop(0.5,'#140820'); tg.addColorStop(1,'#0c0618');
    ctx.fillStyle=tg; ctx.fillRect(tx,ty,tw,th);
    // Crumbled top
    ctx.fillStyle='#0e0618';
    for (let ci=0;ci<5;ci++) {
      ctx.fillRect(tx+ci*(tw/5), ty-5-Math.random()*12, tw/5, 10+Math.random()*10);
    }
    // Arched windows
    for (let wi=0;wi<3;wi++) {
      const wy=ty+th*0.15+wi*(th*0.22);
      const wx2=tx+tw*0.25;
      const wp=0.3+0.5*Math.abs(Math.sin(t*0.03+tx+wi));
      ctx.fillStyle=`rgba(60,20,120,${wp*0.6})`;
      ctx.fillRect(wx2,wy,tw*0.5,th*0.12);
      ctx.beginPath(); ctx.arc(wx2+tw*0.25,wy,tw*0.25,Math.PI,0); ctx.fill();
      // Glow
      const wg=ctx.createRadialGradient(wx2+tw*0.25,wy,0,wx2+tw*0.25,wy,20);
      wg.addColorStop(0,`rgba(100,40,255,${wp*0.5})`); wg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=wg; ctx.fillRect(wx2-10,wy-10,tw*0.5+20,35);
    }
  }

  // Water surface
  water(ctx, 0, h*0.60, w, h*0.40, '#080420', t);

  // Reflections
  ctx.save(); ctx.globalAlpha=0.18;
  ctx.scale(1,-0.45); ctx.translate(0,-(h*0.60)*2-h*0.40);
  for (const [tx,ty,tw,th] of towers) {
    ctx.fillStyle='#4030a0'; ctx.fillRect(tx,ty,tw,th*0.6);
  }
  ctx.restore();

  // Bioluminescent plants / coral
  const bioPlants=[
    [w*0.12,h*0.62,'#40ffb0'],[w*0.28,h*0.64,'#8040ff'],
    [w*0.46,h*0.61,'#40c0ff'],[w*0.65,h*0.63,'#ff40a0'],
    [w*0.85,h*0.62,'#60ff80'],
  ];
  bioPlants.forEach(([bx,by,bc])=>{
    const bp=0.5+0.5*Math.sin(t*0.05+bx);
    const bg=ctx.createRadialGradient(bx,by,0,bx,by,25);
    bg.addColorStop(0,bc+'b0'); bg.addColorStop(1,bc+'00');
    ctx.globalAlpha=bp; ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(bx,by,25,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    // Stem + fronds
    ctx.strokeStyle=bc; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(bx,by+15); ctx.lineTo(bx,by-18); ctx.stroke();
    [-12,-6,0,6,12].forEach((fx,fi)=>{
      ctx.beginPath(); ctx.moveTo(bx,by-5-fi*2); ctx.quadraticCurveTo(bx+fx,by-12-fi*2,bx+fx*1.5,by-18-fi*2); ctx.stroke();
    });
  });

  // Floating debris particles
  if (Math.random()<0.05) {
    ps.emit(Math.random()*w, h*0.7+Math.random()*h*0.3, {
      vx:(Math.random()-0.5)*0.4, vy:-0.3, size:2, color:'#4030a0', life:200, drag:0.99,
    });
  }
}

// ============================================================
// 5. DREADMOOR — Gothic horror swamp
// ============================================================
function drawScene_dreadmoor(ctx, w, h, t, ps) {
  skyGrad(ctx, w, h, [
    [0,'#020202'],[0.3,'#08030a'],[0.6,'#0f0408'],[1,'#080302']
  ]);

  // Blood moon
  const bmx=w*0.72, bmy=h*0.13;
  const bmglow=ctx.createRadialGradient(bmx,bmy,0,bmx,bmy,90);
  bmglow.addColorStop(0,'rgba(180,30,10,0.5)');
  bmglow.addColorStop(0.3,'rgba(140,10,5,0.25)');
  bmglow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bmglow; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#b82010'; ctx.beginPath(); ctx.arc(bmx,bmy,26,0,Math.PI*2); ctx.fill();
  // Craters
  ctx.fillStyle='rgba(0,0,0,0.2)';
  [[bmx-7,bmy-4,6],[bmx+8,bmy+6,4],[bmx-3,bmy+8,3]].forEach(([cx,cy,cr])=>{
    ctx.beginPath(); ctx.arc(cx,cy,cr,0,Math.PI*2); ctx.fill();
  });
  // Red moon rim
  ctx.strokeStyle='rgba(255,80,0,0.3)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.arc(bmx,bmy,30,0,Math.PI*2); ctx.stroke();

  // Moon-blood on water
  const mbg=ctx.createLinearGradient(bmx,bmy,bmx-60,h);
  mbg.addColorStop(0,'rgba(150,20,10,0.15)'); mbg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=mbg; ctx.fillRect(0,0,w,h);

  // Murky water
  const swampG=ctx.createLinearGradient(0,h*0.58,0,h);
  swampG.addColorStop(0,'#0a0c06'); swampG.addColorStop(0.5,'#060a04'); swampG.addColorStop(1,'#040804');
  ctx.fillStyle=swampG; ctx.fillRect(0,h*0.58,w,h*0.42);
  // Water shimmer
  ctx.save(); ctx.beginPath(); ctx.rect(0,h*0.58,w,h*0.42); ctx.clip();
  ctx.strokeStyle='rgba(100,20,10,0.15)'; ctx.lineWidth=1;
  for (let wy=h*0.62;wy<h;wy+=16) {
    ctx.beginPath();
    for (let wx=0;wx<w;wx+=4) {
      const oy=Math.sin((wx*0.05+t*0.8))*2+Math.sin((wx*0.03-t*0.5))*1.5;
      wx===0?ctx.moveTo(wx,wy+oy):ctx.lineTo(wx,wy+oy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Mud banks
  ctx.fillStyle='#100c06'; ctx.fillRect(0,h*0.62,w*0.28,h*0.38);
  ctx.fillStyle='#0c0a04'; ctx.fillRect(w*0.55,h*0.64,w*0.45,h*0.36);

  // Dead trees — dramatic silhouettes
  const dTrees=[
    [w*0.04,h*0.28],[w*0.15,h*0.20],[w*0.30,h*0.32],[w*0.62,h*0.25],[w*0.78,h*0.22],[w*0.92,h*0.30],
  ];
  dTrees.forEach(([dtx,dty],i)=>{
    ctx.fillStyle='#0a0804';
    ctx.fillRect(dtx-4,dty,8,h*0.55);
    // Gnarled branches
    ctx.strokeStyle='#0e0c08'; ctx.lineWidth=2;
    [
      [dtx,dty+20,dtx-35,dty-8,dtx-55,dty-20],
      [dtx,dty+40,dtx+38,dty+24,dtx+58,dty+12],
      [dtx,dty+60,dtx-28,dty+42,dtx-42,dty+30],
      [dtx,dty+80,dtx+25,dty+65,dtx+36,dty+55],
    ].forEach(pts=>{
      ctx.beginPath(); ctx.moveTo(pts[0],pts[1]);
      ctx.quadraticCurveTo(pts[2],pts[3],pts[4]||pts[2],pts[5]||pts[3]);
      ctx.stroke();
    });
  });

  // Fog tendrils
  fog(ctx, w, h, h*0.52, 0.55, t);

  // Will o' wisps
  for (let i=0;i<4;i++) {
    const wp=0.4+0.5*Math.sin(t*0.06+i*2.1);
    const wx=w*0.1+i*w*0.25+Math.sin(t*0.03+i)*30;
    const wy=h*0.5+Math.sin(t*0.05+i*1.3)*20;
    const wg=ctx.createRadialGradient(wx,wy,0,wx,wy,15);
    wg.addColorStop(0,`rgba(100,255,50,${wp*0.8})`);
    wg.addColorStop(1,'rgba(100,255,50,0)');
    ctx.fillStyle=wg; ctx.beginPath(); ctx.arc(wx,wy,15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=`rgba(200,255,150,${wp})`; ctx.beginPath(); ctx.arc(wx,wy,3,0,Math.PI*2); ctx.fill();
  }

  // Ambient particle
  if (Math.random()<0.08) {
    ps.emit(Math.random()*w, h*0.5+Math.random()*h*0.15, {
      vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6,
      size:2, color:'#80ff30', life:140, glow:true, drag:0.99,
    });
  }
}

// ============================================================
// 6. OBSIDIAN CITADEL — Volcanic apocalypse
// ============================================================
function drawScene_citadel(ctx, w, h, t, ps) {
  skyGrad(ctx, w, h, [
    [0,'#020002'],[0.2,'#100008'],[0.4,'#1a000c'],[0.65,'#300008'],[1,'#500010']
  ]);

  // Volcanic horizon glow
  const volG=ctx.createLinearGradient(0,h*0.55,0,h);
  volG.addColorStop(0,'rgba(0,0,0,0)');
  volG.addColorStop(0.4,'rgba(180,40,0,0.3)');
  volG.addColorStop(1,'rgba(240,80,0,0.6)');
  ctx.fillStyle=volG; ctx.fillRect(0,h*0.5,w,h*0.5);

  // Distant volcano
  ctx.fillStyle='#0a0008';
  mountain(ctx, w*0.58, h*0.3, w*0.5, h*0.5, '#0a0008','#060006');
  // Lava glow at volcano top
  const vlg=ctx.createRadialGradient(w*0.83,h*0.3,0,w*0.83,h*0.3,60);
  vlg.addColorStop(0,'rgba(255,100,0,0.6)'); vlg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=vlg; ctx.fillRect(0,0,w,h);

  // THE CITADEL
  const cx=w*0.45;
  // Black stone platform
  ctx.fillStyle='#080008'; ctx.fillRect(cx-160,h*0.58,320,h*0.42);

  // Main tower
  const towerG=ctx.createLinearGradient(cx-35,h*0.1,cx+35,h*0.1);
  towerG.addColorStop(0,'#050008'); towerG.addColorStop(0.5,'#0a000e'); towerG.addColorStop(1,'#050008');
  ctx.fillStyle=towerG; ctx.fillRect(cx-35,h*0.08,70,h*0.52);

  // Flanking towers
  ctx.fillStyle='#060008';
  ctx.fillRect(cx-120,h*0.22,48,h*0.38);
  ctx.fillRect(cx+72, h*0.25,48,h*0.35);

  // Mini towers
  ctx.fillRect(cx-170,h*0.32,32,h*0.28);
  ctx.fillRect(cx+138,h*0.34,32,h*0.26);

  // Battlements on main tower
  for (let bi=0;bi<7;bi++) {
    ctx.fillStyle='#0a000e'; ctx.fillRect(cx-32+bi*11,h*0.08-16,8,16);
    if (bi%2===0) { ctx.fillStyle='#150015'; ctx.fillRect(cx-32+bi*11,h*0.08-20,8,5); }
  }

  // Glowing windows
  const winFlicker=0.55+0.45*Math.sin(t*0.08);
  [
    [cx-18,h*0.18],[cx+5,h*0.18],[cx-8,h*0.30],[cx-8,h*0.42],[cx-8,h*0.50],
    [cx-105,h*0.30],[cx+80,h*0.33],
  ].forEach(([wx,wy])=>{
    ctx.fillStyle=`rgba(255,20,0,${winFlicker*0.9})`;
    ctx.fillRect(wx,wy,12,18);
    ctx.beginPath(); ctx.arc(wx+6,wy,6,Math.PI,0); ctx.fill();
    // Window glow
    const wg=ctx.createRadialGradient(wx+6,wy+9,0,wx+6,wy+9,20);
    wg.addColorStop(0,`rgba(255,60,0,${winFlicker*0.4})`); wg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=wg; ctx.fillRect(wx-14,wy-14,40,40);
  });

  // Lightning
  if (Math.sin(t*0.28)>0.93) {
    ctx.strokeStyle=`rgba(180,60,255,0.85)`; ctx.lineWidth=2.5;
    ctx.shadowBlur=12; ctx.shadowColor='#8000ff';
    let lx=cx+randInt(-100,100), ly=0;
    ctx.beginPath(); ctx.moveTo(lx,ly);
    while(ly<h*0.38){lx+=randInt(-25,25);ly+=randInt(25,50);ctx.lineTo(lx,ly);}
    ctx.stroke(); ctx.shadowBlur=0;
  }

  // Lava ground
  const lavaG=ctx.createLinearGradient(0,h*0.68,0,h);
  lavaG.addColorStop(0,'#1a0400'); lavaG.addColorStop(0.3,'#3a0800'); lavaG.addColorStop(0.7,'#600e00'); lavaG.addColorStop(1,'#901a00');
  ctx.fillStyle=lavaG; ctx.fillRect(0,h*0.68,w,h*0.32);

  // Lava cracks
  ctx.strokeStyle='#ff5000'; ctx.lineWidth=2.5;
  [[0.08,0.72,0.32,0.80],[0.35,0.75,0.62,0.82],[0.65,0.71,0.90,0.78],[0.15,0.82,0.40,0.88],[0.55,0.79,0.85,0.86]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath(); ctx.moveTo(x1*w,y1*h); ctx.lineTo(x2*w,y2*h); ctx.stroke();
  });
  // Lava glow
  ctx.globalAlpha=0.4+0.2*Math.sin(t*0.1);
  ctx.fillStyle='rgba(255,80,0,0.2)'; ctx.fillRect(0,h*0.68,w,h*0.32);
  ctx.globalAlpha=1;

  // Ash
  if (Math.random()<0.35) ps.ambient(w/2,h/2,'ash');
}

// ============================================================
// 7. CAMP — Warm bonfire at night
// ============================================================
function drawScene_camp(ctx, w, h, t, ps) {
  skyGrad(ctx, w, h, [
    [0,'#010108'],[0.3,'#04040e'],[0.6,'#060612'],[1,'#080816']
  ]);
  stars(ctx, w, h, t, 200);

  // Moon
  ctx.fillStyle='rgba(200,210,255,0.2)';
  ctx.beginPath(); ctx.arc(w*0.18,h*0.1,40,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e0e8f8'; ctx.beginPath(); ctx.arc(w*0.18,h*0.1,24,0,Math.PI*2); ctx.fill();

  // Forest silhouette
  treeLine(ctx, h*0.45, w, ['#04060a','#060810'], [0,18], t*0.1);

  // Ground
  const gG=ctx.createLinearGradient(0,h*0.65,0,h);
  gG.addColorStop(0,'#14100a'); gG.addColorStop(1,'#0a0804');
  ctx.fillStyle=gG; ctx.fillRect(0,h*0.65,w,h*0.35);

  // Fire glow on ground
  const fx=w/2, fy=h*0.74;
  const flicker=0.7+0.3*Math.sin(t*0.28+Math.sin(t*0.7)*0.4);

  const fireGround=ctx.createRadialGradient(fx,fy,0,fx,fy,160);
  fireGround.addColorStop(0,`rgba(255,140,30,${flicker*0.5})`);
  fireGround.addColorStop(0.3,`rgba(255,80,0,${flicker*0.2})`);
  fireGround.addColorStop(0.6,`rgba(200,60,0,${flicker*0.08})`);
  fireGround.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=fireGround; ctx.fillRect(0,0,w,h);

  // Sitting stones
  [[fx-120,fy+30],[fx+110,fy+28],[fx-65,fy+55],[fx+60,fy+55]].forEach(([sx,sy])=>{
    ctx.fillStyle='#1c160e'; ctx.beginPath(); ctx.ellipse(sx,sy,28,12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#241c12'; ctx.beginPath(); ctx.ellipse(sx,sy-4,25,10,0,0,Math.PI*2); ctx.fill();
  });

  // Logs
  ctx.fillStyle='#3a1e08';
  ctx.save(); ctx.translate(fx,fy+12); ctx.rotate(0.45); ctx.fillRect(-36,-6,72,12); ctx.restore();
  ctx.save(); ctx.translate(fx,fy+12); ctx.rotate(-0.45); ctx.fillRect(-36,-6,72,12); ctx.restore();
  // Log ends (circles)
  ctx.fillStyle='#5a2e0e';
  ctx.beginPath(); ctx.arc(fx+32*Math.cos(0.45),fy+12+32*Math.sin(0.45),7,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(fx-32*Math.cos(0.45),fy+12+32*Math.sin(0.45),7,0,Math.PI*2); ctx.fill();

  // Flames (layered)
  const fh=36+18*Math.sin(t*0.38);
  [
    {x:fx-10,w:24,h:fh*0.7,col:'rgba(200,20,0,0.9)'},
    {x:fx-6, w:18,h:fh*0.85,col:'rgba(255,80,0,0.9)'},
    {x:fx-2, w:12,h:fh,     col:'rgba(255,160,0,0.95)'},
    {x:fx+2, w:8, h:fh*0.7, col:'rgba(255,220,80,0.9)'},
  ].forEach(({x,w:fw,h:fh2,col})=>{
    ctx.fillStyle=col;
    ctx.beginPath();
    ctx.moveTo(x,     fy+8);
    ctx.quadraticCurveTo(x-fw*0.4, fy-fh2*0.4, x+fw/2, fy-fh2);
    ctx.quadraticCurveTo(x+fw*1.4, fy-fh2*0.4, x+fw,   fy+8);
    ctx.closePath(); ctx.fill();
  });

  // Sparks / embers
  if (Math.random()<0.38) ps.ambient(fx,fy,'ember');
}

// ============================================================
// 8. TITLE — Epic panorama
// ============================================================
function drawScene_title(ctx, w, h, t, ps) {
  skyGrad(ctx, w, h, [
    [0,'#010108'],[0.25,'#04050e'],[0.5,'#080c18'],[0.7,'#0c1020'],[1,'#080c18']
  ]);
  stars(ctx, w, h, t, 250);

  // Aurora
  ctx.save();
  for (let i=0;i<4;i++) {
    ctx.globalAlpha=0.1+0.07*Math.sin(t*0.025+i*1.2);
    const aug=ctx.createLinearGradient(0,0,0,h*0.45);
    aug.addColorStop(0,'rgba(0,0,0,0)');
    aug.addColorStop(0.5,`rgba(${30+i*25},${120+i*25},${60+i*20},1)`);
    aug.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=aug;
    ctx.beginPath(); ctx.moveTo(-50,0);
    for (let ax=0;ax<=w+50;ax+=25) {
      const ay=h*0.18+Math.sin((ax+t*0.7+i*80)*0.014)*55;
      ctx.lineTo(ax,ay);
    }
    ctx.lineTo(w+50,0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Large moon
  const mlg=ctx.createRadialGradient(w*0.8,h*0.1,0,w*0.8,h*0.1,60);
  mlg.addColorStop(0,'rgba(220,230,255,0.3)'); mlg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=mlg; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#e8eeff'; ctx.beginPath(); ctx.arc(w*0.8,h*0.1,30,0,Math.PI*2); ctx.fill();

  // Distant peaks — layers
  [['-80,0.28,480,0.45','#060610','#040408'],[' 200,0.20,500,0.55','#080818','#06060e'],['550,0.25,400,0.48','#060610','#040408']].forEach((s,i)=>{
    const [px,py,pw,ph2]=(s[0]||s).split(',').map(Number);
    mountain(ctx, px, h*py, pw, h*ph2, ['#0c0c22','#10103a','#0c0c22'][i], ['#060612','#0a0a28','#060612'][i]);
  });
  mountain(ctx,-80,h*0.28,480,h*0.45,'#0c0c22','#060612');
  mountain(ctx,200,h*0.20,500,h*0.55,'#10103a','#0a0a28');
  mountain(ctx,550,h*0.25,400,h*0.48,'#0c0c22','#060612');

  // Snow on peaks
  ctx.fillStyle='#c8d0f0';
  [[-80,h*0.28,160],[200,h*0.20,250],[550,h*0.25,200]].forEach(([px,py,pw])=>{
    ctx.beginPath(); ctx.moveTo(px,py+h*0.06); ctx.lineTo(px+pw/2,py); ctx.lineTo(px+pw,py+h*0.06); ctx.closePath(); ctx.fill();
  });

  // Foreground hills
  const hg=ctx.createLinearGradient(0,h*0.62,0,h);
  hg.addColorStop(0,'#0c1208'); hg.addColorStop(1,'#060a04');
  ctx.fillStyle=hg;
  ctx.beginPath(); ctx.moveTo(-10,h*0.64);
  for (let hx=0;hx<=w+10;hx+=30) {
    ctx.lineTo(hx,h*0.62+Math.sin(hx*0.018)*20+Math.cos(hx*0.035)*12);
  }
  ctx.lineTo(w+10,h); ctx.lineTo(-10,h); ctx.closePath(); ctx.fill();

  // Road into distance
  const rdG=ctx.createLinearGradient(w/2,h*0.65,w/2,h);
  rdG.addColorStop(0,'#1a1810'); rdG.addColorStop(1,'#0e0c08');
  ctx.fillStyle=rdG;
  ctx.beginPath(); ctx.moveTo(w*0.4,h*0.66); ctx.lineTo(w*0.6,h*0.66); ctx.lineTo(w*0.62,h); ctx.lineTo(w*0.38,h); ctx.closePath(); ctx.fill();
  // Road lines
  ctx.strokeStyle='rgba(80,70,50,0.4)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(w*0.5,h*0.66); ctx.lineTo(w*0.5,h); ctx.stroke();

  // Torch glow on path
  const tg=ctx.createRadialGradient(w*0.5,h*0.68,0,w*0.5,h*0.68,80);
  tg.addColorStop(0,`rgba(255,150,40,${0.15+0.08*Math.sin(t*0.12)})`); tg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=tg; ctx.fillRect(0,0,w,h);
}
