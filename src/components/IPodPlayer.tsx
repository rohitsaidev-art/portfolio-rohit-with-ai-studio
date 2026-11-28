import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  startTransition,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "../lib/utils";
import { playTap, playTick } from "../utils/soundEngine";
import {
  CASSETTE_DEMO_TRACKS,
  getSynthesizedTrackUrl,
} from "../utils/cassetteSynthAudio";

export type IPodTheme = "classic" | "black" | "u2";
export type IPodSize = "default" | "medium" | "large";

export interface IPodTrack {
  id: string;
  audioSrc: string;
  title: string;
  artist?: string;
  album?: string;
}

export interface IPodPlayerProps {
  theme?: IPodTheme;
  tracks?: readonly IPodTrack[];
  textShadow?: boolean;
  ownerName?: string;
  size?: IPodSize;
  /** Enable spring-interpolated 3D tilt, extruded stainless chassis rim, and specular acrylic sheen. */
  enable3dTilt?: boolean;
  /** Start booted immediately (useful inside studio previews) or play the 500ms boot splash on hover. */
  instantBoot?: boolean;
  className?: string;
  style?: CSSProperties;
}

type MenuKey =
  | "main"
  | "music"
  | "settings"
  | "allsongs"
  | "artists"
  | "albums"
  | "nowplaying"
  | `artist-${string}`
  | `album-${string}`;

interface MenuItem {
  label: string;
  hasChevron?: boolean;
  action: () => void;
}

const DEFAULT_IPOD_TRACKS_META: readonly {
  demoIndex: number;
  artist: string;
  album: string;
}[] = [
  { demoIndex: 0, artist: "Apollo Tape Archive", album: "Lunar Studies" },
  { demoIndex: 1, artist: "Studio Rhodes", album: "Late Night Sessions" },
  { demoIndex: 2, artist: "Analog Desk", album: "Field Recordings" },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function BatteryIndicator({
  backlight,
  level,
}: {
  backlight: boolean;
  level: number;
}) {
  const strokeColor = backlight ? "#0a3667" : "#3a3f3a";
  return (
    <div
      aria-label={`Battery ${level * 25}%`}
      className="relative flex h-[10px] w-[19px] items-center gap-[1px] rounded-[2px] p-[1px]"
      style={{ border: `1px solid ${strokeColor}` }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-full flex-1 transition-colors duration-200"
          style={{
            backgroundColor: i < level ? strokeColor : "transparent",
          }}
        />
      ))}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -right-[3px] h-[4px] w-[2px] -translate-y-1/2 rounded-r-[1px]"
        style={{ backgroundColor: strokeColor }}
      />
    </div>
  );
}

/**
 * First-Generation iPod (2001) Interactive Music Player with Click Wheel physics,
 * authentic backlit monochrome LCD, built-in synthesized Web Audio tracks,
 * and spring-interpolated 3D tiltable stainless-steel / acrylic hardware shell.
 */
export function IPodPlayer({
  theme = "classic",
  tracks: customTracks,
  textShadow = false,
  ownerName = "Rohit",
  size = "default",
  enable3dTilt = true,
  instantBoot = false,
  className,
  style,
}: IPodPlayerProps) {
  const builtInTracks = useMemo<IPodTrack[]>(
    () =>
      DEFAULT_IPOD_TRACKS_META.map((meta) => {
        const demo = CASSETTE_DEMO_TRACKS[meta.demoIndex];
        return {
          id: demo.id,
          audioSrc: getSynthesizedTrackUrl(demo),
          title: demo.trackTitle,
          artist: meta.artist,
          album: meta.album,
        };
      }),
    [],
  );

  const tracks = useMemo(
    () => (customTracks && customTracks.length > 0 ? [...customTracks] : builtInTracks),
    [customTracks, builtInTracks],
  );

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<string[]>([
    "main",
    "music",
    "allsongs",
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [backlight, setBacklight] = useState(instantBoot);
  const [backlightAutoEnabled, setBacklightAutoEnabled] = useState(instantBoot);
  const [lcdFilter, setLcdFilter] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(4);
  const [isHovered, setIsHovered] = useState(instantBoot);
  const [bootAnimationComplete, setBootAnimationComplete] = useState(instantBoot);
  const [activeTheme, setActiveTheme] = useState<IPodTheme>(theme);

  // Sync controlled theme prop
  useEffect(() => {
    setActiveTheme(theme);
  }, [theme]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const tiltStageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef(0);
  const backlightTimeoutRef = useRef<number | null>(null);
  const shouldAutoPlayRef = useRef(false);

  // 3D Tilt Physics (spring-interpolated, compositor-only, reduced-motion safe)
  const prefersReducedMotion = useReducedMotion();
  const is3dEnabled = enable3dTilt && !prefersReducedMotion;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const hoverLevel = useMotionValue(0);

  const smoothX = useSpring(pointerX, { stiffness: 205, damping: 23, mass: 0.72 });
  const smoothY = useSpring(pointerY, { stiffness: 205, damping: 23, mass: 0.72 });
  const smoothHover = useSpring(hoverLevel, { stiffness: 175, damping: 26 });

  // Sculptural +2.5deg resting tilt; rocks ±11deg on Y and ±8deg on X
  const tiltRotateX = useTransform(smoothY, [-0.5, 0.5], [10.5, -5.5]);
  const tiltRotateY = useTransform(smoothX, [-0.5, 0.5], [-11.5, 11.5]);
  const tiltLiftZ = useTransform(smoothHover, [0, 1], [0, 10]);
  const shadowOffsetX = useTransform(smoothX, [-0.5, 0.5], [16, -16]);
  const shadowOffsetY = useTransform(smoothY, [-0.5, 0.5], [10, 24]);
  const sheenX = useTransform(smoothX, [-0.5, 0.5], [12, 88]);
  const sheenY = useTransform(smoothY, [-0.5, 0.5], [8, 92]);
  const sheenOpacity = useTransform(smoothHover, [0, 1], [0.22, 0.85]);

  const isClassic = activeTheme === "classic";
  const specularSheenBg = useMotionTemplate`radial-gradient(circle at ${sheenX}% ${sheenY}%, ${
    isClassic ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.26)"
  } 0%, ${
    isClassic ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)"
  } 30%, transparent 66%)`;

  const currentTrack = tracks[currentTrackIndex] ?? tracks[0];

  const resetBacklightTimer = useCallback(() => {
    if (!backlightAutoEnabled) return;
    if (!backlight) {
      startTransition(() => setBacklight(true));
    }
    if (backlightTimeoutRef.current) {
      window.clearTimeout(backlightTimeoutRef.current);
    }
    backlightTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => setBacklight(false));
    }, 30000);
  }, [backlight, backlightAutoEnabled]);

  useEffect(() => {
    resetBacklightTimer();
    return () => {
      if (backlightTimeoutRef.current) {
        window.clearTimeout(backlightTimeoutRef.current);
      }
    };
  }, [resetBacklightTimer]);

  // Boot splash on first hover (when not instantBoot)
  useEffect(() => {
    if (isHovered && !bootAnimationComplete) {
      const timer = window.setTimeout(() => {
        startTransition(() => {
          setBootAnimationComplete(true);
          setBacklight(true);
          setBacklightAutoEnabled(true);
        });
      }, 480);
      return () => window.clearTimeout(timer);
    }
  }, [isHovered, bootAnimationComplete]);

  // Subtle battery charge pulse while playing
  useEffect(() => {
    if (!isPlaying) {
      setBatteryLevel(4);
      return;
    }
    const interval = window.setInterval(() => {
      startTransition(() => {
        setBatteryLevel((prev) => (prev >= 4 ? 1 : prev + 1));
      });
    }, 1600);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  // Sync audio playback when track index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (shouldAutoPlayRef.current) {
      shouldAutoPlayRef.current = false;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(false);
    }
  }, [currentTrackIndex, currentTrack]);

  // Cleanup audio on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  const navigateTo = useCallback((path: string[]) => {
    playTick();
    startTransition(() => {
      setCurrentMenu(path);
      setSelectedIndex(0);
    });
  }, []);

  const playTrack = useCallback((index: number) => {
    playTap();
    shouldAutoPlayRef.current = true;
    startTransition(() => {
      setCurrentTrackIndex(index);
      setCurrentMenu(["nowplaying"]);
    });
    // If clicking the already-loaded track, trigger play directly
    const audio = audioRef.current;
    if (audio && index === currentTrackIndex) {
      shouldAutoPlayRef.current = false;
      audio.currentTime = 0;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

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

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return;
    playTick();
    let nextIndex: number;
    if (shuffle && tracks.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentTrackIndex);
    } else {
      nextIndex = currentTrackIndex + 1;
      if (nextIndex >= tracks.length) {
        if (repeat === "all") {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
    }
    shouldAutoPlayRef.current = true;
    startTransition(() => setCurrentTrackIndex(nextIndex));
  }, [currentTrackIndex, tracks.length, repeat, shuffle]);

  const handlePrevious = useCallback(() => {
    if (tracks.length === 0) return;
    playTick();
    const audio = audioRef.current;
    // Classic iPod behavior: >3s in, Back restarts current track first
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let prevIndex: number;
    if (shuffle && tracks.length > 1) {
      do {
        prevIndex = Math.floor(Math.random() * tracks.length);
      } while (prevIndex === currentTrackIndex);
    } else {
      prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = repeat === "all" ? tracks.length - 1 : 0;
      }
    }
    shouldAutoPlayRef.current = true;
    startTransition(() => setCurrentTrackIndex(prevIndex));
  }, [currentTrackIndex, tracks.length, repeat, shuffle]);

  const handleShuffleSongs = useCallback(() => {
    if (tracks.length === 0) return;
    playTap();
    const randomIndex = Math.floor(Math.random() * tracks.length);
    shouldAutoPlayRef.current = true;
    startTransition(() => {
      setShuffle(true);
      setCurrentTrackIndex(randomIndex);
      setCurrentMenu(["nowplaying"]);
    });
    const audio = audioRef.current;
    if (audio && randomIndex === currentTrackIndex) {
      shouldAutoPlayRef.current = false;
      audio.currentTime = 0;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [tracks.length, currentTrackIndex]);

  const artistsList = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.artist?.trim()) set.add(t.artist.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tracks]);

  const albumsList = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.album?.trim()) set.add(t.album.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tracks]);

  const tracksByArtist = useMemo(() => {
    const grouped: Record<string, { track: IPodTrack; index: number }[]> = {};
    tracks.forEach((track, index) => {
      const key = track.artist?.trim() || "Unknown Artist";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ track, index });
    });
    return grouped;
  }, [tracks]);

  const tracksByAlbum = useMemo(() => {
    const grouped: Record<string, { track: IPodTrack; index: number }[]> = {};
    tracks.forEach((track, index) => {
      const key = track.album?.trim() || "Singles";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ track, index });
    });
    return grouped;
  }, [tracks]);

  const menuStructure = useMemo<Record<MenuKey, MenuItem[]>>(() => {
    const structure: Record<string, MenuItem[]> = {
      main: [
        {
          label: "Music",
          hasChevron: true,
          action: () => navigateTo(["main", "music"]),
        },
        {
          label: "Shuffle Songs",
          action: () => handleShuffleSongs(),
        },
        {
          label: "Settings",
          hasChevron: true,
          action: () => navigateTo(["main", "settings"]),
        },
        {
          label: `Backlight: ${backlight ? "On" : "Off"}`,
          action: () => {
            playTap();
            startTransition(() => {
              const next = !backlight;
              setBacklight(next);
              setBacklightAutoEnabled(next);
            });
          },
        },
        ...(currentTrack
          ? [
              {
                label: "Now Playing",
                hasChevron: true,
                action: () => navigateTo(["nowplaying"]),
              },
            ]
          : []),
      ],
      music: [
        {
          label: "All Songs",
          hasChevron: true,
          action: () => navigateTo(["main", "music", "allsongs"]),
        },
        {
          label: "Artists",
          hasChevron: true,
          action: () => navigateTo(["main", "music", "artists"]),
        },
        {
          label: "Albums",
          hasChevron: true,
          action: () => navigateTo(["main", "music", "albums"]),
        },
      ],
      settings: [
        {
          label: `Shuffle: ${shuffle ? "On" : "Off"}`,
          action: () => {
            playTap();
            startTransition(() => setShuffle((prev) => !prev));
          },
        },
        {
          label: `Repeat: ${
            repeat === "off" ? "Off" : repeat === "one" ? "One" : "All"
          }`,
          action: () => {
            playTap();
            startTransition(() =>
              setRepeat((prev) =>
                prev === "off" ? "one" : prev === "one" ? "all" : "off",
              ),
            );
          },
        },
        {
          label: `Backlight: ${backlight ? "On" : "Off"}`,
          action: () => {
            playTap();
            startTransition(() => {
              const next = !backlight;
              setBacklight(next);
              setBacklightAutoEnabled(next);
            });
          },
        },
        {
          label: `LCD Filter: ${lcdFilter ? "On" : "Off"}`,
          action: () => {
            playTap();
            startTransition(() => setLcdFilter((prev) => !prev));
          },
        },
        {
          label: `Finish: ${
            activeTheme === "classic"
              ? "Classic"
              : activeTheme === "u2"
                ? "U2 Red"
                : "Black"
          }`,
          action: () => {
            playTap();
            startTransition(() =>
              setActiveTheme((prev) =>
                prev === "classic"
                  ? "black"
                  : prev === "black"
                    ? "u2"
                    : "classic",
              ),
            );
          },
        },
      ],
      allsongs: tracks.map((track, idx) => ({
        label: track.title,
        action: () => playTrack(idx),
      })),
      artists: artistsList.map((artist) => ({
        label: artist,
        hasChevron: true,
        action: () =>
          navigateTo(["main", "music", "artists", `artist-${artist}`]),
      })),
      albums: albumsList.map((album) => ({
        label: album,
        hasChevron: true,
        action: () =>
          navigateTo(["main", "music", "albums", `album-${album}`]),
      })),
      nowplaying: [],
    };

    artistsList.forEach((artist) => {
      const key: MenuKey = `artist-${artist}`;
      structure[key] = (tracksByArtist[artist] || []).map(({ track, index }) => ({
        label: track.title,
        action: () => playTrack(index),
      }));
    });

    albumsList.forEach((album) => {
      const key: MenuKey = `album-${album}`;
      structure[key] = (tracksByAlbum[album] || []).map(({ track, index }) => ({
        label: track.title,
        action: () => playTrack(index),
      }));
    });

    return structure as Record<MenuKey, MenuItem[]>;
  }, [
    activeTheme,
    albumsList,
    artistsList,
    backlight,
    currentTrack,
    handleShuffleSongs,
    lcdFilter,
    navigateTo,
    playTrack,
    repeat,
    shuffle,
    tracks,
    tracksByAlbum,
    tracksByArtist,
  ]);

  const currentMenuKey = currentMenu[currentMenu.length - 1] as MenuKey;
  const currentMenuItems = menuStructure[currentMenuKey] || [];
  const isPlayingMode = currentMenuKey === "nowplaying";

  const handleCenterPress = useCallback(() => {
    if (!bootAnimationComplete) {
      setBootAnimationComplete(true);
      setBacklight(true);
      setBacklightAutoEnabled(true);
      return;
    }
    resetBacklightTimer();
    if (isPlayingMode) {
      togglePlayPause();
    } else if (currentMenuItems[selectedIndex]) {
      currentMenuItems[selectedIndex].action();
    }
  }, [
    bootAnimationComplete,
    currentMenuItems,
    isPlayingMode,
    resetBacklightTimer,
    selectedIndex,
    togglePlayPause,
  ]);

  const handleMenuPress = useCallback(() => {
    if (!bootAnimationComplete) {
      setBootAnimationComplete(true);
      setBacklight(true);
      setBacklightAutoEnabled(true);
      return;
    }
    resetBacklightTimer();
    playTick();
    if (isPlayingMode) {
      startTransition(() => {
        setCurrentMenu(["main", "music", "allsongs"]);
        setSelectedIndex(currentTrackIndex);
      });
    } else if (currentMenu.length > 1) {
      startTransition(() => {
        setCurrentMenu((prev) => prev.slice(0, -1));
        setSelectedIndex(0);
      });
    } else if (currentTrack) {
      startTransition(() => {
        setCurrentMenu(["nowplaying"]);
        setSelectedIndex(0);
      });
    }
  }, [
    bootAnimationComplete,
    currentMenu.length,
    currentTrack,
    currentTrackIndex,
    isPlayingMode,
    resetBacklightTimer,
  ]);

  const handleScrollUp = useCallback(() => {
    if (isPlayingMode) return;
    resetBacklightTimer();
    setSelectedIndex((prev) => {
      const next = Math.max(0, prev - 1);
      if (next !== prev) playTick();
      return next;
    });
  }, [isPlayingMode, resetBacklightTimer]);

  const handleScrollDown = useCallback(() => {
    if (isPlayingMode) return;
    resetBacklightTimer();
    setSelectedIndex((prev) => {
      const next = Math.min(currentMenuItems.length - 1, prev + 1);
      if (next !== prev) playTick();
      return next;
    });
  }, [currentMenuItems.length, isPlayingMode, resetBacklightTimer]);

  const handleWheelRotate = useCallback(
    (delta: number) => {
      resetBacklightTimer();
      if (isPlayingMode) {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
          return;
        }
        const seekAmount = delta > 0 ? 5 : -5;
        const nextTime = Math.max(
          0,
          Math.min(audio.duration, audio.currentTime + seekAmount),
        );
        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
        playTick();
      } else if (delta > 0) {
        handleScrollDown();
      } else {
        handleScrollUp();
      }
    },
    [handleScrollDown, handleScrollUp, isPlayingMode, resetBacklightTimer],
  );

  // Scoped keyboard support (only fires when focused inside the iPod container)
  const handleContainerKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (isPlayingMode) handlePrevious();
          else handleScrollUp();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (isPlayingMode) handleNext();
          else handleScrollDown();
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isPlayingMode) handleScrollUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isPlayingMode) handleScrollDown();
          break;
        case "Enter":
          e.preventDefault();
          handleCenterPress();
          break;
        case " ":
          if (isPlayingMode) {
            e.preventDefault();
            togglePlayPause();
          }
          break;
        case "Escape":
          e.preventDefault();
          handleMenuPress();
          break;
      }
    },
    [
      handleCenterPress,
      handleMenuPress,
      handleNext,
      handlePrevious,
      handleScrollDown,
      handleScrollUp,
      isPlayingMode,
      togglePlayPause,
    ],
  );

  // Rotational click-wheel drag handler
  const handleWheelMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !wheelRef.current) return;
      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

      let delta = angle - lastAngleRef.current;
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;

      if (Math.abs(delta) > 0.22) {
        handleWheelRotate(delta);
        lastAngleRef.current = angle;
      }
    },
    [handleWheelRotate],
  );

  const handleWheelMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Avoid starting rotary drag when clicking directly on wheel buttons
      if ((e.target as HTMLElement).closest("button")) return;
      resetBacklightTimer();
      if (!wheelRef.current) return;
      isDraggingRef.current = true;
      pointerX.set(0);
      pointerY.set(0);

      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      lastAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX);

      const onMove = (ev: MouseEvent) => handleWheelMouseMove(ev);
      const onUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [handleWheelMouseMove, pointerX, pointerY, resetBacklightTimer],
  );

  const handleMenuItemClick = useCallback(
    (index: number) => {
      resetBacklightTimer();
      startTransition(() => setSelectedIndex(index));
      if (currentMenuItems[index]) {
        currentMenuItems[index].action();
      }
    },
    [currentMenuItems, resetBacklightTimer],
  );

  // Auto-scroll highlighted menu item into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const selectedEl = scrollRef.current.children[selectedIndex] as
      | HTMLElement
      | undefined;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // Pointer-driven 3D tilt handlers
  const handleStagePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!is3dEnabled || isDraggingRef.current || e.pointerType !== "mouse") {
      return;
    }
    const stage = tiltStageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = Math.min(Math.max((e.clientX - rect.left) / rect.width - 0.5, -0.5), 0.5);
    const ny = Math.min(Math.max((e.clientY - rect.top) / rect.height - 0.5, -0.5), 0.5);
    pointerX.set(nx);
    pointerY.set(ny);
    hoverLevel.set(1);
  };

  const handleStagePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    hoverLevel.set(0);
  };

  const scaleValue = size === "medium" ? 1.18 : size === "large" ? 1.32 : 1;

  const headerTitle = isPlayingMode
    ? "Now Playing"
    : currentMenuKey === "main"
      ? "iPod"
      : currentMenuKey === "music"
        ? "Music"
        : currentMenuKey === "allsongs"
          ? "All Songs"
          : currentMenuKey === "artists"
            ? "Artists"
            : currentMenuKey === "albums"
              ? "Albums"
              : currentMenuKey.startsWith("artist-")
                ? currentMenuKey.replace("artist-", "")
                : currentMenuKey.startsWith("album-")
                  ? currentMenuKey.replace("album-", "")
                  : currentMenuKey === "settings"
                    ? "Settings"
                    : "iPod";

  const lcdInk = backlight ? "#0a3667" : "#252925";
  const lcdBg = backlight ? "#c5e0f5" : "#9ca49c";
  const lcdBorder = backlight ? "#0a3667" : "#454a45";
  const wheelGlyphColor =
    activeTheme === "classic"
      ? "#5c5c60"
      : activeTheme === "u2"
        ? "#ffffff"
        : "#d0d0d4";

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`${ownerName}'s interactive 2001 iPod music player`}
      onKeyDown={handleContainerKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      className={cn(
        "relative flex w-full flex-col items-center justify-center rounded-[24px] py-10 outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)] focus-visible:ring-offset-2",
        className,
      )}
      style={style}
    >
      {/* Hidden native audio element wired to synthesized local WAV tracks */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioSrc}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const dur = e.currentTarget.duration;
          if (Number.isFinite(dur)) setDuration(dur);
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onEnded={() => {
          if (repeat === "one" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => setIsPlaying(false));
          } else {
            handleNext();
          }
        }}
      />

      {/* 3D Perspective Stage */}
      <div
        ref={tiltStageRef}
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerLeave}
        className="flex items-center justify-center px-10 py-6 [perspective:1100px]"
        style={{
          minHeight: Math.round(340 * scaleValue + 48),
        }}
      >
        <div
          style={{
            transform: `scale(${scaleValue})`,
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            style={
              is3dEnabled
                ? {
                    rotateX: tiltRotateX,
                    rotateY: tiltRotateY,
                    z: tiltLiftZ,
                    transformStyle: "preserve-3d",
                  }
                : undefined
            }
            className="relative h-[340px] w-[204px] will-change-transform"
          >
            {/* Dynamic Desk Ambient Shadow */}
            <motion.div
              aria-hidden="true"
              style={
                is3dEnabled
                  ? {
                      x: shadowOffsetX,
                      y: shadowOffsetY,
                      z: -28,
                    }
                  : undefined
              }
              className={cn(
                "pointer-events-none absolute inset-[4%_4%_-3%_4%] rounded-[24px] blur-[22px]",
                isClassic ? "bg-black/26" : "bg-black/52",
              )}
            />

            {/* Extruded Stainless-Steel Rear Chassis (1st-gen iPod metallic backplate) */}
            <div
              aria-hidden="true"
              style={{
                background: isClassic
                  ? "linear-gradient(145deg, #c9ccd1 0%, #8e9299 52%, #b9bdc4 100%)"
                  : "linear-gradient(145deg, #52545a 0%, #1c1d20 55%, #3f4147 100%)",
                transform: "translateZ(-11px) translateY(3px)",
              }}
              className="pointer-events-none absolute inset-0 rounded-[22px] border border-black/30 shadow-md"
            />
            <div
              aria-hidden="true"
              style={{
                background: isClassic
                  ? "linear-gradient(145deg, #e2e4e8 0%, #b5b9c0 50%, #d4d7dc 100%)"
                  : "linear-gradient(145deg, #3c3e42 0%, #141517 60%, #2d2f33 100%)",
                transform: "translateZ(-5.5px) translateY(1.5px)",
              }}
              className="pointer-events-none absolute inset-0 rounded-[22px] border border-black/20"
            />

            {/* Main Acrylic iPod Front Face */}
            <div
              style={{
                background:
                  activeTheme === "classic"
                    ? "linear-gradient(155deg, #ffffff 0%, #f5f5f7 60%, #e9eaee 100%)"
                    : activeTheme === "u2"
                      ? "linear-gradient(155deg, #212124 0%, #0d0d0f 60%, #050506 100%)"
                      : "linear-gradient(155deg, #2d2d31 0%, #141417 58%, #09090b 100%)",
                boxShadow:
                  activeTheme === "classic"
                    ? "0 0 0 1px rgba(0,0,0,0.12), inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -2px 4px rgba(0,0,0,0.08)"
                    : "0 0 0 1px rgba(255,255,255,0.12), inset 0 1.5px 1px rgba(255,255,255,0.22), inset 0 -2px 5px rgba(0,0,0,0.75)",
                transform: "translateZ(0px)",
              }}
              className="relative flex h-full w-full flex-col gap-[15px] overflow-hidden rounded-[22px] p-[15px] select-none"
            >
              {/* Dynamic Specular Acrylic Reflection */}
              {is3dEnabled ? (
                <motion.div
                  aria-hidden="true"
                  style={{
                    backgroundImage: specularSheenBg,
                    opacity: sheenOpacity,
                  }}
                  className="pointer-events-none absolute inset-0 z-[20] rounded-[inherit]"
                />
              ) : null}

              {/* Classic Acrylic Top Sheen */}
              {activeTheme === "classic" && (
                <div
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.48), rgba(255,255,255,0))",
                  }}
                  className="pointer-events-none absolute inset-x-0 top-0 h-[44%] rounded-t-[22px]"
                />
              )}

              {/* Recessed Monochrome LCD Screen */}
              <div
                style={{
                  background: backlight
                    ? "linear-gradient(to bottom, #d1e8fa, #e0f0fc)"
                    : "linear-gradient(to bottom, #a0a8a0, #b8c0b8)",
                  border:
                    activeTheme === "classic"
                      ? "1px solid #8f9399"
                      : "1px solid #3a3a3f",
                }}
                className="relative h-[138px] w-full overflow-hidden rounded-[8px]"
              >
                {/* Boot Splash Overlay */}
                <div
                  style={{
                    color: lcdInk,
                    opacity: bootAnimationComplete ? 0 : 1,
                  }}
                  className="pointer-events-none absolute inset-0 z-[30] flex flex-col items-center justify-center transition-opacity duration-500"
                >
                  <span className="font-sans text-[28px] leading-none font-bold tracking-wider">
                    
                  </span>
                  <span className="mt-2 font-sans text-[11px] font-bold tracking-tight">
                    {ownerName ? `${ownerName}'s iPod` : "iPod"}
                  </span>
                </div>

                {/* Inner Recessed LCD Bezel Shadow */}
                <div
                  aria-hidden="true"
                  style={{
                    boxShadow:
                      "inset 0 1.5px 4px rgba(0,0,0,0.22), inset 0 -1px 3px rgba(0,0,0,0.08), inset 1px 0 2px rgba(0,0,0,0.08), inset -1px 0 2px rgba(0,0,0,0.08)",
                  }}
                  className="pointer-events-none absolute inset-0 z-[40] rounded-[7px]"
                />

                {/* Optional LCD Scanlines + Glass Glint */}
                {lcdFilter && (
                  <>
                    <div
                      aria-hidden="true"
                      style={{
                        background:
                          "repeating-linear-gradient(0deg, rgba(0,0,0,0.055) 0px, transparent 1px, transparent 2px)",
                      }}
                      className="pointer-events-none absolute inset-0 z-[35]"
                    />
                    <div
                      aria-hidden="true"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)",
                      }}
                      className="pointer-events-none absolute inset-x-0 top-0 z-[36] h-[30%]"
                    />
                  </>
                )}

                {/* Active LCD UI */}
                <div
                  style={{
                    color: lcdInk,
                    backgroundColor: lcdBg,
                    opacity: bootAnimationComplete ? 1 : 0,
                    pointerEvents: bootAnimationComplete ? "auto" : "none",
                  }}
                  className="flex h-full w-full flex-col overflow-hidden font-sans text-[10px] transition-[opacity,background-color,color] duration-300"
                >
                  {/* LCD Status Bar */}
                  <div
                    style={{ borderBottom: `1px solid ${lcdBorder}` }}
                    className="flex h-[20px] shrink-0 items-center justify-between px-[7px]"
                  >
                    <div className="flex w-[16px] items-center">
                      {isPlaying ? (
                        <svg width="7" height="7" viewBox="0 0 8 8" fill={lcdInk}>
                          <polygon points="0,0 8,4 0,8" />
                        </svg>
                      ) : (
                        <svg width="7" height="7" viewBox="0 0 8 8" fill={lcdInk}>
                          <rect x="0" y="0" width="2.6" height="8" />
                          <rect x="4.8" y="0" width="2.6" height="8" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 truncate text-center text-[10px] font-bold tracking-tight">
                      {headerTitle}
                    </div>
                    <div className="flex w-[22px] justify-end">
                      <BatteryIndicator backlight={backlight} level={batteryLevel} />
                    </div>
                  </div>

                  {/* LCD Body: Now Playing vs Menu List */}
                  {isPlayingMode && currentTrack ? (
                    <div className="flex flex-1 flex-col justify-between px-2 py-1.5">
                      <div className="flex items-center justify-between text-[9px] font-medium opacity-85">
                        <span className="tabular-nums">
                          {currentTrackIndex + 1} of {tracks.length}
                        </span>
                        <span className="font-mono text-[8.5px] uppercase">
                          {shuffle ? "SHF" : ""}
                          {shuffle && repeat !== "off" ? " · " : ""}
                          {repeat === "one"
                            ? "RPT 1"
                            : repeat === "all"
                              ? "RPT ALL"
                              : ""}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 text-center">
                        <div
                          style={{
                            textShadow: textShadow
                              ? "1px 1px 0 rgba(0,0,0,0.14)"
                              : "none",
                          }}
                          className="line-clamp-1 text-[12px] leading-tight font-bold tracking-tight"
                        >
                          {currentTrack.title}
                        </div>
                        <div className="line-clamp-1 text-[10px] font-medium opacity-85">
                          {currentTrack.artist || "Unknown Artist"}
                        </div>
                        {currentTrack.album && (
                          <div className="line-clamp-1 text-[9px] opacity-65">
                            {currentTrack.album}
                          </div>
                        )}
                      </div>

                      {/* Scrubber Progress Bar */}
                      <div>
                        <div
                          style={{ border: `1px solid ${lcdBorder}` }}
                          className="relative h-[8px] w-full overflow-hidden rounded-[3px]"
                        >
                          <div
                            style={{
                              width:
                                duration > 0
                                  ? `${Math.min((currentTime / duration) * 100, 100)}%`
                                  : "0%",
                              backgroundColor: lcdBorder,
                            }}
                            className="h-full transition-[width] duration-100 ease-linear"
                          />
                        </div>
                        <div className="mt-[2px] flex justify-between font-mono text-[8.5px] font-medium tabular-nums">
                          <span>{formatTime(currentTime)}</span>
                          <span>
                            -{formatTime(Math.max(0, duration - currentTime))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto overflow-x-hidden py-[1px]"
                    >
                      {currentMenuItems.map((item, idx) => {
                        const isSelected = idx === selectedIndex;
                        return (
                          <button
                            key={`${currentMenuKey}-${item.label}-${idx}`}
                            type="button"
                            onClick={() => handleMenuItemClick(idx)}
                            onMouseEnter={() => {
                              if (idx !== selectedIndex) {
                                startTransition(() => setSelectedIndex(idx));
                              }
                            }}
                            style={{
                              backgroundColor: isSelected
                                ? lcdBorder
                                : "transparent",
                              color: isSelected
                                ? backlight
                                  ? "#c5e0f5"
                                  : "#d6ded6"
                                : lcdInk,
                              textShadow: textShadow
                                ? "1px 1px 0 rgba(0,0,0,0.14)"
                                : "none",
                            }}
                            className="flex w-full cursor-pointer items-center justify-between px-2 py-[3.5px] text-left text-[11px] leading-tight font-semibold"
                          >
                            <span className="truncate">{item.label}</span>
                            {item.hasChevron && (
                              <span
                                aria-hidden="true"
                                className="ml-1 shrink-0 text-[10px] font-bold"
                              >
                                ›
                              </span>
                            )}
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
                onMouseDown={handleWheelMouseDown}
                style={{
                  background:
                    activeTheme === "classic"
                      ? "linear-gradient(145deg, #ebebef, #d2d4d9)"
                      : activeTheme === "u2"
                        ? "linear-gradient(145deg, #d1223e, #8f0c20)"
                        : "linear-gradient(145deg, #3c3c42, #1b1b1f)",
                  boxShadow:
                    activeTheme === "classic"
                      ? "inset 0 0 0 1px rgba(255,255,255,0.6), inset 0 2px 5px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.12)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 2px 5px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.28)",
                }}
                className="relative z-[10] flex aspect-square h-[156px] w-[156px] cursor-grab items-center justify-center self-center rounded-full active:cursor-grabbing"
              >
                {/* Brushed Conic Ring Sheen */}
                <div
                  aria-hidden="true"
                  style={{
                    background: `conic-gradient(from 0deg, ${
                      activeTheme === "classic"
                        ? "rgba(255,255,255,0.36)"
                        : "rgba(255,255,255,0.12)"
                    } 0deg, transparent 90deg, ${
                      activeTheme === "classic"
                        ? "rgba(0,0,0,0.08)"
                        : "rgba(0,0,0,0.32)"
                    } 180deg, transparent 270deg, ${
                      activeTheme === "classic"
                        ? "rgba(255,255,255,0.36)"
                        : "rgba(255,255,255,0.12)"
                    } 360deg)`,
                  }}
                  className="pointer-events-none absolute inset-0 rounded-full"
                />

                {/* Top: MENU */}
                <button
                  type="button"
                  aria-label="Menu"
                  onClick={handleMenuPress}
                  className="absolute top-[11px] left-1/2 flex h-[24px] -translate-x-1/2 cursor-pointer items-center justify-center px-2 transition-transform duration-100 active:scale-[0.94]"
                >
                  <span
                    style={{ color: wheelGlyphColor }}
                    className="font-sans text-[9.5px] font-bold tracking-[0.06em]"
                  >
                    MENU
                  </span>
                </button>

                {/* Right: Next / Scroll Down */}
                <button
                  type="button"
                  aria-label={isPlayingMode ? "Next track" : "Scroll down"}
                  onClick={isPlayingMode ? handleNext : handleScrollDown}
                  className="absolute top-1/2 right-[11px] flex h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center transition-transform duration-100 active:scale-[0.92]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill={wheelGlyphColor}
                    aria-hidden="true"
                  >
                    <polygon points="0,2 6,8 0,14" />
                    <polygon points="6,2 12,8 6,14" />
                    <rect x="13" y="2" width="2" height="12" />
                  </svg>
                </button>

                {/* Bottom: Play / Pause */}
                <button
                  type="button"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  onClick={() => {
                    resetBacklightTimer();
                    if (!isPlayingMode && currentTrack) {
                      playTrack(currentTrackIndex);
                    } else {
                      togglePlayPause();
                    }
                  }}
                  className="absolute bottom-[11px] left-1/2 flex h-[26px] w-[32px] -translate-x-1/2 cursor-pointer items-center justify-center transition-transform duration-100 active:scale-[0.92]"
                >
                  <svg
                    width="15"
                    height="11"
                    viewBox="0 0 20 14"
                    fill={wheelGlyphColor}
                    aria-hidden="true"
                  >
                    <polygon points="1,1 9,7 1,13" />
                    <rect x="11.5" y="1.5" width="2.6" height="11" />
                    <rect x="16" y="1.5" width="2.6" height="11" />
                  </svg>
                </button>

                {/* Left: Previous / Scroll Up */}
                <button
                  type="button"
                  aria-label={isPlayingMode ? "Previous track" : "Scroll up"}
                  onClick={isPlayingMode ? handlePrevious : handleScrollUp}
                  className="absolute top-1/2 left-[11px] flex h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center transition-transform duration-100 active:scale-[0.92]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill={wheelGlyphColor}
                    aria-hidden="true"
                  >
                    <rect x="1" y="2" width="2" height="12" />
                    <polygon points="10,2 4,8 10,14" />
                    <polygon points="16,2 10,8 16,14" />
                  </svg>
                </button>

                {/* Center Select Button */}
                <button
                  type="button"
                  aria-label={isPlayingMode ? "Play or Pause" : "Select menu item"}
                  onClick={handleCenterPress}
                  style={{
                    background:
                      activeTheme === "classic"
                        ? "linear-gradient(145deg, #ffffff, #ededf0)"
                        : activeTheme === "u2"
                          ? "linear-gradient(145deg, #27272a, #0c0c0e)"
                          : "linear-gradient(145deg, #4b4b52, #252529)",
                    boxShadow:
                      activeTheme === "classic"
                        ? "0 0 0 1px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.9)"
                        : "0 0 0 1px rgba(255,255,255,0.12), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                  className="relative h-[54px] w-[54px] cursor-pointer rounded-full transition-transform duration-150 ease-out active:scale-[0.94]"
                >
                  <span
                    aria-hidden="true"
                    style={{
                      background:
                        activeTheme === "classic"
                          ? "linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)"
                          : "linear-gradient(to bottom, rgba(255,255,255,0.16), transparent)",
                    }}
                    className="pointer-events-none absolute inset-x-[10%] top-[10%] h-[40%] rounded-full"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default IPodPlayer;
