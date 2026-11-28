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
