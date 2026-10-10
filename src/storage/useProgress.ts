import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { DECORATIONS } from '../content/beginner';
import { localDateKey, scheduleReview } from '../review/scheduling';
import { DailyActivity, ReviewEvent, ReviewRating, ReviewRecord, UserProgress, VocabularyItem } from '../types';

const STORAGE_KEY = 'sakura-garden-progress-v1';
const INITIAL_PROGRESS: UserProgress = {
  version: 1,
  reviews: {},
  reviewHistory: [],
  wordHuntWords: [],
  petals: 5,
  ownedDecorationIds: ['house', 'sakura'],
  gardenPurchases: [],
  storiesCompleted: [],
  completedLevels: 0,
  dailyGoal: 5,
  dailyActivity: [],
};

function updateDailyActivity(
  activities: DailyActivity[],
  date: string,
  changes: Partial<Omit<DailyActivity, 'date'>>,
): DailyActivity[] {
  const previous = activities.find((activity) => activity.date === date);
  const updated: DailyActivity = {
    date,
    reviewAttempts: (previous?.reviewAttempts ?? 0) + (changes.reviewAttempts ?? 0),
    successfulReviews: (previous?.successfulReviews ?? 0) + (changes.successfulReviews ?? 0),
    storiesCompleted: (previous?.storiesCompleted ?? 0) + (changes.storiesCompleted ?? 0),
    sessionsCompleted: (previous?.sessionsCompleted ?? 0) + (changes.sessionsCompleted ?? 0),
    levelsCompleted: (previous?.levelsCompleted ?? 0) + (changes.levelsCompleted ?? 0),
  };
  return previous
    ? activities.map((activity) => activity.date === date ? updated : activity)
    : [...activities, updated];
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canPersist, setCanPersist] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isUserProgress(parsed)) setProgress({ ...parsed, wordHuntWords: parsed.wordHuntWords ?? [] });
          else throw new Error('Saved learning progress has an unsupported format.');
        }
        setCanPersist(true);
        setIsLoaded(true);
      })
      .catch((error: unknown) => {
        console.error('Could not load Sakura Garden progress.', error);
        if (mounted) {
          setStorageError('Saved progress could not be loaded. Changes may not be saved.');
          setIsLoaded(true);
        }
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isLoaded || !canPersist) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      .then(() => setStorageError(null))
      .catch((error: unknown) => {
        console.error('Could not save Sakura Garden progress.', error);
        setStorageError('Progress could not be saved. Please check device storage.');
      });
  }, [canPersist, isLoaded, progress]);

  const recordReview = useCallback((cardId: string, rating: ReviewRating) => {
    setProgress((current) => {
      const now = new Date();
      return {
        ...current,
        reviews: { ...current.reviews, [cardId]: scheduleReview(current.reviews[cardId], rating, now) },
        reviewHistory: [...current.reviewHistory, { cardId, rating, reviewedAt: now.toISOString() }],
        dailyActivity: updateDailyActivity(current.dailyActivity, localDateKey(now), {
          reviewAttempts: 1,
          successfulReviews: rating === 'again' ? 0 : 1,
        }),
      };
    });
  }, []);

  const addWordHuntWords = useCallback((words: VocabularyItem[]) => {
    setProgress((current) => {
      const existingIds = new Set(current.wordHuntWords.map((word) => word.id));
      const newWords = words.filter((word) => !existingIds.has(word.id));
      return newWords.length
        ? { ...current, wordHuntWords: [...current.wordHuntWords, ...newWords] }
        : current;
    });
  }, []);

  const awardActivity = useCallback((petals: number, level?: number) => {
    setProgress((current) => {
      const today = localDateKey();
      return {
        ...current,
        petals: current.petals + petals,
        completedLevels: level === undefined ? current.completedLevels : Math.max(current.completedLevels, level),
        dailyActivity: updateDailyActivity(current.dailyActivity, today, level === undefined
          ? { sessionsCompleted: 1 }
          : { levelsCompleted: 1 }),
      };
    });
  }, []);

  const completeStory = useCallback((storyId: string) => {
    setProgress((current) => current.storiesCompleted.includes(storyId)
      ? current
      : {
          ...current,
          storiesCompleted: [...current.storiesCompleted, storyId],
          petals: current.petals + 2,
          dailyActivity: updateDailyActivity(current.dailyActivity, localDateKey(), { storiesCompleted: 1 }),
        });
  }, []);

  const buyDecoration = useCallback((decorationId: string): void => {
    const decoration = DECORATIONS.find((item) => item.id === decorationId);
    if (!decoration) return;
    setProgress((current) => {
      if (current.ownedDecorationIds.includes(decorationId) || current.petals < decoration.price) return current;
      return {
        ...current,
        petals: current.petals - decoration.price,
        ownedDecorationIds: [...current.ownedDecorationIds, decorationId],
        gardenPurchases: [...current.gardenPurchases, {
          decorationId,
          purchasedAt: new Date().toISOString(),
          price: decoration.price,
        }],
      };
    });
  }, []);

  return { progress, isLoaded, storageError, recordReview, addWordHuntWords, awardActivity, completeStory, buyDecoration };
}

function isUserProgress(value: unknown): value is UserProgress {
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
    && typeof candidate.petals === 'number'
    && Number.isFinite(candidate.petals)
    && candidate.petals >= 0
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
    && (word.partOfSpeech === undefined || typeof word.partOfSpeech === 'string');
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
    && record.intervalDays >= 0;
}

function isReviewEvent(value: unknown): value is ReviewEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<ReviewEvent>;
  return typeof event.cardId === 'string'
    && typeof event.reviewedAt === 'string'
    && (event.rating === 'again' || event.rating === 'hard' || event.rating === 'good' || event.rating === 'easy');
}
