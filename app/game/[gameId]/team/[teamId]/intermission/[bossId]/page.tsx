"use client";

// Intermission — a mood-setting story beat between acts, shown after a team
// clears Act 1 (Mads / the front door) or Act 2 (the Radio), before they
// walk into the next act's rooms. Two steps: read the story, then roll a
// die to make the OTHER team drink a few sips before you move on.
//
// Deliberately NOT shown after the Act 3 boss (Yourselves) — that beat leads
// straight into the culprit reveal, which is already its own dedicated
// cinematic page.

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { rollIntermissionAttack, getIntermissionRoll } from "@/lib/game/actions";
import type { TeamId } from "@/types/content";

type Stage = "story" | "roll" | "rolling" | "done";

interface Beat {
  eyebrow: string;
  title: string;
  body: string[];
  nextActLabel: string;
  gradient: string;
  accent: string;
}

const BEATS: Record<string, Beat> = {
  mads: {
    eyebrow: "Act I — Complete",
    title: "The Door Opens",
    body: [
      "The key box clicks. Four digits, and the door swings inward — warm light, the smell of pine and old summers, a house that's clearly been waiting.",
      "Mads is already inside, arms finally empty, grinning like unloading a car was the whole plan tonight. Behind you, the driveway goes quiet.",
      "Whatever this house has been keeping track of, it starts now — inside.",
    ],
    nextActLabel: "Act II — Settling In",
    gradient: "linear-gradient(160deg, #2a1a06 0%, #120b04 100%)",
    accent: "#d4a832",
  },
  "the-radio": {
    eyebrow: "Act II — Complete",
    title: "The House Goes Dark",
    body: [
      "The green light blazes, overloads, and dies in one white flash. For a moment nobody moves.",
      "“The last one to take it… will always be the one to finish it.” The radio said it once, clearly, and then it never spoke again.",
      "The story it just told isn't over. It's about to start happening to you.",
    ],
    nextActLabel: "Act III — The Late Night",
    gradient: "linear-gradient(160deg, #0c0c14 0%, #050507 100%)",
    accent: "#8ab4f8",
  },
};

function IntermissionContent() {
  const params = useParams<{ gameId: string; teamId: TeamId; bossId: string }>();
  const router = useRouter();
  const { session } = usePlayer();
  const gameId = params.gameId;
  const teamId = (params.teamId ?? session?.teamId ?? "team-a") as TeamId;
  const bossId = params.bossId;

  const beat = BEATS[bossId];
  const [stage, setStage] = useState<Stage>("story");
  const [roll, setRoll] = useState<number | null>(null);
  const [displayRoll, setDisplayRoll] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // If this team already rolled for this transition (refresh / back button),
  // pick the result back up instead of letting them roll again.
  const checkExisting = useCallback(async () => {
    if (!gameId || !teamId || !bossId) return;
    const res = await getIntermissionRoll(gameId, teamId, bossId);
    if (res.success && res.data) {
      setRoll(res.data.roll);
      setStage("done");
    }
  }, [gameId, teamId, bossId]);

  useEffect(() => { checkExisting(); }, [checkExisting]);

  if (!beat) {
    // Unknown bossId — just bounce back to the map rather than dead-end.
    if (typeof window !== "undefined") router.replace(`/game/${gameId}/team/${teamId}`);
    return null;
  }

  const handleRoll = async () => {
    setStage("rolling");
    setError(null);
    // Quick shuffle animation before the real result lands.
    let ticks = 0;
    const spin = setInterval(() => {
      setDisplayRoll(1 + Math.floor(Math.random() * 6));
      ticks++;
      if (ticks > 10) clearInterval(spin);
    }, 80);

    const result = await rollIntermissionAttack(gameId, teamId, bossId);
    clearInterval(spin);
    if (result.success) {
      setDisplayRoll(result.data.roll);
      setRoll(result.data.roll);
      setTimeout(() => setStage("done"), 400);
    } else {
      setError(result.error ?? "Something went wrong.");
      setStage("roll");
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center overflow-y-auto"
      style={{ background: beat.gradient, fontFamily: "Georgia, serif" }}
    >
      <div className="max-w-md w-full">
        <div
          className="text-[10px] uppercase tracking-[0.3em] mb-3"
          style={{ color: beat.accent, opacity: 0.65 }}
        >
          {beat.eyebrow}
        </div>

        {stage === "story" && (
          <div className="animate-quest-fade">
            <h1
              className="text-3xl font-black mb-6"
              style={{ color: "rgba(245,235,205,0.97)", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
            >
              {beat.title}
            </h1>
            <div className="space-y-4 mb-10 text-left">
              {beat.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: "rgba(210,195,165,0.85)" }}>
                  {p}
                </p>
              ))}
            </div>
            <button
              onClick={() => setStage("roll")}
              className="w-full py-4 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: "rgba(180,130,50,0.18)", border: `1px solid ${beat.accent}66`, color: beat.accent }}
            >
              Continue →
            </button>
          </div>
        )}

        {(stage === "roll" || stage === "rolling") && (
          <div className="animate-quest-fade">
            <h2 className="text-xl font-bold mb-3" style={{ color: "rgba(245,235,205,0.95)" }}>
              One Toast Before You Go
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(210,195,165,0.8)" }}>
              Roll the die. Whatever it lands on, the other team drinks that many sips before either of you moves another step.
            </p>
            <div
              className="w-24 h-24 mx-auto mb-8 rounded-2xl flex items-center justify-center text-5xl font-black"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: `2px solid ${beat.accent}55`,
                color: beat.accent,
                boxShadow: stage === "rolling" ? `0 0 30px ${beat.accent}55` : "none",
              }}
            >
              {displayRoll}
            </div>
            {error && <p className="text-xs mb-4" style={{ color: "rgb(252,165,165)" }}>{error}</p>}
            <button
              onClick={handleRoll}
              disabled={stage === "rolling"}
              className="w-full py-4 rounded-xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: "rgba(180,130,50,0.18)", border: `1px solid ${beat.accent}66`, color: beat.accent }}
            >
              {stage === "rolling" ? "Rolling…" : "🎲 Roll the die"}
            </button>
          </div>
        )}

        {stage === "done" && (
          <div className="animate-quest-fade">
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-5xl font-black"
              style={{ background: "rgba(0,0,0,0.35)", border: `2px solid ${beat.accent}55`, color: beat.accent }}
            >
              {roll}
            </div>
            <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(210,195,165,0.85)" }}>
              🍺 The other team drinks {roll} sip{roll !== 1 ? "s" : ""}. Cheers — now it's your turn to keep going.
            </p>
            <button
              onClick={() => router.push(`/game/${gameId}/team/${teamId}`)}
              className="w-full py-4 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              style={{ background: `linear-gradient(135deg, ${beat.accent}, ${beat.accent}aa)`, color: "#1a1206" }}
            >
              Begin {beat.nextActLabel} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntermissionPage() {
  return (
    <Suspense fallback={null}>
      <IntermissionContent />
    </Suspense>
  );
}
