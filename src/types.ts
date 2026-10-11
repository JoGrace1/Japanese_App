export type KanaScript = 'hiragana' | 'katakana';
export type LearningStatus = 'new' | 'learning' | 'mastered';
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';
export type ReviewState = 'new' | 'learning' | 'review' | 'relearning';

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
  romaji?: string;
  pronounce?: string;
  singleKanji?: 'yes' | 'no';
  meaning: string;
  partOfSpeech?: string;
  wordType?: string;
  tags?: string[];
  exampleSentence?: string;
  exampleTranslation?: string;
  exampleJapanese?: string;
  exampleReading?: string;
  exampleMeaning?: string;
  audioRef?: string;
  audioUrl?: string;
  kanji?: string;
  learningStatus?: LearningStatus;
}

export interface KanjiItem {
  id: string;
  character: string;
  readings: { on?: string[]; kun?: string[]; other?: string[] };
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
  state?: ReviewState;
  reviewCount?: number;
  learningStep?: number;
  lapseCount?: number;
  lastReviewedAt?: string;
  difficulty?: number;
  stability?: number;
}

export interface ReviewEvent {
  cardId: string;
  reviewedAt: string;
  rating: ReviewRating;
  answerCorrect?: boolean;
  answer?: string;
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
  studyTimeSeconds?: number;
  storiesCompleted: number;
  sessionsCompleted: number;
  levelsCompleted: number;
}

export interface UserProgress {
  version: 1;
  reviews: Record<string, ReviewRecord>;
  reviewHistory: ReviewEvent[];
  wordHuntWords: VocabularyItem[];
  petalCount: number;
  ownedDecorationIds: string[];
  gardenPurchases: GardenPurchase[];
  restorationStatus?: number;
  unlockedGardenLevels?: string[];
  storiesCompleted: string[];
  completedLevels: number;
  dailyGoal: number;
  dailyActivity: DailyActivity[];
}

export interface StudyCard {
  id: string;
  type: 'kana' | 'vocabulary' | 'kanji';
  kanaScript?: KanaScript;
  front: string;
  reading: string;
  meaning: string;
  kanji?: string;
  kanjiReadings?: { on?: string[]; kun?: string[] };
  exampleWords?: KanjiItem['exampleWords'];
  exampleJapanese?: string;
  exampleMeaning?: string;
  audioRef?: string;
}
