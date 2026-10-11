# The Shattering campaign compendium

Live site: https://fryedegg.github.io/

Static GitHub Pages website. No build step or framework is required.

- `index.html`: page shell and initial star-map markup.
- `atlas.js`: campaign data, navigation, rendering, audio and art archive interactions.
- `campaign-media.js`: artwork catalog, original recording metadata, and full written recaps.
- `atlas-base.css`: established component styles.
- `atlas-polish.css`: visual system, responsive layouts, and reduced-motion rules.
- `media/ghost/`: the six original MP3 recordings.
- `media/recaps/`: original Session 14 and 15 PDFs.
- `media/art/`: optimized WebP copies and original library videos.
- `art-audit.json`: the artwork inventory and explicit matches to existing entries.

Run a local preview with `python -m http.server 8765`, then open http://localhost:8765.

## Adding recordings

Add a recording object to `CAMPAIGN_MEDIA.recordings` and copy its file to `media/ghost/`. Types are `recap`, `rant`, and `line`. Set `session`, `date`, `setting`, and `location` when supported by campaign evidence. Use a mapped planet or landmark ID for location-specific lines; leave `location` null when unconfirmed. Recaps appear alongside the matching Journey entry. The Ghost archive lists every recording.

## Content and artwork notes

Session 15 calls Rook “Brook” in Ghost’s unreliable narration; her directory and crew entries use Rook. The original written recap preserves its wording. The three standalone recordings are tagged to Session 11, August 2, 2026, A Day With Doc, as confirmed by the campaign owner. Exact scenes within that realm remain unspecified.

The art library uses several spelling variants. Explicit matches retain the existing campaign names. Unidentified and “likely” art stays labeled in the archive. Artwork alone does not establish that a planned character or venue has been encountered.

DM Mode is an existing client-side display switch, not access control: all static site source can be viewed by visitors. Store truly private material outside this public repository.

## Verification

Checked desktop and phone layouts, all compendium tabs, landmark navigation, Ghost filtering, art search, local asset references, audio decoding/playback, keyboard controls, and reduced motion before publication.
