import type { CaseStudyProject } from '../data/projects';

export type CardTextureAspect = 'widescreen' | 'landscape' | 'square' | 'portrait';

// Match FlexCarousel's exact FIT_ASPECT ratios (plus 16:9 widescreen for natural full-size homepage cards)
// so cardFragment performs zero unexpected aspect-ratio cropping.
const DIMENSIONS: Record<CardTextureAspect, { width: number; height: number }> = {
  widescreen: { width: 1920, height: 1080 },
  landscape: { width: 1440, height: 1080 },
  square: { width: 1200, height: 1200 },
  portrait: { width: 1020, height: 1360 },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      let trimmed = last;
      while (trimmed.length > 3 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[maxLines - 1] = `${trimmed}…`;
    }
  }
  return lines;
}

function measureTrackedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  trackingPx: number,
): number {
  if (!trackingPx || text.length <= 1) {
    return ctx.measureText(text).width;
  }
  return ctx.measureText(text).width + trackingPx * (text.length - 1);
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackingPx: number,
) {
  if (!trackingPx || text.length <= 1) {
    ctx.fillText(text, x, y);
    return;
  }
  let cursorX = x;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    ctx.fillText(ch, cursorX, y);
    cursorX += ctx.measureText(ch).width + trackingPx;
  }
}

function wrapTrackedTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  trackingPx = 0,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measureTrackedWidth(ctx, candidate, trackingPx) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (measureTrackedWidth(ctx, last, trackingPx) > maxWidth) {
      let trimmed = last;
      while (
        trimmed.length > 3 &&
        measureTrackedWidth(ctx, `${trimmed}…`, trackingPx) > maxWidth
      ) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[maxLines - 1] = `${trimmed}…`;
    }
  }
  return lines;
}

export interface CardTextureOptions {
  /**
   * Mirrors FlexCarousel's 1.08x shader parallax crop directly onto the output
   * canvas so non-zooming card renderers (such as Liquid Lens v2) display the
   * exact same internal framing, typography scale, and edge margins as v1.
   */
  trimParallaxBleed?: boolean;
}

/**
 * Renders an ultra-legible, high-DPI Case Study Card texture calibrated specifically
 * for FlexCarousel and Liquid Lens (accounting for the 1.08x parallax bleed with
 * Apple-editorial visual hierarchy: commanding display headline, light-weight byline,
 * whisper-quiet metadata chips, and a generous frosted-glass testimonial pull-quote card).
 */
export async function renderCaseStudyCardTexture(
  project: CaseStudyProject,
  aspect: CardTextureAspect = 'landscape',
  options?: CardTextureOptions,
): Promise<string> {
  const { width, height } = DIMENSIONS[aspect];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return project.coverImage;

  ctx.fillStyle = '#141416';
  ctx.fillRect(0, 0, width, height);

  if (options?.trimParallaxBleed) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(1.08, 1.08);
    ctx.translate(-width / 2, -height / 2);
  }

  // 1. Cover artwork (object-cover crop)
  try {
    const img = await loadImage(project.coverImage);
    const imgRatio = img.naturalWidth / Math.max(img.naturalHeight, 1);
    const boxRatio = width / height;
    let drawW = width;
    let drawH = height;
    let drawX = 0;
    let drawY = 0;

    if (imgRatio > boxRatio) {
      drawH = height;
      drawW = height * imgRatio;
      drawX = (width - drawW) / 2;
    } else {
      drawW = width;
      drawH = width / imgRatio;
      drawY = (height - drawH) / 2;
    }
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } catch {
    // Keep neutral dark canvas if image fails
  }

  // 2. Calibrated atmospheric gradient scrim ensuring luminous top art + crisp bottom legibility
  const topVignette = ctx.createLinearGradient(0, 0, 0, height * 0.22);
  topVignette.addColorStop(0, 'rgba(10, 10, 12, 0.24)');
  topVignette.addColorStop(1, 'rgba(10, 10, 12, 0)');
  ctx.fillStyle = topVignette;
  ctx.fillRect(0, 0, width, height * 0.22);

  const bottomScrim = ctx.createLinearGradient(0, height * 0.26, 0, height);
  bottomScrim.addColorStop(0, 'rgba(10, 10, 12, 0)');
  bottomScrim.addColorStop(0.34, 'rgba(10, 10, 12, 0.30)');
  bottomScrim.addColorStop(0.68, 'rgba(10, 10, 12, 0.76)');
  bottomScrim.addColorStop(1, 'rgba(10, 10, 12, 0.92)');
  ctx.fillStyle = bottomScrim;
  ctx.fillRect(0, height * 0.26, width, height * 0.74);

  const isWidescreen = aspect === 'widescreen';

  // Generous safe insets so 1.08x parallax bleed (~4% per side) never clips content
  const safeX = Math.round(width * (isWidescreen ? 0.075 : 0.088));
  const safeTop = Math.round(height * 0.085);
  const safeBottom = Math.round(height * 0.09);

  // Larger, roomier right-hand testimonial container on widescreen
  const quoteCardW = isWidescreen ? 680 : 0;
  const columnGap = isWidescreen ? 68 : 0;
  const contentMaxW = isWidescreen
    ? width - safeX * 2 - quoteCardW - columnGap
    : width - safeX * 2;

  // 3. Top-left subtle metadata pill on non-widescreen cards
  if (!isWidescreen) {
    const metaLabel = `${project.platform}  ·  ${project.year}`;
    ctx.font =
      '500 21px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif';
    const metaTextW = ctx.measureText(metaLabel).width;
    const metaPadX = 20;
    const metaH = 42;
    drawRoundedRect(ctx, safeX, safeTop, metaTextW + metaPadX * 2, metaH, metaH / 2);
    ctx.fillStyle = 'rgba(12, 12, 14, 0.44)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.80)';
    ctx.textBaseline = 'middle';
    ctx.fillText(metaLabel, safeX + metaPadX, safeTop + metaH / 2 + 1);
  }

  // 4. Whisper-quiet subordinate metadata chips (slim height, subtle glass fill, delicate hairline)
  const pillItems = [project.industry, ...project.tags.slice(0, isWidescreen ? 2 : 1)];
  ctx.font =
    '400 18px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif';
  const pillHeight = 36;
  const pillPadX = 17;
  const pillGap = 10;
  const pillsY = height - safeBottom - pillHeight;
  let pillX = safeX;
  const maxPillsRight = safeX + contentMaxW;

  for (const label of pillItems) {
    const textW = ctx.measureText(label).width;
    const pillW = textW + pillPadX * 2;
    if (pillX + pillW > maxPillsRight && pillX > safeX) break;

    drawRoundedRect(ctx, pillX, pillsY, pillW, pillHeight, pillHeight / 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, pillX + pillPadX, pillsY + pillHeight / 2 + 0.5);
    pillX += pillW + pillGap;
  }

  // 5. Light-weight airy editorial byline directly above chips
  const summaryFontSize = isWidescreen ? 32 : aspect === 'landscape' ? 32 : 30;
  ctx.font = `300 ${summaryFontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
  ctx.textBaseline = 'alphabetic';
  const summaryLines = wrapTextLines(ctx, project.cardSummary, contentMaxW, 2);
  const summaryLineH = Math.round(summaryFontSize * 1.34);
  const summaryStartY = pillsY - 34 - (summaryLines.length - 1) * summaryLineH;
  summaryLines.forEach((line, idx) => {
    ctx.fillText(line, safeX, summaryStartY + idx * summaryLineH);
  });

  // 6. Larger, commanding Apple Display Headline above byline with tight optical tracking
  const baseTitleSize = isWidescreen ? 98 : aspect === 'landscape' ? 84 : 74;
  ctx.font = `600 ${baseTitleSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif`;
  const fitsSingleLine =
    measureTrackedWidth(ctx, project.title, -2.6) <= contentMaxW;
  const titleFontSize = fitsSingleLine
    ? baseTitleSize
    : isWidescreen
      ? 84
      : baseTitleSize - 10;
  const titleTracking = fitsSingleLine ? -2.6 : -2.1;
  ctx.font = `600 ${titleFontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif`;
  ctx.fillStyle = '#ffffff';

  const titleLines = wrapTrackedTextLines(
    ctx,
    project.title,
    contentMaxW,
    2,
    titleTracking,
  );
  const titleLineH = Math.round(titleFontSize * 1.04);
  const titleStartY =
    summaryStartY - 38 - (titleLines.length - 1) * titleLineH;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 3;
  titleLines.forEach((line, idx) => {
    drawTrackedText(ctx, line, safeX, titleStartY + idx * titleLineH, titleTracking);
  });
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 7. Widescreen bottom-right polished Apple frosted-glass Testimonial Pull-Quote panel
  if (isWidescreen) {
    const testimonial = project.cardTestimonial ?? {
      quote: project.challenge.highlightStatement,
      authorName: project.title,
      designation: `${project.platform} · ${project.year}`,
      avatarInitials: project.title.slice(0, 2).toUpperCase(),
      avatarPalette: ['#52525b', '#27272a'] as const,
    };

    const padX = 44;
    const padTop = 38;
    const padBottom = 36;
    const cardX = width - safeX - quoteCardW;
    const quoteMaxW = quoteCardW - padX * 2;

    const quoteFontSize = 26;
    const quoteLineH = 38;
    ctx.font = `400 ${quoteFontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif`;
    const quoteLines = wrapTextLines(
      ctx,
      `“${testimonial.quote}”`,
      quoteMaxW,
      4,
    );

    const quoteMarkZoneH = 26;
    const quoteBlockH = quoteLines.length * quoteLineH;
    const dividerGapTop = 24;
    const dividerGapBottom = 22;
    const authorRowH = 48;

    const cardH =
      padTop +
      quoteMarkZoneH +
      quoteBlockH +
      dividerGapTop +
      1 +
      dividerGapBottom +
      authorRowH +
      padBottom;
    const cardY = height - safeBottom - cardH;

    // Frosted dark glass vertical gradient fill
    drawRoundedRect(ctx, cardX, cardY, quoteCardW, cardH, 30);
    const glassGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    glassGrad.addColorStop(0, 'rgba(22, 22, 26, 0.72)');
    glassGrad.addColorStop(1, 'rgba(12, 12, 15, 0.84)');
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // Crisp hairline border
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.stroke();

    // Delicate top glass specular edge sheen
    const topSheen = ctx.createLinearGradient(
      cardX + 36,
      cardY + 1.5,
      cardX + quoteCardW - 36,
      cardY + 1.5,
    );
    topSheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
    topSheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.20)');
    topSheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = topSheen;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 36, cardY + 1.5);
    ctx.lineTo(cardX + quoteCardW - 36, cardY + 1.5);
    ctx.stroke();

    // Subtle editorial serif opening quote emblem
    ctx.font = '400 54px "Newsreader", Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('“', cardX + padX - 4, cardY + padTop + 26);

    // Testimonial pull-quote body
    ctx.font = `400 ${quoteFontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    const firstQuoteBaseline = cardY + padTop + quoteMarkZoneH + 24;
    quoteLines.forEach((line, idx) => {
      ctx.fillText(line, cardX + padX, firstQuoteBaseline + idx * quoteLineH);
    });

    // Subtle hairline separator between quote and author attribution
    const dividerY =
      cardY + padTop + quoteMarkZoneH + quoteBlockH + dividerGapTop;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.11)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + padX, dividerY);
    ctx.lineTo(cardX + quoteCardW - padX, dividerY);
    ctx.stroke();

    // Attribution row: small avatar circle + author name + designation
    const authorTopY = dividerY + 1 + dividerGapBottom;
    const avatarDiameter = 46;
    const avatarRadius = avatarDiameter / 2;
    const avatarCx = cardX + padX + avatarRadius;
    const avatarCy = authorTopY + authorRowH / 2;

    // Soft editorial avatar circle with subtle light-source gradient & hairline ring
    const avatarGrad = ctx.createRadialGradient(
      avatarCx - avatarRadius * 0.35,
      avatarCy - avatarRadius * 0.35,
      2,
      avatarCx,
      avatarCy,
      avatarRadius * 1.15,
    );
    avatarGrad.addColorStop(0, testimonial.avatarPalette[0]);
    avatarGrad.addColorStop(1, testimonial.avatarPalette[1]);

    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarRadius, 0, Math.PI * 2);
    ctx.fillStyle = avatarGrad;
    ctx.fill();
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.stroke();

    // Crisp centered initials inside avatar circle
    ctx.font =
      '600 17px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(testimonial.avatarInitials, avatarCx, avatarCy + 0.5);
    ctx.textAlign = 'left';

    // Author name (primary) & designation (secondary)
    const metaTextX = cardX + padX + avatarDiameter + 16;
    ctx.textBaseline = 'alphabetic';
    ctx.font =
      '600 21px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fillText(testimonial.authorName, metaTextX, avatarCy - 3);

    ctx.font =
      '400 17.5px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.56)';
    ctx.fillText(testimonial.designation, metaTextX, avatarCy + 20);
  }

  if (options?.trimParallaxBleed) {
    ctx.restore();
  }

  return new Promise<string>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(canvas.toDataURL('image/png'));
        }
      },
      'image/png',
    );
  });
}
