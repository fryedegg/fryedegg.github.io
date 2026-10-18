# The Shattering campaign compendium

Live site: [fryedegg.github.io](https://fryedegg.github.io/)

The public interface is a static GitHub Pages site with no frontend build step. A separate authenticated service stores shared campaign changes, private DM preparation, and uploaded source recordings. The original campaign archive and media remain in this repository; live edits are versioned service documents, not commits to GitHub.

## Access and privacy

| Access | Read and explore | Save and manage |
| --- | --- | --- |
| Public visitor | Public dossiers, sessions, art, Ghost audio, map, boards, journals, ledgers, approved additions, and revealed scenes | No shared writes. Board pan/zoom and temporary card movement do not persist. |
| Party member | Public content plus shared review drafts and their source recordings | Shared investigations, notes, pins, favorites, discoveries, consequences, character journals, ship ledger, and session drafts |
| Dungeon Master | All of the above plus private vault records, scene preparation, and unrevealed clocks | Party capabilities plus canon approval, evidence confirmation, private records, scene/handout reveals, and party-session revocation |

The party uses a shared password. Display names credit updates; they are not separate accounts or identity verification. All party members have the same editing permissions. Character journals are shared/public campaign records, not private individual journals. Keep secrets in the DM workspace.

Passwords are checked by the service against salted PBKDF2 hashes. Neither password is embedded in public JavaScript. Bearer sessions are kept in the browser tab's `sessionStorage` and expire on the server after seven days. Signing out clears private cached data; the DM can also revoke current party sessions. Revocation does not change the shared password, so party members can sign in again.

The separate DM credential is saved locally outside this public repository at `../output/campaign-upgrade/private/DM-access.txt` (relative to this checkout). Do not commit that file, the private migration backup, `.dev.vars`, or runtime secrets.

Thirty-seven existing private records were migrated from static data to the DM service document. Current private records require server-authorized DM access. **Previously published DM material can still exist in older Git history, downloaded copies, or caches. This upgrade does not make past publication secret.**

## Architecture and files

- `index.html`: accessible shell, navigation, search, and persistent audio player.
- `campaign-data.js`: original public campaign records. Private fields have moved to the service.
- `codex.js`: routing, bridge, dossiers, journal, directory, lore, search, and runtime integration of approved additions/private records according to access.
- `campaign-shopping.js`, `shop-views.js`, `shopping.css`: recorded merchant stock, item rules, filters, prices, and shopping-source provenance.
- `campaign-sync.js`: service connection, sign-in, versioned document cache, save conflict handling, and authenticated source-audio upload/playback.
- `campaign-workspace.js` / `.css`: consequences, character journals, ship ledger, session intake, and reviewed canon additions.
- `session-director.js` / `.css`: private scene preparation, cue decks, public player screen, and explicit reveals.
- `campaign-vault.js`: migrated DM records, private editing, backups, and reviewed public excerpts.
- `private-clocks.js` / `.css`: DM-only developing threats and explicit publication of selected developments.
- `campaign-access.css`: access controls and private-workspace presentation.
- `cinematic-upgrade.css`: illustrated dossier framing and visual refinements.
- `onboard-systems.js` / `.css`: Ghost archive, shared investigations/table, journey, discoveries, and dossier themes.
- `galaxy.js` / `galaxy-webgl.js`: cinematic camera, galaxy, timeline, planet meshes, atmospheres, rings, and chart fallback. `vendor/` contains local Three.js modules and its MIT license.
- `campaign-features.js`: Previously on, sourced relationship graph, Blue Harvest, and original crew archive.
- `campaign-upgrades.js`, `legacy-art.js`, `campaign-media.js`: artwork assignments, all 63 original illustrations, media catalog, and original recap metadata.
- `ghost-library.js`, `ghost-waveforms.js`: soundboard transcripts, verified recording metadata, passage timing, and waveforms.
- `codex.css` / `upgrades.css`: responsive layout, motion preferences, and existing archive presentation.
- `media/`, `images/`, `ghost-17x/`: preserved campaign media and original standalone soundboard.
- `art-audit.json` / `art-upgrade-audit.json`: artwork inventory, source references, and explicit matches.

The service source lives in the sibling `../campaign-service/` directory, outside this public Git repository. It uses a Cloudflare Workers-compatible API, D1 document/session/revision storage, and R2 audio storage. Its deployment is separate from GitHub Pages. The client service address is configured in `campaign-sync.js`; local preview connects to `http://127.0.0.1:5173`.

The server enforces document permissions on every request. Public-read documents include `onboard`, `consequences`, `characters`, `ledger`, `canon`, `stage`, `board-confirmations`, and `reveals`. `intake` is readable/writable by the signed-in party; `dm:*` documents are DM-only. Canon approvals, confirmations, stage changes, and reveals require DM writes. Public canon responses omit full source snapshots, review notes, and unapproved proposals. Only explicitly approved proposal text and supporting excerpts are published.

Saves include the version the editor loaded. A stale version receives HTTP 409 instead of overwriting somebody else's changes. The service retains up to twelve preceding document revisions, available to DM access. Review drafts and error messages remain visible when a save fails; export/copy a draft before reloading if it must be kept. Changes are not stored as an automatic offline queue.

For a local static preview, run `python -m http.server 8765` inside this checkout and open `http://127.0.0.1:8765`. The public archive renders without the service; sign-in and shared saves require the separately configured local backend on port 5173, with its D1/R2 bindings, migrations, and private environment variables. Use the sibling service project's package scripts to run and build that service.

## Current views

| Route | Capabilities |
| --- | --- |
| `#bridge` | Campaign overview and navigation to working surfaces |
| `#previously` / `#previously/S11` | Written recap, Ghost account, and current unresolved threads |
| `#relationships` | Named investigations, record cards, question notes, theories, sourced strings, and DM confirmations |
| `#map` | Cinematic/chart galaxy, pan/orbit/zoom, destination dossiers, celestial plane, and session timeline |
| `#journey` | Logged stops in order, manual steps, timed camera tour, and optional Ghost commentary |
| `#table` | Current scene, twelve pinned records, scratch notes, and shared favorite clips |
| `#director` | DM scene sequence, private reminders, faces, artwork, handouts, nine-cue Ghost decks, and explicit reveal controls |
| `#stage` | Public cinematic player display showing the latest revealed snapshot |
| `#consequences` | Sourced promises, debts, favors, faction relationships, threats, and open questions with change history |
| `#crew-log` | Shared character goals, bonds, contacts, and journal entries |
| `#ship-log` | B.B.C. cargo, income/expenses, repairs, upgrades, and jobs |
| `#intake` | Party review drafts and public DM-approved additions |
| `#intel` | Excerpts explicitly released from the private vault |
| `#vault` | DM-only migrated notes, private editing, backups, and reviewed reveals |
| `#dm-clocks` | Private threat clocks and deliberate publication of selected developments |
| `#journal`, `#session/S15` | Original session logs and linked recaps |
| `#crew`, `#directory`, `#person/Rook`, `#world/straleon` | Illustrated people/place dossiers, linked evidence, and approved additions |
| `#shop/saint`, `#shop/mercy`, `#shop/curios`, `#shop/weapons`, `#shop/armor`, `#shop/magic`, `#shop/club` | Seven recorded merchant catalogs with stock filters, price sorting, and item rules |
| `#ghost` | Full transcript search, categories, favorites, passage seeking, downloads, and persistent playback |
| `#art`, `#lore`, `#threads` | Artwork archive, campaign lore, and sourced open threads |
| `#discoveries` | Shared found-paperback/chart collection without publishing hiding coordinates |

Ctrl/Cmd K opens global search; arrow keys and Enter navigate results. Routes use shareable URL hashes. New approved people/place proposals create sourced dossiers and enter navigation/search; new places remain uncharted until a position is established. Approval adds reviewed material without silently rewriting the original archive.

### Investigation and table workflow

The connection form sits beside “Pull the thread,” above the board. The legend and instructions run along the board's top edge. The party can keep up to twelve named investigations, each with up to thirty records, thirty question notes, and one hundred connections. Drag pins to move cards, drag empty space to pan, and use zoom/fit controls. Card handles also support arrow keys; Shift moves farther. Ctrl/Command plus the mouse wheel zooms the board.

Select a string or evidence row to open its source and related dossiers/session records. The session filter includes explicitly dated evidence only; it does not invent a reconstruction of what the party knew. Questions can develop into theories. DM confirmations are stored separately from party-editable annotations and match the exact connected records and text. Hiding a recorded string changes the investigation, not the underlying campaign record.

Favorites, pins, notes, investigations, and discoveries share the `onboard` document. Visitors may explore but must sign in to save. Previous browser-only workspaces are left intact and can be explicitly imported from At the table; they are never automatically uploaded. Import replaces the shared workspace after confirmation, so export a backup first when needed. JSON export remains available.

### Session director and reveals

Preparation and DM reminders stay in the private `dm:director` document. “Reveal to party” publishes a separate snapshot containing only the selected public scene material. Another browser at `#stage` receives updates through service refreshes; changing preparation alone does not change the player screen. Clearing the screen returns it to standby. Uploaded private/source audio is not automatically published as a cue.

Ghost cue decks contain existing archive recordings. Number keys 1–9 play the selected scene's cues when focus is outside form controls. A cue can be offered on the player screen, but playback always needs a user action. Sound never starts automatically for remote visitors.

### Session intake and canon review

Party members can paste notes/transcripts, import TXT/Markdown/JSON, link an existing Ghost recording, or attach MP3/WAV/OGG/M4A source audio up to 50 MiB. Paste extracted PDF text into the source field. **Audio intake requires a supplied transcript; there is no automatic transcription or AI lore generation.** Passage extraction proposes source-backed material for human review and can flag continuity issues; Ghost's narration remains explicitly unverified.

Drafts, full source snapshots, and uploaded source recordings are available to signed-in party members. Audio is stored by the service rather than committed to this public repository, and playback uses short-lived signed links. Only the DM can approve selected proposals. The public receives approved additions and their selected supporting passages, while unapproved proposals and full source snapshots remain behind party access. Later edits to a draft require another review; they do not alter earlier approval snapshots silently.

## Media, canon, and existing easter eggs

The archive contains 1,714 recordings: 1,680 regenerated legacy clips, 28 Brook/Sen-47 lines, and six longer recaps/rants. Sixteen unique fragments omitted from the original index were recovered. The preserved standalone archive in `ghost-17x/` retains all 1,682 original audio files, including 1,664 indexed clips and two exact duplicates. The six original attached MP3s remain in `media/ghost/`; original Session 14, 15, and 16 PDFs remain in `media/recaps/`.

The regenerated voice preset is MiniMax 02 HD, Daegoth, English, American, Robotic Assistant, speed 1, Angry. The Skyrim adaptation audit and transcripts remain downloadable. Long-recording passage buttons use actual audio offsets; the persistent player survives route changes. Continuous playback is optional.

Rook is the canonical name. Ghost deliberately calls her Brook or Sen-47. The original written and spoken recaps retain their wording. The three standalone Aelyn/Proximity/Killua recordings belong to Session 11, August 2, 2026, “A Day With Doc.” Ellie and L.E. remain distinct characters. Artwork is illustrative evidence, not proof that an unplayed character or place has been encountered.

The cinematic map retains logged destinations and existing coordinates. Sessions without coordinates do not acquire invented routes. The Celestial Tunnel remains a plane of existence represented by the galaxy's broad constellation. Blue Harvest entries, hidden paperbacks, discovered-item tracking, and the widest-view constellation remain in place; this document does not enumerate the hidden book placements.

Planet surfaces are procedural illustrations. The map renders only while mounted and visible; motion preferences and reduced-motion settings control effects. Chart fallback, keyboard-accessible world labels, mobile navigation, and the complete world index remain available.

### Shopping and Session 16

`campaign-shopping.js`, `shop-views.js`, and `shopping.css` retain the October 13 shopping update: seven recorded merchant entries under Straleon/Chromehymn, with 143 priced stock entries (133 equipment entries and ten Nocturne 13 counter entries). Search, stock filters, price sorting, and item rules use the saved catalog. Stock subtracts all audited shopping purchases, including Asra; no restock was assumed. The Velvet Counter retains its last recorded inventory, with post-battle trading status explicitly unknown.

`#session/S16` contains the October 11, 2026 recap, *Leather, Latex & Legion*, and links its unchanged original PDF at `media/recaps/session-16.pdf`. GHOST-17X’s firsthand/reconstruction boundary, original spelling, and source wording are preserved. Session 16 remains linked through the journal, latest bridge log, map timeline, search, and journey. No audio recording was supplied for Session 16. Character sheets and the private purchase audit remain in the local campaign project and are not published.

### Adding archive recordings

To add a published archive recording, copy the file into the repository and add metadata to `CAMPAIGN_MEDIA.recordings`, or the appropriate `GHOST_LIBRARY` section. Use `recap`, `rant`, or `line`; include transcript, category, duration, and confirmed session/location metadata. Keep unknown locations null. Use actual passage start times for `chapters`; waveform peaks are optional. Source uploads in Session review are shared working material and do not automatically become public Ghost archive clips.

## Verification

Checks compare the public campaign object with the previous Git revision after the explicit private-field migration, and verify that all 37 extracted records remain in the private migration package. Tracked media, artwork, original audio, recap PDFs, soundboard metadata, and easter-egg assets are checked against Git blob hashes. Public archive preservation does not depend on the live service.

Browser QA covers guest/party/DM routes, desktop and phone overflow, real sign-in, shared updates in isolated browser contexts, conflict recovery, private-cache/search clearing, private preparation and public reveals, audio upload/playback/ranges, and JavaScript/asset errors. Direct API tests separately exercise role boundaries, optimistic concurrency, revision retention, payload limits, upload-size enforcement, signed audio access, and session revocation. Production verification follows service deployment and GitHub Pages publishing.
