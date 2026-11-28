/**
 * Portfolio Studio — Workstream C Reference Catalogs
 *
 * 1. Pattern Library (12 portfolio-grounded patterns: 10 production, 2 proposed/conditional)
 * 2. Page Templates (7 route architectural blueprints)
 * 3. Unified Documentation Hub Index (15 Studio destinations with search & filtering)
 */

import type { DesignWorkshopSection, StudioGroupId } from './studioNavigation';

/* ==========================================================================
   1. PATTERN LIBRARY (12 PORTFOLIO PATTERNS)
   ========================================================================== */

export type PatternMaturity = 'production' | 'proposed';

export interface PatternDoDont {
  doText: string;
  dontText: string;
}

export interface StudioPatternSpec {
  id:
    | 'hero-sections'
    | 'project-introduction'
    | 'project-metadata'
    | 'case-study-sections'
    | 'image-media-sections'
    | 'before-after-comparisons'
    | 'testimonials'
    | 'project-credits'
    | 'related-projects'
    | 'contact-conversion'
    | 'editorial-content'
    | 'footer-patterns';
  name: string;
  maturity: PatternMaturity;
  category: string;
  purpose: string;
  componentComposition: readonly string[];
  responsiveBehavior: string;
  tokens: readonly string[];
  accessibility: string;
  sourceReference: string;
  usageGuidance: string;
  doDonts: readonly PatternDoDont[];
}

export const PATTERN_LIBRARY_ITEMS: readonly StudioPatternSpec[] = [
  {
    id: 'hero-sections',
    name: 'Hero Sections',
    maturity: 'production',
    category: 'Landing & Opening',
    purpose:
      'Establish editorial voice, role clarity, and immediate entry into Selected Work without decorative chrome or above-the-fold clutter.',
    componentComposition: ['HomePage hero header', 'LocalTimeClock', 'Primary & outline CTA pair'],
    responsiveBehavior:
      'Fluid clamp() headline (40px mobile → 72px desktop) capped at 20ch measure with stacked CTAs on 375px and inline pair from sm:640px upward.',
    tokens: ['--apple-bg', '--apple-label-primary', '--apple-label-secondary', '--apple-blue-fill'],
    accessibility:
      'Single semantic <h1> per route, descriptive link targets, and ≥ 4.5:1 body contrast across all 4 theme matrices.',
    sourceReference: 'src/pages/HomePage.tsx',
    usageGuidance:
      'Keep hero copy to one balanced headline and one concise value proposition so the first project card enters cleanly near the initial fold.',
    doDonts: [
      {
        doText: 'Balance headline wrap with --measure-display (20ch) and generous bottom breathing room.',
        dontText: 'Stack multiple stat badges, status dots, or secondary carousels inside the hero header.',
      },
    ],
  },
  {
    id: 'project-introduction',
    name: 'Project Introduction',
    maturity: 'production',
    category: 'Case Study Opening',
    purpose:
      'Orient readers entering a case study with breadcrumb hierarchy, category/year context, thesis summary, reading depth switch, and audio narration.',
    componentComposition: ['Breadcrumbs', 'CaseStudyPage hero', 'Reading Depth segmented control', 'AudioPlayer'],
    responsiveBehavior:
      'Full-width editorial stack inside 1160px shell; hero cover locks 16:9 ratio below metadata; MobileReadingBar activates below lg:1024px.',
    tokens: ['--apple-bg', '--apple-label-primary', '--apple-label-tertiary', '--apple-separator'],
    accessibility:
      'Breadcrumb <nav aria-label="Breadcrumb"> precedes <h1>; AudioPlayer exposes keyboard play/pause and ±15s skip controls.',
    sourceReference: 'src/pages/CaseStudyPage.tsx',
    usageGuidance:
      'Pair concise problem framing with immediate access to Summary vs. Full depth so hiring managers can skim or read deeply.',
    doDonts: [
      {
        doText: 'Keep the thesis statement under 3 lines with clear visual separation before the cover plate.',
        dontText: 'Overlay un-scrimmed white typography directly onto bright case study cover art.',
      },
    ],
  },
  {
    id: 'project-metadata',
    name: 'Project Metadata',
    maturity: 'production',
    category: 'Case Study Opening',
    purpose:
      'Communicate Role, Timeline, Scope/Focus, and Platform in a scannable horizontal specification strip above the main narrative.',
    componentComposition: ['Semantic <dl> grid', 'Unboxed eyebrow labels', 'Hairline rule separators'],
    responsiveBehavior:
      '2-column grid on mobile (375px) expanding to 4 evenly distributed columns on md:768px+ separated by 1px --apple-separator borders.',
    tokens: ['--apple-separator', '--apple-label-tertiary', '--apple-label-primary'],
    accessibility:
      'Uses semantic <dl>/<dt>/<dd> pairing rather than unlabeled flex divs so screen readers associate every label with its value.',
    sourceReference: 'src/pages/CaseStudyPage.tsx',
    usageGuidance:
      'Present factual project parameters without boxed pill badges; omit empty fields cleanly instead of showing placeholders.',
    doDonts: [
      {
        doText: 'Use tabular numerals and uppercase micro-labels above concise single-line metadata values.',
        dontText: 'Wrap every metadata value in a rounded pill chip or multi-color tag.',
      },
    ],
  },
  {
    id: 'case-study-sections',
    name: 'Case-Study Section Layouts',
    maturity: 'production',
    category: 'Long-Form Narrative',
    purpose:
      'Structure 7-chapter product narratives with numbered section headers, 60ch editorial prose, live interactive prototypes, and synchronized Table of Contents navigation.',
    componentComposition: ['TableOfContents (5 architectures)', 'Numbered section headers', 'CaseStudyDiagram', 'CaseStudyPrototype'],
    responsiveBehavior:
      'Single-column 60ch reading flow on mobile/tablet; desktop aligns the active TOC variant cleanly outside or above prose without overlapping text.',
    tokens: ['--measure-prose', '--apple-label-primary', '--apple-label-secondary', '--apple-separator'],
    accessibility:
      'Sequential h2/h3 hierarchy, scroll-margin-top clearing sticky 52px Navbar, and active TOC chapter indicated via aria-current.',
    sourceReference: 'src/pages/CaseStudyPage.tsx',
    usageGuidance:
      'Alternate 60ch analytical prose with full-bleed 1160px visual evidence plates to preserve editorial cadence.',
    doDonts: [
      {
        doText: 'Maintain 60ch prose measure so eye-return across long rationales remains effortless.',
        dontText: 'Stretch body paragraphs across the full 1160px desktop container width.',
      },
    ],
  },
  {
    id: 'image-media-sections',
    name: 'Image & Media Sections',
    maturity: 'production',
    category: 'Visual Evidence',
    purpose:
      'Showcase high-resolution product screens, system diagrams, and architectural plates with aspect-ratio stability and full-screen Lightbox inspection.',
    componentComposition: ['Figure & figcaption plate', 'Lightbox modal with zoom (100%–225%)', 'Aspect-locked media well'],
    responsiveBehavior:
      'Scales smoothly from 100% viewport width on mobile (rounded-20px) to 1160px showcase width on desktop (rounded-28px) with zero CLS.',
    tokens: ['--apple-bg-secondary', '--apple-separator', '--apple-label-tertiary'],
    accessibility:
      'Explicit alt text on every visual plate, keyboard-accessible button trigger for Lightbox, and Escape/Arrow cycling inside modal.',
    sourceReference: 'src/components/Lightbox.tsx',
    usageGuidance:
      'Mount light screenshots inside a --apple-bg-secondary surface well with 1px hairline border so white UI screens never bleed into the page canvas.',
    doDonts: [
      {
        doText: 'Provide concise analytical captions explaining what changed and why it matters.',
        dontText: 'Render clickable screenshots as bare <img> elements without button semantics or zoom support.',
      },
    ],
  },
  {
    id: 'before-after-comparisons',
    name: 'Before/After Comparisons',
    maturity: 'proposed',
    category: 'Visual Evidence (Conditional)',
    purpose:
      'Enable direct interactive scrubbing between legacy and redesigned UI artifacts whenever genuine matched before/after photography pairs exist.',
    componentComposition: ['BeforeAfterComparator', 'ARIA slider handle', 'Frosted Before/After badges'],
    responsiveBehavior:
      'Aspect-locked 16:10 frame with touch-none pointer capture on mobile and keyboard Arrow/PageUp/Home/End scrubbing on desktop.',
    tokens: ['--apple-surface-ios-bar', '--apple-separator', '--apple-blue'],
    accessibility:
      'Implements role="slider" with aria-valuemin, aria-valuemax, aria-valuenow, aria-valuetext, and haptic-style tick detents at 0%/50%/100%.',
    sourceReference: 'src/components/BeforeAfterComparator.tsx',
    usageGuidance:
      'Proposed / Conditional pattern: 0 public case studies currently include verified before/after image pairs, so this pattern remains hidden publicly until genuine pairs are added.',
    doDonts: [
      {
        doText: 'Render publicly ONLY when matched-resolution real Before and After screenshots exist.',
        dontText: 'Fabricate artificial before/after pairs or apply CSS filters to fake a redesign comparison.',
      },
    ],
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    maturity: 'proposed',
    category: 'Social Proof (Conditional)',
    purpose:
      'Display verified client or teammate recommendations in calm, unboxed editorial columns without avatar clutter or fabricated quotes.',
    componentComposition: ['TestimonialsSection (workshopPreview mode)', 'Unboxed blockquote attribution'],
    responsiveBehavior:
      'Single-column stack on mobile; balanced 2-column editorial rhythm from md:768px upward.',
    tokens: ['--apple-separator', '--apple-label-primary', '--apple-label-secondary', '--apple-label-tertiary'],
    accessibility:
      'Semantic <figure> / <blockquote> / <figcaption> markup with verified-only data gate.',
    sourceReference: 'src/components/TestimonialsSection.tsx',
    usageGuidance:
      'Proposed / Conditional pattern: src/data/testimonials.ts currently contains 0 public verified entries; component returns null on public pages until real quotes are verified.',
    doDonts: [
      {
        doText: 'Gate public rendering strictly behind verified: true entries with real attribution.',
        dontText: 'Publish placeholder quotes or stock headshot avatars on public portfolio routes.',
      },
    ],
  },
  {
    id: 'project-credits',
    name: 'Project Credits',
    maturity: 'production',
    category: 'Case Study Closing',
    purpose:
      'Acknowledge Client, Collaborators, and Tools & Technologies transparently at the conclusion of each case study.',
    componentComposition: ['ProjectCreditsSection', 'Dynamic 1–3 column editorial grid'],
    responsiveBehavior:
      'Auto-adapts grid column count (1, 2, or 3 columns) based solely on populated fields; stacks cleanly on mobile.',
    tokens: ['--apple-separator', '--apple-label-tertiary', '--apple-label-primary', '--apple-label-secondary'],
    accessibility:
      'Semantic <section aria-label="Project credits and tools"> with clear heading/list structure and zero empty placeholder columns.',
    sourceReference: 'src/components/ProjectCreditsSection.tsx',
    usageGuidance:
      'Always omit missing sub-fields dynamically; never render "N/A" or dummy team rosters.',
    doDonts: [
      {
        doText: 'Credit collaborators accurately by name and discipline alongside actual shipped tools.',
        dontText: 'Pad empty client fields with synthetic agency names.',
      },
    ],
  },
  {
    id: 'related-projects',
    name: 'Related Projects',
    maturity: 'production',
    category: 'Case Study Closing',
    purpose:
      'Guide readers naturally from the end of one case study into 2 contextually related projects based on shared domain, platform, or systems craft.',
    componentComposition: ['RelatedProjectsSection', 'getRelatedProjects scoring utility', 'Compact editorial cards'],
    responsiveBehavior:
      '2-column grid from md:768px upward; single column on mobile with 16:10 thumbnail framing.',
    tokens: ['--apple-separator', '--apple-surface-elevated', '--apple-link', '--apple-label-primary'],
    accessibility:
      'Descriptive anchor cards preserving Cmd/Ctrl+Click new-tab behavior and visible focus rings.',
    sourceReference: 'src/components/RelatedProjectsSection.tsx',
    usageGuidance:
      'Limit recommendations to 2 high-relevance studies above the Previous/Next chapter pagination.',
    doDonts: [
      {
        doText: 'Explain the relationship concisely (shared craft or domain) rather than randomizing.',
        dontText: 'Duplicate the currently open case study inside its own related recommendations.',
      },
    ],
  },
  {
    id: 'contact-conversion',
    name: 'Contact & Conversion Sections',
    maturity: 'production',
    category: 'Conversion & Inquiry',
    purpose:
      'Offer frictionless direct contact via one-click email copy, live Bengaluru local time context, and a validated accessible project inquiry form.',
    componentComposition: ['ContactPage inquiry form', 'LocalTimeClock', 'Copy-email button + ToastViewport'],
    responsiveBehavior:
      'Split 2-column layout (context rail + form card) on lg:1024px+; single vertical stack with 46px touch-friendly inputs on mobile.',
    tokens: ['--apple-bg-secondary', '--apple-blue-fill', '--apple-error', '--apple-success'],
    accessibility:
      'Explicit <label htmlFor>, aria-invalid + aria-describedby error binding, aria-busy submit state, and role="status" confirmation.',
    sourceReference: 'src/pages/ContactPage.tsx',
    usageGuidance:
      'Always provide a direct copyable email alongside the structured form so visitors can choose their preferred channel.',
    doDonts: [
      {
        doText: 'Validate clearly on submit and move focus to the first invalid field.',
        dontText: 'Show red error borders before the user has attempted to submit or edit a field.',
      },
    ],
  },
  {
    id: 'editorial-content',
    name: 'Editorial Content Layouts',
    maturity: 'production',
    category: 'Writing & Essays',
    purpose:
      'Deliver calm, typographically disciplined essays and design notes with Reader Comfort preferences (font scale & line width) and clean index filtering.',
    componentComposition: ['NotesPage index', 'NoteDetailPage article', 'ReaderComfortPopover', 'Breadcrumbs'],
    responsiveBehavior:
      'Single-column 60ch editorial prose (adjustable via Reader Comfort) with hairline-divided index rows collapsing cleanly at 375px.',
    tokens: ['--measure-prose', '--apple-label-primary', '--apple-label-secondary', '--apple-separator'],
    accessibility:
      'Semantic <article> landmarks, time elements, keyboard-accessible Reader Comfort popover, and print-friendly layout rules.',
    sourceReference: 'src/pages/NoteDetailPage.tsx',
    usageGuidance:
      'Lead essays with publication date, reading time, and concise dek before entering body paragraphs.',
    doDonts: [
      {
        doText: 'Keep essays free of sidebar popups and let typography carry hierarchy.',
        dontText: 'Override user Reader Comfort font-size adjustments with fixed inline pixel sizes.',
      },
    ],
  },
  {
    id: 'footer-patterns',
    name: 'Footer Patterns',
    maturity: 'production',
    category: 'Global Chrome',
    purpose:
      'Close every public route with quiet navigation continuity, direct email copy, live local clock, Colophon drawer trigger, and availability status.',
    componentComposition: ['Footer', 'LocalTimeClock', 'ColophonDrawer trigger', 'Primary & social link columns'],
    responsiveBehavior:
      'Compact 3-column grid on md:768px+ collapsing to a calm single column with generous hairline separation on mobile.',
    tokens: ['--apple-bg', '--apple-separator', '--apple-label-secondary', '--apple-label-tertiary'],
    accessibility:
      'Semantic <footer> landmark, distinct nav labels, 44px mobile touch clearance on copy/colophon buttons, and zero redundant focus traps.',
    sourceReference: 'src/components/Footer.tsx',
    usageGuidance:
      'Keep footer height restrained and consistent across public routes; omit inside the isolated /design-system studio shell.',
    doDonts: [
      {
        doText: 'Pair direct email copy feedback with ToastViewport confirmation and optional UI chime.',
        dontText: 'Overload the footer with newsletter popups, sprawling sitemaps, or decorative gradients.',
      },
    ],
  },
] as const;

/* ==========================================================================
   2. PAGE TEMPLATES (6 PORTFOLIO ROUTE BLUEPRINTS)
   ========================================================================== */

export interface TemplateSectionBand {
  order: string;
  name: string;
  layoutRole: string;
  componentComposition: string;
  typography: string;
  spacing: string;
}

export interface PageTemplateBlueprint {
  id:
    | 'homepage'
    | 'work-index'
    | 'case-study-landing'
    | 'case-study-content'
    | 'notes-article'
    | 'about'
    | 'contact';
  name: string;
  routePattern: string;
  sourceFile: string;
  purpose: string;
  containerSpec: string;
  breakpoints: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  tokens: readonly string[];
  accessibilityNotes: string;
  sectionHierarchy: readonly TemplateSectionBand[];
}

export const PAGE_TEMPLATES_CATALOG: readonly PageTemplateBlueprint[] = [
  {
    id: 'homepage',
    name: 'Homepage',
    routePattern: '/',
    sourceFile: 'src/pages/HomePage.tsx',
    purpose:
      'Compact left-aligned designer introduction opening directly into a four-project horizontally scrollable Featured Work rail peeking above the desktop fold, followed by practice, capabilities, craft studies, and closing inquiry.',
    containerSpec: '1160px max-width shell (px-5 sm:px-8) · 20ch left-aligned hero display measure · full-bleed right-edge horizontal rail',
    breakpoints: {
      desktop: '1440px+: Left-aligned compact intro (~400px tall) with Featured Work heading and upper card plates peeking into the initial viewport.',
      tablet: '768px–1023px: Compact left-aligned intro and horizontally scrollable 4-card FeaturedWorkRail.',
      mobile: '375px–639px: Single-column editorial flow with touch-scrollable horizontal featured rail.',
    },
    tokens: ['--apple-bg', '--apple-bg-secondary', '--apple-label-primary', '--apple-blue-fill', '--shadow-apple-card'],
    accessibilityNotes:
      'Single <h1> hero heading, semantic horizontal gallery landmark, keyboard-focusable cards, and zero vertical scroll-trapping.',
    sectionHierarchy: [
      {
        order: '01',
        name: 'Global Sticky Navbar',
        layoutRole: '52px frosted top landmark',
        componentComposition: 'Navbar (Wordmark → / · Work → /work · Notes · About · Contact · Design System · Search & Preferences)',
        typography: '13px SF Pro Text',
        spacing: 'h-[52px] · px-5 sm:px-8',
      },
      {
        order: '02',
        name: 'Compact Left-Aligned Hero',
        layoutRole: 'Concise designer positioning & immediate entry',
        componentComposition: 'Role eyebrow + availability · Display H1 · Lead intro · Primary/Outline CTA pair + location',
        typography: '.type-display + .type-lead',
        spacing: 'pt-10 pb-10 sm:pt-12 sm:pb-12 lg:pt-14 lg:pb-14',
      },
      {
        order: '03',
        name: 'Featured Work Horizontal Rail',
        layoutRole: 'Four featured case studies peeking above the fold',
        componentComposition: 'FeaturedWorkRail (4 × ProjectCard variant="rail" + View all 6 projects link to /work)',
        typography: '.type-title-2 header + .type-title-3 rail titles',
        spacing: 'py-12 sm:py-16 · gap-5 sm:gap-6',
      },
      {
        order: '04',
        name: 'About, Capabilities & Experiments',
        layoutRole: 'Practice framing, collaboration scopes, and expandable craft appendix',
        componentComposition: '2-column About preview · 4-column Capabilities · Inset-grouped Experiments accordion',
        typography: '.type-title-2 + .type-body + .type-callout',
        spacing: 'py-24 sm:py-32 alternating bands',
      },
      {
        order: '05',
        name: 'Contact Closing & Global Footer',
        layoutRole: 'Closing inquiry card, copyable email, and Colophon access',
        componentComposition: 'Elevated Contact Card · Footer · Copy email · ColophonDrawer',
        typography: '.type-footnote + .type-caption labels',
        spacing: 'border-t · py-16 sm:py-20',
      },
    ],
  },
  {
    id: 'work-index',
    name: 'Work Index',
    routePattern: '/work',
    sourceFile: 'src/pages/WorkPage.tsx',
    purpose:
      'Dedicated complete archive of all six case studies with category segmented filtering, live keyword search, sorting, and shared ProjectCard grids.',
    containerSpec: '1160px max-width shell (px-5 sm:px-8) · asymmetric editorial grid in default view + 2-column filtered grid',
    breakpoints: {
      desktop: '1440px+: 1160px container, inline category + sort bar, asymmetric featured/standard/wide ProjectCard archive.',
      tablet: '768px–1023px: 2-column ProjectCard grid with balanced gutters and responsive filter bar.',
      mobile: '375px–639px: Single-column stack with horizontal filter strip and full-width ProjectCard plates.',
    },
    tokens: ['--apple-bg', '--apple-bg-secondary', '--apple-control-thumb', '--apple-separator', '--shadow-apple-card'],
    accessibilityNotes:
      'Keyboard-operable category and sort segmented groups with aria-pressed, polite live result counter, and clear zero-results reset button.',
    sectionHierarchy: [
      {
        order: '01',
        name: 'Work Index Header',
        layoutRole: 'Archive orientation & case study count',
        componentComposition: 'Eyebrow count · Display H1 · Concise archive description',
        typography: '.type-display + .type-lead',
        spacing: 'pt-12 pb-10 sm:pt-16 sm:pb-12',
      },
      {
        order: '02',
        name: 'Filter, Sort & Search Bar',
        layoutRole: 'Client-side project discovery',
        componentComposition: 'Category Segmented Control · Sort Segmented Control · Pill Search Field · Live count + Reset',
        typography: '13px–13.5px controls + tabular counts',
        spacing: 'py-12 sm:py-16 · border-t sub-row',
      },
      {
        order: '03',
        name: 'Complete Case Study Grid',
        layoutRole: 'All 6 projects via shared ProjectCard variants',
        componentComposition: 'ProjectCard (featured, standard, wide) + calm zero-results empty state',
        typography: '.type-title-2 + .type-title-3 + unboxed metadata',
        spacing: 'mt-10 · gap-7 lg:gap-8',
      },
    ],
  },
  {
    id: 'case-study-landing',
    name: 'Case-Study Landing (Opening)',
    routePattern: '/work/:slug (Above the Fold)',
    sourceFile: 'src/pages/CaseStudyPage.tsx',
    purpose:
      'Establish immediate project credibility, role clarity, reading-depth control, and audio narration before transitioning into deep visual evidence.',
    containerSpec: '1160px showcase shell · 60ch thesis measure · 16:9 cover plate',
    breakpoints: {
      desktop: '1440px+: Wide 4-column metadata strip, inline Summary/Full depth toggle, full 1160px cover plate.',
      tablet: '768px–1023px: 4-column metadata strip; AudioPlayer spans full container cleanly.',
      mobile: '375px–639px: 2×2 metadata grid, compact breadcrumbs, 16:9 rounded-20px hero image.',
    },
    tokens: ['--apple-bg', '--apple-bg-secondary', '--apple-separator', '--apple-surface-ios-bar'],
    accessibilityNotes:
      'Breadcrumbs provide immediate return to /work; Reading Depth toggle uses role="group" + aria-pressed; AudioPlayer is fully keyboard operable.',
    sectionHierarchy: [
      {
        order: '01',
        name: 'Breadcrumb & Context Header',
        layoutRole: 'Route orientation & project thesis',
        componentComposition: 'Breadcrumbs (Work → /work) · Project H1 · Subtitle · Depth & Reader Comfort controls',
        typography: '.type-title-1 + .type-callout (measure-prose)',
        spacing: 'pt-10 pb-8',
      },
      {
        order: '02',
        name: 'Metadata Specification Strip',
        layoutRole: 'Role, Timeline, Domain & Platform summary',
        componentComposition: 'Semantic <dl> 4-column specification row',
        typography: '.type-caption labels + 14.5px medium values',
        spacing: 'border-y · py-6 · gap-6',
      },
      {
        order: '03',
        name: 'Reading Controls & Narration Deck',
        layoutRole: 'Executive Summary vs Full Study + Listen mode',
        componentComposition: 'Depth segmented control · AudioPlayer deck · ReaderComfortPopover',
        typography: '13px control labels + tabular duration',
        spacing: 'mt-6 · gap-4',
      },
      {
        order: '04',
        name: 'Hero Visual Plate',
        layoutRole: 'Primary product artifact showcase',
        componentComposition: 'Aspect-locked 16:9 figure plate with Lightbox zoom trigger',
        typography: '.type-footnote figure caption',
        spacing: 'mt-10 · rounded-[28px]',
      },
    ],
  },
  {
    id: 'case-study-content',
    name: 'Case-Study Content (Long-Form)',
    routePattern: '/work/:slug (Chapters 01–07 + Closing)',
    sourceFile: 'src/pages/CaseStudyPage.tsx',
    purpose:
      'Deliver structured multi-chapter product storytelling combining 60ch prose, interactive prototypes, architecture diagrams, credits, and related case studies.',
    containerSpec: '1160px shell · 60ch prose column · Adaptive TOC rail / bar',
    breakpoints: {
      desktop: '1440px+: Active TOC variant (Notch Rail / Capsule / Local Ribbon / macOS Rail / Scrubber) alongside 60ch narrative + wide diagram plates.',
      tablet: '768px–1023px: Clean single-column narrative with MobileReadingBar bottom sheet trigger.',
      mobile: '375px–639px: 60ch fluid prose, stacked prototypes, sticky MobileReadingBar (<15% viewport height).',
    },
    tokens: ['--measure-prose', '--apple-separator', '--apple-surface-elevated', '--apple-blue'],
    accessibilityNotes:
      'Heading anchors offset for 52px sticky bar; FloatingBackToTop coordinates with AudioPlayer dock via floatingDock ref-counter so controls never collide.',
    sectionHierarchy: [
      {
        order: '01',
        name: 'Synchronized Table of Contents',
        layoutRole: 'Scroll-tracked 7-chapter navigation',
        componentComposition: 'TableOfContents (applied variant) + MobileReadingBar (< lg)',
        typography: '12px–13px medium + tabular chapter numbers',
        spacing: 'Adaptive rail or sticky top/bottom bar',
      },
      {
        order: '02',
        name: 'Narrative Chapters (01–07)',
        layoutRole: 'Structured problem, research, architecture & outcome prose',
        componentComposition: 'Numbered H2 headers · 60ch body paragraphs · Callout takeaways',
        typography: '.type-title-2 + .type-body (17px / 1.62 LH)',
        spacing: 'space-y-20 · scroll-mt-24',
      },
      {
        order: '03',
        name: 'Interactive Prototypes & Diagrams',
        layoutRole: 'Embedded domain evidence & flows',
        componentComposition: 'CaseStudyDiagram · CaseStudyPrototype · Lightbox gallery plates',
        typography: '.type-caption plate titles + .type-footnote captions',
        spacing: 'my-10 · rounded-[24px]',
      },
      {
        order: '04',
        name: 'Credits, Related Studies & Pagination',
        layoutRole: 'Attribution and seamless next-study continuity',
        componentComposition: 'ProjectCreditsSection · RelatedProjectsSection · Prev/Next links',
        typography: '.type-eyebrow + .type-headline links',
        spacing: 'mt-20 border-t · pt-14',
      },
    ],
  },
  {
    id: 'notes-article',
    name: 'Notes / Article',
    routePattern: '/notes & /notes/:slug',
    sourceFile: 'src/pages/NoteDetailPage.tsx',
    purpose:
      'Support calm long-form essays and design craft notes with distraction-free typography, topic filtering, and customizable Reader Comfort preferences.',
    containerSpec: '1160px header shell · 60ch reading column (Reader Comfort adjustable)',
    breakpoints: {
      desktop: '1440px+: Centered 60ch article measure with top breadcrumb + ReaderComfortPopover.',
      tablet: '768px–1023px: Full 60ch measure with comfortable 32px horizontal gutters.',
      mobile: '375px–639px: Fluid body text scaling smoothly with user Reader Comfort setting.',
    },
    tokens: ['--measure-prose', '--apple-bg', '--apple-label-primary', '--apple-label-secondary'],
    accessibilityNotes:
      'Semantic <article> and <time> elements, ReaderComfortPopover persists preferences in localStorage without breaking zoom or contrast.',
    sectionHierarchy: [
      {
        order: '01',
        name: 'Article Navigation & Comfort Bar',
        layoutRole: 'Breadcrumb trail & reading customization',
        componentComposition: 'Breadcrumbs · ReaderComfortPopover · Date & reading time',
        typography: '.type-footnote + tabular reading duration',
        spacing: 'pt-10 pb-6 border-b',
      },
      {
        order: '02',
        name: 'Essay Header',
        layoutRole: 'Title, thesis dek, and topic framing',
        componentComposition: 'H1 title · Editorial dek · Unboxed topic metadata',
        typography: '.type-title-1 + .type-callout',
        spacing: 'pt-8 pb-10',
      },
      {
        order: '03',
        name: 'Prose Body',
        layoutRole: 'Long-form essay paragraphs & section headings',
        componentComposition: 'Semantic H2/p/blockquote blocks respecting Reader Comfort CSS vars',
        typography: '17px–19px body · 1.62–1.72 line height · 60ch measure',
        spacing: 'space-y-6 · pb-16',
      },
      {
        order: '04',
        name: 'Continue Reading Footer',
        layoutRole: 'Adjacent notes navigation & back to index',
        componentComposition: 'Previous/Next note links + return to /notes',
        typography: '.type-headline links',
        spacing: 'border-t · pt-10',
      },
    ],
  },
  {
    id: 'about',
    name: 'About',
    routePattern: '/about',
    sourceFile: 'src/pages/AboutPage.tsx',
    purpose:
      'Present designer background, working principles, experience timeline, and craft focus with editorial clarity rather than resume clutter.',
    containerSpec: '1160px outer shell · 12-column editorial split (5/7 & 4/8)',
    breakpoints: {
      desktop: '1440px+: Asymmetric 2-column bio/principles layout and structured timeline rows.',
      tablet: '768px–1023px: Clean stacked header followed by 2-column principle pairs.',
      mobile: '375px–639px: Single-column narrative with clear hairline section breaks.',
    },
    tokens: ['--apple-bg', '--apple-bg-secondary', '--apple-separator', '--apple-label-primary'],
    accessibilityNotes:
      'Clear H1 → H2 → H3 document outline, descriptive external link affordances, and readable secondary ink ≥ 4.5:1.',
    sectionHierarchy: [
      {
        order: '01',
        name: 'Portrait & Editorial Bio Header',
        layoutRole: 'Personal introduction & design philosophy',
        componentComposition: 'H1 statement · 60ch biography · Location/clock context',
        typography: '.type-title-1 + .type-body',
        spacing: 'pt-14 pb-12',
      },
      {
        order: '02',
        name: 'Practice Principles',
        layoutRole: 'Core UX & systems tenets',
        componentComposition: 'Numbered hairline-separated editorial grid',
        typography: '.type-headline + .type-callout',
        spacing: 'border-t · py-14 · gap-8',
      },
      {
        order: '03',
        name: 'Experience & Capabilities',
        layoutRole: 'Chronological background & domain depth',
        componentComposition: 'Two-column timeline rows with tabular year spans',
        typography: '.type-headline roles + tabular-nums years',
        spacing: 'border-t · py-14',
      },
      {
        order: '04',
        name: 'Closing Collaboration CTA',
        layoutRole: 'Direct handoff to Contact route',
        componentComposition: 'Primary CTA button to /contact + direct email copy',
        typography: '.type-title-3 + .apple-btn-primary',
        spacing: 'border-t · pt-12',
      },
    ],
  },
  {
    id: 'contact',
    name: 'Contact',
    routePattern: '/contact',
    sourceFile: 'src/pages/ContactPage.tsx',
    purpose:
      'Provide a calm, reliable inquiry workflow combining direct email copy, live timezone awareness, and a validated project inquiry form.',
    containerSpec: '1160px shell · 12-column split (5-col context / 7-col form)',
    breakpoints: {
      desktop: '1440px+: Left editorial context & availability column paired with right elevated form card.',
      tablet: '768px–1023px: Vertical stack with wide comfortable form controls.',
      mobile: '375px–639px: Full-width 46px inputs, tap-friendly copy button, zero horizontal overflow.',
    },
    tokens: ['--apple-surface-elevated', '--apple-bg-secondary', '--apple-blue-fill', '--apple-error'],
    accessibilityNotes:
      'Strict <label htmlFor>, client-side validation moving focus to first invalid field, aria-invalid/aria-describedby, and role="status" submission confirmation.',
    sectionHierarchy: [
      {
        order: '01',
        name: 'Inquiry Opening & Availability',
        layoutRole: 'Set response expectation and direct channels',
        componentComposition: 'H1 · Availability note · LocalTimeClock · Copy email button',
        typography: '.type-title-1 + .type-callout',
        spacing: 'pt-14 pb-8',
      },
      {
        order: '02',
        name: 'Validated Project Form',
        layoutRole: 'Structured brief capture (Name, Email, Topic, Message)',
        componentComposition: 'Elevated form card · .apple-input fields · .apple-btn-primary submit',
        typography: '.type-caption labels + 15px inputs',
        spacing: 'p-6 sm:p-8 · space-y-5',
      },
      {
        order: '03',
        name: 'Direct Social & Links Rail',
        layoutRole: 'Secondary channels (LinkedIn, GitHub, X, Read.cv)',
        componentComposition: 'Hairline-divided external links with Lucide ArrowUpRight',
        typography: '.type-footnote + .apple-link',
        spacing: 'border-t · pt-6',
      },
    ],
  },
] as const;

/* ==========================================================================
   3. UNIFIED DOCUMENTATION HUB INDEX (15 STUDIO DESTINATIONS)
   ========================================================================== */

export type DocMaturity = 'production' | 'experimental' | 'proposed';

export interface DocumentationHubEntry {
  id: Exclude<DesignWorkshopSection, 'documentation'>;
  title: string;
  path: string;
  groupId: StudioGroupId;
  groupLabel: string;
  maturity: DocMaturity;
  summary: string;
  topics: readonly string[];
  sourcePointers: readonly string[];
  relatedLinks: readonly { label: string; path: string }[];
}

export const DOCUMENTATION_HUB_INDEX: readonly DocumentationHubEntry[] = [
  {
    id: 'overview',
    title: 'Overview',
    path: '/design-system',
    groupId: 'foundations',
    groupLabel: 'Foundations',
    maturity: 'production',
    summary:
      'Studio entry dashboard summarizing active sandbox context, 100/100 WCAG AA contrast verification, live registry counts, and the architecture directory.',
    topics: ['architecture', 'telemetry', 'wcag', 'sandbox', 'audit'],
    sourcePointers: ['src/components/workshop/StudioOverviewSection.tsx', 'src/utils/studioNavigation.ts'],
    relatedLinks: [
      { label: 'Colour & Themes', path: '/design-system/colour-themes' },
      { label: 'Components', path: '/design-system/components' },
    ],
  },
  {
    id: 'colour-themes',
    title: 'Colour & Themes',
    path: '/design-system/colour-themes',
    groupId: 'foundations',
    groupLabel: 'Foundations',
    maturity: 'production',
    summary:
      'Semantic surface, ink, hairline, Editorial Ink CTA, and Editorial Cobalt accent tokens across Warm Gallery Paper (production) and Cool Porcelain (Studio comparison) in Light and Dark modes.',
    topics: ['colour', 'themes', 'palettes', 'wcag', 'contrast', 'dark mode', 'cool', 'warm'],
    sourcePointers: ['src/components/workshop/ColourThemesFoundation.tsx', 'src/utils/a11yContrast.ts', 'src/index.css'],
    relatedLinks: [
      { label: 'Surfaces & Elevation', path: '/design-system/surfaces-elevation' },
      { label: 'Decision Log', path: '/design-system/decisions' },
    ],
  },
  {
    id: 'typography',
    title: 'Typography',
    path: '/design-system/typography',
    groupId: 'foundations',
    groupLabel: 'Foundations',
    maturity: 'production',
    summary:
      'Apple Dynamic Type scale (.type-display through .type-caption), optical letter-spacing, Inter fallback calibration, and 60ch reading measure.',
    topics: ['typography', 'type scale', 'sf pro', 'inter', 'measure', '60ch', 'tracking'],
    sourcePointers: ['src/components/workshop/TypographyFoundation.tsx', 'src/utils/foundationsCatalog.ts', 'src/index.css'],
    relatedLinks: [
      { label: 'Spacing & Layout', path: '/design-system/spacing-layout' },
      { label: 'Page Templates', path: '/design-system/page-templates' },
    ],
  },
  {
    id: 'spacing-layout',
    title: 'Spacing & Layout',
    path: '/design-system/spacing-layout',
    groupId: 'foundations',
    groupLabel: 'Foundations',
    maturity: 'production',
    summary:
      '4px spatial cadence, 1160px editorial container boundaries, 60ch prose measure, responsive breakpoints, and container-to-child padding hierarchy.',
    topics: ['spacing', 'layout', 'grid', '1160px', 'breakpoints', 'rhythm'],
    sourcePointers: ['src/components/workshop/SpacingLayoutFoundation.tsx', 'src/utils/foundationsCatalog.ts'],
    relatedLinks: [
      { label: 'Page Templates', path: '/design-system/page-templates' },
      { label: 'Patterns', path: '/design-system/patterns' },
    ],
  },
  {
    id: 'surfaces-elevation',
    title: 'Surfaces, Borders & Elevation',
    path: '/design-system/surfaces-elevation',
    groupId: 'foundations',
    groupLabel: 'Foundations',
    maturity: 'production',
    summary:
      'Corner radii scale (8px–28px + pill), alpha hairline separators, frosted glass surfaces, and calibrated Light/Dark physical shadow tokens.',
    topics: ['surfaces', 'borders', 'hairlines', 'elevation', 'shadows', 'radius', 'glass'],
    sourcePointers: ['src/components/workshop/SurfacesElevationFoundation.tsx', 'src/index.css'],
    relatedLinks: [
      { label: 'Materials & Effects Lab', path: '/design-system/effects' },
      { label: 'Colour & Themes', path: '/design-system/colour-themes' },
    ],
  },
  {
    id: 'components',
    title: 'Components',
    path: '/design-system/components',
    groupId: 'library',
    groupLabel: 'Library',
    maturity: 'production',
    summary:
      'Interactive 43-component portfolio catalog across 8 categories (42 production + 1 experimental specimen) with 13-point documentation and live playgrounds.',
    topics: ['components', 'buttons', 'inputs', 'cards', 'modals', 'drawers', 'audio', 'cassette', 'ipod', 'lightbox'],
    sourcePointers: ['src/components/workshop/ComponentLibraryView.tsx', 'src/utils/componentLibraryCatalog.ts'],
    relatedLinks: [
      { label: 'Patterns', path: '/design-system/patterns' },
      { label: 'Interaction States', path: '/design-system/interaction-states' },
    ],
  },
  {
    id: 'patterns',
    title: 'Patterns',
    path: '/design-system/patterns',
    groupId: 'library',
    groupLabel: 'Library',
    maturity: 'production',
    summary:
      'Twelve portfolio composition patterns (10 production live + 2 proposed/conditional: Before/After Comparisons and Testimonials) with live specimens.',
    topics: ['patterns', 'hero', 'metadata', 'credits', 'related projects', 'testimonials', 'before after', 'footer'],
    sourcePointers: ['src/components/workshop/PatternsSection.tsx', 'src/utils/studioLibraryCatalog.ts'],
    relatedLinks: [
      { label: 'Page Templates', path: '/design-system/page-templates' },
      { label: 'Components', path: '/design-system/components' },
    ],
  },
  {
    id: 'page-templates',
    title: 'Page Templates',
    path: '/design-system/page-templates',
    groupId: 'library',
    groupLabel: 'Library',
    maturity: 'production',
    summary:
      'Six structural route blueprints (Homepage, Case-Study Landing & Content, Notes/Article, About, Contact) with responsive wireframe previews.',
    topics: ['templates', 'blueprints', 'routes', 'homepage', 'case study', 'notes', 'about', 'contact'],
    sourcePointers: ['src/components/workshop/PageTemplatesSection.tsx', 'src/utils/studioLibraryCatalog.ts'],
    relatedLinks: [
      { label: 'Patterns', path: '/design-system/patterns' },
      { label: 'Spacing & Layout', path: '/design-system/spacing-layout' },
    ],
  },
  {
    id: 'interaction-states',
    title: 'Interaction States',
    path: '/design-system/interaction-states',
    groupId: 'behaviour',
    groupLabel: 'Behaviour',
    maturity: 'production',
    summary:
      'Live 5-primitive verification matrix, complete 10-state taxonomy (Default through Error/Success), and 9 interaction behaviour patterns with input parity.',
    topics: ['states', 'hover', 'focus', 'pressed', 'disabled', 'loading', 'error', 'success', 'keyboard', 'aria'],
    sourcePointers: ['src/components/workshop/ComponentsSection.tsx', 'src/utils/behaviourCatalog.ts'],
    relatedLinks: [
      { label: 'Motion & Transitions', path: '/design-system/motion' },
      { label: 'Components', path: '/design-system/components' },
    ],
  },
  {
    id: 'motion',
    title: 'Motion & Transitions',
    path: '/design-system/motion',
    groupId: 'behaviour',
    groupLabel: 'Behaviour',
    maturity: 'production',
    summary:
      'Four motion layers, real codebase easing/spring vocabulary, synchronized displacement tracks, and an interactive Before/After Motion Playground with reduced-motion simulation.',
    topics: ['motion', 'transitions', 'springs', 'easing', 'reduced motion', 'playground', 'choreography'],
    sourcePointers: ['src/components/workshop/MotionIconsSoundSection.tsx', 'src/utils/motion.ts', 'src/utils/behaviourCatalog.ts'],
    relatedLinks: [
      { label: 'Interaction States', path: '/design-system/interaction-states' },
      { label: 'Icons & Sound', path: '/design-system/icons-sound' },
    ],
  },
  {
    id: 'icons-sound',
    title: 'Icons & Sound',
    path: '/design-system/icons-sound',
    groupId: 'behaviour',
    groupLabel: 'Behaviour',
    maturity: 'production',
    summary:
      'Unified 100% Lucide icon system (lucide-react + calibrated @animate-ui/react interactive triggers), 12px–24px stroke standard (1.75px default), and 8 Web Audio tactile cues with acoustic policy.',
    topics: ['icons', 'lucide', 'svg', 'sound', 'web audio', 'acoustics', 'stroke weight'],
    sourcePointers: ['src/components/workshop/MotionIconsSoundSection.tsx', 'src/components/icons/AnimatedLucide.tsx', 'src/components/icons/AudioSkipIcons.tsx', 'src/utils/soundEngine.ts'],
    relatedLinks: [
      { label: 'Motion & Transitions', path: '/design-system/motion' },
      { label: 'Components', path: '/design-system/components' },
    ],
  },
  {
    id: 'effects',
    title: 'Materials & Effects Lab',
    path: '/design-system/effects',
    groupId: 'exploration',
    groupLabel: 'Exploration',
    maturity: 'experimental',
    summary:
      'Seven isolated exploration tracks (paper grain, edge glow, gradients, blur, parallax, shadows, hairlines) with copyable live CSS output and Production vs. Experimental material matrix.',
    topics: ['materials', 'effects', 'grain', 'blur', 'parallax', 'gradients', 'glass', 'css', 'experimental'],
    sourcePointers: ['src/components/workshop/EffectsLabSection.tsx', 'src/utils/workshopStore.ts', 'src/utils/behaviourCatalog.ts'],
    relatedLinks: [
      { label: 'Surfaces & Elevation', path: '/design-system/surfaces-elevation' },
      { label: 'Decision Log', path: '/design-system/decisions' },
    ],
  },
  {
    id: 'toc-lab',
    title: 'TOC Lab',
    path: '/design-system/toc-lab',
    groupId: 'exploration',
    groupLabel: 'Exploration',
    maturity: 'production',
    summary:
      'Live scrolling benchmark comparing 5 Apple-grade Case Study Table of Contents architectures with direct promotion into the active portfolio preference.',
    topics: ['toc', 'table of contents', 'scroll', 'navigation', 'case study', 'chapters'],
    sourcePointers: ['src/pages/TocLabPage.tsx', 'src/components/TableOfContents.tsx'],
    relatedLinks: [
      { label: 'Page Templates', path: '/design-system/page-templates' },
      { label: 'Decision Log', path: '/design-system/decisions' },
    ],
  },
  {
    id: 'experiments',
    title: 'Experiments & Versions',
    path: '/design-system/experiments',
    groupId: 'exploration',
    groupLabel: 'Exploration',
    maturity: 'experimental',
    summary:
      'Client-side design experiments with immutable snapshots, Before/After visual diffing, auto-checkpoint restore, scoped JSON import/export, and two-way Decision Log sync.',
    topics: ['experiments', 'versions', 'snapshots', 'diff', 'restore', 'json', 'sandbox'],
    sourcePointers: ['src/components/workshop/ExperimentsSection.tsx', 'src/utils/experimentsStore.ts'],
    relatedLinks: [
      { label: 'Decision Log', path: '/design-system/decisions' },
      { label: 'Materials & Effects Lab', path: '/design-system/effects' },
    ],
  },
  {
    id: 'decisions',
    title: 'Decision Log',
    path: '/design-system/decisions',
    groupId: 'system',
    groupLabel: 'System',
    maturity: 'production',
    summary:
      'Structured visual approval log tracking Exploring, Approved, Rejected, and Promoted decisions with scoped JSON import/export and Markdown token promotion summaries.',
    topics: ['decisions', 'approvals', 'promotion', 'markdown', 'json', 'governance'],
    sourcePointers: ['src/components/workshop/DecisionLogSection.tsx', 'src/utils/workshopStore.ts'],
    relatedLinks: [
      { label: 'Experiments & Versions', path: '/design-system/experiments' },
      { label: 'Materials & Effects Lab', path: '/design-system/effects' },
    ],
  },
] as const;

export function searchDocumentationHub(
  entries: readonly DocumentationHubEntry[],
  filters: {
    query?: string;
    groupId?: 'all' | StudioGroupId;
    maturity?: 'all' | DocMaturity;
  },
): DocumentationHubEntry[] {
  const q = (filters.query ?? '').trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.groupId && filters.groupId !== 'all' && entry.groupId !== filters.groupId) {
      return false;
    }
    if (filters.maturity && filters.maturity !== 'all' && entry.maturity !== filters.maturity) {
      return false;
    }
    if (!q) return true;
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q) ||
      entry.groupLabel.toLowerCase().includes(q) ||
      entry.topics.some((t) => t.toLowerCase().includes(q)) ||
      entry.sourcePointers.some((p) => p.toLowerCase().includes(q))
    );
  });
}
