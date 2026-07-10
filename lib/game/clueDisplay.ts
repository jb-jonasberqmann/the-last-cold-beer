// Small helper so every place a clue's description is rendered can resolve
// the ONE clue (the shed's final note) that needs a dynamically-generated
// bit appended — the "anagrammed player names" signature — instead of a
// hardcoded placeholder living in the static content file.

import type { Clue, TeamId } from "@/types/content";
import type { DbPlayer } from "@/types/database";
import { generateShedSignature } from "./anagram";

export function resolveClueDescription(
  clue: Clue,
  players: DbPlayer[],
  teamId?: TeamId
): string {
  if (clue.id !== "artifact-final-note") return clue.description;
  const names = players
    .filter((p) => !p.is_host && (!teamId || p.team_id === teamId))
    .map((p) => p.name);
  const signature = generateShedSignature(names);
  return `${clue.description}\n\n*Signed: ${signature}*`;
}
