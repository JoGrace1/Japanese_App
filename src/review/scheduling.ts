import type { ReviewRecord, ReviewRating, ReviewState } from '../types';

export interface SchedulerConfig {
  learningStepsMinutes: number[];
  graduatingIntervalDays: number;
  easyIntervalDays: number;
  hardMultiplier: number;
  goodMultiplier: number;
  easyMultiplier: number;
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  learningStepsMinutes: [1, 10],
  graduatingIntervalDays: 1,
  easyIntervalDays: 4,
  hardMultiplier: 1.2,
  goodMultiplier: 2,
  easyMultiplier: 2.5,
};

export interface ReviewScheduler {
  schedule(previous: ReviewRecord | undefined, rating: ReviewRating, now?: Date): ReviewRecord;
}

export function isDue(record: ReviewRecord | undefined, now: Date = new Date()): boolean {
  return Boolean(record && new Date(record.dueAt).getTime() <= now.getTime());
}

export function scheduleReview(
  previous: ReviewRecord | undefined,
  rating: ReviewRating,
  now: Date = new Date(),
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
): ReviewRecord {
  if (config.learningStepsMinutes.length === 0
    || config.learningStepsMinutes.some((minutes) => !Number.isFinite(minutes) || minutes < 0)
    || !Number.isFinite(config.graduatingIntervalDays) || config.graduatingIntervalDays <= 0
    || !Number.isFinite(config.easyIntervalDays) || config.easyIntervalDays <= 0
    || !Number.isFinite(config.hardMultiplier) || config.hardMultiplier <= 0
    || !Number.isFinite(config.goodMultiplier) || config.goodMultiplier <= 0
    || !Number.isFinite(config.easyMultiplier) || config.easyMultiplier <= 0) {
    throw new RangeError('Scheduler configuration must use non-negative learning steps and positive intervals and multipliers.');
  }
  const introducedAt = previous?.introducedAt ?? now.toISOString();
  const successes = (previous?.successes ?? 0) + (rating === 'again' ? 0 : 1);
  const reviewCount = (previous?.reviewCount ?? previous?.successes ?? 0) + 1;
  const wasLearning = previous?.state === 'new'
    || previous?.state === 'learning'
    || previous?.state === 'relearning'
    || (!previous?.state && (previous?.intervalDays ?? 0) === 0);
  let intervalDays = previous?.intervalDays ?? 0;
  let state: ReviewState = previous?.state ?? 'new';
  let learningStep = previous?.learningStep ?? 0;
  let lapseCount = previous?.lapseCount ?? 0;
  let dueAt = new Date(now);

  if (rating === 'again') {
    lapseCount += 1;
    state = previous ? 'relearning' : 'learning';
    learningStep = 0;
    intervalDays = 0;
    dueAt.setTime(now.getTime() + config.learningStepsMinutes[0] * 60 * 1000);
  } else if (wasLearning && rating !== 'easy') {
    const currentStep = Math.min(learningStep, config.learningStepsMinutes.length - 1);
    if (rating === 'hard') {
      state = previous?.state === 'relearning' ? 'relearning' : 'learning';
      learningStep = currentStep;
      dueAt.setTime(now.getTime() + config.learningStepsMinutes[currentStep] * 60 * 1000);
    } else if (currentStep < config.learningStepsMinutes.length - 1) {
      state = previous?.state === 'relearning' ? 'relearning' : 'learning';
      learningStep = currentStep + 1;
      dueAt.setTime(now.getTime() + config.learningStepsMinutes[learningStep] * 60 * 1000);
    } else {
      state = 'review';
      learningStep = 0;
      intervalDays = config.graduatingIntervalDays;
      dueAt.setTime(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    }
  } else {
    state = 'review';
    learningStep = 0;
    if (rating === 'easy') {
      intervalDays = previous?.state === 'review'
        ? Math.max(config.easyIntervalDays, intervalDays * config.easyMultiplier)
        : config.easyIntervalDays;
    } else if (rating === 'hard' && previous?.state === 'review') {
      intervalDays = Math.max(config.graduatingIntervalDays, intervalDays * config.hardMultiplier);
    } else if (previous?.state === 'review') {
      intervalDays = Math.max(config.graduatingIntervalDays, intervalDays * config.goodMultiplier);
    } else {
      intervalDays = config.graduatingIntervalDays;
    }
    dueAt.setTime(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  }

  if (rating === 'good' && !wasLearning && previous?.state !== 'review') {
    intervalDays = config.graduatingIntervalDays;
    dueAt.setTime(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  }

  return {
    introducedAt,
    dueAt: dueAt.toISOString(),
    successes,
    intervalDays,
    state,
    reviewCount,
    learningStep,
    lapseCount,
    lastReviewedAt: now.toISOString(),
    difficulty: previous?.difficulty ?? 5,
    stability: intervalDays,
  };
}

export const defaultScheduler: ReviewScheduler = {
  schedule: (previous, rating, now) => scheduleReview(previous, rating, now),
};

export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
