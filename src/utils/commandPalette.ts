import type { CaseStudyProject } from '../data/projects';
import type { JournalArticle } from '../data/notes';
import { FULL_CASE_STUDY_CHAPTERS } from './caseStudyDepth';

export type CommandItemGroup =
  | 'Case Studies'
  | 'Chapters'
  | 'Notes'
  | 'Pages'
  | 'Actions';

export type CommandItemAction =
  | { type: 'navigate'; path: string }
  | { type: 'copy-email' }
  | { type: 'set-appearance'; mode: 'light' | 'system' | 'dark' }
  | { type: 'toggle-sound' }
  | { type: 'toggle-text-size' }
  | { type: 'toggle-focus-reading' }
  | { type: 'open-colophon' };

export interface CommandPaletteItem {
  id: string;
  group: CommandItemGroup;
  title: string;
  subtitle: string;
  keywords: string;
  action: CommandItemAction;
}

/**
 * Builds the strictly PUBLIC Command Palette search index (P2.4).
 * Never includes /design-system, TOC Lab, Icons, or any private workshop routes.
 */
export function buildPublicCommandPaletteItems(
  projects: readonly CaseStudyProject[],
  notes: readonly JournalArticle[],
  context: {
    soundEnabled: boolean;
    appearanceMode: 'light' | 'system' | 'dark';
    largeText: boolean;
    focusMode: boolean;
  },
): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];

  // 1. Public Pages
  items.push(
    {
      id: 'page-home',
      group: 'Pages',
      title: 'Home',
      subtitle: 'Introduction & featured case studies',
      keywords: 'home start landing portfolio featured',
      action: { type: 'navigate', path: '/' },
    },
    {
      id: 'page-work',
      group: 'Pages',
      title: 'Work',
      subtitle: 'Complete case study archive with filters & sorting',
      keywords: 'work portfolio showcase projects archive case studies',
      action: { type: 'navigate', path: '/work' },
    },
    {
      id: 'page-notes',
      group: 'Pages',
      title: 'Notes',
      subtitle: 'Design writing & working drafts',
      keywords: 'notes journal essays articles writing',
      action: { type: 'navigate', path: '/notes' },
    },
    {
      id: 'page-about',
      group: 'Pages',
      title: 'About & Resume',
      subtitle: 'Background, practice timeline, stack & printable resume',
      keywords: 'about bio background resume cv timeline print experience',
      action: { type: 'navigate', path: '/about' },
    },
    {
      id: 'page-contact',
      group: 'Pages',
      title: 'Contact',
      subtitle: 'Start a project inquiry or email directly',
      keywords: 'contact email hire inquiry availability ist hyderabad',
      action: { type: 'navigate', path: '/contact' },
    },
  );

  // 2. Case Studies
  for (const project of projects) {
    items.push({
      id: `project-${project.slug}`,
      group: 'Case Studies',
      title: project.title,
      subtitle: `${project.category} · ${project.year} · ${project.platform}`,
      keywords: [
        project.title,
        project.category,
        project.platform,
        project.role,
        project.tagline,
        project.shortDescription,
        ...(project.credits?.tools ?? []),
      ].join(' '),
      action: { type: 'navigate', path: `/work/${project.slug}` },
    });
  }

  // 3. Case Study Chapters
  for (const project of projects) {
    for (const chapter of FULL_CASE_STUDY_CHAPTERS) {
      items.push({
        id: `chapter-${project.slug}-${chapter.id}`,
        group: 'Chapters',
        title: `${project.title} · ${chapter.num} ${chapter.label}`,
        subtitle: `Jump to ${chapter.label} in ${project.title}`,
        keywords: `${project.title} ${chapter.label} ${chapter.num} chapter section`,
        action: { type: 'navigate', path: `/work/${project.slug}#${chapter.id}` },
      });
    }
  }

  // 4. Design Notes
  for (const note of notes) {
    items.push({
      id: `note-${note.slug}`,
      group: 'Notes',
      title: note.title,
      subtitle: `${note.status === 'draft' ? 'Draft · ' : ''}${note.topic}`,
      keywords: `${note.title} ${note.subtitle} ${note.topic} ${note.tags.join(' ')}`,
      action: { type: 'navigate', path: `/notes/${note.slug}` },
    });
  }

  // 5. Actions
  items.push(
    {
      id: 'action-copy-email',
      group: 'Actions',
      title: 'Copy Email Address',
      subtitle: 'Copy direct contact email to clipboard',
      keywords: 'copy email mail clipboard contact',
      action: { type: 'copy-email' },
    },
    {
      id: 'action-theme-light',
      group: 'Actions',
      title: 'Switch Appearance to Light',
      subtitle:
        context.appearanceMode === 'light'
          ? 'Currently active'
          : 'Clean daytime light surfaces',
      keywords: 'theme light appearance mode bright',
      action: { type: 'set-appearance', mode: 'light' },
    },
    {
      id: 'action-theme-dark',
      group: 'Actions',
      title: 'Switch Appearance to Dark',
      subtitle:
        context.appearanceMode === 'dark'
          ? 'Currently active'
          : 'Calibrated dark surfaces',
      keywords: 'theme dark appearance mode night',
      action: { type: 'set-appearance', mode: 'dark' },
    },
    {
      id: 'action-theme-system',
      group: 'Actions',
      title: 'Switch Appearance to Auto (System)',
      subtitle:
        context.appearanceMode === 'system'
          ? 'Currently active'
          : 'Follow operating system appearance',
      keywords: 'theme system auto appearance mode os',
      action: { type: 'set-appearance', mode: 'system' },
    },
    {
      id: 'action-toggle-sound',
      group: 'Actions',
      title: context.soundEnabled
        ? 'Mute UI Sound Effects'
        : 'Unmute UI Sound Effects',
      subtitle: 'Independent of AudioPlayer narration',
      keywords: 'sound audio mute unmute feedback clicks ui',
      action: { type: 'toggle-sound' },
    },
    {
      id: 'action-toggle-text-size',
      group: 'Actions',
      title: context.largeText
        ? 'Reader Text Size: Switch to Default'
        : 'Reader Text Size: Switch to Larger',
      subtitle: 'Adjust comfortable reading type scale',
      keywords: 'reader text size larger font comfort aa accessibility',
      action: { type: 'toggle-text-size' },
    },
    {
      id: 'action-toggle-focus-reading',
      group: 'Actions',
      title: context.focusMode
        ? 'Disable Focus Reading Mode'
        : 'Enable Focus Reading Mode',
      subtitle: 'Dim peripheral chrome during long-form reading',
      keywords: 'focus reading mode calm reader comfort aa',
      action: { type: 'toggle-focus-reading' },
    },
    {
      id: 'action-open-colophon',
      group: 'Actions',
      title: 'Open Craft Colophon',
      subtitle: 'Typography, surfaces, motion, procedural sound, and engineering notes',
      keywords: 'colophon craft typography sound engineering stack about site',
      action: { type: 'open-colophon' },
    },
  );

  return items;
}

/**
 * Filters and scores command palette items for instant keyboard discovery.
 * When query is empty, prioritizes Case Studies, Notes, Pages, and Actions
 * (hiding verbose per-chapter entries until the user starts typing).
 */
export function searchCommandPaletteItems(
  items: readonly CommandPaletteItem[],
  query: string,
): CommandPaletteItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items.filter((item) => item.group !== 'Chapters');
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const scored: { item: CommandPaletteItem; score: number }[] = [];

  for (const item of items) {
    const titleLower = item.title.toLowerCase();
    const subtitleLower = item.subtitle.toLowerCase();
    const haystack = `${titleLower} ${subtitleLower} ${item.keywords.toLowerCase()}`;

    const matchesAll = tokens.every((token) => haystack.includes(token));
    if (!matchesAll) continue;

    let score = 0;
    if (titleLower.startsWith(normalized)) score += 100;
    else if (titleLower.includes(normalized)) score += 60;
    else if (subtitleLower.includes(normalized)) score += 30;
    else score += 10;

    // Slight preference for direct case studies / notes / actions over deep chapters
    if (item.group === 'Case Studies') score += 12;
    else if (item.group === 'Actions') score += 10;
    else if (item.group === 'Notes') score += 8;
    else if (item.group === 'Pages') score += 6;

    scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map((entry) => entry.item);
}
