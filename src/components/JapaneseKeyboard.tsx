import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KanaScript } from '../types';

const HIRAGANA_ROWS = [
  ['あ', 'い', 'う', 'え', 'お', 'や', 'ゆ', 'よ', 'わ', 'ん'],
  ['か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も'],
  ['ら', 'り', 'る', 'れ', 'ろ', 'が', 'ぎ', 'ぐ', 'げ', 'ご'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
  ['ゃ', 'ゅ', 'ょ', 'っ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ー'],
];

const VOICED_PAIRS: [string, string][] = [
  ['かきくけこ', 'がぎぐげご'],
  ['さしすせそ', 'ざじずぜぞ'],
  ['たちつてと', 'だぢづでど'],
  ['はひふへほ', 'ばびぶべぼ'],
  ['はひふへほ', 'ぱぴぷぺぽ'],
];

function convertKana(character: string, script: KanaScript): string {
  if (script === 'hiragana' || character === 'ー') return character;
  return String.fromCodePoint(character.codePointAt(0)! + 0x60);
}

function applyMark(value: string, script: KanaScript, mark: 'dakuten' | 'handakuten'): string {
  const characters = Array.from(value);
  const last = characters[characters.length - 1];
  if (!last) return value;
  const base = script === 'hiragana' ? last : String.fromCodePoint(last.codePointAt(0)! - 0x60);
  const baseSet = mark === 'dakuten' ? [0, 1, 2, 3] : [4];
  const conversion = baseSet
    .map((index) => VOICED_PAIRS[index])
    .find(([plain]) => plain.includes(base));
  if (!conversion) return value;
  const [plain, voiced] = conversion;
  const converted = voiced[plain.indexOf(base)];
  characters[characters.length - 1] = convertKana(converted, script);
  return characters.join('');
}

export function JapaneseKeyboard({
  script,
  onScriptChange,
  onInsert,
  onBackspace,
  onClear,
  onSubmit,
}: {
  script: KanaScript;
  onScriptChange: (script: KanaScript) => void;
  onInsert: (character: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
}) {
  const [mark, setMark] = useState<'dakuten' | 'handakuten' | null>(null);
  const rows = HIRAGANA_ROWS.map((row) => row.map((character) => convertKana(character, script)));

  return (
    <View style={styles.keyboard}>
      <View style={styles.toolbar}>
        {(['hiragana', 'katakana'] as KanaScript[]).map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: script === item }}
            key={item}
            onPress={() => onScriptChange(item)}
            style={[styles.scriptButton, script === item && styles.activeScriptButton]}
          >
            <Text style={[styles.scriptText, script === item && styles.activeScriptText]}>
              {item === 'hiragana' ? 'あ Hiragana' : 'ア Katakana'}
            </Text>
          </Pressable>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={`kana-row-${rowIndex}`} style={styles.row}>
          {row.map((character) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Insert ${character}`}
              key={character}
              onPress={() => {
                onInsert(mark ? applyMark(character, script, mark) : character);
                setMark(null);
              }}
              style={styles.key}
            >
              <Text style={styles.keyText}>{character}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.actionRow}>
        <Pressable style={styles.utilityKey} onPress={() => setMark('dakuten')}>
          <Text style={styles.utilityText}>゛Dakuten</Text>
        </Pressable>
        <Pressable style={styles.utilityKey} onPress={() => setMark('handakuten')}>
          <Text style={styles.utilityText}>゜Handakuten</Text>
        </Pressable>
        <Pressable style={styles.utilityKey} onPress={onBackspace}>
          <Text style={styles.utilityText}>⌫</Text>
        </Pressable>
        <Pressable style={styles.utilityKey} onPress={onClear}>
          <Text style={styles.utilityText}>Clear</Text>
        </Pressable>
        <Pressable style={[styles.utilityKey, styles.enterKey]} onPress={onSubmit}>
          <Text style={styles.enterText}>Enter ↵</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: { alignSelf: 'stretch', backgroundColor: '#F7F3F0', padding: 8, borderRadius: 14, gap: 5, marginTop: 10 },
  toolbar: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  scriptButton: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 8, backgroundColor: '#FFFFFF' },
  activeScriptButton: { backgroundColor: '#81566B' },
  scriptText: { color: '#615866', fontSize: 11, fontWeight: '700' },
  activeScriptText: { color: '#FFFFFF' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 3 },
  key: { flex: 1, minWidth: 0, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#FFFFFF' },
  keyText: { fontSize: 16, color: '#342D3C' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 2 },
  utilityKey: { minHeight: 34, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, borderRadius: 7, backgroundColor: '#EAE3E8' },
  utilityText: { fontSize: 10, fontWeight: '700', color: '#554451' },
  enterKey: { backgroundColor: '#81566B', marginLeft: 'auto' },
  enterText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
});
