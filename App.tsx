import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IdeaButton } from './src/components/DesignSystem';
import { JapaneseKeyboard } from './src/components/JapaneseKeyboard';
import {
  DECORATIONS,
  HIRAGANA,
  INTRODUCTORY_KANJI,
  KATAKANA,
  STORIES,
  STUDY_CARDS,
  VOCABULARY,
} from './src/content/beginner';
import {
  areWordHuntPositionsAdjacent,
  createWordHuntBoard,
  findWordHuntWord,
  findWordsOnWordHuntBoard,
  wordForScript,
  WordHuntPosition,
} from './src/game/wordHunt';
import { isDue, localDateKey } from './src/review/scheduling';
import {
  getNewWordHuntWords,
  includeDiscoveredWords,
  selectStudySessionCards,
  SESSION_CARD_LIMIT,
} from './src/review/cardDeck';
import { AnswerKind, checkAnswer } from './src/review/answerChecking';
import { useProgress } from './src/storage/useProgress';
import { TOKENS } from './src/theme';
import { KanaScript, ReviewRating, Story, StudyCard, VocabularyItem } from './src/types';

export type Section = 'home' | 'game' | 'cards' | 'stories' | 'garden' | 'progress' | 'more';
type CardCategory = 'Due' | 'New' | 'Relearn' | 'Difficult' | 'All';
type CardDeck = 'Main deck' | 'Word Hunt' | 'Kana';
type CardDirection = 'meaning' | 'japanese' | 'reading';
const WORD_HUNT_ROUND_SECONDS = 60;

const COLORS = TOKENS.colors;

function todayCount(progress: ReturnType<typeof useProgress>['progress']): number {
  return Object.values(progress.reviews).filter((review) => isDue(review)).length;
}

function currentStreak(dates: string[]): number {
  const active = new Set(dates);
  const cursor = new Date();
  if (!active.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (active.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function chooseSessionCards(
  category: CardCategory,
  progress: ReturnType<typeof useProgress>['progress'],
  cards: StudyCard[],
): string[] {
  const difficultIds = new Set(progress.reviewHistory
    .filter((event) => event.rating === 'again' || event.rating === 'hard' || event.answerCorrect === false)
    .map((event) => event.cardId));
  const filtered = cards.filter((card) => {
    const record = progress.reviews[card.id];
    if (category === 'Due') return isDue(record);
    if (category === 'New') return !record;
    if (category === 'Relearn') return Boolean(record);
    if (category === 'Difficult') return Boolean(record && ((record.lapseCount ?? 0) > 0 || difficultIds.has(card.id)));
    return true;
  });
  if (category === 'Due') {
    filtered.sort((left, right) =>
      new Date(progress.reviews[left.id]?.dueAt ?? 0).getTime()
      - new Date(progress.reviews[right.id]?.dueAt ?? 0).getTime());
  }
  return selectStudySessionCards(filtered, category === 'Due');
}

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loading}>
      <StatusBar style="dark" />
      <ActivityIndicator size="large" color={COLORS.pink} />
      <Text style={styles.loadingText}>Opening your garden…</Text>
    </SafeAreaView>
  );
}

function ScreenTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.screenTitle}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function ProgressBar({ value, maximum, color = COLORS.pink }: { value: number; maximum: number; color?: string }) {
  const width = `${Math.min(100, Math.max(0, maximum ? (value / maximum) * 100 : 0))}%` as `${number}%`;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  );
}

export function HomeScreen({
  progress,
  onNavigate,
}: {
  progress: ReturnType<typeof useProgress>['progress'];
  onNavigate: (section: Section) => void;
}) {
  const due = todayCount(progress);
  const introduced = Object.keys(progress.reviews).length;
  const learned = Object.values(progress.reviews).filter((item) => item.successes >= 3).length;
  const streak = currentStreak(progress.dailyActivity.map((activity) => activity.date));
  const hiraganaIntroduced = HIRAGANA.filter((item) => progress.reviews[item.id]).length;
  const learningLevel = Math.min(Math.floor(hiraganaIntroduced / 5) + 1, 5);
  const todayActivity = progress.dailyActivity.find((activity) => activity.date === localDateKey());

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.homeTop}>
        <View>
          <Text style={styles.eyebrow}>SAKURA GARDEN</Text>
          <Text style={styles.homeGreeting}>おかえりなさい</Text>
          <Text style={styles.subtitle}>Welcome back, little learner</Text>
        </View>
        <View style={styles.streakPill}><Text style={styles.streakText}>🔥 {streak} day{streak === 1 ? '' : 's'}</Text></View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroKicker}>YOUR LEARNING JOURNEY</Text>
            <Text style={styles.heroHeading}>Hiragana garden</Text>
            <Text style={styles.heroCopy}>Level {learningLevel} · A1 foundations</Text>
          </View>
          <Text style={styles.heroFlower}>🌸</Text>
        </View>
        <View style={styles.heroStats}>
          <View>
            <Text style={styles.heroStat}>{learned}<Text style={styles.heroStatSmall}> / {HIRAGANA.length + KATAKANA.length + VOCABULARY.length}</Text></Text>
            <Text style={styles.heroStatLabel}>items mastered · {introduced} introduced</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroDue}>
            <Text style={styles.heroStat}>{due}</Text>
            <Text style={styles.heroStatLabel}>cards due today</Text>
          </View>
        </View>
        <ProgressBar value={learned} maximum={HIRAGANA.length + VOCABULARY.length} color="#FFF3D8" />
        <View style={styles.goalRow}>
          <Text style={styles.heroStatLabel}>Daily goal · {progress.dailyGoal} cards</Text>
          <Text style={styles.heroStatLabel}>{Math.min(todayActivity?.successfulReviews ?? 0, progress.dailyGoal)}/{progress.dailyGoal}</Text>
        </View>
      </View>

      <SectionHeading title="Choose your adventure" helper="A little practice goes a long way" />
      <View style={styles.quickGrid}>
        <QuickLink emoji="🔎" title="Kana Word Hunt" detail="Find & learn" color={COLORS.pinkLight} onPress={() => onNavigate('game')} />
        <QuickLink emoji="🗂️" title="Flashcards" detail={`${due} due today`} color={COLORS.lavender} onPress={() => onNavigate('cards')} />
        <QuickLink emoji="📖" title="Stories" detail="Read something lovely" color="#F8EFDA" onPress={() => onNavigate('stories')} />
        <QuickLink emoji="🌿" title="My Garden" detail={`${progress.petals} petals`} color={COLORS.greenLight} onPress={() => onNavigate('garden')} />
      </View>

      <SectionHeading title="A peek at your garden" helper="Your learning makes it bloom" />
      <Pressable style={styles.gardenPreview} onPress={() => onNavigate('garden')}>
        <Text style={styles.gardenCloud}>☁️</Text>
        <View style={styles.gardenScene}>
          <Text style={styles.sceneTree}>🌸</Text>
          <Text style={styles.sceneHouse}>🏠</Text>
          <Text style={styles.scenePlant}>🎋</Text>
          <Text style={styles.sceneLantern}>🏮</Text>
        </View>
        <View style={styles.gardenCaption}>
          <Text style={styles.gardenCaptionTitle}>Your peaceful place</Text>
          <Text style={styles.gardenCaptionText}>Visit the garden →</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

function QuickLink({
  emoji, title, detail, color, onPress,
}: { emoji: string; title: string; detail: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, { backgroundColor: color }, pressed && styles.pressed]}>
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickDetail}>{detail}</Text>
    </Pressable>
  );
}

function SectionHeading({ title, helper }: { title: string; helper?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {helper ? <Text style={styles.sectionHelper}>{helper}</Text> : null}
    </View>
  );
}

export function GameScreen({
  wordHuntWords,
  saveWords,
  awardActivity,
  onHome,
}: {
  wordHuntWords: VocabularyItem[];
  saveWords: (words: VocabularyItem[]) => void;
  awardActivity: (petals: number, level?: number, studyTimeSeconds?: number) => void;
  onHome: () => void;
}) {
  const [script, setScript] = useState<KanaScript>('hiragana');
  const [board, setBoard] = useState<string[][]>(() => createWordHuntBoard('hiragana'));
  const [selected, setSelected] = useState<WordHuntPosition[]>([]);
  const [foundWords, setFoundWords] = useState<VocabularyItem[]>([]);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState('');
  const [savedCount, setSavedCount] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(WORD_HUNT_ROUND_SECONDS);
  const roundEnded = useRef(false);
  const endRoundRef = useRef<() => void>(() => {});
  const tileTones = [styles.tileTone0, styles.tileTone1, styles.tileTone2, styles.tileTone3];

  const startRound = (nextScript = script) => {
    roundEnded.current = false;
    setScript(nextScript);
    setBoard(createWordHuntBoard(nextScript));
    setSelected([]);
    setFoundWords([]);
    setFinished(false);
    setMessage('');
    setSavedCount(0);
    setRemainingSeconds(WORD_HUNT_ROUND_SECONDS);
  };

  const chooseTile = (position: WordHuntPosition) => {
    if (finished) return;
    const previousIndex = selected.findIndex(
      (item) => item.row === position.row && item.column === position.column,
    );
    if (previousIndex >= 0) {
      setSelected(selected.slice(0, previousIndex));
      return;
    }
    if (selected.length >= 5) {
      setMessage('Words can be up to 5 kana long. Submit or clear this path first.');
      return;
    }
    const lastPosition = selected[selected.length - 1];
    if (lastPosition && !areWordHuntPositionsAdjacent(lastPosition, position)) {
      setMessage('Choose a neighboring tile, including diagonals.');
      return;
    }
    setSelected([...selected, position]);
    setMessage('');
  };

  const submitWord = () => {
    const spelling = selected.map(({ row, column }) => board[row][column]).join('');
    const word = findWordHuntWord(spelling, script);
    if (!word) {
      setMessage('Not in this beginner word list. Try another path.');
      setSelected([]);
      return;
    }
    if (foundWords.some((found) => found.id === word.id)) {
      setMessage(`${word.japanese} is already on your found list.`);
      setSelected([]);
      return;
    }
    setFoundWords([...foundWords, word]);
    setSelected([]);
    setMessage(`Found ${word.japanese} · ${word.meaning}`);
  };

  const finishRound = () => {
    if (roundEnded.current) return;
    roundEnded.current = true;
    const newWords = getNewWordHuntWords(foundWords, wordHuntWords);
    saveWords(newWords);
    if (foundWords.length > 0) awardActivity(5);
    setSavedCount(newWords.length);
    setFinished(true);
  };
  endRoundRef.current = finishRound;

  useEffect(() => {
    if (finished) return undefined;
    const timer = setTimeout(() => {
      if (remainingSeconds <= 1) {
        setRemainingSeconds(0);
        endRoundRef.current();
      } else {
        setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [finished, remainingSeconds]);

  const possibleWords = finished ? findWordsOnWordHuntBoard(board, script) : [];
  const formattedTime = `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow="A LITTLE PLAY" title="Kana Word Hunt" subtitle="Find beginner Japanese words hiding in the kana grid." />
      <View style={styles.gameIntro}>
        <Text style={styles.gameIntroIcon}>🔎</Text>
        <Text style={styles.gameIntroText}><Text style={styles.bold}>How to play:</Text> tap kana in order to trace a word. Tiles can touch horizontally, vertically, or diagonally, but each tile can only be used once per word. Submit each word, then finish the round to save new finds.</Text>
      </View>
      <View style={styles.scriptRow}>
        {(['hiragana', 'katakana'] as KanaScript[]).map((item) => (
          <Pressable
            key={item}
            disabled={finished || foundWords.length > 0}
            onPress={() => { if (script !== item) startRound(item); }}
            style={[styles.scriptButton, script === item && styles.scriptButtonActive]}
          >
            <Text style={[styles.scriptButtonText, script === item && styles.scriptButtonTextActive]}>
              {item === 'hiragana' ? 'あ Hiragana' : 'ア Katakana'}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.gameStatus}>
        <View><Text style={styles.gameLabel}>TIME</Text><Text style={[styles.gameValue, remainingSeconds <= 10 && !finished && styles.timerUrgent]}>{formattedTime}</Text></View>
        <View><Text style={styles.gameLabel}>FOUND</Text><Text style={styles.gameValue}>{foundWords.length}</Text></View>
        <View><Text style={styles.gameLabel}>SAVED WORDS</Text><Text style={styles.gameValue}>{wordHuntWords.length}</Text></View>
      </View>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.boardRow}>
            {row.map((character, columnIndex) => {
              const isSelected = selected.some((item) => item.row === rowIndex && item.column === columnIndex);
              const colorIndex = (rowIndex + columnIndex) % tileTones.length;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Kana ${character}`}
                  key={`${rowIndex}-${columnIndex}`}
                  onPress={() => chooseTile({ row: rowIndex, column: columnIndex })}
                  style={[
                    styles.tile,
                    tileTones[colorIndex],
                    isSelected && styles.tileSelected,
                  ]}
                >
                  <Text style={styles.tileText}>{character}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={styles.centerHint}>
        {selected.length ? `Your word: ${selected.map(({ row, column }) => board[row][column]).join('')}` : 'Tap a tile to start tracing a word'}
      </Text>
      <View style={styles.wordActionRow}>
        <SecondaryButton title="Clear path" onPress={() => { setSelected([]); setMessage(''); }} disabled={finished} />
        <PrimaryButton title="Submit word" onPress={submitWord} disabled={selected.length < 2 || finished} />
      </View>
      {message ? <Text style={styles.wordMessage}>{message}</Text> : null}
      {foundWords.length ? (
        <View style={styles.foundWordsCard}>
          <Text style={styles.noteTitle}>Words found this round</Text>
          {foundWords.map((word) => (
            <View key={word.id} style={styles.foundWordLine}>
              <Text style={styles.foundWordKanji}>{word.kanji ?? word.japanese}</Text>
              <Text style={styles.foundWordReading}>{wordForScript(word.reading, script)}</Text>
              <Text style={styles.foundWordMeaning}>{word.meaning}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {finished ? (
        <>
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Round complete</Text>
            <Text style={styles.bodyText}>
              {foundWords.length
                ? `${foundWords.length} word${foundWords.length === 1 ? '' : 's'} found. ${savedCount} new ${savedCount === 1 ? 'word was' : 'words were'} added to your Word Hunt flash cards.${savedCount < foundWords.length ? ' Words already in your main deck or this collection were not duplicated.' : ''} You earned 5 petals.`
                : 'No words found this time. Try another board.'}
            </Text>
            <PrimaryButton title="Play another round" onPress={() => startRound()} />
            <SecondaryButton title="Back to garden" onPress={onHome} />
          </View>
          <View style={styles.foundWordsCard}>
            <Text style={styles.noteTitle}>Words you could have found · {possibleWords.length}</Text>
            {possibleWords.length ? possibleWords.map((word) => (
              <View key={word.id} style={styles.foundWordLine}>
                <Text style={styles.foundWordKanji}>{word.kanji ?? word.japanese}</Text>
                <Text style={styles.foundWordReading}>{wordForScript(word.reading, script)}</Text>
                <Text style={styles.foundWordMeaning}>{word.meaning}</Text>
              </View>
            )) : <Text style={styles.sectionHelper}>No other dictionary words were traceable on this board.</Text>}
            {possibleWords.length === 10 ? <Text style={styles.sectionHelper}>Showing up to 10 matches.</Text> : null}
          </View>
        </>
      ) : <PrimaryButton title="Finish round early · save words" onPress={finishRound} />}
    </ScrollView>
  );
}

export function FlashcardsScreen({
  progress,
  recordReview,
  awardActivity,
}: {
  progress: ReturnType<typeof useProgress>['progress'];
  recordReview: (cardId: string, rating: ReviewRating, answerCorrect?: boolean, answer?: string) => void;
  awardActivity: (petals: number, level?: number, studyTimeSeconds?: number) => void;
}) {
  const [deck, setDeck] = useState<CardDeck>('Main deck');
  const [category, setCategory] = useState<CardCategory>('Due');
  const [direction, setDirection] = useState<CardDirection>('meaning');
  const [queue, setQueue] = useState<string[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [keyboardScript, setKeyboardScript] = useState<KanaScript>('hiragana');
  const [againCounts, setAgainCounts] = useState<Record<string, number>>({});
  const [sessionTotal, setSessionTotal] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [successful, setSuccessful] = useState(0);
  const sessionStartedAt = useRef<number | null>(null);
  const mainDeckCards = includeDiscoveredWords(STUDY_CARDS, progress.wordHuntWords);
  const deckCards: StudyCard[] = deck === 'Main deck'
    ? mainDeckCards
    : deck === 'Kana'
      ? STUDY_CARDS
        .filter((card) => card.type === 'kana')
        .map((card) => ({ ...card, meaning: card.reading }))
      : progress.wordHuntWords.map((word) => ({
      id: word.id,
      type: 'vocabulary',
      front: word.reading,
      reading: word.reading,
      meaning: word.meaning,
    }));
  const cardById = useMemo(() => new Map(deckCards.map((card) => [card.id, card])), [deckCards]);
  const questionCards = deck === 'Kana' || direction === 'meaning'
    ? deckCards
    : deckCards.filter((card) => card.type === 'vocabulary');
  const due = questionCards.filter((card) => isDue(progress.reviews[card.id])).length;
  const fresh = questionCards.filter((card) => !progress.reviews[card.id]).length;
  const difficultCardIds = new Set(progress.reviewHistory
    .filter((event) => event.rating === 'again' || event.rating === 'hard' || event.answerCorrect === false)
    .map((event) => event.cardId));
  const difficult = questionCards.filter((card) =>
    (progress.reviews[card.id]?.lapseCount ?? 0) > 0 || difficultCardIds.has(card.id)).length;
  const introduced = questionCards.filter((card) => Boolean(progress.reviews[card.id])).length;
  const currentCard = queue.length ? cardById.get(queue[0]) : undefined;
  const activeDirection = currentCard?.type === 'kana' ? 'meaning' : direction;
  const answerKind: AnswerKind = activeDirection === 'meaning'
    ? 'meaning'
    : activeDirection === 'reading' ? 'reading' : 'japanese';
  const question = !currentCard ? '' : activeDirection === 'meaning'
    ? currentCard.front
    : activeDirection === 'japanese'
      ? currentCard.meaning
      : currentCard.front;
  const expectedAnswer: string | string[] = !currentCard ? '' : activeDirection === 'meaning'
    ? currentCard.meaning.split(';').map((part) => part.trim())
    : activeDirection === 'reading'
      ? currentCard.reading
      : currentCard.front;
  const expectsJapanese = activeDirection !== 'meaning';

  const startSession = () => {
    const nextQueue = chooseSessionCards(category, progress, questionCards);
    setQueue(nextQueue);
    setSessionTotal(nextQueue.length);
    setAnswered(0);
    setSuccessful(0);
    setAgainCounts({});
    setSessionActive(true);
    setRevealed(false);
    setAnswer('');
    setAnswerCorrect(null);
    sessionStartedAt.current = Date.now();
  };

  const submitAnswer = () => {
    if (!currentCard || !answer.trim()) return;
    const correct = checkAnswer(answer, expectedAnswer, {
      kind: answerKind,
      script: activeDirection === 'reading' ? 'hiragana' : undefined,
    });
    setAnswerCorrect(correct);
    setRevealed(true);
  };

  const rateCurrent = (rating: ReviewRating) => {
    if (!currentCard) return;
    const [currentId, ...remaining] = queue;
    recordReview(currentId, rating, answerCorrect ?? undefined, answer || undefined);
    const nextSuccessful = successful + (rating === 'again' ? 0 : 1);
    setSuccessful(nextSuccessful);
    setAnswered((value) => value + 1);
    setRevealed(false);
    setAnswer('');
    setAnswerCorrect(null);
    let nextQueue: string[];
    if (rating === 'again') {
      const attempts = againCounts[currentId] ?? 0;
      if (attempts < 2) {
        setAgainCounts((value) => ({ ...value, [currentId]: attempts + 1 }));
        nextQueue = [...remaining, currentId];
      } else {
        nextQueue = remaining;
      }
    } else {
      nextQueue = remaining;
    }
    setQueue(nextQueue);
    if (nextQueue.length === 0) {
      const studyTimeSeconds = sessionStartedAt.current === null
        ? 0
        : Math.floor((Date.now() - sessionStartedAt.current) / 1000);
      awardActivity(3, undefined, studyTimeSeconds);
      sessionStartedAt.current = null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow="GENTLE REVIEW" title="Flashcards" subtitle="Small steps today make memories that stay." />
      <View style={styles.deckSelector}>
        {(['Main deck', 'Word Hunt', 'Kana'] as CardDeck[]).map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              setDeck(item);
              setSessionActive(false);
              setQueue([]);
              setCategory(item === 'Main deck' ? 'Due' : 'New');
            }}
            style={[styles.deckOption, deck === item && styles.deckOptionActive]}
          >
            <Text style={[styles.deckOptionText, deck === item && styles.deckOptionTextActive]}>
              {item === 'Word Hunt' ? `Word Hunt · ${progress.wordHuntWords.length}`
                : item === 'Kana' ? `Kana · ${HIRAGANA.length + KATAKANA.length}`
                  : `Main deck · ${mainDeckCards.length}`}
            </Text>
          </Pressable>
        ))}
      </View>
      {deck === 'Kana' && !sessionActive ? (
        <View style={styles.kanaOverview}>
          <Text style={styles.noteTitle}>Kana overview</Text>
          <Text style={styles.sectionHelper}>All hiragana and katakana with their sounds.</Text>
          {([
            ['Hiragana', HIRAGANA],
            ['Katakana', KATAKANA],
          ] as const).map(([title, characters]) => (
            <View key={title}>
              <Text style={styles.kanaOverviewTitle}>{title}</Text>
              <View style={styles.kanaOverviewGrid}>
                {characters.map((kana) => (
                  <View key={kana.id} style={styles.kanaOverviewItem}>
                    <Text style={styles.kanaOverviewCharacter}>{kana.character}</Text>
                    <Text style={styles.kanaOverviewReading}>{kana.reading}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.categoryRow}>
        {(['Due', 'New', 'Relearn', 'Difficult', 'All'] as CardCategory[]).map((item) => {
          const count = item === 'Due' ? due : item === 'New' ? fresh
            : item === 'Relearn' ? introduced : item === 'Difficult' ? difficult : questionCards.length;
          return (
            <Pressable key={item} onPress={() => { setCategory(item); setSessionActive(false); setQueue([]); }} style={[styles.categoryChip, category === item && styles.categoryChipActive]}>
              <Text style={[styles.categoryName, category === item && styles.categoryNameActive]}>{item}</Text>
              <Text style={[styles.categoryCount, category === item && styles.categoryNameActive]}>{count}</Text>
            </Pressable>
          );
        })}
      </View>
      {!sessionActive ? (
        deck !== 'Kana' ? <View style={styles.directionCard}>
          <Text style={styles.noteTitle}>Question type</Text>
          <View style={styles.directionRow}>
            {([
              ['meaning', 'Japanese → English'],
              ['japanese', 'English → Japanese'],
              ['reading', 'Reading'],
            ] as [CardDirection, string][]).map(([item, label]) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: direction === item }}
                key={item}
                onPress={() => setDirection(item)}
                style={[styles.directionButton, direction === item && styles.directionButtonActive]}
              >
                <Text style={[styles.directionText, direction === item && styles.directionTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.sectionHelper}>One direction per session keeps related prompts from repeating together.</Text>
        </View> : null
      ) : null}
      {sessionActive && currentCard ? (
        <View>
          <View style={styles.sessionHeader}>
            <Text style={styles.sectionHelper}>Card {Math.min(answered + 1, sessionTotal)} of {sessionTotal}</Text>
            <Text style={styles.sectionHelper}>🌸 {successful} remembered</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSessionActive(false);
              setQueue([]);
              setRevealed(false);
              sessionStartedAt.current = null;
            }}
            style={styles.stopSessionButton}
          >
            <Text style={styles.stopSessionText}>Stop session</Text>
          </Pressable>
          <ProgressBar value={answered} maximum={Math.max(sessionTotal, 1)} />
          <View style={styles.flashcard}>
            <Text style={styles.cardType}>
              {deck === 'Word Hunt' ? 'WORD HUNT' : currentCard.type === 'kana' ? currentCard.kanaScript?.toUpperCase() : 'EVERYDAY JAPANESE'}
            </Text>
            <Text style={[styles.flashFront, activeDirection === 'japanese' && styles.englishPrompt]}>{question}</Text>
            <Text style={styles.sectionHelper}>
              {currentCard.type === 'kana' ? 'Type the sound in romaji'
                : activeDirection === 'meaning' ? 'What does this mean?'
                  : activeDirection === 'japanese' ? 'Type the Japanese word in kana'
                    : 'Type its reading in kana'}
            </Text>
            {!revealed ? (
              <>
                <TextInput
                  accessibilityLabel="Your answer"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setAnswer}
                  onSubmitEditing={submitAnswer}
                  placeholder={currentCard.type === 'kana' ? 'Type the sound in romaji' : expectsJapanese ? 'Enter your answer' : 'Type the meaning'}
                  returnKeyType="done"
                  style={styles.answerInput}
                  value={answer}
                />
                {expectsJapanese ? (
                  <JapaneseKeyboard
                    script={activeDirection === 'reading' ? 'hiragana' : keyboardScript}
                    onScriptChange={setKeyboardScript}
                    onInsert={(character) => setAnswer((value) => value + character)}
                    onBackspace={() => setAnswer((value) => Array.from(value).slice(0, -1).join(''))}
                    onClear={() => setAnswer('')}
                    onSubmit={submitAnswer}
                  />
                ) : null}
                {answer.trim() ? <PrimaryButton title="Check answer" onPress={submitAnswer} /> : null}
              </>
            ) : null}
            {revealed ? (
              <>
                {answerCorrect !== null ? (
                  <Text style={[styles.answerFeedback, answerCorrect ? styles.answerCorrect : styles.answerIncorrect]}>
                    {answerCorrect ? 'Correct answer!' : 'Not quite — keep practising.'}
                  </Text>
                ) : null}
                <Text style={styles.flashReading}>{currentCard.reading}</Text>
                <Text style={styles.flashMeaning}>{currentCard.meaning}</Text>
                {currentCard.exampleJapanese ? <Text style={styles.exampleText}>{currentCard.exampleJapanese}{currentCard.exampleMeaning ? `\n${currentCard.exampleMeaning}` : ''}</Text> : null}
              </>
            ) : (
              <Text style={styles.sectionHelper}>Take a moment to remember…</Text>
            )}
            <View style={styles.audioPlaceholder}>
              <Text style={styles.audioIcon}>🔈</Text>
              <Text style={styles.audioText}>{currentCard.audioRef ? 'Audio available' : 'Audio pronunciation coming soon'}</Text>
            </View>
            {!revealed ? <SecondaryButton title="Show answer" onPress={() => setRevealed(true)} /> : null}
          </View>
          {revealed ? (
            <>
              <Text style={styles.ratingPrompt}>How easily did you remember it? Rate your recall, not just whether it was correct.</Text>
              <View style={styles.ratingRow}>
                {([
                  ['again', 'Again', '#F5DDDF'],
                  ['hard', 'Hard', '#F7E8CF'],
                  ['good', 'Good', '#E3EEDF'],
                  ['easy', 'Easy', '#E6E0F1'],
                ] as [ReviewRating, string, string][]).map(([rating, label, color]) => (
                  <Pressable key={rating} onPress={() => rateCurrent(rating)} style={[styles.ratingButton, { backgroundColor: color }]}>
                    <Text style={styles.ratingText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
          <Text style={styles.sessionNote}>Learning steps: 1 minute, then 10 minutes. Good graduates in about 1 day; these intervals are configurable.</Text>
        </View>
      ) : sessionActive ? (
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>🍵</Text>
          <Text style={styles.successTitle}>Session complete</Text>
          <Text style={styles.bodyText}>{successful} successful review{successful === 1 ? '' : 's'} recorded. You earned 3 petals for finishing the session.</Text>
          <SecondaryButton title="Start another session" onPress={startSession} />
        </View>
      ) : (
        <View style={styles.sessionStartCard}>
          <Text style={styles.sessionEmoji}>{category === 'Due' ? '🍡' : category === 'New' ? '🌱' : category === 'Difficult' ? '💪' : category === 'All' ? '🗂️' : '🔁'}</Text>
          <Text style={styles.sessionHeading}>{category} cards</Text>
          <Text style={styles.bodyText}>
            {deck === 'Word Hunt' && deckCards.length === 0 ? 'Words you discover in Kana Word Hunt will be collected here.'
              : category === 'Due' ? `${due} card${due === 1 ? '' : 's'} are ready for review. Study up to ${SESSION_CARD_LIMIT} at a time.`
              : category === 'New' ? `${fresh} new cards are waiting. Study up to ${SESSION_CARD_LIMIT} at a time.`
                : category === 'Relearn' ? `${introduced} previously introduced cards are ready to practise. Study up to ${SESSION_CARD_LIMIT} at a time.`
                : category === 'Difficult' ? `${difficult} difficult cards are ready to revisit. Study up to ${SESSION_CARD_LIMIT} at a time.`
                  : `Study up to ${SESSION_CARD_LIMIT} randomly selected cards from the ${questionCards.length} available in this deck and question type.`}
          </Text>
          <Text style={styles.schedulingNote}>Again returns in 1 minute · learning steps are 1 and 10 minutes · Good graduates in about 1 day · Easy graduates in 4 days.</Text>
          <PrimaryButton title="Begin a study session" onPress={startSession} disabled={(category === 'Due' ? due : category === 'New' ? fresh : category === 'Relearn' ? introduced : category === 'Difficult' ? difficult : questionCards.length) === 0} />
          {(category === 'Due' ? due : category === 'New' ? fresh : category === 'Relearn' ? introduced : category === 'Difficult' ? difficult : questionCards.length) === 0 ? <Text style={styles.sectionHelper}>Nothing here right now. Choose another stack.</Text> : null}
        </View>
      )}
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>How progress works</Text>
        <Text style={styles.noteBody}>Introduced cards have a saved review. A card is mastered after three successful answers; seeing it alone never counts as learning.</Text>
      </View>
    </ScrollView>
  );
}

export function StoriesScreen({
  completedStoryIds,
  completeStory,
}: {
  completedStoryIds: string[];
  completeStory: (storyId: string) => void;
}) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Story['vocabulary'][number] | null>(null);

  if (selectedStory) {
    const completed = completedStoryIds.includes(selectedStory.id);
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => { setSelectedStory(null); setShowTranslation(false); setSelectedWord(null); }} style={styles.backLink}>
          <Text style={styles.backLinkText}>← All stories</Text>
        </Pressable>
        <ScreenTitle eyebrow={selectedStory.difficulty} title={selectedStory.title} />
        <View style={styles.storyDetailCard}>
          <Text style={styles.japaneseStory}>{selectedStory.japaneseText}</Text>
          <Text style={styles.storyHint}>Tap a word below to explore its meaning.</Text>
          <View style={styles.wordChips}>
            {selectedStory.vocabulary.map((word) => (
              <Pressable key={`${selectedStory.id}-${word.japanese}`} onPress={() => setSelectedWord(word)} style={[styles.wordChip, selectedWord?.japanese === word.japanese && styles.wordChipSelected]}>
                <Text style={styles.wordChipText}>{word.japanese}</Text>
              </Pressable>
            ))}
          </View>
          {selectedWord ? (
            <View style={styles.wordMeaning}>
              <Text style={styles.wordMeaningJapanese}>{selectedWord.japanese} · {selectedWord.reading}</Text>
              <Text style={styles.wordMeaningText}>{selectedWord.meaning}</Text>
            </View>
          ) : null}
          <SecondaryButton title={showTranslation ? 'Hide translation' : 'Reveal translation'} onPress={() => setShowTranslation(!showTranslation)} />
          {showTranslation ? <Text style={styles.translationText}>{selectedStory.translation}</Text> : null}
        </View>
        <View style={styles.audioPlaceholder}>
          <Pressable accessibilityRole="button" accessibilityLabel="Story audio unavailable" accessibilityState={{ disabled: true }} disabled style={styles.audioControl}>
            <Text style={styles.audioIcon}>▶</Text>
          </Pressable>
          <View style={styles.audioCopy}>
            <Text style={styles.noteTitle}>Listen along</Text>
            <Text style={styles.audioText}>{selectedStory.audioRef ? 'Audio ready to play' : 'Audio unavailable · Japanese text-to-speech can be added later'}</Text>
          </View>
        </View>
        <View style={styles.storyWordsCard}>
          <Text style={styles.noteTitle}>Story words</Text>
          {selectedStory.vocabulary.map((word) => (
            <View key={`${word.japanese}-meaning`} style={styles.vocabularyLine}>
              <Text style={styles.vocabularyJapanese}>{word.japanese}</Text>
              <Text style={styles.vocabularyReading}>{word.reading}</Text>
              <Text style={styles.vocabularyMeaning}>{word.meaning}</Text>
            </View>
          ))}
        </View>
        <PrimaryButton
          title={completed ? 'Story completed ✓' : 'Mark story complete · earn 2 petals'}
          disabled={completed}
          onPress={() => completeStory(selectedStory.id)}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow="GENTLE READING" title="Little stories" subtitle="Beginner Japanese, one small story at a time." />
      {STORIES.map((story, index) => (
        <Pressable key={story.id} onPress={() => setSelectedStory(story)} style={styles.storyCard}>
          <View style={[styles.storyArt, index === 1 && styles.storyArtTea, index === 2 && styles.storyArtDog]}>
            <Text style={styles.storyArtEmoji}>{['🌸', '🍵', '🐕'][index]}</Text>
          </View>
          <View style={styles.storyCardCopy}>
            <Text style={styles.eyebrow}>{story.difficulty}</Text>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyPreview}>{story.japaneseText}</Text>
            <Text style={styles.storyStatus}>{completedStoryIds.includes(story.id) ? '✓ Completed' : 'Read story →'}</Text>
          </View>
        </Pressable>
      ))}
      <Text style={styles.sessionNote}>Stories are hand-curated for A1 learners. Audio is not included yet.</Text>
    </ScrollView>
  );
}

export function GardenScreen({
  petals,
  ownedDecorationIds,
  buyDecoration,
}: {
  petals: number;
  ownedDecorationIds: string[];
  buyDecoration: (decorationId: string) => void;
}) {
  const gardenItems = DECORATIONS.filter((item) => ownedDecorationIds.includes(item.id));
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.gardenHeading}>
        <View>
          <Text style={styles.eyebrow}>YOUR LITTLE RETREAT</Text>
          <Text style={styles.title}>My Garden</Text>
        </View>
        <View style={styles.petalsPill}><Text style={styles.petalsText}>🌸 {petals}</Text></View>
      </View>
      <View style={styles.gardenCanvas}>
        <Text style={styles.gardenSun}>☀️</Text>
        <Text style={styles.gardenCloudLeft}>☁️</Text>
        <View style={styles.gardenBackPlants}><Text>🎋</Text><Text>🌿</Text><Text>🎋</Text></View>
        <View style={styles.gardenGround} />
        <View style={styles.gardenSceneItems}>
          {gardenItems.map((item) => (
            <View key={item.id} style={[styles.gardenObject, item.area === 'house' && styles.gardenObjectHouse]}>
              <Text style={styles.gardenObjectEmoji}>{item.emoji}</Text>
              <Text style={styles.gardenObjectName}>{item.name}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.gardenGrass}>🌱　🌷　🌱　🌼　🌱</Text>
      </View>
      <View style={styles.gardenWelcome}>
        <Text style={styles.gardenWelcomeTitle}>A garden that grows with you</Text>
        <Text style={styles.bodyText}>Earn petals by learning, finishing stories, and completing game levels. Spend them on new garden friends.</Text>
      </View>
      <SectionHeading title="Garden shop" helper="A few little treasures to collect" />
      {DECORATIONS.filter((item) => item.price > 0).map((item) => {
        const owned = ownedDecorationIds.includes(item.id);
        return (
          <View key={item.id} style={styles.shopRow}>
            <Text style={styles.shopEmoji}>{item.emoji}</Text>
            <View style={styles.shopCopy}>
              <Text style={styles.shopName}>{item.name}</Text>
              <Text style={styles.shopPrice}>{owned ? 'Already in your garden' : `🌸 ${item.price} petals`}</Text>
            </View>
            <SecondaryButton
              title={owned ? 'Owned' : 'Add'}
              disabled={owned || petals < item.price}
              onPress={() => buyDecoration(item.id)}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

export function ProgressScreen({ progress }: { progress: ReturnType<typeof useProgress>['progress'] }) {
  const due = todayCount(progress);
  const reviewValues = Object.values(progress.reviews);
  const introduced = reviewValues.length;
  const mastered = reviewValues.filter((item) => item.successes >= 3).length;
  const learning = reviewValues.filter((item) => item.state === 'learning' || item.state === 'relearning').length;
  const correctAnswers = progress.reviewHistory.filter((event) => event.answerCorrect === true).length;
  const forgottenAnswers = progress.reviewHistory.filter((event) =>
    event.rating === 'again' || event.answerCorrect === false).length;
  const lastFailedReview = [...progress.reviewHistory].reverse().findIndex((event) =>
    event.rating === 'again' || event.answerCorrect === false);
  const consecutiveCorrect = lastFailedReview === -1 ? progress.reviewHistory.length : lastFailedReview;
  const learnedHiragana = HIRAGANA.filter((item) => (progress.reviews[item.id]?.successes ?? 0) >= 3).length;
  const introducedHiragana = HIRAGANA.filter((item) => progress.reviews[item.id]).length;
  const learnedKatakana = KATAKANA.filter((item) => (progress.reviews[item.id]?.successes ?? 0) >= 3).length;
  const introducedKatakana = KATAKANA.filter((item) => progress.reviews[item.id]).length;
  const learnedVocabulary = VOCABULARY.filter((item) => (progress.reviews[item.id]?.successes ?? 0) >= 3).length;
  const today = localDateKey();
  const todayActivity = progress.dailyActivity.find((activity) => activity.date === today);
  const reviewedToday = todayActivity?.successfulReviews ?? 0;
  const overallTotal = HIRAGANA.length + KATAKANA.length + VOCABULARY.length;
  const studyMinutes = Math.floor(progress.dailyActivity.reduce((total, activity) =>
    total + (activity.studyTimeSeconds ?? 0), 0) / 60);
  const recentHistory = [...progress.reviewHistory].reverse().slice(0, 5);
  const cardLabels = new Map([
    ...STUDY_CARDS.map((card) => [card.id, `${card.front} · ${card.meaning}`] as [string, string]),
    ...progress.wordHuntWords.map((word) => [word.id, `${word.japanese} · ${word.meaning}`] as [string, string]),
  ]);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow="YOUR JOURNEY SO FAR" title="Progress" subtitle="Every little practice session adds up." />
      <View style={styles.overallCard}>
        <View style={styles.overallHeading}>
          <View><Text style={styles.eyebrow}>OVERALL LEARNING</Text><Text style={styles.overallCount}>{mastered}<Text style={styles.overallOutOf}> / {overallTotal}</Text></Text></View>
          <Text style={styles.overallFlower}>🌱</Text>
        </View>
        <Text style={styles.sectionHelper}>Mastered after 3 successful reviews · {introduced} introduced</Text>
        <ProgressBar value={mastered} maximum={overallTotal} />
      </View>
      <SectionHeading title="Kana garden" />
      <LearningProgressRow label="Hiragana" symbol="あ" introduced={introducedHiragana} mastered={learnedHiragana} total={HIRAGANA.length} />
      <LearningProgressRow label="Katakana" symbol="ア" introduced={introducedKatakana} mastered={learnedKatakana} total={KATAKANA.length} color={COLORS.green} />
      <View style={styles.comingSoonNote}><Text style={styles.comingSoonText}>Hiragana is the main path. Katakana comes next; introductory kanji is optional.</Text></View>
      <SectionHeading title="Optional kanji preview" helper="A small extra, separate from your kana path" />
      {INTRODUCTORY_KANJI.map((item) => (
        <View key={item.id} style={styles.kanjiRow}>
          <Text style={styles.kanjiCharacter}>{item.character}</Text>
          <View style={styles.kanjiCopy}>
            <Text style={styles.kanjiMeaning}>{item.meanings.join(', ')}</Text>
            <Text style={styles.kanjiReading}>On: {item.readings.on?.join('、') ?? '—'} · Kun: {item.readings.kun?.join('、') ?? '—'}</Text>
            <Text style={styles.kanjiExample}>{item.exampleWords.map((word) => `${word.japanese} · ${word.reading} · ${word.meaning}`).join(' / ')}</Text>
          </View>
        </View>
      ))}
      <SectionHeading title="Learning milestones" />
      <View style={styles.metricsGrid}>
        <MetricCard emoji="📚" value={`${learnedVocabulary}/${VOCABULARY.length}`} label="vocabulary mastered" />
        <MetricCard emoji="🗂️" value={`${due}`} label="flashcards due today" />
        <MetricCard emoji="🌱" value={`${learning}`} label="currently learning" />
        <MetricCard emoji="📖" value={`${progress.storiesCompleted.length}/${STORIES.length}`} label="stories completed" />
        <MetricCard emoji="🔎" value={`${progress.wordHuntWords.length}`} label="Word Hunt words collected" />
        <MetricCard emoji="🔥" value={`${currentStreak(progress.dailyActivity.map((activity) => activity.date))} days`} label="current streak" />
        <MetricCard emoji="✨" value={`${Math.min(reviewedToday, progress.dailyGoal)}/${progress.dailyGoal}`} label="today's card goal" />
        <MetricCard emoji="✅" value={`${correctAnswers}`} label="correct typed answers" />
        <MetricCard emoji="💭" value={`${forgottenAnswers}`} label="forgotten or incorrect" />
        <MetricCard emoji="⚡" value={`${consecutiveCorrect}`} label="consecutive correct reviews" />
        <MetricCard emoji="⏱️" value={`${studyMinutes} min`} label="total completed study time" />
      </View>
      <SectionHeading title="Recent review history" helper="Answer results and recall ratings are saved separately" />
      <View style={styles.reviewHistoryCard}>
        {recentHistory.length ? recentHistory.map((event, index) => (
          <View key={`${event.cardId}-${event.reviewedAt}-${index}`} style={styles.reviewHistoryLine}>
            <View style={styles.reviewHistoryCopy}>
              <Text style={styles.reviewHistoryWord}>{cardLabels.get(event.cardId) ?? event.cardId}</Text>
              <Text style={styles.reviewHistoryDate}>{new Date(event.reviewedAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.reviewHistoryRating}>{event.answerCorrect === undefined ? '' : event.answerCorrect ? '✓ ' : '× '}{event.rating}</Text>
          </View>
        )) : <Text style={styles.sectionHelper}>Review a card to start building your history.</Text>}
      </View>
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>What do these numbers mean?</Text>
        <Text style={styles.noteBody}>Introduced = reviewed at least once. Mastered = three non-Again answers. Due = a saved review date that has arrived. Nothing is counted as learned just for being opened.</Text>
      </View>
    </ScrollView>
  );
}

function LearningProgressRow({
  label, symbol, introduced, mastered, total, color,
}: { label: string; symbol: string; introduced: number; mastered: number; total: number; color?: string }) {
  return (
    <View style={styles.learningRow}>
      <View style={styles.learningSymbol}><Text style={styles.learningSymbolText}>{symbol}</Text></View>
      <View style={styles.learningCopy}>
        <View style={styles.learningTopLine}><Text style={styles.learningName}>{label}</Text><Text style={styles.learningCount}>{mastered}/{total} mastered</Text></View>
        <ProgressBar value={mastered} maximum={total} color={color} />
        <Text style={styles.learningIntroduced}>{introduced} introduced · {total - introduced} not yet introduced</Text>
      </View>
    </View>
  );
}

function MetricCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricEmoji}>{emoji}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function PrimaryButton({
  title, onPress, disabled = false,
}: { title: string; onPress: () => void; disabled?: boolean }) {
  return <IdeaButton title={title} onPress={onPress} variant="primary" disabled={disabled} />;
}

function SecondaryButton({
  title, onPress, disabled = false,
}: { title: string; onPress: () => void; disabled?: boolean }) {
  return <IdeaButton title={title} onPress={onPress} variant="secondary" disabled={disabled} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cream, gap: 12 },
  loadingText: { color: COLORS.navy, fontSize: 14, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32, backgroundColor: COLORS.cream },
  screenTitle: { marginBottom: 20 },
  eyebrow: { color: COLORS.pink, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, marginBottom: 6 },
  title: { color: COLORS.navy, fontSize: 29, lineHeight: 35, fontWeight: '800' },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 4, lineHeight: 19 },
  homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  homeGreeting: { color: COLORS.navy, fontSize: 24, lineHeight: 30, fontWeight: '800' },
  streakPill: { backgroundColor: '#FDECC8', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#F6D18A' },
  streakText: { color: '#8A5D13', fontSize: 12, fontWeight: '800' },
  heroCard: { backgroundColor: '#253B69', borderRadius: 28, padding: 19, marginBottom: 23, borderWidth: 1, borderColor: '#355584', shadowColor: COLORS.navy, shadowOpacity: 0.18, shadowRadius: 20, elevation: 8 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroKicker: { color: '#D7E9FF', fontWeight: '800', fontSize: 9, letterSpacing: 1.5 },
  heroHeading: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 5 },
  heroCopy: { color: '#E7EDFF', fontSize: 12, marginTop: 4 },
  heroFlower: { fontSize: 38 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  heroStat: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  heroStatSmall: { fontSize: 13, fontWeight: '600' },
  heroStatLabel: { color: '#E7EDFF', fontSize: 10, marginTop: 3 },
  heroStatDivider: { width: 1, height: 35, backgroundColor: '#9FB6D8', marginHorizontal: 23 },
  heroDue: { flex: 1 },
  progressTrack: { height: 8, backgroundColor: '#F4E7EB', borderRadius: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 12 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  sectionHeading: { marginTop: 3, marginBottom: 12 },
  sectionTitle: { color: COLORS.navy, fontSize: 17, fontWeight: '800' },
  sectionHelper: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 23 },
  quickCard: { width: '48%', minHeight: 116, borderRadius: 22, padding: 14, justifyContent: 'center', borderWidth: 1, borderColor: '#F2E8F5' },
  quickEmoji: { fontSize: 23, marginBottom: 7 },
  quickTitle: { color: COLORS.navy, fontSize: 13, fontWeight: '800' },
  quickDetail: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  gardenPreview: { borderRadius: 24, backgroundColor: '#DDEEE7', overflow: 'hidden', minHeight: 170, marginBottom: 12, borderWidth: 1, borderColor: '#CFE7D9' },
  gardenCloud: { position: 'absolute', top: 11, right: 24, fontSize: 24 },
  gardenScene: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 116, paddingHorizontal: 22, paddingTop: 24 },
  sceneTree: { fontSize: 42 },
  sceneHouse: { fontSize: 62 },
  scenePlant: { fontSize: 36 },
  sceneLantern: { fontSize: 28 },
  gardenCaption: { backgroundColor: '#FFFFFFC9', paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gardenCaptionTitle: { color: COLORS.navy, fontWeight: '700', fontSize: 12 },
  gardenCaptionText: { color: COLORS.sage, fontSize: 11, fontWeight: '800' },
  gameIntro: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FDE8EE', borderRadius: 18, padding: 13, marginBottom: 15, borderWidth: 1, borderColor: '#F7C9D7' },
  gameIntroIcon: { fontSize: 24 },
  gameIntroText: { flex: 1, color: COLORS.navy, fontSize: 11, lineHeight: 17 },
  bold: { fontWeight: '800' },
  scriptRow: { flexDirection: 'row', gap: 9, marginTop: 3, marginBottom: 12 },
  scriptButton: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
  scriptButtonActive: { backgroundColor: '#EAF8F1', borderColor: COLORS.sage },
  scriptButtonText: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  scriptButtonTextActive: { color: COLORS.navy },
  gameStatus: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, flexDirection: 'row', justifyContent: 'space-around', marginBottom: 13, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.navy, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  gameLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  gameValue: { color: COLORS.navy, fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  timerUrgent: { color: '#C64D5E' },
  board: { alignSelf: 'center', marginTop: 18, padding: 10, backgroundColor: '#17294B', borderRadius: 22, gap: 6, borderWidth: 1, borderColor: '#2B4478' },
  boardRow: { flexDirection: 'row', gap: 6 },
  tile: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFFA0' },
  tileTone0: { backgroundColor: '#F8DDE2' },
  tileTone1: { backgroundColor: '#DDEEE7' },
  tileTone2: { backgroundColor: '#F8EFCF' },
  tileTone3: { backgroundColor: '#E9E1F9' },
  tileSelected: { borderColor: COLORS.pink, transform: [{ scale: 1.08 }] },
  tileText: { color: COLORS.navy, fontSize: 24, fontWeight: '700' },
  centerHint: { color: COLORS.muted, textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 9 },
  wordActionRow: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  wordMessage: { color: COLORS.green, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  foundWordsCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginTop: 14, borderWidth: 1, borderColor: COLORS.border },
  foundWordLine: { gap: 2, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5EFEC' },
  foundWordKanji: { color: COLORS.navy, fontSize: 15, fontWeight: '800' },
  foundWordReading: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  foundWordMeaning: { color: COLORS.muted, fontSize: 11 },
  successCard: { alignItems: 'center', backgroundColor: '#EAF7EE', borderRadius: 22, padding: 20, marginTop: 16, borderWidth: 1, borderColor: '#CFE9D6' },
  successEmoji: { fontSize: 38, marginBottom: 6 },
  successTitle: { color: COLORS.navy, fontSize: 21, fontWeight: '800' },
  bodyText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6, marginBottom: 12 },
  primaryButton: { backgroundColor: COLORS.pink, borderRadius: 16, paddingHorizontal: 17, paddingVertical: 13, alignItems: 'center', marginTop: 12, minHeight: 44, justifyContent: 'center', shadowColor: COLORS.navy, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secondaryButtonText: { color: COLORS.navy, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  buttonDisabled: { opacity: 0.48 },
  deckSelector: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  deckOption: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
  deckOptionActive: { backgroundColor: '#F0E9FF', borderColor: '#CFBDF8' },
  deckOptionText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  deckOptionTextActive: { color: COLORS.navy },
  kanaOverview: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  kanaOverviewTitle: { color: COLORS.navy, fontSize: 12, fontWeight: '800', marginTop: 13, marginBottom: 7 },
  kanaOverviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kanaOverviewItem: { width: '18%', minHeight: 53, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F2F9', borderRadius: 10 },
  kanaOverviewCharacter: { color: COLORS.navy, fontSize: 20, fontWeight: '700' },
  kanaOverviewReading: { color: COLORS.muted, fontSize: 9, fontWeight: '700' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 17 },
  categoryChip: { flexGrow: 1, flexBasis: '28%', minWidth: 80, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: COLORS.pink, borderColor: COLORS.pink },
  categoryName: { color: COLORS.navy, fontSize: 11, fontWeight: '700' },
  categoryNameActive: { color: '#FFFFFF' },
  categoryCount: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  directionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  directionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  directionButton: { flexGrow: 1, alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 10, backgroundColor: '#F7F3F0' },
  directionButtonActive: { backgroundColor: '#81566B' },
  directionText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  directionTextActive: { color: '#FFFFFF' },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stopSessionButton: { alignSelf: 'flex-end', paddingVertical: 5, paddingHorizontal: 8, marginBottom: 4 },
  stopSessionText: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  flashcard: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 21, alignItems: 'center', minHeight: 270, justifyContent: 'center', marginTop: 15, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.navy, shadowOpacity: 0.08, shadowRadius: 18, elevation: 4 },
  cardType: { color: COLORS.pink, fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  flashFront: { color: COLORS.navy, fontSize: 62, fontWeight: '600', marginTop: 16, marginBottom: 7 },
  englishPrompt: { fontSize: 27, lineHeight: 34, textAlign: 'center' },
  answerInput: { alignSelf: 'stretch', borderColor: COLORS.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10, marginTop: 10, minHeight: 44, color: COLORS.navy, fontSize: 17, textAlign: 'center' },
  answerFeedback: { fontSize: 13, fontWeight: '800', marginTop: 9 },
  answerCorrect: { color: '#397A52' },
  answerIncorrect: { color: '#B44E5C' },
  flashReading: { color: COLORS.sage, fontSize: 18, fontWeight: '700' },
  flashMeaning: { color: COLORS.navy, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  exampleText: { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 12 },
  audioPlaceholder: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F7F5F9', borderRadius: 14, padding: 10, marginTop: 17, alignSelf: 'stretch', borderWidth: 1, borderColor: '#EEE7F4' },
  audioControl: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EAF8F1', alignItems: 'center', justifyContent: 'center' },
  audioIcon: { color: COLORS.sage, fontSize: 17 },
  audioText: { flex: 1, color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  ratingRow: { flexDirection: 'row', gap: 7, marginTop: 12 },
  ratingPrompt: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginTop: 12 },
  ratingButton: { flex: 1, borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#FFFFFF' },
  ratingText: { color: COLORS.navy, fontSize: 11, fontWeight: '800' },
  sessionNote: { color: COLORS.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 12 },
  sessionStartCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, padding: 21, borderWidth: 1, borderColor: COLORS.border },
  sessionEmoji: { fontSize: 36, marginBottom: 6 },
  sessionHeading: { color: COLORS.navy, fontSize: 18, fontWeight: '800' },
  schedulingNote: { backgroundColor: '#FFF9F0', color: COLORS.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', padding: 11, borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: '#F6E7CF' },
  noteCard: { backgroundColor: '#F8F2F9', borderRadius: 18, padding: 15, marginTop: 18, borderWidth: 1, borderColor: '#EFE2F8' },
  noteTitle: { color: COLORS.navy, fontSize: 12, fontWeight: '800' },
  noteBody: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  backLink: { paddingVertical: 4, marginBottom: 14, alignSelf: 'flex-start' },
  backLinkText: { color: COLORS.sage, fontSize: 12, fontWeight: '800' },
  storyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, flexDirection: 'row', overflow: 'hidden', marginBottom: 11, minHeight: 112, borderWidth: 1, borderColor: COLORS.border },
  storyArt: { width: 98, backgroundColor: '#F8E5E7', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F2E7E8' },
  storyArtTea: { backgroundColor: '#F4EED8' },
  storyArtDog: { backgroundColor: '#E3F1E6' },
  storyArtEmoji: { fontSize: 40 },
  storyCardCopy: { flex: 1, padding: 13, justifyContent: 'center' },
  storyTitle: { color: COLORS.navy, fontSize: 14, fontWeight: '800' },
  storyPreview: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  storyStatus: { color: COLORS.sage, fontSize: 10, fontWeight: '800', marginTop: 7 },
  storyDetailCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  japaneseStory: { color: COLORS.navy, fontSize: 24, lineHeight: 40, fontWeight: '600' },
  storyHint: { color: COLORS.muted, fontSize: 10, marginTop: 8 },
  wordChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  wordChip: { backgroundColor: '#EAF8F1', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 12, borderWidth: 1, borderColor: '#D7EEE3' },
  wordChipSelected: { borderColor: COLORS.sage },
  wordChipText: { color: COLORS.navy, fontSize: 11, fontWeight: '700' },
  wordMeaning: { backgroundColor: '#F9F5F3', borderRadius: 12, padding: 11, marginTop: 10 },
  wordMeaningJapanese: { color: COLORS.sage, fontSize: 11, fontWeight: '700' },
  wordMeaningText: { color: COLORS.navy, fontSize: 13, fontWeight: '700', marginTop: 3 },
  translationText: { color: COLORS.navy, fontSize: 14, lineHeight: 20, marginTop: 12, textAlign: 'center' },
  audioCopy: { flex: 1 },
  storyWordsCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 15, marginTop: 13, borderWidth: 1, borderColor: COLORS.border },
  vocabularyLine: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F5EFEC', gap: 8 },
  vocabularyJapanese: { color: COLORS.navy, fontSize: 13, fontWeight: '800', minWidth: 78 },
  vocabularyReading: { color: COLORS.sage, fontSize: 10, minWidth: 85 },
  vocabularyMeaning: { color: COLORS.muted, fontSize: 10, flex: 1 },
  gardenHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  petalsPill: { backgroundColor: '#F9E2E9', borderRadius: 16, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#F0C4D1' },
  petalsText: { color: '#8C4C65', fontSize: 13, fontWeight: '800' },
  gardenCanvas: { height: 255, backgroundColor: '#DDEEE7', borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 15, borderWidth: 1, borderColor: '#CFE6D9' },
  gardenSun: { position: 'absolute', top: 15, right: 19, fontSize: 25 },
  gardenCloudLeft: { position: 'absolute', top: 28, left: 18, fontSize: 22 },
  gardenBackPlants: { position: 'absolute', top: 81, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', fontSize: 27 },
  gardenGround: { position: 'absolute', bottom: 0, height: 90, left: 0, right: 0, backgroundColor: '#BFDDB0' },
  gardenSceneItems: { position: 'absolute', top: 87, left: 10, right: 10, height: 116, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  gardenObject: { alignItems: 'center', maxWidth: 95 },
  gardenObjectHouse: { transform: [{ translateY: 2 }] },
  gardenObjectEmoji: { fontSize: 44 },
  gardenObjectName: { color: COLORS.navy, fontSize: 9, fontWeight: '700', backgroundColor: '#FFFFFFC9', paddingHorizontal: 6, borderRadius: 8, marginTop: 3 },
  gardenGrass: { position: 'absolute', bottom: 7, alignSelf: 'center', fontSize: 19 },
  gardenWelcome: { padding: 15, backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 19, borderWidth: 1, borderColor: COLORS.border },
  gardenWelcomeTitle: { color: COLORS.navy, fontSize: 14, fontWeight: '800' },
  shopRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  shopEmoji: { fontSize: 27, width: 43, textAlign: 'center' },
  shopCopy: { flex: 1, marginLeft: 6 },
  shopName: { color: COLORS.navy, fontSize: 12, fontWeight: '800' },
  shopPrice: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  overallCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 17, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.navy, shadowOpacity: 0.07, shadowRadius: 15, elevation: 3 },
  overallHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overallCount: { color: COLORS.navy, fontSize: 30, fontWeight: '800', marginVertical: 2 },
  overallOutOf: { color: COLORS.muted, fontSize: 15 },
  overallFlower: { fontSize: 33 },
  learningRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  learningSymbol: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDE8EE', borderRadius: 14, marginRight: 12 },
  learningSymbolText: { color: COLORS.navy, fontSize: 23, fontWeight: '700' },
  learningCopy: { flex: 1 },
  learningTopLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  learningName: { color: COLORS.navy, fontWeight: '800', fontSize: 12 },
  learningCount: { color: COLORS.muted, fontSize: 10 },
  learningIntroduced: { color: COLORS.muted, fontSize: 9, marginTop: 5 },
  comingSoonNote: { paddingHorizontal: 5, paddingTop: 2, paddingBottom: 16 },
  comingSoonText: { color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  kanjiRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F4EE', borderRadius: 17, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F0E9E1' },
  kanjiCharacter: { color: COLORS.navy, fontSize: 30, fontWeight: '700', width: 48, textAlign: 'center' },
  kanjiCopy: { flex: 1, marginLeft: 8 },
  kanjiMeaning: { color: COLORS.navy, fontSize: 12, fontWeight: '800' },
  kanjiReading: { color: COLORS.sage, fontSize: 10, marginTop: 3 },
  kanjiExample: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  metricCard: { width: '48%', minHeight: 98, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  metricEmoji: { fontSize: 19 },
  metricValue: { color: COLORS.navy, fontSize: 17, fontWeight: '800', marginTop: 4 },
  metricLabel: { color: COLORS.muted, fontSize: 9, lineHeight: 13, marginTop: 2 },
  reviewHistoryCard: { backgroundColor: '#FFFFFF', paddingHorizontal: 13, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  reviewHistoryLine: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#F5EFEC' },
  reviewHistoryCopy: { flex: 1 },
  reviewHistoryWord: { color: COLORS.navy, fontSize: 11, fontWeight: '700' },
  reviewHistoryDate: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  reviewHistoryRating: { color: COLORS.sage, fontSize: 10, fontWeight: '800', textTransform: 'capitalize' },
});
