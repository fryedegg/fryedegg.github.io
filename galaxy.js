/* A procedural canvas atlas. Coordinates come from the original campaign map. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const MIN_ZOOM = .34;
  // The Celestial Tunnel network belongs to the celestial plane, outside planetary orbits.
  const HARVEST_STARS = [
    [-210,780],[-210,390],[-210,-40],[-210,-390],[-210,-710],
    [-330,-860],[-310,-1000],[-260,-1110],[-150,-1220],[0,-1260],
    [150,-1220],[260,-1110],[310,-1000],[330,-860],[210,-710],
    [210,-390],[210,-40],[210,390],[210,780],
    [310,680],[530,680],[690,790],[740,1010],[670,1200],[470,1290],
    [270,1270],[90,1160],[0,1070],[-90,1160],[-270,1270],
    [-470,1290],[-670,1200],[-740,1010],[-690,790],[-530,680],[-310,680]
  ];
  const hash = s => [...s].reduce((n,c) => (Math.imul(n,31) + c.charCodeAt(0)) | 0, 7) >>> 0;
  const rng = seed => () => ((seed = Math.imul(seed,1664525) + 1013904223 >>> 0) / 4294967296);
  const coords = l => {
    if(l.id === 'maw') return {x:850,y:-780};
    if(l.x != null) return {x:l.x-1000,y:l.y-1000};
    const a=(l.angle-90)*Math.PI/180;
    return {x:Math.cos(a)*l.radius,y:Math.sin(a)*l.radius};
  };
  const palettes = [ ['#99b9c9','#355968','#122335'], ['#c2a28b','#79574a','#271e27'], ['#9aaf93','#3d685e','#14262a'], ['#aa99c7','#5b5281','#191c35'], ['#d7c497','#907855','#282c36'], ['#7892c0','#3d538e','#151c37'] ];
  function planetTexture(loc) {
    const seed=hash(loc.id), random=rng(seed), c=document.createElement('canvas');c.width=c.height=128;
    const x=c.getContext('2d'), p=palettes[seed%palettes.length];
    x.save();x.beginPath();x.arc(64,64,59,0,TAU);x.clip();
    const g=x.createRadialGradient(35,33,3,70,72,83);g.addColorStop(0,p[0]);g.addColorStop(.55,p[1]);g.addColorStop(1,p[2]);x.fillStyle=g;x.fillRect(0,0,128,128);
    for(let i=0;i<60;i++) {const y=random()*120;x.globalAlpha=.05+random()*.15;x.fillStyle=i%3?'#d9e1dc':'#071526';x.beginPath();x.ellipse(random()*128,y,8+random()*45,1+random()*8,random()*.35,0,TAU);x.fill();}
    x.globalAlpha=1;const shade=x.createLinearGradient(12,0,117,0);shade.addColorStop(0,'#03071400');shade.addColorStop(.47,'#03071400');shade.addColorStop(.82,'#03071499');shade.addColorStop(1,'#030714f5');x.fillStyle=shade;x.fillRect(0,0,128,128);
    const gloss=x.createRadialGradient(40,32,0,64,64,65);gloss.addColorStop(0,'#d3edff24');gloss.addColorStop(.85,'#070d2200');gloss.addColorStop(1,'#020614c4');x.fillStyle=gloss;x.fillRect(0,0,128,128);x.restore();
    return c;
  }
  class Galaxy {
    constructor(stage,options) {
      this.stage=stage;this.options=options;this.locations=options.locations;this.sessions=options.sessions;this.canvas=stage.querySelector('canvas');this.ctx=this.canvas.getContext('2d',{alpha:false});
      if(!this.ctx){stage.insertAdjacentHTML('beforeend','<p class="map-fallback">Your browser could not draw the chart. Every world is available in the Places directory.</p>');return;}
      this.nodes=stage.querySelector('.map-nodes');this.pins=new Map();this.textures=new Map();this.positions=new Map();this.pointers=new Map();this.abort=new AbortController();this.signal=this.abort.signal;
      this.zoom=1.12;this.pan={x:0,y:0};this.target={x:0,y:0};this.motion=options.motion;this.chart=false;this.filter='all';this.selected=null;this.sessionIndex=this.sessions.length-1;this.raf=0;this.time=0;this.lastFrame=0;this.width=1;this.height=1;this.dragDistance=0;
      for(const l of this.locations){const b=document.createElement('button');b.className='world-pin'+(l.visitedBy?' visited':'');b.type='button';b.setAttribute('aria-label',l.name+' — open map selection');b.title=l.name;b.dataset.world=l.id;b.innerHTML='<i aria-hidden="true"></i><span></span>';b.querySelector('span').textContent=l.name;this.nodes.append(b);this.pins.set(l.id,b);this.textures.set(l.id,planetTexture(l));
        b.addEventListener('click',e=>{e.stopPropagation();if(this.dragDistance>8)return;this.select(l.id);},{signal:this.signal});}
      this.realmPin=document.createElement('button');
      this.realmPin.type='button';this.realmPin.className='realm-pin';this.realmPin.hidden=true;
      this.realmPin.setAttribute('aria-label','Celestial Tunnel — divine plane of existence, A Day With Doc. Open realm dossier.');
      this.realmPin.innerHTML='<span>CELESTIAL PLANE · TUNNEL NETWORK</span><strong>Celestial Tunnel</strong><small>The entire constellation · A Day With Doc ↗</small>';
      this.nodes.append(this.realmPin);
      this.realmPin.addEventListener('click',e=>{e.stopPropagation();if(this.dragDistance<=8)window.location.hash='#world/celestial-tunnel';},{signal:this.signal});
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(stage);
      stage.addEventListener('wheel',e=>{e.preventDefault();this.changeZoom(e.deltaY>0?.89:1.12,{x:e.clientX-stage.getBoundingClientRect().left,y:e.clientY-stage.getBoundingClientRect().top});},{passive:false,signal:this.signal});
      stage.addEventListener('pointerdown',e=>this.pointerDown(e),{signal:this.signal});stage.addEventListener('pointermove',e=>this.pointerMove(e),{signal:this.signal});stage.addEventListener('pointerup',e=>this.pointerUp(e),{signal:this.signal});stage.addEventListener('pointercancel',e=>this.pointerUp(e),{signal:this.signal});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();else this.schedule();},{signal:this.signal});this.resize();if(window.GalaxyWebGLRenderer)this.webgl=new window.GalaxyWebGLRenderer(this);document.fonts?.ready.then(()=>{if(!this.destroyed){this.labelKey=null;this.draw();}});
    }
    resize(){const r=this.stage.getBoundingClientRect();this.width=r.width;this.height=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.base=Math.min(this.width/2400,(this.height-220)/(this.width<700?1150:1420));this.base=Math.max(.15,this.base);this.makeBackground();this.draw();this.schedule();}
    makeBackground(){const c=document.createElement('canvas');c.width=this.width;c.height=this.height;const x=c.getContext('2d'),r=rng(62842);x.fillStyle='#050a14';x.fillRect(0,0,c.width,c.height);
      for(const [px,py,radius,color] of [[.65,.44,.62,'#182b4b'],[.22,.55,.45,'#193941'],[.8,.3,.28,'#40264f']]){const g=x.createRadialGradient(c.width*px,c.height*py,0,c.width*px,c.height*py,c.width*radius);g.addColorStop(0,color+'77');g.addColorStop(.4,color+'28');g.addColorStop(1,color+'00');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);}
      // Wisps run behind the orbital plane; generated once per resize.
      for(let i=0;i<38;i++){const y=c.height*(.28+r()*.5),xx=c.width*r(),rr=45+r()*130;const g=x.createRadialGradient(xx,y,0,xx,y,rr);g.addColorStop(0,i%2?'#38556b10':'#444c8510');g.addColorStop(1,'#11182a00');x.fillStyle=g;x.fillRect(xx-rr,y-rr,rr*2,rr*2);}
      this.stars=[];const count=this.width<700?380:920;
      for(let i=0;i<count;i++){const star={x:r()*c.width,y:r()*c.height,r:r()*.9+.25,a:r()*.6+.15,phase:r()*TAU};this.stars.push(star);x.globalAlpha=star.a;x.fillStyle=i%9?'#c0d4e9':'#ded0b4';x.fillRect(star.x,star.y,star.r,star.r);if(star.r>1){x.globalAlpha=.05;x.beginPath();x.arc(star.x,star.y,3,0,TAU);x.fill();}}
      x.globalAlpha=1;this.background=c;
    }
    project(v){if(this.webgl?.ready&&!this.chart)return this.webgl.project(v);const tilt=this.chart?1:(this.orbitTilt??(this.width<700?.78:.59)),rot=this.chart?0:(this.orbitYaw??-.12);const rx=v.x*Math.cos(rot)-v.y*Math.sin(rot),ry=v.x*Math.sin(rot)+v.y*Math.cos(rot);return {x:this.width*.48+(rx+this.pan.x)*this.base*this.zoom,y:this.height*.52+(ry*tilt+this.pan.y)*this.base*this.zoom,depth:ry/1100};}
    visible(l){return this.filter==='all'||(this.filter==='visited'?!!l.visitedBy:l.visitedBy===this.filter||l.visitedBy==='both');}
    fullyZoomedOut(){return this.zoom<=MIN_ZOOM+.005;}
    constellationPoint([xx, yy]) {
      const angle = .25, across = xx * .65, scale=this.fullyZoomedOut()?2.48:3.4;
      return this.project({x:(across*Math.cos(angle)-yy*Math.sin(angle))*scale,
        y:(across*Math.sin(angle)+yy*Math.cos(angle))*scale*(this.chart?.6:1)});
    }
    drawOverviewSecrets(x) {
      const overview = this.fullyZoomedOut();
      this.stage.dataset.constellation = 'visible';
      this.stage.dataset.constellationComplete = String(overview);
      this.realmPin.hidden = !overview;
      const stars = HARVEST_STARS.map(p => this.constellationPoint(p));
      const crown = [[-330,-860],[-160,-810],[0,-790],[160,-810],[330,-860]].map(p => this.constellationPoint(p));
      x.save();x.globalAlpha=this.motion?.88+.08*Math.sin(this.time*.0006):.94;
      x.lineJoin='round';x.lineCap='round';
      const connect=points=>{x.beginPath();points.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));};
      connect([...stars,stars[0]]);x.strokeStyle='#759fd222';x.lineWidth=5;x.stroke();
      x.strokeStyle='#a4beed75';x.lineWidth=1.1;x.shadowColor='#829ae6';x.shadowBlur=9;x.stroke();
      connect(crown);x.strokeStyle='#a4beed5a';x.lineWidth=.9;x.stroke();x.shadowBlur=0;
      for(const [i,p] of [...stars,...crown.slice(1,-1)].entries()) {
        const radius=i%5===0?2.6:1.8;
        const halo=x.createRadialGradient(p.x,p.y,0,p.x,p.y,13);halo.addColorStop(0,'#afcaff70');halo.addColorStop(1,'#6b99ec00');
        x.fillStyle=halo;x.fillRect(p.x-13,p.y-13,26,26);x.fillStyle=i%5===0?'#f2dbb3':'#dce8ff';x.beginPath();x.arc(p.x,p.y,radius,0,TAU);x.fill();
        if(i%5===0){x.strokeStyle='#dce8ff70';x.lineWidth=.7;x.beginPath();x.moveTo(p.x-5,p.y);x.lineTo(p.x+5,p.y);x.moveTo(p.x,p.y-5);x.lineTo(p.x,p.y+5);x.stroke();}
      }
      x.restore();
      // Every connected star is part of the actual tunnel network; this is a plane, not a world.
      const tip=this.constellationPoint([0,-1260]);this.realmPosition=tip;
      const labelWidth=this.width<700?165:220;
      this.realmPin.style.left=Math.max(14,Math.min(this.width-labelWidth-14,tip.x-20))+'px';
      this.realmPin.style.top=Math.max(242,Math.min(this.height-205,tip.y-40))+'px';
    }
    layoutLabels() {
      const key=[this.width,this.height,this.zoom,this.pan.x.toFixed(2),this.pan.y.toFixed(2),this.orbitYaw,this.orbitTilt,this.chart,this.filter,this.selected,this.sessionIndex].join('|');
      if(key===this.labelKey)return;
      this.labelKey=key;this.labelSegments=[];
      const stageRect=this.stage.getBoundingClientRect();
      const intersects=(a,b,pad=3)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
      const reserved=[...this.stage.parentElement.querySelectorAll('.map-hud,.map-legend,.flight-log,.map-zoom,.map-help,.map-selection,.map-compass')]
        .filter(el=>!el.hidden&&el.getBoundingClientRect().width>0).map(el=>{const r=el.getBoundingClientRect();return{x:r.left-stageRect.left,y:r.top-stageRect.top,w:r.width,h:r.height};});
      if(!this.realmPin.hidden){const r=this.realmPin.getBoundingClientRect();reserved.push({x:r.left-stageRect.left,y:r.top-stageRect.top,w:r.width,h:r.height});}
      const used=[...reserved], planets=[...this.positions].map(([id,p])=>({id,x:p.x-p.radius-5,y:p.y-p.radius-5,w:(p.radius+5)*2,h:(p.radius+5)*2}));
      const core=this.project({x:0,y:0});
      const current=this.sessions[this.sessionIndex]?.where?.id;
      const priority=l=>l.id===this.selected?0:l.id===current?1:l.visitedBy?2:l.rim==='outer'||l.rim==='unknown'?3:4;
      const entries=this.locations.filter(l=>this.positions.has(l.id)).sort((a,b)=>priority(a)-priority(b)||a.id.localeCompare(b.id));
      this.ctx.save();this.ctx.font=(this.width<700?'8':'9')+'px JetBrains Mono, monospace';
      let shown=0;
      for(const l of entries) {
        const p=this.positions.get(l.id),b=this.pins.get(l.id),span=b.querySelector('span');
        b.hidden=p.x<-25||p.x>this.width+25||p.y<-25||p.y>this.height+25;
        if(b.hidden)continue;
        const width=Math.ceil(this.ctx.measureText(l.name).width)+8,height=this.width<700?15:16,gap=p.radius+8;
        const right=p.x>=core.x,down=p.y>=core.y;
        const directions=right?['right','ur','dr','up','down','left','ul','dl']:['left','ul','dl','up','down','right','ur','dr'];
        if(l.rim==='outer'||l.rim==='unknown')directions.splice(0,3,...(down?(right?['dr','right','down']:['dl','left','down']):(right?['ur','right','up']:['ul','left','up'])));
        let chosen;
        for(const delta of [0,14,-14,28,-28,44,-44,62,-62]) {
          for(const dir of directions) {
            let xx=p.x-width/2,yy=p.y-height/2;
            if(dir.includes('r')||dir==='right')xx=p.x+gap;
            if(dir.includes('l')||dir==='left')xx=p.x-gap-width;
            if(dir==='up'||dir.startsWith('u'))yy=p.y-gap-height;
            if(dir==='down'||dir.startsWith('d'))yy=p.y+gap;
            if(dir==='left'||dir==='right')yy+=delta;else xx+=delta;
            const candidate={x:xx,y:yy,w:width,h:height};
            if(xx<12||yy<12||xx+width>this.width-12||yy+height>this.height-12)continue;
            if(used.some(r=>intersects(candidate,r))||planets.some(r=>r.id!==l.id&&intersects(candidate,r,1)))continue;
            chosen=candidate;break;
          }
          if(chosen)break;
        }
        if(chosen){used.push(chosen);shown++;b.dataset.labelHidden='false';
          this.labelSegments.push({a:p,b:{x:Math.max(chosen.x,Math.min(chosen.x+width,p.x)),y:Math.max(chosen.y,Math.min(chosen.y+height,p.y))}});
        }else{b.dataset.labelHidden='true';chosen={x:Math.max(12,Math.min(this.width-width-12,p.x+gap)),y:Math.max(12,Math.min(this.height-height-12,p.y-height/2))};}
        b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.transform='translate(-50%,-50%)';
        span.style.left=(chosen.x-p.x+12)+'px';span.style.top=(chosen.y-p.y+12)+'px';span.style.opacity='';
        b.classList.toggle('selected',l.id===this.selected);b.setAttribute('aria-pressed',String(l.id===this.selected));
      }
      this.ctx.restore();this.stage.dataset.visibleLabels=String(shown);
    }
    draw(){if(!this.ctx||this.destroyed)return;const x=this.ctx,w=this.width,h=this.height;this.webgl?.syncCamera();x.drawImage(this.background,0,0,w,h);
      if(this.motion&&!document.hidden){for(let i=0;i<this.stars.length;i+=17){const s=this.stars[i];x.globalAlpha=.2+.25*Math.sin(this.time*.001+s.phase);x.fillStyle='#c7dfef';x.fillRect(s.x,s.y,1.5,1.5);}x.globalAlpha=1;}
      this.drawOverviewSecrets(x);
      for(const [i,r] of [280,540,820].entries()){x.beginPath();for(let n=0;n<=140;n++){const a=n/140*TAU,p=this.project({x:Math.cos(a)*r,y:Math.sin(a)*r});if(n===0)x.moveTo(p.x,p.y);else x.lineTo(p.x,p.y);}x.strokeStyle=['#91acb127','#88aeca32','#6a86ae38'][i];x.lineWidth=.7;x.setLineDash(i===2?[3,7]:[]);x.stroke();x.setLineDash([]);
        const p=this.project({x:-r*.65,y:-r*.76});x.font='8px JetBrains Mono, monospace';x.fillStyle='#65839a88';x.fillText(['INNER RIM','MIDREACH','OUTER RIM'][i],p.x-35,p.y-20);}
      // Session path connects only locations actually named in the flight log.
      const path=[];for(const s of this.sessions.slice(0,this.sessionIndex+1)){const l=this.locations.find(l=>l.id===s.where?.id);if(l&&path.at(-1)?.id!==l.id)path.push(l);}
      if(path.length>1){x.beginPath();path.forEach((l,i)=>{const p=this.project(coords(l));i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y);});x.strokeStyle='#89cecd58';x.lineWidth=1;x.setLineDash([4,6]);x.lineDashOffset=this.motion?-this.time*.006:0;x.stroke();x.setLineDash([]);}
      const core=this.project({x:0,y:0}),cr=14*Math.sqrt(this.zoom);let g=x.createRadialGradient(core.x,core.y,0,core.x,core.y,cr*6);g.addColorStop(0,'#e6c99d66');g.addColorStop(.3,'#e3af5933');g.addColorStop(1,'#ca966a00');x.fillStyle=g;x.fillRect(core.x-cr*6,core.y-cr*6,cr*12,cr*12);g=x.createRadialGradient(core.x-3,core.y-3,0,core.x,core.y,cr);g.addColorStop(0,'#fff1ce');g.addColorStop(.5,'#d4ae76');g.addColorStop(1,'#aa794a');x.fillStyle=g;x.beginPath();x.arc(core.x,core.y,cr,0,TAU);x.fill();x.fillStyle='#d1b47f98';x.font='8px JetBrains Mono, monospace';x.fillText('THE INNER LIGHT',core.x+cr+8,core.y+2);
      const current=this.sessions[this.sessionIndex]?.where?.id;
      const sorted=[...this.locations].sort((a,b)=>coords(a).y-coords(b).y);this.positions.clear();
      for(const l of sorted){const b=this.pins.get(l.id);b.hidden=!this.visible(l);if(b.hidden)continue;const p=this.project(coords(l)),seed=hash(l.id),radius=(l.rim==='station'?6:9+(seed%9))*(this.chart?.64:(this.width<700?.54:1))*Math.sqrt(this.zoom)*(1+p.depth*.12);p.radius=radius;b.hidden=p.x<-25||p.x>w+25||p.y<-25||p.y>h+25;if(b.hidden)continue;this.positions.set(l.id,p);
        if(l.id==='maw'){const mg=x.createRadialGradient(p.x,p.y,0,p.x,p.y,radius*3);mg.addColorStop(0,'#010209');mg.addColorStop(.5,'#010209');mg.addColorStop(.67,'#8b547376');mg.addColorStop(1,'#51285600');x.fillStyle=mg;x.fillRect(p.x-radius*3,p.y-radius*3,radius*6,radius*6);x.strokeStyle='#9e668d88';x.beginPath();x.ellipse(p.x,p.y,radius*2,radius*.8,-.25,0,TAU);x.stroke();}
        else if(l.rim==='station'){x.save();x.translate(p.x,p.y);x.rotate(Math.PI/4);x.fillStyle='#8199b1';x.strokeStyle='#cbd9de';x.lineWidth=.5;x.fillRect(-radius*.7,-radius*.7,radius*1.4,radius*1.4);x.strokeRect(-radius,-radius,radius*2,radius*2);x.restore();}
        else {g=x.createRadialGradient(p.x,p.y,radius*.75,p.x,p.y,radius*1.5);g.addColorStop(0,'#80bde342');g.addColorStop(.65,'#77aadb0a');g.addColorStop(1,'#77aadb00');x.fillStyle=g;x.fillRect(p.x-radius*1.5,p.y-radius*1.5,radius*3,radius*3);if(!this.webgl?.ready||this.chart)x.drawImage(this.textures.get(l.id),p.x-radius,p.y-radius,radius*2,radius*2);if(seed%7===1&&!this.chart){x.strokeStyle='#b7bfc458';x.lineWidth=2;x.beginPath();x.ellipse(p.x,p.y,radius*1.6,radius*.43,-.28,0,TAU);x.stroke();}}
        if(l.id===this.selected||l.id===current){x.strokeStyle=l.id===this.selected?'#d1b47faa':'#86d4d1a0';x.lineWidth=1;x.setLineDash([2,5]);x.beginPath();x.arc(p.x,p.y,radius+7,0,TAU);x.stroke();x.setLineDash([]);if(l.id===current){x.fillStyle='#86d4d1';x.beginPath();x.moveTo(p.x-3,p.y-radius-14);x.lineTo(p.x+3,p.y-radius-14);x.lineTo(p.x,p.y-radius-9);x.fill();}}

      }
      this.webgl?.render();this.layoutLabels();
      x.strokeStyle='#7b9db83d';x.lineWidth=.6;
      for(const line of this.labelSegments||[]){if(Math.hypot(line.b.x-line.a.x,line.b.y-line.a.y)<18)continue;x.beginPath();x.moveTo(line.a.x,line.a.y);x.lineTo(line.b.x,line.b.y);x.stroke();}
      // Mild vignette keeps overlays legible without hiding the chart.
      g=x.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.25,w*.5,h*.5,Math.max(w,h)*.72);g.addColorStop(0,'#02050c00');g.addColorStop(1,'#02050c99');x.fillStyle=g;x.fillRect(0,0,w,h);
    }
    schedule(){if(this.raf||this.destroyed||document.hidden)return;const moving=Math.abs(this.pan.x-this.target.x)+Math.abs(this.pan.y-this.target.y)>1;if(!this.motion&&!moving){this.draw();return;}this.raf=requestAnimationFrame(t=>{this.raf=0;this.time=t;if(t-this.lastFrame>32||!this.motion){this.lastFrame=t;if(moving){this.pan.x+=(this.target.x-this.pan.x)*(this.motion?.12:1);this.pan.y+=(this.target.y-this.pan.y)*(this.motion?.12:1);}this.draw();}this.schedule();});}
    stop(){cancelAnimationFrame(this.raf);this.raf=0;}
    setMotion(value){this.motion=value;this.stop();this.draw();this.schedule();}
    setChart(value){this.chart=value;this.pan={x:0,y:0};this.target={x:0,y:0};this.draw();this.schedule();}
    setFilter(value){this.filter=value;this.draw();}
    setSession(index){this.sessionIndex=index;this.draw();}
    reset(){this.zoom=1.12;this.pan={x:0,y:0};this.target={x:0,y:0};this.orbitYaw=undefined;this.orbitTilt=undefined;this.selected=null;this.options.onSelect(null);this.draw();}
    select(id){this.selected=id;this.options.onSelect(this.locations.find(l=>l.id===id));this.draw();this.schedule();}
    focus(id){const l=this.locations.find(l=>l.id===id);if(!l)return;const p=coords(l),r=this.chart?0:(this.orbitYaw??-.12);this.zoom=Math.max(this.zoom,1.65);this.target={x:-(p.x*Math.cos(r)-p.y*Math.sin(r))+(this.width<700?-50:-140),y:-(p.x*Math.sin(r)+p.y*Math.cos(r))*(this.chart?1:(this.orbitTilt??(this.width<700?.78:.59)))+80};this.select(id);this.schedule();}
    changeZoom(factor,anchor){const z=Math.max(MIN_ZOOM,Math.min(5,this.zoom*factor));if(anchor){const p={x:(anchor.x-this.width*.48)/(this.base*this.zoom)-this.pan.x,y:(anchor.y-this.height*.52)/(this.base*this.zoom)-this.pan.y};this.pan.x=(anchor.x-this.width*.48)/(this.base*z)-p.x;this.pan.y=(anchor.y-this.height*.52)/(this.base*z)-p.y;this.target={...this.pan};}if(z===MIN_ZOOM&&this.zoom!==MIN_ZOOM){this.pan={x:0,y:0};this.target={x:0,y:0};}this.zoom=z;this.draw();}
    pointerDown(e){if(e.button>0)return;this.dragDistance=0;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!e.target.closest('.world-pin,.realm-pin'))this.stage.setPointerCapture(e.pointerId);this.lastPointer={x:e.clientX,y:e.clientY};this.stage.classList.add('dragging');if(this.pointers.size===2){const v=[...this.pointers.values()];this.pinch=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);}}
    pointerMove(e){if(!this.pointers.has(e.pointerId))return;const old=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.dragDistance+=Math.hypot(e.clientX-old.x,e.clientY-old.y);if(this.pointers.size===2){const v=[...this.pointers.values()],d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(this.pinch)this.changeZoom(d/this.pinch);this.pinch=d;return;}if(!this.chart&&(this.orbitDrag||e.altKey)){this.orbitYaw=(this.orbitYaw??-.12)+(e.clientX-old.x)*.005;this.orbitTilt=Math.max(.22,Math.min(.96,(this.orbitTilt??(this.width<700?.78:.59))+(e.clientY-old.y)*.002));this.draw();return;}const scale=this.base*this.zoom;this.pan.x+=(e.clientX-old.x)/scale;this.pan.y+=(e.clientY-old.y)/scale;this.target={...this.pan};this.draw();}
    pointerUp(e){this.pointers.delete(e.pointerId);if(this.pointers.size<2)this.pinch=null;if(!this.pointers.size)this.stage.classList.remove('dragging');if(this.dragDistance<8&&!e.target.closest('.world-pin,.realm-pin')){const rect=this.stage.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;if(this.fullyZoomedOut()&&this.realmPosition&&Math.hypot(this.realmPosition.x-px,this.realmPosition.y-py)<28){this.realmPin.click();return;}let best=null,d=28;for(const [id,p] of this.positions){const dd=Math.hypot(p.x-px,p.y-py);if(dd<d){best=id;d=dd;}}if(best)this.select(best);}}
    destroy(){this.destroyed=true;this.stop();this.abort?.abort();this.resizeObserver?.disconnect();this.webgl?.destroy();}
  }
  window.ShatteringGalaxy=Galaxy;
})();
