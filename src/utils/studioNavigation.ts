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
          'Unified visual canvas across Library, Foundations, Behaviour, and Exploration — select any preview to inspect live.',
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
          'Compare Cool and Warm neutral palettes, inspect semantic colour swatches, and test foreground contrast across Light and Dark modes.',
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
          'Optical SF Pro type stacks, responsive Dynamic Type specimens, and editorial reading widths.',
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
          'Visual spacing scale, container-to-child padding proportions, and responsive grid breakpoints.',
      },
      {
        id: 'surfaces-elevation',
        label: 'Surfaces & Elevation',
        path: '/design-system/surfaces-elevation',
        groupId: 'foundations',
        groupLabel: 'Foundations',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Surface planes, concentric corner radii, hairline borders, and Light vs. Dark shadow elevation.',
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
          'Visual inventory of all 43 portfolio components across eight categories. Select any tile to inspect variants and live states.',
      },
      {
        id: 'patterns',
        label: 'Patterns',
        path: '/design-system/patterns',
        groupId: 'library',
        groupLabel: 'Library',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Twelve recurring portfolio compositions built from production components, with proposed patterns clearly separated.',
      },
      {
        id: 'page-templates',
        label: 'Page Templates',
        path: '/design-system/page-templates',
        groupId: 'library',
        groupLabel: 'Library',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Interactive structural blueprints for all seven portfolio routes across desktop, tablet, and mobile.',
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
          'Live state testing across buttons, links, inputs, and cards alongside keyboard, touch, and focus rules.',
      },
      {
        id: 'motion',
        label: 'Motion & Transitions',
        path: '/design-system/motion',
        groupId: 'behaviour',
        groupLabel: 'Behaviour',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Interactive motion playground, easing curves, spring physics, and reduced-motion comparisons.',
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
          'SF-proportioned SVG symbols, animated Lucide icons, optical sizes, and tactile Web Audio cues.',
      },
    ],
  },
  {
    id: 'exploration',
    label: 'Exploration',
    items: [
      {
        id: 'effects',
        label: 'Materials & Effects',
        path: '/design-system/effects',
        groupId: 'exploration',
        groupLabel: 'Exploration',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Isolated visual sandbox for texture, glass, blur, elevation, and border treatments — completely decoupled from live pages.',
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
          'Compare seven case-study Table of Contents architectures on a live scrolling reading layout.',
      },
      {
        id: 'experiments',
        label: 'Experiments & Versions',
        path: '/design-system/experiments',
        groupId: 'exploration',
        groupLabel: 'Exploration',
        status: 'live',
        supportsSandboxContext: true,
        description:
          'Create visual studies, capture version snapshots, compare before and after, and send decisions to the log.',
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
        status: 'live',
        supportsSandboxContext: false,
        description:
          'Quick searchable index to jump straight to any foundation, component, behaviour, or exploration view.',
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
          'Readable record of visual approvals, rejections, rationale, and production token promotions.',
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
    path: '/work',
    match: (r) => r.page === 'work' || r.page === 'case-study',
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
