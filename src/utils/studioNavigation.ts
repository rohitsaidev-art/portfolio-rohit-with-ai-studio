import type { RouteMatch } from './portfolio';

export type DesignWorkshopSection =
  | 'overview'
  | 'colour-themes'
  | 'typography'
  | 'spacing-layout'
  | 'surfaces-elevation'
  | 'components'
  | 'patterns'
  | 'page-templates'
  | 'interaction-states'
  | 'motion'
  | 'icons-sound'
  | 'effects'
  | 'toc-lab'
  | 'experiments'
  | 'documentation'
  | 'decisions';

export type StudioGroupId =
  | 'foundations'
  | 'library'
  | 'behaviour'
  | 'exploration'
  | 'system';

export type StudioModuleStatus = 'live' | 'planned';

export interface StudioNavDestination {
  id: DesignWorkshopSection;
  label: string;
  path: string;
  groupId: StudioGroupId;
  groupLabel: string;
  status: StudioModuleStatus;
  supportsSandboxContext: boolean;
  description: string;
  migratedModules?: string;
  plannedScope?: readonly string[];
  relatedPaths?: readonly { label: string; path: string }[];
}

export interface StudioNavGroup {
  id: StudioGroupId;
  label: string;
  items: readonly StudioNavDestination[];
}

export const STUDIO_NAV_GROUPS: readonly StudioNavGroup[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        path: '/design-system',
        groupId: 'foundations',
        groupLabel: 'Foundations',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Architecture index for tokens, components, behaviour specifications, isolated explorations, and the visual approval log.',
        migratedModules: 'Studio Index & Sandbox Controls',
      },
      {
        id: 'colour-themes',
        label: 'Colour & Themes',
        path: '/design-system/colour-themes',
        groupId: 'foundations',
        groupLabel: 'Foundations',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Compare Cool Neutral and Warm Neutral foundations alongside Light, Dark, and System appearance calibration.',
        migratedModules: 'Modules 02 & 03 · Palettes & Appearance',
      },
      {
        id: 'typography',
        label: 'Typography',
        path: '/design-system/typography',
        groupId: 'foundations',
        groupLabel: 'Foundations',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Production Apple Dynamic Type scale, optical sizing discipline, and 60ch editorial prose measures.',
        migratedModules: 'Module 01 · Dynamic Type Scale',
      },
      {
        id: 'spacing-layout',
        label: 'Spacing & Layout',
        path: '/design-system/spacing-layout',
        groupId: 'foundations',
        groupLabel: 'Foundations',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Spatial rhythm tokens, 1160px editorial grid boundaries, and container-to-child padding hierarchy.',
        migratedModules: 'Module 04 · Spatial Geometry',
      },
      {
        id: 'surfaces-elevation',
        label: 'Surfaces, Borders & Elevation',
        path: '/design-system/surfaces-elevation',
        groupId: 'foundations',
        groupLabel: 'Foundations',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Corner radii scale, hairline separator contrast, and physical shadow layers calibrated per appearance.',
        migratedModules: 'Modules 05 & 06 · Geometry & Depth',
      },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    items: [
      {
        id: 'components',
        label: 'Components',
        path: '/design-system/components',
        groupId: 'library',
        groupLabel: 'Library',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Complete interactive portfolio component library across 8 categories (40 production components, 1 experimental specimen) with 13-point documentation, live playgrounds, and viewport previews.',
        migratedModules: 'Cycle 2 Stage 3 · 8 Categories · 41 Components',
      },
      {
        id: 'patterns',
        label: 'Patterns',
        path: '/design-system/patterns',
        groupId: 'library',
        groupLabel: 'Library',
        status: 'planned',
        supportsSandboxContext: false,
        description:
          'Planned destination for multi-component editorial patterns across case studies, reading controls, and discovery flows.',
        plannedScope: [
          'Case study reading-depth switching (2-Min Skim vs. Full Story)',
          'Command Palette (⌘K) search and keyboard navigation patterns',
          'Recruiter Shortlist drawer and shareable URL restoration flows',
          'Lightbox gallery inspection and non-stacking toast feedback',
        ],
        relatedPaths: [
          { label: 'Inspect live Components', path: '/design-system/components' },
          { label: 'Review Interaction States', path: '/design-system/interaction-states' },
        ],
      },
      {
        id: 'page-templates',
        label: 'Page Templates',
        path: '/design-system/page-templates',
        groupId: 'library',
        groupLabel: 'Library',
        status: 'planned',
        supportsSandboxContext: false,
        description:
          'Planned structural blueprints documenting composition rules for Home, Case Study, Notes, About, and Contact pages.',
        plannedScope: [
          'Selected Work index grid and filter-bar geometry',
          'Long-form Case Study chapter cadence and sticky TOC placement',
          'Design Journal index and single-column reading template',
          'About practice timeline and validated Contact inquiry layout',
        ],
        relatedPaths: [
          { label: 'Spacing & Layout geometry', path: '/design-system/spacing-layout' },
          { label: 'Open TOC Lab', path: '/design-system/toc-lab' },
        ],
      },
    ],
  },
  {
    id: 'behaviour',
    label: 'Behaviour',
    items: [
      {
        id: 'interaction-states',
        label: 'Interaction States',
        path: '/design-system/interaction-states',
        groupId: 'behaviour',
        groupLabel: 'Behaviour',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Standardized Default, Hover, Pressed, Focus-Visible, Disabled, Error, and Loading feedback across interactive controls.',
        migratedModules: 'Module 09 · Interaction State Matrix',
      },
      {
        id: 'motion',
        label: 'Motion & Transitions',
        path: '/design-system/motion',
        groupId: 'behaviour',
        groupLabel: 'Behaviour',
        status: 'live',
        supportsSandboxContext: false,
        description:
          'Compositor-only route choreography, spring physics, zero-jank disclosures, and synchronized easing curve comparisons.',
        migratedModules: 'Modules 10 & 11 · Choreography & Curves',
      },
      {
        id: 'icons-sound',
        label: 'Icons & Sound',
        path: '/design-system/icons-sound',
        groupId: 'behaviour',
        groupLabel: 'Behaviour',
        status: 'live',
        supportsSandboxContext: false,
        description:
          'Custom Apple SF-proportioned SVG symbols, animated Lucide specimens, and Web Audio tactile interaction cues.',
        migratedModules: 'Modules 08 & 12 · Iconography & Sound Studio',
      },
    ],
  },
  {
    id: 'exploration',
    label: 'Exploration',
    items: [
      {
        id: 'effects',
        label: 'Materials & Effects Lab',
        path: '/design-system/effects',
        groupId: 'exploration',
        groupLabel: 'Exploration',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Seven isolated visual exploration tracks for texture, glass, blur, and subtle depth—strictly decoupled from production CSS.',
        migratedModules: 'P1.3 · 7 Isolated Effects Tracks',
      },
      {
        id: 'toc-lab',
        label: 'TOC Lab',
        path: '/design-system/toc-lab',
        groupId: 'exploration',
        groupLabel: 'Exploration',
        status: 'live',
        supportsSandboxContext: false,
        description:
          'Compare five Apple-grade Table of Contents architectures on a live scrolling narrative and promote the preferred pattern.',
        migratedModules: 'Module 14 · Case Study TOC Architecture',
      },
      {
        id: 'experiments',
        label: 'Experiments & Versions',
        path: '/design-system/experiments',
        groupId: 'exploration',
        groupLabel: 'Exploration',
        status: 'planned',
        supportsSandboxContext: false,
        description:
          'Planned workspace for side-by-side design snapshots and versioned comparisons prior to Decision Log promotion.',
        plannedScope: [
          'Side-by-side comparison of candidate hero and case-study compositions',
          'Snapshot checkpoints tied directly to Decision Log rationale entries',
          'Rollback and archive inspection for retired visual experiments',
        ],
        relatedPaths: [
          { label: 'Explore Materials & Effects Lab', path: '/design-system/effects' },
          { label: 'View Decision Log', path: '/design-system/decisions' },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'documentation',
        label: 'Documentation',
        path: '/design-system/documentation',
        groupId: 'system',
        groupLabel: 'System',
        status: 'planned',
        supportsSandboxContext: false,
        description:
          'Planned engineering and editorial handbook covering token naming, accessibility guardrails, and promotion governance.',
        plannedScope: [
          'Semantic CSS custom-property naming and theme pairing conventions',
          'WCAG 2.2 AA contrast verification and keyboard focus-ring standards',
          'Route architecture, workspace navigation, and indexing governance rules',
          'Step-by-step promotion process from Studio exploration to public CSS',
        ],
        relatedPaths: [
          { label: 'Inspect Decision Log', path: '/design-system/decisions' },
          { label: 'Review Colour & Themes', path: '/design-system/colour-themes' },
        ],
      },
      {
        id: 'decisions',
        label: 'Decision Log',
        path: '/design-system/decisions',
        groupId: 'system',
        groupLabel: 'System',
        status: 'live',
        supportsSandboxContext: false,
        description:
          'Structured visual approval workflow with local persistence, JSON import/export, Markdown summaries, and controlled token promotion.',
        migratedModules: 'P1.4 & P2.1 · Approval & Promotion Log',
      },
    ],
  },
] as const;

export function getAllStudioDestinations(): StudioNavDestination[] {
  return STUDIO_NAV_GROUPS.flatMap((group) => [...group.items]);
}

export function getStudioDestination(
  section: DesignWorkshopSection,
): StudioNavDestination {
  const found = getAllStudioDestinations().find((item) => item.id === section);
  return found ?? STUDIO_NAV_GROUPS[0].items[0];
}

export interface PrimaryNavItem {
  label: string;
  path: string;
  match: (route: RouteMatch) => boolean;
}

export const PRIMARY_NAV_ITEMS: readonly PrimaryNavItem[] = [
  {
    label: 'Work',
    path: '/',
    match: (r) => r.page === 'home' || r.page === 'case-study',
  },
  {
    label: 'Notes',
    path: '/notes',
    match: (r) => r.page === 'notes' || r.page === 'note-detail',
  },
  {
    label: 'About',
    path: '/about',
    match: (r) => r.page === 'about',
  },
  {
    label: 'Contact',
    path: '/contact',
    match: (r) => r.page === 'contact',
  },
  {
    label: 'Design System',
    path: '/design-system',
    match: (r) => r.page === 'design-system',
  },
];

/**
 * Returns the primary global navigation items, including the first-class
 * "Design System" entry linking to /design-system.
 */
export function getPrimaryNavItems(): PrimaryNavItem[] {
  return [...PRIMARY_NAV_ITEMS];
}
