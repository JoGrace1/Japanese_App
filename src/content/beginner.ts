import {
  GardenDecoration,
  KanjiItem,
  KanaCharacter,
  Story,
  StudyCard,
  VocabularyItem,
} from '../types';

export const HIRAGANA: KanaCharacter[] = [
  ['a', 'あ'], ['i', 'い'], ['u', 'う'], ['e', 'え'], ['o', 'お'],
  ['ka', 'か'], ['ki', 'き'], ['ku', 'く'], ['ke', 'け'], ['ko', 'こ'],
  ['sa', 'さ'], ['shi', 'し'], ['su', 'す'], ['se', 'せ'], ['so', 'そ'],
  ['ta', 'た'], ['chi', 'ち'], ['tsu', 'つ'], ['te', 'て'], ['to', 'と'],
  ['na', 'な'], ['ni', 'に'], ['nu', 'ぬ'], ['ne', 'ね'], ['no', 'の'],
].map(([reading, character], index) => ({
  id: `hira-${reading}`,
  character,
  reading,
  script: 'hiragana',
  level: Math.floor(index / 5) + 1,
}));

export const KATAKANA: KanaCharacter[] = [
  ['a', 'ア'], ['i', 'イ'], ['u', 'ウ'], ['e', 'エ'], ['o', 'オ'],
  ['ka', 'カ'], ['ki', 'キ'], ['ku', 'ク'], ['ke', 'ケ'], ['ko', 'コ'],
].map(([reading, character], index) => ({
  id: `kata-${reading}`,
  character,
  reading,
  script: 'katakana',
  level: Math.floor(index / 5) + 1,
}));

export const VOCABULARY: VocabularyItem[] = [
  { id: 'v-hello', japanese: 'こんにちは', reading: 'こんにちは', meaning: 'hello; good afternoon', partOfSpeech: 'greeting', exampleJapanese: 'こんにちは、ゆきさん。', exampleReading: 'こんにちは、ゆきさん。', exampleMeaning: 'Hello, Yuki.' },
  { id: 'v-thanks', japanese: 'ありがとう', reading: 'ありがとう', meaning: 'thank you', partOfSpeech: 'expression' },
  { id: 'v-goodbye', japanese: 'さようなら', reading: 'さようなら', meaning: 'goodbye', partOfSpeech: 'expression' },
  { id: 'v-water', japanese: 'みず', reading: 'みず', meaning: 'water', partOfSpeech: 'noun', exampleJapanese: 'みずを のみます。', exampleReading: 'みずを のみます。', exampleMeaning: 'I drink water.' },
  { id: 'v-tea', japanese: 'おちゃ', reading: 'おちゃ', meaning: 'tea', partOfSpeech: 'noun' },
  { id: 'v-rice', japanese: 'ごはん', reading: 'ごはん', meaning: 'rice; meal', partOfSpeech: 'noun' },
  { id: 'v-cat', japanese: 'ねこ', reading: 'ねこ', meaning: 'cat', partOfSpeech: 'noun' },
  { id: 'v-dog', japanese: 'いぬ', reading: 'いぬ', meaning: 'dog', partOfSpeech: 'noun' },
  { id: 'v-person', japanese: 'ひと', reading: 'ひと', meaning: 'person', partOfSpeech: 'noun' },
  { id: 'v-house', japanese: 'いえ', reading: 'いえ', meaning: 'house; home', partOfSpeech: 'noun' },
  { id: 'v-book', japanese: 'ほん', reading: 'ほん', meaning: 'book', partOfSpeech: 'noun' },
  { id: 'v-flower', japanese: 'はな', reading: 'はな', meaning: 'flower', partOfSpeech: 'noun' },
  { id: 'v-eat', japanese: 'たべます', reading: 'たべます', meaning: 'to eat', partOfSpeech: 'verb' },
  { id: 'v-drink', japanese: 'のみます', reading: 'のみます', meaning: 'to drink', partOfSpeech: 'verb' },
  { id: 'v-go', japanese: 'いきます', reading: 'いきます', meaning: 'to go', partOfSpeech: 'verb' },
  { id: 'v-big', japanese: 'おおきい', reading: 'おおきい', meaning: 'big', partOfSpeech: 'adjective' },
  { id: 'v-small', japanese: 'ちいさい', reading: 'ちいさい', meaning: 'small', partOfSpeech: 'adjective' },
  { id: 'v-one', japanese: 'いち', reading: 'いち', meaning: 'one', partOfSpeech: 'number' },
  { id: 'v-two', japanese: 'に', reading: 'に', meaning: 'two', partOfSpeech: 'number' },
  { id: 'v-three', japanese: 'さん', reading: 'さん', meaning: 'three', partOfSpeech: 'number' },
];

export const STORIES: Story[] = [
  {
    id: 'morning-garden',
    title: 'A morning in the garden',
    difficulty: 'A1 · Starter',
    japaneseText: 'おはようございます。はなを みます。ねこが います。',
    translation: 'Good morning. I look at the flowers. There is a cat.',
    vocabulary: [
      { japanese: 'おはようございます', reading: 'おはようございます', meaning: 'good morning' },
      { japanese: 'はな', reading: 'はな', meaning: 'flower' },
      { japanese: 'みます', reading: 'みます', meaning: 'to see; to look' },
      { japanese: 'ねこ', reading: 'ねこ', meaning: 'cat' },
      { japanese: 'います', reading: 'います', meaning: 'there is (a living thing)' },
    ],
  },
  {
    id: 'tea-time',
    title: 'Tea time',
    difficulty: 'A1 · Starter',
    japaneseText: 'おちゃを のみます。ほんを よみます。',
    translation: 'I drink tea. I read a book.',
    vocabulary: [
      { japanese: 'おちゃ', reading: 'おちゃ', meaning: 'tea' },
      { japanese: 'のみます', reading: 'のみます', meaning: 'to drink' },
      { japanese: 'ほん', reading: 'ほん', meaning: 'book' },
      { japanese: 'よみます', reading: 'よみます', meaning: 'to read' },
    ],
  },
  {
    id: 'yuki-and-the-dog',
    title: 'Yuki and the dog',
    difficulty: 'A1 · Starter',
    japaneseText: 'ゆきさんは いぬと いえに います。',
    translation: 'Yuki is at home with a dog.',
    vocabulary: [
      { japanese: 'ゆきさん', reading: 'ゆきさん', meaning: 'Yuki (polite)' },
      { japanese: 'いぬ', reading: 'いぬ', meaning: 'dog' },
      { japanese: 'いえ', reading: 'いえ', meaning: 'house; home' },
      { japanese: 'います', reading: 'います', meaning: 'there is; to be (living)' },
    ],
  },
];

export const INTRODUCTORY_KANJI: KanjiItem[] = [
  { id: 'kanji-one', character: '一', readings: { on: ['いち'], kun: ['ひと'] }, meanings: ['one'], exampleWords: [{ japanese: '一つ', reading: 'ひとつ', meaning: 'one thing' }] },
  { id: 'kanji-person', character: '人', readings: { on: ['じん', 'にん'], kun: ['ひと'] }, meanings: ['person'], exampleWords: [{ japanese: '人', reading: 'ひと', meaning: 'person' }] },
];

export const DECORATIONS: GardenDecoration[] = [
  { id: 'house', name: 'Tea house', emoji: '🏠', price: 0, area: 'house' },
  { id: 'sakura', name: 'Sakura tree', emoji: '🌸', price: 0, area: 'garden' },
  { id: 'lantern', name: 'Stone lantern', emoji: '🏮', price: 8, area: 'garden' },
  { id: 'pond', name: 'Little pond', emoji: '🪷', price: 12, area: 'garden' },
  { id: 'bamboo', name: 'Bamboo', emoji: '🎋', price: 15, area: 'garden' },
  { id: 'maneki', name: 'Lucky cat', emoji: '🐈', price: 20, area: 'house' },
];

export const STUDY_CARDS: StudyCard[] = [
  ...HIRAGANA.map((kana) => ({
    id: kana.id,
    type: 'kana' as const,
    kanaScript: kana.script,
    front: kana.character,
    reading: kana.reading,
    meaning: `The hiragana sound "${kana.reading}"`,
  })),
  ...KATAKANA.map((kana) => ({
    id: kana.id,
    type: 'kana' as const,
    kanaScript: kana.script,
    front: kana.character,
    reading: kana.reading,
    meaning: `The katakana sound "${kana.reading}"`,
  })),
  ...VOCABULARY.map((word) => ({
    id: word.id,
    type: 'vocabulary' as const,
    front: word.japanese,
    reading: word.reading,
    meaning: word.meaning,
    exampleJapanese: word.exampleJapanese,
    exampleMeaning: word.exampleMeaning,
    audioRef: word.audioRef,
  })),
];
