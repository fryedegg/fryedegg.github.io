/* Scene preparation stays in the DM document. Only an explicit reveal publishes a
   whitelisted snapshot; player displays never receive the private preparation. */
window.createSessionDirector = function createSessionDirector(ctx) {
  'use strict';
  const {D,M,esc,plain,path,image,pageHead,play,toast}=ctx;
  let worlds=[],people=[],art=[],allowedImages=new Set();
  const recordings=new Map(M.recordings.map(r=>[r.id,r]));
  const personImage=p=>p?.image||M.matches[p?.name]||'';
  function refreshCatalog(){
    worlds=[...D.LOCATIONS,D.VOID,...D.PLACE_ENTRIES].filter(Boolean);
    people=[...D.CREW,...D.POI,...worlds.flatMap(w=>w.contacts||[])].filter((p,i,a)=>p&&a.findIndex(q=>q?.name===p.name)===i);
    art=M.art.filter(a=>!a.video);
    allowedImages=new Set([...art.map(a=>a.src),...worlds.map(w=>w.image),...people.map(personImage)].filter(Boolean));
  }
  refreshCatalog();
  const safeImage=src=>allowedImages.has(src)?src:'';
  const text=(v,n)=>String(v??'').slice(0,n), list=v=>Array.isArray(v)?v:[];
  const uid=()=>globalThis.crypto?.randomUUID?.()||'scene-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  const sync=()=>window.CampaignSync;
  const canDM=()=>Boolean(sync()?.canDM());
  let draft=null,selected='',dirty=false,saving=false,activeRoute='',root=null,unsubscribe=null,controller=null,generation=0,lastStage='',lastDocument='',remoteChange=false;
  const excerpt=(v,n=180)=>{const s=plain(v);return s.length>n?s.slice(0,n).trim()+'…':s;};
  const duration=v=>Math.floor((Number(v)||0)/60)+':'+String(Math.floor((Number(v)||0)%60)).padStart(2,'0');
  function cleanScene(v={}) {
    return {id:text(v.id||uid(),80),context:text(v.context,250),title:text(v.title||'Untitled scene',160),locationId:worlds.some(w=>w.id===v.locationId)?v.locationId:'',art:safeImage(v.art),publicText:text(v.publicText,5000),privateNotes:text(v.privateNotes,18000),source: D.SESSIONS.some(s=>s.num===v.source)?v.source:'',people:list(v.people).filter(n=>people.some(p=>p.name===n)).slice(0,8),handouts:list(v.handouts).filter(src=>safeImage(src)).slice(0,8),cues:list(v.cues).filter(id=>recordings.has(id)).slice(0,9)};
  }
  function cleanDocument(v) {return {version:1,scenes:list(v?.scenes).slice(0,60).map(cleanScene)};}
  function starter() {
    const latest=D.SESSIONS.at(-1),place=worlds.find(w=>w.id===latest?.where?.id)||worlds.find(w=>w.id==='port-vesper')||worlds[0];
    return {version:1,scenes:[cleanScene({id:'opening-scene',title:place?.name||'Opening scene',locationId:place?.id,art:place?.image,publicText:excerpt(place?.desc,600),source:latest?.num,cues:M.recordings.filter(r=>r.session===Number(latest?.num?.slice(1))).slice(0,3).map(r=>r.id)})]};
  }
  function loadDraft(force=false) {
    if(!canDM()){draft=null;selected='';dirty=false;remoteChange=false;return;}
    if(!draft||force){const stored=sync().get('dm:director',null);lastDocument=JSON.stringify(stored);draft=cleanDocument(stored||starter());selected=draft.scenes.some(s=>s.id===selected)?selected:draft.scenes[0]?.id||'';dirty=false;remoteChange=false;}
  }
  const current=()=>draft?.scenes.find(s=>s.id===selected);
  function stageValue() {
    const raw=sync()?.get('stage',null);if(!raw||raw.hidden)return null;
    const scene=cleanScene(raw);
    return {...scene,privateNotes:'',revealedAt:text(raw.revealedAt,40),cueOffer:recordings.has(raw.cueOffer)?raw.cueOffer:'',cueOfferedAt:text(raw.cueOfferedAt,40)};
  }
  function publicSnapshot(scene) {
    const s=cleanScene(scene);
    return {version:1,id:s.id,title:s.title,locationId:s.locationId,art:s.art,publicText:s.publicText,source:s.source,people:s.people,handouts:s.handouts,cues:s.cues,revealedAt:new Date().toISOString(),cueOffer:'',cueOfferedAt:''};
  }
  function locationName(id){return worlds.find(w=>w.id===id)?.name||'Uncharted scene';}
  function sceneArt(s){return safeImage(s?.art)||safeImage(worlds.find(w=>w.id===s?.locationId)?.image);}
  function scenePreview(s,compact=false) {
    const src=sceneArt(s);
    return `<section class="${compact?'director-preview':'player-scene'}${src?'':' without-art'}" aria-label="${compact?'Player view preview':'Revealed scene'}">${src?image(src,s.title,'scene-backdrop',true):'<div class="scene-stars" aria-hidden="true"></div>'}<div class="scene-vignette" aria-hidden="true"></div><div class="scene-framing" aria-hidden="true"></div><div class="scene-copy"><p class="eyebrow"><span class="status-dot"></span> ${esc(s.locationId?locationName(s.locationId):'The Shattering / Live scene')}</p><h${compact?'2':'1'}>${esc(s.title)}</h${compact?'2':'1'}>${s.publicText?`<p class="scene-description">${esc(s.publicText)}</p>`:''}<div class="scene-source-links">${s.locationId?`<a href="${path('world',s.locationId)}">Location dossier ↗</a>`:''}${s.source?`<a href="${path('session',s.source)}">${esc(s.source)} · Source record ↗</a>`:''}</div></div>${compact?'<span class="preview-stamp">PLAYER VIEW / PREVIEW</span>':''}</section>`;
  }
  function sceneRail() {
    const live=stageValue();return `<aside class="director-rail" aria-label="Scene sequence"><div class="director-rail-head"><p class="eyebrow">RUN OF SHOW</p><span>${draft.scenes.length} / 60</span></div><ol>${draft.scenes.map((s,i)=>`<li><button class="director-scene-button${s.id===selected?' selected':''}" data-sd-select="${esc(s.id)}" aria-pressed="${s.id===selected}"><span class="scene-number">${String(i+1).padStart(2,'0')}</span><span>${image(sceneArt(s),'')}<strong>${esc(s.title)}</strong><small>${esc(locationName(s.locationId))}</small></span>${live?.id===s.id?'<i class="scene-live-label">LIVE</i>':''}</button></li>`).join('')}</ol><button class="button secondary small" data-sd-add${draft.scenes.length>=60?' disabled':''}>+ Add scene</button><p class="source-note">Prepare in private. Reveal each scene when the table is ready.</p></aside>`;
  }
  function editor() {
    const s=current();if(!s)return '<section class="panel director-empty"><p class="eyebrow">A clean slate</p><h2>Where does tonight begin?</h2><p>Add a scene to bring its artwork, faces, and Ghost cues together.</p><button class="button" data-sd-add>+ First scene</button></section>';
    return `<div class="director-editor"><form id="directorForm" class="director-form"><div class="director-section-head"><div><p class="eyebrow">PRIVATE PREPARATION</p><h2>Set the scene.</h2></div><div class="director-reorder"><button type="button" data-sd-move="-1" class="icon-button" aria-label="Move scene earlier"${draft.scenes.indexOf(s)===0?' disabled':''}>↑</button><button type="button" data-sd-move="1" class="icon-button" aria-label="Move scene later"${draft.scenes.indexOf(s)===draft.scenes.length-1?' disabled':''}>↓</button></div></div><div class="director-form-grid"><label class="director-wide">Scene title<input name="title" maxlength="160" value="${esc(s.title)}" required></label><label>Location<select name="locationId"><option value="">Uncharted / custom scene</option>${worlds.map(w=>`<option value="${esc(w.id)}"${w.id===s.locationId?' selected':''}>${esc(w.name)}</option>`).join('')}</select></label><label>Source session<select name="source"><option value="">No session reference</option>${D.SESSIONS.map(log=>`<option value="${esc(log.num)}"${log.num===s.source?' selected':''}>${esc(log.num+' · '+log.title)}</option>`).join('')}</select></label><label class="director-wide">Featured artwork<select name="art"><option value="">Use location artwork</option>${art.map(a=>`<option value="${esc(a.src)}"${a.src===s.art?' selected':''}>${esc(a.title)}</option>`).join('')}</select></label><label class="director-wide">Words for the party<textarea name="publicText" rows="4" maxlength="5000" placeholder="What can the party see, hear, or read?">${esc(s.publicText)}</textarea><small>This text is included when you reveal the scene.</small></label><label class="director-wide director-private">DM reminders <span>PRIVATE</span><textarea name="privateNotes" rows="5" maxlength="18000" placeholder="Hidden motives, a reminder to ask for a check, your next reveal…">${esc(s.privateNotes)}</textarea><small>Stored with your private preparation. Never sent to the player display.</small></label></div></form><section class="director-attachments"><div class="director-section-head"><h3>Faces at the table</h3><small>Up to 8</small></div><div class="director-add-row"><select id="directorPerson" aria-label="Person to add"><option value="">Choose a known person…</option>${people.filter(p=>!s.people.includes(p.name)).sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<option>${esc(p.name)}</option>`).join('')}</select><button class="button secondary small" data-sd-add-person${s.people.length>=8?' disabled':''}>Add face</button></div><div class="director-chip-list">${s.people.map(n=>`<span class="director-chip">${image(personImage(people.find(p=>p.name===n)),'')}<a href="${path('person',n)}">${esc(n)}</a><button data-sd-remove-person="${esc(n)}" aria-label="Remove ${esc(n)} from scene">×</button></span>`).join('')||'<p class="muted">Add the people you want to introduce on the player screen.</p>'}</div></section><section class="director-attachments"><div class="director-section-head"><h3>Handouts & discoveries</h3><small>Up to 8</small></div><div class="director-add-row"><select id="directorHandout" aria-label="Artwork to add as handout"><option value="">Choose from the art library…</option>${art.filter(a=>!s.handouts.includes(a.src)).map(a=>`<option value="${esc(a.src)}">${esc(a.title)}</option>`).join('')}</select><button class="button secondary small" data-sd-add-handout${s.handouts.length>=8?' disabled':''}>Add handout</button></div><div class="director-handout-list">${s.handouts.map(src=>`<div>${image(src,art.find(a=>a.src===src)?.title||'Handout')}<span>${esc(art.find(a=>a.src===src)?.title||'Handout')}</span><button data-sd-remove-handout="${esc(src)}" aria-label="Remove handout">×</button></div>`).join('')||'<p class="muted">Selected handouts become public with the scene.</p>'}</div></section><section class="director-attachments director-frequency"><div class="director-section-head"><div><p class="eyebrow">OPEN FREQUENCY</p><h3>Ghost’s cue deck</h3></div><small>1–9 to play · outside text fields</small></div><label class="director-cue-search">Find a line<input id="directorCueSearch" type="search" placeholder="Search words, characters, or a channel…" autocomplete="off"></label><div id="directorCueResults" class="director-cue-results"></div><div class="director-cue-deck">${s.cues.map((id,i)=>cueCard(id,i,true)).join('')||'<p class="muted">Find up to nine lines for this scene. Every cue plays only when someone presses play.</p>'}</div></section><div class="director-delete-row"><button class="text-button" data-sd-delete>Remove this scene</button><span>Removes preparation; the revealed screen stays until you replace or clear it.</span></div></div>`;
  }
  function cueCard(id,i,editable=false) {
    const r=recordings.get(id);if(!r)return '';
    return `<article class="director-cue"><button class="director-cue-play" data-sd-play="${esc(id)}" aria-label="Play ${esc(r.title)}"><span>${String(i+1).padStart(2,'0')}</span>▶</button><div><strong>${esc(r.title)}</strong><p>${esc(excerpt(r.text||r.setting,150))}</p><small>${esc(r.category||r.kind||'Ghost transmission')}${r.duration?' · '+duration(r.duration):''}</small></div>${editable?`<div class="director-cue-actions"><button data-sd-offer="${esc(id)}" title="Offer this line on the live player display">Send to screen ↗</button><button data-sd-remove-cue="${esc(id)}" aria-label="Remove ${esc(r.title)} from cue deck">×</button></div>`:''}</article>`;
  }
  function useContext(sub) {
    if(!sub||!draft)return;
    const slash=sub.indexOf('/');if(slash<0)return;
    const kind=sub.slice(0,slash),id=sub.slice(slash+1),key=kind+':'+id;
    const prior=draft.scenes.find(s=>s.context===key);if(prior){selected=prior.id;return;}
    if(draft.scenes.length>=60)return;
    let data;
    if(kind==='world'){const w=worlds.find(w=>w.id===id);if(!w)return;data={title:w.name,locationId:w.id,art:w.image,publicText:excerpt(w.desc,600),cues:M.recordings.filter(r=>r.location===w.id).slice(0,9).map(r=>r.id)};}
    if(kind==='person'){const p=people.find(p=>p.name===id);if(!p)return;data={title:p.name,locationId:p.location?.id,art:personImage(p),people:[p.name],publicText:'',cues:M.recordings.filter(r=>r.target===p.name||r.category===p.name).slice(0,9).map(r=>r.id)};}
    if(kind==='session'){const log=D.SESSIONS.find(s=>s.num===id);if(!log)return;const w=worlds.find(w=>w.id===log.where?.id)||(['S11','S12'].includes(log.num)?worlds.find(w=>w.id==='celestial-tunnel'):null);data={title:log.title,locationId:w?.id,art:w?.image,publicText:excerpt(log.summary,1500),source:log.num,cues:M.recordings.filter(r=>r.session===Number(log.num.slice(1))).slice(0,9).map(r=>r.id)};}
    if(!data)return;const added=cleanScene({...data,context:key});draft.scenes.push(added);selected=added.id;dirty=true;
  }
  function director(sub) {
    if(!canDM())return `<div class="page director-page" id="sessionDirectorRoot">${pageHead('Session director / DM access','The next scene awaits.','The public player screen shows only what your DM has revealed.')}<section class="director-gate panel"><span class="director-gate-symbol" aria-hidden="true">◇</span><h2>A seat behind the screen.</h2><p>Private scene preparation, reminders, and reveal controls are available through the separate DM sign-in.</p><div class="button-row"><button class="button" data-sd-signin>DM sign-in</button><a class="button secondary" href="#stage">Open the player screen ↗</a><a class="button secondary" href="#table">Back to the table</a></div></section></div>`;
    loadDraft();useContext(sub);const s=current(),live=stageValue();
    return `<div class="page director-page" id="sessionDirectorRoot">${pageHead('Behind the screen / Session director','Make an entrance.','Arrange the scenes. Cue the voices. Let the galaxy unfold at your pace.')}<div class="director-commandbar"><div><span class="status-dot${live?'':' standby'}"></span><span id="directorLiveStatus">${live?'ON SCREEN · '+esc(live.title):'PLAYER SCREEN · STANDBY'}</span></div><a href="#stage" class="button secondary small" target="_blank" rel="noopener">Open player screen ↗</a><button class="button secondary small" data-sd-clear${live?'':' disabled'}>Clear screen</button></div><div class="director-layout">${sceneRail()}<div class="director-workbench">${editor()}</div><aside class="director-monitor"><div class="director-monitor-head"><p class="eyebrow">NEXT REVEAL</p><span>Visible after you reveal</span></div>${s?scenePreview(s,true):'<div class="panel">No scene selected.</div>'}<div class="director-publish"><span id="directorSaveStatus" role="status">${dirty?'Unsaved preparation':'Preparation loaded'}</span><div class="button-row"><button class="button secondary" data-sd-save${saving?' disabled':''}>Save prep</button><button class="button" data-sd-reveal${!s||saving?' disabled':''}>Reveal to party ↗</button></div><button class="director-next" data-sd-next${!s||draft.scenes.indexOf(s)>=draft.scenes.length-1?' disabled':''}>Next scene in preparation →</button><p>The player screen changes only when you reveal. Sound is always started with a click.</p><div id="directorRemoteChange" class="director-remote-change"${remoteChange?'':' hidden'}>Preparation changed in another window. Copy anything you need before loading it.<button data-sd-reload>Load latest preparation</button></div></div><a class="director-table-return" href="#table">← Return to the shared table</a></aside></div></div>`;
  }
  function stage() {
    const s=stageValue();
    return `<div id="sessionDirectorRoot" class="player-stage"><nav class="player-stage-toolbar" aria-label="Player screen controls"><a href="#table">← Return to the compendium</a><span class="stage-live-indicator"><i class="status-dot"></i> ${s?'SCENE RECEIVED':'AWAITING REVEAL'}</span><button data-sd-fullscreen>⛶ Full screen</button></nav><div id="playerStageContent">${stageContent(s)}</div><dialog class="director-handout-dialog" id="directorHandoutDialog"><button class="lightbox-close" data-sd-close-handout aria-label="Close handout">×</button><div id="directorHandoutContent"></div></dialog></div>`;
  }
  function stageContent(s) {
    if(!s)return `<section class="stage-standby"><div class="scene-stars" aria-hidden="true"></div><span class="stage-standby-sigil" aria-hidden="true">✧</span><p class="eyebrow">H.O.C.2.A / LIVE TRANSMISSION</p><h1>The galaxy holds its breath.</h1><p>Your DM’s next reveal will appear here.<br>Keep this screen open while you play.</p><a class="button secondary" href="#map">Explore the star map ↗</a></section>`;
    const offer=recordings.get(s.cueOffer);
    return `${scenePreview(s)}${offer?`<section class="stage-cue-offer" aria-label="Featured Ghost cue"><p class="eyebrow">INCOMING / GHOST-17X</p><strong>${esc(offer.title)}</strong><button class="button" data-sd-play="${esc(offer.id)}">▶ Play transmission</button><small>Ready when you are. Audio never starts automatically.</small></section>`:''}${s.people.length?`<section class="stage-section"><p class="eyebrow">FACES IN THIS SCENE</p><div class="stage-faces">${s.people.map(name=>{const p=people.find(x=>x.name===name);return `<a class="stage-person" href="${path('person',name)}">${image(personImage(p),name)}<span>${esc(name)}</span><small>Open dossier ↗</small></a>`;}).join('')}</div></section>`:''}${s.handouts.length?`<section class="stage-section"><p class="eyebrow">ON THE TABLE</p><div class="stage-handouts">${s.handouts.map(src=>{const title=art.find(a=>a.src===src)?.title||'Scene handout';return `<button data-sd-handout="${esc(src)}">${image(src,title)}<span>${esc(title)} <i>⤢</i></span></button>`;}).join('')}</div></section>`:''}${s.cues.length?`<section class="stage-section stage-frequency"><div class="director-section-head"><p class="eyebrow">GHOST / OPEN FREQUENCY</p><a href="#ghost">Full archive ↗</a></div><div class="stage-cue-deck">${s.cues.map((id,i)=>cueCard(id,i)).join('')}</div></section>`:''}<footer class="stage-footer"><span>THE SHATTERING · H.O.C.2.A</span><span>Revealed ${esc(new Date(s.revealedAt).toLocaleString())}</span></footer>`;
  }
  function collectForm() {
    const s=current(),form=root?.querySelector('#directorForm');if(!s||!form)return;
    ['title','locationId','source','art','publicText','privateNotes'].forEach(name=>{s[name]=form.elements.namedItem(name).value;});
  }
  function changed() {dirty=true;const status=root?.querySelector('#directorSaveStatus');if(status)status.textContent='Unsaved preparation';}
  function refresh() {if(!root||!activeRoute)return;const route=activeRoute;root.outerHTML=route==='stage'?stage():director();root=document.getElementById('sessionDirectorRoot');bind();}
  async function persist() {
    if(!canDM()){toast('DM access is required.');return false;}collectForm();
    const s=current();if(s&&!s.title.trim()){toast('Give the scene a title before saving.');root?.querySelector('[name="title"]')?.focus();return false;}
    if(saving)return false;saving=true;const status=root?.querySelector('#directorSaveStatus');if(status)status.textContent='Saving private preparation…';
    try {await sync().save('dm:director',cleanDocument(draft));dirty=false;remoteChange=false;lastDocument=JSON.stringify(sync().get('dm:director',null));if(status)status.textContent='Private preparation saved';return true;}
    catch(err){if(status)status.textContent='Not saved · your edits remain here';toast(err?.message||'Preparation could not be saved. Your edits remain here.');return false;}
    finally {saving=false;}
  }
  async function reveal() {
    if(!canDM()||saving)return;const saved=await persist();if(!saved||!current())return;
    try{await sync().save('stage',publicSnapshot(current()));toast('Scene revealed to the player screen.');refresh();}
    catch(err){toast(err?.message||'The scene could not be revealed.');}
  }
  function fillCueResults() {
    const field=root?.querySelector('#directorCueSearch'),results=root?.querySelector('#directorCueResults');if(!field||!results)return;
    const query=field.value.trim().toLowerCase(),terms=query.split(/\s+/),s=current();
    const matches=query?M.recordings.filter(r=>!s.cues.includes(r.id)&&terms.every(t=>[r.title,r.text,r.category,r.target].join(' ').toLowerCase().includes(t))).slice(0,8):[];
    results.innerHTML=matches.map(r=>`<div><button class="director-result-play" data-sd-play="${esc(r.id)}" aria-label="Preview ${esc(r.title)}">▶</button><span><strong>${esc(r.title)}</strong><small>${esc(excerpt(r.text||r.setting,110))}</small></span><button class="button secondary small" data-sd-add-cue="${esc(r.id)}"${s.cues.length>=9?' disabled':''}>+ Add</button></div>`).join('')||(query?'<p class="muted">No matching lines. Try a name or shorter phrase.</p>':'');
  }
  async function click(event) {
    const el=event.target.closest('button,[data-sd-select]');if(!el||!root?.contains(el))return;
    if(el.hasAttribute('data-sd-signin')){sync()?.signIn('dm');return;}
    if(el.dataset.sdPlay){play(el.dataset.sdPlay);return;}
    if(el.hasAttribute('data-sd-fullscreen')){try{if(document.fullscreenElement)await document.exitFullscreen();else await root.requestFullscreen();}catch{toast('Full screen is unavailable in this browser.');}return;}
    if(el.dataset.sdHandout){const src=safeImage(el.dataset.sdHandout);if(!src)return;const title=art.find(a=>a.src===src)?.title||'Scene handout';root.querySelector('#directorHandoutContent').innerHTML=image(src,title)+`<p>${esc(title)}</p>`;root.querySelector('#directorHandoutDialog').showModal();return;}
    if(el.hasAttribute('data-sd-close-handout')){root.querySelector('#directorHandoutDialog')?.close();return;}
    if(!canDM()||activeRoute!=='director')return;
    collectForm();const s=current();
    if(el.dataset.sdSelect){selected=el.dataset.sdSelect;refresh();return;}
    if(el.hasAttribute('data-sd-save')){await persist();return;}
    if(el.hasAttribute('data-sd-reveal')){await reveal();return;}
    if(el.hasAttribute('data-sd-clear')){try{await sync().save('stage',{version:1,hidden:true,revealedAt:new Date().toISOString()});toast('Player screen returned to standby.');refresh();}catch(err){toast(err?.message||'The screen could not be cleared.');}return;}
    if(el.hasAttribute('data-sd-reload')){if(dirty&&!confirm('Discard unsaved preparation and load the latest saved scenes?'))return;loadDraft(true);refresh();return;}
    if(el.hasAttribute('data-sd-add')){if(draft.scenes.length>=60)return;const w=worlds.find(w=>w.id===s?.locationId)||worlds[0],n=cleanScene({title:'New scene',locationId:w?.id});draft.scenes.push(n);selected=n.id;changed();refresh();return;}
    if(!s)return;
    if(el.hasAttribute('data-sd-next')){const next=draft.scenes[draft.scenes.indexOf(s)+1];if(next){selected=next.id;refresh();}return;}
    if(el.hasAttribute('data-sd-move')){const index=draft.scenes.indexOf(s),next=index+Number(el.dataset.sdMove);if(next<0||next>=draft.scenes.length)return;[draft.scenes[index],draft.scenes[next]]=[draft.scenes[next],draft.scenes[index]];changed();refresh();return;}
    if(el.hasAttribute('data-sd-delete')){if(!confirm('Remove this scene from preparation? The player screen will stay as it is.'))return;draft.scenes=draft.scenes.filter(x=>x.id!==s.id);selected=draft.scenes[0]?.id||'';changed();refresh();return;}
    if(el.hasAttribute('data-sd-add-person')){const name=root.querySelector('#directorPerson').value;if(name&&s.people.length<8&&!s.people.includes(name)){s.people.push(name);changed();refresh();}return;}
    if(el.dataset.sdRemovePerson){s.people=s.people.filter(x=>x!==el.dataset.sdRemovePerson);changed();refresh();return;}
    if(el.hasAttribute('data-sd-add-handout')){const src=safeImage(root.querySelector('#directorHandout').value);if(src&&s.handouts.length<8&&!s.handouts.includes(src)){s.handouts.push(src);changed();refresh();}return;}
    if(el.dataset.sdRemoveHandout){s.handouts=s.handouts.filter(x=>x!==el.dataset.sdRemoveHandout);changed();refresh();return;}
    if(el.dataset.sdAddCue){if(recordings.has(el.dataset.sdAddCue)&&s.cues.length<9&&!s.cues.includes(el.dataset.sdAddCue)){s.cues.push(el.dataset.sdAddCue);changed();refresh();}return;}
    if(el.dataset.sdRemoveCue){s.cues=s.cues.filter(x=>x!==el.dataset.sdRemoveCue);changed();refresh();return;}
    if(el.dataset.sdOffer){const live=stageValue();if(!live){toast('Reveal a scene before sending a cue to the player screen.');return;}try{const snapshot=publicSnapshot(live);snapshot.revealedAt=live.revealedAt;snapshot.cueOffer=el.dataset.sdOffer;snapshot.cueOfferedAt=new Date().toISOString();await sync().save('stage',snapshot);toast('Cue offered on the player screen. Playback still needs a click.');}catch(err){toast(err?.message||'The cue could not be sent.');}}
  }
  function bind() {
    controller?.abort();controller=new AbortController();const signal=controller.signal;
    root?.addEventListener('click',click,{signal});
    root?.addEventListener('input',e=>{if(e.target.id==='directorCueSearch'){fillCueResults();return;}if(e.target.closest('#directorForm')){collectForm();changed();}},{signal});
    root?.addEventListener('change',e=>{if(!e.target.closest('#directorForm'))return;collectForm();changed();if(e.target.name!=='privateNotes'){const preview=root.querySelector('.director-preview');if(preview&&current())preview.outerHTML=scenePreview(current(),true);}},{signal});
    root?.querySelector('#directorForm')?.addEventListener('submit',e=>{e.preventDefault();persist();},{signal});
    window.addEventListener('keydown',e=>{if(activeRoute!=='director'||!canDM()||e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.target.closest?.('input,textarea,select,button,[contenteditable="true"]'))return;if(/^[1-9]$/.test(e.key)){const id=current()?.cues[Number(e.key)-1];if(id){e.preventDefault();play(id);}}},{signal});
  }
  function onSync(event) {
    if(!root||!activeRoute)return;
    refreshCatalog();
    if(event?.keys?.includes('canon')&&activeRoute==='director'){collectForm();refresh();return;}
    if(!canDM()){draft=null;selected='';dirty=false;remoteChange=false;lastDocument='';}
    if(activeRoute==='stage'){
      const next=JSON.stringify(stageValue());if(next!==lastStage){lastStage=next;root.querySelector('#playerStageContent').innerHTML=stageContent(stageValue());const indicator=root.querySelector('.stage-live-indicator');if(indicator)indicator.innerHTML='<i class="status-dot"></i> '+(stageValue()?'SCENE RECEIVED':'AWAITING REVEAL');}return;
    }
    if(!canDM()){loadDraft();refresh();return;}
    if(saving)return;
    const fingerprint=JSON.stringify(sync().get('dm:director',null));
    if(draft&&fingerprint===lastDocument){const live=stageValue(),status=root.querySelector('#directorLiveStatus');if(status)status.textContent=live?'ON SCREEN · '+live.title:'PLAYER SCREEN · STANDBY';return;}
    if(dirty){remoteChange=true;const warning=root.querySelector('#directorRemoteChange');if(warning)warning.hidden=false;return;}
    loadDraft(true);refresh();
  }
  function mount(route) {
    if(!['director','stage'].includes(route))return;refreshCatalog();activeRoute=route;root=document.getElementById('sessionDirectorRoot');const mounted=++generation;
    document.body.classList.toggle('director-stage-active',route==='stage');lastStage=JSON.stringify(stageValue());bind();
    unsubscribe=sync()?.subscribe(onSync);
    Promise.resolve(sync()?.ready).then(()=>{if(mounted!==generation||!root)return;if(route==='director'&&!dirty)loadDraft(true);refresh();});
  }
  function destroy() {
    if(activeRoute==='director'&&canDM())collectForm();generation++;controller?.abort();controller=null;unsubscribe?.();unsubscribe=null;root=null;activeRoute='';document.body.classList.remove('director-stage-active');
    if(!canDM()){draft=null;selected='';dirty=false;}
  }
  return {handles:route=>route==='director'||route==='stage',render:(route,sub)=>{refreshCatalog();return route==='stage'?stage():director(sub);},mount,destroy};
};
