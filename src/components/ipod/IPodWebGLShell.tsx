import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type IPodMetalFinish = "silver" | "graphite" | "champagne";

export interface IPodTiltRef {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  onSyncDom?: (rxRad: number, ryRad: number) => void;
}

interface IPodWebGLShellProps {
  finish: IPodMetalFinish;
  tiltRef: React.MutableRefObject<IPodTiltRef>;
  /** Incremented whenever the parent nudges target tilt so the on-demand loop wakes up. */
  wakeSignalRef: React.MutableRefObject<(() => void) | null>;
}

const FINISH_RECIPES: Record<
  IPodMetalFinish,
  {
    frontHex: number;
    backHex: number;
    bezelHex: number;
    wheelRimHex: number;
    metalness: number;
    roughness: number;
  }
> = {
  silver: {
    frontHex: 0xd8dce2,
    backHex: 0xe6e9ee,
    bezelHex: 0x16181c,
    wheelRimHex: 0xc5cad2,
    metalness: 0.86,
    roughness: 0.27,
  },
  graphite: {
    frontHex: 0x3b3e45,
    backHex: 0x26282d,
    bezelHex: 0x0b0c0f,
    wheelRimHex: 0x2a2c31,
    metalness: 0.88,
    roughness: 0.29,
  },
  champagne: {
    frontHex: 0xd9cbb8,
    backHex: 0xcbbba4,
    bezelHex: 0x1c1916,
    wheelRimHex: 0xc2b29c,
    metalness: 0.84,
    roughness: 0.28,
  },
};

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Generates procedural brushed-metal grain albedo + roughness maps on HTML5 2D Canvas
 * (zero external textures, SRGB albedo / linear roughness).
 */
function createBrushedMetalMaps(maxAnisotropy: number) {
  const size = 512;

  // Fine brushed grain color texture
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext("2d");

  // Roughness micro-variation map
  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext("2d");

  if (cCtx && rCtx) {
    cCtx.fillStyle = "#e6e8ec";
    cCtx.fillRect(0, 0, size, size);

    rCtx.fillStyle = "#484848";
    rCtx.fillRect(0, 0, size, size);

    // Deterministic seeded PRNG for repeatable studio brushed grain
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Subtle directional horizontal hairlines (anodized aluminum finish)
    for (let y = 0; y < size; y++) {
      const lum = Math.round(220 + (rand() - 0.5) * 28);
      cCtx.fillStyle = `rgb(${lum},${lum},${lum})`;
      cCtx.fillRect(0, y, size, 1);

      const rLum = Math.round(62 + (rand() - 0.5) * 34);
      rCtx.fillStyle = `rgb(${rLum},${rLum},${rLum})`;
      rCtx.fillRect(0, y, size, 1);
    }

    // Fine micro-streaks & satin sheen bands
    for (let i = 0; i < 650; i++) {
      const y = Math.floor(rand() * size);
      const x = Math.floor(rand() * size);
      const len = 30 + rand() * 140;
      const bright = rand() > 0.5;
      cCtx.fillStyle = bright
        ? "rgba(255,255,255,0.09)"
        : "rgba(0,0,0,0.065)";
      cCtx.fillRect(x, y, len, 1);

      rCtx.fillStyle = bright
        ? "rgba(38,38,38,0.18)"
        : "rgba(110,110,110,0.16)";
      rCtx.fillRect(x, y, len, 1);
    }
  }

  const albedoMap = new THREE.CanvasTexture(colorCanvas);
  albedoMap.colorSpace = THREE.SRGBColorSpace;
  albedoMap.wrapS = THREE.RepeatWrapping;
  albedoMap.wrapT = THREE.RepeatWrapping;
  albedoMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.anisotropy = maxAnisotropy;

  return { albedoMap, roughnessMap };
}

function createRoundedRectShape(width: number, height: number, radius: number) {
  const s = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
}

/**
 * Continuous 38px-thick Three.js WebGL brushed-metal iPod Classic hardware shell
 * with RoomEnvironment studio reflections, procedural brushed grain/roughness maps,
 * multi-part composite chassis (anodized face, polished steel back, glass bezel,
 * chamfered wheel rim, and Hold switch), and on-demand damped tilt synchronization.
 */
export function IPodWebGLShell({
  finish,
  tiltRef,
  wakeSignalRef,
}: IPodWebGLShellProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<{
    front: THREE.MeshPhysicalMaterial;
    back: THREE.MeshPhysicalMaterial;
    bezel: THREE.MeshPhysicalMaterial;
    wheelRim: THREE.MeshStandardMaterial;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 580;

    // 1. Renderer setup following Three.js skill standards
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // 2. Scene + RoomEnvironment studio reflections
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    // Camera mathematically matched to CSS `perspective: 1100px` so 1 world unit === 1 CSS pixel
    const camZ = 1100;
    const computeFovDeg = (h: number) =>
      2 * Math.atan(h / 2 / camZ) * (180 / Math.PI);
    const camera = new THREE.PerspectiveCamera(
      computeFovDeg(height),
      width / height,
      50,
      3000,
    );
    camera.position.set(0, 0, camZ);
    camera.lookAt(0, 0, 0);

    const pxToWorld = 1;

    // 3. Balanced 3-point studio lighting (warm key + cool hemisphere + specular rim)
    const hemiLight = new THREE.HemisphereLight(0xdce8ff, 0x3a322c, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e4, 1.9);
    keyLight.position.set(240, 340, 520);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc8dcff, 1.25);
    rimLight.position.set(-340, -140, 260);
    scene.add(rimLight);

    // 4. Procedural brushed metal grain + roughness maps
    const maxAniso = isSoftwareGl
      ? 1
      : Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const { albedoMap, roughnessMap } = createBrushedMetalMaps(maxAniso);

    // 5. Composite 5-part iPod Classic hardware shell (38px continuous thickness)
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    const shellW = 304 * pxToWorld;
    const shellH = 496 * pxToWorld;
    const cornerR = 30 * pxToWorld;
    const totalDepth = 38 * pxToWorld; // Exact 38px continuous WebGL thickness
    const frontDepth = 20 * pxToWorld;
    const backDepth = 18 * pxToWorld;
    const bevel = 4.2 * pxToWorld;

    const recipe = FINISH_RECIPES[finish];

    // Part 1: Front anodized brushed aluminum shell
    const frontShape = createRoundedRectShape(
      shellW - bevel * 2,
      shellH - bevel * 2,
      cornerR - bevel,
    );
    const frontGeo = new THREE.ExtrudeGeometry(frontShape, {
      depth: frontDepth - bevel,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 6,
      curveSegments: 24,
    });
    frontGeo.translate(0, 0, -frontDepth / 2 + bevel * 0.5);

    const frontMat = new THREE.MeshPhysicalMaterial({
      color: recipe.frontHex,
      map: albedoMap,
      roughnessMap,
      metalness: recipe.metalness,
      roughness: recipe.roughness,
      anisotropy: 0.72,
      anisotropyRotation: 0,
      clearcoat: 0.24,
      clearcoatRoughness: 0.26,
      envMapIntensity: 1.15,
    });
    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.position.z = totalDepth / 2 - frontDepth / 2;
    bodyGroup.add(frontMesh);

    // Part 2: Mirror-polished stainless-steel curved rear shell
    const backShape = createRoundedRectShape(
      shellW - bevel * 2.2,
      shellH - bevel * 2.2,
      cornerR - bevel,
    );
    const backGeo = new THREE.ExtrudeGeometry(backShape, {
      depth: backDepth - bevel,
      bevelEnabled: true,
      bevelThickness: bevel * 1.15,
      bevelSize: bevel * 1.02,
      bevelSegments: 6,
      curveSegments: 24,
    });
    backGeo.translate(0, 0, -backDepth / 2 + bevel * 0.5);

    const backMat = new THREE.MeshPhysicalMaterial({
      color: recipe.backHex,
      metalness: 0.96,
      roughness: 0.12,
      clearcoat: 0.6,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.35,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -totalDepth / 2 + backDepth / 2;
    bodyGroup.add(backMesh);

    // Part 3: Recessed glossy screen glass frame
    const screenW = 264 * pxToWorld;
    const screenH = 200 * pxToWorld;
    const bezelShape = createRoundedRectShape(
      screenW + 6 * pxToWorld,
      screenH + 6 * pxToWorld,
      11 * pxToWorld,
    );
    const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, {
      depth: 2.2 * pxToWorld,
      bevelEnabled: true,
      bevelThickness: 1.2 * pxToWorld,
      bevelSize: 1.2 * pxToWorld,
      bevelSegments: 3,
      curveSegments: 16,
    });
    const bezelMat = new THREE.MeshPhysicalMaterial({
      color: recipe.bezelHex,
      metalness: 0.25,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.set(0, 118 * pxToWorld, totalDepth / 2 - 1.5 * pxToWorld);
    bodyGroup.add(bezelMesh);

    // Part 4: Chamfered metallic Click Wheel outer ring recess
    const wheelRimGeo = new THREE.RingGeometry(
      92 * pxToWorld,
      97 * pxToWorld,
      64,
    );
    const wheelRimMat = new THREE.MeshStandardMaterial({
      color: recipe.wheelRimHex,
      metalness: 0.72,
      roughness: 0.34,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const wheelRimMesh = new THREE.Mesh(wheelRimGeo, wheelRimMat);
    wheelRimMesh.position.set(
      0,
      -106 * pxToWorld,
      totalDepth / 2 + 0.6 * pxToWorld,
    );
    bodyGroup.add(wheelRimMesh);

    // Part 5: Top Hold switch accent detail
    const holdGeo = new THREE.BoxGeometry(
      34 * pxToWorld,
      4.5 * pxToWorld,
      9 * pxToWorld,
    );
    const holdMesh = new THREE.Mesh(holdGeo, backMat);
    holdMesh.position.set(-76 * pxToWorld, shellH / 2 + 1.2 * pxToWorld, 0);
    bodyGroup.add(holdMesh);

    materialsRef.current = {
      front: frontMat,
      back: backMat,
      bezel: bezelMat,
      wheelRim: wheelRimMat,
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 6. On-demand damped render loop (with software WebGL fence sync guard)
    let frameId = 0;
    let disposed = false;
    let renderBusy = false;
    let lastTs = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== "function") {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function step() {
      if (disposed) return;
      renderBusy = true;

      const now = performance.now();
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;

      const tilt = tiltRef.current;
      const lambda = 11.5;
      tilt.currentX = THREE.MathUtils.damp(
        tilt.currentX,
        tilt.targetX,
        lambda,
        dt,
      );
      tilt.currentY = THREE.MathUtils.damp(
        tilt.currentY,
        tilt.targetY,
        lambda,
        dt,
      );

      bodyGroup.rotation.x = tilt.currentX;
      bodyGroup.rotation.y = tilt.currentY;

      // Sync the interactive React LCD + Click Wheel DOM plane 1:1 with the WebGL mesh
      tilt.onSyncDom?.(tilt.currentX, tilt.currentY);

      renderer.render(scene, camera);

      const settled =
        Math.abs(tilt.targetX - tilt.currentX) < 0.0006 &&
        Math.abs(tilt.targetY - tilt.currentY) < 0.0006;

      const finishFrame = () => {
        if (disposed) return;
        renderBusy = false;
        if (!settled) {
          if (isSoftwareGl) {
            step();
          } else {
            frameId = window.requestAnimationFrame(step);
          }
        }
      };

      if (isSoftwareGl) {
        afterDraw(finishFrame);
      } else {
        finishFrame();
      }
    }

    const wake = () => {
      if (disposed || renderBusy) return;
      lastTs = performance.now();
      if (isSoftwareGl) {
        step();
      } else {
        frameId = window.requestAnimationFrame(step);
      }
    };

    wakeSignalRef.current = wake;
    // Initial render
    wake();

    // Handle container resize cleanly
    const handleResize = () => {
      if (disposed || !container) return;
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 580;
      camera.fov = computeFovDeg(h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      wake();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      wakeSignalRef.current = null;
      materialsRef.current = null;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);

      frontGeo.dispose();
      backGeo.dispose();
      bezelGeo.dispose();
      wheelRimGeo.dispose();
      holdGeo.dispose();
      frontMat.dispose();
      backMat.dispose();
      bezelMat.dispose();
      wheelRimMat.dispose();
      albedoMap.dispose();
      roughnessMap.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [tiltRef, wakeSignalRef]);

  // Smoothly update material recipe when finish changes without tearing down WebGL context
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats) return;
    const recipe = FINISH_RECIPES[finish];
    mats.front.color.setHex(recipe.frontHex);
    mats.front.metalness = recipe.metalness;
    mats.front.roughness = recipe.roughness;
    mats.back.color.setHex(recipe.backHex);
    mats.bezel.color.setHex(recipe.bezelHex);
    mats.wheelRim.color.setHex(recipe.wheelRimHex);
    wakeSignalRef.current?.();
  }, [finish, wakeSignalRef]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
