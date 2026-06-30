import { NextRequest, NextResponse } from "next/server";
import {
  getGameById,
  getAllTeamProgress,
  getRoomProgressForTeam,
  getQuestProgressForTeam,
  getTeamClues,
  getAllBossProgress,
  getRecentGameEvents,
  getUsedBossActionIds,
  getPlayersForGame,
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
    const [roomProgress, questProgress, clues, usedBossActionIds, players] = await Promise.all([
      getRoomProgressForTeam(gameId, teamId),
      getQuestProgressForTeam(gameId, teamId),
      getTeamClues(gameId, teamId),
      getUsedBossActionIds(gameId, teamId),
      getPlayersForGame(gameId),
    ]);
    return NextResponse.json({ game, teamProgress, roomProgress, questProgress, clues, bossProgress, events, usedBossActionIds, players });
  }

  return NextResponse.json({ game, teamProgress, bossProgress, events });
}
