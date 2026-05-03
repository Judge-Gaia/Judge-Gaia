import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerConfig } from "./config.js";
import { createDbPool } from "./db.js";
import { registerRealtime } from "./realtime.js";
import { healthRoutes } from "./routes/health.js";
import { rankingRoutes } from "./routes/rankings.js";

const app = Fastify({
  logger: true
});

await registerConfig(app);

await app.register(cors, {
  origin: app.config.CORS_ORIGIN,
  credentials: true
});

const db = createDbPool(app.config.DATABASE_URL);

await app.register(healthRoutes);
await app.register((instance) => rankingRoutes(instance, db));

registerRealtime(app, db);

const shutdown = async () => {
  await app.close();
  await db.end();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({
  host: app.config.HOST,
  port: app.config.PORT
});
