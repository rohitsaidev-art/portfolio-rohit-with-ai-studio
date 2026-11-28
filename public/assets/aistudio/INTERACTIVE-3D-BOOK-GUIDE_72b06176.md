# Interactive 3D Book — Complete Component & AI Studio Implementation Guide

Use this file directly in **Google AI Studio** (or any React + TypeScript + Vite/Next.js project) to implement the **WebGL2 / Three.js 3D Interactive Book** component with placeholder pages (ready to swap for your own images).

---

## Prompt for AI Studio
> Implement the `InteractiveBook` React + TypeScript + Three.js component below into my website. Install `three`, `@types/three`, and `lucide-react`, add the `.aqua` CSS rules to my global stylesheet and the Google Fonts to `index.html`, create all 5 files under `src/book/`, and render `<InteractiveBook />` using `generatePlaceholderBookAssets()` as the starter template.

---

## 1. Prerequisites, Dependencies & Fonts

### npm Packages
```bash
npm install three lucide-react
npm install -D @types/three
```
*(Uses React 18/19 and Tailwind CSS utility classes for the modal backdrop and floating controls.)*

### Google Fonts (`index.html` `<head>`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap"
  rel="stylesheet"
/>
```

---

## 2. Usage Example

```tsx
import { useMemo } from "react";
import { InteractiveBook } from "./book/InteractiveBook";
import { generatePlaceholderBookAssets } from "./book/placeholderAssets";

export function JournalShowcase() {
  const assets = useMemo(() => generatePlaceholderBookAssets(), []);

  return (
    <div className="flex min-h-[460px] items-center justify-center">
      <InteractiveBook
        collapsedWidth={240}
        collapsedHeight={320}
        sidesSpread={assets.sidesSpread}
        sidesSingle={assets.sidesSingle}
        backCover={assets.backCover}
        coverBare={assets.coverBare}
        coverSticker={assets.coverSticker}
        hotspots={assets.hotspots}
        pageWidth={assets.pageWidth}
        pageHeight={assets.pageHeight}
        glossAlpha={assets.glossAlpha}
        emailToCopy="hello@example.com"
      />
    </div>
  );
}
```

### Swapping in Your Own Pages
- Replace `sidesSpread` (even number of pages: `[frontCover, insideFront, page1, page2, ..., backCover]`) and `sidesSingle` (for mobile `<= 640px`) with your own WebP/PNG image URLs.
- Keep page dimensions proportional to `pageWidth / pageHeight` (default `420 / 560`, i.e., `3:4`).
- To make stickers or badges on your pages catch sunlight sheen when tilted, set their PNG alpha below `glossAlpha` (default `160` out of `255`); keep matte paper at alpha `255`.

---

## 3. Required CSS (`src/index.css`)

```css
@import "tailwindcss";

@layer base {
  body {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
}

.font-handwriting {
  font-family: "Caveat", cursive;
}

.font-editorial {
  font-family: "Newsreader", Georgia, serif;
}

/* Tactile Aqua Pill Buttons (for floating ←, →, Esc controls) */
.aqua {
  isolation: isolate;
  border: 1px solid var(--aqua-edge-now, var(--aqua-edge, #a8a29e));
  color: var(--aqua-ink-now, var(--aqua-ink, #78716c));
  background: radial-gradient(
    at 50% 75%,
    var(--aqua-1, #f5f5f4),
    var(--aqua-2, #e7e5e4),
    var(--aqua-3, #d6d3d1)
  );
  cursor: pointer;
  border-radius: 9999px;
  justify-content: center;
  align-items: center;
  transition: color 0.2s ease-out, border-color 0.2s ease-out, scale 0.2s ease-out;
  display: inline-flex;
  position: relative;
  box-shadow:
    0 2px 2px -1px #00000040,
    inset 0 4px 8px 1px #0a0a0a26,
    inset 0 -2px 2px #0a0a0a26;
}

.aqua::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: radial-gradient(
    at 50% 75%,
    var(--aqua-lit-1, #e7e5e4),
    var(--aqua-lit-2, #d6d3d1),
    var(--aqua-lit-3, #a8a29e)
  );
  opacity: var(--aqua-on, 0);
  transition: opacity 0.2s ease-out;
}

.aqua::after {
  content: "";
  position: absolute;
  top: 1px;
  left: var(--aqua-gloss-x, 2px);
  right: var(--aqua-gloss-x, 2px);
  border-radius: var(--aqua-gloss-radius, 12px 12px 4px 4px);
  pointer-events: none;
  background: linear-gradient(#ffffffb3, #ffffff33);
  height: 50%;
  transition: opacity 0.15s ease-out;
}

.aqua:hover:not(:disabled) {
  --aqua-on: 1;
  --aqua-ink-now: var(--aqua-lit-ink, #57534e);
  --aqua-edge-now: var(--aqua-lit-edge, #a8a29e);
}

.aqua:active:not(:disabled) {
  transition-duration: 0.2s, 0.2s, 0.1s;
  scale: 0.96;
}

.aqua:active:not(:disabled)::after {
  opacity: 0.75;
}

.aqua:disabled {
  cursor: default;
}

.aqua-pressed {
  --aqua-on: 1;
  --aqua-ink-now: var(--aqua-lit-ink, #57534e);
  --aqua-edge-now: var(--aqua-lit-edge, #a8a29e);
  scale: 0.94;
}

.aqua-round {
  --aqua-gloss-x: 5px;
}
```

---

## 4. Source Files

### `src/book/types.ts`

```ts
export interface BookHotspot {
  /** 0-indexed page side (0 = front cover, 1 = inside front cover, 2 = first right page, etc.) */
  side: number;
  /** Normalized horizontal coordinate [0..1] from spine/left edge */
  x: number;
  /** Normalized vertical coordinate [0..1] from top edge */
  y: number;
  /** Normalized width [0..1] */
  width: number;
  /** Normalized height [0..1] */
  height: number;
  /** Custom action key (e.g. 'copy-email') */
  action?: string;
  /** Optional URL to open in a new tab */
  href?: string;
  /** Optional accessible label */
  label?: string;
}

export interface BookStickerConfig {
  src: string;
  /** Horizontal offset on cover in normalized sheet space (0 = spine, 1 = fore-edge) */
  x: number;
  /** Vertical offset on cover [0..1] from top */
  y: number;
  /** Normalized sticker width relative to page width */
  width: number;
  /** Sticker image aspect ratio (width / height) */
  aspect: number;
  /** Rotation in degrees */
  rotation: number;
}

export interface BookEngineOptions {
  restHost: HTMLElement;
  stageHost: HTMLElement;
  restWidth: number;
  layout: 'spread' | 'single';
  /** Array of image URLs/data-URLs for every page side, starting with front cover [0] */
  sides: string[];
  /** Optional separate back cover texture when in single-page layout */
  backCover?: string;
  /** Bare cover image (without sticker) shown prior to stickOn completion */
  coverBare: string;
  /** Peel-on cover sticker configuration */
  coverSticker: BookStickerConfig;
  hotspots: BookHotspot[];
  pageWidth: number;
  pageHeight: number;
  /** Alpha threshold (0-255) encoding glossy sticker regions on page textures */
  glossAlpha: number;
  reducedMotion: boolean;
  onReady: () => void;
  onError: (err: unknown) => void;
  onDismiss: () => void;
  onReopen: () => void;
  onHotspot: (hotspot: BookHotspot) => void;
}

export interface BookEngineApi {
  /** Triggers the cover sticker peel-and-press animation */
  stickOn: () => void;
  /** Updates resting hover pointer position, or null when leaving */
  hover: (point: { x: number; y: number } | null) => void;
  /** Opens the book into full-stage reading mode */
  open: () => void;
  /** Closes the book back to the resting cover; resolves true when fully closed */
  close: (onMidClose?: () => void) => Promise<boolean>;
  /** Flips forward one sheet/page */
  flipNext: () => void;
  /** Flips backward one sheet/page */
  flipPrev: () => void;
  /** Cleans up WebGL resources, listeners, and canvas */
  dispose: () => void;
}
```

---

### `src/book/bookEngine.ts`

```ts
import * as THREE from 'three';
import type { BookEngineApi, BookEngineOptions, BookHotspot } from './types';

// Tuning constants preserved from the WebGL2 journal engine
const CURL = {
  arc: 0.6,
  maxAngleDeg: 40,
  cornerRollMax: 2.3,
  smoothTime: 0.4,
  directionSmoothTime: 0.4,
};

const DRAG = {
  stiffness: 64,
  dragPages: 1.5,
  dragSmoothTime: 0.25,
  commitProgress: 0.2,
  flickSpeed: 0.11,
  clickSlopPx: 5,
};

const IDLE = {
  progress: 0.045,
  smoothTime: 0.9,
};

const HOVER = {
  lift: 0.07,
  bias: 0.9,
  smoothTime: 0.35,
};

const HOLD = {
  delayMs: 350,
  firstGapMs: 300,
  fastestGapMs: 130,
  speedUpSheets: 8,
};

const CREASE = {
  glow: 0.22,
  glowWidth: 0.09,
  shade: 0.04,
  shadeCentre: 0.2,
  shadeWidth: 0.12,
};

const CLOSE_CASCADE = {
  stiffness: 200,
  staggerMs: 40,
  maxStaggerTotalMs: 250,
};

const SINGLE_LAYOUT = {
  swingEnd: 0.55,
  rollStart: 0.4,
  radius: 0.055,
  radiusStep: 0.003,
  skew: 4.5,
  skewStep: 0.9,
  skewStepMax: 9,
  skewJitter: 0.7,
  margin: 0.16,
  squareUpStart: 0.05,
  squareUpEnd: 0.4,
  peekScale: 0.4,
};

const STAGE_SPRING = {
  stiffness: 170,
  damping: 26,
};

const TILT = {
  x: 0.06,
  y: 0.085,
  smoothTime: 0.6,
};

const REST = {
  rotation: THREE.MathUtils.degToRad(3),
  hoverRotation: THREE.MathUtils.degToRad(-3),
  rotationSmoothTime: 0.5,
  tilt: 2.8,
  peekProgress: 0.09,
};

const CACHE = {
  loadRadius: 2,
  keepRadius: 3,
  pinnedSheets: 2,
};

const GLOSS = {
  sheen: 0.05,
  sheenPower: 14,
  glint: 0.2,
  glintPower: 45,
  dome: 0.9,
  fadeInTime: 1.2,
};

const STICKER = {
  columns: 28,
  rows: 20,
  samples: 56,
  shineAngle: THREE.MathUtils.degToRad(30),
  shinePower: 40,
  shine: 0.4,
  curl: 84,
  band: 1 / 7,
  arriveTime: 0.16,
  pressTime: 0.6,
  startScale: 1.12,
  startTurn: THREE.MathUtils.degToRad(6),
  startRise: 14 / 420,
  clearance: 0.002,
};

const LIGHT_DIR = new THREE.Vector3(-2.2, 1.6, 4);

const easeCosine = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const smoothstep01 = (t: number) => t * t * (3 - 2 * t);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

interface StickerMeshData {
  geometry: THREE.PlaneGeometry;
  flat: Float32Array;
  width: number;
  height: number;
  diagonal: number;
  along: THREE.Vector2;
  mesh: THREE.Mesh;
  material: THREE.MeshLambertMaterial;
  depthMaterial: THREE.MeshDepthMaterial;
  home: THREE.Vector3;
  turn: number;
  shineDirection: { value: THREE.Vector3 };
}

function createStickerBase(width: number, height: number) {
  const geometry = new THREE.PlaneGeometry(width, height, STICKER.columns, STICKER.rows);
  const flat = Float32Array.from(geometry.attributes.position.array);
  const diagonal = Math.hypot(width, height);
  const along = new THREE.Vector2(width / diagonal, height / diagonal);
  return { geometry, flat, width, height, diagonal, along };
}

function getStickerTimeline(elapsedSec: number) {
  return {
    arrived: easeOutCubic(clamp(elapsedSec / STICKER.arriveTime, 0, 1)),
    pressed: easeCosine(clamp((elapsedSec - 0.5 * STICKER.arriveTime) / STICKER.pressTime, 0, 1)),
  };
}

const stickerArcSamples = new Float32Array((STICKER.samples + 1) * 2);

function deformStickerCurl(sticker: StickerMeshData, pressed: number) {
  const step = sticker.diagonal / STICKER.samples;
  const maxAngle = THREE.MathUtils.degToRad(STICKER.curl);
  let angle = 0;
  let arcX = 0;
  let arcZ = 0;

  for (let i = 1; i <= STICKER.samples; i++) {
    const bandT = clamp(
      ((i - 0.5) / STICKER.samples + STICKER.band - pressed * (1 + STICKER.band)) / STICKER.band,
      0,
      1,
    );
    angle += (maxAngle / STICKER.samples) * bandT;
    arcX += Math.cos(angle) * step;
    arcZ += Math.sin(angle) * step;
    stickerArcSamples[2 * i] = arcX;
    stickerArcSamples[2 * i + 1] = arcZ;
  }

  const pos = sticker.geometry.attributes.position;
  const { flat, along } = sticker;
  const originX = -sticker.width / 2;
  const originY = -sticker.height / 2;

  for (let i = 0; i < pos.count; i++) {
    const dx = flat[3 * i] - originX;
    const dy = flat[3 * i + 1] - originY;
    const u = dx * along.x + dy * along.y;
    const v = -dx * along.y + dy * along.x;
    const sampleIdx = clamp(u / step, 0, STICKER.samples);
    const idx0 = Math.min(Math.floor(sampleIdx), STICKER.samples - 1);
    const frac = sampleIdx - idx0;
    const px = lerp(stickerArcSamples[2 * idx0], stickerArcSamples[2 * idx0 + 2], frac);
    const pz = lerp(stickerArcSamples[2 * idx0 + 1], stickerArcSamples[2 * idx0 + 3], frac);

    pos.setXYZ(i, originX + along.x * px - along.y * v, originY + along.y * px + along.x * v, pz);
  }
  pos.needsUpdate = true;
  sticker.geometry.computeVertexNormals();
}

const ROUNDED_CORNER_DISCARD = `
  vec2 sheetPx = vSheetUv * uPageSize;
  vec2 fromCorner = vec2(uPageSize.x - sheetPx.x, min(sheetPx.y, uPageSize.y - sheetPx.y));
  if (fromCorner.x < uCornerRadius && fromCorner.y < uCornerRadius && distance(fromCorner, vec2(uCornerRadius)) > uCornerRadius) discard;
`;

const FRAGMENT_UNIFORMS = `
  uniform sampler2D uFrontMap;
  uniform sampler2D uBackMap;
  uniform vec2 uPageSize;
  uniform float uCornerRadius;
  uniform float uCrease;
  uniform float uGlossRange;
  uniform float uGlossAmount;
  varying vec2 vSheetUv;
`;

interface SheetUniforms {
  uBendAngle: { value: number };
  uFold: { value: THREE.Vector2 };
  uCurl: { value: THREE.Vector2 };
  uFlipRotation: { value: THREE.Vector2 };
  uDirection: { value: number };
  uLift: { value: number };
  uDepth: { value: number };
  uHover: { value: THREE.Vector2 };
  uRoll: { value: THREE.Vector2 };
  uSkew: { value: number };
  uCrease: { value: number };
  uFrontMap: { value: THREE.Texture };
  uBackMap: { value: THREE.Texture };
  uPageSize: { value: THREE.Vector2 };
  uCornerRadius: { value: number };
  uGlossRange: { value: number };
  uGlossAmount: { value: number };
}

interface SheetFlight {
  from: number | null;
  to: number;
  start: number;
  stiffness: number;
  instant: boolean;
}

interface SheetState {
  mesh: THREE.Mesh;
  material: THREE.MeshLambertMaterial;
  depthMaterial: THREE.MeshDepthMaterial;
  uniforms: SheetUniforms;
  progress: number;
  velocity: number;
  flight: SheetFlight | null;
  direction: number;
  directionSmooth: number;
  curve: { arc: number; angleDeg: number };
  curveTarget: { arc: number; angleDeg: number };
  hover: { amount: number; y: number };
  flex: number;
  skewJitter: number;
}

interface ZoneHit {
  sheet: number;
  forward: boolean;
}

export function createBookEngine(options: BookEngineOptions): BookEngineApi {
  const {
    restHost,
    stageHost,
    restWidth,
    sides,
    hotspots,
    pageWidth,
    pageHeight,
    reducedMotion,
  } = options;

  const isSingle = options.layout === 'single';
  const sheetCount = isSingle ? sides.length : Math.ceil(sides.length / 2);
  const aspect = pageHeight / pageWidth;
  const halfHeight = aspect / 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 14.6);
  camera.position.set(0, 0, 4.6);

  const hemiLight = new THREE.HemisphereLight('#ffffff', '#bdb7ae', 2.2);
  hemiLight.position.set(0, 0, 1);
  scene.add(hemiLight);

  const keyDir = LIGHT_DIR.clone().normalize();
  const dirLight = new THREE.DirectionalLight('#ffffff', (Math.PI - 2.2) / keyDir.z);
  dirLight.position.copy(keyDir).multiplyScalar(6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.left = -1.8;
  dirLight.shadow.camera.right = 1.8;
  dirLight.shadow.camera.top = 1.5;
  dirLight.shadow.camera.bottom = -1.5;
  dirLight.shadow.camera.near = 2;
  dirLight.shadow.camera.far = 10;
  dirLight.shadow.bias = -0.0015;
  dirLight.shadow.radius = 6;
  scene.add(dirLight, dirLight.target);

  const shadowGeo = new THREE.PlaneGeometry(8, 8);
  const shadowMat = new THREE.ShadowMaterial({ opacity: 0.22 });
  const shadowFloor = new THREE.Mesh(shadowGeo, shadowMat);
  shadowFloor.position.z = -0.004 * (sheetCount + 1);
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);

  const bookRoot = new THREE.Group();
  const spineGroup = new THREE.Group();
  bookRoot.add(spineGroup);
  scene.add(bookRoot);

  const blankTexture = new THREE.DataTexture(new Uint8Array([245, 245, 244, 255]), 1, 1);
  blankTexture.colorSpace = THREE.SRGBColorSpace;
  blankTexture.needsUpdate = true;

  const glossAmount = { value: 0 };
  let glossTarget = 0;

  const sheetGeo = new THREE.PlaneGeometry(1, aspect, 64, 32);
  const sheetUv = sheetGeo.attributes.uv;
  for (let i = 0; i < sheetUv.count; i++) {
    sheetUv.setX(i, Math.pow(sheetUv.getX(i), 2));
  }

  const sheetVertexCommon = `
    uniform float uBendAngle;
    uniform vec2 uFold;
    uniform vec2 uCurl;
    uniform vec2 uFlipRotation;
    uniform float uDirection;
    uniform float uLift;
    uniform float uDepth;
    uniform vec2 uHover;
    uniform vec2 uRoll;
    uniform float uSkew;
    varying vec2 vSheetUv;

    const float SHEET_ASPECT = ${aspect.toFixed(5)};
    const float NORMAL_EPSILON = 0.02;

    vec3 sheetPosition(vec2 st) {
      float flatX = st.x;
      float flatY = (st.y - 0.5) * SHEET_ASPECT;

      float rise = sin(min(flatX / 0.14, 1.0) * 1.57079633);
      float lift = uLift * rise * mix(1.0, 0.4, smoothstep(0.14, 1.0, flatX));

      float localU = flatX * uFold.x + flatY * uFold.y;
      float localV = -flatX * uFold.y + flatY * uFold.x;
      float beyondCurl = max(0.0, localU - uCurl.x);
      float cylinderAngle = beyondCurl / uCurl.y * uBendAngle;
      float sinc = abs(cylinderAngle) < 1e-4 ? 1.0 : sin(cylinderAngle) / cylinderAngle;
      float versine = abs(cylinderAngle) < 1e-4 ? 0.0 : (1.0 - cos(cylinderAngle)) / cylinderAngle;
      float curledU = localU - beyondCurl + beyondCurl * sinc;
      float curledZ = -uDirection * beyondCurl * versine;

      float px = curledU * uFold.x - localV * uFold.y;
      float py = curledU * uFold.y + localV * uFold.x;

      float rolled = clamp(px / uRoll.y, 0.0, 1.0);
      float rollAngle = uRoll.x * rolled;
      float rollX = px;
      float rollZ = 0.0;
      if (uRoll.x > 1e-4) {
        float rollRadius = uRoll.y / uRoll.x;
        float beyondRoll = max(px - uRoll.y, 0.0);
        rollX = rollRadius * sin(rollAngle) + beyondRoll * cos(uRoll.x);
        rollZ = rollRadius * (1.0 - cos(rollAngle)) + beyondRoll * sin(uRoll.x);
      }
      rollX -= curledZ * sin(rollAngle);
      rollZ += curledZ * cos(rollAngle);

      float x = rollX * uFlipRotation.x - rollZ * uFlipRotation.y;
      float z = rollX * uFlipRotation.y + rollZ * uFlipRotation.x;

      float skew = uSkew * rolled;
      vec2 fromFoot = vec2(x, py + 0.5 * SHEET_ASPECT);
      x = fromFoot.x * cos(skew) - fromFoot.y * sin(skew);
      py = fromFoot.x * sin(skew) + fromFoot.y * cos(skew) - 0.5 * SHEET_ASPECT;

      float hoverLift = uHover.x * flatX * flatX * (1.0 + uHover.y * (st.y * 2.0 - 1.0));

      return vec3(x, py, z + lift + hoverLift - uDepth);
    }
  `;

  const pageSizeVec = new THREE.Vector2(pageWidth, pageHeight);
  const glossRangeVal = 1 - options.glossAlpha / 255;

  const sheets: SheetState[] = Array.from({ length: sheetCount }, (_, index) => {
    const isCover = index === 0 || (!isSingle && index === sheetCount - 1);
    const uniforms: SheetUniforms = {
      uBendAngle: { value: 0 },
      uFold: { value: new THREE.Vector2(1, 0) },
      uCurl: { value: new THREE.Vector2(0, 1) },
      uFlipRotation: { value: new THREE.Vector2(1, 0) },
      uDirection: { value: 1 },
      uLift: { value: 0 },
      uDepth: { value: 0 },
      uHover: { value: new THREE.Vector2(0, 0) },
      uRoll: { value: new THREE.Vector2(0, 1) },
      uSkew: { value: 0 },
      uCrease: { value: 0 },
      uFrontMap: { value: blankTexture },
      uBackMap: { value: blankTexture },
      uPageSize: { value: pageSizeVec },
      uCornerRadius: { value: isCover ? 12 : 16 },
      uGlossRange: { value: glossRangeVal },
      uGlossAmount: glossAmount,
    };

    const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader =
        sheetVertexCommon +
        shader.vertexShader
          .replace(
            '#include <beginnormal_vertex>',
            `
          vec3 sheetP = sheetPosition(uv);
          vec3 sheetPx = sheetPosition(uv + vec2(NORMAL_EPSILON, 0.0));
          vec3 sheetPy = sheetPosition(uv + vec2(0.0, NORMAL_EPSILON / SHEET_ASPECT));
          vec3 objectNormal = normalize(cross(sheetPx - sheetP, sheetPy - sheetP));
        `,
          )
          .replace(
            '#include <begin_vertex>',
            `
          vec3 transformed = sheetP;
          vSheetUv = uv;
        `,
          );

      shader.fragmentShader =
        FRAGMENT_UNIFORMS +
        shader.fragmentShader
          .replace(
            '#include <map_fragment>',
            `
          ${ROUNDED_CORNER_DISCARD}

          vec4 frontColor = texture2D(uFrontMap, vSheetUv);
          vec4 backColor = texture2D(uBackMap, vec2(1.0 - vSheetUv.x, vSheetUv.y));
          vec4 sheetColor = gl_FrontFacing ? frontColor : backColor;
          diffuseColor.rgb *= sheetColor.rgb;
          float sheetGloss = clamp((1.0 - sheetColor.a) / uGlossRange, 0.0, 1.0);

          float crease = gl_FrontFacing ? uCrease : 0.0;
          float creaseGlow = exp(-pow(vSheetUv.x / ${CREASE.glowWidth.toFixed(3)}, 2.0));
          float creaseShade = exp(-pow((vSheetUv.x - ${CREASE.shadeCentre.toFixed(3)}) / ${CREASE.shadeWidth.toFixed(3)}, 2.0));
          diffuseColor.rgb = min(diffuseColor.rgb * (1.0 + ${CREASE.glow.toFixed(3)} * creaseGlow * crease), vec3(1.0));
          diffuseColor.rgb *= 1.0 - ${CREASE.shade.toFixed(3)} * creaseShade * crease;
        `,
          )
          .replace(
            '#include <normal_fragment_begin>',
            `
          vec3 normal = normalize(vNormal);
          float faceDirection = normal.z >= 0.0 ? 1.0 : -1.0;
          normal *= faceDirection;
          vec3 nonPerturbedNormal = normal;
        `,
          )
          .replace(
            '#include <opaque_fragment>',
            `
          #if NUM_DIR_LIGHTS > 0
            vec2 glossBow = vec2((vSheetUv.x - 0.5) * (gl_FrontFacing ? 1.0 : -1.0), (vSheetUv.y - 0.5) * uPageSize.y / uPageSize.x);
            vec3 glossNormal = normalize(normal + ${GLOSS.dome.toFixed(3)} * vec3(glossBow, 0.0));
            vec3 glossHalf = normalize(directionalLights[0].direction + normalize(vViewPosition));
            float glossFacing = max(dot(glossNormal, glossHalf), 0.0);

            float glossLit = 1.0;
            #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
              DirectionalLightShadow glossShadow = directionalLightShadows[0];
              glossLit = receiveShadow ? getShadow(directionalShadowMap[0], glossShadow.shadowMapSize, glossShadow.shadowIntensity, glossShadow.shadowBias, glossShadow.shadowRadius, vDirectionalShadowCoord[0]) : 1.0;
            #endif

            outgoingLight += sheetGloss * uGlossAmount * glossLit * (
              ${GLOSS.sheen.toFixed(3)} * pow(glossFacing, ${GLOSS.sheenPower.toFixed(1)}) +
              ${GLOSS.glint.toFixed(3)} * pow(glossFacing, ${GLOSS.glintPower.toFixed(1)})
            );
          #endif
          #include <opaque_fragment>
        `,
          );
    };

    const depthMaterial = new THREE.MeshDepthMaterial({ side: THREE.DoubleSide });
    depthMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader =
        sheetVertexCommon +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
        vec3 transformed = sheetPosition(uv);
        vSheetUv = uv;
      `,
        );
      shader.fragmentShader =
        FRAGMENT_UNIFORMS +
        shader.fragmentShader.replace(
          'void main() {',
          `void main() {\n        ${ROUNDED_CORNER_DISCARD}\n      `,
        );
    };

    const mesh = new THREE.Mesh(sheetGeo, material);
    mesh.customDepthMaterial = depthMaterial;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    spineGroup.add(mesh);

    return {
      mesh,
      material,
      depthMaterial,
      uniforms,
      progress: 0,
      velocity: 0,
      flight: null,
      direction: 1,
      directionSmooth: 1,
      curve: { arc: 0, angleDeg: 0 },
      curveTarget: { arc: 0, angleDeg: 0 },
      hover: { amount: 0, y: 0 },
      flex: isCover ? 0.3 : 1,
      skewJitter: (2 * Math.random() - 1) * SINGLE_LAYOUT.skewJitter,
    };
  });

  const sticker: StickerMeshData = (() => {
    const { x, y, width, aspect: stAspect, rotation } = options.coverSticker;
    const base = createStickerBase(width, width / stAspect);
    const shineDirection = { value: new THREE.Vector3(0, 0, 1) };

    const material = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.01,
      opacity: 0,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uShineDirection = shineDirection;
      shader.fragmentShader =
        'uniform vec3 uShineDirection;\n' +
        shader.fragmentShader.replace(
          '#include <opaque_fragment>',
          `
        float shine = pow(max(dot(normal, uShineDirection), 0.0), ${STICKER.shinePower.toFixed(1)});
        outgoingLight += ${STICKER.shine.toFixed(3)} * shine * (gl_FrontFacing ? 1.0 : 0.0);
        #include <opaque_fragment>
      `,
        );
    };

    const depthMaterial = new THREE.MeshDepthMaterial({ alphaTest: 0.5 });
    const mesh = new THREE.Mesh(base.geometry, material);
    mesh.customDepthMaterial = depthMaterial;
    mesh.castShadow = true;
    mesh.visible = false;
    mesh.renderOrder = 1;

    const home = new THREE.Vector3(x, (0.5 - y) * aspect, STICKER.clearance);
    const turn = -THREE.MathUtils.degToRad(rotation);
    spineGroup.add(mesh);

    return {
      ...base,
      mesh,
      material,
      depthMaterial,
      home,
      turn,
      shineDirection,
    };
  })();

  let stickerPhase: 'waiting' | 'sticking' | 'done' = 'waiting';
  let stickerStartMs = 0;

  function finishSticker() {
    if (stickerPhase === 'done') return;
    stickerPhase = 'done';
    sticker.mesh.visible = false;
    if (sideTextures[0]) {
      sheets[0].uniforms.uFrontMap.value = sideTextures[0];
    }
    glossTarget = 1;
    requestTick();
  }

  const shineWorldDir = new THREE.Vector3();
  let mode: 'rest' | 'opening' | 'open' | 'closing' = 'rest';
  let currentSheet = 0;
  let activeHost: HTMLElement = restHost;

  const restTransform = {
    x: 0,
    y: 0,
    rotation: REST.rotation,
  };
  const stageBlend = {
    value: 0,
    velocity: 0,
    target: 0,
  };

  let singleSquareUp = 1;
  let shadowFade = 1;
  let closeCallbackFired = false;
  let midCloseCb: (() => void) | null = null;
  let closeResolve: ((closed: boolean) => void) | null = null;

  let canvasLeft = 0;
  let canvasTop = 0;
  let hostWidth = 1;
  let hostHeight = 1;
  let openPagePxWidth = pageWidth;

  const pointer = { x: 0, y: 0, inside: false, isMouse: false };
  const tiltSmooth = { x: 0, y: 0 };

  interface PointerDownState {
    x: number;
    y: number;
    at: number;
    zone: ZoneHit | null;
    hotspot: BookHotspot | null;
    moved: boolean;
    holding: boolean;
  }
  interface DragState {
    index: number;
    forward: boolean;
    base: number;
    target: number;
  }

  let downState: PointerDownState | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let holdFlipCount = 0;
  let dragState: DragState | null = null;

  let rafId = 0;
  let lastFrameMs = 0;
  let readyFired = false;
  let disposed = false;

  const textureLoader = new THREE.TextureLoader();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const sideTextures: Array<THREE.Texture | null> = sides.map(() => null);
  const requestedSides = new Set<number>();
  let backCoverTex: THREE.Texture | null = null;
  let bareCoverTex: THREE.Texture | null = null;

  function getSideUniform(sideIdx: number) {
    if (isSingle) return sheets[sideIdx].uniforms.uFrontMap;
    const { uniforms } = sheets[sideIdx >> 1];
    return sideIdx % 2 === 0 ? uniforms.uFrontMap : uniforms.uBackMap;
  }

  function checkReady() {
    if (
      !readyFired &&
      bareCoverTex &&
      sticker.material.map &&
      [0, 1, 2].every((idx) => idx >= sides.length || sideTextures[idx])
    ) {
      readyFired = true;
      stepSimulation(0, performance.now());
      renderer.render(scene, camera);
      options.onReady();
    }
  }

  function loadStaticTexture(url: string, onLoaded: (tex: THREE.Texture) => void) {
    textureLoader.load(
      url,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAnisotropy;
        renderer.initTexture(tex);
        onLoaded(tex);
        checkReady();
        requestTick();
      },
      undefined,
      (err) => {
        if (!disposed) options.onError(err);
      },
    );
  }

  if (isSingle && options.backCover) {
    textureLoader.load(options.backCover, (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      backCoverTex = tex;
      sheets[sheetCount - 1].uniforms.uBackMap.value = tex;
      requestTick();
    });
  }

  function updateTextureWindow(evictFar = true) {
    const sidesPerSheet = isSingle ? 1 : 2;
    const scale = 2 / sidesPerSheet;

    for (let s = 0; s < sheetCount; s++) {
      const dist = Math.min(Math.abs(s - currentSheet), Math.abs(s - (currentSheet - 1)));
      if (dist <= CACHE.loadRadius * scale) {
        for (let k = 0; k < sidesPerSheet; k++) {
          const sideIdx = s * sidesPerSheet + k;
          if (sideIdx >= sides.length || requestedSides.has(sideIdx)) continue;
          requestedSides.add(sideIdx);
          textureLoader.load(
            sides[sideIdx],
            (tex) => {
              if (disposed || !requestedSides.has(sideIdx)) {
                tex.dispose();
                return;
              }
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.anisotropy = maxAnisotropy;
              renderer.initTexture(tex);
              sideTextures[sideIdx] = tex;
              if (sideIdx !== 0 || stickerPhase === 'done') {
                getSideUniform(sideIdx).value = tex;
              }
              checkReady();
              requestTick();
            },
            undefined,
            (err) => {
              if (!disposed) options.onError(err);
            },
          );
        }
      } else if (evictFar && dist > CACHE.keepRadius * scale && s >= CACHE.pinnedSheets * scale) {
        for (let k = 0; k < sidesPerSheet; k++) {
          const sideIdx = s * sidesPerSheet + k;
          if (requestedSides.delete(sideIdx)) {
            sideTextures[sideIdx]?.dispose();
            sideTextures[sideIdx] = null;
            getSideUniform(sideIdx).value = blankTexture;
          }
        }
      }
    }
  }

  loadStaticTexture(options.coverBare, (tex) => {
    bareCoverTex = tex;
    if (stickerPhase !== 'done') {
      sheets[0].uniforms.uFrontMap.value = tex;
    }
  });

  loadStaticTexture(options.coverSticker.src, (tex) => {
    sticker.material.map = tex;
    sticker.material.needsUpdate = true;
    sticker.depthMaterial.map = tex;
    sticker.depthMaterial.needsUpdate = true;
  });

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const invMatrix = new THREE.Matrix4();
  const localRay = new THREE.Ray();

  function pickBookPlane(clientX: number, clientY: number): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect();
    canvasLeft = rect.left;
    canvasTop = rect.top;
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -2 * ((clientY - rect.top) / rect.height) + 1);
    raycaster.setFromCamera(ndc, camera);
    spineGroup.updateWorldMatrix(true, false);
    localRay.copy(raycaster.ray).applyMatrix4(invMatrix.copy(spineGroup.matrixWorld).invert());
    if (Math.abs(localRay.direction.z) < 1e-6) return null;
    const t = -localRay.origin.z / localRay.direction.z;
    return {
      x: localRay.origin.x + localRay.direction.x * t,
      y: localRay.origin.y + localRay.direction.y * t,
    };
  }

  function hitTestZone(pt: { x: number; y: number } | null): ZoneHit | null {
    if (!pt || Math.abs(pt.y) > halfHeight) return null;
    if (isSingle) {
      if (pt.x < 0 || pt.x > 1) return null;
      return currentSheet === 0 || pt.x >= 0.5
        ? { sheet: currentSheet, forward: true }
        : { sheet: currentSheet - 1, forward: false };
    }
    if (pt.x >= 0 && pt.x <= 1 && currentSheet < sheetCount) {
      return { sheet: currentSheet, forward: true };
    }
    if (pt.x < 0 && pt.x >= -1 && currentSheet > 0) {
      return { sheet: currentSheet - 1, forward: false };
    }
    return null;
  }

  function hitTestHotspot(pt: { x: number; y: number }, zone: ZoneHit): BookHotspot | null {
    if (dragState || !sheets.every((s) => !s.flight)) return null;
    const side = isSingle ? currentSheet : zone.forward ? 2 * zone.sheet : 2 * zone.sheet + 1;
    const u = isSingle || zone.forward ? pt.x : 1 + pt.x;
    const v = 0.5 - pt.y / aspect;
    return hotspots.find((h) => h.side === side && u >= h.x && u <= h.x + h.width && v >= h.y && v <= h.y + h.height) ?? null;
  }

  function computeCurlTarget(pt: { x: number; y: number }) {
    let deg = THREE.MathUtils.radToDeg(Math.atan2(pt.y, pt.x));
    if (deg > 90) deg = 180 - deg;
    if (deg < -90) deg = -180 - deg;
    const angleDeg = clamp(-(deg / 90) * CURL.maxAngleDeg * Math.hypot(pt.x, pt.y), -CURL.maxAngleDeg, CURL.maxAngleDeg);
    const rad = THREE.MathUtils.degToRad(Math.abs(angleDeg));
    const maxArc = CURL.cornerRollMax / ((Math.cos(rad) / (1 - halfHeight * Math.sin(rad))) * Math.PI);
    return {
      arc: Math.min(CURL.arc, maxArc),
      angleDeg,
    };
  }

  function setSheetCurve(sheet: SheetState, target: { arc: number; angleDeg: number }, snap: boolean) {
    sheet.curveTarget = target;
    if (snap) sheet.curve = { ...target };
  }

  function launchSheetFlight(sheetIdx: number, to: number, stiffness: number, delayMs = 0) {
    sheets[sheetIdx].flight = {
      from: null,
      to,
      start: performance.now() + (reducedMotion ? 0 : delayMs),
      stiffness,
      instant: reducedMotion,
    };
  }

  function flipSheet(sheetIdx: number, forward: boolean, pt: { x: number; y: number }) {
    const sheet = sheets[sheetIdx];
    const atRest = !sheet.flight && (sheet.progress < 1e-4 || sheet.progress > 0.9999);
    setSheetCurve(sheet, computeCurlTarget(pt), atRest);
    sheet.direction = forward ? 1 : -1;
    currentSheet = forward ? sheetIdx + 1 : sheetIdx;
    launchSheetFlight(sheetIdx, forward ? 1 : 0, DRAG.stiffness);
    updateTextureWindow();
    requestTick();
  }

  function defaultFlipPoint(forward: boolean) {
    return { x: forward ? 0.9 : -0.9, y: (Math.random() - 0.5) * 0.7 };
  }

  function clearHoldTimer() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = null;
  }

  function isSingleAtEnd() {
    return isSingle && currentSheet === sheetCount;
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button === 0 && mode === 'closing') {
      if (hitTestZone(pickBookPlane(e.clientX, e.clientY))) {
        mode = 'opening';
        closeCallbackFired = false;
        midCloseCb = null;
        stageBlend.target = 1;
        closeResolve?.(false);
        closeResolve = null;
        options.onReopen();
        requestTick();
      }
      return;
    }

    if (e.button !== 0 || mode !== 'open' || isSingleAtEnd()) return;

    const pt = pickBookPlane(e.clientX, e.clientY);
    const zone = hitTestZone(pt);
    const hotspot = pt && zone ? hitTestHotspot(pt, zone) : null;

    downState = {
      x: e.clientX,
      y: e.clientY,
      at: performance.now(),
      zone,
      hotspot,
      moved: false,
      holding: false,
    };

    if (pt && zone && !hotspot) {
      const sheet = sheets[zone.sheet];
      const atRest = !sheet.flight && (sheet.progress < 1e-4 || sheet.progress > 0.9999);
      setSheetCurve(sheet, computeCurlTarget(pt), atRest);
      sheet.flight = null;
      sheet.direction = zone.forward ? 1 : -1;
      dragState = {
        index: zone.sheet,
        forward: zone.forward,
        base: sheet.progress,
        target: sheet.progress,
      };
      const forward = zone.forward;
      holdFlipCount = 0;
      clearHoldTimer();
      holdTimer = setTimeout(function stepHold() {
        holdTimer = null;
        if (!downState || downState.moved || mode !== 'open' || (forward ? currentSheet >= sheetCount : currentSheet <= 0)) {
          return;
        }
        downState.holding = true;
        dragState = null;
        flipSheet(forward ? currentSheet : currentSheet - 1, forward, defaultFlipPoint(forward));
        const accelT = Math.min(holdFlipCount++ / HOLD.speedUpSheets, 1);
        holdTimer = setTimeout(stepHold, lerp(HOLD.firstGapMs, HOLD.fastestGapMs, accelT));
      }, HOLD.delayMs);
    }

    canvas.setPointerCapture(e.pointerId);
    requestTick();
  }

  function onPointerMove(e: PointerEvent) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.inside = true;
    pointer.isMouse = e.pointerType === 'mouse';

    if (downState) {
      const dx = e.clientX - downState.x;
      const dy = e.clientY - downState.y;
      if (!downState.holding && dx * dx + dy * dy > DRAG.clickSlopPx * DRAG.clickSlopPx) {
        downState.moved = true;
      }
      if (downState.moved) clearHoldTimer();
      if (dragState && downState.moved) {
        dragState.target = clamp(dragState.base - dx / (openPagePxWidth * DRAG.dragPages), 0, 1);
        const pt = pickBookPlane(e.clientX, e.clientY);
        if (pt) setSheetCurve(sheets[dragState.index], computeCurlTarget(pt), false);
      }
    }
    requestTick();
  }

  function finishPointer(e: PointerEvent, cancelled: boolean) {
    if (!downState) return;
    const { zone, hotspot, moved, holding } = downState;
    const dragDistX = downState.x - e.clientX;
    const elapsed = Math.max(1, performance.now() - downState.at);
    const activeDrag = dragState;

    downState = null;
    dragState = null;
    clearHoldTimer();
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    requestTick();

    if (holding) return;
    if (!activeDrag) {
      if (cancelled || moved) return;
      if (hotspot) {
        options.onHotspot(hotspot);
      } else if (!zone) {
        options.onDismiss();
      }
      return;
    }

    if (!moved && !cancelled) {
      const pt = pickBookPlane(e.clientX, e.clientY) ?? defaultFlipPoint(activeDrag.forward);
      flipSheet(activeDrag.index, activeDrag.forward, pt);
      return;
    }

    const delta = activeDrag.forward ? activeDrag.target - activeDrag.base : activeDrag.base - activeDrag.target;
    const flickVel = (activeDrag.forward ? dragDistX : -dragDistX) / elapsed;
    const flicked = delta > 0 && flickVel > DRAG.flickSpeed;
    const committed = !cancelled && (delta >= DRAG.commitProgress || flicked);
    const targetForward = activeDrag.forward === committed;

    sheets[activeDrag.index].direction = targetForward ? 1 : -1;
    currentSheet = targetForward ? activeDrag.index + 1 : activeDrag.index;
    launchSheetFlight(activeDrag.index, targetForward ? 1 : 0, DRAG.stiffness);
    updateTextureWindow();
  }

  const onPointerUp = (e: PointerEvent) => finishPointer(e, false);
  const onPointerCancel = (e: PointerEvent) => finishPointer(e, true);
  const onPointerLeave = () => {
    pointer.inside = false;
    requestTick();
  };

  function resize() {
    hostWidth = activeHost.clientWidth || 1;
    hostHeight = activeHost.clientHeight || 1;
    const scale = Math.min(
      stageHost.clientHeight / 860,
      (stageHost.clientWidth - 16) / (pageWidth * (isSingle ? 1 + SINGLE_LAYOUT.margin : 2)),
      (stageHost.clientHeight - 16) / pageHeight,
    );
    openPagePxWidth = pageWidth * Math.max(scale, 0.1);
    if (mode === 'rest') {
      restTransform.x = hostWidth / 2;
      restTransform.y = hostHeight / 2;
    }
    camera.aspect = hostWidth / hostHeight;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(hostHeight / openPagePxWidth / 9.2));
    camera.updateProjectionMatrix();

    const dpr = Math.min(window.devicePixelRatio, 2, Math.sqrt(1e7 / (hostWidth * hostHeight)));
    renderer.setPixelRatio(dpr);
    renderer.setSize(hostWidth, hostHeight, false);
    requestTick();
  }

  function stepSimulation(dt: number, nowMs: number): boolean {
    let needsMore = false;

    for (const sheet of sheets) {
      const flight = sheet.flight;
      if (!flight) continue;
      needsMore = true;
      if (nowMs < flight.start) continue;

      if (flight.from == null) flight.from = sheet.progress;
      sheet.direction = flight.to >= flight.from ? 1 : -1;

      if (flight.instant) {
        sheet.progress = flight.to;
        sheet.velocity = 0;
        sheet.flight = null;
        continue;
      }

      const damping = 2 * Math.sqrt(flight.stiffness);
      for (let rem = dt; rem > 0; rem -= 1 / 120) {
        const subDt = Math.min(rem, 1 / 120);
        sheet.velocity += (flight.stiffness * (flight.to - sheet.progress) - damping * sheet.velocity) * subDt;
        sheet.progress += sheet.velocity * subDt;
      }

      if (sheet.progress < 0 || sheet.progress > 1) {
        sheet.progress = clamp(sheet.progress, 0, 1);
        sheet.velocity = 0;
      }
      if (Math.abs(flight.to - sheet.progress) < 1e-4 && Math.abs(sheet.velocity) < 0.01) {
        sheet.progress = flight.to;
        sheet.velocity = 0;
        sheet.flight = null;
      }
    }

    if (dragState) {
      const sheet = sheets[dragState.index];
      const prev = sheet.progress;
      sheet.progress += (dragState.target - sheet.progress) * (1 - Math.pow(0.01, dt / DRAG.dragSmoothTime));
      if (dt > 0) sheet.velocity = (sheet.progress - prev) / dt;
      needsMore = true;
    }

    const isRest = mode === 'rest';
    const hoveringBook = (mode === 'open' || isRest) && pointer.inside;
    const hoverPt = hoveringBook ? pickBookPlane(pointer.x, pointer.y) : null;
    const hoverZone = isRest ? (hoverPt ? { sheet: 0, forward: true } : null) : hitTestZone(hoverPt);
    const overHotspot = !isRest && hoverPt && hoverZone ? hitTestHotspot(hoverPt, hoverZone) : null;

    canvas.style.cursor = hoverZone ? 'pointer' : '';

    const canPeekDirection = hoverZone && (hoverZone.forward || !isSingle);
    const stickerDoneOrOpen = !isRest || stickerPhase === 'done';
    const activePeekZone =
      hoverZone && canPeekDirection && stickerDoneOrOpen && !overHotspot && !downState && pointer.isMouse && !reducedMotion
        ? hoverZone
        : null;

    const peekAmt = (isRest ? REST.peekProgress : IDLE.progress) * (isSingle ? SINGLE_LAYOUT.peekScale : 1);
    const idleLerp = 1 - Math.pow(0.001, dt / IDLE.smoothTime);

    sheets.forEach((sheet, idx) => {
      if (sheet.flight || dragState?.index === idx) return;
      const baseTarget = idx < currentSheet ? 1 : 0;
      let target = baseTarget;
      if (activePeekZone?.sheet === idx && hoverPt) {
        target = baseTarget === 0 ? peekAmt : 1 - peekAmt;
        setSheetCurve(sheet, computeCurlTarget(hoverPt), Math.abs(sheet.progress - baseTarget) < 1e-4);
      }
      const diff = target - sheet.progress;
      if (Math.abs(diff) < 1e-4) {
        sheet.progress = target;
      } else {
        sheet.progress += diff * idleLerp;
        needsMore = true;
      }
      sheet.direction = baseTarget === 1 && sheet.progress !== baseTarget ? -1 : 1;
      sheet.directionSmooth = sheet.direction;
    });

    for (let i = 1; i < sheetCount; i++) {
      sheets[i].progress = Math.min(sheets[i].progress, sheets[i - 1].progress);
    }

    if (isSingle) {
      const last = sheets[sheetCount - 1];
      singleSquareUp =
        1 - smoothstep01(clamp((last.progress - SINGLE_LAYOUT.squareUpStart) / (SINGLE_LAYOUT.squareUpEnd - SINGLE_LAYOUT.squareUpStart), 0, 1));
      if (isSingleAtEnd() && !last.flight && last.progress > 0.9999) {
        for (const s of sheets) {
          s.progress = 0;
          s.direction = 1;
          s.directionSmooth = 1;
        }
        currentSheet = 0;
        singleSquareUp = 1;
        updateTextureWindow();
      }
    }

    const curveLerp = 1 - Math.pow(0.001, dt / CURL.smoothTime);
    const dirLerp = 1 - Math.pow(0.001, dt / CURL.directionSmoothTime);

    let totalProgress = 0;
    for (const s of sheets) totalProgress += s.progress;

    const openWeight = clamp(totalProgress, 0, 1) * (isSingle ? singleSquareUp : clamp(sheetCount - totalProgress, 0, 1));
    const targetShadowFade = !isSingle || totalProgress < 1e-4 ? 1 : 0;
    shadowFade += (targetShadowFade - shadowFade) * (1 - Math.pow(0.001, dt / 0.4));
    if (Math.abs(targetShadowFade - shadowFade) > 0.005) {
      needsMore = true;
    } else {
      shadowFade = targetShadowFade;
    }
    shadowMat.opacity = 0.22 * shadowFade;
    shadowFloor.visible = shadowFade > 0;

    // Sticker arrival & press-on animation
    const stickerAnimating = (() => {
      if (stickerPhase !== 'sticking') return false;
      const { arrived, pressed } = getStickerTimeline((nowMs - stickerStartMs) / 1000);
      deformStickerCurl(sticker, pressed);
      sticker.mesh.visible = true;
      sticker.material.opacity = arrived;
      sticker.mesh.scale.setScalar(lerp(STICKER.startScale, 1, arrived));
      sticker.mesh.rotation.z = sticker.turn + (1 - arrived) * STICKER.startTurn;
      sticker.mesh.position.set(sticker.home.x, sticker.home.y + (1 - arrived) * STICKER.startRise, sticker.home.z);
      sticker.mesh.updateWorldMatrix(true, false);
      shineWorldDir.set(-sticker.along.x, -sticker.along.y, 0).transformDirection(sticker.mesh.matrixWorld);
      sticker.shineDirection.value
        .set(0, 0, Math.cos(STICKER.shineAngle))
        .addScaledVector(shineWorldDir, Math.sin(STICKER.shineAngle))
        .normalize();
      if (pressed >= 1) {
        finishSticker();
        return false;
      }
      return true;
    })();
    if (stickerAnimating) needsMore = true;

    glossAmount.value += (glossTarget - glossAmount.value) * (1 - Math.pow(0.001, dt / GLOSS.fadeInTime));
    if (Math.abs(glossTarget - glossAmount.value) > 0.002) {
      needsMore = true;
    } else {
      glossAmount.value = glossTarget;
    }

    const hoverLerp = 1 - Math.pow(0.001, dt / HOVER.smoothTime);
    const hoverYNorm = hoverPt ? clamp(hoverPt.y / halfHeight, -1, 1) : 0;
    let rightDepthSum = 0;

    sheets.forEach((sheet, idx) => {
      const isHovered = activePeekZone?.sheet === idx && hoverPt !== null && !sheet.flight;
      const hoverTarget = isHovered ? 1 : 0;
      if (isHovered) {
        sheet.hover.y += (hoverYNorm - sheet.hover.y) * hoverLerp;
      }
      sheet.hover.amount += (hoverTarget - sheet.hover.amount) * hoverLerp;
      if (Math.abs(hoverTarget - sheet.hover.amount) > 1e-4 || (isHovered && Math.abs(hoverYNorm - sheet.hover.y) > 1e-4)) {
        needsMore = true;
      }

      const midFlight = sheet.progress > 1e-4 && sheet.progress < 0.9999;
      sheet.curve.arc += (sheet.curveTarget.arc - sheet.curve.arc) * curveLerp;
      sheet.curve.angleDeg += (sheet.curveTarget.angleDeg - sheet.curve.angleDeg) * curveLerp;
      sheet.directionSmooth += (sheet.direction - sheet.directionSmooth) * dirLerp;
      if (midFlight && Math.abs(sheet.direction - sheet.directionSmooth) > 1e-4) needsMore = true;

      const rightStack = rightDepthSum;
      const leftOrder = idx - rightDepthSum;
      const leftStack = isSingle ? 0 : totalProgress - leftOrder - sheet.progress;
      rightDepthSum += 1 - sheet.progress;

      const depthStack = lerp(rightStack, leftStack, sheet.progress);
      const { uniforms, curve } = sheet;

      const swingProgress = isSingle ? Math.sin(clamp(sheet.progress / SINGLE_LAYOUT.swingEnd, 0, 1) * Math.PI * 0.5) : sheet.progress;
      const rollProgress = isSingle
        ? smoothstep01(clamp((sheet.progress - SINGLE_LAYOUT.rollStart) / (1 - SINGLE_LAYOUT.rollStart), 0, 1))
        : 0;
      const swingAngle = swingProgress * Math.PI;
      const bendAngle = Math.sin(sheet.progress * Math.PI) * Math.PI * curve.arc * sheet.flex * (1 - rollProgress);
      const foldRad = THREE.MathUtils.degToRad(curve.angleDeg * sheet.flex);
      const cosFold = Math.cos(foldRad);
      const sinFold = Math.sin(foldRad);
      const curlRadius = 1 - halfHeight * Math.sin(Math.abs(foldRad));
      const curlStart = 1 - curlRadius;
      const curlSpan = Math.max(0, cosFold + sinFold * halfHeight * Math.sign(sinFold) - curlStart);
      const cylAngle = (curlSpan / curlRadius) * bendAngle;
      const versineTerm = Math.abs(cylAngle) < 1e-4 ? 0 : ((1 - Math.cos(cylAngle)) / cylAngle) * curlSpan;
      const flipAngle = Math.min(swingAngle + 0.5 * sheet.directionSmooth * versineTerm, isSingle ? Math.PI : Infinity);

      uniforms.uBendAngle.value = bendAngle;
      uniforms.uFold.value.set(cosFold, sinFold);
      uniforms.uCurl.value.set(curlStart, curlRadius);
      uniforms.uFlipRotation.value.set(Math.cos(flipAngle), Math.sin(flipAngle));
      uniforms.uDirection.value = sheet.directionSmooth;

      const rollEase = Math.max(singleSquareUp, 1 - Math.pow(rollProgress, 4));
      const rollRadius = lerp(0.004 * leftOrder * 0.5, SINGLE_LAYOUT.radius + SINGLE_LAYOUT.radiusStep * leftOrder, rollEase);
      uniforms.uRoll.value.set(Math.PI * rollProgress, Math.PI * Math.max(rollRadius, 1e-4));
      uniforms.uSkew.value =
        rollProgress *
        singleSquareUp *
        THREE.MathUtils.degToRad(SINGLE_LAYOUT.skew + SINGLE_LAYOUT.skewStep * Math.min(leftOrder, SINGLE_LAYOUT.skewStepMax) + sheet.skewJitter);

      const singleArcLift = isSingle ? 0.75 * Math.sin(sheet.progress * Math.PI) : 0;
      uniforms.uDepth.value = 0.004 * (depthStack - singleArcLift);
      uniforms.uLift.value = 0.03 * openWeight * sheet.flex * (1 - rollProgress) * (0.3 + 0.7 * Math.exp(-0.4 * depthStack));
      uniforms.uHover.value.set(HOVER.lift * sheet.hover.amount * Math.max(sheet.flex, 0.5), HOVER.bias * sheet.hover.y);
      uniforms.uCrease.value = openWeight * clamp(1 - 4 * sheet.progress, 0, 1);
    });

    spineGroup.position.x = isSingle
      ? -0.5 + 0.5 * SINGLE_LAYOUT.margin * smoothstep01(sheets[0].progress) * singleSquareUp
      : -0.5 * (1 - smoothstep01(sheets[0].progress)) + 0.5 * smoothstep01(sheets[sheetCount - 1].progress);

    if (mode === 'closing' && !closeCallbackFired && sheets[0].progress < 0.5) {
      closeCallbackFired = true;
      stageBlend.target = 0;
      midCloseCb?.();
      midCloseCb = null;
    }

    if (reducedMotion) {
      stageBlend.value = stageBlend.target;
      stageBlend.velocity = 0;
    }
    for (let rem = dt; rem > 0; rem -= 1 / 120) {
      const subDt = Math.min(rem, 1 / 120);
      stageBlend.velocity +=
        (STAGE_SPRING.stiffness * (stageBlend.target - stageBlend.value) - STAGE_SPRING.damping * stageBlend.velocity) * subDt;
      stageBlend.value += stageBlend.velocity * subDt;
    }

    if (Math.abs(stageBlend.target - stageBlend.value) > 5e-4 || Math.abs(stageBlend.velocity) > 0.005) {
      needsMore = true;
    } else {
      stageBlend.value = stageBlend.target;
      stageBlend.velocity = 0;
    }

    if (mode === 'opening' && stageBlend.value > 0.9) {
      mode = 'open';
    }

    const tiltActive = hoveringBook && pointer.isMouse && !reducedMotion;
    const tiltFactor = isRest ? REST.tilt : 1;
    const normY = clamp(((pointer.y - canvasTop) / hostHeight - 0.5) * 2, -1, 1);
    const normX = clamp(((pointer.x - canvasLeft) / hostWidth - 0.5) * 2, -1, 1);
    const targetTiltX = tiltActive ? normY * TILT.x * tiltFactor : 0;
    const targetTiltY = tiltActive ? normX * TILT.y * tiltFactor : 0;
    const tiltLerp = 1 - Math.pow(0.001, dt / TILT.smoothTime);

    tiltSmooth.x += (targetTiltX - tiltSmooth.x) * tiltLerp;
    tiltSmooth.y += (targetTiltY - tiltSmooth.y) * tiltLerp;
    if (Math.abs(targetTiltX - tiltSmooth.x) + Math.abs(targetTiltY - tiltSmooth.y) > 1e-4) {
      needsMore = true;
    }

    if (isRest) {
      const targetRot = pointer.inside && pointer.isMouse && !reducedMotion ? REST.hoverRotation : REST.rotation;
      restTransform.rotation += (targetRot - restTransform.rotation) * (1 - Math.pow(0.001, dt / REST.rotationSmoothTime));
      if (Math.abs(targetRot - restTransform.rotation) > 1e-4) needsMore = true;
    }

    const blend = stageBlend.value;
    bookRoot.position.set(
      lerp((restTransform.x - hostWidth / 2) / openPagePxWidth, 0, blend),
      lerp((hostHeight / 2 - restTransform.y) / openPagePxWidth, 0, blend),
      0,
    );
    bookRoot.scale.setScalar(lerp(restWidth / openPagePxWidth, 1, blend));
    bookRoot.rotation.set(tiltSmooth.x, tiltSmooth.y, lerp(-restTransform.rotation, 0, blend));

    dirLight.target.position.copy(bookRoot.position);
    dirLight.position.copy(keyDir).multiplyScalar(6).add(bookRoot.position);

    return needsMore;
  }

  function renderLoop(nowMs: number) {
    rafId = 0;
    if (disposed) return;

    const dt = lastFrameMs ? Math.min((nowMs - lastFrameMs) / 1000, 0.05) : 1 / 60;
    lastFrameMs = nowMs;

    const more = stepSimulation(dt, performance.now());
    renderer.render(scene, camera);

    if (mode === 'closing' && closeCallbackFired && !more) {
      mode = 'rest';
      restTransform.rotation = REST.rotation;
      pointer.inside = false;
      mountIntoHost(restHost);
      lastFrameMs = 0;
      closeResolve?.(true);
      closeResolve = null;
      return;
    }

    if (more) {
      requestTick();
    } else {
      lastFrameMs = 0;
    }
  }

  function requestTick() {
    if (!rafId && !disposed) {
      rafId = requestAnimationFrame(renderLoop);
    }
  }

  function mountIntoHost(host: HTMLElement) {
    const moved = activeHost !== host;
    activeHost = host;
    host.appendChild(canvas);
    if (reducedMotion && moved) {
      canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    }
    canvas.style.pointerEvents = activeHost === stageHost ? 'auto' : 'none';
    resize();
    stepSimulation(0, performance.now());
    renderer.render(scene, camera);
  }

  function onContextLost(e: Event) {
    e.preventDefault();
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(restHost);
  resizeObserver.observe(stageHost);

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', requestTick);

  mountIntoHost(restHost);
  updateTextureWindow();

  return {
    stickOn() {
      if (stickerPhase !== 'waiting') return;
      if (reducedMotion) {
        finishSticker();
        return;
      }
      stickerPhase = 'sticking';
      stickerStartMs = performance.now();
      requestTick();
    },
    hover(pt) {
      if (mode !== 'rest') return;
      pointer.inside = pt !== null;
      pointer.isMouse = true;
      if (pt) {
        pointer.x = pt.x;
        pointer.y = pt.y;
      }
      requestTick();
    },
    open() {
      if (mode !== 'rest') return;
      finishSticker();
      const restRect = restHost.getBoundingClientRect();
      const stageRect = stageHost.getBoundingClientRect();
      restTransform.x = restRect.left + restRect.width / 2 - stageRect.left;
      restTransform.y = restRect.top + restRect.height / 2 - stageRect.top;
      mode = 'opening';
      downState = null;
      dragState = null;
      closeCallbackFired = false;
      stageBlend.target = 1;
      pointer.inside = false;
      updateTextureWindow();
      lastFrameMs = 0;
      mountIntoHost(stageHost);
      requestTick();
    },
    close(onMidClose) {
      if (mode === 'rest' || mode === 'closing') return Promise.resolve(true);
      const restRect = restHost.getBoundingClientRect();
      const stageRect = stageHost.getBoundingClientRect();
      restTransform.x = restRect.left + restRect.width / 2 - stageRect.left;
      restTransform.y = restRect.top + restRect.height / 2 - stageRect.top;
      restTransform.rotation = REST.rotation;
      mode = 'closing';
      clearHoldTimer();
      downState = null;
      dragState = null;
      closeCallbackFired = false;
      midCloseCb = onMidClose ?? null;

      const openCount = currentSheet;
      const gap = Math.min(CLOSE_CASCADE.staggerMs, CLOSE_CASCADE.maxStaggerTotalMs / Math.max(openCount, 1));
      for (let i = openCount - 1; i >= 0; i--) {
        launchSheetFlight(i, 0, CLOSE_CASCADE.stiffness, (openCount - 1 - i) * gap);
      }
      currentSheet = 0;
      updateTextureWindow(false);
      requestTick();

      return new Promise((resolve) => {
        closeResolve = resolve;
      });
    },
    flipNext() {
      if (mode !== 'open' || dragState || currentSheet >= sheetCount) return;
      flipSheet(currentSheet, true, defaultFlipPoint(true));
    },
    flipPrev() {
      if (mode !== 'open' || dragState || currentSheet <= 0 || isSingleAtEnd()) return;
      flipSheet(currentSheet - 1, false, defaultFlipPoint(false));
    },
    dispose() {
      disposed = true;
      clearHoldTimer();
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', requestTick);

      for (const s of sheets) {
        s.material.dispose();
        s.depthMaterial.dispose();
      }
      for (const tex of sideTextures) tex?.dispose();
      bareCoverTex?.dispose();
      sticker.material.map?.dispose();
      sticker.material.dispose();
      sticker.depthMaterial.dispose();
      sticker.geometry.dispose();
      backCoverTex?.dispose();
      blankTexture.dispose();
      sheetGeo.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      dirLight.shadow.map?.dispose();
      renderer.dispose();
      canvas.remove();
      closeResolve?.(true);
    },
  };
}
```

---

### `src/book/BookStage.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import { createBookEngine } from './bookEngine';
import type { BookEngineApi, BookHotspot, BookStickerConfig } from './types';

export interface BookStageProps {
  apiRef: React.MutableRefObject<BookEngineApi | null>;
  restHostRef: React.RefObject<HTMLDivElement | null>;
  restWidth: number;
  active: boolean;
  sidesSpread: string[];
  sidesSingle: string[];
  backCover?: string;
  coverBare: string;
  coverSticker: BookStickerConfig;
  hotspots: BookHotspot[];
  pageWidth?: number;
  pageHeight?: number;
  glossAlpha?: number;
  onReady: () => void;
  onError: (err: unknown) => void;
  onDismiss: () => void;
  onReopen: () => void;
  onHotspot: (hotspot: BookHotspot) => void;
}

export function BookStage({
  apiRef,
  restHostRef,
  restWidth,
  active,
  sidesSpread,
  sidesSingle,
  backCover,
  coverBare,
  coverSticker,
  hotspots,
  pageWidth = 420,
  pageHeight = 560,
  glossAlpha = 160,
  onReady,
  onError,
  onDismiss,
  onReopen,
  onHotspot,
}: BookStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onReady, onError, onDismiss, onReopen, onHotspot });
  callbacksRef.current = { onReady, onError, onDismiss, onReopen, onHotspot };

  const [layout, setLayout] = useState<'spread' | 'single' | null>(null);

  useEffect(() => {
    if (active) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => setLayout(mq.matches ? 'single' : 'spread');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [active]);

  useEffect(() => {
    const stageHost = stageRef.current;
    const restHost = restHostRef.current;
    if (!stageHost || !restHost || !layout) return;

    let engine: BookEngineApi;
    try {
      engine = createBookEngine({
        restHost,
        stageHost,
        restWidth,
        layout,
        sides: layout === 'single' ? sidesSingle : sidesSpread,
        backCover,
        coverBare,
        coverSticker,
        hotspots,
        pageWidth,
        pageHeight,
        glossAlpha,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onReady: () => callbacksRef.current.onReady(),
        onError: (err) => callbacksRef.current.onError(err),
        onDismiss: () => callbacksRef.current.onDismiss(),
        onReopen: () => callbacksRef.current.onReopen(),
        onHotspot: (h) => callbacksRef.current.onHotspot(h),
      });
    } catch (err) {
      callbacksRef.current.onError(err);
      return;
    }

    apiRef.current = engine;
    return () => {
      apiRef.current = null;
      engine.dispose();
    };
  }, [
    apiRef,
    restHostRef,
    restWidth,
    layout,
    sidesSpread,
    sidesSingle,
    backCover,
    coverBare,
    coverSticker,
    hotspots,
    pageWidth,
    pageHeight,
    glossAlpha,
  ]);

  return (
    <div
      ref={stageRef}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive 3D Book"
      aria-hidden={!active}
      className={`fixed inset-0 h-[100dvh] w-full touch-none overscroll-none ${active ? 'z-[9999]' : ''}`}
      style={{
        visibility: active ? 'visible' : 'hidden',
        pointerEvents: active ? 'auto' : 'none',
      }}
    />
  );
}
```

---

### `src/book/InteractiveBook.tsx`

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { BookStage } from './BookStage';
import type { BookEngineApi, BookHotspot, BookStickerConfig } from './types';

export interface InteractiveBookProps {
  collapsedWidth?: number;
  collapsedHeight?: number;
  sidesSpread: string[];
  sidesSingle: string[];
  backCover?: string;
  coverBare: string;
  coverSticker: BookStickerConfig;
  hotspots: BookHotspot[];
  pageWidth?: number;
  pageHeight?: number;
  glossAlpha?: number;
  emailToCopy?: string;
}

let cachedWebGL2Support: boolean | null = null;

function useHasFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return fine;
}

export function InteractiveBook({
  collapsedWidth = 240,
  collapsedHeight = 320,
  sidesSpread,
  sidesSingle,
  backCover,
  coverBare,
  coverSticker,
  hotspots,
  pageWidth = 420,
  pageHeight = 560,
  glossAlpha = 160,
  emailToCopy = 'hello@example.com',
}: InteractiveBookProps) {
  const hasFinePointer = useHasFinePointer();
  const [mounted, setMounted] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [stageActive, setStageActive] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [closingControls, setClosingControls] = useState(false);
  const [pressedKey, setPressedKey] = useState<'previous' | 'next' | 'close' | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const apiRef = useRef<BookEngineApi | null>(null);
  const restHostRef = useRef<HTMLDivElement | null>(null);
  const closingLockRef = useRef(false);
  const pressedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpenOrActive = modalOpen || stageActive;

  useEffect(() => {
    setMounted(true);
    if (cachedWebGL2Support === null) {
      cachedWebGL2Support = document.createElement('canvas').getContext('webgl2') !== null;
    }
    if (!cachedWebGL2Support) {
      setFallbackMode(true);
    }
  }, []);

  const flashKey = useCallback((key: 'previous' | 'next' | 'close') => {
    if (pressedTimerRef.current) clearTimeout(pressedTimerRef.current);
    setPressedKey(key);
    pressedTimerRef.current = setTimeout(() => setPressedKey(null), 180);
  }, []);

  const handleEngineError = useCallback(() => {
    setFallbackMode(true);
    setStageActive(false);
  }, []);

  // Trigger peel-and-stick cover sticker animation shortly after WebGL canvas is ready
  useEffect(() => {
    if (!webglReady) return;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const targetTime = (nav?.loadEventEnd || performance.now()) + 650;
    const delay = Math.max(targetTime - performance.now(), 250);
    const timer = setTimeout(() => apiRef.current?.stickOn(), delay);
    return () => clearTimeout(timer);
  }, [webglReady]);

  // Lock page scroll while journal is open
  useEffect(() => {
    if (!isOpenOrActive) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';

    const preventTouch = (e: TouchEvent) => e.preventDefault();
    document.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', preventTouch);
      if (top) window.scrollTo(0, -parseInt(top, 10) || 0);
    };
  }, [isOpenOrActive]);

  const openBook = useCallback(() => {
    apiRef.current?.open();
    setStageActive(true);
    setModalOpen(true);
  }, []);

  const handleTriggerClick = () => {
    if (isOpenOrActive || fallbackMode) return;
    if (!webglReady) {
      setPendingOpen(true);
      return;
    }
    openBook();
  };

  useEffect(() => {
    if (pendingOpen && webglReady) {
      setPendingOpen(false);
      openBook();
    }
  }, [pendingOpen, webglReady, openBook]);

  const closeBook = useCallback(async () => {
    if (!modalOpen || closingLockRef.current) return;
    closingLockRef.current = true;
    setClosingControls(true);
    const finished = await apiRef.current?.close(() => setModalOpen(false));
    closingLockRef.current = false;
    setClosingControls(false);
    if (finished !== false) {
      setStageActive(false);
      setModalOpen(false);
    }
  }, [modalOpen]);

  const handleReopen = useCallback(() => {
    closingLockRef.current = false;
    setClosingControls(false);
    setModalOpen(true);
  }, []);

  const handleHotspot = useCallback(
    async (hotspot: BookHotspot) => {
      if (hotspot.action === 'copy-email') {
        try {
          await navigator.clipboard.writeText(emailToCopy);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 1600);
        } catch {
          // Clipboard permission denied
        }
      } else if (hotspot.href) {
        window.open(hotspot.href, '_blank', 'noopener,noreferrer');
      }
    },
    [emailToCopy],
  );

  const stepPage = useCallback((dir: 1 | -1) => {
    if (dir === 1) apiRef.current?.flipNext();
    else apiRef.current?.flipPrev();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!modalOpen) return;
      if (e.key === 'Escape') {
        flashKey('close');
        closeBook();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        flashKey('next');
        stepPage(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        flashKey('previous');
        stepPage(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, stepPage, closeBook, flashKey]);

  const visible = webglReady || fallbackMode;

  const portal = mounted
    ? createPortal(
        <>
          {modalOpen && (
            <>
              {/* Blurred dark backdrop */}
              <div
                className="fixed inset-0 z-[9998] h-[100dvh] w-full touch-none overscroll-none bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={closeBook}
              />

              {/* Floating Aqua Controls */}
              {!closingControls && (
                <div
                  data-journal-controls=""
                  className="fixed left-1/2 top-6 z-[10000] flex -translate-x-1/2 items-center gap-3 sm:top-10"
                >
                  <button
                    type="button"
                    aria-label="Previous page"
                    title="Previous page (←)"
                    onClick={() => stepPage(-1)}
                    className={`aqua aqua-round size-8 ${pressedKey === 'previous' ? 'aqua-pressed' : ''}`}
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next page"
                    title="Next page (→)"
                    onClick={() => stepPage(1)}
                    className={`aqua aqua-round size-8 ${pressedKey === 'next' ? 'aqua-pressed' : ''}`}
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Close journal"
                    title="Close (Esc)"
                    onClick={closeBook}
                    className={`aqua h-8 gap-1 pl-2 pr-2.5 text-sm font-medium ${pressedKey === 'close' ? 'aqua-pressed' : ''}`}
                  >
                    <X size={14} />
                    Esc
                  </button>
                </div>
              )}

              {/* Toast notification for email copy hotspot */}
              {copiedToast && (
                <div
                  role="status"
                  className="pointer-events-none fixed bottom-10 left-1/2 z-[10000] -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 text-xs text-white/95 shadow-lg backdrop-blur-md"
                >
                  Email copied ({emailToCopy})
                </div>
              )}
            </>
          )}

          {!fallbackMode && (
            <BookStage
              apiRef={apiRef}
              restHostRef={restHostRef}
              restWidth={collapsedWidth}
              active={stageActive}
              sidesSpread={sidesSpread}
              sidesSingle={sidesSingle}
              backCover={backCover}
              coverBare={coverBare}
              coverSticker={coverSticker}
              hotspots={hotspots}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              glossAlpha={glossAlpha}
              onReady={() => setWebglReady(true)}
              onError={handleEngineError}
              onDismiss={closeBook}
              onReopen={handleReopen}
              onHotspot={handleHotspot}
            />
          )}
        </>,
        document.body,
      )
    : null;

  return (
    <>
      {portal}
      <div
        className="relative transition-[opacity,transform] duration-200 ease-out"
        style={{
          width: collapsedWidth,
          height: collapsedHeight,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        {fallbackMode ? (
          <div className="relative -ml-2 h-full w-full rotate-3 overflow-hidden rounded-l-sm rounded-r-lg shadow-md">
            <img src={coverBare} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <img
              src={coverSticker.src}
              alt="Hello, my name is Template"
              className="absolute left-1/2 top-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rotate-3 object-contain"
            />
          </div>
        ) : (
          <div
            role="button"
            aria-label="Open interactive 3D journal"
            tabIndex={isOpenOrActive ? -1 : 0}
            className="relative cursor-pointer opacity-0"
            style={{
              width: collapsedWidth,
              height: collapsedHeight,
              borderRadius: 12,
              transform: 'rotate(3deg)',
            }}
            onClick={handleTriggerClick}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' && hasFinePointer) {
                apiRef.current?.hover({ x: e.clientX, y: e.clientY });
              }
            }}
            onPointerLeave={() => apiRef.current?.hover(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTriggerClick();
              }
            }}
          />
        )}

        {/* WebGL rest canvas mount point (oversized to allow tilt + drop shadows without clipping) */}
        <div
          ref={restHostRef}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: -72,
            bottom: -72,
            left: -80,
            right: -64,
            visibility: webglReady ? 'visible' : 'hidden',
          }}
        />
      </div>
    </>
  );
}
```

---

### `src/book/placeholderAssets.ts`

```ts
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

const W = 840;
const H = 1120;
const LOGICAL_W = 420;
const LOGICAL_H = 560;
const GLOSS_ALPHA = 160;

function makeCanvas(w = W, h = H): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function drawPaperBase(ctx: CanvasRenderingContext2D, side: 'left' | 'right', pageNum?: number) {
  // Warm cream sketchbook paper
  const grad = ctx.createLinearGradient(side === 'right' ? 0 : W, 0, side === 'right' ? W : 0, 0);
  grad.addColorStop(0, '#eeece6');
  grad.addColorStop(0.06, '#f8f6f1');
  grad.addColorStop(0.94, '#faf8f4');
  grad.addColorStop(1, '#f3f0ea');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle paper fibers / grain
  ctx.fillStyle = 'rgba(120, 113, 108, 0.035)';
  for (let i = 0; i < 450; i++) {
    const x = (Math.sin(i * 97.3) * 0.5 + 0.5) * W;
    const y = (Math.cos(i * 43.1) * 0.5 + 0.5) * H;
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle dot grid
  ctx.fillStyle = 'rgba(168, 162, 158, 0.16)';
  for (let gx = 64; gx < W - 40; gx += 36) {
    for (let gy = 64; gy < H - 40; gy += 36) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (pageNum !== undefined) {
    ctx.fillStyle = '#a8a29e';
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.textAlign = side === 'left' ? 'left' : 'right';
    ctx.fillText(String(pageNum).padStart(2, '0'), side === 'left' ? 56 : W - 56, H - 44);
    ctx.textAlign = 'left';
  }
}

function drawCoverBase(ctx: CanvasRenderingContext2D, isBack = false) {
  // Matte charcoal-black notebook cover
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#292726');
  grad.addColorStop(0.5, '#1e1d1c');
  grad.addColorStop(1, '#141312');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Spine indentation along binding edge
  const spineX = isBack ? W - 36 : 0;
  const spineGrad = ctx.createLinearGradient(spineX, 0, spineX + 36, 0);
  if (isBack) {
    spineGrad.addColorStop(0, 'rgba(0,0,0,0)');
    spineGrad.addColorStop(0.55, 'rgba(0,0,0,0.45)');
    spineGrad.addColorStop(0.75, 'rgba(255,255,255,0.06)');
    spineGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
  } else {
    spineGrad.addColorStop(0, 'rgba(255,255,255,0.07)');
    spineGrad.addColorStop(0.35, 'rgba(0,0,0,0.4)');
    spineGrad.addColorStop(0.65, 'rgba(255,255,255,0.05)');
    spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  }
  ctx.fillStyle = spineGrad;
  ctx.fillRect(spineX, 0, 36, H);

  // Fine leatherette speckle
  for (let i = 0; i < 900; i++) {
    const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * W;
    const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * H;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, 3, 3);
  }

  if (!isBack) {
    ctx.fillStyle = 'rgba(245, 245, 244, 0.84)';
    ctx.font = 'italic 36px "Caveat", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Interactive 3D Journal', W * 0.51, H * 0.72);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = 'rgba(214, 211, 209, 0.45)';
    ctx.font = '500 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REUSABLE 3D BOOK TEMPLATE', W * 0.5, H * 0.88);
    ctx.textAlign = 'left';
  }
}

function drawNameStickerCanvas(): HTMLCanvasElement {
  const sw = 440;
  const sh = Math.round(440 / 1.3631);
  const [c, ctx] = makeCanvas(sw, sh);

  // Outer white sticker die-cut border
  roundRect(ctx, 8, 8, sw - 16, sh - 16, 28);
  ctx.fillStyle = '#faf9f5';
  ctx.fill();
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner red header badge
  roundRect(ctx, 22, 22, sw - 44, sh - 44, 18);
  ctx.fillStyle = '#ef5343';
  ctx.fill();

  // White name area
  roundRect(ctx, 32, 118, sw - 64, sh - 150, 12);
  ctx.fillStyle = '#fffdf9';
  ctx.fill();

  // Subtle watercolor variation on red header
  const rGrad = ctx.createRadialGradient(sw * 0.72, 65, 10, sw * 0.72, 65, 130);
  rGrad.addColorStop(0, 'rgba(255,255,255,0.16)');
  rGrad.addColorStop(1, 'rgba(185,28,28,0.12)');
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
  ctx.font = '600 84px "Caveat", cursive';
  ctx.fillText('Template', sw / 2, 228);

  return c;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Marks a rectangular region with lower alpha so the WebGL gloss shader catches sunlight on stickers */
function markGlossyStickerRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius = 16) {
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

function drawMountainIllustration(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 4;
  ctx.stroke();

  roundRect(ctx, x + 16, y + 16, w - 32, h - 32, 16);
  ctx.clip();

  // Sky wash
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, '#dbeafe');
  sky.addColorStop(0.55, '#fef3c7');
  sky.addColorStop(1, '#dcfce7');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  // Sun
  ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
  ctx.beginPath();
  ctx.arc(x + w * 0.75, y + h * 0.25, 44, 0, Math.PI * 2);
  ctx.fill();

  // Distant peaks
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

  // Foreground hills
  ctx.fillStyle = '#65a30d';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.78);
  ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.62, x + w * 0.68, y + h * 0.76);
  ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.82, x + w, y + h * 0.72);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  // Ink sketch contour lines
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

function drawBridgeIllustration(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
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

  // Water
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(x, y + h * 0.68, w, h * 0.32);

  // Bridge towers & deck
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

  // Suspension cables
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

function drawNoteCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lines: string[], tiltDeg = -2) {
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
  ctx.font = '500 32px "Caveat", cursive';
  lines.forEach((line, idx) => {
    ctx.fillText(line, 34, 62 + idx * 44);
  });
  ctx.restore();
}

function drawGeometricBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, label: string, color: string) {
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

function renderTextBlock(ctx: CanvasRenderingContext2D, x: number, startY: number, paragraphs: string[]) {
  ctx.fillStyle = '#44403c';
  ctx.font = 'italic 33px "Caveat", cursive';
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

export function generatePlaceholderBookAssets(): GeneratedBookAssets {
  const stickerCanvas = drawNameStickerCanvas();
  const stickerDataUrl = stickerCanvas.toDataURL('image/png');

  // 1. Bare Cover
  const [bareCanvas, bareCtx] = makeCanvas();
  drawCoverBase(bareCtx, false);
  const coverBare = bareCanvas.toDataURL('image/png');

  // 2. Composited Front Cover (bare + sticker baked in)
  const [frontCanvas, frontCtx] = makeCanvas();
  frontCtx.drawImage(bareCanvas, 0, 0);
  frontCtx.save();
  frontCtx.translate(W * 0.5, H * 0.5);
  frontCtx.rotate((-3 * Math.PI) / 180);
  const sw = W * 0.5;
  const sh = sw / 1.3631;
  frontCtx.drawImage(stickerCanvas, -sw / 2, -sh / 2, sw, sh);
  frontCtx.restore();
  const side0 = frontCanvas.toDataURL('image/png');

  // 3. Back Cover
  const [backCanvas, backCtx] = makeCanvas();
  drawCoverBase(backCtx, true);
  const backCover = backCanvas.toDataURL('image/png');

  // Helper to build an interior page
  const buildPage = (side: 'left' | 'right', pageNum: number | undefined, paint: (ctx: CanvasRenderingContext2D) => void) => {
    const [c, ctx] = makeCanvas();
    drawPaperBase(ctx, side, pageNum);
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
    ctx.font = '600 56px "Caveat", cursive';
    ctx.fillText('Field Notes & Craft', W / 2, 325);
    ctx.fillStyle = '#78716c';
    ctx.font = '400 26px "Caveat", cursive';
    ctx.fillText('Reusable 3D Journal Component', W / 2, 390);
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
      'This template captures that tactile',
      'moment in real-time WebGL2:',
      '• Soft spine rise & paper curl',
      '• Sunlight sheen on stickers',
      '• Spring-physics drag & flick',
    ]);

    drawNoteCard(ctx, 110, 740, 560, 220, [
      '"Design is not just what it looks',
      'like — it is how it responds when',
      'you gently tug the corner."',
    ], -1.8);
  });

  // Spread 2 (pages 2-3)
  const side3 = buildPage('left', 2, (ctx) => {
    drawMountainIllustration(ctx, 84, 110, W - 168, 520);
    ctx.fillStyle = '#57534e';
    ctx.font = '500 34px "Caveat", cursive';
    ctx.fillText('Morning Ridge — Placeholder Landscape', 96, 690);
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
    drawNoteCard(ctx, 90, 120, 620, 260, [
      'Architecture Checklist:',
      '• bookEngine.ts — Three.js + GLSL',
      '• BookStage.tsx — Responsive Modal',
      '• InteractiveBook.tsx — Controls',
      '• placeholderAssets.ts — Swap yours!',
    ], 1.5);
    renderTextBlock(ctx, 84, 480, [
      'To use your own artwork:',
      'Replace `sidesSpread` and `sidesSingle`',
      'with your own WebP / PNG URLs.',
      '',
      'Keep page aspect ratio consistent',
      '(default 420×560, i.e., 3:4 portrait)',
      'and encode alpha < 255 on areas',
      'you want to look glossy!',
    ]);
  });

  // Spread 4 (pages 6-7)
  const side7 = buildPage('left', 6, (ctx) => {
    drawBridgeIllustration(ctx, 84, 110, W - 168, 440);
    renderTextBlock(ctx, 84, 620, [
      'Golden Gate — Sketch Placeholder',
      '',
      'Swap this canvas-generated image for',
      'your photography, illustrations, or',
      'high-resolution case study spreads.',
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
    drawNoteCard(ctx, 110, 680, 580, 240, [
      'Thanks for flipping through.',
      'Turn to the last page to test',
      'interactive clickable hotspots →',
    ], -1.2);
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

    // Draw interactive hotspot pills aligned to hotspots array coordinates
    const links = [
      { label: '✉  Copy placeholder email', sub: 'hello@example.com', yNorm: 0.48125, wNorm: 0.62 },
      { label: '↗  View Three.js Docs', sub: 'threejs.org', yNorm: 0.56, wNorm: 0.62 },
      { label: '↗  Explore Template Code', sub: 'github.com', yNorm: 0.63875, wNorm: 0.62 },
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
      ctx.font = '500 26px "Inter", sans-serif';
      ctx.fillText(item.label, rx + 24, ry + 41);
    }
  });

  // Spread 6 (inside back cover + back cover)
  const side11 = side0; // Not used in spread if even; wait: spread pairs are (0,1), (2,3), (4,5), (6,7), (8,9), (10,11)
  // Let's keep clean pairing:
  // Sheet 0: front=0 (Cover), back=1 (Inside Front)
  // Sheet 1: front=2 (Pg 1), back=3 (Pg 2)
  // Sheet 2: front=4 (Pg 3), back=5 (Pg 4)
  // Sheet 3: front=6 (Pg 5), back=7 (Pg 6)
  // Sheet 4: front=8 (Pg 7), back=9 (Pg 8)
  // Sheet 5: front=10 (Pg 9 - Hotspots), back=11 (Back Cover)
  const sidesSpread = [side0, side1, side2, side3, side4, side5, side6, side7, side8, side9, side10, backCover];
  // In single mode, we skip duplicate cover/blank or show cover + pages cleanly
  const sidesSingle = [side0, side1, side2, side3, side4, side5, side6, side7, side8, side9, side10];

  void side11;

  const hotspots: BookHotspot[] = [
    { side: 10, x: 0.1, y: 0.48125, width: 0.62, height: 0.058, action: 'copy-email', label: 'Copy email' },
    { side: 10, x: 0.1, y: 0.56, width: 0.62, height: 0.058, href: 'https://threejs.org/', label: 'Three.js Docs' },
    { side: 10, x: 0.1, y: 0.63875, width: 0.62, height: 0.058, href: 'https://github.com/', label: 'GitHub' },
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
      width: 0.5,
      aspect: 1.3631436314363143,
      rotation: 3,
    },
    sidesSpread,
    sidesSingle,
    backCover,
    hotspots,
  };
}
```
