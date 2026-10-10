import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { DECORATIONS } from '../content/beginner';
import { defaultScheduler, localDateKey } from '../review/scheduling';
import { isUserProgress, parseProgress, serializeProgress } from './progressSerialization';
import { DailyActivity, ReviewRating, UserProgress, VocabularyItem } from '../types';

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
    studyTimeSeconds: (previous?.studyTimeSeconds ?? 0) + (changes.studyTimeSeconds ?? 0),
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
          const parsed = parseProgress(stored);
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
    AsyncStorage.setItem(STORAGE_KEY, serializeProgress(progress))
      .then(() => setStorageError(null))
      .catch((error: unknown) => {
        console.error('Could not save Sakura Garden progress.', error);
        setStorageError('Progress could not be saved. Please check device storage.');
      });
  }, [canPersist, isLoaded, progress]);

  const recordReview = useCallback((
    cardId: string,
    rating: ReviewRating,
    answerCorrect?: boolean,
    answer?: string,
  ) => {
    setProgress((current) => {
      const now = new Date();
      return {
        ...current,
        reviews: { ...current.reviews, [cardId]: defaultScheduler.schedule(current.reviews[cardId], rating, now) },
        reviewHistory: [...current.reviewHistory, {
          cardId,
          rating,
          reviewedAt: now.toISOString(),
          ...(answerCorrect === undefined ? {} : { answerCorrect }),
          ...(answer === undefined ? {} : { answer }),
        }],
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

  const awardActivity = useCallback((petals: number, level?: number, studyTimeSeconds = 0) => {
    setProgress((current) => {
      const today = localDateKey();
      return {
        ...current,
        petals: current.petals + petals,
        completedLevels: level === undefined ? current.completedLevels : Math.max(current.completedLevels, level),
        dailyActivity: updateDailyActivity(current.dailyActivity, today, level === undefined
          ? { sessionsCompleted: 1, studyTimeSeconds: Math.max(0, Math.floor(studyTimeSeconds)) }
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
