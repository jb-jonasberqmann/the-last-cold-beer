// Generates the "almost your names" signature on the shed's final note
// (artifact-final-note) — deterministically, from the actual team's player
// names, instead of a hardcoded placeholder. Deterministic per-name seed so
// the same team always sees the same scramble across reloads/devices.

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let seed = 0;
  for (let i = 0; i < s.length; i++) {
    seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
  }
  return seed || 1;
}

function scrambleName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length < 2) return trimmed;
  const letters = trimmed.replace(/\s+/g, "").split("");
  const rand = mulberry32(seedFromString(trimmed.toLowerCase()));
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const scrambled = letters.join("");
  return scrambled.charAt(0).toUpperCase() + scrambled.slice(1).toLowerCase();
}

/**
 * Turns real player names into "anagrammed" signatures for the shed note —
 * scrambled letter-for-letter, close enough to feel eerily familiar but
 * never actually spelling anyone's real name.
 */
export function generateShedSignature(playerNames: string[]): string {
  const names = playerNames.filter((n) => n && n.trim().length > 0);
  if (names.length === 0) return "…";
  return names.map(scrambleName).join(", ");
}
