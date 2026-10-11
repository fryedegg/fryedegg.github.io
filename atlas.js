(() => {
  'use strict';

  // ============================================================
  // DATA — Galaxy locations
  // angle: 0 = top, increases clockwise (degrees)
  // ============================================================
  const CENTER = 1000;
  const R_INNER = 280;
  const R_MID = 540;
  const R_OUTER = 820;

  // helper: convert (angle, radius) to (x, y)
  function pos(angle, radius) {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad)
    };
  }

  const RIMS = {
    inner: {
      name: 'Inner Rim',
      subtitle: 'Realms of the Fey Courts',
      desc: '<strong>Thirteen god-blooded planets.</strong> Each ruled by a divine dynasty, tied to a Prime Domain. Order here is radiant. Ancient. And cracking beneath the weight of prophecy. The Inner Rim is where gods speak in law and magic bleeds into politics.'
    },
    mid: {
      name: 'Midreach',
      subtitle: 'The Tension Belt',
      desc: '<strong>Once trade routes. Now war zones.</strong> Every world in the Midreach balances on a knife between empire, rebellion, and annihilation. The center cannot hold; the buffer between the divine inner courts and the lawless outer dark is failing year by year.'
    },
    outer: {
      name: 'Outer Rim',
      subtitle: 'The Edge and the End',
      desc: '<strong>Beyond control. Beyond law.</strong> These are the myth worlds, the whisper worlds — where the Veil is thin, and nothing stays buried for long. More worlds exist than are shown. Some sealed. Some shattered. Some <em>dreaming you back</em>.'
    }
  };

  // ============================================================
  // DM ACCESS — change this if you need to. NOT cryptographic;
  // anyone who opens View Source can read it. Just keeps players
  // from clicking around the UI to peek behind the curtain.
  // ============================================================
  const DM_PASSWORD = 'rosco';

  // Master location list. rim ∈ inner|mid|outer|station|void|unknown
  // Each location may include: deity, court, contacts[], intel[], factions[], dmNotes, destroyed
  const LOCATIONS = [
    // ===================== INNER RIM (13) =====================
    { id: 'oratoria', name: 'Oratoria Prime', rim: 'inner', angle: 5, radius: R_INNER,
      subtitle: 'Galactic Heart of the Fey Courts',
      desc: 'A city-world of <strong>crystal towers, floating cathedrals,</strong> and holy bureaucracy. Where gods speak in law and magic bleeds into politics. The capital from which the Fey Courts pretend to rule everything beyond.',
      deity: { name: 'Virex, the Chainmind', domain: 'God of Control · Dominion' },
      court: 'The Court of Sovereignty',
      intel: [
        'Court nobles here are being <strong>quietly recruited</strong> to the Black Sky cause by Red Solomon of Akora.',
      ],
      factions: ['Court of Sovereignty', 'Children of the Black Sky · covert']
    },
    { id: 'nocturna-i', name: 'Nocturna', rim: 'inner', angle: 38, radius: R_INNER,
      subtitle: 'Court of Lunar Time',
      desc: 'A <strong>dream-touched moon</strong> bathed in lunar magic. Time drips sideways here. Prophets are born in sleep — and sometimes forget to wake.',
      deity: { name: "Solun, Keeper of Time's Ash", domain: 'God of Time · Entropy' },
      court: 'The Court of Lunar Time'
    },
    { id: 'verdantia', name: 'Verdantia', rim: 'inner', angle: 70, radius: R_INNER,
      subtitle: 'Court of Bloom',
      desc: 'A <strong>sacred jungle-world</strong> where nature is god, and druids are its priests. Cities bloom within beasts. Civilization obeys the forest — or feeds it.',
      deity: { name: 'Elyndra, the Bloom Eternal', domain: 'God of Life · Growth' },
      court: 'The Court of Bloom'
    },
    { id: 'ignara', name: 'Ignara', rim: 'inner', angle: 100, radius: R_INNER,
      subtitle: 'Court of Ash and War',
      desc: '<strong>Black spires pierce a volcanic sky.</strong> Fire is tradition. Ash is inheritance. War is always the answer.',
      deity: { name: 'Tharok, the Worldbreaker', domain: 'God of War · Destruction' },
      court: 'The Court of Ash and War'
    },
    { id: 'zephyros', name: 'Zephyros', rim: 'inner', angle: 130, radius: R_INNER,
      subtitle: 'Court of Storms',
      desc: 'A <strong>skyborn realm</strong> where cities float on jetstreams and storms are tamed like dragons. The winds obey those who dance with them.',
      deity: { name: 'Kaelith, the Storm Unbound', domain: 'God of Tempest · Chaos' },
      court: 'The Court of Storms'
    },
    { id: 'aurelia', name: 'Aurelia', rim: 'inner', angle: 160, radius: R_INNER,
      subtitle: 'Court of Light',
      desc: '<strong>Justice incarnate.</strong> A searing world of blinding law, light-forged armies, and merciless beauty. <em>Redemption costs more than death.</em>',
      deity: { name: 'Aurelion, the Radiant Sovereign', domain: 'God of Light · Order · Authority' },
      court: 'The Court of Light',
      intel: [
        'Sworn enemy of the <strong>Children of the Black Sky.</strong>',
        '<strong>High Adjudicators Chaddeus &amp; Thaddeus</strong> were sent from here to apprehend the party. Both killed in Glassend. The Court will know they failed.',
        'Heat is high — the Court of Light has the party flagged for FTL theft and the killing of two of its enforcers.',
      ],
      factions: ['Court of Light · HOSTILE']
    },
    { id: 'nyxara-i', name: 'Nyxara', rim: 'inner', angle: 188, radius: R_INNER,
      subtitle: 'Court of Shadows',
      desc: 'A <strong>velvet world of shadows, secrets, and silent knives.</strong> The darkness here is intelligent. <em>And it remembers your sins.</em>',
      deity: { name: 'Nyxara, the Veilmother', domain: 'God of Shadow · Dreams · Fate' },
      court: 'The Court of Shadows'
    },
    { id: 'voga', name: 'Voga', rim: 'inner', angle: 215, radius: R_INNER,
      subtitle: 'Court of Beasts',
      desc: 'A <strong>wild, roaring Eden.</strong> Beastlords, shamans, and shapechangers rule by fang and instinct. Civilization here runs on muscle, roar, and primal pact.',
      deity: { name: 'Sylphae, the Whispering Wild', domain: 'God of Nature · Instinct' },
      court: 'The Court of Beasts'
    },
    { id: 'illureth', name: 'Illureth', rim: 'inner', angle: 240, radius: R_INNER,
      subtitle: 'The Masked Court · Court of Mirrors',
      desc: 'A <strong>kaleidoscopic sphere</strong> of shifting masks, mirrored realities, and endless illusion. Nothing you see is real. <em>But it matters anyway.</em>',
      deity: { name: 'The Thirteenth · REDACTED', domain: 'God of Hunger · Unmaking' },
      court: 'The Masked Court · Court of Mirrors',
      dmNotes: 'Illureth\'s ties to the Thirteenth (the Maw) are <strong>not public knowledge.</strong> The Masked Court denies, hides, and reflects this connection. The deity field above shows the locked canon — but to most of the galaxy, the Masked Court is officially a court of "illusion and self-invention," nothing more. Reveal slowly.'
    },
    { id: 'eos', name: 'Eos', rim: 'inner', angle: 265, radius: R_INNER,
      subtitle: 'Court of Sacred Passage',
      desc: 'A realm of <strong>radiance and martial sanctity.</strong> Healers and paladins burn with holy conviction — but mercy here is not weakness. <em>It\'s a weapon.</em>',
      deity: { name: 'Morvane, the Grave Unending', domain: 'God of Death · Passage' },
      court: 'The Court of Sacred Passage'
    },
    { id: 'echo', name: 'Echo', rim: 'inner', angle: 290, radius: R_INNER,
      subtitle: 'Court of Resonance',
      desc: '<strong>Every word echoes.</strong> Every spell reverberates. A sound-woven world where resonance is worship and silence can kill.',
      deity: { name: 'Velmora, the Tide Between Stars', domain: 'God of Space · Travel' },
      court: 'The Court of Resonance'
    },
    { id: 'crius', name: 'Crius', rim: 'inner', angle: 315, radius: R_INNER,
      subtitle: 'Court of Stars and Thought',
      desc: 'A <strong>tranquil world</strong> of stars and diviners. Astrologers, dream-mappers, and celestial engineers craft their fate by studying the pulse of constellations.',
      deity: { name: 'Xyphos, the Infinite Thought', domain: 'God of Knowledge · Psionics' },
      court: 'The Court of Stars and Thought'
    },
    { id: 'titania', name: 'Titania', rim: 'inner', angle: 340, radius: R_INNER,
      subtitle: 'Court of Sunsteel',
      desc: 'A <strong>blazing world of solar rites,</strong> sacred duels, and warrior courts. <em>Sunsteel is currency. Strength is truth.</em>',
      deity: { name: 'Draxil, the Forge Tyrant', domain: 'God of Creation · Industry' },
      court: 'The Court of Sunsteel'
    },

    // ===================== MIDREACH =====================
    { id: 'noctara', name: 'Noctara', rim: 'mid', angle: 12, radius: R_MID,
      subtitle: 'Capital of the Black Sky Imperium',
      desc: 'A <strong>cyclopean city-planet</strong> of obedience, surveillance, and cloned perfection. <em>Emotion is a liability. Efficiency is god.</em> Homeworld of the <strong>Black Sky Imperium ("TBS").</strong>',
      intel: [
        'Prime mover behind the <strong>Tuning Fork / Tuning Key</strong> plot.',
        'Sent the bounty hunter <strong>Talus</strong> after The Codex Crew to recover the Tuning Key. Talus killed en route to Akora — the Codex Crew destroyed his cloaked ship and salvaged his cloak.',
        '<strong>⚠ TIMELINE:</strong> TBS is allegedly developing an <strong>arcane-sapping "Death Star"</strong> capable of nullifying an entire planet\'s magic. Field test scheduled on <strong>Akiton in ~30 days.</strong>',
        'In cahoots with <strong>Red Solomon</strong> of Akora (one of the 9 Princes), and is using the <strong>Children of the Black Sky</strong> cult for ground recruitment.',
        '<strong>Imperial enforcers</strong> active across the Outer Reach. Three killed at the Spanner. Imperial battle group destroyed Hosun Prime to bury the fork program.',
      ],
      factions: ['Black Sky Imperium · HOSTILE', 'Children of the Black Sky']
    },
    { id: 'akiton', name: 'Akiton', rim: 'mid', angle: 50, radius: R_MID,
      subtitle: '⚠ Targeted for Imperial Field Test',
      desc: 'A Mid-Reach world otherwise unremarkable to outside eyes — until now. Imperial intelligence indicates <strong>an arcane-sapping weapon test will fire here in roughly 30 days.</strong>',
      intel: [
        '<strong>~30-day countdown:</strong> TBS is preparing to test their planet-scale arcane-nullification weapon here.',
        'Effect would render <strong>all magic on the planet inert</strong>. Casualty estimate: unknown.',
        'No known countermeasure. No known evacuation order. No public warning.',
      ],
      factions: ['Black Sky Imperium · INCOMING']
    },
    { id: 'virelia', name: 'Virelia', rim: 'mid', angle: 80, radius: R_MID,
      subtitle: 'Bio-Tech Hybrid World',
      desc: 'Once a paradise. Now a <strong>terrifying hybrid of nature and biotech.</strong> Groves interface with minds. <em>The trees are listening.</em>'
    },
    { id: 'kaeloras', name: 'Kaeloras', rim: 'mid', angle: 115, radius: R_MID,
      subtitle: 'Realm of Refracted Perception',
      desc: 'A <strong>mind-bending realm</strong> of refracted perception. Illusion-warfare is currency. Propaganda is more real than gravity.'
    },
    { id: 'drexigar', name: 'Drexigar', rim: 'mid', angle: 165, radius: R_MID,
      subtitle: 'Fractured Guild Moon',
      desc: 'A <strong>fractured moon</strong> where guilds rise and fall with every storm. Loyalty is profit. Honor is paid in blood.'
    },
    { id: 'straleon', name: 'Straleon', rim: 'mid', angle: 210, radius: R_MID,
      subtitle: 'Cybernetic Refuge',
      desc: '<strong>Cybernetic refuge for the broken and brilliant.</strong> Bodies are optional. Minds run in mesh. Flesh here is just another upgrade.'
    },
    { id: 'veloria', name: 'Veloria', rim: 'mid', angle: 250, radius: R_MID,
      subtitle: 'Forgotten Jewel of Ruins',
      desc: 'A <strong>forgotten jewel half-swallowed by ruins.</strong> The land shifts. The past wakes. <em>Treasure-hunters and cults alike dig too deep.</em>'
    },
    { id: 'rathun', name: 'Rathun', rim: 'mid', angle: 295, radius: R_MID, visitedBy: 'c1',
      subtitle: 'Mercenary Shipyard World · Coda Crystal Source',
      desc: '<strong>Smoke-choked skies</strong> above endless shipyards, slums, and weapon bazaars. Where war is economy, and mercenaries are kings. Rich in raw <strong>coda crystals.</strong> Hosun Prime was its primary moon — until the Empire reduced it to debris.',
      contacts: [
        { name: 'Civet', role: 'Sketchy human fixer · gives jobs in Low Town', faction: 'Untrustworthy', desc: 'Burned The Codex Crew on the last contract. Gave them the Hosun Prime tuning-fork job and now wants nothing to do with them or the fork.' },
        { name: 'Nicola', role: "T'salamari mechanic · runs the Lucky Day garage", faction: 'Friendly' },
      ],
      intel: [
        'The <strong>Low Town</strong> district is the meet-spot for Civet jobs.',
        'Major source of <strong>raw coda crystals</strong> in the sector.',
        'Civet historically routes work for the Black Sky Imperium without saying so out loud.',
      ]
    },
    { id: 'hosun-prime', name: 'Hosun Prime', rim: 'mid', angle: 295, radius: R_MID - 75, destroyed: true, visitedBy: 'c1',
      subtitle: '✗ DESTROYED · Imperial Strike',
      desc: 'A former moon of Rathun. Once a world <strong>overgrown with corruption</strong> — both literal and political. Towering arcologies hid arcane tech, dead gods, and dynasties rotting from within. <strong style="color:var(--magenta-bright)">The Black Sky Imperium destroyed it outright</strong> to bury the Tuning Key program.',
      contacts: [
        { name: 'Lorutell Cindella', role: 'Fey noble · ran the secret half-elf experiment lab', faction: 'Deceased', desc: 'Member of the Children of the Black Sky. Used the Tuning Key to torture and experiment on half-elves. Killed by a wood witch. Sent her ship away with more evidence on the fork before she died.' },
      ],
      intel: [
        'The Empire glassed the planet to bury the Tuning Key program. Anything not already off-world was lost.',
        '<strong>Open lead:</strong> Lorutell\'s missing ship — last known to carry more intel on the Tuning Fork/Key — is still drifting somewhere out there. Inspecting it is a current priority.',
      ],
      factions: ['Black Sky Imperium · destroyed it', 'Children of the Black Sky · former cell']
    },

    // ===================== OUTER RIM =====================
    { id: 'velthros', name: 'Velthros', rim: 'outer', angle: 350, radius: R_OUTER, visitedBy: 'c2',
      subtitle: 'Quaking, Bleeding, Dying · Home Base',
      image: 'images/locations/velthros.png',
      desc: '<strong>Quaking, bleeding, and dying beneath a red sun.</strong> Cults worship what should not be. The land cracks — but still whispers faith. Site of the Codex crash and current home base of operations.',
      contacts: [
        { name: 'Vale', role: 'Eidolon · Parallax Engine · runs the Glassend starport', faction: 'Allied', desc: 'Helped install the FTL drive. Gave the party a teleport necklace — activate to call her in if you\'re in dire need. Power vibe: "space-stone / tesseract."' },
        { name: 'Rex', role: 'Tavern keeper · Dusty Star', faction: 'Friendly', desc: 'Long-suffering target of Killua\'s pranks via Asra.' },
        { name: 'Pip', role: 'Local kid · trainee archer', faction: 'Friendly' },
        { name: 'Yarrow Salt', role: 'Suso bruiser · CURRENTLY HELD ABOARD CODEX', faction: 'Captive', desc: 'Acquired here. Now a sandwich-fed prisoner doubling as a romance novelist (Blue Harvest series, ironically galaxy-famous).' },
      ],
      intel: [
        '<strong>Glassend</strong> is the home town. The <strong>Dusty Star</strong> tavern/starport is the operating base.',
        'A massive <strong>Null incursion</strong> hit Glassend square — Veil-beasts swarmed, a Veil Titan Dragon emerged, and Null soldiers walked through a tear. Their leader scanned Lor and said: <em>"It\'s her. We\'ve found her."</em>',
        'The <strong>Veil Titan Dragon</strong> peeled off from the fight and disappeared into the desolate wastes of Velthros. <strong>Still out there.</strong>',
        'Fey Court cameras at Velthros Moon caught the party\'s ship during the FTL heist. Heat is on.',
      ],
      factions: ['Edgekeepers · allied', 'Court of Light · HUNTING', 'Null incursion sites'],
      dmNotes: 'Survivors in Glassend square reported losing loved ones, then blinking and being unsure that person had ever existed — Maw un-naming. Lor\'s neck mark received during this event.'
    },
    { id: 'velthros-moon', name: 'Velthros Moon', rim: 'outer', angle: 357, radius: R_OUTER - 60, visitedBy: 'c2',
      subtitle: 'Fey Court Moon Base',
      image: 'images/locations/velthros-moon-base.png',
      desc: 'Orbital satellite of Velthros. Hosts a <strong>Fey Court fortified depot</strong> — one of the last sanctioned FTL stockpiles in the sector.',
      intel: [
        'Cameras here <strong>captured the party\'s ship</strong> during the FTL heist. The Fey Court has the footage.',
        'Defended by Nemesis droids and asteroid-field interdiction.',
        'Warehouse 3C was the FTL storage. Stripped.',
      ],
      factions: ['Fey Court · HOSTILE']
    },
    { id: 'threnar', name: 'Threnar', rim: 'outer', angle: 23, radius: R_OUTER,
      subtitle: 'World of Eternal Dusk',
      desc: 'A world of <strong>eternal dusk</strong> where souls linger and sacrifices echo forever. Memory has weight here. <em>And blood has voice.</em>'
    },
    { id: 'leztos', name: 'Leztos', rim: 'outer', angle: 50, radius: R_OUTER, visitedBy: 'c1',
      subtitle: 'Crime-Family Heartland',
      desc: 'Outer Rim world ruled, in practice, by competing crime syndicates. Two families dominate — and have been escalating against each other for years.',
      contacts: [
        { name: 'The Pike Family', role: 'Crime family · holds the docks', faction: 'Hostile-Adjacent', desc: 'Currently holding Spry of the Spanner prisoner for his hacking skills. The Codex Crew settled a debt by handing over Wrath to them.' },
        { name: 'The Red Hand', role: 'Crime family · rivals to the Pikes', faction: 'Unknown', desc: 'Recently stole the Pike family\'s slip-stream. War is escalating.' },
      ],
      intel: [
        'The Pike–Red Hand cold war is heating up. Power vacuum likely to spill into the Outer Reach.',
        '<strong>Open job:</strong> Spry from the Spanner is being held here. Rescue or negotiated release.',
      ],
      factions: ['Pike Family', 'Red Hand']
    },
    { id: 'xernes-5', name: 'Xernes 5', rim: 'outer', angle: 70, radius: R_OUTER,
      subtitle: 'Silk World · Sick Farmers',
      desc: 'Outer Rim agricultural world known galaxy-wide for its <strong>silk production.</strong> Currently suffering a mystery illness sweeping the farming clans.',
      contacts: [
        { name: 'Orlion', role: 'Fancy elf-man · works for the Fey Courts', faction: 'Job-Giver', desc: 'Posted a Court-funded job to help cure the sick farmers of Xernes 5.' },
      ],
      intel: [
        '<strong>Open job:</strong> Orlion will pay to help save the farmers. Cause of illness unknown.',
      ]
    },
    { id: 'tosis', name: 'Tosis', rim: 'outer', angle: 105, radius: R_OUTER, visitedBy: 'c1',
      subtitle: 'Bounty Range · Winged Beast Country',
      desc: 'Wild Outer Rim world with standing bounties on the local megafauna. Light Imperial presence; ideal hunting ground for credentialed mercenaries.',
      intel: [
        '<strong>Posted bounty:</strong> 500g for the head of a winged beast terrorizing the region.',
        'Where The Codex Crew first met the bounty hunter <strong>Talus</strong> (BH man, mean, cloaked ship). He was later destroyed in deep space when he attacked the crew en route to Akora — they salvaged his cloak, killed him, kept his robot parts.',
      ]
    },
    { id: 'kresh', name: 'Kresh', rim: 'outer', angle: 122, radius: R_OUTER,
      subtitle: 'Bounty Range · Stone-Giant Country',
      desc: 'Rocky, mountainous Outer Rim world. Standing bounties on the giants that come down from the high passes.',
      intel: [
        '<strong>Posted bounty:</strong> 600g for a stone giant kill.',
      ]
    },
    { id: 'akora', name: 'Akora', rim: 'outer', angle: 140, radius: R_OUTER, visitedBy: 'c1',
      subtitle: 'The 9 Hells of Pleasure · Seat of the 9 Princes',
      desc: 'Outer Rim playground of the obscenely wealthy — a <strong>"Las Vegas" world</strong> with <strong>nine themed rings,</strong> each modeled after one of the Nine Hells. Low Imperial presence keeps everything pleasantly off-the-books. Seat of the <strong>9 Princes.</strong>',
      contacts: [
        { name: 'Red Solomon', role: '1 of the 9 Princes · tall, handsome tiefling', faction: 'HOSTILE · TBS Asset', desc: 'In cahoots with the Black Sky Imperium. Recruiting Court nobles to TBS. Working on a planet-scale arcane-sapping weapon. Hired The Codex Crew for an infiltration job, then caught them crashing his meeting — bamf\'d away and unleashed his two Platinum Guards.' },
        { name: 'Keira', role: 'Ritual-magic teacher · Red Solomon\'s sister', faction: 'Allied-Adjacent', desc: 'The Codex Crew learned ritual spells from her. Her brother (separate from Red Solomon) warned of the Children of the Black Sky and is helpful intel-wise.' },
        { name: 'Nixx', role: 'Chaotic halfling · low-trust', faction: 'Untrustworthy', desc: 'Wanted The Codex Crew to bug Red Solomon\'s office. Crazy/chaotic — read carefully before agreeing to anything.' },
        { name: 'Rin Fortuna', role: 'Half-elf gambler', faction: 'Mercenary', desc: 'The Codex Crew gambled with him — and lied to him — to set up the meeting with Wrath.' },
      ],
      intel: [
        '<strong>Open job:</strong> Crash Red Solomon\'s next noble-recruitment meeting and expose his TBS ties.',
        '<strong>Open job:</strong> Bug Red Solomon\'s office (originally pitched by Nixx).',
        'Per Keira\'s brother: TBS has planted <strong>2 skimming agents</strong> inside Red Solomon\'s operation. Useful leverage if found.',
        '<strong>Eight rings · one for each of the Nine Hells</strong> — themed pleasure districts the 9 Princes lord over.',
      ],
      factions: ['9 Princes', 'Black Sky Imperium · covert', 'Children of the Black Sky']
    },
    { id: 'lysavex', name: 'Lysavex', rim: 'outer', angle: 158, radius: R_OUTER,
      subtitle: 'Unmapped Outer World',
      desc: '<em>Beyond the reach of charters and Fey law.</em> Details classified, denied, or simply unknown.'
    },
    { id: 'skarab-prime', name: 'Skarab Prime', rim: 'outer', angle: 173, radius: R_OUTER,
      subtitle: 'Unmapped Outer World',
      desc: '<em>Beyond the reach of charters and Fey law.</em> Details classified, denied, or simply unknown.'
    },
    { id: 'dross-meridian', name: 'Dross Meridian', rim: 'outer', angle: 188, radius: R_OUTER,
      subtitle: 'Unmapped Outer World',
      desc: '<em>Beyond the reach of charters and Fey law.</em> Details classified, denied, or simply unknown.'
    },
    { id: 'ghorrak', name: 'Ghorrak', rim: 'outer', angle: 203, radius: R_OUTER,
      subtitle: 'Rusted World of Ceaseless War',
      desc: 'A <strong>rusted world</strong> of ceaseless war. <em>Warlords pilot dead gods.</em> Automated defenses no longer know friend from foe.'
    },
    { id: 'vaereth', name: 'Vaereth', rim: 'outer', angle: 220, radius: R_OUTER,
      subtitle: 'Rogue Ice Giant',
      desc: 'A <strong>rogue ice giant drifting between stars.</strong> Unknown energies radiate from deep within. <em>What sleeps here has waited too long.</em>'
    },
    { id: 'xarnis', name: 'Xarnis', rim: 'outer', angle: 238, radius: R_OUTER,
      subtitle: 'Fungal Megastructure World',
      desc: '<strong>Fungal megastructures stretch for miles.</strong> Minds link. Dreams tangle. The planet thinks. <em>And it might be dreaming you.</em>'
    },
    { id: 'boruun', name: 'Boruun', rim: 'outer', angle: 256, radius: R_OUTER,
      subtitle: 'World of Folded Reality',
      desc: '<strong>Reality folds and twists in its gravity-wracked skies.</strong> Time is unstable. <em>Failed experiments still breathe. Or pretend to.</em>'
    },
    { id: 'achelion', name: 'Achelion', rim: 'outer', angle: 275, radius: R_OUTER,
      subtitle: 'The Drowned World · Karnyx-Held',
      desc: 'A <strong>drowned world.</strong> The sea is vast. <em>And hungry.</em> Something below remembers what was taken. The butterfly-winged Zephryne once rode thermal tides between island-spires; after the skyways shattered, the abyss answered. Crystal light rose from the trench and crowned a giant crab. <strong>Karnyx</strong> rules now, and the tides obey.',
      contacts: [
        { name: 'Karnyx', role: 'Eidolon · Leviathan Crown · cult-king of the trench', faction: 'HOSTILE Eidolon', desc: 'Confirmed Eidolon by Bragg Mentan. Wears the Leviathan Crown. Crowned at the bottom of Achelion\'s trench. Fighting on the wrong side.' },
      ],
      factions: ['Karnyx Cult-State']
    },
    { id: 'nuldrith', name: 'Nuldrith', rim: 'outer', angle: 295, radius: R_OUTER,
      subtitle: 'The Silent Void-Planet',
      desc: '<strong>Dead. Black. Silent.</strong> This void-planet swallows light, sound, and memory. Ships vanish. Minds unravel. <em>Some worship it. None return.</em>'
    },
    { id: 'somnara', name: 'Somnara', rim: 'outer', angle: 313, radius: R_OUTER,
      subtitle: 'The Waking Dream',
      desc: 'A <strong>waking dream.</strong> Geography drifts like thought. Sleep reshapes identity. <em>What you are depends on how you close your eyes.</em>'
    },
    { id: 'caldrithar', name: 'Caldrithar', rim: 'outer', angle: 332, radius: R_OUTER,
      subtitle: 'World of Walking Fortresses',
      desc: '<strong>Molten rivers ferry walking fortresses.</strong> War never ends — because the planet itself demands it. Fire is worship. Suffering is coin.'
    },

    // ===================== STATIONS =====================
    { id: 'edgewatch-9', name: 'Edgewatch 9', rim: 'station', visitedBy: 'c2',
      x: 1880, y: 1100,
      subtitle: 'Edgekeepers Forward Base · Sector 5',
      image: 'images/locations/latticefall-verge.png',
      desc: 'A fortified <strong>line-station of the Edgekeepers,</strong> the rim\'s self-appointed guard against the Null and the wounds in the Veil. Most who come here come to be told the truth — or to die proving it. The party met Bragg here and received the full briefing on the Veilforging, the Maw, and the Eidolons.',
      contacts: [
        { name: 'Bragg Mentan', role: 'Leader of the Edgekeepers · old warrior with a warhammer', faction: 'Allied', desc: 'Delivered the lore dump on the Veilforging, Eidolons, the Maw, and the Hollowed One. Gave the party magebane intel and a spell engram. Will field further questions and provide boons.' },
        { name: 'Z Kint', role: 'Breach Warden · Edgekeepers', faction: 'Allied', desc: "Old acquaintance of Killua\'s. Doesn\'t mince words." },
        { name: 'Dr. Ilex Vor', role: 'Edgekeeper biotech specialist', faction: 'Allied', desc: 'Installed the party\'s P.L.U.G. implants — biohacking devices that close Maw rifts and let users push past biological limits.' },
      ],
      intel: [
        'The Edgekeepers stand a thin line against the Null, the Hollowed One, and the rifts they cut.',
        '<strong>P.L.U.G. protocols</strong> let users close Null rifts and overdrive their own bodies (powered by N.U.T. — the user\'s mana/nervous-system reserve).',
        '<strong>Spell engrams</strong> — one-time coda-crystal items — can permanently re-shape a known spell. Bragg has access.',
        'Edgekeepers can confirm Eidolons in the field. Lor and Vale already confirmed; <strong>Karnyx confirmed hostile.</strong>',
        '<strong>Magebane</strong> is the only known counter to a Hollowed One mark. Wild root grows on Gray Haven.',
      ],
      factions: ['Edgekeepers · allied']
    },
    { id: 'fellwinter-5', name: 'Fellwinter-5', rim: 'station',
      x: 1900, y: 950,
      subtitle: 'Outer Rim Waypoint',
      desc: 'A waypoint station drifting on the upper edge of the rim. <em>Affiliation classified. Function classified. Records sealed.</em>'
    },
    { id: 'spanner', name: 'The Spanner', rim: 'station', visitedBy: 'c1',
      x: 1850, y: 1280,
      subtitle: 'Outer-Reach Service Hub & Black Market',
      desc: 'A giant service hub spanning a gravitic anomaly in the Outer Reach. <strong>Usually out of view of the Courts.</strong> Crews come here for refits, contraband, and to disappear. The Codex Crew docked the Codex here for repairs while ducking Imperial pursuit.',
      contacts: [
        { name: 'Spry', role: 'Black-market dealer · weapons / armor / curios', faction: 'Allied · CAPTIVE', desc: 'Operates from a hologram only — currently held prisoner by the Pike family on Leztos for his hacking skills. Does not accept credits — trade or info only. Sent the party to answer a distress call on Gray Haven; payment to be settled in trade.' },
        { name: 'Spindel', role: 'Spry\'s right-hand man · clone (one of many)', faction: 'Allied', desc: 'Buys drinks. Good dude. Spindel is legion. <em>Aurora Spindel</em> was the last clone made contact with.' },
      ],
      intel: [
        '<strong>Open job:</strong> Negotiate or rescue Spry from the Pike family on Leztos.',
        'A ship called the <strong>Lotus</strong> orbits near the Spanner — lead on an off-book job.',
        'Three <strong>Imperial operatives</strong> were killed here when they got too close to The Codex Crew. Imperial heat is rising in the Outer Reach.',
        'The Spanner\'s black market is the easiest way to move shard-touched goods quietly.',
      ],
      factions: ['Spry/Spindel network', 'Pike Family · hostile', 'Black Sky Imperium · hunting']
    },

    // ===================== UNKNOWN — Gray Haven =====================
    { id: 'gray-haven', name: 'Gray Haven', rim: 'unknown', visitedBy: 'both',
      x: 250, y: 1850,
      subtitle: 'Off All Charts · Magebane Source',
      image: 'images/locations/gray-haven.png',
      desc: 'A planet that <strong>does not appear on any official map.</strong> Coordinates passed mouth-to-ear, contact to contact. Rules itself. <strong>Magebane root grows wild</strong> in the crystal caverns — the only known cure for a Hollowed One mark.',
      contacts: [
        { name: 'Lord Faldrick', role: 'Ruler of Gray Haven', faction: 'Allied', desc: 'Runs the planet. Coordinated the party\'s magebane harvest. Vested interest in Spry/Spindel of the Spanner.' },
        { name: 'Amarante', role: 'Tiefling barmaid · Spit N\' Swallow tavern', faction: 'Friendly', desc: 'Sultry. Loves the Blue Harvest novels. 5p0r3 swung free drinks for the bar by feeding her early plot details.' },
      ],
      intel: [
        'The <strong>Spit N\' Swallow</strong> tavern is the meeting point.',
        'Wild <strong>magebane root</strong> grows in the crystal caverns — extracted to strip magic from a target. Currently the only known counter to a Hollowed One mark.',
        'The crystal caverns are guarded. A phoenix Veil-beast was nesting at the entrance (slain). A corrupted crystal-grove avatar called <strong>Gleam Feather</strong> sat at the cavern\'s heart (slain). Magebane harvested.',
        '<strong>Three scrying eyes</strong> followed the party here. Source unknown — Flint counter-scryed and saw a control room of monitors, headset crews, and someone saying <em>"They are perfect, they will be stars."</em>',
        'Spry and Spindel of the Spanner have a vested interest in this planet and its inhabitants.',
      ],
      factions: ['Faldrick administration', 'Unknown observers · scrying'],
      dmNotes: 'The "broadcast company" watching the party operates from a ship located inside the Weave itself. They are framing the party\'s adventures as content. This thread connects to <strong>Kah\'ryn</strong> (the lesser god of Suffering / Recursion / Narrative Loops). Revealed in full S11–12 — Kah\'ryn is now dead by the Hollowed One\'s hand.'
    },
  ];

  const VOID = {
    id: 'maw',
    name: 'Mawward Unknown',
    rim: 'void',
    subtitle: 'The Cage of the Thirteenth',
    desc: 'A wound in space at the edge of the known galaxy. <strong>Not a place — an absence.</strong> The cage-realm built by the Twelve Primordials to imprison the Thirteenth, the Primordial of Entropy. Light, sound, names, and history go to die in its pull.<br><br>Old maps mark it only as a warning. New maps don\'t mark it at all.',
    dmNotes: 'The Maw. Bragg Mentan\'s lore: the Twelve broke pieces of themselves into Veilshards to chain their devouring brother here. The <strong>First Hollow</strong> (formerly the Warden of Silence) opens wounds from the inside; the <strong>Null</strong> march through her tears. Lor\'s neck mark constantly broadcasts her location to the Hollowed One. The Mawbound Shard is the thirteenth — entropy\'s own core, nailed into the wound.'
  };

  // ============================================================
  // COMPENDIUM — sessions / hooks / contacts / POI / factions
  // crew: 'c1' = The Codex Crew (Lor's original crew), 'c2' = HOC.2a (current), 'both'
  // dmOnly fields are gated behind DM_PASSWORD
  // ============================================================

  const SESSIONS = [
    {
      num: 'S0', crew: 'c2',
      title: 'A Drift Gone Wrong',
      where: { id: 'velthros', label: 'Velthros (Crash Landing)' },
      summary: 'A training drift goes wrong. Cae — a fragment consciousness — pulls the drifters out of a collapsing weave construct and crash-lands them on Velthros. The party wakes in alien bodies that aren\'t their own. They find a wrecked vessel, the <strong>Codex,</strong> and inside, a half-living blue tiefling named <strong>Lorcedes</strong> curled around her wife\'s decaying metallic body. Veil-beasts swarm. The party fights, makes it through, and meets Lor properly.',
      moments: [
        'Cae\'s voice: <em>"I have you. I don\'t know how, but I have you all."</em>',
        'Lor\'s wife <strong>Ellie</strong> — The Codex Crew\'s AI, originally bodiless until the crew built her a frame and bound her soul to it with the <strong>Imaginarium</strong> veilshard — is dead, killed by Cro mid-Shattering. The Imaginarium has since moved from Ellie\'s body to Lor. Lor has spent two years curled around Ellie\'s body, jacked into the Codex replaying her memories.',
        'A failed jump. Skill challenges restart the Codex.',
        'Arrival at the Dusty Star tavern in <strong>Glassend</strong>. Vale greets the party warmly. Rex behind the bar. Pip the trainee archer.',
      ],
      dmOnly: 'Mid-drift, the Hollowed One stepped through the weave and choked Lor\'s shifter form. Lor felt herself becoming a husk. Cae severed the connection just in time. Lor\'s neck mark received here. The Luminous Engine\'s prime function is to <strong>record with safeguards never to forget</strong> — it still knows who Lor is.'
    },
    {
      num: 'S1', crew: 'c2',
      title: 'Yarrow Salt Has a Bad Night',
      where: { id: 'velthros', label: 'Velthros · Glassend' },
      summary: 'The crew bonds the only way legends and bad decisions are born — illicit drugs together in public. Bliss-chips. A near-brawl with would-be bruiser <strong>Yarrow Salt</strong> ends with Killua going full unapologetic gay and short-circuiting him. Then sirens. <strong>Veil-beasts swarm Glassend square,</strong> a Veil Titan Dragon emerges, and shadow soldiers march out of a rift opened mid-square.',
      moments: [
        'A figure with command in his posture seizes Lor, scans her, says <em>"It\'s her. We\'ve found her."</em>',
        'The shadow soldiers retreat through the rift. The Veil Titan Dragon peels away into the desolate wastes of Velthros — <strong>still out there.</strong>',
        'Killua refuses to drag a downed 5p0r3 to safety, choosing violence instead.',
        'Allies gained: Rex, Vale. "Lost": Yarrow Salt.',
      ],
      dmOnly: 'Glassend bystanders begin telling each other about loved ones they\'ve lost in the attack — then blink, unsure that person ever existed. <strong>The Maw un-names.</strong> The shadow soldiers leave no bodies, no salvage — uniforms collapse like shed skins. They are <strong>Null.</strong>'
    },
    {
      num: 'S2', crew: 'c2',
      title: 'Heist on the Moon',
      where: { id: 'velthros-moon', label: 'Velthros Moon · Fey Court Base' },
      summary: 'The crew needs an FTL drive. Vale lays out two paths; they pick the moon heist. Killua distracts <strong>Yarrow Salt</strong> on guard duty with shirtless kata. Familiars slip aboard the freighter, ground it. Stolen credentials in hand, the crew flies up to the Fey Court moon base, threads asteroid defenses, hacks security feeds, and pulls an FTL drive from Warehouse 3C past a squad of Nemesis droids. Flint cracks a teleport scroll. Reality folds. They\'re back on the Codex.',
      moments: [
        'A T\'vaari shopkeep is duped into chasing a Minor Illusion laser pointer down an alley while the boys "reallocate" supplies.',
        'Asra (Killua\'s sister) once again torments Rex the tavern keeper.',
        'Vale concedes the rifts open onto a place opposed to ours — <em>"where growth rots and meaning thins."</em> The shadow soldiers are <strong>Null,</strong> hollow things that walk out of it.',
        'Vale points the party at <strong>Bragg Mentan</strong> of the Edgekeepers — find him after the FTL is installed.',
      ],
      dmOnly: 'Moon base cameras captured the Codex ship during the heist. The Fey Court now has the footage. Heat is rising.'
    },
    {
      num: 'S3', crew: 'c2',
      title: 'Unfettered Hate',
      where: { id: 'velthros', label: 'Velthros · Glassend' },
      summary: 'Vale offers to install the FTL at a discount (2,000 creds). Aelyn, refusing to pay, fixates on stealing it from <strong>Yarrow Salt.</strong> The crew ransacks his quarters and finds nothing but protein and weights. Killua sends Asra to torment Rex again. Then a <strong>message spell from Vale</strong> drags the party out to a hangar where two High Adjudicators of the Court of Light — twins <strong>Chaddeus and Thaddeus</strong> — are interrogating Yarrow.',
      moments: [
        'A Zone of Truth catches multiple party members and unravels the lie. The twins attack.',
        'Lor remembers a stash of <strong>magebane</strong> from the Codex Crew\'s boons, coats an arrow, and strips Chaddeus of his magic.',
        'A familiar voice in the party\'s minds. A figure crashes down to lend aid.',
      ],
      dmOnly: 'The figure is <strong>Vale, in her true Eidolon form.</strong> She is bound to the Parallax Engine — power vibe: space-stone / tesseract.'
    },
    {
      num: 'S4', crew: 'c2',
      title: 'Light and Prejudice',
      where: { id: 'velthros', label: 'Velthros · Glassend' },
      summary: 'Mid-battle. <strong>Vale\'s Eidolon form</strong> heals Flint, teleports him to safety, and supports the line. The twins down Aelyn and lay Killua low; 5p0r3 lands clutch heals and bless. The tide turns. The twins try to escape via Dimension Door — Aelyn counterspells, Thad rebukes, and 5p0r3 cosmic-fates the failing arcane lattice into a complete shatter. Vale banishes them into a pocket dimension. Flint constructs a ramshackle metal prison for their return.',
      moments: [
        'Lor fells Chad. His corpse erupts in arcane fire.',
        '5p0r3 — creepy terminator smile — overloads Thad\'s body with necrotic mycelium reacting against his radiant Court-of-Light essence. Veins go black. <strong>Head explodes.</strong>',
        'The body is preserved in a mycelium cocoon and stored in the Codex\'s cold storage. 5p0r3 keeps it intentionally.',
        'Vale reveals her Eidolon form to the party openly.',
        'Aelyn/5p0r3 trick <strong>Yarrow into "working" for them</strong> — locked in the brig, fed sandwiches.',
        'Vale gives the party Bragg\'s coordinates in Sector 5. Mentions a potential Eidolon candidate to help resurrect Ellie.',
      ],
      dmOnly: 'The Court of Light will know the twins were not successful. The party\'s heat with the Court is now critical.'
    },
    {
      num: 'S5', crew: 'c2',
      title: 'Space Pirates and Space Prophecies',
      where: { id: 'edgewatch-9', label: 'Outer Rim → Edgewatch 9' },
      summary: 'A warning shot across the bow of the Codex. <strong>Pirates.</strong> An attempt to deceive them with a fake VIP transport almost works. Flint\'s name doesn\'t pop on bounty lists. Combat — lasers, photon torpedoes, EMP attacks. Clutch piloting and astrogation, surgical strikes. <strong>First space battle won.</strong> The party FTLs to <strong>Edgewatch 9</strong> in Sector 5.',
      moments: [
        'Greeted at Edgewatch 9 by <strong>Z Kint,</strong> breach warden of the Edgekeepers and an old acquaintance of Killua\'s.',
        '<strong>Bragg Mentan</strong> delivers the full lore dump: Veilforging, Primordials, the Maw, the First Hollow, the Null, Veilborn, Fractured, Veilbeasts, Veil Titans, Eidolons, the Shattering.',
        'Bragg outs <strong>Lor as an Eidolon</strong> (Imaginarium) and <strong>Ghost as something more than he appears.</strong>',
        'Bragg confirms <strong>Karnyx is an Eidolon</strong> fighting on the wrong side, crowned by the Leviathan Crown at the bottom of Achelion\'s trench.',
        'To remove the Hollowed One\'s mark from Lor: <strong>magebane.</strong>',
        'Bragg pledges boons and further intel.',
      ],
      dmOnly: ''
    },
    {
      num: 'S6', crew: 'c2',
      title: 'A Blue Harvest',
      where: { id: 'gray-haven', label: 'Edgewatch 9 → Gray Haven' },
      summary: 'Bragg explains <strong>P.L.U.G. protocols</strong> — biohacking devices that work with the user\'s nervous system to generate N.U.T. (mana fuel). Two functions: close Maw rifts and let users hack their own biology to push past their limits. <strong>Dr. Ilex Vor</strong> installs them all. Bragg reveals he\'s also twin-souled (his own echo twin) and gifts Killua a <strong>spell engram</strong> that permanently transforms Find Steed into <strong>Echo Sheath</strong> — Asra becomes magical bio-mechanical armor. The crew names their ship temporarily the <strong>Planetary Express</strong> and FTLs to Gray Haven.',
      moments: [
        'At the <strong>Spit N\' Swallow</strong> tavern: <strong>Amarante,</strong> sultry tiefling barmaid. Killua fans (giggling) ask him to sign copies of <em>Blue Harvest</em> — a galaxy-famous romance novel whose cover misrepresents his pecks.',
        '5p0r3 discovers <strong>Yarrow has been writing/selling</strong> the Blue Harvest novels under their employ. Steam-storms back to the ship, confiscates the device, halves Yarrow\'s sandwich rations.',
        '5p0r3 returns to the bar and swings <strong>free drinks for everyone</strong> by giving Amarante an early preview of the next book.',
        '<strong>Lord Faldrick:</strong> magebane production halted — a Phoenix turned Veil-beast has roosted at the entrance to the crystal caverns.',
        'Forklift commandeered for the trip to the caverns. Repeatedly stuck in fens. Takes longer than walking.',
        'Killua spots a <strong>scrying eye</strong> following the party. Destroys it with a radiant lance.',
        'Phoenix Veilbeast slain — twice (rose from ashes, struck back, slain again). Reverts to a normal phoenix egg. <strong>Three more scrying eyes</strong> appear afterward.',
      ],
      dmOnly: 'Just before the Phoenix fight, Flint counter-scryed the watcher and was projected through the weave into <strong>a busy control room</strong> — people in headset mics, dozens of monitors broadcasting adventures across the galaxy. One monitor showed his own party. Audio: <em>"They are perfect, they will be stars."</em> 5p0r3 + Flint enhanced the memory: the room is <strong>on a ship located inside the Weave itself.</strong> The watchers are framing the campaign as content. Ties to <strong>Kah\'ryn</strong>, the lesser god of Suffering / Recursion / Narrative Loops.'
    },
    {
      num: 'S7', crew: 'c2',
      title: 'Music and Magebane',
      where: { id: 'gray-haven', label: 'Gray Haven · Crystal Caverns' },
      summary: 'Long rest in a tiny house Flint forged from local crystal, Ghost and CUM bot keeping watch with their personalities cranked weird (Ghost gets a tiny cowboy hat and a Spaghetti Western drawl; CUM bot calls everyone "brother" and grows elbow tassels). Three obstacles in the caverns: unstable coda crystal stalagmites (Ghost scouts a path), a <strong>magical seam</strong> down the middle of a passage (Killua and Ghost vanish into it; the party elephant-walks safely past), and a sealed door with five resonance crystals.',
      moments: [
        '5p0r3 speaks fungal language to the local toadstools. They patiently <em>scan his memories</em> for music he knows. The cipher resolves to <strong>Metallica\'s "One"</strong> — five-times Platinum, 1990 Best Metal Performance Grammy. The party plays the notes in correct sequence. The door breaks.',
        'Inside: a corrupted crystal-grove guardian, <strong>Gleam Feather.</strong> Once Killua spots the central crystal as the true weakness, the fight ends fast. Gleam Feather deems the party worthy.',
        '5p0r3 connects directly to the grove\'s mycelium and pinpoints <strong>three magebane nodules.</strong> Harvested.',
        'The party returns to town to meet with Lord Faldrick.',
      ],
      dmOnly: ''
    },
    {
      num: 'S8', crew: 'c2',
      title: '"Not Slaves"',
      where: { id: 'gray-haven', label: 'Hearth Grove → FTL → Straleon Approach' },
      summary: 'Back at Hearth Grove with the Phoenix slain and three magebane nodules in hand. <strong>Lord Faldrick</strong> rewards the crew with <strong>residium droughts</strong> — permanent boons to stats and abilities — and points them to <strong>Drindle the alchemist</strong> to refine the magebane. Each crew member contributes to the brew; success bar lowered, three full <strong>magebane potions</strong> secured. Drindle\'s lead: <strong>technomancers in Chromehymn on Straleon</strong> have been doing incredible things with magebane and might be able to do something about Lor\'s mark.',
      moments: [
        '<strong>Sorrow Yalt meet &amp; greet con:</strong> Drindle and Amarante are invited aboard the BBC for a "meet &amp; greet" with the galaxy-famous author of <em>Blue Harvest</em> — a.k.a. Yarrow. Mid-greet, the crew orchestrates a fake apocalypse outside the ship as a pretext for emergency evac. Both fans now believe HOC.2a saved their lives. Drindle is now their newest "not a slave."',
        '<strong>4-day FTL to Straleon</strong> — downtime work: <strong>Aelyn</strong> researches the <strong>Lux Codicants</strong> and other Luminous Engine threads (2 days, also helping Killua 2 days). <strong>Flint</strong> completes <strong>4 of 7 days</strong> renovating an alchemy lab for Drindle. <strong>Lor</strong> logs <strong>1 successful day</strong> studying magebane — three more sessions and she can permanently map a magebane-like effect onto a coda crystal as a weapon (also helped Killua 2 days). <strong>5p0r3</strong> spent 4 days assisting Killua.',
        '<strong>Killua</strong> spends the full 4 days on a <strong>banking-hack rig.</strong> With nearly the whole party assisting, two breakthroughs: the intergalactic transponder is on the network, and the channels to the banking systems are mapped. Firewalls and the extraction algorithm still TBD — a few more sessions and the rig should work.',
        'Exiting FTL, Aelyn spots a <strong>bend of light</strong> dead ahead. A vessel bearing the <strong>Corno Spezzato</strong> insignia decloaks and EMPs the BBC. All systems disabled. <strong>Two breach pods punch into the BBC on two different decks.</strong>',
        'The capo on the bridge identifies as Corno Spezzato — here to collect a protection fee for the <strong>Hog Father</strong>, who controls this sector. Demand: <strong>80% of the crew\'s most recent take,</strong> or they take it by force. <strong>Lor chose violence.</strong>',
      ],
      dmOnly: 'Corno Spezzato is a regional crime syndicate working a protection racket across this stretch of the Outer Rim. The Hog Father is a known boss-name. Killing the boarding crew without negotiation = inheriting a war with the syndicate, and putting a name and target on HOC.2a in the process.'
    },
    {
      num: 'S9–10', crew: 'c2',
      title: 'Metagaming The Space Pirates',
      where: { label: 'Aboard the BBC — Cockpit, Decks 2 & 3' },
      summary: 'Negotiations end when <strong>Lor answers the pirate capo with two arrows to the chest</strong> and faerie fire across half the boarders. The pirates still get the jump — Aelyn eats the volley in the cockpit while the boys are caught snoozing in their pajamas on Deck 3. Flint teleports to the engine room; Lor drops the pirate captain with two more arrows (neck and heart) and <strong>Energetic-Transfers herself through the ship\'s fiber network</strong> to Deck 2. A grappled Aelyn thunderclaps free through her psychic bond with Flint. On Deck 3, <strong>5p0r3 seizes full control of a mechanized pirate</strong> with Override Primitive Node while Killua\'s divine light — full <strong>blue super saiyan aura</strong> — routs the breach crew into opportunity attacks, flamestrike, and paired smites with Asra.',
      moments: [
        'Flint gets the engines back online. Lor scans the enemy ship: <strong>10 more life forms aboard.</strong>',
        'Aelyn lands a gun attack for <strong>3 hull damage</strong> before the pirate ship raises shields.',
        '5p0r3\'s new iron "slave" poison-blasts two of its own compatriots.',
        'Ends with Flint locking the cockpit exit down to Deck 2.',
      ],
      dmOnly: ''
    },
    {
      num: 'S11', crew: 'c2',
      title: 'A Day With Doc',
      where: { label: 'BBC Hangar → The Celestial Tunnel' },
      summary: 'Mid-fight in the hangar, Lor and Killua spot a familiar floating eye. A garbled Celestial voice: <em>"The Brown one has not been polling well, leave him behind."</em> Four beams fire — <strong>Aelyn, 5p0r3, Killua and Lor are teleported off the BBC</strong> and dropped from the sky over an Eladrin woman named <strong>Vay\'hel</strong>, mid-throw with a <strong>magebane bomb that took her 100 years to build.</strong> Killua\'s Echo Sheath blocks the shot; the bomb erupts at the party\'s feet, stripping Killua, Aelyn and Vay\'hel of their magic — and drawing <strong>Mother Sunder</strong>, a 12-foot Arch Hag who slaughters the entire party in seconds. In the waiting dark, the "source" forces a <strong>re-run of the pilot episode from 500 years ago: the story of Valerie Sporewell</strong> — the biotech researcher from ancient Earth who sang and danced for a fungal subject called 5p0r3, and burned away to a scorched name tag in his tendril when a maelstrom of color tore her ship apart. The party wakes in Vay\'hel\'s glade inside <em>A Day With Doc</em> — a 72-hour loop she has lived for <strong>50 seasons, about 500 years.</strong> Two ways out: kill Mother Sunder, or the null-field bomb they just made her waste. So: <strong>boon-hunting with three lesser gods.</strong>',
      moments: [
        '<strong>Drundar (power):</strong> Killua, doubled in size and cut from marble, edges the boar-god out in a pose-off. Boon granted.',
        '<strong>Vantros (probability):</strong> god of bureaucracy. Ghost scans the grievance form and finds the trap — the witness line requires someone never declared deceased. <strong>The loophole is V: she never died, she looped.</strong> Boon granted.',
        '<strong>Zelqua (life/death):</strong> god of gossip. Recognizes Killua as the living inspiration for <em>Blue Harvest</em>. The party spills ALL the tea. Boon granted — for a price: <strong>a return appearance, and delivery of the acclaimed author Sorrow Yalt.</strong>',
        'Zelqua goes in on Aelyn on-air, insinuating <strong>she is hiding a great deal from the party and the world.</strong> Deflected. Not resolved.',
        'A fan\'s sponsor box gives Killua a Charisma-boosting glamour — half-shirt, daisy dukes, confidence through the roof. Signed <strong>"Y.S. ;)"</strong>',
        'Vay\'hel\'s cottage tour: the <strong>ceramic frog with a temporal void space in its butt</strong>; the outhouse is the only camera-free zone.',
        'Something about this place <strong>awakens something in Ghost</strong> — he begins spurting obscenities and nonsense with no reasoning. One to watch.',
      ],
      dmOnly: 'The abduction is the payoff of the S6 control-room seed — same Celestial voices, same polling language. Planted S6, delivered S11.'
    },
    {
      num: 'S12', crew: 'c2',
      title: 'A Day With Doc — Mother Sunder Falls',
      where: { label: 'The Celestial Tunnel · The Misty Bog' },
      summary: 'Ghost lights up again and opens a line to the BBC — then <strong>Flint materializes from his beams</strong>, bypassing the studio\'s teleport blocks. With three god-boons running, the party systematically picks Mother Sunder apart; <strong>Killua lands the killing blow at nearly 150 damage in a single turn.</strong> A victory portal opens — and <strong>Kah\'ryn, goddess of suffering and showrunner of <em>A Day With Doc</em></strong>, appears and freezes the party and time itself, ranting that Vay\'hel\'s suffering is far from over. Then a tear in reality opens. <strong>The Hollowed One steps through and impales the goddess on his spiked arm</strong>, holding her aloft as her mouth feigns screams that produce no sound, then flings her corpse aside. Its own crystal-golem form has no mouth — so to be heard on the live galactic broadcast, <strong>it wears a borrowed shape: Crovil</strong>, the Aasimar Veilborn whose fall opened this campaign, one of the untold souls who <em>came to it</em> when the Shattering severed the passage of the dead. In Cro\'s stolen voice it tells Lor — and every watching world — that <strong>she and her wife ended Crovil\'s life after he transformed, never giving him a chance</strong>, then declares the pantheon\'s bridged realities its new road: <em>"The Maw is endless and consumes all... now they have given me access to all realities, so I can bring peace to everyone."</em>',
      moments: [
        'Mid-fight, the Hollowed One brushes Lor\'s mind, curious why she is out of its reach — her neck mark reels in pain.',
        'Lor, paralyzed, hears the monotone voice chuckle: <em>"Oh, there you are."</em>',
        'Parting words to Lor: <em>"I still plan to reunite with you and the other 11. See you soon."</em> A wink, and it slinks into shadow.',
        'A floating room of light appears — panicked Celestial voices within. A tall shadowy figure enters it. <strong>All sound stops as the walls are painted with blood.</strong>',
        'Kah\'ryn\'s death drops the binding runes; <strong>Vay\'hel\'s crystal of plane shift activates</strong> and the party absconds to the BBC.',
      ],
      dmOnly: 'Canon per the 8-23-26 rulings: the base being was female (Bragg\'s "she" stands as history); the entity\'s own form is non-binary — it/they; it is <strong>literally mouthless</strong> and speaks only by wearing captured souls that had mouths. It did not kill or un-name Crovil — <strong>Lor and Ellie did</strong>, and his soul came to it afterward because the Shattering broke the route the dead take. Its arsenal of forms is a population, not a trophy case.'
    },
    {
      num: 'S13', crew: 'c2',
      title: "Space Pirates Can't Get Enough BBC",
      where: { id: 'straleon', label: 'Straleon Approach · BBC Cargo Bay' },
      summary: 'Back aboard, an overwhelmed <strong>Vay\'hel jumps into the pocket dimension inside the ceramic frog</strong>, which the party sets aside. Time dilation from the Celestial Tunnel means what felt like days was <strong>barely a minute here</strong> — the pirates are still descending into the cargo bay. The party rigs a <strong>death trap on both flanks</strong>: grease, oil barrels and fungal entrapment on one side, an oil barrel on the other. The trap springs, the advance stalls, and <strong>HOC.2a puts the pirates down in batches</strong>, picking off stragglers before retreat is even a thought.',
      moments: [
        'A barrel labelled <strong>"MISC"</strong> is ignited mid-fight and turns out to be <strong>arcanite</strong> — nearly blowing a hole in the ship.',
        'Ends on the final pirate falling — <strong>warning klaxons still ringing, the hull badly damaged</strong> from the arcanite blast.',
      ],
      dmOnly: 'The enemy pirate vessel is still out there — 10 life forms as of the S9–10 scan, shields raised. Corno Spezzato\'s response to two destroyed boarding crews is pending.'
    },
  ];

  // C1 sessions are summarized at a higher level since they're history, not played out.
  const C1_LOG = [
    {
      num: 'C1', crew: 'c1',
      title: "The Codex Crew — Field History",
      where: null,
      summary: 'Before the Codex crashed on Velthros, Lor ran with <strong>The Codex Crew</strong>. Their work cuts across the galaxy and left a long ledger of contacts, debts, and enemies. <strong>HOC.2a inherits all of it.</strong>',
      moments: [
        'Worked jobs out of <strong>Rathun · Low Town</strong> for the fixer <strong>Civet</strong> (sketchy human, has burned them before).',
        'Civet handed them the <strong>Hosun Prime tuning-fork</strong> contract — then went cold the moment things got real. Sye-tell and Blue-Sun both attacked the crew en route.',
        'On Hosun Prime they uncovered the secret lab of the Fey noble <strong>Lorutell Cindella,</strong> who was using the <strong>Tuning Key</strong> to torture and experiment on half-elves. A Wood Witch killed her before they could. <strong>Lorutell sent her ship away with more evidence on the fork.</strong>',
        'The <strong>Black Sky Imperium</strong> (TBS) destroyed Hosun Prime to bury the program.',
        'TBS sent the bounty hunter <strong>Talus</strong> after the crew. They met him on <strong>Tosis</strong> first; later he ambushed them en route to Akora. They destroyed his cloaked ship, killed him, salvaged his cloak.',
        'On <strong>Akora,</strong> Prince <strong>Red Solomon</strong> hired them for an infiltration job. They learned ritual magic from his sister <strong>Keira</strong> and got warned about the <strong>Children of the Black Sky</strong> by Keira\'s brother. They later crashed a meeting where Red Solomon was recruiting Court nobles for TBS — he bamf\'d away and his Platinum Guards attacked.',
        'Through <strong>Rin Fortuna</strong> on Akora they reached <strong>Wrath.</strong> Then handed Wrath over to the <strong>Pike Family</strong> on Leztos to settle a debt.',
        'Docked the Codex at <strong>The Spanner</strong> for repairs while ducking Imperial pursuit. Killed three Imperial operatives there. Met <strong>Spry</strong> (only ever a hologram — held captive by the Pikes) and his right-hand man <strong>Spindel</strong> (a clone — <em>Spindel is legion</em>).',
        'Spry sent them to answer a distress call on <strong>Gray Haven.</strong> Met <strong>Lord Faldrick</strong> there. Payment: trade, not creds.',
      ],
      dmOnly: ''
    }
  ];

  const HOOKS = [
    // ============================================================
    // C2 — HOC.2a (current campaign) — always on top
    // ============================================================
    {
      crew: 'c2', urgency: 'normal', kind: 'mission',
      title: "Cure Lor's Hollowed One Mark",
      giver: 'Bragg Mentan',
      location: { id: 'edgewatch-9', label: 'Edgewatch 9' },
      desc: 'The mark on Lor\'s neck is the Hollowed One\'s tether — it constantly broadcasts her location, and in S12 it made direct mental contact through it. <strong>Magebane</strong> is the only known counter. <strong>Three magebane potions brewed</strong> on Gray Haven; Lor is <strong>1 of 4 research sessions</strong> toward mapping a magebane effect onto a coda crystal. Drindle\'s lead: <strong>technomancers in Chromehymn on Straleon</strong> may be able to apply it.'
    },
    {
      crew: 'c2', urgency: 'normal', kind: 'mission',
      title: 'Restore Ellie to a Body',
      giver: null,
      location: null,
      desc: 'Ellie persists as <strong>L.E. within Ghost</strong> — her mind in the shard on Lor\'s necklace, her frame destroyed, her body preserved aboard the BBC. Vale hinted at a <strong>potential Eidolon candidate</strong> who might help re-anchor her — details TBD.'
    },
    {
      crew: 'c2', urgency: 'urgent', kind: 'mission',
      title: 'Hull Critical — And Their Ship Is Still Out There',
      giver: null,
      location: { id: 'straleon', label: 'Straleon Approach' },
      desc: 'The arcanite blast in the cargo bay left the BBC\'s hull <strong>badly damaged, klaxons ringing.</strong> The pirate vessel is still out there — <strong>10 life forms aboard</strong> as of the last scan, shields raised.'
    },
    {
      crew: 'c2', urgency: 'urgent', kind: 'lore',
      title: 'The Hog Father Will Answer',
      giver: null,
      location: null,
      desc: 'Corno Spezzato demanded 80% of the crew\'s take. <strong>Lor chose violence</strong> — and two boarding crews are dead. The syndicate controls this sector, and its response is <strong>pending.</strong>'
    },
    {
      crew: 'c2', urgency: 'normal', kind: 'mission',
      title: 'Zelqua\'s Debt — Deliver Sorrow Yalt',
      giver: 'Zelqua',
      location: null,
      desc: 'The price of her boon: the party owes Zelqua <strong>a return appearance on her show, plus delivery of the acclaimed author Sorrow Yalt</strong> — better known to the crew as their sandwich-fed prisoner, Yarrow Salt.'
    },
    {
      crew: 'c2', urgency: 'normal', kind: 'mission',
      title: 'The Lux Codicants',
      giver: null,
      location: { id: 'straleon', label: 'Straleon' },
      desc: 'Aelyn\'s research lead from the FTL downtime — a thread tied to L.E. on Straleon. Surfaced in S8, <strong>unpursued.</strong>'
    },
    {
      crew: 'c2', urgency: 'normal', kind: 'lore',
      title: 'What Is Aelyn Hiding?',
      giver: null,
      location: null,
      desc: 'On live broadcast, Zelqua insinuated <strong>Aelyn is hiding a great deal from the party and from the world.</strong> Aelyn deflected. The question is now public — and unanswered.'
    },
    {
      crew: 'c2', urgency: 'normal', kind: 'lore',
      title: 'Ghost\'s Glitch',
      giver: null,
      location: null,
      desc: 'Something in the Celestial Tunnel <strong>awakened something in Ghost.</strong> He now spurts obscenities and nonsense with no reasoning — and has demonstrated the ability to <strong>bypass teleportation blocks and pull Flint across planes.</strong> Cause unknown. One to watch.'
    },
    {
      crew: 'c2', urgency: 'normal', kind: 'lore',
      title: 'Veil Titan Dragon — Velthros Wastes',
      giver: null,
      location: { id: 'velthros', label: 'Velthros' },
      desc: 'After the Glassend incident, the Veil Titan Dragon peeled off the fight and disappeared into the desolate wastes of Velthros. <strong>Still out there.</strong>'
    },
    {
      crew: 'c2', urgency: 'normal', kind: 'lore',
      title: 'Karnyx, Eidolon of Achelion',
      giver: 'Bragg Mentan',
      location: { id: 'achelion', label: 'Achelion' },
      desc: 'Confirmed Eidolon. Crowned by the <strong>Leviathan Crown</strong> at the bottom of Achelion\'s trench. Fighting on the wrong side. Will need handling, eventually.'
    },

    // ============================================================
    // C1 — The Codex Crew (carryover threads HOC.2a inherits)
    // ============================================================
    {
      crew: 'c1', urgency: 'urgent', kind: 'mission',
      title: 'TBS Field Test on Akiton',
      giver: null,
      location: { id: 'akiton', label: 'Akiton' },
      desc: 'TBS is reportedly testing an <strong>arcane-sapping superweapon</strong> on Akiton in <strong>~30 days.</strong> A successful firing would render every magic-using being on the planet inert. No public warning. No evacuation order. <em>Inherited from The Codex Crew\'s intel — confirm and act.</em>'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'mission',
      title: 'Find the Lotus',
      giver: 'Spry / Spindel',
      location: { id: 'spanner', label: 'Near The Spanner' },
      desc: 'A ship called <strong>the Lotus</strong> orbits near the Spanner. Lead on an off-book job. (Carryover from The Codex Crew.)'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'mission',
      title: "Inspect Lorutell's Missing Ship",
      giver: null,
      location: null,
      desc: 'Before Hosun Prime was destroyed, Lorutell Cindella <strong>sent her ship away</strong> carrying more evidence on the Tuning Fork/Key program. Still drifting somewhere — recovering it could blow the TBS plot open.'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'mission',
      title: 'Free Spry from the Pike Family',
      giver: null,
      location: { id: 'leztos', label: 'Leztos' },
      desc: 'Spry has been held by the <strong>Pike Family</strong> on Leztos for his hacking skills. He operates only via hologram. Negotiate or rescue.'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'mission',
      title: "Crash Red Solomon's Recruitment Meeting",
      giver: null,
      location: { id: 'akora', label: 'Akora' },
      desc: 'Red Solomon (one of the 9 Princes) is sweeping Court nobles into TBS. Catching him in the act — and exposing the network — is the lever.'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'mission',
      title: 'Bug Red Solomon\'s Office',
      giver: 'Nixx',
      location: { id: 'akora', label: 'Akora' },
      desc: 'A pitch from <strong>Nixx</strong> the chaotic halfling. Read carefully — Nixx is untrustworthy, but Red Solomon is the actual problem.'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'mission',
      title: "Find TBS' 2 Skimming Agents",
      giver: "Keira's brother",
      location: { id: 'akora', label: 'Akora' },
      desc: 'Per Keira\'s brother, <strong>2 TBS-planted agents</strong> are skimming inside Red Solomon\'s operation. Useful leverage — for blackmail, evidence, or recruitment.'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'mission',
      title: 'Save the Sick Farmers of Xernes 5',
      giver: 'Orlion',
      location: { id: 'xernes-5', label: 'Xernes 5' },
      desc: 'Court-funded job from <strong>Orlion</strong> (fancy elf-man, works for the Fey Courts). Cause of the silk-world plague unknown.'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'bounty',
      title: 'Bounty: Stone Giant on Kresh',
      giver: 'Posted bounty',
      location: { id: 'kresh', label: 'Kresh' },
      desc: '<strong>600g</strong> for the kill.'
    },
    {
      crew: 'c1', urgency: 'normal', kind: 'bounty',
      title: 'Bounty: Winged Beast on Tosis',
      giver: 'Posted bounty',
      location: { id: 'tosis', label: 'Tosis' },
      desc: '<strong>500g</strong> for the kill.'
    },
  ];

  const POI = [
  {
    "name": "Vale",
    "crew": "c2",
    "stance": "allied",
    "kind": "Eidolon · Parallax Engine",
    "location": {
      "id": "velthros",
      "label": "Velthros · Glassend"
    },
    "role": "Runs the Glassend starport · helped install the FTL drive",
    "desc": "Eidolon bound to the Parallax Engine. Power vibe: space-stone / tesseract. Gave the party a teleport necklace — activate it to summon her in dire need.",
    "image": "images/portraits/vale.png"
  },
  {
    "name": "Bragg Mentan",
    "crew": "c2",
    "stance": "allied",
    "kind": "Edgekeepers · Leader",
    "location": {
      "id": "edgewatch-9",
      "label": "Edgewatch 9"
    },
    "role": "Old warrior with a warhammer · twin-souled (his own echo twin)",
    "desc": "Delivered the full lore dump on the Veilforging, the Maw, the First Hollow, and the Eidolons. Gave the party magebane intel and a spell engram. Will field further questions and provide boons.",
    "image": "images/portraits/bragg-mentan.png"
  },
  {
    "name": "Z Kint",
    "crew": "c2",
    "stance": "allied",
    "kind": "Edgekeepers · Breach Warden",
    "location": {
      "id": "edgewatch-9",
      "label": "Edgewatch 9"
    },
    "role": "Old acquaintance of Killua's",
    "desc": "Doesn't mince words. Made the introductions to Bragg.",
    "image": "images/portraits/zephra-kint.png"
  },
  {
    "name": "Dr. Ilex Vor",
    "crew": "c2",
    "stance": "allied",
    "kind": "Edgekeepers · Biotech",
    "location": {
      "id": "edgewatch-9",
      "label": "Edgewatch 9"
    },
    "role": "P.L.U.G. specialist",
    "desc": "Installed the party's P.L.U.G. implants — biohacking devices that close Null rifts and let users push past biological limits.",
    "image": "images/portraits/dr-ilex-vor.png"
  },
  {
    "name": "Lord Faldrick",
    "crew": "c2",
    "stance": "allied",
    "kind": "Civic · Gray Haven",
    "location": {
      "id": "gray-haven",
      "label": "Gray Haven"
    },
    "role": "Ruler of Gray Haven",
    "desc": "Coordinated the party's magebane harvest. Has a vested interest in Spry/Spindel of the Spanner.",
    "image": "images/portraits/lord-faldrick.png"
  },
  {
    "name": "Spry",
    "crew": "c1",
    "stance": "captive",
    "kind": "Black Market Operator",
    "location": {
      "id": "spanner",
      "label": "The Spanner (operates from)"
    },
    "role": "Black-market dealer · weapons / armor / curios — operates only via hologram",
    "desc": "Currently held captive by the <strong>Pike Family</strong> on Leztos for his hacking skills. Does not accept credits — trade or info only. Sent the Codex Crew to Gray Haven for a distress call."
  },
  {
    "name": "Spindel",
    "crew": "c1",
    "stance": "allied",
    "kind": "Spry's Right Hand",
    "location": {
      "id": "spanner",
      "label": "The Spanner"
    },
    "role": "Clone — <em>Spindel is legion</em>",
    "desc": "Buys the drinks. Good dude. Most recent contact: Aurora Spindel."
  },
  {
    "name": "Keira",
    "crew": "c1",
    "stance": "friendly",
    "kind": "Ritual Magic Teacher",
    "location": {
      "id": "akora",
      "label": "Akora"
    },
    "role": "Sister of Red Solomon (NOT aligned with him)",
    "desc": "The Codex Crew learned ritual spells from her. Her brother (separate from Red Solomon) warned of the Children of the Black Sky and is helpful intel-wise."
  },
  {
    "name": "Cae",
    "crew": "c2",
    "stance": "allied",
    "kind": "Fragment Consciousness",
    "location": null,
    "role": "Currently lives inside the cracked shard on Lor's necklace",
    "desc": "Pulled the party out of a collapsing weave construct in S0. Trained on the Codex's old AI systems — can run scanners, maps, and the articulating arm."
  },
  {
    "name": "L.E. (Ellie)",
    "crew": "c2",
    "stance": "allied",
    "kind": "Persisting Presence · Within Ghost",
    "location": null,
    "role": "Lor's wife · persists within GHOST-17X and speaks through him",
    "desc": "<strong>L.E. and Ellie are one and the same</strong> — Lor's wife. Though her frame was destroyed, she persists within Ghost and speaks through him; <strong>her mind rides in the shard on Lor's necklace.</strong> Her prime function endures: to <strong>record, with safeguards to never forget</strong> — she still knows who Lor is. Her proximity to a weave conflux during a training drift triggered the surge that pulled HOC.2a into Lor's reality in S0. Bragg flagged Ghost as <em>\"something more than he appears.\"</em>"
  },
  {
    "name": "Rex",
    "crew": "c2",
    "stance": "friendly",
    "kind": "Tavern Keeper · Dusty Star",
    "location": {
      "id": "velthros",
      "label": "Velthros · Glassend"
    },
    "role": "Long-suffering target of Killua's pranks via Asra",
    "desc": "Friendly. Mostly."
  },
  {
    "name": "Pip",
    "crew": "c2",
    "stance": "friendly",
    "kind": "Local Kid · Trainee Archer",
    "location": {
      "id": "velthros",
      "label": "Velthros · Glassend"
    },
    "role": "Practices sneak-attacks on Lor (with a training bow)",
    "desc": "Catches Lor off guard sometimes. Catches arrows out of the air about half the time.",
    "image": "images/portraits/pip.png"
  },
  {
    "name": "Amarante",
    "crew": "c2",
    "stance": "friendly",
    "kind": "Tiefling · Aboard the BBC",
    "location": null,
    "role": "Sultry ex-barmaid of the Spit N' Swallow · loves the Blue Harvest novels",
    "desc": "Joined the crew in S8 after the staged \"apocalypse\" evac during the Sorrow Yalt meet & greet con — she believes HOC.2a saved her life. Aboard the BBC since.",
    "image": "images/portraits/amarante.png"
  },
  {
    "name": "Drindle",
    "crew": "c2",
    "stance": "friendly",
    "kind": "Alchemist · \"Not a Slave\"",
    "location": null,
    "role": "Refined the party's magebane into three potions · aboard the BBC",
    "desc": "Recruited off Gray Haven via the same staged-apocalypse con as Amarante. Flint is <strong>4 of 7 days</strong> into renovating an alchemy lab for him. His lead sent the party toward the <strong>technomancers of Chromehymn on Straleon</strong> for Lor's mark.",
    "image": "images/portraits/grindle-mossvein.png"
  },
  {
    "name": "Drundar",
    "crew": "c2",
    "stance": "friendly",
    "kind": "Lesser God · Power",
    "location": null,
    "role": "Boar-god of the power conduits · Celestial Tunnel",
    "desc": "A massive boar-man whose muscles have muscles. Killua beat him in a physique competition through finesse, grace and machismo — and won not just the crowd but Drundar himself. <strong>Boon granted.</strong>"
  },
  {
    "name": "Vantros",
    "crew": "c2",
    "stance": "friendly",
    "kind": "Lesser God · Probability",
    "location": null,
    "role": "God of bureaucracy · Celestial Tunnel",
    "desc": "Grants boons to grievances filed <em>correctly</em>. Ghost caught the trap in the paperwork — a witness line requiring someone never declared deceased. The loophole: Vay'hel, who never died. She looped. <strong>Grievance ratified, boon granted.</strong>"
  },
  {
    "name": "Zelqua",
    "crew": "c2",
    "stance": "job-giver",
    "kind": "Lesser God · Life / Death",
    "location": null,
    "role": "God of gossip · Celestial Tube talk-show host",
    "desc": "A knack for making guests spill the tea — and the party spilled ALL of it once she recognized Killua as the living inspiration for <em>Blue Harvest</em>. Boon granted, but <strong>a debt stands: a return appearance, plus delivery of the acclaimed author Sorrow Yalt.</strong> She also insinuated on-air that <strong>Aelyn is hiding a great deal</strong> from the party and the world."
  },
  {
    "name": "Orlion",
    "crew": "c1",
    "stance": "job-giver",
    "kind": "Fey Court · Recruiter",
    "location": {
      "id": "xernes-5",
      "label": "Xernes 5 (job posting)"
    },
    "role": "Fancy elf-man who works for the Courts",
    "desc": "Posted the Court-funded job to help cure the sick farmers of Xernes 5."
  },
  {
    "name": "Nicola",
    "crew": "c1",
    "stance": "friendly",
    "kind": "T'salamari Mechanic",
    "location": {
      "id": "rathun",
      "label": "Rathun · Lucky Day garage"
    },
    "role": "Runs the Lucky Day garage",
    "desc": "Reliable. Doesn't ask too many questions."
  },
  {
    "name": "Chopper",
    "crew": "c1",
    "stance": "friendly",
    "kind": "T'salamari Mechanic / Hacker",
    "location": null,
    "role": "Long-time friend",
    "desc": "Helped the Codex Crew find Wrath."
  },
  {
    "name": "Rin Fortuna",
    "crew": "c1",
    "stance": "mercenary",
    "kind": "Half-Elf Gambler",
    "location": {
      "id": "akora",
      "label": "Akora"
    },
    "role": "Fixer for high-stakes meetings",
    "desc": "The Codex Crew gambled with him — and lied to him — to set up the meeting with Wrath."
  },
  {
    "name": "Yarrow Salt",
    "crew": "c2",
    "stance": "captive",
    "kind": "Suso Bruiser · Romance Novelist",
    "location": null,
    "role": "Currently held aboard the BBC",
    "desc": "Acquired on Velthros after a series of escalating humiliations. A sandwich-fed prisoner doubling as the secret author of the galaxy-famous <em>Blue Harvest</em> series (pen name: <strong>Sorrow Yalt</strong>). Sandwich rations halved when 5p0r3 found out about the side career. <strong>Now owed to Zelqua</strong> — the party promised to deliver him to her talk show. Killua's S11 sponsor box was signed <em>\"Y.S. ;)\"</em>",
    "image": "images/portraits/yarrow-salt.png"
  },
  {
    "name": "Civet",
    "crew": "c1",
    "stance": "untrustworthy",
    "kind": "Sketchy Fixer",
    "location": {
      "id": "rathun",
      "label": "Rathun · Low Town"
    },
    "role": "Job broker for The Codex Crew",
    "desc": "Burned the Codex Crew on the last contract. Gave them the Hosun Prime tuning-fork job and now wants nothing to do with them or the fork. Likely routes work for TBS without saying so out loud."
  },
  {
    "name": "Nixx",
    "crew": "c1",
    "stance": "untrustworthy",
    "kind": "Chaotic Halfling",
    "location": {
      "id": "akora",
      "label": "Akora"
    },
    "role": "Job broker · low-trust",
    "desc": "Wanted the Codex Crew to bug Red Solomon's office. Crazy/chaotic — read carefully before agreeing to anything she asks for."
  },
  {
    "name": "The Hollowed One / First Hollow",
    "crew": "both",
    "stance": "hostile",
    "kind": "Apex Threat",
    "location": {
      "id": "maw",
      "label": "The Maw"
    },
    "role": "Formerly the First Warden of Silence — the woman the Twelve left to watch the cage",
    "desc": "A regal, lumbering crystalline titan with a smooth, hollow face and a crown of dead light. Its own form is neither he nor she — <strong>it has no mouth and literally cannot speak</strong>; to be heard, it wears a captured soul that had one. The Shattering severed the passage of the dead, and <strong>untold stranded souls came to it</strong> — every one a potential face and voice. <strong>Cuts wounds in the Veil from the inside.</strong> Marked Lor in S0; made direct mental contact in S12, then <strong>impaled the goddess Kah'ryn on live galactic broadcast</strong>, spoke through Crovil's stolen shape, and declared the pantheon's bridged realities its road to every world: <em>\"I still plan to reunite with you and the other 11.\"</em> Does not dream. <em>Un-names.</em>",
    "image": "images/portraits/the-hollowed-one.png"
  },
  {
    "name": "Karnyx",
    "crew": "c2",
    "stance": "hostile",
    "kind": "Eidolon · Leviathan Crown",
    "location": {
      "id": "achelion",
      "label": "Achelion"
    },
    "role": "Cult-king of the trench",
    "desc": "Once a giant crab. Crowned by the Leviathan Crown when the abyss answered Achelion's shattered skyways. Now rules a drowned cult-state. Confirmed by Bragg as fighting on the wrong side."
  },
  {
    "name": "Red Solomon",
    "crew": "c1",
    "stance": "hostile",
    "kind": "9 Princes · TBS Asset",
    "location": {
      "id": "akora",
      "label": "Akora"
    },
    "role": "Tall, handsome tiefling · 1 of the 9 Princes",
    "desc": "In cahoots with the Black Sky Imperium. Recruiting Court nobles to TBS. Working on a planet-scale arcane-sapping weapon. Caught The Codex Crew crashing his meeting — bamf'd away and unleashed his two Platinum Guards."
  },
  {
    "name": "The Pike Family",
    "crew": "c1",
    "stance": "hostile",
    "kind": "Crime Syndicate",
    "location": {
      "id": "leztos",
      "label": "Leztos"
    },
    "role": "Holds the Leztos docks",
    "desc": "Currently holding Spry prisoner for his hacking skills. The Codex Crew handed over <strong>Wrath</strong> to settle a debt. Currently feuding hard with the Red Hand — they had their slip-stream stolen."
  },
  {
    "name": "The Red Hand",
    "crew": "c1",
    "stance": "unknown",
    "kind": "Crime Syndicate",
    "location": {
      "id": "leztos",
      "label": "Leztos"
    },
    "role": "Pike rivals",
    "desc": "Recently stole the Pike family's slip-stream. War escalating."
  },
  {
    "name": "Sye-tell",
    "crew": "c1",
    "stance": "hostile",
    "kind": "Hacker",
    "location": null,
    "role": "Powerful hacker · human woman",
    "desc": "Attacked The Codex Crew en route to the tuning fork job, trying to steal it."
  },
  {
    "name": "Blue-Sun",
    "crew": "c1",
    "stance": "hostile",
    "kind": "Bounty Hunter",
    "location": null,
    "role": "???",
    "desc": "Attacked The Codex Crew en route to Hosun Prime."
  },
  {
    "name": "Ellie",
    "crew": "c1",
    "stance": "deceased",
    "kind": "Mechanical · Imaginarium-Bound",
    "location": null,
    "role": "Lor's wife · pilot of the original Codex · The Codex Crew's AI",
    "desc": "An <strong>AI with a soul</strong> — originally bodiless — who served as The Codex Crew's shipboard intelligence. The crew built her a mechanical frame and bound her soul to it by setting the <strong>Imaginarium</strong> veilshard into the body. Her frame was destroyed in the chaos immediately after the Shattering — Ellie leapt in front of the transformed Cro's radiant beam to shield Lor. The Imaginarium then moved from Ellie's frame to Lor's runes, making Lor the new Imaginarium-bound Eidolon. Body preserved aboard the Codex — but Ellie is not gone: <strong>she persists as L.E. within Ghost</strong>, her mind in the shard on Lor's necklace. <strong>Restoring her to a body is an open quest.</strong>"
  },
  {
    "name": "Cro (Crystal Titan)",
    "crew": "c1",
    "stance": "deceased",
    "kind": "Veil-Mutated",
    "location": null,
    "role": "Original Codex Crew member — buff, handsome elven man",
    "desc": "Transformed mid-jump prep when Veilshard crystals burst from his flesh. As a Crystal Titan he fired the radiant beam that felled Ellie's frame — and <strong>Lor and Ellie ended his life immediately after he transformed, without giving him a chance.</strong> Because the Shattering severed the passage of the dead, <strong>his soul was among the first to come to the Hollowed One</strong> — which now wears his shape when it needs a mouth, as it did on live broadcast in S12. The party recovered his coda crystal core."
  },
  {
    "name": "Chaddeus",
    "crew": "c2",
    "stance": "deceased",
    "kind": "Court of Light · High Adjudicator",
    "location": {
      "id": "velthros",
      "label": "Velthros · Glassend"
    },
    "role": "Twin to Thaddeus",
    "desc": "Stripped of his magic by Lor's magebane arrow. Felled by Lor in S4. <strong>Corpse erupted in arcane fire.</strong>",
    "image": "images/portraits/aurelian-twins.png"
  },
  {
    "name": "Thaddeus",
    "crew": "c2",
    "stance": "deceased",
    "kind": "Court of Light · High Adjudicator",
    "location": {
      "id": "velthros",
      "label": "Velthros · Glassend"
    },
    "role": "Twin to Chaddeus",
    "desc": "5p0r3 overloaded his cells with necrotic mycelium reacting against his radiant essence. <strong>His head exploded.</strong> Headless body preserved in mycelium cocoon, currently in Codex cold storage.",
    "image": "images/portraits/aurelian-twins.png"
  },
  {
    "name": "Talus",
    "crew": "c1",
    "stance": "deceased",
    "kind": "TBS Bounty Hunter",
    "location": null,
    "role": "Forboding · had a cloaked ship · part-robot",
    "desc": "First met on Tosis. Ambushed The Codex Crew en route to Akora. They destroyed his cloaked ship, killed him, salvaged his cloak, kept his robot parts."
  },
  {
    "name": "Lorutell Cindella",
    "crew": "c1",
    "stance": "deceased",
    "kind": "Fey Noble",
    "location": {
      "id": "hosun-prime",
      "label": "Hosun Prime (destroyed)"
    },
    "role": "Children of the Black Sky · ran the secret half-elf experiment lab",
    "desc": "Used the Tuning Key to torture and experiment on half-elves. Killed by a Wood Witch. <strong>Sent her ship away with more evidence on the fork before she died — still drifting.</strong>"
  },
  {
    "name": "Wrath",
    "crew": "c1",
    "stance": "unknown",
    "kind": "Captured · Held by Pikes",
    "location": {
      "id": "leztos",
      "label": "Leztos"
    },
    "role": "???",
    "desc": "The Codex Crew gambled with Rin Fortuna to set up a meeting with Wrath. Then turned Wrath over to the Pike family to settle a debt. Status unknown."
  },
  {
    "name": "Mother Sunder",
    "crew": "c2",
    "stance": "deceased",
    "kind": "Arch Hag · A Day With Doc",
    "location": null,
    "role": "The bog witch of Vay'hel's loop — 12 feet of speed and overwhelming force",
    "desc": "Slaughtered the entire party in seconds on their arrival — the \"pilot episode\" treatment. With three god-boons and the element of surprise, HOC.2a systematically picked her apart on the rematch. <strong>Killua landed the killing blow at nearly 150 damage in a single turn.</strong>"
  },
  {
    "name": "Kah'ryn",
    "crew": "c2",
    "stance": "deceased",
    "kind": "Goddess of Suffering · Showrunner",
    "location": null,
    "role": "Ebony-winged showrunner of <em>A Day With Doc</em> — the Celestial Tunnel's highest-rated show",
    "desc": "Froze the party and time itself to declare Vay'hel's suffering far from over — then <strong>the Hollowed One stepped out of a tear in reality and impaled her on its spiked arm</strong>, on her own broadcast, holding her aloft as her mouth feigned screams that made no sound. Her death dropped the binding runes and freed the party's escape."
  },
  {
    "name": "The Producers (Celestial Tunnel)",
    "crew": "c2",
    "stance": "unknown",
    "kind": "Broadcast Operation",
    "location": null,
    "role": "The voices behind the scrying eyes — framing HOC.2a's adventures as content",
    "desc": "The scrying eyes on Gray Haven were theirs. In S11 they abducted four of the party onto <em>A Day With Doc</em> (<em>\"The Brown one has not been polling well, leave him behind\"</em>). In S12, a floating room of light appeared near the bog — panicked Celestial voices within — until a tall shadowy figure entered and <strong>all sound stopped as the walls were painted with blood.</strong> Current status of the production: unknown."
  },
  {
    "name": "Velthros Veil Titan",
    "crew": "c2",
    "stance": "hostile",
    "kind": "Veil Titan · Chromatic Wyrm",
    "location": {
      "id": "velthros",
      "label": "Velthros · Wastes"
    },
    "image": "images/portraits/velthros-veil-titan.png",
    "role": "Prismatic dragon — peeled away from the Glassend incursion",
    "desc": "Emerged in Glassend square during the S1 Null incursion. Peeled away from the fight and disappeared into the desolate wastes of Velthros. <strong>Still out there.</strong> Faction: Wild. Shardmarks: Prismatic."
  },
  {
    "name": "Glassend Fractured",
    "crew": "c2",
    "stance": "hostile",
    "kind": "Veilbeast Horde",
    "location": {
      "id": "velthros",
      "label": "Velthros · Glassend"
    },
    "image": "images/portraits/fractured-horde.png",
    "role": "Fully Fractured humanoids · crystallized hostiles",
    "desc": "Pink-crystal Fractured horde encountered during the Glassend incursion. Mostly mindless. Driven by Maw-proximity bleed-through. Encountered as ambient threat across the city — slain in waves."
  },
  {
    "name": "Vale's Eidolon Form",
    "crew": "c2",
    "stance": "eidolon",
    "kind": "Parallax Engine · Revealed Form",
    "location": {
      "id": "velthros",
      "label": "Velthros · Glassend"
    },
    "image": "images/portraits/vale-eidolon.png",
    "role": "Vale's true form — a crystalline starlit Eidolon",
    "desc": "Revealed in S3 mid-battle to save Aelyn and turn the tide against the Aurelian Twins. A towering crystalline figure threaded with constellations, bearing a crescent staff and floating shard. Power vibe: <strong>space-stone / tesseract.</strong> Confirmed Eidolon by Bragg in S5 — bound to the Parallax Engine."
  },
  {
    "name": "The Watchers (Scrying)",
    "crew": "c2",
    "stance": "unknown",
    "kind": "Unknown Observers",
    "location": null,
    "role": "Sending scrying eyes",
    "desc": "Multiple scrying eyes followed the party on Gray Haven. Origin unknown to the party. Source <strong>does not appear local.</strong>"
  }
];

  const FACTIONS = [
    {
      name: 'The Edgekeepers',
      stance: 'allied',
      blurb: 'The rim\'s self-appointed guard against the Null and the wounds in the Veil. Old, undermanned, undeniably right.',
      details: [
        'Operate <strong>P.L.U.G.</strong> protocol biohacks (close Maw rifts, push past biological limits)',
        'Distribute <strong>spell engrams</strong> — one-time coda-crystal items that permanently re-shape spells',
        'Confirm Eidolons in the field',
        'Lor confirmed Imaginarium-bound; Vale confirmed Parallax Engine; Karnyx confirmed hostile (Leviathan Crown)',
      ],
      members: ['Bragg Mentan (Leader)', 'Z Kint (Breach Warden)', 'Dr. Ilex Vor (Biotech)']
    },
    {
      name: 'The Black Sky Imperium (TBS)',
      stance: 'hostile',
      blurb: 'The dominant Mid-Reach empire. Cyclopean, surveillance-driven, cloned, efficient. <strong>Emotion is a liability. Efficiency is god.</strong>',
      details: [
        'Driving the <strong>Tuning Fork / Tuning Key</strong> plot',
        'Developing an <strong>arcane-sapping superweapon</strong> — field test on Akiton in ~30 days',
        'Sent the bounty hunter <strong>Talus</strong> after The Codex Crew (killed)',
        '<strong>Destroyed Hosun Prime</strong> outright to bury the fork program',
        'In cahoots with <strong>Red Solomon</strong> of Akora',
        'Imperial enforcers active across the Outer Reach (3 killed at the Spanner)',
      ],
      members: ['Red Solomon (asset)', 'Lorutell Cindella (deceased)', 'Talus (deceased)']
    },
    {
      name: 'Children of the Black Sky',
      stance: 'hostile',
      blurb: 'Fanatical cult that believes the elves are NOT perfect — that they must continue to <em>evolve</em> toward the godhood their ancestors achieved. Well-funded. Brutal tactics. Will kill innocents.',
      details: [
        '<strong>Sworn enemy of the Court of Light</strong>',
        'Possibly bankrolled Lorutell Cindella\'s lab',
        'Wants to use the Tuning Fork to "ascend"',
        'Made up of all races — not an elven supremacy cult, despite the obsession',
        'Working with Red Solomon to sway Court nobles into the parent Imperium',
      ],
      members: ['Lorutell Cindella (deceased)', '(Possibly) Red Solomon']
    },
    {
      name: 'The Court of Light',
      stance: 'hostile',
      blurb: 'The Inner Rim\'s Aurelia-seated Fey Court of Aurelion the Radiant Sovereign. Justice incarnate — and merciless beauty. <strong>Currently has the Codex crew flagged.</strong>',
      details: [
        'Sworn enemy of the Children of the Black Sky',
        'Will know Chaddeus &amp; Thaddeus failed in Glassend',
        'Has Velthros Moon footage of the Codex',
        'Heat is high — they have the party flagged for FTL theft and the killing of two of their enforcers',
      ],
      members: ['Chaddeus (deceased)', 'Thaddeus (deceased)']
    },
    {
      name: 'The Fey Courts (broader)',
      stance: 'neutral',
      blurb: 'The Inner Rim\'s thirteen god-blooded planets and their ruling Fey Houses. Each Court embodies one Prime Domain. <strong>Court politics are religious politics.</strong>',
      details: [
        'Court of Sovereignty (Oratoria Prime · Virex)',
        'Court of Light (Aurelia · Aurelion) — currently HOSTILE to party',
        'Court of Shadows (Nyxara · Nyxara)',
        'Court of Ash and War (Ignara · Tharok)',
        'Court of Bloom (Verdantia · Elyndra)',
        'Court of Lunar Time (Nocturna · Solun)',
        'Court of Storms (Zephyros · Kaelith)',
        'Court of Sacred Passage (Eos · Morvane)',
        'Court of Stars and Thought (Crius · Xyphos)',
        'Court of Resonance (Echo · Velmora)',
        'Court of Sunsteel (Titania · Draxil)',
        'Court of Beasts (Voga · Sylphae)',
        'The Masked Court / Court of Mirrors (Illureth · ???)',
      ],
      members: ['Orlion (Court agent · friendly)']
    },
    {
      name: 'The 9 Princes of Akora',
      stance: 'neutral',
      blurb: 'The ruling cabal of Akora — the Outer Rim\'s "Las Vegas" world with eight themed pleasure districts modeled on the Nine Hells.',
      details: [
        'Low Imperial presence makes Akora a discreet venue for high-stakes deals',
        'Red Solomon — confirmed TBS asset — is one of the 9',
        'Other Princes\' alignments unclear',
      ],
      members: ['Red Solomon (HOSTILE · TBS)']
    },
    {
      name: 'The Pike Family',
      stance: 'hostile',
      blurb: 'A crime family on Leztos. Holds the docks. Holds Spry.',
      details: [
        'Currently holding Spry prisoner for his hacking skills',
        'The Codex Crew settled a debt by handing over Wrath',
        'Recently had their slip-stream stolen by the Red Hand — feud is escalating',
      ],
      members: []
    },
    {
      name: 'The Red Hand',
      stance: 'unknown',
      blurb: 'A crime family on Leztos. Pike rivals. Currently in escalating cold war with them.',
      details: [
        'Recently stole the Pike family\'s slip-stream',
      ],
      members: []
    },
    {
      name: 'The Maw / The Hollowed One / The Null',
      stance: 'hostile',
      blurb: 'The cage-realm of the Thirteenth Primordial. The First Hollow cuts wounds in the Veil from the inside. The Null march through them. <strong>They do not conquer. They erase.</strong>',
      details: [
        'The Hollowed One marked Lor in S0 — and made direct mental contact through the mark in S12',
        'Null soldiers attacked Glassend (S1) — left no bodies, only collapsed uniforms',
        'The Shattering severed the passage of the dead — <strong>untold stranded souls came to the Hollowed One</strong>, each a potential face and voice for its mouthless form',
        'S12: killed the goddess Kah\'ryn on her own broadcast, spoke through Crovil\'s stolen shape, and declared the pantheon\'s bridged realities its road: <em>"access to all realities"</em>',
        'Intends to "reunite" with Lor <strong>and the other 11</strong> — it counts itself among the thirteen',
        'Magebane is the only known counter to a Hollowed One mark',
        '<em>(Bragg Mentan delivered the full lore — see Edgewatch 9 dossier)</em>',
      ],
      members: ['The First Hollow', 'The Null (legion)']
    },
    {
      name: 'Corno Spezzato',
      stance: 'hostile',
      blurb: 'A regional crime syndicate running a protection racket across this stretch of the Outer Rim, under the boss-name <strong>the Hog Father.</strong>',
      details: [
        'Decloaked and EMP\'d the BBC on the Straleon approach (S8), demanding <strong>80% of the crew\'s most recent take</strong>',
        '<strong>Lor chose violence.</strong> Two boarding crews destroyed across S9–13',
        'Their vessel is still out there — 10 life forms aboard, shields raised',
        '<strong>Syndicate response pending.</strong> HOC.2a now has a name and a target on it',
      ],
      members: ['The Hog Father (boss)']
    },
    {
      name: 'The Celestial Tunnel / The Pantheon\'s Production',
      stance: 'unknown',
      blurb: 'A plaything built by the pantheon\'s hubris — <strong>all known realities bridged</strong> so the gods could watch adventures as content from their celestial plane.',
      details: [
        '<em>A Day With Doc</em> was its highest-rated show — Vay\'hel\'s 72-hour loop, run for 50 seasons (~500 years)',
        'Lesser gods frequent it: <strong>Drundar (power), Vantros (probability), Zelqua (life/death)</strong> — all three boons currently carried by the party',
        'Showrunner <strong>Kah\'ryn is dead</strong>, murdered by the Hollowed One on her own broadcast; the producers\' room was painted with blood',
        'The bridge the gods built is now <strong>the Hollowed One\'s declared road to every reality</strong>',
        'Outstanding: Zelqua\'s debt (return appearance + Sorrow Yalt); boon duration outside the Tunnel unestablished',
      ],
      members: ['Kah\'ryn (deceased)', 'Drundar', 'Vantros', 'Zelqua', 'The Producers (status unknown)']
    },
    {
      name: "Spry / Spindel Network",
      stance: 'allied',
      blurb: 'The black-market network operating out of (and around) The Spanner. Discreet. Trade-based. Has reach.',
      details: [
        'Spry only ever appears as a hologram — actual body held by the Pike Family',
        'Spindel is a clone — there are many ("Spindel is legion")',
        'Vested interest in Gray Haven and its inhabitants',
        'Does not accept credits — trade or info only',
      ],
      members: ['Spry (CAPTIVE)', 'Spindel (and its many clones, incl. Aurora Spindel)']
    },
  ];

  // DM-only entries that should NOT show to players unless DM Mode is on.
  // These are appended to the relevant tabs only when state.dmMode === true.
  const POI_DM = [
    {
      name: 'The Watchers — Inside the Weave',
      crew: 'c2', stance: 'unknown', kind: 'Broadcast Operation',
      location: null,
      role: 'A control room aboard a ship located inside the Weave itself',
      desc: 'Flint counter-scryed the watchers and saw a busy room of headset-wearing operators in front of dozens of monitors broadcasting adventures across the galaxy. One monitor showed his own party. Audio: <em>"They are perfect, they will be stars."</em> Confirmed tied to <strong>Kah\'ryn,</strong> goddess of Suffering / Recursion / Narrative Loops and showrunner of <em>A Day With Doc</em> — <strong>now dead by the Hollowed One\'s hand (S12).</strong>',
    },
  ];

  const HOOKS_DM = [
    {
      crew: 'c2', urgency: 'normal', kind: 'lore',
      title: 'The Broadcast Operation — Seed Delivered',
      giver: null,
      location: { id: 'gray-haven', label: 'Gray Haven (counter-scry)' },
      desc: '<strong>Planted S6, paid off S11</strong> — the same Celestial voices and polling language abducted four PCs onto <em>A Day With Doc</em>. Kah\'ryn (the showrunner) is dead by the Hollowed One\'s hand; the producers\' room was painted with blood in S12. <strong>Status of the production, and of the Celestial Tunnel itself, is now an open question.</strong>'
    },
  ];

  // ============================================================
  // CREW — HOC.2a player characters (and the fallen)
  // image paths are relative; portraits live in images/portraits/
  // status: 'active' or 'fallen'
  // ============================================================
  const CREW = [
    {
      name: 'Lor',
      fullName: 'Lorcedes',
      pronouns: 'she/her',
      species: 'Tiefling (Veilborn)',
      class: 'Imaginarium Eidolon · Codex Survivor',
      tagline: 'Two years curled around her dead wife, jacked into the Codex replaying memories. Now bears the Hollowed One\'s mark — and the Imaginarium veilshard.',
      image: 'images/portraits/lor.png',
      status: 'active',
      order: 1,
    },
    {
      name: 'Killua',
      pronouns: '',
      species: 'Syralith',
      class: 'Fighter 4 / Paladin 10 (Echo Knight)',
      tagline: 'Noble. Echo-walker. Goes shirtless to short-circuit guards. Sends his sister Asra to torment tavern keepers for sport.',
      image: 'images/portraits/killua.png',
      altImage: 'images/portraits/killua-echo-sheath.png',
      altLabel: 'Echo Sheath',
      status: 'active',
      order: 2,
    },
    {
      name: 'Aelyn Vox',
      pronouns: '',
      species: 'Variant Human (Defective Triune Clone)',
      class: 'Bonded to L.E. + GHOST-17X',
      tagline: 'Bonded to the Luminous Engine. Defective by design — and that\'s the only reason they\'re free. Counterspells dimension doors mid-cast.',
      image: 'images/portraits/aelyn-vox.png',
      status: 'active',
      order: 3,
    },
    {
      name: 'Flint D. McCoy',
      pronouns: '',
      species: 'TBD',
      class: 'TBD',
      tagline: 'Cybernetic right arm. Mystic tattoos that pulse when the Weave thins. Quick thinking and a knack for ramshackle metalwork — built a prison around fleeing fey adjudicators in seconds.',
      image: 'images/portraits/flint-mccoy.png',
      status: 'active',
      order: 4,
    },
    {
      name: '5p0r3',
      pronouns: '',
      species: 'Myco-Synthetic Ascendant',
      class: 'Cleric 14',
      tagline: 'Sentient mycelium that bonded to a wireless module to save its scientist mentor. Smiles like a terminator. Preserves enemies in mycelium cocoons "just in case."',
      image: 'images/portraits/5p0r3.png',
      status: 'active',
      order: 5,
    },
    {
      name: 'Ellie',
      fullName: 'L.E.',
      pronouns: 'she/her',
      species: 'Mechanical · Imaginarium-Bound',
      class: 'The Codex Crew · Lor\'s Wife',
      tagline: 'Originally bodiless — the Codex Crew built her a frame and bound her soul to it with the Imaginarium veilshard. Killed by Cro mid-Shattering. Body preserved aboard the Codex. The party hunts an Eidolon who can resurrect her.',
      image: 'images/portraits/ellie.png',
      status: 'fallen',
      order: 6,
    },
    {
      name: 'Cro',
      fullName: 'Cro (Crystal Titan)',
      pronouns: '',
      species: 'Veil-Mutated',
      class: 'The Codex Crew · Killed Ellie',
      tagline: 'Died two years post-Shattering. Relived in S0 — the drift replayed his fall. The crystal titan that struck the killing blow against Ellie before falling himself.',
      image: 'images/portraits/cro.png',
      status: 'fallen',
      order: 7,
    },
  ];

  // ============================================================
  // RACES — species of the known galaxy
  // image paths: images/races/{slug}.jpg
  // rim: 'inner' | 'mid' | 'outer' (for color theming)
  // ============================================================
  const RACES = [
    {
      name: 'Aurelians',
      slug: 'aurelians',
      glyph: '☀',
      homeworld: 'Echo (Inner Rim)',
      rim: 'inner',
      bio: 'Gold-skinned humanoids with radiant veins, sun-etched tattoos, and blazing pupils. Born naturally; lifespans long but not eternal.',
      role: 'Priest-guardians of holy light, bodyguards to high lords, wandering philosopher-monks.',
      abilities: [
        '<strong>Solar Infusion:</strong> Imbue an ally\'s weapon or body with radiant energy.',
        '<strong>Shield of Light:</strong> Reaction to shield ally from radiant/necrotic damage.',
        '<strong>Ascendant Pulse:</strong> Burst healing around self (1/day).',
      ],
      notes: 'Live with purpose — or collapse from internal guilt.',
    },
    {
      name: 'Syralith',
      slug: 'syralith',
      glyph: '✨',
      homeworld: 'Aurelia (Inner Rim)',
      rim: 'inner',
      bio: 'Ethereal, radiant humanoids with semi-luminous skin, glass-like eyes, and flowing hair like starlight. Engineered by Fey scientists; emerge fully mature.',
      role: 'Diplomats, artists, royal companions. Their performances sway politics.',
      abilities: [
        '<strong>Emotional Mirror:</strong> Reflect back the emotions of others, subtly influencing them.',
        '<strong>Glimmerform:</strong> Appear slightly blurred or idealized; advantage on Cha (Deception/Persuasion) once per rest.',
        '<strong>Resonant Voice:</strong> Cast Command or Calm Emotions (1/long rest).',
      ],
      notes: 'Beneath beauty, some are master manipulators.',
    },
    {
      name: 'Quorix',
      slug: 'quorix',
      glyph: '💎',
      homeworld: 'Veloria (Midreach)',
      rim: 'mid',
      bio: 'Silicon-based lifeforms — crystalline lattice and internal harmonic resonance. Glow softly with inner memory-light.',
      role: 'Builders of impossible architecture, keepers of planetary memory, ritual harmonics.',
      abilities: [
        '<strong>Harmonic Echo:</strong> Subsonic tones to calm, communicate, or fracture crystal/metal.',
        '<strong>Memory Engram:</strong> Store sensory experiences like recordings; transfer to willing minds.',
        '<strong>Fractureform:</strong> Harden skin to stone, gaining temporary damage resistance.',
      ],
      notes: 'Ancient race. Their ruins hum even in death.',
    },
    {
      name: 'Krylix',
      slug: 'krylix',
      glyph: '🕷',
      homeworld: 'Drexigar (Midreach)',
      rim: 'mid',
      bio: 'Four-armed insectoids with plated exoskeletons, glowing compound eyes, and hive-memory implants.',
      role: 'Tunnel raiders, hive defenders, martial tacticians.',
      abilities: [
        '<strong>Wall Skitter:</strong> Move along vertical surfaces (not ceilings) without check.',
        '<strong>Multi-Strike:</strong> One extra unarmed (claw) attack per turn.',
        '<strong>Hive Recall:</strong> Shared hive memory — advantage on History, Arcana, or Tactical Insight (1/long rest).',
      ],
      notes: 'Not emotionless — efficient. Deep loyalty to their unit.',
    },
    {
      name: 'Draxen',
      slug: 'draxen',
      glyph: '🐉',
      homeworld: 'Caldrithar (Outer Rim)',
      rim: 'outer',
      bio: 'Draconic humanoids with scaled skin, curved horns, and embers beneath the surface.',
      role: 'Skyborn warrior-tribes, mercenary clans, volcanic arena champions.',
      abilities: [
        '<strong>Molten Roar:</strong> Once per rest, blast of heat or fear-inducing roar.',
        '<strong>Forged Endurance:</strong> Resistant to fire and atmospheric extremes.',
        '<strong>Bone Archives:</strong> Carved bones as ancestral relics, invoking minor boosts via ritual.',
      ],
      notes: 'Live by creeds and duels. Respect is earned in flame.',
    },
    {
      name: 'Vyrnari',
      slug: 'vyrnari',
      glyph: '🦎',
      homeworld: 'Velthros (Outer Rim Wasteland)',
      rim: 'outer',
      bio: 'Muscular reptilian humanoids with ridged skulls, adaptive skin, and beast-linked telepathy.',
      role: 'Nomads, beast-bonders, desert-scouts. Travel in pride-bands with bonded mounts.',
      abilities: [
        '<strong>Beastlink:</strong> Telepathic bond with one creature. Gains boosts when near.',
        '<strong>Survivalist:</strong> No penalties in harsh terrain. Subsist on near-nothing.',
        '<strong>Savage Leap:</strong> Leap 3x normal range and strike as a bonus action.',
      ],
      notes: 'Fiercely loyal to kin. Tribal tattoos pulse with heat.',
    },
    {
      name: 'Velari',
      slug: 'velari',
      glyph: '🌊',
      homeworld: 'TBD (Outer Rim)',
      rim: 'outer',
      bio: 'Tall, lean humanoids with deep blue-grey skin marked by glowing aquamarine bio-luminescent dots. Long dark indigo hair and amber eyes. Pointed ears.',
      role: 'TBD — to be filled in from canon source.',
      abilities: [
        '<strong>TBD</strong> — abilities to be added.',
      ],
      notes: '(Description placeholder — update from Races doc.)',
    },
    {
      name: 'Orpheni',
      slug: 'orpheni',
      glyph: '🌌',
      homeworld: 'Threnar (Outer Rim Void/Aquatic)',
      rim: 'outer',
      bio: 'Cephalopod-descended humanoids with fluid gait, void-dark skin, and psychic luminescence.',
      role: 'Stargazers, void-sailors, living maps of astral currents.',
      abilities: [
        '<strong>Alien Logic:</strong> Advantage on insight vs lies/manipulation; immune to most illusions.',
        '<strong>Zero-G Navigator:</strong> Natural movement in water or weightless environments.',
        '<strong>Mind Pulse:</strong> Detect nearby sentient minds (limited use).',
      ],
      notes: 'Speak in wave-patterns; emotion is geometry to them.',
    },
    {
      name: 'Zephryne',
      slug: 'zephryne',
      glyph: '🦋',
      homeworld: 'Achelion (Outer Rim — Water World)',
      rim: 'outer',
      bio: 'Delicate, iridescent-winged hybrids of insectoid and fey, with chitin-lined skin and multicolored gaze.',
      role: 'Empaths, wave-binders, song-diviners, living antennae to the Weave.',
      abilities: [
        '<strong>Synesthetic Aura:</strong> Project emotional waves to calm, confuse, or inspire.',
        '<strong>Neural Scan:</strong> Detect nearby tech activity or psionic pulses.',
        '<strong>Wingshift:</strong> Once per short rest, teleport in a blur of motion and sound.',
      ],
      notes: 'Often used — and feared — as living radars and Weave-tuned mystics.',
    },
    {
      name: 'T\'vaari',
      slug: 'tvaari',
      glyph: '🌿',
      homeworld: 'Lysavex (Outer Rim — Crystal Savannah)',
      rim: 'outer',
      bio: 'Bio-silicon lifeforms — crystalline lattice plus internal harmonic resonance, covered in soft fur. Small (3–4 ft). Glow softly with inner memory-light.',
      role: 'Builders of impossible architecture, keepers of planetary memory, ritual harmonics. Mechanically Tabaxi-base with alien twists.',
      abilities: [
        '<strong>Resonance Sense:</strong> Bonus action, DC 15 WIS (Insight) to read emotional state of creatures within 10 ft.',
        '<strong>Alien Curiosity:</strong> Proficiency in two of Perception, Stealth, Insight, Persuasion.',
        '<strong>Feline Agility + Climb 20 ft + Darkvision 60 ft.</strong>',
      ],
      notes: 'Luminous eyes; iridescent wild-color fur; cheek/brow whisker-tendrils picking up vibration/psionic ripples.',
    },
    {
      name: 'Suso',
      slug: 'suso',
      glyph: '🦗',
      altImage: 'images/races/suso-wildtype.png',
      altLabel: 'Wildtype',
      homeworld: 'Skarab Prime (Outer Rim Scrap-World)',
      rim: 'outer',
      bio: 'Chitin plates, four arms (two primary, two smaller "work" arms), multifaceted eyes, soft antennae. Lifespans 12–20 years; clutch-mature in a single year.',
      role: 'Wild: vent-crawling scavengers. Cities: refinery and fab-plant line workers. The SuBro lineage practices the Iron Creed — eat clean, lift heavy, sleep efficient, repeat.',
      abilities: [
        '<strong>Polyphasic Rest:</strong> Stay lightly active 6 hours during a long rest and still gain its benefits.',
        '<strong>Darkvision 60 ft</strong> (compound eyes).',
        '<strong>Languages:</strong> Common + Chitter (clicks/whistles).',
      ],
      notes: 'Live fast, work hard, barter everything. SuBro\'s heaven is a squat rack with no spotter. Two known lineages: Wildtype Skitter-Clans (small, scavenger) and SuBro Iron-Sinew (medium, gym-zealot).',
    },
    {
      name: 'Solarii',
      slug: 'solarii',
      glyph: '🌿',
      homeworld: 'Verdantia (Inner Rim)',
      rim: 'inner',
      bio: 'Photosynthetic humanoids with luminous skin, vine-veined musculature, and radiant crystal hearts pulsing with solar energy.',
      role: 'Garden-tenders of the sacred groves, priests of sunlight, and envoys of ecological balance.',
      abilities: [
        '<strong>Solar Reservoir:</strong> Store sunlight during the day; release radiant bursts or healing waves at will.',
        '<strong>Regrowth Surge:</strong> Regenerate tissue with focused light (limited-use).',
        '<strong>Photosynthetic Rest:</strong> Rest while exposed to sunlight, gaining sustenance and clarity.',
      ],
      notes: 'Rare but revered outside their world; often mistaken as minor gods.',
    },
  ];

  // ============================================================
  // VISUAL CODEX — Bragg's S5 lore monologue, illustrated
  // image paths: images/lore/{slug}.jpg
  // ============================================================
  const VISUAL_CODEX = [
    {
      slug: 'pantheon',
      title: 'The Pantheon',
      caption: 'The Thirteen Primordials — the deep gods whose courts, sigils, and shardmarks shape every Inner Rim world.',
    },
    {
      slug: 'primordials-veil',
      title: 'The Primordials Forged the Veil',
      caption: 'Before names, before the Maw — the Primordials wove the lattice that holds reality together. Light shaped from the dark.',
    },
    {
      slug: 'rise-of-the-maw',
      title: 'The Rise of the Maw',
      caption: 'A horned hunger above the spiral — that which eats memory, names, and form. The Wardens were forged to hold it back.',
    },
    {
      slug: 'warden-of-silence',
      title: 'The Warden of Silence',
      caption: 'The First of the Wardens — staff bridging the void, keeping the Maw\'s eyes shut. He was holy. Then he wasn\'t.',
    },
    {
      slug: 'first-hollow',
      title: 'The First Hollow',
      caption: 'What the Warden of Silence became when he was un-named. Crowned, hollow-faced, regal. Cuts wounds in the Veil from the inside. Marked Lor.',
    },
    {
      slug: 'shattering',
      title: 'The Shattering',
      caption: 'The lattice wounded. Color and light cracking outward across the galaxy. The event that broke the Veil and let the rifts begin to walk.',
    },
    {
      slug: 'veil-shards',
      title: 'The Veil Shards',
      caption: 'When the Veil shattered, its fragments fell. Held by hand, set into flesh, sunk into stone. Each one a doorway and a debt.',
    },
    {
      slug: 'eidolons',
      title: 'The Thirteen Eidolons',
      caption: 'Sentient shifters bound to a Prime Veilshard. 25–30 dt. Heart-core inheritance. Lor is one. Vale is one. Karnyx is one.',
    },
    {
      slug: 'fractured-veilbeast-titan',
      title: 'Fractured · Veilbeast · Veil Titan',
      caption: 'The corruption progression. Fractured — infected, slipping. Veilbeast — mindless. Veil Titan — massive, wild, city-killing.',
    },
    {
      slug: 'lore-10',
      title: 'Untitled · Veilforging Reference',
      caption: 'Tenth panel from Bragg\'s monologue. Caption pending — update via the data file when you confirm the scene.',
    },
  ];

  // ============================================================
  // HEAT — faction tension, Null attention, scars, memory tax, omens
  // level: 'cool' | 'warm' | 'hot' | 'crit' | 'void' (visual theming)
  // clock: { current: N, max: M }
  // category: 'faction' | 'null' | 'scar' | 'memory' | 'omen'
  // ============================================================
  const HEAT = [
    // ===== FACTION HEAT =====
    {
      category: 'faction',
      name: 'Court of Light',
      level: 'crit',
      clock: { current: 6, max: 6 },
      desc: '<strong>CRITICAL.</strong> The party killed two High Adjudicators (Chaddeus and Thaddeus) in Glassend. The Court will know they failed. A reckoning is coming.',
      trigger: '<strong>Next escalation:</strong> A named retaliation force dispatched.',
    },
    {
      category: 'faction',
      name: 'Corno Spezzato',
      level: 'hot',
      clock: { current: 4, max: 6 },
      desc: 'Pirate syndicate. The party chose violence on the boarding capo of <strong>The Hog Father</strong> in S5. Defeated the boarding crew without negotiation. The syndicate now has a name and a target.',
      trigger: '<strong>Next escalation:</strong> Bounty placed; sector-wide tag on the Codex.',
    },
    {
      category: 'faction',
      name: 'Fey Court (General)',
      level: 'hot',
      clock: { current: 4, max: 6 },
      desc: 'Moon base cameras caught the Codex during the FTL heist. Two enforcers dead. The Court is hunting.',
      trigger: '<strong>Next escalation:</strong> Standing bounty across Inner Rim ports.',
    },
    {
      category: 'faction',
      name: 'Edgekeepers',
      level: 'cool',
      clock: { current: 5, max: 6 },
      desc: 'ALLIED. Bragg Mentan delivered the lore dump and pledged boons. Z Kint vouched. Dr. Ilex Vor installed P.L.U.G. implants.',
      trigger: '<strong>Next escalation up:</strong> Field a node in the Resonance Lattice.',
    },
    {
      category: 'faction',
      name: 'Pike Family',
      level: 'warm',
      clock: { current: 3, max: 6 },
      desc: 'Crime syndicate on Leztos. Hold Spry captive. The Codex Crew handed Wrath over to settle a debt — that history follows HOC.2a.',
      trigger: '<strong>Next escalation:</strong> Pike contract on the Codex.',
    },
    {
      category: 'faction',
      name: 'Black Sky Imperium',
      level: 'warm',
      clock: { current: 2, max: 6 },
      desc: 'Destroyed Hosun Prime to bury the Lorutell Cindella experiments. Sent Talus after the Codex Crew (dead now). Red Solomon still active.',
      trigger: '<strong>Next escalation:</strong> Imperial intelligence flags HOC.2a as Codex Crew successors.',
    },

    // ===== NULL ATTENTION =====
    {
      category: 'null',
      name: 'Null Attention',
      level: 'void',
      clock: { current: 3, max: 8 },
      desc: 'Rises with cores touched, seeds slotted, gates approached, named figures un-named. The Hollowed One <strong>already marked Lor</strong> in S0. Glassend names erased after S1. Lor publicly outed as an Eidolon by Bragg in S5 — the broadcast operation saw it.',
      trigger: '<strong>At full clock:</strong> Silence storm + Null commander dispatched.',
    },
    {
      category: 'null',
      name: 'The Maw — Proximity',
      level: 'void',
      clock: { current: 2, max: 8 },
      desc: 'Interior Veil wounds widen. The First Hollow waits at the far Rim. Each rite, each core, each name — the lattice trembles a little more.',
      trigger: '<strong>At full clock:</strong> A city un-names itself. The omen pays off.',
    },

    // ===== STRAIN / SCAR =====
    {
      category: 'scar',
      name: 'Lor — Hollowed One\'s Mark',
      level: 'crit',
      clock: { current: 1, max: 1 },
      desc: 'Permanent mark on her neck from S0 mid-drift. Tethers her location to the Hollowed One. <strong>Magebane</strong> is the only known counter — three potions brewed; needs Chromehymn technomancers on Straleon to apply.',
      trigger: '<strong>While unmarked:</strong> She is found wherever she goes.',
    },
    {
      category: 'scar',
      name: 'Killua',
      level: 'cool',
      clock: { current: 0, max: 4 },
      desc: 'No active scars. Echo Resonance feature trained.',
      trigger: '',
    },
    {
      category: 'scar',
      name: 'Aelyn Vox',
      level: 'cool',
      clock: { current: 0, max: 4 },
      desc: 'No active scars. Bond with L.E. + GHOST-17X holding stable.',
      trigger: '',
    },
    {
      category: 'scar',
      name: 'Flint D. McCoy',
      level: 'cool',
      clock: { current: 0, max: 4 },
      desc: 'No active scars.',
      trigger: '',
    },
    {
      category: 'scar',
      name: '5p0r3',
      level: 'cool',
      clock: { current: 0, max: 4 },
      desc: 'No active scars. Mycelium network stable.',
      trigger: '',
    },

    // ===== MEMORY TAX / COLLATERAL =====
    {
      category: 'memory',
      name: 'Glassend — Names Lost',
      level: 'hot',
      clock: { current: 4, max: 6 },
      desc: 'After the S1 attack, Glassend bystanders blinked away the memory of loved ones — unsure those people had ever existed. The Maw un-named.',
      trigger: '<strong>Next tick:</strong> A landmark (street, statue, family) erased.',
    },
    {
      category: 'memory',
      name: 'Hosun Prime — Erased',
      level: 'crit',
      clock: { current: 6, max: 6 },
      desc: 'TBS destroyed the planet to bury the Lorutell Cindella program. Survivors scattered. Records purged. The Codex Crew witnessed.',
      trigger: '<strong>Locked.</strong> What was, no longer is.',
    },

    // ===== ACTIVE OMENS =====
    {
      category: 'omen',
      name: 'Silence Devours a City',
      seen: true,
      desc: 'Glassend square — bystanders forgot loved ones mid-conversation. <strong>Partial.</strong> The full omen pays off when an entire city un-names itself.',
    },
    {
      category: 'omen',
      name: 'Dead Refuse Their Names',
      seen: false,
      desc: 'Threnar omen. Watch for the dead disowning their grave-names. The First Hollow un-names.',
    },
    {
      category: 'omen',
      name: 'River Runs Backward',
      seen: false,
      desc: 'Velthros omen. Tied to the Engine Seed.',
    },
    {
      category: 'omen',
      name: 'Dreaming Moon Splits',
      seen: false,
      desc: 'Cosmic omen. Watch the lunar cycle around any major rite.',
    },
    {
      category: 'omen',
      name: 'God Born Screaming',
      seen: false,
      desc: 'Birth of a new prime — or the return of one. Listen for the scream.',
    },
  ];

  // ============================================================
  // STATE
  // ============================================================
  // Campaign media lives in one catalog; location views reference the same recordings.
  const MEDIA = window.CAMPAIGN_MEDIA;
  const asset = n => MEDIA.art.find(a => a.id === String(n).padStart(3, '0') && !a.video && !a.source.includes('_alts')).src;
  const PLACE_ENTRIES = [
    {id:'port-vesper',name:'Port Vesper',parent:'straleon',image:asset(128),desc:'The BBC is undergoing repairs here. Bix quoted 5,000 credits and three to four days; payment is due on collection. The party returned here after Flint’s farewell.',gallery:[128,138]},
    {id:'chromehymn',name:'Chromehymn',parent:'straleon',image:asset(108),desc:'City on Straleon. The party returned toward Chromehymn after leaving the Lux Codicants, then shopped during Session 15.',gallery:[108,138]},
    {id:'hymfall',name:'Hymfall / Hymnfall',parent:'straleon',image:asset(112),desc:'Lux Codicant temple in Straleon’s deadlands. The party witnessed the Trials of the Whole, Ghost’s communion, and Flint’s ascension as Flesh Cipher. The written recap uses Hymfall; the art library uses Hymnfall.',gallery:[112,119,121,123,125,126,127]},
    {id:'dead-pixel',name:'The Dead Pixel',parent:'straleon',image:asset(130),desc:'Port Vesper bar, identified in the art library. The Session 15 recap describes the meeting with Rook at a dive bar without naming that bar.',gallery:[130,132]},
    {id:'nocturne-13',name:'Nocturne 13',parent:'straleon',image:asset(153),desc:'Underground nightclub in the Straleon art library. Ghost calls the planned technomancer meeting place “Heartburn 17” in his recap; that nickname has not been treated as a confirmed venue name.',gallery:[151,153,154,158]},
    {id:'harthgrove',name:'Harthgrove',parent:'gray-haven',image:asset(72),desc:'Town of Harthgrove on Gray Haven, with local artwork and residents.',gallery:[72,58]},
    {id:'spit-swallow',name:'The Spit N’ Swallow',parent:'gray-haven',image:asset(74),desc:'Amarante’s tavern. The crew visited during the Gray Haven magebane journey; Blue Harvest has an enthusiastic local readership.',gallery:[74,56]},
    {id:'crystal-caverns',name:'Crystal Caverns',parent:'gray-haven',image:asset(62),desc:'The Gray Haven magebane expedition passed through resonance trials and reached Gleamfather’s Roost.',gallery:[62,63,64,65,66,67,68,70]},
    {id:'glassend',name:'Glassend',parent:'velthros',image:null,desc:'Velthros settlement and home of the Dusty Star. The crew met Rex, Pip, Yarrow Salt, and Vale here.',gallery:[17,19,20,24]},
    {id:'celestial-tunnel',name:'The Celestial Tunnel · A Day With Doc',rim:'unknown',image:asset(102),desc:'The realm of the repeating show A Day With Doc. Session 11, August 2, 2026: Vay’hel’s glade, Mother Sunder, and the party’s boon-hunting with lesser gods. The three standalone Ghost recordings belong to this session; their exact scenes have not been specified.',gallery:[94,95,96,98,99,100,102,103]}
  ];
  for (const loc of LOCATIONS) if (MEDIA.placeMatches[loc.id]) loc.image = MEDIA.placeMatches[loc.id];
  for (const p of [...POI,...CREW]) if (MEDIA.matches[p.name]) p.image=MEDIA.matches[p.name];
  for (const loc of LOCATIONS) for (const c of loc.contacts || []) c.image=MEDIA.matches[c.name] || POI.find(p=>p.name===c.name)?.image;
  const straleon=LOCATIONS.find(l=>l.id==='straleon');
  straleon.visitedBy='c2';
  straleon.desc+=' <strong>Sessions 14–15:</strong> BBC repairs at Port Vesper, the journey to Hymfall, Flint’s ascension, and Rook’s arrival. Chromehymn, Port Vesper, and the temple have their own entries below.';
  const echo=LOCATIONS.find(l=>l.id==='echo');
  echo.intel=[...(echo.intel||[]),'Session 14: divine communions located Killua’s soul in Echo’s southern hemisphere after he drew the Void. Exact coordinates remain unknown.'];
  const newPeople=[
    {name:'Rook',image:asset(134),stance:'allied',kind:'Black Sky defector · SEN-47 (art library)',role:'Joined the party in Session 15',desc:'Met Lor after Nibs delivered a message. Rook disclosed a past with the Black Sky; Aelyn restrained Ghost. Ghost deliberately calls her “Brook” in his recap.',location:{id:'straleon',label:'Port Vesper · Straleon'}},
    {name:'Nibs',image:asset(129),stance:'friendly',kind:'Street messenger',desc:'Delivered a note to Lor at Port Vesper during Session 15. The art library labels this messenger “Nib”; Ghost’s recap calls him Nibs.',location:{id:'straleon',label:'Port Vesper'}},
    {name:'Bix',image:asset(135),stance:'friendly',kind:'Port Vesper dockmaster',desc:'Quoted 5,000 credits and three to four days to repair the BBC. Asra negotiated over the price. Art library: Bix Valega.',location:{id:'straleon',label:'Port Vesper'}},
    {name:'Eska',image:asset(118),stance:'friendly',kind:'Lux Codicant disciple',desc:'Dragonborn disciple who carried the party by sand skiff between Port Vesper and Hymfall in Session 14. Art library: Truthwarden Eska Pell.',location:{id:'straleon',label:'Hymfall'}},
    {name:'Saturiba',stance:'unknown',kind:'Flint’s missing mentor',desc:'Raised Flint on Fellwinter and taught him magic, mechanics, and hacking. The Trials revealed that Fey Court agents took Saturiba rather than killed him. Finding him is Flint’s first charge as Flesh Cipher.',location:{id:'fellwinter-5',label:'Fellwinter · history'}},
    {name:'Elo the Thrice',stance:'friendly',kind:'Lux Codicants · sacrament receiver',desc:'Received Ghost’s compressed data sacrament at Hymfall. The similarly titled Sister Elena artwork has not been assumed to depict Elo.',location:{id:'straleon',label:'Hymfall'}},
    {name:'Vay’hel / Doc',image:asset(95),stance:'allied',kind:'Eladrin · A Day With Doc',desc:'Trapped in the Celestial Tunnel’s repeating show for about 500 years. Escaped with the party; overwhelmed afterward, she entered the ceramic frog’s pocket dimension.',location:{label:'The Celestial Tunnel / BBC'}},
    {name:'Gleamfather',image:asset(69),stance:'friendly',kind:'Keeper of the Rootlight',desc:'Encountered during the Gray Haven magebane expedition.',location:{id:'gray-haven',label:'Gleamfather’s Roost'}},
    {name:'Kess Thall',image:asset(23),stance:'friendly',kind:'T’vaari shopkeeper',desc:'Art library identifies Kess Thall and the Crate & Crescent General store in Glassend.',location:{id:'velthros',label:'Glassend'}}
  ];
  POI.push(...newPeople.map(p=>({...p,crew:'c2'})));
  straleon.contacts=[...newPeople.filter(p=>p.location?.id==='straleon').map(p=>({...p,faction:p.stance}))];
  const flint=CREW.find(p=>p.name==='Flint D. McCoy');
  flint.status='departed';flint.class='Flesh Cipher · Luminous Church';flint.tagline='Ascended at Hymfall in Session 14 and stayed with the Lux Codicants. Charged to find Saturiba. Ghost’s synchronization can reunite him with the party.';
  CREW.find(p=>p.name==='Killua').tagline='Session 14: the Void took his soul to Echo’s southern hemisphere. Asra now inhabits his body; twenty summoned soldiers await orders.';
  CREW.push({name:'Rook',pronouns:'she/her',class:'Black Sky defector',tagline:'Joined the party at Port Vesper in Session 15. Ghost calls her Brook.',image:asset(134),status:'active',order:7});
  SESSIONS.push(
    {num:'S14',crew:'c2',title:'Farewell, Flint',where:{id:'straleon',label:'BBC → Port Vesper → Hymfall'},summary:'The Deck of Many Things left Killua’s soul on <strong>Echo</strong> and Asra in his body, with twenty soldiers under his command. At Port Vesper, Bix offered BBC repairs for 5,000 credits. Eska brought the party to the Lux Codicants at Hymfall, where Flint was recognized as the <strong>Flesh Cipher</strong>.',moments:['The party witnessed the Trials of the Whole: love and fellowship, sacrifice, perseverance, and death and life.','Ghost received communion through the Radiant Tabernacle; Elo the Thrice received the data sacrament.','The Missing Chapter, preserved in the Hood of Wisdom, was restored to Flint. He ascended and remained with the Lux Codicants.','Saturiba is missing, taken by Fey Court agents. Ghost’s synchronization can reunite Flint and the party.'],dmOnly:''},
    {num:'S15',crew:'c2',title:'Defectors and Discounts',where:{id:'straleon',label:'Port Vesper · Chromehymn'},summary:'After saying farewell to Flint, the party returned to Port Vesper. <strong>Nibs</strong> delivered a message to Lor, leading to a bar meeting with <strong>Rook</strong>, a Black Sky defector who joined the party. Aelyn restrained Ghost. Shopping followed: deals, forged coupons, and the sale of recovered Fey Court armor.',moments:['Asra left to shop on her own.','Ghost calls Rook “Brook” and the proposed meeting venue “Heartburn 17”; these are preserved as his unreliable narration.','A technomancer meeting is the next lead.','Ghost wanted a new hat. Ghost did not get a new hat.'],dmOnly:''}
  );
  HOOKS.push({title:'Recover Killua’s soul',crew:'c2',status:'open',location:{id:'echo',label:'Echo · southern hemisphere'},desc:'The Void trapped Killua’s soul; divine communion narrowed the search to Echo’s southern hemisphere.'});

  MEDIA.recordings.filter(r=>r.kind!=='recap').forEach(r=>{r.session=11;r.date='August 2, 2026';r.location='celestial-tunnel';r.setting='Session 11 · A Day With Doc · Celestial Tunnel';});
  function audioHtml(r) {
    return `<article class="media-recording"><div class="media-eyebrow">${escapeHtml(r.kind==='recap'?'Ghost voice recap':r.kind==='rant'?'Ghost rant':'Ghost voice line')} · ${escapeHtml(r.date||'Undated')}</div><h4>${escapeHtml(r.title)}</h4><p class="media-setting">${escapeHtml(r.setting)}</p><audio controls preload="none" aria-label="${escapeHtml(r.title)}"><source src="${r.src}" type="audio/mpeg">Your browser does not support audio. <a href="${r.src}">Open recording</a></audio><a class="media-link" href="${r.src}" download>Download recording</a></article>`;
  }
  function recapHtml(session, full=false) {
    const written=MEDIA.recaps.find(r=>r.session===session);
    const recordings=MEDIA.recordings.filter(r=>r.kind==='recap'&&r.session===session);
    if (!written&&!recordings.length) return '';
    return `<div class="recap-media">${recordings.map(audioHtml).join('')}${written?`<a class="media-link" href="${written.pdf}" target="_blank" rel="noopener">Read original written recap (PDF)</a>${full?`<details class="written-recap"><summary>Read the full written recap here</summary><div class="written-body">${written.body}</div></details>`:''}`:''}</div>`;
  }
  function renderRecaps() {
    return `<div class="media-intro"><h2>Recap Archive</h2><p>The campaign’s written recaps and Ghost’s recordings, together by session. Ghost’s version preserves his own wording, nicknames, and dubious opinions.</p></div>`+[15,14,13].map(n=>`<section class="session-card c2"><div class="archive-banner"><img src="${asset(n===15?128:n===14?112:81)}" alt="${n===15?'Port Vesper':n===14?'Hymfall':'Pirate boarding team'}" loading="lazy"><span>CODEX FIELD RECORD // SESSION ${n}</span></div><div class="session-num">Session ${n}</div><h3 class="session-title">${escapeHtml(SESSIONS.find(s=>s.num==='S'+n)?.title||'Recap')}</h3>${recapHtml(n,true)}</section>`).join('');
  }
  function renderGhost() {
    return `<div class="ghost-hero" style="--ghost-portrait:url('${asset(4)}')"><h2>GHOST-17X<br>Open Frequency</h2><p>Every voice recap, rant, and stray transmission in one place. Location pages reference this same archive.</p></div><div class="ghost-filters"><button data-ghost-filter="all" aria-pressed="true">All transmissions</button><button data-ghost-filter="recap">Recaps</button><button data-ghost-filter="rant">Rants</button><button data-ghost-filter="line">Voice lines</button></div><div id="ghostRecordings">${MEDIA.recordings.map(audioHtml).join('')}</div>`;
  }
  function ghostAtPlace(loc) {
    const records=MEDIA.recordings.filter(r=>r.kind!=='recap'&&r.location===loc.id);
    const quote=loc.id==='straleon'||loc.id==='chromehymn'?'<blockquote>“I really wanted a new hat… Dang it.”</blockquote><p class="media-setting">Ghost’s Session 15 written recap · shopping in Chromehymn</p>':'';
    return `<div class="info-section"><div class="info-section-label">Thing Ghost Said while visiting here</div>${quote}${records.map(audioHtml).join('')}${!quote&&!records.length?'<p class="media-setting">No location-linked Ghost lines archived here yet.</p>':''}<button class="media-button" data-open-ghost>Open Ghost’s full archive</button></div>`;
  }
  function galleryHtml(items) {
    return `<div class="media-art-grid">${items.map(a=>`<article class="media-art-card">${a.video?`<video controls preload="none" aria-label="${escapeHtml(a.title)}" ${MEDIA.art.find(b=>b.id===a.id&&!b.video)?`poster="${MEDIA.art.find(b=>b.id===a.id&&!b.video).src}"`:''}><source src="${a.src}" type="video/mp4"></video>`:`<button class="media-art-image" data-img="${a.src}" data-caption="${escapeHtml(a.title)}"><img src="${a.src}" alt="${escapeHtml(a.title)}" loading="lazy"></button>`}<h4>${escapeHtml(a.title)}</h4><p>${escapeHtml(a.category)}</p></article>`).join('')}</div>`;
  }
  function artAtPlace(loc) {
    let ids=loc.gallery||[];
    if(loc.id==='straleon') ids=[108,128,138,112,130,153];
    if(loc.id==='gray-haven') ids=[71,72,74,62,69,68];
    if(loc.id==='velthros-moon') ids=[26,27,28,29];
    if(loc.id==='velthros') ids=[17,19,20,24];
    if(loc.id==='edgewatch-9') ids=[36,37,52,54];
    if(loc.id==='fellwinter-5') ids=[123];
    if(!ids.length)return '';
    return `<div class="info-section"><div class="info-section-label">Field Images</div>${galleryHtml(MEDIA.art.filter(a=>!a.video&&!a.source.includes('_alts')&&ids.includes(Number(a.id))))}</div>`;
  }
  function renderArt() {
    const categories=[...new Set(MEDIA.art.map(a=>a.category))];
    return `<div class="media-intro"><h2>The Shattering · Art Archive</h2><p>Portraits, places, ships, lore, handouts, menus, and moving images. Unidentified art keeps its library label.</p></div><label class="media-search-label">Find artwork<input id="artSearch" placeholder="Search subjects, places, or library labels…"></label><label class="media-search-label">Collection<select id="artCategory"><option value="">All collections</option>${categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select></label><p id="artCount">${MEDIA.art.length} pieces</p><div id="artResults">${galleryHtml(MEDIA.art)}</div>`;
  }
  function renderPlaces() {
    return `<div class="media-intro"><h2>Places &amp; Landmarks</h2><p>Open a field entry for artwork, campaign notes, and the things Ghost said there.</p></div><div class="directory-grid">${PLACE_ENTRIES.map(p=>`<article class="dir-card"><div class="dir-body">${p.image?`<button class="media-art-image" data-img="${p.image}" data-caption="${escapeHtml(p.name)}"><img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"></button>`:''}<h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.desc)}</p><button class="media-button" data-place="${p.id}">Open field entry</button></div></article>`).join('')}</div>`;
  }
  document.addEventListener('play',e=>{if(e.target.matches('audio,video'))document.querySelectorAll('audio,video').forEach(m=>{if(m!==e.target)m.pause();});},true);
  document.addEventListener('click',e=>{
    const ghost=e.target.closest('[data-open-ghost]');if(ghost){compendiumState.tab='ghost';openCompendium();}
    const filter=e.target.closest('[data-ghost-filter]');if(filter){$('ghostRecordings').innerHTML=MEDIA.recordings.filter(r=>filter.dataset.ghostFilter==='all'||r.kind===filter.dataset.ghostFilter).map(audioHtml).join('');}
    const place=e.target.closest('[data-place]');if(place){const p=PLACE_ENTRIES.find(p=>p.id===place.dataset.place);closeCompendium();openInfo({...p,rim:p.rim||'mid',subtitle:p.parent?LOCATIONS.find(l=>l.id===p.parent)?.name:'Off-map realm'});}
  });
  function filterArt(){const term=($('artSearch')?.value||'').toLowerCase();const cat=$('artCategory')?.value||'';const items=MEDIA.art.filter(a=>(!cat||a.category===cat)&&(a.title+' '+a.source).toLowerCase().includes(term));$('artResults').innerHTML=galleryHtml(items);$('artCount').textContent=items.length+' pieces';}
  document.addEventListener('input',e=>{if(e.target.id==='artSearch')filterArt();});
  document.addEventListener('change',e=>{if(e.target.id==='artCategory')filterArt();});


  function contrabandBookmark(label='Found between the pages') {
    return `<details class="contraband"><summary>${escapeHtml(label)}</summary><button class="media-art-image" data-img="media/art/blue-harvest.webp" data-caption="Blue Harvest · Sorrow Yalt"><img src="media/art/blue-harvest.webp" alt="A well-travelled copy of Blue Harvest" loading="lazy"></button></details>`;
  }
  const originals = {ghostAtPlace, renderGhost, renderRecaps, renderPlaces};
  ghostAtPlace = function(loc) {
    let out=originals.ghostAtPlace(loc);
    if(['gray-haven','spit-swallow','glassend','chromehymn','celestial-tunnel','velthros-moon'].includes(loc.id)) out+=contrabandBookmark(loc.id==='velthros-moon'?'Confiscated reading material':'Something left on a seat');
    return out;
  };
  renderGhost = function(){return originals.renderGhost()+contrabandBookmark('Ghost’s totally normal reading list');};
  renderRecaps = function(){return originals.renderRecaps()+contrabandBookmark('A loose dust jacket');};
  renderPlaces = function(){return originals.renderPlaces()+contrabandBookmark('Lost property');};
  document.addEventListener('dblclick',e=>{if(e.target.closest('.brand-mark,.brand-text,.zoom-display'))openLightbox('media/art/blue-harvest.webp','A magical blue hog is a heavy burden.');});
  let secretKeys='';document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||e.ctrlKey||e.metaKey)return;secretKeys=(secretKeys+e.key.toLowerCase()).slice(-11);if(secretKeys.endsWith('blueharvest'))openLightbox('media/art/blue-harvest.webp','Sorrow Yalt sends his regards.');});


  const fileFixes = ['images/portraits/ellie.png','images/portraits/cro.png'];
  for (const entry of [...POI,...CREW]) if(fileFixes.includes(entry.image))delete entry.image;
  const repairHook=HOOKS.find(h=>h.title==='Hull Critical — And Their Ship Is Still Out There');
  if(repairHook){repairHook.title='Collect the BBC after repairs';repairHook.desc='Bix at Port Vesper quoted 5,000 credits and three to four days. The crew stabilized the ship in Session 14; payment is due when they return for her. The pirate vessel’s fate remains unresolved.';repairHook.location={id:'straleon',label:'Port Vesper'};}
  const luxHook=HOOKS.find(h=>h.title==='The Lux Codicants');
  if(luxHook){luxHook.title='Find Saturiba';luxHook.desc='The party reached Hymfall in Session 14. Flint ascended as Flesh Cipher and stayed with the Lux Codicants. His first charge is to find his mentor Saturiba and bring him back to the church.';}
  document.addEventListener('click',e=>{const quick=e.target.closest('[data-quick-tab]');if(quick){compendiumState.tab=quick.dataset.quickTab;openCompendium();}const f=e.target.closest('[data-ghost-filter]');if(f)document.querySelectorAll('[data-ghost-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===f)));});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.planet')){e.preventDefault();const loc=findLoc(e.target.dataset.loc);if(loc)openInfo(loc);}});
  const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');


  let flightPathVisible=false;
  document.addEventListener('click',e=>{if(e.target.closest('#toggleFlightPath')){
    flightPathVisible=!flightPathVisible;$('toggleFlightPath').setAttribute('aria-pressed',String(flightPathVisible));
    let path=$('crewFlightPath');
    if(!path){path=document.createElementNS(NS,'path');path.id='crewFlightPath';path.setAttribute('class','crew-flight-route');path.setAttribute('d',['velthros','velthros-moon','edgewatch-9','gray-haven','straleon'].map((id,i)=>{const p=getCoords(findLoc(id));return `${i?'L':'M'} ${p.x} ${p.y}`;}).join(' '));mapGroup.insertBefore(path,$('planetsLayer'));}
    path.style.display=flightPathVisible?'':'none';
  }});

  const state = {
    selectedId: null,
    dmMode: false,
    scale: 1,
    tx: 0,
    ty: 0,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    panStart: { x: 0, y: 0 },
  };
  // Load from localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('shattering-atlas-v1') || '{}');
    Object.assign(state, saved);
  } catch (e) {}
  // Always reset DM mode to OFF on load — never persist it across sessions.
  // Players who watch the password get entered once shouldn't stay unlocked forever.
  state.dmMode = false;

  function saveState() {
    try {
      localStorage.setItem('shattering-atlas-v1', JSON.stringify({
        // dmMode intentionally NOT saved — must be re-entered each session
        selectedId: state.selectedId,
      }));
    } catch (e) {}
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const $ = id => document.getElementById(id);
  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  const NS = 'http://www.w3.org/2000/svg';

  function findLoc(id) {
    if (id === 'maw') return VOID;
    if (id === 'fey-core') return { id: 'fey-core', name: 'Fey Court Core', rim: 'inner', subtitle: 'Heart of the Inner Rim', desc: 'The pulsing star at the center of the Inner Rim — the source-radiance from which the thirteen Fey Court worlds draw their divine charter. Old, vast, and watched.' };
    return LOCATIONS.find(l => l.id === id) || PLACE_ENTRIES.find(l=>l.id===id);
  }

  function getCoords(loc) {
    if (loc.x != null && loc.y != null) return { x: loc.x, y: loc.y };
    return pos(loc.angle, loc.radius);
  }

  function escapeHtml(s) {
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }

  // ============================================================
  // STARFIELD
  // ============================================================
  function buildStarfield() {
    const sf = $('starfield');
    sf.replaceChildren();
    const count = 140;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.top = Math.random() * 100 + 'vh';
      const size = 0.6 + Math.random() * 2.4;
      s.style.width = s.style.height = size + 'px';
      s.style.setProperty('--dur', (2.5 + Math.random() * 5) + 's');
      s.style.setProperty('--delay', (Math.random() * 5) + 's');
      if (Math.random() < 0.08) s.style.background = '#bce4ff';
      if (Math.random() < 0.04) s.style.background = '#ffd6a0';
      frag.appendChild(s);
    }
    sf.appendChild(frag);
  }

  // ============================================================
  // SPIRAL ARMS — decorative galaxy backdrop
  // ============================================================
  function buildSpirals() {
    const layer = $('spirals');
    const arms = 4;
    let html = '';
    for (let a = 0; a < arms; a++) {
      const baseAngle = (a / arms) * 360;
      let path = '';
      for (let t = 0; t <= 130; t += 4) {
        const r = 30 + t * 6.2;
        const ang = (baseAngle + t * 1.6) * Math.PI / 180;
        const x = CENTER + r * Math.cos(ang);
        const y = CENTER + r * Math.sin(ang);
        if (t === 0) path += `M ${x.toFixed(1)} ${y.toFixed(1)} `;
        else path += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      html += `<path d="${path}" stroke-opacity="${0.04 + a * 0.005}"/>`;
    }
    layer.innerHTML = html;
  }

  // ============================================================
  // RENDER PLANETS
  // ============================================================
  function renderPlanets() {
    const layer = $('planetsLayer');
    let html = '';

    for (const loc of LOCATIONS) {
      const { x, y } = getCoords(loc);
      // visitedBy: 'c1' | 'c2' | 'both' | undefined
      const vBy = loc.visitedBy || (loc.visited ? 'c2' : null); // legacy fallback
      const visitedClass = vBy ? ('visited-' + vBy) : '';
      const destroyedClass = loc.destroyed ? 'destroyed' : '';
      const selectedClass = state.selectedId === loc.id ? 'selected' : '';
      const isStation = loc.rim === 'station';
      const isUnknown = loc.rim === 'unknown';

      // pick label position based on which side of center the planet is on
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const labelOffset = isStation || isUnknown ? 29 : 27;
      const lx = x + (dx / dist) * labelOffset;
      const ly = y + (dy / dist) * labelOffset;
      const anchor = dx > 30 ? 'start' : dx < -30 ? 'end' : 'middle';
      const baseline = dy > 30 ? 'hanging' : dy < -30 ? 'auto' : 'middle';
      const baselineAttr = baseline === 'hanging' ? 'hanging' : baseline === 'auto' ? 'auto' : 'central';

      let shape;
      if (isStation) {
        // diamond
        shape = `<rect class="planet-dot" x="${x - 6}" y="${y - 6}" width="12" height="12" transform="rotate(45 ${x} ${y})" />`;
      } else if (isUnknown) {
        // question mark in a dashed frame
        shape = `
          <rect class="unknown-marker-frame" x="${x - 18}" y="${y - 18}" width="36" height="36" rx="6" />
          <text class="unknown-marker-q" x="${x}" y="${y + 1}">?</text>
        `;
      } else {
        shape = `<circle class="planet-dot" cx="${x}" cy="${y}" r="9" />`;
      }

      // destroyed gets an X overlay
      const destroyedX = loc.destroyed
        ? `<line class="destroyed-cross" x1="${x - 9}" y1="${y - 9}" x2="${x + 9}" y2="${y + 9}" />
           <line class="destroyed-cross" x1="${x + 9}" y1="${y - 9}" x2="${x - 9}" y2="${y + 9}" />`
        : '';

      // Visited rings: C2 (HOC.2a) or C1 (The Codex Crew) — Both gets two rings.
      let visitedRings = '';
      const ringR = isStation ? 14 : 11;
      const ringR2 = ringR + 4;
      if (vBy === 'c2' || vBy === 'c1') {
        visitedRings = `<circle class="planet-ring" cx="${x}" cy="${y}" r="${ringR}" />`;
      } else if (vBy === 'both') {
        visitedRings = `
          <circle class="planet-ring" cx="${x}" cy="${y}" r="${ringR}" />
          <circle class="planet-ring-c1" cx="${x}" cy="${y}" r="${ringR2}" />
        `;
      }

      const selectionRing = state.selectedId === loc.id
        ? `<circle class="selection-ring" cx="${x}" cy="${y}" r="14" />`
        : '';

      // Label markers: ★ for C2, ✦ for C1, ★✦ for both, ✗ for destroyed
      let marker = '';
      if (loc.destroyed) marker = ' ✗';
      else if (vBy === 'c2') marker = ' ★';
      else if (vBy === 'c1') marker = ' ✦';
      else if (vBy === 'both') marker = ' ★✦';
      const labelText = `${escapeHtml(loc.name)}${marker}`;

      html += `
        <g tabindex="0" role="button" aria-label="Open ${escapeHtml(loc.name)}" class="planet ${loc.rim} ${visitedClass} ${destroyedClass} ${selectedClass}" data-loc="${loc.id}">
          <circle class="planet-hit" cx="${x}" cy="${y}" r="${isStation || isUnknown ? 26 : 18}" />
          ${shape}
          ${destroyedX}
          ${visitedRings}
          ${selectionRing}
          <text class="planet-label" x="${lx}" y="${ly}" text-anchor="${anchor}" alignment-baseline="${baselineAttr}">${labelText}</text>
        </g>
      `;
    }

    layer.innerHTML = html;
  }

  // ============================================================
  // PAN / ZOOM
  // ============================================================
  const stage = $('mapStage');
  const mapGroup = $('mapGroup');

  function applyTransform() {
    mapGroup.setAttribute('transform', `translate(${state.tx} ${state.ty}) scale(${state.scale})`);
    $('zoomDisplay').textContent = Math.round(state.scale * 100) + '%';
  }

  function clampScale(s) { return Math.max(0.4, Math.min(4.5, s)); }

  function zoomAt(clientX, clientY, deltaScale) {
    const rect = stage.getBoundingClientRect();
    // SVG point under cursor
    const svg = $('map');
    const viewBox = svg.viewBox.baseVal;
    const svgX = ((clientX - rect.left) / rect.width) * viewBox.width;
    const svgY = ((clientY - rect.top) / rect.height) * viewBox.height;

    // Current world point under cursor (before transform reverse)
    // worldX = (svgX - tx) / scale
    const worldX = (svgX - state.tx) / state.scale;
    const worldY = (svgY - state.ty) / state.scale;

    const newScale = clampScale(state.scale * deltaScale);
    state.tx = svgX - worldX * newScale;
    state.ty = svgY - worldY * newScale;
    state.scale = newScale;
    applyTransform();
  }

  function zoomCenter(deltaScale) {
    const rect = stage.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, deltaScale);
  }

  function resetView() {
    state.scale = 1;
    state.tx = 0;
    state.ty = 0;
    applyTransform();
  }

  // wheel zoom
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });

  // drag to pan
  stage.addEventListener('mousedown', (e) => {
    // ignore if right-click or modifier
    if (e.button !== 0) return;
    state.isDragging = true;
    state.dragStart = { x: e.clientX, y: e.clientY };
    state.panStart = { x: state.tx, y: state.ty };
    state.dragMoved = false;
    stage.classList.add('dragging');
  });
  window.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;
    const dx = e.clientX - state.dragStart.x;
    const dy = e.clientY - state.dragStart.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) state.dragMoved = true;
    // convert pixel delta to viewBox units
    const rect = stage.getBoundingClientRect();
    const vb = $('map').viewBox.baseVal;
    const sx = vb.width / rect.width;
    const sy = vb.height / rect.height;
    state.tx = state.panStart.x + dx * sx;
    state.ty = state.panStart.y + dy * sy;
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    state.isDragging = false;
    stage.classList.remove('dragging');
  });

  // touch support
  let lastTouchDistance = 0;
  let touchPanStart = null;
  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchPanStart = {
        x: e.touches[0].clientX, y: e.touches[0].clientY,
        tx: state.tx, ty: state.ty
      };
    } else if (e.touches.length === 2) {
      lastTouchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });
  stage.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && touchPanStart) {
      const dx = e.touches[0].clientX - touchPanStart.x;
      const dy = e.touches[0].clientY - touchPanStart.y;
      const rect = stage.getBoundingClientRect();
      const vb = $('map').viewBox.baseVal;
      state.tx = touchPanStart.tx + dx * (vb.width / rect.width);
      state.ty = touchPanStart.ty + dy * (vb.height / rect.height);
      applyTransform();
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastTouchDistance) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        zoomAt(cx, cy, d / lastTouchDistance);
      }
      lastTouchDistance = d;
      e.preventDefault();
    }
  }, { passive: false });
  stage.addEventListener('touchend', () => {
    touchPanStart = null;
    lastTouchDistance = 0;
  });

  // ============================================================
  // TOOLTIPS (hover)
  // ============================================================
  const tt = $('tooltip');
  function showTooltip(loc, e) {
    $('ttName').textContent = loc.name;
    const typeLabel = loc.rim === 'inner' ? 'Inner Rim · Fey Court' :
                      loc.rim === 'mid' ? 'Midreach · Tension Belt' :
                      loc.rim === 'outer' ? 'Outer Rim · Edge & End' :
                      loc.rim === 'station' ? 'Station / Waypoint' :
                      loc.rim === 'unknown' ? 'Unknown · Off-map' :
                      loc.rim === 'void' ? 'Void · The Maw' : '';
      const vBy = loc.visitedBy;
      const visitedNote = vBy === 'c2' ? '  ·  ★ CODEX CREW' :
                          vBy === 'c1' ? "  ·  ✦ LOR'S OLD CREW" :
                          vBy === 'both' ? '  ·  ★✦ BOTH CREWS' : '';
      $('ttType').textContent = typeLabel + visitedNote;
    tt.classList.add('show');
    moveTooltip(e);
  }
  function moveTooltip(e) {
    const x = (e.clientX || 0) + 14;
    const y = (e.clientY || 0) + 14;
    tt.style.left = Math.min(x, window.innerWidth - 250) + 'px';
    tt.style.top = Math.min(y, window.innerHeight - 60) + 'px';
  }
  function hideTooltip() { tt.classList.remove('show'); }

  // ============================================================
  // INFO PANEL
  // ============================================================
  function openInfo(loc) {
    state.selectedId = loc.id;
    saveState();

    const panel = $('infoPanel');
    const head = $('infoHead');
    const eyebrow = $('infoEyebrow');
    head.className = 'info-head ' + (loc.rim || '');
    eyebrow.className = 'info-eyebrow ' + (loc.rim || '');

    const typeLabel = loc.rim === 'inner' ? 'Inner Rim · Fey Court' :
                      loc.rim === 'mid' ? 'Midreach · Tension Belt' :
                      loc.rim === 'outer' ? 'Outer Rim · Edge & End' :
                      loc.rim === 'station' ? 'Station · Waypoint' :
                      loc.rim === 'unknown' ? 'Off-Map · Unknown Location' :
                      loc.rim === 'void' ? 'Void · Mawward Unknown' : '';
    $('infoType').textContent = typeLabel;
    $('infoTitle').textContent = loc.name;
    $('infoSubtitle').textContent = loc.subtitle || '';

    const vTag = $('visitedTag');
    const vBy = loc.visitedBy;
    if (vBy === 'c2') {
      vTag.textContent = '★ Visited · HOC.2a';
      vTag.className = 'visited-tag visited-c2';
      vTag.style.display = 'inline-flex';
    } else if (vBy === 'c1') {
      vTag.textContent = "✦ Visited · The Codex Crew";
      vTag.className = 'visited-tag visited-c1';
      vTag.style.display = 'inline-flex';
    } else if (vBy === 'both') {
      vTag.textContent = '★✦ Visited · Both Crews';
      vTag.className = 'visited-tag visited-both';
      vTag.style.display = 'inline-flex';
    } else {
      vTag.style.display = 'none';
    }

    let body = '';
    if (loc.image) {
      body += `
        <div class="info-section info-hero">
          <div class="planet-hero" data-img="${escapeHtml(loc.image)}" data-caption="${escapeHtml(loc.name)}">
            <img src="${escapeHtml(loc.image)}" alt="${escapeHtml(loc.name)}" onerror="this.parentNode.style.display='none';">
          </div>
        </div>
      `;
    }
    body += `
      <div class="info-section">
        <div class="info-section-label">Field Notes</div>
        <div class="info-text">${loc.desc}</div>
      </div>
    `;

    // Deity / Court (Inner Rim)
    if (loc.deity) {
      const initial = loc.deity.name.replace(/^The /, '').charAt(0);
      body += `
        <div class="info-section">
          <div class="info-section-label">Prime Deity of Worship</div>
          <div class="info-text" style="font-size: 12.5px; margin-bottom: 10px; color: var(--muted);">
            One of the <strong>Thirteen Primordials</strong> of the pantheon. The local Fey Court rules in their name.
          </div>
          <div class="deity-card">
            <div class="deity-sigil">${escapeHtml(initial)}</div>
            <div>
              <div class="deity-name">${escapeHtml(loc.deity.name)}</div>
              <div class="deity-domain">${escapeHtml(loc.deity.domain)}</div>
              ${loc.court ? `<div class="deity-court">⟡ ${escapeHtml(loc.court)}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Known Contacts
    if (loc.contacts && loc.contacts.length) {
      body += `
        <div class="info-section">
          <div class="info-section-label">Known Contacts</div>
          <div class="contact-list">
            ${loc.contacts.map(c => {
              const factionClass = (c.faction || '').toLowerCase().split(/[ ·]/)[0].replace(/[^a-z]/g, '');
              return `
                <div class="contact-card ${factionClass}">
                  ${c.image ? `<button class="media-contact-image" data-img="${c.image}" data-caption="${escapeHtml(c.name)}"><img src="${c.image}" alt="${escapeHtml(c.name)}" loading="lazy"></button>` : ''}
                  <div class="contact-row">
                    <span class="contact-name">${escapeHtml(c.name)}</span>
                    ${c.faction ? `<span class="contact-faction">${escapeHtml(c.faction)}</span>` : ''}
                  </div>
                  ${c.role ? `<div class="contact-role">${escapeHtml(c.role)}</div>` : ''}
                  ${c.desc ? `<div class="contact-desc">${c.desc}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Intel & Hooks
    if (loc.intel && loc.intel.length) {
      body += `
        <div class="info-section">
          <div class="info-section-label">Active Intel & Hooks</div>
          <ul class="intel-list">
            ${loc.intel.map(i => `<li class="intel-item">${i}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Faction Presence
    if (loc.factions && loc.factions.length) {
      body += `
        <div class="info-section">
          <div class="info-section-label">Faction Presence</div>
          <div class="faction-tags">
            ${loc.factions.map(f => {
              const lower = f.toLowerCase();
              const cls = lower.includes('hostile') || lower.includes('hunting') || lower.includes('destroyed') ? 'hostile' :
                          lower.includes('allied') ? 'allied' :
                          lower.includes('warning') || lower.includes('incoming') || lower.includes('covert') ? 'warning' : '';
              return `<span class="faction-tag ${cls}">${escapeHtml(f)}</span>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (state.dmMode && loc.dmNotes) {
      body += `
        <div class="info-section dm">
          <div class="info-section-label">DM Notes — Session Context</div>
          <div class="info-text">${loc.dmNotes}</div>
        </div>
      `;
    } else if (!state.dmMode && loc.dmNotes) {
      body += `
        <div class="info-section">
          <div class="info-section-label">DM Notes</div>
          <div class="info-text" style="color: var(--muted); font-style: italic; font-size: 12.5px;">★ Toggle <strong>DM Mode</strong> in the top bar to reveal session-specific notes for this location.</div>
        </div>
      `;
    }

    body += artAtPlace(loc);
    const children = PLACE_ENTRIES.filter(p=>p.parent===loc.id);
    if (children.length) body += `<div class="info-section"><div class="info-section-label">Places &amp; Landmarks</div>${children.map(p=>`<button class="media-button" data-place="${p.id}">${escapeHtml(p.name)}</button>`).join('')}</div>`;
    body += ghostAtPlace(loc);
    $('infoBody').innerHTML = body;
    panel.classList.add('open');
    renderPlanets(); // re-render to update selection highlight
  }
  function closeInfo() {
    state.selectedId = null;
    saveState();
    $('infoPanel').classList.remove('open');
    renderPlanets();
  }
  function openRim(rimKey) {
    const r = RIMS[rimKey];
    if (!r) return;
    openInfo({
      id: 'rim-' + rimKey,
      name: r.name,
      rim: rimKey,
      subtitle: r.subtitle,
      desc: r.desc
    });
  }

  // ============================================================
  // COMPENDIUM
  // ============================================================
  const compendiumState = {
    tab: 'journey',
    crewFilter: 'all', // 'all' | 'c1' | 'c2'
  };

  function crewTagHtml(crew) {
    if (crew === 'c1') return '<span class="crew-tag c1">✦ The Codex Crew</span>';
    if (crew === 'c2') return '<span class="crew-tag c2">★ HOC.2a</span>';
    if (crew === 'both') return '<span class="crew-tag both">★✦ Both Crews</span>';
    return '';
  }

  function locationLink(loc) {
    if (!loc) return '';
    if (!loc.id) return `<span class="hook-pill location">📍 ${escapeHtml(loc.label || '')}</span>`;
    return `<a class="hook-pill location" data-fly="${escapeHtml(loc.id)}">📍 ${escapeHtml(loc.label || loc.id)}</a>`;
  }
  function locationLinkPlain(loc) {
    if (!loc || !loc.id) return '';
    return `<span class="dir-where" data-fly="${escapeHtml(loc.id)}">📍 ${escapeHtml(loc.label || loc.id)}</span>`;
  }

  function passesFilter(crew) {
    if (compendiumState.crewFilter === 'all') return true;
    if (compendiumState.crewFilter === 'c1') return crew === 'c1' || crew === 'both';
    if (compendiumState.crewFilter === 'c2') return crew === 'c2' || crew === 'both';
    return true;
  }

  function renderCrewFilter() {
    const cf = compendiumState.crewFilter;
    return `
      <div class="crew-filter" id="crewFilter">
        <button class="${cf === 'all' ? 'active' : ''}" data-filter="all">All</button>
        <button class="c2 ${cf === 'c2' ? 'active' : ''}" data-filter="c2">★ HOC.2a</button>
        <button class="c1 ${cf === 'c1' ? 'active' : ''}" data-filter="c1">✦ The Codex Crew</button>
      </div>
    `;
  }

  function renderJourney() {
    // Order per Nicky's note: descending. Latest C2 (HOC.2a) first, then C1 (Codex Crew) latest first.
    const c2Desc = [...SESSIONS].reverse();
    const c1Desc = [...C1_LOG].reverse();
    const allSessions = [...c2Desc, ...c1Desc];
    const filtered = allSessions.filter(s => passesFilter(s.crew));
    if (!filtered.length) {
      return '<div class="empty-state">No sessions match this filter yet. Switch crew filter to see more.</div>';
    }
    return filtered.map(s => {
      const dmBlock = (state.dmMode && s.dmOnly)
        ? `<div class="session-dm">
             <div class="session-dm-label">DM Notes — Behind the Curtain</div>
             <div class="session-dm-body">${s.dmOnly}</div>
           </div>`
        : '';
      const where = s.where ? `<div class="session-where">${locationLink(s.where)}</div>` : '';
      const moments = s.moments && s.moments.length ? `
        <div class="session-moments">
          <div class="session-moments-label">Moments</div>
          <ul>
            ${s.moments.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      ` : '';
      return `
        <div class="session-card ${s.crew}">
          <div class="session-head">
            <div>
              <div class="session-num">Session ${escapeHtml(s.num)}</div>
              <h3 class="session-title">${escapeHtml(s.title)}</h3>
            </div>
            ${crewTagHtml(s.crew)}
          </div>
          ${where}
          <div class="session-summary">${s.summary}</div>
          ${moments}
          ${recapHtml(Number(s.num.replace('S','')))}
          ${s.num === 'S11' ? MEDIA.recordings.filter(r=>r.session===11).map(audioHtml).join('') : ''}
          ${dmBlock}
        </div>
      `;
    }).join('');
  }

  function renderHooks() {
    const allHooks = [...HOOKS, ...(state.dmMode ? HOOKS_DM : [])];
    const filtered = allHooks.filter(h => passesFilter(h.crew));
    // Sort: C2 (HOC.2a) always before C1 (The Codex Crew); within each crew, urgent first.
    const crewRank = (c) => (c === 'c2' ? 0 : c === 'both' ? 1 : 2);
    filtered.sort((a, b) => {
      const cr = crewRank(a.crew) - crewRank(b.crew);
      if (cr !== 0) return cr;
      return (b.urgency === 'urgent' ? 1 : 0) - (a.urgency === 'urgent' ? 1 : 0);
    });
    if (!filtered.length) return '<div class="empty-state">No open hooks for this crew filter.</div>';
    return filtered.map(h => {
      const urgency = h.urgency === 'urgent' ? 'urgent' : '';
      const kind = h.kind || '';
      const pills = [];
      if (h.urgency === 'urgent') pills.push('<span class="hook-pill urgent">⚠ Urgent</span>');
      if (h.kind === 'bounty') pills.push('<span class="hook-pill bounty">Bounty</span>');
      if (h.kind === 'lore') pills.push('<span class="hook-pill">Lore Thread</span>');
      if (h.giver) pills.push(`<span class="hook-pill giver">From: ${escapeHtml(h.giver)}</span>`);
      if (h.location) pills.push(locationLink(h.location));
      pills.push(crewTagHtml(h.crew));
      return `
        <div class="hook-card ${urgency} ${kind}">
          <div class="hook-head">
            <span class="hook-title">${escapeHtml(h.title)}</span>
          </div>
          <div class="hook-pills" style="margin-bottom: 6px;">${pills.join('')}</div>
          <div class="hook-desc">${h.desc}</div>
        </div>
      `;
    }).join('');
  }

  function stanceClass(stance) {
    return (stance || '').toLowerCase().split(/[ ·]/)[0].replace(/[^a-z]/g, '');
  }

  // Portrait helper — renders <img> if image provided, fallback initial otherwise.
  // Uses onerror to gracefully fall back if image file is missing on disk.
  function portraitHtml(p) {
    const initial = (p.name || '?').trim().charAt(0).toUpperCase();
    // NOTE: fallback uses single-quoted attrs so it can sit inside an onerror="..." double-quoted HTML attr without breaking it.
    const fallback = `<div class='dir-portrait-fallback'>${escapeHtml(initial)}</div>`;
    const fallbackForJs = fallback.replace(/'/g, "\\'");
    const fallbackInline = `<div class="dir-portrait-fallback">${escapeHtml(initial)}</div>`;
    const caption = escapeHtml(p.name || '');
    if (p.image) {
      return `<div class="dir-portrait" data-img="${escapeHtml(p.image)}" data-caption="${caption}">
        <img src="${escapeHtml(p.image)}" alt="${caption}" onerror="this.parentNode.innerHTML='${fallbackForJs}';">
      </div>`;
    }
    return `<div class="dir-portrait">${fallbackInline}</div>`;
  }

  function renderDirectory(items) {
    const filtered = items.filter(p => passesFilter(p.crew));
    if (!filtered.length) return '<div class="empty-state">No entries for this crew filter.</div>';
    return `<div class="directory-grid">${filtered.map(p => {
      const cls = stanceClass(p.stance);
      const stanceLabel = (p.stance || '').replace(/-/g, ' ');
      return `
        <div class="dir-card ${cls}">
          ${portraitHtml(p)}
          <div class="dir-body">
            <div class="dir-head">
              <span class="dir-name">${escapeHtml(p.name)}</span>
              <span class="dir-faction">${escapeHtml(stanceLabel)}</span>
            </div>
            ${p.kind ? `<div class="dir-role">${escapeHtml(p.kind)}</div>` : ''}
            ${p.role ? `<div class="dir-role">${p.role}</div>` : ''}
            ${p.desc ? `<div class="dir-desc">${p.desc}</div>${['Yarrow Salt','Zelqua','Rex','Amarante'].includes(p.name)?contrabandBookmark('Under the counter'):''}` : ''}
            <div class="dir-meta">
              ${crewTagHtml(p.crew)}
              ${p.location ? locationLinkPlain(p.location) : ''}
            </div>
          </div>
        </div>
      `;
    }).join('')}</div>`;
  }

  // Stance classification — mutually exclusive Contacts vs POI per Nicky's note.
  // CONTACTS = people the party has met and can reach (allies, friendlies, job-givers, captives, mercenaries).
  // POI      = named figures the party should know but can't necessarily call on (hostiles, deceased, unknown observers, eidolons-at-large).
  const CONTACT_STANCES = ['allied', 'friendly', 'jobgiver', 'job-giver', 'mercenary', 'captive'];
  const POI_STANCES     = ['hostile', 'deceased', 'unknown', 'untrustworthy', 'eidolon', 'observer'];

  function isContact(p) {
    const s = stanceClass(p.stance);
    return CONTACT_STANCES.some(x => stanceClass(x) === s);
  }
  function isPOI(p) {
    const s = stanceClass(p.stance);
    return POI_STANCES.some(x => stanceClass(x) === s);
  }

  function renderContacts() {
    const items = POI.filter(isContact);
    return renderDirectory(items);
  }

  function renderPOI() {
    let items = POI.filter(isPOI);
    if (state.dmMode) items = items.concat(POI_DM);
    return renderDirectory(items);
  }

  // ============================================================
  // CREW — PC roster with portraits
  // ============================================================
  function renderCrew() {
    const sorted = [...CREW].sort((a, b) => (a.order || 99) - (b.order || 99));
    if (!sorted.length) return '<div class="empty-state">No crew loaded.</div>';
    const active = sorted.filter(c => c.status !== 'fallen' && c.status !== 'departed');
    const departed = sorted.filter(c => c.status === 'departed');
    const fallen = sorted.filter(c => c.status === 'fallen');

    function crewCard(c) {
      const initial = (c.name || '?').trim().charAt(0).toUpperCase();
      // Single-quoted attrs in the JS-string fallback so it survives inside onerror="..."
      const fallback = `<div class='crew-portrait-fallback'>${escapeHtml(initial)}</div>`;
      const fallbackForJs = fallback.replace(/'/g, "\\'");
      const fallbackInline = `<div class="crew-portrait-fallback">${escapeHtml(initial)}</div>`;
      const caption = escapeHtml(c.fullName || c.name || '');
      const hasAlt = !!c.altImage;
      const swapBadge = hasAlt
        ? `<div class="crew-portrait-swap" data-swap-portrait data-primary="${escapeHtml(c.image)}" data-alt="${escapeHtml(c.altImage)}" data-alt-label="${escapeHtml(c.altLabel || 'Alt')}" data-state="primary" title="Click to swap portrait">${escapeHtml(c.altLabel || 'Alt')}</div>`
        : '';
      const portrait = c.image
        ? `<div class="crew-portrait" data-img="${escapeHtml(c.image)}" data-caption="${caption}">
             <img src="${escapeHtml(c.image)}" alt="${caption}" onerror="this.parentNode.innerHTML='${fallbackForJs}';">
             ${swapBadge}
           </div>`
        : `<div class="crew-portrait">${fallbackInline}</div>`;
      const statusLabel = c.status === 'fallen' ? '✗ Fallen' : c.status === 'departed' ? '◇ With the Lux Codicants' : '★ Active';
      return `
        <div class="crew-card ${c.status === 'fallen' ? 'fallen' : ''}">
          ${portrait}
          <div class="crew-info">
            <div class="crew-name">${escapeHtml(c.name)}</div>
            ${c.pronouns ? `<div class="crew-pronouns">${escapeHtml(c.pronouns)}</div>` : ''}
            ${c.species ? `<div class="crew-class">${escapeHtml(c.species)}</div>` : ''}
            ${c.class ? `<div class="crew-class" style="color:var(--muted);">${escapeHtml(c.class)}</div>` : ''}
            ${c.tagline ? `<div class="crew-tagline">${c.tagline}</div>${['Killua','5p0r3','Rook'].includes(c.name)?contrabandBookmark('Personal effects'):''}` : ''}
            <div class="crew-status">${statusLabel}</div>
          </div>
        </div>
      `;
    }

    let out = '';

    // ===== HERO BANNER — HOC.2a party portrait =====
    out += `
      <div class="crew-hero-banner" data-img="images/portraits/hoc-2a-party.png" data-caption="HOC.2a — The Crew">
        <img src="images/portraits/hoc-2a-party.png" alt="HOC.2a Party Portrait" onerror="this.parentNode.style.display='none';">
        <div class="crew-hero-overlay">
          HOC.2a
          <span class="crew-hero-sub">Lor · Killua · Aelyn Vox · Flint · 5p0r3 — bound by the Codex</span>
        </div>
      </div>
    `;

    if (active.length) {
      out += `<div class="heat-section-label" style="margin-top:0;">HOC.2a — Active Crew</div>`;
      out += `<div class="crew-grid">${active.map(crewCard).join('')}</div>`;
    }
    if (departed.length) out += `<div class="heat-section-label">Friends Beyond the Ship</div><div class="crew-grid">${departed.map(crewCard).join('')}</div>`;
    if (fallen.length) {
      out += `<div class="heat-section-label">The Fallen</div>`;
      out += `<div class="crew-grid">${fallen.map(crewCard).join('')}</div>`;
    }
    return out;
  }

  // ============================================================
  // RACES — species directory
  // ============================================================
  function renderRaces() {
    if (!RACES.length) return '<div class="empty-state">No races loaded.</div>';
    return `<div class="races-grid">${RACES.map(r => {
      // Image path: tvaari is jpg, everything else png
      const ext = r.slug === 'tvaari' ? 'jpg' : 'png';
      const imgPath = `images/races/${r.slug}.${ext}`;
      // Fallback uses single-quoted attrs so it survives inside onerror="..."
      const fallbackForJs = `<div class=\\'race-art-fallback\\'><div class=\\'race-glyph\\'>${r.glyph || '✦'}</div><div class=\\'race-fallback-name\\'>${escapeHtml(r.name)}</div></div>`;
      const fallbackInline = `<div class="race-art-fallback"><div class="race-glyph">${r.glyph || '✦'}</div><div class="race-fallback-name">${escapeHtml(r.name)}</div></div>`;
      const caption = escapeHtml(r.name);
      const hasAlt = !!r.altImage;
      const swapBadge = hasAlt
        ? `<div class="crew-portrait-swap" data-swap-portrait data-primary="${escapeHtml(imgPath)}" data-alt="${escapeHtml(r.altImage)}" data-alt-label="${escapeHtml(r.altLabel || 'Alt')}" data-state="primary" title="Click to swap art">${escapeHtml(r.altLabel || 'Alt')}</div>`
        : '';
      const art = r.slug
        ? `<div class="race-art crew-portrait" data-img="${escapeHtml(imgPath)}" data-caption="${caption}">
             <img src="${escapeHtml(imgPath)}" alt="${caption}" onerror="this.parentNode.innerHTML='${fallbackForJs}';">
             ${swapBadge}
           </div>`
        : `<div class="race-art">${fallbackInline}</div>`;
      const abilities = r.abilities && r.abilities.length
        ? `<div class="race-abilities">
             <div class="race-abilities-label">Abilities</div>
             ${r.abilities.map(a => `<div class="race-ability">${a}</div>`).join('')}
           </div>`
        : '';
      return `
        <div class="race-card ${r.rim || ''}">
          ${art}
          <div class="race-info">
            <div class="race-name">${escapeHtml(r.name)}</div>
            ${r.homeworld ? `<div class="race-homeworld">${escapeHtml(r.homeworld)}</div>` : ''}
            ${r.bio ? `<div class="race-bio">${escapeHtml(r.bio)}</div>` : ''}
            ${r.role ? `<div class="race-role">${escapeHtml(r.role)}</div>` : ''}
            ${abilities}
            ${r.notes ? `<div class="race-notes">${escapeHtml(r.notes)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('')}</div>`;
  }

  // ============================================================
  // HEAT — faction tension, Null attention, scars, omens
  // ============================================================
  function renderHeat() {
    if (!HEAT.length) return '<div class="empty-state">No heat data loaded.</div>';

    function heatCard(h) {
      const pips = h.clock
        ? Array.from({ length: h.clock.max }, (_, i) =>
            `<div class="heat-pip${i < h.clock.current ? ' filled' : ''}"></div>`
          ).join('')
        : '';
      const levelLabel = h.clock ? `${h.clock.current}/${h.clock.max}` : (h.level || '');
      return `
        <div class="heat-card ${h.level || ''}">
          <div class="heat-head">
            <span class="heat-name">${escapeHtml(h.name)}</span>
            <span class="heat-level">${escapeHtml(levelLabel)}</span>
          </div>
          ${pips ? `<div class="heat-clock">${pips}</div>` : ''}
          ${h.desc ? `<div class="heat-desc">${h.desc}</div>` : ''}
          ${h.trigger ? `<div class="heat-trigger">${h.trigger}</div>` : ''}
        </div>
      `;
    }

    function omenCard(o) {
      return `
        <div class="omen-card ${o.seen ? 'seen' : 'unseen'}">
          <div class="omen-name">${escapeHtml(o.name)}</div>
          <div class="omen-status">${o.seen ? '◉ Seen / Active' : '○ Unseen'}</div>
          <div class="omen-desc">${o.desc}</div>
        </div>
      `;
    }

    const factions = HEAT.filter(h => h.category === 'faction');
    const nulls    = HEAT.filter(h => h.category === 'null');
    const scars    = HEAT.filter(h => h.category === 'scar');
    const memory   = HEAT.filter(h => h.category === 'memory');
    const omens    = HEAT.filter(h => h.category === 'omen');

    let out = '';
    if (factions.length) {
      out += `<div class="heat-section">
        <div class="heat-section-label">Faction Heat</div>
        <div class="heat-grid">${factions.map(heatCard).join('')}</div>
      </div>`;
    }
    if (nulls.length) {
      out += `<div class="heat-section">
        <div class="heat-section-label">Null Attention &amp; the Maw</div>
        <div class="heat-grid">${nulls.map(heatCard).join('')}</div>
      </div>`;
    }
    if (scars.length) {
      out += `<div class="heat-section">
        <div class="heat-section-label">Strain &amp; Scars (per PC)</div>
        <div class="heat-grid">${scars.map(heatCard).join('')}</div>
      </div>`;
    }
    if (memory.length) {
      out += `<div class="heat-section">
        <div class="heat-section-label">Memory Tax &amp; Collateral</div>
        <div class="heat-grid">${memory.map(heatCard).join('')}</div>
      </div>`;
    }
    if (omens.length) {
      out += `<div class="heat-section">
        <div class="heat-section-label">Active Omens — "The Weave Unravels"</div>
        <div class="omen-list">${omens.map(omenCard).join('')}</div>
      </div>`;
    }
    return out;
  }

  function renderFactions() {
    return FACTIONS.map(f => {
      const stance = stanceClass(f.stance);
      const detailItems = f.details && f.details.length
        ? `<div class="faction-detail-label">Active Threads</div>
           <ul class="faction-detail-list">
             ${f.details.map(d => `<li>${d}</li>`).join('')}
           </ul>`
        : '';
      const memberItems = f.members && f.members.length
        ? `<div class="faction-detail-label" style="margin-top: 12px;">Known Figures</div>
           <ul class="faction-detail-list">
             ${f.members.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
           </ul>`
        : '';
      return `
        <div class="faction-card ${stance}">
          <div class="faction-head">
            <span class="faction-name">${escapeHtml(f.name)}</span>
            <span class="faction-stance">${escapeHtml(f.stance)}</span>
          </div>
          <div class="faction-blurb">${f.blurb}</div>
          ${detailItems}
          ${memberItems}
        </div>
      `;
    }).join('');
  }

  // ============================================================
  // VISUAL CODEX — Bragg's monologue lore gallery
  // ============================================================
  function renderVisualCodex() {
    if (!VISUAL_CODEX.length) return '<div class="empty-state">No codex entries loaded.</div>';

    const intro = `
      <div class="codex-intro">
        <div class="codex-intro-eyebrow">⟡ S5 · Edgewatch 9 · Bragg Mentan</div>
        <div class="codex-intro-text">
          The full lore dump as Bragg laid it out — Veilforging, Primordials, the Maw, the First Hollow, the Null, Veilborn, Fractured, Veilbeasts, Veil Titans, Eidolons, the Shattering. Click any panel to enlarge.
        </div>
      </div>
    `;

    const cards = VISUAL_CODEX.map(c => {
      const src = `images/lore/${c.slug}.png`;
      return `
        <div class="codex-card">
          <div class="codex-img" data-img="${escapeHtml(src)}" data-caption="${escapeHtml(c.title)}">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(c.title)}" onerror="this.parentNode.innerHTML='<div style=&quot;display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-family:Cinzel,serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;&quot;>Image Pending</div>';">
          </div>
          <div class="codex-meta">
            <div class="codex-title">${escapeHtml(c.title)}</div>
            <div class="codex-caption">${escapeHtml(c.caption)}</div>
          </div>
        </div>
      `;
    }).join('');

    return intro + `<div class="codex-grid">${cards}</div>`;
  }

  function renderCompendium() {
    // Update counts
    const sessionCount = SESSIONS.length + C1_LOG.length;
    const hookCount = HOOKS.length + (state.dmMode ? HOOKS_DM.length : 0);
    const contactCount = POI.filter(isContact).length;
    const poiCount = POI.filter(isPOI).length + (state.dmMode ? POI_DM.length : 0);
    const crewCount = CREW.length;
    const heatCount = HEAT.length;
    const racesCount = RACES.length;
    const codexCount = VISUAL_CODEX.length;
    $('cnt-journey').textContent = `(${sessionCount})`;
    $('cnt-hooks').textContent = `(${hookCount})`;
    $('cnt-crew').textContent = `(${crewCount})`;
    $('cnt-contacts').textContent = `(${contactCount})`;
    $('cnt-poi').textContent = `(${poiCount})`;
    $('cnt-factions').textContent = `(${FACTIONS.length})`;
    $('cnt-heat').textContent = `(${heatCount})`;
    $('cnt-races').textContent = `(${racesCount})`;
    const codexCountEl = $('cnt-codex');
    if (codexCountEl) codexCountEl.textContent = `(${codexCount})`;

    // Pick body content
    let inner = '';
    const filterUI = renderCrewFilter();
    switch (compendiumState.tab) {
      case 'recaps': inner = renderRecaps(); break;
      case 'ghost': inner = renderGhost(); break;
      case 'places': inner = renderPlaces(); break;
      case 'art': inner = renderArt(); break;
      case 'journey':  inner = filterUI + renderJourney(); break;
      case 'hooks':    inner = filterUI + renderHooks(); break;
      case 'crew':     inner = renderCrew(); break;
      case 'contacts': inner = filterUI + renderContacts(); break;
      case 'poi':      inner = filterUI + renderPOI(); break;
      case 'factions': inner = renderFactions(); break;
      case 'heat':     inner = renderHeat(); break;
      case 'races':    inner = renderRaces(); break;
      case 'codex':    inner = renderVisualCodex(); break;
    }
    $('compendiumBody').innerHTML = inner;
    $('compendiumBody').scrollTop = 0;

    // Update active tab visual
    qsa('.comp-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === compendiumState.tab));
  }

  function openCompendium() {
    $('compendium').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCompendium();
  }
  function closeCompendium() {
    $('compendium').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ============================================================
  // LIGHTBOX — enlarged portrait/race art view
  // ============================================================
  function openLightbox(imgSrc, caption) {
    const lb = $('lightbox');
    const img = $('lightboxImg');
    const cap = $('lightboxCaption');
    if (!lb || !img) return;
    img.src = imgSrc;
    img.alt = caption || '';
    if (cap) cap.textContent = caption || '';
    lb.classList.add('open');
  }
  function closeLightbox() {
    const lb = $('lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    const img = $('lightboxImg');
    if (img) img.src = '';
  }

  // Wire up Compendium events
  document.addEventListener('click', (e) => {
    if (e.target.closest('#openCompendium')) { openCompendium(); return; }
    if (e.target.closest('#compendiumClose')) { closeCompendium(); return; }
    // close on overlay backdrop click (but not card)
    if (e.target.id === 'compendium') { closeCompendium(); return; }

    // ===== LIGHTBOX =====
    // Close lightbox on close button or backdrop click
    if (e.target.closest('#lightboxClose') || e.target.id === 'lightbox') {
      closeLightbox();
      return;
    }
    // Crew portrait swap (Killua: regular ↔ echo sheath) — handled BEFORE lightbox so it doesn't fire
    const swapClick = e.target.closest('[data-swap-portrait]');
    if (swapClick) {
      e.stopPropagation();
      const wrapper = swapClick.closest('.crew-portrait');
      if (!wrapper) return;
      const imgEl = wrapper.querySelector('img');
      if (!imgEl) return;
      const currentState = swapClick.dataset.state || 'primary';
      const primary = swapClick.dataset.primary;
      const alt = swapClick.dataset.alt;
      const altLabel = swapClick.dataset.altLabel || 'Alt';
      if (currentState === 'primary') {
        imgEl.src = alt;
        wrapper.dataset.img = alt;
        swapClick.textContent = 'Standard';
        swapClick.dataset.state = 'alt';
      } else {
        imgEl.src = primary;
        wrapper.dataset.img = primary;
        swapClick.textContent = altLabel;
        swapClick.dataset.state = 'primary';
      }
      return;
    }
    // Open lightbox when clicking any portrait/race art with data-img
    const portraitClick = e.target.closest('[data-img]');
    if (portraitClick) {
      const img = portraitClick.dataset.img;
      const caption = portraitClick.dataset.caption || '';
      // Only open if the image actually loaded (img tag exists inside)
      const imgEl = portraitClick.querySelector('img');
      if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        openLightbox(img, caption);
        return;
      }
    }

    const tab = e.target.closest('.comp-tab');
    if (tab) {
      compendiumState.tab = tab.dataset.tab;
      renderCompendium();
      return;
    }
    const cf = e.target.closest('#crewFilter button');
    if (cf) {
      compendiumState.crewFilter = cf.dataset.filter;
      renderCompendium();
      return;
    }
    const fly = e.target.closest('[data-fly]');
    if (fly) {
      const id = fly.dataset.fly;
      const loc = findLoc(id);
      if (loc) {
        closeCompendium();
        openInfo(loc);
        if (loc.parent) flyTo(findLoc(loc.parent));
        else if (LOCATIONS.includes(loc) || loc.id==='maw' || loc.id==='fey-core') flyTo(loc);
      }
      return;
    }
  });

  // ============================================================
  // EVENT WIRING
  // ============================================================
  // SVG click delegation
  $('map').addEventListener('mousemove', (e) => {
    const planet = e.target.closest('.planet');
    if (planet) {
      const loc = findLoc(planet.dataset.loc);
      if (loc) showTooltip(loc, e);
      return;
    }
    const core = e.target.closest('.fey-core');
    if (core) {
      showTooltip(findLoc('fey-core'), e);
      return;
    }
    const void_ = e.target.closest('.void-anomaly');
    if (void_) { showTooltip(VOID, e); return; }
    const ring = e.target.closest('.rim-ring');
    if (ring) {
      const r = RIMS[ring.dataset.rim];
      if (r) {
        $('ttName').textContent = r.name;
        $('ttType').textContent = r.subtitle;
        tt.classList.add('show');
        moveTooltip(e);
      }
      return;
    }
    hideTooltip();
  });
  $('map').addEventListener('mouseleave', hideTooltip);

  $('map').addEventListener('click', (e) => {
    if (state.dragMoved) { state.dragMoved = false; return; }

    const planet = e.target.closest('.planet');
    if (planet) { const loc = findLoc(planet.dataset.loc); if (loc) openInfo(loc); return; }

    const core = e.target.closest('.fey-core');
    if (core) { openInfo(findLoc('fey-core')); return; }

    const void_ = e.target.closest('.void-anomaly');
    if (void_) { openInfo(VOID); return; }

    const ring = e.target.closest('.rim-ring, .rim-band');
    if (ring) { openRim(ring.dataset.rim); return; }
  });

  // Top-bar controls
  document.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]');
    if (action) {
      const a = action.dataset.action;
      if (a === 'zoom-in') zoomCenter(1.25);
      else if (a === 'zoom-out') zoomCenter(1 / 1.25);
      else if (a === 'reset') resetView();
    }
    if (e.target.closest('#infoClose')) closeInfo();
    if (e.target.closest('#dmToggle')) {
      // Password gate — turning ON requires the password; turning OFF is free.
      if (!state.dmMode) {
        const entered = prompt('DM Mode — enter password:');
        if (entered === null) return; // cancelled
        if (entered !== DM_PASSWORD) {
          alert('Incorrect password.');
          return;
        }
      }
      state.dmMode = !state.dmMode;
      saveState();
      $('dmToggle').classList.toggle('on', state.dmMode);
      // re-render currently open panel
      if (state.selectedId) {
        const loc = findLoc(state.selectedId);
        if (loc) openInfo(loc);
      }
      // re-render compendium if it's open
      if ($('compendium').classList.contains('open')) renderCompendium();
    }
    if (e.target.closest('#hintClose')) {
      $('helpHint').classList.add('fade');
    }
  });

  // SEARCH
  const searchInput = $('search');
  const searchResults = $('searchResults');
  function buildSearchIndex() {
    const items = [];
    for (const loc of [...LOCATIONS,...PLACE_ENTRIES]) items.push(loc);
    items.push(VOID);
    items.push({ id: 'fey-core', name: 'Fey Court Core', rim: 'inner', subtitle: 'Heart of the Inner Rim' });
    return items;
  }
  const searchIndex = buildSearchIndex();

  function renderSearchResults(query) {
    if (!query) { searchResults.classList.remove('open'); return; }
    const q = query.toLowerCase();
    const matches = searchIndex.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      (loc.subtitle && loc.subtitle.toLowerCase().includes(q)) ||
      (loc.rim && loc.rim.toLowerCase().includes(q))
    ).slice(0, 12);
    if (!matches.length) {
      searchResults.innerHTML = `<div class="search-result" style="color:var(--muted); cursor:default">No matches for "${escapeHtml(query)}"</div>`;
    } else {
      searchResults.innerHTML = matches.map(m => {
        const t = m.rim === 'inner' ? 'Inner' : m.rim === 'mid' ? 'Midreach' :
                  m.rim === 'outer' ? 'Outer' : m.rim === 'station' ? 'Station' :
                  m.rim === 'void' ? 'Void' : 'Unknown';
        return `<div class="search-result" data-search-id="${m.id}">
          <span>${escapeHtml(m.name)}</span>
          <span class="search-result-type">${t}</span>
        </div>`;
      }).join('');
    }
    searchResults.classList.add('open');
  }
  searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));
  searchInput.addEventListener('focus', () => { if (searchInput.value) renderSearchResults(searchInput.value); });
  searchInput.addEventListener('blur', () => { setTimeout(() => searchResults.classList.remove('open'), 180); });
  searchResults.addEventListener('click', (e) => {
    const r = e.target.closest('.search-result');
    if (!r || !r.dataset.searchId) return;
    const loc = findLoc(r.dataset.searchId);
    if (loc) {
      openInfo(loc);
      // pan/zoom to it
      flyTo(loc);
      searchInput.value = '';
      searchResults.classList.remove('open');
      searchInput.blur();
    }
  });

  function flyTo(loc) {
    if(loc.parent)loc=findLoc(loc.parent);
    if(loc.angle==null&&loc.x==null)return;
    const { x, y } = getCoords(loc);
    const targetScale = Math.max(state.scale, 1.6);
    const vb = $('map').viewBox.baseVal;
    state.scale = targetScale;
    // center the point in the viewport
    state.tx = vb.width / 2 - x * targetScale;
    state.ty = vb.height / 2 - y * targetScale;
    mapGroup.style.transition = 'none';
    requestAnimationFrame(() => {
      mapGroup.style.transition = 'transform 0.6s cubic-bezier(0.32, 0.72, 0.24, 1)';
      applyTransform();
      setTimeout(() => mapGroup.style.transition = '', 700);
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target === searchInput) {
      if (e.key === 'Escape') searchInput.blur();
      return;
    }
    // Close lightbox first if open
    if (e.key === 'Escape' && $('lightbox').classList.contains('open')) {closeLightbox();return;}
    if (e.key === 'Escape') {
      const lb = $('lightbox');
      if (lb && lb.classList.contains('open')) {
        closeLightbox();
        return;
      }
    }
    if (e.key === '/') { e.preventDefault(); searchInput.focus(); }
    if (e.key === '0') { resetView(); }
    if (e.key === 'd' || e.key === 'D') {
      if (!state.dmMode) {
        const entered = prompt('DM Mode — enter password:');
        if (entered === null) return;
        if (entered !== DM_PASSWORD) { alert('Incorrect password.'); return; }
      }
      state.dmMode = !state.dmMode;
      saveState();
      $('dmToggle').classList.toggle('on', state.dmMode);
      if (state.selectedId) {
        const loc = findLoc(state.selectedId);
        if (loc) openInfo(loc);
      }
      if ($('compendium').classList.contains('open')) renderCompendium();
    }
    if (e.key === 'Escape') {
      // If compendium is open, close that first; else close info panel
      if ($('compendium').classList.contains('open')) closeCompendium();
      else closeInfo();
    }
    if (e.key === '+' || e.key === '=') zoomCenter(1.25);
    if (e.key === '-' || e.key === '_') zoomCenter(1 / 1.25);
  });

  // ============================================================
  // BOOT
  // ============================================================
  function boot() {
    buildStarfield();
    buildSpirals();
    renderPlanets();
    applyTransform();
    if (state.dmMode) $('dmToggle').classList.add('on');

    // Auto-fade the help hint after 12s
    setTimeout(() => $('helpHint').classList.add('fade'), 12000);
  }

  boot();
})();
