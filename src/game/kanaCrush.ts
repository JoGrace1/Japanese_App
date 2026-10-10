import type { GameLevel, GameTile } from '../types';

export type Board = GameTile[][];
export interface Position { row: number; column: number }
export interface MoveResult { board: Board; cleared: number; score: number }

const ROWS = 6;
const COLUMNS = 6;
const LEVEL_CHARACTERS = ['あ', 'い', 'う', 'え', 'お', 'か'];
export const KANA_CRUSH_MOVES = 15;
export const KANA_CRUSH_TARGET = 250;

export function charactersForLevel(level: number): string[] {
  return LEVEL_CHARACTERS.concat(['き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と'])
    .slice(0, Math.min(6 + Math.max(0, level - 1) * 2, 20));
}

export function createGameLevel(level: number): GameLevel {
  return {
    level,
    characters: charactersForLevel(level),
    scoreTarget: KANA_CRUSH_TARGET,
    moveLimit: KANA_CRUSH_MOVES,
  };
}

export function createBoard(random: () => number = Math.random, characters: string[] = LEVEL_CHARACTERS): Board {
  const board: Board = [];
  for (let row = 0; row < ROWS; row += 1) {
    board.push([]);
    for (let column = 0; column < COLUMNS; column += 1) {
      const candidates = characters.filter((character) => {
        const makesHorizontalMatch = column >= 2
          && board[row][column - 1].character === character
          && board[row][column - 2].character === character;
        const makesVerticalMatch = row >= 2
          && board[row - 1][column].character === character
          && board[row - 2][column].character === character;
        return !makesHorizontalMatch && !makesVerticalMatch;
      });
      const choices = candidates.length ? candidates : characters;
      board[row].push({ character: choices[Math.floor(random() * choices.length)] });
    }
  }
  return board;
}

export function findMatches(board: Board): Set<string> {
  const matches = new Set<string>();
  const addRun = (cells: Position[]) => {
    if (cells.length >= 3) cells.forEach(({ row, column }) => matches.add(`${row}:${column}`));
  };

  for (let row = 0; row < board.length; row += 1) {
    let run: Position[] = [];
    for (let column = 0; column <= board[row].length; column += 1) {
      if (column < board[row].length && board[row][column].character === board[row][run[0]?.column ?? column].character) {
        run.push({ row, column });
      } else {
        addRun(run);
        run = column < board[row].length ? [{ row, column }] : [];
      }
    }
  }

  for (let column = 0; column < (board[0]?.length ?? 0); column += 1) {
    let run: Position[] = [];
    for (let row = 0; row <= board.length; row += 1) {
      if (row < board.length && board[row][column].character === board[run[0]?.row ?? row][column].character) {
        run.push({ row, column });
      } else {
        addRun(run);
        run = row < board.length ? [{ row, column }] : [];
      }
    }
  }
  return matches;
}

function collapseAndRefill(board: Board, matches: Set<string>, random: () => number, characters: string[]): Board {
  const next = board.map((row) => [...row]);
  for (let column = 0; column < COLUMNS; column += 1) {
    const remaining: GameTile[] = [];
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (!matches.has(`${row}:${column}`)) remaining.push(board[row][column]);
    }
    while (remaining.length < ROWS) {
      remaining.push({ character: characters[Math.floor(random() * characters.length)] });
    }
    for (let row = 0; row < ROWS; row += 1) {
      next[row][column] = remaining[ROWS - 1 - row];
    }
  }
  return next;
}

export function playMove(
  board: Board,
  first: Position,
  second: Position,
  random: () => number = Math.random,
  characters: string[] = LEVEL_CHARACTERS,
): MoveResult {
  const adjacent = Math.abs(first.row - second.row) + Math.abs(first.column - second.column) === 1;
  if (!adjacent || !board[first.row]?.[first.column] || !board[second.row]?.[second.column]) {
    return { board, cleared: 0, score: 0 };
  }

  const swapped = board.map((row) => [...row]);
  [swapped[first.row][first.column], swapped[second.row][second.column]] =
    [swapped[second.row][second.column], swapped[first.row][first.column]];
  let matches = findMatches(swapped);
  if (!matches.size) return { board, cleared: 0, score: 0 };

  let cleared = 0;
  let next = swapped;
  let cascades = 0;
  while (matches.size && cascades < 10) {
    cleared += matches.size;
    next = collapseAndRefill(next, matches, random, characters);
    matches = findMatches(next);
    cascades += 1;
  }
  return { board: next, cleared, score: cleared * 10 };
}
