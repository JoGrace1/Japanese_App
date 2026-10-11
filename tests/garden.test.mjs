import assert from 'node:assert/strict';
import test from 'node:test';
import { purchaseGardenProduct } from '../src/features/garden/gardenDomain.ts';
import { isUserProgress, parseProgress, serializeProgress } from '../src/storage/progressSerialization.ts';

const initialProgress = (overrides = {}) => ({
  version: 1,
  reviews: {},
  reviewHistory: [],
  wordHuntWords: [],
  petalCount: 100,
  ownedDecorationIds: [],
  gardenPurchases: [],
  restorationStatus: 0,
  unlockedGardenLevels: ['aomori', 'tokyo'],
  storiesCompleted: [],
  completedLevels: 0,
  dailyGoal: 5,
  dailyActivity: [],
  ...overrides,
});

test('restoration kits spend petals and advance in validated 25 percent steps', () => {
  const result = purchaseGardenProduct(initialProgress(), 'restoration-kit', '2026-01-01T00:00:00.000Z');

  assert.equal(result.status, 'purchased');
  assert.equal(result.progress.petalCount, 80);
  assert.equal(result.progress.restorationStatus, 25);
  assert.equal(result.progress.gardenPurchases[0].decorationId, 'restoration-kit');
  assert.equal(result.progress.gardenPurchases[0].price, 20);
});

test('restoration cannot overspend and cannot exceed 100 percent', () => {
  const poor = initialProgress({ petalCount: 19 });
  const rejected = purchaseGardenProduct(poor, 'restoration-kit');
  assert.equal(rejected.status, 'insufficient-petals');
  assert.equal(rejected.progress, poor);

  const almostDone = initialProgress({ petalCount: 40, restorationStatus: 75 });
  const restored = purchaseGardenProduct(almostDone, 'restoration-kit');
  assert.equal(restored.status, 'purchased');
  assert.equal(restored.progress.restorationStatus, 100);
  assert.equal(purchaseGardenProduct(restored.progress, 'restoration-kit').status, 'already-restored');
});

test('decoration purchases are charged once and Kyoto unlock is persisted', () => {
  const starting = initialProgress({ petalCount: 500 });
  const lantern = purchaseGardenProduct(starting, 'lantern');
  assert.equal(lantern.progress.petalCount, 440);
  assert.deepEqual(lantern.progress.ownedDecorationIds, ['lantern']);
  assert.equal(purchaseGardenProduct(lantern.progress, 'lantern').status, 'already-owned');

  const kyoto = purchaseGardenProduct(lantern.progress, 'kyoto-unlock');
  assert.equal(kyoto.progress.petalCount, 140);
  assert.ok(kyoto.progress.unlockedGardenLevels.includes('kyoto'));
  assert.equal(purchaseGardenProduct(kyoto.progress, 'kyoto-unlock').status, 'already-owned');
});

test('unknown products leave the saved balance untouched', () => {
  const starting = initialProgress();
  const result = purchaseGardenProduct(starting, 'not-a-product');
  assert.equal(result.status, 'unknown-product');
  assert.equal(result.progress, starting);
});

test('restoration and unlock state persist while legacy saves remain valid', () => {
  const restored = purchaseGardenProduct(
    initialProgress({ petalCount: 20 }),
    'restoration-kit',
    '2026-01-01T00:00:00.000Z',
  ).progress;
  const reopened = parseProgress(serializeProgress(restored));
  assert.equal(isUserProgress(reopened), true);
  assert.equal(reopened.restorationStatus, 25);
  assert.deepEqual(reopened.unlockedGardenLevels, ['aomori', 'tokyo']);

  const legacy = initialProgress();
  const legacyBalance = legacy.petalCount;
  delete legacy.petalCount;
  legacy.petals = legacyBalance;
  delete legacy.restorationStatus;
  delete legacy.unlockedGardenLevels;
  const migrated = parseProgress(serializeProgress(legacy));
  assert.equal(isUserProgress(migrated), true);
  assert.equal(migrated.petalCount, legacyBalance);
  assert.equal('petals' in migrated, false);
  assert.equal(isUserProgress({ ...migrated, petalCount: 1.5 }), false);
  assert.equal(isUserProgress({ ...migrated, restorationStatus: 101 }), false);
});
