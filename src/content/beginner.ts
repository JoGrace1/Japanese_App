import {
  KanjiItem,
  KanaCharacter,
  Story,
  StudyCard,
  VocabularyItem,
} from '../types';
import { A1_VOCABULARY } from './a1Vocabulary';
import { createVocabularyKanji } from './kanjiVocabulary';

export const HIRAGANA: KanaCharacter[] = [
  ['a', 'あ'], ['i', 'い'], ['u', 'う'], ['e', 'え'], ['o', 'お'],
  ['ka', 'か'], ['ki', 'き'], ['ku', 'く'], ['ke', 'け'], ['ko', 'こ'],
  ['sa', 'さ'], ['shi', 'し'], ['su', 'す'], ['se', 'せ'], ['so', 'そ'],
  ['ta', 'た'], ['chi', 'ち'], ['tsu', 'つ'], ['te', 'て'], ['to', 'と'],
  ['na', 'な'], ['ni', 'に'], ['nu', 'ぬ'], ['ne', 'ね'], ['no', 'の'],
  ['ha', 'は'], ['hi', 'ひ'], ['fu', 'ふ'], ['he', 'へ'], ['ho', 'ほ'],
  ['ma', 'ま'], ['mi', 'み'], ['mu', 'む'], ['me', 'め'], ['mo', 'も'],
  ['ya', 'や'], ['yu', 'ゆ'], ['yo', 'よ'],
  ['ra', 'ら'], ['ri', 'り'], ['ru', 'る'], ['re', 'れ'], ['ro', 'ろ'],
  ['wa', 'わ'], ['wo', 'を'], ['n', 'ん'],
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
  ['sa', 'サ'], ['shi', 'シ'], ['su', 'ス'], ['se', 'セ'], ['so', 'ソ'],
  ['ta', 'タ'], ['chi', 'チ'], ['tsu', 'ツ'], ['te', 'テ'], ['to', 'ト'],
  ['na', 'ナ'], ['ni', 'ニ'], ['nu', 'ヌ'], ['ne', 'ネ'], ['no', 'ノ'],
  ['ha', 'ハ'], ['hi', 'ヒ'], ['fu', 'フ'], ['he', 'ヘ'], ['ho', 'ホ'],
  ['ma', 'マ'], ['mi', 'ミ'], ['mu', 'ム'], ['me', 'メ'], ['mo', 'モ'],
  ['ya', 'ヤ'], ['yu', 'ユ'], ['yo', 'ヨ'],
  ['ra', 'ラ'], ['ri', 'リ'], ['ru', 'ル'], ['re', 'レ'], ['ro', 'ロ'],
  ['wa', 'ワ'], ['wo', 'ヲ'], ['n', 'ン'],
].map(([reading, character], index) => ({
  id: `kata-${reading}`,
  character,
  reading,
  script: 'katakana',
  level: Math.floor(index / 5) + 1,
}));

const ROMAJI_BY_KANA: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
};

const COMBINED_ROMAJI: Record<string, string> = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo', しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho', にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo', みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo', ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo', びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
};

function kanaToRomaji(reading: string): string {
  const kana = Array.from(reading);
  let result = '';
  for (let index = 0; index < kana.length; index += 1) {
    const pair = kana[index] + (kana[index + 1] ?? '');
    if (COMBINED_ROMAJI[pair]) {
      result += COMBINED_ROMAJI[pair];
      index += 1;
    } else if (kana[index] === 'っ' && kana[index + 1]) {
      const next = ROMAJI_BY_KANA[kana[index + 1]] ?? '';
      result += next[0] === 'c' ? 't' : next[0];
    } else {
      result += ROMAJI_BY_KANA[kana[index]] ?? kana[index];
    }
  }
  return result;
}

// export const VOCABULARY: VocabularyItem[] = [
//   { id: 'v-hello', japanese: 'こんにちは', reading: 'こんにちは', meaning: 'hello; good afternoon', partOfSpeech: 'greeting', exampleJapanese: 'こんにちは、ゆきさん。', exampleReading: 'こんにちは、ゆきさん。', exampleMeaning: 'Hello, Yuki.' },
//   { id: 'v-thanks', japanese: 'ありがとう', reading: 'ありがとう', meaning: 'thank you', partOfSpeech: 'expression' },
//   { id: 'v-goodbye', japanese: 'さようなら', reading: 'さようなら', meaning: 'goodbye', partOfSpeech: 'expression' },
//   { id: 'v-water', japanese: 'みず', reading: 'みず', kanji: '水', meaning: 'water', partOfSpeech: 'noun', exampleJapanese: 'みずを のみます。', exampleReading: 'みずを のみます。', exampleMeaning: 'I drink water.' },
//   { id: 'v-tea', japanese: 'おちゃ', reading: 'おちゃ', meaning: 'tea', partOfSpeech: 'noun' },
//   { id: 'v-rice', japanese: 'ごはん', reading: 'ごはん', meaning: 'rice; meal', partOfSpeech: 'noun' },
//   { id: 'v-cat', japanese: 'ねこ', reading: 'ねこ', meaning: 'cat', partOfSpeech: 'noun' },
//   { id: 'v-dog', japanese: 'いぬ', reading: 'いぬ', meaning: 'dog', partOfSpeech: 'noun' },
//   { id: 'v-person', japanese: 'ひと', reading: 'ひと', kanji: '人', meaning: 'person', partOfSpeech: 'noun' },
//   { id: 'v-house', japanese: 'いえ', reading: 'いえ', meaning: 'house; home', partOfSpeech: 'noun' },
//   { id: 'v-book', japanese: 'ほん', reading: 'ほん', meaning: 'book', partOfSpeech: 'noun' },
//   { id: 'v-flower', japanese: 'はな', reading: 'はな', meaning: 'flower', partOfSpeech: 'noun' },
//   { id: 'v-eat', japanese: 'たべます', reading: 'たべます', meaning: 'to eat', partOfSpeech: 'verb' },
//   { id: 'v-drink', japanese: 'のみます', reading: 'のみます', meaning: 'to drink', partOfSpeech: 'verb' },
//   { id: 'v-go', japanese: 'いきます', reading: 'いきます', meaning: 'to go', partOfSpeech: 'verb' },
//   { id: 'v-big', japanese: 'おおきい', reading: 'おおきい', meaning: 'big', partOfSpeech: 'adjective' },
//   { id: 'v-small', japanese: 'ちいさい', reading: 'ちいさい', meaning: 'small', partOfSpeech: 'adjective' },
//   { id: 'v-one', japanese: 'いち', reading: 'いち', meaning: 'one', partOfSpeech: 'number' },
//   { id: 'v-two', japanese: 'に', reading: 'に', meaning: 'two', partOfSpeech: 'number' },
//   { id: 'v-three', japanese: 'さん', reading: 'さん', meaning: 'three', partOfSpeech: 'number' },
// ].map((word: VocabularyItem) => ({
//   ...word,
//   romaji: word.romaji ?? kanaToRomaji(word.reading),
//   wordType: word.wordType ?? word.partOfSpeech,
//   tags: word.tags ?? ['A1', word.partOfSpeech ?? 'vocabulary'],
//   exampleSentence: word.exampleSentence ?? word.exampleJapanese,
//   exampleTranslation: word.exampleTranslation ?? word.exampleMeaning,
// }));
export const VOCABULARY: VocabularyItem[] = A1_VOCABULARY;
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

const CURATED_KANJI: KanjiItem[] = [
  { id: 'kanji-one', character: '一', readings: { on: ['いち'], kun: ['ひと'] }, meanings: ['one'], exampleWords: [{ japanese: '一つ', reading: 'ひとつ', meaning: 'one thing' }] },
  { id: 'kanji-person', character: '人', readings: { on: ['じん', 'にん'], kun: ['ひと'] }, meanings: ['person'], exampleWords: [{ japanese: '人', reading: 'ひと', meaning: 'person' }] },
  {
    id: 'kanji-book',
    character: '本',
    readings: { on: ['ほん'], kun: ['もと'] },
    meanings: ['book', 'origin'],
    exampleWords: [
      { japanese: '本', reading: 'ほん', meaning: 'book' },
      { japanese: '日本', reading: 'にほん', meaning: 'Japan' },
    ],
  },
  {
    id: 'kanji-day',
    character: '日',
    readings: { on: ['にち', 'じつ'], kun: ['ひ', 'か'] },
    meanings: ['day', 'sun'],
    exampleWords: [
      { japanese: '日', reading: 'ひ', meaning: 'day; sun' },
      { japanese: '日本', reading: 'にほん', meaning: 'Japan' },
    ],
  },
  {
    id: 'kanji-country',
    character: '国',
    readings: { on: ['こく'], kun: ['くに'] },
    meanings: ['country'],
    exampleWords: [{ japanese: '外国', reading: 'がいこく', meaning: 'foreign country' }],
  },
];

export const INTRODUCTORY_KANJI: KanjiItem[] = createVocabularyKanji(VOCABULARY, CURATED_KANJI);

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
    front: word.reading,
    reading: word.reading,
    meaning: word.meaning,
    kanji: word.kanji,
    exampleJapanese: word.exampleReading,
    exampleMeaning: word.exampleMeaning,
    audioRef: word.audioRef,
  })),
];
