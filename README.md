# Sakura Garden

A cosy Expo + React Native + TypeScript starter for beginner Japanese learning.

## Run locally

```sh
npm install
npm run start
```

Use the Expo CLI to open the app on iOS or Android. Run `npm run typecheck` and `npm run lint` to validate the project.

## MVP contents

- Home dashboard with live review, learning, streak, and garden data.
- Kana Word Hunt: a timed 5 × 5 hiragana or katakana word-search board. Trace adjacent kana to find beginner words; after 60 seconds, see up to 10 words that were traceable on the board. New finds go into a separate Word Hunt flash-card deck. Its game dictionary also includes extra beginner vocabulary not otherwise used in the app.
- Flashcards: curated hiragana, katakana, and A1 vocabulary plus a separate collection for Word Hunt discoveries. Vocabulary sessions support Japanese → English, English → Japanese, and reading prompts. Japanese-answer prompts include a built-in hiragana/katakana keyboard, physical-keyboard input, Unicode-normalized answer checks, and independent correctness feedback and recall ratings. The configurable scheduler uses 1-minute and 10-minute learning steps before review intervals; it is a simple Anki-inspired scheduler, not FSRS.
- Review records, correctness history, scheduler state, and due timestamps persist locally. New-card sessions are unlimited; choose New to meet unseen cards, Relearn to practise previously introduced cards, or All for a randomly selected batch of up to 10 cards per session.
- Progress includes learning/due counts, typed-answer outcomes, consecutive correct reviews, daily streak, completed-session study time, difficult-card revisits, and recent review history.
- Three curated A1 stories with translation reveal, tappable vocabulary, and a clearly labelled audio placeholder.
- A progressive garden map, Tokyo restoration cycle, and fixed-layout decoration shop. Successful Kana Word Hunt rounds and successful flashcard sessions award petals; progress and purchases are saved locally.
- Progress counts introduced items separately from mastered items. Mastery means at least three successful (non-Again) reviews.

## Structure

- `src/types.ts` contains reusable learning and progress models.
- `src/content/beginner.ts` holds the starter kana, vocabulary, optional kanji, stories, and garden items.
- `src/game/wordHunt.ts` contains the Word Hunt vocabulary, board generation, adjacent-tile word matching, and end-of-round board search.
- `src/review/scheduling.ts` contains due-date and review-scheduling rules.
- `src/review/answerChecking.ts` performs deterministic normalized answer and kana-script checks.
- `src/components/JapaneseKeyboard.tsx` provides the in-screen hiragana/katakana keyboard.
- `src/storage/progressSerialization.ts` handles progress serialization for local persistence.
- `src/storage/useProgress.ts` persists progress locally with AsyncStorage.
- `src/features/garden/` contains garden purchase rules, the map, restoration scene, and shop UI.
- `src/app/` contains the Expo Router root layout and six bottom-tab routes; `App.tsx` contains the reusable screen implementations.

Progress is stored on the device under a versioned key. The current MVP does not sync accounts or provide cloud backup. No audio assets are bundled, so pronunciation and story listening are labelled as unavailable placeholders. The Word Hunt dictionary is assembled from the hand-curated beginner vocabulary and story words.

The project `.npmrc` enables legacy peer resolution because the current Expo SDK 57 package graph contains incompatible optional peer ranges; package versions are still selected and checked with `expo install`.

Validation:

```sh
npm test
npm run typecheck -- --pretty false
npm run lint -- --quiet
```
