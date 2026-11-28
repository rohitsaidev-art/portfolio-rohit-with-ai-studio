export const COPIER_DESK_W = 420;
export const COPIER_DESK_H = 640;

const DPR_SCALE = 3;
const ORIG_W = 250;
const ORIG_H = 92;
const COPY_W = 280;
const COPY_H = 108;
const COPY_PAD_X = 15;
const COPY_PAD_Y = 8;
const GLASS_W = 374;
const GLASS_H = 136;

export interface ResolvedFont {
  family: string;
  weight: number | string;
  style: string;
}

export interface CopierEngineConfig {
  label: string;
  value: string;
  mark: string;
  accent: [number, number, number];
  paper: [number, number, number];
  ink: [number, number, number];
  live: boolean;
  canvasState: 'rest' | 'tray';
  keepCopies: boolean;
  reduced: () => boolean;
  sound: () => boolean;
  haptics: () => boolean;
  onCopy?: () => void;
  valueFont: ResolvedFont;
  labelFont: ResolvedFont;
}

const LCD_GLYPHS: Record<string, string> = {
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 10001 11001 10101 10011 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  W: '10001 10001 10001 10101 10101 10101 01010',
  Y: '10001 10001 01010 00100 00100 00100 00100',
  '✓': '00000 00001 00001 00010 10100 01000 00000',
  ' ': '00000 00000 00000 00000 00000 00000 00000',
};

const LCD_SPEC = { cols: 63, rows: 7, pitch: 2.5, w: 162, h: 32 };
const reliefCache = new Map<string, Float32Array>();

export function parseRgb(input: string | undefined, fallback: [number, number, number]): [number, number, number] {
  if (!input) return fallback;
  let s = String(input).trim();
  const varMatch = s.match(/^var\([^,]+,\s*(.+)\)$/);
  if (varMatch) s = varMatch[1];
  const rgbMatch = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (rgbMatch) return [+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]];
  const hexMatch = s.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length < 6) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  return fallback;
}

export function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function rgbaStr(c: [number, number, number], alpha = 1): string {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`;
}

export function luminance(c: [number, number, number]): number {
  return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

function setCanvasCssSize(c: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
  return c;
}

function drawCanvasToEl(target: HTMLCanvasElement, src: HTMLCanvasElement, w: number, h: number) {
  target.width = src.width;
  target.height = src.height;
  setCanvasCssSize(target, w, h);
  target.getContext('2d')!.drawImage(src, 0, 0);
}

function wrapWithBleed(src: HTMLCanvasElement, w: number, h: number, bleed = 2): HTMLCanvasElement {
  const c = makeCanvas(src.width + bleed * 2 * DPR_SCALE, src.height + bleed * 2 * DPR_SCALE);
  c.getContext('2d')!.drawImage(src, bleed * DPR_SCALE, bleed * DPR_SCALE);
  c.style.cssText = `position:absolute;left:${-bleed}px;top:${-bleed}px;width:${w + bleed * 2}px;height:${h + bleed * 2}px;max-width:none`;
  return c;
}

function valueNoise(w: number, h: number, cellSize: number, rand: () => number): Float32Array {
  const gw = Math.ceil(w / cellSize) + 2;
  const gh = Math.ceil(h / cellSize) + 2;
  const grid = new Float32Array(gw * gh).map(() => rand());
  const out = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = x / cellSize;
      const gy = y / cellSize;
      const ix = gx | 0;
      const iy = gy | 0;
      const fx = gx - ix;
      const fy = gy - iy;
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      const v00 = grid[iy * gw + ix];
      const v10 = grid[iy * gw + ix + 1];
      const v01 = grid[(iy + 1) * gw + ix];
      const v11 = grid[(iy + 1) * gw + ix + 1];
      out[y * w + x] = v00 + (v10 - v00) * sx + (v01 - v00) * sy + (v00 - v10 - v01 + v11) * sx * sy;
    }
  }
  return out;
}

function paperBaseNoise(w: number, h: number, seed: number): Float32Array {
  const rand = mulberry32(seed);
  const pw = w * DPR_SCALE;
  const ph = h * DPR_SCALE;
  const n1 = valueNoise(pw, ph, 78, rand);
  const n2 = valueNoise(pw, ph, 24, rand);
  const n3 = valueNoise(pw, ph, 2.5 * DPR_SCALE, rand);
  const out = new Float32Array(pw * ph);
  for (let i = 0; i < out.length; i++) {
    out[i] = n1[i] * 0.45 + n2[i] * 0.35 + n3[i] * 0.2;
  }
  return out;
}

function paperRelief(pw: number, ph: number): Float32Array {
  const key = `${pw}x${ph}`;
  const cached = reliefCache.get(key);
  if (cached) return cached;

  const rand = mulberry32(991);
  const f1 = valueNoise(pw, ph, 1.3 * DPR_SCALE, rand);
  const f2 = valueNoise(pw, ph, 4.5 * DPR_SCALE, rand);
  const hMap = new Float32Array(pw * ph);
  const shade = new Float32Array(pw * ph);

  for (let i = 0; i < hMap.length; i++) {
    hMap[i] = f1[i] * 0.62 + f2[i] * 0.38;
  }
  for (let y = 0, idx = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++, idx++) {
      const dx = hMap[idx + (x < pw - 1 ? 1 : 0)] - hMap[idx - (x > 0 ? 1 : 0)];
      const dy = hMap[idx + (y < ph - 1 ? pw : 0)] - hMap[idx - (y > 0 ? pw : 0)];
      shade[idx] = -(dx * 0.6 + dy * 0.8) * 70;
    }
  }
  reliefCache.set(key, shade);
  return shade;
}

function renderPaperTexture(
  w: number,
  h: number,
  baseColor: [number, number, number],
  noiseField: Float32Array,
  contrast: number,
  seed: number,
  fibers = true,
  reliefScale = 1,
): HTMLCanvasElement {
  const rand = mulberry32(seed);
  const pw = w * DPR_SCALE;
  const ph = h * DPR_SCALE;
  const canvas = makeCanvas(pw, ph);
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(pw, ph);
  const px = imgData.data;
  const relief = paperRelief(pw, ph);

  for (let i = 0, p = 0; i < pw * ph; i++, p += 4) {
    const delta = (noiseField[i] - 0.5) * contrast + relief[i] * reliefScale + (rand() - 0.5) * 6;
    px[p] = baseColor[0] + delta;
    px[p + 1] = baseColor[1] + delta;
    px[p + 2] = baseColor[2] + delta * 0.95;
    px[p + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  if (fibers) {
    ctx.lineCap = 'round';
    for (let i = 0; i < (w * h) / 60; i++) {
      const x = rand() * pw;
      const y = rand() * ph;
      const len = (1.5 + rand() * 5) * DPR_SCALE;
      const ang = rand() * 6.28;
      const bend = (rand() - 0.5) * len * 0.6;
      const x2 = x + Math.cos(ang) * len;
      const y2 = y + Math.sin(ang) * len;
      ctx.strokeStyle =
        rand() < 0.6 ? `rgba(90,82,66,${0.025 + rand() * 0.045})` : `rgba(255,255,252,${0.1 + rand() * 0.14})`;
      ctx.lineWidth = (0.2 + rand() * 0.35) * DPR_SCALE;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo((x + x2) / 2 - Math.sin(ang) * bend, (y + y2) / 2 + Math.cos(ang) * bend, x2, y2);
      ctx.stroke();
    }
  }

  return canvas;
}

function makeGrainDataUrl(size: number, amp: number, seed: number): string {
  const rand = mulberry32(seed);
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rand() - 0.5) * amp;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function makeFoamDataUrl(): string {
  const rand = mulberry32(8);
  const c = makeCanvas(240, 240);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#dedcd6';
  ctx.fillRect(0, 0, 240, 240);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = rand() < 0.5 ? `rgba(0,0,0,${0.03 + rand() * 0.05})` : `rgba(255,255,255,${0.15 + rand() * 0.2})`;
    ctx.beginPath();
    ctx.arc(rand() * 240, rand() * 240, 0.4 + rand() * 1.4, 0, 7);
    ctx.fill();
  }
  return c.toDataURL();
}

function encodeDotMatrix(text: string): boolean[][] {
  const cols: boolean[][] = [];
  for (const ch of text) {
    const rows = (LCD_GLYPHS[ch] || LCD_GLYPHS[' ']).split(' ');
    for (let x = 0; x < 5; x++) {
      cols.push(rows.map((r) => r[x] === '1'));
    }
    cols.push(Array(7).fill(false));
  }
  return cols;
}

function drawSpacedLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
}

export function mountCopierEngine(root: HTMLElement, cfg: CopierEngineConfig): () => void {
  const q = <T extends Element>(sel: string) => root.querySelector(sel) as T;

  const machineEl = q<HTMLDivElement>('.cp-machine');
  const carriageEl = q<HTMLDivElement>('.cp-carriage');
  const beamEl = q<HTMLDivElement>('.cp-beam');
  const beamInEl = q<HTMLDivElement>('.cp-beam-in');
  const origBtn = q<HTMLButtonElement>('.cp-original');
  const startBtn = q<HTMLButtonElement>('.cp-start');
  const srEl = q<HTMLParagraphElement>('.cp-sr');
  const matrixCanvas = q<HTMLCanvasElement>('.cp-matrix');

  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };

  const cleanups: Array<() => void> = [];
  const listen = <K extends keyof HTMLElementEventMap>(
    el: EventTarget,
    type: K | string,
    fn: EventListenerOrEventListenerObject,
  ) => {
    el.addEventListener(type, fn);
    cleanups.push(() => el.removeEventListener(type, fn));
  };

  const isReduced = cfg.reduced;
  const restPos = { x: 85, y: 22, r: -1.6 };
  const bedPos = { x: 35, y: 186 };

  const makeValueFont = (px: number) => `${cfg.valueFont.style} ${cfg.valueFont.weight} ${px}px ${cfg.valueFont.family}`;
  const baseWidth100 = (() => {
    const ctx = makeCanvas(1, 1).getContext('2d')!;
    ctx.font = makeValueFont(100);
    return ctx.measureText(cfg.value || ' ').width || 1;
  })();
  const fontSize = Math.max(12, Math.min(19, 21000 / baseWidth100));
  const scaleX = Math.min(1, 210 / ((baseWidth100 * fontSize) / 100));

  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  const lcdGlow = mixRgb(cfg.accent, white, 0.3);
  const litPaperColor = mixRgb(cfg.accent, white, 0.86);
  const litDustColor = mixRgb(cfg.accent, white, 0.62);
  const labelInk = mixRgb(cfg.ink, cfg.paper, 0.55);

  function drawCardTypography(
    ctx: CanvasRenderingContext2D,
    style: { label: string; ink: string; alpha: number; spread?: boolean },
  ) {
    const rand = mulberry32(11);
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = style.alpha;
    ctx.fillStyle = style.label;
    ctx.font = `${cfg.labelFont.style} ${cfg.labelFont.weight} 9.4px ${cfg.labelFont.family}`;
    drawSpacedLabel(ctx, cfg.label.toUpperCase(), 18, 27, 1.3);

    ctx.font = makeValueFont(fontSize);
    const chars = [...cfg.value];
    const xOffsets = chars.map((_, idx) => ctx.measureText(chars.slice(0, idx).join('')).width);
    ctx.translate(18, 0);
    ctx.scale(scaleX, 1);
    chars.forEach((ch, idx) => {
      const ox = (rand() - 0.5) * 0.35;
      const oy = (rand() - 0.5) * 0.4;
      const inkVar = 0.86 + rand() * 0.14;
      ctx.globalAlpha = style.alpha * inkVar;
      ctx.fillStyle = style.ink;
      ctx.fillText(ch, xOffsets[idx] + ox, 62 + oy);
      if (style.spread) {
        ctx.globalAlpha = style.alpha * 0.35;
        ctx.fillText(ch, xOffsets[idx] + ox + 0.35, 62 + oy + 0.2);
      }
    });
    ctx.restore();
  }

  function makeMirroredMask(blurPx: number, alpha: number): HTMLCanvasElement {
    const c = makeCanvas(750, 276);
    const ctx = c.getContext('2d')!;
    ctx.filter = blurPx ? `blur(${blurPx * DPR_SCALE}px)` : 'none';
    ctx.setTransform(-3, 0, 0, DPR_SCALE, 750, 0);
    drawCardTypography(ctx, { label: '#000', ink: '#000', alpha });
    return c;
  }

  function addEdgeShadows(ctx: CanvasRenderingContext2D) {
    const gradEdge = (x0: number, y0: number, x1: number, y1: number, a: number) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, `rgba(30,30,30,${a})`);
      g.addColorStop(1, 'rgba(30,30,30,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, ORIG_W, ORIG_H);
    };
    gradEdge(ORIG_W, 0, 243, 0, 0.12);
    gradEdge(0, ORIG_H, 0, 86, 0.14);
    gradEdge(0, 0, 5, 0, 0.06);
  }

  function buildOriginalFront(noise: Float32Array): HTMLCanvasElement {
    const c = renderPaperTexture(ORIG_W, ORIG_H, cfg.paper, noise, 14, 4, true, 0.6);
    const ctx = c.getContext('2d')!;
    const textLayer = makeCanvas(c.width, c.height);
    const tCtx = textLayer.getContext('2d')!;
    tCtx.scale(DPR_SCALE, DPR_SCALE);
    drawCardTypography(tCtx, { label: rgbaStr(labelInk), ink: rgbaStr(cfg.ink), alpha: 1 });

    const mask = makeCanvas(c.width, c.height);
    const mCtx = mask.getContext('2d')!;
    const img = mCtx.createImageData(mask.width, mask.height);
    const rand = mulberry32(9);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i + 3] = (0.8 + rand() * 0.2) * 255;
    }
    mCtx.putImageData(img, 0, 0);

    tCtx.setTransform(1, 0, 0, 1, 0, 0);
    tCtx.globalCompositeOperation = 'destination-in';
    tCtx.drawImage(mask, 0, 0);

    ctx.drawImage(textLayer, 0, 0);
    ctx.scale(DPR_SCALE, DPR_SCALE);
    const sheen = ctx.createLinearGradient(0, 0, ORIG_W, ORIG_H);
    sheen.addColorStop(0, 'rgba(255,255,255,0.08)');
    sheen.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, ORIG_W, ORIG_H);
    return c;
  }

  function buildOriginalBack(noise: Float32Array): HTMLCanvasElement {
    const c = renderPaperTexture(ORIG_W, ORIG_H, mixRgb(cfg.paper, black, 0.075), noise, 14, 5, true, 0.6);
    const ctx = c.getContext('2d')!;
    ctx.drawImage(makeMirroredMask(0.6, 0.035), 0, 0);
    ctx.scale(DPR_SCALE, DPR_SCALE);
    const sheen = ctx.createLinearGradient(0, 0, ORIG_W, ORIG_H);
    sheen.addColorStop(0, 'rgba(255,255,255,0.10)');
    sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
    sheen.addColorStop(1, 'rgba(0,0,0,0.10)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, ORIG_W, ORIG_H);
    addEdgeShadows(ctx);
    return c;
  }

  function buildLitSlip(noise: Float32Array): HTMLCanvasElement {
    const c = renderPaperTexture(ORIG_W, ORIG_H, litPaperColor, noise, 46, 6, false, 0.3);
    const ctx = c.getContext('2d')!;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(makeMirroredMask(0.55, 0.62), 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5;
    ctx.drawImage(makeMirroredMask(0, 0.25), 0, 0);
    return c;
  }

  let copyPaperBase: HTMLCanvasElement | null = null;
  let tonerBorderCache: HTMLCanvasElement | null = null;

  function getCopyPaperBase(): HTMLCanvasElement {
    if (!copyPaperBase) {
      copyPaperBase = renderPaperTexture(
        COPY_W,
        COPY_H,
        mixRgb(cfg.paper, [242, 242, 238], 0.6),
        paperBaseNoise(COPY_W, COPY_H, 301),
        10,
        401,
        false,
        0.7,
      );
    }
    return copyPaperBase;
  }

  function getTonerBorder(): HTMLCanvasElement {
    if (tonerBorderCache) return tonerBorderCache;
    const rand = mulberry32(555);
    const pw = COPY_W * DPR_SCALE;
    const ph = COPY_H * DPR_SCALE;
    const c = makeCanvas(pw, ph);
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(pw, ph);
    const px = img.data;
    const band = valueNoise(pw, ph, 27, rand);
    const phase = rand() * 6.28;

    for (let y = 0; y < ph; y++) {
      const wave = 0.8 + 0.05 * Math.sin(y / DPR_SCALE / 6 + phase);
      for (let x = 0; x < pw; x++) {
        if (x >= 45 && x < 265 * DPR_SCALE && y >= 24 && y < 300) continue;
        const idx = (y * pw + x) * 4;
        const val = wave + (band[y * pw + x] - 0.5) * 0.18 + (rand() - 0.5) * 0.3;
        px[idx] = 22;
        px[idx + 1] = 22;
        px[idx + 2] = 24;
        px[idx + 3] = Math.max(0, Math.min(1, val)) * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    tonerBorderCache = c;
    return c;
  }

  function buildCopySheet(copyNum: number, lidWasOpen: boolean): HTMLCanvasElement {
    const rand = mulberry32(1000 + copyNum * 17);
    const pw = COPY_W * DPR_SCALE;
    const ph = COPY_H * DPR_SCALE;
    const c = makeCanvas(pw, ph);
    const ctx = c.getContext('2d')!;

    ctx.drawImage(getCopyPaperBase(), 0, 0);
    if (lidWasOpen) {
      ctx.save();
      ctx.translate(copyNum % 2 ? pw : 0, copyNum % 3 === 0 ? ph : 0);
      ctx.scale(copyNum % 2 ? -1 : 1, copyNum % 3 === 0 ? -1 : 1);
      ctx.drawImage(getTonerBorder(), 0, 0);
      ctx.restore();
    }

    ctx.save();
    ctx.scale(DPR_SCALE, DPR_SCALE);
    ctx.strokeStyle = lidWasOpen ? 'rgba(35,35,37,0.4)' : 'rgba(60,60,62,0.22)';
    ctx.lineWidth = lidWasOpen ? 0.7 : 0.5;
    ctx.strokeRect(15.35, 8.35, 249.3, 91.3);

    if (!lidWasOpen) {
      ctx.fillStyle = 'rgba(60,60,62,0.10)';
      ctx.fillRect(264, 10, 1.4, ORIG_H);
      ctx.fillRect(17, 99.4, ORIG_W, 1.2);
    }

    const creaseGrad = ctx.createLinearGradient(COPY_PAD_X, COPY_PAD_Y, 265, COPY_PAD_Y);
    creaseGrad.addColorStop(0, 'rgba(0,0,0,0.06)');
    creaseGrad.addColorStop(0.25, 'rgba(0,0,0,0)');
    creaseGrad.addColorStop(1, 'rgba(0,0,0,0.04)');
    ctx.fillStyle = creaseGrad;
    ctx.fillRect(COPY_PAD_X, COPY_PAD_Y, ORIG_W, ORIG_H);
    ctx.restore();

    const tonerText = makeCanvas(750, 276);
    const tCtx = tonerText.getContext('2d')!;
    tCtx.scale(DPR_SCALE, DPR_SCALE);
    drawCardTypography(tCtx, { label: '#1d1d1f', ink: '#121214', alpha: 1, spread: true });

    const grainMask = makeCanvas(tonerText.width, tonerText.height);
    const gCtx = grainMask.getContext('2d')!;
    const gImg = gCtx.createImageData(grainMask.width, grainMask.height);
    for (let i = 0; i < gImg.data.length; i += 4) {
      gImg.data[i + 3] = (rand() < 0.05 ? 0.5 : 0.88 + rand() * 0.12) * 255;
    }
    gCtx.putImageData(gImg, 0, 0);

    tCtx.setTransform(1, 0, 0, 1, 0, 0);
    tCtx.globalCompositeOperation = 'destination-in';
    tCtx.drawImage(grainMask, 0, 0);

    ctx.save();
    ctx.translate(45, 24);
    ctx.rotate((rand() - 0.5) * 0.004);
    ctx.drawImage(tonerText, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.scale(DPR_SCALE, DPR_SCALE);
    for (let i = 0; i < (lidWasOpen ? 46 : 26); i++) {
      const nearText = rand() < 0.6;
      const sx = nearText ? 31 + rand() * 215 : rand() * COPY_W;
      const sy = nearText ? 52 + rand() * 26 : rand() * COPY_H;
      ctx.fillStyle = `rgba(18,18,20,${0.2 + rand() * 0.5})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.2 + rand() * (nearText ? 0.3 : 0.5), 0, 7);
      ctx.fill();
    }
    if (rand() < 0.6) {
      const sx = 35 + rand() * 210;
      ctx.fillStyle = `rgba(30,30,32,${0.06 + rand() * 0.07})`;
      ctx.fillRect(sx, 0, 0.6, COPY_H);
    }
    const bandGrad = ctx.createLinearGradient(0, 0, COPY_W, 0);
    const phase = rand();
    for (let i = 0; i <= 6; i++) {
      bandGrad.addColorStop(
        i / 6,
        `rgba(${i % 2 ? '255,255,255' : '0,0,0'},${0.025 + 0.02 * Math.sin(i + phase * 6)})`,
      );
    }
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, 0, COPY_W, COPY_H);
    ctx.restore();

    return c;
  }

  function buildDustLayer(lit: boolean): HTMLCanvasElement {
    const rand = mulberry32(77);
    const c = makeCanvas(GLASS_W * DPR_SCALE, GLASS_H * DPR_SCALE);
    const ctx = c.getContext('2d')!;
    ctx.scale(DPR_SCALE, DPR_SCALE);

    for (let i = 0; i < 70; i++) {
      const dx = rand() * GLASS_W;
      const dy = rand() * GLASS_H;
      const r = 0.25 + rand() * rand() * 0.9;
      ctx.fillStyle = lit ? rgbaStr(litDustColor, 0.35 + rand() * 0.6) : `rgba(255,255,255,${0.04 + rand() * 0.07})`;
      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, 7);
      ctx.fill();
    }
    for (let i = 0; i < 5; i++) {
      const dx = rand() * GLASS_W;
      const dy = rand() * GLASS_H;
      const a = rand() * 6.28;
      const len = 3 + rand() * 7;
      ctx.strokeStyle = lit ? rgbaStr(litDustColor, 0.45) : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.35;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.quadraticCurveTo(
        dx + Math.cos(a) * len * 0.5 + 1.5,
        dy + Math.sin(a) * len * 0.5,
        dx + Math.cos(a) * len,
        dy + Math.sin(a) * len,
      );
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(300, 96);
    ctx.rotate(-0.5);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 11; i++) {
      ctx.strokeStyle = lit
        ? rgbaStr(litDustColor, 0.16 - i * 0.01)
        : `rgba(255,255,255,${0.028 - i * 0.002})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 2 + i * 1.2, 3 + i * 1.55, 0, 0.2, Math.PI * 1.85);
      ctx.stroke();
    }
    ctx.restore();
    return c;
  }

  function drawGlassRulers() {
    const c = q<HTMLCanvasElement>('.cp-scale');
    c.width = GLASS_W * DPR_SCALE;
    c.height = GLASS_H * DPR_SCALE;
    setCanvasCssSize(c, GLASS_W, GLASS_H);
    const ctx = c.getContext('2d')!;
    ctx.scale(DPR_SCALE, DPR_SCALE);
    const minor = rgbaStr(lcdGlow, 0.3);
    const major = rgbaStr(lcdGlow, 0.42);
    for (let x = 6, idx = 1; x < 370; x += 6, idx++) {
      ctx.fillStyle = idx % 5 === 0 ? major : minor;
      ctx.fillRect(x, 0, 0.55, idx % 5 === 0 ? 5 : 2.5);
    }
    for (let y = 6, idx = 1; y < 132; y += 6, idx++) {
      ctx.fillStyle = idx % 5 === 0 ? major : minor;
      ctx.fillRect(0, y, idx % 5 === 0 ? 5 : 2.5, 0.55);
    }
    ctx.font = '600 5px "Inter", sans-serif';
    ctx.fillStyle = rgbaStr(lcdGlow, 0.38);
    ctx.fillText('A6', 258, 10);
    ctx.fillText('A5', 330, 10);
    ctx.save();
    ctx.translate(10, 112);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('A6', 0, 0);
    ctx.restore();
  }

  // Dot-matrix LCD state
  matrixCanvas.width = LCD_SPEC.w * DPR_SCALE;
  matrixCanvas.height = LCD_SPEC.h * DPR_SCALE;
  setCanvasCssSize(matrixCanvas, LCD_SPEC.w, LCD_SPEC.h);

  let lcdState: { cols: boolean[][]; scroll: boolean; t0: number; blink: boolean } = {
    cols: [],
    scroll: false,
    t0: 0,
    blink: false,
  };
  let lcdRaf = 0;
  let lcdVisible = true;

  function setLcdText(text: string, opts: { blink?: boolean } = {}) {
    const cols = encodeDotMatrix(text);
    lcdState = {
      cols,
      scroll: cols.length > LCD_SPEC.cols,
      t0: performance.now(),
      blink: !!opts.blink && !isReduced(),
    };
    if (!lcdRaf) lcdRaf = requestAnimationFrame(renderLcd);
  }

  function renderLcd(now: number) {
    const ctx = matrixCanvas.getContext('2d')!;
    ctx.setTransform(DPR_SCALE, 0, 0, DPR_SCALE, 0, 0);
    ctx.clearRect(0, 0, LCD_SPEC.w, LCD_SPEC.h);

    const oy = (LCD_SPEC.h - LCD_SPEC.rows * LCD_SPEC.pitch) / 2 + 0.3;
    const ox = (LCD_SPEC.w - LCD_SPEC.cols * LCD_SPEC.pitch) / 2 + 0.3;
    const dotSize = LCD_SPEC.pitch - 0.55;
    const cols = lcdState.cols;
    const offset = lcdState.scroll
      ? (Math.floor((now - lcdState.t0) / 70) % (cols.length + 14)) - 4
      : -Math.floor((LCD_SPEC.cols - cols.length) / 2);
    const lit = !lcdState.blink || Math.floor((now - lcdState.t0) / 420) % 2 === 0;

    for (let x = 0; x < LCD_SPEC.cols; x++) {
      const col = cols[x + offset];
      for (let y = 0; y < LCD_SPEC.rows; y++) {
        if (lit && col && col[y]) {
          ctx.shadowColor = rgbaStr(cfg.accent, 0.6);
          ctx.shadowBlur = 1.6 * DPR_SCALE;
          ctx.fillStyle = rgbaStr(lcdGlow);
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = rgbaStr(lcdGlow, 0.055);
        }
        ctx.beginPath();
        ctx.arc(ox + x * LCD_SPEC.pitch + dotSize / 2, oy + y * LCD_SPEC.pitch + dotSize / 2, dotSize * 0.46, 0, 7);
        ctx.fill();
      }
    }

    lcdRaf = lcdVisible && ((lcdState.scroll && !isReduced()) || lcdState.blink) ? requestAnimationFrame(renderLcd) : 0;
  }

  // Procedural Web Audio sound synthesis
  let audioCtx: AudioContext | null = null;
  let noiseBuf: AudioBuffer | null = null;

  function ensureAudio(): AudioContext | null {
    if (!cfg.sound()) return null;
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AC();
        noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
        const ch = noiseBuf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch {
      return null;
    }
  }

  function playNoiseBurst(opts: {
    type?: BiquadFilterType;
    f?: number;
    f2?: number;
    q?: number;
    gain?: number;
    attack?: number;
    hold?: number;
    dur?: number;
    delay?: number;
  }) {
    const ctx = ensureAudio();
    if (!ctx || !noiseBuf) return;
    const { type = 'bandpass', f = 1000, f2 = 0, q: qVal = 1, gain = 0.05, attack = 0.005, hold = 0, dur = 0.05, delay = 0 } = opts;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    src.buffer = noiseBuf;
    filter.type = type;
    filter.frequency.setValueAtTime(f, t0);
    if (f2) filter.frequency.exponentialRampToValueAtTime(f2, t0 + attack + hold + dur);
    filter.Q.value = qVal;
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(gain, t0 + attack);
    amp.gain.setValueAtTime(gain, t0 + attack + hold);
    amp.gain.exponentialRampToValueAtTime(1e-4, t0 + attack + hold + dur);
    src.connect(filter).connect(amp).connect(ctx.destination);
    src.start(t0, Math.random());
    src.stop(t0 + attack + hold + dur + 0.05);
  }

  function playTone(freq: number, dur: number, gain: number, delay = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(gain, t0 + 0.005);
    amp.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function playScanMotor(dur: number) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(46, t0);
    osc.frequency.linearRampToValueAtTime(60, t0 + 0.25);
    osc.frequency.setValueAtTime(60, t0 + dur - 0.2);
    osc.frequency.linearRampToValueAtTime(42, t0 + dur);
    filter.type = 'lowpass';
    filter.frequency.value = 240;
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(0.05, t0 + 0.15);
    amp.gain.setValueAtTime(0.05, t0 + dur - 0.2);
    amp.gain.linearRampToValueAtTime(1e-4, t0 + dur);
    osc.connect(filter).connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  const vibrate = (ms: number) => {
    if (!cfg.haptics()) return;
    try {
      navigator.vibrate?.(ms);
    } catch {
      // ignore unsupported
    }
  };

  const sfx = {
    key: () => {
      playNoiseBurst({ type: 'lowpass', f: 800, gain: 0.09, dur: 0.05 });
      playNoiseBurst({ f: 3000, q: 1.5, gain: 0.025, dur: 0.02 });
      vibrate(8);
    },
    scan: (dur: number) => {
      playScanMotor(dur);
      playNoiseBurst({ f: 650, q: 0.7, gain: 0.016, attack: 0.15, hold: dur - 0.35, dur: 0.2 });
      playNoiseBurst({ type: 'lowpass', f: 480, gain: 0.07, dur: 0.06, delay: dur - 0.05 });
    },
    feed: () => {
      playNoiseBurst({ f: 1700, f2: 4000, q: 0.6, gain: 0.04, attack: 0.04, hold: 0.25, dur: 0.18 });
      playNoiseBurst({ type: 'lowpass', f: 1100, gain: 0.05, dur: 0.06, delay: 0.55 });
    },
    lidUp: () => {
      playNoiseBurst({ type: 'lowpass', f: 600, gain: 0.05, dur: 0.05 });
      playNoiseBurst({ f: 900, f2: 500, q: 0.6, gain: 0.015, attack: 0.1, dur: 0.3 });
    },
    lidDown: () => {
      playNoiseBurst({ f: 600, f2: 1400, q: 0.6, gain: 0.012, attack: 0.15, dur: 0.15 });
      playNoiseBurst({ type: 'lowpass', f: 380, gain: 0.12, dur: 0.09, delay: 0.42 });
      later(() => vibrate(12), 420);
    },
    paper: () => playNoiseBurst({ f: 2600, q: 0.8, gain: 0.025, dur: 0.08 }),
    settle: () => {
      playNoiseBurst({ f: 1900, f2: 900, q: 0.7, gain: 0.03, attack: 0.02, dur: 0.16 });
      vibrate(6);
    },
    copied: () => {
      playTone(1568, 0.09, 0.035);
      playTone(2093, 0.14, 0.03, 0.09);
      vibrate(14);
    },
  };

  let lidOpen = false;
  let cardLoaded = false;
  let busy = false;
  let copyCounter = 0;

  function setLid(open: boolean, silent = false) {
    if (open === lidOpen) return;
    lidOpen = open;
    machineEl.classList.toggle('cp-open', open);
    machineEl.classList.toggle('cp-shut', !open);
    if (!silent) {
      if (open) sfx.lidUp();
      else sfx.lidDown();
    }
  }

  const leakEls = Array.from(root.querySelectorAll<HTMLDivElement>('.cp-leak'));

  function sweepScanner(fromX: number, toX: number, duration: number, easing: string) {
    const opts: KeyframeAnimationOptions = { duration, easing, fill: 'forwards' };
    const tx = (px: number) => `translateX(${px}px)`;
    carriageEl.animate([{ transform: tx(fromX - 25) }, { transform: tx(toX - 25) }], opts);
    beamEl.animate([{ transform: tx(fromX - 85) }, { transform: tx(toX - 85) }], opts);
    beamInEl.animate([{ transform: tx(85 - fromX) }, { transform: tx(85 - toX) }], opts);
    for (const leak of leakEls) {
      leak.animate([{ transform: tx(18 + fromX - 35) }, { transform: tx(18 + toX - 35) }], opts);
    }
  }

  const formatOrigTransform = (x: number, y: number, r: number, extra = '') =>
    `translate(${x}px, ${y}px) rotate(${r}deg) ${extra}`;
  const getDeskScale = () => root.getBoundingClientRect().width / COPIER_DESK_W || 1;
  const isOverBed = (x: number, y: number) => {
    const cx = x + ORIG_W / 2;
    const cy = y + ORIG_H / 2;
    return cx > 18 && cx < 402 && cy > 156 && cy < 336;
  };

  origBtn.setAttribute('aria-label', `Put the ${cfg.label.toLowerCase()} in the copier`);

  interface CopyPage {
    el: HTMLDivElement;
    x: number;
    y: number;
    r: number;
    out: boolean;
  }

  const copies: CopyPage[] = [];
  const formatPageTransform = (p: CopyPage, extra = '') => `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) ${extra}`;
  const trayZone = { l: -32, r: 312, t: -10, b: 158 };
  const isInsideTray = (p: CopyPage) => {
    const cx = p.x + COPY_W / 2;
    const cy = p.y + COPY_H / 2;
    return cx > trayZone.l && cx < trayZone.r && cy > trayZone.t && cy < trayZone.b + 20;
  };

  function placeOriginalIntoBed(x: number, y: number, r: number, startScale = 1) {
    flushIdleQueue();
    busy = true;
    ensureAudio();
    setLid(true);
    origBtn.classList.add('cp-lifted', 'cp-flying');
    setLcdText('READY');

    const dur = isReduced() ? 1 : 820;
    const delay = isReduced() ? 0 : 160;
    const midX = (x + bedPos.x) / 2;
    const midY = Math.min(y, bedPos.y) - 26;

    origBtn.animate(
      [
        { transform: formatOrigTransform(x, y, r, `scale(${startScale}) rotateY(0deg)`) },
        { transform: formatOrigTransform(midX, midY, r * 0.5, 'scale(1.07) rotateY(90deg)'), offset: 0.5 },
        { transform: formatOrigTransform(bedPos.x, bedPos.y, 0, 'scale(1.01) rotateY(180deg)'), offset: 0.88 },
        { transform: formatOrigTransform(bedPos.x, bedPos.y, 0, 'scale(1) rotateY(180deg)') },
      ],
      { duration: dur, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards', delay },
    );

    later(() => sfx.paper(), isReduced() ? 0 : 300);
    later(() => {
      sfx.settle();
      cardLoaded = true;
      machineEl.classList.add('cp-loaded');
      origBtn.classList.add('cp-inside');
      origBtn.classList.remove('cp-lifted');
      origBtn.setAttribute('aria-label', `The ${cfg.label.toLowerCase()} is in the copier`);
      later(() => startScan(true), isReduced() ? 0 : 380);
    }, dur + delay + 20);
  }

  function startScan(closeLidAfter: boolean) {
    busy = true;
    machineEl.classList.remove('cp-ready');
    startBtn.classList.add('cp-down');
    later(() => startBtn.classList.remove('cp-down'), 150);
    sfx.key();

    const scanMs = isReduced() ? 200 : 1250;
    const returnMs = isReduced() ? 100 : 560;
    const lidSnapshot = lidOpen;

    setLcdText('COPYING', { blink: true });
    later(() => {
      machineEl.classList.add('cp-scanning');
      sfx.scan(scanMs / 1000);
      sweepScanner(5, 399, scanMs, 'cubic-bezier(.45,.05,.4,1)');
      later(() => {
        machineEl.classList.remove('cp-scanning');
        sweepScanner(399, 5, returnMs, 'cubic-bezier(.5,0,.2,1)');
        spawnCopy(lidSnapshot, true);
        if (closeLidAfter) {
          later(() => setLid(false), isReduced() ? 0 : 900);
        }
      }, scanMs);
    }, 170);
  }

  function spawnCopy(lidWasOpen: boolean, animateFeed: boolean) {
    copyCounter++;
    const num = copyCounter;
    const el = document.createElement('div');
    el.className = 'cp-page';

    const copyCanvas = wrapWithBleed(buildCopySheet(num, lidWasOpen), COPY_W, COPY_H);
    copyCanvas.setAttribute('aria-hidden', 'true');
    el.appendChild(copyCanvas);
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.setAttribute('aria-label', `Copy ${cfg.value} to the clipboard`);

    const inTrayCount = copies.filter((c) => !c.out).length;
    const rand = mulberry32(num * 91);
    const rot = (rand() - 0.5) * 4;
    const dx = (rand() - 0.5) * 12;
    const dy = Math.min(inTrayCount, 4) * 2.4;

    const page: CopyPage = { el, x: dx, y: dy, r: rot, out: false };
    copies.push(page);
    machineEl.insertBefore(el, q('.cp-overhang'));
    attachCopyEvents(page);
    el.style.transform = formatPageTransform(page);

    const feedMs = animateFeed && !isReduced() ? 820 : 0;
    if (feedMs) {
      sfx.feed();
      el.animate(
        [
          { transform: 'translate(0px, -112px) rotate(0deg)' },
          { transform: `translate(${dx * 0.7}px, ${dy + 5}px) rotate(${rot * 0.5}deg)`, offset: 0.64, easing: 'cubic-bezier(.25,.6,.3,1)' },
          { transform: formatPageTransform(page) },
        ],
        { duration: feedMs, easing: 'cubic-bezier(.25,.7,.3,1)' },
      );
    }

    later(() => {
      busy = false;
      machineEl.classList.add('cp-ready');
      setLcdText('TAKE COPY');
    }, feedMs);
  }

  function legacyCopy() {
    const ta = document.createElement('textarea');
    ta.value = cfg.value;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {
      // ignore
    }
    ta.remove();
  }

  let lcdResetTimer: ReturnType<typeof setTimeout> | undefined;
  let flashTimer: ReturnType<typeof setTimeout> | undefined;

  function triggerCopyToClipboard() {
    try {
      navigator.clipboard.writeText(cfg.value).catch(legacyCopy);
    } catch {
      legacyCopy();
    }
    sfx.copied();
    setLcdText('COPIED ✓');
    machineEl.classList.add('cp-flash');
    clearTimeout(flashTimer);
    flashTimer = later(() => machineEl.classList.remove('cp-flash'), 900);
    srEl.textContent = '';
    srEl.textContent = `Copied ${cfg.value} to the clipboard.`;
    clearTimeout(lcdResetTimer);
    lcdResetTimer = later(() => setLcdText(cardLoaded ? 'READY' : 'PLACE ORIGINAL'), 2600);
    cfg.onCopy?.();
  }

  function maybeDiscardCopy(page: CopyPage) {
    if (cfg.keepCopies) return;
    later(() => {
      page.el.animate(
        [
          { transform: formatPageTransform(page), opacity: 1 },
          { transform: formatPageTransform(page, 'translateY(24px)'), opacity: 0 },
        ],
        { duration: isReduced() ? 1 : 420, easing: 'ease-in', fill: 'forwards' },
      );
      later(() => {
        page.el.remove();
        const idx = copies.indexOf(page);
        if (idx >= 0) copies.splice(idx, 1);
      }, isReduced() ? 10 : 440);
    }, 1600);
  }

  function attachCopyEvents(page: CopyPage) {
    const el = page.el;
    let drag: {
      sx: number;
      sy: number;
      x0: number;
      y0: number;
      lx: number;
      vx: number;
      tilt: number;
      k: number;
      moved: boolean;
    } | null = null;

    listen(el, 'pointerdown', (ev) => {
      const e = ev as PointerEvent;
      if (!page.out && copies.filter((c) => !c.out).slice(-1)[0] !== page) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      ensureAudio();
      el.getAnimations().forEach((a) => a.cancel());
      drag = {
        sx: e.clientX,
        sy: e.clientY,
        x0: page.x,
        y0: page.y,
        lx: e.clientX,
        vx: 0,
        tilt: 0,
        k: getDeskScale(),
        moved: false,
      };
    });

    listen(el, 'pointermove', (ev) => {
      if (!drag) return;
      const e = ev as PointerEvent;
      const dx = (e.clientX - drag.sx) / drag.k;
      const dy = (e.clientY - drag.sy) / drag.k;
      if (!drag.moved && Math.hypot(dx, dy) > 4) {
        drag.moved = true;
        el.classList.add('cp-held');
        sfx.paper();
      }
      if (drag.moved) {
        drag.vx = drag.vx * 0.7 + (e.clientX - drag.lx) * 0.3;
        drag.lx = e.clientX;
        drag.tilt += (Math.max(-7, Math.min(7, drag.vx * 0.5)) - drag.tilt) * 0.3;
        page.x = drag.x0 + dx;
        page.y = drag.y0 + dy;
        el.style.transform = formatPageTransform(page, `rotate(${drag.tilt}deg) scale(1.035)`);
      }
    });

    const endDrag = () => {
      if (!drag) return;
      const active = drag;
      drag = null;
      el.classList.remove('cp-held');
      if (!active.moved) {
        triggerCopyToClipboard();
        el.animate(
          [
            { transform: formatPageTransform(page) },
            { transform: formatPageTransform(page, 'translateY(-2px) scale(1.012)') },
            { transform: formatPageTransform(page) },
          ],
          { duration: 260, easing: 'ease-out' },
        );
        return;
      }
      sfx.settle();
      const prevTransform = el.style.transform;
      if (!page.out && !isInsideTray(page)) {
        page.out = true;
        el.classList.add('cp-out');
        page.r += active.tilt * 0.4;
        triggerCopyToClipboard();
        maybeDiscardCopy(page);
      } else if (!page.out) {
        page.x = active.x0;
        page.y = active.y0;
      }
      el.style.transform = formatPageTransform(page);
      el.animate([{ transform: prevTransform }, { transform: formatPageTransform(page) }], {
        duration: 480,
        easing: 'cubic-bezier(.22,1,.36,1)',
      });
    };

    listen(el, 'pointerup', endDrag);
    listen(el, 'pointercancel', endDrag);
    listen(el, 'keydown', (ev) => {
      const e = ev as KeyboardEvent;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerCopyToClipboard();
      }
    });
  }

  root.style.setProperty('--cp-grain', `url(${makeGrainDataUrl(128, 70, 3)})`);
  root.style.setProperty('--cp-foam', `url(${makeFoamDataUrl()})`);
  q('.cp-mark').textContent = cfg.mark;

  const origNoise = paperBaseNoise(ORIG_W, ORIG_H, 21);
  q('.cp-face').appendChild(wrapWithBleed(buildOriginalFront(origNoise), ORIG_W, ORIG_H));
  drawGlassRulers();

  const idleTasks: Array<() => void> = [
    () => {
      const back = buildOriginalBack(origNoise);
      q('.cp-back').appendChild(wrapWithBleed(back, ORIG_W, ORIG_H));
      q('.cp-slip').appendChild(setCanvasCssSize(back, ORIG_W, ORIG_H));
    },
    () => drawCanvasToEl(q<HTMLCanvasElement>('.cp-lit-slip'), buildLitSlip(origNoise), ORIG_W, ORIG_H),
    () => drawCanvasToEl(q<HTMLCanvasElement>('.cp-dust'), buildDustLayer(false), GLASS_W, GLASS_H),
    () => drawCanvasToEl(q<HTMLCanvasElement>('.cp-lit-dust'), buildDustLayer(true), GLASS_W, GLASS_H),
    () => getCopyPaperBase(),
    () => getTonerBorder(),
  ];

  const reqIdle = window.requestIdleCallback;
  const cancelIdle = window.cancelIdleCallback;
  const scheduleIdle = (fn: () => void) => (reqIdle ? reqIdle.call(window, fn) : window.setTimeout(fn, 16));
  const abortIdle = (id: number) => (cancelIdle ? cancelIdle.call(window, id) : window.clearTimeout(id));
  let idleId = 0;

  const runIdleStep = () => {
    idleId = 0;
    idleTasks.shift()?.();
    if (idleTasks.length) idleId = scheduleIdle(runIdleStep);
  };
  const flushIdleQueue = () => {
    while (idleTasks.length) idleTasks.shift()?.();
  };

  idleId = scheduleIdle(runIdleStep);
  carriageEl.style.transform = 'translateX(-20px)';
  origBtn.style.transform = formatOrigTransform(restPos.x, restPos.y, restPos.r);

  if (!cfg.live) {
    flushIdleQueue();
    if (cfg.canvasState === 'tray') {
      cardLoaded = true;
      machineEl.classList.add('cp-loaded');
      origBtn.classList.add('cp-inside');
      spawnCopy(true, false);
      setLcdText('TAKE COPY');
    } else {
      setLcdText('READY');
    }
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(lcdRaf);
      abortIdle(idleId);
    };
  }

  setLcdText('PLACE ORIGINAL');

  let inViewport = true;
  const syncVisibility = () => {
    lcdVisible = inViewport && !document.hidden;
    if (lcdVisible && !lcdRaf) lcdRaf = requestAnimationFrame(renderLcd);
  };
  const observer = new IntersectionObserver((entries) => {
    inViewport = entries[0]?.isIntersecting ?? true;
    syncVisibility();
  });
  observer.observe(root);
  listen(document, 'visibilitychange', syncVisibility);

  let origDrag: { sx: number; sy: number; x: number; y: number; k: number; moved: boolean } | null = null;

  listen(origBtn, 'pointerdown', (ev) => {
    if (cardLoaded || busy) return;
    const e = ev as PointerEvent;
    e.preventDefault();
    origBtn.setPointerCapture(e.pointerId);
    ensureAudio();
    origBtn.getAnimations().forEach((a) => a.cancel());
    origDrag = {
      sx: e.clientX,
      sy: e.clientY,
      x: restPos.x,
      y: restPos.y,
      k: getDeskScale(),
      moved: false,
    };
  });

  listen(origBtn, 'pointermove', (ev) => {
    if (!origDrag) return;
    const e = ev as PointerEvent;
    const dx = (e.clientX - origDrag.sx) / origDrag.k;
    const dy = (e.clientY - origDrag.sy) / origDrag.k;
    if (!origDrag.moved && Math.hypot(dx, dy) > 4) {
      origDrag.moved = true;
      origBtn.classList.add('cp-lifted');
      sfx.paper();
    }
    if (origDrag.moved) {
      origDrag.x = restPos.x + dx;
      origDrag.y = restPos.y + dy;
      origBtn.style.transform = formatOrigTransform(origDrag.x, origDrag.y, restPos.r * 0.4, 'scale(1.03)');
      setLid(origDrag.y + ORIG_H > 116);
      setLcdText(lidOpen && isOverBed(origDrag.x, origDrag.y) ? 'DROP' : 'PLACE ORIGINAL');
    }
  });

  const endOrigDrag = () => {
    if (!origDrag) return;
    const active = origDrag;
    origDrag = null;
    if (!active.moved) {
      placeOriginalIntoBed(restPos.x, restPos.y, restPos.r);
      return;
    }
    if (isOverBed(active.x, active.y)) {
      placeOriginalIntoBed(active.x, active.y, restPos.r * 0.4, 1.03);
      return;
    }
    origBtn.classList.remove('cp-lifted');
    sfx.settle();
    setLid(false);
    setLcdText('PLACE ORIGINAL');
    origBtn.animate(
      [{ transform: origBtn.style.transform }, { transform: formatOrigTransform(restPos.x, restPos.y, restPos.r) }],
      { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
    origBtn.style.transform = formatOrigTransform(restPos.x, restPos.y, restPos.r);
  };

  listen(origBtn, 'pointerup', endOrigDrag);
  listen(origBtn, 'pointercancel', endOrigDrag);
  listen(origBtn, 'click', (ev) => {
    const e = ev as MouseEvent;
    if (e.detail === 0 && !cardLoaded && !busy) {
      placeOriginalIntoBed(restPos.x, restPos.y, restPos.r);
    }
  });

  listen(startBtn, 'click', () => {
    ensureAudio();
    if (busy) return;
    if (!cardLoaded) {
      placeOriginalIntoBed(restPos.x, restPos.y, restPos.r);
      return;
    }
    busy = true;
    setLid(true);
    later(() => startScan(true), isReduced() ? 0 : 520);
  });

  return () => {
    cleanups.forEach((fn) => fn());
    timers.forEach(clearTimeout);
    cancelAnimationFrame(lcdRaf);
    abortIdle(idleId);
    observer.disconnect();
    try {
      audioCtx?.close();
    } catch {
      // ignore
    }
  };
}
