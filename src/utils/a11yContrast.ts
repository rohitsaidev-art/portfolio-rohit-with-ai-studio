/**
 * WCAG 2.2 Color Contrast Verification Utility (P3.1).
 * Computes exact sRGB relative luminance and contrast ratios across
 * Cool/Warm and Light/Dark design tokens so AA compliance (4.5:1 normal text,
 * 3:1 large text / UI graphics) can be deterministically verified in tests.
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function parseHexColor(hex: string): RgbColor {
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  throw new Error(`Invalid hex color: ${hex}`);
}

function srgbChannelToLinear(channel255: number): number {
  const s = channel255 / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHexColor(hex);
  const R = srgbChannelToLinear(r);
  const G = srgbChannelToLinear(g);
  const B = srgbChannelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ThemeContrastPalette {
  id: 'cool-light' | 'cool-dark' | 'warm-light' | 'warm-dark';
  bgPrimary: string;
  bgSecondary: string;
  surfaceElevated: string;
  labelPrimary: string;
  labelSecondary: string;
  labelTertiary: string;
  link: string;
  buttonFill: string;
  buttonText: string;
  success: string;
  warning: string;
  info: string;
  error: string;
}

/**
 * Mirrors the exact semantic color tokens in src/index.css across all 4 theme
 * matrices (Production Cool Light/Dark + Workshop Warm Light/Dark).
 */
export const VERIFIED_THEME_PALETTES: readonly ThemeContrastPalette[] = [
  {
    id: 'cool-light',
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f7',
    surfaceElevated: '#ffffff',
    labelPrimary: '#1d1d1f',
    labelSecondary: '#58585d',
    labelTertiary: '#6a6a70',
    link: '#0066cc',
    buttonFill: '#0071e3',
    buttonText: '#ffffff',
    success: '#1b7a38',
    warning: '#9a5600',
    info: '#0066cc',
    error: '#c62828',
  },
  {
    id: 'cool-dark',
    bgPrimary: '#0b0b0d',
    bgSecondary: '#151518',
    surfaceElevated: '#1c1c20',
    labelPrimary: '#f5f5f7',
    labelSecondary: '#a1a1a6',
    labelTertiary: '#8e8e93',
    link: '#409cff',
    buttonFill: '#0071e3',
    buttonText: '#ffffff',
    success: '#32d74b',
    warning: '#ffb340',
    info: '#409cff',
    error: '#ff6961',
  },
  {
    id: 'warm-light',
    bgPrimary: '#fbfaf7',
    bgSecondary: '#f3f1ec',
    surfaceElevated: '#fefdf9',
    labelPrimary: '#1f1e1b',
    labelSecondary: '#57534b',
    labelTertiary: '#666259',
    link: '#0066cc',
    buttonFill: '#0071e3',
    buttonText: '#ffffff',
    success: '#1b7a38',
    warning: '#9a5600',
    info: '#0066cc',
    error: '#c62828',
  },
  {
    id: 'warm-dark',
    bgPrimary: '#12110f',
    bgSecondary: '#1b1916',
    surfaceElevated: '#211f1b',
    labelPrimary: '#f4f1ea',
    labelSecondary: '#aba59b',
    labelTertiary: '#969086',
    link: '#409cff',
    buttonFill: '#0071e3',
    buttonText: '#ffffff',
    success: '#32d74b',
    warning: '#ffb340',
    info: '#409cff',
    error: '#ff6961',
  },
] as const;

export interface ContrastAuditCheck {
  theme: ThemeContrastPalette['id'];
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
}

export function auditThemeContrast(
  palettes: readonly ThemeContrastPalette[] = VERIFIED_THEME_PALETTES,
): ContrastAuditCheck[] {
  const checks: ContrastAuditCheck[] = [];

  for (const palette of palettes) {
    const surfaces: [string, string][] = [
      ['bgPrimary', palette.bgPrimary],
      ['bgSecondary', palette.bgSecondary],
      ['surfaceElevated', palette.surfaceElevated],
    ];

    const texts: [string, string][] = [
      ['labelPrimary', palette.labelPrimary],
      ['labelSecondary', palette.labelSecondary],
      ['labelTertiary', palette.labelTertiary],
      ['link', palette.link],
      ['success', palette.success],
      ['warning', palette.warning],
      ['info', palette.info],
      ['error', palette.error],
    ];

    for (const [textName, fg] of texts) {
      for (const [surfaceName, bg] of surfaces) {
        const ratio = contrastRatio(fg, bg);
        checks.push({
          theme: palette.id,
          pair: `${textName} on ${surfaceName}`,
          foreground: fg,
          background: bg,
          ratio: Math.round(ratio * 100) / 100,
          passesAA: ratio >= 4.5,
        });
      }
    }

    const btnRatio = contrastRatio(palette.buttonText, palette.buttonFill);
    checks.push({
      theme: palette.id,
      pair: 'buttonText on buttonFill',
      foreground: palette.buttonText,
      background: palette.buttonFill,
      ratio: Math.round(btnRatio * 100) / 100,
      passesAA: btnRatio >= 4.5,
    });
  }

  return checks;
}
