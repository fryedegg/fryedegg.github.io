# The Shattering campaign compendium

Live site: https://fryedegg.github.io/

Static GitHub Pages website. No build step or framework is required.

- `index.html`: accessible page shell, search dialog, and persistent audio player.
- `campaign-data.js`: complete campaign records, separated from interface code.
- `codex.js`: bridge, dossiers, journal, directory, lore, search, and archive interactions.
- `galaxy.js`: procedural cinematic canvas map, camera, touch controls, and flight timeline.
- `codex.css`: responsive visual system, effects, and reduced-motion rules.
- `campaign-media.js`: artwork catalog, original recording metadata, and full written recaps.
- `ghost-waveforms.js`: waveform peaks and durations decoded from the original recordings.
- `legacy-art.js`: all 63 original illustrations, available in the art library.
- `media/ghost/`: the six original MP3 recordings.
- `media/recaps/`: original Session 14 and 15 PDFs.
- `media/art/`: optimized WebP copies and original library videos.
- `art-audit.json`: the artwork inventory and explicit matches to existing entries.

Run a local preview with `python -m http.server 8765`, then open http://localhost:8765.

## Adding recordings

Add a recording object to `CAMPAIGN_MEDIA.recordings` and copy its file to `media/ghost/`. Types are `recap`, `rant`, and `line`. Set `session`, `date`, `setting`, and `location` when supported by campaign evidence. Use a mapped planet or landmark ID for location-specific lines; leave `location` null when unconfirmed. Recaps appear alongside the matching flight journal entry. The Ghost archive lists every recording. Add decoded waveform data to `GHOST_WAVEFORMS` using its recording ID; the player also works without waveform data.

## Navigation and rendering

Views use shareable URL hashes, such as `#world/straleon`, `#session/S15`, and `#person/Rook`. Search opens with Ctrl/Cmd K and supports arrow keys and Enter. The world index includes landmarks and uncharted realms that do not have map coordinates.

The cinematic map preserves the original angles, orbital radii, and station coordinates. Planet surfaces are procedural illustrations, not additional campaign canon. Cinematic and chart views share the same records. The timeline follows the actual logged destinations; sessions without coordinates do not invent a route to an uncharted realm.

The map renders only while mounted and the browser is visible. Effects run at approximately 30 frames per second, and the manual motion switch and reduced-motion preference stop animation. Pointer events support mouse panning, touch dragging, and pinch zoom. World labels remain keyboard accessible.

One audio element survives page navigation. Recording cards, waveforms, and the bottom player all control it; playback starts on a user action. Artwork and audio load on demand. All library media remains local to this repository.

## Content and artwork notes

Session 15 calls Rook “Brook” in Ghost’s unreliable narration; her directory and crew entries use Rook. The original written recap preserves its wording. The three standalone recordings are tagged to Session 11, August 2, 2026, A Day With Doc, as confirmed by the campaign owner. Exact scenes within that realm remain unspecified.

The art library uses several spelling variants. Explicit matches retain the existing campaign names. Unidentified and “likely” art stays labeled in the archive. Artwork alone does not establish that a planned character or venue has been encountered.

DM Mode is an existing client-side display switch, not access control: all static site source can be viewed by visitors. Store truly private material outside this public repository.

## Verification

The redesign was checked against a complete pre-redesign JSON snapshot: all campaign fields, including DM notes, match exactly. The six MP3s also match the original supplied files by SHA-256. All 171 imported art/video assets, 63 original illustrations, and both written recap PDFs are retained.

Browser verification covers desktop and phone layouts, every archive view, deep links, the session timeline, map selection and controls, Ghost filtering, playback across navigation, artwork search/lightboxes, keyboard search, DM display, easter eggs, reduced motion, local asset responses, and JavaScript errors. Public deployment is checked after GitHub Pages finishes publishing.
