import { STORIES, VOCABULARY } from '../content/beginner';
import { KanaScript, VocabularyItem } from '../types';

export interface WordHuntPosition {
  row: number;
  column: number;
}

const BOARD_SIZE = 5;
const MAX_WORD_LENGTH = BOARD_SIZE;
const HIRAGANA_CHARACTERS = Array.from(
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽっゃゅょ',
);

const EXTRA_WORDS: VocabularyItem[] = [
  { id: 'wh-sakura', japanese: 'さくら', reading: 'さくら', meaning: 'cherry blossom', partOfSpeech: 'noun' },
  { id: 'wh-mountain', japanese: 'やま', reading: 'やま', meaning: 'mountain', partOfSpeech: 'noun' },
  { id: 'wh-river', japanese: 'かわ', reading: 'かわ', meaning: 'river', partOfSpeech: 'noun' },
  { id: 'wh-sky', japanese: 'そら', reading: 'そら', meaning: 'sky', partOfSpeech: 'noun' },
  { id: 'wh-cloud', japanese: 'くも', reading: 'くも', meaning: 'cloud; spider', partOfSpeech: 'noun' },
  { id: 'wh-rain', japanese: 'あめ', reading: 'あめ', meaning: 'rain; candy', partOfSpeech: 'noun' },
  { id: 'wh-snow', japanese: 'ゆき', reading: 'ゆき', meaning: 'snow', partOfSpeech: 'noun' },
  { id: 'wh-star', japanese: 'ほし', reading: 'ほし', meaning: 'star', partOfSpeech: 'noun' },
  { id: 'wh-moon', japanese: 'つき', reading: 'つき', meaning: 'moon', partOfSpeech: 'noun' },
  { id: 'wh-sea', japanese: 'うみ', reading: 'うみ', meaning: 'sea', partOfSpeech: 'noun' },
  { id: 'wh-forest', japanese: 'もり', reading: 'もり', meaning: 'forest', partOfSpeech: 'noun' },
  { id: 'wh-road', japanese: 'みち', reading: 'みち', meaning: 'road; way', partOfSpeech: 'noun' },
  { id: 'wh-town', japanese: 'まち', reading: 'まち', meaning: 'town', partOfSpeech: 'noun' },
  { id: 'wh-shop', japanese: 'みせ', reading: 'みせ', meaning: 'shop; store', partOfSpeech: 'noun' },
  { id: 'wh-umbrella', japanese: 'かさ', reading: 'かさ', meaning: 'umbrella', partOfSpeech: 'noun' },
  { id: 'wh-shoes', japanese: 'くつ', reading: 'くつ', meaning: 'shoes', partOfSpeech: 'noun' },
  { id: 'wh-bag', japanese: 'かばん', reading: 'かばん', meaning: 'bag', partOfSpeech: 'noun' },
  { id: 'wh-clock', japanese: 'とけい', reading: 'とけい', meaning: 'clock; watch', partOfSpeech: 'noun' },
  { id: 'wh-phone', japanese: 'でんわ', reading: 'でんわ', meaning: 'telephone', partOfSpeech: 'noun' },
  { id: 'wh-car', japanese: 'くるま', reading: 'くるま', meaning: 'car', partOfSpeech: 'noun' },
  { id: 'wh-train', japanese: 'でんしゃ', reading: 'でんしゃ', meaning: 'train', partOfSpeech: 'noun' },
  { id: 'wh-station', japanese: 'えき', reading: 'えき', meaning: 'station', partOfSpeech: 'noun' },
  { id: 'wh-school', japanese: 'がっこう', reading: 'がっこう', meaning: 'school', partOfSpeech: 'noun' },
  { id: 'wh-teacher', japanese: 'せんせい', reading: 'せんせい', meaning: 'teacher', partOfSpeech: 'noun' },
  { id: 'wh-friend', japanese: 'ともだち', reading: 'ともだち', meaning: 'friend', partOfSpeech: 'noun' },
  { id: 'wh-money', japanese: 'おかね', reading: 'おかね', meaning: 'money', partOfSpeech: 'noun' },
  { id: 'wh-egg', japanese: 'たまご', reading: 'たまご', meaning: 'egg', partOfSpeech: 'noun' },
  { id: 'wh-apple', japanese: 'りんご', reading: 'りんご', meaning: 'apple', partOfSpeech: 'noun' },
  { id: 'wh-orange', japanese: 'みかん', reading: 'みかん', meaning: 'mandarin orange', partOfSpeech: 'noun' },
  { id: 'wh-fruit', japanese: 'くだもの', reading: 'くだもの', meaning: 'fruit', partOfSpeech: 'noun' },
  { id: 'wh-vegetable', japanese: 'やさい', reading: 'やさい', meaning: 'vegetable', partOfSpeech: 'noun' },
  { id: 'wh-morning', japanese: 'あさ', reading: 'あさ', meaning: 'morning', partOfSpeech: 'noun' },
  { id: 'wh-noon', japanese: 'ひる', reading: 'ひる', meaning: 'daytime; noon', partOfSpeech: 'noun' },
  { id: 'wh-night', japanese: 'よる', reading: 'よる', meaning: 'night; evening', partOfSpeech: 'noun' },
  { id: 'wh-today', japanese: 'きょう', reading: 'きょう', meaning: 'today', partOfSpeech: 'noun' },
  { id: 'wh-tomorrow', japanese: 'あした', reading: 'あした', meaning: 'tomorrow', partOfSpeech: 'noun' },
  { id: 'wh-yesterday', japanese: 'きのう', reading: 'きのう', meaning: 'yesterday', partOfSpeech: 'noun' },
  { id: 'wh-letter', japanese: 'てがみ', reading: 'てがみ', meaning: 'letter', partOfSpeech: 'noun' },
  { id: 'wh-photo', japanese: 'しゃしん', reading: 'しゃしん', meaning: 'photograph', partOfSpeech: 'noun' },
  { id: 'wh-music', japanese: 'おんがく', reading: 'おんがく', meaning: 'music', partOfSpeech: 'noun' },
  { id: 'wh-movie', japanese: 'えいが', reading: 'えいが', meaning: 'movie', partOfSpeech: 'noun' },
  { id: 'wh-cooking', japanese: 'りょうり', reading: 'りょうり', meaning: 'cooking; cuisine', partOfSpeech: 'noun' },
  { id: 'wh-hospital', japanese: 'びょういん', reading: 'びょういん', meaning: 'hospital', partOfSpeech: 'noun' },
  { id: 'wh-park', japanese: 'こうえん', reading: 'こうえん', meaning: 'park', partOfSpeech: 'noun' },
  { id: 'wh-bicycle', japanese: 'じてんしゃ', reading: 'じてんしゃ', meaning: 'bicycle', partOfSpeech: 'noun' },
  { id: 'wh-map', japanese: 'ちず', reading: 'ちず', meaning: 'map', partOfSpeech: 'noun' },
  { id: 'wh-ship', japanese: 'ふね', reading: 'ふね', meaning: 'boat; ship', partOfSpeech: 'noun' },
  { id: 'wh-airplane', japanese: 'ひこうき', reading: 'ひこうき', meaning: 'airplane', partOfSpeech: 'noun' },
  { id: 'wh-medicine', japanese: 'くすり', reading: 'くすり', meaning: 'medicine', partOfSpeech: 'noun' },
  { id: 'wh-bath', japanese: 'おふろ', reading: 'おふろ', meaning: 'bath', partOfSpeech: 'noun' },
  { id: 'wh-window', japanese: 'まど', reading: 'まど', meaning: 'window', partOfSpeech: 'noun' },
  { id: 'wh-chair', japanese: 'いす', reading: 'いす', meaning: 'chair', partOfSpeech: 'noun' },
  { id: 'wh-desk', japanese: 'つくえ', reading: 'つくえ', meaning: 'desk', partOfSpeech: 'noun' },
  { id: 'wh-key', japanese: 'かぎ', reading: 'かぎ', meaning: 'key', partOfSpeech: 'noun' },
  { id: 'wh-wallet', japanese: 'さいふ', reading: 'さいふ', meaning: 'wallet', partOfSpeech: 'noun' },
  { id: 'wh-hat', japanese: 'ぼうし', reading: 'ぼうし', meaning: 'hat', partOfSpeech: 'noun' },
  { id: 'wh-clothes', japanese: 'ふく', reading: 'ふく', meaning: 'clothes', partOfSpeech: 'noun' },
  { id: 'wh-world', japanese: 'せかい', reading: 'せかい', meaning: 'world', partOfSpeech: 'noun' },
  { id: 'wh-japan', japanese: 'にほん', reading: 'にほん', meaning: 'Japan', partOfSpeech: 'noun' },
  { id: 'wh-japanese', japanese: 'にほんご', reading: 'にほんご', meaning: 'Japanese language', partOfSpeech: 'noun' },
  { id: 'wh-adult', japanese: 'おとな', reading: 'おとな', meaning: 'adult', partOfSpeech: 'noun' },
  { id: 'wh-child', japanese: 'こども', reading: 'こども', meaning: 'child', partOfSpeech: 'noun' },
  { id: 'wh-family', japanese: 'かぞく', reading: 'かぞく', meaning: 'family', partOfSpeech: 'noun' },
  { id: 'wh-heart', japanese: 'こころ', reading: 'こころ', meaning: 'heart; mind', partOfSpeech: 'noun' },
  { id: 'wh-body', japanese: 'からだ', reading: 'からだ', meaning: 'body', partOfSpeech: 'noun' },
  { id: 'wh-head', japanese: 'あたま', reading: 'あたま', meaning: 'head', partOfSpeech: 'noun' },
  { id: 'wh-eye', japanese: 'め', reading: 'め', meaning: 'eye', partOfSpeech: 'noun' },
  { id: 'wh-nose', japanese: 'はな', reading: 'はな', meaning: 'nose', partOfSpeech: 'noun' },
  { id: 'wh-mouth', japanese: 'くち', reading: 'くち', meaning: 'mouth', partOfSpeech: 'noun' },
  { id: 'wh-ear', japanese: 'みみ', reading: 'みみ', meaning: 'ear', partOfSpeech: 'noun' },
  { id: 'wh-hand', japanese: 'て', reading: 'て', meaning: 'hand', partOfSpeech: 'noun' },
  { id: 'wh-foot', japanese: 'あし', reading: 'あし', meaning: 'foot; leg', partOfSpeech: 'noun' },
  { id: 'wh-red', japanese: 'あか', reading: 'あか', meaning: 'red', partOfSpeech: 'noun' },
  { id: 'wh-blue', japanese: 'あお', reading: 'あお', meaning: 'blue', partOfSpeech: 'noun' },
  { id: 'wh-white', japanese: 'しろ', reading: 'しろ', meaning: 'white', partOfSpeech: 'noun' },
  { id: 'wh-black', japanese: 'くろ', reading: 'くろ', meaning: 'black', partOfSpeech: 'noun' },
  { id: 'wh-green', japanese: 'みどり', reading: 'みどり', meaning: 'green', partOfSpeech: 'noun' },
  { id: 'wh-fast', japanese: 'はやい', reading: 'はやい', meaning: 'fast; early', partOfSpeech: 'adjective' },
  { id: 'wh-slow', japanese: 'おそい', reading: 'おそい', meaning: 'slow; late', partOfSpeech: 'adjective' },
  { id: 'wh-new', japanese: 'あたらしい', reading: 'あたらしい', meaning: 'new', partOfSpeech: 'adjective' },
  { id: 'wh-old', japanese: 'ふるい', reading: 'ふるい', meaning: 'old', partOfSpeech: 'adjective' },
  { id: 'wh-hot', japanese: 'あつい', reading: 'あつい', meaning: 'hot', partOfSpeech: 'adjective' },
  { id: 'wh-cold', japanese: 'さむい', reading: 'さむい', meaning: 'cold (weather)', partOfSpeech: 'adjective' },
  { id: 'wh-fun', japanese: 'たのしい', reading: 'たのしい', meaning: 'fun; enjoyable', partOfSpeech: 'adjective' },
  { id: 'wh-beautiful', japanese: 'きれい', reading: 'きれい', meaning: 'pretty; clean', partOfSpeech: 'adjective' },
];

function toKatakana(text: string): string {
  return Array.from(text, (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint >= 0x3041 && codePoint <= 0x3096
      ? String.fromCodePoint(codePoint + 0x60)
      : character;
  }).join('');
}

function createWordId(reading: string): string {
  const codePoints = Array.from(reading, (character) => character.codePointAt(0)?.toString(16) ?? '');
  return `word-hunt-${codePoints.join('-')}`;
}

function createWordList(): VocabularyItem[] {
  const words = [
    ...VOCABULARY,
    ...STORIES.flatMap((story) => story.vocabulary),
    ...EXTRA_WORDS,
  ];
  const unique = new Map<string, VocabularyItem>();

  words.forEach((word) => {
    const reading = word.reading.trim();
    if (Array.from(reading).length < 2
      || Array.from(reading).length > BOARD_SIZE
      || !/^[\u3041-\u3096]+$/u.test(reading)
      || unique.has(reading)) return;

    unique.set(reading, {
      id: createWordId(reading),
      japanese: word.japanese,
      reading,
      meaning: word.meaning,
      kanji: 'kanji' in word && typeof word.kanji === 'string' ? word.kanji : undefined,
      partOfSpeech: 'partOfSpeech' in word && typeof word.partOfSpeech === 'string'
        ? word.partOfSpeech
        : undefined,
    });
  });
  return [...unique.values()];
}

export const WORD_HUNT_WORDS = createWordList();

export function wordForScript(word: string, script: KanaScript): string {
  return script === 'katakana' ? toKatakana(word) : word;
}

export function createWordHuntBoard(
  script: KanaScript,
  random: () => number = Math.random,
): string[][] {
  const characters = HIRAGANA_CHARACTERS.map((character) => wordForScript(character, script));
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => characters[Math.floor(random() * characters.length)]),
  );
  const plantedWords = [...WORD_HUNT_WORDS];

  for (let index = plantedWords.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [plantedWords[index], plantedWords[swapIndex]] = [plantedWords[swapIndex], plantedWords[index]];
  }

  plantedWords.slice(0, BOARD_SIZE).forEach((word, row) => {
    const spelling = wordForScript(word.reading, script);
    const start = Math.floor(random() * (BOARD_SIZE - spelling.length + 1));
    Array.from(spelling).forEach((character, offset) => {
      board[row][start + offset] = character;
    });
  });

  return board;
}

export function findWordHuntWord(spelling: string, script: KanaScript): VocabularyItem | undefined {
  return WORD_HUNT_WORDS.find((word) => wordForScript(word.reading, script) === spelling);
}

export function findWordsOnWordHuntBoard(
  board: string[][],
  script: KanaScript,
  limit = 10,
): VocabularyItem[] {
  const bySpelling = new Map(
    WORD_HUNT_WORDS.map((word) => [wordForScript(word.reading, script), word]),
  );
  const found = new Map<string, VocabularyItem>();
  const visited = new Set<string>();

  const search = (row: number, column: number, spelling: string) => {
    if (found.size >= limit) return;
    const word = bySpelling.get(spelling);
    if (word) found.set(word.id, word);
    if (Array.from(spelling).length >= MAX_WORD_LENGTH || found.size >= limit) return;

    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (rowOffset === 0 && columnOffset === 0) continue;
        const nextRow = row + rowOffset;
        const nextColumn = column + columnOffset;
        const key = `${nextRow}:${nextColumn}`;
        if (!board[nextRow]?.[nextColumn] || visited.has(key)) continue;
        visited.add(key);
        search(nextRow, nextColumn, spelling + board[nextRow][nextColumn]);
        visited.delete(key);
      }
    }
  };

  board.forEach((row, rowIndex) => row.forEach((character, columnIndex) => {
    if (found.size >= limit) return;
    const key = `${rowIndex}:${columnIndex}`;
    visited.add(key);
    search(rowIndex, columnIndex, character);
    visited.delete(key);
  }));

  return [...found.values()];
}

export function areWordHuntPositionsAdjacent(
  first: WordHuntPosition,
  second: WordHuntPosition,
): boolean {
  return Math.abs(first.row - second.row) <= 1
    && Math.abs(first.column - second.column) <= 1
    && (first.row !== second.row || first.column !== second.column);
}
