/**
 * Localization helpers — merge Danish (`da`) overrides onto English base content.
 * Only call these in React components (they use the lang value from useLanguage).
 */

import type { Quest, Room, Clue, Boss } from "@/types/content";

// ── Quest ─────────────────────────────────────────────────────────────────

export function localizeQuest(quest: Quest, lang: string): Quest {
  if (lang !== "da" || !quest.da) return quest;
  const da = quest.da;

  return {
    ...quest,
    title: da.title ?? quest.title,
    description: da.description ?? quest.description,
    prompt: da.prompt ?? quest.prompt,
    rewardText: da.rewardText ?? quest.rewardText,
    failureText: da.failureText ?? quest.failureText,
    hints: quest.hints.map((h, i) => ({
      ...h,
      text: da.hints?.[i] ?? h.text,
    })),
    choices: quest.choices?.map((c) => {
      const override = da.choices?.[c.id];
      if (!override) return c;
      return {
        ...c,
        label: override.label ?? c.label,
        description: override.description ?? c.description,
        consequence: override.consequence ?? c.consequence,
      };
    }),
  };
}

export function localizeQuests(quests: Quest[], lang: string): Quest[] {
  return quests.map((q) => localizeQuest(q, lang));
}

// ── Room ──────────────────────────────────────────────────────────────────

export function localizeRoom(room: Room, lang: string): Room {
  if (lang !== "da" || !room.da) return room;
  const da = room.da;

  return {
    ...room,
    title: da.title ?? room.title,
    description: da.description ?? room.description,
    lockedDescription: da.lockedDescription ?? room.lockedDescription,
    look: {
      ...room.look,
      atmosphere: da.atmosphere ?? room.look.atmosphere,
    },
  };
}

// ── Clue ──────────────────────────────────────────────────────────────────

export function localizeClue(clue: Clue, lang: string): Clue {
  if (lang !== "da" || !clue.da) return clue;
  const da = clue.da;

  return {
    ...clue,
    title: da.title ?? clue.title,
    description: da.description ?? clue.description,
    flavor: da.flavor ?? clue.flavor,
  };
}

// ── Boss ──────────────────────────────────────────────────────────────────

export function localizeBoss(boss: Boss, lang: string): Boss {
  if (lang !== "da" || !boss.da) return boss;
  const da = boss.da;

  return {
    ...boss,
    title: da.title ?? boss.title,
    subtitle: da.subtitle ?? boss.subtitle,
    description: da.description ?? boss.description,
    defeatText: da.defeatText ?? boss.defeatText,
    victoryAdvantage: da.victoryAdvantage ?? boss.victoryAdvantage,
    look: {
      ...boss.look,
      atmosphere: da.atmosphere ?? boss.look.atmosphere,
    },
    phases: boss.phases.map((phase) => {
      const daPhase = da.phases?.find((p) => p.phase === phase.phase);
      if (!daPhase) return phase;

      return {
        ...phase,
        title: daPhase.title ?? phase.title,
        description: daPhase.description ?? phase.description,
        actions: phase.actions.map((action) => {
          const daAction = daPhase.actions?.find((a) => a.id === action.id);
          if (!daAction) return action;

          return {
            ...action,
            label: daAction.label ?? action.label,
            description: daAction.description ?? action.description,
            hint: daAction.hint ?? action.hint,
            rewardText: daAction.rewardText ?? action.rewardText,
            failureText: daAction.failureText ?? action.failureText,
            puzzle: action.puzzle && daAction.puzzlePrompt
              ? { ...action.puzzle, prompt: daAction.puzzlePrompt }
              : action.puzzle,
          };
        }),
      };
    }),
  };
}
