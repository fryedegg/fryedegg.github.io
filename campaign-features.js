/* New views use the existing campaign records; source wording stays in the journal. */
window.applyCodexUpgrades = function (data, media) {
  const upgrades = window.CAMPAIGN_UPGRADES || { images: {}, art: [] };
  const entities = [...data.LOCATIONS, data.VOID, ...data.PLACE_ENTRIES];
  for (const entry of entities) entry.image ||= upgrades.images['world:' + entry.id];
  const people = [...data.CREW, ...data.POI, ...data.POI_DM, ...data.LOCATIONS.flatMap(l => l.contacts || [])];
  for (const entry of people) entry.image ||= media.matches[entry.name] || upgrades.images['person:' + entry.name];
  for (const entry of data.FACTIONS) entry.image ||= upgrades.images['faction:' + entry.name];
  const cro = data.CREW.find(p => p.name === 'Cro');
  if (cro) { cro.altImage = upgrades.images['person:Cro original']; cro.altLabel = 'Original elf form · Campaign 1'; }
  data.POI.push({ name: 'Grim', crew: 'c1', stance: 'allied', kind: 'Original Codex Crew', role: 'Campaign 1 crew archive', desc: 'Grim appears in the original Codex Crew party portrait. His new portrait follows the supplied individual sketch and the original group’s colors.', image: upgrades.images['person:Grim'] });
  data.POI.push({ name: 'C.U.M. Bot', crew: 'c2', stance: 'allied', kind: 'Mechanical companion', role: '5p0r3’s companion bot', desc: '5p0r3’s spherical, many-legged mechanical companion. In Session 7, Ghost and C.U.M. Bot kept watch while the crew rested in Flint’s crystal shelter. With its personality turned up, the bot called everyone “brother” and grew elbow tassels.', image: upgrades.images['person:C.U.M. Bot'] });
  data.POI.push({ name: 'GHOST-17X', crew: 'c2', stance: 'allied', kind: 'Companion / Open frequency', role: 'Aelyn Vox’s familiar voice', desc: 'Aelyn’s companion and the voice behind the campaign’s recaps, rants, and stray transmissions. Ellie persists within Ghost and speaks through him.', image: media.art.find(a => a.id === '004' && !a.video)?.src });
  media.art.push(...(upgrades.art || []));
  return upgrades;
};

window.createCodexFeatures = function (ctx) {
  const { D, M, U, esc, plain, path, image, pageHead, section, tag, personCard, worldCard, recordingCard, sessionCard } = ctx;
  const allWorlds = [...D.LOCATIONS, D.VOID, ...D.PLACE_ENTRIES];
  const allPeople = [...D.CREW, ...D.POI, ...D.LOCATIONS.flatMap(l => (l.contacts || []).map(c => ({...c, location: c.location || {id: l.id, label: l.name}})))];
  const art = n => M.art.find(a => a.id === String(n).padStart(3, '0') && !a.video && !a.source.includes('_alts'))?.src;

  function originalCrew() {
    const names = ['Grim', 'Keira', 'Lor', 'Ellie', 'Cro'];
    const people = names.map(name => allPeople.find(p => p.name === name)).filter(Boolean).map(p => p.name === 'Cro' && p.altImage ? {...p, image: p.altImage} : p);
    return `${section('The original Codex Crew', '#journal/c1', 'Read their history ↗')}<figure class="archive-party"><button data-art="media/upgrades/original-codex-crew.webp" data-caption="Original Oratoria · The Codex Crew" aria-label="Enlarge the original Codex Crew party portrait">${image('media/upgrades/original-codex-crew.webp', 'Original Codex Crew aboard their ship')}</button><figcaption>ORIGINAL ORATORIA · CAMPAIGN 1</figcaption></figure><div class="entity-grid original-crew">${people.map(personCard).join('')}</div>`;
  }

  function blueHarvest() {
    const cover = 'media/art/blue-harvest.webp';
    return `<div class="page reveal book-page"><div class="breadcrumb"><a href="#lore">The codex</a><span>/</span><span>Blue Harvest</span></div><section class="book-shrine"><div class="book-display"><button data-art="${cover}" data-caption="Blue Harvest · Sorrow Yalt · Campaign owner’s featured cover" aria-label="View the full Blue Harvest cover">${image(cover, 'Blue Harvest by Sorrow Yalt, the featured campaign cover', '', true)}</button><span class="book-pedestal"></span></div><div class="book-intro"><p class="eyebrow">The galaxy’s least discreet literary phenomenon</p><h1>Blue<br><em>Harvest.</em></h1><p class="book-author">BY SORROW YALT</p><div class="tag-group">${tag('Science-fiction romance', 'gold')}${tag('Galaxy-famous')}${tag('Very questionable likeness')}</div><p class="book-deck">A sandwich-fed prisoner. A secret publishing career. One very recognizable blue inspiration. Somehow, the crew’s personal business became the galaxy’s favorite reading material.</p><blockquote>“A magical blue hog is a heavy burden.”</blockquote><div class="button-row"><a class="button" href="${path('person', 'Yarrow Salt')}">Meet the author ↗</a><a class="button secondary" href="${path('person', 'Killua')}">Meet the inspiration ↗</a></div></div></section><div class="book-record-grid"><article class="panel"><p class="eyebrow">The author behind the alias</p><h2>Sorrow Yalt is Yarrow Salt.</h2><div class="prose"><p>The crew’s prisoner on Velthros became a romance novelist while living on sandwich rations. Under the pen name <strong>Sorrow Yalt</strong>, he wrote and sold the <em>Blue Harvest</em> novels. The series became galaxy-famous before the crew understood what he had been doing.</p><p>When 5p0r3 discovered the side career in Session 6, the response was swift: back to the ship, confiscate the writing device, and halve Yarrow’s sandwich rations. The publicity, however, had already escaped containment.</p></div><a class="side-link" href="#session/S6">The discovery in “A Blue Harvest” ↗</a></article><article class="panel"><p class="eyebrow">The man on the cover</p><h2>Killua did not commission this.</h2><div class="prose"><p>Killua is the living inspiration recognized by readers. At the Spit N’ Swallow, giggling fans asked him to sign their copies. The session record specifically calls out a cover that misrepresents his physique.</p><p>The featured cover is the campaign owner’s chosen edition: luminous lettering, a star-filled sky, the unmistakable blue hero, and four arms around one very complicated situation. It is displayed here in full, with every detail intact.</p></div><a class="side-link" href="#person/Killua">Killua’s actual campaign dossier ↗</a></article></div>${section('How a paperback became a plotline')}<ol class="literary-timeline"><li><span>S6</span><div><h3>Fame arrives before the explanation.</h3><p>Amarante loves the novels. Killua signs copies. 5p0r3 feeds the bar early plot details for free drinks, then learns that Yarrow has been writing and selling the series.</p><a href="#session/S6">Read the session ↗</a></div></li><li><span>S8</span><div><h3>The Sorrow Yalt meet-and-greet.</h3><p>Drindle and Amarante come aboard to meet the acclaimed author. The crew stages an apocalypse outside the ship as an emergency-evacuation pretext. The fans believe H.O.C.2.A saved their lives.</p><a href="#session/S8">Read the session ↗</a></div></li><li><span>S11</span><div><h3>Even the gods know the book.</h3><p>Zelqua recognizes Killua on her show. The party spills its secrets and receives a boon, with a debt attached: return to the show and deliver the acclaimed author Sorrow Yalt. Killua’s sponsor box bears “Y.S. ;)”.</p><a href="#session/S11">Read “A Day With Doc” ↗</a></div></li></ol>${section('The readership')}<div class="entity-grid">${['Yarrow Salt', 'Killua', 'Amarante', 'Drindle', 'Zelqua'].map(n => allPeople.find(p => p.name === n)).filter(Boolean).map(personCard).join('')}</div>${section('The collected editions')}<div class="book-editions">${[[cover, 'The featured edition'], [art(61), 'An earlier cover'], [art(83), 'Blue Harvest · Book Two']].filter(([src]) => src).map(([src, title]) => `<figure><button data-art="${src}" data-caption="${esc(title)}" aria-label="Enlarge ${esc(title)}">${image(src, title)}</button><figcaption>${esc(title)}</figcaption></figure>`).join('')}</div><div class="notice">The publishing career, fans, and meet-and-greet are recorded campaign events. The cover’s promises belong to Sorrow Yalt. The field journal records what actually happened.</div><div class="button-row" style="margin-top:24px"><a class="button secondary" href="#relationships/book%3ABlue%20Harvest">Follow the literary connections ↗</a><a class="button secondary" href="#threads">Zelqua’s outstanding debt ↗</a></div></div>`;
  }

  function previously(sub) {
    const current = D.SESSIONS.find(s => s.num === sub) || D.SESSIONS.at(-1);
    const number = Number(current.num.slice(1));
    const recordings = M.recordings.filter(r => r.session === number);
    const recap = M.recaps.find(r => r.session === number);
    const place = allWorlds.find(w => w.id === current.where?.id) || (['S11', 'S12'].includes(current.num) ? allWorlds.find(w => w.id === 'celestial-tunnel') : null);
    const text = plain(current.summary + ' ' + current.moments.join(' ')).toLowerCase();
    const mentioned = name => new RegExp('(^|[^a-z0-9])' + name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(text);
    const people = [...new Map(allPeople.filter(p => mentioned(p.name)).map(p => [p.name, p])).values()].slice(0, 6);
    const hooks = D.HOOKS.filter(h => ['c2', 'both'].includes(h.crew) && h.status !== 'resolved').sort((a, b) => Number(['high', 'urgent'].includes(b.urgency)) - Number(['high', 'urgent'].includes(a.urgency))).slice(0, 6);
    return `<div class="page reveal previously-page">${pageHead('Catch up before the next session', 'Previously on…', 'The written record, Ghost’s version, and the business still following us.')}<div class="tabs" aria-label="Choose a session">${[...D.SESSIONS].reverse().map(s => `<a class="tab${s.num === current.num ? ' active' : ''}" href="${path('previously', s.num)}" ${s.num === current.num ? 'aria-current="page"' : ''}>${s.num}</a>`).join('')}</div><section class="catchup-hero">${place?.image ? image(place.image, place.name, '', true) : ''}<div><p class="eyebrow">${esc(current.num)} · ${esc(recordings[0]?.date || 'Flight journal')}</p><h2>${esc(current.title)}</h2><p>${esc(current.where?.label || place?.name || 'Between destinations')}</p><div class="button-row"><a class="button" href="${path('session', current.num)}">Full session record ↗</a>${recordings[0] ? `<button class="button secondary" data-play="${recordings[0].id}">▶ Hear Ghost’s version</button>` : ''}</div></div></section><div class="catchup-grid"><article class="panel"><p class="eyebrow">What happened</p><div class="prose">${current.summary}</div><details class="disclosure"><summary>The moments that mattered</summary><ol class="session-moments">${current.moments.map(t => `<li>${t}</li>`).join('')}</ol></details>${recap ? `<a class="side-link" href="${recap.pdf}" target="_blank" rel="noopener">Original written recap PDF ↗</a>` : ''}</article><aside class="panel"><p class="eyebrow">Open frequency</p><h3>Ghost’s account</h3>${recordings.length ? recordings.map(r => recordingCard(r, true)).join('') : '<p class="muted">No recording has been archived for this session yet.</p>'}<a class="side-link" href="#ghost">Every recap, rant, and stray line ↗</a></aside></div>${place ? section('Where this chapter took us') + `<div class="catchup-place">${worldCard(place)}<div class="panel"><p class="eyebrow">Navigate from the field record</p><h3>${esc(place.name)}</h3><div class="prose">${place.desc}</div><div class="button-row" style="margin-top:20px"><a class="button secondary" href="${path('world', place.id)}">Open dossier ↗</a><a class="button secondary" href="${place.id === 'celestial-tunnel' ? '#map' : path('map', place.id)}">Star map ↗</a></div></div></div>` : ''}${people.length ? section('Faces in the record') + `<div class="entity-grid">${people.map(personCard).join('')}</div>` : ''}${section('Still unresolved', '#threads', 'Every open thread ↗')}<div class="thread-grid">${hooks.map(h => `<article class="thread-card"><div class="tag-group">${tag(h.kind || 'Lead')}${['high', 'urgent'].includes(h.urgency) ? tag('High priority', 'red') : ''}</div><h3>${esc(h.title)}</h3><div class="prose">${h.desc}</div><a class="side-link" href="${path('threads', h.title)}">Follow this thread ↗</a></article>`).join('')}</div><p class="source-note">Open threads reflect the current campaign record; choosing an older session does not rewind their status.</p></div>`;
  }

  const nodes = new Map(), edges = [];
  const addNode = (id, title, type, url, src) => { if (!nodes.has(id)) nodes.set(id, { id, title, type, url, image: src }); return id; };
  for (const p of allPeople) addNode('person:' + p.name, p.name, p.crew === 'c1' ? 'Campaign 1' : 'Person', path('person', p.name), p.image);
  for (const f of D.FACTIONS) addNode('faction:' + f.name, f.name, 'Faction', '#lore/factions/' + encodeURIComponent(f.name), f.image);
  for (const w of allWorlds) addNode('world:' + w.id, w.name, w.parent ? 'Landmark' : 'Place', path('world', w.id), w.image);
  addNode('book:Blue Harvest', 'Blue Harvest', 'Book', '#lore/blue-harvest', 'media/art/blue-harvest.webp');
  addNode('crew:H.O.C.2.A', 'H.O.C.2.A', 'Crew', '#crew', 'images/portraits/hoc-2a-party.png');
  addNode('crew:Codex Crew', 'The Codex Crew', 'Campaign 1', '#journal/c1', 'media/upgrades/original-codex-crew.webp');
  const edge = (a, b, label, source, uncertain = false) => { if (nodes.has(a) && nodes.has(b) && !edges.some(e => e.a === a && e.b === b && e.label === label)) edges.push({ a, b, label, source, uncertain }); };
  const p = name => 'person:' + name, f = name => 'faction:' + name;
  for (const person of allPeople) {
    if (person.location?.id) edge(p(person.name), 'world:' + person.location.id, 'Recorded at', 'Location in the contact record');
  }
  for (const faction of D.FACTIONS) for (const member of faction.members) {
    const name = member.replace(/\([^)]*\)/g, '').trim();
    const alias = name === 'The First Hollow' ? 'The Hollowed One / First Hollow' : name;
    edge(p(alias), f(faction.name), /possibly/i.test(member) ? 'Possible affiliation' : 'Affiliation', 'Faction record: ' + faction.name, /possibly/i.test(member));
  }
  for (const person of D.CREW.filter(c => c.status === 'active')) edge('crew:H.O.C.2.A', p(person.name), 'Crew', 'Current crew record');
  for (const name of ['Grim', 'Keira', 'Lor', 'Ellie', 'Cro']) edge('crew:Codex Crew', p(name), 'Original crew archive', 'Original crew portrait and campaign archive');
  const facts = [
    [p('Lor'), p('Ellie'), 'Married', 'Session 0 / crew record'],
    [p('Lor'), p('Cae'), 'Shard connection in the record', 'Cae’s existing contact record'],
    [p('Cro'), p('Ellie'), 'Killed during the Shattering', 'Crew record / Session 0'],
    [p('Aelyn Vox'), p('GHOST-17X'), 'Companions', 'Crew record'],
    [p('GHOST-17X'), p('L.E. (Ellie)'), 'Ellie speaks through Ghost', 'Ellie’s contact record'],
    [p('5p0r3'), p('C.U.M. Bot'), 'Companion bot', 'Campaign owner’s notes / Session 7'],
    [p('Flint D. McCoy'), p('Saturiba'), 'Raised and taught Flint', 'Session 14'],
    [p('Rook'), f('The Black Sky Imperium (TBS)'), 'Defected from Black Sky', 'Session 15'],
    [p('Yarrow Salt'), 'book:Blue Harvest', 'Writes as Sorrow Yalt', 'Session 6'],
    [p('Killua'), 'book:Blue Harvest', 'Living inspiration', 'Sessions 6 and 11'],
    [p('Amarante'), 'book:Blue Harvest', 'Enthusiastic reader', 'Sessions 6 and 8'],
    [p('Drindle'), p('Yarrow Salt'), 'Met the author aboard ship', 'Session 8'],
    [p('Zelqua'), p('Yarrow Salt'), 'Owed a guest appearance', 'Session 11 / open thread'],
    [p('Spry'), f('The Pike Family'), 'Held captive by', 'Campaign 1 contact record'],
    [f('The Pike Family'), f('The Red Hand'), 'Rivals', 'Leztos faction records'],
    [p('Red Solomon'), p('Keira'), 'Siblings; different alliances', 'Akora contact records'],
    [f('The Court of Light'), f('Children of the Black Sky'), 'Sworn enemies', 'Faction records'],
    [f('Corno Spezzato'), 'crew:H.O.C.2.A', 'Protection demand / boarding attacks', 'Sessions 8–13'],
    [p('Karnyx'), 'world:achelion', 'Rules the drowned cult-state', 'Karnyx’s contact record'],
    [p('The Producers (Celestial Tunnel)'), 'world:celestial-tunnel', 'Produced A Day With Doc', 'Sessions 11 and 12'],
    [p('Zelqua'), 'world:celestial-tunnel', 'Lesser god / broadcaster', 'Session 11'],
    [p('Vantros'), 'world:celestial-tunnel', 'Granted a boon', 'Session 11'],
    [p('Drundar'), 'world:celestial-tunnel', 'Granted a boon', 'Session 11'],
    [p('Yarrow Salt'), p('5p0r3'), 'Publishing device confiscated', 'Session 6']
  ];
  facts.forEach(e => edge(...e));
  const linkedNodes = [...nodes.values()].filter(n => edges.some(e => e.a === n.id || e.b === n.id)).sort((a, b) => a.title.localeCompare(b.title));
  function relationships(sub) {
    const focus = nodes.get(sub) || nodes.get('crew:H.O.C.2.A');
    const linked = edges.filter(e => e.a === focus.id || e.b === focus.id).map(e => ({ edge: e, node: nodes.get(e.a === focus.id ? e.b : e.a) }));
    const visible = linked.slice(0, 12), center = { x: 450, y: 285 }, positions = visible.map((v, i) => ({ ...v, x: center.x + 320 * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / visible.length), y: center.y + 213 * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / visible.length) }));
    const svgNode = (node, x, y, main = false, i = 0) => `<a href="${path('relationships', node.id)}" aria-label="Explore connections for ${esc(node.title)}"><circle cx="${x}" cy="${y}" r="${main ? 42 : 26}" fill="#162738" stroke="${main ? '#d1b47f' : '#6e98ac'}"/><image href="${esc(node.image || '')}" x="${x - (main ? 39 : 23)}" y="${y - (main ? 39 : 23)}" width="${main ? 78 : 46}" height="${main ? 78 : 46}" preserveAspectRatio="xMidYMin slice" clip-path="url(#connection-${i})"/><text x="${x}" y="${y + (main ? 62 : 45)}" text-anchor="middle">${esc(node.title.length > 22 ? node.title.slice(0, 19) + '…' : node.title)}</text><text class="connection-type" x="${x}" y="${y + (main ? 78 : 58)}" text-anchor="middle">${esc(node.type)}</text></a>`;
    return `<div class="page reveal relationships-page">${pageHead('Nobody exists in isolation', 'Connections', 'Explore the recorded ties between people, factions, places, and one very influential paperback.')}<div class="toolbar connection-toolbar"><label for="connectionFocus">Focus the map</label><select id="connectionFocus" aria-label="Focus the relationship map">${linkedNodes.map(n => `<option value="${esc(n.id)}" ${n.id === focus.id ? 'selected' : ''}>${esc(n.title)} · ${esc(n.type)}</option>`).join('')}</select><span class="results-count">${linked.length} RECORDED CONNECTIONS</span></div><div class="relationship-layout"><section class="relationship-stage" aria-label="Relationship graph centered on ${esc(focus.title)}"><svg viewBox="0 0 900 590" role="group" aria-label="Connections to ${esc(focus.title)}; select a connected node to explore further"><defs>${[{ x: center.x, y: center.y, r: 39 }, ...positions.map(n => ({ x: n.x, y: n.y, r: 23 }))].map((n, i) => `<clipPath id="connection-${i}"><circle cx="${n.x}" cy="${n.y}" r="${n.r}"/></clipPath>`).join('')}</defs>${positions.map(({ x, y, edge: e }) => `<path d="M${center.x} ${center.y} Q${(x + center.x) / 2 + 18} ${(y + center.y) / 2 - 18} ${x} ${y}" class="connection-edge ${e.uncertain ? 'uncertain' : ''}"><title>${esc(e.label)} · ${esc(e.source)}</title></path>`).join('')}${svgNode(focus, center.x, center.y, true, 0)}${positions.map(({ node, x, y }, i) => svgNode(node, x, y, false, i + 1)).join('')}</svg><p class="source-note">Select a face to follow its connections. Dashed lines indicate an explicitly uncertain affiliation.</p></section><aside class="panel relationship-record"><p class="eyebrow">In focus · ${esc(focus.type)}</p>${image(focus.image, focus.title)}<h2>${esc(focus.title)}</h2><a class="button secondary" href="${focus.url}">Open the record ↗</a><div class="relationship-list">${linked.map(({ node, edge: e }) => `<a href="${path('relationships', node.id)}"><strong>${esc(node.title)}</strong><span>${esc(e.label)}</span><small>${esc(e.source)}${e.uncertain ? ' · uncertain' : ''}</small></a>`).join('')}</div></aside></div></div>`;
  }
  return { originalCrew, blueHarvest, previously, relationships, searchable: [{ title: 'Blue Harvest', type: 'Book', context: 'Sorrow Yalt · Yarrow Salt · Killua', text: 'The featured edition, publishing history, fandom, and Zelqua’s debt.', url: '#lore/blue-harvest', image: 'media/art/blue-harvest.webp' }, { title: 'Previously on…', type: 'Catch up', context: 'Latest session · Written recap · Ghost audio · Open threads', url: '#previously' }, { title: 'Connections', type: 'Relationship map', context: 'People · factions · places', url: '#relationships' }] };
};
