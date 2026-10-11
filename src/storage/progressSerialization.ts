import type {
  ReviewEvent,
  ReviewRecord,
  UserProgress,
  VocabularyItem,
} from '../types';

export function serializeProgress(progress: UserProgress): string {
  return JSON.stringify(progress);
}

export function parseProgress(serialized: string): unknown {
  const parsed: unknown = JSON.parse(serialized);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return parsed;

  const saved = parsed as Record<string, unknown>;
  if (!('petals' in saved)) return parsed;
  const { petals, ...currentFields } = saved;
  return {
    ...currentFields,
    petalCount: saved.petalCount ?? petals,
  };
}

export function isUserProgress(value: unknown): value is UserProgress {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<UserProgress>;
  return candidate.version === 1
    && candidate.reviews !== null
    && typeof candidate.reviews === 'object'
    && !Array.isArray(candidate.reviews)
    && Array.isArray(candidate.reviewHistory)
    && candidate.reviewHistory.every(isReviewEvent)
    && (candidate.wordHuntWords === undefined
      || (Array.isArray(candidate.wordHuntWords) && candidate.wordHuntWords.every(isVocabularyItem)))
    && Object.values(candidate.reviews).every(isReviewRecord)
    && typeof candidate.petalCount === 'number'
    && Number.isInteger(candidate.petalCount)
    && candidate.petalCount >= 0
    && Array.isArray(candidate.ownedDecorationIds)
    && candidate.ownedDecorationIds.every((id) => typeof id === 'string')
    && Array.isArray(candidate.gardenPurchases)
    && candidate.gardenPurchases.every((purchase) => Boolean(
      purchase
      && typeof purchase.decorationId === 'string'
      && typeof purchase.purchasedAt === 'string'
      && Number.isFinite(purchase.price)
      && purchase.price >= 0,
    ))
    && (candidate.restorationStatus === undefined
      || (Number.isInteger(candidate.restorationStatus)
        && candidate.restorationStatus >= 0
        && candidate.restorationStatus <= 100))
    && (candidate.unlockedGardenLevels === undefined
      || (Array.isArray(candidate.unlockedGardenLevels)
        && candidate.unlockedGardenLevels.every((level) => typeof level === 'string')))
    && Array.isArray(candidate.storiesCompleted)
    && candidate.storiesCompleted.every((storyId) => typeof storyId === 'string')
    && typeof candidate.completedLevels === 'number'
    && Number.isInteger(candidate.completedLevels)
    && candidate.completedLevels >= 0
    && typeof candidate.dailyGoal === 'number'
    && Number.isInteger(candidate.dailyGoal)
    && candidate.dailyGoal > 0
    && Array.isArray(candidate.dailyActivity)
    && candidate.dailyActivity.every((activity) => Boolean(
      activity
      && typeof activity.date === 'string'
      && Number.isInteger(activity.reviewAttempts)
      && activity.reviewAttempts >= 0
      && Number.isInteger(activity.successfulReviews)
      && activity.successfulReviews >= 0
      && (activity.studyTimeSeconds === undefined
        || (Number.isInteger(activity.studyTimeSeconds) && activity.studyTimeSeconds >= 0))
      && Number.isInteger(activity.storiesCompleted)
      && activity.storiesCompleted >= 0
      && Number.isInteger(activity.sessionsCompleted)
      && activity.sessionsCompleted >= 0
      && Number.isInteger(activity.levelsCompleted)
      && activity.levelsCompleted >= 0,
    ));
}

function isVocabularyItem(value: unknown): value is VocabularyItem {
  if (!value || typeof value !== 'object') return false;
  const word = value as Partial<VocabularyItem>;
  return typeof word.id === 'string'
    && typeof word.japanese === 'string'
    && typeof word.reading === 'string'
    && typeof word.meaning === 'string'
    && (word.partOfSpeech === undefined || typeof word.partOfSpeech === 'string')
    && (word.romaji === undefined || typeof word.romaji === 'string')
    && (word.wordType === undefined || typeof word.wordType === 'string')
    && (word.tags === undefined || (Array.isArray(word.tags) && word.tags.every((tag) => typeof tag === 'string')))
    && (word.exampleSentence === undefined || typeof word.exampleSentence === 'string')
    && (word.exampleTranslation === undefined || typeof word.exampleTranslation === 'string')
    && (word.exampleJapanese === undefined || typeof word.exampleJapanese === 'string')
    && (word.exampleReading === undefined || typeof word.exampleReading === 'string')
    && (word.exampleMeaning === undefined || typeof word.exampleMeaning === 'string')
    && (word.audioUrl === undefined || typeof word.audioUrl === 'string')
    && (word.audioRef === undefined || typeof word.audioRef === 'string')
    && (word.kanji === undefined || typeof word.kanji === 'string');
}

function isReviewRecord(value: unknown): value is ReviewRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<ReviewRecord>;
  return typeof record.introducedAt === 'string'
    && typeof record.dueAt === 'string'
    && Number.isInteger(record.successes)
    && (record.successes ?? -1) >= 0
    && typeof record.intervalDays === 'number'
    && Number.isFinite(record.intervalDays)
    && record.intervalDays >= 0
    && (record.state === undefined || ['new', 'learning', 'review', 'relearning'].includes(record.state))
    && (record.reviewCount === undefined || (Number.isInteger(record.reviewCount) && record.reviewCount >= 0))
    && (record.learningStep === undefined || (Number.isInteger(record.learningStep) && record.learningStep >= 0))
    && (record.lapseCount === undefined || (Number.isInteger(record.lapseCount) && record.lapseCount >= 0))
    && (record.lastReviewedAt === undefined || typeof record.lastReviewedAt === 'string')
    && (record.difficulty === undefined || Number.isFinite(record.difficulty))
    && (record.stability === undefined || Number.isFinite(record.stability));
}

function isReviewEvent(value: unknown): value is ReviewEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<ReviewEvent>;
  return typeof event.cardId === 'string'
    && typeof event.reviewedAt === 'string'
    && (event.rating === 'again' || event.rating === 'hard' || event.rating === 'good' || event.rating === 'easy')
    && (event.answerCorrect === undefined || typeof event.answerCorrect === 'boolean')
    && (event.answer === undefined || typeof event.answer === 'string');
}
