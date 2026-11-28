import type { BookHotspot, BookStickerConfig } from './types';

export interface GeneratedBookAssets {
  pageWidth: number;
  pageHeight: number;
  glossAlpha: number;
  coverBare: string;
  coverSticker: BookStickerConfig;
  sidesSpread: string[];
  sidesSingle: string[];
  backCover: string;
  hotspots: BookHotspot[];
}

export type BookCoverColorId =
  | 'charcoal-noir'
  | 'espresso-brown'
  | 'fawn'
  | 'saddle-tan'
  | 'oxblood'
  | 'forest-cloth'
  | 'midnight-navy'
  | 'raw-linen'
  | 'custom';

export type BookCoverTexture = 'leatherette' | 'suede' | 'linen' | 'smooth';
export type BookFoilStyle = 'auto' | 'gold' | 'copper' | 'silver' | 'blind';
export type BookCoverFrame = 'none' | 'debossed-rule' | 'corner-ornaments';
export type BookPaperTone = 'warm-cream' | 'aged-vellum' | 'crisp-ivory';
export type BookPageRuling = 'dot-grid' | 'lined' | 'blank';
export type BookStickerAccent = 'vermilion' | 'espresso' | 'cobalt' | 'forest' | 'ochre';

export interface BookCoverPreset {
  id: Exclude<BookCoverColorId, 'custom'>;
  label: string;
  note: string;
  swatch: string;
  stops: readonly [string, string, string];
  isLight: boolean;
}

export const BOOK_COVER_PRESETS: readonly BookCoverPreset[] = [
  {
    id: 'espresso-brown',
    label: 'Deep Brown',
    note: 'Rich roasted espresso mahogany',
    swatch: '#362015',
    stops: ['#472b1c', '#331d13', '#1f110a'],
    isLight: false,
  },
  {
    id: 'fawn',
    label: 'Fawn',
    note: 'Warm buckskin & soft tan suede',
    swatch: '#c4a480',
    stops: ['#d2b594', '#bf9e79', '#a68560'],
    isLight: true,
  },
  {
    id: 'saddle-tan',
    label: 'Saddle Tan',
    note: 'Burnished cognac leather',
    swatch: '#8f5932',
    stops: ['#a66b40', '#8b552f', '#6b3f20'],
    isLight: false,
  },
  {
    id: 'charcoal-noir',
    label: 'Charcoal',
    note: 'Matte studio graphite-black',
    swatch: '#22201f',
    stops: ['#292726', '#1e1d1c', '#141312'],
    isLight: false,
  },
  {
    id: 'oxblood',
    label: 'Oxblood',
    note: 'Deep burgundy archival cloth',
    swatch: '#4a1c24',
    stops: ['#5b232d', '#431820', '#2b0e14'],
    isLight: false,
  },
  {
    id: 'forest-cloth',
    label: 'Forest',
    note: 'British racing pine cloth',
    swatch: '#1e352a',
    stops: ['#264235', '#1b3127', '#11211a'],
    isLight: false,
  },
  {
    id: 'midnight-navy',
    label: 'Navy',
    note: 'Archival Prussian blue',
    swatch: '#1a283d',
    stops: ['#22344e', '#172438', '#0e1726'],
    isLight: false,
  },
  {
    id: 'raw-linen',
    label: 'Raw Linen',
    note: 'Unbleached oatmeal cloth',
    swatch: '#d6ccb9',
    stops: ['#e5ddd0', '#d6cbb8', '#c2b59f'],
    isLight: true,
  },
];

export const BOOK_STICKER_ACCENTS: Record<
  BookStickerAccent,
  { label: string; hex: string; shadowHex: string }
> = {
  vermilion: { label: 'Vermilion', hex: '#ef5343', shadowHex: 'rgba(185,28,28,0.14)' },
  espresso: { label: 'Espresso', hex: '#4a2c1d', shadowHex: 'rgba(28,14,8,0.18)' },
  cobalt: { label: 'Cobalt', hex: '#1d56c9', shadowHex: 'rgba(18,55,133,0.16)' },
  forest: { label: 'Forest', hex: '#23533f', shadowHex: 'rgba(12,38,27,0.18)' },
  ochre: { label: 'Ochre', hex: '#b8762c', shadowHex: 'rgba(115,66,14,0.16)' },
};

export interface BookCustomizationConfig {
  coverColor: BookCoverColorId;
  customCoverHex: string;
  coverTexture: BookCoverTexture;
  foilStyle: BookFoilStyle;
  coverFrame: BookCoverFrame;
  paperTone: BookPaperTone;
  pageRuling: BookPageRuling;
  showSticker: boolean;
  stickerAccent: BookStickerAccent;
  stickerRotation: number;
  stickerName: string;
  coverCaption: string;
  backImprint: string;
  collapsedWidth: number;
}

export const DEFAULT_BOOK_CUSTOMIZATION: BookCustomizationConfig = {
  coverColor: 'espresso-brown',
  customCoverHex: '#3b2418',
  coverTexture: 'leatherette',
  foilStyle: 'auto',
  coverFrame: 'none',
  paperTone: 'crisp-ivory',
  pageRuling: 'lined',
  showSticker: true,
  stickerAccent: 'vermilion',
  stickerRotation: -2.5,
  stickerName: 'Aarav',
  coverCaption: 'Field Notes & Craft',
  backImprint: 'AARAV SEN · FIELD JOURNAL',
  collapsedWidth: 260,
};

export interface PlaceholderBookOptions extends Partial<BookCustomizationConfig> {
  email?: string;
  githubHref?: string;
}

const W = 840;
const H = 1120;
const LOGICAL_W = 420;
const LOGICAL_H = 560;
const GLOSS_ALPHA = 160;

const TRANSPARENT_1X1_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function makeCanvas(w = W, h = H): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHexColor(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return [r, g, b];
    }
  } else if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return [r, g, b];
    }
  }
  return [59, 36, 24];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => clampByte(v).toString(16).padStart(2, '0'))
    .join('')}`;
}

function resolveCoverPalette(
  coverColor: BookCoverColorId,
  customCoverHex: string,
): { stops: readonly [string, string, string]; isLight: boolean } {
  if (coverColor !== 'custom') {
    const preset = BOOK_COVER_PRESETS.find((p) => p.id === coverColor);
    if (preset) {
      return { stops: preset.stops, isLight: preset.isLight };
    }
  }
  const [r, g, b] = parseHexColor(customCoverHex);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const lightStop = rgbToHex(r * 1.14 + 10, g * 1.14 + 9, b * 1.14 + 8);
  const midStop = rgbToHex(r, g, b);
  const darkStop = rgbToHex(r * 0.72, g * 0.72, b * 0.72);
  return {
    stops: [lightStop, midStop, darkStop],
    isLight: lum > 0.56,
  };
}

function resolveFoilColors(
  foilStyle: BookFoilStyle,
  isLightCover: boolean,
): { primary: string; muted: string; rule: string; highlight?: string } {
  switch (foilStyle) {
    case 'gold':
      return {
        primary: 'rgba(224, 192, 128, 0.92)',
        muted: 'rgba(224, 192, 128, 0.62)',
        rule: 'rgba(224, 192, 128, 0.44)',
      };
    case 'copper':
      return {
        primary: 'rgba(218, 150, 114, 0.92)',
        muted: 'rgba(218, 150, 114, 0.62)',
        rule: 'rgba(218, 150, 114, 0.44)',
      };
    case 'silver':
      return {
        primary: 'rgba(226, 230, 238, 0.9)',
        muted: 'rgba(226, 230, 238, 0.58)',
        rule: 'rgba(226, 230, 238, 0.4)',
      };
    case 'blind':
      return isLightCover
        ? {
            primary: 'rgba(54, 38, 24, 0.46)',
            muted: 'rgba(54, 38, 24, 0.34)',
            rule: 'rgba(54, 38, 24, 0.24)',
            highlight: 'rgba(255, 255, 255, 0.24)',
          }
        : {
            primary: 'rgba(0, 0, 0, 0.52)',
            muted: 'rgba(0, 0, 0, 0.42)',
            rule: 'rgba(0, 0, 0, 0.36)',
            highlight: 'rgba(255, 255, 255, 0.08)',
          };
    case 'auto':
    default:
      return isLightCover
        ? {
            primary: 'rgba(46, 33, 22, 0.82)',
            muted: 'rgba(46, 33, 22, 0.54)',
            rule: 'rgba(46, 33, 22, 0.28)',
          }
        : {
            primary: 'rgba(245, 243, 239, 0.84)',
            muted: 'rgba(214, 211, 209, 0.48)',
            rule: 'rgba(245, 243, 239, 0.22)',
          };
  }
}

function drawPaperBase(
  ctx: CanvasRenderingContext2D,
  side: 'left' | 'right',
  pageNum: number | undefined,
  paperTone: BookPaperTone,
  pageRuling: BookPageRuling,
) {
  const palette =
    paperTone === 'aged-vellum'
      ? ['#e8decb', '#f4ecdc', '#f6efe0', '#ede2ce']
      : paperTone === 'crisp-ivory'
        ? ['#f0f0ee', '#fbfbfa', '#fdfdfc', '#f5f5f3']
        : ['#eeece6', '#f8f6f1', '#faf8f4', '#f3f0ea'];

  const grad = ctx.createLinearGradient(
    side === 'right' ? 0 : W,
    0,
    side === 'right' ? W : 0,
    0,
  );
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(0.06, palette[1]);
  grad.addColorStop(0.94, palette[2]);
  grad.addColorStop(1, palette[3]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle paper fibers / grain
  ctx.fillStyle =
    paperTone === 'aged-vellum'
      ? 'rgba(120, 96, 68, 0.045)'
      : 'rgba(120, 113, 108, 0.035)';
  for (let i = 0; i < 450; i++) {
    const x = (Math.sin(i * 97.3) * 0.5 + 0.5) * W;
    const y = (Math.cos(i * 43.1) * 0.5 + 0.5) * H;
    ctx.fillRect(x, y, 2, 2);
  }

  // Page ruling
  if (pageRuling === 'dot-grid') {
    ctx.fillStyle = 'rgba(168, 162, 158, 0.16)';
    for (let gx = 64; gx < W - 40; gx += 36) {
      for (let gy = 64; gy < H - 40; gy += 36) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pageRuling === 'lined') {
    ctx.strokeStyle = 'rgba(150, 142, 134, 0.15)';
    ctx.lineWidth = 1.5;
    for (let gy = 104; gy < H - 80; gy += 42) {
      ctx.beginPath();
      ctx.moveTo(64, gy);
      ctx.lineTo(W - 64, gy);
      ctx.stroke();
    }
  }

  if (pageNum !== undefined) {
    ctx.fillStyle = '#a8a29e';
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.textAlign = side === 'left' ? 'left' : 'right';
    ctx.fillText(
      String(pageNum).padStart(2, '0'),
      side === 'left' ? 56 : W - 56,
      H - 44,
    );
    ctx.textAlign = 'left';
  }
}

function drawCoverBase(
  ctx: CanvasRenderingContext2D,
  isBack: boolean,
  cfg: BookCustomizationConfig,
) {
  const { stops, isLight } = resolveCoverPalette(cfg.coverColor, cfg.customCoverHex);
  const foil = resolveFoilColors(cfg.foilStyle, isLight);

  // Directional bookbinding board gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, stops[0]);
  grad.addColorStop(0.5, stops[1]);
  grad.addColorStop(1, stops[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle ambient warm sheen across upper-left
  const sheen = ctx.createRadialGradient(
    W * 0.28,
    H * 0.22,
    24,
    W * 0.32,
    H * 0.28,
    W * 0.9,
  );
  sheen.addColorStop(0, isLight ? 'rgba(255,255,255,0.14)' : 'rgba(255,248,238,0.06)');
  sheen.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Material surface texture
  if (cfg.coverTexture === 'leatherette') {
    for (let i = 0; i < 950; i++) {
      const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * W;
      const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * H;
      ctx.fillStyle =
        i % 2 === 0
          ? isLight
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.022)'
          : isLight
            ? 'rgba(60,38,18,0.055)'
            : 'rgba(0,0,0,0.09)';
      ctx.fillRect(x, y, 3, 3);
    }
  } else if (cfg.coverTexture === 'suede') {
    // Velvety micro-nap grain ideal for Deep Brown & Fawn
    for (let i = 0; i < 2400; i++) {
      const x = (Math.sin(i * 19.317) * 0.5 + 0.5) * W;
      const y = (Math.cos(i * 61.711) * 0.5 + 0.5) * H;
      const r = 1.2 + (i % 3) * 0.8;
      ctx.fillStyle =
        i % 3 === 0
          ? isLight
            ? 'rgba(255,250,244,0.065)'
            : 'rgba(255,244,230,0.025)'
          : isLight
            ? 'rgba(72,46,24,0.04)'
            : 'rgba(0,0,0,0.065)';
      ctx.fillRect(x, y, r, r);
    }
  } else if (cfg.coverTexture === 'linen') {
    // Archival woven cloth cross-hatch
    ctx.strokeStyle = isLight ? 'rgba(65, 48, 30, 0.045)' : 'rgba(255, 255, 255, 0.028)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.07)';
    for (let y = 0; y < H; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  // Spine indentation groove along binding edge
  const spineX = isBack ? W - 40 : 0;
  const spineGrad = ctx.createLinearGradient(spineX, 0, spineX + 40, 0);
  if (isBack) {
    spineGrad.addColorStop(0, 'rgba(0,0,0,0)');
    spineGrad.addColorStop(0.52, isLight ? 'rgba(60,38,18,0.22)' : 'rgba(0,0,0,0.45)');
    spineGrad.addColorStop(0.75, isLight ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)');
    spineGrad.addColorStop(1, isLight ? 'rgba(60,38,18,0.16)' : 'rgba(0,0,0,0.32)');
  } else {
    spineGrad.addColorStop(0, isLight ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)');
    spineGrad.addColorStop(0.36, isLight ? 'rgba(60,38,18,0.22)' : 'rgba(0,0,0,0.42)');
    spineGrad.addColorStop(0.68, isLight ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)');
    spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  }
  ctx.fillStyle = spineGrad;
  ctx.fillRect(spineX, 0, 40, H);

  // Optional debossed border rule / corner frame on front cover
  if (!isBack && cfg.coverFrame !== 'none') {
    const padL = 78;
    const padR = 54;
    const padY = 58;
    const fw = W - padL - padR;
    const fh = H - padY * 2;

    if (foil.highlight) {
      ctx.strokeStyle = foil.highlight;
      ctx.lineWidth = 2;
      roundRect(ctx, padL + 1.5, padY + 1.5, fw, fh, 14);
      ctx.stroke();
    }

    ctx.strokeStyle = foil.rule;
    ctx.lineWidth = 2;
    roundRect(ctx, padL, padY, fw, fh, 14);
    ctx.stroke();

    if (cfg.coverFrame === 'corner-ornaments') {
      const inset = 14;
      ctx.lineWidth = 1.5;
      roundRect(ctx, padL + inset, padY + inset, fw - inset * 2, fh - inset * 2, 8);
      ctx.stroke();

      // Subtle archival brass/foil corner dots
      const corners = [
        [padL + 26, padY + 26],
        [padL + fw - 26, padY + 26],
        [padL + 26, padY + fh - 26],
        [padL + fw - 26, padY + fh - 26],
      ];
      ctx.fillStyle = foil.muted;
      for (const [cx, cy] of corners) {
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Cover typography / foil stamping
  if (!isBack) {
    ctx.textAlign = 'center';
    if (!cfg.showSticker) {
      // Pure minimalist stamped monogram + title when sticker is disabled
      const titleY = H * 0.44;
      if (foil.highlight) {
        ctx.fillStyle = foil.highlight;
        ctx.font = '400 58px "Newsreader", Georgia, serif';
        ctx.fillText(cfg.coverCaption || 'Field Notes & Craft', W * 0.52 + 1.5, titleY + 1.5);
      }
      ctx.fillStyle = foil.primary;
      ctx.font = '400 58px "Newsreader", Georgia, serif';
      ctx.fillText(cfg.coverCaption || 'Field Notes & Craft', W * 0.52, titleY);

      // Subtle hairline divider
      ctx.strokeStyle = foil.rule;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.52 - 58, titleY + 34);
      ctx.lineTo(W * 0.52 + 58, titleY + 34);
      ctx.stroke();

      ctx.fillStyle = foil.muted;
      ctx.font = '500 22px "Inter", sans-serif';
      ctx.fillText((cfg.stickerName || 'Aarav').toUpperCase(), W * 0.52, titleY + 78);
    } else {
      if (foil.highlight) {
        ctx.fillStyle = foil.highlight;
        ctx.font = '400 31px "Gochi Hand", cursive';
        ctx.fillText(cfg.coverCaption, W * 0.51 + 1.5, H * 0.72 + 1.5);
      }
      ctx.fillStyle = foil.primary;
      ctx.font = '400 31px "Gochi Hand", cursive';
      ctx.fillText(cfg.coverCaption, W * 0.51, H * 0.72);
    }
    ctx.textAlign = 'left';
  } else {
    ctx.textAlign = 'center';
    if (foil.highlight) {
      ctx.fillStyle = foil.highlight;
      ctx.font = '500 22px "Inter", sans-serif';
      ctx.fillText(cfg.backImprint, W * 0.48 + 1.5, H * 0.88 + 1.5);
    }
    ctx.fillStyle = foil.muted;
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.fillText(cfg.backImprint, W * 0.48, H * 0.88);
    ctx.textAlign = 'left';
  }
}

function drawNameStickerCanvas(
  stickerName = 'Aarav',
  stickerAccent: BookStickerAccent = 'vermilion',
): HTMLCanvasElement {
  const sw = 440;
  const sh = Math.round(440 / 1.3631);
  const [c, ctx] = makeCanvas(sw, sh);
  const accent = BOOK_STICKER_ACCENTS[stickerAccent] ?? BOOK_STICKER_ACCENTS.vermilion;

  // Outer white sticker die-cut border
  roundRect(ctx, 8, 8, sw - 16, sh - 16, 28);
  ctx.fillStyle = '#faf9f5';
  ctx.fill();
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner accented header badge
  roundRect(ctx, 22, 22, sw - 44, sh - 44, 18);
  ctx.fillStyle = accent.hex;
  ctx.fill();

  // White name area
  roundRect(ctx, 32, 118, sw - 64, sh - 150, 12);
  ctx.fillStyle = '#fffdf9';
  ctx.fill();

  // Subtle watercolor variation on header
  const rGrad = ctx.createRadialGradient(sw * 0.72, 65, 10, sw * 0.72, 65, 130);
  rGrad.addColorStop(0, 'rgba(255,255,255,0.16)');
  rGrad.addColorStop(1, accent.shadowHex);
  ctx.fillStyle = rGrad;
  roundRect(ctx, 22, 22, sw - 44, 96, 18);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '700 44px "Inter", sans-serif';
  ctx.fillText('HELLO', sw / 2, 74);
  ctx.font = '600 18px "Inter", sans-serif';
  ctx.fillText('my name is', sw / 2, 102);

  ctx.fillStyle = '#1c1917';
  ctx.font = '400 76px "Gochi Hand", cursive';
  ctx.fillText(stickerName, sw / 2, 224);

  return c;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Marks a rectangular region with lower alpha so the WebGL gloss shader catches sunlight on stickers */
function markGlossyStickerRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 16,
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] > GLOSS_ALPHA) d[i] = GLOSS_ALPHA;
  }
  ctx.putImageData(img, x, y);
  ctx.restore();
}

function drawMountainIllustration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 4;
  ctx.stroke();

  roundRect(ctx, x + 16, y + 16, w - 32, h - 32, 16);
  ctx.clip();

  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, '#dbeafe');
  sky.addColorStop(0.55, '#fef3c7');
  sky.addColorStop(1, '#dcfce7');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
  ctx.beginPath();
  ctx.arc(x + w * 0.75, y + h * 0.25, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.72);
  ctx.lineTo(x + w * 0.28, y + h * 0.38);
  ctx.lineTo(x + w * 0.56, y + h * 0.62);
  ctx.lineTo(x + w * 0.82, y + h * 0.34);
  ctx.lineTo(x + w, y + h * 0.58);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#65a30d';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.78);
  ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.62, x + w * 0.68, y + h * 0.76);
  ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.82, x + w, y + h * 0.72);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(28, 25, 23, 0.65)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + h * 0.72);
  ctx.lineTo(x + w * 0.28, y + h * 0.38);
  ctx.lineTo(x + w * 0.56, y + h * 0.62);
  ctx.lineTo(x + w * 0.82, y + h * 0.34);
  ctx.stroke();

  ctx.restore();
  markGlossyStickerRect(ctx, x, y, w, h, 24);
}

function drawBridgeIllustration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 4;
  ctx.stroke();

  roundRect(ctx, x + 16, y + 16, w - 32, h - 32, 16);
  ctx.clip();

  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, '#f1f5f9');
  sky.addColorStop(0.65, '#ffe4e6');
  sky.addColorStop(1, '#bae6fd');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(x, y + h * 0.68, w, h * 0.32);

  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 8;
  const t1 = x + w * 0.32;
  const t2 = x + w * 0.74;
  ctx.beginPath();
  ctx.moveTo(t1, y + h * 0.22);
  ctx.lineTo(t1, y + h * 0.74);
  ctx.moveTo(t2, y + h * 0.34);
  ctx.lineTo(t2, y + h * 0.74);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.6);
  ctx.lineTo(x + w, y + h * 0.62);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.56);
  ctx.quadraticCurveTo(x + w * 0.16, y + h * 0.48, t1, y + h * 0.22);
  ctx.quadraticCurveTo(x + w * 0.53, y + h * 0.58, t2, y + h * 0.34);
  ctx.quadraticCurveTo(x + w * 0.88, y + h * 0.5, x + w, y + h * 0.58);
  ctx.stroke();

  ctx.restore();
  markGlossyStickerRect(ctx, x, y, w, h, 24);
}

function drawNoteCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lines: string[],
  tiltDeg = -2,
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((tiltDeg * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, 0, 0, w, h, 14);
  ctx.fillStyle = '#fffef9';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#292524';
  ctx.font = '400 26px "Gochi Hand", cursive';
  lines.forEach((line, idx) => {
    ctx.fillText(line, 34, 62 + idx * 44);
  });
  ctx.restore();
}

function drawGeometricBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  label: string,
  color: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.14;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = color;
  ctx.font = '700 28px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
  ctx.restore();
}

function renderTextBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  startY: number,
  paragraphs: string[],
) {
  ctx.fillStyle = '#44403c';
  ctx.font = '400 28px "Gochi Hand", cursive';
  let y = startY;
  for (const p of paragraphs) {
    if (p === '') {
      y += 26;
      continue;
    }
    ctx.fillText(p, x, y);
    y += 42;
  }
}

export function generatePlaceholderBookAssets(
  options: PlaceholderBookOptions = {},
): GeneratedBookAssets {
  const cfg: BookCustomizationConfig = {
    ...DEFAULT_BOOK_CUSTOMIZATION,
    ...options,
  };
  const email = options.email ?? 'hello@aaravsen.design';
  const githubHref = options.githubHref ?? 'https://github.com';

  const stickerCanvas = cfg.showSticker
    ? drawNameStickerCanvas(cfg.stickerName, cfg.stickerAccent)
    : null;
  const stickerDataUrl = stickerCanvas
    ? stickerCanvas.toDataURL('image/png')
    : TRANSPARENT_1X1_PNG;

  // 1. Bare Cover
  const [bareCanvas, bareCtx] = makeCanvas();
  drawCoverBase(bareCtx, false, cfg);
  const coverBare = bareCanvas.toDataURL('image/png');

  // 2. Composited Front Cover (bare + optional sticker baked in)
  const [frontCanvas, frontCtx] = makeCanvas();
  frontCtx.drawImage(bareCanvas, 0, 0);
  if (stickerCanvas) {
    frontCtx.save();
    frontCtx.translate(W * 0.5, H * 0.5);
    frontCtx.rotate((-cfg.stickerRotation * Math.PI) / 180);
    const sw = W * 0.5;
    const sh = sw / 1.3631;
    frontCtx.drawImage(stickerCanvas, -sw / 2, -sh / 2, sw, sh);
    frontCtx.restore();
  }
  const side0 = frontCanvas.toDataURL('image/png');

  // 3. Back Cover
  const [backCanvas, backCtx] = makeCanvas();
  drawCoverBase(backCtx, true, cfg);
  const backCover = backCanvas.toDataURL('image/png');

  // Helper to build an interior page
  const buildPage = (
    side: 'left' | 'right',
    pageNum: number | undefined,
    paint: (ctx: CanvasRenderingContext2D) => void,
  ) => {
    const [c, ctx] = makeCanvas();
    drawPaperBase(ctx, side, pageNum, cfg.paperTone, cfg.pageRuling);
    paint(ctx);
    return c.toDataURL('image/png');
  };

  // Spread 1 (inside front cover + page 1)
  const side1 = buildPage('left', undefined, (ctx) => {
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 2;
    roundRect(ctx, 110, 160, W - 220, 320, 16);
    ctx.stroke();
    ctx.fillStyle = '#78716c';
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EX LIBRIS', W / 2, 235);
    ctx.fillStyle = '#292524';
    ctx.font = '400 46px "Gochi Hand", cursive';
    ctx.fillText(cfg.coverCaption || 'Field Notes & Craft', W / 2, 325);
    ctx.fillStyle = '#78716c';
    ctx.font = '400 24px "Gochi Hand", cursive';
    ctx.fillText(`${cfg.stickerName} · Bengaluru`, W / 2, 390);
    ctx.textAlign = 'left';
  });

  const side2 = buildPage('right', 1, (ctx) => {
    ctx.fillStyle = '#1c1917';
    ctx.font = '400 54px "Newsreader", Georgia, serif';
    ctx.fillText('Chapter I', 84, 150);
    ctx.fillStyle = '#78716c';
    ctx.font = '400 24px "Inter", sans-serif';
    ctx.fillText('BEGINNINGS & CURIOSITY', 84, 194);

    renderTextBlock(ctx, 84, 290, [
      'Every interface starts on paper.',
      'A quick sketch in the margins,',
      'a question about how it feels',
      'when your hand reaches for it.',
      '',
      'This journal captures that tactile',
      'moment in real-time WebGL2:',
      '• Soft spine rise & paper curl',
      '• Sunlight sheen on stickers',
      '• Spring-physics drag & flick',
    ]);

    drawNoteCard(
      ctx,
      110,
      740,
      560,
      220,
      [
        '"Design is not just what it looks',
        'like — it is how it responds when',
        'you gently tug the corner."',
      ],
      -1.8,
    );
  });

  // Spread 2 (pages 2-3)
  const side3 = buildPage('left', 2, (ctx) => {
    drawMountainIllustration(ctx, 84, 110, W - 168, 520);
    ctx.fillStyle = '#57534e';
    ctx.font = '400 29px "Gochi Hand", cursive';
    ctx.fillText('Morning Ridge — Sketchbook Study', 96, 690);
    renderTextBlock(ctx, 84, 770, [
      'Notice how tilting or turning the page',
      'catches a subtle specular sheen across',
      'the glossy illustration sticker above.',
    ]);
  });

  const side4 = buildPage('right', 3, (ctx) => {
    renderTextBlock(ctx, 84, 140, [
      'Notes from the studio:',
      '',
      '1. Drag any corner horizontally or',
      '   diagonally to curl the sheet.',
      '',
      '2. Press & hold on either side to',
      '   riffle smoothly through pages.',
      '',
      '3. Use Arrow Left / Right or Esc',
      '   when reading in spread mode.',
    ]);
    drawBridgeIllustration(ctx, 84, 590, W - 168, 410);
  });

  // Spread 3 (pages 4-5)
  const side5 = buildPage('left', 4, (ctx) => {
    ctx.fillStyle = '#1c1917';
    ctx.font = '400 48px "Newsreader", Georgia, serif';
    ctx.fillText('Interaction Physics', 84, 150);
    renderTextBlock(ctx, 84, 240, [
      'Each sheet uses a custom vertex shader',
      'with 64×32 subdivisions concentrated',
      'along the spine so paper bends cleanly',
      'without sharp polygon creases.',
      '',
      'Adjacent pages stack with subtle z-depth',
      'and cast real-time PCF shadows onto',
      'the pages beneath.',
    ]);
    drawGeometricBadge(ctx, 220, 760, 96, '64×32', '#2563eb');
    drawGeometricBadge(ctx, 440, 760, 96, 'GLSL', '#ea580c');
    drawGeometricBadge(ctx, 660, 760, 96, '60FPS', '#16a34a');
  });

  const side6 = buildPage('right', 5, (ctx) => {
    drawNoteCard(
      ctx,
      90,
      120,
      620,
      260,
      [
        'Practice Principles:',
        '• Clarity before visual ornament',
        '• Systems tested on real data',
        '• Interruptible, physical motion',
        '• Designing directly in code',
      ],
      1.5,
    );
    renderTextBlock(ctx, 84, 480, [
      'Across product workflows, audio tools,',
      'and experimental camera interfaces,',
      'the craft stays the same:',
      '',
      'Reduce friction until the software',
      'feels quiet, dependable, and alive',
      'under your fingertips.',
    ]);
  });

  // Spread 4 (pages 6-7)
  const side7 = buildPage('left', 6, (ctx) => {
    drawBridgeIllustration(ctx, 84, 110, W - 168, 440);
    renderTextBlock(ctx, 84, 620, [
      'Bay Crossing — Walking Sketch',
      '',
      'Walking photography, industrial design',
      'monographs, and quiet architectural',
      'spaces feed back into screen rhythm.',
    ]);
  });

  const side8 = buildPage('right', 7, (ctx) => {
    ctx.fillStyle = '#1c1917';
    ctx.font = '400 48px "Newsreader", Georgia, serif';
    ctx.fillText('Responsive Modes', 84, 150);
    renderTextBlock(ctx, 84, 240, [
      'Desktop (> 640px):',
      'Opens as a full two-page spread with',
      'gutter glow, spine shadow, and hover',
      'corner peek.',
      '',
      'Mobile (≤ 640px):',
      'Automatically switches to single-page',
      'flipbook mode with spine curl & skew',
      'so every illustration stays legible.',
    ]);
  });

  // Spread 5 (pages 8-9 — Interactive Hotspots page!)
  const side9 = buildPage('left', 8, (ctx) => {
    drawMountainIllustration(ctx, 84, 140, W - 168, 480);
    drawNoteCard(
      ctx,
      110,
      680,
      580,
      240,
      [
        'Thanks for flipping through.',
        'Turn to the last page to test',
        'interactive clickable hotspots →',
      ],
      -1.2,
    );
  });

  const side10 = buildPage('right', 9, (ctx) => {
    ctx.fillStyle = '#1c1917';
    ctx.font = '400 50px "Newsreader", Georgia, serif';
    ctx.fillText('Get in Touch', 84, 160);
    renderTextBlock(ctx, 84, 240, [
      'Hotspots are mapped in normalized',
      'page coordinates [0..1] and stay',
      'clickable right on the 3D mesh.',
      '',
      'Try clicking any link below:',
    ]);

    const links = [
      { label: `✉  Copy ${email}`, yNorm: 0.48125, wNorm: 0.72 },
      { label: '↗  View Three.js Docs', yNorm: 0.56, wNorm: 0.72 },
      { label: '↗  Explore GitHub Profile', yNorm: 0.63875, wNorm: 0.72 },
    ];
    for (const item of links) {
      const rx = W * 0.1;
      const ry = H * item.yNorm;
      const rw = W * item.wNorm;
      const rh = H * 0.058;
      roundRect(ctx, rx, ry, rw, rh, 14);
      ctx.fillStyle = '#f5f5f4';
      ctx.fill();
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#1c1917';
      ctx.font = '500 25px "Inter", sans-serif';
      ctx.fillText(item.label, rx + 24, ry + 41);
    }
  });

  const sidesSpread = [
    side0,
    side1,
    side2,
    side3,
    side4,
    side5,
    side6,
    side7,
    side8,
    side9,
    side10,
    backCover,
  ];
  const sidesSingle = [
    side0,
    side1,
    side2,
    side3,
    side4,
    side5,
    side6,
    side7,
    side8,
    side9,
    side10,
  ];

  const hotspots: BookHotspot[] = [
    { side: 10, x: 0.1, y: 0.48125, width: 0.72, height: 0.058, action: 'copy-email', label: 'Copy email' },
    { side: 10, x: 0.1, y: 0.56, width: 0.72, height: 0.058, href: 'https://threejs.org/', label: 'Three.js Docs' },
    { side: 10, x: 0.1, y: 0.63875, width: 0.72, height: 0.058, href: githubHref, label: 'GitHub' },
  ];

  return {
    pageWidth: LOGICAL_W,
    pageHeight: LOGICAL_H,
    glossAlpha: GLOSS_ALPHA,
    coverBare,
    coverSticker: {
      src: stickerDataUrl,
      x: 0.5,
      y: 0.5,
      width: cfg.showSticker ? 0.5 : 0.001,
      aspect: 1.3631436314363143,
      rotation: cfg.stickerRotation,
    },
    sidesSpread,
    sidesSingle,
    backCover,
    hotspots,
  };
}
