/**
 * Portfolio Studio — Interactive Design System Workbench Store
 *
 * Cleanly separates concerns:
 * 1. Production implementations & catalog specs (read-only imports)
 * 2. Visual specimen references (WORKBENCH_SPECIMENS)
 * 3. Spatial canvas layout (sectionOrders, cardSizes, groups)
 * 4. Persistent Archive status (non-destructive, never deletes code/data)
 * 5. Collection membership (many-to-many by ID, zero duplication)
 *
 * Strictly isolated to /design-system local persistence under
 * `portfolio_studio_workbench_v1`. Never mutates public portfolio pages or CSS.
 */

import {
  COMPONENT_CATEGORIES,
  COMPONENT_LIBRARY_ITEMS,
  type ComponentCategoryId,
} from './componentLibraryCatalog';
import {
  PAGE_TEMPLATES_CATALOG,
  PATTERN_LIBRARY_ITEMS,
} from './studioLibraryCatalog';

export type WorkbenchMode = 'browse' | 'arrange' | 'compare';

export type WorkbenchSectionId =
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'templates'
  | 'behaviour'
  | 'exploration';

export type WorkbenchCardSize = 'default' | 'wide';

export interface WorkbenchSpecimen {
  /** Stable unique ID across the unified workbench, e.g. 'component:buttons', 'pattern:hero-sections' */
  id: string;
  section: WorkbenchSectionId;
  /** Original item ID inside its source catalog */
  sourceId: string;
  /** Optional component sub-category for Components section */
  categoryId?: ComponentCategoryId;
  categoryLabel: string;
  title: string;
  subtitle: string;
  /** Variant count or short descriptor */
  meta: string;
  status: 'production' | 'experimental' | 'proposed';
  /** Direct Studio route to open full interactive detail page */
  detailPath: string;
  /** Search keywords */
  searchText: string;
  /** Whether this is a user-created study duplicate */
  isDuplicate?: boolean;
  /** If isDuplicate, points to the original WorkbenchSpecimen.id */
  duplicateOf?: string;
}

export interface WorkbenchCollection {
  id: string;
  name: string;
  specimenIds: string[];
  createdAt: string;
}

export interface WorkbenchGroup {
  id: string;
  name: string;
  specimenIds: string[];
  createdAt: string;
}

export interface WorkbenchDuplicate {
  id: string;
  sourceSpecimenId: string;
  label: string;
  createdAt: string;
}

export interface WorkbenchState {
  schemaVersion: 1;
  archivedIds: string[];
  collections: WorkbenchCollection[];
  groups: WorkbenchGroup[];
  sectionOrders: Record<string, string[]>;
  cardSizes: Record<string, WorkbenchCardSize>;
  duplicates: WorkbenchDuplicate[];
  compareIds: string[];
}

export const WORKBENCH_STORAGE_KEY = 'portfolio_studio_workbench_v1';

export const WORKBENCH_SECTIONS: readonly {
  id: WorkbenchSectionId;
  label: string;
  shortLabel: string;
}[] = [
  { id: 'foundations', label: 'Foundations', shortLabel: 'Foundations' },
  { id: 'components', label: 'Components', shortLabel: 'Components' },
  { id: 'patterns', label: 'Patterns', shortLabel: 'Patterns' },
  { id: 'templates', label: 'Page Templates', shortLabel: 'Templates' },
  { id: 'behaviour', label: 'Behaviour', shortLabel: 'Behaviour' },
  { id: 'exploration', label: 'Exploration', shortLabel: 'Exploration' },
] as const;

const FOUNDATION_SPECIMENS: readonly WorkbenchSpecimen[] = [
  {
    id: 'foundation:colour-themes',
    section: 'foundations',
    sourceId: 'colour-themes',
    categoryLabel: 'Foundations',
    title: 'Colour & Themes',
    subtitle: 'Cool & Warm palettes across Light and Dark',
    meta: '4 matrices · AA',
    status: 'production',
    detailPath: '/design-system/colour-themes',
    searchText: 'colour color themes cool warm light dark contrast swatches tokens',
  },
  {
    id: 'foundation:typography',
    section: 'foundations',
    sourceId: 'typography',
    categoryLabel: 'Foundations',
    title: 'Typography',
    subtitle: 'SF Pro Display, SF Pro Text & 60ch reading scale',
    meta: 'Dynamic Type',
    status: 'production',
    detailPath: '/design-system/typography',
    searchText: 'typography fonts sf pro display text type scale reading measure clamp',
  },
  {
    id: 'foundation:spacing-layout',
    section: 'foundations',
    sourceId: 'spacing-layout',
    categoryLabel: 'Foundations',
    title: 'Spacing & Layout',
    subtitle: '4px rhythm, outer-to-inner padding & 1160px shell',
    meta: '4px grid',
    status: 'production',
    detailPath: '/design-system/spacing-layout',
    searchText: 'spacing layout grid breakpoints container padding rhythm',
  },
  {
    id: 'foundation:surfaces-elevation',
    section: 'foundations',
    sourceId: 'surfaces-elevation',
    categoryLabel: 'Foundations',
    title: 'Surfaces & Elevation',
    subtitle: 'Concentric radii, hairline borders & Light/Dark depth',
    meta: '4 planes',
    status: 'production',
    detailPath: '/design-system/surfaces-elevation',
    searchText: 'surfaces elevation radius radii shadows hairlines borders depth',
  },
];

const BEHAVIOUR_SPECIMENS: readonly WorkbenchSpecimen[] = [
  {
    id: 'behaviour:interaction-states',
    section: 'behaviour',
    sourceId: 'interaction-states',
    categoryLabel: 'Behaviour',
    title: 'Interaction States',
    subtitle: 'Live hover, focus ring, loading & disabled matrix',
    meta: '10 states',
    status: 'production',
    detailPath: '/design-system/interaction-states',
    searchText: 'interaction states hover focus active disabled loading keyboard touch',
  },
  {
    id: 'behaviour:motion',
    section: 'behaviour',
    sourceId: 'motion',
    categoryLabel: 'Behaviour',
    title: 'Motion & Transitions',
    subtitle: 'Apple easing curves, springs & reduced-motion rules',
    meta: 'Playground',
    status: 'production',
    detailPath: '/design-system/motion',
    searchText: 'motion transitions animation easing cubic bezier spring reduced motion',
  },
  {
    id: 'behaviour:icons-sound',
    section: 'behaviour',
    sourceId: 'icons-sound',
    categoryLabel: 'Behaviour',
    title: 'Icons & Sound',
    subtitle: '40 SF symbols, 9 animated icons & 8 Web Audio cues',
    meta: '40 symbols · 8 cues',
    status: 'production',
    detailPath: '/design-system/icons-sound',
    searchText: 'icons sound sf symbols animated audio haptics tick chime',
  },
];

const EXPLORATION_SPECIMENS: readonly WorkbenchSpecimen[] = [
  {
    id: 'exploration:effects',
    section: 'exploration',
    sourceId: 'effects',
    categoryLabel: 'Exploration',
    title: 'Materials & Effects',
    subtitle: 'Frosted glass, paper grain, ambient glow & elevation tracks',
    meta: '7 tracks',
    status: 'experimental',
    detailPath: '/design-system/effects',
    searchText: 'materials effects glass blur paper grain glow parallax shadows borders',
  },
  {
    id: 'exploration:toc-lab',
    section: 'exploration',
    sourceId: 'toc-lab',
    categoryLabel: 'Exploration',
    title: 'TOC Lab',
    subtitle: 'Five live case-study Table of Contents architectures',
    meta: '5 architectures',
    status: 'production',
    detailPath: '/design-system/toc-lab',
    searchText: 'toc table of contents notch rail ios capsule local nav macos scrubber',
  },
  {
    id: 'exploration:experiments',
    section: 'exploration',
    sourceId: 'experiments',
    categoryLabel: 'Exploration',
    title: 'Experiments & Versions',
    subtitle: 'Saved visual studies, version snapshots & property diffing',
    meta: 'Versioned',
    status: 'experimental',
    detailPath: '/design-system/experiments',
    searchText: 'experiments versions snapshots diff restore studies sandbox',
  },
];

const CATEGORY_LABEL_BY_ID = new Map(
  COMPONENT_CATEGORIES.map((c) => [c.id, c.label]),
);

const COMPONENT_SPECIMENS: readonly WorkbenchSpecimen[] =
  COMPONENT_LIBRARY_ITEMS.map((item) => {
    const categoryLabel = CATEGORY_LABEL_BY_ID.get(item.categoryId) ?? 'Components';
    return {
      id: `component:${item.id}`,
      section: 'components',
      sourceId: item.id,
      categoryId: item.categoryId,
      categoryLabel,
      title: item.shortTitle,
      subtitle: item.name,
      meta:
        item.status === 'experimental'
          ? `Experimental · ${item.variants.length}`
          : `${item.variants.length} ${item.variants.length === 1 ? 'variant' : 'variants'}`,
      status: item.status,
      detailPath: `/design-system/components?component=${item.id}`,
      searchText: [
        item.shortTitle,
        item.name,
        categoryLabel,
        item.status,
        ...item.variants.map((v) => v.name),
      ]
        .join(' ')
        .toLowerCase(),
    };
  });

const PATTERN_SPECIMENS: readonly WorkbenchSpecimen[] =
  PATTERN_LIBRARY_ITEMS.map((pat) => ({
    id: `pattern:${pat.id}`,
    section: 'patterns',
    sourceId: pat.id,
    categoryLabel: pat.category,
    title: pat.name,
    subtitle: pat.category,
    meta: pat.maturity === 'proposed' ? 'Proposed' : pat.category,
    status: pat.maturity === 'proposed' ? 'proposed' : 'production',
    detailPath: '/design-system/patterns',
    searchText: [pat.name, pat.category, pat.maturity, ...pat.componentComposition]
      .join(' ')
      .toLowerCase(),
  }));

const TEMPLATE_SPECIMENS: readonly WorkbenchSpecimen[] =
  PAGE_TEMPLATES_CATALOG.map((tpl) => ({
    id: `template:${tpl.id}`,
    section: 'templates',
    sourceId: tpl.id,
    categoryLabel: 'Page Templates',
    title: tpl.name,
    subtitle: tpl.routePattern,
    meta: tpl.routePattern,
    status: 'production',
    detailPath: '/design-system/page-templates',
    searchText: [tpl.name, tpl.routePattern, tpl.purpose].join(' ').toLowerCase(),
  }));

/**
 * Single authoritative registry of all base visual specimens across the Studio.
 * Contains 4 Foundations + 43 Components + 12 Patterns + 7 Page Templates + 3 Behaviour + 3 Exploration = 72 specimens.
 */
export const BASE_WORKBENCH_SPECIMENS: readonly WorkbenchSpecimen[] = [
  ...FOUNDATION_SPECIMENS,
  ...COMPONENT_SPECIMENS,
  ...PATTERN_SPECIMENS,
  ...TEMPLATE_SPECIMENS,
  ...BEHAVIOUR_SPECIMENS,
  ...EXPLORATION_SPECIMENS,
];

const BASE_SPECIMEN_MAP = new Map(
  BASE_WORKBENCH_SPECIMENS.map((spec) => [spec.id, spec]),
);

export function getAllWorkbenchSpecimens(
  state: WorkbenchState,
): WorkbenchSpecimen[] {
  const duplicateSpecs: WorkbenchSpecimen[] = [];
  for (const dup of state.duplicates) {
    const source = BASE_SPECIMEN_MAP.get(dup.sourceSpecimenId);
    if (!source) continue;
    duplicateSpecs.push({
      ...source,
      id: dup.id,
      title: dup.label,
      meta: `Study copy · ${source.meta}`,
      isDuplicate: true,
      duplicateOf: source.id,
      searchText: `${dup.label.toLowerCase()} ${source.searchText} duplicate copy study`,
    });
  }
  return [...BASE_WORKBENCH_SPECIMENS, ...duplicateSpecs];
}

export function getWorkbenchSpecimenById(
  state: WorkbenchState,
  id: string,
): WorkbenchSpecimen | undefined {
  const base = BASE_SPECIMEN_MAP.get(id);
  if (base) return base;
  const dup = state.duplicates.find((d) => d.id === id);
  if (!dup) return undefined;
  const source = BASE_SPECIMEN_MAP.get(dup.sourceSpecimenId);
  if (!source) return undefined;
  return {
    ...source,
    id: dup.id,
    title: dup.label,
    meta: `Study copy · ${source.meta}`,
    isDuplicate: true,
    duplicateOf: source.id,
    searchText: `${dup.label.toLowerCase()} ${source.searchText} duplicate copy study`,
  };
}

export function createDefaultWorkbenchState(): WorkbenchState {
  const now = '2026-01-15T10:00:00.000Z';
  return {
    schemaVersion: 1,
    archivedIds: [],
    collections: [
      {
        id: 'col-approved-components',
        name: 'Approved Components',
        specimenIds: [
          'component:buttons',
          'component:segmented-control',
          'component:project-card',
          'component:audio-player-waveform',
        ],
        createdAt: now,
      },
      {
        id: 'col-navigation-explorations',
        name: 'Navigation Explorations',
        specimenIds: [
          'component:desktop-mobile-navbar',
          'component:table-of-contents',
          'component:command-palette',
          'exploration:toc-lab',
        ],
        createdAt: now,
      },
    ],
    groups: [],
    sectionOrders: {},
    cardSizes: {},
    duplicates: [],
    compareIds: ['component:buttons', 'component:segmented-control'],
  };
}

function sanitizeWorkbenchState(raw: unknown): WorkbenchState {
  const fallback = createDefaultWorkbenchState();
  if (!raw || typeof raw !== 'object') return fallback;
  const record = raw as Record<string, unknown>;

  const validDupIds = new Set<string>();
  const duplicates: WorkbenchDuplicate[] = Array.isArray(record.duplicates)
    ? record.duplicates
        .filter((d): d is WorkbenchDuplicate => {
          if (!d || typeof d !== 'object') return false;
          const item = d as Record<string, unknown>;
          return (
            typeof item.id === 'string' &&
            typeof item.sourceSpecimenId === 'string' &&
            BASE_SPECIMEN_MAP.has(item.sourceSpecimenId) &&
            typeof item.label === 'string' &&
            typeof item.createdAt === 'string'
          );
        })
        .map((d) => {
          validDupIds.add(d.id);
          return d;
        })
    : [];

  const isKnownId = (id: unknown): id is string =>
    typeof id === 'string' && (BASE_SPECIMEN_MAP.has(id) || validDupIds.has(id));

  const archivedIds = Array.isArray(record.archivedIds)
    ? Array.from(new Set(record.archivedIds.filter(isKnownId)))
    : [];

  const collections: WorkbenchCollection[] = Array.isArray(record.collections)
    ? record.collections
        .filter((c): c is WorkbenchCollection => {
          if (!c || typeof c !== 'object') return false;
          const item = c as Record<string, unknown>;
          return (
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            item.name.trim().length > 0 &&
            Array.isArray(item.specimenIds)
          );
        })
        .map((c) => ({
          id: c.id,
          name: c.name.trim(),
          specimenIds: Array.from(new Set(c.specimenIds.filter(isKnownId))),
          createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
        }))
    : fallback.collections;

  const groups: WorkbenchGroup[] = Array.isArray(record.groups)
    ? record.groups
        .filter((g): g is WorkbenchGroup => {
          if (!g || typeof g !== 'object') return false;
          const item = g as Record<string, unknown>;
          return (
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            item.name.trim().length > 0 &&
            Array.isArray(item.specimenIds)
          );
        })
        .map((g) => ({
          id: g.id,
          name: g.name.trim(),
          specimenIds: Array.from(new Set(g.specimenIds.filter(isKnownId))),
          createdAt: typeof g.createdAt === 'string' ? g.createdAt : new Date().toISOString(),
        }))
        .filter((g) => g.specimenIds.length > 0)
    : [];

  const sectionOrders: Record<string, string[]> = {};
  if (record.sectionOrders && typeof record.sectionOrders === 'object') {
    for (const [key, val] of Object.entries(
      record.sectionOrders as Record<string, unknown>,
    )) {
      if (Array.isArray(val)) {
        sectionOrders[key] = Array.from(new Set(val.filter(isKnownId)));
      }
    }
  }

  const cardSizes: Record<string, WorkbenchCardSize> = {};
  if (record.cardSizes && typeof record.cardSizes === 'object') {
    for (const [key, val] of Object.entries(
      record.cardSizes as Record<string, unknown>,
    )) {
      if (isKnownId(key) && (val === 'default' || val === 'wide')) {
        cardSizes[key] = val;
      }
    }
  }

  const compareIds = Array.isArray(record.compareIds)
    ? Array.from(new Set(record.compareIds.filter(isKnownId)))
    : fallback.compareIds;

  return {
    schemaVersion: 1,
    archivedIds,
    collections,
    groups,
    sectionOrders,
    cardSizes,
    duplicates,
    compareIds,
  };
}

export function loadWorkbenchState(): WorkbenchState {
  if (typeof window === 'undefined') {
    return createDefaultWorkbenchState();
  }
  try {
    const raw = window.localStorage.getItem(WORKBENCH_STORAGE_KEY);
    if (!raw) return createDefaultWorkbenchState();
    return sanitizeWorkbenchState(JSON.parse(raw));
  } catch {
    return createDefaultWorkbenchState();
  }
}

export function saveWorkbenchState(state: WorkbenchState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKBENCH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

/* ==========================================================================
   PURE STATE MUTATIONS (Unit-Tested)
   ========================================================================== */

export function archiveSpecimens(
  state: WorkbenchState,
  ids: readonly string[],
): WorkbenchState {
  if (ids.length === 0) return state;
  const archivedSet = new Set(state.archivedIds);
  for (const id of ids) {
    archivedSet.add(id);
  }
  return {
    ...state,
    archivedIds: Array.from(archivedSet),
    compareIds: state.compareIds.filter((id) => !archivedSet.has(id)),
  };
}

export function restoreSpecimens(
  state: WorkbenchState,
  ids: readonly string[],
): WorkbenchState {
  if (ids.length === 0) return state;
  const restoreSet = new Set(ids);
  return {
    ...state,
    archivedIds: state.archivedIds.filter((id) => !restoreSet.has(id)),
  };
}

export function restoreAllArchived(state: WorkbenchState): WorkbenchState {
  if (state.archivedIds.length === 0) return state;
  return {
    ...state,
    archivedIds: [],
  };
}

export function createCollection(
  state: WorkbenchState,
  rawName: string,
  initialSpecimenIds: readonly string[] = [],
  nowIso = new Date().toISOString(),
): { nextState: WorkbenchState; collection: WorkbenchCollection | null } {
  const name = rawName.trim();
  if (!name) return { nextState: state, collection: null };
  const id = `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const collection: WorkbenchCollection = {
    id,
    name,
    specimenIds: Array.from(new Set(initialSpecimenIds)),
    createdAt: nowIso,
  };
  return {
    nextState: {
      ...state,
      collections: [...state.collections, collection],
    },
    collection,
  };
}

export function deleteCollection(
  state: WorkbenchState,
  collectionId: string,
): WorkbenchState {
  return {
    ...state,
    collections: state.collections.filter((c) => c.id !== collectionId),
  };
}

export function updateCollectionMembership(
  state: WorkbenchState,
  collectionId: string,
  specimenIds: readonly string[],
  action: 'add' | 'remove',
): WorkbenchState {
  if (specimenIds.length === 0) return state;
  const targetSet = new Set(specimenIds);
  return {
    ...state,
    collections: state.collections.map((col) => {
      if (col.id !== collectionId) return col;
      if (action === 'add') {
        const merged = new Set([...col.specimenIds, ...specimenIds]);
        return { ...col, specimenIds: Array.from(merged) };
      }
      return {
        ...col,
        specimenIds: col.specimenIds.filter((id) => !targetSet.has(id)),
      };
    }),
  };
}

export function createGroup(
  state: WorkbenchState,
  rawName: string,
  specimenIds: readonly string[],
  nowIso = new Date().toISOString(),
): { nextState: WorkbenchState; group: WorkbenchGroup | null } {
  const name = rawName.trim();
  const uniqueIds = Array.from(new Set(specimenIds));
  if (!name || uniqueIds.length === 0) {
    return { nextState: state, group: null };
  }
  const incomingSet = new Set(uniqueIds);
  const id = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const group: WorkbenchGroup = {
    id,
    name,
    specimenIds: uniqueIds,
    createdAt: nowIso,
  };
  // Ensure each specimen belongs to at most one spatial Arrange group
  const cleanedGroups = state.groups
    .map((g) => ({
      ...g,
      specimenIds: g.specimenIds.filter((sid) => !incomingSet.has(sid)),
    }))
    .filter((g) => g.specimenIds.length > 0);

  return {
    nextState: {
      ...state,
      groups: [group, ...cleanedGroups],
    },
    group,
  };
}

export function renameGroup(
  state: WorkbenchState,
  groupId: string,
  rawName: string,
): WorkbenchState {
  const name = rawName.trim();
  if (!name) return state;
  return {
    ...state,
    groups: state.groups.map((g) => (g.id === groupId ? { ...g, name } : g)),
  };
}

export function ungroupSpecimens(
  state: WorkbenchState,
  groupId: string,
): WorkbenchState {
  return {
    ...state,
    groups: state.groups.filter((g) => g.id !== groupId),
  };
}

export function reorderSpecimenInList(
  state: WorkbenchState,
  listKey: string,
  draggedId: string,
  targetId: string,
  currentOrderedIds: readonly string[],
): WorkbenchState {
  if (draggedId === targetId) return state;
  const order = [...currentOrderedIds];
  const fromIdx = order.indexOf(draggedId);
  const toIdx = order.indexOf(targetId);
  if (fromIdx === -1 || toIdx === -1) return state;
  order.splice(fromIdx, 1);
  order.splice(toIdx, 0, draggedId);
  return {
    ...state,
    sectionOrders: {
      ...state.sectionOrders,
      [listKey]: order,
    },
  };
}

export function applyCustomOrder<T extends { id: string }>(
  items: readonly T[],
  customOrder?: readonly string[],
): T[] {
  if (!customOrder || customOrder.length === 0) return [...items];
  const rank = new Map(customOrder.map((id, idx) => [id, idx]));
  return [...items].sort((a, b) => {
    const rankA = rank.get(a.id);
    const rankB = rank.get(b.id);
    if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
    if (rankA !== undefined) return -1;
    if (rankB !== undefined) return 1;
    return 0;
  });
}

export function toggleCardSize(
  state: WorkbenchState,
  specimenId: string,
): WorkbenchState {
  const current = state.cardSizes[specimenId] ?? 'default';
  const next: WorkbenchCardSize = current === 'wide' ? 'default' : 'wide';
  return {
    ...state,
    cardSizes: {
      ...state.cardSizes,
      [specimenId]: next,
    },
  };
}

export function duplicateSpecimens(
  state: WorkbenchState,
  ids: readonly string[],
  nowIso = new Date().toISOString(),
): { nextState: WorkbenchState; createdIds: string[] } {
  const newDuplicates: WorkbenchDuplicate[] = [];
  const createdIds: string[] = [];

  for (const id of ids) {
    const existing = getWorkbenchSpecimenById(state, id);
    if (!existing) continue;
    const baseId = existing.duplicateOf ?? existing.id;
    const baseSpec = BASE_SPECIMEN_MAP.get(baseId);
    if (!baseSpec) continue;

    const existingCount =
      state.duplicates.filter((d) => d.sourceSpecimenId === baseId).length +
      newDuplicates.filter((d) => d.sourceSpecimenId === baseId).length;
    const dupId = `dup:${baseSpec.sourceId}:${Date.now()}-${existingCount + 1}-${Math.random().toString(36).slice(2, 5)}`;
    const label = `${baseSpec.title} (Study ${existingCount + 2})`;

    newDuplicates.push({
      id: dupId,
      sourceSpecimenId: baseId,
      label,
      createdAt: nowIso,
    });
    createdIds.push(dupId);
  }

  if (newDuplicates.length === 0) {
    return { nextState: state, createdIds: [] };
  }

  return {
    nextState: {
      ...state,
      duplicates: [...state.duplicates, ...newDuplicates],
    },
    createdIds,
  };
}

export function removeDuplicate(
  state: WorkbenchState,
  duplicateId: string,
): WorkbenchState {
  return {
    ...state,
    duplicates: state.duplicates.filter((d) => d.id !== duplicateId),
    archivedIds: state.archivedIds.filter((id) => id !== duplicateId),
    compareIds: state.compareIds.filter((id) => id !== duplicateId),
    collections: state.collections.map((c) => ({
      ...c,
      specimenIds: c.specimenIds.filter((id) => id !== duplicateId),
    })),
    groups: state.groups
      .map((g) => ({
        ...g,
        specimenIds: g.specimenIds.filter((id) => id !== duplicateId),
      }))
      .filter((g) => g.specimenIds.length > 0),
  };
}

export function setCompareSpecimens(
  state: WorkbenchState,
  ids: readonly string[],
): WorkbenchState {
  const archivedSet = new Set(state.archivedIds);
  const unique = Array.from(new Set(ids)).filter((id) => !archivedSet.has(id));
  return {
    ...state,
    compareIds: unique.slice(0, 6),
  };
}

export function addToCompare(
  state: WorkbenchState,
  ids: readonly string[],
): WorkbenchState {
  const archivedSet = new Set(state.archivedIds);
  const merged = Array.from(new Set([...state.compareIds, ...ids])).filter(
    (id) => !archivedSet.has(id),
  );
  return {
    ...state,
    compareIds: merged.slice(0, 6),
  };
}

export function removeFromCompare(
  state: WorkbenchState,
  id: string,
): WorkbenchState {
  return {
    ...state,
    compareIds: state.compareIds.filter((item) => item !== id),
  };
}

export function resetArrangement(state: WorkbenchState): WorkbenchState {
  return {
    ...state,
    sectionOrders: {},
    cardSizes: {},
    groups: [],
  };
}
