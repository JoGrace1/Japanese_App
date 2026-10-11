import assert from 'node:assert/strict';
import test from 'node:test';
import { A1_VOCABULARY } from '../src/content/a1Vocabulary.ts';
import { createVocabularyKanji } from '../src/content/kanjiVocabulary.ts';
import { checkAnswer } from '../src/review/answerChecking.ts';
import {
  createKanjiStudyCards,
  getNewWordHuntWords,
  includeDiscoveredWords,
  selectStudySessionCards,
} from '../src/review/cardDeck.ts';
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

test('discovered Word Hunt words are included in the main flashcard deck without duplicates', () => {
  const baseCards = [{
    id: 'v-water',
    type: 'vocabulary',
    front: '水',
    reading: 'みず',
    meaning: 'water',
  }];
  const discoveredWords = [
    { id: 'wh-water', japanese: 'みず', reading: 'みず', meaning: 'water' },
    { id: 'wh-mountain', japanese: 'やま', reading: 'やま', meaning: 'mountain' },
  ];

  const cards = includeDiscoveredWords(baseCards, discoveredWords);

  assert.equal(cards.length, 2);
  assert.deepEqual(cards[1], {
    id: 'wh-mountain',
    type: 'vocabulary',
    front: 'やま',
    reading: 'やま',
    meaning: 'mountain',
    kanji: undefined,
    exampleJapanese: undefined,
    exampleMeaning: undefined,
    audioRef: undefined,
  });
});

test('A1 words can be saved to the Word Hunt deck even when already in the main deck', () => {
  const foundWords = [
    { id: 'a1-hello', japanese: 'こんにちは', reading: 'こんにちは', meaning: 'hello' },
    { id: 'a1-cat', japanese: 'ねこ', reading: 'ねこ', meaning: 'cat' },
  ];
  const savedWords = [{ id: 'a1-cat', japanese: 'ねこ', reading: 'ねこ', meaning: 'cat' }];

  assert.deepEqual(getNewWordHuntWords(foundWords, savedWords), [foundWords[0]]);
});

test('every flashcard category session selector is capped at 10 cards', () => {
  const cards = Array.from({ length: 20 }, (_, index) => ({
    id: `card-${index}`,
    type: 'vocabulary',
    front: `word-${index}`,
    reading: `reading-${index}`,
    meaning: `meaning-${index}`,
  }));

  assert.equal(selectStudySessionCards(cards).length, 10);
  assert.deepEqual(
    selectStudySessionCards(cards, true),
    cards.slice(0, 10).map((card) => card.id),
  );
});

test('kanji flashcards teach single characters and link readings to example words', () => {
  const cards = createKanjiStudyCards([{
    id: 'kanji-book',
    character: '本',
    readings: { on: ['ほん'], kun: ['もと'] },
    meanings: ['book', 'origin'],
    exampleWords: [
      { japanese: '本', reading: 'ほん', meaning: 'book' },
      { japanese: '日本', reading: 'にほん', meaning: 'Japan' },
    ],
  }]);

  assert.equal(cards.length, 1);
  assert.equal(cards[0].type, 'kanji');
  assert.equal(cards[0].front, '本');
  assert.equal(cards[0].reading, 'ほん・もと');
  assert.deepEqual(cards[0].meaning, 'book; origin');
  assert.equal(cards[0].exampleWords[1].reading, 'にほん');
});

test('kanji deck includes every distinct kanji tagged in A1 vocabulary', () => {
  const kanji = createVocabularyKanji(A1_VOCABULARY);
  const cards = createKanjiStudyCards(kanji);
  const taggedCharacters = new Set(
    A1_VOCABULARY
      .filter((word) => word.singleKanji === 'yes')
      .flatMap((word) => [...word.japanese].filter((character) => /[\u4e00-\u9fff々〆ヵヶ]/u.test(character))),
  );
  const cardsByCharacter = new Map(cards.map((card) => [card.front, card]));

  assert.deepEqual(
    [...taggedCharacters].filter((character) => !cardsByCharacter.has(character)),
    [],
  );
  assert.equal(new Set(cards.map((card) => card.front)).size, cards.length);

  const flower = cardsByCharacter.get('花');
  assert.ok(flower);
  assert.equal(flower.type, 'kanji');
  assert.ok(flower.reading.split('・').includes('はな'));
  assert.ok(flower.meaning.includes('flower'));
  assert.ok(flower.exampleWords.some((word) => word.japanese === '花' && word.reading === 'はな'));
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
    petalCount: 5,
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
  assert.equal(isUserProgress({ ...progress, petalCount: -1 }), false);
});
