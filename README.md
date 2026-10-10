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
- Flashcards: curated hiragana, katakana, and A1 vocabulary plus a separate collection for Word Hunt discoveries, with Again / Hard / Good / Easy scheduling. Incorrect cards return to the same session up to three attempts; still-difficult cards remain due shortly afterward.
- Three curated A1 stories with translation reveal, tappable vocabulary, and a clearly labelled audio placeholder.
- A fixed-layout garden and small decoration shop; learning activities and completed stories award petals.
- Progress counts introduced items separately from mastered items. Mastery means at least three successful (non-Again) reviews.

## Structure

- `src/types.ts` contains reusable learning and progress models.
- `src/content/beginner.ts` holds the starter kana, vocabulary, optional kanji, stories, and garden items.
- `src/game/wordHunt.ts` contains the Word Hunt vocabulary, board generation, adjacent-tile word matching, and end-of-round board search.
- `src/review/scheduling.ts` contains due-date and review-scheduling rules.
- `src/storage/useProgress.ts` persists progress locally with AsyncStorage.
- `src/app/` contains the Expo Router root layout and six bottom-tab routes; `App.tsx` contains the reusable screen implementations.

Progress is stored on the device under a versioned key. The current MVP does not sync accounts or provide cloud backup. No audio assets are bundled, so pronunciation and story listening are labelled as unavailable placeholders. The Word Hunt dictionary is assembled from the hand-curated beginner vocabulary and story words.

The project `.npmrc` enables legacy peer resolution because the current Expo SDK 57 package graph contains incompatible optional peer ranges; package versions are still selected and checked with `expo install`.
