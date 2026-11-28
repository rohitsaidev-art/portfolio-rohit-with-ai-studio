import { useCallback, useEffect, useMemo, useState } from 'react';
import { InteractiveBook } from '../book/InteractiveBook';
import {
  DEFAULT_BOOK_CUSTOMIZATION,
  generatePlaceholderBookAssets,
  type BookCustomizationConfig,
  type GeneratedBookAssets,
} from '../book/placeholderAssets';
import { SITE_CONFIG } from '../data/site';
import { playSuccessChime } from '../utils/soundEngine';

export interface AboutJournalBookProps {
  collapsedWidth?: number;
  collapsedHeight?: number;
  caption?: string;
  customization?: Partial<BookCustomizationConfig>;
}

export function AboutJournalBook({
  collapsedWidth,
  collapsedHeight,
  caption = 'Field journal · Click to open & flip pages',
  customization,
}: AboutJournalBookProps) {
  const [assets, setAssets] = useState<GeneratedBookAssets | null>(null);

  const mergedConfig = useMemo<BookCustomizationConfig>(() => {
    const firstName = SITE_CONFIG.name.split(' ')[0] || 'Aarav';
    return {
      ...DEFAULT_BOOK_CUSTOMIZATION,
      stickerName: firstName,
      backImprint: `${SITE_CONFIG.name.toUpperCase()} · FIELD JOURNAL`,
      ...customization,
    };
  }, [customization]);

  const resolvedWidth = collapsedWidth ?? mergedConfig.collapsedWidth ?? 260;
  const resolvedHeight =
    collapsedHeight ?? Math.round(resolvedWidth * (4 / 3));

  const configSignature = useMemo(
    () => JSON.stringify(mergedConfig),
    [mergedConfig],
  );

  useEffect(() => {
    let active = true;
    let built = false;

    const buildAssets = () => {
      if (!active || built) return;
      built = true;
      const githubHref =
        SITE_CONFIG.socials.find((s) =>
          s.label.toLowerCase().includes('github'),
        )?.href ?? 'https://github.com';
      setAssets(
        generatePlaceholderBookAssets({
          ...mergedConfig,
          email: SITE_CONFIG.email,
          githubHref,
        }),
      );
    };

    const fontsApi = typeof document !== 'undefined' ? document.fonts : null;
    if (!fontsApi) {
      buildAssets();
      return () => {
        active = false;
      };
    }

    const fallbackTimer = window.setTimeout(buildAssets, 450);
    Promise.allSettled([
      fontsApi.load('400 48px "Gochi Hand"'),
      fontsApi.load('400 48px "Newsreader"'),
      fontsApi.ready,
    ]).then(() => {
      window.clearTimeout(fallbackTimer);
      buildAssets();
    });

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
    };
  }, [configSignature, mergedConfig]);

  const handleEmailCopied = useCallback(() => {
    playSuccessChime();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center print:hidden">
      <div
        className="relative flex items-center justify-center"
        style={{
          minWidth: resolvedWidth + 48,
          minHeight: resolvedHeight + 40,
        }}
      >
        {assets ? (
          <InteractiveBook
            collapsedWidth={resolvedWidth}
            collapsedHeight={resolvedHeight}
            sidesSpread={assets.sidesSpread}
            sidesSingle={assets.sidesSingle}
            backCover={assets.backCover}
            coverBare={assets.coverBare}
            coverSticker={assets.coverSticker}
            hotspots={assets.hotspots}
            pageWidth={assets.pageWidth}
            pageHeight={assets.pageHeight}
            glossAlpha={assets.glossAlpha}
            emailToCopy={SITE_CONFIG.email}
            stickerAlt={`Hello, my name is ${mergedConfig.stickerName}`}
            onEmailCopied={handleEmailCopied}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{ width: resolvedWidth, height: resolvedHeight }}
          />
        )}
      </div>

      {caption && (
        <p className="type-caption mt-3 text-center font-normal text-[var(--apple-label-tertiary)]">
          {caption}
        </p>
      )}
    </div>
  );
}
