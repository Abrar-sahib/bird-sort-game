/** Max birds per branch. */
export const CAPACITY = 4;

export const BIRD_COLORS = [
  '#ff6b6b', // coral
  '#ffd93d', // sun
  '#6bcb77', // leaf
  '#4d96ff', // sky
  '#c77dff', // lilac
  '#ff9f45', // tangerine
  '#f15bb5', // pink
  '#00c2c7', // teal
];

export type Bird = { id: number; color: number };
/** Index 0 = nearest the trunk, last = outer tip (the "top" you can move). */
export type Branch = Bird[];

const EMPTY_BRANCHES = 2;

export function colorsForLevel(level: number) {
  return Math.min(3 + Math.floor((level - 1) / 2), BIRD_COLORS.length);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeLevel(level: number): Branch[] {
  const colors = colorsForLevel(level);
  let id = 0;
  const birds: Bird[] = [];
  for (let c = 0; c < colors; c++) {
    for (let i = 0; i < CAPACITY; i++) birds.push({ id: id++, color: c });
  }

  // Reshuffle until no branch starts already solved.
  let branches: Branch[];
  do {
    const s = shuffle(birds);
    branches = Array.from({ length: colors }, (_, i) => s.slice(i * CAPACITY, (i + 1) * CAPACITY));
  } while (branches.some(isComplete));

  for (let i = 0; i < EMPTY_BRANCHES; i++) branches.push([]);
  return branches;
}

/** Number of same-colored birds at the tip of a branch. */
export function topGroupSize(branch: Branch) {
  if (branch.length === 0) return 0;
  const color = branch[branch.length - 1].color;
  let n = 0;
  for (let i = branch.length - 1; i >= 0 && branch[i].color === color; i--) n++;
  return n;
}

export function isComplete(branch: Branch) {
  return branch.length === CAPACITY && branch.every((b) => b.color === branch[0].color);
}

export function canMove(from: Branch, to: Branch) {
  if (from.length === 0 || to.length >= CAPACITY || isComplete(from)) return false;
  if (to.length === 0) return true;
  return to[to.length - 1].color === from[from.length - 1].color;
}

/** Moves as many top birds as fit. Returns a new array (immutable). */
export function applyMove(branches: Branch[], from: number, to: number): Branch[] {
  const count = Math.min(topGroupSize(branches[from]), CAPACITY - branches[to].length);
  const moving = branches[from].slice(-count);
  return branches.map((b, i) => {
    if (i === from) return b.slice(0, b.length - count);
    if (i === to) return [...b, ...moving];
    return b;
  });
}

export function isWon(branches: Branch[]) {
  return branches.every((b) => b.length === 0);
}
