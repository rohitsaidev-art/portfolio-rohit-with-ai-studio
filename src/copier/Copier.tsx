import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  COPIER_DESK_H,
  COPIER_DESK_W,
  luminance,
  mountCopierEngine,
  parseRgb,
  rgbaStr,
} from './copierEngine';
import type { CopierProps } from './types';

const DEFAULT_VALUE_FONT = '"Fragment Mono", "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const DEFAULT_LABEL_FONT = '"Inter", ui-sans-serif, system-ui, sans-serif';

const DEFAULTS = {
  label: 'Email',
  value: 'justyna@justbuilt.it',
  mark: 'JB·01 COPIER',
  light: {
    body: 'rgb(231, 229, 224)',
    tray: 'rgb(231, 229, 224)',
    accent: 'rgb(226, 72, 31)',
    paper: 'rgb(244, 242, 236)',
    ink: 'rgb(35, 35, 39)',
    shadow: 'rgb(36, 30, 22)',
    strength: 70,
  },
  dark: {
    body: 'rgb(44, 44, 46)',
    tray: 'rgb(44, 44, 46)',
    accent: 'rgb(226, 72, 31)',
    paper: 'rgb(244, 242, 236)',
    ink: 'rgb(35, 35, 39)',
    shadow: 'rgb(0, 0, 0)',
    strength: 100,
  },
};

const COPIER_CSS = `
.cp-desk { position: absolute; left: 0; top: 0; width: ${COPIER_DESK_W}px; height: ${COPIER_DESK_H}px; transform-origin: 0 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; }
.cp-desk * { box-sizing: border-box; }
.cp-noise::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; background-image: var(--cp-grain); background-size: 128px 128px; mix-blend-mode: soft-light; opacity: var(--cp-grain-o, 0.3); }

.cp-original { all: unset; position: absolute; left: 0; top: 0; width: 250px; height: 92px; z-index: 80; cursor: grab; touch-action: none; -webkit-tap-highlight-color: transparent; }
.cp-original.cp-flying { transform-style: preserve-3d; }
.cp-original .cp-face, .cp-original .cp-back { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.cp-original .cp-back { transform: rotateY(180deg); }
.cp-original canvas { display: block; }
.cp-original .cp-shadow { position: absolute; inset: 0; transform: translateZ(-1px); box-shadow: var(--cp-ps); transition: box-shadow 0.25s; }
.cp-original.cp-lifted { cursor: grabbing; }
.cp-original.cp-lifted .cp-shadow { box-shadow: var(--cp-ps-lift); }
.cp-original:focus-visible { outline: 2px solid var(--cp-a); outline-offset: 6px; }
.cp-original.cp-inside { visibility: hidden; pointer-events: none; }

.cp-machine { position: absolute; left: 0; top: 146px; width: ${COPIER_DESK_W}px; height: 404px; }
.cp-tray { position: absolute; left: 38px; right: 38px; top: 226px; height: 168px; z-index: 0; border-radius: 6px 6px 22px 22px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--cp-t) 72%, black) 0%, color-mix(in srgb, var(--cp-t) 92%, black) 30%, var(--cp-t) 100%);
  box-shadow: inset 0 -4px 0 color-mix(in srgb, var(--cp-t) 90%, black), inset 1px 0 0 rgba(255,255,255,0.05), inset -1px 0 0 rgba(255,255,255,0.05), 0 1px 1px var(--cp-s1), 0 8px 12px -4px var(--cp-s2), 0 34px 44px -22px var(--cp-s3); }
.cp-well { position: absolute; left: 9px; right: 9px; top: 0; bottom: 15px; border-radius: 4px 4px 13px 13px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--cp-t) 80%, black), color-mix(in srgb, var(--cp-t) 96%, black) 45%, var(--cp-t));
  box-shadow: inset 0 2px 6px var(--cp-wi1), inset 0 -1px 1px var(--cp-wi2), inset 2px 0 4px var(--cp-wi2), inset -2px 0 4px var(--cp-wi2); }
.cp-lip { display: none; position: absolute; left: 0; right: 0; bottom: 0; height: 16px; border-radius: 0 0 22px 22px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--cp-t) 100%, white 8%) 0%, var(--cp-t) 30%, color-mix(in srgb, var(--cp-t) 72%, black) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.09); }

.cp-page { position: absolute; left: 70px; top: 236px; width: 280px; height: 108px; z-index: 1; cursor: grab; touch-action: none; }
.cp-page canvas { display: block; }
.cp-page::after { content: ""; position: absolute; inset: 0; z-index: -1; box-shadow: 0 0.5px 0.5px rgba(0,0,0,0.5), 0 2px 3px rgba(0,0,0,0.28), 0 6px 10px -4px rgba(0,0,0,0.3); transition: box-shadow 0.25s; }
.cp-page.cp-held { z-index: 90; cursor: grabbing; }
.cp-page.cp-held::after { box-shadow: var(--cp-ps-lift); }
.cp-page.cp-out { z-index: 50; }
.cp-page.cp-out::after { box-shadow: var(--cp-ps); }
.cp-page:focus-visible { outline: 2px solid var(--cp-a); outline-offset: 4px; }
.cp-overhang { position: absolute; left: 38px; right: 38px; top: 250px; height: 34px; z-index: 2; pointer-events: none;
  background: linear-gradient(180deg, var(--cp-oh1) 0%, var(--cp-oh2) 30%, var(--cp-oh3) 65%, rgba(0,0,0,0) 100%); }
.cp-front { position: absolute; left: 0; right: 0; top: 16px; height: 238px; z-index: 3; border-radius: 30px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--cp-b) 66%, black) 78%, color-mix(in srgb, var(--cp-b) 54%, black) 92%, color-mix(in srgb, var(--cp-b) 44%, black) 100%);
  box-shadow: 0 1px 0.5px var(--cp-s1), 0 3px 4px var(--cp-s1), 0 16px 22px -8px var(--cp-s2), 0 44px 60px -26px var(--cp-s3); }
.cp-slot { position: absolute; left: 66px; right: 66px; bottom: 6px; height: 6px; border-radius: 3px; background: #050506; box-shadow: inset 0 2px 2px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.07), 0 -1px 0 rgba(0,0,0,0.5); }
.cp-top { position: absolute; left: 0; right: 0; top: 0; height: 238px; z-index: 4; border-radius: 30px; perspective: 1150px; perspective-origin: 50% 45%;
  background: radial-gradient(110% 80% at 15% -10%, rgba(255,255,255,0.075), rgba(255,255,255,0) 55%), radial-gradient(80% 60% at 100% 100%, rgba(0,0,0,0.14), rgba(0,0,0,0) 70%),
    linear-gradient(180deg, color-mix(in srgb, var(--cp-b) 100%, white 3%) 0%, var(--cp-b) 55%, color-mix(in srgb, var(--cp-b) 88%, black) 100%);
  box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.11), inset 0 -1.5px 0 rgba(255,255,255,0.05), inset 1px 0 0 rgba(255,255,255,0.03), inset -1px 0 0 rgba(255,255,255,0.03); }

.cp-recess { position: absolute; left: 18px; right: 18px; top: 22px; height: 146px; border-radius: 15px; overflow: hidden; background: #121213;
  box-shadow: inset 0 3px 4px rgba(0,0,0,0.75), inset 0 -1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(255,255,255,0.07), 0 -1px 0 rgba(0,0,0,0.35); }
.cp-glass { position: absolute; inset: 5px; border-radius: 10px; overflow: hidden; background: radial-gradient(130% 120% at 40% 0%, #12171a 0%, #0a0c0d 55%, #060707 100%); box-shadow: inset 0 0 0 0.5px rgba(255,255,255,0.05); }
.cp-scale { position: absolute; left: 0; top: 0; z-index: 2; pointer-events: none; }
.cp-carriage { position: absolute; top: -10px; bottom: -10px; left: 0; width: 40px; z-index: 1; will-change: transform;
  background: linear-gradient(90deg, rgba(20,22,23,0) 0%, rgba(26,29,31,0.95) 25%, #24282a 50%, rgba(26,29,31,0.95) 75%, rgba(20,22,23,0) 100%); }
.cp-lamp { position: absolute; top: 0; bottom: 0; left: 18px; width: 4px; border-radius: 2px; background: linear-gradient(90deg, #2a2d2f, #3b3f41, #2a2d2f); transition: background 0.1s, box-shadow 0.18s; }
.cp-scanning .cp-lamp { background: color-mix(in srgb, var(--cp-a) 10%, white);
  box-shadow: 0 0 2px 1px color-mix(in srgb, var(--cp-a) 30%, white), 0 0 9px 3px color-mix(in srgb, var(--cp-a) 65%, transparent), 0 0 32px 12px color-mix(in srgb, var(--cp-a) 28%, transparent), 0 0 90px 40px color-mix(in srgb, var(--cp-a) 12%, transparent); }
.cp-slip { position: absolute; left: 12px; top: 13px; z-index: 2; width: 250px; height: 92px; pointer-events: none; visibility: hidden; }
.cp-slip canvas, .cp-lit-slip { display: block; }
.cp-loaded .cp-slip { visibility: visible; }
.cp-dust { position: absolute; left: 0; top: 0; z-index: 3; pointer-events: none; }
.cp-beam { position: absolute; top: 0; bottom: 0; left: 0; width: 170px; z-index: 4; overflow: hidden; pointer-events: none; opacity: 0; will-change: transform;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 38%, #000 62%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, #000 38%, #000 62%, transparent 100%); transition: opacity 0.16s; }
.cp-scanning .cp-beam { opacity: 1; }
.cp-beam-in { position: absolute; top: 0; left: 0; width: 384px; height: 146px; will-change: transform; }
.cp-lit-slip { position: absolute; left: 17px; top: 18px; visibility: hidden; }
.cp-loaded .cp-lit-slip { visibility: visible; }
.cp-lit-dust { position: absolute; left: 5px; top: 5px; mix-blend-mode: screen; }
.cp-lit-wall { position: absolute; inset: 0; border-radius: 15px; mix-blend-mode: screen; box-shadow: inset 0 0 0 5px color-mix(in srgb, var(--cp-a) 12%, transparent), inset 0 0 14px 4px color-mix(in srgb, var(--cp-a) 12%, transparent); }
.cp-reflect { position: absolute; inset: 5px; z-index: 5; border-radius: 10px; pointer-events: none;
  background: linear-gradient(104deg, rgba(255,255,255,0) 52%, rgba(255,255,255,0.055) 60%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0) 71%),
    linear-gradient(104deg, rgba(255,255,255,0) 73.5%, rgba(255,255,255,0.03) 74.5%, rgba(255,255,255,0) 77%),
    radial-gradient(60% 50% at 85% 10%, rgba(255,255,255,0.035), rgba(255,255,255,0) 70%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), inset 1px 0 0 rgba(255,255,255,0.025); }

.cp-lid { position: absolute; left: 11px; right: 11px; top: 13px; height: 162px; z-index: 6; transform-origin: 50% 0; transform-style: preserve-3d; transition: transform 0.62s cubic-bezier(.3,.75,.25,1); }
.cp-open .cp-lid { transform: rotateX(104deg); }
.cp-lid-face { position: absolute; inset: 0; border-radius: 19px; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.cp-lid-top { transition: filter 0.62s;
  background: radial-gradient(110% 90% at 12% -10%, rgba(255,255,255,0.085), rgba(255,255,255,0) 55%), linear-gradient(180deg, color-mix(in srgb, var(--cp-b) 100%, white 5%) 0%, var(--cp-b) 60%, color-mix(in srgb, var(--cp-b) 92%, black) 100%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--cp-b) 25%, black), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.2), 0 1.5px 0 0.5px rgba(255,255,255,0.03); }
.cp-open .cp-lid-top { filter: brightness(0.6); }
.cp-grip { position: absolute; left: 50%; bottom: -1px; width: 64px; height: 6px; margin-left: -32px; border-radius: 6px 6px 0 0; background: color-mix(in srgb, var(--cp-b) 40%, black); box-shadow: inset 0 1.5px 2px rgba(0,0,0,0.75), 0 -1px 0 rgba(255,255,255,0.05); }
.cp-mark { position: absolute; left: 22px; bottom: 14px; font: 500 7.5px/1 var(--cp-vf); letter-spacing: 0.16em; color: var(--cp-eng); text-shadow: var(--cp-engs); white-space: pre; }
.cp-lid-under { transform: rotateX(180deg); background: color-mix(in srgb, var(--cp-b) 92%, black); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04); }
.cp-lid-under::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0) 60%); }
.cp-pad { position: absolute; inset: 7px; border-radius: 13px; background-color: #dedcd6; background-image: var(--cp-foam); background-size: 120px 120px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 2px 6px rgba(0,0,0,0.12); }
.cp-hinge { position: absolute; top: 8px; width: 44px; height: 6px; z-index: 7; border-radius: 3px; background: linear-gradient(180deg, color-mix(in srgb, var(--cp-b) 45%, black), color-mix(in srgb, var(--cp-b) 30%, black)); box-shadow: inset 0 1px 1.5px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.06); }
.cp-leak { position: absolute; left: 0; width: 70px; height: 3px; z-index: 7; border-radius: 2px; opacity: 0; pointer-events: none; will-change: transform; transition: opacity 0.15s;
  background: radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--cp-a) 55%, white), color-mix(in srgb, var(--cp-a) 0%, transparent) 100%); filter: blur(0.6px); }
.cp-scanning.cp-shut .cp-leak { opacity: 1; }

.cp-panel { position: absolute; left: 24px; right: 26px; top: 184px; height: 44px; display: flex; align-items: center; gap: 12px; }
.cp-lcd { position: relative; width: 168px; height: 38px; border-radius: 9px; background: #0c0c0d; box-shadow: inset 0 1px 1.5px rgba(0,0,0,0.95), 0 1px 0 rgba(255,255,255,0.07), 0 -0.5px 0 rgba(0,0,0,0.4); }
.cp-lcd-face { position: absolute; inset: 3px; border-radius: 6px; overflow: hidden; background: radial-gradient(120% 140% at 50% 120%, color-mix(in srgb, var(--cp-a) 9%, #070606) 0%, #0b0807 60%, #070606 100%); box-shadow: inset 0 1px 2px rgba(0,0,0,0.9), inset 0 0 0 0.5px rgba(255,255,255,0.04); }
.cp-matrix { position: absolute; left: 3px; top: 3px; }
.cp-glare { position: absolute; inset: 3px; border-radius: 6px; pointer-events: none; background: linear-gradient(172deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 46%, rgba(255,255,255,0) 47%); }
.cp-spacer { flex: 1; }
.cp-micro { font: 500 7.5px/1 var(--cp-vf); letter-spacing: 0.18em; color: var(--cp-eng); text-shadow: var(--cp-engs); margin-right: 2px; }
.cp-well-key { position: relative; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #0f0f10; box-shadow: inset 0 2px 3px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.07); }
.cp-ring { position: absolute; inset: 1.5px; border-radius: 50%; pointer-events: none; transition: box-shadow 0.4s; box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--cp-a) 18%, transparent); }
.cp-ready .cp-ring { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--cp-a) 75%, transparent), 0 0 10px color-mix(in srgb, var(--cp-a) 18%, transparent), inset 0 0 6px color-mix(in srgb, var(--cp-a) 25%, transparent); }
.cp-scanning .cp-ring { animation: cp-breathe 0.9s ease-in-out infinite; }
.cp-flash .cp-ring { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--cp-a) 80%, white), 0 0 14px color-mix(in srgb, var(--cp-a) 40%, transparent), inset 0 0 8px color-mix(in srgb, var(--cp-a) 45%, transparent); }
@keyframes cp-breathe { 50% { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--cp-a) 90%, transparent), 0 0 12px color-mix(in srgb, var(--cp-a) 30%, transparent), inset 0 0 7px color-mix(in srgb, var(--cp-a) 35%, transparent); } }
.cp-start { all: unset; position: relative; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; -webkit-tap-highlight-color: transparent;
  background: radial-gradient(60% 45% at 40% 18%, rgba(255,235,225,0.42), rgba(255,235,225,0) 70%), radial-gradient(120% 120% at 50% 85%, rgba(0,0,0,0.22), rgba(0,0,0,0) 55%),
    radial-gradient(100% 100% at 50% 40%, color-mix(in srgb, var(--cp-a) 75%, white) 0%, var(--cp-a) 55%, color-mix(in srgb, var(--cp-a) 70%, black) 100%);
  box-shadow: inset 0 1px 0.5px rgba(255,240,232,0.45), inset 0 -2.5px 4px rgba(60,15,4,0.35), 0 2px 1px rgba(0,0,0,0.55), 0 4px 7px rgba(0,0,0,0.35); transition: transform 0.07s, box-shadow 0.07s; }
.cp-start::after { content: ""; position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; border-radius: 1.5px; transform: translate(-50%, -50%) rotate(45deg);
  box-shadow: inset 0 0 0 1.3px color-mix(in srgb, var(--cp-a) 40%, black), 0 0.8px 0 rgba(255,225,210,0.35); }
.cp-start.cp-down, .cp-start:active { transform: translateY(1.5px) scale(0.985); box-shadow: inset 0 1px 0.5px rgba(255,240,232,0.22), inset 0 -2px 3px rgba(0,0,0,0.25), 0 0.5px 0.5px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.3); }
.cp-start:focus-visible { outline: 2px solid var(--cp-a); outline-offset: 7px; }
.cp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;

function CopierMarkup() {
  return (
    <>
      <div className="cp-machine cp-ready cp-shut">
        <div className="cp-tray">
          <div className="cp-well" />
          <div className="cp-lip" />
        </div>
        <div className="cp-overhang" />
        <div className="cp-front">
          <div className="cp-slot" />
        </div>
        <div className="cp-top cp-noise">
          <div className="cp-recess" aria-hidden="true">
            <div className="cp-glass">
              <canvas className="cp-scale" />
              <div className="cp-carriage">
                <div className="cp-lamp" />
              </div>
              <div className="cp-slip" />
              <canvas className="cp-dust" />
            </div>
            <div className="cp-beam">
              <div className="cp-beam-in">
                <div className="cp-lit-wall" />
                <canvas className="cp-lit-slip" />
                <canvas className="cp-lit-dust" />
              </div>
            </div>
            <div className="cp-reflect" />
          </div>
          <div className="cp-leak" style={{ top: 174 }} />
          <div className="cp-leak" style={{ top: 12 }} />
          <div className="cp-lid" aria-hidden="true">
            <div className="cp-lid-face cp-lid-top cp-noise">
              <span className="cp-mark" />
              <span className="cp-grip" />
            </div>
            <div className="cp-lid-face cp-lid-under">
              <div className="cp-pad" />
            </div>
          </div>
          <span className="cp-hinge" style={{ left: 84 }} />
          <span className="cp-hinge" style={{ right: 84 }} />
          <div className="cp-panel">
            <div className="cp-lcd" aria-hidden="true">
              <div className="cp-lcd-face" />
              <canvas className="cp-matrix" />
              <div className="cp-glare" />
            </div>
            <span className="cp-spacer" />
            <span className="cp-micro" aria-hidden="true">
              START
            </span>
            <div className="cp-well-key">
              <span className="cp-ring" aria-hidden="true" />
              <button type="button" className="cp-start cp-noise" aria-label="Start copying" />
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="cp-original">
        <span className="cp-shadow" />
        <span className="cp-face" />
        <span className="cp-back" />
      </button>

      <p className="cp-sr" aria-live="polite" />
    </>
  );
}

export function Copier({
  label = DEFAULTS.label,
  value = DEFAULTS.value,
  mark = DEFAULTS.mark,
  theme = 'light',
  light,
  dark,
  sound = true,
  haptics = true,
  keepCopies = true,
  canvasState = 'rest',
  valueFont,
  labelFont,
  onCopy,
  className = '',
}: CopierProps) {
  const [sysDark, setSysDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setSysDark(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const reducedRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reducedRef.current = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const soundRef = useRef(sound);
  const hapticsRef = useRef(haptics);
  const onCopyRef = useRef(onCopy);
  soundRef.current = sound;
  hapticsRef.current = haptics;
  onCopyRef.current = onCopy;

  const containerRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const [scaleBox, setScaleBox] = useState({ k: 1, x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth || COPIER_DESK_W;
      const h = el.offsetHeight || COPIER_DESK_H;
      const k = Math.min(w / COPIER_DESK_W, h / COPIER_DESK_H);
      setScaleBox({
        k,
        x: (w - COPIER_DESK_W * k) / 2,
        y: (h - COPIER_DESK_H * k) / 2,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const useDark = theme === 'dark' || (theme === 'auto' && sysDark);
  const palette = useDark ? { ...DEFAULTS.dark, ...dark } : { ...DEFAULTS.light, ...light };

  const bodyRgb = parseRgb(palette.body, [231, 229, 224]);
  const trayRgb = parseRgb(palette.tray, bodyRgb);
  const accentRgb = parseRgb(palette.accent, [226, 72, 31]);
  const paperRgb = parseRgb(palette.paper, [244, 242, 236]);
  const inkRgb = parseRgb(palette.ink, [35, 35, 39]);
  const shadowRgb = parseRgb(palette.shadow, [36, 30, 22]);
  const strength = Math.max(0, Math.min(2, (palette.strength ?? 70) / 100));

  const isLightBody = luminance(bodyRgb) > 0.5;
  const trayDarkFactor = 1 - 0.62 * Math.max(0, Math.min(1, (luminance(trayRgb) - 0.25) / 0.6));

  const resolvedValueFont = {
    family: valueFont?.fontFamily || DEFAULT_VALUE_FONT,
    weight: valueFont?.fontWeight ?? 400,
    style: valueFont?.fontStyle || 'normal',
  };
  const resolvedLabelFont = {
    family: labelFont?.fontFamily || DEFAULT_LABEL_FONT,
    weight: labelFont?.fontWeight ?? 400,
    style: labelFont?.fontStyle || 'normal',
  };

  const cssVars: Record<string, string> = {
    '--cp-b': rgbaStr(bodyRgb),
    '--cp-t': rgbaStr(trayRgb),
    '--cp-wi1': rgbaStr(shadowRgb, 0.5 * trayDarkFactor),
    '--cp-wi2': rgbaStr(shadowRgb, 0.24 * trayDarkFactor),
    '--cp-oh1': rgbaStr(shadowRgb, 0.6 * trayDarkFactor),
    '--cp-oh2': rgbaStr(shadowRgb, 0.26 * trayDarkFactor),
    '--cp-oh3': rgbaStr(shadowRgb, 0.07 * trayDarkFactor),
    '--cp-a': rgbaStr(accentRgb),
    '--cp-s1': rgbaStr(shadowRgb, 0.45 * strength),
    '--cp-s2': rgbaStr(shadowRgb, 0.3 * strength),
    '--cp-s3': rgbaStr(shadowRgb, 0.5 * strength),
    '--cp-ps': `0 0.5px 1px ${rgbaStr(shadowRgb, 0.16 * strength)}, 0 2px 5px -1px ${rgbaStr(shadowRgb, 0.12 * strength)}, 0 14px 28px -12px ${rgbaStr(shadowRgb, 0.25 * strength)}`,
    '--cp-ps-lift': `0 2px 4px ${rgbaStr(shadowRgb, 0.1 * strength)}, 0 18px 30px -12px ${rgbaStr(shadowRgb, 0.3 * strength)}, 0 44px 60px -26px ${rgbaStr(shadowRgb, 0.36 * strength)}`,
    '--cp-eng': isLightBody ? 'rgba(0,0,0,0.36)' : 'rgba(255,255,255,0.28)',
    '--cp-engs': isLightBody ? '0 0.5px 0 rgba(255,255,255,0.7)' : '0 -0.5px 0 rgba(0,0,0,0.6)',
    '--cp-vf': resolvedValueFont.family,
  };

  const engineKey = [
    label,
    value,
    mark,
    rgbaStr(accentRgb),
    rgbaStr(paperRgb),
    rgbaStr(inkRgb),
    canvasState,
    keepCopies,
    JSON.stringify(resolvedValueFont),
    JSON.stringify(resolvedLabelFont),
  ].join('|');

  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    const fontWait = fonts
      ? Promise.all([
          fonts.load(`${resolvedValueFont.style} ${resolvedValueFont.weight} 19px ${resolvedValueFont.family}`),
          fonts.load(`${resolvedLabelFont.style} ${resolvedLabelFont.weight} 9px ${resolvedLabelFont.family}`),
        ]).catch(() => undefined)
      : Promise.resolve();

    Promise.race([fontWait, new Promise((res) => setTimeout(res, 2500))]).then(() => {
      if (cancelled) return;
      dispose = mountCopierEngine(desk, {
        label,
        value,
        mark,
        accent: accentRgb,
        paper: paperRgb,
        ink: inkRgb,
        live: true,
        canvasState,
        keepCopies,
        reduced: () => reducedRef.current,
        sound: () => soundRef.current,
        haptics: () => hapticsRef.current,
        onCopy: () => onCopyRef.current?.(value),
        valueFont: resolvedValueFont,
        labelFont: resolvedLabelFont,
      });
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineKey]);

  return (
    <div
      ref={containerRef}
      className={`relative box-border grid w-full grid-cols-[minmax(0,1fr)] overflow-visible ${className}`}
      style={{ aspectRatio: `${COPIER_DESK_W} / ${COPIER_DESK_H}` }}
    >
      <style>{COPIER_CSS}</style>
      <div
        ref={deskRef}
        className="cp-desk"
        style={{
          ...cssVars,
          transform: `translate(${scaleBox.x}px, ${scaleBox.y}px) scale(${scaleBox.k})`,
        }}
      >
        <CopierMarkup key={engineKey} />
      </div>
    </div>
  );
}
