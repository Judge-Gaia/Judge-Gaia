import type { HealthResponse } from "@judge-gaia/shared";
import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (): Promise<HealthResponse> => ({
    ok: true,
    service: "judge-gaia-server",
    timestamp: new Date().toISOString()
  }));
}
