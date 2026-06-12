import { NextRequest, NextResponse } from "next/server";
import { getGameById, getPlayersForGame, getAllTeamProgress } from "@/lib/game/queries";

// Never cache — lobby must reflect player joins in real-time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const [game, players, teamProgress] = await Promise.all([
    getGameById(gameId),
    getPlayersForGame(gameId),
    getAllTeamProgress(gameId),
  ]);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(
    { game, players, teamProgress },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
