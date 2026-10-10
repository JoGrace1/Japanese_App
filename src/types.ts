export type KanaScript = 'hiragana' | 'katakana';
export type LearningStatus = 'new' | 'learning' | 'mastered';
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface KanaCharacter {
  id: string;
  character: string;
  reading: string;
  script: KanaScript;
  level: number;
  learningStatus?: LearningStatus;
}

export interface VocabularyItem {
  id: string;
  japanese: string;
  reading: string;
  meaning: string;
  partOfSpeech?: string;
  exampleJapanese?: string;
  exampleReading?: string;
  exampleMeaning?: string;
  audioRef?: string;
  learningStatus?: LearningStatus;
}

export interface KanjiItem {
  id: string;
  character: string;
  readings: { on?: string[]; kun?: string[] };
  meanings: string[];
  exampleWords: { japanese: string; reading: string; meaning: string }[];
}

export interface StoryWord {
  japanese: string;
  reading: string;
  meaning: string;
}

export interface Story {
  id: string;
  title: string;
  difficulty: 'A1 · Starter';
  japaneseText: string;
  translation: string;
  vocabulary: StoryWord[];
  audioRef?: string;
}

export interface ReviewRecord {
  introducedAt: string;
  dueAt: string;
  successes: number;
  intervalDays: number;
}

export interface ReviewEvent {
  cardId: string;
  reviewedAt: string;
  rating: ReviewRating;
}

export interface GardenDecoration {
  id: string;
  name: string;
  emoji: string;
  price: number;
  area: 'garden' | 'house';
}

export interface GardenPurchase {
  decorationId: string;
  purchasedAt: string;
  price: number;
}

export interface DailyActivity {
  date: string;
  reviewAttempts: number;
  successfulReviews: number;
  storiesCompleted: number;
  sessionsCompleted: number;
  levelsCompleted: number;
}

export interface UserProgress {
  version: 1;
  reviews: Record<string, ReviewRecord>;
  reviewHistory: ReviewEvent[];
  wordHuntWords: VocabularyItem[];
  petals: number;
  ownedDecorationIds: string[];
  gardenPurchases: GardenPurchase[];
  storiesCompleted: string[];
  completedLevels: number;
  dailyGoal: number;
  dailyActivity: DailyActivity[];
}

export interface StudyCard {
  id: string;
  type: 'kana' | 'vocabulary';
  kanaScript?: KanaScript;
  front: string;
  reading: string;
  meaning: string;
  exampleJapanese?: string;
  exampleMeaning?: string;
  audioRef?: string;
}
