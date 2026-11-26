import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PROJECTS } from '../data/projects';
import { JOURNAL_NOTES, NOTE_TOPICS } from '../data/notes';
import { SITE_CONFIG } from '../data/site';
import {
  VERIFIED_TESTIMONIALS,
  getVerifiedTestimonials,
} from '../data/testimonials';
import {
  STUDIO_NAV_GROUPS,
  getAllStudioDestinations,
  getPrimaryNavItems,
  getStudioDestination,
} from './studioNavigation';
import {
  COLOR_TOKENS,
  EDITORIAL_MEASURES,
  ELEVATION_LEVELS,
  FONT_FAMILIES,
  FOUNDATION_GAPS,
  LAYOUT_TOKENS,
  RADIUS_SCALE,
  RESPONSIVE_BREAKPOINTS,
  SPACING_SCALE,
  TYPOGRAPHY_STYLES,
  computeTypeSizeAtViewport,
  evaluateContrastPair,
  getGapsByDomain,
  getTokenValueForMatrix,
} from './foundationsCatalog';
import {
  COMPONENT_CATEGORIES,
  COMPONENT_LIBRARY_ITEMS,
  EXCLUDED_COMPONENTS,
  filterComponentLibraryItems,
  getComponentCountsByCategory,
} from './componentLibraryCatalog';
import {
  isFloatingAudioDockVisible,
  isMobileReadingBarVisible,
  resetFloatingAudioDockForTest,
  setFloatingAudioDockActive,
  setMobileReadingBarActive,
} from './floatingDock';
import {
  collectCaseStudyNarrativeBlocks,
  countWords,
  estimateReadMinutes,
  filterNotesByTopic,
  filterProjects,
  getAdjacentProjects,
  getCaseStudyMetrics,
  getNoteBySlug,
  getNoteMetrics,
  getNoteTopicCounts,
  getProjectBySlug,
  getProjectFilterCounts,
  getRelatedNotes,
  getRelatedProjects,
  hasProjectCredits,
  parseRoute,
  queryProjects,
  validateContactForm,
} from './portfolio';
import {
  buildNarrationTimeline,
  buildWaveformProfile,
  clampAudioTime,
  computeCalibratedSpeechParams,
  DEFAULT_SPEECH_TUNING,
  detectVoiceProvider,
  formatAudioTime,
  prepareTextForSpeech,
  rankSpeechVoices,
  resolvePositionAtTime,
  skipAudioTime,
  splitIntoSpeechChunks,
} from './readAloud';
import { computeScrollTargetTop, resolveScrollBehavior } from './scroll';
import {
  isSoundEnabled,
  resetSoundStateForTest,
  setSoundEnabled,
  subscribeSoundPreference,
  toggleSoundEnabled,
} from './soundEngine';
import {
  getAppearanceMode,
  getResolvedTheme,
  parseAppearanceMode,
  resetAppearanceStateForTest,
  resolveAppearanceTheme,
  setAppearanceMode,
  subscribeAppearance,
} from './appearance';
import {
  EFFECT_TRACKS,
  createDefaultEffectsConfig,
  generateTokenPromotionMarkdown,
  parseImportedDecisionLogJson,
  promoteApprovedDecisions,
  serializeDecisionLogJson,
  upsertDecisionEntry,
} from './workshopStore';
import {
  buildCaseStudyNarrationSegments,
  estimateSkimReadMinutes,
  getCaseStudyChaptersForDepth,
} from './caseStudyDepth';
import {
  dismissToast,
  getActiveToast,
  resetToastForTest,
  showToast,
  subscribeToast,
} from './toast';
import {
  buildPublicCommandPaletteItems,
  searchCommandPaletteItems,
} from './commandPalette';
import {
  getReaderPreferences,
  resetReaderPreferencesForTest,
  setFocusReading,
  setReaderTextSize,
  subscribeReaderPreferences,
  toggleFocusReading,
} from './readerPreferences';
import {
  formatHyderabadTime,
  getHyderabadClockSnapshot,
} from './localTime';
import { auditThemeContrast, contrastRatio } from './a11yContrast';
import { resolveRouteSeo } from './seo';
import { getAnalyticsConfig, isAnalyticsPathAllowed } from './analytics';
import {
  buildShortlistShareUrl,
  clearShortlist,
  getShortlistSlugs,
  parseShortlistFromSearch,
  resetShortlistForTest,
  subscribeShortlist,
  toggleShortlistSlug,
} from './shortlist';

const SAMPLE_PROJECTS = [
  { slug: 'stallsync', title: 'StallSync', filterGroup: 'product' as const },
  { slug: 'music-discovery-pwa', title: 'Music Discovery PWA', filterGroup: 'interactive' as const },
  { slug: 'precognition-labs', title: 'Precognition Labs', filterGroup: 'enterprise' as const },
];

test('P0.1: parseRoute retires public /toc-lab and /icons and resolves /design-system as a first-class route', () => {
  assert.deepEqual(parseRoute('/'), { page: 'home' });
  assert.deepEqual(parseRoute('/work/'), { page: 'home' });
  assert.deepEqual(parseRoute('/about'), { page: 'about' });
  assert.deepEqual(parseRoute('/contact/'), { page: 'contact' });
  assert.deepEqual(parseRoute('/work/stallsync'), { page: 'case-study', slug: 'stallsync' });
  assert.deepEqual(parseRoute('/work/Curse-of-the-Mudradhaar/'), {
    page: 'case-study',
    slug: 'curse-of-the-mudradhaar',
  });

  // Retired legacy public routes fall back to Home
  assert.deepEqual(parseRoute('/toc-lab'), { page: 'home' });
  assert.deepEqual(parseRoute('/toc/'), { page: 'home' });
  assert.deepEqual(parseRoute('/icons'), { page: 'home' });
  assert.deepEqual(parseRoute('/icon-lab/'), { page: 'home' });

  // /design-system and all sub-routes resolve unconditionally as first-class application routes
  assert.deepEqual(parseRoute('/design-system'), {
    page: 'design-system',
    section: 'overview',
  });
  assert.deepEqual(parseRoute('/design-system/foundations'), {
    page: 'design-system',
    section: 'colour-themes',
  });
  assert.deepEqual(parseRoute('/design-system/components'), {
    page: 'design-system',
    section: 'components',
  });
  assert.deepEqual(parseRoute('/design-system/motion'), {
    page: 'design-system',
    section: 'motion',
  });
  assert.deepEqual(parseRoute('/design-system/icons'), {
    page: 'design-system',
    section: 'icons-sound',
  });
  assert.deepEqual(parseRoute('/design-system/effects'), {
    page: 'design-system',
    section: 'effects',
  });
  assert.deepEqual(parseRoute('/design-system/toc-lab/'), {
    page: 'design-system',
    section: 'toc-lab',
  });
  assert.deepEqual(parseRoute('/design-system/decisions'), {
    page: 'design-system',
    section: 'decisions',
  });

  // Unknown paths fall back to Home
  assert.deepEqual(parseRoute('/unknown/path'), { page: 'home' });
});

test('P0.2: UI sound engine defaults to enabled and notifies reactive subscribers synchronously', () => {
  resetSoundStateForTest(true);
  assert.equal(isSoundEnabled(), true);

  let notifications = 0;
  const unsubscribe = subscribeSoundPreference(() => {
    notifications += 1;
  });

  setSoundEnabled(false);
  assert.equal(isSoundEnabled(), false);
  assert.equal(notifications, 1);

  // Calling with same value does not double-notify
  setSoundEnabled(false);
  assert.equal(notifications, 1);

  const toggled = toggleSoundEnabled();
  assert.equal(toggled, true);
  assert.equal(isSoundEnabled(), true);
  assert.equal(notifications, 2);

  unsubscribe();
  setSoundEnabled(false);
  assert.equal(notifications, 2);

  // Restore default state
  resetSoundStateForTest(true);
});

test('P0.3: filterProjects and getProjectFilterCounts return accurate live counts across all real projects', () => {
  assert.equal(filterProjects(SAMPLE_PROJECTS, 'all').length, 3);
  const interactive = filterProjects(SAMPLE_PROJECTS, 'interactive');
  assert.equal(interactive.length, 1);
  assert.equal(interactive[0].slug, 'music-discovery-pwa');
  assert.equal(filterProjects(SAMPLE_PROJECTS, 'enterprise')[0].slug, 'precognition-labs');

  const counts = getProjectFilterCounts(PROJECTS);
  assert.equal(counts.all, PROJECTS.length);
  assert.equal(
    counts.product + counts.interactive + counts.enterprise,
    PROJECTS.length,
  );
  assert.equal(counts.product, filterProjects(PROJECTS, 'product').length);
  assert.equal(counts.interactive, filterProjects(PROJECTS, 'interactive').length);
  assert.equal(counts.enterprise, filterProjects(PROJECTS, 'enterprise').length);
});

test('P0.3: reading time and artifact counts reflect all 7 chapters without omitting content or inflating numbers', () => {
  assert.equal(estimateReadMinutes([]), 0);
  assert.equal(estimateReadMinutes(['Short introduction paragraph.']), 1);
  const longText = Array.from({ length: 650 }, () => 'design').join(' ');
  assert.equal(estimateReadMinutes([longText]), 4);

  for (const project of PROJECTS) {
    const fullBlocks = collectCaseStudyNarrativeBlocks(project);
    const partialBlocks = [
      project.overview.tldr,
      project.overview.context,
      ...project.challenge.paragraphs,
      project.understanding.intro,
      ...project.approach.paragraphs,
      project.solution.intro,
      project.reflections.summary,
    ];

    const fullWords = countWords(fullBlocks);
    const partialWords = countWords(partialBlocks);
    assert.ok(
      fullWords > partialWords,
      `${project.slug} full narrative word count (${fullWords}) should exceed partial count (${partialWords})`,
    );

    const metrics = getCaseStudyMetrics(project);
    assert.equal(metrics.wordCount, fullWords);
    assert.equal(metrics.readMinutes, Math.max(1, Math.ceil(fullWords / 210)));
    assert.equal(metrics.chapterCount, 7);
    assert.equal(metrics.interactivePrototypesCount, 1);
    assert.equal(metrics.visualPlatesCount, 1);
    assert.equal(metrics.totalArtifactsCount, 2);
    assert.equal(metrics.iterationStagesCount, project.exploration.iterations.length);
  }
});

test('getProjectBySlug and getAdjacentProjects handle circular navigation cleanly', () => {
  assert.equal(getProjectBySlug(SAMPLE_PROJECTS, 'StallSync')?.title, 'StallSync');
  assert.equal(getProjectBySlug(SAMPLE_PROJECTS, 'missing'), undefined);

  const firstAdjacent = getAdjacentProjects(SAMPLE_PROJECTS, 'stallsync');
  assert.equal(firstAdjacent?.previous.slug, 'precognition-labs');
  assert.equal(firstAdjacent?.next.slug, 'music-discovery-pwa');

  const lastAdjacent = getAdjacentProjects(SAMPLE_PROJECTS, 'precognition-labs');
  assert.equal(lastAdjacent?.previous.slug, 'music-discovery-pwa');
  assert.equal(lastAdjacent?.next.slug, 'stallsync');

  assert.equal(getAdjacentProjects(SAMPLE_PROJECTS, 'missing'), null);
});

test('validateContactForm rejects empty or invalid inputs and accepts complete inquiries', () => {
  const emptyResult = validateContactForm({
    name: '',
    email: 'invalid-email',
    projectType: '',
    timeline: '',
    message: 'Too short',
  });

  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.name);
  assert.ok(emptyResult.errors.email);
  assert.ok(emptyResult.errors.projectType);
  assert.ok(emptyResult.errors.message);

  const validResult = validateContactForm({
    name: 'Maya Kapoor',
    email: 'maya@studio.co',
    projectType: 'Product Design',
    timeline: 'Next 1–2 months',
    message: 'We are designing an onboarding flow for a new logistics tool and would love your perspective.',
  });

  assert.equal(validResult.isValid, true);
  assert.deepEqual(validResult.errors, {});
});

test('P0.5: scroll offset math accounts for sticky header, optional subnav, and reduced motion', () => {
  assert.equal(
    computeScrollTargetTop({
      elementTopInViewport: 500,
      currentScrollY: 200,
      stickyHeaderHeight: 52,
      stickySubnavHeight: 0,
      breathingRoom: 28,
    }),
    620,
  );

  // With sticky Apple Local Ribbon subnav active
  assert.equal(
    computeScrollTargetTop({
      elementTopInViewport: 500,
      currentScrollY: 200,
      stickyHeaderHeight: 52,
      stickySubnavHeight: 52,
      breathingRoom: 28,
    }),
    568,
  );

  // Never scrolls above 0
  assert.equal(
    computeScrollTargetTop({
      elementTopInViewport: 20,
      currentScrollY: 0,
      stickyHeaderHeight: 52,
      breathingRoom: 28,
    }),
    0,
  );

  assert.equal(resolveScrollBehavior('smooth', false), 'smooth');
  assert.equal(resolveScrollBehavior('smooth', true), 'auto');
  assert.equal(resolveScrollBehavior('auto', false), 'auto');
});

test('readAloud timeline resolves scrubber drags, ±15s skips, and chapter sync cleanly', () => {
  const timeline = buildNarrationTimeline([
    {
      id: 'overview',
      num: '01',
      title: 'Overview',
      text: Array.from({ length: 55 }, () => 'overview').join(' '),
    },
    {
      id: 'challenge',
      num: '02',
      title: 'The Challenge',
      text: Array.from({ length: 110 }, () => 'challenge').join(' '),
    },
  ]);

  assert.equal(timeline.segments.length, 2);
  assert.equal(timeline.segments[0].startSec, 0);
  assert.equal(timeline.segments[0].durationSec, 20);
  assert.equal(timeline.segments[1].startSec, 20);
  assert.equal(timeline.totalDurationSec, 60);

  assert.equal(skipAudioTime(10, 15, timeline.totalDurationSec), 25);
  assert.equal(skipAudioTime(10, -15, timeline.totalDurationSec), 0);
  assert.equal(skipAudioTime(55, 15, timeline.totalDurationSec), 60);
  assert.equal(clampAudioTime(-5, 60), 0);

  const midSecond = resolvePositionAtTime(timeline, 35);
  assert.equal(midSecond?.segment.id, 'challenge');
  assert.ok((midSecond?.remainingText.length ?? 0) > 0);

  assert.equal(formatAudioTime(0), '0:00');
  assert.equal(formatAudioTime(75), '1:15');
});

test('P1.5: appearance system parses modes, resolves OS theme, and notifies reactive subscribers', () => {
  assert.equal(parseAppearanceMode('light'), 'light');
  assert.equal(parseAppearanceMode('dark'), 'dark');
  assert.equal(parseAppearanceMode('system'), 'system');
  assert.equal(parseAppearanceMode('invalid'), 'system');
  assert.equal(parseAppearanceMode(null), 'system');

  assert.equal(resolveAppearanceTheme('light', true), 'light');
  assert.equal(resolveAppearanceTheme('dark', false), 'dark');
  assert.equal(resolveAppearanceTheme('system', true), 'dark');
  assert.equal(resolveAppearanceTheme('system', false), 'light');

  resetAppearanceStateForTest('system', 'dark');
  assert.equal(getAppearanceMode(), 'system');
  assert.equal(getResolvedTheme(), 'dark');

  let notifications = 0;
  const unsubscribe = subscribeAppearance(() => {
    notifications += 1;
  });

  setAppearanceMode('light');
  assert.equal(getAppearanceMode(), 'light');
  assert.equal(getResolvedTheme(), 'light');
  assert.equal(notifications, 1);

  // Calling with same mode does not double-notify
  setAppearanceMode('light');
  assert.equal(notifications, 1);

  setAppearanceMode('dark');
  assert.equal(getResolvedTheme(), 'dark');
  assert.equal(notifications, 2);

  unsubscribe();
  setAppearanceMode('system');
  assert.equal(notifications, 2);

  resetAppearanceStateForTest('system', 'light');
});

test('P1.3: Effects Lab defines all 7 exploration tracks with valid in-bounds defaults', () => {
  assert.equal(EFFECT_TRACKS.length, 7);
  const defaults = createDefaultEffectsConfig();

  for (const track of EFFECT_TRACKS) {
    const config = defaults[track.id];
    assert.ok(config, `Missing default config for track ${track.id}`);
    assert.equal(config.enabled, true);
    assert.ok(
      track.variants.some((variant) => variant.id === config.variantId),
      `Default variant ${config.variantId} must belong to track ${track.id}`,
    );
    assert.ok(
      config.intensity >= track.primaryMin && config.intensity <= track.primaryMax,
      `Default intensity for ${track.id} must be within [${track.primaryMin}, ${track.primaryMax}]`,
    );
    assert.ok(
      config.secondary >= track.secondaryMin && config.secondary <= track.secondaryMax,
      `Default secondary for ${track.id} must be within [${track.secondaryMin}, ${track.secondaryMax}]`,
    );
  }
});

test('P1.4: Decision Log upserts cleanly, round-trips JSON, rejects malformed imports, and generates Markdown summary', () => {
  const t1 = '2026-11-25T10:00:00.000Z';
  const t2 = '2026-11-25T10:15:00.000Z';

  let log = upsertDecisionEntry(
    [],
    {
      subjectType: 'effect-track',
      subjectId: 'organic-texture',
      trackId: 'organic-texture',
      title: 'Organic Textures & Paper Grain',
      variantLabel: 'Fine Cotton Rag',
      status: 'approved',
      parameters: { enabled: true, intensity: 5, secondary: 180 },
      paletteContext: 'warm',
      themeContext: 'light',
      rationale: 'Softens clinical white bands without hurting legibility.',
    },
    t1,
  );

  assert.equal(log.length, 1);
  assert.equal(log[0].createdAt, t1);
  assert.equal(log[0].updatedAt, t1);
  assert.equal(log[0].status, 'approved');

  // Updating the same decision preserves createdAt and updates updatedAt
  log = upsertDecisionEntry(
    log,
    {
      id: log[0].id,
      subjectType: 'effect-track',
      subjectId: 'organic-texture',
      trackId: 'organic-texture',
      title: 'Organic Textures & Paper Grain',
      variantLabel: 'Fine Cotton Rag',
      status: 'promoted',
      parameters: { enabled: true, intensity: 4, secondary: 180 },
      paletteContext: 'warm',
      themeContext: 'light',
      rationale: 'Calibrated to 4% and documented for token promotion.',
    },
    t2,
  );

  assert.equal(log.length, 1);
  assert.equal(log[0].createdAt, t1);
  assert.equal(log[0].updatedAt, t2);
  assert.equal(log[0].status, 'promoted');

  // Add a second rejected decision to verify multi-status export
  log = upsertDecisionEntry(
    log,
    {
      subjectType: 'effect-track',
      subjectId: 'subtle-parallax',
      trackId: 'subtle-parallax',
      title: 'Subtle Parallax Depth',
      variantLabel: 'Gentle Media Drift',
      status: 'rejected',
      parameters: { enabled: true, intensity: 10, secondary: 50 },
      paletteContext: 'cool',
      themeContext: 'dark',
      rationale: 'Feels slightly distracting on dense case study reading.',
    },
    t2,
  );

  const exportedJson = serializeDecisionLogJson(log, t2);
  const imported = parseImportedDecisionLogJson(exportedJson);
  assert.equal(imported.ok, true);
  if (imported.ok) {
    assert.equal(imported.entries.length, 2);
    assert.equal(imported.entries[0].status, 'rejected');
    assert.equal(imported.entries[1].status, 'promoted');
  }

  const malformed = parseImportedDecisionLogJson('{ not valid json');
  assert.equal(malformed.ok, false);

  const invalidPayload = parseImportedDecisionLogJson(JSON.stringify({ entries: [{ bad: true }] }));
  assert.equal(invalidPayload.ok, false);

  const markdown = generateTokenPromotionMarkdown(log, t2);
  assert.ok(markdown.includes('Token Promotion Summary'));
  assert.ok(markdown.includes('Promoted to Production: 1'));
  assert.ok(markdown.includes('Rejected (excluded from public site): 1'));
  assert.ok(markdown.includes('Fine Cotton Rag'));
  assert.ok(markdown.includes('Gentle Media Drift'));
});

test('P1.8: floating AudioPlayer dock visibility coordinates cleanly with Back-to-Top', () => {
  resetFloatingAudioDockForTest();
  assert.equal(isFloatingAudioDockVisible(), false);

  setFloatingAudioDockActive('dock-a', true);
  assert.equal(isFloatingAudioDockVisible(), true);

  setFloatingAudioDockActive('dock-b', true);
  setFloatingAudioDockActive('dock-a', false);
  assert.equal(isFloatingAudioDockVisible(), true);

  setFloatingAudioDockActive('dock-b', false);
  assert.equal(isFloatingAudioDockVisible(), false);
});

test('P1.9: project credits helper hides missing fields and PROJECTS contains zero fabricated clients or collaborators', () => {
  assert.equal(hasProjectCredits(undefined), false);
  assert.equal(hasProjectCredits({}), false);
  assert.equal(hasProjectCredits({ client: '   ', collaborators: [], tools: [''] }), false);
  assert.equal(hasProjectCredits({ tools: ['MediaPipe'] }), true);
  assert.equal(hasProjectCredits({ client: 'Example Studio' }), true);
  assert.equal(
    hasProjectCredits({ collaborators: [{ name: 'Jordan', role: 'Engineering' }] }),
    true,
  );

  // Confirm no fabricated client names or collaborators exist in public project data
  for (const project of PROJECTS) {
    assert.equal(project.credits?.client, undefined);
    assert.equal(project.credits?.collaborators, undefined);
  }
});

test('P1.10: public testimonials list is empty and unverified entries are strictly filtered out', () => {
  assert.equal(VERIFIED_TESTIMONIALS.length, 0);
  assert.equal(getVerifiedTestimonials(VERIFIED_TESTIMONIALS).length, 0);

  const mixed = [
    {
      id: 't1',
      quote: 'Unverified draft quote.',
      authorName: 'Test Person',
      role: 'Lead',
      organization: 'Org',
      verified: false,
    },
    {
      id: 't2',
      quote: 'Missing organization.',
      authorName: 'Test Person',
      role: 'Lead',
      organization: '   ',
      verified: true,
    },
    {
      id: 't3',
      quote: 'Verified collaboration note.',
      authorName: 'Verified Author',
      role: 'Founder',
      organization: 'Verified Studio',
      projectSlug: 'stallsync',
      verified: true,
    },
  ];

  const verifiedAll = getVerifiedTestimonials(mixed);
  assert.equal(verifiedAll.length, 1);
  assert.equal(verifiedAll[0].id, 't3');
  assert.equal(getVerifiedTestimonials(mixed, 'stallsync').length, 1);
  assert.equal(getVerifiedTestimonials(mixed, 'hubapps').length, 0);
});

test('P1.11: getRelatedProjects recommends up to 2 relevant projects and never recommends current project', () => {
  for (const project of PROJECTS) {
    const related = getRelatedProjects(PROJECTS, project.slug, 2);
    assert.equal(related.length, 2);
    assert.ok(
      related.every((rec) => rec.project.slug !== project.slug),
      `${project.slug} must never be recommended to itself`,
    );
    assert.notEqual(related[0].project.slug, related[1].project.slug);
    assert.ok(related[0].reason.length > 0);
  }

  // Enterprise project should prioritize the other enterprise project first
  const enterpriseRelated = getRelatedProjects(PROJECTS, 'precognition-labs', 2);
  assert.equal(enterpriseRelated[0].project.slug, 'hubapps');
});

test('P1.12: queryProjects composes keyword search (title, discipline, platform, tools), category filter, and sorting', () => {
  // Default featured preserves curated order
  const featured = queryProjects(PROJECTS, { filter: 'all', sort: 'featured' });
  assert.deepEqual(
    featured.map((p) => p.slug),
    PROJECTS.map((p) => p.slug),
  );

  // Alphabetical sorting
  const alpha = queryProjects(PROJECTS, { filter: 'all', sort: 'alphabetical' });
  assert.equal(alpha[0].slug, 'hubapps');
  assert.equal(alpha[alpha.length - 1].slug, 'curse-of-the-mudradhaar');

  // Newest sorting places 2026 projects ahead of 2025 projects
  const newest = queryProjects(PROJECTS, { filter: 'all', sort: 'newest' });
  assert.equal(newest[0].year, '2026');
  assert.equal(newest[1].year, '2026');

  // Tool search matches MediaPipe on The Curse of the Mudradhaar
  const byTool = queryProjects(PROJECTS, {
    filter: 'all',
    searchQuery: 'MediaPipe',
    sort: 'featured',
  });
  assert.equal(byTool.length, 1);
  assert.equal(byTool[0].slug, 'curse-of-the-mudradhaar');

  // Platform + category combined search
  const byPlatformAndCategory = queryProjects(PROJECTS, {
    filter: 'product',
    searchQuery: 'tablet',
    sort: 'featured',
  });
  assert.equal(byPlatformAndCategory.length, 1);
  assert.equal(byPlatformAndCategory[0].slug, 'mycroharvest');

  // Non-matching query yields clean empty array
  const empty = queryProjects(PROJECTS, {
    filter: 'enterprise',
    searchQuery: 'mediapipe',
  });
  assert.equal(empty.length, 0);
});

test('P1.13: Design Journal routes, Draft labeling, reading time, topic filtering, and related notes work cleanly', () => {
  assert.deepEqual(parseRoute('/notes'), { page: 'notes' });
  assert.deepEqual(parseRoute('/notes/'), { page: 'notes' });
  assert.deepEqual(parseRoute('/notes/calm-density-in-operational-software/'), {
    page: 'note-detail',
    slug: 'calm-density-in-operational-software',
  });

  assert.ok(JOURNAL_NOTES.length >= 4);

  // Every seed essay MUST be explicitly marked Draft
  for (const note of JOURNAL_NOTES) {
    assert.equal(note.status, 'draft');
    const metrics = getNoteMetrics(note);
    assert.ok(metrics.wordCount > 100);
    assert.equal(metrics.readMinutes, Math.max(1, Math.ceil(metrics.wordCount / 210)));
    assert.equal(metrics.sectionCount, note.sections.length);
    assert.equal(getNoteBySlug(JOURNAL_NOTES, note.slug)?.slug, note.slug);

    const related = getRelatedNotes(JOURNAL_NOTES, note.slug, 2);
    assert.equal(related.length, 2);
    assert.ok(related.every((r) => r.slug !== note.slug));
  }

  const topicCounts = getNoteTopicCounts(JOURNAL_NOTES, NOTE_TOPICS);
  assert.equal(topicCounts.all, JOURNAL_NOTES.length);
  const sumTopics = NOTE_TOPICS.reduce((acc, topic) => acc + topicCounts[topic], 0);
  assert.equal(sumTopics, JOURNAL_NOTES.length);

  const filtered = filterNotesByTopic(JOURNAL_NOTES, 'Interaction Design');
  assert.equal(filtered.length, topicCounts['Interaction Design']);
  assert.ok(filtered.every((n) => n.topic === 'Interaction Design'));
});

test('P2.1: promoteApprovedDecisions transitions ONLY approved entries to promoted and preserves rejected/exploring', () => {
  const t1 = '2026-11-25T10:00:00.000Z';
  const t2 = '2026-11-25T12:00:00.000Z';

  let log = upsertDecisionEntry(
    [],
    {
      subjectType: 'effect-track',
      subjectId: 'organic-texture',
      trackId: 'organic-texture',
      title: 'Organic Textures & Paper Grain',
      variantLabel: 'Fine Cotton Rag',
      status: 'approved',
      parameters: { enabled: true, intensity: 4, secondary: 180 },
      paletteContext: 'cool',
      themeContext: 'light',
      rationale: 'Approved for promotion.',
    },
    t1,
  );

  log = upsertDecisionEntry(
    log,
    {
      subjectType: 'effect-track',
      subjectId: 'subtle-parallax',
      trackId: 'subtle-parallax',
      title: 'Subtle Parallax Depth',
      variantLabel: 'Gentle Media Drift',
      status: 'rejected',
      parameters: { enabled: true, intensity: 8, secondary: 50 },
      paletteContext: 'cool',
      themeContext: 'dark',
      rationale: 'Too distracting.',
    },
    t1,
  );

  log = upsertDecisionEntry(
    log,
    {
      subjectType: 'effect-track',
      subjectId: 'backdrop-blur',
      trackId: 'backdrop-blur',
      title: 'Blur & Backdrop Blur Materials',
      variantLabel: 'Thin Material (12px)',
      status: 'exploring',
      parameters: { enabled: true, intensity: 12, secondary: 82 },
      paletteContext: 'warm',
      themeContext: 'light',
      rationale: 'Still comparing.',
    },
    t1,
  );

  const { nextEntries, promotedCount } = promoteApprovedDecisions(log, t2);
  assert.equal(promotedCount, 1);

  const bySubject = new Map(nextEntries.map((entry) => [entry.subjectId, entry]));
  assert.equal(bySubject.get('organic-texture')?.status, 'promoted');
  assert.equal(bySubject.get('organic-texture')?.updatedAt, t2);
  assert.equal(bySubject.get('subtle-parallax')?.status, 'rejected');
  assert.equal(bySubject.get('subtle-parallax')?.updatedAt, t1);
  assert.equal(bySubject.get('backdrop-blur')?.status, 'exploring');
  assert.equal(bySubject.get('backdrop-blur')?.updatedAt, t1);

  // Re-running promotion when zero entries are approved is a clean no-op
  const secondPass = promoteApprovedDecisions(nextEntries, '2026-11-25T13:00:00.000Z');
  assert.equal(secondPass.promotedCount, 0);
});

test('P2.2: reading depth chapters, skim read time, and AudioPlayer narration segments stay strictly synchronized', () => {
  const skimChapters = getCaseStudyChaptersForDepth('skim');
  const fullChapters = getCaseStudyChaptersForDepth('full');

  assert.equal(skimChapters.length, 4);
  assert.equal(fullChapters.length, 7);

  for (const project of PROJECTS) {
    const fullMetrics = getCaseStudyMetrics(project);
    const skimMinutes = estimateSkimReadMinutes(project);
    assert.ok(skimMinutes >= 1, `${project.slug} skim minutes should be at least 1`);
    assert.ok(
      skimMinutes <= fullMetrics.readMinutes,
      `${project.slug} skim minutes (${skimMinutes}) should not exceed full minutes (${fullMetrics.readMinutes})`,
    );

    const skimSegments = buildCaseStudyNarrationSegments(project, 'skim');
    const fullSegments = buildCaseStudyNarrationSegments(project, 'full');

    assert.deepEqual(
      skimSegments.map((s) => s.id),
      skimChapters.map((c) => c.id),
    );
    assert.deepEqual(
      fullSegments.map((s) => s.id),
      fullChapters.map((c) => c.id),
    );
    assert.ok(skimSegments.every((s) => s.text.trim().length > 20));
    assert.ok(fullSegments.every((s) => s.text.trim().length > 20));
  }
});

test('P2.3: toast store enforces single non-stacking toast lifecycle and notifies subscribers', () => {
  resetToastForTest();
  assert.equal(getActiveToast(), null);

  let notifications = 0;
  const unsubscribe = subscribeToast(() => {
    notifications += 1;
  });

  const first = showToast({ message: 'Email copied to clipboard', tone: 'success' });
  assert.equal(getActiveToast()?.id, first.id);
  assert.equal(getActiveToast()?.message, 'Email copied to clipboard');
  assert.equal(notifications, 1);

  const second = showToast({ message: 'Switched to Dark mode', tone: 'info' });
  assert.equal(getActiveToast()?.id, second.id);
  assert.equal(getActiveToast()?.message, 'Switched to Dark mode');
  assert.equal(notifications, 2);

  dismissToast();
  assert.equal(getActiveToast(), null);
  assert.equal(notifications, 3);

  // Dismissing when already empty does not emit redundantly
  dismissToast();
  assert.equal(notifications, 3);

  unsubscribe();
  resetToastForTest();
});

test('P2.4: Command Palette searches public case studies, chapters, notes, and actions while strictly excluding /design-system', () => {
  const items = buildPublicCommandPaletteItems(PROJECTS, JOURNAL_NOTES, {
    soundEnabled: true,
    appearanceMode: 'system',
    largeText: false,
    focusMode: false,
  });

  // Zero private workshop paths or references anywhere in the index
  for (const item of items) {
    if (item.action.type === 'navigate') {
      assert.ok(
        !item.action.path.includes('design-system') &&
          !item.action.path.includes('toc-lab') &&
          !item.action.path.includes('/icons'),
        `Private route leaked into Command Palette: ${item.action.path}`,
      );
    }
  }

  // Searching internal workshop terms yields zero workshop routes
  for (const forbiddenQuery of ['design-system', 'workshop', 'toc lab', 'effects lab']) {
    const results = searchCommandPaletteItems(items, forbiddenQuery);
    assert.equal(
      results.length,
      0,
      `Query "${forbiddenQuery}" should not surface private workshop entries`,
    );
  }

  // Empty query prioritizes top-level items and hides verbose chapters until typed
  const initial = searchCommandPaletteItems(items, '');
  assert.ok(initial.some((item) => item.group === 'Case Studies'));
  assert.ok(initial.some((item) => item.group === 'Notes'));
  assert.ok(initial.some((item) => item.group === 'Actions'));
  assert.ok(initial.every((item) => item.group !== 'Chapters'));

  // Specific case study & chapter queries match accurately
  const stallMatches = searchCommandPaletteItems(items, 'stallsync exploration');
  assert.ok(
    stallMatches.some(
      (item) =>
        item.action.type === 'navigate' &&
        item.action.path === '/work/stallsync#exploration',
    ),
  );

  const emailAction = searchCommandPaletteItems(items, 'copy email');
  assert.ok(emailAction.some((item) => item.action.type === 'copy-email'));
});

test('P2.7: public PROJECTS contain zero fabricated beforeAfter image pairs', () => {
  for (const project of PROJECTS) {
    assert.equal(project.beforeAfter, undefined);
  }
});

test('P2.8: mobile bottom reading bar coordinates ref-counted visibility cleanly alongside floating AudioPlayer dock', () => {
  resetFloatingAudioDockForTest();
  assert.equal(isMobileReadingBarVisible(), false);

  setMobileReadingBarActive('case-study-mobile-bar', true);
  assert.equal(isMobileReadingBarVisible(), true);

  setMobileReadingBarActive('secondary-bar', true);
  setMobileReadingBarActive('case-study-mobile-bar', false);
  assert.equal(isMobileReadingBarVisible(), true);

  setMobileReadingBarActive('secondary-bar', false);
  assert.equal(isMobileReadingBarVisible(), false);

  resetFloatingAudioDockForTest();
});

test('P2.9: Reader Comfort preferences manage text size and focus mode cleanly without redundant emits', () => {
  resetReaderPreferencesForTest({ textSize: 'default', focusMode: false });
  assert.deepEqual(getReaderPreferences(), { textSize: 'default', focusMode: false });

  let notifications = 0;
  const unsubscribe = subscribeReaderPreferences(() => {
    notifications += 1;
  });

  setReaderTextSize('large');
  assert.equal(getReaderPreferences().textSize, 'large');
  assert.equal(notifications, 1);

  // Same value should not re-notify
  setReaderTextSize('large');
  assert.equal(notifications, 1);

  const toggled = toggleFocusReading();
  assert.equal(toggled, true);
  assert.equal(getReaderPreferences().focusMode, true);
  assert.equal(notifications, 2);

  setFocusReading(false);
  assert.equal(getReaderPreferences().focusMode, false);
  assert.equal(notifications, 3);

  unsubscribe();
  resetReaderPreferencesForTest();
});

test('P2.10: Hyderabad IST local time utility formats Asia/Kolkata UTC+5:30 accurately', () => {
  // 2026-06-15T12:00:00.000Z === 05:30:00 PM IST (Asia/Kolkata, UTC+5:30)
  const fixedUtc = new Date('2026-06-15T12:00:00.000Z');
  const formatted = formatHyderabadTime(fixedUtc);
  assert.match(formatted, /05:30:00\s*PM/);

  const snapshot = getHyderabadClockSnapshot(fixedUtc);
  assert.equal(snapshot.timezoneLabel, 'IST · UTC+5:30');
  assert.equal(snapshot.partOfDay, 'Evening');
  assert.ok(snapshot.dateString.includes('15'));
});

test('P3.1: WCAG 2.2 AA contrast audit passes >= 4.5:1 across all 100 Cool/Warm and Light/Dark token pairs (including semantic status tokens)', () => {
  const checks = auditThemeContrast();
  assert.equal(checks.length, 100);

  const failures = checks.filter((item) => !item.passesAA);
  assert.deepEqual(
    failures,
    [],
    `WCAG AA contrast failures detected: ${JSON.stringify(failures)}`,
  );

  // Sanity check standard black/white ratio calculation
  assert.equal(Math.round(contrastRatio('#000000', '#ffffff')), 21);
});

test('P3.2: resolveRouteSeo emits unique titles/descriptions, CreativeWork/Person JSON-LD, and strict noindex on /design-system and draft Notes', () => {
  const origin = 'https://aaravsen.design';

  const homeSeo = resolveRouteSeo({
    route: { page: 'home' },
    notes: JOURNAL_NOTES,
    origin,
  });
  const aboutSeo = resolveRouteSeo({
    route: { page: 'about' },
    notes: JOURNAL_NOTES,
    origin,
  });
  const contactSeo = resolveRouteSeo({
    route: { page: 'contact' },
    notes: JOURNAL_NOTES,
    origin,
  });
  const caseSeo = resolveRouteSeo({
    route: { page: 'case-study', slug: PROJECTS[0].slug },
    project: PROJECTS[0],
    notes: JOURNAL_NOTES,
    origin,
  });
  const notesIndexSeo = resolveRouteSeo({
    route: { page: 'notes' },
    notes: JOURNAL_NOTES,
    origin,
  });
  const draftNoteSeo = resolveRouteSeo({
    route: { page: 'note-detail', slug: JOURNAL_NOTES[0].slug },
    note: JOURNAL_NOTES[0],
    notes: JOURNAL_NOTES,
    origin,
  });
  const workshopSeo = resolveRouteSeo({
    route: { page: 'design-system', section: 'effects' },
    notes: JOURNAL_NOTES,
    origin,
  });

  // Unique titles across public pages
  const publicTitles = new Set([
    homeSeo.title,
    aboutSeo.title,
    contactSeo.title,
    caseSeo.title,
    notesIndexSeo.title,
  ]);
  assert.equal(publicTitles.size, 5);

  // Public pages indexable with appropriate Schema.org JSON-LD
  assert.equal(homeSeo.robots, 'index, follow');
  assert.ok(homeSeo.jsonLd && '@graph' in homeSeo.jsonLd);
  assert.equal(aboutSeo.robots, 'index, follow');
  assert.equal(aboutSeo.jsonLd?.['@type'], 'ProfilePage');
  assert.equal(contactSeo.robots, 'index, follow');
  assert.equal(contactSeo.jsonLd?.['@type'], 'ContactPage');
  assert.equal(caseSeo.robots, 'index, follow');
  assert.equal(caseSeo.jsonLd?.['@type'], 'CreativeWork');

  // Draft notes and private workshop strictly excluded from indexing
  assert.equal(notesIndexSeo.robots, 'noindex, follow');
  assert.equal(notesIndexSeo.jsonLd, null);
  assert.equal(draftNoteSeo.robots, 'noindex, nofollow');
  assert.equal(draftNoteSeo.jsonLd, null);
  assert.equal(workshopSeo.robots, 'noindex, nofollow');
  assert.equal(workshopSeo.jsonLd, null);
});

test('P3.3: privacy-respecting analytics stays disabled without credentials and strictly excludes /design-system and internal lab routes', () => {
  assert.equal(getAnalyticsConfig({ apiKey: '' }).enabled, false);
  assert.equal(getAnalyticsConfig({ apiKey: 'MY_POSTHOG_PROJECT_API_KEY' }).enabled, false);
  assert.equal(getAnalyticsConfig({ apiKey: 'your_key_here' }).enabled, false);

  const liveCfg = getAnalyticsConfig({
    apiKey: 'phc_example_live_key_12345',
    host: 'https://eu.i.posthog.com/',
  });
  assert.equal(liveCfg.enabled, true);
  assert.equal(liveCfg.host, 'https://eu.i.posthog.com');

  assert.equal(isAnalyticsPathAllowed('/'), true);
  assert.equal(isAnalyticsPathAllowed('/work/stallsync'), true);
  assert.equal(isAnalyticsPathAllowed('/about'), true);
  assert.equal(isAnalyticsPathAllowed('/contact'), true);
  assert.equal(isAnalyticsPathAllowed('/design-system'), false);
  assert.equal(isAnalyticsPathAllowed('/design-system/effects'), false);
  assert.equal(isAnalyticsPathAllowed('/toc-lab'), false);
  assert.equal(isAnalyticsPathAllowed('/icons'), false);
});

test('P3.5: Recruiter Shortlist validates slugs, round-trips shareable URLs, and notifies subscribers cleanly', () => {
  const parsed = parseShortlistFromSearch(
    '?shortlist=stallsync,hubapps,invalid-slug,STALLSYNC',
  );
  assert.deepEqual(parsed, ['stallsync', 'hubapps']);

  const shareUrl = buildShortlistShareUrl('https://aaravsen.design/', parsed);
  assert.equal(
    shareUrl,
    'https://aaravsen.design/?shortlist=stallsync%2Chubapps',
  );
  const roundTripped = parseShortlistFromSearch(new URL(shareUrl).search);
  assert.deepEqual(roundTripped, ['stallsync', 'hubapps']);

  resetShortlistForTest([]);
  let updates = 0;
  const unsubscribe = subscribeShortlist(() => {
    updates += 1;
  });

  assert.equal(toggleShortlistSlug('stallsync'), true);
  assert.deepEqual([...getShortlistSlugs()], ['stallsync']);
  assert.equal(updates, 1);

  assert.equal(toggleShortlistSlug('precognition-labs'), true);
  assert.deepEqual([...getShortlistSlugs()], ['stallsync', 'precognition-labs']);
  assert.equal(updates, 2);

  assert.equal(toggleShortlistSlug('stallsync'), false);
  assert.deepEqual([...getShortlistSlugs()], ['precognition-labs']);
  assert.equal(updates, 3);

  clearShortlist();
  assert.deepEqual([...getShortlistSlugs()], []);
  assert.equal(updates, 4);

  unsubscribe();
  resetShortlistForTest([]);
});

test('Final QA: unknown project/note slugs and invalid paths fall back safely without broken SEO metadata', () => {
  assert.equal(getProjectBySlug(PROJECTS, 'does-not-exist'), undefined);
  assert.equal(getNoteBySlug(JOURNAL_NOTES, 'does-not-exist'), undefined);

  const missingCaseSeo = resolveRouteSeo({
    route: parseRoute('/work/does-not-exist'),
    project: undefined,
    notes: JOURNAL_NOTES,
    origin: 'https://aaravsen.design',
  });
  assert.equal(missingCaseSeo.canonicalPath, '/');
  assert.equal(missingCaseSeo.robots, 'index, follow');

  const missingNoteSeo = resolveRouteSeo({
    route: parseRoute('/notes/does-not-exist'),
    note: undefined,
    notes: JOURNAL_NOTES,
    origin: 'https://aaravsen.design',
  });
  assert.equal(missingNoteSeo.canonicalPath, '/');

  assert.deepEqual(parseRoute('/unknown/deep/path'), { page: 'home' });
  assert.deepEqual(parseRoute('/design-system/effects'), {
    page: 'design-system',
    section: 'effects',
  });
});

test('Final QA: static index.html JSON-LD, robots.txt, sitemap.xml, and all project images are valid and consistent', () => {
  const rootDir = path.resolve(import.meta.dirname, '../..');

  // 1. Every coverImage and gallery src in PROJECTS exists on disk
  for (const project of PROJECTS) {
    const coverPath = path.join(rootDir, project.coverImage.replace(/^\//, ''));
    assert.equal(
      fs.existsSync(coverPath),
      true,
      `Missing cover image on disk: ${project.coverImage}`,
    );
    for (const item of project.solution.gallery) {
      const galleryPath = path.join(rootDir, item.src.replace(/^\//, ''));
      assert.equal(
        fs.existsSync(galleryPath),
        true,
        `Missing gallery image on disk: ${item.src}`,
      );
    }
  }

  // 2. index.html static JSON-LD parses validly and matches SITE_CONFIG.socials
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const jsonLdMatch = indexHtml.match(
    /<script type="application\/ld\+json" data-seo-jsonld="true">([\s\S]*?)<\/script>/,
  );
  assert.ok(jsonLdMatch, 'Static JSON-LD script missing from index.html');
  const parsedLd = JSON.parse(jsonLdMatch[1]) as {
    '@graph': Array<{ '@type': string; sameAs?: string[] }>;
  };
  const personNode = parsedLd['@graph'].find((n) => n['@type'] === 'Person');
  assert.ok(personNode, 'Person schema missing in index.html JSON-LD');
  assert.deepEqual(
    personNode.sameAs,
    SITE_CONFIG.socials.map((s) => s.href),
  );

  // 3. robots.txt explicitly disallows /design-system and legacy lab routes
  const robotsTxt = fs.readFileSync(
    path.join(rootDir, 'public/robots.txt'),
    'utf8',
  );
  assert.ok(robotsTxt.includes('Disallow: /design-system'));
  assert.ok(robotsTxt.includes('Disallow: /toc-lab'));
  assert.ok(robotsTxt.includes('Disallow: /icons'));

  // 4. sitemap.xml contains all 6 published case studies and excludes /design-system
  const sitemapXml = fs.readFileSync(
    path.join(rootDir, 'public/sitemap.xml'),
    'utf8',
  );
  for (const project of PROJECTS) {
    assert.ok(
      sitemapXml.includes(`/work/${project.slug}</loc>`),
      `Missing /work/${project.slug} in sitemap.xml`,
    );
  }
  assert.equal(sitemapXml.includes('/design-system</loc>'), false);
  assert.equal(sitemapXml.includes('/notes/</loc>'), false);
});

test('AudioPlayer speech quality: prioritizes Google & Apple neural voices, calibrates rate/pitch/volume, cleans prose, splits safe chunks, and builds deterministic waveform profile', () => {
  const sampleVoices = [
    { name: 'Albert', lang: 'en-US', voiceURI: 'albert', localService: true },
    { name: 'Bad News', lang: 'en-US', voiceURI: 'bad-news', localService: true },
    { name: 'Bells', lang: 'en-US', voiceURI: 'bells', localService: true },
    { name: 'Zarvox', lang: 'en-US', voiceURI: 'zarvox', localService: true },
    { name: 'Samantha (Compact)', lang: 'en-US', voiceURI: 'com.apple.voice.compact.en-US.Samantha', localService: true },
    { name: 'Samantha', lang: 'en-US', voiceURI: 'com.apple.speech.synthesis.voice.samantha', localService: true },
    { name: 'Ava (Premium)', lang: 'en-US', voiceURI: 'com.apple.voice.premium.en-US.Ava', localService: true },
    { name: 'Google US English', lang: 'en-US', voiceURI: 'google-us', localService: false },
    { name: 'Microsoft Aria Online (Natural) - English (United States)', lang: 'en-US', voiceURI: 'ms-aria', localService: false },
    { name: 'Microsoft David', lang: 'en-US', voiceURI: 'ms-david', localService: true },
  ];

  const ranked = rankSpeechVoices(sampleVoices);
  const names = ranked.map((r) => r.voice.name);

  // Novelty / joke voices must be completely filtered out
  assert.equal(names.includes('Albert'), false);
  assert.equal(names.includes('Bad News'), false);
  assert.equal(names.includes('Bells'), false);
  assert.equal(names.includes('Zarvox'), false);

  // Google & Apple neural voices must rank ahead of Microsoft / standard / compact voices
  const topTwoUris = [ranked[0].voice.voiceURI, ranked[1].voice.voiceURI];
  assert.ok(topTwoUris.includes('google-us'), 'Google US English should be in top two');
  assert.ok(
    topTwoUris.includes('com.apple.voice.premium.en-US.Ava'),
    'Apple Premium neural voice should be in top two',
  );
  assert.equal(ranked[2].voice.voiceURI, 'ms-aria');
  assert.equal(ranked[3].voice.voiceURI, 'com.apple.speech.synthesis.voice.samantha');

  // Provider detection classifies Google, Apple, Neural, and System accurately
  assert.equal(detectVoiceProvider(sampleVoices[7]), 'google');
  assert.equal(detectVoiceProvider(sampleVoices[6]), 'apple');
  assert.equal(detectVoiceProvider(sampleVoices[8]), 'neural');
  assert.equal(detectVoiceProvider(sampleVoices[9]), 'system');

  // Calibrated speech parameters explicitly set rate, pitch, volume, and lang per provider
  const googleParams = computeCalibratedSpeechParams(
    DEFAULT_SPEECH_TUNING,
    sampleVoices[7],
  );
  assert.equal(googleParams.rate, 0.97);
  assert.equal(googleParams.pitch, 0.98);
  assert.equal(googleParams.volume, 1);
  assert.equal(googleParams.lang, 'en-US');

  const systemParams = computeCalibratedSpeechParams(
    { rate: 1, pitch: 0.98, volume: 0.85 },
    sampleVoices[9],
  );
  assert.equal(systemParams.rate, 0.94);
  assert.equal(systemParams.pitch, 0.96);
  assert.equal(systemParams.volume, 0.85);

  // Spoken prose cleaner removes double periods, em-dashes, middle dots, and awkward tokens
  const cleaned = prepareTextForSpeech(
    'StallSync.. UI/UX · 3m × 3m — calm density & ±15s skip',
  );
  assert.equal(cleaned.includes('..'), false);
  assert.equal(cleaned.includes('·'), false);
  assert.equal(cleaned.includes('—'), false);
  assert.ok(cleaned.includes('UI and UX'));
  assert.ok(cleaned.includes('3m by 3m'));
  assert.ok(cleaned.includes('plus or minus 15 seconds'));

  // Sentence chunker breaks long prose into <= 190 char Chrome-safe chunks
  const longChapter =
    'Operational tools rarely fail because they show too much information. They fail when every metric, status badge, and button shouts at the exact same visual volume across an eight-hour workday, forcing operators to re-parse inconsistent typography, competing border weights, and saturated pills on every single row without a predictable spatial anchor. Pairing a steady primary canvas with a predictable detail inspector restores clarity immediately.';
  const chunks = splitIntoSpeechChunks(longChapter, 190);
  assert.ok(chunks.length >= 3);
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 190, `Chunk exceeded 190 chars: ${chunk.length}`);
  }

  // Deterministic waveform profile generator outputs sculpted amplitudes in [0.18, 0.92]
  const sampleSegments = [
    { id: 'overview', num: '01', title: 'Overview', text: longChapter },
    { id: 'challenge', num: '02', title: 'Challenge', text: cleaned },
  ];
  const profileA = buildWaveformProfile(sampleSegments, 44);
  const profileB = buildWaveformProfile(sampleSegments, 44);
  assert.equal(profileA.length, 44);
  assert.deepEqual(profileA, profileB);
  for (const amp of profileA) {
    assert.ok(amp >= 0.18 && amp <= 0.92, `Amplitude out of bounds: ${amp}`);
  }
});

test('Cycle 2 Stage 1: Portfolio Studio first-class navigation, 5-group IA, 16 routes, and noindex metadata', () => {
  // 1. Primary navigation always includes "Design System" linking to /design-system
  const primaryNav = getPrimaryNavItems();
  assert.deepEqual(
    primaryNav.map((i) => i.label),
    ['Work', 'Notes', 'About', 'Contact', 'Design System'],
  );
  const studioNavItem = primaryNav.find((i) => i.label === 'Design System');
  assert.ok(studioNavItem);
  assert.equal(studioNavItem.path, '/design-system');
  assert.equal(
    studioNavItem.match({ page: 'design-system', section: 'typography' }),
    true,
  );
  assert.equal(studioNavItem.match({ page: 'home' }), false);

  // 2. Portfolio Studio IA has 5 groups, 16 unique destinations (12 live, 4 planned)
  assert.deepEqual(
    STUDIO_NAV_GROUPS.map((g) => g.label),
    ['Foundations', 'Library', 'Behaviour', 'Exploration', 'System'],
  );
  const destinations = getAllStudioDestinations();
  assert.equal(destinations.length, 16);
  assert.equal(new Set(destinations.map((d) => d.id)).size, 16);
  assert.equal(new Set(destinations.map((d) => d.path)).size, 16);

  const liveDestinations = destinations.filter((d) => d.status === 'live');
  const plannedDestinations = destinations.filter((d) => d.status === 'planned');
  assert.equal(liveDestinations.length, 12);
  assert.deepEqual(
    plannedDestinations.map((d) => d.id),
    ['patterns', 'page-templates', 'experiments', 'documentation'],
  );

  // 3. Every Studio destination resolves unconditionally and emits noindex, nofollow with zero JSON-LD
  for (const dest of destinations) {
    assert.deepEqual(parseRoute(dest.path), {
      page: 'design-system',
      section: dest.id,
    });

    const seo = resolveRouteSeo({
      route: { page: 'design-system', section: dest.id },
      notes: JOURNAL_NOTES,
      origin: 'https://aaravsen.design',
    });
    assert.equal(seo.robots, 'noindex, nofollow');
    assert.equal(seo.jsonLd, null);
    assert.ok(seo.title.includes(dest.label));
    assert.equal(getStudioDestination(dest.id).id, dest.id);
  }

  // Legacy aliases & unknown sub-routes remain supported
  assert.deepEqual(parseRoute('/design-system/overview'), {
    page: 'design-system',
    section: 'overview',
  });
  assert.deepEqual(parseRoute('/design-system/unknown-subroute'), {
    page: 'design-system',
    section: 'overview',
  });
});

test('Cycle 2 Stage 2: Foundations reference catalog matches src/index.css verbatim, computes exact WCAG & responsive clamp math, and documents all real codebase gaps', () => {
  const rootDir = path.resolve(import.meta.dirname, '../..');
  const indexCss = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');

  // 1. Every documented CSS custom property in COLOR_TOKENS, EDITORIAL_MEASURES, and ELEVATION_LEVELS exists in src/index.css
  for (const token of COLOR_TOKENS) {
    assert.ok(
      indexCss.includes(`${token.token}:`),
      `Color token missing from src/index.css: ${token.token}`,
    );
  }
  for (const measure of EDITORIAL_MEASURES) {
    assert.ok(
      indexCss.includes(`${measure.token}:`),
      `Measure token missing from src/index.css: ${measure.token}`,
    );
  }
  for (const elev of ELEVATION_LEVELS) {
    assert.ok(
      indexCss.includes(`${elev.token}:`),
      `Shadow token missing from src/index.css: ${elev.token}`,
    );
  }

  // 2. Documented secondary ink matches P3.1 WCAG-calibrated values (#58585d cool-light, #57534b warm-light)
  const secondaryInk = COLOR_TOKENS.find(
    (t) => t.token === '--apple-label-secondary',
  );
  assert.ok(secondaryInk);
  assert.equal(getTokenValueForMatrix(secondaryInk, 'cool', 'light'), '#58585d');
  assert.equal(getTokenValueForMatrix(secondaryInk, 'warm', 'light'), '#57534b');

  // 3. Contrast evaluator classifies AA/AAA/Fail accurately
  const highContrast = evaluateContrastPair('#1d1d1f', '#ffffff');
  assert.equal(highContrast.aaNormal, true);
  assert.equal(highContrast.aaaNormal, true);
  assert.equal(highContrast.grade, 'AAA');

  const btnContrast = evaluateContrastPair('#ffffff', '#0071e3');
  assert.equal(btnContrast.aaNormal, true);
  assert.equal(btnContrast.grade, 'AA');

  const failingPair = evaluateContrastPair('#8e8e93', '#ffffff');
  assert.equal(failingPair.aaNormal, false);

  // 4. Responsive typography clamp calculator matches production clamp() bounds and Reader Comfort Large overrides
  const displayStyle = TYPOGRAPHY_STYLES.find((t) => t.id === 'display');
  const bodyStyle = TYPOGRAPHY_STYLES.find((t) => t.id === 'body');
  assert.ok(displayStyle && bodyStyle);
  assert.equal(computeTypeSizeAtViewport(displayStyle, 375, false), 44);
  assert.equal(computeTypeSizeAtViewport(displayStyle, 1440, false), 72);
  assert.equal(computeTypeSizeAtViewport(bodyStyle, 1440, false), 17);
  assert.equal(computeTypeSizeAtViewport(bodyStyle, 1440, true), 19);

  // 5. All five foundation domains have complete reference coverage and transparent gaps per domain
  assert.equal(FONT_FAMILIES.length, 3);
  assert.equal(TYPOGRAPHY_STYLES.length, 11);
  assert.equal(SPACING_SCALE.length, 10);
  assert.equal(LAYOUT_TOKENS.length, 6);
  assert.equal(RESPONSIVE_BREAKPOINTS.length, 5);
  assert.equal(RADIUS_SCALE.length, 7);
  assert.equal(ELEVATION_LEVELS.length, 7);
  assert.equal(FOUNDATION_GAPS.length, 7);

  for (const domain of [
    'colour-themes',
    'typography',
    'spacing-layout',
    'surfaces-elevation',
  ] as const) {
    assert.ok(
      getGapsByDomain(domain).length >= 1,
      `Expected documented gap audit entries for ${domain}`,
    );
  }
});

test('Cycle 2 Stage 2.5: Foundation gap resolution achieves 4-matrix sandbox parity, adds AA status tokens, aligns base h4 to SF Pro Text, and avoids unnecessary token bloat', () => {
  const rootDir = path.resolve(import.meta.dirname, '../..');
  const indexCss = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');

  // 1. Extract the 4 isolated [data-ds-sandbox] CSS blocks
  const sandboxSelectors = [
    "[data-ds-sandbox][data-ds-palette='cool'][data-ds-theme='light']",
    "[data-ds-sandbox][data-ds-palette='cool'][data-ds-theme='dark']",
    "[data-ds-sandbox][data-ds-palette='warm'][data-ds-theme='light']",
    "[data-ds-sandbox][data-ds-palette='warm'][data-ds-theme='dark']",
  ] as const;

  const requiredParityTokens = [
    '--apple-success:',
    '--apple-warning:',
    '--apple-info:',
    '--apple-input-disabled-bg:',
    '--apple-focus-ring:',
    '--apple-error-ring:',
    '--shadow-apple-subtle:',
    '--shadow-apple-card:',
    '--shadow-apple-card-hover:',
    '--shadow-apple-pill:',
    '--shadow-apple-ios-bar:',
    '--shadow-apple-nav:',
    '--shadow-apple-modal:',
  ] as const;

  for (const selector of sandboxSelectors) {
    const startIdx = indexCss.indexOf(selector);
    assert.ok(startIdx !== -1, `Missing sandbox selector: ${selector}`);
    const endIdx = indexCss.indexOf('}', startIdx);
    const block = indexCss.slice(startIdx, endIdx + 1);
    for (const token of requiredParityTokens) {
      assert.ok(
        block.includes(token),
        `Sandbox ${selector} missing ${token}`,
      );
    }
  }

  // 2. Semantic status tokens exist on :root and .dark as well
  const rootBlock = indexCss.slice(indexCss.indexOf(':root {'), indexCss.indexOf('}', indexCss.indexOf(':root {')) + 1);
  const darkBlock = indexCss.slice(indexCss.indexOf('.dark {'), indexCss.indexOf('}', indexCss.indexOf('.dark {')) + 1);
  for (const statusToken of ['--apple-success:', '--apple-warning:', '--apple-info:']) {
    assert.ok(rootBlock.includes(statusToken), `:root missing ${statusToken}`);
    assert.ok(darkBlock.includes(statusToken), `.dark missing ${statusToken}`);
  }

  // 3. Base h4 matches .type-headline on var(--font-sf-text)
  const h4Match = indexCss.match(/\bh4\s*\{([^}]+)\}/);
  assert.ok(h4Match, 'Missing base h4 rule in src/index.css');
  assert.ok(
    h4Match[1].includes('font-family: var(--font-sf-text)'),
    'Base h4 should use var(--font-sf-text) to match .type-headline (<20pt optical rule)',
  );

  // 4. Retained conventions did not introduce redundant CSS custom properties
  assert.equal(indexCss.includes('--font-sf-mono:'), false);
  assert.equal(indexCss.includes('--radius-sm:'), false);
  assert.equal(indexCss.includes('--container-editorial:'), false);

  // 5. Foundations catalog & gap ledger reflect 4 resolved + 3 retained decisions cleanly
  assert.equal(COLOR_TOKENS.length, 31);
  assert.equal(
    COLOR_TOKENS.filter((t) => t.sandboxParityGap).length,
    0,
  );
  assert.equal(
    ELEVATION_LEVELS.filter((e) => e.sandboxParityGap).length,
    0,
  );
  assert.equal(
    FOUNDATION_GAPS.filter((g) => g.resolution === 'fixed').length,
    4,
  );
  assert.equal(
    FOUNDATION_GAPS.filter((g) => g.resolution === 'retained').length,
    3,
  );
});

test('Cycle 2 Stage 3: Component Library catalog covers all 8 categories, complete 13-point documentation, verified source files, and valid CSS tokens', () => {
  const rootDir = path.resolve(import.meta.dirname, '../..');
  const indexCss = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');

  // 1. All 8 categories (A–H) present and well-populated
  assert.equal(COMPONENT_CATEGORIES.length, 8);
  assert.deepEqual(
    COMPONENT_CATEGORIES.map((c) => c.code),
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  );

  const counts = getComponentCountsByCategory(COMPONENT_LIBRARY_ITEMS);
  for (const cat of COMPONENT_CATEGORIES) {
    assert.ok(
      counts[cat.id] >= 3,
      `Expected category ${cat.code} (${cat.id}) to document at least 3 components, got ${counts[cat.id]}`,
    );
  }

  // 2. Production vs Experimental honesty & Excluded ledger
  const productionItems = COMPONENT_LIBRARY_ITEMS.filter(
    (item) => item.status === 'production',
  );
  const experimentalItems = COMPONENT_LIBRARY_ITEMS.filter(
    (item) => item.status === 'experimental',
  );
  assert.equal(COMPONENT_LIBRARY_ITEMS.length, 41);
  assert.equal(productionItems.length, 40);
  assert.equal(experimentalItems.length, 1);
  assert.equal(EXCLUDED_COMPONENTS.length, 5);

  // 3. Every component satisfies 13-point documentation + real disk path + real CSS custom properties
  const seenIds = new Set<string>();
  for (const item of COMPONENT_LIBRARY_ITEMS) {
    assert.equal(seenIds.has(item.id), false, `Duplicate component id: ${item.id}`);
    seenIds.add(item.id);

    assert.ok(item.name.trim().length > 0, `${item.id} missing name`);
    assert.ok(item.purpose.trim().length > 15, `${item.id} missing purpose`);
    assert.ok(item.anatomy.length >= 2, `${item.id} missing anatomy`);
    assert.ok(item.variants.length >= 1, `${item.id} missing variants`);
    assert.ok(item.interactionStates.length >= 1, `${item.id} missing interactionStates`);
    assert.ok(item.behavior.trim().length > 15, `${item.id} missing behavior`);
    assert.ok(item.animation.trim().length > 10, `${item.id} missing animation`);
    assert.ok(
      item.responsiveBehavior.trim().length > 15,
      `${item.id} missing responsiveBehavior`,
    );
    assert.ok(item.accessibility.length >= 2, `${item.id} missing accessibility`);
    assert.ok(item.tokensUsed.length >= 2, `${item.id} missing tokensUsed`);
    assert.ok(item.usageGuidance.length >= 2, `${item.id} missing usageGuidance`);
    assert.ok(item.doDonts.length >= 1, `${item.id} missing doDonts`);
    assert.ok(
      item.implementation.exportName.trim().length > 0 &&
        item.implementation.snippet.trim().length > 0,
      `${item.id} missing implementation reference`,
    );

    const diskPath = path.join(rootDir, item.implementation.sourcePath);
    assert.ok(
      fs.existsSync(diskPath),
      `${item.id} references non-existent sourcePath: ${item.implementation.sourcePath}`,
    );

    for (const token of item.tokensUsed) {
      if (token.startsWith('--')) {
        assert.ok(
          indexCss.includes(`${token}:`),
          `${item.id} references CSS custom property not declared in src/index.css: ${token}`,
        );
      }
    }
  }

  // 4. Filter helper works accurately across category, status, and keyword query
  const onlyExperimental = filterComponentLibraryItems(COMPONENT_LIBRARY_ITEMS, {
    status: 'experimental',
  });
  assert.equal(onlyExperimental.length, 1);
  assert.equal(onlyExperimental[0].id, 'checkbox-radio-experimental');

  const audioMatches = filterComponentLibraryItems(COMPONENT_LIBRARY_ITEMS, {
    query: 'AudioWaveform',
  });
  assert.ok(audioMatches.some((item) => item.id === 'audio-player-waveform'));

  const navOnly = filterComponentLibraryItems(COMPONENT_LIBRARY_ITEMS, {
    categoryId: 'navigation',
    status: 'production',
  });
  assert.equal(navOnly.length, counts.navigation);
});







