import type { KanjiItem, VocabularyItem } from '../types';

const KANJI_CHARACTER = /[\u4e00-\u9fff々〆ヵヶ]/gu;

function kanaPartToHiragana(text: string): string {
  return Array.from(text, (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint >= 0x30a1 && codePoint <= 0x30f6
      ? String.fromCodePoint(codePoint - 0x60)
      : character;
  }).join('');
}

function getVocabularyKanjiReading(japanese: string, reading: string, character: string): string {
  if (japanese === character) return reading;

  const characterIndex = japanese.indexOf(character);
  const prefix = kanaPartToHiragana(japanese.slice(0, characterIndex));
  const suffix = kanaPartToHiragana(japanese.slice(characterIndex + character.length));
  let result = reading;

  if (prefix && result.startsWith(prefix)) result = result.slice(prefix.length);
  if (suffix && result.endsWith(suffix)) result = result.slice(0, -suffix.length);

  return result || reading;
}

export function createVocabularyKanji(
  vocabulary: VocabularyItem[],
  curated: KanjiItem[] = [],
): KanjiItem[] {
  const byCharacter = new Map<string, {
    readings: Set<string>;
    exactMeanings: Set<string>;
    relatedMeanings: Set<string>;
    exampleWords: Map<string, KanjiItem['exampleWords'][number]>;
  }>();

  for (const word of vocabulary) {
    if (word.singleKanji !== 'yes') continue;

    const characters = [...new Set(word.japanese.match(KANJI_CHARACTER) ?? [])];
    for (const character of characters) {
      const entry = byCharacter.get(character) ?? {
        readings: new Set<string>(),
        exactMeanings: new Set<string>(),
        relatedMeanings: new Set<string>(),
        exampleWords: new Map<string, KanjiItem['exampleWords'][number]>(),
      };
      entry.readings.add(getVocabularyKanjiReading(word.japanese, word.reading, character));
      if (word.japanese === character) entry.exactMeanings.add(word.meaning);
      else entry.relatedMeanings.add(word.meaning);
      entry.exampleWords.set(word.japanese, {
        japanese: word.japanese,
        reading: word.reading,
        meaning: word.meaning,
      });
      byCharacter.set(character, entry);
    }
  }

  const curatedByCharacter = new Map(curated.map((item) => [item.character, item]));
  const characters = new Set([...curatedByCharacter.keys(), ...byCharacter.keys()]);

  return [...characters].map((character) => {
    const curatedItem = curatedByCharacter.get(character);
    const vocabularyItem = byCharacter.get(character);
    const knownReadings = new Set([
      ...(curatedItem?.readings.on ?? []),
      ...(curatedItem?.readings.kun ?? []),
    ]);

    return {
      id: curatedItem?.id ?? `kanji-${character}`,
      character,
      readings: {
        on: curatedItem?.readings.on ?? [],
        kun: curatedItem?.readings.kun ?? [],
        other: [...(vocabularyItem?.readings ?? [])].filter((reading) => !knownReadings.has(reading)),
      },
      meanings: [...new Set([
        ...(curatedItem?.meanings ?? []),
        ...(vocabularyItem?.exactMeanings.size
          ? vocabularyItem.exactMeanings
          : vocabularyItem?.relatedMeanings ?? []),
      ])],
      exampleWords: [
        ...(curatedItem?.exampleWords ?? []),
        ...[...(vocabularyItem?.exampleWords.values() ?? [])].filter(
          (word) => !curatedItem?.exampleWords.some((example) => example.japanese === word.japanese),
        ),
      ],
    };
  });
}
