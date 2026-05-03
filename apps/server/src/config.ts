import fastifyEnv from "@fastify/env";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      PORT: number;
      HOST: string;
      CORS_ORIGIN: string;
      DATABASE_URL: string;
    };
  }
}

const schema = {
  type: "object",
  required: ["DATABASE_URL"],
  properties: {
    PORT: { type: "number", default: 4000 },
    HOST: { type: "string", default: "0.0.0.0" },
    CORS_ORIGIN: { type: "string", default: "http://localhost:5173" },
    DATABASE_URL: {
      type: "string",
      default: "postgres://postgres:postgres@localhost:5432/judge_gaia"
    }
  }
} as const;

export async function registerConfig(app: FastifyInstance) {
  await app.register(fastifyEnv, {
    schema,
    dotenv: true
  });
}
