window.createCampaignVault=function(ctx){
  'use strict';
  const {D,esc,plain,path,pageHead,toast,rerender}=ctx,S=window.CampaignSync;
  let controller=null,unsubscribe=null,root=null,query='',dirty=false,newNoteDraft=null,creating=false;
  const dirtyCards=new Set(),noteDrafts=new Map();
  const noteBody=e=>e.format==='text'?String(e.body??''):plain(e.body);
  const legacy=()=>S.get('dm:legacy',{version:1,entries:[]});
  const reveals=()=>S.get('reveals',{version:1,entries:[]});
  const source=e=>e.target?.startsWith('world:')?path('world',e.target.slice(6)):e.target?.startsWith('session:')?path('session',e.target.slice(8)):e.target?.startsWith('person:')?path('person',e.target.slice(7)):'#lore/heat';
  const publicCard=e=>`<article class="panel vault-reveal"><p class="eyebrow">REVEALED BY THE DUNGEON MASTER</p><h3>${esc(e.title)}</h3><div class="prose" style="white-space:pre-wrap">${esc(e.body)}</div>${e.target?`<a class="side-link" href="${source(e)}">Open related record ↗</a>`:''}</article>`;
  function relatedRecords(){
    const values=new Map();
    [...D.LOCATIONS,D.VOID,...D.PLACE_ENTRIES].filter(Boolean).forEach(w=>values.set('world:'+w.id,w.name+' · Place'));
    [...D.CREW,...D.POI,...D.LOCATIONS.flatMap(w=>w.contacts||[])].forEach(p=>values.set('person:'+p.name,p.name+' · Person'));
    D.SESSIONS.forEach(s=>values.set('session:'+s.num,s.num+' · '+s.title));return values;
  }
  function captureNewNote(){const form=root?.querySelector('#vaultNewForm');if(!form||!newNoteDraft)return;const f=new FormData(form);Object.assign(newNoteDraft,{title:String(f.get('title')||'').slice(0,160),body:String(f.get('body')||'').slice(0,80000),target:String(f.get('target')||'')});}
  function newNoteForm(){if(!newNoteDraft)return '';return `<section class="vault-new-note"><div class="vault-new-heading"><div><p class="eyebrow">OWNER ACCESS / PRIVATE NOTE</p><h2>Keep something behind the screen.</h2></div><button type="button" class="icon-button" data-vault-cancel-new aria-label="Close new private note">×</button></div><form id="vaultNewForm"><div class="vault-new-fields"><label>Title<input name="title" maxlength="160" required value="${esc(newNoteDraft.title)}" placeholder="A name you can find again"></label><label>Related campaign record<select name="target"><option value="">No related record</option>${[...relatedRecords()].sort((a,b)=>a[1].localeCompare(b[1])).map(([id,label])=>`<option value="${esc(id)}"${id===newNoteDraft.target?' selected':''}>${esc(label)}</option>`).join('')}</select></label><label class="vault-new-body">Private note<textarea name="body" maxlength="80000" rows="8" required placeholder="Your plans, motives, discoveries, or anything the party has yet to learn…">${esc(newNoteDraft.body)}</textarea></label></div><p class="source-note">This note stays in your private archive. Saving it does not reveal it to the party or public.</p><p id="vaultNewFeedback" class="vault-new-feedback" role="status"></p><div class="button-row"><button class="button" type="submit">Save private note</button><button class="button secondary" type="button" data-vault-cancel-new>Cancel</button></div></form></section>`;}
  function openNewNote(){
    if(dirtyCards.size){toast('Save the edited private notes before starting a new one. Your current edits are still here.');return;}
    newNoteDraft||={id:'note-'+crypto.randomUUID(),title:'',body:'',target:''};
    root.querySelector('#vaultNewNoteHost').innerHTML=newNoteForm();root.querySelector('#vaultNewForm [name="title"]')?.focus();
  }
  async function createNote(event){
    if(event.target.id!=='vaultNewForm')return;event.preventDefault();if(!S.canDM()||creating)return;captureNewNote();
    const feedback=root.querySelector('#vaultNewFeedback');
    if(dirtyCards.size){feedback.textContent='Save the other edited private notes first. Your new note draft is preserved.';return;}
    const title=newNoteDraft.title.trim(),body=newNoteDraft.body.trim();if(!title||!body){feedback.textContent='Add a title and note text.';return;}
    const docs=legacy();if(!Array.isArray(docs.entries)){feedback.textContent='The private archive could not be read. Your draft is preserved.';return;}
    const entry={id:newNoteDraft.id,kind:'Private note',title,body,format:'text',target:relatedRecords().has(newNoteDraft.target)?newNoteDraft.target:'',createdAt:newNoteDraft.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};newNoteDraft.createdAt=entry.createdAt;
    const next={...docs,entries:[...docs.entries.filter(e=>e.id!==entry.id),entry]};
    if(new Blob([JSON.stringify(next)]).size>1950000){feedback.textContent='The archive is close to its storage limit. Shorten this note before saving. Your draft is preserved.';return;}
    creating=true;const submit=event.target.querySelector('[type="submit"]');submit.disabled=true;feedback.textContent='Saving to the private archive…';
    try{await S.save('dm:legacy',next);newNoteDraft=null;dirty=false;query='';toast('New private note saved. It has not been revealed.');rerender();}
    catch(error){feedback.textContent=(error.message||'The private note could not be saved.')+' Your draft remains here. You can retry after reviewing the updated archive.';}
    finally{creating=false;submit.disabled=false;}
  }
  function render(route){
    if(!S.canDM()){newNoteDraft=null;dirtyCards.clear();noteDrafts.clear();dirty=false;}
    if(route==='intel')return `<div class="page reveal">${pageHead('Released from the private archive','Revealed intelligence','The discoveries your Dungeon Master has shared with the whole table.')}<div class="vault-grid">${reveals().entries.map(publicCard).join('')||'<p class="empty">No private records have been released yet. The existing campaign archive is available throughout the compendium.</p>'}</div></div>`;
    if(!S.canDM())return `<div class="page">${pageHead('Dungeon Master workspace','Behind the screen.','Prepare the next chapter and decide what the crew discovers.')}<div class="auth-notice"><p>Your private notes, original DM records, and unrevealed threat clocks are available after DM sign-in.</p><button class="button" data-vault-login>DM sign-in</button></div></div>`;
    const entries=legacy().entries.filter(e=>(e.title+' '+noteBody(e)).toLowerCase().includes(query.toLowerCase()));
    return `<div class="page reveal" id="vaultRoot">${pageHead('Owner access / private archive','Behind the screen.','These records are stored privately. Release only the passages you want the party and public to see.')}<div class="vault-toolbar"><button class="button" data-vault-new>+ Private note</button><input id="vaultSearch" type="search" aria-label="Search private records" placeholder="Find a private note or threat clock…" value="${esc(query)}"><a class="button secondary" href="#director">Session director ↗</a><a class="button secondary" href="#dm-clocks">Private clocks ↗</a><a class="button secondary" href="#intake">Review session updates ↗</a><button class="button secondary" data-vault-backup>Download private backup</button></div><div id="vaultNewNoteHost">${newNoteForm()}</div><div class="vault-grid">${entries.map(e=>`<article class="panel vault-note" data-vault-id="${esc(e.id)}"><p class="eyebrow">${esc(e.kind)} / DM ONLY</p><h3>${esc(e.title)}</h3><label class="source-note" for="vn-${esc(e.id)}">Private note</label><textarea id="vn-${esc(e.id)}" maxlength="80000">${esc(noteDrafts.get(e.id)??noteBody(e))}</textarea>${e.record?.clock?`<p class="source-note">Original clock: ${e.record.clock.current} / ${e.record.clock.max}. Track private developments in Private clocks.</p>`:''}<div class="button-row" style="margin-top:15px"><button class="button small" data-vault-save>Save private note</button><button class="button secondary small" data-vault-reveal>Review & reveal</button>${reveals().entries.some(r=>r.id===e.id)?'<button class="button secondary small" data-vault-hide>Withdraw reveal</button>':''}</div>${e.target?`<a class="side-link" href="${source(e)}">Related campaign record ↗</a>`:''}<p class="source-note" data-vault-feedback role="status"></p></article>`).join('')}</div><section class="panel" style="margin-top:25px"><p class="eyebrow">Shared access</p><p class="prose">Party access edits the board, ledgers, journals, and review drafts. Only DM access can confirm evidence, approve canon, reveal scenes, or read this vault.</p><button class="button secondary small" data-vault-revoke style="margin-top:15px">Sign out all party sessions</button><p class="source-note">The party password will still allow a new sign-in.</p></section></div>`;
  }
  function mount(route){
    if(!['vault','intel'].includes(route))return;root=document.getElementById('main');controller=new AbortController();const opts={signal:controller.signal};
    root.addEventListener('input',e=>{if(e.target.id==='vaultSearch'){query=e.target.value;root.querySelectorAll('.vault-note').forEach(el=>{const item=legacy().entries.find(x=>x.id===el.dataset.vaultId);el.hidden=!(item.title+' '+noteBody(item)).toLowerCase().includes(query.toLowerCase());});}else if(e.target.closest('#vaultNewForm'))captureNewNote();else if(e.target.matches('textarea')){const card=e.target.closest('[data-vault-id]');if(card){dirtyCards.add(card.dataset.vaultId);noteDrafts.set(card.dataset.vaultId,e.target.value);}dirty=dirtyCards.size>0;}},opts);
    root.addEventListener('submit',createNote,opts);
    window.addEventListener('beforeunload',e=>{captureNewNote();if(dirty||newNoteDraft&&(newNoteDraft.title||newNoteDraft.body)){e.preventDefault();e.returnValue='';}},opts);
    root.addEventListener('click',async e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-vault-login')){S.signIn('dm');return;}
      if(!S.canDM())return;
      if(b.hasAttribute('data-vault-new')){openNewNote();return;}
      if(b.hasAttribute('data-vault-cancel-new')){captureNewNote();if(newNoteDraft&&(newNoteDraft.title||newNoteDraft.body)&&!confirm('Discard this unsaved private note?'))return;newNoteDraft=null;root.querySelector('#vaultNewNoteHost').replaceChildren();return;}
      if(b.hasAttribute('data-vault-backup')){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),legacy:legacy(),notes:S.get('dm:notes',{}),director:S.get('dm:director',{}),consequences:S.get('dm:consequences',{})},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='shattering-private-dm-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),30000);return;}
      if(b.hasAttribute('data-vault-revoke')){if(!confirm('Sign out all current party sessions? They can sign in again with the party password.'))return;try{await S.revokeParty();toast('Party sessions signed out.');}catch(err){toast(err.message);}return;}
      const card=b.closest('[data-vault-id]');if(!card)return;const docs=legacy(),item=docs.entries.find(x=>x.id===card.dataset.vaultId),feedback=card.querySelector('[data-vault-feedback]');if(!item)return;
      const text=card.querySelector('textarea').value; b.disabled=true;
      try{
        if(b.hasAttribute('data-vault-save')){item.body=text;item.format='text';await S.save('dm:legacy',docs);dirtyCards.delete(item.id);noteDrafts.delete(item.id);dirty=dirtyCards.size>0;feedback.textContent='Private note saved.';}
        if(b.hasAttribute('data-vault-reveal')){const draft=prompt('This passage will be visible to anyone with the site address. Edit the public excerpt before revealing it:',text);if(draft===null)return;const doc=reveals(),entry={id:item.id,title:item.title,kind:item.kind,target:item.target,body:draft.slice(0,80000),revealedAt:new Date().toISOString()};doc.entries=doc.entries.filter(x=>x.id!==item.id);doc.entries.push(entry);await S.save('reveals',doc);feedback.textContent='Revealed to the party and public. See Revealed intelligence.';}
        if(b.hasAttribute('data-vault-hide')){if(!confirm('Withdraw this passage from the public site? Anyone who already saw it may retain a copy.'))return;const doc=reveals();doc.entries=doc.entries.filter(x=>x.id!==item.id);await S.save('reveals',doc);feedback.textContent='Reveal withdrawn.';}
      }catch(err){feedback.textContent=err.message;}finally{b.disabled=false;}
    },opts);
    unsubscribe=S.subscribe(e=>{if(e.type==='auth'){newNoteDraft=null;dirtyCards.clear();noteDrafts.clear();dirty=false;rerender();}});
  }
  function augment(route,sub){const target=route==='world'?'world:'+sub:route==='session'?'session:'+sub:route==='person'?'person:'+sub:null;if(!target)return;const items=reveals().entries.filter(x=>x.target===target);if(!items.length)return;const host=document.querySelector('.dossier-main,.person-details,.session-card');if(host&&!host.querySelector('.revealed-addenda'))host.insertAdjacentHTML('beforeend',`<section class="revealed-addenda canon-addendum"><h2>Newly revealed</h2>${items.map(publicCard).join('')}</section>`);}
  function destroy(){if(S.canDM())captureNewNote();else{newNoteDraft=null;dirtyCards.clear();noteDrafts.clear();dirty=false;}controller?.abort();unsubscribe?.();controller=null;unsubscribe=null;root=null;}
  return {handles:r=>['vault','intel'].includes(r),render,mount,destroy,augment};
};
