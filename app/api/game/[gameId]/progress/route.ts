import { NextRequest, NextResponse } from "next/server";
import {
  getGameById,
  getAllTeamProgress,
  getRoomProgressForTeam,
  getQuestProgressForTeam,
  getTeamClues,
  getAllBossProgress,
  getRecentGameEvents,
} from "@/lib/game/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const teamId = req.nextUrl.searchParams.get("teamId") as "team-a" | "team-b" | null;

  const game = await getGameById(gameId);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [teamProgress, bossProgress, events] = await Promise.all([
    getAllTeamProgress(gameId),
    getAllBossProgress(gameId),
    getRecentGameEvents(gameId, 20),
  ]);

  if (teamId) {
    const [roomProgress, questProgress, clues] = await Promise.all([
      getRoomProgressForTeam(gameId, teamId),
      getQuestProgressForTeam(gameId, teamId),
      getTeamClues(gameId, teamId),
    ]);
    return NextResponse.json({ game, teamProgress, roomProgress, questProgress, clues, bossProgress, events });
  }

  return NextResponse.json({ game, teamProgress, bossProgress, events });
}
