/* Shared campaign records. Authentication and authorization belong to CampaignSync. */
window.createCampaignWorkspace = function (ctx) {
  'use strict';
  const {D, M, esc, plain, image, pageHead, toast} = ctx;
  const routes = ['consequences', 'crew-log', 'ship-log', 'intake'];
  const routeKeys = {'consequences':'consequences', 'crew-log':'characters', 'ship-log':'ledger', 'intake':'intake'};
  const S = () => window.CampaignSync;
  const list = value => Array.isArray(value) ? value : [];
  const clean = (value, limit = 4000) => String(value == null ? '' : value).replace(/\u0000/g, '').slice(0, limit);
  const uid = () => window.crypto?.randomUUID?.() || 'cw-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  const now = () => new Date().toISOString();
  const records = new Map();
  function refreshRecords() {
    records.clear();
    const people = [...list(D.CREW), ...list(D.POI), ...list(D.LOCATIONS).flatMap(x => list(x.contacts))];
    people.forEach(p => { if (p.name && !records.has('person:' + p.name)) records.set('person:' + p.name, {id:'person:' + p.name, title:p.name, url:'#person/' + encodeURIComponent(p.name), type:'Person', text:plain(p.desc || p.tagline || '')}); });
    [...list(D.LOCATIONS), D.VOID, ...list(D.PLACE_ENTRIES)].filter(Boolean).forEach(p => records.set('world:' + p.id, {id:'world:' + p.id, title:p.name, url:'#world/' + encodeURIComponent(p.id), type:'Place', text:plain(p.desc || '')}));
    list(D.FACTIONS).forEach(p => records.set('faction:' + p.name, {id:'faction:' + p.name, title:p.name, url:'#lore/factions', type:'Faction', text:plain(p.blurb || '')}));
    for(const record of records.values())record.aliases=[record.title,...(record.id==='person:GHOST-17X'?['Ghost']:record.id==='person:Rook'?['Brook','Sen-47']:record.id==='person:Aelyn Vox'?['Aelyn']:record.type==='Faction'&&record.title.includes('Black Sky')?['Black Sky']:[])];
  }
  refreshRecords();
  const artwork = new Map(list(M.art).filter(a=>a.src&&!a.video&&/\.(png|jpe?g|webp|gif)$/i.test(a.src)).map(a=>[a.src,a.title||a.src]));
  [...list(D.CREW),...list(D.POI),...list(D.LOCATIONS),...list(D.PLACE_ENTRIES)].forEach(p=>{const src=M.matches?.[p.name]||p.image;if(src&&/\.(png|jpe?g|webp|gif)$/i.test(src)&&!artwork.has(src))artwork.set(src,p.name);});
  const sessions = [...list(D.SESSIONS), ...list(D.C1_LOG)];
  let root = null, controller = null, unsubscribe = null, current = '', sub = '', editor = null;
  let filter = 'all', query = '', busy = false, dirty = false, remotePending = false, undo = null, message = '', messageType = '', localAudio = null;
  const renderedDrafts = new Map();
  const canEdit = () => !!S()?.canEdit?.();
  const canDM = () => !!S()?.canDM?.();
  const doc = key => { const value = S()?.get?.(key, {version:1,entries:[]}); return value && Array.isArray(value.entries) ? value : {version:1,entries:[]}; };
  const entries = key => list(doc(key).entries).filter(e => e && typeof e === 'object' && typeof e.id === 'string').slice(0, 100);
  const stamp = value => { const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : 'Date not recorded'; };
  const text = value => esc(clean(value));
  const empty = (title, body) => `<div class="cw-empty"><span aria-hidden="true">◇</span><h3>${text(title)}</h3><p>${text(body)}</p></div>`;
  const labels = {promise:'Promise',debt:'Debt',favor:'Favor',faction:'Faction relationship',threat:'Threat clock',lead:'Open question',goal:'Goal',bond:'Bond',contact:'Contact',journal:'Journal',cargo:'Cargo',expense:'Expense',income:'Income',repair:'Repair',upgrade:'Upgrade',job:'Job',update:'Record update',discovery:'Discovery',correction:'Continuity correction','new-person':'New person dossier','new-place':'New place dossier'};
  const statuses = {open:'Open',active:'Active',resolved:'Resolved',paused:'On hold',completed:'Complete',stocked:'On board',planned:'Planned',spent:'Spent / removed'};
  const options = (values, selected, mapping = {}) => values.map(v => `<option value="${text(v)}"${String(v) === String(selected) ? ' selected' : ''}>${text(mapping[v] || v)}</option>`).join('');
  const recordOptions = selected => `<option value="">No linked record</option>${[...records.values()].sort((a,b) => a.title.localeCompare(b.title)).map(r => `<option value="${text(r.id)}"${r.id === selected ? ' selected' : ''}>${text(r.title)} · ${r.type}</option>`).join('')}`;
  const sessionOptions = selected => `<option value="">Session not linked</option>${sessions.map(s => `<option value="${text(s.num)}"${s.num === selected ? ' selected' : ''}>${text(s.num + ' · ' + s.title)}</option>`).join('')}`;
  const named = id => records.get(id);
  const recordLink = id => named(id) ? `<a class="cw-record-link" href="${named(id).url}">${text(named(id).title)} ↗</a>` : '';
  const badge = (label, style = '') => `<span class="cw-badge ${style}">${text(label)}</span>`;
  const paragraph = value => `<p class="cw-copy">${esc(clean(value, 80000))}</p>`;

  function sourceBlock(source) {
    if (!source) return '';
    const session = sessions.find(s => s.num === source.session);
    return `<div class="cw-source"><span>Source</span>${session ? `<a href="#session/${encodeURIComponent(session.num)}">${text(session.num + ' · ' + session.title)} ↗</a>` : '<span>Session not linked</span>'}${badge(source.kind === 'ghost' ? 'Ghost’s account · unverified' : source.kind === 'written' ? 'Written record' : 'Table notes', source.kind === 'ghost' ? 'warning' : '')}${source.note ? `<p>${text(source.note)}</p>` : ''}</div>`;
  }
  function sourceFields(source = {}) {
    return `<fieldset class="cw-source-fields"><legend>Where did this come from?</legend><div class="cw-fields two"><label>Session<select name="session">${sessionOptions(source.session)}</select></label><label>Source type<select name="sourceKind">${options(['table-notes','written','ghost'], source.kind || 'table-notes', {'table-notes':'Party / table notes',written:'Written session record',ghost:'Ghost’s account (unverified)'})}</select></label></div><label>Evidence or source note<textarea name="sourceNote" maxlength="2000" rows="2" placeholder="Quote a passage, note who said it, or explain the observation.">${text(source.note)}</textarea></label></fieldset>`;
  }
  function historyBlock(entry) {
    const history = list(entry.history).slice(-30).reverse();
    return history.length ? `<details class="cw-history"><summary>${history.length} recorded ${history.length === 1 ? 'change' : 'changes'}</summary><ol>${history.map(h => `<li><time>${stamp(h.at)}</time><p>${text(h.summary)}</p>${h.source ? sourceBlock(h.source) : ''}</li>`).join('')}</ol></details>` : '';
  }
  function controls(entry, key) {
    return canEdit() ? `<div class="cw-card-actions"><button data-cw="edit" data-id="${text(entry.id)}" data-key="${key}">Edit record</button><button data-cw="delete" data-id="${text(entry.id)}" data-key="${key}" aria-label="Delete ${text(entry.title || entry.character || 'record')}">Remove</button></div>` : '';
  }
  function accessNotice(privateArea = false) {
    if (!canEdit()) return `<div class="cw-access"><span aria-hidden="true">◈</span><p><strong>Explore freely.</strong> ${privateArea ? 'Session drafts are available to the signed-in party. Approved additions appear below.' : 'These records are public. Party sign-in unlocks shared updates.'}</p><button class="button secondary small" data-cw="signin">Party sign-in</button></div>`;
    return `<div class="cw-access"><span class="status-dot"></span><p><strong>${canDM() ? 'DM access' : 'Party access'}.</strong> ${privateArea ? 'Drafts are shared with the party. Only the DM can approve a canon addition.' : 'Saved changes are shared across devices and visible to visitors. Keep private material in the DM workspace.'}</p><span class="cw-access-label">${canDM() ? 'OWNER' : 'SHARED CREW'}</span></div>`;
  }
  function navigation() {
    const items = [['consequences','Consequences'],['crew-log','Crew log'],['ship-log','Ship ledger'],['intake','Session intake']];
    return `<nav class="cw-nav" aria-label="Campaign workspaces">${items.map(([id,label]) => `<a href="#${id}"${current === id ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
  }
  function statusBar() {
    return `<div class="cw-status ${messageType}" role="${messageType === 'error' ? 'alert' : 'status'}"${message || remotePending ? '' : ' hidden'}>${esc(message || 'Shared records changed while you were editing. Your form is preserved; saving may require a merge.')}${remotePending ? ' <button data-cw="reload">Review latest records</button>' : ''}</div>${undo && canEdit() && (undo.key!=='canon'||canDM()) ? `<div class="cw-undo" role="status">“${text(undo.entry.title || undo.entry.character || undo.entry.snapshot?.title || 'Approval')}” removed. <button data-cw="undo">Undo removal</button></div>` : ''}`;
  }
  function toolbar(types, count, noun, addLabel) {
    return `<div class="cw-toolbar"><label class="cw-search"><span class="sr-only">Search ${noun}</span><input type="search" name="cwSearch" value="${text(query)}" placeholder="Search ${noun}…" aria-label="Search ${noun}"></label><label><span class="sr-only">Filter ${noun}</span><select name="cwFilter" aria-label="Filter ${noun}">${options(['all',...types],filter,{all:'All '+noun,...labels})}</select></label><span class="cw-count">${count} RECORD${count === 1 ? '' : 'S'}</span>${canEdit() ? `<button class="button small" data-cw="new">+ ${addLabel}</button>` : ''}<button class="button secondary small" data-cw="export">Export ↓</button></div>`;
  }
  function matched(data) {
    const term = query.toLowerCase().trim();
    return data.filter(e => (filter === 'all' || e.type === filter || e.kind === filter) && (!term || [e.title,e.details,e.character,e.holder,e.location,named(e.subject || e.contact)?.title].join(' ').toLowerCase().includes(term)));
  }
  function panelForm(title, body, extra = '') {
    return `<section class="cw-editor" aria-labelledby="cwEditorTitle"><div class="cw-editor-head"><div><p class="eyebrow">Shared campaign record</p><h2 id="cwEditorTitle">${text(title)}</h2></div><button class="icon-button" data-cw="cancel" aria-label="Close editor">×</button></div><form id="cwForm">${body}<div class="cw-form-footer"><p>${extra || 'Your update joins the shared record. It does not overwrite the original campaign documents.'}</p><div class="button-row"><button class="button" type="submit">Save shared record</button><button class="button secondary" type="button" data-cw="cancel">Cancel</button><button class="text-button" type="button" data-cw="export-form">Download draft</button></div></div></form></section>`;
  }
  function consequenceForm(e) {
    return panelForm(e.id ? 'Update a consequence.' : 'Every choice leaves a mark.', `<div class="cw-fields two"><label>Record type<select name="type">${options(['promise','debt','favor','faction','threat','lead'],e.type || 'promise',labels)}</select></label><label>Status<select name="status">${options(['open','active','resolved','paused'],e.status || 'open',statuses)}</select></label></div><label>Title<input name="title" value="${text(e.title)}" maxlength="160" required placeholder="What should the crew remember?"></label><label>The situation<textarea name="details" rows="4" maxlength="6000" required>${text(e.details)}</textarea></label><label>Linked person, faction or place<select name="subject">${recordOptions(e.subject)}</select></label><div class="cw-fields three"><label>Faction attitude<select name="attitude">${options(['unknown','allied','friendly','neutral','wary','hostile'],e.attitude || 'unknown')}</select></label><label>Clock progress<input name="progress" type="number" min="0" max="12" step="1" value="${Number(e.progress)||0}"></label><label>Clock segments<input name="segments" type="number" min="2" max="12" step="1" value="${Number(e.segments)||6}"></label></div><p class="cw-field-note">Attitude is used for faction relationships. Progress and segments are used for threat clocks. Public clocks should contain only information the party has discovered.</p>${sourceFields(e.source)}${e.id ? '<label>What changed?<input name="changeNote" maxlength="400" required placeholder="A short explanation for the history." value="' + text(e.changeNote) + '"></label>' : ''}`);
  }
  function clock(entry) {
    const total = Math.max(2, Math.min(12, Number(entry.segments) || 6)), progress = Math.max(0, Math.min(total, Number(entry.progress) || 0));
    return `<div class="cw-clock" role="img" aria-label="${text(entry.title)}: ${progress} of ${total} segments"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="cw-clock-track" cx="50" cy="50" r="39"/>${Array.from({length:total},(_,i) => {const a = i / total * Math.PI * 2 - Math.PI / 2 + .04, b = (i+1) / total * Math.PI * 2 - Math.PI / 2 - .04; return `<path class="${i < progress ? 'filled' : ''}" d="M ${50+39*Math.cos(a)} ${50+39*Math.sin(a)} A 39 39 0 0 1 ${50+39*Math.cos(b)} ${50+39*Math.sin(b)}"/>`;}).join('')}</svg><strong>${progress}<small>/ ${total}</small></strong></div>`;
  }
  function consequences() {
    const data = entries('consequences'), visible = matched(sub && data.some(e=>e.id===sub) ? data.filter(e=>e.id===sub) : data), open = data.filter(e => !['resolved','completed'].includes(e.status)).length;
    return `${pageHead('The wake we leave / living campaign','Consequences.','Promises, debts, loyalties, and trouble that does not disappear when the session ends.')}<div class="cw-overview"><div><strong>${open.toString().padStart(2,'0')}</strong><span>UNFINISHED BUSINESS</span></div><div><strong>${data.filter(e => e.type === 'threat').length.toString().padStart(2,'0')}</strong><span>VISIBLE THREAT CLOCKS</span></div><p>Keep the source close.<br>Let the history tell the story.</p><span class="cw-orbit" aria-hidden="true"></span></div>${accessNotice()}${sub ? '<a class="cw-record-link" href="#consequences">← All consequences</a>' : ''}${toolbar(['promise','debt','favor','faction','threat','lead'],visible.length,'consequences','Log a consequence')}${editor ? consequenceForm(editor) : ''}<div class="cw-grid" id="cwResults">${visible.map(e => `<article class="cw-card ${e.type === 'threat' ? 'cw-threat' : ''}" id="consequence-${text(e.id)}"><header>${badge(labels[e.type] || 'Consequence')}${badge(statuses[e.status] || 'Open',e.status === 'resolved' ? 'success' : '')}</header>${e.type === 'threat' ? clock(e) : ''}<h2>${text(e.title)}</h2>${recordLink(e.subject)}${e.type === 'faction' ? `<p class="cw-attitude">Crew relationship <strong>${text(e.attitude || 'unknown')}</strong></p>` : ''}${paragraph(e.details)}${sourceBlock(e.source)}${historyBlock(e)}${controls(e,'consequences')}</article>`).join('') || empty('No loose ends recorded here yet.','The original open threads remain in the compendium. Log a sourced promise, debt, or developing threat when the crew is ready.')} </div><a class="cw-archive-link" href="#threads">Read the original campaign threads ↗</a>`;
  }

  function characterForm(e) {
    return panelForm(e.id ? 'Update a crew entry.' : 'A little more than a character sheet.', `<div class="cw-fields two"><label>Character<select name="character" required>${list(D.CREW).map(c => `<option${c.name === (e.character || sub) ? ' selected' : ''}>${text(c.name)}</option>`).join('')}</select></label><label>Entry type<select name="kind">${options(['goal','bond','contact','journal'],e.kind || 'goal',labels)}</select></label></div><label>Title<input name="title" maxlength="160" value="${text(e.title)}" required></label><label>The entry<textarea name="details" rows="5" maxlength="6000" required>${text(e.details)}</textarea></label><div class="cw-fields two"><label>Status<select name="status">${options(['active','completed','paused'],e.status || 'active',statuses)}</select></label><label>Linked contact or record<select name="contact">${recordOptions(e.contact)}</select></label></div>${sourceFields(e.source)}${e.id ? '<label>What changed?<input name="changeNote" maxlength="400" required value="' + text(e.changeNote) + '"></label>' : ''}`, 'This is a shared crew log, visible to the public. The shared party password does not create private individual journals.');
  }
  function crewLog() {
    const data = entries('characters'), crew = list(D.CREW), character = crew.find(c => c.name === sub), scoped = character ? data.filter(e => e.character === character.name) : data, visible = matched(scoped), portrait = character && (M.matches?.[character.name] || character.image);
    return `${pageHead('People, not just statistics','The crew log.','Goals, bonds, encounters, and the things each character carries forward.')} ${accessNotice()}<div class="cw-crew-layout"><nav class="cw-crew-nav" aria-label="Choose a crew member"><a href="#crew-log"${!character ? ' aria-current="page"' : ''}><span>◇</span><div>Everyone<small>THE SHARED LOG</small></div><b>${data.length}</b></a>${crew.map(c => {const src=M.matches?.[c.name]||c.image;return `<a href="#crew-log/${encodeURIComponent(c.name)}"${character?.name === c.name ? ' aria-current="page"' : ''}>${src ? image(src,c.name) : '<span>◇</span>'}<div>${text(c.name)}<small>${text(c.status || 'CREW')}</small></div><b>${data.filter(e => e.character === c.name).length}</b></a>`;}).join('')}</nav><div class="cw-crew-main">${character ? `<section class="cw-character-header">${portrait ? image(portrait,character.name) : ''}<div><p class="eyebrow">Personal story / shared record</p><h2>${text(character.name)}</h2><p>${text(character.tagline || character.class)}</p><a href="#person/${encodeURIComponent(character.name)}">Read the full dossier ↗</a></div></section>` : ''}${toolbar(['goal','bond','contact','journal'],visible.length,'entries','Add to the log')}${editor ? characterForm(editor) : ''}<div class="cw-grid">${visible.map(e => `<article class="cw-card"><header>${badge(labels[e.kind] || 'Journal')}${badge(statuses[e.status] || 'Active',e.status === 'completed' ? 'success' : '')}</header><a class="cw-character-label" href="#crew-log/${encodeURIComponent(e.character)}">${text(e.character)}</a><h2>${text(e.title)}</h2>${recordLink(e.contact)}${paragraph(e.details)}${sourceBlock(e.source)}${historyBlock(e)}${controls(e,'characters')}</article>`).join('') || empty('The next chapter is unwritten.','Add a goal, record a meaningful connection, or keep a shared account of what happened. Existing character dossiers remain intact.')}</div></div></div>`;
  }

  function ledgerForm(e) {
    return panelForm(e.id ? 'Update the manifest.' : 'Put it on the manifest.', `<div class="cw-fields two"><label>Entry type<select name="type">${options(['cargo','expense','income','repair','upgrade','job'],e.type || 'cargo',labels)}</select></label><label>Status<select name="status">${options(['stocked','planned','active','completed','spent'],e.status || 'stocked',statuses)}</select></label></div><label>Item, transaction or job<input name="title" maxlength="160" value="${text(e.title)}" required></label><label>Description / provenance<textarea name="details" rows="4" maxlength="6000">${text(e.details)}</textarea></label><div class="cw-fields three"><label>Quantity<input name="quantity" type="number" step="1" min="0" max="1000000" value="${Number.isInteger(e.quantity)?e.quantity:1}"></label><label>Amount (optional)<input name="amount" type="number" step=".01" min="0" max="1000000000" value="${e.amount == null ? '' : Number(e.amount)}" placeholder="0.00"></label><label>Currency / unit<input name="currency" maxlength="30" value="${text(e.currency || 'credits')}" required></label></div><p class="cw-field-note">Income adds to the recorded balance; expenses subtract. Other amounts are estimates or item values. This ledger begins at zero and does not assume the crew’s current funds.</p><div class="cw-fields two"><label>Held by / assigned to<input name="holder" maxlength="120" value="${text(e.holder)}" placeholder="Crew member, ship storage…"></label><label>Storage / location<input name="location" maxlength="120" value="${text(e.location)}"></label></div><label>Linked supplier, contact or place<select name="subject">${recordOptions(e.subject)}</select></label>${sourceFields(e.source)}${e.id ? '<label>What changed?<input name="changeNote" maxlength="400" required value="' + text(e.changeNote) + '"></label>' : ''}`);
  }
  function shipLog() {
    const data = entries('ledger'), visible = matched(data), balances = new Map();
    data.filter(e => ['income','expense'].includes(e.type) && e.status === 'completed' && e.amount != null && Number.isFinite(Number(e.amount))).forEach(e => {const unit = clean(e.currency || 'credits',30);balances.set(unit,(balances.get(unit)||0)+(e.type === 'income'?1:-1)*Number(e.amount));});
    const balance = [...balances.entries()].map(([unit,n]) => `<span><strong>${n.toLocaleString(undefined,{maximumFractionDigits:2})}</strong> ${text(unit)}</span>`).join('') || '<span>No completed transactions</span>';
    return `${pageHead('B.B.C. / Big Beautiful Craft','The ship ledger.','Cargo in the hold. Jobs on the horizon. Every suspicious purchase accounted for.')}<section class="cw-ship-banner"><div class="cw-ship-schematic" aria-hidden="true"><svg viewBox="0 0 400 180"><path d="M25 90 105 68 160 20 244 20 300 68 375 90 300 112 244 160 160 160 105 112Z M105 68 300 68 300 112 105 112Z M160 20 160 160 M244 20 244 160 M25 90 375 90"/><circle cx="201" cy="90" r="48"/><circle cx="201" cy="90" r="67" stroke-dasharray="3 8"/></svg><span>B.B.C. / MANIFEST TERMINAL</span></div><div><p class="eyebrow">Recorded cash flow</p><div class="cw-balances">${balance}</div><p>Completed income minus completed expenses in this ledger. Starting funds and unrecorded transactions are not included.</p></div></section>${accessNotice()}${toolbar(['cargo','expense','income','repair','upgrade','job'],visible.length,'manifest entries','Add to manifest')}${editor ? ledgerForm(editor) : ''}<div class="cw-manifest">${visible.map(e => `<article class="cw-card cw-manifest-row"><div class="cw-manifest-type"><span aria-hidden="true">${({cargo:'▦',expense:'−',income:'+',repair:'⚒',upgrade:'↑',job:'⌖'})[e.type]||'◇'}</span><small>${text(labels[e.type] || 'Entry')}</small></div><div class="cw-manifest-body"><header>${badge(statuses[e.status] || 'On board')}${e.holder ? badge(e.holder) : ''}</header><h2>${text(e.title)}</h2>${recordLink(e.subject)}${paragraph(e.details)}${e.location ? `<p class="cw-storage">LOCATION / ${text(e.location)}</p>` : ''}${sourceBlock(e.source)}${historyBlock(e)}${controls(e,'ledger')}</div><div class="cw-manifest-numbers"><span>QTY</span><strong>${Number(e.quantity)||0}</strong>${e.amount != null ? `<small>${Number(e.amount).toLocaleString(undefined,{maximumFractionDigits:2})} ${text(e.currency || 'credits')}</small>` : ''}</div></article>`).join('') || empty('Clear the airlock. Open the ledger.','Add real cargo, expenses, repairs, upgrades, and jobs as they are recorded. No starting inventory or balance has been invented.')}</div>`;
  }

  // Canon approval derives from an exact snapshot of content, never a party-editable status flag.
  function intakeSnapshot(draft) {
    return {title:clean(draft.title,160),session:clean(draft.session,40),kind:clean(draft.kind,30),sourceText:clean(draft.sourceText,80000),recordingId:clean(draft.recordingId,200),audio:draft.audio ? {id:clean(draft.audio.id,200),name:clean(draft.audio.name,255),size:Number(draft.audio.size)||0,type:clean(draft.audio.type,100)} : null,proposals:list(draft.proposals).slice(0,30).map(p => ({id:clean(p.id,100),title:clean(p.title,160),text:clean(p.text,2000),target:clean(p.target,200),type:clean(p.type,30),sourceExcerpt:clean(p.sourceExcerpt,2000),entityName:clean(p.entityName,120),locationId:clean(p.locationId,200),imageSrc:clean(p.imageSrc,500)}))};
  }
  const fingerprint = draft => JSON.stringify(intakeSnapshot(draft));
  function approvals(draft) { return entries('canon').filter(c => c.draftId === draft.id && c.snapshot); }
  function approvedProposalIds(draft) {
    const matching = approvals(draft).filter(c => JSON.stringify(intakeSnapshot(c.snapshot)) === fingerprint(draft));
    return new Set(matching.flatMap(c => list(c.proposals).map(p => p.id)));
  }
  function currentApproval(draft) { const approved=approvedProposalIds(draft);return list(draft.proposals).length>0 && draft.proposals.every(p=>approved.has(p.id)); }
  function extractCandidates(value) {
    const sentences = String(value).split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.length >= 20 && s.length <= 2000);
    const found = [], seen = new Set();
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase(), matches = [...records.values()].filter(r => r.aliases.some(alias=>alias.length>2&&new RegExp('(?:^|[^a-z0-9])' + alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(?=$|[^a-z0-9])','i').test(lower)));
      const type = /\b(owe|owes|owed|debt|repay|loan)\b/i.test(sentence) ? 'debt' : /\b(promis(?:e|ed)|swore|pledge|vow)\b/i.test(sentence) ? 'promise' : /\b(bought|paid|cost|purchase|sold|credits|gold)\b/i.test(sentence) ? 'cargo' : /\b(threat|deadline|attack|danger|countdown)\b/i.test(sentence) ? 'threat' : /\b(discovered|learned|revealed|found|met)\b/i.test(sentence) ? 'discovery' : 'update';
      if ((!matches.length && type === 'update') || seen.has(lower)) continue;
      seen.add(lower);
      found.push({id:uid(),title:(matches[0]?.title || labels[type] || 'Review this passage') + ' · ' + (type === 'update' ? 'possible update' : labels[type] || type),text:sentence,target:matches[0]?.id || '',type,sourceExcerpt:sentence});
      if (found.length >= 30) break;
    }
    return found;
  }
  function intakeFlags(draft) {
    const flags = [], body = String(draft.sourceText || '');
    if (draft.kind === 'ghost') flags.push('Ghost’s narration is an in-character account. Verify factual claims against a written record before approving them.');
    if (/\bBrook\b/.test(body)) flags.push('“Brook” is Ghost’s nickname for Rook (Sen-47). Preserve quoted speech; use Rook in factual record titles.');
    if (/\bEllie\b/i.test(body) && /\bL\.?E\.?\b/.test(body)) flags.push('Ellie and L.E. are separate campaign entities. Check that this passage does not merge them.');
    if (/\b(Skyrim|Tamriel|Dragonborn|Whiterun|Solitude|Dovahkiin|Morrowind|Nerevarine)\b/i.test(body)) flags.push('Possible Elder Scrolls terminology found. Check whether this is a quotation or needs a sourced Shattering replacement.');
    if (['S11','S12'].includes(draft.session) && /\bplanet\b/i.test(body)) flags.push('The Celestial Tunnel is a plane of existence. Check whether “planet” refers to a different location in this passage.');
    if (list(draft.proposals).some(p=>p.sourceExcerpt && !body.includes(p.sourceExcerpt))) flags.push('A proposal quotes text that is absent from the current source. Check whether the source was edited before approving it.');
    if (!draft.session) flags.push('No source session linked. Add one when known; do not guess.');
    return flags;
  }
  function proposalFields(p, i) {
    const isNew=['new-person','new-place'].includes(p.type);
    return `<fieldset class="cw-proposal" data-proposal="${text(p.id)}"><legend>Proposal ${i+1} / requires review</legend><label>Change title<input data-proposal-field="title" maxlength="160" value="${text(p.title)}" required></label><div class="cw-fields two"><label>Suggested change<select data-proposal-field="type">${options(['update','discovery','correction','promise','debt','cargo','threat','new-person','new-place'],p.type || 'update',labels)}</select></label><label${isNew?' hidden':''}>Existing record<select data-proposal-field="target"${isNew?' disabled':''}>${recordOptions(p.target)}</select></label></div><div class="cw-new-entity"${isNew?'':' hidden'}><div class="cw-fields two"><label>${p.type==='new-place'?'Place':'Character'} name<input data-proposal-field="entityName" maxlength="120" value="${text(p.entityName)}"${isNew?' required':''} placeholder="Use the confirmed campaign name"></label><label>${p.type==='new-place'?'Parent world / place':'Known location'} (optional)<select data-proposal-field="locationId"><option value="">Not established</option>${[...records.values()].filter(r=>r.type==='Place').map(r=>`<option value="${text(r.id.slice(6))}"${r.id.slice(6)===p.locationId?' selected':''}>${text(r.title)}</option>`).join('')}</select></label></div><label>Existing campaign artwork (optional)<select data-proposal-field="imageSrc"><option value="">No matching artwork selected</option>${[...artwork.entries()].sort((a,b)=>a[1].localeCompare(b[1])).map(([src,title])=>`<option value="${text(src)}"${src===p.imageSrc?' selected':''}>${text(title)}</option>`).join('')}</select></label>${artwork.has(p.imageSrc)?`<div class="cw-proposal-art">${image(p.imageSrc,p.entityName||'Selected campaign artwork')}</div>`:''}<p class="cw-field-note">The DM’s approval creates a sourced dossier. Existing names must use “Record update.” New places are uncharted locations; no position on the star map is invented.</p></div><label>Proposed text<textarea data-proposal-field="text" maxlength="2000" rows="3" required>${text(p.text)}</textarea></label><details><summary>Verbatim source passage</summary>${paragraph(p.sourceExcerpt || 'Added manually; cite the source in the proposed text.')}</details><button type="button" class="text-button" data-cw="remove-proposal" data-id="${text(p.id)}">Remove this proposal</button></fieldset>`;
  }
  function intakeForm(e) {
    const audios = list(M.recordings).filter(r => !r.libraryClip);
    return `<section class="cw-editor cw-intake-editor"><div class="cw-editor-head"><div><p class="eyebrow">From table to archive</p><h2>${e.id ? 'Review the session draft.' : 'Bring the next session aboard.'}</h2></div><button class="icon-button" data-cw="cancel" aria-label="Close session draft">×</button></div><form id="cwForm"><label>Draft title<input name="title" maxlength="160" value="${text(e.title)}" placeholder="Session title / notes to review" required></label><div class="cw-fields two"><label>Source session<select name="session">${sessionOptions(e.session)}</select></label><label>Source type<select name="kind">${options(['table-notes','written','ghost'],e.kind || 'table-notes',{'table-notes':'Party / table notes',written:'Written session record',ghost:'Ghost’s account (unverified)'})}</select></label></div><div class="cw-import-row"><label class="button secondary small">Import text / JSON<input type="file" name="sourceFile" accept=".txt,.md,.json,text/plain,text/markdown,application/json"></label><label class="button secondary small">Attach source audio<input type="file" name="audioFile" accept=".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4"></label><span>Uploads are shared with the signed-in party.</span></div><label>Original source text / transcript<textarea name="sourceText" maxlength="80000" rows="12" required placeholder="Paste the written notes or transcript. The original wording is kept with every review.">${esc(clean(e.sourceText,80000))}</textarea></label><p class="cw-field-note">Imports stay in this draft until you save. Text and JSON files only; paste extracted PDF text here. Audio uploads when you save (MP3, WAV, OGG, or M4A; up to 50 MiB). Supply a transcript for passage extraction; no automatic transcription runs.</p><label>Link a recording already in the compendium<select name="recordingId"><option value="">No linked recording</option>${audios.map(r => `<option value="${text(r.id)}"${e.recordingId === r.id ? ' selected' : ''}>${text(r.title)}</option>`).join('')}</select></label><div id="cwAudioReference">${e.audio ? `<p class="cw-field-note">Audio reference: ${text(e.audio.name)} · ${(Number(e.audio.size)/1048576).toFixed(1)} MiB · ${e.audio.id ? 'uploaded · party access only' : 'queued for upload when you save'}.</p>` : ''}${e.audio?.id && !localAudio ? `<button type="button" class="button secondary small" data-cw="shared-audio" data-id="${text(e.audio.id)}">▶ Play uploaded source</button>` : ''}${localAudio ? `<audio controls preload="metadata" src="${localAudio.url}"></audio>` : ''}</div><div class="cw-intake-actions"><button type="button" class="button secondary" data-cw="extract">Find passages to review</button><button type="button" class="button secondary" data-cw="add-proposal">+ Manual proposal</button><p>Matches known names and change-related phrases. Suggestions are excerpts, not generated facts. Read and edit every proposal.</p></div><div id="cwProposals">${list(e.proposals).map(proposalFields).join('')}</div><label>Why this source matters (optional)<textarea name="reviewNote" maxlength="2000" rows="2">${text(e.reviewNote)}</textarea></label><div class="cw-form-footer"><p>Saving creates a shared party draft. DM approval is a separate action; the original compendium is preserved.</p><div class="button-row"><button class="button" type="submit">Save for DM review</button><button class="button secondary" type="button" data-cw="cancel">Cancel</button><button class="text-button" type="button" data-cw="export-form">Download draft</button></div></div></form></section>`;
  }
  function proposalView(p) {
    const isNew=['new-person','new-place'].includes(p.type);
    return `<div class="cw-approved-proposal"><div>${badge(labels[p.type] || 'Update')}${recordLink(p.target)}</div><h3>${text(p.title)}</h3>${isNew?`<p class="cw-new-record-name"><strong>${text(p.entityName)}</strong>${p.locationId?` · ${recordLink('world:'+p.locationId)}`:''}</p>${artwork.has(p.imageSrc)?`<div class="cw-proposal-art">${image(p.imageSrc,p.entityName||'Campaign artwork')}</div>`:''}`:''}${paragraph(p.text)}${p.sourceExcerpt ? `<details><summary>Supporting passage</summary><blockquote>${text(p.sourceExcerpt)}</blockquote></details>` : ''}</div>`;
  }
  function intakeCard(draft) {
    renderedDrafts.set(draft.id,fingerprint(draft));
    const approved = currentApproval(draft), partial = approvedProposalIds(draft), past = approvals(draft), flags = intakeFlags(draft), audio = list(M.recordings).find(r => r.id === draft.recordingId);
    return `<article class="cw-card cw-intake-card" id="draft-${text(draft.id)}"><header>${badge(approved ? 'DM approved · current version' : partial.size ? partial.size + ' proposals approved · review continues' : past.length ? 'Revised since approval' : 'Awaiting DM review',approved ? 'success' : 'warning')}<time>${stamp(draft.updatedAt || draft.createdAt)}</time></header><h2>${text(draft.title)}</h2>${sourceBlock({session:draft.session,kind:draft.kind})}${flags.length ? `<div class="cw-review-flags"><h3>Review checkpoints</h3><ul>${flags.map(f => `<li>${text(f)}</li>`).join('')}</ul></div>` : ''}<details class="cw-original"><summary>Read the original source (${String(draft.sourceText || '').length.toLocaleString()} characters)</summary>${paragraph(draft.sourceText)}</details>${audio ? `<button class="button secondary small" data-cw="play" data-id="${text(audio.id)}">▶ ${text(audio.title)}</button>` : ''}${draft.audio ? `<p class="cw-field-note">Source audio: ${text(draft.audio.name)}. ${draft.audio.id ? 'Available to the signed-in party.' : 'Legacy filename reference; attach the audio to upload it.'}</p>` : ''}${draft.audio?.id ? `<button class="button secondary small" data-cw="shared-audio" data-id="${text(draft.audio.id)}">▶ Play source audio</button>` : ''}${draft.reviewNote ? `<p class="cw-review-note">${text(draft.reviewNote)}</p>` : ''}<details class="cw-proposal-review"${canDM() && !approved ? ' open' : ''}><summary>${list(draft.proposals).length} proposed additions / changes</summary>${list(draft.proposals).map(p => `<div class="cw-review-choice">${canDM() && !approved ? `<label class="cw-approve-checkbox"><input type="checkbox" data-approve-proposal="${text(p.id)}" data-draft="${text(draft.id)}"${partial.has(p.id) ? ' disabled' : ' checked'}><span>${partial.has(p.id) ? 'Already approved in this version' : 'Include this proposal'}</span></label>` : ''}${proposalView(p)}</div>`).join('') || '<p class="cw-field-note">No proposals yet. Edit the draft to add reviewed passages or a manual proposal.</p>'}${canDM() && !approved ? `<label>DM review note<textarea data-dm-review="${text(draft.id)}" maxlength="1000" rows="2" placeholder="Explain the approval, corrections, or source comparison."></textarea></label><button class="button" data-cw="approve" data-id="${text(draft.id)}"${list(draft.proposals).length ? '' : ' disabled'}>Approve selected additions</button><p class="cw-field-note">This publishes the selected additions and their supporting excerpts. The full source snapshot remains available to the signed-in party. It does not silently rewrite existing dossiers.</p>` : ''}</details>${controls(draft,'intake')}</article>`;
  }
  function canonCard(approval) {
    const snapshot = approval.snapshot || {}, matching = entries('intake').find(d => d.id === approval.draftId);
    return `<article class="cw-card cw-canon-card" id="approval-${text(approval.id)}"><header>${badge('DM approved','success')}<time>${stamp(approval.approvedAt)}</time></header><h2>${text(snapshot.title || approval.title || 'Approved campaign addition')}</h2>${sourceBlock({session:snapshot.session,kind:snapshot.kind})}${canEdit() && matching ? `<a class="cw-record-link" href="#intake/${encodeURIComponent(matching.id)}">Open source draft ↗</a>` : ''}${list(approval.proposals).map(proposalView).join('')}${canEdit() && approval.reviewerNote ? `<p class="cw-review-note">DM review: ${text(approval.reviewerNote)}</p>` : ''}${canEdit() ? `<details class="cw-original"><summary>Full source snapshot · party access</summary>${paragraph(snapshot.sourceText || '')}</details>` : ''}${canDM() ? `<div class="cw-card-actions"><button data-cw="delete" data-key="canon" data-id="${text(approval.id)}">Withdraw approval</button></div>` : ''}</article>`;
  }
  function intake() {
    const drafts = canEdit() ? entries('intake') : [], canon = entries('canon').filter(c => c.snapshot), target = drafts.find(d => d.id === sub), shown = target ? [target] : drafts, selectedApproval=canon.find(c=>c.id===sub),shownCanon=selectedApproval?[selectedApproval]:canon;
    return `${pageHead('Session intake / editorial desk','Keep the story straight.','Preserve the source. Review the changes. Let the DM decide what becomes part of the record.')}<div class="cw-process" aria-label="Review process"><span><b>01</b> Bring the notes</span><i>→</i><span><b>02</b> Check the passages</span><i>→</i><span><b>03</b> DM approves</span><i>→</i><span><b>04</b> Publish the record</span></div>${accessNotice(true)}${canEdit() ? `<div class="cw-toolbar"><span class="cw-count">${drafts.length} SHARED DRAFT${drafts.length===1?'':'S'}</span><button class="button" data-cw="new">+ Start a session draft</button><button class="button secondary small" data-cw="export">Export drafts ↓</button></div>` : ''}${editor ? intakeForm(editor) : ''}${canEdit() ? `<div class="section-heading"><h2>Review queue</h2>${target ? '<a href="#intake">Show all drafts ↗</a>' : ''}</div><div class="cw-intake-list">${shown.map(intakeCard).join('') || empty('Ready for the next session.','Add notes or a transcript to make a source-preserving draft. Nothing is approved automatically.')}</div>` : ''}<div class="section-heading"><h2>Approved campaign additions</h2>${selectedApproval ? '<a href="#intake">All approvals ↗</a>' : ''}<span class="cw-count">${canon.length} APPROVAL${canon.length===1?'':'S'}</span></div><div class="cw-intake-list">${shownCanon.slice().reverse().map(canonCard).join('') || empty('The original canon is still the foundation.','New approved additions will appear here with their sources. Explore the flight journal and dossiers for the existing campaign.')} </div><a class="cw-archive-link" href="#journal">Read the original flight journal ↗</a>`;
  }

  function inner() { refreshRecords();return `${navigation()}<div id="cwStatusHost">${statusBar()}</div>${({consequences,'crew-log':crewLog,'ship-log':shipLog,intake})[current]?.() || ''}`; }
  function repaint() {
    if (!root?.isConnected) return;
    root.querySelectorAll('audio').forEach(audio=>audio.pause());
    root.innerHTML = inner();
  }
  function notify(value, type = '') {
    message = clean(value,1500);messageType = type;
    const host = root?.querySelector('#cwStatusHost');
    if (host) host.innerHTML = statusBar();
  }
  function setBusy(value) {
    busy = value;
    root?.setAttribute('aria-busy',String(value));
    root?.querySelectorAll('button[type="submit"], button[data-cw="approve"], button[data-cw="delete"], button[data-cw="undo"]').forEach(button => {if(value){button.dataset.cwWasDisabled=String(button.disabled);button.disabled=true;}else if(button.dataset.cwWasDisabled!=null){button.disabled=button.dataset.cwWasDisabled==='true';delete button.dataset.cwWasDisabled;}});
  }
  function guard() {if (!canEdit()) {notify('Sign in with party or DM access before saving.','error');return false;}if (busy) return false;return true;}
  async function saveEntries(key, value) {
    if (value.length > 100) throw new Error('This workspace holds 100 entries. Export a backup and remove old entries before adding more.');
    const payload = {version:1,entries:value};
    if (new Blob([JSON.stringify(payload)]).size > 1950000) throw new Error('This workspace is close to its storage limit. Download a backup and shorten source text before retrying.');
    await S().save(key,payload);
  }
  function formSource(f) {return {session:clean(f.get('session'),40),kind:clean(f.get('sourceKind'),30),note:clean(f.get('sourceNote'),2000).trim()};}
  function requireText(value, label, limit) {const result=clean(value,limit).trim();if (!result) throw new Error(label+' is required.');return result;}
  function validNumber(value,min,max,integer,label) {const n=Number(value);if (!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n))) throw new Error(label+' must be '+(integer?'a whole number ':'')+'between '+min+' and '+max+'.');return n;}
  function validateNewEntities(proposals) {
    refreshRecords();const fold=value=>clean(value,120).trim().normalize('NFKC').toLocaleLowerCase();
    const existing=new Set([...records.values()].flatMap(r=>r.aliases).map(fold)),seen=new Set(),ids=new Set();
    for(const proposal of proposals) {
      if(ids.has(proposal.id))throw new Error('Two proposals have the same identifier. Remove one and add a new manual proposal.');ids.add(proposal.id);
      if(!['new-person','new-place'].includes(proposal.type))continue;
      const name=requireText(proposal.entityName,'New dossier name',120),key=fold(name);
      if(existing.has(key))throw new Error('“'+name+'” already has a campaign record. Choose “Record update” and link the existing dossier instead.');
      if(seen.has(key))throw new Error('“'+name+'” appears more than once among the new dossiers. Keep one proposal for this name.');seen.add(key);
      if(proposal.locationId&&!records.has('world:'+proposal.locationId))throw new Error('Choose an existing world or place for “'+name+'”, or leave its location unestablished.');
      if(proposal.imageSrc&&!artwork.has(proposal.imageSrc))throw new Error('Choose artwork from the existing campaign library. External image URLs are not accepted here.');
    }
  }
  function captureForm(validate = true) {
    const form = root.querySelector('#cwForm');if (!form) return null;
    const f = new FormData(form), base = {...editor}, key = routeKeys[current];
    const required = (v,label,max) => validate ? requireText(v,label,max) : clean(v,max);
    const number = (v,min,max,integer,label) => validate ? validNumber(v,min,max,integer,label) : Number.isFinite(Number(v)) ? Number(v) : 0;
    base.title=required(f.get('title'),'Title',160);
    if (key==='intake') {
      base.session=clean(f.get('session'),40);base.kind=clean(f.get('kind'),30);base.sourceText=required(f.get('sourceText'),'Source text',80000);base.recordingId=clean(f.get('recordingId'),200);base.reviewNote=clean(f.get('reviewNote'),2000);
      base.proposals=[...form.querySelectorAll('[data-proposal]')].map(el => {const original=list(editor.proposals).find(p=>p.id===el.dataset.proposal)||{};const value=name=>el.querySelector(`[data-proposal-field="${name}"]`)?.value;const type=clean(value('type'),30),isNew=['new-person','new-place'].includes(type);return {id:el.dataset.proposal,title:required(value('title'),'Proposal title',160),text:required(value('text'),'Proposal text',2000),target:isNew?'':clean(value('target'),200),type,sourceExcerpt:clean(original.sourceExcerpt,2000),entityName:clean(value('entityName'),120).trim(),locationId:clean(value('locationId'),200),imageSrc:clean(value('imageSrc'),500)};});
      if (base.proposals.length>30) throw new Error('A session draft can contain up to 30 proposals.');
      if(validate)validateNewEntities(base.proposals);
      return base;
    }
    base.details=current==='ship-log' ? clean(f.get('details'),6000).trim() : required(f.get('details'),'Details',6000);base.status=clean(f.get('status'),30);base.source=formSource(f);
    if (key==='consequences') {base.type=clean(f.get('type'),30);base.subject=clean(f.get('subject'),200);base.attitude=clean(f.get('attitude'),30);base.segments=number(f.get('segments'),2,12,true,'Clock segments');base.progress=number(f.get('progress'),0,base.segments,true,'Clock progress');}
    if (key==='characters') {base.character=clean(f.get('character'),120);base.kind=clean(f.get('kind'),30);base.contact=clean(f.get('contact'),200);if(validate&&!list(D.CREW).some(c=>c.name===base.character))throw new Error('Choose a known crew member.');}
    if (key==='ledger') {base.type=clean(f.get('type'),30);base.subject=clean(f.get('subject'),200);base.quantity=number(f.get('quantity'),0,1000000,true,'Quantity');base.amount=f.get('amount')===''?null:number(f.get('amount'),0,1000000000,false,'Amount');base.currency=required(f.get('currency'),'Currency / unit',30);base.holder=clean(f.get('holder'),120);base.location=clean(f.get('location'),120);}
    base.changeNote=clean(f.get('changeNote'),400);
    const change = editor.id ? required(base.changeNote,'Change explanation',400) : 'Record created.';
    if (validate) base.history=[...list(editor.history),{at:now(),summary:change,source:base.source}].slice(-30);
    return base;
  }
  async function submit(event) {
    if (event.target.id!=='cwForm') return;
    event.preventDefault();if (!guard()) return;
    try {
      const next=captureForm(), key=routeKeys[current], old=entries(key), id=next.id||uid();
      if (editor.id && !old.some(e=>e.id===editor.id)) throw new Error('This record was removed by another editor. Download your draft, then create a new record.');
      if(editor.id && editor._baseJSON && JSON.stringify(old.find(e=>e.id===editor.id))!==editor._baseJSON)throw new Error('Another party member changed this record while you were editing. Download your draft, review the latest record, and merge your changes before saving.');
      next.id=id;next.createdAt=next.createdAt||now();next.updatedAt=now();delete next.changeNote;delete next._baseJSON;setBusy(true);
      if(key==='intake' && localAudio?.file) {
        if(typeof S().upload!=='function')throw new Error('Audio upload is not connected yet. Your draft and local preview are preserved.');
        notify('Uploading source audio to the party workspace… Keep this page open.');
        const uploadFile=localAudio.file,uploaded=await S().upload(uploadFile);
        if(!uploaded?.id)throw new Error('Audio upload did not return a file reference. Please retry.');
        if(!canEdit()||!editor)throw new Error('Your access changed during the upload. Sign in again before saving the source draft.');
        next.audio={id:clean(uploaded.id,200),name:clean(uploaded.name || uploadFile.name,255),size:Number(uploaded.size)||uploadFile.size,type:clean(uploaded.type || uploadFile.type,100)};
        editor.audio=structuredClone(next.audio);if(localAudio)localAudio.file=null;
      }
      notify('Saving the shared record…');
      await saveEntries(key,next.id && old.some(e=>e.id===id) ? old.map(e=>e.id===id?next:e) : [...old,next]);
      editor=null;dirty=false;remotePending=false;releaseAudio();message='Saved to the shared campaign workspace.';messageType='success';repaint();
    } catch (error) {notify(error.message || 'The save failed. Your form is still here; download a draft before leaving.','error');}
    finally {setBusy(false);}
  }
  function download(value, filename) {const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function releaseAudio() {if (localAudio) URL.revokeObjectURL(localAudio.url);localAudio=null;}
  async function removeEntry(key,id) {
    const entry=entries(key).find(e=>e.id===id);if(!entry||!guard())return;
    if(key==='canon'&&!canDM()){notify('Only the DM can withdraw an approval.','error');return;}
    if(!window.confirm(key==='canon' ? 'Withdraw this approval and its additions from the public record? The source draft remains available for another review.' : 'Remove “'+(entry.title||entry.character)+'” from the shared workspace?'+(key==='intake'?' Any DM-approved additions and their source snapshots will remain available.':'')))return;
    try {setBusy(true);await saveEntries(key,entries(key).filter(e=>e.id!==id));undo={key,entry};editor=null;dirty=false;message='Record removed. You can undo this removal below.';messageType='';repaint();}catch(error){notify(error.message||'Could not remove this record.','error');}finally{setBusy(false);}
  }
  async function approve(id) {
    if(!guard()||!canDM()){notify('Only the DM can approve campaign additions.','error');return;}
    const draft=entries('intake').find(d=>d.id===id);if(!draft)return;
    if(renderedDrafts.get(id)!==fingerprint(draft)){notify('The source draft changed since this review was displayed. Review the latest version before approving it.','error');return;}
    const selected=new Set([...root.querySelectorAll('[data-approve-proposal]')].filter(el=>el.dataset.draft===id&&el.checked).map(el=>el.dataset.approveProposal));
    const already=approvedProposalIds(draft);
    const proposals=list(draft.proposals).filter(p=>selected.has(p.id)&&!already.has(p.id));
    if(!proposals.length){notify('Select at least one reviewed proposal to approve.','error');return;}
    try{validateNewEntities(proposals);}catch(error){notify(error.message,'error');return;}
    if(currentApproval(draft)){notify('This exact version has already been approved.');return;}
    const reviewInput=[...root.querySelectorAll('[data-dm-review]')].find(el=>el.dataset.dmReview===id);
    if(!window.confirm('Publish '+proposals.length+' reviewed addition'+(proposals.length===1?'':'s')+' and their supporting excerpts to the public compendium? Check that selected proposals and excerpts contain no private notes. The complete source and uploaded recording stay in the party workspace.'))return;
    const approval={id:uid(),draftId:id,approvedAt:now(),snapshot:intakeSnapshot(draft),proposals:structuredClone(proposals),reviewerNote:clean(reviewInput?.value,1000)};
    try {setBusy(true);await saveEntries('canon',[...entries('canon'),approval]);message='Approved additions published. The complete source snapshot remains in the party workspace.';messageType='success';repaint();}catch(error){notify(error.message||'Approval failed. No approval should be assumed until it appears in the published record.','error');}finally{setBusy(false);}
  }
  async function importSource(input) {
    const file=input.files?.[0];if(!file||!canEdit())return;
    try {
      if(file.size>800000)throw new Error('Choose a text or JSON file smaller than 800 KB.');
      if(!/\.(txt|md|json)$/i.test(file.name))throw new Error('Use a .txt, .md, or .json file. Paste text extracted from PDFs into the source field.');
      const value=await file.text();if(!root?.isConnected||current!=='intake'||!editor)return;let incoming=null,source=value;
      if(/\.json$/i.test(file.name)) {
        const parsed=JSON.parse(value);incoming=Array.isArray(parsed?.entries)?parsed.entries[0]:parsed?.entry||parsed;
        if(typeof incoming==='string')source=incoming;
        else if(incoming&&typeof incoming==='object')source=incoming.sourceText||incoming.transcript||incoming.text||'';
        if(typeof source!=='string'||!source.trim())throw new Error('JSON must contain sourceText, transcript, or text. A workspace export imports the first draft; import drafts individually to avoid ambiguity.');
      }
      if(source.length>80000)throw new Error('This source exceeds 80,000 characters. Split it into separate session drafts; nothing was truncated.');
      editor=captureForm(false);
      if(editor.sourceText.trim()&&!window.confirm('Replace the current source text with this file? Existing proposals will be cleared so they cannot cite the wrong source.'))return;
      editor.sourceText=source;editor.proposals=[];if(!editor.title)editor.title=clean(incoming?.title||file.name.replace(/\.[^.]+$/,''),160);
      if(incoming?.session&&sessions.some(s=>s.num===incoming.session))editor.session=incoming.session;
      if(['written','ghost','table-notes'].includes(incoming?.kind))editor.kind=incoming.kind;
      dirty=true;message='Imported into the unsaved draft. Read the source, then find or add proposals.';messageType='';repaint();
    }catch(error){notify(error.message||'This file could not be read.','error');}finally{input.value='';}
  }
  function audioReference(input) {
    const file=input.files?.[0];if(!file||!canEdit())return;
    if(!/\.(mp3|wav|m4a|ogg)$/i.test(file.name)){notify('Choose an MP3, WAV, OGG, or M4A audio file.','error');return;}
    if(file.size>50*1024*1024){notify('Choose an audio file up to 50 MiB.','error');return;}
    editor=captureForm(false);releaseAudio();localAudio={url:URL.createObjectURL(file),file};editor.audio={name:file.name,size:file.size,type:file.type};dirty=true;repaint();
  }
  async function playSource(button,id) {
    if(!canEdit()){notify('Party sign-in is required to play source recordings.','error');return;}
    if(typeof S()?.fileURL!=='function'){notify('Shared audio playback is not connected yet.','error');return;}
    const host=root;button.disabled=true;
    try {
      notify('Opening source audio…');
      const url=await S().fileURL(id);
      if(root!==host||!host?.isConnected)return;
      const address=new URL(typeof url==='string'?url:url?.url,location.href);
      if(!['https:','http:'].includes(address.protocol))throw new Error('The source recording URL is not valid.');
      host.querySelectorAll('audio').forEach(audio=>audio.pause());
      let player=host.querySelector('#cwSharedAudio');
      if(!player){player=document.createElement('audio');player.id='cwSharedAudio';player.controls=true;player.preload='metadata';player.className='cw-shared-audio';}
      button.insertAdjacentElement('afterend',player);player.src=address.href;
      player.onerror=()=>notify('The source recording could not be played. Reopen it to refresh its access link.','error');
      try{await player.play();notify('Source recording ready.');}catch{notify('Source recording ready. Press play to listen.');}
    }catch(error){notify(error.message||'Could not open this source recording.','error');}finally{button.disabled=false;}
  }
  async function click(event) {
    const button=event.target.closest('[data-cw]');if(!button||!root.contains(button))return;
    const action=button.dataset.cw,id=button.dataset.id,key=button.dataset.key;
    if(action==='signin'){await S()?.signIn?.();return;}
    if(action==='play'){ctx.play?.(id);return;}
    if(action==='shared-audio'){await playSource(button,id);return;}
    if(action==='export'){download({version:1,workspace:routeKeys[current],exportedAt:now(),entries:entries(routeKeys[current])},'shattering-'+routeKeys[current]+'-'+new Date().toISOString().slice(0,10)+'.json');return;}
    if(action==='export-form'){try{download({version:1,workspace:routeKeys[current],entry:captureForm(false)},'shattering-unsaved-draft.json');}catch(error){notify(error.message,'error');}return;}
    if(action==='reload') {
      if(dirty&&!window.confirm('Discard the unsaved form and view the latest shared records? Download the draft first if you need it.'))return;
      try{await S()?.refresh?.();editor=null;dirty=false;remotePending=false;message='Latest shared records loaded.';messageType='';repaint();}catch(error){notify(error.message,'error');}return;
    }
    if(!guard())return;
    if(action==='new'||action==='edit') {
      if(dirty&&!window.confirm('Discard your unsaved form and open another record?'))return;
      releaseAudio();editor=action==='edit'?structuredClone(entries(key).find(e=>e.id===id)||{}):{};if(editor.id)editor._baseJSON=JSON.stringify(editor);dirty=false;message='';repaint();root.querySelector('#cwForm input')?.focus();root.querySelector('.cw-editor')?.scrollIntoView({block:'start',behavior:'instant'});return;
    }
    if(action==='cancel'){if(dirty&&!window.confirm('Discard this unsaved draft?'))return;editor=null;dirty=false;releaseAudio();repaint();return;}
    if(action==='delete'){await removeEntry(key,id);return;}
    if(action==='undo'&&undo) {
      try{setBusy(true);const restore=undo,currentEntries=entries(restore.key);if(currentEntries.some(e=>e.id===restore.entry.id))throw new Error('This record already exists. Refresh before restoring another copy.');await saveEntries(restore.key,[...currentEntries,restore.entry]);undo=null;message='Removal undone.';messageType='success';repaint();}catch(error){notify(error.message,'error');}finally{setBusy(false);}return;
    }
    if(action==='approve'){await approve(id);return;}
    if(['extract','add-proposal','remove-proposal'].includes(action)) {
      try {
        editor=captureForm(false);
        if(action==='extract') {
          if(!editor.sourceText.trim())throw new Error('Add source text before looking for passages.');
          if(editor.proposals.length&&!window.confirm('Replace the existing proposals with a fresh set of source excerpts?'))return;
          editor.proposals=extractCandidates(editor.sourceText);message=editor.proposals.length+' possible passages found. These are excerpts to review, not verified facts.';
        }else if(action==='add-proposal') {if(editor.proposals.length>=30)throw new Error('A draft holds up to 30 proposals.');editor.proposals.push({id:uid(),title:'',text:'',target:'',type:'update',sourceExcerpt:''});}
        else editor.proposals=editor.proposals.filter(p=>p.id!==id);
        dirty=true;messageType='';repaint();
      }catch(error){notify(error.message,'error');}
    }
  }
  function change(event) {
    const target=event.target;
    if(['type','imageSrc'].includes(target.dataset.proposalField)){editor=captureForm(false);dirty=true;repaint();return;}
    if(target.name==='cwFilter'){if(editor)editor=captureForm(false);filter=target.value;repaint();return;}
    if(target.name==='sourceFile'){importSource(target);return;}
    if(target.name==='audioFile'){audioReference(target);return;}
    if(target.closest('#cwForm'))dirty=true;
  }
  function input(event) {
    if(event.target.name==='cwSearch') {
      query=event.target.value;const start=event.target.selectionStart;if(editor)editor=captureForm(false);repaint();const search=root.querySelector('[name="cwSearch"]');search?.focus();try{search?.setSelectionRange(start,start);}catch{}return;
    }
    if(event.target.closest('#cwForm'))dirty=true;
  }
  function destroy() {
    if(dirty&&editor&&canEdit()&&root?.querySelector('#cwForm')){try{editor=captureForm(false);}catch{}}
    root?.querySelectorAll('audio').forEach(audio=>audio.pause());controller?.abort();controller=null;unsubscribe?.();unsubscribe=null;
    if(!dirty||!canEdit())releaseAudio();root=null;
  }
  function mount(route,nextSub) {
    destroy();current=route;sub=nextSub||'';root=document.getElementById('campaignWorkspace');if(!root)return;
    controller=new AbortController();const signal=controller.signal;
    root.addEventListener('click',click,{signal});root.addEventListener('submit',submit,{signal});root.addEventListener('change',change,{signal});root.addEventListener('input',input,{signal});
    document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!dirty||!link||link.target==='_blank'||link.hasAttribute('download')||link.getAttribute('href')===location.hash)return;if(!window.confirm('Leave this unsaved draft? Download it or save before leaving if you need to keep it.')){event.preventDefault();event.stopImmediatePropagation();}else dirty=false;},{capture:true,signal});
    window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}},{signal});
    unsubscribe=S()?.subscribe?.(()=>{if(!root||busy)return;if(dirty&&canEdit()){remotePending=true;notify(message,messageType);}else{if(!canEdit()){editor=null;dirty=false;releaseAudio();}repaint();}});
    Promise.resolve(S()?.ready).then(()=>{if(root&&!dirty&&!busy)repaint();}).catch(error=>{if(root)notify(error.message||'Shared workspace could not be loaded.','error');});
  }
  return {
    handles:route=>routes.includes(route),
    render(route,nextSub) {if(current!==route||sub!==(nextSub||'')){editor=null;dirty=false;filter='all';query='';message='';messageType='';undo=null;releaseAudio();}if(!canEdit()){editor=null;dirty=false;releaseAudio();}current=route;sub=nextSub||'';return `<div id="campaignWorkspace" class="page reveal campaign-workspace">${inner()}</div>`;},
    mount,destroy
  };
};
