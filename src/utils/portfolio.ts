import type { DesignWorkshopSection } from './studioNavigation';

export type { DesignWorkshopSection };

export type TocVariant =
  | 'notch-rail'
  | 'ios-capsule'
  | 'apple-local-nav'
  | 'macos-sidebar'
  | 'tactile-scrubber';

export type RouteMatch =
  | { page: 'home' }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'case-study'; slug: string }
  | { page: 'notes' }
  | { page: 'note-detail'; slug: string }
  | { page: 'design-system'; section: DesignWorkshopSection };

export type ProjectFilter = 'all' | 'product' | 'interactive' | 'enterprise';
export type ProjectSort = 'featured' | 'newest' | 'alphabetical';

export interface FilterableProject {
  slug: string;
  title: string;
  filterGroup: Exclude<ProjectFilter, 'all'>;
}

export interface SearchableSortableProject extends FilterableProject {
  category: string;
  platform: string;
  year: string;
  credits?: {
    client?: string;
    collaborators?: readonly { name: string; role: string }[];
    tools?: readonly string[];
  };
  overview?: {
    focusAreas?: readonly string[];
  };
}

export interface ProjectQueryOptions {
  filter: ProjectFilter;
  searchQuery?: string;
  sort?: ProjectSort;
}

export interface RelatedProjectRecommendation<T> {
  project: T;
  score: number;
  reason: string;
}

export interface NoteNarrativeSource {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  topic: string;
  tags: readonly string[];
  sections: readonly {
    id: string;
    num: string;
    heading: string;
    paragraphs: readonly string[];
    callout?: string;
  }[];
}

export interface NoteMetrics {
  wordCount: number;
  readMinutes: number;
  sectionCount: number;
}

export interface CaseStudyNarrativeSource {
  title: string;
  tagline: string;
  coverImage: string;
  prototypeKind?: string;
  overview: {
    tldr: string;
    context: string;
    deliverables: readonly string[];
    focusAreas: readonly string[];
  };
  challenge: {
    heading: string;
    paragraphs: readonly string[];
    highlightStatement: string;
  };
  understanding: {
    heading: string;
    intro: string;
    insights: readonly { title: string; detail: string }[];
  };
  approach: {
    heading: string;
    paragraphs: readonly string[];
    principles: readonly { title: string; description: string }[];
  };
  exploration: {
    heading: string;
    intro: string;
    iterations: readonly { stage: string; summary: string; decision: string }[];
  };
  solution: {
    heading: string;
    intro: string;
    prototypeTitle: string;
    prototypeCaption: string;
    highlights: readonly { title: string; body: string }[];
    gallery: readonly { src: string }[];
  };
  reflections: {
    heading: string;
    summary: string;
    learnings: readonly string[];
    nextDirections: string;
  };
}

export interface CaseStudyMetrics {
  wordCount: number;
  readMinutes: number;
  chapterCount: number;
  visualPlatesCount: number;
  interactivePrototypesCount: number;
  iterationStagesCount: number;
  totalArtifactsCount: number;
}

export interface ContactFormValues {
  name: string;
  email: string;
  projectType: string;
  timeline: string;
  message: string;
}

export interface ContactValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ContactFormValues, string>>;
}

/**
 * Parses a browser pathname into a strongly typed application route.
 *
 * Legacy public routes (/toc-lab, /toc, /icons, /icon-lab) are retired and
 * fall back to Home. Portfolio Studio routes under /design-system always
 * resolve as first-class application routes.
 */
export function parseRoute(pathname: string): RouteMatch {
  const withoutHashOrQuery = pathname.split(/[?#]/)[0] ?? '/';
  const normalized = withoutHashOrQuery.replace(/\/+$/, '') || '/';

  if (normalized === '/' || normalized === '/work') {
    return { page: 'home' };
  }

  if (normalized === '/about') {
    return { page: 'about' };
  }

  if (normalized === '/contact') {
    return { page: 'contact' };
  }

  const workMatch = normalized.match(/^\/work\/([a-z0-9-]+)$/i);
  if (workMatch) {
    return { page: 'case-study', slug: workMatch[1].toLowerCase() };
  }

  if (normalized === '/notes') {
    return { page: 'notes' };
  }

  const noteMatch = normalized.match(/^\/notes\/([a-z0-9-]+)$/i);
  if (noteMatch) {
    return { page: 'note-detail', slug: noteMatch[1].toLowerCase() };
  }

  if (normalized === '/design-system' || normalized === '/design-system/overview') {
    return { page: 'design-system', section: 'overview' };
  }
  if (
    normalized === '/design-system/foundations' ||
    normalized === '/design-system/colour-themes'
  ) {
    return { page: 'design-system', section: 'colour-themes' };
  }
  if (normalized === '/design-system/typography') {
    return { page: 'design-system', section: 'typography' };
  }
  if (normalized === '/design-system/spacing-layout') {
    return { page: 'design-system', section: 'spacing-layout' };
  }
  if (normalized === '/design-system/surfaces-elevation') {
    return { page: 'design-system', section: 'surfaces-elevation' };
  }
  if (normalized === '/design-system/components') {
    return { page: 'design-system', section: 'components' };
  }
  if (normalized === '/design-system/patterns') {
    return { page: 'design-system', section: 'patterns' };
  }
  if (normalized === '/design-system/page-templates') {
    return { page: 'design-system', section: 'page-templates' };
  }
  if (normalized === '/design-system/interaction-states') {
    return { page: 'design-system', section: 'interaction-states' };
  }
  if (normalized === '/design-system/motion') {
    return { page: 'design-system', section: 'motion' };
  }
  if (
    normalized === '/design-system/icons' ||
    normalized === '/design-system/icons-sound'
  ) {
    return { page: 'design-system', section: 'icons-sound' };
  }
  if (normalized === '/design-system/effects') {
    return { page: 'design-system', section: 'effects' };
  }
  if (normalized === '/design-system/toc-lab') {
    return { page: 'design-system', section: 'toc-lab' };
  }
  if (normalized === '/design-system/experiments') {
    return { page: 'design-system', section: 'experiments' };
  }
  if (normalized === '/design-system/documentation') {
    return { page: 'design-system', section: 'documentation' };
  }
  if (normalized === '/design-system/decisions') {
    return { page: 'design-system', section: 'decisions' };
  }
  if (normalized.startsWith('/design-system/')) {
    return { page: 'design-system', section: 'overview' };
  }

  return { page: 'home' };
}

/**
 * Filters portfolio projects by editorial category group.
 */
export function filterProjects<T extends FilterableProject>(
  projects: readonly T[],
  filter: ProjectFilter,
): T[] {
  if (filter === 'all') {
    return [...projects];
  }
  return projects.filter((project) => project.filterGroup === filter);
}

/**
 * Computes exact live counts for each project filter category.
 */
export function getProjectFilterCounts<T extends FilterableProject>(
  projects: readonly T[],
): Record<ProjectFilter, number> {
  const counts: Record<ProjectFilter, number> = {
    all: projects.length,
    product: 0,
    interactive: 0,
    enterprise: 0,
  };

  for (const project of projects) {
    counts[project.filterGroup] += 1;
  }

  return counts;
}

/**
 * Finds a project by slug.
 */
export function getProjectBySlug<T extends { slug: string }>(
  projects: readonly T[],
  slug: string,
): T | undefined {
  const normalized = slug.trim().toLowerCase();
  return projects.find((project) => project.slug.toLowerCase() === normalized);
}

/**
 * Computes circular previous and next projects for case study navigation.
 */
export function getAdjacentProjects<T extends { slug: string }>(
  projects: readonly T[],
  currentSlug: string,
): { previous: T; next: T } | null {
  if (projects.length === 0) {
    return null;
  }

  const index = projects.findIndex(
    (project) => project.slug.toLowerCase() === currentSlug.trim().toLowerCase(),
  );

  if (index === -1) {
    return null;
  }

  const prevIndex = (index - 1 + projects.length) % projects.length;
  const nextIndex = (index + 1) % projects.length;

  return {
    previous: projects[prevIndex],
    next: projects[nextIndex],
  };
}

/**
 * Validates the contact inquiry form without silently substituting defaults.
 */
export function validateContactForm(
  values: ContactFormValues,
): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormValues, string>> = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  const email = values.email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!emailPattern.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.projectType.trim()) {
    errors.projectType = 'Select the closest engagement type.';
  }

  const message = values.message.trim();
  if (!message) {
    errors.message = 'Please share a brief note about your project.';
  } else if (message.length < 20) {
    errors.message = 'A couple of sentences (at least 20 characters) helps set context.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Counts words across an array of prose strings.
 */
export function countWords(proseBlocks: readonly string[]): number {
  return proseBlocks
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Collects every narrative chapter text block from a case study so
 * reading time reflects the full 7-chapter story truthfully.
 */
export function collectCaseStudyNarrativeBlocks(
  project: CaseStudyNarrativeSource,
): string[] {
  return [
    project.title,
    project.tagline,
    // 01. Overview
    project.overview.tldr,
    project.overview.context,
    ...project.overview.deliverables,
    ...project.overview.focusAreas,
    // 02. Challenge
    project.challenge.heading,
    ...project.challenge.paragraphs,
    project.challenge.highlightStatement,
    // 03. Understanding
    project.understanding.heading,
    project.understanding.intro,
    ...project.understanding.insights.flatMap((insight) => [
      insight.title,
      insight.detail,
    ]),
    // 04. Approach
    project.approach.heading,
    ...project.approach.paragraphs,
    ...project.approach.principles.flatMap((principle) => [
      principle.title,
      principle.description,
    ]),
    // 05. Exploration
    project.exploration.heading,
    project.exploration.intro,
    ...project.exploration.iterations.flatMap((step) => [
      step.stage,
      step.summary,
      step.decision,
    ]),
    // 06. Solution
    project.solution.heading,
    project.solution.intro,
    project.solution.prototypeTitle,
    project.solution.prototypeCaption,
    ...project.solution.highlights.flatMap((highlight) => [
      highlight.title,
      highlight.body,
    ]),
    // 07. Reflections
    project.reflections.heading,
    project.reflections.summary,
    ...project.reflections.learnings,
    project.reflections.nextDirections,
  ];
}

/**
 * Estimates reading time in minutes from an array of prose blocks
 * at a calm technical reading pace (210 WPM default).
 */
export function estimateReadMinutes(
  proseBlocks: readonly string[],
  wordsPerMinute = 210,
): number {
  const words = countWords(proseBlocks);
  if (words === 0) return 0;
  const safeWpm = Math.max(100, wordsPerMinute);
  return Math.max(1, Math.ceil(words / safeWpm));
}

/**
 * Computes truthful, non-inflated reading and artifact counts for a case study.
 * Tangible artifacts = deduplicated visual plates + interactive prototype (if present).
 */
export function getCaseStudyMetrics(
  project: CaseStudyNarrativeSource,
): CaseStudyMetrics {
  const blocks = collectCaseStudyNarrativeBlocks(project);
  const wordCount = countWords(blocks);
  const readMinutes = estimateReadMinutes(blocks);

  const uniqueVisuals = new Set<string>();
  if (project.coverImage.trim()) {
    uniqueVisuals.add(project.coverImage.trim());
  }
  for (const item of project.solution.gallery) {
    if (item.src.trim()) {
      uniqueVisuals.add(item.src.trim());
    }
  }

  const visualPlatesCount = uniqueVisuals.size;
  const interactivePrototypesCount = project.prototypeKind ? 1 : 0;
  const iterationStagesCount = project.exploration.iterations.length;

  return {
    wordCount,
    readMinutes,
    chapterCount: 7,
    visualPlatesCount,
    interactivePrototypesCount,
    iterationStagesCount,
    totalArtifactsCount: visualPlatesCount + interactivePrototypesCount,
  };
}

/**
 * Returns true only if a project has at least one genuine client, collaborator,
 * or tool entry to display. Ensures empty credit blocks remain completely hidden.
 */
export function hasProjectCredits(
  credits?: {
    client?: string;
    collaborators?: readonly { name: string; role: string }[];
    tools?: readonly string[];
  },
): boolean {
  if (!credits) return false;
  const hasClient = Boolean(credits.client && credits.client.trim().length > 0);
  const hasCollaborators = Boolean(
    credits.collaborators &&
      credits.collaborators.some((c) => c.name.trim().length > 0),
  );
  const hasTools = Boolean(
    credits.tools && credits.tools.some((tool) => tool.trim().length > 0),
  );
  return hasClient || hasCollaborators || hasTools;
}

/**
 * Composes keyword search (title, discipline/category, platform, and tools),
 * category filtering, and sorting (Featured, Newest, Alphabetical) cleanly.
 */
export function queryProjects<T extends SearchableSortableProject>(
  projects: readonly T[],
  options: ProjectQueryOptions,
): T[] {
  const { filter, searchQuery = '', sort = 'featured' } = options;

  const indexed = projects.map((project, originalIndex) => ({
    project,
    originalIndex,
  }));

  const byCategory =
    filter === 'all'
      ? indexed
      : indexed.filter((item) => item.project.filterGroup === filter);

  const terms = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const bySearch =
    terms.length === 0
      ? byCategory
      : byCategory.filter(({ project }) => {
          const searchableText = [
            project.title,
            project.category,
            project.platform,
            ...(project.credits?.tools ?? []),
          ]
            .join(' ')
            .toLowerCase();
          return terms.every((term) => searchableText.includes(term));
        });

  const sorted = [...bySearch];
  if (sort === 'newest') {
    sorted.sort((a, b) => {
      const yearDiff = Number(b.project.year) - Number(a.project.year);
      return yearDiff !== 0 ? yearDiff : a.originalIndex - b.originalIndex;
    });
  } else if (sort === 'alphabetical') {
    sorted.sort((a, b) =>
      a.project.title.localeCompare(b.project.title, 'en', {
        sensitivity: 'base',
      }),
    );
  } else {
    sorted.sort((a, b) => a.originalIndex - b.originalIndex);
  }

  return sorted.map((item) => item.project);
}

const TOKEN_STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'from',
  'into',
  'design',
  'view',
  'app',
  'application',
]);

function extractMeaningfulTokens(values: readonly string[]): Set<string> {
  const tokens = new Set<string>();
  for (const value of values) {
    const parts = value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !TOKEN_STOP_WORDS.has(word));
    for (const part of parts) {
      tokens.add(part);
    }
  }
  return tokens;
}

const FILTER_GROUP_LABEL: Record<Exclude<ProjectFilter, 'all'>, string> = {
  product: 'Product Systems',
  interactive: 'Interactive Craft',
  enterprise: 'Enterprise & Systems',
};

/**
 * Recommends up to `limit` (default 2) contextually relevant projects based on
 * discipline, platform, project type, craft focus, and tools. Never recommends
 * the current project itself.
 */
export function getRelatedProjects<T extends SearchableSortableProject>(
  projects: readonly T[],
  currentSlug: string,
  limit = 2,
): RelatedProjectRecommendation<T>[] {
  const normalizedCurrent = currentSlug.trim().toLowerCase();
  const current = projects.find(
    (p) => p.slug.toLowerCase() === normalizedCurrent,
  );
  if (!current || limit <= 0) return [];

  const currentDisciplineTokens = extractMeaningfulTokens([current.category]);
  const currentPlatformTokens = extractMeaningfulTokens([current.platform]);
  const currentCraftTokens = extractMeaningfulTokens([
    ...(current.overview?.focusAreas ?? []),
    ...(current.credits?.tools ?? []),
  ]);

  const candidates = projects
    .map((candidate, originalIndex) => ({ candidate, originalIndex }))
    .filter(({ candidate }) => candidate.slug.toLowerCase() !== normalizedCurrent)
    .map(({ candidate, originalIndex }) => {
      let score = 0;
      const sameGroup = candidate.filterGroup === current.filterGroup;
      if (sameGroup) score += 4;

      const disciplineOverlap = [...extractMeaningfulTokens([candidate.category])].filter(
        (t) => currentDisciplineTokens.has(t),
      );
      score += disciplineOverlap.length * 3;

      const platformOverlap = [...extractMeaningfulTokens([candidate.platform])].filter(
        (t) => currentPlatformTokens.has(t),
      );
      score += platformOverlap.length * 2;

      const craftOverlap = [
        ...extractMeaningfulTokens([
          ...(candidate.overview?.focusAreas ?? []),
          ...(candidate.credits?.tools ?? []),
        ]),
      ].filter((t) => currentCraftTokens.has(t));
      score += craftOverlap.length * 1.5;

      if (candidate.year === current.year) {
        score += 0.5;
      }

      let reason = `Related ${candidate.category.toLowerCase()}`;
      if (sameGroup) {
        reason = `Shared track · ${FILTER_GROUP_LABEL[candidate.filterGroup]}`;
      } else if (platformOverlap.length > 0) {
        reason = `Similar platform · ${candidate.platform}`;
      } else if (disciplineOverlap.length > 0) {
        reason = `Shared discipline · ${candidate.category}`;
      }

      return {
        project: candidate,
        score,
        reason,
        originalIndex,
      };
    });

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.originalIndex - b.originalIndex;
  });

  return candidates.slice(0, limit).map(({ project, score, reason }) => ({
    project,
    score,
    reason,
  }));
}

/**
 * Collects every narrative text block from a Design Journal essay so reading
 * time reflects the complete article accurately.
 */
export function collectNoteNarrativeBlocks(note: NoteNarrativeSource): string[] {
  return [
    note.title,
    note.subtitle,
    ...note.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.callout ? [section.callout] : []),
    ]),
  ];
}

export function getNoteMetrics(note: NoteNarrativeSource): NoteMetrics {
  const blocks = collectNoteNarrativeBlocks(note);
  const wordCount = countWords(blocks);
  return {
    wordCount,
    readMinutes: estimateReadMinutes(blocks),
    sectionCount: note.sections.length,
  };
}

export function getNoteBySlug<T extends { slug: string }>(
  notes: readonly T[],
  slug: string,
): T | undefined {
  const normalized = slug.trim().toLowerCase();
  return notes.find((note) => note.slug.toLowerCase() === normalized);
}

export function filterNotesByTopic<T extends { topic: string }>(
  notes: readonly T[],
  topic: string,
): T[] {
  if (topic === 'all') return [...notes];
  return notes.filter((note) => note.topic === topic);
}

export function getNoteTopicCounts<T extends { topic: string }>(
  notes: readonly T[],
  topics: readonly string[],
): Record<string, number> {
  const counts: Record<string, number> = { all: notes.length };
  for (const topic of topics) {
    counts[topic] = 0;
  }
  for (const note of notes) {
    counts[note.topic] = (counts[note.topic] ?? 0) + 1;
  }
  return counts;
}

/**
 * Recommends up to `limit` related Design Journal articles based on topic and
 * tag overlap. Never recommends the active article itself.
 */
export function getRelatedNotes<T extends NoteNarrativeSource>(
  notes: readonly T[],
  currentSlug: string,
  limit = 2,
): T[] {
  const normalizedCurrent = currentSlug.trim().toLowerCase();
  const current = notes.find((n) => n.slug.toLowerCase() === normalizedCurrent);
  if (!current || limit <= 0) return [];

  const currentTagTokens = extractMeaningfulTokens([
    current.topic,
    ...current.tags,
  ]);

  const ranked = notes
    .map((candidate, originalIndex) => ({ candidate, originalIndex }))
    .filter(({ candidate }) => candidate.slug.toLowerCase() !== normalizedCurrent)
    .map(({ candidate, originalIndex }) => {
      let score = candidate.topic === current.topic ? 4 : 0;
      const overlap = [
        ...extractMeaningfulTokens([candidate.topic, ...candidate.tags]),
      ].filter((token) => currentTagTokens.has(token));
      score += overlap.length * 2;
      return { candidate, score, originalIndex };
    });

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.originalIndex - b.originalIndex;
  });

  return ranked.slice(0, limit).map((item) => item.candidate);
}

