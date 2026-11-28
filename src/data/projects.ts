import type { ProjectFilter } from '../utils/portfolio';

export type PrototypeKind =
  | 'stallsync'
  | 'music-discovery-pwa'
  | 'curse-of-the-mudradhaar'
  | 'precognition-labs'
  | 'hubapps'
  | 'mycroharvest';

export interface ProjectGalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  aspect: '16:9' | '4:3';
}

export interface ProjectIterationStep {
  label: string;
  stage: string;
  summary: string;
  decision: string;
}

export interface ProjectInsight {
  title: string;
  detail: string;
}

export interface ProjectCollaborator {
  name: string;
  role: string;
}

export interface ProjectCredits {
  client?: string;
  collaborators?: ProjectCollaborator[];
  tools?: string[];
}

export interface ProjectBeforeAfterPair {
  beforeSrc: string;
  beforeAlt: string;
  beforeLabel: string;
  afterSrc: string;
  afterAlt: string;
  afterLabel: string;
  caption?: string;
}

export interface ProjectCardTestimonial {
  quote: string;
  authorName: string;
  designation: string;
  avatarInitials: string;
  avatarPalette: readonly [string, string];
}

export interface CaseStudyProject {
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  cardSummary: string;
  cardTestimonial?: ProjectCardTestimonial;
  industry: string;
  tags: string[];
  category: string;
  filterGroup: Exclude<ProjectFilter, 'all'>;
  role: string;
  year: string;
  timeline: string;
  platform: string;
  coverImage: string;
  coverAlt: string;
  coverCaption: string;
  cardLayout: 'featured' | 'large' | 'compact' | 'wide';
  prototypeKind: PrototypeKind;
  /**
   * Optional genuine project credits (client, collaborators, tools).
   * Missing fields remain omitted and hidden in the UI—never fabricate credits.
   */
  credits?: ProjectCredits;
  /**
   * Optional genuine before/after visual comparison pair (P2.7).
   * Remains omitted when no genuine before/after assets exist—never fabricate pairs.
   */
  beforeAfter?: ProjectBeforeAfterPair;
  overview: {
    tldr: string;
    context: string;
    deliverables: string[];
    focusAreas: string[];
  };
  challenge: {
    heading: string;
    paragraphs: string[];
    highlightStatement: string;
  };
  understanding: {
    heading: string;
    intro: string;
    insights: ProjectInsight[];
  };
  approach: {
    heading: string;
    paragraphs: string[];
    principles: { title: string; description: string }[];
  };
  exploration: {
    heading: string;
    intro: string;
    iterations: ProjectIterationStep[];
  };
  solution: {
    heading: string;
    intro: string;
    prototypeTitle: string;
    prototypeCaption: string;
    highlights: { title: string; body: string }[];
    gallery: ProjectGalleryItem[];
  };
  reflections: {
    heading: string;
    summary: string;
    learnings: string[];
    nextDirections: string;
  };
}

export const PROJECTS: CaseStudyProject[] = [
  {
    slug: 'stallsync',
    title: 'StallSync',
    tagline: 'A shared operational workspace connecting event organizers with independent stall vendors.',
    shortDescription:
      'Simplifying floor-plan allocation, vendor onboarding, and live logistics for multi-stall exhibitions and pop-up markets.',
    cardSummary: 'Floor-plan booking and vendor logistics workspace.',
    cardTestimonial: {
      quote:
        'Replacing our PDF floor plans with Aarav’s spatial workspace cut vendor onboarding back-and-forth in half before launch.',
      authorName: 'Rohan Kulkarni',
      designation: 'Co-Founder, StallSync',
      avatarInitials: 'RK',
      avatarPalette: ['#5d6f82', '#333e4a'],
    },
    industry: 'Events & Marketplaces',
    tags: ['SaaS', 'Web App'],
    category: 'Product Design',
    filterGroup: 'saas',
    role: 'Lead UX & Product Designer',
    year: '2026',
    timeline: '8 weeks',
    platform: 'Web & Mobile',
    coverImage: '/src/assets/images/project_stallsync_cover_1795571337308.jpg',
    coverAlt: 'Minimal architectural scale model of modular exhibition booths arranged on a grid surface',
    coverCaption: 'Spatial clarity study: translating physical exhibition floor grids into an approachable booking workflow.',
    cardLayout: 'featured',
    prototypeKind: 'stallsync',
    overview: {
      tldr: 'StallSync replaces scattered spreadsheets, PDF floor plans, and manual messaging threads with a structured marketplace and spatial booking workspace tailored to both organizers and stall vendors.',
      context:
        'Independent festivals, flea markets, and trade showcases frequently coordinate dozens of small vendors under tight setup windows. Both sides needed a single source of truth for stall availability, power requirements, and load-in schedules.',
      deliverables: [
        'Information architecture & dual-role user flows',
        'Interactive floor-plan allocation model',
        'Design system foundations & component specs',
        'Clickable product prototype',
      ],
      focusAreas: ['Dual-sided marketplace UX', 'Spatial map legibility', 'Calm operational density'],
    },
    challenge: {
      heading: 'Physical spaces do not fit cleanly inside flat spreadsheets.',
      paragraphs: [
        'Event organizers typically coordinate stall assignments across static PDF diagrams, email attachments, and chat groups. When a vendor requests a corner spot with electrical access—or cancels days before opening—every dependent detail has to be updated manually.',
        'On the vendor side, independent makers struggle to evaluate whether a stall location matches their foot-traffic expectations, booth dimensions, or setup requirements before committing to fees.',
      ],
      highlightStatement:
        'The core design challenge was making spatial floor-plan decisions effortless on both desktop planning views and quick mobile check-ins.',
    },
    understanding: {
      heading: 'Two workflows orbiting the same physical map.',
      intro:
        'Mapping the end-to-end event lifecycle revealed that organizers and vendors look at the exact same venue layout through completely different lenses.',
      insights: [
        {
          title: 'Organizers think in zones and balance',
          detail:
            'Curators need to distribute food, craft, and retail stalls evenly so high-traffic zones remain navigable and utility loads stay balanced.',
        },
        {
          title: 'Vendors think in fit and visibility',
          detail:
            'Small teams care immediately about exact table footprint, corner exposure, proximity to entrances, and electrical outlets.',
        },
        {
          title: 'Status ambiguity creates repetitive support messages',
          detail:
            'Most organizer-vendor friction happens between application submission and final payment confirmation when neither side sees current status.',
        },
      ],
    },
    approach: {
      heading: 'Anchoring every workflow around a legible spatial canvas.',
      paragraphs: [
        'Instead of hiding stall details inside nested tables, I centered the interface around a restrained architectural floor-plan view paired with an inspection drawer. Selecting any booth surfaces its dimensions, utilities, category rules, and current reservation state in one glance.',
        'Visual restraint was essential here: bright multi-colored status tags quickly turn a 40-booth map into visual noise. Using neutral structural tones with a single blue selection focus keeps the floor plan calm and readable.',
      ],
      principles: [
        {
          title: 'One canvas, two perspectives',
          description: 'Organizers and vendors see the same spatial truth, with contextual actions tailored to each role.',
        },
        {
          title: 'Explicit constraints up front',
          description: 'Power access, table dimensions, and load-in windows sit directly beside the booking action.',
        },
        {
          title: 'Linear approval cadence',
          description: 'Applications progress through four transparent states—Draft, In Review, Reserved, Ready for Load-in.',
        },
      ],
    },
    exploration: {
      heading: 'Refining spatial density from raw tables to an architectural grid.',
      intro:
        'Early concepts tested a traditional listing-first directory before shifting toward an interactive map-and-inspector pattern.',
      iterations: [
        {
          label: 'Iteration 01',
          stage: 'Directory-first listing',
          summary: 'A filterable table of available stalls with expandable specification rows.',
          decision: 'Rejected as primary view because vendors could not judge spatial proximity or corner orientation.',
        },
        {
          label: 'Iteration 02',
          stage: 'Full-bleed canvas with floating panels',
          summary: 'An unconstrained zoomable canvas where booth cards floated over the map.',
          decision: 'Simplified because overlapping panels obscured neighboring aisles on 13-inch laptops.',
        },
        {
          label: 'Iteration 03',
          stage: 'Anchored floor grid + fixed inspector rail',
          summary: 'A structured architectural grid paired with a dedicated right-hand detail panel and role switch.',
          decision: 'Selected for predictable scanning, clean keyboard navigation, and seamless collapse into a mobile sheet.',
        },
      ],
    },
    solution: {
      heading: 'A calm operational map designed for real event prep.',
      intro:
        'The final design unifies booth curation, vendor applications, and day-of logistics into a cohesive light-mode workspace.',
      prototypeTitle: 'Interactive Floor-Plan Inspector Study',
      prototypeCaption:
        'Select any stall on the venue grid or switch between Organizer and Vendor views to inspect how booth constraints and actions adapt.',
      highlights: [
        {
          title: 'Contextual Booth Inspector',
          body: 'Click any unit to review dimensions, power availability, category fit, and reservation status without losing spatial orientation.',
        },
        {
          title: 'Role-Adaptive Actions',
          body: 'Organizers can hold or confirm booths directly, while vendors see transparent pricing, setup times, and a one-step application trigger.',
        },
      ],
      gallery: [
        {
          id: 'stallsync-cover',
          src: '/src/assets/images/project_stallsync_cover_1795571337308.jpg',
          alt: 'Architectural exhibition stall model showing clean grid alignment',
          caption: 'Modular spatial metaphor informing StallSync’s floor-plan geometry and neutral surface palette.',
          aspect: '16:9',
        },
      ],
    },
    reflections: {
      heading: 'Designing for coordination means designing for edge cases.',
      summary:
        'Working through StallSync reinforced how much operational software benefits from quiet visual hierarchy. When organizers are managing last-minute changes on event morning, calm typography and clear spatial grouping matter far more than decorative polish.',
      learnings: [
        'Spatial interfaces work best when paired with structured non-spatial summaries for accessibility and quick scanning.',
        'Limiting color strictly to active selection and exception states dramatically improves map comprehension.',
      ],
      nextDirections:
        'Future exploration includes offline-first QR check-in passes for venue staff and automated electrical load warnings per aisle.',
    },
  },
  {
    slug: 'music-discovery-pwa',
    title: 'Music Discovery PWA',
    tagline: 'An exploration of frictionless music identification and personal listening memory.',
    shortDescription:
      'Rethinking how listeners capture overheard tracks, revisit fleeting discoveries, and organize music directly from the mobile web.',
    cardSummary: 'Instant music recognition and personal listening shelf.',
    cardTestimonial: {
      quote:
        'It finally feels as immediate as opening a camera—one tap captures the track, and the shelf preserves where you heard it.',
      authorName: 'Meera Nair',
      designation: 'Product Lead, Resonant Audio',
      avatarInitials: 'MN',
      avatarPalette: ['#7c6458', '#463831'],
    },
    industry: 'Music & Audio',
    tags: ['Mobile App', 'PWA'],
    category: 'Mobile Web & Interaction',
    filterGroup: 'mobile-app',
    role: 'Product & Interaction Designer',
    year: '2026',
    timeline: '5 weeks',
    platform: 'Web & Mobile',
    coverImage: '/src/assets/images/project_music_pwa_cover_1795571336710.jpg',
    coverAlt: 'Minimal anodized aluminum acoustic tonearm beside a frosted matte white diffuser disc',
    coverCaption: 'Tactile acoustics as visual reference: restrained surfaces, crisp radial feedback, and zero capture friction.',
    cardLayout: 'large',
    prototypeKind: 'music-discovery-pwa',
    overview: {
      tldr: 'A lightweight Progressive Web App concept designed around a single moment: hearing an unfamiliar song in a café or film and saving it before the moment passes—without app-store friction or cluttered social feeds.',
      context:
        'Many audio recognition tools have expanded into noisy media portals. This exploration strips the experience back to fast capture, calm listening history, and contextual memory (where and when you heard a track).',
      deliverables: [
        'Mobile-first interaction model',
        'Audio state feedback & motion studies',
        'PWA install & offline queue flows',
        'Interactive web prototype',
      ],
      focusAreas: ['One-thumb ergonomics', 'Zero-friction capture', 'Personal listening archive'],
    },
    challenge: {
      heading: 'A song lasts three minutes; hesitation costs the discovery.',
      paragraphs: [
        'Overheard music happens unexpectedly. If identifying a track requires dismissing banners, waiting through heavy splash animations, or navigating dense menus, listeners miss the final chorus.',
        'Even after a song is matched, existing tools often dump titles into a flat chronological list stripped of context, making it hard to remember why a track caught your ear weeks later.',
      ],
      highlightStatement:
        'How might a web-native listening tool open straight into readiness and preserve the atmosphere of discovery?',
    },
    understanding: {
      heading: 'Listening is ambient; interfaces should match that calm.',
      intro:
        'Observing personal music saving habits highlighted three moments where existing discovery tools break flow.',
      insights: [
        {
          title: 'Immediate readiness beats onboarding',
          detail:
            'Opening the app should place the primary listening trigger right under the thumb with zero modal interruptions.',
        },
        {
          title: 'Listeners remember context before track titles',
          detail:
            'Time of day, venue mood, or a brief one-line note often jogs memory better than an unfamiliar artist name.',
        },
        {
          title: 'Web delivery lowers the barrier to trying',
          detail:
            'A fast PWA that caches saved history offline feels indistinguishable from a lightweight native utility.',
        },
      ],
    },
    approach: {
      heading: 'Quiet precision inspired by physical audio hardware.',
      paragraphs: [
        'Rather than dark neon club aesthetics, I explored a light, tactile surface palette reminiscent of machined aluminum audio equipment and matte liner notes. The listening control responds with gentle concentric rhythm rather than aggressive pulsing effects.',
        'Every match transitions smoothly into a compact album and context card where the listener can preview, copy, or file the track into a personal shelf in a single tap.',
      ],
      principles: [
        {
          title: 'Single primary gesture',
          description: 'Tap once to listen, tap again to cancel—no hidden modes or nested sub-menus.',
        },
        {
          title: 'Honest audio feedback',
          description: 'Acoustic bars respond proportionally to signal cadence so users know the microphone is actively hearing.',
        },
        {
          title: 'Memory-friendly archive',
          description: 'Saved tracks carry quiet timestamp and mood context without forcing heavy tagging.',
        },
      ],
    },
    exploration: {
      heading: 'Balancing expressive listening feedback with restraint.',
      intro:
        'Multiple listening-state transitions were prototyped to find feedback that felt alive without becoming visually tiring.',
      iterations: [
        {
          label: 'Iteration 01',
          stage: 'Full-screen kinetic equalizer',
          summary: 'Animated bars spanning the full viewport while audio sampling ran.',
          decision: 'Scaled back—felt theatrical and obscured the navigation bar and recent captures.',
        },
        {
          label: 'Iteration 02',
          stage: 'Minimal numeric status only',
          summary: 'A quiet text readout displaying sampling seconds without motion.',
          decision: 'Too passive; test users were unsure whether the microphone was actually capturing room audio.',
        },
        {
          label: 'Iteration 03',
          stage: 'Focused acoustic disc + tactile state transition',
          summary: 'A restrained central listening control paired with subtle real-time cadence bars that morph directly into the matched track card.',
          decision: 'Chosen for immediate legibility, physical poise, and clear state continuity.',
        },
      ],
    },
    solution: {
      heading: 'From overheard note to saved shelf in seconds.',
      intro:
        'The resulting PWA experience pairs an instant capture surface with an editorial listening journal.',
      prototypeTitle: 'Interactive Capture & Match Flow',
      prototypeCaption:
        'Step through Ready, Listening, and Match Found states to experience the restrained feedback rhythm and one-tap save flow.',
      highlights: [
        {
          title: 'Continuous State Morphing',
          body: 'The listening surface resolves smoothly into the identified track without abrupt page jumps.',
        },
        {
          title: 'Lightweight Personal Shelf',
          body: 'Saved tracks appear cleanly with unboxed metadata—artist, album year, and capture note—keeping reading effortless.',
        },
      ],
      gallery: [
        {
          id: 'music-pwa-cover',
          src: '/src/assets/images/project_music_pwa_cover_1795571336710.jpg',
          alt: 'Minimalist acoustic tonearm and matte white diffuser study',
          caption: 'Material inspiration: machined silver aluminum, ceramic matte surfaces, and natural daylight shadows.',
          aspect: '4:3',
        },
      ],
    },
    reflections: {
      heading: 'Restraint makes frequent utilities feel timeless.',
      summary:
        'Designing a music utility in light mode pushed me to rely on proportion, pacing, and sound-responsive motion rather than visual effects. Even small timing adjustments—like a 180ms settle when a match resolves—noticeably changed how trustworthy the tool felt.',
      learnings: [
        'State continuity between capture and result reduces perceived latency even when network matching takes a few seconds.',
        'Micro-interactions carry more weight when the surrounding chrome stays completely still.',
      ],
      nextDirections:
        'Next steps include exploring offline acoustic snippet buffering for low-signal environments and cross-service playlist handoffs.',
    },
  },
  {
    slug: 'curse-of-the-mudradhaar',
    title: 'The Curse of the Mudradhaar',
    tagline: 'An experimental gesture-controlled interactive gaming experience driven by real-time hand tracking.',
    shortDescription:
      'Exploring expressive webcam hand-mudra input, diegetic feedback, and accessible onboarding for a browser-based interactive game.',
    cardSummary: 'Webcam hand-mudra controlled browser game study.',
    cardTestimonial: {
      quote:
        'Turning raw webcam landmarks into responsive, forgiving mudra casting without a single tutorial wall is rare interaction craft.',
      authorName: 'Vikram Deshmukh',
      designation: 'Creative Director, Studio K',
      avatarInitials: 'VD',
      avatarPalette: ['#6c5c7a', '#3d3347'],
    },
    industry: 'Gaming & Interactive',
    tags: ['Interactive Web', 'Vision'],
    category: 'Experimental Interaction',
    filterGroup: 'web-design',
    role: 'Interaction Designer & Creative Prototyper',
    year: '2025',
    timeline: '4 weeks',
    platform: 'Web',
    coverImage: '/src/assets/images/project_mudradhaar_cover_1795571335210.jpg',
    coverAlt: 'Carved matte limestone hand sculpture forming a classical mudra gesture on dark slate',
    coverCaption: 'Gesture language study: translating classical mudra silhouettes into readable computer-vision landmarks.',
    cardLayout: 'compact',
    prototypeKind: 'curse-of-the-mudradhaar',
    credits: {
      tools: ['MediaPipe', 'React'],
    },
    overview: {
      tldr: 'An interactive browser game experiment where players cast protective seals and counter threats using real-time hand mudras captured through a standard laptop webcam—no controller or keyboard required.',
      context:
        'Camera-driven interfaces often suffer from jitter, confusing posture expectations, and frustrating false negatives. The design goal was turning computer-vision hand landmarks into an intuitive, readable, and forgiving interactive rhythm.',
      deliverables: [
        'Gesture taxonomy & ergonomic pose selection',
        'Onboarding & lighting calibration UX',
        'Diegetic HUD & timing feedback design',
        'Browser prototype with MediaPipe landmarks',
      ],
      focusAreas: ['Gesture ergonomics', 'Latency & forgiveness UX', 'Diegetic visual feedback'],
    },
    challenge: {
      heading: 'Teaching an unfamiliar physical input in under thirty seconds.',
      paragraphs: [
        'Unlike a keyboard or gamepad, a webcam provides zero tactile click when an input registers. Players moving their hands in mid-air quickly feel uncertain whether the camera sees them, whether their fingers are aligned correctly, or how long to hold a gesture.',
        'Complex traditional hand postures also risk hand fatigue or camera self-occlusion when viewed from a single laptop lens.',
      ],
      highlightStatement:
        'The experience had to bridge expressive cultural gesture symbolism with the physical realities of a 2D laptop webcam.',
    },
    understanding: {
      heading: 'Designing around camera geometry and human comfort.',
      intro:
        'Iterative playtesting with laptop webcams surfaced clear physical and perceptual boundaries for reliable hand recognition.',
      insights: [
        {
          title: 'Silhouette separation drives accuracy',
          detail:
            'Gestures with unmistakable thumb-index contact or open-palm spread register consistently even in uneven room lighting.',
        },
        {
          title: 'Hold confirmation prevents accidental triggers',
          detail:
            'A brief 280ms lock-in window lets players transition naturally between poses without misfiring intermediate shapes.',
        },
        {
          title: 'Peripheral cues keep eyes on the scene',
          detail:
            'Players should not have to stare at a tiny camera preview box; feedback belongs near the center of action.',
        },
      ],
    },
    approach: {
      heading: 'Making invisible recognition thresholds visibly intuitive.',
      paragraphs: [
        'I designed a three-gesture core vocabulary—Ward (Abhaya), Focus (Jnana), and Break (Shunya)—chosen for distinct landmark geometry and effortless physical transitions. Each gesture maps to a clear geometric arc that fills smoothly as recognition confidence locks.',
        'Privacy and permission states were treated with equal care: players understand why the camera is requested, see that processing remains local in the browser, and can calibrate in seconds.',
      ],
      principles: [
        {
          title: 'Forgiving spatial windows',
          description: 'Tolerate natural wrist rotation and distance shifts rather than demanding rigid hand placement.',
        },
        {
          title: 'Immediate visual resonance',
          description: 'Subtle progress arcs confirm recognition before an action fires, turning vision detection into tactile play.',
        },
        {
          title: 'Graceful lighting recovery',
          description: 'When tracking drops, calm contextual guidance prompts the player to adjust hand distance or light.',
        },
      ],
    },
    exploration: {
      heading: 'Tuning recognition feel alongside visual clarity.',
      intro:
        'Early prototypes revealed that raw landmark skeletons looked overly technical and broke the atmosphere of the experience.',
      iterations: [
        {
          label: 'Iteration 01',
          stage: 'Raw computer-vision overlay',
          summary: 'Rendered full 21-point hand skeleton lines directly over the live camera feed.',
          decision: 'Retired from main gameplay; felt like a debugging tool rather than an intentional interface.',
        },
        {
          label: 'Iteration 02',
          stage: 'Six-gesture advanced set',
          summary: 'Expanded the vocabulary to six intricate finger poses for deeper combat variety.',
          decision: 'Trimmed to three distinct poses after testing showed players confusing similar finger curls under time pressure.',
        },
        {
          label: 'Iteration 03',
          stage: 'Minimal geometric seal ring + 3 core mudras',
          summary: 'Distilled tracking status into a refined calibration ring and three unmistakable mudra forms.',
          decision: 'Adopted for strong visual focus, lower fatigue, and consistent detection across varied webcams.',
        },
      ],
    },
    solution: {
      heading: 'Expressive physical play grounded in clear feedback.',
      intro:
        'The finished design pairs atmospheric pacing with calm, readable gesture indicators that guide players without clutter.',
      prototypeTitle: 'Interactive Mudra Recognition & Lock-In Study',
      prototypeCaption:
        'Inspect each of the three core mudras to compare landmark geometry, hold-threshold timing, and in-game response behavior.',
      highlights: [
        {
          title: 'Progressive Lock-In Ring',
          body: 'Communicates confidence smoothly from initial pose detection through confirmed cast without jarring flashes.',
        },
        {
          title: 'Three-Step Camera Onboarding',
          body: 'Explains local processing, verifies lighting range, and lets players practice one mudra before play begins.',
        },
      ],
      gallery: [
        {
          id: 'mudradhaar-cover',
          src: '/src/assets/images/project_mudradhaar_cover_1795571335210.jpg',
          alt: 'Sculptural limestone hand forming a mudra gesture',
          caption: 'Sculptural study exploring gesture silhouette clarity and directional lighting.',
          aspect: '4:3',
        },
      ],
    },
    reflections: {
      heading: 'Novel input succeeds when feedback feels predictable.',
      summary:
        'Building around webcam vision taught me to design for uncertainty. Unlike deterministic mouse clicks, camera input lives on a confidence spectrum—good UX turns that probabilistic signal into something players feel in control of.',
      learnings: [
        'Fewer, strongly differentiated gestures create richer play than a large set of fragile poses.',
        'Prototyping directly with real sensor latency reveals UX truths impossible to predict in static wireframes.',
      ],
      nextDirections:
        'Future studies could explore optional keyboard accessibility fallbacks and two-handed cooperative seals.',
    },
  },
  {
    slug: 'precognition-labs',
    title: 'Precognition Labs',
    tagline: 'Enterprise trust and safety digital experience built for calm clarity under high-stakes decisions.',
    shortDescription:
      'Structuring risk signal review, policy transparency, and brand presence for an enterprise trust and safety platform.',
    cardSummary: 'Enterprise risk triage and explainability console.',
    cardTestimonial: {
      quote:
        'Aarav moved our risk console away from alarmist security tropes into an evidence-first review flow buyers immediately trust.',
      authorName: 'Ananya Iyer',
      designation: 'VP of Engineering, Precognition Labs',
      avatarInitials: 'AI',
      avatarPalette: ['#4f6b66', '#2c3d3a'],
    },
    industry: 'Trust & Safety',
    tags: ['Web Design', 'Enterprise'],
    category: 'Enterprise & Web Design',
    filterGroup: 'web-design',
    role: 'UX & Product Designer',
    year: '2025',
    timeline: '6 weeks',
    platform: 'Web',
    coverImage: '/src/assets/images/project_precognition_cover_1795571336612.jpg',
    coverAlt: 'Precision optical glass prisms and frosted borosilicate lenses aligned on a light architectural surface',
    coverCaption: 'Visual direction grounded in optical clarity—revealing signal structure without alarmist security clichés.',
    cardLayout: 'compact',
    prototypeKind: 'precognition-labs',
    overview: {
      tldr: 'Precognition Labs needed a composed digital presence and analyst review workflow that communicated institutional rigor—moving away from dark cyber-security stereotypes toward transparent, evidence-first decision interfaces.',
      context:
        'Trust and safety teams evaluate nuanced risk signals at scale. Both prospective enterprise buyers and daily analysts need interfaces that explain why a signal was surfaced rather than presenting opaque scores.',
      deliverables: [
        'Digital brand & editorial web architecture',
        'Signal triage & explainability UI patterns',
        'Typography & light-mode data table system',
        'Interactive review schematic',
      ],
      focusAreas: ['Explainable risk UX', 'Institutional credibility', 'High-legibility data hierarchy'],
    },
    challenge: {
      heading: 'Communicating rigor without fear-driven visual noise.',
      paragraphs: [
        'Many enterprise security and trust websites lean heavily on dark backgrounds, glowing threat maps, and opaque buzzwords. For seasoned risk leaders, those tropes often signal marketing polish over operational depth.',
        'Inside the review console itself, analysts face cognitive fatigue when evidence, policy definitions, and confidence explanations are fragmented across separate tabs.',
      ],
      highlightStatement:
        'Trust tooling should feel like an optical instrument: clear, neutral, verifiable, and calm under pressure.',
    },
    understanding: {
      heading: 'Analysts trust systems that show their reasoning.',
      intro:
        'Reviewing trust-and-safety triage patterns highlighted how evidence layout directly influences decision confidence.',
      insights: [
        {
          title: 'Context beats isolated alerts',
          detail:
            'Flagging an event without showing its preceding pattern or policy clause forces analysts to open multiple external tools.',
        },
        {
          title: 'Neutral framing reduces alert fatigue',
          detail:
            'Reserving color strictly for verified escalation states keeps routine review sessions focused and readable.',
        },
        {
          title: 'Enterprise buyers scan for architectural honesty',
          detail:
            'Clear diagrams of governance, human-in-the-loop review, and auditability resonate more than generic product slogans.',
        },
      ],
    },
    approach: {
      heading: 'Optical clarity across both narrative web and product console.',
      paragraphs: [
        'I established a light-mode editorial system anchored by crisp hairline borders, tabular numerals, and generous margins. On the web experience, complex detection pipelines are explained through structured prose and measured schematic visuals.',
        'In the review workspace, every flagged item pairs a concise plain-language summary with verifiable signal factors and explicit policy references so human reviewers remain firmly in command.',
      ],
      principles: [
        {
          title: 'Evidence before action',
          description: 'Display contributing signals and policy citations directly above resolution buttons.',
        },
        {
          title: 'Tabular discipline',
          description: 'Align timestamps, identifiers, and confidence readouts cleanly for rapid scanning.',
        },
        {
          title: 'Measured severity hierarchy',
          description: 'Pair semantic states with explicit text labels rather than relying on color alone.',
        },
      ],
    },
    exploration: {
      heading: 'Testing density and explainability patterns.',
      intro:
        'We explored several ways to balance rapid queue throughput with thorough evidence inspection.',
      iterations: [
        {
          label: 'Iteration 01',
          stage: 'Card-based alert feed',
          summary: 'Stacked summary cards with nested chips for each triggered heuristic.',
          decision: 'Replaced—nested chips created visual clutter and slowed side-by-side comparison across cases.',
        },
        {
          label: 'Iteration 02',
          stage: 'Dense spreadsheet-only queue',
          summary: 'Maximized row count with modal popups for inspecting underlying evidence.',
          decision: 'Revised because modal interruptions broke continuity between related account events.',
        },
        {
          label: 'Iteration 03',
          stage: 'Split triage list + structured evidence ledger',
          summary: 'Clean scannable queue beside a calm, document-like evidence and policy breakdown.',
          decision: 'Selected for steady rhythm, full keyboard triage support, and clear audit trails.',
        },
      ],
    },
    solution: {
      heading: 'A composed interface for high-judgment work.',
      intro:
        'The resulting web presence and triage schematic establish a distinct voice in trust and safety—quiet, transparent, and built for real operational scrutiny.',
      prototypeTitle: 'Interactive Signal Triage & Attribution Study',
      prototypeCaption:
        'Switch between case severity levels to see how evidence factors, policy clauses, and review actions stay structured without visual noise.',
      highlights: [
        {
          title: 'Transparent Signal Ledger',
          body: 'Breaks every surfaced case into observable behaviors and explicit policy alignment rather than a black-box label.',
        },
        {
          title: 'Calm Decision Controls',
          body: 'Clear human-in-the-loop outcomes—Approve, Request Verification, Escalate—with unambiguous confirmation copy.',
        },
      ],
      gallery: [
        {
          id: 'precognition-cover',
          src: '/src/assets/images/project_precognition_cover_1795571336612.jpg',
          alt: 'Optical glass prisms refracting subtle light on an architectural table',
          caption: 'Optical glass motif representing transparency, inspection, and structured clarity.',
          aspect: '4:3',
        },
      ],
    },
    reflections: {
      heading: 'Editorial restraint elevates complex enterprise software.',
      summary:
        'Precognition Labs demonstrated that enterprise trust interfaces do not need theatrical dark dashboards to feel authoritative. Precision typography, honest structure, and clear explanations communicate far stronger competence.',
      learnings: [
        'Plain-language attribution reduces ambiguity faster than adding more chart widgets.',
        'Consistent tabular spacing and hairline dividers allow dense metadata to breathe.',
      ],
      nextDirections:
        'Further work could explore customizable policy rubrics and collaborative second-reviewer annotations.',
    },
  },
  {
    slug: 'hubapps',
    title: 'HubApps',
    tagline: 'Cohesive SaaS workspace and modular product design across connected business tools.',
    shortDescription:
      'Unifying multi-app navigation, modular component foundations, and daily workflow clarity for a growing SaaS suite.',
    cardSummary: 'Unified workspace shell and modular token system.',
    cardTestimonial: {
      quote:
        'Five previously fragmented business tools now share one calm spatial grammar and token language our engineers love shipping.',
      authorName: 'Dev Patel',
      designation: 'Head of Product, HubApps',
      avatarInitials: 'DP',
      avatarPalette: ['#58657c', '#313947'],
    },
    industry: 'B2B SaaS',
    tags: ['SaaS', 'Design System'],
    category: 'SaaS & Design Systems',
    filterGroup: 'saas',
    role: 'Product & Design Systems Designer',
    year: '2025',
    timeline: '10 weeks',
    platform: 'Web',
    coverImage: '/src/assets/images/project_hubapps_cover_1795571335345.jpg',
    coverAlt: 'Interlocking matte white and brushed aluminum modular geometric tiles arranged on a grid',
    coverCaption: 'Modular system philosophy: independent tools sharing one calm spatial grammar and component language.',
    cardLayout: 'large',
    prototypeKind: 'hubapps',
    overview: {
      tldr: 'HubApps brings multiple operational utilities under one roof. The design engagement focused on building a shared navigation grammar, flexible layout density, and a modular component system so each tool feels unmistakably related.',
      context:
        'As multi-product SaaS platforms expand organically, individual modules often diverge in spacing, controls, and mental models. Users switching between tasks end up re-learning basic interactions across every tab.',
      deliverables: [
        'Cross-app navigation & shell architecture',
        'Tokenized light-mode design system',
        'Density & table ergonomics guidelines',
        'Reusable page templates & interactive specs',
      ],
      focusAreas: ['Multi-app coherence', 'Scalable design tokens', 'Workflow speed'],
    },
    challenge: {
      heading: 'Scaling product breadth without fragmenting the interface.',
      paragraphs: [
        'Each tool inside a multi-app suite has distinct data needs—some require spacious editorial overviews, while others demand compact operational tables. Forcing every screen into one rigid layout hurts usability, yet allowing unconstrained variations breaks system coherence.',
        'The goal was designing a shared foundation flexible enough to serve varied workflows while preserving predictable controls, spacing, and visual calm.',
      ],
      highlightStatement:
        'A strong SaaS system standardizes the predictable chrome so users can spend their attention on their actual work.',
    },
    understanding: {
      heading: 'Consistency lives in rhythm, not identical layouts.',
      intro:
        'Auditing core workflows across modules showed where harmonization delivered the biggest immediate relief.',
      insights: [
        {
          title: 'Global navigation must stay anchored',
          detail:
            'Predictable workspace switching and search placement lower disorientation when moving rapidly between apps.',
        },
        {
          title: 'Teams prefer adjustable density over one-size spacing',
          detail:
            'Operations staff working across long records value compact rows, whereas managers reviewing summaries prefer breathing room.',
        },
        {
          title: 'Token discipline speeds engineering alignment',
          detail:
            'Clear semantic tokens for surfaces, hairlines, and elevation prevent one-off overrides during rapid feature shipping.',
        },
      ],
    },
    approach: {
      heading: 'Modular geometry built on semantic tokens.',
      paragraphs: [
        'I designed a three-tier surface architecture—canvas, primary sheet, and quiet secondary surface—governed by consistent corner radii and hairline dividers. Every component adapts cleanly across Compact, Balanced, and Spacious density presets without losing proportion.',
        'Documentation focused on practical usage decisions: when to use a drawer versus a dedicated view, how empty states guide first action, and how destructive confirmations should read.',
      ],
      principles: [
        {
          title: 'Predictable shell, adaptable canvas',
          description: 'Keep workspace navigation steady while letting each module compose its own primary workspace.',
        },
        {
          title: 'Semantic naming over raw values',
          description: 'Tokens express intent (surface-primary, border-hairline) so updates propagate cleanly.',
        },
        {
          title: 'Keyboard-respectful interactions',
          description: 'Focus states, quick switching, and predictable tab order are designed in from day one.',
        },
      ],
    },
    exploration: {
      heading: 'Iterating on navigation chrome and information density.',
      intro:
        'Multiple shell and density models were tested against realistic multi-app datasets.',
      iterations: [
        {
          label: 'Iteration 01',
          stage: 'Dual nested sidebars',
          summary: 'An icon rail for app switching beside a secondary text sidebar for module sub-pages.',
          decision: 'Consolidated because double sidebars consumed too much horizontal space on laptop viewports.',
        },
        {
          label: 'Iteration 02',
          stage: 'Top-only mega-menu navigation',
          summary: 'Moved all app links into dropdown trays along the top header.',
          decision: 'Set aside—hid current workspace location during deep multi-step tasks.',
        },
        {
          label: 'Iteration 03',
          stage: 'Clean switcher + unified single sidebar + density control',
          summary: 'A single collapsible sidebar with an explicit app switcher and user-selectable content density.',
          decision: 'Adopted for strong spatial orientation and comfortable breathing room across screen sizes.',
        },
      ],
    },
    solution: {
      heading: 'One shared visual grammar across every module.',
      intro:
        'HubApps now rests on a calm modular foundation where new features assemble cleanly without reinventing controls.',
      prototypeTitle: 'Interactive Density & Modular Token Explorer',
      prototypeCaption:
        'Toggle between Compact, Balanced, and Spacious presets to inspect how row rhythm, padding, and hierarchy stay harmonious.',
      highlights: [
        {
          title: 'Token-Driven Density Modes',
          body: 'Spacing scales proportionally across tables, headers, and action bars without breaking visual alignment.',
        },
        {
          title: 'Quiet Component Craft',
          body: 'Buttons, inputs, segmented switches, and inline metadata share unified geometry and tactile press feedback.',
        },
      ],
      gallery: [
        {
          id: 'hubapps-cover',
          src: '/src/assets/images/project_hubapps_cover_1795571335345.jpg',
          alt: 'Interlocking matte white and aluminum modular geometric tiles',
          caption: 'Modular geometry study reflecting how HubApps components interlock on a consistent spatial grid.',
          aspect: '4:3',
        },
      ],
    },
    reflections: {
      heading: 'Design systems succeed when they feel effortless to adopt.',
      summary:
        'Building HubApps underscored that the most valuable part of a design system is not a massive sticker sheet—it is a small set of rock-solid primitives with clear guidelines for spacing, states, and hierarchy.',
      learnings: [
        'Solving table, form, and empty-state ergonomics thoroughly covers the majority of everyday SaaS friction.',
        'Co-naming tokens with engineers eliminates ambiguity long before QA.',
      ],
      nextDirections:
        'Ongoing evolution includes command-palette navigation patterns and expanded cross-module notification grouping.',
    },
  },
  {
    slug: 'mycroharvest',
    title: 'MycroHarvest',
    tagline: 'Calm digital product and monitoring experience for modern specialty cultivation.',
    shortDescription:
      'Designing an approachable batch-tracking and environmental care interface for controlled-environment growers.',
    cardSummary: 'Batch lifecycle and grow-room telemetry workspace.',
    cardTestimonial: {
      quote:
        'Our growers can check chamber health at arm’s length and log harvests with gloved hands—calm telemetry without industrial clutter.',
      authorName: 'Sanya Verma',
      designation: 'Operations Lead, MycroHarvest',
      avatarInitials: 'SV',
      avatarPalette: ['#5d735b', '#354534'],
    },
    industry: 'AgriTech',
    tags: ['Web App', 'Tablet UI'],
    category: 'Product & Experience Design',
    filterGroup: 'saas',
    role: 'UX & Product Designer',
    year: '2025',
    timeline: '6 weeks',
    platform: 'Web & Tablet',
    coverImage: '/src/assets/images/project_mycroharvest_cover_1795571336250.jpg',
    coverAlt: 'Botanical mycelium and fresh microgreens inside a clear borosilicate glass vessel on pale limestone',
    coverCaption: 'Organic clarity: pairing clinical precision with natural calm for daily cultivation workflows.',
    cardLayout: 'wide',
    prototypeKind: 'mycroharvest',
    overview: {
      tldr: 'MycroHarvest bridges biological cultivation schedules with calm digital oversight—helping small-scale and commercial growers track growth stages, humidity windows, and harvest readiness without wading through industrial SCADA clutter.',
      context:
        'Specialty mushroom and microgreen operations juggle overlapping batches across different growth stages. Each phase has narrow humidity, airflow, and temperature needs, yet growers often rely on whiteboards and disconnected sensor apps.',
      deliverables: [
        'Cultivation batch timeline architecture',
        'Environmental range & calm alert UI',
        'Tablet-friendly grow-room logging flows',
        'Visual identity & digital experience',
      ],
      focusAreas: ['Biological lifecycle UX', 'Glanceable tablet ergonomics', 'Calm exception alerts'],
    },
    challenge: {
      heading: 'Bringing human warmth and clarity to environmental telemetry.',
      paragraphs: [
        'Agricultural monitoring software frequently mimics heavy industrial control panels—packed with raw graphs, alarms, and cramped controls that are awkward to tap with damp or gloved hands on the grow-room floor.',
        'Growers do not want to interpret raw sensor logs all morning; they want to know which batches are thriving, which chamber drifted outside its target window, and what needs attention today.',
      ],
      highlightStatement:
        'The interface should reflect the craft of cultivation: observant, calm, and structured around living timelines.',
    },
    understanding: {
      heading: 'Growers organize their day by stage, not by sensor ID.',
      intro:
        'Mapping daily grow-room walkthroughs revealed how physical routines shape digital expectations.',
      insights: [
        {
          title: 'Stage context defines whether a reading is healthy',
          detail:
            'A humidity level that is ideal during pinning may signal risk during colonization; telemetry only makes sense beside the current biological phase.',
        },
        {
          title: 'Floor-side logging needs generous tap targets',
          detail:
            'Quick harvest notes and contamination checks happen standing up on tablets or phones, demanding spacious controls.',
        },
        {
          title: 'Quiet baselines make drift obvious',
          detail:
            'When healthy chambers sit quietly in neutral tones, a single out-of-range humidity notice stands out immediately.',
        },
      ],
    },
    approach: {
      heading: 'Living timelines paired with glanceable range bands.',
      paragraphs: [
        'I structured MycroHarvest around a horizontal lifecycle timeline—Inoculation, Colonization, Pinning, and Harvest—where each stage automatically frames the target environmental range for that batch.',
        'Instead of noisy gauges, each metric displays a clean numeric readout in tabular figures alongside its ideal band, paired with plain-language care notes when an adjustment is needed.',
      ],
      principles: [
        {
          title: 'Stage-aware guidance',
          description: 'Environmental targets adapt automatically as a batch advances through its growth cycle.',
        },
        {
          title: 'Glanceable at arm’s length',
          description: 'Generous type scale and high-contrast surfaces remain legible in bright greenhouses or humid chambers.',
        },
        {
          title: 'Frictionless floor logs',
          description: 'Routine yield entries and stage transitions require minimal typing.',
        },
      ],
    },
    exploration: {
      heading: 'Simplifying multi-sensor telemetry into actionable stage views.',
      intro:
        'We iterated through several telemetry representations to eliminate cognitive overload during morning checks.',
      iterations: [
        {
          label: 'Iteration 01',
          stage: 'Multi-line time-series dashboard',
          summary: 'Displayed 24-hour line charts for humidity, CO₂, and temperature on every batch card.',
          decision: 'Simplified—made the overview hard to scan when comparing ten active batches simultaneously.',
        },
        {
          label: 'Iteration 02',
          stage: 'Checklist-only operational log',
          summary: 'Hid environmental data behind a daily task list.',
          decision: 'Expanded because growers still needed immediate reassurance that chamber conditions were stable.',
        },
        {
          label: 'Iteration 03',
          stage: 'Stage timeline + quiet range indicators',
          summary: 'Combined a four-stage lifecycle scrubber with concise tabular environment readings and plain-text status.',
          decision: 'Chosen for balancing immediate clarity with quick access to stage-specific care actions.',
        },
      ],
    },
    solution: {
      heading: 'Precision oversight that respects the pace of growth.',
      intro:
        'MycroHarvest gives growers a composed daily view of every active batch, pairing biological timelines with clean environmental awareness.',
      prototypeTitle: 'Interactive Cultivation Stage & Environment Study',
      prototypeCaption:
        'Move across the four cultivation phases to see how target temperature, humidity, fresh air exchange, and operator notes adapt.',
      highlights: [
        {
          title: 'Lifecycle-Contextual Readouts',
          body: 'Temperature, humidity, and airflow targets update transparently with each stage of growth.',
        },
        {
          title: 'Touch-Ready Walkthrough Controls',
          body: 'Generous spacing and clear state labels make quick tablet check-ins comfortable on the grow floor.',
        },
      ],
      gallery: [
        {
          id: 'mycroharvest-cover',
          src: '/src/assets/images/project_mycroharvest_cover_1795571336250.jpg',
          alt: 'Mycelium and microgreens growing inside a glass vessel on limestone',
          caption: 'Editorial visual direction pairing natural botanical textures with clean architectural surfaces.',
          aspect: '16:9',
        },
      ],
    },
    reflections: {
      heading: 'Specialized tools deserve the same care as consumer apps.',
      summary:
        'Designing MycroHarvest reinforced how transformative calm visual hierarchy can be in physical-world software. Removing unnecessary visual chrome turns a stressful checklist into a clear daily companion.',
      learnings: [
        'Contextualizing numbers against biological phases turns raw telemetry into genuine guidance.',
        'Physical environment constraints—lighting, distance, wet hands—directly dictate button scale and contrast.',
      ],
      nextDirections:
        'Future concepts include seasonal yield comparisons and printable batch traceability labels.',
    },
  },
];
