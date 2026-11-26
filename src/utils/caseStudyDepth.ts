import type { CaseStudyProject } from '../data/projects';
import type { TocChapter } from '../components/TableOfContents';
import { countWords, estimateReadMinutes } from './portfolio';
import type { NarrationSegment } from './readAloud';

export type ReadingDepthMode = 'skim' | 'full';

export const FULL_CASE_STUDY_CHAPTERS: readonly TocChapter[] = [
  { id: 'overview', num: '01', label: 'Overview' },
  { id: 'challenge', num: '02', label: 'The Challenge' },
  { id: 'understanding', num: '03', label: 'Understanding' },
  { id: 'approach', num: '04', label: 'Design Approach' },
  { id: 'exploration', num: '05', label: 'Exploration' },
  { id: 'solution', num: '06', label: 'The Solution' },
  { id: 'reflections', num: '07', label: 'Reflections' },
] as const;

export const SKIM_CASE_STUDY_CHAPTERS: readonly TocChapter[] = [
  { id: 'overview', num: '01', label: 'Overview & Scope' },
  { id: 'challenge', num: '02', label: 'Problem & Context' },
  { id: 'exploration', num: '03', label: 'Key Decisions' },
  { id: 'solution', num: '04', label: 'Prototype & Visuals' },
] as const;

export function getCaseStudyChaptersForDepth(
  mode: ReadingDepthMode,
): readonly TocChapter[] {
  return mode === 'skim' ? SKIM_CASE_STUDY_CHAPTERS : FULL_CASE_STUDY_CHAPTERS;
}

/**
 * Estimates reading time for the concise 2-Min Skim view using only the
 * narrative blocks actually displayed in skim mode (honest word count).
 */
export function estimateSkimReadMinutes(project: CaseStudyProject): number {
  const finalIteration =
    project.exploration.iterations[project.exploration.iterations.length - 1];

  const blocks: string[] = [
    project.title,
    project.tagline,
    project.overview.tldr,
    project.overview.context,
    ...project.overview.deliverables,
    ...project.overview.focusAreas,
    project.challenge.heading,
    project.challenge.paragraphs[0] ?? '',
    project.challenge.highlightStatement,
    project.exploration.heading,
    ...(finalIteration ? [finalIteration.stage, finalIteration.decision] : []),
    ...project.approach.principles.map((p) => `${p.title} ${p.description}`),
    project.solution.heading,
    project.solution.intro,
    project.solution.prototypeTitle,
    project.solution.prototypeCaption,
    ...project.solution.highlights.map((h) => `${h.title} ${h.body}`),
  ];

  const words = countWords(blocks);
  return Math.max(1, estimateReadMinutes([words > 0 ? blocks.join(' ') : '']));
}

/**
 * Builds AudioPlayer narration segments synchronized with the currently
 * selected reading depth (2-Min Skim vs. Full Story) so scrubbing and active
 * section highlights always match rendered sections on the page.
 */
export function buildCaseStudyNarrationSegments(
  project: CaseStudyProject,
  mode: ReadingDepthMode,
): NarrationSegment[] {
  if (mode === 'skim') {
    const finalIteration =
      project.exploration.iterations[project.exploration.iterations.length - 1];
    return [
      {
        id: 'overview',
        num: '01',
        title: 'Overview & Scope',
        text: `${project.title}. ${project.tagline}. ${project.overview.tldr} ${project.overview.context}`,
      },
      {
        id: 'challenge',
        num: '02',
        title: 'Problem & Context',
        text: `${project.challenge.heading}. ${project.challenge.paragraphs[0] ?? ''} ${project.challenge.highlightStatement}`,
      },
      {
        id: 'exploration',
        num: '03',
        title: 'Key Decisions',
        text: `${project.approach.principles.map((p) => `${p.title}. ${p.description}`).join(' ')} ${
          finalIteration
            ? `Final direction: ${finalIteration.stage}. ${finalIteration.decision}`
            : ''
        }`,
      },
      {
        id: 'solution',
        num: '04',
        title: 'Prototype & Visuals',
        text: `${project.solution.heading}. ${project.solution.intro} ${project.solution.highlights.map((h) => `${h.title}. ${h.body}`).join(' ')}`,
      },
    ];
  }

  return [
    {
      id: 'overview',
      num: '01',
      title: 'Overview',
      text: `${project.title}. ${project.tagline}. ${project.overview.tldr} ${project.overview.context}`,
    },
    {
      id: 'challenge',
      num: '02',
      title: 'The Challenge',
      text: `${project.challenge.heading}. ${project.challenge.paragraphs.join(' ')}`,
    },
    {
      id: 'understanding',
      num: '03',
      title: 'Understanding',
      text: `${project.understanding.heading}. ${project.understanding.intro} ${project.understanding.insights.map((i) => `${i.title}. ${i.detail}`).join(' ')}`,
    },
    {
      id: 'approach',
      num: '04',
      title: 'Design Approach',
      text: `${project.approach.heading}. ${project.approach.paragraphs.join(' ')} ${project.approach.principles.map((p) => `${p.title}. ${p.description}`).join(' ')}`,
    },
    {
      id: 'exploration',
      num: '05',
      title: 'Exploration',
      text: `${project.exploration.heading}. ${project.exploration.intro} ${project.exploration.iterations.map((it) => `${it.stage}. ${it.summary} ${it.decision}`).join(' ')}`,
    },
    {
      id: 'solution',
      num: '06',
      title: 'The Solution',
      text: `${project.solution.heading}. ${project.solution.intro} ${project.solution.highlights.map((h) => `${h.title}. ${h.body}`).join(' ')}`,
    },
    {
      id: 'reflections',
      num: '07',
      title: 'Reflections',
      text: `${project.reflections.heading}. ${project.reflections.summary} ${project.reflections.learnings.join(' ')} ${project.reflections.nextDirections}`,
    },
  ];
}
