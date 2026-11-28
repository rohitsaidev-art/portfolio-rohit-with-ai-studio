import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_WORKBENCH_SPECIMENS,
  addToCompare,
  applyCustomOrder,
  archiveSpecimens,
  createCollection,
  createDefaultWorkbenchState,
  createGroup,
  deleteCollection,
  duplicateSpecimens,
  getAllWorkbenchSpecimens,
  removeDuplicate,
  removeFromCompare,
  renameGroup,
  reorderSpecimenInList,
  resetArrangement,
  restoreAllArchived,
  restoreSpecimens,
  setCompareSpecimens,
  toggleCardSize,
  ungroupSpecimens,
  updateCollectionMembership,
} from './workbenchStore';

test('Unified Workbench registry contains all 72 real Studio specimens across 6 sections', () => {
  const bySection = BASE_WORKBENCH_SPECIMENS.reduce<Record<string, number>>((acc, s) => {
    acc[s.section] = (acc[s.section] ?? 0) + 1;
    return acc;
  }, {});

  assert.equal(bySection.foundations, 4);
  assert.equal(bySection.components, 43);
  assert.equal(bySection.patterns, 12);
  assert.equal(bySection.templates, 7);
  assert.equal(bySection.behaviour, 3);
  assert.equal(bySection.exploration, 3);
  assert.equal(BASE_WORKBENCH_SPECIMENS.length, 72);
});

test('Archiving is strictly non-destructive and supports individual and bulk restore', () => {
  let state = createDefaultWorkbenchState();
  state = archiveSpecimens(state, ['component:buttons', 'pattern:hero-sections']);

  assert.deepEqual(state.archivedIds, ['component:buttons', 'pattern:hero-sections']);
  // Archived items are removed from active compare tray, never deleted from registry
  assert.equal(state.compareIds.includes('component:buttons'), false);
  assert.equal(getAllWorkbenchSpecimens(state).length, 72);

  // Restore single
  state = restoreSpecimens(state, ['component:buttons']);
  assert.deepEqual(state.archivedIds, ['pattern:hero-sections']);

  // Restore all
  state = restoreAllArchived(state);
  assert.equal(state.archivedIds.length, 0);
});

test('Collections support creation, non-duplicated multi-collection membership, and removal', () => {
  let state = createDefaultWorkbenchState();
  const baseLen = getAllWorkbenchSpecimens(state).length;

  const { nextState, collection } = createCollection(state, 'Experimental Buttons', [
    'component:buttons',
    'component:icon-buttons',
  ]);
  assert.ok(collection);
  state = nextState;

  // Adding same specimen to multiple collections never duplicates the specimen
  state = updateCollectionMembership(
    state,
    collection.id,
    ['component:buttons', 'component:toggle-switch'],
    'add',
  );
  const updated = state.collections.find((c) => c.id === collection.id)!;
  assert.deepEqual(updated.specimenIds, [
    'component:buttons',
    'component:icon-buttons',
    'component:toggle-switch',
  ]);
  assert.equal(getAllWorkbenchSpecimens(state).length, baseLen);

  // Remove member & delete collection
  state = updateCollectionMembership(state, collection.id, ['component:toggle-switch'], 'remove');
  assert.equal(
    state.collections.find((c) => c.id === collection.id)!.specimenIds.includes(
      'component:toggle-switch',
    ),
    false,
  );
  state = deleteCollection(state, collection.id);
  assert.equal(
    state.collections.some((c) => c.id === collection.id),
    false,
  );
});

test('Arrange mode supports drag reorder, card resizing, grouping, and clean reset without losing archive/collections', () => {
  let state = createDefaultWorkbenchState();
  state = archiveSpecimens(state, ['pattern:testimonials']);

  const initialOrder = ['component:buttons', 'component:icon-buttons', 'component:segmented-control'];
  state = reorderSpecimenInList(
    state,
    'components:actions-controls',
    'component:segmented-control',
    'component:buttons',
    initialOrder,
  );
  const reordered = applyCustomOrder(
    initialOrder.map((id) => ({ id })),
    state.sectionOrders['components:actions-controls'],
  );
  assert.deepEqual(
    reordered.map((x) => x.id),
    ['component:segmented-control', 'component:buttons', 'component:icon-buttons'],
  );

  // Card resize toggle
  state = toggleCardSize(state, 'component:buttons');
  assert.equal(state.cardSizes['component:buttons'], 'wide');
  state = toggleCardSize(state, 'component:buttons');
  assert.equal(state.cardSizes['component:buttons'], 'default');
  state = toggleCardSize(state, 'component:buttons');

  // Create, rename, and ungroup spatial group
  const grouped = createGroup(state, 'Hero Controls', ['component:buttons', 'component:icon-buttons']);
  assert.ok(grouped.group);
  state = renameGroup(grouped.nextState, grouped.group.id, 'Primary Controls');
  assert.equal(state.groups[0].name, 'Primary Controls');

  // Reset arrangement clears orders, sizes, and groups while preserving archive & collections
  const reset = resetArrangement(state);
  assert.deepEqual(reset.sectionOrders, {});
  assert.deepEqual(reset.cardSizes, {});
  assert.equal(reset.groups.length, 0);
  assert.deepEqual(reset.archivedIds, ['pattern:testimonials']);
  assert.equal(reset.collections.length, state.collections.length);

  // Ungroup single
  const ungrouped = ungroupSpecimens(state, grouped.group.id);
  assert.equal(ungrouped.groups.length, 0);
});

test('Duplicate & cross-category Compare operations work non-destructively', () => {
  let state = createDefaultWorkbenchState();
  const { nextState, createdIds } = duplicateSpecimens(state, ['component:buttons']);
  assert.equal(createdIds.length, 1);
  state = nextState;
  assert.equal(getAllWorkbenchSpecimens(state).length, 73);

  // Compare across different categories & sections
  state = setCompareSpecimens(state, [
    'component:buttons',
    'pattern:hero-sections',
    'foundation:typography',
    createdIds[0],
  ]);
  assert.equal(state.compareIds.length, 4);

  state = addToCompare(state, ['template:homepage']);
  assert.equal(state.compareIds.includes('template:homepage'), true);

  state = removeFromCompare(state, 'foundation:typography');
  assert.equal(state.compareIds.includes('foundation:typography'), false);

  state = removeDuplicate(state, createdIds[0]);
  assert.equal(getAllWorkbenchSpecimens(state).length, 72);
  assert.equal(state.compareIds.includes(createdIds[0]), false);
});
