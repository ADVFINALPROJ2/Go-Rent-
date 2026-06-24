import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import * as schema from "@/db/schema";

const databasePath = process.env.SQLITE_DB_PATH ?? "./data/gorent.sqlite";
const resolvedDatabasePath = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  databasePath,
);

fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });

const sqlite = new Database(resolvedDatabasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };
