import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";
import { playSuccessChime, playTap, playTick } from "../../utils/soundEngine";
import { showToast } from "../../utils/toast";
import {
  HANDPICKED_IPOD_TRACKS,
  extractYouTubeVideoId,
  getTrackAudioSrc,
  getTrackCoverArtUri,
  loadUserIPodTracks,
  saveUserIPodTracks,
  type IPodClassicTrack,
} from "./ipodClassicData";
import {
  IPodWebGLShell,
  type IPodMetalFinish,
  type IPodTiltRef,
} from "./IPodWebGLShell";

export type IPodWheelCaptureMode = "hold" | "always";

export interface IPodClassicV2Props {
  /** Host-supplied hand-picked playlist (defaults to Rohit's curated studio tracks). */
  tracks?: readonly IPodClassicTrack[];
  /** Metal shell finish using procedural brushed grain & studio reflections. */
  finish?: IPodMetalFinish;
  /** Whether mouse wheel always scrolls the Click Wheel or only while holding the iPod. */
  wheelCaptureMode?: IPodWheelCaptureMode;
  /** Enable interactive 3D pointer tilt of the 38px WebGL shell (respects reduced motion). */
  enable3dTilt?: boolean;
  ownerName?: string;
  className?: string;
}

type ScreenId =
  | "main"
  | "music"
  | "coverflow"
  | "allsongs"
  | "artists"
  | "albums"
  | "nowplaying"
  | "games"
  | "brick"
  | "quiz"
  | "settings"
  | "addtrack"
  | `artist:${string}`
  | `album:${string}`;

type NowPlayingSubView = "art" | "lyrics" | "visualizer";

interface MenuRow {
  label: string;
  value?: string;
  chevron?: boolean;
  action: () => void;
}

function formatClock(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ==========================================================================
   Sub-component: Live Canvas Audio Visualizer inside Now Playing
   ========================================================================== */
function NowPlayingVisualizer({
  isPlaying,
  currentTime,
  palette,
}: {
  isPlaying: boolean;
  currentTime: number;
  palette: readonly [string, string, string];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(currentTime);
  const playingRef = useRef(isPlaying);
  timeRef.current = currentTime;
  playingRef.current = isPlaying;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep dark glass background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#0b101b");
      bgGrad.addColorStop(1, "#161d2e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (playingRef.current) {
        phase += 0.085;
      } else {
        phase += 0.012;
      }

      const bars = 22;
      const gap = 3;
      const barW = (w - 20 - gap * (bars - 1)) / bars;

      for (let i = 0; i < bars; i++) {
        const norm = i / (bars - 1);
        const envelope = 0.68 + 0.32 * Math.sin(norm * Math.PI);
        const harmonic =
          Math.sin(phase * 1.4 + i * 0.55) * 0.35 +
          Math.cos(phase * 0.9 - i * 0.32) * 0.25 +
          Math.sin(timeRef.current * 2.1 + i * 0.8) * 0.2;
        const energy = playingRef.current
          ? Math.max(0.14, Math.min(0.95, (0.48 + harmonic * 0.52) * envelope))
          : (0.14 + Math.abs(Math.sin(i * 0.6 + phase)) * 0.08) * envelope;

        const barH = energy * (h - 32);
        const x = 10 + i * (barW + gap);
        const y = h - 18 - barH;

        const grad = ctx.createLinearGradient(0, y, 0, h - 18);
        grad.addColorStop(0, palette[2]);
        grad.addColorStop(0.55, palette[1]);
        grad.addColorStop(1, "#38bdf8");
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barW, barH);

        // Reflection beneath bar
        ctx.fillStyle = "rgba(186, 230, 253, 0.14)";
        ctx.fillRect(x, h - 16, barW, Math.min(12, barH * 0.22));
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [palette]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={132}
      className="h-full w-full rounded-[4px]"
    />
  );
}

/* ==========================================================================
   Sub-component: Classic iPod Brick Breaker Game
   ========================================================================== */
function IPodBrickGame({
  paddleTargetRef,
  launchSignal,
}: {
  paddleTargetRef: React.MutableRefObject<number>;
  launchSignal: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState<"ready" | "playing" | "won" | "lost">(
    "ready",
  );
  const statusRef = useRef(status);
  statusRef.current = status;

  const gameStateRef = useRef({
    paddleX: 128,
    ballX: 128,
    ballY: 136,
    vx: 2.1,
    vy: -2.4,
    bricks: [] as { x: number; y: number; w: number; h: number; color: string; alive: boolean }[],
    score: 0,
    lives: 3,
  });

  const resetBricks = useCallback(() => {
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
    const bricks: { x: number; y: number; w: number; h: number; color: string; alive: boolean }[] = [];
    const cols = 7;
    const rows = 5;
    const bw = 31;
    const bh = 9;
    const gap = 3;
    const startX = 11;
    const startY = 18;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * (bw + gap),
          y: startY + r * (bh + gap),
          w: bw,
          h: bh,
          color: colors[r % colors.length],
          alive: true,
        });
      }
    }
    gameStateRef.current.bricks = bricks;
    gameStateRef.current.score = 0;
    gameStateRef.current.lives = 3;
    gameStateRef.current.paddleX = 128;
    gameStateRef.current.ballX = 128;
    gameStateRef.current.ballY = 136;
    gameStateRef.current.vx = 2.0;
    gameStateRef.current.vy = -2.35;
    paddleTargetRef.current = 128;
    setScore(0);
    setLives(3);
  }, [paddleTargetRef]);

  useEffect(() => {
    resetBricks();
  }, [resetBricks]);

  // Center button launches ball or restarts after win/loss
  useEffect(() => {
    if (launchSignal === 0) return;
    if (statusRef.current === "ready") {
      playTap();
      setStatus("playing");
    } else if (statusRef.current === "won" || statusRef.current === "lost") {
      playTap();
      resetBricks();
      setStatus("playing");
    }
  }, [launchSignal, resetBricks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const W = canvas.width;
    const H = canvas.height;
    const paddleW = 46;
    const paddleH = 7;
    const paddleY = H - 15;
    const ballR = 4.2;

    const tick = () => {
      const g = gameStateRef.current;

      // Smooth paddle follow
      const target = Math.max(
        paddleW / 2 + 4,
        Math.min(W - paddleW / 2 - 4, paddleTargetRef.current),
      );
      g.paddleX += (target - g.paddleX) * 0.28;

      if (statusRef.current === "ready") {
        g.ballX = g.paddleX;
        g.ballY = paddleY - ballR - 1;
      } else if (statusRef.current === "playing") {
        g.ballX += g.vx;
        g.ballY += g.vy;

        // Walls
        if (g.ballX - ballR <= 2) {
          g.ballX = 2 + ballR;
          g.vx = Math.abs(g.vx);
          playTick();
        } else if (g.ballX + ballR >= W - 2) {
          g.ballX = W - 2 - ballR;
          g.vx = -Math.abs(g.vx);
          playTick();
        }
        if (g.ballY - ballR <= 2) {
          g.ballY = 2 + ballR;
          g.vy = Math.abs(g.vy);
          playTick();
        }

        // Paddle collision
        if (
          g.vy > 0 &&
          g.ballY + ballR >= paddleY &&
          g.ballY - ballR <= paddleY + paddleH &&
          g.ballX >= g.paddleX - paddleW / 2 - 3 &&
          g.ballX <= g.paddleX + paddleW / 2 + 3
        ) {
          const hitOffset = (g.ballX - g.paddleX) / (paddleW / 2);
          g.vx = hitOffset * 3.1;
          g.vy = -Math.max(2.2, Math.abs(g.vy));
          g.ballY = paddleY - ballR - 0.5;
          playTap();
        }

        // Bricks collision
        let remaining = 0;
        for (const b of g.bricks) {
          if (!b.alive) continue;
          remaining++;
          if (
            g.ballX + ballR >= b.x &&
            g.ballX - ballR <= b.x + b.w &&
            g.ballY + ballR >= b.y &&
            g.ballY - ballR <= b.y + b.h
          ) {
            b.alive = false;
            remaining--;
            g.vy = -g.vy;
            g.score += 10;
            setScore(g.score);
            playTick();
            break;
          }
        }

        if (remaining === 0) {
          playSuccessChime();
          setStatus("won");
        }

        // Missed ball
        if (g.ballY - ballR > H) {
          g.lives -= 1;
          setLives(g.lives);
          if (g.lives <= 0) {
            setStatus("lost");
          } else {
            g.ballX = g.paddleX;
            g.ballY = paddleY - ballR - 1;
            g.vx = 2.0 * (Math.random() > 0.5 ? 1 : -1);
            g.vy = -2.35;
            setStatus("ready");
          }
        }
      }

      // Draw board
      ctx.fillStyle = "#0e131e";
      ctx.fillRect(0, 0, W, H);

      // Subtle classic grid
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Bricks
      for (const b of g.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.fillRect(b.x, b.y, b.w, 2);
      }

      // Paddle
      const pGrad = ctx.createLinearGradient(0, paddleY, 0, paddleY + paddleH);
      pGrad.addColorStop(0, "#f8fafc");
      pGrad.addColorStop(1, "#94a3b8");
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(g.paddleX - paddleW / 2, paddleY, paddleW, paddleH, 3.5);
      ctx.fill();

      // Ball
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(g.ballX, g.ballY, ballR, 0, Math.PI * 2);
      ctx.fill();

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [paddleTargetRef]);

  return (
    <div className="relative flex h-full w-full flex-col bg-[#0e131e] text-white">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/35 px-2.5 py-0.5 font-mono text-[9.5px]">
        <span>SCORE {score}</span>
        <span>{"●".repeat(Math.max(0, lives))}{"○".repeat(Math.max(0, 3 - lives))}</span>
      </div>
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          width={256}
          height={154}
          className="h-full w-full"
        />
        {status !== "playing" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/45 px-3 text-center">
            <p className="text-[12px] font-bold tracking-tight">
              {status === "won"
                ? "Stage Cleared!"
                : status === "lost"
                  ? `Game Over · ${score}`
                  : "Brick"}
            </p>
            <p className="mt-0.5 text-[9.5px] text-white/75">
              Scroll wheel to steer · Center to {status === "ready" ? "launch" : "retry"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   Main Component: IPodClassicV2
   ========================================================================== */
export function IPodClassicV2({
  tracks: hostTracks,
  finish: controlledFinish = "silver",
  wheelCaptureMode: controlledWheelMode = "hold",
  enable3dTilt = true,
  ownerName = "Rohit",
  className,
}: IPodClassicV2Props) {
  const prefersReducedMotion = useReducedMotion();
  const is3dEnabled = enable3dTilt && !prefersReducedMotion;

  // Playlist state: host hand-picked tracks + browser-persisted visitor additions
  const [userTracks, setUserTracks] = useState<IPodClassicTrack[]>(() =>
    loadUserIPodTracks(),
  );
  const allTracks = useMemo<IPodClassicTrack[]>(
    () => [...(hostTracks ?? HANDPICKED_IPOD_TRACKS), ...userTracks],
    [hostTracks, userTracks],
  );

  // Settings & shell state
  const [finish, setFinish] = useState<IPodMetalFinish>(controlledFinish);
  const [wheelCaptureMode, setWheelCaptureMode] =
    useState<IPodWheelCaptureMode>(controlledWheelMode);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("all");
  const [backlightHigh, setBacklightHigh] = useState(true);

  useEffect(() => {
    setFinish(controlledFinish);
  }, [controlledFinish]);

  useEffect(() => {
    setWheelCaptureMode(controlledWheelMode);
  }, [controlledWheelMode]);

  // Screen navigation stack
  const [stack, setStack] = useState<ScreenId[]>(["main"]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [coverFlowIndex, setCoverFlowIndex] = useState(0);
  const [nowPlayingView, setNowPlayingView] =
    useState<NowPlayingSubView>("art");

  // Audio playback state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Brick game refs
  const brickPaddleRef = useRef(128);
  const [brickLaunchSignal, setBrickLaunchSignal] = useState(0);

  // Music Quiz state
  const [quizRound, setQuizRound] = useState(1);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswerIdx, setQuizAnswerIdx] = useState(0);
  const [quizChoices, setQuizChoices] = useState<number[]>([]);
  const [quizTimeLeft, setQuizTimeLeft] = useState(10);
  const [quizFeedback, setQuizFeedback] = useState<"idle" | "correct" | "wrong" | "done">("idle");

  // Add Track form state
  const [addUrlInput, setAddUrlInput] = useState("");
  const [addTitleInput, setAddTitleInput] = useState("");
  const [addArtistInput, setAddArtistInput] = useState("");

  // Refs for audio, DOM tilt sync, Click Wheel drag, and wheel-hold detection
  const audioRef = useRef<HTMLAudioElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const domFaceRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const lyricsScrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoPlayRef = useRef(false);
  const isWheelDraggingRef = useRef(false);
  const isHoldingDeviceRef = useRef(false);
  const lastAngleRef = useRef(0);
  const wakeWebglRef = useRef<(() => void) | null>(null);

  const restingTiltX = is3dEnabled ? -0.045 : 0; // Subtle sculptural tabletop tilt
  const tiltRef = useRef<IPodTiltRef>({
    targetX: restingTiltX,
    targetY: 0,
    currentX: restingTiltX,
    currentY: 0,
    onSyncDom: (rx, ry) => {
      const face = domFaceRef.current;
      if (!face) return;
      // Three.js positive rx tilts top toward camera; CSS positive rotateX tilts top away -> invert X
      face.style.transform = `perspective(1100px) rotateX(${(-rx).toFixed(5)}rad) rotateY(${ry.toFixed(5)}rad) translateZ(20px)`;
    },
  });

  useEffect(() => {
    const rest = is3dEnabled ? -0.045 : 0;
    tiltRef.current.targetX = rest;
    tiltRef.current.targetY = 0;
    if (!is3dEnabled) {
      tiltRef.current.currentX = 0;
      tiltRef.current.currentY = 0;
      if (domFaceRef.current) {
        domFaceRef.current.style.transform = "translateZ(0px)";
      }
    }
    wakeWebglRef.current?.();
  }, [is3dEnabled]);

  const currentScreen = stack[stack.length - 1];
  const currentTrack = allTracks[currentTrackIndex] ?? allTracks[0];
  const currentAudioSrc = useMemo(
    () => (currentTrack ? getTrackAudioSrc(currentTrack) : ""),
    [currentTrack],
  );

  // Artists & Albums grouping
  const artists = useMemo(() => {
    const set = new Set<string>();
    allTracks.forEach((t) => set.add(t.artist));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allTracks]);

  const albums = useMemo(() => {
    const map = new Map<string, { album: string; artist: string; trackIndex: number }>();
    allTracks.forEach((t, idx) => {
      if (!map.has(t.album)) {
        map.set(t.album, { album: t.album, artist: t.artist, trackIndex: idx });
      }
    });
    return Array.from(map.values());
  }, [allTracks]);

  // Sync HTML5 audio when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioSrc) return;
    audio.load();
    setCurrentTime(0);
    setDuration(currentTrack?.durationHintSec ?? 60);
    if (shouldAutoPlayRef.current) {
      shouldAutoPlayRef.current = false;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  }, [currentTrackIndex, currentAudioSrc, currentTrack?.durationHintSec]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const pushScreen = useCallback((next: ScreenId) => {
    playTick();
    setStack((prev) => [...prev, next]);
    setSelectedIndex(0);
  }, []);

  const popScreen = useCallback(() => {
    playTick();
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setSelectedIndex(0);
  }, []);

  const playTrackByIndex = useCallback(
    (index: number, openNowPlaying = true) => {
      playTap();
      const safeIdx = Math.max(0, Math.min(allTracks.length - 1, index));
      if (openNowPlaying) {
        setStack((prev) =>
          prev[prev.length - 1] === "nowplaying"
            ? prev
            : [...prev, "nowplaying"],
        );
      }
      if (safeIdx === currentTrackIndex && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        shouldAutoPlayRef.current = true;
        setCurrentTrackIndex(safeIdx);
      }
    },
    [allTracks.length, currentTrackIndex],
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playTap();
    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleNextTrack = useCallback(() => {
    if (allTracks.length === 0) return;
    playTick();
    let next = currentTrackIndex + 1;
    if (shuffle && allTracks.length > 1) {
      do {
        next = Math.floor(Math.random() * allTracks.length);
      } while (next === currentTrackIndex);
    } else if (next >= allTracks.length) {
      if (repeat === "all") next = 0;
      else {
        setIsPlaying(false);
        return;
      }
    }
    shouldAutoPlayRef.current = true;
    setCurrentTrackIndex(next);
  }, [allTracks.length, currentTrackIndex, repeat, shuffle]);

  const handlePrevTrack = useCallback(() => {
    if (allTracks.length === 0) return;
    playTick();
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    let prev = currentTrackIndex - 1;
    if (prev < 0) {
      prev = repeat === "all" ? allTracks.length - 1 : 0;
    }
    shouldAutoPlayRef.current = true;
    setCurrentTrackIndex(prev);
  }, [allTracks.length, currentTrackIndex, repeat]);

  // Music Quiz round generator
  const startQuizRound = useCallback(
    (roundNum: number) => {
      if (allTracks.length < 2) return;
      const answerIdx = Math.floor(Math.random() * allTracks.length);
      const pool = allTracks
        .map((_, idx) => idx)
        .filter((idx) => idx !== answerIdx);
      const distractors: number[] = [];
      while (distractors.length < Math.min(3, pool.length)) {
        const pick = Math.floor(Math.random() * pool.length);
        distractors.push(pool.splice(pick, 1)[0]);
      }
      const choices = [answerIdx, ...distractors].sort(
        () => Math.random() - 0.5,
      );
      setQuizRound(roundNum);
      setQuizAnswerIdx(answerIdx);
      setQuizChoices(choices);
      setQuizTimeLeft(10);
      setQuizFeedback("idle");
      setSelectedIndex(0);
      playTrackByIndex(answerIdx, false);
    },
    [allTracks, playTrackByIndex],
  );

  // Quiz countdown timer
  useEffect(() => {
    if (currentScreen !== "quiz" || quizFeedback !== "idle") return;
    const id = window.setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          setQuizFeedback("wrong");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [currentScreen, quizFeedback]);

  const submitQuizGuess = useCallback(
    (choiceTrackIdx: number) => {
      if (quizFeedback === "done") {
        setQuizScore(0);
        startQuizRound(1);
        return;
      }
      if (quizFeedback !== "idle") {
        if (quizRound >= 5) {
          setQuizFeedback("done");
        } else {
          startQuizRound(quizRound + 1);
        }
        return;
      }
      if (choiceTrackIdx === quizAnswerIdx) {
        playSuccessChime();
        setQuizScore((s) => s + 1);
        setQuizFeedback("correct");
      } else {
        playTap();
        setQuizFeedback("wrong");
      }
    },
    [quizAnswerIdx, quizFeedback, quizRound, startQuizRound],
  );

  // Add visitor track (persisted in localStorage)
  const handleAddVisitorTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = addTitleInput.trim();
    const cleanArtist = addArtistInput.trim() || "Visitor Pick";
    if (!cleanTitle) {
      showToast("Enter a track title to add to your iPod");
      return;
    }
    const ytId = extractYouTubeVideoId(addUrlInput) ?? undefined;
    const motifs: IPodClassicTrack["artMotif"][] = [
      "rings",
      "horizon",
      "grid",
      "prism",
      "wave",
      "monolith",
    ];
    const palettes: (readonly [string, string, string])[] = [
      ["#1E293B", "#0EA5E9", "#E0F2FE"],
      ["#3B0764", "#D946EF", "#FAE8FF"],
      ["#14532D", "#22C55E", "#DCFCE7"],
      ["#431407", "#EA580C", "#FFEDD5"],
    ];
    const nextIdx = userTracks.length;
    const created: IPodClassicTrack = {
      id: `user-${Date.now()}`,
      title: cleanTitle,
      artist: cleanArtist,
      album: ytId ? "YouTube Picks" : "Visitor Crate",
      year: String(new Date().getFullYear()),
      durationHintSec: 60,
      youtubeId: ytId,
      lyricsTitle: cleanTitle,
      lyricsArtist: cleanArtist,
      synthTrackIndex: nextIdx % 3,
      artPalette: palettes[nextIdx % palettes.length],
      artMotif: motifs[nextIdx % motifs.length],
      userAdded: true,
      lyrics: [
        { timeSec: 0, text: `${cleanTitle} · ${cleanArtist}` },
        { timeSec: 8, text: ytId ? `Linked YouTube ID: ${ytId}` : "Saved in browser crate" },
        { timeSec: 18, text: "Playing through the brushed-metal deck" },
        { timeSec: 32, text: "Synced lyrics adapt to your track clock" },
        { timeSec: 46, text: "Saved locally so it stays on reload" },
      ],
    };

    const nextUserTracks = [...userTracks, created];
    setUserTracks(nextUserTracks);
    saveUserIPodTracks(nextUserTracks);
    setAddUrlInput("");
    setAddTitleInput("");
    setAddArtistInput("");
    playSuccessChime();
    showToast(`Added "${cleanTitle}" to your iPod`);
    // Play the newly added song immediately
    const newGlobalIndex =
      (hostTracks ?? HANDPICKED_IPOD_TRACKS).length + nextUserTracks.length - 1;
    playTrackByIndex(newGlobalIndex, true);
  };

  const handleRemoveUserTracks = useCallback(() => {
    setUserTracks([]);
    saveUserIPodTracks([]);
    setCurrentTrackIndex(0);
    playTap();
    showToast("Cleared visitor-added tracks");
  }, []);

  // Build menu rows for list screens
  const menuRows = useMemo<MenuRow[]>(() => {
    if (currentScreen === "main") {
      return [
        { label: "Music", chevron: true, action: () => pushScreen("music") },
        {
          label: "Cover Flow",
          chevron: true,
          action: () => {
            setCoverFlowIndex(currentTrackIndex);
            pushScreen("coverflow");
          },
        },
        { label: "Games", chevron: true, action: () => pushScreen("games") },
        {
          label: "Settings",
          chevron: true,
          action: () => pushScreen("settings"),
        },
        {
          label: "Shuffle Songs",
          action: () => {
            setShuffle(true);
            playTrackByIndex(Math.floor(Math.random() * allTracks.length), true);
          },
        },
        {
          label: "Now Playing",
          chevron: true,
          action: () => pushScreen("nowplaying"),
        },
      ];
    }

    if (currentScreen === "music") {
      return [
        {
          label: "Cover Flow",
          chevron: true,
          action: () => {
            setCoverFlowIndex(currentTrackIndex);
            pushScreen("coverflow");
          },
        },
        {
          label: "All Songs",
          value: String(allTracks.length),
          chevron: true,
          action: () => pushScreen("allsongs"),
        },
        {
          label: "Artists",
          value: String(artists.length),
          chevron: true,
          action: () => pushScreen("artists"),
        },
        {
          label: "Albums",
          value: String(albums.length),
          chevron: true,
          action: () => pushScreen("albums"),
        },
        {
          label: "Add Song (+)",
          chevron: true,
          action: () => pushScreen("addtrack"),
        },
      ];
    }

    if (currentScreen === "allsongs") {
      return allTracks.map((t, idx) => ({
        label: t.title,
        value: t.userAdded ? "Saved" : undefined,
        action: () => playTrackByIndex(idx, true),
      }));
    }

    if (currentScreen === "artists") {
      return artists.map((artist) => ({
        label: artist,
        chevron: true,
        action: () => pushScreen(`artist:${artist}`),
      }));
    }

    if (currentScreen === "albums") {
      return albums.map((a) => ({
        label: a.album,
        chevron: true,
        action: () => pushScreen(`album:${a.album}`),
      }));
    }

    if (currentScreen.startsWith("artist:")) {
      const artistName = currentScreen.slice("artist:".length);
      return allTracks
        .map((t, idx) => ({ t, idx }))
        .filter(({ t }) => t.artist === artistName)
        .map(({ t, idx }) => ({
          label: t.title,
          action: () => playTrackByIndex(idx, true),
        }));
    }

    if (currentScreen.startsWith("album:")) {
      const albumName = currentScreen.slice("album:".length);
      return allTracks
        .map((t, idx) => ({ t, idx }))
        .filter(({ t }) => t.album === albumName)
        .map(({ t, idx }) => ({
          label: t.title,
          action: () => playTrackByIndex(idx, true),
        }));
    }

    if (currentScreen === "games") {
      return [
        {
          label: "Brick",
          chevron: true,
          action: () => pushScreen("brick"),
        },
        {
          label: "Music Quiz",
          chevron: true,
          action: () => {
            setQuizScore(0);
            pushScreen("quiz");
            startQuizRound(1);
          },
        },
      ];
    }

    if (currentScreen === "settings") {
      return [
        {
          label: "Shell Metal",
          value:
            finish === "silver"
              ? "Silver"
              : finish === "graphite"
                ? "Graphite"
                : "Champagne",
          action: () => {
            playTap();
            setFinish((f) =>
              f === "silver"
                ? "graphite"
                : f === "graphite"
                  ? "champagne"
                  : "silver",
            );
          },
        },
        {
          label: "Mouse Wheel",
          value: wheelCaptureMode === "hold" ? "Hold" : "Always",
          action: () => {
            playTap();
            setWheelCaptureMode((m) => (m === "hold" ? "always" : "hold"));
          },
        },
        {
          label: "Shuffle",
          value: shuffle ? "On" : "Off",
          action: () => {
            playTap();
            setShuffle((s) => !s);
          },
        },
        {
          label: "Repeat",
          value: repeat === "off" ? "Off" : repeat === "one" ? "One" : "All",
          action: () => {
            playTap();
            setRepeat((r) => (r === "off" ? "one" : r === "one" ? "all" : "off"));
          },
        },
        {
          label: "Brightness",
          value: backlightHigh ? "High" : "Dim",
          action: () => {
            playTap();
            setBacklightHigh((b) => !b);
          },
        },
        ...(userTracks.length > 0
          ? [
              {
                label: "Clear Added Songs",
                value: String(userTracks.length),
                action: handleRemoveUserTracks,
              },
            ]
          : []),
      ];
    }

    return [];
  }, [
    albums,
    allTracks,
    artists,
    backlightHigh,
    currentScreen,
    currentTrackIndex,
    finish,
    handleRemoveUserTracks,
    playTrackByIndex,
    pushScreen,
    repeat,
    shuffle,
    startQuizRound,
    userTracks.length,
    wheelCaptureMode,
  ]);

  // Keep active list row scrolled into view
  useEffect(() => {
    const el = listScrollRef.current?.children[selectedIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, currentScreen]);

  // Active lyric index calculation + smooth scroll
  const activeLyricIndex = useMemo(() => {
    const lines = currentTrack?.lyrics ?? [];
    let idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime + 0.25 >= lines[i].timeSec) idx = i;
    }
    return idx;
  }, [currentTrack?.lyrics, currentTime]);

  useEffect(() => {
    if (currentScreen !== "nowplaying" || nowPlayingView !== "lyrics") return;
    const row = lyricsScrollRef.current?.children[activeLyricIndex] as
      | HTMLElement
      | undefined;
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeLyricIndex, currentScreen, nowPlayingView]);

  // Scroll step handler shared by Click Wheel drag, mouse wheel, and arrow keys
  const handleWheelStep = useCallback(
    (direction: 1 | -1) => {
      if (currentScreen === "coverflow") {
        setCoverFlowIndex((prev) => {
          const next = Math.max(0, Math.min(allTracks.length - 1, prev + direction));
          if (next !== prev) playTick();
          return next;
        });
        return;
      }

      if (currentScreen === "brick") {
        brickPaddleRef.current = Math.max(
          26,
          Math.min(230, brickPaddleRef.current + direction * 18),
        );
        return;
      }

      if (currentScreen === "quiz") {
        setSelectedIndex((prev) => {
          const maxIdx = Math.max(0, quizChoices.length - 1);
          const next = Math.max(0, Math.min(maxIdx, prev + direction));
          if (next !== prev) playTick();
          return next;
        });
        return;
      }

      if (currentScreen === "nowplaying") {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
          return;
        }
        const nextTime = Math.max(
          0,
          Math.min(audio.duration, audio.currentTime + direction * 5),
        );
        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
        playTick();
        return;
      }

      if (menuRows.length > 0) {
        setSelectedIndex((prev) => {
          const next = Math.max(0, Math.min(menuRows.length - 1, prev + direction));
          if (next !== prev) playTick();
          return next;
        });
      }
    },
    [allTracks.length, currentScreen, menuRows.length, quizChoices.length],
  );

  // Center select action
  const handleCenterButton = useCallback(() => {
    if (currentScreen === "coverflow") {
      playTrackByIndex(coverFlowIndex, true);
      return;
    }
    if (currentScreen === "nowplaying") {
      playTick();
      setNowPlayingView((v) =>
        v === "art" ? "lyrics" : v === "lyrics" ? "visualizer" : "art",
      );
      return;
    }
    if (currentScreen === "brick") {
      setBrickLaunchSignal((n) => n + 1);
      return;
    }
    if (currentScreen === "quiz") {
      const pickedTrackIdx = quizChoices[selectedIndex] ?? quizChoices[0];
      submitQuizGuess(pickedTrackIdx);
      return;
    }
    if (menuRows[selectedIndex]) {
      menuRows[selectedIndex].action();
    }
  }, [
    coverFlowIndex,
    currentScreen,
    menuRows,
    playTrackByIndex,
    quizChoices,
    selectedIndex,
    submitQuizGuess,
  ]);

  // Attach native non-passive wheel listener so Hold vs Always policy never hijacks page scroll
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const shouldClaim =
        wheelCaptureMode === "always" || isHoldingDeviceRef.current;
      if (!shouldClaim) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 4) return;
      handleWheelStep(e.deltaY > 0 ? 1 : -1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [handleWheelStep, wheelCaptureMode]);

  // Rotary Click Wheel drag
  const handleWheelPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    isHoldingDeviceRef.current = true;
    if ((e.target as HTMLElement).closest("button")) return;
    if (!wheelRef.current) return;
    isWheelDraggingRef.current = true;
    const rect = wheelRef.current.getBoundingClientRect();
    lastAngleRef.current = Math.atan2(
      e.clientY - (rect.top + rect.height / 2),
      e.clientX - (rect.left + rect.width / 2),
    );

    // Steady 3D tilt while rotating the wheel
    tiltRef.current.targetX = restingTiltX;
    tiltRef.current.targetY = 0;
    wakeWebglRef.current?.();

    const onMove = (ev: PointerEvent) => {
      if (!isWheelDraggingRef.current || !wheelRef.current) return;
      const r = wheelRef.current.getBoundingClientRect();
      const angle = Math.atan2(
        ev.clientY - (r.top + r.height / 2),
        ev.clientX - (r.left + r.width / 2),
      );
      let delta = angle - lastAngleRef.current;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      const threshold = currentScreen === "brick" ? 0.1 : 0.22;
      if (Math.abs(delta) > threshold) {
        handleWheelStep(delta > 0 ? 1 : -1);
        lastAngleRef.current = angle;
      }
    };

    const onUp = () => {
      isWheelDraggingRef.current = false;
      isHoldingDeviceRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Pointer-driven 3D tilt over stage
  const handleStagePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!is3dEnabled || isWheelDraggingRef.current || e.pointerType !== "mouse") {
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const nx = Math.min(Math.max((e.clientX - rect.left) / rect.width - 0.5, -0.5), 0.5);
    const ny = Math.min(Math.max((e.clientY - rect.top) / rect.height - 0.5, -0.5), 0.5);

    // Smooth ±11deg Y and ±8deg X tilt toward pointer
    tiltRef.current.targetY = nx * 0.36;
    tiltRef.current.targetX = ny * 0.28;
    wakeWebglRef.current?.();
  };

  const handleStagePointerLeave = () => {
    isHoldingDeviceRef.current = false;
    tiltRef.current.targetX = restingTiltX;
    tiltRef.current.targetY = 0;
    wakeWebglRef.current?.();
  };

  // Scoped keyboard navigation
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        handleWheelStep(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        handleWheelStep(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (currentScreen === "coverflow" || currentScreen === "brick") {
          handleWheelStep(-1);
        } else {
          handlePrevTrack();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (currentScreen === "coverflow" || currentScreen === "brick") {
          handleWheelStep(1);
        } else {
          handleNextTrack();
        }
        break;
      case "Enter":
        e.preventDefault();
        handleCenterButton();
        break;
      case " ":
        e.preventDefault();
        togglePlayPause();
        break;
      case "Escape":
        e.preventDefault();
        popScreen();
        break;
    }
  };

  const screenTitle =
    currentScreen === "main"
      ? `${ownerName}'s iPod`
      : currentScreen === "music"
        ? "Music"
        : currentScreen === "coverflow"
          ? "Cover Flow"
          : currentScreen === "allsongs"
            ? "Songs"
            : currentScreen === "artists"
              ? "Artists"
              : currentScreen === "albums"
                ? "Albums"
                : currentScreen === "games"
                  ? "Games"
                  : currentScreen === "brick"
                    ? "Brick"
                    : currentScreen === "quiz"
                      ? "Music Quiz"
                      : currentScreen === "settings"
                        ? "Settings"
                        : currentScreen === "addtrack"
                          ? "Add Song"
                          : currentScreen === "nowplaying"
                            ? nowPlayingView === "lyrics"
                              ? "Lyrics"
                              : nowPlayingView === "visualizer"
                                ? "Visualizer"
                                : "Now Playing"
                            : currentScreen.includes(":")
                              ? currentScreen.split(":")[1]
                              : "iPod";

  // Split-screen right preview card for main menu
  const previewTrack =
    currentScreen === "allsongs"
      ? allTracks[selectedIndex] ?? currentTrack
      : currentTrack;

  const isDarkMetal = finish === "graphite";
  const wheelBg = isDarkMetal
    ? "radial-gradient(circle at 32% 28%, #2a2c32 0%, #17181c 75%)"
    : finish === "champagne"
      ? "radial-gradient(circle at 32% 28%, #f8f5ef 0%, #e4dccf 78%)"
      : "radial-gradient(circle at 32% 28%, #ffffff 0%, #e7eaef 78%)";
  const wheelText = isDarkMetal ? "#e4e4e7" : "#646973";
  const centerBtnBg = isDarkMetal
    ? "linear-gradient(145deg, #3c3f47 0%, #24262b 100%)"
    : finish === "champagne"
      ? "linear-gradient(145deg, #dfd2be 0%, #c6b69d 100%)"
      : "linear-gradient(145deg, #dcdfe5 0%, #c5cad3 100%)";

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`${ownerName}'s iPod Classic WebGL player`}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex w-full flex-col items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)] focus-visible:ring-offset-2",
        className,
      )}
    >
      {/* Hidden local HTML5 audio player (always works offline with instant response) */}
      <audio
        ref={audioRef}
        src={currentAudioSrc}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          if (repeat === "one" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => setIsPlaying(false));
          } else {
            handleNextTrack();
          }
        }}
      />

      {/* Interactive 3D WebGL + Projected Front Face Stage */}
      <div
        ref={stageRef}
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerLeave}
        onPointerDown={() => {
          isHoldingDeviceRef.current = true;
        }}
        onPointerUp={() => {
          isHoldingDeviceRef.current = false;
        }}
        className="relative flex h-[576px] w-full max-w-[420px] items-center justify-center select-none"
      >
        {/* Continuous 38px-thick WebGL Brushed Metal Hardware Shell */}
        <IPodWebGLShell
          finish={finish}
          tiltRef={tiltRef}
          wakeSignalRef={wakeWebglRef}
        />

        {/* Projected Interactive Front Face (Screen + Click Wheel), locked 1:1 to WebGL front plane */}
        <div
          ref={domFaceRef}
          style={{
            width: 304,
            height: 496,
            transform: is3dEnabled
              ? `perspective(1100px) rotateX(${(-restingTiltX).toFixed(5)}rad) rotateY(0rad) translateZ(20px)`
              : "translateZ(0px)",
          }}
          className="relative z-10 flex flex-col items-center justify-between px-[20px] pt-[30px] pb-[32px] will-change-transform"
        >
          {/* 320×240 Color TFT LCD Screen */}
          <div
            style={{
              width: 264,
              height: 200,
              filter: backlightHigh ? "none" : "brightness(0.76)",
            }}
            className="relative flex flex-col overflow-hidden rounded-[8px] border border-black/80 bg-[#f6f7f9] text-[#14171c] shadow-[inset_0_2px_6px_rgba(0,0,0,0.38)] transition-[filter] duration-200"
          >
            {/* Classic Glossy Status Bar */}
            <div className="flex h-[22px] shrink-0 items-center justify-between border-b border-[#9da6b3] bg-[linear-gradient(180deg,#fdfeff_0%,#dce2eb_52%,#ced6e2_100%)] px-2">
              <div className="flex w-[16px] items-center">
                {isPlaying ? (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="#1d6de5">
                    <polygon points="0,0 8,4 0,8" />
                  </svg>
                ) : (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="#64748b">
                    <rect x="0.5" y="0.5" width="2.4" height="7" />
                    <rect x="4.8" y="0.5" width="2.4" height="7" />
                  </svg>
                )}
              </div>
              <span className="truncate font-sans text-[11px] font-bold tracking-[-0.015em] text-[#111827]">
                {screenTitle}
              </span>
              {/* Classic green metallic battery */}
              <div className="flex items-center">
                <div className="relative flex h-[10px] w-[18px] items-center rounded-[2px] border border-[#475569] bg-white/80 p-[1px]">
                  <div className="h-full w-[82%] rounded-[1px] bg-[linear-gradient(180deg,#86efac_0%,#16a34a_100%)]" />
                  <div className="absolute top-1/2 -right-[2.5px] h-[4px] w-[2px] -translate-y-1/2 rounded-r-[1px] bg-[#475569]" />
                </div>
              </div>
            </div>

            {/* Active Screen Content */}
            <div className="relative flex-1 overflow-hidden">
              {/* 1. COVER FLOW */}
              {currentScreen === "coverflow" ? (
                <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(180deg,#0f172a_0%,#05070c_66%,#141a28_100%)] px-2 pt-3 pb-2 text-white">
                  <div className="relative flex h-[112px] w-full items-center justify-center [perspective:480px]">
                    {allTracks.map((track, idx) => {
                      const offset = idx - coverFlowIndex;
                      if (Math.abs(offset) > 3) return null;
                      const isCenter = offset === 0;
                      const translateX =
                        offset === 0
                          ? 0
                          : offset > 0
                            ? 44 + (offset - 1) * 26
                            : -44 + (offset + 1) * 26;
                      const rotateY = offset === 0 ? 0 : offset > 0 ? -56 : 56;
                      const scale = isCenter ? 1 : 0.78;
                      const zIndex = 20 - Math.abs(offset);
                      const art = getTrackCoverArtUri(track);

                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => {
                            if (isCenter) {
                              playTrackByIndex(idx, true);
                            } else {
                              playTick();
                              setCoverFlowIndex(idx);
                            }
                          }}
                          style={{
                            transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                            zIndex,
                            opacity: Math.abs(offset) > 2 ? 0.45 : 1,
                          }}
                          className="absolute cursor-pointer transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                        >
                          <img
                            src={art}
                            alt={track.album}
                            className="h-[88px] w-[88px] rounded-[4px] border border-white/25 object-cover shadow-[0_8px_18px_rgba(0,0,0,0.65)]"
                          />
                          {/* Mirror reflection */}
                          <img
                            src={art}
                            alt=""
                            aria-hidden="true"
                            style={{
                              transform: "scaleY(-1)",
                              maskImage:
                                "linear-gradient(to bottom, rgba(0,0,0,0.34), transparent 72%)",
                              WebkitMaskImage:
                                "linear-gradient(to bottom, rgba(0,0,0,0.34), transparent 72%)",
                            }}
                            className="mt-[2px] h-[22px] w-[88px] rounded-[4px] object-cover opacity-65"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-center leading-tight">
                    <p className="truncate text-[11px] font-bold text-white">
                      {allTracks[coverFlowIndex]?.title}
                    </p>
                    <p className="truncate text-[9.5px] text-white/65">
                      {allTracks[coverFlowIndex]?.artist} ·{" "}
                      {allTracks[coverFlowIndex]?.album}
                    </p>
                  </div>
                </div>
              ) : /* 2. NOW PLAYING (Art / Synced Lyrics / Visualizer) */
              currentScreen === "nowplaying" && currentTrack ? (
                <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(180deg,#ffffff_0%,#eef2f7_100%)] p-2.5">
                  {nowPlayingView === "art" ? (
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative shrink-0 [perspective:320px]">
                        <img
                          src={getTrackCoverArtUri(currentTrack)}
                          alt={currentTrack.album}
                          style={{ transform: "rotateY(10deg)" }}
                          className="h-[84px] w-[84px] rounded-[5px] border border-black/15 object-cover shadow-[0_6px_14px_rgba(15,23,42,0.22)]"
                        />
                        <img
                          src={getTrackCoverArtUri(currentTrack)}
                          alt=""
                          aria-hidden="true"
                          style={{
                            transform: "rotateY(10deg) scaleY(-1)",
                            maskImage:
                              "linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 75%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 75%)",
                          }}
                          className="mt-[1px] h-[16px] w-[84px] rounded-[4px] object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-mono text-[8.5px] font-semibold uppercase tracking-wider text-[#64748b]">
                          {currentTrackIndex + 1} of {allTracks.length}
                          {shuffle ? " · SHF" : ""}
                          {repeat !== "off" ? ` · RPT ${repeat.toUpperCase()}` : ""}
                        </p>
                        <p className="truncate text-[12.5px] font-bold tracking-tight text-[#0f172a]">
                          {currentTrack.title}
                        </p>
                        <p className="truncate text-[10.5px] font-medium text-[#334155]">
                          {currentTrack.artist}
                        </p>
                        <p className="truncate text-[9.5px] text-[#64748b]">
                          {currentTrack.album}
                        </p>
                        <p className="pt-1 font-mono text-[8.5px] text-[#2563eb]">
                          Center → Lyrics / Visualizer
                        </p>
                      </div>
                    </div>
                  ) : nowPlayingView === "lyrics" ? (
                    <div className="flex flex-1 flex-col overflow-hidden rounded-[6px] bg-[#0f172a] px-2.5 py-2 text-white">
                      <div className="mb-1 flex items-center justify-between border-b border-white/10 pb-1 text-[8.5px] text-white/60">
                        <span className="truncate font-semibold text-white/85">
                          {currentTrack.lyricsTitle ?? currentTrack.title}
                        </span>
                        <span className="shrink-0 font-mono">SYNCED</span>
                      </div>
                      <div
                        ref={lyricsScrollRef}
                        className="flex-1 space-y-1.5 overflow-y-auto py-1 pr-1"
                      >
                        {currentTrack.lyrics.map((line, i) => {
                          const active = i === activeLyricIndex;
                          return (
                            <p
                              key={`${currentTrack.id}-l-${i}`}
                              className={cn(
                                "text-[10.5px] leading-snug transition-colors duration-200",
                                active
                                  ? "font-bold text-[#7dd3fc]"
                                  : i < activeLyricIndex
                                    ? "text-white/40"
                                    : "text-white/65",
                              )}
                            >
                              {line.text}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-hidden">
                      <NowPlayingVisualizer
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        palette={currentTrack.artPalette}
                      />
                    </div>
                  )}

                  {/* Glossy Blue Scrubber Bar */}
                  <div className="mt-2 shrink-0">
                    <div className="relative h-[8px] w-full overflow-hidden rounded-[3px] border border-[#cbd5e1] bg-[#e2e8f0] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]">
                      <div
                        style={{
                          width:
                            duration > 0
                              ? `${Math.min((currentTime / duration) * 100, 100)}%`
                              : "0%",
                        }}
                        className="h-full bg-[linear-gradient(180deg,#60a5fa_0%,#2563eb_55%,#1d4ed8_100%)] transition-[width] duration-100 ease-linear"
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between font-mono text-[9px] font-semibold tabular-nums text-[#475569]">
                      <span>{formatClock(currentTime)}</span>
                      <span>-{formatClock(Math.max(0, duration - currentTime))}</span>
                    </div>
                  </div>
                </div>
              ) : /* 3. BRICK GAME */
              currentScreen === "brick" ? (
                <IPodBrickGame
                  paddleTargetRef={brickPaddleRef}
                  launchSignal={brickLaunchSignal}
                />
              ) : /* 4. MUSIC QUIZ */
              currentScreen === "quiz" ? (
                <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(180deg,#ffffff_0%,#edf2f8_100%)] p-2">
                  <div className="flex items-center justify-between text-[9.5px] font-bold text-[#334155]">
                    <span>Round {quizRound} / 5</span>
                    <span className="font-mono text-[#2563eb]">
                      Score {quizScore} · {quizTimeLeft}s
                    </span>
                  </div>
                  <div className="my-1 h-[4px] w-full overflow-hidden rounded-full bg-[#cbd5e1]">
                    <div
                      style={{ width: `${(quizTimeLeft / 10) * 100}%` }}
                      className="h-full bg-[#2563eb] transition-[width] duration-300"
                    />
                  </div>
                  {quizFeedback === "done" ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <p className="text-[13px] font-bold text-[#0f172a]">
                        Final Score: {quizScore} / 5
                      </p>
                      <p className="mt-1 text-[10px] text-[#475569]">
                        Press Center to play again
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-[2px]">
                      {quizChoices.map((trackIdx, idx) => {
                        const track = allTracks[trackIdx];
                        if (!track) return null;
                        const active = idx === selectedIndex;
                        const isAnswer = trackIdx === quizAnswerIdx;
                        return (
                          <button
                            key={`${quizRound}-${track.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedIndex(idx);
                              submitQuizGuess(trackIdx);
                            }}
                            className={cn(
                              "flex w-full cursor-pointer items-center justify-between rounded-[3px] px-2 py-[4px] text-left text-[10.5px] font-semibold",
                              quizFeedback !== "idle" && isAnswer
                                ? "bg-[#16a34a] text-white"
                                : active
                                  ? "bg-[linear-gradient(180deg,#4ea1ff_0%,#1d6de5_100%)] text-white"
                                  : "text-[#0f172a] hover:bg-black/5",
                            )}
                          >
                            <span className="truncate">{track.title}</span>
                            {quizFeedback !== "idle" && isAnswer && (
                              <span className="ml-1 text-[9px]">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-center text-[9px] text-[#64748b]">
                    {quizFeedback === "correct"
                      ? "Correct! Press Center for next"
                      : quizFeedback === "wrong"
                        ? `It was ${allTracks[quizAnswerIdx]?.title} · Center for next`
                        : "Listen & pick the matching track"}
                  </p>
                </div>
              ) : /* 5. ADD VISITOR SONG (Persisted in Browser) */
              currentScreen === "addtrack" ? (
                <form
                  onSubmit={handleAddVisitorTrack}
                  className="flex h-full w-full flex-col justify-between bg-[#f8fafc] p-2.5 text-[#0f172a]"
                >
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-[#475569]">
                      Add a song (saved in this browser)
                    </p>
                    <input
                      type="text"
                      value={addTitleInput}
                      onChange={(e) => setAddTitleInput(e.target.value)}
                      placeholder="Track title *"
                      className="w-full rounded-[4px] border border-[#cbd5e1] bg-white px-2 py-1 text-[10.5px] text-[#0f172a] focus:border-[#2563eb] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={addArtistInput}
                      onChange={(e) => setAddArtistInput(e.target.value)}
                      placeholder="Artist name"
                      className="w-full rounded-[4px] border border-[#cbd5e1] bg-white px-2 py-1 text-[10.5px] text-[#0f172a] focus:border-[#2563eb] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={addUrlInput}
                      onChange={(e) => setAddUrlInput(e.target.value)}
                      placeholder="YouTube URL or ID (optional)"
                      className="w-full rounded-[4px] border border-[#cbd5e1] bg-white px-2 py-1 font-mono text-[9.5px] text-[#0f172a] focus:border-[#2563eb] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={popScreen}
                      className="cursor-pointer rounded-[4px] border border-[#cbd5e1] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#475569]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer rounded-[4px] bg-[#2563eb] px-3 py-1 text-[10px] font-semibold text-white"
                    >
                      Save &amp; Play
                    </button>
                  </div>
                </form>
              ) : /* 6. SPLIT-SCREEN HOME MENU OR FULL LIST MENU */
              currentScreen === "main" ? (
                <div className="grid h-full w-full grid-cols-[1.08fr_0.92fr]">
                  <div
                    ref={listScrollRef}
                    className="overflow-y-auto border-r border-[#d4dbe5] bg-white py-0.5"
                  >
                    {menuRows.map((row, idx) => {
                      const active = idx === selectedIndex;
                      return (
                        <button
                          key={row.label}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={row.action}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between px-2 py-[4.5px] text-left text-[11px] leading-tight font-semibold",
                            active
                              ? "bg-[linear-gradient(180deg,#52a5ff_0%,#196be6_100%)] text-white"
                              : "text-[#0f172a]",
                          )}
                        >
                          <span className="truncate">{row.label}</span>
                          {row.chevron && (
                            <span aria-hidden="true" className="ml-1 text-[11px]">
                              ›
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right split-screen live preview pane */}
                  <div className="flex flex-col items-center justify-center bg-[linear-gradient(180deg,#1e293b_0%,#0b1120_100%)] p-2 text-center text-white">
                    {previewTrack && (
                      <>
                        <img
                          src={getTrackCoverArtUri(previewTrack)}
                          alt={previewTrack.album}
                          className="h-[74px] w-[74px] rounded-[5px] border border-white/25 object-cover shadow-md"
                        />
                        <p className="mt-2 w-full truncate text-[9.5px] font-bold">
                          {previewTrack.title}
                        </p>
                        <p className="w-full truncate text-[8.5px] text-white/65">
                          {previewTrack.artist}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  ref={listScrollRef}
                  className="h-full w-full overflow-y-auto bg-white py-0.5"
                >
                  {menuRows.map((row, idx) => {
                    const active = idx === selectedIndex;
                    return (
                      <button
                        key={`${currentScreen}-${row.label}-${idx}`}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={row.action}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between px-2.5 py-[4.5px] text-left text-[11px] leading-tight font-semibold",
                          active
                            ? "bg-[linear-gradient(180deg,#52a5ff_0%,#196be6_100%)] text-white"
                            : "text-[#0f172a]",
                        )}
                      >
                        <span className="truncate">{row.label}</span>
                        <span className="ml-2 flex shrink-0 items-center gap-1 text-[10px]">
                          {row.value && (
                            <span className={active ? "text-white/90" : "text-[#64748b]"}>
                              {row.value}
                            </span>
                          )}
                          {row.chevron && <span aria-hidden="true">›</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tactile Click Wheel */}
          <div
            ref={wheelRef}
            onPointerDown={handleWheelPointerDown}
            style={{
              width: 184,
              height: 184,
              background: wheelBg,
              boxShadow: isDarkMetal
                ? "inset 0 1px 2px rgba(255,255,255,0.12), inset 0 -2px 5px rgba(0,0,0,0.5), 0 3px 10px rgba(0,0,0,0.45)"
                : "inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -2px 5px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.14)",
            }}
            className="relative flex cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
          >
            {/* Top: MENU */}
            <button
              type="button"
              aria-label="Menu"
              onClick={popScreen}
              style={{ color: wheelText }}
              className="absolute top-[13px] left-1/2 -translate-x-1/2 cursor-pointer px-2 py-1 font-sans text-[10.5px] font-bold tracking-[0.07em] transition-transform duration-100 active:scale-[0.94]"
            >
              MENU
            </button>

            {/* Right: Next / Scrub */}
            <button
              type="button"
              aria-label="Next track"
              onClick={() => {
                if (currentScreen === "coverflow" || currentScreen === "brick") {
                  handleWheelStep(1);
                } else {
                  handleNextTrack();
                }
              }}
              className="absolute top-1/2 right-[13px] flex h-[32px] w-[32px] -translate-y-1/2 cursor-pointer items-center justify-center transition-transform duration-100 active:scale-[0.92]"
            >
              <svg width="13" height="12" viewBox="0 0 16 16" fill={wheelText} aria-hidden="true">
                <polygon points="0,2 6,8 0,14" />
                <polygon points="6,2 12,8 6,14" />
                <rect x="13" y="2" width="2" height="12" />
              </svg>
            </button>

            {/* Bottom: Play / Pause */}
            <button
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlayPause}
              className="absolute bottom-[13px] left-1/2 flex h-[28px] w-[36px] -translate-x-1/2 cursor-pointer items-center justify-center transition-transform duration-100 active:scale-[0.92]"
            >
              <svg width="16" height="11" viewBox="0 0 20 14" fill={wheelText} aria-hidden="true">
                <polygon points="1,1 9,7 1,13" />
                <rect x="11.5" y="1.5" width="2.6" height="11" />
                <rect x="16" y="1.5" width="2.6" height="11" />
              </svg>
            </button>

            {/* Left: Previous / Scrub */}
            <button
              type="button"
              aria-label="Previous track"
              onClick={() => {
                if (currentScreen === "coverflow" || currentScreen === "brick") {
                  handleWheelStep(-1);
                } else {
                  handlePrevTrack();
                }
              }}
              className="absolute top-1/2 left-[13px] flex h-[32px] w-[32px] -translate-y-1/2 cursor-pointer items-center justify-center transition-transform duration-100 active:scale-[0.92]"
            >
              <svg width="13" height="12" viewBox="0 0 16 16" fill={wheelText} aria-hidden="true">
                <rect x="1" y="2" width="2" height="12" />
                <polygon points="10,2 4,8 10,14" />
                <polygon points="16,2 10,8 16,14" />
              </svg>
            </button>

            {/* Brushed Metal Center Select Button */}
            <button
              type="button"
              aria-label="Select"
              onClick={handleCenterButton}
              style={{
                width: 68,
                height: 68,
                background: centerBtnBg,
                boxShadow: isDarkMetal
                  ? "0 0 0 1px rgba(255,255,255,0.12), inset 0 1.5px 2px rgba(255,255,255,0.16), 0 2px 6px rgba(0,0,0,0.42)"
                  : "0 0 0 1px rgba(0,0,0,0.12), inset 0 1.5px 2px rgba(255,255,255,0.75), 0 2px 6px rgba(0,0,0,0.14)",
              }}
              className="cursor-pointer rounded-full transition-transform duration-150 ease-out active:scale-[0.95]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
