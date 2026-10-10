import type { KanaScript } from '../types';

export type AnswerKind = 'meaning' | 'japanese' | 'reading';

function normalizeAnswer(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .replace(/[。、！？!?.,;:：；]+$/u, '')
    .trim()
    .toLowerCase();
}

export function checkAnswer(
  answer: string,
  expected: string | string[],
  options: { kind: AnswerKind; script?: KanaScript; allowRomaji?: boolean },
): boolean {
  if (options.allowRomaji) {
    throw new Error('Romaji answers are not enabled for this exercise.');
  }

  const normalizedAnswer = normalizeAnswer(answer);
  if (!normalizedAnswer) return false;

  const acceptedAnswers = Array.isArray(expected) ? expected : [expected];
  return acceptedAnswers.some((candidate) => {
    const normalizedExpected = normalizeAnswer(candidate);
    if (normalizedAnswer !== normalizedExpected) return false;

    if (options.kind === 'meaning' || !options.script) return true;
    return options.script === 'hiragana'
      ? !/[\u30A1-\u30FA\u30FF]/u.test(normalizedAnswer)
      : !/[\u3041-\u3096\u309D-\u309F]/u.test(normalizedAnswer);
  });
}
