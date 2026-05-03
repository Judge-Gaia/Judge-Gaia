import type { RankingEntry } from "@judge-gaia/shared";
import type { FastifyInstance } from "fastify";
import type { Pool, QueryResult } from "pg";

type RankingRow = {
  user_id: string;
  username: string;
  score: number;
  rank: string;
};

export async function rankingRoutes(app: FastifyInstance, db: Pool) {
  app.get("/rankings", async (): Promise<RankingEntry[]> => {
    let result: QueryResult<RankingRow>;

    try {
      result = await db.query<RankingRow>(`
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
    } catch (error) {
      // 로컬 MVP 확인 중 PostgreSQL이 꺼져 있어도 프론트와 실시간 입장 흐름은 계속 검증한다.
      app.log.info({ error }, "Rankings database unavailable; returning an empty leaderboard");
      return [];
    }

    return result.rows.map((row) => ({
      userId: row.user_id,
      username: row.username,
      score: row.score,
      rank: Number(row.rank)
    }));
  });
}
