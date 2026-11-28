import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CaseStudyProject } from '../data/projects';
import { renderCaseStudyCardTexture } from '../utils/caseStudyCardTexture';
import { startCaseStudyTransition } from '../utils/caseStudyTransition';
import { prefersReducedMotion } from '../utils/scroll';
import { playTap, playTick } from '../utils/soundEngine';
import FlexCarousel, {
  type FlexCarouselFocusRect,
  type FlexCarouselItem,
} from './FlexCarousel';
import { HomeLiquidLensDeck } from './HomeLiquidLensDeck';
import { ProjectCard } from './ProjectCard';

type RailVariant = 'v2' | 'v1';

interface FeaturedWorkRailProps {
  projects: readonly CaseStudyProject[];
  totalCount: number;
  onNavigate: (path: string) => void;
}

/**
 * Exact calibrated FlexCarousel (v1) configuration retained for A/B comparison.
 */
const HOME_FLEX_CAROUSEL_CONFIG = {
  preset: 'arch',
  intro: 'bloom',
  gap: 24,
  radius: 22,
  fit: 'natural',
  lensWidth: 0.95,
  lensHeight: 0.82,
  tilt: 0,
  roundness: 0.45,
  bend: 0.02,
  reach: 0.22,
  curl: 'rise',
  dispersion: 0.8,
  liquid: 0.12,
  squeeze: 0.08,
  followCursor: false,
  focusOnClick: true,
  autoplay: true,
  interval: 4,
  captions: false,
  captureWheel: false,
} as const;

function getResponsiveCardHeight(viewportWidth: number): number {
  if (viewportWidth >= 640) {
    return 0.78;
  }
  return 0.76;
}

function supportsWebGL2(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

let caseStudyPrefetched = false;
function prefetchCaseStudyPage() {
  if (caseStudyPrefetched) return;
  caseStudyPrefetched = true;
  void import('../pages/CaseStudyPage');
}

const V2_TEXTURE_CACHE: Record<string, string> = {};
const V1_TEXTURE_CACHE: Record<string, string> = {};

function hasAllCached(
  projects: readonly CaseStudyProject[],
  cache: Record<string, string>,
): boolean {
  return projects.length > 0 && projects.every((p) => Boolean(cache[p.slug]));
}

/**
 * Homepage Featured Work showcase.
 * Defaults to v2 (Liquid Lens) with a whisper-quiet icon toggle to switch
 * directly between v2 (Liquid Lens) and v1 (FlexCarousel) on the homepage.
 */
export function FeaturedWorkRail({
  projects,
  onNavigate,
}: FeaturedWorkRailProps) {
  const [variant, setVariant] = useState<RailVariant>('v2');
  const [v2TextureMap, setV2TextureMap] = useState<Record<string, string>>(() => ({
    ...V2_TEXTURE_CACHE,
  }));
  const [v1TextureMap, setV1TextureMap] = useState<Record<string, string>>(() => ({
    ...V1_TEXTURE_CACHE,
  }));
  const [hasWebGL2] = useState<boolean>(() => supportsWebGL2());
  const [cardHeight, setCardHeight] = useState<number>(() =>
    getResponsiveCardHeight(
      typeof window !== 'undefined' ? window.innerWidth : 1440,
    ),
  );
  const navigatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const next = getResponsiveCardHeight(window.innerWidth);
      setCardHeight((prev) => (prev === next ? prev : next));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bake and persistently cache trimmed 16:9 widescreen textures for v2 first
  // so initial load is 2x faster and returning to Home is instant with zero pop.
  useEffect(() => {
    if (!hasWebGL2 || projects.length === 0) return;
    if (hasAllCached(projects, V2_TEXTURE_CACHE)) {
      setV2TextureMap({ ...V2_TEXTURE_CACHE });
      return;
    }

    let cancelled = false;

    Promise.all(
      projects.map(async (project) => {
        if (V2_TEXTURE_CACHE[project.slug]) {
          return [project.slug, V2_TEXTURE_CACHE[project.slug]] as const;
        }
        const v2Url = await renderCaseStudyCardTexture(project, 'widescreen', {
          trimParallaxBleed: true,
        });
        V2_TEXTURE_CACHE[project.slug] = v2Url;
        return [project.slug, v2Url] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      const nextV2: Record<string, string> = { ...V2_TEXTURE_CACHE };
      entries.forEach(([slug, v2Url]) => {
        nextV2[slug] = v2Url;
      });
      setV2TextureMap(nextV2);
    });

    return () => {
      cancelled = true;
    };
  }, [projects, hasWebGL2]);

  // Bake untrimmed v1 textures only when v1 is selected
  useEffect(() => {
    if (!hasWebGL2 || projects.length === 0 || variant !== 'v1') return;
    if (hasAllCached(projects, V1_TEXTURE_CACHE)) {
      setV1TextureMap({ ...V1_TEXTURE_CACHE });
      return;
    }

    let cancelled = false;

    Promise.all(
      projects.map(async (project) => {
        if (V1_TEXTURE_CACHE[project.slug]) {
          return [project.slug, V1_TEXTURE_CACHE[project.slug]] as const;
        }
        const v1Url = await renderCaseStudyCardTexture(project, 'widescreen', {
          trimParallaxBleed: false,
        });
        V1_TEXTURE_CACHE[project.slug] = v1Url;
        return [project.slug, v1Url] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      const nextV1: Record<string, string> = { ...V1_TEXTURE_CACHE };
      entries.forEach(([slug, v1Url]) => {
        nextV1[slug] = v1Url;
      });
      setV1TextureMap(nextV1);
    });

    return () => {
      cancelled = true;
    };
  }, [projects, hasWebGL2, variant]);

  const v2TexturesReady = useMemo(
    () =>
      projects.length > 0 &&
      projects.every((project) => Boolean(v2TextureMap[project.slug])),
    [projects, v2TextureMap],
  );

  const carouselItems: FlexCarouselItem[] = useMemo(
    () =>
      projects.map((project) => ({
        src: v1TextureMap[project.slug] ?? project.coverImage,
        alt: project.coverAlt,
        title: project.title,
        subtitle: `${project.industry} · ${project.year}`,
      })),
    [projects, v1TextureMap],
  );

  const handleCardSelect = useCallback(
    (index: number) => {
      const project = projects[index];
      if (!project || navigatingRef.current) return;

      playTap();
      prefetchCaseStudyPage();

      if (prefersReducedMotion()) {
        navigatingRef.current = true;
        onNavigate(`/work/${project.slug}`);
      }
    },
    [projects, onNavigate],
  );

  const handleCardFocusReady = useCallback(
    (index: number, item: FlexCarouselItem, rect: FlexCarouselFocusRect) => {
      const project = projects[index];
      if (!project || navigatingRef.current) return;

      navigatingRef.current = true;
      prefetchCaseStudyPage();

      if (prefersReducedMotion()) {
        onNavigate(`/work/${project.slug}`);
        return;
      }

      startCaseStudyTransition({
        slug: project.slug,
        imageSrc:
          v2TextureMap[project.slug] ||
          item?.src ||
          v1TextureMap[project.slug] ||
          project.coverImage,
        title: project.title,
        rect,
        borderRadius: HOME_FLEX_CAROUSEL_CONFIG.radius,
        onNavigateNow: () => {
          onNavigate(`/work/${project.slug}`);
        },
      });
    },
    [projects, v1TextureMap, v2TextureMap, onNavigate],
  );

  const handleVariantChange = useCallback((next: RailVariant) => {
    setVariant((prev) => {
      if (prev === next) return prev;
      playTick();
      return next;
    });
  }, []);

  if (!hasWebGL2) {
    return (
      <section
        id="selected-work"
        aria-label="Selected work"
        className="scroll-mt-[var(--scroll-offset-header)] bg-transparent py-8 sm:py-12"
      >
        <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-6 px-5 sm:px-8 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              onNavigate={onNavigate}
              variant="standard"
              index={index}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="selected-work"
      aria-label="Selected work"
      onPointerEnter={prefetchCaseStudyPage}
      className="scroll-mt-[var(--scroll-offset-header)] overflow-x-clip bg-transparent pb-10 pt-2 sm:pb-14 sm:pt-4"
    >
      {variant === 'v2' ? (
        <HomeLiquidLensDeck
          projects={projects}
          styledTextureMap={v2TextureMap}
          texturesReady={v2TexturesReady}
          onNavigate={onNavigate}
          onPrefetchCaseStudy={prefetchCaseStudyPage}
        />
      ) : (
        <div className="relative h-[290px] w-full sm:h-[480px] lg:h-[640px] xl:h-[760px]">
          <FlexCarousel
            className="featured-work-carousel"
            items={carouselItems}
            preset={HOME_FLEX_CAROUSEL_CONFIG.preset}
            intro={HOME_FLEX_CAROUSEL_CONFIG.intro}
            cardHeight={cardHeight}
            gap={HOME_FLEX_CAROUSEL_CONFIG.gap}
            radius={HOME_FLEX_CAROUSEL_CONFIG.radius}
            fit={HOME_FLEX_CAROUSEL_CONFIG.fit}
            lensWidth={HOME_FLEX_CAROUSEL_CONFIG.lensWidth}
            lensHeight={HOME_FLEX_CAROUSEL_CONFIG.lensHeight}
            tilt={HOME_FLEX_CAROUSEL_CONFIG.tilt}
            roundness={HOME_FLEX_CAROUSEL_CONFIG.roundness}
            bend={HOME_FLEX_CAROUSEL_CONFIG.bend}
            reach={HOME_FLEX_CAROUSEL_CONFIG.reach}
            curl={HOME_FLEX_CAROUSEL_CONFIG.curl}
            dispersion={HOME_FLEX_CAROUSEL_CONFIG.dispersion}
            liquid={HOME_FLEX_CAROUSEL_CONFIG.liquid}
            squeeze={HOME_FLEX_CAROUSEL_CONFIG.squeeze}
            followCursor={HOME_FLEX_CAROUSEL_CONFIG.followCursor}
            focusOnClick={HOME_FLEX_CAROUSEL_CONFIG.focusOnClick}
            autoplay={HOME_FLEX_CAROUSEL_CONFIG.autoplay}
            interval={HOME_FLEX_CAROUSEL_CONFIG.interval}
            captions={HOME_FLEX_CAROUSEL_CONFIG.captions}
            captureWheel={HOME_FLEX_CAROUSEL_CONFIG.captureWheel}
            onSelect={handleCardSelect}
            onFocusReady={handleCardFocusReady}
          />
        </div>
      )}

      {/* Subtle, label-free switcher tucked close beneath the right edge of the cards */}
      <div
        className={`relative z-20 mx-auto flex max-w-[1160px] justify-end px-5 sm:px-8 ${
          variant === 'v2'
            ? '-mt-1'
            : '-mt-2 sm:-mt-8 lg:-mt-11 xl:-mt-14'
        }`}
      >
        <div
          role="radiogroup"
          aria-label="Showcase effect variant"
          className="inline-flex items-center gap-0.5 rounded-full border border-[var(--apple-separator-subtle)] bg-[var(--apple-bg-secondary)]/75 p-[2.5px] opacity-45 transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100"
        >
          <button
            type="button"
            role="radio"
            aria-checked={variant === 'v2'}
            aria-label="Liquid Lens showcase (v2)"
            title="Liquid Lens (v2)"
            onClick={() => handleVariantChange('v2')}
            className={`flex h-[18px] w-[24px] cursor-pointer items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] ${
              variant === 'v2'
                ? 'bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                : 'text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-secondary)]'
            }`}
          >
            <svg
              width="12"
              height="9"
              viewBox="0 0 12 9"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="1.25"
                y1="1.5"
                x2="1.25"
                y2="7.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.55"
              />
              <rect
                x="3.4"
                y="1.6"
                width="5.2"
                height="5.8"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <line
                x1="10.75"
                y1="1.5"
                x2="10.75"
                y2="7.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={variant === 'v1'}
            aria-label="Flex Carousel showcase (v1)"
            title="Flex Carousel (v1)"
            onClick={() => handleVariantChange('v1')}
            className={`flex h-[18px] w-[24px] cursor-pointer items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-focus-ring)] ${
              variant === 'v1'
                ? 'bg-[var(--apple-surface-elevated)] text-[var(--apple-label-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                : 'text-[var(--apple-label-tertiary)] hover:text-[var(--apple-label-secondary)]'
            }`}
          >
            <svg
              width="12"
              height="9"
              viewBox="0 0 12 9"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1.25 6.8C1.25 4.2 3.1 2.2 6 2.2C8.9 2.2 10.75 4.2 10.75 6.8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="6" cy="5.8" r="1.15" fill="currentColor" opacity="0.7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
