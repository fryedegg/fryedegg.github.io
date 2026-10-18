/* Public links from preserved dossiers to the growing shared record. Only the
   selected, approved proposals are shown; approval source snapshots are omitted. */
window.createCampaignContext=function(ctx){
  'use strict';
  const {D,esc,path}=ctx,S=()=>window.CampaignSync,list=v=>Array.isArray(v)?v:[];
  let currentRoute='',currentSub='',unsubscribe=null,generation=0;
  const entries=key=>list(S()?.get(key,{entries:[]})?.entries).filter(e=>e&&typeof e==='object');
  const excerpt=(v,n=700)=>{const s=String(v??'');return s.length>n?s.slice(0,n).trim()+'…':s;};
  const knownSession=s=>D.SESSIONS.some(x=>x.num===s);
  function source(source){return source?.session&&knownSession(source.session)?`<a href="${path('session',source.session)}">${esc(source.session)} · Source session ↗</a>`:'';}
  function content(route,sub){const target=route==='world'?'world:'+sub:route==='person'?'person:'+sub:'session:'+sub;
    const consequences=entries('consequences').filter(e=>e.subject===target||route==='session'&&e.source?.session===sub);
    const journals=entries('characters').filter(e=>e.contact===target||route==='person'&&e.character===sub||route==='session'&&e.source?.session===sub);
    const ledger=entries('ledger').filter(e=>e.subject===target||route==='session'&&e.source?.session===sub);
    const dossier=route==='world'?D.PLACE_ENTRIES.find(r=>r.id===sub):route==='person'?D.POI.find(r=>r.name===sub):null;
    const createsDossier=(a,p)=>dossier?._sharedCanon&&dossier._canonSource?.approvalId===a.id&&dossier._canonSource?.proposalId===p.id;
    const additions=entries('canon').flatMap(a=>list(a.proposals).filter(p=>p&&typeof p==='object'&&(p.target===target||createsDossier(a,p)||route==='session'&&a.snapshot?.session===sub)).map(p=>({approval:a,proposal:p})));
    const cards=[...consequences.map(e=>`<article class="campaign-context-card"><p class="eyebrow">LIVING CONSEQUENCE / ${esc(e.type||'record')}</p><h3>${esc(e.title)}</h3><p>${esc(excerpt(e.details))}</p>${e.type==='threat'?`<small>Visible clock · ${Math.max(0,Number(e.progress)||0)} / ${Math.max(2,Number(e.segments)||6)}</small>`:''}<a href="#consequences/${encodeURIComponent(e.id)}">Read the history ↗</a>${source(e.source)}</article>`),...journals.map(e=>`<article class="campaign-context-card"><p class="eyebrow">SHARED CREW LOG / ${esc(e.character)}</p><h3>${esc(e.title)}</h3><p>${esc(excerpt(e.details))}</p><a href="#crew-log/${encodeURIComponent(e.character)}">Open the crew log ↗</a>${source(e.source)}</article>`),...ledger.map(e=>`<article class="campaign-context-card"><p class="eyebrow">B.B.C. / ${esc(e.type||'MANIFEST')}</p><h3>${esc(e.title)}</h3><p>${esc(excerpt(e.details))}</p><a href="#ship-log">Open the ship ledger ↗</a>${source(e.source)}</article>`),...additions.map(({approval:a,proposal:p})=>`<article class="campaign-context-card"><p class="eyebrow">DM APPROVED / CAMPAIGN ADDITION</p><h3>${esc(p.title)}</h3><p>${esc(excerpt(p.text,2500))}</p>${source({session:a.snapshot?.session})}<a href="#intake">Approved additions ↗</a></article>`)];
    const crew=route==='person'&&D.CREW.some(c=>c.name===sub);
    return `<section class="campaign-context"><div class="campaign-context-head"><div><p class="eyebrow">THE LIVING RECORD</p><h2>Where the story goes next.</h2></div></div><div class="campaign-context-actions">${S()?.canDM()?`<a class="button secondary small" href="#director/${route}/${encodeURIComponent(sub)}">Prepare a scene here ↗</a>`:''}${crew?`<a class="button secondary small" href="#crew-log/${encodeURIComponent(sub)}">${esc(sub)}’s shared log ↗</a>`:''}<a class="button secondary small" href="#consequences">Campaign consequences ↗</a>${route==='session'?'<a class="button secondary small" href="#intake">Review session additions ↗</a>':''}</div>${cards.length?`<div class="campaign-context-grid">${cards.slice(0,24).join('')}</div>${cards.length>24?'<p class="campaign-context-empty">More related entries are available in the linked workspaces.</p>':''}`:'<p class="campaign-context-empty">Linked consequences, shared journal entries, and approved additions will appear here as the campaign grows.</p>'}</section>`;
  }
  function update(){const host=document.querySelector(currentRoute==='world'?'.dossier-main':currentRoute==='person'?'.person-details':'.session-card');if(!host)return;const html=content(currentRoute,currentSub),existing=host.querySelector('.campaign-context');if(existing)existing.outerHTML=html;else host.insertAdjacentHTML('beforeend',html);}
  function augment(route,sub){destroy();if(!['world','person','session'].includes(route))return;currentRoute=route;currentSub=sub;update();const mounted=++generation;unsubscribe=S()?.subscribe(e=>{if(e?.keys&&!e.keys.some(k=>['consequences','characters','ledger','canon'].includes(k))&&e.type!=='auth')return;update();});Promise.resolve(S()?.ready).then(()=>{if(mounted===generation)update();});}
  function destroy(){generation++;unsubscribe?.();unsubscribe=null;currentRoute='';currentSub='';}
  return {augment,destroy};
};
