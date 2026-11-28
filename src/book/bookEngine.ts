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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
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
