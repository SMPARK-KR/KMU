import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL?.startsWith("libsql://") 
    ? process.env.TURSO_DATABASE_URL 
    : "libsql://dummy-db-please-configure-env.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN || "dummy",
});

export const db = drizzle(tursoClient, { schema });
