import type { CaseStudyProject } from '../data/projects';
import type { JournalArticle } from '../data/notes';
import { CAPABILITIES, SITE_CONFIG } from '../data/site';
import type { RouteMatch } from './portfolio';
import { getStudioDestination } from './studioNavigation';

export interface RouteSeoMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  robots: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
  ogType: 'website' | 'article' | 'profile';
  ogImage: string;
  jsonLd: Record<string, unknown> | null;
}

const DEFAULT_OG_IMAGE_PATH = '/src/assets/images/project_stallsync_cover_1795571337308.jpg';

function buildAbsoluteUrl(origin: string, path: string): string {
  const normalizedOrigin = origin.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedOrigin}${normalizedPath}`;
}

function buildPersonSchema(origin: string): Record<string, unknown> {
  return {
    '@type': 'Person',
    name: SITE_CONFIG.name,
    jobTitle: SITE_CONFIG.roleTitle,
    url: buildAbsoluteUrl(origin, '/'),
    email: `mailto:${SITE_CONFIG.email}`,
    knowsAbout: CAPABILITIES.map((cap) => cap.name),
    sameAs: SITE_CONFIG.socials.map((s) => s.href),
  };
}

/**
 * Computes unique, factual SEO metadata, robots directives, social cards, and
 * Schema.org JSON-LD for every application route (P3.2).
 *
 * Guarantees:
 * - /design-system and internal routes are always `noindex, nofollow` with zero JSON-LD.
 * - Draft Notes (/notes/:slug with status === 'draft') are `noindex, nofollow` and never
 *   emitted as published Article JSON-LD.
 * - /notes index is `noindex, follow` while all notes remain unpublished drafts.
 */
export function resolveRouteSeo(options: {
  route: RouteMatch;
  project?: CaseStudyProject;
  note?: JournalArticle;
  notes: readonly JournalArticle[];
  origin: string;
}): RouteSeoMetadata {
  const { route, project, note, notes, origin } = options;

  // 1. Private Design Studio — strictly excluded from indexing
  if (route.page === 'design-system') {
    const dest = getStudioDestination(route.section);
    const path = dest.path;
    return {
      title: `${dest.label} — Design Studio (Internal) — ${SITE_CONFIG.name}`,
      description: 'Internal design system studio and visual exploration workspace.',
      canonicalPath: path,
      canonicalUrl: buildAbsoluteUrl(origin, path),
      robots: 'noindex, nofollow',
      ogType: 'website',
      ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
      jsonLd: null,
    };
  }

  // 2. Individual Case Study — CreativeWork JSON-LD
  if (route.page === 'case-study' && project) {
    const path = `/work/${project.slug}`;
    const canonicalUrl = buildAbsoluteUrl(origin, path);
    const ogImage = buildAbsoluteUrl(origin, project.coverImage);
    const description = `${project.tagline} ${project.role} (${project.year}) — ${project.category}.`.slice(
      0,
      160,
    );

    return {
      title: `${project.title} — ${project.category} — ${SITE_CONFIG.name}`,
      description,
      canonicalPath: path,
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'article',
      ogImage,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        headline: project.tagline,
        description: project.shortDescription,
        url: canonicalUrl,
        image: ogImage,
        dateCreated: project.year,
        genre: project.category,
        keywords: [
          project.category,
          project.platform,
          ...project.overview.focusAreas,
          ...(project.credits?.tools ?? []),
        ].join(', '),
        author: buildPersonSchema(origin),
      },
    };
  }

  // 3. Individual Note Detail — Drafts strictly noindex, nofollow
  if (route.page === 'note-detail' && note) {
    const path = `/notes/${note.slug}`;
    const canonicalUrl = buildAbsoluteUrl(origin, path);
    const isDraft = note.status === 'draft';

    return {
      title: isDraft
        ? `${note.title} (Draft) — Notes — ${SITE_CONFIG.name}`
        : `${note.title} — Notes — ${SITE_CONFIG.name}`,
      description: note.excerpt.slice(0, 160),
      canonicalPath: path,
      canonicalUrl,
      robots: isDraft ? 'noindex, nofollow' : 'index, follow',
      ogType: 'article',
      ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
      jsonLd: isDraft
        ? null
        : {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: note.title,
            description: note.excerpt,
            url: canonicalUrl,
            articleSection: note.topic,
            keywords: note.tags.join(', '),
            author: buildPersonSchema(origin),
          },
    };
  }

  // 4. Notes Index — noindex while all essays are unpublished working drafts
  if (route.page === 'notes') {
    const hasPublishedNotes = notes.some((item) => item.status === 'published');
    const path = '/notes';
    const canonicalUrl = buildAbsoluteUrl(origin, path);
    return {
      title: `Notes & Design Writing — ${SITE_CONFIG.name}`,
      description:
        'Working essays and field notes on product clarity, interaction craft, calm operational software, and design systems.',
      canonicalPath: path,
      canonicalUrl,
      robots: hasPublishedNotes ? 'index, follow' : 'noindex, follow',
      ogType: 'website',
      ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
      jsonLd: hasPublishedNotes
        ? {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Design Notes — ${SITE_CONFIG.name}`,
            url: canonicalUrl,
            author: buildPersonSchema(origin),
          }
        : null,
    };
  }

  // 5. About Page — Person JSON-LD
  if (route.page === 'about') {
    const path = '/about';
    const canonicalUrl = buildAbsoluteUrl(origin, path);
    return {
      title: `About & Practice — ${SITE_CONFIG.name}`,
      description:
        'Background, practice timeline, design philosophy, and everyday tools of Aarav Sen, independent UX & Product Designer.',
      canonicalPath: path,
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'profile',
      ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: canonicalUrl,
        mainEntity: buildPersonSchema(origin),
      },
    };
  }

  // 6. Contact Page — ContactPage JSON-LD
  if (route.page === 'contact') {
    const path = '/contact';
    const canonicalUrl = buildAbsoluteUrl(origin, path);
    return {
      title: `Contact & Project Inquiries — ${SITE_CONFIG.name}`,
      description:
        'Start a product design, UX architecture, design system, or interactive web collaboration with Aarav Sen.',
      canonicalPath: path,
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'website',
      ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: `Contact ${SITE_CONFIG.name}`,
        url: canonicalUrl,
        mainEntity: buildPersonSchema(origin),
      },
    };
  }

  // 7. Work Index — CollectionPage JSON-LD
  if (route.page === 'work') {
    const path = '/work';
    const canonicalUrl = buildAbsoluteUrl(origin, path);
    return {
      title: `Work & Case Studies — ${SITE_CONFIG.name}`,
      description:
        'Complete archive of product design, interaction systems, and web engineering case studies.',
      canonicalPath: path,
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'website',
      ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Work — ${SITE_CONFIG.name}`,
        url: canonicalUrl,
        description:
          'Selected and archived UX, product design, and interactive engineering case studies.',
        author: buildPersonSchema(origin),
      },
    };
  }

  // 7b. FlexCarousel Playground — noindex interactive settings lab
  if (route.page === 'flex-carousel') {
    const path = '/flex-carousel';
    const canonicalUrl = buildAbsoluteUrl(origin, path);
    return {
      title: `FlexCarousel Playground — ${SITE_CONFIG.name}`,
      description:
        'Interactive FlexCarousel sandbox for tuning case study card liquid-glass settings.',
      canonicalPath: path,
      canonicalUrl,
      robots: 'noindex, nofollow',
      ogType: 'website',
      ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
      jsonLd: null,
    };
  }

  // 8. Home — WebSite + Person JSON-LD
  const canonicalUrl = buildAbsoluteUrl(origin, '/');
  return {
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.roleTitle}`,
    description:
      'Independent UX and product designer crafting clear interfaces, resilient design systems, and tactile interactive web experiences.',
    canonicalPath: '/',
    canonicalUrl,
    robots: 'index, follow',
    ogType: 'website',
    ogImage: buildAbsoluteUrl(origin, DEFAULT_OG_IMAGE_PATH),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        buildPersonSchema(origin),
        {
          '@type': 'WebSite',
          name: `${SITE_CONFIG.name} — Portfolio`,
          url: canonicalUrl,
          description: SITE_CONFIG.hero.intro,
        },
      ],
    },
  };
}

function upsertMeta(selector: string, attrs: Record<string, string>, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    Object.entries(attrs).forEach(([key, val]) => el!.setAttribute(key, val));
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Synchronizes document head metadata, OpenGraph, Twitter cards, canonical link,
 * robots directives, and Schema.org JSON-LD for the active SPA route.
 */
export function applyRouteSeo(seo: RouteSeoMetadata): void {
  if (typeof document === 'undefined') return;

  document.title = seo.title;
  upsertCanonical(seo.canonicalUrl);

  upsertMeta('meta[name="description"]', { name: 'description' }, seo.description);
  upsertMeta('meta[name="robots"]', { name: 'robots' }, seo.robots);

  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, seo.ogType);
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, seo.title);
  upsertMeta(
    'meta[property="og:description"]',
    { property: 'og:description' },
    seo.description,
  );
  upsertMeta('meta[property="og:url"]', { property: 'og:url' }, seo.canonicalUrl);
  upsertMeta(
    'meta[property="og:site_name"]',
    { property: 'og:site_name' },
    SITE_CONFIG.name,
  );
  upsertMeta('meta[property="og:image"]', { property: 'og:image' }, seo.ogImage);

  upsertMeta(
    'meta[name="twitter:card"]',
    { name: 'twitter:card' },
    'summary_large_image',
  );
  upsertMeta(
    'meta[name="twitter:title"]',
    { name: 'twitter:title' },
    seo.title,
  );
  upsertMeta(
    'meta[name="twitter:description"]',
    { name: 'twitter:description' },
    seo.description,
  );
  upsertMeta(
    'meta[name="twitter:image"]',
    { name: 'twitter:image' },
    seo.ogImage,
  );

  const existingJsonLd = document.head.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"][data-seo-jsonld="true"]',
  );

  if (seo.jsonLd) {
    const script = existingJsonLd ?? document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', 'true');
    script.textContent = JSON.stringify(seo.jsonLd);
    if (!existingJsonLd) {
      document.head.appendChild(script);
    }
  } else if (existingJsonLd) {
    existingJsonLd.remove();
  }
}
