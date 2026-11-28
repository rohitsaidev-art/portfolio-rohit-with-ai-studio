import type { CSSProperties } from 'react';

export interface FlexCarouselItem {
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
}

export type FlexCarouselPreset = 'liquid' | 'ribbon' | 'vortex' | 'arch';
export type FlexCarouselIntro = 'rise' | 'bloom' | 'spin' | 'deal' | 'fade';
export type FlexCarouselFit = 'natural' | 'portrait' | 'square' | 'landscape';
export type FlexCarouselCurl = 'twist' | 'rise';

export interface FlexCarouselFocusRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FlexCarouselProps {
  items?: FlexCarouselItem[];
  preset?: FlexCarouselPreset;
  intro?: FlexCarouselIntro;
  cardHeight?: number;
  gap?: number;
  radius?: number;
  fit?: FlexCarouselFit;
  lensWidth?: number;
  lensHeight?: number;
  tilt?: number;
  roundness?: number;
  bend?: number;
  reach?: number;
  curl?: FlexCarouselCurl;
  dispersion?: number;
  liquid?: number;
  followCursor?: boolean;
  squeeze?: number;
  focusOnClick?: boolean;
  autoplay?: boolean;
  interval?: number;
  captions?: boolean;
  captureWheel?: boolean;
  onChange?: (index: number, item: FlexCarouselItem) => void;
  onSelect?: (index: number, item: FlexCarouselItem) => void;
  onFocusReady?: (
    index: number,
    item: FlexCarouselItem,
    rect: FlexCarouselFocusRect,
  ) => void;
  className?: string;
  style?: CSSProperties;
}

declare const FlexCarousel: (props: FlexCarouselProps) => JSX.Element;

export default FlexCarousel;
