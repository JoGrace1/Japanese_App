import type { StudyCard, VocabularyItem } from '../types';

export const SESSION_CARD_LIMIT = 10;

export function includeDiscoveredWords(
  cards: StudyCard[],
  words: VocabularyItem[],
): StudyCard[] {
  const existingReadings = new Set(
    cards.filter((card) => card.type === 'vocabulary').map((card) => card.reading),
  );
  const discoveredCards = words
    .filter((word) => !existingReadings.has(word.reading))
    .map((word): StudyCard => ({
      id: word.id,
      type: 'vocabulary',
      front: word.japanese,
      reading: word.reading,
      meaning: word.meaning,
      kanji: word.kanji,
      exampleJapanese: word.exampleJapanese,
      exampleMeaning: word.exampleMeaning,
      audioRef: word.audioRef,
    }));

  return [...cards, ...discoveredCards];
}

export function getNewWordHuntWords(
  foundWords: VocabularyItem[],
  savedWords: VocabularyItem[],
): VocabularyItem[] {
  const savedReadings = new Set(savedWords.map((word) => word.reading));
  return foundWords.filter((word) => !savedReadings.has(word.reading));
}

export function selectStudySessionCards(
  cards: StudyCard[],
  preserveOrder = false,
  limit = SESSION_CARD_LIMIT,
): string[] {
  const selected = [...cards];
  if (!preserveOrder) {
    for (let index = selected.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [selected[index], selected[swapIndex]] = [selected[swapIndex], selected[index]];
    }
  }
  return selected.slice(0, limit).map((card) => card.id);
}
