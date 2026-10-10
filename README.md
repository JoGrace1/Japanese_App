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
- Kana Crush: a 6 × 6 hiragana match-three puzzle, scored by cleared tiles. Each level adds more kana; reaching 250 points wins, and completed levels award petals.
- Flashcards: curated hiragana, katakana, and A1 vocabulary with Again / Hard / Good / Easy scheduling. Incorrect cards return to the same session up to three attempts; still-difficult cards remain due shortly afterward.
- Three curated A1 stories with translation reveal, tappable vocabulary, and a clearly labelled audio placeholder.
- A fixed-layout garden and small decoration shop; learning activities and completed stories award petals.
- Progress counts introduced items separately from mastered items. Mastery means at least three successful (non-Again) reviews.

## Structure

- `src/types.ts` contains reusable learning and progress models.
- `src/content/beginner.ts` holds the starter kana, vocabulary, optional kanji, stories, and garden items.
- `src/game/kanaCrush.ts` contains the UI-independent board and match logic.
- `src/review/scheduling.ts` contains due-date and review-scheduling rules.
- `src/storage/useProgress.ts` persists progress locally with AsyncStorage.
- `src/app/` contains the Expo Router root layout and six bottom-tab routes; `App.tsx` contains the reusable screen implementations.

Progress is stored on the device under a versioned key. The current MVP does not sync accounts or provide cloud backup. No audio assets are bundled, so pronunciation and story listening are labelled as unavailable placeholders. Kana Crush uses identical-character matches only; it does not yet include special tiles, animations, blockers, or move reshuffling. Story and vocabulary content is static and hand-curated.

The project `.npmrc` enables legacy peer resolution because the current Expo SDK 57 package graph contains incompatible optional peer ranges; package versions are still selected and checked with `expo install`.
