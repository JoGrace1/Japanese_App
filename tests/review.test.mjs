import assert from 'node:assert/strict';
import test from 'node:test';
import { checkAnswer } from '../src/review/answerChecking.ts';
import { scheduleReview } from '../src/review/scheduling.ts';
import { isUserProgress, parseProgress, serializeProgress } from '../src/storage/progressSerialization.ts';

test('answer checking normalizes Unicode and surrounding punctuation', () => {
  assert.equal(checkAnswer('  みす\u3099。 ', 'みず', { kind: 'japanese' }), true);
  assert.equal(checkAnswer('WATER!', ['water', 'drink'], { kind: 'meaning' }), true);
  assert.equal(checkAnswer('', 'ねこ', { kind: 'japanese' }), false);
});

test('reading answers enforce the requested kana script', () => {
  assert.equal(checkAnswer('みず', 'みず', { kind: 'reading', script: 'hiragana' }), true);
  assert.equal(checkAnswer('ミズ', 'ミズ', { kind: 'reading', script: 'hiragana' }), false);
  assert.equal(checkAnswer('ミズ', 'ミズ', { kind: 'reading', script: 'katakana' }), true);
});

test('learning ratings follow configurable short steps and graduate to review', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const hard = scheduleReview(undefined, 'hard', now);
  assert.equal(hard.state, 'learning');
  assert.equal(hard.learningStep, 0);
  assert.equal(hard.dueAt, '2026-01-01T00:01:00.000Z');

  const firstGood = scheduleReview(undefined, 'good', now);
  assert.equal(firstGood.state, 'learning');
  assert.equal(firstGood.learningStep, 1);
  assert.equal(firstGood.dueAt, '2026-01-01T00:10:00.000Z');

  const graduated = scheduleReview(firstGood, 'good', now);
  assert.equal(graduated.state, 'review');
  assert.equal(graduated.intervalDays, 1);
  assert.equal(graduated.reviewCount, 2);
  assert.equal(graduated.dueAt, '2026-01-02T00:00:00.000Z');
});

test('review intervals respond differently to Hard, Good, and Easy', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const review = { ...scheduleReview(undefined, 'easy', now), state: 'review', intervalDays: 4 };
  assert.equal(scheduleReview(review, 'hard', now).intervalDays, 4.8);
  assert.equal(scheduleReview(review, 'good', now).intervalDays, 8);
  assert.equal(scheduleReview(review, 'easy', now).intervalDays, 10);
});

test('Again returns a card to the first step and tracks the lapse', () => {
  const previous = scheduleReview(undefined, 'easy', new Date('2026-01-01T00:00:00.000Z'));
  const again = scheduleReview(previous, 'again', new Date('2026-01-02T00:00:00.000Z'));
  assert.equal(again.state, 'relearning');
  assert.equal(again.learningStep, 0);
  assert.equal(again.lapseCount, 1);
  assert.equal(again.dueAt, '2026-01-02T00:01:00.000Z');
});

test('review history and scheduling state survive serialization', () => {
  const progress = {
    version: 1,
    reviews: { 'v-water': scheduleReview(undefined, 'good', new Date('2026-01-01T00:00:00.000Z')) },
    reviewHistory: [{ cardId: 'v-water', reviewedAt: '2026-01-01T00:00:00.000Z', rating: 'good', answerCorrect: true, answer: 'water' }],
    wordHuntWords: [],
    petals: 5,
    ownedDecorationIds: [],
    gardenPurchases: [],
    storiesCompleted: [],
    completedLevels: 0,
    dailyGoal: 5,
    dailyActivity: [],
  };
  const reopened = parseProgress(serializeProgress(progress));
  assert.deepEqual(reopened, progress);
  assert.equal(isUserProgress(reopened), true);
  assert.equal(isUserProgress({ ...progress, petals: -1 }), false);
});
