import { useEffect, useRef, useState } from 'react';

export type LiquidLensAxis = 'auto' | 'horizontal' | 'vertical';

export type LiquidLensStatus =
  | 'active'
  | 'stepped-aside'
  | 'disabled-reduced-motion'
  | 'unsupported-webgl2'
  | 'context-lost';

export interface LiquidLensCardDescriptor {
  /** Stable unique identifier for this card. */
  id: string;
  /** Live DOM element whose on-screen rectangle is mirrored into the lens FBO each frame. */
  getElement: () => HTMLElement | null;
  /** Currently displayed visual variant key (e.g. 'styled-card', 'cover-only', 'dark'). */
  variant: string;
  /** Map of variant key -> baked rest texture URL or drawable image/canvas source. */
  textures: Record<string, string | HTMLCanvasElement | HTMLImageElement | undefined>;
  /** Host proximity flag: only cards with near === true are downloaded and rendered. */
  near: boolean;
  /** Download priority (lower numbers download first). */
  priority: number;
  /** Corner radius in CSS pixels for crisp rounded-rect mirroring. */
  borderRadius?: number;
}

export interface LiquidLensOpticalConfig {
  /** Fraction of container width (horizontal) or height (vertical) per glass strip (0.08–0.36). */
  stripSize: number;
  /** Refractive meniscus bend intensity (0–1.5). */
  refraction: number;
  /** Spectral RGB chromatic dispersion strength (0–1.5). */
  dispersion: number;
  /** Maximum outer-edge melting blur radius in CSS pixels (0–28). */
  meltBlur: number;
  /** Subtle organic liquid ripple amplitude along the meniscus (0–1). */
  liquidRipple: number;
  /** Specular meniscus lip highlight & subtle frosted glass sheen (0–1). */
  glassSheen: number;
  /** Outer edge dissolve strength into the stage backdrop (0–1). */
  edgeFade: number;
  /** Meniscus curve exponent shaping the glass falloff (0.6–2.8). */
  meniscusCurve: number;
}

export const DEFAULT_LIQUID_LENS_CONFIG: LiquidLensOpticalConfig = {
  stripSize: 0.22,
  refraction: 0.78,
  dispersion: 0.65,
  meltBlur: 15,
  liquidRipple: 0.24,
  glassSheen: 0.42,
  edgeFade: 0.62,
  meniscusCurve: 1.35,
};

export interface LiquidLensProps {
  /** Host-supplied card descriptors (texture sources, active variant, proximity, priority). */
  cards: readonly LiquidLensCardDescriptor[];
  /** Optional explicit container whose bounds the lens mirrors (defaults to canvas parent). */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Axis the two liquid glass strips run along ('auto' uses vertical on tall portrait containers). */
  axis?: LiquidLensAxis;
  /** When true, the lens smoothly steps aside and pauses its WebGL2 loop. */
  stepAside?: boolean;
  /** Optical shader configuration. */
  config?: Partial<LiquidLensOpticalConfig>;
  /** Optional RGB [0..1] override for the glass backdrop blend color; auto-detected when omitted. */
  backdropRgb?: readonly [number, number, number];
  /** Optional dark-surface hint for glass specular tinting; auto-detected from backdrop luminance if omitted. */
  isDarkSurface?: boolean;
  /** Runtime status callback (active, stepped-aside, reduced-motion, no-webgl2, context-lost). */
  onStatusChange?: (status: LiquidLensStatus) => void;
  className?: string;
}

/* ==========================================================================
   WebGL2 Capability & Theme Color Helpers (Zero Site Knowledge)
   ========================================================================== */

let cachedWebGL2Support: boolean | null = null;

export function supportsLiquidLensWebGL2(): boolean {
  if (cachedWebGL2Support !== null) return cachedWebGL2Support;
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    cachedWebGL2Support = Boolean(gl);
    if (gl) {
      const loseExt = gl.getExtension('WEBGL_lose_context');
      loseExt?.loseContext();
    }
    return cachedWebGL2Support;
  } catch {
    cachedWebGL2Support = false;
    return false;
  }
}

function parseCssColorToRgb(raw: string): [number, number, number, number] | null {
  const match = raw.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!match) return null;
  const r = Math.min(255, Math.max(0, Number(match[1]))) / 255;
  const g = Math.min(255, Math.max(0, Number(match[2]))) / 255;
  const b = Math.min(255, Math.max(0, Number(match[3]))) / 255;
  const a = match[4] !== undefined ? Number(match[4]) : 1;
  return [r, g, b, a];
}

function detectContainerBackdropRgb(el: HTMLElement | null): [number, number, number] {
  if (typeof window === 'undefined') return [0.96, 0.96, 0.97];
  let node: HTMLElement | null = el;
  while (node) {
    const bg = window.getComputedStyle(node).backgroundColor;
    const parsed = parseCssColorToRgb(bg);
    if (parsed && parsed[3] > 0.85) {
      return [parsed[0], parsed[1], parsed[2]];
    }
    node = node.parentElement;
  }
  const bodyBg = window.getComputedStyle(document.body).backgroundColor;
  const bodyParsed = parseCssColorToRgb(bodyBg);
  if (bodyParsed && bodyParsed[3] > 0.1) {
    return [bodyParsed[0], bodyParsed[1], bodyParsed[2]];
  }
  return [0.96, 0.96, 0.97];
}

/* ==========================================================================
   WebGL2 Shaders (Pass 1: Card Mirror FBO · Pass 2: Liquid Glass Refraction)
   ========================================================================== */

const CARD_MIRROR_VERT = `#version 300 es
precision highp float;

uniform vec4 uRect; // x0, y0, width, height in normalized [0..1] stage coordinates (top-left origin)

out vec2 vUv;

void main() {
  // Unit quad built from gl_VertexID (0..5)
  vec2 corners[6] = vec2[6](
    vec2(0.0, 0.0),
    vec2(1.0, 0.0),
    vec2(0.0, 1.0),
    vec2(0.0, 1.0),
    vec2(1.0, 0.0),
    vec2(1.0, 1.0)
  );
  vec2 local = corners[gl_VertexID];
  vUv = local;

  vec2 stagePos = uRect.xy + local * uRect.zw;
  // Convert top-left [0..1] stage coordinates to clip space [-1..1] (Y-up)
  vec2 clip = vec2(stagePos.x * 2.0 - 1.0, 1.0 - stagePos.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
}
`;

const CARD_MIRROR_FRAG = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uCardPx;
uniform float uRadiusPx;

in vec2 vUv;
out vec4 fragColor;

float roundedBoxSdf(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + vec2(radius);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

void main() {
  vec2 px = (vUv - 0.5) * uCardPx;
  float r = min(uRadiusPx, min(uCardPx.x, uCardPx.y) * 0.5);
  float dist = roundedBoxSdf(px, uCardPx * 0.5, r);
  float mask = 1.0 - smoothstep(-0.75, 0.75, dist);
  if (mask <= 0.001) discard;

  vec4 texel = texture(uTexture, vUv);
  float alpha = texel.a * mask;
  // Premultiplied alpha output eliminates dark fringe artifacts during Pass 2 blur
  fragColor = vec4(texel.rgb * alpha, alpha);
}
`;

const LIQUID_LENS_VERT = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  // Full-screen triangle via gl_VertexID (0..2)
  vec2 pos[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2( 3.0, -1.0),
    vec2(-1.0,  3.0)
  );
  vec2 p = pos[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const LIQUID_LENS_FRAG = `#version 300 es
precision highp float;

uniform sampler2D uSceneFbo;
uniform vec2 uResolution;
uniform float uTime;
uniform int uVertical;       // 0 = left/right strips, 1 = top/bottom strips
uniform float uStripSize;    // Fraction of primary axis per glass strip
uniform float uRefraction;
uniform float uDispersion;
uniform float uMeltBlurPx;
uniform float uLiquidRipple;
uniform float uGlassSheen;
uniform float uEdgeFade;
uniform float uMeniscusCurve;
uniform vec3 uBackdropRgb;
uniform float uIsDark;

in vec2 vUv;
out vec4 fragColor;

const float GOLDEN_ANGLE = 2.39996323;
const int BLUR_TAPS = 12;

// Sample premultiplied FBO cleanly clamped to viewport
vec4 sampleFbo(vec2 uv) {
  vec2 cUv = clamp(uv, vec2(0.001), vec2(0.999));
  return texture(uSceneFbo, cUv);
}

// Golden-angle Vogel disk gather for silky isotropic liquid melting blur
vec4 gatherBlurred(vec2 centerUv, vec2 radiusUv) {
  if (max(radiusUv.x, radiusUv.y) < 0.0004) {
    return sampleFbo(centerUv);
  }
  vec4 acc = sampleFbo(centerUv) * 1.35;
  float totalW = 1.35;

  for (int i = 0; i < BLUR_TAPS; i++) {
    float fi = float(i);
    float r = sqrt((fi + 0.5) / float(BLUR_TAPS));
    float theta = fi * GOLDEN_ANGLE;
    vec2 offset = vec2(cos(theta), sin(theta)) * r * radiusUv;
    float w = 1.0 - r * 0.42;
    acc += sampleFbo(centerUv + offset) * w;
    totalW += w;
  }
  return acc / totalW;
}

void main() {
  float primary = uVertical == 1 ? vUv.y : vUv.x;
  float crossCoord = uVertical == 1 ? vUv.x : vUv.y;

  float strip = clamp(uStripSize, 0.05, 0.44);
  float dStart = clamp((strip - primary) / strip, 0.0, 1.0);
  float dEnd = clamp((primary - (1.0 - strip)) / strip, 0.0, 1.0);
  float rawD = max(dStart, dEnd);

  // Center of the screen stays 100% transparent so the live DOM shows through untouched
  if (rawD <= 0.0005) {
    fragColor = vec4(0.0);
    return;
  }

  // Direction pointing toward the nearest outer viewport edge (-1 left/bottom, +1 right/top)
  float sideSign = dStart > dEnd ? -1.0 : 1.0;

  // Calm organic meniscus wave along the cross-axis
  float waveA = sin(crossCoord * 7.2 + uTime * 0.72 + sideSign * 1.2);
  float waveB = sin(crossCoord * 13.6 - uTime * 0.48);
  float wave = (waveA * 0.62 + waveB * 0.38);

  float dOrganic = clamp(
    rawD + wave * 0.036 * uLiquidRipple * smoothstep(0.0, 0.32, rawD),
    0.0,
    1.0
  );

  // Curved glass meniscus profile (zero bend at inner boundary -> curved optical lens -> outer melt)
  float curvedD = pow(dOrganic, uMeniscusCurve);
  float meniscusSlope = sin(min(dOrganic * 1.12, 1.0) * 3.14159265 * 0.88) * pow(dOrganic, 0.58);

  // Primary refraction shift bends imagery smoothly through the thick curved glass edge
  float mainShift = -sideSign * (meniscusSlope * 0.24 + curvedD * 0.14) * uRefraction * strip;
  float crossShift = wave * 0.0055 * uLiquidRipple * dOrganic;

  vec2 axisDir = uVertical == 1 ? vec2(0.0, 1.0) : vec2(1.0, 0.0);
  vec2 crossDir = uVertical == 1 ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

  vec2 refractedUv = vUv + axisDir * mainShift + crossDir * crossShift;

  // Spectral RGB dispersion splitting along the refractive gradient
  float dispMag = uDispersion * strip * (0.014 + 0.058 * pow(dOrganic, 1.15));
  vec2 dispVec = axisDir * (sideSign * dispMag) + crossDir * (wave * dispMag * 0.16);

  // Melting blur radius grows smoothly toward the outer edge
  float blurPx = uMeltBlurPx * pow(dOrganic, 1.28);
  vec2 blurUv = vec2(blurPx) / max(uResolution, vec2(1.0));

  vec4 sampleR = gatherBlurred(refractedUv + dispVec, blurUv);
  vec4 sampleG = gatherBlurred(refractedUv, blurUv * 1.04);
  vec4 sampleB = gatherBlurred(refractedUv - dispVec, blurUv * 1.08);

  // Premultiplied refracted & prism-split card result
  vec3 prismPremul = vec3(sampleR.r, sampleG.g, sampleB.b);
  float cardAlpha = clamp((sampleR.a + sampleG.a + sampleB.a) / 3.0, 0.0, 1.0);

  // Composite refracted card onto the exact stage backdrop color so the un-refracted DOM
  // sliding beneath the glass never ghosts through as a double image
  vec3 composited = prismPremul + uBackdropRgb * (1.0 - cardAlpha);

  // Subtle chromatic prism bloom right at the high-contrast inner edge of refracted cards
  float chromaSpread = length(vec2(sampleR.a - sampleG.a, sampleB.a - sampleG.a));
  vec3 prismTint = vec3(
    max(0.0, sampleR.a - sampleB.a) * 0.14,
    chromaSpread * 0.06,
    max(0.0, sampleB.a - sampleR.a) * 0.16
  ) * uDispersion;
  composited += prismTint;

  // Outer-edge melting dissolve into the stage backdrop
  float meltOut = smoothstep(0.42, 1.0, dOrganic) * uEdgeFade;
  composited = mix(composited, uBackdropRgb, meltOut);

  // Physical liquid glass lip specular highlight & gentle frost body
  float lipBand = exp(-pow((dOrganic - 0.095) / 0.075, 2.0));
  float outerRim = smoothstep(0.68, 1.0, dOrganic) * 0.16;
  float shimmer = 0.85 + 0.15 * sin(crossCoord * 9.0 + uTime * 0.55);

  vec3 highlightColor = uIsDark > 0.5
    ? vec3(0.76, 0.86, 1.0)
    : vec3(1.0, 1.0, 1.0);
  vec3 shadowColor = uIsDark > 0.5
    ? vec3(0.02, 0.03, 0.05)
    : vec3(0.74, 0.78, 0.84);

  // Subtle inner edge refraction shadow line just behind the specular lip
  float lipShadow = exp(-pow((dOrganic - 0.18) / 0.11, 2.0)) * 0.09 * uGlassSheen;
  composited = mix(composited, shadowColor, lipShadow * (0.35 + 0.65 * cardAlpha));

  // Crisp optical meniscus catchlight
  float specular = (lipBand * 0.34 + outerRim) * uGlassSheen * shimmer * (0.28 + 0.72 * cardAlpha);
  composited = mix(composited, highlightColor, clamp(specular, 0.0, 0.42));

  // Seamless feather at the inner glass boundary (0 at live center -> 1 inside glass strip)
  float stripCoverage = smoothstep(0.0, 0.11, rawD);

  fragColor = vec4(composited, stripCoverage);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string,
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

interface ManagedTexture {
  texture: WebGLTexture;
  sourceRef: string | HTMLCanvasElement | HTMLImageElement;
  lastUsedFrame: number;
}

function uploadDrawableToTexture(
  gl: WebGL2RenderingContext,
  source: TexImageSource,
): WebGLTexture | null {
  const tex = gl.createTexture();
  if (!tex) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
  } catch {
    gl.deleteTexture(tex);
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

/**
 * Host-agnostic WebGL2 Liquid Lens overlay.
 *
 * Mirrors each host-registered card's baked rest texture into an offscreen framebuffer
 * at its live on-screen rectangle every frame, then refracts, splits RGB dispersion,
 * and melts the two outer edge strips while keeping the center completely transparent
 * so the real DOM remains sharp and interactive.
 *
 * Never mounts when WebGL2 is unavailable, after a lost context, or under prefers-reduced-motion.
 */
export function LiquidLens({
  cards,
  containerRef,
  axis = 'auto',
  stepAside = false,
  config,
  backdropRgb,
  isDarkSurface,
  onStatusChange,
  className = '',
}: LiquidLensProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasWebGL2] = useState<boolean>(() => supportsLiquidLensWebGL2());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [contextLost, setContextLost] = useState(false);

  // Keep latest props in refs so the WebGL2 render loop never tears down on config/card updates
  const cardsRef = useRef<readonly LiquidLensCardDescriptor[]>(cards);
  cardsRef.current = cards;

  const axisRef = useRef<LiquidLensAxis>(axis);
  axisRef.current = axis;

  const stepAsideRef = useRef<boolean>(stepAside);
  stepAsideRef.current = stepAside;

  const mergedConfig: LiquidLensOpticalConfig = {
    ...DEFAULT_LIQUID_LENS_CONFIG,
    ...config,
  };
  const configRef = useRef<LiquidLensOpticalConfig>(mergedConfig);
  configRef.current = mergedConfig;

  const backdropOverrideRef = useRef<readonly [number, number, number] | undefined>(backdropRgb);
  backdropOverrideRef.current = backdropRgb;

  const isDarkOverrideRef = useRef<boolean | undefined>(isDarkSurface);
  isDarkOverrideRef.current = isDarkSurface;

  const syncTexturesRef = useRef<(() => void) | null>(null);

  // Live subscription to prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Report runtime status cleanly to host
  useEffect(() => {
    if (!onStatusChange) return;
    if (reducedMotion) {
      onStatusChange('disabled-reduced-motion');
    } else if (!hasWebGL2) {
      onStatusChange('unsupported-webgl2');
    } else if (contextLost) {
      onStatusChange('context-lost');
    } else if (stepAside) {
      onStatusChange('stepped-aside');
    } else {
      onStatusChange('active');
    }
  }, [reducedMotion, hasWebGL2, contextLost, stepAside, onStatusChange]);

  // Trigger priority texture sync whenever host card descriptors change
  useEffect(() => {
    syncTexturesRef.current?.();
  }, [cards]);

  const shouldMount = hasWebGL2 && !reducedMotion && !contextLost;

  useEffect(() => {
    if (!shouldMount) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      setContextLost(true);
      return;
    }

    const cardProgram = linkProgram(gl, CARD_MIRROR_VERT, CARD_MIRROR_FRAG);
    const lensProgram = linkProgram(gl, LIQUID_LENS_VERT, LIQUID_LENS_FRAG);
    if (!cardProgram || !lensProgram) {
      if (cardProgram) gl.deleteProgram(cardProgram);
      if (lensProgram) gl.deleteProgram(lensProgram);
      setContextLost(true);
      return;
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Uniform locations — Pass 1
    const uCardRect = gl.getUniformLocation(cardProgram, 'uRect');
    const uCardTex = gl.getUniformLocation(cardProgram, 'uTexture');
    const uCardPx = gl.getUniformLocation(cardProgram, 'uCardPx');
    const uCardRadius = gl.getUniformLocation(cardProgram, 'uRadiusPx');

    // Uniform locations — Pass 2
    const uSceneFbo = gl.getUniformLocation(lensProgram, 'uSceneFbo');
    const uResolution = gl.getUniformLocation(lensProgram, 'uResolution');
    const uTime = gl.getUniformLocation(lensProgram, 'uTime');
    const uVertical = gl.getUniformLocation(lensProgram, 'uVertical');
    const uStripSize = gl.getUniformLocation(lensProgram, 'uStripSize');
    const uRefraction = gl.getUniformLocation(lensProgram, 'uRefraction');
    const uDispersion = gl.getUniformLocation(lensProgram, 'uDispersion');
    const uMeltBlurPx = gl.getUniformLocation(lensProgram, 'uMeltBlurPx');
    const uLiquidRipple = gl.getUniformLocation(lensProgram, 'uLiquidRipple');
    const uGlassSheen = gl.getUniformLocation(lensProgram, 'uGlassSheen');
    const uEdgeFade = gl.getUniformLocation(lensProgram, 'uEdgeFade');
    const uMeniscusCurve = gl.getUniformLocation(lensProgram, 'uMeniscusCurve');
    const uBackdropRgb = gl.getUniformLocation(lensProgram, 'uBackdropRgb');
    const uIsDark = gl.getUniformLocation(lensProgram, 'uIsDark');

    // Offscreen FBO for Pass 1 card mirroring
    const fbo = gl.createFramebuffer();
    const fboTex = gl.createTexture();
    let fboWidth = 0;
    let fboHeight = 0;

    let disposed = false;
    let frameCounter = 0;
    let rafId = 0;
    let isInViewport = true;

    // Auto-detected backdrop RGB synced on theme changes
    let detectedBackdrop: [number, number, number] = detectContainerBackdropRgb(
      containerRef?.current ?? canvas.parentElement,
    );

    const refreshBackdrop = () => {
      detectedBackdrop = detectContainerBackdropRgb(
        containerRef?.current ?? canvas.parentElement,
      );
    };

    const themeObserver = new MutationObserver(refreshBackdrop);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-palette', 'style'],
    });

    // Resize canvas + offscreen FBO cleanly
    const ensureSize = () => {
      const host = containerRef?.current ?? canvas.parentElement;
      if (!host) return false;
      const cssW = Math.max(1, Math.round(host.clientWidth));
      const cssH = Math.max(1, Math.round(host.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(1, Math.round(cssW * dpr));
      const targetH = Math.max(1, Math.round(cssH * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      if (fboWidth !== targetW || fboHeight !== targetH) {
        fboWidth = targetW;
        fboHeight = targetH;
        gl.bindTexture(gl.TEXTURE_2D, fboTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          fboWidth,
          fboHeight,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          fboTex,
          0,
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
      return true;
    };

    // Priority-ordered texture download queue & GPU texture cache
    const textures = new Map<string, ManagedTexture>();
    const inFlight = new Set<string>();
    const failedKeys = new Set<string>();
    let activeDownloads = 0;
    const MAX_CONCURRENT_DOWNLOADS = 2;
    const MAX_CACHED_TEXTURES = 28;

    const getCacheKey = (cardId: string, variant: string) => `${cardId}::${variant}`;

    const pumpDownloadQueue = () => {
      if (disposed || activeDownloads >= MAX_CONCURRENT_DOWNLOADS) return;

      // Sort near cards by host-specified download priority (ascending)
      const candidates = cardsRef.current
        .filter((card) => card.near)
        .slice()
        .sort((a, b) => a.priority - b.priority);

      for (const card of candidates) {
        if (activeDownloads >= MAX_CONCURRENT_DOWNLOADS) break;
        const src = card.textures[card.variant];
        if (!src) continue;
        const key = getCacheKey(card.id, card.variant);
        const existing = textures.get(key);
        if (existing && existing.sourceRef === src) continue;

        // Clear prior failure status if source changed; keep existing GPU texture visible until new upload completes
        if (existing && existing.sourceRef !== src) {
          failedKeys.delete(key);
        }

        if (typeof src !== 'string') {
          const uploaded = uploadDrawableToTexture(gl, src);
          if (uploaded) {
            if (existing) gl.deleteTexture(existing.texture);
            textures.set(key, {
              texture: uploaded,
              sourceRef: src,
              lastUsedFrame: frameCounter,
            });
          }
          continue;
        }

        if (inFlight.has(key) || failedKeys.has(key)) continue;

        inFlight.add(key);
        activeDownloads += 1;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        const finalize = (ok: boolean) => {
          inFlight.delete(key);
          activeDownloads = Math.max(0, activeDownloads - 1);
          if (disposed) return;
          if (ok && img.naturalWidth > 0 && img.naturalHeight > 0) {
            const uploaded = uploadDrawableToTexture(gl, img);
            if (uploaded) {
              const prev = textures.get(key);
              if (prev) gl.deleteTexture(prev.texture);
              textures.set(key, {
                texture: uploaded,
                sourceRef: src,
                lastUsedFrame: frameCounter,
              });
            }
          } else {
            failedKeys.add(key);
          }
          pumpDownloadQueue();
        };

        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(() => finalize(true)).catch(() => finalize(true));
          } else {
            finalize(true);
          }
        };
        img.onerror = () => finalize(false);
        img.src = src;
      }

      // Evict oldest unused textures if cache grows above budget
      if (textures.size > MAX_CACHED_TEXTURES) {
        const activeKeys = new Set(
          cardsRef.current
            .filter((c) => c.near)
            .map((c) => getCacheKey(c.id, c.variant)),
        );
        const evictable = Array.from(textures.entries())
          .filter(([k]) => !activeKeys.has(k))
          .sort((a, b) => a[1].lastUsedFrame - b[1].lastUsedFrame);

        while (textures.size > MAX_CACHED_TEXTURES && evictable.length > 0) {
          const next = evictable.shift();
          if (!next) break;
          gl.deleteTexture(next[1].texture);
          textures.delete(next[0]);
        }
      }
    };

    syncTexturesRef.current = pumpDownloadQueue;
    pumpDownloadQueue();

    // Context lost handler — unmount immediately leaving page unchanged
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      disposed = true;
      window.cancelAnimationFrame(rafId);
      setContextLost(true);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    // Pause work when scrolled completely out of view
    const hostEl = containerRef?.current ?? canvas.parentElement;
    const io =
      hostEl && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              isInViewport = entries.some((entry) => entry.isIntersecting);
            },
            { threshold: 0 },
          )
        : null;
    if (io && hostEl) io.observe(hostEl);

    const ro =
      hostEl && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            ensureSize();
            refreshBackdrop();
          })
        : null;
    if (ro && hostEl) ro.observe(hostEl);

    ensureSize();
    const startMs = performance.now();

    const renderFrame = (nowMs: number) => {
      if (disposed) return;
      rafId = window.requestAnimationFrame(renderFrame);

      if (document.hidden || !isInViewport || stepAsideRef.current) {
        return;
      }

      if (!ensureSize() || fboWidth < 2 || fboHeight < 2) {
        return;
      }

      frameCounter += 1;
      const stageRect = canvas.getBoundingClientRect();
      if (stageRect.width < 2 || stageRect.height < 2) return;

      const dpr = fboWidth / stageRect.width;

      // ------------------------------------------------------------------
      // PASS 1: Mirror each near card's baked texture into offscreen FBO
      //         at its exact live DOM rectangle
      // ------------------------------------------------------------------
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, fboWidth, fboHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(cardProgram);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(uCardTex, 0);

      const activeCards = cardsRef.current;
      for (let i = 0; i < activeCards.length; i++) {
        const card = activeCards[i];
        if (!card.near) continue;

        const key = getCacheKey(card.id, card.variant);
        const entry = textures.get(key);
        if (!entry) continue;

        const el = card.getElement();
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) continue;

        // Cull cards far outside stage bounds (keep slight margin for meniscus pull)
        const marginX = stageRect.width * 0.25;
        const marginY = stageRect.height * 0.25;
        if (
          rect.right < stageRect.left - marginX ||
          rect.left > stageRect.right + marginX ||
          rect.bottom < stageRect.top - marginY ||
          rect.top > stageRect.bottom + marginY
        ) {
          continue;
        }

        entry.lastUsedFrame = frameCounter;

        const nx = (rect.left - stageRect.left) / stageRect.width;
        const ny = (rect.top - stageRect.top) / stageRect.height;
        const nw = rect.width / stageRect.width;
        const nh = rect.height / stageRect.height;

        gl.bindTexture(gl.TEXTURE_2D, entry.texture);
        gl.uniform4f(uCardRect, nx, ny, nw, nh);
        gl.uniform2f(uCardPx, rect.width * dpr, rect.height * dpr);
        gl.uniform1f(uCardRadius, (card.borderRadius ?? 20) * dpr);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      // ------------------------------------------------------------------
      // PASS 2: Refract, disperse RGB, and melt the two outer glass strips
      //         while leaving the center completely transparent
      // ------------------------------------------------------------------
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);

      const cfg = configRef.current;
      const desiredAxis = axisRef.current;
      const isVertical =
        desiredAxis === 'vertical' ||
        (desiredAxis === 'auto' && stageRect.height > stageRect.width * 1.12);

      const bg = backdropOverrideRef.current ?? detectedBackdrop;
      const bgLum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
      const darkFlag =
        isDarkOverrideRef.current !== undefined
          ? isDarkOverrideRef.current
            ? 1
            : 0
          : bgLum < 0.45
            ? 1
            : 0;

      gl.useProgram(lensProgram);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboTex);
      gl.uniform1i(uSceneFbo, 0);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, (nowMs - startMs) * 0.001);
      gl.uniform1i(uVertical, isVertical ? 1 : 0);
      gl.uniform1f(uStripSize, cfg.stripSize);
      gl.uniform1f(uRefraction, cfg.refraction);
      gl.uniform1f(uDispersion, cfg.dispersion);
      gl.uniform1f(uMeltBlurPx, cfg.meltBlur * dpr);
      gl.uniform1f(uLiquidRipple, cfg.liquidRipple);
      gl.uniform1f(uGlassSheen, cfg.glassSheen);
      gl.uniform1f(uEdgeFade, cfg.edgeFade);
      gl.uniform1f(uMeniscusCurve, cfg.meniscusCurve);
      gl.uniform3f(uBackdropRgb, bg[0], bg[1], bg[2]);
      gl.uniform1f(uIsDark, darkFlag);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      syncTexturesRef.current = null;
      window.cancelAnimationFrame(rafId);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      themeObserver.disconnect();
      io?.disconnect();
      ro?.disconnect();

      textures.forEach((entry) => gl.deleteTexture(entry.texture));
      textures.clear();
      if (fboTex) gl.deleteTexture(fboTex);
      if (fbo) gl.deleteFramebuffer(fbo);
      if (vao) gl.deleteVertexArray(vao);
      gl.deleteProgram(cardProgram);
      gl.deleteProgram(lensProgram);
    };
  }, [shouldMount, containerRef]);

  if (!shouldMount) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-20 h-full w-full transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        stepAside ? 'opacity-0' : 'opacity-100'
      } ${className}`.trim()}
    />
  );
}

export default LiquidLens;
