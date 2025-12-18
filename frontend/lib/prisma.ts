import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

// For SQLite, extract the file path
const sqlitePath = databaseUrl.replace("file:", "");

// Create SQLite database instance
const sqlite = new Database(sqlitePath);

// Create adapter
const adapter = new PrismaBetterSqlite3(sqlite);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

