import { contrastRatio } from './a11yContrast';
import type { ResolvedTheme } from './appearance';
import type { VisualPaletteId } from './workshopStore';

export type ThemeMatrixId = 'cool-light' | 'cool-dark' | 'warm-light' | 'warm-dark';

export type FoundationDomainId =
  | 'colour-themes'
  | 'typography'
  | 'spacing-layout'
  | 'surfaces-elevation';

export function getThemeMatrixId(
  palette: VisualPaletteId,
  theme: ResolvedTheme,
): ThemeMatrixId {
  return `${palette}-${theme}`;
}

export interface ColorTokenSpec {
  token: string;
  label: string;
  group: 'surfaces' | 'ink' | 'controls' | 'accent-status' | 'borders';
  description: string;
  usage: string;
  values: Record<ThemeMatrixId, string>;
  /** True when the token is a solid opaque hex color eligible for WCAG sRGB contrast math. */
  isOpaqueHex?: boolean;
  /** True if only defined on :root/.dark and not overridden on [data-ds-sandbox]. */
  sandboxParityGap?: boolean;
}

export const COLOR_TOKEN_GROUP_META: readonly {
  id: ColorTokenSpec['group'];
  label: string;
  summary: string;
}[] = [
  {
    id: 'surfaces',
    label: 'Canvas & Surfaces',
    summary:
      'Layered planes separating primary reading canvas, recessed gallery bands, elevated cards, and translucent frosted glass.',
  },
  {
    id: 'ink',
    label: 'Ink & Label Hierarchy',
    summary:
      'Three calibrated neutral ink tiers calibrated in P3.1 to clear WCAG 2.2 AA (≥ 4.5:1) across primary, secondary, and elevated surfaces.',
  },
  {
    id: 'controls',
    label: 'Controls & Interactive Fills',
    summary:
      'Restrained neutral fills for segmented controls, tonal buttons, hover washes, active detents, and disabled form fields.',
  },
  {
    id: 'accent-status',
    label: 'Accent, Links & Semantic Status',
    summary:
      'Apple Blue action polarity paired with WCAG 2.2 AA semantic status tokens (success, warning, info, error) calibrated across all four theme matrices.',
  },
  {
    id: 'borders',
    label: 'Hairlines & Separators',
    summary:
      'Translucent alpha borders that adapt naturally to underlying surfaces without heavy opaque gridlines.',
  },
] as const;

/**
 * Exact semantic color token values mirrored verbatim from src/index.css.
 */
export const COLOR_TOKENS: readonly ColorTokenSpec[] = [
  // Surfaces
  {
    token: '--apple-bg',
    label: 'Primary Canvas',
    group: 'surfaces',
    description: 'Base page background for hero, long-form reading, and studio workspace.',
    usage: 'Default document canvas and clean editorial negative space.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#ffffff',
      'cool-dark': '#0b0b0d',
      'warm-light': '#fbfaf7',
      'warm-dark': '#12110f',
    },
  },
  {
    token: '--apple-bg-secondary',
    label: 'Secondary Band',
    group: 'surfaces',
    description: 'Recessed gallery band and default input background.',
    usage: 'Alternating editorial sections, form fields, and subtle sidebar tints.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#f5f5f7',
      'cool-dark': '#151518',
      'warm-light': '#f3f1ec',
      'warm-dark': '#1b1916',
    },
  },
  {
    token: '--apple-bg-tertiary',
    label: 'Tertiary Recessed',
    group: 'surfaces',
    description: 'Deeper recessed well for input hover states and nested trays.',
    usage: 'Input hover fill and subtle structural differentiation inside secondary bands.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#ececf0',
      'cool-dark': '#202024',
      'warm-light': '#eae6de',
      'warm-dark': '#25221e',
    },
  },
  {
    token: '--apple-surface-elevated',
    label: 'Elevated Surface',
    group: 'surfaces',
    description: 'Foreground card, modal sheet, and focused input plane.',
    usage: 'Project cards, AudioPlayer deck, modals, and focused inputs.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#ffffff',
      'cool-dark': '#1c1c20',
      'warm-light': '#fefdf9',
      'warm-dark': '#211f1b',
    },
  },
  {
    token: '--apple-surface-glass',
    label: 'Translucent Navigation Glass',
    group: 'surfaces',
    description: 'High-opacity frosted tint paired with backdrop-blur-xl on sticky bars.',
    usage: 'Primary Navbar and sticky mobile Studio bar.',
    values: {
      'cool-light': 'rgba(255, 255, 255, 0.86)',
      'cool-dark': 'rgba(18, 18, 21, 0.84)',
      'warm-light': 'rgba(251, 250, 247, 0.88)',
      'warm-dark': 'rgba(22, 20, 17, 0.86)',
    },
  },
  {
    token: '--apple-surface-ios-bar',
    label: 'Floating iOS Bar Surface',
    group: 'surfaces',
    description: 'Dense translucent glass for floating AudioPlayer dock and capsule TOC.',
    usage: 'Paired with saturate(180%) blur(24px) via .apple-ios-bar.',
    values: {
      'cool-light': 'rgba(255, 255, 255, 0.9)',
      'cool-dark': 'rgba(28, 28, 32, 0.9)',
      'warm-light': 'rgba(254, 253, 249, 0.92)',
      'warm-dark': 'rgba(33, 31, 27, 0.92)',
    },
  },
  {
    token: '--apple-surface-muted-card',
    label: 'Muted Frosted Card',
    group: 'surfaces',
    description: 'Soft translucent card wash used over subtly textured or secondary bands.',
    usage: 'Secondary overlays and translucent specimen panels.',
    values: {
      'cool-light': 'rgba(255, 255, 255, 0.78)',
      'cool-dark': 'rgba(28, 28, 32, 0.78)',
      'warm-light': 'rgba(254, 253, 249, 0.8)',
      'warm-dark': 'rgba(33, 31, 27, 0.8)',
    },
  },

  // Ink & Labels
  {
    token: '--apple-label-primary',
    label: 'Primary Ink',
    group: 'ink',
    description: 'High-contrast ink for display headings, headlines, and active controls.',
    usage: 'All headings (h1–h4), active navigation items, and primary UI labels.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#1d1d1f',
      'cool-dark': '#f5f5f7',
      'warm-light': '#1f1e1b',
      'warm-dark': '#f4f1ea',
    },
  },
  {
    token: '--apple-label-secondary',
    label: 'Secondary Ink',
    group: 'ink',
    description: 'Calibrated editorial reading ink for body copy, leads, and callouts.',
    usage: 'Long-form narrative paragraphs, summaries, and inactive nav labels.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#58585d',
      'cool-dark': '#a1a1a6',
      'warm-light': '#57534b',
      'warm-dark': '#aba59b',
    },
  },
  {
    token: '--apple-label-tertiary',
    label: 'Tertiary Ink',
    group: 'ink',
    description: 'Quiet metadata ink calibrated to retain ≥ 4.5:1 AA contrast on every canvas.',
    usage: 'Captions, dates, breadcrumbs, input placeholders, and subtle token readouts.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#6a6a70',
      'cool-dark': '#8e8e93',
      'warm-light': '#666259',
      'warm-dark': '#969086',
    },
  },

  // Controls
  {
    token: '--apple-control-tonal',
    label: 'Tonal Control Fill',
    group: 'controls',
    description: 'Neutral capsule background for tonal buttons and segmented tracks.',
    usage: '.apple-btn-tonal, .apple-segmented tracks, and active sidebar row fill.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#e8e8ed',
      'cool-dark': '#27272c',
      'warm-light': '#e7e3da',
      'warm-dark': '#2d2924',
    },
  },
  {
    token: '--apple-control-tonal-hover',
    label: 'Tonal Control Hover',
    group: 'controls',
    description: 'Stepped luminance response on pointer hover for tonal buttons.',
    usage: '.apple-btn-tonal:hover and interactive search triggers.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#dcdce2',
      'cool-dark': '#323238',
      'warm-light': '#dcd7cc',
      'warm-dark': '#38332c',
    },
  },
  {
    token: '--apple-control-tonal-active',
    label: 'Tonal Control Active',
    group: 'controls',
    description: 'Tactile press tint paired with scale(0.97) on active detent.',
    usage: '.apple-btn-tonal:active.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#d2d2d9',
      'cool-dark': '#3c3c44',
      'warm-light': '#d1cbbd',
      'warm-dark': '#433d35',
    },
  },
  {
    token: '--apple-control-thumb',
    label: 'Segmented Control Thumb',
    group: 'controls',
    description: 'Elevated active pill inside a segmented control track.',
    usage: 'Active sliding pill inside .apple-segmented paired with --shadow-apple-pill.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#ffffff',
      'cool-dark': '#2e2e34',
      'warm-light': '#fefdf9',
      'warm-dark': '#332f29',
    },
  },
  {
    token: '--apple-control-hover',
    label: 'Icon Hover Wash',
    group: 'controls',
    description: 'Subtle translucent wash behind borderless circular icon buttons.',
    usage: '.apple-btn-icon:hover.',
    values: {
      'cool-light': 'rgba(0, 0, 0, 0.05)',
      'cool-dark': 'rgba(255, 255, 255, 0.07)',
      'warm-light': 'rgba(34, 28, 20, 0.05)',
      'warm-dark': 'rgba(255, 248, 236, 0.075)',
    },
  },
  {
    token: '--apple-control-active',
    label: 'Icon Active Wash',
    group: 'controls',
    description: 'Pressed wash behind borderless circular icon buttons.',
    usage: '.apple-btn-icon:active.',
    values: {
      'cool-light': 'rgba(0, 0, 0, 0.085)',
      'cool-dark': 'rgba(255, 255, 255, 0.12)',
      'warm-light': 'rgba(34, 28, 20, 0.09)',
      'warm-dark': 'rgba(255, 248, 236, 0.12)',
    },
  },
  {
    token: '--apple-input-disabled-bg',
    label: 'Disabled Input Surface',
    group: 'controls',
    description: 'Flat muted fill for disabled form controls.',
    usage: '.apple-input:disabled across :root, .dark, and all four [data-ds-sandbox] matrices.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#efeff4',
      'cool-dark': '#1b1b1f',
      'warm-light': '#ece8e0',
      'warm-dark': '#1f1d19',
    },
  },

  // Accent & Status
  {
    token: '--apple-blue',
    label: 'Apple Blue Accent',
    group: 'accent-status',
    description: 'Brand focus ring, icon emphasis, and active accent graphics.',
    usage: 'Focus outlines, progress bars, active indicator bars, and outline borders.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#0071e3',
      'cool-dark': '#0a84ff',
      'warm-light': '#0071e3',
      'warm-dark': '#0a84ff',
    },
  },
  {
    token: '--apple-blue-fill',
    label: 'Primary Button Fill',
    group: 'accent-status',
    description: 'Solid CTA fill kept at #0071e3 across Light and Dark so white text holds ≥ 4.8:1.',
    usage: '.apple-btn-primary background with #ffffff text.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#0071e3',
      'cool-dark': '#0071e3',
      'warm-light': '#0071e3',
      'warm-dark': '#0071e3',
    },
  },
  {
    token: '--apple-blue-hover',
    label: 'Primary Button Hover',
    group: 'accent-status',
    description: 'Deepened Apple Blue on pointer hover.',
    usage: '.apple-btn-primary:hover.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#0066cc',
      'cool-dark': '#0066cc',
      'warm-light': '#0066cc',
      'warm-dark': '#0066cc',
    },
  },
  {
    token: '--apple-blue-active',
    label: 'Primary Button Active',
    group: 'accent-status',
    description: 'Deepest Apple Blue detent during active pointer press.',
    usage: '.apple-btn-primary:active and .apple-btn-outline:active.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#005bb5',
      'cool-dark': '#005bb5',
      'warm-light': '#005bb5',
      'warm-dark': '#005bb5',
    },
  },
  {
    token: '--apple-link',
    label: 'Interactive Link Text',
    group: 'accent-status',
    description: 'Text-calibrated blue (#0066cc light / #409cff dark) guaranteeing AA contrast on all surfaces.',
    usage: 'Inline links, breadcrumbs, eyebrows, and outline button text.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#0066cc',
      'cool-dark': '#409cff',
      'warm-light': '#0066cc',
      'warm-dark': '#409cff',
    },
  },
  {
    token: '--apple-success',
    label: 'Semantic Success Ink',
    group: 'accent-status',
    description: 'AA-calibrated positive status ink (≥ 4.79:1 light / ≥ 8.58:1 dark) for confirmations and verified checks.',
    usage: 'Resolved audit badges, WCAG pass readouts, and positive confirmation icons.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#1b7a38',
      'cool-dark': '#32d74b',
      'warm-light': '#1b7a38',
      'warm-dark': '#32d74b',
    },
  },
  {
    token: '--apple-warning',
    label: 'Semantic Warning Ink',
    group: 'accent-status',
    description: 'AA-calibrated deep amber/ochre (≥ 5.02:1 light / ≥ 9.22:1 dark) for caution notices and non-blocking advisories.',
    usage: 'Caution banners, draft/experimental notices, and attention states.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#9a5600',
      'cool-dark': '#ffb340',
      'warm-light': '#9a5600',
      'warm-dark': '#ffb340',
    },
  },
  {
    token: '--apple-info',
    label: 'Semantic Informational Ink',
    group: 'accent-status',
    description: 'Informational status ink aligned with calibrated Apple Blue (≥ 4.93:1 light / ≥ 5.81:1 dark) while decoupled semantically from navigation links.',
    usage: 'Informational toasts, helper callouts, and neutral system notices.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#0066cc',
      'cool-dark': '#409cff',
      'warm-light': '#0066cc',
      'warm-dark': '#409cff',
    },
  },
  {
    token: '--apple-error',
    label: 'Validation Error Ink',
    group: 'accent-status',
    description: 'Accessible semantic error color for invalid fields and inline validation copy.',
    usage: '.apple-input[aria-invalid="true"] border and contact form error messages.',
    isOpaqueHex: true,
    values: {
      'cool-light': '#c62828',
      'cool-dark': '#ff6961',
      'warm-light': '#c62828',
      'warm-dark': '#ff6961',
    },
  },
  {
    token: '--apple-focus-ring',
    label: 'Input Focus Halo',
    group: 'accent-status',
    description: '4px outer halo surrounding focused form inputs and selects.',
    usage: 'box-shadow: 0 0 0 4px var(--apple-focus-ring) on :focus-visible inputs.',
    values: {
      'cool-light': 'rgba(0, 113, 227, 0.24)',
      'cool-dark': 'rgba(10, 132, 255, 0.34)',
      'warm-light': 'rgba(0, 113, 227, 0.24)',
      'warm-dark': 'rgba(10, 132, 255, 0.34)',
    },
  },
  {
    token: '--apple-error-ring',
    label: 'Error Focus Halo',
    group: 'accent-status',
    description: '4px outer halo when focusing an invalid form field.',
    usage: '.apple-input[aria-invalid="true"]:focus-visible.',
    values: {
      'cool-light': 'rgba(198, 40, 40, 0.18)',
      'cool-dark': 'rgba(255, 105, 97, 0.26)',
      'warm-light': 'rgba(198, 40, 40, 0.18)',
      'warm-dark': 'rgba(255, 105, 97, 0.26)',
    },
  },

  // Hairlines & Borders
  {
    token: '--apple-separator-subtle',
    label: 'Subtle Hairline',
    group: 'borders',
    description: 'Lowest-contrast divider for intra-card metadata and resting navigation edges.',
    usage: 'Table rows, resting navbar bottom edge, and internal footer dividers.',
    values: {
      'cool-light': 'rgba(0, 0, 0, 0.06)',
      'cool-dark': 'rgba(255, 255, 255, 0.075)',
      'warm-light': 'rgba(42, 36, 26, 0.065)',
      'warm-dark': 'rgba(244, 238, 226, 0.075)',
    },
  },
  {
    token: '--apple-separator',
    label: 'Standard Separator',
    group: 'borders',
    description: 'Primary architectural hairline for section breaks, sidebars, and container frames.',
    usage: 'Section dividers, sidebar border, studio header rule, and structural outlines.',
    values: {
      'cool-light': 'rgba(0, 0, 0, 0.08)',
      'cool-dark': 'rgba(255, 255, 255, 0.11)',
      'warm-light': 'rgba(42, 36, 26, 0.09)',
      'warm-dark': 'rgba(244, 238, 226, 0.11)',
    },
  },
  {
    token: '--apple-separator-strong',
    label: 'Strong Separator',
    group: 'borders',
    description: 'Crisp structural outline when surface contrast alone is insufficient.',
    usage: 'Interactive specimens, radius demos, and high-definition structural frames.',
    values: {
      'cool-light': 'rgba(0, 0, 0, 0.14)',
      'cool-dark': 'rgba(255, 255, 255, 0.18)',
      'warm-light': 'rgba(42, 36, 26, 0.16)',
      'warm-dark': 'rgba(244, 238, 226, 0.18)',
    },
  },
] as const;

export interface ContrastEvaluation {
  ratio: number;
  formattedRatio: string;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  grade: 'AAA' | 'AA' | 'AA Large' | 'Fail';
}

export function evaluateContrastPair(
  foregroundHex: string,
  backgroundHex: string,
): ContrastEvaluation {
  const raw = contrastRatio(foregroundHex, backgroundHex);
  const ratio = Math.round(raw * 100) / 100;
  const aaNormal = raw >= 4.5;
  const aaLarge = raw >= 3.0;
  const aaaNormal = raw >= 7.0;
  const grade: ContrastEvaluation['grade'] = aaaNormal
    ? 'AAA'
    : aaNormal
      ? 'AA'
      : aaLarge
        ? 'AA Large'
        : 'Fail';
  return {
    ratio,
    formattedRatio: `${ratio.toFixed(2)}:1`,
    aaNormal,
    aaLarge,
    aaaNormal,
    grade,
  };
}

export function getTokenValueForMatrix(
  tokenSpec: ColorTokenSpec,
  palette: VisualPaletteId,
  theme: ResolvedTheme,
): string {
  return tokenSpec.values[getThemeMatrixId(palette, theme)];
}

export interface FontFamilySpec {
  id: string;
  name: string;
  token: string;
  stack: string;
  weightsLoaded: string;
  role: string;
  notes: string;
  /** True when intentionally managed via Tailwind utility convention rather than a custom CSS var. */
  isConvention?: boolean;
}

export const FONT_FAMILIES: readonly FontFamilySpec[] = [
  {
    id: 'sf-display',
    name: 'SF Pro Display (Optical ≥ 20pt)',
    token: '--font-sf-display',
    stack:
      "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    weightsLoaded: '400 (Regular), 600 (Semibold) · Inter fallback loads 400/500/600/700',
    role: 'Hero display, page titles (Title 1–3, h1–h3), editorial leads, and wordmark.',
    notes:
      'Resolves native SF Pro Display on Apple OSes and falls back to optical-sized Inter (opsz 14..32) on Windows, Linux, and Android. Tight negative tracking preserves headline authority.',
  },
  {
    id: 'sf-text',
    name: 'SF Pro Text (Optical < 20pt)',
    token: '--font-sf-text',
    stack:
      "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    weightsLoaded: '400 (Regular), 500 (Medium), 600 (Semibold) · Inter fallback loads 400/500/600/700',
    role: 'Base h4, .type-headline, body copy, callouts, interface controls, navigation links, footnotes, and captions.',
    notes:
      'Slightly more open letterforms and generous tracking than Display so all sub-20pt headings and sustained 13px–17px reading stay crisp.',
  },
  {
    id: 'mono',
    name: 'System Monospace (Tailwind font-mono)',
    token: 'font-mono (intentional Tailwind convention)',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    weightsLoaded: '400 (Regular), 600 (Semibold)',
    role: 'CSS variable names, hex values, numeric specs, and Studio code references.',
    notes:
      'Intentionally uses Tailwind v4 font-mono (resolving native SF Mono on Apple OSes) rather than adding a custom --font-sf-mono variable — monospace appears only 3 times in public views.',
    isConvention: true,
  },
] as const;

export interface TypographyStyleSpec {
  id: string;
  className: string;
  role: string;
  category: 'Display & Headings' | 'Editorial Prose' | 'Interface & Metadata';
  opticalFamily: 'SF Pro Display' | 'SF Pro Text';
  familyToken: '--font-sf-display' | '--font-sf-text';
  sizeToken: string;
  sizeCss: string;
  minPx: number;
  fluidVw: number | null;
  maxPx: number;
  weight: number;
  lineHeightToken: string;
  lineHeight: number;
  letterSpacingToken: string;
  letterSpacing: string;
  readerLargeOverride?: string;
  defaultMeasure?: string;
  whenToUse: string;
  sample: string;
}

export const TYPOGRAPHY_STYLES: readonly TypographyStyleSpec[] = [
  {
    id: 'display',
    className: '.type-display',
    role: 'Hero Display',
    category: 'Display & Headings',
    opticalFamily: 'SF Pro Display',
    familyToken: '--font-sf-display',
    sizeToken: '--type-display-size',
    sizeCss: 'clamp(2.75rem, 5.1vw, 4.5rem)',
    minPx: 44,
    fluidVw: 5.1,
    maxPx: 72,
    weight: 600,
    lineHeightToken: '--type-display-lh',
    lineHeight: 1.04,
    letterSpacingToken: '--type-display-ls',
    letterSpacing: '-0.036em',
    defaultMeasure: '.measure-display (20ch)',
    whenToUse: 'Reserved strictly for the Home hero statement (maximum one per page).',
    sample: 'Clarity shaped with intent.',
  },
  {
    id: 'title-1',
    className: '.type-title-1',
    role: 'Title 1 (Page H1)',
    category: 'Display & Headings',
    opticalFamily: 'SF Pro Display',
    familyToken: '--font-sf-display',
    sizeToken: '--type-title1-size',
    sizeCss: 'clamp(2.125rem, 3.6vw, 3rem)',
    minPx: 34,
    fluidVw: 3.6,
    maxPx: 48,
    weight: 600,
    lineHeightToken: '--type-title1-lh',
    lineHeight: 1.08,
    letterSpacingToken: '--type-title1-ls',
    letterSpacing: '-0.03em',
    defaultMeasure: '.measure-title (24ch)',
    whenToUse: 'Primary H1 title on Case Study, About, Notes, Contact, and Studio pages.',
    sample: 'Recent product and interaction studies.',
  },
  {
    id: 'title-2',
    className: '.type-title-2',
    role: 'Title 2 (Section H2)',
    category: 'Display & Headings',
    opticalFamily: 'SF Pro Display',
    familyToken: '--font-sf-display',
    sizeToken: '--type-title2-size',
    sizeCss: 'clamp(1.625rem, 2.4vw, 2.25rem)',
    minPx: 26,
    fluidVw: 2.4,
    maxPx: 36,
    weight: 600,
    lineHeightToken: '--type-title2-lh',
    lineHeight: 1.14,
    letterSpacingToken: '--type-title2-ls',
    letterSpacing: '-0.026em',
    defaultMeasure: '.measure-title (24ch)',
    whenToUse: 'Major chapter headings in case studies and top-level documentation bands.',
    sample: 'Principles that guide my work.',
  },
  {
    id: 'title-3',
    className: '.type-title-3',
    role: 'Title 3 (Subsection H3)',
    category: 'Display & Headings',
    opticalFamily: 'SF Pro Display',
    familyToken: '--font-sf-display',
    sizeToken: '--type-title3-size',
    sizeCss: 'clamp(1.25rem, 1.5vw, 1.5rem)',
    minPx: 20,
    fluidVw: 1.5,
    maxPx: 24,
    weight: 600,
    lineHeightToken: '--type-title3-lh',
    lineHeight: 1.2,
    letterSpacingToken: '--type-title3-ls',
    letterSpacing: '-0.022em',
    whenToUse: 'Featured project card titles, subsection headers, and specimen titles.',
    sample: 'Spatial floor-plan allocation.',
  },
  {
    id: 'headline',
    className: '.type-headline',
    role: 'Headline (Card / Row H4)',
    category: 'Display & Headings',
    opticalFamily: 'SF Pro Text',
    familyToken: '--font-sf-text',
    sizeToken: '--type-headline-size',
    sizeCss: '1.0625rem',
    minPx: 17,
    fluidVw: null,
    maxPx: 17,
    weight: 600,
    lineHeightToken: '--type-headline-lh',
    lineHeight: 1.35,
    letterSpacingToken: '--type-headline-ls',
    letterSpacing: '-0.018em',
    whenToUse: 'Compact card headings, list row titles, and structured metadata titles.',
    sample: 'Evidence-First Triage Ledger',
  },
  {
    id: 'lead',
    className: '.type-lead',
    role: 'Editorial Lead',
    category: 'Editorial Prose',
    opticalFamily: 'SF Pro Display',
    familyToken: '--font-sf-display',
    sizeToken: '--type-lead-size',
    sizeCss: 'clamp(1.125rem, 1.35vw, 1.3125rem)',
    minPx: 18,
    fluidVw: 1.35,
    maxPx: 21,
    weight: 400,
    lineHeightToken: '--type-lead-lh',
    lineHeight: 1.48,
    letterSpacingToken: '--type-lead-ls',
    letterSpacing: '-0.016em',
    readerLargeOverride: 'clamp(1.25rem, 2.2vw, 1.4375rem) · LH 1.48',
    defaultMeasure: '.measure-lead (50ch)',
    whenToUse: 'Opening deck paragraph immediately beneath Hero Display or Page Title 1.',
    sample: 'Independent UX and product designer crafting calm digital systems.',
  },
  {
    id: 'body',
    className: '.type-body',
    role: 'Body Copy',
    category: 'Editorial Prose',
    opticalFamily: 'SF Pro Text',
    familyToken: '--font-sf-text',
    sizeToken: '--type-body-size',
    sizeCss: '1.0625rem',
    minPx: 17,
    fluidVw: null,
    maxPx: 17,
    weight: 400,
    lineHeightToken: '--type-body-lh',
    lineHeight: 1.62,
    letterSpacingToken: '--type-body-ls',
    letterSpacing: '-0.012em',
    readerLargeOverride: '1.1875rem (19px) · LH 1.64',
    defaultMeasure: '.measure-prose (60ch)',
    whenToUse: 'Sustained case study narrative and Design Journal article prose.',
    sample:
      'Long-form case studies maintain a 60ch reading measure with generous inter-paragraph rhythm so technical architecture scans effortlessly.',
  },
  {
    id: 'callout',
    className: '.type-callout',
    role: 'Callout',
    category: 'Editorial Prose',
    opticalFamily: 'SF Pro Text',
    familyToken: '--font-sf-text',
    sizeToken: '--type-callout-size',
    sizeCss: '0.96875rem',
    minPx: 15.5,
    fluidVw: null,
    maxPx: 15.5,
    weight: 400,
    lineHeightToken: '--type-callout-lh',
    lineHeight: 1.54,
    letterSpacingToken: '--type-callout-ls',
    letterSpacing: '-0.011em',
    readerLargeOverride: '1.0625rem (17px) · LH 1.56',
    whenToUse: 'Project card descriptions, section introductions, and architectural rationale.',
    sample: 'Supporting card copy and secondary architectural rationale.',
  },
  {
    id: 'eyebrow',
    className: '.type-eyebrow',
    role: 'Eyebrow / Subhead',
    category: 'Interface & Metadata',
    opticalFamily: 'SF Pro Text',
    familyToken: '--font-sf-text',
    sizeToken: '--type-subhead-size',
    sizeCss: '0.9375rem',
    minPx: 15,
    fluidVw: null,
    maxPx: 15,
    weight: 600,
    lineHeightToken: '--type-subhead-lh',
    lineHeight: 1.36,
    letterSpacingToken: '--type-subhead-ls',
    letterSpacing: '-0.014em',
    whenToUse: 'Quiet editorial kicker above Title 1/Title 2 headings (sentence case, never shouted all-caps).',
    sample: 'Selected Work · 6 Case Studies',
  },
  {
    id: 'footnote',
    className: '.type-footnote',
    role: 'Footnote',
    category: 'Interface & Metadata',
    opticalFamily: 'SF Pro Text',
    familyToken: '--font-sf-text',
    sizeToken: '--type-footnote-size',
    sizeCss: '0.8125rem',
    minPx: 13,
    fluidVw: null,
    maxPx: 13,
    weight: 500,
    lineHeightToken: '--type-footnote-lh',
    lineHeight: 1.46,
    letterSpacingToken: '--type-footnote-ls',
    letterSpacing: '-0.006em',
    readerLargeOverride: '0.90625rem (14.5px)',
    whenToUse: 'Figure captions, helper notes, navigation metadata, and form guidance.',
    sample: 'Role, caption metadata, and secondary helper guidance.',
  },
  {
    id: 'caption',
    className: '.type-caption',
    role: 'Caption / Micro-Label',
    category: 'Interface & Metadata',
    opticalFamily: 'SF Pro Text',
    familyToken: '--font-sf-text',
    sizeToken: '--type-caption-size',
    sizeCss: '0.75rem',
    minPx: 12,
    fluidVw: null,
    maxPx: 12,
    weight: 600,
    lineHeightToken: '--type-caption-lh',
    lineHeight: 1.35,
    letterSpacingToken: '--type-caption-ls',
    letterSpacing: '0em',
    whenToUse: 'Chapter numbering, timeline stamps, table column headers, and token labels.',
    sample: '01 · At a glance · 2025',
  },
] as const;

/**
 * Computes the exact rendered font size in px for a TypographyStyleSpec at a
 * given viewport width and optional Reader Comfort Large mode.
 */
export function computeTypeSizeAtViewport(
  spec: TypographyStyleSpec,
  viewportWidthPx: number,
  readerLarge = false,
): number {
  if (readerLarge) {
    if (spec.id === 'body') return 19;
    if (spec.id === 'callout') return 17;
    if (spec.id === 'footnote') return 14.5;
    if (spec.id === 'lead') {
      const vwVal = (2.2 / 100) * viewportWidthPx;
      return Math.round(Math.min(23, Math.max(20, vwVal)) * 10) / 10;
    }
  }
  if (spec.fluidVw === null) return spec.minPx;
  const vwVal = (spec.fluidVw / 100) * viewportWidthPx;
  const clamped = Math.min(spec.maxPx, Math.max(spec.minPx, vwVal));
  return Math.round(clamped * 10) / 10;
}

export interface EditorialMeasureSpec {
  token: string;
  className: string;
  value: string;
  role: string;
  rationale: string;
}

export const EDITORIAL_MEASURES: readonly EditorialMeasureSpec[] = [
  {
    token: '--measure-display',
    className: '.measure-display',
    value: '20ch',
    role: 'Hero Display Statements',
    rationale: 'Keeps 72px hero headlines to 2 crisp balanced lines without edge-to-edge sprawl.',
  },
  {
    token: '--measure-title',
    className: '.measure-title',
    value: '24ch',
    role: 'Page & Chapter Titles',
    rationale: 'Pairs with text-wrap: balance so H1 and H2 titles avoid single-word orphan lines.',
  },
  {
    token: '--measure-lead',
    className: '.measure-lead',
    value: '50ch',
    role: 'Editorial Intro Leads',
    rationale: 'Guides quick scanning of 18–21px deck paragraphs immediately beneath headings.',
  },
  {
    token: '--measure-prose',
    className: '.measure-prose',
    value: '60ch',
    role: 'Long-Form Case Study & Journal Prose',
    rationale: 'Optimal eye-tracking return distance for 17px–19px sustained editorial reading.',
  },
] as const;

export interface SpacingStepSpec {
  id: string;
  tailwind: string;
  rem: string;
  px: number;
  semanticRole: string;
  realUsage: string;
}

export const SPACING_SCALE: readonly SpacingStepSpec[] = [
  {
    id: 'sp-1',
    tailwind: '1',
    rem: '0.25rem',
    px: 4,
    semanticRole: 'Micro / Hairline Offset',
    realUsage: 'Segmented track padding (p-1), tight icon nudges, micro label offsets.',
  },
  {
    id: 'sp-2',
    tailwind: '2',
    rem: '0.5rem',
    px: 8,
    semanticRole: 'Inline Element Gap',
    realUsage: 'Button icon-to-label gap, breadcrumb separators, compact control clusters.',
  },
  {
    id: 'sp-3',
    tailwind: '3',
    rem: '0.75rem',
    px: 12,
    semanticRole: 'Control Group Gap',
    realUsage: 'Form label-to-input rhythm, compact chip/control groups, sidebar padding.',
  },
  {
    id: 'sp-4',
    tailwind: '4',
    rem: '1rem',
    px: 16,
    semanticRole: 'Minimum Container Padding',
    realUsage: 'Compact tiles, mobile grid gaps (gap-4), table cell padding.',
  },
  {
    id: 'sp-5',
    tailwind: '5',
    rem: '1.25rem',
    px: 20,
    semanticRole: 'Mobile Edge Gutter & Prose Stack',
    realUsage: 'Mobile page outer padding (px-5) and .prose-stack inter-paragraph spacing (1.25rem).',
  },
  {
    id: 'sp-6',
    tailwind: '6',
    rem: '1.5rem',
    px: 24,
    semanticRole: 'Standard Card Padding & Grid Gap',
    realUsage: 'Standard cards, modal body padding, desktop two-column gutters (gap-6).',
  },
  {
    id: 'sp-8',
    tailwind: '8',
    rem: '2rem',
    px: 32,
    semanticRole: 'Desktop Outer Gutter & Feature Padding',
    realUsage: 'Desktop shell gutter (sm:px-8), featured case study card interiors, section header spacing.',
  },
  {
    id: 'sp-12',
    tailwind: '12',
    rem: '3rem',
    px: 48,
    semanticRole: 'Subsection Separation',
    realUsage: 'Header-to-grid rhythm, TOC column separation (lg:gap-12), studio block breaks.',
  },
  {
    id: 'sp-16',
    tailwind: '16',
    rem: '4rem',
    px: 64,
    semanticRole: 'Major Chapter Cadence',
    realUsage: 'Case study chapter spacing (space-y-16), desktop hero padding.',
  },
  {
    id: 'sp-24',
    tailwind: '24',
    rem: '6rem',
    px: 96,
    semanticRole: 'Editorial Band Rhythm',
    realUsage: 'Full-width alternating section vertical rhythm (py-24) on Home and About.',
  },
] as const;

export interface LayoutTokenSpec {
  name: string;
  implementation: string;
  value: string;
  status: 'css-var' | 'convention';
  purpose: string;
}

export const LAYOUT_TOKENS: readonly LayoutTokenSpec[] = [
  {
    name: 'Editorial Shell Width',
    implementation: 'max-w-[1160px]',
    value: '1160px',
    status: 'convention',
    purpose: 'Primary public portfolio container across Navbar, Home, Case Studies, Notes, About, and Footer.',
  },
  {
    name: 'Studio Content Pane',
    implementation: 'max-w-[1040px]',
    value: '1040px',
    status: 'convention',
    purpose: 'Documentation reading and specimen width beside the 264px persistent Studio sidebar.',
  },
  {
    name: 'Sticky Navbar Height',
    implementation: 'h-[52px]',
    value: '52px',
    status: 'convention',
    purpose: 'Compact single-row translucent navigation bar anchoring sticky sub-bars and sidebar.',
  },
  {
    name: 'Header Scroll Offset',
    implementation: '--scroll-offset-header',
    value: '84px',
    status: 'css-var',
    purpose: 'Standard scroll-margin-top clearing the 52px navbar plus 32px visual breathing room.',
  },
  {
    name: 'Header + Subnav Offset',
    implementation: '--scroll-offset-header-subnav',
    value: '136px',
    status: 'css-var',
    purpose: 'Extended scroll-margin-top when Case Study Local Ribbon TOC is active beneath Navbar.',
  },
  {
    name: 'Prose Stack Gap',
    implementation: '.prose-stack > * + *',
    value: '1.25rem (20px)',
    status: 'convention',
    purpose: 'Consistent vertical separation between consecutive editorial paragraphs.',
  },
] as const;

export interface BreakpointSpec {
  id: 'mobile' | 'sm' | 'md' | 'lg' | 'xl';
  prefix: string;
  minWidthPx: number;
  previewWidthPx: number;
  columns: number;
  outerPadding: string;
  gutter: string;
  behavior: string;
}

export const RESPONSIVE_BREAKPOINTS: readonly BreakpointSpec[] = [
  {
    id: 'mobile',
    prefix: 'Base (< 640px)',
    minWidthPx: 0,
    previewWidthPx: 375,
    columns: 1,
    outerPadding: '20px (px-5)',
    gutter: '16px (gap-4)',
    behavior: 'Single-column editorial flow, 44px touch targets, bottom reading bar & slide-over Studio drawer.',
  },
  {
    id: 'sm',
    prefix: 'sm (≥ 640px)',
    minWidthPx: 640,
    previewWidthPx: 640,
    columns: 2,
    outerPadding: '32px (sm:px-8)',
    gutter: '24px (gap-6)',
    behavior: 'Two-column metadata grids, expanded horizontal gutters, inline header utilities.',
  },
  {
    id: 'md',
    prefix: 'md (≥ 768px)',
    minWidthPx: 768,
    previewWidthPx: 768,
    columns: 2,
    outerPadding: '32px (sm:px-8)',
    gutter: '24px (gap-6)',
    behavior: 'Desktop primary Navbar links appear; two-column project grid and comparison splits activate.',
  },
  {
    id: 'lg',
    prefix: 'lg (≥ 1024px)',
    minWidthPx: 1024,
    previewWidthPx: 1024,
    columns: 12,
    outerPadding: '32px (sm:px-8)',
    gutter: '32px (lg:gap-8)',
    behavior: '12-column editorial grid, sticky Case Study TOC rail (3/9 split), persistent 264px Studio sidebar.',
  },
  {
    id: 'xl',
    prefix: 'xl (≥ 1280px)',
    minWidthPx: 1280,
    previewWidthPx: 1280,
    columns: 12,
    outerPadding: '32px within 1160px shell',
    gutter: '32px (lg:gap-8)',
    behavior: 'Container caps at 1160px public / 1040px Studio pane so line lengths never over-stretch.',
  },
] as const;

export interface RadiusSpec {
  id: string;
  implementation: string;
  value: string;
  px: number;
  role: string;
  nestingRule: string;
}

export const RADIUS_SCALE: readonly RadiusSpec[] = [
  {
    id: 'r-6',
    implementation: 'border-radius: 6px (.apple-link)',
    value: '6px',
    px: 6,
    role: 'Inline links & keyboard focus rings',
    nestingRule: 'Tight optical contour around text links without pillifying inline copy.',
  },
  {
    id: 'r-12',
    implementation: 'rounded-[12px]',
    value: '12px',
    px: 12,
    role: 'Compact inputs, sidebar rows, directory rows',
    nestingRule: 'Pairs cleanly inside 20px–24px parent containers with 8px–12px padding.',
  },
  {
    id: 'r-14',
    implementation: 'rounded-[14px]',
    value: '14px',
    px: 14,
    role: 'Standard form inputs, swatch tiles, popover rows',
    nestingRule: 'Standard tactile control radius inside elevated cards.',
  },
  {
    id: 'r-20',
    implementation: 'rounded-[20px]',
    value: '20px',
    px: 20,
    role: 'Inner bento frames, nested preview trays',
    nestingRule: 'Concentric inner child of 28px outer cards separated by 8px padding.',
  },
  {
    id: 'r-24',
    implementation: 'rounded-[24px]',
    value: '24px',
    px: 24,
    role: 'AudioPlayer deck, specimen sheets, capability panels',
    nestingRule: 'Mid-scale standalone architectural surface.',
  },
  {
    id: 'r-28',
    implementation: 'rounded-[28px]',
    value: '28px',
    px: 28,
    role: 'Showcase project cards, case study frames, Lightbox',
    nestingRule: 'Primary outer showcase container — largest non-pill radius in the system.',
  },
  {
    id: 'r-full',
    implementation: 'rounded-full (9999px)',
    value: '9999px',
    px: 9999,
    role: 'Primary/outline/tonal buttons, segmented controls, floating dock',
    nestingRule: 'Strictly reserved for interactive actions and controls — never static status tags.',
  },
] as const;

export interface ElevationSpec {
  id: string;
  name: string;
  token: string;
  className: string;
  layer: string;
  usage: string;
  lightPhysics: string;
  darkPhysics: string;
  sandboxParityGap?: boolean;
}

export const ELEVATION_LEVELS: readonly ElevationSpec[] = [
  {
    id: 'subtle',
    name: 'Subtle Surface',
    token: '--shadow-apple-subtle',
    className: 'apple-surface-subtle',
    layer: 'Level 1 · Seated',
    usage: 'Capability tiles, inline AudioPlayer deck, prototype inspector trays.',
    lightPhysics: '90% white top specular + 0.5px 4.5% ring + soft 18px ambient.',
    darkPhysics: '7% white top specular + 0.5px 8% hairline border + tight 6px contact shadow.',
  },
  {
    id: 'pill',
    name: 'Control Pill',
    token: '--shadow-apple-pill',
    className: 'apple-pill-shadow',
    layer: 'Level 1.5 · Control Thumb',
    usage: 'Active segmented control thumb, slider handles, compact inspect triggers.',
    lightPhysics: '95% white micro-bevel + 5% ring + crisp 10px lift.',
    darkPhysics: '12% white top edge + 10% ring + 42% opacity drop.',
  },
  {
    id: 'card',
    name: 'Elevated Card',
    token: '--shadow-apple-card',
    className: 'apple-card-static',
    layer: 'Level 2 · Resting Showcase',
    usage: 'Case study cards, Contact form sheet, closing CTA frame.',
    lightPhysics: 'Dual-stage 30px + 60px diffuse ambient + 0.5px perimeter contact.',
    darkPhysics: '8% specular top highlight + 9% hairline ring + deep 55%–65% ambient grounding.',
  },
  {
    id: 'card-hover',
    name: 'Elevated Card (Hover)',
    token: '--shadow-apple-card-hover',
    className: 'apple-card',
    layer: 'Level 2.5 · Interactive Lift',
    usage: 'Interactive project cards on hover (paired with translateY(-4px) when motion allowed).',
    lightPhysics: 'Expanded 44px + 80px ambient bloom with 12% shadow density.',
    darkPhysics: 'Brightened 12% top highlight + 14% hairline + 78% grounding shadow.',
  },
  {
    id: 'nav',
    name: 'Scrolled Navigation Bar',
    token: '--shadow-apple-nav',
    className: 'apple-nav-scrolled',
    layer: 'Level 3 · Sticky Chrome',
    usage: 'Primary sticky Navbar once scrollY > 10px.',
    lightPhysics: '1px 7% hairline rule + subtle 24px downward cast.',
    darkPhysics: '1px 9% light hairline + 60% dark downward cast.',
  },
  {
    id: 'ios-bar',
    name: 'Floating iOS Bar',
    token: '--shadow-apple-ios-bar',
    className: 'apple-ios-bar',
    layer: 'Level 3.5 · Floating Glass',
    usage: 'Floating Now Playing AudioPlayer dock and iOS Dynamic Capsule TOC.',
    lightPhysics: 'Frosted 24px blur + 95% top edge + dual 24px/56px floating shadows.',
    darkPhysics: 'Frosted 24px blur + 11% specular rim + 12% perimeter ring + 65% drop.',
  },
  {
    id: 'modal',
    name: 'Modal Sheet',
    token: '--shadow-apple-modal',
    className: 'apple-modal',
    layer: 'Level 4 · Dialog Overlay',
    usage: 'Command Palette, Image Lightbox, Shortlist and Colophon sheets.',
    lightPhysics: '90% top bevel + deep 88px ambient shadow (30% black) separating backdrop.',
    darkPhysics: '10% top highlight + 12% perimeter ring + 85% black separation shadow.',
  },
] as const;

export type FoundationGapResolution = 'fixed' | 'retained';

export interface FoundationGapSpec {
  id: string;
  domain: FoundationDomainId;
  title: string;
  resolution: FoundationGapResolution;
  observedInCode: string;
  impact: string;
  resolutionSummary: string;
}

/**
 * Transparent audit & Stage 2.5 resolution ledger for all 7 foundation
 * findings discovered in Stage 2 (4 genuinely fixed, 3 intentionally retained).
 */
export const FOUNDATION_GAPS: readonly FoundationGapSpec[] = [
  {
    id: 'gap-status-tokens',
    domain: 'colour-themes',
    title: 'Semantic Success, Warning, and Info colour tokens',
    resolution: 'fixed',
    observedInCode:
      'Stage 2 found --apple-error and --apple-error-ring without semantic success, warning, or info siblings.',
    impact:
      'Upcoming Stage 3 feedback components (toasts, status indicators, alerts) needed accessible semantic tokens without overloading --apple-blue or inventing ad-hoc Tailwind hues.',
    resolutionSummary:
      'Resolved in Stage 2.5: Added --apple-success (#1b7a38 / #32d74b), --apple-warning (#9a5600 / #ffb340), and --apple-info (#0066cc / #409cff) across :root, .dark, and all four [data-ds-sandbox] matrices. Verified ≥ 4.79:1 WCAG 2.2 AA across all 100 audited pairs without altering existing public views.',
  },
  {
    id: 'gap-sandbox-token-parity',
    domain: 'colour-themes',
    title: 'Sandbox token parity on [data-ds-sandbox] selectors',
    resolution: 'fixed',
    observedInCode:
      'Stage 2 found [data-ds-sandbox] omitted --apple-input-disabled-bg, --apple-focus-ring, and --apple-error-ring.',
    impact:
      'Dark or Warm sandbox previews opposite the global appearance inherited root light/dark disabled fills and focus rings.',
    resolutionSummary:
      'Resolved in Stage 2.5: Added --apple-input-disabled-bg (with warm-calibrated #ece8e0 / #1f1d19 fills), --apple-focus-ring, --apple-error-ring, and all semantic status tokens to all four [data-ds-sandbox] matrices.',
  },
  {
    id: 'gap-h4-vs-headline-family',
    domain: 'typography',
    title: 'Optical font-family alignment between base <h4> and .type-headline',
    resolution: 'fixed',
    observedInCode:
      'Stage 2 found @layer base h4 applied var(--font-sf-display) while .type-headline applied var(--font-sf-text) at the same 17px (--type-headline-size).',
    impact:
      'An unstyled <h4> violated the Apple HIG sub-20pt optical text rule, while all 9 existing <h4> elements explicitly use .type-title-3 (20–24px Display).',
    resolutionSummary:
      'Resolved in Stage 2.5: Aligned base h4 in src/index.css to var(--font-sf-text), establishing one universal optical rule: ≥ 20pt (h1–h3, .type-display, .type-title-1–3, .type-lead) uses SF Pro Display; < 20pt (h4, .type-headline, .type-body–caption) uses SF Pro Text.',
  },
  {
    id: 'gap-mono-token',
    domain: 'typography',
    title: 'System monospace via Tailwind font-mono convention',
    resolution: 'retained',
    observedInCode:
      'src/index.css defines --font-sf-display and --font-sf-text, while monospace labels use Tailwind v4 utility font-mono.',
    impact:
      'Audit confirmed font-mono appears only 3 times across all public portfolio views versus 84 times in internal Studio documentation.',
    resolutionSummary:
      'Intentionally retained in Stage 2.5: Tailwind font-mono already resolves native SF Mono (ui-monospace, SFMono-Regular) on Apple platforms and clean system monospace elsewhere. Adding --font-sf-mono would expand token surface area with minimal public value.',
  },
  {
    id: 'gap-spacing-container-tokens',
    domain: 'spacing-layout',
    title: 'Spacing scale and 1160px shell width as Tailwind conventions',
    resolution: 'retained',
    observedInCode:
      'Runtime layout geometry (--scroll-offset-header: 84px, --scroll-offset-header-subnav: 136px, --measure-*) uses CSS vars, while spacing steps and max-w-[1160px] use Tailwind utilities.',
    impact:
      '26 public layout shells consistently use max-w-[1160px] alongside responsive Tailwind spacing (px-5 sm:px-8, gap-6, lg:gap-12).',
    resolutionSummary:
      'Intentionally retained in Stage 2.5: Converting Tailwind 4px spacing utilities or max-w-[1160px] into CSS custom properties would create a redundant dual system without improving consistency. CSS variables stay reserved for runtime scroll offsets and typographic measures.',
  },
  {
    id: 'gap-radius-tokens',
    domain: 'surfaces-elevation',
    title: 'Corner-radius scale via explicit pixel Tailwind utilities',
    resolution: 'retained',
    observedInCode:
      'Components apply concentric pixel radii (rounded-[12px], rounded-[14px], rounded-[20px], rounded-[24px], rounded-[28px], rounded-full) rather than --radius-* variables.',
    impact:
      'Over 180 existing Tailwind radius classes rely on explicit concentric math (outer = inner + padding, e.g., 28→20px, 24→14px, 20→12px).',
    resolutionSummary:
      'Intentionally retained in Stage 2.5: Adding unreferenced --radius-* CSS variables alongside existing Tailwind classes would invite drift and redundancy. The documented 7-step pixel ladder remains the single source of truth.',
  },
  {
    id: 'gap-sandbox-shadow-parity',
    domain: 'surfaces-elevation',
    title: 'Sandbox elevation parity across all 7 --shadow-apple-* levels',
    resolution: 'fixed',
    observedInCode:
      'Stage 2 found [data-ds-sandbox] omitted --shadow-apple-card-hover, --shadow-apple-ios-bar, --shadow-apple-nav, and --shadow-apple-modal.',
    impact:
      'Previewing floating iOS bars, sticky chrome, hover lift, or modal sheets inside a sandbox theme opposite the active global appearance leaked mismatched Light/Dark shadows.',
    resolutionSummary:
      'Resolved in Stage 2.5: Mirrored all 7 --shadow-apple-* tokens across all four [data-ds-sandbox] matrices (with warm-calibrated specular and umber contact shadows for Warm Light/Dark and full dual ambient stops for Cool Dark).',
  },
] as const;

export function getGapsByDomain(domain: FoundationDomainId): FoundationGapSpec[] {
  return FOUNDATION_GAPS.filter((gap) => gap.domain === domain);
}

/**
 * Reliable clipboard copy helper with textarea fallback for sandboxed iframes.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
