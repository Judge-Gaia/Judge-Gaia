import type { ClientToServerEvents, RankingEntry, ServerToClientEvents } from "@judge-gaia/shared";
import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";

type InterServerEvents = Record<string, never>;
type SocketData = Record<string, never>;

export function registerRealtime(app: FastifyInstance, db: Pool) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(app.server, {
    cors: {
      origin: app.config.CORS_ORIGIN
    }
  });

  io.on("connection", (socket) => {
    socket.on("session:start", ({ nickname, mode }) => {
      const safeNickname = nickname.trim().slice(0, 16) || "Unknown_Arbiter";

      // MVP 입장 흐름은 매칭 없이 서버가 즉시 개인 세션 ID를 발급한다.
      socket.emit("session:created", {
        sessionId: randomUUID(),
        nickname: safeNickname,
        mode,
        createdAt: new Date().toISOString()
      });
    });

    socket.on("rankings:subscribe", async () => {
      socket.join("rankings");
      try {
        socket.emit("rankings:update", await loadRankings(db));
      } catch (error) {
        // 로컬 개발에서 PostgreSQL이 꺼져 있으면 빈 랭킹으로 실시간 UI 검증을 계속한다.
        app.log.info({ error }, "Rankings database unavailable; emitting an empty leaderboard");
        socket.emit("rankings:update", []);
      }
    });

    socket.on("match:join", ({ matchId }) => {
      socket.join(`match:${matchId}`);
      socket.emit("match:state", {
        matchId,
        status: "waiting",
        updatedAt: new Date().toISOString()
      });
    });
  });

  return io;
}

async function loadRankings(db: Pool): Promise<RankingEntry[]> {
  const result = await db.query<{
    user_id: string;
    username: string;
    score: number;
    rank: string;
  }>(`
    select
      u.id as user_id,
      u.username,
      r.score,
      rank() over (order by r.score desc) as rank
    from rankings r
    join users u on u.id = r.user_id
    order by r.score desc
    limit 50
  `);

  return result.rows.map((row) => ({
    userId: row.user_id,
    username: row.username,
    score: row.score,
    rank: Number(row.rank)
  }));
}
