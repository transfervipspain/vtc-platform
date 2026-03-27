import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error("DATABASE_URL no está definida en las variables de entorno");
  }

  const hasQuery = rawUrl.includes("?");
  const hasSslMode = /(?:\?|&)sslmode=/.test(rawUrl);
  const hasLibpqCompat = /(?:\?|&)uselibpqcompat=/.test(rawUrl);

  let finalUrl = rawUrl;

  if (!hasSslMode) {
    finalUrl += `${hasQuery ? "&" : "?"}sslmode=verify-full`;
  }

  if (!hasLibpqCompat) {
    finalUrl += `${finalUrl.includes("?") ? "&" : "?"}uselibpqcompat=true`;
  }

  return finalUrl;
}

const adapter = new PrismaPg({
  connectionString: buildDatabaseUrl(),
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}