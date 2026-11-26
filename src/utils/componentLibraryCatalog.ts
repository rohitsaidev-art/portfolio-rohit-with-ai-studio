import type { DoDontItem } from '../components/workshop/FoundationDocPrimitives';

export type ComponentCategoryId =
  | 'actions-controls'
  | 'navigation'
  | 'cards-content'
  | 'forms-inputs'
  | 'overlays-disclosures'
  | 'feedback-status'
  | 'media-interactive'
  | 'editorial-data';

export type ComponentMaturityStatus = 'production' | 'experimental';

export type InteractionStateName =
  | 'Default'
  | 'Hover'
  | 'Focus-visible'
  | 'Pressed / Active'
  | 'Disabled'
  | 'Loading'
  | 'Selected'
  | 'Error'
  | 'Success';

export interface ComponentStateSpec {
  state: InteractionStateName;
  trigger: string;
  treatment: string;
}

export interface ComponentVariantSpec {
  name: string;
  usage: string;
}

export interface ComponentImplementationRef {
  /** Real file path relative to repo root (for production components) or workshop specimen path */
  sourcePath: string;
  /** Real exported symbol or pattern label */
  exportName: string;
  /** Real CSS classes from src/index.css or Tailwind composition */
  cssClasses: readonly string[];
  /** Copyable concise JSX / CSS usage snippet */
  snippet: string;
}

export interface ComponentLibraryItem {
  id: string;
  categoryId: ComponentCategoryId;
  name: string;
  shortTitle: string;
  status: ComponentMaturityStatus;
  /** 1. Component name and purpose */
  purpose: string;
  /** 3. Anatomy and constituent elements */
  anatomy: readonly string[];
  /** 4. Variants */
  variants: readonly ComponentVariantSpec[];
  /** 5. Meaningful applicable interaction states only */
  interactionStates: readonly ComponentStateSpec[];
  /** 6. Behaviour and expected outcomes */
  behavior: string;
  /** 7. Animation triggers and transitions */
  animation: string;
  /** 8. Responsive behaviour */
  responsiveBehavior: string;
  /** 9. Accessibility requirements */
  accessibility: readonly string[];
  /** 10. Design tokens used (exact CSS custom properties from src/index.css) */
  tokensUsed: readonly string[];
  /** 11. Actual implementation reference */
  implementation: ComponentImplementationRef;
  /** 12. Usage guidance */
  usageGuidance: readonly string[];
  /** 13. Do / Don't examples */
  doDonts: readonly DoDontItem[];
  /** Whether the playground includes Desktop / Tablet / Mobile responsive frame switching */
  supportsViewportPreview?: boolean;
}

export interface ComponentCategoryMeta {
  id: ComponentCategoryId;
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  label: string;
  shortLabel: string;
  description: string;
}

export interface ExcludedComponentEntry {
  name: string;
  category: string;
  reason: string;
  portfolioAlternative: string;
}

export const COMPONENT_CATEGORIES: readonly ComponentCategoryMeta[] = [
  {
    id: 'actions-controls',
    code: 'A',
    label: 'Actions & Controls',
    shortLabel: 'Actions',
    description:
      'Buttons, editorial links, segmented filters, switches, search/select triggers, and tactile range controls.',
  },
  {
    id: 'navigation',
    code: 'B',
    label: 'Navigation',
    shortLabel: 'Navigation',
    description:
      'Primary frosted navigation, breadcrumbs, five Case Study TOC architectures, Command Palette (⌘K), and preference popovers.',
  },
  {
    id: 'cards-content',
    code: 'C',
    label: 'Cards & Content',
    shortLabel: 'Cards',
    description:
      'Project showcase cards, related study recommendations, feature/editorial surfaces, testimonials, and unboxed metadata.',
  },
  {
    id: 'forms-inputs',
    code: 'D',
    label: 'Forms & Inputs',
    shortLabel: 'Forms',
    description:
      'Validated text, email, select, textarea, engagement selector pills, loading submission states, and confirmation sheets.',
  },
  {
    id: 'overlays-disclosures',
    code: 'E',
    label: 'Overlays & Disclosures',
    shortLabel: 'Overlays',
    description:
      'Slide-over drawers, full-screen zoomable lightbox, zero-jank disclosure accordions, and mobile bottom-sheet pickers.',
  },
  {
    id: 'feedback-status',
    code: 'F',
    label: 'Feedback & Status',
    shortLabel: 'Feedback',
    description:
      'Non-stacking toast notifications, WCAG AA semantic status banners, spinners/skeletons, and calm empty or error recovery.',
  },
  {
    id: 'media-interactive',
    code: 'G',
    label: 'Media & Interactive',
    shortLabel: 'Media',
    description:
      'AudioPlayer with live waveform synthesis, before/after comparator, multi-state case study prototypes, SVG diagrams, and IST clock.',
  },
  {
    id: 'editorial-data',
    code: 'H',
    label: 'Editorial & Data',
    shortLabel: 'Editorial',
    description:
      'Section headers, hairline dividers, structured tables, practice chronology timeline, verified scope metrics, and editorial callouts.',
  },
] as const;

export const COMPONENT_LIBRARY_ITEMS: readonly ComponentLibraryItem[] = [
  /* ========================================================================
     A. ACTIONS & CONTROLS
     ======================================================================== */
  {
    id: 'buttons',
    categoryId: 'actions-controls',
    name: 'Buttons & Editorial Links',
    shortTitle: 'Buttons & Links',
    status: 'production',
    purpose:
      'Primary, outline, tonal, and inline text actions establishing a clear single-primary visual hierarchy across hero sections, case studies, and forms.',
    anatomy: [
      'Pill container (rounded-full, min-height 44px on touch targets)',
      'Optional leading or trailing 14–16px SF Symbol icon',
      'Single-line SF Pro Text label (15–16px, tight -0.014em tracking)',
      'Optional .apple-spinner during async submission or sync',
    ],
    variants: [
      { name: 'Primary (.apple-btn-primary)', usage: 'Single highest-priority CTA per view (Explore Selected Work, Send Inquiry).' },
      { name: 'Outline (.apple-btn-outline)', usage: 'Paired secondary hero action on light/dark canvas (Get in touch).' },
      { name: 'Tonal (.apple-btn-tonal)', usage: 'Quiet utility actions (Copy email, Print Resume, Secondary sheet actions).' },
      { name: 'Editorial Link (.apple-link)', usage: 'Inline navigation and "Read case study ›" text links without button chrome.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting interactive element', treatment: 'Apple Blue fill (#0071E3) with subtle top specular inset, 1px outline border, or neutral tonal fill.' },
      { state: 'Hover', trigger: 'Pointer hover on non-disabled button', treatment: 'Primary darkens to --apple-blue-hover with soft blue drop shadow; Outline inverts to solid fill; Tonal shifts to --apple-control-tonal-hover.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab navigation', treatment: '2px solid --apple-blue outline with 3px offset (:focus-visible).' },
      { state: 'Pressed / Active', trigger: 'Pointer down or Space/Enter keydown', treatment: 'Micro tactile compression scale(0.97) via --apple-press-scale and deeper fill.' },
      { state: 'Disabled', trigger: 'disabled or aria-disabled="true"', treatment: 'Opacity drops to 0.46 (--apple-disabled-opacity), shadow removed, pointer-events disabled.' },
      { state: 'Loading', trigger: 'aria-busy="true" or data-loading="true"', treatment: 'Inline .apple-spinner replaces/precedes label, opacity 0.78–0.84, cursor progress.' },
    ],
    behavior:
      'Triggers immediate navigation, clipboard copy, or form submission. Uses native <button type="button|submit"> for actions and <a href> for route links so Cmd/Ctrl+Click opens new tabs normally.',
    animation:
      'Background/color fade 180ms ease; press scale and shadow 220ms cubic-bezier(0.22, 1, 0.36, 1). Transform disabled automatically under prefers-reduced-motion.',
    responsiveBehavior:
      'Maintains a 44px minimum touch target height across viewports; compact desktop overrides (e.g., 30px Navbar CTA) expand back to 44px inside mobile drawers.',
    accessibility: [
      'Always use <button> for in-page actions and <a> for navigation.',
      'Set aria-busy="true" and keep descriptive text ("Preparing inquiry…") while loading.',
      'Primary white-on-blue (#FFFFFF on #0071E3) passes 4.68:1 WCAG 2.2 AA contrast.',
    ],
    tokensUsed: [
      '--apple-blue-fill',
      '--apple-blue-hover',
      '--apple-blue-active',
      '--apple-blue',
      '--apple-link',
      '--apple-control-tonal',
      '--apple-control-tonal-hover',
      '--apple-disabled-opacity',
      '--apple-press-scale',
      '--ease-apple',
    ],
    implementation: {
      sourcePath: 'src/index.css',
      exportName: '.apple-btn-primary / .apple-btn-outline / .apple-btn-tonal / .apple-link',
      cssClasses: ['.apple-btn-primary', '.apple-btn-outline', '.apple-btn-tonal', '.apple-link', '.apple-spinner'],
      snippet: `<button type="button" className="apple-btn-primary">\n  <span>Send inquiry</span>\n</button>`,
    },
    usageGuidance: [
      'Restrict each viewport section to one primary filled button to protect visual hierarchy.',
      'Pair primary + outline in hero bands; pair primary + tonal inside drawers and confirmation cards.',
      'Prefer .apple-link with SFChevronRight for card-level reading affordances instead of repeating blue pills.',
    ],
    doDonts: [
      {
        doText: 'Use .apple-btn-tonal for secondary utilities like "Copy email address" or "Print Resume".',
        dontText: 'Place two or more filled .apple-btn-primary buttons side-by-side in the same toolbar.',
      },
      {
        doText: 'Show .apple-spinner with descriptive text ("Preparing inquiry…") during loading.',
        dontText: 'Freeze a button silently on click without aria-busy or visual feedback.',
      },
    ],
  },
  {
    id: 'icon-buttons',
    categoryId: 'actions-controls',
    name: 'Icon Buttons & Action Groups',
    shortTitle: 'Icon Buttons',
    status: 'production',
    purpose:
      'Compact circular icon controls and paired utility clusters used for modal dismissal, shortlist bookmarking, preferences, and audio transport.',
    anatomy: [
      'Circular hit target (h-11 w-11 on mobile, h-8/h-9 on desktop)',
      'Centered 14–18px SF Symbol SVG icon',
      'Optional tonal surface or frosted floating ring (for card bookmark overlay)',
      'Optional grouped container with 6–8px gap for paired utility actions',
    ],
    variants: [
      { name: 'Ghost Icon (.apple-btn-icon)', usage: 'Navbar utility buttons, dismiss icons, and popover triggers.' },
      { name: 'Tonal Icon', usage: 'Modal/drawer close buttons and lightbox zoom controls.' },
      { name: 'Floating Overlay Toggle', usage: 'ProjectCard bookmark toggle with .apple-pill-shadow and selected blue fill.' },
      { name: 'Action Group', usage: 'Zoom -/100%/+ pill group in Lightbox or Navbar utility cluster.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting icon control', treatment: 'Transparent or tonal circular fill with secondary/primary label ink.' },
      { state: 'Hover', trigger: 'Pointer hover', treatment: 'Circular --apple-control-hover wash; floating bookmark scales to 1.05.' },
      { state: 'Focus-visible', trigger: 'Keyboard focus', treatment: '2px solid --apple-blue focus ring with 3px offset.' },
      { state: 'Pressed / Active', trigger: 'Pointer press', treatment: 'Darker --apple-control-active fill and scale(0.95) detent.' },
      { state: 'Selected', trigger: 'aria-pressed="true" (Shortlist bookmark)', treatment: 'Filled --apple-blue-fill circle with white SFBookmarkFill.' },
      { state: 'Disabled', trigger: 'disabled attribute (e.g., Lightbox 100% zoom out)', treatment: 'Opacity 0.46 (--apple-disabled-opacity), cursor not-allowed.' },
    ],
    behavior:
      'Executes a single unambiguous utility action or toggles persistent binary state (bookmark saved/unsaved), playing subtle Web Audio playTick() feedback.',
    animation:
      '160ms ease background/color transition + 200ms --ease-apple active scale.',
    responsiveBehavior:
      'Always expands to 44×44px (h-11 w-11) on mobile viewports (<640px) to satisfy Apple HIG and WCAG target size guidelines, tightening to 32–36px on desktop.',
    accessibility: [
      'Every icon-only button MUST provide a specific aria-label (never generic "Button" or "Action").',
      'Toggle icon buttons (Shortlist, Mute) must expose aria-pressed.',
      'Provide title tooltips for desktop keyboard shortcut hints where helpful.',
    ],
    tokensUsed: [
      '--apple-control-hover',
      '--apple-control-active',
      '--apple-control-tonal',
      '--apple-blue-fill',
      '--apple-surface-ios-bar',
      '--shadow-apple-pill',
      '--apple-disabled-opacity',
    ],
    implementation: {
      sourcePath: 'src/components/Navbar.tsx',
      exportName: '.apple-btn-icon / ProjectCard shortlist trigger',
      cssClasses: ['.apple-btn-icon', '.apple-pill-shadow'],
      snippet: `<button type="button" aria-label="Close panel" className="apple-btn-icon h-11 w-11 sm:h-9 sm:w-9 bg-[var(--apple-control-tonal)]">\n  <SFXmark size={15} />\n</button>`,
    },
    usageGuidance: [
      'Reserve icon-only buttons for universally recognized glyphs (Close, Search, Bookmark, Zoom, Menu, Audio).',
      'Pair adjacent icon controls inside a shared tonal pill when they adjust the same parameter (e.g., Lightbox zoom).',
    ],
    doDonts: [
      {
        doText: 'Give every bookmark icon a project-specific label like "Save StallSync to recruiter shortlist".',
        dontText: 'Render multiple icon buttons with identical vague labels or missing aria-label attributes.',
      },
      {
        doText: 'Maintain 44×44px tap targets on touch screens.',
        dontText: 'Shrink touch-screen icon controls below 40px to save header pixels.',
      },
    ],
  },
  {
    id: 'segmented-control',
    categoryId: 'actions-controls',
    name: 'Segmented Control',
    shortTitle: 'Segmented Control',
    status: 'production',
    purpose:
      'Mutually exclusive pill selector with fluid spring thumb used for portfolio category filtering, 2-Min Skim / Full Story switching, prototype views, and sandbox theme controls.',
    anatomy: [
      'Outer tonal pill track (.apple-segmented, padding 4px)',
      '2–5 horizontal .apple-segmented-item buttons (min-height 36px)',
      'Active sliding thumb (motion.span with layoutId, SPRING_SEGMENT, .apple-pill-shadow)',
      'Optional tabular item count next to each label',
    ],
    variants: [
      { name: 'Standard Filter Bar', usage: 'Home Selected Work category filter with live tabular project counts.' },
      { name: 'Compact Header Control', usage: 'Case Study 2-Min Skim / Full Story toggle and Prototype state bar (!p-0.5, 30–34px).' },
      { name: 'Full-Width Popover Control', usage: 'Appearance (Light / Auto / Dark) and Reader Text Size inside popovers (!w-full flex-1).' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Unselected segment', treatment: 'Secondary ink (--apple-label-secondary) on transparent track.' },
      { state: 'Hover', trigger: 'Pointer hover on unselected item', treatment: 'Ink shifts to --apple-label-primary.' },
      { state: 'Selected', trigger: 'aria-pressed="true"', treatment: 'Elevated --apple-control-thumb pill with --shadow-apple-pill and primary ink.' },
      { state: 'Pressed / Active', trigger: 'Pointer press', treatment: 'Subtle scale(0.97) tactile response.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline.' },
      { state: 'Disabled', trigger: 'disabled or aria-disabled="true"', treatment: 'Opacity 0.46, non-interactive.' },
    ],
    behavior:
      'Switches active view state immediately in place without full-page reload, triggers playTick(), and updates aria-pressed.',
    animation:
      'Shared-element Motion spring thumb (SPRING_SEGMENT: stiffness 440, damping 36, mass 0.8) glides smoothly across segments; instant swap under prefers-reduced-motion.',
    responsiveBehavior:
      'Uses width: fit-content; max-width: 100%; overflow-x: auto so 4–5 segments scroll horizontally inside narrow viewports without wrapping or breaking layout.',
    accessibility: [
      'Wrap segments in role="group" with a clear aria-label.',
      'Expose aria-pressed={isSelected} on each <button type="button">.',
      'Use unique layoutId namespaces when multiple segmented controls mount on the same page.',
    ],
    tokensUsed: [
      '--apple-control-tonal',
      '--apple-control-thumb',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
      '--shadow-apple-pill',
      '--ease-apple',
    ],
    implementation: {
      sourcePath: 'src/pages/HomePage.tsx',
      exportName: '.apple-segmented / .apple-segmented-item',
      cssClasses: ['.apple-segmented', '.apple-segmented-item', '.apple-pill-shadow'],
      snippet: `<div role="group" aria-label="Reading depth" className="apple-segmented">\n  <button type="button" aria-pressed={true} className="apple-segmented-item px-3.5 text-[13px]">Full Story</button>\n</div>`,
    },
    usageGuidance: [
      'Use for 2–5 mutually exclusive views or filters that update content immediately.',
      'Keep labels concise (1–2 words) so segments never wrap onto two lines.',
    ],
    doDonts: [
      {
        doText: 'Use tabular-nums for inline counts so switching filters never jitters button widths.',
        dontText: 'Cram more than 5 verbose labels into a single segmented bar—use a select or search filter instead.',
      },
      {
        doText: 'Keep a unique layoutId per segmented group.',
        dontText: 'Reuse the same Motion layoutId across two visible segmented controls on one screen.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'toggle-switch',
    categoryId: 'actions-controls',
    name: 'iOS Toggle Switch',
    shortTitle: 'Toggle Switch',
    status: 'production',
    purpose:
      'Immediate binary preference switch used inside GlobalPreferencesPopover and ReaderComfortPopover for UI Sound Effects and Focus Reading mode.',
    anatomy: [
      'Pill track (h-6 w-11 rounded-full) filled with --apple-separator-strong (off) or --apple-blue (on)',
      'Circular 20px white thumb (h-5 w-5) translating from 2px to 22px',
      'Paired left-aligned title + short 1-line helper description',
    ],
    variants: [
      { name: 'Preference Row Switch', usage: 'Paired with title and 11.5px caption inside GlobalPreferencesPopover and ReaderComfortPopover.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'aria-checked="false"', treatment: 'Neutral --apple-separator-strong track with thumb anchored left (translate-x-0.5).' },
      { state: 'Selected', trigger: 'aria-checked="true"', treatment: 'Track transitions to --apple-blue with thumb anchored right (translate-x-[22px]).' },
      { state: 'Focus-visible', trigger: 'Keyboard focus', treatment: '2px --apple-blue focus outline with 3px offset.' },
      { state: 'Disabled', trigger: 'disabled attribute', treatment: 'Reduced opacity (0.46) and cursor not-allowed.' },
    ],
    behavior:
      'Toggles setting immediately upon click or Space/Enter key without requiring a separate Save button; emits a subtle non-stacking toast confirmation.',
    animation:
      '200ms track color transition and 200ms thumb translate-x slide.',
    responsiveBehavior:
      'Sits shrink-0 on the trailing edge of a flex row so long preference descriptions wrap cleanly without squishing the 44×24px switch track.',
    accessibility: [
      'Implement as <button type="button" role="switch" aria-checked={enabled}>.',
      'Provide a descriptive aria-label reflecting the toggled feature.',
      'Ensure state is communicated by thumb position AND aria-checked, not color alone.',
    ],
    tokensUsed: [
      '--apple-blue',
      '--apple-separator-strong',
      '--apple-label-primary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/components/GlobalPreferencesPopover.tsx',
      exportName: 'GlobalPreferencesPopover / ReaderComfortPopover switch',
      cssClasses: ['role="switch"'],
      snippet: `<button type="button" role="switch" aria-checked={enabled} aria-label="Toggle Focus Reading" className="relative inline-flex h-6 w-11 items-center rounded-full bg-[var(--apple-blue)]">\n  <span className="inline-block h-5 w-5 translate-x-[22px] rounded-full bg-white shadow-sm" />\n</button>`,
    },
    usageGuidance: [
      'Use switches strictly for immediate on/off system preferences that take effect right away.',
      'Do not use a switch inside a form that requires clicking a Submit button—use a checkbox or button group instead.',
    ],
    doDonts: [
      {
        doText: 'Pair each switch with a brief plain-language helper explaining its scope (e.g., "Independent of AudioPlayer narration").',
        dontText: 'Use switches for multi-option choices (Light / Auto / Dark)—use a segmented control.',
      },
    ],
  },
  {
    id: 'search-select-controls',
    categoryId: 'actions-controls',
    name: 'Search Field & Select Control',
    shortTitle: 'Search & Select',
    status: 'production',
    purpose:
      'Live keyword filtering input (Selected Work & Notes) and native dropdown select (Sort order & Contact timeline) styled on the shared .apple-input token foundation.',
    anatomy: [
      'Search: Rounded pill .apple-input with leading SFMagnifyingGlass, native text field, and conditional SFXmark clear button',
      'Select: Native <select> with appearance-none, .apple-input styling, and pointer-events-none SFChevronDown indicator',
      'Accessible <label> or explicit aria-label',
    ],
    variants: [
      { name: 'Pill Search Input', usage: 'HomePage Selected Work and NotesPage instant client-side filtering.' },
      { name: 'Inline Sort Select', usage: 'Compact rounded-full sort selector paired alongside search.' },
      { name: 'Form Select Field', usage: 'Full-width 46px rounded-[14px] selector in ContactPage.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting control', treatment: 'Quiet --apple-bg-secondary fill with transparent 1px border.' },
      { state: 'Hover', trigger: 'Pointer hover', treatment: 'Subtle fill darkening to --apple-bg-tertiary.' },
      { state: 'Focus-visible', trigger: 'Input focus / Tab', treatment: 'Elevated surface fill, 1px --apple-blue border, and 4px --apple-focus-ring halo.' },
      { state: 'Disabled', trigger: 'disabled attribute', treatment: '0.56 opacity with --apple-input-disabled-bg fill.' },
      { state: 'Error', trigger: 'aria-invalid="true"', treatment: '--apple-error border and 4px --apple-error-ring halo on focus.' },
    ],
    behavior:
      'Search updates filtered lists live on every keystroke and reveals an inline clear button when non-empty; Select leverages native OS pickers on mobile and desktop for reliable accessibility.',
    animation:
      '160ms ease background and border transitions; 180ms focus ring glow.',
    responsiveBehavior:
      'Full-width (w-full) on mobile viewports (<640px) with 40–46px height; caps around 340px max-width inside desktop filter toolbars.',
    accessibility: [
      'Provide clear aria-label or bound <label htmlFor> for both inputs.',
      'Ensure the inline clear button has aria-label="Clear search" and returns focus or resets gracefully.',
      'Prefer native <select> over custom div dropdowns for OS-level screen reader and mobile wheel picker support.',
    ],
    tokensUsed: [
      '--apple-bg-secondary',
      '--apple-bg-tertiary',
      '--apple-surface-elevated',
      '--apple-input-disabled-bg',
      '--apple-blue',
      '--apple-focus-ring',
      '--apple-error',
      '--apple-error-ring',
    ],
    implementation: {
      sourcePath: 'src/pages/HomePage.tsx',
      exportName: 'Selected Work Search & ContactPage Select (.apple-input)',
      cssClasses: ['.apple-input'],
      snippet: `<input type="search" aria-label="Search case studies" placeholder="Search title, discipline, or tool…" className="apple-input min-h-[40px] rounded-full py-2 pl-10 pr-9 text-[13.5px]" />`,
    },
    usageGuidance: [
      'Use pill search fields for live client-side filtering when collections exceed ~4 items.',
      'Use native <select> with SFChevronDown when choosing from 4–8 structured presets.',
    ],
    doDonts: [
      {
        doText: 'Show a live result count alongside search filters so visitors see immediate feedback.',
        dontText: 'Hide native select arrows without rendering an accessible visual chevron.',
      },
    ],
  },
  {
    id: 'range-slider',
    categoryId: 'actions-controls',
    name: 'Range Slider & Scrubber Track',
    shortTitle: 'Sliders',
    status: 'production',
    purpose:
      'Continuous value adjustment used in AudioPlayer (narration progress & volume) and Workshop Effects Lab controls, paired with tabular numeric readouts.',
    anatomy: [
      'Label + live tabular-nums value readout header',
      'Native <input type="range"> or ARIA role="slider" rail with --apple-blue accent',
      'Min/Max boundary ticks or elapsed timecodes where contextually useful',
    ],
    variants: [
      { name: 'Audio Volume & Seek Slider', usage: 'AudioPlayer playback scrubbing and voice volume (0%–100%).' },
      { name: 'Vertical Detent Scrubber', usage: 'TableOfContents tactile-scrubber chapter rail.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting range track', treatment: 'Thin neutral track with Apple Blue accent fill/thumb.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: 'Visible focus ring around slider control.' },
      { state: 'Pressed / Active', trigger: 'Dragging thumb', treatment: 'Active thumb emphasis with real-time readout updates.' },
      { state: 'Disabled', trigger: 'disabled attribute', treatment: 'Muted opacity (0.46), pointer events blocked.' },
    ],
    behavior:
      'Updates controlled numeric state continuously during drag and supports ArrowLeft/ArrowRight/Home/End keyboard increments.',
    animation:
      'Immediate 1:1 pointer tracking (zero lag) on drag; 150ms scale transition on custom scrubber thumbs.',
    responsiveBehavior:
      'Expands across available container width with generous vertical padding so touch thumbs remain easy to grab on 375px screens.',
    accessibility: [
      'Always pair with visible <label htmlFor> or aria-label plus aria-valuetext for units (e.g. "85% volume").',
      'Never rely solely on drag gestures—native <input type="range"> and ARIA sliders must support arrow keys.',
    ],
    tokensUsed: [
      '--apple-blue',
      '--apple-separator',
      '--apple-focus-ring',
      '--apple-label-primary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/components/AudioPlayer.tsx',
      exportName: 'AudioPlayer range controls',
      cssClasses: ['accent-[var(--apple-blue)]', 'tabular-nums'],
      snippet: `<input type="range" min={0} max={100} value={volume} aria-label="Narration volume" className="w-full accent-[var(--apple-blue)]" />`,
    },
    usageGuidance: [
      'Always display the current numeric value in tabular-nums so digits stay steady while dragging.',
      'Use sliders for continuous parameters (volume, playback progress, intensity); use segmented controls for discrete presets.',
    ],
    doDonts: [
      {
        doText: 'Provide discrete step increments and keyboard arrow support.',
        dontText: 'Use a range slider when there are only 2 or 3 fixed choices.',
      },
    ],
  },
  {
    id: 'checkbox-radio-experimental',
    categoryId: 'actions-controls',
    name: 'Checkboxes & Radio Buttons',
    shortTitle: 'Checkboxes & Radios',
    status: 'experimental',
    purpose:
      'Experimental, WCAG-calibrated selection controls documented as a studio reference for potential future multi-select forms. Not currently mounted on public portfolio pages.',
    anatomy: [
      'Native <input type="checkbox"> or <input type="radio"> with 18px accent-[var(--apple-blue)] box/circle',
      'Minimum 44px clickable <label> hit target row',
      'Primary label + optional secondary caption',
    ],
    variants: [
      { name: 'Multi-Select Checkbox List (Experimental)', usage: 'Future multi-scope inquiry checklists or Studio export filters.' },
      { name: 'Radio Option Group (Experimental)', usage: 'Future forms requiring verbose vertical single-select descriptions.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Unchecked control', treatment: 'Subtle hairline surface border with native checkbox/radio indicator.' },
      { state: 'Selected', trigger: 'checked={true}', treatment: 'Apple Blue accent fill with highlighted row tint.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab / Arrow keys', treatment: '4px --apple-focus-ring glow around native input.' },
      { state: 'Error', trigger: 'aria-invalid="true"', treatment: '--apple-error border and inline role="alert" validation note.' },
      { state: 'Disabled', trigger: 'disabled attribute', treatment: '0.5 opacity, non-interactive label.' },
    ],
    behavior:
      'Experimental studio reference only: Checkboxes toggle independent boolean values; Radio buttons enforce single selection within a shared name group via Arrow keys.',
    animation:
      '160ms ease border and background highlight transitions.',
    responsiveBehavior:
      'Stacks cleanly as full-width rows with 44px minimum height on mobile.',
    accessibility: [
      'Group related checkboxes/radios inside <fieldset> with a semantic <legend>.',
      'Use native inputs wrapped by <label> so the full row text is clickable.',
      'Not yet promoted to public production CSS—do not assume public pages style custom checkboxes.',
    ],
    tokensUsed: [
      '--apple-blue',
      '--apple-bg-secondary',
      '--apple-surface-elevated',
      '--apple-separator',
      '--apple-focus-ring',
      '--apple-error',
    ],
    implementation: {
      sourcePath: 'src/components/workshop/ComponentSpecimensPrimary.tsx',
      exportName: 'ExperimentalCheckboxRadioSpecimen (Studio Only)',
      cssClasses: ['accent-[var(--apple-blue)]'],
      snippet: `{/* Experimental Studio Reference — not used on public pages */}\n<label className="flex min-h-[44px] items-center gap-3">\n  <input type="checkbox" className="h-4 w-4 accent-[var(--apple-blue)]" />\n  <span>Include design system audit</span>\n</label>`,
    },
    usageGuidance: [
      'Currently experimental: public pages use Segmented Controls or Pill Groups instead of checkboxes/radios.',
      'Promote only if a future public workflow genuinely requires multi-select checklists or verbose vertical radio descriptions.',
    ],
    doDonts: [
      {
        doText: 'Mark experimental controls explicitly in Studio and Decision Log before adopting publicly.',
        dontText: 'Claim checkboxes or radio buttons are live production portfolio patterns when ContactPage uses pill groups and native select.',
      },
    ],
  },

  /* ========================================================================
     B. NAVIGATION
     ======================================================================== */
  {
    id: 'desktop-mobile-navbar',
    categoryId: 'navigation',
    name: 'Desktop & Mobile Navigation Bar',
    shortTitle: 'Navbar & Mobile Nav',
    status: 'production',
    purpose:
      'Sticky 52px Apple frosted-glass global header implementing the 3-zone contract (Wordmark, Primary Links, Utility + CTA) plus an accessible collapsible mobile drawer.',
    anatomy: [
      'Zone 1: SF Pro Display wordmark linking to /',
      'Zone 2: Primary navigation links (Work, Notes, About, Contact, Design System) with animated active underline',
      'Zone 3: Conditional Shortlist counter, Command Palette (⌘K) trigger, GlobalPreferencesPopover, and compact "Get in touch" CTA',
      'Mobile (<768px): 44px icon controls + collapsible #mobile-nav-drawer with Escape close',
    ],
    variants: [
      { name: 'Resting Top Bar', usage: '1px --apple-separator-subtle bottom border when scrollY <= 10.' },
      { name: 'Scrolled Bar (.apple-nav-scrolled)', usage: 'Adds calibrated --shadow-apple-nav shadow once page scrolls.' },
      { name: 'Mobile Expanded Drawer', usage: '46px touch rows, active "Current" indicator, availability status, and full-width CTA.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Unselected route link', treatment: '13px --apple-label-secondary ink.' },
      { state: 'Hover', trigger: 'Pointer hover on nav link', treatment: 'Ink transitions cleanly to --apple-label-primary.' },
      { state: 'Selected', trigger: 'aria-current="page"', treatment: 'Semibold --apple-label-primary with 1.5px bottom spring underline.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline.' },
    ],
    behavior:
      'Preserves modifier-key tab opening (Cmd/Ctrl+Click), keeps all five primary destinations (Work, Notes, About, Contact, Design System) aligned across desktop and mobile, and dims to 0.52 opacity in Focus Reading mode until hovered/focused.',
    animation:
      'Spring underline (stiffness 420, damping 36) across desktop links; 280ms --ease-apple vertical reveal for mobile drawer.',
    responsiveBehavior:
      'Full 3-zone bar at md (768px+); collapses Zone 2 links into the hamburger drawer below 768px while keeping Search, Preferences, and Shortlist accessible at 44px tap sizes.',
    accessibility: [
      'Wraps links in <nav aria-label="Primary navigation"> with aria-current="page" on active route.',
      'Mobile menu button exposes aria-expanded, aria-controls="mobile-nav-drawer", and restores focus on Escape.',
      'Hidden cleanly in print mode (print:hidden).',
    ],
    tokensUsed: [
      '--apple-surface-glass',
      '--apple-separator-subtle',
      '--shadow-apple-nav',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-control-tonal',
      '--apple-blue-fill',
    ],
    implementation: {
      sourcePath: 'src/components/Navbar.tsx',
      exportName: 'Navbar',
      cssClasses: ['.apple-nav-scrolled', '.apple-link', '.apple-btn-icon', '.apple-btn-primary'],
      snippet: `<Navbar route={route} onNavigate={navigate} onOpenCommandPalette={openCmd} onOpenShortlist={openShortlist} />`,
    },
    usageGuidance: [
      'Keep primary navigation strictly limited to the 5 core routes (Work, Notes, About, Contact, Design System) so the 52px bar never crowds.',
      'Show the Shortlist pill only when shortlistedSlugs.length > 0 so idle chrome stays quiet.',
    ],
    doDonts: [
      {
        doText: 'Keep the header height fixed at 52px so --scroll-offset-header (84px) aligns accurately on every page.',
        dontText: 'Add multi-row navigation bars, promo banners, or static status pills inside the top navbar.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'breadcrumbs',
    categoryId: 'navigation',
    name: 'Breadcrumbs',
    shortTitle: 'Breadcrumbs',
    status: 'production',
    purpose:
      'Subtle editorial location trail orienting visitors on Case Study detail pages, Note detail pages, and Design Studio routes.',
    anatomy: [
      'Semantic <nav aria-label="Breadcrumb"> wrapping an ordered <ol>',
      'Ancestor links styled with .apple-link and hover underline',
      'Muted "/" separators marked aria-hidden="true"',
      'Current page item rendered as medium-weight primary text with aria-current="page"',
    ],
    variants: [
      { name: 'Two-Level Trail', usage: 'Case Studies (Work / StallSync) and Notes (Notes / Essay Title).' },
      { name: 'Three-Level Studio Trail', usage: 'Design Studio workspace header (Design Studio / Library / Components).' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Ancestor link', treatment: '13px --apple-label-secondary text.' },
      { state: 'Hover', trigger: 'Pointer hover on ancestor', treatment: 'Shifts to --apple-link with underline.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline.' },
      { state: 'Selected', trigger: 'Last item (aria-current="page")', treatment: 'Non-interactive medium --apple-label-primary ink.' },
    ],
    behavior:
      'Intercepts standard clicks for SPA navigation while allowing Cmd/Ctrl+Click to open ancestors in a new tab. Returns null when items array is empty.',
    animation:
      '160ms ease link color transition; no entrance motion.',
    responsiveBehavior:
      'Wraps gracefully via flex-wrap gap-x-2 gap-y-1 on narrow mobile screens without horizontal overflow.',
    accessibility: [
      'Uses <nav aria-label="Breadcrumb"> and <ol><li> hierarchy.',
      'Marks separators aria-hidden="true" so screen readers do not announce "slash".',
      'Applies aria-current="page" to the final current segment.',
    ],
    tokensUsed: [
      '--type-footnote-size',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
      '--apple-link',
    ],
    implementation: {
      sourcePath: 'src/components/Breadcrumbs.tsx',
      exportName: 'Breadcrumbs',
      cssClasses: ['.type-footnote', '.apple-link'],
      snippet: `<Breadcrumbs items={[{ label: 'Work', href: '/' }, { label: 'StallSync' }]} onNavigate={onNavigate} />`,
    },
    usageGuidance: [
      'Place at the top-left of detail views paired opposite reading controls.',
      'Keep ancestor labels concise (1–3 words).',
    ],
    doDonts: [
      {
        doText: 'Render the current page as non-clickable text with aria-current="page".',
        dontText: 'Wrap breadcrumb trails in bordered pill boxes or repeat full site navigation inside them.',
      },
    ],
  },
  {
    id: 'table-of-contents',
    categoryId: 'navigation',
    name: 'Table of Contents (5 Architectures)',
    shortTitle: 'Table of Contents',
    status: 'production',
    purpose:
      'Scroll-aware Case Study chapter navigation supporting five selectable Apple-grade architectures synced with reading progress and active AudioPlayer narration.',
    anatomy: [
      'Chapter index numbers (01–07, tabular-nums) and concise chapter titles',
      'Active chapter highlight + visited completion indicators',
      'Live reading progress indicator (hairline bar, circular SVG ring, percentage, or detent rail)',
      'Optional SFWaveform badge indicating the chapter currently being narrated',
    ],
    variants: [
      { name: 'Notch Rail (notch-rail)', usage: 'Quiet hairline margin notches that expand smoothly on hover/focus.' },
      { name: 'macOS Rail (macos-sidebar)', usage: 'Structured left inspector panel with SF Symbols per chapter and completion checks.' },
      { name: 'Detent Scrubber (tactile-scrubber)', usage: 'Draggable vertical ARIA slider rail with tactile playTick() chapter detents.' },
      { name: 'Local Ribbon (apple-local-nav)', usage: 'Sticky horizontal frosted chapter bar anchored beneath the global navbar.' },
      { name: 'iOS Capsule (ios-capsule)', usage: 'Floating circular-progress pill that opens an iOS chapter popover sheet.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Unvisited chapter', treatment: 'Muted secondary/tertiary ink or collapsed hairline notch.' },
      { state: 'Hover', trigger: 'Pointer hover', treatment: 'Notch rail expands labels; sidebar items wash with --apple-control-hover.' },
      { state: 'Selected', trigger: 'Active chapter', treatment: 'Apple Blue notch/fill or elevated --apple-control-thumb highlight.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab / Arrow Up & Down (Scrubber)', treatment: '2px --apple-blue focus outline; scrubber rail responds to vertical arrow keys.' },
    ],
    behavior:
      'Jumps smoothly to the selected chapter respecting --scroll-offset-header (84px) or --scroll-offset-header-subnav (136px). Promoted variant persists from TOC Lab.',
    animation:
      'Notch bar width 300ms --ease-apple; Local Ribbon active pill uses SPRING_SEGMENT; iOS Capsule sheet uses 220ms scale/opacity reveal.',
    responsiveBehavior:
      'Desktop (>=768px) displays the chosen sidebar/ribbon/capsule variant; mobile (<768px) hands off to MobileReadingBar so prose retains full width.',
    accessibility: [
      'Each architecture renders inside a labeled <nav> with native <button> controls.',
      'Detent Scrubber exposes role="slider", aria-orientation="vertical", aria-valuenow, and aria-valuetext.',
      'iOS Capsule exposes aria-expanded on its trigger button.',
    ],
    tokensUsed: [
      '--apple-blue',
      '--apple-blue-fill',
      '--apple-link',
      '--apple-bg-secondary',
      '--apple-surface-glass',
      '--apple-control-thumb',
      '--apple-separator',
      '--scroll-offset-header-subnav',
    ],
    implementation: {
      sourcePath: 'src/components/TableOfContents.tsx',
      exportName: 'TableOfContents',
      cssClasses: ['.apple-ios-bar', '.apple-pill-shadow'],
      snippet: `<TableOfContents variant="macos-sidebar" chapters={chapters} activeChapter={active} readingProgress={0.45} onSelectChapter={scrollToChapter} />`,
    },
    usageGuidance: [
      'Use macOS Rail or Notch Rail for deep multi-chapter case studies with a sidebar column.',
      'Switch and promote the active production variant via Exploration → TOC Lab.',
    ],
    doDonts: [
      {
        doText: 'Keep chapter labels to 2–3 words so neither sidebars nor ribbons wrap awkwardly.',
        dontText: 'Render both a desktop sidebar TOC and a floating mobile bottom bar simultaneously at the same breakpoint.',
      },
    ],
  },
  {
    id: 'command-palette',
    categoryId: 'navigation',
    name: 'Command Palette (⌘K)',
    shortTitle: 'Command Palette',
    status: 'production',
    purpose:
      'Keyboard-first global launcher searching public Case Studies, Case Study Chapters, Notes, Pages, and Quick Actions while strictly excluding private /design-system routes.',
    anatomy: [
      'Dimmed backdrop + centered .apple-modal dialog (max-w-[600px], rounded-[24px])',
      'Sticky search header with SFMagnifyingGlass, instant query input, and Esc/clear controls',
      'Grouped scrollable results (Case Studies, Notes, Chapters, Pages, Actions)',
      'Footer keyboard hint bar (↑↓ navigate · ↵ select · Esc close)',
    ],
    variants: [
      { name: 'Default Overview', usage: 'Shows grouped public destinations and live preference toggles when query is empty.' },
      { name: 'Filtered Results', usage: 'Instant substring matching across titles, keywords, disciplines, and actions.' },
      { name: 'Empty Search State', usage: 'Calm "No matching results" notice when query has zero hits.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Unfocused result row', treatment: 'Primary title + secondary subtitle with trailing group hint.' },
      { state: 'Hover', trigger: 'Pointer hover', treatment: 'Synchronizes selectedIndex highlight to hovered row.' },
      { state: 'Selected', trigger: 'Keyboard ↑/↓ active row', treatment: 'Subtle --apple-blue/10 highlight with --apple-link chevron.' },
      { state: 'Focus-visible', trigger: 'Auto-focused search input on open', treatment: 'Clean borderless modal search field; Tab trapped inside dialog.' },
    ],
    behavior:
      'Opens via Cmd+K / Ctrl+K or the Navbar search pill; executes navigation, copies email, toggles Appearance/Sound/Reader Comfort, or opens Shortlist/Colophon drawers.',
    animation:
      'Backdrop fade 180ms + modal scale 0.97→1 (220ms --ease-apple); instant under prefers-reduced-motion.',
    responsiveBehavior:
      'Anchors near top of mobile screens with generous padding and 44px touch result rows; locks body scroll while open.',
    accessibility: [
      'Uses role="dialog", aria-modal="true", aria-label="Command palette", and listbox/option semantics.',
      'Captures return focus before opening and restores focus cleanly on close.',
      'Strictly filters out /design-system and internal lab routes from public index.',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--apple-bg-secondary',
      '--apple-separator',
      '--apple-blue',
      '--apple-link',
      '--shadow-apple-modal',
    ],
    implementation: {
      sourcePath: 'src/components/CommandPalette.tsx',
      exportName: 'CommandPalette',
      cssClasses: ['.apple-modal', '.apple-btn-icon'],
      snippet: `<CommandPalette open={open} onClose={close} onNavigate={navigate} onOpenShortlist={openShortlist} onOpenColophon={openColophon} />`,
    },
    usageGuidance: [
      'Keep Command Palette results strictly synced with public routes via buildPublicCommandPaletteItems().',
      'Surface live state in action labels (e.g., "Mute UI Sound Effects" vs. "Unmute UI Sound Effects").',
    ],
    doDonts: [
      {
        doText: 'Provide clear keyboard navigation hints and immediate Escape dismissal.',
        dontText: 'Expose private /design-system or unpublished draft routes inside the public Command Palette.',
      },
    ],
  },
  {
    id: 'popovers-menus',
    categoryId: 'navigation',
    name: 'Preferences & Reader Comfort Popovers',
    shortTitle: 'Popovers & Menus',
    status: 'production',
    purpose:
      'Anchored floating panels consolidating site-wide preferences (Appearance, UI Sound, Reader Comfort) and reading-specific Aa controls without leaving the current scroll position.',
    anatomy: [
      'Trigger button (.apple-btn-icon, pill trigger, or "Aa Reading" badge) with aria-expanded + aria-controls',
      'Anchored .apple-modal surface (264–292px wide, rounded-[20px–22px])',
      'Hairline-divided preference rows combining segmented controls and role="switch" toggles',
    ],
    variants: [
      { name: 'GlobalPreferencesPopover (icon | pill)', usage: 'Navbar icon trigger (bottom-right) and Footer pill trigger (top-right).' },
      { name: 'ReaderComfortPopover (left | right)', usage: 'Discreet "Aa Reading" popover in Case Study and Notes headers.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Closed trigger', treatment: 'Tonal or ghost trigger button.' },
      { state: 'Selected', trigger: 'Open or customized preferences', treatment: 'Active background highlight; ReaderComfortPopover shows soft --apple-blue/10 tint when customized.' },
      { state: 'Focus-visible', trigger: 'Keyboard focus', treatment: '2px --apple-blue outline; Escape closes panel and returns focus to trigger.' },
    ],
    behavior:
      'Both popovers subscribe to shared persisted preference stores (appearance.ts, soundEngine.ts, readerPreferences.ts) so changing a toggle in one immediately updates the other.',
    animation:
      '180ms --ease-apple vertical slide (6px) + scale(0.97→1) fade.',
    responsiveBehavior:
      'Aligned right-0 or left-0 relative to trigger with compact 264–292px width so it stays within 375px mobile viewports.',
    accessibility: [
      'Trigger sets aria-expanded and aria-controls pointing to the role="dialog" panel.',
      'Closes on outside pointer click or Escape key and restores keyboard focus to the trigger button.',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--apple-control-tonal',
      '--apple-separator-subtle',
      '--apple-blue',
      '--apple-link',
      '--shadow-apple-modal',
    ],
    implementation: {
      sourcePath: 'src/components/GlobalPreferencesPopover.tsx',
      exportName: 'GlobalPreferencesPopover / ReaderComfortPopover',
      cssClasses: ['.apple-modal', '.apple-segmented', '.apple-btn-icon'],
      snippet: `<GlobalPreferencesPopover placement="bottom-right" variant="icon" />\n<ReaderComfortPopover align="right" />`,
    },
    usageGuidance: [
      'Keep popover controls synchronized through shared utilities rather than local component state.',
      'Avoid stacking more than 3–4 preference groups inside a single popover.',
    ],
    doDonts: [
      {
        doText: 'Return focus to the trigger button whenever the user dismisses a popover with Escape.',
        dontText: 'Create competing duplicate theme or sound toggles outside the synchronized preference stores.',
      },
    ],
  },
  {
    id: 'floating-back-to-top',
    categoryId: 'navigation',
    name: 'Floating Back-to-Top Control',
    shortTitle: 'Back to Top',
    status: 'production',
    purpose:
      'Context-aware floating frosted pill that reveals after scrolling past 480px and automatically shifts upward whenever the floating AudioPlayer dock or MobileReadingBar is active.',
    anatomy: [
      'Frosted .apple-ios-bar pill (h-11 rounded-full)',
      'SFArrowUp icon (14px) with subtle upward hover nudge',
      'Desktop-only "Top" text label (hidden on mobile to stay compact)',
    ],
    variants: [
      { name: 'Desktop Labeled Pill', usage: 'Displays arrow + "Top" label at bottom-right (right-7 bottom-7).' },
      { name: 'Mobile Compact Circle', usage: '44×44px icon pill shifting upward automatically above MobileReadingBar.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'scrollY > 480', treatment: 'Frosted translucent bar with subtle contact ring and ambient shadow.' },
      { state: 'Hover', trigger: 'Pointer hover', treatment: 'Lifts -2px while arrow icon shifts upward and turns --apple-link.' },
      { state: 'Pressed / Active', trigger: 'Pointer press', treatment: 'Compresses to scale(0.96).' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline.' },
    ],
    behavior:
      'Scrolls smoothly to top (respecting prefers-reduced-motion) and subscribes to floatingDock.ts ref-counted visibility so floating widgets never collide.',
    animation:
      '240ms --ease-apple entrance fade/scale; 300ms smooth bottom offset shift when floating docks mount.',
    responsiveBehavior:
      'Shows icon-only circular pill below 640px and shifts to bottom-[80px] or bottom-[178px] to clear MobileReadingBar and AudioPlayer dock.',
    accessibility: [
      'Provides aria-label="Back to top" and title="Back to top" so icon-only mobile view remains accessible.',
      'Hidden in print stylesheet (print:hidden).',
    ],
    tokensUsed: [
      '--apple-surface-ios-bar',
      '--shadow-apple-ios-bar',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-link',
    ],
    implementation: {
      sourcePath: 'src/components/FloatingBackToTop.tsx',
      exportName: 'FloatingBackToTop',
      cssClasses: ['.apple-ios-bar'],
      snippet: `<FloatingBackToTop threshold={480} />`,
    },
    usageGuidance: [
      'Mount once at the App shell level rather than duplicating per page.',
      'Coordinate all fixed bottom controls through src/utils/floatingDock.ts.',
    ],
    doDonts: [
      {
        doText: 'Respect floatingDock offsets so Back-to-Top never overlaps Toasts or the AudioPlayer dock.',
        dontText: 'Keep Back-to-Top permanently visible at scrollY = 0 above the fold.',
      },
    ],
  },

  /* ========================================================================
     C. CARDS & CONTENT
     ======================================================================== */
  {
    id: 'project-card',
    categoryId: 'cards-content',
    name: 'Project Card',
    shortTitle: 'Project Card',
    status: 'production',
    purpose:
      'Signature Selected Work showcase container presenting project photography, unboxed metadata, editorial title, summary, role attribution, and an independent Recruiter Shortlist bookmark toggle.',
    anatomy: [
      'Outer relative <motion.article> with independent top-right Shortlist bookmark button (prevents nested interactive controls)',
      'Elevated .apple-card <a> surface (rounded-[28px])',
      'Media frame with explicit width/height, lazy/eager loading, graceful fallback, and 1.03 hover zoom',
      'Text column: unboxed Category · Year row, SF Pro Display title, summary, hairline footer with role + "Read case study ›"',
    ],
    variants: [
      { name: 'Featured (variant="featured")', usage: '12-column asymmetric split (7 media / 5 editorial copy) for the lead showcase study.' },
      { name: 'Standard (variant="standard")', usage: 'Vertical 4:3 card used inside the 2-column Selected Work grid.' },
      { name: 'Wide (variant="wide")', usage: 'Reversed 12-column horizontal feature band (copy left / media right).' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting card', treatment: 'Elevated --apple-surface-elevated with multi-layer --shadow-apple-card.' },
      { state: 'Hover', trigger: 'Pointer hover on link card', treatment: 'Lifts -4px with --shadow-apple-card-hover, image scales 1.03, chevron slides +2–4px.' },
      { state: 'Pressed / Active', trigger: 'Pointer down', treatment: 'Settles to translateY(-1px) scale(0.992).' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue outline around card link and independent focus stop on bookmark button.' },
      { state: 'Selected', trigger: 'Shortlist bookmark saved', treatment: 'Bookmark button turns solid --apple-blue-fill with white SFBookmarkFill.' },
    ],
    behavior:
      'Clicking the card navigates to /work/:slug (supporting Cmd/Ctrl+Click); clicking the bookmark button toggles shortlist state without triggering card navigation and fires a non-stacking toast.',
    animation:
      '420ms --ease-apple card elevation lift; 700ms image zoom; 540–560ms viewport reveal on scroll. Hover transforms zeroed under prefers-reduced-motion.',
    responsiveBehavior:
      'Featured and Wide variants stack vertically (16:10 top image) below lg (1024px) and expand to 12-column splits on desktop; bookmark button scales from 44px mobile to 36px desktop.',
    accessibility: [
      'Bookmark <button> sits as a sibling to the <a> card link (never nested inside <a>) for valid HTML and clean keyboard Tab order.',
      'Images declare explicit width/height and descriptive coverAlt.',
      'Fallback block displays title and category cleanly if an image fails to load.',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--shadow-apple-card',
      '--shadow-apple-card-hover',
      '--apple-card-press-scale',
      '--apple-bg-tertiary',
      '--apple-separator-subtle',
      '--apple-link',
      '--apple-blue-fill',
    ],
    implementation: {
      sourcePath: 'src/components/ProjectCard.tsx',
      exportName: 'ProjectCard',
      cssClasses: ['.apple-card', '.apple-pill-shadow', '.type-title-2', '.type-title-3'],
      snippet: `<ProjectCard project={PROJECTS[0]} onNavigate={onNavigate} variant="featured" index={0} />`,
    },
    usageGuidance: [
      'Use featured for the first lead project on Home, standard for 2-column grids, and wide to pace longer indexes.',
      'Never wrap category or year metadata inside pill badges—preserve clean middot typographic separators.',
    ],
    doDonts: [
      {
        doText: 'Keep the bookmark button as an absolute sibling outside the <a> link.',
        dontText: 'Nest a <button> inside an <a> tag, which breaks keyboard activation and HTML semantics.',
      },
      {
        doText: 'Keep card descriptions concise (1–2 sentences) so paired grid cards align cleanly.',
        dontText: 'Overlay heavy gradients or multi-row tag clouds on top of project photography.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'related-project-cards',
    categoryId: 'cards-content',
    name: 'Related Project Cards',
    shortTitle: 'Related Projects',
    status: 'production',
    purpose:
      'End-of-case-study recommendation pair surfacing two contextually matched studies with explicit recommendation rationale (e.g., "Similar domain" or "Shared design system focus").',
    anatomy: [
      'Top hairline divider + section eyebrow and title',
      '2-column responsive grid of compact .apple-card links (rounded-[26px])',
      '16:10 cover thumbnail with subtle 1.03 hover scale',
      'Rationale · Year caption, title, 2-line clamped summary, and "Read case study ›" link',
    ],
    variants: [
      { name: 'Two-Column Recommendation Grid', usage: 'Rendered above Previous/Next navigation at the end of CaseStudyPage.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting card', treatment: 'Elevated --apple-surface-elevated with --shadow-apple-card.' },
      { state: 'Hover', trigger: 'Pointer hover', treatment: 'Card lifts -4px, heading shifts to --apple-link, image zooms 1.03.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline.' },
      { state: 'Pressed / Active', trigger: 'Pointer down', treatment: 'Micro scale(0.992) settle.' },
    ],
    behavior:
      'Navigates directly to the recommended case study; returns null if recommendations array is empty.',
    animation:
      '420ms --ease-apple card lift + 700ms smooth image scale.',
    responsiveBehavior:
      'Single column on mobile (<768px), 2-column grid at md+ with balanced flex-1 card heights.',
    accessibility: [
      'Section labeled via aria-labelledby="related-projects-heading".',
      'Uses native <a href="/work/:slug"> with lazy-loaded images and descriptive alt text.',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--shadow-apple-card',
      '--shadow-apple-card-hover',
      '--apple-separator',
      '--apple-link',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/components/RelatedProjectsSection.tsx',
      exportName: 'RelatedProjectsSection',
      cssClasses: ['.apple-card', '.type-title-3', '.type-callout'],
      snippet: `<RelatedProjectsSection recommendations={related} onNavigate={onNavigate} />`,
    },
    usageGuidance: [
      'Limit recommendations to exactly 2 high-signal projects to prevent decision fatigue.',
      'Always state why a project is recommended in the caption row.',
    ],
    doDonts: [
      {
        doText: 'Clamp summaries to 2 lines (line-clamp-2) so both recommendation cards share even vertical rhythm.',
        dontText: 'Show the currently active case study inside its own related projects section.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'feature-editorial-cards',
    categoryId: 'cards-content',
    name: 'Feature & Editorial Surface Containers',
    shortTitle: 'Editorial Surfaces',
    status: 'production',
    purpose:
      'Four-tier surface container hierarchy (.apple-card, .apple-card-static, .apple-surface-subtle, and flat --apple-bg-secondary bands) powering Capabilities, Philosophy, Collaboration, and Contact info cards.',
    anatomy: [
      'Rounded container (20px–28px radius matching hierarchy)',
      'Optional numeric/eyebrow kicker (.type-caption in --apple-link or tertiary ink)',
      'Headline (.type-headline or .type-title-3)',
      'Constrained body copy (.type-callout measure-prose)',
    ],
    variants: [
      { name: 'Interactive Card (.apple-card)', usage: 'Clickable destinations with hover lift, press scale, disabled & loading states.' },
      { name: 'Static Elevated Sheet (.apple-card-static)', usage: 'Primary non-clickable containers (Contact form sheet, Comparator frame).' },
      { name: 'Subtle Elevated Card (.apple-surface-subtle)', usage: 'Capabilities, Philosophy cards, Contact side cards, and prototype inner panels.' },
      { name: 'Quiet Recessed Panel (bg-[var(--apple-bg-secondary)])', usage: 'Secondary grouping containers without drop shadow.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting container', treatment: 'Calibrated inset top highlight + 0.5px micro-contact ring + ambient shadow.' },
      { state: 'Hover', trigger: 'Interactive .apple-card only', treatment: 'Lifts -4px with expanded --shadow-apple-card-hover.' },
      { state: 'Pressed / Active', trigger: 'Interactive .apple-card only', treatment: 'Settles to translateY(-1px) scale(0.992).' },
      { state: 'Disabled', trigger: '.apple-card[aria-disabled="true"]', treatment: '0.46 opacity, pointer-events disabled, drops to subtle shadow.' },
      { state: 'Loading', trigger: '.apple-card[aria-busy="true"]', treatment: '0.72 opacity, cursor progress, inline spinner.' },
    ],
    behavior:
      'Static containers (.apple-card-static, .apple-surface-subtle) deliberately omit hover lift so visitors never mistake informational cards for clickable links.',
    animation:
      'Interactive cards transition transform & shadow over 420ms --ease-apple; static surfaces remain motionless.',
    responsiveBehavior:
      'Padding tightens gracefully from p-8 on desktop to p-6 on mobile; multi-column grids collapse cleanly to 1 column below sm/md.',
    accessibility: [
      'Never apply .apple-card hover lift to non-interactive <div> panels.',
      'Use semantic headings inside cards in logical document outline order.',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--apple-bg-secondary',
      '--apple-surface-muted-card',
      '--shadow-apple-card',
      '--shadow-apple-card-hover',
      '--shadow-apple-subtle',
    ],
    implementation: {
      sourcePath: 'src/index.css',
      exportName: '.apple-card / .apple-card-static / .apple-surface-subtle',
      cssClasses: ['.apple-card', '.apple-card-static', '.apple-surface-subtle'],
      snippet: `<div className="apple-surface-subtle rounded-[26px] p-7">\n  <p className="type-caption text-[var(--apple-link)]">01</p>\n  <h3 className="type-title-3 mt-3">Clarity over ornament</h3>\n</div>`,
    },
    usageGuidance: [
      'Use .apple-surface-subtle on --apple-bg-secondary canvas bands for crisp quiet contrast.',
      'Prefer hairline dividers over stacking bordered cards inside cards.',
    ],
    doDonts: [
      {
        doText: 'Use .apple-card-static or .apple-surface-subtle for non-clickable info panels.',
        dontText: 'Attach hover-lift shadows to static text cards or nest 3+ shadowed boxes inside one another.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'testimonials-layout',
    categoryId: 'cards-content',
    name: 'Testimonials & Recommendations',
    shortTitle: 'Testimonials',
    status: 'production',
    purpose:
      'Editorial two-column recommendation layout designed for verified collaborator quotes. Strictly returns null on public pages while verified entries = 0 so zero fabricated quotes ever ship.',
    anatomy: [
      'Section header with eyebrow and display title',
      '1-column (760px) or 2-column grid of semantic <figure> cards (rounded-[26px], bordered --apple-bg-secondary)',
      'SF Pro Display medium blockquote (19–20px, measure-lead)',
      'Hairline-separated <figcaption> with author name, role · organization · project context',
    ],
    variants: [
      { name: 'Workshop Layout Specimen (workshopPreview={true})', usage: 'Private Studio preview validating spacing and typography without publishing placeholder quotes.' },
      { name: 'Single / Dual Verified Public Layout', usage: 'Auto-adapts to 1 centered column (1 entry) or 2 balanced columns (2+ verified entries).' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Static editorial layout', treatment: 'Quiet bordered --apple-bg-secondary surface; no hover lift or decorative avatars.' },
    ],
    behavior:
      'Filters entries via getVerifiedTestimonials(). Returns null publicly whenever zero verified entries exist; workshopPreview={true} renders labeled specimen placeholders strictly inside /design-system.',
    animation:
      'Static editorial cadence with no motion distraction during reading.',
    responsiveBehavior:
      '2-column grid at md (768px+), stacking to 1 full-width column on mobile with p-7 padding.',
    accessibility: [
      'Uses semantic <figure>, <blockquote>, and <figcaption> elements.',
      'Unboxed attribution preserves >= 4.5:1 contrast across all four theme matrices.',
    ],
    tokensUsed: [
      '--apple-bg',
      '--apple-bg-secondary',
      '--apple-separator',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/components/TestimonialsSection.tsx',
      exportName: 'TestimonialsSection',
      cssClasses: ['.font-display', '.measure-lead', '.type-headline', '.type-footnote'],
      snippet: `<TestimonialsSection entries={VERIFIED_TESTIMONIALS} workshopPreview />`,
    },
    usageGuidance: [
      'NEVER pass workshopPreview={true} on public portfolio pages.',
      'Add real quotes to src/data/testimonials.ts only with verified: true and explicit permission.',
    ],
    doDonts: [
      {
        doText: 'Let the component return null cleanly when zero verified quotes exist.',
        dontText: 'Publish "Coming soon" empty boxes, stock avatars, or invented collaborator names.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'project-credits',
    categoryId: 'cards-content',
    name: 'Project Credits & Metadata Block',
    shortTitle: 'Project Credits',
    status: 'production',
    purpose:
      'Auto-collapsing editorial definition list displaying genuine Client, Collaborators & Teammates, and Tools & Technologies at the start of a case study.',
    anatomy: [
      'Hairline bottom-bordered <section> wrapping a semantic <dl>',
      'Auto-balanced 1-, 2-, or 3-column grid depending on populated fields',
      'Tertiary uppercase/caption <dt> headings paired with medium primary <dd> values',
      'Middot-separated unboxed tool list',
    ],
    variants: [
      { name: '3-Column Full Credits', usage: 'Client + Collaborators + Tools all populated.' },
      { name: '2-Column Auto-Balanced', usage: 'When only two fields are genuinely present (e.g., Client + Tools).' },
      { name: '1-Column Minimal', usage: 'When only Tools & Technologies are provided.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Static metadata readout', treatment: 'Crisp unboxed typography separated by hairline rules.' },
    ],
    behavior:
      'Hides any empty field automatically and returns null via hasProjectCredits() when no credits data exists.',
    animation:
      'None — static typographic hierarchy.',
    responsiveBehavior:
      'Stacks cleanly to 1 column on mobile (<640px) and expands to 2 or 3 columns at sm+.',
    accessibility: [
      'Uses <section aria-label="Project credits and tools"> with semantic <dl>/<dt>/<dd> markup.',
      'Middot separators are marked aria-hidden="true".',
    ],
    tokensUsed: [
      '--apple-separator',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
      '--type-caption-size',
    ],
    implementation: {
      sourcePath: 'src/components/ProjectCreditsSection.tsx',
      exportName: 'ProjectCreditsSection',
      cssClasses: ['.type-caption'],
      snippet: `<ProjectCreditsSection credits={project.credits} />`,
    },
    usageGuidance: [
      'Populate only verifiable collaborators and tools—never pad empty columns with "N/A" or "Solo".',
      'Always pass project.credits through hasProjectCredits() so missing metadata omits the section completely.',
    ],
    doDonts: [
      {
        doText: 'Render tools as clean middot-separated inline text.',
        dontText: 'Wrap every tool name in individual bordered pill chips.',
      },
    ],
  },
  {
    id: 'case-study-metadata-tags',
    categoryId: 'cards-content',
    name: 'Unboxed Metadata & Tag Treatments',
    shortTitle: 'Metadata & Tags',
    status: 'production',
    purpose:
      'Disciplined zero-pill typographic metadata rows (Category · Year · Reading Time · Discipline) preserving editorial calm across cards, case study headers, and Notes.',
    anatomy: [
      'Inline flex-wrap container with gap-x-2 gap-y-1',
      'Typographic .type-caption or .type-footnote segments with tabular-nums on years/durations',
      'Muted middot (·) separators marked aria-hidden="true"',
      'Optional single --apple-link accent segment for primary category or recommendation reason',
    ],
    variants: [
      { name: 'Card Kicker Row', usage: 'Category · Year above ProjectCard and RelatedProject titles.' },
      { name: 'Article Meta Row', usage: 'Topic · Date · Read Time · Status on Notes and Case Study headers.' },
      { name: 'Unboxed Skill/Tool Inline List', usage: 'Comma or middot-delimited stack attribution without pill wrappers.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Informational metadata', treatment: 'Clean ink hierarchy with zero background fill or pill borders.' },
    ],
    behavior:
      'Communicates taxonomy and temporal context without visually competing with clickable buttons or segmented filters.',
    animation:
      'None — static editorial typography.',
    responsiveBehavior:
      'Wraps naturally across lines via flex-wrap without orphan bullets or overflowing tags.',
    accessibility: [
      'Hide decorative middot separators with aria-hidden="true".',
      'Use --apple-label-secondary or --apple-label-tertiary (both verified >= 4.5:1 AA on canvas and secondary surfaces).',
    ],
    tokensUsed: [
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
      '--apple-link',
      '--type-caption-size',
      '--type-footnote-size',
    ],
    implementation: {
      sourcePath: 'src/components/ProjectCard.tsx',
      exportName: 'Unboxed Metadata Row Pattern',
      cssClasses: ['.type-caption', '.type-footnote', '.tabular-nums'],
      snippet: `<p className="type-caption flex flex-wrap items-center gap-x-2 text-[var(--apple-label-secondary)]">\n  <span>Product Design</span><span aria-hidden="true">·</span><span className="tabular-nums">2025</span>\n</p>`,
    },
    usageGuidance: [
      'Follow the Zero-Pill rule: static metadata is always unboxed text; pill shapes are reserved strictly for interactive controls.',
      'Limit metadata rows to 2–4 concise attributes.',
    ],
    doDonts: [
      {
        doText: 'Separate metadata attributes with typographic middots (·) and subtle ink contrast.',
        dontText: 'Wrap static dates, years, or categories in rounded pill badges that look like clickable filters.',
      },
    ],
  },

  /* ========================================================================
     D. FORMS & INPUTS
     ======================================================================== */
  {
    id: 'form-fields',
    categoryId: 'forms-inputs',
    name: 'Text, Email, Select & Textarea Inputs',
    shortTitle: 'Form Fields',
    status: 'production',
    purpose:
      'Unified .apple-input control system powering text, email, select dropdowns, and multi-line textareas with soft tinted fills, crisp focus rings, and inline validation.',
    anatomy: [
      'Bound <label htmlFor> (.type-footnote, primary ink)',
      '.apple-input field (min-h-[46px], rounded-[14px] or [16px] for textarea)',
      'Optional trailing SFChevronDown for native <select>',
      'Conditional inline error text (role="alert", id linked via aria-describedby, --apple-error ink)',
    ],
    variants: [
      { name: 'Text Input', usage: 'Name or general single-line input (autoComplete="name").' },
      { name: 'Email Input', usage: 'Email address with type="email" and autoComplete="email".' },
      { name: 'Select Dropdown', usage: 'Expected timeline selector with custom SFChevronDown chevron.' },
      { name: 'Textarea', usage: 'Multi-line project brief (rows={5}, 1.55 line-height).' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Empty or filled resting field', treatment: '--apple-bg-secondary fill, 1px transparent border, --apple-label-tertiary placeholder.' },
      { state: 'Hover', trigger: 'Pointer hover (enabled, non-error)', treatment: 'Softens to --apple-bg-tertiary.' },
      { state: 'Focus-visible', trigger: 'Field focus', treatment: 'Lifts to --apple-surface-elevated, 1px --apple-blue border, 4px --apple-focus-ring glow.' },
      { state: 'Error', trigger: 'aria-invalid="true"', treatment: '--apple-error border, elevated fill, 4px --apple-error-ring on focus, and role="alert" message.' },
      { state: 'Disabled', trigger: 'disabled or aria-disabled="true"', treatment: '0.56 opacity on --apple-input-disabled-bg fill, cursor not-allowed.' },
      { state: 'Success', trigger: 'Valid input after error cleared', treatment: 'Error clears immediately on edit; optional verified checkmark hint.' },
    ],
    behavior:
      'Errors clear immediately as soon as the visitor edits the invalid field; submitting invalid inputs focuses the first invalid field programmatically.',
    animation:
      '160ms ease fill/border transition + 180ms focus halo transition.',
    responsiveBehavior:
      'Full-width inside responsive form grids (2-column Name/Email on sm+, 1-column on mobile) with 15.5px–16px font size preventing iOS Safari zoom.',
    accessibility: [
      'Pair every field with an explicit <label htmlFor>—never rely on placeholder text as a label.',
      'Wire aria-required="true", aria-invalid, and aria-describedby pointing to the role="alert" error paragraph.',
      'Ensure disabled input fill (--apple-input-disabled-bg) and error ink (--apple-error) stay calibrated in both Light and Dark.',
    ],
    tokensUsed: [
      '--apple-bg-secondary',
      '--apple-bg-tertiary',
      '--apple-surface-elevated',
      '--apple-input-disabled-bg',
      '--apple-blue',
      '--apple-focus-ring',
      '--apple-error',
      '--apple-error-ring',
      '--apple-success',
    ],
    implementation: {
      sourcePath: 'src/pages/ContactPage.tsx',
      exportName: '.apple-input field system',
      cssClasses: ['.apple-input'],
      snippet: `<input id="contact-email" type="email" aria-invalid={Boolean(error)} aria-describedby={error ? 'email-err' : undefined} className="apple-input min-h-[46px] rounded-[14px] px-4 py-2.5 text-[15.5px]" />`,
    },
    usageGuidance: [
      'Use noValidate on <form> and validate deterministically with validateContactForm() for consistent cross-browser error styling.',
      'Clear field errors on change rather than forcing re-submission to dismiss red borders.',
    ],
    doDonts: [
      {
        doText: 'Keep error messages concise, specific, and placed directly below the affected field.',
        dontText: 'Use placeholder text alone without a visible <label>.',
      },
    ],
  },
  {
    id: 'contact-form-flow',
    categoryId: 'forms-inputs',
    name: 'Validated Inquiry Form & Confirmation',
    shortTitle: 'Form & Confirmation',
    status: 'production',
    purpose:
      'Complete end-to-end inquiry flow combining validateContactForm() error handling, aria-busy loading submission state, and an elevated confirmation sheet with mailto handoff.',
    anatomy: [
      'Elevated .apple-card-static sheet (rounded-[28px])',
      'Validated input grid + engagement selector + timeline select + brief textarea',
      'Submit footer pairing .apple-btn-primary (with .apple-spinner while submitting) and response-time note',
      'Confirmation state: soft blue SFCheckmark badge, focusable confirmation <h2>, summary <dl>, "Open in Mail" + "Send another note"',
    ],
    variants: [
      { name: 'Active Inquiry Form', usage: 'Interactive input state with inline error validation on submit.' },
      { name: 'Submitting / Loading State', usage: 'Disables all fields, sets aria-busy="true", and renders .apple-spinner + "Preparing inquiry…".' },
      { name: 'Success Confirmation Sheet', usage: 'Replaces form cleanly, moves keyboard focus to heading, and offers mailto handoff.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Ready to fill', treatment: 'Clean elevated white/charcoal sheet on secondary canvas.' },
      { state: 'Error', trigger: 'Invalid submit', treatment: 'Highlights invalid inputs, plays playTap(), and jumps focus to first invalid field.' },
      { state: 'Loading', trigger: 'Valid submission (180ms transition)', treatment: 'Fields disabled, button shows .apple-spinner + "Preparing inquiry…".' },
      { state: 'Success', trigger: 'Submission complete', treatment: 'Displays confirmation card, plays playSuccessChime(), fires toast, focuses confirmation heading.' },
    ],
    behavior:
      'Never fakes server delivery—honestly states the note is prepared locally and provides a pre-populated mailto link plus reset button.',
    animation:
      '360ms --ease-apple fade/rise for confirmation card; instant transition under prefers-reduced-motion.',
    responsiveBehavior:
      '7/5 split with direct contact cards on lg desktop; stacks vertically with full-width fields and stacked submit row on mobile.',
    accessibility: [
      'Moves focus to confirmationHeadingRef (tabIndex={-1}) on success so screen readers announce completion immediately.',
      'Moves focus to first invalid input on validation failure.',
      'All error messages use role="alert".',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--shadow-apple-card',
      '--apple-blue',
      '--apple-error',
      '--apple-success',
      '--apple-separator',
    ],
    implementation: {
      sourcePath: 'src/pages/ContactPage.tsx',
      exportName: 'ContactPage + validateContactForm',
      cssClasses: ['.apple-card-static', '.apple-input', '.apple-btn-primary', '.apple-spinner'],
      snippet: `const result = validateContactForm(values);\nif (!result.isValid) setErrors(result.errors);`,
    },
    usageGuidance: [
      'Always validate required inputs deterministically before entering loading or confirmation states.',
      'Keep post-submission actions clear: primary mailto handoff + secondary reset.',
    ],
    doDonts: [
      {
        doText: 'Focus the first invalid field automatically when form validation fails.',
        dontText: 'Silently substitute dummy values to bypass empty required fields.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'engagement-selector-group',
    categoryId: 'forms-inputs',
    name: 'Engagement Selector Pill Group',
    shortTitle: 'Selector Group',
    status: 'production',
    purpose:
      'Wrapping multi-option single-select button group used in ContactPage ("What can I help with?") when option count (5) or label length benefits from wrapping rather than horizontal scrolling.',
    anatomy: [
      'Group label (.type-footnote)',
      'role="group" flex-wrap gap-2 container',
      '.apple-segmented-item buttons (min-h-[44px] mobile / 38px desktop) with aria-pressed',
      'Optional role="alert" validation note below',
    ],
    variants: [
      { name: 'Single-Select Topic Pills', usage: '5 engagement categories in ContactPage with active --apple-blue-fill state.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Unselected option', treatment: '--apple-bg-secondary fill with secondary label ink.' },
      { state: 'Hover', trigger: 'Pointer hover', treatment: 'Fills with --apple-control-tonal and primary ink.' },
      { state: 'Selected', trigger: 'aria-pressed="true"', treatment: 'Solid --apple-blue-fill with crisp white ink.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus ring.' },
      { state: 'Disabled', trigger: 'disabled={isSubmitting}', treatment: '0.46 opacity, pointer-events disabled.' },
    ],
    behavior:
      'Selects one engagement option immediately on click/Enter and triggers playTick().',
    animation:
      '180ms ease color/background transition + scale(0.97) active press.',
    responsiveBehavior:
      'Wraps organically across 2–3 rows on narrow viewports while maintaining 44px mobile touch heights.',
    accessibility: [
      'Uses role="group" with explicit aria-label and aria-pressed on each button.',
      'Maintains >= 4.5:1 contrast in both unselected and selected states.',
    ],
    tokensUsed: [
      '--apple-blue-fill',
      '--apple-bg-secondary',
      '--apple-control-tonal',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-disabled-opacity',
    ],
    implementation: {
      sourcePath: 'src/pages/ContactPage.tsx',
      exportName: 'PROJECT_TYPES engagement group',
      cssClasses: ['.apple-segmented-item'],
      snippet: `<div role="group" aria-label="Project engagement type" className="flex flex-wrap gap-2">...</div>`,
    },
    usageGuidance: [
      'Choose a wrapping pill group over .apple-segmented when presenting 4–6 descriptive labels inside a form.',
      'Bind each pill with aria-pressed and a shared role="group" label so screen readers announce the active selection cleanly.',
    ],
    doDonts: [
      {
        doText: 'Keep pill labels short and scannable (2–3 words).',
        dontText: 'Mix static non-clickable tags into an interactive selector group.',
      },
    ],
  },

  /* ========================================================================
     E. OVERLAYS & DISCLOSURES
     ======================================================================== */
  {
    id: 'slide-over-drawers',
    categoryId: 'overlays-disclosures',
    name: 'Slide-Over Drawers (Shortlist & Colophon)',
    shortTitle: 'Drawers',
    status: 'production',
    purpose:
      'Right-anchored editorial drawers for the Recruiter Shortlist (with shareable URL builder) and Craft Colophon without losing the visitor’s reading scroll position.',
    anatomy: [
      'Full-screen dimmed backdrop (bg-[#1D1D1F]/45 backdrop-blur-[3px])',
      'Elevated .apple-modal sheet sliding from right (max-w-[440px] or [520px])',
      'Sticky header with eyebrow, title, and focusable close button',
      'Scrollable content body + quiet secondary-surface footer actions',
    ],
    variants: [
      { name: 'ShortlistDrawer', usage: 'Saved case study list, empty state, copyable shareable URL, Clear all + Copy link footer.' },
      { name: 'ColophonDrawer', usage: '5-chapter editorial craft specification documenting production tokens and architecture.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Open drawer', treatment: 'Full-height panel with --shadow-apple-modal depth and body scroll lock.' },
      { state: 'Focus-visible', trigger: 'Initial open & Tab cycle', treatment: 'Focus moves to close button and stays trapped inside drawer via useDialogFocusTrap.' },
    ],
    behavior:
      'Closes via Close button, backdrop click, or Escape key, always restoring keyboard focus to the trigger control.',
    animation:
      'Backdrop 200–220ms fade; panel x: 100%→0 slide over 280–300ms --ease-apple; reduced-motion snaps opacity cleanly.',
    responsiveBehavior:
      'ShortlistDrawer adapts to a rounded-t-[26px] bottom-aligned sheet (max-h-[88vh]) on <640px mobile and a 440px right rail on desktop; ColophonDrawer spans full width on mobile up to 520px.',
    accessibility: [
      'Sets role="dialog", aria-modal="true", aria-labelledby, and data-modal-open="true".',
      'Uses useDialogFocusTrap for Tab wrapping, Escape dismissal, and focus restoration.',
      'Locks document.body overflow while open.',
    ],
    tokensUsed: [
      '--apple-bg',
      '--apple-bg-secondary',
      '--apple-surface-elevated',
      '--apple-separator',
      '--apple-control-tonal',
      '--shadow-apple-modal',
    ],
    implementation: {
      sourcePath: 'src/components/ShortlistDrawer.tsx',
      exportName: 'ShortlistDrawer / ColophonDrawer',
      cssClasses: ['.apple-modal', '.apple-btn-icon', '.apple-surface-subtle'],
      snippet: `<ShortlistDrawer open={open} onClose={onClose} onNavigate={onNavigate} />\n<ColophonDrawer open={open} onClose={onClose} />`,
    },
    usageGuidance: [
      'Use slide-over drawers for secondary reference or collection tools (Shortlist, Colophon) that complement the current page.',
      'Keep drawer footers limited to 1 primary action and 1 quiet utility action.',
    ],
    doDonts: [
      {
        doText: 'Trap keyboard focus and restore it to the opening button on dismiss.',
        dontText: 'Allow background page scrolling or Tab focus to escape behind an open drawer.',
      },
    ],
  },
  {
    id: 'lightbox-modal',
    categoryId: 'overlays-disclosures',
    name: 'Full-Screen Lightbox Dialog',
    shortTitle: 'Lightbox Modal',
    status: 'production',
    purpose:
      'High-resolution visual inspection modal for case study photography with 3-step zoom (100% / 175% / 250%), thumbnail filmstrip, touch swipe, and full keyboard control.',
    anatomy: [
      'Darkened backdrop (bg-[#1D1D1F]/80) + .apple-modal container (max-w-[1140px], max-h-[92vh], rounded-[28px])',
      'Header bar with counter (1 of N), Zoom (- / % / +) pill group, and Close button',
      'Scrollable/zoomable media viewport with floating Previous/Next circular buttons',
      'Optional thumbnail filmstrip (when images.length > 1) and caption bar',
    ],
    variants: [
      { name: 'Single-Image Inspection', usage: 'Hides prev/next arrows and filmstrip when only one asset is inspected.' },
      { name: 'Multi-Asset Gallery Filmstrip', usage: 'Enables arrow navigation, touch swipe, and ring-highlighted thumbnail filmstrip.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: '100% zoom', treatment: 'Image fits cleanly within 64vh with cursor-zoom-in.' },
      { state: 'Selected', trigger: 'Active filmstrip thumbnail / Zoom > 1×', treatment: '2px --apple-blue ring on thumbnail; viewport switches to overflow-auto pan mode.' },
      { state: 'Disabled', trigger: 'Zoom at min (100%) or max (250%)', treatment: 'Zoom out/in icon button drops opacity and disables cleanly.' },
      { state: 'Focus-visible', trigger: 'Open & Tab trap', treatment: 'Focus starts on Close button; Tab cycles strictly inside dialog.' },
    ],
    behavior:
      'Supports keyboard Esc, ArrowLeft, ArrowRight, +, -, and 0 (reset zoom), click-to-cycle zoom, and horizontal touch swipe when at 100% zoom.',
    animation:
      'Backdrop 240ms fade + modal 340ms --ease-apple scale(0.96→1) rise.',
    responsiveBehavior:
      'Scales smoothly down to 375px mobile with 44px touch targets for Close and Prev/Next arrows plus horizontally scrollable filmstrip.',
    accessibility: [
      'Uses role="dialog", aria-modal="true", aria-label="Full-screen image viewer", and Tab focus trapping.',
      'Zoom buttons expose clear aria-labels and current zoom percentage.',
      'Restores focus to the triggering figure button on close.',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--apple-bg-secondary',
      '--apple-control-tonal',
      '--apple-separator-subtle',
      '--apple-blue',
      '--shadow-apple-modal',
      '--shadow-apple-pill',
    ],
    implementation: {
      sourcePath: 'src/components/Lightbox.tsx',
      exportName: 'Lightbox',
      cssClasses: ['.apple-modal', '.apple-pill-shadow', '.apple-btn-icon'],
      snippet: `<Lightbox images={gallery} activeIndex={idx} onClose={() => setIdx(null)} onSelectIndex={setIdx} />`,
    },
    usageGuidance: [
      'Always provide descriptive alt text and concise editorial captions explaining what detail to inspect.',
      'Reset zoom automatically to 100% whenever switching images.',
    ],
    doDonts: [
      {
        doText: 'Allow both click-to-zoom and keyboard +/-/0 shortcuts for effortless inspection.',
        dontText: 'Force horizontal swipe navigation while the user is zoomed in and trying to pan an image.',
      },
    ],
  },
  {
    id: 'disclosure-accordion',
    categoryId: 'overlays-disclosures',
    name: 'Zero-Jank Disclosure Accordion',
    shortTitle: 'Accordion',
    status: 'production',
    purpose:
      'Inset-grouped expandable rows used for Selected Experiments & Craft Studies on HomePage, animating smoothly via CSS grid-template-rows without layout jitter.',
    anatomy: [
      'Inset rounded-[28px] --apple-bg-secondary container with hairline dividers',
      'Full-width <button> header with metadata row, title, summary, and circular SFChevronDown indicator',
      'Collapsible region (grid-rows-[0fr] → grid-rows-[1fr]) holding extended technical notes and stack attribution',
    ],
    variants: [
      { name: 'Single-Open Editorial Appendix', usage: 'Expands one study at a time so surrounding reading rhythm stays calm.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Collapsed row', treatment: 'Neutral secondary chevron inside subtle circular badge.' },
      { state: 'Hover', trigger: 'Pointer hover on row button', treatment: 'Row title shifts to --apple-link.' },
      { state: 'Selected', trigger: 'aria-expanded="true"', treatment: 'Chevron rotates 180deg and tints --apple-blue; panel expands smoothly.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline.' },
    ],
    behavior:
      'Toggles expanded disclosure panel on click/Enter/Space with subtle playTick() sound feedback.',
    animation:
      '300ms --ease-apple transition on grid-template-rows, opacity, and chevron rotation (0deg → 180deg).',
    responsiveBehavior:
      'Single-column fluid rows with generous py-6 touch area and 40px circular indicator on mobile.',
    accessibility: [
      'Uses native <button aria-expanded aria-controls> paired with role="region" aria-labelledby and hidden={!isOpen}.',
      'Prevents hidden focusable elements from entering Tab order when collapsed.',
    ],
    tokensUsed: [
      '--apple-bg-secondary',
      '--apple-surface-elevated',
      '--apple-separator-subtle',
      '--apple-blue',
      '--apple-link',
      '--shadow-apple-subtle',
    ],
    implementation: {
      sourcePath: 'src/pages/HomePage.tsx',
      exportName: 'Selected Experiments Disclosure Accordion',
      cssClasses: ['.apple-surface-subtle', 'grid-rows-[1fr]'],
      snippet: `<button type="button" aria-expanded={isOpen} aria-controls={panelId} className="flex w-full items-start justify-between py-6 text-left">...</button>`,
    },
    usageGuidance: [
      'Use for optional supplementary details (craft studies, technical notes) that should not bloat initial page height.',
      'Prefer CSS grid-rows transitions over max-height hacks for crisp timing.',
    ],
    doDonts: [
      {
        doText: 'Keep the collapsed summary informative on its own even if a visitor never expands it.',
        dontText: 'Hide critical navigation or core case study outcomes inside collapsed accordions.',
      },
    ],
  },
  {
    id: 'mobile-bottom-sheet',
    categoryId: 'overlays-disclosures',
    name: 'Mobile Reading Bar & Bottom Sheet',
    shortTitle: 'Bottom Sheet',
    status: 'production',
    purpose:
      'Compact mobile-only (<768px) frosted reading bar on Case Studies that pairs active chapter progress, quick AudioPlayer jump, and an expandable bottom-sheet chapter picker.',
    anatomy: [
      'Fixed bottom frosted .apple-ios-bar pill (h-[52px])',
      'Chapter button with SFListBullet, active chapter title, and live hairline progress bar + percentage',
      'Right-side Listen / Listening button toggling accent fill during active narration',
      'Expandable bottom-aligned .apple-modal sheet (rounded-[24px]) with 44px chapter rows',
    ],
    variants: [
      { name: 'Idle Reading Bar', usage: 'Neutral tonal "Listen" pill + live chapter progress readout.' },
      { name: 'Active Narration Bar', usage: 'Filled --apple-blue-fill "Listening" pill + SFWaveform icon.' },
      { name: 'Expanded Chapter Sheet', usage: 'Bottom-anchored modal listing all chapters with active highlight.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Mobile viewport (<768px)', treatment: 'Translucent floating pill anchored 12px above viewport edge.' },
      { state: 'Selected', trigger: 'Active chapter in sheet / Active narration', treatment: 'Soft --apple-blue/10 row highlight or solid blue Listening CTA.' },
      { state: 'Focus-visible', trigger: 'Sheet open', treatment: 'Focus trapped inside bottom sheet via useDialogFocusTrap; Escape dismisses.' },
    ],
    behavior:
      'Registers itself with floatingDock.ts on <768px viewports so ToastViewport and FloatingBackToTop shift cleanly above it.',
    animation:
      '200–240ms --ease-apple vertical slide (y: 24→0) for bottom sheet; instant under prefers-reduced-motion.',
    responsiveBehavior:
      'Strictly displayed on mobile (<768px via md:hidden) and hidden on desktop where TableOfContents owns chapter navigation.',
    accessibility: [
      'Bottom bar sits inside role="region" aria-label="Mobile reading navigation".',
      'Sheet uses role="dialog", aria-modal="true", and useDialogFocusTrap.',
      'All chapter rows enforce min-h-[44px] touch height.',
    ],
    tokensUsed: [
      '--apple-surface-ios-bar',
      '--shadow-apple-ios-bar',
      '--apple-surface-elevated',
      '--shadow-apple-modal',
      '--apple-blue',
      '--apple-blue-fill',
      '--apple-link',
    ],
    implementation: {
      sourcePath: 'src/components/MobileReadingBar.tsx',
      exportName: 'MobileReadingBar',
      cssClasses: ['.apple-ios-bar', '.apple-modal', '.apple-btn-icon'],
      snippet: `<MobileReadingBar chapters={chapters} activeChapter={active} readingProgress={0.42} isAudioPlaying={false} narratingChapterId={null} onSelectChapter={jump} onJumpToAudioPlayer={jumpAudio} />`,
    },
    usageGuidance: [
      'Reserve bottom sheets for mobile-first chapter or utility pickers where thumb reach matters most.',
      'Always register fixed bottom bars with floatingDock.ts.',
    ],
    doDonts: [
      {
        doText: 'Keep mobile bottom bars under 56px tall with at most 2 primary zones.',
        dontText: 'Display both MobileReadingBar and a desktop TOC sidebar on the same viewport width.',
      },
    ],
  },

  /* ========================================================================
     F. FEEDBACK & STATUS
     ======================================================================== */
  {
    id: 'toast-notification',
    categoryId: 'feedback-status',
    name: 'Non-Stacking Toast Notification',
    shortTitle: 'Toast Viewport',
    status: 'production',
    purpose:
      'Single non-stacking frosted pill confirmation bar confirming brief transient actions (Copied email, Shortlist updated, Reader comfort changed, Token copied) without interrupting flow.',
    anatomy: [
      'Bottom-centered aria-live="polite" viewport',
      'Frosted .apple-ios-bar pill (rounded-full, max-w-[420px])',
      'Tone icon (SFCheckmarkCircleFill for success, subtle Apple Blue dot for info)',
      'Single-line truncated message + compact dismiss SFXmark button',
    ],
    variants: [
      { name: 'Success Toast (tone="success")', usage: 'Clipboard copy, shortlist added, inquiry prepared, decision saved.' },
      { name: 'Informational Toast (tone="info")', usage: 'Appearance change, UI sound muted/unmuted, reading depth switched.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'showToast() invoked', treatment: 'Frosted elevated pill with automatic dismissal timer (default 2400ms).' },
      { state: 'Hover', trigger: 'Pointer hover on dismiss icon', treatment: 'Dismiss button highlights with --apple-control-hover.' },
      { state: 'Focus-visible', trigger: 'Keyboard focus on dismiss button', treatment: '2px --apple-blue focus outline.' },
    ],
    behavior:
      'Intentionally non-stacking: invoking showToast() replaces the active toast smoothly via AnimatePresence mode="wait" so banners never pile up.',
    animation:
      '220ms --ease-apple fade + 10px rise; 300ms smooth bottom offset shift when AudioPlayer dock or MobileReadingBar appears.',
    responsiveBehavior:
      'Centers horizontally with max-w-[min(92vw,420px)] and dynamically climbs above mobile reading bars (bottom-[82px]) or audio docks (bottom-[114px]).',
    accessibility: [
      'Outer region uses aria-live="polite" aria-atomic="true"; toast uses role="status".',
      'Provides explicit dismiss button with aria-label="Dismiss notification".',
      'Never places critical multi-sentence errors inside an auto-dismissing toast.',
    ],
    tokensUsed: [
      '--apple-surface-ios-bar',
      '--shadow-apple-ios-bar',
      '--apple-blue',
      '--apple-label-primary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/components/ToastViewport.tsx',
      exportName: 'ToastViewport + showToast()',
      cssClasses: ['.apple-ios-bar', '.apple-btn-icon'],
      snippet: `showToast({ message: 'Copied email address', tone: 'success' });`,
    },
    usageGuidance: [
      'Keep toast copy concise (2–6 words) confirming an action that already happened.',
      'Use inline role="alert" messages—not toasts—for form validation errors.',
    ],
    doDonts: [
      {
        doText: 'Let new toasts replace previous ones cleanly so the screen stays calm.',
        dontText: 'Stack 3–5 simultaneous toast banners or hide critical error recovery inside a disappearing toast.',
      },
    ],
  },
  {
    id: 'semantic-status-alerts',
    categoryId: 'feedback-status',
    name: 'Semantic Status Indicators & Inline Notices',
    shortTitle: 'Status & Alerts',
    status: 'production',
    purpose:
      'WCAG 2.2 AA calibrated status indicators and inline editorial notices powered by the Stage 2.5 semantic tokens (--apple-success, --apple-warning, --apple-info, --apple-error).',
    anatomy: [
      'Inline status row: subtle 6px indicator or 14px SF Symbol + semibold semantic ink label (zero pill clutter)',
      'Alert banner: bordered tinted surface (10–12% semantic tint) with icon, concise title, and actionable explanation',
      'Inline form error: role="alert" paragraph in --apple-error below invalid field',
    ],
    variants: [
      { name: 'Success (--apple-success)', usage: 'Resolved audits, verified AA contrast, completed checks (#1B7A38 / #32D74B).' },
      { name: 'Warning (--apple-warning)', usage: 'Cautionary notices, unsaved/draft notes, non-blocking caveats (#9A5600 / #FFB340).' },
      { name: 'Informational (--apple-info)', usage: 'System guidance, active preview notices (#0066CC / #409CFF).' },
      { name: 'Error (--apple-error)', usage: 'Form validation errors, sync failure recovery (#C62828 / #FF6961).' },
    ],
    interactionStates: [
      { state: 'Success', trigger: 'Completed/verified condition', treatment: 'Calibrated green ink (>= 4.5:1 AA across all 4 theme matrices).' },
      { state: 'Error', trigger: 'Invalid or failed condition', treatment: 'Calibrated red ink with subtle 25% border accent on alert panels.' },
    ],
    behavior:
      'Communicates state through explicit text and iconography alongside color so color-blind visitors never miss status meaning.',
    animation:
      'Subtle opacity reveal when appearing; no pulsing neon badges.',
    responsiveBehavior:
      'Wraps text naturally inside measure-prose containers on all viewports.',
    accessibility: [
      'Every semantic token is unit-tested in auditThemeContrast() to exceed 4.5:1 WCAG 2.2 AA on Canvas, Secondary, and Elevated surfaces across all 4 matrices.',
      'Error notices use role="alert"; polite status updates use role="status".',
      'Always pair color with text or icon meaning.',
    ],
    tokensUsed: [
      '--apple-success',
      '--apple-warning',
      '--apple-info',
      '--apple-error',
      '--apple-surface-elevated',
      '--apple-separator',
    ],
    implementation: {
      sourcePath: 'src/index.css',
      exportName: '--apple-success / --apple-warning / --apple-info / --apple-error',
      cssClasses: ['.apple-surface-subtle'],
      snippet: `<p role="alert" className="type-footnote text-[var(--apple-error)]">Please enter a valid email address.</p>`,
    },
    usageGuidance: [
      'Prefer quiet unboxed text + icon indicators for inline status instead of loud pill badges.',
      'Reserve bordered alert banners for actionable warnings or errors that require user attention.',
    ],
    doDonts: [
      {
        doText: 'Pair semantic color with an explicit word ("Resolved", "Sync interrupted") and SF Symbol.',
        dontText: 'Use raw Tailwind green-500/amber-500 hex values that fail contrast in Cool/Warm Light or Dark modes.',
      },
    ],
  },
  {
    id: 'loading-skeleton-indicators',
    categoryId: 'feedback-status',
    name: 'Loading Spinner & Skeleton Placeholders',
    shortTitle: 'Loading & Skeletons',
    status: 'production',
    purpose:
      'Restrained loading feedback combining the 15px currentColor .apple-spinner and geometry-matched animate-pulse skeletons used across ContactPage and multi-state CaseStudyPrototypes.',
    anatomy: [
      'Inline .apple-spinner (15px circle, 2px currentColor stroke, transparent right quadrant)',
      'Skeleton layout matching exact loaded card/row proportions using --apple-separator fills',
      'Accompanying status caption explaining what is loading',
    ],
    variants: [
      { name: 'Inline Control Spinner (.apple-spinner)', usage: 'Inside busy buttons and card sync footers.' },
      { name: 'Structural Card/Table Skeleton', usage: 'StallSync, Precognition Labs, and HubApps loading prototype states.' },
    ],
    interactionStates: [
      { state: 'Loading', trigger: 'aria-busy="true"', treatment: '0.72s linear rotation (switches to subtle 1.6s opacity pulse under prefers-reduced-motion).' },
    ],
    behavior:
      'Preserves container dimensions during async transitions so layout shift stays near zero.',
    animation:
      'apple-spin 0.72s linear infinite; automatically degrades to apple-pulse-subtle and disables animate-pulse under prefers-reduced-motion.',
    responsiveBehavior:
      'Skeleton grids mirror exact responsive columns of the loaded UI (e.g., 2 cols mobile / 3 cols desktop).',
    accessibility: [
      'Mark loading containers aria-busy="true" and decorative spinners aria-hidden="true".',
      'Provide visible readable status text ("Syncing reservations…") alongside visual shimmer.',
    ],
    tokensUsed: [
      '--apple-separator',
      '--apple-separator-subtle',
      '--apple-bg-secondary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/index.css',
      exportName: '.apple-spinner / CaseStudyPrototypes loading skeletons',
      cssClasses: ['.apple-spinner', '.apple-surface-subtle'],
      snippet: `<span className="apple-spinner" aria-hidden="true" />\n<span>Preparing inquiry…</span>`,
    },
    usageGuidance: [
      'Match skeleton silhouettes closely to real content geometry.',
      'Avoid spinners on instantaneous (<100ms) local state switches.',
    ],
    doDonts: [
      {
        doText: 'Honor prefers-reduced-motion by replacing fast spins with a calm opacity pulse.',
        dontText: 'Use jarring high-contrast shimmer gradients or full-screen blocking spinners for small inline actions.',
      },
    ],
  },
  {
    id: 'empty-error-states',
    categoryId: 'feedback-status',
    name: 'Empty & Error Recovery States',
    shortTitle: 'Empty & Error States',
    status: 'production',
    purpose:
      'Calm, actionable empty and error panels used across Selected Work search, ShortlistDrawer, and multi-state CaseStudyPrototypes so visitors always have a clear next step.',
    anatomy: [
      'Centered .apple-surface-subtle container (rounded-[22px]) with optional error hairline border',
      'Optional circular 40–44px icon badge (SFBookmark, SFCheckmark, or SFExclamationTriangle)',
      'Clear plain-language heading + 1–2 sentence explanation (max-w-[46ch])',
      'Single primary recovery CTA (.apple-btn-primary with SFReset) + optional tonal secondary action',
    ],
    variants: [
      { name: 'Empty Collection / Zero Results', usage: 'ShortlistDrawer empty state, Selected Work search zero-matches, Prototype empty filter.' },
      { name: 'Error Recovery Panel', usage: 'Prototype sync interruption states with role="alert" and explicit retry button.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Zero matching items', treatment: 'Quiet centered card with clear reset filter guidance.' },
      { state: 'Error', trigger: 'Failed sync / interrupted state', treatment: 'Subtle --apple-error/25 border, error icon tint, and Retry primary action.' },
    ],
    behavior:
      'Recovery buttons genuinely reset filters or reconnect state and play playSuccessChime() on recovery.',
    animation:
      'Instant state swap or gentle opacity fade without dramatic shake animations.',
    responsiveBehavior:
      'Centered single-column card with px-6 py-10–12 breathing room across desktop and mobile.',
    accessibility: [
      'Error recovery containers expose role="alert" so assistive technology announces failures.',
      'Recovery CTAs use explicit action verbs ("Reset floor filters", "Retry module sync") instead of vague "OK".',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--apple-bg-secondary',
      '--apple-error',
      '--apple-blue',
      '--apple-label-primary',
      '--apple-label-secondary',
    ],
    implementation: {
      sourcePath: 'src/components/CaseStudyPrototypes.tsx',
      exportName: 'Prototype Empty & Error States / ShortlistDrawer Empty State',
      cssClasses: ['.apple-surface-subtle', '.apple-btn-primary', '.apple-btn-tonal'],
      snippet: `<div role="alert" className="apple-surface-subtle rounded-[22px] border border-[var(--apple-error)]/25 px-6 py-10 text-center">...</div>`,
    },
    usageGuidance: [
      'State clearly what happened, whether user data is safe, and the exact single click that resolves it.',
      'Reserve role="alert" for actionable error recovery states; keep benign filter-empty states calm without alarm styling.',
    ],
    doDonts: [
      {
        doText: 'Offer a direct one-click recovery button like "Clear search" or "Retry sync".',
        dontText: 'Blame the user, display raw stack traces, or leave dead-end empty boxes with no action.',
      },
    ],
  },

  /* ========================================================================
     G. MEDIA & INTERACTIVE ELEMENTS
     ======================================================================== */
  {
    id: 'audio-player-waveform',
    categoryId: 'media-interactive',
    name: 'AudioPlayer & Visual Waveform',
    shortTitle: 'AudioPlayer & Waveform',
    status: 'production',
    purpose:
      'Web Speech API case-study narrator prioritizing neural Google/Apple voices with natural cadence, synchronized active-chapter highlighting, click-to-seek sculpted waveform, and floating Now Playing dock.',
    anatomy: [
      'Elevated surface card with Play/Pause primary circle, ±15s skip controls, chapter indicator, and timecode',
      'AudioWaveform: sculpted pill bars tinted by elapsed progress and animated via requestAnimationFrame on word boundaries',
      'MiniAudioEqualizer: 4-bar micro-equalizer for active chapter badges and floating dock',
      'Expandable Voice Settings drawer: voice selector, playback speed (0.85×–2×), pitch presets, and volume slider',
    ],
    variants: [
      { name: 'Inline Case Study Player', usage: 'Anchored beneath Case Study hero with full waveform and voice tuning.' },
      { name: 'Floating Now Playing Dock', usage: 'Automatically pins at viewport bottom when scrolling away during playback.' },
      { name: 'Standalone Waveform & Equalizer', usage: 'Reusable AudioWaveform and MiniAudioEqualizer visualizers.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Idle / Paused', treatment: 'Waveform rests gracefully at sculpted 44% baseline profile.' },
      { state: 'Selected', trigger: 'Playing & Speaking', treatment: 'Elapsed bars tint --apple-blue; bars near playhead animate organically with speechPulseTick.' },
      { state: 'Disabled', trigger: 'Muted or unsupported SpeechSynthesis', treatment: 'Waveform attenuates energy smoothly; graceful unsupported notice if API unavailable.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline on transport, seek, and settings buttons.' },
    ],
    behavior:
      'Strictly independent of UI Sound mute; coordinates active section highlighting (.narrating-section-active) and registers floating dock clearance via floatingDock.ts.',
    animation:
      'requestAnimationFrame harmonic modulation synced to SpeechSynthesis onboundary events; settles smoothly on pause and halts animation under prefers-reduced-motion.',
    responsiveBehavior:
      'Reflows cleanly inside 375px mobile containers with 44px transport targets and stacks floating dock cleanly above MobileReadingBar.',
    accessibility: [
      'Waveform is decorative (aria-hidden="true") paired with an accessible native progress/seek control and tabular timecode.',
      'All transport controls expose dynamic aria-labels ("Play narration", "Pause narration", "Skip forward 15 seconds").',
      'Cleans up SpeechSynthesis and requestAnimationFrame loops cleanly on unmount.',
    ],
    tokensUsed: [
      '--apple-blue',
      '--apple-blue-fill',
      '--apple-surface-elevated',
      '--apple-bg-secondary',
      '--apple-separator-strong',
      '--apple-surface-ios-bar',
      '--shadow-apple-ios-bar',
    ],
    implementation: {
      sourcePath: 'src/components/AudioPlayer.tsx',
      exportName: 'AudioPlayer / AudioWaveform / MiniAudioEqualizer',
      cssClasses: ['.apple-surface-subtle', '.apple-ios-bar', '.narrating-section-active'],
      snippet: `<AudioPlayer title="StallSync Case Study" segments={segments} onActiveSectionChange={setNarratingId} />`,
    },
    usageGuidance: [
      'Provide clean prose-only NarrationSegment text free of decorative symbols so voices read naturally.',
      'Never couple AudioPlayer mute state with UI click-sound mute state.',
    ],
    doDonts: [
      {
        doText: 'Animate waveform energy gently around the active playhead and settle calmly on pause.',
        dontText: 'Auto-play narration on page load or keep requestAnimationFrame running after unmount.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'before-after-comparator',
    categoryId: 'media-interactive',
    name: 'Before / After Image Comparator',
    shortTitle: 'Before / After',
    status: 'production',
    purpose:
      'Accessible draggable split-image comparator supporting pointer drag, touch drag, and keyboard arrows with subtle acoustic detents at 0%, 50%, and 100%. Rendered publicly ONLY when genuine before/after assets exist.',
    anatomy: [
      'Semantic <figure> with .apple-card-static 16:9 frame (rounded-[24px])',
      'Base "After" image + CSS clipPath-masked "Before" overlay layer',
      'Frosted .apple-ios-bar corner labels',
      '2px vertical white divider + 40px circular drag handle with opposing chevrons',
      'Optional <figcaption> beneath frame',
    ],
    variants: [
      { name: 'Interactive 50/50 Split Comparator', usage: 'Direct-manipulation visual comparison with customizable initialPosition and labels.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting comparator', treatment: 'Crisp divider at initialPosition (50%) with elevated circular thumb.' },
      { state: 'Pressed / Active', trigger: 'Pointer/touch dragging', treatment: 'Handle scales to 1.1 with 4px --apple-focus-ring halo; cursor-ew-resize.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline; ArrowLeft/Right (±5%), PageUp/Down (±15%), Home/End.' },
    ],
    behavior:
      'Uses Pointer Capture so dragging stays smooth even if the pointer leaves the frame; fires playTick() gently at 0%, 50%, and 100% detents.',
    animation:
      'Instant 1:1 clip-path tracking while dragging; 150ms handle scale feedback.',
    responsiveBehavior:
      'Fluid aspect-[16/9] across desktop, tablet, and mobile with touch-none preventing accidental vertical scroll during horizontal drag.',
    accessibility: [
      'Implements role="slider" with tabIndex={0}, aria-valuemin={0}, aria-valuemax={100}, aria-valuenow, and descriptive aria-valuetext.',
      'Full keyboard control (Arrows, PageUp/Down, Home, End).',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--apple-surface-ios-bar',
      '--apple-bg-secondary',
      '--apple-separator',
      '--apple-focus-ring',
      '--shadow-apple-card',
      '--shadow-apple-pill',
    ],
    implementation: {
      sourcePath: 'src/components/BeforeAfterComparator.tsx',
      exportName: 'BeforeAfterComparator',
      cssClasses: ['.apple-card-static', '.apple-ios-bar', '.apple-pill-shadow'],
      snippet: `<BeforeAfterComparator beforeSrc={before} beforeAlt="Before" afterSrc={after} afterAlt="After" initialPosition={50} />`,
    },
    usageGuidance: [
      'Publish on public Case Studies ONLY when genuine matched before/after design artifacts exist (enforced by unit test P2.7).',
      'Ensure both compared images share identical aspect ratios so the split seam aligns accurately.',
    ],
    doDonts: [
      {
        doText: 'Support full keyboard scrubbing and descriptive aria-valuetext.',
        dontText: 'Fabricate artificial before/after pairs or apply fake CSS filters just to populate a comparator.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'case-study-prototypes',
    categoryId: 'media-interactive',
    name: 'Interactive Case Study Prototypes',
    shortTitle: 'Interactive Prototypes',
    status: 'production',
    purpose:
      'Embedded, self-contained interactive product studies inside CaseStudyPage demonstrating real interaction models (StallSync floor grid, Precognition signal triage, HubApps density table, Music PWA capture, Mudradhaar gestures, MycroHarvest stages).',
    anatomy: [
      'Outer rounded-[28px] --apple-bg-secondary showcase canvas',
      'Header with title + primary role/stage AppleSegmentedControl',
      'Multi-state inspector bar (Happy / Empty / Loading / Error) on operational product studies',
      'Interactive workspace cards (.apple-surface-subtle) with real clickable states and action feedback',
    ],
    variants: [
      { name: 'StallSync Floor Allocation', usage: 'Organizer/Vendor role switch, selectable 6-booth grid, hold/apply actions, 4 UI states.' },
      { name: 'Precognition Labs Triage Ledger', usage: 'Routine/Elevated signal switch, policy citations, Approve/Escalate actions, 4 UI states.' },
      { name: 'HubApps Density Scale', usage: 'Compact/Balanced/Spacious table density switch + 4 UI states.' },
      { name: 'Music PWA / Mudradhaar / MycroHarvest', usage: 'Focused domain interaction state flows.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Happy state', treatment: 'Fully interactive domain UI populated with realistic sample records.' },
      { state: 'Selected', trigger: 'Selected booth / case / density', treatment: '2px --apple-blue ring with soft 8% blue tint.' },
      { state: 'Loading', trigger: 'Loading state tab', treatment: 'Geometry-matched skeletons + inline .apple-spinner.' },
      { state: 'Error', trigger: 'Error state tab', treatment: 'Calm role="alert" failure card with Retry recovery action.' },
    ],
    behavior:
      'All prototype state stays isolated locally per study so visitors can experiment freely without mutating site state.',
    animation:
      'SPRING_SEGMENT on mode switches, 200ms selection ring transitions, and smooth row padding adjustments in HubApps.',
    responsiveBehavior:
      '12-column desktop splits (7/5) stack cleanly into 1 column below lg (1024px); controls wrap cleanly on 375px screens.',
    accessibility: [
      'All interactive units (booths, tabs, actions) are native <button> elements with clear labels.',
      'Loading states expose aria-busy="true"; error states expose role="alert".',
    ],
    tokensUsed: [
      '--apple-bg-secondary',
      '--apple-surface-elevated',
      '--apple-blue',
      '--apple-link',
      '--apple-error',
      '--apple-separator-subtle',
    ],
    implementation: {
      sourcePath: 'src/components/CaseStudyPrototypes.tsx',
      exportName: 'CaseStudyPrototype',
      cssClasses: ['.apple-surface-subtle', '.apple-segmented', '.apple-btn-primary', '.apple-spinner'],
      snippet: `<CaseStudyPrototype kind="stallsync" />`,
    },
    usageGuidance: [
      'Include the Happy / Empty / Loading / Error state inspector only on complex operational systems where edge states matter.',
      'Keep interactive prototypes directly inline inside CaseStudyPage prose so reviewers can test flows without opening external tabs.',
    ],
    doDonts: [
      {
        doText: 'Keep embedded prototypes self-contained and responsive without requiring external iframe embeds.',
        dontText: 'Add fake marketing counters or non-functional placeholder buttons inside a prototype.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'architecture-diagrams',
    categoryId: 'media-interactive',
    name: 'Responsive SVG Architecture Diagrams',
    shortTitle: 'SVG Diagrams',
    status: 'production',
    purpose:
      'Theme-aware vector system diagrams (StallSync allocation cadence, Precognition Labs decision pipeline, HubApps concentric token schematic) paired with interactive stage inspection bars.',
    anatomy: [
      'Rounded-[28px] --apple-bg-secondary wrapper with eyebrow and heading',
      'Elevated .apple-surface-subtle SVG viewport using CSS custom properties directly inside SVG attributes',
      'Interactive segmented stage or density switcher highlighting active diagram nodes',
      'Plain-language explanatory note synced to the selected stage',
    ],
    variants: [
      { name: 'StallSync Spatial Flow', usage: 'Dual-role perspectives feeding shared floor grid and 4-step linear approval cadence.' },
      { name: 'Precognition Labs Pipeline', usage: '4-stage evidence-first triage flow and governance invariant bar.' },
      { name: 'HubApps Token Schematic', usage: 'Interactive Compact/Balanced/Spacious concentric radius & 4px spacing live diagram.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Unselected diagram node', treatment: 'Secondary surface fill with hairline --apple-separator-strong stroke.' },
      { state: 'Selected', trigger: 'Active cadence/stage button', treatment: '12% --apple-blue highlight fill, 1.6px --apple-blue stroke, and synced footnote.' },
    ],
    behavior:
      'Selecting any stage button updates both the SVG highlight and the concise explanation immediately with playTick() feedback.',
    animation:
      'Instant crisp SVG vector updates with zero raster blur at any retina DPI.',
    responsiveBehavior:
      'viewBox-based responsive SVGs scale proportionally across every viewport width while controls stack neatly beneath on mobile.',
    accessibility: [
      'Every <svg> sets role="img" and aria-labelledby pointing to semantic <title> and <desc> elements.',
      'CSS custom properties ensure diagrams automatically re-theme cleanly across Cool/Warm and Light/Dark.',
    ],
    tokensUsed: [
      '--apple-bg',
      '--apple-bg-secondary',
      '--apple-surface-elevated',
      '--apple-blue',
      '--apple-link',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-separator-strong',
    ],
    implementation: {
      sourcePath: 'src/components/CaseStudyDiagrams.tsx',
      exportName: 'CaseStudyDiagram',
      cssClasses: ['.apple-surface-subtle', '.apple-segmented'],
      snippet: `<CaseStudyDiagram kind="hubapps" />`,
    },
    usageGuidance: [
      'Bind SVG fills and strokes to CSS custom properties rather than hardcoded hex so dark mode and sandboxes work automatically.',
      'Pair every multi-step diagram with a concise plain-language footnote synced to the active inspected node.',
    ],
    doDonts: [
      {
        doText: 'Provide <title> and <desc> inside every schematic SVG for screen-reader parity.',
        dontText: 'Export static light-mode PNG flowcharts that invert poorly or blur on Retina displays.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'local-time-clock',
    categoryId: 'media-interactive',
    name: 'Real-Time Local Clock (IST)',
    shortTitle: 'Local Time Clock',
    status: 'production',
    purpose:
      'Live Hyderabad local clock (Asia/Kolkata, IST · UTC+5:30) helping international collaborators gauge timezone overlap on About and Contact pages.',
    anatomy: [
      'SFClock icon tinted --apple-link',
      'Location / date / timezone label (IST · UTC+5:30)',
      '1-second updating time readout formatted with tabular-nums + part-of-day label',
    ],
    variants: [
      { name: 'Inline (variant="inline")', usage: 'Single-line editorial readout in AboutPage hero.' },
      { name: 'Card (variant="card")', usage: 'Quiet inset --apple-bg-secondary card inside ContactPage availability panel.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Live 1s interval', treatment: 'Steady tabular numerals with zero horizontal jitter as seconds increment.' },
    ],
    behavior:
      'Updates once per second via window.setInterval and cleans up cleanly on unmount; formatted deterministically via Intl.DateTimeFormat("Asia/Kolkata").',
    animation:
      'None — calm real-time numeral update without flashing colons.',
    responsiveBehavior:
      'Inline variant wraps cleanly on mobile; card variant uses flex justify-between inside 100% width.',
    accessibility: [
      'Uses tabular-nums so text width remains stable on every tick.',
      'Hidden in print stylesheet where live timestamps are irrelevant.',
    ],
    tokensUsed: [
      '--apple-bg-secondary',
      '--apple-link',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/components/LocalTimeClock.tsx',
      exportName: 'LocalTimeClock',
      cssClasses: ['.tabular-nums', '.type-footnote'],
      snippet: `<LocalTimeClock variant="card" />`,
    },
    usageGuidance: [
      'Use inline in editorial intros and card inside structured availability sidebars.',
      'Pair the live clock with explicit IST · UTC+5:30 timezone context so international clients know exact overlap hours.',
    ],
    doDonts: [
      {
        doText: 'Apply tabular-nums on ticking clocks to eliminate horizontal layout jitter.',
        dontText: 'Forget to clear setInterval on component unmount.',
      },
    ],
  },
  {
    id: 'reading-depth-switcher',
    categoryId: 'media-interactive',
    name: 'Reading Depth Header & Gallery Figure',
    shortTitle: 'Reading Depth & Gallery',
    status: 'production',
    purpose:
      'Case Study reading utility bar combining 2-Min Skim / Full Story toggle, Recruiter Shortlist bookmark button, and ReaderComfortPopover alongside zoomable gallery figure triggers.',
    anatomy: [
      'Header utility cluster: compact .apple-segmented (2-Min Skim | Full Story), Shortlist toggle pill, and ReaderComfortPopover',
      'Gallery figure: rounded-[24px] clickable image button with subtle zoom affordance and editorial <figcaption>',
    ],
    variants: [
      { name: '2-Min Skim Mode', usage: 'Condenses case study into executive highlights and key takeaways.' },
      { name: 'Full Story Mode', usage: 'Displays complete multi-chapter narrative, prototypes, and architecture diagrams.' },
      { name: 'Zoomable Gallery Figure', usage: 'Opens full-screen Lightbox at the clicked asset index.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting figure / controls', treatment: 'Clean surface framing with crisp caption beneath.' },
      { state: 'Hover', trigger: 'Pointer hover on gallery image', treatment: 'Subtle 1.015 zoom and inspect cue.' },
      { state: 'Selected', trigger: 'Active depth / Shortlisted state', treatment: 'Elevated segmented thumb or solid blue Shortlisted toggle.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus outline.' },
    ],
    behavior:
      'Switches narrative depth immediately with toast confirmation; clicking any gallery figure opens the real Lightbox at that image.',
    animation:
      'SPRING_SEGMENT thumb transition; smooth image scale on figure hover.',
    responsiveBehavior:
      'Utility controls wrap gracefully below Breadcrumbs on mobile while maintaining 40–44px touch targets.',
    accessibility: [
      'Gallery image triggers are native <button> elements with explicit "Inspect [image] full screen" aria-labels.',
      'Shortlist toggle exposes aria-pressed.',
    ],
    tokensUsed: [
      '--apple-control-tonal',
      '--apple-control-thumb',
      '--apple-blue-fill',
      '--apple-surface-elevated',
      '--apple-bg-secondary',
    ],
    implementation: {
      sourcePath: 'src/pages/CaseStudyPage.tsx',
      exportName: 'Reading Depth Bar & Lightbox Gallery Figure',
      cssClasses: ['.apple-segmented', '.apple-surface-subtle', '.apple-card-static'],
      snippet: `{/* 2-Min Skim / Full Story + Shortlist + ReaderComfortPopover */}`,
    },
    usageGuidance: [
      'Pair 2-Min Skim and Full Story cleanly with AudioPlayer so narration length automatically adapts to active reading depth.',
      'Keep Shortlist bookmarking and Reader Comfort accessible in the same header row without adding extra floating chrome.',
    ],
    doDonts: [
      {
        doText: 'Wrap clickable gallery images in a semantic <button> rather than adding onClick to <img>.',
        dontText: 'Open Lightbox without passing an explicit caption and alt description.',
      },
    ],
  },

  /* ========================================================================
     H. EDITORIAL & DATA COMPONENTS
     ======================================================================== */
  {
    id: 'section-headers-dividers',
    categoryId: 'editorial-data',
    name: 'Section Headers & Hairline Dividers',
    shortTitle: 'Headers & Dividers',
    status: 'production',
    purpose:
      'Consistent editorial hierarchy pairing eyebrow kickers, balanced display headings, constrained lead copy, and 1px hairline separator tiers across every portfolio and Studio page.',
    anatomy: [
      'Eyebrow (.type-eyebrow or 11.5px uppercase Studio kicker)',
      'Display heading (.type-title-1 / .type-title-2 with .measure-title)',
      'Optional lead/callout description (.type-lead .measure-lead or .type-callout .measure-prose)',
      '1px hairline rule (--apple-separator, --apple-separator-subtle, or --apple-separator-strong)',
    ],
    variants: [
      { name: 'Editorial Left-Aligned Header', usage: 'Standard section opener on Work, About, Contact, Case Studies, and Studio.' },
      { name: 'Centered Hero Header', usage: 'HomePage opening statement with centered measure-display headline.' },
      { name: 'Three Hairline Divider Tiers', usage: 'Subtle (6–7.5% inside cards), Default (8–11% between sections), Strong (14–18% interactive borders).' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Static editorial typography', treatment: 'Balanced line wrapping (text-wrap: balance) and strict optical measures.' },
    ],
    behavior:
      'Establishes scannable section cadence without relying on heavy colored background banners or excessive card borders.',
    animation:
      'Optional gentle 440–540ms --ease-apple entrance on top-of-page hero headings only.',
    responsiveBehavior:
      'Fluid clamp() typography scales headings seamlessly from 375px mobile up to 1440px desktop without abrupt jumps.',
    accessibility: [
      'Follow strict heading outline order (one <h1> per page, <h2> per major section, <h3> per subsection).',
      'Bind sections with aria-labelledby pointing to their heading id.',
    ],
    tokensUsed: [
      '--font-sf-display',
      '--font-sf-text',
      '--type-title1-size',
      '--type-title2-size',
      '--type-lead-size',
      '--measure-title',
      '--measure-lead',
      '--apple-separator',
      '--apple-separator-subtle',
      '--apple-separator-strong',
    ],
    implementation: {
      sourcePath: 'src/index.css',
      exportName: '.type-eyebrow / .type-title-2 / .type-lead / hairline rules',
      cssClasses: ['.type-eyebrow', '.type-title-1', '.type-title-2', '.type-lead', '.measure-title', '.measure-lead'],
      snippet: `<p className="type-eyebrow text-[var(--apple-link)]">Selected Work</p>\n<h2 className="type-title-2 measure-title mt-2.5">Recent product studies.</h2>`,
    },
    usageGuidance: [
      'Separate major sections using background alternation (--apple-bg vs --apple-bg-secondary) or a single 1px --apple-separator rule.',
      'Apply .measure-title and .measure-prose so headings and paragraphs never stretch to awkward 100ch lines.',
    ],
    doDonts: [
      {
        doText: 'Use hairline dividers and generous vertical whitespace to structure long documents.',
        dontText: 'Wrap every heading block inside a shaded box or skip heading levels (h1 → h4).',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'structured-tables-lists',
    categoryId: 'editorial-data',
    name: 'Structured Tables & Editorial Lists',
    shortTitle: 'Tables & Lists',
    status: 'production',
    purpose:
      'Hairline-divided specification tables and editorial definition/bullet lists used for Interaction State Matrices, Token Readouts, HubApps density rows, and Colophon entries.',
    anatomy: [
      'Overflow-safe rounded container (.apple-surface-subtle or hairline-bordered block)',
      'Subtle caption header row (.type-caption, --apple-label-tertiary)',
      'Hairline-divided body rows (divide-y divide-[var(--apple-separator-subtle)]) with right-aligned tabular-nums values',
      'Editorial lists using clean em-dash (—) or 6px muted dot markers without heavy bullets',
    ],
    variants: [
      { name: 'Compact / Balanced / Spacious Data Table', usage: 'Adjustable row padding (py-2.5 / py-3.5 / py-5) for dense specs vs. executive summaries.' },
      { name: 'Editorial Definition & Bullet List', usage: 'Key-value <dl> rows and measure-prose reading lists.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting row', treatment: 'Clean 1px hairline separation on elevated or canvas surface.' },
      { state: 'Hover', trigger: 'Optional interactive table row', treatment: 'Subtle --apple-bg-secondary row wash for horizontal scan aid.' },
    ],
    behavior:
      'Keeps numeric columns aligned vertically using tabular-nums and wraps tables in overflow-x-auto so mobile layouts never clip.',
    animation:
      '200ms padding transition when switching table density presets.',
    responsiveBehavior:
      'Tables wrap in overflow-x-auto with sensible min-w; definition lists stack vertically on narrow screens.',
    accessibility: [
      'Use semantic <table>, <thead>, <th scope="col">, and <tbody> for tabular comparisons.',
      'Hide decorative list dashes/dots with aria-hidden="true".',
    ],
    tokensUsed: [
      '--apple-surface-elevated',
      '--apple-bg-secondary',
      '--apple-separator',
      '--apple-separator-subtle',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/components/workshop/ComponentsSection.tsx',
      exportName: 'Specification Table & HubApps Workspace Rows',
      cssClasses: ['.apple-surface-subtle', '.type-caption', '.tabular-nums'],
      snippet: `<div className="apple-surface-subtle overflow-x-auto rounded-[22px]">\n  <table className="w-full text-left">...</table>\n</div>`,
    },
    usageGuidance: [
      'Right-align numeric columns and apply tabular-nums for effortless vertical scanning.',
      'Avoid vertical cell borders—horizontal hairlines alone provide crisp Apple-grade scannability.',
    ],
    doDonts: [
      {
        doText: 'Use horizontal hairline dividers with generous row padding.',
        dontText: 'Add zebra-striped heavy backgrounds and boxed vertical grid lines around every table cell.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'practice-timeline',
    categoryId: 'editorial-data',
    name: 'Practice & Chronology Timeline',
    shortTitle: 'Timeline',
    status: 'production',
    purpose:
      'Year-grouped editorial chronology on AboutPage derived strictly from factual published portfolio records without fabricated employers or decorative timeline dots.',
    anatomy: [
      'Hairline top-bordered year group anchor (.type-title-3 tabular-nums in --apple-link)',
      'Ordered <ol> with hairline row dividers (divide-y divide-[var(--apple-separator-subtle)])',
      'Linked project title + SFChevronRight, role · category subtitle, short summary, and right-aligned duration',
    ],
    variants: [
      { name: 'Year-Grouped Chronology', usage: 'AboutPage Practice Timeline (reverse chronological from PROJECTS).' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Resting timeline item', treatment: 'Primary title ink with secondary role and tertiary duration.' },
      { state: 'Hover', trigger: 'Pointer hover on linked study', treatment: 'Title and chevron shift to --apple-link with +2px chevron slide.' },
      { state: 'Focus-visible', trigger: 'Keyboard Tab', treatment: '2px --apple-blue focus ring.' },
    ],
    behavior:
      'Links directly to each case study; renders cleanly in print resume output (chevrons hidden via print:hidden).',
    animation:
      '200ms chevron nudge and color transition on hover.',
    responsiveBehavior:
      'Stacks title/summary above timeline duration on mobile (<640px) and aligns duration cleanly to the right baseline on sm+.',
    accessibility: [
      'Uses semantic <ol><li> chronological structure inside a labeled <section>.',
      'Tabular numerals keep year and timeline markers crisply aligned.',
    ],
    tokensUsed: [
      '--apple-separator',
      '--apple-separator-subtle',
      '--apple-link',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
    ],
    implementation: {
      sourcePath: 'src/pages/AboutPage.tsx',
      exportName: 'Practice Timeline Section',
      cssClasses: ['.apple-link', '.type-title-3', '.type-footnote', '.tabular-nums'],
      snippet: `<ol className="divide-y divide-[var(--apple-separator-subtle)]">...</ol>`,
    },
    usageGuidance: [
      'Derive timeline rows strictly from verified project data.',
      'Prefer hairline typographic grouping over decorative vertical stepper tracks with icon bubbles.',
    ],
    doDonts: [
      {
        doText: 'Keep year anchors prominent in --apple-link with tabular-nums.',
        dontText: 'Invent unverified work history or clutter timeline rows with colored status pills.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'verified-metrics-callouts',
    categoryId: 'editorial-data',
    name: 'Verified Scope & Metrics Strip',
    shortTitle: 'Metrics Strip',
    status: 'production',
    purpose:
      'Quiet hairline-anchored <dl> summary strip presenting factual project metadata (Role, Timeline, Platform, Scope) or Studio system stats (WCAG checks, live routes) with tabular alignment.',
    anatomy: [
      'Responsive 2- to 4-column <dl> bounded by 1px --apple-separator hairline',
      'Compact uppercase/caption <dt> label in --apple-label-tertiary',
      'Bold/medium primary <dd> readout using tabular-nums',
      'Optional quiet supporting caption beneath',
    ],
    variants: [
      { name: 'Case Study Meta Strip', usage: '4-column Role / Timeline / Platform / Deliverables strip below case study title.' },
      { name: 'Studio Telemetry Strip', usage: '4-column active sandbox, WCAG AA count, active TOC, and Decision Log summary.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Static informational readout', treatment: 'Crisp unboxed typographic alignment directly on canvas.' },
    ],
    behavior:
      'Updates reactively when underlying verified counts change (e.g., Decision Log records or active sandbox palette).',
    animation:
      'None — calm editorial authority.',
    responsiveBehavior:
      '2×2 grid on mobile (<640px) expanding to a single 4-column horizontal row at sm+.',
    accessibility: [
      'Uses semantic <dl>/<dt>/<dd> markup so screen readers announce label-value pairs together.',
      'Tabular numerals align figures cleanly across columns.',
    ],
    tokensUsed: [
      '--apple-separator',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
      '--type-caption-size',
    ],
    implementation: {
      sourcePath: 'src/components/workshop/StudioOverviewSection.tsx',
      exportName: 'Editorial Telemetry & Case Study Meta Strip (<dl>)',
      cssClasses: ['.tabular-nums', '.type-caption'],
      snippet: `<dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-[var(--apple-separator)] py-6 sm:grid-cols-4">...</dl>`,
    },
    usageGuidance: [
      'Display only genuine, verifiable scope attributes or live computed metrics—never invented vanity percentages.',
      'Keep strips unboxed on canvas rather than wrapping each stat in a separate shadowed KPI card.',
    ],
    doDonts: [
      {
        doText: 'Use concise 1–3 word labels and direct factual values.',
        dontText: 'Fabricate "+40% conversion" vanity numbers or add glowing gradient KPI boxes.',
      },
    ],
    supportsViewportPreview: true,
  },
  {
    id: 'pull-quote-callout',
    categoryId: 'editorial-data',
    name: 'Editorial Callout & Pull Quote',
    shortTitle: 'Callout & Quote',
    status: 'production',
    purpose:
      'Long-form narrative emphasis treatments used in Case Studies and Design Journal notes to highlight architectural invariants, design principles, and verified quotes.',
    anatomy: [
      'Pull Quote: 2px --apple-blue left accent bar + SF Pro Display medium quote (19–22px, measure-lead) + attribution caption',
      'Inset Editorial Callout: quiet --apple-bg-secondary rounded-[22px] container with eyebrow kicker + constrained .type-body .measure-prose narrative',
    ],
    variants: [
      { name: 'Left-Rule Pull Quote', usage: 'Highlights a pivotal product insight or design principle inside long-form prose.' },
      { name: 'Quiet Inset Callout', usage: '2-Min Skim executive takeaway or architectural invariant block.' },
    ],
    interactionStates: [
      { state: 'Default', trigger: 'Static editorial emphasis', treatment: 'Calm typographic hierarchy respecting Reader Comfort text scale (17px default / 19px large).' },
    ],
    behavior:
      'Responds seamlessly to Reader Comfort Larger Text mode (html[data-reader-size="large"]) and prints cleanly with hairline framing.',
    animation:
      'None — prioritizes effortless reading concentration.',
    responsiveBehavior:
      'Maintains <= 50–60ch line measure across desktop and scales padding smoothly on 375px mobile.',
    accessibility: [
      'Use semantic <blockquote> and <figcaption> for quotes; <aside> with clear heading for editorial callouts.',
      'Maintains >= 7:1 primary ink contrast on both canvas and secondary surfaces.',
    ],
    tokensUsed: [
      '--font-sf-display',
      '--apple-blue',
      '--apple-bg-secondary',
      '--apple-label-primary',
      '--apple-label-secondary',
      '--apple-label-tertiary',
      '--measure-lead',
      '--measure-prose',
    ],
    implementation: {
      sourcePath: 'src/pages/CaseStudyPage.tsx',
      exportName: 'Editorial Callout & Pull Quote Treatment',
      cssClasses: ['.font-display', '.measure-lead', '.measure-prose', '.type-body'],
      snippet: `<blockquote className="border-l-2 border-[var(--apple-blue)] pl-5 font-display measure-lead text-[20px] font-medium text-[var(--apple-label-primary)]">...</blockquote>`,
    },
    usageGuidance: [
      'Use at most one pull quote or callout per major chapter so emphasis retains impact.',
      'Keep pull quotes to 1–2 crisp sentences.',
    ],
    doDonts: [
      {
        doText: 'Keep callouts quiet using --apple-bg-secondary or a thin 2px --apple-blue accent bar.',
        dontText: 'Use loud colored gradients or oversized decorative quotation mark watermarks.',
      },
    ],
  },
] as const;

export const EXCLUDED_COMPONENTS: readonly ExcludedComponentEntry[] = [
  {
    name: 'Pagination',
    category: 'Navigation',
    reason:
      'The portfolio intentionally curates 6 deep case studies and a focused set of design notes filtered live by discipline and keyword search. Splitting 6 items across numbered pages would add friction without value.',
    portfolioAlternative:
      'Live category Segmented Control + instant keyword Search Field on HomePage and NotesPage.',
  },
  {
    name: 'Video Containers & Media Players',
    category: 'Media & Interactive',
    reason:
      'No <video> assets or streaming embeds exist in the portfolio. Visual storytelling relies on crisp high-resolution imagery, interactive live DOM prototypes, and responsive SVG schematics.',
    portfolioAlternative:
      'Zoomable Lightbox Gallery, Interactive CaseStudyPrototypes, and AudioPlayer narration.',
  },
  {
    name: 'Custom Hover-Only Tooltips',
    category: 'Overlays & Disclosures',
    reason:
      'Hover-only floating tooltips fail on touch devices and introduce visual noise over calm editorial layouts.',
    portfolioAlternative:
      'Explicit visible labels, native title shortcut hints (⌘K, +, -), and anchored click-triggered Popovers.',
  },
  {
    name: 'Analytics Charts & KPI Sparklines',
    category: 'Editorial & Data',
    reason:
      'The portfolio avoids fabricated dashboard telemetry or vanity growth charts in favor of verifiable system explanations.',
    portfolioAlternative:
      'Bespoke interactive SVG Architecture Diagrams (CaseStudyDiagrams.tsx) and factual <dl> scope strips.',
  },
  {
    name: 'Multi-Step Wizards / Steppers',
    category: 'Forms & Inputs',
    reason:
      'The inquiry flow is intentionally a single calm sheet with clear inline validation rather than a gated multi-step wizard.',
    portfolioAlternative:
      'Single-sheet validated ContactPage form with loading state and accessible confirmation view.',
  },
] as const;

export function getCategoryMeta(
  categoryId: ComponentCategoryId,
): ComponentCategoryMeta {
  return (
    COMPONENT_CATEGORIES.find((cat) => cat.id === categoryId) ??
    COMPONENT_CATEGORIES[0]
  );
}

export function getComponentCountsByCategory(
  items: readonly ComponentLibraryItem[] = COMPONENT_LIBRARY_ITEMS,
): Record<ComponentCategoryId, number> {
  const counts: Record<ComponentCategoryId, number> = {
    'actions-controls': 0,
    navigation: 0,
    'cards-content': 0,
    'forms-inputs': 0,
    'overlays-disclosures': 0,
    'feedback-status': 0,
    'media-interactive': 0,
    'editorial-data': 0,
  };
  for (const item of items) {
    counts[item.categoryId] += 1;
  }
  return counts;
}

export function filterComponentLibraryItems(
  items: readonly ComponentLibraryItem[],
  options: {
    categoryId?: ComponentCategoryId | 'all';
    status?: ComponentMaturityStatus | 'all';
    query?: string;
  },
): ComponentLibraryItem[] {
  const normalizedQuery = (options.query ?? '').trim().toLowerCase();

  return items.filter((item) => {
    if (
      options.categoryId &&
      options.categoryId !== 'all' &&
      item.categoryId !== options.categoryId
    ) {
      return false;
    }
    if (
      options.status &&
      options.status !== 'all' &&
      item.status !== options.status
    ) {
      return false;
    }
    if (!normalizedQuery) return true;

    const haystack = [
      item.name,
      item.shortTitle,
      item.purpose,
      item.implementation.sourcePath,
      item.implementation.exportName,
      ...item.implementation.cssClasses,
      ...item.tokensUsed,
      ...item.variants.map((v) => `${v.name} ${v.usage}`),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
