import { ReviewRecord, ReviewRating } from '../types';

export function isDue(record: ReviewRecord | undefined, now: Date = new Date()): boolean {
  return Boolean(record && new Date(record.dueAt).getTime() <= now.getTime());
}

export function scheduleReview(
  previous: ReviewRecord | undefined,
  rating: ReviewRating,
  now: Date = new Date(),
): ReviewRecord {
  const introducedAt = previous?.introducedAt ?? now.toISOString();
  const successes = (previous?.successes ?? 0) + (rating === 'again' ? 0 : 1);
  let intervalDays = previous?.intervalDays ?? 0;
  let dueAt = new Date(now);

  if (rating === 'again') {
    dueAt.setMinutes(dueAt.getMinutes() + 5);
  } else if (rating === 'hard') {
    intervalDays = Math.max(0.5, intervalDays * 1.2);
    dueAt.setTime(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  } else if (rating === 'good') {
    intervalDays = intervalDays === 0 ? 1 : Math.max(1, intervalDays * 2);
    dueAt.setTime(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  } else {
    intervalDays = intervalDays === 0 ? 4 : Math.max(4, intervalDays * 2.5);
    dueAt.setTime(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  }

  return { introducedAt, dueAt: dueAt.toISOString(), successes, intervalDays };
}

export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
