/**
 * Portfolio Studio — Workstream A Reference Catalogs
 *
 * Strictly grounded in live production tokens (src/index.css), motion physics
 * (src/utils/motion.ts), Web Audio engine (src/utils/soundEngine.ts), and the
 * unified Lucide icon system (lucide-react + src/components/icons/AnimatedLucide.tsx).
 */

import type { ResolvedTheme } from './appearance';
import type {
  EffectTrackConfig,
  EffectTrackDefinition,
  VisualPaletteId,
} from './workshopStore';

/* ==========================================================================
   1. INTERACTION STATES (10-STATE REFERENCE)
   ========================================================================== */

export type FullInteractionStateId =
  | 'default'
  | 'hover'
  | 'focus-visible'
  | 'pressed'
  | 'active'
  | 'selected'
  | 'disabled'
  | 'loading'
  | 'error'
  | 'success';

export interface InteractionStateReference {
  id: FullInteractionStateId;
  name: string;
  trigger: string;
  visualTreatment: string;
  tokens: readonly string[];
  accessibilityRule: string;
  appliesTo: string;
}

export const INTERACTION_STATES_REFERENCE: readonly InteractionStateReference[] = [
  {
    id: 'default',
    name: 'Default',
    trigger: 'Resting interactive element prior to pointer or keyboard engagement.',
    visualTreatment:
      'Calibrated semantic fill (--editorial-btn-bg, --apple-control-tonal, or --apple-bg-secondary) with hairline separation and AA text contrast.',
    tokens: ['--editorial-btn-bg', '--apple-control-tonal', '--apple-bg-secondary', '--apple-label-primary'],
    accessibilityRule: 'Maintain ≥ 4.5:1 normal text contrast and ≥ 3:1 UI boundary contrast in Warm/Cool Light & Dark.',
    appliesTo: 'Buttons, links, inputs, segmented controls, cards, switches',
  },
  {
    id: 'hover',
    name: 'Hover',
    trigger: 'Fine-pointer cursor enters interactive hit area (@media (hover: hover)).',
    visualTreatment:
      'Stepped luminance darkening (--editorial-btn-hover, --apple-control-tonal-hover, --apple-control-hover), subtle card lift (-3px) and expanded penumbra.',
    tokens: ['--editorial-btn-hover', '--apple-control-tonal-hover', '--apple-control-hover', '--shadow-apple-card-hover'],
    accessibilityRule: 'Never rely on hover alone to reveal essential content or navigation affordances on touch screens.',
    appliesTo: 'All pointer-interactive elements on desktop/trackpad devices',
  },
  {
    id: 'focus-visible',
    name: 'Focus-visible',
    trigger: 'Keyboard Tab, Shift+Tab, or Arrow-key navigation (:focus-visible).',
    visualTreatment:
      '2px solid --apple-blue outline with 3px offset on controls; 1px --apple-blue border + 4px --apple-focus-ring halo on form inputs.',
    tokens: ['--apple-blue', '--apple-focus-ring'],
    accessibilityRule: 'Never remove focus outlines without a visible ≥ 3:1 contrast replacement; preserve logical DOM tab order.',
    appliesTo: 'Every focusable button, link, input, slider, dialog control, and custom ARIA widget',
  },
  {
    id: 'pressed',
    name: 'Pressed',
    trigger: 'Pointer down or active Space/Enter key press (:active).',
    visualTreatment:
      'Micro tactile detent scale(0.97) (--apple-press-scale) on buttons, scale(0.992) on cards, and deepest tonal/ink fill (--editorial-btn-active).',
    tokens: ['--apple-press-scale', '--apple-card-press-scale', '--editorial-btn-active', '--apple-control-tonal-active'],
    accessibilityRule: 'Scale transforms are automatically neutralized under prefers-reduced-motion while color feedback remains intact.',
    appliesTo: 'Buttons, icon buttons, interactive cards, segmented items',
  },
  {
    id: 'active',
    name: 'Active',
    trigger: 'Currently matched route, open popover/drawer trigger, or ongoing playback session.',
    visualTreatment:
      'Semibold --apple-label-primary with 1.5px bottom spring underline in Navbar, elevated tonal fill in Studio sidebar, or animated waveform cue.',
    tokens: ['--apple-label-primary', '--apple-control-tonal', '--apple-blue'],
    accessibilityRule: 'Expose aria-current="page" on active route links and aria-expanded="true" on open disclosure triggers.',
    appliesTo: 'Navbar links, Studio sidebar rows, popover triggers, active AudioPlayer deck',
  },
  {
    id: 'selected',
    name: 'Selected',
    trigger: 'Mutually exclusive choice in segmented controls, switches, or filter tabs.',
    visualTreatment:
      'Elevated --apple-control-thumb pill with --shadow-apple-pill or Apple Blue switch track.',
    tokens: ['--apple-control-thumb', '--shadow-apple-pill', '--apple-blue', '--apple-blue-fill'],
    accessibilityRule: 'Communicate selection programmatically via aria-pressed, aria-selected, or aria-checked—never via color alone.',
    appliesTo: 'Segmented controls, toggles, Command Palette options, TOC chapters',
  },
  {
    id: 'disabled',
    name: 'Disabled',
    trigger: 'Native disabled attribute or aria-disabled="true" when action is unavailable.',
    visualTreatment:
      'Opacity reduced to 0.46 (--apple-disabled-opacity), elevation shadow cleared, flat --apple-input-disabled-bg on inputs, pointer-events blocked.',
    tokens: ['--apple-disabled-opacity', '--apple-input-disabled-bg'],
    accessibilityRule: 'Provide clear context near disabled submit/zoom controls explaining why an action is unavailable.',
    appliesTo: 'Buttons, range sliders, Lightbox zoom bounds, form fields',
  },
  {
    id: 'loading',
    name: 'Loading',
    trigger: 'Asynchronous transition or submission (aria-busy="true" / data-loading="true").',
    visualTreatment:
      'Inline 14px .apple-spinner precedes descriptive verb copy ("Preparing inquiry…", "Loading view…") at 0.80–0.84 opacity with progress cursor.',
    tokens: ['--apple-label-secondary', '--apple-blue-fill'],
    accessibilityRule: 'Pair aria-busy="true" with polite status announcements (role="status" / aria-live="polite") and prevent duplicate submits.',
    appliesTo: 'Primary/tonal buttons, Suspense route fallback, Contact form submission',
  },
  {
    id: 'error',
    name: 'Error',
    trigger: 'Failed client validation (aria-invalid="true") or rejected JSON import payload.',
    visualTreatment:
      'Calibrated --apple-error (#b92b27 light / #ff6961 dark) border, 4px --apple-error-ring halo on focus, and plain-language inline message.',
    tokens: ['--apple-error', '--apple-error-ring'],
    accessibilityRule: 'Bind input to inline error text via aria-describedby and announce validation alerts with role="alert".',
    appliesTo: 'Contact form fields, Decision Log & Experiments JSON import drawers',
  },
  {
    id: 'success',
    name: 'Success',
    trigger: 'Completed user action (email copied, form validated, WCAG check passed, snapshot saved).',
    visualTreatment:
      'AA-calibrated --apple-success (#1b7a38 light / #32d74b dark) paired with Lucide Check glyph and explicit confirmation label or non-stacking toast.',
    tokens: ['--apple-success', '--apple-blue'],
    accessibilityRule: 'Always pair success color with an icon and human-readable text; announce via polite aria-live toast viewport.',
    appliesTo: 'Copy triggers, ToastViewport notifications, Contact confirmation sheet, Audit checks',
  },
] as const;

/* ==========================================================================
   2. INTERACTION BEHAVIOUR PATTERNS (9 PATTERNS)
   ========================================================================== */

export interface InteractionPatternSpec {
  id: string;
  name: string;
  maturity: 'production' | 'experimental';
  sourceFiles: readonly string[];
  trigger: string;
  initialState: string;
  resultingState: string;
  feedback: string;
  keyboard: string;
  touch: string;
  accessibility: string;
}

export const INTERACTION_PATTERNS_CATALOG: readonly InteractionPatternSpec[] = [
  {
    id: 'buttons-controls',
    name: 'Buttons & Controls',
    maturity: 'production',
    sourceFiles: ['src/index.css', 'src/components/Navbar.tsx', 'src/pages/ContactPage.tsx'],
    trigger: 'Click, tap, or Space/Enter activation on native <button> or <a>.',
    initialState: 'Resting pill (.apple-btn-primary / outline / tonal) or circular icon control with single-line label.',
    resultingState: 'Immediate route transition, clipboard copy, preference mutation, or aria-busy loading state.',
    feedback: 'Scale(0.97) press detent, stepped hover/active luminance, and playTick() / playSuccessChime() on meaningful commits.',
    keyboard: 'Tab to focus (:focus-visible 2px blue ring); Enter or Space activates buttons; Enter activates links.',
    touch: 'Minimum 44×44px tap target on mobile (<640px) with active press compression and zero hover-stickiness.',
    accessibility: 'Strict <button> vs <a> semantics, descriptive aria-label on icon-only controls, and aria-busy during async transitions.',
  },
  {
    id: 'navigation',
    name: 'Navigation & Route Transitions',
    maturity: 'production',
    sourceFiles: ['src/App.tsx', 'src/components/Navbar.tsx', 'src/pages/DesignWorkshopPage.tsx'],
    trigger: 'Click on primary nav link, breadcrumb ancestor, Studio sidebar item, or browser Back/Forward.',
    initialState: 'Current route active with aria-current="page" and spring underline (Navbar) or tonal row highlight (Studio).',
    resultingState: 'History pushState updates URL, active indicator glides, main view cross-fades (240ms), and viewport resets cleanly to top or hash.',
    feedback: 'Quiet visual transition with zero sound on ordinary public navigation; polite screen-reader announcement of new document title.',
    keyboard: 'Skip-to-main-content link first in tab order; Cmd/Ctrl+Click preserved for new-tab opening; Escape closes mobile drawer.',
    touch: 'Mobile navbar collapses Zone 2 into 46px drawer rows; Studio mobile drawer slides smoothly from left with backdrop tap-to-close.',
    accessibility: 'Landmark <nav aria-label>, aria-current="page", route announcer live region, and scroll-margin-top clearing 52px sticky bar.',
  },
  {
    id: 'dropdowns-popovers',
    name: 'Dropdowns & Popovers',
    maturity: 'production',
    sourceFiles: ['src/components/GlobalPreferencesPopover.tsx', 'src/components/ReaderComfortPopover.tsx', 'src/components/TableOfContents.tsx'],
    trigger: 'Click on Preferences trigger, Reader Comfort trigger, or iOS Capsule TOC button.',
    initialState: 'Trigger button with aria-expanded="false" and closed floating surface.',
    resultingState: 'Anchored elevated popover opens above or below trigger without shifting page layout; toggles apply immediately.',
    feedback: '180–220ms EASE_APPLE opacity/scale reveal, playTick() on preference switches, and toast confirmation for global settings.',
    keyboard: 'Enter/Space toggles popover; Tab moves through inner controls; Escape closes and returns focus to the trigger button.',
    touch: 'Outside pointerdown dismisses cleanly; controls inside popovers maintain ≥ 36–44px vertical touch clearance.',
    accessibility: 'Exposes aria-expanded, aria-haspopup, descriptive region/dialog label, and reliable focus restoration on dismissal.',
  },
  {
    id: 'dialogs-drawers',
    name: 'Dialogs & Drawers',
    maturity: 'production',
    sourceFiles: ['src/components/CommandPalette.tsx', 'src/components/ColophonDrawer.tsx'],
    trigger: 'Cmd+K / Ctrl+K shortcut, Colophon link, or Studio mobile drawer button.',
    initialState: 'Unmounted overlay; background document scrolls normally.',
    resultingState: 'Dimmed backdrop blurs background, body scroll locks, dialog/drawer enters with initial focus on search input or close control.',
    feedback: '200–260ms EASE_APPLE modal scale or drawer slide; playTick() / playTap() on open and command execution.',
    keyboard: 'Tab/Shift+Tab trapped inside dialog (useFocusTrap / dialog handler); ArrowUp/ArrowDown navigate Command Palette; Escape dismisses.',
    touch: 'Backdrop tap dismisses; full-height drawers allow smooth inner vertical scroll without leaking scroll to background body.',
    accessibility: 'role="dialog", aria-modal="true", aria-label, focus capture before open, and guaranteed focus restoration on close.',
  },
  {
    id: 'accordions',
    name: 'Accordions & Disclosures',
    maturity: 'production',
    sourceFiles: ['src/components/workshop/MotionIconsSoundSection.tsx', 'src/pages/CaseStudyPage.tsx'],
    trigger: 'Click or Enter/Space on disclosure header button.',
    initialState: 'Collapsed panel (grid-rows-[0fr], opacity-0) with aria-expanded="false" and resting chevron.',
    resultingState: 'Smoothly expands to grid-rows-[1fr] / opacity-100 without animating raw pixel height or causing layout thrash.',
    feedback: '300ms EASE_APPLE grid-row reveal, 180° chevron rotation, and crisp playTick() detent.',
    keyboard: 'Native <button> supports Tab focus and Enter/Space toggle without interfering with inner links when open.',
    touch: 'Full-width header row acts as ≥ 44px hit target.',
    accessibility: 'Pairs aria-expanded with aria-controls pointing to panel ID; hidden content stays inaccessible when collapsed.',
  },
  {
    id: 'tabs-segmented',
    name: 'Tabs & Segmented Controls',
    maturity: 'production',
    sourceFiles: ['src/pages/HomePage.tsx', 'src/pages/CaseStudyPage.tsx', 'src/components/workshop/ComponentLibraryView.tsx'],
    trigger: 'Click or keyboard activation of a segment inside .apple-segmented or role="tablist".',
    initialState: 'One active segment highlighted by elevated .apple-pill-shadow thumb; sibling segments use secondary ink.',
    resultingState: 'Spring layout thumb glides to the chosen segment; bound view or filter list updates immediately in place.',
    feedback: 'SPRING_SEGMENT (stiffness 420, damping 36) shared-element glide + playTick() acoustic detent.',
    keyboard: 'Tab focuses controls; Enter/Space selects; tabular counts prevent button width jitter during state changes.',
    touch: 'Horizontal overflow-x-auto scroll escape hatch prevents wrapping on 375px screens.',
    accessibility: 'Wrapped in role="group" with aria-label and aria-pressed (or role="tablist" / role="tab" / aria-selected) and unique layoutId.',
  },
  {
    id: 'form-validation',
    name: 'Form Validation & Submission',
    maturity: 'production',
    sourceFiles: ['src/pages/ContactPage.tsx', 'src/utils/portfolio.ts', 'src/components/workshop/DecisionLogSection.tsx'],
    trigger: 'Form submit click or JSON import validation trigger.',
    initialState: 'Clean inputs on --apple-bg-secondary without premature red error states before user interaction.',
    resultingState: 'Invalid fields highlight with --apple-error + inline message and focus moves to first error; valid submit enters aria-busy loading then confirmation state.',
    feedback: 'playTap() on validation rejection, .apple-spinner during submission, playSuccessChime() + toast on completion.',
    keyboard: 'Full keyboard form completion, Enter submits form, Shift+Tab navigates backwards cleanly, errors clear immediately as user corrects field.',
    touch: '46px tall inputs with semantic types (type="email", type="search") trigger optimal mobile soft keyboards.',
    accessibility: 'Explicit <label htmlFor>, aria-invalid="true", aria-describedby linked to error text, and role="alert" on validation summaries.',
  },
  {
    id: 'image-galleries',
    name: 'Image Galleries & Lightbox',
    maturity: 'production',
    sourceFiles: ['src/components/Lightbox.tsx', 'src/components/BeforeAfterComparator.tsx', 'src/pages/CaseStudyPage.tsx'],
    trigger: 'Click on a case study visual plate, or pointer/keyboard drag on Before/After comparator.',
    initialState: 'Inline responsive visual plate with aspect-ratio lock and subtle hover zoom affordance.',
    resultingState: 'Full-screen Lightbox opens at 100% zoom with Next/Previous plate controls and zoom (100%–225%), or comparator reveals clipped layer.',
    feedback: '220ms modal scale reveal, playTap() on Lightbox open, playTick() at 0% / 50% / 100% comparator detents.',
    keyboard: 'Lightbox: ArrowLeft/ArrowRight cycle plates, +/− zoom, Escape closes; Comparator: ArrowLeft/Right (±5%), PageUp/Down (±15%), Home/End.',
    touch: 'Touch-none pointer capture on comparator handle; 44px Lightbox transport buttons on mobile.',
    accessibility: 'Descriptive alt text, Lightbox role="dialog" + focus trap, Comparator role="slider" with aria-valuenow and aria-valuetext.',
  },
  {
    id: 'scroll-interactions',
    name: 'Scroll-Triggered Interactions',
    maturity: 'production',
    sourceFiles: ['src/components/Navbar.tsx', 'src/components/FloatingBackToTop.tsx', 'src/components/TableOfContents.tsx', 'src/components/MobileReadingBar.tsx'],
    trigger: 'Passive window scroll listener and IntersectionObserver / scroll-progress calculation.',
    initialState: 'Resting top navbar with hairline border; Back-to-Top hidden; chapter 01 highlighted.',
    resultingState: 'Navbar adds calibrated --shadow-apple-nav at scrollY > 10; TOC updates active chapter and progress ring; Back-to-Top reveals cleanly avoiding AudioPlayer dock.',
    feedback: 'Compositor-only opacity/transform reveals coordinated via floatingDock ref-counting so floating controls never collide.',
    keyboard: 'All scroll-revealed actions (Back-to-Top, TOC chapters, MobileReadingBar sheet) remain keyboard reachable without trapping scroll.',
    touch: 'Passive scroll listeners protect 60fps mobile momentum; sticky mobile bars stay under the 15% viewport height cap.',
    accessibility: 'Scroll-triggered reveals never hide critical content behind scroll locks and collapse cleanly under prefers-reduced-motion.',
  },
] as const;

/* ==========================================================================
   3. MOTION SYSTEM — 4 LAYERS, VOCABULARY & PLAYGROUND SPECIMENS
   ========================================================================== */

export interface MotionLayerSpec {
  id: 'micro' | 'component' | 'page' | 'ambient';
  order: string;
  name: string;
  budget: string;
  curve: string;
  properties: string;
  status: 'production' | 'experimental';
  summary: string;
  realExamples: readonly string[];
  reducedMotionBehavior: string;
}

export const MOTION_LAYERS: readonly MotionLayerSpec[] = [
  {
    id: 'micro',
    order: '01',
    name: 'Micro-interactions',
    budget: '150ms – 220ms',
    curve: 'ease / EASE_APPLE / SPRING_TACTILE',
    properties: 'transform (scale, translateY), opacity, background-color, border-color',
    status: 'production',
    summary:
      'Immediate tactile confirmation on buttons, links, icon triggers, toggle switches, and card presses so controls feel crisp and physical.',
    realExamples: [
      'Button press detent: scale(0.97) via --apple-press-scale (220ms --ease-apple)',
      'Card press detent: scale(0.992) and hover translateY(-4px)',
      'iOS Toggle Switch thumb glide (200ms translate-x)',
      'Chevron hover nudge (+2px translateX) on ProjectCard and RelatedProjectsSection',
    ],
    reducedMotionBehavior: 'Suppresses scale and translate movement while retaining immediate color and border state feedback.',
  },
  {
    id: 'component',
    order: '02',
    name: 'Component Transitions',
    budget: '200ms – 320ms',
    curve: 'SPRING_SEGMENT / EASE_APPLE / EASE_OUT_EXPO',
    properties: 'transform, opacity, grid-template-rows',
    status: 'production',
    summary:
      'Coordinated spatial transitions for segmented control thumbs, popovers, slide-over drawers, Command Palette, Lightbox, and disclosures.',
    realExamples: [
      'Segmented control sliding thumb & Navbar underline (SPRING_SEGMENT: stiffness 420, damping 36)',
      'Command Palette & Lightbox entry (200–240ms, scale 0.97→1, EASE_APPLE)',
      'Studio mobile drawer slide (260ms, x: -100%→0, EASE_APPLE)',
      'Zero-jank accordion disclosures (300ms grid-template-rows + opacity)',
    ],
    reducedMotionBehavior: 'Replaces slide/scale choreography with a 10ms opacity fade so state transitions remain instant and calm.',
  },
  {
    id: 'page',
    order: '03',
    name: 'Page Transitions',
    budget: '240ms',
    curve: 'EASE_APPLE ([0.22, 1, 0.36, 1])',
    properties: 'opacity, translateY (6px enter / -4px exit)',
    status: 'production',
    summary:
      'Subtle route cross-fade managed by AnimatePresence mode="wait" in src/App.tsx so outgoing pages clear before scroll-to-top executes.',
    realExamples: [
      'App.tsx route wrapper: initial { opacity: 0, y: 6 } → animate { opacity: 1, y: 0 } → exit { opacity: 0, y: -4 }',
      'DesignWorkshopPage stays persistently mounted across Studio sub-routes so the 264px sidebar never flickers',
    ],
    reducedMotionBehavior: 'Duration drops to 0.01s with opacity-only swap and zero vertical offset.',
  },
  {
    id: 'ambient',
    order: '04',
    name: 'Ambient Motion',
    budget: 'Continuous / Scroll-linked (Restrained)',
    curve: 'SPRING_GENTLE / Audio-driven waveform',
    properties: 'transform (scaleY / translate3d), opacity',
    status: 'experimental',
    summary:
      'Strictly restrained ambient feedback. Production uses live narration waveform bars and scroll-synced reading progress only; subtle parallax remains experimental inside the Materials & Effects Lab.',
    realExamples: [
      'Production: AudioWaveform live playback bars while narrating (static sculpted profile when paused)',
      'Production: FloatingBackToTop & TOC reading-progress ring tracking scroll position',
      'Experimental (Studio Only): Track 05 Subtle Parallax (0–24px) — NOT active on public pages',
    ],
    reducedMotionBehavior: 'All parallax displacement locks to 0px; decorative loops pause and progress updates without spring oscillation.',
  },
] as const;

export interface MotionVocabularyRow {
  category: 'Duration' | 'Easing Curve' | 'Spring Physics' | 'Stagger Delay' | 'Movement Distance';
  token: string;
  value: string;
  source: string;
  usage: string;
}

export const MOTION_VOCABULARY: readonly MotionVocabularyRow[] = [
  {
    category: 'Duration',
    token: 'Micro feedback',
    value: '150ms – 200ms',
    source: 'src/index.css',
    usage: 'Hover color shifts, focus rings, icon washes, toggle switch slides.',
  },
  {
    category: 'Duration',
    token: 'Route & Modal',
    value: '220ms – 280ms',
    source: 'src/App.tsx, CommandPalette.tsx',
    usage: 'Route cross-fade (240ms), Command Palette (240ms), Mobile drawers (260–280ms).',
  },
  {
    category: 'Duration',
    token: 'Editorial Reveal',
    value: '300ms – 440ms',
    source: 'src/utils/motion.ts',
    usage: 'Grid-row disclosures (300ms), TRANSITION_SMOOTH section choreography (440ms).',
  },
  {
    category: 'Easing Curve',
    token: 'EASE_APPLE / --ease-apple',
    value: 'cubic-bezier(0.22, 1, 0.36, 1)',
    source: 'src/utils/motion.ts & src/index.css',
    usage: 'Primary Apple deceleration curve for routes, modals, cards, and disclosures.',
  },
  {
    category: 'Easing Curve',
    token: 'EASE_OUT_EXPO',
    value: 'cubic-bezier(0.16, 1, 0.3, 1)',
    source: 'src/utils/motion.ts',
    usage: 'High-initial-velocity curve for snappy micro-settles and floating sheets.',
  },
  {
    category: 'Spring Physics',
    token: 'SPRING_SEGMENT',
    value: 'stiffness: 420, damping: 36, mass: 0.72',
    source: 'src/utils/motion.ts',
    usage: 'Critically damped segmented thumb and Navbar active underline (zero bounce).',
  },
  {
    category: 'Spring Physics',
    token: 'SPRING_TACTILE',
    value: 'stiffness: 480, damping: 34, mass: 0.68',
    source: 'src/utils/motion.ts',
    usage: 'Direct manipulation detents and crisp press recovery.',
  },
  {
    category: 'Spring Physics',
    token: 'SPRING_GENTLE',
    value: 'stiffness: 280, damping: 30, mass: 0.85',
    source: 'src/utils/motion.ts',
    usage: 'Larger showcase panels and smooth progress transitions.',
  },
  {
    category: 'Stagger Delay',
    token: 'Card Grid Stagger',
    value: '40ms – 60ms per sibling (capped ≤ 240ms)',
    source: 'src/components/ProjectCard.tsx',
    usage: 'Subtle entrance rhythm across visible card rows without delaying above-the-fold legibility.',
  },
  {
    category: 'Movement Distance',
    token: 'Editorial Displacement',
    value: '4px – 12px (route 6px, card hover -4px)',
    source: 'src/App.tsx & src/index.css',
    usage: 'Short, restrained offsets that orient attention without theatrical swooping.',
  },
] as const;

export type MotionSpecimenId =
  | 'button-press'
  | 'popover-drawer'
  | 'accordion-disclosure'
  | 'toast-notification'
  | 'section-reveal';

export type PlaygroundEasingId =
  | 'ease-apple'
  | 'ease-out-expo'
  | 'spring-segment'
  | 'spring-tactile'
  | 'spring-gentle'
  | 'linear';

export interface MotionPlaygroundSpecimenSpec {
  id: MotionSpecimenId;
  label: string;
  layer: 'Micro-interactions' | 'Component transitions' | 'Page transitions';
  description: string;
  baseline: {
    durationMs: number;
    easingId: PlaygroundEasingId;
    delayMs: number;
    distancePx: number;
  };
}

export const MOTION_PLAYGROUND_SPECIMENS: readonly MotionPlaygroundSpecimenSpec[] = [
  {
    id: 'button-press',
    label: 'Button Press & Hover',
    layer: 'Micro-interactions',
    description: 'Calibrate tactile press compression and hover lift without sluggishness.',
    baseline: { durationMs: 200, easingId: 'ease-apple', delayMs: 0, distancePx: 4 },
  },
  {
    id: 'popover-drawer',
    label: 'Popover / Sheet Entry',
    layer: 'Component transitions',
    description: 'Evaluate crisp anchored entrance for preferences, Command Palette, and drawers.',
    baseline: { durationMs: 240, easingId: 'ease-apple', delayMs: 0, distancePx: 10 },
  },
  {
    id: 'accordion-disclosure',
    label: 'Accordion Disclosure',
    layer: 'Component transitions',
    description: 'Inspect calm vertical reveal and chevron rotation without layout jitter.',
    baseline: { durationMs: 300, easingId: 'ease-apple', delayMs: 0, distancePx: 8 },
  },
  {
    id: 'toast-notification',
    label: 'Toast Notification',
    layer: 'Component transitions',
    description: 'Compare non-stacking toast glide-in and settling clarity at the viewport edge.',
    baseline: { durationMs: 220, easingId: 'ease-out-expo', delayMs: 0, distancePx: 12 },
  },
  {
    id: 'section-reveal',
    label: 'Route / Section Reveal',
    layer: 'Page transitions',
    description: 'Verify short-distance editorial entrance choreography and stagger cadence.',
    baseline: { durationMs: 240, easingId: 'ease-apple', delayMs: 40, distancePx: 8 },
  },
] as const;

/* ==========================================================================
   4. MATERIALS & EFFECTS — PRODUCTION VS. EXPERIMENTAL MATRIX + CSS GENERATOR
   ========================================================================== */

export interface MaterialSystemSpec {
  id: string;
  name: string;
  status: 'production' | 'experimental';
  category: string;
  tokensOrCss: string;
  lightBehavior: string;
  darkBehavior: string;
  whereUsed: string;
  guidance: string;
}

export const MATERIAL_SYSTEM_MATRIX: readonly MaterialSystemSpec[] = [
  {
    id: 'frosted-nav-glass',
    name: 'Frosted Navigation Glass',
    status: 'production',
    category: 'Frosted Glass & Blur',
    tokensOrCss: '.editorial-nav-surface (opaque --apple-bg baseline + @supports backdrop-filter + reduced-transparency solid fallback)',
    lightBehavior: 'Solid #FAF8F6 baseline progressively enhanced to rgba(250, 248, 246, 0.84) Warm / rgba(250, 250, 252, 0.84) Cool.',
    darkBehavior: 'Solid #11100E baseline progressively enhanced to rgba(17, 16, 14, 0.84) Warm / rgba(11, 11, 13, 0.84) Cool.',
    whereUsed: 'Sticky 52px Navbar and mobile Studio bar.',
    guidance: 'Always define an opaque background fallback before @supports (backdrop-filter) and restore solid surfaces under prefers-reduced-transparency: reduce.',
  },
  {
    id: 'floating-ios-bar',
    name: 'Floating Bar Translucency',
    status: 'production',
    category: 'Translucency',
    tokensOrCss: '.apple-ios-bar (opaque --apple-surface-elevated baseline + @supports blur(20px) saturate(160%))',
    lightBehavior: 'Opaque #FFFFFF baseline enhanced to 92% translucent white with subtle top highlight and ambient lift.',
    darkBehavior: 'Opaque #1D1B18 baseline enhanced to 92% elevated warm obsidian with crisp rim and grounding shadow.',
    whereUsed: 'Floating AudioPlayer Now Playing dock, iOS Capsule TOC, BeforeAfter badges.',
    guidance: 'Reserve backdrop blur strictly for compact floating surfaces with solid fallbacks—never apply across full-page scrollable grids.',
  },
  {
    id: 'layered-surface-planes',
    name: 'Layered Neutral Surfaces',
    status: 'production',
    category: 'Layered Surfaces',
    tokensOrCss: '--apple-bg → --apple-bg-secondary → --apple-bg-tertiary → --apple-surface-elevated',
    lightBehavior: 'Warm Gallery Paper (#FAF8F6) stepped against #F3EFEA bands and crisp #FFFFFF elevated cards.',
    darkBehavior: 'Warm Obsidian (#11100E) stepped up to #181614 bands and #1D1B18 elevated cards.',
    whereUsed: 'Alternating editorial bands, forms, cards, and Studio sidebar.',
    guidance: 'Rely on surface luminance stepping and architectural hairlines before adding borders or shadows.',
  },
  {
    id: 'calibrated-shadows',
    name: 'Physical Specular & Penumbra Shadows',
    status: 'production',
    category: 'Shadows & Elevation',
    tokensOrCss: '--shadow-apple-subtle, --shadow-apple-pill, --shadow-apple-card, --shadow-apple-modal',
    lightBehavior: 'Micro 0.5px perimeter contact ring + diffuse multi-stop ambient penumbra.',
    darkBehavior: 'Subtle top specular inset (7%–12% white) + high-opacity black grounding shadows.',
    whereUsed: 'ProjectCard, modals, drawers, segmented thumbs, and scrolled Navbar.',
    guidance: 'Maintain maximum single-level card elevation per screen; never stack elevated cards inside elevated cards.',
  },
  {
    id: 'alpha-hairlines',
    name: 'Alpha Hairline Borders & Edge Highlights',
    status: 'production',
    category: 'Borders & Edge Highlights',
    tokensOrCss: '--apple-separator-subtle, --apple-separator, --apple-separator-strong',
    lightBehavior: '6% / 8% / 14% translucent black (Cool) or warm umber (Warm) adapting cleanly to any band.',
    darkBehavior: '7.5% / 11% / 18% translucent white/cream preserving crisp geometry on dark planes.',
    whereUsed: 'Section dividers, table hairlines, sidebar rule, and input boundaries.',
    guidance: 'Prefer alpha separators over opaque hex grays so borders stay consistent across primary and secondary bands.',
  },
  {
    id: 'modal-backdrop-scrim',
    name: 'Modal Backdrop Overlay & Scrim',
    status: 'production',
    category: 'Overlays & Scrims',
    tokensOrCss: 'bg-[#1D1D1F]/55 backdrop-blur-[4px] (CommandPalette, Lightbox, Drawers)',
    lightBehavior: '55% charcoal veil with gentle 4px blur keeping modal contrast unmistakably dominant.',
    darkBehavior: 'Deepened backdrop separation paired with --shadow-apple-modal.',
    whereUsed: 'Command Palette, Image Lightbox, and Colophon drawer.',
    guidance: 'Always lock body scroll while active and dismiss cleanly on backdrop click or Escape.',
  },
  {
    id: 'image-plate-framing',
    name: 'Editorial Image Plate Treatment',
    status: 'production',
    category: 'Image Treatments',
    tokensOrCss: 'aspect-[16/10] / aspect-[16/9], rounded-[20px–28px], group-hover:scale-[1.03] (700ms)',
    lightBehavior: 'Mounted on --apple-bg-secondary well to prevent white-on-white edge bleed.',
    darkBehavior: 'Softly framed inside dark elevated card with subtle hairline perimeter.',
    whereUsed: 'ProjectCard, CaseStudyPage gallery, RelatedProjectsSection, BeforeAfterComparator.',
    guidance: 'Never place un-scrimmed text over photography; lock explicit aspect ratios to prevent CLS.',
  },
  {
    id: 'paper-grain-overlay',
    name: 'Procedural Organic Paper Grain',
    status: 'experimental',
    category: 'Experimental Texture (Track 01)',
    tokensOrCss: 'Inline SVG feTurbulence data URI + multiply (light) / screen (dark)',
    lightBehavior: '3%–6% archival fiber softness over secondary surfaces.',
    darkBehavior: 'Subtle screen-blended mineral grain avoiding crushed shadows.',
    whereUsed: 'Studio Materials & Effects Lab ONLY — not live on public portfolio.',
    guidance: 'Keep opacity ≤ 7% and pointer-events: none; evaluate legibility on 13px footnote ink before promoting.',
  },
  {
    id: 'perimeter-directional-gradients',
    name: 'Perimeter Glow & Directional Gradients',
    status: 'experimental',
    category: 'Experimental Gradients (Tracks 02 & 03)',
    tokensOrCss: 'Sub-10% radial-gradient / linear-gradient studio illumination wash',
    lightBehavior: 'Soft overhead daylight or horizon wash without colorful banding.',
    darkBehavior: 'Restrained cool rim or top specular wash calibrated to prevent dark-mode banding.',
    whereUsed: 'Studio Materials & Effects Lab ONLY — public canvas remains solid semantic fill.',
    guidance: 'Avoid multi-hue decorative gradients; any promoted wash must stay neutral and pass full WCAG AA contrast.',
  },
  {
    id: 'subtle-parallax-depth',
    name: 'Subtle Scroll Parallax Depth',
    status: 'experimental',
    category: 'Experimental Depth (Track 05)',
    tokensOrCss: 'transform: translate3d(0, ±4..12px, 0) scale(1.06)',
    lightBehavior: 'Micro-displacement inside overflow-hidden image frame.',
    darkBehavior: 'Identical GPU-composited displacement inside clipped frame.',
    whereUsed: 'Studio Materials & Effects Lab ONLY — strictly neutralized under prefers-reduced-motion.',
    guidance: 'Animate transform only (never background-position or top); disable unconditionally when reduced motion is active.',
  },
] as const;

export const MATERIAL_PERFORMANCE_GUIDANCE: readonly {
  title: string;
  detail: string;
}[] = [
  {
    title: 'Compositor-Only Transforms & Opacity',
    detail:
      'Hover lifts, modal entries, and experimental parallax animate strictly transform and opacity—never box-shadow interpolation across large scroll lists or layout properties (width/height/top).',
  },
  {
    title: 'Bounded Backdrop-Filter Footprint',
    detail:
      'Apply backdrop-filter blur only to compact sticky/floating surfaces (Navbar, AudioPlayer dock, mobile bar). Never layer multiple stacked backdrop-blur elements over full-viewport grids.',
  },
  {
    title: 'Light & Dark Contrast Parity',
    detail:
      'Every translucent material keeps ≥ 84% base opacity and is tested against both Cool and Warm matrices so secondary and tertiary text remain ≥ 4.5:1 WCAG 2.2 AA.',
  },
  {
    title: 'Reduced Motion & Low-Power Respect',
    detail:
      'Parallax and non-essential ambient treatments disable automatically under prefers-reduced-motion, and SVG grain stays static with zero continuous animation frames.',
  },
] as const;

/**
 * Generates clean, copyable CSS reflecting the live Materials & Effects Lab sliders
 * for the selected track, palette, and theme.
 */
export function generateEffectTrackCss(
  track: EffectTrackDefinition,
  config: EffectTrackConfig,
  theme: ResolvedTheme,
  palette: VisualPaletteId,
): string {
  const header = `/* Experimental ${track.title} (${config.variantId}) — ${palette} / ${theme} */`;
  if (!config.enabled) {
    return `${header}\n/* Disabled — matches production baseline (${track.baselineLabel}) */`;
  }

  const isDark = theme === 'dark';
  const isWarm = palette === 'warm';

  switch (track.id) {
    case 'organic-texture': {
      const opacity = (config.intensity / 100).toFixed(2);
      const blend = isDark ? 'screen' : 'multiply';
      return [
        header,
        '.experimental-grain-layer {',
        '  position: absolute;',
        '  inset: 0;',
        '  pointer-events: none;',
        `  background-size: ${config.secondary}px ${config.secondary}px;`,
        `  opacity: ${opacity};`,
        `  mix-blend-mode: ${blend};`,
        '}',
      ].join('\n');
    }
    case 'screen-edge-glow': {
      const alpha = config.intensity / 100;
      const spread = config.secondary;
      if (config.variantId === 'perimeter-frame') {
        const edge = isDark
          ? `rgba(0, 0, 0, ${(alpha * 1.9).toFixed(3)})`
          : `rgba(29, 29, 31, ${(alpha * 0.6).toFixed(3)})`;
        return [
          header,
          '.experimental-edge-frame {',
          `  box-shadow: inset 0 0 ${Math.round(spread * 1.6)}px ${edge};`,
          '}',
        ].join('\n');
      }
      const tint =
        config.variantId === 'top-specular'
          ? isDark
            ? `rgba(255, 255, 255, ${(alpha * 0.55).toFixed(3)})`
            : isWarm
              ? `rgba(218, 198, 168, ${(alpha * 0.85).toFixed(3)})`
              : `rgba(148, 163, 184, ${(alpha * 0.7).toFixed(3)})`
          : isDark
            ? `rgba(10, 132, 255, ${(alpha * 0.85).toFixed(3)})`
            : `rgba(0, 113, 227, ${(alpha * 0.65).toFixed(3)})`;
      const widthPct = config.variantId === 'top-specular' ? 110 : 95;
      return [
        header,
        '.experimental-edge-glow {',
        `  background-image: radial-gradient(${widthPct}% ${spread}% at 50% 0%, ${tint}, transparent 75%);`,
        '}',
      ].join('\n');
    }
    case 'directional-gradient': {
      const alpha = config.intensity / 100;
      const angle = config.secondary;
      const tintA = isDark
        ? `rgba(255, 255, 255, ${(alpha * 0.4).toFixed(3)})`
        : isWarm
          ? `rgba(214, 202, 184, ${(alpha * 1.15).toFixed(3)})`
          : `rgba(205, 213, 226, ${(alpha * 0.95).toFixed(3)})`;
      const tintB = isDark
        ? `rgba(10, 132, 255, ${(alpha * 0.35).toFixed(3)})`
        : `rgba(0, 113, 227, ${(alpha * 0.35).toFixed(3)})`;
      const value =
        config.variantId === 'radial-halo'
          ? `radial-gradient(85% 70% at 72% 18%, ${tintB}, transparent 68%), linear-gradient(${angle}deg, ${tintA}, transparent 65%)`
          : config.variantId === 'horizon-wash'
            ? `linear-gradient(180deg, transparent 42%, ${tintA} 100%)`
            : `linear-gradient(${angle}deg, ${tintA} 0%, transparent 62%)`;
      return [
        header,
        '.experimental-surface-gradient {',
        `  background-image: ${value};`,
        '}',
      ].join('\n');
    }
    case 'backdrop-blur': {
      const rgb = isDark
        ? isWarm
          ? '33, 31, 27'
          : '28, 28, 32'
        : isWarm
          ? '254, 253, 249'
          : '255, 255, 255';
      const alpha = (config.secondary / 100).toFixed(2);
      return [
        header,
        '.experimental-frosted-bar {',
        `  background-color: rgba(${rgb}, ${alpha});`,
        `  backdrop-filter: saturate(180%) blur(${config.intensity}px);`,
        `  -webkit-backdrop-filter: saturate(180%) blur(${config.intensity}px);`,
        '}',
      ].join('\n');
    }
    case 'subtle-parallax': {
      const normalized = (config.secondary - 50) / 50;
      const offset = Math.round(normalized * config.intensity);
      return [
        header,
        '.experimental-parallax-media {',
        `  transform: translate3d(0, ${offset}px, 0) scale(1.06);`,
        '  will-change: transform;',
        '}',
        '@media (prefers-reduced-motion: reduce) {',
        '  .experimental-parallax-media { transform: none; }',
        '}',
      ].join('\n');
    }
    case 'layered-shadows': {
      const scale = config.intensity / 100;
      const lift = config.secondary;
      const shadowRgb = isDark ? '0, 0, 0' : isWarm ? '44, 36, 24' : '15, 18, 24';
      const ring = isDark ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.055)';
      const spec = isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.92)';
      return [
        header,
        '.experimental-layered-shadow {',
        '  box-shadow:',
        `    inset 0 1px 0 ${spec},`,
        `    0 0 0 0.5px ${ring},`,
        `    0 ${Math.round(lift * 0.6)}px ${Math.round(lift * 1.6)}px -6px rgba(${shadowRgb}, ${(0.09 * scale).toFixed(3)}),`,
        `    0 ${lift}px ${Math.round(lift * 2.5)}px -14px rgba(${shadowRgb}, ${(0.12 * scale).toFixed(3)});`,
        '}',
      ].join('\n');
    }
    case 'borders-hairlines': {
      const borderAlpha = (config.intensity / 100).toFixed(3);
      const specAlpha = ((config.secondary / 100) * (isDark ? 0.22 : 0.95)).toFixed(3);
      const borderRgb = isDark
        ? isWarm
          ? '244, 238, 226'
          : '255, 255, 255'
        : isWarm
          ? '46, 38, 24'
          : '0, 0, 0';
      return [
        header,
        '.experimental-surface-border {',
        `  border: 1px solid rgba(${borderRgb}, ${borderAlpha});`,
        `  box-shadow: inset 0 1px 0 rgba(255, 255, 255, ${specAlpha});`,
        '}',
      ].join('\n');
    }
  }
}

/* ==========================================================================
   5. ICONS & SOUND SPECIFICATIONS
   ========================================================================== */

export interface IconSizeStep {
  px: number;
  stroke: string;
  role: string;
  usage: string;
}

export const ICON_SIZE_SCALE: readonly IconSizeStep[] = [
  {
    px: 12,
    stroke: '2.0px',
    role: 'Micro Indicator (Exception)',
    usage: 'Breadcrumbs, 12–13px micro badges, inline audio ticks, and compact chevrons.',
  },
  {
    px: 14,
    stroke: '1.75px',
    role: 'Inline Control (Default)',
    usage: 'Button icons, search input prefix, footer controls, card reading chevrons.',
  },
  {
    px: 16,
    stroke: '1.75px',
    role: 'Standard UI Glyph (Default)',
    usage: 'Sidebar controls, popover options, modal action triggers, TOC icons.',
  },
  {
    px: 18,
    stroke: '1.75px',
    role: 'Header / Transport (Default)',
    usage: 'Navbar mobile icons, AudioPlayer play/pause/skip controls, close triggers.',
  },
  {
    px: 20,
    stroke: '1.75px',
    role: 'Prominent Action (Default)',
    usage: 'Mobile menu trigger, ±15s audio seek icons, prominent drawer controls.',
  },
  {
    px: 24,
    stroke: '1.5px',
    role: 'Standalone Focal Glyph (Exception)',
    usage: 'Empty-state focal glyphs, confirmation badges, and ≥ 24px Studio specimens.',
  },
] as const;

export const ICON_DESIGN_SPECS: readonly { label: string; detail: string }[] = [
  {
    label: 'Icon Families',
    detail:
      '100% Lucide iconography: static UI icons via lucide-react, selective animated feedback/utility triggers via src/components/icons/AnimatedLucide.tsx (@animate-ui/react), and Lucide-based ±15s audio seek glyphs in src/components/icons/AudioSkipIcons.tsx.',
  },
  {
    label: 'Unified Stroke Standard',
    detail:
      'Universal default strokeWidth={1.75} for all 14px–20px static and animated Lucide icons. Two explicit size exceptions only: 2.0px for 12–13px micro glyphs and 1.5px for ≥ 24px standalone icons.',
  },
  {
    label: 'Reduced Motion & Accessibility',
    detail:
      'Animated Lucide triggers check useReducedMotion() and automatically render static Lucide fallbacks alongside CSS reduced-motion rules. Decorative glyphs declare aria-hidden="true"; icon-only controls expose explicit aria-label strings.',
  },
  {
    label: 'Baseline & Interactive States',
    detail:
      'All icons render with shrink-0 inside inline-flex items-center containers and inherit currentColor. Icon-only controls use .apple-btn-icon (44×44px mobile touch target), --apple-control-hover wash, and scale(0.95) press detent.',
  },
] as const;

export const SOUND_POLICY_SPECS: readonly { label: string; detail: string }[] = [
  {
    label: 'Default State & Persistence',
    detail:
      'UI sounds are enabled by default (true) and persisted globally in localStorage under portfolio_sound_enabled with cross-tab storage synchronization.',
  },
  {
    label: 'Intentional Trigger Policy',
    detail:
      'Play subtle Web Audio cues ONLY on meaningful commits, toggles, scrubber detents, clipboard copies, and form submissions—never on ordinary navigation links, hover, or scrolling.',
  },
  {
    label: 'Autoplay & First-Gesture Unlock',
    detail:
      'AudioContext initializes lazily after the first pointerdown or keydown gesture so browsers never log autoplay warnings on initial load.',
  },
  {
    label: 'Muted / Disabled Behaviour & AudioPlayer Independence',
    detail:
      'When muted via GlobalPreferencesPopover, Command Palette, or Studio toggle, every UI cue short-circuits silently while AudioPlayer narration remains 100% independent.',
  },
] as const;
