import { Pool } from "pg";

export function createDbPool(databaseUrl: string) {
  return new Pool({
    connectionString: databaseUrl,
    max: 10
  });
}
